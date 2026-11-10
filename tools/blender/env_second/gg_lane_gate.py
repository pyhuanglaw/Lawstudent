"""公館往溫州街那條巷子的巷口關起來（GG-LANE-CLOSE-1110，X199 配套；LAWWW2 帳號 A 2026-11-10）→ assets/models/env/second_ai/gg_lane_gate.glb（＋.json）。
使用者 X199（11-03 選擇題）：溫州街只從新生南路進出，公館往溫州街的巷口「拿掉」。LAWWW 11-10 14:21 派：遊戲已經用導航擋住＋一排盆栽（gg_lane_closed_pots），
但公館正式模型 gongguan_shops.glb 還看得到 6 m 寬的巷子往南延伸——巷口要一看就是進不去（D36：不用隱形牆、不要讓人以為能走）。導航不動。
做法：巷子裡、騎樓店面玻璃那條線（z 22）往裡 0.3 m，兩邊牆之間（x −74～−68）一道住戶的鐵門（像但不照抄：台北巷弄常見的社區巷道鐵門）：
  兩根清水混凝土門柱（貼著兩邊的牆）、深綠色烤漆鐵門（下半截鐵板＋橫向壓條、上半截直條＋頂上一排短尖頭）、地上的滑軌、門上掛白底紅字的告示牌「私人巷道 請勿進入」（字由遊戲畫：PLATE_FACE_）。
座標：公館區域（x 往東、z 往南，y 朝上；店面街 FZ＝19，騎樓 z 19～22），GLB 原點＝區域原點。
  /opt/blenv/bin/python tools/blender/env_second/gg_lane_gate.py [-- --out <glb>]"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh   # noqa: E402
from cafe_layout import uv01   # noqa: E402
import archkit as K   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/gg_lane_gate.glb'))

X0, X1 = -74.0, -68.0        # 巷子兩邊的牆（轉角公寓 x −88～−74、第一間店從 x −68 開始；zones3d.js）
ZG = 22.3                    # 門的位置：騎樓店面玻璃（z 22）往裡 0.3 m
GREEN, GREEN_D, IRON = '#2f4a3a', '#24382c', '#1f2326'
H_SOLID, H_TOP = 1.15, 2.3   # 下半截鐵板頂、門頂


def build():
    B.reset(texres=512)
    root = B.group('gg_lane_gate', props={'kind': 'gg_lane_gate', 'note': 'GG-LANE-CLOSE-1110：公館往溫州街的巷口鐵門（X199：溫州街只從新生南路進出）；導航照舊是 zones3d.js 的 blockRect／blockOutside'})
    M = {
        'post': L.pbr('glg_concrete', 'granular_concrete', tile=1.5, target='#a9a7a1', maps=('diff', 'nor'), res=256, rough_value=0.9),
        'misc': L.vc_material('glg_misc', rough=0.45),
        'board': L.flat('ck_board', '#f2f0ea', rough=0.8),
    }
    accs = {}; VC = ('misc',)
    kit = K.Kit(M, accs, 'glg_', place=(0.0, 0.0, 0.0), vc=VC)
    # 門柱：貼著兩邊的牆（0.3×0.3、2.6 m）
    for (a, b) in ((X0, X0 + 0.3), (X1 - 0.3, X1)):
        kit.box('post', a, b, 0.0, 2.6, ZG - 0.15, ZG + 0.15, skip=('bottom',))
        kit.box('post', max(X0, a - 0.02), min(X1, b + 0.02), 2.6, 2.68, ZG - 0.17, ZG + 0.17, skip=('bottom',))   # 柱頭（靠牆那一邊不凸進牆裡）
    gx0, gx1 = X0 + 0.32, X1 - 0.32
    # 地上的滑軌（鐵件）
    kit.box('misc', gx0 - 0.1, gx1 + 0.1, 0.0, 0.03, ZG - 0.04, ZG + 0.04, skip=('bottom',), col=IRON)
    # 門框
    for (a, b, y0, y1) in ((gx0, gx0 + 0.06, 0.05, H_TOP), (gx1 - 0.06, gx1, 0.05, H_TOP), (gx0, gx1, 0.05, 0.11), (gx0, gx1, H_TOP - 0.06, H_TOP), (gx0, gx1, H_SOLID - 0.03, H_SOLID + 0.03)):
        kit.box('misc', a, b, y0, y1, ZG - 0.03, ZG + 0.03, col=GREEN_D)
    # 門中間的立柱（兩扇拉門的接縫）
    xm = (gx0 + gx1) / 2
    kit.box('misc', xm - 0.03, xm + 0.03, 0.05, H_TOP, ZG - 0.035, ZG + 0.035, col=GREEN_D)
    # 下半截：鐵板＋橫向壓條（兩面）
    kit.box('misc', gx0 + 0.06, gx1 - 0.06, 0.11, H_SOLID - 0.03, ZG - 0.012, ZG + 0.012, col=GREEN)
    y = 0.3
    while y < H_SOLID - 0.1:
        kit.box('misc', gx0 + 0.06, gx1 - 0.06, y, y + 0.03, ZG - 0.02, ZG + 0.02, col=GREEN_D); y += 0.22
    # 上半截：直條＋頂上一排短尖頭
    n = int((gx1 - gx0 - 0.12) / 0.13)
    for k in range(n + 1):
        x = gx0 + 0.06 + (gx1 - gx0 - 0.12) * k / n
        if abs(x - xm) < 0.05: continue
        kit.box('misc', x - 0.012, x + 0.012, H_SOLID + 0.03, H_TOP - 0.06, ZG - 0.012, ZG + 0.012, col=GREEN)
        kit.cface('misc', [(x - 0.03, H_TOP, ZG), (x + 0.03, H_TOP, ZG), (x, H_TOP + 0.09, ZG)], (0, 0, -1), GREEN_D)
        kit.cface('misc', [(x + 0.03, H_TOP, ZG), (x - 0.03, H_TOP, ZG), (x, H_TOP + 0.09, ZG)], (0, 0, 1), GREEN_D)
    # 告示牌：掛在鐵門上半截，面向騎樓（−z），白底紅字（遊戲畫字）
    PF = K.Fr((xm, 0, ZG - 0.04), (-1, 0, 0), (0, 0, -1))
    kit.fbox('misc', PF, -0.62, 0.62, 1.42, 1.86, 0.0, 0.02, col='#d9d6cf')
    plate = Mesh('PLATE_FACE_GG_LANE', M['board']); kit.face(plate, [PF.p(-0.58, 1.46, 0.022), PF.p(0.58, 1.46, 0.022), PF.p(0.58, 1.82, 0.022), PF.p(-0.58, 1.82, 0.022)], PF.N)
    K.finish(accs, root, VC)
    uv01(plate.finish(root, uv=True, props={'text': '私人巷道 請勿進入', 'bg': '#f6f4ef', 'color': '#b3261e'}))
    VCM = L.vc_material('wz_vc_glg', rough=0.45)
    L.vc_consolidate(root, {'glg_misc': VCM})
    L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name)
    info = L.export(OUT, gpu_instances=False)
    info.update({'note': 'GG-LANE-CLOSE-1110 公館往溫州街巷口的鐵門', 'gate': {'x0': X0, 'x1': X1, 'z': ZG, 'h': H_TOP}})
    L.write_json(OUT[:-4] + '.json', info)
    return info


if __name__ == '__main__':
    print(build())
