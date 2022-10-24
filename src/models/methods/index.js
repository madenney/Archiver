const files = require("./files").default
const slpParser = require("./slpParser").default
const comboFilter = require("./comboFilter").default
const edgeguards = require("./edgeguards").default
const actionStates = require("./actionStates").default
const windowFilter = require("./windowFilter").default
const stomp = require("./stomp").default
const animeFalco = require("./animeFalco").default
const comboStats = require("./comboStats").default

export default {
    files, slpParser, comboFilter, edgeguards, 
    actionStates, windowFilter, comboStats,
    stomp, animeFalco
}