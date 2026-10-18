"""邱韋綸（econ_weilun）的衣服（參考圖 weilun.webp 正面／側面／背面）：深藍防風外套（敞開、肩膀到上臂外側白色／淺灰拼接、羅紋袖口與下擺、拉鍊邊）
＋橘色圓領 T（沒有紮）＋深藍運動短褲（膝蓋上面一點、寬鬆）＋灰色慢跑鞋（白鞋底）。後背包是 src/props3d.js 的 backpack。
LAWWW2-C 2026-10-17 第一版：直接沿用阿哲的 zhe_clothes（h01_clothes＋x_xinci_clothes 的敞開外套、tee_full、拼接、拉鍊；同一個 Sakurada 樣本，高度照用）。
和阿哲不同：顏色；拼接在肩膀到上臂（參考圖的肩部色塊，阿哲是沿著整條手臂外側的細條）；褲子是短褲（PANTS_HEM_UP）、不是牛仔布；鞋是灰色。
第二版：白色中筒襪（socks()：沿小腿量出來的一圈一圈，蓋過樣本身體貼圖上畫的深棕色短襪——第一版鞋子上面露出那雙深色襪子）；短褲改短、改窄。
第三版（BB-C 2026-10-17 的 8 項）：外套改短袖（到上臂一半）＋放下來的帽子（P04.build_hood，不要前面的帽繩）＋直的下擺（不收）；白色拼接在肩膀到袖子外側＋身體兩側；
短褲到膝上約 5 cm、比較合身、側邊一條細紅線；襪子往下伸進鞋子（第二版腳跟露出樣本貼圖的深色）；左手腕黑色手錶。
已知簡化：膝蓋的擦傷、單車安全帽（拿在手上的道具）沒做。"""
import os, math
import numpy as np
import bpy
import common as C
import h01_clothes as K
import x_xinci_clothes as XC

NAVY = np.array([38, 44, 66]) / 255.0          # 韋綸：防風外套深藍（參考圖 #262c42）
CREAM = np.array([226, 228, 230]) / 255.0      # 肩膀拼接：白／淺灰（參考圖 #e2e4e6）
MUSTARD = np.array([226, 112, 52]) / 255.0     # 橘色 T 恤（參考圖 #e27034）
DENIM = np.array([40, 46, 68]) / 255.0         # 深藍運動短褲
ZIP = np.array([214, 214, 210]) / 255.0        # 拉鍊布條（參考圖前襟兩條白線）
SOCK = np.array([238, 238, 234]) / 255.0       # 白色中筒襪
SOCK_Z = (0.040, 0.255)                          # 襪子的高度（參考空間：伸進鞋子裡、到小腿中段；膝蓋約 0.45）（第三版 0.068 → 0.040：腳跟露出樣本貼圖的深色短襪）
RED = np.array([176, 38, 42]) / 255.0          # 短褲側邊的細紅線（參考圖正面）
STYLE = dict(KNIT_RGB=NAVY, TROUSER_RGB=DENIM, LEATHER_RGB=np.array([128, 132, 138]) / 255.0, SOLE_RGB=np.array([234, 230, 220]) / 255.0,
             GOLD_RGB=np.array([234, 230, 220]) / 255.0, BELT_RGB=None,
             SHOE_STYLE='sneaker', NECK_STYLE='crew', HEM_OVER_PANTS=True, SLIM=False, TOP_TEX='jersey', TROUSER_TEX='twill',
             SLEEVE_LEN=0.45, SLEEVE_K=1.05, CUFF_EASE=0.030, EASE_K=0.95, SHOULDER_SAG=0.020, SLEEVE_IN=0.035,   # 第十一版（BB_201：「3D 是無袖背心」——袖子其實有，只是太窄、大半是白色拼接）：寬的短袖（風衣）、稍長
             DROP_X=0.105, TOP_FIT=0.0, HEM_LOOSE=True,
             PANTS_ELLIPSE=(0.057, 0.063), PANTS_DROP=False, PANTS_HEM_UP=0.62, PANTS_FOLLOW=True)   # 第三版：短袖（到上臂一半）、直下擺；短褲 0.56 → 0.62（膝上 5 cm）、窄一點、褲管跟著腿走   # 短褲：膝蓋上面一點（p04 的牛仔短褲 0.62＝大腿中段）；第一版 0.50／(0.068, 0.076) 像七分寬褲   # 第一版 (0.074, 0.086)＋從臀部直落：遊戲裡像喇叭褲
