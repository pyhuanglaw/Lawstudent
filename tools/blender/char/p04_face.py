"""高子晴（heroine_04）的臉：沿用沈以安的 h01_face（p00_face.run：先等比例對到沈以安的臉、做完再轉回來），參數照參考圖 06：
清爽的鵝蛋臉、眼睛明亮微微上揚、細直眉、自然唇色帶笑；VRoid 樣本的大塊腮紅拿掉。"""
import p00_face as PF

GAO = dict(D_CHIN=0.006, BROW_DROP=0.0040, EYE_SX=1.02, EYE_SZ=0.70, EYE_TILT=0.04, EYE_IN=0.0025, EYE_LIFT=0.0006, CHEEK_TINT_K=0.7,
           CHIN_WIDEN=0.55, JAW_OUT=0.0032, MOUTH_K=1.55, FACE_NARROW=0.97, IRIS_FRAC=0.52,
           EYELINE_K=0.95, WING=0.0018, LASH_N=24, LASH_L=0.85, BROW_K=1.05, BROW_ARCH=0.45, BROW_COL=(0.22, 0.17, 0.14), BROW_A=0.9,
           LIP_OUT=(0.87, 0.58, 0.56), LIP_IN=(0.77, 0.42, 0.44), LIP_HI=(0.95, 0.76, 0.74), LIP_A=0.80)


def apply(m):
    PF.run(m, GAO, {'Fcl_EYE_Natural': 0.5, 'Fcl_EYE_Close': 0.2})     # 女性樣本：和沈以安一樣的基本眼型（vrm_finish 的 FEMALE_EYES）
