"""溫州街店家的窗景照片（給 W3.windowMat 的 <名稱>_<day|night>.webp）：用遊戲裡同一批溫州街正式模型在 Blender 拍（LAWWW2-C 2026-11-04，KOMICHI-NIGHTVIEW-1104）。
原因：小路（wz_teishoku）的窗景是 10-22 在遊戲裡 20:30 拍的，街上亮得像黃昏，BB-C 判「22:00 窗外還是白天」（BB_255 1(a)）；2:30 AM、SUNNY SIDE 的窗景卡是 Blender 拍的夜景（窗、店、路燈亮，天空暗），這支照同一個做法。
鏡頭照 tools/shots/shop_views_layers.py 的同一個名稱（窗那一片的中心、朝外、水平 90°、2:1）：W3.windowMat 的視差以那一片為準，換照片不用改程式。
用法：/opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- --eye x,y,z --at x,y,z --out <png>（或 .webp） [--night] [--res 1024x512] [--samples 96] [--glb a.glb,b.glb,...] [--lens 18] [--copy none|moved|stay] [--place 路徑@x,y,z,ry ...] [--gg-street] [--clip-start m] [--shift-y 0]（參考圖鏡頭：水平鏡頭＋鏡頭上下平移，ADE-V2-1104）[--hour 14]（太陽照遊戲那個時刻）[--pools 光圈.json --pool-w 220]（晚上路燈往下照的一圈光）
  座標是遊戲座標（x 東、y 上、z 南）；--glb 沒寫＝溫州街主巷、雜物、日式宿舍、小公園（assets/models/env/second_ai/）。
例（小路）：-- --eye -2.8,1.25,-4.6 --at -2.8,1.25,40 --out /tmp/wz_teishoku_night.png --night
美國超市街（SHOP-INTERIOR-VIEW-1112）：--glb none --us-street <us_market_street.layout.json>@x,y,z,ry [--us-season summer] [--us-lamp-k 22] --card x0,x1,y0,y1,z [--final WxH] [--flip-x]（指令見 docs/art-rebuild/second_ai/wip/us_views_1113/README.md）。
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
for p in ([] if GLBS == 'none' else GLBS.split(',')): _glb_at(p)   # --glb none：不載溫州街（美國超市街用 --us-street）
for k, v in enumerate(A):   # --place 路徑@x,y,z,ry：例 cafe_exterior.glb@55.4,0,0,-1.5708（2:30 AM：zones3d.js 的 cafeB 在 (55.4, 0)、轉 −π/2）
    if v == '--place': pth, at = A[k + 1].split('@'); _glb_at(pth, *[float(t) for t in at.split(',')])

# --us-street <layout.json>@x,y,z,ry：美國超市街（SHOP-INTERIOR-VIEW-1112：草原超市、竹葉亞洲超市的窗景卡）——整條街（us_market_street.glb）、停著的車（配置 cars，
#   us_cars.glb 的款式、car_paint 照 color 上色，和 src/us3d.js outdoorZone 同一個放法）一起搬到 (x, y, z)、轉 ry（座標用店裡的座標：草原超市 0,0,38,0；竹葉 0,0,44,π）。
#   季節照 --us-season（預設 summer：交換 8/2 開始）：SEASON_GEO_*（extras seasons）只留那一季、SEASON_MATS（換季材質的載體）藏起來。等紅燈的車（waiting）歸遊戲的車流，不拍。
US_M = None; US_SEASON = opt('--us-season', 'summer')
if opt('--us-street'):
    import json as _ju
    from mathutils import Matrix as _Mu
    _lp, _at = opt('--us-street').split('@'); _ux, _uy, _uz, _ury = [float(t) for t in _at.split(',')]
    US_M = _Mu.Translation(g2b((_ux, _uy, _uz))) @ _Mu.Rotation(_ury, 4, 'Z'); UL = _ju.load(open(_lp))
    _b0 = set(bpy.data.objects); _glb_at(_lp.replace('.layout.json', '.glb'), _ux, _uy, _uz, _ury); _us_objs = set(bpy.data.objects) - _b0
    def _hide_u(ob):
        ob.hide_render = True; ob.hide_viewport = True
        for c in ob.children: _hide_u(c)
    for ob in _us_objs:
        sv = ob.get('seasons')
        if (sv is not None and US_SEASON not in str(sv).split(',')) or ob.get('kind') == 'season_mats': _hide_u(ob)
    _cg = os.path.join(os.path.dirname(_lp), 'us_cars.glb')
    if os.path.exists(_cg) and UL.get('cars'):
        _b0 = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=_cg); _lib = [o for o in bpy.data.objects if o not in _b0]
        _tpl = {o.name.split('.')[0]: o for o in _lib}
        for o in _lib:
            if not o.parent: _hide_u(o)
        def _dup_u(src, parent=None):
            o = src.copy(); sc.collection.objects.link(o); o.hide_render = False; o.hide_viewport = False; o.parent = parent
            if parent is not None: o.matrix_parent_inverse = src.matrix_parent_inverse.copy()
            for c in src.children: _dup_u(c, o)
            return o
        def _lin_u(h): return tuple((lambda v: v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4)(int(h[i:i + 2], 16) / 255.0) for i in (1, 3, 5))
        _paint = {}; _ncar = 0
        for c in UL['cars']:
            if c.get('waiting') or c['kind'] not in _tpl: continue
            r = _dup_u(_tpl[c['kind']]); r.matrix_world = US_M @ _Mu.Translation(g2b((c['x'], 0, c['z']))) @ _Mu.Rotation(c['yaw'], 4, 'Z')
            st = [r]
            while st:
                o = st.pop(); st.extend(o.children)
                if o.type != 'MESH': continue
                for sl in o.material_slots:
                    if sl.material and sl.material.name.split('.')[0] == 'car_paint':
                        if c['color'] not in _paint:
                            pm = sl.material.copy(); bb_ = next((n for n in pm.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
                            if bb_: bb_.inputs['Base Color'].default_value = (*_lin_u(c['color']), 1)
                            _paint[c['color']] = pm
                        sl.link = 'OBJECT'; sl.material = _paint[c['color']]
            _ncar += 1
        print('us cars', _ncar, flush=True)
# 美國超市街的發光材質（src/us3d.js outdoorZone：GLOW_*lamp 晚上 1、白天 0；GLOW_*interior 店裡的燈晚上 1、白天 0.55；號誌整天亮；停著的車燈關著）：材質名 → (晚上, 白天)
US_NIGHT = {'GLOW_usms_lamp': (1.0, 0.0), 'GLOW_usms_letters_lamp': (1.0, 0.0), 'GLOW_usms_lightbox_lamp': (1.0, 0.0), 'GLOW_usms_store_interior': (1.0, 0.55),
            'GLOW_usms_signal': (1.0, 1.0), 'GLOW_usms_sig_green': (1.0, 1.0), 'GLOW_usms_sig_red': (1.0, 1.0), 'GLOW_car_head': (0.0, 0.0), 'GLOW_car_tail': (0.0, 0.0)}

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
    elif nm in US_NIGHT:   # 美國超市街（--us-street）：照遊戲的白天／晚上亮度
        if es: es.default_value = US_NIGHT[nm][0 if NIGHT else 1] * EMIT_K
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

# 美國超市街晚上（--us-street）：發光材質 GLOW_usms_lamp 的每一顆燈頭（停車場燈桿 9.3 m、眼鏡蛇頭路燈 8.6 m、雨遮嵌燈 3.9 m、候車亭）放一盞往下照的聚光燈，
#   瓦數照高度平方（--us-lamp-k，預設 22 W／m²）；遊戲是地面光圈（us3d.js lampPools），這裡要真的照亮地面、車、牆
if NIGHT and US_M is not None:
    _nul = 0
    for ob in [o for o in bpy.data.objects if o.type == 'MESH' and not o.hide_render]:
        idx = [i for i, sl in enumerate(ob.material_slots) if sl.material and sl.material.name.split('.')[0] == 'GLOW_usms_lamp']
        if not idx: continue
        cl = []   # 燈頭：同一顆燈的面（盒子的面不共用頂點）照距離併成一顆（水平 0.9 m、高度 0.4 m 以內）
        for f in ob.data.polygons:
            if f.material_index not in idx: continue
            c = ob.matrix_world @ f.center
            for k_ in cl:
                if (Vector((k_[0].x, k_[0].y)) - Vector((c.x, c.y))).length < 0.9 and abs(k_[0].z - c.z) < 0.4: k_[1].append(c); break
            else: cl.append([c, [c]])
        for _, pts in cl:
            c = sum(pts, Vector()) / len(pts); h = max(c.z, 1.0)
            ld = bpy.data.lights.new('uslamp', 'SPOT'); ld.color = hexcol(0xfff1dc); ld.energy = float(opt('--us-lamp-k', '22')) * h * h; ld.shadow_soft_size = 0.15
            ld.spot_size = math.radians(150); ld.spot_blend = 0.6
            lo = bpy.data.objects.new('uslamp', ld); sc.collection.objects.link(lo); lo.location = (c.x, c.y, c.z - 0.06); _nul += 1   # 聚光燈照 −Z＝往下
    nlight += _nul; print('us lamps', _nul, flush=True)

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

# --gg-street：公館區域（zones3d.js 的 gongguan）程式畫的地面：南側人行道 z 4～20、羅斯福路 z −31～4（車道線 z −25／−19／−8／−2、中間黃色雙實線、校門口的斑馬線 x −6～6）、
#   北側人行道 z −45～−31、校門兩邊的紅磚圍牆 z −46（x ±9～±79，高 1.8＋牆頭）。afar 往外看（AFAR-VIEW-1105）用；校門本體用 --place campus_gate.glb@0,0,-46,0
if '--gg-street' in A:
    def _pm(name, col, rough=0.85):
        m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
        b.inputs['Base Color'].default_value = (*hexcol(col), 1); b.inputs['Roughness'].default_value = rough; return m
    def _slab(name, m, x0, x1, z0, z1, y0, y1):
        import bmesh
        bm = bmesh.new(); r = bmesh.ops.create_cube(bm, size=1.0)
        for v in r['verts']:
            v.co = Vector(((x1 if v.co.x > 0 else x0), -(z1 if v.co.y < 0 else z0), (y1 if v.co.z > 0 else y0)))
        me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(m)
        ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); return ob
    _slab('gg_asphalt', _pm('gg_asphalt', 0xacacaa, 0.92), -90, 90, -31, 4, -0.03, 0.0)
    def _pave(name, col):   # 人行道地磚：和遊戲 W3.stoneTex('#dcd5c8')×repeat[40,4] 同尺寸——錯縫長條磚 1.875 × 0.656 m、淡棕色細縫（WINVIEW-AUDIT-1105，LAWWW2-C 11-14：原本一整片純色，窗外看起來是灰的、和走出門看到的地磚不一樣）
        m = _pm(name, col, 0.9); nt = m.node_tree; N = nt.nodes; b = N['Principled BSDF']
        tc = N.new('ShaderNodeTexCoord'); br = N.new('ShaderNodeTexBrick')
        br.offset = 0.5; br.offset_frequency = 2; br.squash = 1.0; br.squash_frequency = 2
        br.inputs['Scale'].default_value = 1.0; br.inputs['Mortar Size'].default_value = 0.025; br.inputs['Mortar Smooth'].default_value = 0.1
        br.inputs['Brick Width'].default_value = 1.875; br.inputs['Row Height'].default_value = 0.656; br.inputs['Bias'].default_value = 0.0
        c = hexcol(col); br.inputs['Color1'].default_value = (*c, 1); br.inputs['Color2'].default_value = (c[0] * 0.95, c[1] * 0.95, c[2] * 0.94, 1)
        br.inputs['Mortar'].default_value = (c[0] * 0.82, c[1] * 0.78, c[2] * 0.72, 1)
        nt.links.new(tc.outputs['Object'], br.inputs['Vector']); nt.links.new(br.outputs['Color'], b.inputs['Base Color']); return m
    _slab('gg_walk_s', _pave('gg_walk', 0xe8d2ac), -90, 90, 4, 20, 0.0, 0.03)
    _slab('gg_walk_n', _pave('gg_walk_n', 0xe8d2ac), -90, 90, -45, -31, 0.0, 0.03)
    _wl = _pm('gg_lane', 0xf2f2ee, 0.6)
    for z in (-25, -19, -8, -2):
        for x in range(-88, 88, 6): _slab('gg_lane', _wl, x, x + 3, z - 0.2, z + 0.2, 0.0, 0.006)
    _yl = _pm('gg_yellow', 0xd9a93a, 0.7)
    for z in (-13.65, -13.35): _slab('gg_yellow', _yl, -90, 90, z - 0.07, z + 0.07, 0.0, 0.006)
    for k in range(0, 9):
        x0 = -6 + k * 1.4; _slab('gg_zebra', _wl, x0, x0 + 0.7, -30.6, 3.6, 0.0, 0.007)
    _wm = _pm('gg_wall', 0xb8735a, 0.9); _cap = _pm('gg_wall_cap', 0xd9d3c6, 0.8)
    for sgn in (-1, 1):
        x0, x1 = sorted((sgn * 9, sgn * 79)); _slab('gg_wall', _wm, x0, x1, -46.5, -45.5, 0.0, 1.8); _slab('gg_cap', _cap, x0 - 0.1, x1 + 0.1, -46.6, -45.4, 1.8, 1.94)
    _slab('gg_campus', _pm('gg_campus_lawn', 0x5f6b47, 0.95), -120, 120, -160, -46.5, -0.02, 0.0)
# --slabs <json：[{x0,x1,z0,z1,y0,y1,col:'#rrggbb',rough?,name?}]>：程式畫的地面、矮牆、候車亭這類方塊（遊戲座標）——XS-WINCARD-1105（新生南路：地面、圍牆是套件畫的）
if opt('--slabs') and os.path.exists(opt('--slabs')):
    import json as _js, bmesh as _bm
    _mc = {}
    for q in _js.load(open(opt('--slabs'))):
        key = (q['col'], q.get('rough', 0.88))
        if key not in _mc:
            m = bpy.data.materials.new('slab_' + q['col']); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
            b.inputs['Base Color'].default_value = (*hexcol(int(q['col'].lstrip('#'), 16)), 1); b.inputs['Roughness'].default_value = key[1]; _mc[key] = m
        bm = _bm.new(); r = _bm.ops.create_cube(bm, size=1.0)
        for v in r['verts']: v.co = Vector(((q['x1'] if v.co.x > 0 else q['x0']), -(q['z1'] if v.co.y < 0 else q['z0']), (q['y1'] if v.co.z > 0 else q['y0'])))
        me = bpy.data.meshes.new(q.get('name', 'slab')); bm.to_mesh(me); bm.free(); me.materials.append(_mc[key])
        ob = bpy.data.objects.new(q.get('name', 'slab'), me); sc.collection.objects.link(ob)
    print('slabs', len(_js.load(open(opt('--slabs')))), flush=True)
# --trees <json：[{x,z,sp:'camphor'|'banyan'|'palm',h,ry}]>：照種類種樹（street_trees.glb 的範本 tree_<sp>_a／_b，照 h／h0 縮放）——XS-WINCARD-1105
#   （以前公館的照片是把整顆 street_trees.glb 放一次＝四種範本疊在一起，椰子和樟樹長在同一個位置）
if opt('--trees') and os.path.exists(opt('--trees')):
    import json as _jt
    from mathutils import Matrix as _Mx
    _TG = os.path.join(ROOT, 'assets/models/env/second_ai/street_trees.glb'); _TJ = _jt.load(open(_TG[:-4] + '.json'))['models']
    _bef = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=_TG); _lib = [o for o in bpy.data.objects if o not in _bef]
    _tpl = {o.name.split('.')[0]: o for o in _lib if o.name.split('.')[0].startswith('tree_')}
    for o in _lib:
        if not o.parent: hide_tree(o)
    def _dup(src, parent=None):
        o = src.copy(); sc.collection.objects.link(o); o.hide_render = False; o.hide_viewport = False
        o.parent = parent
        if parent is not None: o.matrix_parent_inverse = src.matrix_parent_inverse.copy()
        for c in src.children: _dup(c, o)
        return o
    _nt = 0
    for i, t in enumerate(_jt.load(open(opt('--trees')))):
        sp = t.get('sp', 'camphor'); cands = [k for k in _tpl if k.startswith('tree_' + sp)] or [k for k in _tpl if k.startswith('tree_camphor')]
        if not cands: continue
        k = sorted(cands)[i % len(cands)]; h0 = float(_TJ.get(k[5:], {}).get('h0', 12.0)); sk = float(t.get('h', h0)) / h0
        r = _dup(_tpl[k]); r.matrix_world = _Mx.Translation(g2b((t['x'], 0, t['z']))) @ _Mx.Rotation(float(t.get('ry', 0)), 4, 'Z') @ _Mx.Scale(sk, 4); _nt += 1
    print('trees', _nt, flush=True)
# --lamps <json：[{x,z,ry}]>：路燈（street_props.glb 的 lamp_post＋lamp_post_lens 範本；遊戲 W3.lampPost，燈臂朝 +z，ry＝遊戲的 rotation.y）——XS-WINCARD-1105
if opt('--lamps') and os.path.exists(opt('--lamps')):
    import json as _jl
    from mathutils import Matrix as _Ml
    _bef = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT, 'assets/models/env/second_ai/street_props.glb')); _lib = [o for o in bpy.data.objects if o not in _bef]
    _tp = [o for o in _lib if o.name.split('.')[0] in ('lamp_post', 'lamp_post_lens')]
    for o in _lib:
        if not o.parent: hide_tree(o)
    _base = next((o for o in _tp if o.name.split('.')[0] == 'lamp_post'), None)
    if _base:
        _inv = _base.matrix_world.inverted(); _nl = 0
        for t in _jl.load(open(opt('--lamps'))):
            W_ = _Ml.Translation(g2b((t['x'], 0, t['z']))) @ _Ml.Rotation(float(t.get('ry', 0)), 4, 'Z') @ _inv
            for src in _tp:
                o = src.copy(); sc.collection.objects.link(o); o.parent = None; o.hide_render = False; o.hide_viewport = False; o.matrix_world = W_ @ src.matrix_world
            _nl += 1
        print('lamps', _nl, flush=True)
# --ground：一大片地面（校園建築的 GLB 沒有地面；TEACH-PTBOYA-REF-1104 拍普通、博雅用）：--ground '#8f8c84'
if opt('--ground'):
    gm = bpy.data.materials.new('view_ground'); gm.use_nodes = True; gb_ = gm.node_tree.nodes['Principled BSDF']
    gc_ = int(opt('--ground').lstrip('#'), 16); gb_.inputs['Base Color'].default_value = (*hexcol(gc_), 1); gb_.inputs['Roughness'].default_value = 0.9
    bpy.ops.mesh.primitive_plane_add(size=600, location=(0, 0, -0.01)); pl_ = bpy.context.active_object; pl_.data.materials.append(gm)

# 白天：校園地標的窗玻璃（ck_glass）不發光（遊戲晚上才亮；Blender 裡的發光貼圖一直開著）——XS-WINCARD-1105
if not NIGHT:
    for m in bpy.data.materials:
        if m.name.split('.')[0] == 'ck_glass' and m.use_nodes:
            for n in m.node_tree.nodes:
                if n.type == 'BSDF_PRINCIPLED' and 'Emission Strength' in n.inputs: n.inputs['Emission Strength'].default_value = 0.0
                if n.type == 'EMISSION': n.inputs['Strength'].default_value = 0.0
# 天空與太陽
wd = bpy.data.worlds.new('W'); sc.world = wd; wd.use_nodes = True; bg = wd.node_tree.nodes['Background']
if NIGHT:
    bg.inputs['Color'].default_value = (0.006, 0.009, 0.022, 1); bg.inputs['Strength'].default_value = 1.0
    sd = bpy.data.lights.new('moon', 'SUN'); sd.energy = float(opt('--moon', '0.04')); sd.color = (0.55, 0.65, 1.0); sd.angle = math.radians(1.0)   # --moon：月光／城市的天光照在地面、牆上（天空顏色不變）；新生南路大馬路 0.3（XS-NIGHT-1107：BB-B「大口窗景晚上只看得到天空」）
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
    if US_M is not None: so.matrix_world = US_M.to_3x3().to_4x4() @ so.matrix_world   # 超市街轉過方向（竹葉 π）：太陽跟著街轉，照的還是街上的東南西北
else:
    so.rotation_euler = (math.radians(38), 0, math.radians(float(opt('--sun-z', '150'))))   # 舊的固定角度（沒給 --hour）；--sun-z：繞垂直軸轉幾度（比對參考圖材質用，例如 A 側朝北的店面打正面光：--sun-z 330）

# --pools <json：[{x,z,r,h}]>：晚上路燈往下照的一圈光（遊戲是 TK.lightPool 地面光圈；這裡放往下的聚光燈，範圍＝光圈半徑、燈頭高度 h）——KOMICHI-VIEW-POLISH ①
npool = 0
if NIGHT and opt('--pools') and os.path.exists(opt('--pools')):
    import json as _jp
    near_d = float(opt('--pool-near', '0'))   # --pool-near 公尺：離鏡頭這麼近的路燈照舊只照燈下一圈（220 W、半徑 ×1、不加點光源）——XS-NIGHT-1107 第 2 版（BB-B：店門口那一大片地面亮成白天的沙色，晚上的地面要暗、只在燈下一圈亮）
    for q in _jp.load(open(opt('--pools'))):
        near = near_d > 0 and math.hypot(q['x'] - EYE[0], q['z'] - EYE[2]) < near_d
        ld = bpy.data.lights.new('pool', 'SPOT'); ld.color = hexcol(0xffd696); ld.energy = 220.0 if near else float(opt('--pool-w', '220')); ld.shadow_soft_size = 0.12
        ld.spot_size = min(math.radians(160), 2 * math.atan(q['r'] * (1.0 if near else float(opt('--pool-r', '1'))) / q['h']) * 1.1); ld.spot_blend = 0.45   # --pool-r：光圈半徑的倍率（大馬路的路燈照得比較開）
        lo = bpy.data.objects.new('pool', ld); sc.collection.objects.link(lo); lo.location = g2b((q['x'], q['h'] - 0.15, q['z'])); lo.rotation_euler = (0, 0, 0); npool += 1   # 聚光燈照 −Z＝往下
        if float(opt('--pool-point', '0')) > 0 and not near:   # --pool-point W：燈頭再加一顆往四周的點光源（往下的聚光圈照不到直立的圍牆、樹冠；大馬路 XS-NIGHT-1107）
            lp = bpy.data.lights.new('poolpt', 'POINT'); lp.color = hexcol(0xffd696); lp.energy = float(opt('--pool-point')); lp.shadow_soft_size = 0.2
            po = bpy.data.objects.new('poolpt', lp); sc.collection.objects.link(po); po.location = g2b((q['x'], q['h'] - 0.3, q['z']))
    print('pools', npool, flush=True)

# 鏡頭：窗那一片的中心、朝外，水平 90°（2:1 → 垂直 53.13°）
cd = bpy.data.cameras.new('cam'); cd.sensor_fit = 'HORIZONTAL'; cd.sensor_width = 36.0; cd.lens = float(opt('--lens', '18')); cd.shift_y = float(opt('--shift-y', '0')); cd.clip_start = float(opt('--clip-start', '0.05')); cd.clip_end = 400   # --clip-start：鏡頭放在店裡（窗景卡的正中間後面）時，把自己這一棟的玻璃、店內卡片剪掉（AFAR-VIEW-1105）
co = bpy.data.objects.new('cam', cd); sc.collection.objects.link(co); sc.camera = co
co.location = g2b(EYE); d = g2b(AT) - g2b(EYE); co.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
# --card x0,x1,y0,y1,z：窗景卡（垂直於 z 軸的長方形，遊戲座標）——鏡頭在 --eye、朝 +z（卡在前面），畫面剛好框住整張卡（離軸：shift 對準卡的中心）；
#   拍出來的每一個像素＝從 --eye 看過去、落在卡上那一點的景（站在那裡看，卡和真的街景對得上）。--res 要和卡的長寬比一樣（或用 --final 縮成貼圖大小）
if opt('--card'):
    cx0, cx1, cy0, cy1, cz = [float(t) for t in opt('--card').split(',')]
    W_, D_ = cx1 - cx0, cz - EYE[2]
    co.location = g2b(EYE); co.rotation_euler = g2b((0, 0, 1)).to_track_quat('-Z', 'Y').to_euler()
    cd.lens = 36.0 * D_ / W_
    cd.shift_x = -(((cx0 + cx1) / 2) - EYE[0]) / W_   # 朝 +z 看：畫面右手邊是 −x
    cd.shift_y = (((cy0 + cy1) / 2) - EYE[1]) / W_
    print('card lens %.2f shift %.3f %.3f aspect %.3f' % (cd.lens, cd.shift_x, cd.shift_y, W_ / (cy1 - cy0)), flush=True)

sc.render.engine = 'CYCLES'; sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True
try: sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.cycles.max_bounces = 6; sc.cycles.transparent_max_bounces = 8
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.render.resolution_percentage = 100
sc.view_settings.view_transform = 'Standard'; sc.view_settings.exposure = float(opt('--exposure', '0.0'))
sc.render.image_settings.file_format = 'PNG'; sc.render.filepath = OUT
FINAL = opt('--final'); WEBP = OUT.lower().endswith('.webp')
if WEBP: OUT_PNG = OUT[:-5] + '.png'; sc.render.filepath = OUT_PNG
bpy.ops.render.render(write_still=True)
# --flip-x：左右翻（窗景卡的 u 往 +x 增加、從店裡往 +z 看時右手邊是 −x：草原超市 usm_outside_view）；--final WxH：縮成貼圖大小；.webp：轉 webp（品質 --q，預設 82）
if WEBP or FINAL or '--flip-x' in A:
    from PIL import Image
    src = OUT_PNG if WEBP else OUT; im = Image.open(src).convert('RGB')
    if '--flip-x' in A: im = im.transpose(Image.FLIP_LEFT_RIGHT)
    if FINAL: im = im.resize(tuple(int(t) for t in FINAL.split('x')), Image.LANCZOS)
    if WEBP: im.save(OUT, 'WEBP', quality=int(opt('--q', '82')), method=6); os.remove(src)
    else: im.save(OUT)
print('OK', OUT, 'night' if NIGHT else 'day', 'lights', nlight, 'hidden', nhide, 'scooters', nsc, 'mats', len(bpy.data.materials))
