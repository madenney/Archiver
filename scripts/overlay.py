import argparse
from PIL import Image, ImageOps, ImageDraw, ImageFont

MARGIN_SCALE = 40                   # vid height / this = px margins between elements and edge of video
ICON_SCALE = 25                     # icons at 25% textbox height
DEFAULT_FONT_SIZE = 32              # max size, will resize to a lower size if name is too long
MIN_FONT_SIZE = 20
DEFAULT_LOGO_OPACITY = 50
DEFAULT_TEXTBOX_OPACITY = 100
DEFAULT_TEXT_OPACITY = 100
DEFAULT_ICON_OPACITY = 100
VERTICAL_TEXTBOX_MARGIN_SCALE = 30  # % of textbox between name lines and vertical edges
HORIZONTAL_TEXTBOX_MARGIN = 10      # px between max size names/icons, & horizontal edges
ICON_MARGIN = 2                     # min 2 px between end of text and icon


def translucify(image, opacity):

    translucified = Image.new("RGBA", (image.width, image.height), color=(0,0,0,0))
    mask = image.split()[3].point(lambda i: i * opacity / 100)
    translucified.paste(image, (0,0), mask=mask)
    return translucified


def createTextbox(opacity):
    return (translucify(Image.open("./images/overlay/textbox.png"), opacity))

def pasteTextbox(image, textbox, coords):

    image.paste(textbox, coords, mask=textbox)

def pasteLogo(image, logo, coords, opacity):
    logo = logo.resize((250,250))

    # translucify (more direct to use this than the function)
    mask = logo.split()[3].point(lambda i: i * opacity / 100)

    image.paste(logo, coords, mask=mask)

# set font size so the name can fit in the textbox (until MIN_FONT_SIZE)
# if the text width is still too large, the name trimmed and end in an ellipsis
def adjustName(draw, name, fontPath, maxTextWidth):
    width = maxTextWidth + 1
    fontSize = DEFAULT_FONT_SIZE + 1

    while((width > maxTextWidth) and (fontSize > MIN_FONT_SIZE)):
        fontSize -= 1
        font = ImageFont.truetype(fontPath, fontSize)
        width = draw.textsize(name, font=font)[0]
    
    # trim text if we've hit MIN_FONT_SIZE and it's STILL too long
    if(width > maxTextWidth):
        ellipsisWidth = draw.textsize('...', font=font)[0]
        maxTextWidth -= ellipsisWidth
        while(width > maxTextWidth):
            name = name[:-1]
            width = draw.textsize(name, font=font)[0]
        name += '...'

    return name, fontSize

def pasteNames(textbox, name1, name2, fontPath, iconWidth, center, textOpacity):
    # Drawing context
    draw = ImageDraw.Draw(textbox)

    # constants
    maxTextWidth = textbox.width - (2 * HORIZONTAL_TEXTBOX_MARGIN + ICON_MARGIN + iconWidth)
    alpha = int(255 * textOpacity / 100)

    # Get font and trim names
    trimmedName1, fontSize1 = adjustName(draw, name1, fontPath, maxTextWidth)
    font1 = ImageFont.truetype(fontPath, fontSize1)
    trimmedName2, fontSize2 = adjustName(draw, name2, fontPath, maxTextWidth)
    font2 = ImageFont.truetype(fontPath, fontSize2)

    # Text widths [0] and heights [1]
    tSize1 = draw.textsize(trimmedName1, font = font1)
    tSize2 = draw.textsize(trimmedName2, font = font2)

    # Middle of name1 is 1/3 down textbox
    x = HORIZONTAL_TEXTBOX_MARGIN
    if(center): x += (maxTextWidth - tSize1[0]) / 2
    y = int(textbox.height * VERTICAL_TEXTBOX_MARGIN_SCALE / 100 - tSize1[1] / 2)
    draw.text((x, y), trimmedName1, font=font1, fill=(220,220,220,alpha))

    # Middle of name2 is 2/3 down
    if(center): x = HORIZONTAL_TEXTBOX_MARGIN + (maxTextWidth - tSize2[0]) / 2
    y = int(textbox.height * (100 - VERTICAL_TEXTBOX_MARGIN_SCALE) / 100 - tSize2[1] / 2)
    draw.text((x, y), trimmedName2, font=font2, fill=(220,220,220,alpha))
    
