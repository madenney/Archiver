


const { SlippiGame } = require("@slippi/slippi-js");
const { lstatSync, readdirSync, statSync, mkdirSync, readdir, fstat } = require("fs")
const path = require("path")


const getSlpFilePaths = (_paths) => {
	const paths = Array.isArray(_paths) ? _paths : [_paths];
	let files = []
	paths.forEach(p => {
		const fileInfo = lstatSync(p);
		if(fileInfo.isDirectory()){
			readdirSync(p).forEach(p1 => {
				files = files.concat(getSlpFilePaths(path.resolve(p,p1)))
			});
		}
		if(fileInfo.isFile() && path.extname(p) === ".slp"){
			files.push(p);
		}
	})
	return files;
}

const paths = getSlpFilePaths("test_files/mang");

console.log(paths);


const game = new SlippiGame(paths[0]);

// Get game settings – stage, characters, etc
// const settings = game.getSettings();
// console.log(settings);

// // Get metadata - start time, platform played on, etc
// const metadata = game.getMetadata();
// console.log(metadata);

// // Get computed stats - openings / kill, conversions, etc
// const stats = game.getStats();
// console.log(stats);

// Get frames – animation state, inputs, etc
// This is used to compute your own stats or get more frame-specific info (advanced)
const frames = game.getFrames();
console.log(frames); // Print frame when timer starts counting down