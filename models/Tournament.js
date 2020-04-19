
const path = require("path")
const fs = require("fs")
//const rimraf = require("rimraf")
const { spawn, exec } = require('child_process');
const taskkill = require('taskkill');
// const handbrake = require('handbrake-js')
// const fluent_ffmpeg = require("fluent-ffmpeg");
// const concat = require('ffmpeg-concat')
// const ffmpeg = require("ffmpeg")
//const graphQl = require('graphQl-client')
const uuidv4 = require("uuid/v4")

const { tournamentQuery, eventsQuery } = require("../constants/smashggQueries")

const {
    getSlpFilePaths,
	getDirectories,
	getFiles,
    asyncForEach,
    createDir,
    removeSponsor,
    getInfoFromSlpFile
} = require("../lib")

const { Game } = require("./Game")
const { Set } = require("./Set")
const  setTemplate = JSON.parse( fs.readFileSync(path.resolve("models/jsonTemplates/setTemplate.json")));
const  gameTemplate = JSON.parse( fs.readFileSync(path.resolve("models/jsonTemplates/gameTemplate.json")));
const { players } = JSON.parse( fs.readFileSync("./constants/players.json"))

const smashGGReportTimeTolerance = 180 * 1000

const finalOutputDir = path.resolve("./output51")
const tempSlpPath = path.resolve( "./tempSlp")
const tempFLVOutputPath = path.resolve( "./tempFLVOutput")
const errorLogPath = path.resolve("./error.txt")
const rawVodsPath = path.resolve("./rawVods")
const labelledVodsPath = path.resolve("./labelledVods")
const jsonDir = path.resolve("./jsonTemplates")

class Tournament {

    constructor(tournamentJSON) {
        this.id = tournamentJSON.id;
        this.name = tournamentJSON.name;
        this.timestamp = tournamentJSON.timestamp;
        this.smashGGUrl = tournamentJSON.smashggUrl;
        this.events = tournamentJSON.events;
        this.players = tournamentJSON.players;
        // need to keep these?
        this.unknownPlayers = []

        // loop through sets
        try {
            if( tournamentJSON.sets ){
                this.sets = [];
                tournamentJSON.sets.forEach(setJSON => {
                    this.sets.push( new Set(setJSON) );
                })
            }
            if( tournamentJSON.unlinkedGames ){
                this.unlinkedGames = [];
                tournamentJSON.unlinkedGames.forEach(gameJSON => {
                    this.unlinkedGames.push( new Game(gameJSON) );
                })
            }
        } catch(err){
            console.log("An error occured in Tournament constructor");
            console.log(err);
            throw err;
        }
    }


    addSlpFiles(paths){
        const slpFilesPaths = getSlpFilePaths(paths);
        slpFilesPaths.forEach( slpPath => {
            this.unlinkedGames.push( new Game({
                ...gameTemplate,
                slpPath
            }))
        })
    }

    getAllSlpFiles(){
        const files = [];
        this.sets.forEach(s=>s.games.forEach(g=>files.push(g)));
        this.unlinkedGames.forEach(g=>files.push(g));
        return files;
    }

    generateJSON(){
        return {
            id: this.id,
            name: this.name,
            timestamp: this.timestamp,
            smashggUrl: this.smashGGUrl,
            smashggId: this.smashggId,
            sets: this.sets.map(s=>s.generateJSON()),
            unlinkedGames: this.unlinkedGames.map(g=>g.generateJSON()),
            events: this.events,
            players: this.players
        }
    }

    async init( slpDir, smashGGUrl, tourneyStartTime ){
        console.log("Initializing tournament")
        this.slpDir = slpDir
        this.tourneyStartTime = tourneyStartTime
        // create tournament.json
        if( !fs.existsSync( path.resolve( slpDir, "tournament.json"))){
            console.log("Creating tournament.json")
            const json = JSON.parse( fs.readFileSync( path.resolve( jsonDir, "main.json")))
            json.tourneyStartTime = tourneyStartTime.toString()
            json.smashGGUrl = smashGGUrl
            this.json = json
            this.saveJSON()
        } else {
            console.log("Found existing tournament.json")
            this.json = JSON.parse( fs.readFileSync( path.resolve( slpDir, "tournament.json")))
        }
    }

