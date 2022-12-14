
const { SlippiGame, ConnectionEvent } = require("@slippi/slippi-js");
import { keyBy, size } from "lodash";

export default (prev, params, eventEmitter) => {
    const results = []
    const { maxFiles } = params
    console.log("MAX FILES: ", maxFiles )
    console.log(prev.results.length)
    prev.results.slice(0,maxFiles==""?undefined:parseInt(maxFiles)).forEach( ( combo, index )  => {
        if( index % 1 == 0 ) eventEmitter({msg: `${index}/${maxFiles ? maxFiles : prev.results.length}`})

        const { n, x, y } = params
        const { moves, comboer, comboee, path, stage } = combo
        let frames
        switch ( n ){
            case "1": // thunder's combo
                const potentialThunders = moves.find((move, index) => {
                    if( move.moveId != 21 ) return false
                    //if( moves[index+1] && moves[index+1].moveId == 16 ) return true
                    return true
                })
                if(!potentialThunders) return false
                const game = new SlippiGame( path )
                let frames3
                try {
                    frames3 = game.getFrames()
                } catch(e){
                    console.log(e)
                    return console.log("Broken file:", file)
                }

                const missedTechDamage = [185,193]
                const uair = [0x44]
                const jabState = [0x2c]
                const neutralGetup = [186,194]
                const startFrame = combo.startFrame;
                const endFrame = combo.endFrame
                let foundThunder = false
                let jabResetFrame = ""
                for(var i = startFrame; i < endFrame; i++){
                    const currentFrame = frames3[i]
                    if(!currentFrame) break
                    const _comboee = currentFrame.players.find(p => p && p.post.playerIndex == comboee.playerIndex)
                    const _comboer = currentFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)

                    if(missedTechDamage.indexOf(_comboee.post.actionStateId) == -1 ) continue

                    const prevFrame = frames3[i-2]
                    if(!prevFrame) break
                    if(jabState.indexOf(_comboer.post.actionStateId) == -1 )continue
                    jabResetFrame = currentFrame.frame
                    break
                }

                if(!jabResetFrame) return false
                console.log("JAB RESET FRAME FOUND: ")
                let foundUair = false
                let foundNeutralGetup = false
                for(var i = jabResetFrame - 10; i < 90; i++){
                    const currentFrame = frames3[i]
                    if(!currentFrame) break
                    const _comboee = currentFrame.players.find(p => p && p.post.playerIndex == comboee.playerIndex)
                    const _comboer = currentFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)
                    if(neutralGetup.indexOf(_comboee.post.actionStateId) > -1 ) foundNeutralGetup = true
                    if(uair.indexOf(_comboer.post.actionStateId) > -1 ) foundUair = true
                }

                if( foundUair && foundNeutralGetup ){
                    results.push({
                        comboer,
                        comboee,
                        path,
                        stage,
                        ...combo
                    })
                }
                break
            case "2": // single hit uair
                if(moves[moves.length-1].hitCount > 1 ) return false
                // const game = new SlippiGame( path )
                // let frames
                // try {
                //     frames = game.getFrames()
                // } catch(e){
                //     console.log(e)
                //     return console.log("Broken file:", file)
                // }
                let found = true
                if( found ){
                    results.push({
                        comboer,
                        comboee,
                        path,
                        stage,
                        ...combo
                    })
                }
                break
            case "3": // shine utilt
                moves.forEach( (move, index) => {
                    if( move.moveId == 8 && moves[index-1] && moves[index-1].moveId == 21 ){
                        if( move.frame - moves[index-1].frame < x ){
                            results.push({
                                ...combo,
                                startFrame: moves[index-1].frame,
                                endFrame: move.frame + 30,
                                comboer,
                                comboee,
                                path,
                                stage
                            })
                        }
                    }
                })
                break
            case "4": // uair shine
                const uairId = 16
                moves.forEach( (move, index) => {
                    if( move.moveId == uairId && moves[index+1] && moves[index+1].moveId == 21 ){
                        if( move.damage < x ){
                            results.push({...combo })
                        }
                    }
                })
                break
            case "5": // lazer reset
                const missedTechDamage1 = [185,193]
                // const uair = [0x44]
                // const jabState = [0x2c]
                const neutralGetup1 = [186,194]
                let frames1
                try {
                    frames1 = new SlippiGame( path ).getFrames()
                } catch(e){
                    console.log(e)
                    return console.log("Broken file:", file)
                }
                let frame = moves[moves.length-1].frame
                let foundNeutralGetup1 = false
                let foundMissedTechDamage = false
                for(var i = frame; i > frame - 45; i-- ){
                    const currentFrame = frames1[i]
                    if(!currentFrame) break

                    const _comboee = currentFrame.players.find(p => p && p.post.playerIndex == comboee.playerIndex)
                    if(neutralGetup1.indexOf(_comboee.post.actionStateId) > -1 ) foundNeutralGetup1 = true
                }
                if(!foundNeutralGetup1) return false
                for(var i = frame; i > frame - 60; i-- ){
                    const currentFrame = frames1[i]
                    if(!currentFrame) break

                    const _comboee = currentFrame.players.find(p => p && p.post.playerIndex == comboee.playerIndex)
                    if(missedTechDamage1.indexOf(_comboee.post.actionStateId) > -1 ) foundMissedTechDamage = true
                }
                if(foundMissedTechDamage){
                    results.push({...combo }) 
                }
                break          
            case "6": // double pummel
                const pummelId = 52
                let last = ""
                let bad = false
                moves.forEach( (move, index) => {
                    if(move.moveId == pummelId && last == pummelId){
                        bad = true
                        return false
                    }
                    last = move.moveId
                })
                if(bad)return false
                results.push({...combo })
                break
            case "7": // shine turnaround bair
                let frames2
                try {
                    frames2 = new SlippiGame( path ).getFrames()
                } catch(e){
                    console.log(e)
                    return console.log("Broken file:", file)
                }
                let bairFrame = frames2[moves[moves.length-1].frame + 20]
                let preShineFrame = frames2[moves[moves.length-2].frame - 5]
                if(!bairFrame) return
                if(!preShineFrame) return
                const bairFrameComboer = bairFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)
                const preShineFrameComboer = preShineFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)
                console.log(bairFrame)
                console.log(preShineFrame)
                if(bairFrameComboer.post.facingDirection != preShineFrameComboer.post.facingDirection){
                    results.push({...combo })
                }
                break
            case "8": // wobbles
                const pummel = 52
                let count = 0
                moves.forEach( (move, index) => {
                    if(move.moveId == pummel ){
                        count++
                    }
                })
                if(count > 10 ){
                    results.push({...combo })
                }
                break
            case "9": // double knee
                const fair = 14
                let firstKnee = false
                let foundDoubleKnee = false
                moves.forEach( (move, index) => {
                    if(move.moveId == fair ){
                        if(firstKnee){
                            foundDoubleKnee = true
                        } else {
                            firstKnee = true
                        }
                    } else {
                        firstKnee = false
                    }
                })
                if(foundDoubleKnee){
                    results.push({...combo })
                }
                break
            case "10": // waveland back bait

                // Assume its parsed as a one move combo
                const killMove = moves[0]
                // make sure kill move was a smash attack
                const smashAttackStates = [10,11,12]
                console.log(killMove.moveId)
                if(smashAttackStates.indexOf(killMove.moveId) == -1) return false

                try {
                    frames = new SlippiGame( path ).getFrames()
                } catch(e){
                    console.log(e)
                    return console.log("Broken file:", file)
                }

                const killFrame = killMove.frame
                // find grab
                let foundGrab = false
                for(var i = killFrame; i > killFrame - 30; i--){
                    const grabState = 212
                    const currentFrame = frames[i]
                    if(!currentFrame) break
                    const _comboee = currentFrame.players.find(p => p && p.post.playerIndex == comboee.playerIndex)
                    const _comboer = currentFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)
                    if(_comboee.post.actionStateId == grabState){
                        foundGrab = true 
                        break
                    }
                }
                if(!foundGrab) return false
                
                // see if opponent wavelanded backward
                let foundWaveLand = false
                for(var i = killFrame - 80; i < killFrame - 10; i++ ){
                    const currentFrame = frames[i]
                    const prevFrame = frames[i-1]
                    if(!currentFrame) break
                    if(!prevFrame) break
                    const comboerNow = currentFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)
                    const comboerPrev = prevFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)
                    
                    const isSpecialLanding = comboerNow.post.actionStateId === 0x2b
                    const isAcceptablePrevious = isWavedashActionState(comboerPrev.post.actionStateId)
                    const isPossibleWavedash = isSpecialLanding && isAcceptablePrevious;
                    if (!isPossibleWavedash) {
                        continue;
                    }
                    // Here we special landed, it might be a wavedash, let's check
                    // We grab the last 8 frames here because that should be enough time to execute a
                    // wavedash. This number could be tweaked if we find false negatives
                    const recentFrames = []
                    for(var j = 8; j > 0; j--){
                        recentFrames.push(frames[i-j])
                    }
                    const recentAnimations = recentFrames.map(frame => {
                        const _comboer = frame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)
                        return _comboer.post.actionStateId
                    });

                    const recentAnimationsKeyed = keyBy(recentAnimations, (animation) => animation);
                
                    if (size(recentAnimationsKeyed) === 2 && recentAnimationsKeyed[236]) {
                        // If the only other animation is air dodge, this might be really late to the point
                        // where it was actually an air dodge. Air dodge animation is really long
                        return;
                    }
                
                    if (!recentAnimationsKeyed[0x18]) {
                        foundWaveLand = true
                        break
                    }
                }

                if(foundWaveLand){
                    results.push({...combo})
                }
                break
            case "runningshine":

                const runningStates = [21,22]

                try {
                    frames = new SlippiGame( path ).getFrames()
                } catch(e){
                    console.log(e)
                    return console.log("Broken file:", file)
                }

                for(var i = moves[0].frame - x; i > moves[0].frame - y; i--){
                    const currentFrame = frames[i]
                    if(!currentFrame) return false
                    const _comboer = currentFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)
                    if(runningStates.indexOf(_comboer.post.actionStateId) == -1 ) return false
                }
                results.push({...combo})
                break
            case "allshine":
                if(!moves.every(m => m.moveId == 21 )) return false
                results.push({...combo})
                break
            case "df":
                const targetMoves = [53,56]
                if(targetMoves.indexOf(moves[moves.length-2].moveId) == -1 ) return false
                results.push({...combo})
                break
            case "waveshinenair":
                const nair = 13
                const shine = 21
                let found1 = false
                moves.forEach((move,index) => {
                    if(found1) return
                    if(moves[index+1]){
                        if(move.moveId == shine && moves[index+1].moveId == nair){
                            if( moves[index+1].frame - move.frame < x ){
                                found1 = true
                                results.push({...combo})
                            }
                        }
                    }
                })
                break
            case "fn":
                const fn = [13,14]
                if(fn.indexOf(moves[moves.length-2].moveId) == -1 ) return false
                results.push({...combo})
                break
            default:
                throw "Error: No custom filter option selected"
        }
    })
    return results
}



