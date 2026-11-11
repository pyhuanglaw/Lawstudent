"""禮貌生財上師（X332；使用者 11-10 23:4x 的人物圖 docs/handoff/user_specs/limao_ref/shangshi_character.png；LAWWW2 帳號 A 2026-11-11）。
六十多歲、灰白捲髮、圓框細金屬眼鏡、灰白山羊鬍、咖啡色鴨舌帽、深咖啡燈芯絨西裝外套、墨綠 V 領毛衣＋米色襯衫、棕藍格紋長圍巾、灰褐毛料長褲；成人比例（不 Q 版）。
做法：路人生產線 npc.py（同何俊朗 long_ho.py）換成他的參數；帽子、眼鏡、鬍子、圍巾是配件（shangshi_props.py → GLB，props3d 掛在頭、胸）。角色美術 LAWWW 驗（D100a）。
用法：/opt/blenv/bin/python tools/blender/char_second/limao_shangshi.py -- <輸出.vrm 或 -> [--render 前綴] [--views ...]
之後：VRM_BASE=Sakurada_Fumiriya VRM_MALE=1 python3 tools/blender/char_second/vrm_finish2.py <輸出.vrm> assets/models/char/second_ai/bl_limao_shangshi.vrm 禮貌生財上師 #2a2018"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
os.environ['NPC'] = 'nm10'             # npc.py 在 import 時要一個已有的名字；下面整個換成何俊朗的參數
sys.path.insert(0, HERE)
import npc as N                        # noqa: E402
C = N.C
import bpy                             # noqa: E402

rgb = N.rgb
LONG = dict(sex='m', base='Sakurada_Fumiriya', head=0.97, height=1.69, iris='#2a2018', skin=(0.88, 0.76, 0.64), eye_close=0.26, torso=1.10, stoop=0.014, neck=1.06, belly=0.014,
            # 六十多歲：眼睛細長帶笑（扁、眼尾微微往下）、眉毛灰白稀一點、臉比年輕人寬一點、下巴圓
            face=dict(EYE_SX=1.0, EYE_SZ=0.56, EYE_TILT=-0.03, MOUTH_DOWN=-0.0006, BROW_ARCH=0.42, BROW_K=1.3, BROW_SCALE_Z=1.2, BROW_COL=(0.52, 0.50, 0.48), FACE_NARROW=0.99, CHIN_WIDEN=0.66, JAW_OUT=0.0046, MOUTH_K=1.5),
            # 灰白捲髮：帽子下面兩側和後面蓬出來一圈（頭頂被鴨舌帽蓋住）
            hair=dict(seed=20261111, part=10.0, col=(0.62, 0.61, 0.60), tip=(0.030, 0.030, 0.026, 0.004, -0.006, -0.012, -0.016, -0.030, -0.028, -0.024), nape=0.03, nape_c=0.0, vol=0.62, curl=(18, 34)),
            # 深咖啡燈芯絨西裝外套（敞開）＋墨綠 V 領毛衣＋灰褐毛料長褲＋深咖啡皮鞋
            layered=dict(style=N.outer_style(rgb(64, 44, 32), rgb(104, 94, 82), rgb(58, 40, 28), rgb(40, 28, 20), tex='knit', sleeve_k=0.80, ease=0.92, pants_ell=(0.074, 0.084), shoe_style='loafer'),
                         outer=dict(open=18, buttons=2), inner=dict(rgb=rgb(66, 70, 48))))
N.VAR = LONG; N.NAME = 'shangshi'; N.TAG = 'SHANGSHI'
N.JP_STYLE['shangshi'] = dict(bang='card')   # 原本的一撮一撮短髮（側分）


# ---------- 配件（做進人物模型裡，跟著頭、脖子、身體動）：鴨舌帽、山羊鬍＋八字鬍、棕藍格紋長圍巾 ----------
def accessories(m):
    import numpy as np, math
    from mathutils import Vector
    import h01_hair as HB
    arm = m['arm']; H = HB.Head(m); c = H.c; lm = C.landmarks(arm)
    # 一張小貼圖分四格（x 方向）：0 帽子（咖啡色人字呢）、1 鬍子（灰白）、2 圍巾（棕藍格紋）、3 圍巾的流蘇
    W = 256; rng = np.random.default_rng(1111); img = np.ones((64, W, 4))
    def fill(i, base, noise=0.05): img[:, i * 64:(i + 1) * 64, :3] = np.clip(np.array(base)[None, None, :] + rng.normal(0, noise, (64, 64, 1)), 0, 1)
    fill(0, (0.36, 0.26, 0.18), 0.045); fill(1, (0.78, 0.77, 0.75), 0.05); fill(2, (0.42, 0.33, 0.26), 0.02); fill(3, (0.36, 0.30, 0.26), 0.05)
    for k in range(0, 64, 4): img[k:k + 1, 0:64, :3] *= 0.86                                  # 帽子的織紋
    for k, col in ((6, (0.20, 0.25, 0.36)), (14, (0.62, 0.50, 0.36)), (22, (0.20, 0.25, 0.36)), (38, (0.58, 0.36, 0.26)), (46, (0.20, 0.25, 0.36)), (54, (0.66, 0.56, 0.42))):   # 圍巾：棕底＋藍、米、磚紅的格子
        img[:, 128 + k:128 + k + 3, :3] = col; img[k:k + 3, 128:192, :3] = np.array(col) * 0.9 + 0.1 * img[k:k + 3, 128:192, :3]
    wip = os.path.join(C.ROOT, 'tools', 'vroid_wip', 'bl'); os.makedirs(wip, exist_ok=True)
    im = C.image_from_array('SHANGSHI_Acc', img, os.path.join(wip, 'shangshi_acc.png'))
    tmpl = next(mt.name for mt in bpy.data.materials if 'HairCard' in mt.name and getattr(mt, 'vrm_addon_extension', None))
    mat = C.mtoon_from(tmpl, 'SHANGSHI_Acc_CLOTH', base_img=im, alpha='OPAQUE', double_sided=True, outline=0.0)
    col = arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection
    def make(name, V, F, U, reg):
        me = bpy.data.meshes.new(name); me.from_pydata([tuple(v) for v in V], [], F); uv = me.uv_layers.new(name='UVMap')
        for poly in me.polygons:
            for li, vi in zip(poly.loop_indices, poly.vertices): u, v = U[vi]; uv.data[li].uv = ((reg + 0.08 + 0.84 * (u % 1.0)) / 4.0, 0.04 + 0.92 * (v % 1.0))
        me.polygons.foreach_set('use_smooth', [True] * len(me.polygons)); me.materials.append(mat)
        ob = bpy.data.objects.new(name, me); col.objects.link(ob); return ob
    def grid(nu, nv, fn, wrap=False):
        V, U, F = [], [], []
        for j in range(nv + 1):
            for i in range(nu + (0 if wrap else 1)): p, uvv = fn(i / nu, j / nv); V.append(p); U.append(uvv)
        w = nu if wrap else nu + 1
        for j in range(nv):
            for i in range(nu if wrap else nu):
                a = j * w + i; b = j * w + (i + 1) % w if wrap else a + 1; F.append((a, b, b + w, a + w))
        return V, F, U
    # ---- 鴨舌帽：照頭皮往外 3.6 cm 的殼（蓋住頭頂的頭髮），前面壓低、頂扁；前緣一片硬帽舌 ----
    def scalp(az, el, off):
        d = np.array([math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)]); return c + d * (H.R(d) + off)
    def edge_el(az):   # 帽緣的仰角：前面（眉毛上面）高、兩側在耳朵上面、後面低
        f = (math.cos(az) + 1) / 2; return math.radians(-12 + 36 * f ** 1.3)
    # 帽子底下的頭髮拿掉（頭頂、前額：第一版頭髮從帽子穿出來）；帽緣以下的（兩側、後面）留著
    import bmesh
    hair = m.get('hair') or next(o for o in bpy.data.objects if o.name.startswith('Hair'))
    bm = bmesh.new(); bm.from_mesh(hair.data); mw = hair.matrix_world; kill = []
    for f in bm.faces:
        ok = True
        for v in f.verts:
            p = np.array(mw @ v.co) - c; az = math.atan2(p[0], -p[1]); el = math.atan2(p[2], math.hypot(p[0], p[1]))
            if el < edge_el(az) + math.radians(2): ok = False; break
        if ok: kill.append(f)
    bmesh.ops.delete(bm, geom=kill, context='FACES'); bm.to_mesh(hair.data); bm.free(); print('  hair faces under cap removed', len(kill))
    def cap_fn(u, v):
        az = u * 2 * math.pi; e0 = edge_el(az); el = e0 + (math.pi / 2 - e0) * v; p = scalp(az, el, 0.040 - 0.006 * v)
        p[2] = c[2] + (p[2] - c[2]) * (1.0 - 0.05 * v); f = max(0.0, math.cos(az)); p[1] -= 0.022 * f * (1 - v) ** 0.6 + 0.012 * f * v   # 頂扁一點、前面往前推（鴨舌帽的帽身蓋到帽舌上）
        return p, (u * 3, v)
    V, F, U = grid(40, 9, cap_fn, wrap=True); cap = make('Acc_Cap_SHANGSHI', V, F, U, 0)
    def brim_fn(u, v):
        az = (u - 0.5) * math.radians(112); p0 = scalp(az, edge_el(az), 0.038); out = 0.062 * math.cos(az * 1.6) ** 0.7 if abs(az * 1.6) < math.pi / 2 else 0.0
        p = p0 + np.array([math.sin(az), -math.cos(az), 0.0]) * out * v; p[2] -= 0.012 * v + 0.004; return p, (u * 2, v * 0.5)
    V, F, U = grid(14, 3, brim_fn); brim = make('Acc_CapBrim_SHANGSHI', V, F, U, 0)
    # ---- 鬍子：臉的表面往外 3 mm 的薄片；嘴的位置＝鼻尖和下巴之間（沿臉的中線打射線量）----
    zs = np.linspace(H.brow_z - 0.02, H.brow_z - 0.17, 90); ys = np.array([H.front_y(0.0, z) for z in zs])
    k_n = int(np.argmin(ys[:45])); nose_z = float(zs[k_n]); jump = [i for i in range(k_n + 1, len(ys)) if ys[i] - ys[i - 1] > 0.02]; chin_z = float(zs[jump[0] - 1]) if jump else float(zs[-1])   # 下巴＝臉的中線往下、表面突然退到脖子的地方（第一版把脖子也算成臉：鬍子貼到脖子上）
    mouth_z = nose_z - 0.58 * (nose_z - chin_z); print('  face nose/mouth/chin', round(nose_z, 4), round(mouth_z, 4), round(chin_z, 4))
    def face_pt(x, z, off): return np.array([x, H.front_y(x, z) - off, z])
    def mus_fn(u, v):   # 八字鬍：上唇上面一條、兩端往下垂
        x = (u - 0.5) * 0.064; t = abs(u - 0.5) * 2; z = mouth_z + 0.022 - 0.013 * v - 0.007 * t ** 2; return face_pt(x, z, 0.004 + 0.003 * math.sin(math.pi * v)), (u * 2, v)
    V, F, U = grid(12, 3, mus_fn); mus = make('Acc_Mustache_SHANGSHI', V, F, U, 1)
    def goat_fn(u, v):  # 山羊鬍：下唇下面到下巴尖、往下收窄，包到下巴底下一點
        t = (u - 0.5) * 2; z = mouth_z - 0.009 - (mouth_z - 0.009 - (chin_z - 0.006)) * v; hw = 0.017 * (1.0 - 0.3 * v); return face_pt(t * hw, z, 0.0035 + 0.004 * math.sin(math.pi * v) * (1 - t * t)), (u * 2, v)
    V, F, U = grid(8, 6, goat_fn); goat = make('Acc_Goatee_SHANGSHI', V, F, U, 1)
    for ob in (cap, brim, mus, goat): C.bind(ob, arm, {HB.HEAD: 1.0})
    # ---- 圍巾：脖子一圈＋兩條從領口垂到腰下的長帶（照身體和衣服的表面往外 1.4 cm）、下緣流蘇 ----
    zn = lm['neck'] + 0.012
    from mathutils.bvhtree import BVHTree
    _B = HB.Head._world(m['body']); neck_bvh = BVHTree.FromPolygons(_B.tolist(), [list(p.vertices) for p in m['body'].data.polygons])   # 只量身體（不含外套的領子：第一版圍巾繞到肩膀外面）
    def ring_fn(u, v):
        az = u * 2 * math.pi; d = np.array([math.sin(az), -math.cos(az), 0.0]); z = zn - 0.03 + 0.07 * v; o = Vector((0.0, c[1] * 0.3 + 0.01, z))
        o2 = Vector((0.0, o[1], lm['neck'] + 0.035)); h = neck_bvh.ray_cast(o2 + Vector(d) * 0.3, Vector(-d), 0.3)[0]; r = min(0.085, (float(np.dot(np.array(h) - np.array(o2), d)) if h is not None else 0.06)) + 0.018 + 0.008 * math.sin(math.pi * v)
        return np.array(o) + d * r, (u * 4, v)
    V, F, U = grid(28, 3, ring_fn, wrap=True); ring = make('Acc_ScarfRing_SHANGSHI', V, F, U, 2)
    z_end = lm['hip'] - 0.02; tails = []
    for sgn in (-1, 1):
        def tail_fn(u, v, sgn=sgn):
            z = zn + 0.01 - (zn + 0.01 - z_end) * v; x = sgn * (0.045 + 0.02 * min(1.0, v * 3)) + (u - 0.5) * 0.078; y = H.front_y(x, z) - 0.014 - 0.006 * math.sin(math.pi * u); return np.array([x, y, z]), (u, v * 6)
        V, F, U = grid(4, 26, tail_fn); tails.append(make('Acc_ScarfTail%s_SHANGSHI' % ('L' if sgn > 0 else 'R'), V, F, U, 2))
        def fr_fn(u, v, sgn=sgn):
            z = z_end - 0.055 * v; x = sgn * (0.064) + (u - 0.5) * 0.078; y = H.front_y(x, z_end) - 0.014; return np.array([x, y, z]), (u * 5, v)
        V, F, U = grid(8, 1, fr_fn); tails.append(make('Acc_ScarfFringe%s_SHANGSHI' % ('L' if sgn > 0 else 'R'), V, F, U, 3))
    src = m.get('clothes') or m['body']
    for ob in [ring] + tails:
        C.bind(ob, arm); C.transfer_weights(ob, src if ob is not ring else m['body'])
    return [cap, brim, mus, goat, ring] + tails


def main():
    a = C.args(); out = a[0]
    opt = {a[i]: a[i + 1] for i in range(1, len(a) - 1) if a[i].startswith('--')}
    C.setup()
    m = C.import_vrm(os.path.join(C.SRC, LONG['base'] + '.vrm'))
    for s in ('stage0', 'face', 'clothes', 'hair'):
        print('[stage]', s); N.STAGES[s](m)
    print('[stage] accessories'); accessories(m)
    if m.get('wsrc_top') is not None: bpy.data.objects.remove(m['wsrc_top'], do_unlink=True); m['wsrc_top'] = None
    if '--blend' in opt:
        bpy.ops.file.pack_all(); bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(opt['--blend']), compress=True); print('saved blend', opt['--blend'])
    if '--render' in opt:
        lm = C.landmarks(m['arm']); kw = {'views': tuple(opt['--views'].split(','))} if '--views' in opt else {}
        print('renders', C.render_views(opt['--render'], head_z=lm['head'] + 0.08, height=lm['head'] + 0.20, **kw))
    if out != '-': print('exported', C.export_vrm(os.path.abspath(out)))


if __name__ == '__main__':
    main()
