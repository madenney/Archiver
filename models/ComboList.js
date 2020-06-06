
const slpToVideo = require("slp-to-video");
const fs = require("fs");
const events = require("events");
const path = require("path");

const config = require("../config.json");


const VIDEO_OUTPUT_PATH = path.resolve(path.join(config.AIRLOCK_PATH,"output.avi"));
const REPLAYS_JSON_PATH = path.resolve(path.join(config.AIRLOCK_PATH,"replays.json"));
const SSBM_ISO_PATH = path.resolve(config.SSBM_ISO_PATH);
const DOLPHIN_PATH = path.resolve("./node_modules/slp-to-video/Ishiiruka/build/Binaries/dolphin-emu");
const NUM_PROCESSES = 8;

class ComboList {

    constructor(combos){
        if(combos){
            this.combos = combos;
        } else {
            this.combos = [];
        }

        if(process.env.DEVELOPMENT) return
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

    generateVideo(){
        return new Promise( async (resolve,reject) => {

            console.log(`Generating videos using ${NUM_PROCESSES} cpus`);
            const json = [{"outputPath": VIDEO_OUTPUT_PATH,"replays": []}]
            this.combos.forEach(combo => {
                //imagePath = createImage(combo);
                json[0].replays.push({
                    replay: combo.game.slpPath,
                    startFrame: combo.combo.startFrame,
                    endFrame: combo.combo.endFrame,
                    //overlay: imagePath
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
            try {
                await slpToVideo(config);
                console.log("Skipped Files: ", skippedFiles.length, skippedFiles );
                resolve();

            } catch(err){
                console.log("Error occurred in slp-to-video");
                reject(err);
            }
            
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