const slpToVideo = require("slp-to-video");
const fs = require("fs");
const rimraf = require("rimraf");
const path = require("path");
const { PythonShell} = require("python-shell");
const crypto = require("crypto");
const os = require("os");
const { characters } = require("../constants/characters");
const { shuffle } = require("../lib");
const DOLPHIN_PATH = path.resolve("./node_modules/slp-to-video/Ishiiruka/build/Binaries/dolphin-emu");
const VIDEO_WIDTH = 1920;
const VIDEO_HEIGHT = 1080;

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

    generateVideo(options,eventEmitter){
        return new Promise( async (resolve,reject) => {
  
            console.log("Options:",options);
            console.log("Combos:",this.combos);
            
            const overlayTmpDir = path.join(os.tmpdir(),
                          `tmp-${crypto.randomBytes(12).toString('hex')}`);
            const slpTmpDir = path.join(os.tmpdir(),
                          `tmp-${crypto.randomBytes(12).toString('hex')}`);
            fs.mkdirSync(overlayTmpDir);
            let outputFileName = "output.avi";
            let count = 1;
            while(fs.existsSync(path.resolve(`${options.outputPath}/${outputFileName}`))){
                outputFileName = `output${count++}.avi`
            }
            const json = [{"outputPath": path.resolve(`${options.outputPath}/${outputFileName}`),"replays": []}]
            const overlayPromises = [];

            if(options.shuffle) this.combos = shuffle(this.combos)
            this.combos.slice(0,options.slice).forEach((combo,index) => {

                // Fox Juggler
                // const firstMove = combo.moves.find(m=>m.moveId == 16)
                // const firstMoveIndex = combo.moves.indexOf(firstMove)
                // let breakerMove = combo.moves.slice(firstMoveIndex).find(m=>m.moveId != 16)
                // const replayJSON = {
                //     replay: combo.slpPath,
                //     startFrame: firstMove.frame - 20
                // }
                // if(!breakerMove){
                //     replayJSON.endFrame = breakerMove.frame + 40
                // } else {
                //     const lastMove = combo.moves[combo.moves.indexOf(breakerMove)-1]
                //     replayJSON.endFrame = lastMove.frame + 23
                // }

                // Marth dtilt
                // const replayJSON = {
                //     replay: combo.slpPath,
                //     startFrame: combo.endFrame - 150,
                //     endFrame: combo.endFrame - 20
                // }

                // Sheik ftilt->fair
                // const secondToLastHitFrame = combo.moves[combo.moves.length -2].frame;
                // const lastHitFrame = combo.moves[combo.moves.length -1].frame;
                // const replayJSON = {
                //     replay: combo.slpPath,
                //     startFrame: secondToLastHitFrame - 20,
                //     endFrame: lastHitFrame + 40
                // }
                // if(replayJSON.endFrame > combo.gameEndFrame){
                //     replayJSON.endFrame = combo.gameEndFrame - 1
                // }

                // Marth sideb->utilt
                // const secondToLastHitFrame = combo.moves[combo.moves.length -2].frame;
                // const lastHitFrame = combo.moves[combo.moves.length -1].frame;
                // const replayJSON = {
                //     replay: combo.slpPath,
                //     startFrame: secondToLastHitFrame - 60,
                //     endFrame: lastHitFrame + 60
                // }
                // if(replayJSON.endFrame > combo.gameEndFrame){
                //     replayJSON.endFrame = combo.gameEndFrame - 1
                // }

                // Stomp
                // const hitFrame = combo.moves[combo.moves.length -1].frame;
                // const replayJSON = {
                //     replay: combo.slpPath,
                //     startFrame: hitFrame - 20 + y,
                //     endFrame: hitFrame + 50 - y
                // }
                // x++
                // if(x%3==0)y++

                // if(replayJSON.startFrame === replayJSON.endFrame - 30 ) return;
                // if(replayJSON.endFrame > combo.gameEndFrame){
                //     replayJSON.endFrame = combo.gameEndFrame - 1
                // }


                // Normal
                const replayJSON = {
                    replay: combo.slpPath,
                    startFrame: combo.startFrame,
                    endFrame: combo.endFrame
                }
                if(combo.moves.length < 3 ){
                    replayJSON.startFrame -= 20
                } else {
                    replayJSON.startFrame -= 10
                }
                if(combo.didKill){
                    if(combo.endFrame < combo.gameEndFrame - 37 ){
                        replayJSON.endFrame += 36
                    } else if (combo.endFrame < combo.gameEndFrame - 21){
                        replayJSON.endFrame += 20
                    }
                } 

                if(options.showOverlay || options.devMode){
                    const overlayPath = path.join(overlayTmpDir, crypto.randomBytes(12).toString('hex') + ".png");
                    replayJSON.overlayPath = overlayPath
                    overlayPromises.push(this.generateOverlay(overlayPath,{...combo, index },options));
                }
                json[0].replays.push(replayJSON);
            });
            if(options.lastComboOffset){
                const replays = json[0].replays
                replays[replays.length-1].endFrame += parseInt(options.lastComboOffset)
                if( replays[replays.length-1].endFrame >
                this.combos[this.combos.length-1].gameEndFrame ){
                    replays[replays.length-1].endFrame = this.combos[this.combos.length-1].gameEndFrame - 1
                }
            }
            await Promise.all(overlayPromises);

            //fs.writeFileSync(path.join(tmpDir,`replays.json`),JSON.stringify(json));

            const slpToVideoConfig = {
                tmpdir: slpTmpDir,
                numProcesses: options.numCPUs,
                dolphinPath: DOLPHIN_PATH,
                ssbmIsoPath: options.isoPath,
                gameMusicOn: options.gameMusic,
                hideHud: options.hideHud,
                widescreenOff: options.widescreenOff,
                bitrateKbps: 15000,
                resolution: "2x"
              }

            try {
                console.log(json)
                await slpToVideo(json,slpToVideoConfig);
                resolve();
            } catch(err){
                console.log("Error occurred in slp-to-video");
                reject(err);
            }
            rimraf(overlayTmpDir, () => {
                console.log("removed tmpdir")
            });
        });
    }

    generateOverlay(outputPath, combo, options){ 
        //{outputPath,char1Id,char2Id,name1,name2,tournament,date,logoPath,margin,fontPath,devText}
        const { id, players, playerIndex, opponentIndex, startAt, tournamentName } = combo
        const { showOverlay, showPlayerTags, showTournament, showLogo, showDate, overlayMargin, 
            logoOpacity, textboxOpacity, logoPath, fontPath, devMode } = options
        const devText = id;
        if(!outputPath ) throw "Combolist.generateOverlay missing required parameter"
        
        const args = [outputPath, VIDEO_WIDTH, VIDEO_HEIGHT]

        if(showOverlay){

            const comboer = players.find(p=>p.playerIndex === playerIndex)
            const comboee = players.find(p=>p.playerIndex === opponentIndex)

            const icon1 = characters[comboer.characterId].img + 
                            characters[comboer.characterId].colors[comboer.characterColor] + ".png"
            const icon2 = characters[comboee.characterId].img + 
                            characters[comboee.characterId].colors[comboee.characterColor] + ".png"

            args.push("--icon1=" + icon1)
            args.push("--icon2=" + icon2)
            
            if(showPlayerTags){
                if(comboer.tag) args.push("--name1=" + comboer.tag);
                if(comboee.tag) args.push("--name2=" + comboee.tag);
            }
            if(showTournament && tournamentName ) args.push("--tournament=" + tournamentName);
            if(showDate && startAt) {
                const d = new Date(startAt * 1000);
                if(tournamentName) d.setHours(d.getHours()-8) // UTC -> PST
                args.push("--date=" + `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`)
            };
            if(overlayMargin) args.push("--margin=" + overlayMargin);
            
            if(logoOpacity) args.push("--logoOpacity=" + logoOpacity);
            if(textboxOpacity) args.push("--textboxOpacity=" + textboxOpacity);

            if(showLogo && logoPath) args.push("--logoPath=" + logoPath);
            if(fontPath) args.push("--fontPath=" + fontPath);
        }
        if(devMode){
            let line, devTextArg = "";
            for(line of [devText]){
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