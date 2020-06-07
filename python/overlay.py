import argparse
from PIL import Image, ImageOps, ImageDraw, ImageFont

# the actual margins will be the height of the image / MARGIN_SCALE_FACTOR
MARGIN_SCALE = 40
ICON_SCALE = 2          # icons at half size
DEFAULT_FONT_SIZE = 32  # max size, will resize to lower size if name is too long
MIN_FONT_SIZE = 20
DEFAULT_LOGO_OPACITY = 100

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

# set font size so the name can fit in the textbox
# if the font size is below MIN_FONT_SIZE, the name trimmed and end in an ellipsis
def adjustName(draw, name, fontPath, tbWidth, iconWidth):
    width = 999999
    fontSize = DEFAULT_FONT_SIZE + 1
    leftMargin = 10     # 10 px between edge of textbox and start of text
    rightMargin = 10    # 10 px between edge of textbox and edge of icon
    iconMargin = 2      # min 2 px between end of text and icon
    maxTextWidth = tbWidth - (leftMargin + rightMargin + iconMargin + iconWidth)

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

def pasteNames(image, name1, name2, fontPath, tbCoords, tbSize, iconWidth):
    # Drawing context
    draw = ImageDraw.Draw(image)

    # Get font and trim names
    trimmedName1, fontSize1 = adjustName(draw, name1, fontPath, tbSize[0], iconWidth)
    font1 = ImageFont.truetype(fontPath, fontSize1)
    trimmedName2, fontSize2 = adjustName(draw, name2, fontPath, tbSize[0], iconWidth)
    font2 = ImageFont.truetype(fontPath, fontSize2)

    # Text heights
    tHeight1 = draw.textsize(name1, font = font1)[1]
    tHeight2 = draw.textsize(name2, font = font2)[1]

    # Middle of name1 is 1/3 down textbox
    position = (tbCoords[0] + 10, tbCoords[1] + tbSize[1]/3 - tHeight1 / 2)
    draw.text(position, trimmedName1, font=font1, fill=(220,220,220,255))

    # Middle of name2 is 2/3 down
    position = (position[0], tbCoords[1] + tbSize[1] * 2/3 - tHeight2 / 2)
    draw.text(position, trimmedName2, font=font2, fill=(220,220,220,255))
    
def pasteIcons(image, icon1, icon2, tbCoords, tbSize):

    icon1 = icon1.resize((int(icon1.width / ICON_SCALE), int(icon1.height / ICON_SCALE)))
    icon2 = icon2.resize((int(icon2.width / ICON_SCALE), int(icon2.height / ICON_SCALE)))

    # Icon height
    iHeight = icon1.height
    iWidth = icon1.width

    # Middle of name1 is 1/3 down textbox
    position = ((int)(tbCoords[0] + tbSize[0] - 10 - iWidth), (int)(tbCoords[1] + tbSize[1]/3 - iHeight/2))
    image.paste(icon1, position, icon1)

    # Middle of name2 is 2/3 down
    position = (position[0], int(position[1] + tbSize[1]/3))
    image.paste(icon2, position, icon2)

    return iWidth

def pasteInfo(image, tournament, date, fontPath, tbCoords, tbSize):
    font = ImageFont.truetype(fontPath, 32)

    draw = ImageDraw.Draw(image)

    # Tournament
    if tournament is not None:
        tournSize = draw.textsize(tournament, font=font)
        x = tbCoords[0] + tbSize[0]/2 - tournSize[0]/2
        y = tbCoords[1] + tbSize[1]/3 - tournSize[1]/2
        draw.text((x,y), tournament, font=font, fill=(220, 220, 220, 255))

    # Date
    if date is not None:
        dateSize = draw.textsize(date, font=font)
        x = tbCoords[0] + tbSize[0]/2 - dateSize[0]/2
        y = tbCoords[1] + tbSize[1]*2/3 - dateSize[1]/2
        draw.text((x,y), date, font=font, fill=(220, 220, 220, 255))

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
    parser.add_argument("--name1", default=None)
    parser.add_argument("--name2", default=None)
    parser.add_argument("--tournament", default=None)
    parser.add_argument("--date", default=None)
    parser.add_argument("--margin", default=MARGIN_SCALE)
    parser.add_argument("--opacity", default=DEFAULT_LOGO_OPACITY)
    parser.add_argument("--logoPath", default=None)
    parser.add_argument("--fontPath", default="./fonts/LiberationSans-Regular.ttf")
    parser.add_argument("--devText", default=None, help="Strings to display on top right, delimited by ;")

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

    # textbox (bottom left)
    # TODO make in pillow
    if (args.name1 is not None) and (args.name2 is not None):
        textbox = Image.open("./images/overlay/textbox.png")
        coords = (int(margins), int(int(args.overlayHeight) - margins - textbox.height))
        pasteTextbox(image, textbox.copy(), coords)

        # I change the file name strings so they start with . instead of ..
        icon1 = Image.open(args.icon1[1:])
        icon2 = Image.open(args.icon2[1:])
        # icons
        iconWidth = pasteIcons(image, icon1, icon2, coords, (textbox.width, textbox.height))

        # names (in text box)
        pasteNames(image, args.name1, args.name2, args.fontPath, coords, (textbox.width, textbox.height), iconWidth)

        

    # another textbox (bottom right) + tournament data
    if (tournament is not None) and (args.date is not None):
        coords = (int(int(args.overlayWidth) - margins - textbox.width), int(int(args.overlayHeight) - margins - textbox.height))
        pasteTextbox(image, textbox.copy(), coords)
        pasteInfo(image, tournament, args.date, args.fontPath, coords, (textbox.width, textbox.height))

    # logo
    if logo is not None:
        logoCoords = (int(margins), int(margins))
        pasteLogo(image, logo, logoCoords, args.opacity)

    if args.devText is not None:
        pasteDevText(image, args.devText, args.fontPath, margins)

    image.save(args.outputPath)
    image.close()

if __name__ == '__main__':
    main()