
const { characters } = require("../constants/characters");
const { stages } = require("../constants/stages");

const darkStages = [2,3,31,32];

class ComboController {
    constructor({game,combo}){
        this.combo = combo;
        this.game = game;
        this.comboer = game.players.find(p => {
            return p.playerIndex === combo.playerIndex
        });
        this.comboee = game.players.find(p => {
            return p.playerIndex === combo.opponentIndex
        });
    }

    html(){
        const { combo, game, comboer, comboee } = this;
        const damage = Math.floor(combo.endPercent - combo.startPercent);
        const seconds = (( combo.endFrame - combo.startFrame ) / 60).toFixed(1);
        return $(`
        <div id="${combo.id}" class="combo">
            <div class='game-info'>
                <div class='characters'>
                    <img class='char1' src=${characters[comboer.characterId].img}>
                    <img class='arrow' src='../images/${darkStages.indexOf(game.stage) != -1 ? "white":""}next.png'>
                    <img class='char2' src=${characters[comboee.characterId].img}>
                </div>
                <img class='stage' src=${stages[game.stage].img}>
            </div>
            <div class='combo-info'>
                <div class='row'>
                    <div class='label'>Moves:</div>
                    <div class='data'>${combo.moves.length}</div>
                </div>
                <div class='row'>
                    <div class='label'>Damage:</div>
                    <div class='data'>${damage}</div>
                </div>
                <div class='row'>
                    <div class='label'>Length:</div>
                    <div class='data'>${seconds}</div>
                </div>
            </div>
        </div>
        `);
    }
}

module.exports = { ComboController };