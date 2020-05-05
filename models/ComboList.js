
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
const VIDEO_WIDTH = 1920;
const VIDEO_HEIGHT = 1080;

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

    generateOverlay(outputPath, char1Id, char2Id, name1="???", name2="???"){
        let icon1 = characters[char1Id].img
        let icon2 = characters[char2Id].img

        let options = {
            mode: "text",
            pythonOptions: ["-u"],
            scriptPath: "./python",
            args: [outputPath, 
                   name1,
                   name2, 
                   icon1, 
                   icon2, 
                   VIDEO_WIDTH,
                   VIDEO_HEIGHT
                ]
        };

        PythonShell.run("overlay.py", options, function(err, results){
            if (err) throw err;
            console.log("results: %j", results);
        });
    }

    generateVideo(){
        return new Promise( async (resolve,reject) => {
            
            this.generateOverlay("./test_files/overlay.png", 0, 20, "Nash", "Mad Matt");
            const tmpdir = path.join(os.tmpdir(),
                          `tmpo-${crypto.randomBytes(12).toString('hex')}`);
            var overlayPath;
            fs.mkdirSync(tmpdir);
            console.log(`Generating videos using ${NUM_PROCESSES} cpus`);
            const json = [{"output_path": VIDEO_OUTPUT_PATH,"replays": []}]
            this.combos.forEach(combo => {
                console.log(combo);
                console.log(combo.game.players);
                overlayPath = path.join(tmpdir, crypto.randomBytes(12).toString('hex') + ".png");
                this.generateOverlay(overlayPath, 
                                     combo.game.players[0].characterId, 
                                     combo.game.players[1].characterId,
                                     combo.game.players[0].nametag,
                                     combo.game.players[1].nametag);
                json[0].replays.push({
                    replay: combo.game.slpPath,
                    startFrame: combo.combo.startFrame,
                    endFrame: combo.combo.endFrame,
                    overlay: overlayPath
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