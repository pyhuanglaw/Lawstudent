"""便利商店的商品（LAWWW2，2026-10-14；使用者：「便利商店店面裡面的東西看起來就是一堆模板複製貼上超假的」）。
原本的商品是隨機顏色、隨機大小的方塊和圓柱（頂點色），看不出是什麼。這一版：
- 每一種商品有自己的包裝（虛構的品牌與品名，不仿真實品牌；字型文泉驛正黑）：畫在一張 2048×2048 的貼圖集（每格 128×128），全部商品共用一個材質（一次 draw call）。
- 每一種商品有自己的形狀：杯麵（上寬下窄、蓋子）、袋麵五包裝、洋芋片（鼓起來的袋子）、餅乾盒、糖果、麵包袋、寶特瓶（瓶身、瓶肩、瓶蓋、標籤）、鋁罐、紙盒、面紙、洗髮精、文具卡。
- 陳列照便利商店的樣子：同一種商品並排 2～4 個（飲料櫃 3～5 個）、同一區放同一類、每一組下面一張價格標籤；偶爾缺一個（賣掉了）。
用法：cvs_interior.py 匯入這個模組：G = Goods(mesh_name)；G.shelf(…)／G.cooler(…)；G.finish(root)。座標＝遊戲座標（x 東、y 上、z 南）。"""
import math, os, random
import bpy, bmesh
from mathutils import Vector
from PIL import Image, ImageDraw, ImageFont

FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
CELL, N = 128, 16                       # 2048×2048：16×16 格
g2b = lambda x, y, z: Vector((x, -z, y))

# ---------------- 商品目錄（虛構）：cat＝分類、shape＝形狀、w／h／d＝寬（沿貨架）／高／深（公尺）、bg／fg／accent＝包裝顏色、brand／name＝包裝上的字、price＝價格標籤
P = []
def prod(cat, shape, w, h, d, bg, fg, accent, brand, name, price, deco='band'):
    P.append(dict(cat=cat, shape=shape, w=w, h=h, d=d, bg=bg, fg=fg, accent=accent, brand=brand, name=name, price=price, deco=deco, cell=len(P)))

for b, n, bg, fg, ac, pr in (('一碗香', '紅燒牛肉', '#b8231c', '#fff4d6', '#f2c230', 39), ('好麵道', '豚骨拉麵', '#f4efe4', '#b8231c', '#1d1d1f', 45), ('辣到你', '麻辣鍋', '#7a1410', '#ffd34d', '#e8481c', 42),
                             ('阿嬤家', '古早炸醬', '#5a3a1e', '#f6e2b3', '#d99a2b', 35), ('海之味', '海鮮湯麵', '#1f5fa8', '#ffffff', '#7cc4e8', 39), ('蔥香', '蔥油拌麵', '#3c7d3a', '#ffffff', '#c8e06a', 35)):
    prod('cupnoodle', 'cup', 0.11, 0.105, 0.11, bg, fg, ac, b, n, pr)
for b, n, bg, fg, ac, pr in (('古早味', '肉燥麵', '#d8432f', '#ffffff', '#f2c230', 69), ('素食坊', '香菇麵', '#6b8f3a', '#ffffff', '#f4efe4', 65), ('沙茶王', '沙茶拌麵', '#e2771f', '#3b1e0e', '#fff1c9', 79)):
    prod('bagnoodle', 'box', 0.22, 0.1, 0.13, bg, fg, ac, b, n, pr, deco='window')
for b, n, bg, fg, ac, pr in (('脆薯', '原味', '#f2c230', '#b8231c', '#ffffff', 35), ('脆薯', '海苔', '#3c8d3a', '#ffffff', '#1d1d1f', 35), ('脆薯', '烤肉', '#b8231c', '#ffe9a8', '#5a2a10', 35),
                             ('玉米脆', '起司', '#f08a24', '#ffffff', '#7a2a10', 30), ('鮮蝦條', '原味', '#e85d6a', '#ffffff', '#ffd34d', 25), ('辣條', '香辣', '#c21f1f', '#ffe34d', '#1d1d1f', 20)):
    prod('chips', 'bag', 0.16, 0.22, 0.07, bg, fg, ac, b, n, pr, deco='circle')
