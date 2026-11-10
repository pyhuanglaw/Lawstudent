"""汀州路商圈（TINGZHOU-AREA-1110）的 Blender 預覽：給參考圖比對、白天／傍晚／夜間、玩家高度的畫面（不是遊戲截圖；遊戲截圖由 CC 拍，D131）。
- 讀 assets/models/env/second_ai/tingzhou_street.glb（wz_street.py --set tingzhou）。
- 招牌字：遊戲是執行時用 canvas 畫在 SIGN_FACE_／VSIGN_FACE_ 上（zones3d.js wzSignTex）；這裡照同樣的資料（GLB extras：sign、sub、bg、color、band／vertical、vBg、vColor、vBand）用 PIL 畫，
  只給預覽用，不進 GLB。
- 地面：路（柏油、雙黃線、路邊機車格白框、紅線）、騎樓地磚由 GLB 自己帶；機車照 scooter.glb 排在路邊機車格。
- 光：day（白天）、dusk（傍晚：天空橘藍、招牌和店面亮）、night（夜間：鈉燈路燈、招牌、店面、樓上零星亮窗）。
用法：/opt/blenv/bin/python tools/blender/env_second/tingzhou_preview.py -- <輸出資料夾> [--times day,dusk,night] [--views a,b] [--res 1280x720]"""
import bpy, sys, os, math, json, random
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import lib2 as L
from lib2 import B, g2b
from PIL import Image, ImageDraw, ImageFont

A = sys.argv[sys.argv.index('--') + 1:]
OUTD = A[0]; opt = {A[i]: A[i + 1] for i in range(1, len(A) - 1) if A[i].startswith('--')}
TIMES = opt.get('--times', 'day,dusk,night').split(','); RES = tuple(int(v) for v in opt.get('--res', '1280x720').split('x'))
ROOT = L.ROOT; FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
_s = open(os.path.join(ROOT, 'src/data/tingzhou_layout.js'), encoding='utf8').read(); TZ = json.loads(_s[_s.index('{', _s.index('\nconst TINGZHOU_LAYOUT=')):_s.rindex('}') + 1])
os.makedirs(OUTD, exist_ok=True); TMP = os.path.join(OUTD, '_signs'); os.makedirs(TMP, exist_ok=True)
B.reset(texres=1024)
bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT, 'assets/models/env/second_ai/tingzhou_street.glb'))
SC = bpy.context.scene


def hexc(h, a=255): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (a,)


def sign_img(p, vertical, w_m, h_m, key):
    px = 64   # 每公尺幾個像素
    W, H = max(64, int(w_m * px * 2)), max(64, int(h_m * px * 2))
    bg = p.get('vBg' if vertical else 'bg', '#f4ead8') or '#f4ead8'; fg = p.get('vColor' if vertical else 'color', '#3b2a1e') or '#3b2a1e'; band = p.get('vBand' if vertical else 'band', '') or ''
    im = Image.new('RGBA', (W, H), hexc(bg)); d = ImageDraw.Draw(im)
    if band:
        if vertical: d.rectangle([0, 0, W - 1, int(H * 0.04)], fill=hexc(band)); d.rectangle([0, int(H * 0.96), W - 1, H - 1], fill=hexc(band))
        else: d.rectangle([0, int(H * 0.86), W - 1, H - 1], fill=hexc(band))
    txt = p.get('vertical' if vertical else 'sign', '') or ''
    if vertical:
        n = max(1, len(txt)); fs = int(min(W * 0.78, H * 0.9 / n)); f = ImageFont.truetype(FONT, fs); y = (H - fs * n) / 2
        for ch in txt: tw = d.textlength(ch, font=f); d.text(((W - tw) / 2, y), ch, font=f, fill=hexc(fg)); y += fs
    else:
        sub = p.get('sub', '') or ''
        fs = int(min(H * (0.55 if sub else 0.7), W * 0.9 / max(1, len(txt)))); f = ImageFont.truetype(FONT, fs); tw = d.textlength(txt, font=f)
        d.text(((W - tw) / 2, H * (0.12 if sub else 0.15)), txt, font=f, fill=hexc(fg))
        if sub:
            fs2 = int(H * 0.2); f2 = ImageFont.truetype(FONT, fs2); tw2 = d.textlength(sub, font=f2); d.text(((W - tw2) / 2, H * 0.66), sub, font=f2, fill=hexc(fg))
    fn = os.path.join(TMP, f'{key}.png'); im.save(fn); return fn


