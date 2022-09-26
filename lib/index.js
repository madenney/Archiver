
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
	...require("./file"),
  ...require("./slippiParser"),
  asyncForEach,
  readableDate,
  shuffle
}
