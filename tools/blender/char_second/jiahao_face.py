"""宋家豪（econ_jiahao）的臉：沿用 h01_face（p00_face.run）＋男生的參數。
參考圖 jiahao.webp：笑得很開的學長——眼睛彎、眼尾略往下（親切）、眉毛自然、嘴寬、臉頰圓、下巴短；膚色一般偏暖（臉頰取樣約 #efc8aa）。
和韋綸同一個 VRoid 樣本（Sakurada）：差別靠這組參數＋帽子＋服裝＋身高（170／176）。"""
import p00_face as PF
import zhe_face as ZF

JIAHAO = dict(PF.MALE)
JIAHAO.update(EYE_SZ=0.66, EYE_SX=1.04, EYE_TILT=-0.05, FACE_NARROW=1.04,   # 第七版：差別再拉大——寬圓臉、眼睛小一點往下（笑起來瞇成線）   # 第六版（BB_201）：圓臉、眼尾往下（親切；待機的笑眼另外烘 Fcl_EYE_Joy）
                        # 大一點、眼尾略往下（韋綸 0.66 細、平）
              BROW_K=1.75, BROW_ARCH=0.22, BROW_TAIL=0.0030,   # 第八版：眉毛粗、尾巴往下 BROW_COL=(0.09, 0.075, 0.068), BROW_SCALE_Z=1.30,
              D_CHIN=0.0, CHIN_WIDEN=1.0, JAW_OUT=0.0090,       # 第七版：臉最寬最圓、下巴最短       # 第六版：臉更圓、下巴更短       # 臉圓、下巴短
              MOUTH_K=1.18, LIP_A=0.34)       # 第八版（BB_201 第 6 節）：嘴窄、唇色淡
WARM = (0.95, 0.87, 0.78)
SHADE_WARM = (0.97, 0.91, 0.85)


def apply(m):
    PF.run(m, JIAHAO, {'Fcl_EYE_Close': 0.0})
    print('  warm skin materials', ZF.tan_skin([m['face'], m['body']], WARM, SHADE_WARM))
