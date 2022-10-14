const { SlippiGame } = require("@slippi/slippi-js");

export default (prev, params, eventEmitter) => {
    const results = []
    prev.results.slice(0,params.maxFiles).forEach( (file, index) => {
        const { minHits, maxFiles, comboerChar, comboerTag, comboeeChar, comboeeTag, didKill } = params
        if(index % 100 == 0 ) eventEmitter({msg: `${index}/${maxFiles ? maxFiles : prev.results.length}`})

        const { path, players, stage } = file
        const game = new SlippiGame( path )
        let combos
        try {
            combos = game.getStats().combos 
        } catch(e){
            return console.log("Broken file:", file)
        }
        const filteredCombos = []
        combos.forEach( combo => {
            if(minHits && combo.moves.length < minHits ) return false
            const comboer = players.find(p => p.playerIndex == combo.moves[0].playerIndex)
            const comboee = players.find(p => p.playerIndex == combo.playerIndex )
            if( comboerChar && comboerChar != comboer.characterId) return false
            if( comboerTag && comboerTag != comboer.displayName.toLowerCase()) return false
            if( comboeeChar && comboeeChar != comboee.characterId) return false
            if( comboeeTag && comboeeTag != comboee.displayName.toLowerCase()) return false
            if( didKill && !combo.didKill ) return false

            filteredCombos.push({
                comboer,
                comboee,
                path,
                stage,
                ...combo
            })
        })
        filteredCombos.forEach(c => results.push(c))
    })
    return results
}