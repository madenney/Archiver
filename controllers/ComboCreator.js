
const {characters} = require("../constants/characters");
const {legalStages} = require("../constants/stages");
const {moves} = require("../constants/moves");

const { ComboController } = require("./components/Combo");
const { ComboList } = require("../models/ComboList");
const { defaults } = require("../constants/comboFilterDefaults");
class ComboCreator {
    constructor(archive){
        this.archive = archive;
        this.primaryComboList = null;
        this.primaryListCurrentPage = 0;
        this.numberPerPage = 50;
        this.games = [];
        this.combos = [];
        this.archiveSize = this.archive.getAllSlpFiles().filter(f => f.isValid ).length;
    }

    loadCombos(){
        const char1 = $("#char-1-select").val();
        const char2 = $("#char-2-select").val();
        const stage = $("#stage-select").val();
        console.log("Getting games...");
        this.games = this.archive.getGames({
            char1,
            char2,
            stage,
        });

        console.log("Getting combos...")
        const minMoves = $("#min-moves").val();
        const minDamage = $("#min-damage").val();
        const endMove = $("#end-move").val();
        const didKill = $("#did-kill").is(":checked");
        this.combos = this.games.reduce((n,g) => {
            const combos = g.getCombos({
                comboer: char1,
                comboee: char2,
                didKill,
                minMoves,
                minDamage,
                //includesMove,
                endMove
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
    }

    render(){
        console.log("Rendering Combo Tab");

        this.primaryList = $("#primary-list-container .list");
        this.secondaryList = $("#secondary-list-container .list");
        
        this.renderOptions();
        $("#char-1-select").val(defaults.comboer);
        $("#char-2-select").val(defaults.comboee);
        $("#stage-select").val(defaults.stage);
        $("#min-moves").val(defaults.minMoves);
        $("#min-damage").val(defaults.minDamage);
        $("#end-move").val(defaults.endMove);
        $("#did-kill").prop('checked', defaults.didKill);

        this.loadCombos();
        this.assignClickListeners();
        this.renderPrimaryList(0,50);
    }

    assignClickListeners(){
        const filterButton = $("#filter-button");
        this.generateVideoButton = $("#generate-video-button");
        this.primaryListPrevButton = $("#primary-list-prev");
        this.primaryListNextButton = $("#primary-list-next");
        this.primaryListPrevButton.click(()=> {
            this.renderPrimaryList(this.primaryListCurrentPage-1);
        })
        this.primaryListNextButton.click(()=> {
            this.renderPrimaryList(this.primaryListCurrentPage+1);
        })
        filterButton.off();
        filterButton.click(() => {
            this.loadCombos();
            this.renderPrimaryList(0)
        });

        this.generateVideoButton.click(()=> {
            this.generateVideoButton.addClass("disabled").css("pointer-events", "none").html("Generating...");
            const comboList = new ComboList(this.combos);
            comboList.generateVideo().then(() => {
                console.log("Huzzah :)");
                this.generateVideoButton.removeClass("disabled").css("pointer-events", "auto").html("Generate");
            }).catch((err) => {
                console.log("Oh no :(")
                this.generateVideoButton.removeClass("disabled").css("pointer-events", "auto").html("Sadness");
                console.log(err);
            });
        })
    }

    

    renderOptions(){
        const char1Select = $("#char-1-select");
        const char2Select = $("#char-2-select");
        const stageSelect = $("#stage-select");
        const endMoveSelect = $("#end-move");
        characters.forEach(c => {
            const option = $(`<option value="${c.id}">${c.shortName}</option>`);
            char1Select.append(option);
        });
        characters.forEach(c => {
            const option = $(`<option value="${c.id}">${c.shortName}</option>`);
            char2Select.append(option);
        });
        legalStages.forEach(s => {
            const option = $(`<option value="${s.id}">${s.shortName}</option>`)
            stageSelect.append(option);
        });
        moves.forEach(m => {
            const option = $(`<option value="${m.id}">${m.shortName}</option>`)
            endMoveSelect.append(option);
        })
    }

    renderPrimaryList(page){
        console.log("Rendering Primary List Page: ", page);
        this.primaryListCurrentPage = page;
        this.primaryList.empty();
        $("#primary-total").html(`${this.combos.length}`);
        const combosToDisplay = this.combos.slice(page*this.numberPerPage,(page*this.numberPerPage)+this.numberPerPage)
        combosToDisplay.forEach(c => {
            this.primaryList.append( new ComboController(c).html());
        });
        console.log(combosToDisplay)
        //pagination
        if(combosToDisplay.length < this.combos.length){
            $("#primary-list-pagination-container").show();
            $("#primary-list-current-page").html(page + 1);
            if(page === 0){
                this.primaryListPrevButton.addClass("disable-button");
            } else {
                this.primaryListPrevButton.removeClass("disable-button");
            }
            if(page * this.numberPerPage > this.combos.length ){
                this.primaryListNextButton.addClass("disable-button");
            } else {
                this.primaryListNextButton.removeClass("disable-button");
            }
        } else {
            $("#primary-list-pagination-container").hide();
        }
    }


}

module.exports = {ComboCreator}