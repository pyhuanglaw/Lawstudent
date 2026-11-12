"""禮貌生財上師（X332；使用者 11-10 23:4x 的人物圖 docs/handoff/user_specs/limao_ref/shangshi_character.png；LAWWW2 帳號 A 2026-11-11）。
六十多歲、灰白捲髮、圓框細金屬眼鏡、灰白山羊鬍、咖啡色鴨舌帽、深咖啡燈芯絨西裝外套、墨綠 V 領毛衣＋米色襯衫、棕藍格紋長圍巾、灰褐毛料長褲；成人比例（不 Q 版）。
做法：路人生產線 npc.py（同舊序章人物己 long_ho.py）換成他的參數；帽子、眼鏡、鬍子、圍巾是配件（shangshi_props.py → GLB，props3d 掛在頭、胸）。角色美術 LAWWW 驗（D100a）。
用法：/opt/blenv/bin/python tools/blender/char_second/limao_shangshi.py -- <輸出.vrm 或 -> [--render 前綴] [--views ...]
之後：VRM_BASE=Sakurada_Fumiriya VRM_MALE=1 python3 tools/blender/char_second/vrm_finish2.py <輸出.vrm> assets/models/char/second_ai/bl_limao_shangshi.vrm 禮貌生財上師 #2a2018"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
os.environ['NPC'] = 'nm10'             # npc.py 在 import 時要一個已有的名字；下面整個換成舊序章人物己的參數
sys.path.insert(0, HERE)
import npc as N                        # noqa: E402
C = N.C
import bpy                             # noqa: E402

rgb = N.rgb
LONG = dict(sex='m', base='Sakurada_Fumiriya', head=0.97, height=1.69, iris='#2a2018', skin=(0.88, 0.76, 0.64), eye_close=0.14, torso=1.10, stoop=0.014, neck=1.06, belly=0.014,
            # 六十多歲：眼睛細長帶笑（扁、眼尾微微往下）、眉毛灰白稀一點、臉比年輕人寬一點、下巴圓
            face=dict(EYE_SX=0.96, EYE_SZ=0.50, EYE_TILT=0.035, MOUTH_DOWN=-0.0008, BROW_ARCH=0.36, BROW_K=1.75, BROW_SCALE_Z=1.55, BROW_COL=(0.64, 0.59, 0.52), FACE_NARROW=1.035, CHIN_WIDEN=0.86, JAW_OUT=0.0078, D_CHIN=0.002, MOUTH_K=1.5, IRIS_FRAC=0.46),
            # 灰白捲髮：帽子下面兩側和後面蓬出來一圈（頭頂被鴨舌帽蓋住）
            hair=dict(seed=20261111, part=10.0, col=(0.78, 0.73, 0.66), tip=(0.030, 0.030, 0.026, 0.004, -0.006, -0.012, -0.016, -0.030, -0.028, -0.024), nape=0.03, nape_c=0.0, vol=0.62, curl=(18, 34)),
            # 深咖啡燈芯絨西裝外套（敞開）＋墨綠 V 領毛衣＋灰褐毛料長褲＋深咖啡皮鞋
            layered=dict(style=N.outer_style(rgb(64, 44, 32), rgb(104, 94, 82), rgb(58, 40, 28), rgb(40, 28, 20), tex='knit', sleeve_k=0.80, ease=0.92, pants_ell=(0.074, 0.084), shoe_style='loafer'),
                         outer=dict(open=18, buttons=2), inner=dict(rgb=rgb(66, 70, 48))))
N.VAR = LONG; N.NAME = 'shangshi'; N.TAG = 'SHANGSHI'
N.JP_STYLE['shangshi'] = dict(bang='card')   # 原本的一撮一撮短髮（側分）


# ---------- 第 2 版（LAWWW 11-11 00:47 驗第 1 版不過：少年的臉配灰髮、帽子像碗、直瀏海、鬍子浮著、圍巾像圍兜、沒有翻領）----------
# 配件做進人物模型裡（跟著頭、脖子、身體動）：鴨舌帽、帽子下蓬的灰白捲髮、八字鬍＋山羊鬍（連起來）、西裝翻領、米色襯衫領和 V 領、掛在脖子兩邊的格紋圍巾；
# 年紀畫在臉的貼圖上（法令紋、眼袋、魚尾紋、嘴角紋、抬頭紋）。
def accessories(m):
    import numpy as np, math, bmesh
    from mathutils import Vector
    from mathutils.bvhtree import BVHTree
    from mathutils.interpolate import poly_3d_calc
    import h01_hair as HB
    arm = m['arm']; H = HB.Head(m); c = H.c; lm = C.landmarks(arm); rng = np.random.default_rng(1111)
    # ---- 貼圖（一張，七格）：0 帽子（咖啡色人字呢）、1 鬍子（灰白）、2 圍巾（棕藍格紋）、3 流蘇、4 翻領（深咖啡）、5 襯衫（米色）、6 捲髮（灰白，深淺一撮一撮）
    NR = 9; W = 64 * NR; img = np.ones((64, W, 4))   # 第 3 版多兩格：7 帽簷（比帽身深一階的人字呢）、8 毛衣的 V 領羅紋（墨綠）
    def fill(i, base, noise=0.05): img[:, i * 64:(i + 1) * 64, :3] = np.clip(np.array(base)[None, None, :] + rng.normal(0, noise, (64, 64, 1)), 0, 1)
    fill(0, (0.40, 0.29, 0.20), 0.03); fill(1, (0.87, 0.82, 0.75), 0.05); fill(2, (0.42, 0.33, 0.26), 0.02); fill(3, (0.36, 0.30, 0.26), 0.05); fill(4, (0.37, 0.27, 0.20), 0.012); fill(5, (0.90, 0.85, 0.74), 0.012); fill(6, (0.81, 0.76, 0.69), 0.07)   # 第 4 版（最後一次，LAWWW 11-11 05:47：鬍子、鬢角在遊戲裡偏藍灰；參考圖是暖的灰白）：頭髮、鬍子、捲髮、眉毛都往暖的灰白調（遊戲的天光偏藍，貼圖要比目標色 #c9c4bc 再暖一點）
    fill(7, (0.27, 0.19, 0.13), 0.02); fill(8, (0.21, 0.23, 0.15), 0.012)
    yy, xx = np.mgrid[0:64, 0:64]; herr = (((xx + np.where((xx // 8) % 2 == 0, yy, -yy)) % 8) < 3)                     # 人字紋：一直條一直條、斜線方向交錯
    img[:, 0:64, :3] *= np.where(herr, 0.78, 1.0)[..., None]; img[:, 7 * 64:8 * 64, :3] *= np.where(herr, 0.8, 1.0)[..., None]
    for k, col in ((6, (0.20, 0.25, 0.36)), (14, (0.62, 0.50, 0.36)), (22, (0.20, 0.25, 0.36)), (38, (0.58, 0.36, 0.26)), (46, (0.20, 0.25, 0.36)), (54, (0.66, 0.56, 0.42))):
        img[:, 128 + k:128 + k + 3, :3] = col; img[k:k + 3, 128:192, :3] = np.array(col) * 0.9 + 0.1 * img[k:k + 3, 128:192, :3]
    wip = os.path.join(C.ROOT, 'tools', 'vroid_wip', 'bl'); os.makedirs(wip, exist_ok=True)
    im = C.image_from_array('SHANGSHI_Acc', img, os.path.join(wip, 'shangshi_acc.png'))
    tmpl = next(mt.name for mt in bpy.data.materials if 'HairCard' in mt.name and getattr(mt, 'vrm_addon_extension', None))
    mat = C.mtoon_from(tmpl, 'SHANGSHI_Acc_CLOTH', base_img=im, alpha='OPAQUE', double_sided=True, outline=0.0)
    try:   # 頭髮材質的邊緣光、反光貼圖拿掉（帽簷、帽緣會泛一圈淡金色）
        _mt = mat.vrm_addon_extension.mtoon1.extensions.vrmc_materials_mtoon; _mt.parametric_rim_color_factor = (0.0, 0.0, 0.0); _mt.matcap_factor = (0.0, 0.0, 0.0); _mt.rim_lighting_mix_factor = 0.0; _mt.shade_color_factor = (0.80, 0.73, 0.65)
        _mt.matcap_texture.index.source = None; _mt.rim_multiply_texture.index.source = None
    except Exception as ex: print('  acc material rim', ex)
    col = arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection
    def make(name, V, F, U, reg):
        me = bpy.data.meshes.new(name); me.from_pydata([tuple(v) for v in V], [], F); uv = me.uv_layers.new(name='UVMap')
        for poly in me.polygons:
            for li, vi in zip(poly.loop_indices, poly.vertices): u, v = U[vi]; uv.data[li].uv = ((reg + 0.08 + 0.84 * (u % 1.0)) / NR, 0.04 + 0.92 * (v % 1.0))
        me.polygons.foreach_set('use_smooth', [True] * len(me.polygons)); me.materials.append(mat)
        ob = bpy.data.objects.new(name, me); col.objects.link(ob); return ob
    def grid(nu, nv, fn, wrap=False):
        V, U, F = [], [], []
        for j in range(nv + 1):
            for i in range(nu + (0 if wrap else 1)): p, uvv = fn(i / nu, j / nv); V.append(p); U.append(uvv)
        w = nu if wrap else nu + 1
        for j in range(nv):
            for i in range(nu):
                a = j * w + i; b = j * w + (i + 1) % w if wrap else a + 1; F.append((a, b, b + w, a + w))
        return V, F, U
    def scalp(az, el, off):
        d = np.array([math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)]); return c + d * (H.R(d) + off)
    def edge_el(az):   # 帽緣的仰角：前面壓到額頭中間、兩側在耳朵上面、後面低
        f = (math.cos(az) + 1) / 2; return math.radians(-12 + 40 * f ** 1.3)   # 第 3 版：前面抬到髮際線（原本壓到額頭中間，帽子看起來和臉一樣高）
    # ---- 臉的量測（沿中線打射線）----
    zs = np.linspace(H.brow_z - 0.02, H.brow_z - 0.17, 90); ys = np.array([H.front_y(0.0, z) for z in zs])
    k_n = int(np.argmin(ys[:45])); nose_z = float(zs[k_n]); jump = [i for i in range(k_n + 1, len(ys)) if ys[i] - ys[i - 1] > 0.02]; chin_z = float(zs[jump[0] - 1]) if jump else float(zs[-1])
    mouth_z = nose_z - 0.58 * (nose_z - chin_z); eye = C.bone_head(arm, 'J_Adj_L_FaceEye'); ex, ez = abs(float(eye[0])), float(eye[2])
    print('  face nose/mouth/chin/eye', round(nose_z, 4), round(mouth_z, 4), round(chin_z, 4), round(ex, 4), round(ez, 4))
    def face_pt(x, z, off): return np.array([x, H.front_y(x, z) - off, z])
    # ---- 年紀畫在臉的貼圖上 ----
    f = m['face']; me = f.data; FW = HB.Head._world(f); uvl = me.uv_layers.active.data; slots = [s_.material.name if s_.material else '' for s_ in f.material_slots]
    polys = [p_ for p_ in me.polygons if 'Face_00_SKIN' in slots[p_.material_index]]; fb = BVHTree.FromPolygons(FW.tolist(), [list(p_.vertices) for p_ in polys])
    smat = next(s_.material for s_ in f.material_slots if s_.material and 'Face_00_SKIN' in s_.material.name); simg = smat.vrm_addon_extension.mtoon1.pbr_metallic_roughness.base_color_texture.index.source
    iw, ih = simg.size; A = np.array(simg.pixels[:], dtype=np.float32).reshape(ih, iw, 4); K = iw / 1024.0
    def uv_of(p):
        loc, nrm, idx, dist = fb.find_nearest(Vector(p)); pl = polys[idx]; vs = [FW[i] for i in pl.vertices]; uvs = [np.array(uvl[li].uv) for li in pl.loop_indices]
        ws = poly_3d_calc([Vector(v) for v in vs], loc); return sum(wi * u for wi, u in zip(ws, uvs))   # 多邊形內插（第一次用距離倒數：線會一格一格抖）
    def stroke(ctrl, strength=0.3, rad=2.2, tone=(0.80, 0.67, 0.57)):   # 第 3 版：比膚色深一階的膚色（原本偏粉紅）、線寬一點柔一點
        rad = rad * 2.1; strength = strength * 0.95
        pts = []
        for (a, b) in zip(ctrl, ctrl[1:]):
            for t in np.linspace(0, 1, 7)[:-1]: pts.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
        pts.append(ctrl[-1]); px = [uv_of((x, H.front_y(x, z), z)) * np.array([iw, ih]) for x, z in pts]; r = rad * K
        for a, b in zip(px, px[1:]):
            if np.linalg.norm(b - a) > 60 * K: continue                                                                       # 跨到 UV 的另一塊：不畫
            x0, x1 = int(min(a[0], b[0]) - 3 * r), int(max(a[0], b[0]) + 3 * r) + 1; y0, y1 = int(min(a[1], b[1]) - 3 * r), int(max(a[1], b[1]) + 3 * r) + 1
            x0, y0 = max(0, x0), max(0, y0); x1, y1 = min(iw, x1), min(ih, y1)
            if x1 <= x0 or y1 <= y0: continue
            gy, gx = np.mgrid[y0:y1, x0:x1]; d = b - a; L2 = float(d @ d) + 1e-9; t = np.clip(((gx - a[0]) * d[0] + (gy - a[1]) * d[1]) / L2, 0, 1)
            dist = np.hypot(gx - (a[0] + t * d[0]), gy - (a[1] + t * d[1])); kk = (strength * np.exp(-(dist / r) ** 2))[..., None]
            A[y0:y1, x0:x1, :3] = A[y0:y1, x0:x1, :3] * (1 - kk * (1 - np.array(tone, dtype=np.float32)))
    exb, ezb = ex, ez; ex, ez = exb + 0.012, ezb - 0.012   # 眼睛骨頭在眼球裡面偏內上：眼睛的中心在外 1.2 cm、下 1.2 cm（看貼圖對過；第一次魚尾紋畫到眉頭上面）
    for sg in (-1, 1):
        stroke([(sg * 0.014, nose_z - 0.004), (sg * 0.021, nose_z - 0.014), (sg * 0.027, mouth_z + 0.004), (sg * 0.029, mouth_z - 0.008)], 0.27, 2.4)      # 法令紋
        stroke([(sg * 0.025, mouth_z - 0.004), (sg * 0.026, mouth_z - 0.014), (sg * 0.023, chin_z + 0.008)], 0.15, 1.8)                                        # 嘴角往下的紋
        stroke([(sg * (ex - 0.014), ez - 0.010), (sg * (ex - 0.005), ez - 0.0135), (sg * (ex + 0.006), ez - 0.0135), (sg * (ex + 0.015), ez - 0.010)], 0.30, 2.2)                                             # 眼袋
        stroke([(sg * (ex - 0.012), ez - 0.015), (sg * ex, ez - 0.019), (sg * (ex + 0.012), ez - 0.015)], 0.18, 1.8)
        for dz, dz2 in ((0.004, 0.009), (-0.001, -0.002), (-0.006, -0.012)): stroke([(sg * (ex + 0.017), ez + dz), (sg * (ex + 0.027), ez + dz2)], 0.28, 1.5)   # 魚尾紋（笑紋）
        stroke([(sg * 0.004, H.brow_z + 0.002), (sg * 0.005, H.brow_z + 0.012)], 0.2, 1.5)                                                                     # 眉間
    for dz in (0.016, 0.027): stroke([(-0.034, H.brow_z + dz - 0.002), (-0.012, H.brow_z + dz + 0.001), (0.012, H.brow_z + dz + 0.001), (0.034, H.brow_z + dz - 0.002)], 0.1, 1.7)   # 抬頭紋
    if os.environ.get('SHANGSHI_DBG'):
        from PIL import Image as _I; _I.fromarray((np.clip(A[::-1, :, :3], 0, 1) * 255).astype(np.uint8)).save(os.environ['SHANGSHI_DBG'])
    simg.pixels.foreach_set(A.ravel()); simg.update(); simg.pack(); print('  wrinkles painted on', simg.name, (iw, ih))
    # ---- 頭髮：帽子底下的、額頭前面的直瀏海拿掉；剩下兩側和後面的短髮當底，外面加一圈蓬的捲髮 ----
    hair = m.get('hair') or next(o for o in bpy.data.objects if o.name.startswith('Hair'))
    bm = bmesh.new(); bm.from_mesh(hair.data); mw = hair.matrix_world; kill = []
    for fc in bm.faces:
        cen = np.mean([np.array(mw @ v.co) for v in fc.verts], axis=0) - c; az = math.atan2(cen[0], -cen[1]); el = math.atan2(cen[2], math.hypot(cen[0], cen[1]))
        if el > edge_el(az) - math.radians(3) or abs(az) < math.radians(62): kill.append(fc)
    bmesh.ops.delete(bm, geom=kill, context='FACES'); bm.to_mesh(hair.data); bm.free(); print('  hair faces removed (under cap, straight bangs)', len(kill))
    CV, CF, CU = [], [], []
    def curl(cp, r):
        n0 = len(CV); R_ = 5; S_ = 7
        for i in range(R_ + 1):
            th = math.pi * i / R_
            for j in range(S_): ph = 2 * math.pi * j / S_; CV.append(cp + r * np.array([math.sin(th) * math.cos(ph), math.sin(th) * math.sin(ph), math.cos(th) * 0.9])); CU.append((rng.random(), rng.random()))
        for i in range(R_):
            for j in range(S_): a = n0 + i * S_ + j; b = n0 + i * S_ + (j + 1) % S_; CF.append((a, b, b + S_, a + S_))
    for azd in range(66, 295, 7):
        az = math.radians(azd); side = abs(math.sin(az)); e0 = math.degrees(edge_el(az))
        for k in range(3):
            el = e0 - 4 - k * 8 + rng.uniform(-2.5, 2.5)
            if side > 0.86 and el < -12 and math.cos(az) > -0.45: continue                    # 耳朵露出來
            if el < -40: continue
            r = rng.uniform(0.014, 0.020) * (1.0 if k < 2 else 0.85); curl(scalp(az + math.radians(rng.uniform(-3, 3)), math.radians(el), r * 0.55 + 0.004), r)
    curls = make('Acc_Curls_SHANGSHI', CV, CF, CU, 6)
    # ---- 鴨舌帽（報童帽）：帽身扁、往前壓，蓋在短帽簷上；帽緣往裡收一圈（從下面看不是空的） ----
    ztop = c[2] + H.Rtop                                                                            # 頭頂
    def cap_fn(u, v):   # 第 3 版：帽身壓扁（只比頭頂高一點）、頂是平的往前斜、帽緣不外翻
        az = u * 2 * math.pi; e0 = edge_el(az); fr = max(0.0, math.cos(az))
        if v < 0.1: el = e0; off = 0.010 + 0.012 * (v / 0.1); t = 0.0                               # 帽緣往裡收一小圈
        else: t = (v - 0.1) / 0.9; el = e0 + (math.pi / 2 - e0) * t; off = 0.022 + 0.014 * math.sin(math.pi * min(1.0, t * 1.5)) * (0.6 + 0.4 * abs(math.sin(az)))   # 帽身比帽緣寬一點（兩側和後面鼓出來）
        p = scalp(az, el, off)
        p[1] -= 0.020 * fr * (0.3 + 0.7 * t)                                                        # 整個往前一點（蓋到帽簷根部）
        zmax = ztop + 0.016 + 0.20 * (p[1] - c[1])                                                  # 平頂：前低後高的一個斜面
        if p[2] > zmax: p[2] = zmax
        return p, (u * 4, v * 1.5)
    V, F, U = grid(44, 12, cap_fn, wrap=True); cap = make('Acc_Cap_SHANGSHI', V, F, U, 0)
    BV, BF, BU = [], [], []
    for layer, dz in ((0, 0.0), (1, -0.006)):
        def brim_fn(u, v, dz=dz):   # 帽簷：從帽緣往前伸出約 4 cm、微微往下，顏色比帽身深一階
            az = (u - 0.5) * math.radians(124); p0 = scalp(az, edge_el(az), 0.014); w_ = math.cos(az * 90 / 62); out = 0.060 * max(0.0, w_) ** 0.55
            p = p0 + np.array([math.sin(az), -math.cos(az), 0.0]) * out * v; p[2] += dz - 0.012 * v - 0.004; return p, (u * 3, v * 0.6)
        V, F, U = grid(18, 3, brim_fn); n0 = len(BV); BV += V; BU += U; BF += [tuple(i_ + n0 for i_ in f_) for f_ in F]
    brim = make('Acc_CapBrim_SHANGSHI', BV, BF, BU, 7)
    # ---- 鬍子：貼著上唇的八字鬍（中間厚、兩端往下）、嘴角兩條接到山羊鬍 ----
    def mus_fn(u, v):
        t = (u - 0.5) * 2; x = t * 0.033; zc = mouth_z + 0.0125 - 0.0075 * t * t; hh = 0.0072 * (1 - 0.3 * abs(t)); z = zc + hh * (1 - 2 * v)
        return face_pt(x, z, 0.0018 + 0.0042 * math.sin(math.pi * v) * (1 - 0.4 * t * t)), (u * 2, v)
    V, F, U = grid(14, 4, mus_fn); mus = make('Acc_Mustache_SHANGSHI', V, F, U, 1)
    def goat_fn(u, v):
        t = (u - 0.5) * 2; z = mouth_z - 0.010 - (mouth_z - 0.010 - (chin_z - 0.007)) * v; hw = 0.0185 * (1.0 - 0.28 * v); return face_pt(t * hw, z, 0.002 + 0.0045 * math.sin(math.pi * min(1.0, v * 1.15)) * (1 - 0.6 * t * t)), (u * 2, v)
    V, F, U = grid(8, 7, goat_fn); goat = make('Acc_Goatee_SHANGSHI', V, F, U, 1)
    LV, LF, LU = [], [], []
    for sg in (-1, 1):
        def link_fn(u, v, sg=sg):
            x = sg * (0.031 - 0.013 * v) + (u - 0.5) * 0.0075; z = mouth_z + 0.004 - 0.018 * v; return face_pt(x, z, 0.0018 + 0.002 * math.sin(math.pi * u)), (u, v)
        V, F, U = grid(2, 4, link_fn); n0 = len(LV); LV += V; LU += U; LF += [tuple(i + n0 for i in f_) for f_ in F]
    link = make('Acc_BeardLink_SHANGSHI', LV, LF, LU, 1)
    for ob in (cap, brim, mus, goat, link, curls): C.bind(ob, arm, {HB.HEAD: 1.0})
    # ---- 衣服：西裝翻領（外套前襟）、V 領裡露出來的米色襯衫和襯衫領 ----
    zn = lm['neck']; zu = lm['upper']; zc_ = lm['chest']; body_only = BVHTree.FromPolygons(HB.Head._world(m['body']).tolist(), [list(p_.vertices) for p_ in m['body'].data.polygons])
    def chest_pt(x, z, off): return np.array([x, H.front_y(x, z) - off, z])
    zt = zn - 0.035; zb = zc_ - 0.045; parts = []
    for sg in (-1, 1):
        def lapel_fn(u, v, sg=sg):   # u：內緣 → 外緣；v：上（領口）→ 下（第一顆扣子）；中間最寬、上面有缺角
            z = zt - (zt - zb) * v; wid = 0.012 + 0.062 * math.sin(math.pi * min(1.0, v * 1.1)) ** 0.7 * (1.0 if v > 0.22 else 0.55 + 2.0 * v); xin = 0.030 + 0.020 * (1 - v)
            return chest_pt(sg * (xin + wid * u), z, 0.009 + 0.004 * (1 - u)), (u, v * 2)
        V, F, U = grid(4, 10, lapel_fn); parts.append(make('Acc_Lapel%s_SHANGSHI' % ('L' if sg > 0 else 'R'), V, F, U, 4))
        def collar_fn(u, v, sg=sg):  # 襯衫領：一片小三角貼在脖子兩側往前
            x = sg * (0.012 + 0.030 * u); z = zn - 0.002 - 0.010 * u - (0.016 + 0.018 * (1 - u)) * v; return chest_pt(x, z, 0.013), (u, v)
        V, F, U = grid(3, 3, collar_fn); parts.append(make('Acc_ShirtCollar%s_SHANGSHI' % ('L' if sg > 0 else 'R'), V, F, U, 5))
    def vneck_fn(u, v):              # V 領裡的襯衫：倒三角
        z = zn - 0.008 - 0.105 * v; hw = 0.040 * (1 - v) + 0.002; return chest_pt((u - 0.5) * 2 * hw, z, 0.009), (u, v)
    V, F, U = grid(4, 6, vneck_fn); parts.append(make('Acc_ShirtV_SHANGSHI', V, F, U, 5))
    RV, RF, RU = [], [], []                                                                           # 第 3 版：毛衣的 V 領（襯衫的倒三角兩邊各一條墨綠羅紋）
    for sg in (-1, 1):
        def rib_fn(u, v, sg=sg):
            z = zn - 0.004 - 0.112 * v; hw = 0.043 * (1 - v) + 0.003; return chest_pt(sg * (hw + 0.011 * u), z, 0.0105), (u, v * 4)
        V, F, U = grid(2, 8, rib_fn); n0 = len(RV); RV += V; RU += U; RF += [tuple(i_ + n0 for i_ in f_) for f_ in F]
    parts.append(make('Acc_VneckRib_SHANGSHI', RV, RF, RU, 8))
    # ---- 圍巾：掛在脖子後面，兩邊各一條從鎖骨垂到腰下（前面不圍起來） ----
    def back_fn(u, v):               # 脖子後面那一段（方位角 100°～260°）
        az = math.radians(100 + 160 * u); d = np.array([math.sin(az), -math.cos(az), 0.0]); z = zn + 0.004 + 0.05 * v; o = Vector((0.0, c[1] * 0.3 + 0.012, z))
        o2 = Vector((0.0, o[1], zn + 0.035)); h_ = body_only.ray_cast(o2 + Vector(d) * 0.3, Vector(-d), 0.3)[0]; r = min(0.085, (float(np.dot(np.array(h_) - np.array(o2), d)) if h_ is not None else 0.06)) + 0.02 + 0.006 * math.sin(math.pi * v)
        return np.array(o) + d * r, (u * 3, v)
    V, F, U = grid(14, 3, back_fn); ring = make('Acc_ScarfBack_SHANGSHI', V, F, U, 2)
    z_end = lm['hip'] - 0.03; tails = []
    for sg in (-1, 1):
        def tail_fn(u, v, sg=sg):
            if v < 0.14: t = v / 0.14; z = zn + 0.045 - 0.05 * t; x = sg * (0.066 + 0.02 * t) + (u - 0.5) * 0.07 * (0.75 + 0.25 * t); y = H.front_y(x, min(z, zn + 0.01)) - 0.016 + 0.05 * (1 - t) ** 2   # 從脖子側面翻到胸前
            else: t = (v - 0.14) / 0.86; z = zn - 0.005 - (zn - 0.005 - z_end) * t; x = sg * (0.086 + 0.006 * t) + (u - 0.5) * 0.07; y = H.front_y(x, z) - 0.015 - 0.005 * math.sin(math.pi * u)
            return np.array([x, y, z]), (u, v * 6)
        V, F, U = grid(4, 30, tail_fn); tails.append(make('Acc_ScarfTail%s_SHANGSHI' % ('L' if sg > 0 else 'R'), V, F, U, 2))
        def fr_fn(u, v, sg=sg):
            z = z_end - 0.05 * v; x = sg * 0.092 + (u - 0.5) * 0.07; y = H.front_y(x, z_end) - 0.015; return np.array([x, y, z]), (u * 5, v)
        V, F, U = grid(8, 1, fr_fn); tails.append(make('Acc_ScarfFringe%s_SHANGSHI' % ('L' if sg > 0 else 'R'), V, F, U, 3))
    # ---- 第 3 版：預設表情＝瞇眼微笑（把 Joy 的眼型、Fun 的嘴型烘進基本形；其他表情鍵一起平移） ----
    kb = f.data.shape_keys.key_blocks if f.data.shape_keys else None
    if kb:
        n_ = len(kb[0].data); B0 = np.zeros(n_ * 3); kb[0].data.foreach_get('co', B0); delta = np.zeros(n_ * 3); used = []
        for frag, w_ in (('Fcl_EYE_Joy', 1.0), ('Fcl_MTH_Fun', 1.0), ('Fcl_BRW_Fun', 1.0)):   # 第 4 版：眼睛笑成彎的（Joy 0.55 → 1.0）、嘴角更上揚（0.7 → 1.0）、眉毛也用笑的形狀；外眼角從往下改成微微往上（EYE_TILT −0.055 → 0.035：LAWWW「眼睛下垂沒有笑意」）
            k_ = next((k for k in kb if k.name.endswith(frag)), None)
            if k_ is None: continue
            X = np.zeros(n_ * 3); k_.data.foreach_get('co', X); delta += w_ * (X - B0); used.append(k_.name)
        for k_ in kb:
            X = np.zeros(n_ * 3); k_.data.foreach_get('co', X); k_.data.foreach_set('co', X + delta)
        me.vertices.foreach_set('co', B0 + delta); me.update(); print('  smile baked into basis', used, 'max move %.4f' % float(np.abs(delta).max()))
    src = m.get('clothes') or m['body']
    for ob in [ring] + tails + parts:
        C.bind(ob, arm); C.transfer_weights(ob, src if ob is not ring else m['body'])
    print('  glasses depth: ring y %.4f, face surface at lens centre y %.4f, at bridge %.4f' % (float(eye[1]) - 0.068, H.front_y(0.042, ezb - 0.002), H.front_y(0.0, ezb - 0.002)))
    return dict(ex=exb, ez=ezb, eye_y=float(eye[1]))


def preview_glasses(info):
    """只給預覽算圖用（遊戲裡眼鏡是配件 prop.glasses_shangshi，位置同 props3d 的公式：兩眼中點前 6.8 cm、下 2 mm）"""
    import math
    gm = bpy.data.materials.new('preview_glasses'); gm.use_nodes = True; b = gm.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (0.42, 0.34, 0.2, 1); b.inputs['Metallic'].default_value = 0.6; b.inputs['Roughness'].default_value = 0.35
    y = info['eye_y'] - 0.068 - 0.017; z = info['ez'] - 0.002 - 0.005   # 這個人物的臉比較前面：眼鏡模型自己往前 1.7 cm、往下 0.5 cm（glasses_shangshi.py 的 OFFSET）
    for sg in (-1, 1):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.023, minor_radius=0.0011, major_segments=40, minor_segments=6, location=(sg * 0.042, y, z), rotation=(math.pi / 2, 0, 0)); bpy.context.object.data.materials.append(gm)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.0009, depth=0.1, vertices=6, location=(sg * 0.066, y + 0.05, z + 0.004), rotation=(math.pi / 2, 0, 0)); bpy.context.object.data.materials.append(gm)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.0009, depth=0.04, vertices=6, location=(0, y, z + 0.006), rotation=(0, math.pi / 2, 0)); bpy.context.object.data.materials.append(gm)
    for o in bpy.data.objects:   # 預覽的眼鏡不投影（第 2 版預覽：鏡腳的影子落在臉頰上，像刮痕）
        if o.data and getattr(o.data, 'materials', None) and gm.name in [mm.name for mm in o.data.materials if mm]: o.visible_shadow = False


def main():
    a = C.args(); out = a[0]
    opt = {a[i]: a[i + 1] for i in range(1, len(a) - 1) if a[i].startswith('--')}
    C.setup()
    m = C.import_vrm(os.path.join(C.SRC, LONG['base'] + '.vrm'))
    for s in ('stage0', 'face', 'clothes', 'hair'):
        print('[stage]', s); N.STAGES[s](m)
    print('[stage] accessories'); info = accessories(m)
    if m.get('wsrc_top') is not None: bpy.data.objects.remove(m['wsrc_top'], do_unlink=True); m['wsrc_top'] = None
    if '--blend' in opt:
        bpy.ops.file.pack_all(); bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(opt['--blend']), compress=True); print('saved blend', opt['--blend'])
    if out != '-': print('exported', C.export_vrm(os.path.abspath(out)))
    if '--render' in opt and '--glasses' in a: preview_glasses(info)
    if '--render' in opt:
        lm = C.landmarks(m['arm']); kw = {'views': tuple(opt['--views'].split(','))} if '--views' in opt else {}
        if '--res' in opt: kw['res'] = tuple(int(v) for v in opt['--res'].split('x'))
        print('renders', C.render_views(opt['--render'], head_z=lm['head'] + 0.08, height=lm['head'] + 0.20, **kw))


if __name__ == '__main__':
    main()
