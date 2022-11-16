
const methods = require("./methods/index").default

class Pattern {

    constructor(patternJSON){
        this.id = patternJSON.id
        this.isActive = patternJSON.isActive ? patternJSON.isActive : false
        this.isProcessed = patternJSON.isProcessed ? patternJSON.isProcessed : false
        this.type = patternJSON.type
        this.label = patternJSON.label
        this.params = patternJSON.params ? patternJSON.params : {}
        this.results = patternJSON.results ? patternJSON.results : []
    }

    run(prev, eventEmitter){
        console.log("Prev: ", prev)
        this.results = methods[this.type](prev, this.params, eventEmitter)
        console.log("Results: ", this.results)
    }

    generateJSON(){
        return {
            id: this.id,
            isActive: this.isActive,
            isProcessed: this.isProcessed,
            type: this.type,
            label: this.label,
            params: this.params,
            results: this.results
        }
    }

}

export default Pattern
