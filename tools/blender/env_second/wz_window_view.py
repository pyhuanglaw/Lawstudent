"""溫州街店家的窗景照片（給 W3.windowMat 的 <名稱>_<day|night>.webp）：用遊戲裡同一批溫州街正式模型在 Blender 拍（LAWWW2-C 2026-11-04，KOMICHI-NIGHTVIEW-1104）。
原因：小路（wz_teishoku）的窗景是 10-22 在遊戲裡 20:30 拍的，街上亮得像黃昏，BB-C 判「22:00 窗外還是白天」（BB_255 1(a)）；2:30 AM、SUNNY SIDE 的窗景卡是 Blender 拍的夜景（窗、店、路燈亮，天空暗），這支照同一個做法。
鏡頭照 tools/shots/shop_views_layers.py 的同一個名稱（窗那一片的中心、朝外、水平 90°、2:1）：W3.windowMat 的視差以那一片為準，換照片不用改程式。
用法：/opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- --eye x,y,z --at x,y,z --out <png> [--night] [--res 1024x512] [--samples 96] [--glb a.glb,b.glb,...] [--lens 18] [--copy none|moved|stay] [--place 路徑@x,y,z,ry ...] [--shift-y 0]（參考圖鏡頭：水平鏡頭＋鏡頭上下平移，ADE-V2-1104）[--hour 14]（太陽照遊戲那個時刻）[--pools 光圈.json --pool-w 220]（晚上路燈往下照的一圈光）
  座標是遊戲座標（x 東、y 上、z 南）；--glb 沒寫＝溫州街主巷、雜物、日式宿舍、小公園（assets/models/env/second_ai/）。
例（小路）：-- --eye -2.8,1.25,-4.6 --at -2.8,1.25,40 --out /tmp/wz_teishoku_night.png --night
夜晚的亮度照遊戲 zones3d.js 的 WZ_NIGHT（材質名 → 顏色、晚上亮度），GLOW_* 空節點（extras glow／size／night）放點光源；店內（wz_in_*）晚上自己發一點光（店裡開著燈）。"""
import math, os, sys
import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def opt(k, d=None): return A[A.index(k) + 1] if k in A else d
def vec3(s): return [float(v) for v in s.split(',')]
EYE, AT, OUT = vec3(opt('--eye')), vec3(opt('--at')), opt('--out')
NIGHT = '--night' in A
RW, RH = map(int, opt('--res', '1024x512').split('x')); SAMPLES = int(opt('--samples', '96'))
GLBS = opt('--glb') or ','.join(os.path.join(ROOT, 'assets/models/env/second_ai', f + '.glb') for f in ('wenzhou_street', 'wz_props', 'wz_jphouse', 'wz_park'))
g2b = lambda p: Vector((p[0], -p[2], p[1]))   # 遊戲 (x, y, z) → Blender (x, −z, y)：glTF 匯入時 +Y 上 → +Z 上

# 遊戲 zones3d.js 的 WZ_NIGHT：材質名 → [發光顏色, 晚上亮度, 白天亮度]
WZ_NIGHT = {'wz_signs_lit': (0xffffff, 1.1, 0.25), 'ext_glass_lit': (0xffcf8f, 1.5, 0), 'wz_room_lit': (0xffb866, 1.9, 0), 'wz_win_glass_lit': (0xffc070, 0.55, 0),
            'cafe_bulb': (0xfff1d6, 2.2, 0.6), 'wz_tube': (0xffffff, 1.3, 0.2), 'jp_lamp': (0xffcf8a, 1.6, 0.15), 'jp_shoji': (0xffe2b8, 0.7, 0), 'wz_lamp_lens': (0xffe0a0, 2.2, 0)}
EMIT_K = float(opt('--emit', '2.2'))   # 遊戲的 emissiveIntensity → Cycles 的發光強度（Standard 顯示轉換下看起來接近遊戲的亮度）

def lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
def hexcol(h): return (lin((h >> 16) & 255), lin((h >> 8) & 255), lin(h & 255))

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
def _glb_at(p, x=0.0, y=0.0, z=0.0, ry=0.0):
    """匯入一顆 GLB；最上層的物件整組移到遊戲座標 (x, y, z)、繞垂直軸轉 ry（遊戲的 rotation.y）"""
    if not os.path.exists(p): print('沒有這個 GLB，略過', p); return
    before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=p)
    if (x, y, z, ry) == (0.0, 0.0, 0.0, 0.0): return
    from mathutils import Matrix
    M = Matrix.Translation(g2b((x, y, z))) @ Matrix.Rotation(ry, 4, 'Z')
    for o in set(bpy.data.objects) - before:
        if o.parent is None: o.matrix_world = M @ o.matrix_world
