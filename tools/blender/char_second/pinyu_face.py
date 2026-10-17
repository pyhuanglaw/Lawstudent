"""曾品妤（econ_pinyu）的臉：沿用 h01_face（p00_face.run）＋參數照參考圖 pinyu.webp：
面無表情——眼睛大而黑、上眼皮重一點（看起來有點睏、不想理人）、眼尾平；直而濃的眉（近黑）；小圓臉、下巴短；嘴小、唇色淡。"""
import p00_face as PF

PINYU = dict(D_CHIN=0.006, BROW_DROP=0.0058, EYE_SX=1.02, EYE_SZ=0.66, EYE_TILT=0.02, EYE_IN=0.0029, EYE_LIFT=0.0002, CHEEK_TINT_K=0.6,
             CHIN_WIDEN=0.50, JAW_OUT=0.0030, MOUTH_K=1.40, FACE_NARROW=0.97, IRIS_FRAC=0.54,
             EYELINE_K=1.15, WING=0.0012, LASH_N=24, LASH_L=0.80, BROW_K=1.30, BROW_ARCH=0.15, BROW_COL=(0.07, 0.06, 0.058), BROW_A=0.95,
             LIP_OUT=(0.84, 0.60, 0.58), LIP_IN=(0.74, 0.46, 0.46), LIP_HI=(0.93, 0.76, 0.74), LIP_A=0.75)


def apply(m):
    PF.run(m, PINYU, {'Fcl_EYE_Natural': 0.35, 'Fcl_EYE_Close': 0.32})     # 上眼皮蓋下來一點（面無表情、有點睏）
