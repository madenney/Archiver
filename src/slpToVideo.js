import file from "./lib/file"

const { spawn } = require("child_process")
const crypto = require("crypto")
const fs = require("fs")
const fsPromises = require("fs").promises
const path = require("path")
const readline = require("readline")
const { SlippiGame } = require("@slippi/slippi-js");
const { pad } = require("./lib").default


const EFB_SCALE = {
    "1x": 2,
    "2x": 4,
    "3x": 6,
    "4x": 7,
    "5x": 8,
    "6x": 9,
}

const generateDolphinConfigs = async (replays,config) => {
    await Promise.all(replays.map((replay) => {
        let game
        try {
            game = new SlippiGame(replay.path)
        } catch(e){
            console.log("Broken file: ", replay.path)
            return
        }
        const metadata = game.getMetadata()
        const dolphinConfig = {
            mode: "normal",
            replay: replay.path,
            startFrame: replay.startFrame - 60 < -123 ? -123 : replay.startFrame - 60,
            endFrame: Math.min(replay.endFrame, metadata.lastFrame-1),
            isRealTimeMode: false,
            commandId: `${crypto.randomBytes(12).toString("hex")}`
        }
        return fsPromises.writeFile(
            path.join(config.outputPath,`${pad(replay.index,4)}.json`), 
            JSON.stringify(dolphinConfig)
        )
    }))
}


const processReplays = async (replays,config) => {
    const dolphinArgsArray = []
    const ffmpegMergeArgsArray = []
    const ffmpegTrimArgsArray = []
    const ffmpegOverlayArgsArray = []
    let promises = []
    
    replays.forEach( replay => {

        const fileBasename = pad(replay.index,4)
        console.log(fileBasename)
        dolphinArgsArray.push([
            "-i",
            path.resolve(config.outputPath,`${fileBasename}.json`),
            "-o",
            `${fileBasename}-unmerged`,
            `--output-directory=${config.outputPath}`,
            "-b",
            "-e",
            config.ssbmIsoPath,
            "--cout",
        ])

        // Arguments for ffmpeg merging
        const ffmpegMergeArgs = [
            "-i",
            path.resolve(config.outputPath,`${fileBasename}-unmerged.avi`),
            "-i",
            path.resolve(config.outputPath,`${fileBasename}-unmerged.wav`),
            "-b:v",
            `${config.bitrateKbps}k`,
        ]
        if (config.resolution === "2x" && !config.widescreenOff) {
            // Slightly upscale to 1920x1080
            ffmpegMergeArgs.push("-vf")
            ffmpegMergeArgs.push("scale=1920:1080")
        }
        ffmpegMergeArgs.push(path.resolve(config.outputPath,`${fileBasename}-merged.avi`))
        ffmpegMergeArgsArray.push(ffmpegMergeArgs)


        // Arguments for ffmpeg trimming
        ffmpegTrimArgsArray.push([
            "-ss",
            1,
            "-i",
            path.resolve(config.outputPath,`${fileBasename}-merged.avi`),
            "-c",
            "copy",
            path.resolve(config.outputPath,`${fileBasename}.avi`)
        ])

        // Arguments for adding overlays
        if (replay.overlayPath) {
            ffmpegOverlayArgsArray.push([
            "-i",
            path.resolve(config.outputPath,`${fileBasename}.avi`),
            "-i",
            replay.overlayPath,
            "-b:v",
            `${config.bitrateKbps}k`,
            "-filter_complex",
            "[0:v][1:v] overlay",
            path.resolve(config.outputPath,`${fileBasename}-overlaid.avi`),
            ])
        }
    })

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

const configureDolphin = async (config) => {
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
  if (config.fixedCamera) newSettings.push("$Optional: Fixed Camera Always")
  if (!config.widescreenOff) newSettings.push("$Optional: Widescreen 16:9")
  if (config.disableScreenShake) newSettings.push("$Optional: Disable Screen Shake")
  newSettings.push("$Optional: No Electric SFX")
  newSettings.push("$Optional: Prevent Crowd Noises")
  newSettings.push("$Optional: Prevent Character Crowd Chants")
  newSettings.push("$Optional: Disable Magnifying-glass HUD")
  //newSettings.push("$Optional: Force 2P Center HUD")
  //if (config.hideNeutralFalco) newSettings.push("$Optional: Hide Neutral Falco")
  //if (true) newSettings.push("$Optional: Hide Neutral Falco")
  //if (true) newSettings.push("$Optional: Turn Green When Actionable")
  // if (true) newSettings.push("$Optional: DI Draw1")
  // if (true) newSettings.push("$Optional: DI Draw")

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

const slpToVideo = async (replays, config) => {
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
    .then(() => configureDolphin(config))
    .then(() => generateDolphinConfigs(replays,config))
    .then(() => processReplays(replays,config))
    .catch((err) => {
      console.error(err)
    })
}


export default slpToVideo
