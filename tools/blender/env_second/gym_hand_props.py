"""健身中心手上的道具（GYM-FIT-PROPS-1103；GYM-FIT-ACTIVE-1103 合併後的缺點：彎舉、推舉、深蹲、划船都是空手）
→ assets/models/char/second_ai/gym_hand_props.glb（＋.json）。LAWWW2 帳號 A，2026-11-10。用法：
  /opt/blenv/bin/python tools/blender/env_second/gym_hand_props.py [-- --out <glb>]
三個網格，原點＝握把的中心、軸線沿 +x（遊戲座標：x 右、y 上、z 前），遊戲每一格照兩隻手的位置擺（src/character3d.js gymProps）：
  gym_dumbbell   啞鈴（8 kg 的大小）：握把 0.13 m（有防滑紋的深灰）、兩端六角形黑色橡膠片（直徑 0.11、厚 0.05）、鍍鉻的端蓋；全長 0.32 m。
  gym_barbell    槓鈴（深蹲）：鍍鉻的槓 1.8 m（直徑 2.8 cm）、中間一段防滑紋、兩邊各一片 15 kg 的黑色槓片（直徑 0.38）＋一片小的彩色片、卡扣。
  gym_row_handle 划船機的拉把：0.5 m 的鋁管、兩邊黑色泡棉握把、中間往前一條拉繩的接頭（拉繩本身不做：遊戲裡從手到機器前面的距離一直在變）。"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/char/second_ai/gym_hand_props.glb'))

B.reset(texres=256)
root = B.group('gym_hand_props', props={'kind': 'gym_hand_props', 'note': 'GYM-FIT-PROPS-1103：原點＝握把中心、軸沿 +x；遊戲照兩隻手擺'})
P = 'ghp_'
M = {
    'chrome': L.flat(P + 'chrome', '#c9ccd0', rough=0.2, metal=0.45),
    'grip': L.flat(P + 'grip', '#3b3d40', rough=0.75, metal=0.3),
    'rubber': L.flat(P + 'rubber', '#1d1e20', rough=0.85),
    'red': L.flat(P + 'plate_red', '#a3272b', rough=0.6),
    'foam': L.flat(P + 'foam', '#202224', rough=0.95),
    'alu': L.flat(P + 'alu', '#9aa0a6', rough=0.35, metal=0.45),
}
groups = {}
def acc(obj, key):
    k = (obj, key)
    if k not in groups: groups[k] = Mesh(obj + '__' + key, M[key])
    return groups[k]
def cylx(obj, key, x0, x1, r, seg=16, r2=None):
    acc(obj, key).cyl((x0, 0, 0), (x1, 0, 0), r, seg=seg, r2=r2)

# ---- 啞鈴 ----
O = 'gym_dumbbell'
cylx(O, 'grip', -0.065, 0.065, 0.016, seg=12)
for x in (-0.068, 0.068): cylx(O, 'chrome', x - 0.004 if x < 0 else x, x + 0.004 if x > 0 else x - 0.0, 0.022, seg=12)
for s in (-1, 1):
    a, b = s * 0.075, s * 0.125
    cylx(O, 'rubber', min(a, b), max(a, b), 0.055, seg=6)                       # 六角形的橡膠片
    cylx(O, 'chrome', min(s * 0.125, s * 0.16), max(s * 0.125, s * 0.16), 0.03, seg=12)   # 端蓋（兩端一樣）
# ---- 槓鈴 ----
O = 'gym_barbell'
cylx(O, 'chrome', -0.9, 0.9, 0.014, seg=12)
cylx(O, 'grip', -0.4, 0.4, 0.0145, seg=12)
for s in (-1, 1):
    cylx(O, 'chrome', min(s * 0.62, s * 0.64), max(s * 0.62, s * 0.64), 0.026, seg=12)    # 擋環
    cylx(O, 'chrome', min(s * 0.64, s * 0.88), max(s * 0.64, s * 0.88), 0.025, seg=12)    # 套筒
    cylx(O, 'rubber', min(s * 0.645, s * 0.70), max(s * 0.645, s * 0.70), 0.19, seg=24)   # 15 kg 槓片
    cylx(O, 'red', min(s * 0.70, s * 0.725), max(s * 0.70, s * 0.725), 0.115, seg=20)      # 小的彩色片
    cylx(O, 'grip', min(s * 0.73, s * 0.76), max(s * 0.73, s * 0.76), 0.035, seg=10)       # 卡扣
# ---- 划船機拉把 ----
O = 'gym_row_handle'
cylx(O, 'alu', -0.25, 0.25, 0.012, seg=10)
for s in (-1, 1): cylx(O, 'foam', min(s * 0.08, s * 0.22), max(s * 0.08, s * 0.22), 0.018, seg=10)
acc(O, 'alu').cyl((0, 0, 0), (0, 0, 0.05), 0.012, seg=8)                         # 往前接拉繩的環
acc(O, 'grip').cyl((0, 0, 0.05), (0, 0, 0.07), 0.008, seg=8)

objs = {}
for (obj, key), m in groups.items():
    m.finish(root, uv=True, smooth=False)
for ob in list(root.children):
    name = ob.name.split('__')[0]
    if name not in objs:
        objs[name] = B.group(name, parent=root) if hasattr(B, 'group') else None
    ob.parent = objs[name]
info = L.export(OUT, gpu_instances=False)
info.update({'axis': '+x 是握把的方向，原點是握把中心；遊戲 src/character3d.js gymProps 照兩隻手擺',
             'props': {'gym_dumbbell': '彎舉、坐姿推舉：每隻手一個', 'gym_barbell': '深蹲：兩隻手中間', 'gym_row_handle': '划船：兩隻手中間'}})
L.write_json(OUT[:-4] + '.json', info)
print('OK', OUT, info.get('tris'))
