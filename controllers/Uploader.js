const { ThumbnailController } = require ('../controllers/Thumbnail');
const { Test_Set } = require ('../test_files/testSet.json')

class Uploader {
    constructor(archive){
        this.archive = archive;
    }

    generateThumbnail(set){
        console.log("About to generate thumbnail");
        const thumbnail = new ThumbnailController(set);
        console.log("thumbnail generated");
    }

    render(){
        console.log("Render Uploader");
        //TODO switch off of test files
        this.set = new Set(Test_Set);
        this.generateThumbnail(this.set);
    }
}

module.exports = {Uploader}