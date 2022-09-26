


class Pattern {

    constructor(patternJSON){
        this.method = patternJSON.method
        this.results = patternJSON.results
    }

    generateJSON(){
        return {
            method: this.method,
            results: this.results
        }
    }
}

module.exports = { Pattern }