"""118 巷（ART-L118-GROUND，LAWWW-C 2026-10-18 02:10 派，v9.10）的路面貼圖：和溫州街同一套畫法（wz_road_tex.Road：程序柏油、補丁、灌縫膠、
車輪壓痕、油漬、混凝土水溝蓋＋鐵柵、人孔、手孔、熱塑標線），世界座標定位，和遊戲的導航、lane118_layout.js 一致。LAWWW2-C。
- 118 巷本身：x −3.4～3.4、z −42～36.2（巷口接進辛亥路）；兩邊水溝 38 cm、白色邊線（距路緣 0.55 m）、巷口和巷底的機車停車格（白框）、
  人孔、手孔、「慢」（靠辛亥路那一端、字頭朝南）、停止線。
- 辛亥路：x −46～46、z 36.2～46（車道；北邊的人行道 z 34～36.2 在 Blender 做）：雙黃線、白色虛線、路緣邊線、斑馬線（x −2～2，
  條紋沿車流方向：每條 4 m × 0.55 m，間距 1.2 m，和 LAWWW-C 暫代的位置一樣）、斑馬線兩側的停止線、機車停等區（白框）。
- 和平東路（巷底那一端，背景）：x −46～46、z −56～−44.2。
柏油底色照 D30（淺灰，約 #acacaa）。輸出 textures/gen/l118_road_lane.jpg、l118_road_xinhai.jpg、l118_road_heping.jpg（＋.json：世界範圍，Blender 的 UV 照這個）。
用法：python3 tools/blender/env_second/lane118_ground_tex.py"""
import json, math, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from wz_road_tex import Road, GEN   # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
src = open(os.path.join(ROOT, 'src', 'data', 'lane118_layout.js'), encoding='utf-8').read()
key = 'const LANE118_LAYOUT='; LAY = json.loads(src[src.rindex(key) + len(key):].strip().rstrip(';'))   # rindex：檔頭的註解裡也有這串字
LX0, LX1 = LAY['lane']['x0'], LAY['lane']['x1']; LZ0 = LAY['lane']['z0']
XN_Z0 = 36.2; XN_Z1 = LAY['roadSouth']['z1']            # 辛亥路的車道（北邊 34～36.2 是人行道）
HP_Z0, HP_Z1 = LAY['roadNorth']['z0'], -44.2            # 和平東路的車道（南邊 −44.2～−42 是人行道）
CROSS = LAY['roadSouth'].get('crossX', 0.0), LAY['roadSouth'].get('crossW', 4.0)
WHITE, RED, YEL = (233, 231, 225), (178, 52, 44), (222, 176, 52)