    connectSlpFiles(){
        this.json.slpFiles = []
        let fileCount = 0
        const files = getDirectories( this.slpDir ).forEach( d => getFiles(d).forEach( f => fileCount++ ) )
        let count = 0
        console.log("Connecting SLP Files...")
        getDirectories( this.slpDir ).forEach( directory => {
            const dirname = directory.split("\\").pop()
            getFiles( directory ).forEach( file => {
                process.stdout.clearLine()
                process.stdout.cursorTo(0)
                process.stdout.write(`Progress: ${count++}/${fileCount}`)
                const absFilePath = path.resolve( directory, file )
                const info = getInfoFromSlpFile( absFilePath )

                // Check if file was recorded before tournament started
                if( !info.invalid ){
                    info.uuid = uuidv4();
                    if( this.tourneyStartTime > info.startAtTimestamp ){
                        info.isFriendly = true
                        info.reason = "Happened before tournament"
                    }
                }
                
                this.json.slpFiles.push({
                    path: absFilePath,
                    setup: dirname,
                    ...info
                })
            })
        })
        console.log("---")
        this.saveJSON()
    }

    async getSmashGGResults( tourneyUrl ){

        const tourneySlug = this.extractTourneySlug( tourneyUrl )

        const smashGGQL = graphQl({
          url: 'https://api.smash.gg/gql/alpha',
          headers: {
            Authorization: 'Bearer ' + '5d9c8c1a10899f7fa00b66043d74f86d'
          }
        })
        console.log("Getting events from ", tourneySlug)
        try {
            const { data } = await smashGGQL.query(
                tournamentQuery,
                {
                  "slug":tourneySlug
                }
            )

            this.smashggUrl = tourneyUrl;
            this.smashGGID = data.tournament.id
            this.name = data.tournament.name
            this.events = data.tournament.events
        } catch( err ){
            console.log("Something went wrong with smashGG - ", err)
        }

        console.log("Gettings sets from - ", this.name )

        if( !this.events.length ){
            throw `Error: No events found in tournament: ${tourneySlug}`
        }

        try {
            await asyncForEach( this.events, async ( event, eventIndex ) => {

                // get total number of sets in event
                const { data } = await smashGGQL.query(
                    eventsQuery,
                    {
                        "eventId": event.id,
                        "page": 1,
                        "perPage": 1
                    }
                )
                this.events[ eventIndex ] = data.event 
                this.events[ eventIndex ].sets.nodes = []

                // grab sets in groups of 30
                const pages = Math.ceil(data.event.sets.pageInfo.total / 30)
                await asyncForEach( new Array( pages ) , async ( p, index ) => {
                    const { data } = await smashGGQL.query(
                        eventsQuery,
                        {
                          "eventId": event.id,
                          "page": index + 1,
                          "perPage": 30
                        }
                    )
                    this.events[ eventIndex ].sets.nodes = [
                        ...this.events[ eventIndex ].sets.nodes,
                        ...data.event.sets.nodes
                    ]
                })

                // put event and eventId in each individual set
                this.events[ eventIndex ].sets.nodes = this.events[ eventIndex].sets.nodes.map( set => {
                    return {
                        ...set,
                        eventId: this.events[ eventIndex ].id,
                        eventName: this.events[ eventIndex ].name
                    }
                })
            })

            const rawSmashGGSets = this.events.reduce( (sets, event) => [...sets, ...event.sets.nodes], [] )
            this.sets = rawSmashGGSets.map( set => {
                const info = this.digestSmashGGSetInfo( set )
                info.id = uuidv4()
                return new Set({
                    ...setTemplate,
                    ...info,
                    isLinked: false
                });
            })

            return "Success";

        } catch ( err ){
            console.log("ERROR", err )
            console.log(`Error getting sets from event ${event.name} - ID: ${event.id}`)
            throw err
        }

        return
    }

