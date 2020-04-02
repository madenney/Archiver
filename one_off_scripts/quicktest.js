
console.log("HEY")
const path = require("path")
const slpParser = require("../parser")

const { 
	getDirectories,
	getFiles
} = require("../lib")

const vodsDir = "./rawSlp50"

let count = 0

const getInfoFromSlpFile = function( file ){
	const game = new slpParser.default( file )

	// check settings for indicators of invalid game
	const settings = game.getSettings()
	const p1 = settings.players[0]
	const p2 = settings.players[1]
	

	// check metadata for indicators of invalid game
	const metadata = game.getMetadata()
	const length = metadata.lastFrame / 60 
	

	// check stats for indicators of invalid game
	const { overall, stocks, gameComplete, conversions } = game.getStats()
	
	const p1Stocks = stocks.filter( stock => stock.playerIndex === p1.playerIndex )
	const p2Stocks = stocks.filter( stock => stock.playerIndex === p2.playerIndex )
	


	// Get Winner
	let winner
	if( p1Stocks.length < 4 ){ winner = p1Stocks[0].playerIndex }
	if( p2Stocks.length < 4 ){ winner = p2Stocks[0].playerIndex }
	if( typeof winner === "undefined" ){
		// if both last stocks ended on null, game must have ended with pause
		if( !p1Stocks[3].endFrame && !p2Stocks[3].endFrame){
			// assume winner was last player to win a conversion
			winner = conversions[conversions.length-1].playerIndex
		} else {
			if( !p1Stocks[3].endFrame ){ 
				winner = p1Stocks[0].playerIndex 
			} else {
				winner = p2Stocks[0].playerIndex
			}
		}
	}

	if( typeof winner === "undefined" ){ throw "Error: Somehow didn't determine a winner." } 

	return {
		startAt: metadata.startAt,
		startAtTimestamp: new Date(metadata.startAt).getTime(),
		length: Math.floor( metadata.lastFrame / 60 ),
		stageId: settings.stageId,
		winner: winner,
		players: [{
			playerIndex: p1.playerIndex,
			port: p1.port,
			characterId: p1.characterId,
			characterColor: p1.characterColor,
			nametag: p1.nametag
		},{
			playerIndex: p2.playerIndex,
			port: p2.port,
			characterId: p2.characterId,
			characterColor: p2.characterColor,
			nametag: p2.nametag
		}]
	}


}

getDirectories( vodsDir ).forEach( directory => {
    const dirname = directory.split("\\").pop()
    getFiles( directory ).forEach( file => {
        if( count > 0 ){ return }
        console.log(`----${count++}----`)
        console.log("FILE: ", file )
        const absFilePath = path.resolve( directory, file )
        const info = getInfoFromSlpFile( absFilePath )
        console.log("INFO", info)

    })
})