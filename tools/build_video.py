"""Build the Codegeist submission video.

Scenes: title card -> the live demo (recorded from the real Confluence page) -> how the
verdict is computed -> the architecture and its constraints -> closing.

Each scene's narration is synthesised with edge-tts; the scene's on-screen duration is the
narration length, so a scene never cuts off mid-sentence.
"""
import asyncio
import subprocess
import sys
from pathlib import Path

import edge_tts
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "build-video"
DEMO = ROOT / "demo-silent.mp4"

FFMPEG = (
    r"C:\Users\Chan\AppData\Local\Microsoft\WinGet\Packages"
    r"\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe"
)
W, H = 1440, 900
VOICE = "en-US-AndrewNeural"

INK = (23, 43, 77)
MUTED = (98, 111, 134)
ACCENT = (0, 85, 204)
BG = (255, 255, 255)


def font(size: int, bold: bool = False):
    candidates = [
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
    ]
    for c in candidates:
        if Path(c).exists():
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()


def card(path: Path, kicker: str, title: str, lines: list[str], footer: str = "") -> None:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 8], fill=ACCENT)
    y = 150
    if kicker:
        d.text((110, y), kicker.upper(), font=font(20, True), fill=ACCENT)
        y += 46
    d.text((110, y), title, font=font(52, True), fill=INK)
    y += 96
    for line in lines:
        d.text((110, y), line, font=font(28), fill=INK)
        y += 46
    if footer:
        d.text((110, H - 90), footer, font=font(22), fill=MUTED)
    img.save(path, quality=95)


