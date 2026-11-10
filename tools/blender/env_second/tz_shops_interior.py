"""汀州路／公館六間店的室內（GG-SHOPS3-ART-1110，X320；LAWWW2 帳號 A 2026-11-10）→ assets/models/env/second_ai/tz_<店>_interior.glb（＋.json）
使用者 2026-11-10 23:xx「六家的內部參考圖」（docs/art-rebuild/second_ai/ref/gg_shops6_1110/interior/int_<店>.webp，從店門口往內看）；規格 docs/handoff/user_specs/GG_SHOPS3_1110.md 第三節。
配置 src/data/tz_shops_layout.js（遊戲 src/tz_shops3d.js 讀同一份）。座標＝遊戲座標（x 往東、y 往上、z 往南；店面在 +z）。
接法：Z3.attachRoomGLB——外牆 WALL_<N|S|E|W>（extras dir＝朝室內，遊戲淡出）；其他照材質合併。
牆上的照片、菜單照片板是參考圖裁的（--ref <室內參考圖資料夾> 重做貼圖集；沒給就用 textures/gen/tz_<店>_int_atlas.jpg）。
這一版有：taimi（泰米村食）、xile（洗樂洗衣坊）、yindehao（印得好）。
  /opt/blenv/bin/python tools/blender/env_second/tz_shops_interior.py -- --shop taimi [--ref <資料夾>] [--out <glb>] [--nosingle]"""
import json, math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from lane118_shops import rot, rbox, clathe   # noqa: E402
import numpy as np   # noqa: E402
from PIL import Image   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
SHOP = arg('--shop', 'taimi'); GEN = os.path.join(HERE, 'textures', 'gen'); REF = arg('--ref')
src = open(os.path.join(L.ROOT, 'src/data/tz_shops_layout.js'), encoding='utf-8').read()
J = json.loads(src[src.index('{', src.index('const TZ_SHOPS_LAYOUT=')):src.rindex('}') + 1])[SHOP]
OUT = os.path.join(L.ROOT, arg('--out', J['glb'])); W, D, H = J['w'], J['d'], J['h']; T = 0.2; PI = math.pi
RR = random.Random(sum(ord(c) for c in SHOP))

# ---------- 參考圖裁的貼圖（四個角＝左上、右上、右下、左下，參考圖 1672×941 的像素）----------
CROPS = {'yindehao': {'price': ([(237, 5), (527, 95), (527, 325), (237, 300)], 512, 300), 'sample': ([(540, 100), (660, 135), (660, 325), (540, 325)], 256, 256), 'campus': ([(668, 165), (732, 180), (732, 320), (668, 325)], 224, 256)},
         'taimi': {'menu': ([(1308, 148), (1672, 25), (1672, 458), (1308, 422)], 768, 360), 'photo1': ([(165, 197), (322, 243), (322, 405), (165, 418)], 448, 256), 'photo2': ([(405, 222), (458, 232), (458, 385), (405, 390)], 320, 256)}}
def make_atlas():
    out = os.path.join(GEN, f'tz_{SHOP}_int_atlas.jpg'); meta = out[:-4] + '.json'
    if REF:
        im0 = Image.open(os.path.join(REF, f'int_{J["refName"] if "refName" in J else SHOP}.webp')).convert('RGB'); items = []
        for k, (quad, w, h) in CROPS[SHOP].items():
            A = []; Bv = []
            for (x, y), (u, v) in zip([(0, 0), (w, 0), (w, h), (0, h)], quad): A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); Bv += [u, v]
            items.append((k, im0.transform((w, h), Image.PERSPECTIVE, np.linalg.solve(np.array(A, float), np.array(Bv, float)), Image.BICUBIC)))
        AW, AH = 1024, 512; at = Image.new('RGB', (AW, AH), (40, 40, 40)); uv = {}; x = y = rh = 0
        for k, im in items:
            if x + im.width > AW: x = 0; y += rh + 4; rh = 0
            at.paste(im, (x, y)); uv[k] = [x / AW, 1 - (y + im.height) / AH, (x + im.width) / AW, 1 - y / AH]; x += im.width + 4; rh = max(rh, im.height)
        os.makedirs(GEN, exist_ok=True); at.save(out, quality=90); json.dump(uv, open(meta, 'w'), indent=1)
    return out, json.load(open(meta))


ATL, AUV = make_atlas() if SHOP in CROPS else (None, {})
B.reset(texres=512)
root = B.group(f'tz_{SHOP}_interior', props={'kind': f'tz_{SHOP}_interior'})
_pm = bpy.data.materials.new(f'tzs_{SHOP}_pics'); _pm.use_nodes = True; _nt = _pm.node_tree; _bs = _nt.nodes['Principled BSDF']; _bs.inputs['Roughness'].default_value = 0.6
if ATL: _tx = _nt.nodes.new('ShaderNodeTexImage'); _tx.image = bpy.data.images.load(ATL); _nt.links.new(_tx.outputs['Color'], _bs.inputs['Base Color'])
M = {
    'floor': L.pbr('tzs_floor_stone', 'granite_tile', tile=1.2 if SHOP == 'taimi' else 0.9, target=J.get('floor', '#8f8b84'), normal=0.25, maps=('diff', 'nor'), rough_value=0.45),
    'wall': L.pbr('tzs_wall', 'white_plaster_02', tile=2.4, target=J.get('wallColor', '#f1e4c8'), normal=0.2, maps=('diff', 'nor'), rough_value=0.85),
    'ceil': L.flat('tzs_ceiling', '#e9dcc0' if J.get('warm') else '#f4f5f4', rough=0.95),
    'wood': L.pbr('tzs_wood', 'walnut_veneer', tile=0.8, target='#9a6f45', maps=('diff',), res=256, rough_value=0.5),
    'wood_d': L.pbr('tzs_wood_dark', 'dark_wood', tile=0.8, target='#4a3426', maps=('diff',), res=256, rough_value=0.5),
    'steel': L.flat('tzs_steel', '#b9bdc1', rough=0.3, metal=0.4),
    'glass': L.flat('tzs_glass', '#e6eeee', rough=0.05, alpha=0.14),
    'light': L.flat('tzs_lightpanel', '#ffe9c0' if J.get('warm') else '#f8fbff', rough=0.5, emit=B.srgb('#ffd9a0' if J.get('warm') else '#f2f7ff')),
    'pics': _pm,
    'vc': L.vc_material('tzs_vc', rough=0.7),
    'vcm': L.vc_material('tzs_vcm', rough=0.35),
}
MM = {}; SQ = []
def mesh(key, cm=False):
    if key not in MM: MM[key] = CMesh('S_' + key, M[key]) if cm else Mesh('S_' + key, M[key])
    return MM[key]
