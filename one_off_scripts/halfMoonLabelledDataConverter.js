

// Warning: This code is not meant for mortal eyes








// ----------------- CSS -----------------------
// Special Half Moon Styles
/*
#special-half-moon-labeller-window{
    z-index: 100;
    display: none;
    position: absolute;
    top: 100px;
    left: 100px;
    width: 500px;
    border: solid black 3px;
    border-radius: 4px;
    background-color: gray;
    padding: 10px;

    #tourney {
        font-size: 20px;
        color: red;
    }
    #slp-set {
        height: 50px;
        font-size: 20px;
        color: black;
    }

    #potential-matches {
        height: 300px;
        overflow: scroll;
    }
    .potential-match {
        color: black;
        padding: 4px;
        background-color: lightblue;
        border: solid black 1px;

        &:hover {
            background-color: lightgreen;
            cursor: pointer;
        }

        &.selected {
            background-color: green;
        }
    }
    #skip {
        font-size: 20px;
    }
}
*/


// ----------------- HTML -----------------
// insert into data.html to resurrect
/*
<div id="special-half-moon-labeller-window">
    <div id="tourney"></div>
    <div id="slp-set"></div>
    <div id="potential-matches"></div>
    <button id="skip">Next</button>
</div>
*/
/*
<button id="special-half-moon-button">Special Half Moon Button</button>
*/


// ---------------- JS ----------------------
// Turn back now

