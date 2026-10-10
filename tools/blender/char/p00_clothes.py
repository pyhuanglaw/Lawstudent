"""祐廷（玩家）的衣服：沿用沈以安的 h01_clothes（參數化建模、權重、剪掉衣服下的皮膚），換成參考圖 02 的款式：
淺灰粗針織圓領毛衣（下擺到胯下一點、不落肩）、深灰直筒長褲（不打褶、褲管比寬褲窄）、白色球鞋（厚鞋底）。
h01_clothes 的高度與寬度參數是照沈以安的身形寫的：先用 common.BodyMap 把祐廷的身體（與骨頭位置）對到沈以安的比例，
在那個空間做衣服、算權重、剪皮膚，最後衣服與身體一起轉回祐廷的比例。"""
import numpy as np
import common as C
import h01_clothes as K

REF = dict(knee=0.4535, hip=0.9133, spine=1.0161, chest=1.1307, upper=1.2448, neck=1.3699, head=1.4447, sh_x=0.0915, hip_x=0.0739)   # 沈以安 stage0（量測值，見 player.py 的 landmarks 記錄）

STYLE = dict(KNIT_RGB=np.array([200, 199, 194]) / 255.0, TROUSER_RGB=np.array([62, 64, 70]) / 255.0, LEATHER_RGB=np.array([236, 234, 228]) / 255.0,
             SOLE_RGB=np.array([226, 224, 218]) / 255.0, GOLD_RGB=np.array([236, 234, 228]) / 255.0,
             V_BOTTOM=1.372, KNIT_HEM=0.985, KNIT_HEM_TOP=1.03, PANTS_TOP=1.06, DROP_X=0.156, SLIM=False, PANTS_ELLIPSE=(0.070, 0.082), SHOE_STYLE='sneaker')


def apply(m):
    arm, body = m['arm'], m['body']
    bm = C.BodyMap(C.landmarks(arm), REF)
    print('  clothes(p00): landmarks', {k: round(v, 3) for k, v in C.landmarks(arm).items()}, 'scale up %.3f lo %.3f' % (bm.s_up, bm.s_lo))
    for k, v in STYLE.items(): setattr(K, k, v)
    bh = C.bone_head
    C.bone_head = lambda a, n: bm.fwd(bh(a, n))          # 衣服模組量骨頭位置時拿到參考空間的位置
    C.warp_world(body, bm.fwd)
    try:
        obj = K.apply(m)
    finally:
        C.bone_head = bh
    me = obj.data; Mw = np.array(obj.matrix_world); P = C.co(obj) @ Mw[:3, :3].T + Mw[:3, 3]
    C.set_co(obj, (bm.inv(P) - Mw[:3, 3]) @ np.linalg.inv(Mw[:3, :3]).T)
    C.warp_world(body, bm.inv)
    return obj