vc = lambda: mesh('vc', True); vm = lambda: mesh('vcm', True)
def pic(key, pts): SQ.append((key, [g2b(*p) for p in pts]))   # 左下、右下、右上、左上（從看的人那一邊）
def ccyl(m, a, b, r, col, seg=10, r2=None, caps=True):
    pa, pb = g2b(*a), g2b(*b); d = pb - pa
    res = bmesh.ops.create_cone(m.bm, cap_ends=caps, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=d.length)
    bmesh.ops.rotate(m.bm, verts=res['verts'], cent=(0, 0, 0), matrix=Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix()); bmesh.ops.translate(m.bm, verts=res['verts'], vec=(pa + pb) / 2)
    m.paint({f for v in res['verts'] for f in v.link_faces}, col)
def blob(x, y, z, r, col, sy=1.0):
    bm = vc().bm; res = bmesh.ops.create_uvsphere(bm, u_segments=8, v_segments=5, radius=r)
    for v in res['verts']: v.co.z *= sy
    bmesh.ops.translate(bm, verts=res['verts'], vec=g2b(x, y, z)); vc().paint({f for v in res['verts'] for f in v.link_faces}, col)
WALLS = {}
def wall(side, dirv):
    if side not in WALLS: WALLS[side] = (Mesh('WALL_' + side, M['wall']), dirv)
    return WALLS[side][0]


# ---------- 殼 ----------
mesh('floor').box(-W / 2, W / 2, -0.1, 0.0, -D / 2, D / 2); mesh('ceil').box(-W / 2, W / 2, H, H + 0.1, -D / 2, D / 2)
wall('N', [0, 0, 1]).box(-W / 2, W / 2, 0, H, -D / 2 - T, -D / 2); wall('W', [1, 0, 0]).box(-W / 2 - T, -W / 2, 0, H, -D / 2, D / 2); wall('E', [-1, 0, 0]).box(W / 2, W / 2 + T, 0, H, -D / 2, D / 2)
FR = J['front']; zS = D / 2; ws = wall('S', [0, 0, -1]); dx0, dx1, dh = FR['door']; sill, head = FR['sill'], FR['head']
cuts = sorted([(a, b, sill, head) for a, b in FR['windows']] + [(dx0, dx1, 0.0, dh)]); x = -W / 2
for (a, b, y0, y1) in cuts:
    ws.box(x, a, 0, H, zS, zS + T); ws.box(a, b, y1, H, zS, zS + T)
    if y0 > 0: ws.box(a, b, 0, y0, zS, zS + T)
    x = b
ws.box(x, W / 2, 0, H, zS, zS + T)
FRAME = '#3a2416' if SHOP == 'taimi' else '#c4c8cb'
for (a, b) in FR['windows']:
    mesh('glass').quad([(a, sill, zS + 0.08), (b, sill, zS + 0.08), (b, head, zS + 0.08), (a, head, zS + 0.08)])
    for xx in (a, (a + b) / 2, b): vc().cbox(xx - 0.03, xx + 0.03, sill, head, zS + 0.04, zS + 0.12, FRAME)
    for yy in (sill, head): vc().cbox(a, b, yy - 0.03, yy + 0.03, zS + 0.04, zS + 0.12, FRAME)
    vc().cbox(a, b, sill - 0.05, sill, zS - 0.12, zS + 0.02, '#5a3a22')   # 窗台
for xx in (dx0, dx1): vc().cbox(xx - 0.04, xx + 0.04, 0, dh, zS + 0.02, zS + 0.14, FRAME)
vc().cbox(dx0, dx1, dh - 0.04, dh + 0.04, zS + 0.02, zS + 0.14, FRAME)
for i in range(2 if SHOP == 'taimi' else 0):   # 門上的米色布簾（兩片；泰米村食）
    a = dx0 + 0.04 + i * (dx1 - dx0 - 0.08) / 2; vc().cbox(a + 0.01, a + (dx1 - dx0 - 0.08) / 2 - 0.01, dh - 1.05, dh - 0.05, zS + 0.07, zS + 0.085, '#e6d6b4')


# ---------- 家具的小零件 ----------
def chair(x, z, yaw, wood='#3a2a20', pad='#5a3a2a'):
    """深色木椅＋皮坐墊（參考圖）：(x, z) 是坐的位置"""
    Tr = rot(x, z, yaw); sh = 0.46
    rbox(vc(), Tr, -0.21, 0.21, sh - 0.05, sh, -0.2, 0.2, pad, r=0.015, seg=1)
    rbox(vc(), Tr, -0.21, 0.21, sh - 0.09, sh - 0.05, -0.2, 0.2, wood)
    for lx in (-0.18, 0.18):
        for lz in (-0.17, 0.17): (px, pz) = Tr(lx, lz); ccyl(vc(), (px, 0.0, pz), (px, sh - 0.09, pz), 0.02, wood, seg=6)
    for lx in (-0.18, 0.18): (px, pz) = Tr(lx, -0.2); ccyl(vc(), (px, sh, pz), (px, 0.9, pz), 0.02, wood, seg=6)
    for y in (0.62, 0.74, 0.86): rbox(vc(), Tr, -0.19, 0.19, y - 0.035, y + 0.035, -0.215, -0.185, wood)
def table_set(x, y, z):
    """桌上：不鏽鋼餐具筒、木面紙盒、辣椒罐"""
    ccyl(vm(), (x - 0.12, y, z), (x - 0.12, y + 0.13, z), 0.05, '#b9bdc1', seg=10)
    for i in range(3): ccyl(vm(), (x - 0.12 + (i - 1) * 0.02, y + 0.1, z), (x - 0.12 + (i - 1) * 0.03, y + 0.2, z + (i - 1) * 0.01), 0.004, '#d8dadc', seg=4)
    vc().cbox(x + 0.02, x + 0.2, y, y + 0.09, z - 0.07, z + 0.07, '#b8905a'); vc().cbox(x + 0.07, x + 0.15, y + 0.09, y + 0.13, z - 0.03, z + 0.03, '#f6f4ee')
    ccyl(vc(), (x - 0.02, y, z + 0.12), (x - 0.02, y + 0.07, z + 0.12), 0.025, '#b8402a', seg=8)
def pendant(x, z, y=2.25):
    """藤編吊燈：電線、藤編燈罩（鏤空感用深淺兩色的橫條）、裡面的燈泡"""
    ccyl(vc(), (x, y + 0.3, z), (x, H, z), 0.006, '#2b2b2b', seg=4)
    prof = [(0.05, 0.3), (0.16, 0.22), (0.21, 0.08), (0.2, 0.0)]
    for i, ((r0, y0), (r1, y1)) in enumerate(zip(prof, prof[1:])): ccyl(vc(), (x, y + y1, z), (x, y + y0, z), r1, '#d9b06a' if i % 2 else '#c49a52', seg=14, r2=r0, caps=False)
    mesh('light').sphere((x, y + 0.1, z), 0.06, seg=8, rings=5)
