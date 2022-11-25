const { SlippiGame } = require("@slippi/slippi-js");

export default (prev, params, eventEmitter) => {

    const results = []
    prev.results.forEach( (file, index) => {

        // ToDo, add death directions functionality
        const { maxFiles, comboerChar, comboeeChar, frameWindow, deathDirections } = params
        if(parseInt(maxFiles) && index > parseInt(maxFiles) ) return 
        eventEmitter({msg: `${index}/${prev.results.length}`})
        const { path, players, stage } = file
        const game = new SlippiGame( path )
        let stocks
        try {
            stocks = game.getStats().stocks
        } catch(e){
            console.log(e)
            return console.log("Broken file:", file)
        }
        
        stocks.forEach( stock => {

            if(!stock.endFrame) return false

            const comboee = players.find(p => p.playerIndex == stock.playerIndex)
            const comboer = players.find(p => p.playerIndex != stock.playerIndex )
            if( comboerChar && comboerChar != comboer.characterId) return false
            if( comboeeChar && comboeeChar != comboee.characterId) return false

            results.push({
                comboer,
                comboee,
                path,
                stage,
                endFrame: stock.endFrame,
                startFrame: stock.endFrame - frameWindow
            })
        })
    })
    return results
}