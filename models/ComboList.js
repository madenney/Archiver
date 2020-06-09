
const slpToVideo = require("slp-to-video");
const fs = require("fs");
const rimraf = require("rimraf");
const events = require("events");
const path = require("path");
const { PythonShell} = require("python-shell");
const config = require("../config.json");
const crypto = require("crypto");
const os = require("os");
const { characters } = require("../constants/characters");

const DOLPHIN_PATH = path.resolve("./node_modules/slp-to-video/Ishiiruka/build/Binaries/dolphin-emu");
const VIDEO_WIDTH = 1878;
const VIDEO_HEIGHT = 1056;

class ComboList {

    constructor(combos){
        if(combos){
            this.combos = combos;
        } else {
            this.combos = [];
        }

        if(process.env.DEVELOPMENT){
            console.log("Skipping regular checks because DEV")
            return
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

    generateVideo(options){

        console.log(this.combos);

        return;
        return new Promise( async (resolve,reject) => {
  
            // await this.generateOverlay({
            //     outputPath : path.resolve(path.join(config.AIRLOCK_PATH,"overlay.png")), 
            //     char1Id : 0, 
            //     char2Id : 20, 
            //     name1 : "Captain Faceroll", 
            //     name2 : "Action Bastard", 
            //     tournament : "Half Moon 55", 
            //     logoPath : "./images/overlay/logos/Half Moon.png",
            //     devText : ["hello", "world"]
            // });
            
            const tmpDir = path.join(os.tmpdir(),
                          `tmp-${crypto.randomBytes(12).toString('hex')}`);
            fs.mkdirSync(tmpDir);
            let outputFileName = "output.avi";
            let count = 1;
            while(fs.existsSync(path.resolve(`${outputPath}/${outputFileName}`))){
                outputFileName = `output${count++}.avi`
            }
            const json = [{"outputPath": outputFileName,"replays": []}]
            const overlayPromises = [];
            this.combos.forEach((combo,index) => {
                
                const replayJSON = {
                    replay: combo.game.slpPath,
                    startFrame: combo.combo.startFrame,
                    endFrame: combo.combo.endFrame
                }
                if(options.showOverlay){
                    const overlayPath = path.join(tmpDir, crypto.randomBytes(12).toString('hex') + ".png");
                    replayJSON.overlayPath = overlayPath
                    overlayPromises.push(this.generateOverlay(overlayPath,{...combo, index },options));
                }
                json[0].replays.push(replayJSON);
            });
            await Promise.all(overlayPromises);

            fs.writeFileSync(path.join(tmpDir,`replays.json`),JSON.stringify(json));
            const em = new events.EventEmitter();
            const slpToVideoConfig = {
                INPUT_FILE: path.join(tmpDir,`replays.json`),
                DOLPHIN_PATH,
                SSBM_ISO_PATH: options.isoPath,
                NUM_PROCESSES: options.numCPUs,
                EVENT_TRACKER: em,
                GAME_MUSIC_ON: options.gameMusic,
                HIDE_HUD: !options.showHud,
                WIDESCREEN_OFF: !options.widescreen
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
                await slpToVideo(slpToVideoConfig);
                console.log("Skipped Files: ", skippedFiles.length, skippedFiles );
                resolve();

            } catch(err){
                console.log("Error occurred in slp-to-video");
                reject(err);
            }
            await rimraf(tmpDir);
        });
    }

    generateOverlay(outputPath, combo, options){ 
        //{outputPath,char1Id,char2Id,name1,name2,tournament,date,logoPath,margin,fontPath,devText}
        const { index, comboerTag, comboeeTag, comboer, comboee, tournament, date } = combo
        const { showPlayerTags, showTournament, showLogo, showDate, logoPath, overlayMargin, fontPath, devMode } = options
        if(typeof char1Id === undefined || typeof char2Id === undefined || !outputPath ) throw "Combolist.generateOverlay missing required parameter"
        const icon1 = characters[char1Id].img
        const icon2 = characters[char2Id].img

        const args = [outputPath, icon1,icon2,VIDEO_WIDTH, VIDEO_HEIGHT]

        if(name1) args.push("--name1=" + name1);
        if(name2) args.push("--name2=" + name2);
        if(tournament) args.push("--tournament=" + tournament);
        if(date) args.push("--date=" + date);
        if(logoPath) args.push("--logoPath=" + logoPath);
        if(margin) args.push("--margin=" + margin);
        if(fontPath) args.push("--fontPath=" + fontPath);

        if(devText){
            let line, devTextArg = "";
            for(line of devText){
                devTextArg += (line + ";");
            }
            devTextArg = devTextArg.slice(0,-1);
            args.push("--devText=" + devTextArg)
        }
        const pyShellOptions = {
            mode: "text",
            pythonPath: 'python3',
            pythonOptions: ["-u"],
            scriptPath: "./python",
            args: args
        };
        return new Promise((resolve,reject) => {
            PythonShell.run("overlay.py", pyShellOptions, (err, results) => {
                if (err) throw err;
                resolve()
            });
        })
    }

    totalSeconds(){
        const totalFrames = this.combos.reduce((n,c) => {
            return (c.endFrame - c.startFrame) + n
        }, 0);

        return totalFrames / 60;
    }

}

module.exports = { ComboList }