def fern(x, y, z, r=0.3, n=14, hang=False):
    for i in range(n):
        a = RR.uniform(0, 2 * PI); rd = RR.uniform(0.1, r); blob(x + math.cos(a) * rd, y + (RR.uniform(-0.7, 0.05) * r * 2 if hang else RR.uniform(0.0, 0.5) * r), z + math.sin(a) * rd * (0.5 if hang else 1), RR.uniform(0.05, 0.09), RR.choice(('#4f7a3a', '#3f6a34', '#6a9a4a')), sy=0.6)


# ---------- 泰米村食 ----------
if SHOP == 'taimi':
    BQ = J['banquette']; CT = J['counter']; KT = J['kitchen']; PT = J['partition']; DC = J['decor']
    LEATHER, LEATHER_D = '#6a4530', '#4f3222'
    # 長卡座：座墊、靠背、底座；一排靠枕
    vc().cbox(BQ['x0'], BQ['x1'], 0.0, 0.1, BQ['z0'], BQ['z1'], '#3a2a20'); vc().crbox(BQ['x0'], BQ['x1'] + 0.02, 0.1, 0.46, BQ['z0'], BQ['z1'], LEATHER, r=0.03)
    vc().crbox(BQ['x0'], BQ['x0'] + 0.14, 0.46, 1.0, BQ['z0'], BQ['z1'], LEATHER_D, r=0.03); mesh('wood').box(BQ['x0'], BQ['x0'] + 0.16, 1.0, 1.06, BQ['z0'], BQ['z1'])
    for i, t in enumerate(J['tables'][:5]):
        if i % 2 == 0: vc().crbox(BQ['x0'] + 0.14, BQ['x0'] + 0.26, 0.5, 0.86, t['z'] - 0.2, t['z'] + 0.2, ('#c9a878', '#b8503a', '#d9c9a8')[i % 3], r=0.04)
    # 桌子：兩人桌（木桌面＋黑色單柱）、四人桌（木桌面＋四支深色桌腳）
    for t in J['tables']:
        x, z, w_, d_ = t['x'], t['z'], t['w'], t['d']
        mesh('wood').rbox(x - w_ / 2, x + w_ / 2, 0.71, 0.76, z - d_ / 2, z + d_ / 2, r=0.012, seg=2)
        if t['kind'] == 'two': ccyl(vm(), (x, 0.03, z), (x, 0.71, z), 0.035, '#2b2b2b', seg=8); ccyl(vm(), (x, 0.0, z), (x, 0.03, z), 0.22, '#2b2b2b', seg=14)
        else:
            for sx in (-1, 1):
                for sz in (-1, 1): mesh('wood_d').box(x + sx * (w_ / 2 - 0.07) - 0.03, x + sx * (w_ / 2 - 0.07) + 0.03, 0, 0.71, z + sz * (d_ / 2 - 0.07) - 0.03, z + sz * (d_ / 2 - 0.07) + 0.03)
        table_set(x + (0.0 if t['kind'] == 'two' else 0.3), 0.76, z - (0.15 if t['kind'] == 'two' else 0.0))
    for q in J['seats']:
        if not q.get('bench'): chair(q['x'], q['z'], q['yaw'])
    # 木櫃台：直紋木板、檯面、底下的暖色燈條；檯面上收銀螢幕、蘭花、醬料瓶
    mesh('wood').box(CT['x0'], CT['x1'], 0.08, CT['h'] - 0.05, CT['z0'], CT['z1']); mesh('wood_d').rbox(CT['x0'] - 0.04, CT['x1'] + 0.04, CT['h'] - 0.05, CT['h'], CT['z0'] - 0.03, CT['z1'] + 0.06, r=0.012, seg=2)
    vc().cbox(CT['x0'], CT['x1'], 0.0, 0.08, CT['z0'], CT['z1'] - 0.05, '#2b2018'); mesh('light').box(CT['x0'] + 0.05, CT['x1'] - 0.05, 0.085, 0.11, CT['z1'] - 0.03, CT['z1'] + 0.005)
    for i in range(28): xx = CT['x0'] + 0.05 + i * (CT['x1'] - CT['x0'] - 0.1) / 27; vc().cbox(xx - 0.012, xx + 0.012, 0.12, CT['h'] - 0.06, CT['z1'], CT['z1'] + 0.012, '#7a5636')
    cx = J['clerk']['x']; vc().cbox(cx + 0.5, cx + 0.95, CT['h'] + 0.1, CT['h'] + 0.42, CT['z0'] + 0.15, CT['z0'] + 0.19, '#1f2023'); ccyl(vc(), (cx + 0.72, CT['h'], CT['z0'] + 0.17), (cx + 0.72, CT['h'] + 0.12, CT['z0'] + 0.17), 0.03, '#1f2023', seg=6)
    clathe(vc(), [(0.0, 0.0), (0.07, 0.0), (0.09, 0.12), (0.0, 0.12)], CT['x0'] + 0.5, CT['h'], (CT['z0'] + CT['z1']) / 2, '#f4f1ea', seg=10)   # 蘭花盆
    for i in range(7): blob(CT['x0'] + 0.5 + RR.uniform(-0.14, 0.14), CT['h'] + 0.3 + RR.uniform(0, 0.25), (CT['z0'] + CT['z1']) / 2 + RR.uniform(-0.08, 0.08), 0.045, RR.choice(('#c94a8a', '#d96aa0', '#b83a7a')))
    for i in range(6): ccyl(vc(), (CT['x1'] - 0.3 - i * 0.12, CT['h'], CT['z1'] - 0.15), (CT['x1'] - 0.3 - i * 0.12, CT['h'] + 0.16 + (i % 2) * 0.04, CT['z1'] - 0.15), 0.03, ('#7a2a1a', '#c9a23a', '#3a5a2a', '#e8e0c8', '#a8401a', '#5a3a22')[i], seg=8)
    # 開放式廚房：後牆不鏽鋼、爐台、層架上的鍋、排煙罩；出餐口上面的紅格紋布棚
    zk0, zk1 = KT['z0'], KT['z1']
    mesh('steel').box(KT['x0'], KT['x1'], 0.0, 0.9, zk0 + 0.02, zk0 + 0.7); mesh('steel').box(KT['x0'], KT['x1'], 0.9, 2.2, zk0, zk0 + 0.03)
    mesh('steel').box(KT['x0'] + 0.6, KT['x1'] - 0.8, 1.95, 2.45, zk0 + 0.05, zk0 + 0.95)                         # 排煙罩
    for i in range(3): ccyl(vm(), (KT['x0'] + 1.0 + i * 0.8, 0.9, zk0 + 0.4), (KT['x0'] + 1.0 + i * 0.8, 1.0 + (i % 2) * 0.08, zk0 + 0.4), 0.16, ('#3a3a3c', '#b9bdc1', '#3a3a3c')[i], seg=12)
    mesh('steel').box(KT['x1'] - 0.7, KT['x1'] - 0.05, 0.0, 1.9, zk0 + 0.05, zk0 + 0.7)                           # 冰箱
    for y in (1.35, 1.7): mesh('steel').box(KT['x0'] + 0.1, KT['x0'] + 0.55, y, y + 0.02, zk0 + 0.03, zk0 + 0.35)
    for sx in (KT['x0'], KT['x1'] - 0.08): vc().cbox(sx, sx + 0.08, 0.0, H, zk1 - 0.08, zk1, '#e9dcc0')            # 廚房開口兩側的柱
    vc().cbox(KT['x0'], KT['x1'], 2.55, H, zk1 - 0.08, zk1, '#e9dcc0')
    for i in range(18):   # 紅格紋布棚（一條一條深淺相間）
        a = KT['x0'] + i * (KT['x1'] - KT['x0']) / 18; b = a + (KT['x1'] - KT['x0']) / 18
        vc().poly([(a, 2.55, zk1 + 0.01), (b, 2.55, zk1 + 0.01), (b, 2.25, zk1 + 0.5), (a, 2.25, zk1 + 0.5)], ('#a8382a', '#7a2a22', '#c9a24a')[i % 3]); vc().poly([(b, 2.55, zk1 + 0.01), (a, 2.55, zk1 + 0.01), (a, 2.25, zk1 + 0.5), (b, 2.25, zk1 + 0.5)], '#6a2a22')
    # 左後方的隔牆和格紋布簾的門
    d0, d1 = PT['door']; vc().cbox(PT['x0'], d0, 0.0, H, PT['z'] - 0.1, PT['z'], '#f1e4c8'); vc().cbox(d1, PT['x1'], 0.0, H, PT['z'] - 0.1, PT['z'], '#f1e4c8'); vc().cbox(d0, d1, 2.2, H, PT['z'] - 0.1, PT['z'], '#f1e4c8')
    for i in range(10): a = d0 + i * (d1 - d0) / 10; vc().cbox(a, a + (d1 - d0) / 10, 0.05, 2.2, PT['z'] - 0.06 + (i % 2) * 0.02, PT['z'] - 0.04 + (i % 2) * 0.02, ('#b8603a', '#8a3a2a', '#d9b06a')[i % 3])
    # 牆上：右牆菜色照片板、左牆泰國街景照片（參考圖裁的）、藤編圓盤、層板＋蕨類
    MB = DC['menuBoard']; xe = W / 2 - 0.03; vc().cbox(W / 2 - 0.04, W / 2, MB['y0'] - 0.05, MB['y1'] + 0.05, MB['z0'] - 0.05, MB['z1'] + 0.05, '#5a3a22')
    pic('menu', [(xe - 0.012, MB['y0'], MB['z0']), (xe - 0.012, MB['y0'], MB['z1']), (xe - 0.012, MB['y1'], MB['z1']), (xe - 0.012, MB['y1'], MB['z0'])])
    xw = -W / 2 + 0.03
    for ph in DC['photos']: pic(ph['key'], [(xw, ph['y0'], ph['z1']), (xw, ph['y0'], ph['z0']), (xw, ph['y1'], ph['z0']), (xw, ph['y1'], ph['z1'])])
    for pl in DC['plates']:
        ccyl(vc(), (-W / 2 + 0.01, pl['y'], pl['z']), (-W / 2 + 0.05, pl['y'], pl['z']), pl['r'], '#c49a52', seg=20); ccyl(vc(), (-W / 2 + 0.05, pl['y'], pl['z']), (-W / 2 + 0.06, pl['y'], pl['z']), pl['r'] * 0.6, '#d9b06a', seg=16)
    SH = DC['shelf']; mesh('wood').box(-W / 2, -W / 2 + 0.28, SH['y'], SH['y'] + 0.04, SH['z0'], SH['z1'])
    fern(-W / 2 + 0.16, SH['y'] + 0.1, SH['z0'] + 0.3, hang=True); fern(-W / 2 + 0.16, SH['y'] + 0.12, SH['z1'] - 0.35, r=0.26)
    vc().cbox(-W / 2 + 0.05, -W / 2 + 0.26, SH['y'] + 0.04, SH['y'] + 0.2, SH['z1'] - 0.5, SH['z1'] - 0.2, '#d9c9a8')
    for (px, pz) in DC['plants']:
        clathe(vc(), [(0.0, 0.0), (0.16, 0.0), (0.2, 0.36), (0.0, 0.36)], px, 0.0, pz, '#e8e0d0', seg=12); ccyl(vc(), (px, 0.36, pz), (px, 1.0, pz), 0.02, '#6a5038', seg=5); fern(px, 1.0, pz, r=0.34, n=18)
    for (px, pz) in DC['pendants']: pendant(px, pz)
    # 天花板：裸露的風管、冷氣出風口、軌道燈
    for xx in (-1.6, 1.2): ccyl(vc(), (xx, H - 0.14, -D / 2 + 0.3), (xx, H - 0.14, D / 2 - 0.3), 0.07, '#efe4cc', seg=10)
    vc().cbox(-0.6, 0.6, H - 0.2, H - 0.02, 0.6, 1.8, '#e6dcc6'); vc().cbox(-0.5, 0.5, H - 0.215, H - 0.2, 0.7, 1.7, '#bfb6a2')
    vc().cbox(-3.2, -3.16, H - 0.06, H - 0.03, -2.5, 4.4, '#2b2b2b')
    for i in range(6): z = -2.0 + i * 1.2; ccyl(vc(), (-3.18, H - 0.06, z), (-3.3, H - 0.24, z), 0.04, '#2b2b2b', seg=8); mesh('light').cyl((-3.3, H - 0.245, z), (-3.31, H - 0.255, z), 0.033, seg=8)


