
const { SlippiGame, ConsoleCommunication } = require("@slippi/slippi-js");
const rectangles = require("../constants/rectangles")
const { getDistance } = require("../lib").default
const damageStates = [0x4B,0x4C,0x4D,0x4E,0x4F,0x50,0x51,0x52,0x53,0x54,0x55,0x56,0x57,0x58,0x59,0x5A,0x5B]
const shineStates = [360,361,362,363,364,365,366,367,368]

class Pattern {

    constructor(patternJSON){
        this.id = patternJSON.id
        this.isActive = patternJSON.isActive ? patternJSON.isActive : false
        this.isProcessed = patternJSON.isProcessed ? patternJSON.isProcessed : false
        this.type = patternJSON.type
        this.method = patternJSON.method ? patternJSON.method : {}
        this.results = patternJSON.results ? patternJSON.results : []
    }

    run(prev, eventEmitter){
        console.log("Pattern: ", this.type)
        console.log("PREV: ", prev)
        let count = 0;
        let resultsLength = prev.results.length
        switch(this.type){
            case "file":
                this.results = prev.results.filter( file => {
                    eventEmitter({msg: `${count++}/${resultsLength}`})
                    const {isProcessed, isValid }  = file
                    if(!isProcessed) throw "Error: Running unprocessed files."
                    if(!isValid) return false

                    const {stage,char1,char2,player1,player2} = this.method

                    if(stage){
                        if(!Array.isArray(stage)) stage = [stage];
                        if(stage.indexOf(file.stage.toString()) == -1 ) return false
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
                return this.results
            
            case "slpParser":
                this.results = []
                prev.results.forEach( file => {
                    eventEmitter({msg: `${count++}/${resultsLength}`})

                    const { minHits, maxFiles, comboerChar, comboerTag, comboeeChar, comboeeTag, didKill } = this.method
                    if(parseInt(maxFiles) && count > parseInt(maxFiles) ) return 
                    const { path, players, stage } = file
                    if(stage == "32") return false
                    const game = new SlippiGame( path )
                    let combos
                    try {
                        combos = game.getStats().combos 
                    } catch(e){
                        return console.log("Broken file:", file)
                    }
                    const filteredCombos = []
                    combos.forEach( combo => {
                        if(minHits && combo.moves.length < minHits ) return false
                        const comboer = players.find(p => p.playerIndex == combo.moves[0].playerIndex)
                        const comboee = players.find(p => p.playerIndex == combo.playerIndex )
                        if( comboerChar && comboerChar != comboer.characterId) return false
                        if( comboerTag && comboerTag != comboer.displayName.toLowerCase()) return false
                        if( comboeeChar && comboeeChar != comboee.characterId) return false
                        if( comboeeTag && comboeeTag != comboee.displayName.toLowerCase()) return false
                        if( didKill && !combo.didKill ) return false

                        filteredCombos.push({
                            comboer,
                            comboee,
                            path,
                            stage,
                            ...combo
                        })
                    })
                    filteredCombos.forEach(c => this.results.push(c))
                })
                return this.results

            case "comboFilter":
                let testCount = 0;
                this.results = prev.results.filter( combo => {
                    eventEmitter({msg: `${count++}/${resultsLength}`})
                    const { minHits, maxHits, minDamage, comboerChar, comboerTag, comboeeChar, comboeeTag, comboStage, didKill, nthMoves } = this.method
                    const { moves, comboer, comboee, path, stage } = combo
                    if(minHits && moves.length < minHits ) return false
                    if(maxHits && moves.length > maxHits ) return false
                    if( minDamage && !(moves.reduce((n,m) => n + m.damage ,0) >= minDamage)) return false;
                    if(!combo.comboer || !combo.comboee ) { console.log("???: ", combo); testCount++;return false }
                    if( comboerChar && comboerChar != comboer.characterId) return false
                    if( comboerTag && comboerTag != comboer.displayName.toLowerCase()) return false
                    if( comboeeChar && comboeeChar != comboee.characterId) return false
                    if( comboeeTag && comboeeTag != comboee.displayName.toLowerCase()) return false
                    if( comboStage && comboStage != stage ) return false
                    if( didKill && !combo.didKill ) return false
                    if( nthMoves && nthMoves.length > 0 ){
                        if(!nthMoves.every( nthMove => {
                            const n = parseInt(nthMove.n)
                            if( n >= 0 ){
                                return moves[n].moveId == nthMove.moveId
                            } else {
                                return moves[moves.length+n].moveId == nthMove.moveId
                            }
                        })) return false
                    }

                    return {
                        comboer,
                        comboee,
                        path,
                        stage,
                        ...combo
                    }
                })
                console.log("Not Good: ", testCount)
                return this.results
            
        

            case "edgeguard":
                this.results = []
                prev.results.forEach( file => {
                    eventEmitter({msg: `${count++}/${resultsLength}`})

                    const { path, players, stage } = file
                    const { maxFiles, comboerChar, comboerTag, comboeeChar, comboeeTag } = this.method
                    if(count > parseInt(maxFiles) ) return false

                    let game, stats
                    try {
                        game = new SlippiGame( path )
                        stats = game.getStats();
                    } catch(e){
                        console.log("Error - ", file.path )
                        return console.log("Skipping file")
                    }
                    const stocks = []
                    stats.stocks.forEach( stock => {
                        const comboer = players.find(p => p.playerIndex != stock.playerIndex )
                        const comboee = players.find(p => p.playerIndex == stock.playerIndex )
                        if( comboerChar && comboerChar != comboer.characterId) return false
                        if( comboerTag && comboerTag != comboer.displayName.toLowerCase()) return false
                        if( comboeeChar && comboeeChar != comboee.characterId) return false
                        if( comboeeTag && comboeeTag != comboee.displayName.toLowerCase()) return false
                        stocks.push({
                            ...stock,
                            comboer,
                            comboee
                        })
                    })

                    if(!stocks.length) return false
                
                    // Get Blast Zones and Edges
                    const rightBlastZone = rectangles[stage].bz
                    const leftBlastZone = { ...rightBlastZone, xMin: rightBlastZone.xMin*-1, xMax: rightBlastZone.xMax*-1 }
                    const rightEdge = rectangles[stage].edge
                    const leftEdge = {  ...rightEdge, xMin: rightEdge.xMin*-1, xMax: rightEdge.xMax*-1 }
                

                    const frames = game.getFrames();
                    const leftSideStocks = []
                    const rightSideStocks = []
                    stocks.forEach(s => {
                        const penultimateFrame = frames[s.endFrame-1]
                        const coords = {
                            x: penultimateFrame.players[s.comboee.playerIndex].post.positionX,
                            y: penultimateFrame.players[s.comboee.playerIndex].post.positionY
                        }
                        if( areCoordsInRectangle(coords,rightBlastZone) ){
                            rightSideStocks.push(s)
                        } else if( _areCoordsInRectangle(coords,leftBlastZone) ){
                            leftSideStocks.push(s)
                        } else {
                            return 
                        }
                    })
                
                    // find stocks where comboee enter rectangle from right side
                    const rightEdgeGuardStocks = rightSideStocks.filter(s => {
                        let currentFrame = s.endFrame-1
                        while(currentFrame > 0){
                            if(frames[currentFrame].players[s.comboee.playerIndex].post.positionX < rightEdge.xMax ){
                                break
                            }
                            currentFrame--
                        }
                        currentFrame = currentFrame - 2
                        while(currentFrame > 0){
                            if(frames[currentFrame].players[s.comboee.playerIndex].post.positionX > rightEdge.xMax ){
                                return true
                            }
                            if(frames[currentFrame].players[s.comboee.playerIndex].post.positionX < rightEdge.xMin ){
                                return false
                            }
                            currentFrame--
                        }
                    })
                    const leftEdgeGuardStocks = leftSideStocks.filter(s => {
                        let currentFrame = s.endFrame-1
                        while(currentFrame > 0){
                            if(frames[currentFrame].players[s.comboee.playerIndex].post.positionX > leftEdge.xMax ){
                                break
                            }
                            currentFrame--
                        }
                        currentFrame = currentFrame - 2
                        while(currentFrame > 0){
                            if(frames[currentFrame].players[s.comboee.playerIndex].post.positionX < leftEdge.xMax ){
                                return true
                            }
                            if(frames[currentFrame].players[s.comboee.playerIndex].post.positionX > leftEdge.xMin ){
                                return false
                            }
                            currentFrame--
                        }
                    })
                
                    // make clips
                    const clips = []
                    rightEdgeGuardStocks.forEach(s => {
                        // find last spot hit inside of box
                        let currentFrame = s.endFrame -1
                        while(currentFrame > 0 ){
                            if(
                                frames[currentFrame].players[s.comboee.playerIndex].post.positionX < rightEdge.xMin 
                               && damageStates.includes(frames[currentFrame].players[s.comboee.playerIndex].post.actionStateId)
                            ){
                                clips.push({
                                    startFrame: currentFrame,
                                    endFrame: s.endFrame,
                                    ...s
                                })
                                break
                            }
                            currentFrame--
                        }
                    })
                
                    leftEdgeGuardStocks.forEach(s => {
                        // find last spot hit inside of box
                        let currentFrame = s.endFrame -1
                        while(currentFrame > 0 ){
                            if(
                                frames[currentFrame].players[s.comboee.playerIndex].post.positionX > leftEdge.xMin 
                               && damageStates.includes(frames[currentFrame].players[s.comboee.playerIndex].post.actionStateId)
                            ){
                                clips.push({
                                    startFrame: currentFrame,
                                    endFrame: s.endFrame,
                                    ...s
                                })
                                break
                            }
                            currentFrame--
                        }
                    })
                    clips.forEach( clip => this.results.push({...clip,...file}))
                })
            
                return this.results

            case "single":
                console.log("AIN'T NOTHIN' HERE YET.")
        }
    }

    generateJSON(){
        return {
            id: this.id,
            isActive: this.isActive,
            isProcessed: this.isProcessed,
            type: this.type,
            method: this.method,
            results: this.results
        }
    }

}

export default Pattern


function areCoordsInRectangle(coords,rectangle){
    return (
        coords.x > rectangle.xMin && coords.x < rectangle.xMax && 
        coords.y > rectangle.yMin && coords.y < rectangle.yMax
    )
}

function _areCoordsInRectangle(coords,rectangle){
    return (
        coords.x < rectangle.xMin && coords.x > rectangle.xMax && 
        coords.y > rectangle.yMin && coords.y < rectangle.yMax
    )
}