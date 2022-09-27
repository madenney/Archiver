
const path = require("path")
const fs = require("fs");
const { File } = require("./File");
const { Pattern } = require("./Pattern")
const  fileTemplate = JSON.parse( fs.readFileSync(path.resolve("constants/jsonTemplates/fileTemplate.json")));

const { getSlpFilePaths } = require("../lib")

class Archive {
    
    constructor( archivePath ) {
        this.path = archivePath
        this.files = []
        this.patterns = []
        // validate given json
        try {
            const archiveJSON = JSON.parse(fs.readFileSync(archivePath));
            if(!archiveJSON.name) throw "Archive has no name";
            this.name = archiveJSON.name;
            this.createdAt = archiveJSON.createdAt ? archiveJSON.createdAt : new Date().getTime().toString();
            this.updatedAt = archiveJSON.updatedAt;

            if(archiveJSON.files && archiveJSON.files.length > 0 ){
                archiveJSON.files.forEach( file => this.files.push( new File(file) ))
            }

            if(archiveJSON.patterns && archiveJSON.patterns.length > 0){
                archiveJSON.patterns.forEach( pattern => this.patterns.push( new Pattern(pattern)))
            }

        } catch(err){
            console.log("An error occured in Archive constructor");
            console.log(err);
            throw err
        }
    }

    addFiles(_paths){
        const paths = Array.isArray(_paths) ? _paths : [_paths]
        const filePaths = getSlpFilePaths(paths);
        let count = 0
        filePaths.forEach( path => {
            count++
            this.files.push( new File({ ...fileTemplate, path}))
        })
        return count
    }

    async processFiles(){
        const promises = []
        this.files.forEach(file => { promises.push(file.process()) })
        await Promise.all(promises)
    }

    addPatterns(_patterns){
        const patterns = Array.isArray(_patterns) ? _patterns : [_patterns]
        patterns.forEach(p => this.patterns.push( new Pattern(pattern)))
    }

    getFiles(params){
        return this.files.filter(f => f.is(params) )
    }
    getFiles({stage,char1,char2,player1,player2} = {}){
        let files = this.files.filter(f => f.isValid );

        if(stage){
            let s = stage;
            if(!Array.isArray(s)) s = [stage];
            files = files.filter(f=>s.indexOf(f.stage.toString()) !== -1)
        }
        if(char1 || char2){
            let c1 = char1
            let c2 = char2
            if(char1 && !Array.isArray(char1)) c1 = [char1]
            if(char2 && !Array.isArray(char2)) c2 = [char2]
            files = files.filter(f => {
                const p1 = f.players[0].characterId.toString();
                const p2 = f.players[1].characterId.toString();
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
        if(player1 || player2){
            let p1 = player1
            let p2 = player2
            if(p1 && !Array.isArray(p1)) p1 = [p1]
            if(p2 && !Array.isArray(p2)) p2 = [p2]
            files = files.filter(f => {
                const _p1 = f.players[0].displayName.toLowerCase();
                const _p2 = f.players[1].displayName.toLowerCase();
                if(p1 && p2){
                    return (
                        (p1.indexOf(_p1) !== -1 && p2.indexOf(_p2) !== -1) ||
                        (p1.indexOf(_p2) !== -1 && p2.indexOf(_p1) !== -1)
                    )
                } else if(p1 && !p2 ){
                    return p1.indexOf(_p1) !== -1 || p1.indexOf(_p2) !== -1
                } else if(p2 && !p1 ){
                    return p2.indexOf(_p1) !== -1 || p2.indexOf(_p2) !== -1
                }
            })
        }
        return files;
    }

    save(){
        const jsonToSave = {
            name: this.name,
            createdAt: this.createdAt,
            updatedAt: new Date().getTime().toString(),
            files: this.files.map(f=>f.generateJSON()),
            patterns: this.patterns.map(p=>p.generateJSON()),
            outputDir: this.outputDir
        }
        fs.writeFileSync(this.path, JSON.stringify(jsonToSave));
    }

    generateJSON(){
        return {
            name: this.name,
            createdAt: this.createdAt,
            updatedAt: new Date().getTime().toString(),
            files: this.files.map(f=>f.generateJSON()),
            patterns: this.patterns.map(p=>p.generateJSON())
        } 
    }
}

module.exports = { Archive }