# 高度寫在阿哲身上（Sakurada Fumiriya 樣本：胯 1.103、脊椎 1.288、胸 1.367、上胸 1.444、脖子 1.595、頭 1.684；遊戲裡縮到 178 cm）：
# 牛仔褲褲頭在胯骨上方 10 cm（低腰）；外套下擺在胯骨下面 2 cm（羅紋 4.5 cm，蓋住褲頭）；外套圓領貼脖子根部；T 恤圓領比外套低一點
STYLE_M = dict(PANTS_TOP=1.200, PANTS_BAND=1.160, KNIT_HEM=1.085, KNIT_HEM_TOP=1.105, CREW_FRONT_Z=1.588, BACK_NECK_Z=1.617, TEE_CREW_Z=1.575)   # 第三版：下擺的邊 4.5 → 2 cm（防風外套的抽繩邊，不是羅紋）   # 外套下擺到胯骨（第一版 1.12：太短）
SIDE_NECK_M = (0.066, 1.631)
OPEN_PHI = 24.0      # 外套敞開：比芯慈的開襟衫（31°）窄一點


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


def socks(skin, mb, mat=6, K_=20, R_=10):
    """白色中筒襪：每隻腳在 SOCK_Z 之間取 R_ 個高度，每個高度量小腿（LowerLeg＋Foot 權重）的一圈點，往 K_ 個方向取最外面的點＋3.5 mm（支撐函數＝凸包，貼著小腿外面）；
    標成 pants<L/R>，權重照褲管的算法（膝蓋以下＝小腿骨）；cull_skin 會把襪子底下的皮膚（樣本貼圖畫的深色短襪）剪掉"""
    n = 0
    for side, sg in (('L', 1.0), ('R', -1.0)):
        w = skin.wsum({'J_Bip_%s_LowerLeg' % side, 'J_Bip_%s_Foot' % side})
        Pl = skin.P[(w > 0.5) & (skin.P[:, 0] * sg > 0)]
        zs = np.linspace(SOCK_Z[0], SOCK_Z[1], R_); I = []; cen = []
        for zi in zs:
            sel = Pl[np.abs(Pl[:, 2] - zi) < (0.022 if zi < 0.12 else 0.008)]   # 第四版：腳踝以下多取一點高度（腳跟往後凸，只取 ±8 mm 時腳跟在襪子外面、露出樣本貼圖的深色短襪）
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


def side_panels(mb, z_top, mat_from=0, mat_to=4, half_angle=24.0):
    """外套身片兩側（腋下到下擺）的白色拼接：身片的面，離正側面（±x）half_angle 以內、在腋下 z_top 以下（參考圖正面、背面都看得到兩側的白色）"""
    V = np.array(mb.V); tags = np.array(mb.tag); idx = []; cen = []
    for i, (f, mi) in enumerate(zip(mb.F, mb.FMAT)):
        if mi != mat_from or not all(tags[j] == 'torso' for j in f): continue
        idx.append(i); cen.append(V[list(f)].mean(0))
    if not idx: return 0
    cen = np.array(cen); yc = float(np.median(cen[:, 1])); n = 0
    for i, c in zip(idx, cen):
        if c[2] > z_top: continue
        if math.degrees(math.atan2(abs(c[1] - yc), abs(c[0]) + 1e-9)) <= half_angle: mb.FMAT[i] = mat_to; n += 1
    return n


def stripe(tex, rgb=RED, half_w=0.007):
    """短褲貼圖：外側的縫（u≈0／1，build_pants 的 k=0＝外側）一條細紅線"""
    S = tex.shape[1]; u = (np.arange(S) + 0.5) / S
    m = (u < half_w) | (u > 1 - half_w)
    tex[:, m, :3] = rgb[None, None, :] * (0.95 + 0.05 * np.random.default_rng(3).random((tex.shape[0], int(m.sum()), 1)))
    return tex


