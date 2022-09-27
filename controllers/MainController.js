
const { FilesController } = require('./FilesController');
const { PatternsController } = require('./PatternsController');
const { VideosController } = require('./VideosController');
const localStorageController = require("./LocalStorageController")

const sections = ["files","gamesettings","patterns","results","video"]



class MainController {

    constructor(archive){
        console.log("Archive: ",archive.generateJSON());
        this.archive = archive;
        this.FilesController = new FilesController(archive)
        this.PatternsController = new PatternsController(archive)
        this.VideosController = new VideosController(archive)

        this.title = $("#archive-title"); 
        if(archive.name){
            this.title.html(archive.name);
        }
       
        this.assignClickListeners();
        this.renderOptions()
        localStorageController.render();
    }

    renderOptions(){

    }



    assignClickListeners(){
        sections.forEach( section => {
            $(`#${section}-title`).off().click(() => {
                $(`#${section}`).toggle()
                $(`#${section}-title .section-carat`).html() == "▲" ? 
                    $(`#${section}-title .section-carat`).html("▼") :
                    $(`#${section}-title .section-carat`).html("▲")
            })
        })

        $(".modal-container").off().click(() => $(".modal-container").hide());
        $(".modal").off().click(e => {
            e.stopPropagation()
        })
    }


    
}

module.exports = { MainController }