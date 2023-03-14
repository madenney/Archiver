
export default (prev, params, eventEmitter) => {
    return prev.results.filter( ( combo, index )  => {
        const { direction } = params
        const { deathDirection } = combo

        if( direction != deathDirection ) return false 

        return {...combo }
    })
}