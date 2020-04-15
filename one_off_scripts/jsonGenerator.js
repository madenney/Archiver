
const { getFiles } = require("../lib/fileHandler")

const { default: SlippiGame } = require("slp-parser-js")

const vodsDir = "./vods"
const superVodsDir = ""

const main = function () {
    console.log("MAIN");

    const files = getFiles( vodsDir, true )

    console.log("FILE NAME", files[0].path)
    const game = new SlippiGame(files[0].path)
    // Get game settings – stage, characters, etc
    const settings = game.getSettings();
    console.log("SETTINGS", settings);

    // Get metadata - start time, platform played on, etc
    const metadata = game.getMetadata();
    console.log("META", metadata);

    // Get computed stats - openings / kill, conversions, etc
    const stats = game.getStats();
    console.log("conversions", stats.conversions.length );
    console.log("combos", stats.combos.length)

    const conversionsThatKilled = stats.conversions.filter( x => x.didKill)
    const combosThatKilled = stats.combos.filter( x => x.didKill)

    console.log("YO", conversionsThatKilled )
    console.log("HEY", combosThatKilled )


    // Get frames – animation state, inputs, etc
    // This is used to compute your own stats or get more frame-specific info (advanced)
    const frames = game.getFrames();
    //console.log(frames[0].players); // Print frame when timer starts counting down
}

main()