import argparse
from PIL import Image, ImageOps, ImageDraw, ImageFont

MARGIN_SCALE = 40                   # vid height / this = px margins between elements and edge of video
ICON_SCALE = 50                     # icons at 50% size
DEFAULT_FONT_SIZE = 32              # max size, will resize to a lower size if name is too long
MIN_FONT_SIZE = 20
DEFAULT_LOGO_OPACITY = 100
VERTICAL_TEXTBOX_MARGIN_SCALE = 30  # % of textbox between name lines and vertical edges
HORIZONTAL_TEXTBOX_MARGIN = 10      # px between max size names/icons, & horizontal edges
ICON_MARGIN = 2                     # min 2 px between end of text and icon

# TODO
def roundedBox(width, height, border, fill):
    return

def pasteTextbox(image, textbox, coords):
    image.paste(textbox, coords, textbox)

def pasteLogo(image, logo, coords, opacity):
    logo = logo.resize((250,250))

    # change alpha levels and use it as a mask
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

def pasteNames(image, name1, name2, fontPath, tbCoords, tbSize, iconWidth, center):
    # Drawing context
    draw = ImageDraw.Draw(image)

    # constants
    maxTextWidth = tbSize[0] - (2 * HORIZONTAL_TEXTBOX_MARGIN + ICON_MARGIN + iconWidth)

    # Get font and trim names
    trimmedName1, fontSize1 = adjustName(draw, name1, fontPath, maxTextWidth)
    font1 = ImageFont.truetype(fontPath, fontSize1)
    trimmedName2, fontSize2 = adjustName(draw, name2, fontPath, maxTextWidth)
    font2 = ImageFont.truetype(fontPath, fontSize2)

    # Text widths [0] and heights [1]
    tSize1 = draw.textsize(trimmedName1, font = font1)
    tSize2 = draw.textsize(trimmedName2, font = font2)

    # Middle of name1 is 1/3 down textbox
    x = tbCoords[0] + HORIZONTAL_TEXTBOX_MARGIN
    if(center): x += (maxTextWidth - tSize1[0]) / 2
    y = tbCoords[1] + tbSize[1] * VERTICAL_TEXTBOX_MARGIN_SCALE / 100 - tSize1[1] / 2
    draw.text((x, y), trimmedName1, font=font1, fill=(220,220,220,255))

    # Middle of name2 is 2/3 down
    if(center): x = tbCoords[0] + HORIZONTAL_TEXTBOX_MARGIN + (maxTextWidth - tSize2[0]) / 2
    y = tbCoords[1] + tbSize[1] * (100 - VERTICAL_TEXTBOX_MARGIN_SCALE) / 100 - tSize2[1] / 2
    draw.text((x, y), trimmedName2, font=font2, fill=(220,220,220,255))
    
def pasteIcons(image, icon1, icon2, tbCoords, tbSize):

    icon1 = icon1.resize((int(icon1.width * ICON_SCALE / 100), int(icon1.height * ICON_SCALE / 100)))
    icon2 = icon2.resize((int(icon2.width * ICON_SCALE / 100), int(icon2.height * ICON_SCALE / 100)))

    # Icon height
    iHeight = icon1.height
    iWidth = icon1.width

    # Middle of name1 is 1/3 down textbox
    x = tbCoords[0] + tbSize[0] - HORIZONTAL_TEXTBOX_MARGIN - (int)(iWidth)
    y = tbCoords[1] + tbSize[1] * VERTICAL_TEXTBOX_MARGIN_SCALE / 100 - (int)(iHeight) / 2
    image.paste(icon1, ((int)(x), (int)(y)), icon1)

    # Middle of name2 is 2/3 down
    x = tbCoords[0] + tbSize[0] - HORIZONTAL_TEXTBOX_MARGIN - (int)(iWidth)
    y = tbCoords[1] + tbSize[1] * (100 - VERTICAL_TEXTBOX_MARGIN_SCALE) / 100 - (int)(iHeight) / 2
    image.paste(icon2, ((int)(x), (int)(y)), icon2)

    return iWidth

# format: YYYY-MM-DDTHH:MM:SSZ
# T and Z are literally just the letters, everything else is year, minute, etc.
def parseTimestamp(timestamp):
    date, time = timestamp.split('T')
    # TODO make options for standard and military time formats
    time = time[:-1]

    # TODO make options for NA and EU date formats
    # NA date conversion
    year, month, day = date.split('-')
    date = day + '/' + month + '/' + year
    return date, time

