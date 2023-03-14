const { SlippiGame } = require("@slippi/slippi-js");
const {actionStates} = require("../../constants/actionStates")

const starKOs = [3,4,5,6,7,8,9,10]

export default (prev, params, eventEmitter) => {
    return prev.results.map( ( clip, index )  => {
        const { path, comboee, startFrame, endFrame } = clip
        if( index % 100 == 0 ) eventEmitter({msg: `${index}/${prev.results.length}`})

        const game = new SlippiGame( path )
        let frames
        try {
            frames = game.getFrames()
        } catch(e){
            console.log(e)
            console.log("Broken file:", path)
            return null
        }
        // Lets just assume star KO frames happen at the end of the clip
        // find them and work backwards
        let newEndFrame
        for(var i = parseInt(endFrame); i > parseInt(startFrame); i-- ){
            const currentFrame = frames[i];
            const _comboee = currentFrame.players.find(p=>p&&(p.post.playerIndex == comboee.playerIndex))
            if(starKOs.indexOf(_comboee.post.actionStateId) > -1 ){
                newEndFrame=i-1
            } else { break }
        }

        return {
            ...clip,
            endFrame: newEndFrame ? newEndFrame + 5 : endFrame
        }
    })
}