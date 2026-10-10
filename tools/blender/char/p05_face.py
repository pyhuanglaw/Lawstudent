"""溫書瑀（heroine_05）的臉：沿用沈以安的 h01_face（p00_face.run：先等比例對到沈以安的臉、做完再轉回來），參數照參考圖 06：
成熟的鵝蛋臉（下半臉長一點、下巴收、下顎線俐落）、眼睛細長沉穩（外眼角微微上揚）、眉形有一點弧度、自然玫瑰色嘴唇；VRoid 樣本的大塊腮紅拿掉。
六位主角裡年紀最大（21 歲、法律系三年級），臉要比學妹們成熟，不是放大的少女臉。"""
import p00_face as PF

WEN = dict(D_CHIN=0.009, BROW_DROP=0.0050, EYE_SX=1.04, EYE_SZ=0.62, EYE_TILT=0.07, EYE_IN=0.0028, EYE_LIFT=0.0006, CHEEK_TINT_K=0.75,
           CHIN_WIDEN=0.42, JAW_OUT=0.0028, MOUTH_K=1.70, FACE_NARROW=0.955, IRIS_FRAC=0.50,
           EYELINE_K=1.0, WING=0.0026, LASH_N=26, LASH_L=0.9, BROW_K=1.05, BROW_ARCH=0.55, BROW_COL=(0.17, 0.12, 0.10), BROW_A=0.92,
           LIP_OUT=(0.84, 0.54, 0.54), LIP_IN=(0.74, 0.38, 0.42), LIP_HI=(0.93, 0.72, 0.72), LIP_A=0.85)


def apply(m):
    PF.run(m, WEN, {'Fcl_EYE_Natural': 0.5, 'Fcl_EYE_Close': 0.2})     # 女性樣本：和沈以安一樣的基本眼型（vrm_finish 的 FEMALE_EYES）
