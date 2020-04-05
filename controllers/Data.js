
const fs = require('fs');
const path = require('path')
const { remote: { dialog } } = require('electron');

const { isURL } = require("../lib/index");
const { Tournament } = require("../models/Tournament");


class Data {
    constructor(archive){
        this.archive = archive;
        this.isRendered =  false;
    }

    render(){
        console.log("Rendering Data Tab");

        this.assignClickListeners();

        const a = this.archive;
        let totalSlpFiles = 0;
        let totalProcessedFiles = 0;
        let totalValidGames = 0;
        let totalLabelledGames = 0;
        if( a.nonTournamentGames ){
            totalSlpFiles += a.nonTournamentGames.length;
            totalProcessedFiles += a.nonTournamentGames.filter(g=>g.isProcessed).length
            totalValidGames += a.nonTournamentGames.filter(g=>g.isValid).length
            totalLabelledGames += a.nonTournamentGames.filter(g=>g.isLabelled).length
        }

        if(a.tournaments){
            const games = [];
            a.tournaments.forEach(t=>t.sets.forEach(s=>s.games.forEach(g=>games.push(g))));
            const totalSmashGGSets = a.tournaments.reduce((n,t)=>t.sets.length+n,0)
            const linkedSets = a.tournaments.reduce((n,t)=>n.concat(t.sets.filter(s=>s.isLinked)),[]);
            const totalLinkedGames = linkedSets.reduce((n,s)=>s.games.length,0);
            totalProcessedFiles += games.filter(g=>g.isProcessed).length
            totalValidGames += games.length;
            totalLabelledGames += totalLinkedGames;

            $("#data-total-tournaments").html(a.tournaments.length);
            $("#data-total-tournament-games").html(games.length)
            $("#data-total-smashgg-sets").html(totalSmashGGSets);
            $("#data-total-linked-sets").html(linkedSets.length)
            $("#data-total-linked-games").html(totalLinkedGames)
        } else {
            $("#data-total-tournaments").html("N/A");
            $("#data-total-tournament-games").html("N/A");
            $("#data-total-smashgg-sets").html("N/A");
            $("#data-total-linked-sets").html("N/A");
            $("#data-total-linked-games").html("N/A");
        }

        $("#data-total-slp-files").html(totalSlpFiles);
        $("#data-total-processed-files").html(totalProcessedFiles);
        $("#data-total-valid-games").html(totalValidGames);
        $("#data-total-labelled-games").html(totalLabelledGames);
        $("#data-created-at").html(a.createdAt ? a.createdAt : "N/A");
        $("#data-updated-at").html(a.updatedAt ? a.updatedAt : "N/A");

        this.isRendered = true;

    }

