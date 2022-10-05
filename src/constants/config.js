import { legalStages } from "./stages"
import { sortedCharacters } from "./characters"
import { moves } from "./moves"


export const patternsConfig = [
    {
        type: "file",
        options: [
            {
                name: "Stage",
                id: "stage",
                type: "dropdown",
                options: legalStages,
                default: ""
            },
            {
                name: "Char 1",
                id: "char1",
                type: "dropdown",
                options: sortedCharacters,
                default: ""
            },
            {
                name: "Char 2",
                id: "char2",
                type: "dropdown",
                options: sortedCharacters,
                default: ""
            },
            {
                name: "Player 1",
                id: "player1",
                type: "textInput",
                default: ""
            },
            {
                name: "Player 2",
                id: "player2",
                type: "textInput",
                default: ""
            },
        ]
    },{
        type: "slpParser",
        options: [
            {
                name: "Min Hits",
                id: "minHits",
                type: "int",
                default: ""
            },
            {
                name: "Max Files",
                id: "maxFiles",
                type: "int",
                default: ""
            },
            {
                name: "Comboer Char",
                id: "comboerChar",
                type: "dropdown",
                options: sortedCharacters,
                default: ""
            },
            {
                name: "Comboee Char",
                id: "comboeeChar",
                type: "dropdown",
                options: sortedCharacters,
                default: ""
            },
            {
                name: "Comboer Tag",
                id: "comboerTag",
                type: "textInput",
                default: ""
            },
            {
                name: "Comboee Tag",
                id: "comboeeTag",
                type: "textInput",
                default: ""
            },
            {
                name: "Did Kill",
                id: "didKill",
                type: "checkbox",
                default: false
            }
        ]
    },{
        type: "comboFilter",
        options: [
            {
                name: "Min Hits",
                id: "minHits",
                type: "int",
                default: ""
            },
            {
                name: "Max Hits",
                id: "maxHits",
                type: "int",
                default: ""
            },
            {
                name: "Min Damage",
                id: "minDamage",
                type: "int",
                default: ""
            },
            {
                name: "Comboer Char",
                id: "comboerChar",
                type: "dropdown",
                options: sortedCharacters,
                default: ""
            },
            {
                name: "Comboee Char",
                id: "comboeeChar",
                type: "dropdown",
                options: sortedCharacters,
                default: ""
            },
            {
                name: "Comboer Tag",
                id: "comboerTag",
                type: "textInput",
                default: ""
            },
            {
                name: "Comboee Tag",
                id: "comboeeTag",
                type: "textInput",
                default: ""
            },
            {
                name: "Did Kill",
                id: "didKill",
                type: "checkbox",
                default: false
            },
            {
                name: "Nth Moves",
                id: "nthMoves",
                type: "nthMoves",
                options: moves,
                default: [],
                moves: []
            }
        ]
    },{
        type: "edgeguard",
        options: [
            {
                name: "Max Files",
                id: "maxFiles",
                type: "int",
                default: ""
            },
            {
                name: "Comboer Char",
                id: "comboerChar",
                type: "dropdown",
                options: sortedCharacters,
                default: ""
            },
            {
                name: "Comboee Char",
                id: "comboeeChar",
                type: "dropdown",
                options: sortedCharacters,
                default: ""
            },
            {
                name: "Comboer Tag",
                id: "comboerTag",
                type: "textInput",
                default: ""
            },
            {
                name: "Comboee Tag",
                id: "comboeeTag",
                type: "textInput",
                default: ""
            }
        ]
    }
]

const keys = ["hideHud", "gameMusic", "numCPUs", "isoPath", "ishiirukaPath", "shuffle","slice",
"lastComboOffset", "screenShake"]

export const videoConfig = [
    {
        label: "Hide Hud",
        default: false,
        id: "hideHud",  
        type: "checkbox"
    },
    {
        label: "Game Music",
        default: false,
        id: "gameMusic",
        type: "checkbox"
    },
    {
        label: "Enable Chants",
        default: false,
        id: "enableChants",
        type: "checkbox"
    },
    {
        label: "No Screen Shake",
        default: false,
        id: "screenShake",
        type: "checkbox"
    },
    {
        label: "Hide Tags",
        default: false,
        id: "hideTags",
        type: "checkbox"
    },
    {
        label: "Hide Names",
        default: false,
        id: "hideNames",
        type: "checkbox"
    },
    {
        label: "Fixed Camera",
        default: false,
        id: "fixedCamera",
        type: "checkbox"
    },
    {
        label: "Concatenate",
        default: false,
        id: "concatenate",
        type: "checkbox"
    },
    {
        label: "Shuffle",
        default: false,
        id: "shuffle",
        type: "checkbox"
    },
    {
        label: "Resolution (1x-6x)",
        default: "1x",
        id: "resolution",
        type: "textInput"
    },
    {
        label: "Bitrate",
        default: 6000,
        id: "bitrateKbps",
        type: "textInput",
    },
    {
        label: "Add Start Frames",
        default: 0,
        id: "addStartFrames",
        type: "int"
    },
    {
        label: "Add End Frames",
        default: 0,
        id: "addEndFrames",
        type: "int"
    },
    {
        label: "Last Clip Offset",
        default: 0,
        id: "lastComboOffset",
        type: "int"
    },
    {
        label: "Num CPUs",
        default: 1,
        id: "numCPUs",
        type: "int"
    },
    {
        label: "ISO Path",
        default: "",
        id: "ssbmIsoPath",
        type: "openFile"
    },
    {
        label: "Dolphin Path",
        default: "",
        id: "dolphinPath",
        type: "openFile"
    },
    {
        label: "Output Directory",
        default: "",
        id: "outputPath",
        type: "openDirectory"
    },
    {
        label: "Slice",
        default: 0,
        id: "slice",
        type: "int"
    },
]