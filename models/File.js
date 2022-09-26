


const { SlippiGame } = require("@slippi/slippi-js");
const validStageIds = [2,3,8,28,31,32]

class File {

    constructor(fileJSON){
        this.id = fileJSON.id;
        this.players = fileJSON.players;
        this.startedAt = fileJSON.startedAt;
        this.winner = fileJSON.winner;
        this.stage = fileJSON.stage;
        this.startedAt = fileJSON.startedAt;
        this.lastFrame = fileJSON.lastFrame;
        this.path = fileJSON.path;
        this.isValid = fileJSON.isValid;
        this.isProcessed = fileJSON.isProcessed;
        this.info = fileJSON.info;
    }

    process(){
        return new Promise((resolve)=> setTimeout(()=>{
            
            this.isProcessed = true;
            
            const game = new SlippiGame( this.path )

            // check settings for indicators of invalid game
            const settings = game.getSettings()
            if(!settings){
                this.isValid = false;
                this.info = "Bad settings";
                return resolve();
            }
            if( settings.isTeams ){ 
                this.isValid = false;
                this.info = "teams";
                return resolve();
            }
            if( settings.players.length !== 2 ){ 
                this.isValid = false 
                this.info = "!2 players"
                return resolve();
            }

            // Stage Check
            if( validStageIds.indexOf( settings.stageId ) === -1 ){ 
                this.isValid = false;
                this.info = "Invalid stage";
                return resolve();
            }
            const p1 = settings.players[0]
            const p2 = settings.players[1]
            if( p1.type === 1 || p2.type === 1 ){ 
                this.isValid = false 
                this.info = "Bot";
                return resolve();
            }

            // check metadata for indicators of invalid game
            const metadata = game.getMetadata()
            if(!metadata){
                this.isValid = false;
                this.info = "Bad metadata";
                return resolve();
            }
            const length = metadata.lastFrame / 60 
            if( isNaN( length ) ){ 
                this.isValid = false;
                this.info = "No length";
                return resolve();
            }
            if( length < 5 ){ 
                this.isValid = false;
                this.info = "Game Length < 5 seconds";
                return resolve();
            }

            this.isValid = true;
            this.startedAt = metadata.startAt;
            this.lastFrame = metadata.lastFrame;
            this.stage = settings.stageId;
            this.players = [{
                playerIndex: p1.playerIndex,
                port: p1.port,
                characterId: p1.characterId,
                characterColor: p1.characterColor,
                nametag: p1.nametag,
                displayName: p1.displayName
            },{
                playerIndex: p2.playerIndex,
                port: p2.port,
                characterId: p2.characterId,
                characterColor: p2.characterColor,
                nametag: p2.nametag,
                displayName: p2.displayName
            }];

            resolve()
        },1));
    }

    getCombos(options){
        const {
            comboer,comboee,comboerTag,comboeeTag,didKill,
            minMoves,maxMoves,minDamage,includesMove,endMove,
            firstMove,secondToLastMove,testMove,testVal
        } = options
        const _comboerTag = comboerTag.toLowerCase();
        const _comboeeTag = comboeeTag.toLowerCase();
        return this.combos.filter(c => {
            if( minMoves && !(c.moves.length >= minMoves) ) return false;
            if( maxMoves && !(c.moves.length <= maxMoves) ) return false;
            const comboerPlayer = this.players.find(p => p.playerIndex === c.playerIndex);
            const comboeePlayer = this.players.find(p => p.playerIndex === c.opponentIndex)

            const comboerCharId = comboerPlayer.characterId;

            if(comboer && !(comboerCharId == comboer) ) return false;
            if(comboee && !(comboeePlayer.characterId == comboee) ) return false;
            if(comboerTag && !(comboerPlayer.displayName.toLowerCase() == _comboerTag)) return false;
            if(comboeeTag && !(comboeePlayer.displayName.toLowerCase() == _comboeeTag)) return false;
            if( didKill && !c.didKill ) return false;
            if( minDamage && !(c.moves.reduce((n,m) => n + m.damage ,0) >= minDamage)) return false;
            if( includesMove && !(c.moves.find(m => m.moveId == includesMove ))) return false;
            if( firstMove && !(c.moves[0].moveId == firstMove) ) return false;
            if( secondToLastMove && !c.moves[c.moves.length-2] ) return false;
            if( secondToLastMove && !(c.moves[c.moves.length-2].moveId == secondToLastMove) ) return false;
            if( endMove && !(c.moves[c.moves.length-1].moveId == endMove) ) return false;
            if( testMove ){ } 
            if( testVal > 0 ){ }
            return true;
        })
    }

    is({stage,char1,char2,player1,player2} = {}){
        if(!this.isValid) return false 

        if(stage){
            if(!Array.isArray(stage)) stage = [stage];
            if(stage.indexOf(this.stage.toString()) == -1 ) return false
        }

        if(char1 || char2){
            let c1 = char1
            let c2 = char2
            if(char1 && !Array.isArray(char1)) c1 = [char1]
            if(char2 && !Array.isArray(char2)) c2 = [char2]
            const p1 = this.players[0].characterId.toString();
            const p2 = this.players[1].characterId.toString();
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
            const _p1 = f.players[0].displayName.toLowerCase();
            const _p2 = f.players[1].displayName.toLowerCase();
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
    }

    generateJSON(){
        return {
            id: this.id,
            players: this.players,
            winner: this.winner,
            stage: this.stage,
            startedAt: this.startedAt,
            lastFrame: this.lastFrame,
            path: this.path,
            isValid: this.isValid,
            isProcessed: this.isProcessed,
            info: this.info
        }
    }
}

module.exports = { File }