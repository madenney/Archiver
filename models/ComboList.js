const slpToVideo = require("slp-to-video");
const fs = require("fs");
const rimraf = require("rimraf");
const path = require("path");
const { PythonShell} = require("python-shell");
const crypto = require("crypto");
const os = require("os");
const { characters } = require("../constants/characters");
const { legalStages } = require("../constants/stages");

const { shuffle, generateOverlay } = require('../lib');
const DOLPHIN_PATH = path.resolve("./node_modules/slp-to-video/Ishiiruka/build/Binaries/dolphin-emu");
const { videoConstants } = require('../constants/video');

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

    async generateVideoPerStage(options){

        const legalStages = [2,3,8,28,31,32]

        const json = [{
            outputPath: "/home/matt/Projects/airlock/fountain.avi",
            queue: []
        },{
            outputPath: "/home/matt/Projects/airlock/pokemon.avi",
            queue: []
        },{
            outputPath: "/home/matt/Projects/airlock/yoshis.avi",
            queue: []
        },{
            outputPath: "/home/matt/Projects/airlock/dreamland.avi",
            queue: []
        },{
            outputPath: "/home/matt/Projects/airlock/battlefield.avi",
            queue: []
        },{
            outputPath: "/home/matt/Projects/airlock/finalD.avi",
            queue: []
        }]

        this.combos.forEach(combo => {

            // Normal
            const replayJSON = {
                path: combo.slpPath,
                startFrame: combo.startFrame - 45,
                endFrame: combo.endFrame + 15
            }
        
            if(combo.didKill){
                if(combo.endFrame < combo.gameEndFrame - 37 ){
                    replayJSON.endFrame += 36
                } else if (combo.endFrame < combo.gameEndFrame - 21){
                    replayJSON.endFrame += 20
                }
            } 

            json[legalStages.indexOf(combo.stage)].queue.push(replayJSON)


        })

        const slpTmpDir = path.join(os.tmpdir(),
                          `tmp-${crypto.randomBytes(12).toString('hex')}`);

        const slpToVideoConfig = {
            fixedCamera: false,
            screenShakeOff: true,
            tmpdir: slpTmpDir,
            numProcesses: options.numCPUs,
            dolphinPath: DOLPHIN_PATH,
            ssbmIsoPath: options.isoPath,
            gameMusicOn: options.gameMusic,
            hideHud: options.hideHud,
            widescreenOff: options.widescreenOff,
            bitrateKbps: 30000,
            resolution: "6x"
        }

        try {
            console.log(json)
            console.log(slpToVideoConfig)
            await slpToVideo(json,slpToVideoConfig);
            resolve();
        } catch(err){
            console.log("Error occurred in slp-to-video");
            reject(err);
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
            const json = [{"outputPath": path.resolve(`${options.outputPath}/${outputFileName}`),"queue": []}]
            const overlayPromises = [];

            if(options.shuffle){
                this.combos = shuffle(this.combos)
            } 
            if(options.slice != 0) {
                this.combos = this.combos.slice(0,options.slice)
            }

            this.combos.forEach((combo,index) => {

                // Fox Juggler
                // const firstMove = combo.moves.find(m=>m.moveId == 17)
                // const firstMoveIndex = combo.moves.indexOf(firstMove)
                // let breakerMove = combo.moves.slice(firstMoveIndex).find(m=>m.moveId != 17)
                // const replayJSON = {
                //     replay: combo.slpPath,
                //     startFrame: firstMove.frame - 20
                // }
                // if(!breakerMove){
                //     replayJSON.endFrame = combo.moves[combo.moves.length-1].frame + 23
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

                // Peach Blender
                // const replayJSON = {
                //     replay: combo.slpPath,
                //     startFrame: combo.startFrame,
                //     endFrame: combo.startFrame + 45
                // }

                // DPS TEST
                // let highDPSmoves = [combo.moves[0]]
                // for(var i = 0; i < combo.moves.length - 2; i++ ){
                //     if(combo.moves[i+1].frame - combo.moves[i].frame > 45){
                //         if(highDPSmoves.length < 5){ 
                //             highDPSmoves = [combo.moves[i+1]] 
                //         } else {
                //             i+=100
                //         }
                //     } else {
                //         highDPSmoves.push(combo.moves[i+1])
                //     }
                // }

                // Mango Allegro (120bmp)
                // const frames = 37
                // const tol = 7
                // const aerials = [13,14,15,16,17]
                // let onBeatMoves = [combo.moves[0]]
                // for(var i = 1; i < combo.moves.length; i++){ 
                //     const frameDiff = combo.moves[i].frame - onBeatMoves[onBeatMoves.length-1].frame 
                //     if( frameDiff >= frames-tol && frameDiff <= frames+tol ){
                //         onBeatMoves.push(combo.moves[i])
                //     } else {
                //         onBeatMoves = [combo.moves[i]]
                //     }
                // }

                // const frameDiff = onBeatMoves[onBeatMoves.length-1].frame - onBeatMoves[0].frame 
                // const beats = frameDiff / 30

                // const replayJSON = {
                //     path: combo.slpPath,
                //     startFrame: onBeatMoves[0].frame - 15,
                //     endFrame: onBeatMoves[0].frame + ( (Math.ceil(beats)+1) * 30 )
                // }

                // Off the top
                // const replayJSON = {
                //     path: combo.slpPath,
                //     startFrame: combo.startFrame - 30,
                //     endFrame: combo.endFrame - 30
                // }
                // if(combo.didKill){
                //     if(combo.endFrame < combo.gameEndFrame - 37 ){
                //         replayJSON.endFrame += 36
                //     } else if (combo.endFrame < combo.gameEndFrame - 21){
                //         replayJSON.endFrame += 20
                //     }
                // } 

                // Mango Allegro (120bmp)

                // const shineId = 21
                // let shineIndex = -1
                // for(var i = 0; i < combo.moves.length; i++ ){
                //     if(combo.moves[i].moveId == shineId ){
                //         shineIndex = i 
                //         break
                //     }
                // }

                // const replayJSON = {
                //     path: combo.slpPath,
                //     startFrame: combo.moves[shineIndex].frame - 12,
                //     endFrame: combo.moves[shineIndex].frame + 128

                // }

                // off the top
                // const replayJSON = {
                //     path: combo.slpPath,
                //     startFrame: combo.startFrame - 30,
                //     endFrame: combo.endFrame - 120
                // }
            
                // if(combo.didKill){
                //     if(combo.endFrame < combo.gameEndFrame - 37 ){
                //         replayJSON.endFrame += 36
                //     } else if (combo.endFrame < combo.gameEndFrame - 21){
                //         replayJSON.endFrame += 20
                //     }
                // } 
            
                // //Normal
                const replayJSON = {
                    path: combo.slpPath,
                    startFrame: combo.startFrame - 30,
                    endFrame: combo.endFrame + 15
                }
            
                if(combo.didKill){
                    if(combo.endFrame < combo.gameEndFrame - 37 ){
                        replayJSON.endFrame += 36
                    } else if (combo.endFrame < combo.gameEndFrame - 21){
                        replayJSON.endFrame += 20
                    }
                } 

                // Overlay
                if(options.showOverlay || options.devMode){
                    const overlayPath = path.join(overlayTmpDir, crypto.randomBytes(12).toString('hex') + ".png");
                    replayJSON.overlayPath = overlayPath     
                    overlayPromises.push(this.oldOverlay(overlayPath,{...combo, index },options));
                    //overlayPromises.push(this.overlay(overlayPath,{...combo, index },options));
                }

                json[0].queue.push(replayJSON);
            });

            if(options.lastComboOffset){
                const queue = json[0].queue
                queue[queue.length-1].endFrame += parseInt(options.lastComboOffset)
                if( queue[queue.length-1].endFrame >
                this.combos[this.combos.length-1].gameEndFrame ){
                    queue[queue.length-1].endFrame = this.combos[this.combos.length-1].gameEndFrame - 1
                }
            }
            await Promise.all(overlayPromises);



            //fs.writeFileSync(path.join(tmpDir,`queue.json`),JSON.stringify(json));

            const slpToVideoConfig = {
                //fixedCamera: true,
                screenShakeOff: true,
                tmpdir: slpTmpDir,
                numProcesses: options.numCPUs,
                dolphinPath: DOLPHIN_PATH,
                ssbmIsoPath: options.isoPath,
                gameMusicOn: options.gameMusic,
                hideHud: options.hideHud,
                widescreenOff: options.widescreenOff,
                bitrateKbps: 30000,
                resolution: "6x"
              }

            try {
                console.log(json)
                console.log(slpToVideoConfig)
                await slpToVideo(json,slpToVideoConfig);
                resolve();
            } catch(err){
                console.log("Error occurred in slp-to-video");
                reject(err);
            }
            if( options.showOverlay ){
                rimraf(overlayTmpDir, () => {
                console.log("removed overlay tmpdir")
            });
            }
        });
    }

    overlay(outputPath, combo, options){ 
        //{outputPath,char1Id,char2Id,name1,name2,tournament,date,logoPath,margin,fontPath,devText}
        const { id, players, playerIndex, opponentIndex, startAt, tournamentName } = combo
        const { showOverlay, showPlayerTags, showTournament, showLogo, showDate, overlayMargin, 
            logoOpacity, textboxOpacity, logoPath, fontPath, devMode } = options
        const devText = id;
        if(!outputPath ) throw "Combolist.generateOverlay missing required parameter"
    
        const elements = [];
        if(showOverlay){

            const comboer = players.find(p=>p.playerIndex === playerIndex)
            const comboee = players.find(p=>p.playerIndex === opponentIndex)

            const icon1 = characters[comboer.characterId].img + 
                            characters[comboer.characterId].colors[comboer.characterColor] + ".png"
            const icon2 = characters[comboee.characterId].img + 
                            characters[comboee.characterId].colors[comboee.characterColor] + ".png"


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

    oldOverlay(outputPath, combo, options){ 
        //{outputPath,char1Id,char2Id,name1,name2,tournament,date,logoPath,margin,fontPath,devText}
        const { id, players, playerIndex, opponentIndex, startAt, tournamentName } = combo
        const { showOverlay, showPlayerTags, showTournament, showLogo, showDate, overlayMargin, 
            logoOpacity, textboxOpacity, logoPath, fontPath, devMode } = options
        const devText = id;
        if(!outputPath ) throw "Combolist.generateOverlay missing required parameter"
        
        const args = [outputPath, videoConstants.width, videoConstants.height]

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