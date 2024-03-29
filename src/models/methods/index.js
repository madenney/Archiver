const files = require("./files").default
const slpParser = require("./slpParser").default
const comboFilter = require("./comboFilter").default
const edgeguards = require("./edgeguards").default
const actionStates = require("./actionStates").default
const windowFilter = require("./windowFilter").default
const reverse = require("./reverse").default
const custom = require("./custom").default
const stomp = require("./stomp").default
const animeFalco = require("./animeFalco").default
const beatsPerMango = require("./beatsPerMango").default
const comboStats = require("./comboStats").default
const multiverse = require("./multiverse").default
const endOfStock = require("./endOfStock").default
const zeldaParser = require("./zeldaParser").default
const scrubbleJump = require("./scrubbleJump").default
const alternatingDimensions = require("./alternatingDimensions").default
const removeStarKOFrames = require("./removeStarKOFrames").default
const deathDirection = require("./deathDirection").default
const sort = require("./sort").default

export default {
    files, slpParser, comboFilter, edgeguards, 
    actionStates, windowFilter, comboStats,
    stomp, animeFalco, beatsPerMango, multiverse,
    sort, stomp, animeFalco, alternatingDimensions,
    removeStarKOFrames, scrubbleJump, endOfStock,
    zeldaParser, custom, reverse, deathDirection
}