def pasteIcons(textbox, icon1, icon2, iconOpacity):

    # Resize
    iconSize = int(textbox.height * ICON_SCALE / 100)               # square images so width == height

    icon1 = icon1.resize((iconSize, iconSize))
    icon2 = icon2.resize((iconSize, iconSize))

    # Translucify
    icon1 = translucify(icon1, iconOpacity)
    icon2 = translucify(icon2, iconOpacity)

    # Icon height
    iHeight = icon1.height
    iWidth = icon1.width

    # Middle of name1 is 1/3 down textbox
    x = int(textbox.width - HORIZONTAL_TEXTBOX_MARGIN - int(iWidth))
    y = int(textbox.height * VERTICAL_TEXTBOX_MARGIN_SCALE / 100 - int(iHeight) / 2)
    textbox.paste(icon1, (x, y), icon1)

    # Middle of name2 is 2/3 down
    x = int(textbox.width - HORIZONTAL_TEXTBOX_MARGIN - int(iWidth))
    y = int(textbox.height * (100 - VERTICAL_TEXTBOX_MARGIN_SCALE) / 100 - int(iHeight) / 2)
    textbox.paste(icon2, ((int)(x), (int)(y)), icon2)

    return iWidth

def pasteInfo(textbox, tournament, date, time, fontPath, textOpacity):
    font = ImageFont.truetype(fontPath, 32)

    draw = ImageDraw.Draw(textbox)

    # Alpha values
    alpha = int(255 * textOpacity / 100)

    scale = 1                       # determines how the lines are spaced out
    index = 1                       # determines which line each item is placed
    if date is not None: scale += 1
    if time is not None: scale += 1

    # I would make this a for loop, but I'm keeping it like this in case I make some changes
    # to individual items (i.e. if tournament names are different colors than dates)

    # Tournament
    if tournament is not None:
        scale += 1
        textSize = draw.textsize(tournament, font=font)
        x = int(textbox.width / 2 - textSize[0] / 2)
        y = int(textbox.height * index / scale - textSize[1] / 2)
        draw.text((x,y), tournament, font=font, fill=(220, 220, 220, alpha))
        index += 1

    # Date
    if date is not None:
        textSize = draw.textsize(date, font=font)
        x = int(textbox.width / 2 - textSize[0] / 2)
        y = int(textbox.height * index / scale - textSize[1] / 2)
        draw.text((x,y), date, font=font, fill=(220, 220, 220, alpha))
        index += 1

    # Time
    if time is not None:
        textSize = draw.textsize(time, font=font)
        x = int(textbox.width / 2 - textSize[0] / 2)
        y = int(textbox.height * index / scale - textSize[1] / 2)
        draw.text((x,y), time, font=font, fill=(220, 220, 220, alpha))

def pasteDevText(image, text, fontPath, margins):
    lines = text.split(";")
    font = ImageFont.truetype(fontPath, 40)
    y = margins
    draw = ImageDraw.Draw(image)
    for line in lines:
        lineWidth = draw.textsize(line, font=font)[0]
        x = image.width - margins - lineWidth
        draw.text((x,y), line, font=font, fill=(255,255,255,255))
        y += (draw.textsize(line, font=font)[1] + margins/2)


