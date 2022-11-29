const { SlippiGame } = require("@slippi/slippi-js");
const {actionStates} = require("../../constants/actionStates")

export default (prev, params, eventEmitter) => {

    const results = []
    const { maxFiles } = params
    prev.results.slice(0,maxFiles==""?undefined:parseInt(maxFiles)).forEach( ( combo, index ) => {
        if( index % 1 == 0 ) eventEmitter({msg: `${index}/${maxFiles ? maxFiles : prev.results.length}`})
        const { n, moveId } = params
        const { moves, comboer, comboee, path } = combo

        const game = new SlippiGame( path )
        let frames
        try {
            frames = game.getFrames()
        } catch(e){
            console.log(e)
            return console.log("Broken file:", file)
        }

        const targetMoves = []
        const _n = parseInt(n)
        if(_n){
            if( _n >= 0 ){
                if(!moves[_n]) return false
                targetMoves.push(moves[_n])
            } else {
                console.log(moves[moves.length+_n])
                if(!moves[moves.length+_n]) return false
                targetMoves.push(moves[moves.length+_n])
            }
        }
        if(moveId){
            moves.forEach( move => {
                if( move.moveId == moveId ){
                    targetMoves.push(move)
                }
            })
        }
        if(targetMoves.length == 0){
            console.log("No target move found")
            return false
        }
        
        const bairMoveIds = [0x43]

        const reverseHit = targetMoves.find( move => {
            const currentFrame = frames[move.frame]
            if(!currentFrame) return false
            const _comboer = currentFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)
            const _comboee = currentFrame.players.find(p => p && p.post.playerIndex == comboee.playerIndex)
            const comboerX = _comboer.post.positionX
            const comboerFacing = _comboer.post.facingDirection
            const comboeeX = _comboee.post.positionX
            const isBair = bairMoveIds.indexOf(move.moveId) > -1

            // console.log("comboerX: ", comboerX)
            // console.log("comboeeX: ", comboeeX)
            // console.log("comboerFacing: ", comboerFacing)
            // console.log("isBair: ", isBair)
            if( !isBair ){
                if( comboerX > comboeeX ){
                    return comboerFacing == "1"
                } else {
                    return comboerFacing == "-1"
                }
            } else {
                if( comboerX > comboeeX ){
                    return comboerFacing == "-1"
                } else {
                    return comboerFacing == "1"
                }
            }
        })

        if(reverseHit){
            results.push({...combo})
        }
       
    })
    return results
}

function isInstance(comboer,comboee,params){
    const {comboerActionState, comboeeActionState, comboerXPos, comboerYPos, 
        comboerMaxD, comboeeXpos, comboeeYpos, comboeeMaxD } = params

    if(!comboerActionState && !comboeeActionState ){
        throw "Error: You've passed in no action states so every frame is a valid instance"
    }
    // convert to values. 
    // TODO: figure out how to remove this logic 
    if( comboerActionState){
        let states = actionStates.find(s=>s.id == comboerActionState).actionStateID
        states = Array.isArray(states) ? states : [states]

        if( states.indexOf(comboer.post.actionStateId) == -1 ) return false
    }
    if( comboeeActionState ) {
        let states = actionStates.find(s=>s.id == comboeeActionState).actionStateID
        states = Array.isArray(states) ? states : [states]
        if( states.indexOf(comboee.post.actionStateId) == -1 ) return false
    } 
    return true 
}