const { SlippiGame } = require("@slippi/slippi-js");
const {actionStates} = require("../../constants/actionStates")

export default (prev, params, eventEmitter) => {
    const { maxFiles } = params
    return prev.results.slice(0,maxFiles==""?undefined:parseInt(maxFiles)).filter( ( result, index ) => {

        if( index % 20 == 0 ) eventEmitter({msg: `${index}/${prev.results.length}`})

        const { path, comboer, comboee, startFrame, endFrame, moves } = result
        const { startFrom, searchRange, comboerActionState, comboeeActionState,
            startFromNthMove, comboerYPos, comboeeYPos, exclude } = params
        const game = new SlippiGame( path )
        let frames, lastFrame
        try {
            frames = game.getFrames()
            lastFrame = game.getMetadata().lastFrame
        } catch(e){
            console.log(e)
            return console.log("Broken file:", file)
        }
        const _startFrom = parseInt(startFrom)
        const _startFromNthMove = parseInt(startFromNthMove)
        const _searchRange = parseInt(searchRange)
        let _startFrame
    
        if( _startFrom ){
            _startFrame = startFrom > -1 ? frames[startFrame + _startFrom].frame : frames[endFrame + _startFrom].frame
        } 
        if( _startFromNthMove ){
            if(!moves) throw "Error: moves is not defined. This is likely not a parsed combo clip"
            _startFrame = _startFromNthMove > -1 ? moves[_startFromNthMove].frame : moves[moves.length + _startFromNthMove].frame
        }
        if( _startFrom && _startFromNthMove ){
            if(!moves) throw "Error: moves is not defined. This is likely not a parsed combo clip"
            const moveFrame = _startFromNthMove > -1 ? moves[_startFromNthMove].frame : moves[moves.length + _startFromNthMove].frame
            _startFrame = startFrom > -1 ? frames[moveFrame + _startFrom].frame : frames[moveFrame + _startFrom].frame
        }

        let comboerStates, comboeeStates
        if( comboerActionState ){ comboerStates = actionStates.find(s=>s.id == comboerActionState).actionStateID }
        comboerStates = Array.isArray(comboerStates) ? comboerStates : [comboerStates]
        if( comboeeActionState ){ comboeeStates = actionStates.find(s=>s.id == comboeeActionState).actionStateID }
        comboeeStates = Array.isArray(comboeeStates) ? comboeeStates : [comboeeStates]

        let found = false
        for(let i = _startFrame; 
            (_searchRange > -1 ? 
            ((i <= _startFrame + _searchRange) && ( i < lastFrame - 1 ))
            : ( i >= _startFrame + _searchRange ));
            _searchRange > -1 ? i++ : i--
        ){
            const currentFrame = frames[i.toString()]
            if(!currentFrame) return false 
            let _comboer, _comboee
            if( comboerActionState ) _comboer = currentFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)
            if( comboeeActionState ) _comboee = currentFrame.players.find(p => p && p.post.playerIndex == comboee.playerIndex)

            if( comboerActionState && comboeeActionState ){

                if( comboerStates.indexOf(_comboer.post.actionStateId) != -1 
                    && comboeeStates.indexOf(_comboee.post.actionStateId) != -1 
                ){ found = true; break; }
            } else if( comboerActionState ){
                if( comboerStates.indexOf(_comboer.post.actionStateId) != -1 ){ found = true; break; }
            } else if( comboeeActionState ){
                if( comboeeStates.indexOf(_comboee.post.actionStateId) != -1 ){ found = true; break; }
            }

            if( comboerYPos){
                const _comboer = currentFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)
                if( _comboer.post.positionY > comboerYPos ){ found = true; break; }
            }
            if( comboeeYPos){
                const _comboee = currentFrame.players.find(p => p && p.post.playerIndex == comboee.playerIndex)
                if( _comboee.post.positionY < comboeeYPos ){ found = true; break; }
            }
    
        }
        if(exclude){
            return !found
        } else {
            return found
        }
    }) 
}
