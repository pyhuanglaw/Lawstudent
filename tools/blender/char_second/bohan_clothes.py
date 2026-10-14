"""許柏翰（classmate_bohan）的衣服（參考圖 classmate_bohan.webp）：淺藍灰長袖襯衫（開第一顆扣子、領子、門襟＋扣子、袖口、紮進褲子）、
黑色皮帶、炭黑色西裝褲（直筒、燙痕）、白色球鞋。後背包是 src/props3d.js 的 backpack。
直接用 LAWWW 給溫書瑀做的 tools/blender/char/p05_clothes.py（h01_clothes 的襯衫身片＋自己做的領子、門襟、扣子、袖口；BodyMap 對到沈以安的比例），
只換這個檔案的 STYLE（顏色、長袖、男生的寬鬆量、白球鞋）與高度（寫在柏翰身上：HairSample_Male 樣本，和祐廷一樣——胯 0.964、脊椎 1.149、脖子 1.456）。"""
import numpy as np
import p05_clothes as P5

STYLE = dict(KNIT_RGB=np.array([158, 174, 206]) / 255.0, TROUSER_RGB=np.array([58, 58, 62]) / 255.0, BELT_RGB=np.array([34, 32, 30]) / 255.0,   # 參考圖：襯衫 #abacb5（陰影裡；受光面偏藍，第一版 (168,176,196) 在遊戲裡看起來是灰的）、褲子 #3a3a3c
             LEATHER_RGB=np.array([236, 234, 229]) / 255.0, SOLE_RGB=np.array([226, 224, 218]) / 255.0, GOLD_RGB=np.array([236, 234, 229]) / 255.0,
             SHOE_STYLE='sneaker', NECK_STYLE='V', HEM_OVER_PANTS=False, SLIM=False, TOP_TEX='linen', TROUSER_TEX='twill',
             SLEEVE_LEN=1.0, SLEEVE_K=0.70, CUFF_EASE=0.009, EASE_K=0.60, DROP_X=0.105, TOP_FIT=0.55, HEM_LOOSE=True,   # 第二版：袖子、身片收（第一版 0.78／0.72：肩膀和袖子像運動衫）
             PANTS_ELLIPSE=(0.052, 0.060), PANTS_DROP=False, PANTS_HEM_UP=0.0)   # 西裝褲：第一版 (0.060, 0.068) 像寬褲
# 西裝褲褲頭在腰（脊椎骨頭下 3.4 cm）、皮帶 3.7 cm；襯衫紮進去（下擺停在褲頭上緣）；開第一顆扣子的 V 字最低點在脖子根部下 4.4 cm（第二顆扣著）
STYLE_M = dict(PANTS_TOP=1.115, PANTS_BAND=1.078, KNIT_HEM=1.108, KNIT_HEM_TOP=1.120, V_BOTTOM=1.412, BACK_NECK_Z=1.482)   # V 字最低點：第一版 1.391 開太深
SIDE_NECK_M = (0.066, 1.492)


def apply(m):
    P5.STYLE, P5.STYLE_M, P5.SIDE_NECK_M = STYLE, STYLE_M, SIDE_NECK_M
    return P5.apply(m)
