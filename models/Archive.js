
const path = require("path")
const fs = require("fs");
const { Tournament } = require("./Tournament")
const { Game } = require("./Game");
const  gameTemplate = JSON.parse( fs.readFileSync(path.resolve("models/jsonTemplates/gameTemplate.json")));
const { 
    getDirectories,
    getSlpFilePaths,
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
            this.createdAt = archiveJSON.createdAt ? archiveJSON.createdAt : new Date().getTime().toString();
            this.updatedAt = archiveJSON.updatedAt;

            if( archiveJSON.nonTournamentGames ){
                this.nonTournamentGames = [];
                archiveJSON.nonTournamentGames.forEach(gameJSON => {
                    this.nonTournamentGames.push( new Game(gameJSON));
                })
            }
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

    addNonTournamentSlpFiles(paths){
        const slpFilesPaths = getSlpFilePaths(paths);
        slpFilesPaths.forEach( slpPath => {
            this.nonTournamentGames.push( new Game({
                ...gameTemplate,
                slpPath: slpPath,
                isFriendly: true
            }))
        })
    }

    getAllSlpFiles(){
        const files = [];
        this.nonTournamentGames.forEach(g=>files.push(g));
        this.tournaments.forEach(t=>{
            t.getAllSlpFiles().forEach(g=>files.push(g));
        })
        return files;
    }

    save(){
        const jsonToSave = {
            name: this.name,
            createdAt: this.createdAt,
            updatedAt: new Date().getTime().toString(),
            tournaments: this.tournaments.map(t=>t.generateJSON()),
            nonTournamentGames: this.nonTournamentGames.map(g=>g.generateJSON()),
            outputDir: this.outputDir
        }
        fs.writeFileSync(this.path, JSON.stringify(jsonToSave));
    }

    generateJSON(){
        return {
            name: this.name,
            createdAt: this.createdAt,
            updatedAt: new Date().getTime().toString(),
            tournaments: this.tournaments.map(t=>t.generateJSON()),
            nonTournamentGames: this.nonTournamentGames.map(g=>g.generateJSON()),
            outputDir: this.outputDir
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

    // getAllSlpFiles(){
    //     const slpFiles = []
    //     this.tournaments.forEach( tournament => {
    //         const files = tournament.getAllSlpFiles()
    //         files.forEach( file => slpFiles.push( file ))
    //     })
    //     return slpFiles
    // }

    async addTournament( directory ){

    }


}

module.exports = { Archive }