"""吳芯慈（classmate_xinci）的臉：沿用沈以安的 h01_face（p00_face.run：先等比例對到沈以安的臉、做完再轉回來），參數照參考圖 classmate_xinci.webp：
秀氣的鵝蛋臉（下巴、下顎照沈以安的預設：第一版下巴改尖（CHIN_WIDEN 0.40 等），下巴下面露出脖子頂端的尖角）、杏仁形的眼睛（比林芷若長一點、外眼角微微上揚——「客氣但有距離」）、
比較直、輪廓清楚的眉（角色資料 brow:'sharp'）、淡淡的自然唇色、幾乎沒有腮紅。"""
import p00_face as PF

XINCI = dict(D_CHIN=0.009, BROW_DROP=0.0050, EYE_SX=1.04, EYE_SZ=0.62, EYE_TILT=0.085, EYE_IN=0.0029, EYE_LIFT=0.0006, CHEEK_TINT_K=0.8,
             CHIN_WIDEN=0.45, JAW_OUT=0.0032, MOUTH_K=1.60, FACE_NARROW=0.95, IRIS_FRAC=0.50,
             EYELINE_K=1.0, WING=0.0026, LASH_N=24, LASH_L=0.85, BROW_K=1.15, BROW_ARCH=0.5, BROW_COL=(0.17, 0.125, 0.105), BROW_A=0.92,
             LIP_OUT=(0.86, 0.60, 0.58), LIP_IN=(0.76, 0.44, 0.45), LIP_HI=(0.94, 0.76, 0.74), LIP_A=0.8)


def apply(m):
    PF.run(m, XINCI, {'Fcl_EYE_Natural': 0.5, 'Fcl_EYE_Close': 0.2})     # 女性樣本：和沈以安一樣的基本眼型（vrm_finish 的 FEMALE_EYES）
