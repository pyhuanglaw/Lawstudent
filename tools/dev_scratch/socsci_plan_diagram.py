"""社科院（新社科院＋辜振甫先生紀念圖書館）的位置規劃圖（不開瀏覽器；資料照 src/zones3d.js 校園區域手抄，改校園後要一起改）。
輸出 docs/campus/socsci/plan_now.png（現況）、plan_min.png（最小修改方案）：上＝北（-z）、右＝東（+x），1 m = 4 px。
步行距離是用遊戲的導航格算的（scratchpad 的 socsci_routes.js，2026-10-13）。
用法：python3 tools/dev_scratch/socsci_plan_diagram.py"""
from PIL import Image, ImageDraw, ImageFont
import os, math
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'docs', 'campus', 'socsci')
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
S = 4; X0, X1, Z0, Z1 = -62, 130, -156, 36
W, H = int((X1 - X0) * S), int((Z1 - Z0) * S)
P = lambda x, z: ((x - X0) * S, (z - Z0) * S)
f = ImageFont.truetype(FONT, 15); fs = ImageFont.truetype(FONT, 12); fb = ImageFont.truetype(FONT, 18)


def rect(d, x0, z0, x1, z1, **kw): d.rectangle([P(min(x0, x1), min(z0, z1)), P(max(x0, x1), max(z0, z1))], **kw)


def dashed(d, x0, z0, x1, z1, col, wid=3, seg=10):
    pts = [P(x0, z0), P(x1, z0), P(x1, z1), P(x0, z1), P(x0, z0)]
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        n = max(1, int(max(abs(bx - ax), abs(by - ay)) / seg))
        for i in range(0, n, 2): d.line([(ax + (bx - ax) * i / n, ay + (by - ay) * i / n), (ax + (bx - ax) * (i + 1) / n, ay + (by - ay) * (i + 1) / n)], fill=col, width=wid)


def label(d, x, z, t, font=None, col='#1d1d1d', bg='#ffffffd8'):
    font = font or f; px, py = P(x, z); bb = d.textbbox((0, 0), t, font=font); w, h = bb[2] - bb[0], bb[3] - bb[1]
    d.rectangle([px - w / 2 - 4, py - h / 2 - 4, px + w / 2 + 4, py + h / 2 + 6], fill=bg, outline='#666')
    d.text((px - w / 2, py - h / 2 - bb[1] + 1), t, font=font, fill=col)


def ellipse(d, cx, cz, rx, rz, **kw): d.ellipse([P(cx - rx, cz - rz), P(cx + rx, cz + rz)], **kw)