    linkSmashGGResultsToSlpFiles(){
        console.log("Linking sets")
        const { slpFiles, smashGGSets } = this.json
        const linkedSets = []
        const players = JSON.parse( fs.readFileSync( path.resolve("constants/players.json")))

        console.log("Total number of slp files: ", slpFiles.length)
        console.log("Number of smashgg sets: ", smashGGSets.length )

        this.validSlpFiles = slpFiles.filter( file => !file.invalid && !file.isFriendly )
        console.log("Number of unlinked potential files: ", this.validSlpFiles.length )


        smashGGSets.forEach( set => set.potentialSlpSets = [])

        // Round 1. Only confirm sets with a single possibility and zero conflicts with other sets
        console.log("Round 1")
        smashGGSets.forEach( set => {
            set.potentialSlpSets = this.findPotentialSets( set )
        })

        console.log("Sets with zero potential matches: ", smashGGSets.filter( s => s.potentialSlpSets.length === 0 ).length)
        console.log("Sets with one potential match: ", smashGGSets.filter( s => s.potentialSlpSets.length === 1 ).length)
        console.log("Sets with two potential matches: ", smashGGSets.filter( s => s.potentialSlpSets.length === 2 ).length)
        console.log("Sets with three+ potential matches: ", smashGGSets.filter( s => s.potentialSlpSets.length > 2 ).length)

        let conflictCount = 0
        smashGGSets.forEach( set => {
            if( set.potentialSlpSets.length === 1 ){
                const conflictingSmashGGSets = smashGGSets.filter( set2 => {
                    if( set === set2 || set2.isLinked ){ return false }
                    if( set2.potentialSlpSets.length < 1 ){ return false }
                    // Check for the same slp file appearing in both lists of matches
                    return set.potentialSlpSets[0].some( i => {
                        return set2.potentialSlpSets.some( comparedSet => {
                            return comparedSet.some( s => {
                                return i.uuid === s.uuid
                            })
                        })
                    }) 
                })
                if( conflictingSmashGGSets.length > 0 ){
                    conflictCount++
                    console.log("CONFLICTS FOUND")
                } else {
                    console.log("No Conflict. Set Confirmed.")
                    set.isLinked = true
                    set.linkedSlpFiles = set.potentialSlpSets[0].map( p => p.uuid )
                    set.potentialSlpSets[0].forEach( slpSet => {
                        slpSet.isLinked = true
                        slpSet.linkedSet = set.uuid
                    })
                    delete set.potentialSlpSets
                }
            }
        })

        console.log("Number confirmed: ", smashGGSets.filter( set => set.isLinked ).length )
        // smashGGSets.filter( set => set.isLinked ).forEach( set => {
        //     console.log( `Confirmed:  ${set.winnerTag} vs ${set.loserTag}`)
        // })

        console.log("Round 2")
        // smashGGSets.forEach( set => {
        //     set.potentialSlpSets = this.findPotentialSets( set )
        // })

    }