def lane():
    """118 巷：欄＝z（往南）、列＝x（列 0＝東邊）"""
    X0, X1, Z0, Z1 = LX0, LX1, LZ0, XN_Z0
    W, H = 4064, 368; pu = W / (Z1 - Z0); pv = H / (X1 - X0)
    R = Road(W, H, lambda x, z: (int(round((z - Z0) * pu)), int(round((X1 - x) * pv))), (pu + pv) / 2, seed=1181)
    R.from_px = lambda col, row: (X1 - row / pv, Z0 + col / pu)
    R.base()
    yy, xx = np.mgrid[:H, :W].astype(np.float32); wx, wz = R.from_px(xx, yy)
    for xc, wdt, dL in ((0.75, 0.3, -9.0), (-0.75, 0.3, -9.0), (2.2, 0.4, -5.0), (-2.2, 0.4, -5.0)):   # 汽車兩條輪跡、機車靠兩邊
        R.band(lambda: np.exp(-((wx - xc) / wdt) ** 2) * (0.75 + 0.25 * np.sin(wz * 0.31) * np.sin(wz * 0.12)), dL)
    R.patch(R.rect_world(1.9, -36.0, 2.6, 12.0, 0.03), dL=-9)                        # 東側管線挖補的長條
    for x0, z0, w, d in ((-2.0, -24.0, 1.6, 2.4), (0.2, -6.5, 1.8, 1.4), (-1.2, 8.0, 2.6, 3.0), (0.6, 21.0, 1.4, 1.8)):
        R.patch(R.rect_world(x0, z0, x0 + w, z0 + d), dL=R.rng.uniform(-13, -7))
    R.patch(R.rect_world(-3.3, 31.0, 3.3, 36.1, 0.04), dL=-6, seam=-13)                # 巷口整片重鋪
    for _ in range(9): R.crack(R.rng.uniform(-2.8, 2.8), R.rng.uniform(-40, 30), R.rng.uniform(0, math.pi), R.rng.uniform(0.8, 2.6))
    for _ in range(14):
        z = R.rng.uniform(-40, 32); x = R.rng.choice([-1, 1]) * R.rng.uniform(2.4, 3.0); R.stain(x, z, R.rng.uniform(0.2, 0.5), dL=R.rng.uniform(-20, -10))
    R.ao_edge(lambda: np.minimum(X1 - wx, wx - X0), width=0.4, dL=-20.0)               # 靠路緣的暗角
    R.gutter(Z0, 34.0, X1, X1 - 0.38, along='z'); R.gutter(Z0, 34.0, X0, X0 + 0.38, along='z')   # 水溝：到巷口（34）為止，巷口轉進辛亥路
    bays = [tuple(r) for r in LAY['scooters']['zRanges']]
    def edge(x):
        cuts = [Z0 + 0.6] + [v for r in bays for v in r] + [32.4]; cuts = sorted(cuts)
        for a, b in zip(cuts, cuts[1:]):
            if any(r[0] <= (a + b) / 2 <= r[1] for r in bays): continue
            red = b > 26.0 or a < -38.0                                                   # 巷口、巷底 8 m 內紅線（禁停）
            if red and a < 26.0 < b: R.line([(x, a + 0.3), (x, 26.0)], 0.1, WHITE, 0.3); R.line([(x, 26.0), (x, b - 0.3)], 0.1, RED, 0.3)
            elif red and a < -38.0 < b: R.line([(x, a + 0.3), (x, -38.0)], 0.1, RED, 0.3); R.line([(x, -38.0), (x, b - 0.3)], 0.1, WHITE, 0.3)
            else: R.line([(x, a + 0.3), (x, b - 0.3)], 0.1, RED if red else WHITE, 0.3)
    edge(X1 - 0.55); edge(X0 + 0.55)
    for (za, zb) in bays:                                                                 # 機車停車格（每格 0.85 m）
        for sd in (-1, 1):
            xo, xi = sd * (X1 - 0.4), sd * (X1 - 1.75)
            R.line([(xi, za), (xi, zb)], 0.1, WHITE, 0.35)
            for k in range(int((zb - za) / 0.85) + 1): z = za + k * 0.85; R.line([(xi, z), (xo, z)], 0.08, WHITE, 0.35)
            for k in range(int((zb - za) / 0.85)):
                if R.rng.random() < 0.6: R.stain(sd * 2.6, za + (k + 0.5) * 0.85, R.rng.uniform(0.12, 0.2), dL=R.rng.uniform(-14, -8))
    R.manhole(0.4, -28.0); R.manhole(-0.6, 4.0, r=0.38); R.manhole(0.2, 24.5)
    R.handhole(2.7, -12.0, ang=math.pi / 2); R.handhole(-2.7, 16.0, ang=math.pi / 2)
    R.text('慢', 0.0, 29.0, 2.6, 1.5, math.pi / 2)                                      # 字頭朝南（往辛亥路開的車看得懂）
    R.line([(X0 + 0.2, 35.6), (X1 - 0.2, 35.6)], 0.3, WHITE, 0.35)                      # 巷口停止線
    R.line([(X0 + 0.2, Z0 + 0.4), (X1 - 0.2, Z0 + 0.4)], 0.3, WHITE, 0.35)              # 巷底（和平東路那一端）停止線
    return R.render(os.path.join(GEN, 'l118_road_lane.jpg')), (X0, X1, Z0, Z1), 'z'


