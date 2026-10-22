"""Alison（李語晴，yu）的側背包＋三個社團吊飾 → bag_yu.glb（LAWWW2-C 2026-10-18；角色美術 D59，參考圖 art_reference/yu.webp）。
參考圖：
  - 右肩側背；包身在右邊腰臀的前側；背帶從胸前繞過右肩到背後。
  - 包：霧黑尼龍、軟的（上緣微塌、底部鼓）、前面一個有蓋的口袋、上緣一條拉鍊；背帶黑色織帶、槍灰金屬環。
  - 吊飾：前面背帶環上一個槍灰色登山扣，三條編繩（酒紅、深藍、綠）各掛一個——
    金色天秤（系學會）、銀色麥克風＋紅色緞帶蝴蝶結（辯論社）、原木色吉他（吉他社）。
  - 沒有牌子（D77）。
用法：
  1. 量身體（右肩、右腰臀）→ tools/blender/char_second/prop_yu_fit.json：
     /opt/blenv/bin/python tools/blender/char_second/prop_yu.py -- --fit <Alison.vrm>
  2. 照 fit.json 做 GLB：
     /opt/blenv/bin/python tools/blender/char_second/prop_yu.py [-- --outdir assets/models/char/second_ai]
座標＝VRM 的 upperChest 骨頭（three-vrm 的 raw bone，VRM 0.x 檔案空間）：x＝人物右邊、y 上、z＝人物後面（前方 −z；和 props3d.js 的 HELMET_HANG 同一套）。
props3d：掛在 upperChest、位置 (0,0,0)；坐下時藏起來（同後背包）。"""
import json, math, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
FIT = os.path.join(HERE, 'prop_yu_fit.json')

# 包的尺寸（公尺）、方向
BAG = dict(W=0.28, H=0.235, D=0.095, y_world=0.845, x=0.160, z=-0.090, theta=-40.0, gap=0.022)   # gap：包的背面離 T 恤、裙子（外套的布壓在中間，約 1.5–2 cm）
STRAP_X = 0.112           # 背帶過肩的位置（離身體中線）
STRAP_W, STRAP_T = 0.034, 0.004


