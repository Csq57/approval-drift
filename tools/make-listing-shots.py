from PIL import Image
from pathlib import Path
ROOT = Path(r"C:\Users\Chan\Documents\codegeist2026\shots")
W, H = 1840, 900
pairs = [("vid-04.png", "mp-shot-valid.png"), ("final-22.png", "mp-shot-stale.png")]
for src, dst in pairs:
    p = ROOT / src
    if not p.exists():
        print("missing", src); continue
    im = Image.open(p).convert("RGB")
    canvas = Image.new("RGB", (W, H), (246, 247, 249))
    scale = min(W / im.width, H / im.height)
    im2 = im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS)
    canvas.paste(im2, ((W - im2.width) // 2, (H - im2.height) // 2))
    canvas.save(ROOT / dst)
    print(dst, canvas.size)
