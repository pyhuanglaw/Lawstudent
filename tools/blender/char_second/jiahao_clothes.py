"""宋家豪（econ_jiahao）的衣服（參考圖 jiahao.webp 正面／側面／背面）：黑色圓領短袖 T＋螢光黃綠背心（敞開、沒有袖子）＋藍色直筒牛仔褲＋白色球鞋。
LAWWW2-C 2026-10-17 第一版：用韋綸 weilun_clothes 的生產線（阿哲的敞開外套＋tee_full），但「外套」短袖、身片換成螢光背心的顏色、
袖子整條換成黑色（sleeve_panels 的半角 180°＝袖子全部）——身片敞開看到裡面的黑色 T 恤（tee_full），手臂上是黑色短袖：看起來就是 T 恤外面套背心。
已知簡化：背心和袖子之間沒有真的分開（肩線是材質的交界，不是兩件衣服）；背心沒有反光條（參考圖沒有）；拉鍊布條和背心同色。"""
import os, math
import numpy as np
import bpy
import common as C
import h01_clothes as K
import x_xinci_clothes as XC

NAVY = np.array([214, 236, 84]) / 255.0         # 螢光黃綠背心（參考圖 #d6ec54；toon 底色不要太亮，會過曝）
CREAM = np.array([30, 30, 32]) / 255.0          # 袖子＝黑色 T 恤的短袖
MUSTARD = np.array([30, 30, 32]) / 255.0        # 黑色 T 恤
DENIM = np.array([98, 120, 152]) / 255.0        # 藍色直筒牛仔褲（參考圖 #62789a）
ZIP = np.array([214, 236, 84]) / 255.0          # 背心前襟（同色）
SOCK = np.array([238, 238, 234]) / 255.0       # 白色中筒襪
SOCK_Z = (0.068, 0.255)                          # 襪子的高度（參考空間：鞋口 0.080 以下開始、到小腿中段；膝蓋約 0.45）
STYLE = dict(KNIT_RGB=NAVY, TROUSER_RGB=DENIM, LEATHER_RGB=np.array([240, 240, 236]) / 255.0, SOLE_RGB=np.array([234, 230, 220]) / 255.0,
             GOLD_RGB=np.array([234, 230, 220]) / 255.0, BELT_RGB=None,
             SHOE_STYLE='sneaker', NECK_STYLE='crew', HEM_OVER_PANTS=True, SLIM=False, TOP_TEX='jersey', TROUSER_TEX='denim',
             SLEEVE_LEN=0.45, SLEEVE_K=0.85, CUFF_EASE=0.010, EASE_K=0.55, DROP_X=0.100, TOP_FIT=0.50, HEM_LOOSE=True, SHOULDER_SAG=0.020, SLEEVE_IN=0.035,
             NECK_RIB_L=0.012, NECK_RIB_T=0.0, NECK_FOLD=(-0.0015, -0.0005), NECK_CALM=1.0,   # 第十版：背心領口是薄的滾邊（第九版羅紋 2.2 cm、比身片厚 3 mm，遊戲裡像一圈立起來的針織領）   # 第六版（BB_201：薄的工作人員背心，不是羽絨背心）：寬鬆量 0.95 → 0.55、下擺不收
            
             PANTS_ELLIPSE=(0.064, 0.074), PANTS_DROP=False, PANTS_HEM_UP=0.0, PANTS_FOLLOW=True)   # 直筒牛仔褲（明軒的寬度）；第三版：褲管跟著腿走（Sakurada 的腿往內斜，垂直的管子褲腳會張開）
# 高度寫在阿哲身上（Sakurada Fumiriya 樣本：胯 1.103、脊椎 1.288、胸 1.367、上胸 1.444、脖子 1.595、頭 1.684；遊戲裡縮到 178 cm）：
# 牛仔褲褲頭在胯骨上方 10 cm（低腰）；外套下擺在胯骨下面 2 cm（羅紋 4.5 cm，蓋住褲頭）；外套圓領貼脖子根部；T 恤圓領比外套低一點
STYLE_M = dict(PANTS_TOP=1.200, PANTS_BAND=1.160, KNIT_HEM=1.040, KNIT_HEM_TOP=1.056,   # 第六版：下擺長一點、平的（羅紋 4.5 cm → 1.6 cm）
                CREW_FRONT_Z=1.588, BACK_NECK_Z=1.617, TEE_CREW_Z=1.590)   # 家豪第五版：T 恤圓領高一點（第四版遊戲裡領口兩側露出皮膚）   # 外套下擺到胯骨（第一版 1.12：太短）
SIDE_NECK_M = (0.066, 1.631)
OPEN_PHI = 26.0      # 背心敞開（第五版 30 → 26：開口小一點，領口兩側蓋住）


