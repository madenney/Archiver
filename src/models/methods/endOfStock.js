const { SlippiGame } = require("@slippi/slippi-js");

export default (prev, params, eventEmitter) => {

    const results = []
    prev.results.forEach( (file, index) => {

        const { maxFiles, comboerChar, comboeeChar, frameWindow } = params
        if(parseInt(maxFiles) && index > parseInt(maxFiles) ) return 
        if( index % 1000 == 0 ) eventEmitter({msg: `${index}/${prev.results.length}`})
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
                deathDirection: getDeathDirection(stock.deathAnimation),
                path,
                stage,
                endFrame: stock.endFrame,
                startFrame: stock.endFrame - frameWindow
            })
        })
    })
    return results
}

function getDeathDirection(actionStateId) {
    if (actionStateId > 0xa) {
        return null;
    }
    switch (actionStateId) {
        case 0:
            return 'down';
        case 1:
            return 'left';
        case 2:
            return 'right';
        default:
            return 'up';
    }
}