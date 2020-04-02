

const fs = require('fs');
const path = require('path');
var { remote: { dialog, app } } = require('electron');

class Startup {

    constructor(viewId,callback){
        this.callback = callback;
        this.content = $(`#${viewId}`);
    
        this.content.css({display: "block"});

        const newButton = $("#new-archive-button");
        const existingButton = $("#existing-archive-button");
        const archiveNameField = $("#archive-name");
        const archiveDirectoryButton = $("#archive-directory-button");
        const createArchiveButton = $("#create-archive-button");

        this.archiveName = "my_new_archive";
        this.archivePath = app.getPath('home');
        this.updateArchivePath();

        newButton.click(() => {
            newButton.hide();
            existingButton.hide();
            const newArchiveForm = $("#new-archive-form");
            newArchiveForm.show();
        })

        existingButton.click(() => {
            const path = dialog.showOpenDialogSync({
                properties: ['openFile'],
                filters: [{
                    name: 'JSON',
                    extensions: ['json']
                }]
            });
            this.content.hide();
            this.callback(path);
        })

        archiveNameField.keyup( (e) => {
            this.archiveName = e.target.value;
            this.updateArchivePath();
        })

        archiveDirectoryButton.click((e) => {
            e.preventDefault();
            const path = dialog.showOpenDialogSync({
                properties: ['openDirectory','createDirectory']
            });
            if(path && path[0]){
                this.archivePath = path[0];
                this.updateArchivePath();
            }
        })

        createArchiveButton.click(() => {

            const archiveJSON = JSON.parse(fs.readFileSync(path.resolve('./constants/archiveTemplate.json')));
            archiveJSON.name = this.archiveName;
            fs.writeFileSync(this.path, JSON.stringify(archiveJSON));
            this.content.hide();
            this.callback(this.path)
        })
    }

    updateArchivePath(){
        this.path = this.archivePath + "/" + this.archiveName + ".json";
        $("#new-directory-path").html(this.path);
    }

}

module.exports = { Startup }