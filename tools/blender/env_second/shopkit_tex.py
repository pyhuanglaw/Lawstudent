"""店面的小貼圖（ART-WZ0／WZ2，LAWWW2-B 2026-10-16；AA_164 7b「店面設計準則」）：
玻璃門上的紙條、營業時間牌、徵人、無商標的支付貼紙、招租紅紙、冰店「冬天休息」、影印店價目表、早午餐黑板、條紋雨棚布。
全部虛構文字、通用圖示，不用任何真實店家或品牌的標誌、配色（D77）。輸出 textures/gen/shop_notes.png（1024×1024 圖集，每格 256×256）與 shop_awning_*.png。
用法：python3 tools/blender/env_second/shopkit_tex.py
格子（col,row）→ 名稱：NOTES 表（wz_street.py 的 shopkit 用同一份）。"""
import math, os, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__)); GEN = os.path.join(HERE, 'textures', 'gen')
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
C = 256
NOTES = ['hiring', 'hours', 'pay', 'rent', 'winter', 'copyprice', 'copyprice2', 'nobook', 'chalk', 'menu', 'closed', 'poster', 'lostcat', 'tutor', 'hours2', 'blank']
rnd = random.Random(164)


def f(sz): return ImageFont.truetype(FONT, sz)


def paper(d, x0, y0, w, h, col=(246, 243, 233), tape=True, ang=0.0):
    d.rectangle([x0, y0, x0 + w, y0 + h], fill=col)
    if tape:
        for tx in (x0 + w * 0.2, x0 + w * 0.8): d.rectangle([tx - 14, y0 - 6, tx + 14, y0 + 8], fill=(235, 230, 205))


def hand(d, xy, text, sz, col=(40, 40, 46)):
    """手寫感：每個字一點點大小、位置、粗細的變化"""
    x, y = xy
    for ch in text:
        s = int(sz * rnd.uniform(0.9, 1.08)); d.text((x + rnd.uniform(-1.5, 1.5), y + rnd.uniform(-2, 2)), ch, font=f(s), fill=col)
        x += s * (0.98 if ord(ch) > 255 else 0.56)


