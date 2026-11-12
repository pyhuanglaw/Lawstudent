"""汀州路／公館六間店的室內（GG-SHOPS3-ART-1110，X320；LAWWW2 帳號 A 2026-11-10）→ assets/models/env/second_ai/tz_<店>_interior.glb（＋.json）
使用者 2026-11-10 23:xx「六家的內部參考圖」（docs/art-rebuild/second_ai/ref/gg_shops6_1110/interior/int_<店>.webp，從店門口往內看）；規格 docs/handoff/user_specs/GG_SHOPS3_1110.md 第三節。
配置 src/data/tz_shops_layout.js（遊戲 src/tz_shops3d.js 讀同一份）。座標＝遊戲座標（x 往東、y 往上、z 往南；店面在 +z）。
接法：Z3.attachRoomGLB——外牆 WALL_<N|S|E|W>（extras dir＝朝室內，遊戲淡出）；其他照材質合併。
牆上的照片、菜單照片板是參考圖裁的（--ref <室內參考圖資料夾> 重做貼圖集；沒給就用 textures/gen/tz_<店>_int_atlas.jpg）。
六間：taimi（泰米村食）、xile（洗樂洗衣坊）、yindehao（印得好）、antai（安泰藥局）、xianguo（汀州鮮果）、rongendian（榮恩典文具社）。
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
CROPS = {'antai': {'sign': ([(285, 98), (1440, 270), (1437, 418), (272, 298)], 768, 112, '../concept/shop_antai.webp'), 'poster': ([(1488, 160), (1596, 135), (1596, 420), (1488, 405)], 224, 448)},
         'xianguo': {'mural': ([(88, 62), (400, 165), (400, 255), (88, 215)], 640, 224)},
         'yindehao': {'price': ([(237, 5), (527, 95), (527, 325), (237, 300)], 512, 300), 'sample': ([(540, 100), (660, 135), (660, 325), (540, 325)], 256, 256), 'campus': ([(668, 165), (732, 180), (732, 320), (668, 325)], 224, 256)},
         'dongnan': {'sign': ([(388, 243), (1426, 172), (1429, 327), (388, 369)], 960, 150, '../../tingzhou_1110/concept/shop_dongnan_dalian.webp')},
         'liantong': {'sign': ([(468, 248), (1345, 223), (1345, 369), (468, 385)], 992, 160, '../../tingzhou_1110/concept/shop_tingzhou_liantong.webp')},
         'keju': {'menu': ([(1208, 483), (1304, 483), (1304, 702), (1208, 702)], 208, 474, '../../tingzhou_1110/concept/shop_kejuyunnan.webp'), 'sign': ([(461, 255), (1325, 202), (1330, 327), (461, 380)], 704, 128, '../../tingzhou_1110/concept/shop_kejuyunnan.webp')},
         'yuehaochi': {'menu': ([(1183, 430), (1301, 430), (1301, 692), (1183, 692)], 216, 480, '../../tingzhou_1110/concept/shop_yuehaochi.webp'), 'sign': ([(527, 255), (1295, 170), (1304, 337), (527, 395)], 704, 150, '../../tingzhou_1110/concept/shop_yuehaochi.webp')},
         'taimi': {'menu': ([(1308, 148), (1672, 25), (1672, 458), (1308, 422)], 768, 360), 'photo1': ([(165, 197), (322, 243), (322, 405), (165, 418)], 448, 256), 'photo2': ([(405, 222), (458, 232), (458, 385), (405, 390)], 320, 256)}}
def make_atlas():
    out = os.path.join(GEN, f'tz_{SHOP}_int_atlas.jpg'); meta = out[:-4] + '.json'
    if REF:
        _name = {'xianguo': 'tingzhou_xianguo'}.get(SHOP, SHOP); _mp = os.path.join(REF, f'int_{_name}.webp'); im_main = Image.open(_mp).convert('RGB') if os.path.exists(_mp) else None; items = []   # 汀州路五間沒有室內參考圖（只從外觀概念圖裁）
        for k, cv in CROPS[SHOP].items():
            quad, w, h = cv[:3]; im0 = Image.open(os.path.join(REF, cv[3])).convert('RGB') if len(cv) > 3 else im_main   # 第四個＝別的參考圖（相對於 --ref 的資料夾）
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
    'wall': L.flat('tzs_wall', J.get('wallColor', '#f4f5f4'), rough=0.9),   # 第 2 版（BB 11-10 23:51：六間共同的問題＝牆面那張有髒污斑塊的灰泥貼圖；使用者的室內圖和規格都是乾淨的牆）：全部改乾淨的平塗
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
# 機器上的字牌（BB_255：看不出是什麼機器）：黑體字畫成一張小貼圖（每一塊 256×80），材質 tzs_<店>_labels
LABELS = {'xile': [('coin', '兌幣機', '#1f4f9a', '#ffffff'), ('soap', '洗衣精', '#e8f2fa', '#1f4f9a'), ('coin_w', '兌幣機  10 元', '#ffffff', '#1f4f9a'), ('soap_w', '洗衣精・柔軟精', '#ffffff', '#1f4f9a')],
          'yindehao': [('cut', '裁紙機', '#f2c230', '#1d1f22'), ('bind', '膠裝機', '#f2c230', '#1d1f22'), ('pc', '自助列印電腦', '#2c3c5a', '#ffffff'), ('pc_sub', '隨身碟・雲端列印', '#ffffff', '#2c3c5a')]}.get(SHOP, [])
LQ = []; LUV = {}
if LABELS:
    from PIL import ImageDraw, ImageFont
    _n = len(LABELS); _im = Image.new('RGB', (256, 80 * _n), (255, 255, 255)); _d = ImageDraw.Draw(_im)
    for _i, (_k, _t, _bg, _fg) in enumerate(LABELS):
        _d.rectangle([0, _i * 80, 255, _i * 80 + 79], fill=_bg); _d.rectangle([2, _i * 80 + 2, 253, _i * 80 + 77], outline=_fg, width=2); _px = 56
        while _px > 10:
            _f = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', _px); _b = _d.textbbox((0, 0), _t, font=_f)
            if _b[2] - _b[0] <= 232: break
            _px -= 2
        _d.text((128 - (_b[0] + _b[2]) / 2, _i * 80 + 40 - (_b[1] + _b[3]) / 2), _t, font=_f, fill=_fg); LUV[_k] = (0.0, 1 - (_i + 1) / _n, 1.0, 1 - _i / _n)
    os.makedirs(GEN, exist_ok=True); _lp = os.path.join(GEN, f'tz_{SHOP}_labels.png'); _im.save(_lp)
    _lm = bpy.data.materials.new(f'tzs_{SHOP}_labels'); _lm.use_nodes = True; _lt = _lm.node_tree.nodes.new('ShaderNodeTexImage'); _lt.image = bpy.data.images.load(_lp); _lm.node_tree.links.new(_lt.outputs['Color'], _lm.node_tree.nodes['Principled BSDF'].inputs['Base Color']); _lm.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.6; M['labels'] = _lm
def label(key, pts): LQ.append((key, [g2b(*p) for p in pts]))   # 左下、右下、右上、左上（從看的人那一邊）
PRE = ''   # 節點分組（禮貌生財的書房：'STUDY:' → 網格叫 STUDY_<材質>，遊戲照名字整組顯示／隱藏）
def mesh(key, cm=False):
    k = PRE + key
    if k not in MM: MM[k] = (CMesh if cm else Mesh)((PRE[:-1] + '_' if PRE else 'S_') + key, M[key])
    return MM[k]
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
mesh('floor').box(-W / 2, W / 2, -0.1, 0.0, -D / 2, D / 2)
# 天花板（TZS-CEIL-1111，LAWWW／BB 11-11 03:15：禮貌生財玩家走到房間後半，跟隨鏡頭 y 3.21 高過天花板 3.0，看到天花板的「上表面」＝整個畫面一片米色；
#   原本是一塊 10 cm 厚、六個面都有的板子）：只留朝下的那一面（單面，從上面看不到）、節點叫 CEIL_ceil——Z3.attachRoomGLB 的 ceilHide 會在鏡頭高過天花板時把 CEIL_* 整組藏起來；
#   吸頂的燈具也放進 CEIL_*（下面各間用 PRE='CEIL:' 包起來的那幾行），不然天花板藏了、燈具還浮在半空擋住房間
PRE = 'CEIL:'
mesh('ceil').quad([(-W / 2, H, -D / 2), (W / 2, H, -D / 2), (W / 2, H, D / 2), (-W / 2, H, D / 2)])   # 逆時針（從下面看）＝法線朝下
PRE = ''
wall('N', [0, 0, 1]).box(-W / 2, W / 2, 0, H, -D / 2 - T, -D / 2); wall('W', [1, 0, 0]).box(-W / 2 - T, -W / 2, 0, H, -D / 2, D / 2); wall('E', [-1, 0, 0]).box(W / 2, W / 2 + T, 0, H, -D / 2, D / 2)
FR = J['front']; zS = D / 2; ws = wall('S', [0, 0, -1]); dx0, dx1, dh = FR['door']; sill, head = FR['sill'], FR['head']
cuts = sorted([(a, b, sill, head) for a, b in FR['windows']] + [(dx0, dx1, 0.0, dh)]); x = -W / 2
for (a, b, y0, y1) in cuts:
    ws.box(x, a, 0, H, zS, zS + T); ws.box(a, b, y1, H, zS, zS + T)
    if y0 > 0: ws.box(a, b, 0, y0, zS, zS + T)
    x = b
ws.box(x, W / 2, 0, H, zS, zS + T)
FRAME = '#3a2416' if SHOP in ('taimi', 'limao', 'yuehaochi', 'keju') else '#c4c8cb'
# SHOP-INTERIOR-VIEW-1112（BB 11-12：進門後跟隨鏡頭在正面牆外面，牆淡出了，窗框、門框、布簾還留在半空擋住畫面）：正面牆上的零件（窗框、窗台、門框、布簾、玻璃、玻璃上的色帶）
#   放進 WALL_Sfix_*（名字含 WALL_＝遊戲 attachRoomGLB 跟著牆一起淡出；dir、at 照正面牆），不再留在一般的 S_vc
PRE = 'WALL_Sfix:'
for (a, b) in FR['windows']:
    mesh('glass').quad([(a, sill, zS + 0.08), (b, sill, zS + 0.08), (b, head, zS + 0.08), (a, head, zS + 0.08)])
    for xx in (a, (a + b) / 2, b): vc().cbox(xx - 0.03, xx + 0.03, sill, head, zS + 0.04, zS + 0.12, FRAME)
    for yy in (sill, head): vc().cbox(a, b, yy - 0.03, yy + 0.03, zS + 0.04, zS + 0.12, FRAME)
    vc().cbox(a, b, sill - 0.05, sill, zS - 0.12, zS + 0.02, '#5a3a22')   # 窗台
if not FR.get('open'):
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
PRE = ''
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
    # 蘭花（SHOP-INTERIOR-VIEW-1112，使用者 11-12 截圖「一堆紫紅色球」：第 1 版是七顆洋紅色的球浮在盆子上面，沒有莖和葉，看起來像缺材質）：
    #   兩支彎彎的綠色花梗、基部三片厚葉子、花是小小扁扁的淺粉色（中心深一點），沿著花梗排
    ox, oy, oz = CT['x0'] + 0.5, CT['h'] + 0.12, (CT['z0'] + CT['z1']) / 2
    for k in range(3): a_ = k * 2.1 + 0.4; vc().poly([(ox, oy, oz), (ox + math.cos(a_) * 0.2 - math.sin(a_) * 0.045, oy + 0.05, oz + math.sin(a_) * 0.2 + math.cos(a_) * 0.045), (ox + math.cos(a_) * 0.26, oy + 0.02, oz + math.sin(a_) * 0.26), (ox + math.cos(a_) * 0.2 + math.sin(a_) * 0.045, oy + 0.05, oz + math.sin(a_) * 0.2 - math.cos(a_) * 0.045)], '#3f6a34'); vc().poly([(ox, oy, oz), (ox + math.cos(a_) * 0.2 + math.sin(a_) * 0.045, oy + 0.05, oz + math.sin(a_) * 0.2 - math.cos(a_) * 0.045), (ox + math.cos(a_) * 0.26, oy + 0.02, oz + math.sin(a_) * 0.26), (ox + math.cos(a_) * 0.2 - math.sin(a_) * 0.045, oy + 0.05, oz + math.sin(a_) * 0.2 + math.cos(a_) * 0.045)], '#35592c')
    for (sx_, n_) in ((-1, 4), (1, 3)):
        pts = [(ox, oy, oz), (ox + sx_ * 0.02, oy + 0.2, oz), (ox + sx_ * 0.07, oy + 0.34, oz + 0.01), (ox + sx_ * 0.15, oy + 0.4, oz + 0.02)]
        for p0, p1 in zip(pts, pts[1:]): ccyl(vc(), p0, p1, 0.005, '#5a7a3a', seg=4)
        for i in range(n_):
            t = 0.45 + i * 0.55 / n_; fx = ox + sx_ * (0.03 + 0.13 * t * t); fy = oy + 0.22 + 0.19 * t - 0.03 * (t > 0.8); fz = oz + 0.02 + (i % 2) * 0.012
            blob(fx, fy, fz, 0.026, ('#f0c6da', '#e8b4cf')[i % 2], sy=0.55); blob(fx, fy, fz + 0.012, 0.009, '#b8508a')
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
    PRE = 'CEIL:'   # 吸頂的燈具：鏡頭高過天花板時一起藏
    for i in range(6): z = -2.0 + i * 1.2; ccyl(vc(), (-3.18, H - 0.06, z), (-3.3, H - 0.24, z), 0.04, '#2b2b2b', seg=8); mesh('light').cyl((-3.3, H - 0.245, z), (-3.31, H - 0.255, z), 0.033, seg=8)
    PRE = ''


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
    # 第 2 版（BB_255：門邊那台看不出是兌幣機還是洗衣精販賣機——兩樣都要有、上面有字）：兩台分開、各自的樣子和字牌
    zm = (MC['z0'] + MC['z1']) / 2; xw = -W / 2 + 0.012
    cx1 = MC['x0'] + 0.3; cz0, cz1 = MC['z0'], zm - 0.04                                                   # 兌幣機：落地的不鏽鋼櫃、藍色字牌、紙鈔口、退幣口、下面的取幣槽
    vm().crbox(MC['x0'], cx1, 0.0, 1.75, cz0, cz1, STEEL, r=0.012); vc().cbox(cx1, cx1 + 0.006, 1.5, 1.72, cz0 + 0.02, cz1 - 0.02, '#1f4f9a'); label('coin', [(cx1 + 0.008, 1.53, cz1 - 0.03), (cx1 + 0.008, 1.53, cz0 + 0.03), (cx1 + 0.008, 1.69, cz0 + 0.03), (cx1 + 0.008, 1.69, cz1 - 0.03)])
    vc().cbox(cx1, cx1 + 0.008, 1.22, 1.4, cz0 + 0.06, cz1 - 0.06, '#1d1f22'); vc().cbox(cx1 + 0.008, cx1 + 0.012, 1.3, 1.32, cz0 + 0.1, cz1 - 0.1, '#8fd0e8')                         # 螢幕、紙鈔口
    vc().cbox(cx1, cx1 + 0.02, 1.02, 1.1, cz0 + 0.1, cz1 - 0.1, '#2a2f36'); ccyl(vm(), (cx1, 0.9, (cz0 + cz1) / 2), (cx1 + 0.02, 0.9, (cz0 + cz1) / 2), 0.03, '#d8dadc', seg=10)         # 投幣口、退幣鈕
    vc().cbox(cx1, cx1 + 0.05, 0.55, 0.72, cz0 + 0.06, cz1 - 0.06, '#1d1f22'); vc().cbox(cx1 + 0.03, cx1 + 0.06, 0.55, 0.6, cz0 + 0.06, cz1 - 0.06, STEEL_D)                           # 取幣槽
    label('coin_w', [(xw, 1.95, cz1 + 0.02), (xw, 1.95, cz0 - 0.02), (xw, 2.08, cz0 - 0.02), (xw, 2.08, cz1 + 0.02)])
    vz0, vz1 = zm + 0.02, MC['z1']                                                                          # 洗衣精販賣機：白色、玻璃窗裡三排瓶子、上面淺藍字牌、下面取物口
    vc().crbox(MC['x0'], MC['x1'], 0.0, 1.9, vz0, vz1, '#f4f6f6', r=0.012); mesh('glass').quad([(MC['x1'] + 0.004, 0.95, vz1 - 0.04), (MC['x1'] + 0.004, 0.95, vz0 + 0.04), (MC['x1'] + 0.004, 1.62, vz0 + 0.04), (MC['x1'] + 0.004, 1.62, vz1 - 0.04)])
    vc().cbox(MC['x1'] - 0.14, MC['x1'] + 0.002, 0.95, 1.62, vz0 + 0.04, vz1 - 0.04, '#dfe6ea')
    for j in range(3):
        vc().cbox(MC['x1'] - 0.13, MC['x1'], 0.95 + j * 0.22, 0.965 + j * 0.22, vz0 + 0.04, vz1 - 0.04, '#b9bdc1')
        for i in range(3): ccyl(vc(), (MC['x1'] - 0.06, 0.965 + j * 0.22, vz0 + 0.09 + i * 0.085), (MC['x1'] - 0.06, 1.11 + j * 0.22, vz0 + 0.09 + i * 0.085), 0.028, ('#e8a8c8', '#5aa8e0', '#f4d23a')[(i + j) % 3], seg=8); ccyl(vc(), (MC['x1'] - 0.06, 1.11 + j * 0.22, vz0 + 0.09 + i * 0.085), (MC['x1'] - 0.06, 1.14 + j * 0.22, vz0 + 0.09 + i * 0.085), 0.014, '#f4f4f0', seg=6)
    label('soap', [(MC['x1'] + 0.006, 1.68, vz1 - 0.03), (MC['x1'] + 0.006, 1.68, vz0 + 0.03), (MC['x1'] + 0.006, 1.84, vz0 + 0.03), (MC['x1'] + 0.006, 1.84, vz1 - 0.03)])
    vc().cbox(MC['x1'], MC['x1'] + 0.012, 0.3, 0.5, vz0 + 0.06, vz1 - 0.06, '#2a2f36'); vc().cbox(MC['x1'], MC['x1'] + 0.01, 0.62, 0.86, vz1 - 0.12, vz1 - 0.04, '#b9bdc1')            # 取物口、投幣口
    label('soap_w', [(xw, 1.95, vz1 + 0.02), (xw, 1.95, vz0 - 0.02), (xw, 2.08, vz0 - 0.02), (xw, 2.08, vz1 + 0.02)])
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
        PRE = 'CEIL:'   # 吸頂的燈具：鏡頭高過天花板時一起藏
        for zz in (-2.6, 0.0, 2.6): vc().cbox(xx - 0.7, xx + 0.7, H - 0.07, H - 0.02, zz - 0.09, zz + 0.09, '#eceeee'); mesh('light').box(xx - 0.62, xx + 0.62, H - 0.095, H - 0.07, zz - 0.035, zz + 0.035)
        PRE = ''
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
            ccyl(vc(), (CP['x1'] + 0.05, 1.3, zc + 0.2), (CP['x1'] + 0.05, 1.3, zc + 0.3), 0.03, '#c9302a', seg=8); vc().cbox(CP['x0'] + 0.1, CP['x0'] + 0.14, 0.98, 1.1, z0 + 0.14, z1 - 0.14, '#f2c230')   # 紅色握把、黃色安全擋板（第 2 版：看得出是裁紙機）
            for k in range(6): vc().cbox(CP['x0'] + 0.16 + k * 0.08, CP['x0'] + 0.165 + k * 0.08, 0.981, 0.983, z0 + 0.14, z1 - 0.14, '#8a8f98')                                                  # 檯面的刻度線
            label('cut', [(CP['x1'] + 0.008, 0.48, zc + 0.3), (CP['x1'] + 0.008, 0.48, zc - 0.3), (CP['x1'] + 0.008, 0.67, zc - 0.3), (CP['x1'] + 0.008, 0.67, zc + 0.3)])
        else:   # 膠裝機：鐵桌＋深色機台
            mesh('steel').box(CP['x0'], CP['x1'], 0.72, 0.76, z0 + 0.04, z1 - 0.04)
            for sx in (CP['x0'] + 0.05, CP['x1'] - 0.05):
                for zz in (z0 + 0.08, z1 - 0.08): ccyl(vm(), (sx, 0.0, zz), (sx, 0.72, zz), 0.02, STEEL, seg=6)
            vc().crbox(CP['x0'] + 0.1, CP['x1'] - 0.08, 0.76, 1.05, z0 + 0.14, z1 - 0.14, '#3a3f46', r=0.01)
            for k in range(8): vc().cbox(CP['x1'] - 0.12, CP['x1'] - 0.08, 0.86, 1.0, z0 + 0.18 + k * 0.07, z0 + 0.21 + k * 0.07, ('#b8262b', '#2b4f8c', '#f4f4f0', '#c9a227')[k % 4])
            vc().cbox(CP['x0'] + 0.05, CP['x1'] - 0.08, 0.05, 0.42, z0 + 0.1, z1 - 0.1, '#c9a878')   # 桌下的紙箱
            vc().cbox(CP['x0'] + 0.14, CP['x1'] - 0.12, 1.05, 1.12, z0 + 0.2, z1 - 0.2, '#2a2d31'); vc().cbox(CP['x1'] - 0.1, CP['x1'] - 0.02, 0.8, 0.86, zc - 0.12, zc + 0.12, '#f4f4f0')        # 夾書的槽、出來的一本
            label('bind', [(CP['x1'] + 0.008, 0.48, zc + 0.3), (CP['x1'] + 0.008, 0.48, zc - 0.3), (CP['x1'] + 0.008, 0.67, zc - 0.3), (CP['x1'] + 0.008, 0.67, zc + 0.3)])
    # 最裡面的大圖輸出機
    vc().crbox(PL['x0'], PL['x1'], 0.55, 1.05, PL['z0'], PL['z1'], WHITE, r=0.02); vc().cbox(PL['x0'] + 0.05, PL['x1'] - 0.05, 0.0, 0.55, PL['z0'] + 0.08, PL['z1'] - 0.08, GREY); vc().cbox(PL['x0'] + 0.1, PL['x1'] - 0.1, 0.9, 0.96, PL['z1'], PL['z1'] + 0.012, DARK)
    for i in range(4): ccyl(vc(), (PL['x1'] + 0.25 + i * 0.16, 0.0, PL['z0'] + 0.3), (PL['x1'] + 0.25 + i * 0.16, 1.2, PL['z0'] + 0.25), 0.06, ('#f4f4f0', '#e8e0c8', '#2f3338', '#f4f4f0')[i], seg=10)   # 立著的大圖紙捲
    # 第 2 版（BB_255：沒看到給客人用的電腦工作站）：後牆前一張自助列印的電腦桌（兩台螢幕、鍵盤、滑鼠、讀卡機、兩張圓凳）、牆上的字牌
    PCD = J.get('pc')
    if PCD:
        px, pz, pw_, pd = PCD['x'], PCD['z'], PCD['w'], PCD['d']; zb = -D / 2
        mesh('wood').rbox(px - pw_ / 2, px + pw_ / 2, 0.72, 0.76, pz - pd / 2, pz + pd / 2, r=0.01, seg=2)
        for sx in (-1, 1): vc().cbox(px + sx * (pw_ / 2 - 0.04) - 0.02, px + sx * (pw_ / 2 - 0.04) + 0.02, 0.0, 0.72, pz - pd / 2 + 0.04, pz + pd / 2 - 0.04, '#d8dadc')
        for sx in (-0.33, 0.33):
            cx = px + sx; vc().crbox(cx - 0.27, cx + 0.27, 0.9, 1.24, pz - 0.2, pz - 0.17, '#1d1f22', r=0.008); vc().cbox(cx - 0.25, cx + 0.25, 0.92, 1.22, pz - 0.17, pz - 0.166, '#8fc4e8' if sx < 0 else '#e8eef4')
            vc().cbox(cx - 0.03, cx + 0.03, 0.76, 0.92, pz - 0.2, pz - 0.18, '#2a2d31'); vc().cbox(cx - 0.1, cx + 0.1, 0.76, 0.775, pz - 0.26, pz - 0.12, '#2a2d31')
            vc().cbox(cx - 0.2, cx + 0.2, 0.76, 0.78, pz + 0.0, pz + 0.14, '#e8eaea'); vc().crbox(cx + 0.24, cx + 0.3, 0.76, 0.79, pz + 0.03, pz + 0.13, '#e8eaea', r=0.01)
        vc().cbox(px - 0.06, px + 0.06, 0.76, 0.8, pz + 0.16, pz + 0.24, '#2a2d31')                              # 讀卡機
        for sx in (-0.33, 0.33): ccyl(vc(), (px + sx, 0.42, pz + 0.62), (px + sx, 0.46, pz + 0.62), 0.16, '#2c3c5a', seg=14); ccyl(vm(), (px + sx, 0.0, pz + 0.62), (px + sx, 0.42, pz + 0.62), 0.025, '#b9bdc1', seg=8); ccyl(vm(), (px + sx, 0.0, pz + 0.62), (px + sx, 0.02, pz + 0.62), 0.14, '#b9bdc1', seg=12)
        lx = px - 0.5   # 字牌往左移：右邊是後牆的布簾
        label('pc', [(lx - 0.5, 1.55, zb + 0.012), (lx + 0.5, 1.55, zb + 0.012), (lx + 0.5, 1.86, zb + 0.012), (lx - 0.5, 1.86, zb + 0.012)]); label('pc_sub', [(lx - 0.4, 1.38, zb + 0.012), (lx + 0.4, 1.38, zb + 0.012), (lx + 0.4, 1.53, zb + 0.012), (lx - 0.4, 1.53, zb + 0.012)])
    PS = J.get('paperStack')   # 客用電腦桌和長櫃台北端之間的角落（LAWWW 11-11 trapFix：這一塊導航擋起來）：一疊疊影印紙箱＋垃圾桶，看得出為什麼過不去
    if PS:
        bx0, bx1, bz0, bz1 = PS['x0'], PS['x1'], PS['z0'], PS['z1']; bw = min(0.46, bx1 - bx0 - 0.04); bd = 0.3; nrow = max(1, int((bz1 - bz0 - 0.34) / (bd + 0.02)))
        for r_ in range(nrow):
            z0_ = bz0 + 0.02 + r_ * (bd + 0.02); x0_ = bx0 + 0.02 + (r_ % 2) * 0.03
            for k in range(3 - (r_ % 2)):
                y0_ = k * 0.26; vc().cbox(x0_, x0_ + bw, y0_, y0_ + 0.25, z0_, z0_ + bd, ('#f4f2ea', '#eeeadf')[(k + r_) % 2])
                vc().cbox(x0_ + 0.05, x0_ + bw - 0.05, y0_ + 0.07, y0_ + 0.18, z0_ + bd, z0_ + bd + 0.003, ('#2f5a9a', '#c0392b', '#2f8a5a')[(k + r_) % 3]); vc().cbox(x0_ - 0.003, x0_, y0_ + 0.07, y0_ + 0.18, z0_ + 0.05, z0_ + bd - 0.05, ('#2f5a9a', '#c0392b', '#2f8a5a')[(k + r_) % 3])   # 紙箱的色標（朝南、朝西各一張）
                vc().cbox(x0_ + bw / 2 - 0.025, x0_ + bw / 2 + 0.025, y0_ + 0.25, y0_ + 0.252, z0_, z0_ + bd, '#c9a878')                                                                              # 封箱膠帶
        tx, tz = (bx0 + bx1) / 2, bz1 - 0.17                                                                                                                                                         # 垃圾桶（灰、套著半透明袋的白邊）
        ccyl(vc(), (tx, 0.0, tz), (tx, 0.42, tz), 0.12, '#6f757b', seg=12, r2=0.15); ccyl(vc(), (tx, 0.42, tz), (tx, 0.45, tz), 0.158, '#e6e8ea', seg=12)
        for k in range(3): blob(tx - 0.04 + k * 0.04, 0.43, tz - 0.03 + (k % 2) * 0.05, 0.05, ('#f4f2ea', '#e8e4d8', '#dfe6ee')[k], sy=0.7)
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
    PRE = 'CEIL:'   # 吸頂的燈具：鏡頭高過天花板時一起藏
    for zz in (-3.0, -0.6, 1.8, 3.9): vc().cbox(-1.3, 0.3, H - 0.07, H - 0.02, zz - 0.09, zz + 0.09, '#eceeee'); mesh('light').box(-1.22, 0.22, H - 0.095, H - 0.07, zz - 0.035, zz + 0.035)
    PRE = ''
    ccyl(vc(), (-W / 2 + 0.12, H - 0.25, -D / 2 + 0.2), (-W / 2 + 0.12, H - 0.25, D / 2 - 0.2), 0.03, '#e2e4e4', seg=8); ccyl(vc(), (-W / 2 + 0.2, H - 0.12, -D / 2 + 0.2), (-W / 2 + 0.2, H - 0.12, D / 2 - 0.2), 0.02, '#d6d9da', seg=6)


# ---------- 公館三間共用：貨架上的東西 ----------
def goods(x0, x1, y, z0, z1, cols, hmin=0.1, hmax=0.22, along='z', step=0.11, depth=None):
    """一層貨架上的一排盒子、瓶子（沿 z 或沿 x 排；每個顏色高度不一樣）"""
    a0, a1 = (z0, z1) if along == 'z' else (x0, x1); a = a0 + 0.02
    while a + step * 0.8 < a1:
        w_ = step * RR.uniform(0.7, 0.95); hh = RR.uniform(hmin, hmax); col = RR.choice(cols)
        if along == 'z': vc().cbox(x0 + 0.02, x1 - 0.02, y, y + hh, a, a + w_, col)
        else: vc().cbox(a, a + w_, y, y + hh, z0 + 0.02, z1 - 0.02, col)
        a += step
def gondola(g, cols_by_level, body='#f1f0ea', levels=(0.25, 0.65, 1.05, 1.42), style='metal', fill=None):
    """中間的雙面貨架：底座、背板、一層層層板＋商品（兩面都有）"""
    x0, x1, z0, z1, h = g['x0'], g['x1'], g['z0'], g['z1'], g['h']; long_z = (z1 - z0) > (x1 - x0)
    if style == 'wood': mesh('wood').box(x0, x1, 0.0, 0.14, z0, z1)
    else: vc().cbox(x0, x1, 0.0, 0.14, z0, z1, body)
    if long_z:
        xm = (x0 + x1) / 2; vc().cbox(xm - 0.02, xm + 0.02, 0.14, h, z0, z1, body)
        for zz in (z0, z1 - 0.04): vc().cbox(x0 + 0.05, x1 - 0.05, 0.14, h, zz, zz + 0.04, body)
        for i, y in enumerate(levels):
            (mesh('wood').box(x0, x1, y - 0.025, y, z0, z1) if style == 'wood' else vc().cbox(x0, x1, y - 0.025, y, z0, z1, body))
            if fill: fill(x0, xm - 0.02, y, z0 + 0.05, z1 - 0.05, 'z', i); fill(xm + 0.02, x1, y, z0 + 0.05, z1 - 0.05, 'z', i + 2); continue
            goods(x0, xm - 0.02, y, z0 + 0.05, z1 - 0.05, cols_by_level[i % len(cols_by_level)]); goods(xm + 0.02, x1, y, z0 + 0.05, z1 - 0.05, cols_by_level[(i + 1) % len(cols_by_level)])
    else:
        zm = (z0 + z1) / 2; vc().cbox(x0, x1, 0.14, h, zm - 0.02, zm + 0.02, body)
        for xx in (x0, x1 - 0.04): vc().cbox(xx, xx + 0.04, 0.14, h, z0 + 0.05, z1 - 0.05, body)
        for i, y in enumerate(levels):
            (mesh('wood').box(x0, x1, y - 0.025, y, z0, z1) if style == 'wood' else vc().cbox(x0, x1, y - 0.025, y, z0, z1, body))
            if fill: fill(x0 + 0.05, x1 - 0.05, y, z0, zm - 0.02, 'x', i); fill(x0 + 0.05, x1 - 0.05, y, zm + 0.02, z1, 'x', i + 2); continue
            goods(x0 + 0.05, x1 - 0.05, y, z0, zm - 0.02, cols_by_level[i % len(cols_by_level)], along='x'); goods(x0 + 0.05, x1 - 0.05, y, zm + 0.02, z1, cols_by_level[(i + 1) % len(cols_by_level)], along='x')
def tubes(rows, x0=-1.5, x1=1.5, grid=True):
    """天花板的日光燈；grid＝輕鋼架格柵天花板的線。整組放進 CEIL_*（鏡頭高過天花板時遊戲一起藏）"""
    global PRE
    PRE = 'CEIL:'
    if grid:
        for k in range(int(W / 1.2) + 1): xx = -W / 2 + k * 1.2; vc().cbox(xx - 0.012, xx + 0.012, H - 0.012, H - 0.004, -D / 2, D / 2, '#d9dad6')
        for k in range(int(D / 1.2) + 1): zz = -D / 2 + k * 1.2; vc().cbox(-W / 2, W / 2, H - 0.012, H - 0.004, zz - 0.012, zz + 0.012, '#d9dad6')
    for zz in rows:
        for xx in (x0, x1): vc().cbox(xx - 0.62, xx + 0.62, H - 0.06, H - 0.015, zz - 0.11, zz + 0.11, '#eceeee'); mesh('light').box(xx - 0.58, xx + 0.58, H - 0.085, H - 0.06, zz - 0.03, zz + 0.03); mesh('light').box(xx - 0.58, xx + 0.58, H - 0.085, H - 0.06, zz + 0.05, zz + 0.08)
    PRE = ''

def pharma(x0, x1, y, z0, z1, along='z', k=0):
    """藥局貨架的一層（第 2 版；BB 11-10 23:51：一塊一塊的色塊看起來像書店——參考圖是藥盒、瓶罐、口罩）：一段一段排——
    白色藥盒（同一段同一種、腰上一條顏色帶）、藥瓶（白／棕／藍瓶身＋瓶蓋）、口罩盒（寬扁的淺藍盒＋白帶）、小盒的眼藥水藥膏（矮）"""
    BAND = ['#2f6fb0', '#3f8a5a', '#c94a4a', '#e08a2a', '#7a5ab0', '#1f9a9a', '#d8a020']; a0, a1 = (z0, z1) if along == 'z' else (x0, x1); a = a0 + 0.02; run = k
    def box(p0, p1, h, col, band=None, bh=(0.5, 0.72)):
        if along == 'z':
            vc().cbox(x0 + 0.03, x1 - 0.03, y, y + h, p0, p1, col)
            if band: vc().cbox(x0 + 0.027, x1 - 0.027, y + h * bh[0], y + h * bh[1], p0 - 0.002, p1 + 0.002, band)
        else:
            vc().cbox(p0, p1, y, y + h, z0 + 0.03, z1 - 0.03, col)
            if band: vc().cbox(p0 - 0.002, p1 + 0.002, y + h * bh[0], y + h * bh[1], z0 + 0.027, z1 - 0.027, band)
    def bottle(pc, r, h, col, cap):
        for d in (0.5,):
            px, pz = ((x0 + (x1 - x0) * d, pc) if along == 'z' else (pc, z0 + (z1 - z0) * d))
            ccyl(vc(), (px, y, pz), (px, y + h, pz), r, col, seg=6, caps=False); ccyl(vc(), (px, y + h, pz), (px, y + h + 0.03, pz), r * 0.66, cap, seg=6)
    while a < a1 - 0.08:
        kind = ('box', 'bottle', 'box', 'mask', 'small', 'box', 'bottle')[run % 7]; L_ = RR.uniform(0.38, 0.62); e = min(a1 - 0.02, a + L_); band = BAND[(run * 3 + k) % len(BAND)]
        if kind == 'box':
            w = RR.choice((0.11, 0.13, 0.15)); h = RR.uniform(0.11, 0.16)
            while a + w <= e: box(a, a + w - 0.006, h, '#f6f5f0', band); a += w
        elif kind == 'bottle':
            r = RR.choice((0.036, 0.042)); h = RR.uniform(0.11, 0.16); col, cap = RR.choice((('#f6f5f0', '#2f6fb0'), ('#7a4a2a', '#f4f4f0'), ('#f6f5f0', '#3f8a5a'), ('#3f6a9a', '#f4f4f0')))
            while a + 2 * r <= e: bottle(a + r, r, h, col, cap); a += 2 * r + 0.03
        elif kind == 'mask':
            while a + 0.2 <= e:
                for j in range(2): box(a, a + 0.19, 0.085, '#cfe2f2' if j == 0 else '#dce9f4', '#f6f5f0', bh=(0.3, 0.7)) if j == 0 else (vc().cbox(x0 + 0.04, x1 - 0.04, y + 0.086, y + 0.166, a + 0.004, a + 0.186, '#dce9f4') if along == 'z' else vc().cbox(a + 0.004, a + 0.186, y + 0.086, y + 0.166, z0 + 0.04, z1 - 0.04, '#dce9f4'))
                a += 0.2
        else:
            w = 0.09; h = RR.uniform(0.05, 0.075)
            while a + w <= e: box(a, a + w - 0.006, h, RR.choice(('#fff2c8', '#e8f0e0', '#f6e6e0'))); a += w
        a = e + 0.03; run += 1


# ---------- 安泰藥局 ----------
if SHOP == 'antai':
    CT, BR, WC, BP, BK = J['counter'], J['backroom'], J['wallCase'], J['bpTable'], J['bookRack']
    GREEN = '#1f5a3a'; MED = [['#f4f4f0', '#dfe8f4', '#2f6fb0', '#f0e2a0', '#e8eef2'], ['#e8f0e0', '#f4f4f0', '#3f8a5a', '#f4d8a0', '#c9d8ee'], ['#f6e6e0', '#f4f4f0', '#b8503a', '#e6d8f0', '#fff2c8'], ['#8a4a2a', '#f4f4f0', '#5a3a22', '#e8e0c8', '#c9a23a']]
    for g in J['gondolas']: gondola(g, MED, fill=pharma)
    # 藥師櫃台（白色、深綠踢腳）：收銀螢幕、筆筒；後面整面藥品櫃、上面白底綠字招牌（外觀那一塊：藥罐圖示，沒有十字）
    vc().cbox(CT['x0'], CT['x1'], 0.1, CT['h'] - 0.04, CT['z0'], CT['z1'], '#f1f0ea'); vc().cbox(CT['x0'], CT['x1'], 0.0, 0.1, CT['z0'], CT['z1'] + 0.005, GREEN); vc().crbox(CT['x0'] - 0.03, CT['x1'] + 0.03, CT['h'] - 0.04, CT['h'], CT['z0'] - 0.02, CT['z1'] + 0.04, '#f6f5f0', r=0.012)
    vc().cbox(-0.6, -0.1, CT['h'] + 0.12, CT['h'] + 0.48, CT['z0'] + 0.18, CT['z0'] + 0.22, '#1f2023'); ccyl(vc(), (-0.35, CT['h'], CT['z0'] + 0.2), (-0.35, CT['h'] + 0.14, CT['z0'] + 0.2), 0.03, '#1f2023', seg=6); vc().cbox(-0.95, -0.68, CT['h'], CT['h'] + 0.14, CT['z0'] + 0.1, CT['z0'] + 0.4, '#2a2d31')
    ccyl(vc(), (0.3, CT['h'], CT['z1'] - 0.2), (0.3, CT['h'] + 0.1, CT['z1'] - 0.2), 0.04, '#2f6fb0', seg=8)
    zb = -D / 2; vc().cbox(-3.2, 3.2, 0.0, 0.85, zb, zb + 0.45, '#f1f0ea'); vc().cbox(-3.2, 3.2, 0.85, 2.05, zb, zb + 0.04, '#f6f5f0')
    for k in range(5): xx = -3.2 + k * 1.6; vc().cbox(xx - 0.02, xx + 0.02, 0.85, 2.05, zb, zb + 0.34, '#e2e2dc')
    for y in (0.87, 1.11, 1.35, 1.59, 1.83):
        vc().cbox(-3.2, 3.2, y - 0.02, y, zb, zb + 0.32, '#eceae2'); pharma(-3.18, 3.18, y, zb + 0.03, zb + 0.33, 'x', int(y * 10))
    vc().cbox(-2.2, 2.2, 2.2, 2.82, zb, zb + 0.05, '#f6f5f0'); vc().cbox(-2.22, 2.22, 2.18, 2.2, zb, zb + 0.06, GREEN); vc().cbox(-2.22, 2.22, 2.82, 2.84, zb, zb + 0.06, GREEN)
    pic('sign', [(-2.1, 2.22, zb + 0.055), (2.1, 2.22, zb + 0.055), (2.1, 2.8, zb + 0.055), (-2.1, 2.8, zb + 0.055)])
    # 左牆：玻璃門的櫃子（上）＋掛鉤商品（下）；壁扇、時鐘、相框
    vc().cbox(WC['x0'], WC['x1'], 0.0, 0.5, WC['z0'], WC['z1'], '#f1f0ea'); vc().cbox(WC['x0'], WC['x0'] + 0.03, 0.5, WC['h'], WC['z0'], WC['z1'], '#f6f5f0')
    for y in (0.5, 0.9, 1.3, 1.7): vc().cbox(WC['x0'], WC['x1'], y - 0.02, y, WC['z0'], WC['z1'], '#eceae2'); pharma(WC['x0'] + 0.03, WC['x1'] + 0.03, y, WC['z0'] + 0.05, WC['z1'] - 0.05, 'z', int(y * 10) + 1)
    vc().cbox(WC['x0'], WC['x1'], WC['h'], WC['h'] + 0.04, WC['z0'], WC['z1'], '#e2e2dc')
    ccyl(vc(), (-W / 2 + 0.02, 2.55, 2.0), (-W / 2 + 0.3, 2.5, 2.0), 0.02, '#eceeee', seg=6); ccyl(vc(), (-W / 2 + 0.3, 2.5, 2.0), (-W / 2 + 0.36, 2.5, 2.0), 0.22, '#eceeee', seg=16)
    ccyl(vc(), (-W / 2 + 0.01, 2.5, -0.5), (-W / 2 + 0.04, 2.5, -0.5), 0.16, '#2a2d31', seg=16); ccyl(vc(), (-W / 2 + 0.04, 2.5, -0.5), (-W / 2 + 0.045, 2.5, -0.5), 0.14, '#f6f5f0', seg=16)
    vc().cbox(-W / 2, -W / 2 + 0.02, 2.2, 2.75, 3.2, 3.9, '#6a4a2a'); vc().cbox(-W / 2 + 0.02, -W / 2 + 0.024, 2.25, 2.7, 3.25, 3.85, '#cfdfe8')
    # 右牆：衛教海報、書報架、血壓計桌和黑色圓凳
    xe = W / 2 - 0.012
    for (z0_, z1_) in ((1.9, 2.9), (3.1, 3.9)): vc().cbox(W / 2 - 0.01, W / 2, 1.15, 2.75, z0_ - 0.03, z1_ + 0.03, '#f6f5f0'); pic('poster', [(xe, 1.18, z0_), (xe, 1.18, z1_), (xe, 2.72, z1_), (xe, 2.72, z0_)])
    vc().cbox(W / 2 - 0.03, W / 2, 2.0, 2.6, -0.2, 0.25, '#6a4a2a'); vc().cbox(W / 2 - 0.034, W / 2 - 0.03, 2.05, 2.55, -0.15, 0.2, '#f4f1e4')
    mesh('wood').box(BK['x0'], BK['x1'], 0.0, 1.5, BK['z0'], BK['z0'] + 0.03); mesh('wood').box(BK['x0'], BK['x1'], 0.0, 1.5, BK['z1'] - 0.03, BK['z1'])
    for j, y in enumerate((0.3, 0.7, 1.1)):
        mesh('wood').box(BK['x0'], BK['x1'], y - 0.02, y, BK['z0'], BK['z1'])
        for i in range(4): zz = BK['z0'] + 0.08 + i * 0.22; vc().poly([(BK['x0'] + 0.02, y, zz), (BK['x0'] + 0.02, y, zz + 0.18), (BK['x0'] + 0.14, y + 0.28, zz + 0.18), (BK['x0'] + 0.14, y + 0.28, zz)], ('#e8a8b8', '#a8c8e8', '#f0d8a0', '#b8d8b0')[(i + j) % 4])
    x, z = BP['x'], BP['z']; vc().crbox(x - BP['w'] / 2, x + BP['w'] / 2, 0.7, 0.74, z - BP['d'] / 2, z + BP['d'] / 2, '#efe6d0', r=0.01)
    for sx in (-1, 1):
        for sz in (-1, 1): ccyl(vm(), (x + sx * (BP['w'] / 2 - 0.06), 0.0, z + sz * (BP['d'] / 2 - 0.06)), (x + sx * (BP['w'] / 2 - 0.06), 0.7, z + sz * (BP['d'] / 2 - 0.06)), 0.018, '#c4c8cb', seg=6)
    vc().crbox(x - 0.2, x + 0.22, 0.74, 1.02, z + 0.05, z + 0.5, '#eceeee', r=0.04); ccyl(vc(), (x - 0.2, 0.9, z + 0.28), (x - 0.24, 0.9, z + 0.28), 0.1, '#3a3f46', seg=14)   # 隧道式血壓計
    vc().crbox(x - 0.16, x + 0.16, 0.74, 0.9, z - 0.5, z - 0.18, '#eceeee', r=0.02)
    for q in J['seats']:
        ccyl(vc(), (q['x'], 0.44, q['z']), (q['x'], 0.5, q['z']), 0.17, '#1f2023', seg=16)
        for k in range(4): a = k * PI / 2 + PI / 4; ccyl(vm(), (q['x'] + math.cos(a) * 0.08, 0.44, q['z'] + math.sin(a) * 0.08), (q['x'] + math.cos(a) * 0.16, 0.0, q['z'] + math.sin(a) * 0.16), 0.012, '#c4c8cb', seg=6)
    # 玻璃上的一條綠線（照外觀）、門邊的盆栽；天花板
    PRE = 'WALL_Sfix:'
    for (a, b) in FR['windows']: vc().cbox(a, b, 1.05, 1.11, zS + 0.06, zS + 0.07, '#2f8a5a')
    PRE = ''
    clathe(vc(), [(0.0, 0.0), (0.17, 0.0), (0.2, 0.38), (0.0, 0.38)], -3.4, 0.0, 4.2, '#f4f1ea', seg=12); fern(-3.4, 0.75, 4.2, r=0.34, n=18)
    tubes((-3.6, -1.2, 1.2, 3.6))


# ---------- 汀州鮮果 ----------
if SHOP == 'xianguo':
    RK, BT, WT, FG, OC, BK = J['rack'], J['bananaTable'], J['workTable'], J['fridge'], J['orangeCrate'], J['back']
    CRATE, WOODC = '#2f8a4a', '#b89868'
    def pile(x0, x1, y, z0, z1, r, cols, layers=2, sy=1.0):
        """一堆水果（圓的）：一顆顆排、上面再疊一層"""
        for ly in range(layers):
            nx = max(1, int((x1 - x0 - ly * r) / (r * 1.9))); nz = max(1, int((z1 - z0 - ly * r) / (r * 1.9)))
            for i in range(nx):
                for j in range(nz): blob(x0 + r * (1 + ly * 0.9) + i * (x1 - x0 - 2 * r - ly * r * 1.8) / max(1, nx - 1) if nx > 1 else (x0 + x1) / 2, y + r * sy * (0.9 + ly * 1.5), z0 + r * (1 + ly * 0.9) + j * (z1 - z0 - 2 * r - ly * r * 1.8) / max(1, nz - 1) if nz > 1 else (z0 + z1) / 2, r * RR.uniform(0.92, 1.05), RR.choice(cols), sy=sy)
    def crate(x0, x1, y, z0, z1, col=CRATE, h=0.22):
        vc().cbox(x0, x1, y, y + 0.03, z0, z1, col)
        for (a, b, c_, d_) in ((x0, x1, z0, z0 + 0.03), (x0, x1, z1 - 0.03, z1), (x0, x0 + 0.03, z0, z1), (x1 - 0.03, x1, z0, z1)): vc().cbox(a, b, y, y + h, c_, d_, col)
    # 左牆：三階木架，一階一階往牆升高；每一格一種水果
    FR_ = [(['#c0392b', '#a82a22', '#d9574a'], 0.055, 1.0), (['#a8c85a', '#bcd66a'], 0.06, 1.0), (['#e8962a', '#f0a83a'], 0.055, 1.0), (['#5a3a6a', '#4a2f5a', '#7a9a3a'], 0.03, 1.0), (['#a8c85a', '#c8d87a'], 0.07, 1.1), (['#e8962a', '#f0a83a'], 0.055, 1.0)]
    nseg = 5; sw = (RK['z1'] - RK['z0']) / nseg
    for st in range(3):
        xa = RK['x1'] - (st + 1) * 0.5; xb = xa + 0.5; y = 0.45 + st * 0.3
        mesh('wood').box(max(RK['x0'], xa), xb, 0.0 if st == 0 else y - 0.3, y, RK['z0'], RK['z1'])
        for i in range(nseg):
            z0_ = RK['z0'] + i * sw + 0.04; z1_ = z0_ + sw - 0.08; f = FR_[(i + st * 2) % len(FR_)]
            if st == 2 and i % 2 == 0:   # 最上面：鳳梨、西瓜
                if i % 4 == 0:
                    for k in range(3): cx_ = (max(RK['x0'], xa) + xb) / 2; zc = z0_ + 0.14 + k * (z1_ - z0_ - 0.28) / 2; blob(cx_, y + 0.16, zc, 0.11, '#c9962a', sy=1.4); ccyl(vc(), (cx_, y + 0.3, zc), (cx_, y + 0.52, zc), 0.07, '#4f7a3a', seg=6, r2=0.01)
                else:
                    for k in range(2): blob((max(RK['x0'], xa) + xb) / 2, y + 0.19, z0_ + 0.22 + k * 0.42, 0.2, '#3f7a3a' if k else '#4f8a44', sy=0.95)
                continue
            crate(max(RK['x0'], xa) + 0.02, xb - 0.02, y, z0_, z1_, CRATE if (i + st) % 2 else WOODC); pile(max(RK['x0'], xa) + 0.05, xb - 0.05, y + 0.03, z0_ + 0.03, z1_ - 0.03, f[1], f[0], sy=f[2])
    # 門口左邊：一桌香蕉（一串一串黃色）
    x, z = BT['x'], BT['z']; mesh('wood').box(x - BT['w'] / 2, x + BT['w'] / 2, 0.0, 0.7, z - BT['d'] / 2, z + BT['d'] / 2); vc().cbox(x - BT['w'] / 2, x + BT['w'] / 2, 0.7, 0.72, z - BT['d'] / 2, z + BT['d'] / 2, '#4f7a3a')
    for i in range(7):
        bx = x - BT['w'] / 2 + 0.2 + (i % 4) * 0.48; bz = z - 0.22 + (i // 4) * 0.42
        for k in range(5): ccyl(vc(), (bx - 0.14 + k * 0.03, 0.76, bz - 0.12), (bx + 0.1 + k * 0.03, 0.8 + k * 0.012, bz + 0.14), 0.03, '#f0cf3a' if k % 2 else '#e6c22e', seg=6)
    # 中間木工作桌：電子秤、切好的水果盒、砧板上的鳳梨、桌邊掛的粉紅條紋塑膠袋、桌下的綠籃
    x, z, w_, d_ = WT['x'], WT['z'], WT['w'], WT['d']
    mesh('wood').rbox(x - w_ / 2, x + w_ / 2, 0.82, 0.88, z - d_ / 2, z + d_ / 2, r=0.012, seg=2); mesh('wood').box(x - w_ / 2 + 0.05, x + w_ / 2 - 0.05, 0.3, 0.33, z - d_ / 2 + 0.05, z + d_ / 2 - 0.05)
    for sx in (-1, 1):
        for sz in (-1, 1): mesh('wood').box(x + sx * (w_ / 2 - 0.07) - 0.035, x + sx * (w_ / 2 - 0.07) + 0.035, 0, 0.82, z + sz * (d_ / 2 - 0.07) - 0.035, z + sz * (d_ / 2 - 0.07) + 0.035)
    vm().crbox(x - 0.75, x - 0.3, 0.88, 0.96, z - 0.1, z + 0.3, '#c4c8cb', r=0.01); vm().cbox(x - 0.72, x - 0.33, 0.96, 0.975, z - 0.07, z + 0.18, '#d8dadc'); vc().cbox(x - 0.72, x - 0.33, 0.9, 0.955, z + 0.3, z + 0.305, '#2a3a4a')
    vc().cbox(x + 0.2, x + 0.75, 0.88, 0.9, z - 0.25, z + 0.15, '#f4f1e4'); blob(x + 0.45, 0.94, z - 0.05, 0.1, '#e8c23a', sy=0.5); blob(x + 0.62, 0.93, z + 0.02, 0.06, '#c9962a', sy=1.3)
    for i in range(4): vc().cbox(x - 0.1 + i * 0.01, x + 0.12 + i * 0.01, 0.88 + i * 0.05, 0.93 + i * 0.05, z - 0.35, z - 0.1, ('#f4e6c0', '#e8f0d0', '#f4d0c0', '#f4f4f0')[i])
    for i in range(3): vc().cbox(x - 0.9 + i * 0.03, x - 0.86 + i * 0.03, 0.35, 0.8, z + d_ / 2 + 0.01, z + d_ / 2 + 0.035, ('#f09ab0', '#f4f4f0')[i % 2])
    crate(x - 0.8, x - 0.1, 0.33, z - 0.3, z + 0.3); crate(x + 0.1, x + 0.8, 0.33, z - 0.3, z + 0.3, '#2a2f36')
    # 右邊：不鏽鋼冷藏展示櫃（三層切好的水果盒、下面整顆的水果）；門口右邊一籃橘子
    vm().cbox(FG['x0'], FG['x1'], 0.0, 0.55, FG['z0'], FG['z1'], '#b9bdc1'); vm().cbox(FG['x1'] - 0.06, FG['x1'], 0.55, FG['h'], FG['z0'], FG['z1'], '#c4c8cb'); vm().cbox(FG['x0'], FG['x1'], FG['h'] - 0.12, FG['h'], FG['z0'], FG['z1'], '#c4c8cb')
    for zz in (FG['z0'], FG['z1'] - 0.04): vm().cbox(FG['x0'], FG['x1'], 0.55, FG['h'], zz, zz + 0.04, '#c4c8cb')
    mesh('glass').quad([(FG['x0'] + 0.02, 0.55, FG['z1']), (FG['x0'] + 0.02, 0.55, FG['z0']), (FG['x0'] + 0.02, FG['h'] - 0.12, FG['z0']), (FG['x0'] + 0.02, FG['h'] - 0.12, FG['z1'])])
    mesh('light').box(FG['x0'] + 0.1, FG['x1'] - 0.1, FG['h'] - 0.15, FG['h'] - 0.12, FG['z0'] + 0.1, FG['z1'] - 0.1)
    for j, y in enumerate((0.6, 1.0, 1.38)):
        vm().cbox(FG['x0'] + 0.05, FG['x1'] - 0.06, y - 0.02, y, FG['z0'] + 0.04, FG['z1'] - 0.04, '#d8dadc')
        if j == 0: pile(FG['x0'] + 0.1, FG['x1'] - 0.1, y, FG['z0'] + 0.1, FG['z1'] - 0.1, 0.07, ['#a8c85a', '#5a3a6a', '#c0392b', '#e8e0c0'], layers=1)
        else:
            for i in range(9): zz = FG['z0'] + 0.12 + i * (FG['z1'] - FG['z0'] - 0.24) / 9; vc().cbox(FG['x0'] + 0.12, FG['x0'] + 0.5, y, y + 0.09, zz, zz + 0.26, ('#f0d23a', '#e84a5a', '#a8c85a', '#f09a3a', '#7a3a6a')[(i + j) % 5]); vc().cbox(FG['x0'] + 0.11, FG['x0'] + 0.51, y + 0.09, y + 0.1, zz - 0.01, zz + 0.27, '#f4f6f6')
    x, z = OC['x'], OC['z']; mesh('wood').box(x - OC['w'] / 2, x + OC['w'] / 2, 0.0, 0.45, z - OC['d'] / 2, z + OC['d'] / 2); crate(x - OC['w'] / 2 + 0.02, x + OC['w'] / 2 - 0.02, 0.45, z - OC['d'] / 2 + 0.02, z + OC['d'] / 2 - 0.02); pile(x - OC['w'] / 2 + 0.06, x + OC['w'] / 2 - 0.06, 0.48, z - OC['d'] / 2 + 0.06, z + OC['d'] / 2 - 0.06, 0.06, ['#e8862a', '#f09a3a'], layers=2)
    # 後面：紙箱堆、水槽和層架、立扇；牆：舊白磁磚（下半）、水果壁畫；吊燈
    for i in range(14): bx = -2.6 + (i % 5) * 0.62; by = (i // 5) * 0.42; vc().cbox(bx, bx + 0.58, by, by + 0.4, BK['z0'] + 0.1, BK['z0'] + 0.6, ('#c9a878', '#b8946a', '#d9c9a8')[i % 3])
    mesh('steel').box(1.2, 3.6, 0.0, 0.85, BK['z0'] + 0.05, BK['z0'] + 0.65); mesh('steel').box(1.2, 3.6, 1.5, 1.52, BK['z0'] + 0.05, BK['z0'] + 0.4)
    ccyl(vm(), (-0.6, 0.0, -2.6), (-0.6, 1.2, -2.6), 0.025, '#3a3a3c', seg=8); ccyl(vm(), (-0.6, 0.0, -2.6), (-0.6, 0.04, -2.6), 0.25, '#3a3a3c', seg=14); ccyl(vm(), (-0.6, 1.25, -2.66), (-0.6, 1.25, -2.54), 0.3, '#5a5a5c', seg=18)
    xw = -W / 2 + 0.012; pic('mural', [(xw, 1.75, 3.6), (xw, 1.75, -0.2), (xw, 2.95, -0.2), (xw, 2.95, 3.6)])
    for xx, zz in ((-2.6, 3.0), (-2.2, 0.6), (1.6, 2.2), (2.2, -0.8)):
        ccyl(vc(), (xx, 2.5, zz), (xx, H, zz), 0.006, '#2b2b2b', seg=4); ccyl(vm(), (xx, 2.32, zz), (xx, 2.5, zz), 0.16, '#3a4a44', seg=14, r2=0.04, caps=False); mesh('light').sphere((xx, 2.3, zz), 0.055, seg=8, rings=5)
    tubes((-2.4, 0.2, 2.8), x0=-0.2, x1=2.2, grid=False)
    # 第 2 版（BB 11-10 23:51：比參考圖空很多——參考圖堆得滿滿：掛著的香蕉、整排鳳梨西瓜、一地的箱子）
    def bunch(x, y, z, n=6):   # 掛著的一串香蕉：上面一小段梗、往下散開的幾根
        ccyl(vc(), (x, y, z), (x, y + 0.12, z), 0.012, '#6a5a2a', seg=5)
        for k in range(n): a_ = k * 2 * PI / n; ccyl(vc(), (x + math.cos(a_) * 0.02, y, z + math.sin(a_) * 0.02), (x + math.cos(a_) * 0.075, y - 0.2, z + math.sin(a_) * 0.075), 0.022, '#f0cf3a' if k % 2 else '#e2bd2a', seg=5, r2=0.012)
    for (rx, z0_, z1_, n_) in ((-2.25, -1.4, 2.9, 9), (1.1, 0.5, 2.1, 4)):   # 兩根吊桿：木架前面一整排、工作桌上面一排
        ccyl(vm(), (rx, 2.34, z0_), (rx, 2.34, z1_), 0.012, '#8f9498', seg=6)
        for zz in (z0_ + 0.05, z1_ - 0.05): ccyl(vm(), (rx, 2.34, zz), (rx, H, zz), 0.006, '#8f9498', seg=4)
        for i in range(n_): bunch(rx, 2.2 - (i % 2) * 0.05, z0_ + 0.2 + i * (z1_ - z0_ - 0.4) / max(1, n_ - 1), n=6 if i % 3 else 7)
    for ex in J.get('extraStacks', []):   # 地上一疊疊的箱子、籃子（配置 extraStacks：導航一起擋）
        ex0, ex1, ez0, ez1 = ex['x0'], ex['x1'], ex['z0'], ex['z1']; n_ = max(1, int((ex1 - ex0) / 0.62)); cw = (ex1 - ex0) / n_
        for i in range(n_):
            if any(g0 < ex0 + (i + 0.5) * cw < g1 for g0, g1 in ex.get('gaps', [])): continue
            x0_ = ex0 + i * cw + 0.02; x1_ = x0_ + cw - 0.04; lv = 1 + (i * 7 + int(ez0 * 3)) % 3; kind = (i + int(abs(ez0) * 2)) % 4
            for l in range(lv): crate(x0_, x1_, l * 0.24, ez0 + 0.02, ez1 - 0.02, (CRATE, WOODC, '#c9a878', '#2a2f36')[(i + l) % 4])
            y_ = lv * 0.24 - 0.2
            if kind == 0: pile(x0_ + 0.04, x1_ - 0.04, y_, ez0 + 0.05, ez1 - 0.05, 0.07, ['#e8962a', '#f0a83a'], layers=1)
            elif kind == 1:
                for k in range(2): blob((x0_ + x1_) / 2, y_ + 0.2, ez0 + 0.16 + k * (ez1 - ez0 - 0.32), 0.17, '#3f7a3a' if k else '#4f8a44', sy=0.95)                                   # 西瓜
            elif kind == 2:
                for k in range(2): zc = ez0 + 0.15 + k * (ez1 - ez0 - 0.3); blob((x0_ + x1_) / 2, y_ + 0.15, zc, 0.1, '#c9962a', sy=1.4); ccyl(vc(), ((x0_ + x1_) / 2, y_ + 0.28, zc), ((x0_ + x1_) / 2, y_ + 0.48, zc), 0.065, '#4f7a3a', seg=6, r2=0.01)   # 鳳梨
            else: pile(x0_ + 0.04, x1_ - 0.04, y_, ez0 + 0.05, ez1 - 0.05, 0.068, ['#c0392b', '#a82a22', '#a8c85a'], layers=1)
            vc().poly([(x0_ + 0.08, lv * 0.24 + 0.02, ez1 + 0.004), (x1_ - 0.08, lv * 0.24 + 0.02, ez1 + 0.004), (x1_ - 0.08, lv * 0.24 + 0.2, ez1 + 0.03), (x0_ + 0.08, lv * 0.24 + 0.2, ez1 + 0.03)], '#f6e23a')                    # 黃色價目卡（字：遊戲裡看不清，不寫）
            vc().poly([(x0_ + 0.12, lv * 0.24 + 0.14, ez1 + 0.024), (x1_ - 0.12, lv * 0.24 + 0.14, ez1 + 0.024), (x1_ - 0.12, lv * 0.24 + 0.18, ez1 + 0.03), (x0_ + 0.12, lv * 0.24 + 0.18, ez1 + 0.03)], '#c9302a')
    for i in range(nseg):   # 木架每一格前緣一張黃色價目卡
        zc = RK['z0'] + (i + 0.5) * sw; vc().poly([(RK['x1'] + 0.004, 0.2, zc + 0.14), (RK['x1'] + 0.004, 0.2, zc - 0.14), (RK['x1'] + 0.03, 0.4, zc - 0.14), (RK['x1'] + 0.03, 0.4, zc + 0.14)], '#f6e23a')
    for i in range(5): vc().cbox(3.3 + i * 0.1, 3.38 + i * 0.1, 2.0, 2.45, 3.25, 3.27, ('#f09ab0', '#f4f4f0')[i % 2])   # 冷藏櫃旁掛著的一疊粉紅條紋塑膠袋


# ---------- 榮恩典文具社 ----------
if SHOP == 'rongendian':
    PW, AW_, CT, CR = J['penWall'], J['artWall'], J['counter'], J['cart']
    PENS = ['#1f2a48', '#b8262b', '#2b4f8c', '#1d1f22', '#e8c23a', '#2f8a5a', '#e87a2a', '#8a4aa8', '#f4f4f0']; NOTE = [['#d9c9a8', '#8fb8d8', '#2f3338', '#f4f1e8', '#c9a878'], ['#e8a8b8', '#f4e6a0', '#a8c8e8', '#f4f4f0'], ['#2b4f8c', '#7a2a2a', '#d9c9a8', '#3a5a4a'], ['#f4f1e8', '#e8e0c8', '#c9c4b8']]
    # 左牆：整面筆（一層一層壓克力格，每一格一把同色的筆）；下面抽屜櫃
    mesh('wood').box(PW['x0'], PW['x1'], 0.0, 0.7, PW['z0'], PW['z1']); vc().cbox(PW['x0'], PW['x0'] + 0.03, 0.7, PW['h'], PW['z0'], PW['z1'], '#f4f1e4')
    for j in range(7):
        y = 0.75 + j * 0.25; vc().cbox(PW['x0'], PW['x1'] - 0.1, y - 0.015, y, PW['z0'], PW['z1'], '#e8e4d8')
        zz = PW['z0'] + 0.05
        while zz < PW['z1'] - 0.12:
            col = RR.choice(PENS)
            for k in range(4): ccyl(vc(), (PW['x0'] + 0.1 + k * 0.06, y, zz + 0.04), (PW['x0'] + 0.16 + k * 0.06, y + 0.17, zz + 0.04), 0.008, col, seg=4)
            vc().cbox(PW['x0'] + 0.06, PW['x1'] - 0.12, y, y + 0.06, zz, zz + 0.09, '#eef2f2'); zz += 0.105
    # 右牆：畫材（畫筆筒、顏料瓶、調色盤、素描本）
    mesh('wood').box(AW_['x0'], AW_['x1'], 0.0, 0.75, AW_['z0'], AW_['z1'])
    for j, y in enumerate((0.75, 1.2, 1.65, 2.1)):
        mesh('wood').box(AW_['x0'], AW_['x1'], y - 0.03, y, AW_['z0'], AW_['z1'])
        if j == 0: goods(AW_['x0'] + 0.03, AW_['x1'], y, AW_['z0'] + 0.05, AW_['z1'] - 0.05, NOTE[0], hmin=0.22, hmax=0.34, step=0.06)
        elif j == 1:
            for i in range(12): zc = AW_['z0'] + 0.2 + i * (AW_['z1'] - AW_['z0'] - 0.4) / 11; ccyl(vc(), (AW_['x0'] + 0.25, y, zc), (AW_['x0'] + 0.25, y + 0.12, zc), 0.05, '#3a2a20', seg=8); [ccyl(vc(), (AW_['x0'] + 0.25 + (k - 1.5) * 0.02, y + 0.1, zc + (k % 2 - 0.5) * 0.03), (AW_['x0'] + 0.25 + (k - 1.5) * 0.04, y + 0.32, zc + (k % 2 - 0.5) * 0.05), 0.006, ('#c9a878', '#1d1f22', '#b8262b', '#2b4f8c')[k], seg=4) for k in range(4)]
        elif j == 2:
            for i in range(26): zc = AW_['z0'] + 0.12 + i * (AW_['z1'] - AW_['z0'] - 0.24) / 25; ccyl(vc(), (AW_['x0'] + 0.25, y, zc), (AW_['x0'] + 0.25, y + 0.2, zc), 0.035, ('#f4f4f0', '#e8c23a', '#b8262b', '#2b4f8c', '#1d1f22', '#2f8a5a', '#e87a2a')[i % 7], seg=8); ccyl(vc(), (AW_['x0'] + 0.25, y + 0.2, zc), (AW_['x0'] + 0.25, y + 0.25, zc), 0.018, '#f4f4f0', seg=6)
        else:
            for i in range(6): zc = AW_['z0'] + 0.4 + i * (AW_['z1'] - AW_['z0'] - 0.8) / 5; ccyl(vc(), (AW_['x0'] + 0.3, y + 0.16, zc), (AW_['x0'] + 0.33, y + 0.17, zc), 0.15, '#f6f4ee', seg=14)
    # 中間兩座木層架：筆記本、筆袋、膠帶
    for g in J['gondolas']: gondola(g, NOTE, style='wood', levels=(0.2, 0.6, 1.0, 1.36))
    # 後方木櫃台：收銀機、檯燈、筆筒；後牆層架、紙捲、小十字架、植物
    mesh('wood').box(CT['x0'], CT['x1'], 0.0, CT['h'] - 0.04, CT['z0'], CT['z1']); mesh('wood_d').rbox(CT['x0'] - 0.03, CT['x1'] + 0.03, CT['h'] - 0.04, CT['h'], CT['z0'] - 0.02, CT['z1'] + 0.04, r=0.012, seg=2)
    for i in range(18): xx = CT['x0'] + 0.06 + i * (CT['x1'] - CT['x0'] - 0.12) / 17; vc().cbox(xx - 0.012, xx + 0.012, 0.06, CT['h'] - 0.06, CT['z1'], CT['z1'] + 0.012, '#7a5636')
    vc().crbox(-0.6, -0.15, CT['h'], CT['h'] + 0.16, CT['z0'] + 0.1, CT['z0'] + 0.45, '#2a2d31', r=0.01); vc().cbox(-0.55, -0.2, CT['h'] + 0.16, CT['h'] + 0.42, CT['z0'] + 0.12, CT['z0'] + 0.16, '#1f2023')
    ccyl(vm(), (-1.25, CT['h'], CT['z0'] + 0.3), (-1.25, CT['h'] + 0.32, CT['z0'] + 0.3), 0.012, '#b8a04a', seg=6); ccyl(vc(), (-1.25, CT['h'] + 0.3, CT['z0'] + 0.3), (-1.25, CT['h'] + 0.48, CT['z0'] + 0.3), 0.13, '#f4e6c0', seg=12, r2=0.07, caps=False); mesh('light').sphere((-1.25, CT['h'] + 0.34, CT['z0'] + 0.3), 0.04, seg=6, rings=4)
    ccyl(vc(), (0.5, CT['h'], CT['z1'] - 0.2), (0.5, CT['h'] + 0.11, CT['z1'] - 0.2), 0.045, '#3a2a20', seg=8)
    zb = -D / 2; mesh('wood').box(0.4, 4.0, 0.0, 0.03, zb, zb + 0.4)
    for y in (0.9, 1.4, 1.9): mesh('wood').box(0.4, 4.0, y - 0.03, y, zb, zb + 0.4); goods(0.45, 3.95, y, zb + 0.05, zb + 0.36, ['#c9a878', '#e8e0c8', '#d9c9a8', '#f4f1e8', '#b8946a'], hmin=0.14, hmax=0.32, along='x', step=0.2)
    for i in range(6): ccyl(vc(), (0.6 + i * 0.12, 0.03, zb + 0.2), (0.6 + i * 0.12, 0.8, zb + 0.2), 0.045, '#d9c9a8', seg=8)
    vc().cbox(-2.2, -2.16, 1.7, 2.0, zb + 0.004, zb + 0.02, '#6a4a2a'); vc().cbox(-2.29, -2.07, 1.87, 1.91, zb + 0.004, zb + 0.02, '#6a4a2a')                   # 小十字架（規格：小、低調）
    vc().cbox(-1.8, -1.5, 1.55, 1.95, zb + 0.004, zb + 0.014, '#f4f1e4')
    mesh('wood').box(-1.4, -0.2, 2.1, 2.13, zb, zb + 0.25); clathe(vc(), [(0.0, 0.0), (0.09, 0.0), (0.11, 0.16), (0.0, 0.16)], -0.8, 2.13, zb + 0.13, '#b8603a', seg=10); fern(-0.8, 2.3, zb + 0.14, r=0.26, n=12, hang=True)
    # 門口左邊：特價推車（鐵網推車＋筆記本、黃底紅字的「特價」牌是色塊）；右前方木畫架、靠牆的畫布
    x, z = CR['x'], CR['z']
    for sx in (-1, 1):
        for sz in (-1, 1): ccyl(vm(), (x + sx * (CR['w'] / 2 - 0.04), 0.06, z + sz * (CR['d'] / 2 - 0.04)), (x + sx * (CR['w'] / 2 - 0.04), 0.95, z + sz * (CR['d'] / 2 - 0.04)), 0.012, '#d8dadc', seg=6); ccyl(vc(), (x + sx * (CR['w'] / 2 - 0.04), 0.0, z + sz * (CR['d'] / 2 - 0.04)), (x + sx * (CR['w'] / 2 - 0.04), 0.07, z + sz * (CR['d'] / 2 - 0.04)), 0.035, '#2a2d31', seg=8)
    for y in (0.3, 0.75): vm().cbox(x - CR['w'] / 2, x + CR['w'] / 2, y, y + 0.015, z - CR['d'] / 2, z + CR['d'] / 2, '#d8dadc'); goods(x - CR['w'] / 2 + 0.04, x + CR['w'] / 2 - 0.04, y + 0.015, z - CR['d'] / 2 + 0.04, z + CR['d'] / 2 - 0.04, NOTE[0] + NOTE[1], hmin=0.04, hmax=0.14, along='x', step=0.19)
    vc().poly([(x - 0.45, 0.2, z + CR['d'] / 2 + 0.02), (x + 0.45, 0.2, z + CR['d'] / 2 + 0.02), (x + 0.45, 0.62, z + CR['d'] / 2 + 0.08), (x - 0.45, 0.62, z + CR['d'] / 2 + 0.08)], '#f2c230'); vc().poly([(x - 0.3, 0.28, z + CR['d'] / 2 + 0.036), (x + 0.3, 0.28, z + CR['d'] / 2 + 0.036), (x + 0.3, 0.54, z + CR['d'] / 2 + 0.074), (x - 0.3, 0.54, z + CR['d'] / 2 + 0.074)], '#c9302a')
    for (ex, ez) in J['easels']:
        for sx in (-0.22, 0.22): ccyl(vc(), (ex + sx, 0.0, ez + 0.12), (ex + sx * 0.3, 1.65, ez - 0.1), 0.02, '#c9a878', seg=6)
        ccyl(vc(), (ex, 0.0, ez - 0.35), (ex, 1.6, ez - 0.1), 0.02, '#c9a878', seg=6); vc().cbox(ex - 0.28, ex + 0.28, 0.62, 0.66, ez - 0.02, ez + 0.08, '#c9a878'); vc().poly([(ex - 0.26, 0.66, ez + 0.05), (ex + 0.26, 0.66, ez + 0.05), (ex + 0.26, 1.36, ez - 0.07), (ex - 0.26, 1.36, ez - 0.07)], '#f6f4ee')
    CV = J['canvases']
    for i in range(5): vc().poly([(CV['x0'] + i * 0.05, 0.0, CV['z0']), (CV['x0'] + i * 0.05, 0.0, CV['z1']), (CV['x1'] - 0.1 + i * 0.03, 1.0 - i * 0.08, CV['z1']), (CV['x1'] - 0.1 + i * 0.03, 1.0 - i * 0.08, CV['z0'])][::-1], ('#f6f4ee', '#ece8dc')[i % 2])
    # 天花板：格柵、日光燈、吊扇
    tubes((-3.4, -1.0, 1.4, 3.6), x0=-2.2, x1=2.2); ccyl(vc(), (0.6, H - 0.3, -0.6), (0.6, H, -0.6), 0.03, '#b8a888', seg=8); ccyl(vc(), (0.6, H - 0.36, -0.6), (0.6, H - 0.28, -0.6), 0.12, '#c9b898', seg=12)
    for k in range(4): a = k * PI / 2 + 0.3; vc().poly([(0.6 + math.cos(a) * 0.12 - math.sin(a) * 0.07, H - 0.33, -0.6 + math.sin(a) * 0.12 + math.cos(a) * 0.07), (0.6 + math.cos(a) * 0.75 - math.sin(a) * 0.09, H - 0.33, -0.6 + math.sin(a) * 0.75 + math.cos(a) * 0.09), (0.6 + math.cos(a) * 0.75 + math.sin(a) * 0.09, H - 0.33, -0.6 + math.sin(a) * 0.75 - math.cos(a) * 0.09), (0.6 + math.cos(a) * 0.12 + math.sin(a) * 0.07, H - 0.33, -0.6 + math.sin(a) * 0.12 - math.cos(a) * 0.07)], '#8a6a48')


# ---------- 禮貌生財（X332）：前半命理館＋後半書房（STUDY_*，平常不顯示） ----------
if SHOP == 'limao':
    BC, CB, TE, PT, SD = J['bookcase'], J['cabinet'], J['tea'], J['partition'], J['study']; DK = '#3a2416'
    OLD = ['#7a2a26', '#2f4a6a', '#c9b890', '#3a5a44', '#8a6a3a', '#d9cdb0', '#4a3426', '#a8873a', '#e8dcc0']      # 命理書、線裝書
    LAW = ['#1f2f5a', '#6a1a22', '#1d1f22', '#2f4a3a', '#c9b890', '#8a8f98', '#3a2a5a', '#1f2f5a', '#7a2a26']      # 刑法教科書、德文書、舊法典、期刊合訂本
    def bookcase(x0, x1, z0, z1, h, cols, side, base=0.8, gap=0.42):
        """深色木書櫃（side：'W'／'E' 靠東西牆沿 z 排、'N' 靠北牆沿 x 排）；base 以下是木門櫃"""
        wd = mesh('wood_d'); wd.box(x0, x1, 0.0, base, z0, z1); wd.box(x0, x1, h - 0.06, h, z0, z1)
        if side == 'N': wd.box(x0, x1, base, h, z0, z0 + 0.03)
        else: wd.box(*( (x0, x0 + 0.03) if side == 'W' else (x1 - 0.03, x1) ), base, h, z0, z1)
        a0, a1 = (x0, x1) if side == 'N' else (z0, z1); n = max(1, round((a1 - a0) / 0.95))
        for i in range(n + 1):
            a = a0 + i * (a1 - a0) / n
            if side == 'N': wd.box(max(x0, a - 0.02), min(x1, a + 0.02), base, h, z0, z1)
            else: wd.box(x0, x1, base, h, max(z0, a - 0.02), min(z1, a + 0.02))
        if base > 0.3:   # 下面木門櫃的門縫、銅把手
            for i in range(n):
                a = a0 + (i + 0.5) * (a1 - a0) / n
                if side == 'N': vc().cbox(a - 0.005, a + 0.005, 0.08, base - 0.06, z1, z1 + 0.004, '#2a180e'); ccyl(vm(), (a + 0.05, base * 0.55, z1), (a + 0.05, base * 0.55, z1 + 0.03), 0.012, '#b8923a', seg=6)
                else: xx = x1 if side == 'W' else x0; sg = 1 if side == 'W' else -1; vc().cbox(min(xx, xx + sg * 0.004), max(xx, xx + sg * 0.004), 0.08, base - 0.06, a - 0.005, a + 0.005, '#2a180e'); ccyl(vm(), (xx, base * 0.55, a + 0.05), (xx + sg * 0.03, base * 0.55, a + 0.05), 0.012, '#b8923a', seg=6)
        y = base
        while y + gap < h - 0.02:
            wd.box(x0, x1, y - 0.025, y, z0, z1)
            if side == 'N': goods(x0 + 0.04, x1 - 0.04, y, z0 + 0.05, z1 - 0.08, cols, hmin=0.24, hmax=gap - 0.07, along='x', step=0.058)
            elif side == 'W': goods(x0 + 0.05, x1 - 0.08, y, z0 + 0.04, z1 - 0.04, cols, hmin=0.24, hmax=gap - 0.07, along='z', step=0.058)
            else: goods(x0 + 0.08, x1 - 0.05, y, z0 + 0.04, z1 - 0.04, cols, hmin=0.24, hmax=gap - 0.07, along='z', step=0.058)
            y += gap
    def lantern(x, z, y=2.25, r=0.2):
        ccyl(vc(), (x, y + r + 0.03, z), (x, H, z), 0.006, '#2b2b2b', seg=4); mesh('light').sphere((x, y, z), r, seg=12, rings=8, sy=0.85)
        for yy in (y + r * 0.85 - 0.02, y - r * 0.85 - 0.01): ccyl(vc(), (x, yy, z), (x, yy + 0.03, z), r * 0.42, DK, seg=10)
    def pot(x, z, r=0.17, h=0.36, col='#3f5f8a'):
        clathe(vc(), [(0.0, 0.0), (r * 0.75, 0.0), (r, h * 0.7), (r * 0.9, h), (0.0, h)], x, 0.0, z, col, seg=10); fern(x, h + 0.12, z, r=0.3, n=16)
    # ----- 前半：命理館 -----
    bookcase(BC['x0'], BC['x1'], BC['z0'], BC['z1'], BC['h'], OLD, 'W')
    for (yy, zz) in ((BC['h'], 0.2), (BC['h'], 2.4)): ccyl(vc(), (BC['x0'] + 0.22, yy, zz), (BC['x0'] + 0.22, yy + 0.2, zz), 0.07, '#8a5a2a', seg=8)       # 櫃頂的籤筒、小罐
    for i in range(6): ccyl(vc(), (BC['x0'] + 0.2 + (i % 2) * 0.03, BC['h'] + 0.18, 0.18 + i * 0.012), (BC['x0'] + 0.2 + (i % 3) * 0.03, BC['h'] + 0.36, 0.14 + i * 0.03), 0.005, '#d9b87a', seg=4)
    # 東牆：玻璃門木櫃（茶具、小擺設）
    wd = mesh('wood_d'); wd.box(CB['x0'], CB['x1'], 0.0, 0.8, CB['z0'], CB['z1']); wd.box(CB['x0'], CB['x1'], CB['h'] - 0.06, CB['h'], CB['z0'], CB['z1']); wd.box(CB['x1'] - 0.03, CB['x1'], 0.8, CB['h'], CB['z0'], CB['z1'])
    for zz in (CB['z0'], (CB['z0'] + CB['z1']) / 2 - 0.02, CB['z1'] - 0.04): wd.box(CB['x0'], CB['x1'], 0.8, CB['h'], zz, zz + 0.04)
    mesh('glass').quad([(CB['x0'] + 0.01, 0.82, CB['z1']), (CB['x0'] + 0.01, 0.82, CB['z0']), (CB['x0'] + 0.01, CB['h'] - 0.08, CB['z0']), (CB['x0'] + 0.01, CB['h'] - 0.08, CB['z1'])])
    for j, y in enumerate((0.82, 1.25, 1.68)):
        wd.box(CB['x0'], CB['x1'], y - 0.02, y, CB['z0'], CB['z1'])
        for i in range(7):
            zz = CB['z0'] + 0.18 + i * (CB['z1'] - CB['z0'] - 0.36) / 6
            if (i + j) % 3 == 0: blob(CB['x0'] + 0.22, y + 0.07, zz, 0.07, ('#f4f0e4', '#7a4a2a', '#3f5f8a')[j], sy=0.8)
            elif (i + j) % 3 == 1: ccyl(vc(), (CB['x0'] + 0.22, y, zz), (CB['x0'] + 0.22, y + 0.06, zz), 0.035, '#f4f0e4', seg=8, r2=0.045)
            else: ccyl(vc(), (CB['x0'] + 0.22, y, zz), (CB['x0'] + 0.22, y + 0.2, zz), 0.04, ('#2f4a3a', '#8a5a2a', '#c9b890')[j], seg=8, r2=0.025)
    # 圓茶桌、三張木椅、茶壺茶杯
    x, z = TE['x'], TE['z']; ccyl(mesh('wood_d', False) and vc(), (x, TE['h'] - 0.04, z), (x, TE['h'], z), TE['r'], DK, seg=24); ccyl(vc(), (x, 0.04, z), (x, TE['h'] - 0.04, z), 0.06, DK, seg=10); ccyl(vc(), (x, 0.0, z), (x, 0.04, z), 0.3, DK, seg=14)
    blob(x, TE['h'] + 0.07, z, 0.08, '#f4f0e4', sy=0.85); ccyl(vc(), (x + 0.07, TE['h'] + 0.07, z), (x + 0.15, TE['h'] + 0.11, z), 0.012, '#f4f0e4', seg=6); ccyl(vc(), (x, TE['h'] + 0.13, z), (x, TE['h'] + 0.15, z), 0.02, '#f4f0e4', seg=6)
    for (cx, cz) in ((0.22, 0.12), (-0.2, 0.18), (0.02, -0.26)): ccyl(vc(), (x + cx, TE['h'], z + cz), (x + cx, TE['h'] + 0.006, z + cz), 0.05, '#f4f0e4', seg=10); ccyl(vc(), (x + cx, TE['h'] + 0.006, z + cz), (x + cx, TE['h'] + 0.05, z + cz), 0.025, '#f4f0e4', seg=8, r2=0.035)
    ccyl(vc(), (x - 0.25, TE['h'], z - 0.2), (x - 0.25, TE['h'] + 0.012, z - 0.2), 0.14, '#5a3a22', seg=14)                                                     # 茶盤
    for q in J['seats']: chair(q['x'], q['z'], q['yaw'], wood=DK, pad='#4a2f1e')
    lantern(x, z, y=2.2, r=0.21); lantern(0.9, 3.4, y=2.3, r=0.17)
    pot(-1.95, 4.2, col='#3f5f8a'); pot(1.95, -0.75, col='#7a4a2a')
    # 隔牆（到天花板）和書房的門框；牆上的山水掛畫、書法掛軸（東牆）
    # PART_*：隔牆、門框、掛在隔牆上的掛畫——鏡頭和玩家在隔牆兩邊時遊戲整組藏起來（LM-PART-CAM-1111，BB 11-11 01:47：玩家站在掛畫前、鏡頭退到鎖著的書房裡，整個畫面是隔牆背面的米色）
    PRE = 'PART:'
    zp = PT['z']; d0, d1 = PT['door']; pw = mesh('wall'); pw.box(PT['x0'], d0, 0, H, zp - 0.06, zp + 0.06); pw.box(d1, PT['x1'], 0, H, zp - 0.06, zp + 0.06); pw.box(d0, d1, 2.1, H, zp - 0.06, zp + 0.06)
    for xx in (d0, d1): vc().cbox(xx - 0.05, xx + 0.05, 0, 2.1, zp - 0.08, zp + 0.08, DK)
    vc().cbox(d0 - 0.05, d1 + 0.05, 2.1, 2.18, zp - 0.08, zp + 0.08, DK)
    px0, px1, py0, py1, pz = -1.45, -0.15, 1.15, 2.05, zp + 0.062                                                                                               # 山水掛畫（色塊：遠山、近山、留白）
    vc().cbox(px0 - 0.04, px1 + 0.04, py0 - 0.04, py1 + 0.04, pz, pz + 0.02, DK); vc().poly([(px0, py0, pz + 0.022), (px1, py0, pz + 0.022), (px1, py1, pz + 0.022), (px0, py1, pz + 0.022)], '#e8dfc8')
    for (ax, bx, cx, ty, col) in ((px0 + 0.1, px0 + 0.75, px0 + 0.4, py1 - 0.2, '#a8a898'), (px0 + 0.45, px1 - 0.05, px0 + 0.9, py1 - 0.32, '#8a8c80'), (px0, px0 + 0.6, px0 + 0.22, py0 + 0.42, '#5a5e54'), (px0 + 0.5, px1, px1 - 0.3, py0 + 0.36, '#6a6e62')):
        vc().poly([(ax, py0 + 0.08, pz + 0.024), (bx, py0 + 0.08, pz + 0.024), (cx, ty, pz + 0.024)], col)
    PRE = ''
    xe = W / 2 - 0.012                                                                                                                                         # 書法掛軸（東牆，門邊）：米白紙、幾筆墨
    vc().poly([(xe, 0.95, 3.75), (xe, 0.95, 3.25), (xe, 2.35, 3.25), (xe, 2.35, 3.75)], '#efe6d0'); vc().cbox(xe - 0.02, xe, 2.35, 2.39, 3.2, 3.8, DK); vc().cbox(xe - 0.02, xe, 0.91, 0.95, 3.2, 3.8, DK)
    for i in range(5): vc().poly([(xe - 0.004, 2.12 - i * 0.24, 3.6 - (i % 2) * 0.05), (xe - 0.004, 2.12 - i * 0.24, 3.42 + (i % 2) * 0.04), (xe - 0.004, 2.28 - i * 0.24, 3.4 + (i % 3) * 0.03), (xe - 0.004, 2.28 - i * 0.24, 3.58)], '#1d1f22')
    # ----- 書房的門（關著；解鎖以後不顯示）、蓋子（從上面看是深色的屋頂；解鎖以後不顯示） -----
    PRE = 'STUDY_DOOR:'
    mesh('wood_d').box(d0 + 0.05, d1 - 0.05, 0.0, 2.1, zp - 0.025, zp + 0.025)
    for (a_, b_, y0, y1) in ((d0 + 0.15, d1 - 0.15, 0.2, 0.95), (d0 + 0.15, d1 - 0.15, 1.1, 1.95)): vc().cbox(a_, b_, y0, y1, zp + 0.025, zp + 0.035, '#33200f')
    ccyl(vm(), (d0 + 0.14, 1.02, zp + 0.025), (d0 + 0.14, 1.02, zp + 0.08), 0.025, '#b8923a', seg=8)
    PRE = 'STUDY_LID:'
    vc().cbox(SD['x0'] - T, SD['x1'] + T, H + 0.1, H + 0.2, SD['z0'] - T, SD['z1'] + 0.06, '#2a2622')
    # ----- 後半：私人書房 -----
    PRE = 'STUDY:'
    bookcase(-W / 2, -W / 2 + 0.45, SD['z0'] + 0.5, SD['z1'] - 0.1, 2.8, LAW, 'W', base=0.12, gap=0.38)
    bookcase(-W / 2, W / 2, SD['z0'], SD['z0'] + 0.45, 2.8, LAW, 'N', base=0.12, gap=0.38)
    dx, dz = SD['seat']['x'], SD['blocks'][2][1]                                                                                                                                         # 老式木書桌（面向門）
    mesh('wood_d').rbox(dx - 0.75, dx + 0.75, 0.72, 0.77, dz - 0.4, dz + 0.4, r=0.012, seg=2)
    for sx in (-1, 1): mesh('wood_d').box(dx + sx * 0.72 - (0.38 if sx > 0 else 0.0), dx + sx * 0.72 + (0.38 if sx < 0 else 0.0), 0.0, 0.72, dz - 0.36, dz + 0.36)
    for sx in (-1, 1):
        for y in (0.2, 0.45): cx = dx + sx * 0.53; vc().cbox(cx - 0.16, cx + 0.16, y - 0.1, y + 0.1, dz - 0.37, dz - 0.36, '#2f1c10'); ccyl(vm(), (cx, y, dz - 0.37), (cx, y, dz - 0.39), 0.015, '#b8923a', seg=6)
    chair(SD['seat']['x'], SD['seat']['z'], SD['seat']['yaw'], wood=DK, pad='#4a2a22')
    ccyl(vm(), (dx - 0.55, 0.77, dz - 0.2), (dx - 0.55, 0.79, dz - 0.2), 0.08, '#b8923a', seg=10); ccyl(vm(), (dx - 0.55, 0.79, dz - 0.2), (dx - 0.55, 1.08, dz - 0.2), 0.01, '#b8923a', seg=6)     # 綠罩銀行燈
    vc().crbox(dx - 0.72, dx - 0.38, 1.06, 1.14, dz - 0.27, dz - 0.13, '#2f6a4a', r=0.03); mesh('light').box(dx - 0.68, dx - 0.42, 1.045, 1.06, dz - 0.25, dz - 0.15)
    for i, (px, pz, n) in enumerate(((dx + 0.45, dz - 0.15, 6), (dx + 0.5, dz + 0.2, 3), (dx - 0.1, dz + 0.22, 9))):                                             # 手稿、舊講義（一疊一疊泛黃的紙）
        for k in range(n): vc().cbox(px - 0.11 + (k % 2) * 0.008, px + 0.11 + (k % 3) * 0.006, 0.77 + k * 0.012, 0.782 + k * 0.012, pz - 0.15, pz + 0.15, ('#efe6cc', '#e6dab8', '#f4eedc')[k % 3])
    vc().cbox(dx - 0.2, dx + 0.2, 0.77, 0.79, dz - 0.3, dz - 0.02, '#e8e0c8'); vc().cbox(dx - 0.005, dx + 0.005, 0.77, 0.795, dz - 0.3, dz - 0.02, '#8a7a5a')     # 攤開的書
    ccyl(vc(), (dx + 0.12, 0.795, dz - 0.25), (dx + 0.26, 0.8, dz - 0.1), 0.006, '#1d1f22', seg=5)                                                                # 鋼筆
    for sx in (-0.035, 0.035): ccyl(vm(), (dx - 0.3 + sx, 0.772, dz + 0.05), (dx - 0.3 + sx, 0.776, dz + 0.05), 0.028, '#3a3a3c', seg=10)                          # 眼鏡
    for i in range(3): vc().cbox(dx + 0.2 + i * 0.01, dx + 0.28 + i * 0.01, 0.77 + i * 0.002, 0.772 + i * 0.002, dz - 0.36 + i * 0.01, dz - 0.28 + i * 0.01, '#f2d85a')   # 便條紙
    vc().cbox(-0.9, 1.9, 0.0, 0.012, -4.3, -2.0, '#5a2a2a'); vc().cbox(-0.8, 1.8, 0.012, 0.014, -4.2, -2.1, '#6a3a30')                                              # 舊地毯
    # 東牆：矮櫃（舊講義、學生來信的木盒、私人紀念物）、學術合照、獎狀
    lx0, lx1, lz0, lz1 = 1.75, 2.3, -2.4, -1.5; mesh('wood_d').box(lx0, lx1, 0.0, 0.8, lz0, lz1)
    for k in range(10): vc().cbox(lx0 + 0.08, lx0 + 0.34, 0.8 + k * 0.014, 0.814 + k * 0.014, lz0 + 0.06 + (k % 2) * 0.01, lz0 + 0.34, ('#e6dab8', '#efe6cc', '#d9cca8')[k % 3])
    vc().crbox(lx0 + 0.08, lx0 + 0.42, 0.8, 0.94, lz1 - 0.4, lz1 - 0.08, '#7a5636', r=0.01)
    for k in range(5): vc().cbox(lx0 + 0.11 + k * 0.05, lx0 + 0.13 + k * 0.05, 0.9, 0.98, lz1 - 0.37, lz1 - 0.11, ('#f4eedc', '#e8dcc0', '#dfe6ee')[k % 3])               # 信
    blob(lx0 + 0.25, 0.86, -1.95, 0.05, '#b8923a'); ccyl(vc(), (lx0 + 0.25, 0.8, -1.95), (lx0 + 0.25, 0.82, -1.95), 0.06, DK, seg=8)                                    # 小獎座
    xe = W / 2 - 0.012; fz0, fz1 = -3.75, -2.95                                                                                                                      # 學術合照：深色框、泛黃的照片、兩排人影
    vc().cbox(xe - 0.02, xe, 1.38, 1.98, fz0 - 0.04, fz1 + 0.04, DK); vc().poly([(xe - 0.022, 1.42, fz1), (xe - 0.022, 1.42, fz0), (xe - 0.022, 1.94, fz0), (xe - 0.022, 1.94, fz1)], '#d9cfb4')
    for r_ in range(2):
        for i in range(7 - r_): zz = fz0 + 0.1 + r_ * 0.05 + i * 0.1; vc().poly([(xe - 0.024, 1.47 + r_ * 0.16, zz + 0.07), (xe - 0.024, 1.47 + r_ * 0.16, zz), (xe - 0.024, 1.62 + r_ * 0.16, zz), (xe - 0.024, 1.62 + r_ * 0.16, zz + 0.07)], ('#3a3a40', '#4a4a50', '#2f3338')[(i + r_) % 3])
    for (a_, b_) in ((-4.35, -4.0), (-2.75, -2.45)): vc().cbox(xe - 0.02, xe, 1.5, 1.95, a_ - 0.03, b_ + 0.03, DK); vc().poly([(xe - 0.022, 1.53, b_), (xe - 0.022, 1.53, a_), (xe - 0.022, 1.92, a_), (xe - 0.022, 1.92, b_)], '#efe8d4')
    for zz in (-4.55,): ccyl(vm(), (xe, 2.2, zz), (xe - 0.12, 2.2, zz), 0.012, '#b8923a', seg=6); mesh('light').sphere((xe - 0.14, 2.18, zz), 0.07, seg=8, rings=5)
    lantern(0.3, -3.0, y=2.35, r=0.16)
    for i, (px, pz, n) in enumerate(((-1.55, -1.75, 14), (-1.3, -1.6, 8), (1.4, -4.35, 11))):                                                                         # 地上的書堆
        for k in range(n): vc().cbox(px - 0.12 + (k % 3) * 0.01, px + 0.12 - (k % 2) * 0.012, k * 0.035, k * 0.035 + 0.033, pz - 0.16 + (k % 2) * 0.012, pz + 0.16, LAW[(k * 2 + i) % len(LAW)])
    PRE = ''


# ---------- 越好吃小館（TINGZHOU-SHOPS5-1110；LAWWW2-C 2026-11-12）----------
# 使用者只給外觀概念圖（深木框玻璃、藤編吊燈、木桌椅、照片菜單、大盆栽）；室內是照外觀看進去的樣子設計的越南河粉小館
if SHOP == 'yuehaochi':
    CT = J['counter']; KT = J['kitchen']; PT = J['partition']; DC = J['decor']; HB = J['herbBar']; FG = J['fridge']
    WD, WD2, TEAL, RED = '#3a2416', '#5a3a22', '#2f6f6a', '#8a2a2a'
    # 牆：下半深木護牆板（1.0 m）、上緣木線條；左牆、右牆
    for sx in (-1, 1):
        xw = sx * (W / 2 - 0.02); x0, x1 = min(xw, sx * W / 2), max(xw, sx * W / 2)
        z1_ = D / 2 if sx < 0 else FG['z0']
        mesh('wood_d').box(x0, x1, 0.0, 1.0, PT['z'] if sx < 0 else HB['z1'], z1_); vc().cbox(x0 - 0.01 if sx > 0 else x0, x1 if sx > 0 else x1 + 0.01, 1.0, 1.05, PT['z'] if sx < 0 else HB['z1'], z1_, WD2)
    # 桌椅：四人桌（木桌面＋四支深色桌腳）、兩人桌（單柱）
    for t in J['tables']:
        x, z, w_, d_ = t['x'], t['z'], t['w'], t['d']
        mesh('wood').rbox(x - w_ / 2, x + w_ / 2, 0.71, 0.76, z - d_ / 2, z + d_ / 2, r=0.012, seg=2)
        if t['kind'] == 'two': ccyl(vm(), (x, 0.03, z), (x, 0.71, z), 0.035, '#2b2b2b', seg=8); ccyl(vm(), (x, 0.0, z), (x, 0.03, z), 0.22, '#2b2b2b', seg=14)
        else:
            for sx in (-1, 1):
                for sz in (-1, 1): mesh('wood_d').box(x + sx * (w_ / 2 - 0.07) - 0.03, x + sx * (w_ / 2 - 0.07) + 0.03, 0, 0.71, z + sz * (d_ / 2 - 0.07) - 0.03, z + sz * (d_ / 2 - 0.07) + 0.03)
        table_set(x + (0.3 if t['kind'] == 'four' else 0.0), 0.76, z - (0.0 if t['kind'] == 'four' else 0.15))
        # 桌上：筷子筒旁邊一小碟檸檬辣椒、是拉差和海鮮醬的瓶子
        bx = x - (0.35 if t['kind'] == 'four' else 0.18)
        ccyl(vc(), (bx, 0.76, z + 0.1), (bx, 0.93, z + 0.1), 0.028, '#c8301e', seg=8); ccyl(vc(), (bx, 0.93, z + 0.1), (bx, 0.97, z + 0.1), 0.012, '#2f8a3a', seg=6)
        ccyl(vc(), (bx + 0.08, 0.76, z + 0.1), (bx + 0.08, 0.9, z + 0.1), 0.026, '#3a2418', seg=8)
        ccyl(vc(), (bx + 0.04, 0.76, z - 0.08), (bx + 0.04, 0.775, z - 0.08), 0.06, '#f4f1ea', seg=10); blob(bx + 0.03, 0.785, z - 0.08, 0.02, '#c9d94a', sy=0.6); blob(bx + 0.06, 0.785, z - 0.07, 0.014, '#c8301e', sy=0.6)
    for q in J['seats']: chair(q['x'], q['z'], q['yaw'], wood=WD, pad='#7a4a2a')
    # 木櫃台：正面竹編（一條一條深淺）、深色檯面、底下燈條；收銀螢幕、外帶袋、小盆竹子
    mesh('wood').box(CT['x0'], CT['x1'], 0.08, CT['h'] - 0.05, CT['z0'], CT['z1']); mesh('wood_d').rbox(CT['x0'] - 0.04, CT['x1'] + 0.04, CT['h'] - 0.05, CT['h'], CT['z0'] - 0.03, CT['z1'] + 0.06, r=0.012, seg=2)
    vc().cbox(CT['x0'], CT['x1'], 0.0, 0.08, CT['z0'], CT['z1'] - 0.05, '#2b2018'); mesh('light').box(CT['x0'] + 0.05, CT['x1'] - 0.05, 0.085, 0.11, CT['z1'] - 0.03, CT['z1'] + 0.005)
    nb = 34
    for i in range(nb): xx = CT['x0'] + 0.04 + i * (CT['x1'] - CT['x0'] - 0.08) / (nb - 1); ccyl(vc(), (xx, 0.12, CT['z1'] + 0.012), (xx, CT['h'] - 0.07, CT['z1'] + 0.012), 0.014, ('#c9a45a', '#b8903f', '#d9b872')[i % 3], seg=5)
    cx = J['clerk']['x']; vc().cbox(cx + 0.5, cx + 0.95, CT['h'] + 0.1, CT['h'] + 0.42, CT['z0'] + 0.15, CT['z0'] + 0.19, '#1f2023'); ccyl(vc(), (cx + 0.72, CT['h'], CT['z0'] + 0.17), (cx + 0.72, CT['h'] + 0.12, CT['z0'] + 0.17), 0.03, '#1f2023', seg=6)
    for i in range(4): vc().cbox(CT['x1'] - 0.75 + i * 0.03, CT['x1'] - 0.45 + i * 0.03, CT['h'], CT['h'] + 0.3 - i * 0.02, CT['z0'] + 0.1 + i * 0.07, CT['z0'] + 0.15 + i * 0.07, ('#c9a878', '#b8946a')[i % 2])   # 外帶紙袋
    clathe(vc(), [(0.0, 0.0), (0.06, 0.0), (0.07, 0.1), (0.0, 0.1)], CT['x0'] + 0.35, CT['h'], (CT['z0'] + CT['z1']) / 2, '#f4f1ea', seg=10)
    for i in range(5): bxx = CT['x0'] + 0.35 + (i - 2) * 0.02; ccyl(vc(), (bxx, CT['h'] + 0.1, (CT['z0'] + CT['z1']) / 2), (bxx + (i - 2) * 0.015, CT['h'] + 0.42 + (i % 2) * 0.1, (CT['z0'] + CT['z1']) / 2 + (i % 3 - 1) * 0.02), 0.01, '#5a8a3a', seg=5); blob(bxx + (i - 2) * 0.02, CT['h'] + 0.5 + (i % 2) * 0.1, (CT['z0'] + CT['z1']) / 2, 0.04, '#6a9a4a', sy=0.5)
    # 開放式廚房：後牆白磁磚（淺色）、不鏽鋼工作台、兩口大湯鍋（冒著熱氣的樣子用淺色的蓋）、燙麵爐、排煙罩、層架上的碗
    zk0, zk1 = KT['z0'], KT['z1']
    vc().cbox(KT['x0'], KT['x1'], 0.9, 2.3, zk0, zk0 + 0.02, '#eef0ee')
    for i in range(1, 9): vc().cbox(KT['x0'], KT['x1'], 0.9 + i * 0.155, 0.905 + i * 0.155, zk0 + 0.02, zk0 + 0.023, '#cfd3d2')
    mesh('steel').box(KT['x0'] + 0.05, KT['x1'] - 0.85, 0.0, 0.9, zk0 + 0.03, zk0 + 0.72)
    mesh('steel').box(KT['x0'] + 0.5, KT['x1'] - 0.95, 1.95, 2.4, zk0 + 0.05, zk0 + 0.95)
    for i, (px_, r_) in enumerate(((KT['x0'] + 0.75, 0.24), (KT['x0'] + 1.45, 0.24), (KT['x0'] + 2.15, 0.17))):
        ccyl(vm(), (px_, 0.9, zk0 + 0.4), (px_, 0.9 + (0.42 if i < 2 else 0.2), zk0 + 0.4), r_, '#b9bdc1', seg=14); ccyl(vm(), (px_, 0.9 + (0.42 if i < 2 else 0.2), zk0 + 0.4), (px_, 0.92 + (0.42 if i < 2 else 0.2), zk0 + 0.4), r_ * 0.94, '#d8c9a0' if i < 2 else '#8a8d90', seg=14)
        for hx in (-1, 1): vc().cbox(px_ + hx * r_ - 0.02, px_ + hx * r_ + 0.02, 0.9 + (0.3 if i < 2 else 0.12), 0.93 + (0.3 if i < 2 else 0.12), zk0 + 0.36, zk0 + 0.44, '#3a3a3c')
    mesh('steel').box(KT['x1'] - 0.75, KT['x1'] - 0.05, 0.0, 1.9, zk0 + 0.05, zk0 + 0.7); vc().cbox(KT['x1'] - 0.42, KT['x1'] - 0.39, 0.9, 1.5, zk0 + 0.7, zk0 + 0.72, '#6a6d70')
    for y in (1.3, 1.62):
        mesh('steel').box(KT['x0'] + 0.1, KT['x0'] + 1.5, y, y + 0.02, zk0 + 0.03, zk0 + 0.32)
        for i in range(7): bx_ = KT['x0'] + 0.25 + i * 0.18; clathe(vc(), [(0.0, 0.0), (0.035, 0.0), (0.08, 0.07), (0.0, 0.07)], bx_, y + 0.02, zk0 + 0.18, ('#f4f1ea', '#e8e4d8')[i % 2], seg=10)
    for sx in (KT['x0'], KT['x1'] - 0.08): vc().cbox(sx, sx + 0.08, 0.0, H, zk1 - 0.08, zk1, '#e9dcc0')
    vc().cbox(KT['x0'], KT['x1'], 2.5, H, zk1 - 0.08, zk1, '#e9dcc0')
    # 廚房開口上方：店名木匾（概念圖招牌裁的）
    pic('sign', [(KT['x0'] + 0.55, 2.56, zk1 + 0.012), (KT['x1'] - 0.55, 2.56, zk1 + 0.012), (KT['x1'] - 0.55, 3.08, zk1 + 0.012), (KT['x0'] + 0.55, 3.08, zk1 + 0.012)])
    vc().cbox(KT['x0'] + 0.5, KT['x1'] - 0.5, 2.52, 3.12, zk1, zk1 + 0.01, WD)
    # 左後方的隔牆和藍染布簾的門
    d0, d1 = PT['door']; WC = J.get('wallColor', '#f0e6cf')
    vc().cbox(PT['x0'], d0, 0.0, H, PT['z'] - 0.1, PT['z'], WC); vc().cbox(d1, PT['x1'], 0.0, H, PT['z'] - 0.1, PT['z'], WC); vc().cbox(d0, d1, 2.15, H, PT['z'] - 0.1, PT['z'], WC)
    for i in range(8): a = d0 + i * (d1 - d0) / 8; vc().cbox(a, a + (d1 - d0) / 8 - 0.005, 0.5, 2.15, PT['z'] - 0.06 + (i % 2) * 0.02, PT['z'] - 0.045 + (i % 2) * 0.02, ('#2f4f7a', '#3a5f8a')[i % 2])
    vc().cbox(d0 - 0.05, d1 + 0.05, 2.15, 2.2, PT['z'] - 0.11, PT['z'] + 0.01, WD)
    # 右牆：照片菜單板（概念圖裁的）
    MB = DC['menuBoard']; xe = W / 2 - 0.03; vc().cbox(W / 2 - 0.04, W / 2, MB['y0'] - 0.05, MB['y1'] + 0.05, MB['z0'] - 0.05, MB['z1'] + 0.05, WD2)
    pic('menu', [(xe - 0.012, MB['y0'], MB['z0']), (xe - 0.012, MB['y0'], MB['z1']), (xe - 0.012, MB['y1'], MB['z1']), (xe - 0.012, MB['y1'], MB['z0'])])
    # 左牆：三頂斗笠（淺圓錐＋下巴的紅帶子），中間掛一幅藍染布
    for hh in DC['hats']:
        zc, yc = hh['z'], hh['y']; xw = -W / 2 + 0.03
        ccyl(vc(), (xw, yc, zc), (xw + 0.16, yc, zc), 0.3, '#e6d3a0', seg=18, r2=0.012, caps=True)
        for k in range(1, 4): ccyl(vc(), (xw + 0.16 - k * 0.04, yc, zc), (xw + 0.165 - k * 0.04, yc, zc), 0.075 * k + 0.004, '#c9b278', seg=18, caps=False)
        vc().cbox(xw, xw + 0.012, yc - 0.52, yc - 0.28, zc - 0.012, zc + 0.012, RED)
    vc().cbox(-W / 2 + 0.02, -W / 2 + 0.035, 1.35, 2.35, 2.35, 3.0, '#2f4f7a'); vc().cbox(-W / 2 + 0.035, -W / 2 + 0.04, 1.6, 2.1, 2.5, 2.85, '#e8e4d8'); ccyl(vc(), (-W / 2 + 0.03, 2.37, 2.3), (-W / 2 + 0.03, 2.37, 3.05), 0.012, WD, seg=5)
    # 自助香草檯（右牆、櫃台前）：木檯、不鏽鋼盆裡的九層塔、豆芽、檸檬角、辣椒；魚露、是拉差
    mesh('wood').box(HB['x0'], HB['x1'], 0.0, HB['h'] - 0.04, HB['z0'], HB['z1']); mesh('wood_d').rbox(HB['x0'] - 0.03, HB['x1'], HB['h'] - 0.04, HB['h'], HB['z0'] - 0.03, HB['z1'] + 0.03, r=0.01, seg=2)
    for i, (col, kind) in enumerate((('#4f8a3a', 'leaf'), ('#efe9d2', 'sprout'), ('#d9d94a', 'lime'), ('#c8301e', 'chili'))):
        zc = HB['z0'] + 0.17 + i * 0.25; xc = (HB['x0'] + HB['x1']) / 2 - 0.05
        vm().cbox(xc - 0.16, xc + 0.16, HB['h'], HB['h'] + 0.07, zc - 0.1, zc + 0.1, '#b9bdc1')
        for k in range(9): blob(xc + RR.uniform(-0.12, 0.12), HB['h'] + 0.08 + RR.uniform(0, 0.03), zc + RR.uniform(-0.07, 0.07), 0.035 if kind != 'sprout' else 0.028, col, sy=0.55)
    for i in range(3): ccyl(vc(), (HB['x1'] - 0.12, HB['h'], HB['z0'] + 0.2 + i * 0.3), (HB['x1'] - 0.12, HB['h'] + 0.2, HB['z0'] + 0.2 + i * 0.3), 0.03, ('#c8301e', '#6a3a1a', '#c8301e')[i], seg=8)
    vc().cbox(HB['x1'] - 0.05, HB['x1'] - 0.035, 1.25, 1.6, HB['z0'] + 0.2, HB['z1'] - 0.2, '#f4ead0'); vc().cbox(HB['x1'] - 0.035, HB['x1'] - 0.03, 1.3, 1.55, HB['z0'] + 0.28, HB['z1'] - 0.28, '#3a5f3a')
    # 飲料冰箱（右牆、門邊）：黑框、玻璃門、四層瓶罐、上面燈箱
    vm().cbox(FG['x0'], FG['x1'], 0.0, FG['h'], FG['z0'], FG['z1'], '#1f2023'); vc().cbox(FG['x0'] - 0.012, FG['x0'], 0.18, FG['h'] - 0.28, FG['z0'] + 0.05, FG['z1'] - 0.05, '#dfe9ea')
    mesh('light').box(FG['x0'] - 0.014, FG['x0'], FG['h'] - 0.24, FG['h'] - 0.04, FG['z0'] + 0.05, FG['z1'] - 0.05)
    for lv in range(4):
        yy = 0.24 + lv * 0.37; vc().cbox(FG['x0'] - 0.016, FG['x0'] - 0.012, yy - 0.02, yy, FG['z0'] + 0.05, FG['z1'] - 0.05, '#8a8d90')
        for k in range(7): zz = FG['z0'] + 0.1 + k * 0.085; vc().cbox(FG['x0'] - 0.02, FG['x0'] - 0.012, yy, yy + 0.2 + (k % 2) * 0.04, zz - 0.03, zz + 0.03, ('#e8b23a', '#3a8a5a', '#c8301e', '#f4f1ea', '#6a3a1a', '#3a6a9a')[(k + lv * 2) % 6])
    vc().cbox(FG['x0'] - 0.03, FG['x0'] - 0.012, 0.9, 1.3, FG['z0'] + 0.06, FG['z0'] + 0.09, '#b9bdc1')
    # 會安燈籠（彩色絲布燈籠：上下收口的橢圓、底下流蘇）、藤編吊燈（桌子上方）
    def lantern(x, z, y, col, r=0.17):
        ccyl(vc(), (x, y + r * 1.3, z), (x, H, z), 0.005, '#2b2b2b', seg=4)
        prof = [(0.05, 1.25), (0.6, 1.0), (1.0, 0.45), (1.0, -0.2), (0.6, -0.85), (0.05, -1.1)]
        for (r0, y0), (r1, y1) in zip(prof, prof[1:]): ccyl(vc(), (x, y + y1 * r, z), (x, y + y0 * r, z), r1 * r, col, seg=12, r2=r0 * r, caps=False)
        ccyl(vc(), (x, y - r * 1.1, z), (x, y - r * 1.75, z), 0.012, '#e8c86a', seg=5); mesh('light').sphere((x, y, z), r * 0.42, seg=8, rings=5)
    for (lx, lz, ly, lc) in DC['lanterns']: lantern(lx, lz, ly, lc)
    for (px, pz) in DC['pendants']: pendant(px, pz, y=2.2)
    # 大盆栽（窗邊，概念圖門口那種闊葉）、窗台上的小盆
    for (px, pz) in DC['plants']:
        clathe(vc(), [(0.0, 0.0), (0.17, 0.0), (0.22, 0.4), (0.0, 0.4)], px, 0.0, pz, '#a8573a', seg=12); ccyl(vc(), (px, 0.4, pz), (px, 1.15, pz), 0.025, '#6a5038', seg=5); fern(px, 1.15, pz, r=0.4, n=24)
    for i in range(3):
        wx = -2.3 + i * 0.75; clathe(vc(), [(0.0, 0.0), (0.06, 0.0), (0.075, 0.1), (0.0, 0.1)], wx, sill, zS - 0.08, ('#e8e0d0', '#a8573a', '#e8e0d0')[i], seg=8); fern(wx, sill + 0.14, zS - 0.08, r=0.12, n=7)
    # 天花板：軌道燈、冷氣出風口；地上門口紅色腳踏墊（概念圖）
    vc().cbox(-0.02, 0.02, H - 0.06, H - 0.03, -2.2, 4.2, '#2b2b2b'); vc().cbox(0.0, 1.5, 0.001, 0.012, 3.55, 4.4, '#8a2a2a')
    vc().cbox(-0.5, 0.5, H - 0.08, H - 0.02, 1.9, 2.9, '#e6dcc6'); vc().cbox(-0.42, 0.42, H - 0.09, H - 0.08, 1.98, 2.82, '#bfb6a2')
    PRE = 'CEIL:'
    for i in range(6): z = -1.8 + i * 1.15; ccyl(vc(), (0.0, H - 0.06, z), (0.1 if i % 2 else -0.1, H - 0.24, z), 0.04, '#2b2b2b', seg=8); mesh('light').cyl((0.1 if i % 2 else -0.1, H - 0.245, z), (0.11 if i % 2 else -0.11, H - 0.255, z), 0.033, seg=8)
    PRE = ''


# ---------- 客居雲南（TINGZHOU-SHOPS5-1110；LAWWW2-C 2026-11-12）----------
# 使用者只給外觀概念圖（酒紅雨棚、木桌圓凳、藤編吊燈、酒紅牆上的照片菜單、後面櫃台）；室內是照外觀看進去的樣子設計的雲南米線小館
if SHOP == 'keju':
    CT = J['counter']; KT = J['kitchen']; PT = J['partition']; DC = J['decor']; TS = J['teaShelf']
    WD, WD2, WINE, INDIGO = '#4a2a1a', '#6a4028', '#7a2a2a', '#24456e'
    def stool(x, z, col='#8a5a34'):
        """圓木凳（概念圖門口那種）：圓座面、四支外張的腳、一圈橫撐"""
        ccyl(vc(), (x, 0.42, z), (x, 0.46, z), 0.17, col, seg=14)
        for k in range(4): a = PI / 4 + k * PI / 2; ccyl(vc(), (x + math.cos(a) * 0.15, 0.0, z + math.sin(a) * 0.15), (x + math.cos(a) * 0.1, 0.42, z + math.sin(a) * 0.1), 0.018, '#5a3a22', seg=5)
        ccyl(vc(), (x, 0.17, z), (x, 0.19, z), 0.13, '#5a3a22', seg=10, caps=False)
    def claypot(x, y, z, r=0.085):
        """過橋米線的小砂鍋：深褐色、兩個耳、淺色的蓋"""
        clathe(vc(), [(0.0, 0.0), (r * 0.7, 0.0), (r, r * 0.55), (r * 0.95, r * 0.9), (0.0, r * 0.9)], x, y, z, '#4a3226', seg=12)
        ccyl(vc(), (x, y + r * 0.9, z), (x, y + r * 1.1, z), r * 0.9, '#6a4a36', seg=12, r2=r * 0.3); 
        for sx in (-1, 1): vc().cbox(x + sx * r - 0.012, x + sx * r + 0.012, y + r * 0.6, y + r * 0.75, z - 0.02, z + 0.02, '#4a3226')
    # 牆：兩側下半深木護牆板；右牆（照片菜單那一段）上半酒紅色
    for sx in (-1, 1):
        xw = sx * (W / 2 - 0.02); x0, x1 = min(xw, sx * W / 2), max(xw, sx * W / 2); za = PT['z'] if sx < 0 else TS['z1']
        mesh('wood_d').box(x0, x1, 0.0, 1.0, za, D / 2); vc().cbox(x0 - (0.01 if sx > 0 else 0), x1 + (0.01 if sx < 0 else 0), 1.0, 1.05, za, D / 2, WD2)
    vc().cbox(W / 2 - 0.015, W / 2, 1.05, H, TS['z1'], D / 2, WINE)
    for yy in (1.12, H - 0.1): vc().cbox(W / 2 - 0.02, W / 2 - 0.015, yy, yy + 0.03, TS['z1'], D / 2, '#c9a45a')
    # 桌子、圓凳；桌上：筷子筒、面紙盒、辣油罐、一只小砂鍋
    for t in J['tables']:
        x, z, w_, d_ = t['x'], t['z'], t['w'], t['d']
        mesh('wood').rbox(x - w_ / 2, x + w_ / 2, 0.71, 0.76, z - d_ / 2, z + d_ / 2, r=0.012, seg=2)
        if t['kind'] == 'two': ccyl(vm(), (x, 0.03, z), (x, 0.71, z), 0.035, '#2b2b2b', seg=8); ccyl(vm(), (x, 0.0, z), (x, 0.03, z), 0.22, '#2b2b2b', seg=14)
        else:
            for sx in (-1, 1):
                for sz in (-1, 1): mesh('wood_d').box(x + sx * (w_ / 2 - 0.07) - 0.03, x + sx * (w_ / 2 - 0.07) + 0.03, 0, 0.71, z + sz * (d_ / 2 - 0.07) - 0.03, z + sz * (d_ / 2 - 0.07) + 0.03)
        table_set(x + (0.32 if t['kind'] == 'four' else 0.0), 0.76, z - (0.0 if t['kind'] == 'four' else 0.16))
        if t['id'] in (1, 3): claypot(x - 0.25, 0.76, z + 0.05); ccyl(vc(), (x - 0.25, 0.76, z + 0.05), (x - 0.25, 0.765, z + 0.05), 0.12, '#e8e0d0', seg=12)
    for q in J['seats']: stool(q['x'], q['z'])
    # 木櫃台：正面直條木板＋一條酒紅飾帶；檯面上收銀螢幕、疊著的砂鍋、三罐配料
    mesh('wood').box(CT['x0'], CT['x1'], 0.08, CT['h'] - 0.05, CT['z0'], CT['z1']); mesh('wood_d').rbox(CT['x0'] - 0.04, CT['x1'] + 0.04, CT['h'] - 0.05, CT['h'], CT['z0'] - 0.03, CT['z1'] + 0.06, r=0.012, seg=2)
    vc().cbox(CT['x0'], CT['x1'], 0.0, 0.08, CT['z0'], CT['z1'] - 0.05, '#2b2018'); mesh('light').box(CT['x0'] + 0.05, CT['x1'] - 0.05, 0.085, 0.11, CT['z1'] - 0.03, CT['z1'] + 0.005)
    for i in range(22): xx = CT['x0'] + 0.05 + i * (CT['x1'] - CT['x0'] - 0.1) / 21; vc().cbox(xx - 0.02, xx + 0.02, 0.12, CT['h'] - 0.06, CT['z1'], CT['z1'] + 0.012, '#7a5636' if i % 2 else '#8a6442')
    vc().cbox(CT['x0'], CT['x1'], 0.72, 0.8, CT['z1'] + 0.012, CT['z1'] + 0.016, WINE)
    cx = J['clerk']['x']; vc().cbox(cx + 0.45, cx + 0.9, CT['h'] + 0.1, CT['h'] + 0.42, CT['z0'] + 0.15, CT['z0'] + 0.19, '#1f2023'); ccyl(vc(), (cx + 0.67, CT['h'], CT['z0'] + 0.17), (cx + 0.67, CT['h'] + 0.12, CT['z0'] + 0.17), 0.03, '#1f2023', seg=6)
    for k in range(3): claypot(CT['x0'] + 0.3, CT['h'] + k * 0.085, (CT['z0'] + CT['z1']) / 2)
    for k in range(2): claypot(CT['x0'] + 0.52, CT['h'] + k * 0.085, (CT['z0'] + CT['z1']) / 2 + 0.03)
    for i, col in enumerate(('#6a7a3a', '#3f7a3a', '#d9c98a')):
        jx = CT['x0'] + 0.95 + i * 0.2; ccyl(vc(), (jx, CT['h'], CT['z1'] - 0.16), (jx, CT['h'] + 0.2, CT['z1'] - 0.16), 0.07, '#dfe6e4', seg=10); ccyl(vc(), (jx, CT['h'] + 0.01, CT['z1'] - 0.16), (jx, CT['h'] + 0.15, CT['z1'] - 0.16), 0.062, col, seg=10); ccyl(vc(), (jx, CT['h'] + 0.2, CT['z1'] - 0.16), (jx, CT['h'] + 0.23, CT['z1'] - 0.16), 0.072, '#8a5a34', seg=10)
    # 開放式廚房：後牆白磁磚、不鏽鋼台、一排六口小砂鍋爐、大湯桶、排煙罩、冰箱、層架上的碗
    zk0, zk1 = KT['z0'], KT['z1']
    vc().cbox(KT['x0'], KT['x1'], 0.9, 2.3, zk0, zk0 + 0.02, '#eef0ee')
    for i in range(1, 9): vc().cbox(KT['x0'], KT['x1'], 0.9 + i * 0.155, 0.905 + i * 0.155, zk0 + 0.02, zk0 + 0.023, '#cfd3d2')
    mesh('steel').box(KT['x0'] + 0.05, KT['x1'] - 0.8, 0.0, 0.9, zk0 + 0.03, zk0 + 0.72); mesh('steel').box(KT['x0'] + 0.3, KT['x1'] - 0.9, 1.95, 2.4, zk0 + 0.05, zk0 + 0.95)
    for i in range(6): px_ = KT['x0'] + 0.35 + i * 0.27; ccyl(vm(), (px_, 0.9, zk0 + 0.45), (px_, 0.93, zk0 + 0.45), 0.11, '#3a3a3c', seg=10); claypot(px_, 0.93, zk0 + 0.45, r=0.09)
    ccyl(vm(), (KT['x1'] - 1.15, 0.9, zk0 + 0.4), (KT['x1'] - 1.15, 1.35, zk0 + 0.4), 0.22, '#b9bdc1', seg=14); ccyl(vm(), (KT['x1'] - 1.15, 1.35, zk0 + 0.4), (KT['x1'] - 1.15, 1.37, zk0 + 0.4), 0.2, '#e0d2a8', seg=14)
    mesh('steel').box(KT['x1'] - 0.72, KT['x1'] - 0.05, 0.0, 1.9, zk0 + 0.05, zk0 + 0.7); vc().cbox(KT['x1'] - 0.4, KT['x1'] - 0.37, 0.9, 1.5, zk0 + 0.7, zk0 + 0.72, '#6a6d70')
    for y in (1.3, 1.62):
        mesh('steel').box(KT['x0'] + 0.1, KT['x0'] + 1.3, y, y + 0.02, zk0 + 0.03, zk0 + 0.32)
        for i in range(6): clathe(vc(), [(0.0, 0.0), (0.035, 0.0), (0.085, 0.075), (0.0, 0.075)], KT['x0'] + 0.25 + i * 0.19, y + 0.02, zk0 + 0.18, ('#f4f1ea', '#e0d8c4')[i % 2], seg=10)
    for sx in (KT['x0'], KT['x1'] - 0.08): vc().cbox(sx, sx + 0.08, 0.0, H, zk1 - 0.08, zk1, '#e9dcc0')
    vc().cbox(KT['x0'], KT['x1'], 2.5, H, zk1 - 0.08, zk1, '#e9dcc0')
    pic('sign', [(KT['x0'] + 0.35, 2.58, zk1 + 0.012), (KT['x1'] - 0.35, 2.58, zk1 + 0.012), (KT['x1'] - 0.35, 3.06, zk1 + 0.012), (KT['x0'] + 0.35, 3.06, zk1 + 0.012)])
    vc().cbox(KT['x0'] + 0.3, KT['x1'] - 0.3, 2.54, 3.1, zk1, zk1 + 0.01, WD)
    # 左後方的隔牆和扎染布簾的門
    d0, d1 = PT['door']; WC = J.get('wallColor', '#f2e8d2')
    vc().cbox(PT['x0'], d0, 0.0, H, PT['z'] - 0.1, PT['z'], WC); vc().cbox(d1, PT['x1'], 0.0, H, PT['z'] - 0.1, PT['z'], WC); vc().cbox(d0, d1, 2.15, H, PT['z'] - 0.1, PT['z'], WC)
    for i in range(2): a = d0 + 0.02 + i * (d1 - d0 - 0.04) / 2; vc().cbox(a + 0.01, a + (d1 - d0 - 0.04) / 2 - 0.01, 0.6, 2.15, PT['z'] - 0.05, PT['z'] - 0.035, INDIGO); ccyl(vc(), (a + (d1 - d0) / 4, 1.5, PT['z'] - 0.03), (a + (d1 - d0) / 4, 1.5, PT['z'] - 0.028), 0.16, '#e8eef2', seg=14)
    vc().cbox(d0 - 0.05, d1 + 0.05, 2.15, 2.2, PT['z'] - 0.11, PT['z'] + 0.01, WD)
    # 右牆：照片菜單板（概念圖裁的）；普洱茶餅櫃
    MB = DC['menuBoard']; xe = W / 2 - 0.035; vc().cbox(W / 2 - 0.045, W / 2 - 0.015, MB['y0'] - 0.05, MB['y1'] + 0.05, MB['z0'] - 0.05, MB['z1'] + 0.05, '#c9a45a')
    pic('menu', [(xe - 0.014, MB['y0'], MB['z0']), (xe - 0.014, MB['y0'], MB['z1']), (xe - 0.014, MB['y1'], MB['z1']), (xe - 0.014, MB['y1'], MB['z0'])])
    mesh('wood_d').box(TS['x0'] + 0.04, TS['x1'], 0.0, TS['h'], TS['z0'], TS['z1']); 
    for lv in range(5):
        yy = 0.12 + lv * 0.36; vc().cbox(TS['x0'], TS['x0'] + 0.3, yy - 0.03, yy, TS['z0'] + 0.03, TS['z1'] - 0.03, WD2); vc().cbox(TS['x0'] + 0.04, TS['x0'] + 0.3, yy, yy + 0.33, TS['z0'] + 0.03, TS['z1'] - 0.03, '#2b1c12')
        for k in range(4):
            zz = TS['z0'] + 0.17 + k * 0.255
            if (lv + k) % 3 == 2: ccyl(vc(), (TS['x0'] + 0.14, yy, zz), (TS['x0'] + 0.14, yy + 0.2, zz), 0.07, ('#7a2a2a', '#2f5f4a', '#c9a45a')[(lv + k) % 3], seg=10); ccyl(vc(), (TS['x0'] + 0.14, yy + 0.2, zz), (TS['x0'] + 0.14, yy + 0.23, zz), 0.073, '#3a2a20', seg=10)
            else:
                ccyl(vc(), (TS['x0'] + 0.03, yy + 0.15, zz), (TS['x0'] + 0.065, yy + 0.15, zz), 0.105, ('#e8dcc0', '#d9c9a0')[(lv + k) % 2], seg=14)   # 立著的茶餅（紙包）
                vc().cbox(TS['x0'] + 0.025, TS['x0'] + 0.03, yy + 0.11, yy + 0.19, zz - 0.035, zz + 0.035, ('#7a2a2a', '#2f5f4a')[(lv * 2 + k) % 2])
    vc().cbox(TS['x0'] - 0.01, TS['x1'], TS['h'], TS['h'] + 0.05, TS['z0'] - 0.02, TS['z1'] + 0.02, WD2)
    # 左牆：三幅大理扎染布（靛藍底、白色的圓和放射紋）、木桿
    xw = -W / 2 + 0.02
    for bi, bt in enumerate(DC['batiks']):
        z0, z1, y0, y1 = bt['z0'], bt['z1'], bt['y0'], bt['y1']; zc, yc = (z0 + z1) / 2, (y0 + y1) / 2
        vc().cbox(xw, xw + 0.012, y0, y1, z0, z1, INDIGO); ccyl(vc(), (xw + 0.02, y1 + 0.02, z0 - 0.06), (xw + 0.02, y1 + 0.02, z1 + 0.06), 0.014, WD, seg=5)
        for (rr, col) in ((0.42, '#e8eef2'), (0.33, INDIGO), (0.22, '#cfdce6'), (0.12, INDIGO), (0.05, '#e8eef2')): ccyl(vc(), (xw + 0.012, yc, zc), (xw + 0.0125 + (0.43 - rr) * 0.004, yc, zc), rr, col, seg=20, caps=True)
        for k in range(4):
            for (sy_, sz_) in ((1, 1), (1, -1), (-1, 1), (-1, -1)): ccyl(vc(), (xw + 0.012, yc + sy_ * 0.5, zc + sz_ * 0.5), (xw + 0.0145, yc + sy_ * 0.5, zc + sz_ * 0.5), 0.07, '#e8eef2', seg=8)
    # 天花板吊的油紙傘（撐開、傘面朝下看得到傘骨）
    for (ux, uz, uy, ucol) in DC['umbrellas']:
        ccyl(vc(), (ux, uy, uz), (ux, H, uz), 0.012, '#6a4a2a', seg=5); ccyl(vc(), (ux, uy - 0.5, uz), (ux, uy, uz), 0.012, '#6a4a2a', seg=5)
        ccyl(vc(), (ux, uy - 0.18, uz), (ux, uy, uz), 0.5, ucol, seg=16, r2=0.02, caps=False); ccyl(vc(), (ux, uy - 0.185, uz), (ux, uy - 0.005, uz), 0.495, '#e8d8a8', seg=16, r2=0.02, caps=False)
        for k in range(16): a = k * PI / 8; ccyl(vc(), (ux, uy - 0.01, uz), (ux + math.cos(a) * 0.49, uy - 0.185, uz + math.sin(a) * 0.49), 0.005, '#6a4a2a', seg=3)
    for (px, pz) in DC['pendants']: pendant(px, pz, y=2.2)
    for (px, pz) in DC['plants']:
        clathe(vc(), [(0.0, 0.0), (0.17, 0.0), (0.22, 0.4), (0.0, 0.4)], px, 0.0, pz, '#a8573a', seg=12); ccyl(vc(), (px, 0.4, pz), (px, 1.1, pz), 0.025, '#6a5038', seg=5); fern(px, 1.1, pz, r=0.38, n=22)
    vc().cbox(0.25, 1.75, 0.001, 0.012, 3.55, 4.4, WINE)                                                                 # 門口腳踏墊
    vc().cbox(1.35, 1.39, H - 0.06, H - 0.03, -2.2, 4.2, '#2b2b2b')
    PRE = 'CEIL:'
    for i in range(6): z = -1.8 + i * 1.15; ccyl(vc(), (1.37, H - 0.06, z), (1.47 if i % 2 else 1.27, H - 0.24, z), 0.04, '#2b2b2b', seg=8); mesh('light').cyl((1.47 if i % 2 else 1.27, H - 0.245, z), (1.48 if i % 2 else 1.26, H - 0.255, z), 0.033, seg=8)
    PRE = ''


# ---------- 東南大聯商行（汀州路；東南亞食品雜貨）----------
if SHOP == 'dongnan':
    WS, BS, RS, FG, RC, CT, BK = J['wallShelf'], J['backShelf'], J['rightShelf'], J['fridge'], J['rice'], J['counter'], J['baskets']
    BODY, POST, GRN, RED, YEL = '#e9e7de', '#c9c8c0', '#1f5a3e', '#d8362a', '#f0b020'
    NOOD = [['#d8362a', '#f0b020', '#e86a1c', '#f4e9c8'], ['#2f8a4a', '#f0b020', '#d8362a', '#f6f1e0'], ['#e86a1c', '#7a2a8a', '#f0d040', '#d8362a'], ['#f4c8d0', '#3a7ac0', '#f0b020', '#2f8a4a']]
    DRY = [['#f1ead6', '#e8d9a8', '#f6f1e0', '#d8362a'], ['#e8d9a8', '#2f8a4a', '#f1ead6', '#f0b020']]
    def bottles(x0, x1, y, z0, z1, along, k, hmin=0.16, hmax=0.24):
        """一排瓶子（魚露、醬油、辣醬、椰奶）：一段一段同一種——瓶身、瓶肩、瓶蓋、一圈標籤"""
        KIND = (('#5a2a14', '#d8362a', '#f0d040'), ('#2a1a10', '#f0b020', '#d8362a'), ('#c8301c', '#2f8a4a', '#f6f1e0'), ('#d89a2a', '#d8362a', '#f6f1e0'), ('#f4f1e6', '#3a7ac0', '#3a7ac0'), ('#3f7a3a', '#f0d040', '#f6f1e0'))
        a0, a1 = (z0, z1) if along == 'z' else (x0, x1); a = a0 + 0.05; run = k
        while a < a1 - 0.06:
            col, cap, lab = KIND[run % len(KIND)]; r = RR.choice((0.032, 0.038)); h = RR.uniform(hmin, hmax); e = min(a1 - 0.03, a + RR.uniform(0.4, 0.7))
            while a + r <= e:
                px, pz = ((x0 + x1) / 2, a) if along == 'z' else (a, (z0 + z1) / 2)
                ccyl(vc(), (px, y, pz), (px, y + h * 0.7, pz), r, col, seg=6, caps=False); ccyl(vc(), (px, y + h * 0.7, pz), (px, y + h, pz), r, col, seg=6, r2=r * 0.4, caps=False); ccyl(vc(), (px, y + h, pz), (px, y + h + 0.025, pz), r * 0.45, cap, seg=6)
                ccyl(vc(), (px, y + h * 0.2, pz), (px, y + h * 0.5, pz), r + 0.002, lab, seg=6, caps=False)
                a += 2 * r + 0.012
            a = e + 0.03; run += 1
    def cans(x0, x1, y, z0, z1, along, k):
        """罐頭：兩層疊著，一段一段同一種"""
        KIND = (('#d8362a', '#f6f1e0'), ('#2f8a4a', '#f0d040'), ('#f0b020', '#d8362a'), ('#3a7ac0', '#f6f1e0'), ('#f6f1e0', '#2f8a4a'))
        a0, a1 = (z0, z1) if along == 'z' else (x0, x1); a = a0 + 0.05; run = k
        while a < a1 - 0.06:
            col, lab = KIND[run % len(KIND)]; r = 0.04; h = RR.choice((0.075, 0.1)); e = min(a1 - 0.03, a + RR.uniform(0.35, 0.6))
            while a + r <= e:
                px, pz = ((x0 + x1) / 2, a) if along == 'z' else (a, (z0 + z1) / 2)
                for j in range(2): ccyl(vc(), (px, y + j * (h + 0.004), pz), (px, y + j * (h + 0.004) + h, pz), r, '#c4c8cb', seg=8); ccyl(vc(), (px, y + j * (h + 0.004) + h * 0.12, pz), (px, y + j * (h + 0.004) + h * 0.88, pz), r + 0.002, col if j == 0 else lab if run % 2 else col, seg=8, caps=False)
                a += 2 * r + 0.01
            a = e + 0.03; run += 1
    def packs(x0, x1, y, z0, z1, along, k, kind, front=1):
        """一排包裝好的東西（DONGNAN-GOODS-1112；BB 11-12 ④ FAIL：「商品是彩色方塊」＝店面標準 §12 第 2 點不用球和方塊充數）：一段一段同一種，
        kind：'noodle' 袋裝泡麵（扁袋、上緣一條封口、正面一條色帶）｜'cup' 杯麵（上寬下窄的杯子＋蓋）｜'snack' 零食大包（鼓鼓的袋子、上面捏起來的封口、色帶）｜
        'flat' 乾貨（河粉、米紙：薄薄一包立著，上半一塊標籤）。front＝正面朝哪一邊（along='z'：+1 朝 +x、−1 朝 −x；along='x'：朝 +z）。不寫品牌。"""
        PAL = {'noodle': (('#d8362a', '#f0d040'), ('#e86a1c', '#f6f1e0'), ('#2f8a4a', '#f0b020'), ('#f0b020', '#d8362a'), ('#7a2a8a', '#f0d040'), ('#f4e9c8', '#d8362a')),
               'cup': (('#f6f1e0', '#d8362a'), ('#d8362a', '#f0d040'), ('#f0b020', '#2f8a4a'), ('#2f8a4a', '#f6f1e0')),
               'snack': (('#f0b020', '#d8362a'), ('#d8362a', '#f6f1e0'), ('#3a7ac0', '#f0d040'), ('#2f8a4a', '#f0b020'), ('#f4c8d0', '#d8362a'), ('#e86a1c', '#2a1a10')),
               'flat': (('#f1ead6', '#d8362a'), ('#e8d9a8', '#2f8a4a'), ('#f6f1e0', '#f0b020'), ('#efe2c0', '#3a7ac0'))}[kind]
        DIM = {'noodle': (0.13, 0.16, 0.045), 'cup': (0.105, 0.1, 0.1), 'snack': (0.17, 0.24, 0.06), 'flat': (0.1, 0.26, 0.03)}[kind]
        a0, a1 = (z0, z1) if along == 'z' else (x0, x1); a = a0 + 0.04; run = k
        if along == 'z': fpos = (x1 - 0.03) if front > 0 else (x0 + 0.03)
        else: fpos = z1 - 0.03; front = 1
        def bx(d0, d1, ya, yb, p0, p1, col):   # d＝從正面往裡的深度；p＝沿貨架方向
            lo, hi = sorted((fpos - front * d0, fpos - front * d1))
            if along == 'z': vc().cbox(lo, hi, y + ya, y + yb, p0, p1, col)
            else: vc().cbox(p0, p1, y + ya, y + yb, lo, hi, col)
        while a < a1 - 0.08:
            col, c2 = PAL[run % len(PAL)]; w, h, t = DIM; h *= RR.uniform(0.94, 1.06); e = min(a1 - 0.03, a + RR.uniform(0.45, 0.8))
            while a + w <= e:
                if kind == 'cup':
                    pc = a + w / 2; cx_, cz_ = ((fpos - front * 0.06, pc) if along == 'z' else (pc, fpos - 0.06))
                    ccyl(vc(), (cx_, y, cz_), (cx_, y + h, cz_), 0.036, col, seg=6, r2=0.048, caps=False); ccyl(vc(), (cx_, y + h, cz_), (cx_, y + h + 0.008, cz_), 0.05, c2, seg=6); ccyl(vc(), (cx_, y + h * 0.35, cz_), (cx_, y + h * 0.7, cz_), 0.0415, c2, seg=6, r2=0.0455, caps=False)
                    if RR.random() < 0.35: ccyl(vc(), (cx_, y + h + 0.01, cz_), (cx_, y + 2 * h + 0.01, cz_), 0.036, col, seg=6, r2=0.048, caps=False); ccyl(vc(), (cx_, y + 2 * h + 0.01, cz_), (cx_, y + 2 * h + 0.018, cz_), 0.05, c2, seg=6)   # 疊兩個
                elif kind == 'noodle':
                    bx(0.004, t, 0.0, h, a, a + w, col); bx(0.016, 0.03, h, h + 0.012, a - 0.004, a + w + 0.004, col); bx(0.0, 0.004, h * 0.3, h * 0.62, a + 0.008, a + w - 0.008, c2)
                elif kind == 'snack':
                    bx(0.006, t, 0.0, h * 0.86, a, a + w, col); bx(0.022, 0.036, h * 0.86, h, a + 0.01, a + w - 0.01, col); bx(0.0, 0.006, h * 0.36, h * 0.6, a + 0.012, a + w - 0.012, c2)
                else:
                    bx(0.003, t, 0.0, h, a, a + w, col); bx(0.0, 0.003, h * 0.55, h * 0.86, a + 0.012, a + w - 0.012, c2)
                a += w + 0.012
            a = e + 0.035; run += 1
    def carton(x0, x1, y0, y1, z0, z1, col='#c9a878', band=None):
        """紙箱（DONGNAN-GOODS-1112 第 2 包；BB 11-12：還剩兩處純色方塊）：牛皮紙色箱身、頂面和兩個端面中間一條封箱膠帶、四個側面一條色帶、箱蓋的接縫"""
        vc().cbox(x0, x1, y0, y1, z0, z1, col); xm, zm, t = (x0 + x1) / 2, (z0 + z1) / 2, 0.003; tape = '#e6d6a6'
        if (x1 - x0) >= (z1 - z0):
            vc().cbox(x0 - t, x1 + t, y1, y1 + t, zm - 0.028, zm + 0.028, tape)
            for (a_, b_) in ((x0 - t, x0), (x1, x1 + t)): vc().cbox(a_, b_, y1 - 0.07, y1 + t, zm - 0.028, zm + 0.028, tape)
        else:
            vc().cbox(xm - 0.028, xm + 0.028, y1, y1 + t, z0 - t, z1 + t, tape)
            for (a_, b_) in ((z0 - t, z0), (z1, z1 + t)): vc().cbox(xm - 0.028, xm + 0.028, y1 - 0.07, y1 + t, a_, b_, tape)
        if band:
            ya, yb = y0 + (y1 - y0) * 0.3, y0 + (y1 - y0) * 0.62
            vc().cbox(x0 - t, x1 + t, ya, yb, z0 + 0.02, z1 - 0.02, band); vc().cbox(x0 + 0.02, x1 - 0.02, ya, yb, z0 - t, z1 + t, band)
    def crate(x0, x1, y0, y1, z0, z1, col, caps='#f6f1e0'):
        """塑膠飲料籃：底、四圈邊條、四角柱、側面的直格線（格子之間是空的，看得到裡面的瓶子）、裡面一格一格的瓶蓋"""
        t = 0.014; dark = '#2a2d31'
        vc().cbox(x0, x1, y0, y0 + 0.02, z0, z1, col)
        for (ya, yb) in ((y0, y0 + 0.05), (y1 - 0.05, y1), ((y0 + y1) / 2 - 0.018, (y0 + y1) / 2 + 0.018)):
            vc().cbox(x0, x1, ya, yb, z0, z0 + t, col); vc().cbox(x0, x1, ya, yb, z1 - t, z1, col); vc().cbox(x0, x0 + t, ya, yb, z0, z1, col); vc().cbox(x1 - t, x1, ya, yb, z0, z1, col)
        nx, nz = max(2, round((x1 - x0) / 0.075)), max(2, round((z1 - z0) / 0.075))
        for k in range(nx + 1):
            xx = x0 + (x1 - x0 - t) * k / nx
            for zz in (z0, z1 - t): vc().cbox(xx, xx + t, y0, y1, zz, zz + t, col)
        for k in range(nz + 1):
            zz = z0 + (z1 - z0 - t) * k / nz
            for xx in (x0, x1 - t): vc().cbox(xx, xx + t, y0, y1, zz, zz + t, col)
        vc().cbox(x0 + t, x1 - t, y0 + 0.02, y1 - 0.09, z0 + t, z1 - t, dark)   # 裡面（瓶身擠在一起，暗的）
        for i in range(nx):
            for j in range(nz):
                px, pz = x0 + (x1 - x0) * (i + 0.5) / nx, z0 + (z1 - z0) * (j + 0.5) / nz
                ccyl(vc(), (px, y1 - 0.09, pz), (px, y1 - 0.02, pz), 0.02, '#3f2a1a', seg=6, caps=False); ccyl(vc(), (px, y1 - 0.02, pz), (px, y1 - 0.005, pz), 0.016, caps, seg=6)
    def wshelf(o, along, face, fill, levels=(0.2, 0.58, 0.96, 1.34, 1.72)):
        """靠牆的貨架：底座、背板、立柱、層板（前緣一條紅色價格條）"""
        x0, x1, z0, z1, h = o['x0'], o['x1'], o['z0'], o['z1'], o['h']
        vc().cbox(x0, x1, 0.0, 0.2, z0, z1, BODY); vc().cbox(x0, x1, h, h + 0.03, z0, z1, BODY)
        if along == 'z':
            (vc().cbox(x0, x0 + 0.03, 0.2, h, z0, z1, BODY) if face > 0 else vc().cbox(x1 - 0.03, x1, 0.2, h, z0, z1, BODY)); n = max(1, round((z1 - z0) / 1.2))
            for k in range(n + 1): zz = z0 + (z1 - z0) * k / n; vc().cbox(x0, x1, 0.0, h + 0.03, zz - 0.015, zz + 0.015, POST)
            xe = (x1, x1 + 0.004) if face > 0 else (x0 - 0.004, x0)
            for i, y in enumerate(levels): vc().cbox(x0, x1, y - 0.022, y, z0, z1, BODY); vc().cbox(xe[0], xe[1], y - 0.03, y + 0.004, z0, z1, RED if i % 2 else YEL); fill(i, y)
        else:
            vc().cbox(x0, x1, 0.2, h, z0, z0 + 0.03, BODY); n = max(1, round((x1 - x0) / 1.2))
            for k in range(n + 1): xx = x0 + (x1 - x0) * k / n; vc().cbox(xx - 0.015, xx + 0.015, 0.0, h + 0.03, z0, z1, POST)
            for i, y in enumerate(levels): vc().cbox(x0, x1, y - 0.022, y, z0, z1, BODY); vc().cbox(x0, x1, y - 0.03, y + 0.004, z1, z1 + 0.004, RED if i % 2 else YEL); fill(i, y)
    # 左牆：泡麵（上面三層：一包一包）、零食大包（下面兩層）
    wshelf(WS, 'z', 1, lambda i, y: packs(WS['x0'] + 0.05, WS['x1'], y, WS['z0'] + 0.04, WS['z1'] - 0.04, 'z', i * 3, ('snack', 'snack', 'noodle', 'cup', 'noodle')[i], front=1))
    # 後牆：最下面大鐵罐和紙箱、罐頭、兩層瓶子（魚露、醬油、辣醬）、最上面罐頭；上面黃底紅字店名（概念圖裁的）
    def back_fill(i, y):
        a, b, c, d = BS['x0'] + 0.04, BS['x1'] - 0.04, BS['z0'] + 0.08, BS['z1'] - 0.03
        if i == 0:   # 最下面：紙箱（封箱膠帶、色帶）和大鐵罐（食用油、椰奶：罐身一圈標籤、罐蓋）交錯
            xx = a; k = 0
            while xx + 0.3 < b:
                if k % 3 == 2:
                    for q in range(2): px = xx + 0.09 + q * 0.19; ccyl(vc(), (px, y, (c + d) / 2), (px, y + 0.28, (c + d) / 2), 0.085, '#c4c8cb', seg=10); ccyl(vc(), (px, y + 0.05, (c + d) / 2), (px, y + 0.22, (c + d) / 2), 0.087, (RED, YEL, GRN)[(k + q) % 3], seg=10, caps=False); ccyl(vc(), (px, y + 0.28, (c + d) / 2), (px, y + 0.295, (c + d) / 2), 0.05, '#8a8f98', seg=8)
                    xx += 0.42
                else:
                    w_ = RR.uniform(0.3, 0.38); carton(xx, xx + w_, y, y + RR.uniform(0.22, 0.3), c, d - 0.01, ('#c9a878', '#b89868', '#d2b48a')[k % 3], band=(RED, YEL, GRN, '#3a7ac0')[k % 4]); xx += w_ + 0.03
                k += 1
        elif i in (1, 4): cans(a, b, y, c, d, 'x', i)
        else: bottles(a, b, y, c, d, 'x', i * 2)
    wshelf(BS, 'x', 1, back_fill); zb = -D / 2 + 0.03
    vc().cbox(-2.95, 1.45, 2.22, 2.96, -D / 2, zb, YEL); vc().cbox(-2.97, 1.47, 2.2, 2.22, -D / 2, zb + 0.01, RED); vc().cbox(-2.97, 1.47, 2.96, 2.98, -D / 2, zb + 0.01, RED)
    pic('sign', [(-2.85, 2.26, zb + 0.004), (1.35, 2.26, zb + 0.004), (1.35, 2.93, zb + 0.004), (-2.85, 2.93, zb + 0.004)])
    # 右牆：乾貨（河粉、米紙、香料包：扁扁一包一包立著）
    wshelf(RS, 'z', -1, lambda i, y: packs(RS['x0'], RS['x1'] - 0.05, y, RS['z0'] + 0.04, RS['z1'] - 0.04, 'z', i * 2 + 1, ('flat', 'flat', 'noodle', 'flat', 'cup')[i], front=-1))
    # 中間兩排雙面貨架（泡麵、零食、餅乾）；架頂疊幾箱貨、朝門口那一頭掛一塊特價牌
    for g in J['gondolas']:
        gondola(g, NOOD, body=BODY, fill=lambda xa, xb, y, za, zb, al, i, g=g: packs(xa, xb, y, za, zb, al, i * 2, ('snack', 'noodle', 'cup', 'noodle', 'snack', 'flat')[i % 6], front=(-1 if (xa + xb) / 2 < (g['x0'] + g['x1']) / 2 else 1)))
        for k in range(3): zz = g['z0'] + 0.3 + k * 1.25; carton(g['x0'] + 0.1, g['x1'] - 0.1, g['h'], g['h'] + 0.26, zz, zz + 0.5, ('#c9a878', '#b89868', '#d2b48a')[k], band=(RED, GRN, '#3a7ac0')[k])
        xm = (g['x0'] + g['x1']) / 2; vc().cbox(xm - 0.32, xm + 0.32, 1.05, 1.45, g['z1'], g['z1'] + 0.012, YEL); vc().cbox(xm - 0.26, xm + 0.26, 1.2, 1.3, g['z1'] + 0.012, g['z1'] + 0.016, RED)
        for k in range(3):
            cx0, cx1, col = xm - 0.31 + k * 0.215, xm - 0.115 + k * 0.215, ('#3a7ac0', '#d8362a', '#2f8a4a')[k]
            for j in range(2 - (k % 2)): crate(cx0, cx1, j * 0.25, j * 0.25 + 0.24, g['z1'] + 0.02, g['z1'] + 0.3, col, caps=('#f6f1e0', '#f0b020', '#d8362a')[k])   # 貨架頭：一箱箱的飲料（在阻擋範圍裡——配置的 blocks 比貨架長 0.3）
    # 飲料冰箱（三門玻璃）：黑框、裡面白色層架、一瓶瓶飲料；上面一條墨綠燈箱
    fx0, fx1, fz0, fz1, fh = FG['x0'], FG['x1'], FG['z0'], FG['z1'], FG['h']
    vc().cbox(fx0, fx1, 0.0, 0.2, fz0, fz1, '#2a2d31'); vc().cbox(fx1 - 0.06, fx1, 0.2, fh - 0.16, fz0, fz1, '#f4f5f4'); vc().cbox(fx0, fx1, fh - 0.16, fh, fz0, fz1, GRN)
    for zz in (fz0, fz1 - 0.04): vc().cbox(fx0, fx1, 0.2, fh - 0.16, zz, zz + 0.04, '#2a2d31')
    mesh('light').box(fx0 - 0.004, fx0, fh - 0.13, fh - 0.03, fz0 + 0.1, fz1 - 0.1)
    for k in range(4): zz = fz0 + (fz1 - fz0) * k / 3; vc().cbox(fx0, fx0 + 0.05, 0.2, fh - 0.16, zz - 0.025, zz + 0.025, '#1f2023')
    for k in range(3): zz = fz0 + (fz1 - fz0) * (k + 1) / 3 - 0.1; vc().cbox(fx0 - 0.03, fx0 - 0.015, 0.9, 1.3, zz, zz + 0.02, '#c4c8cb')   # 門把
    DR = ['#d8362a', '#f0b020', '#2f8a4a', '#3a7ac0', '#f6f1e0', '#7a4a2a', '#e86a1c', '#8ac0e0']
    for i, y in enumerate((0.26, 0.6, 0.94, 1.28, 1.58)):
        vc().cbox(fx0 + 0.06, fx1 - 0.06, y - 0.02, y, fz0 + 0.04, fz1 - 0.04, '#eceeee'); a = fz0 + 0.1; run = i
        while a < fz1 - 0.1:
            col = DR[run % len(DR)]; e = min(fz1 - 0.08, a + RR.uniform(0.3, 0.5)); can = run % 3 == 0
            while a + 0.035 <= e:
                for xx in (fx0 + 0.16,):
                    if can: ccyl(vc(), (xx, y, a), (xx, y + 0.12, a), 0.033, col, seg=6)
                    else: ccyl(vc(), (xx, y, a), (xx, y + 0.17, a), 0.033, col, seg=6, caps=False); ccyl(vc(), (xx, y + 0.17, a), (xx, y + 0.24, a), 0.033, col, seg=6, r2=0.013); 
                a += 0.08
            a = e + 0.03; run += 1
    mesh('glass').quad([(fx0 + 0.02, 0.22, fz0 + 0.03), (fx0 + 0.02, 0.22, fz1 - 0.03), (fx0 + 0.02, fh - 0.18, fz1 - 0.03), (fx0 + 0.02, fh - 0.18, fz0 + 0.03)])
    # 右後角：一疊疊的米袋（白底、紅色或綠色的帶子）、旁邊兩個大鐵桶
    for cx in (2.78, 3.42):
        for cz in (-4.2, -3.72):
            n = 3 + int(RR.random() * 3)
            for j in range(n):
                dx = RR.uniform(-0.03, 0.03); vc().crbox(cx - 0.29 + dx, cx + 0.29 + dx, j * 0.15, j * 0.15 + 0.145, cz - 0.21, cz + 0.21, '#f1ede0', r=0.05); vc().cbox(cx - 0.12 + dx, cx + 0.12 + dx, j * 0.15 + 0.02, j * 0.15 + 0.125, cz - 0.213, cz + 0.213, (RED, '#2f8a4a', YEL)[(j + int(cx * 3)) % 3])
    for k in range(2): ccyl(vc(), (2.62 + k * 0.42, 0.0, -3.4), (2.62 + k * 0.42, 0.42, -3.4), 0.17, ('#3a7ac0', '#c4c8cb')[k], seg=12)
    # 收銀台（淺色美耐板、墨綠踢腳）：收銀機、電子秤、糖果罐、一盒盒口香糖；上面一根桿子掛一串串零食
    vc().cbox(CT['x0'], CT['x1'], 0.1, CT['h'] - 0.04, CT['z0'], CT['z1'], '#e2d8c2'); vc().cbox(CT['x0'], CT['x1'], 0.0, 0.1, CT['z0'] - 0.005, CT['z1'], GRN); vc().crbox(CT['x0'] - 0.03, CT['x1'] + 0.03, CT['h'] - 0.04, CT['h'], CT['z0'] - 0.04, CT['z1'] + 0.02, '#f1efe6', r=0.012)
    vc().cbox(CT['x0'], CT['x0'] + 0.04, 0.0, CT['h'] - 0.04, CT['z1'], 4.5 - 1.1, '#e2d8c2')   # 櫃台側板往窗邊接一小段（客人繞不進去）
    hC = CT['h']; vc().cbox(2.3, 2.72, hC, hC + 0.12, 2.3, 2.62, '#2a2d31'); vc().cbox(2.34, 2.68, hC + 0.12, hC + 0.36, 2.52, 2.56, '#1f2023'); vc().cbox(2.36, 2.66, hC + 0.14, hC + 0.34, 2.515, 2.52, '#8ac0e0')
    vc().cbox(1.72, 2.05, hC, hC + 0.05, 2.28, 2.6, '#c4c8cb'); vc().cbox(1.74, 2.03, hC + 0.05, hC + 0.06, 2.3, 2.58, '#eceeee'); vc().cbox(1.8, 1.97, hC + 0.06, hC + 0.16, 2.56, 2.6, '#2a2d31')
    for k, col in enumerate((RED, YEL, '#2f8a4a')): ccyl(vc(), (2.86 + (k % 2) * 0.14, hC, 2.25 + k * 0.13), (2.86 + (k % 2) * 0.14, hC + 0.16, 2.25 + k * 0.13), 0.05, col, seg=8); ccyl(vc(), (2.86 + (k % 2) * 0.14, hC + 0.16, 2.25 + k * 0.13), (2.86 + (k % 2) * 0.14, hC + 0.185, 2.25 + k * 0.13), 0.052, '#f6f1e0', seg=8)
    for k in range(4): vc().cbox(2.08 + k * 0.05, 2.12 + k * 0.05, hC, hC + 0.07, 2.14, 2.24, (RED, '#3a7ac0', YEL, '#2f8a4a')[k])
    ccyl(vm(), (CT['x0'], 2.32, CT['z0'] + 0.1), (CT['x1'] + 0.6, 2.32, CT['z0'] + 0.1), 0.012, '#c4c8cb', seg=6)
    for sx in (CT['x0'] + 0.02, CT['x1'] + 0.55): ccyl(vm(), (sx, 2.32, CT['z0'] + 0.1), (sx, H, CT['z0'] + 0.1), 0.008, '#c4c8cb', seg=4)
    for k in range(9):
        xx = CT['x0'] + 0.12 + k * 0.22; col = (RED, YEL, '#2f8a4a', '#e86a1c', '#3a7ac0')[k % 5]
        for j in range(5): vc().cbox(xx - 0.055, xx + 0.055, 2.3 - (j + 1) * 0.125, 2.3 - j * 0.125 - 0.015, CT['z0'] + 0.09, CT['z0'] + 0.115, col if j % 2 == 0 else '#f6f1e0')
    # 店員後面的東牆：小架子（電話卡、香菸大小的小盒子）、月曆
    for y in (1.2, 1.5, 1.8):
        vc().cbox(W / 2 - 0.22, W / 2, y - 0.02, y, 2.95, 4.15, BODY); goods(W / 2 - 0.2, W / 2 - 0.02, y, 2.97, 4.13, [RED, '#f6f1e0', '#3a7ac0', YEL, '#2f8a4a'], hmin=0.1, hmax=0.14, step=0.075)
    vc().cbox(W / 2 - 0.012, W / 2, 2.1, 2.7, 3.2, 3.7, '#f6f1e0'); vc().cbox(W / 2 - 0.016, W / 2 - 0.012, 2.5, 2.7, 3.2, 3.7, RED)
    # 左前窗邊：一疊疊紅藍塑膠籃、兩箱飲料；上面掛藤編燈罩和斗笠（概念圖門口左邊）
    def basket(x, y, z, col):
        w, d, h = 0.26, 0.19, 0.2
        vc().cbox(x - w, x + w, y, y + 0.015, z - d, z + d, col)
        for (a, b, c, e) in ((x - w, x - w + 0.015, z - d, z + d), (x + w - 0.015, x + w, z - d, z + d), (x - w, x + w, z - d, z - d + 0.015), (x - w, x + w, z + d - 0.015, z + d)): vc().cbox(a, b, y, y + h, c, e, col)
        vc().cbox(x - w - 0.012, x + w + 0.012, y + h - 0.03, y + h, z - d - 0.012, z - d, col); vc().cbox(x - w - 0.012, x + w + 0.012, y + h - 0.03, y + h, z + d, z + d + 0.012, col)
    for k, (bx, n, col) in enumerate(((-3.08, 4, '#c8301c'), (-2.5, 3, '#2a5aa8'))):
        for j in range(n): basket(bx, j * 0.11, 3.95, col)
    for (hx, hz, kind) in ((-3.0, 3.3, 'lamp'), (-2.35, 3.45, 'hat'), (-1.7, 3.3, 'lamp')):
        if kind == 'lamp': pendant(hx, hz, y=2.05)
        else:
            ccyl(vc(), (hx, 2.3, hz), (hx, H, hz), 0.005, '#2b2b2b', seg=4); ccyl(vc(), (hx, 2.12, hz), (hx, 2.3, hz), 0.3, '#d9b97a', seg=16, r2=0.01, caps=False); ccyl(vc(), (hx, 2.115, hz), (hx, 2.12, hz), 0.3, '#c4a060', seg=16)
    # 三角旗一串（橫過走道）、牆上的時鐘、門邊的盆栽
    PEN = [RED, YEL, '#2f8a4a', '#3a7ac0', '#e86a1c']
    for k in range(22): xx = -3.3 + k * 0.3; yy = 2.78 - 0.1 * math.sin(k / 21 * PI); vc().poly([(xx, yy, 1.9), (xx + 0.22, yy, 1.9), (xx + 0.11, yy - 0.24, 1.9)], PEN[k % 5]); vc().poly([(xx + 0.22, yy, 1.899), (xx, yy, 1.899), (xx + 0.11, yy - 0.24, 1.899)], PEN[k % 5])
    ccyl(vc(), (-W / 2 + 0.01, 2.55, 3.75), (-W / 2 + 0.04, 2.55, 3.75), 0.16, '#2a2d31', seg=16); ccyl(vc(), (-W / 2 + 0.04, 2.55, 3.75), (-W / 2 + 0.045, 2.55, 3.75), 0.14, '#f6f5f0', seg=16)
    PRE = 'WALL_Sfix:'
    for (a, b) in FR['windows']: vc().cbox(a, b, 2.45, 2.7, zS + 0.06, zS + 0.07, GRN)   # 玻璃上緣一條墨綠（外面雨棚的顏色）
    PRE = ''
    tubes((-3.3, -1.0, 1.3, 3.5), x0=-1.75, x1=1.75)


# ---------- 汀州聯通（汀州路；手機通訊行）----------
def _tint(hexcol, t):
    """顏色往白色混 t（反光的那一條）"""
    c = [int(hexcol[i:i + 2], 16) for i in (1, 3, 5)]; return '#%02x%02x%02x' % tuple(int(v + (255 - v) * t) for v in c)
if SHOP == 'liantong':
    SC, PW, CB, CT = J['showcase'], J['pegWall'], J['cabinet'], J['counter']
    BLUE, BLUE2, WHT, ALU, DK = '#1f3f9a', '#3f7ad0', '#f6f7f7', '#c4c8cb', '#1f2023'
    CASE = ['#1f2023', '#d8362a', '#f4c8d0', '#3f7ad0', '#f0d040', '#2f8a5a', '#f6f7f7', '#7a5ab0', '#e86a1c', '#8ac0e0', '#c9a878']
    def phone(x, y, z, col, yaw=0.0, lie=True):
        """一支手機：平放（螢幕朝上）或立著靠在小架子上"""
        if lie: vc().cbox(x - 0.037, x + 0.037, y, y + 0.008, z - 0.078, z + 0.078, col); vc().cbox(x - 0.033, x + 0.033, y + 0.008, y + 0.009, z - 0.073, z + 0.073, '#15171a')
        else: vc().poly([(x - 0.037, y, z + 0.02), (x + 0.037, y, z + 0.02), (x + 0.037, y + 0.15, z - 0.02), (x - 0.037, y + 0.15, z - 0.02)], '#15171a'); vc().cbox(x - 0.04, x + 0.04, y, y + 0.012, z - 0.03, z + 0.03, col)
    # 側牆一條藍色腰線（招牌的藍）
    for sx in (-1, 1): xx = sx * (W / 2 - 0.004); vc().cbox(min(xx, sx * W / 2), max(xx, sx * W / 2), 2.3, 2.42, -D / 2, D / 2, BLUE)
    # 左牆：白色溝槽板＋一排排手機殼（掛勾上，一格一種顏色）、保護貼盒；下面白色抽屜櫃
    px = PW['x1']; vc().cbox(PW['x0'], px, 0.0, 0.62, PW['z0'], PW['z1'], WHT); vc().cbox(PW['x0'], px - 0.1, 0.62, PW['h'], PW['z0'], PW['z1'], '#eceeee'); vc().cbox(PW['x0'], px + 0.01, 0.6, 0.64, PW['z0'], PW['z1'], ALU)
    for k in range(5): zz = PW['z0'] + (PW['z1'] - PW['z0']) * k / 4; vc().cbox(px - 0.1, px + 0.004, 0.0, PW['h'], zz - 0.012, zz + 0.012, ALU)
    for k in range(4):
        z0_ = PW['z0'] + (PW['z1'] - PW['z0']) * k / 4 + 0.06; z1_ = PW['z0'] + (PW['z1'] - PW['z0']) * (k + 1) / 4 - 0.06
        for j in range(2): vc().cbox(px, px + 0.006, 0.08 + j * 0.27, 0.3 + j * 0.27, z0_, z1_, '#eceeee'); vc().cbox(px + 0.006, px + 0.02, 0.17 + j * 0.27, 0.19 + j * 0.27, (z0_ + z1_) / 2 - 0.08, (z0_ + z1_) / 2 + 0.08, ALU)
        for r, y in enumerate((0.72, 0.94, 1.16, 1.38, 1.6, 1.82)):
            a = z0_; col = CASE[(k * 3 + r * 2) % len(CASE)]; n = 0
            while a + 0.085 <= z1_:
                c2 = col if n % 3 else CASE[(k + r + n) % len(CASE)]
                if r == 5 and k % 2: vc().cbox(px - 0.1, px - 0.02, y, y + 0.17, a, a + 0.1, WHT); vc().cbox(px - 0.02, px - 0.018, y + 0.03, y + 0.14, a + 0.01, a + 0.09, c2)   # 最上面一排：保護貼、充電器的盒子
                else:   # 手機殼（LIANTONG-CASES-1112；BB 11-12 ④ FAIL：近看每一格是純色長方塊，沒鏡頭孔、沒包裝）：白色吊卡（上緣一條同色的色條）＋殼＋鏡頭島（兩顆鏡頭、一顆閃光燈）＋側邊一條反光
                    hi = _tint(c2, 0.4)
                    vc().cbox(px - 0.084, px - 0.078, y - 0.012, y + 0.2, a - 0.008, a + 0.088, '#f4f5f4'); vc().cbox(px - 0.078, px - 0.0772, y + 0.174, y + 0.196, a - 0.004, a + 0.084, c2)
                    vc().cbox(px - 0.078, px - 0.062, y, y + 0.165, a, a + 0.08, c2); vc().cbox(px - 0.062, px - 0.0612, y + 0.006, y + 0.159, a + 0.066, a + 0.075, hi)
                    vc().cbox(px - 0.062, px - 0.0594, y + 0.104, y + 0.158, a + 0.007, a + 0.045, '#15171a' if c2 != '#1f2023' else '#34383e')
                    for (ly, lz) in ((0.136, 0.012), (0.112, 0.012)): vc().cbox(px - 0.0594, px - 0.0586, y + ly, y + ly + 0.017, a + lz, a + lz + 0.017, '#4a5a6a')
                    vc().cbox(px - 0.0594, px - 0.0588, y + 0.128, y + 0.136, a + 0.033, a + 0.041, '#f2e9c0')
                a += 0.105; n += 1
            ccyl(vm(), (px - 0.1, y + 0.185, z0_), (px - 0.1, y + 0.185, z1_), 0.006, ALU, seg=4)
    # 窗邊玻璃展示櫃：白色底座、鋁框、兩層玻璃層板上的手機和盒子
    x0, x1, z0, z1, h = SC['x0'], SC['x1'], SC['z0'], SC['z1'], SC['h']
    vc().cbox(x0, x1, 0.0, 0.42, z0, z1, WHT); vc().cbox(x0, x1, 0.0, 0.08, z0 - 0.004, z1, BLUE); vc().cbox(x0, x1, h - 0.03, h, z0, z1, ALU)
    for xx in (x0, (x0 + x1) / 2 - 0.015, x1 - 0.03):
        for zz in (z0, z1 - 0.03): vc().cbox(xx, xx + 0.03, 0.42, h, zz, zz + 0.03, ALU)
    for j, y in enumerate((0.44, 0.72)):
        if j: vc().cbox(x0 + 0.03, x1 - 0.03, y - 0.012, y, z0 + 0.03, z1 - 0.03, '#dfe9ee')
        for k in range(9):
            xx = x0 + 0.18 + k * 0.235; col = CASE[(k * 2 + j * 5) % len(CASE)]
            phone(xx, y, z0 + 0.2, col, lie=False); vc().cbox(xx - 0.045, xx + 0.045, y, y + 0.17, z1 - 0.2, z1 - 0.17, WHT); vc().cbox(xx - 0.03, xx + 0.03, y + 0.03, y + 0.14, z1 - 0.202, z1 - 0.2, col)
    for (pa, pb) in (((x0, z0), (x1, z0)), ((x1, z1), (x0, z1))): mesh('glass').quad([(pa[0], 0.42, pa[1]), (pb[0], 0.42, pb[1]), (pb[0], h - 0.03, pb[1]), (pa[0], h - 0.03, pa[1])])
    for k in range(6): phone(x0 + 0.3 + k * 0.33, h, (z0 + z1) / 2, CASE[(k * 3 + 1) % len(CASE)])   # 櫃頂：可以拿起來試的展示機（防盜線）
    for k in range(6): ccyl(vm(), (x0 + 0.3 + k * 0.33, h, (z0 + z1) / 2 + 0.08), (x0 + 0.3 + k * 0.33, h + 0.002, (z0 + z1) / 2 + 0.22), 0.004, DK, seg=4)
    # 右牆：配件展示櫃（白色、每層底下一條燈）＋門邊的資費方案海報（藍色大字塊）
    x0, x1, z0, z1, h = CB['x0'], CB['x1'], CB['z0'], CB['z1'], CB['h']
    vc().cbox(x0, x1, 0.0, 0.5, z0, z1, WHT); vc().cbox(x1 - 0.03, x1, 0.5, h, z0, z1, '#eceeee'); vc().cbox(x0, x1, h, h + 0.04, z0, z1, WHT)
    for zz in (z0, (z0 + z1) / 2 - 0.015, z1 - 0.03): vc().cbox(x0, x1, 0.5, h, zz, zz + 0.03, WHT)
    ACC = [[WHT, DK, '#3f7ad0', '#d8362a'], [DK, WHT, '#f0d040', '#2f8a5a'], [WHT, '#f4c8d0', '#8ac0e0', DK], [WHT, WHT, BLUE2, '#e86a1c']]
    for i, y in enumerate((0.52, 0.9, 1.28, 1.66)):
        vc().cbox(x0, x1, y - 0.02, y, z0, z1, WHT); goods(x0 + 0.06, x1 - 0.03, y, z0 + 0.04, z1 - 0.04, ACC[i], hmin=0.12, hmax=0.24, step=0.1)
        mesh('light').box(x0 + 0.02, x0 + 0.05, y + 0.335, y + 0.35, z0 + 0.05, z1 - 0.05)
    xe = W / 2 - 0.006
    for (za, zb_, c1, c2) in ((1.65, 2.3, BLUE, '#f0d040'), (2.4, 3.05, '#d8362a', WHT)):
        vc().cbox(xe, W / 2, 1.0, 2.15, za, zb_, WHT); vc().cbox(xe - 0.002, xe, 1.62, 2.1, za + 0.04, zb_ - 0.04, c1); vc().cbox(xe - 0.004, xe - 0.002, 1.75, 1.95, za + 0.12, zb_ - 0.12, c2)
        for j in range(3): vc().cbox(xe - 0.002, xe, 1.08 + j * 0.17, 1.2 + j * 0.17, za + 0.06, zb_ - 0.06 - j * 0.12, '#c9d2dc')
    # 服務櫃台（白色、正面一條藍、底下燈條）：螢幕、鍵盤、刷卡機、維修墊（拆開的手機、螺絲起子）、名片盒
    vc().cbox(CT['x0'], CT['x1'], 0.1, CT['h'] - 0.04, CT['z0'], CT['z1'], WHT); vc().cbox(CT['x0'], CT['x1'], 0.0, 0.1, CT['z0'] + 0.03, CT['z1'] - 0.03, DK); vc().crbox(CT['x0'] - 0.02, CT['x1'], CT['h'] - 0.04, CT['h'], CT['z0'] - 0.02, CT['z1'] + 0.04, WHT, r=0.012)
    vc().cbox(CT['x0'], CT['x1'], 0.5, 0.68, CT['z1'], CT['z1'] + 0.004, BLUE); mesh('light').box(CT['x0'] + 0.1, CT['x1'] - 0.1, 0.1, 0.115, CT['z1'] - 0.03, CT['z1'] - 0.01)
    hC = CT['h']; vc().cbox(0.45, 1.05, hC + 0.13, hC + 0.5, CT['z0'] + 0.14, CT['z0'] + 0.17, DK); vc().cbox(0.48, 1.02, hC + 0.16, hC + 0.47, CT['z0'] + 0.13, CT['z0'] + 0.14, '#8ac0e0'); ccyl(vc(), (0.75, hC, CT['z0'] + 0.17), (0.75, hC + 0.14, CT['z0'] + 0.17), 0.025, DK, seg=6); vc().cbox(0.6, 0.9, hC, hC + 0.012, CT['z0'] + 0.1, CT['z0'] + 0.24, DK)
    vc().cbox(1.3, 1.42, hC, hC + 0.05, CT['z1'] - 0.2, CT['z1'] - 0.03, DK); vc().cbox(1.31, 1.41, hC + 0.05, hC + 0.052, CT['z1'] - 0.19, CT['z1'] - 0.1, '#8ac0e0')
    vc().cbox(-0.9, -0.3, hC, hC + 0.006, CT['z0'] + 0.08, CT['z1'] - 0.08, '#3a6a8a'); phone(-0.7, hC + 0.006, CT['z0'] + 0.28, '#c4c8cb'); vc().cbox(-0.52, -0.45, hC + 0.006, hC + 0.012, CT['z0'] + 0.2, CT['z0'] + 0.34, '#2f8a5a')
    ccyl(vc(), (-0.42, hC + 0.012, CT['z0'] + 0.42), (-0.6, hC + 0.012, CT['z0'] + 0.44), 0.007, '#d8362a', seg=5); vc().cbox(1.75, 1.9, hC, hC + 0.04, CT['z1'] - 0.16, CT['z1'] - 0.06, WHT)
    ccyl(vc(), (-0.05, hC, CT['z1'] - 0.14), (-0.05, hC + 0.11, CT['z1'] - 0.14), 0.035, BLUE, seg=8)
    vc().cbox(CT['x0'] - 1.05, CT['x0'], 0.0, 0.9, CT['z0'] + 0.24, CT['z0'] + 0.28, WHT); vc().cbox(CT['x0'] - 1.05, CT['x0'], 0.9, 0.93, CT['z0'] + 0.22, CT['z0'] + 0.3, ALU)   # 櫃台左邊的小矮門（員工進出，關著）
    # 櫃台後面：整面層架的手機盒（白盒子，一格一個牌子的色帶）、左後角維修工作台（檯燈、零件盒、放大鏡）；上面藍底白字店名
    zb = -D / 2; vc().cbox(-0.9, W / 2, 0.0, 0.75, zb, zb + 0.42, WHT); vc().cbox(-0.9, W / 2, 0.75, 2.12, zb, zb + 0.03, '#eceeee')
    for k in range(5): xx = -0.9 + (W / 2 + 0.9) * k / 4; vc().cbox(xx - 0.015 if k else xx, xx + 0.015 if k < 4 else xx, 0.75, 2.12, zb, zb + 0.3, WHT)
    for i, y in enumerate((0.77, 1.04, 1.31, 1.58, 1.85)):
        vc().cbox(-0.9, W / 2, y - 0.02, y, zb, zb + 0.3, WHT); a = -0.86; n = i
        while a + 0.2 < W / 2:
            band = (BLUE2, '#d8362a', '#2f8a5a', DK, '#e86a1c', '#7a5ab0')[n % 6]; e = min(W / 2 - 0.03, a + RR.uniform(0.45, 0.75))
            while a + 0.1 <= e: vc().cbox(a, a + 0.092, y, y + 0.19, zb + 0.06, zb + 0.27, WHT); vc().cbox(a + 0.01, a + 0.082, y + 0.05, y + 0.14, zb + 0.27, zb + 0.272, band); a += 0.1
            a = e + 0.04; n += 1
    vc().cbox(-W / 2, -1.0, 0.72, 0.76, zb, zb + 0.6, '#e2d8c2'); vc().cbox(-W / 2, -1.0, 0.0, 0.72, zb, zb + 0.56, WHT)
    vc().cbox(-2.1, -1.5, 0.76, 0.766, zb + 0.12, zb + 0.5, '#3a6a8a'); phone(-1.8, 0.766, zb + 0.3, DK)
    for k in range(4): vc().cbox(-1.42 + k * 0.1, -1.34 + k * 0.1, 0.76, 0.84, zb + 0.06, zb + 0.2, ('#d8362a', '#f0d040', BLUE2, '#2f8a5a')[k])
    ccyl(vc(), (-2.12, 0.76, zb + 0.14), (-2.12, 0.78, zb + 0.14), 0.07, DK, seg=10); ccyl(vm(), (-2.12, 0.78, zb + 0.14), (-2.12, 1.2, zb + 0.14), 0.01, ALU, seg=5); ccyl(vm(), (-2.12, 1.2, zb + 0.14), (-1.85, 1.3, zb + 0.3), 0.01, ALU, seg=5); ccyl(vc(), (-1.85, 1.31, zb + 0.3), (-1.85, 1.25, zb + 0.3), 0.035, DK, seg=10, r2=0.08, caps=False); mesh('light').sphere((-1.85, 1.265, zb + 0.3), 0.03, seg=6, rings=4)
    vc().cbox(-W / 2 + 0.004, -W / 2 + 0.02, 0.95, 1.9, zb + 0.08, zb + 1.3, '#eceeee')
    for j in range(4):
        for k in range(7): vc().cbox(-W / 2 + 0.02, -W / 2 + 0.1, 1.0 + j * 0.22, 1.16 + j * 0.22, zb + 0.12 + k * 0.165, zb + 0.26 + k * 0.165, ('#c9d2dc', '#dfe9ee', '#8ac0e0')[(j + k) % 3])   # 零件抽屜盒
    vc().cbox(-1.6, 1.6, 2.2, 2.78, zb, zb + 0.04, BLUE); pic('sign', [(-1.55, 2.24, zb + 0.045), (1.55, 2.24, zb + 0.045), (1.55, 2.74, zb + 0.045), (-1.55, 2.74, zb + 0.045)])
    # 兩張黑色圓凳（概念圖櫃台前那兩張）：黑座面、鉻柱、圓盤底
    for q in J['seats']:
        ccyl(vc(), (q['x'], 0.44, q['z']), (q['x'], 0.5, q['z']), 0.17, DK, seg=16); ccyl(vm(), (q['x'], 0.03, q['z']), (q['x'], 0.44, q['z']), 0.025, ALU, seg=8); ccyl(vm(), (q['x'], 0.0, q['z']), (q['x'], 0.03, q['z']), 0.2, ALU, seg=16); ccyl(vm(), (q['x'], 0.16, q['z']), (q['x'], 0.175, q['z']), 0.13, ALU, seg=12, caps=False)
    # 玻璃上的藍色腰帶、門邊牆上的維修圖示牌、天花板
    PRE = 'WALL_Sfix:'
    for (a, b) in FR['windows']: vc().cbox(a, b, 0.35, 0.5, zS + 0.06, zS + 0.07, BLUE); vc().cbox(a, b, 2.42, 2.6, zS + 0.06, zS + 0.07, BLUE)
    PRE = ''
    tubes((-2.4, 0.0, 2.3), x0=-1.0, x1=1.0)


# ---------- 完成 ----------
for side, (m, d) in WALLS.items(): m.finish(root, props={'dir': d})
for key, mm in MM.items(): mm.finish(root, props=({'dir': [0, 0, -1], 'at': [0.0, H / 2, D / 2]} if key.startswith('WALL_Sfix:') else None), uv=key.split(':')[-1] not in ('vc', 'vcm', 'light', 'glass'), smooth=key.split(':')[-1] in ('vc', 'vcm'))
if SQ:
    m = Mesh('S_pics', M['pics']); lay = m.bm.loops.layers.uv.new('UVMap')
    for key, pts in SQ:
        u0, v0, u1, v1 = AUV[key]; f = m.bm.faces.new([m.bm.verts.new(p) for p in pts])
        for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[lay].uv = t
    m.finish(root, uv=False, merge=False)
if LQ:
    m = Mesh('S_labels', M['labels']); lay = m.bm.loops.layers.uv.new('UVMap')
    for key, pts in LQ:
        u0, v0, u1, v1 = LUV[key]; f = m.bm.faces.new([m.bm.verts.new(p) for p in pts])
        for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[lay].uv = t
    m.finish(root, uv=False, merge=False)
if '--nosingle' not in ARGS: L.single_side(root, keep=r'glass', nodup=r'(ceil|lightpanel)')
tris = 0
for ob in bpy.data.objects:
    if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
info = L.export(OUT, gpu_instances=False)
L.write_json(OUT[:-4] + '.json', dict(info if isinstance(info, dict) else {}, tris_total=tris, walls=sorted(WALLS), note=f'GG-SHOPS3-ART-1110 {J["name"]} 室內'))
print(json.dumps({'TZ_SHOP': SHOP, 'tris': tris, 'walls': len(WALLS)}, ensure_ascii=False))
