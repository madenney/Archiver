
/* ~Makeup of an overlay element~
 * type - either "img", "text", or "hybrid"
 * x - x position of the top left corner of the element
 *   - % of the video width
 * y - y position of the top left corner of the element
 *   - % of the video height
 * width - width of the element
 *       - % of video width
 * 
 * ^ all elements inherit the properties above
 * 
 * ~Makeup of a Image element (type: "img")~
 * opacity - as a value from 0 (transparent) to 1 (opaque)
 * filePath - file path of the image
 * 
 * ~Makeup of a Text element (type: "text")~
 * height - height of the textbox
 *        - % of the video height
 * fillColor - rgba color of the textbox
 *           - e.g. "rgba(150, 0, 150, 100)" <- yes, the quotes are needed (it's a string)
 *           - invisible if null
 * borderColor - rgba color of the border 
 *             - invisible if null
 * borderWidth - thickness of the border in px 
 *             - I usually use 3
 * rounded - whether it's a rounded box
 *         - default true
 * arcRadius - radius of the rounded corners of the rounded box
 *           - default true
 *           - note: must be > 0, otherwise no rounded box
 * lines - array of "line" objects 
 *       - note: specified in "makeup of a line"
 * vertOffset - offset of the lines
 *            - % of the TEXTBOX height (NOT video height)
 *            - note: + value means offset down, - value means offset up
 * 
 * ^ Hybrid inherits from Text
 * 
 * ~Makeup of a Hybrid element (type: "hybrid")~
 * divide - divide between the text and the icons
 *        - % of the textbox width
 *        - note: + value means icons on the right, - value means icons on the left, 0 means no divide (aka anarchy)
 * icons - array of icon objects with the following parameters:
 *       - path - file path of the image
 *       - width - width of the icon to scale to
 *               - % of the textbox width
 *       - opacity - as a value from 0 (transparent) to 1 (opaque)
 * 
 * 
 * ~Makeup of a line (will be used by Text and Hybrid)~
 * text - the string to be displayed
 * fontPath - path of the ttf file for the desired font
 *          - if null, will be default canvas serif
 * alignment - "left", "right", or "center"
 * marginLeft - margin between left side of textbox and text
 *            - % of the textbox width
 * marginRight - margin between right side of the textbox (or the divide) and text
 *             - % of the  textbox width
 * color - rgba value of the text color
 * borderColor - rgba value of the text border color
 *             - if null, then no border
 * borderWidth - thickness of text border in px
 * maxSize - starting font size in px (before shrinking to fit)
 *         - default = 32
 * minSize - minimum font size in px (will scale down from max to min if needed)
 *         - default = 20
 * x - x position as a % of textbox width
 *   - if null, will center normally
 * y - y position as a % of textbox height
 *   - if null, will center normally
 *   - note: the coords are the bottom of the text
 * 
 * ~Makeup of an icon (will be used by Hybrid)~
 * path - file path of the image
 * width - width of the icon to scale to
 *       - % of the textbox width
 * opacity - as a value from 0 (transparent) to 1 (opaque)
 * x - x position as a % of textbox width
 *   - if null, will center like lines
 * y - y position as a % of textbox height
 *   - if null, will center like lines
 */

const example =     [
{
    "type": "img",
    "x": null,
    "y": null,
    "width": null,
    "opacity": 0,
    "filePath": null
},
{
    "type" : "text",
    "x": null,
    "y": null,
    "width": null,
    "height": null,
    "fillColor": null,
    "borderColor": null,
    "borderWidth": null,
    "rounded": true,
    "arcRadius": 10,
    "lines": [
        {
        "text": null,
        "font": null,
        "alignment": null,
        "marginLeft": null,
        "marginRight": null,
        "color": null,
        "borderColor": null,
        "borderWidth": null,
        "maxSize": 32,
        "minSize": 20,
        "x": null,
        "y": null
        }
    ],
    "vertOffset": null
},
{
    "type" : "hybrid",
    "x": null,
    "y": null,
    "width": null,
    "height": null,
    "fillColor": null,
    "borderColor": null,
    "borderWidth": null,
    "rounded": true,
    "arcRadius": 10,
    "lines": [
        {
        "text": null,
        "font": null,
        "alignment": null,
        "marginLeft": null,
        "marginRight": null,
        "color": null,
        "borderColor": null,
        "borderWidth": null,
        "maxSize": 32,
        "minSize": 20,
        "x": null,
        "y": null
        }
    ],
    "vertOffset": null,
    "divide": null,
    "icons": [
        {
            "path": null,
            "width": null, 
            "opacity": null,
            "x": null,
            "y": null
        }
    ]
}
] 

//TODO: text and textbox opacity

const fs = require('fs')
const { createCanvas, loadImage, registerFont } = require('canvas')
const { videoConstants } = require('../constants/video')
const { asyncForEach } = require('./index')

const VID_WIDTH = videoConstants.width;
const VID_HEIGHT = videoConstants.height;
//const ROUNDED_TEXTBOX = videoConstants.ROUNDED_TEXTBOX;
//const ARC_RADIUS = videoConstants.ARC_RADIUS;

