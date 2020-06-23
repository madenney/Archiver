const fs = require('fs');
const path = require('path');
<<<<<<< HEAD
const arrayMove = require('array-move')
=======
const arrayMove = require('array-move');

>>>>>>> 3dd9021eb9719e76fe11ff56ad022dc7353885e0
const {characters} = require("../constants/characters");
const {legalStages} = require("../constants/stages");
const {moves} = require("../constants/moves");

const { ComboController } = require("./components/Combo");
const { ComboList } = require("../models/ComboList");
const { defaults } = require("../constants/comboFilterDefaults");
const { videoOptions } = require("../constants/videoOptions");
const { overlayOptions } = require("../constants/overlayOptions");

var { remote: { dialog } } = require('electron');
const events = require("events");

class ComboCreator {
    constructor(archive){
        this.archive = archive;
        this.primaryComboList = null;
        this.primaryListCurrentPage = 0;
        this.numberPerPage = 200;
        this.games = [];
        this.combos = [];
        this.secondaryCombos = [];
        this.archiveSize = this.archive.getAllSlpFiles().filter(f => f.isValid ).length;
    }

    render(){
        console.log("Rendering Combo Tab");

        this.primaryList = $("#primary-list-container .list");
        this.secondaryList = $("#secondary-list-container .list");
        
        this.renderGenerateVideoButton();

        this.renderFilterOptions();
        this.renderFilterValues();
        
        this.renderVideoOptions();
        this.renderOverlayOptions();
        
        this.loadCombos();
        this.assignClickListeners();
        this.renderPrimaryList(0,50);
    }

    assignClickListeners(){
        const filterButton = $("#filter-button");
        const resetFilterButton = $("#filter-reset-button")
        const videoOptionsButton = $("#video-options-button");
        const overlayOptionsButton = $("#overlay-options-button");
        const videoOptionsContainer = $("#video-options-modal-container")
        const overlayOptionsContainer = $("#overlay-options-modal-container")
        const optionsModal = $(".options-modal");
        this.generateVideoButton = $("#generate-video-button");
        this.primaryListPrevButton = $("#primary-list-prev");
        this.primaryListNextButton = $("#primary-list-next");

        this.generateVideoButton.click(() => this.generateVideo() );

        $("#primary-list").sortable({
            stop: (event, ui) => {
                const combo = this.combos.find(c => c.id === ui.item.attr('id'))
                const originalIndex = this.combos.indexOf(combo);
                arrayMove.mutate(this.combos,originalIndex,ui.item.index())
            },
            scroll: true
        });

        this.primaryListPrevButton.click(()=> {
            this.renderPrimaryList(this.primaryListCurrentPage-1);
        })
        this.primaryListNextButton.click(()=> {
            this.renderPrimaryList(this.primaryListCurrentPage+1);
        })
        
        filterButton.click(() => {
            this.loadCombos();
            this.renderPrimaryList(0)
        });
        resetFilterButton.click(() => {
            this.resetFiltersToDefaults()
        })
        
        videoOptionsButton.click(() => {
            videoOptionsContainer.show();
        })
        optionsModal.click((e) => e.stopPropagation());
        videoOptionsContainer.click(() => {
            videoOptionsContainer.hide()
        })
        $("#video-options-ok-button").click(() => {
            videoOptionsContainer.hide()
        })
        overlayOptionsButton.click(() => {
            overlayOptionsContainer.show();
        })
        optionsModal.click((e) => e.stopPropagation());
        overlayOptionsContainer.click(() => {
            overlayOptionsContainer.hide()
        })
        $("#overlay-options-ok-button").click(() => {
            overlayOptionsContainer.hide()
        })
        
        $("#show-logo").click(() => {
            $("#logo-path-option").toggle()
        })
        
        $("#iso-path-button").click((e) => {
            e.preventDefault();
            const path = dialog.showOpenDialogSync({
                properties: ['openFile'],
                filters: [{
                    name: 'SSBM ISO',
                    extensions: ['iso']
                }]
            });
            if(path && path[0]){
                $("#iso-path").val(path[0])
                localStorage.isoPath = path[0];
            }
        });
        $("#output-path-button").click((e) => {
            e.preventDefault();
            const path = dialog.showOpenDialogSync({
                properties: ['openDirectory','createDirectory']
            });
            if(path && path[0]){
                $("#output-path").val(path[0])
                localStorage.outputPath = path[0];
            }
        });
        $("#logo-path-button").click((e) => {
            e.preventDefault();
            const path = dialog.showOpenDialogSync({
                properties: ['openFile'],
                filters: [{
                    name: 'Logo',
                    extensions: ['png','jpg','jpeg']
                }]
            });
            if(path && path[0]){
                $("#logo-path").val(path[0])
                localStorage.logoPath = path[0];
            }
        });
        $("#font-path-button").click((e) => {
            e.preventDefault();
            const path = dialog.showOpenDialogSync({
                properties: ['openFile'],
                filters: [{
                    name: 'Font',
                    extensions: ['otf','ttf']
                }]
            });
            if(path && path[0]){
                $("#font-path").val(path[0])
                localStorage.fontPath = path[0];
            }
        });

        $("#remove-selected").click(() => {

            const combosIdsToDelete = [];
            $(".combo .combo-checkbox:checked").each((i,e) => {
                combosIdsToDelete.push($(e).attr('c-id'))
            })
            combosIdsToDelete.forEach(id => {
                const comboIndex = this.combos.indexOf(this.combos.find(c => c.id === id));
                this.combos.splice(comboIndex,1);
            })
            this.renderPrimaryList(0);

        })
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
        const maxMoves = $("#max-moves").val();
        const minDamage = $("#min-damage").val();
        const comboerTag = $("#comboer-tag").val();
        const comboeeTag = $("#comboee-tag").val();
        const endMove = $("#end-move").val();
        const didKill = $("#did-kill").is(":checked");
        console.log(this.games.length);
        console.log(this.games[0])
        this.combos = this.games.reduce((n,game) => {
            const combos = game.getCombos({
                comboer: char1,
                comboee: char2,
                comboerTag,
                comboeeTag,
                didKill,
                minMoves,
                maxMoves,
                minDamage,
                //includesMove,
                endMove
            });

            // Need to combine combo object and game object
            const returnArr = [];
            combos.forEach(combo => {
                returnArr.push({
                    ...combo,
                    players: game.players,
                    stage: game.stage,
                    slpPath: game.slpPath,
                    startAt: game.tournament ? 
                        game.tournament.startAt : game.startAt,
                    gameEndFrame: game.lastFrame,
                    gameId: game.id,
                    tournamentName: game.tournament ? game.tournament.name : "N/A"
                })
            });
            return n.concat( returnArr )
        },[])
    }

