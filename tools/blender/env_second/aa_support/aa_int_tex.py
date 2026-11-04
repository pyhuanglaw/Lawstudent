"""日常失速、木曜日、山嵐書店室內用的自製貼圖（PIL／numpy；系統 python3）。AA 子代理 2026-11-03。
用法：python3 tools/blender/env_second/aa_support/aa_int_tex.py [dof|mok|shl|yej|aok|all]
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
            col = np.array(hexc('#aab5a1' if (i + j) % 2 else '#ece6d4'), np.float32) * (1 + rng.uniform(-0.04, 0.04))   # v3c：奶油白＋淺鼠尾草綠、對比低（LAWWW2 第三輪）；v3 #768470／#e7e0cd；v2 #5f7b5b／#ebe4cf
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
    # v3：(6,3)、(7,3) 那兩張被盒子側面蓋掉了，傳單另外放在第 6、7 列（16 張）；(0,5) 2×1 是佈告欄的標題牌
    clubs2 = [('籃球社', '#f6c58a', '#7a3a12', '新生盃 報名中'), ('熱舞社', '#e8c3ef', '#5a2a6b', '週五 學活 B1'), ('桌遊社', '#c9e6e0', '#24585a', '每週四 日常失速'),
              ('電影社', '#3a3a46', '#f1d27a', '週二 放映 博思 101'), ('書畫社', '#f3ead2', '#3a2a1a', '新生 免費體驗'), ('系學會', '#f2c9c4', '#7a2f2a', '法律系 迎新宿營'),
              ('排球社', '#cfe7f6', '#1f4e6b', '週一 新體 練球'), ('羽球社', '#e4f0c8', '#3f5a1a', '週三 新體 三樓'), ('志工隊', '#fbe0a8', '#6b4a12', '寒假 偏鄉 服務隊'),
              ('天文社', '#20304a', '#f6e7b4', '觀星 映月湖'), ('動漫社', '#f7d0e0', '#7a2a4a', '社課 普通 102'), ('咖啡社', '#e2cdb0', '#4a2a14', '手沖 入門課'),
              ('戲劇社', '#2e2a2a', '#e8875a', '期末公演 售票'), ('管樂社', '#f6efc2', '#5a4a12', '招生 樂器可借'), ('吉他社', '#f4d7b8', '#7a4318', '成果發表 週六'), ('登山社', '#dfe7cf', '#425a26', '合歡山 行前會')]
    for k, (nm, bg, fg, sub) in enumerate(clubs2):
        c, r = k % 8, 6 + k // 8; bx = box(c, r); paper(im, bx, bg, rng); x0, y0, x1, y1 = bx
        if k % 3 == 0: d.rectangle([x0, y0, x1, y0 + 34], fill=fg); text_c(d, ((x0 + x1) / 2, y0 + 17), nm, F(22), bg)   # 色帶標題
        else: d.rectangle([x0 + 5, y0 + 5, x1 - 6, y1 - 6], outline=fg, width=2); text_c(d, ((x0 + x1) / 2, y0 + 30), nm, F(24), fg)
        sh_ = k % 4
        if sh_ == 0: d.ellipse([x0 + 40, y0 + 46, x1 - 40, y0 + 94], outline=fg, width=4)
        elif sh_ == 1: d.polygon([(x0 + 64, y0 + 44), (x0 + 92, y0 + 94), (x0 + 36, y0 + 94)], fill=fg)
        elif sh_ == 2: d.rectangle([x0 + 34, y0 + 50, x1 - 34, y0 + 92], fill=fg)
        else:
            for j in range(3): d.line([x0 + 16, y0 + 56 + j * 12, x1 - 16 - (j * 17) % 30, y0 + 56 + j * 12], fill=fg, width=3)
        text_c(d, ((x0 + x1) / 2, y1 - 18), sub, F(11), fg)
    bx = box(0, 5, 2, 1); paper(im, bx, '#f6efdc', rng); x0, y0, x1, y1 = bx
    d.rectangle([x0 + 6, y0 + 6, x1 - 7, y1 - 7], outline='#33483a', width=3)
    text_c(d, ((x0 + x1) / 2, y0 + 46), '首都帝大學生社團＆活動', F(19), '#33483a'); text_c(d, ((x0 + x1) / 2, y0 + 84), 'SHOUDU DIDA CLUBS & EVENTS', F(13), '#7a4318')
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


def mok_view():
    """v2 窗景 mok_view.png（2048×1024；窗外卡片 14 × 6.5 m：x −6.5～7.5、y −1～5.5，離窗 2.5 m）：傍晚、逆光的老樹（一片一片的小葉子、
    葉縫透出來的光）、樹後面對面的老公寓（磁磚、鐵窗、幾扇亮燈的窗）。v1 是 512×256 的格子、葉子一團一團，近看像色塊。"""
    W, H = 2048, 1024; rng = random.Random(1103); np_r = np.random.default_rng(1103)
    px_m = W / 14.0; py_m = H / 6.5
    def X(x): return (x + 6.5) * px_m
    def Y(y): return (5.5 - y) * py_m
    sun = np.array([X(-3.5), Y(4.6)])
    # 1. 天空：暖色漸層＋太陽附近的光暈
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    t = yy / H; sky = np.array(hexc('#fbe7b8'), np.float32) * (1 - t[..., None]) + np.array(hexc('#f0d29c'), np.float32) * t[..., None]
    dd = np.hypot(xx - sun[0], yy - sun[1]); sky += (np.exp(-dd / 260.0)[..., None] * np.array([50, 40, 22], np.float32))
    im = Image.fromarray(np.clip(sky, 0, 255).astype(np.uint8)).convert('RGBA')
    # 2. 對面的老公寓（樹後 8 m；陰影裡的暖灰，幾扇亮燈的窗、鐵窗、冷氣）
    bl = Image.new('RGBA', (W, H), (0, 0, 0, 0)); bd = ImageDraw.Draw(bl); x = -40
    while x < W:
        bw = rng.randint(330, 520); top = Y(rng.uniform(4.6, 6.0)); base = rng.choice(['#c9b89c', '#bfae94', '#cdbfa6', '#b9a88e'])
        bd.rectangle([x, top, x + bw, H], fill=hexc(base) + (255,))
        for fy in np.arange(Y(5.2), H, 3.0 * py_m):   # 每層樓：一排窗
            for wx in range(int(x + 30), int(x + bw - 90), rng.randint(120, 160)):
                lit = rng.random() < 0.28; wc = '#f6d58e' if lit else rng.choice(['#8e8472', '#7d7566', '#9a8f7a'])
                bd.rectangle([wx, fy, wx + 80, fy + 1.3 * py_m], fill=hexc(wc) + (255,))
                for gx in range(wx, wx + 81, 10): bd.line([gx, fy, gx, fy + 1.3 * py_m], fill=(70, 64, 56, 230), width=2)   # 鐵窗
                bd.rectangle([wx - 6, fy + 1.3 * py_m, wx + 86, fy + 1.3 * py_m + 8], fill=(120, 110, 96, 255))
                if rng.random() < 0.25: bd.rectangle([wx + 86, fy + 0.6 * py_m, wx + 120, fy + 1.1 * py_m], fill=(214, 208, 196, 255))   # 冷氣
            bd.rectangle([x, fy - 10, x + bw, fy - 4], fill=(150, 138, 118, 255))
        bd.rectangle([x + bw - 3, top, x + bw + 3, H], fill=(128, 116, 98, 255))   # 兩棟之間的接縫
        x += bw
    fa = np.asarray(bl, np.float32); fa[..., :3] *= (1 + (noise(W, H, 5, 77) - 0.5)[..., None] * 0.08); bl = Image.fromarray(np.clip(fa, 0, 255).astype(np.uint8))
    bl = bl.filter(ImageFilter.GaussianBlur(2.2)); im.alpha_composite(bl)
    haze = Image.new('RGBA', (W, H), hexc('#f3dcac') + (70,)); im.alpha_composite(haze)   # 空氣感：遠的東西淡一點
    # 3. 樹：兩棵老樹（樹幹、分枝），樹冠是幾百叢小葉子
    tr = Image.new('RGBA', (W, H), (0, 0, 0, 0)); td = ImageDraw.Draw(tr); tips = []
    def branch(x0, y0, ang, ln, wd, depth):
        x1, y1 = x0 + math.cos(ang) * ln, y0 - math.sin(ang) * ln
        n = 6
        for i in range(n):   # 有一點彎的樹枝
            a0 = (x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n); a1 = (x0 + (x1 - x0) * (i + 1) / n + rng.uniform(-3, 3), y0 + (y1 - y0) * (i + 1) / n + rng.uniform(-3, 3))
            w_ = max(1, int(wd * (1 - 0.35 * i / n))); cc = (78 - depth * 4, 62 - depth * 3, 46, 255); td.line([a0, a1], fill=cc, width=w_)
            td.ellipse([a1[0] - w_ / 2, a1[1] - w_ / 2, a1[0] + w_ / 2, a1[1] + w_ / 2], fill=cc)   # 圓的接頭（v2 初版接頭有亮縫）
        if depth >= 5 or ln < 40: tips.append((x1, y1, depth)); return
        for k in range(rng.choice([2, 3, 3])):
            na = ang + rng.uniform(-0.8, 0.8); na = min(max(na, 0.15), math.pi - 0.15) if depth < 2 else na - 0.25 * math.cos(na)   # 外側的枝往下垂一點
            branch(x1, y1, na, ln * rng.uniform(0.62, 0.8), wd * 0.66, depth + 1)
        if depth >= 1: tips.append((x1, y1, depth))
    for (bx, lean, size) in ((X(-1.2), 1.62, 1.0), (X(5.2), 1.45, 0.9)):   # 樹在對面人行道（窗外 2～3 m），分岔在二樓窗台下面：窗裡看到的是樹冠中段
        fy = Y(-0.2); td.polygon([(bx - 36 * size, H), (bx - 22 * size, fy), (bx + 22 * size, fy), (bx + 40 * size, H)], fill=(84, 66, 48, 255))
        for k in range(12): td.line([(bx - 24 * size + k * 4.5, H), (bx - 16 * size + k * 3, fy)], fill=(96 + (k % 3) * 8, 78, 56, 90), width=2)   # 樹皮的紋
        for a in (lean + 0.75, lean - 0.7, lean + 0.25, lean - 0.2): branch(bx, fy, a, 300 * size, 24 * size, 0)
    for k in range(16): tips.append((rng.uniform(0, W), rng.uniform(Y(4.2), Y(0.6)), 3))   # 別棵樹伸過來的枝：窗那一段也是葉子
    leaf_cols = [(66, 90, 46), (82, 108, 54), (98, 124, 60), (58, 80, 42), (112, 134, 64), (74, 100, 50)]
    sdir = np.array([-0.7, -0.7])
    def leaf(dr, cx, cy, ln, ang, col):
        ca, sa = math.cos(ang), math.sin(ang); w_ = ln * 0.42
        pts = [(-ln / 2, 0), (-ln * 0.2, -w_ / 2), (ln * 0.2, -w_ * 0.45), (ln / 2, 0), (ln * 0.2, w_ * 0.45), (-ln * 0.2, w_ / 2)]
        dr.polygon([(cx + p[0] * ca - p[1] * sa, cy + p[0] * sa + p[1] * ca) for p in pts], fill=col)
    # 後面一層（暗、偏藍綠、模糊一點）
    back = Image.new('RGBA', (W, H), (0, 0, 0, 0)); bkd = ImageDraw.Draw(back)
    for (tx, ty, dp) in tips:
        for j in range(60):
            cx, cy = tx + rng.gauss(0, 70), ty + rng.gauss(0, 50); leaf(bkd, cx, cy, rng.uniform(10, 16), rng.uniform(0, 6.3), (52, 74, 48, 255))
    back = back.filter(ImageFilter.GaussianBlur(1.6)); im.alpha_composite(back); im.alpha_composite(tr)
    # 前面一層：每叢 150～260 片，叢的上緣、靠太陽那一側亮（逆光、透光的黃綠）
    fr_ = Image.new('RGBA', (W, H), (0, 0, 0, 0)); fd = ImageDraw.Draw(fr_)
    for (tx, ty, dp) in tips:
        n = rng.randint(110, 200); rr = rng.uniform(40, 70)
        for j in range(n):
            ox, oy = rng.gauss(0, rr), rng.gauss(0, rr * 0.7); cx, cy = tx + ox, ty + oy
            v = np.array([ox, oy]) / (rr * 1.4); lit = float(np.clip(np.dot(v, sdir) * 0.9 + 0.35 + rng.uniform(-0.25, 0.25), 0, 1))
            base = np.array(rng.choice(leaf_cols), np.float32); hi = np.array(rng.choice([(176, 190, 92), (196, 200, 104), (156, 178, 80)]), np.float32)
            c = base * (1 - lit) + hi * lit
            if rng.random() < 0.07: c = np.array((214, 214, 120), np.float32)   # 透光的葉子
            leaf(fd, cx, cy, rng.uniform(9, 17), rng.uniform(0, 6.3), tuple(int(q) for q in c) + (255,))
    im.alpha_composite(fr_)
    # 4. 葉縫的光（小光點＋光暈）、整體一點點柔焦
    gl = Image.new('RGBA', (W, H), (0, 0, 0, 0)); gd = ImageDraw.Draw(gl)
    for (tx, ty, dp) in tips:
        if rng.random() < 0.45: continue
        cx, cy = tx + rng.gauss(0, 45), ty + rng.gauss(0, 35); r_ = rng.uniform(2, 5)
        gd.ellipse([cx - r_, cy - r_, cx + r_, cy + r_], fill=(255, 238, 196, 150))
    glb = gl.filter(ImageFilter.GaussianBlur(7)); im.alpha_composite(glb); im.alpha_composite(gl.filter(ImageFilter.GaussianBlur(1.2)))
    a = np.asarray(im.convert('RGB'), np.float32); a += np.exp(-dd / 420.0)[..., None] * np.array([34, 26, 10], np.float32)   # 太陽那一側的光霧
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)).save(os.path.join(GEN, 'mok_view.png'))


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
    # (0,6) 8×2：書堆的側面（v2：v1 的街景沒用到，換成這個）。16 條、每條 64×128 px＝一疊 6 本（每本 0.03 m 一條色帶，由下往上）。
    # 第 0～11 條：書背那一面（封面顏色＋書名的細字、偶爾一條書腰）；第 12～15 條：頁緣那一面（米白紙＋上下兩條封面色的細線）。
    # Blender 端：shanlan_interior.py 的 stack()，n 本就用條的下面 n/6。
    im = im.filter(ImageFilter.SMOOTH); d = ImageDraw.Draw(im); r_ = random.Random(76)
    spal = ['#7b2d26', '#2f4a3a', '#1f2e45', '#c9b48a', '#e8e0cc', '#8c3b47', '#3e5a48', '#d9a441', '#5c3a21', '#6b4a7a', '#4a6c8c', '#b8462e',
            '#e4d4b4', '#9fb4b8', '#d8b8a8', '#6f8a5e', '#c96a4a', '#efe6cf', '#2b2b2b', '#a8c0c8', '#e0c8c0']
    for k in range(16):
        x0, y0 = k * 64, 768
        for b in range(6):
            yb1 = y0 + 128 - b * 128 / 6; yb0 = yb1 - 128 / 6; col = r_.choice(spal)
            if k >= 12:   # 頁緣
                d.rectangle([x0, yb0, x0 + 63, yb1], fill=r_.choice(['#efe7d4', '#f3ecdc', '#e8dfca']))
                for yy_ in range(int(yb0) + 4, int(yb1) - 3, 2): d.line([x0, yy_, x0 + 63, yy_], fill=r_.choice(['#e4dac3', '#f6f0e2']))
                d.rectangle([x0, yb0, x0 + 63, yb0 + 2], fill=col); d.rectangle([x0, yb1 - 3, x0 + 63, yb1], fill=col)
                continue
            dark = sum(hexc(col)) < 400; fg = '#efe6cf' if dark else '#2a2a2a'
            a = np.ones((int(yb1) - int(yb0), 64, 3), np.float32) * np.array(hexc(col), np.float32); a *= (1 + (noise(64, a.shape[0], 3, k * 7 + b) - 0.5)[..., None] * 0.08)
            a[:2] *= 0.8; a[-2:] *= 0.72; im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), (x0, int(yb0)))
            tl = r_.randint(18, 34); tx = x0 + r_.randint(6, 12); cy = int((yb0 + yb1) / 2)
            for q in range(tl // 5): d.rectangle([tx + q * 5, cy - 2, tx + q * 5 + 3, cy + 1], fill=fg)    # 橫排的書名（細字）
            if r_.random() < 0.5: d.rectangle([x0 + 50, cy - 3, x0 + 56, cy + 2], fill=fg)                  # 出版社的小標
            if r_.random() < 0.2: d.rectangle([x0, int(yb0) + 3, x0 + 63, int(yb0) + 7], fill=r_.choice(['#e8c43a', '#f2efe6', '#c4513e']))   # 書腰
    im.save(os.path.join(GEN, 'shl_print.png'))


def yej():
    """頁間書屋（公館，AA 2026-11-04）：用山嵐的圖集（雜誌封面、書封、明信片、書堆側面）改兩塊：(0,0)～(6,1) 分類牌、(0,4) 4×2 手寫黑板菜單。"""
    rng = np.random.default_rng(1104); base = os.path.join(GEN, 'shl_print.png')
    if not os.path.exists(base): shl()
    im = Image.open(base).convert('RGB'); d = ImageDraw.Draw(im)
    cats = [('文學・小說', 'FICTION'), ('散文・人文', 'ESSAYS'), ('法律', 'LAW'), ('歷史', 'HISTORY'), ('藝術・設計', 'ART & DESIGN'), ('大學生活', 'CAMPUS LIFE'), ('新書推薦', 'NEW'), ('頁間書屋', 'BETWEEN PAGES')]
    for k, (s_, en) in enumerate(cats):
        c, r = (k % 4) * 2, k // 4; bx = box(c, r, 2, 1); x0, y0, x1, y1 = bx
        if k < 7:
            paper(im, bx, '#2f3a33', rng, grain=0.06); d.rectangle([x0 + 6, y0 + 6, x1 - 7, y1 - 7], outline='#c9b48a', width=2)
            text_c(d, ((x0 + x1) / 2, (y0 + y1) / 2 - 10), s_, F(40 if len(s_) <= 2 else 34), '#f1ead8'); text_c(d, ((x0 + x1) / 2, y1 - 22), en, F(13), '#c9b48a')
        else:   # 店名牌（淺木底、深綠字）
            paper(im, bx, '#d9bf96', rng, grain=0.08); text_c(d, ((x0 + x1) / 2, (y0 + y1) / 2 - 6), s_, F(44), '#2f4a3a'); text_c(d, ((x0 + x1) / 2, y1 - 20), en, F(12), '#5a4630')
    bx = box(0, 4, 4, 2); paper(im, bx, '#2b302c', rng, grain=0.12); x0, y0, x1, y1 = bx
    d.rectangle(bx, outline='#7a5a3a', width=10)
    text_c(d, ((x0 + x1) / 2, y0 + 40), '咖啡・茶飲', F(34), '#f1ead8')
    for k, (zh, p_) in enumerate((('美式・拿鐵', '90／120'), ('手沖單品', '150'), ('奶茶・茶飲', '100'), ('今日甜點', '110'))):
        y = y0 + 92 + k * 34; d.text((x0 + 48, y), '・' + zh, font=F(24), fill='#f1ead8'); d.text((x1 - 140, y), p_, font=F(22), fill='#e8c43a')
    d.ellipse([x1 - 90, y1 - 70, x1 - 40, y1 - 30], outline='#f1ead8', width=3); d.line([x1 - 40, y1 - 58, x1 - 28, y1 - 50], fill='#f1ead8', width=3)
    im.save(os.path.join(GEN, 'yej_print.png'))
    # v2：磨石子（LAWWW2：要有明顯的黑白小點）——512 px＝1.2 m；米灰底＋黑、白、灰、赭的碎石（1～6 px）
    S = 512; r2 = random.Random(1104); a = np.ones((S, S, 3), np.float32) * np.array(hexc('#c9bfae'), np.float32)
    a *= (1 + (noise(S, S, 24, 11) - 0.5)[..., None] * 0.08)
    t = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); dt = ImageDraw.Draw(t)
    for _ in range(5200):
        x, y, rr = r2.uniform(0, S), r2.uniform(0, S), r2.choice((1, 1, 1.5, 2, 2, 3, 4, 5))
        col = r2.choice(['#2b2826', '#3a3633', '#f4f0e8', '#ebe5da', '#8a8178', '#9c6b4a', '#6f6a62', '#d8cfc0'])
        dt.polygon([(x + rr * math.cos(k * 1.3 + r2.uniform(0, 0.6)), y + rr * math.sin(k * 1.3 + r2.uniform(0, 0.6))) for k in range(5)], fill=col)
    t.filter(ImageFilter.SMOOTH).save(os.path.join(GEN, 'yej_terrazzo.png'))


def aok():
    """青木茶室（公館，AA 2026-11-04）：(0,0) 2×1 店名牌、(2,0) 2×2 山景小畫、(4,0) 4×1 茶罐標籤 8 張、(4,1) 4×1 牛皮紙茶包 8 張、(0,2) 4×2 黑板「季節限定」"""
    rng = np.random.default_rng(1105); im = Image.new('RGB', (1024, 1024), '#efe8da'); d = ImageDraw.Draw(im)
    bx = box(0, 0, 2, 1); x0, y0, x1, y1 = bx; d.rectangle(bx, fill='#eadac2')   # 店名（v2b：直接寫在牆上的字＋雙葉標誌，底色＝牆色）
    for (cx, cy, rx, ry, ang) in ((x0 + 37, y0 + 48, 10, 24, -0.75), (x0 + 63, y0 + 48, 10, 24, 0.75)):   # 雙葉
        pts = [(cx + rx * math.cos(t) * math.cos(ang) - ry * math.sin(t) * math.sin(ang), cy + rx * math.cos(t) * math.sin(ang) + ry * math.sin(t) * math.cos(ang)) for t in np.linspace(0, 2 * math.pi, 24)]
        d.polygon(pts, fill='#4f6b45')
    d.line([x0 + 50, y0 + 64, x0 + 50, y0 + 98], fill='#4f6b45', width=4); d.line([x0 + 50, y0 + 66, x0 + 42, y0 + 60], fill='#4f6b45', width=3); d.line([x0 + 50, y0 + 66, x0 + 58, y0 + 60], fill='#4f6b45', width=3)
    d.text((x0 + 82, y0 + 34), '青木茶室', font=F(42), fill='#3f5a3a')
    bx = box(2, 0, 2, 2); paper(im, bx, '#f4efe2', rng); x0, y0, x1, y1 = bx   # 山景小畫
    for k, col in enumerate(('#c8d2c0', '#a8b8a0', '#8aa088', '#6f8a6e')):
        base = y0 + 120 + k * 28; d.polygon([(x0 + 10, y1 - 10), (x0 + 10, base + 30)] + [(x0 + 10 + j * 30, base + 30 - 40 * abs(math.sin(j * 0.7 + k))) for j in range(9)] + [(x1 - 10, base + 20), (x1 - 10, y1 - 10)], fill=col)
    d.rectangle([x0 + 4, y0 + 4, x1 - 5, y1 - 5], outline='#c9a272', width=6)
    for k in range(8):   # 茶罐標籤
        x0, y0 = 512 + k * 64, 0; paper(im, (x0, y0, x0 + 64, y0 + 128), '#3f5a46', rng, grain=0.05)
        d.rectangle([x0 + 8, y0 + 30, x0 + 56, y0 + 98], fill='#ede4cf'); d.text((x0 + 22, y0 + 36), ('烏', '綠', '白', '紅', '包', '鐵', '香', '金')[k], font=F(26), fill='#3f5a46')
        d.text((x0 + 14, y0 + 72), ('龍', '茶', '茶', '茶', '種', '觀', '片', '萱')[k], font=F(18), fill='#3f5a46')
    for k in range(8):   # 牛皮紙茶包
        x0, y0 = 512 + k * 64, 128; paper(im, (x0, y0, x0 + 64, y0 + 128), '#c9a77c', rng, grain=0.08)
        d.ellipse([x0 + 20, y0 + 30, x0 + 44, y0 + 54], fill='#4f6b45'); d.rectangle([x0 + 12, y0 + 70, x0 + 52, y0 + 76], fill='#6b4a2a'); d.rectangle([x0 + 18, y0 + 84, x0 + 46, y0 + 88], fill='#6b4a2a')
    bx = box(0, 2, 4, 2); paper(im, bx, '#2b302c', rng, grain=0.12); x0, y0, x1, y1 = bx   # 黑板
    d.rectangle(bx, outline='#7a5a3a', width=10); text_c(d, ((x0 + x1) / 2, y0 + 44), '季節限定', F(40), '#f1ead8')
    for k, s_ in enumerate(('桂花烏龍奶茶', '柚香綠茶', '春摘白茶')):
        y = y0 + 100 + k * 46; d.text((x0 + 60, y), s_, font=F(30), fill='#f1ead8'); d.ellipse([x1 - 90, y + 4, x1 - 64, y + 30], outline='#d9c47a', width=3)
    for k in range(10):   # 葉子塗鴉
        cx, cy = x0 + 24 + k * 50, y1 - 26; d.ellipse([cx - 8, cy - 4, cx + 8, cy + 4], fill='#8aa86a')
    im.save(os.path.join(GEN, 'aok_print.png'))


def afr():
    """afar café（公館 G07，AA 2026-11-04；AA_650）：(0,0) 2×1 綠牆上的「afar」字（底色＝綠牆）、(2,0) 2×2 山景畫、(4,0) 2×2 湖景畫、(6,0) 2×2 黑板菜單、
    (0,1) 2×1 咖啡豆袋標籤、(0,2) 8×1 雜誌封面 8 張"""
    rng = np.random.default_rng(1107); im = Image.new('RGB', (1024, 1024), '#efe8da'); d = ImageDraw.Draw(im)
    bx = box(0, 0, 2, 1); x0, y0, x1, y1 = bx; d.rectangle(bx, fill='#4a5a45'); text_c(d, ((x0 + x1) / 2, y0 + 40), 'afar', F(64), '#efe4cc')
    for (c, pal) in ((2, ('#dfe3da', '#b9c4b4', '#93a493', '#6f8573', '#4f6656')), (4, ('#e8e4d6', '#c9cfc2', '#a3b0a4', '#7d9184', '#bfcfd3'))):
        bx = box(c, 0, 2, 2); paper(im, bx, '#f1ede2', rng); x0, y0, x1, y1 = bx
        for k, col in enumerate(pal[:4]):
            base = y0 + 70 + k * 34; d.polygon([(x0 + 12, y1 - 12), (x0 + 12, base + 40)] + [(x0 + 12 + j * 29, base + 40 - 46 * abs(math.sin(j * 0.6 + k * 1.3 + c))) for j in range(9)] + [(x1 - 12, base + 30), (x1 - 12, y1 - 12)], fill=col)
        if c == 4: d.rectangle([x0 + 12, y1 - 70, x1 - 12, y1 - 12], fill=pal[4])
        d.rectangle([x0 + 4, y0 + 4, x1 - 5, y1 - 5], outline='#f6f2ea', width=14); d.rectangle([x0 + 2, y0 + 2, x1 - 3, y1 - 3], outline='#6a4a30', width=4)
    bx = box(6, 0, 2, 2); paper(im, bx, '#2a2e2a', rng, grain=0.12); x0, y0, x1, y1 = bx   # 黑板
    d.rectangle(bx, outline='#5a3e28', width=9); d.text((x0 + 22, y0 + 18), 'afar', font=F(34), fill='#f1ead8'); d.text((x0 + 22, y0 + 58), 'COFFEE MENU', font=F(14), fill='#e8e0cc')
    d.ellipse([x1 - 46, y0 + 22, x1 - 26, y0 + 52], outline='#a8b890', width=2)
    for k, (n_, p_) in enumerate((('Espresso', 100), ('Americano', 110), ('Latte', 140), ('Cappuccino', 140), ('Mocha', 160), ('Pour Over', 170))):
        y = y0 + 88 + k * 26; d.text((x0 + 22, y), n_, font=F(15), fill='#f1ead8'); d.text((x1 - 54, y), str(p_), font=F(15), fill='#f1ead8')
    bx = box(0, 1, 2, 1); paper(im, bx, '#c9a77c', rng, grain=0.08); x0, y0, x1, y1 = bx   # 咖啡豆袋
    d.rectangle([x0 + 30, y0 + 30, x1 - 30, y1 - 30], fill='#efe6d2'); text_c(d, ((x0 + x1) / 2, y0 + 46), 'afar', F(26), '#4a5a45')
    covs = [('#e8d9b8', '#6f8a9a'), ('#d9e2e4', '#c98a5a'), ('#efe2cc', '#7a9a7e'), ('#e4e0d6', '#8a6a8a'), ('#f1e6d2', '#5a7a9a'), ('#dfe6dc', '#b8a050'), ('#ece0d8', '#6a8a6a'), ('#e6e2ea', '#a86a5a')]
    for k, (bg, fg) in enumerate(covs):   # 雜誌封面
        x0, y0 = k * 128, 256; d.rectangle([x0 + 4, y0 + 2, x0 + 124, y0 + 126], fill=bg)
        d.rectangle([x0 + 14, y0 + 12, x0 + 80, y0 + 20], fill=fg); d.ellipse([x0 + 30, y0 + 44, x0 + 98, y0 + 112], fill=fg)
        d.polygon([(x0 + 10, y0 + 120), (x0 + 50, y0 + 70), (x0 + 80, y0 + 100), (x0 + 118, y0 + 60), (x0 + 118, y0 + 120)], fill=tuple(int(v * 0.85) for v in hexc(fg)))
    im.save(os.path.join(GEN, 'afr_print.png'))


def dbk():
    """Daybreak（公館 G14，AA 2026-11-04；AA_650）：(0,0) 4×2 牆上的 Daybreak 字＋太陽＋黃色山丘（底色＝牆）、(4,0) 2×2 黑板菜單、(6,0) 2×1 Pick Up 牌、
    (0,2) 6×2 三張早午餐插畫（吐司煎蛋、日出山景、鬆餅）"""
    rng = np.random.default_rng(1108); im = Image.new('RGB', (1024, 1024), '#f1ebdf'); d = ImageDraw.Draw(im)
    bx = box(0, 0, 4, 2); x0, y0, x1, y1 = bx; d.rectangle(bx, fill='#efe6d6')
    for k, (col, amp, base) in enumerate((('#f3dc9a', 26, 190), ('#ecc970', 20, 214))):   # 黃色山丘
        d.polygon([(x0, y1)] + [(x0 + j * 16, y0 + base - amp * math.sin(j * 0.18 + k * 1.7)) for j in range(33)] + [(x1, y1)], fill=col)
    cx, cy = x0 + 380, y0 + 70
    d.pieslice([cx - 34, cy - 34, cx + 34, cy + 34], 180, 360, fill='#e8b84a')
    for k in range(7):
        a = math.pi * (1 + (k + 0.5) / 7); d.line([cx + 44 * math.cos(a), cy + 44 * math.sin(a), cx + 60 * math.cos(a), cy + 60 * math.sin(a)], fill='#e8b84a', width=4)
    d.text((x0 + 120, y0 + 84), 'Daybreak', font=F(70), fill='#4a5a40'); text_c(d, ((x0 + x1) / 2 + 40, y0 + 186), 'BRUNCH  &  COFFEE', F(18), '#5a6a50')
    bx = box(4, 0, 2, 2); paper(im, bx, '#2b302c', rng, grain=0.12); x0, y0, x1, y1 = bx   # 黑板
    d.rectangle(bx, outline='#8a6a44', width=9); d.text((x0 + 26, y0 + 22), 'Daybreak', font=F(30), fill='#f1ead8')
    for k, n_ in enumerate(('Brunch', 'Plates', 'Sandwiches', 'Salads', 'Drinks', 'Sweets')):
        y = y0 + 72 + k * 28; d.text((x0 + 30, y), n_, font=F(18), fill='#f1ead8'); d.line([x0 + 160, y + 12, x0 + 200, y + 12], fill='#d9d0bc', width=2)
    bx = box(6, 0, 2, 1); paper(im, bx, '#d9b98e', rng, grain=0.06); x0, y0, x1, y1 = bx   # Pick Up 牌
    d.rectangle([x0 + 6, y0 + 6, x1 - 7, y1 - 7], outline='#6a4a2a', width=3); text_c(d, ((x0 + x1) / 2, y0 + 34), 'Pick Up', F(40), '#4a3a28')
    for k in range(3):   # 早午餐插畫
        bx = box(k * 2, 2, 2, 2); paper(im, bx, '#f6f0e2', rng); x0, y0, x1, y1 = bx
        if k == 0:
            d.rounded_rectangle([x0 + 50, y0 + 90, x1 - 50, y1 - 60], 30, fill='#d9a860'); d.ellipse([x0 + 80, y0 + 110, x1 - 80, y1 - 80], fill='#fbf6ea'); d.ellipse([x0 + 112, y0 + 140, x1 - 112, y1 - 110], fill='#f0b830')
            d.ellipse([x0 + 60, y0 + 40, x0 + 110, y0 + 80], fill='#7a9a5a')
        elif k == 1:
            d.rectangle([x0 + 20, y0 + 20, x1 - 20, y1 - 20], fill='#f8e8c8'); d.ellipse([x0 + 98, y0 + 80, x1 - 98, y0 + 140], fill='#f0b840')
            d.polygon([(x0 + 20, y1 - 20), (x0 + 20, y0 + 150), (x0 + 120, y0 + 120), (x1 - 20, y0 + 160), (x1 - 20, y1 - 20)], fill='#a8c08a')
            d.polygon([(x0 + 20, y1 - 20), (x0 + 20, y0 + 190), (x0 + 150, y0 + 170), (x1 - 20, y0 + 200), (x1 - 20, y1 - 20)], fill='#7a9a6a')
        else:
            for j in range(4): d.ellipse([x0 + 60, y0 + 150 - j * 22, x1 - 60, y0 + 180 - j * 22], fill=('#e0b070', '#d9a560', '#e4b878', '#dcaa66')[j])
            d.ellipse([x0 + 110, y0 + 70, x1 - 110, y0 + 96], fill='#f8f0d8'); d.ellipse([x0 + 118, y0 + 50, x0 + 140, y0 + 72], fill='#c0392b')
        d.rectangle([x0 + 3, y0 + 3, x1 - 4, y1 - 4], outline='#c9a272', width=6)
    im.save(os.path.join(GEN, 'dbk_print.png'))


def a23():
    """2:30 AM（溫州街東端路口，取代兩點半 Café；AA 2026-11-04；AA_654）：(0,0) 4×1 深綠底金字「2:30 AM」招牌、(4,0) 2×2 黑板菜單、
    (6,0) 2×2 舊照片一（街景）、(0,1) 2×2 舊照片二（山城）、(2,1) 2×2 舊照片三（港邊）、(0,3) 8×1 黑膠封面 8 張、(6,2) 2×1 營業時間牌"""
    rng = np.random.default_rng(1109); im = Image.new('RGB', (1024, 1024), '#e8dcc4'); d = ImageDraw.Draw(im)
    bx = box(0, 0, 4, 1); x0, y0, x1, y1 = bx; d.rectangle(bx, fill='#2f3d30'); d.rectangle([x0 + 6, y0 + 6, x1 - 7, y1 - 7], outline='#b8944a', width=3)
    # v1e（BB 07:54：遊戲裡縮小以後冒號像句點）：參考圖是金色襯線字；冒號自己畫兩顆大一點的圓點，縮小也看得出是「:」
    fs = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf', 76); gold = '#e8d29a'
    parts = [('2', 0), (':', 1), ('30 AM', 0)]; ws = [d.textlength(t, font=fs) if c == 0 else 30 for t, c in parts]; xx = (x0 + x1) / 2 - sum(ws) / 2; base = y0 + 64
    for (t, c), w_ in zip(parts, ws):
        if c: [d.ellipse([xx + 15 - 8, base + dy - 8, xx + 15 + 8, base + dy + 8], fill=gold) for dy in (-15, 19)]
        else: d.text((xx, base), t, font=fs, fill=gold, anchor='lm')
        xx += w_
    bx = box(4, 0, 2, 2); paper(im, bx, '#2a2e2a', rng, grain=0.12); x0, y0, x1, y1 = bx
    d.rectangle(bx, outline='#5a3e28', width=9); d.text((x0 + 22, y0 + 18), '2:30 AM', font=F(30), fill='#f1ead8'); d.text((x0 + 22, y0 + 56), 'COFFEE & NIGHT', font=F(14), fill='#e8e0cc')
    for k, (n_, p_) in enumerate((('Hand Drip', 160), ('Latte', 150), ('Mocha', 160), ('Earl Grey', 140), ('Cheesecake', 130), ('Toast', 90))):
        y = y0 + 88 + k * 26; d.text((x0 + 22, y), n_, font=F(15), fill='#f1ead8'); d.text((x1 - 54, y), str(p_), font=F(15), fill='#f1ead8')
    def photo(c, r, kind):
        bx = box(c, r, 2, 2); x0, y0, x1, y1 = bx; d.rectangle(bx, fill='#efe6d4'); ix0, iy0, ix1, iy1 = x0 + 22, y0 + 22, x1 - 22, y1 - 22
        a = np.zeros((iy1 - iy0, ix1 - ix0), np.float32) + 0.72
        hh, ww = a.shape; yy = np.arange(hh)[:, None]; xx = np.arange(ww)[None, :]
        if kind == 0:   # 街景：兩排樓、中間一條路
            a[:, :] = 0.78; a = np.where(yy > hh * 0.55, 0.5, a)
            for k in range(6):
                bw = ww // 7; xa = k * bw + 4; h0 = int(hh * (0.2 + 0.1 * ((k * 37) % 4)))
                if k != 3: a[h0:int(hh * 0.62), xa:xa + bw - 6] = 0.32 + 0.05 * (k % 3)
        elif kind == 1:   # 山城：山稜線、房子
            a[:, :] = 0.8
            ridge = (hh * (0.45 + 0.12 * np.sin(xx / ww * 6.0))).astype(int); a = np.where(yy > ridge, 0.42, a)
            a = np.where(yy > hh * 0.75, 0.3, a)
        else:   # 港邊：海平面、船
            a[:, :] = 0.82; a = np.where(yy > hh * 0.6, 0.55, a)
            for k in range(3): xa = int(ww * (0.2 + 0.25 * k)); a[int(hh * 0.5):int(hh * 0.6), xa:xa + 30] = 0.25
        a += rng.normal(0, 0.03, a.shape)
        rgb = np.stack([a * 230, a * 205, a * 170], -1).clip(0, 255).astype(np.uint8)
        im.paste(Image.fromarray(rgb), (ix0, iy0)); d.rectangle(bx, outline='#3a2a1e', width=6)
    photo(6, 0, 0); photo(0, 1, 1); photo(2, 1, 2)
    covs = [('#2f3d30', '#e8d29a'), ('#8c3b47', '#f1e6d2'), ('#1f2e45', '#d9a441'), ('#e8dcc4', '#3a2a1e'), ('#4a6c8c', '#f4ead8'), ('#3a3a3a', '#c98a5a'), ('#7b5a3a', '#efe6d4'), ('#5a6a3a', '#f1ead8')]
    for k, (bg, fg) in enumerate(covs):   # 黑膠封面
        x0, y0 = k * 128, 384; d.rectangle([x0 + 3, y0 + 3, x0 + 124, y0 + 124], fill=bg); d.ellipse([x0 + 30, y0 + 30, x0 + 98, y0 + 98], outline=fg, width=6); d.rectangle([x0 + 14, y0 + 104, x0 + 70, y0 + 112], fill=fg)
    bx = box(6, 2, 2, 1); x0, y0, x1, y1 = bx; d.rectangle(bx, fill='#2f3d30'); text_c(d, ((x0 + x1) / 2, y0 + 22), 'Business Hours', F(22), '#e8d29a'); text_c(d, ((x0 + x1) / 2, y0 + 64), '11:00 – 02:30', F(26), '#f1ead8')
    im.save(os.path.join(GEN, 'a23_print.png'))


def kmc():
    """小路（溫州街 B3，取代巷子裡定食；昭和懷舊居酒屋；AA 2026-11-04；AA_654／AA_655）：
    (0,0) 2×1 「小路」木匾、(2,0) 2×1 營業時間木牌 18:00～02:00、(4,0) 4×1 牆上的紙菜單 8 張（直排）、
    (0,1) 8×2 木札 16 枚（直排，每枚 64×256）、(0,3) 2×3 懷舊電影海報一、(2,3) 2×3 海報二、(4,3) 2×2 舊照片（街景）、(6,3) 2×2 舊照片（人像）、
    (4,5) 2×1 小黑板「本日のおすすめ」、(0,6) 8×1 清酒標籤 8 張（虛構酒名，D77）、(0,7) 8×1 燒酎、啤酒箱、小瓶的標籤"""
    rng = np.random.default_rng(1104); im = Image.new('RGB', (1024, 1024), '#e8dcc4'); d = ImageDraw.Draw(im)
    def vtext(x, y0, s, f, fill, step):
        for k, ch in enumerate(s): text_c(d, (x, y0 + k * step), ch, f, fill)
    bx = box(0, 0, 2, 1); x0, y0, x1, y1 = bx; paper(im, bx, '#3a2618', rng, grain=0.25); d.rectangle([x0 + 5, y0 + 5, x1 - 6, y1 - 6], outline='#6a4a2e', width=4)
    text_c(d, ((x0 + x1) / 2, (y0 + y1) / 2 + 2), '小 路', F(64), '#efe2c4')
    bx = box(2, 0, 2, 1); x0, y0, x1, y1 = bx; paper(im, bx, '#6a4a2e', rng, grain=0.25); d.rectangle([x0 + 4, y0 + 4, x1 - 5, y1 - 5], outline='#3a2618', width=3)
    text_c(d, ((x0 + x1) / 2, y0 + 36), '營業時間', F(26), '#f1e6cc'); text_c(d, ((x0 + x1) / 2, y0 + 86), '18:00 ～ 02:00', F(28), '#f1e6cc')
    for k, s_ in enumerate(('ビール', '日本酒', '焼酎', 'ハイボール', '梅酒', '烏龍茶', '乳酸飲料', 'ラムネ')):   # 牆上的紙菜單（米色紙、黑字直排、紅色價錢）
        x0 = 512 + k * 64; y0 = 0; paper(im, (x0 + 3, y0 + 3, x0 + 61, y0 + 125), '#efe4c8', rng, grain=0.08)
        n = len(s_); st = min(24, 92 // n); vtext(x0 + 32, y0 + 16, s_, F(min(22, st)), '#2a2018', st)
        d.rectangle([x0 + 22, y0 + 112, x0 + 42, y0 + 115], fill='#a8392e')
    fuda = ('焼き鳥', '揚げ出し豆腐', '塩焼き鯖', 'だし巻き玉子', 'おひたし', '冷やっこ', '枝豆', '唐揚げ', '焼きおにぎり', '漬物', '生ビール', '冷酒', '熱燗', '烏龍茶', '乳酸サワー', '味噌汁')
    for k, s_ in enumerate(fuda):   # 木札：淺木色、四邊略暗、頂端小孔、墨字直排
        x0 = (k % 16) * 64; y0 = 128; paper(im, (x0 + 4, y0 + 4, x0 + 60, y0 + 252), ('#d9c29a', '#d2b98e', '#dcc6a0')[k % 3], rng, edge='#9a7a52', grain=0.12)
        d.ellipse([x0 + 29, y0 + 12, x0 + 35, y0 + 18], fill='#5a4028')
        n = len(s_); st = min(34, 200 // n); vtext(x0 + 32, y0 + 44, s_, F(min(30, st - 2)), '#1e1610', st)
    def grad(w, h, c0, c1, vertical=True):
        t = np.linspace(0, 1, h if vertical else w)[:, None] if vertical else np.linspace(0, 1, w)[None, :]
        a0, a1 = np.array(hexc(c0), np.float32), np.array(hexc(c1), np.float32)
        g = a0 + (a1 - a0) * t[..., None]; return np.broadcast_to(g, (h, w, 3)).copy()
    def shade_ellipse(a, cx, cy, rx, ry, col, light=(-0.4, -0.5), k=0.35):
        h, w = a.shape[:2]; yy, xx = np.mgrid[0:h, 0:w].astype(np.float32); u = (xx - cx) / rx; v = (yy - cy) / ry; m = u * u + v * v < 1
        sh_ = 1 + k * (-(u * light[0] + v * light[1])) - 0.25 * (u * u + v * v); c = np.array(hexc(col), np.float32)
        a[m] = (c[None, :] * sh_[m][:, None]).clip(0, 255)
    def poster(c, title, kind, seed):
        """v1d（BB_257：寫實一點、兩張不同人物和構圖）：漸層底、有明暗的臉和頭髮、手寫標題、片商小字、褪色、邊角捲起、膠帶"""
        bx = box(c, 3, 2, 3); x0, y0, x1, y1 = bx; w, h = x1 - x0, y1 - y0; r2 = np.random.default_rng(seed)
        if kind == 0:   # 女主角半身、側光、藍綠底，直排紅字標題在左
            a = grad(w, h, '#3e6a6a', '#d8c8a0')
            shade_ellipse(a, w * 0.6, h * 0.3, w * 0.25, h * 0.2, '#2a1a14', k=0.5)          # 頭髮（大波浪）
            shade_ellipse(a, w * 0.72, h * 0.42, w * 0.12, h * 0.16, '#2a1a14', k=0.4)
            shade_ellipse(a, w * 0.58, h * 0.33, w * 0.15, h * 0.15, '#e8c0a0', k=0.45)       # 臉
            shade_ellipse(a, w * 0.58, h * 0.48, w * 0.05, h * 0.06, '#d8b090', k=0.3)        # 脖子
            shade_ellipse(a, w * 0.6, h * 0.78, w * 0.36, h * 0.3, '#a8392e', k=0.45)         # 洋裝
            shade_ellipse(a, w * 0.6, h * 0.62, w * 0.12, h * 0.05, '#e8c0a0', k=0.3)         # 領口
        else:           # 男主角戴帽、四分之三側臉，夕陽街景剪影在下，橫的標題在上
            a = grad(w, h, '#e8a050', '#5a2a2a')
            for k_ in range(7):
                bw = w // 8; xa = k_ * bw + 2; ht = int(h * (0.62 + 0.08 * ((k_ * 53) % 4) / 3)); a[ht:, xa:xa + bw - 3] = np.array(hexc('#2a1a1a'), np.float32)
            shade_ellipse(a, w * 0.45, h * 0.42, w * 0.16, h * 0.15, '#d8a880', light=(0.5, -0.4), k=0.5)   # 臉
            shade_ellipse(a, w * 0.45, h * 0.29, w * 0.24, h * 0.05, '#2a2420', k=0.3)        # 帽簷
            shade_ellipse(a, w * 0.45, h * 0.24, w * 0.14, h * 0.07, '#3a3430', k=0.4)        # 帽頂
            shade_ellipse(a, w * 0.47, h * 0.66, w * 0.3, h * 0.12, '#3a3a44', k=0.4)         # 西裝肩
            shade_ellipse(a, w * 0.47, h * 0.6, w * 0.06, h * 0.07, '#e8e4d8', k=0.2)         # 襯衫領
        a *= (1 + (noise(w, h, 2, seed) - 0.5)[..., None] * 0.14); a = a * 0.82 + np.array([46, 38, 22], np.float32)   # 褪色、泛黃
        im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), (x0, y0)); dd = ImageDraw.Draw(im)
        if kind == 0:
            vtext(x0 + 38, y0 + 52, title, F(48), '#c8302a', 56); d.ellipse([x0 + w * 0.53, y0 + h * 0.31, x0 + w * 0.55, y0 + h * 0.32], fill='#2a1a14'); d.ellipse([x0 + w * 0.6, y0 + h * 0.31, x0 + w * 0.62, y0 + h * 0.32], fill='#2a1a14')
            d.ellipse([x0 + w * 0.565, y0 + h * 0.4, x0 + w * 0.6, y0 + h * 0.41], fill='#a8302a'); d.text((x0 + 16, y1 - 56), '主演　白川 遥', font=F(15), fill='#f1e6cc'); d.text((x0 + 16, y1 - 36), '曙映画社　総天然色', font=F(13), fill='#f1e6cc')
        else:
            text_c(d, (x0 + w / 2, y0 + 40), title, F(44), '#f6e8b0'); d.line([x0 + 30, y0 + 70, x1 - 30, y0 + 70], fill='#f6e8b0', width=2)
            d.ellipse([x0 + w * 0.48, y0 + h * 0.4, x0 + w * 0.5, y0 + h * 0.41], fill='#2a1a14'); d.text((x0 + 18, y1 - 40), '主演　風間 透　　大東映画', font=F(14), fill='#f1e0c0')
        for (tx, ty) in ((x0 + 4, y0 + 4), (x1 - 34, y0 + 6)): d.rectangle([tx, ty, tx + 30, ty + 14], fill='#e8dcb0')   # 膠帶
        d.polygon([(x1 - 1, y1 - 40), (x1 - 1, y1 - 1), (x1 - 40, y1 - 1)], fill='#c8b890'); d.line([(x1 - 40, y1 - 1), (x1 - 1, y1 - 40)], fill='#8a7a5a', width=2)   # 捲起來的角
        d.line([(x0, y0 + h * 0.5), (x1, y0 + h * 0.52)], fill='#b8a888', width=1)
    poster(0, '青い季節', 0, 31); poster(2, '夕陽の街', 1, 32)
    for c, kind in ((4, 0), (6, 1)):   # 舊照片：泛黃黑白、白邊、木框
        bx = box(c, 3, 2, 2); x0, y0, x1, y1 = bx; d.rectangle(bx, fill='#efe6d4'); ix0, iy0, ix1, iy1 = x0 + 20, y0 + 20, x1 - 20, y1 - 20
        hh, ww = iy1 - iy0, ix1 - ix0; yy = np.arange(hh)[:, None]; xx = np.arange(ww)[None, :]; a = np.zeros((hh, ww), np.float32) + 0.78
        if kind == 0:
            a = np.where(yy > hh * 0.58, 0.52, a)
            for k in range(5):
                bw = ww // 6; xa = k * bw + 6; h0 = int(hh * (0.18 + 0.08 * ((k * 31) % 4)))
                if k != 2: a[h0:int(hh * 0.64), xa:xa + bw - 8] = 0.3 + 0.06 * (k % 3)
        else:
            a = np.where(((xx - ww / 2) ** 2 / (ww * 0.18) ** 2 + (yy - hh * 0.38) ** 2 / (hh * 0.2) ** 2) < 1, 0.62, a)
            a = np.where((yy > hh * 0.58) & (np.abs(xx - ww / 2) < ww * 0.32 + (yy - hh * 0.58) * 0.5), 0.28, a)
        a += rng.normal(0, 0.03, a.shape); im.paste(Image.fromarray(np.stack([a * 228, a * 204, a * 168], -1).clip(0, 255).astype(np.uint8)), (ix0, iy0)); d.rectangle(bx, outline='#3a2618', width=7)
    bx = box(4, 5, 2, 1); paper(im, bx, '#262a26', rng, grain=0.12); x0, y0, x1, y1 = bx; d.rectangle(bx, outline='#5a3e28', width=7)
    d.text((x0 + 16, y0 + 12), '本日のおすすめ', font=F(20), fill='#f1ead8'); d.text((x0 + 16, y0 + 46), '焼き鳥・だし巻き玉子', font=F(16), fill='#efe0b8'); d.text((x0 + 16, y0 + 76), '烤雞串・玉子燒', font=F(16), fill='#efe0b8')
    for k, (nm, bg, fg) in enumerate((('松風', '#f1ead8', '#1e1610'), ('若竹', '#e8e2cc', '#2a4a2e'), ('月影', '#1e2a3a', '#e8dcc0'), ('白鷺', '#f4f0e6', '#a8392e'),
                                       ('山桜', '#efe0d8', '#7a2a2a'), ('川霧', '#d8e0dc', '#1e2a2a'), ('雪見', '#f4f4f0', '#2a3a5a'), ('朝凪', '#e8d8b8', '#3a2618'))):   # 清酒標籤（虛構酒名）
        x0, y0 = k * 128, 768; d.rectangle([x0 + 4, y0 + 4, x0 + 123, y0 + 123], fill=bg); d.rectangle([x0 + 10, y0 + 10, x0 + 117, y0 + 117], outline=fg, width=2)
        vtext(x0 + 64, y0 + 38, nm, F(40), fg, 46); d.rectangle([x0 + 92, y0 + 20, x0 + 100, y0 + 52], fill='#a8392e')
    for k, (bg, fg) in enumerate((('#2a2a2a', '#d9a441'), ('#f1ead8', '#2a4a2e'), ('#7a2a22', '#f1ead8'), ('#e8dcc0', '#1e1610'), ('#3a4a2a', '#e8dcc0'), ('#c8a44a', '#2a1e18'), ('#f4f0e6', '#2a3a5a'), ('#5a3a22', '#efe2c4'))):
        x0, y0 = k * 128, 896; d.rectangle([x0 + 4, y0 + 4, x0 + 123, y0 + 123], fill=bg); d.ellipse([x0 + 34, y0 + 30, x0 + 94, y0 + 90], outline=fg, width=5); d.rectangle([x0 + 24, y0 + 100, x0 + 104, y0 + 108], fill=fg)
    # v1e（使用者 11-04 06:3x「海報上的人也太醜了吧沒辦法用2D的圖貼上嗎？」）：海報、人像、街景照片直接用使用者參考圖 wz_komichi_int.webp 的那幾張
    # v1f（BB_257 §10：v1e 直接裁斜牆、被拉寬、帶到木框和光斑）：四點透視校正（左上、左下、右下、右上），只取框裡面那一塊、邊緣往內縮
    ref = Image.open(os.path.join(HERE, '..', '..', '..', '..', 'docs', 'story_planning', 'ref_images', 'shops', 'wz_komichi_int.webp')).convert('RGB')
    for (quad, cell) in (((163, 168, 166, 468, 282, 453, 281, 212), (0, 3, 2, 3)),          # 青い季節（左牆斜面）
                         ((831, 261, 832, 410, 925, 410, 925, 261), (2, 3, 2, 3)),          # 夕陽の街
                         ((304, 133, 304, 246, 358, 251, 359, 166), (6, 3, 2, 2)),          # 人像（燈罩以上那一段）
                         ((562, 349, 563, 405, 630, 405, 630, 348), (4, 3, 2, 2))):         # 街景照片（避開右上的燈）
        bx_ = box(*cell); w_, h_ = bx_[2] - bx_[0], bx_[3] - bx_[1]
        im.paste(ref.transform((w_, h_), Image.QUAD, quad, Image.BICUBIC), (bx_[0], bx_[1]))
    im.save(os.path.join(GEN, 'kmc_print.png'))


def sns():
    """SUNNY SIDE（溫州街 B7，取代半熟；歐式街角早午餐；AA 2026-11-04 v1c；AA_654／AA_655；BB_257 §3 退件第 7、8 項）：
    sns_checker.png：黑白斜鋪小方磚（1024＝1.6 m，16×16 顆；每顆深淺、磚縫的髒污、低頻的磨損都不一樣，鋪起來 1.6 m 才重複一次）；
    sns_print.png：(0,0) 6×2 深綠菜單板、(0,2) 2×1 櫃台的金字木牌、(2,2) 2×2 水彩畫一（教堂街景，筆觸、暈染、鉛筆線）、(4,2) 2×2 水彩畫二（運河、房子、船）、
    (6,2) 1×1 桌卡、(7,2) 1×1 小菜單卡、(0,3) 2×2 右牆的小黑板（Today＋手繪的蛋和杯子）、(2,4) 2×2 舊照片（咖啡館門口）、(4,4) 2×2 植物插畫"""
    rng = np.random.default_rng(1105)
    S = 1024; yy, xx = np.mgrid[0:S, 0:S].astype(np.float32); s_ = S / 16.0
    u = (xx + yy) / s_; v = (xx - yy) / s_; iu, iv = np.floor(u), np.floor(v)
    chk = (iu + iv) % 2
    tid = (iu * 37 + iv * 101) % 97; tv = (np.sin(tid * 12.9898) * 43758.5453) % 1.0           # 每一顆磚自己的深淺
    white = np.array(hexc('#ece6da'), np.float32); black = np.array(hexc('#2e2e2c'), np.float32)
    base = np.where(chk[..., None] > 0.5, black * (0.95 + 0.1 * tv[..., None]), white * (0.94 + 0.08 * tv[..., None]))
    n = noise(S, S, 4, 5) - 0.5; lf = noise(S, S, 160, 9); base *= (1 + n[..., None] * 0.05)
    wear = np.clip((lf - 0.55) * 2.2, 0, 1)[..., None]                                          # 低頻的磨損（走道比較亮、比較霧）
    base = base * (1 - 0.12 * wear) + np.array(hexc('#c8bfae'), np.float32) * 0.12 * wear
    edge = np.minimum(np.abs(u - np.round(u)), np.abs(v - np.round(v))) * s_ / 1.414
    grout = (np.array(hexc('#b8b0a2'), np.float32) * (0.75 + 0.35 * (noise(S, S, 12, 11) - 0.5)[..., None]))
    base = np.where((edge < 2.2)[..., None], grout, base)
    chip = (noise(S, S, 2, 13) > 0.985) & (chk < 0.5); base[chip] *= 0.82                     # 白磚上零星的小缺角、污點
    Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).save(os.path.join(GEN, 'sns_checker.png'))
    im = Image.new('RGB', (1024, 1024), '#efe6d6'); d = ImageDraw.Draw(im)
    bx = box(0, 0, 6, 2); x0, y0, x1, y1 = bx; paper(im, bx, '#2c3e32', rng, grain=0.08); d.rectangle([x0 + 6, y0 + 6, x1 - 7, y1 - 7], outline='#b8944a', width=4)
    text_c(d, (x0 + 150, y0 + 108), 'SUNNY SIDE', F(40), '#e8d29a'); text_c(d, (x0 + 150, y0 + 150), '— BRUNCH —', F(16), '#e8d29a')
    d.line([x0 + 300, y0 + 40, x0 + 300, y1 - 40], fill='#b8944a', width=2); d.line([x0 + 540, y0 + 40, x0 + 540, y1 - 40], fill='#b8944a', width=2)
    text_c(d, (x0 + 420, y0 + 56), 'Brunch', F(24), '#e8d29a')
    for k, (n_, p_) in enumerate((('French Toast', 280), ('Eggs Benedict', 320), ('Croque Madame', 290))):
        d.text((x0 + 322, y0 + 96 + k * 34), n_, font=F(17), fill='#f1ead8'); d.text((x0 + 488, y0 + 96 + k * 34), str(p_), font=F(17), fill='#f1ead8')
    text_c(d, (x0 + 650, y0 + 56), 'Coffee & Tea', F(24), '#e8d29a')
    for k, (n_, p_) in enumerate((('Americano', 120), ('Latte', 150), ('Earl Grey', 140))):
        d.text((x0 + 566, y0 + 96 + k * 34), n_, font=F(17), fill='#f1ead8'); d.text((x0 + 712, y0 + 96 + k * 34), str(p_), font=F(17), fill='#f1ead8')
    bx = box(0, 2, 2, 1); x0, y0, x1, y1 = bx; paper(im, bx, '#5a3c26', rng, grain=0.2); d.rectangle([x0 + 10, y0 + 10, x1 - 11, y1 - 11], outline='#b8944a', width=3)
    text_c(d, ((x0 + x1) / 2, y0 + 52), 'SUNNY SIDE', F(30), '#e8d29a'); text_c(d, ((x0 + x1) / 2, y0 + 90), '— BRUNCH —', F(14), '#e8d29a')

    def watercolor(c, r, kind, seed):
        """水彩：紙紋、淡淡的天空、一筆一筆半透明的色塊（邊緣比較深）、暈開、鉛筆線、留白；外面是米白卡紙＋木框"""
        bx = box(c, r, 2, 2); x0, y0, x1, y1 = bx; d.rectangle(bx, fill='#f4efe4')
        W_, H_ = 196, 196; rr = np.random.default_rng(seed)
        pap = np.ones((H_, W_, 3), np.float32) * np.array([246, 241, 228], np.float32); pap *= (1 + (noise(W_, H_, 2, seed) - 0.5)[..., None] * 0.05)
        layer = Image.fromarray(pap.astype(np.uint8)).convert('RGBA')
        polys = []
        def wash(poly, col, a=90, blur=1.6):
            a = min(255, int(a * 1.45)); polys.append(poly) if a > 140 else None
            m = Image.new('L', (W_, H_), 0); ImageDraw.Draw(m).polygon(poly, fill=a); m = m.filter(ImageFilter.GaussianBlur(blur))
            edge_ = m.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.GaussianBlur(0.8)); m = Image.fromarray(np.clip(np.asarray(m, np.float32) + np.asarray(edge_, np.float32) * 0.9, 0, 255).astype(np.uint8))
            layer.alpha_composite(Image.merge('RGBA', (*[Image.new('L', (W_, H_), cc) for cc in col], m)))
        def jit(pts, j=2.5): return [(x + rr.uniform(-j, j), y + rr.uniform(-j, j)) for x, y in pts]
        wash([(0, 0), (W_, 0), (W_, H_ * 0.45), (0, H_ * 0.55)], (150, 186, 214), 70, 6)          # 天空
        if kind == 0:   # 教堂街景：圓頂、兩排房子、街道往裡面縮
            wash(jit([(70, 70), (126, 70), (126, 150), (70, 150)]), (214, 190, 150), 120)
            wash(jit([(78, 72), (98, 38), (118, 72)], 1.5), (120, 150, 140), 120); wash(jit([(94, 40), (98, 22), (102, 40)], 1), (90, 110, 100), 140)
            for k in range(4): x = 6 + k * 16 + rr.uniform(-2, 2); h = rr.uniform(70, 110); wash(jit([(x, h), (x + 15, h + rr.uniform(-6, 6)), (x + 15, 160), (x, 160)]), [(226, 196, 160), (210, 170, 140), (232, 214, 180), (190, 150, 130)][k], 110)
            for k in range(4): x = 130 + k * 16 + rr.uniform(-2, 2); h = rr.uniform(70, 110); wash(jit([(x, h), (x + 15, h + rr.uniform(-6, 6)), (x + 15, 160), (x, 160)]), [(200, 168, 140), (230, 206, 170), (214, 182, 150), (186, 160, 140)][k], 110)
            wash(jit([(0, 160), (W_, 160), (W_, H_), (0, H_)]), (176, 164, 150), 90, 3); wash(jit([(80, 160), (116, 160), (150, H_), (46, H_)]), (200, 186, 166), 80, 3)
            for k in range(6): x, y = rr.uniform(10, 186), rr.uniform(160, 190); wash(jit([(x, y), (x + 3, y - 12), (x + 6, y)], 0.8), (70, 70, 80), 130, 0.8)   # 行人
        else:   # 運河：水、兩岸房子倒影、小船
            for k in range(7):
                x = k * 28 + rr.uniform(-3, 3); h = rr.uniform(48, 90); col = [(214, 150, 120), (232, 206, 160), (190, 120, 100), (220, 190, 140), (170, 150, 130), (226, 170, 130), (200, 180, 160)][k]
                wash(jit([(x, h), (x + 14, h - 10), (x + 27, h), (x + 27, 122), (x, 122)]), col, 120); wash(jit([(x, 122), (x + 27, 122), (x + 27, 122 + (122 - h) * 0.6), (x, 122 + (122 - h) * 0.6)]), col, 45, 3)
            wash(jit([(0, 122), (W_, 122), (W_, H_), (0, H_)]), (110, 150, 160), 80, 4)
            for k in range(2): x = 40 + k * 90; wash(jit([(x, 150), (x + 40, 150), (x + 32, 160), (x + 6, 160)], 1), (90, 60, 50), 150, 0.8)
        img = layer.convert('RGB'); dd = ImageDraw.Draw(img)
        for poly in polys:                                                                     # 鉛筆線：沿著色塊的輪廓，斷斷續續、有點歪
            pts = [(x + rr.uniform(-1.5, 1.5), y + rr.uniform(-1.5, 1.5)) for x, y in poly] + [poly[0]]
            for p0, p1 in zip(pts[:-1], pts[1:]):
                if rr.random() < 0.75: dd.line([p0, p1], fill=(110, 96, 82), width=1)
        for k in range(10):                                                                    # 窗戶的小筆觸
            x, y = rr.uniform(8, 188), rr.uniform(80, 150); dd.rectangle([x, y, x + 3, y + 5], fill=(120, 110, 100))
        im.paste(img, (x0 + 30, y0 + 30)); d.rectangle(bx, outline='#8a6a3a', width=8)
        d.text((x1 - 70, y1 - 26), 'M. Lin', font=F(11), fill='#7a6a5a')
    watercolor(2, 2, 0, 41); watercolor(4, 2, 1, 42)
    bx = box(6, 2, 1, 1); x0, y0, x1, y1 = bx; d.rectangle(bx, fill='#f6f0e2'); text_c(d, ((x0 + x1) / 2, y0 + 40), 'SUNNY SIDE', F(13), '#2c3e32'); d.line([x0 + 30, y0 + 64, x1 - 30, y0 + 64], fill='#b8944a', width=2)
    bx = box(7, 2, 1, 1); x0, y0, x1, y1 = bx; d.rectangle(bx, fill='#f6f0e2'); d.text((x0 + 16, y0 + 16), 'MENU', font=F(16), fill='#2c3e32')
    for k in range(5): d.line([x0 + 16, y0 + 50 + k * 13, x1 - 20, y0 + 50 + k * 13], fill='#8a8270', width=2)
    bx = box(0, 3, 2, 2); paper(im, bx, '#262a26', rng, grain=0.14); x0, y0, x1, y1 = bx; d.rectangle(bx, outline='#6a4a30', width=10)   # 右牆小黑板
    d.text((x0 + 26, y0 + 22), 'Today', font=F(30), fill='#f1ead8'); d.text((x0 + 26, y0 + 64), 'Eggs Benedict', font=F(17), fill='#efe0b8'); d.text((x0 + 26, y0 + 90), 'three minutes forty', font=F(13), fill='#d8ccb0')
    d.ellipse([x0 + 150, y0 + 130, x0 + 220, y0 + 190], outline='#f1ead8', width=3); d.ellipse([x0 + 172, y0 + 150, x0 + 198, y0 + 172], fill='#e8c060')   # 手繪的太陽蛋
    d.arc([x0 + 40, y0 + 140, x0 + 100, y0 + 200], 200, 340, fill='#f1ead8', width=3); d.line([x0 + 44, y0 + 170, x0 + 96, y0 + 170], fill='#f1ead8', width=3)   # 杯子
    d.text((x0 + 26, y0 + 210), 'have a sunny day :)', font=F(14), fill='#d8ccb0')
    bx = box(2, 4, 2, 2); x0, y0, x1, y1 = bx; d.rectangle(bx, fill='#efe6d4'); ph = np.zeros((196, 196), np.float32) + 0.75   # 舊照片：咖啡館門口
    Y = np.arange(196)[:, None]; X = np.arange(196)[None, :]; ph = np.where((X > 60) & (X < 136) & (Y > 60), 0.32, ph); ph = np.where((X > 76) & (X < 120) & (Y > 90), 0.18, ph)
    ph = np.where(Y > 170, 0.55, ph); ph += rng.normal(0, 0.03, ph.shape); im.paste(Image.fromarray(np.stack([ph * 228, ph * 206, ph * 172], -1).clip(0, 255).astype(np.uint8)), (x0 + 30, y0 + 30)); d.rectangle(bx, outline='#3a2a1e', width=8)
    bx = box(4, 4, 2, 2); x0, y0, x1, y1 = bx; d.rectangle(bx, fill='#f4efe4')                  # 植物插畫（蕨葉）
    for k in range(9):
        a = -1.2 + k * 0.3; L_ = 60 + (k % 3) * 18; cx, cy = x0 + 128, y0 + 210
        ex, ey = cx + math.sin(a) * L_, cy - math.cos(a) * L_ * 1.6; d.line([(cx, cy), (ex, ey)], fill='#5a7a4a', width=2)
        for j in range(1, 8):
            t = j / 8; px, py = cx + (ex - cx) * t, cy + (ey - cy) * t; d.ellipse([px - 6, py - 3, px + 6, py + 3], fill=('#6a8a52', '#7a9a5a', '#5a7a48')[(j + k) % 3])
    d.rectangle(bx, outline='#c8b48a', width=6)
    im.save(os.path.join(GEN, 'sns_print.png'))

def yzn():
    """一盞茶屋（溫州街日式宿舍改的茶屋；AA 2026-11-04；AA_656／AA_657）：
    yzn_tatami.png：一張 1.8 m 見方＝兩疊榻榻米並排（藺草紋、深綠布邊）；
    yzn_print.png：(0,0) 1×2 「一盞」直的木牌、(1,0) 1×2 掛軸（水墨山水）、(2,0) 4×1 茶罐標籤 8 張（64×128，虛構茶名）、(6,0) 2×1 小菜單卡、(0,2) 2×2 豆花的舊照片（TRACE_SQ14）"""
    rng = np.random.default_rng(1106)
    S = 512; a = np.zeros((S, S, 3), np.float32); yy, xx = np.mgrid[0:S, 0:S]
    base = np.array(hexc('#c8be8a'), np.float32); a[:] = base
    a *= (1 + ((np.sin(yy * 1.9) * 0.5 + 0.5) * 0.07 - 0.035))[..., None]
    a *= (1 + (noise(S, S, 3, 7) - 0.5)[..., None] * 0.08)
    for k in range(2):
        x0 = k * 256
        for (u0, u1) in ((x0, x0 + 14), (x0 + 242, x0 + 256)): a[:, u0:u1] = np.array(hexc('#2f4a34'), np.float32) * (1 + (noise(14, S, 2, 8 + k)[:, :u1 - u0] - 0.5)[..., None] * 0.1)
    a[:3, :] *= 0.75; a[-3:, :] *= 0.75
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(GEN, 'yzn_tatami.png'))
    im = Image.new('RGB', (1024, 1024), '#e8dcc4'); d = ImageDraw.Draw(im)
    def vtext(x, y0, s_, f, fill, step):
        for k, ch in enumerate(s_): text_c(d, (x, y0 + k * step), ch, f, fill)
    bx = box(0, 0, 1, 2); x0, y0, x1, y1 = bx; paper(im, bx, '#a8845a', rng, grain=0.06); d.rectangle([x0 + 4, y0 + 4, x1 - 5, y1 - 5], outline='#4a321e', width=4)   # v1b：木紋顆粒小一點，字看得清楚
    vtext((x0 + x1) / 2, y0 + 70, '一盞', F(64), '#1e140c', 96)
    bx = box(1, 0, 1, 2); x0, y0, x1, y1 = bx; d.rectangle(bx, fill='#8a7a5a'); ix0, iy0, ix1, iy1 = x0 + 14, y0 + 26, x1 - 14, y1 - 26
    hh, ww = iy1 - iy0, ix1 - ix0; Y = np.arange(hh)[:, None]; X = np.arange(ww)[None, :]; g = np.zeros((hh, ww), np.float32) + 0.9
    for k, (cx, cy, r) in enumerate(((0.3, 0.45, 0.35), (0.7, 0.55, 0.3), (0.5, 0.75, 0.4))):
        ridge = hh * cy - np.sqrt(np.clip((ww * r) ** 2 - (X - ww * cx) ** 2, 0, None)) * 1.2
        g = np.where(Y > ridge, g - 0.18 - 0.08 * k, g)
    g = np.clip(g + rng.normal(0, 0.03, g.shape), 0.2, 1.0)
    im.paste(Image.fromarray(np.stack([g * 236, g * 228, g * 208], -1).astype(np.uint8)), (ix0, iy0)); d.rectangle([ix0, iy0, ix1, iy1], outline='#5a4a32', width=2)
    for k, (nm, bg) in enumerate((('煎茶', '#3a5a3a'), ('焙茶', '#7a4a2a'), ('玉露', '#2a4a3a'), ('抹茶', '#4a6a2a'), ('玄米', '#a88a4a'), ('烏龍', '#5a3a22'), ('包種', '#3a4a5a'), ('紅茶', '#7a2a22'))):
        x0, y0 = 256 + k * 64, 0; d.rectangle([x0 + 3, y0 + 3, x0 + 60, y0 + 124], fill='#f1ead8'); d.rectangle([x0 + 8, y0 + 20, x0 + 55, y0 + 108], fill=bg)
        vtext(x0 + 32, y0 + 44, nm, F(22), '#f1ead8', 30)
    bx = box(6, 0, 2, 1); x0, y0, x1, y1 = bx; d.rectangle(bx, fill='#f4ecd8'); d.rectangle([x0 + 6, y0 + 6, x1 - 7, y1 - 7], outline='#7a5a3a', width=2)
    text_c(d, ((x0 + x1) / 2, y0 + 24), '一盞　品書', F(20), '#2a1e14')
    for k, t in enumerate(('煎茶・焙茶・抹茶', '季節の和菓子')): text_c(d, ((x0 + x1) / 2, y0 + 58 + k * 30), t, F(15), '#3a2a1e')
    bx = box(0, 2, 2, 2); x0, y0, x1, y1 = bx; d.rectangle(bx, fill='#efe6d4'); ix0, iy0, ix1, iy1 = x0 + 22, y0 + 22, x1 - 22, y1 - 22
    hh, ww = iy1 - iy0, ix1 - ix0; Y = np.arange(hh)[:, None]; X = np.arange(ww)[None, :]; g = np.zeros((hh, ww), np.float32) + 0.72
    g = np.where(((X - ww * 0.5) ** 2 / (ww * 0.25) ** 2 + (Y - hh * 0.6) ** 2 / (hh * 0.2) ** 2) < 1, 0.92, g)
    g = np.where(((X - ww * 0.62) ** 2 + (Y - hh * 0.42) ** 2) < (ww * 0.1) ** 2, 0.9, g)
    g += rng.normal(0, 0.03, g.shape); im.paste(Image.fromarray(np.stack([g * 232, g * 210, g * 176], -1).clip(0, 255).astype(np.uint8)), (ix0, iy0)); d.rectangle(bx, outline='#3a2a1e', width=6)
    im.save(os.path.join(GEN, 'yzn_print.png'))
    yzn_floor()


def yzn_floor():
    """yzn_floor.png（v1d，BB_257 §12 建議）：laminate_floor_02 的木紋＋每片木板深淺不一（舊宿舍的木地板，有的換過、有的被曬淡）。
    顏色和 v1c 的 L.pbr(target='#c9ac84') 一樣（sRGB 像素的平均調到 target，同 b3lib.img_adj），再乘每片的係數 0.82～1.12、冷暖微調；
    靠牆、門口那一側的木板中間被走淡一點（橫向的磨損帶）。木板是橫的，一列 128 px（1k 圖），一列裡用接縫切成幾片。"""
    src = Image.open(os.path.join(os.path.dirname(HERE), 'textures', 'laminate_floor_02', 'laminate_floor_02_diff_1k.jpg')).convert('RGB')
    a = np.asarray(src, np.float32) / 255.0; lin = a.copy()   # b3lib.img_adj 是直接在 sRGB 像素上調平均，這裡一樣
    t = np.array(hexc('#c9ac84'), np.float32) / 255.0; lin *= t / lin.reshape(-1, 3).mean(0)
    L_ = a.mean(2); rng = np.random.default_rng(1107); S_ = lin.shape[0]
    rows = [66 + 128 * k for k in range(8)]
    for k in range(8):
        y0 = rows[k - 1] if k else rows[-1] - S_; y1 = rows[k]
        ys = [y % S_ for y in range(y0 + 2, y1 - 1)]
        col = L_[ys].mean(0); thr = col.mean() - 2.2 * col.std()
        cuts = [x for x in range(S_) if col[x] < thr and col[x] == col[max(0, x - 6):x + 7].min()]
        edges = sorted(set([0] + cuts + [S_]))
        for x0, x1 in zip(edges[:-1], edges[1:]):
            f = rng.uniform(0.82, 1.12); w_ = rng.uniform(-0.04, 0.04)
            m = np.array([f * (1 + w_), f, f * (1 - w_ * 1.5)], np.float32)
            for y in ys: lin[y, x0:x1] *= m
    wear = 1 + 0.06 * np.exp(-((np.arange(S_) - S_ * 0.5) / (S_ * 0.18)) ** 2)[None, :, None] * (0.6 + 0.4 * noise(S_, S_, 16, 1108)[..., None])
    out = np.clip(lin * wear, 0, 1)
    Image.fromarray((out * 255).clip(0, 255).astype(np.uint8)).resize((512, 512), Image.LANCZOS).save(os.path.join(GEN, 'yzn_floor.png'))


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
            band = tuple(int(0.6 * a_ + 0.4 * b_) for a_, b_ in zip(hexc(fg), hexc(col)))
            if rng.random() < 0.4: d.rectangle([x + 2, y0 + 128 - h + 6, x + w - 3, y0 + 128 - h + 8], fill=band); d.rectangle([x + 2, y0 + 120, x + w - 3, y0 + 122], fill=band)
            if lawrow:
                t = rng.choice(lawn); gl = Image.new('RGB', (w, 30 * len(t)), col); gd = ImageDraw.Draw(gl)
                for k, ch in enumerate(t): text_c(gd, (w / 2, 15 + k * 30), ch, F(min(26, w - 6)), fg)
                gl = gl.resize((w, max(8, int(gl.size[1] / 2.67))), Image.LANCZOS); im.paste(gl, (x, y0 + 128 - h + 14))
            else:   # v2：書名畫成直排的細字（一字一條短橫線，和底色混一半），不再是一格一格的方塊（v1 遠看像大樓的窗）
                fgm = tuple(int(0.55 * a_ + 0.45 * b_) for a_, b_ in zip(hexc(fg), hexc(col))); tw = max(2, min(w // 3, 8)); ty = y0 + 128 - h + rng.randint(12, 20)
                for k in range(rng.randint(3, 8)):
                    if ty + 4 > y0 + 128 - 14: break
                    d.rectangle([x + w // 2 - tw // 2, ty, x + w // 2 + tw // 2, ty + 1], fill=fgm); ty += rng.choice([4, 4, 5])
                if w > 26 and rng.random() < 0.5: d.rectangle([x + w // 2 - tw // 2 - 1, y0 + 128 - 16, x + w // 2 + tw // 2 + 1, y0 + 128 - 11], fill=fgm)   # 出版社的小標
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
    if w in ('mok', 'all'): mok(); mok_view()
    if w in ('shl', 'all'): shl()
    if w in ('mok', 'all'): bookrows('mok_bookrows.png', '#3b2a1f', 618)
    if w in ('shl', 'all'): bookrows('shl_bookrows.png', '#a88a62', 613, law=True)
    if w in ('yej', 'all'): yej()
    if w in ('aok', 'all'): aok()
    if w in ('afr', 'all'): afr()
    if w in ('dbk', 'all'): dbk()
    if w in ('a23', 'all'): a23()
    if w in ('kmc', 'all'): kmc()
    if w in ('sns', 'all'): sns()
    if w in ('yzn', 'all'): yzn()
    print('ok', w)