def watch(m, side='L', back=0.035, band_w=0.022):
    """黑色手錶（左手腕；參考圖三格都有）：手腕往手肘 3.5 cm 一圈錶帶（量下臂皮膚最外面＋4 mm）＋手背那一側（T 字姿勢的上面）一個錶面。
    獨立物件，全部綁下臂骨頭（錶不跟著手腕轉）"""
    arm, body = m['arm'], m['body']
    E, Wr = np.array(C.bone_head(arm, 'J_Bip_%s_LowerArm' % side)), np.array(C.bone_head(arm, 'J_Bip_%s_Hand' % side))
    ax = (Wr - E) / np.linalg.norm(Wr - E); up = np.array([0.0, 0.0, 1.0]); up = up - ax * (up @ ax); up /= np.linalg.norm(up); fr = np.cross(up, ax)
    sk = K.Skin(body); w = sk.wsum({'J_Bip_%s_LowerArm' % side, 'J_Bip_%s_Hand' % side}); Pa = sk.P[w > 0.5]
    V, F, UV = [], [], []
    KS = 20; rows = []
    for ds in (-band_w / 2, band_w / 2):
        c0 = Wr - ax * (back + ds); sel = Pa[np.abs((Pa - c0) @ ax) < 0.006]; ring = []
        for k in range(KS):
            t = 2 * math.pi * k / KS; d = math.cos(t) * up + math.sin(t) * fr
            r = (float(((sel - c0) @ d).max()) if len(sel) else 0.03) + 0.004
            ring.append(len(V)); V.append(c0 + d * r); UV.append((0.25, 0.5))
        rows.append(ring)
    for k in range(KS):
        a, b = rows[0][k], rows[0][(k + 1) % KS]; c_, d_ = rows[1][(k + 1) % KS], rows[1][k]
        F.append((a, b, c_, d_))
    # 錶面：手背那一側，扁的圓柱（半徑 1.7 cm、高 7 mm）
    c0 = Wr - ax * back
    rr = float(max((np.array(V[i]) - c0) @ up for i in rows[0] + rows[1]))
    cb = c0 + up * (rr - 0.001); NC = 16; bot = []; topr = []
    for k in range(NC):
        t = 2 * math.pi * k / NC; d = math.cos(t) * ax + math.sin(t) * fr
        bot.append(len(V)); V.append(cb + d * 0.017); UV.append((0.25, 0.5))
    for k in range(NC):
        t = 2 * math.pi * k / NC; d = math.cos(t) * ax + math.sin(t) * fr
        topr.append(len(V)); V.append(cb + up * 0.007 + d * 0.0165); UV.append((0.75 + 0.2 * math.cos(t), 0.5 + 0.4 * math.sin(t)))
    ctr = len(V); V.append(cb + up * 0.0072); UV.append((0.75, 0.5))
    for k in range(NC):
        F.append((bot[k], bot[(k + 1) % NC], topr[(k + 1) % NC], topr[k])); F.append((topr[k], topr[(k + 1) % NC], ctr))
    me = bpy.data.meshes.new('Watch_W01'); me.from_pydata([tuple(p) for p in V], [], F); me.validate(clean_customdata=False); me.update()
    uvl = me.uv_layers.new(name='UVMap'); li = np.zeros(len(me.loops), int); me.loops.foreach_get('vertex_index', li)
    uvl.data.foreach_set('uv', np.array(UV)[li].reshape(-1).astype(np.float32))
    me.polygons.foreach_set('use_smooth', [False] * len(me.polygons))
    obj = bpy.data.objects.new('Watch_W01', me)
    (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
    S = 64; img = np.zeros((S, S, 4)); img[..., 3] = 1; img[..., :3] = 0.045                      # 錶帶：黑
    yy, xx = np.mgrid[0:S, 0:S]; rd = np.hypot((xx + 0.5) / S - 0.75, (yy + 0.5) / S - 0.5)
    img[(xx >= S // 2) & (rd < 0.20), :3] = 0.16; img[(xx >= S // 2) & (rd < 0.17), :3] = 0.10      # 錶圈、錶面（深灰）
    img[(xx >= S // 2) & (np.abs(rd - 0.12) < 0.012), :3] = 0.30                                      # 刻度環
    im = C.image_from_array('W01_Watch', img, os.path.join(K.WIP, 'w01_watch.png'))
    tm = next(mt.name for mt in bpy.data.materials if mt.name.endswith('_CLOTH') and 'Shoes' in mt.name and not mt.name.startswith(('H01_', 'X01_', 'Z01_', 'W01_')))
    mat = C.mtoon_from(tm, 'W01_Watch_CLOTH', base_img=im)
    me.materials.append(mat)
    C.bind(obj, arm, {'J_Bip_%s_LowerArm' % side: np.ones(len(V))})
    return obj


def unpaint_socks(body, z_max=0.34, z_ref=(0.38, 0.52), name='W01_Body_nosock'):   # 第七版 0.22 → 0.34：樣本的深色短襪在後面畫到 0.3 左右（第五、六版白襪上緣後面還看得到深棕色）
    """第五版（BB-C 第 7 點：背面腳跟的深色斑點）：樣本的身體貼圖在腳踝、腳畫了一雙深棕色短襪——待機動畫腳踝一轉，腳跟的皮膚從白襪底下露出來。
    把身體網格在 z_max 以下（樣本座標；腳踝、腳）那些面的貼圖範圍裡、暗的像素改成小腿（z_ref）皮膚的中位數；露出來也只是皮膚"""
    import h01_face as F
    me = body.data; Mw = np.array(body.matrix_world); P = C.co(body) @ Mw[:3, :3].T + Mw[:3, 3]
    uvl = me.uv_layers.active.data; n = 0
    for si, slot in enumerate(body.material_slots):
        mt = slot.material
        if not mt or not mt.name.endswith('_SKIN') or not getattr(mt, 'vrm_addon_extension', None): continue
        src = mt.vrm_addon_extension.mtoon1.pbr_metallic_roughness.base_color_texture.index.source
        if src is None: continue
        a = F.img_array(src); Hh, Ww = a.shape[:2]; mask = np.zeros((Hh, Ww), bool); ref = np.zeros((Hh, Ww), bool)
        for p in me.polygons:
            if p.material_index != si: continue
            zs = P[list(p.vertices), 2]
            tgt = mask if zs.max() < z_max else (ref if (zs.min() > z_ref[0] and zs.max() < z_ref[1]) else None)
            if tgt is None: continue
            uv = np.array([uvl[li].uv[:] for li in p.loop_indices]); xs = uv[:, 0] * Ww; ys = (1 - uv[:, 1]) * Hh
            tgt[max(0, int(ys.min())):min(Hh, int(ys.max()) + 2), max(0, int(xs.min())):min(Ww, int(xs.max()) + 2)] = True
        rgb = a[..., :3]; lum = rgb @ np.array([0.30, 0.59, 0.11])
        R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        skinlike = ref & (a[..., 3] > 0.5) & (R > 0.45) & (R > G) & (G > B)
        if not skinlike.any(): continue
        med = np.median(rgb[skinlike], axis=0); dark = mask & (lum < 0.42)
        out = a.copy(); out[dark, :3] = med; out[..., 3] = np.where(dark, 1.0, a[..., 3])
        im = C.image_from_array(name, out.astype(np.float32)); F.set_tex(mt, im); n += int(dark.sum())
        print('  %s: sock px → skin %d (median %s)' % (name, int(dark.sum()), np.round(med, 3)))
    return n


def cull_skin_keep(body, obj, bands):
    """K.cull_skin，但 bands（參考空間的高度範圍 [(z0, z1), …]）裡的皮膚面不刪：
    第六版（BB-C 第 7 點的真正原因）：襪口、短褲褲口正下方那一圈皮膚在綁定姿勢下「從外面看不到」被刪掉，待機動畫小腿一動、襪口張開，
    從後上方看進去是腿的裡面（深棕色的斑點）——襪口、褲口下面 4 cm 的皮膚留著，張開時看到的是皮膚"""
    orig = C.delete_faces
    def df(o, pm):
        if o is body:
            Mw = np.array(o.matrix_world); Z = (C.co(o) @ Mw[:3, :3].T + Mw[:3, 3])[:, 2]
            keep = np.zeros(len(Z), bool)
            for z0, z1 in bands: keep |= (Z > z0) & (Z < z1)
            pm = np.array([bool(m) and not any(keep[v] for v in p.vertices) for m, p in zip(pm, o.data.polygons)])
        return orig(o, pm)
    C.delete_faces = df
    try: return K.cull_skin(body, obj)
    finally: C.delete_faces = orig


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
    print('  sock faces', socks(skin, mb))
    print('  shoulder panel faces', sleeve_panels(mb, top, half_angle=46.0, frac=0.50))   # 第十一版：拼接只到袖子上半（0.80：整個袖子看起來是白的）   # 第四版：外側上面一條（第三版 70°、整條：遊戲裡兩個袖子整顆白，像墊肩）   # 第二版：肩膀到上臂、外側一大塊
    print('  side panel faces', side_panels(mb, float(C.bone_head(arm, 'J_Bip_L_UpperArm')[2]) - 0.07))
    zip_tapes(mb, top['edges'])
    os.makedirs(K.WIP, exist_ok=True)
    imgs = [C.image_from_array('W01_Jacket', _texture(NAVY), os.path.join(K.WIP, 'w01_clothes_Jacket.png')),
            C.image_from_array('W01_Trouser', stripe(K.trouser_texture()), os.path.join(K.WIP, 'w01_clothes_Trouser.png')),
            C.image_from_array('W01_Loafer', K.loafer_texture(), os.path.join(K.WIP, 'w01_clothes_Loafer.png')),
            C.image_from_array('W01_Tee', _texture(MUSTARD, 512), os.path.join(K.WIP, 'w01_clothes_Tee.png')),
            C.image_from_array('W01_Panel', _texture(CREAM, 256), os.path.join(K.WIP, 'w01_clothes_Panel.png')),
            C.image_from_array('W01_Zip', _texture(ZIP, 64), os.path.join(K.WIP, 'w01_clothes_Zip.png')),
            C.image_from_array('W01_Sock', _texture(SOCK, 128), os.path.join(K.WIP, 'w01_clothes_Sock.png'))]
    def tmpl(pat):
        return next(mt.name for mt in bpy.data.materials if pat in mt.name and mt.name.endswith('_CLOTH') and not mt.name.startswith(('H01_', 'X01_', 'Z01_', 'W01_')))
    mats = [K.make_mat(tmpl('Tops'), 'W01_Jacket_CLOTH', imgs[0], (0.70, 0.74, 0.86)),
            K.make_mat(tmpl('Tops'), 'W01_Trouser_CLOTH', imgs[1], (0.74, 0.78, 0.88)),
            K.make_mat(tmpl('Shoes'), 'W01_Loafer_CLOTH', imgs[2], (0.66, 0.68, 0.78)),
            K.make_mat(tmpl('Tops'), 'W01_Tee_CLOTH', imgs[3], (0.86, 0.78, 0.70)),
            K.make_mat(tmpl('Tops'), 'W01_Panel_CLOTH', imgs[4], (0.84, 0.82, 0.80)),
            K.make_mat(tmpl('Tops'), 'W01_Zip_CLOTH', imgs[5], (0.80, 0.80, 0.80)),
            K.make_mat(tmpl('Tops'), 'W01_Sock_CLOTH', imgs[6], (0.86, 0.86, 0.88))]
    W = K.compute_weights(skin, arm, mb, top, pants, shoes)
    obj, bad = mb.build('Clothes_W01', mats)
    (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
    C.bind(obj, arm, K.weights_dict(skin, W))
    print('  dropped loose verts (open front)', XC.drop_loose(obj))
    print('  tee faces removed at the sides/back (under the jacket)', trim_tee(obj, max_angle=84.0))   # 第五版：72 → 84°（第四版 45° 看得到 T 恤剪掉的鋸齒邊）
    print('  tee pulled under the jacket', tee_under_jacket(obj))
    print('  body pulled under the tee', XC.conform_under(body, obj, 3, K.PANTS_TOP - 0.03, K.TEE_CREW_Z + 0.065))
    me = obj.data; tris = {}
    for p in me.polygons: tris[p.material_index] = tris.get(p.material_index, 0) + len(p.vertices) - 2
    print('  clothes: verts %d faces %d (bad %d) tris jacket %d jeans %d shoes %d tee %d panel %d zip %d' % (
        len(me.vertices), len(me.polygons), bad, *[tris.get(i, 0) for i in range(6)]))
    hem = 0.049 + K.PANTS_HEM_UP
    n = cull_skin_keep(body, obj, [(SOCK_Z[1] - 0.045, SOCK_Z[1] + 0.01), (hem - 0.045, hem + 0.03)])
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
    import p04_clothes as P04
    P04.build_hood(m, obj, mat_key='Jacket', cords=False, scale=1.10, shade=(0.88, 0.88, 0.92))   # 第三版：防風外套的帽子（參考圖側面、背面）
    print('  watch', watch(m).name)
    print('  unpainted sock px', unpaint_socks(body))
    return obj
