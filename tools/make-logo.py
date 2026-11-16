from PIL import Image, ImageDraw
W = 144
img = Image.new("RGBA", (W, W), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
BLUE = (0, 85, 204, 255)
RED = (222, 53, 49, 255)

# rounded square
d.rounded_rectangle([0, 0, W - 1, W - 1], radius=30, fill=BLUE)

# a white check mark (the approval)
d.line([(34, 74), (62, 102)], fill=(255, 255, 255, 255), width=15, joint="curve")
d.line([(62, 102), (110, 44)], fill=(255, 255, 255, 255), width=15, joint="curve")

# the red bar across it (the approval no longer holds)
d.line([(26, 122), (122, 22)], fill=RED, width=13)
d.ellipse([20, 116, 32, 128], fill=RED)
d.ellipse([116, 16, 128, 28], fill=RED)

img.save(r"C:\Users\Chan\Documents\codegeist2026\shots\mp-logo.png")
print("logo written", img.size)
