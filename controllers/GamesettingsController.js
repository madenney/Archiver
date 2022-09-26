
const localStorageController = require("./LocalStorageController")

class GamesettingsController {

    constructor(archive){
        this.archive = archive
        this.assignClickListeners();
        this.renderData();
    }


    assignClickListeners(){
        $("#reset-gamesettings-button").off().click(() => {
            localStorageController.resetToDefaults("gameSettings")
            this.renderData();
        })

        $("#apply-gamesettings-button").off().click(this.renderData.bind(this))
    }

    renderData(){
        const options = localStorageController.getOptions("gameSettings");
        console.log(options)
        const files = this.archive.getFiles({
            stage: options.stage,
            char1: options.comboerChar ,
            char2: options.comboeeChar,
            player1: options.player1Tag,
            player2: options.player2Tag
        })
        $("#total-files-gamesettings").html(files.length)
    }

}

module.exports = { GamesettingsController }