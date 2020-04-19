
window.$ = require("jquery");

const { remote } = require('electron')


const { Archive } = require("../models/index");
const { MainController } = require("./Main");
const { Startup } = require("../controllers/Startup");

const mainContentId = "main-content";
const startupId = "startup";

const main = () => {
    
    let controller;

    if( localStorage.last_archive ){
        lastArchivePath = localStorage.last_archive;
        const archive = new Archive(lastArchivePath);
        controller = new MainController( archive, mainContentId );
        controller.showTab('combo');
    } else {
        console.log("No Last Archive");
        new Startup(startupId, (archivePath) => {
            const archive = new Archive(archivePath);
            localStorage.last_archive = archivePath;
            controller = new MainController( archive, mainContentId );
            controller.showTab('combo');
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