SIGN_MATS = []
for ob in [o for o in SC.objects if o.type == 'MESH' and (o.name.startswith('SIGN_FACE_') or o.name.startswith('VSIGN_FACE_'))]:
    vertical = ob.name.startswith('VSIGN'); p = {k: ob[k] for k in ob.keys() if isinstance(ob[k], (str, int, float))}
    bb = [ob.matrix_world @ Vector(c) for c in ob.bound_box]; xs = [v.x for v in bb]; ys = [v.y for v in bb]; zs = [v.z for v in bb]
    w_m = max(max(xs) - min(xs), max(ys) - min(ys)); h_m = max(zs) - min(zs)
    fn = sign_img(p, vertical, w_m, h_m, ob.name.replace('.', '_'))
    m = bpy.data.materials.new('signp_' + ob.name); m.use_nodes = True; N = m.node_tree.nodes; bs = N['Principled BSDF']
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(fn); m.node_tree.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    m.node_tree.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = 0.0; bs.inputs['Roughness'].default_value = 0.4
    ob.data.materials.clear(); ob.data.materials.append(m); SIGN_MATS.append(m)
    # UV：盒狀投影的 0～1（face 是一個四邊形，GLB 匯出時 uv01 已經是 0～1；保險起見重設）
print('signs painted', len(SIGN_MATS))

# 玻璃：GLB 匯入後在 EEVEE 是不透明的白（遊戲裡是透明的）：預覽改成幾乎透明
for m in bpy.data.materials:
    if m.use_nodes and 'glass' in m.name and 'lit' not in m.name:
        bs = m.node_tree.nodes.get('Principled BSDF')
        if bs:
            for l in list(bs.inputs['Alpha'].links): m.node_tree.links.remove(l)
            bs.inputs['Alpha'].default_value = 0.08
            try: m.surface_render_method = 'BLENDED'
            except Exception: pass
# ---------- 地面：路、標線、路邊機車格、紅線 ----------
R = TZ['road']; z0, z1 = -70, 70
asph = L.pbr('tz_prev_asph', 'asphalt_02', tile=4.0, target='#8f8e8a', maps=('diff', 'nor'), res=512) if L.fetch('asphalt_02') else L.flat('tz_prev_asph', '#8f8e8a')
B.box('road', asph, R['x0'], R['x1'], -0.05, 0.0, z0, z1)
yel = L.flat('tz_prev_yel', '#e8c040', rough=0.6); wht = L.flat('tz_prev_wht', '#eeeeea', rough=0.6); red = L.flat('tz_prev_red', '#b8332a', rough=0.6)
for dx in (-0.09, 0.09): B.box(f'yl{dx}', yel, dx - 0.05, dx + 0.05, 0.004, 0.012, z0, z1)
pw = R.get('parkW', 1.6)
for sx in (-1, 1):
    xe = sx * R['x1']; xi = xe - sx * pw
    B.box(f'edge{sx}', wht, min(xi, xi + sx * 0.1), max(xi, xi + sx * 0.1), 0.004, 0.012, z0, z1)
    for z in range(-40, 40, 2): B.box(f'pk{sx}_{z}', wht, min(xi, xe), max(xi, xe), 0.004, 0.012, z - 0.05, z + 0.05)
    B.box(f'curb{sx}', L.flat(f'curb{sx}', '#a8a59c'), min(xe, xe + sx * 0.25), max(xe, xe + sx * 0.25), 0.0, 0.14, z0, z1)
    for z in (-2.6, 2.6): pass
# 斑馬線（巷 A 口）
for c in TZ['crossings']:
    for i in range(-4, 5): B.box(f'zb{c["z"]}_{i}', wht, i * 1.0 - 0.3, i * 1.0 + 0.3, 0.004, 0.013, c['z'] - c['w'] / 2, c['z'] + c['w'] / 2)
B.box('far_ground', L.flat('tz_prev_ground', '#8a8780'), -80, 80, -0.1, -0.06, -120, 120)
# ---------- 夜市攤（第 2 版）：照配置 stalls 擺營業的樣子（環境變數 TZ_STALLS=closed 擺收攤的） ----------
try:
    before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT, 'assets/models/env/second_ai/tingzhou_stalls.glb'))
    _st = os.environ.get('TZ_STALLS', 'open'); _all = {o.name: o for o in bpy.data.objects if o not in before}
    for q in (TZ.get('stalls') or {}).get('list', []):
        src = _all.get('STALL_%s_%s' % (q['kind'], _st))
        if not src: continue
        e = bpy.data.objects.new('stall_' + q['id'], None); SC.collection.objects.link(e); e.location = g2b(q['x'], 0, q['z']); e.rotation_euler = (0, 0, q['yaw'])
        for ch in src.children: c2 = ch.copy(); SC.collection.objects.link(c2); c2.parent = e
    for o in _all.values():
        if o.type == 'MESH' and o.parent and o.parent.name.startswith('STALL_'): o.hide_render = True
