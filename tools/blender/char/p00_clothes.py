"""祐廷（玩家）的衣服：沿用沈以安的 h01_clothes（參數化建模、權重、剪掉衣服下的皮膚），換成參考圖 02 的款式：
淺灰粗針織圓領毛衣（下擺到胯下一點、不落肩）、深灰直筒長褲（不打褶、褲管比寬褲窄）、白色球鞋（厚鞋底）。
h01_clothes 的高度與寬度參數是照沈以安的身形寫的：先用 common.BodyMap 把祐廷的身體（與骨頭位置）對到沈以安的比例，
在那個空間做衣服、算權重、剪皮膚，最後衣服與身體一起轉回祐廷的比例。"""
import numpy as np
import bpy
import common as C
import h01_clothes as K

REF = dict(knee=0.5519, hip=0.9041, spine=0.997, chest=1.111, upper=1.2351, neck=1.3497, head=1.4219, sh_x=0.1083, hip_x=0.0768)   # 沈以安（HairSample_Female，stage0 只縮頭、這些關節不動）的骨頭地標，2026-10-10 量測

STYLE = dict(KNIT_RGB=np.array([210, 199, 191]) / 255.0, TROUSER_RGB=np.array([75, 72, 72]) / 255.0,   # 參考圖 02 取樣：毛衣 (0.82, 0.78, 0.75)、褲子 (0.29, 0.28, 0.28)
             LEATHER_RGB=np.array([236, 234, 228]) / 255.0,
             SOLE_RGB=np.array([226, 224, 218]) / 255.0, GOLD_RGB=np.array([236, 234, 228]) / 255.0,
             V_BOTTOM=1.372, DROP_X=0.105, SLEEVE_K=0.70, EASE_K=0.75, SLIM=False, PANTS_ELLIPSE=(0.070, 0.082), SHOE_STYLE='sneaker', NECK_STYLE='crew', HEM_OVER_PANTS=True)
# 高度寫在祐廷身上（公尺），執行時用 BodyMap 換算成參考空間。第一版直接寫參考空間的數字（PANTS_TOP 1.06…）：
# 祐廷的胯骨到脊椎骨頭的距離是沈以安的兩倍，分段對應把「參考空間 1.06」放到祐廷的 1.19 m（肋骨下面）——褲頭在胸口下面、毛衣只到肚臍。
# 參考圖 02：毛衣下擺（羅紋）在胯部（約 0.92 m，蓋住褲頭）、圓領前中心在脖子根部；褲頭在肚臍下面（藏在毛衣裡面）
STYLE_M = dict(PANTS_TOP=1.060, PANTS_BAND=1.020, KNIT_HEM=0.920, KNIT_HEM_TOP=0.965, CREW_FRONT_Z=1.452, BACK_NECK_Z=1.478)
# 領口側頸點（祐廷身上：離中心 6.6 cm、高 1.492 m＝脖子根部往上 3.6 cm）。沈以安的值（參考空間 x 0.071）換算回來是 9.6 cm：
# 上身的左右縮放照肩寬（祐廷肩寬是沈以安的 1.36 倍），脖子沒有寬那麼多——領口在脖子兩邊離開 3.5 cm，像一字領
SIDE_NECK_M = (0.066, 1.492)
# 第五版：袖子 0.82 → 0.70、身片寬鬆量 ×0.75、落肩 0.156 → 0.148——遊戲裡手放下來，第四版的肩膀和袖子像羽絨外套（參考空間的袖子半徑換算回祐廷身上是 7–8 cm）


def apply(m):
    arm, body = m['arm'], m['body']
    bm = C.BodyMap(C.landmarks(arm), REF)
    print('  clothes(p00): landmarks', {k: round(v, 3) for k, v in C.landmarks(arm).items()}, 'scale up %.3f lo %.3f' % (bm.s_up, bm.s_lo))
    for k, v in STYLE.items(): setattr(K, k, v)
    for k, v in STYLE_M.items(): setattr(K, k, float(np.interp(v, bm.zc, bm.zr)))
    zr = float(np.interp(SIDE_NECK_M[1], bm.zc, bm.zr)); K.SIDE_NECK = (SIDE_NECK_M[0] * float(bm._s(np.array([zr]))[0]), zr)
    print('  clothes(p00): heights in reference space', {k: round(getattr(K, k), 3) for k in STYLE_M}, 'side neck', np.round(K.SIDE_NECK, 3))
    bh = C.bone_head
    C.bone_head = lambda a, n: bm.fwd(bh(a, n))          # 衣服模組量骨頭位置時拿到參考空間的位置
    C.warp_world(body, bm.fwd)
    ws = m.get('wsrc_top')
    if ws is not None: C.warp_world(ws, bm.fwd); K.WSRC = ws
    try:
        obj = K.apply(m)
    finally:
        C.bone_head = bh; K.WSRC = None
        if ws is not None: bpy.data.objects.remove(ws, do_unlink=True); m['wsrc_top'] = None
    me = obj.data; Mw = np.array(obj.matrix_world); P = C.co(obj) @ Mw[:3, :3].T + Mw[:3, 3]
    C.set_co(obj, (bm.inv(P) - Mw[:3, 3]) @ np.linalg.inv(Mw[:3, :3]).T)
    C.warp_world(body, bm.inv)
    return obj