for p in GLBS.split(','): _glb_at(p)
for k, v in enumerate(A):   # --place 路徑@x,y,z,ry：例 cafe_exterior.glb@55.4,0,0,-1.5708（2:30 AM：zones3d.js 的 cafeB 在 (55.4, 0)、轉 −π/2）
    if v == '--place': pth, at = A[k + 1].split('@'); _glb_at(pth, *[float(t) for t in at.split(',')])

# 遊戲照狀態切換的節點：照預設狀態藏起來（不然兩種外觀疊在一起）
#   阿德影印 COPY_*（zones3d.js wzCopyVis）：還沒決定＝A1 開著、轉角拉下鐵捲門 → 藏 COPY_A1_SHUT／COPY_A1_RENEW／COPY_CORNER_OPEN
#   季節 SEASON_<種類>_<on|off>（wzParkSeason）：照 --month（預設 11 月：杜鵑沒開、楓香沒紅、冰菓室關著）
MONTH = int(opt('--month', '11'))
COPY = opt('--copy', 'none')   # 阿德影印 WZ_COPY_SHOP：none＝還沒決定（預設）、moved＝搬到轉角、stay＝留下來續約
COPY_HIDE = {'none': r'^COPY_(A1_SHUT|A1_RENEW|CORNER_OPEN)', 'moved': r'^COPY_(A1_RENEW|CORNER_SHUT)', 'stay': r'^COPY_(A1_SHUT|CORNER_OPEN)'}[COPY]
def season_on(kind): return MONTH == 3 if kind == 'AZALEA' else ((MONTH in (12, 1)) if kind == 'SWEETGUM' else (not (5 <= MONTH <= 9) if kind == 'ICECLOSED' else False))
import re as _re
def hide_tree(ob):
    ob.hide_render = True; ob.hide_viewport = True
    for c in ob.children: hide_tree(c)
nhide = 0
for ob in list(bpy.data.objects):
    nm = ob.name.split('.')[0]
    k = _re.match(r'^SEASON_([A-Z]+)_(on|off)', nm)
    if k and ((k.group(2) == 'on') != season_on(k.group(1))): hide_tree(ob); nhide += 1
    if _re.match(COPY_HIDE, nm): hide_tree(ob); nhide += 1

