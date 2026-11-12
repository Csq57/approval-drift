import sys
from pathlib import Path
sys.path.insert(0, r"C:\Users\Chan\Documents\codegeist2026\tools")
from build_video import shot, ROOT
out = Path(r"C:\Users\Chan\Documents\codegeist2026\build\open-frame.png")
out.parent.mkdir(exist_ok=True)
shot(out,
     ROOT / "shots/gallery-2-stale.png",
     "A real Confluence page, not a mock",
     "Approved against A$1,600. The page now says A$1,850.\nNothing re-checked it. This macro does, on every render.",
     "Approval drift  ·  Codegeist 2026")
print("wrote", out, out.stat().st_size)
