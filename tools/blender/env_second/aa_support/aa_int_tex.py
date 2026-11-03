"""日常失速、木曜日、山嵐書店室內用的自製貼圖（PIL／numpy；系統 python3）。AA 子代理 2026-11-03。
用法：python3 tools/blender/env_second/aa_support/aa_int_tex.py [dof|mok|shl|all]
輸出到 tools/blender/env_second/textures/gen/：
  dof_checker.png  綠白格紋地磚（一張 2×2 格，每格 0.3 m）
  dof_print.png    黑板菜單、首都帝大海報、社團傳單、桌遊盒、店長的紙條…（1024 圖集，格子位置見 CELLS）
  mok_print.png    木曜日的電影海報（虛構片名）、唱片封面、小相框、菜單
  shl_print.png    山嵐書店的分類牌、雜誌封面、平台上的書封、明信片
  aa_spines.png    書背圖集（16×4 本，每本一格；最下面一列是書頂的紙色）
字型：文泉驛正黑（系統字型 wqy-zenhei，GPL＋字型例外：產生的圖不受 GPL 約束）。所有名稱都是虛構的（D77、D115）。"""
import math, os, random, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(os.path.dirname(HERE), 'textures', 'gen')
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'


def F(sz): return ImageFont.truetype(FONT, sz)


