"""Generate PWA / home-screen icons (envelope mascot '우편이') into public/icons.

Usage: python scripts/build_app_icons.py
Mirrors src/components/brand/Mascot.tsx (64x64 viewBox) so icon and in-app mascot match.
"""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "icons"

ORANGE = (232, 84, 30)
CREAM = (255, 248, 241)
INK = (59, 42, 32)
CHEEK = (255, 159, 138)
SUNNY = (255, 201, 77)
BG = (255, 240, 231)
FLAP = (255, 225, 210)


def render(size: int, maskable: bool) -> Image.Image:
    ss = 4
    s = size * ss
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if maskable:
        d.rectangle([0, 0, s, s], fill=BG)
        scale = 0.62
    else:
        d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.24), fill=BG)
        scale = 0.80

    unit = s * scale / 64
    ox = (s - 64 * unit) / 2
    oy = (s - 64 * unit) / 2 + unit * 2

    def p(x: float, y: float) -> tuple[float, float]:
        return (ox + x * unit, oy + y * unit)

    w = max(2, int(3 * unit))
    d.rounded_rectangle([*p(6, 14), *p(58, 54)], radius=int(9 * unit), fill=CREAM, outline=ORANGE, width=w)
    # 봉투 덮개: 얕고 연하게 채워 눈썹처럼 보이지 않게
    d.polygon([p(9.5, 16.5), p(32, 28), p(54.5, 16.5)], fill=FLAP, outline=ORANGE)
    d.line([p(9.5, 16.5), p(32, 28), p(54.5, 16.5)], fill=ORANGE, width=max(2, int(2.6 * unit)), joint="curve")
    # 웃는 눈 ^ ^
    for cx in (23, 41):
        d.arc([*p(cx - 3.5, 34.5), *p(cx + 3.5, 41.5)], start=200, end=340, fill=INK, width=max(2, int(2.6 * unit)))
    for cx in (17, 47):
        d.ellipse([*p(cx - 3.2, 39.8), *p(cx + 3.2, 46.2)], fill=CHEEK + (180,))
    d.arc([*p(27.5, 38.5), *p(36.5, 47.5)], start=20, end=160, fill=INK, width=max(2, int(2.4 * unit)))
    d.rounded_rectangle([*p(44, 4), *p(60, 20)], radius=int(3 * unit), fill=SUNNY, outline=ORANGE, width=max(1, int(2 * unit)))
    hx, hy = 52, 11
    r = 2.1
    d.ellipse([*p(hx - 2 * r, hy - r), *p(hx, hy + r)], fill=ORANGE)
    d.ellipse([*p(hx, hy - r), *p(hx + 2 * r, hy + r)], fill=ORANGE)
    d.polygon([p(hx - 2 * r + 0.2, hy + 0.6), p(hx + 2 * r - 0.2, hy + 0.6), p(hx, hy + 3.4)], fill=ORANGE)
    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    targets = {
        "icon-192.png": (192, False),
        "icon-512.png": (512, False),
        "icon-maskable-512.png": (512, True),
        "apple-touch-icon.png": (180, True),
    }
    for name, (size, maskable) in targets.items():
        render(size, maskable).save(OUT / name, optimize=True)
        print("wrote", name)


if __name__ == "__main__":
    main()
