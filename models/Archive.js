
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

    /*
        params - type Object
        Only returns confirmed Valid Games
        characters,stage,isLabelled,isTournament
        characters is char1, char2, each arrays of char Ids. Defaults to *
    */
    getGames({isLabelled,stage,char1,char2} = {}){
        let games = this.getAllSlpFiles().filter(f => f.isValid );
        if(isLabelled){
            games = games.filter(g=>g.isLabelled);
        }
        if(stage){
            let s = stage;
            if(!Array.isArray(s)) s = [stage];
            games = games.filter(g=>s.indexOf(g.stage.toString()) !== -1)
        }
        if(char1 || char2){
            let c1 = char1
            let c2 = char2
            if(char1 && !Array.isArray(char1)) c1 = [char1]
            if(char2 && !Array.isArray(char2)) c2 = [char2]
            games = games.filter(g => {
                const p1 = g.players[0].characterId.toString();
                const p2 = g.players[1].characterId.toString();
                if(c1 && c2){
                    return (
                        (c1.indexOf(p1) !== -1 && c2.indexOf(p2) !== -1) ||
                        (c1.indexOf(p2) !== -1 && c2.indexOf(p1) !== -1)
                    )
                } else if(c1 && !c2 ){
                    return c1.indexOf(p1) !== -1 || c1.indexOf(p2) !== -1
                } else if(c2 && !c1 ){
                    return c2.indexOf(p1) !== -1 || c2.indexOf(p2) !== -1
                }
            })
        }
        return games;
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



    // load(){
    //     getDirectories( this.archivePath ).forEach( directory => {
    //         const jsonPath = path.resolve( directory, "raw", "tournament.json" )
    //         const tournament = new Tournament()
    //         tournament.loadJSON( jsonPath )
    //         this.tournaments.push( tournament )
    //     })
    // }

    // getAllSets(){
    //     const allSets = []
    //     this.tournaments.forEach( tournament => {
    //         const sets = tournament.getAllSets()
    //         sets.forEach( set => allSets.push( set ))
    //     })
    //     return allSets
    // }

    // getAllConnectedSets(){
    //     const allConnectedSets = []
    //     this.tournaments.forEach( tournament => {
    //         const sets = tournament.getAllConnectedSets()
    //         sets.forEach( set => allConnectedSets.push({
    //             ...set,
    //             tournament: tournament.name
    //         }))
    //     })
    //     return allConnectedSets
    // }

    // getAllConnectedSlpFiles(){
    //     const allFiles = this.getAllSlpFiles()
    //     const connectedFiles = files.filter( file => file.linkedSet )
    // }


}

module.exports = { Archive }