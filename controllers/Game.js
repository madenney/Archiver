
const { characters } = require("../constants/characters");

class GameController {
    constructor(game){
        this.game = game;
    }

    html(){
        const g = this.game;
        return $(`
        <div id="${g.id} class="game">
            <div class='top-row'>
                <div class='char1'>
                    <div class='label'>Player 1</div>
                    <img class='img' src=${characters[g.players[0].characterId].img}>
                </div>
                <span>VS</span>
                <div class='char2'>
                    <div class='label'>Player 2</div>
                    <img class='img' src=${characters[g.players[1].characterId].img}>
                </div>
            </div>
            <div class='bottom-row'>
                <div class="stage">${stages[g.stage].name}</div>
            </div>
            <div class='hover-overlay'>
                <div>Cool Info Here</div>
                <div>${g.slpPath}</div>
            </div>
        </div>
        `)
    }
}

module.exports = { GameController };