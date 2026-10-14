"""杜可昕（kexin）的衣服（參考圖 kexin.webp 基礎服裝三視圖）：白底淺藍細條紋襯衫（領子、開第一顆扣子、門襟＋扣子、下擺沒紮）
＋寬直筒淺色牛仔褲＋黑色帆布鞋（白鞋底）＋外面一件寬版淺色刷色牛仔外套（敞開、長袖到手腕、下擺在臀部、比襯衫短）。托特包、耳環是配件（之後另外做）。
做法：
  1. 襯衫、牛仔褲、鞋＝LAWWW 給溫書瑀做的 p05_clothes（p00_clothes.run：BodyMap 對到沈以安的比例做、再轉回來；
     h01_clothes 的 V 領身片＋p05 自己做的領子、門襟、扣子、捲起來的袖口），換成這個檔案的 STYLE（下擺不紮、細條紋、寬牛仔褲、黑帆布鞋）。
     門襟：p05 只做到褲頭（紮進去的地方）；可昕的襯衫沒紮，門襟做到下擺上方（shirt_parts）。
  2. 牛仔外套＝芯慈、阿哲的開襟做法（x_xinci_clothes.build_cardigan_open：h01 的上衣、前面敞開），另外一個網格，寬鬆量比襯衫大；
     做好之後整件推到襯衫外面（push_out：離襯衫不到 6 mm 的點沿著襯衫表面的法線推出去），前襟一排銅色扣子。
  3. 頭髮避開襯衫身片＋外套（m['clothes'] 是兩個物件的清單；領子、門襟這種雙面薄片不算——p05 的經驗：薄片的法線方向不一，長髮會被推歪）。
外套的翻領＝jacket_collar（照 p05 襯衫領子的做法，沿著敞開的領口）。
已知的簡化：外套沒有胸前口袋與蓋子（參考圖有）；牛仔褲的褲腳沒有堆在鞋上。"""
import os, math
import numpy as np
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import common as C
import h01_clothes as K
import p00_clothes as PC
import p05_clothes as P5
import x_xinci_clothes as XC

SHIRT_RGB = np.array([244, 244, 246]) / 255.0       # 襯衫底色（參考圖：白，陰影偏淡紫灰）
STRIPE_RGB = np.array([150, 168, 206]) / 255.0      # 細條紋（淺藍）
JACKET_RGB = np.array([132, 156, 188]) / 255.0      # 外套：淺色刷色牛仔布（參考圖受光面 #9fb3c9、陰影 #6f84a2）
JEANS_RGB = np.array([156, 176, 200]) / 255.0       # 牛仔褲：比外套再淺一點（參考圖 #a9bccf）
SHOE_RGB = np.array([30, 30, 34]) / 255.0           # 黑色帆布鞋
SOLE_RGB = np.array([234, 232, 226]) / 255.0        # 白鞋底（有點舊）
BUTTON_RGB = np.array([176, 128, 74]) / 255.0       # 牛仔外套的銅扣

STYLE = dict(KNIT_RGB=SHIRT_RGB, TROUSER_RGB=JEANS_RGB, BELT_RGB=None, LEATHER_RGB=SHOE_RGB, SOLE_RGB=SOLE_RGB, GOLD_RGB=SOLE_RGB,
             SHOE_STYLE='sneaker', NECK_STYLE='V', HEM_OVER_PANTS=True, SLIM=False, TOP_TEX='linen', TROUSER_TEX='denim',
             SLEEVE_LEN=0.92, SLEEVE_K=0.74, CUFF_EASE=0.010, EASE_K=0.80, DROP_X=0.105, TOP_FIT=0.0, HEM_LOOSE=True,
             PANTS_ELLIPSE=(0.074, 0.084), PANTS_DROP=True, PANTS_HEM_UP=0.0)
