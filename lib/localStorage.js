

const { comboDefaults } = require("../constants/defaults/comboFilterDefaults");
const { overlayDefaults } = require("../constants/defaults/overlayDefaults");
const { videoDefaults } = require("../constants/defaults/videoDefaults");
const { characters } = require("../constants/characters");
const { legalStages } = require("../constants/stages");
const { moves } = require("../constants/moves");

const arr = [
    {
        category: "combo",
        elementId: "char-1-select",
        default: comboDefaults.comboerChar,
        id: "comboerChar",
        type: "dropdown",
        options: characters
    },
    {
        category: "combo",
        elementId: "char-2-select",
        default: comboDefaults.comboeeChar,
        id: "comboeeChar",
        type: "dropdown",
        options: characters
    },
    {
        category: "combo",
        elementId: "stage-select",
        default: comboDefaults.stage,
        id: "stage",
        type: "dropdown",
        options: legalStages
    },
    {
        category: "combo",
        elementId: "min-moves",
        default: comboDefaults.minMoves,
        id: "minMoves",
        type: "numberInput"
    },
    {
        category: "combo",
        elementId: "max-moves",
        default: comboDefaults.maxMoves,
        id: "maxMoves",
        type: "numberInput"
    },
    {
        category: "combo",
        elementId: "min-damage",
        default: comboDefaults.minDamage,
        id: "minDamage",
        type: "numberInput"
    },
    {
        category: "combo",
        elementId: "first-move",
        default: comboDefaults.firstMove,
        id: "firstMove",
        type: "dropdown",
        options: moves
    },
    {
        category: "combo",
        elementId: "second-to-last-move",
        default: comboDefaults.secondToLastMove,
        id: "secondToLastMove",
        type: "dropdown",
        options: moves
    },
    {
        category: "combo",
        elementId: "test-move",
        default: comboDefaults.testMove,
        id: "testMove",
        type: "dropdown",
        options: moves
    },
    {
        category: "combo",
        elementId: "end-move",
        default: comboDefaults.endMove,
        id: "endMove",
        type: "dropdown",
        options: moves
    },
    {
        category: "combo",
        elementId: "comboer-tag",
        default: comboDefaults.comboer,
        id: "comboerTag",
        type: "textInput"
    },
    {
        category: "combo",
        elementId: "comboee-tag",
        default: comboDefaults.comboee,
        id: "comboeeTag",
        type: "textInput"
    },
    {
        category: "combo",
        elementId: "did-kill",
        default: comboDefaults.didKill,
        id: "didKill",
        type: "checkbox"
    },
    {
        category: "video",
        elementId: "dev-mode",
        default: videoDefaults.devMode,
        id: "devMode",
        type: "checkbox"
    },
    {
        category: "video",
        elementId: "show-overlay",
        default: videoDefaults.showOverlay,
        id: "showOverlay",
        type: "checkbox"
    },
    {
        category: "video",
        elementId: "hide-hud",
        default: videoDefaults.hideHud,
        id: "hideHud",
        type: "checkbox"
    },
    {
        category: "video",
        elementId: "game-music",
        default: videoDefaults.gameMusic,
        id: "gameMusic",
        type: "checkbox"
    },
    {
        category: "video",
        elementId: "widescreen-off",
        default: videoDefaults.widescreenOff,
        id: "widescreenOff",
        type: "checkbox"
    },
    {
        category: "video",
        elementId: "widescreen-off",
        default: videoDefaults.widescreenOff,
        id: "widescreenOff",
        type: "checkbox"
    },
    {
        category: "video",
        elementId: "last-combo-offset",
        default: videoDefaults.lastComboOffset,
        id: "lastComboOffset",
        type: "numberInput"
    },
    {
        category: "video",
        elementId: "num-cpus",
        default: videoDefaults.numCPUs,
        id: "numCPUs",
        type: "numberInput"
    },
    {
        category: "video",
        elementId: "iso-path",
        default: videoDefaults.isoPath,
        id: "isoPath",
        type: "textInput"
    },
    {
        category: "video",
        elementId: "output-path",
        default: videoDefaults.outputPath,
        id: "outputPath",
        type: "textInput"
    },
    {
        category: "video",
        elementId: "shuffle",
        default: videoDefaults.shuffle,
        id: "shuffle",
        type: "checkbox"
    },
    {
        category: "video",
        elementId: "slice",
        default: videoDefaults.slice,
        id: "slice",
        type: "textInput"
    },
    {
        category: "overlay",
        elementId: "show-player-tags",
        default: overlayDefaults.showPlayerTags,
        id: "showPlayerTags",
        type: "checkbox"
    },
    {
        category: "overlay",
        elementId: "show-tournament",
        default: overlayDefaults.showTournament,
        id: "showTournament",
        type: "checkbox"
    },
    {
        category: "overlay",
        elementId: "show-logo",
        default: overlayDefaults.showLogo,
        id: "showLogo",
        type: "checkbox"
    },
    {
        category: "overlay",
        elementId: "logo-path",
        default: overlayDefaults.logoPath,
        id: "logoPath",
        type: "textInput"
    },
    {
        category: "overlay",
        elementId: "logo-opacity",
        default: overlayDefaults.logoOpacity,
        id: "logoOpacity",
        type: "numberInput"
    },
    {
        category: "overlay",
        elementId: "textbox-opacity",
        default: overlayDefaults.textboxOpacity,
        id: "textboxOpacity",
        type: "numberInput"
    },
    {
        category: "overlay",
        elementId: "show-date",
        default: overlayDefaults.showDate,
        id: "showDate",
        type: "checkbox"
    },
    {
        category: "overlay",
        elementId: "show-logo",
        default: overlayDefaults.showLogo,
        id: "showLogo",
        type: "checkbox"
    },
    {
        category: "overlay",
        elementId: "show-round",
        default: overlayDefaults.showRound,
        id: "showRound",
        type: "checkbox"
    },
    {
        category: "overlay",
        elementId: "font-path",
        default: overlayDefaults.fontPath,
        id: "fontPath",
        type: "textInput"
    },
]

