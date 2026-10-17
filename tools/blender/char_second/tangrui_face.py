"""唐睿（econ_tangrui）的臉：沿用 h01_face（p00_face.run）＋男生的參數。
參考圖 tangrui.webp：很愛笑——眼睛大一點、眼尾略往上（笑起來彎）、眉毛自然（不是直的濃眉）、嘴寬、臉頰圓一點、下巴不尖；
膚色：一般（臉頰取樣約 #f3d2bb），VRoid 原本的膚色乘一點點暖色。和祐廷、柏翰同一個 VRoid 樣本：差別靠這組參數＋捲髮。"""
import p00_face as PF
import zhe_face as ZF

TANGRUI = dict(PF.MALE)
TANGRUI.update(EYE_SZ=0.96, EYE_SX=0.96, EYE_TILT=0.05, IRIS_FRAC=0.56,   # 第八版：差別再拉大——三個人裡眼睛最大最圓   # 第七版（BB_201：比韋綸圓、大一點；四個人同一張臉）
                       # 大一點、眼尾往上（祐廷 0.72／1.06／0.03；柏翰 0.66 細長）
               BROW_K=0.85, BROW_ARCH=0.60, BROW_A=0.80,   # 第九版：眉毛細、有弧度、淡一點 BROW_COL=(0.10, 0.085, 0.075), BROW_SCALE_Z=1.25,   # 自然的弧形眉（柏翰直的濃眉 ARCH 0.20）
               D_CHIN=0.0005, CHIN_WIDEN=0.76, JAW_OUT=0.0050, FACE_NARROW=0.97,   # 第八版：短臉、下巴短    # 第七版：臉頰再圓一點    # 下巴短、臉頰圓一點
               MOUTH_K=1.20, LIP_A=0.34)                            # 第九版（BB_201 第 6 節）：嘴窄、唇色淡（帶笑靠嘴角上翹）                            # 第七版：嘴再寬一點（全系最會講話）                            # 嘴寬（愛笑）
WARM = (0.97, 0.92, 0.86)
SHADE_WARM = (0.98, 0.95, 0.92)


def apply(m):
    PF.run(m, TANGRUI, {'Fcl_EYE_Close': 0.0})
    print('  warm skin materials', ZF.tan_skin([m['face'], m['body']], WARM, SHADE_WARM))
