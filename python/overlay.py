import argparse
from PIL import Image, ImageOps, ImageDraw, ImageFont

def pasteText(image, text, coords, fontPath):
    # Get font
    font = ImageFont.truetype(fontPath, 5)

    # Drawing context
    draw = ImageDraw.Draw(image)

    # Text width
    #width = draw.textsize(text, font = font)[0]

    # Draw text
    draw.text((coords[0], coords[1]), text, font=font, fill=(255,255,255,255))

def main():
    parser = argparse.ArgumentParser(description="Generate overlay for a Melee combo video")

    # Positional args
    parser.add_argument("template")
    parser.add_argument("name1")
    #parser.add_argument("name2")
    #parser.add_argument("icon1")
    #parser.add_argument("icon2")
    #parser.add_argument("tournament")
    #parser.add_argument("date")
    
    # Optional args
    parser.add_argument("--fontPath", default="./fonts/impact.ttf")

    args = parser.parse_args()

    image = Image.open(args.template)

    pasteText(image, args.name1, [53, 900], args.fontPath)

    image.save("./test_files/overlay.png")

if __name__ == '__main__':
    main()