"""曾品妤（econ_pinyu）的衣服（參考圖 pinyu.webp）：灰色 oversize 連帽上衣（圓領＋放下來的帽子＋兩條帽繩、袖子蓋到手背、羅紋下擺到大腿上段）
＋黑色寬直筒長褲（褲腳堆在鞋上）＋灰白老爹鞋。做法照高子晴 p04_clothes（p00_clothes.run＋build_hood），換顏色、領口、長褲；
高度寫在品妤身上（Darkness Shibu 樣本，和沛珊、芯慈同一個樣本；沛珊量過的數字）。"""
import numpy as np
import p00_clothes as PC
import p04_clothes as P04

GREY = np.array([158, 158, 160]) / 255.0          # 參考圖的灰色帽 T（#9e9ea0；暗部偏冷）
BLACK = np.array([36, 36, 40]) / 255.0
SHOE = np.array([204, 204, 200]) / 255.0          # 灰白老爹鞋
SOLE = np.array([232, 230, 224]) / 255.0
STYLE = dict(KNIT_RGB=GREY, TROUSER_RGB=BLACK, LEATHER_RGB=SHOE, SOLE_RGB=SOLE, GOLD_RGB=SOLE, BELT_RGB=None,
             SHOE_STYLE='sneaker', NECK_STYLE='crew', HEM_OVER_PANTS=True, SLIM=False, TOP_TEX='jersey', TROUSER_TEX='twill',
             SLEEVE_LEN=1.0, SLEEVE_K=0.97, CUFF_EASE=0.012, EASE_K=1.0, DROP_X=0.118, TOP_FIT=0.0, HEM_LOOSE=False,
             PANTS_ELLIPSE=(0.066, 0.074), PANTS_DROP=False, PANTS_HEM_UP=0.0)
# 褲頭在腰（藏在帽 T 裡）、帽 T 下擺在胯骨下面（oversize）；圓領比 T 恤高一點（帽 T 的領口貼脖子）
STYLE_M = dict(PANTS_TOP=1.050, PANTS_BAND=1.022, KNIT_HEM=0.915, KNIT_HEM_TOP=0.965, BACK_NECK_Z=1.380, CREW_FRONT_Z=1.330)
SIDE_NECK_M = (0.078, 1.392)


def apply(m):
    obj = PC.run(m, STYLE, STYLE_M, SIDE_NECK_M)
    P04.build_hood(m, obj)
    obj.name = 'Clothes_P01'
    m['clothes'] = obj
    return obj
