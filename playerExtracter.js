
console.log("BUTT")

const fs = require("fs")
const json = {
	players: []
}

var lineReader = require('readline').createInterface({
  input: fs.createReadStream('butt')
});

lineReader.on('line', function (line) {
    if( line.indexOf("data-player_name") != -1 ){
       	let playerTag = line.slice( line.indexOf("data-player_name=")+18, -2 )
    	while( playerTag.indexOf("|") > -1 ){
    		playerTag = playerTag.slice( playerTag.indexOf("|") + 2 )
    	}
    	json.players.push({
    		tag: playerTag,
    		mains: []
    	})
    }
});

// setTimeout(() => {
// 	console.log("TOTALL: ", json.players.length )
//    	const file = fs.createWriteStream( "players.txt" , {flags: 'a'})
//    	json.players.forEach( player => {
//    		file.write(`${player.tag}\n`)
//    	})
//     file.end()
// }, 2000 )

setTimeout(() => {
	console.log("TOTAL: ", json.players.length )
    fs.writeFileSync( "./players.json", JSON.stringify( json ) )

}, 2000 )