
export default (prev, params, eventEmitter) => {
    return prev.results.filter( ( combo, index )  => {
        const {} = params
        const { moves, comboer, comboee, path, stage } = combo

        

        return {
            comboer,
            comboee,
            path,
            stage,
            ...combo
        }
    })
}