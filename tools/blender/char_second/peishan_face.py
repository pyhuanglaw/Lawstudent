"""郭沛珊（classmate_peishan）的臉：沿用沈以安的 h01_face（p00_face.run），參數照參考圖 classmate_peishan.webp（BB_109 第 2 節）：
成人比例、安靜、常在想事情——下巴不尖的鵝蛋臉、眼睛比芯慈圓一點、外眼角幾乎不上揚（不像芯慈「客氣但有距離」，比較柔、比較收斂）、
**眉毛細**、淡淡的唇色、幾乎沒有腮紅。眼鏡是另外的配件（glasses_peishan.py）。"""
import os as _os, json as _json
import numpy as np
import p00_face as PF

# 使用者 10-22「林芷若3d好憨 沛珊也是」（LAWWW2 第二十七版）：第二十六版內眼角距離＝眼寬 1.45 倍（一般人約 1 倍）、眼高／眼寬 0.40、眉毛離眼睛遠、
# 下半臉長——眼睛小又分得開、套在大圓框裡像兩個點。改：EYE_IN 0.0026→0.0095（1.10 倍）、EYE_SX 1.00→1.10、EYE_SZ 0.70→0.80（0.46）、IRIS_FRAC 0.52→0.55、
# EYE_TILT 0.025→0.05、BROW_DROP 0.0042→0.0068、D_CHIN 0.008→0.003、MOUTH_DOWN（預設 0.0020）→0.0005、FACE_NARROW 0.96→0.92、MOUTH_K 1.50→1.60、EYELINE_K 0.9→1.1。
# 眼睛往中間移了：眼鏡（glasses_peishan.py）鏡片中心距 84→72.7 mm、鏡框半徑 23→21 mm。比較圖 docs/art-rebuild/second_ai/char_review/peishan_1022/
PEISHAN = dict(D_CHIN=0.003, BROW_DROP=0.0068, EYE_SX=1.10, EYE_SZ=0.80, EYE_TILT=0.05, EYE_IN=0.0095, EYE_LIFT=0.0004, CHEEK_TINT_K=0.6,
               CHIN_WIDEN=0.42, JAW_OUT=0.0030, MOUTH_K=1.60, FACE_NARROW=0.92, IRIS_FRAC=0.55, MOUTH_DOWN=0.0005,
               EYELINE_K=1.1, WING=0.0012, LASH_N=22, LASH_L=0.80, BROW_K=0.82, BROW_ARCH=0.30, BROW_COL=(0.10, 0.085, 0.080), BROW_A=0.88,
               LIP_OUT=(0.84, 0.60, 0.58), LIP_IN=(0.74, 0.46, 0.46), LIP_HI=(0.92, 0.76, 0.74), LIP_A=0.75)
REST = {'Fcl_EYE_Natural': 0.5, 'Fcl_EYE_Close': 0.2}

# 第二十九版（使用者 10-22 11:5x「臉啊頭髮啊 醜死了」，LAWWW2）：和參考圖並排（char_review/peishan_v29/），眼睛小、沒有神、像在發呆：
#   - 基本形烘了 Fcl_EYE_Close 0.2（VRoid 女生的預設「眼睛稍微收一點」）：上眼瞼蓋到虹膜三分之一，戴著大圓框更像睡眼惺忪 → 0.06
#     （vrm_finish2 要一起帶 VRM_REST='{"Fcl_EYE_Close": 0.06}'，量測和烘焙用同一個眼型）；
#   - 眼睛再大一點（EYE_SX 1.10→1.18、EYE_SZ 0.80→0.92）、虹膜 0.55→0.58；上眼線、睫毛加粗加長（EYELINE_K 1.1→1.4、LASH_L 0.80→1.0）；
#   - 遊戲把眼睛的高光網格藏起來（character3d.js C.LOOK.hideEye），只剩虹膜貼圖裡的小亮點：亮點畫大、虹膜下半部亮一點（paint_iris_v29）；
#   - 眉毛細一點、深一點、微彎（BROW_K 0.82→0.78、BROW_COL 深棕、BROW_ARCH 0.30→0.65、BROW_A 0.88→1.0）、唇色（LIP_A 0.75→0.90、珊瑚粉）、腮紅留多一點（CHEEK_TINT_K 0.6→0.3：參考圖有淡淡的紅）。
# PS_FACE_V=28 做回第二十八版的臉（位元組相同）。
V29 = _os.environ.get('PS_FACE_V', '29') != '28'
if V29:
    PEISHAN.update(EYE_SX=1.18, EYE_SZ=0.92, IRIS_FRAC=0.58, EYELINE_K=1.4, LASH_L=1.0, CHEEK_TINT_K=0.3,
                   BROW_A=1.0, BROW_K=0.78, BROW_ARCH=0.65, BROW_COL=(0.075, 0.060, 0.055),      # 眉毛：試做 f1 是一條平的灰色帶子 → 細、深、微彎（參考圖）
                   LIP_OUT=(0.86, 0.56, 0.52), LIP_IN=(0.76, 0.42, 0.40), LIP_HI=(0.93, 0.74, 0.70), LIP_A=0.90)
    REST = {'Fcl_EYE_Natural': 0.5, 'Fcl_EYE_Close': 0.06}

