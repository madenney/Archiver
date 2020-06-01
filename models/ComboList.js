
const slpToVideo = require("slp-to-video");
const fs = require("fs");
const events = require("events");
const path = require("path");
const { PythonShell} = require("python-shell");
const config = require("../config.json");
const crypto = require("crypto");
const os = require("os");
const { characters } = require("../constants/characters");


const VIDEO_OUTPUT_PATH = path.resolve(path.join(config.AIRLOCK_PATH,"output.avi"));
const REPLAYS_JSON_PATH = path.resolve(path.join(config.AIRLOCK_PATH,"replays.json"));
const SSBM_ISO_PATH = path.resolve(config.SSBM_ISO_PATH);
const DOLPHIN_PATH = path.resolve("./node_modules/slp-to-video/Ishiiruka/build/Binaries/dolphin-emu");
const NUM_PROCESSES = 7;
const VIDEO_WIDTH = 1878;
const VIDEO_HEIGHT = 1056;

class ComboList {

    constructor(combos){
        if(combos){
            this.combos = combos;
        } else {
            this.combos = [];
        }

        if(!fs.existsSync(config.SSBM_ISO_PATH)){
            throw "HEY, YOUR SSBM_ISO_PATH is invalid. Check config.json";
        }
        if(!fs.existsSync(config.AIRLOCK_PATH)){
            throw "HEY, YOUR AIRLOCK_PATH is invalid. Check config.json";
        }
        if(!fs.existsSync(DOLPHIN_PATH)){
            throw "HEY, I couldn't find dolphin-emu in your slp-to-video module. Did you run './setup.sh'?";
        }

    }

    generateOverlay({
        outputPath = null,
        char1Id = null,
        char2Id = null,
        name1 = null,
        name2 = null,
        tournament = null,
        date = null,
        logoPath = null,
        margin = null,
        fontPath = null,
        devText = null
    } = {}) {
        //TODO throw errors for outputPath, charIds, etc.
        let icon1 = characters[char1Id].img
        let icon2 = characters[char2Id].img
        let args = [outputPath,
            icon1, 
            icon2, 
            VIDEO_WIDTH,
            VIDEO_HEIGHT,
         ]
        if(name1) args.push("--name1=" + name1);
        if(name2) args.push("--name2=" + name2);
        if(tournament) args.push("--tournament=" + tournament);
        if(date) args.push("--date=" + date);
        if(logoPath) args.push("--logoPath=" + logoPath);
        if(margin) args.push("--margin=" + margin);
        if(fontPath) args.push("--fontPath=" + fontPath);
        //TODO check type (should be array of strings)
        if(devText){
            let line, devTextArg = "";
            for(line of devText){
                devTextArg += (line + ";");
            }
            devTextArg = devTextArg.slice(0,-1);
            args.push("--devText=" + devTextArg)
        }
        let options = {
            mode: "text",
            pythonOptions: ["-u"],
            scriptPath: "./python",
            args: args
        };

        PythonShell.run("overlay.py", options, function(err, results){
            if (err) throw err;
            console.log("results: %j", results);
        });
    }

    generateVideo(){
        return new Promise( async (resolve,reject) => {
            //Testing
            this.generateOverlay({
                outputPath : "./test_files/overlay.png", 
                char1Id : 0, 
                char2Id : 20, 
                name1 : "Nash", 
                name2 : "Matt", 
                tournament : "Half Moon 69", 
                logoPath : "./images/overlay/logos/Half Moon.png",
                devText : ["dev text", "dev text line 2"]
            });
            console.log(poo)

            const tmpdir = path.join(os.tmpdir(),
                          `tmpo-${crypto.randomBytes(12).toString('hex')}`);
            var overlayPath;
            fs.mkdirSync(tmpdir);
            console.log(`Generating videos using ${NUM_PROCESSES} cpus`);
            const json = [{"outputPath": VIDEO_OUTPUT_PATH,"replays": []}]
            this.combos.forEach(combo => {
                console.log(combo);
                console.log(combo.game.players);
                overlayPath = path.join(tmpdir, crypto.randomBytes(12).toString('hex') + ".png");
                this.generateOverlay(overlayPath, 
                                     combo.game.players[0].characterId, 
                                     combo.game.players[1].characterId,
                                     combo.game.players[0].nametag,
                                     combo.game.players[1].nametag
                                     );
                json[0].replays.push({
                    replay: combo.game.slpPath,
                    startFrame: combo.combo.startFrame,
                    endFrame: combo.combo.endFrame,
                    overlayPath: overlayPath
                })
            });
            fs.writeFileSync(REPLAYS_JSON_PATH,JSON.stringify(json));
            const em = new events.EventEmitter();
            const config = {
                INPUT_FILE: REPLAYS_JSON_PATH,
                DOLPHIN_PATH,
                SSBM_ISO_PATH,
                NUM_PROCESSES,
                EVENT_TRACKER: em
            }
            em.on('primaryEventMsg',msg => {
                console.log(msg);
            });
            const totalVideos = this.combos.length;
            em.on('count', count => {
                console.log(`${count}/${totalVideos}`);
            });
            const skippedFiles = [];
            em.on('errorEventMsg',(msg,file) => {
                console.log(msg);
                skippedFiles.push(file);
            })
            /*
            try {
                await slpToVideo(config);
                console.log("Skipped Files: ", skippedFiles.length, skippedFiles );
                resolve();

            } catch(err){
                console.log("Error occurred in slp-to-video");
                reject(err);
            }*/
            fs.rmdirSync(tmpdir, { recursive: True });
            //TODO fs.unlink! otherwise files won't actually be removed
        });
    }

    totalSeconds(){
        const totalFrames = this.combos.reduce((n,c) => {
            return (c.endFrame - c.startFrame) + n
        }, 0);

        return totalFrames / 60;
    }

}

module.exports = { ComboList }