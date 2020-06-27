
const fs = require("fs")

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function readableDate(timestamp){
  const d = new Date(parseInt(timestamp));
  return `${d.getMonth()+1}-${d.getDate()}-${d.getFullYear()}`
}

function isURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return pattern.test(str);
}

const removeSponsor = function( tag ){
	while( tag.indexOf("|") > -1 ){
		tag = tag.slice( tag.indexOf("|") + 2 )
	}
	return tag
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

module.exports = {
	...require("./fileHandler"),
	...require("./slippiParser"),
  asyncForEach,
  readableDate,
	isURL,
  removeSponsor,
  shuffle
}