$("#special-half-moon-button").click(() => {
    $("#special-half-moon-labeller-window").show();

    // let count = 0;
    // this.archive.tournaments.forEach(tournament => {
    //     count += tournament.unlinkedGames.length;
    // });
    // console.log("Unlinked Games: ", count )
    // return;
    let tCount = 0;
    const tournaments = this.archive.tournaments;
    const labelTourney = function(tournament){
        console.log("===============================")
        console.log("TOURNEY: ", tournament.name);
        let handLabelledSets = [];
        let currentSet = [];

        tournament.unlinkedGames.forEach(game => {
            try {
                const { slpPath } = game;
                const info = getInfoFromFileName(slpPath.substring(slpPath.lastIndexOf('/')+1));
                if(currentSet.length === 0 ){
                    currentSet.push({ game , ...info })
                    return
                }
                if(
                    currentSet[0].player1 === info.player1 &&
                    currentSet[0].player2 === info.player2 &&
                    currentSet[0].setNumber === info.setNumber 
                ){
                    currentSet.push({ game , ...info });
                }  else {
                    handLabelledSets.push(currentSet);
                    currentSet = [{ game , ...info }];
                }
            } catch (err){
                console.log("ERR?", err);
            }
        })
        if(currentSet.length > 0){
            handLabelledSets.push(currentSet);
        }
        console.log(handLabelledSets);

        const zeroMatchHMSets = [];
        const tooManyMatchHMSets = [];
        handLabelledSets.forEach(handLabelledSet => {
            const potentialMatches = tournament.sets.filter(set => {
                if( ( set.winnerTag.toLowerCase() === handLabelledSet[0].player1.toLowerCase() &&
                      set.loserTag.toLowerCase() === handLabelledSet[0].player2.toLowerCase() ) ||
                    ( set.loserTag.toLowerCase() === handLabelledSet[0].player1.toLowerCase() &&
                      set.winnerTag.toLowerCase() === handLabelledSet[0].player2.toLowerCase() ) 
                ){
                    return true
                }
                return false
            })

            if(potentialMatches.length === 0 ){
                zeroMatchHMSets.push(handLabelledSet);
            } else if (potentialMatches.length === 1){
                const matchedSet = potentialMatches[0];
                handLabelledSet.forEach(_game => {
                    const game = _game.game
                    matchedSet.games.push(game);
                    const orginalGame = tournament.unlinkedGames.find(g => g.slpPath === game.slpPath);
                    tournament.unlinkedGames.splice(tournament.unlinkedGames.indexOf(orginalGame),1) ;
                })
                matchedSet.isLinked = true;
            } else {
                tooManyMatchHMSets.push({handLabelledSet,potentialMatches})
            }
        })

        console.log(tournament);
        $("#tourney").html(tournament.name)
        console.log("Linked Officially: ", tournament.sets.filter(s=>s.isLinked).length)
        console.log("Zero match: ", zeroMatchHMSets.length);
        console.log("Too many Count: ", tooManyMatchHMSets.length);

        const populateWindow = function(set, unlinkedSmashGGSets){
            console.log(`${set[0].player1} vs ${set[0].player2} - #${set[0].setNumber}`)
            console.log(set);
            $("#slp-set").empty();
            $("#slp-set").append(`<div>${set[0].player1} vs ${set[0].player2} - #${set[0].setNumber}</div>`)
            $("#slp-set").append(`<div>#games: ${set.length}</div>`)
            $("#potential-matches").empty();
            unlinkedSmashGGSets.forEach(u => {
                console.log("match", u)
                const div = $("<div>").addClass("potential-match");
                div.append($(`<div>${u.winnerTag} vs ${u.loserTag}</div>`));
                div.append($(`<div>${u.event} - ${u.fullRoundText}</div>`));
                div.append($(`<div>${u.winnerScore} - ${u.loserScore}</div>`))
                div.append($(`<div>winner mains: ${u.winnerMains}</div>`))
                div.append($(`<div>loser mains: ${u.loserMains}</div>`))
                //div.html = (u);

                div.click(() => {
                    div.addClass("selected");
                    console.log("LINKED");
                    set.forEach(_game => {
                        const game = _game.game
                        u.games.push(game);
                        const orginalGame = tournament.unlinkedGames.find(g => g.slpPath === game.slpPath);
                        tournament.unlinkedGames.splice(tournament.unlinkedGames.indexOf(orginalGame),1);
                    });
                    u.isLinked = true;
                    console.log(u);
                    console.log("--- --- --- --- ---")
                })

                $("#potential-matches").append(div);
            })
        }
        console.log("zero matches: ", zeroMatchHMSets);
        console.log("Too many matches; ", tooManyMatchHMSets);
        // go through too many matches first:
        if(tooManyMatchHMSets.length > 0 ){ 
            console.log("TOO MANY")
            let i = 0;
            populateWindow(tooManyMatchHMSets[0].handLabelledSet, tooManyMatchHMSets[0].potentialMatches)
            $("#skip").off();
            $("#skip").click(() => {
                console.log("SKIP 1");
                i++;
                if(i < tooManyMatchHMSets.length ){
                    populateWindow(tooManyMatchHMSets[i].handLabelledSet, tooManyMatchHMSets[i].potentialMatches)
                } else {
                    if(zeroMatchHMSets.length > 0){
                        console.log("ZERO");
                        let j = 0;
                        populateWindow(zeroMatchHMSets[0], tournament.sets.filter(s=>!s.isLinked))

                        $("#skip").off();
                        $("#skip").click(() => {
                            console.log("SKIP 2");
                            j++;
                            if(j < zeroMatchHMSets.length ){
                                populateWindow(zeroMatchHMSets[j], tournament.sets.filter(s=>!s.isLinked))
                            } else {
                                console.log("FINISHED");
                                tCount++;
                                if(tCount < tournaments.length){
                                    labelTourney(tournaments[tCount])
                                }
                            }
                        })
                    } else {
                        console.log("FINISHED 2");
                        tCount++;
                        if(tCount < tournaments.length){
                            labelTourney(tournaments[tCount])
                        }
                    }
                }
            })
        } else {
            console.log("ERRRFFFFGGGGGGGGGGGGGG");
            if(zeroMatchHMSets.length > 0){
                console.log("ZERO");
                let j = 0;
                populateWindow(zeroMatchHMSets[0], tournament.sets.filter(s=>!s.isLinked))

                $("#skip").off();
                $("#skip").click(() => {
                    console.log("SKIP 2");
                    j++;
                    if(j < zeroMatchHMSets.length ){
                        populateWindow(zeroMatchHMSets[j], tournament.sets.filter(s=>!s.isLinked))
                    } else {
                        console.log("FINISHED");
                        tCount++;
                        if(tCount < tournaments.length){
                            labelTourney(tournaments[tCount])
                        }
                    }
                })
            } else {
                console.log("FINISHED 2");
                tCount++;
                if(tCount < tournaments.length){
                    labelTourney(tournaments[tCount])
                }
            }
        }
    }

    labelTourney(tournaments[0])
});