
const { Meta } = require('./Meta');
const { Labeller } = require('./Labeller');
const { ComboCreator } = require('./ComboCreator');
const { Uploader } = require('./Uploader');



class MainController {

    constructor(archive){
        this.archive = archive;
        this.mainView = $(`#main-content`);
        this.meta = new Meta(archive);
        this.labeller = new Labeller(archive);
        this.comboCreator = new ComboCreator(archive);
        this.uploader = new Uploader(archive); 

        this.tabs = $("#tabs .tab");
        this.tabs.click( e => {
            this.showTab(e.target.getAttribute('value'));
            this.tabs.removeClass("active-tab");
            $(e.target).addClass("active-tab");
        })

    }

    /*
        - Validate given json file
        - Populate Meta page
    */
    showTab(tab){
        switch (tab) {
            case 'meta':
                this.mainView.load("../views/meta.html", this.meta.render.bind(this));
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