# 試參數（使用者 10-22「好憨」，LAWWW2）：環境變數 FACE_OVERRIDE='{"BROW_DROP":0.006}' 蓋過上面的值，不改檔案就能一次只改一樣、同鏡頭比較
PEISHAN.update(_json.loads(_os.environ.get('FACE_OVERRIDE') or '{}'))
REST = dict(REST, **_json.loads(_os.environ.get('FACE_REST') or '{}'))
IRIS_HL = _json.loads(_os.environ.get('IRIS_HL') or '[0.19, 0.16, 0.95]')     # 第二十九版的大亮點：半寬、半高（虹膜半徑的幾倍）、濃度


def paint_iris_v29(f, R, eyes):
    """h01_face.paint_iris 的沛珊版（第二十九版）：同樣的位置與畫法，虹膜下半部亮一點、左上的亮點放大（原本 0.10×0.085 虹膜半徑，遊戲裡幾乎看不到）"""
    import h01_face as F
    import common as C
    mi_ = F.mat_index(f, 'EyeIris'); mat = f.data.materials[mi_]
    F.remap_uv(f, mi_, [(0.02, 0.03, 0.48, 0.97), (0.52, 0.03, 0.98, 0.97)])
    W, H = 256, 128; pos, mask = F.raster(f, mi_, W, H, R)
    img = np.zeros((H, W, 4)); dark = np.array([0.15, 0.092, 0.065]); mid = np.array([0.34, 0.215, 0.14]); light = np.array([0.60, 0.40, 0.26])
    ring = np.array([0.10, 0.062, 0.045]); pupil = np.array([0.050, 0.032, 0.028])
    img[..., :3] = ring; ss, mix = F.ss, F.mix
    for s, E in eyes.items():
        sel = mask & ((pos[..., 0] > 0) == (s > 0))
        ax = np.abs(pos[..., 0]); z = pos[..., 2]
        Ri = F.IRIS_FRAC * (E['a_out'] - E['a_in']) / 2
        cx = E['cx'] - 0.0004
        zl = np.interp(cx, E['g'], E['lo']); cz = zl + Ri - 0.0002
        E['iris'] = (cx, cz, Ri)
        dxs = (ax - cx); dz = z - cz; r = np.sqrt(dxs ** 2 + dz ** 2) / Ri
        tv = -dz / Ri; th = np.arctan2(dz, dxs)
        col = mix(dark, mid, ss(-0.9, 0.15, tv))
        col = mix(col, light, ss(-0.1, 0.85, tv) * ss(0.30, 0.6, r) * (1 - ss(0.78, 0.94, r)) * 0.9)
        col = col * (1 + 0.06 * np.cos(th * 19 + 2.0 * np.sin(th * 5))[..., None] * ss(0.4, 0.6, r)[..., None])
        col = mix(col, ring, ss(0.76, 0.97, r))
        col = mix(col, pupil, 1 - ss(0.30, 0.37, r))
        hx, hz, ha = IRIS_HL
        hl = np.sqrt(((pos[..., 0] - (0.28 * Ri + (cx if s > 0 else -cx))) / (hx * Ri)) ** 2 + ((z - (cz + 0.30 * Ri)) / (hz * Ri)) ** 2)
        col = mix(col, [0.98, 0.97, 0.95], (1 - ss(0.75, 1.0, hl)) * ha)
        hl2 = np.sqrt(((pos[..., 0] - (-0.32 * Ri + (cx if s > 0 else -cx))) / (0.09 * Ri)) ** 2 + ((z - (cz - 0.40 * Ri)) / (0.075 * Ri)) ** 2)
        col = mix(col, [0.88, 0.80, 0.74], (1 - ss(0.7, 1.0, hl2)) * 0.7)
        a = 1 - ss(0.98, 1.06, r)
        img[sel, :3] = col[sel]; img[sel, 3] = a[sel]
    im = C.image_from_array('H01_EyeIris', np.clip(img, 0, 1)); F.set_tex(mat, im, white=True)
    mat.name = 'H01_Iris_EYE'


