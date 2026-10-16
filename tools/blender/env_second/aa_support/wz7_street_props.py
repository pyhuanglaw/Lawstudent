"""ART-WZ7 溫州街路邊小物（LAWWW2-B 分工 2026-10-16 09:16；AA-B 支援製作；規格 SCENE_RULES 第 5、8 節）
  /opt/blenv/bin/python tools/blender/env_second/aa_support/wz7_street_props.py [-- --out assets/models/env/second_ai/aa_support/wz7_street_props.glb]

每件一個頂層節點，原點＝底面中心、正面朝 +z：
  WZ7_helmet          機車的 3/4 罩安全帽（臉的那一面朝 +z；放在坐墊上、掛在把手上用同一個網格，遊戲端自己轉）
  WZ7_umbrella_stand  店門口的不鏽鋼傘桶，插四把收起來的長傘
  WZ7_bike_lock       U 型鎖（立著，橫桿在下）＋旁邊一捲鋼纜鎖
  WZ7_delivery_box    外送保溫箱（素色深藍灰、沒有標誌；背帶在 −z 那一面）
  WZ7_RECYCLE         店家門口等回收車的紙箱捆（壓平、塑膠繩十字綁）＋一袋壓扁的寶特瓶
沒有品牌、沒有字（D77）。造型：倒角方塊（lib2.rbox_bm）、旋轉體、曲面網格、沿曲線的管子；袋子是橢球合體＋體素重建（和 ART-WZ5 的貓同一個做法）。
轉成網格時合併重疊頂點（LAWWW2-B 驗收 WZ6 的修正）。
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
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/aa_support/wz7_street_props.glb'
GEN = os.path.join(PARENT, 'textures', 'gen')
ATLAS, ATLAS_ORM = (os.path.join(GEN, f'wz7_street_props_{k}.png') for k in ('atlas', 'orm'))
N, SS, ORM_N = 1024, 2, 256

REG = {
    'dbox_side': (0, 0, 256, 256),       # 外送箱側面：素色、中間一條反光條、四邊縫線
    'dbox_top': (256, 0, 512, 256),      # 外送箱頂蓋：拉鍊一圈、縫線
    'card_face': (512, 0, 768, 192),     # 壓平的紙箱：牛皮紙、折線、撕掉一半的舊膠帶
    'card_edge': (768, 0, 1024, 32),     # 紙箱的切邊（瓦楞）
    'lock_bar': (768, 32, 1024, 96),     # U 型鎖橫桿：黑色橡膠套、鎖孔
    'helmet_shell': (0, 256, 256, 384),  # 安全帽殼：象牙白、側面一條細細的暗紅線（沒有字）
}
SW = {
    'shell_lining': ((30, 30, 32), 0.85, 0.0), 'rim': ((70, 46, 34), 0.6, 0.0), 'brim': ((236, 230, 214), 0.28, 0.0), 'strap': ((26, 26, 28), 0.7, 0.0), 'buckle': ((40, 40, 42), 0.4, 0.0),
    'steel': ((176, 178, 180), 0.32, 0.45), 'steel_dark': ((112, 114, 118), 0.4, 0.45), 'steel_in': ((88, 90, 92), 0.5, 0.45),
    'umb_navy': ((38, 50, 86), 0.55, 0.0), 'umb_green': ((44, 82, 64), 0.55, 0.0), 'umb_maroon': ((112, 38, 44), 0.55, 0.0), 'umb_black': ((30, 30, 34), 0.55, 0.0),
    'umb_tie': ((24, 24, 26), 0.6, 0.0), 'umb_handle': ((84, 56, 36), 0.45, 0.0), 'umb_tip': ((150, 152, 156), 0.35, 0.45),
    'shackle': ((150, 152, 158), 0.3, 0.45), 'shackle_coat': ((40, 40, 44), 0.6, 0.0), 'cable': ((176, 38, 40), 0.45, 0.0), 'cable_end': ((140, 142, 146), 0.35, 0.45),
    'dbox': ((58, 70, 88), 0.65, 0.0), 'dbox_strap': ((30, 32, 36), 0.7, 0.0), 'dbox_zip': ((44, 46, 50), 0.4, 0.3),
    'twine': ((228, 210, 92), 0.5, 0.0), 'pe_bag': ((184, 198, 212), 0.35, 0.0), 'kraft': ((188, 148, 100), 0.85, 0.0),
}
SW_CELL, SW_Y0 = 32, 896
for i, k in enumerate(SW):
    REG['sw_' + k] = ((i % 32) * SW_CELL, SW_Y0 + (i // 32) * SW_CELL, (i % 32) * SW_CELL + SW_CELL, SW_Y0 + (i // 32) * SW_CELL + SW_CELL)
ORM_REG = {'dbox_side': (0.65, 0.0), 'dbox_top': (0.65, 0.0), 'card_face': (0.88, 0.0), 'card_edge': (0.9, 0.0), 'lock_bar': (0.7, 0.0), 'helmet_shell': (0.25, 0.0)}


# ================= 貼圖：只畫本來就是平面的花樣（縫線、反光條、折線、鎖孔）；材質本身是純色＋粗糙度 =================
def sz(name):
    x0, y0, x1, y1 = REG[name]; return (x1 - x0) * SS, (y1 - y0) * SS


def paint(P):
    w, h = sz('dbox_side'); img = Image.new('RGB', (w, h), SW['dbox'][0]); d = ImageDraw.Draw(img)
    d.rectangle([0, h * 0.44, w, h * 0.54], fill=(196, 200, 204))   # 反光條（淺灰；遊戲沒有反光材質，用亮一點的灰）
    for k in range(0, w, 6 * SS): d.line([(k, h * 0.44), (k + 3 * SS, h * 0.44)], fill=(150, 154, 160), width=SS); d.line([(k, h * 0.54), (k + 3 * SS, h * 0.54)], fill=(150, 154, 160), width=SS)
    for m in (0.04, 0.96):   # 四邊的縫線
        for k in range(0, w, 7 * SS):
            d.line([(k, h * m), (k + 4 * SS, h * m)], fill=(92, 104, 122), width=SS); d.line([(w * m, k), (w * m, k + 4 * SS)], fill=(92, 104, 122), width=SS)
    P.paste(img, (REG['dbox_side'][0] * SS, REG['dbox_side'][1] * SS))
    w, h = sz('dbox_top'); img = Image.new('RGB', (w, h), SW['dbox'][0]); d = ImageDraw.Draw(img)
    d.rectangle([w * 0.06, h * 0.06, w * 0.94, h * 0.94], outline=(36, 38, 42), width=4 * SS)   # 拉鍊一圈
    for k in range(int(w * 0.06), int(w * 0.94), 3 * SS): d.line([(k, h * 0.06 - 2 * SS), (k, h * 0.06 + 2 * SS)], fill=(70, 72, 76), width=1)
    d.rectangle([w * 0.9, h * 0.04, w * 0.97, h * 0.1], fill=(30, 30, 34))   # 拉鍊頭
    P.paste(img, (REG['dbox_top'][0] * SS, REG['dbox_top'][1] * SS))
    w, h = sz('card_face'); img = Image.new('RGB', (w, h), SW['kraft'][0]); d = ImageDraw.Draw(img)
    for x in (0.32, 0.68): d.line([(w * x, 0), (w * x, h)], fill=(164, 126, 84), width=2 * SS)   # 壓平以後的折線
    d.line([(0, h * 0.5), (w, h * 0.5)], fill=(170, 132, 90), width=SS)
    d.rectangle([w * 0.1, h * 0.46, w * 0.27, h * 0.54], fill=(204, 176, 122))   # 撕掉一半的舊膠帶
    d.polygon([(w * 0.27, h * 0.46), (w * 0.3, h * 0.5), (w * 0.27, h * 0.54)], fill=(204, 176, 122))
    img = img.filter(ImageFilter.GaussianBlur(0.6 * SS)); P.paste(img, (REG['card_face'][0] * SS, REG['card_face'][1] * SS))
    w, h = sz('card_edge'); img = Image.new('RGB', (w, h), (176, 138, 92)); d = ImageDraw.Draw(img)
    for k in range(0, w, 5 * SS): d.arc([k, h * 0.3, k + 5 * SS, h * 0.7], 180, 360, fill=(140, 104, 66), width=SS)   # 瓦楞
    P.paste(img, (REG['card_edge'][0] * SS, REG['card_edge'][1] * SS))
    w, h = sz('lock_bar'); img = Image.new('RGB', (w, h), (36, 36, 40)); d = ImageDraw.Draw(img)
    d.rectangle([w * 0.0, 0, w * 0.12, h], fill=(22, 22, 24)); d.rectangle([w * 0.88, 0, w, h], fill=(22, 22, 24))   # 兩端的橡膠套
    d.ellipse([w * 0.8, h * 0.3, w * 0.86, h * 0.7], fill=(150, 152, 156)); d.rectangle([w * 0.825, h * 0.42, w * 0.835, h * 0.58], fill=(20, 20, 22))   # 鎖孔
    P.paste(img, (REG['lock_bar'][0] * SS, REG['lock_bar'][1] * SS))
    w, h = sz('helmet_shell'); img = Image.new('RGB', (w, h), SW['brim'][0]); d = ImageDraw.Draw(img)
    d.rectangle([0, h * 0.58, w, h * 0.62], fill=(140, 52, 48))   # 側面一條細細的暗紅線
    P.paste(img, (REG['helmet_shell'][0] * SS, REG['helmet_shell'][1] * SS))


def make_textures():
    P = Image.new('RGB', (N * SS, N * SS), (128, 128, 128)); paint(P); d = ImageDraw.Draw(P)
    for k, (c, _, _) in SW.items():
        x0, y0, x1, y1 = REG['sw_' + k]; d.rectangle([x0 * SS, y0 * SS, x1 * SS - 1, y1 * SS - 1], fill=c)
    os.makedirs(GEN, exist_ok=True); P.resize((N, N), Image.LANCZOS).save(ATLAS)
    orm = np.zeros((ORM_N, ORM_N, 3), np.uint8); orm[..., 0] = 255; orm[..., 1] = 150; f = ORM_N / N
    for name, (x0, y0, x1, y1) in REG.items():
        rough, metal = SW[name[3:]][1:] if name.startswith('sw_') else ORM_REG[name]
        orm[int(y0 * f):int(math.ceil(y1 * f)), int(x0 * f):int(math.ceil(x1 * f)), 1] = int(rough * 255)
        orm[int(y0 * f):int(math.ceil(y1 * f)), int(x0 * f):int(math.ceil(x1 * f)), 2] = int(min(metal, B.MAX_METAL) * 255)
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




def to_blender(pm, name, mat, parent):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(g2b(*p)) for p in pm.v], [], [tuple(f) for f in pm.f])
    uvl = me.uv_layers.new(name='UVMap')
    for poly, uvs in zip(me.polygons, pm.uv):
        for li, uv in zip(poly.loop_indices, uvs): uvl.data[li].uv = uv
    me.validate(clean_customdata=False); me.update(); me.materials.append(mat)
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6); bm.to_mesh(me); bm.free(); me.update()   # 合併重疊頂點（LAWWW2-B 驗收 WZ6 的修正）
    ob = bpy.data.objects.new(name, me); B.scene().collection.objects.link(ob); ob.parent = parent; ob['module'] = name
    L.smooth_mesh(ob, angle=0.6)
    return ob





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


# ---------------- 安全帽（3/4 罩）----------------
def helmet():
    """殼是 θ（繞直立軸，θ=0 朝前 +z）× φ（從頭頂往下）的曲面；φ 的下緣前面淺（臉露出來）、兩側蓋住耳朵、後面到後頸。
    外殼＋內襯（黑色 EPS，往內 1.4 cm）＋邊條（咖啡色皮邊）＋短帽簷＋兩條下巴帶"""
    pm = PM(); A = np.array([0.128, 0.135, 0.150]); C = np.array([0.0, 0.040, -0.012]); NT, NP = 28, 8   # 中心夠低，後頸那一圈下緣剛好碰地（放在地上、坐墊上不會被帶子撐起來）
    def pmax(th):   # 下緣：前面 60°（臉）、兩側約 95°（蓋住耳朵）、後面 106°；用 sin² 平滑過渡，前面不會有尖角（紅線不會折成 V）
        s_ = math.sin(th / 2) ** 2; return math.radians(60 + 46 * (1 - (1 - s_) ** 2))
    def pt(th, ph, s=1.0): return C + A * s * np.array([math.sin(ph) * math.sin(th), math.cos(ph), math.sin(ph) * math.cos(th)])
    for layer, s, fn, inward in (('out', 1.0, R('helmet_shell'), False), ('in', 0.89, S('shell_lining'), True)):
        G = [[pt(2 * math.pi * i / NT, pmax(2 * math.pi * i / NT) * j / NP, s) for j in range(NP + 1)] for i in range(NT + 1)]
        for i in range(NT):
            for j in range(NP):
                q = [G[i][j], G[i + 1][j], G[i + 1][j + 1], G[i][j + 1]]; c = np.mean(q, axis=0); out = c - C
                sub = [fn(i / NT, 1 - j / NP), fn((i + 1) / NT, 1 - j / NP), fn((i + 1) / NT, 1 - (j + 1) / NP), fn(i / NT, 1 - (j + 1) / NP)]
                pm.poly(q, sub, tuple(-out if inward else out))
    for i in range(NT):   # 邊條：外殼下緣到內襯下緣
        t0, t1 = 2 * math.pi * i / NT, 2 * math.pi * (i + 1) / NT
        a0, a1, b0, b1 = pt(t0, pmax(t0)), pt(t1, pmax(t1)), pt(t0, pmax(t0), 0.89), pt(t1, pmax(t1), 0.89)
        c = (a0 + a1) / 2; dn = c - C; dn[1] = -abs(dn[1]) - 0.05; pm.poly([a0, a1, b1, b0], [S('rim')(0.5, 0.5)] * 4, tuple(dn))
    # 帽簷：額頭上方往前 3 cm，左右 ±40°，固定在同一個 φ（不跟著臉的開口往兩側往下掉）
    top, bot = [], []; PH_B = pmax(0.0) - 0.03
    for k in range(9):
        th = math.radians(-40 + 80 * k / 8); e = pt(th, PH_B, 1.004); o = np.array([math.sin(th), 0, math.cos(th)])
        tip = e + o * 0.032 + np.array([0, -0.006, 0]); top.append((e + np.array([0, 0.002, 0]), tip + np.array([0, 0.002, 0]))); bot.append((e, tip))
    for k in range(8):
        pm.poly([top[k][0], top[k + 1][0], top[k + 1][1], top[k][1]], [S('brim')(0.5, 0.5)] * 4, (0, 1, 0.2))
        pm.poly([bot[k][0], bot[k][1], bot[k + 1][1], bot[k + 1][0]], [S('brim')(0.5, 0.5)] * 4, (0, -1, 0))
        pm.poly([top[k][1], top[k + 1][1], bot[k + 1][1], bot[k][1]], [S('brim')(0.5, 0.5)] * 4, tuple(np.array([math.sin(math.radians(-40 + 80 * (k + 0.5) / 8)), 0, math.cos(math.radians(-40 + 80 * (k + 0.5) / 8))])))
    for side in (1, -1):   # 下巴帶：收在帽子裡面，從耳朵的內側垂下來、躺在地上往中間；右邊那條末端有扣具
        th = side * math.pi / 2 * 0.9; e = pt(th, pmax(th) - 0.08, 0.86)
        path = [e, e + np.array([-side * 0.012, -0.5 * (e[1] - 0.006), 0.01]), np.array([side * 0.045, 0.006, e[2] + 0.03]), np.array([side * 0.012, 0.006, e[2] + 0.05])]
        sweep(pm, path, 0.0035, 5, S('strap'))
        if side > 0: c = path[-1]; rbox(pm, c[0] - 0.012, c[0] + 0.012, 0.0, 0.009, c[2] - 0.007, c[2] + 0.007, {'*': S('buckle')}, r=0.003, seg=1)
    return pm


# ---------------- 傘桶＋四把長傘 ----------------
def umbrella(color, M=None):
    """收起來的長傘（尖端朝下）：鐵尖、八折的傘面（剖面是八角星）、綁帶、傘柄、J 形把手；全長約 0.86 m"""
    pm = PM(); sub = PM(); n = 16
    prof = [(0.0, 0.004), (0.06, 0.007), (0.2, 0.022), (0.38, 0.028), (0.56, 0.013), (0.63, 0.015), (0.68, 0.007)]   # (y, 半徑)：尖端細、中段最胖、綁帶那裡收緊
    rows = []
    for (y, r) in prof:
        rows.append([sub.vid((r * (1 + 0.16 * math.cos(8 * 2 * math.pi * k / n)) * math.cos(2 * math.pi * k / n), y, r * (1 + 0.16 * math.cos(8 * 2 * math.pi * k / n)) * math.sin(2 * math.pi * k / n))) for k in range(n + 1)])
    fn = S(color)
    for j in range(len(prof) - 1):
        for k in range(n):
            ang = 2 * math.pi * (k + 0.5) / n; sub.face([rows[j][k], rows[j][k + 1], rows[j + 1][k + 1], rows[j + 1][k]], [fn(0, 0)] * 4, (math.cos(ang), 0, math.sin(ang)))
    pm.add(sub)
    lathe(pm, [(0.0165, 0.575, 0.0165, 0.6, S('umb_tie'), 'out')], 8)    # 綁帶（扣在收緊的地方）
    lathe(pm, [(0.004, 0.0, 0.0012, -0.03, S('umb_tip'), 'out')], 6)     # 鐵尖
    lathe(pm, [(0.0045, 0.68, 0.0045, 0.80, S('umb_handle'), 'out')], 6) # 傘柄
    sweep(pm, [(0, 0.80, 0)] + [(0.03 * (1 - math.cos(math.pi * k / 5)), 0.83 + 0.03 * math.sin(math.pi * k / 5), 0) for k in range(6)], 0.0065, 6, S('umb_handle'))   # J 形把手
    return PM().add(pm, (np.eye(4) if M is None else M) @ T(0, 0.03, 0))


def umbrella_stand():
    pm = PM(); R0, H = 0.115, 0.46
    lathe(pm, [(0.0, 0.0, R0 - 0.01, 0.0, S('steel_dark'), 'down'), (R0 - 0.01, 0.0, R0 + 0.004, 0.012, S('steel_dark'), 'out'), (R0 + 0.004, 0.012, R0 + 0.004, 0.035, S('steel_dark'), 'out'), (R0 + 0.004, 0.035, R0, 0.04, S('steel_dark'), 'out'),
               (R0, 0.04, R0, 0.30, S('steel'), 'out'), (R0, 0.30, R0 + 0.003, 0.306, S('steel'), 'out'), (R0 + 0.003, 0.306, R0, 0.312, S('steel'), 'out'), (R0, 0.312, R0, H - 0.015, S('steel'), 'out'),   # 底座深色一圈；上段一道壓出來的環
               (R0, H - 0.015, R0 + 0.006, H - 0.006, S('steel'), 'out'), (R0 + 0.006, H - 0.006, R0 - 0.004, H, S('steel'), 'up'), (R0 - 0.004, H, R0 - 0.006, 0.02, S('steel_in'), 'in'),
               (R0 - 0.006, 0.02, 0.0, 0.02, S('steel_in'), 'up')], 20)
    for (col, x, z, tilt, rot) in (('umb_navy', -0.035, 0.025, 5, 20), ('umb_green', 0.04, 0.03, -4, 110), ('umb_maroon', 0.0, -0.042, 4, 200), ('umb_black', 0.042, -0.028, -5, 300)):
        M = T(x, 0.02, z) @ Ry(math.radians(rot)) @ Rx(math.radians(tilt))   # 鐵尖踩在桶底（y=0.02）；傾斜不超過 5°，傘面不會穿出桶壁
        pm.add(umbrella(col), M)
    return pm


# ---------------- U 型鎖＋鋼纜鎖 ----------------
def bike_lock():
    pm = PM(); hw, leg, rr = 0.055, 0.20, 0.0095
    path = [(-hw, 0.02, 0)] + [(-hw, 0.02 + leg * k / 2, 0) for k in (1, 2)] + [(-hw * math.cos(math.pi * k / 14), 0.02 + leg + hw * math.sin(math.pi * k / 14), 0) for k in range(1, 14)] + [(hw, 0.02 + leg, 0), (hw, 0.02 + leg / 2, 0), (hw, 0.02, 0)]
    sweep(pm, path, rr, 12, lambda s, t: ruv('sw_shackle_coat' if 0.16 < s < 0.84 else 'sw_shackle', 0.5, 0.5))   # 中間包黑色塑膠套，兩腳末端露出鋼
    rbox(pm, -0.088, 0.088, 0.0, 0.036, -0.018, 0.018, {'f': R('lock_bar'), 'k': R('lock_bar', flip=True), '*': S('shackle_coat')}, r=0.008, seg=2)   # 橫桿（鎖頭在右端）
    coil = []
    for k in range(56 + 1):   # 鋼纜鎖：放在地上的三圈半線圈（軸直立），紅色塑膠皮
        a = 2 * math.pi * k / 16; coil.append((0.17 + 0.045 * math.cos(a), 0.007 + 0.011 * k / 16, 0.02 + 0.045 * math.sin(a)))
    sweep(pm, coil, 0.0055, 6, S('cable'))
    for (p, q) in ((coil[0], (0.0, 0, 0)), (coil[-1], (0.0, 0, 0))):
        c = np.array(p); rbox(pm, c[0] - 0.008, c[0] + 0.008, c[1] - 0.008, c[1] + 0.008, c[2] - 0.012, c[2] + 0.012, {'*': S('cable_end')}, r=0.003, seg=1)
    return pm


# ---------------- 外送保溫箱 ----------------
def delivery_box():
    pm = PM(); W, H, D = 0.40, 0.42, 0.32
    rbox(pm, -W / 2, W / 2, 0, H - 0.02, -D / 2, D / 2, {'f': R('dbox_side'), 'k': R('dbox_side'), 'l': R('dbox_side'), 'r': R('dbox_side'), '*': S('dbox')}, r=0.028, seg=2)
    rbox(pm, -W / 2 + 0.004, W / 2 - 0.004, H - 0.03, H, -D / 2 + 0.004, D / 2 - 0.004, {'t': R('dbox_top'), '*': S('dbox')}, r=0.022, seg=2)   # 頂蓋（拉鍊在貼圖上）
    sweep(pm, [(-0.07, H, 0.0)] + [(-0.07 * math.cos(math.pi * k / 8), H + 0.035 * math.sin(math.pi * k / 8), 0.0) for k in range(1, 8)] + [(0.07, H, 0.0)], 0.009, 8, S('dbox_strap'))   # 頂上的提把
    for sx in (-1, 1):   # 背帶：背面上緣到下緣，中間離箱子約 3 cm；扁的帶子（4.4 cm 寬、8 mm 厚）
        x = sx * 0.11; P = [np.array((x, H - 0.05 - (H - 0.13) * k / 8, -D / 2 - 0.004 - 0.028 * math.sin(math.pi * k / 8))) for k in range(9)]
        ribbon(pm, P, 0.022, 0.004, S('dbox_strap'))
    return pm


def ribbon(pm, P, hw, ht, fn):
    """扁帶子：沿 P（在 yz 平面）走，寬 2×hw（x 方向）、厚 2×ht（z 方向）；四面＋兩端"""
    rings = [[p + np.array(o) for o in ((-hw, 0, -ht), (hw, 0, -ht), (hw, 0, ht), (-hw, 0, ht))] for p in P]
    for a, b in zip(rings, rings[1:]):
        for k, nrm in zip(range(4), ((0, 0, -1), (1, 0, 0), (0, 0, 1), (-1, 0, 0))):
            pm.poly([a[k], a[(k + 1) % 4], b[(k + 1) % 4], b[k]], [fn(0.5, 0.5)] * 4, nrm)
    pm.poly(rings[0], [fn(0.5, 0.5)] * 4, (0, 1, 0)); pm.poly(rings[-1], [fn(0.5, 0.5)] * 4, (0, -1, 0))


# ---------------- 回收紙箱捆＋一袋寶特瓶 ----------------
def blob_pm(elems, voxel, target, fn):
    """橢球合體 → 體素重建 → 保體積平滑 → 減面（和 wz_cat.py 同一個做法）；回傳 PM（UV 全部指到 fn 的色塊）"""
    bm = bmesh.new()
    for e in elems:
        c, rad = e[0], e[1]; ry, rz = (math.radians(e[2]), math.radians(e[3])) if len(e) > 2 else (0.0, 0.0)
        Rm = (Ry(ry) @ np.array([[math.cos(rz), -math.sin(rz), 0, 0], [math.sin(rz), math.cos(rz), 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]))[:3, :3]
        res = bmesh.ops.create_uvsphere(bm, u_segments=14, v_segments=9, radius=1.0)
        for v in res['verts']:
            p = Rm @ (np.array([v.co.x, v.co.z, -v.co.y]) * np.array(rad)) + np.array(c); v.co = g2b(*p)
    me = bpy.data.meshes.new('_blob'); bm.to_mesh(me); bm.free(); ob = bpy.data.objects.new('_blob', me); B.scene().collection.objects.link(ob)
    rm = ob.modifiers.new('r', 'REMESH'); rm.mode = 'VOXEL'; rm.voxel_size = voxel
    sm = ob.modifiers.new('s', 'LAPLACIANSMOOTH'); sm.lambda_factor = 0.6; sm.iterations = 7; sm.use_volume_preserve = True
    dg = bpy.context.evaluated_depsgraph_get(); me2 = bpy.data.meshes.new_from_object(ob.evaluated_get(dg)); bpy.data.objects.remove(ob); bpy.data.meshes.remove(me)
    ob2 = bpy.data.objects.new('_dec', me2); B.scene().collection.objects.link(ob2); tris = sum(len(p.vertices) - 2 for p in me2.polygons)
    if tris > target:
        dm = ob2.modifiers.new('d', 'DECIMATE'); dm.ratio = target / tris; dm.use_collapse_triangulate = True
    dg = bpy.context.evaluated_depsgraph_get(); me3 = bpy.data.meshes.new_from_object(ob2.evaluated_get(dg)); bpy.data.objects.remove(ob2); bpy.data.meshes.remove(me2)
    pm = PM(); V = [np.array([v.co.x, v.co.z, -v.co.y]) for v in me3.vertices]
    for p in V: pm.v.append(p)
    for poly in me3.polygons: pm.f.append(list(poly.vertices)); pm.uv.append([fn(0.5, 0.5)] * len(poly.vertices))
    bpy.data.meshes.remove(me3); return pm


def recycle_bundle():
    pm = PM(); rng = np.random.default_rng(7); top = 0.0
    for i in range(8):   # 八塊壓平的紙箱（瓦楞紙約 6 mm），每塊歪一點、大小不同
        w, d = 0.56 + rng.uniform(-0.06, 0.04), 0.40 + rng.uniform(-0.05, 0.04); t = 0.006
        sub = PM(); rbox(sub, -w / 2, w / 2, 0, t, -d / 2, d / 2, {'t': R('card_face', flip=bool(i % 2)), 'b': R('card_face'), '*': lambda s, u: ruv('card_edge', s, u)}, r=0.002, seg=1)
        pm.add(sub, T(rng.uniform(-0.015, 0.015), top, rng.uniform(-0.012, 0.012)) @ Ry(math.radians(rng.uniform(-4, 4)))); top += t
    hx, hz, ht = 0.25, 0.17, top + 0.004
    for axis in ('x', 'z'):   # 塑膠繩十字綁：繞紙箱一圈（四個角），上面打結
        if axis == 'x': loop = [(-hx - 0.004, -0.002, 0.0), (-hx - 0.004, ht, 0.0), (hx + 0.004, ht, 0.0), (hx + 0.004, -0.002, 0.0)]
        else: loop = [(0.0, -0.002, -hz - 0.004), (0.0, ht, -hz - 0.004), (0.0, ht, hz + 0.004), (0.0, -0.002, hz + 0.004)]
        sweep(pm, loop, 0.0028, 4, S('twine'), caps=False, closed=True)
    sphere(pm, (0.0, ht + 0.006, 0.0), 0.009, S('twine'), seg=8, rings=5)
    # 一袋壓扁的寶特瓶：矮矮的一袋，瓶子（扁的長橢球、方向亂）只在袋子表面撐出淺淺的稜；袋口收緊、打一個結，兩條袋耳往兩側垂下來（不要立起來，不然像動物的耳朵）
    elems = [((0.40, 0.072, 0.0), (0.115, 0.072, 0.10)), ((0.40, 0.125, 0.0), (0.08, 0.05, 0.072))]
    for (x, y, z, ry, rz) in ((0.34, 0.06, 0.035, 20, 80), (0.46, 0.065, -0.03, -35, 75), (0.40, 0.09, 0.055, 70, 12), (0.385, 0.10, -0.05, -10, 20), (0.445, 0.12, 0.025, 45, -25), (0.36, 0.125, -0.01, 100, -15)):
        elems.append(((x, y, z), (0.026, 0.015, 0.075), ry, rz))
    elems += [((0.40, 0.17, 0.0), (0.017, 0.02, 0.015)), ((0.40, 0.188, 0.0), (0.016, 0.011, 0.014)),
              ((0.376, 0.186, 0.0), (0.024, 0.005, 0.012), 0, 18), ((0.424, 0.184, 0.0), (0.024, 0.005, 0.012), 0, -22)]
    pm.add(blob_pm(elems, 0.006, 720, S('pe_bag')))
    return pm


ITEMS = {'WZ7_helmet': helmet, 'WZ7_umbrella_stand': umbrella_stand, 'WZ7_bike_lock': bike_lock, 'WZ7_delivery_box': delivery_box, 'WZ7_RECYCLE': recycle_bundle}
SPREAD = {'WZ7_helmet': (-0.9, 0.0), 'WZ7_umbrella_stand': (-0.35, 0.0), 'WZ7_bike_lock': (0.15, 0.0), 'WZ7_delivery_box': (0.75, 0.0), 'WZ7_RECYCLE': (-0.2, 0.75)}
BUDGET = {'WZ7_helmet': 1400, 'WZ7_umbrella_stand': 1700, 'WZ7_bike_lock': 1500, 'WZ7_delivery_box': 900, 'WZ7_RECYCLE': 1300}
TOTAL_BUDGET = 6000


def build():
    make_textures()
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=1024)
    root = B.group('wz7_street_props', props={'kind': 'wz7_street_props'})
    mat = bpy.data.materials.new('wz7_street_props'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS); tx.image.pack(); nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
    to = nt.nodes.new('ShaderNodeTexImage'); to.image = bpy.data.images.load(ATLAS_ORM); to.image.colorspace_settings.name = 'Non-Color'; to.image.pack()
    sp = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(to.outputs['Color'], sp.inputs['Color'])
    nt.links.new(sp.outputs['Green'], bsdf.inputs['Roughness']); nt.links.new(sp.outputs['Blue'], bsdf.inputs['Metallic'])
    mods = {}
    for name, fn in ITEMS.items():
        pm = fn(); ob = to_blender(pm, name, mat, root); x, z = SPREAD[name]; ob.location = g2b(x, 0, z)
        mn, mx = pm.bbox(); tris = sum(len(p.vertices) - 2 for p in ob.data.polygons); mods[name] = {'tris': tris, 'min': mn, 'max': mx}
        assert tris <= BUDGET[name], (name, tris)
    assert sum(m['tris'] for m in mods.values()) <= TOTAL_BUDGET, sum(m['tris'] for m in mods.values())
    info = L.export(out, gpu_instances=False)
    info['materials'] = 1
    info['modules'] = mods
    info['atlas'] = [os.path.relpath(p, L.ROOT) for p in (ATLAS, ATLAS_ORM)]
    info['origins'] = {'*': '底面中心、y=0＝放的那個面、正面朝 +z', 'WZ7_helmet': '臉的那一面朝 +z；掛在把手上就繞 x 轉、讓帽頂朝外', 'WZ7_bike_lock': 'U 型鎖立著、原點在橫桿下方；鋼纜鎖在 +x 那一側的地上',
                       'WZ7_delivery_box': '背帶在 −z；放在機車後座就讓 −z 朝前', 'WZ7_RECYCLE': '紙箱捆在原點，寶特瓶袋在 +x 約 0.4 m'}
    info['note'] = '一個材質 wz7_street_props（底色 1024＋ORM 256）；每件一個網格；GLB 裡的位置只是排開給人看（SPREAD）。擺在溫州街哪裡由 LAWWW-B／LAWWW2-B 決定'
    L.write_json(out[:-4] + '.json', info)
    print(json.dumps({k: v['tris'] for k, v in mods.items()}, ensure_ascii=False), sum(v['tris'] for v in mods.values()))
    return info


if __name__ == '__main__':
    build()