def cell(name):
    im = Image.new('RGBA', (C, C), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if name == 'hiring':
        paper(d, 34, 30, 188, 196); hand(d, (54, 54), '徵', 64, (190, 40, 36)); hand(d, (124, 54), '人', 64, (190, 40, 36))
        hand(d, (52, 136), '週末早班', 26); hand(d, (52, 170), '洽 櫃檯', 24, (60, 60, 70))
    elif name == 'hours':
        d.rounded_rectangle([40, 52, 216, 204], 12, fill=(48, 44, 40)); d.text((60, 66), '營業時間', font=f(26), fill=(240, 232, 214))
        d.text((60, 108), '11:00 - 21:00', font=f(24), fill=(240, 232, 214)); d.text((60, 146), '週一公休', font=f(22), fill=(214, 196, 160))
    elif name == 'pay':          # 無商標的「可刷卡」「手機支付」圖示（通用圖形）
        for i, (bx, lab) in enumerate(((36, '刷卡'), (136, '行動支付'))):
            d.rounded_rectangle([bx, 70, bx + 86, 186], 10, fill=(250, 250, 248), outline=(120, 120, 120), width=3)
            if i == 0: d.rounded_rectangle([bx + 14, 92, bx + 72, 130], 5, outline=(60, 90, 140), width=4); d.rectangle([bx + 14, 102, bx + 72, 110], fill=(60, 90, 140))
            else: d.rounded_rectangle([bx + 28, 84, bx + 58, 136], 6, outline=(60, 120, 90), width=4); d.ellipse([bx + 39, 126, bx + 47, 133], fill=(60, 120, 90))
            d.text((bx + 8, 146), lab, font=f(17 if i else 20), fill=(60, 60, 60))
    elif name == 'rent':
        d.rectangle([30, 30, 226, 226], fill=(200, 34, 32)); d.text((52, 50), '招', font=f(76), fill=(250, 226, 120)); d.text((132, 50), '租', font=f(76), fill=(250, 226, 120))
        d.text((56, 150), '店面 一樓', font=f(26), fill=(250, 236, 200)); d.text((56, 186), '洽 樓上', font=f(24), fill=(250, 236, 200))
    elif name == 'winter':
        paper(d, 30, 40, 196, 170, (250, 248, 240)); hand(d, (50, 70), '冬天休息', 40, (40, 90, 160)); hand(d, (56, 130), '明年五月見', 28, (40, 40, 46)); hand(d, (150, 172), '老闆', 20)
    elif name in ('copyprice', 'copyprice2'):
        paper(d, 22, 18, 212, 222, (252, 252, 250), tape=False)
        rows = [('黑白 A4', '1.0'), ('雙面', '1.5'), ('彩色 A4', '5'), ('膠裝', '40'), ('海報 A1', '180')] if name == 'copyprice' else [('論文輸出', '洽'), ('騎馬釘', '20'), ('護貝', '15'), ('掃描', '3'), ('傳真', '10')]
        d.rectangle([22, 18, 234, 52], fill=(30, 80, 150)); d.text((34, 22), '價目表' if name == 'copyprice' else '服務項目', font=f(24), fill=(255, 255, 255))
        for i, (a, b) in enumerate(rows):
            y = 64 + i * 34; d.text((34, y), a, font=f(22), fill=(30, 30, 30)); d.text((176, y), b, font=f(22), fill=(190, 40, 36)); d.line([30, y + 30, 226, y + 30], fill=(200, 200, 200), width=1)
    elif name == 'nobook':
        paper(d, 28, 56, 200, 140, (255, 250, 236)); d.text((44, 74), '本店不影印', font=f(30), fill=(190, 40, 36)); d.text((60, 120), '整本書', font=f(38), fill=(190, 40, 36)); d.text((120, 168), '謝謝', font=f(20), fill=(70, 70, 70))
    elif name == 'chalk':
        d.rectangle([10, 10, 246, 246], fill=(38, 46, 42)); d.rectangle([10, 10, 246, 246], outline=(120, 90, 60), width=10)
        for i, (t, c, s) in enumerate((('今日推薦', (246, 240, 220), 34), ('班尼迪克蛋', (250, 220, 120), 28), ('半熟 3\'40"', (246, 240, 220), 26), ('拿鐵 +40', (200, 230, 240), 24))):
            hand(d, (30, 30 + i * 52), t, s, c)
        im = im.filter(ImageFilter.GaussianBlur(0.6))
    elif name == 'menu':
        paper(d, 26, 20, 204, 216, (250, 244, 228), tape=False)
        for i, t in enumerate(('早午餐', '班尼迪克蛋 220', '法式吐司 180', '蔬菜歐姆蛋 200', '鮮奶茶 80')):
            d.text((40, 32 + i * 40), t, font=f(28 if i == 0 else 21), fill=(70, 50, 30) if i == 0 else (40, 40, 40))
    elif name == 'closed':
        d.rounded_rectangle([40, 80, 216, 176], 10, fill=(250, 250, 248), outline=(80, 80, 80), width=3); d.text((62, 104), '暫停營業', font=f(36), fill=(60, 60, 60))
    elif name == 'poster':
        d.rectangle([30, 20, 226, 236], fill=(240, 216, 170)); d.ellipse([70, 50, 186, 166], fill=(220, 120, 60)); d.text((52, 178), '社區二手市集', font=f(24), fill=(80, 40, 20)); d.text((72, 208), '每月第一個週六', font=f(17), fill=(80, 40, 20))
    elif name == 'lostcat':
        paper(d, 30, 26, 196, 206); d.text((70, 40), '尋貓', font=f(44), fill=(30, 30, 30)); d.rectangle([60, 96, 196, 176], fill=(200, 196, 186)); d.ellipse([100, 108, 160, 166], fill=(220, 160, 90))
        d.text((54, 188), '橘色 很胖 叫牠會來', font=f(17), fill=(40, 40, 40))
    elif name == 'tutor':
        paper(d, 30, 24, 196, 210, (246, 250, 255)); d.text((48, 40), '兒童課輔', font=f(34), fill=(30, 90, 160)); d.text((48, 92), '國小 一～六年級', font=f(20), fill=(40, 40, 40))
        d.text((48, 124), '作業指導・閱讀', font=f(20), fill=(40, 40, 40)); d.text((48, 170), '請上二樓', font=f(24), fill=(190, 40, 36))
    elif name == 'hours2':
        d.rectangle([44, 70, 212, 190], fill=(250, 250, 250), outline=(30, 120, 120), width=4); d.text((62, 84), 'OPEN', font=f(40), fill=(30, 120, 120)); d.text((62, 140), '24 小時', font=f(28), fill=(30, 30, 30))
    return im


def atlas():
    A = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    for i, n in enumerate(NOTES):
        if n == 'blank': continue
        A.alpha_composite(cell(n), ((i % 4) * C, (i // 4) * C))
    A.save(os.path.join(GEN, 'shop_notes.png')); print('saved shop_notes.png')


def awnings():
    for nm, cols in (('stripe_green', [(46, 92, 70), (236, 232, 220)]), ('stripe_red', [(168, 46, 40), (240, 236, 226)]), ('stripe_navy', [(36, 52, 84), (232, 228, 216)]), ('stripe_orange', [(214, 120, 52), (244, 238, 226)])):
        im = Image.new('RGB', (256, 64)); d = ImageDraw.Draw(im)
        for k in range(8): d.rectangle([k * 32, 0, k * 32 + 31, 63], fill=cols[k % 2])
        # 帆布的褪色：上半部（曬太陽）淡一點
        im = Image.blend(im, Image.new('RGB', im.size, (236, 232, 222)), 0.08)
        im.save(os.path.join(GEN, f'shop_awning_{nm}.png'))
    print('saved awnings')


if __name__ == '__main__':
    os.makedirs(GEN, exist_ok=True); atlas(); awnings()
