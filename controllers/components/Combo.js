
const { characters } = require("../../constants/characters");
const { stages } = require("../../constants/stages");

const darkStages = [2,3,31,32];

class ComboController {
    constructor(combo){
        this.id = combo.id
        this.combo = combo;
        this.slpPath = combo.slpPath;
        this.comboer = combo.players.find(p => {
            return p.playerIndex === combo.playerIndex
        });
        this.comboee = combo.players.find(p => {
            return p.playerIndex === combo.opponentIndex
        });
        this.isSelected = false;
    }

    html(){
        const { combo, comboer, comboee, slpPath, id } = this;
        const damage = Math.floor(combo.endPercent - combo.startPercent);
        const seconds = (( combo.endFrame - combo.startFrame ) / 60).toFixed(1);
        return $(`
        <div id="${id}" class="combo">
            <div class='game-info'>
                <div class='characters'>
                    <img class='char1' src=${characters[comboer.characterId].img}>
                    <img class='arrow' src='../images/${darkStages.indexOf(combo.stage) != -1 ? "white":""}next.png'>
                    <img class='char2' src=${characters[comboee.characterId].img}>
                </div>
                <img class='stage' src=${stages[combo.stage].img}>
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
                <div class='row' hidden>
                    <div class='label'>Path:</div>
                    <div class='data'>${slpPath}</div>
                </div>
            </div>
            <div class="combo-meta">
                <div class="combo-id">${id.substring(0,4)}</div>
                <input c-id=${id} class="combo-checkbox" type="checkbox">
            </div>
        </div>
        `);
    }
}

module.exports = { ComboController };