function render(){
    arr.forEach(a => {
        const element = $(`#${a.elementId}`)
        switch(a.type){
            case "dropdown":
                a.options.forEach(o => {
                    const option = $(`<option value="${o.id}">${o.shortName}</option>`)
                    element.append(option)
                });
                if(typeof localStorage[a.id] === "string"){
                    element.val(localStorage[a.id])
                } else {
                    element.val(a.default)
                }
                element.change(function(){localStorage[a.id] = $(this).val()})
                return
            case "textInput":
                if( localStorage[a.id] ){
                    element.val(localStorage[a.id])
                } else {
                    element.val(a.default)
                }
                element.change(function(){localStorage[a.id] = $(this).val()})
                return
            case "numberInput":
                if( localStorage[a.id] ){
                    element.val(localStorage[a.id])
                } else {
                    element.val(a.default)
                }
                element.change(function(){ 
                    if(!Number.isInteger(parseFloat(this.value))){
                        alert("Please enter a whole number");
                        this.value = a.default;
                        return;
                    }
                    localStorage[a.id] = this.value 
                })
                return
            case "checkbox":
                if( typeof localStorage[a.id] === "string" ){
                    element.prop('checked', localStorage[a.id] == "true" )
                } else {
                    element.prop('checked', a.default)
                }
                element.change(function(){localStorage[a.id] = this.checked})
                return
        }
    })

}

function getOptions(category){
    const options = {}
    arr.filter(a=>a.category == category).forEach(a => {
        const element = $(`#${a.elementId}`)
        if(a.type == "checkbox"){
            options[a.id] = element.is(":checked");
        } else {
            options[a.id] = element.val()
        }
    })
    return options
}
function resetToDefaults(category){
    arr.filter(a=>a.category==category).forEach(a => {
        const element = $(`#${a.elementId}`)
        if(a.type == "checkbox"){
            element.prop('checked', a.default ) 
        } else {
            element.val(a.default)
        }
        delete localStorage[a.id]
    })
}

module.exports = {
    render,
    getOptions,
    resetToDefaults
}