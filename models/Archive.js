
const path = require("path")
const fs = require("fs");
const { Tournament } = require("./Tournament")
const { 
    getDirectories,
    getFiles,
    asyncForEach
} = require("../lib")

class Archive {
    
    constructor( archivePath ) {
        this.path = archivePath
        // validate given json
        try {
            const archiveJSON = JSON.parse(fs.readFileSync(archivePath));
            if(!archiveJSON.name) throw "Archive has no name";
            this.name = archiveJSON.name;
            this.date = archiveJSON.date ? archiveJSON.date : new Date().getTime().toString();

            if( archiveJSON.tournaments ){
                this.tournaments = [];
                archiveJSON.tournaments.forEach(tournamentJSON => {
                    this.tournaments.push( new Tournament(tournamentJSON));
                })
            }
        } catch(err){
            console.log("An error occured in Archive constructor");
            console.log(err);
            throw err
        }
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