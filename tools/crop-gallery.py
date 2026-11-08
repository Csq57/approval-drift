from PIL import Image
from pathlib import Path

ROOT = Path(r"C:\Users\Chan\Documents\codegeist2026\shots")
# the macro panel sits in this band of the 1440x900 page screenshot
BOX = (470, 240, 1290, 800)

for src, dst in [("vid-04.png", "gallery-1-valid.png"), ("final-22.png", "gallery-2-stale.png")]:
    p = ROOT / src
    if not p.exists():
        print("missing", src); continue
    im = Image.open(p).convert("RGB")
    w, h = im.size
    box = (max(0, BOX[0]), max(0, BOX[1]), min(w, BOX[2]), min(h, BOX[3]))
    im.crop(box).save(ROOT / dst, quality=95)
    print(dst, Image.open(ROOT / dst).size)
