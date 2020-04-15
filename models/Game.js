
const { 
	getInfoFromFileName,
    getDeepInfoFromSlpFile,
    getGameStats
} = require("../lib")


const slpParser = require("slp-parser-js")

const validStageIds = [2,3,8,28,31,32]


class Game {

    constructor(gameJSON){
        this.id = gameJSON.id;
        this.players = gameJSON.players;
        this.startedAt = gameJSON.startedAt;
        this.winner = gameJSON.winner;
        this.stage = gameJSON.stage;
        this.startedAt = gameJSON.startedAt;
        this.slpPath = gameJSON.slpPath;
        this.isValid = gameJSON.isValid;
        this.isFriendly = gameJSON.isFriendly;
        this.isProcessed = gameJSON.isProcessed;
        this.info = gameJSON.info;

        // Break this into it's own Combo class? 
        this.combos = gameJSON.combos;
    }

    process(){
        return new Promise((resolve,reject)=> setTimeout(()=>{
            console.log(this.slpPath);
            this.isProcessed = true;
            const game = new slpParser.default( this.slpPath )

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
            if( validStageIds.indexOf( settings.stageId ) === -1 ){ 
                this.isValid = false;
                this.info = "Illegal stage";
                return resolve();
            }
            const p1 = settings.players[0]
            const p2 = settings.players[1]
            if( p1.type === 1 || p2.type === 1 ){ 
                this.isValid = false 
                this.info = "Bot";
                return resolve();
            }
            if( p1.startStocks != 4 || p2.startStocks != 4 ){ 
                this.isValid = false;
                this.info = "startStocks != 4";
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
            if( length < 45 ){ 
                this.isValid = false;
                this.info = "Game Length < 45 seconds";
                return resolve();
            }

            // check stats for indicators of invalid game
            const x = game.getStats();
            console.log(x);
            const { overall, stocks, gameComplete, conversions, combos } = game.getStats();
            // TODO: Come back to this
            if( !gameComplete ){ throw "INCOMPLETE GAME???? " + this.slpPath }
            if( overall.every( p => p.totalDamage < 100 )){ 
                this.isValid = false;
                this.info = "Damage < 100";
                return resolve();
            }
            if( overall.some( p => p.inputCount < 100 )){ 
                this.isValid = false;
                this.info = "InputCount < 100";
                return resolve();
            }
            const p1Stocks = stocks.filter( stock => stock.playerIndex === p1.playerIndex )
            const p2Stocks = stocks.filter( stock => stock.playerIndex === p2.playerIndex )
            if( p1Stocks.length < 4 && p2Stocks.length < 4 ){
                this.isValid = false;
                this.info = "Neither player used 4 stocks";
                return resolve();
            }


            // Get Winner
            let winnerIndex
            if( p1Stocks.length < 4 ){ winnerIndex = p1Stocks[0].playerIndex }
            if( p2Stocks.length < 4 ){ winnerIndex = p2Stocks[0].playerIndex }
            if( typeof winnerIndex === "undefined" ){
                // if both last stocks ended on null, game must have ended with pause
                if( !p1Stocks[3].endFrame && !p2Stocks[3].endFrame){
                    // assume winnerIndex was last player to win a conversion
                    winnerIndex = conversions[conversions.length-1].playerIndex
                } else {
                    if( !p1Stocks[3].endFrame ){ 
                        winnerIndex = p1Stocks[0].playerIndex 
                    } else {
                        winnerIndex = p2Stocks[0].playerIndex
                    }
                }
            }

            if( typeof winnerIndex === "undefined" ){ throw "Error: Somehow didn't determine a winner." } 

            this.isValid = true;
            this.startedAt = metadata.startAt;
            this.length = Math.floor( metadata.lastFrame / 60 );
            this.stage = settings.stageId;
            this.winner = winnerIndex;
            this.players = [{
                playerIndex: p1.playerIndex,
                port: p1.port,
                characterId: p1.characterId,
                characterColor: p1.characterColor,
                nametag: p1.nametag
            },{
                playerIndex: p2.playerIndex,
                port: p2.port,
                characterId: p2.characterId,
                characterColor: p2.characterColor,
                nametag: p2.nametag
            }];
            this.combos = combos;

            resolve()
        },1));
    }

    getCombos({comboer,comboee,didKill,minMoves,minDamage,containsMove,endMove}){
        return this.combos.filter(c => {
            const comboerCharId = this.players.find(p => {
                return p.playerIndex === c.playerIndex;
            });
            const comboeeCharId = this.players.find(p => {
                return p.playerIndex === c.opponentIndex;
            });
            if(comboer && !comboerCharId === comboer ) return false;
            if(comboee && !comboeeCharId === comboee ) return false;
            if( didKill && !c.didKill ) return false;
            if( minMoves && !c.moves.length >= minHits ) return false;
            if( minDamage && !c.moves.reduce((n,m) => n + m.damage ,0) >= minDamage) return false;
            if( containsMove && !c.moves.find(m => m.moveId === containsMove )) return false;
            if( endMove && !c.moves[c.moves.length-1].moveId === endMove ) return true;
            return true;
        });
    }


    generateJSON(){
        return {
            id: this.id,
            players: this.players,
            winner: this.winner,
            stage: this.stage,
            startedAt: this.startedAt,
            length: this.length,
            slpPath: this.slpPath,
            isValid: this.isValid,
            isFriendly: this.isFriendly,
            combos: this.combos,
            isProcessed: this.isProcessed,
            info: this.info
        }
    }

    // 4/3
    oldConstructor( props ) {
    	
    	if( props.slpFileName ){
    		if( !props.slpFileName.indexOf( "_vs_" ) ){
    			throw new Error(`Invalid slpFileName in Game constructor: ${props.slpFileName}`)
        	}
            try {
                const fileNameInfo = getInfoFromFileName( props.slpFileName )
                this.player1 = fileNameInfo.player1
                this.player2 = fileNameInfo.player2
                this.unlinkedSetNumber = fileNameInfo.setNumber
            } catch ( error ){
                if( error.message === "Friendly" ){
                    throw error
                }
            }
        	
        }

        
        this.slpFileName = props.slpFileName
        this.slpFilePath = props.slpFilePath
    }

    getGameStats(){
        return getGameStats( this.slpFilePath )
    }
    getSlpInfo(){
        return getDeepInfoFromSlpFile( this.slpFilePath )
    }

}

module.exports = { Game }