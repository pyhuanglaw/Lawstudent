"""郭沛珊（classmate_peishan）的衣服（參考圖 classmate_peishan.webp 正面、側面、背面；BB_109 第 2 節①校園日常）：
  酒紅色素 T：圓領、短袖（袖口在上臂中段、手肘上面）、寬鬆直筒、下擺蓋在裙頭上（參考圖：T 恤下擺落在高腰的裙頭）——
              h01_clothes.build_top（圓領、jersey 布料、HEM_OVER_PANTS：箱形往下量到下擺、把裙子算進去，下擺不會切進裙子）。
  深藍長裙：高腰（自然腰線）、A 字、裙擺到小腿下段（參考圖：露出腳踝和帆布鞋）——吳芯慈的中長裙（x_xinci_clothes.build_skirt）加長、裙擺放寬；
              權重同芯慈（只綁腰臀＋大腿，不用裙擺彈簧骨：坐下時裙子不會炸開）。
  黑色帆布鞋：h01_clothes.build_shoes 的球鞋（白鞋底、鞋帶），鞋面黑色（和杜可昕一樣的設定）。
高度寫在 Darkness Shibu 樣本上（和芯慈同一個樣本：身高 1.632，遊戲裡 163 cm）。"""
import math, os
import numpy as np
import bpy
import common as C
import h01_clothes as K
import x_xinci_clothes as XC

# 第三版配色（使用者 2026-10-17：「原本的人物不對」「要照2D圖畫」——日系風＝2D 立繪那一套；第一版的酒紅 (118,38,44) 在遊戲裡畫出來是鮮紅 #540510、
# 裙子 (36,42,64) 畫出來幾乎是黑 #0a0e1f，和立繪（T 恤 #603835、裙子 #343740，assets/portraits/classmate_peishan/campus/neutral.webp 取樣）不一樣）。
# 校正：遊戲裡（校園 12:00，test 腳本 peishan_cal.py）直接乘材質顏色，量到畫面上 T 恤 #643b37、裙子 #343841 的係數，換算回貼圖顏色。灰藍＋米白（第二版）作廢
WINE = np.array([121, 86, 83]) / 255.0          # T 恤：偏咖啡的暗酒紅（遊戲畫面 ≈ 立繪 #603835）
NAVY = np.array([80, 86, 94]) / 255.0          # 長裙：深藍灰（遊戲畫面 ≈ 立繪 #343740）
SHOE = np.array([28, 28, 30]) / 255.0            # 黑色帆布
SOLE = np.array([236, 232, 222]) / 255.0         # 白鞋底
STYLE = dict(KNIT_RGB=WINE, TROUSER_RGB=NAVY, LEATHER_RGB=SHOE, SOLE_RGB=SOLE, GOLD_RGB=SOLE, BELT_RGB=None,
             SHOE_STYLE='sneaker', NECK_STYLE='crew', HEM_OVER_PANTS=False, SLIM=True, TOP_TEX='jersey',
             SLEEVE_LEN=0.40, SLEEVE_K=0.72, CUFF_EASE=0.012, EASE_K=0.16, DROP_X=0.086, TOP_FIT=1.0, HEM_LOOSE=False, NECK_CALM=1.0, NECK_GAP=0.018, SHOULDER_SKIN=False, DRAPE=0.014, SHOULDER_SAG=0.020,   # 第十六版：肩膀上面低 2 cm（手放下來時不堆）
               # 第十五版（BB-C：領口立起來圍著脖子、胸口以下圓桶）：肩膀改回原本的弧線（貼斜方肌的曲線在靠脖子那頭變陡，羅紋立起來）、領口離脖子 1.8 cm、貼身、垂墜皺褶
             NECK_RIB_L=0.015, NECK_RIB_T=0.0, NECK_FOLD=(-0.0015, -0.0005), SLEEVE_IN=0.035, BOX_W=0.128)   # 第十七版：羅紋平的（不做厚度、幾乎不折）、箱形窄 2.4 cm（胸口不往前撐）   # 第十四版：袖子從肩關節往內 3.5 cm（肩膀的洞）   # 第十一版（BB-C 第十版意見）：肩膀不翹（落肩 0.098 → 0.088）、胸口以下貼身（EASE 0.56 → 0.42、FIT 0.62 → 0.85）、羅紋領 1.6 cm、薄   # 第九版：領口貼脖子、肩膀上面貼著斜方肌（第五～八版像連帽衫的一圈）   # 第四版（照立繪，BB-C 10-17：膨、短、方）：合身、下擺紮進裙頭   # 第三版：合身一點（第二版 EASE 0.90／FIT 0.15 在遊戲裡像連帽上衣）
