const { SlippiGame } = require("@slippi/slippi-js");
const {actionStates} = require("../../constants/actionStates")

export default (prev, params, eventEmitter) => {

    const results = []
    const { maxFiles } = params
    prev.results.slice(0,maxFiles==""?undefined:parseInt(maxFiles)).forEach( ( file, index ) => {
        const { comboerChar, comboeeChar, comboerTag, comboeeTag } = params

        if( index % 1 == 0 ) eventEmitter({msg: `${index}/${maxFiles ? maxFiles : prev.results.length}`})

        const { path, players, stage } = file
        const game = new SlippiGame( path )
        let frames
        try {
            frames = game.getFrames()
        } catch(e){
            console.log(e)
            return console.log("Broken file:", file)
        }


        // The following logic needs to be broken out into its own parser
        console.log("frames: ", Object.keys(frames).length)
        let comboer, comboee, ditto
        if(comboerChar){
            comboer = players.find(p=> p&&p.characterId == comboerChar)
            // if the other character is also the target comboerChar, set flag
            if(players.find(p=>p&&p.playerIndex != comboer.playerIndex).characterId == comboerChar){
                ditto = true
            }
        }
        if(comboeeChar){
            comboee = players.find(p=> p.characterId == comboeeChar)
            // if the other character is also the target comboeeChar, set flag
            if(players.find(p=>p&&p.playerIndex != comboee.playerIndex).characterId == comboeeChar){
                ditto = true
            }
        }
        if( comboerTag){
            comboer = players.find(p=>p&&p.displayName.toLowerCase() == comboerTag.toLowerCase())
            ditto = false
        }
        if( comboeeTag){
            comboee = players.find(p=>p&&p.displayName.toLowerCase() == comboeeTag.toLowerCase())
            ditto = false
        }

        // Treat no comboer/comboee as a ditto, same logic applies
        if(comboer && !comboee){
            comboee = players.find(p => p&&p.playerIndex != comboer.playerIndex)
        } else if(!comboer && comboee ){
            comboer = players.find(p => p&&p.playerIndex != comboee.playerIndex)
        } else if (!comboer && !comboee ){
            ditto = true
            comboer = players.find(p => p)
            comboee = players.find(p => p&&p.playerIndex != comboer.playerIndex)
        }

        // once comboer and combee are determined:
        let temp = []
        Object.keys(frames).forEach( key => {
            const currentFrame = frames[key]
            try {
            let comboerThisFrame = frames[key].players.find(p=>p&&p.post.playerIndex == comboer.playerIndex)
            let comboeeThisFrame = frames[key].players.find(p=>p&&p.post.playerIndex == comboee.playerIndex)
            
            // this is not always going to work
            if( isInstance(comboerThisFrame,comboeeThisFrame,params)){
                temp.push(currentFrame)
            } else {
                if(temp.length > 0 ){
                    results.push({
                        path,
                        comboer,
                        comboee,
                        stage,
                        startFrame: temp[0].frame,
                        endFrame: temp[temp.length-1].frame
                    })
                    temp = []
                }
            }

            // if its a ditto, pass in reversed players to check,
            // this will fuck up under conditions that will *probably* never arise
            if( ditto ){
                if( isInstance(comboeeThisFrame,comboerThisFrame,params)){
                    temp.push(currentFrame)
                } else {
                    if(temp.length > 0 ){
                        results.push({
                            path,
                            comboer: comboee, // god forgive me
                            comboee: comboer, // the ugliest code
                            stage,
                            startFrame: temp[0].frame,
                            endFrame: temp[temp.length-1].frame
                        })
                        temp = []
                    }
                }
            }
            } catch(e){
                console.log("Errored frame: ", currentFrame)
                throw e
            }

        })
       
    })
    return results
}

function isInstance(comboer,comboee,params){
    const {comboerActionState, comboeeActionState, comboerXPos, comboerYPos, 
        comboerMaxD, comboeeXpos, comboeeYpos, comboeeMaxD } = params

    if(!comboerActionState && !comboeeActionState ){
        throw "Error: You've passed in no action states so every frame is a valid instance"
    }
    // convert to values. 
    // TODO: figure out how to remove this logic 
    if( comboerActionState){
        let states = actionStates.find(s=>s.id == comboerActionState).actionStateID
        states = Array.isArray(states) ? states : [states]

        if( states.indexOf(comboer.post.actionStateId) == -1 ) return false
    }
    if( comboeeActionState ) {
        let states = actionStates.find(s=>s.id == comboeeActionState).actionStateID
        states = Array.isArray(states) ? states : [states]
        if( states.indexOf(comboee.post.actionStateId) == -1 ) return false
    } 
    return true 
}