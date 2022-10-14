const { SlippiGame } = require("@slippi/slippi-js");
const damageStates = [0x4B,0x4C,0x4D,0x4E,0x4F,0x50,0x51,0x52,0x53,0x54,0x55,0x56,0x57,0x58,0x59,0x5A,0x5B]
const rectangles = require("../../constants/rectangles")

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

export default (prev, params, eventEmitter) => {
    const results = []
    prev.results.slice(0,params.maxFiles).forEach( ( file, index ) => {
        const { maxFiles, comboerChar, comboerTag, comboeeChar, comboeeTag } = params
        if( index % 100 == 0 ) eventEmitter({msg: `${index}/${maxFiles ? maxFiles : prev.results.length}`})

        const { path, players, stage } = file

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
        clips.forEach( clip => results.push({...clip,...file}))
    })

    return results
}