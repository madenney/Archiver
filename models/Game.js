
const { 
	getInfoFromFileName,
    getDeepInfoFromSlpFile,
    getGameStats
} = require("../lib")

class Game {

    constructor( props ) {
    	
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