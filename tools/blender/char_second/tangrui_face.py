"""唐睿（econ_tangrui）的臉：沿用 h01_face（p00_face.run）＋男生的參數。
參考圖 tangrui.webp：很愛笑——眼睛大一點、眼尾略往上（笑起來彎）、眉毛自然（不是直的濃眉）、嘴寬、臉頰圓一點、下巴不尖；
膚色：一般（臉頰取樣約 #f3d2bb），VRoid 原本的膚色乘一點點暖色。和祐廷、柏翰同一個 VRoid 樣本：差別靠這組參數＋捲髮。"""
import p00_face as PF
import zhe_face as ZF

TANGRUI = dict(PF.MALE)
TANGRUI.update(EYE_SZ=0.78, EYE_SX=1.06, EYE_TILT=0.045,        # 大一點、眼尾往上（祐廷 0.72／1.06／0.03；柏翰 0.66 細長）
               BROW_K=1.30, BROW_ARCH=0.42, BROW_COL=(0.10, 0.085, 0.075), BROW_SCALE_Z=1.25,   # 自然的弧形眉（柏翰直的濃眉 ARCH 0.20）
               D_CHIN=0.0030, CHIN_WIDEN=0.62, JAW_OUT=0.0036,    # 下巴短、臉頰圓一點
               MOUTH_K=1.52, LIP_A=0.60)                            # 嘴寬（愛笑）
WARM = (0.97, 0.92, 0.86)
SHADE_WARM = (0.98, 0.95, 0.92)


def apply(m):
    PF.run(m, TANGRUI, {'Fcl_EYE_Close': 0.0})
    print('  warm skin materials', ZF.tan_skin([m['face'], m['body']], WARM, SHADE_WARM))
