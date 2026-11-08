"""Assemble recorded frames into a video using their real capture timestamps.

Frames were captured with uneven spacing (screenshot latency varies), so encoding at a fixed
fps would speed up or slow down parts of the demo. The concat demuxer takes an explicit
duration per frame instead, which reproduces the original pace.
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FRAMES = ROOT / "frames"
OUT = ROOT / "demo-silent.mp4"
LIST = ROOT / "frames.txt"

FFMPEG = (
    r"C:\Users\Chan\AppData\Local\Microsoft\WinGet\Packages"
    r"\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe"
)


def main() -> int:
    files = sorted(FRAMES.glob("f*.jpg"))
    if not files:
        print("no frames")
        return 1

    times = [p.stat().st_mtime for p in files]
    lines = []
    for i, path in enumerate(files):
        if i + 1 < len(files):
            dur = times[i + 1] - times[i]
        else:
            dur = 0.15
        dur = min(max(dur, 0.04), 1.5)
        lines.append(f"file '{path.as_posix()}'")
        lines.append(f"duration {dur:.3f}")

    # the concat demuxer needs the last file repeated without a duration
    lines.append(f"file '{files[-1].as_posix()}'")
    LIST.write_text("\n".join(lines), encoding="utf-8")

    total = sum(float(l.split()[1]) for l in lines if l.startswith("duration"))
    print(f"frames={len(files)} duration={total:.1f}s")

    cmd = [
        FFMPEG, "-y",
        "-f", "concat", "-safe", "0", "-i", str(LIST),
        "-vsync", "vfr", "-pix_fmt", "yuv420p",
        "-c:v", "libx264", "-crf", "20", "-preset", "medium",
        str(OUT),
    ]
    subprocess.run(cmd, check=True)
    print("wrote", OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