def noise(w, h, sc, seed):
    rng = np.random.default_rng(seed); a = rng.random((h // sc + 2, w // sc + 2)).astype(np.float32)
    im = Image.fromarray((a * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC); return np.asarray(im, np.float32) / 255.0


def hexc(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


# ---------------------------------------------------------------- 格子（圖集）
# 1024 圖集切成 8×8（128 px）的格子；cell(c, r, cw, ch) → 像素框。Blender 端用 uv(c, r, cw, ch)（v 往上）。
def box(c, r, cw=1, ch=1): return (c * 128, r * 128, (c + cw) * 128, (r + ch) * 128)


def text_c(d, xy, s, f, fill):
    bb = d.textbbox((0, 0), s, font=f); d.text((xy[0] - (bb[2] - bb[0]) / 2 - bb[0], xy[1] - (bb[3] - bb[1]) / 2 - bb[1]), s, font=f, fill=fill)


def paper(im, bx, col, rng, edge=None, grain=0.05):
    x0, y0, x1, y1 = bx; w, h = x1 - x0, y1 - y0
    base = np.ones((h, w, 3), np.float32) * np.array(hexc(col), np.float32)
    n = noise(w, h, 6, rng.integers(1e6)) - 0.5; base *= (1 + n[..., None] * grain * 2)
    im.paste(Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)), (x0, y0))
    if edge: ImageDraw.Draw(im).rectangle([x0, y0, x1 - 1, y1 - 1], outline=edge, width=3)


# ---------------------------------------------------------------- 日常失速
def dof():
    rng = np.random.default_rng(617)
    # 地磚：512 px＝0.6 m（2×2 格），磚縫 4 px，淺米白 #ebe4cf、橄欖綠 #5f7b5b；每塊磚亮度微差＋細噪點＋邊緣稍暗（AO）
    S = 512; a = np.zeros((S, S, 3), np.float32); n = noise(S, S, 4, 1) - 0.5; n2 = noise(S, S, 32, 2) - 0.5
    for i in range(2):
        for j in range(2):
            col = np.array(hexc('#5f7b5b' if (i + j) % 2 else '#ebe4cf'), np.float32) * (1 + rng.uniform(-0.04, 0.04))
            a[j * 256:(j + 1) * 256, i * 256:(i + 1) * 256] = col
    a *= (1 + n[..., None] * 0.06 + n2[..., None] * 0.05)
    yy, xx = np.mgrid[0:S, 0:S]; dx = np.minimum(xx % 256, 255 - xx % 256); dy = np.minimum(yy % 256, 255 - yy % 256); dd = np.minimum(dx, dy)
    a *= (0.9 + 0.1 * np.clip(dd / 10, 0, 1))[..., None]
    grout = dd < 3; a[grout] = np.array(hexc('#b7ad98'), np.float32) * (1 + n[grout][..., None] * 0.1)
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(GEN, 'dof_checker.png'))

    im = Image.new('RGB', (1024, 1024), '#d8cfb8'); d = ImageDraw.Draw(im)
    # (0,0) 4×2：吧檯後面的黑板菜單
    bx = box(0, 0, 4, 2); paper(im, bx, '#2b302c', rng, grain=0.12); d.rectangle(bx, outline='#7a5a3a', width=10)
    d.text((bx[0] + 34, bx[1] + 22), 'DAILY OFFBEAT', font=F(34), fill='#f1ead8'); d.text((bx[0] + 300, bx[1] + 22), '日常失速', font=F(34), fill='#e8875a')
    rows = [('冰拿鐵', 'Iced Latte', '150'), ('檸檬氣泡美式', 'Lemon Sparkling', '160'), ('焙茶歐蕾', 'Hojicha Au Lait', '150'),
            ('肉桂捲', 'Cinnamon Roll', '110'), ('明太子厚片', 'Mentaiko Toast', '130'), ('今日甜點', 'Dessert of the Day', '120')]
    for k, (zh, en, p) in enumerate(rows):
        y = bx[1] + 78 + k * 28; d.text((bx[0] + 34, y), zh, font=F(20), fill='#f1ead8'); d.text((bx[0] + 210, y + 2), en, font=F(16), fill='#c9c2ae'); d.text((bx[0] + 440, y), p, font=F(20), fill='#f1ead8')
    d.line([bx[0] + 34, bx[1] + 66, bx[0] + 480, bx[1] + 66], fill='#e8875a', width=2)
    # (4,0) 2×3：首都帝大海報（紅磚系館＋大王椰子；D115）
    bx = box(4, 0, 2, 3); paper(im, bx, '#efe4c8', rng); x0, y0, x1, y1 = bx
    d.rectangle([x0 + 14, y0 + 14, x1 - 14, y1 - 14], outline='#3f5a46', width=4)
    text_c(d, ((x0 + x1) / 2, y0 + 52), '首都帝大', F(40), '#33483a'); text_c(d, ((x0 + x1) / 2, y0 + 92), 'SHOUDU DIDA UNIVERSITY', F(13), '#33483a')
    d.rectangle([x0 + 30, y0 + 120, x1 - 30, y1 - 40], fill='#bcd6d6')
    d.rectangle([x0 + 30, y1 - 120, x1 - 30, y1 - 40], fill='#8fae6e')
    cx = (x0 + x1) // 2; d.rectangle([cx - 70, y0 + 210, cx + 70, y1 - 110], fill='#b0553e'); d.polygon([(cx - 80, y0 + 212), (cx, y0 + 175), (cx + 80, y0 + 212)], fill='#8a3f2e')
    d.rectangle([cx - 14, y0 + 140, cx + 14, y0 + 212], fill='#b0553e'); d.polygon([(cx - 18, y0 + 142), (cx, y0 + 118), (cx + 18, y0 + 142)], fill='#8a3f2e')
    for k in range(4):
        for j in range(2): d.rectangle([cx - 58 + k * 32, y0 + 228 + j * 40, cx - 42 + k * 32, y0 + 252 + j * 40], fill='#efe4c8')
    d.rectangle([cx - 14, y1 - 160, cx + 14, y1 - 110], fill='#5a3a2a')
    for px in (x0 + 52, x1 - 52):
        d.line([px, y1 - 60, px + 4, y0 + 170], fill='#c8bfa8', width=6)
        for k in range(7): a_ = k / 7 * math.pi * 2; d.line([px + 4, y0 + 170, px + 4 + 34 * math.cos(a_), y0 + 170 + 18 * math.sin(a_) + 6], fill='#4f7a43', width=5)
    # (6,0) 2×1 ×3 列：社團傳單（遊戲裡的社團名；AA_485）
    clubs = [('辯論社', '#f2c9c4', '#7a2f2a', '每週二 19:00 博思 201'), ('攝影社', '#cfe0ef', '#25496b', '週四 外拍集合 晨思鐘'), ('合唱團', '#f6e7b4', '#6b5418', '招生中 不用看譜'),
             ('法律服務社', '#d9ead3', '#2f5a33', '週三 B館 法律諮詢'), ('吉他社', '#f4d7b8', '#7a4318', 'B館多功能教室'), ('登山社', '#dfe7cf', '#425a26', '行前會 普通 201'),
             ('熱舞社', '#e8d3ef', '#5a2a6b', '新生舞展 報名'), ('校內講座', '#fbeec9', '#7a5a18', '週三 15:30 法圖')]
    for k, (nm, bg, fg, sub) in enumerate(clubs):
        c, r = 6 + (k % 2), 0 + k // 2; bx = box(c, r); paper(im, bx, bg, rng); x0, y0, x1, y1 = bx
        d.rectangle([x0 + 4, y0 + 4, x1 - 5, y1 - 5], outline=fg, width=2)
        text_c(d, ((x0 + x1) / 2, y0 + 34), nm, F(24 if len(nm) <= 3 else 19), fg)
        for j in range(3): d.line([x0 + 16, y0 + 64 + j * 12, x1 - 16 - (j * 17) % 30, y0 + 64 + j * 12], fill=fg, width=2)
        text_c(d, ((x0 + x1) / 2, y1 - 20), sub, F(10), fg)
        d.ellipse([x0 + 56, y0 + 2, x0 + 72, y0 + 14], fill='#c94f45')   # 圖釘
    # (0,2) 1×1：店長的紙條、(1,2) 便利貼、(2,2) 唱片海報、(3,2) 植物盆貼紙
    bx = box(0, 2); paper(im, bx, '#f6f1e3', rng); text_c(d, ((bx[0] + bx[2]) / 2, bx[1] + 44), '店長', F(30), '#3a3a3a'); text_c(d, ((bx[0] + bx[2]) / 2, bx[1] + 88), '請勿打擾', F(22), '#3a3a3a')
    bx = box(1, 2)
    for k, col in enumerate(('#f7e27a', '#f5b3c0', '#a8dcef', '#c6e9a5')):
        x0, y0 = bx[0] + (k % 2) * 64, bx[1] + (k // 2) * 64; paper(im, (x0, y0, x0 + 64, y0 + 64), col, rng)
        for j in range(3): d.line([x0 + 8, y0 + 16 + j * 13, x0 + 52 - j * 6, y0 + 16 + j * 13], fill='#4a4a4a', width=2)
    bx = box(2, 2); paper(im, bx, '#e8875a', rng); x0, y0, x1, y1 = bx; d.ellipse([x0 + 20, y0 + 20, x1 - 20, y1 - 20], fill='#1d1d1d')
    d.ellipse([x0 + 52, y0 + 52, x1 - 52, y1 - 52], fill='#f1d27a'); d.ellipse([x0 + 61, y0 + 61, x1 - 61, y1 - 61], fill='#1d1d1d')
    # (0,3) 4×1：桌遊盒的盒蓋（四盒，虛構名稱）
    games = [('拍桌大作戰', '#d24b3e'), ('貓咪快遞', '#3d7a8c'), ('巷口夜市', '#e3a73a'), ('島嶼建築師', '#5a8a4a')]
    for k, (nm, col) in enumerate(games):
        x0 = k * 128; bx = (x0, 384, x0 + 128, 512); paper(im, bx, col, rng, grain=0.03)
        d.rectangle([x0 + 8, 392, x0 + 119, 503], outline='#f6f0e0', width=3)
        d.ellipse([x0 + 34, 404, x0 + 94, 464], fill='#f6f0e0'); d.ellipse([x0 + 46, 416, x0 + 82, 452], fill=col)
        text_c(d, (x0 + 64, 484), nm, F(17), '#f6f0e0')
    # (4,3) 4×1：盒子側面的條紋（四種顏色）
    for k, (_, col) in enumerate(games):
        x0 = 512 + k * 128; paper(im, (x0, 384, x0 + 128, 512), col, rng, grain=0.03)
        d.rectangle([x0, 430, x0 + 128, 466], fill='#f6f0e0')
    # (0,4) 2×1：「今日推薦」小黑板（A 字立牌的面）
    bx = box(0, 4, 2, 1); paper(im, bx, '#2b302c', rng, grain=0.12); x0, y0, x1, y1 = bx
    text_c(d, ((x0 + x1) / 2, y0 + 30), '今日推薦', F(28), '#f1ead8'); text_c(d, ((x0 + x1) / 2, y0 + 72), '肉桂捲＋冰拿鐵　220', F(18), '#e8875a'); text_c(d, ((x0 + x1) / 2, y0 + 102), '桌遊借用請洽吧檯', F(15), '#c9c2ae')
    # (2,4) 2×2：軟木板底紋
    bx = box(2, 4, 2, 2); x0, y0, x1, y1 = bx; w, h = x1 - x0, y1 - y0
    cork = np.ones((h, w, 3), np.float32) * np.array(hexc('#b88a5a'), np.float32); nn = noise(w, h, 2, 9) - 0.5; cork *= (1 + nn[..., None] * 0.35)
    im.paste(Image.fromarray(np.clip(cork, 0, 255).astype(np.uint8)), (x0, y0))
    # (4,4) 2×2：復古唱片／演唱會海報（虛構）
    bx = box(4, 4, 2, 2); paper(im, bx, '#f0d9a8', rng); x0, y0, x1, y1 = bx
    d.rectangle([x0 + 18, y0 + 18, x1 - 18, y1 - 70], fill='#3d7a8c'); d.ellipse([x0 + 60, y0 + 50, x1 - 60, y1 - 110], fill='#e8875a')
    text_c(d, ((x0 + x1) / 2, y1 - 46), '夏夜唱片行', F(30), '#33483a'); text_c(d, ((x0 + x1) / 2, y1 - 16), 'SUMMER NIGHT RECORDS 1994', F(12), '#33483a')
    # (6,4) 2×2：溫州街手繪地圖（虛構店名）
    bx = box(6, 4, 2, 2); paper(im, bx, '#f3ecd8', rng); x0, y0, x1, y1 = bx
    d.line([x0 + 30, y0 + 40, x1 - 30, y1 - 40], fill='#a59a80', width=14); d.line([x0 + 40, y1 - 50, x1 - 40, y0 + 70], fill='#a59a80', width=10)
    for k, (nm, px, py) in enumerate((('日常失速', 0.25, 0.25), ('木曜日', 0.6, 0.45), ('兩點半', 0.75, 0.75))):
        cx, cy = x0 + px * (x1 - x0), y0 + py * (y1 - y0); d.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill='#e8875a'); d.text((cx + 12, cy - 10), nm, font=F(16), fill='#33483a')
    text_c(d, ((x0 + x1) / 2, y1 - 20), '溫州街散步地圖', F(18), '#33483a')
    # (0,5) 2×1：吧檯磁磚前的木質店名小牌（無字：木紋）
    im = im.filter(ImageFilter.SMOOTH)
    im.save(os.path.join(GEN, 'dof_print.png'))


# ---------------------------------------------------------------- 木曜日
def mok():
    rng = np.random.default_rng(618)
    im = Image.new('RGB', (1024, 1024), '#e8dcc4'); d = ImageDraw.Draw(im)
    # (0,0) 2×3：電影海報《夏の残光》（參考圖 v2 的虛構片名）
    bx = box(0, 0, 2, 3); paper(im, bx, '#e9e1cf', rng); x0, y0, x1, y1 = bx
    d.rectangle([x0 + 16, y0 + 110, x1 - 16, y1 - 70], fill='#9fb4b8'); d.rectangle([x0 + 16, y1 - 150, x1 - 16, y1 - 70], fill='#6f8890')
    d.ellipse([x0 + 90, y0 + 170, x0 + 170, y0 + 260], fill='#3a3530'); d.rectangle([x0 + 70, y0 + 250, x0 + 190, y1 - 70], fill='#c8c0b2')
    d.text((x0 + 22, y0 + 18), '夏の残光', font=F(46), fill='#2a2a2a'); d.text((x0 + 26, y0 + 74), 'なつのざんこう', font=F(16), fill='#2a2a2a')
    for j in range(3): d.line([x0 + 26, y1 - 52 + j * 14, x1 - 60, y1 - 52 + j * 14], fill='#5a5a5a', width=2)
    # (2,0) 2×3：電影海報《雨後的車站》
    bx = box(2, 0, 2, 3); paper(im, bx, '#e3dccc', rng); x0, y0, x1, y1 = bx
    d.rectangle([x0 + 16, y0 + 100, x1 - 16, y1 - 70], fill='#5f6a6a'); d.rectangle([x0 + 16, y1 - 160, x1 - 16, y1 - 70], fill='#3f4747')
    for k in range(6): d.line([x0 + 30 + k * 34, y1 - 70, x0 + 120, y1 - 200], fill='#8f9a98', width=2)
    d.rectangle([x1 - 90, y0 + 170, x1 - 40, y1 - 160], fill='#2f3434'); d.ellipse([x1 - 72, y0 + 150, x1 - 58, y0 + 164], fill='#f0d28a')
    text_c(d, ((x0 + x1) / 2, y0 + 44), '雨後的車站', F(38), '#2a2a2a'); text_c(d, ((x0 + x1) / 2, y0 + 82), 'あめあがりの駅', F(15), '#2a2a2a')
    for j in range(3): d.line([x0 + 26, y1 - 52 + j * 14, x1 - 60, y1 - 52 + j * 14], fill='#5a5a5a', width=2)
    # (4,0) 4×1：黑膠唱片封面 4 張（無字的色塊設計）
    covers = [('#c9563f', '#f0d9a8'), ('#2f4a5a', '#d8c7a0'), ('#e3b448', '#3a3a3a'), ('#6b7f5a', '#efe4cf')]
    for k, (a_, b_) in enumerate(covers):
        x0 = 512 + k * 128; paper(im, (x0, 0, x0 + 128, 128), a_, rng, grain=0.03)
        if k % 2: d.ellipse([x0 + 24, 24, x0 + 104, 104], fill=b_)
        else: d.rectangle([x0 + 16, 70, x0 + 112, 112], fill=b_)
    # (4,1) 2×1：手寫菜單卡
    bx = box(4, 1, 2, 1); paper(im, bx, '#f4eedf', rng); x0, y0, x1, y1 = bx
    text_c(d, ((x0 + x1) / 2, y0 + 22), '木曜日', F(24), '#4a3424')
    for k, s in enumerate(('焙茶拿鐵　150', '焦糖布丁　120', '巴斯克乳酪蛋糕　140')): d.text((x0 + 40, y0 + 46 + k * 24), s, font=F(17), fill='#4a3424')
    # (6,1) 2×1：小相框裡的黑白照片 ×2
    for k in range(2):
        x0 = 768 + k * 128; paper(im, (x0, 128, x0 + 128, 256), '#d9d4c8', rng)
        d.rectangle([x0 + 14, 142, x0 + 114, 242], fill='#7d7a74'); d.rectangle([x0 + 14, 200, x0 + 114, 242], fill='#55534f')
        d.ellipse([x0 + 50 + k * 10, 160, x0 + 80 + k * 10, 196], fill='#3e3c39')
    # (4,2) 4×1：老樹窗景（傍晚的逆光樹影；窗外卡片，遠一點的公寓）
    bx = box(4, 2, 4, 2); x0, y0, x1, y1 = bx; w, h = x1 - x0, y1 - y0
    yy = np.linspace(0, 1, h)[:, None, None]; sky = np.array(hexc('#f4e6c4'), np.float32) * (1 - yy) + np.array(hexc('#e7d2a6'), np.float32) * yy
    sky = np.repeat(sky, w, axis=1); im.paste(Image.fromarray(sky.astype(np.uint8)), (x0, y0))
    d.rectangle([x0, y0 + 150, x1, y1], fill='#c9bba0')
    for k in range(5): d.rectangle([x0 + 20 + k * 100, y0 + 120, x0 + 90 + k * 100, y1], fill=('#d6c7aa', '#cdbd9e')[k % 2])
    for k in range(5):
        for j in range(3): d.rectangle([x0 + 34 + k * 100, y0 + 140 + j * 34, x0 + 74 + k * 100, y0 + 160 + j * 34], fill='#a8987a')
    tr = Image.new('RGBA', (w, h), (0, 0, 0, 0)); td = ImageDraw.Draw(tr); r_ = random.Random(3)
    td.polygon([(200, h), (230, 120), (250, 120), (290, h)], fill=(92, 74, 52, 255)); td.line([(240, 150), (120, 60)], fill=(92, 74, 52, 255), width=14); td.line([(245, 140), (390, 40)], fill=(92, 74, 52, 255), width=12)
    for (a_, b_, wd) in (((240, 150), (60, 40), 9), ((245, 140), (440, 20), 9), ((150, 90), (110, 150), 5), ((330, 90), (470, 120), 5), ((300, 60), (260, 10), 4)):
        td.line([a_, b_], fill=(92, 74, 52, 255), width=wd)
    for k in range(5200):   # 小一點的葉子、多一點：遠看是一片樹冠，不是幾顆綠球
        cx = r_.gauss(260, 170); cy = r_.gauss(85, 60); rr = r_.uniform(2.5, 6.5)
        g = r_.choice([(86, 112, 58), (110, 138, 70), (140, 160, 84), (74, 96, 50), (168, 176, 96), (62, 84, 44)])
        if r_.random() < 0.85: td.ellipse([cx - rr * 1.4, cy - rr, cx + rr * 1.4, cy + rr], fill=(*g, 255))
    im.paste(tr, (x0, y0), tr)
    # (0,3) 4×1：深色木的書櫃小抽屜名牌、唱片機面板（細節）
    bx = box(0, 3, 2, 1); paper(im, bx, '#3a2c22', rng, grain=0.06); x0, y0, x1, y1 = bx
    d.ellipse([x0 + 30, y0 + 20, x0 + 118, y0 + 108], fill='#1b1b1b'); d.ellipse([x0 + 64, y0 + 54, x0 + 84, y0 + 74], fill='#c9563f')
    d.rectangle([x0 + 150, y0 + 40, x0 + 230, y0 + 60], fill='#b8a27a'); d.ellipse([x0 + 160, y0 + 80, x0 + 180, y0 + 100], fill='#b8a27a'); d.ellipse([x0 + 200, y0 + 80, x0 + 220, y0 + 100], fill='#b8a27a')
    # (2,3) 1×1：「本店無插座」小卡
    bx = box(2, 3); paper(im, bx, '#f4eedf', rng); text_c(d, ((bx[0] + bx[2]) / 2, bx[1] + 46), '本店', F(24), '#4a3424'); text_c(d, ((bx[0] + bx[2]) / 2, bx[1] + 84), '無插座', F(24), '#4a3424')
    # (0,4) 4×2：地毯（舊的波斯風格：磚紅底、墨綠邊、米色花紋；有點褪色）
    bx = box(0, 4, 4, 2); x0, y0, x1, y1 = bx; w, h = x1 - x0, y1 - y0
    rug = Image.new('RGB', (w, h), '#8a4a3a'); rd = ImageDraw.Draw(rug)
    rd.rectangle([0, 0, w - 1, h - 1], outline='#3f5a46', width=22); rd.rectangle([26, 26, w - 27, h - 27], outline='#d8c49a', width=6)
    for k in range(0, w, 28): rd.polygon([(k, 8), (k + 14, 1), (k + 28, 8), (k + 14, 15)], fill='#d8c49a'); rd.polygon([(k, h - 9), (k + 14, h - 2), (k + 28, h - 9), (k + 14, h - 16)], fill='#d8c49a')
    cx, cy = w / 2, h / 2
    for rr, col in ((92, '#3f5a46'), (74, '#d8c49a'), (58, '#8a4a3a'), (40, '#c98a5a'), (18, '#3f5a46')): rd.polygon([(cx - rr * 1.8, cy), (cx, cy - rr), (cx + rr * 1.8, cy), (cx, cy + rr)], fill=col)
    for (qx, qy) in ((0.2, 0.3), (0.8, 0.3), (0.2, 0.7), (0.8, 0.7)):
        px_, py_ = qx * w, qy * h
        for rr, col in ((22, '#d8c49a'), (12, '#3f5a46')): rd.ellipse([px_ - rr * 1.5, py_ - rr, px_ + rr * 1.5, py_ + rr], fill=col)
    a = np.asarray(rug, np.float32); nn = noise(w, h, 3, 31) - 0.5; nn2 = noise(w, h, 40, 32) - 0.5
    a = a * (1 + nn[..., None] * 0.22 + nn2[..., None] * 0.12); a = a * 0.85 + np.array(hexc('#c8b8a0'), np.float32) * 0.15   # 毛絨的雜點、褪色
    im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), (x0, y0))
    im = im.filter(ImageFilter.SMOOTH)
    im.save(os.path.join(GEN, 'mok_print.png'))


