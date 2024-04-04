


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
        betweenMoves2: ( combo_A, combo_B ) => {
            let a, b
            a = combo_A.moves[combo_A.moves.length -1].frame - combo_A.moves[combo_A.moves.length -3 ].frame
            b = combo_B.moves[combo_B.moves.length -1].frame - combo_B.moves[combo_B.moves.length -3 ].frame
            
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
            if( reverse ){
                return combo_A.moves.length - combo_B.moves.length
            } else {
                return combo_B.moves.length - combo_A.moves.length
            }
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
        absx: ( combo_A, combo_B ) => {
            if( reverse ){
                return Math.abs(combo_B.x) - Math.abs(combo_A.x)
            } else {
                return Math.abs(combo_A.x) - Math.abs(combo_B.x) 
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
        },
        firstStock: (a,b)=>{
            let a0 = a.stocks[0].endFrame
            let a1 = a.stocks[1].endFrame
            if(a0 === null) a0 = a.lastFrame
            if(a1 === null) a1 = a.lastFrame
            let lowA = Math.min(a0,a1)


            let b0 = b.stocks[0].endFrame
            let b1 = b.stocks[1].endFrame
            if(b0 === null) b0 = b.lastFrame
            if(b1 === null) b1 = b.lastFrame
            let lowB = Math.min(b0,b1)
            

            return lowA - lowB
        },
        length: ( combo_A, combo_B ) => {
            //let b = combo_B.moves[combo_B.moves.length-1].frame - combo_B.moves[0].frame 

            let a = combo_A.endFrame - combo_A.startFrame
            let b = combo_B.endFrame - combo_B.startFrame 
            return a - b
        }
    }
    


    if(!sortFunctions[sortFunction]) throw "Error: sort function not found"
    const copy = prev.results.map(result => {return {...result}})
    return copy.sort(sortFunctions[sortFunction])
}
