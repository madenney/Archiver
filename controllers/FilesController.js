
const { readableDate } = require("../lib")
const { ipcRenderer } = require("electron");

class FilesController {

    constructor(archive){
        this.archive = archive
        this.assignClickListeners();
        this.renderData();
        this.renderFileList();
    }


    assignClickListeners(){
        $("#add-files-button").off().click(() => {
            ipcRenderer.invoke("showDialog", ["openDirectory"]).then( path => {
                const fileCount = this.archive.addFiles(path)
                this.renderData()
                this.renderFileList();
                console.log(`Added ${fileCount} files`)
            });
        })

        $("#process-files-button").off().click(() => {
            console.log("PROCESSING FILES");
            const processingMessage = $("#processing-files-message")
            processingMessage.html("Processing files...")
            this.archive.processFiles().then(() => {
                processingMessage.html("Done")
                this.renderData()
                setTimeout(() => { processingMessage.html("") }, 2000)
            })
        })

        $("#test-files-button").off().click(() => {
            console.log("TESTING FILES");
            this.archive.files.forEach(file => {
                if(!file.isValid) console.log(file.info)
            })
        })
    }

    renderData(){
        $("#total-files").html(this.archive.files.length)
        $("#files-total-processed").html(this.archive.files.filter(f=>f.isProcessed).length)
        $("#files-total-valid").html(this.archive.files.filter(f=>f.isValid).length)
        $("#files-created-at").html(readableDate(this.archive.createdAt))
        $("#files-updated-at").html(readableDate(this.archive.updatedAt))
    }

    renderFileList(){
        const list = $("#files-list")
        list.empty()
        this.archive.files.forEach( file => {
            list.append($(`<div>${file.path}</div>`))
        })
    }
}

module.exports = { FilesController }