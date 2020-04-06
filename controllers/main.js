
const { Data } = require('./Data');
const { Labeller } = require('./Labeller');
const { ComboCreator } = require('./ComboCreator');
const { Uploader } = require('./Uploader');



class MainController {

    constructor(archive){
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

        this.saveButton = $("#save-button");
        this.saveButton.click(async () => {
            this.saveButton.prop('disabled',true).html("Saving...");
            this.archive.save();
            this.saveButton.html("Saved").addClass('green');
            setTimeout(()=>{ 
                this.saveButton.prop('disabled',false).html('Save').removeClass('green')
            },1000)
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
                this.mainView.load("../views/labeller.html");
                break;
            case 'combo':
                this.mainView.load("../views/combo.html");
                break;
            case 'uploader':
                this.mainView.load("../views/uploader.html");                
                break;
            default:
                throw `Error: ${tab} doesn't exist`;
        }
    }

    
}

module.exports = { MainController }