"""盧正勳（阿勳，econ_zhengxun）的衣服（參考圖 xun.webp 正面／側面／背面）：白色寬版長袖 T（圓領、落肩、袖子到手腕上面一點＝略往上推、沒有紮、下擺到胯骨）
＋卡其色直筒長褲（褲腳略堆在鞋上）＋白色球鞋。自動鉛筆是配件（之後另外做）。
LAWWW2-C 2026-10-17 第一版：直接用明軒 mingxuan_clothes 的做法（p00_clothes.run；Sakurada 樣本的高度照明軒／阿哲量過的數字），換 STYLE。"""
import numpy as np
import p00_clothes as PC

WHITE = np.array([238, 237, 232]) / 255.0       # 白色長袖 T（參考圖 #eeede8；陰影偏冷灰）
KHAKI = np.array([164, 152, 118]) / 255.0       # 卡其褲（參考圖 #a49876）
WHITE_LEATHER = np.array([240, 240, 236]) / 255.0
SOLE = np.array([230, 230, 226]) / 255.0
STYLE = dict(KNIT_RGB=WHITE, TROUSER_RGB=KHAKI, BELT_RGB=None, LEATHER_RGB=WHITE_LEATHER, SOLE_RGB=SOLE, GOLD_RGB=WHITE_LEATHER,
             SHOE_STYLE='sneaker', NECK_STYLE='crew', HEM_OVER_PANTS=True, SLIM=False, TOP_TEX='jersey', TROUSER_TEX='twill',
             SLEEVE_LEN=0.92, SLEEVE_K=0.86, CUFF_EASE=0.020, EASE_K=0.95, DROP_X=0.122, TOP_FIT=0.0, HEM_LOOSE=True,
             PANTS_ELLIPSE=(0.054, 0.062), PANTS_DROP=False, PANTS_HEM_UP=0.0)
# 高度寫在明軒身上（Sakurada Fumiriya 樣本的單位，身高 1.89 m，遊戲裡縮到 178 cm）：褲頭照阿哲；T 恤下擺在褲頭下 10 cm（蓋住褲頭、到胯骨）；
# 圓領前中心在脖子根部（阿哲 T 恤 1.575）
STYLE_M = dict(PANTS_TOP=1.200, PANTS_BAND=1.160, KNIT_HEM=1.060, KNIT_HEM_TOP=1.075, CREW_FRONT_Z=1.578, BACK_NECK_Z=1.615)
SIDE_NECK_M = (0.066, 1.631)


def apply(m):
    obj = PC.run(m, STYLE, STYLE_M, SIDE_NECK_M)       # 物件 Clothes_H01、材質 H01_*（T 恤、牛仔褲、球鞋）
    obj.name = 'Clothes_U01'
    for mt in obj.data.materials:
        if mt and mt.name.startswith('H01_'): mt.name = 'U01_' + mt.name[4:]
    m['clothes'] = obj
    return obj
