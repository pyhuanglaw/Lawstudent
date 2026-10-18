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
             SHOE_STYLE='sneaker', NECK_STYLE='crew', HEM_OVER_PANTS=True, SLIM=False, TOP_TEX='cotton', TROUSER_TEX='twill',   # 第六版 jersey → cotton（直紋淡：第五版遊戲裡像羅紋毛衣）
            
             SLEEVE_LEN=0.95, SLEEVE_K=0.66, CUFF_EASE=0.024, EASE_K=0.62, DROP_X=0.122, TOP_FIT=0.0, HEM_LOOSE=True,
             PANTS_ELLIPSE=(0.058, 0.066), PANTS_DROP=False, PANTS_HEM_UP=0.0, PANTS_FOLLOW=True,
             # 第七版（2026-10-18，LAWWW-C 派工 ART-CH-XUN、角色美術改由 LAWWW-C 驗收）：第六版正面看像連帽衫／高領毛衣（領口一圈鼓起、肩膀一團）——
             # 生產線後來為沛珊、經濟系四人加的選項第六版都沒開：領口貼近脖子、肩膀貼著斜方肌、靠脖子那段布的上臂權重移給上胸、袖子從肩關節裡面開始、
             # T 字放下來時肩上的布不堆、羅紋窄而薄、棉 T 往下垂的皺褶（同沛珊第十五版）
             NECK_GAP=0.008, SHOULDER_SKIN=True, NECK_CALM=1.0, SLEEVE_IN=0.035, SHOULDER_SAG=0.020,
             NECK_RIB_L=0.016, NECK_RIB_T=0.0015, NECK_FOLD=(-0.004, -0.003), DRAPE=0.014)
# 第五版：袖口 1.2 → 2.4 cm（第四版袖口收緊、布料往下堆成泡泡袖：棉 T 的袖子是直的管子）；第四版：袖子 0.74 → 0.66、身片 0.78 → 0.62（第三版遊戲裡還是像毛衣）；第三版：袖子 0.86 → 0.74、袖口 2.0 → 1.3 cm、身片寬鬆 0.95 → 0.78（第二版遊戲裡袖子像泡泡袖、身片像氣球；參考圖是寬版棉 T、布料往下垂）；
# 褲管中心跟著腿走（PANTS_FOLLOW；第二版垂直的管子在 Sakurada 往內斜的腿上，褲腳張開像喇叭褲），截面 (0.054, 0.062) → (0.058, 0.066)：直筒寬褲
# 高度寫在明軒身上（Sakurada Fumiriya 樣本的單位，身高 1.89 m，遊戲裡縮到 178 cm）：褲頭照阿哲；T 恤下擺在褲頭下 10 cm（蓋住褲頭、到胯骨）；
# 圓領前中心在脖子根部（阿哲 T 恤 1.575）
STYLE_M = dict(PANTS_TOP=1.200, PANTS_BAND=1.160, KNIT_HEM=1.060, KNIT_HEM_TOP=1.075, CREW_FRONT_Z=1.570, BACK_NECK_Z=1.612)   # 第七版：圓領低一點（參考圖露出脖子根部、鎖骨上緣）
SIDE_NECK_M = (0.066, 1.631)


def apply(m):
    obj = PC.run(m, STYLE, STYLE_M, SIDE_NECK_M)       # 物件 Clothes_H01、材質 H01_*（T 恤、牛仔褲、球鞋）
    obj.name = 'Clothes_U01'
    for mt in obj.data.materials:
        if mt and mt.name.startswith('H01_'): mt.name = 'U01_' + mt.name[4:]
    m['clothes'] = obj
    return obj
