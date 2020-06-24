
const fs = require('fs');
const path = require('path')
const { remote: { dialog } } = require('electron');

const { isURL, asyncForEach, readableDate } = require("../lib");
const { Tournament } = require("../models/Tournament");

class Data {
    constructor(archive){
        this.archive = archive;
    }

    render(){
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
            a.tournaments.forEach(t=>{
                t.sets.forEach(s=>s.games.forEach(g=>games.push(g)));
                t.unlinkedGames.forEach(g => games.push(g));
            }); 
            const totalSmashGGSets = a.tournaments.reduce((n,t)=>t.sets.length+n,0)
            const linkedSets = a.tournaments.reduce((n,t)=>n.concat(t.sets.filter(s=>s.isLinked)),[]);
            const totalLinkedGames = linkedSets.reduce((n,s)=>s.games.length+n,0);
            totalSlpFiles += games.length;
            totalProcessedFiles += games.filter(g=>g.isProcessed).length;
            totalValidGames += games.filter(g=>g.isValid).length;
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

        // Double Check
        if(a.getAllSlpFiles().length !== totalSlpFiles){
            console.log("1-",a.getAllSlpFiles().length);
            console.log("2-",totalSlpFiles)
            throw "Your math is wrong";
        }

        $("#data-total-slp-files").html(totalSlpFiles);
        $("#data-total-processed-files").html(totalProcessedFiles);
        $("#data-total-valid-games").html(totalValidGames);
        $("#data-total-labelled-games").html(totalLabelledGames);
        $("#data-created-at").html(a.createdAt ? readableDate(a.createdAt) : "N/A");
        $("#data-updated-at").html(a.updatedAt ? readableDate(a.updatedAt) : "N/A");

    }

