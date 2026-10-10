"""陳語彤（heroine_03）的臉：沿用沈以安的 h01_face（p00_face.run：先等比例對到沈以安的臉、做完再轉回來），參數照參考圖 06：
比沈以安圓一點的臉（下巴短一點、下顎線柔和）、眼睛自然大小不上揚、直眉（參考圖是平直、稍粗的眉）、小鼻子、自然唇色；VRoid 樣本的大塊腮紅拿掉。"""
import p00_face as PF

CHEN = dict(D_CHIN=0.005, BROW_DROP=0.0040, EYE_SX=1.00, EYE_SZ=0.70, EYE_TILT=0.0, EYE_IN=0.0025, EYE_LIFT=0.0005, CHEEK_TINT_K=0.7,
            CHIN_WIDEN=0.60, JAW_OUT=0.0030, MOUTH_K=1.55, FACE_NARROW=0.985, IRIS_FRAC=0.52,
            EYELINE_K=0.95, WING=0.0012, LASH_N=24, LASH_L=0.85, BROW_K=1.2, BROW_ARCH=0.25, BROW_COL=(0.14, 0.11, 0.10), BROW_A=0.95,
            LIP_OUT=(0.86, 0.58, 0.57), LIP_IN=(0.76, 0.42, 0.45), LIP_HI=(0.94, 0.76, 0.75), LIP_A=0.80)


def apply(m):
    PF.run(m, CHEN, {'Fcl_EYE_Natural': 0.5, 'Fcl_EYE_Close': 0.2})     # 女性樣本：和沈以安一樣的基本眼型（vrm_finish 的 FEMALE_EYES）