    findPotentialSets( setInfo ){

        const { smashGGSets } = this.json
        // Get all matches that happened before set ended

        let potentialFiles = this.validSlpFiles.filter( file => {
            return !file.invalid && !file.isFriendly && !file.isLinked
                && !(file.startAtTimestamp > setInfo.completedAt + smashGGReportTimeTolerance )
        })

        // TODO - FIND LAST GAME
        // Find players last games if they exist
        // const winnerLastGame = this.getPlayerLastGame( setInfo.winnerTag )
        // const loserLastGame = this.getPlayerLastGame( setInfo.loserTag )
        // ^^^^ TODO ^^^^

        //console.log("Total potential files: ", potentialFiles.length )

        // Filter for files using player mains
        potentialFiles = potentialFiles.filter( file => {
            return ( 
                  setInfo.winnerMains.indexOf( file.players[0].characterId ) > -1 &&
                  setInfo.loserMains.indexOf( file.players[1].characterId ) > -1 
                ) || ( 
                  setInfo.winnerMains.indexOf( file.players[1].characterId ) > -1 &&
                  setInfo.loserMains.indexOf( file.players[0].characterId ) > -1 
            )
        })
        //console.log("After filtering for mains: ", potentialFiles.length )

        if( potentialFiles.length < 2 ){
            //console.log("NO POTENTIAL SETS FOUND... :( ")
            return []
        }

        
        // Split files into sets by checking setup and port
        let sets = []
        let lastFile = potentialFiles[0]
        let currentSet = [lastFile]
        potentialFiles.slice(1).forEach( currentFile => {

            if( lastFile.setup === currentFile.setup &&
                lastFile.players[0].port === currentFile.players[0].port &&
                lastFile.players[1].port === currentFile.players[1].port &&
                !this.isLegitimateFileBetweenFiles( lastFile, currentFile )
            ){
                currentSet.push( currentFile )
                lastFile = currentFile
            } else {
                lastFile = currentFile
                // make sure set is long enough
                if( (( setInfo.winnerScore === 3 ) 
                    && !(currentSet.length > 2)) || !( currentSet.length > 1 )
                ){ 
                    currentSet = [currentFile]
                    return 
                }


                sets.push( currentSet)
                currentSet = [ currentFile ]
            }
        })

        // make sure set is long enough
        if( !((( setInfo.winnerScore === 3 ) 
            && !(currentSet.length > 2)) || !( currentSet.length > 1 ))
        ){ 
            sets.push( currentSet)
        }

        //console.log("Total Potential Sets: ", sets.length )
        ////console.log("SETS", sets )
        // eliminate sets by score and mains
        sets = sets.filter( set => {
            if( set.length !== setInfo.winnerScore + setInfo.loserScore ){ 
                //console.log("SET LENGTH DIDN'T MATCH SCORES ")
                return false 
            }

            const slpPlayer1 = set[0].players[0].playerIndex
            const slpPlayer2 = set[0].players[1].playerIndex
            const slpPlayer1Wins = set.filter( game =>  game.winner.playerIndex === slpPlayer1 ).length
            const slpPlayer2Wins = set.filter( game =>  game.winner.playerIndex === slpPlayer2 ).length
            let slpWinner, slpWinnerScore, slpLoser, slpLoserScore

            if( slpPlayer1Wins > slpPlayer2Wins ){
                slpWinner = slpPlayer1
                slpLoser = slpPlayer2
                slpWinnerScore = slpPlayer1Wins
                slpLoserScore = slpPlayer2Wins
            } else {
                slpWinner = slpPlayer2
                slpLoser = slpPlayer1
                slpWinnerScore = slpPlayer2Wins
                slpLoserScore = slpPlayer1Wins
            }

            if( setInfo.winnerScore !== slpWinnerScore || setInfo.loserScore !== slpLoserScore ){
                //console.log("SCORES DIDN'T MATCH")
                return false
            }
                       
            // make sure the correct main won
            const slpWinnerChars = set.map( game => {
                const winner = game.players.filter( p => p.playerIndex === slpWinner )[0]
                return winner.characterId
            })
            const slpLoserChars = set.map( game => {
                const loser = game.players.filter( p => p.playerIndex === slpLoser )[0]
                return loser.characterId
            })
            if( !slpWinnerChars.every( slpChar => setInfo.winnerMains.indexOf( slpChar ) > -1)){ 
                //console.log("WINNERS MAINS DIDN'T MATCH")
                return false 
            }
            if( !slpLoserChars.every( slpChar => setInfo.loserMains.indexOf( slpChar ) > -1)){ 
                //console.log("LOSERS MAINS DIDN'T MATCH")
                return false 
            }

            return true
        })

        ////console.log("Potential sets after all filters: ", sets )
        return sets
    }

