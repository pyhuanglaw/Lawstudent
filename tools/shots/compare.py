"""把參考圖與實際遊戲截圖並排（標上「參考圖／修改前／目前」），給 docs/art-rebuild/VISUAL_REVIEW.md 用。
用法：python3 tools/shots/compare.py out.jpg 高度 "標籤1=圖1" "標籤2=圖2" ...（圖會等高縮放後左右並排）"""
import sys
from PIL import Image, ImageDraw, ImageFont
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
def main():
    out = sys.argv[1]; H = int(sys.argv[2]); items = [a.split('=', 1) for a in sys.argv[3:]]
    ims = []
    for label, path in items:
        im = Image.open(path).convert('RGB'); w = int(im.width * H / im.height); ims.append((label, im.resize((w, H), Image.LANCZOS)))
    pad = 8; bar = 34
    W = sum(i.width for _, i in ims) + pad * (len(ims) + 1)
    canvas = Image.new('RGB', (W, H + bar + pad * 2), (245, 242, 236))
    d = ImageDraw.Draw(canvas)
    try: f = ImageFont.truetype(FONT, 22)
    except Exception: f = ImageFont.load_default()
    x = pad
    for label, im in ims:
        canvas.paste(im, (x, bar + pad)); d.text((x + 4, 6), label, fill=(40, 34, 30), font=f); x += im.width + pad
    canvas.save(out, quality=88)
    print(out, canvas.size)
main()