# ---------- 洗樂洗衣坊 ----------
if SHOP == 'xile':
    WS, DR, MC, CH, FT = J['washers'], J['dryers'], J['machines'], J['chairs'], J['foldTable']
    BLUE, STEEL, STEEL_D, DARK = '#bfe0ee', '#c4c8cb', '#9a9fa4', '#2a2f36'
    def drum(xf, y, z, r, face):
        """滾筒的圓門：不鏽鋼圈＋深色玻璃；face＝門朝 +x（1）或 −x（−1）"""
        ccyl(vm(), (xf, y, z), (xf + face * 0.04, y, z), r, STEEL, seg=20); ccyl(vc(), (xf + face * 0.04, y, z), (xf + face * 0.05, y, z), r * 0.78, DARK, seg=20)
        ccyl(vm(), (xf + face * 0.05, y, z - r * 0.9), (xf + face * 0.07, y, z - r * 0.9), 0.03, STEEL_D, seg=8)
    # 左牆：一排洗衣機（不鏽鋼機身、上面控制面板、圓門朝東）
    n = WS['n']; pw = (WS['z1'] - WS['z0']) / n
    vc().cbox(WS['x0'], WS['x1'], 0.0, 0.12, WS['z0'], WS['z1'], STEEL_D)
    for i in range(n):
        z0 = WS['z0'] + i * pw; zc = z0 + pw / 2
        vm().crbox(WS['x0'], WS['x1'], 0.12, 1.18, z0 + 0.012, z0 + pw - 0.012, STEEL, r=0.012)
        vc().cbox(WS['x1'], WS['x1'] + 0.006, 0.98, 1.14, z0 + 0.06, z0 + pw - 0.06, '#3a3f46'); vc().cbox(WS['x1'] + 0.006, WS['x1'] + 0.01, 1.02, 1.1, zc - 0.12, zc + 0.02, '#8fd0e8')
        ccyl(vm(), (WS['x1'], 1.06, zc + 0.16), (WS['x1'] + 0.03, 1.06, zc + 0.16), 0.03, STEEL_D, seg=10); drum(WS['x1'], 0.58, zc, 0.24, 1)
    # 右牆：四組上下疊的大烘衣機（圓門朝西）
    n = DR['n']; pw = (DR['z1'] - DR['z0']) / n
    for i in range(n):
        z0 = DR['z0'] + i * pw; zc = z0 + pw / 2
        vm().crbox(DR['x0'], DR['x1'], 0.08, 2.12, z0 + 0.012, z0 + pw - 0.012, STEEL, r=0.012)
        for yc in (0.6, 1.62): drum(DR['x0'], yc, zc, 0.36, -1)
        vc().cbox(DR['x0'] - 0.006, DR['x0'], 1.02, 1.2, z0 + 0.1, z0 + pw - 0.1, '#3a3f46'); vc().cbox(DR['x0'] - 0.01, DR['x0'] - 0.006, 1.06, 1.16, zc - 0.25, zc - 0.05, '#8fd0e8')
    vc().cbox(DR['x0'], DR['x1'], 0.0, 0.08, DR['z0'], DR['z1'], STEEL_D)
    # 兌幣機、洗衣精販賣機
    zm = (MC['z0'] + MC['z1']) / 2
    vm().crbox(MC['x0'], MC['x0'] + 0.22, 1.0, 1.9, MC['z0'], zm - 0.04, STEEL, r=0.01); vc().cbox(MC['x0'] + 0.22, MC['x0'] + 0.226, 1.55, 1.75, MC['z0'] + 0.08, zm - 0.12, '#2a2f36'); vc().cbox(MC['x0'] + 0.22, MC['x0'] + 0.23, 1.12, 1.3, MC['z0'] + 0.1, zm - 0.14, '#1f2226')
    vc().crbox(MC['x0'], MC['x1'], 0.45, 1.95, zm + 0.02, MC['z1'], '#f4f6f6', r=0.012); mesh('glass').quad([(MC['x1'] + 0.004, 1.0, zm + 0.1), (MC['x1'] + 0.004, 1.0, MC['z1'] - 0.14), (MC['x1'] + 0.004, 1.8, MC['z1'] - 0.14), (MC['x1'] + 0.004, 1.8, zm + 0.1)])
    for j in range(3):
        for i in range(3): ccyl(vc(), (MC['x1'] - 0.08, 1.05 + j * 0.26, zm + 0.16 + i * 0.09), (MC['x1'] - 0.08, 1.21 + j * 0.26, zm + 0.16 + i * 0.09), 0.03, ('#e8a8c8', '#a8c8e8', '#f4f4f0')[(i + j) % 3], seg=8)
    # 三連座淺藍塑膠椅（鋼樑、兩支腳）
    zc0 = (CH['z0'] + CH['z1']) / 2; xs_ = CH['x0'] + 0.3
    ccyl(vm(), (xs_, 0.4, CH['z0'] + 0.1), (xs_, 0.4, CH['z1'] - 0.1), 0.025, STEEL_D, seg=8)
    for zz in (CH['z0'] + 0.25, CH['z1'] - 0.25): ccyl(vm(), (xs_, 0.0, zz), (xs_, 0.4, zz), 0.025, STEEL_D, seg=8); vm().cbox(xs_ - 0.2, xs_ + 0.2, 0.0, 0.02, zz - 0.03, zz + 0.03, STEEL_D)
    for q in J['seats']:
        vc().crbox(xs_ - 0.2, xs_ + 0.22, 0.42, 0.46, q['z'] - 0.2, q['z'] + 0.2, '#a9cfe6', r=0.02); vc().crbox(xs_ - 0.24, xs_ - 0.19, 0.46, 0.86, q['z'] - 0.2, q['z'] + 0.2, '#a9cfe6', r=0.02)
    # 牆：淺天藍腰帶、使用說明海報（四格圖示）、層板上的黃金葛
    vc().cbox(-W / 2, -W / 2 + 0.008, 2.05, 2.3, -D / 2, 1.9, BLUE); vc().cbox(W / 2 - 0.008, W / 2, 0.0, 1.1, -D / 2, DR['z0'], BLUE); vc().cbox(1.9, W / 2, 0.0, 1.1, -D / 2, -D / 2 + 0.008, BLUE)
    vc().cbox(-W / 2, -W / 2 + 0.012, 1.95, 2.95, 2.0, 3.9, '#e9f4fa'); vc().cbox(-W / 2 + 0.012, -W / 2 + 0.016, 2.82, 2.92, 2.05, 3.85, '#7fc0e0')
    for i in range(4):
        zz = 2.45 + (i % 2) * 0.95; yy = 2.48 - (i // 2) * 0.42; vc().cbox(-W / 2 + 0.012, -W / 2 + 0.018, yy - 0.14, yy + 0.14, zz - 0.3, zz - 0.02, '#cfe6f2'); ccyl(vc(), (-W / 2 + 0.018, yy, zz - 0.16), (-W / 2 + 0.022, yy, zz - 0.16), 0.08, '#5aa7d0', seg=14)
        for k in range(3): vc().cbox(-W / 2 + 0.012, -W / 2 + 0.018, yy + 0.06 - k * 0.07, yy + 0.085 - k * 0.07, zz + 0.02, zz + 0.38, '#9ab8c8')
    for (zz, yy) in ((1.2, 2.5), (-0.4, 2.42), (-1.2, 2.42)):
        vc().cbox(-W / 2, -W / 2 + 0.2, yy, yy + 0.03, zz - 0.3, zz + 0.3, '#e8dcc0'); clathe(vc(), [(0.0, 0.0), (0.07, 0.0), (0.09, 0.12), (0.0, 0.12)], -W / 2 + 0.11, yy + 0.03, zz, '#f4f1ea', seg=10); fern(-W / 2 + 0.11, yy + 0.16, zz, r=0.2, n=10, hang=True)
    # 後方：木折衣桌和洗衣籃、置物架、門、水槽
    x, z, w_, d_ = FT['x'], FT['z'], FT['w'], FT['d']
    mesh('wood').rbox(x - w_ / 2, x + w_ / 2, 0.84, 0.89, z - d_ / 2, z + d_ / 2, r=0.012, seg=2)
    for sx in (-1, 1):
        for sz in (-1, 1): mesh('wood').box(x + sx * (w_ / 2 - 0.07) - 0.03, x + sx * (w_ / 2 - 0.07) + 0.03, 0, 0.84, z + sz * (d_ / 2 - 0.07) - 0.03, z + sz * (d_ / 2 - 0.07) + 0.03)
    def basket(bx, by, bz, col):
        vc().cbox(bx - 0.26, bx + 0.26, by, by + 0.03, bz - 0.18, bz + 0.18, col)
        for k in range(7): xx = bx - 0.26 + k * 0.52 / 6; vc().cbox(xx - 0.012, xx + 0.012, by, by + 0.3, bz - 0.19, bz - 0.17, col); vc().cbox(xx - 0.012, xx + 0.012, by, by + 0.3, bz + 0.17, bz + 0.19, col)
        for zz in (bz - 0.18, bz + 0.18): vc().cbox(bx - 0.27, bx + 0.27, by + 0.27, by + 0.31, zz - 0.012, zz + 0.012, col)
        for xx in (bx - 0.26, bx + 0.26): vc().cbox(xx - 0.012, xx + 0.012, by, by + 0.31, bz - 0.18, bz + 0.18, col)
    for i, col in enumerate(('#f4f4f0', '#8fb8d8', '#f4f4f0')): basket(x - 0.6 + i * 0.6, 0.0, z + 0.05, col)
    for xx in (0.7, 1.9): ccyl(vm(), (xx, 0.0, -D / 2 + 0.25), (xx, 1.5, -D / 2 + 0.25), 0.015, STEEL, seg=6)
    for j, y in enumerate((0.45, 0.95, 1.45)): vm().cbox(0.68, 1.92, y, y + 0.02, -D / 2 + 0.05, -D / 2 + 0.45, STEEL); basket(1.3, y + 0.02, -D / 2 + 0.25, ('#f4f4f0', '#f4f4f0', '#8fb8d8')[j])
    vc().cbox(-0.95, -0.05, 0.0, 2.05, -D / 2, -D / 2 + 0.03, '#eceeee'); vc().cbox(-1.0, 0.0, 2.05, 2.1, -D / 2, -D / 2 + 0.04, '#d6d9da'); ccyl(vm(), (-0.18, 1.0, -D / 2 + 0.03), (-0.18, 1.0, -D / 2 + 0.09), 0.03, STEEL_D, seg=8)
    vc().cbox(2.2, W / 2, 0.0, 0.85, -4.3, -3.1, '#f4f4f0'); vm().cbox(2.3, W / 2 - 0.06, 0.8, 0.86, -4.2, -3.2, STEEL); ccyl(vm(), (2.85, 0.86, -3.7), (2.85, 1.1, -3.7), 0.015, STEEL_D, seg=6)
    # 天花板：日光燈六支、冷氣、壁扇、監視器
    for xx in (-1.4, 1.4):
        for zz in (-2.6, 0.0, 2.6): vc().cbox(xx - 0.7, xx + 0.7, H - 0.07, H - 0.02, zz - 0.09, zz + 0.09, '#eceeee'); mesh('light').box(xx - 0.62, xx + 0.62, H - 0.095, H - 0.07, zz - 0.035, zz + 0.035)
    vc().crbox(W / 2 - 0.24, W / 2, 2.35, 2.65, -2.6, -1.75, '#f4f4f0', r=0.02); ccyl(vc(), (0.0, H - 0.1, 1.2), (0.0, H, 1.2), 0.06, '#2a2f36', seg=10)
    ccyl(vc(), (W / 2 - 0.02, 2.5, -3.6), (W / 2 - 0.25, 2.45, -3.6), 0.02, '#eceeee', seg=6); ccyl(vc(), (W / 2 - 0.25, 2.45, -3.6), (W / 2 - 0.3, 2.45, -3.6), 0.2, '#eceeee', seg=16)


# ---------- 印得好 ----------
if SHOP == 'yindehao':
    CP, PL, CT, SV, DC = J['copiers'], J['plotter'], J['counter'], J['shelves'], J['decor']
    WHITE, GREY, DARK, NAVY, STEEL = '#eceeee', '#b9bcbf', '#2f3338', '#2c3c5a', '#c4c8cb'
    def copier(z0, z1, front=WHITE):
        """落地型影印機（門朝東）：下面三層紙匣、機身、上面深色掃描台和送稿器、斜的觸控面板"""
        x0, x1 = CP['x0'], CP['x1']; zc = (z0 + z1) / 2
        vc().crbox(x0, x1, 0.08, 0.62, z0 + 0.03, z1 - 0.03, front, r=0.012)
        for k in range(3): vc().cbox(x1, x1 + 0.006, 0.12 + k * 0.17, 0.26 + k * 0.17, z0 + 0.06, z1 - 0.06, '#dfe1e2'); vc().cbox(x1 + 0.006, x1 + 0.012, 0.2 + k * 0.17, 0.22 + k * 0.17, zc - 0.1, zc + 0.1, GREY)
        vc().crbox(x0, x1 + 0.03, 0.62, 0.98, z0 + 0.02, z1 - 0.02, WHITE, r=0.015); vc().cbox(x0 + 0.03, x1 - 0.05, 0.98, 1.06, z0 + 0.05, z1 - 0.05, DARK); vc().crbox(x0 + 0.05, x1 - 0.15, 1.06, 1.16, z0 + 0.1, z1 - 0.1, WHITE, r=0.01)
        vc().poly([(x1 + 0.02, 0.98, zc - 0.14), (x1 + 0.02, 0.98, zc + 0.14), (x1 - 0.06, 1.12, zc + 0.14), (x1 - 0.06, 1.12, zc - 0.14)][::-1], DARK); vc().cbox(x1 - 0.02, x1 + 0.06, 0.72, 0.76, z0 + 0.1, z1 - 0.1, '#f4f4f0')   # 出紙盤上的紙
        for zz in (z0 + 0.1, z1 - 0.1): ccyl(vc(), (x1 - 0.1, 0.04, zz), (x1 - 0.06, 0.04, zz), 0.04, DARK, seg=8)
    n = len(CP['list']); pw = (CP['z1'] - CP['z0']) / n
    for i, kd in enumerate(CP['list'][::-1]):   # 配置由門口往裡寫，z 由大到小
        z0 = CP['z0'] + i * pw; z1 = z0 + pw; zc = (z0 + z1) / 2
        if kd.startswith('copier'): copier(z0, z1, NAVY if kd == 'copier_blue' else WHITE)
        elif kd == 'cutter':   # 裁紙機：鐵桌＋米色機台＋壓桿
            mesh('steel').box(CP['x0'], CP['x1'], 0.72, 0.76, z0 + 0.04, z1 - 0.04)
            for sx in (CP['x0'] + 0.05, CP['x1'] - 0.05):
                for zz in (z0 + 0.08, z1 - 0.08): ccyl(vm(), (sx, 0.0, zz), (sx, 0.72, zz), 0.02, STEEL, seg=6)
            vc().crbox(CP['x0'] + 0.08, CP['x1'] - 0.06, 0.76, 0.98, z0 + 0.12, z1 - 0.12, '#d9d2bc', r=0.01); ccyl(vm(), (CP['x0'] + 0.2, 0.98, zc), (CP['x1'] + 0.05, 1.3, zc + 0.2), 0.015, DARK, seg=6)
            vc().cbox(CP['x0'] + 0.12, CP['x1'] - 0.1, 0.98, 1.0, z0 + 0.16, z1 - 0.16, '#f4f4f0')
        else:   # 膠裝機：鐵桌＋深色機台
            mesh('steel').box(CP['x0'], CP['x1'], 0.72, 0.76, z0 + 0.04, z1 - 0.04)
            for sx in (CP['x0'] + 0.05, CP['x1'] - 0.05):
                for zz in (z0 + 0.08, z1 - 0.08): ccyl(vm(), (sx, 0.0, zz), (sx, 0.72, zz), 0.02, STEEL, seg=6)
            vc().crbox(CP['x0'] + 0.1, CP['x1'] - 0.08, 0.76, 1.05, z0 + 0.14, z1 - 0.14, '#3a3f46', r=0.01)
            for k in range(8): vc().cbox(CP['x1'] - 0.12, CP['x1'] - 0.08, 0.86, 1.0, z0 + 0.18 + k * 0.07, z0 + 0.21 + k * 0.07, ('#b8262b', '#2b4f8c', '#f4f4f0', '#c9a227')[k % 4])
            vc().cbox(CP['x0'] + 0.05, CP['x1'] - 0.05, 0.1, 0.5, z0 + 0.1, z1 - 0.1, '#c9a878')   # 桌下的紙箱
    # 最裡面的大圖輸出機
    vc().crbox(PL['x0'], PL['x1'], 0.55, 1.05, PL['z0'], PL['z1'], WHITE, r=0.02); vc().cbox(PL['x0'] + 0.05, PL['x1'] - 0.05, 0.0, 0.55, PL['z0'] + 0.08, PL['z1'] - 0.08, GREY); vc().cbox(PL['x0'] + 0.1, PL['x1'] - 0.1, 0.9, 0.96, PL['z1'], PL['z1'] + 0.012, DARK)
    for i in range(4): ccyl(vc(), (PL['x1'] + 0.25 + i * 0.16, 0.0, PL['z0'] + 0.3), (PL['x1'] + 0.25 + i * 0.16, 1.2, PL['z0'] + 0.25), 0.06, ('#f4f4f0', '#e8e0c8', '#2f3338', '#f4f4f0')[i], seg=10)   # 立著的大圖紙捲
    # 長櫃台：白色抽屜櫃、白檯面＋木邊；南端圓角接東牆；檯面上電腦、標籤機、樣本架、一疊疊講義、盆栽
    x0, x1, z0, z1, h = CT['x0'], CT['x1'], CT['z0'], CT['z1'], CT['h']
    vc().cbox(x0 + 0.04, x1, 0.06, h - 0.05, z0, z1, WHITE); vc().crbox(x0 - 0.03, x1 + 0.02, h - 0.05, h, z0 - 0.02, z1 + 0.25, '#f4f1e8', r=0.015); mesh('wood').box(x0 - 0.04, x0 - 0.02, h - 0.05, h - 0.005, z0, z1 + 0.25)
    vc().cbox(x0 + 0.04, W / 2 - 0.45, 0.06, h - 0.05, z1, z1 + 0.25, WHITE); vc().crbox(x1, W / 2 - 0.45, h - 0.05, h, z1 - 0.05, z1 + 0.25, '#f4f1e8', r=0.015)
    for i in range(8): zz = z0 + 0.1 + i * (z1 - z0 - 0.2) / 8; vc().cbox(x0 + 0.03, x0 + 0.04, 0.1, h - 0.08, zz + 0.02, zz + (z1 - z0 - 0.2) / 8 - 0.02, '#e2e4e4'); vc().cbox(x0 + 0.02, x0 + 0.03, 0.55, 0.57, zz + 0.25, zz + 0.5, GREY)
    cz = J['clerk']['z']; vc().cbox(x1 - 0.2, x1 - 0.16, h + 0.15, h + 0.55, cz - 0.32, cz + 0.32, '#1f2023'); ccyl(vc(), (x1 - 0.18, h, cz), (x1 - 0.18, h + 0.16, cz), 0.03, '#1f2023', seg=6); vc().cbox(x0 + 0.12, x0 + 0.3, h, h + 0.025, cz - 0.24, cz + 0.2, '#1f2023')
    vc().crbox(x0 + 0.15, x0 + 0.45, h, h + 0.22, cz + 0.8, cz + 1.15, '#2a2d31', r=0.015)                                  # 標籤機
    for i in range(5): zz = z0 + 0.5 + i * 0.5; vc().cbox(x0 + 0.1, x0 + 0.42, h, h + 0.05 + (i % 3) * 0.03, zz, zz + 0.3, '#f4f4f0'); vc().cbox(x0 + 0.1, x0 + 0.42, h + 0.05 + (i % 3) * 0.03, h + 0.056 + (i % 3) * 0.03, zz, zz + 0.3, ('#d8dce8', '#e8d8d8', '#f4f4f0')[i % 3])
    for i in range(5):   # 裝訂樣本架：斜立的封面
        zz = z1 - 0.9 + i * 0.12; vc().poly([(x0 + 0.12, h, zz), (x0 + 0.5, h, zz), (x0 + 0.5, h + 0.42, zz - 0.14), (x0 + 0.12, h + 0.42, zz - 0.14)][::-1], ('#1f2a48', '#7a2a2a', '#d9c9a8', '#2f3338', '#f4f1e8')[i]); vc().poly([(x0 + 0.12, h, zz), (x0 + 0.5, h, zz), (x0 + 0.5, h + 0.42, zz - 0.14), (x0 + 0.12, h + 0.42, zz - 0.14)], '#e8e8e4')
    clathe(vc(), [(0.0, 0.0), (0.09, 0.0), (0.12, 0.2), (0.0, 0.2)], x0 + 0.3, h, z1 + 0.05, '#f4f1ea', seg=10); fern(x0 + 0.3, h + 0.32, z1 + 0.05, r=0.24, n=12)
    # 右牆鐵層架：整面彩色紙、紙箱
    sx0, sx1 = SV['x0'], SV['x1']; nb = 5; bw = (SV['z1'] - SV['z0']) / nb
    for i in range(nb + 1): zz = SV['z0'] + i * bw; vm().cbox(sx0, sx0 + 0.03, 0.0, SV['h'], zz - 0.015, zz + 0.015, STEEL)
    for y in (0.15, 0.6, 1.05, 1.5, 1.95, 2.38): vm().cbox(sx0, sx1, y - 0.02, y, SV['z0'], SV['z1'], STEEL)
    PAPER = ['#f4b8c8', '#b8d8f0', '#f4e6a0', '#c8e6b8', '#f4f4f0', '#f0c8a0', '#d8c8f0', '#a8d8d0']
    for j, y in enumerate((0.15, 0.6, 1.05, 1.5, 1.95)):
        for i in range(nb):
            for k in range(3):
                zz = SV['z0'] + i * bw + 0.06 + k * (bw - 0.12) / 3; hh = RR.uniform(0.16, 0.36)
                if j == 4 and k == 1: vc().cbox(sx0 + 0.05, sx1 - 0.02, y, y + 0.3, zz, zz + (bw - 0.12) / 3 - 0.03, '#c9a878'); continue
                vc().cbox(sx0 + 0.04, sx1 - 0.02, y, y + hh, zz, zz + (bw - 0.12) / 3 - 0.03, PAPER[(i * 3 + j * 2 + k) % 8])
    # 左牆：價目表、裝訂樣品、海報樣張（參考圖裁的）；玻璃門旁的盆栽
    xw = -W / 2 + 0.012
    for key, d in (('price', DC['priceBoard']), ('sample', DC['samplePoster']), ('campus', DC['campusPoster'])):
        vc().cbox(-W / 2, -W / 2 + 0.01, d['y0'] - 0.03, d['y1'] + 0.03, d['z0'] - 0.03, d['z1'] + 0.03, '#f4f4f0'); pic(key, [(xw, d['y0'], d['z1']), (xw, d['y0'], d['z0']), (xw, d['y1'], d['z0']), (xw, d['y1'], d['z1'])])
    clathe(vc(), [(0.0, 0.0), (0.16, 0.0), (0.2, 0.36), (0.0, 0.36)], -2.8, 0.0, 4.0, '#e8e0d0', seg=12); fern(-2.8, 0.75, 4.0, r=0.34, n=18)
    # 後牆：冷氣、布簾的門、紙箱；天花板：日光燈、裸露管線
    vc().crbox(-0.2, 0.9, 2.35, 2.65, -D / 2, -D / 2 + 0.24, '#f4f4f0', r=0.02)
    for i in range(8): a = 0.4 + i * 0.13; vc().cbox(a, a + 0.13, 0.05, 2.1, -D / 2 + 0.03 + (i % 2) * 0.02, -D / 2 + 0.05 + (i % 2) * 0.02, ('#c9c4b8', '#b8b2a4')[i % 2])
    for i in range(5): vc().cbox(-1.2 + (i % 3) * 0.45, -0.8 + (i % 3) * 0.45, (i // 3) * 0.36, (i // 3) * 0.36 + 0.34, -D / 2 + 0.06, -D / 2 + 0.46, '#c9a878')
    for zz in (-3.0, -0.6, 1.8, 3.9): vc().cbox(-1.3, 0.3, H - 0.07, H - 0.02, zz - 0.09, zz + 0.09, '#eceeee'); mesh('light').box(-1.22, 0.22, H - 0.095, H - 0.07, zz - 0.035, zz + 0.035)
    ccyl(vc(), (-W / 2 + 0.12, H - 0.25, -D / 2 + 0.2), (-W / 2 + 0.12, H - 0.25, D / 2 - 0.2), 0.03, '#e2e4e4', seg=8); ccyl(vc(), (-W / 2 + 0.2, H - 0.12, -D / 2 + 0.2), (-W / 2 + 0.2, H - 0.12, D / 2 - 0.2), 0.02, '#d6d9da', seg=6)


# ---------- 完成 ----------
for side, (m, d) in WALLS.items(): m.finish(root, props={'dir': d})
for key, mm in MM.items(): mm.finish(root, uv=key not in ('vc', 'vcm', 'light', 'glass'), smooth=key in ('vc', 'vcm'))
if SQ:
    m = Mesh('S_pics', M['pics']); lay = m.bm.loops.layers.uv.new('UVMap')
    for key, pts in SQ:
        u0, v0, u1, v1 = AUV[key]; f = m.bm.faces.new([m.bm.verts.new(p) for p in pts])
        for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[lay].uv = t
    m.finish(root, uv=False, merge=False)
if '--nosingle' not in ARGS: L.single_side(root, keep=r'glass', nodup=r'(ceil|lightpanel)')
tris = 0
for ob in bpy.data.objects:
    if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
info = L.export(OUT, gpu_instances=False)
L.write_json(OUT[:-4] + '.json', dict(info if isinstance(info, dict) else {}, tris_total=tris, walls=sorted(WALLS), note=f'GG-SHOPS3-ART-1110 {J["name"]} 室內'))
print(json.dumps({'TZ_SHOP': SHOP, 'tris': tris, 'walls': len(WALLS)}, ensure_ascii=False))