def route(d, pts, col, t=None, at=None):
    d.line([P(*q) for q in pts], fill=col, width=4)
    (ax, az), (bx, bz) = pts[-2], pts[-1]; a = math.atan2(bz - az, bx - ax)
    tip = P(bx, bz); l = 14
    d.polygon([tip, (tip[0] - l * math.cos(a - 0.45), tip[1] - l * math.sin(a - 0.45)), (tip[0] - l * math.cos(a + 0.45), tip[1] - l * math.sin(a + 0.45))], fill=col)
    if t: label(d, *(at or pts[len(pts) // 2]), t, font=fs, col=col)


def base(title):
    im = Image.new('RGBA', (W, H), '#cfe0bf'); d = ImageDraw.Draw(im, 'RGBA')
    rect(d, X0, Z0, X1, -124, fill='#7fa36a')                      # 北邊走不到的樹林（圍牆外是辛亥路方向）
    rect(d, 125, Z0, X1, Z1, fill='#7fa36a')                       # 東邊走不到
    label(d, 4, -131, '北邊：走不到的樹林（辛亥路方向；D25 壓縮後沒有做馬路）', font=fs)
    rect(d, X0, Z0, X1, -143, fill='#ffffff')
    rect(d, X0, -6, 87, 6, fill='#b9b9b6')                         # 椰林大道
    label(d, 10, 0, '椰林大道', font=fs)
    rect(d, 25, -84, 35, -6, fill='#e7dcc4'); label(d, 30, -55, '小椰林道', font=fs)
    rect(d, 25, -106, 97, -82, fill='#e6dccb')                     # 法學院廣場
    label(d, 61, -88, '法學院廣場', font=fs)
    rect(d, 90.5, -84, 94.5, -64, fill='#e7dcc4')                  # 往萬才館的小路
    rect(d, 14, -121, 54, -103, fill='#8a8f96', outline='#333', width=2); label(d, 34, -112, '霖澤館', font=fb)
    rect(d, 73, -122, 103, -102, fill='#a8735a', outline='#333', width=2); label(d, 88, -112, '萬才館', font=fb)
    dashed(d, 49, -139, 79, -129, '#555', 2); label(d, 64, -134, '國青中心（背景）', font=fs)
    rect(d, 87, -30, 113, 30, fill='#a5604a', outline='#333', width=2); label(d, 100, 12, '總圖', font=fb)
    rect(d, -58, -43, -18, -25, fill='#a5604a', outline='#333', width=2); label(d, -38, -34, '文學院', font=f)
    rect(d, -6, -35, 20, -21, fill='#c8a27c', outline='#555'); label(d, 7, -28, '系館', font=fs)
    rect(d, 43, -42, 71, -26, fill='#a35c48', outline='#555'); label(d, 57, -34, '系館', font=fs)
    ellipse(d, -30, -66, 17, 10, fill='#5f8fb4'); label(d, -30, -66, '醉月湖（現在）', font=fs)
    dashed(d, -55, -67, -21, -50, '#7a4fb0', 3); label(d, -38, -58.5, '普通（方案 A）', font=fs, col='#5a2f90')
    dashed(d, -55, -92, -21, -74, '#7a4fb0', 3); label(d, -38, -83, '博雅（方案 A）', font=fs, col='#5a2f90')
    label(d, 2, 30, '↓ 共同教學館在南邊 (2,33)', font=fs)
    d.text((10, 8), title, font=fb, fill='#111')
    d.text((10, 32), '上＝北、右＝東；1 格 = 1 m × 4 px；座標是遊戲的 x、z', font=fs, fill='#222')
    return im, d


def now():
    im, d = base('社科院：現況（遊戲裡的位置與完成度）')
    rect(d, 99, -98, 121, -42, fill='#f2f0ea', outline='#333', width=2)
    label(d, 110, -82, '社會科學院', font=f); label(d, 110, -75, '（現有）', font=fs); label(d, 110, -69, '白色四層', font=fs); label(d, 110, -63, '程式產生', font=fs); label(d, 110, -57, '沒有入口', font=fs)
    for i in range(7): ellipse(d, 96, -90 + i * 6, 0.9, 0.9, fill='#ffffff', outline='#333')
    label(d, 66, -74, '門前白色圓柱 7 根（代表辜振甫圖書館，原型）→', font=fs)
    s = (97.5, -70)
    route(d, [s, (92.5, -64), (92.5, -40), (86, -30), (86, 0)], '#c0392b', '到總圖 74 m・約 41 秒', at=(74, -46))
    route(d, [s, (92.5, -84), (60, -94), (28, -101)], '#1f6fb2', '到霖澤館 80 m・約 44 秒', at=(58, -99))
    route(d, [s, (92.5, -84), (93.8, -100)], '#117a65', '萬才館 31 m', at=(108, -101))
    route(d, [s, (92.5, -64), (78, -40), (30, -12), (2, 22)], '#8e44ad', '到共同 138 m・約 76 秒', at=(46, -16))
    route(d, [s, (92.5, -84), (30, -84), (30, -46), (-18, -46)], '#b9770e', '到文學院北側（往普通、博雅）約 120 m', at=(-2, -52))
    im.convert('RGB').save(os.path.join(OUT, 'plan_now.png'))


def minimal():
    im, d = base('社科院：最小修改方案（原地沿用；外觀換成 Blender 正式模型）')
    # 辜振甫圖書館：一層樓入口建築（LAWWW2 ⑬ 的室內 30×22 m；玻璃牆朝北、朝西＝朝廣場與霖澤館）
    rect(d, 95, -92, 125, -70, fill='#e9f3f7', outline='#1b6f8f', width=3)
    d.line([P(95, -92), P(95, -70)], fill='#38a3c9', width=7); d.line([P(95, -92), P(125, -92)], fill='#38a3c9', width=7)
    for i in range(5):
        for j in range(3): ellipse(d, 99 + i * 6, -88 + j * 7, 1.1, 1.1, fill='#ffffff', outline='#777')
    label(d, 110, -85, '辜振甫圖書館', font=f); label(d, 110, -79.5, '一層・入口建築', font=fs); label(d, 110, -74.5, '室內已完成（⑬）', font=fs)
    label(d, 78, -92, '玻璃牆朝廣場、朝霖澤館 →', font=fs, col='#1b6f8f')
    rect(d, 99, -62, 123, -42, fill='#b7b5b0', outline='#333', width=3)
    label(d, 111, -54, '社科院大樓', font=f); label(d, 111, -48, '清水混凝土・多層', font=fs)
    rect(d, 95, -70, 125, -62, fill='#ece4d4'); label(d, 113, -66, '中庭', font=fs)
    for (x, z, t) in [(101, -70, '圖書館入口'), (99, -55, '大樓入口')]:
        ellipse(d, x, z, 1.6, 1.6, fill='#e74c3c', outline='#fff'); label(d, x - 12, z + (-3 if t=='圖書館入口' else 0), t, font=fs, col='#c0392b')
    dashed(d, 40, -76, 74, -50, '#d35400', 3); label(d, 57, -63, '方案 B（不推薦）：搬到霖澤館正對面', font=fs, col='#a04000'); label(d, 57, -57, '要移樹、改地圖和測試', font=fs, col='#a04000')
    route(d, [(95, -66), (92.5, -66), (92.5, -84), (60, -94), (28, -101)], '#1f6fb2', '霖澤館 約 80 m（隔著法學院廣場）', at=(58, -99))
    route(d, [(95, -66), (92.5, -64), (92.5, -40), (86, -30), (86, 0)], '#c0392b', '總圖 約 74 m', at=(78, -46))
    im.convert('RGB').save(os.path.join(OUT, 'plan_min.png'))


os.makedirs(OUT, exist_ok=True); now(); minimal(); print('ok', OUT)
