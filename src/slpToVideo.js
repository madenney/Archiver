
const { spawn } = require("child_process")
const crypto = require("crypto")
const fs = require("fs")
const fsPromises = require("fs").promises
const os = require("os")
const path = require("path")
const readline = require("readline")
const dir = require("node-dir")

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
        const dolphinConfig = {
            mode: "normal",
            replay: replay.path,
            startFrame: replay.startFrame,
            endFrame: replay.endFrame,
            isRealTimeMode: false,
            commandId: `${crypto.randomBytes(12).toString("hex")}`,
            overlayPath: replay.overlayPath
        }
        return fsPromises.writeFile(
            path.join(config.outputPath,`${replay.index}.json`), 
            JSON.stringify(dolphinConfig)
        )
    }))
}


const processReplays = async (replays,config) => {
    const dolphinArgsArray = []
    const ffmpegMergeArgsArray = []
    const ffmpegOverlayArgsArray = []
    let promises = []
    
    replays.forEach( replay => {

        const outputFilePath = path.join(config.outputPath,`${replay.index}.avi`)

        dolphinArgsArray.push([
            "-i",
            path.resolve(config.outputPath,`${replay.index}.json`),
            "-o",
            `${replay.index}-unmerged`,
            `--output-directory=${config.outputPath}`,
            "-b",
            "-e",
            config.ssbmIsoPath,
            "--cout",
        ])
        // Arguments for ffmpeg merging
        const ffmpegMergeArgs = [
            "-i",
            path.resolve(config.outputPath,`${replay.index}-unmerged.avi`),
            "-i",
            path.resolve(config.outputPath,`${replay.index}-unmerged.wav`),
            "-b:v",
            `${config.bitrateKbps}k`,
        ]
        if (config.resolution === "2x" && !config.widescreenOff) {
            // Slightly upscale to 1920x1080
            ffmpegMergeArgs.push("-vf")
            ffmpegMergeArgs.push("scale=1920:1080")
        }
        ffmpegMergeArgs.push(outputFilePath)
        ffmpegMergeArgsArray.push(ffmpegMergeArgs)

        // Arguments for adding overlays
        if (replay.overlayPath) {
            ffmpegOverlayArgsArray.push([
            "-i",
            `${outputFilePath}`,
            "-i",
            replay.overlayPath,
            "-b:v",
            `${config.bitrateKbps}k`,
            "-filter_complex",
            "[0:v][1:v] overlay",
            path.resolve(config.outputPath,`${replay.index}-overlaid.avi`),
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

    // Delete unmerged video and audio files
    console.log("Deleting unmerged audio and video files...")
    promises = []
    const unmergedFiles = fs.readdirSync(config.outputPath).filter(f => f.includes('unmerged'));
    console.log(unmergedFiles)
    unmergedFiles.forEach((file) => {
        promises.push(fsPromises.unlink(path.resolve(config.outputPath,file)))
    })
    await Promise.all(promises)

    // Delete dolphin config json files
    console.log("Deleting dolphin config files...")
    promises = []
    const dolphinConfigFiles = fs.readdirSync(config.outputPath).filter(f => f.endsWith('.json'));
    console.log(dolphinConfigFiles)
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

const close = (stream) =>
  new Promise((resolve, reject) => {
    stream.on("close", (code, signal) => {
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
    console.log("ARGS:", argsArray[0])
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

const processReplayConfigs = async (files, config) => {
  const dolphinArgsArray = []
  const ffmpegMergeArgsArray = []
  const ffmpegOverlayArgsArray = []
  const replaysWithOverlays = []
  let promises = []

  // Construct arguments to commands
  files.forEach((file) => {
    const promise = fsPromises.readFile(file).then((contents) => {
      const overlayPath = JSON.parse(contents).overlayPath
      const { dir, name } = path.parse(file)
      const basename = path.join(dir, name)
      // Arguments to Dolphin
      dolphinArgsArray.push([
        "-i",
        file,
        "-o",
        name,
        `--output-directory=${config.outputPath}`,
        "-b",
        "-e",
        config.ssbmIsoPath,
        "--cout",
      ])
      // Arguments for ffmpeg merging
      const ffmpegMergeArgs = [
        "-i",
        `${basename}.avi`,
        "-i",
        `${basename}.wav`,
        "-b:v",
        `${config.bitrateKbps}k`,
      ]
      if (config.resolution === "2x" && !config.widescreenOff) {
        // Slightly upscale to 1920x1080
        ffmpegMergeArgs.push("-vf")
        ffmpegMergeArgs.push("scale=1920:1080")
      }
      ffmpegMergeArgs.push(`${basename}-merged.avi`)
      ffmpegMergeArgs.push(`${config.outputPath}/${name}.avi`)
      ffmpegMergeArgsArray.push(ffmpegMergeArgs)
      // Arguments for adding overlays
      if (overlayPath) {
        ffmpegOverlayArgsArray.push([
          "-i",
          `${basename}-merged.avi`,
          "-i",
          overlayPath,
          "-b:v",
          `${config.bitrateKbps}k`,
          "-filter_complex",
          "[0:v][1:v] overlay",
          `${basename}-overlaid.avi`,
        ])
        replaysWithOverlays.push(basename)
      }
    })
    promises.push(promise)
  })
  await Promise.all(promises)

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

  // Delete unmerged video and audio files to save space
  promises = []
  files.forEach((file) => {
    const basename = path.join(path.dirname(file), path.basename(file, ".json"))
    promises.push(fsPromises.unlink(`${basename}.avi`))
    promises.push(fsPromises.unlink(`${basename}.wav`))
  })
}

const getMinimumDuration = async (videoFile) => {
  const audioArgs = [
    "-select_streams",
    "a:0",
    "-show_entries",
    "stream=duration",
    videoFile,
  ]
  const videoArgs = [
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=duration",
    videoFile,
  ]
  const audioProcess = spawn("ffprobe", audioArgs)
  const audioClose = close(audioProcess.stdout)
  const videoProcess = spawn("ffprobe", videoArgs)
  const videoClose = close(videoProcess.stdout)
  audioProcess.stdout.setEncoding("utf8")
  videoProcess.stdout.setEncoding("utf8")
  const regex = /duration=([0-9]*\.[0-9]*)/
  let audioDuration
  let videoDuration
  audioProcess.stdout.on("data", (data) => {
    const match = regex.exec(data)
    audioDuration = match[1]
  })
  videoProcess.stdout.on("data", (data) => {
    const match = regex.exec(data)
    videoDuration = match[1]
  })
  await audioClose
  await videoClose
  return Math.min(audioDuration, videoDuration)
}

const concatenateVideos = async (dir, config) => {
  await fsPromises.readdir(dir).then(async (files) => {
    // Get sorted list of video files to concatenate
    let replayVideos = files.filter((file) => file.endsWith("merged.avi"))
    replayVideos = replayVideos.concat(
      files.filter((file) => file.endsWith("overlaid.avi"))
    )
    if (!replayVideos.length) return
    const regex = /([0-9]*).*/
    replayVideos.sort((file1, file2) => {
      const index1 = regex.exec(file1)[1]
      const index2 = regex.exec(file2)[1]
      return index1 - index2
    })
    // Compute correct video durations (minimum of audio and video streams)
    const durations = {}
    const promises = []
    replayVideos.forEach((file) => {
      const promise = getMinimumDuration(path.join(dir, file)).then(
        (duration) => {
          durations[file] = duration
        }
      )
      promises.push(promise)
    })
    await Promise.all(promises)
    // Generate ffmpeg input file
    const concatFn = path.join(dir, "concat.txt")
    const stream = fs.createWriteStream(concatFn)
    replayVideos.forEach((file) => {
      stream.write(`file '${path.join(dir, file)}'\n`)
      stream.write("inpoint 0.0\n")
      stream.write(`outpoint ${durations[file]}\n`)
    })
    stream.end()
    // Concatenate
    await fsPromises
      .readFile(path.join(dir, "outputPath.txt"), { encoding: "utf8" })
      .then(async (outputPath) => {
        const args = [
          "-y",
          "-f",
          "concat",
          "-safe",
          "0",
          "-segment_time_metadata",
          "1",
          "-i",
          concatFn,
          "-vf",
          "select=concatdec_select",
          "-af",
          "aselect=concatdec_select,aresample=async=1",
          "-b:v",
          `${config.bitrateKbps}k`,
          outputPath,
        ]
        const process = spawn("ffmpeg", args, { stdio: "ignore" })
        await exit(process)
      })
  })
}

const files = (rootdir) =>
  new Promise((resolve, reject) => {
    dir.files(rootdir, (err, files) => {
      if (err) reject(err)
      resolve(files)
    })
  })

const subdirs = (rootdir) =>
  new Promise((resolve, reject) => {
    dir.subdirs(rootdir, (err, subdirs) => {
      if (err) reject(err)
      resolve(subdirs)
    })
  })

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
  if (config.disableChants)
    newSettings.push("$Optional: Prevent Character Crowd Chants")
  if (config.fixedCamera) newSettings.push("$Optional: Fixed Camera Always")
  if (!config.widescreenOff) newSettings.push("$Optional: Widescreen 16:9")
  if (config.disableScreenShake) newSettings.push("$Optional: Disable Screen Shake")

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
