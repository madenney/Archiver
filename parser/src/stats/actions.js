// @flow
import _ from 'lodash';
import SlippiGame from "../index";
import {
  States, iterateFramesInOrder
} from "./common";

import type { ActionCountsType } from "./common";

function isRolling(animation) {
  const rollAnimations = {
    [States.ROLL_BACKWARD]: true,
    [States.ROLL_FORWARD]: true,
  };

  return rollAnimations[animation];
}

function didStartRoll(currentAnimation, previousAnimation) {
  const isCurrentlyRolling = isRolling(currentAnimation);
  const wasPreviouslyRolling = isRolling(previousAnimation);

  return isCurrentlyRolling && !wasPreviouslyRolling;
}

function isSpotDodging(animation) {
  return animation === States.SPOT_DODGE;
}

function didStartSpotDodge(currentAnimation, previousAnimation) {
  const isCurrentlyDodging = isSpotDodging(currentAnimation);
  const wasPreviouslyDodging = isSpotDodging(previousAnimation);

  return isCurrentlyDodging && !wasPreviouslyDodging;
}

function isAirDodging(animation) {
  return animation === States.AIR_DODGE;
}

function didStartAirDodge(currentAnimation, previousAnimation) {
  const isCurrentlyDodging = isAirDodging(currentAnimation);
  const wasPreviouslyDodging = isAirDodging(previousAnimation);

  return isCurrentlyDodging && !wasPreviouslyDodging;
}

export function generateActionCounts(game: SlippiGame): ActionCountsType[] {
  const actionCounts = [];

  // Frame pattern that indicates a dash dance turn was executed
  const dashDanceAnimations = [States.DASH, States.TURN, States.DASH];

  const initialState: {
    animations: number[],
    playerCounts: ?ActionCountsType
  } = {
    animations: [],
    playerCounts: null
  };

  let state = initialState;

  // Helper function for incrementing counts
  const incrementCount = (field, condition) => {
    if (!condition) {
      return;
    }

    state.playerCounts[field] += 1;
  };

  // Iterates the frames in order in order to compute stocks
  iterateFramesInOrder(game, (indices) => {
    const playerCounts = {
      playerIndex: indices.playerIndex,
      opponentIndex: indices.opponentIndex,
      wavedashCount: 0,
      wavelandCount: 0,
      airDodgeCount: 0,
      dashDanceCount: 0,
      spotDodgeCount: 0,
      rollCount: 0,
    };

    state = {
      ...initialState,
      playerCounts: playerCounts
    };

    actionCounts.push(playerCounts);
  }, (indices, frame) => {
    const playerFrame = frame.players[indices.playerIndex].post;

    // Manage animation state
    state.animations.push(playerFrame.actionStateId);

    // Grab last 3 frames
    const last3Frames = state.animations.slice(-3);
    const currentAnimation = playerFrame.actionStateId;
    const prevAnimation = last3Frames[last3Frames.length - 2];

    // Increment counts based on conditions
    const didDashDance = _.isEqual(last3Frames, dashDanceAnimations);
    incrementCount('dashDanceCount', didDashDance);

    const didRoll = didStartRoll(currentAnimation, prevAnimation);
    incrementCount('rollCount', didRoll);

    const didSpotDodge = didStartSpotDodge(currentAnimation, prevAnimation);
    incrementCount('spotDodgeCount', didSpotDodge);

    const didAirDodge = didStartAirDodge(currentAnimation, prevAnimation);
    incrementCount('airDodgeCount', didAirDodge);

    // Handles wavedash detection (and waveland)
    handleActionWavedash(state.playerCounts, state.animations, frame.frame);
  });

  return actionCounts;
}

function handleActionWavedash(counts: ActionCountsType, animations) {
  const currentAnimation = _.last(animations);
  const prevAnimation = animations[animations.length - 2];

  const isSpecialLanding = currentAnimation === States.LANDING_FALL_SPECIAL;
  const isAcceptablePrevious = isWavedashInitiationAnimation(prevAnimation);
  const isPossibleWavedash = isSpecialLanding && isAcceptablePrevious;

  if (!isPossibleWavedash) {
    return;
  }

  // Here we special landed, it might be a wavedash, let's check
  // We grab the last 8 frames here because that should be enough time to execute a
  // wavedash. This number could be tweaked if we find false negatives
  const recentFrames = animations.slice(-8);
  const recentAnimations = _.keyBy(recentFrames, (animation) => animation);

  if (_.size(recentAnimations) === 2 && recentAnimations[States.AIR_DODGE]) {
    // If the only other animation is air dodge, this might be really late to the point
    // where it was actually an air dodge. Air dodge animation is really long
    return;
  }

  if (recentAnimations[States.AIR_DODGE]) {
    // If one of the recent animations was an air dodge, let's remove that from the
    // air dodge counter, we don't want to count air dodges used to wavedash/land
    counts.airDodgeCount -= 1;
  }

  if (recentAnimations[States.ACTION_KNEE_BEND]) {
    // If a jump was started recently, we will consider this a wavedash
    counts.wavedashCount += 1;
  } else {
    // If there was no jump recently, this is a waveland
    counts.wavelandCount += 1;
  }
}

function isWavedashInitiationAnimation(animation) {
  if (animation === States.AIR_DODGE) {
    return true;
  }

  const isAboveMin = animation >= States.CONTROLLED_JUMP_START;
  const isBelowMax = animation <= States.CONTROLLED_JUMP_END;
  return isAboveMin && isBelowMax;
}
