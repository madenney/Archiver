
const { slpToVideo } = require("../controllers/SlpToVideo");


class ComboList {

    constructor(combos){
        if(combos){
            this.combos = combos;
        } else {
            this.combos = [];
        }

    }

    generateVideo(){
        return new Promise( async (resolve,reject) => {
            await slpToVideo(this.combos);
            setTimeout(() =>{ resolve()},1000)
            
        });
    }

    totalSeconds(){
        const totalFrames = this.combos.reduce((n,c) => {
            return (c.endFrame - c.startFrame) + n
        }, 0);

        return totalFrames / 60;
    }

}

module.exports = { ComboList }