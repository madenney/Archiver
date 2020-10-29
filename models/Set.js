const { Game } = require("./Game")

class Set {

    constructor(setJSON,tournament){
        this.id = setJSON.id;
        this.completedAt = setJSON.completedAt;
        this.fullRoundText = setJSON.fullRoundText;
        this.event = setJSON.event;
        this.winnerTag = setJSON.winnerTag;
        this.loserTag = setJSON.loserTag;
        this.winnerScore = setJSON.winnerScore;
        this.loserScore = setJSON.loserScore;
        this.winnerMains = setJSON.winnerMains;
        this.loserMains = setJSON.loserMains;
        this.winnerColors = setJSON.winnerColors;
        this.loserColors = setJSON.loserColors;
        this.isLinked = setJSON.isLinked;
        this.tournament = tournament;
        if( setJSON.games ){
            this.games = [];
            setJSON.games.forEach(gameJSON => {
                this.games.push( new Game(gameJSON,tournament));
            })
        }
    }

    generateJSON(){
        return {
            id: this.id,
            completedAt: this.completedAt,
            fullRoundText: this.fullRoundText,
            event: this.event,
            winnerTag: this.winnerTag,
            loserTag: this.loserTag,
            winnerScore: this.winnerScore,
            loserScore: this.loserScore,
            winnerMains: this.winnerMains,
            loserMains: this.loserMains,
            winnerColors: this.winnerColors,
            loserColors: this.loserColors,
            games: this.games.map(g=>g.generateJSON()),
            isLinked: this.isLinked
        }
    }

    // old constructor 4/3
    // constructor( games ) {
    //     this.player1 = games[0].player1
    //     this.player2 = games[0].player2
    //     this.games = games
    // }

    convertToVideo(){
    	
    }

    print(){
    	console.log("\n-------------- Set --------------")
    	console.log(`${this.player1} vs ${this.player2}`)
    	console.log(`Number of Games: ${this.games.length}`)
        console.log("---------------------------------\n")
    }

    getFileName(){
    	return `${this.player1} vs ${this.player2}`
    }

}

module.exports = { Set }