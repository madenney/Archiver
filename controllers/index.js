
window.$ = window.jQuery = require("jquery");
require('jquery-ui-dist/jquery-ui')
const { remote } = require('electron')
const fs = require("fs");

const { Archive } = require("../models/index");
const { MainController } = require("../controllers/Main");
const { Startup } = require("../controllers/Startup");
const config = require("../config.json");
const mainContentId = "main-content";
const startupId = "startup";

const main = () => {
    
    let controller;

    if( localStorage.last_archive && fs.existsSync(localStorage.last_archive) ){
        let archive;
        try {
            archive = new Archive(localStorage.last_archive);
        } catch(err){
            console.log("Error occurred while loading last archive. Deleting saved archive path...");
            delete localStorage.last_archive
            console.log(err);
        }
        controller = new MainController( archive, mainContentId );
        controller.showTab(config.defaultTab);
    } else {
        console.log("No Last Archive");
        new Startup(startupId, (archivePath) => {
            const archive = new Archive(archivePath);
            localStorage.last_archive = archivePath;
            controller = new MainController( archive, mainContentId );
            controller.showTab('data');
        })
    }



}

$(document).ready(main);



// For Development: Add Right Click to Inspect Element
if( process.env.DEVELOPMENT ){
    const { Menu, MenuItem } = remote;
    let rightClickPosition = null 
    const menuItem = new MenuItem({
        label: 'Inspect Element',
        click: () => {
            remote.getCurrentWindow().inspectElement(rightClickPosition.x, rightClickPosition.y)
        }
    })
    const menu = new Menu()
    menu.append(menuItem)
    
    window.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        rightClickPosition = {x: e.x, y: e.y}
        menu.popup(remote.getCurrentWindow())
    }, false)
}