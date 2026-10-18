"""2D 背景：新體育館 3F 主球場的典禮（ART-GYM-BG1；8/31 開學典禮，之後大四畢業典禮 CG-9 換橫幅共用）。LAWWW2-B 2026-10-16。
從遊戲的 3F 主球場模型（assets/models/env/second_ai/gym_arena.glb，tools/blender/env_second/gym_arena.py）算圖：
- 打開舞台（SET_STAGE）＋典禮布置（SET_CEREMONY），藏起演講、演唱會布置。
- 背板的米色長布換成寫「開學典禮」的版本（--text；不寫校名、不放校徽，D77）。
- 場地的折疊椅、下層看台坐滿新生，上層看台（4、5F）坐一部分家長：人群是坐姿的遠景人物（不畫五官、看不出是誰），
  幾種體型、髮型（短髮、長髮、馬尾、鮑伯、棒球帽）、姿勢（坐正、低頭看手機、轉頭、手放腿上）、上衣（短袖、長袖）、下身（長褲、短褲、裙子）；
  顏色每個人隨機（Cycles 的 Object Info → Random）。座位位置照 gym_arena.py 的算法（和 GLB 裡的椅子同一組座標）。
- 白天室內燈光：屋頂的燈（面光源）＋舞台前的暖色投射燈。
用法：
  /opt/blenv/bin/python tools/blender/env_second/bg_gym_ceremony.py -- <輸出.png> [--res 1920x1080] [--samples 96] [--text 開學典禮]
       [--eye x,y,z --look x,y,z --lens mm] [--dof 焦距m] [--fstop 4] [--fill 0.92] [--exposure 0]
座標＝gym_arena 區域座標（x 東、y 上、z 南；舞台在北邊 z −21.6～−15.6）。"""
import json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import bpy, bmesh, Vector, Matrix, g2b   # noqa: E402
import numpy as np   # noqa: E402
from PIL import Image, ImageDraw, ImageFont, ImageFilter   # noqa: E402

A_ = sys.argv[sys.argv.index('--') + 1:]
OUT = os.path.abspath(A_[0])
def opt(name, default):
    return A_[A_.index(name) + 1] if name in A_ else default
RW, RH = map(int, opt('--res', '1920x1080').split('x')); SAMPLES = int(opt('--samples', '96'))
TEXT = opt('--text', '開學典禮'); FILL = float(opt('--fill', '0.93'))
TMP = os.path.join(os.path.dirname(OUT), 'bg_gym_tex'); os.makedirs(TMP, exist_ok=True)
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./src/data/gym_layout.js')))"], cwd=L.ROOT))
AR = LAY['arena']; SR = AR['standRows']; UP = AR['upper']
rng = random.Random(831)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(L.ROOT, AR['glb']))
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = float(opt('--exposure', '0.0'))
try: sc.view_settings.look = 'AgX - Base Contrast'
except Exception: pass
sc.cycles.max_bounces = 5; sc.cycles.transparent_max_bounces = 24

# ======================== 布置：留舞台＋典禮 ========================
def under(ob, key):
    while ob is not None:
        if ob.name.startswith(key): return True
        ob = ob.parent
    return False
for ob in list(bpy.data.objects):
    if under(ob, 'SET_LECTURE') or under(ob, 'SET_CONCERT'): ob.hide_render = True; ob.hide_viewport = True


