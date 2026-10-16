"""ART-SOY1 豆漿店道具組（BG-20 豆漿店，大一下 ev_zhiruo_early_show；LAWWW2-B 分工 2026-10-16 09:47；AA-B 支援製作；規格 SCENE_RULES 第 5、8 節）
  /opt/blenv/bin/python tools/blender/env_second/aa_support/soy_props.py [-- --out assets/models/env/second_ai/aa_support/soy_props.glb]

LAWWW2-B 做店面室內與打光（算成 2D 背景）；這裡是道具。每件一個頂層節點，原點＝底部中央、正面（客人那一側）朝 +z：
  SOY_COUNTER    不鏽鋼前檯 2.4×0.7×0.9 m：台面倒角、前面板的拉絲明暗；兩個保溫豆漿桶（水龍頭、蓋子把手）、一疊白色塑膠碗、湯匙筒、側邊掛一捆塑膠袋
  SOY_OVEN       燒餅爐：不鏽鋼圓筒 Ø0.8×0.9，爐口內側黑、爐壁貼三個燒餅；旁邊撒芝麻的木板 0.6×0.4 上放四個生燒餅
  SOY_FRYER      油條炸鍋：不鏽鋼台 1.2×0.7×0.85 嵌一口大鍋（Ø0.7，深金色油面）；旁邊鐵絲瀝油架上七根油條（兩根黏在一起、彎的）
  SOY_DISPLAY    玻璃保溫櫃 1.0×0.5×0.5（放得上前檯）：不鏽鋼框＋很淡的玻璃（第二個材質）；兩層：飯糰、燒餅夾蛋、蛋餅捲
  SOY_TABLE      0.75×0.75 白色美耐板方桌（不鏽鋼包邊、四支腳）＋四張紅色塑膠圓凳（凳面有提手孔）
  SOY_CONDIMENT  桌上小物：醬油膏瓶、辣椒罐、筷子筒、抽取式衛生紙盒
  SOY_STEAMER    一疊三層竹蒸籠（Ø0.4）＋蓋子
沒有字、店名、品牌、標誌（D77；菜單看板 LAWWW2-B 在室內用貼圖做）。
材質兩個：soy_props（不透明：1024 底色貼圖集＋256 ORM，metal 最高 0.40）、soy_glass（保溫櫃的玻璃：很淡、半透明）。
造型：倒角方塊（lib2.rbox_bm）、旋轉體、沿曲線的管子；油條、燒餅、飯糰是橢球合體＋體素重建（和 ART-WZ5 的貓同一個做法），形狀不規則。
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
PARENT = os.path.dirname(HERE)
sys.path.insert(0, PARENT)
import lib2 as L   # noqa: E402
from lib2 import B, g2b, bpy, bmesh   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/aa_support/soy_props.glb'
GEN = os.path.join(PARENT, 'textures', 'gen')
ATLAS, ATLAS_ORM = (os.path.join(GEN, f'soy_props_{k}.png') for k in ('atlas', 'orm'))
N, SS, ORM_N = 1024, 2, 256
METAL = 0.40

REG = {
    'steel_panel': (0, 0, 256, 256),     # 不鏽鋼面板：上亮下暗的平滑漸層＋很淡的直線拉絲（沒有隨機斑點）
    'counter_front': (256, 0, 512, 256),  # 前檯正面：兩扇門的接縫、門下緣的把手凹槽
    'shaobing': (512, 0, 640, 128),      # 烤好的燒餅：金黃、邊緣深一點、芝麻
    'shaobing_raw': (640, 0, 768, 128),  # 生燒餅：淡麵團色、芝麻
    'wood_board': (768, 0, 1024, 128),   # 木板：直的木紋、撒了一層芝麻
    'rice_roll': (512, 128, 640, 256),   # 飯糰：白米、外面保鮮膜的一條反光
    'danbing': (640, 128, 768, 256),     # 蛋餅捲：餅皮＋蛋
    'bamboo': (768, 128, 1024, 256),     # 竹蒸籠側面：竹片一圈一圈
    'egg_layer': (0, 256, 128, 320),     # 燒餅夾蛋露出來的蛋
}
SW = {
    'steel': ((178, 180, 182), 0.34, METAL), 'steel_dark': ((112, 114, 118), 0.42, METAL), 'steel_edge': ((196, 198, 200), 0.28, METAL),
    'oven_in': ((26, 22, 20), 0.95, 0.0), 'ember': ((150, 62, 30), 0.9, 0.0), 'oil': ((150, 104, 28), 0.08, 0.0), 'oil_rim': ((92, 64, 26), 0.3, 0.0),
    'youtiao': ((196, 132, 58), 0.6, 0.0), 'youtiao_dark': ((160, 98, 40), 0.65, 0.0), 'wire': ((150, 152, 156), 0.35, METAL),
    'bowl': ((240, 240, 236), 0.4, 0.0), 'spoon': ((246, 246, 242), 0.35, 0.0), 'bag_a': ((236, 236, 238), 0.4, 0.0), 'bag_b': ((226, 196, 200), 0.42, 0.0), 'hook': ((140, 142, 146), 0.35, METAL),
    'urn_tap': ((60, 60, 64), 0.4, 0.0), 'red_plastic': ((196, 40, 38), 0.45, 0.0), 'melamine': ((238, 236, 230), 0.3, 0.0),
    'soy_bottle': ((52, 30, 20), 0.25, 0.0), 'red_cap': ((178, 36, 34), 0.4, 0.0), 'chili': ((150, 30, 22), 0.5, 0.0), 'jar_lid': ((208, 168, 52), 0.35, METAL),
    'chopstick': ((206, 178, 128), 0.6, 0.0), 'holder': ((68, 92, 70), 0.5, 0.0), 'tissue_box': ((226, 232, 240), 0.6, 0.0), 'tissue': ((250, 250, 248), 0.85, 0.0),
    'bamboo_lid': ((196, 164, 104), 0.7, 0.0), 'rice': ((240, 236, 226), 0.7, 0.0), 'dough': ((232, 206, 160), 0.8, 0.0), 'shelf': ((150, 152, 156), 0.4, METAL),
}
SW_CELL, SW_Y0 = 32, 896
for i, k in enumerate(SW):
    REG['sw_' + k] = ((i % 32) * SW_CELL, SW_Y0 + (i // 32) * SW_CELL, (i % 32) * SW_CELL + SW_CELL, SW_Y0 + (i // 32) * SW_CELL + SW_CELL)
ORM_REG = {'steel_panel': (0.34, METAL), 'counter_front': (0.36, METAL), 'shaobing': (0.7, 0.0), 'shaobing_raw': (0.85, 0.0), 'wood_board': (0.75, 0.0),
           'rice_roll': (0.45, 0.0), 'danbing': (0.7, 0.0), 'bamboo': (0.75, 0.0), 'egg_layer': (0.6, 0.0)}


# ================= 貼圖：只畫本來就是平面的花樣（接縫、芝麻、木紋、竹片、餅皮的捲）；材質本身是純色＋粗糙度 =================
def sz(name):
    x0, y0, x1, y1 = REG[name]; return (x1 - x0) * SS, (y1 - y0) * SS


def steel_img(w, h):
    a = np.zeros((h, w, 3), np.float32); yy = np.linspace(0, 1, h)[:, None]
    base = np.array(SW['steel'][0], np.float32); a[:] = base * (1.06 - 0.16 * yy[..., None])   # 上亮下暗的平滑漸層（燈在上面）
    for y in range(0, h, 3 * SS): a[y:y + 1] *= 0.985   # 很淡的水平拉絲線（規則的直線）
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def seeds(d, w, h, n, col, rng, r=1.6):
    for _ in range(n):
        x, y = rng.uniform(0.08, 0.92) * w, rng.uniform(0.08, 0.92) * h; a = rng.uniform(0, math.pi)
        dx, dy = math.cos(a) * r * SS, math.sin(a) * r * SS; d.line([(x - dx, y - dy), (x + dx, y + dy)], fill=col, width=int(1.4 * SS))


def paint(P):
    rng = np.random.default_rng(3)
    w, h = sz('steel_panel'); P.paste(steel_img(w, h), (REG['steel_panel'][0] * SS, REG['steel_panel'][1] * SS))
    w, h = sz('counter_front'); img = steel_img(w, h); d = ImageDraw.Draw(img)
    d.line([(w * 0.5, h * 0.06), (w * 0.5, h * 0.94)], fill=(120, 122, 126), width=2 * SS)   # 兩扇門的接縫
    for x0 in (0.04, 0.54): d.rectangle([w * x0, h * 0.06, w * (x0 + 0.42), h * 0.94], outline=(140, 142, 146), width=SS)
    for x0 in (0.1, 0.6): d.rectangle([w * x0, h * 0.86, w * (x0 + 0.3), h * 0.9], fill=(96, 98, 102))   # 把手凹槽
    P.paste(img, (REG['counter_front'][0] * SS, REG['counter_front'][1] * SS))
    for name, base, edge, seed_col in (('shaobing', (204, 146, 66), (160, 100, 40), (246, 230, 190)), ('shaobing_raw', (234, 214, 176), (220, 196, 156), (248, 238, 214))):
        w, h = sz(name); img = Image.new('RGB', (w, h), base); d = ImageDraw.Draw(img)
        for k in range(10): d.ellipse([w * 0.02 * k, h * 0.02 * k, w * (1 - 0.02 * k), h * (1 - 0.02 * k)], outline=tuple(int(edge[i] + (base[i] - edge[i]) * k / 10) for i in range(3)), width=SS)
        seeds(d, w, h, 70, seed_col, rng); P.paste(img.filter(ImageFilter.GaussianBlur(0.4 * SS)), (REG[name][0] * SS, REG[name][1] * SS))
    w, h = sz('wood_board'); img = Image.new('RGB', (w, h), (190, 152, 104)); d = ImageDraw.Draw(img)
    for k in range(0, h, 5 * SS): d.line([(0, k + 2 * SS * math.sin(k * 0.05)), (w, k + 2 * SS * math.sin(k * 0.05 + 1.3))], fill=(172, 134, 88), width=SS)   # 直的木紋
    seeds(d, w, h, 160, (244, 232, 200), rng, r=1.3); P.paste(img, (REG['wood_board'][0] * SS, REG['wood_board'][1] * SS))
    w, h = sz('rice_roll'); img = Image.new('RGB', (w, h), SW['rice'][0]); d = ImageDraw.Draw(img)
    for _ in range(140):
        x, y = rng.uniform(0, w), rng.uniform(0, h); d.ellipse([x - 2 * SS, y - 1 * SS, x + 2 * SS, y + 1 * SS], fill=(228, 224, 212))   # 米粒的輪廓
    d.rectangle([0, h * 0.3, w, h * 0.38], fill=(250, 250, 250))   # 保鮮膜的一條反光
    P.paste(img, (REG['rice_roll'][0] * SS, REG['rice_roll'][1] * SS))
    w, h = sz('danbing'); img = Image.new('RGB', (w, h), (226, 196, 140)); d = ImageDraw.Draw(img)
    for k in range(5): d.arc([w * (0.5 - 0.09 * k), h * (0.5 - 0.09 * k), w * (0.5 + 0.09 * k), h * (0.5 + 0.09 * k)], 0, 300, fill=(238, 196, 90), width=2 * SS)   # 捲起來的斷面（蛋＋餅皮）
    P.paste(img, (REG['danbing'][0] * SS, REG['danbing'][1] * SS))
    w, h = sz('bamboo'); img = Image.new('RGB', (w, h), (198, 166, 106)); d = ImageDraw.Draw(img)
    for k in range(0, h, 6 * SS): d.line([(0, k), (w, k)], fill=(170, 138, 84), width=SS)   # 竹片一圈一圈
    for k in range(0, w, 18 * SS): d.line([(k, 0), (k, h)], fill=(160, 128, 78), width=SS)   # 綁竹片的籐
    P.paste(img, (REG['bamboo'][0] * SS, REG['bamboo'][1] * SS))
    w, h = sz('egg_layer'); img = Image.new('RGB', (w, h), (246, 240, 226)); d = ImageDraw.Draw(img)
    d.rectangle([0, h * 0.3, w, h * 0.7], fill=(236, 192, 62)); P.paste(img, (REG['egg_layer'][0] * SS, REG['egg_layer'][1] * SS))


def make_textures():
    P = Image.new('RGB', (N * SS, N * SS), (128, 128, 128)); paint(P); d = ImageDraw.Draw(P)
    for k, (c, _, _) in SW.items():
        x0, y0, x1, y1 = REG['sw_' + k]; d.rectangle([x0 * SS, y0 * SS, x1 * SS - 1, y1 * SS - 1], fill=c)
    os.makedirs(GEN, exist_ok=True); P.resize((N, N), Image.LANCZOS).save(ATLAS)
    orm = np.zeros((ORM_N, ORM_N, 3), np.uint8); orm[..., 0] = 255; orm[..., 1] = 150; f = ORM_N / N
    for name, (x0, y0, x1, y1) in REG.items():
        rough, metal = SW[name[3:]][1:] if name.startswith('sw_') else ORM_REG[name]
        orm[int(y0 * f):int(math.ceil(y1 * f)), int(x0 * f):int(math.ceil(x1 * f)), 1] = int(rough * 255)
        orm[int(y0 * f):int(math.ceil(y1 * f)), int(x0 * f):int(math.ceil(x1 * f)), 2] = int(min(metal, METAL) * 255)
    Image.fromarray(orm).save(ATLAS_ORM)


# ================= 網格工具（同 wz6_items.py）=================
def ruv(name, s, t):
    x0, y0, x1, y1 = REG[name]; inset = SW_CELL * 0.33 if name.startswith('sw_') else 0.6
    px = x0 + inset + min(1, max(0, s)) * (x1 - x0 - 2 * inset); py = y0 + inset + (1 - min(1, max(0, t))) * (y1 - y0 - 2 * inset)
    return (px / N, 1 - py / N)


def R(name, flip=False): return lambda s, t: ruv(name, 1 - s if flip else s, t)
def S(name): return lambda s, t: ruv('sw_' + name, (s * 37.0) % 1.0, (t * 53.0) % 1.0)


def newell(ps):
    n = np.zeros(3)
    for i in range(len(ps)):
        a, b = ps[i], ps[(i + 1) % len(ps)]
        n += np.array([(a[1] - b[1]) * (a[2] + b[2]), (a[2] - b[2]) * (a[0] + b[0]), (a[0] - b[0]) * (a[1] + b[1])])
    return n


class PM:
    def __init__(self): self.v = []; self.f = []; self.uv = []
    def vid(self, p): self.v.append(np.array(p, float)); return len(self.v) - 1
    def face(self, ids, uvs, want=None):
        ids, uvs = list(ids), list(uvs)
        if want is not None and np.dot(newell([self.v[i] for i in ids]), want) < 0: ids.reverse(); uvs.reverse()
        self.f.append(ids); self.uv.append(uvs)
    def poly(self, pts, uvs, want): self.face([self.vid(p) for p in pts], uvs, want)
    def add(self, other, M=None):
        off = len(self.v)
        for p in other.v: self.v.append(p if M is None else M[:3, :3] @ p + M[:3, 3])
        for ids, uvs in zip(other.f, other.uv): self.f.append([i + off for i in ids]); self.uv.append(list(uvs))
        return self
    def tris(self): return sum(len(f) - 2 for f in self.f)
    def bbox(self):
        a = np.array(self.v); return [round(float(v), 4) for v in a.min(0)], [round(float(v), 4) for v in a.max(0)]


def T(x, y, z): M = np.eye(4); M[:3, 3] = (x, y, z); return M
def Ry(a): c, s = math.cos(a), math.sin(a); M = np.eye(4); M[0, 0], M[0, 2], M[2, 0], M[2, 2] = c, s, -s, c; return M
def Rx(a): c, s = math.cos(a), math.sin(a); M = np.eye(4); M[1, 1], M[1, 2], M[2, 1], M[2, 2] = c, -s, s, c; return M


def rbox(pm, x0, x1, y0, y1, z0, z1, uv, r=0.003, seg=1, M=None):
    """倒角方塊（lib2.rbox_bm）；UV 照面的法線方向投影：t 上 b 下 f 前（+z）k 後 r 右（+x）l 左"""
    W, H, D = x1 - x0, y1 - y0, z1 - z0; bm = L.rbox_bm(W, H, D, r, seg); cx, cy, cz = (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2; sub = PM()
    for f in bm.faces:
        pts = [(v.co.x + cx, v.co.z + cy, -v.co.y + cz) for v in f.verts]; n = np.array([f.normal.x, f.normal.z, -f.normal.y]); k = int(np.argmax(np.abs(n)))
        key = {(0, 1): 'r', (0, -1): 'l', (1, 1): 't', (1, -1): 'b', (2, 1): 'f', (2, -1): 'k'}[(k, 1 if n[k] > 0 else -1)]; fn = uv.get(key) or uv.get('*')
        def m(p):
            x, y, z = p
            return {'t': ((x - x0) / W, (z1 - z) / D), 'b': ((x - x0) / W, (z - z0) / D), 'f': ((x - x0) / W, (y - y0) / H),
                    'k': ((x1 - x) / W, (y - y0) / H), 'r': ((z1 - z) / D, (y - y0) / H), 'l': ((z - z0) / D, (y - y0) / H)}[key]
        sub.poly(pts, [fn(*m(p)) for p in pts], tuple(n))
    bm.free(); return pm.add(sub, M)


def lathe(pm, bands, n, caps=(), M=None):
    sub = PM()
    for (r0, y0, r1, y1, fn, want) in bands:
        a = [sub.vid((r0 * math.cos(2 * math.pi * k / n), y0, r0 * math.sin(2 * math.pi * k / n))) for k in range(n + 1)]
        b = [sub.vid((r1 * math.cos(2 * math.pi * k / n), y1, r1 * math.sin(2 * math.pi * k / n))) for k in range(n + 1)]
        for k in range(n):
            ang = 2 * math.pi * (k + 0.5) / n; o = (math.cos(ang), 0, math.sin(ang))
            w = {'out': o, 'in': (-o[0], 0, -o[2]), 'up': (0, 1, 0), 'down': (0, -1, 0)}[want]
            sub.face([a[k], a[k + 1], b[k + 1], b[k]], [fn(k / n, 0), fn((k + 1) / n, 0), fn((k + 1) / n, 1), fn(k / n, 1)], w)
    for (r, y, fn, want) in caps:
        pts = [(r * math.cos(2 * math.pi * k / n), y, r * math.sin(2 * math.pi * k / n)) for k in range(n)]
        sub.poly(pts, [fn(0.5 - p[0] / (2 * r), 0.5 + p[2] / (2 * r)) for p in pts], (0, 1, 0) if want == 'up' else (0, -1, 0))
    return pm.add(sub, M)


def sphere(pm, c, r, fn, seg=20, rings=12, M=None):
    sub = PM()
    for j in range(rings):
        t0, t1 = math.pi * j / rings, math.pi * (j + 1) / rings
        for i in range(seg):
            p0, p1 = 2 * math.pi * i / seg, 2 * math.pi * (i + 1) / seg
            q = [(math.sin(t) * math.cos(p), math.cos(t), math.sin(t) * math.sin(p)) for t, p in ((t0, p0), (t0, p1), (t1, p1), (t1, p0))]
            pts = [(c[0] + r * a, c[1] + r * b, c[2] + r * cc) for a, b, cc in q]
            uvs = [fn(p / (2 * math.pi), 1 - t / math.pi) for t, p in ((t0, p0), (t0, p1), (t1, p1), (t1, p0))]
            mid = np.mean(np.array(q), axis=0); sub.poly(pts, uvs, tuple(mid))
    return pm.add(sub, M)





def sweep(pm, pts, r, sides, fn, caps=True, closed=False):
    """沿折線的管子（平行移動的框架，圈不會扭轉）；fn(s, t)：s 沿管子、t 繞一圈"""
    P = [np.array(p, float) for p in pts]; n = len(P); rings = []; prev_u = None
    for i in range(n):
        if closed: tdir = P[(i + 1) % n] - P[(i - 1) % n]
        else: tdir = P[min(i + 1, n - 1)] - P[max(i - 1, 0)]
        tdir /= max(1e-9, np.linalg.norm(tdir))
        if prev_u is None:
            u = np.cross(tdir, [0, 1.0, 0]); u = u if np.linalg.norm(u) > 1e-6 else np.cross(tdir, [1.0, 0, 0])
        else: u = prev_u - tdir * np.dot(prev_u, tdir)
        u /= np.linalg.norm(u); w = np.cross(tdir, u); prev_u = u
        rr = r(i / max(1, n - 1)) if callable(r) else r
        rings.append([P[i] + (u * math.cos(2 * math.pi * k / sides) + w * math.sin(2 * math.pi * k / sides)) * rr for k in range(sides)])
    sub = PM(); m = n if closed else n - 1
    for i in range(m):
        A, Bv = rings[i], rings[(i + 1) % n]
        for k in range(sides):
            k1 = (k + 1) % sides; c = (A[k] + A[k1] + Bv[k] + Bv[k1]) / 4; ctr = (P[i] + P[(i + 1) % n]) / 2
            sub.poly([A[k], A[k1], Bv[k1], Bv[k]], [fn(i / m, k / sides), fn(i / m, (k + 1) / sides), fn((i + 1) / m, (k + 1) / sides), fn((i + 1) / m, k / sides)], tuple(c - ctr))
    if caps and not closed:
        for idx, sgn in ((0, -1), (n - 1, 1)):
            tdir = P[min(idx + 1, n - 1)] - P[max(idx - 1, 0)]
            sub.poly(rings[idx], [fn(0.5, 0.5)] * sides, tuple(tdir * sgn))
    return pm.add(sub)



def ribbon(pm, P, hw, ht, fn):
    """扁帶子：沿 P（在 yz 平面）走，寬 2×hw（x 方向）、厚 2×ht（z 方向）；四面＋兩端"""
    rings = [[p + np.array(o) for o in ((-hw, 0, -ht), (hw, 0, -ht), (hw, 0, ht), (-hw, 0, ht))] for p in P]
    for a, b in zip(rings, rings[1:]):
        for k, nrm in zip(range(4), ((0, 0, -1), (1, 0, 0), (0, 0, 1), (-1, 0, 0))):
            pm.poly([a[k], a[(k + 1) % 4], b[(k + 1) % 4], b[k]], [fn(0.5, 0.5)] * 4, nrm)
    pm.poly(rings[0], [fn(0.5, 0.5)] * 4, (0, 1, 0)); pm.poly(rings[-1], [fn(0.5, 0.5)] * 4, (0, -1, 0))



def blob_pm(elems, voxel, target, fn, smooth_iter=7, hull=None, hull_shrink=0.96):
    """橢球合體 → 體素重建 → 保體積平滑 → 減面（和 wz_cat.py 同一個做法）；回傳 PM（UV 全部指到 fn 的色塊）"""
    bm = bmesh.new()
    def add_ell(e):
        c, rad = e[0], e[1]; ry, rz = (math.radians(e[2]), math.radians(e[3])) if len(e) > 2 else (0.0, 0.0)
        Rm = (Ry(ry) @ np.array([[math.cos(rz), -math.sin(rz), 0, 0], [math.sin(rz), math.cos(rz), 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]))[:3, :3]
        res = bmesh.ops.create_uvsphere(bm, u_segments=14, v_segments=9, radius=1.0)
        for v in res['verts']:
            p = Rm @ (np.array([v.co.x, v.co.z, -v.co.y]) * np.array(rad)) + np.array(c); v.co = g2b(*p)
        return res['verts']
    if hull:   # 袋子：瓶子堆的凸包，往中心縮一點，再和瓶子本身合在一起——袋子包住整堆，瓶子只在表面撐出淺淺的稜
        hv = []
        for e in hull: hv += add_ell(e)
        h = bmesh.ops.convex_hull(bm, input=hv)
        bmesh.ops.delete(bm, geom=[g for g in h['geom_interior'] + h['geom_unused'] if isinstance(g, bmesh.types.BMVert)], context='VERTS')
        hull_v = [g for g in h['geom'] if isinstance(g, bmesh.types.BMVert) and g.is_valid]
        cen = sum((v.co for v in hull_v), hull_v[0].co * 0) / len(hull_v)
        for v in hull_v: v.co = cen + (v.co - cen) * hull_shrink
        for e in hull: add_ell(e)
    for e in elems: add_ell(e)
    me = bpy.data.meshes.new('_blob'); bm.to_mesh(me); bm.free(); ob = bpy.data.objects.new('_blob', me); B.scene().collection.objects.link(ob)
    rm = ob.modifiers.new('r', 'REMESH'); rm.mode = 'VOXEL'; rm.voxel_size = voxel
    sm = ob.modifiers.new('s', 'LAPLACIANSMOOTH'); sm.lambda_factor = 0.6; sm.iterations = smooth_iter; sm.use_volume_preserve = True
    dg = bpy.context.evaluated_depsgraph_get(); me2 = bpy.data.meshes.new_from_object(ob.evaluated_get(dg)); bpy.data.objects.remove(ob); bpy.data.meshes.remove(me)
    ob2 = bpy.data.objects.new('_dec', me2); B.scene().collection.objects.link(ob2); tris = sum(len(p.vertices) - 2 for p in me2.polygons)
    if tris > target:
        dm = ob2.modifiers.new('d', 'DECIMATE'); dm.ratio = target / tris; dm.use_collapse_triangulate = True
    dg = bpy.context.evaluated_depsgraph_get(); me3 = bpy.data.meshes.new_from_object(ob2.evaluated_get(dg)); bpy.data.objects.remove(ob2); bpy.data.meshes.remove(me2)
    pm = PM(); V = [np.array([v.co.x, v.co.z, -v.co.y]) for v in me3.vertices]
    for p in V: pm.v.append(p)
    for poly in me3.polygons: pm.f.append(list(poly.vertices)); pm.uv.append([fn(0.5, 0.5)] * len(poly.vertices))
    bpy.data.meshes.remove(me3); return pm





def proj_uv(pm, name, axes=(0, 2)):
    """把整個網格照兩個軸（預設 x、z：從上面看）投影到貼圖的一塊（燒餅的芝麻、木板）"""
    V = np.array(pm.v); lo, hi = V.min(0), V.max(0); a, b = axes
    pm.uv = [[ruv(name, (pm.v[i][a] - lo[a]) / max(1e-6, hi[a] - lo[a]), (pm.v[i][b] - lo[b]) / max(1e-6, hi[b] - lo[b])) for i in f] for f in pm.f]
    return pm


def blob_at(elems, voxel, target, fn, M=None, proj=None, smooth_iter=4):
    pm = blob_pm(elems, voxel, target, fn, smooth_iter=smooth_iter)
    if proj: proj_uv(pm, proj)
    return PM().add(pm, M)


# ---------------- 1. 前檯 ----------------
def urn(M=None):
    """保溫豆漿桶：不鏽鋼旋轉體 Ø0.38×0.55；底座一圈、桶身、肩、圓頂蓋＋蓋子的把手；前面（+z）一個水龍頭"""
    pm = PM(); R0 = 0.19
    lathe(pm, [(0.0, 0.0, R0 - 0.01, 0.0, S('steel_dark'), 'down'), (R0 - 0.01, 0.0, R0 - 0.004, 0.03, S('steel_dark'), 'out'), (R0 - 0.004, 0.03, R0, 0.04, S('steel'), 'out'),
               (R0, 0.04, R0, 0.44, R('steel_panel'), 'out'), (R0, 0.44, R0 - 0.02, 0.47, S('steel'), 'out'), (R0 - 0.02, 0.47, R0 - 0.015, 0.48, S('steel_edge'), 'out'),
               (R0 - 0.015, 0.48, 0.12, 0.525, S('steel'), 'out'), (0.12, 0.525, 0.0, 0.55, S('steel'), 'up')], 24)
    sweep(pm, [(-0.05, 0.545, 0.0), (-0.04, 0.575, 0.0), (0.04, 0.575, 0.0), (0.05, 0.545, 0.0)], 0.007, 6, S('urn_tap'))   # 蓋子的把手
    sweep(pm, [(0.0, 0.08, R0 - 0.01), (0.0, 0.08, R0 + 0.05), (0.0, 0.06, R0 + 0.065)], 0.009, 8, S('steel'))   # 水龍頭
    rbox(pm, -0.012, 0.012, 0.085, 0.13, R0 + 0.03, R0 + 0.045, {'*': S('urn_tap')}, r=0.004, seg=1)   # 水龍頭的扳手
    return PM().add(pm, M)


def bowl_stack(M=None):
    pm = PM(); bands = [(0.0, 0.0, 0.05, 0.0, S('bowl'), 'down')]; y = 0.0
    for k in range(9):   # 九個疊在一起的碗：每個露出一圈碗口
        bands += [(0.05, y, 0.07, y + 0.012, S('bowl'), 'out'), (0.07, y + 0.012, 0.072, y + 0.014, S('bowl'), 'out'), (0.072, y + 0.014, 0.05, y + 0.016, S('bowl'), 'out')]; y += 0.012
    bands += [(0.05, y + 0.004, 0.072, y + 0.04, S('bowl'), 'out'), (0.072, y + 0.04, 0.066, y + 0.042, S('bowl'), 'up'), (0.066, y + 0.042, 0.04, y + 0.004, S('bowl'), 'in')]
    lathe(pm, bands, 16); return PM().add(pm, M)


def spoon_cup(M=None):
    pm = PM(); lathe(pm, [(0.0, 0.0, 0.04, 0.0, S('steel_dark'), 'down'), (0.04, 0.0, 0.042, 0.11, S('steel'), 'out'), (0.042, 0.11, 0.038, 0.11, S('steel_edge'), 'up'),
                         (0.038, 0.11, 0.036, 0.01, S('steel_dark'), 'in')], 14)
    for k in range(5):   # 白色塑膠湯匙，柄朝上斜插
        a = 2 * math.pi * k / 5; dx, dz = 0.016 * math.cos(a), 0.016 * math.sin(a); tip = (dx * 2.2, 0.17, dz * 2.2)
        sweep(pm, [(dx, 0.02, dz), (dx * 1.6, 0.11, dz * 1.6), tip], 0.0035, 4, S('spoon'))
    return PM().add(pm, M)


def bag_bundle(M=None):
    """側邊的掛勾掛一捆塑膠袋（白、淡粉兩種疊在一起）"""
    pm = PM(); sweep(pm, [(0.0, 0.0, 0.0), (0.0, 0.0, 0.03), (0.0, -0.02, 0.045)], 0.003, 5, S('hook'))
    elems = [((0.0, -0.08, 0.05), (0.07, 0.07, 0.012)), ((0.01, -0.09, 0.062), (0.065, 0.065, 0.01)), ((-0.005, -0.16, 0.055), (0.06, 0.03, 0.014))]
    pm.add(blob_pm(elems, 0.006, 160, S('bag_a'), smooth_iter=4))
    pm.add(blob_pm([((0.008, -0.1, 0.07), (0.06, 0.06, 0.006))], 0.006, 80, S('bag_b'), smooth_iter=4))
    return PM().add(pm, M)


def counter():
    pm = PM(); W, H, D, TOP = 2.4, 0.86, 0.70, 0.04
    rbox(pm, -W / 2 + 0.02, W / 2 - 0.02, 0.06, H, -D / 2 + 0.02, D / 2 - 0.02, {'f': R('counter_front'), '*': R('steel_panel')}, r=0.006, seg=1)   # 櫃體（客人看得到的正面有兩扇門）
    rbox(pm, -W / 2, W / 2, H, H + TOP, -D / 2, D / 2, {'*': S('steel_edge')}, r=0.012, seg=2)   # 台面（倒角）
    for sx in (-1, 1):   # 腳：可以調高低的不鏽鋼圓腳
        for sz_ in (-1, 1): lathe(pm, [(0.022, 0.0, 0.022, 0.06, S('steel_dark'), 'out')], 10, M=T(sx * (W / 2 - 0.08), 0, sz_ * (D / 2 - 0.08)))
    y0 = H + TOP
    pm.add(urn(), T(-0.75, y0, -0.08)); pm.add(urn(), T(-0.3, y0, -0.08))
    pm.add(bowl_stack(), T(0.25, y0, 0.12)); pm.add(spoon_cup(), T(0.45, y0, 0.18))
    pm.add(bag_bundle(), T(W / 2 + 0.003, y0 - 0.06, 0.0) @ Ry(math.pi / 2))
    return pm


# ---------------- 2. 燒餅爐 ----------------
def shaobing(cooked=True, seed=0, M=None):
    rng = np.random.default_rng(seed); w, d = 0.11 + rng.uniform(-0.01, 0.01), 0.075 + rng.uniform(-0.008, 0.008)
    elems = [((0.0, 0.012, 0.0), (w / 2, 0.012, d / 2)), ((rng.uniform(-0.01, 0.01), 0.016, rng.uniform(-0.008, 0.008)), (w * 0.38, 0.01, d * 0.36))]   # 長橢圓、中間鼓一點
    return blob_at(elems, 0.004, 90, S('dough'), M, proj='shaobing' if cooked else 'shaobing_raw')


def oven():
    pm = PM(); R0, H = 0.40, 0.90
    lathe(pm, [(0.0, 0.0, R0 - 0.02, 0.0, S('steel_dark'), 'down'), (R0 - 0.02, 0.0, R0, 0.04, S('steel_dark'), 'out'), (R0, 0.04, R0, 0.30, R('steel_panel'), 'out'),
               (R0, 0.30, R0 + 0.012, 0.31, S('steel_edge'), 'out'), (R0 + 0.012, 0.31, R0 + 0.012, 0.34, S('steel_edge'), 'out'), (R0 + 0.012, 0.34, R0, 0.35, S('steel_edge'), 'out'),   # 兩道箍
               (R0, 0.35, R0, 0.62, R('steel_panel'), 'out'), (R0, 0.62, R0 + 0.012, 0.63, S('steel_edge'), 'out'), (R0 + 0.012, 0.63, R0 + 0.012, 0.66, S('steel_edge'), 'out'), (R0 + 0.012, 0.66, R0, 0.67, S('steel_edge'), 'out'),
               (R0, 0.67, R0, H - 0.04, R('steel_panel'), 'out'),
               (R0, H - 0.04, R0 - 0.01, H, S('steel_edge'), 'out'), (R0 - 0.01, H, R0 - 0.07, H, S('steel_edge'), 'up'), (R0 - 0.07, H, R0 - 0.1, H - 0.08, S('oven_in'), 'in'),
               (R0 - 0.1, H - 0.08, R0 - 0.11, 0.32, S('oven_in'), 'in'), (R0 - 0.11, 0.32, 0.0, 0.3, S('ember'), 'up')], 24)   # 爐口內側黑、底下炭火暗紅
    rbox(pm, -0.11, 0.11, 0.06, 0.2, R0 - 0.02, R0 + 0.008, {'*': S('steel_dark')}, r=0.006, seg=1)   # 前面下方的灰門
    rbox(pm, -0.04, 0.04, 0.16, 0.175, R0 + 0.008, R0 + 0.024, {'*': S('urn_tap')}, r=0.004, seg=1)   # 灰門的把手
    for k, a in enumerate((3.75, 4.7, 5.65)):   # 爐壁上貼三個燒餅：貼在後面那一側（客人從前面往爐口看得到），面朝爐中心
        r = R0 - 0.11 - 0.013; M = T(r * math.cos(a), H - 0.2 - 0.05 * k, r * math.sin(a)) @ Ry(-a) @ np.array([[0, -1, 0, 0], [1, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], float)
        pm.add(shaobing(True, seed=k), M)
    bx = 0.75   # 旁邊撒芝麻的木板，上面四個生燒餅
    rbox(pm, bx - 0.3, bx + 0.3, 0.0, 0.03, -0.2, 0.2, {'t': R('wood_board'), '*': S('chopstick')}, r=0.004, seg=1)
    for k, (x, z, a) in enumerate(((-0.15, -0.08, 10), (0.0, -0.07, -8), (0.15, -0.09, 4), (-0.06, 0.08, 95))):
        pm.add(shaobing(False, seed=10 + k), T(bx + x, 0.03, z) @ Ry(math.radians(a)))
    return pm


# ---------------- 3. 油條炸鍋 ----------------
def youtiao(seed, M=None):
    """一根油條＝兩條黏在一起的麵條：沿著彎的中線，每 2 cm 一顆球（粗細不均），兩條並排、中間黏住"""
    rng = np.random.default_rng(seed); L_ = 0.26 + rng.uniform(-0.02, 0.02); bend = rng.uniform(0.015, 0.035); elems = []
    for side in (-1, 1):
        for k in range(14):
            t = k / 13; x = (t - 0.5) * L_; z = side * 0.011 + bend * (1 - (2 * t - 1) ** 2) * 0.6; r = 0.011 + 0.003 * math.sin(t * 9 + seed + side) + rng.uniform(-0.0015, 0.0015)
            elems.append(((x, r, z), (0.016, r, r)))
    return blob_at(elems, 0.003, 230, S('youtiao'), M, smooth_iter=4)


def fryer():
    pm = PM(); W, H, D = 1.2, 0.85, 0.70
    rbox(pm, -W / 2, W / 2, 0.06, H - 0.03, -D / 2, D / 2, {'f': R('steel_panel'), '*': R('steel_panel')}, r=0.006, seg=1)
    rbox(pm, -W / 2, W / 2, H - 0.03, H, -D / 2, D / 2, {'*': S('steel_edge')}, r=0.01, seg=2)   # 台面（鍋是放在上面的大鍋，不挖洞）
    for sx in (-1, 1):
        for sz_ in (-1, 1): lathe(pm, [(0.02, 0.0, 0.02, 0.06, S('steel_dark'), 'out')], 10, M=T(sx * (W / 2 - 0.07), 0, sz_ * (D / 2 - 0.07)))
    cx = -0.22; R0 = 0.35
    lathe(pm, [(0.30, H - 0.14, R0, H + 0.015, S('steel_dark'), 'out'), (R0, H + 0.015, R0 + 0.02, H + 0.025, S('steel_edge'), 'out'), (R0 + 0.02, H + 0.025, R0 - 0.01, H + 0.025, S('steel_edge'), 'up'),
               (R0 - 0.01, H + 0.025, R0 - 0.02, H + 0.008, S('oil_rim'), 'in'), (R0 - 0.02, H + 0.008, 0.0, H + 0.008, S('oil'), 'up')], 24, M=T(cx, 0, 0))   # 大鍋嵌在台面裡（鍋身在台面下面看不到），只露出鍋緣；深金色的油面比鍋緣低 1.7 cm（要高過台面，不然被台面蓋住）
    rx, ry = 0.36, H   # 鐵絲瀝油架：框＋六根橫條，架在台面上，比台面高 4 cm
    for x0, x1, z0, z1 in ((rx - 0.2, rx + 0.2, -0.16, -0.16), (rx - 0.2, rx + 0.2, 0.16, 0.16), (rx - 0.2, rx - 0.2, -0.16, 0.16), (rx + 0.2, rx + 0.2, -0.16, 0.16)):
        sweep(pm, [(x0, ry + 0.04, z0), (x1, ry + 0.04, z1)], 0.004, 4, S('wire'))
    for k in range(6):
        x = rx - 0.17 + 0.068 * k; sweep(pm, [(x, ry + 0.042, -0.16), (x, ry + 0.042, 0.16)], 0.0025, 4, S('wire'))
    for sx in (-1, 1):
        for sz_ in (-1, 1): sweep(pm, [(rx + sx * 0.19, ry, sz_ * 0.15), (rx + sx * 0.19, ry + 0.04, sz_ * 0.15)], 0.003, 4, S('wire'))
    for k in range(7):   # 七根油條，一根一根排在架上（長的方向沿 z），有一點歪
        pm.add(youtiao(20 + k), T(rx - 0.15 + 0.05 * k, ry + 0.046, 0.01 * ((k * 5) % 3 - 1)) @ Ry(math.radians(90 + (k * 7) % 11 - 5)))
    return pm


# ---------------- 4. 玻璃保溫櫃 ----------------
def rice_roll(seed, M=None):
    rng = np.random.default_rng(seed); L_ = 0.11 + rng.uniform(-0.01, 0.01)
    elems = [((x, 0.026, 0.0), (0.03, 0.026 + rng.uniform(-0.002, 0.002), 0.03)) for x in np.linspace(-L_ / 2 + 0.02, L_ / 2 - 0.02, 4)]   # 保鮮膜包起來的長橢圓（飯糰）
    pm = blob_pm(elems, 0.004, 110, S('rice'), smooth_iter=4); proj_uv(pm, 'rice_roll', axes=(0, 1)); return PM().add(pm, M)


def shaobing_egg(seed, M=None):
    pm = PM(); pm.add(shaobing(True, seed)); rbox(pm, -0.045, 0.045, 0.011, 0.016, -0.03, 0.03, {'*': R('egg_layer')}, r=0.002, seg=1)
    pm.add(shaobing(True, seed + 5), T(0, 0.014, 0) @ Ry(0.1)); return PM().add(pm, M)


def danbing_roll(M=None):
    pm = PM(); lathe(pm, [(0.022, -0.06, 0.024, 0.06, S('dough'), 'out')], 12, caps=[(0.022, -0.06, R('danbing'), 'down'), (0.024, 0.06, R('danbing'), 'up')])
    return PM().add(pm, (np.eye(4) if M is None else M) @ np.array([[0, -1, 0, 0], [1, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], float) @ T(0, 0, 0))


def display():
    pm, gl = PM(), PM(); W, H, D = 1.0, 0.5, 0.5; t = 0.018
    rbox(pm, -W / 2, W / 2, 0.0, 0.05, -D / 2, D / 2, {'*': R('steel_panel')}, r=0.006, seg=1)   # 底座
    rbox(pm, -W / 2, W / 2, H - 0.03, H, -D / 2, D / 2 - 0.12, {'*': S('steel_edge')}, r=0.006, seg=1)   # 頂板（前面斜玻璃）
    for x in (-W / 2 + t / 2, W / 2 - t / 2):   # 四支直框＋前面斜框
        rbox(pm, x - t / 2, x + t / 2, 0.05, H - 0.03, -D / 2, -D / 2 + t, {'*': S('steel')}, r=0.003, seg=1)
        sweep(pm, [(x, 0.05, D / 2 - t / 2), (x, H - 0.03, D / 2 - 0.12)], t / 2, 4, S('steel'))
    rbox(pm, -W / 2, W / 2, 0.05, H - 0.03, -D / 2, -D / 2 + 0.01, {'*': S('steel_dark')}, r=0.002, seg=1)   # 背板（店員那一側是推拉門，這裡做成深色板）
    rbox(pm, -W / 2 + t, W / 2 - t, 0.24, 0.25, -D / 2 + 0.02, D / 2 - 0.08, {'*': S('shelf')}, r=0.002, seg=1)   # 中間的層板
    # 玻璃：兩側、前面斜的那一片（第二個材質；單面朝外）
    gl.poly([(-W / 2 + 0.002, 0.05, -D / 2), (-W / 2 + 0.002, 0.05, D / 2), (-W / 2 + 0.002, H - 0.03, D / 2 - 0.12), (-W / 2 + 0.002, H - 0.03, -D / 2)], [(0, 0)] * 4, (-1, 0, 0))
    gl.poly([(W / 2 - 0.002, 0.05, -D / 2), (W / 2 - 0.002, H - 0.03, -D / 2), (W / 2 - 0.002, H - 0.03, D / 2 - 0.12), (W / 2 - 0.002, 0.05, D / 2)], [(0, 0)] * 4, (1, 0, 0))
    gl.poly([(-W / 2, 0.05, D / 2), (W / 2, 0.05, D / 2), (W / 2, H - 0.03, D / 2 - 0.12), (-W / 2, H - 0.03, D / 2 - 0.12)], [(0, 0)] * 4, (0, 0.24, 1))
    for k, x in enumerate((-0.36, -0.22, -0.08)): pm.add(rice_roll(30 + k), T(x, 0.05, 0.02) @ Ry(math.radians(80 + 8 * k)))   # 下層：飯糰三個
    for k, x in enumerate((0.1, 0.26)): pm.add(shaobing_egg(40 + 2 * k), T(x, 0.05, 0.03) @ Ry(math.radians(5 - 10 * k)))   # 下層：燒餅夾蛋兩個
    for k, x in enumerate((-0.3, -0.18, -0.06, 0.06)): pm.add(danbing_roll(), T(x, 0.25 + 0.024, 0.0) @ Ry(math.radians(90 + 6 * k)))   # 上層：蛋餅捲四條
    return pm, gl


# ---------------- 5. 桌椅 ----------------
def stool(M=None):
    """紅色塑膠圓凳：凳面（中間一個提手孔）、往下張開的凳身、底圈"""
    pm = PM(); fn = S('red_plastic')
    lathe(pm, [(0.035, 0.45, 0.15, 0.45, fn, 'up'), (0.15, 0.45, 0.155, 0.435, fn, 'out'), (0.155, 0.435, 0.15, 0.42, fn, 'out'), (0.15, 0.42, 0.19, 0.0, fn, 'out'),
               (0.19, 0.0, 0.175, 0.0, fn, 'down'), (0.175, 0.0, 0.135, 0.41, fn, 'in'), (0.135, 0.41, 0.035, 0.425, fn, 'down'), (0.035, 0.425, 0.035, 0.45, fn, 'in')], 18)
    return PM().add(pm, M)


def table():
    pm = PM(); W, H = 0.75, 0.74
    rbox(pm, -W / 2, W / 2, H - 0.025, H, -W / 2, W / 2, {'t': S('melamine'), '*': S('steel_edge')}, r=0.006, seg=2)   # 白色美耐板桌面、不鏽鋼包邊
    for sx in (-1, 1):
        for sz_ in (-1, 1): lathe(pm, [(0.016, 0.0, 0.016, H - 0.025, S('steel'), 'out')], 10, M=T(sx * (W / 2 - 0.05), 0, sz_ * (W / 2 - 0.05)))
    for k, (x, z, a) in enumerate(((0, 0.62, 0), (0.62, 0, 30), (0, -0.62, 10), (-0.62, 0.05, -20))):
        pm.add(stool(), T(x, 0, z) @ Ry(math.radians(a)))
    return pm


# ---------------- 6. 桌上小物 ----------------
def condiment():
    pm = PM()
    lathe(pm, [(0.0, 0.0, 0.03, 0.0, S('soy_bottle'), 'down'), (0.03, 0.0, 0.03, 0.12, S('soy_bottle'), 'out'), (0.03, 0.12, 0.012, 0.16, S('soy_bottle'), 'out'),
               (0.012, 0.16, 0.013, 0.175, S('red_cap'), 'out'), (0.013, 0.175, 0.0, 0.18, S('red_cap'), 'up')], 14, M=T(-0.14, 0, 0))   # 醬油膏瓶（紅蓋）
    lathe(pm, [(0.0, 0.0, 0.035, 0.0, S('chili'), 'down'), (0.035, 0.0, 0.036, 0.07, S('chili'), 'out'), (0.036, 0.07, 0.032, 0.075, S('jar_lid'), 'out'),
               (0.032, 0.075, 0.033, 0.09, S('jar_lid'), 'out'), (0.033, 0.09, 0.0, 0.092, S('jar_lid'), 'up')], 14, M=T(-0.05, 0, 0.02))   # 辣椒罐（玻璃罐裡的紅辣椒，金色蓋）
    lathe(pm, [(0.0, 0.0, 0.035, 0.0, S('holder'), 'down'), (0.035, 0.0, 0.035, 0.12, S('holder'), 'out'), (0.035, 0.12, 0.031, 0.12, S('holder'), 'up'), (0.031, 0.12, 0.031, 0.01, S('holder'), 'in')], 12, M=T(0.05, 0, -0.02))   # 筷子筒
    for k in range(9):   # 筷子
        a = 2 * math.pi * k / 9; dx, dz = 0.018 * math.cos(a), 0.018 * math.sin(a)
        rbox(pm, -0.0035, 0.0035, 0.0, 0.23, -0.0035, 0.0035, {'*': S('chopstick')}, r=0.001, seg=1, M=T(0.05 + dx, 0.01, -0.02 + dz) @ Rx(dz * 3) @ np.array([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], float))
    rbox(pm, 0.11, 0.25, 0.0, 0.07, -0.06, 0.06, {'*': S('tissue_box')}, r=0.008, seg=2)   # 抽取式衛生紙盒＋抽出來的一張
    pm.add(blob_pm([((0.18, 0.08, 0.0), (0.03, 0.02, 0.012)), ((0.19, 0.095, 0.004), (0.018, 0.016, 0.008))], 0.004, 70, S('tissue'), smooth_iter=3))
    return pm


# ---------------- 7. 竹蒸籠 ----------------
def steamer():
    pm = PM(); R0 = 0.2; y = 0.0
    for k in range(3):
        lathe(pm, [(0.0, y, R0, y, S('bamboo_lid'), 'down'), (R0, y, R0, y + 0.075, R('bamboo'), 'out'), (R0, y + 0.075, R0 - 0.012, y + 0.075, S('bamboo_lid'), 'up')], 22); y += 0.075
    lathe(pm, [(R0 + 0.004, y, R0 + 0.004, y + 0.025, R('bamboo'), 'out'), (R0 + 0.004, y + 0.025, 0.06, y + 0.07, S('bamboo_lid'), 'out'), (0.06, y + 0.07, 0.0, y + 0.075, S('bamboo_lid'), 'up')], 22)   # 蓋子
    sweep(pm, [(-0.03, y + 0.072, 0.0), (-0.02, y + 0.095, 0.0), (0.02, y + 0.095, 0.0), (0.03, y + 0.072, 0.0)], 0.005, 5, S('bamboo_lid'))   # 蓋子的提把
    return pm


ITEMS = {'SOY_COUNTER': counter, 'SOY_OVEN': oven, 'SOY_FRYER': fryer, 'SOY_DISPLAY': display, 'SOY_TABLE': table, 'SOY_CONDIMENT': condiment, 'SOY_STEAMER': steamer}
SPREAD = {'SOY_COUNTER': (0.0, 0.0), 'SOY_OVEN': (-2.6, 0.0), 'SOY_FRYER': (2.3, 0.0), 'SOY_DISPLAY': (0.0, 1.3), 'SOY_TABLE': (-1.6, 1.7), 'SOY_CONDIMENT': (1.2, 1.4), 'SOY_STEAMER': (2.4, 1.4)}
BUDGET = {'SOY_COUNTER': 3000, 'SOY_OVEN': 2200, 'SOY_FRYER': 2600, 'SOY_DISPLAY': 2000, 'SOY_TABLE': 1600, 'SOY_CONDIMENT': 900, 'SOY_STEAMER': 600}
TOTAL_BUDGET = 12000
SMOOTH = {'SOY_FRYER': 0.9, 'SOY_OVEN': 0.9, 'SOY_DISPLAY': 0.9}   # 油條、燒餅、飯糰是減面後的體素網格，0.6 rad 會留下稜


def to_blender(pm, name, mats, parent, angle=0.6, glass=None):
    """glass：第二個材質（玻璃）的面，和 pm 合成同一個網格，material_index＝1"""
    nv = len(pm.v); V = list(pm.v) + (list(glass.v) if glass else []); F = [list(f) for f in pm.f] + ([[i + nv for i in f] for f in glass.f] if glass else [])
    UV = list(pm.uv) + (list(glass.uv) if glass else [])
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(g2b(*p)) for p in V], [], [tuple(f) for f in F])
    uvl = me.uv_layers.new(name='UVMap')
    for poly, uvs in zip(me.polygons, UV):
        for li, uv in zip(poly.loop_indices, uvs): uvl.data[li].uv = uv
    me.materials.append(mats[0])
    if glass:
        me.materials.append(mats[1])
        for k, poly in enumerate(me.polygons): poly.material_index = 1 if k >= len(pm.f) else 0
    me.validate(clean_customdata=False); me.update()
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6); bm.to_mesh(me); bm.free(); me.update()   # 合併重疊頂點（LAWWW2-B 驗收 WZ6 的修正）
    ob = bpy.data.objects.new(name, me); B.scene().collection.objects.link(ob); ob.parent = parent; ob['module'] = name
    L.smooth_mesh(ob, angle=angle)
    return ob


def build():
    make_textures()
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=1024)
    root = B.group('soy_props', props={'kind': 'soy_props'})
    mat = bpy.data.materials.new('soy_props'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS); tx.image.pack(); nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
    to = nt.nodes.new('ShaderNodeTexImage'); to.image = bpy.data.images.load(ATLAS_ORM); to.image.colorspace_settings.name = 'Non-Color'; to.image.pack()
    sp = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(to.outputs['Color'], sp.inputs['Color'])
    nt.links.new(sp.outputs['Green'], bsdf.inputs['Roughness']); nt.links.new(sp.outputs['Blue'], bsdf.inputs['Metallic'])
    glass = bpy.data.materials.new('soy_glass'); glass.use_nodes = True; gb = glass.node_tree.nodes['Principled BSDF']
    gb.inputs['Base Color'].default_value = (0.86, 0.92, 0.94, 1.0); gb.inputs['Roughness'].default_value = 0.05; gb.inputs['Metallic'].default_value = 0.0; gb.inputs['Alpha'].default_value = 0.16
    for attr, val in (('surface_render_method', 'BLENDED'), ('blend_method', 'BLEND')):
        try: setattr(glass, attr, val)
        except Exception: pass
    mods = {}
    for name, fn in ITEMS.items():
        r = fn(); pm, gl = r if isinstance(r, tuple) else (r, None)
        ob = to_blender(pm, name, (mat, glass), root, SMOOTH.get(name, 0.6), glass=gl); x, z = SPREAD[name]; ob.location = g2b(x, 0, z)
        mn, mx = pm.bbox(); tris = sum(len(p.vertices) - 2 for p in ob.data.polygons); mods[name] = {'tris': tris, 'min': mn, 'max': mx}
        assert tris <= BUDGET[name], (name, tris)
    assert sum(m['tris'] for m in mods.values()) <= TOTAL_BUDGET, sum(m['tris'] for m in mods.values())
    info = L.export(out, gpu_instances=False)
    info['materials'] = 2
    info['modules'] = mods
    info['atlas'] = [os.path.relpath(p, L.ROOT) for p in (ATLAS, ATLAS_ORM)]
    info['origins'] = {'*': '底部中央、y=0＝地面或放的那個面、正面（客人那一側）朝 +z',
                       'SOY_COUNTER': '台面高 0.9 m；豆漿桶、碗、湯匙筒在台面上，塑膠袋掛在 +x 那一側', 'SOY_DISPLAY': '放在前檯上就把原點對到台面（y=0.9）；玻璃是第二個材質 soy_glass',
                       'SOY_OVEN': '爐在原點，木板在 +x 0.75 m', 'SOY_FRYER': '大鍋在 −x，瀝油架在 +x', 'SOY_TABLE': '桌子在原點，四張凳子在四邊', 'SOY_CONDIMENT': '放在桌面上（y=桌面）'}
    info['note'] = '兩個材質：soy_props（底色 1024＋ORM 256，metal 最高 0.40）、soy_glass（保溫櫃玻璃，alpha 0.16）；每件一個網格；GLB 裡的位置只是排開給人看（SPREAD）'
    L.write_json(out[:-4] + '.json', info)
    print(json.dumps({k: v['tris'] for k, v in mods.items()}, ensure_ascii=False), sum(v['tris'] for v in mods.values()))
    return info


if __name__ == '__main__':
    build()
