"""杜可昕（kexin）的臉：沿用沈以安的 h01_face（p00_face.run：先等比例對到沈以安的臉、做完再轉回來），參數照參考圖 kexin.webp（偏寫實）：
柔和的鵝蛋臉（臉頰比較飽滿、下巴不尖）、溫柔的眼睛（雙眼皮、外眼角微微往下——「溫柔、有點慵懶」）、比較直的自然眉（深棕）、
比較飽滿的玫瑰色嘴唇、淡淡的腮紅。和林芷若同一個 VRoid 樣本（Victoria Rubin），兩個人的差別：
  芷若＝外眼角上揚的杏眼（EYE_TILT 0.05）、彎眉（BROW_ARCH 0.8）、臉窄一點（0.96）；可昕＝外眼角平（0）、比較直的濃眉（0.45、粗 1.45）、臉寬一點（0.975）、嘴唇飽滿、腮紅。"""
import p00_face as PF

KEXIN = dict(D_CHIN=0.006, BROW_DROP=0.0042, EYE_SX=1.03, EYE_SZ=0.70, EYE_TILT=0.0, EYE_IN=0.0027, EYE_LIFT=0.0003, CHEEK_TINT_K=1.0,   # 第二版：眼睛不往下垂（第一版 −0.015 加上細眉，看起來像在擔心）
             CHIN_WIDEN=0.60, JAW_OUT=0.0036, MOUTH_K=1.40, FACE_NARROW=0.975, IRIS_FRAC=0.52,                                          # 第二版：嘴窄一點（第一版 1.55：又寬又平）
             EYELINE_K=1.0, WING=0.0018, LASH_N=26, LASH_L=0.88, BROW_K=1.45, BROW_ARCH=0.45, BROW_SCALE_Z=1.25, BROW_COL=(0.15, 0.11, 0.095), BROW_A=0.92,   # 第二版：眉粗一點、微彎（參考圖：自然的濃眉）
             LIP_OUT=(0.84, 0.52, 0.52), LIP_IN=(0.72, 0.37, 0.40), LIP_HI=(0.93, 0.70, 0.68), LIP_A=0.95)


def apply(m):
    PF.run(m, KEXIN, {'Fcl_EYE_Natural': 0.5, 'Fcl_EYE_Close': 0.2})     # 女性樣本：和沈以安一樣的基本眼型（vrm_finish 的 FEMALE_EYES）
