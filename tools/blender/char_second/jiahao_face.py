"""宋家豪（econ_jiahao）的臉：沿用 h01_face（p00_face.run）＋男生的參數。
參考圖 jiahao.webp：笑得很開的學長——眼睛彎、眼尾略往下（親切）、眉毛自然、嘴寬、臉頰圓、下巴短；膚色一般偏暖（臉頰取樣約 #efc8aa）。
和韋綸同一個 VRoid 樣本（Sakurada）：差別靠這組參數＋帽子＋服裝＋身高（170／176）。"""
import p00_face as PF
import zhe_face as ZF

JIAHAO = dict(PF.MALE)
JIAHAO.update(EYE_SZ=0.76, EYE_SX=1.07, EYE_TILT=-0.015,          # 大一點、眼尾略往下（韋綸 0.66 細、平）
              BROW_K=1.35, BROW_ARCH=0.38, BROW_COL=(0.09, 0.075, 0.068), BROW_SCALE_Z=1.30,
              D_CHIN=0.0024, CHIN_WIDEN=0.66, JAW_OUT=0.0034,       # 臉圓、下巴短
              MOUTH_K=1.55, LIP_A=0.58)
WARM = (0.95, 0.87, 0.78)
SHADE_WARM = (0.97, 0.91, 0.85)


def apply(m):
    PF.run(m, JIAHAO, {'Fcl_EYE_Close': 0.0})
    print('  warm skin materials', ZF.tan_skin([m['face'], m['body']], WARM, SHADE_WARM))
