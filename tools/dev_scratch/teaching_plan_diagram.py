"""三棟公共教學館的位置規劃圖（不開瀏覽器；資料照 src/zones3d.js 校園區域手抄，改校園後要一起改）。
輸出 docs/campus/teaching_plan_{now,A,B}.png：上＝北（-z）、右＝東（+x），1 m = 4 px。
用法：python3 tools/dev_scratch/teaching_plan_diagram.py"""
from PIL import Image, ImageDraw, ImageFont
import os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
S = 4; X0, X1, Z0, Z1 = -132, 132, -134, 92
W, H = int((X1 - X0) * S), int((Z1 - Z0) * S)
P = lambda x, z: ((x - X0) * S, (z - Z0) * S)
def rect(d, x0, z0, x1, z1, **kw): d.rectangle([P(min(x0, x1), min(z0, z1)), P(max(x0, x1), max(z0, z1))], **kw)
def box(d, cx, cz, w, dd, rot90=False, **kw):
    if rot90: w, dd = dd, w
    rect(d, cx - w / 2, cz - dd / 2, cx + w / 2, cz + dd / 2, **kw)
def dashed(d, x0, z0, x1, z1, col, wid=3, seg=10):
    pts = [P(x0, z0), P(x1, z0), P(x1, z1), P(x0, z1), P(x0, z0)]
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        n = max(1, int(max(abs(bx - ax), abs(by - ay)) / seg))
        for i in range(0, n, 2): d.line([(ax + (bx - ax) * i / n, ay + (by - ay) * i / n), (ax + (bx - ax) * (i + 1) / n, ay + (by - ay) * (i + 1) / n)], fill=col, width=wid)
def label(d, f, x, z, t, col='#1d1d1d', bg='#ffffffd0'):
    px, py = P(x, z); bb = d.textbbox((0, 0), t, font=f); w, h = bb[2] - bb[0], bb[3] - bb[1]
    d.rectangle([px - w / 2 - 4, py - h / 2 - 4, px + w / 2 + 4, py + h / 2 + 6], fill=bg, outline='#555')
    d.text((px - w / 2, py - h / 2 - bb[1] + 1), t, font=f, fill=col)
def lake(d, cx, cz, col='#5f8fb4', outline=None, dash=False):
    if dash:
        for a in range(0, 360, 12):
            import math
            r = lambda t: (cx + 17 * math.cos(math.radians(t)), cz + 10 * math.sin(math.radians(t)))
            d.line([P(*r(a)), P(*r(a + 6))], fill=col, width=3)
    else: d.ellipse([P(cx - 17, cz - 10), P(cx + 17, cz + 10)], fill=col, outline=outline)
def base(title, f, fs):
    im = Image.new('RGB', (W, H + 60 + 130), '#f4f1ea'); d = ImageDraw.Draw(im, 'RGBA')
    d.rectangle([0, 0, W, 60], fill='#f4f1ea'); d.text((14, 12), title, font=f, fill='#222')
    im2 = Image.new('RGB', (W, H), '#cfd6c3'); d2 = ImageDraw.Draw(im2, 'RGBA')
    rect(d2, -123, -124, 125, 84, fill='#a9c58f')                       # 走得到的範圍（nav.blockOutside）
    rect(d2, -123, -124, 5, -84, fill='#7f9c6a'); rect(d2, 100, -124, 125, -84, fill='#7f9c6a')   # 走不到的樹林（nav.blockRect）
    return im, d, im2, d2
def paths(d):
    st = '#e8dcc4'
    rect(d, -124, -8, 72, 8, fill=st)                 # 椰林大道（16 m）
    rect(d, 25, -74, 35, 0, fill=st)                  # 小椰林道 x=30
    rect(d, 30, -65, 110, -55, fill=st)               # 法學院前的東西向路 z=-60
    rect(d, -110, 42.5, 110, 51.5, fill='#9a9a96')    # 舟山路
    rect(d, 17, 0, 23, 58, fill=st)                   # 往宿舍的路 x=20
    return st
