"""阿哲（zhe）的衣服（參考圖 zhe.webp）：深藍運動外套（敞開、拉鍊邊、袖子上段米白色拼接、羅紋袖口與下擺）＋芥末黃圓領 T
＋淺藍寬直筒牛仔褲＋深藍帆布球鞋（白鞋底）。後背包是 src/props3d.js 的 backpack（不在這裡做）。
沿用 LAWWW 的 h01_clothes（參數化：一圈一圈的環、BodyMap 對到沈以安的比例做、再轉回來）＋芯慈的開襟做法（x_xinci_clothes：
build_cardigan_open 前面敞開、tee_full 整件 T 恤、conform_under 皮膚收進 T 恤、drop_loose）：
  牛仔褲＝h01 的褲子（TROUSER_TEX 'denim'、寬直筒）；外套＝h01 的上衣（平織布、長袖、羅紋）前面敞開；T 恤＝tee_full（沒有袖子：外套的長袖蓋住）；
  拼接＝外套袖子上臂外側那一半的面換成米白色材質；拉鍊＝兩條前襟外側各一條 8 mm 的淺灰布條。
材質順序：0 外套、1 牛仔褲、2 球鞋、3 T 恤（tee_full 固定用 3）、4 拼接、5 拉鍊。
第一版的已知簡化：T 恤下擺紮進牛仔褲（參考圖沒有紮，露出一截蓋住褲頭）；外套是圓領敞開（參考圖是立領）。"""
import os, math
import numpy as np
import bpy
import common as C
import h01_clothes as K
import x_xinci_clothes as XC

NAVY = np.array([46, 54, 84]) / 255.0          # 參考圖外套取樣 #363645（陰影面）；受光面偏藍
CREAM = np.array([222, 212, 196]) / 255.0      # 袖子拼接 #d7c9bb
MUSTARD = np.array([218, 162, 88]) / 255.0     # T 恤 #d69f57
DENIM = np.array([104, 121, 148]) / 255.0      # 牛仔褲（淺中藍刷色；貼圖會在大腿、膝蓋刷淡）
ZIP = np.array([214, 214, 210]) / 255.0        # 拉鍊布條（參考圖前襟兩條白線）
STYLE = dict(KNIT_RGB=NAVY, TROUSER_RGB=DENIM, LEATHER_RGB=np.array([55, 68, 98]) / 255.0, SOLE_RGB=np.array([234, 230, 220]) / 255.0,
             GOLD_RGB=np.array([234, 230, 220]) / 255.0, BELT_RGB=None,
             SHOE_STYLE='sneaker', NECK_STYLE='crew', HEM_OVER_PANTS=True, SLIM=False, TOP_TEX='jersey', TROUSER_TEX='denim',
             SLEEVE_LEN=1.0, SLEEVE_K=0.78, CUFF_EASE=0.010, EASE_K=0.95, DROP_X=0.105, TOP_FIT=0.0, HEM_LOOSE=False,
             PANTS_ELLIPSE=(0.060, 0.068), PANTS_DROP=False, PANTS_HEM_UP=0.0)   # 第一版 (0.074, 0.086)＋從臀部直落：遊戲裡像喇叭褲
# 高度寫在阿哲身上（Sakurada Fumiriya 樣本：胯 1.103、脊椎 1.288、胸 1.367、上胸 1.444、脖子 1.595、頭 1.684；遊戲裡縮到 178 cm）：
# 牛仔褲褲頭在胯骨上方 10 cm（低腰）；外套下擺在胯骨下面 2 cm（羅紋 4.5 cm，蓋住褲頭）；外套圓領貼脖子根部；T 恤圓領比外套低一點
STYLE_M = dict(PANTS_TOP=1.200, PANTS_BAND=1.160, KNIT_HEM=1.085, KNIT_HEM_TOP=1.130, CREW_FRONT_Z=1.588, BACK_NECK_Z=1.617, TEE_CREW_Z=1.575)   # 外套下擺到胯骨（第一版 1.12：太短）
SIDE_NECK_M = (0.066, 1.631)
OPEN_PHI = 24.0      # 外套敞開：比芯慈的開襟衫（31°）窄一點


