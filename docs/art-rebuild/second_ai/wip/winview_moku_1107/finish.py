# 木曜日窗景：左右翻（窗景卡 UV u=0 在西邊 x −6.5、人往南看西邊在右手邊）→ webp 品質 88；改前改後對照圖（人眼看出去的方向）
import sys
from PIL import Image, ImageDraw, ImageFont, ImageOps
S, OUTA, OUTD = sys.argv[1], sys.argv[2], sys.argv[3]
for t in ('day', 'night'):
    im = Image.open(f'{S}/mok_{t}.png').convert('RGB')
    ImageOps.mirror(im).save(f'{OUTA}/mokuyobi_view_{t}.webp', 'WEBP', quality=88, method=6)
bef = Image.open(f'{S}/before_mok_view.webp').convert('RGB')
def card(im):   # 模型原本那張 2048×1024 照卡的比例（14×6.5）縮放顯示，和遊戲一樣拉伸
    return im.resize((800, 371))
try: F = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 22)
except Exception: F = ImageFont.load_default()
rows = [('改前：模型原本那張手繪的樹（白天、晚上同一張）', ImageOps.mirror(card(bef))),
        ('改後 白天 14:00：溫州街正式模型（對街是溫州書屋那一排）', Image.open(f'{S}/mok_day.png').convert('RGB').resize((800, 371))),
        ('改後 晚上：窗、招牌、路燈亮', Image.open(f'{S}/mok_night.png').convert('RGB').resize((800, 371)))]
H = sum(34 + r[1].size[1] for r in rows) + 10
sheet = Image.new('RGB', (820, H), 'white'); d = ImageDraw.Draw(sheet); y = 6
for lab, im in rows:
    d.text((10, y), lab, fill=(20, 20, 20), font=F); y += 30; sheet.paste(im, (10, y)); y += im.size[1] + 4
sheet.save(f'{OUTD}/before_after.jpg', quality=84)
print('ok', sheet.size)
