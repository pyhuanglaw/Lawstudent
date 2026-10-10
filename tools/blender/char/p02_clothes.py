"""林芷若（heroine_02）的衣服：沿用沈以安的 h01_clothes（p00_clothes.run：BodyMap 對到沈以安的比例、做完再轉回來），款式照參考圖 06：
米色亞麻短袖上衣（圓領、袖子過手肘一點、反摺袖口、下擺蓋過褲頭）、深炭灰合身九分褲（露出腳踝）、白色球鞋。圍裙、眼鏡、耳環是 props3d.js。"""
import numpy as np
import p00_clothes as PC

STYLE = dict(KNIT_RGB=np.array([222, 208, 184]) / 255.0, TROUSER_RGB=np.array([46, 45, 48]) / 255.0,
             LEATHER_RGB=np.array([238, 236, 230]) / 255.0, SOLE_RGB=np.array([228, 226, 220]) / 255.0, GOLD_RGB=np.array([238, 236, 230]) / 255.0,
             SHOE_STYLE='sneaker', NECK_STYLE='crew', HEM_OVER_PANTS=True, SLIM=True, TOP_TEX='linen',
             SLEEVE_LEN=0.55, SLEEVE_K=0.62, CUFF_EASE=0.013, EASE_K=0.55, DROP_X=0.105,   # 第二版：寬鬆量、袖子收（第一版遊戲裡像布袋、短袖像燈籠）
             PANTS_ELLIPSE=(0.050, 0.058), PANTS_DROP=False, PANTS_HEM_UP=0.06, TOP_FIT=0.65, HEM_LOOSE=True)   # 第三版：合身、下擺不收（第二版側面看前面鼓起來）
# 高度寫在林芷若身上（Victoria Rubin 樣本的單位：身高 1.715，遊戲裡縮成 161 cm）：褲頭在腰（脊椎骨頭上方一點）、上衣下擺在胯骨下面、
# 圓領前中心在脖子根部下 1.5 cm（淺圓領）
STYLE_M = dict(PANTS_TOP=1.080, PANTS_BAND=1.045, KNIT_HEM=0.950, KNIT_HEM_TOP=0.982, CREW_FRONT_Z=1.405, BACK_NECK_Z=1.428)
SIDE_NECK_M = (0.056, 1.433)   # 第三版：側頸點、後領降到脖子根部附近（第二版高 2～3 cm，遊戲裡領子立起來像帽兜）


def apply(m):
    return PC.run(m, STYLE, STYLE_M, SIDE_NECK_M)