def big_road(name, Z0, Z1, seed, cross=None, center=None):
    """東西向的大馬路：欄＝x、列＝z"""
    X0, X1 = -46.0, 46.0
    W, H = 4064, int(round(4064 * (Z1 - Z0) / (X1 - X0) * 1.0)) // 8 * 8
    pu = W / (X1 - X0); pv = H / (Z1 - Z0)
    R = Road(W, H, lambda x, z: (int(round((x - X0) * pu)), int(round((z - Z0) * pv))), (pu + pv) / 2, seed=seed)
    R.from_px = lambda col, row: (X0 + col / pu, Z0 + row / pv)
    R.base()
    yy, xx = np.mgrid[:H, :W].astype(np.float32); wx, wz = R.from_px(xx, yy)
    zc = center if center is not None else (Z0 + Z1) / 2; half = (Z1 - Z0) / 2
    lanes = [Z0 + 0.25 * (Z1 - Z0), Z0 + 0.75 * (Z1 - Z0)]                                # 每個方向兩線（汽車＋機車）
    for z_ in (zc - half * 0.62, zc - half * 0.28, zc + half * 0.28, zc + half * 0.62):
        R.band(lambda: np.exp(-((wz - z_) / 0.35) ** 2) * (0.75 + 0.25 * np.sin(wx * 0.23) * np.sin(wx * 0.09)), -8.0)
    for _ in range(6):
        x0 = R.rng.uniform(-42, 38); z0 = R.rng.uniform(Z0 + 0.5, Z1 - 3.0); R.patch(R.rect_world(x0, z0, x0 + R.rng.uniform(1.4, 3.6), z0 + R.rng.uniform(1.0, 2.4)), dL=R.rng.uniform(-12, -6))
    for _ in range(8): R.crack(R.rng.uniform(-44, 44), R.rng.uniform(Z0 + 0.4, Z1 - 0.4), R.rng.uniform(0, math.pi), R.rng.uniform(0.8, 3.0))
    R.ao_edge(lambda: np.minimum(wz - Z0, Z1 - wz), width=0.35, dL=-18.0)
    cx, cw = cross if cross else (None, 0)
    def segs(a, b):
        if cx is None: return [(a, b)]
        return [(a, cx - cw / 2 - 1.0), (cx + cw / 2 + 1.0, b)]
    for (a, b) in segs(-45.5, 45.5):
        R.line([(a, zc - 0.09), (b, zc - 0.09)], 0.1, YEL, 0.25); R.line([(a, zc + 0.09), (b, zc + 0.09)], 0.1, YEL, 0.25)   # 雙黃線
        for z_ in (Z0 + 0.45, Z1 - 0.45): R.line([(a, z_), (b, z_)], 0.12, WHITE, 0.3)                                     # 路緣邊線
        for z_ in (zc - half * 0.5, zc + half * 0.5):                                                                        # 車道虛線（4 m 線、6 m 空）
            x = a + 1.0
            while x < b - 4.0: R.line([(x, z_), (x + 4.0, z_)], 0.1, WHITE, 0.32); x += 10.0
    if cx is not None:
        for z_ in np.arange(Z0 + 1.0, Z1 - 0.6, 1.2):                                    # 斑馬線
            R.line([(cx - cw / 2, z_ + 0.275), (cx + cw / 2, z_ + 0.275)], 0.55, WHITE, 0.3)
        # 台灣的路口：汽車停止線 → 機車停等區（白框，約 3.4 m 深）→ 斑馬線。往東開的在南半邊（斑馬線西邊）、往西開的在北半邊（斑馬線東邊）
        R.line([(cx - cw / 2 - 4.2, zc + 0.2), (cx - cw / 2 - 4.2, Z1 - 0.3)], 0.3, WHITE, 0.33)
        R.line([(cx + cw / 2 + 4.2, Z0 + 0.3), (cx + cw / 2 + 4.2, zc - 0.2)], 0.3, WHITE, 0.33)
        for (xa, xb, za, zb) in ((cx - cw / 2 - 3.9, cx - cw / 2 - 0.5, zc + half * 0.08, Z1 - 0.7), (cx + cw / 2 + 0.5, cx + cw / 2 + 3.9, Z0 + 0.7, zc - half * 0.08)):   # 機車停等區（白框）
            for (p, q) in (((xa, za), (xb, za)), ((xb, za), (xb, zb)), ((xb, zb), (xa, zb)), ((xa, zb), (xa, za))): R.line([p, q], 0.1, WHITE, 0.35)
    for x in (-30.0, -8.0, 14.0, 36.0): R.manhole(x + R.rng.uniform(-1, 1), zc + R.rng.choice([-1, 1]) * half * 0.5)
    out = os.path.join(GEN, 'l118_road_%s.jpg' % name)
    return R.render(out), (X0, X1, Z0, Z1), 'x'


if __name__ == '__main__':
    meta = {}
    for nm, fn in (('lane', lane), ('xinhai', lambda: big_road('xinhai', XN_Z0, XN_Z1, 1182, cross=CROSS)), ('heping', lambda: big_road('heping', HP_Z0, HP_Z1, 1183))):
        im, rect, along = fn(); meta[nm] = {'rect': rect, 'along': along, 'file': 'l118_road_%s.jpg' % nm, 'size': im.size}
    json.dump(meta, open(os.path.join(GEN, 'l118_road.json'), 'w'), indent=1); print(json.dumps(meta))
