
export default (prev, params, eventEmitter) => {
    return prev.results.filter( (file, index) => {
        if( index % 100 == 0 ) eventEmitter({msg: `${index}/${prev.results.length}`})
        const {isProcessed, isValid }  = file
        if(!isProcessed) throw "Error: Running unprocessed files."
        if(!isValid) return false

        const {stage,char1,char2,player1,player2} = params

        if(stage){
            const _stage = Array.isArray(stage) ? stage : [stage]
            if(_stage.indexOf(file.stage.toString()) == -1 ) return false
        }

        if(char1 || char2){
            let c1 = char1
            let c2 = char2
            if(char1 && !Array.isArray(char1)) c1 = [char1]
            if(char2 && !Array.isArray(char2)) c2 = [char2]
            const p1 = file.players[0].characterId.toString();
            const p2 = file.players[1].characterId.toString();
            if(c1 && c2){
                if (!((c1.indexOf(p1) !== -1 && c2.indexOf(p2) !== -1) ||
                    (c1.indexOf(p2) !== -1 && c2.indexOf(p1) !== -1))
                ) return false
            } else if(c1 && !c2 ){
                if(!(c1.indexOf(p1) !== -1 || c1.indexOf(p2) !== -1)) return false
            } else if(c2 && !c1 ){
                if(!(c2.indexOf(p1) !== -1 || c2.indexOf(p2) !== -1)) return false
            }
        }
        if(player1 || player2){
            let p1 = player1
            let p2 = player2
            if(p1 && !Array.isArray(p1)) p1 = [p1]
            if(p2 && !Array.isArray(p2)) p2 = [p2]
            const _p1 = file.players[0].displayName.toLowerCase();
            const _p2 = file.players[1].displayName.toLowerCase();
            if(p1 && p2){
                if(!((p1.indexOf(_p1) !== -1 && p2.indexOf(_p2) !== -1) ||
                    (p1.indexOf(_p2) !== -1 && p2.indexOf(_p1) !== -1))
                ) return false
            } else if(p1 && !p2 ){
                if(!(p1.indexOf(_p1) !== -1 || p1.indexOf(_p2) !== -1)) return false
            } else if(p2 && !p1 ){
                if(!(p2.indexOf(_p1) !== -1 || p2.indexOf(_p2) !== -1)) return false
            }
        }
        return true;
    })
}