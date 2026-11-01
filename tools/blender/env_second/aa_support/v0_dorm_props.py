"""V0-ART-DORM 經濟系那一年的宿舍房間道具（AA_168 第 1、4、5 節；LAWWW2-B 分工 2026-10-16 08:11；AA-B 支援製作）
  /opt/blenv/bin/python tools/blender/env_second/aa_support/v0_dorm_props.py [-- --out assets/models/env/second_ai/aa_support/v0_dorm_props.glb]

房間沿用法律系 203 的 3D 房間（AA_168 第 5 節：門牌改 412、換室友那一半的東西）。每件一個頂層節點，原點＝底面中心、正面朝 +z：
  BOXES_ONBED  開場：三個搬家紙箱疊在床上（最下面那一箱寫「被子」，AA_168「被子在最下面那一箱」）；原點＝床面
  BOXES_BED    阿勳搬下來的兩箱，放在床邊地上（「書」「衣服」）
  BOXES_FOOT   先睡的玩家：兩箱推到床尾，歪歪的靠在一起
  XUN_DESK     阿勳的書桌上：打開的筆電、一疊寫滿算式的計算紙、自動鉛筆、計算機；原點＝桌面
  XUN_BOWLING  床下露出來的保齡球球袋（單顆袋，拉鍊半開，看得到球）
  BOOK_ECON    《經濟學原理》課本（平放；要立在書架上就繞 x 轉 90°）
紙箱上的字是媽媽的麥克筆字（只畫進貼圖）；沒有品牌、校名（D77）。筆電、計算機沒有標誌。
造型：倒角方塊（lib2.rbox_bm）、旋轉體、紙箱的蓋子有折線和膠帶的厚度；轉成網格時合併重疊頂點（LAWWW2-B 驗收 WZ6 的修正）。
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
PARENT = os.path.dirname(HERE)
sys.path.insert(0, PARENT)
import lib2 as L   # noqa: E402
from lib2 import B, g2b, bpy, bmesh   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/aa_support/v0_dorm_props.glb'
GEN = os.path.join(PARENT, 'textures', 'gen')
ATLAS, ATLAS_ORM = (os.path.join(GEN, f'v0_dorm_props_{k}.png') for k in ('atlas', 'orm'))
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
N, SS, ORM_N = 1024, 2, 256

REG = {
    'lab_quilt': (0, 0, 256, 192), 'lab_books': (256, 0, 512, 192), 'lab_clothes': (512, 0, 768, 192),   # 紙箱頂面（蓋子）＋麥克筆
    'side_quilt': (0, 192, 256, 352), 'side_books': (256, 192, 512, 352), 'side_clothes': (512, 192, 768, 352),   # 紙箱側面（正面那一面有字）
    'calc_paper': (768, 0, 1024, 362),   # A4 計算紙（寫滿算式）
    'screen': (0, 352, 256, 512),        # 筆電螢幕（試算表）
    'keys': (256, 352, 512, 512),        # 鍵盤面
    'book_cov': (512, 352, 692, 608),    # 經濟學原理封面 19×26
    'book_spine': (692, 352, 736, 608),  # 書背 4.5 cm
    'page_edge': (736, 352, 800, 416),
    'calc_face': (800, 416, 880, 552),   # 計算機的面板
    'ball': (880, 416, 1008, 544),       # 保齡球的大理石紋（球面用）
}
SW = {
    'kraft': ((190, 150, 104), 0.85, 0.0), 'kraft_dark': ((150, 112, 74), 0.9, 0.0), 'tape': ((206, 176, 120), 0.45, 0.0),
    'alu': ((186, 188, 192), 0.38, 0.45), 'alu_dark': ((120, 122, 128), 0.4, 0.45), 'black_pl': ((34, 34, 38), 0.45, 0.0),
    'paper': ((246, 246, 240), 0.85, 0.0), 'pencil': ((58, 92, 150), 0.45, 0.0), 'eraser': ((240, 236, 226), 0.8, 0.0),
    'bag': ((36, 44, 68), 0.75, 0.0), 'bag_trim': ((150, 36, 40), 0.7, 0.0), 'zip': ((60, 60, 64), 0.4, 0.35), 'strap': ((26, 26, 30), 0.7, 0.0),
    'calc_body': ((52, 54, 60), 0.5, 0.0), 'hole': ((12, 12, 14), 0.9, 0.0),
}
SW_CELL, SW_Y0 = 32, 800
for i, k in enumerate(SW):
    REG['sw_' + k] = ((i % 32) * SW_CELL, SW_Y0 + (i // 32) * SW_CELL, (i % 32) * SW_CELL + SW_CELL, SW_Y0 + (i // 32) * SW_CELL + SW_CELL)
ORM_REG = {k: (0.85, 0.0) for k in ('lab_quilt', 'lab_books', 'lab_clothes', 'side_quilt', 'side_books', 'side_clothes', 'calc_paper', 'page_edge')}
ORM_REG.update({'screen': (0.2, 0.0), 'keys': (0.45, 0.3), 'book_cov': (0.55, 0.0), 'book_spine': (0.55, 0.0), 'calc_face': (0.45, 0.0), 'ball': (0.12, 0.0)})


# ================= 貼圖 =================
_F = {}
def font(px):
    px = max(6, int(px))
    if px not in _F: _F[px] = ImageFont.truetype(FONT, px)
    return _F[px]


def sz(name):
    x0, y0, x1, y1 = REG[name]; return (x1 - x0) * SS, (y1 - y0) * SS


def marker(img, cx, cy, text, size, color=(28, 28, 32), rot=0.0, seed=0):
    """麥克筆的字：粗、邊緣有一點暈開、整串稍微傾斜"""
    w, h = img.size; t = Image.new('L', (w, h), 0); d = ImageDraw.Draw(t); f = font(size); tw = d.textlength(text, font=f)
    d.text((cx - tw / 2, cy - size / 2), text, font=f, fill=255)
    t = t.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.2 * SS)).rotate(rot, center=(cx, cy), resample=Image.BICUBIC)
    img.paste(Image.new('RGB', img.size, color), (0, 0), t)


def paint(P):
    kraft = SW['kraft'][0]
    for k, label, rot in (('quilt', '被子', -4), ('books', '書　重', 3), ('clothes', '衣服', -2)):
        w, h = sz('lab_' + k); img = Image.new('RGB', (w, h), kraft); d = ImageDraw.Draw(img)
        d.line([(0, h // 2), (w, h // 2)], fill=SW['kraft_dark'][0], width=2 * SS)   # 兩片蓋子的接縫
        marker(img, w * 0.5, h * 0.3, label, h * 0.26, rot=rot)
        P.paste(img, (REG['lab_' + k][0] * SS, REG['lab_' + k][1] * SS))
        w, h = sz('side_' + k); img = Image.new('RGB', (w, h), kraft)
        marker(img, w * 0.5, h * 0.5, label.split('　')[0], h * 0.34, rot=rot / 2)
        if k == 'books': marker(img, w * 0.82, h * 0.82, '↑', h * 0.2)
        P.paste(img, (REG['side_' + k][0] * SS, REG['side_' + k][1] * SS))
    w, h = sz('calc_paper'); img = Image.new('RGB', (w, h), (246, 246, 240)); d = ImageDraw.Draw(img)
    for y in range(int(h * 0.06), h, int(h * 0.04)): d.line([(w * 0.06, y), (w * 0.94, y)], fill=(214, 220, 232), width=1)
    eq = ['max U(x,y)', 's.t. px·x + py·y = I', '∂L/∂x = 0', 'MRS = px / py', 'x* = αI / px', 'y* = (1-α)I / py', 'ε = -1', '∴ 第三題 = 0']
    for i, t in enumerate(eq): d.text((w * 0.08, h * (0.08 + i * 0.105)), t, font=font(h * 0.045), fill=(54, 54, 60))
    d.ellipse([w * 0.55, h * 0.83, w * 0.82, h * 0.93], outline=(54, 54, 60), width=2 * SS)   # 圈起來的答案
    P.paste(img, (REG['calc_paper'][0] * SS, REG['calc_paper'][1] * SS))
    w, h = sz('screen'); img = Image.new('RGB', (w, h), (232, 234, 238)); d = ImageDraw.Draw(img)
    d.rectangle([0, 0, w, h * 0.1], fill=(70, 120, 90))   # 試算表（沒有軟體標誌）
    for r in range(1, 14):
        y = h * (0.1 + r * 0.065); d.line([(0, y), (w, y)], fill=(200, 204, 210), width=1)
    for c in range(1, 6):
        x = w * c / 6; d.line([(x, h * 0.1), (x, h)], fill=(200, 204, 210), width=1)
    for r in range(1, 12):
        for c in range(0, 5):
            if (r * 7 + c * 3) % 5: d.text((w * (c / 6 + 0.02), h * (0.11 + r * 0.065)), f'{(r * 37 + c * 11) % 97 / 10:.1f}', font=font(h * 0.045), fill=(60, 60, 66))
    P.paste(img, (REG['screen'][0] * SS, REG['screen'][1] * SS))
    w, h = sz('keys'); img = Image.new('RGB', (w, h), SW['alu'][0]); d = ImageDraw.Draw(img)
    for r in range(5):
        for c in range(14):
            x0, y0 = w * (0.04 + c * 0.066), h * (0.06 + r * 0.11); d.rectangle([x0, y0, x0 + w * 0.056, y0 + h * 0.09], fill=(40, 40, 44))
    d.rectangle([w * 0.33, h * 0.66, w * 0.67, h * 0.94], outline=(160, 162, 168), width=SS)   # 觸控板
    P.paste(img, (REG['keys'][0] * SS, REG['keys'][1] * SS))
    w, h = sz('book_cov'); img = Image.new('RGB', (w, h), (232, 226, 210)); d = ImageDraw.Draw(img)
    d.rectangle([0, h * 0.62, w, h], fill=(176, 58, 46))   # 封面下半部的色塊
    for i in range(7):   # 供需曲線的線條圖
        pass
    d.line([(w * 0.18, h * 0.22), (w * 0.82, h * 0.54)], fill=(40, 40, 44), width=2 * SS); d.line([(w * 0.18, h * 0.54), (w * 0.82, h * 0.22)], fill=(176, 58, 46), width=2 * SS)
    tw = d.textlength('經濟學原理', font=font(h * 0.075)); d.text(((w - tw) / 2, h * 0.68), '經濟學原理', font=font(h * 0.075), fill=(250, 246, 236))
    tw = d.textlength('第九版', font=font(h * 0.04)); d.text(((w - tw) / 2, h * 0.79), '第九版', font=font(h * 0.04), fill=(250, 246, 236))
    P.paste(img, (REG['book_cov'][0] * SS, REG['book_cov'][1] * SS))
    w, h = sz('book_spine'); img = Image.new('RGB', (w, h), (176, 58, 46)); d = ImageDraw.Draw(img)
    for i, ch in enumerate('經濟學原理'): d.text((w * 0.18, h * (0.12 + i * 0.1)), ch, font=font(w * 0.62), fill=(250, 246, 236))
    P.paste(img, (REG['book_spine'][0] * SS, REG['book_spine'][1] * SS))
    w, h = sz('page_edge'); img = Image.new('RGB', (w, h), (244, 240, 230)); d = ImageDraw.Draw(img)
    for y in range(0, h, 2 * SS): d.line([(0, y), (w, y)], fill=(226, 222, 212), width=1)
    P.paste(img, (REG['page_edge'][0] * SS, REG['page_edge'][1] * SS))
    w, h = sz('calc_face'); img = Image.new('RGB', (w, h), SW['calc_body'][0]); d = ImageDraw.Draw(img)
    d.rectangle([w * 0.1, h * 0.06, w * 0.9, h * 0.22], fill=(170, 182, 160)); d.text((w * 0.5, h * 0.09), '0.', font=font(h * 0.09), fill=(30, 30, 30))
    for r in range(6):
        for c in range(4):
            x0, y0 = w * (0.1 + c * 0.21), h * (0.3 + r * 0.11); d.rectangle([x0, y0, x0 + w * 0.16, y0 + h * 0.08], fill=(90, 92, 100) if r else (180, 80, 60))
    P.paste(img, (REG['calc_face'][0] * SS, REG['calc_face'][1] * SS))
    w, h = sz('ball'); a = np.zeros((h, w, 3), np.float32); yy, xx = np.mgrid[0:h, 0:w] / max(w, h)
    wx = xx + 0.18 * np.sin(yy * 11 + np.sin(xx * 7) * 1.6); wy = yy + 0.16 * np.sin(xx * 9 + 1.3)   # 保齡球的大理石紋（球本來就是這種印刷般的花紋）：扭曲兩次的條紋，不是規則的鋸齒
    m = np.clip(np.sin(wx * 8 + np.sin(wy * 6) * 2.6) * 0.5 + 0.5, 0, 1) ** 1.6
    c1, c2 = np.array([70, 40, 120]), np.array([190, 120, 210])
    a[:] = c1 * (1 - m[..., None]) + c2 * m[..., None]
    P.paste(Image.fromarray(a.astype(np.uint8)), (REG['ball'][0] * SS, REG['ball'][1] * SS))


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


# ---------------- 紙箱 ----------------
BOX = {'quilt': (0.46, 0.28, 0.36), 'books': (0.40, 0.26, 0.32), 'clothes': (0.42, 0.24, 0.34)}   # (寬 x, 高 y, 深 z)；10-30 每箱矮 2 cm：三箱疊在書桌上頂到 1.54 m，床板底在 1.56 m（原本 1.60，穿過床板；DORM203-LM-1030）


def carton(kind, M=None):
    """搬家紙箱：箱身倒角、兩片蓋子（中間一條接縫）、一條膠帶跨過接縫往兩側各垂 6 cm；正面（+z）和頂面有麥克筆字"""
    pm = PM(); w, h, d = BOX[kind]; kr = S('kraft')
    rbox(pm, -w / 2, w / 2, 0, h, -d / 2, d / 2, {'t': R('lab_' + kind), 'f': R('side_' + kind), '*': kr}, r=0.004, seg=1)
    tp = S('tape'); tw = 0.048
    rbox(pm, -tw / 2, tw / 2, h, h + 0.0012, -d / 2 - 0.0005, d / 2 + 0.0005, {'*': tp}, r=0.0004, seg=1)
    for sgn in (1, -1):
        rbox(pm, -tw / 2, tw / 2, h - 0.06, h + 0.0005, sgn * d / 2 - (0.0012 if sgn > 0 else 0), sgn * d / 2 + (0.0012 if sgn < 0 else 0) if sgn < 0 else sgn * d / 2 + 0.0012, {'*': tp}, r=0.0004, seg=1)
    return PM().add(pm, M)


def boxes_onbed():
    pm = PM(); yq = BOX['quilt'][1]; yb = yq + BOX['books'][1]
    pm.add(carton('quilt'), T(0, 0, 0) @ Ry(math.radians(2)))
    pm.add(carton('books'), T(0.02, yq, -0.01) @ Ry(math.radians(-5)))
    pm.add(carton('clothes'), T(-0.015, yb, 0.012) @ Ry(math.radians(4)))
    return pm


def boxes_bed():
    pm = PM()
    pm.add(carton('books'), T(-0.23, 0, 0) @ Ry(math.radians(3)))
    pm.add(carton('clothes'), T(0.24, 0, 0.02) @ Ry(math.radians(-6)))
    return pm


def boxes_foot():
    pm = PM()   # 推到床尾：一箱靠著另一箱，歪的
    pm.add(carton('books'), T(-0.18, 0, 0.0) @ Ry(math.radians(12)))
    pm.add(carton('clothes'), T(0.25, 0, -0.04) @ Ry(math.radians(-18)))
    return pm


# ---------------- 阿勳的書桌 ----------------
def laptop(M=None):
    pm = PM(); W, D, t = 0.31, 0.215, 0.009; al, ald = S('alu'), S('alu_dark')
    rbox(pm, -W / 2, W / 2, 0, t, -D / 2, D / 2, {'t': lambda s, u: ruv('keys', s, u), '*': al}, r=0.004, seg=2)
    lid = PM(); rbox(lid, -W / 2, W / 2, 0, 0.006, 0, 0.205, {'b': lambda s, u: ruv('screen', s, u), '*': al}, r=0.004, seg=2)   # 闔起來的樣子（從轉軸往 +z 蓋在鍵盤上，螢幕那一面朝下）；繞 x 轉 −105° 打開，螢幕朝向使用者
    pm.add(lid, T(0, t, -D / 2) @ Rx(math.radians(-105)))
    return PM().add(pm, M)


def calc_paper_stack(M=None):
    pm = PM()
    for i in range(6):   # 六張紙疊在一起，每張歪一點
        a = math.radians((i * 37) % 9 - 4); sub = PM()
        fn = R('calc_paper') if i == 5 else S('paper')
        rbox(sub, -0.105, 0.105, 0, 0.0004, -0.1485, 0.1485, {'t': fn, '*': S('paper')}, r=0.0001, seg=1)
        pm.add(sub, T(0, i * 0.0005, 0) @ Ry(a))
    return PM().add(pm, M)


def pencil(M=None):
    pm = PM(); pc = S('pencil')
    lathe(pm, [(0.0038, 0.0, 0.0038, 0.13, pc, 'out'), (0.0038, 0.13, 0.0012, 0.142, S('alu'), 'out'), (0.0012, 0.142, 0.0004, 0.146, S('black_pl'), 'out')], 8,
          caps=[(0.0038, 0.0, S('eraser'), 'down')], M=None)
    return PM().add(pm, (M if M is not None else np.eye(4)) @ Rx(math.radians(90)) @ T(0, -0.073, 0))


def calculator(M=None):
    pm = PM(); rbox(pm, -0.04, 0.04, 0, 0.012, -0.08, 0.08, {'t': R('calc_face'), '*': S('calc_body')}, r=0.004, seg=2); return PM().add(pm, M)


def xun_desk():
    pm = PM()
    pm.add(laptop(), T(0.0, 0, 0.05))
    pm.add(calc_paper_stack(), T(-0.33, 0, 0.08) @ Ry(math.radians(8)))
    pm.add(pencil(), T(-0.30, 0.004, 0.16) @ Ry(math.radians(70)))
    pm.add(calculator(), T(0.30, 0, 0.12) @ Ry(math.radians(-10)))
    return pm


# ---------------- 保齡球球袋 ----------------
def xun_bowling():
    pm = PM(); bg, tr, zp, stp = S('bag'), S('bag_trim'), S('zip'), S('strap')
    W, H, D = 0.30, 0.24, 0.26
    rbox(pm, -W / 2 + 0.006, W / 2 - 0.006, 0.028, H * 0.82, -D / 2 + 0.006, D / 2 - 0.006, {'*': bg}, r=0.05, seg=3)   # 袋身（圓的）
    rbox(pm, -W / 2, W / 2, 0.0, 0.045, -D / 2, D / 2, {'*': tr}, r=0.014, seg=2)   # 硬底：球袋底部那一塊紅色的耐磨底座，袋身坐在裡面
    for sgn in (1, -1):   # 拉鍊半開：拉鍊兩側的布往外翻一點
        rbox(pm, -W * 0.36, W * 0.36, H * 0.80, H * 0.84, sgn * 0.03 - 0.012, sgn * 0.03 + 0.012, {'*': zp}, r=0.004, seg=1)
    sphere(pm, (0.0, H * 0.82 - 0.06, 0.0), 0.108, R('ball'), seg=20, rings=12)   # 球從拉鍊口露出來一點
    for (a, b_) in ((-0.02, 0.0), (0.02, 0.0), (0.0, 0.035)):   # 三個指孔（深色圓）
        sub = PM(); lathe(sub, [], 10, caps=[(0.0095, 0.0, S('hole'), 'up')])
        y = H * 0.82 - 0.06 + math.sqrt(max(0.0, 0.108 ** 2 - a * a - b_ * b_)) + 0.0006
        pm.add(sub, T(a, y, b_))
    for sgn in (1, -1):   # 提把：兩條倒角的帶子拱起來
        for k in range(10):   # 10 段、每段加長 20% 互相重疊，看起來是一條連續的帶子（6 段時接縫看得到，像鏈子）
            t0, t1 = math.pi * k / 10, math.pi * (k + 1) / 10
            x0_, y0_ = 0.07 * math.cos(t0), H * 0.84 + 0.06 * math.sin(t0); x1_, y1_ = 0.07 * math.cos(t1), H * 0.84 + 0.06 * math.sin(t1)
            mx, my = (x0_ + x1_) / 2, (y0_ + y1_) / 2; L_ = math.hypot(x1_ - x0_, y1_ - y0_); ang = math.atan2(y1_ - y0_, x1_ - x0_)
            seg_ = PM(); rbox(seg_, -L_ * 0.6, L_ * 0.6, -0.004, 0.004, -0.012, 0.012, {'*': stp}, r=0.002, seg=1)
            c, s_ = math.cos(ang), math.sin(ang); Mz = np.eye(4); Mz[0, 0], Mz[0, 1], Mz[1, 0], Mz[1, 1] = c, -s_, s_, c
            pm.add(seg_, T(mx, my, sgn * 0.06) @ Mz)
    return pm


# ---------------- 經濟學原理 ----------------
def book_econ():
    pm = PM(); W, D, Hh, c = 0.19, 0.26, 0.045, 0.003
    rbox(pm, -W / 2, W / 2, 0, c, -D / 2, D / 2, {'*': S('kraft_dark')}, r=0.001, seg=1)   # 封底（硬紙板）
    rbox(pm, -W / 2 + 0.003, W / 2 - 0.004, c, Hh - c, -D / 2 + 0.004, D / 2 - 0.004, {'*': R('page_edge')}, r=0.001, seg=1)
    rbox(pm, -W / 2, W / 2, Hh - c, Hh, -D / 2, D / 2, {'t': R('book_cov'), '*': S('kraft_dark')}, r=0.001, seg=1)
    rbox(pm, -W / 2 - 0.001, -W / 2 + 0.004, 0, Hh, -D / 2, D / 2, {'l': lambda s, t: ruv('book_spine', t, 1 - s), '*': S('kraft_dark')}, r=0.0015, seg=1)
    return pm


ITEMS = {'BOXES_ONBED': boxes_onbed, 'BOXES_BED': boxes_bed, 'BOXES_FOOT': boxes_foot, 'XUN_DESK': xun_desk, 'XUN_BOWLING': xun_bowling, 'BOOK_ECON': book_econ}
SPREAD = {'BOXES_ONBED': (-1.2, 0.0), 'BOXES_BED': (-0.4, 0.0), 'BOXES_FOOT': (0.5, 0.0), 'XUN_DESK': (1.4, 0.0), 'XUN_BOWLING': (-0.4, 0.8), 'BOOK_ECON': (0.4, 0.8)}
BUDGET = {'BOXES_ONBED': 2500, 'BOXES_BED': 2000, 'BOXES_FOOT': 2000, 'XUN_DESK': 3000, 'XUN_BOWLING': 3000, 'BOOK_ECON': 600}


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


def build():
    make_textures()
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=1024)
    root = B.group('v0_dorm_props', props={'kind': 'v0_dorm_props'})
    mat = bpy.data.materials.new('v0_dorm_props'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS); tx.image.pack(); nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
    to = nt.nodes.new('ShaderNodeTexImage'); to.image = bpy.data.images.load(ATLAS_ORM); to.image.colorspace_settings.name = 'Non-Color'; to.image.pack()
    sp = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(to.outputs['Color'], sp.inputs['Color'])
    nt.links.new(sp.outputs['Green'], bsdf.inputs['Roughness']); nt.links.new(sp.outputs['Blue'], bsdf.inputs['Metallic'])
    mods = {}
    for name, fn in ITEMS.items():
        pm = fn(); ob = to_blender(pm, name, mat, root); x, z = SPREAD[name]; ob.location = g2b(x, 0, z)
        mn, mx = pm.bbox(); tris = sum(len(p.vertices) - 2 for p in ob.data.polygons); mods[name] = {'tris': tris, 'min': mn, 'max': mx}
        assert tris <= BUDGET[name], (name, tris)
    info = L.export(out, gpu_instances=False)
    info['modules'] = mods
    info['atlas'] = [os.path.relpath(p, L.ROOT) for p in (ATLAS, ATLAS_ORM)]
    info['origins'] = {'*': '底面中心、y=0＝放的那個面、正面朝 +z', 'BOXES_ONBED': '原點＝床面（三箱疊在床上）', 'XUN_DESK': '原點＝桌面；筆電螢幕朝 +z 那一側的人（坐在桌前的人在 +z）',
                       'BOOK_ECON': '平放；立在書架上就繞 x 轉 90°（書背在 −x）'}
    info['note'] = '一個材質 v0_dorm_props（底色 1024＋ORM 256）；每件一個網格；GLB 裡的位置只是排開給人看（SPREAD）。203 的擺放：睡覺點 (−1.4, −1.5)、室友書桌 (1.8, 2.2) 面向 −z（LAWWW2-B 給的座標，LAWWW-B 擺）'
    L.write_json(out[:-4] + '.json', info)
    print(json.dumps({k: v['tris'] for k, v in mods.items()}, ensure_ascii=False))
    return info


if __name__ == '__main__':
    build()
