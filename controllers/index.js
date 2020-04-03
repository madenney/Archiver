
window.$ = require("jquery");

const { remote } = require('electron')


const { Archive } = require("../models/index");
const { MainController } = require("../controllers/main");
const { Startup } = require("../controllers/startup");

const mainContentId = "main-content";
const startupId = "startup";
const main = () => {
    
    let controller;

    if( localStorage.last_archive ){
        lastArchivePath = localStorage.lastArchivePath;
        console.log("Last Archive: ", lastArchivePath );
        const archive = new Archive(lastArchivePath);
        controller = new MainController( archive, mainContentId );
        controller.populateArchiveMetaData();
    } else {
        console.log("No Last Archive");
        new Startup(startupId, (archivePath) => {
            const archive = new Archive(archivePath);
            controller = new MainController( archive, mainContentId );
            controller.populateArchiveMetaData();
        })
    }



}

$(document).ready(main);

// Add Right Click to Inspect Element

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