# 高度寫在可昕身上（Victoria Rubin 樣本：胯 0.970、脊椎 1.063、胸 1.177、上胸 1.306、脖子 1.421；遊戲裡縮到 164 cm）：
# 牛仔褲褲頭在脊椎骨頭上方 2 cm（高腰寬褲）；襯衫沒紮，下擺在胯骨下面 7 cm（比外套長 9 cm）；開第一顆扣子的 V 字最低點在脖子根部下 9 cm
STYLE_M = dict(PANTS_TOP=1.083, PANTS_BAND=1.046, KNIT_HEM=0.900, KNIT_HEM_TOP=0.912, V_BOTTOM=1.331, BACK_NECK_Z=1.434)
SIDE_NECK_M = (0.055, 1.438)
# 外套（第二個網格）：寬版、落肩、袖子寬、長袖到手腕；下擺在胯骨上方 1.5 cm（4 cm 的下擺帶）；前面敞開
JACKET = dict(KNIT_RGB=JACKET_RGB, NECK_STYLE='crew', HEM_OVER_PANTS=True, SLIM=False, TOP_TEX='jersey',
              SLEEVE_LEN=1.0, SLEEVE_K=0.90, CUFF_EASE=0.016, EASE_K=1.20, DROP_X=0.128, TOP_FIT=0.0, HEM_LOOSE=True)
JACKET_M = dict(KNIT_HEM=0.985, KNIT_HEM_TOP=1.025, CREW_FRONT_Z=1.395, BACK_NECK_Z=1.424)
JACKET_SIDE_NECK_M = (0.066, 1.432)
OPEN_PHI = 26.0      # 外套敞開的角度（芯慈 31°、阿哲 24°）


def pinstripe_texture(S=1024, seed=13, _base=K.linen_texture):
    """襯衫：h01 的亞麻布底（KNIT_RGB 是白）＋直向的淺藍細條紋（每 5–6 mm 一條；貼圖 u 是繞身體一圈、v 0.75 以上是下擺、袖口的車縫）"""
    img = _base(S, seed)
    u = (np.arange(S) + 0.5)[None, :] / S; v = (np.arange(S)[::-1] + 0.5)[:, None] / S
    a = 0.62 * np.exp(-(((u * 170) % 1.0 - 0.5) / 0.075) ** 2) * (v <= 0.75)
    img[..., :3] = img[..., :3] * (1 - a[..., None]) + STRIPE_RGB[None, None, :] * a[..., None]
    return img


def denim_jacket_texture(rgb, S=1024, seed=31):
    """牛仔外套：右斜紋＋縱向紗線粗細不均＋刷色斑駁；v 0.75 以上（下擺帶、袖口）深一點、兩道橘棕色車縫線"""
    rng = np.random.default_rng(seed)
    v = (np.arange(S)[::-1] + 0.5)[:, None] / S; u = (np.arange(S) + 0.5)[None, :] / S
    lum = 1.0 + (K._noise(rng, S, S, 3) - 0.5) * 0.12 + (K._noise(rng, S, S, 28) - 0.5) * 0.06
    lum += 0.05 * np.cos(2 * math.pi * (u * S / 2.5 - v * S / 2.5)) + (K._noise(rng, 1, S, 2)[0][None, :] - 0.5) * 0.06
    edge = v > 0.75
    lum = np.where(edge, lum * 0.92, lum)
    img = rgb[None, None, :] * lum[:, :, None]
    st = edge & ((np.abs(v - 0.785) < 0.0025) | (np.abs(v - 0.955) < 0.0025)) & (np.cos(2 * math.pi * u * 260) > 0.1)
    img = np.where(st[:, :, None], np.array([0.72, 0.54, 0.30])[None, None, :], img)
    return np.concatenate([np.clip(img, 0, 1), np.ones((S, S, 1))], -1)


def shirt_parts(m, obj, z_bottom):
    """p05 的領子、門襟＋扣子、袖口。門襟原本做到「脊椎骨頭＋3.4 cm」（紮進去的褲頭）：可昕的襯衫沒紮，量骨頭的時候把脊椎的高度換成下擺上方 3 cm"""
    bh = C.bone_head; arm = m['arm']; sp = bh(arm, 'J_Bip_C_Spine')
    def patched(a, n):
        p = bh(a, n)
        if n == 'J_Bip_C_Spine': p = np.array([p[0], p[1], z_bottom + 0.030 - 0.034])
        return p
    C.bone_head = patched
    try: return P5.build_shirt_parts(m, obj)
    finally: C.bone_head = bh


