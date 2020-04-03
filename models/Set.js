
class Set {

    constructor(setJSON){
        this.id = setJSON.id;
        this.player1 = setJSON.player1;
        this.player2 = setJSON.player2;
        this.winner = setJSON.winner;
        this.score = setJSON.score;
        this.timestamp = setJSON.timestamp;
        this.smashggId = setJSON.smashggId;
        
        if( setJSON.games ){
            this.games = [];
            setJSON.games.forEach(game => {
                this.games.push( new Game( game ));
            })
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