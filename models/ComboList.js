
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

        if(process.env.DEVELOPMENT) return
        if(!fs.existsSync(DOLPHIN_PATH)){
            throw "Could not find dolphin-emu in your slp-to-video module. Did you run './setup.sh'?";
        }

    }

    generateVideo(options){
        return new Promise( async (resolve,reject) => {
  
            console.log(options);
            console.log(this.combos);
            
            const tmpDir = path.join(os.tmpdir(),
                          `tmp-${crypto.randomBytes(12).toString('hex')}`);
            fs.mkdirSync(tmpDir);
            let outputFileName = "output.avi";
            let count = 1;
            while(fs.existsSync(path.resolve(`${options.outputPath}/${outputFileName}`))){
                outputFileName = `output${count++}.avi`
            }
            const json = [{"outputPath": path.resolve(`${options.outputPath}/${outputFileName}`),"replays": []}]
            const overlayPromises = [];
            this.combos.forEach((combo,index) => {
                
                const replayJSON = {
                    replay: combo.slpPath,
                    startFrame: combo.startFrame,
                    endFrame: combo.endFrame
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
            // rimraf(tmpDir, () => {
            //     console.log("removed tmpdir")
            // });
        });
    }

    generateOverlay(outputPath, combo, options){ 
        console.log("generate",options)
        //{outputPath,char1Id,char2Id,name1,name2,tournament,date,logoPath,margin,fontPath,devText}
        const { index, players, playerIndex, opponentIndex, tournament, startedAt } = combo
        const { showPlayerTags, showTournament, showLogo, showDate, overlayMargin, 
            logoOpacity, textboxOpacity, logoPath, fontPath, devMode } = options
        const devText = index;
        if(!outputPath ) throw "Combolist.generateOverlay missing required parameter"
        console.log(outputPath);
        const comboer = players.find(p=>p.playerIndex === playerIndex)
        const comboee = players.find(p=>p.playerIndex === opponentIndex)

        const icon1 = characters[comboer.characterId].img
        const icon2 = characters[comboee.characterId].img

        const args = [outputPath, icon1,icon2,VIDEO_WIDTH, VIDEO_HEIGHT]
        
        if(showPlayerTags){
            if(comboer.tag) args.push("--name1=" + comboer.tag);
            if(comboee.tag) args.push("--name2=" + comboee.tag);
        }
        if(showTournament && tournament && tournament.name) args.push("--tournament=" + tournament.name);
        if(showDate && startedAt) {
            const d = new Date(startedAt);
            args.push("--date=" + `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`)
        };
        if(overlayMargin) args.push("--margin=" + overlayMargin);
        
        if(logoOpacity) args.push("--logoOpacity=" + logoOpacity);
        if(textboxOpacity) args.push("--textboxOpacity=" + textboxOpacity);

        if(showLogo && logoPath) args.push("--logoPath=" + logoPath);
        if(fontPath) args.push("--fontPath=" + fontPath);
        
        if(devMode){
            let line, devTextArg = "";
            for(line of [devText]){
                devTextArg += (line + ";");
            }
            devTextArg = devTextArg.slice(0,-1);
            args.push("--devText=" + devTextArg)
        }
        console.log(args);
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