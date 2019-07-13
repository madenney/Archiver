
class Set {

    constructor( games ) {
        this.player1 = games[0].player1
        this.player2 = games[0].player2
        this.games = games
    }

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