def pasteInfo(image, tournament, timestamp, fontPath, tbCoords, tbSize):
    font = ImageFont.truetype(fontPath, 32)

    draw = ImageDraw.Draw(image)

    scale = 1 # determines how the lines are spaced out
    if timestamp is not None: scale += 2

    # Tournament
    if tournament is not None:
        scale += 1
        size = draw.textsize(tournament, font=font)
        x = tbCoords[0] + tbSize[0]/2 - size[0]/2
        y = tbCoords[1] + tbSize[1]/scale - size[1]/2
        draw.text((x,y), tournament, font=font, fill=(220, 220, 220, 255))

    # timestamp
    if timestamp is not None:
        date, time = parseTimestamp(timestamp)

        # date
        size = draw.textsize(date, font=font)
        x = tbCoords[0] + tbSize[0]/2 - size[0]/2
        y = tbCoords[1] + tbSize[1]*(scale-2)/scale - size[1]/2
        draw.text((x,y), date, font=font, fill=(220, 220, 220, 255))

        size = draw.textsize(time, font=font)
        x = tbCoords[0] + tbSize[0]/2 - size[0]/2
        y = tbCoords[1] + tbSize[1]*(scale-1)/scale - size[1]/2
        draw.text((x,y), time, font=font, fill=(220, 220, 220, 255))

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
    parser = argparse.ArgumentParser(description="Generate overlay for a Melee combo video")

    # Positional args
    parser.add_argument("outputPath")
    parser.add_argument("icon1")
    parser.add_argument("icon2")
    parser.add_argument("overlayWidth")
    parser.add_argument("overlayHeight")
    
    
    # Optional args
    # strings
    parser.add_argument("--name1", default=None)
    parser.add_argument("--name2", default=None)
    parser.add_argument("--tournament", default=None)
    parser.add_argument("--timestamp", default=None)
    parser.add_argument("--devText", default=None, help="Strings to display on top right, delimited by ;")

    # values
    parser.add_argument("--margin", default=MARGIN_SCALE)
    parser.add_argument("--opacity", default=DEFAULT_LOGO_OPACITY)

    # paths
    parser.add_argument("--logoPath", default=None)
    parser.add_argument("--fontPath", default="./fonts/LiberationSans-Regular.ttf")

    # toggles
    parser.add_argument("--centerNames", default=True, 
                            help="Center player names to the left of character icons, or keep them left aligned")

    args = parser.parse_args()

    tournament = args.tournament
    logo = None

    if args.logoPath is not None:
        try:
            logo = Image.open(args.logoPath)
        except IOError:
            logo = None

    '''
    # Probably not going to use this in the future; instead will just take logoPath as an arg
    # TODO fix this and use a logo constants file
    if tournament is not None:
        # remove nums from a tournament to try to find the series
        tournamentSeries = tournament(''.join([c for c in tournament if not c.isdigit()]))
        # remove trailing whitespace
        tournamentSeries = tournamentSeries.trim()
        try:
            logo = Image.open(args.logoFolder + tournamentSeries + ".png")
        except IOError:
            logo = None
    '''

    # New transparent image
    image = Image.new("RGBA", (int(args.overlayWidth), int(args.overlayHeight)), color=(0,0,0,0))

    # Margins
    margins = int(args.overlayHeight) / int(args.margin)

    # Initialize textbox
    textbox = Image.open("./images/overlay/textbox.png")

    # textbox (bottom left)
    # TODO make in pillow
    if (args.name1 is not None) and (args.name2 is not None):
        coords = (int(margins), int(int(args.overlayHeight) - margins - textbox.height))
        pasteTextbox(image, textbox.copy(), coords)

        # I change the file name strings so they start with . instead of ..
        icon1 = Image.open(args.icon1[1:])
        icon2 = Image.open(args.icon2[1:])
        # icons
        iconWidth = pasteIcons(image, icon1, icon2, coords, (textbox.width, textbox.height))

        # names (in text box)
        pasteNames(image, args.name1, args.name2, args.fontPath, coords, (textbox.width, textbox.height), iconWidth, args.centerNames)

        

    # another textbox (bottom right) + tournament data
    if (tournament is not None) or (args.timestamp is not None):
        coords = (int(int(args.overlayWidth) - margins - textbox.width), int(int(args.overlayHeight) - margins - textbox.height))
        pasteTextbox(image, textbox.copy(), coords)
        pasteInfo(image, tournament, args.timestamp, args.fontPath, coords, (textbox.width, textbox.height))

    # logo
    if logo is not None:
        logoCoords = (int(margins), int(margins))
        pasteLogo(image, logo, logoCoords, int(args.opacity))

    if args.devText is not None:
        pasteDevText(image, args.devText, args.fontPath, margins)

    image.save(args.outputPath)
    image.close()

if __name__ == '__main__':
    main()