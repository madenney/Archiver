
const { gameDefaults } = require("../constants/UI_defaults/gameDefaults");
const { videoDefaults } = require("../constants/UI_defaults/videoDefaults");
const { characters } = require("../constants/characters");
const { legalStages } = require("../constants/stages");
const { moves } = require("../constants/moves");

const arr = [
    {
        category: "gameSettings",
        elementId: "char-1-select",
        default: gameDefaults.comboerChar,
        id: "comboerChar",
        type: "dropdown",
        options: characters
    },
    {
        category: "gameSettings",
        elementId: "char-2-select",
        default: gameDefaults.comboeeChar,
        id: "comboeeChar",
        type: "dropdown",
        options: characters
    },
    {
        category: "gameSettings",
        elementId: "player1-tag",
        default: gameDefaults.comboer,
        id: "player1Tag",
        type: "textInput"
    },
    {
        category: "gameSettings",
        elementId: "player2-tag",
        default: gameDefaults.comboee,
        id: "player2Tag",
        type: "textInput"
    },
    {
        category: "gameSettings",
        elementId: "stage-select",
        default: gameDefaults.stage,
        id: "stage",
        type: "dropdown",
        options: legalStages
    },
    {
        category: "combo",
        elementId: "min-moves",
        default: gameDefaults.minMoves,
        id: "minMoves",
        type: "numberInput"
    },
    {
        category: "combo",
        elementId: "max-moves",
        default: gameDefaults.maxMoves,
        id: "maxMoves",
        type: "numberInput"
    },
    {
        category: "combo",
        elementId: "min-damage",
        default: gameDefaults.minDamage,
        id: "minDamage",
        type: "numberInput"
    },
    {
        category: "combo",
        elementId: "first-move",
        default: gameDefaults.firstMove,
        id: "firstMove",
        type: "dropdown",
        options: moves
    },
    {
        category: "combo",
        elementId: "second-to-last-move",
        default: gameDefaults.secondToLastMove,
        id: "secondToLastMove",
        type: "dropdown",
        options: moves
    },
    {
        category: "combo",
        elementId: "test-move",
        default: gameDefaults.testMove,
        id: "testMove",
        type: "dropdown",
        options: moves
    },
    {
        category: "combo",
        elementId: "test-value",
        default: gameDefaults.testVal,
        id: "testVal",
        type: "floatInput"
    },
    {
        category: "combo",
        elementId: "end-move",
        default: gameDefaults.endMove,
        id: "endMove",
        type: "dropdown",
        options: moves
    },
    {
        category: "combo",
        elementId: "did-kill",
        default: gameDefaults.didKill,
        id: "didKill",
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
    }
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
            case "floatInput":
                if( localStorage[a.id] ){
                    element.val(localStorage[a.id])
                } else {
                    element.val(a.default)
                }
                element.change(function(){
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