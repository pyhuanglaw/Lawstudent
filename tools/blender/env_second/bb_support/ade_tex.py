"""阿德影印輸出（溫州街 A1，區域 wz_print）室內的自製貼圖（CC，帳號 A 的建模子代理，2026-11-04；照參考圖 wz_ade_int 做）。系統 python3（PIL、numpy）：
  python3 tools/blender/env_second/bb_support/ade_tex.py [--preview <輸出.jpg>]
輸出到 tools/blender/env_second/textures/gen/：
  ade_goods.png   印刷圖集（2048×1536）：影印・輸出價目表（價錢照室內參考圖，AA_654）、「裝訂樣式」「學生報告範例」展示板、A4／A3 紙箱、紙包、紙疊側面、
                  彩色資料夾書背、筆記本／活頁本書背、便利貼、牛皮紙袋（待取件）、掃碼付款小牌、櫃台的小告示、自助影印機上的貼紙、鍵盤、
                  裁紙刀的刻度板、軟木公告板（家教、租屋、讀書會的傳單）、阿芃的習作、冷氣出風口、層架標籤
  ade_alpha.png   透明貼圖集（1024²）：黃金葛葉 4 種、小葉 2 種、店門玻璃上的白色貼字（從店裡看是反的）、營業時間貼紙
  ade_emit.png    會亮的（1024×512）：LED 平板燈面、三台自助電腦的螢幕、影印機觸控面板、生產用影印機的操作螢幕、櫃台電腦、指示燈
  ade_sign.png    招牌（2048×512）：後牆的藍色招牌「阿德影印輸出」（印表機圖示、白色斜線；2048×331＝2.6×0.42 m）
  ade_ceil.png    天花板（512²＝1.2 m）：輕鋼架天花板（2×2 片 60 cm 礦纖板、白色 T 字骨架、細細的孔）
  ade_atlas.json  每一格的 UV 範圍（u0,v0,u1,v1；Blender 的 v 往上）
全部是程式畫的；字用系統的文泉驛正黑（wqy-zenhei，GPL＋字型例外：嵌進圖片可以）。店名「阿德影印輸出」照參考圖；
紙箱、影印機、電腦都沒有任何真實品牌、標誌（D77）；掃碼付款的 QR 是亂數畫的，不是任何真的支付；報告封面上的學校寫「首都帝大」（D115）。"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, '..', 'textures', 'gen')
os.makedirs(GEN, exist_ok=True)
R = np.random.default_rng(654)
ATL = {}
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
NAVY, NAVY2, WHITE = '#1f3a78', '#2b4a8e', '#f6f7f4'   # 參考圖的深藍（價目表、展示板、招牌）


def font(px): return ImageFont.truetype(FONT, max(6, int(px)))


def hx(h, a=255):
    h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (a,)


def rgb(h): return hx(h)[:3]


def uvbox(name, px0, py0, px1, py1, size):
    W, H = size; ATL[name] = [px0 / W, 1 - py1 / H, px1 / W, 1 - py0 / H]


def noise(w, h, k=8, amp=10, rng=R):
    n = rng.normal(0, 1, (h // k + 2, w // k + 2)); im = Image.fromarray(((n - n.min()) / (np.ptp(n) + 1e-6) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return (np.asarray(im, np.float32) / 255 - 0.5) * 2 * amp


def grain(im, amp=5, k=5):
    a = np.asarray(im.convert('RGB'), np.float32); n = noise(im.size[0], im.size[1], k, amp)[..., None]
    return Image.fromarray(np.clip(a + n, 0, 255).astype(np.uint8))


def text_c(d, xy, s, f, fill, anchor='mm', stroke=0):
    d.text(xy, s, font=f, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=fill)


def hand(d, x, y, s, f, col, rr, jit=1.5):
    for ch in s:
        d.text((x, y + rr.uniform(-jit, jit)), ch, font=f, fill=col, anchor='lm'); x += f.getlength(ch) * rr.uniform(0.95, 1.05)
    return x


def printer_icon(d, cx, cy, s, col, bg):
    """印表機圖示（招牌、價目表）：上面一張紙、機身、出紙口"""
    d.rectangle([cx - s * 0.28, cy - s * 0.5, cx + s * 0.28, cy - s * 0.12], outline=col, width=max(2, int(s * 0.07)))
    d.rounded_rectangle([cx - s * 0.5, cy - s * 0.16, cx + s * 0.5, cy + s * 0.3], radius=s * 0.08, fill=col)
    d.rectangle([cx - s * 0.3, cy + s * 0.12, cx + s * 0.3, cy + s * 0.5], fill=bg, outline=col, width=max(2, int(s * 0.07)))
    for k in range(2): y = cy + s * (0.25 + k * 0.12); d.line([cx - s * 0.18, y, cx + s * 0.18, y], fill=col, width=max(1, int(s * 0.04)))


# ======================= 印刷圖集的每一格 =======================
def price_board(im, d):
    """藍框白底的「影印・輸出價目表」（價錢照室內參考圖）"""
    w, h = im.size; d.rectangle([0, 0, w, h], fill=rgb(NAVY)); d.rectangle([10, 10, w - 10, h - 10], fill=rgb(WHITE))
    d.rectangle([10, 10, w - 10, 118], fill=rgb(NAVY)); text_c(d, (w / 2, 64), '影印・輸出價目表', font(52), rgb(WHITE))
    rows = [('黑白影印/列印', [('A4', '2 元/張'), ('A3', '4 元/張')]), ('彩色輸出', [('A4', '10 元/張'), ('A3', '20 元/張')]), ('雙面列印', [('', '+1 元/張')]),
            ('掃描(轉檔)', [('', '5 元/張')]), ('膠裝', [('', '80 元起')]), ('騎馬釘', [('', '15 元起')])]
    y = 132; fL, fS = font(34), font(30); rh = (h - 150) / 8
    for nm, subs in rows:
        hh = rh * len(subs); d.line([24, y + hh, w - 24, y + hh], fill=rgb('#9aa6c0'), width=2)
        d.text((30, y + hh / 2), nm, font=fL, fill=rgb('#1a2a50'), anchor='lm')
        for k, (sz, pr) in enumerate(subs):
            yy = y + rh * (k + 0.5)
            if sz: d.text((w * 0.58, yy), sz, font=fS, fill=rgb('#1a2a50'), anchor='lm')
            d.text((w - 30, yy), pr, font=fS, fill=rgb('#1a2a50'), anchor='rm', stroke_width=1, stroke_fill=rgb('#1a2a50'))
        y += hh
    d.line([w * 0.55, 132, w * 0.55, h - 22], fill=rgb('#b8c0d4'), width=2)


def sample_board(title, kind):
    def f(im, d):
        w, h = im.size; rr = np.random.default_rng(len(title) * 7 + w)
        d.rectangle([0, 0, w, h], fill=rgb('#e9ebee')); d.rectangle([0, 0, w - 1, h - 1], outline=rgb('#b8bcc4'), width=6)
        d.rectangle([0, 0, w, 96], fill=rgb(NAVY)); text_c(d, (w / 2, 50), title, font(48 if len(title) < 5 else 44), rgb(WHITE))
        if kind == 'bind':   # 線圈本、膠裝本（黑、灰、白、深藍）
            cols = ['#2a2c30', '#e8e8e6', '#f4f4f2', '#8a8e94', '#d8dadc', '#3a3e44']
            cw, ch = (w - 70) / 3, (h - 150) / 2
            for k in range(6):
                x0, y0 = 22 + (k % 3) * (cw + 12), 118 + (k // 3) * (ch + 16); c = cols[k]
                d.rectangle([x0 + 5, y0 + 5, x0 + cw + 5, y0 + ch + 5], fill=rgb('#b0b4ba'))
                d.rectangle([x0, y0, x0 + cw, y0 + ch], fill=rgb(c), outline=rgb('#9a9ea4'))
                for j in range(int(ch // 14)): d.ellipse([x0 - 5, y0 + 8 + j * 14, x0 + 7, y0 + 16 + j * 14], outline=rgb('#202020'), width=2)   # 線圈
                if c in ('#e8e8e6', '#f4f4f2', '#d8dadc'):
                    for j in range(4): d.line([x0 + cw * 0.25, y0 + ch * (0.2 + j * 0.06), x0 + cw * 0.8, y0 + ch * (0.2 + j * 0.06)], fill=rgb('#7a7e86'), width=2)
        else:   # 學生報告範例：封面（報告題目、學號姓名、一張校園照片）
            cw, ch = (w - 70) / 3, (h - 150) / 2
            titles = ['期末報告', '社會調查', '專題研究', '法學方法', '畢業論文', '小組報告']
            for k in range(6):
                x0, y0 = 22 + (k % 3) * (cw + 12), 118 + (k // 3) * (ch + 16)
                d.rectangle([x0 + 5, y0 + 5, x0 + cw + 5, y0 + ch + 5], fill=rgb('#b0b4ba'))
                bg = ['#f6f6f2', '#f4f1e6', '#f6f6f2', '#e8dcc0', '#f6f6f2', '#f2f2ee'][k]; d.rectangle([x0, y0, x0 + cw, y0 + ch], fill=rgb(bg), outline=rgb('#a0a4aa'))
                for j in range(int(ch // 14)): d.ellipse([x0 - 5, y0 + 8 + j * 14, x0 + 7, y0 + 16 + j * 14], outline=rgb('#303030'), width=2)
                text_c(d, (x0 + cw / 2, y0 + ch * 0.14), '首都帝大', font(cw * 0.12), rgb('#2a3a6a'))
                text_c(d, (x0 + cw / 2, y0 + ch * 0.26), titles[k], font(cw * 0.15), rgb('#1a1a1a'))
                if k in (1, 4):   # 校園照片（紅磚樓、樹、天空）
                    px0, py0, px1, py1 = x0 + cw * 0.12, y0 + ch * 0.36, x0 + cw * 0.88, y0 + ch * 0.72
                    d.rectangle([px0, py0, px1, py1], fill=rgb('#9cc0e0')); d.rectangle([px0, py0 + (py1 - py0) * 0.45, px1, py1], fill=rgb('#a8643e'))
                    for j in range(5): xx = px0 + (px1 - px0) * (0.1 + j * 0.18); d.rectangle([xx, py0 + (py1 - py0) * 0.55, xx + 6, py0 + (py1 - py0) * 0.75], fill=rgb('#f0e8d8'))
                    d.rectangle([px0, py1 - (py1 - py0) * 0.15, px1, py1], fill=rgb('#5a7a3a'))
                for j in range(3): d.line([x0 + cw * 0.3, y0 + ch * (0.8 + j * 0.05), x0 + cw * 0.7, y0 + ch * (0.8 + j * 0.05)], fill=rgb('#888888'), width=2)
    return f


def paper_box(size):
    def f(im, d):
        w, h = im.size; d.rectangle([0, 0, w, h], fill=rgb('#f2f2f0'))
        d.rectangle([0, h * 0.62, w, h * 0.72], fill=rgb('#2b56a8')); d.rectangle([0, h * 0.74, w, h * 0.77], fill=rgb('#2b56a8'))
        d.rectangle([14, 18, 14 + h * 0.36, 18 + h * 0.36], fill=rgb('#2b56a8')); text_c(d, (14 + h * 0.18, 18 + h * 0.18), size, font(h * 0.2), rgb(WHITE))
        d.text((24 + h * 0.4, 30), '影印紙 80g', font=font(h * 0.12), fill=rgb('#2b56a8'), anchor='lm'); d.text((24 + h * 0.4, 30 + h * 0.15), '500 張 × 5 包', font=font(h * 0.1), fill=rgb('#555a66'), anchor='lm')
        a = np.asarray(im, np.float32); a += noise(w, h, 6, 4)[..., None]; im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))
    return f


def ream(col, label):
    def f(im, d):
        w, h = im.size; d.rectangle([0, 0, w, h], fill=rgb('#f4f4f2')); d.rectangle([0, h * 0.3, w, h * 0.7], fill=rgb(col)); text_c(d, (w / 2, h / 2), label, font(h * 0.28), rgb(WHITE))
    return f


def paper_edge(im, d):
    """一疊紙的側面（細細的一條一條、偶爾一張有色紙）"""
    w, h = im.size; a = np.zeros((h, w, 3), np.float32) + 240; rr = np.random.default_rng(5)
    for y in range(h):
        v = 236 + rr.uniform(-8, 6) + (6 if y % 3 == 0 else 0); a[y] = v
        if rr.random() < 0.04: a[y] = rgb(['#f0d8a0', '#cfe2f0', '#f2c8d0', '#d8ecc8'][rr.integers(4)])
    a += noise(w, h, 3, 3)[..., None]; im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))


def spines(kind):
    """層架上一整排的書背：binders＝彩色資料夾（參考圖右邊那一排粉彩色）；notebooks＝牛皮紙筆記本、黑色線圈本、活頁本"""
    def f(im, d):
        w, h = im.size; rr = np.random.default_rng(len(kind)); x = 0
        if kind == 'binders':
            cols = ['#f2a0a8', '#f6c49a', '#f4e08a', '#bfe0a0', '#9fd8c8', '#a8c8f0', '#c0b0ec', '#e8b0dc', '#f0f0f0', '#9ab4e0', '#f8d0a8', '#b8e8e0']
            while x < w:
                bw = rr.uniform(24, 34); c = cols[rr.integers(len(cols))]; d.rectangle([x, 0, x + bw - 2, h], fill=rgb(c)); d.rectangle([x + bw - 2, 0, x + bw, h], fill=rgb('#5a5a5a'))
                d.rectangle([x + 4, h * 0.12, x + bw - 6, h * 0.28], fill=rgb('#fbfbf8')); d.ellipse([x + bw / 2 - 5, h * 0.78, x + bw / 2 + 5, h * 0.84], fill=rgb('#606060')); x += bw
        else:
            while x < w:
                t = rr.random(); bw = rr.uniform(10, 26)
                c = '#b88a5a' if t < 0.45 else ('#2a2a2c' if t < 0.65 else ['#d8d4cc', '#3a5a8a', '#8a2a2a', '#4a6a4a'][rr.integers(4)])
                hh = h * rr.uniform(0.82, 1.0); d.rectangle([x, h - hh, x + bw - 1, h], fill=rgb(c)); d.line([x + bw - 1, h - hh, x + bw - 1, h], fill=rgb('#30302e'), width=1)
                if c == '#b88a5a': d.rectangle([x + 2, h - hh * 0.7, x + bw - 3, h - hh * 0.6], fill=rgb('#f2ead8'))
                x += bw
        a = np.asarray(im, np.float32); a *= 1 - 0.18 * np.linspace(0, 1, h)[:, None, None] ** 2; im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))
    return f


SPINE_COLS = ['#f2a0a8', '#f6c49a', '#f4e08a', '#bfe0a0', '#9fd8c8', '#a8c8f0', '#c0b0ec', '#e8b0dc', '#f0f0f0', '#9ab4e0', '#f8d0a8', '#b8e8e0',
              '#b88a5a', '#a87a4a', '#2a2a2c', '#2a2a2c', '#3a5a8a', '#8a2a2a', '#4a6a4a', '#d8d4cc']   # v1c：0–11 粉彩資料夾、12–19 筆記本／活頁本


def spine_set(im, d):
    """v1c：一本一本的書背（BB_257 §7-2：資料夾、筆記本要一本一本做）。20 欄，每欄一本：0–11 資料夾（白色標籤、拉環孔）、
    12–13 牛皮紙筆記本（米色標籤）、14 黑色線圈本（線圈點）、15 黑色硬殼、16–19 活頁本（色條）。模型取一欄貼在書背、側面取同一欄中間的純色"""
    w, h = im.size; n = len(SPINE_COLS); cw = w / n
    for k, c in enumerate(SPINE_COLS):
        x0, x1 = k * cw, (k + 1) * cw; d.rectangle([x0, 0, x1, h], fill=rgb(c)); d.rectangle([x1 - 2, 0, x1, h], fill=rgb('#4a4a48')); d.rectangle([x0, 0, x0 + 1, h], fill=rgb('#4a4a48'))
        if k < 12:
            d.rectangle([x0 + 5, h * 0.12, x1 - 6, h * 0.28], fill=rgb('#fbfbf8')); d.line([x0 + 8, h * 0.18, x1 - 9, h * 0.18], fill=rgb('#9a9a9a'), width=1)
            d.ellipse([(x0 + x1) / 2 - 5, h * 0.78, (x0 + x1) / 2 + 5, h * 0.84], fill=rgb('#606060'))
        elif k < 14: d.rectangle([x0 + 4, h * 0.2, x1 - 5, h * 0.32], fill=rgb('#f2ead8'))
        elif k == 14:
            for y in range(int(h * 0.06), int(h * 0.95), 9): d.ellipse([(x0 + x1) / 2 - 3, y, (x0 + x1) / 2 + 3, y + 5], fill=rgb('#b8b8b8'))
        else: d.rectangle([x0 + 3, h * 0.08, x1 - 4, h * 0.13], fill=rgb('#e8e4d8' if k > 15 else '#5a5a58'))
    a = np.asarray(im, np.float32); a *= 1 - 0.14 * np.linspace(0, 1, h)[:, None, None] ** 2; im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))


def sticky(im, d):
    w, h = im.size; cols = ['#f8e870', '#f8b0c8', '#a8e0f0', '#b8f0a0', '#f8c880', '#f4f4a0']
    for k in range(6): d.rectangle([k * w / 6, 0, (k + 1) * w / 6 - 3, h], fill=rgb(cols[k]))
    for y in range(0, h, 4): d.line([0, y, w, y], fill=(0, 0, 0), width=1) if False else None
    a = np.asarray(im, np.float32); a[::3] *= 0.96; im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))


def kraft_env(im, d):
    w, h = im.size; d.rectangle([0, 0, w, h], fill=rgb('#c49a64')); rr = np.random.default_rng(9)
    d.rectangle([w * 0.1, h * 0.12, w * 0.9, h * 0.5], fill=rgb('#f2ead6')); hand(d, w * 0.14, h * 0.24, '待取件', font(h * 0.14), rgb('#202020'), rr); hand(d, w * 0.14, h * 0.4, '林同學 膠裝×3', font(h * 0.11), rgb('#1a3a8a'), rr)
    a = np.asarray(im, np.float32); a += noise(w, h, 4, 7)[..., None]; im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))


def qr_stand(im, d):
    w, h = im.size; d.rectangle([0, 0, w, h], fill=rgb('#f4f4f2')); d.rectangle([0, 0, w, h * 0.2], fill=rgb(NAVY)); text_c(d, (w / 2, h * 0.1), '掃碼付款', font(h * 0.11), rgb(WHITE))
    rr = np.random.default_rng(3); s = w * 0.7; x0, y0 = (w - s) / 2, h * 0.27; n = 21; c = s / n
    for i in range(n):
        for j in range(n):
            fin = (i < 7 and j < 7) or (i < 7 and j >= n - 7) or (i >= n - 7 and j < 7)
            on = ((min(i, 6 - i if i < 7 else i - (n - 7), j, 6 - j if j < 7 else j - (n - 7)) in (0, 2, 3, 4)) if fin else rr.random() < 0.48)
            if fin: on = (i in (0, 6, n - 7, n - 1) or j in (0, 6, n - 7, n - 1) or (2 <= i % (n - 7) <= 4 and 2 <= j % (n - 7) <= 4)) and not (i in range(7, n - 7) or j in range(7, n - 7))
            if on: d.rectangle([x0 + i * c, y0 + j * c, x0 + (i + 1) * c, y0 + (j + 1) * c], fill=rgb('#111111'))
    text_c(d, (w / 2, h * 0.9), '列印・影印 付款', font(h * 0.07), rgb('#333333'))


def note(lines, col='#1f3a78', paper='#fbfbf6', head=None):
    def f(im, d):
        w, h = im.size; d.rectangle([0, 0, w, h], fill=rgb(paper)); y0 = 0
        if head: d.rectangle([0, 0, w, h * 0.3], fill=rgb(head)); y0 = h * 0.3
        n = len(lines)
        for k, s in enumerate(lines):
            c = rgb(WHITE) if (head and k == 0) else rgb(col); yy = (h * 0.15) if (head and k == 0) else y0 + (h - y0) * (k + (0.5 if not head else -0.5)) / (n if not head else n - 1)
            text_c(d, (w / 2, yy), s, font(min(h * 0.22, w / (len(s) + 1) * 1.1)), c)
        d.rectangle([0, 0, w - 1, h - 1], outline=rgb('#9aa0aa'), width=2)
    return f


def keyboard(im, d):
    w, h = im.size; d.rectangle([0, 0, w, h], fill=rgb('#2a2b2e'))
    for r in range(5):
        n = 14 - (r == 4) * 4; kw = (w - 12) / 15
        for k in range(n):
            x0 = 6 + k * kw + (r * 3); y0 = 5 + r * (h - 10) / 5; ww = kw - 3 if not (r == 4 and k == 4) else kw * 5
            if r == 4 and k > 4: x0 += kw * 4
            d.rounded_rectangle([x0, y0, x0 + ww, y0 + (h - 10) / 5 - 3], radius=2, fill=rgb('#3c3d41'))


def cutter_top(im, d):
    w, h = im.size; d.rectangle([0, 0, w, h], fill=rgb('#d8dcd4'))
    for k in range(0, w, 16): d.line([k, 0, k, h], fill=rgb('#8a9aa0'), width=1 if k % 80 else 2)
    for k in range(0, h, 16): d.line([0, k, w, k], fill=rgb('#8a9aa0'), width=1 if k % 80 else 2)
    d.text((8, h - 20), 'A4  A5  B5', font=font(16), fill=rgb('#3a4a6a'), anchor='lm')


def cork(im, d):
    """軟木公告板：家教、租屋、讀書會、社團的傳單（虛構）"""
    w, h = im.size; a = np.zeros((h, w, 3), np.float32) + rgb('#b48a5a'); a += noise(w, h, 2, 22)[..., None]; im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, w - 1, h - 1], outline=rgb('#7a5a38'), width=10); rr = np.random.default_rng(11)
    fl = [('徵家教', '國中數學', '#fbfbf2'), ('雅房出租', '溫州街 步行5分', '#f6f0d6'), ('讀書會', '民法總則 週三晚', '#e6f0fa'), ('二手書', '六法全書', '#fbe8ec'), ('社團招生', '攝影社', '#eef8e4')]
    pos = [(20, 22, 150, 150), (180, 30, 150, 130), (24, 190, 140, 120), (176, 180, 160, 140), (110, 330, 150, 110)]
    for (t1, t2, c), (x, y, ww, hh) in zip(fl, pos):
        if y + hh > h - 12: hh = h - 12 - y
        d.rectangle([x + 3, y + 3, x + ww + 3, y + hh + 3], fill=rgb('#6a4a2a')); d.rectangle([x, y, x + ww, y + hh], fill=rgb(c))
        hand(d, x + 10, y + hh * 0.25, t1, font(ww * 0.17), rgb('#1a2a5a'), rr); hand(d, x + 10, y + hh * 0.55, t2, font(ww * 0.1), rgb('#333333'), rr)
        for k in range(5): d.line([x + 10 + k * ww / 6, y + hh * 0.78, x + 10 + k * ww / 6, y + hh - 4], fill=rgb('#888888'), width=1)
        d.ellipse([x + ww / 2 - 6, y - 2, x + ww / 2 + 6, y + 10], fill=rgb(['#d02a2a', '#2a5ad0', '#e0b020'][rr.integers(3)]))


def workbook(im, d):
    w, h = im.size; d.rectangle([0, 0, w, h], fill=rgb('#f0e8d0')); d.rectangle([0, 0, w, h * 0.32], fill=rgb('#e07050'))
    text_c(d, (w / 2, h * 0.16), '數學習作', font(w * 0.16), rgb(WHITE)); text_c(d, (w / 2, h * 0.45), '四年級 上', font(w * 0.1), rgb('#5a3a2a'))
    for k in range(3): d.ellipse([w * (0.2 + k * 0.25), h * 0.6, w * (0.32 + k * 0.25), h * 0.72], fill=rgb(['#f0c040', '#60a0e0', '#80c060'][k]))


def ac_grille(im, d):
    w, h = im.size; d.rectangle([0, 0, w, h], fill=rgb('#eceae4')); m = w * 0.14
    for k in range(4):   # 四面出風口
        if k % 2 == 0: y = m * 0.5 if k == 0 else h - m * 1.1; d.rectangle([m, y, w - m, y + m * 0.6], fill=rgb('#9a9a96'))
        else: x = m * 0.5 if k == 1 else w - m * 1.1; d.rectangle([x, m, x + m * 0.6, h - m], fill=rgb('#9a9a96'))
    for k in range(int(w * 0.3), int(w * 0.7), 6): d.line([k, h * 0.3, k, h * 0.7], fill=rgb('#c4c2bc'), width=2)


def shelf_label(im, d):
    w, h = im.size; d.rectangle([0, 0, w, h], fill=rgb('#f6f6f2')); labels = ['資料夾', '筆記本', '文具', '便利貼', 'A4 影印紙', 'A3']
    for k, s in enumerate(labels): x = k * w / 6; d.rectangle([x + 2, 2, x + w / 6 - 2, h - 2], outline=rgb(NAVY), width=2); text_c(d, (x + w / 12, h / 2), s, font(h * 0.5), rgb(NAVY))


def copier_front(kind, model=None, n=None, tag=0.06, dark_last=None):
    """影印機正面（紙匣、把手、紙量窗、型號是虛構的「AD-」；沒有品牌）。v1c：兩台自助、兩台生產用各是不同機型（BB_257 §7-4）——
    model＝型號、n＝紙匣層數、tag＝「自助」貼紙的位置（左邊算起的比例）、dark_last＝最下面一格是不是深灰的大容量紙匣"""
    model = model or ('AD-3020' if kind == 'self' else 'AD-7500'); n = n or (4 if kind == 'self' else 3)
    dark_last = (kind == 'self') if dark_last is None else dark_last
    def f(im, d):
        w, h = im.size; d.rectangle([0, 0, w, h], fill=rgb('#eeeeec'))
        top = h * 0.18; d.rectangle([0, 0, w, top], fill=rgb('#e4e4e2')); d.text((10, top / 2), model, font=font(top * 0.35), fill=rgb('#6a6e76'), anchor='lm')
        ys = [top + k * (h - top) / n for k in range(n + 1)]
        if dark_last and n >= 3: ys = [top + k * (h - top) * 0.62 / (n - 1) for k in range(n)] + [h]   # 大容量紙匣：最下面一格比較高
        for k in range(n):
            y0, y1 = ys[k], ys[k + 1]
            d.rectangle([4, y0 + 3, w - 4, y1 - 3], fill=rgb('#f2f2f0'), outline=rgb('#b8bab8'), width=2)
            d.rounded_rectangle([w * 0.35, y0 + (y1 - y0) * 0.3, w * 0.65, y0 + (y1 - y0) * 0.45], radius=4, fill=rgb('#3a3c40'))
            d.rectangle([w * 0.8, y0 + (y1 - y0) * 0.3, w * 0.9, y0 + (y1 - y0) * 0.6], fill=rgb('#9aa0a8')); d.text((10, y0 + (y1 - y0) * 0.5), str(k + 1), font=font(min(y1 - y0, 60) * 0.22), fill=rgb('#8a8e96'), anchor='lm')
        if dark_last: d.rectangle([4, ys[-2] + 3, w - 4, h - 3], fill=rgb('#3c3f44'))   # 最下面一格深灰（參考圖）
        if kind == 'self': d.rectangle([w * tag, top + 6, w * (tag + 0.24), top + 6 + h * 0.07], fill=rgb('#2b56a8')); text_c(d, (w * (tag + 0.12), top + 6 + h * 0.035), '自助', font(h * 0.045), rgb(WHITE))
    return f


def repair_note(im, d):
    """貼在生產用影印機 B 上的「維修中」紙（手寫、膠帶）"""
    w, h = im.size; d.rectangle([0, 0, w, h], fill=rgb('#fbfaf2')); rr = np.random.default_rng(12)
    hand(d, w * 0.12, h * 0.34, '維修中', font(h * 0.3), rgb('#c0302a'), rr, jit=2.5); hand(d, w * 0.12, h * 0.7, '請用左邊那台 ── 阿德', font(h * 0.12), rgb('#202020'), rr)
    d.rectangle([w * 0.38, 0, w * 0.62, h * 0.08], fill=(226, 222, 196))


def self_copy_note(im, d):
    w, h = im.size; d.rectangle([0, 0, w, h], fill=rgb('#fbfbf6')); d.rectangle([0, 0, w, h * 0.34], fill=rgb('#2b56a8'))
    text_c(d, (w / 2, h * 0.17), '自助影印', font(h * 0.22), rgb(WHITE)); text_c(d, (w / 2, h * 0.52), '黑白 A4 2元', font(h * 0.17), rgb('#1a2a50')); text_c(d, (w / 2, h * 0.78), '投幣・找零在櫃台', font(h * 0.13), rgb('#444444'))


def wall_clock(im, d):
    w, h = im.size; d.ellipse([2, 2, w - 2, h - 2], fill=rgb('#f8f8f6'), outline=rgb('#2a2a2a'), width=8)
    for k in range(12):
        a = k * math.pi / 6; r0, r1 = w * 0.38, w * 0.44; d.line([w / 2 + r0 * math.sin(a), h / 2 - r0 * math.cos(a), w / 2 + r1 * math.sin(a), h / 2 - r1 * math.cos(a)], fill=rgb('#2a2a2a'), width=4)
    d.line([w / 2, h / 2, w / 2 + w * 0.22 * math.sin(4.2), h / 2 - w * 0.22 * math.cos(4.2)], fill=rgb('#1a1a1a'), width=6); d.line([w / 2, h / 2, w / 2 + w * 0.34 * math.sin(1.0), h / 2 - w * 0.34 * math.cos(1.0)], fill=rgb('#1a1a1a'), width=4)


def plotter_face(im, d):
    w, h = im.size; d.rectangle([0, 0, w, h], fill=rgb('#e8e8e6')); d.rectangle([0, h * 0.62, w, h], fill=rgb('#2c2e32'))
    d.rectangle([w * 0.05, h * 0.18, w * 0.95, h * 0.24], fill=rgb('#3a3c40')); d.text((w * 0.05, h * 0.08), 'AD-PLOT 36', font=font(h * 0.08), fill=rgb('#5a5e66'), anchor='lm')
    d.rectangle([w * 0.78, h * 0.3, w * 0.94, h * 0.5], fill=rgb('#202226')); text_c(d, (w * 0.4, h * 0.42), '大圖輸出 海報・壁報', font(h * 0.08), rgb('#2b56a8'))


def calendar(im, d):
    w, h = im.size; d.rectangle([0, 0, w, h], fill=rgb('#fbfbf8')); d.rectangle([0, 0, w, h * 0.42], fill=rgb('#7aa0c8'))
    d.ellipse([w * 0.6, h * 0.06, w * 0.86, h * 0.22], fill=rgb('#f8f0d0')); d.polygon([(0, h * 0.42), (w * 0.35, h * 0.18), (w * 0.7, h * 0.42)], fill=rgb('#4a6a4a'))
    text_c(d, (w / 2, h * 0.5), '11', font(h * 0.08), rgb('#c02a2a'))
    for r in range(5):
        for c in range(7): text_c(d, (w * (0.1 + c * 0.13), h * (0.6 + r * 0.075)), str(r * 7 + c + 1) if r * 7 + c < 30 else '', font(h * 0.04), rgb('#c02a2a' if c == 0 else '#333333'))


GW, GH = 2048, 1536   # v1c：多了兩台不同機型的影印機正面、「維修中」，2048×1280 放不下
G = Image.new('RGB', (GW, GH), rgb('#e8e8e4'))
CELLS = [('price_board', 512, 784, price_board), ('board_binding', 384, 560, sample_board('裝訂樣式', 'bind')), ('board_report', 512, 652, sample_board('學生報告範例', 'report')),
         ('box_a4', 256, 176, paper_box('A4')), ('box_a3', 256, 176, paper_box('A3')), ('ream_a4', 256, 64, ream('#2b56a8', 'A4 80g')), ('ream_a3', 256, 64, ream('#3a8a5a', 'A3 80g')),
         ('ream_c', 256, 64, ream('#c06a2a', '色紙 A4')), ('paper_edge', 256, 96, paper_edge), ('binders', 512, 224, spines('binders')), ('notebooks', 512, 224, spines('notebooks')),
         ('sticky', 192, 64, sticky), ('kraft_env', 192, 256, kraft_env), ('qr_stand', 160, 240, qr_stand),
         ('note_pay', 256, 128, note(['列印請至櫃台付款', '謝謝'], head=NAVY)), ('note_bell', 192, 96, note(['有事請按鈴'], col='#1a2a50')),
         ('note_pickup', 256, 128, note(['取件處', '請報姓名'], head='#2b56a8')), ('note_kid', 192, 128, note(['員工區', '請勿進入'], col='#8a2a2a', paper='#fff8e8')),
         ('self_copy', 192, 128, self_copy_note), ('keyboard', 256, 80, keyboard), ('cutter_top', 256, 192, cutter_top), ('cork', 360, 460, cork), ('workbook', 160, 220, workbook),
         ('ac_grille', 192, 192, ac_grille), ('shelf_label', 512, 40, shelf_label), ('copier_self', 256, 320, copier_front('self')), ('copier_prod', 320, 320, copier_front('prod')),
         ('copier_self_b', 256, 256, copier_front('self', 'AD-2510', 3, tag=0.64, dark_last=True)), ('copier_prod_b', 320, 320, copier_front('prod', 'AD-7800', 2, dark_last=True)), ('note_repair', 192, 128, repair_note), ('spines1', 640, 224, spine_set),
         ('clock', 160, 160, wall_clock), ('plotter_face', 384, 256, plotter_face), ('calendar', 160, 240, calendar)]


def pack(cells, W):
    """天際線排版：每一件放在目前最低、放得下的位置（高的先放）"""
    order = sorted(cells, key=lambda c: (-c[2], -c[1])); sky = [0] * (W // 16); pos = {}
    for nm, w, h, fn in order:
        n = -(-w // 16); best = None
        for i in range(0, len(sky) - n + 1):
            y = max(sky[i:i + n])
            if best is None or y < best[1]: best = (i, y)
        i, y = best; pos[nm] = (i * 16, y)
        for j in range(i, i + n): sky[j] = y + h
    assert max(sky) <= GH, f'atlas overflow {max(sky)}'
    return pos, max(sky)


POS, used = pack(CELLS, GW)
for nm, w, h, fn in CELLS:
    x0, y0 = POS[nm]; im = Image.new('RGB', (w, h), (230, 230, 230)); fn(im, ImageDraw.Draw(im)); im = grain(im, 3, 4); G.paste(im, (x0, y0)); uvbox(nm, x0 + 2, y0 + 2, x0 + w - 2, y0 + h - 2, (GW, GH))
G.save(os.path.join(GEN, 'ade_goods.png'))

# ======================= 2. 透明貼圖集（1024²） =======================
AW, AH = 1024, 1024
A = Image.new('RGBA', (AW, AH), (0, 0, 0, 0))


def leafimg(w, h, shape, col, seed, yel=False):
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im); d.polygon(shape, fill=hx(col))
    la = np.asarray(im, np.float32); mk = la[..., 3] > 0; rr = np.random.default_rng(seed)
    if yel: n_ = noise(w, h, 10, 40, rr); y_ = (n_ > 18) & mk; la[y_, 0] += 70; la[y_, 1] += 55; la[y_, 2] += 5
    la[mk, :3] += noise(w, h, 4, 8, rr)[mk][:, None]; return Image.fromarray(np.clip(la, 0, 255).astype(np.uint8))


x = 0
for k in range(4):   # 黃金葛（心形、黃斑）
    lf = leafimg(160, 208, [(80, 204), (16, 98), (20, 50), (50, 18), (80, 42), (110, 18), (140, 50), (144, 98)], ['#3f6f30', '#4d7d36', '#5a8a3c', '#3a6230'][k], k, True)
    ImageDraw.Draw(lf).line([80, 204, 80, 40], fill=hx('#9ab060'), width=3); A.paste(lf, (x, 0)); uvbox(f'leaf{k}', x, 0, x + 160, 208, (AW, AH)); x += 160
for k in range(2):   # 小葉
    lf = leafimg(128, 128, [(64, 126), (20, 80), (24, 30), (64, 4), (104, 30), (108, 80)], ['#4a7a3a', '#5a8a42'][k], 20 + k); A.paste(lf, (640 + k * 128, 0)); uvbox(f'small{k}', 640 + k * 128, 0, 768 + k * 128, 128, (AW, AH))
# 店門玻璃的白色貼字（外觀圖：影印・複印、掃描建檔、彩色列印、論文裝訂）；從店裡看是反的——貼圖照外面看的方向畫，貼的時候 UV 左右翻
dc = Image.new('RGBA', (512, 512), (0, 0, 0, 0)); dd = ImageDraw.Draw(dc)
for k, s in enumerate(['影印・複印', '掃描建檔', '彩色列印', '論文裝訂']):
    y = 60 + k * 110; dd.rounded_rectangle([20, y - 32, 84, y + 32], radius=8, outline=(255, 255, 255, 255), width=5); dd.rectangle([36, y - 16, 68, y + 16], fill=(255, 255, 255, 230))
    dd.text((110, y), s, font=font(56), fill=(255, 255, 255, 255), anchor='lm')
A.paste(dc, (0, 256)); uvbox('decal', 0, 256, 512, 768, (AW, AH))
hs = Image.new('RGBA', (384, 256), (0, 0, 0, 0)); hd = ImageDraw.Draw(hs); hd.rounded_rectangle([4, 4, 380, 252], radius=14, fill=(250, 250, 246, 240), outline=hx(NAVY), width=6)
hd.rectangle([4, 4, 380, 76], fill=hx(NAVY)); text_c(hd, (192, 42), '營業時間', font(44), (255, 255, 255, 255))
text_c(hd, (192, 120), '週一～週六', font(38), hx('#1a2a50')); text_c(hd, (192, 168), '09:00 – 22:00', font(42), hx('#1a2a50')); text_c(hd, (192, 216), '週日公休', font(34), hx('#8a2a2a'))
A.paste(hs, (512, 256)); uvbox('hours', 512, 256, 896, 512, (AW, AH))
fl = Image.new('RGBA', (128, 128), (0, 0, 0, 0)); fd = ImageDraw.Draw(fl); rr = np.random.default_rng(3)   # 櫃台小盆栽的花（白色小花）
for k in range(12): cx, cy = rr.uniform(16, 112), rr.uniform(10, 90); fd.line([64, 127, cx, cy], fill=hx('#5a7a3a'), width=2); fd.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=hx(['#f8f8f0', '#f0e8f0'][k % 2]))
A.paste(fl, (896, 0)); uvbox('flowers_w', 896, 0, 1024, 128, (AW, AH))
A.save(os.path.join(GEN, 'ade_alpha.png'))

# ======================= 3. 會亮的（1024×512） =======================
E = Image.new('RGB', (1024, 512), (0, 0, 0)); d = ImageDraw.Draw(E)
pn = Image.new('RGB', (64, 256), (250, 252, 255)); pd = ImageDraw.Draw(pn); pd.rectangle([0, 0, 63, 255], outline=(214, 218, 222), width=4)   # LED 平板燈面（邊框）
E.paste(pn, (0, 0)); uvbox('panel', 2, 2, 62, 254, (1024, 512))


def screen(kind, w, h):
    im = Image.new('RGB', (w, h), (240, 242, 246)); s = ImageDraw.Draw(im); rr = np.random.default_rng(len(kind) + w)
    if kind in ('doc', 'pdf'):
        s.rectangle([0, 0, w, h * 0.09], fill=(46, 84, 150) if kind == 'doc' else (180, 48, 40)); s.rectangle([0, h * 0.09, w, h * 0.16], fill=(226, 230, 236))
        s.rectangle([w * 0.2, h * 0.2, w * 0.8, h], fill=(255, 255, 255))
        for k in range(14): y = h * (0.26 + k * 0.05); s.line([w * 0.26, y, w * (0.26 + rr.uniform(0.3, 0.48)), y], fill=(120, 124, 132), width=2)
        if kind == 'pdf': s.rectangle([w * 0.3, h * 0.55, w * 0.7, h * 0.78], fill=(160, 190, 220))
    elif kind == 'ui':   # 影印機觸控面板（大按鈕）
        s.rectangle([0, 0, w, h], fill=(36, 90, 170)); s.rectangle([0, 0, w, h * 0.18], fill=(24, 60, 120))
        for k in range(6):
            x0, y0 = w * (0.06 + (k % 3) * 0.31), h * (0.25 + (k // 3) * 0.37); s.rounded_rectangle([x0, y0, x0 + w * 0.27, y0 + h * 0.3], radius=6, fill=(236, 242, 250))
            s.rectangle([x0 + w * 0.09, y0 + h * 0.07, x0 + w * 0.18, y0 + h * 0.18], fill=(60, 110, 190))
    elif kind == 'pos':   # 櫃台的電腦：待印清單
        s.rectangle([0, 0, w, h * 0.1], fill=(31, 58, 120))
        for k in range(9):
            y = h * (0.14 + k * 0.09); s.rectangle([w * 0.04, y, w * 0.96, y + h * 0.07], fill=(255, 255, 255) if k % 2 else (230, 236, 246))
            s.line([w * 0.08, y + h * 0.035, w * (0.3 + rr.uniform(0, 0.3)), y + h * 0.035], fill=(90, 96, 110), width=2); s.rectangle([w * 0.8, y + h * 0.015, w * 0.92, y + h * 0.055], fill=(70, 160, 90) if k < 4 else (220, 160, 40))
    return im


for k, (nm, kind, w, h, x0, y0) in enumerate([('scr_doc', 'doc', 224, 144, 80, 0), ('scr_pdf', 'pdf', 224, 144, 320, 0), ('scr_doc2', 'doc', 224, 144, 560, 0), ('scr_pos', 'pos', 224, 144, 80, 160),
                                              ('scr_ui', 'ui', 192, 128, 320, 160), ('scr_ui2', 'ui', 192, 128, 528, 160)]):
    E.paste(screen(kind, w, h), (x0, y0)); uvbox(nm, x0 + 1, y0 + 1, x0 + w - 1, y0 + h - 1, (1024, 512))
d.rectangle([800, 0, 831, 31], fill=(60, 230, 90)); uvbox('led_g', 804, 4, 828, 28, (1024, 512)); d.rectangle([840, 0, 871, 31], fill=(255, 160, 40)); uvbox('led_o', 844, 4, 868, 28, (1024, 512))
d.rectangle([880, 0, 1011, 63], fill=(244, 248, 255)); uvbox('white', 884, 4, 1006, 58, (1024, 512))
E.save(os.path.join(GEN, 'ade_emit.png'))

# ======================= 4. 招牌（2048×512）：後牆的「阿德影印輸出」 =======================
SG = Image.new('RGB', (2048, 512), rgb(NAVY)); d = ImageDraw.Draw(SG); sh = 331
d.rectangle([0, 0, 2048, sh], fill=rgb(NAVY))
for k in range(3): x = 1830 + k * 60; d.polygon([(x, sh), (x + 90, 0), (x + 120, 0), (x + 30, sh)], fill=rgb('#e8ecf4'))   # 右邊的白色斜線
printer_icon(d, 220, sh / 2 + 6, 190, rgb(WHITE), rgb(NAVY))
f1 = font(170); s = '阿德影印輸出'; x = 400
for ch in s: d.text((x, sh / 2 + 4), ch, font=f1, fill=rgb(WHITE), anchor='lm'); x += f1.getlength(ch) + 26
a = np.asarray(SG, np.float32); a[:sh] += noise(2048, sh, 4, 3)[..., None]; SG = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
uvbox('back_sign', 0, 0, 2048, sh, (2048, 512))
SG.save(os.path.join(GEN, 'ade_sign.png'))

# ======================= 5. 天花板（512²＝1.2 m：2×2 片礦纖板） =======================
CW = 512; ca = np.zeros((CW, CW, 3), np.float32) + rgb('#e6e6e2'); ca += noise(CW, CW, 2, 5)[..., None]
rr = np.random.default_rng(21); ys, xs = rr.integers(0, CW, 2600), rr.integers(0, CW, 2600); ca[ys, xs] -= 38   # 礦纖板的細孔
C = Image.fromarray(np.clip(ca, 0, 255).astype(np.uint8)); cd = ImageDraw.Draw(C)
for p in (0, CW // 2): cd.rectangle([p - 5, 0, p + 5, CW], fill=rgb('#f8f8f6')); cd.rectangle([0, p - 5, CW, p + 5], fill=rgb('#f8f8f6')); cd.line([p + 5, 0, p + 5, CW], fill=rgb('#a8a8a4'), width=3); cd.line([0, p + 5, CW, p + 5], fill=rgb('#a8a8a4'), width=3); cd.line([p - 6, 0, p - 6, CW], fill=rgb('#d0d0cc'), width=2); cd.line([0, p - 6, CW, p - 6], fill=rgb('#d0d0cc'), width=2)
C.save(os.path.join(GEN, 'ade_ceil.png'))

json.dump(ATL, open(os.path.join(GEN, 'ade_atlas.json'), 'w'), indent=0)
if '--preview' in sys.argv:
    out = sys.argv[sys.argv.index('--preview') + 1]; pv = Image.new('RGB', (2048 + 1024, 2048), (40, 40, 40)); pv.paste(G, (0, 0))
    bg = Image.new('RGBA', (1024, 1024), (90, 120, 90, 255)); bg.alpha_composite(A); pv.paste(bg.convert('RGB'), (2048, 0)); pv.paste(E, (2048, 1024)); pv.paste(SG.resize((1024, 256)), (2048, 1536)); pv.paste(C.resize((256, 256)), (2048, 1792))
    pv.resize((1536, 1024)).save(out, quality=80)
print('atlas cells', len(ATL), 'goods used height', used)
