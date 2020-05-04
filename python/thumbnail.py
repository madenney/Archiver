#This code has been adapted from Samy Amraoui's code, found here:
#https://github.com/foxadb/melee-youtube-thumbnail

#TODO add functionality for multiple chars
#TODO add functionality for font selection
#TODO add pirate marth easter egg
#TODO stoner green DK easter egg?
#TODO throw error if empty char list?
#TODO add custom border functionality
#TODO get better character models


import sys
import argparse
from PIL import Image, ImageOps, ImageDraw, ImageFont

W, H = 640, 360

def openImage(path):
    im = Image.open(path)
    im.show()

#TODO this will need a LOT of work when I implement multiple chars
def createCharacters(path, character1, character2):
    # First character image
    character1Image = Image.open(path + '/' + character1[0][0] + '/' + character1[0][0] + ' - ' + character1[0][1] + '.png')
    
    # Second character image
    character2Image = Image.open(path + '/' + character2[0][0] + '/' + character2[0][0] + ' - ' + character2[0][1] + '.png')

    # Compute new size
    baseWidth = 196
    size = (baseWidth, int(baseWidth * character1Image.size[1] / character1Image.size[0]))
    
    # Resize images
    character1Image = character1Image.resize(size, Image.ANTIALIAS)
    character2Image = character2Image.resize(size, Image.ANTIALIAS)

    # Return images
    return character1Image, character2Image

#TODO multiple char implementation
def pasteCharacterImages(image, character1, character2):
    # Mirror character 2
    character2 = ImageOps.mirror(character2)

    # Paste characters
    image.paste(character1, (0, 54), character1) 
    image.paste(character2, (W - character2.size[0], 54), character2)

def addBorder(image, bounds):
    fill = "maroon"
    draw = ImageDraw.Draw(image)
    draw.rectangle(bounds, fill)

#TODO add functionality for font selection once this is joined with a GUI
def writePlayers(fontPath, image, player1, player2):
    # Load font
    font = ImageFont.truetype(fontPath, 40)
    
    # Drawing context
    draw = ImageDraw.Draw(image)

    # Init widths
    w1 = draw.textsize(player1, font=font)[0]
    w2 = draw.textsize(player2, font=font)[0]

    # Compute starting coordinates
    x1 = W / 4 - w1 / 2
    x2 = 3 * W / 4 - w2 / 2

    # Draw players tags
    draw.text((x1, 4), player1, font=font, fill=(255,255,255,255))
    draw.text((x2, 4), player2, font=font, fill=(255, 255, 255, 255))

def writeTournament(fontPath, image, name):
    # Load font
    font = ImageFont.truetype(fontPath, 36)
    
    # Drawing context
    draw = ImageDraw.Draw(image)

    # Init width
    w = draw.textsize(name, font=font)[0]

    # Draw players tags
    draw.text(((W - w) / 2, H - 42), name, font=font, fill=(255, 255, 255, 255))

def writeRound(fontPath, image, name):
    # Load font
    font = ImageFont.truetype(fontPath, 32)
    
    # Drawing context
    draw = ImageDraw.Draw(image)

    # Init width
    w = draw.textsize(name, font=font)[0]

    # Draw players tags
    draw.text(((W - w) / 2, 3 * H / 5), name, font=font, fill=(255,255,255,255))

def parse(mains, colors):
    mainsList = mains.split(",")
    colorsList = colors.split(",")
    
    #TODO throw error if the lists aren't the same length
    completeList = list()
    for i in range (0, len(mainsList)):
        completeList.append([mainsList[i], colorsList[i]])
    return completeList

def main():
    #parse args from Thumbnail.js
    parser = argparse.ArgumentParser(description="Generate Youtube thumbnail for Melee matches")

    #positional args
    parser.add_argument("tournamentName", type=str)
    parser.add_argument("roundName", type=str)
    parser.add_argument("player1", type=str, help="first player's name")
    parser.add_argument("player2", type=str, help="second player's name")
    parser.add_argument("mains1", type=str, help="list of the first player's characters")
    parser.add_argument("mains2", type=str, help="list of the second player's characters")
    parser.add_argument("colors1", type=str, help="list of skins of the first player's characters")
    parser.add_argument("colors2", type=str, help="list of skins of the second player's characters")
    parser.add_argument("output", type=str, help="name of the image file to be output")


    #optional args
    parser.add_argument("--fontPath", default="./fonts/impact.ttf")
    parser.add_argument("--spritesPath", default="./images/character-models")

    args = parser.parse_args()

    mains1 = parse(args.mains1, args.colors1)
    mains2 = parse(args.mains2, args.colors2)

    #TODO testing
    print(args.fontPath)

    # Init image with background
    image = Image.new('RGBA', (W, H), 'black')

    # Add top border
    #TODO add functionality for custom borders (loading from images)
    bounds = [(0, 0), (image.width, image.height/6)]
    addBorder(image, bounds)

    # Open character images
    #TODO add functionality for multiple chars
    character1Image, character2Image = createCharacters(args.spritesPath, mains1, mains2)

    # Paste character images
    pasteCharacterImages(image, character1Image, character2Image)

    # Add bottom border
    bounds = [(0, image.height * (5/6)), (image.width, image.height)]
    addBorder(image, bounds)

    # Write players tags
    writePlayers(args.fontPath, image, args.player1, args.player2)

    # Write tournament name
    #TODO change this later to allow for font selection
    writeTournament(args.fontPath, image, args.tournamentName)

    # Write round name
    writeRound(args.fontPath, image, args.roundName)

    # Save image
    image.save(args.output)

    print("thumbnail successfully generated in: " + args.output)

if __name__ == '__main__':
    main()