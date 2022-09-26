
// Useful Data:
const validStageIds = [2,3,8,28,31,32]
const fsmashStates = [58,59,60,61,62]
const hitStates = [87,88,89,90,91]


// Here there be gold:
getCombos(options){
    const {
        comboer,comboee,comboerTag,comboeeTag,didKill,
        minMoves,maxMoves,minDamage,includesMove,endMove,
        firstMove,secondToLastMove,testMove,testVal
    } = options
    const _comboerTag = comboerTag.toLowerCase();
    const _comboeeTag = comboeeTag.toLowerCase();
    return this.combos.filter(c => {
        if( minMoves && !(c.moves.length >= minMoves) ) return false;
        if( maxMoves && !(c.moves.length <= maxMoves) ) return false;
        const comboerPlayer = this.players.find(p => p.playerIndex === c.playerIndex);
        const comboeePlayer = this.players.find(p => p.playerIndex === c.opponentIndex)

        const comboerCharId = comboerPlayer.characterId;
        //fuck ice climbers
        if( comboerCharId === 14 ) return false;


        //if( lowTiers.indexOf(comboerCharId) === -1) return false
        // if(fastFallers.indexOf(comboeePlayer.characterId) !== -1 ) return false
        // if(comboeePlayer.characterId === 9 ) { return false } // marth

        // FOR Mango 
        // const n = comboerPlayer.displayName.toLowerCase()
        // if(n !== "null" && n !== "null4summit :)" && n !== "kodorin") return false;

        // For spacies
        // const feet = [0,2,20]
        // if(feet.indexOf(comboeePlayer.characterId) == -1 ){ return false }

        if(comboer && !(comboerCharId == comboer) ) return false;
        if(comboee && !(comboeePlayer.characterId == comboee) ) return false;
        if(comboerTag && !(comboerPlayer.displayName.toLowerCase() == _comboerTag)) return false;
        if(comboeeTag && !(comboeePlayer.displayName.toLowerCase() == _comboeeTag)) return false;
        if( didKill && !c.didKill ) return false;
        if( minDamage && !(c.moves.reduce((n,m) => n + m.damage ,0) >= minDamage)) return false;
        if( includesMove && !(c.moves.find(m => m.moveId == includesMove ))) return false;
        if( firstMove && !(c.moves[0].moveId == firstMove) ) return false;
        if( secondToLastMove && !c.moves[c.moves.length-2] ) return false;
        if( secondToLastMove && !(c.moves[c.moves.length-2].moveId == secondToLastMove) ) return false;

        //if( testMove && !(c.moves[c.moves.length-3].moveId == testMove) ) return false;
        if( testMove ){

            //if(c.startPercent > 20 ) return false;
            // check for a number in a row
            let moveCount = 0;
            const MIN = 3
            const move = c.moves.find(m=>m.moveId == testMove)
            const moveIndex = c.moves.indexOf(move)
            if(moveIndex == -1 ) return false;
            for(var i = moveIndex; i < c.moves.length; i++){
                if(c.moves[i].moveId==testMove){
                    moveCount++
                } else {
                    if(moveCount < MIN){
                        return false
                    } else {
                        const maxFramesInBetween = 30
                        for(var j = moveIndex+1; j < moveIndex + moveCount - 1;j++){
                            if(c.moves[j].frame - c.moves[j-1].frame > 40 ){
                                return false
                            }
                        }
                        return true
                    }
                }
            }
            return false
        } 

        if( testVal > 0 ){

            const forbiddenMoves = [13,14,15,16,17,18]
            for(var i = 0; i < c.moves.length; i++){
                if(forbiddenMoves.indexOf(c.moves[i].moveId) !== -1){ return false }
            }


            //if(!(c.moves[c.moves.length-1].moveId == 17 && c.moves[c.moves.length-2].moveId == 15 && c.moves[c.moves.length-3].moveId == 21 && c.moves[c.moves.length-4].moveId == 21)){ return false }

            // // End Moves:
            // const endMoves = [11,16]
            // const lastMove = c.moves[c.moves.length-1]
            // if(endMoves.indexOf(lastMove.moveId) === -1 ){
            //     return false
            // }

            // const firstMove = c.moves[0]
            // const lastMove = c.moves[c.moves.length-1]
            // const startPercent = c.startPercent
            // const endPercent = c.endPercent

            // const percDiff = endPercent - startPercent
            // const frameDiff = lastMove.frame - firstMove.frame 
            

            //if(c.startPercent > 0 ) { return false }

            // const firstFrame = c.moves[0].frame
            // const lastFrame = c.moves[c.moves.length-1].frame
            // if( lastFrame - firstFrame > testVal ){ return false }


            // const lastMove = c.moves[c.moves.length-1]
            // const secondToLastMove = c.moves[c.moves.length-2]
            // if (lastMove.frame - secondToLastMove.frame > testVal) return false

            // make sure second to last is an aerial
            // const aerials = [13,14,15,16,17]
            // if(aerials.indexOf(secondToLastMove.moveId) == -1 ){ return false }

            //if(lastMove.frame - secondToLastMove.frame > testVal ){ return false }
            // shine dair

            // const shine = 21
            // const dair = 17
            // let m = c.moves[0].moveId
            // if(m !== shine && m !== dair ){ return false }
            // let count = 0
            // for(var i = 1; i < c.moves.length-2;i++){
            //     if((c.moves[i].moveId === shine && m === dair) || (c.moves[i].moveId === dair && m === shine ) ){
            //         m = c.moves[i].moveId
            //         count++
            //     }
            // }
            // if(count < testVal){ return false}

            // const firstMove = c.moves[0]
            // const lastMove = c.moves[c.moves.length-1]
            // const totalFrames = lastMove.frame - firstMove.frame
            // let d = 0
            // c.moves.forEach(move => d += move.damage )
            // console.log(d/totalFrames);
            // if(d/totalFrames < testVal){ return false }
            // for(var i = 0; i < c.moves.length - 2; i++){
            //     if(c.moves[i+1].frame - c.moves[i].frame > testVal ){ return false }
            // }

            // let highDPSmoves = [c.moves[0]]
            // let shineCount = 0
            // for(var i = 0; i < c.moves.length - 2; i++ ){
            //     if(c.moves[i+1].frame - c.moves[i].frame > testVal){
            //         if(highDPSmoves.length < 5){ 
            //             highDPSmoves = [c.moves[i+1]] 
            //         } else {
            //             i+=100
            //         }
            //     } else {
            //         highDPSmoves.push(c.moves[i+1])
            //     }
            // }
            // if(highDPSmoves.length < 5 ) return false
            // for(var i = 0; i < highDPSmoves.length; i++){ if(highDPSmoves[i].moveId === 21 ){shineCount++}}
            // if(shineCount > 1 ){ return false}
            // let uptiltCount = 0
            // for(var i = 0; i < highDPSmoves.length; i++){ if(highDPSmoves[i].moveId === 8 ){uptiltCount++}}
            // if(uptiltCount > 0 ){ return false}
            // console.log(highDPSmoves)
            // let damage = 0
            // highDPSmoves.forEach(move => damage += move.damage)
            // console.log(damage/highDPSmoves.length)
            // if(damage/highDPSmoves.length < 10){ return false }

            // Mango Allegro (120bmp)
            // const shineId = 21
            // let shineIndex = -1
            // for(var i = 0; i < c.moves.length; i++ ){
            //     if(c.moves[i].moveId == shineId ){
            //         shineIndex = i 
            //         break
            //     }
            // }
            // if(shineIndex === -1 ){ return false }
            // if(c.moves.length - shineIndex < 4 ){ return false }

            // if(c.moves[shineIndex+1].moveId !== 17 ){ return false }
            // if(c.moves[shineIndex+2].moveId !== shineId ){ return false }
            // if(c.moves[shineIndex+3].moveId !== 17 ){ return false }

            // const bMoves = c.moves.slice(shineIndex,shineIndex + 4)
            // // for(var i = 1; i < bMoves.length; i++){
            // //     if(bMoves[i].moveId === shineId ){ return false }
            // // }

            // const tol = 14
            // const val = parseInt(testVal)
            // for(var i = 1; i < 4; i++ ){
            //     const frameDiff = bMoves[i].frame - bMoves[i-1].frame
            //     if( frameDiff >= val + tol ) { return false }
            //     if( frameDiff <= val - tol ) {return false } 
            // }

            // for(var i = 0; i < c.moves.length - shineIndex; i++ )

            // const frames = 30
            // const tol = 1
            // const aerials = [13,14,15,16,17]
            // const bannedMoves = [1,2,3,4,5,7,8,9,18,19,20,21,53,54,55,56]
            // if(bannedMoves.indexOf(c.moves[0].moveId) > -1 ){return false}
            // let onBeatMoves = [c.moves[0]]
            // for(var i = 1; i < c.moves.length; i++){ 
            //     if(bannedMoves.indexOf(c.moves[i].moveId) > -1 ){return false}

            //     const frameDiff = c.moves[i].frame - onBeatMoves[onBeatMoves.length-1].frame 
            //     if( frameDiff >= frames-tol && frameDiff <= frames+tol ){
            //         onBeatMoves.push(c.moves[i])
            //     } else {
            //         if(onBeatMoves.length < testVal ){
            //             onBeatMoves = [c.moves[i]]
            //         } else {
            //             break
            //         }
            //     }
            // }
            // if(onBeatMoves.length < testVal ){ return false }

        }

        if( endMove && !(c.moves[c.moves.length-1].moveId == endMove) ) return false;
        return true;
    })
}



