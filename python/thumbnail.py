#This code has been adapted from Samy Amraoui's code, found here:
#https://github.com/foxadb/melee-youtube-thumbnail

#TODO add functionality for multiple chars
#TODO add functionality for font selection
#TODO add pirate marth easter egg
#TODO throw error if empty char list?
#TODO add borders

import sys
import argparse
from PIL import Image, ImageOps, ImageDraw, ImageFont

W, H = 640, 360

def openImage(path):
    im = Image.open(path)
    im.show()

def createCharacters(path, character1, character2):
    # First character image
    character1Image = Image.open(path + '/' + character1 + '.png')
    
    # Second character image
    character2Image = Image.open(path + '/' + character2 + '.png')

    # Compute new size
    baseWidth = 196
    size = (baseWidth, int(baseWidth * character1Image.size[1] / character1Image.size[0]))
    
    # Resize images
    character1Image = character1Image.resize(size, Image.ANTIALIAS)
    character2Image = character2Image.resize(size, Image.ANTIALIAS)

    # Return images
    return character1Image, character2Image


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

#TODO throw error if empty char list?
def generate(tournamentName, roundName, player1, player2, chars1, chars2, output, fontPath="fonts/impact.ttf", spritesPath="sprites"):

    #TODO testing
    print(fontPath)

    # Init image with background
    image = Image.new('RGBA', (W, H), 'black')

    # Add top border
    #TODO add functionality for custom borders (loading from images)
    bounds = [(0, 0), (image.width, image.height/6)]
    addBorder(image, bounds)

    # Open character images
    #TODO add functionality for multiple chars
    character1Image, character2Image = createCharacters(spritesPath, chars1[0], chars2[0])

    # Paste character images
    pasteCharacterImages(image, character1Image, character2Image)

    # Add bottom border
    bounds = [(0, image.height * (5/6)), (image.width, image.height)]
    addBorder(image, bounds)

    # Write players tags
    writePlayers(fontPath, image, player1, player2)

    # Write tournament name
    #TODO change this later to allow for font selection
    writeTournament(fontPath, image, tournamentName)

    # Write round name
    writeRound(fontPath, image, roundName)

    # Save image
    image.save("output/" + output)

    print("thumbnail successfully generated in: output/" + output)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Generate Youtube thumbnail for Melee matches")

    #positional args
    parser.add_argument("tournamentName", type=str)
    parser.add_argument("roundName", type=str)
    parser.add_argument("player1", type=str, help="first player's name")
    parser.add_argument("player2", type=str, help="second player's name")
    parser.add_argument("chars1", type=list, help="list of the first player's characters")
    parser.add_argument("chars2", type=list, help="list of the second player's characters")
    parser.add_argument("output", type=str, help="name of the image file to be output")


    #optional args
    parser.add_argument("--fontPath")
    parser.add_argument("--spritesPath")

    args = parser.parse_args()

    generate(args.tournamentName, args.roundName, args.player1, args.chars1, args.chars2, args.output, args.fontPath, args.spritesPath)