BLD = [  # (名稱, cx, cz, w, d, rot90, 顏色)
    ('行政大樓', -38, 33, 46, 16, False, '#b8956a'), ('文學院', -38, -34, 40, 18, False, '#9b5a42'), ('農業陳列館', -104, -30, 22, 14, False, '#c9c3b5'),
    ('校史館', -77, -29, 24, 16, False, '#a25d43'), ('總圖書館', 100, 0, 60, 26, True, '#9e5a44'), ('霖澤館', 34, -112, 40, 18, False, '#a35c48'),
    ('萬才館', 88, -112, 30, 20, False, '#b06a4a'), ('社會科學院', 110, -70, 56, 22, True, '#c8c3b8'), ('男一舍', 20, 68, 36, 14, False, '#cfc6b4')]
FILL = [(7, -28, 26, 14), (57, -34, 28, 16), (2, 33, 24, 14), (45, 33, 34, 14), (-34, 68, 30, 13), (74, 68, 30, 13), (-92, 66, 34, 13)]
def dorm(d, fs):   # 大一女舍（A 棟靠西、B 棟靠舟山路、2 樓天橋）：取代 (-92,66) 的無名系館
    newb(d, fs, -108, 68, 24, 12, '大一女舍 A', col='#c0507a'); newb(d, fs, -78, 66, 24, 12, '大一女舍 B', col='#c0507a'); rect(d, -96, 65.5, -90, 68.5, fill='#c0507a88', outline='#7a2040')
def world(d, f, fs, skip_fill=(), lake_at=(-30, -66), lake_paths=True):
    paths(d)
    if lake_paths:
        rect(d, -14.5, -51, -9.5, -8, fill='#e8dcc4'); rect(d, -48, -53, -8, -49, fill='#e8dcc4')   # 往醉月湖的小路、湖南岸步道
    lake(d, *lake_at)
    for i, (cx, cz, w, dd) in enumerate(FILL):
        if i in skip_fill: continue
        box(d, cx, cz, w, dd, fill='#b9ab97', outline='#6b5d4c')
    for n, cx, cz, w, dd, r, c in BLD: box(d, cx, cz, w, dd, r, fill=c, outline='#3d2a20')
def names(d, fs, skip_fill=(), lake_at=(-30, -66)):
    for n, cx, cz, w, dd, r, c in BLD: label(d, fs, cx, cz, n)
    for i, (cx, cz, w, dd) in enumerate(FILL):
        if i in skip_fill: continue
        label(d, fs, cx, cz, '無名系館', col='#555', bg='#ffffffa0')
    label(d, fs, lake_at[0], lake_at[1], '醉月湖', bg='#ffffffc0'); label(d, fs, -60, 0, '椰林大道'); label(d, fs, 30, -45, '小椰林道'); label(d, fs, -80, 47, '舟山路'); label(d, fs, -118, 0, '校門')
def newb(d, fs, cx, cz, w, dd, name, col='#e07b2a'):
    box(d, cx, cz, w, dd, fill=col + 'cc', outline='#7a3a00', width=3); label(d, fs, cx, cz, name, col='#7a3a00', bg='#fff3e0')
LEG = {}
def legend(d, f, notes):   # 圖例畫在地圖下面（out() 才畫到主圖上），比例尺與北方畫在地圖上
    LEG['notes'] = notes
    d.text((W - 90, 14), '北 ↑', font=f, fill='#222'); px, py = W - 150, H - 30; d.line([(px, py), (px + 20 * S, py)], fill='#222', width=4); d.text((px, py - 26), '20 m', font=f, fill='#222')
def out(im, im2, name):
    im.paste(im2, (0, 60)); d = ImageDraw.Draw(im); fl = ImageFont.truetype(FONT, 19)
    for i, t in enumerate(LEG.get('notes', [])): d.text((16, 60 + H + 10 + i * 29), t, font=fl, fill='#222')
    im.save(os.path.join(ROOT, 'docs', 'campus', name)); print('wrote', name)