def main():

    # python3 -m pip install pillow --upgrade

    print("Hello World :)")
    parser = argparse.ArgumentParser(description="Generate overlay for a Melee combo video")

    parser.add_argument("--text")
    parser.add_argument("--outputPath")

    args = parser.parse_args()
    
    # New transparent image
    image = Image.new("RGBA", (5632, 3168), color=(0,0,0,0))
    font = ImageFont.truetype("/home/matt/Projects/Archiver/assets/cour_bold.ttf", 100)
    draw = ImageDraw.Draw(image)

    xRatio = 1920/5632
    yRatio = 1080/3168

    # get text size
    td = font.getbbox(args.text)
    print(td)
    text_width = td[2]-td[0]
    text_height = (td[3]-td[1]) * 1.75
    x1 = 30
    y1 = 3020
    x2 = 30 + text_width
    y2 = 3020 + text_height
    # Draw a rounded rectangle
    draw.rounded_rectangle([(x1, y1), (x2 + 60, y2 )], fill="#202020", radius=15)
    draw.text((x1 + 30, y1+30), args.text, font=font)


    # create image with correct size and black background
    #rectangle_img = Image.new('RGBA', rectangle_size, "black")

    # put text on rectangle with 10px margins
    #rectangle_draw = ImageDraw.Draw(rectangle_img)
    #rectangle_draw.text((10, 5), args.text, font=font)

    # put rectangle on source image in position (0, 0)
    #image.paste(rectangle_img, (50, 50))

    image.save(args.outputPath)
    image.close()

    print("DONE")
    return 0
    # Positional args
    parser.add_argument("outputPath")
    parser.add_argument("overlayWidth", type=int)
    parser.add_argument("overlayHeight", type=int)
    
    
    # Optional args
    # strings
    parser.add_argument("--icon1", default=None)
    parser.add_argument("--icon2", default=None)
    parser.add_argument("--name1", default=None)
    parser.add_argument("--name2", default=None)
    parser.add_argument("--tournament", default=None)
    parser.add_argument("--date", default=None)
    parser.add_argument("--time", default=None)
    parser.add_argument("--devText", default=None, help="Strings to display on top right, delimited by ;")

    # values
    parser.add_argument("--margin", type=int, default=MARGIN_SCALE)
    parser.add_argument("--logoOpacity", type=int, default=DEFAULT_LOGO_OPACITY)
    parser.add_argument("--textboxOpacity", type=int, default=DEFAULT_TEXTBOX_OPACITY)
    parser.add_argument("--iconOpacity", type=int, default=DEFAULT_ICON_OPACITY)
    parser.add_argument("--textOpacity", type=int, default=DEFAULT_TEXT_OPACITY)

    # paths
    parser.add_argument("--logoPath", default=None)
    parser.add_argument("--fontPath", default="./fonts/LiberationSans-Regular.ttf")

    # toggles
    parser.add_argument("--centerNames", default=True, type=bool, 
                            help="Center player names to the left of character icons, or keep them left aligned")

    args = parser.parse_args()

    logo = None

    if args.logoPath is not None:
        try:
            logo = Image.open(args.logoPath)
        except IOError:
            logo = None

    # New transparent image
    image = Image.new("RGBA", (int(args.overlayWidth), int(args.overlayHeight)), color=(0,0,0,0))

    # Number of pixels for margins
    margins = int(int(args.overlayHeight) / int(args.margin))

    # textbox (bottom left) + names + icons
    if (args.name1 is not None) and (args.name2 is not None) and (args.icon1 is not None) and (args.icon2 is not None):

        # Initialize textbox
        leftTextbox = createTextbox(args.textboxOpacity)

        # Left textbox coordinates
        textboxCoords = (margins, args.overlayHeight - margins - leftTextbox.height)

        # I change the file name strings so they start with . instead of ..
        icon1 = Image.open(args.icon1[1:])
        icon2 = Image.open(args.icon2[1:])
        iconWidth = pasteIcons(leftTextbox, icon1, icon2, args.iconOpacity)

        # names (in text box)
        pasteNames(leftTextbox, args.name1, args.name2, args.fontPath, iconWidth, args.centerNames, args.textOpacity)

        pasteTextbox(image, leftTextbox, textboxCoords)

    # another textbox (bottom right) + tournament data + time
    if (args.tournament is not None) or (args.date is not None) or (args.time is not None):

        # Initialize textbox
        rightTextbox = createTextbox(args.textboxOpacity)

        # Right textbox coordinates
        textboxCoords = (int(args.overlayWidth) - margins - rightTextbox.width, 
                            int(args.overlayHeight) - margins - rightTextbox.height)

        # Info (tournament, date, time)
        pasteInfo(rightTextbox, args.tournament, args.date, args.time, args.fontPath, args.textOpacity)

        pasteTextbox(image, rightTextbox, textboxCoords)

    # logo
    if logo is not None:
        logoCoords = (margins, margins)
        pasteLogo(image, logo, logoCoords, int(args.logoOpacity))

    if args.devText is not None:
        pasteDevText(image, args.devText, args.fontPath, margins)

    image.save(args.outputPath)
    image.close()

if __name__ == '__main__':
    main()