// Find Fade Back Nair
// torn out of middle of old file processor code
// not complete
function findFadeBackNair(){
    // find the fadeback nair

    const frames = game.getFrames();
    //console.log("FRAMES:", frames )

    const mango = this.players.find(p => p.displayName === "mang")
    const notMango = this.players.find(p => p.displayName !== "mang")
    if(!mango){
        this.isvalid = false;
        this.info = "no mango"
        return resolve();
    }
    //console.log(mango)
    //console.log(notMango)

    for(var i = 0; i < metadata.lastFrame; i++){

    const f = frames[i]
    //console.log(f)
    const mangoState = f.players[mango.playerIndex].pre.actionStateId
    const notMangoState = f.players[notMango.playerIndex].pre.actionStateId

    if(fsmashStates.indexOf(mangoState) > -1 ){

        for(var j = 12; j < 60; j++){
            if(frames[i+j] && frames[i+j].players && hitStates.indexOf(frames[i+j].players[notMango.playerIndex].pre.actionStateId) == -1 ) break
        }
        console.log(j)
        if(j == 60 ) return resolve() 

        for(var j = 1; j < 60; j++){
            if(frames[i-j].players[notMango.playerIndex].pre.actionStateId == 181){
                if(frames[i-j+3].players[notMango.playerIndex].pre.actionStateId == 212){
                    console.log("AHAHAHAHAHAHA")
                    break
                }
            }
        }
        if( j == 60 ) return resolve() 
        // if(frames[i+30].players && hitStates.indexOf(frames[i+30].players[notMango.playerIndex].pre.actionStateId) == -1 ){
        //     return resolve();
        // }

        return resolve({
            startFrame: i - 150,
            endFrame: i + 150 > metadata.lastFrame ? metadata.lastFrame : i + 150,
            path: this.slpPath 
        })

        for(var j = 1; j < 30; j++ ){

            if(frames[i-j].players[notMango.playerIndex].pre.actionStateId == 212){
                return resolve({
                startFrame: i - 150,
                endFrame: i + 150,
                path: this.slpPath
                })
            }

        }
    }
}
        