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