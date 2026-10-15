"""江明軒（classmate_mingxuan）的臉：沿用 h01_face（p00_face.run：等比例對到沈以安的臉、做完轉回來）＋男生的參數。
參考圖 classmate_mingxuan.webp：臉窄、下顎線清楚；眼睛平、有點放鬆（不是圓眼）、雙眼皮；直的濃眉、離眼睛近一點（眼神比較深）；
鼻樑直、嘴唇薄、嘴角微微上揚；膚色一般（不像阿哲是小麥色）。
和阿哲（同一個 VRoid 樣本）的差別：阿哲＝眼尾微上揚（0.02）、下巴寬（0.60）、小麥色；明軒＝眼睛平而長（0、1.08）、臉窄（0.955）、眉毛近黑、壓低一點。"""
import p00_face as PF

MINGXUAN = dict(PF.MALE)
MINGXUAN.update(EYE_TILT=0.0, EYE_SX=1.08, EYE_SZ=0.68,                       # 眼睛平、長一點、不圓（放鬆的眼神）
                BROW_K=1.60, BROW_ARCH=0.30, BROW_DROP=0.0042, BROW_SCALE_Z=1.45, BROW_COL=(0.075, 0.065, 0.065),   # 直的濃眉、近黑（髮色黑）、壓低一點
                FACE_NARROW=0.955, JAW_OUT=0.0050, CHIN_WIDEN=0.52,             # 臉窄、下顎線清楚、下巴不寬
                MOUTH_K=1.40, LIP_A=0.55,                                       # 嘴窄一點、唇色淡（男生）
                LIP_OUT=(0.80, 0.56, 0.54), LIP_IN=(0.70, 0.43, 0.42), LIP_HI=(0.88, 0.70, 0.68))


def apply(m):
    PF.run(m, MINGXUAN, {'Fcl_EYE_Close': 0.0})       # 男性樣本沒有 Fcl_EYE_Natural；眼型不烘（vrm_finish 用 MALE_EYES）
