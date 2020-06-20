
const { Data } = require('./Data');
const { Labeller } = require('./Labeller');
const { ComboCreator } = require('./ComboCreator');
const { Uploader } = require('./Uploader');



class MainController {

    constructor(archive){
        console.log(archive.generateJSON());
        this.archive = archive;
        this.mainView = $(`#main-content`);
        this.dataTabController = new Data(archive);
        this.labellerTabController = new Labeller(archive);
        this.comboCreatorTabController = new ComboCreator(archive);
        this.uploaderTabController = new Uploader(archive); 

        this.tabs = $("#tabs .tab");
        this.tabs.click( e => {
            this.showTab(e.target.getAttribute('value'));
        });

        this.title = $("#navbar-title"); 
        if(archive.name){
            this.title.html(archive.name);
        }

        this.saveButton = $("#save-button");
        this.saveButton.show();
        this.saveButton.click(async () => {
            this.saveButton.prop('disabled',true).html("Saving...");
            this.archive.save();
            this.saveButton.html("Saved").addClass('green');
            setTimeout(()=>{ 
                this.saveButton.prop('disabled',false).html('Save').removeClass('green')
            },1000)
        })

        this.closeButton = $("#close-archive-button");
        this.closeButton.show();
        this.closeButton.click(async () => {
            delete localStorage.last_archive;
            const app = require('electron').remote.app
            app.relaunch();
            app.exit();
        })

    }

    showTab(tab){
        this.tabs.removeClass("active-tab");
        $(`#${tab}-tab`).addClass("active-tab");
        switch (tab) {
            case 'data':
                this.mainView.load("../views/data.html", this.dataTabController.render.bind(this.dataTabController));
                break;
            case 'labeller':
                this.mainView.load("../views/labeller.html", this.labellerTabController.render.bind(this.labellerTabController));
                break;
            case 'combo':
                this.mainView.load("../views/combo.html", this.comboCreatorTabController.render.bind(this.comboCreatorTabController));
            break;
            case 'uploader':
                this.mainView.load("../views/uploader.html", this.uploaderTabController.render.bind(this.uploaderTabController));                
                break;
            default:
                throw `Error: ${tab} doesn't exist`;
        }
    }

    
}

module.exports = { MainController }