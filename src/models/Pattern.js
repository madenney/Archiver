
const { SlippiGame } = require("@slippi/slippi-js");
const rectangles = require("../constants/rectangles")
const { getDistance } = require("../lib").default
const damageStates = [0x4B,0x4C,0x4D,0x4E,0x4F,0x50,0x51,0x52,0x53,0x54,0x55,0x56,0x57,0x58,0x59,0x5A,0x5B]
const shineStates = [360,361,362,363,364,365,366,367,368]
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
