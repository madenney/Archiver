// measure names
const slpParser = require("slp-parser-js")
const Archive = require("Archive")

const game = new slpParser.default( "" )

const settings = game.getSettings()

console.log(settings)