# ---------------------------------------------------------------- 山嵐書店
def shl():
    rng = np.random.default_rng(613)
    im = Image.new('RGB', (1024, 1024), '#efe7d6'); d = ImageDraw.Draw(im)
    # (0,0)～：分類吊牌 8 張（2×1 格；木牌底、深色字）
    cats = ['新書', '雜誌', '文具選物', '人文', '文學', '藝術', '童書', '法律']
    for k, s in enumerate(cats):
        c, r = (k % 4) * 2, k // 4; bx = box(c, r, 2, 1); paper(im, bx, '#d9bf96', rng, grain=0.08); x0, y0, x1, y1 = bx
        d.rectangle([x0 + 6, y0 + 6, x1 - 7, y1 - 7], outline='#8a6a44', width=3); text_c(d, ((x0 + x1) / 2, (y0 + y1) / 2 - 8), s, F(46), '#3a2c22')
        text_c(d, ((x0 + x1) / 2, y1 - 22), ('NEW', 'MAGAZINE', 'STATIONERY', 'HUMANITIES', 'LITERATURE', 'ART', 'KIDS', 'LAW')[k], F(13), '#5a4630')
    # (0,2) 8×2：雜誌封面 16 張（64×128 的直式；色塊＋大標題＋人形／幾何）
    mags = ['#d24b3e', '#2f4a5a', '#e3b448', '#6b7f5a', '#f0d9a8', '#3d7a8c', '#c98a6a', '#8c3b47', '#4a6c8c', '#e8c8b8', '#5a8a4a', '#262626', '#b8462e', '#d9a441', '#7a6a9a', '#e4d4b4']
    for k, col in enumerate(mags):
        x0, y0 = (k % 16) * 64, 256 + (k // 16) * 256; w, h = 64, 256
        paper(im, (x0, y0, x0 + w, y0 + h // 2), col, rng, grain=0.03)
        fg = '#f6f0e0' if k not in (4, 9, 15) else '#2a2a2a'
        d.text((x0 + 5, y0 + 4), ('週', '光', '旅', '食', '居', '城', '海', '讀', '山', '花', '島', '夜', '風', '雨', '季', '紙')[k], font=F(26), fill=fg)
        (d.ellipse([x0 + 14, y0 + 44, x0 + 50, y0 + 80], fill=fg) if k % 3 else None); d.rectangle([x0 + 10, y0 + 86, x0 + 54, y0 + 120], fill=fg)
    # 雜誌下半格 (0,3) 用來放平台上的書封：16 張（64×128）
    for k in range(16):
        x0, y0 = k * 64, 384; col = ['#e8e0cc', '#f4f1ea', '#c9b48a', '#a8c0c8', '#e0c8c0', '#d8d8c8', '#b8c8a8', '#f0e0b0'][k % 8]
        paper(im, (x0, y0, x0 + 64, y0 + 128), col, rng, grain=0.03)
        d.rectangle([x0 + 8, y0 + 60, x0 + 56, y0 + 104], fill=['#6b7f5a', '#3d7a8c', '#c9563f', '#2f4a5a', '#8c3b47', '#d9a441', '#4a6c8c', '#5a3a21'][(k * 3) % 8])
        for j in range(2): d.line([x0 + 10, y0 + 14 + j * 12, x0 + 54 - j * 14, y0 + 14 + j * 12], fill='#3a3a3a', width=3)
    # (0,4) 4×2：大海報「山嵐書店 讀書節」（虛構）
    bx = box(0, 4, 4, 2); paper(im, bx, '#e9dcc0', rng); x0, y0, x1, y1 = bx
    for k in range(4): d.polygon([(x0 + k * 140 - 40, y1 - 20), (x0 + k * 140 + 60, y0 + 90 + (k % 2) * 30), (x0 + k * 140 + 170, y1 - 20)], fill=('#9fb49a', '#7f9a82', '#b5c4a8', '#8aa38c')[k])
    text_c(d, ((x0 + x1) / 2, y0 + 44), '山嵐書店　秋日讀書節', F(36), '#3a2c22'); text_c(d, ((x0 + x1) / 2, y1 - 36), '每週六 19:00 二樓 作家座談', F(18), '#3a2c22')
    # (4,4) 4×1：明信片架的明信片 8 張
    for k in range(8):
        x0, y0 = 512 + k * 64, 512; paper(im, (x0, y0, x0 + 64, y0 + 128), '#f4efe2', rng)
        d.rectangle([x0 + 6, y0 + 6, x0 + 58, y0 + 86], fill=['#9fb4b8', '#d9a441', '#6b7f5a', '#c98a6a', '#4a6c8c', '#e8c8b8', '#8c3b47', '#b8c8a8'][k])
    # (4,5) 4×1：文具（紙膠帶、筆記本封面）色票
    for k in range(8):
        x0, y0 = 512 + k * 64, 640; col = ['#e8b4a0', '#a8c8d8', '#f0d890', '#b8d0a0', '#d8b8d8', '#f4f1ea', '#c9a27a', '#6b7f5a'][k]
        paper(im, (x0, y0, x0 + 64, y0 + 128), col, rng, grain=0.03)
        for j in range(4): d.line([x0, y0 + 20 + j * 28, x0 + 64, y0 + 30 + j * 28], fill='#ffffff', width=3)
    # (0,6) 8×2：窗外的新生南路街景（路樹、對面騎樓、機車）
    bx = box(0, 6, 8, 2); x0, y0, x1, y1 = bx; w, h = x1 - x0, y1 - y0
    yy = np.linspace(0, 1, h)[:, None, None]; sky = np.array(hexc('#dfe8ea'), np.float32) * (1 - yy) + np.array(hexc('#eef0e6'), np.float32) * yy
    im.paste(Image.fromarray(np.repeat(sky, w, axis=1).astype(np.uint8)), (x0, y0))
    d.rectangle([x0, y0 + 40, x1, y0 + 200], fill='#cfc8bc')
    for k in range(9):
        for j in range(2): d.rectangle([x0 + 20 + k * 112, y0 + 60 + j * 50, x0 + 90 + k * 112, y0 + 90 + j * 50], fill='#9aa4a6')
    d.rectangle([x0, y0 + 160, x1, y0 + 205], fill='#7f776c')
    for k in range(10): d.rectangle([x0 + 10 + k * 104, y0 + 170, x0 + 90 + k * 104, y0 + 205], fill=('#b8a888', '#d8c8a8', '#9a8a70')[k % 3])
    d.rectangle([x0, y0 + 205, x1, y1], fill='#8a8a86'); d.rectangle([x0, y0 + 205, x1, y0 + 214], fill='#b9b4aa')
    r_ = random.Random(7)
    for k in range(4):
        tx = x0 + 120 + k * 260; d.polygon([(tx - 10, y1), (tx - 4, y0 + 90), (tx + 4, y0 + 90), (tx + 12, y1)], fill='#6a5a48')
        for j in range(380):
            cx = r_.gauss(tx, 90); cy = max(y0 + 14, r_.gauss(y0 + 60, 45)); rr = r_.uniform(5, 13)
            d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=r_.choice(['#6e8f4e', '#86a35c', '#5a7a42', '#9cb46c', '#4e6a3a']))
    im = im.filter(ImageFilter.SMOOTH)
    im.save(os.path.join(GEN, 'shl_print.png'))


def spines():
    """書背 16 欄 × 4 列（每格 64×224）＋最下面 32 px 的書頂紙色；每本：底色、上下色帶、書名的細線或短直排字"""
    rng = random.Random(1103); W, H = 1024, 1024; im = Image.new('RGB', (W, H), '#e9e2d0'); d = ImageDraw.Draw(im)
    pal = ['#7b2d26', '#2f4a3a', '#1f2e45', '#c9b48a', '#e8e0cc', '#8c3b47', '#3e5a48', '#d9a441', '#5c3a21', '#6b4a7a', '#2b2b2b', '#b8462e', '#4a6c8c', '#a39a86',
           '#e4d4b4', '#7a6a5a', '#f2efe6', '#9fb4b8', '#d8b8a8', '#6f8a5e']
    law = ['民法總則', '刑法總則', '憲法', '行政法', '民事訴訟法', '刑事訴訟法', '債編總論', '物權法', '公司法', '親屬繼承', '國際私法', '法學緒論', '六法全書', '勞動法', '智慧財產', '稅法']
    for r in range(4):
        for c in range(16):
            x0, y0 = c * 64, r * 248; col = rng.choice(pal); dark = sum(hexc(col)) < 380
            a = np.ones((248, 64, 3), np.float32) * np.array(hexc(col), np.float32); n = noise(64, 248, 4, r * 16 + c) - 0.5; a *= (1 + n[..., None] * 0.08)
            a[:, :4] *= 0.8; a[:, -4:] *= 0.8
            im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), (x0, y0))
            fg = '#efe6cf' if dark else '#2a2a2a'
            if rng.random() < 0.6: d.rectangle([x0 + 4, y0 + 18, x0 + 59, y0 + 24], fill=fg); d.rectangle([x0 + 4, y0 + 222, x0 + 59, y0 + 228], fill=fg)
            if r == 3:   # 第 4 列＝法律書（書名直排）
                t = law[c]
                for k, ch in enumerate(t[:5]): text_c(d, (x0 + 32, y0 + 50 + k * 32), ch, F(26), fg)
            else:
                ln = rng.randint(3, 6)
                for k in range(ln): d.rectangle([x0 + 26, y0 + 44 + k * 22, x0 + 38, y0 + 58 + k * 22], fill=fg)
            d.rectangle([x0 + 20, y0 + 200, x0 + 44, y0 + 212], fill=fg)
    d.rectangle([0, 992, W, H], fill='#ece4d2')
    for x in range(0, W, 3): d.line([x, 992, x, H], fill=('#e2d9c4', '#f2ead8')[x % 2])
    im.save(os.path.join(GEN, 'aa_spines.png'))