async function pasteImage(ctx, path, x, y, width, opacity) {

    try {
        const image = await loadImage(path);

        //need to scale image height to keep aspect ratio
        const scale = width / image.width;
        const height = scale * image.height;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.drawImage(image, x, y, width, height);
        ctx.restore();
        
        return "huzzah!"
    } catch (err) {
        throw err;
    }
}

async function handleImage(ctx, element) {

    // scale to video size
    const x = element.x * VID_WIDTH;
    const y = element.y * VID_HEIGHT;
    const width = element.width * VID_WIDTH;

    try {
        await pasteImage(ctx, element.filePath, x, y, width, element.opacity);
    } catch(err) {
        throw err;
    }
}

function roundedBox(ctx, element, x, y, width, height, radius) {
    ctx.save();

    if(element.fillColor) ctx.fillStyle = element.fillColor;
    if(element.borderColor) ctx.strokeStyle = element.borderColor;
    if(element.borderWidth) ctx.lineWidth = element.borderWidth;

    //start near top left (after top left curve) and move clockwise
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arc(x + width - radius, y + radius, radius, 1.5 * Math.PI, 2 * Math.PI);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arc(x + width - radius, y + height - radius, radius, 0, .5 * Math.PI);
    ctx.lineTo(x + radius, y + height);
    ctx.arc(x + radius, y  + height - radius, radius, .5 * Math.PI, Math.PI);
    ctx.lineTo(x, y + radius);
    ctx.arc(x + radius, y + radius, radius, Math.PI, 1.5 * Math.PI);

    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

function pasteTextbox(ctx, element) {

    // scale to video size
    const x = element.x * VID_WIDTH;
    const y = element.y * VID_HEIGHT;
    const width = element.width * VID_WIDTH;
    const height = element.height * VID_HEIGHT;

    if(!(element.fillColor || element.borderColor)) {
        return [x, y, width, height];
    }
    
    
    if(element.rounded && element.arcRadius > 0) {                          // textbox - rounded rectangle
        roundedBox(ctx, element, x, y, width, height, element.arcRadius);
    } else {                                                                // textbox - rectangle
        ctx.save();
        if(element.fillColor) ctx.fillStyle = element.fillColor;
        if(element.borderColor) ctx.strokeStyle = element.borderColor;
        if(element.borderWidth) ctx.lineWidth = element.borderWidth;
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
        ctx.restore();
    }

    return [x, y, width, height];
}

function writeText(ctx, element, boxX, boxY, boxWidth, boxHeight) {

    // iterate thru lines
    for(let i = 0; i < element.lines.length; i++) {

        const line = element.lines[i];

        // style text here
        ctx.save();
        ctx.fillStyle = line.color;

        // text border
        if(line.borderColor) {
            ctx.strokeStyle = line.borderColor;
            if(line.borderWidth) {
                ctx.lineWidth = line.borderWidth;
            }
        }

        // set up font
        let fontFamily = "serif";
        if(line.font) {
            fontFamily = line.font.slice(0, -4);            // truncate .ttf or .otf
        }
        let fontSize = line.maxSize + 1;                    // start at +1 so the do while loop works

        let text = line.text;
        let textSize;

        const marginLeft = line.marginLeft * boxWidth;
        const marginRight = line.marginRight * boxWidth;
        const maxWidth = boxWidth - marginLeft - marginRight;

        // shrink text to fit until line.minSize
        do {
            fontSize--;
            ctx.font = String(fontSize) + "px " + fontFamily;
            textSize = ctx.measureText(text);
        } while(textSize.width > maxWidth && fontSize > line.minSize);

        // if text is at line.minSize and still doesn't fit, truncate and end with '...'
        if(textSize.width > maxWidth) {
            while(textSize.width > maxWidth) {
                text = text.slice(0, -1);
                textSize = ctx.measureText(text);
            }
            text = text.slice(0, -3);
            text = text + '...';
        }


        // note: x and y are BOTTOM LEFT of the text!
        let x, y;

        if(line.x) {
            // x value scales with box size
            x = boxX + line.x * boxWidth;
        } else {
            // x value is dependent on alignment
            switch(line.alignment) {
                case "right":
                    x = boxX + boxWidth - marginRight;
                    break;
                case "center":
                    x = ((boxX + marginLeft) + (boxX + boxWidth - marginRight)) / 2;
                    break;
                default:                                // defaults to left-alignment
                    x = boxX + marginLeft;
                    break;
            }
        }
        if(line.alignment) ctx.textAlign = line.alignment;

        // y
        const textHeight = textSize.actualBoundingBoxAscent + textSize.actualBoundingBoxDescent;
        let offset = 0;
        if(element.vertOffset) offset = element.vertOffset * boxHeight;
        if(line.y) {
            // y value scales with box size
            y = boxY + line.y * boxHeight + offset;
        } else {
            // y value scales with heigh & number of lines
            y = boxY + boxHeight * ((i + 1) / (element.lines.length + 1)) + (textHeight / 2) + offset;
        }

        ctx.fillText(text, x, y);
        if(line.borderColor) {
            ctx.strokeText(text, x, y);
        }
        
        ctx.restore();
    }
}

/* 1. Make textbox
 * 2. Write text
 */
async function pasteText(ctx, element) {

    const[x, y, width, height] = pasteTextbox(ctx, element);

    writeText(ctx, element, x, y, width, height);
}

//note: coords and size are of the portion (column) of the textbox NOT used by text
async function pasteIcons(ctx, element, colX, colY, colWidth, colHeight) {
    const imagePromises = [];

    // iterate thru icons
    for(let i = 0; i < element.icons.length; i++) {
        const icon = element.icons[i]

        // icon width in px (scales to the size of the icon column of the textbox)
        const width = icon.width * colWidth;

        // note: we're assuming square icons. might have to change this later
        const height = width

        let x, y;
        if(icon.x) {
            // x coord scales with icon column width
            x = colX + icon.x * colWidth;
        }else {
            // center x coord between divide and textbox side
            x = colX + colWidth / 2 - width / 2
        }

        if(icon.y) {
            // y coord scales with textbox height
            y = colY + icon.y * colHeight;
        }else {
            //handle y coord like text lines
            y = colY + colHeight * (i + 1) / (element.icons.length + 1) - (height / 2);
        }

        imagePromises.push(pasteImage(ctx, icon.path, x, y, width, icon.opacity));
    }

    Promise.all(imagePromises).then(() => {
        return;
    }).catch((err) => {
        throw err;
    })

}

/* 1. Make textbox
 * 2. Write text on one side of divide
 * 3. Paste image centered on other side of divide (don't use pasteImage)
 * divide = % of textbox width (i.e. 0.5 would be a line in the middle)
 */
async function pasteHybrid(ctx, element) {
    /* the vars in this are confusing
     * x - x coord of the whole textbox
     * textX - x coord of text section of textbox
     * iconBoxX - x coord of icon section of textbox
     * 
     * width - whole textbox width
     * textWidth - width of text section of textbox (NOT width of text)
     * iconBoxWidth - width of the icon section of the textbox
     */

    const [x, y, width, height] = pasteTextbox(ctx, element);

    let textX, textWidth, iconBoxX, iconBoxWidth;
    if(element.divide > 0) {                // + divide -> | text | icons |
        textX = x;
        textWidth = width * element.divide;
        iconBoxX = x + textWidth;
        iconBoxWidth = width - textWidth;
    } else if(element.divide < 0) {         // - divide ->  |icons | text |
        iconBoxX = x;
        iconBoxWidth = width * (-1) * element.divide;
        textX = x + iconBoxWidth;
        textWidth = width - iconBoxWidth;
    } else {                                // divide == 0 -> | welcome to the thunderdome |
        textX = x;
        textWidth = width;
        iconBoxX = x;
        iconBoxWidth = width;
    }

    writeText(ctx, element, textX, y, textWidth, height);

    pasteIcons(ctx, element, iconBoxX, y, iconBoxWidth, height);
}

async function saveFile(canvas, outputPath){
    return new Promise((resolve,reject) => {
        try {
            var out = fs.createWriteStream(outputPath);
            var stream = canvas.pngStream();
    
            stream.on('data', chunk => {
                out.write(chunk);
            });
            stream.on('end', resolve);
        } catch(err) {
            reject(err)
        }
    })
}

async function generateOverlay(elements, outputPath) {

    // register fonts
    for(let i = 0; i < elements.length; i++) {
        switch(elements[i].type) {
            case "text":
            case "hybrid":
                for(let j = 0; j < elements[i].lines.length; j++) {
                    let font = elements[i].lines[j].font;
                    if(font) {
                        try {
                            let family = font.slice(0, -4);             // truncate .ttf or .otf
                            registerFont(font, { family: family });
                        } catch(err) {
                            throw err;
                        }
                    }
                }
        }
    }
    const overlay = createCanvas(VID_WIDTH, VID_HEIGHT);
    const ctx = overlay.getContext('2d');

    // paste each element on the overlay
    await asyncForEach(elements, async (element) => {
        switch(element.type){
            case "img":
                await handleImage(ctx, element);
                break;
            case "text":
                await pasteText(ctx, element);
                break;
            case "hybrid":
                await pasteHybrid(ctx, element);
                break;
            default:
                throw "Invalid overlay element type. Please specify either img, text, or hybrid."
        }
    });

    // write to file 
    try {
        await saveFile(overlay, outputPath);
        return "File successfully saved";
    } catch(err) {
        throw err
    }
}

function testOverlay(testPath, outputPath) {
    const elements = JSON.parse(fs.readFileSync(testPath));
    generateOverlay(elements, outputPath).then((message) => {
        console.log(message);
    }).catch((err) => {
        console.log(err);
    });
}

module.exports = { generateOverlay }