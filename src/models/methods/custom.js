
export default (prev, params, eventEmitter) => {
    return prev.results.filter( ( combo, index )  => {
        const {} = params
        const { moves, comboer, comboee, path, stage } = combo

        // find thunder's combo
        const thunders = moves.find((move, index) => {
            if( moves[index+1] && moves[index + 2]){
                if( move.moveId == 21 && moves[index+1].moveId == 2 &&
                (moves[index+2].moveId == 16 || moves[index+2].moveId == 11)
                    ) return true
            }
        })
        if(!thunders) return false
        

        return {
            comboer,
            comboee,
            path,
            stage,
            ...combo
        }
    })
}