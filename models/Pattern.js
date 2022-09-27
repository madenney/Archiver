
const patternTypes = ["slpParser","combo","edgeguard","single","custom"]

class Pattern {

    constructor(patternJSON){
        this.id = patternJSON.id
        this.active = patternJSON.active
        this.isProcessed = patternJSON.isProcessed
        this.type = patternJSON.type
        this.method = patternJSON.method
        this.results = patternJSON.results ? patternJSON.results : []
    }

    generateJSON(){
        return {
            id: this.id,
            active: this.active,
            isProcessed: this.isProcessed,
            type: this.type,
            method: this.method,
            results: this.results
        }
    }

}

module.exports = { Pattern }