


export default (prev, params, eventEmitter) => {
    
    const { sortFunction, reverse } = params
    if(!sortFunction) throw "Error: sortFunction undefined"

    const sortFunctions = {
        betweenMoves: ( combo_A, combo_B ) => {
            let a, b
            const n = parseInt(params.n)
            if(n >= 0 ){
                a = combo_A.moves[n+1].frame - combo_A.moves[n].frame
                b = combo_B.moves[n+1].frame - combo_B.moves[n].frame
            } else {
                a = combo_A.moves[combo_A.moves.length + n].frame - combo_A.moves[combo_A.moves.length + n - 1 ].frame
                b = combo_B.moves[combo_B.moves.length + n].frame - combo_B.moves[combo_B.moves.length + n - 1 ].frame
            }
            if( reverse ){
                return b - a
            } else {
                return a - b 
            }
        },
        dps: ( combo_A, combo_B ) => {
            
            const { moves: moves_A } = combo_A
            const totalDamage_A = moves_A.reduce((total, move) => {
                return total + move.damage
            }, 0)
            const dps_A = totalDamage_A / ( combo_A.endFrame - combo_A.startFrame )
        
            const { moves: moves_B } = combo_B
            const totalDamage_B = moves_B.reduce((total, move) => {
                return total + move.damage
            }, 0)
            const dps_B = totalDamage_B / ( combo_B.endFrame - combo_B.startFrame )
        
            if( reverse ){
                return dps_A - dps_B
            } else {
                return dps_B - dps_A 
            }
        },
        moves: ( combo_A, combo_B ) => {
            return combo_A.moves.length - combo_B.moves.length
        },
        damage: ( combo_A, combo_B ) => {
            const damageA = combo_A.moves.reduce(((t,n) => t+n),0)
            const damageB = combo_B.moves.reduce(((t,n) => t+n),0)
            return damageA - damageB
        },
        endDamage: ( combo_A, combo_B ) => {
            const damageA = combo_A.endPercent
            const damageB = combo_B.endPercent
            if( reverse ){
                return damageA - damageB
            } else {
                return damageB - damageA
            }
        },
        x: ( combo_A, combo_B ) => {
            if( reverse ){
                return combo_B.x - combo_A.x
            } else {
                return combo_A.x - combo_B.x 
            } 
        },
        y: ( combo_A, combo_B ) => { 
            if( reverse ){
                return combo_B.y - combo_A.y
            } else {
                return combo_A.y - combo_B.y 
            }
        },
        d: ( combo_A, combo_B ) => {
            if( reverse ){
                return combo_B.d - combo_A.d
            } else {
                return combo_A.d - combo_B.d 
            } 
        }
    }
    


    if(!sortFunctions[sortFunction]) throw "Error: sort function not found"
    const copy = prev.results.map(result => {return {...result}})
    return copy.sort(sortFunctions[sortFunction])
}
