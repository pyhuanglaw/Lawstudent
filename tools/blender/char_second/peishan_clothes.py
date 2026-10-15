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

WINE = np.array([118, 38, 44]) / 255.0           # 酒紅（參考圖受光面約 #7a2a2e、陰影 #4e1a1e）
NAVY = np.array([36, 42, 64]) / 255.0            # 深藍裙（參考圖 #262c42 一帶，比芯慈的裙子再暗一點）
SHOE = np.array([28, 28, 30]) / 255.0            # 黑色帆布
SOLE = np.array([236, 232, 222]) / 255.0         # 白鞋底
STYLE = dict(KNIT_RGB=WINE, TROUSER_RGB=NAVY, LEATHER_RGB=SHOE, SOLE_RGB=SOLE, GOLD_RGB=SOLE, BELT_RGB=None,
             SHOE_STYLE='sneaker', NECK_STYLE='crew', HEM_OVER_PANTS=True, SLIM=True, TOP_TEX='jersey',
             SLEEVE_LEN=0.40, SLEEVE_K=0.78, CUFF_EASE=0.016, EASE_K=0.66, DROP_X=0.105, TOP_FIT=0.45, HEM_LOOSE=True)   # 第三版：合身一點（第二版 EASE 0.90／FIT 0.15 在遊戲裡像連帽上衣）
STYLE_M = dict(PANTS_TOP=1.050, PANTS_BAND=1.022, KNIT_HEM=0.985, KNIT_HEM_TOP=1.005, BACK_NECK_Z=1.376, CREW_FRONT_Z=1.300)   # 第二版：領口開一點（第一版 1.342 正面看像高領、脖子整個包住；參考圖看得到鎖骨）
SIDE_NECK_M = (0.078, 1.392)
# 長裙：裙擺 z 0.16（小腿下段；鞋口約 0.08），A 字放寬（走路時小腿在裙子裡面前後擺，裙擺要夠寬）
SKIRT = dict(z_top=1.050, z_band=1.022, z_hip=0.885, z_hem=0.160, hem_rx=0.300, hem_ry=0.265, n_dir=48)


def tee_texture(S=1024, seed=31):
    return K.jersey_texture(S, seed)


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
    print('  culled skin faces', K.cull_skin(body, obj))
    m['clothes'] = obj
    return obj


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