def bookrows(fn, bg, seed, law=False):
    """書架上「一排書」的圖集：1024×1024，8 列、每列 128 px＝書架一層 0.3 m 高、整列寬 1024 px＝0.9 m（橫向 1138 px/m、直向 427 px/m：畫的時候照比例）。
    第 0～6 列：高矮、厚薄、顏色不同的書，偶爾一本斜靠；書的上方是書架背板的陰影色 bg。law＝第 6 列改成法律書（直排書名）。第 7 列：書頂的紙色。"""
    rng = random.Random(seed); im = Image.new('RGB', (1024, 1024), bg); d = ImageDraw.Draw(im)
    pal = ['#7b2d26', '#2f4a3a', '#1f2e45', '#c9b48a', '#e8e0cc', '#8c3b47', '#3e5a48', '#d9a441', '#5c3a21', '#6b4a7a', '#2b2b2b', '#b8462e', '#4a6c8c', '#a39a86',
           '#e4d4b4', '#7a6a5a', '#f2efe6', '#9fb4b8', '#d8b8a8', '#6f8a5e', '#c96a4a', '#efe6cf']
    lawn = ['民法總則', '刑法總則', '憲法', '行政法', '民事訴訟法', '刑事訴訟法', '債編總論', '物權', '公司法', '親屬繼承', '國際私法', '法學緒論', '六法全書', '勞動法', '智慧財產權', '稅法', '刑法分則', '強制執行', '票據法', '保險法']
    bgc = np.array(hexc(bg), np.float32)
    for r in range(7):
        y0 = r * 128; x = 0
        sh = np.linspace(0.55, 1.0, 128)[:, None]   # 背板：越往上越暗（上一層層板的陰影）
        im.paste(Image.fromarray(np.clip(np.repeat(sh, 1024, 1)[..., None] * bgc, 0, 255).astype(np.uint8)), (0, y0))
        lawrow = law and r == 6
        while x < 1024:
            if rng.random() < 0.025: x += rng.randint(10, 40); continue
            w = rng.randint(30, 48) if lawrow else rng.choice([rng.randint(14, 26), rng.randint(22, 40), rng.randint(36, 56)])
            h = rng.randint(96, 122) if lawrow else rng.randint(70, 124)
            col = rng.choice(['#7b2d26', '#1f2e45', '#2f4a3a', '#8c3b47', '#5c3a21', '#d9a441', '#4a6c8c', '#e8e0cc']) if lawrow else rng.choice(pal)
            a = np.ones((h, w, 3), np.float32) * np.array(hexc(col), np.float32); n_ = noise(w, h, 3, rng.randint(0, 99999)) - 0.5
            a *= (1 + n_[..., None] * 0.07); a[:, :2] *= 0.72; a[:, -2:] *= 0.8; a[:3] *= 0.9
            im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), (x, y0 + 128 - h))
            dark = sum(hexc(col)) < 400; fg = '#efe6cf' if dark else '#2a2a2a'
            if rng.random() < 0.55: d.rectangle([x + 2, y0 + 128 - h + 6, x + w - 3, y0 + 128 - h + 9], fill=fg); d.rectangle([x + 2, y0 + 120, x + w - 3, y0 + 123], fill=fg)
            if lawrow:
                t = rng.choice(lawn); gl = Image.new('RGB', (w, 30 * len(t)), col); gd = ImageDraw.Draw(gl)
                for k, ch in enumerate(t): text_c(gd, (w / 2, 15 + k * 30), ch, F(min(26, w - 6)), fg)
                gl = gl.resize((w, max(8, int(gl.size[1] / 2.67))), Image.LANCZOS); im.paste(gl, (x, y0 + 128 - h + 14))
            else:
                for k in range(rng.randint(2, 5)): d.rectangle([x + w // 2 - max(2, w // 6), y0 + 128 - h + 16 + k * 9, x + w // 2 + max(2, w // 6), y0 + 128 - h + 21 + k * 9], fill=fg)
            x += w + 1
    y0 = 7 * 128   # 書頂：紙色的直條紋（頁緣）＋一本一本的間隙
    d.rectangle([0, y0, 1024, 1024], fill='#e6dcc6'); x = 0
    while x < 1024:
        w = rng.randint(14, 50); d.rectangle([x, y0, x + w - 1, 1024], fill=rng.choice(['#ece3cf', '#e2d7bf', '#f1e9d8', '#d9cdb2'])); d.line([x + w - 1, y0, x + w - 1, 1024], fill='#8a7a60'); x += w
    im.save(os.path.join(GEN, fn))


if __name__ == '__main__':
    os.makedirs(GEN, exist_ok=True)
    w = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if w in ('dof', 'all'): dof()
    if w in ('mok', 'all'): mok()
    if w in ('shl', 'all'): shl()
    if w in ('mok', 'all'): bookrows('mok_bookrows.png', '#3b2a1f', 618)
    if w in ('shl', 'all'): bookrows('shl_bookrows.png', '#a88a62', 613, law=True)
    print('ok', w)