function isWavedashActionState(actionStateID) {
    if (actionStateID === 0xec) {
        return true;
    }
    const isAboveMin = actionStateID >= 0x18;
    const isBelowMax = actionStateID <= 0x22;
    return isAboveMin && isBelowMax;
}

// straight from slippi-js
// function handleActionWavedash(counts: ActionCountsType, animations: State[]): void {
//     const currentAnimation = last(animations);
//     const prevAnimation = animations[animations.length - 2] as number;
  
//     const isSpecialLanding = currentAnimation === State.LANDING_FALL_SPECIAL;
//     const isAcceptablePrevious = isWavedashInitiationAnimation(prevAnimation);
//     const isPossibleWavedash = isSpecialLanding && isAcceptablePrevious;
  
//     if (!isPossibleWavedash) {
//       return;
//     }
  
//     // Here we special landed, it might be a wavedash, let's check
//     // We grab the last 8 frames here because that should be enough time to execute a
//     // wavedash. This number could be tweaked if we find false negatives
//     const recentFrames = animations.slice(-8);
//     const recentAnimations = keyBy(recentFrames, (animation) => animation);
  
//     if (size(recentAnimations) === 2 && recentAnimations[State.AIR_DODGE]) {
//       // If the only other animation is air dodge, this might be really late to the point
//       // where it was actually an air dodge. Air dodge animation is really long
//       return;
//     }
  
//     if (recentAnimations[State.AIR_DODGE]) {
//       // If one of the recent animations was an air dodge, let's remove that from the
//       // air dodge counter, we don't want to count air dodges used to wavedash/land
//       counts.airDodgeCount -= 1;
//     }
  
//     if (recentAnimations[State.ACTION_KNEE_BEND]) {
//       // If a jump was started recently, we will consider this a wavedash
//       counts.wavedashCount += 1;
//     } else {
//       // If there was no jump recently, this is a waveland
//       counts.wavelandCount += 1;
//     }
//   }
  
// function isWavedashInitiationAnimation(animation: State): boolean {
//     if (animation === State.AIR_DODGE) {
//         return true;
//     }

//     const isAboveMin = animation >= State.CONTROLLED_JUMP_START;
//     const isBelowMax = animation <= State.CONTROLLED_JUMP_END;
//     return isAboveMin && isBelowMax;
// }
  