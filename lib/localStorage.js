

const { comboDefaults } = require("../constants/defaults/comboFilterDefaults");
const { overlayDefaults } = require("../constants/defaults/comboFilterDefaults");
const { videoDefaults } = require("../constants/defaults/comboFilterDefaults");
const { characters } = require("../constants/characters");
const { stages } = require("../constants/stages");
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
        options: stages
    },
    {
        category: "combo",
        elementId: "min-moves",
        default: comboDefaults.minMoves,
        id: "minMoves",
        type: "dropdown",
        options: moves
    },
    {
        category: "combo",
        elementId: "max-moves",
        default: comboDefaults.maxMoves,
        id: "maxMoves",
        type: "dropdown",
        options: moves
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
        elementId: "char-1-select",
        default: comboDefaults.comboerChar,
        id: "comboerChar",
        type: "dropdown",
        options: characters
    },
]