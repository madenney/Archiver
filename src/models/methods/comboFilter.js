
export default (prev, params, eventEmitter) => {
    return prev.results.filter( ( combo, index )  => {
        const { minHits, maxHits, minDamage, comboerChar, comboerTag, comboeeChar, comboeeTag, comboStage, didKill, excludeICs, nthMoves } = params
        const { moves, comboer, comboee, path, stage } = combo
        if(minHits && moves.length < minHits ) return false
        if(maxHits && moves.length > maxHits ) return false
        if( minDamage && !(moves.reduce((n,m) => n + m.damage ,0) >= minDamage)) return false;
        if( excludeICs && comboer.characterId == 14 ) return false
        if( comboerChar && comboerChar != comboer.characterId) return false
        if( comboerTag && comboerTag != comboer.displayName.toLowerCase()) return false
        if( comboeeChar && comboeeChar != comboee.characterId) return false
        if( comboeeTag && comboeeTag != comboee.displayName.toLowerCase()) return false
        if( comboStage && comboStage != stage ) return false
        if( didKill && !combo.didKill ) return false
        if( nthMoves && nthMoves.length > 0 ){
            if(!nthMoves.every( nthMove => {
                const n = parseInt(nthMove.n)
                const t = parseInt(nthMove.t)
                const d = parseInt(nthMove.d)

                if( isNaN(n) ){
                    // c for 'contains'
                    if( nthMove.n == "c"){
                        const move = moves.find((move,index) => {
                            if(move.moveId != nthMove.moveId) return false
                            if(d && move.damage > d) return false
                            if(t && moves[index-1]){
                                if( (move.frame - moves[index-1].frame) > t ) return false
                            }
                            return true
                        })
                        if(!move) return false
                    }
                    // e for 'every'
                    if( nthMove.n == "e"){
                        const every = moves.every((move,index) => {
                            if(move.moveId != nthMove.moveId) return false
                            if(d && move.damage < d) return false
                            if(t && moves[index-1]){
                                if( (move.frame - moves[index-1].frame) > t ) return false
                            }
                            return true
                        })
                        if(!every) return false
                    }
                } else if( n >= 0 ){
                    if( !moves[n]) return false
                    if(moves[n].moveId != nthMove.moveId) return false
                    if(d && moves[n].damage < d ) return false
                    if(t && moves[n-1]){
                        if((moves[n].frame - moves[n-1].frame) > t ) return false
                    }
                } else {
                    if( !moves[moves.length+n]) return false
                    if( moves[moves.length+n].moveId != nthMove.moveId ) return false
                    if(d && moves[moves.length+n].damage < d ) return false
                    if(t && moves[moves.length+n-1]){
                        if((moves[moves.length+n].frame - moves[moves.length+n-1].frame) > t ) return false
                    }
                }
                return true
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