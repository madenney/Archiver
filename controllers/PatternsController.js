

const { Pattern } = require("../models/Pattern")

class PatternsController {

    constructor(archive){
        this.archive = archive
    }
    load(){
        console.log("Loading Patterns Tab")

        this.assignClickListeners()
    }

    assignClickListeners(){

    }

}

module.exports = { PatternsController }