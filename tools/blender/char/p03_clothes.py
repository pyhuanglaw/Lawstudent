"""陳語彤（heroine_03）的衣服：沿用沈以安的 h01_clothes（p00_clothes.run：BodyMap 對到沈以安的比例、做完再轉回來），款式照參考圖 06：
深炭灰（帶一點棕）棉質圓領短袖 T 恤、下擺紮進高腰直筒牛仔褲、棕色皮帶、白色球鞋。後背包是 props3d.js。"""
import numpy as np
import p00_clothes as PC

STYLE = dict(KNIT_RGB=np.array([64, 58, 56]) / 255.0, TROUSER_RGB=np.array([92, 110, 134]) / 255.0, BELT_RGB=np.array([96, 62, 40]) / 255.0,
             LEATHER_RGB=np.array([238, 236, 230]) / 255.0, SOLE_RGB=np.array([228, 226, 220]) / 255.0, GOLD_RGB=np.array([238, 236, 230]) / 255.0,
             SHOE_STYLE='sneaker', NECK_STYLE='crew', HEM_OVER_PANTS=False, SLIM=True, TOP_TEX='jersey', TROUSER_TEX='denim',
             SLEEVE_LEN=0.34, SLEEVE_K=0.80, CUFF_EASE=0.016, EASE_K=0.60, DROP_X=0.105, TOP_FIT=0.55, HEM_LOOSE=False,
             PANTS_ELLIPSE=(0.052, 0.060), PANTS_DROP=False, PANTS_HEM_UP=0.022)   # 第二版：褲腳到腳踝、露出整雙球鞋（參考圖）；褲管細一點
# 高度寫在陳語彤身上（Sendagaya Shibu 樣本：身高 1.598，遊戲裡 159 cm；脊椎骨頭 0.963、脖子 1.315）：
# 高腰牛仔褲的褲頭在腰（脊椎骨頭上方 3 cm），T 恤紮進去（下擺停在褲頭上緣，皮帶整條露出來）；圓領貼脖子
STYLE_M = dict(PANTS_TOP=0.993, PANTS_BAND=0.958, KNIT_HEM=0.986, KNIT_HEM_TOP=0.998, CREW_FRONT_Z=1.305, BACK_NECK_Z=1.323)
SIDE_NECK_M = (0.050, 1.327)


def apply(m):
    return PC.run(m, STYLE, STYLE_M, SIDE_NECK_M)