    digestSmashGGSetInfo( set ){
        const info = {
            completedAt: set.completedAt * 1000,
            fullRoundText: set.fullRoundText,
            event: set.eventName
        }
        const p1Tag = removeSponsor( set.slots[0].entrant.name )
        const p1Score = set.slots[0].standing.stats.score.value
        const p2Tag = removeSponsor( set.slots[1].entrant.name )
        const p2Score = set.slots[1].standing.stats.score.value
        const p1Mains = this.getPlayerMains( p1Tag )
        const p2Mains = this.getPlayerMains( p2Tag )
        if( p1Score > p2Score ){
            info.winnerTag = p1Tag
            info.loserTag = p2Tag
            info.winnerScore = p1Score
            info.loserScore = p2Score
            info.winnerMains = p1Mains
            info.loserMains = p2Mains
        } else {
            info.winnerTag = p2Tag
            info.loserTag = p1Tag
            info.winnerScore = p2Score
            info.loserScore = p1Score
            info.winnerMains = p2Mains
            info.loserMains = p1Mains 
        }
        if( set.slots[0].standing.stats.score.value === -1 ||
            set.slots[1].standing.stats.score.value === -1 ){
            info.DQ = true
        }
        return info
    }

    getPlayerMains( playerTag ){
        const lowerCaseTag = playerTag.toLowerCase()
        const player = players.filter( p => p.tag.toLowerCase() === lowerCaseTag )
        if( player.length === 0 ){
            if( this.unknownPlayers.indexOf( playerTag ) === -1 ){
                this.unknownPlayers.push( playerTag )
            }
            return []
            // TODO: Do something about this
        }
        if( player.length > 1 ){
            console.log("Two players with same tag?")
            throw `Error: Found two players with tag: ${playerTag}`
        }
        return player[0].mains
    }

    loadLabelledVods( source ){
    	getDirectories( source ).forEach( vodDirectory => {

    		let games = []
    		getFiles( vodDirectory ).forEach( ( file, index ) => {
                try {
        			const game = new Game({
        				slpFilePath: path.resolve( path.join( vodDirectory, file )),
        				slpFileName: file
        			})

                    if( games.length ){
                        if( games[ games.length - 1].player1 === game.player1 && 
                            games[ games.length - 1].player2 === game.player2 &&
                            games[ games.length - 1].unlinkedSetNumber === game.unlinkedSetNumber
                        ){
                            games.push( game )
                        } else {
                            this.sets.push( new Set( games ) )
                            games = [ game ]
                        }
                    } else {
                        games = [ game ]
                    }
                } catch( error ){
                    if( error.message === "Friendly" ){
                        console.log(`Skipping File: ${file}.`)
                    }
                }
    		})
            if( games.length ){
                this.sets.push( new Set( games ) )
            }
    	})
    }