NOSE_K = float(_os.environ.get('NOSE_K') or 0.16)     # 第二十九版：鼻樑兩側的淡陰影濃度（0＝不畫）


def paint_nose_v29(m):
    """第二十九版：臉的貼圖在鼻樑兩側畫很淡的陰影、鼻頭下面的陰影加深一點。
    試做 f3 的正面近拍，鼻子只剩鼻孔兩個小點（臉是 MToon 的平塗，鼻樑沒有明暗），臉的中間一片空白；參考圖鼻樑兩側有淡淡的影子。
    左右對稱（遊戲裡光從哪邊來都不會怪），只畫在臉的正面"""
    import h01_face as F
    import common as C
    f = m['face']; skin = F.mat_index(f, 'Face_00_SKIN'); mat = f.data.materials[skin]; e = mat.vrm_addon_extension.mtoon1
    out = F.img_array(e.pbr_metallic_roughness.base_color_texture.index.source).copy(); H, W = out.shape[:2]
    R = F.rest_pose(f); loops = F.classify_loops(f)
    ez = float(np.mean([(E['up'].max() + E['lo'].min()) / 2 for E in (F.eye_arcs(R, L) for L in loops['eye'])]))
    B = C.co(f); mid = np.abs(B[:, 0]) < 0.002; tip = R[np.argmax(np.where(mid, R[:, 1], -1))]
    pos, mask = F.raster(f, skin, W, H, R); x = pos[..., 0]; z = pos[..., 2]; y = pos[..., 1]
    sel = mask & (y > tip[1] - 0.035); rgb = out[..., :3]
    z0, z1 = ez - 0.002, tip[2] + 0.002                     # 兩眼中間 → 鼻頭上方
    t = (z0 - z) / max(1e-4, z0 - z1)
    xc = 0.0046 + 0.0014 * np.clip(t, 0, 1)                 # 越往下越寬（鼻翼）
    band = np.exp(-((np.abs(x) - xc) / 0.0020) ** 2) * F.ss(-0.05, 0.25, t) * (1 - F.ss(0.85, 1.05, t))
    rgb[sel] = F.mix(rgb[sel], [0.80, 0.60, 0.56], (band * NOSE_K)[sel])
    dsub = np.sqrt((x / 0.0060) ** 2 + ((z - (tip[2] - 0.0058)) / 0.0020) ** 2)
    rgb[sel] = F.mix(rgb[sel], [0.80, 0.58, 0.53], ((1 - F.ss(0.4, 1.0, dsub)) * NOSE_K * 0.7)[sel])
    out[..., :3] = np.clip(F.dilate_into(rgb, mask), 0, 1)
    F.set_tex(mat, C.image_from_array('PS_Face_00', out.astype(np.float32)))
    print('  nose shading (v29): eye z %.4f tip %s, %d px' % (ez, np.round(tip, 4), int((band * sel > 0.2).sum())))


