
const fs = require("fs")
const { Tournament, Archive, Game } = require("./models")

const { spawn } = require('child_process');
const taskkill = require('taskkill');

const {
    asyncForEach
} = require("./lib")
 

/* Tournament
 *  - Load Directory
 *  - - Attach .slp files to Game Objects
 *  - Group games into Set Objects
 */

const rimraf = require("rimraf");
const path = require("path")
const smashggToken = "5d9c8c1a10899f7fa00b66043d74f86d"

const archivePath = path.resolve("../mad_archive")
// const tourneyUrl = "https://smash.gg/tournament/half-moon-38/events"
// const vodsDir = "./vods51"
// const rawVodsDir = "./rawSlp51"
// const tourneyStartTime = new Date('July 9, 2019 20:30:00')

const main = async function () {
    console.log("MAIN");

    let seconds = 10800
    let loadingDots = ""
    setInterval(() => {
        process.stdout.clearLine()
        process.stdout.cursorTo(0)
        process.stdout.write(`Killing Dolphin in ${seconds--} seconds`)

        if( ( seconds / 60 ) % 10 === 0 ){
            fs.writeFileSync( path.resolve(".", "records.json"), JSON.stringify({
                seconds: 10800 - seconds
            }) )
        }
    }, 1000 )

    setTimeout(() => {
        taskkill(["Dolphin.exe", 'obs64.exe' /*, "S2V.exe" */], { force: true })
    }, seconds * 1000 )
    return

    const json = JSON.parse( fs.readFileSync( "./combos.json" ))
    console.log("Queue length: ", json.queue.length )
    let totalFrames = 0
    let skipClipCount = 0
    json.queue.forEach( combo => {
        if( combo.path.indexOf("20190709T202121") > -1 ){
            skipClipCount++
            return
        }
        totalFrames += combo.endFrame - combo.startFrame
    })
    console.log("Total Frames: ", totalFrames)
    console.log("Seconds: ", totalFrames / 60 )
    console.log("Minutes: ", Math.round( totalFrames / 60 / 60) )
    console.log("Total Skips: ", skipClipCount )
    return
    const archive = new Archive( archivePath )
    console.log("Loading Archive")
    archive.load()

    const connectedSets = archive.getAllConnectedSets()

    console.log("Number of connected sets: ", connectedSets.length )
    console.log("Example: ", connectedSets[500].linkedSlpFiles[0])

    // filter for marth
    const marthSets = connectedSets.filter( set => {
        return set.linkedSlpFiles.some( file => {
            return file.players.some( player => {
                return player.characterId === 9
            })
        })
    })

    console.log("Number of Marth Sets: ", marthSets.length )

    const marthGames = []
    marthSets.forEach( set => {
        set.linkedSlpFiles.forEach( file => {
            if( !file.players.some( p => p.characterId === 9 )){ return }
            marthGames.push( file )
        })
    })

    console.log("Number of Marth Games: ", marthGames.length )

    const outputJSON = {
        mode:"queue",
        queue: []
    }
    marthGames.forEach( (mGame, index) => {
        let foundOne = false
        console.log("Game - ", index )
        const game = new Game({ slpFilePath: mGame.path })
        const { combos } = game.getGameStats()
        combos.forEach( combo => {
            if( combo.didKill && combo.moves[ combo.moves.length - 1].moveId === 17 ){
                console.log("Combo Found: ", combo )
                if( foundOne ){
                    outputJSON.queue.push({
                        path: "C:\\Users\\Matt\\Documents\\mad_archive\\51\\raw\\6\\Game_20190709T202121.slp",
                        startFrame: 600,
                        endFrame: 720
                    })
                }
                foundOne = true
                outputJSON.queue.push({
                    path: mGame.path,
                    startFrame: combo.startFrame - 200,
                    endFrame: combo.endFrame + 120
                })
            }
        })
        foundOne = false
    })

    console.log("OUTPUT", outputJSON )

    fs.writeFileSync( path.resolve(".", "combos.json"), JSON.stringify( outputJSON ) )
    return

    const butt = marthSets.filter( game => {
        return ( game.winnerTag.toLowerCase() === "lego" &&
            game.loserTag.toLowerCase() === "nash")
    })
    console.log("BUTT", butt )
    const test = butt[0].linkedSlpFiles[0]


    const g = new Game({ slpFilePath: test.path })
    const stats = g.getGameStats()

    console.log(Object.keys( stats ))
    const killStrings = [ 
        ...stats.conversions.filter( c => c.didKill ), 
        ...stats.combos.filter( c => c.didKill )
    ]

    console.log("killStrings", killStrings.length )

    console.log("DA HALF MOON", killStrings[2])

    // killStrings.forEach( combo => {
    //     outputJSON.queue.push({
    //         path: test.path,
    //         startFrame: combo.startFrame,
    //         endFrame: combo.endFrame
    //     })
    //     outputJSON.queue.push({
    //         path: "C:\\Users\\Matt\\Documents\\mad_archive\\51\\raw\\6\\Game_20190709T202121.slp",
    //         startFrame: 600,
    //         endFrame: 720
    //     })
    // })

    //const tournament = new Tournament()

    // asyncForEach( tournaments, async t => {
    //     console.log("\n\nTournament: ", t.number)
    //     const tourneyUrl = `https://smash.gg/tournament/half-moon-${t.number}/events`
    //     const vodsDir = path.resolve( archivePath, t.number, "labelled" )
    //     const rawVodsDir = path.resolve( archivePath, t.number, "raw" )    
    //     const tourneyStartTime = new Date(t.start)

    //     const tournament = new Tournament()
    //     tournament.init( rawVodsDir, tourneyUrl, tourneyStartTime.getTime() )
    //     await tournament.getSmashGGResults( tourneyUrl )
    //     tournament.printEvents()
    //     console.log("New Players: ", tournament.unknownPlayers )
    //     tournament.connectSlpFiles()

    //     tournament.loadLabelledVods( vodsDir )
    //     tournament.retroactivelyConnectLabelledSlpToSmashGG( vodsDir );
    // })

    //tournament.linkSmashGGResultsToSlpFiles()


    // rimraf( path.resolve( vodsDir, "tournament.json" ), () => {
    //     console.log("Deleted tournament.json")
    // })
    // tournament.manuallySetInfo({
    //     name: "Half Moon 39",
    //     date: "April 9th, 2019",
    //     eventLink: "https://smash.gg/tournament/half-moon-39/details"
    // })

    // tournament.upload()


    //tournament.loadRawVods()

    // tournament.loadLabelledVods( vodsDir )

    // tournament.convertToVideo()


}

main()


const tournaments = [
        {
            number: "38",
            start: 'April 2, 2019 20:30:00'
        },
        {
            number: "39",
            start: 'April 9, 2019 20:30:00'
        },
        {
            number: "40",
            start: 'April 16, 2019 20:30:00'
        },
        {
            number: "41",
            start: 'April 23, 2019 20:30:00'
        },
        {
            number: "42",
            start: 'April 29, 2019 20:30:00'
        },
        {
            number: "43",
            start: 'May 7, 2019 20:30:00'
        },
        {
            number: "44",
            start: 'May 14, 2019 20:30:00'
        },
        {
            number: "45",
            start: 'May 21, 2019 20:30:00'
        },
        {
            number: "46",
            start: 'May 28, 2019 20:30:00'
        },
        {
            number: "47",
            start: 'June 4, 2019 20:30:00'
        },
        {
            number: "48",
            start: 'June 18, 2019 20:30:00'
        },
        {
            number: "49",
            start: 'June 25, 2019 20:30:00'
        },
        {
            number: "50",
            start: 'July 2, 2019 20:30:00'
        },
        {
            number: "51",
            start: 'July 9, 2019 20:30:00'
        }
    ]