
const {characters} = require("../constants/characters");
const {legalStages} = require("../constants/stages");

const { ComboController } = require("../controllers/Combo");

class ComboCreator {
    constructor(archive){
        this.archive = archive;
        this.primaryComboList = null;
        this.primaryListCurrentPage = 0;
        this.numberPerPage = 50;
    }

    render(){
        console.log("Rendering Combo Tab");

        this.primaryList = $("#primary-list-container .list");
        this.secondaryList = $("#secondary-list-container .list");
        
        this.assignClickListeners();

        this.renderOptions();

        this.renderPrimaryList(0,50);
    }

    assignClickListeners(){
        const filterButton = $("#filter-button");
        filterButton.off();
        filterButton.click(this.renderPrimaryList.bind(this));
    }

    renderOptions(){
        const char1Select = $("#char-1-select");
        const char2Select = $("#char-2-select");
        characters.forEach(c => {
            const option = $(`<option value="${c.id}">${c.shortName}</option>`);
            char1Select.append(option);
        });
        characters.forEach(c => {
            const option = $(`<option value="${c.id}">${c.shortName}</option>`);
            char2Select.append(option);
        });
        const stageSelect = $("#stage-select");
        legalStages.forEach(s => {
            const option = $(`<option value="${s.id}">${s.shortName}</option>`)
            stageSelect.append(option);
        })
    }

    renderPrimaryList(page, numberPerPage){
        this.page = page;
        this.numberPerPage = numberPerPage;
        console.log("RENDER PRIMARY LIST");

        const char1 = $("#char-1-select").val();
        const char2 = $("#char-2-select").val();
        const stage = $("#stage-select").val();

        console.log("CHAR1", char1);
        console.log("CHAR2", char2);
        console.log("stage", stage);
        const games = this.archive.getGames({
            char1,
            char2,
            stage,
        });
        console.log("number of games: ", games.length);
            // didKill,
            // minMoves,
            // minDamage,
            // containsMove,
            // endMove
        console.log("getting combos...")
        let count = 1;
        const combos = games.reduce((n,g) => {
            console.log(count++);
            if(count < 5000 ) return [];
            const combos = g.getCombos({
                comboer: char1,
                comboee: char2,
            });

            // Need to combine combo object and game object
            const returnArr = [];
            combos.forEach(c => {
                returnArr.push({
                    combo: c,
                    game: g
                })
            });
            return n.concat( returnArr )
        },[])


        $("#primary-total").html(combos.length);
        let totalSeconds = 0;
        combos.forEach(c => {
            console.log(totalSeconds++);
            this.primaryList.append( new ComboController(c).html());
        });

    }


}

module.exports = {ComboCreator}