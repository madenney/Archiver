
const slpToVideo = require("slp-to-video");
const fs = require("fs");
const OUTPUT_PATH = "/Users/mattdenney/Projects/Archiver/airlock/output.avi";
const {PythonShell} = require ("python-shell");

class ComboList {

    constructor(combos){
        if(combos){
            this.combos = combos;
        } else {
            this.combos = [];
        }

    }

    generateVideo(){
        return new Promise( async (resolve,reject) => {
            
            const json = [
                {
                    "output_path": OUTPUT_PATH,
                    "replays": []
                }
            ]
            
            //TODO overlay section
            let options = {
                mode: "text",
                pythonOptions: ["-u"],
                scriptPath: "./python",
                args: [
                    ]
            };

            this.combos.forEach(combo => {
                json[0].replays.push({
                    replay: combo.game.slpPath,
                    startFrame: combo.combo.startFrame,
                    endFrame: combo.combo.endFrame,
                    overlayPath: null
                })
            });

            fs.writeFileSync("/Users/mattdenney/Projects/Archiver/airlock/replays.json",JSON.stringify(json));
            const config = {
                inputFile: "/Users/mattdenney/Projects/Archiver/airlock/replays.json",
                dolphinPath: "/Users/mattdenney/Projects/Archiver/node_modules/slp-to-video/Ishiiruka/build/Binaries/dolphin-emu",
                ssbmIsoPath: "/Users/mattdenney/Projects/melee.iso",
                numCPUs: 2
            }
            try {
                await slpToVideo(config);
                resolve();
            } catch(err){
                console.log("Error occurred while generating video:");
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