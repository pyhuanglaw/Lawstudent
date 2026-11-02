"""ART-US4 美國公寓衛浴＋陽台小物（SCN-US-01 祐廷租的校外學生公寓 1x1，大三下美國交換，D47；LAWWW2-B 分工 2026-10-16 12:51；AA-B 支援製作；規格同 ART-US1、US2）
  /opt/blenv/bin/python tools/blender/env_second/aa_support/us_bath_props.py [-- --out assets/models/env/second_ai/aa_support/us_bath_props.glb]

LAWWW2-B 做房間（牆、牆面磁磚、門）和組裝；這一組取代他房間裡程序化的浴缸、馬桶、洗手台。位置照 src/data/us_apartment_layout.js v2 的 bath 和陽台；
照片沒拍到浴室，照美國一般學生公寓：白色搪瓷、鍍鉻、楓木櫃，和廚房（ART-US2）一致。
每件一個頂層節點，原點＝地面上的底部中央、正面（人站的那一側）朝 +z、靠牆的一側在 −z：
  US_TUB            浴缸淋浴兩用 1.5×0.75（缸緣高 0.5）：白色搪瓷（內面圓角）、前面的裙板，兩端和背面也封起來（擺好後東端朝浴室）；+x 那一端牆上的水龍頭、單把手、淋浴的鍍鉻臂＋蓮蓬頭；
                    前緣上方 1.95 m 的伸縮桿＋十個掛環，米白色浴簾拉開一半、收在 −x 那一端（layout 貼南牆，ry=π：本地 +x＝房間的西端）
  US_TOILET         白色馬桶：橢圓的座、蓋子放下來、水箱在 −z（靠牆）、左邊鍍鉻沖水把手
  US_VANITY         洗手台櫃 1.2×0.55、檯面高 0.86：楓木色兩扇門＋右邊三個抽屜（和 US2 同一種楓木）、白色檯面＋10 cm 擋水、嵌入的臉盆（本地 x −0.3）＋鍍鉻水龍頭；
                    上面藥櫃式的鏡子 0.75×0.65（鋁框，底 1.05 m；鏡面是淺灰藍的漸層，不反射）
  US_TOWELBAR       鍍鉻毛巾桿（長 0.6、離地 1.2）＋一條掛著的淺藍毛巾；原點在桿正下方的地面，牆在 z=0
  US_BATHMAT        浴室腳踏墊 0.5×0.8（米色、圓角、短絨）
  US_BALCONY_CHAIR  陽台的折疊椅（深灰金屬框＋深色木條，座高 0.45）；layout 擺兩張
  US_BALCONY_TABLE  陽台的小圓桌（直徑 0.6、高 0.7，同一套）
沒有字、品牌、標誌（D77）。
材質一個：us_bath（1024 底色貼圖集＋256 ORM，metal 最高 0.40）。楓木＝Poly Haven walnut_veneer 改成淺的蜂蜜色（同 US2）；腳踏墊的短絨＝dirty_carpet 的明暗（CC0）；
門片凹框、浴簾的淡條紋、毛巾的織邊、鏡面的漸層是畫的；搪瓷、陶瓷、鍍鉻、鋁、金屬框是色塊。
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
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/aa_support/us_bath_props.glb'
GEN = os.path.join(PARENT, 'textures', 'gen')
ATLAS, ATLAS_ORM = (os.path.join(GEN, f'us_bath_props_{k}.png') for k in ('atlas', 'orm'))
TEX2 = os.path.join(PARENT, 'textures')
SRC = {'walnut': os.path.join(TEX2, 'walnut_veneer', 'walnut_veneer_diff_1k.jpg'), 'carpet': os.path.join(TEX2, 'dirty_carpet', 'dirty_carpet_diff_1k.jpg')}
N, SS, ORM_N = 1024, 2, 256
METAL = 0.40

REG = {
    'maple_door': (0, 0, 256, 256),     # 楓木門片（同 US2）
    'maple': (256, 0, 512, 256),        # 楓木（側板、框）
    'curtain': (512, 0, 768, 256),      # 浴簾：米白＋很淡的直條紋（s 沿浴簾寬、t 往上）
    'mirror': (768, 0, 1024, 256),      # 鏡面：淺灰藍漸層＋一道斜的柔光；四邊一圈鋁框
    'towel': (0, 256, 256, 384),        # 毛巾：淺藍、兩端一條織邊（t 沿掛的方向）
    'bathmat': (256, 256, 512, 512),    # 腳踏墊：米色短絨（dirty_carpet 的明暗）
    'slat': (512, 256, 768, 384),       # 椅子的深色木條：木紋
}
SW = {
    'enamel': ((244, 244, 240), 0.22, 0.0), 'enamel_in': ((236, 236, 232), 0.18, 0.0), 'porcelain': ((246, 246, 243), 0.16, 0.0),
    'chrome': ((202, 204, 208), 0.14, METAL), 'alu': ((176, 178, 180), 0.32, METAL), 'drain': ((90, 90, 94), 0.3, METAL),
    'counter': ((240, 238, 232), 0.2, 0.0), 'toe': ((44, 36, 30), 0.7, 0.0), 'frame_metal': ((52, 54, 56), 0.45, 0.3),
    'ring': ((210, 212, 216), 0.2, METAL), 'seat': ((248, 248, 245), 0.25, 0.0), 'towel_sw': ((150, 188, 214), 0.95, 0.0),
}
SW_CELL, SW_Y0 = 32, 896
for i, k in enumerate(SW):
    REG['sw_' + k] = ((i % 32) * SW_CELL, SW_Y0 + (i // 32) * SW_CELL, (i % 32) * SW_CELL + SW_CELL, SW_Y0 + (i // 32) * SW_CELL + SW_CELL)
ORM_REG = {'maple_door': (0.5, 0.0), 'maple': (0.5, 0.0), 'curtain': (0.85, 0.0), 'mirror': (0.06, 0.0), 'towel': (0.95, 0.0), 'bathmat': (0.95, 0.0), 'slat': (0.6, 0.0)}


def sz(name):
    x0, y0, x1, y1 = REG[name]; return (x1 - x0) * SS, (y1 - y0) * SS


def lum(path, w, h, crop=None, tile=(1, 1)):
    im = Image.open(path).convert('L')
    if crop: W0, H0 = im.size; im = im.crop((int(crop[0] * W0), int(crop[1] * H0), int(crop[2] * W0), int(crop[3] * H0)))
    tw, th = max(1, w // tile[0]), max(1, h // tile[1]); t = np.asarray(im.resize((tw, th), Image.LANCZOS), np.float32)
    a = np.tile(t, (tile[1] + 1, tile[0] + 1))[:h, :w]
    return (a - a.mean()) / max(1.0, a.std())


def tint(z, base, k):
    a = np.array(base, np.float32)[None, None, :] * (1.0 + k * np.clip(z, -2.5, 2.5))[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def paint(P):
    # 楓木（和 US2 同一個做法：walnut_veneer 的木紋柔化、改成淺的蜂蜜色）
    w, h = sz('maple'); zw = np.asarray(Image.fromarray(np.clip((lum(SRC['walnut'], w, h) + 3) * 40, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2 * SS)), np.float32) / 40 - 3
    P.paste(tint(zw, (198, 150, 98), 0.06), (REG['maple'][0] * SS, REG['maple'][1] * SS))
    img = tint(zw, (198, 150, 98), 0.06); d = ImageDraw.Draw(img); i = 0.12
    d.rectangle([w * i, h * i, w * (1 - i), h * (1 - i)], outline=(132, 94, 58), width=3 * SS)
    d.line([(w * i + 3 * SS, h * (1 - i) - 2 * SS), (w * (1 - i) - 2 * SS, h * (1 - i) - 2 * SS)], fill=(222, 182, 130), width=SS)
    d.line([(w * (1 - i) - 2 * SS, h * i + 3 * SS), (w * (1 - i) - 2 * SS, h * (1 - i) - 2 * SS)], fill=(222, 182, 130), width=SS)
    P.paste(img, (REG['maple_door'][0] * SS, REG['maple_door'][1] * SS))
    # 浴簾：米白＋很淡的直條紋
    w, h = sz('curtain'); img = Image.new('RGB', (w, h), (236, 232, 222)); d = ImageDraw.Draw(img)
    for k in range(0, w, 16 * SS): d.rectangle([k, 0, k + 5 * SS, h], fill=(226, 220, 206))
    d.rectangle([0, 0, w, h * 0.04], fill=(222, 216, 202))   # 上緣的折邊
    P.paste(img.filter(ImageFilter.GaussianBlur(0.8 * SS)), (REG['curtain'][0] * SS, REG['curtain'][1] * SS))
    # 鏡面：淺灰藍漸層＋斜的柔光（不反射）；四邊一圈很窄的鋁框
    w, h = sz('mirror'); yy, xx = np.mgrid[0:h, 0:w] / np.array([h, w], np.float32)[:, None, None]
    a = np.zeros((h, w, 3), np.float32); top, bot = np.array((206, 216, 222), np.float32), np.array((150, 164, 174), np.float32)
    a[:] = top * (1 - yy[..., None]) + bot * yy[..., None]
    band = np.exp(-((xx + yy * 0.6 - 0.55) / 0.08) ** 2)[..., None]; a = a + band * 26
    bw = int(w * 0.035); a[:bw] = 176; a[-bw:] = 176; a[:, :bw] = 176; a[:, -bw:] = 176
    P.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), (REG['mirror'][0] * SS, REG['mirror'][1] * SS))
    # 毛巾：淺藍、兩端一條織邊
    w, h = sz('towel'); img = Image.new('RGB', (w, h), SW['towel_sw'][0]); d = ImageDraw.Draw(img)
    for t0 in (0.08, 0.86): d.rectangle([0, h * t0, w, h * (t0 + 0.06)], fill=(126, 166, 196))
    zc = lum(SRC['carpet'], w, h, tile=(8, 4)); a = np.asarray(img, np.float32) * (1 + 0.04 * np.clip(zc, -2.5, 2.5))[..., None]
    P.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), (REG['towel'][0] * SS, REG['towel'][1] * SS))
    # 腳踏墊：米色短絨
    w, h = sz('bathmat'); zc = lum(SRC['carpet'], w, h, tile=(4, 4)); P.paste(tint(zc, (208, 194, 170), 0.08), (REG['bathmat'][0] * SS, REG['bathmat'][1] * SS))
    # 椅子的木條：深色木紋
    w, h = sz('slat'); zs = lum(SRC['walnut'], w, h)
    P.paste(tint(zs, (82, 58, 42), 0.18), (REG['slat'][0] * SS, REG['slat'][1] * SS))


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


def Rz(a): c, s = math.cos(a), math.sin(a); M = np.eye(4); M[0, 0], M[0, 1], M[1, 0], M[1, 1] = c, -s, s, c; return M
def Sc(sx, sy, sz_): return np.diag([sx, sy, sz_, 1.0])


def box(pm, x0, x1, y0, y1, z0, z1, uv, M=None, inward=False, skip=()):
    sub = PM()
    F = {'t': ([(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)], (0, 1, 0)), 'b': ([(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], (0, -1, 0)),
         'f': ([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], (0, 0, 1)), 'k': ([(x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0)], (0, 0, -1)),
         'r': ([(x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1)], (1, 0, 0)), 'l': ([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], (-1, 0, 0))}
    for key, (pts, n) in F.items():
        if key in skip: continue
        fn = uv.get(key) or uv.get('*'); nn = tuple(-v for v in n) if inward else n
        sub.poly(pts, [fn(0, 0), fn(1, 0), fn(1, 1), fn(0, 1)], nn)
    return pm.add(sub, M)


def knob(pm, x, y, z, fn=None, r=0.013):
    fn = fn or S('chrome')
    lathe(pm, [(0.006, 0.0, 0.006, 0.014, fn, 'out'), (0.006, 0.014, r, 0.02, fn, 'out'), (r, 0.02, r, 0.026, fn, 'out'), (r, 0.026, 0.0, 0.028, fn, 'up')], 10, M=T(x, y, z) @ Rx(math.pi / 2))


def rr(hx, hz, rc, nper=4):
    """圓角矩形的外框（x-z 平面，逆時針看下去），每個角 nper+1 點"""
    rc = max(0.004, min(rc, hx * 0.98, hz * 0.98)); pts = []
    for (cx, cz, a0) in ((hx - rc, hz - rc, 0.0), (-(hx - rc), hz - rc, 90.0), (-(hx - rc), -(hz - rc), 180.0), (hx - rc, -(hz - rc), 270.0)):
        for k in range(nper + 1):
            a = math.radians(a0 + 90.0 * k / nper); pts.append((cx + rc * math.cos(a), cz + rc * math.sin(a)))
    return pts


def basin(pm, cx, cz, hx, hz, rc, y1, depth, rb, fn, draft=0.02, nper=4, outer=None, fn_deck=None):
    """凹下去的槽（浴缸、臉盆）：圓角矩形一圈一圈往下、底部圓角收到平底；法線朝裡。
    outer＝(ohx, ohz, orc)：槽口外面一圈平的檯面（和槽口一一對應的外框），fn_deck 貼它"""
    rings = [(0.0, y1), (draft, y1 - depth + rb)] + [(draft + rb * (1 - math.cos(math.radians(a))), y1 - depth + rb - rb * math.sin(math.radians(a))) for a in (30, 60, 90)]
    R_ = [[(cx + x, y, cz + z) for x, z in rr(hx - ins, hz - ins, rc - ins, nper)] for ins, y in rings]
    n = len(R_[0])
    for i in range(len(R_) - 1):
        A, Bv = R_[i], R_[i + 1]
        for k in range(n):
            k1 = (k + 1) % n; mid = (np.array(A[k]) + np.array(A[k1]) + np.array(Bv[k]) + np.array(Bv[k1])) / 4
            pm.poly([A[k], A[k1], Bv[k1], Bv[k]], [fn(k / n, 1 - i / 4)] * 4, (cx - mid[0], 0.25, cz - mid[2]))
    bot = R_[-1]; c = (cx, bot[0][1], cz)
    for k in range(n): pm.poly([c, bot[k], bot[(k + 1) % n]], [fn(0.5, 0.5)] * 3, (0, 1, 0))
    if outer:
        O = [(cx + x, y1, cz + z) for x, z in rr(outer[0], outer[1], outer[2], nper)]
        for k in range(n):
            k1 = (k + 1) % n; pm.poly([O[k], O[k1], R_[0][k1], R_[0][k]], [(fn_deck or fn)(0.5, 0.5)] * 4, (0, 1, 0))
    return pm


MD, MP = R('maple_door'), R('maple')


# ---------------- 1. 浴缸 ----------------
def tub():
    pm = PM(); hx, hz, H = 0.75, 0.375, 0.5; en = S('enamel')
    basin(pm, 0.0, 0.0, 0.66, 0.29, 0.13, H, 0.42, 0.1, S('enamel_in'), draft=0.03, nper=4, outer=(hx, hz, 0.02), fn_deck=en)   # 內面＋缸緣（缸緣外框＝整個浴缸的範圍，貼牆不露縫）
    rbox(pm, -hx, hx, 0.0, H - 0.004, 0.33, hz, {'*': en}, r=0.012, seg=2)   # 前面的裙板
    for (a, b, c, d) in ((-hx, -hx + 0.03, -hz, 0.33), (hx - 0.03, hx, -hz, 0.33), (-hx + 0.03, hx - 0.03, -hz, -hz + 0.03)):   # 兩端＋背面也封起來（擺好後東端朝浴室，從旁邊看不會看穿）
        rbox(pm, a, b, 0.0, H - 0.004, c, d, {'*': en}, r=0.008, seg=1)
    lathe(pm, [(0.0, 0.08, 0.03, 0.08, S('drain'), 'up')], 12, M=T(0.5, 0.001, 0.0))   # 排水孔（+x 那一端）
    # +x 那一端的牆（本地 x=0.75）：水龍頭、單把手、淋浴臂＋蓮蓬頭
    W = 0.75; ch = S('chrome'); Mw = lambda y: T(W, y, 0.0) @ Rz(math.pi / 2)   # 圓盤貼牆、朝 −x
    lathe(pm, [(0.0, 0.0, 0.04, 0.0, ch, 'down'), (0.04, 0.0, 0.035, 0.012, ch, 'out'), (0.035, 0.012, 0.0, 0.014, ch, 'up')], 12, M=Mw(0.62))
    sweep(pm, [(W - 0.01, 0.62, 0.0), (W - 0.12, 0.62, 0.0), (W - 0.15, 0.6, 0.0)], 0.016, 8, ch)   # 浴缸的出水口
    lathe(pm, [(0.0, 0.0, 0.07, 0.0, ch, 'down'), (0.07, 0.0, 0.065, 0.01, ch, 'out'), (0.065, 0.01, 0.0, 0.012, ch, 'up')], 14, M=Mw(0.9))   # 把手的圓盤
    sweep(pm, [(W - 0.01, 0.9, 0.0), (W - 0.05, 0.9, 0.0), (W - 0.07, 0.9, 0.08)], 0.009, 6, ch)   # 單把手
    lathe(pm, [(0.0, 0.0, 0.025, 0.0, ch, 'down'), (0.025, 0.0, 0.0, 0.01, ch, 'up')], 10, M=Mw(1.86))
    sweep(pm, [(W - 0.005, 1.86, 0.0), (W - 0.12, 1.89, 0.0), (W - 0.16, 1.87, 0.0)], 0.011, 8, ch)   # 淋浴臂
    lathe(pm, [(0.012, 0.0, 0.055, -0.05, ch, 'out'), (0.055, -0.05, 0.0, -0.052, S('drain'), 'down')], 14, M=T(W - 0.17, 1.875, 0.0) @ Rz(-0.35))   # 蓮蓬頭（朝下、往 −x 斜）
    # 伸縮桿（前緣上方 1.95）＋浴簾（拉開一半，收在 −x）
    zr, yr = 0.36, 1.95
    sweep(pm, [(-hx, yr, zr), (hx, yr, zr)], 0.012, 8, ch)
    for x in (-hx, hx): lathe(pm, [(0.0, 0.0, 0.03, 0.0, ch, 'down'), (0.03, 0.0, 0.0, 0.012, ch, 'up')], 10, M=T(x, yr, zr) @ Rz(-math.pi / 2 if x < 0 else math.pi / 2))
    NX = 48; xs = np.linspace(-hx + 0.02, -0.05, NX + 1); ys = [1.92, 1.5, 0.9, 0.32]; fn = R('curtain')
    def P(i, j):   # 收起來的褶子：大小不一（一個褶約 6 格、深淺跟著慢慢變），往下稍微張開
        a = (0.014 + 0.008 * (j / 3)) * (1.0 + 0.45 * math.sin(2 * math.pi * i / 17 + 0.6))
        return (xs[i], ys[j], zr - 0.03 + a * math.sin(2 * math.pi * i / 6 + 0.5 * math.sin(2 * math.pi * i / 23)))
    for i in range(len(xs) - 1):
        for j in range(len(ys) - 1):
            q = [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)]; uv = [fn(i / NX, 1 - j / 3), fn((i + 1) / NX, 1 - j / 3), fn((i + 1) / NX, 1 - (j + 1) / 3), fn(i / NX, 1 - (j + 1) / 3)]
            pm.poly(q, uv, (0, 0, 1)); pm.poly(q[::-1], uv[::-1], (0, 0, -1))
    for k in range(10):   # 掛環
        x = xs[0] + k * (xs[-1] - xs[0]) / 9
        sweep(pm, [(x, yr + 0.02 * math.sin(a) - 0.0, zr + 0.02 * math.cos(a)) for a in np.linspace(0, 2 * math.pi, 9)[:-1]], 0.0028, 4, S('ring'), caps=False, closed=True)
    return pm


# ---------------- 2. 馬桶 ----------------
def toilet():
    pm = PM(); po = S('porcelain'); M = T(0, 0, 0.08) @ Sc(1.0, 1.0, 1.32)
    lathe(pm, [(0.0, 0.0, 0.11, 0.0, po, 'down'), (0.11, 0.0, 0.115, 0.04, po, 'out'), (0.115, 0.04, 0.1, 0.13, po, 'out'), (0.1, 0.13, 0.13, 0.22, po, 'out'),
               (0.13, 0.22, 0.17, 0.32, po, 'out'), (0.17, 0.32, 0.18, 0.38, po, 'out'), (0.18, 0.38, 0.165, 0.395, po, 'out'), (0.165, 0.395, 0.0, 0.395, po, 'up')], 22, M=M)   # 底座＋碗
    lathe(pm, [(0.185, 0.395, 0.188, 0.41, S('seat'), 'out'), (0.188, 0.41, 0.0, 0.412, S('seat'), 'up')], 22, M=M)   # 馬桶座
    lathe(pm, [(0.18, 0.412, 0.182, 0.43, S('seat'), 'out'), (0.182, 0.43, 0.15, 0.442, S('seat'), 'out'), (0.15, 0.442, 0.0, 0.445, S('seat'), 'up')], 22, M=M)   # 蓋子（放下來）
    rbox(pm, -0.08, 0.08, 0.3, 0.42, -0.24, -0.1, {'*': po}, r=0.02, seg=2)   # 碗和水箱之間
    rbox(pm, -0.2, 0.2, 0.4, 0.76, -0.33, -0.16, {'*': po}, r=0.022, seg=2)    # 水箱
    rbox(pm, -0.21, 0.21, 0.76, 0.785, -0.335, -0.15, {'*': po}, r=0.01, seg=2)   # 水箱蓋
    box(pm, -0.19, -0.17, 0.67, 0.69, -0.16, -0.14, {'*': S('chrome')}); rbox(pm, -0.19, -0.1, 0.672, 0.688, -0.15, -0.135, {'*': S('chrome')}, r=0.005, seg=1)   # 沖水把手
    return pm


# ---------------- 3. 洗手台櫃＋鏡子 ----------------
def vanity():
    pm = PM(); hx, z0, z1, top = 0.6, -0.275, 0.275, 0.86; t_ = 0.025
    box(pm, -hx + 0.01, hx - 0.01, 0.0, 0.1, z0 + 0.01, z1 - 0.07, {'*': S('toe')})
    # 櫃體：臉盆底下降到 0.70（不然櫃頂會把槽封住），其他照檯面下緣的高度
    box(pm, -hx, hx, 0.1, 0.70, z0, z1 - 0.02, {'*': MP})
    for (a, b, c, d) in ((-hx, -0.52, z0, z1 - 0.02), (-0.08, hx, z0, z1 - 0.02), (-0.52, -0.08, z0, -0.15), (-0.52, -0.08, 0.19, z1 - 0.02)):
        box(pm, a, b, 0.70, top - t_, c, d, {'*': MP})
    for (a, b) in ((-hx + 0.01, -0.305), (-0.295, -0.01)):   # 兩扇門
        rbox(pm, a, b, 0.12, top - t_ - 0.02, z1 - 0.02, z1, {'f': MD, '*': MP}, r=0.004, seg=1); knob(pm, b - 0.04 if a < -0.4 else a + 0.04, top - t_ - 0.08, z1)
    ys = [top - t_ - 0.02, 0.62, 0.38, 0.12]
    for k in range(3):   # 右邊三個抽屜
        rbox(pm, 0.01, hx - 0.01, ys[k + 1] + 0.005, ys[k] - 0.005, z1 - 0.02, z1, {'f': MD, '*': MP}, r=0.004, seg=1); knob(pm, (0.01 + hx - 0.01) / 2, (ys[k] + ys[k + 1]) / 2, z1)
    # 檯面：臉盆在 x −0.3；臉盆外面一圈「平台」和槽口一一對應，其他部分是方塊
    bx, bz, bhx, bhz = -0.3, 0.02, 0.2, 0.15; dx, dz = 0.25, 0.2   # 平台半寬
    basin(pm, bx, bz, bhx, bhz, 0.08, top, 0.14, 0.06, S('porcelain'), draft=0.01, nper=4, outer=(dx, dz, 0.004), fn_deck=S('counter'))
    for (a, b, c, d) in ((-hx, bx - dx, z0, z1 + 0.01), (bx + dx, hx, z0, z1 + 0.01), (bx - dx, bx + dx, z0, bz - dz), (bx - dx, bx + dx, bz + dz, z1 + 0.01)):
        box(pm, a, b, top - t_, top, c, d, {'*': S('counter')})
    rbox(pm, -hx, hx, top - t_ - 0.004, top - t_, z1 - 0.04, z1 + 0.012, {'*': S('counter')}, r=0.002, seg=1)   # 檯面前緣（前面多出一點；只有前緣，不蓋住臉盆）
    rbox(pm, -hx, hx, top, top + 0.1, z0, z0 + 0.018, {'*': S('counter')}, r=0.004, seg=1)   # 擋水
    lathe(pm, [(0.0, 0.0, 0.025, 0.0, S('drain'), 'up')], 10, M=T(bx, top - 0.139, bz))
    ch = S('chrome')   # 水龍頭（後面、正中）＋兩個把手
    lathe(pm, [(0.0, top, 0.025, top, ch, 'down'), (0.025, top, 0.02, top + 0.06, ch, 'out'), (0.02, top + 0.06, 0.0, top + 0.065, ch, 'up')], 10, M=T(bx, 0, z0 + 0.06))
    sweep(pm, [(bx, top + 0.05, z0 + 0.06), (bx, top + 0.09, z0 + 0.08), (bx, top + 0.085, z0 + 0.17), (bx, top + 0.06, z0 + 0.19)], 0.01, 8, ch)
    for sx in (-1, 1):
        lathe(pm, [(0.0, top, 0.018, top, ch, 'down'), (0.018, top, 0.012, top + 0.03, ch, 'out'), (0.012, top + 0.03, 0.0, top + 0.035, ch, 'up')], 8, M=T(bx + sx * 0.1, 0, z0 + 0.06))
        box(pm, bx + sx * 0.1 - 0.004, bx + sx * 0.1 + 0.004, top + 0.03, top + 0.036, z0 + 0.06, z0 + 0.11, {'*': ch})
    # 藥櫃式的鏡子：鋁框、鏡面朝 +z
    rbox(pm, -0.375, 0.375, 1.05, 1.7, z0, z0 + 0.07, {'f': R('mirror'), '*': S('alu')}, r=0.006, seg=1)
    return pm


# ---------------- 4. 毛巾桿＋毛巾 ----------------
def towelbar():
    """牆在 z=0（背面 −z）；桿離地 1.2、離牆 7 cm"""
    pm = PM(); ch = S('chrome'); yb, zb = 1.2, 0.07
    for x in (-0.3, 0.3):
        lathe(pm, [(0.0, 0.0, 0.03, 0.0, ch, 'down'), (0.03, 0.0, 0.026, 0.01, ch, 'out'), (0.026, 0.01, 0.0, 0.012, ch, 'up')], 10, M=T(x, yb, 0.0) @ Rx(math.pi / 2))
        sweep(pm, [(x, yb, 0.008), (x, yb, zb)], 0.008, 6, ch)
    sweep(pm, [(-0.31, yb, zb), (0.31, yb, zb)], 0.009, 8, ch)
    # 毛巾：對折掛在桿上（後片短、前片長，下緣微微張開）
    path = [(0.055, 0.86), (0.058, 1.05), (0.06, 1.17), (0.07, 1.214), (0.082, 1.17), (0.088, 1.05), (0.095, 0.88), (0.1, 0.74)]
    xs = np.linspace(-0.23, 0.23, 7); fn = R('towel'); Lp = len(path) - 1
    for i in range(len(xs) - 1):
        for j in range(Lp):
            q = [(xs[i], path[j][1], path[j][0]), (xs[i + 1], path[j][1], path[j][0]), (xs[i + 1], path[j + 1][1], path[j + 1][0]), (xs[i], path[j + 1][1], path[j + 1][0])]
            q = [(x, y, z + 0.004 * math.sin(math.pi * (x + 0.23) / 0.46 * 3)) for x, y, z in q]   # 毛巾的一點起伏
            uv = [fn(i / 6, j / Lp), fn((i + 1) / 6, j / Lp), fn((i + 1) / 6, (j + 1) / Lp), fn(i / 6, (j + 1) / Lp)]
            mid = np.mean(np.array(q), axis=0); out = (0, 0.3, 1.0) if j >= 3 else (0, 0.3, -1.0)
            pm.poly(q, uv, out); pm.poly(q[::-1], uv[::-1], tuple(-v for v in out))
    return pm


# ---------------- 5. 腳踏墊 ----------------
def bathmat():
    pm = PM(); O = rr(0.25, 0.4, 0.07, 4); th = 0.014; fn = 'bathmat'
    c = (0.0, th, 0.0); n = len(O)
    for k in range(n):
        a, b = O[k], O[(k + 1) % n]
        pm.poly([c, (a[0], th, a[1]), (b[0], th, b[1])], [ruv(fn, 0.5, 0.5), ruv(fn, (a[0] + 0.25) / 0.5, (a[1] + 0.4) / 0.8), ruv(fn, (b[0] + 0.25) / 0.5, (b[1] + 0.4) / 0.8)], (0, 1, 0))
        pm.poly([(a[0], 0.0, a[1]), (b[0], 0.0, b[1]), (b[0], th, b[1]), (a[0], th, a[1])], [ruv(fn, 0.02, 0.5)] * 4, (a[0] + b[0], 0, a[1] + b[1]))
    return pm


# ---------------- 6. 陽台的折疊椅、小圓桌 ----------------
def chair():
    pm = PM(); fm = S('frame_metal'); sl = R('slat'); hx = 0.21
    for sx in (-1, 1):
        x = sx * hx
        sweep(pm, [(x, 0.0, -0.2), (x, 0.45, -0.21), (x, 0.88, -0.25)], 0.012, 6, fm)       # 後腳＋靠背的柱子
        sweep(pm, [(x, 0.0, 0.23), (x, 0.45, 0.19)], 0.012, 6, fm)                          # 前腳
        sweep(pm, [(x, 0.44, 0.2), (x, 0.44, -0.21)], 0.01, 6, fm)                          # 座面的邊框
    for (y, z0_, z1_) in ((0.15, 0.215, 0.215), (0.15, -0.2, -0.2)): sweep(pm, [(-hx, y, z0_), (hx, y, z1_)], 0.008, 6, fm)   # 前後的橫桿
    sweep(pm, [(-hx, 0.86, -0.248), (hx, 0.86, -0.248)], 0.01, 6, fm)
    for k in range(5):   # 座面五條木條
        z = 0.17 - k * 0.088; rbox(pm, -hx + 0.01, hx - 0.01, 0.45, 0.47, z - 0.034, z + 0.034, {'t': sl, '*': sl}, r=0.004, seg=1)
    for k, y in enumerate((0.6, 0.69, 0.78)):   # 靠背三條木條（跟著柱子往後斜）
        z = -0.21 - (y - 0.45) / 0.43 * 0.04 - 0.012; rbox(pm, -hx + 0.012, hx - 0.012, y - 0.03, y + 0.03, z - 0.008, z + 0.008, {'f': sl, '*': sl}, r=0.003, seg=1, M=T(0, 0, 0) @ np.eye(4))
    return pm


def table():
    pm = PM(); fm = S('frame_metal')
    lathe(pm, [(0.0, 0.68, 0.3, 0.68, fm, 'down'), (0.3, 0.68, 0.305, 0.69, fm, 'out'), (0.305, 0.69, 0.3, 0.7, fm, 'out'), (0.3, 0.7, 0.0, 0.7, fm, 'up')], 28)
    for k in range(3):
        a = 2 * math.pi * k / 3 + 0.3; c, s = math.cos(a), math.sin(a)
        sweep(pm, [(0.12 * c, 0.68, 0.12 * s), (0.2 * c, 0.4, 0.2 * s), (0.26 * c, 0.0, 0.26 * s)], 0.011, 6, fm)
    sweep(pm, [(0.205 * math.cos(a), 0.3, 0.205 * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 13)[:-1]], 0.007, 5, fm, caps=False, closed=True)   # 下面的一圈
    return pm


ITEMS = {'US_TUB': tub, 'US_TOILET': toilet, 'US_VANITY': vanity, 'US_TOWELBAR': towelbar, 'US_BATHMAT': bathmat, 'US_BALCONY_CHAIR': chair, 'US_BALCONY_TABLE': table}
# GLB 裡的位置：排成一間浴室給人看（遊戲裡照 layout）
SPREAD = {'US_TUB': (-1.2, 0.0, 0.0, 0), 'US_TOILET': (0.45, 0.0, -0.04, 0), 'US_VANITY': (1.55, 0.0, -0.1, 0), 'US_TOWELBAR': (0.45, 0.0, -0.375, 0),
          'US_BATHMAT': (-1.05, 0.0, 0.85, 90), 'US_BALCONY_CHAIR': (0.8, 0.0, 1.5, -20), 'US_BALCONY_TABLE': (1.6, 0.0, 1.55, 0)}
BUDGET = {'US_TUB': 2600, 'US_TOILET': 1500, 'US_VANITY': 1800, 'US_TOWELBAR': 600, 'US_BATHMAT': 200, 'US_BALCONY_CHAIR': 1000, 'US_BALCONY_TABLE': 700}
TOTAL_BUDGET = 10000
SMOOTH = {'US_TUB': 0.9, 'US_TOILET': 1.0, 'US_VANITY': 0.9, 'US_TOWELBAR': 1.0, 'US_BALCONY_TABLE': 0.9}


def build():
    make_textures()
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=1024)
    root = B.group('us_bath_props', props={'kind': 'us_bath_props'})
    mat = bpy.data.materials.new('us_bath'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS); tx.image.pack(); nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
    to = nt.nodes.new('ShaderNodeTexImage'); to.image = bpy.data.images.load(ATLAS_ORM); to.image.colorspace_settings.name = 'Non-Color'; to.image.pack()
    sp = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(to.outputs['Color'], sp.inputs['Color'])
    nt.links.new(sp.outputs['Green'], bsdf.inputs['Roughness']); nt.links.new(sp.outputs['Blue'], bsdf.inputs['Metallic'])
    mods = {}; over = []
    for name, fn in ITEMS.items():
        pm = fn()
        ob = to_blender(pm, name, (mat,), root, SMOOTH.get(name, 0.6)); x, y, z, a = SPREAD[name]; ob.location = g2b(x, y, z); ob.rotation_euler = (0, 0, math.radians(a))
        mn, mx = pm.bbox(); tris = sum(len(p.vertices) - 2 for p in ob.data.polygons); mods[name] = {'tris': tris, 'min': mn, 'max': mx}
        if tris > BUDGET[name]: over.append((name, tris))
    total = sum(m['tris'] for m in mods.values())
    print('TRIS', json.dumps({k: v['tris'] for k, v in mods.items()}), total, flush=True)
    assert not over, over
    assert total <= TOTAL_BUDGET, total
    info = L.export(out, gpu_instances=False)
    info['materials'] = 1
    info['modules'] = mods
    info['tris_total'] = total
    info['atlas'] = [os.path.relpath(p, L.ROOT) for p in (ATLAS, ATLAS_ORM)]
    info['origins'] = {'*': '地面上的底部中央、正面（人站的那一側）朝 +z、靠牆的一側在 −z；GLB 裡的位置只是排開給人看（SPREAD）',
                       'US_TUB': '本地 1.5（x）×0.75（z），缸緣高 0.5；水龍頭、蓮蓬頭在 +x 那一端（牆在 x=0.75）；浴簾收在 −x；layout 貼南牆時 ry=π（本地 +x＝房間西端）',
                       'US_TOILET': '水箱在 −z（靠牆，背面 z≈−0.335）；layout ry=π/2', 'US_VANITY': '本地寬 1.2（x）、深 0.55（z −0.275～0.275），檯面高 0.86；臉盆在 x −0.3；鏡子底 1.05、頂 1.7；layout 貼東牆、面向西，ry=−π/2',
                       'US_TOWELBAR': '原點在桿正下方的地面，牆在 z=0；桿離地 1.2', 'US_BATHMAT': '0.5（x）×0.8（z），厚 1.4 cm', 'US_BALCONY_CHAIR': '座高 0.45、靠背頂 0.88；layout 擺兩張',
                       'US_BALCONY_TABLE': '直徑 0.6、高 0.7（選做）'}
    info['note'] = '一個材質：us_bath（底色 1024＋ORM 256，metal 最高 0.40；楓木＝Poly Haven walnut_veneer 改色、腳踏墊和毛巾的短絨＝dirty_carpet 的明暗，都是 CC0）'
    L.write_json(out[:-4] + '.json', info)
    return info


if __name__ == '__main__':
    build()