    assignClickListeners(){
        
        $("#import-tournament-button").off();
        $("#import-tournament-container .cancel").off();
        $("#import-tournament-container .cancel").off();
        $("#import-tournament-container .ok").off();
        $("#add-files-button").off();
        $("#select-tournament-container .ok").off();
        $("#select-tournament-container .cancel").off();
        $("#process-files-button").off();

        $("#import-tournament-button").click(() => {
            if($("#import-tournament-container").is(":visible")) return;
            $("#data-message").html('').removeClass("red");
            $("#import-tournament-input").attr('placeholder',"https://smash.gg/tournament/half-moon-55")
            this.warningCount = 0;
            $("#import-tournament-input").val('')
            $("#import-tournament-container").show();
            $("#import-tournament-container p").show();
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
                message: "If you're trying to add friendlies that took place outside of a tournament, I suggest clicking on 'Add .slp Files' and selecting 'No Tournament'.",
                buttonHtml: "No thanks"
            },
            {
                message: "Most of the labelling functionality is lost without a smash.gg link. You can still organize files this way, but this is not the recommended use of this application.",
                buttonHtml: "Continue"
            },
            {
                message: "Ok fine. What do you want to call your non-smash.gg tournament?",
                buttonHtml: "Create"
            },
            {
                message: "You have to name it",
                buttonHtml: "Create"
            }
        ]
        $("#import-tournament-container .ok").click(() => {
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
                    $("#data-message").html("New tournament created").addClass("green");
                    setTimeout(()=>$("#data-message").html("").removeClass("green"),1750)
                    this.render();
                    return;
                }
                $("#import-tournament-container p").hide();
                $("#import-tournament-container .ok").html(this.warnings[this.warningCount].buttonHtml);
                $("#data-message").html(this.warnings[this.warningCount++].message).addClass("bottom-margin");
                return;
            }
            this.warningCount = 0;
            // CHECK URL SOMEHOW

            if( !url.includes("https://smash.gg/tournament")){
                $("#data-message").html("This doesn't look like a smash.gg url");
                $("#import-tournament-container p").hide();
                return;
            }
            $("#import-tournament-container p").show();
            $("#data-message").html('').removeClass("red bottom-margin");
            $("#import-tournament-container .ok").html("Ok")
            $("#import-tournament-container").hide()
            
            let fixedUrl = url
            while(fixedUrl[fixedUrl.length-1] === " ") fixedUrl = fixedUrl.slice(0,fixedUrl.length-1);
            if(isURL(fixedUrl)){
                $("#data-message").html("Talking to smash.gg...").addClass("bottom-margin");
                const newTournament = new Tournament(tournamentJSON);
                newTournament.getSmashGGResults(fixedUrl).then((response) => {
                    console.log(newTournament)
                    this.archive.tournaments.push(newTournament);
                    this.render();
                    $("#data-message").html("New tournament created").addClass("green");
                    setTimeout(()=>$("#data-message").html("").removeClass("green"),1750)
                }).catch( err => {
                    $("#data-message").html(err).addClass("red");
                    console.log(err);
                })
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
                const newOption = $(`<option value=${index}>${tournament.name}</option>`)
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
                    const val = $("#select-tournament-dropdown").val()
                    if( val !== "none"){
                        this.archive.tournaments[parseInt(val)].addSlpFiles(path);
                    } else {
                        this.archive.addNonTournamentSlpFiles(path);
                    }
                    $("#data-message").html("Files added").addClass("green");
                    setTimeout(()=>$("#data-message").html("").removeClass("green"),1750)
                    this.render();
                } catch(err){
                    $("#data-message").addClass("red").html("An error occurred :(");
                    console.log(err);
                }

            }
        });


        $("#process-files-button").click( async () => {
            const unprocessedGames = this.archive.getAllSlpFiles().filter(f=>!f.isProcessed);
            if(!unprocessedGames.length) return;
            $("#process-files-button").prop('disabled',true).html('Processing...');
            $("#process-loading-container").show();
            $("#total-unprocessed").html(unprocessedGames.length);
            let count = 0;
            await asyncForEach(unprocessedGames, async (game) => {
                if(count % 10 === 0 ){
                    this.render();
                }
                if(count % 250 === 0 ){
                    this.archive.save();
                }
                $("#current-number-processed").html(count++);
                await game.process();;
            })

            setTimeout(() => {
                $("#process-files-button").prop('disabled',false).html('Process Files');
                $("#process-loading-container").hide();
            },1500)

            this.render();

        });

        $("#special-half-moon-button").click(() => {
            const games = this.archive.getGames();
            console.log(games.length)
            let missingSLPGames = games.filter(g => !fs.existsSync(g.slpPath))
            console.log(missingSLPGames.length)
            for(var i = 0; i < missingSLPGames.length; i+=1000){
                console.log(i)
                console.log(missingSLPGames[i])
            }

            // const sets = this.archive.tournaments.reduce((n,t)=>n.concat(t.sets.filter(s=>s.isLinked)),[]);
            // console.log(sets.length)
            // const k = sets.filter(set => {
            //     if(set.winnerTag.toLowerCase()  == "sudo") return true
            //     if(set.loserTag.toLowerCase()  == "sudo") return true

            // })
            // console.log(k.length);
            // console.log(k)
            // k.forEach(set => {
            //     if(set.winnerTag  == "Sudo") set.winnerTag = "sudo"
            //     if(set.loserTag  == "Sudo") set.loserTag = "sudo"
            //     set.games.forEach(g => {
            //         g.players.forEach(p => {
            //             if(p.tag == "Sudo") p.tag = "sudo"
            //         })
            //     })
            // })
            // console.log(k)
            // sus.isLinked = false;
            // sus.games = []
            // console.log(sus)
            // const tempGames = []
            // sus[0].games.forEach(g => tempGames.push(g))
            // sus[0].games = []
            // sus[1].games.forEach(g => sus[0].games.push(g))
            // sus[1].games = []
            // tempGames.forEach(g => sus[1].games.push(g))

            // sus.forEach(s => {
            //     s.games.forEach(g =>{
            //         g.players.forEach(p => {
            //             if(p.tag === "Gooms") {
            //                 p.tag = ".jpg"
            //                 return
            //             }
            //             if(p.tag === ".jpg") {
            //                 p.tag = "Gooms"
            //                 return
            //             }
            //         })
            //     })
            // })
            // console.log(sus)

            // let games = [];
            // sets.forEach(s => games = games.concat(s.games));
            // const games = this.archive.getGames();
            // console.log(games.length)
            // const crypto = require("crypto");

            // games.forEach(game => {
            //     game.combos.forEach(combo => {
            //         combo.id = crypto.randomBytes(8).toString('hex')
            //     })
            // })
            // console.log("DONE :)")
            
            //return
            // const asdf = this.archive.tournaments.reduce((n,t)=>n.concat(t.sets.filter(s=>s.isLinked)),[]);
            // const x = asdf.find(set => set.id === "8f0852e0-334a-4e49-9c5b-70f5f06b1038" )
            // x.isLinked = false;
            // x.games = [];
            // console.log(x)
            // return;
            //const sets = this.archive.tournaments.reduce((n,t)=>n.concat(t.sets.filter(s=>s.isLinked)),[]);
            // sets.forEach((set,index) => {
            //     try {
            //     const playerIndex = set.games[0].players[0].playerIndex
            //     let p1Score = 0;
            //     set.games.forEach(game => {
            //         if(game.winner === playerIndex ){
            //             p1Score++;
            //         } 
            //     })

                
            //     if(p1Score == set.winnerScore){
            //         set.games.forEach(game => {
            //             game.players.find(p=>p.playerIndex === playerIndex).tag = set.winnerTag
            //             game.players.find(p=>p.playerIndex !== playerIndex).tag = set.loserTag
            //         })
            //     } else {
            //         set.games.forEach(game => {
            //             game.players.find(p=>p.playerIndex == playerIndex).tag = set.loserTag
            //             game.players.find(p=>p.playerIndex !== playerIndex).tag = set.winnerTag
            //         })
            //     }
            //     } catch(err){
            //         console.log(index);
            //         //set.games.splice(0,1);
            //         console.log("WHAT: ", set)
            //         // set.games[1].process().then(() => {
            //         //     console.log("BAHA")
            //         //     console.log(set.games[1])
            //         // })
            //         throw err
            //     }
            //     console.log(set);

            // })
            // const graphQL = require('graphql-client')
            // const { tournamentQuery } = require("../constants/smashggQueries")
            // const uuidv4 = require("uuid/v4")
            // const smashGGQL = graphQL({
            //   url: 'https://api.smash.gg/gql/alpha',
            //   headers: {
            //     Authorization: 'Bearer ' + '39def3ef8804cc6f8b86e441f1f4bda1'
            //   }
            // })
            // this.archive.tournaments.forEach(async tournament => {
            //     console.log(tournament.name);
            //     let str = tournament.name;
            //     str = str.replace("H","h");
            //     str = str.replace(" ","-");
            //     str = str.replace("M","m");
            //     str = str.replace(" ","-");
            //     str = str.replace("#","");
            //     console.log(str);

            //     try {
            //         const {data,message} = await smashGGQL.query(
            //             tournamentQuery,
            //             {
            //               "slug":str
            //             }
            //         )
                    
            //         if( !data ){
            //             throw message
            //         }

            //         tournament.smashGGId = data.tournament.id

            //     } catch( err ){
            //         console.log("Something went wrong with smashGG - ")
            //         throw err
            //     }
            //     console.log(tournament);
            //     console.log("-----")
            //})

        })

    }
}


module.exports = {Data}
