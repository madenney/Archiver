import argparse
from PIL import Image, ImageOps, ImageDraw, ImageFont

# the actual margins will be the height of the image / MARGIN_SCALE_FACTOR
MARGIN_SCALE_FACTOR = 40

# TODO
def roundedBox(width, height, border, fill):
    return

def pasteTextbox(image, textbox, bl=False, br=False, tl=False, tr=False):
    # Probably won't need the widths
    W = image.width
    H = image.height
    w = textbox.width
    h = textbox.height

    # Pixels between edges of the textbox and the edges of the overlay
    margins = (int)(H / MARGIN_SCALE_FACTOR)

    # Determine where the box(es) go
    coordsList = []
    
    # TODO there's a better way to do this but I'm lazy
    if bl == True:
        coordsList.append((margins, (int)(H - margins - h)))
    if br == True:
        coordsList.append(((int)(W - margins - w), (int)(H - margins - h)))
    if tl == True:
        coordsList.append((margins, margins))
    if tr == True:
        coordsList.append(((int)(W - margins - w), margins))
    
    for coords in coordsList:
        tbcp = textbox.copy()
        image.paste(textbox, coords, tbcp)
    return coordsList

# TODO fix this
def pasteLogo(image, logo):
    # Probably won't need image.width
    W = image.width
    H = image.height

    # You know the drill
    margins = H / MARGIN_SCALE_FACTOR

    logo.resize((300, 300))
    w = logo.width
    h = logo.height

    image.paste(logo, ((int)(W - margins - w), (int)(H - margins - h)), logo)

def pasteNames(image, name1, name2, fontPath, tbCoords, tbSize):
    # Get font
    font = ImageFont.truetype(fontPath, 32)

    # Drawing context
    draw = ImageDraw.Draw(image)

    # Text height
    tHeight = draw.textsize(name1, font = font)[1]

    # Middle of name1 is 1/3 down textbox
    position = (tbCoords[0] + 10, tbCoords[1] + tbSize[1]/3 - tHeight/2)
    draw.text(position, name1, font=font, fill =(220,220,220,255))

    # Middle of name2 is 2/3 down
    position = (position[0], position[1] + tbSize[1]/3)
    draw.text(position, name2, font=font, fill =(220,220,220,255))
    
def pasteIcons(image, icon1, icon2, tbCoords, tbSize):

    icon1 = icon1.resize((int(icon1.width * 2 / 3), int(icon1.height * 2 / 3)))
    icon2 = icon2.resize((int(icon2.width * 2 / 3), int(icon2.height * 2 / 3)))

    # Icon height
    iHeight = icon1.height
    iWidth = icon1.width

    # Middle of name1 is 1/3 down textbox
    position = ((int)(tbCoords[0] + tbSize[0] - 10 - iWidth), (int)(tbCoords[1] + tbSize[1]/3 - iHeight/2))
    image.paste(icon1, position, icon1)

    # Middle of name2 is 2/3 down
    position = (position[0], int(position[1] + tbSize[1]/3))
    image.paste(icon2, position, icon2)

def main():
    parser = argparse.ArgumentParser(description="Generate overlay for a Melee combo video")

    # Positional args
    parser.add_argument("outputPath")
    parser.add_argument("name1")
    parser.add_argument("name2")
    parser.add_argument("icon1")
    parser.add_argument("icon2")
    parser.add_argument("overlayWidth")
    parser.add_argument("overlayLength")
    #parser.add_argument("tournament")
    #parser.add_argument("date")
    
    
    # Optional args
    parser.add_argument("--margin", default=MARGIN_SCALE_FACTOR, help="Margin scale factor." + 
                                                                      "Actual margin (in px) = overlay height / this.")
    parser.add_argument("--fontPath", default="./fonts/LiberationSans-Regular.ttf")

    args = parser.parse_args()

    # New transparent image
    image = Image.new("RGBA", (int(args.overlayWidth), int(args.overlayLength)), color=(0,0,0,0))

    # textbox (bottom left)
    # TODO make in pillow
    textbox = Image.open("./images/overlay/textbox.png")
    tbSize = (textbox.width, textbox.height)
    tbCoordsList = pasteTextbox(image, textbox, bl = True, br = True)

    # logo (bottom right)
    #logo = Image.open("./images/overlay/logo.png")
    #pasteLogo(image, logo)

    # names (in text box)
    pasteNames(image, args.name1, args.name2, args.fontPath, tbCoordsList[0], tbSize)

    # icons (also in text box)
    # I change the file name strings so they start with . instead of ..
    icon1 = Image.open(args.icon1[1:])
    icon2 = Image.open(args.icon2[1:])
    pasteIcons(image, icon1, icon2, tbCoordsList[0], tbSize)

    image.save(args.outputPath)

if __name__ == '__main__':
    main()