# ---------------------------------------------------------------- 1. 量身體
def fit(vrm):
    """匯入 VRM（T 字姿勢），把衣服、身體的頂點換到 upperChest 的座標；
    算出：①包的位置（從預設往包的正面推，直到包的背面離衣服 gap 公尺）②背帶的路徑（右肩那一片的外輪廓凸包往外 1.2 cm）"""
    lib = os.environ.get('CHAR_LIB') or os.path.join(HERE, '..', 'char')
    sys.path.insert(0, HERE); sys.path.insert(1, lib)
    import common as C
    import bpy
    C.setup(); m = C.import_vrm(os.path.abspath(vrm)); arm = m['arm']
    from mathutils import Matrix
    for sd, ang in (('R', -68.0), ('L', 68.0)):        # 第二版：手放下來量（遊戲裡的待機姿勢）——T 字姿勢的肩膀比較高，第一版背帶在遊戲裡浮在肩膀上 3–5 cm
        pb = arm.pose.bones['J_Bip_%s_UpperArm' % sd]; h = arm.data.bones['J_Bip_%s_UpperArm' % sd].head_local
        pb.matrix = Matrix.Translation(h) @ Matrix.Rotation(math.radians(ang), 4, 'Y') @ Matrix.Translation(-h) @ pb.matrix
    bpy.context.view_layer.update()
    uc = np.array(arm.matrix_world @ arm.data.bones['J_Bip_C_UpperChest'].head_local)
    dg = bpy.context.evaluated_depsgraph_get(); pts = []; jk = []
    for o in bpy.data.objects:
        if o.type != 'MESH' or o.name.lower().startswith('hair'): continue
        e = o.evaluated_get(dg); me = e.to_mesh(); mw = np.array(o.matrix_world)
        P = np.array([v.co for v in me.vertices]); e.to_mesh_clear()
        if len(P): pts.append(P @ mw[:3, :3].T + mw[:3, 3]); jk.append(np.full(len(P), 'jacket' in o.name.lower()))
    P = np.vstack(pts); jk = np.concatenate(jk)
    print('  meshes', [o.name for o in bpy.data.objects if o.type == 'MESH'], 'jacket verts', int(jk.sum()))
    L = np.column_stack([-(P[:, 0] - uc[0]), P[:, 2] - uc[2], P[:, 1] - uc[1]])     # Blender（人物面向 −Y、+X＝人物左邊）→ upperChest 底下
    th = math.radians(BAG['theta'])
    t = np.array([math.cos(th), 0.0, -math.sin(th)]); n = np.array([-math.sin(th), 0.0, -math.cos(th)])   # 包的寬度方向、正面法線
    c = np.array([BAG['x'], BAG['y_world'] - uc[2], BAG['z']])
    band = (np.abs(L[:, 1] - c[1]) < BAG['H'] / 2 + 0.01) & ~jk      # 包的位置只量身體（含放下來的手臂）、T 恤、裙子（外套前襟會往前翹，第一次量出來包離身體 8 cm）
    for _ in range(3):
        u = (L[band] - c) @ t; w = (L[band] - c) @ n
        foot = np.abs(u) < BAG['W'] / 2 + 0.01
        need = (w[foot].max() if foot.any() else -1.0) + BAG['D'] / 2 + BAG['gap']
        if need <= 0: break
        c = c + n * need
    ends = [c - t * BAG['W'] * 0.44 + np.array([0, BAG['H'] / 2 - 0.012, 0]), c + t * BAG['W'] * 0.44 + np.array([0, BAG['H'] / 2 - 0.012, 0])]
    # 背帶：前面的背帶頭 → 胸前 → 肩膀上面 → 肩胛骨 → 腋下（身體側面）→ 外側的背帶頭；控制點量衣服表面再往外 1.2 cm，最後整條推出點雲
    T = L                                                             # 手臂放下來了：背帶從手臂後面繞過去（不穿過手臂）
    def near(x, y, z=None, r=0.013):
        if z is not None: k = (np.abs(T[:, 0] - x) < r) & (np.abs(T[:, 2] - z) < 0.016)
        else: k = (np.abs(T[:, 0] - x) < r) & (np.abs(T[:, 1] - y) < r)
        return T[k]
    cl = 0.009
    f1 = near(0.10, -0.10); f2 = near(STRAP_X, 0.05); k2 = near(STRAP_X + 0.01, 0.03)
    zt = 0.5 * (f2[:, 2].min() + k2[:, 2].max()); top = near(STRAP_X, None, zt)
    ab = L[(np.abs(L[:, 1] + 0.12) < 0.015) & (L[:, 0] > 0.17)]                # 手臂在 y −0.12 的那一圈：背帶從它後面過
    ax = float(np.median(ab[:, 0])) if len(ab) else 0.20; az_ = float(ab[:, 2].max()) if len(ab) else 0.06
    ctrl = [ends[0], [0.10, -0.10, f1[:, 2].min() - cl], [STRAP_X, 0.05, f2[:, 2].min() - cl], [STRAP_X, top[:, 1].max() + 0.005, zt],
            [STRAP_X + 0.01, 0.03, k2[:, 2].max() + cl], [ax, -0.12, az_ + cl], ends[1]]
    print('  arm ring at y-0.12: x %.3f back z %.3f (%d pts)' % (ax, az_, len(ab)))
    import h01_hair as HB
    path = HB.catmull(np.array(ctrl, float), 10)
    path, _ = HB.resample(path, 60)
    from mathutils.kdtree import KDTree
    tree = KDTree(len(T))
    for i, q in enumerate(T): tree.insert(q, i)
    tree.balance()
    for it in range(6):                                                   # 推出點雲：每一點找 6 cm 內的點，沿「離鄰點重心」的方向推到離最近的點 cl
        for i in range(2, len(path) - 2):
            p = path[i]; idx = [j for (_, j, _) in tree.find_range(p, 0.06)]
            if len(idx) < 8: continue
            Q = T[idx]; nrm = p - Q.mean(0); nrm /= max(np.linalg.norm(nrm), 1e-6)
            pen = float(((Q - p) @ nrm).max()) + cl
            if pen > 0: path[i] = p + nrm * pen
        path[1:-1] = path[1:-1] * 0.6 + (path[:-2] + path[2:]) * 0.2
    out = dict(upper_chest_world=uc.round(4).tolist(), bag_center=c.round(4).tolist(), theta=BAG['theta'], bag=BAG,
               ends=[e.round(4).tolist() for e in ends], strap=path.round(4).tolist(),
               note='upperChest 底下（x＝人物右邊、y 上、z＝後面）；strap＝背帶中線（前面的背帶頭 → 胸前 → 肩上 → 背後 → 腋下 → 外側的背帶頭），離衣服表面 1.2 cm')
    with open(FIT, 'w', encoding='utf-8') as f: json.dump(out, f, ensure_ascii=False, indent=1)
    print('fit', json.dumps({k_: out[k_] for k_ in ('upper_chest_world', 'bag_center', 'ends')}), 'strap pts', len(path))


