const {PythonShell} = require ("python-shell");

class ThumbnailController{

    constructor(set){
        this.generateThumbnail(set);
    }

    //TODO change names I'm too lazy now
    concatenated(mains){
        var mainsString = "";
        for(var i = 0; i < mains.length; i++){
            mainsString += mains[i];
            mainsString += ",";
        }
        mainsString.slice(0, -1);
        return mainsString
    }

    generateThumbnail(set){
        //will probably have to change this later
        this.tournamentName = set.event;
        //TODO add functionality for round names (will have to change Set.js and setTemplate.json)
        this.roundName = "Grand Finals";
        //TODO change so that player1 and 2 are based on ports
        this.player1 = set.winnerTag;
        this.player2 = set.loserTag;
        //TODO pass up to 5 mains
        this.mains1 = this.concatenated(set.winnerMains);
        this.mains2 = this.concatenated(set.loserMains);
        this.colors1 = this.concatenated(set.winnerColors);
        this.colors2 = this.concatenated(set.loserColors);
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
                    this.colors1,
                    this.colors2,
                    this.output]
        };

        PythonShell.run("thumbnail.py", options, function(err, results){
            if (err) throw err;
            console.log("results: %j", results);
        });
    }

}

module.exports = { ThumbnailController };