STYLE_M = dict(PANTS_TOP=1.050, PANTS_BAND=1.022, KNIT_HEM=1.046, KNIT_HEM_TOP=1.056, BACK_NECK_Z=1.346, CREW_FRONT_Z=1.306)   # 第十五版：領口再低 1 cm（在鎖骨上方一點）   # 第十版：後領 1.368 → 1.356   # 第四版：下擺紮進裙頭（只蓋到裙頭最上面，小語的做法）、領口貼脖子、後領低一點（後面不鼓成帽子）   # 第二版：領口開一點（第一版 1.342 正面看像高領、脖子整個包住；參考圖看得到鎖骨）
SIDE_NECK_M = (0.082, 1.362)   # 第十五版：側頸點再往外 8 mm、低 8 mm（脖子兩側看得到一段肩線）
SIDE_NECK_M_V10 = (0.074, 1.370)   # 第十版：側頸點低 2.2 cm、往外 6 mm——原本領口兩側爬到脖子中段（比肩線高 3 cm），手放下來以後像連帽衫的帽沿（第九版只改領口離脖子的距離，沒用）   # 第四版：領口收小（0.078：領口離脖子很遠，像連帽衫的帽緣）
# 長裙：裙擺 z 0.16（小腿下段；鞋口約 0.08），A 字放寬（走路時小腿在裙子裡面前後擺，裙擺要夠寬）
SKIRT = dict(z_top=1.050, z_band=1.022, z_hip=0.885, z_hem=0.230, hem_rx=0.250, hem_ry=0.222, n_dir=48)   # 第六版：小腿中間、下擺約肩寬 1.6 倍（第三版 0.160／0.300：像燈罩；第五版 0.215：直筒窄裙）


def tee_texture(S=1024, seed=31):
    a = K.jersey_texture(S, seed)
    # 第十七版（BB-C：「羅紋是一圈捲起來的圓管，像運動衫；立繪是平的一條色帶」）：領口羅紋（v 0.90～0.98）畫成深一點的平色帶，網格不做厚度
    v = (np.arange(S)[::-1] + 0.5) / S; band = (v > 0.895) & (v < 0.985)
    a[band, :, :3] *= 0.80
    return a