async def say(text: str, out: Path) -> float:
    """Synthesise narration, chunked by sentence: the service drops very long inputs and
    gives no audio instead of an error."""
    sentences = [s.strip() for s in text.replace("\n", " ").split(". ") if s.strip()]
    chunks, buf = [], ""
    for s in sentences:
        piece = s if s.endswith(".") else s + "."
        if len(buf) + len(piece) > 240 and buf:
            chunks.append(buf)
            buf = piece
        else:
            buf = (buf + " " + piece).strip()
    if buf:
        chunks.append(buf)

    parts = []
    for i, chunk in enumerate(chunks):
        part = out.with_name(f"{out.stem}_{i}.mp3")
        for attempt in range(4):
            try:
                await edge_tts.Communicate(chunk, VOICE).save(str(part))
                if part.exists() and part.stat().st_size > 1024:
                    break
            except Exception:
                pass
            await asyncio.sleep(1.5)
        if not part.exists() or part.stat().st_size <= 1024:
            raise RuntimeError(f"no audio for chunk {i}: {chunk[:60]}")
        parts.append(part)

    listing = out.with_suffix(".txt")
    listing.write_text("\n".join(f"file '{p.as_posix()}'" for p in parts), encoding="utf-8")
    subprocess.run([FFMPEG, "-y", "-v", "error", "-f", "concat", "-safe", "0",
                    "-i", str(listing), "-c", "copy", str(out)], check=True)

    probe = subprocess.run(
        [FFMPEG.replace("ffmpeg.exe", "ffprobe.exe"), "-v", "error",
         "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(out)],
        capture_output=True, text=True, check=True,
    )
    return float(probe.stdout.strip())


def scene_image(src: Path, out: Path, seconds: float) -> None:
    subprocess.run([
        FFMPEG, "-y", "-v", "error",
        "-loop", "1", "-i", str(src), "-t", f"{seconds:.2f}",
        "-vf", f"scale={W}:{H}", "-r", "30",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", str(out),
    ], check=True)


def scene_demo(seconds: float, out: Path) -> None:
    # loop the 12s demo to cover the narration, then cut
    subprocess.run([
        FFMPEG, "-y", "-v", "error",
        "-stream_loop", "-1", "-i", str(DEMO), "-t", f"{seconds:.2f}",
        "-r", "30", "-c:v", "libx264", "-pix_fmt", "yuv420p", str(out),
    ], check=True)


SCENES = [
    ("title",
     "A purchase is approved on Monday. By Thursday the amount, the supplier and the delivery "
     "date have all moved. The approval badge is still green, because nobody re-reads an approval "
     "that already looks finished. This is Approval drift for Confluence.",
     ("Codegeist 2026", "An approval is a decision about facts",
      ["It is granted against one exact set of values.",
       "The page then changes. The badge does not.",
       "This app notices."],
      "Confluence macro  ·  Runs on Atlassian  ·  MIT")),
    ("demo",
     "Here it is on a real Confluence page. The approval is recorded against these exact values. "
     "Now watch the amount. It moves from sixteen hundred to eighteen fifty, and the approval "
     "immediately reports itself stale: amount increase, sixteen hundred to eighteen fifty, "
     "critical. It names the change and the direction. Approving the new values stores a new "
     "snapshot, and the page is green again.",
     None),
    ("logic",
     "The verdict is not a model's opinion. It is a pure function: normalise the request into a "
     "snapshot, diff it against the approved snapshot, and decide. Ten tests pin the cases that "
     "matter. Formatting noise must not invalidate anything: a formatted amount and a plain number "
     "are the same fact. A raised amount must invalidate. A currency switch is critical even when "
     "the number is untouched. And quietly deleting a field is reported as removed, not ignored.",
     ("Under the hood", "Deterministic, and tested",
      ["10 tests, no network, no model in the loop",
       "A$1,250.00 and 1250 are the same fact",
       "1250 → 1490 is an amount increase, critical",
       "A missing field counts as removed"],
      "node --test src/approval.test.js")),
    ("arch",
     "It is a Forge macro with a plain HTML front end, so it renders reliably inside Confluence. "
     "The approval lives where it belongs: as a content property on the page it approves, written "
     "through the v2 REST API. The verdict is computed in the browser so typing stays instant. No "
     "external services, no analytics, no personal data, and it is eligible for Runs on Atlassian.",
     ("Architecture", "Where the truth lives",
      ["Custom UI macro on the page it approves",
       "Approval snapshot stored as a page property",
       "Verdict computed locally, storage on the server",
       "Runs on Atlassian: no external egress"],
      "github.com/Csq57/approval-drift")),
    ("close",
     "Approval drift. It does not approve anything for you. It just refuses to let a decision "
     "quietly stop matching the thing it was made about.",
     ("Approval drift", "Install it, then type /Approval drift",
      ["Approvals stop matching. Now you will know.",
       "",
       "Repository: github.com/Csq57/approval-drift"],
      "MIT licensed  ·  Codegeist 2026")),
]


async def main() -> int:
    BUILD.mkdir(exist_ok=True)
    parts = []
    for i, (kind, text, card_spec) in enumerate(SCENES):
        wav = BUILD / f"v{i}.mp3"
        dur = await say(text, wav)
        dur += 0.6
        clip = BUILD / f"s{i}.mp4"
        if kind == "demo":
            scene_demo(dur, clip)
        else:
            png = BUILD / f"c{i}.png"
            card(png, *card_spec)
            scene_image(png, clip, dur)
        parts.append((clip, wav, dur))
        print(f"scene {i} {kind}: {dur:.1f}s")

    concat = BUILD / "concat.txt"
    concat.write_text("\n".join(f"file '{c.as_posix()}'" for c, _, _ in parts), encoding="utf-8")
    video = BUILD / "video.mp4"
    subprocess.run([FFMPEG, "-y", "-v", "error", "-f", "concat", "-safe", "0",
                    "-i", str(concat), "-c", "copy", str(video)], check=True)

    audio_list = BUILD / "audio.txt"
    audio_list.write_text(
        "\n".join(f"file '{w.as_posix()}'" for _, w, _ in parts), encoding="utf-8")
    voice = BUILD / "voice.mp3"
    subprocess.run([FFMPEG, "-y", "-v", "error", "-f", "concat", "-safe", "0",
                    "-i", str(audio_list), "-c", "copy", str(voice)], check=True)

    out = ROOT / "approval-drift-demo.mp4"
    subprocess.run([
        FFMPEG, "-y", "-v", "error", "-i", str(video), "-i", str(voice),
        "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", str(out),
    ], check=True)
    total = sum(d for _, _, d in parts)
    print(f"wrote {out} ~{total:.0f}s")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