except Exception as ex: print('stalls skip', ex)
# ---------- 機車（路邊機車格，斜停；巷口、斑馬線不停）----------
try:
    before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT, 'assets/models/env/second_ai/scooter.glb'))
    sc_objs = [o for o in bpy.data.objects if o not in before]; sc_root = [o for o in sc_objs if o.parent is None]
    def dup(src, dst):
        for ch in src.children: c2 = ch.copy(); SC.collection.objects.link(c2); c2.parent = dst; c2.matrix_parent_inverse = ch.matrix_parent_inverse.copy(); dup(ch, c2)
    proto = bpy.data.objects.new('scooter_proto', None); SC.collection.objects.link(proto)
    for o in sc_root: o.parent = proto
    rng = random.Random(5); n = 0
    for sx in (-1, 1):
        x = sx * (R['x1'] - pw / 2)
        for z in [v * 0.9 for v in range(-44, 45)]:
            if abs(z) < 3.6 or rng.random() < float(os.environ.get('TZ_SCOOTER_SKIP', '0.25')): continue
            cp = proto.copy(); SC.collection.objects.link(cp); dup(proto, cp)
            cp.location = g2b(x, 0, z); cp.rotation_euler = (0, 0, (math.pi / 2 if sx > 0 else -math.pi / 2) + rng.uniform(-0.35, 0.35)); n += 1
    proto.location = (0, 0, -100); print('scooters', n)
except Exception as e: print('scooter skip', e)
# ---------- 路燈（鈉燈，兩側交錯）----------
pole = L.flat('tz_prev_pole', '#6e7072', rough=0.5, metal=0.3); LAMPS = []
for i, z in enumerate(range(-36, 40, 14)):
    sx = -1 if i % 2 else 1; x = sx * (R['x1'] - 0.3)
    B.cyl(f'lp{i}', pole, g2b(x, 0, z), g2b(x, 7.5, z), 0.09); B.cyl(f'la{i}', pole, g2b(x, 7.5, z), g2b(x - sx * 1.6, 7.7, z), 0.05)
    lt = bpy.data.objects.new(f'lamp{i}', bpy.data.lights.new(f'lamp{i}', 'POINT')); lt.location = g2b(x - sx * 1.6, 7.5, z); SC.collection.objects.link(lt); LAMPS.append(lt)
# ---------- 電線（街上空：台北老街的電線、電話線）----------
wire = L.flat('tz_prev_wire', '#1e1e1e', rough=0.8)
for k, z in enumerate((-30, -12, 8, 26)):
    for j in range(3): B.cyl(f'w{k}_{j}', wire, g2b(R['x0'] - 1, 6.2 + j * 0.25, z + j * 0.4), g2b(R['x1'] + 1, 6.0 + j * 0.3, z + 2.5 - j * 0.3), 0.012, seg=4)

# ---------- 光 ----------
SC.render.engine = 'BLENDER_EEVEE'
try: SC.eevee.taa_render_samples = int(os.environ.get('TZ_SAMPLES', '8')); SC.eevee.use_shadows = os.environ.get('TZ_SHADOWS', '1') == '1'
except Exception as _e: print('eevee opt', _e)
SC.render.engine = 'BLENDER_EEVEE'; SC.render.resolution_x, SC.render.resolution_y = RES; SC.view_settings.view_transform = 'AgX'
world = bpy.data.worlds.new('w'); SC.world = world; world.use_nodes = True; WN = world.node_tree.nodes; bg = WN['Background']
SKYC = {'day': (0.42, 0.62, 0.95), 'dusk': (0.62, 0.42, 0.50), 'night': (0.02, 0.03, 0.07)}   # 天空：純色（Sky 貼圖節點在這一版 bpy 是黑的）
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); SC.collection.objects.link(sun)
EMIT = {'wz_signs_lit': 6.0, 'wz_room_lit': 3.0, 'wz_tube': 8.0, 'wz_win_glass_lit': 2.0, 'ext_glass_lit': 3.0, 'cafe_bulb': 10.0, 'wz_sf_lamp': 8.0, 'wz_sf_lamp_cool': 8.0}


