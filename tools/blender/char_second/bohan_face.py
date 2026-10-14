"""許柏翰（classmate_bohan）的臉：沿用 h01_face（p00_face.run：等比例對到沈以安的臉、做完轉回來）＋男生的參數。
參考圖 classmate_bohan.webp：認真、斯文——眼睛細長（比祐廷再細一點、不上揚）、直的濃眉（略往眉心收）、鼻樑直、臉稍長、下顎線清楚但不寬；
膚色白（臉頰取樣約 #f9dec7，VRoid 原本的膚色就接近，不調）。和祐廷用同一個 VRoid 樣本，所以臉的差別要靠這組參數＋眼鏡＋髮型。"""
import p00_face as PF

BOHAN = dict(PF.MALE)
BOHAN.update(EYE_SZ=0.66, EYE_SX=1.04, EYE_TILT=0.0,          # 細長、平的眼睛（祐廷 0.72／1.06／0.03）
             D_CHIN=0.0065, CHIN_WIDEN=0.45, JAW_OUT=0.0040,  # 臉稍長、下巴不寬（祐廷 0.004／0.55／0.0048）
             BROW_K=1.50, BROW_ARCH=0.20, BROW_COL=(0.09, 0.075, 0.07), BROW_SCALE_Z=1.40,   # 直的濃眉、近黑
             MOUTH_K=1.40, LIP_A=0.55)


def apply(m):
    PF.run(m, BOHAN, {'Fcl_EYE_Close': 0.0})       # 男性樣本沒有 Fcl_EYE_Natural；眼型不烘（vrm_finish 用 MALE_EYES）