for b, n, bg, fg, ac, pr in (('奶油夾心', '餅乾', '#f6ecd4', '#1f4fa0', '#e8b84a', 45), ('可可棒', '巧克力', '#5a3220', '#f6e2b3', '#d99a2b', 39), ('蘇打餅', '鹹味', '#ffffff', '#2f7a3a', '#c8e06a', 32),
                             ('蛋捲', '原味', '#e8b84a', '#7a2a10', '#fff4d6', 55), ('鳳梨酥', '土鳳梨', '#f2d24d', '#9a2a1a', '#3c7d3a', 60), ('小熊餅', '草莓', '#f4b6c8', '#7a2a4a', '#ffffff', 29)):
    prod('cookie', 'box', 0.12, 0.17, 0.05, bg, fg, ac, b, n, pr, deco='stripe')
for b, n, bg, fg, ac, pr in (('水果軟糖', '綜合', '#f48fb1', '#ffffff', '#7a1f4a', 25), ('薄荷糖', '涼', '#2fb5a8', '#ffffff', '#0e4f4a', 30), ('喉糖', '枇杷', '#3c7d3a', '#fff4d6', '#c8a03a', 35), ('牛奶糖', '香濃', '#f6ecd4', '#5a3220', '#d99a2b', 25)):
    prod('candy', 'box', 0.07, 0.11, 0.03, bg, fg, ac, b, n, pr, deco='circle')
for b, n, bg, fg, ac, pr in (('麵包坊', '菠蘿', '#f6ecd4', '#9a5a1a', '#e8b84a', 30), ('麵包坊', '紅豆', '#f6ecd4', '#7a1f2a', '#c8505a', 30), ('早安', '厚片吐司', '#ffffff', '#1f4fa0', '#f2c230', 45)):
    prod('bread', 'bag', 0.15, 0.09, 0.11, bg, fg, ac, b, n, pr, deco='window')
for b, n, bg, fg, ac, pr, liq in (('青山', '綠茶', '#2f7a3a', '#ffffff', '#c8e06a', 25, '#b8c860'), ('高山', '烏龍茶', '#7a4a1a', '#f6e2b3', '#d99a2b', 25, '#a86a20'), ('古早', '冬瓜茶', '#c8501f', '#fff4d6', '#f2c230', 20, '#8a4a18'),
                                  ('清泉', '純水', '#2f7ed8', '#ffffff', '#c9e2f2', 20, '#e8f2f8'), ('動能', '運動飲料', '#1f4fa0', '#ffffff', '#5bb6c9', 25, '#cfe8f4'), ('蜂蜜', '檸檬', '#f2c230', '#5a3a10', '#ffffff', 29, '#e8c84a'),
                                  ('午後', '奶茶', '#e8d5b0', '#5a3220', '#b8231c', 30, '#d8b890'), ('黑豆', '黑豆茶', '#1d1d1f', '#e8b84a', '#7a4a1a', 25, '#4a3020')):
    prod('drink', 'bottle', 0.07, 0.235, 0.07, bg, fg, ac, b, n, pr); P[-1]['liquid'] = liq
for b, n, bg, fg, ac, pr in (('晨光', '黑咖啡', '#1d1d1f', '#e8b84a', '#7a4a1a', 25), ('晨光', '拿鐵', '#e8d5b0', '#5a3220', '#7a4a1a', 25), ('氣泡', '檸檬汽水', '#3fa34d', '#ffffff', '#f2e04a', 20),
                             ('氣泡', '葡萄汽水', '#6a2f8a', '#ffffff', '#c89ae8', 20), ('沙士', '經典', '#5a1a1a', '#f6e2b3', '#c8501f', 20)):
    prod('can', 'can', 0.066, 0.123, 0.066, bg, fg, ac, b, n, pr, deco='band')