def sleeve_panels(mb, top, mat_from=0, mat_to=4, half_angle=38.0, frac=1.0):
    """外套袖子外側（T 字姿勢的上面＝手放下來的外側）一條米白色拼接：從肩膀到袖口羅紋上方，左右各 38°（約袖圍的 1/5）
    （第一版上臂一半、124°：遊戲裡手放下來，兩個肩膀像兩塊米白色肩章；參考圖是沿著手臂外側的一條）"""
    V = np.array(mb.V); tags = np.array(mb.tag); n = 0
    for side, sl in top['sleeves'].items():
        S, Wr, Lu = np.array(sl['S']), np.array(sl['W']), (float(np.linalg.norm(np.array(sl['W']) - np.array(sl['S']))) - 0.06) * frac   # 到袖口羅紋上方（frac：只到上臂）
        ax = (Wr - S) / np.linalg.norm(Wr - S); up = np.array([0.0, 0.0, 1.0]); up = up - ax * (up @ ax); up /= np.linalg.norm(up)
        for i, (f, mi) in enumerate(zip(mb.F, mb.FMAT)):
            if mi != mat_from or not all(tags[j] == 'sleeve' + side for j in f): continue
            c = V[list(f)].mean(0); s = (c - S) @ ax
            if s < -0.02 or s > Lu - 0.02: continue
            r = c - S - ax * s; r /= (np.linalg.norm(r) + 1e-9)
            if math.degrees(math.acos(float(np.clip(r @ up, -1, 1)))) <= half_angle: mb.FMAT[i] = mat_to; n += 1
    return n


def zip_tapes(mb, edges, w=0.008, mat=5):
    """拉鍊布條：兩條前襟外側，從下擺到領口，寬 8 mm、浮在布面外 1.5 mm（頭尾兩列是往內折的邊，不做）"""
    for nm in ('L', 'R'):
        e = edges[nm]; P, t, nrm = e['P'][1:-1], e['t'][1:-1], e['n'][1:-1]
        A = mb.add(P + nrm * 0.0015, 'torso'); B = mb.add(P + t * w + nrm * 0.0015, 'torso')
        R = len(P); UV = np.zeros((R, 2, 2)); UV[:, 1, 0] = 1.0; UV[:, :, 1] = np.linspace(0.05, 0.95, R)[:, None]
        cen = P - nrm * 0.05
        mb.grid(np.stack([A, B], 1), UV, closed=False, mat=mat, centers=cen)


def tee_under_jacket(cl, tee=3, jacket=(0, 4, 5), inset=0.004, slack=0.002, max_move=0.02, z_max=9.0):
    """T 恤收進外套裡面：從軀幹中心線往外打，T 恤的點如果在外套外面（或離外套不到 2 mm），拉回到外套裡面 4 mm。
    第三版：側面看外套腋下後方露出一小塊芥末黃（外套在腋下往內收，T 恤照身體加寬鬆量，比外套寬）。前面敞開的地方打不到外套，不動"""
    from mathutils import Vector
    from mathutils.bvhtree import BVHTree
    me = cl.data; Mc = np.array(cl.matrix_world)
    P = np.empty(len(me.vertices) * 3); me.vertices.foreach_get('co', P); P = P.reshape(-1, 3) @ Mc[:3, :3].T + Mc[:3, 3]
    FJ = [list(p.vertices) for p in me.polygons if p.material_index in jacket]
    vt = np.unique(np.concatenate([np.array(list(p.vertices)) for p in me.polygons if p.material_index == tee]))
    bv = BVHTree.FromPolygons(P.tolist(), FJ); T = P[vt]; moved = 0
    for i in vt:
        w = P[i]
        if w[2] > z_max: continue          # 家豪第四版：領口附近不收（背心敞開、貼著肩膀：T 恤被收到皮膚底下，脖子兩側露出兩塊皮膚）
        band = T[np.abs(T[:, 2] - w[2]) < 0.012]
        if len(band) < 8: continue
        o = np.array([0.0, 0.5 * (band[:, 1].min() + band[:, 1].max()), w[2]])
        d = w - o; d[2] = 0.0; L = float(np.linalg.norm(d))
        if L < 1e-4: continue
        d /= L; hit = bv.ray_cast(Vector(o), Vector(d), L + 0.06)
        if hit[0] is None: continue
        dist = float((np.array(hit[0]) - o) @ d)
        if dist < L + slack and L - (dist - inset) < max_move:
            P[i] = o + d * max(0.0, dist - inset); P[i][2] = w[2]; moved += 1
    C.set_co(cl, (P - Mc[:3, 3]) @ np.linalg.inv(Mc[:3, :3]).T)
    return moved


