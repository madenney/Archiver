
class Meta {
    constructor(archive){
        this.archive = archive;
        this.isRendered =  false;
    }

    render(){
        console.log("Rendering Meta Tab");

        const a = this.archive;

        let totalSlpFiles = 0;
        let totalValidGames = 0;
        let totalLabelledGames = 0;
        if( a.nonTournamentGames ){
            totalSlpFiles += a.nonTournamentGames.length;
            totalValidGames += a.nonTournamentGames.filter(g=>g.isValid).length
            totalLabelledGames += a.nonTournamentGames.filter(g=>g.isLabelled).length
        }

        if(a.tournaments){
            
            const totalTourneyGames = a.tournaments.reduce((t,n)=>t.sets.reduce((s,x)=>s.games.length+x,0)+n,0);
            const totalSmashGGSets = a.tournaments.reduce((t,n)=>t.sets.length+n,0)
            const linkedSets = a.tournaments.reduce((t,n)=> n.concat(t.map(t.sets.filter(s=>s.isLinked))),[]);
            const totalLinkedGames = linkedSets.reduce(s=>s.games.length,0);
            totalValidGames += totalTourneyGames;
            totalLabelledGames += totalLinkedGames;

            $("#meta-total-tournaments").html(a.tournaments.length);
            $("#meta-total-tournament-games").html(totalTourneyGames)
            $("#meta-total-smashgg-sets").html(totalSmashGGSets);
            $("#meta-total-linked-sets").html(linkedSets.length)
            $("#meta-total-linked-games").html(totalLinkedGames)
        } else {
            $("#meta-total-tournaments").html("N/A");
            $("#meta-total-tournament-games").html("N/A");
            $("#meta-total-smashgg-sets").html("N/A");
            $("#meta-total-linked-sets").html("N/A");
            $("#meta-total-linked-games").html("N/A");
        }

        $("#meta-total-slp-files").html(totalSlpFiles);
        $("#meta-total-valid-games").html(totalValidGames);
        $("#meta-total-labelled-games").html(totalLabelledGames)
        $("#meta-created-at").html(a.createdAt ? a.createdAt : "N/A");
        $("#meta-updated-at").html(a.updatedAt ? a.updatedAt : "N/A");

        this.isRendered = true;

    }
}

module.exports = {Meta}
