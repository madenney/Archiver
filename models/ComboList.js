


class ComboList {

    constructor(combos){
        if(combos){
            this.combos = combos;
        } else {
            this.combos = [];
        }

    }

    generateVideo(){
        return new Promise((resolve,reject) => {
            console.log(this.combos);
            const combosArray = [];
            this.combos.forEach(combo => {
                combosArray.push({
                    slpPath: combo.game.slpPath,
                    startFrame: combo.startFrame,
                    endFrame: combo.endFrame
                })
            })
            const fs = require("fs");
            fs.writeFileSync("/Users/mattdenney/Projects/Archiver/output.json", JSON.stringify(combosArray))
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