# ---------------------------------------------------------------- 2. 做模型
def build(outdir):
    sys.path.insert(0, os.path.join(HERE, '..', 'env_second'))
    import lib2 as L
    from lib2 import B, Mesh, CMesh, g2b, bpy
    import bmesh
    from mathutils import Vector, Matrix
    F = json.load(open(FIT, encoding='utf-8'))
    c = np.array(F['bag_center']); th = math.radians(F['theta']); W, H, D = F['bag']['W'], F['bag']['H'], F['bag']['D']
    B.reset(texres=256)
    M = {'nylon': L.flat('yubag_nylon', '#1f2023', rough=0.75), 'trim': L.flat('yubag_trim', '#2c2d31', rough=0.6),
         'metal': L.flat('yubag_metal', '#8d8e92', rough=0.35, metal=0.45), 'charm': L.vc_material('yubag_charm', rough=0.45)}
    root = B.group('bag_yu', props={'kind': 'prop_shoulderbag', 'owner': 'yu', 'bone': 'upperChest'})
    Rb = Matrix.Translation(g2b(*c)) @ Matrix.Rotation(th, 4, 'Z')        # 包的座標（遊戲 x 寬、y 高、z 厚；正面 −z）→ upperChest；繞遊戲 y＝Blender z

    HW = ([0.0, 0.12, 0.35, 0.70, 1.0], [0.80, 0.96, 1.0, 0.90, 0.74])     # 半寬（相對 W/2）照高度：底部圓、中間最寬、上緣收（軟的側背包，參考圖）
    def shape(u, s):
        """包空間（遊戲座標、正面 −z）：u −1..1、s 0（底）..1（上緣）→ (x, y, 鼓度)"""
        hw = W / 2 * float(np.interp(s, *HW))
        yb = -H / 2 + 0.035 * u * u; yt = H / 2 - 0.022 * (1 - u * u)          # 底部 U 字、上緣中間塌
        y = yb + (yt - yb) * s
        puff = max(0.15, (1 - 0.75 * u * u) ** 0.6 * (0.55 + 0.45 * math.sin(math.pi * min(1.0, s * 1.1))) * (1.12 - 0.25 * s))
        return u * hw, y, puff
    def soft_bag():
        """軟的尼龍包：細分的方塊照 shape() 變形；布面幾道淺皺褶（第二版：第一版是直角方塊改的，側面看像紙盒）"""
        bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=13, use_grid_fill=True)
        for v in bm.verts:
            u, s_, fb = 2 * v.co.x, v.co.z + 0.5, 2 * v.co.y        # fb：+1＝正面（Blender +y＝遊戲 −z）
            x, y, puff = shape(u, s_)
            cr = 0.003 * math.sin(u * 5.0 + s_ * 3.3) + 0.0025 * math.sin(s_ * 9.5 - u * 2.2)
            v.co = Vector((x, fb * (D / 2 * puff + (cr if abs(fb) > 0.9 else 0.0)), y))
        return bm
    bm = soft_bag(); body = Mesh('yubag_body', M['nylon']); body.add_bm(bm, Rb); bm.free(); body.finish(root, uv=False, smooth=True)

    def on_front(u, s, dz=0.0):
        x, y, puff = shape(u, s); return (x, y, -(D / 2) * puff - dz)
    tr = Mesh('yubag_trim', M['trim'])
    # 前面的口袋蓋：下緣中間往下垂的一片（離包面 5 mm）＋下緣一條滾邊；上緣的拉鍊
    us = np.linspace(-0.80, 0.80, 13)
    def s_low(u): return 0.40 - 0.07 * (1 - u * u)
    for j in range(len(us) - 1):
        for i in range(5):
            sa = [s_low(us[j]) + (0.74 - s_low(us[j])) * i / 5, s_low(us[j]) + (0.74 - s_low(us[j])) * (i + 1) / 5]
            sb = [s_low(us[j + 1]) + (0.74 - s_low(us[j + 1])) * i / 5, s_low(us[j + 1]) + (0.74 - s_low(us[j + 1])) * (i + 1) / 5]
            tr.quad([on_front(us[j], sa[0], 0.005), on_front(us[j + 1], sb[0], 0.005), on_front(us[j + 1], sb[1], 0.005), on_front(us[j], sa[1], 0.005)])
    pip = [on_front(u, s_low(u), 0.006) for u in us]
    for a_, b_ in zip(pip[:-1], pip[1:]): tr.cyl(a_, b_, 0.0022, seg=5)
    top = [on_front(u, 0.985, -0.5 * D * shape(u, 0.985)[2]) for u in np.linspace(-0.92, 0.92, 13)]   # 上緣的拉鍊：包厚度的中間
    for a_, b_ in zip(top[:-1], top[1:]): tr.cyl((a_[0], a_[1] + 0.003, a_[2]), (b_[0], b_[1] + 0.003, b_[2]), 0.0035, seg=6)
    tr_ob = tr.finish(root, uv=False, smooth=True)
    if tr_ob: tr_ob.matrix_world = Rb @ tr_ob.matrix_world

    # 背帶：照 fit 的路徑（z, y），x 從背帶頭漸漸到 STRAP_X；黑色織帶（寬 3.4 cm、厚 4 mm）
    ends = [np.array(e) for e in F['ends']]
    P = np.array(F['strap'])
    st = Mesh('yubag_strap', M['nylon']); vs_l, vs_r = [], []
    for i in range(len(P)):
        tg = P[min(i + 1, len(P) - 1)] - P[max(i - 1, 0)]; tg /= np.linalg.norm(tg)
        sd = np.cross(tg, [0.0, 0.0, 1.0]) if abs(tg[2]) < 0.9 else np.array([1.0, 0, 0])
        sd = np.array([1.0, 0.0, 0.0]) - tg * tg[0]; sd /= np.linalg.norm(sd)       # 織帶的寬度方向：大致沿 x（橫跨肩膀）
        nr = np.cross(sd, tg)
        for s_, lst in ((-1, vs_l), (1, vs_r)):
            lst.append([P[i] + sd * s_ * STRAP_W / 2 + nr * STRAP_T / 2, P[i] + sd * s_ * STRAP_W / 2 - nr * STRAP_T / 2])
    for i in range(len(P) - 1):
        a0, a1, b0, b1 = vs_l[i][0], vs_l[i + 1][0], vs_r[i][0], vs_r[i + 1][0]
        st.quad([a0, b0, b1, a1])
        a0, a1, b0, b1 = vs_l[i][1], vs_l[i + 1][1], vs_r[i][1], vs_r[i + 1][1]
        st.quad([a0, a1, b1, b0])
        st.quad([vs_l[i][0], vs_l[i + 1][0], vs_l[i + 1][1], vs_l[i][1]]); st.quad([vs_r[i][0], vs_r[i][1], vs_r[i + 1][1], vs_r[i + 1][0]])
    st.finish(root, uv=False, smooth=True)

    # 金屬環（背帶頭）＋前面的登山扣、三條編繩、三個吊飾（頂點色）
    mt = Mesh('yubag_metal', M['metal'])
    for e in ends:
        for k in range(10):
            a1, a2 = 2 * math.pi * k / 10, 2 * math.pi * (k + 1) / 10
            mt.cyl((e[0] + 0.012 * math.cos(a1), e[1] + 0.010 + 0.010 * math.sin(a1), e[2]), (e[0] + 0.012 * math.cos(a2), e[1] + 0.010 + 0.010 * math.sin(a2), e[2]), 0.0018, seg=5)
    hook = ends[0] + np.array([0.0, -0.004, -0.010])                     # 前面背帶頭的登山扣（槍灰、長 3 cm）
    pts = [hook + np.array([0.008 * math.sin(a), -0.016 + 0.016 * math.cos(a), 0.0]) for a in np.linspace(0, 2 * math.pi, 13)]
    for a_, b_ in zip(pts[:-1], pts[1:]): mt.cyl(tuple(a_), tuple(b_), 0.0016, seg=5)
    mt.finish(root, uv=False, smooth=True)

    ch = CMesh('yubag_charm', M['charm'])
    base = hook + np.array([0.0, -0.032, -0.004])
    def cord(top, length, col):
        n_ = 7
        for i in range(n_):
            y0 = top[1] - length * i / n_; y1 = top[1] - length * (i + 0.75) / n_
            ch.cbox(top[0] - 0.0018, top[0] + 0.0018, y1, y0, top[2] - 0.0018, top[2] + 0.0018, col)      # 編繩：一節一節（參考圖的平結）
        return top - np.array([0.0, length, 0.0])
    def gold_ring(p, col='#c79a4a'):
        ch.cbox(p[0] - 0.003, p[0] + 0.003, p[1] - 0.004, p[1], p[2] - 0.0012, p[2] + 0.0012, col)
    # 天秤（金色）：酒紅編繩
    p = cord(base + np.array([-0.012, 0, 0]), 0.026, '#7a2a33'); gold_ring(p); p = p - np.array([0, 0.004, 0])
    g, gl, gd = '#c9a24e', '#e8c97a', '#94712f'
    ch.cbox(p[0] - 0.0012, p[0] + 0.0012, p[1] - 0.028, p[1], p[2] - 0.0012, p[2] + 0.0012, g)            # 中柱
    ch.cbox(p[0] - 0.016, p[0] + 0.016, p[1] - 0.006, p[1] - 0.0035, p[2] - 0.001, p[2] + 0.001, gl)        # 橫桿
    for sx in (-1, 1):
        q = p + np.array([sx * 0.0145, -0.006, 0.0])
        ch.cbox(q[0] - 0.0005, q[0] + 0.0005, q[1] - 0.010, q[1], q[2] - 0.0005, q[2] + 0.0005, gd)           # 吊鍊
        ch.cbox(q[0] - 0.0065, q[0] + 0.0065, q[1] - 0.0125, q[1] - 0.010, q[2] - 0.004, q[2] + 0.004, g)       # 秤盤
    ch.cbox(p[0] - 0.008, p[0] + 0.008, p[1] - 0.031, p[1] - 0.028, p[2] - 0.003, p[2] + 0.003, gd)            # 底座
    # 麥克風（銀色＋紅色蝴蝶結）：深藍編繩
    p = cord(base, 0.032, '#2d3a66'); gold_ring(p); p = p - np.array([0, 0.004, 0])
    ch.crbox(p[0] - 0.0055, p[0] + 0.0055, p[1] - 0.011, p[1], p[2] - 0.0055, p[2] + 0.0055, '#b8bcc2', r=0.004)   # 網罩
    ch.cbox(p[0] - 0.0035, p[0] + 0.0035, p[1] - 0.034, p[1] - 0.011, p[2] - 0.0035, p[2] + 0.0035, '#9a9ea5')       # 握把
    ch.cbox(p[0] - 0.0075, p[0] + 0.0075, p[1] - 0.019, p[1] - 0.015, p[2] - 0.0045, p[2] - 0.0035, '#a8323a')       # 蝴蝶結
    ch.cbox(p[0] - 0.002, p[0] + 0.002, p[1] - 0.025, p[1] - 0.015, p[2] - 0.0046, p[2] - 0.0036, '#a8323a')
    # 吉他（原木色）：綠色編繩
    p = cord(base + np.array([0.012, 0, 0]), 0.022, '#3f6b45'); gold_ring(p); p = p - np.array([0, 0.004, 0])
    ch.cbox(p[0] - 0.0015, p[0] + 0.0015, p[1] - 0.016, p[1], p[2] - 0.001, p[2] + 0.001, '#4a3424')               # 琴頸
    ch.crbox(p[0] - 0.0075, p[0] + 0.0075, p[1] - 0.030, p[1] - 0.016, p[2] - 0.0025, p[2] + 0.0025, '#d9b27a', r=0.004)   # 琴身上半
    ch.crbox(p[0] - 0.0095, p[0] + 0.0095, p[1] - 0.046, p[1] - 0.027, p[2] - 0.0025, p[2] + 0.0025, '#d9b27a', r=0.005)   # 琴身下半
    ch.cbox(p[0] - 0.003, p[0] + 0.003, p[1] - 0.029, p[1] - 0.023, p[2] - 0.0027, p[2] - 0.0024, '#3a2a1e')               # 音孔
    ch.finish(root, uv=False)
    os.makedirs(outdir, exist_ok=True); out = os.path.join(outdir, 'bag_yu.glb')
    st_ = L.export(out, gpu_instances=False)
    L.write_json(out.replace('.glb', '.json'), {'glb': os.path.relpath(out, L.ROOT), 'owner': 'yu', 'bytes': st_['bytes'], 'bone': 'upperChest', 'pos': [0, 0, 0],
        'fit': os.path.relpath(FIT, L.ROOT), 'note': '座標＝upperChest 骨頭底下（x 人物右邊、y 上、z 後面）；坐下時藏起來；沒有牌子（D77）'})
    return st_


if '--fit' in ARGS:
    fit(ARGS[ARGS.index('--fit') + 1])
else:
    print('bag', build(os.path.join(os.path.abspath(os.path.join(HERE, '..', '..', '..')), ARGS[ARGS.index('--outdir') + 1] if '--outdir' in ARGS else 'assets/models/char/second_ai')))
