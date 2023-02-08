
const fs = require("fs")
const path = require("path")
const { PythonShell } = require("python-shell");


const generateOverlays = async function( replays, outputDir ){
    console.log("GENERATING ", replays.length, " overlays")
    
    await asyncForEach( replays, async (replay) => {
 
        replay.overlayPath = path.resolve(outputDir, `${replay.index}.png`)
        const source = "Beyond - The Summit: 1000"
        

        const args = []
        args.push(`--outputPath=${replay.overlayPath}`)
        args.push(`--text=${source}`)

        const scriptPath = path.resolve("scripts")
        const pyShellOptions = {
            mode: "text",
            pythonPath: 'python3',
            pythonOptions: ["-u"],
            scriptPath,
            args
        };
        await new Promise((resolve,reject) => {
            PythonShell.run("overlay.py", pyShellOptions, (err, results) => {
                if (err) throw err;
                resolve()
            });
        })
    })
    console.log("Overlays generated.")
}


export default { 
	generateOverlays
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}