    async convertToVideo(){

        // loop through sets
        let count = 1
        await asyncForEach( this.sets, async set => {

            try {

                console.log(`[${count++}/${this.sets.length}]`)
                set.print()

                console.log("Creating temporary directories...")
                try {
                    await createDir( tempSlpPath )
                    await createDir( tempFLVOutputPath )
                } catch ( error ){
                    // try one more time after a small delay (obs might still be open)
                    await new Promise( resolve => {
                        console.log("Trying Directory Operations Again...")
                        setTimeout(  async () => {
                            await createDir( tempSlpPath )
                            await createDir( tempFLVOutputPath )
                            resolve()
                        }, 5000 )
                    })
                }

                console.log("Moving .slp files into /tempSlp...")
                await Promise.all( set.games.map( game => new Promise( resolve => {
                    fs.copyFile( game.slpFilePath, `${tempSlpPath}/${game.slpFileName}`, err =>{
                        if( err ){ 
                            reject({
                                status: 1,
                                message: `Error copying ${game.slpFilePath}`
                            })
                        }
                        resolve()
                    })
                })))

                console.log("Converting .slp -> .flv")
                await new Promise( ( resolve, reject ) => {
                    const s2vProc = spawn('cmd', ['/c', 'C:\\Users\\Matt\\Documents\\slippiUploader\\s2v\\S2V.exe']);
                    s2vProc.on("exit", () => {
                        console.log("Closing dolphin and obs...")
                        taskkill(["Dolphin.exe", 'obs64.exe' /*, "S2V.exe" */], { force: true })
                        resolve()
                    })

                    s2vProc.stderr.on("err", function(err){
                        console.log("ERROR:", err )
                        reject({
                            status: 2,
                            message: 'Error during Slippi2Video process:' + error
                        })
                    })
                })

                console.log("Writing concatenation list...")
                const concatListFile = path.resolve("./concatList.txt")
                if(fs.existsSync( concatListFile )) {
                    fs.unlinkSync( concatListFile )
                }
                const ffmpegConcatFile = fs.createWriteStream( concatListFile , {flags: 'a'})
                const videoNames = getFiles( tempFLVOutputPath ).map( video => path.resolve( tempFLVOutputPath, video ));
                videoNames.forEach( videoName => {
                    console.log( videoName )
                    ffmpegConcatFile.write( `file '${videoName}'\n` ) 
                })
                ffmpegConcatFile.end()

                console.log("Stitching files together...")
                let finalFileName = `${set.player1} vs ${set.player2}.mp4`
                let alreadyOutputtedVideos = getFiles( finalOutputDir )
                while( alreadyOutputtedVideos.some( name => name === finalFileName ) ){
                    finalFileName = `${finalFileName.slice(0,-4)}_.mp4`
                }

                await new Promise( ( resolve, reject ) => {
                    const command = `ffmpeg -safe 0 -f concat -i ${concatListFile} -c copy "${path.resolve(finalOutputDir, finalFileName)}"`
                    exec( command, ( error, stdout, stderr ) => {
                        if ( error instanceof Error ){
                            return reject({
                                status: 4,
                                message: 'Error during concatenation: ' + error
                            })
                        }
                        resolve()
                    })
                })

                console.log(`Finished: ${finalFileName}\n`)
            } catch ( error ){
                if( error.status ){
                    console.log("This error was predicted. Status - " + error.status )
                    console.log( error.message )
                } else {
                    console.log("Unpredicted error: " )
                    console.log( error )
                }
                const errorLog = fs.createWriteStream( errorLogPath , {flags: 'a'})
                errorLog.write(`\nSet -  ${set.getFileName()}`)
                if( error.status ){ errorLog.write(`   Message - ${ error.message }`)}
                errorLog.end()
            }
        })

    }

    getPlayerLastGame( tag ){
        const { smashGGSets } = this.json
        const _player = players.filter( p => p.name.toLowerCase() === tag.toLowerCase() )
        if( _player.length !== 1 ){ throw `Error: ${tag} not found in player list`}
        const player = _player[0].toLowerCase()

        const playerSets = smashGGSets.filter( s => s.isLinked && 
            ( s.winnerTag.toLowerCase() === player || s.loserTag.toLowerCase() === player )
        )

        console.log("playerSets: ", playerSets )
        throw "HEY GET BACK TO THIS "
    }

    saveJSON(){
        if( !this.json ){ throw "Error in saveJSON: this.json is undefined" }
        fs.writeFileSync( path.resolve( this.slpDir, "tournament.json" ), JSON.stringify( this.json ) )
    }


    uploadTournament(){
        if( !this.name ){
            throw "Error: No Tournament Name"
        }


    }

