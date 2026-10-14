"""小語（李語晴，yu）的臉：沿用沈以安的 h01_face（p00_face.run），參數照參考圖 yu.webp：
開朗、親切——圓一點的大眼睛（外眼角微微上揚）、自然的彎眉（深棕）、笑起來的嘴（嘴角微微上揚）、明顯一點的腮紅。
和同一個 VRoid 樣本（Sendagaya Shibu）的陳語彤區分：語彤的眼睛比較圓、溫和、內斂；小語的眉比較彎、腮紅明顯、嘴寬一點。"""
import p00_face as PF

YU = dict(D_CHIN=0.005, BROW_DROP=0.0040, EYE_SX=1.02, EYE_SZ=0.70, EYE_TILT=0.03, EYE_IN=0.0026, EYE_LIFT=0.0006, CHEEK_TINT_K=1.3,
          CHIN_WIDEN=0.58, JAW_OUT=0.0035, MOUTH_K=1.55, FACE_NARROW=0.975, IRIS_FRAC=0.52,
          EYELINE_K=0.95, WING=0.0020, LASH_N=26, LASH_L=0.9, BROW_K=1.2, BROW_ARCH=0.7, BROW_COL=(0.24, 0.16, 0.11), BROW_A=0.9,
          LIP_OUT=(0.88, 0.56, 0.54), LIP_IN=(0.78, 0.42, 0.42), LIP_HI=(0.95, 0.74, 0.72), LIP_A=0.9)


def apply(m):
    PF.run(m, YU, {'Fcl_EYE_Natural': 0.5, 'Fcl_EYE_Close': 0.2})     # 女性樣本：和沈以安一樣的基本眼型（vrm_finish 的 FEMALE_EYES）