def principled(m):
    if not m or not m.use_nodes: return None
    return next((n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)

for m in bpy.data.materials:
    b = principled(m)
    if not b: continue
    nm = m.name.split('.')[0]
    es = b.inputs.get('Emission Strength'); ec = b.inputs.get('Emission Color')
    if nm in WZ_NIGHT:
        col, ni, di = WZ_NIGHT[nm]
        k = ni if NIGHT else di
        if es: es.default_value = k * EMIT_K
        if ec and not ec.is_linked: ec.default_value = (*hexcol(col), 1)
        elif ec and ec.is_linked:   # 有自發光貼圖：乘上遊戲的發光顏色
            mix = m.node_tree.nodes.new('ShaderNodeMixRGB'); mix.blend_type = 'MULTIPLY'; mix.inputs['Fac'].default_value = 1.0
            src = ec.links[0].from_socket; m.node_tree.links.new(src, mix.inputs['Color1']); mix.inputs['Color2'].default_value = (*hexcol(col), 1)
            m.node_tree.links.new(mix.outputs['Color'], ec)
    elif nm.startswith('wz_in_') or nm.startswith('wz_sf_lamp'):
        # 店內（貨架、店內的牆、價目）：晚上店裡開著燈 → 用自己的底色貼圖發一點光；門口的燈（wz_sf_lamp*）晚上亮
        if es: es.default_value = ((0.55 if nm.startswith('wz_in_') else 3.0) if NIGHT else 0.0)
        bc = b.inputs.get('Base Color')
        if NIGHT and ec and bc and bc.is_linked and not ec.is_linked: m.node_tree.links.new(bc.links[0].from_socket, ec)
        elif NIGHT and ec and not ec.is_linked and bc: ec.default_value = bc.default_value
    else:
        # 其他材質：照 GLB 原本的自發光（白天的值）；晚上不發光的東西照舊
        pass
    # 半透明玻璃：Cycles 照 alpha 混合
    if m.blend_method in ('BLEND', 'HASHED') or (b.inputs.get('Alpha') and b.inputs['Alpha'].default_value < 0.999):
        try: m.surface_render_method = 'BLENDED'
        except Exception: pass

# GLOW_* 空節點（騎樓燈、門口燈、店內燈、招牌燈）：晚上放點光源（遊戲的光暈貼片在 Blender 不畫）
nlight = 0
if NIGHT:
    import re
    for ob in list(bpy.data.objects):
        g = ob.get('glow')
        if not g: continue
        m_ = re.match(r'rgba\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)', str(g))
        col = tuple(lin(float(v)) for v in m_.groups()) if m_ else (1.0, 0.85, 0.6)
        night = float(ob.get('night', 1.0)); size = float(ob.get('size', 1.4))
        if night <= 0.02: continue
        ld = bpy.data.lights.new('L_' + ob.name, 'POINT'); ld.color = col; ld.energy = float(opt('--lamp-k', '35')) * night * size * size; ld.shadow_soft_size = 0.15 * size   # --lamp-k：點光源的瓦數倍率（小路 20：街上暗一點、亮的只剩燈下和窗）
        lo = bpy.data.objects.new('L_' + ob.name, ld); sc.collection.objects.link(lo); lo.location = ob.matrix_world.translation; nlight += 1

# 停著的機車（遊戲是程式放的：zones3d.js 的套件機車位置 → attachWzScooters 換成 scooter.glb 的款式）：--scooters <json：[{x,z,ry}]>，款式和顏色照遊戲同一個 hash
nsc = 0
SCJ, SCG = opt('--scooters'), opt('--scooter-glb', os.path.join(ROOT, 'assets/models/env/second_ai/scooter.glb'))
if SCJ and os.path.exists(SCJ) and os.path.exists(SCG):
    import json as _json
    from mathutils import Matrix
    before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=SCG); lib = [o for o in bpy.data.objects if o not in before]
    V = []
    for o in sorted([o for o in lib if o.parent and o.parent.name.split('.')[0] == 'scooters'], key=lambda o: [c.name for c in o.parent.children].index(o.name)):
        m_ = _re.match(r'^scooter_(S\w+)$', o.name.split('.')[0])
        if not m_ or o.name.split('.')[0].endswith('_lod1') or not (float(o.get('weight', 0)) > 0): continue
        try: pal = _json.loads(o.get('palette', '[]'))
        except Exception: pal = []
        V.append((m_.group(1), o, float(o['weight']), pal))
    for o in lib:
        if not o.parent: hide_tree(o)
    W_ = sum(v[2] for v in V)
    def h_(x, z, k):
        t = math.sin(x * 12.9898 + z * 78.233 + k * 37.719) * 43758.5453; return t - math.floor(t)
    def dup(src, parent=None):
        o = src.copy(); sc.collection.objects.link(o); o.hide_render = False; o.hide_viewport = False
        if parent is not None: o.parent = parent; o.matrix_parent_inverse = src.matrix_parent_inverse.copy()
        else: o.parent = None
        for c in src.children: dup(c, o)
        return o
    paintM = {}
    for s in _json.load(open(SCJ)):
        if abs(s['x']) < 1e-6 and abs(s['z']) < 1e-6: continue
        r = h_(s['x'], s['z'], 1) * W_; v = V[-1]
        for c in V:
            r -= c[2]
            if r <= 0: v = c; break
        col = v[3][int(math.floor(h_(s['x'], s['z'], 2) * len(v[3])))] if v[3] else '#e8e8e6'
        root = dup(v[1]); root.matrix_world = Matrix.Translation(g2b((s['x'], 0, s['z']))) @ Matrix.Rotation(s['ry'] - math.pi / 2, 4, 'Z')
        if col not in paintM:
            base = next((m for m in bpy.data.materials if m.name.split('.')[0] == 'scooter_paint'), None)
            if base:
                pm = base.copy(); bb = principled(pm); cc = int(col[1:], 16)
                if bb: bb.inputs['Base Color'].default_value = (*hexcol(cc), 1)
                paintM[col] = pm
        stack = [root]
        while stack:
            o = stack.pop(); stack.extend(o.children)
            if o.type != 'MESH': continue
            for sl in o.material_slots:
                if sl.material and sl.material.name.split('.')[0] == 'scooter_paint' and col in paintM: sl.link = 'OBJECT'; sl.material = paintM[col]
        nsc += 1

# --ground：一大片地面（校園建築的 GLB 沒有地面；TEACH-PTBOYA-REF-1104 拍普通、博雅用）：--ground '#8f8c84'
if opt('--ground'):
    gm = bpy.data.materials.new('view_ground'); gm.use_nodes = True; gb_ = gm.node_tree.nodes['Principled BSDF']
    gc_ = int(opt('--ground').lstrip('#'), 16); gb_.inputs['Base Color'].default_value = (*hexcol(gc_), 1); gb_.inputs['Roughness'].default_value = 0.9
    bpy.ops.mesh.primitive_plane_add(size=600, location=(0, 0, -0.01)); pl_ = bpy.context.active_object; pl_.data.materials.append(gm)

# 天空與太陽
wd = bpy.data.worlds.new('W'); sc.world = wd; wd.use_nodes = True; bg = wd.node_tree.nodes['Background']
if NIGHT:
    bg.inputs['Color'].default_value = (0.006, 0.009, 0.022, 1); bg.inputs['Strength'].default_value = 1.0
    sd = bpy.data.lights.new('moon', 'SUN'); sd.energy = 0.04; sd.color = (0.55, 0.65, 1.0); sd.angle = math.radians(1.0)
