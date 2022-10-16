
export default (prev, params, eventEmitter ) => {
    const results = []
    prev.results.forEach( file => {

        function findFPAABSB(game,falco,notFalco,finalClips,file){
            const frames = game.getFrames();
        
            // find shield stun clips
            const shieldStunClips = []
            let temp = []
            Object.keys(frames).forEach(key => {
                const frame = frames[key]
                if(frame.players[notFalco.playerIndex].post.actionStateId == 0xB5 ){
                    temp.push(frame)
                } else {
                    if(temp.length > 0 ){
                        shieldStunClips.push(temp)
                    }
                    temp = []
                }
        
            });
            
        
            // find shield grabs
            const shieldGrabs = []
            shieldStunClips.forEach(clip => {
                const endFrame = clip[clip.length-1].frame
                const range = 20
                for(let i = endFrame; i < endFrame + range; i++ ){
                    if(frames[i].players[notFalco.playerIndex].post.actionStateId == 0xD4){
                        shieldGrabs.push(clip)
                        break
                    }
                }
            })
            // shieldGrabs.forEach(clip => finalClips.push({clip,file}))
            // return
        
            // find fsmash responses
            const fsmashResponses = []
            const fsmashStates = [58,59,60,61,62]
            shieldGrabs.forEach(clip => {
                const endFrame = clip[clip.length-1].frame
                const range = 30
                for(let i = endFrame; i < endFrame + range; i++){
                    if(fsmashStates.includes(frames[i].players[falco.playerIndex].post.actionStateId)){
                        fsmashResponses.push(clip)
                        break;
                    }
                }
            })
        
            const damageStates = [0x4B,0x4C,0x4D,0x4E,0x4F,0x50,0x51,0x52,0x53,0x54,0x55,0x56,0x57,0x58,0x59,0x5A,0x5B]
            const fsmashPunishes = []
            fsmashResponses.forEach(clip => {
                const endFrame = clip[clip.length-1].frame
                const range = 40
                for(let i = endFrame; i < endFrame + range; i++){
                    if(damageStates.includes(frames[i].players[notFalco.playerIndex].post.actionStateId)){
                        console.log("Found One");
                        //console.log(file)
                        fsmashPunishes.push(clip)
                        break;
                    }
                }
            })
        
            // make sure the stun was caused by an aerial
            const aerials = [65,66,67,68,69]
            const fsmashPunishesAfterAerialBaitedShieldGrab = []
            fsmashPunishes.forEach(clip => {
                for(let i = 0; i < clip.length-1; i++){
                    if(aerials.includes(clip[i].players[falco.playerIndex].post.actionStateId)){
                        fsmashPunishesAfterAerialBaitedShieldGrab.push(clip)
                        fs.writeFile('saved.txt', `${file}\n`, { flag: 'a+' }, err => {console.log(err)});
                        break
                    }
                }
            })
        
            fsmashPunishesAfterAerialBaitedShieldGrab.forEach(clip => finalClips.push({clip,file}))
        }

    })
}