f = ImageFont.truetype(FONT, 22); fs = ImageFont.truetype(FONT, 16)
# 現況
im, d, im2, d2 = base('現況：遊戲裡的台大校總區（壓縮配置 D25；上＝北）', f, fs); world(d2, f, fs); names(d2, fs)
legend(d2, fs, ['淺綠＝走得到；深綠＝走不到的樹林（醉月湖北邊、社科院北邊）', '紅褐＝有名字的建築；灰褐＝沒掛名字的系館（之後可以換成真實建築）', '文學院背面 z=-43 到醉月湖步道 z=-51 只有約 8 m'])
out(im, im2, 'teaching_plan_now.png')
# 方案 A：醉月湖往北搬、西北角擴充
im, d, im2, d2 = base('方案 A（推薦）：醉月湖往北搬約 46 m、西北角擴充；文學院→普通→博雅→醉月湖', f, fs)
rect(d2, -70, -124, 5, -84, fill='#a9c58f')       # 擴充：原本走不到的樹林變成走得到
world(d2, f, fs, skip_fill=(2, 6), lake_at=(-36, -112), lake_paths=False)
rect(d2, -14.5, -100, -9.5, -8, fill='#e8dcc4'); rect(d2, -58, -47.5, -9.5, -44.5, fill='#e8dcc4'); rect(d2, -56, -98, -9.5, -95, fill='#e8dcc4')   # 延長的小路、文學院後面的路、湖南岸步道
lake(d2, -30, -66, col='#2f5f88', dash=True)
newb(d2, fs, 2, 33, 24, 14, '共同教學館'); newb(d2, fs, -38, -58.5, 34, 17, '普通教學館'); newb(d2, fs, -38, -83, 34, 18, '博雅教學館')
rect(d2, -41, -74, -35, -67, fill='#e07b2a88', outline='#7a3a00')   # 空橋
dorm(d2, fs); names(d2, fs, skip_fill=(2, 6), lake_at=(-36, -112)); label(d2, fs, -30, -66, '（原本的湖）', col='#2f5f88', bg='#ffffff90')
legend(d2, fs, ['橘色＝新的教學館、粉紅＝大一女舍（A、B 兩棟＋2 樓天橋）；淺綠的西北角＝新開放的範圍', '湖、湖心亭、木棧道、長椅、路燈整組搬（形狀不變）', '真實關係全部對得上：普通在文學院後面、博雅在普通北邊（空橋）、北望醉月湖', '共同教學館＝行政大樓東邊那棟無名系館的位置（A、B 都一樣）'])
out(im, im2, 'teaching_plan_A.png')
# 方案 B：湖不動
im, d, im2, d2 = base('方案 B：醉月湖不動；普通、博雅擺在湖東邊、小椰林道西邊', f, fs)
world(d2, f, fs, skip_fill=(2, 6))
newb(d2, fs, 2, 33, 24, 14, '共同教學館'); newb(d2, fs, 7, -52, 24, 16, '普通教學館'); newb(d2, fs, 7, -74.5, 24, 17, '博雅教學館')
rect(d2, 4, -66, 10, -60, fill='#e07b2a88', outline='#7a3a00')
dorm(d2, fs); names(d2, fs, skip_fill=(2, 6))
legend(d2, fs, ['橘色＝新的教學館、粉紅＝大一女舍（A、B 兩棟＋2 樓天橋）；既有場景都不動', '缺點：兩棟只能 24 m 寬、擠在湖和小椰林道之間', '和真實不同：普通在文學院東北（不是正後方）、醉月湖在博雅西邊（真實在北邊）', '共同教學館＝行政大樓東邊那棟無名系館的位置'])
out(im, im2, 'teaching_plan_B.png')