else:
    bg.inputs['Color'].default_value = (0.42, 0.58, 0.85, 1); bg.inputs['Strength'].default_value = 1.1
    sd = bpy.data.lights.new('sun', 'SUN'); sd.energy = 3.2; sd.color = (1.0, 0.96, 0.9); sd.angle = math.radians(1.5)
so = bpy.data.objects.new('sun', sd); sc.collection.objects.link(so)
# --hour：太陽照遊戲 engine3d.js 的 KEY0（時、仰角、羅盤方位；戶外 x 東、−z 北，溫州街沒有 sunYaw）——KOMICHI-VIEW-POLISH（BB 14:04「白天太陽照遊戲 14:00、有斜影子」）
GAME_SUN = [(5.5, 2, 80), (7, 12, 88), (9, 32, 100), (12, 68, 150), (15, 45, 225), (17, 26, 262), (18, 13, 268), (18.6, 3, 272), (19.2, -2, 276), (21, -10, 280), (24, -10, 280)]
def game_sun(h):
    hq = round(h * 20) / 20; i = 0
    while i < len(GAME_SUN) - 2 and GAME_SUN[i + 1][0] <= hq: i += 1
    a, b = GAME_SUN[i], GAME_SUN[i + 1]; t = max(0.0, min(1.0, (hq - a[0]) / (b[0] - a[0])))
    return math.radians(a[1] + (b[1] - a[1]) * t), math.radians(a[2] + (b[2] - a[2]) * t)
if opt('--hour') and not opt('--sun-z'):
    el, az = game_sun(float(opt('--hour')))
    to_sun = Vector((math.cos(el) * math.sin(az), math.sin(el), -math.cos(el) * math.cos(az)))   # 遊戲座標：從地面往太陽
    so.rotation_euler = (-g2b(to_sun)).to_track_quat('-Z', 'Y').to_euler()                      # 太陽燈照 −Z：光走的方向＝往太陽的反方向
    print('sun', opt('--hour'), 'elev %.1f az %.1f' % (math.degrees(el), math.degrees(az)), flush=True)
else:
    so.rotation_euler = (math.radians(38), 0, math.radians(float(opt('--sun-z', '150'))))   # 舊的固定角度（沒給 --hour）；--sun-z：繞垂直軸轉幾度（比對參考圖材質用，例如 A 側朝北的店面打正面光：--sun-z 330）

# --pools <json：[{x,z,r,h}]>：晚上路燈往下照的一圈光（遊戲是 TK.lightPool 地面光圈；這裡放往下的聚光燈，範圍＝光圈半徑、燈頭高度 h）——KOMICHI-VIEW-POLISH ①
npool = 0
if NIGHT and opt('--pools') and os.path.exists(opt('--pools')):
    import json as _jp
    for q in _jp.load(open(opt('--pools'))):
        ld = bpy.data.lights.new('pool', 'SPOT'); ld.color = hexcol(0xffd696); ld.energy = float(opt('--pool-w', '220')); ld.shadow_soft_size = 0.12
        ld.spot_size = min(math.radians(160), 2 * math.atan(q['r'] / q['h']) * 1.1); ld.spot_blend = 0.45
        lo = bpy.data.objects.new('pool', ld); sc.collection.objects.link(lo); lo.location = g2b((q['x'], q['h'] - 0.15, q['z'])); lo.rotation_euler = (0, 0, 0); npool += 1   # 聚光燈照 −Z＝往下
    print('pools', npool, flush=True)

# 鏡頭：窗那一片的中心、朝外，水平 90°（2:1 → 垂直 53.13°）
cd = bpy.data.cameras.new('cam'); cd.sensor_fit = 'HORIZONTAL'; cd.sensor_width = 36.0; cd.lens = float(opt('--lens', '18')); cd.shift_y = float(opt('--shift-y', '0')); cd.clip_start = 0.05; cd.clip_end = 400
co = bpy.data.objects.new('cam', cd); sc.collection.objects.link(co); sc.camera = co
co.location = g2b(EYE); d = g2b(AT) - g2b(EYE); co.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()

sc.render.engine = 'CYCLES'; sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True
try: sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.cycles.max_bounces = 6; sc.cycles.transparent_max_bounces = 8
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.render.resolution_percentage = 100
sc.view_settings.view_transform = 'Standard'; sc.view_settings.exposure = float(opt('--exposure', '0.0'))
sc.render.image_settings.file_format = 'PNG'; sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print('OK', OUT, 'night' if NIGHT else 'day', 'lights', nlight, 'hidden', nhide, 'scooters', nsc, 'mats', len(bpy.data.materials))
