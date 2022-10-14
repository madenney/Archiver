
export default (prev, params, eventEmitter) => {
    return prev.results.filter( ( combo, index )  => {
        if(index % 100 == 0) eventEmitter({msg: `${index}/${prev.results.length}`})
        const { minHits, maxHits, minDamage, comboerChar, comboerTag, comboeeChar, comboeeTag, comboStage, didKill, nthMoves } = params
        const { moves, comboer, comboee, path, stage } = combo
        if(minHits && moves.length < minHits ) return false
        if(maxHits && moves.length > maxHits ) return false
        if( minDamage && !(moves.reduce((n,m) => n + m.damage ,0) >= minDamage)) return false;
        if( comboerChar && comboerChar != comboer.characterId) return false
        if( comboerTag && comboerTag != comboer.displayName.toLowerCase()) return false
        if( comboeeChar && comboeeChar != comboee.characterId) return false
        if( comboeeTag && comboeeTag != comboee.displayName.toLowerCase()) return false
        if( comboStage && comboStage != stage ) return false
        if( didKill && !combo.didKill ) return false
        if( nthMoves && nthMoves.length > 0 ){
            if(!nthMoves.every( nthMove => {
                const n = parseInt(nthMove.n)
                if( n >= 0 ){
                    return moves[n].moveId == nthMove.moveId
                } else {
                    return moves[moves.length+n].moveId == nthMove.moveId
                }
            })) return false
        }

        return {
            comboer,
            comboee,
            path,
            stage,
            ...combo
        }
    })
}