def set_time(t):
    k = {'day': 0.0, 'dusk': 0.65, 'night': 1.0}[t]
    if t == 'day': sun.data.energy = 4.0; sun.rotation_euler = (math.radians(40), 0, math.radians(150)); sun.data.color = (1, 0.97, 0.92); bg.inputs['Strength'].default_value = 1.0
    elif t == 'dusk': sun.data.energy = 1.2; sun.rotation_euler = (math.radians(83), 0, math.radians(250)); sun.data.color = (1, 0.62, 0.38); bg.inputs['Strength'].default_value = 0.45
    else: sun.data.energy = 0.0; bg.inputs['Strength'].default_value = 0.6
    bg.inputs['Color'].default_value = (*SKYC[t], 1.0)
    for m in SIGN_MATS: m.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 0.15 + 2.6 * k
    for m in bpy.data.materials:
        if not m.use_nodes: continue
        bs = m.node_tree.nodes.get('Principled BSDF')
        if not bs: continue
        base = next((v for kk, v in EMIT.items() if m.name.startswith(kk)), None)
        if base is None: continue
        if 'Emission Strength' in bs.inputs:
            if not bs.inputs['Emission Color'].is_linked:
                c = bs.inputs['Base Color'].default_value; bs.inputs['Emission Color'].default_value = (c[0], c[1], c[2], 1)
            bs.inputs['Emission Strength'].default_value = base * (0.05 + k)
    for lt in LAMPS: lt.data.energy = 900 * k; lt.data.color = (1.0, 0.72, 0.42)


VIEWS = {   # 遊戲座標（x 東、z 南）；眼睛、看的點、焦距
    'main_n': ((0.6, 1.6, -38), (0.0, 4.5, 10), 22),          # 主街：北端往南看（玩家站在路中間）
    'main_s': ((-0.4, 1.6, 30), (0.5, 5.0, -20), 22),         # 南端往北看（水源市場在右邊）
    'player': ((2.6, 2.6, -6), (-2.0, 1.4, 6), 30),           # 玩家鏡頭高度（第三人稱：玩家後上方 2.6 m）
    'alley_out': ((24, 1.6, 0.0), (-6, 2.6, 0.0), 28),        # 從巷 A 走出來：正對泰米村食
    'taimi_front': ((3.6, 1.6, -1.0), (-8.2, 2.2, -1.0), 26),  # 泰米村食正面
    'taimi_side': ((2.8, 1.6, 8.5), (-7.0, 2.4, -1.5), 28),   # 泰米村食斜角
    'xile_yin': ((-3.2, 1.6, 0.0), (8.2, 2.2, 0.0), 30),      # 洗樂（左）、印得好（右），從對面看巷口
    'ref5': ((-1.5, 1.5, -28), (-6.0, 7.5, 16), 26),          # 參考圖 5 的構圖：沿西側立面往前看、仰角（直立招牌一整排）
    'ref_street': ((4.6, 1.65, 34.5), (-6.5, 3.0, 12.0), 24),   # 概念圖 street_dusk_five_shops 的構圖：從對面人行道斜看西側五間（左＝越好吃小館 → 右＝溫特寶邸）
    'keju_front': ((3.5, 1.6, 23.2), (-8.2, 1.9, 23.2), 24), 'yue_front': ((3.5, 1.6, 29.0), (-8.2, 1.9, 29.0), 24), 'dong_front': ((4.2, 1.6, 16.7), (-8.2, 1.9, 16.7), 22), 'lian_front': ((3.0, 1.6, 10.7), (-8.2, 1.9, 10.7), 26),
    'alley_stalls': ((25.5, 1.65, 0.6), (6.0, 1.3, -0.3), 24),   # 巷 A 的夜市攤（從公館那一頭往汀州路看）
    'market_stalls': ((1.5, 1.65, 26.0), (5.5, 1.2, 36.0), 24),   # 水源市場前路邊的攤
    'three': ((-4.0, 1.65, 6.5), (9.0, 2.0, -3.0), 22),          # 印得好（右）、巷 A 口、洗樂（左），從對面斜看
    'ref6': ((1.0, 1.4, 34), (-1.5, 5.0, -10), 28),           # 參考圖 6 的構圖：夜間沿街看、招牌一路亮過去
}
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); SC.collection.objects.link(cam); SC.camera = cam
views = opt.get('--views', ','.join(VIEWS)).split(',')
for t in TIMES:
    set_time(t)
    for vn in views:
        eye, look, lens = VIEWS[vn]; cam.data.lens = lens; cam.location = g2b(*eye); d = g2b(*look) - g2b(*eye); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        SC.render.filepath = os.path.join(OUTD, f'tz_{vn}_{t}.png'); bpy.ops.render.render(write_still=True); print('render', SC.render.filepath)