    uploadSet( set ){
        if( !this.name ){
            throw "Error: No Tournament Name"
        }


    }


    loadRawVods(){
        getDirectories( rawVodsPath ).forEach( directoryPath => {
            const files = getFiles( directoryPath )
            console.log("FILE", files[0])
            console.log("FILES LENGTH: ", files.length )
        })
    }


    label(){
        if( this.sets.length < 1 ){
            throw "Error: No sets. Probably forgot to get smashgg data"
        }
        if( this.rawVods.length < 1 ){
            throw "Error: No sets. Probably forgot to get smashgg data"
        }

 
    }

    isPotentialSlpConflict( slpSet, slpSets ){
        return slpSet.some( i => {
            return slpSets.some( j => {
                console.log("J - ", j )
                return i.uuid === j.uuid 
            })
        })
    }

    isLegitimateFileBetweenFiles( file1, file2 ){
        const index1 = this.validSlpFiles.indexOf( file1 )
        const index2 = this.validSlpFiles.indexOf( file2 )
        return index2 - index1 > 1
    }


    extractPlayers(){
        this.events.forEach( event => {
            console.log("Extracting players from ", event.name )
            event.sets.nodes.forEach( set => {
                set.slots.forEach( slot => {
                    try {
                        const newTag = removeSponsor( slot.entrant.name )
                        if( !this.players.some( player => player === newTag )){
                            this.players.push( newTag )
                        }
                    } catch ( err ){
                        console.log("Couldn't get tag? ", slot )
                    }
                })
            })
        })
    }

    extractTourneySlug( tourneyUrl ){
        const tourneyArr = tourneyUrl.split("/")
        return tourneyArr[ tourneyArr.indexOf("tournament") + 1 ]
    }

    printEvents(){
        this.events.forEach( event => {
            console.log( event.name )
            console.log("Sets: ", event.sets.nodes.length)
        })
    }

    loadJSON( jsonPath ){
        this.json = JSON.parse( fs.readFileSync( jsonPath ))
    }

    getAllConnectedSets(){
        const connectedSets = []
        this.json.smashGGSets.forEach( set => {
            if( set.linkedSlpFiles && set.linkedSlpFiles.length > 0 ){
                const slpFiles = this.json.slpFiles.filter( file => {
                    return set.linkedSlpFiles.indexOf( file.uuid ) > -1
                })
                connectedSets.push({
                    ...set,
                    linkedSlpFiles: slpFiles
                })
            }
        })
        return connectedSets
    }

    // getAllSlpFiles(){
    //     return this.json.slpFiles
    // }

    // getAllSets(){
    //     return this.json.smashGGSets
    // }

