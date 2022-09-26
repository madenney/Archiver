

const fs = require('fs');
const path = require('path');
const { ipcRenderer } = require("electron");

class NewArchiveController {

    constructor(callback){
        this.callback = callback;

        const newButton = $("#new-archive-button");
        const existingButton = $("#existing-archive-button");
        const backButton = $("#back-button");
        const archiveNameField = $("#archive-name");
        const archiveDirectoryButton = $("#archive-directory-button");
        const createArchiveButton = $("#create-archive-button");
        const newArchiveForm = $("#new-archive-form");

        this.archiveName = "my_new_archive";
        this.archivePath = "/home";
        this.updateArchivePath();

        newButton.off().click(() => {
            newButton.hide();
            existingButton.hide();
            newArchiveForm.show();
        })

        existingButton.off().click((e) => {
            e.preventDefault();

            ipcRenderer.invoke("showDialog", ["openFile"]).then( path => {
                if(path && path[0]){
                    this.callback(path[0])
                }
            });
        })

        backButton.off().click(() => {
            newButton.show();
            existingButton.show();
            newArchiveForm.hide();
        })

        archiveNameField.off().keyup( (e) => {
            this.archiveName = e.target.value;
            this.updateArchivePath();
        })

        archiveDirectoryButton.off().click((e) => {
            e.preventDefault();
            ipcRenderer.invoke("showDialog",['openDirectory','createDirectory']).then( path => {
                if(path && path[0]){
                    this.archivePath = path[0];
                    this.updateArchivePath();
                }
            });
        })

        createArchiveButton.off().click(() => {
            const archiveJSON = JSON.parse(fs.readFileSync(path.resolve('./constants/jsonTemplates/archiveTemplate.json')));
            archiveJSON.name = this.archiveName;
            fs.writeFileSync(this.path, JSON.stringify(archiveJSON));
            this.callback(this.path)
            newButton.show();
            existingButton.show();
            newArchiveForm.hide();
        })
    }

    updateArchivePath(){
        this.path = this.archivePath + "/" + this.archiveName + ".json";
        $("#new-directory-path").html(this.path);
    }

}

module.exports = { NewArchiveController }