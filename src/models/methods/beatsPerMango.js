const { SlippiGame, ConsoleCommunication } = require("@slippi/slippi-js");
const { asyncForEach, pad } = require("../../lib").default
const { spawn } = require("child_process")
const crypto = require("crypto")
const fs = require("fs")
const fsPromises = require("fs").promises
const path = require("path")
const readline = require("readline")
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const damageStates = [0x4B,0x4C,0x4D,0x4E,0x4F,0x50,0x51,0x52,0x53,0x54,0x55,0x56]
//0x57,0x58,0x59,0x5A,0x5B

export default (prev, params, eventEmitter) => {

    const clips = []
    const outputPath = "/home/matt/Projects/output/"
    let outputDirectoryName = "output";
    let fileCount = 1;
    while(fs.existsSync(path.resolve(`${outputPath}/${outputDirectoryName}`))){
        outputDirectoryName = `output${fileCount++}`
    }
    fs.mkdirSync(path.resolve(outputPath + "/" + outputDirectoryName))

    const clipNum = 40
    asyncForEach(prev.results.slice(clipNum, clipNum+1), async ( combo, index )  => {
        if(index % 1 == 0) eventEmitter({msg: `${index}/${prev.results.length}`})
        const { moves, comboer, comboee, path: filePath, stage } = combo

        const preClipBufferFrames = 60
        const postClipBufferFrames = 100
        const clip = {
            path: filePath,
            stage,
            comboer,
            comboee,
            startFrame: moves[0].frame - preClipBufferFrames,
            endFrame: moves[moves.length-1].frame + postClipBufferFrames
        }
        clips.push(clip)// just to avoid breaking the existing parser flow

        const config = {
            outputPath: path.resolve(outputPath + "/" + outputDirectoryName),
            numProcesses: 1,
            dolphinPath: path.resolve("/home/matt/Projects/Ishiiruka/build/Binaries/dolphin-emu"),
            ssbmIsoPath: path.resolve("/home/matt/Files/melee/melee.iso"),
            gameMusicOn: false,
            disableScreenShake: true,
            bitrateKbps: 6000,
            resolution: "6x",
            dolphinCutoff: 500,
            hideTags: true,
            hideNames: true,
            disableChants: true,
        }

        console.log("Running slp to vid.")
        const visibleClip = `${pad(index,3)}-visible`
        const invisibleClip = `${pad(index,3)}-invisible`
        
        await slpToVideo(clip, config)


        // slice clip
        const visibleLength = 16
        const visibleOffset = 8
        const frameLength = 1/60
        const visibleClipPath = path.resolve(outputPath,outputDirectoryName,visibleClip)
        const invisibleClipPath = path.resolve(outputPath,outputDirectoryName,invisibleClip)
        const finalOutputPath = path.resolve(outputPath,outputDirectoryName,`${pad(index,3)}.avi`)
        // const visibleClipPath = "/home/matt/Projects/output/output26/000-visible"
        // const invisibleClipPath = "/home/matt/Projects/output/output26/000-invisible"
        // const finalOutputPath = "/home/matt/Projects/output/output26/000-final.avi"
        const firstFrame = moves[0].frame - preClipBufferFrames
        const cutPoints = []
        moves.forEach(move => {
            cutPoints.push((move.frame - firstFrame - visibleOffset)*frameLength)
            cutPoints.push((move.frame - firstFrame - visibleOffset + visibleLength)*frameLength)
        })
        cutPoints.push(moves[moves.length-1].frame + postClipBufferFrames)

        // go through cut points and make sure to merge overlapping points
        for( let i = 0; i < cutPoints.length-1; i++ ){
            if(cutPoints[i] > cutPoints[i+1]){
                cutPoints.splice(i,2)
            }
        }

        let str = `ffmpeg -i ${invisibleClipPath}.avi -i ${visibleClipPath}.avi `
        let count = 0;
        let currentTime = 0;
        let currentVideo = 0

        str+= '-filter_complex "'
        cutPoints.forEach(cutPoint => {
            str +=`[${currentVideo}:v]trim=${currentTime}:${cutPoint},setpts=PTS-STARTPTS[v${count}]; `
            currentVideo = 1 - currentVideo
            currentTime = cutPoint
            count++
        })

        for(let i = 0; i < count; i++ ){
            str+=`[v${i}]`
        }
        str+=`concat=n=${count}:v=1" ${finalOutputPath}`
        console.log(str)
        await exec(str)
        console.log("Done splicing")

        // Delete original files
        console.log("Deleting original video files...")
        const promises = []
        const originalFiles = fs.readdirSync(path.resolve(outputPath,outputDirectoryName)).filter(f => f.includes('visible'));
        originalFiles.forEach((file) => {
            promises.push(fsPromises.unlink(path.resolve(outputPath,outputDirectoryName,file)))
        })
        await Promise.all(promises)

        console.log("Donzo")
    })
    return clips
}

