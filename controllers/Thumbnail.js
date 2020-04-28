const {PythonShell} = require ("python-shell");

class ThumbnailController{

    constructor(set){
        this.generateThumbnail(set);
    }

    generateThumbnail(set){
        //will probably have to change this later
        this.tournamentName = "Half Moon 69";
        //TODO add functionality for round names (will have to change Set.js and setTemplate.json)
        this.roundName = "Grand Finals";
        //TODO change so that player1 and 2 are based on ports
        this.player1 = "Nash";
        this.player2 = "Mad Matt";
        this.mains1 = "Marth";
        this.mains2 = "Falco";
        this.output = "./test_files/test.png";

        let options = {
            mode: "text",
            pythonOptions: ["-u"],
            scriptPath: "./python",
            args: [this.tournamentName, 
                    this.roundName, 
                    this.player1, 
                    this.player2, 
                    this.mains1, 
                    this.mains2, 
                    this.output]
        };

        PythonShell.run("thumbnail.py", options, function(err, results){
            if (err) throw err;
            console.log("results: %j", results);
        });
    }

}

module.exports = { ThumbnailController };