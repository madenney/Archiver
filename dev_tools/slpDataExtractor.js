
const path = require('path')
const { default: SlippiGame } = require('slp-parser-js')
console.log("HEY");
console.log(process.argv[0]);
const INPUT_FILE = path.resolve(process.argv[2])

const getInfo = () => {
  console.log("Getting info from " + INPUT_FILE)
  const game = new SlippiGame(INPUT_FILE)
  const metadata = game.getMetadata()
  console.log(metadata);
  const stats = game.getStats();
  console.log(stats);
}

getInfo();