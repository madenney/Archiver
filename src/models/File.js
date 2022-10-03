
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
        this.isProcessed = true;
        
        const game = new SlippiGame( this.path )

        // check settings for indicators of invalid game
        const settings = game.getSettings()
        if(!settings){
            this.isValid = false;
            this.info = "Bad settings";
            return
        }
        if( settings.isTeams ){ 
            this.isValid = false;
            this.info = "teams";
            return
        }
        if( settings.players.length !== 2 ){ 
            this.isValid = false 
            this.info = "!2 players"
            return
        }

        // Stage Check
        if( validStageIds.indexOf( settings.stageId ) === -1 ){ 
            this.isValid = false;
            this.info = "Invalid stage";
            return
        }
        const p1 = settings.players[0]
        const p2 = settings.players[1]
        if( p1.type === 1 || p2.type === 1 ){ 
            this.isValid = false 
            this.info = "Bot";
            return
        }

        // check metadata for indicators of invalid game
        const metadata = game.getMetadata()
        if(!metadata){
            this.isValid = false;
            this.info = "Bad metadata";
            return
        }
        const length = metadata.lastFrame / 60 
        if( isNaN( length ) ){ 
            this.isValid = false;
            this.info = "No length";
            return
        }
        if( length < 5 ){ 
            this.isValid = false;
            this.info = "Game Length < 5 seconds";
            return
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
    }

    generateJSON(){
        return {
            id: this.id,
            players: this.players,
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

export default File