def push_out(outer, inners, margin=0.006, iters=3, max_move=0.05):
    """外套推到襯衫外面：外套的點如果離襯衫表面不到 margin（或在裡面），沿著襯衫表面的法線推出去（最多 5 cm）"""
    V, F = [], []
    for o in inners:
        Mw = np.array(o.matrix_world); P = C.co(o) @ Mw[:3, :3].T + Mw[:3, 3]; off = len(V)
        V += P.tolist(); F += [[i + off for i in p.vertices] for p in o.data.polygons]
    bvh = BVHTree.FromPolygons(V, F)
    Mo = np.array(outer.matrix_world); P = C.co(outer) @ Mo[:3, :3].T + Mo[:3, 3]; P0 = P.copy(); moved = 0
    for _ in range(iters):
        for i in range(len(P)):
            loc, nrm, _, _ = bvh.find_nearest(Vector(P[i]))
            if loc is None: continue
            loc = np.array(loc); nrm = np.array(nrm); dd = float(np.dot(P[i] - loc, nrm))
            if dd < margin and float(np.linalg.norm(P[i] - loc)) < 0.03: P[i] = P[i] + nrm * (margin - dd)
    d = np.linalg.norm(P - P0, axis=1); big = d > max_move
    P[big] = P0[big] + (P[big] - P0[big]) * (max_move / d[big])[:, None]
    moved = int((d > 1e-5).sum())
    C.set_co(outer, (P - Mo[:3, 3]) @ np.linalg.inv(Mo[:3, :3]).T)
    return moved, float(d.max()) if len(d) else 0.0


def jacket_collar(m, jacket, stand=(0.020, 0.012), width=(0.055, 0.060, 0.075)):
    """牛仔外套的翻領：沿著外套的領口（敞開的前襟上端 → 後頸 → 另一邊）做領座＋往外、往下鋪在肩膀上的領片，前面是尖的領尖。
    做法照 LAWWW 給溫書瑀做的襯衫領子（p05_clothes.build_shirt_parts 的 1–3 步：領口一圈 → 領座往上 → 沿著衣服表面走出領片寬度 → 領尖往下拉 → 磨順），
    差別：外套前面是敞開的，領口不是一整圈——取外套網格邊界上、脖子附近（側頸以上、離中心 8.5 cm 以內）的點，照繞脖子的角度排；領片寬一點（牛仔外套的大翻領）"""
    arm = m['arm']; N = C.bone_head(arm, 'J_Bip_C_Neck'); neck_z = float(N[2])
    bvh, P = P5._bvh(jacket)
    loops = P5._boundary_loops(jacket, P)
    cand = sorted({i for l in loops for i in l if P[i][2] > neck_z - 0.045 and abs(P[i][0]) < 0.085 and P[i][1] > N[1] - 0.10})
    if len(cand) < 12: print('  jacket collar: neckline not found (%d)' % len(cand)); return None
    Q = P[cand]; yc = float(N[1])
    ang = np.degrees(np.arctan2(Q[:, 0], -(Q[:, 1] - yc)))        # 0＝正前方、+90＝人物左邊、±180＝後頸
    ang = np.where(ang < 0, ang + 360.0, ang)                      # 0..360：從前中心往人物左邊繞到後面、再到右邊
    o = np.argsort(ang); Q = Q[o]; ang = ang[o]
    keep = (ang > 8) & (ang < 352); Q = Q[keep]; ang = ang[keep]
    seg = np.r_[0, np.cumsum(np.linalg.norm(np.diff(Q, axis=0), axis=1))]; L = seg[-1]
    s = np.linspace(0.0, L, 81); ring = np.stack([np.interp(s, seg, Q[:, k]) for k in range(3)], -1)
    for _ in range(4): ring[1:-1] = ring[1:-1] * 0.5 + (ring[:-2] + ring[2:]) * 0.25
    t = s / L; back = np.cos(np.pi * (t - 0.5)) ** 2
    tan = P5._u(np.gradient(ring, axis=0)); cen = np.array([N[0], N[1], float(np.mean(ring[:, 2]))])
    stand_h = np.interp(np.abs(t - 0.5), [0, 0.20, 0.34, 0.46, 0.5], [stand[0], stand[0] * 0.9, stand[1], 0.004, 0.002])
    radial = P5._u(np.column_stack([ring[:, 0] - cen[0], ring[:, 1] - cen[1], np.zeros(len(ring))]))
    fold = ring + np.array([0, 0, 1.0]) * stand_h[:, None] + radial * 0.004
    wd = np.interp(np.abs(t - 0.5), [0, 0.20, 0.34, 0.43, 0.48, 0.5], [width[0], width[0], width[1], width[2], width[2] * 0.8, 0.02])
    def onsurf(p, off):
        hit = bvh.find_nearest(Vector(p))
        return np.array(p) if hit[0] is None else np.array(hit[0]) + np.array(hit[1]) * off
    outer, mid = [], []
    for i in range(len(ring)):
        p = fold[i] + radial[i] * 0.005
        nrm = np.array(bvh.find_nearest(Vector(ring[i]))[1]); d = P5._u(np.cross(tan[i], nrm))
        hd = np.array([d[0], d[1], 0.0])
        if np.dot(hd, radial[i]) - 0.5 * d[2] < 0: d = -d
        walked, q, qm, target = 0.0, p.copy(), None, wd[i] + stand_h[i]
        while walked < target:
            st = min(0.002, target - walked); q = onsurf(q + d * st, 0.0035)
            nrm = np.array(bvh.find_nearest(Vector(q))[1]); d = P5._u(d - nrm * np.dot(d, nrm)); walked += st
            if qm is None and walked >= stand_h[i] + 0.45 * wd[i]: qm = q + nrm * 0.0012
        outer.append(q); mid.append(qm if qm is not None else (p + q) / 2)
    outer = np.array(outer); mid = np.array(mid)
    w = P5._sstep(0.30, 0.44, np.abs(t - 0.5)) * (1 - P5._sstep(0.46, 0.50, np.abs(t - 0.5)))
    outer += np.array([0, 0, -0.014])[None, :] * w[:, None]           # 領尖往下拉（牛仔外套的尖領）
    for _ in range(8):
        outer[1:-1] = outer[1:-1] * 0.5 + (outer[:-2] + outer[2:]) * 0.25
        mid[1:-1] = mid[1:-1] * 0.5 + (mid[:-2] + mid[2:]) * 0.25
    jm = next(mt for mt in jacket.data.materials if mt and 'Jacket' in mt.name)
    img = jm.vrm_addon_extension.mtoon1.pbr_metallic_roughness.base_color_texture.index.source
    mat = C.mtoon_from(jm.name, 'K01_JacketCollar_CLOTH', base_img=img, double_sided=True)
    mc = P5.Mesh(); wneck = 0.65 * back + 0.25
    mc.strip(ring + radial * 0.0015, fold, (0.40, 0.46), wneck)
    mc.strip(fold + radial * 0.005, mid, (0.46, 0.53), wneck * 0.6)
    mc.strip(mid, outer, (0.53, 0.70), wneck * 0.5)
    o = mc.obj('Clothes_K01_JacketCollar', arm, mat, lambda V, W: {'J_Bip_C_Neck': W, 'J_Bip_C_UpperChest': 1 - W})
    print('  jacket collar: neckline %d points (%.0f..%.0f deg), length %.3f, faces %d' % (len(Q), float(ang.min()), float(ang.max()), L, len(mc.F)))
    return o


