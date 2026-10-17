"""邱韋綸（econ_weilun）的臉：沿用 h01_face（p00_face.run）＋男生的參數，皮膚調成小麥色（做法和阿哲 zhe_face 一樣，只是係數不同）。
參考圖 weilun.webp：平常的表情偏酷——眼睛平、細一點（不上揚、不彎）、直的濃眉近黑、鼻樑直、下顎線硬、臉頰收；
膚色：運動曬過的小麥色，比阿哲淺一點（臉頰取樣約 #d8a582；阿哲 #d09772）。
和阿哲同一個 VRoid 樣本：差別靠這組參數＋髮型（weilun_hair）＋服裝（weilun_clothes）。"""
import p00_face as PF
import zhe_face as ZF

WEILUN = dict(PF.MALE)
WEILUN.update(EYE_SZ=0.66, EYE_SX=1.05, EYE_TILT=0.005,               # 平、細一點（阿哲照祐廷 0.72／1.06／0.02）
              BROW_K=1.70, BROW_ARCH=0.12, BROW_COL=(0.07, 0.06, 0.055), BROW_SCALE_Z=1.45,   # 直的濃眉、近黑（阿哲深棕、ARCH 0.30）
              JAW_OUT=0.0068, CHIN_WIDEN=0.50, D_CHIN=0.0058,       # 下顎線更硬、下巴不寬、臉稍長（第二版：第一版的臉太軟、太年輕）
              MOUTH_K=1.34, LIP_A=0.46,                              # 嘴平、唇色淡
              LIP_OUT=(0.78, 0.53, 0.46), LIP_IN=(0.68, 0.43, 0.38), LIP_HI=(0.86, 0.65, 0.58))
TAN = (0.89, 0.74, 0.61)          # 阿哲 (0.86, 0.70, 0.56)：淺一點
SHADE_TAN = (0.93, 0.82, 0.72)


def apply(m):
    PF.run(m, WEILUN, {'Fcl_EYE_Close': 0.0})
    print('  tan skin materials', ZF.tan_skin([m['face'], m['body']], TAN, SHADE_TAN))