# 第三十版（LAWWW 13:0x 驗收第二十九版：臉一片白粉、脖子和胸口偏紅，交界像戴面具；臉要有一點點陰影）：
#   臉的貼圖照「臉的形狀」畫柔和的暖色陰影——越朝側面、朝下（顴骨外側、下顎、下巴下面），越接近遊戲裡脖子在陰影裡的暖色；
#   整張臉往參考圖的暖米色靠一點（參考圖額頭、臉頰 sRGB 約 0.89, 0.78, 0.71；第二十九版的臉貼圖 0.96, 0.87, 0.86 偏粉白）。
#   身體的貼圖不動。眼睛、眉毛、唇色照第二十九版（LAWWW：對，不要動）。PS_FACE_V=29 做回第二十九版。
V30 = _os.environ.get('PS_FACE_V', '30') not in ('28', '29')
SKIN_K = float(_os.environ.get('SKIN_K') or 0.36)                        # 陰影濃度（最暗的地方和陰影色混多少）
SKIN_WARM = _json.loads(_os.environ.get('SKIN_WARM') or '[1.0, 0.985, 0.955]')   # 整張臉乘這個顏色（藍少一點＝暖一點）
SKIN_SHADE = _json.loads(_os.environ.get('SKIN_SHADE') or '[0.84, 0.64, 0.56]')  # 陰影色（遊戲裡脖子在陰影裡的暖色一帶）


def paint_skin_v30(m):
    """第三十版：臉的皮膚貼圖照臉的幾何法線畫柔和的暖色陰影（光從前上方來的方向），再整體往暖米色靠一點"""
    import h01_face as F
    import common as C
    f = m['face']; skin = F.mat_index(f, 'Face_00_SKIN'); mat = f.data.materials[skin]; e = mat.vrm_addon_extension.mtoon1
    out = F.img_array(e.pbr_metallic_roughness.base_color_texture.index.source).copy(); H, W = out.shape[:2]
    R = F.rest_pose(f); TV, _ = F.tris(f, skin)
    fn = np.cross(R[TV[:, 1]] - R[TV[:, 0]], R[TV[:, 2]] - R[TV[:, 0]])      # 面積加權的面法線 → 頂點法線（幾何的，不是 VRoid 改過的平滑法線）
    nv = np.zeros_like(R)
    for k in range(3): np.add.at(nv, TV[:, k], fn)
    nv /= np.maximum(np.linalg.norm(nv, axis=1, keepdims=True), 1e-12)
    B = C.co(f); mid = np.abs(B[:, 0]) < 0.002; tip_i = int(np.argmax(np.where(mid, R[:, 1], -1)))
    if nv[tip_i, 1] < 0: nv = -nv                                          # 鼻頭的法線要朝前（+y）
    N, mask = F.raster(f, skin, W, H, nv); N /= np.maximum(np.linalg.norm(N, axis=-1, keepdims=True), 1e-9)
    L = np.array([0.0, 0.80, 0.60]); L /= np.linalg.norm(L)                 # 前上方
    lit = np.clip(N @ L, 0, 1); sh = (1 - F.ss(0.35, 0.85, lit)) * mask
    rgb = out[..., :3]
    rgb[mask] = rgb[mask] * np.array(SKIN_WARM)
    rgb[mask] = F.mix(rgb[mask], SKIN_SHADE, (sh * SKIN_K)[mask])
    out[..., :3] = np.clip(F.dilate_into(rgb, mask), 0, 1)
    F.set_tex(mat, C.image_from_array('PS_Face_00', out.astype(np.float32)))
    print('  skin shading (v30): K %.2f, %d px shaded > 0.5' % (SKIN_K, int((sh > 0.5).sum())))


def apply(m):
    import h01_face as F
    orig = F.paint_iris
    if V29: F.paint_iris = paint_iris_v29
    try:
        PF.run(m, PEISHAN, REST)
    finally:
        F.paint_iris = orig
    if V29 and NOSE_K > 0: paint_nose_v29(m)
    if V30 and SKIN_K > 0: paint_skin_v30(m)
