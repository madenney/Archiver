
const path = require("path")

//const { Tournament } = require("./Tournament")
// const { 
//     getDirectories,
//     getFiles,
//     asyncForEach
// } = require("../lib")

class Archive {

    constructor( archivePath ) {
        this.archivePath = archivePath
        this.tournaments = []
    }


    load(){
        getDirectories( this.archivePath ).forEach( directory => {
            const jsonPath = path.resolve( directory, "raw", "tournament.json" )
            const tournament = new Tournament()
            tournament.loadJSON( jsonPath )
            this.tournaments.push( tournament )
        })
    }




    getAllSets(){
        const allSets = []
        this.tournaments.forEach( tournament => {
            const sets = tournament.getAllSets()
            sets.forEach( set => allSets.push( set ))
        })
        return allSets
    }

    getAllConnectedSets(){
        const allConnectedSets = []
        this.tournaments.forEach( tournament => {
            const sets = tournament.getAllConnectedSets()
            sets.forEach( set => allConnectedSets.push({
                ...set,
                tournament: tournament.name
            }))
        })
        return allConnectedSets
    }

    getAllConnectedSlpFiles(){
        const allFiles = this.getAllSlpFiles()
        const connectedFiles = files.filter( file => file.linkedSet )
    }

    getAllSlpFiles(){
        const slpFiles = []
        this.tournaments.forEach( tournament => {
            const files = tournament.getAllSlpFiles()
            files.forEach( file => slpFiles.push( file ))
        })
        return slpFiles
    }

    async addTournament( directory ){

    }


}

module.exports = { Archive }