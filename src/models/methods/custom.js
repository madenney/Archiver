
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

            case "7": // shine TURNAROUND bair
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

            default:
                throw "Error: No custom filter option selected"
        }
    })
    return results
}