const EFB_SCALE = {
    "1x": 2,
    "2x": 4,
    "3x": 6,
    "4x": 7,
    "5x": 8,
    "6x": 9,
}

const generateDolphinConfigs = async (clip,config) => {
    let game
    try {
        game = new SlippiGame(clip.path)
    } catch(e){
        console.log("Broken file: ", clip.path)
        return
    }
    const metadata = game.getMetadata()
    const trimBuffer = 0
    const dolphinConfig = {
        mode: "normal",
        replay: clip.path,
        startFrame: clip.startFrame - trimBuffer < -123 ? -123 : clip.startFrame - trimBuffer,
        endFrame: Math.min(clip.endFrame, metadata.lastFrame-1),
        isRealTimeMode: false,
        commandId: `${crypto.randomBytes(12).toString("hex")}`
    }
    return await fsPromises.writeFile(
        path.join(config.outputPath,`${clip.index}.json`), 
        JSON.stringify(dolphinConfig)
    )
}


const processReplays = async (clip,config) => {
    const dolphinArgsArray = []
    const ffmpegMergeArgsArray = []
    const ffmpegTrimArgsArray = []
    let promises = []

    dolphinArgsArray.push([
        "-i",
        path.resolve(config.outputPath,`${clip.index}.json`),
        "-o",
        `${clip.index}-unmerged`,
        `--output-directory=${config.outputPath}`,
        "-b",
        "-e",
        config.ssbmIsoPath,
        "--cout",
    ])

    // Arguments for ffmpeg merging
    const ffmpegMergeArgs = [
        "-i",
        path.resolve(config.outputPath,`${clip.index}-unmerged.avi`),
        "-i",
        path.resolve(config.outputPath,`${clip.index}-unmerged.wav`),
        "-b:v",
        `${config.bitrateKbps}k`,
    ]
    if (config.resolution === "2x" && !config.widescreenOff) {
        // Slightly upscale to 1920x1080
        ffmpegMergeArgs.push("-vf")
        ffmpegMergeArgs.push("scale=1920:1080")
    }
    ffmpegMergeArgs.push(path.resolve(config.outputPath,`${clip.name}.avi`))
    ffmpegMergeArgsArray.push(ffmpegMergeArgs)


    // Dump frames to video and audio
    console.log("Dumping video frames and audio...")
    await executeCommandsInQueue(
        config.dolphinPath,
        dolphinArgsArray,
        config.numProcesses,
        {},
        killDolphinOnEndFrame,
        config.dolphinCutoff
    )

    // Merge video and audio files
    console.log("Merging video and audio...")
    await executeCommandsInQueue(
        "ffmpeg",
        ffmpegMergeArgsArray,
        config.numProcesses,
        { stdio: "ignore" }
    )

    // Trim buffer frames
    console.log("Trimming off buffer frames...")
    await executeCommandsInQueue(
        "ffmpeg",
        ffmpegTrimArgsArray,
        config.numProcesses,
        { stdio: "ignore" }
    )

    // Delete unmerged video and audio files
    console.log("Deleting unmerged audio and video files...")
    promises = []
    const unmergedFiles = fs.readdirSync(config.outputPath).filter(f => f.includes('-unmerged'));
    unmergedFiles.forEach((file) => {
        promises.push(fsPromises.unlink(path.resolve(config.outputPath,file)))
    })
    await Promise.all(promises)

    // Delete untrimmed video and audio files
    console.log("Deleting untrimmed audio and video files...")
    promises = []
    const untrimmedFiles = fs.readdirSync(config.outputPath).filter(f => f.includes('-merged'));
    untrimmedFiles.forEach((file) => {
        promises.push(fsPromises.unlink(path.resolve(config.outputPath,file)))
    })
    await Promise.all(promises)

    // Delete dolphin config json files
    console.log("Deleting dolphin config files...")
    promises = []
    const dolphinConfigFiles = fs.readdirSync(config.outputPath).filter(f => f.endsWith('.json'));
    dolphinConfigFiles.forEach((file) => {
        promises.push(fsPromises.unlink(path.resolve(config.outputPath,file)))
    })
    await Promise.all(promises)
}


const exit = (process) =>
  new Promise((resolve, reject) => {
    process.on("exit", (code, signal) => {
      resolve(code, signal)
    })
  })

