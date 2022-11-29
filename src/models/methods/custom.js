
const { SlippiGame, ConnectionEvent } = require("@slippi/slippi-js");

export default (prev, params, eventEmitter) => {
    const results = []
    const { maxFiles } = params
    console.log("MAX FILES: ", maxFiles )
    console.log(prev.results.length)
    prev.results.slice(0,maxFiles==""?undefined:parseInt(maxFiles)).forEach( ( combo, index )  => {
        if( index % 1 == 0 ) eventEmitter({msg: `${index}/${maxFiles ? maxFiles : prev.results.length}`})

        const { n, x } = params
        const { moves, comboer, comboee, path, stage } = combo
        switch ( n ){
            case "1": // thunder's combo
                const potentialThunders = moves.find((move, index) => {
                    if( move.moveId != 21 ) return false
                    //if( moves[index+1] && moves[index+1].moveId == 16 ) return true
                    return true
                })
                if(!potentialThunders) return false
                const game = new SlippiGame( path )
                let frames
                try {
                    frames = game.getFrames()
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
                    const currentFrame = frames[i]
                    if(!currentFrame) break
                    const _comboee = currentFrame.players.find(p => p && p.post.playerIndex == comboee.playerIndex)
                    const _comboer = currentFrame.players.find(p => p && p.post.playerIndex == comboer.playerIndex)

                    if(missedTechDamage.indexOf(_comboee.post.actionStateId) == -1 ) continue

                    const prevFrame = frames[i-2]
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
                    const currentFrame = frames[i]
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

            default:
                throw "Error: No custom filter option selected"
        }
    })
    return results
}