def sleeve_panels(mb, top, mat_from=0, mat_to=4, half_angle=38.0):
    """外套袖子外側（T 字姿勢的上面＝手放下來的外側）一條米白色拼接：從肩膀到袖口羅紋上方，左右各 38°（約袖圍的 1/5）
    （第一版上臂一半、124°：遊戲裡手放下來，兩個肩膀像兩塊米白色肩章；參考圖是沿著手臂外側的一條）"""
    V = np.array(mb.V); tags = np.array(mb.tag); n = 0
    for side, sl in top['sleeves'].items():
        S, Wr, Lu = np.array(sl['S']), np.array(sl['W']), float(np.linalg.norm(np.array(sl['W']) - np.array(sl['S']))) - 0.06   # 到袖口羅紋上方
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


def tee_under_jacket(cl, tee=3, jacket=(0, 4, 5), inset=0.004, slack=0.002, max_move=0.02):
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
        w = P[i]; band = T[np.abs(T[:, 2] - w[2]) < 0.012]
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
    print('  sleeve panel faces', sleeve_panels(mb, top))
    zip_tapes(mb, top['edges'])
    os.makedirs(K.WIP, exist_ok=True)
    imgs = [C.image_from_array('Z01_Jacket', _texture(NAVY), os.path.join(K.WIP, 'z01_clothes_Jacket.png')),
            C.image_from_array('Z01_Trouser', K.trouser_texture(), os.path.join(K.WIP, 'z01_clothes_Trouser.png')),
            C.image_from_array('Z01_Loafer', K.loafer_texture(), os.path.join(K.WIP, 'z01_clothes_Loafer.png')),
            C.image_from_array('Z01_Tee', _texture(MUSTARD, 512), os.path.join(K.WIP, 'z01_clothes_Tee.png')),
            C.image_from_array('Z01_Panel', _texture(CREAM, 256), os.path.join(K.WIP, 'z01_clothes_Panel.png')),
            C.image_from_array('Z01_Zip', _texture(ZIP, 64), os.path.join(K.WIP, 'z01_clothes_Zip.png'))]
    def tmpl(pat):
        return next(mt.name for mt in bpy.data.materials if pat in mt.name and mt.name.endswith('_CLOTH') and not mt.name.startswith(('H01_', 'X01_', 'Z01_')))
    mats = [K.make_mat(tmpl('Tops'), 'Z01_Jacket_CLOTH', imgs[0], (0.70, 0.74, 0.86)),
            K.make_mat(tmpl('Tops'), 'Z01_Trouser_CLOTH', imgs[1], (0.74, 0.78, 0.88)),
            K.make_mat(tmpl('Shoes'), 'Z01_Loafer_CLOTH', imgs[2], (0.66, 0.68, 0.78)),
            K.make_mat(tmpl('Tops'), 'Z01_Tee_CLOTH', imgs[3], (0.86, 0.78, 0.70)),
            K.make_mat(tmpl('Tops'), 'Z01_Panel_CLOTH', imgs[4], (0.84, 0.82, 0.80)),
            K.make_mat(tmpl('Tops'), 'Z01_Zip_CLOTH', imgs[5], (0.80, 0.80, 0.80))]
    W = K.compute_weights(skin, arm, mb, top, pants, shoes)
    obj, bad = mb.build('Clothes_Z01', mats)
    (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
    C.bind(obj, arm, K.weights_dict(skin, W))
    print('  dropped loose verts (open front)', XC.drop_loose(obj))
    print('  tee faces removed at the sides/back (under the jacket)', trim_tee(obj))
    print('  tee pulled under the jacket', tee_under_jacket(obj))
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