    renderPrimaryList(page){
        console.log("Rendering Primary List Page: ", page);
        this.primaryListCurrentPage = page;
        this.primaryList.empty();
        $("#primary-total").html(`${this.combos.length}`);
        $("#primary-total-time").html(`${(this.combos.reduce((n,c)=>{
            let a = c.endFrame - c.startFrame;
            if(c.moves.length < 3 ){
                a += 20
            } else {
                a += 10
            }
            if(c.didKill){
                if(c.endFrame < c.gameEndFrame - 37 ){
                    a += 36
                } else if (c.endFrame < c.gameEndFrame - 21){
                    a += 20
                }
            }
            return n+a
        },0)/60).toFixed(1)}`);
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

    renderSecondaryList(page){
        console.log("Rendering Secondary List: ");
        $("#primary-total").html(`${this.secondaryCombos.length}`);
        $("#primary-total-time").html(`${this.secondaryCombos.reduce((n,c)=>{return n+((c.endFrame-c.startFrame)/60)},0).toFixed(1)}`);
        this.secondaryCombos.forEach(c => {
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

    renderGenerateVideoButton(){
        this.generateVideoButton = $("#generate-video-button");
        this.generateWarningMessage = $("#generate-warning-message")
        if(!localStorage.isoPath){
            this.generateVideoButton.addClass("disabled").css("pointer-events", "none");
            this.generateWarningMessage.html("melee.iso path not specified in Video Options")
            return;
        }
        if(!fs.existsSync(path.resolve("./node_modules/slp-to-video/Ishiiruka/build/Binaries/dolphin-emu"))){
            this.generateVideoButton.addClass("disabled").css("pointer-events", "none");
            this.generateWarningMessage.html("need to run ./build-dolphin.sh")
            return;
        }
        this.generateWarningMessage.html("");
        this.generateVideoButton.removeClass("disabled").css("pointer-events", "auto").html("Generate");
    }

    generateVideo(){
        this.generateVideoButton.addClass("disabled").css("pointer-events", "none").html("Generating...");
        const comboList = new ComboList(this.combos);
        const options = this.getOptions();
        const vgMessage = $("#video-generate-message");
        const vgCount = $("#video-generate-count");
        const em = new events.EventEmitter();
        em.on('primaryEventMsg',msg => {
            vgMessage.html(msg);
            vgCount.html(`0/${totalVideos}`);
        });
        const totalVideos = this.combos.length;
        em.on('count', count => {
            vgCount.html(`${count+1}/${totalVideos}`);
        });
        const skippedFiles = [];
        em.on('errorEventMsg',(msg,file) => {
            skippedFiles.push(file);
        })
        comboList.generateVideo(options,em).then(() => {
            vgMessage.html("Done :)");
            vgCount.html("")
            setTimeout(() => {
                vgMessage.html("");
            }, 5000 )
            this.generateVideoButton.removeClass("disabled").css("pointer-events", "auto").html("Generate");
        }).catch((err) => {
            console.log("Oh no :(")
            this.generateVideoButton.removeClass("disabled").css("pointer-events", "auto").html("Sadness");
            console.log(err);
        });
    }

    renderFilterOptions(){
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

    resetFiltersToDefaults(){
        $("#char-1-select").val(defaults.comboerChar);
        $("#char-2-select").val(defaults.comboeeChar);
        $("#comboer-tag").val(defaults.comboer);
        $("#comboee-tag").val(defaults.comboee);
        $("#stage-select").val(defaults.stage);
        $("#min-moves").val(defaults.minMoves);
        $("#max-moves").val(defaults.maxMoves);
        $("#min-damage").val(defaults.minDamage);
        $("#end-move").val(defaults.endMove);
        $("#did-kill").prop('checked', defaults.didKill);
        delete localStorage.comboerChar
        delete localStorage.comboeeChar
        delete localStorage.comboerTag
        delete localStorage.comboeeTag
        delete localStorage.stage
        delete localStorage.minMoves
        delete localStorage.maxMoves
        delete localStorage.minDamage
        delete localStorage.endMove
        delete localStorage.didKill
    }

    renderFilterValues(){
        $("#char-1-select").val(
            typeof localStorage.comboerChar == "string" ? localStorage.comboerChar : defaults.comboerChar);
        $("#char-1-select").change(function(){localStorage.comboerChar = $(this).val()})
        $("#char-2-select").val(
            typeof localStorage.comboeeChar == "string" ? localStorage.comboeeChar : defaults.comboeeChar);
        $("#char-2-select").change(function(){localStorage.comboeeChar = $(this).val()})
        $("#stage-select").val(
            typeof localStorage.stage == "string" ? localStorage.stage : defaults.stage);
        $("#stage-select").change(function(){localStorage.stage = $(this).val()})
        $("#min-moves").val(
            localStorage.minMoves ? localStorage.minMoves : defaults.minMoves);
        $("#min-moves").change(function(){ 
            if(!Number.isInteger(parseFloat(this.value))){
                alert("Please enter a whole number");
                this.value = defaults.minMoves;
                return;
            }
            localStorage.minMoves = this.value 
        })
        $("#max-moves").val(
            localStorage.maxMoves ? localStorage.maxMoves : defaults.maxMoves);
        $("#max-moves").change(function(){ 
            if(!Number.isInteger(parseFloat(this.value))){
                alert("Please enter a whole number");
                this.value = defaults.maxMoves;
                return;
            }
            localStorage.maxMoves = this.value 
        })
        $("#min-damage").val(
            localStorage.minDamage ? localStorage.minDamage : defaults.minDamage);
        $("#min-damage").change(function(){ 
            if(!Number.isInteger(parseFloat(this.value))){
                alert("Please enter a whole number");
                this.value = defaults.minDamage;
                return;
            }
            localStorage.minDamage = this.value 
        })
        $("#end-move").val(
            typeof localStorage.endMove == "string" ? localStorage.endMove : defaults.endMove);
        $("#end-move").change(function(){localStorage.endMove = $(this).val()})
        $("#did-kill").prop('checked',
            typeof localStorage.didKill == "string" ? localStorage.didKill == "true" : defaults.didKill);
        $("#did-kill").change(function(){localStorage.didKill = this.checked})
        $("#comboer-tag").val(
            localStorage.comboerTag ? localStorage.comboerTag : defaults.comboerTag);
        $("#comboer-tag").change(function(){localStorage.comboerTag = $(this).val()})
        $("#comboee-tag").val(
            localStorage.comboeeTag ? localStorage.comboeeTag : defaults.comboeeTag);
        $("#comboee-tag").change(function(){localStorage.comboeeTag = $(this).val()})

    }


    renderVideoOptions(){
        $("#dev-mode").prop('checked', 
            typeof localStorage.devMode == "string" ? localStorage.devMode == "true" : videoOptions.devMode);
        $("#dev-mode").change(function(){localStorage.devMode = this.checked})
        $("#show-overlay").prop('checked',
            typeof localStorage.showOverlay == "string" ? localStorage.showOverlay == "true" : videoOptions.showOverlay);
        $("#show-overlay").change(function(){localStorage.showOverlay = this.checked})
        $("#hide-hud").prop('checked',
            typeof localStorage.hideHud == "string" ? localStorage.hideHud == "true" : videoOptions.hideHud);
        $("#hide-hud").change(function(){localStorage.hideHud = this.checked})
        $("#game-music").prop('checked',
            typeof localStorage.gameMusic == "string" ? localStorage.gameMusic == "true" : videoOptions.gameMusic);
        $("#game-music").change(function(){localStorage.gameMusic = this.checked})
        $("#widescreen-off").prop('checked',
            typeof localStorage.widescreenOff == "string" ? localStorage.widescreenOff == "true" : videoOptions.widescreenOff);
        $("#widescreen-off").change(function(){localStorage.widescreenOff = this.checked})
        $("#num-cpus").val(
            localStorage.numCPUs ? localStorage.numCPUs : videoOptions.numCPUs);
        $("#num-cpus").change(function(){ 
            if(!Number.isInteger(parseFloat(this.value))){
                alert("Please enter a whole number");
                this.value = videoOptions.numCPUs;
                return;
            }
            localStorage.numCPUs = this.value 
        })
        $("#iso-path").val(
            localStorage.isoPath ? localStorage.isoPath : videoOptions.isoPath);
        $("#output-path").val(
            localStorage.outputPath ? localStorage.outputPath : videoOptions.outputPath);
    }

    renderOverlayOptions(){
        $("#show-player-tags").prop('checked', 
            typeof localStorage.showPlayerTags == "string" ? localStorage.showPlayerTags == "true" : overlayOptions.showPlayerTags);
        $("#show-player-tags").change(function(){localStorage.showPlayerTags = this.checked})
        $("#show-tournament").prop('checked',
            typeof localStorage.showTournament == "string" ? localStorage.showTournament == "true" : overlayOptions.showTournament);
        $("#show-tournament").change(function(){localStorage.showTournament = this.checked})
        $("#show-logo").prop('checked',
            typeof localStorage.showLogo == "string" ? localStorage.showLogo == "true" : overlayOptions.showLogo);
        if($("#show-logo").is(":checked")) $("#logo-path-option").show();
        $("#show-logo").change(function(){localStorage.showLogo = this.checked})
        $("#logo-path").val(
            localStorage.logoPath ? localStorage.logoPath : overlayOptions.logoPath);
        $("#show-date").prop('checked',
            typeof localStorage.showDate == "string" ? localStorage.showDate == "true" : overlayOptions.showDate);
        $("#show-date").change(function(){localStorage.showDate = this.checked})
        $("#overlay-margin").val(
            typeof localStorage.overlayMargin == "string" ? localStorage.overlayMargin : overlayOptions.overlayMargin);
        $("#overlay-margin").change(function(){ 
            if(!Number.isInteger(parseFloat(this.value))){
                alert("Please enter a whole number");
                this.value = overlayOptions.overlayMargin;
                return;
            }
            localStorage.overlayMargin = this.value 
        })
        $("#logo-opacity").val(
            typeof localStorage.logoOpacity == "string" ? localStorage.logoOpacity : overlayOptions.logoOpacity);
        $("#logo-opacity").change(function(){ 
            if(!Number.isInteger(parseFloat(this.value))){
                alert("Please enter a whole number");
                this.value = overlayOptions.logoOpacity;
                return;
            }
            localStorage.logoOpacity = this.value 
        })
        $("#textbox-opacity").val(
            typeof localStorage.textboxOpacity == "string" ? localStorage.textboxOpacity : overlayOptions.textboxOpacity);
        $("#textbox-opacity").change(function(){ 
            if(!Number.isInteger(parseFloat(this.value))){
                alert("Please enter a whole number");
                this.value = overlayOptions.textboxOpacity;
                return;
            }
            localStorage.textboxOpacity = this.value 
        })
        $("#iso-path").val(
            localStorage.isoPath ? localStorage.isoPath : overlayOptions.isoPath);
    }

    getOptions(){
        return {
            devMode: $("#dev-mode").is(":checked"),
            showOverlay: $("#show-overlay").is(":checked"),
            hideHud: $("#hide-hud").is(":checked"),
            gameMusic: $("#game-music").is(":checked"),
            widescreenOff: $("#widescreen-off").is(":checked"),
            numCPUs: $("#num-cpus").val(),
            isoPath: $("#iso-path").val(),
            outputPath: $("#output-path").val(),
            showPlayerTags: $("#show-player-tags").is(":checked"),
            showTournament: $("#show-tournament").is(":checked"),
            showLogo: $("#show-logo").is(":checked"),
            logoPath: $("#logo-path").val(),
            showDate: $("#show-date").is(":checked"),
            overlayMargin: $("#overlay-margin").val(),
            logoOpacity: $("#logo-opacity").val(),
            textboxOpacity: $("#textbox-opacity").val(),
            fontPath: $("#font-path").val(),
        }
    }


}

module.exports = {ComboCreator}