def _apply(m, arm, body, wsrc_skirt):
    if K.SLIM: K.slim_body(body)
    skin = K.Skin(body)
    mb = K.MB()
    skirt = XC.build_skirt(skin, arm, mb, SKIRT_REF)
    top = K.build_top(skin, arm, mb, skirt)
    shoes = K.build_shoes(skin, arm, mb)
    os.makedirs(K.WIP, exist_ok=True)
    img_t = C.image_from_array('S01_Tee', tee_texture(), os.path.join(K.WIP, 's01_clothes_Tee.png'))
    img_s = C.image_from_array('S01_Skirt', XC.skirt_texture(), os.path.join(K.WIP, 's01_clothes_Skirt.png'))
    img_k = C.image_from_array('S01_Shoe', K.loafer_texture(), os.path.join(K.WIP, 's01_clothes_Shoe.png'))
    def tmpl(pat):
        return next(mt.name for mt in bpy.data.materials if pat in mt.name and mt.name.endswith('_CLOTH') and not mt.name.startswith(('H01_', 'X01_', 'S01_')))
    mats = [K.make_mat(tmpl('Tops'), 'S01_Tee_CLOTH', img_t, (0.78, 0.66, 0.70)),
            K.make_mat(tmpl('Tops'), 'S01_Skirt_CLOTH', img_s, (0.72, 0.74, 0.86)),
            K.make_mat(tmpl('Shoes'), 'S01_Shoe_CLOTH', img_k, (0.62, 0.60, 0.62))]
    fake_pants = dict(legs={}, z_crotch=skirt['z_crotch'])
    W = K.compute_weights(skin, arm, mb, top, fake_pants, shoes)
    ms, Ws = long_skirt_weights(skin, mb, arm)
    W[ms] = K.limit_norm(Ws, 4)
    obj, bad = mb.build('Clothes_S01', mats)
    (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
    C.bind(obj, arm, K.weights_dict(skin, W))
    me = obj.data; tris = {}
    for p in me.polygons: tris[p.material_index] = tris.get(p.material_index, 0) + len(p.vertices) - 2
    print('  clothes: verts %d faces %d (bad %d) tris tee %d skirt %d shoes %d' % (len(me.vertices), len(me.polygons), bad, tris.get(0, 0), tris.get(1, 0), tris.get(2, 0)))
    # 第十八版：上衣收窄（第十七版寬鬆量 0.16、箱形 0.128）以後胸口、領口旁邊的皮膚從布裡穿出來（遊戲裡胸前幾塊淡色）——
    # 和芯慈、阿哲一樣把軀幹的皮膚收進上衣裡面 3 mm（只動軀幹骨頭權重 ≥ 0.8 的點，一次最多 1.5 cm）
    print('  body pulled under the tee', XC.conform_under(body, obj, 0, SKIRT_REF['z_top'] - 0.025, K.CREW_FRONT_Z + 0.02))
    # 第十九版：第十八版只動了 12 個點（那一步只收「已經在布外面」的皮膚；T 字姿勢時胸口的皮膚在布裡面 3～4 mm，
    # 手放下來時腋下前面的布跟著上臂往內，皮膚才穿出來）——領口以下、離布不到 5 mm 的軀幹皮膚都收到布裡面 8 mm
    print('  body pulled deeper under the tee', XC.conform_under(body, obj, 0, SKIRT_REF['z_top'] - 0.025, K.CREW_FRONT_Z - 0.03, inset=0.008, slack=0.005, max_move=0.015))
    print('  shoulders/upper back pulled under the tee', pull_shoulders(body, obj, K.CREW_FRONT_Z - 0.04, K.BACK_NECK_Z - 0.008))
    print('  culled skin faces', K.cull_skin(body, obj))
    m['clothes'] = obj
    return obj


def pull_shoulders(body, cl, z_lo, z_hi, inset=0.007, slack=0.005, max_move=0.012):
    """第二十版（第十九版背面兩邊肩胛骨上方、坐下時肩膀上面還有淡色）：XC.conform_under 只動軀幹骨頭權重 ≥ 0.8 的點，
    肩膀上面、背上靠肩膀那一段的皮膚有肩膀骨頭的權重，沒有被收進去。這裡把肩膀骨頭也算進來、範圍到後領，
    前面領口開口那一塊（|x| < 9 cm、身體前半）不動：那裡收進去，領口邊緣會看到一圈凹下去的皮膚。"""
    from mathutils import Vector
    from mathutils.bvhtree import BVHTree
    me = cl.data; Mc = np.array(cl.matrix_world)
    P = np.empty(len(me.vertices) * 3); me.vertices.foreach_get('co', P); P = P.reshape(-1, 3) @ Mc[:3, :3].T + Mc[:3, 3]
    F = [list(p.vertices) for p in me.polygons if p.material_index == 0]
    T = P[np.unique(np.concatenate([np.array(f) for f in F]))]
    bv = BVHTree.FromPolygons(P.tolist(), F)
    Mb = np.array(body.matrix_world); co = C.co(body); W = co @ Mb[:3, :3].T + Mb[:3, 3]
    wt = C.vgroup_weights(body, {'J_Bip_C_Chest', 'J_Bip_C_UpperChest', 'J_Bip_C_Neck', 'J_Bip_L_Shoulder', 'J_Bip_R_Shoulder'} | set(K.BUST))
    yc = 0.5 * (T[:, 1].min() + T[:, 1].max()); moved = 0
    for i in np.nonzero((W[:, 2] > z_lo) & (W[:, 2] < z_hi) & (wt >= 0.8))[0]:
        w = W[i]
        if w[1] < yc and abs(w[0]) < 0.09: continue                   # 前面領口開口（VRoid 人物面向 −y）
        band = T[np.abs(T[:, 2] - w[2]) < 0.012]
        if len(band) < 8: continue
        o = np.array([0.0, 0.5 * (band[:, 1].min() + band[:, 1].max()), w[2] - 0.05])   # 從下面一點往上斜著打：肩膀上面的布是往外、往下斜的
        d = w - o; L = float(np.linalg.norm(d))
        if L < 1e-4: continue
        d /= L; hit = bv.ray_cast(Vector(o), Vector(d), L + 0.05)
        if hit[0] is None: continue
        dist = float((np.array(hit[0]) - o) @ d)
        if dist < L + slack and L - (dist - inset) < max_move:
            W[i] = o + d * max(0.0, dist - inset); moved += 1
    C.set_co(body, (W - Mb[:3, 3]) @ np.linalg.inv(Mb[:3, :3]).T)
    return moved


def long_skirt_weights(skin, mb, arm):
    """長裙的權重（第三版）：芯慈的做法（裙頭、臀部＝身體最近點；髖關節以下＝同一側大腿＋臀部）只到膝蓋——
    第二版整條長裙照大腿轉，坐下時大腿往前 83°，膝蓋以下的裙子跟著抬平，變成一個大圓盤（test_charlook 坐姿）。
    膝蓋以下改成同一側的小腿（坐著時小腿垂直，裙子順著小腿垂下；走路時跟著小腿前後擺，不會被小腿頂穿）；
    跟腿走的比例：前面多、後面少（後面留在臀部下面）。"""
    V = np.array(mb.V); tags = np.array(mb.tag); m = tags == 'skirt'; Q = V[m]; n = len(Q)
    near = skin.nearest_weights(Q)
    bust = [skin.col(b) for b in K.BUST if skin.col(b) is not None]; near[:, bust] = 0
    zj = 0.5 * (C.bone_head(arm, 'J_Bip_L_UpperLeg')[2] + C.bone_head(arm, 'J_Bip_R_UpperLeg')[2])      # 髖關節
    zk = 0.5 * (C.bone_head(arm, 'J_Bip_L_LowerLeg')[2] + C.bone_head(arm, 'J_Bip_R_LowerLeg')[2])      # 膝蓋
    a = K.sstep(zj + 0.04, zj - 0.10, Q[:, 2])[:, None]
    cy = C.bone_head(arm, 'J_Bip_C_Hips')[1]
    dxy = np.stack([Q[:, 0], Q[:, 1] - cy], -1); front = -dxy[:, 1] / np.maximum(np.linalg.norm(dxy, axis=1), 1e-6)
    lo = K.sstep(zk + 0.06, zk - 0.10, Q[:, 2])                                            # 0＝膝蓋以上、1＝膝蓋下 10 cm 以下
    k_up = np.where(front >= 0, 0.5 + 0.4 * front, 0.5 + 0.35 * front)
    k_lo = np.where(front >= 0, 0.75 + 0.2 * front, 0.75 + 0.3 * front)                  # 膝蓋以下：前 0.95、側 0.75、後 0.45
    k = k_up * (1 - lo) + k_lo * lo
    sideL = K.sstep(-0.035, 0.035, Q[:, 0])
    Wleg = K.axis_weights(skin, n, [('J_Bip_L_UpperLeg', sideL * k * (1 - lo)), ('J_Bip_R_UpperLeg', (1 - sideL) * k * (1 - lo)),
                                    ('J_Bip_L_LowerLeg', sideL * k * lo), ('J_Bip_R_LowerLeg', (1 - sideL) * k * lo), ('J_Bip_C_Hips', 1 - k)])
    W = (1 - a) * near + a * Wleg
    W = W / np.maximum(W.sum(1, keepdims=True), 1e-9)
    print('  long skirt weights: hip joint z %.3f knee z %.3f hem z %.3f' % (zj, zk, float(Q[:, 2].min())))
    return m, W


SKIRT_REF = None


def apply(m):
    """p00_clothes.run 的做法（BodyMap 對到沈以安的比例 → 做衣服 → 轉回來），同 x_xinci_clothes.apply"""
    global SKIRT_REF
    import p00_clothes as PC
    arm, body = m['arm'], m['body']
    bm = C.BodyMap(C.landmarks(arm), PC.REF)
    for k, v in STYLE.items(): setattr(K, k, v)
    for k, v in STYLE_M.items(): setattr(K, k, float(np.interp(v, bm.zc, bm.zr)))
    zr = float(np.interp(SIDE_NECK_M[1], bm.zc, bm.zr)); K.SIDE_NECK = (SIDE_NECK_M[0] * float(bm._s(np.array([zr]))[0]), zr)
    SKIRT_REF = dict(SKIRT, **{k: float(np.interp(SKIRT[k], bm.zc, bm.zr)) for k in ('z_top', 'z_band', 'z_hip', 'z_hem')})
    print('  clothes(sim): heights in reference space', {k: round(getattr(K, k), 3) for k in STYLE_M}, 'skirt', {k: round(v, 3) for k, v in SKIRT_REF.items() if k.startswith('z_')})
    bh = C.bone_head
    C.bone_head = lambda a, n: bm.fwd(bh(a, n))
    C.warp_world(body, bm.fwd)
    ws = m.get('wsrc_top'); wsk = m.get('wsrc_skirt')
    if ws is not None: C.warp_world(ws, bm.fwd); K.WSRC = ws
    if wsk is not None: C.warp_world(wsk, bm.fwd)
    try:
        obj = _apply(m, arm, body, wsk)
    finally:
        C.bone_head = bh; K.WSRC = None
        for key in ('wsrc_top', 'wsrc_skirt'):
            if m.get(key) is not None: bpy.data.objects.remove(m[key], do_unlink=True); m[key] = None
    Mw = np.array(obj.matrix_world); P = C.co(obj) @ Mw[:3, :3].T + Mw[:3, 3]
    C.set_co(obj, (bm.inv(P) - Mw[:3, 3]) @ np.linalg.inv(Mw[:3, :3]).T)
    C.warp_world(body, bm.inv)
    return obj
