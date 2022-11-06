// sort
export default (prev, params, eventEmitter) => {

    const sortedResults = prev.results.sort( ( combo_A, combo_B )  => {
        
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

        return dps_B - dps_A
        
    })
    console.log("BUTTHOELS", sortedResults)
    return sortedResults
}