    assignClickListeners(){
        
        $("#import-tournament-button").off();
        $("#import-tournament-container .cancel").off();
        $("#import-tournament-container .cancel").off();
        $("#import-tournament-container .ok").off();
        $("#add-files-button").off();
        $("#select-tournament-container .ok").off();
        $("#select-tournament-container .cancel").off();

        $("#import-tournament-button").click(() => {
            if($("#import-tournament-container").is(":visible")) return;
            $("#data-message").html('').removeClass("red");
            $("#import-tournament-input").attr('placeholder',"https://smash.gg/tournament/half-moon-55")
            this.warningCount = 0;
            $("#import-tournament-input").val('')
            $("#import-tournament-container").show();
            $("#select-tournament-container").hide()
        })
        $("#import-tournament-container .cancel").click(() => {
            $("#data-message").html('').removeClass("red bottom-margin");
            $("#import-tournament-container .ok").html("Ok")
            $("#import-tournament-container p").show();
            $("#import-tournament-container").hide()
        });
        this.warnings = [
            {
                message: "Are you sure you want to create a tournament without a smash.gg url?",
                buttonHtml: "Yes I'm sure"
            },
            {
                message: "If you're just trying to add 'friendlies', I suggest clicking on 'Add .slp Files' and selecting 'No Tournament'",
                buttonHtml: "No thanks"
            },
            {
                message: "You miss out on some of the core functionality of the app when you do this. Please add a smash.gg url",
                buttonHtml: "Never"
            },
            {
                message: "Fine.\nWhat do you want to call it?",
                buttonHtml: "Create"
            },
            {
                message: "You have to name it",
                buttonHtml: "Create"
            }
        ]
        $("#import-tournament-container .ok").click(() => {
            console.log(this.warningCount);
            console.log(this.warnings.length)
            const tournamentJSON = JSON.parse(fs.readFileSync(path.resolve("models/jsonTemplates/tournamentTemplate.json")));

            const url = $("#import-tournament-input").val();
            if(url === "" || this.warningCount === this.warnings.length || this.warningCount === this.warnings.length - 1 ){
                if(this.warningCount === this.warnings.length-2){
                    $("#import-tournament-container .ok").html(this.warnings[this.warningCount].buttonHtml);
                    $("#data-message").html(this.warnings[this.warningCount++].message).addClass("bottom-margin");
                    $("#import-tournament-input").attr('placeholder','My New Tournament')
                    return;
                }
                if(this.warningCount === this.warnings.length-1){
                    if(url){
                        this.warningCount++
                    } else {
                        $("#import-tournament-container .ok").html(this.warnings[this.warningCount].buttonHtml);
                        $("#data-message").html(this.warnings[this.warningCount].message).addClass("bottom-margin");
                        $("#import-tournament-input").attr('placeholder','My New Tournament')
                        return;
                    }
                }
                if(this.warningCount === this.warnings.length){
                    this.warningCount = 0;
                    const newTournament = new Tournament(tournamentJSON);
                    newTournament.name = $("#import-tournament-input").val();
                    this.archive.tournaments.push(newTournament);
                    $("#import-tournament-container .cancel").click();
                    this.render();
                    return;
                }
                $("#import-tournament-container p").hide();
                $("#import-tournament-container .ok").html(this.warnings[this.warningCount].buttonHtml);
                $("#data-message").html(this.warnings[this.warningCount++].message).addClass("bottom-margin");
                return;
            }
            this.warningCount = 0;
            $("#import-tournament-container p").show();
            $("#data-message").html('').removeClass("red bottom-margin");
            $("#import-tournament-container .ok").html("Ok")
            $("#import-tournament-container").hide()
            

            const test = "https://smash.gg/tournament/half-moon-55"
            console.log(url)
            if(isURL(url)){
                const newTournament = new Tournament(url)
            } else {
                $("#data-message").html("Invalid URL").addClass("red");
            }
        });

        $("#add-files-button").click(() => {
            $("#data-message").html('').removeClass("red");
            $("#import-tournament-container").hide()
            $("#select-tournament-container").show();
            $("#select-tournament-dropdown").empty();
            $("#select-tournament-dropdown").append($('<option value="none">No Tournament</option>'));
            this.archive.tournaments.forEach((tournament,index) => {
                const newOption = $(`<option value=${index+1}>${tournament.name}</option>`)
                $("#select-tournament-dropdown").append(newOption);
            });
        })
        $("#select-tournament-container .cancel").click(() => {
            $("#data-message").html('').removeClass("red");
            $("#select-tournament-container").hide()
        });
        $("#select-tournament-container .ok").click(() => {

            $("#data-message").html('').removeClass("red");
            $("#select-tournament-container").hide()
            const path = dialog.showOpenDialogSync({
                properties: ['openFile','openDirectory','multiSelections'],
                filters: [{
                    name: 'SLP',
                    extensions: ['slp']
                }]
            });
            if(path && path.length ){
                try {
                    this.archive.addSlpFiles(path);
                } catch(err){
                    $("#data-message").addClass("red").html("An error occurred :(");
                    console.log(err);
                }

            }
        });
    }
}

module.exports = {Data}
