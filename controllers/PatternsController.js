

const { Pattern } = require("../models/Pattern")
const patternTypes = ["slpParser","combo","edgeguard","single","custom","default"]
const uuidv4 = require("uuid/v4")
const arrayMove = require('array-move');

const localStorageController = require("./LocalStorageController")

class PatternsController {

    constructor(archive){
        this.archive = archive
        this.assignClickListeners()
        this.renderGameSettingsData();
        this.renderPatterns();
    }

    renderPatterns(){

        const patternsList = $("#patterns-list")
        patternsList.empty()
        this.archive.patterns.forEach( pattern => {
            const patternRow = $(`<div id='${pattern.id}' class='pattern-row'></div>`)
            const active = $(`<input ${pattern.active ? "checked": ""} class='active-checkbox' type='checkbox'>`)
            const title = $(`<div class='title'>${pattern.type}</div>`)
            const edit = $(`<button class='edit'>Edit</button>`)
            const exit = $(`<div class='delete'>✕</div>`)
            active.change(e => {
                console.log(active.prop("checked"))
                pattern.active = active.prop("checked")
                this.renderPatterns() 
            });
            title.click(() => { console.log(pattern)})
            edit.click(() => {
                this.renderPatternEditor(pattern);
            })
            exit.click(() => {
                this.archive.patterns.splice(this.archive.patterns.indexOf(pattern),1)
                this.renderPatterns();
            })
            const results = $(`
                <div class="results ${pattern.isProcessed ? "processed" : ""}">${pattern.isProcessed ? pattern.length : "-"}</div>
            `)
            patternRow.append(active)
            patternRow.append(title)
            patternRow.append(edit)
            patternRow.append(results)
            patternRow.append(exit)
            switch(pattern.type){
                case "slpParser":
                case "combo":
                case "edgeguard":
                case "single":
                case "custom":
            }
            patternsList.append(patternRow)
        })
    }

    renderPatternEditor(pattern){
        $("#edit-pattern-modal").show();

    }

    

    assignClickListeners(){

        // Game Settings Reset
        $("#reset-gamesettings-button").off().click(() => {
            localStorageController.resetToDefaults("gameSettings")
            this.renderGameSettingsData();
        })

        // Apply Game Settings Data
        $("#apply-gamesettings-button").off().click(this.renderGameSettingsData.bind(this))


        // Add Pattern Button
        $("#add-patterns-button").click(() => {
            const newPattern = new Pattern({type: "default", id: uuidv4(), active: true})
            this.archive.patterns.push(newPattern)
            this.renderPatternEditor(newPattern)
            this.renderPatterns()
        })

        let previousValue = "default"
        $("#pattern-method-type-select").on("click",(e) => {
            previousValue = e.target.value
        }).change( e => {
            $(`#${previousValue}-new-pattern`).hide();
            $(`#${e.target.value}-new-pattern`).show();
        })

        $("#patterns-list").sortable({
            stop: (event, ui) => {
                const pattern = this.archive.patterns.find(p => p.id === ui.item.attr('id'))
                const originalIndex = this.archive.patterns.indexOf(pattern);
                arrayMove.mutate(this.archive.patterns,originalIndex,ui.item.index())
            },
            scroll: true,
            scrollSpeed:50
        });

        $("#slpParser-new-pattern-combo-direction").click(() => {

        })
    }

    renderGameSettingsData(){
        const options = localStorageController.getOptions("gameSettings");
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

module.exports = { PatternsController }