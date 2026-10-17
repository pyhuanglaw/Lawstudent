"""盧正勳（阿勳，econ_zhengxun）的臉：沿用 h01_face（p00_face.run）＋男生的參數。
參考圖 xun.webp：冷淡——眼睛細長、眼尾略往下（不笑時有點睏）、直的眉毛、鼻樑直、臉長、下巴尖一點、嘴小；膚色一般（臉頰取樣約 #f2d3bf）。"""
import p00_face as PF

XUN = dict(PF.MALE)
XUN.update(EYE_SZ=0.64, EYE_SX=1.07, EYE_TILT=-0.020,              # 細長、眼尾略下垂（韋綸 0.66／平、家豪 0.76／-0.015 但圓）
           BROW_K=1.45, BROW_ARCH=0.10, BROW_COL=(0.08, 0.068, 0.062), BROW_SCALE_Z=1.30,
           D_CHIN=0.0072, CHIN_WIDEN=0.42, JAW_OUT=0.0044,          # 臉長、下巴尖一點
           MOUTH_K=1.26, LIP_A=0.48)


def apply(m):
    PF.run(m, XUN, {'Fcl_EYE_Close': 0.0})
