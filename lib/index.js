
const fs = require("fs")

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const removeSponsor = function( tag ){
	while( tag.indexOf("|") > -1 ){
		tag = tag.slice( tag.indexOf("|") + 2 )
	}
	return tag
}

module.exports = {
	...require("./fileHandler"),
	...require("./slippiParser"),
	asyncForEach,
	removeSponsor
}