def banner_png(path, text):
    """背板長布 16×1.25 m（貼圖照同一個比例）：米色底、金色雙框、兩側月桂葉的線條，中間深藍大字（不寫校名、不放校徽）"""
    W, H = 3200, 250; im = Image.new('RGB', (W, H), (238, 230, 210)); d = ImageDraw.Draw(im)
    for k, c in ((10, (176, 140, 60)), (22, (206, 176, 96))): d.rectangle([k, k, W - k, H - k], outline=c, width=5)
    f = ImageFont.truetype(FONT, 186); sp = 80
    ws = [d.textbbox((0, 0), ch, font=f) for ch in text]; tw = sum(b[2] - b[0] for b in ws) + sp * (len(text) - 1)
    x = (W - tw) / 2
    for ch, b in zip(text, ws):
        d.text((x - b[0], (H - 186) / 2 - 22), ch, font=f, fill=(28, 40, 74), stroke_width=4, stroke_fill=(28, 40, 74)); x += (b[2] - b[0]) + sp
    cx = W / 2
    for s in (-1, 1):                                                   # 文字兩側的月桂枝（線條）
        bx = cx + s * (tw / 2 + 120)
        d.line([(bx, H * 0.78), (bx + s * 300, H * 0.5)], fill=(176, 140, 60), width=5)
        for i in range(8):
            t = i / 7.0; px = bx + s * 300 * t; py = H * 0.78 - (H * 0.28) * t
            for u in (-1, 1): d.ellipse([px + s * 10 - 22, py + u * 18 - 9, px + s * 10 + 22, py + u * 18 + 9], outline=(176, 140, 60), width=4)
    im.save(path)


BAN = os.path.join(TMP, 'ceremony_banner.png'); banner_png(BAN, TEXT)
for m in bpy.data.materials:
    if 'banner' in m.name and m.use_nodes:
        for n in m.node_tree.nodes:
            if n.type == 'TEX_IMAGE': n.image = bpy.data.images.load(BAN)