for b, n, bg, fg, ac, pr in (('牧場', '鮮乳', '#ffffff', '#1f4fa0', '#7cc4e8', 35), ('田園', '豆漿', '#f6ecd4', '#5a3a10', '#c8a03a', 25), ('牧場', '巧克力乳', '#5a3220', '#ffffff', '#e8b84a', 30), ('古早味', '紅茶', '#b8231c', '#fff4d6', '#f2c230', 20)):
    prod('carton', 'box', 0.062, 0.13, 0.045, bg, fg, ac, b, n, pr, deco='stripe')
for b, n, bg, fg, ac, pr in (('柔膚', '抽取面紙', '#ffffff', '#2f7ed8', '#f4b6c8', 39), ('清淨', '濕紙巾', '#2fb5a8', '#ffffff', '#ffffff', 35), ('親親', '口罩', '#ffffff', '#1f4fa0', '#7cc4e8', 59)):
    prod('daily', 'box', 0.2, 0.11, 0.12, bg, fg, ac, b, n, pr, deco='stripe')
for b, n, bg, fg, ac, pr in (('沐光', '洗髮精', '#f4b6c8', '#7a1f4a', '#ffffff', 99), ('沐光', '沐浴乳', '#c9e2f2', '#1f4fa0', '#ffffff', 99), ('潔白', '牙膏', '#ffffff', '#d8432f', '#2f7ed8', 59)):
    prod('daily2', 'box', 0.08, 0.2, 0.05, bg, fg, ac, b, n, pr, deco='circle')
for b, n, bg, fg, ac, pr in (('文青', '原子筆', '#ffffff', '#1d1d1f', '#2f7ed8', 15), ('文青', '筆記本', '#3c6a8a', '#ffffff', '#f2c230', 30), ('貼貼', '便利貼', '#f2e04a', '#1d1d1f', '#f08a24', 25), ('長效', '電池', '#1d1d1f', '#f2c230', '#d8432f', 49)):
    prod('stationery', 'box', 0.09, 0.19, 0.02, bg, fg, ac, b, n, pr, deco='window')
for b, n, bg, fg, ac, pr in (('', '', '#f4f1ea', '#6a6a6a', '#b8b8b8', 0), ('', '', '#e8e8e8', '#2a2a2a', '#d8432f', 0), ('', '', '#d9d4c8', '#3a3a3a', '#2f7ed8', 0), ('', '', '#f4f1ea', '#2a2a2a', '#3c7d3a', 0)):
    prod('smoke', 'box', 0.056, 0.088, 0.022, bg, fg, ac, b, n, pr, deco='band')     # 香菸櫃：只有色帶、沒有字（不畫品牌）
PROMO = len(P)                          # 端架的促銷牌、價格標籤用後面幾格
CATS = {}
for p in P: CATS.setdefault(p['cat'], []).append(p)


def _font(sz): return ImageFont.truetype(FONT, max(8, int(sz)))


