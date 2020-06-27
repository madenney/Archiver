const fs = require('fs');
const path = require('path');
const arrayMove = require('array-move');

const { ComboController } = require("./components/Combo");
const { ComboList } = require("../models/ComboList");
const { characters, fastFallers } = require("../constants/characters")
const ls = require("../lib/localStorage");

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
        this.primaryList = $("#primary-list-container .list");
        this.secondaryList = $("#secondary-list-container .list");
        
        this.renderGenerateVideoButton();
        ls.render();
        
        this.loadCombos();
        this.assignClickListeners();
        this.renderPrimaryList(0,50);
    }

    assignClickListeners(){
        const videoOptionsContainer = $("#video-options-modal-container")
        const overlayOptionsContainer = $("#overlay-options-modal-container")
        const optionsModal = $(".options-modal");
        this.generateVideoButton = $("#generate-video-button");
        this.primaryListPrevButton = $("#primary-list-prev");
        this.primaryListNextButton = $("#primary-list-next");

        this.generateVideoButton.click(() => this.generateVideo() );
        
        $("#generate-sources-button").click(() => {
            this.generateSourcesFile();
        })

        $("#generate-stats-button").click(() => {
            this.generateStats();
        })

        $("#primary-list").sortable({
            stop: (event, ui) => {
                const combo = this.combos.find(c => c.id === ui.item.attr('id'))
                const originalIndex = this.combos.indexOf(combo);
                arrayMove.mutate(this.combos,originalIndex,ui.item.index())
            },
            scroll: true,
            scrollSpeed:50
        });

        this.primaryListPrevButton.click(()=> {
            this.renderPrimaryList(this.primaryListCurrentPage-1);
        })
        this.primaryListNextButton.click(()=> {
            this.renderPrimaryList(this.primaryListCurrentPage+1);
        })
        
        $("#filter-button").click(() => {
            this.loadCombos();
            this.renderPrimaryList(0)
        });
        $("#filter-reset-button").click(() => {
            ls.resetToDefaults('combo')
        })
        
        $("#video-options-button").click(() => {
            videoOptionsContainer.show();
        })
        optionsModal.click((e) => e.stopPropagation());
        videoOptionsContainer.click(() => {
            videoOptionsContainer.hide()
        })
        $("#video-options-ok-button").click(() => {
            videoOptionsContainer.hide()
        })
        $("#video-options-reset-button").click(() => {
            ls.resetToDefaults('video')
        })
        $("#overlay-options-button").click(() => {
            overlayOptionsContainer.show();
            console.log(localStorage.showLogo)
            if(localStorage.showLogo === "true"){
                $("#logo-path-option").show();
            }
        })
        optionsModal.click((e) => e.stopPropagation());
        overlayOptionsContainer.click(() => {
            overlayOptionsContainer.hide()
        })
        $("#overlay-options-ok-button").click(() => {
            overlayOptionsContainer.hide()
        })
        $("#overlay-options-reset-button").click(() => {
            ls.resetToDefaults('overlay')
            $("#logo-path-option").hide();
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
        const filterOptions = ls.getOptions('combo')
        this.games = this.archive.getGames({
            char1: filterOptions.comboerChar,
            char2: filterOptions.comboeeChar,
            stage: filterOptions.stage,
        });

        this.combos = this.games.reduce((n,game) => {
            const combos = game.getCombos({
                ...filterOptions,
                comboer: filterOptions.comboerChar,
                comboee: filterOptions.comboeeChar
            });


            // Need to combine combo object and game object
            const returnArr = [];
            combos.forEach(combo => {
                const newCombo = {
                    ...combo,
                    players: game.players,
                    stage: game.stage,
                    slpPath: game.slpPath,
                    startAt: game.tournament ? 
                        game.tournament.startAt : game.startAt,
                    gameEndFrame: game.lastFrame,
                    gameId: game.id,
                    tournamentName: game.tournament ? game.tournament.name : "N/A"
                }
                if( !n.filter(a => {
                    if( a.startFrame == newCombo.startFrame
                        && a.endFrame == newCombo.endFrame
                    ) return true
                }).length ){
                    returnArr.push(newCombo)
                }
            });
            return n.concat( returnArr )
        },[])
    }

    renderPrimaryList(page){
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
        console.log("Displaying Combos:",combosToDisplay)
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

        // Peach Blender filter
        // const _combos = this.combos.filter(c => {
        //     return c.moves[c.moves.length-1].damage > 40
        // });

        const comboList = new ComboList(this.combos);
        const options = {
            ...ls.getOptions('video'),
            ...ls.getOptions('overlay')
        };
        const vgMessage = $("#video-generate-message");
        const vgCount = $("#video-generate-count");
        const em = new events.EventEmitter();

        const totalVideos = this.combos.length;
        //const totalVideos = _combos.length;

        em.on('primaryEventMsg',msg => {
            vgMessage.html(msg);
            vgCount.html(`0/${totalVideos}`);
        });
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

    generateSourcesFile(){
        console.log("generating sources file")
        const Table = require('easy-table')

        const options = ls.getOptions('video');

        if(!options.outputPath){
            alert("Please specify outputPath");
            return;
        }

        let outputFileName = "sources.txt";
        let count = 1;
        while(fs.existsSync(path.resolve(`${options.outputPath}/${outputFileName}`))){
            outputFileName = `sources${count++}.txt`
        }
        const outputPath = path.resolve(`${options.outputPath}/${outputFileName}`)
        
        let title = "Sources\n"
        //const data = []
        const totals = {}

        this.combos.forEach((combo,index) => {
            const source = combo.slpPath;
            let str = source.split("/")
            const srcDir = str[str.indexOf("Slippi Database")+1]
            console.log(srcDir);
            if(totals[srcDir]){
                totals[srcDir]++;
            } else {
                totals[srcDir] = 1;
            }
        })
        console.log(totals)
        const data = []
        Object.keys(totals).forEach(key => {
            data.push({
                name: key,
                clips: totals[key],
                perc: (totals[key]/this.combos.length)*100
            })
        })
        console.log(data)
        
        const t = new Table
        data.sort((a,b)=> b.clips - a.clips )
        data.forEach(function(item) {
            t.cell('Source', item.name)
            t.cell('# Clips', ` ${item.clips}`, 2)
            t.cell('% contribution', ` ${item.perc.toFixed(1)}%`)
            t.newRow()
        })

        const output = Table.print(data,{
            name: {
                name: "Source"
            },
            clips: {
                name: "#Clips",
                printer: Table.number(0)
            },
            perc: {
                name: "% Contribution",
                printer: (val,width) => {
                    return Table.padLeft(`${val.toFixed(1)}%`, width)
                }
            }
        })
        
        fs.writeFileSync(outputPath, output)
        console.log("DONE")
    }

    generateStats() {
        console.log("Generate Stats: ");
        const games = {}
        const chars = {}
        let fastFallersCount = 0
        this.combos.forEach(combo => {
            if(!games[combo.gameId]) games[combo.gameId] = combo.gameId
            const comboee = combo.players.find(p=>p.playerIndex === combo.opponentIndex)
            const char = characters.find(c => c.id === comboee.characterId)
            if(chars[char.name]){
                chars[char.name]++
            } else {
                chars[char.name] = 1
            }
        })
        console.log(chars)

        console.log("Number Of Games: ", Object.keys(games).length);
        const includedGames = Object.keys(games).map(id => {
            return this.archive.nonTournamentGames.find(g => g.id == id)
        })
        console.log("YO: ", includedGames.length);

        const outerChars = {}
        includedGames.forEach(game => {
            const opponent = game.players.find(p=>p.characterId != 19 )
            if(!opponent) {
                if(outerChars[characters.find(c => c.id == 19).name]){
                    outerChars[characters.find(c => c.id == 19).name]++
                } else {
                    outerChars[characters.find(c => c.id == 19).name] = 1
                }
            } else {
               if(outerChars[characters.find(c => c.id == opponent.characterId).name]){
                    outerChars[characters.find(c => c.id == opponent.characterId).name]++
                } else {
                    outerChars[characters.find(c => c.id == opponent.characterId).name] = 1
                }
            }
        })
        console.log(outerChars)
    }
}

module.exports = {ComboCreator}