def build_jacket(m):
    """牛仔外套（第二個網格）：和 p00_clothes.run 一樣先把身體對到沈以安的比例（BodyMap），用芯慈的開襟做法做外套，再轉回來"""
    arm, body = m['arm'], m['body']
    bm = C.BodyMap(C.landmarks(arm), PC.REF)
    for k, v in JACKET.items(): setattr(K, k, v)
    for k, v in JACKET_M.items(): setattr(K, k, float(np.interp(v, bm.zc, bm.zr)))
    zr = float(np.interp(JACKET_SIDE_NECK_M[1], bm.zc, bm.zr)); K.SIDE_NECK = (JACKET_SIDE_NECK_M[0] * float(bm._s(np.array([zr]))[0]), zr)
    for k in ('PANTS_TOP', 'PANTS_BAND'): setattr(K, k, float(np.interp(STYLE_M[k], bm.zc, bm.zr)))
    bh = C.bone_head
    C.bone_head = lambda a, n: bm.fwd(bh(a, n))
    C.warp_world(body, bm.fwd)
    ws = m.get('wsrc_jacket')
    if ws is not None: C.warp_world(ws, bm.fwd); K.WSRC = ws
    try:
        skin = K.Skin(body)
        dummy = K.MB(); pants = K.build_pants(skin, arm, dummy); shoes = K.build_shoes(skin, arm, dummy)   # 只要尺寸（外套下擺蓋過褲頭時要把褲子算進去）
        mb = K.MB()
        XC.OPEN_PHI = OPEN_PHI
        top = XC.build_cardigan_open(skin, arm, mb, pants)
        zr_lo = float(np.interp(JACKET_M['KNIT_HEM_TOP'] + 0.03, bm.zc, bm.zr)); zr_hi = float(np.interp(1.36, bm.zc, bm.zr))
        XC.edge_buttons(mb, top['edges']['R'], zr_lo, zr_hi, n=5)        # 銅扣（材質 3）：人物右邊的前襟
        os.makedirs(K.WIP, exist_ok=True)
        img_j = C.image_from_array('K01_Jacket', denim_jacket_texture(JACKET_RGB), os.path.join(K.WIP, 'k01_clothes_Jacket.png'))
        img_b = C.image_from_array('K01_Button', np.concatenate([np.ones((16, 16, 3)) * BUTTON_RGB, np.ones((16, 16, 1))], -1), os.path.join(K.WIP, 'k01_clothes_Button.png'))
        tmpl = next(mt.name for mt in bpy.data.materials if 'Tops' in mt.name and mt.name.endswith('_CLOTH') and not mt.name.startswith(('H01_', 'K01_')))
        mats = [K.make_mat(tmpl, 'K01_Jacket_CLOTH', img_j, (0.70, 0.74, 0.86)), None, None, K.make_mat(tmpl, 'K01_Button_CLOTH', img_b, (0.80, 0.70, 0.62))]
        mats[1] = mats[2] = mats[0]
        W = K.compute_weights(skin, arm, mb, top, pants, shoes)
        obj, bad = mb.build('Clothes_K01_Jacket', mats)
        (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
        C.bind(obj, arm, K.weights_dict(skin, W))
        print('  jacket: dropped loose verts (open front)', XC.drop_loose(obj), 'bad faces', bad)
    finally:
        C.bone_head = bh; K.WSRC = None
        if ws is not None: C.warp_world(ws, bm.inv)
    Mw = np.array(obj.matrix_world); P = C.co(obj) @ Mw[:3, :3].T + Mw[:3, 3]
    C.set_co(obj, (bm.inv(P) - Mw[:3, 3]) @ np.linalg.inv(Mw[:3, :3]).T)
    C.warp_world(body, bm.inv)
    return obj


def apply(m):
    # 外套的權重來源：原本的上衣（p00_clothes.run 用完會刪掉，先複製一份）
    ws = m.get('wsrc_top')
    if ws is not None:
        cp = ws.copy(); cp.data = ws.data.copy(); cp.name = 'WSRC_Jacket'
        (ws.users_collection[0] if ws.users_collection else bpy.context.scene.collection).objects.link(cp); m['wsrc_jacket'] = cp
    jacket = build_jacket(m)        # 外套先做：襯衫那一輪做完會把衣服蓋住的皮膚刪掉（cull_skin），之後再量身體就量不到軀幹
    if m.get('wsrc_jacket') is not None: bpy.data.objects.remove(m['wsrc_jacket'], do_unlink=True); m['wsrc_jacket'] = None
    K.linen_texture = pinstripe_texture
    try:
        shirt = PC.run(m, STYLE, STYLE_M, SIDE_NECK_M)          # 襯衫＋牛仔褲＋帆布鞋（物件 Clothes_H01、材質 H01_*）
    finally:
        K.linen_texture = pinstripe_texture.__defaults__[2]
    shirt.name = 'Clothes_K01'
    parts = shirt_parts(m, shirt, STYLE_M['KNIT_HEM'])
    for o in parts:
        o.name = o.name.replace('Clothes_', 'Clothes_K01_')
        for mt in o.data.materials:
            if mt and mt.name.startswith('P05_'): mt.name = 'K01_' + mt.name[4:]
    for mt in shirt.data.materials:
        if mt and mt.name.startswith('H01_'): mt.name = 'K01_' + mt.name[4:]
    print('  jacket pushed outside the shirt (verts moved, max m)', push_out(jacket, [shirt] + [o for o in parts if 'Collar' in o.name]))
    print('  culled skin faces under the jacket', K.cull_skin(m['body'], jacket))
    jacket_collar(m, jacket)
    me = jacket.data; tris = {}
    for p in me.polygons: tris[p.material_index] = tris.get(p.material_index, 0) + len(p.vertices) - 2
    print('  jacket tris by material', tris)
    m['clothes'] = [shirt, jacket]        # 頭髮避開襯衫身片＋外套
    return shirt
