
// this is only meant to console log out stats about combos
// Doesn't modify data


export default (prev, params, eventEmitter) => {

    const variations = []
    prev.results.forEach( ( combo, index )  => {
        //if(index % 1 == 0) eventEmitter({msg: `${index}/${prev.results.length}`})
        //const { depth } = params
        const { moves } = combo
        const variation = variations.find( variation => {
            if( variation.moves.length != moves.length ) return false
            for( let i = 0; i < moves.length; i++ ){
                if( moves[i].moveId != variation.moves[i] ) return false
            }
            return true
        })

        if( variation ){
            variation.combos.push(combo)
        } else {
            variations.push({
                moves: moves.map( move => move.moveId ),
                combos: [combo]
            })
        }
        
    })
    console.log("Total Variations: ", variations.length )
    variations.sort((a,b) => {
        return b.combos.length - a.combos.length
    })
    console.log(variations.slice(0,100))
    return prev.results
}