def trim_tee(cl, tee=3, max_angle=72.0):
    """T 恤只留前面（離正前方 72° 以內）：兩側、背後被外套整個蓋住，看不到；留著的話手放下來時外套腋下跟著手臂往內收，
    T 恤從腋下後方穿出來（第三、四版遊戲渲染器側面看到一塊芥末黃；綁定姿勢下量不到穿模）"""
    import bmesh
    me = cl.data; bm = bmesh.new(); bm.from_mesh(me); Mc = np.array(cl.matrix_world)
    faces = [f for f in bm.faces if f.material_index == tee]
    if not faces: bm.free(); return 0
    cen = np.array([[*f.calc_center_median()] for f in faces]) @ Mc[:3, :3].T + Mc[:3, 3]
    yc = 0.5 * (cen[:, 1].min() + cen[:, 1].max())
    ang = np.degrees(np.arctan2(np.abs(cen[:, 0]), -(cen[:, 1] - yc)))          # 0＝正前方（-y）
    dead = [f for f, a in zip(faces, ang) if a > max_angle]
    bmesh.ops.delete(bm, geom=dead, context='FACES')
    loose = [v for v in bm.verts if not v.link_faces]; bmesh.ops.delete(bm, geom=loose, context='VERTS')
    bm.to_mesh(me); bm.free(); me.update()
    return len(dead)


def socks(skin, mb, mat=6, K_=20, R_=10):
    """白色中筒襪：每隻腳在 SOCK_Z 之間取 R_ 個高度，每個高度量小腿（LowerLeg＋Foot 權重）的一圈點，往 K_ 個方向取最外面的點＋3.5 mm（支撐函數＝凸包，貼著小腿外面）；
    標成 pants<L/R>，權重照褲管的算法（膝蓋以下＝小腿骨）；cull_skin 會把襪子底下的皮膚（樣本貼圖畫的深色短襪）剪掉"""
    n = 0
    for side, sg in (('L', 1.0), ('R', -1.0)):
        w = skin.wsum({'J_Bip_%s_LowerLeg' % side, 'J_Bip_%s_Foot' % side})
        Pl = skin.P[(w > 0.5) & (skin.P[:, 0] * sg > 0)]
        zs = np.linspace(SOCK_Z[0], SOCK_Z[1], R_); I = []; cen = []
        for zi in zs:
            sel = Pl[np.abs(Pl[:, 2] - zi) < 0.008]
            if len(sel) < 8: sel = Pl[np.argsort(np.abs(Pl[:, 2] - zi))[:16]]
            c = sel[:, :2].mean(0); ring = []
            for k in range(K_):
                t = 2 * math.pi * k / K_; d = np.array([math.cos(t), math.sin(t)])
                r = float(((sel[:, :2] - c) @ d).max()) + 0.0035 + (0.0015 if zi == zs[-1] else 0.0)   # 最上面一圈（羅紋）厚一點
                ring.append([c[0] + d[0] * r, c[1] + d[1] * r, zi])
            I.append(mb.add(np.array(ring), 'pants' + side)); cen.append([c[0], c[1], zi])
        I = np.array(I); UV = np.zeros((R_, K_ + 1, 2)); UV[:, :, 0] = np.linspace(0, 1, K_ + 1)[None, :]; UV[:, :, 1] = np.linspace(0.05, 0.95, R_)[:, None]
        n += mb.grid(I, UV, closed=True, mat=mat, centers=np.array(cen))
    return n


def _texture(rgb, S=1024):
    keep = K.KNIT_RGB; K.KNIT_RGB = rgb
    try: return K.jersey_texture(S)
    finally: K.KNIT_RGB = keep


