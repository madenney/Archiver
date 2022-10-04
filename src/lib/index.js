
const fs = require("fs")
const { lstatSync, readdirSync, statSync, mkdirSync, readdir, fstat } = require("fs")
const path = require("path")

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function readableDate(timestamp){
  const d = new Date(parseInt(timestamp));
  return `${d.getMonth()+1}-${d.getDate()}-${d.getFullYear()}`
}

function objectsMatch(obj1,obj2){
  if( Object.keys(obj1).length != Object.keys(obj2).length) return false
  let match = true;
  Object.keys(obj1).forEach(key => {
    if(obj2[key] != obj1[key] ) match = false
  })
  return match
}

function shuffle(_array) {
  const array = _array.slice(0)
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

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

function importAll(r) {
	let images = {};
  r.keys().forEach((item, index) => { images[item.replace('./', '')] = r(item); });
	return images
}

export default {
	...require("./file"),
  getSlpFilePaths,
  asyncForEach,
  readableDate,
  objectsMatch,
  shuffle,
  importAll
}
