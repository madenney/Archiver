const { SlippiGame } = require("@slippi/slippi-js");
const {actionStates} = require("../../constants/actionStates")

export default (prev, params, eventEmitter) => {
    return prev.results.slice(0,10).filter( ( result, index ) => {

        if( index % 20 == 0 ) eventEmitter({msg: `${index}/${prev.results.length}`})

        const { path, comboer, comboee, startFrame, endFrame } = result
        const { startFrom, searchRange, comboerActionState, comboeeActionState } = params
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
        const _searchRange = parseInt(searchRange)
        const _startFrame = startFrom > -1 ? frames[startFrame + _startFrom] : frames[endFrame + _startFrom]

        let comboerStates, comboeeStates
        if( comboerActionState ){ comboerStates = actionStates.find(s=>s.id == comboerActionState).actionStateID }
        comboerStates = Array.isArray(comboerStates) ? comboerStates : [comboerStates]
        if( comboeeActionState ){ comboeeStates = actionStates.find(s=>s.id == comboeeActionState).actionStateID }
        comboeeStates = Array.isArray(comboeeStates) ? comboeeStates : [comboeeStates]

        for(let i = _startFrame.frame; 
            (_searchRange > -1 ? 
            ((i <= _startFrame.frame + _searchRange) && ( i < lastFrame - 1 ))
            : ( i >= _startFrame.frame + _searchRange ));
            _searchRange > -1 ? i++ : i--
        ){
            const currentFrame = frames[i.toString()]
            let _comboer, _comboee
            if( comboerActionState ) _comboer = currentFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)
            if( comboeeActionState ) _comboee = currentFrame.players.find(p => p && p.post.playerIndex == comboee.playerIndex)

            if( comboerActionState && comboeeActionState ){

                if( comberStates.indexOf(_comboer.post.actionStateId) != -1 
                    && comboeeStates.indexOf(_comboer.post.actionStateId) != -1 
                ) return true
            } else if( comboerActionState ){
                if( comberStates.indexOf(_comboer.post.actionStateId) != -1 ) return true
            } else if( comboeeActionState ){
                if( comboeeStates.indexOf(_comboee.post.actionStateId) != -1 ) return true
            }
        }
        return false
    }) 
}
