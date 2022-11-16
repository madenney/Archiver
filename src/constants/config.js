import { legalStages } from "./stages"
import { sortedCharacters } from "./characters"
import { moves } from "./moves"
import { actionStates } from "./actionStates"


export const patternsConfig = [
    {
        id: "files",
        label: "Files",
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
        id: "slpParser",
        label: "Combo Parser",
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
        id: "comboFilter",
        label: "Combo Filter",
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
                name: "Stage",
                id: "comboStage",
                type: "dropdown",
                options: legalStages,
                default: ""
            },
            {
                name: "Did Kill",
                id: "didKill",
                type: "checkbox",
                default: false
            },
            {
                name: "Exclude ICs",
                id: "excludeICs",
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
        id: "edgeguards",
        label: "Edgeguards",
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
    },{
        id: "actionStates",
        label: "Action State",
        options: [
            {
                name: "Max Files",
                id: "maxFiles",
                type: "int",
                default: ""
            },
            {
                name: "Comboer State",
                id: "comboerActionState",
                type: "dropdown",
                options: actionStates,
                default: ""
            },
            {
                name: "Comboee State",
                id: "comboeeActionState",
                type: "dropdown",
                options: actionStates,
                default: ""
            },
            {
                name: "Comboer X Pos",
                id: "comboerXPos",
                type: "int",
                default: ""
            },
            {
                name: "Comboer Y Pos",
                id: "comboerYPos",
                type: "int",
                default: ""
            },
            {
                name: "Comboer Max D",
                id: "comboerMaxD",
                type: "int",
                default: ""
            },
            {
                name: "Comboee X Pos",
                id: "comboeeXpos",
                type: "int",
                default: ""
            },
            {
                name: "Comboee Y Pos",
                id: "comboeeYpos",
                type: "int",
                default: ""
            },
            {
                name: "Comboee Max D",
                id: "comboeeMaxD",
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
    },{
        id: "windowFilter",
        label: "Window Filter",
        options: [
            {
                name: "Max Files",
                id: "maxFiles",
                type: "int",
                default: ""
            },
            {
                name: "Start From",
                id: "startFrom",
                type: "int",
                default: 0
            },
            {
                name: "Search Range",
                id: "searchRange",
                type: "int",
                default: 0
            },
            {
                name: "Comboer State",
                id: "comboerActionState",
                type: "dropdown",
                options: actionStates,
                default: ""
            },
            {
                name: "Comboee State",
                id: "comboeeActionState",
                type: "dropdown",
                options: actionStates,
                default: ""
            },
            {
                name: "Comboer X Pos",
                id: "comboerXPos",
                type: "int",
                default: ""
            },
            {
                name: "Comboer Y Pos",
                id: "comboerYPos",
                type: "int",
                default: ""
            },
            {
                name: "Comboer Max D",
                id: "comboerMaxD",
                type: "int",
                default: ""
            },
            {
                name: "Comboee X Pos",
                id: "comboeeXpos",
                type: "int",
                default: ""
            },
            {
                name: "Comboee Y Pos",
                id: "comboeeYpos",
                type: "int",
                default: ""
            },
            {
                name: "Comboee Max D",
                id: "comboeeMaxD",
                type: "int",
                default: ""
            }
        ]
    },{
        id: "stomp",
        label: "Stomp",
        options: [
            {
                name: "Move",
                id: "move",
                type: "dropdown",
                options: moves
            },
        ]
    },{
        id: "sort",
        label: "Sort",
        options: [
            {
                name: "Start From",
                id: "startFrom",
                type: "int",
                default: 0
            },
        ]
    },{
        id: "removeStarKOFrames",
        label: "Remove Star KO Frames",
        options: []
    },{
        id: "animeFalco",
        label: "Anime Falco",
        options: []
    },{
        id: "multiverse",
        label: "Multi Verse",
        options: []
    },{
        id: "alternatingDimensions",
        label: "Alternate",
        options: []
    },{
        id: "beatsPerMango",
        label: "BPM",
        options: []
    },{
        id: "comboStats",
        label: "Combo Stats",
        options: [
            {
                name: "Depth",
                id: "depth",
                type: "int",
                default: 0
            }
        ]
    }
]


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
        id: "disableScreenShake",
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
        id: "lastClipOffset",
        type: "int"
    },
    {
        label: "Num CPUs",
        default: 1,
        id: "numCPUs",
        type: "int"
    },
    {
        label: "Slice",
        default: 0,
        id: "slice",
        type: "int"
    },
    {
        label: "Dolphin Cutoff",
        default: 300,
        id: "dolphinCutoff",
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
    }
]