# ======================== 人群 ========================
def mat_rand(name, cols, k, rough=0.75, sss=0.0, sheen=0.0, bump=None):
    """每個人不一樣的顏色：Object Info 的 Random × k 取小數 → 色表（等間隔、不內插）"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']
    bs.inputs['Roughness'].default_value = rough
    if sss:
        try: bs.inputs['Subsurface Weight'].default_value = sss; bs.inputs['Subsurface Radius'].default_value = (0.9, 0.4, 0.25)
        except Exception: pass
    if sheen:
        try: bs.inputs['Sheen Weight'].default_value = sheen
        except Exception: pass
    oi = N.new('ShaderNodeObjectInfo'); mu = N.new('ShaderNodeMath'); mu.operation = 'MULTIPLY'; mu.inputs[1].default_value = k
    fr = N.new('ShaderNodeMath'); fr.operation = 'FRACT'; rp = N.new('ShaderNodeValToRGB'); cr = rp.color_ramp; cr.interpolation = 'CONSTANT'
    nt.links.new(oi.outputs['Random'], mu.inputs[0]); nt.links.new(mu.outputs[0], fr.inputs[0]); nt.links.new(fr.outputs[0], rp.inputs['Fac'])
    while len(cr.elements) < len(cols): cr.elements.new(0.5)
    for i, c in enumerate(cols):
        e = cr.elements[i]; e.position = i / len(cols); h = c.lstrip('#'); e.color = tuple((int(h[j:j + 2], 16) / 255.0) ** 2.2 for j in (0, 2, 4)) + (1.0,)
    nt.links.new(rp.outputs['Color'], bs.inputs['Base Color'])
    if bump:                                                            # 布的皺褶（雜訊）、頭髮的髮絲（波紋）：只是凹凸，不改顏色
        kind, scale, strength = bump; tc = N.new('ShaderNodeTexCoord')
        if kind == 'hair': tx = N.new('ShaderNodeTexWave'); tx.bands_direction = 'X'; tx.inputs['Distortion'].default_value = 6.0; tx.inputs['Detail'].default_value = 3.0
        else: tx = N.new('ShaderNodeTexNoise'); tx.inputs['Detail'].default_value = 4.0
        tx.inputs['Scale'].default_value = scale; nt.links.new(tc.outputs['Object'], tx.inputs['Vector'])
        bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = strength; bp.inputs['Distance'].default_value = 0.004
        nt.links.new(tx.outputs['Fac'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], bs.inputs['Normal'])
    return m


SKIN = ['#e9c3a4', '#e2b896', '#dcae8c', '#d4a582', '#e6bc9c', '#c99877']
HAIR = ['#141110'] * 6 + ['#1f1712'] * 4 + ['#2c2018'] * 3 + ['#4a3426', '#5e4330', '#6b5a4c']
TOPS = ['#f3f1ec'] * 4 + ['#1d1f24'] * 3 + ['#8d9096', '#c7c9cc', '#26324d', '#3b4c6b', '#9cb3c9', '#d9cbb0', '#e8dccb',
        '#7a8a6a', '#b54a3c', '#e3b5b5', '#f0e2a8', '#5d6f86', '#a7c3b0', '#6b4a3a', '#c9d8e8', '#40523f']
BOTS = ['#2f3d57'] * 3 + ['#1c1d21'] * 3 + ['#4d6487', '#8a7f6c', '#c6bba5', '#5a5c60', '#e9e6df', '#6f5844', '#2a2d33']
SHOE = ['#f2f2ef'] * 4 + ['#1c1c1e'] * 3 + ['#8b8f96', '#c8b79c', '#3a4a6a']
ACC = ['#1d1f24', '#f3f1ec', '#26324d', '#b54a3c', '#7a8a6a', '#c8b79c']
MATS = [mat_rand('crowd_skin', SKIN, 3.71, rough=0.55, sss=0.08), mat_rand('crowd_hair', HAIR, 7.13, rough=0.55, sheen=0.4, bump=('hair', 150.0, 0.22)),
        mat_rand('crowd_top', TOPS, 1.0, rough=0.85, sheen=0.3, bump=('cloth', 9.0, 0.35)), mat_rand('crowd_bottom', BOTS, 5.29, rough=0.8, sheen=0.2, bump=('cloth', 11.0, 0.3)),
        mat_rand('crowd_shoe', SHOE, 11.3, rough=0.6), mat_rand('crowd_acc', ACC, 13.7, rough=0.6)]
SK, HR, TP, BT, SH, AC = range(6)


class P:
    """一個坐著的人（面向 +z；坐在 y 0.47 的椅面上，臀部中心 z −0.03）"""
    def __init__(self): self.bm = bmesh.new()

    def grid(self, mi, rows, close=True, keep=None, cap0=None, cap1=None):
        R = [[self.bm.verts.new(g2b(*p)) for p in row] for row in rows]; n = len(rows[0])
        for i, (a, b) in enumerate(zip(R, R[1:])):
            for j in range(n if close else n - 1):
                j2 = (j + 1) % n; f = [a[j], a[j2], b[j2], b[j]]
                if keep and not keep(j, i): continue
                try: self.bm.faces.new(f).material_index = mi
                except ValueError: pass
        for cap, row in ((cap0, R[0]), (cap1, R[-1])):
            if cap is None: continue
            c = self.bm.verts.new(g2b(*cap))
            for j in range(n):
                try: self.bm.faces.new([row[j], row[(j + 1) % n], c] if cap is cap1 else [row[(j + 1) % n], row[j], c]).material_index = mi
                except ValueError: pass

    def ell(self, mi, c, r, T=lambda p: p, seg=12, rings=8, keep=None):
        """橢球；keep(局部點)：只留中心點符合的面（剪頭髮）"""
        rows = []
        for i in range(1, rings):
            th = math.pi * i / rings
            rows.append([T((c[0] + r[0] * math.sin(th) * math.cos(2 * math.pi * j / seg), c[1] - r[1] * math.cos(th), c[2] + r[2] * math.sin(th) * math.sin(2 * math.pi * j / seg))) for j in range(seg)])
        if keep is None:
            self.grid(mi, rows, cap0=T((c[0], c[1] - r[1], c[2])), cap1=T((c[0], c[1] + r[1], c[2]))); return
        def kp(j, i):
            th = math.pi * (i + 1.5) / rings; ph = 2 * math.pi * (j + 0.5) / seg
            return keep((r[0] * math.sin(th) * math.cos(ph), -r[1] * math.cos(th), r[2] * math.sin(th) * math.sin(ph)))
        self.grid(mi, rows, keep=kp)

    def tube(self, mi, a, b, ra, rb, T=lambda p: p, seg=8):
        a, b = Vector(a), Vector(b); ax = (b - a).normalized(); u = ax.orthogonal().normalized(); v = ax.cross(u)
        rows = [[T(tuple(o + (u * math.cos(2 * math.pi * j / seg) + v * math.sin(2 * math.pi * j / seg)) * r)) for j in range(seg)] for o, r in ((a, ra), (b, rb))]
        self.grid(mi, rows, cap0=T(tuple(a - ax * ra * 0.6)), cap1=T(tuple(b + ax * rb * 0.6)))

    def loft(self, mi, rings, T=lambda p: p, seg=14, pw=2.6, cap0=True, cap1=True):
        """橢圓（超橢圓）截面放樣：rings＝[(y, 半寬, 半深, 中心 z), ...]"""
        def se(t, a, b):
            c, s = math.cos(t), math.sin(t)
            return a * math.copysign(abs(c) ** (2 / pw), c), b * math.copysign(abs(s) ** (2 / pw), s)
        rows = [[T((se(2 * math.pi * j / seg, hw, hd)[0], y, zc + se(2 * math.pi * j / seg, hw, hd)[1])) for j in range(seg)] for (y, hw, hd, zc) in rings]
        self.grid(mi, rows, cap0=T((0, rings[0][0], rings[0][3])) if cap0 else None, cap1=T((0, rings[-1][0], rings[-1][3])) if cap1 else None)

    def mesh(self, name, mats=None):
        bmesh.ops.remove_doubles(self.bm, verts=self.bm.verts, dist=1e-5)
        bmesh.ops.recalc_face_normals(self.bm, faces=self.bm.faces)
        me = bpy.data.meshes.new(name); self.bm.to_mesh(me); self.bm.free()
        for m in (mats or MATS): me.materials.append(m)
        for p in me.polygons: p.use_smooth = True
        return me


def rot(p, piv, ax, a):
    """繞 piv 轉：ax＝'x'（往前彎，正＝頭往 +z）或 'y'（轉頭）"""
    x, y, z = p[0] - piv[0], p[1] - piv[1], p[2] - piv[2]; c, s = math.cos(a), math.sin(a)
    if ax == 'x': y, z = y * c - z * s, z * c + y * s
    else: x, z = x * c + z * s, z * c - x * s
    return (x + piv[0], y + piv[1], z + piv[2])


def person(name, fem, hair, pose, legs, sleeve, lean, stand=False, mats=None):
    p = P(); sw = 0.163 if fem else 0.192; hs = 0.95 if fem else 1.0
    HIP = (0.0, 0.5, -0.05)
    TL = lambda q: rot(q, HIP, 'x', lean)                                # 上半身往前（正）／往後（負）
    # 上半身：臀 → 腰 → 胸 → 肩 → 脖子底
    p.loft(TP, [(0.49, sw * 0.86, 0.125, -0.05), (0.62, sw * 0.76, 0.108, -0.06), (0.80, sw * (0.86 if fem else 0.9), 0.118 if fem else 0.12, -0.07),
                (0.97, sw, 0.112, -0.085), (1.05, sw * 0.88, 0.095, -0.09), (1.10, 0.075, 0.06, -0.085)], T=TL)
    # 頭：脖子頂點（0, 1.15, −0.075）；低頭（手機）、轉頭
    NK = (0.0, 1.15, -0.075); pitch = {'phone': 0.42, 'turn': 0.05, 'down': 0.22}.get(pose, 0.0); yaw = {'turn': 0.55 * (1 if int(name[-1]) % 2 else -1)}.get(pose, 0.0)
    def TH(q):
        q = rot(q, NK, 'y', yaw); q = rot(q, NK, 'x', pitch); return TL(q)
    p.tube(SK, (0, 1.08, -0.08), (0, 1.19, -0.066), 0.043 * hs, 0.04 * hs, T=TL)
    HC = (0.0, 1.255, -0.06); hr = (0.079 * hs, 0.103 * hs, 0.094 * hs)
    p.ell(SK, HC, hr, T=TH, seg=14, rings=10)
    for s in (-1, 1): p.ell(SK, (s * 0.078 * hs, 1.245, -0.065), (0.012, 0.024, 0.016), T=TH, seg=6, rings=4)   # 耳朵
    H2 = (hr[0] + 0.013, hr[1] + 0.013, hr[2] + 0.014); HCh = (HC[0], HC[1] + 0.009, HC[2] - 0.008)
    if hair == 'cap':
        p.ell(AC, (HC[0], HC[1] + 0.02, HC[2] - 0.004), (hr[0] + 0.016, hr[1] * 0.85, hr[2] + 0.016), T=TH, seg=14, rings=8, keep=lambda q: q[1] > -0.005)
        p.ell(AC, (HC[0], HC[1] + 0.012, HC[2] + 0.1), (0.075, 0.008, 0.055), T=TH, seg=10, rings=3)   # 帽簷
        p.ell(HR, HCh, H2, T=TH, seg=14, rings=8, keep=lambda q: q[2] < -0.02 and q[1] > -0.08 and q[1] < 0.02)
    else:
        def k_short(q):
            if q[2] < -0.025: return q[1] > -0.075
            if q[2] < 0.045: return q[1] > (-0.01 if abs(q[0]) > 0.06 else 0.0)
            return q[1] > 0.045
        def k_long(q):
            if q[2] < 0.04: return q[1] > -0.12
            return q[1] > 0.04 or abs(q[0]) > 0.07 and q[1] > -0.1
        p.ell(HR, HCh, H2, T=TH, seg=16, rings=10, keep=k_long if hair in ('long', 'bob') else k_short)
        if hair == 'long': p.ell(HR, (0.0, HC[1] - 0.15, HC[2] - 0.07), (0.098 * hs, 0.17, 0.05), T=TH, seg=12, rings=7)       # 後面的長髮，到背上
        if hair == 'bob': p.ell(HR, (0.0, HC[1] - 0.06, HC[2] - 0.04), (0.098 * hs, 0.085, 0.085), T=TH, seg=12, rings=6, keep=lambda q: q[2] < 0.03)
        if hair == 'pony':
            p.ell(HR, (0.0, HC[1] - 0.02, HC[2] - 0.135), (0.036, 0.1, 0.036), T=TH, seg=8, rings=6)
            p.ell(AC, (0.0, HC[1] + 0.055, HC[2] - 0.115), (0.022, 0.016, 0.022), T=TH, seg=6, rings=4)
    # 手臂：肩 → 手肘（跟著上半身）→ 手（放在腿上／拿手機）
    for s in (-1, 1):
        S = TL((s * (sw - 0.03), 1.02, -0.085))
        if pose == 'phone': E, Hd = TL((s * (sw + 0.005), 0.76, 0.02)), (s * 0.045, 0.74, 0.24)
        elif pose == 'lap': E, Hd = TL((s * (sw + 0.012), 0.75, -0.01)), (s * 0.06, 0.6, 0.16)
        elif pose == 'table': E, Hd = TL((s * (sw + 0.01), 0.8, 0.1)), (s * 0.12, 0.765, 0.5)                      # 來賓：手放在桌上
        elif pose == 'lectern': E, Hd = TL((s * (sw + 0.01), 0.78, 0.06)), (s * 0.16, 0.71, 0.27)                 # 致詞：手扶講台（站著，整個上半身再抬高 0.43）
        else: E, Hd = TL((s * (sw + 0.015), 0.76, -0.02)), (s * (0.13 if not fem else 0.11), 0.625, 0.2)
        ra = 0.047 if not fem else 0.04
        if sleeve == 'long': p.tube(TP, S, E, ra + 0.008, ra + 0.004); p.tube(TP, E, Hd, ra + 0.002, ra - 0.006)
        else:
            mid = tuple(S[i] + (E[i] - S[i]) * 0.55 for i in range(3))
            p.tube(TP, S, mid, ra + 0.012, ra + 0.01); p.tube(SK, mid, E, ra - 0.002, ra - 0.006); p.tube(SK, E, Hd, ra - 0.008, ra - 0.014)
        p.ell(SK, Hd, (0.026, 0.02, 0.045), seg=8, rings=5)
        p.ell(TP, S, (ra + 0.016, ra + 0.012, ra + 0.016), seg=8, rings=5)
    if pose == 'phone': p.ell(AC, (0.0, 0.745, 0.255), (0.04, 0.008, 0.075), seg=8, rings=3)
    if stand:                                                        # 站著：上半身整個抬高、腿打直
        bmesh.ops.translate(p.bm, verts=p.bm.verts[:], vec=g2b(0, 0.43, 0))
        for s in (-1, 1):
            p.tube(BT, (s * 0.092, 0.96, -0.06), (s * 0.09, 0.5, -0.05), 0.085, 0.062); p.tube(BT, (s * 0.09, 0.5, -0.05), (s * 0.09, 0.09, -0.06), 0.058, 0.044)
            p.ell(SH, (s * 0.09, 0.045, -0.01), (0.045, 0.045, 0.12), seg=10, rings=5)
        return p.mesh(name, mats)
    # 腿：大腿（坐著往前）→ 小腿往下 → 鞋
    kx = 0.075 if fem else 0.11; ax_ = 0.085 if fem else 0.125
    for s in (-1, 1):
        Hp, K, An = (s * 0.092, 0.535, -0.03), (s * kx, 0.53, 0.38), (s * ax_, 0.085, 0.44)
        rt = 0.085 if not fem else 0.08
        if legs == 'shorts':
            mid = tuple(Hp[i] + (K[i] - Hp[i]) * 0.55 for i in range(3)); p.tube(BT, Hp, mid, rt + 0.006, rt - 0.004); p.tube(SK, mid, K, rt - 0.016, 0.054)
        elif legs == 'skirt':
            p.tube(BT, Hp, K, rt + 0.012, rt - 0.004)
        else: p.tube(BT, Hp, K, rt, 0.062)
        p.tube(SK if legs in ('shorts', 'skirt') else BT, K, An, 0.056 if legs == 'pants' else 0.05, 0.042)
        p.ell(SH, (An[0], 0.045, An[2] + 0.05), (0.045, 0.045, 0.12), seg=10, rings=5)
    if legs == 'skirt': p.loft(BT, [(0.47, 0.17, 0.15, 0.04), (0.55, 0.18, 0.2, 0.1), (0.5, 0.17, 0.12, 0.3)], seg=12, pw=2.2)
    return p.mesh(name, mats)


VARS = []
for i in range(28):
    fem = i % 2 == 1; r_ = random.Random(100 + i)
    hair = r_.choice(['long', 'long', 'pony', 'bob', 'short']) if fem else r_.choice(['short', 'short', 'short', 'cap'])
    pose = r_.choice(['up', 'up', 'up', 'phone', 'phone', 'turn', 'lap', 'down'])
    legs = r_.choice(['pants', 'pants', 'skirt', 'shorts']) if fem else r_.choice(['pants', 'pants', 'pants', 'shorts'])
    sleeve = r_.choice(['short', 'short', 'short', 'long'])
    VARS.append(person(f'crowd_v{i}', fem, hair, pose, legs, sleeve, r_.uniform(-0.08, 0.12)))
coll = bpy.data.collections.new('crowd'); sc.collection.children.link(coll)
nppl = [0]


def seat_person(px, y, pz, ry, tag):
    me = VARS[rng.randrange(len(VARS))]; ob = bpy.data.objects.new(f'crowd_{tag}_{nppl[0]}', me); coll.objects.link(ob); nppl[0] += 1
    s = rng.uniform(0.95, 1.05); ob.location = g2b(px, y, pz); ob.rotation_euler = (0, 0, ry + rng.uniform(-0.12, 0.12)); ob.scale = (s, s, s)


class Xf:
    """和 gym_arena.py 相同：local (x, y, z) → 區域 (px + x cos + z sin, y, pz − x sin + z cos)"""
    def __init__(self, px, pz, ry=0.0): self.px, self.pz, self.c, self.s, self.ry = px, pz, math.cos(ry), math.sin(ry), ry
    def p(self, x, y, z): return (self.px + x * self.c + z * self.s, y, self.pz - x * self.s + z * self.c)


# 場地的折疊椅（gym_arena.py 的 chairs()：ry π，人面向 −z）
ch = AR['sets']['ceremony']['chairs']; (xa, xb), (za, zb), (ppx, ppz) = ch['x'], ch['z'], ch['pitch']
z = za
while z <= zb + 1e-6:
    x = xa
    while x <= xb + 1e-6:
        if not any(a <= x <= b for (a, b) in ch['aisles']) and rng.random() < FILL: seat_person(x, 0.0, z, math.pi, 'floor')
        x += ppx
    z += ppz
# 下層看台（gym_arena.py 的 stand()）＋上層看台（家長，坐一部分）
AW = AR['aisles']['w']; T_, R_, H0 = SR['tread'], SR['rise'], SR['h0']; U0 = UP['front'] - 22
for sd in AR['stands']:
    side = sd['side']; t0, t1 = sd['along']
    xf = Xf(sd['front'], 0.0, math.pi / 2) if side == 'east' else Xf(sd['front'], 0.0, -math.pi / 2) if side == 'west' else Xf(0.0, sd['front'], 0.0)
    if side == 'east': t0, t1 = -t1, -t0
    al = [(-a if side == 'east' else a) for a in AR['aisles'][side]]; gap = sd.get('gap')
    def cut(a, b):
        segs = [(a, b)]
        for c in [(q - AW / 2, q + AW / 2) for q in al] + ([tuple(gap)] if gap else []):
            nxt = []
            for (u, v) in segs:
                if c[1] <= u or c[0] >= v: nxt.append((u, v)); continue
                if c[0] > u: nxt.append((u, c[0]))
                if c[1] < v: nxt.append((c[1], v))
            segs = nxt
        return segs
    for r in range(SR['rows']):
        y = H0 + r * R_; z0 = r * T_
        for (a, b) in cut(t0, t1):
            n = int((b - a - 0.1) / SR['seatPitch'])
            for k in range(n):
                sx = a + 0.05 + (k + 0.5) * (b - a - 0.1) / n
                if rng.random() < FILL * (0.97 - 0.02 * r): px, _, pz = xf.p(sx, y, z0 + 0.5); seat_person(px, y, pz, xf.ry + math.pi, side)
    for r in range(UP['rows']):
        y = UP['h0'] + r * UP['rise']; z0 = U0 + r * UP['tread']; n = int((t1 - t0) / SR['seatPitch'])
        for k in range(n):
            if rng.random() < 0.45: px, _, pz = xf.p(t0 + (k + 0.5) * SR['seatPitch'], y, z0 + 0.36); seat_person(px, y, pz, xf.ry + math.pi, side + '_up')
# 舞台上：七位來賓坐在來賓桌後面（面向觀眾）、一位在講台致詞（西裝：上衣、褲子同一個色表、同一個亂數，成套）
SUIT = ['#22252b', '#1e2533', '#2b2b2e', '#3a3d44', '#262a36']
FM = [MATS[0], MATS[1], mat_rand('suit_top', SUIT, 1.0, rough=0.7, sheen=0.2), mat_rand('suit_bottom', SUIT, 1.0, rough=0.7), mat_rand('suit_shoe', ['#141414'], 1.0, rough=0.4), MATS[5]]
sh = AR['sets']['stage']['h']
GUEST = [person(f'guest_v{i}', i % 3 == 1, 'bob' if i % 3 == 1 else 'short', 'table', 'pants', 'long', 0.04, mats=FM) for i in range(3)]
for k, x in enumerate([-3.6 + i * 0.8 for i in range(7)]):
    ob = bpy.data.objects.new(f'guest_{k}', GUEST[k % 3]); coll.objects.link(ob); ob.location = g2b(x, sh, -20.02); ob.rotation_euler = (0, 0, rng.uniform(-0.08, 0.08))
SPK = person('speaker_v0', False, 'short', 'lectern', 'pants', 'long', 0.06, stand=True, mats=FM)
ob = bpy.data.objects.new('speaker', SPK); coll.objects.link(ob); ob.location = g2b(3.6, sh, -17.86)
print('crowd', nppl[0], 'people,', len(VARS), 'variants,', sum(len(m.polygons) for m in VARS) // len(VARS), 'faces avg')

# ======================== 燈、鏡頭 ========================
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.55, 0.58, 0.62, 1); w.node_tree.nodes['Background'].inputs[1].default_value = 0.08
E = float(opt('--roof', '2600'))
for i, x in enumerate((-15, -5, 5, 15)):
    for j, zz in enumerate((-16, -6, 4, 14)):
        l = bpy.data.lights.new(f'roof_{i}_{j}', 'AREA'); l.energy = E; l.size = 5.0; l.color = (1.0, 0.97, 0.92)
        ob = bpy.data.objects.new(f'roof_{i}_{j}', l); ob.location = g2b(x, 19.5, zz); sc.collection.objects.link(ob)
for (x, zz) in ((-18, -4), (18, -4), (-28, 12), (28, 12)):          # 看台上方
    l = bpy.data.lights.new('stand', 'AREA'); l.energy = E * 0.7; l.size = 6.0; l.color = (1.0, 0.97, 0.92)
    ob = bpy.data.objects.new('stand', l); ob.location = g2b(x, 17.0, zz); sc.collection.objects.link(ob)
for sx in (-1, 1):                                                  # 舞台前的投射燈（暖色）
    l = bpy.data.lights.new('stage', 'SPOT'); l.energy = float(opt('--stage', '9000')); l.color = (1.0, 0.88, 0.72); l.spot_size = math.radians(48); l.spot_blend = 0.6; l.shadow_soft_size = 0.4
    ob = bpy.data.objects.new('stage', l); ob.location = g2b(sx * 9.0, 13.0, -4.0); sc.collection.objects.link(ob)
    ob.rotation_euler = (g2b(sx * 1.0, 2.5, -19.0) - g2b(sx * 9.0, 13.0, -4.0)).to_track_quat('-Z', 'Y').to_euler()
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
eye, look = (0.35, 1.62, 15.2), (0.0, 4.6, -21.0)
if '--eye' in A_: eye = tuple(map(float, opt('--eye', '').split(','))); look = tuple(map(float, opt('--look', '').split(',')))
cam.data.lens = float(opt('--lens', '28')); cam.data.sensor_width = 36; cam.location = g2b(*eye)
cam.rotation_euler = (g2b(*look) - g2b(*eye)).to_track_quat('-Z', 'Y').to_euler()
if '--nodof' not in A_:                                             # 景深：對焦在舞台，前面幾排的頭稍微糊（像相機拍的）
    cam.data.dof.use_dof = True; cam.data.dof.focus_distance = float(opt('--dof', str(round((Vector(eye) - Vector((0.0, 3.0, -18.0))).length, 1)))); cam.data.dof.aperture_fstop = float(opt('--fstop', '5.6'))
sc.render.filepath = OUT; sc.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)
print('saved', OUT)
