const { SlippiGame } = require("@slippi/slippi-js");
const damageStates = [0x4B,0x4C,0x4D,0x4E,0x4F,0x50,0x51,0x52,0x53,0x54,0x55,0x56,0x57,0x58,0x59,0x5A,0x5B]
const shineStates = [360,361,362,363,364,365,366,367,368]

export default (prev, params, eventEmitter) => {

    const results = []
    let badCount = 0
    prev.results.forEach( file => {

        const { maxFiles, maxFrames, comboerChar, comboerTag, comboeeChar, comboeeTag } = params
        if(parseInt(maxFiles) && count > parseInt(maxFiles) ) return 
        eventEmitter({msg: `${count++}/${resultsLength}`})
        const { path, players, stage } = file
        const game = new SlippiGame( path )
        let stocks, frames
        try {
            stocks = game.getStats().stocks
            frames = game.getFrames()
        } catch(e){
            console.log(e)
            return console.log("Broken file:", file)
        }
        
        stocks.forEach( stock => {
            const comboee = players.find(p => p.playerIndex == stock.playerIndex)
            const comboer = players.find(p => p.playerIndex != stock.playerIndex )
            if( comboerChar && comboerChar != comboer.characterId) return false
            if( comboerTag && comboerTag != comboer.displayName.toLowerCase()) return false
            if( comboeeChar && comboeeChar != comboee.characterId) return false
            if( comboeeTag && comboeeTag != comboee.displayName.toLowerCase()) return false

            for( let i = 0; i < maxFrames; i++ ){
                try {

                const currentFrame = frames[ stock.endFrame - i ]
                const attacker = currentFrame.players.find( p => p && p.pre && p.pre.playerIndex == comboer.playerIndex )
                const attackerState = attacker.pre.actionStateId
                const defender = currentFrame.players.find( p => p && p.pre && p.pre.playerIndex == comboee.playerIndex )
                const defenderState = defender.pre.actionStateId
                if( (shineStates.indexOf(attackerState) > -1 )
                    && (damageStates.indexOf(defenderState) > -1) ){
                        const d = getDistance(attacker.pre.positionX, attacker.pre.positionY, defender.pre.positionX, defender.pre.positionY)
                        if( d > 25 ) return false
                        const deadFrame = frames[stock.endFrame + 3 ]
                        if( deadFrame && deadFrame.players.find( p => p && p.pre && p.pre.playerIndex == comboee.playerIndex ).post.actionStateId != 0 ) return false
                        console.log("Found One", d)
                        this.results.push({
                            comboer,
                            comboee,
                            path,
                            stage,
                            startFrame: stock.endFrame - i,
                            endFrame: stock.endFrame
                        })
                        break
                }
                } catch (e){
                    console.log(e)
                    console.log(currentFrame)
                    badCount++
                }

            }
        })
    })
    console.log("Bad Count: ", badCount)
    return results
}