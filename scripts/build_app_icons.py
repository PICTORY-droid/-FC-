"""Generate PWA / home-screen icons into public/icons.

Usage: python scripts/build_app_icons.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "icons"
FONT = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"

POST_BLUE = (0, 84, 166)
SIGNAL_RED = (229, 0, 18)
WHITE = (255, 255, 255)


def render(size: int, maskable: bool) -> Image.Image:
    scale = 4  # supersample for smooth edges
    s = size * scale
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if maskable:
        d.rectangle([0, 0, s, s], fill=POST_BLUE)
        safe = 0.62  # content inside maskable safe zone
    else:
        d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.22), fill=POST_BLUE)
        safe = 0.78

    font = ImageFont.truetype(FONT, int(s * 0.30 * safe / 0.78), index=0)
    label = "문제은행"
    sub = ImageFont.truetype(FONT, int(s * 0.12 * safe / 0.78), index=0)
    tw, th = d.textbbox((0, 0), "FC", font=font)[2:]
    lw = d.textbbox((0, 0), label, font=sub)[2]
    cy = s * 0.44
    d.text(((s - tw) / 2, cy - th * 0.62), "FC", font=font, fill=WHITE)
    d.text(((s - lw) / 2, cy + th * 0.48), label, font=sub, fill=WHITE)
    r = s * 0.045 * safe / 0.78
    dx, dy = (s + tw) / 2 + r * 0.6, cy - th * 0.40
    d.ellipse([dx - r, dy - r, dx + r, dy + r], fill=SIGNAL_RED)
    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    targets = {
        "icon-192.png": (192, False),
        "icon-512.png": (512, False),
        "icon-maskable-512.png": (512, True),
        "apple-touch-icon.png": (180, True),  # iOS applies its own rounding
    }
    for name, (size, maskable) in targets.items():
        render(size, maskable).save(OUT / name, optimize=True)
        print("wrote", name)


if __name__ == "__main__":
    main()
