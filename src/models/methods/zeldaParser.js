const { SlippiGame } = require("@slippi/slippi-js");

export default (prev, params, eventEmitter) => {
    const results = []
    const { maxFiles } = params
    prev.results.slice(0,maxFiles==""?undefined:parseInt(maxFiles)).forEach( (file, index) => {
        const { minHits, comboerChar, comboerTag, comboeeChar, comboeeTag, didKill } = params
        if(index % 100 == 0 ) eventEmitter({msg: `${index}/${maxFiles ? maxFiles : prev.results.length}`})

        const { path, players, stage } = file
        const game = new SlippiGame( path )

        // check for sheik or zelda
        if(!players.find( p => ( p.characterId == 18 || p.characterId == 19 ))) return false

        let combos
        try {
            combos = game.getStats().combos 
        } catch(e){
            return console.log("Broken file:", file)
        }
        let frames
        try {
            frames = game.getFrames() 
        } catch(e){
            return console.log("Broken file:", file)
        }
        const filteredCombos = []
        combos.forEach( combo => {
            if(minHits && combo.moves.length < minHits ) return false
            const comboerPlayerIndex = combo.moves[0].playerIndex
            const comboerCharId = frames[combo.startFrame].players.find(p=>(p&&p.pre.playerIndex==comboerPlayerIndex)).post.internalCharacterId
            //console.log("COMBOER CHAR ID: ", comboerCharId)
            if( comboerCharId != 19 ) return false
            console.log("FOUND ZELDA: ", combo)
            const comboer = players.find(p => p.playerIndex == combo.moves[0].playerIndex)
            const comboee = players.find(p => p.playerIndex == combo.playerIndex )
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