    retroactivelyConnectLabelledSlpToSmashGG( labelledVods ){
        const { slpFiles, smashGGSets } = this.json
        console.log("Retroactively Linking...")
        console.log("Total number of labelled Slp Sets: ", this.sets.length )
        // loop through labelled sets and connect them to slpFiles and smashGGSets
        const setsWithMoreThanOneMatch = []
        this.sets.forEach(set => {
            let potentialSmashGGSets = smashGGSets.filter( smashGGSet => {
                if( smashGGSet.isLinked ){ return false }
                if( !( set.player1.toLowerCase() === smashGGSet.winnerTag.toLowerCase() ||
                      set.player1.toLowerCase() === smashGGSet.loserTag.toLowerCase())
                ){ return false }
                if( !( set.player2.toLowerCase() === smashGGSet.winnerTag.toLowerCase() ||
                      set.player2.toLowerCase() === smashGGSet.loserTag.toLowerCase())
                ){ return false }

                return true 
            })

            if( potentialSmashGGSets.length === 0 ){
                console.log(`No Match Found: ${set.player1} vs ${set.player2}` )
            } else if ( potentialSmashGGSets.length === 1 ){
                set.matchedSmashGGSet = potentialSmashGGSets[0]
            } else {
                setsWithMoreThanOneMatch.push({ slpSet: set, potentialSmashGGSets })
            }
        })

        setsWithMoreThanOneMatch.forEach( ({ slpSet, potentialSmashGGSets }) => {
            console.log("Extra work for -> ", `${slpSet.player1} vs ${slpSet.player2}`)

            // just pick the one closer to the timestamp of the last game
            const { startAtTimestamp } = getInfoFromSlpFile( slpSet.games[ slpSet.games.length - 1].slpFilePath )
            const potentialSmashGGSetsSortedByTime = potentialSmashGGSets.sort( (a,b) => a.completedAt > b.completedAt )
            let foundSet = null
            for( var i = 0; i < potentialSmashGGSetsSortedByTime.length; i++ ){
                if( startAtTimestamp < potentialSmashGGSetsSortedByTime[i].completedAt ){
                    foundSet = potentialSmashGGSetsSortedByTime[i]
                    break
                } 
            }
            if( !foundSet ){
                console.log(`Still unmatched: ${slpSet.player1} vs ${slpSet.player2}` )
                console.log("Potential matches: ", potentialSmashGGSets.map( p => p.uuid ))
            }

            slpSet.matchedSmashGGSet = foundSet
            delete slpSet.potentialSmashGGSets
        })

        console.log("Number of SLP Sets with SmashGG Matches: ", this.sets.filter( s => s.matchedSmashGGSet ).length )

        console.log("Connecting labelled slp to raw slp vods")
        console.log("Number of raw slp files: ", slpFiles.length )
        console.log("")
        this.sets.filter( s => s.matchedSmashGGSet ).forEach( (set, index) => {
            process.stdout.clearLine()
            process.stdout.cursorTo(0)
            process.stdout.write(`Progress: ${index}/${this.sets.filter( s => s.matchedSmashGGSet ).length}`)
            set.games.forEach( game => {
                const info = getInfoFromSlpFile( game.slpFilePath )

                const slpFilesWithSameTimestampAndLength = slpFiles.filter( file => {
                    return ( file.startAtTimestamp === info.startAtTimestamp &&
                        file.length === info.length )
                })
                if( slpFilesWithSameTimestampAndLength.length !== 1 ){
                    console.log(`\nSomehow wasn't found - ${set.player1} vs ${set.player2}`)
                    // console.log( info )
                    return
                }
                game.matchedRawSlpFile = slpFilesWithSameTimestampAndLength[0]
            })
        })

        this.sets.forEach( set => {
            if( set.games.every( g => g.matchedRawSlpFile )){
                set.matchedSmashGGSet.linkedSlpFiles = set.games.map( game => {
                    game.matchedRawSlpFile.linkedSet = set.matchedSmashGGSet.uuid
                    return game.matchedRawSlpFile.uuid 
                })
            }
        })
        console.log("---")

        this.saveJSON();
    }
}

module.exports = { Tournament }


// console.log("Converting .flv -> .mp4")
// // convert mp4 -> flv
// let gameCount = 1
// await asyncForEach( getFiles( tempFLVOutputPath ), async file => {
//     console.log(`Game #${gameCount}...`)
//     await new Promise( ( resolve, reject ) => {
//         handbrake.spawn({ input: path.resolve( tempFLVOutputPath, file ), output: `${tempMP4OutputPath}/game_${gameCount++}.mp4` })
//           .on('error', err => {
//             console.log("HANDBRAKE ERR: ", err )
//             reject({
//                 status: 3,
//                 message: `Error during mp4 -> flv conversion. File: ${path.resolve( tempFLVOutputPath, file )}`
//             })
//           })
//           .on('progress', progress => {
//             process.stdout.clearLine()
//             process.stdout.cursorTo(0)
//             process.stdout.write(`Progress: ${progress.percentComplete}%`)
//           })
//           .on('end', resolve )
//     })
//     console.log("\n")
// })