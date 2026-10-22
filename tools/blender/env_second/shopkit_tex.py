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


def menus():
    """手搖飲店的燈箱菜單（三欄：茶、奶茶、鮮果；中杯／大杯）與冰菓室的長條木牌菜單（直書紅字）。品項、價錢都是一般的、虛構的"""
    W, H = 1024, 384; im = Image.new('RGB', (W, H), (250, 248, 240)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 54], fill=(122, 154, 90)); d.text((24, 8), '飲 品 菜 單', font=f(36), fill=(255, 255, 255)); d.text((W - 300, 14), '中杯 M ／ 大杯 L', font=f(26), fill=(255, 255, 255))
    cols = [('原 味 茶', [('紅茶', 25, 30), ('綠茶', 25, 30), ('青茶', 25, 30), ('烏龍茶', 30, 35), ('冬瓜茶', 25, 30), ('蕎麥茶', 30, 35)]),
            ('奶 茶', [('奶茶', 40, 50), ('珍珠奶茶', 50, 60), ('紅茶拿鐵', 55, 65), ('烏龍奶茶', 45, 55), ('布丁奶茶', 55, 65), ('仙草凍奶茶', 50, 60)]),
            ('鮮 果', [('檸檬綠', 45, 55), ('冬瓜檸檬', 45, 55), ('柳橙綠', 55, 65), ('百香綠', 50, 60), ('葡萄柚綠', 55, 65), ('金桔檸檬', 45, 55)])]
    cw = W / 3
    for i, (hd, items) in enumerate(cols):
        x0 = int(i * cw) + 22
        d.ellipse([x0, 70, x0 + 30, 100], fill=[(176, 96, 56), (196, 160, 120), (232, 196, 60)][i]); d.text((x0 + 40, 66), hd, font=f(30), fill=(70, 60, 50))
        for k, (nm, m, l) in enumerate(items):
            y = 116 + k * 42; d.text((x0, y), nm, font=f(28), fill=(50, 44, 40)); d.text((x0 + 200, y), f'{m}', font=f(28), fill=(160, 70, 50)); d.text((x0 + 262, y), f'{l}', font=f(28), fill=(160, 70, 50))
        if i: d.line([int(i * cw), 66, int(i * cw), H - 14], fill=(210, 204, 190), width=2)
    im.save(os.path.join(GEN, 'shop_menu_tea.png'))
    # 冰菓室：深色木板上掛一排米色長條木牌，直書紅字，下面是價錢
    W, H = 1024, 320; im = Image.new('RGB', (W, H), (92, 60, 38)); d = ImageDraw.Draw(im)
    for y in range(0, H, 3): d.line([0, y, W, y], fill=(92 + rnd.randint(-8, 8), 60 + rnd.randint(-6, 6), 38 + rnd.randint(-5, 5)))
    items = [('紅豆牛奶冰', 60), ('綜合剉冰', 55), ('四果冰', 55), ('花生豆花', 45), ('愛玉檸檬', 40), ('粉圓冰', 50), ('八寶冰', 65), ('芋圓冰', 60), ('杏仁豆腐', 45), ('芒果冰', '時價')]
    n = len(items); sw = W / n
    for i, (nm, pr) in enumerate(items):
        x0 = int(i * sw + 8); x1 = int((i + 1) * sw - 8); d.rectangle([x0, 14, x1, H - 14], fill=(236, 222, 190)); d.rectangle([x0, 14, x1, H - 14], outline=(70, 46, 30), width=2)
        fs = min(40, int((H - 100) / len(nm)) - 2); yy = 26
        for ch in nm: d.text(((x0 + x1) / 2 - fs / 2, yy), ch, font=f(fs), fill=(178, 36, 30)); yy += fs + 1
        pt = str(pr); d.text(((x0 + x1) / 2 - len(pt) * 9, H - 56), pt, font=f(30 if isinstance(pr, int) else 22), fill=(40, 30, 24))
    im.save(os.path.join(GEN, 'shop_menu_ice.png')); print('saved menus')


def noren():
    """定食店的暖簾（v6d；BB-B：三塊深色方板看起來不像布）：深藍底、白色圓圈裡一個「食」、下緣一條細白線；
    三片布各佔圖的 1/3，模型照片數切 u。布紋用細的橫線。"""
    W, H = 768, 512; im = Image.new('RGB', (W, H), (30, 46, 78)); d = ImageDraw.Draw(im)
    for y in range(0, H, 3): d.line([0, y, W, y], fill=(27, 42, 72) if (y // 3) % 2 else (33, 50, 84))
    cx, cy, r = W / 2, H * 0.44, 150
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(240, 238, 230), width=14)
    d.text((cx - 118, cy - 136), '食', font=f(236), fill=(240, 238, 230))
    d.line([0, H - 40, W, H - 40], fill=(240, 238, 230), width=6)
    im.save(os.path.join(GEN, 'shop_noren.png'))


if __name__ == '__main__':
    os.makedirs(GEN, exist_ok=True); atlas(); awnings(); menus(); noren()
