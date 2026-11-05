"""同弦樂器（新生南路二樓的吉他行）的樓梯間 → GLB（LAWWW2-C 2026-11-05，GUITAR-SHOP-ZONE-1105；AA_619 第 1 節「新生南路那一排的二樓店面，一樓是手機行，樓梯口掛一把吉他」）。
Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/tongxian_stair.py [-- --out assets/models/env/second_ai/tongxian_stair.glb]
座標＝同弦的室內（CC 的 tongxian.glb、src/data/tongxian_layout.js）：x 往東、z 往南（−z＝臨街）、y 往上；二樓（店內）地板 y 0，騎樓地面 y −4.2（新生南路一樓高 groundH）。
CC 的店內模型把樓梯間（x −3.2～−1.14、z 1.0～5.2）圍起來了，裡面只有平的地板：門開著時看進去沒有樓梯。這個檔補上樓梯（店內的地板在樓梯口挖洞：tools/blender/env_second/glb_floor_hole.py）：
  - 樓梯：22 階、每階 0.191 m、踏面 0.27 m（stair.flight），從二樓平台（z 4.2）往北（往臨街那一側）往下，到騎樓的樓梯口（z −1.7）；寬 1.5 m（x −2.95～−1.45，對齊新生南路外觀的樓梯門）
    實心的磨石子踏階＋止滑條（和木曜日的樓梯同一種，台北老公寓的樓梯）
  - 兩側的牆（下半灰綠油漆腰牆、上半米白）、西牆的木扶手（離踏面 0.9 m，到平台上收進西牆）、二樓地板下面那一段的天花板（店的樓板）
  - 二樓樓梯間的西牆（x −3.2）：CC 的模型只有樓梯間的東牆（店門）、北牆，從店門看出去西邊是空的
  - 一樓的樓梯口：門洞 1.2 × 2.1 m、門外的騎樓（亮的街景卡）
  - 燈：樓梯間天花板一盞、樓板下面一盞（吸頂燈，GLOW_）
遊戲：src/tongxian3d.js 放在店內那一組（和 CC 的 tongxian.glb 同一個座標）。人不走樓梯（進出在平台上：「下樓（回新生南路）」），樓梯是看得到的那一段。"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'aa_support')); sys.path.insert(0, HERE)
import aa_kit as K   # noqa: E402
from aa_kit import L, CL, B, Mesh, g2b, bpy, Xf   # noqa: E402
K.AUTO_SEG = True

arg = K.args()
LAY = K.layout('src/data/tongxian_layout.js', 'TONGXIAN_LAYOUT')['shop']
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/tongxian_stair.glb'))
ST = LAY['stair']; FL = ST['flight']
GH = 4.2                                     # 一樓高（新生南路 facade.groundH）：騎樓地面在店內地板下 4.2 m
N = max(2, round(GH / FL['rise'])); R = GH / N; T = FL['run']
FX0, FX1 = FL['x0'], FL['x1']                # 樓梯的寬（兩側牆的內面）
ZT = FL['zTop']                              # 最上面一道踢腳（二樓平台的北緣）
ZB = ZT - (N - 1) * T                        # 最下面一道踢腳（騎樓那一端）
ZS = FL['zStart']                            # 一樓樓梯口（店面玻璃那一條線）
SZ0 = ST['z0']                               # 二樓樓梯間的北牆（CC 的模型）：以北是店的地板（樓梯在樓板下面）
SLAB = 0.22                                  # 店的樓板厚（地板 0.02＋樓板）
DX = (FX0 + FX1) / 2; DW, DH = 1.2, 2.1      # 一樓的門洞（xinsheng_layout.js 的 door.w；門高照一般住宅）
DADO = 1.0                                   # 腰牆高（離踏面）
assert ZB > ZS - 0.01, (ZB, ZS)

sh = K.Shop('txs_', 'tongxian_stair', LAY['w'], LAY['d'], LAY['h'], texres=512, props={'layout': 4, 'risers': N, 'rise': round(R, 4), 'tread': T}, seed=1105)
P = 'txs_'
sh.M.update({
    'step': L.pbr(P + 'terrazzo_step', 'terrazzo_tiles', tile=1.2, target='#a9a79e', normal=0.25, maps=('diff', 'nor'), res=512, rough_value=0.45),
    'wall': CL.soft_plaster(P + 'wall_cream', '#e6dcc8', 0.9, cull=True, tile=1.4, k=0.3),
    'dado': CL.soft_plaster(P + 'dado_grey', '#a8b0a3', 0.55, cull=True, tile=1.4, k=0.22),     # 腰牆：灰綠油漆（台北老公寓樓梯間）
    'ceil': CL.soft_plaster(P + 'ceil', '#ece6da', 0.9, cull=True, tile=1.6, k=0.2),
    'walnut': L.pbr(P + 'walnut', 'walnut_veneer', tile=1.0, target='#5e3e29', maps=('diff',), res=256, rough_value=0.48),
    'shade': L.flat(P + 'milkglass', '#f6eddc', rough=0.35, emit=B.srgb('#ffe2b8')),
    'street': L.flat(P + 'arcade_light', '#d9d2c2', rough=0.9, emit=B.srgb('#cfc6b2')),      # 樓梯口外面的騎樓（白天的亮）
})
xf0 = Xf(0, 0)
y_of = lambda j: -j * R                      # 第 j 階（從平台往下數）的踏面高

# ---------------------------------------------------------------- 踏階（實心：每一階從騎樓地面做到踏面）
st = sh.a('step')
for j in range(1, N):                        # 第 j 階：踏面 y −j×R，z 從 ZT−j×T 到 ZT−(j−1)×T
    za, zb = ZT - j * T, ZT - (j - 1) * T
    st.box(FX0, FX1, -GH, y_of(j), za, zb)
    xf0.rbox(sh.a('vcm'), FX0 + 0.05, FX1 - 0.05, y_of(j), y_of(j) + 0.006, za + 0.01, za + 0.045, r=0.002, col='#5a5a52')   # 止滑條（踏面靠下一階那一邊）
st.box(FX0, FX1, -GH - 0.02, -GH, ZS - 0.3, ZB)   # 一樓樓梯口那一小塊地（到門外 0.3 m）
st.box(FX0, FX1, -SLAB, 0.0, ZT, ZT + 0.02)       # 最上面一道踢腳（接二樓平台：店的地板在 y 0）

# ---------------------------------------------------------------- 兩側的牆（朝樓梯那一面；腰牆上緣是一條和樓梯平行的斜線，照木曜日的樓梯間）
ZC = ZT - DADO * T / R                       # 腰牆上緣碰到店的地板（y 0）的地方：以南整面都是腰牆
def yline(z):
    """踏階前緣連成的斜線（平台 y 0、最下面一階 −(N−1)R）；樓梯口以北是騎樓的地面"""
    return -GH if z <= ZB else -(ZT - z) / T * R
def wtop(z): return 0.0 if z >= SZ0 - 1e-6 else -SLAB   # 二樓樓梯間（z ≥ 1.0）牆做到店的地板；以北是樓板下面（天花板 −0.22）
def side_wall(x, nx):
    zs = sorted(set([ZS - 0.3, ZB, SZ0, ZC, ZT]))
    for za, zb in zip(zs, zs[1:]):
        top = wtop((za + zb) / 2); ya, yb = min(top, yline(za) + DADO), min(top, yline(zb) + DADO)
        if za < ZB < zb or zb <= ZB: ya, yb = min(top, -GH + DADO), min(top, -GH + DADO)
        for (key, q) in (('dado', [(x, -GH, za), (x, -GH, zb), (x, yb, zb), (x, ya, za)]), ('wall', [(x, ya, za), (x, yb, zb), (x, top, zb), (x, top, za)])):
            if max(q[3][1] - q[0][1], q[2][1] - q[1][1]) < 1e-3: continue
            xf0.quad(sh.a(key), q if nx > 0 else q[::-1])
side_wall(FX0, 1)
side_wall(FX1, -1)
# 牆的厚度（背面看不到，只做一塊實心的頂：二樓平台旁邊的那一條，和 CC 的地板接）
sh.a('wall').box(FX0 - 0.12, FX0, -0.02, 0.0, ZS - 0.3, ZT); sh.a('wall').box(FX1, FX1 + 0.12, -0.02, 0.0, ZS - 0.3, ZT)
# 腰牆上緣的木條（順著斜線）
for x_ in (FX0 + 0.012, FX1 - 0.012):
    xf0.cyl(sh.a('walnut'), (x_, -GH + DADO, ZS - 0.28), (x_, -GH + DADO, ZB), 0.011, seg=6)
    xf0.cyl(sh.a('walnut'), (x_, -GH + DADO, ZB), (x_, yline(ZB + 0.02) + DADO, ZB + 0.02), 0.011, seg=6)
    xf0.cyl(sh.a('walnut'), (x_, yline(ZB + 0.02) + DADO, ZB + 0.02), (x_, -0.012, ZC - 0.012 * T / R), 0.011, seg=6)
# 二樓地板下面那一段的天花板（店的樓板；z 1.0 以北）＋樓梯間的天花板在 CC 的模型裡
sh.a('ceil').box(FX0, FX1, -SLAB - 0.005, -SLAB, ZS - 0.3, SZ0)
sh.a('wall').box(FX0, FX1, -SLAB, -0.02, SZ0 - 0.12, SZ0)   # 樓板的邊（二樓樓梯間北牆的下面）

# 二樓樓梯間的西牆（隔壁那一棟的牆，x −3.2）：CC 的模型只做了樓梯間的東牆（門）、北牆，西邊是空的——從店門看出去是黑的。整面米白（腰牆只在樓梯兩側）
XW_ = -LAY['w'] / 2; HH = LAY['h']
xf0.quad(sh.a('wall'), [(XW_, 0.0, SZ0), (XW_, 0.0, ST['z1']), (XW_, HH, ST['z1']), (XW_, HH, SZ0)])   # 整面米白（和店裡的牆一樣）
sh.a('wall').box(XW_ - 0.12, XW_, 0.0, HH, SZ0, ST['z1'])   # 牆的厚度（外面看不到）
xf0.rbox(sh.a('vcm'), XW_, XW_ + 0.012, 0.0, 0.08, ZT, ST['z1'] - 0.01, r=0.002, col='#6e5a44')        # 踢腳板（平台那一段）

# ---------------------------------------------------------------- 一樓的樓梯口（臨街那一面牆：門洞）、門外的騎樓
d0, d1 = DX - DW / 2, DX + DW / 2; fw = sh.a('wall'); zw = ZS - 0.3
fw.box(FX0 - 0.12, d0, -GH, -SLAB, zw - 0.14, zw); fw.box(d1, FX1 + 0.12, -GH, -SLAB, zw - 0.14, zw); fw.box(d0, d1, -GH + DH, -SLAB, zw - 0.14, zw)
for (a, b) in ((d0 - 0.05, d0), (d1, d1 + 0.05)): xf0.rbox(sh.a('vcm'), a, b, -GH, -GH + DH + 0.05, zw - 0.16, zw + 0.02, r=0.004, col='#8f8a80')   # 門框
xf0.rbox(sh.a('vcm'), d0 - 0.05, d1 + 0.05, -GH + DH, -GH + DH + 0.05, zw - 0.16, zw + 0.02, r=0.004, col='#8f8a80')
vz = zw - 1.2; sv = sh.a('street')
xf0.quad(sv, [(d1 + 0.8, -GH - 0.2, vz), (d0 - 0.8, -GH - 0.2, vz), (d0 - 0.8, -GH + DH + 0.6, vz), (d1 + 0.8, -GH + DH + 0.6, vz)][::-1])

# ---------------------------------------------------------------- 西牆的木扶手（順著樓梯，離踏面 0.9 m）＋托架；平台上收頭（往下彎進牆）
ra = sh.a('walnut'); hx = FX0 + 0.07
for j in range(1, N):
    za, zb = ZT - j * T, ZT - (j - 1) * T
    xf0.cyl(ra, (hx, y_of(j) + 0.9 - R / 2, za), (hx, y_of(j - 1) + 0.9 - R / 2 if j > 1 else 0.9, zb + 0.002), 0.024, seg=8)
XW = XW_                                     # 二樓平台旁邊的西牆（上面補的；樓梯的西牆 FX0 只做到店的地板）
xf0.cyl(ra, (hx, 0.9, ZT), (hx, 0.9, ZT + 0.25), 0.024, seg=8); xf0.cyl(ra, (hx, 0.9, ZT + 0.25), (XW, 0.9, ZT + 0.25), 0.022, seg=8)   # 平台上收頭：水平彎進西牆
xf0.cyl(sh.a('vcm'), (XW, 0.9, ZT + 0.25), (XW + 0.008, 0.9, ZT + 0.25), 0.04, col='#3a3a36', seg=12)                                                                   # 牆上的圓座
for j in (3, 9, 15, 20):
    zc = ZT - (j - 0.5) * T; yc = y_of(j) + 0.9 - 0.03
    xf0.cyl(sh.a('vcm'), (FX0, yc, zc), (hx, yc, zc), 0.008, col='#3a3a36', seg=6)
# 樓梯口牆上的小木牌（「同弦樂器 2F」的板子：字在外觀的招牌上，這裡是空白板面；AA_619「樓梯口掛一把吉他」在騎樓那一面，外觀模型有）
Xf(FX1 - 0.012, ZB + 0.55, -math.pi / 2).rbox(sh.a('walnut'), -0.22, 0.22, -GH + 1.55, -GH + 1.8, -0.02, 0.0, r=0.006)

# ---------------------------------------------------------------- 燈（吸頂燈：樓梯間天花板、樓板下面）
for (x, y, z, r) in ((DX, LAY['h'] - 0.01, (SZ0 + ZT) / 2, 0.16), (DX, -SLAB - 0.006, (ZS + SZ0) / 2, 0.13)):
    xf0.cyl(sh.a('shade'), (x, y, z), (x, y - 0.05, z), r, seg=16)
    g = B.group(f'GLOW_{P}lamp_{"up" if y > 0 else "low"}', sh.root, {'glow': 'rgba(255,226,184,1)', 'size': 0.7, 'day': 0.35, 'night': 1.0}); g.location = g2b(x, y - 0.08, z)

info = sh.finish(OUT, extra_info={'layout': 4, 'risers': N, 'rise': round(R, 4), 'tread': T, 'zTop': ZT, 'zBottom': round(ZB, 3)})
print(info)
