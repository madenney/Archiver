
window.$ = window.jQuery = require("jquery");
require('jquery-ui-dist/jquery-ui')
const fs = require("fs");

const { Archive } = require("../models/index");
const { MainController } = require("../controllers/MainController");
const { NewArchiveController } = require("../controllers/NewArchiveController");


const main = () => {
    
    let controller;
    let archive
    const mainContent = $("#main-content");
    const newArchiveView = $("#new-archive");

    function createNewArchive(){
        delete localStorage.last_archive
        mainContent.hide()
        newArchiveView.show()
        new NewArchiveController((archivePath) => {
            localStorage.last_archive = archivePath;
            archive = new Archive(archivePath);
            controller = new MainController( archive );
            mainContent.show()
            newArchiveView.hide()
        })
    }

    if( localStorage.last_archive && fs.existsSync(localStorage.last_archive) ){
        try {
            archive = new Archive(localStorage.last_archive);
            controller = new MainController( archive );
        } catch(err){
            console.log("Error occurred while loading last archive. Deleting saved archive path...");
            delete localStorage.last_archive
            console.log(err);
        }
    } else {
        createNewArchive()
    }

    $("#close-archive-button").click(createNewArchive)
    
    const saveButtton = $("#save-archive-button")
    saveButtton.click(async (e) => {
        saveButtton.attr('disabled',true).html("Saving...");
        archive.save();
        saveButtton.html("Saved").addClass('green');
        setTimeout(()=>{ 
            saveButtton.prop('disabled',false).html('Save').removeClass('green')
        },1000)
    })


}


$(document).ready(main);
