
const { SlippiGame, ConnectionEvent } = require("@slippi/slippi-js");
import { keyBy, size } from "lodash";

import { fastFallers } from "../../constants/characters";
import  rectangles from "../../constants/rectangles";
const shineStates = [360,361,362,363,364,365,366,367,368]
//  whatever unit ikneedata.com uses
const stageRadii = {
    2: 63.6, // FoD
    3: 87.6, // pokemon
    8: 56, // yoshis
    28: 77, // dreamland
    31: 69, // batts
    32:  85.4 // fd
}
export default (prev, params, eventEmitter) => {
    const results = []
    const { maxFiles } = params
    console.log("MAX FILES: ", maxFiles )
    console.log(prev.results.length)
    let dmg = 0
    prev.results.slice(0,maxFiles==""?undefined:parseInt(maxFiles)).forEach( ( combo, index )  => {
        if( index % 1000 == 0 ) eventEmitter({msg: `${index}/${maxFiles ? maxFiles : prev.results.length}`})

        const { n, x, y } = params
        const { moves, comboer, comboee, path, stage } = combo
        let frames, targetStates, _comboer, _comboee, currentFrame, count, posX, posY
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
                count = 0
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
            case "names":
                const names = ["jerry shinefeld", "connormcdairvid"]
                if(names.indexOf(comboer.displayName.toLowerCase()) == -1) return false
                console.log(comboer.displayName)
                results.push({...combo})
                break
            case "stomp":
                const moveFrame = moves[moves.length-1].frame
                results.push({
                    ...combo,
                    startFrame: moveFrame - 20
                })
                break          
            case "cloud":
                try {
                    frames = new SlippiGame( path ).getFrames()
                } catch(e){
                    console.log(e)
                    return console.log("Broken file:", file)
                }
                targetStates = [183,191,199,200,201,202,203]
                const range = 60
                const frame1 = moves[moves.length-1].frame
                for( var i = frame1; i < (frame1 +  range); i++){
                    const currentFrame = frames[i]
                    if(!currentFrame) return false
                    const _comboee = currentFrame.players.find(p => p && p.post.playerIndex == comboee.playerIndex)
                    if(targetStates.indexOf(_comboee.post.actionStateId) != -1 ){
                        results.push({...combo})
                        break
                    }
                }

                break
            case "psychic":
                const psychics = [10,11,18]
                const throwIds = [53,54,55,56]
                if(psychics.indexOf(comboer.characterId) == -1 ) return false
                results.push(combo)
                break  
            case "d":
                try {
                    frames = new SlippiGame( path ).getFrames()
                } catch(e){
                    console.log(e)
                    return console.log("Broken file:", file)
                }
                currentFrame = frames[moves[moves.length-1].frame]
                if(!currentFrame) return false
                _comboer = currentFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)
                posX = _comboer.post.positionX
                posY = _comboer.post.positionY
                const d = Math.sqrt(Math.pow(posX, 2) + Math.pow(posY, 2))
                results.push({ ...combo, d })
                break
            case "x":
                try {
                    frames = new SlippiGame( path ).getFrames()
                } catch(e){
                    console.log(e)
                    return console.log("Broken file:", path)
                }
                currentFrame = frames[moves[moves.length-1].frame]
                if(!currentFrame) return false
                _comboer = currentFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)
                results.push({ 
                    ...combo, 
                    x: _comboer.post.positionX,
                    facingDirection: _comboer.post.facingDirection
                })
                break
            case "turnaround_dair":

                if( combo.x > 0 && combo.facingDirection === -1 ) return false
                if( combo.x < 0 && combo.facingDirection === 1 ) return false
                
                try {
                    frames = new SlippiGame( path ).getFrames()
                } catch(e){
                    console.log(e)
                    return console.log("Broken file:", path)
                }
                currentFrame = frames[moves[moves.length-1].frame]
                if(!currentFrame) return false
                
                // look backward to find shine turnaround
                let turnaround = false
                for(var i = 0; i < 40; i++ ){
                    const _frame = frames[ moves[moves.length-1].frame - i ]
                    _comboer = _frame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)
                    if( _comboer.post.actionStateId ===  369 ){
                        results.push({...combo})
                        return
                    }
                }
                break
            case "shine_stall":
                try {
                    frames = new SlippiGame( path ).getFrames()
                } catch(e){
                    console.log(e)
                    return console.log("Broken file:", path)
                }
                currentFrame = frames[moves[moves.length-1].frame]
                if(!currentFrame) return false
                
                let shineFrames = []
                for(var i = 0; i < 80; i++ ){
                    const _frame = frames[ moves[moves.length-1].frame - i ]
                    _comboer = _frame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)
                    if( shineStates.indexOf(_comboer.post.actionStateId) > -1 ){
                        shineFrames.push(_frame)
                    } else {
                        if( shineFrames.length > 0 ){
                            break
                        }
                    }
                }

                const shineLength = shineFrames[0].frame - shineFrames[shineFrames.length-1].frame
                results.push({
                    ...combo,
                    d: shineLength,
                    startFrame: shineFrames[shineFrames.length-1].frame
                })
                
                break
            case "absx":
                try {
                    frames = new SlippiGame( path ).getFrames()
                } catch(e){
                    console.log(e)
                    return console.log("Broken file:", file)
                }
                currentFrame = frames[moves[moves.length-1].frame]
                if(!currentFrame) return false
                _comboer = currentFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)
                results.push({ ...combo, x: Math.abs(_comboer.post.positionX) })
                break
            case "ex":
                try {
                    frames = new SlippiGame( path ).getFrames()
                } catch(e){
                    console.log(e)
                    return console.log("Broken file:", file)
                }
                currentFrame = frames[moves[moves.length-1].frame]
                if(!currentFrame) return false
                _comboer = currentFrame.players.find(p => p && p.post.playerIndex == comboee.playerIndex)
                results.push({ ...combo, x: _comboer.post.positionX })
                break
            case "y":
                try {
                    frames = new SlippiGame( path ).getFrames()
                } catch(e){
                    console.log(e)
                    return console.log("Broken file:", file)
                }
                currentFrame = frames[moves[moves.length-1].frame]
                if(!currentFrame) return false
                _comboer = currentFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)
                results.push({ ...combo, y: _comboer.post.positionY })
                break
            case "mario":
                const marios = [8,22]
                if(marios.indexOf(comboer.characterId) == -1 ) return false
                results.push(combo)
                break
            case "offstage":
                try {
                    frames = new SlippiGame( path ).getFrames()
                } catch(e){
                    console.log(e)
                    return console.log("Broken file:", file)
                }
                currentFrame = frames[moves[moves.length-1].frame]
                if(!currentFrame) return false
                _comboer = currentFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)
                posX= _comboer.post.positionX
                const s = rectangles[stage].edge
                if( posX< 0 ){
                    if( posX> ( s.xMax*-1 ) ) return false
                } else {
                    if( posX< ( s.xMax ) ) return false
                }
                results.push(combo)
                break
            case "maxY":
                if(combo.y > y ) return false
                results.push(combo)
                break
            case "mangstats":
                const sample = prev.results.slice(0,2100)
                count = 0
                sample.forEach( combo => {
                    if(combo.comboer.displayName == "mang") count++
                })
                console.log("mang count: ", count)
                break
            case "spacies":
                const spacies = [2,20]
                if(spacies.indexOf(combo.comboer.characterId) == -1 ) return false
                results.push({...combo})
                break
            case "spacies_comboee":
                const spacie = [2,20]
                if(spacie.indexOf(combo.comboee.characterId) == -1 ) return false
                results.push({...combo})
                break
            case "onstageKO":
                // subtract 20 because that's about a max character's width away
                if( Math.abs(combo.x) < ( stageRadii[combo.stage] - 20 ) ) results.push(combo)
                break
            case "offstageKO":
                if( Math.abs(combo.x) > ( stageRadii[combo.stage] + 5 ) ) results.push(combo)
                break
            case "lastMove":
                results.push({
                    ...combo,
                    endFrame: combo.moves[combo.moves.length-1].frame + parseInt(x)
                })
                break
            case "secondToLast":
                results.push({
                    ...combo,
                    startFrame: combo.moves[combo.moves.length-2].frame + parseInt(x)
                })
                break
            case "preLastMove":
                results.push({
                    ...combo,
                    startFrame: combo.moves[combo.moves.length-1].frame - parseInt(x)
                })
                break
            case "minY":
                if( combo.y < x ) return false
                results.push(combo)
                break
            case "maxY":
                if( combo.y > x ) return false
                results.push(combo)
                break
            case "uniqueHits":
                const hits = []
                const jabs = [3,4]
                for(var i = 0; i < combo.moves.length; i++){
                    let moveId = combo.moves[i].moveId
                    if( jabs.indexOf(moveId) > -1 ){
                        moveId = 2
                    }
                    if(hits.indexOf(moveId) > -1 ){
                        return false
                    } else {
                        hits.push(moveId)
                    }
                }
                results.push(combo)
                break
            case "shieldBreaks":
                try {
                    frames = new SlippiGame( path ).getFrames()
                } catch(e){
                    console.log(e)
                    return console.log("Broken file:", path)
                }
                if(!frames) return false
                if(frames.length == 0) return false
                const shieldBreakStates = [205,206,207,208,209,210,211]
                let temp = []
                Object.keys(frames).forEach( f => {
                    const frame = frames[f]
                    const players = frame.players.filter(p => p)
                    if(players.length != 2) return false
                    try {
                        if(shieldBreakStates.indexOf(players[0].post.actionStateID) > -1 ||
                        shieldBreakStates.indexOf(players[1].post.actionStateID) > -1
                        ){
                            temp.push(frame)
                        } else {
                            if(temp.length > 0 ){
                                console.log("FOUND ONE")
                                results.push({
                                    startFrame: temp[0].frame,
                                    endFrame: temp[temp.length-1].frame,
                                    ...combo
                                })
                            }
                            temp = []
                        }

                    } catch(e){
                        return false
                    }
                })
                break
            case "doubleFair":
                let bingo = false
                combo.moves.forEach(m => {
                    if(m.moveId == 14 ){
                        if(bingo){
                            results.push(combo)
                        } else {
                            bingo = true
                        }
                    } else {
                        bingo = false
                    }
                })
                break
            case "throw":
                const throws = [54,56]
                if(throws.indexOf(combo.moves[combo.moves.length-2].moveId) > -1){
                    results.push(combo)
                }
                break
            case "zeroToDeath":
                if(combo.startPercent == 0){
                    results.push(combo)
                }
                break
            case "swords":
                const marthRoy = [9,23]
                if(marthRoy.indexOf(combo.comboer.characterId) > -1){
                    results.push(combo)
                }
                break
            case "excludeShineDair":
                if(combo.moves[combo.moves.length-1].moveId == 17 
                && combo.moves[combo.moves.length-2].moveId == 21
                ){ return }
                results.push(combo)
                break
            case "excludeNeutralB":
                if( combo.moves.find(c => c.moveId == 18 ) ){ return }
                results.push(combo)
                break
            case "only":
                const t = [0,1,9,10,11,16,20,25]
                if ( t.indexOf(combo.comboer.characterId) > -1 ){ results.push(combo) }
                break
            case "12":
                //const target = [8,8,8,8,8,16,16,16]
                const target = [8,8,8,8,16,16,16]
                const uthrow = combo.moves.find(m => m.moveId == 55)
                if(!uthrow) return
                const uthrowIndex = combo.moves.indexOf(uthrow)
                for(var i = 1; i <= target.length; i++){
                    if(!combo.moves[uthrowIndex + i]) return false
                    if(combo.moves[uthrowIndex + i].moveId != target[i-1]){
                        return false
                    }
                }
                results.push(combo)
                break
            case "isolate_dair":
                const dair = combo.moves.find(m => m.moveId == 17 )
                dmg+= dair.damage
                results.push({
                    ...combo,
                    startFrame: dair.frame - 10,
                    endFrame: dair.frame + 60
                })
                console.log(dmg)
                break
            case "isolate_dsmash":
                const dsmash = combo.moves.find(m => m.moveId == 12 )
                dmg+= dsmash.damage
                results.push({
                    ...combo,
                    startFrame: dsmash.frame - 5,
                    endFrame: dsmash.frame + 50
                })
                console.log(dmg)
                break
            case "late_dair":
                break
            case "triple_dair":
                const dairID = 17
                let c = 0
                for( var i = 0; i < moves.length; i++){
                    if( moves[i].moveId == dairID ){
                        c++
                        if(c == 3 ){
                            results.push({...combo})
                            return
                        } 
                        
                    } else {
                        c = 0
                    }
                }
                break
            case "random2":
                const e = Math.ceil(( Math.random() * (combo.lastFrame - 180 - x) ) + 180)
                results.push({
                    startFrame: e,
                    endFrame: e+parseInt(x),
                    ...combo
                })
                break
            case "stocks":
                let stocks
                try {
                    stocks = new SlippiGame( path ).getStats().stocks
                } catch(e){
                    console.log(e)
                    return console.log("Broken file:", path)
                }
                results.push({
                    stocks: stocks,
                    ...combo
                })
                break
            case "firstStock":

                let a0 = combo.stocks[0].endFrame
                let a1 = combo.stocks[1].endFrame
                if(a0 === null) a0 = combo.lastFrame
                if(a1 === null) a1 = combo.lastFrame
                let firstStock
                if( a0 < a1 ){
                    firstStock = combo.stocks[0]
                    _comboer = combo.players.find( p => p && p.playerIndex == combo.stocks[1].playerIndex )
                    _comboee = combo.players.find( p => p && p.playerIndex == combo.stocks[0].playerIndex )
                } else { 
                    firstStock = combo.stocks[1]
                    _comboer = combo.players.find( p => p && p.playerIndex == combo.stocks[0].playerIndex )
                    _comboee = combo.players.find( p => p && p.playerIndex == combo.stocks[1].playerIndex )
                }
                if(firstStock.endFrame < 60 ) return false
                if(firstStock.endPercent < 10 ) return false
                results.push({
                    startFrame: -123,
                    endFrame: firstStock.endFrame,
                    comboer: _comboer,
                    comboee: _comboee,
                    ...combo
                })
                break
            case "11":
                console.log(moves[moves.length-1].moveId)
                if( moves[moves.length-1].moveId == 1 || moves[moves.length-2].moveId == 1 ){
                    results.push({...combo})
                }
                break
            case "exclude":
                if(comboer.characterId == parseInt(x)) return false
                results.push(combo)
                break
            case "noDamage":
                try {
                    frames = new SlippiGame( path ).getFrames()
                } catch(e){
                    console.log(e)
                    return console.log("Broken file:", file)
                }
                const preFrame = frames[moves[0].frame - 1]
                const postFrame = frames[moves[moves.length-1].frame + 1]
                if(!preFrame || !postFrame) return false
                const preDamage = preFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex).post.percent
                const postDamage = postFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex).post.percent
                if( preDamage == postDamage ) results.push({ ...combo})
                break
            case "moveCount":
                count = 0
                combo.moves.forEach(m => {
                    if(m.moveId == 17 ) count++
                })
                if(count >= x ) results.push(combo)
                break
            case "shine_juggle":
                let shines = []
                let foundCombo
                moves.forEach(move => {
                    if(move.moveId === 14 ){
                        shines.push(move)
                        if(shines.length >= 5 ){
                            foundCombo = shines
                        }
                    } else {
                        shines = []
                    }
                })
                if(foundCombo){
                    const what = {
                        ...combo,
                        moves: foundCombo,
                        startFrame: foundCombo[0].frame,
                        endFrame: foundCombo[foundCombo.length-1].frame,
                    }
                    console.log(what)
                    results.push(what)
                }
                break
            case "no_kill":
                if(combo.didKill) return false
                results.push(combo);
                break

            
            case "quick_one_two":
                const minDamage = x
                const minTime = y
                const notAllowed = [8,9,10,11,12,18,19,20,21]
                const aerials = [13,14,15,16]
                for( var i = 0; i < moves.length-1; i++ ){
                    const currMove = moves[i]
                    const nextMove = moves[i+1]
                    if(aerials.indexOf(currMove.moveId) == -1 ) return false
                    if(nextMove.moveId != 8 ) return false
                    //if(aerials.indexOf(nextMove.moveId) > -1 ) return false
                    if(currMove.damage + nextMove.damage < x ) return false
                    if(nextMove.frame - currMove.frame > y ) return false
                    results.push({
                        ...combo,
                        moves: [currMove, nextMove],
                        startFrame: currMove.frame,
                        endFrame: nextMove.frame
                    })
                    return false 
                }
                break
            case "turnaround_utilt":
                const _aerials = [13,14,15,16]
                for( var i = 0; i < moves.length-1; i++ ){
                    const currMove = moves[i]
                    const nextMove = moves[i+1]
                    if(_aerials.indexOf(currMove.moveId) == -1 ) continue
                    if(nextMove.moveId != 8 ) continue //utilt
                    //if(aerials.indexOf(nextMove.moveId) > -1 ) continue
                    if(currMove.damage + nextMove.damage < x ) continue
                    if(nextMove.frame - currMove.frame > y ) continue

                    try {
                        frames = new SlippiGame( path ).getFrames()
                    } catch(e){
                        console.log(e)
                        return console.log("Broken file:", file)
                    }
                    currentFrame = frames[currMove.frame]
                    if(!currentFrame) return false
                    _comboer = currentFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)
                    let facingDirection = _comboer.post.facingDirection

                    let nextFrame = frames[nextMove.frame]
                    if(!nextFrame) return false
                    _comboer = nextFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)

                    if( facingDirection === _comboer.post.facingDirection ) continue


                    results.push({
                        ...combo,
                        moves: [currMove, nextMove],
                        startFrame: currMove.frame,
                        endFrame: nextMove.frame
                    })
                }
                break
            case "quick_one_two_three":
                const nAllowed = [8,9,10,11,12,18,19,20,21]
                for( var i = 0; i < moves.length-2; i++ ){
                    const currMove = moves[i]
                    const nextMove = moves[i+1]
                    const nextNextMove = moves[i+2]
                    if(nAllowed.indexOf(currMove.moveId) > -1 ) return false
                    if(nAllowed.indexOf(nextMove.moveId) > -1 ) return false
                    if(nAllowed.indexOf(nextNextMove.moveId) > -1 ) return false
                    if(( currMove.damage + nextMove.damage + nextNextMove.damage ) < x ) return false
                    if(nextNextMove.frame - currMove.frame > y ) return false
                    results.push({
                        ...combo,
                        moves: [currMove, nextMove, nextNextMove],
                        startFrame: currMove.frame,
                        endFrame: nextNextMove.frame
                    })
                    return false 
                }
                break
            
            case "chaingrab":
                const _throws = [53,54]
                count = 0;
                moves.forEach( move => {
                    if( _throws.indexOf(move.moveId) > -1 ) count ++
                })
                if( count >= x ){
                    results.push({...combo})
                }
                break
            case "oos":

                try {
                    frames = new SlippiGame( path ).getFrames()
                } catch(e){
                    console.log(e)
                    return console.log("Broken file:", path)
                }
                
                let shieldStunState = 0xB5
                for( var i = 0; i < x; i++ ){
                    currentFrame = frames[moves[0].frame - i]
                    const _comboer = currentFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)
                    if(_comboer.post.actionStateId == shieldStunState ){
                        results.push({ d: i, ...combo})
                        return
                    }
                }
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
  //     const prevAnimation = animations[animations.length - 2] as number;
  
//     const   = currentAnimation === State.LANDING_FALL_SPECIAL;
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
  