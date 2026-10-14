"""江明軒（classmate_mingxuan）的衣服（參考圖 classmate_mingxuan.webp 正面／側面／背面）：
深墨綠寬版圓領 T（棉質、短袖到手肘上面、微落肩、沒有紮：下擺蓋過褲頭到胯骨）＋中藍刷色寬直筒牛仔褲＋白色皮革球鞋（厚鞋底）。
深棕皮革郵差包（斜背）、後口袋的筆記本、左手的黑色手錶是配件（之後另外做，不在這裡）。
直接用 LAWWW 給祐廷做的 p00_clothes.run（h01_clothes：BodyMap 對到沈以安的比例做衣服、算權重、剪掉衣服下的皮膚，再轉回來），
只換這個檔案的 STYLE（顏色、短袖、寬版、牛仔褲、白球鞋）與高度（寫在明軒身上：Sakurada Fumiriya 樣本，和阿哲同一副骨架——
褲頭、領口的高度照阿哲 zhe_clothes 量過的數字）。
牛仔褲：阿哲第一版 (0.074, 0.086)＋從臀部直落在遊戲裡像喇叭褲；明軒的寬直筒取中間 (0.064, 0.074)、照腿的形狀。"""
import numpy as np
import p00_clothes as PC

GREEN = np.array([52, 66, 56]) / 255.0           # 參考圖：深墨綠（受光面 #3d4a40、陰影 #263029；toon 的底色亮一點）
DENIM = np.array([104, 126, 158]) / 255.0        # 中藍刷色（參考圖 #6a7f9e；貼圖會在大腿、膝蓋刷淡）
WHITE_LEATHER = np.array([240, 240, 236]) / 255.0
SOLE = np.array([230, 230, 226]) / 255.0
STYLE = dict(KNIT_RGB=GREEN, TROUSER_RGB=DENIM, BELT_RGB=None, LEATHER_RGB=WHITE_LEATHER, SOLE_RGB=SOLE, GOLD_RGB=WHITE_LEATHER,
             SHOE_STYLE='sneaker', NECK_STYLE='crew', HEM_OVER_PANTS=True, SLIM=False, TOP_TEX='jersey', TROUSER_TEX='denim',
             SLEEVE_LEN=0.50, SLEEVE_K=0.88, CUFF_EASE=0.022, EASE_K=0.95, DROP_X=0.122, TOP_FIT=0.0, HEM_LOOSE=True,
             PANTS_ELLIPSE=(0.064, 0.074), PANTS_DROP=False, PANTS_HEM_UP=0.0)
# 高度寫在明軒身上（Sakurada Fumiriya 樣本的單位，身高 1.89 m，遊戲裡縮到 178 cm）：褲頭照阿哲；T 恤下擺在褲頭下 10 cm（蓋住褲頭、到胯骨）；
# 圓領前中心在脖子根部（阿哲 T 恤 1.575）
STYLE_M = dict(PANTS_TOP=1.200, PANTS_BAND=1.160, KNIT_HEM=1.060, KNIT_HEM_TOP=1.075, CREW_FRONT_Z=1.578, BACK_NECK_Z=1.615)
SIDE_NECK_M = (0.066, 1.631)


def apply(m):
    obj = PC.run(m, STYLE, STYLE_M, SIDE_NECK_M)       # 物件 Clothes_H01、材質 H01_*（T 恤、牛仔褲、球鞋）
    obj.name = 'Clothes_M01'
    for mt in obj.data.materials:
        if mt and mt.name.startswith('H01_'): mt.name = 'M01_' + mt.name[4:]
    m['clothes'] = obj
    return obj
