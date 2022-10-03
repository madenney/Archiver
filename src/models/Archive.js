
const path = require("path")
const fs = require("fs");
const File = require("./File").default;
const Pattern = require("./Pattern").default;
const { patternsConfig } = require("../constants/config.js")
const { getSlpFilePaths } = require("../lib").default;
const  fileTemplate = JSON.parse( fs.readFileSync(path.resolve("src/constants/jsonTemplates/fileTemplate.json")));
const  patternTemplate = JSON.parse( fs.readFileSync(path.resolve("src/constants/jsonTemplates/patternTemplate.json")));

console.log("ILE TMEP", File)
class Archive {
    
    constructor( archivePath ) {
        this.path = archivePath
        this.files = []
        this.patterns = []
        const archiveJSON = JSON.parse(fs.readFileSync(archivePath));
        if(!archiveJSON.name) throw "Archive has no name";
        this.name = archiveJSON.name;
        this.createdAt = archiveJSON.createdAt ? archiveJSON.createdAt : new Date().getTime().toString();
        this.updatedAt = archiveJSON.updatedAt ? archiveJSON.createdAt : new Date().getTime().toString();
        if(archiveJSON.files && archiveJSON.files.length > 0 ){
            archiveJSON.files.forEach( file => this.files.push( new File(file) ))
        }
        if(archiveJSON.patterns && archiveJSON.patterns.length > 0){
            archiveJSON.patterns.forEach( pattern => this.patterns.push( new Pattern(pattern)))
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

    addNewPattern(type){
        const template = patternsConfig.find(p=>p.type==type)
        if(!template){
            throw `Error: Invalid Pattern Type ${type}`
        }
        console.log("FOUND TEMPLATE: ", template)
        const newPattern = {type,method:{}}
        template.options.forEach( option => {
            newPattern.method[option.id] = option.default
        })
        this.patterns.push( new Pattern(newPattern) )
    }

    processFiles(eventEmitter){
        let count = 0;
        const length = this.files.length
        this.files.forEach(file => {
            if(file.isProcessed ) return 
            eventEmitter({msg: `${count++}/${length}`})
            file.process()
        })
    }

    save(){
        const jsonToSave = {
            name: this.name,
            createdAt: this.createdAt,
            updatedAt: new Date().getTime().toString(),
            files: this.files.map(f=>f.generateJSON()),
            patterns: this.patterns.map(p=>p.generateJSON())
        }
        fs.writeFileSync(this.path, JSON.stringify(jsonToSave));
    }

    generateJSON(){
        return {
            name: this.name,
            createdAt: this.createdAt,
            updatedAt: new Date().getTime().toString(),
            files: this.files.map(f=>f.generateJSON()),
            patterns: this.patterns.map(p=>p.generateJSON()),
            gameSettings: this.gameSettings
        } 
    }
}

export default Archive