def _apply(m, arm, body):
    skin = K.Skin(body)
    mb = K.MB()
    pants = K.build_pants(skin, arm, mb)
    print('  pants crotch z %.3f' % pants['z_crotch'])
    XC.OPEN_PHI = OPEN_PHI
    top = XC.build_cardigan_open(skin, arm, mb, pants)
    XC.tee_full(skin, arm, mb, K.PANTS_TOP - 0.03, K.TEE_CREW_Z)
    shoes = K.build_shoes(skin, arm, mb)
    print('  sleeve faces → black tee', sleeve_panels(mb, top, half_angle=180.0, frac=1.2))   # 家豪：整條短袖＝黑色 T 恤
    zip_tapes(mb, top['edges'])
    os.makedirs(K.WIP, exist_ok=True)
    imgs = [C.image_from_array('J01_Jacket', _texture(NAVY), os.path.join(K.WIP, 'j01_clothes_Jacket.png')),
            C.image_from_array('J01_Trouser', K.trouser_texture(), os.path.join(K.WIP, 'j01_clothes_Trouser.png')),
            C.image_from_array('J01_Loafer', K.loafer_texture(), os.path.join(K.WIP, 'j01_clothes_Loafer.png')),
            C.image_from_array('J01_Tee', _texture(MUSTARD, 512), os.path.join(K.WIP, 'j01_clothes_Tee.png')),
            C.image_from_array('J01_Panel', _texture(CREAM, 256), os.path.join(K.WIP, 'j01_clothes_Panel.png')),
            C.image_from_array('J01_Zip', _texture(ZIP, 64), os.path.join(K.WIP, 'j01_clothes_Zip.png'))]
    def tmpl(pat):
        return next(mt.name for mt in bpy.data.materials if pat in mt.name and mt.name.endswith('_CLOTH') and not mt.name.startswith(('H01_', 'X01_', 'Z01_', 'W01_', 'J01_')))
    mats = [K.make_mat(tmpl('Tops'), 'J01_Jacket_CLOTH', imgs[0], (0.70, 0.74, 0.86)),
            K.make_mat(tmpl('Tops'), 'J01_Trouser_CLOTH', imgs[1], (0.74, 0.78, 0.88)),
            K.make_mat(tmpl('Shoes'), 'J01_Loafer_CLOTH', imgs[2], (0.66, 0.68, 0.78)),
            K.make_mat(tmpl('Tops'), 'J01_Tee_CLOTH', imgs[3], (0.86, 0.78, 0.70)),
            K.make_mat(tmpl('Tops'), 'J01_Panel_CLOTH', imgs[4], (0.84, 0.82, 0.80)),
            K.make_mat(tmpl('Tops'), 'J01_Zip_CLOTH', imgs[5], (0.80, 0.80, 0.80))]
    W = K.compute_weights(skin, arm, mb, top, pants, shoes)
    obj, bad = mb.build('Clothes_J01', mats)
    (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
    C.bind(obj, arm, K.weights_dict(skin, W))
    print('  dropped loose verts (open front)', XC.drop_loose(obj))
    print('  tee faces removed at the sides/back (under the jacket)', trim_tee(obj))
    print('  tee pulled under the jacket', tee_under_jacket(obj, z_max=K.TEE_CREW_Z - 0.07))
    print('  body pulled under the tee', XC.conform_under(body, obj, 3, K.PANTS_TOP - 0.03, K.TEE_CREW_Z + 0.065))
    me = obj.data; tris = {}
    for p in me.polygons: tris[p.material_index] = tris.get(p.material_index, 0) + len(p.vertices) - 2
    print('  clothes: verts %d faces %d (bad %d) tris jacket %d jeans %d shoes %d tee %d panel %d zip %d' % (
        len(me.vertices), len(me.polygons), bad, *[tris.get(i, 0) for i in range(6)]))
    n = K.cull_skin(body, obj)
    print('  culled skin faces', n)
    m['clothes'] = obj
    return obj


def apply(m):
    """p00_clothes.run 的做法（BodyMap 對到沈以安的比例 → 做衣服 → 轉回來），呼叫自己的 _apply（外套敞開＋T 恤＋拼接＋拉鍊）"""
    import p00_clothes as PC
    arm, body = m['arm'], m['body']
    bm = C.BodyMap(C.landmarks(arm), PC.REF)
    for k, v in STYLE.items(): setattr(K, k, v)
    for k, v in STYLE_M.items(): setattr(K, k, float(np.interp(v, bm.zc, bm.zr)))
    zr = float(np.interp(SIDE_NECK_M[1], bm.zc, bm.zr)); K.SIDE_NECK = (SIDE_NECK_M[0] * float(bm._s(np.array([zr]))[0]), zr)
    print('  clothes(sim): heights in reference space', {k: round(getattr(K, k), 3) for k in STYLE_M}, 'side neck', np.round(K.SIDE_NECK, 3))
    bh = C.bone_head
    C.bone_head = lambda a, n: bm.fwd(bh(a, n))
    C.warp_world(body, bm.fwd)
    ws = m.get('wsrc_top')
    if ws is not None: C.warp_world(ws, bm.fwd); K.WSRC = ws
    try:
        obj = _apply(m, arm, body)
    finally:
        C.bone_head = bh; K.WSRC = None
        if m.get('wsrc_top') is not None: bpy.data.objects.remove(m['wsrc_top'], do_unlink=True); m['wsrc_top'] = None
    Mw = np.array(obj.matrix_world); P = C.co(obj) @ Mw[:3, :3].T + Mw[:3, 3]
    C.set_co(obj, (bm.inv(P) - Mw[:3, 3]) @ np.linalg.inv(Mw[:3, :3]).T)
    C.warp_world(body, bm.inv)
    return obj