def draw_cell(im, p):
    """一格包裝：上面 112 px 是正面；最下面 16 px 是側面的顏色（側面、底、背面都取這一條的中間）"""
    x0, y0 = (p['cell'] % N) * CELL, (p['cell'] // N) * CELL
    d = ImageDraw.Draw(im)
    d.rectangle([x0, y0, x0 + CELL - 1, y0 + CELL - 1], fill=p['bg'])
    W, H = CELL, 112
    deco, ac = p['deco'], p['accent']
    if deco == 'band': d.rectangle([x0, y0 + int(H * 0.62), x0 + W, y0 + int(H * 0.8)], fill=ac)
    elif deco == 'circle': d.ellipse([x0 + int(W * 0.22), y0 + int(H * 0.38), x0 + int(W * 0.78), y0 + int(H * 0.94)], fill=ac)
    elif deco == 'stripe':
        for k in range(3): d.rectangle([x0, y0 + int(H * (0.7 + k * 0.1)), x0 + W, y0 + int(H * (0.7 + k * 0.1) + 4)], fill=ac)
    elif deco == 'window': d.rounded_rectangle([x0 + int(W * 0.18), y0 + int(H * 0.5), x0 + int(W * 0.82), y0 + int(H * 0.9)], radius=10, fill=ac)
    if p['brand']:
        f = _font(26)
        while d.textlength(p['brand'], font=f) > W * 0.9 and f.size > 10: f = _font(f.size - 2)
        d.text((x0 + W / 2, y0 + H * 0.17), p['brand'], fill=p['fg'], font=f, anchor='mm', stroke_width=1, stroke_fill=p['fg'])
    if p['name']:
        f = _font(19)
        while d.textlength(p['name'], font=f) > W * 0.88 and f.size > 9: f = _font(f.size - 2)
        d.text((x0 + W / 2, y0 + H * 0.4), p['name'], fill=p['fg'], font=f, anchor='mm')
    side = tuple(max(0, int(c * 0.82)) for c in Image.new('RGB', (1, 1), p['bg']).getpixel((0, 0)))
    d.rectangle([x0, y0 + H, x0 + W, y0 + CELL - 1], fill=side)


def draw_tag(im, k, price):
    x0, y0 = (k % N) * CELL, (k // N) * CELL; d = ImageDraw.Draw(im)
    d.rectangle([x0, y0, x0 + CELL - 1, y0 + CELL - 1], fill='#ffffff'); d.rectangle([x0, y0, x0 + CELL, y0 + 20], fill='#f2c230')
    d.text((x0 + CELL / 2, y0 + 70), f'${price}', fill='#d8432f', font=_font(48), anchor='mm', stroke_width=1, stroke_fill='#d8432f')


def draw_promo(im, k, text, bg, fg):
    x0, y0 = (k % N) * CELL, (k // N) * CELL; d = ImageDraw.Draw(im)
    d.rectangle([x0, y0, x0 + CELL - 1, y0 + CELL - 1], fill=bg)
    lines = text.split('\n'); f = _font(30)
    for i, t in enumerate(lines): d.text((x0 + CELL / 2, y0 + CELL / 2 + (i - (len(lines) - 1) / 2) * 38), t, fill=fg, font=f, anchor='mm', stroke_width=1, stroke_fill=fg)


PRICES = sorted({p['price'] for p in P if p['price']})
TAG0 = PROMO; PROMO_CELLS = TAG0 + len(PRICES)
PROMOS = [('第二件\n6 折', '#d8432f', '#ffffff'), ('新品\n上市', '#f2c230', '#b8231c'), ('買一送一', '#1f6f78', '#ffffff')]
SOLID0 = PROMO_CELLS + len(PROMOS)      # 純色（瓶蓋、液體、鋁罐的上下）
SOLIDS = ['#ffffff', '#1d1d1f', '#c9ccd0', '#2f7a3a', '#2f7ed8', '#d8432f', '#f2c230'] + sorted({p.get('liquid', '#ffffff') for p in P})


def make_atlas(path):
    im = Image.new('RGB', (CELL * N, CELL * N), '#ffffff')
    for p in P: draw_cell(im, p)
    for i, pr in enumerate(PRICES): draw_tag(im, TAG0 + i, pr)
    for i, (t, bg, fg) in enumerate(PROMOS): draw_promo(im, PROMO_CELLS + i, t, bg, fg)
    d = ImageDraw.Draw(im)
    for i, c in enumerate(SOLIDS):
        k = SOLID0 + i; x0, y0 = (k % N) * CELL, (k // N) * CELL; d.rectangle([x0, y0, x0 + CELL - 1, y0 + CELL - 1], fill=c)
    im.save(path); return path


def cell_uv(k, part='front'):
    """格子 k 的 UV（Blender UV 原點在左下）：front＝上面 112 px；side＝最下面那條的中間一點"""
    u0, v_top = (k % N) / N, 1 - (k // N) / N
    if part == 'front': return (u0 + 1 / (N * CELL), v_top - 112 / (N * CELL), u0 + (CELL - 1) / (N * CELL), v_top - 1 / (N * CELL))
    v = v_top - 120 / (N * CELL); u = u0 + 0.5 / N; return (u, v, u, v)


def solid_uv(col):
    i = SOLIDS.index(col) if col in SOLIDS else 0; return cell_uv(SOLID0 + i, 'mid')[:2] if False else ((SOLID0 + i) % N / N + 0.5 / N, 1 - ((SOLID0 + i) // N) / N - 0.5 / N)


class Goods:
    def __init__(self, name, mat):
        self.name, self.mat = name, mat; self.bm = bmesh.new(); self.uv = self.bm.loops.layers.uv.new('UVMap'); self.n = 0

    # ---- 基本形狀（遊戲座標）
    def _face(self, pts, uvs):
        vs = [self.bm.verts.new(g2b(*p)) for p in pts]; f = self.bm.faces.new(vs)
        for lp, uv in zip(f.loops, uvs): lp[self.uv].uv = uv
        return f

    def box(self, x0, x1, y0, y1, z0, z1, face, k, front=True):
        """front 那一面貼包裝（face＝'+z'／'-z'／'+x'／'-x'），其他面用側面的顏色"""
        fu = cell_uv(k, 'front') if front else cell_uv(k, 'side'); su = cell_uv(k, 'side')
        quads = {'+z': [(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], '-z': [(x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0)],
                 '+x': [(x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1)], '-x': [(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)],
                 '+y': [(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)], '-y': [(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)]}
        for key, q in quads.items():
            if key == face: self._face(q, [(fu[0], fu[1]), (fu[2], fu[1]), (fu[2], fu[3]), (fu[0], fu[3])])
            elif key != '-y': self._face(q, [(su[0], su[1])] * 4)
        self.n += 1

    def bag(self, x0, x1, y0, y1, z0, z1, face, k):
        """袋子：正面中間鼓起來（四邊壓扁的封口）"""
        self.box(x0, x1, y0 + 0.012, y1 - 0.012, z0, z1, face, k)
        su = cell_uv(k, 'side')
        cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
        for yy in (y0, y1 - 0.012):        # 上下的封口（比袋身薄）
            if face in ('+z', '-z'): self.box(x0 + 0.004, x1 - 0.004, yy, yy + 0.012, cz - 0.006, cz + 0.006, face, k, front=False)
            else: self.box(cx - 0.006, cx + 0.006, yy, yy + 0.012, z0 + 0.004, z1 - 0.004, face, k, front=False)

    FACE_DEG = {'+z': 0.0, '+x': 90.0, '-z': 180.0, '-x': 270.0}

    def ring(self, cx, cz, y0, y1, r0, r1, seg, k, part='front', reps=2, uvpt=None, face='+z'):
        """側面（圓台）：包裝每半圈一張，從看得到的那一半的左邊開始（正面看到一整張，接縫在側邊）"""
        fu = cell_uv(k, 'front'); st = self.FACE_DEG.get(face, 0.0) - 90.0
        for i in range(seg):
            a0, a1 = 2 * math.pi * i / seg, 2 * math.pi * (i + 1) / seg
            p = [(cx + r0 * math.sin(a0), y0, cz + r0 * math.cos(a0)), (cx + r0 * math.sin(a1), y0, cz + r0 * math.cos(a1)),
                 (cx + r1 * math.sin(a1), y1, cz + r1 * math.cos(a1)), (cx + r1 * math.sin(a0), y1, cz + r1 * math.cos(a0))]
            if uvpt is not None: self._face(p, [uvpt] * 4); continue
            d0, d1 = math.degrees(a0) - st, math.degrees(a1) - st
            t0 = (d0 % 180.0) / 180.0; t1 = t0 + (d1 - d0) / 180.0
            if t1 > 1.0 + 1e-6: t1 = 1.0
            ua, ub = fu[0] + (fu[2] - fu[0]) * t0, fu[0] + (fu[2] - fu[0]) * t1
            self._face(p, [(ua, fu[1]), (ub, fu[1]), (ub, fu[3]), (ua, fu[3])])

    def disc(self, cx, cz, y, r, seg, uvpt, up=True):
        pts = [(cx + r * math.sin(2 * math.pi * i / seg), y, cz + r * math.cos(2 * math.pi * i / seg)) for i in range(seg)]
        if not up: pts = pts[::-1]
        self._face(pts, [uvpt] * seg)

    def cup(self, cx, cz, y, p, face='+z'):
        r1, r0, h = p['w'] / 2, p['w'] / 2 * 0.8, p['h']
        self.ring(cx, cz, y, y + h, r0, r1, 10, p['cell'], face=face); lid = cell_uv(p['cell'], 'side')
        self.disc(cx, cz, y + h, r1 + 0.003, 10, solid_uv('#ffffff')); self.n += 1

    def can(self, cx, cz, y, p, face='+z'):
        r, h = p['w'] / 2, p['h']
        self.ring(cx, cz, y + 0.008, y + h - 0.01, r, r, 10, p['cell'], face=face)
        self.ring(cx, cz, y, y + 0.008, r * 0.86, r, 10, p['cell'], uvpt=solid_uv('#c9ccd0'))
        self.ring(cx, cz, y + h - 0.01, y + h, r, r * 0.88, 10, p['cell'], uvpt=solid_uv('#c9ccd0'))
        self.disc(cx, cz, y + h, r * 0.88, 10, solid_uv('#c9ccd0')); self.n += 1

    def bottle(self, cx, cz, y, p, face='+z'):
        """寶特瓶：瓶身（液體顏色）、標籤（包裝）、瓶肩、瓶頸、瓶蓋"""
        r, h = p['w'] / 2, p['h']; liq = solid_uv(p.get('liquid', '#ffffff'))
        prof = [(0.0, r * 0.9, liq), (0.02, r, liq), (0.09, r, None), (0.16, r, liq), (0.19, r * 0.75, liq), (0.205, r * 0.42, liq), (0.212, r * 0.4, solid_uv('#ffffff'))]
        prof = [(y + t * h / 0.235, rr, u) for t, rr, u in prof]
        for (ya, ra, ua), (yb, rb, ub) in zip(prof, prof[1:]):
            if ua is None: self.ring(cx, cz, ya, yb, ra, rb, 8, p['cell'], face=face)
            else: self.ring(cx, cz, ya, yb, ra, rb, 8, p['cell'], uvpt=ua)
        cap = solid_uv(p['accent'] if p['accent'] in SOLIDS else ('#ffffff' if p['bg'] != '#ffffff' else '#2f7ed8'))
        self.ring(cx, cz, y + h * 0.9, y + h, r * 0.42, r * 0.42, 8, p['cell'], uvpt=cap); self.disc(cx, cz, y + h, r * 0.42, 8, cap); self.n += 1

    def tag(self, x0, x1, y0, y1, zf, face, price):
        """貨架前緣的價格標籤（白底紅字）"""
        if price not in PRICES: return
        fu = cell_uv(TAG0 + PRICES.index(price), 'front')
        if face == '+z': q = [(x0, y0, zf), (x1, y0, zf), (x1, y1, zf), (x0, y1, zf)]
        elif face == '-z': q = [(x1, y0, zf), (x0, y0, zf), (x0, y1, zf), (x1, y1, zf)]
        elif face == '+x': q = [(zf, y0, x1), (zf, y0, x0), (zf, y1, x0), (zf, y1, x1)]
        else: q = [(zf, y0, x0), (zf, y0, x1), (zf, y1, x1), (zf, y1, x0)]
        self._face(q, [(fu[0], fu[1]), (fu[2], fu[1]), (fu[2], fu[3]), (fu[0], fu[3])])

    def promo(self, x0, x1, y0, y1, zf, face, i):
        fu = cell_uv(PROMO_CELLS + i, 'front')
        q = [(x0, y0, zf), (x1, y0, zf), (x1, y1, zf), (x0, y1, zf)] if face == '+z' else [(x1, y0, zf), (x0, y0, zf), (x0, y1, zf), (x1, y1, zf)]
        self._face(q, [(fu[0], fu[1]), (fu[2], fu[1]), (fu[2], fu[3]), (fu[0], fu[3])])

    # ---- 一個商品（a＝沿著貨架的起點、depth＝離背板往外的範圍）
    def one(self, p, a, y, front_d, face, axis):
        w, h, dd = p['w'], p['h'], min(p['d'], 0.3)
        if axis == 'x':
            x0, x1 = a, a + w; z1 = front_d if face == '+z' else front_d + dd; z0 = z1 - dd
            if face == '-z': z0, z1 = front_d, front_d + dd
            cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
        else:
            z0, z1 = a, a + w; x1 = front_d if face == '+x' else front_d + dd; x0 = x1 - dd
            if face == '-x': x0, x1 = front_d, front_d + dd
            cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
        s = p['shape']
        if s == 'cup': self.cup(cx, cz, y, p, face)
        elif s == 'can': self.can(cx, cz, y, p, face)
        elif s == 'bottle': self.bottle(cx, cz, y, p, face)
        elif s == 'bag': self.bag(x0, x1, y, y + h, z0, z1, face, p['cell'])
        else: self.box(x0, x1, y, y + h, z0, z1, face, p['cell'])

    def shelf(self, a0, a1, y, front_d, face, axis, cats, hmax, rng, rail_y=None, facings=(2, 4), tag_d=None):
        """一層貨架：從 cats 輪流挑商品，每種並排 facings 個；每一組下面一張價格標籤（rail_y＝價格條的高度）"""
        pool = [p for c in cats for p in CATS.get(c, []) if p['h'] <= hmax + 1e-6]
        if not pool: return
        a = a0 + 0.02; last = None
        while a < a1 - 0.05:
            cands = [p for p in pool if p is not last] or pool; p = rng.choice(cands); last = p
            n = rng.randint(*facings); gap = 0.006 if p['shape'] in ('box', 'bag') else 0.004
            if a + p['w'] > a1 - 0.02: break
            start = a
            for i in range(n):
                if a + p['w'] > a1 - 0.02: break
                if rng.random() > 0.06: self.one(p, a, y, front_d, face, axis)     # 偶爾缺一個（賣掉了）
                a += p['w'] + gap
            if rail_y is not None and p['price']:
                tf = tag_d if tag_d is not None else front_d + (0.008 if face in ('+z', '+x') else -0.008)
                self.tag(start, min(start + 0.07, a1 - 0.02), rail_y - 0.052, rail_y - 0.012, tf, face, p['price'])
            a += 0.018

    def finish(self, parent, mesh_name=None):
        if not self.bm.faces: self.bm.free(); return None
        self.bm.normal_update(); me = bpy.data.meshes.new(mesh_name or self.name); self.bm.to_mesh(me); self.bm.free()
        me.materials.append(self.mat); ob = bpy.data.objects.new(mesh_name or self.name, me); bpy.context.scene.collection.objects.link(ob)
        if parent is not None: ob.parent = parent
        return ob


def atlas_material(name, path):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt = mt.node_tree; bsdf = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path); tx.image.pack(); tx.interpolation = 'Closest' if False else 'Linear'
    nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color']); bsdf.inputs['Roughness'].default_value = 0.45
    return mt