const executeCommandsInQueue = async (
  command,
  argsArray,
  numWorkers,
  options,
  onSpawn,
  dolphinCutoff
) => {
    const numTasks = argsArray.length
    let count = 0
    if (process.stdout.isTTY) process.stdout.write(`${count}/${numTasks}`)
    const worker = async () => {
        let args
        while ((args = argsArray.pop()) !== undefined) {
        const process_ = spawn(command, args, options)
        const exitPromise = exit(process_)
        if( dolphinCutoff ){
            setTimeout(() => {
            process_.kill('SIGINT')
            }, parseInt(dolphinCutoff)*1000)
        }
        if (onSpawn) {
            await onSpawn(process_, args)
        }
        await exitPromise
        count++
        if (process.stdout.isTTY) {
            process.stdout.clearLine()
            process.stdout.cursorTo(0)
            process.stdout.write(`${count}/${numTasks}`)
        }
        }
    }
    const workers = []
    while (workers.length < numWorkers) {
        workers.push(worker())
    }
    while (workers.length > 0) {
        await workers.pop()
    }
    if (process.stdout.isTTY) process.stdout.write("\n")
}

const killDolphinOnEndFrame = (process) => {
  let endFrame = Infinity
  process.stdout.setEncoding("utf8")
  process.stdout.on("data", (data) => {
    const lines = data.split("\r\n")
    lines.forEach((line) => {
      if (line.includes(`[PLAYBACK_END_FRAME]`)) {
        const regex = /\[PLAYBACK_END_FRAME\] ([0-9]*)/
        const match = regex.exec(line)
        endFrame = match[1]
      } else if (line.includes(`[CURRENT_FRAME] ${endFrame}`)) {
        process.kill()
      }
    })
  })
}

const configureDolphin = async (config, clip) => {
  const dolphinDirname = path.dirname(config.dolphinPath)
  const gameSettingsFilename = path.join(
    dolphinDirname,
    "User",
    "GameSettings",
    "GALE01.ini"
  )
  const graphicsSettingsFilename = path.join(
    dolphinDirname,
    "User",
    "Config",
    "GFX.ini"
  )

  // Game settings
  let newSettings = ["[Gecko]", "[Gecko_Enabled]"]
  if (!config.gameMusicOn) newSettings.push("$Optional: Game Music OFF")
  if (config.hideHud) newSettings.push("$Optional: Hide HUD")
  if (config.hideTags) newSettings.push("$Optional: Hide Tags")
  if (config.disableChants)
    newSettings.push("$Optional: Prevent Character Crowd Chants")
  if (config.fixedCamera) newSettings.push("$Optional: Fixed Camera Always")
  if (!config.widescreenOff) newSettings.push("$Optional: Widescreen 16:9")
  if (config.disableScreenShake) newSettings.push("$Optional: Disable Screen Shake")
  newSettings.push("$Optional: Disable Battlefield Background + Particles [NeilHarbin0]")

  newSettings.push("[Gecko_Disabled]")
  if (config.hideNames) newSettings.push("$Optional: Show Player Names")

  await fsPromises.writeFile(gameSettingsFilename, newSettings.join("\n"))

  // Graphics settings
  const rl = readline.createInterface({
    input: fs.createReadStream(graphicsSettingsFilename),
    crlfDelay: Infinity,
  })
  
  newSettings = []
  const aspectRatioSetting = config.widescreenOff ? 5 : 6
  for await (const line of rl) {
    if (line.startsWith("AspectRatio")) {
      newSettings.push(`AspectRatio = ${aspectRatioSetting}`)
    } else if (line.startsWith("BitrateKbps")) {
      newSettings.push(`BitrateKbps = ${config.bitrateKbps}`)
    } else if (line.startsWith("EFBScale")) {
      newSettings.push(`EFBScale = ${EFB_SCALE[config.resolution]}`)
    } else {
      newSettings.push(line)
    }
  }
  await fsPromises.writeFile(graphicsSettingsFilename, newSettings.join("\n"))
}

const slpToVideo = async (clip, config) => {
  await fsPromises
    .access(config.ssbmIsoPath)
    .catch((err) => {
      if (err.code === "ENOENT") {
        throw new Error( `Could not read SSBM iso from path ${config.ssbmIsoPath}. `)
      } else {
        throw err
      }
    })
    .then(() => fsPromises.access(config.dolphinPath))
    .catch((err) => {
      if (err.code === "ENOENT") {
        throw new Error(`Could not open Dolphin from path ${config.dolphinPath}. `)
      } else {
        throw err
      }
    })
    .then(() => configureDolphin(config, clip))
    .then(() => generateDolphinConfigs(clip,config))
    .then(() => processReplays(clip,config))
    .catch((err) => {
      console.error(err)
    })
}

