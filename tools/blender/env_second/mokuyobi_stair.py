"""木曜日（溫州街 B4 二樓）一樓的樓梯間 → GLB（LAWWW2 2026-11-03；AA_617 第 2 節「一樓是深綠鐵門＋往上的窄樓梯，二樓是店；樓梯走得上去」）。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/mokuyobi_stair.py [-- --out assets/models/env/second_ai/mokuyobi_stair.glb]
座標＝木曜日區域（src/mokuyobi3d.js）：x 往東、z 往南（+z＝臨街）、y 往上；一樓地板 y 0、二樓（店內）地板 y 3.2（stairWell.rise；老公寓的一樓高）。
店內是 AA 的 mokuyobi.glb（二樓地板 y 0 做的，遊戲放在 y 3.2）；這個檔只有一樓那一段：
  - 樓梯：16 階、每階 0.2 m、踏面 0.294 m（約 34°；遊戲引擎人物半徑 0.32 m 內高度差 ≤ 0.25 m，最陡約 38°），從臨街的門（z 7.0）往北爬到二樓平台（z 2.54）；實心的磨石子踏階＋踢腳＋止滑條
  - 兩側的牆（下半淺綠油漆腰牆、上半奶油色）、西牆的木扶手、東牆三個小相框（參考圖：樓梯牆上的相框）、吊燈
  - 臨街的牆（門洞 1.4 × 2.67 m：鐵門＋上面的鐵條氣窗）、兩扇打開靠在牆上的深綠鐵門、門口的地墊
  - 門外的街景卡（WALL_front_VIEW_*，遊戲照時段換貼圖）
配置只寫在 src/data/mokuyobi_layout.js 的 stairWell（rise／risers／tread／top），這裡讀同一份。參考圖 docs/story_planning/ref_images/wz_cafes/mokuyobi_ref.webp（企劃線）。"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'aa_support')); sys.path.insert(0, HERE)
import aa_kit as K   # noqa: E402
from aa_kit import L, CL, B, Mesh, g2b, bpy, Xf   # noqa: E402
K.AUTO_SEG = True

arg = K.args()
LAY = K.layout('src/data/mokuyobi_layout.js', 'MOKUYOBI_LAYOUT')
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/mokuyobi_stair.glb'))
SW = LAY['stairWell']; RISE = SW['rise']; N = SW['risers']; T = SW['tread']; R = RISE / N
X0, X1 = SW['x0'], SW['x1']                 # 樓梯間的牆面線（西牆內面、東邊隔間牆的西面）
XW0, XW1 = X0 + 0.05, X1 - 0.05             # 踏階的寬（貼牆 5 cm 留給扶手托架、腰牆的收邊）
ZF = LAY['d'] / 2                            # 臨街那面牆的內面（z 7.0）
ZB = ZF - 0.05                               # 第一階的踢腳（門檻後 5 cm）
ZT = ZB - (N - 1) * T                        # 最上面一道踢腳（＝二樓平台的南緣，z 2.54）
assert abs(ZT - SW['top']) < 0.01, (ZT, SW['top'])
DW, DH, TH = 1.4, 2.25, 0.42                 # 門洞寬、門高、氣窗高（和 wz_shopkit.housefront_v2 同一組數字：外面看到的就是這扇門）
DX = (X0 + X1) / 2
GREEN = '#2f4a3a'                            # B4 的門色（wz_street SPECS）

sh = K.Shop('mks_', 'mokuyobi_stair', LAY['w'], LAY['d'], RISE, texres=512, props={'layout': LAY['version'], 'rise': RISE}, seed=1103)
P = 'mks_'
sh.M.update({
    'step': L.pbr(P + 'terrazzo_step', 'terrazzo_tiles', tile=1.2, target='#a7a59a', normal=0.25, maps=('diff', 'nor'), res=512, rough_value=0.45),   # 老公寓的磨石子樓梯：灰、帶一點綠
    'wall': CL.soft_plaster(P + 'wall_cream', '#e2d4b6', 0.9, cull=True, tile=1.4, k=0.3),
    'dado': CL.soft_plaster(P + 'dado_green', '#9bb39a', 0.55, cull=True, tile=1.4, k=0.22),     # 腰牆：淡綠油漆（台北老公寓樓梯間常見）
    'walnut': L.pbr(P + 'walnut', 'walnut_veneer', tile=1.0, target='#5e3e29', maps=('diff',), res=256, rough_value=0.48),
    'print': K.img_mat(P + 'print', 'mok_print.png', rough=0.8),
    'shade': L.flat(P + 'milkglass', '#f6e7c8', rough=0.35, emit=B.srgb('#ffd9a0')),
    'view': K.img_mat(P + 'street_view', 'mks_street_day.png', rough=0.9, emit=0.35),
})
sh.M['bulb'] = sh.M['shade']
sh._imgkeys = {'print', 'view'}
xf0 = Xf(0, 0)

# ---------------------------------------------------------------- 踏階（實心：每一階從地面做到踏面，旁邊看不到空心）
st = sh.a('step')
for k in range(1, N):                       # 第 k 階：踏面高 k×R，z 從 ZB−k×T 到 ZB−(k−1)×T
    za, zb = ZB - k * T, ZB - (k - 1) * T
    st.box(XW0, XW1, 0.0, k * R, za, zb)
    xf0.rbox(sh.a('vcm'), XW0 + 0.04, XW1 - 0.04, k * R, k * R + 0.006, zb - 0.045, zb - 0.01, r=0.002, col='#5a5a52')   # 止滑條（銅色舊了變暗）
st.box(XW0, XW1, 0.0, RISE, ZT - 0.02, ZT)  # 最上面一道踢腳（接二樓平台）
st.box(X0 - 0.02, X1 + 0.02, -0.02, 0.0, ZB, ZF + 0.25)   # 一樓門口那一小塊地（門檻後面）
xf0.rbox(sh.a('vc'), DX - 0.45, DX + 0.45, 0.0, 0.012, ZB + 0.02, ZF - 0.02, r=0.004, col='#6a4a32')   # 地墊

# ---------------------------------------------------------------- 牆：西牆（left）、東邊隔間牆（right）、北端（平台下面）、臨街的牆（front，門洞）
DADO = 1.0
ZC = ZB - (RISE - DADO) / RISE * (ZB - ZT)     # 腰牆的斜線碰到二樓地板高度的地方
def yd(z): return min(RISE, DADO + RISE * max(0.0, min(1.0, (ZB - z) / (ZB - ZT))))
def side_wall(side, x, nx):
    """沿著樓梯的牆（只有朝樓梯的那一面，單面材質）：腰牆的上緣是一條和樓梯平行的斜線（真的樓梯間是這樣漆的），上面奶油色牆到二樓地板。nx＝牆面法線的 x（朝樓梯）"""
    zs = [ZF, ZB, ZC, SW['z0']]
    for za, zb in zip(zs, zs[1:]):
        for (key, y0a, y1a, y0b, y1b) in (('dado', 0.0, yd(za), 0.0, yd(zb)), ('wall', yd(za), RISE, yd(zb), RISE)):
            if max(y1a - y0a, y1b - y0b) < 1e-3: continue
            pts = [(x, y0a, za), (x, y0b, zb), (x, y1b, zb), (x, y1a, za)]
            if nx < 0: pts = pts[::-1]
            xf0.quad(sh.w(side, key), pts)
    hx = X0 - 0.14 if nx > 0 else X1 + 0.1   # 牆的厚度（背面、上緣看不到，只做一塊實心的，給 GLB 的外框和鏡頭）
    sh.w(side, 'wall').box(min(x, hx), max(x, hx), -0.02, 0.0, SW['z0'], ZF)
side_wall('left', X0, 1)
side_wall('right', X1, -1)
# 腰牆上緣的木條（順著斜線）
for (x_, s_) in ((X0 + 0.012, 1), (X1 - 0.012, -1)):
    Xf(0, 0).cyl(sh.a('walnut'), (x_, DADO, ZF - 0.02), (x_, DADO, ZB), 0.012, seg=6)
    Xf(0, 0).cyl(sh.a('walnut'), (x_, DADO, ZB), (x_, RISE - 0.02, ZC), 0.012, seg=6)
sh.w('back', 'wall').box(X0 - 0.14, X1 + 0.1, 0.0, RISE, SW['z0'] - 0.1, SW['z0'])   # 平台下面的牆（看不到，封住）
fw = sh.w('front', 'wall'); d0, d1 = DX - DW / 2, DX + DW / 2
fw.box(X0 - 0.14, d0, 0.0, RISE, ZF, ZF + 0.25); fw.box(d1, X1 + 0.1, 0.0, RISE, ZF, ZF + 0.25); fw.box(d0, d1, DH + TH, RISE, ZF, ZF + 0.25)
# 門框（石材，和外面的 housefront_v2 一樣凸出牆面）、氣窗的鐵條
fv = sh.w('front', 'vcm')
for (a, b) in ((d0 - 0.06, d0), (d1, d1 + 0.06)): Xf(0, 0).rbox(fv, a, b, 0.0, DH + TH, ZF - 0.03, ZF + 0.25, r=0.004, col='#8f8a80')
Xf(0, 0).rbox(fv, d0, d1, DH, DH + 0.04, ZF + 0.08, ZF + 0.12, r=0.003, col=GREEN)
for i in range(1, 9):
    bx = d0 + i * DW / 9; Xf(0, 0).rbox(fv, bx - 0.01, bx + 0.01, DH + 0.04, DH + TH, ZF + 0.09, ZF + 0.11, r=0.002, col=GREEN)
# 兩扇打開的深綠鐵門（往裡開、靠在兩側的牆上）：外框、下半實心、上半鐵條
for (hx, sg) in ((d0 + 0.02, 1), (d1 - 0.02, -1)):
    lf = Xf(hx, ZF - 0.02, -sg * math.pi / 2)   # 本地 x：從鉸鏈往室內（−z）；ry 讓門片貼著牆（法線朝樓梯中間）
    lw = DW / 2 - 0.02
    for (a, b, c, e) in ((0.0, 0.05, 0.16, DH), (lw - 0.05, lw, 0.16, DH), (0.0, lw, DH - 0.05, DH), (0.0, lw, 0.16, 1.12), (0.0, lw, 1.12, 1.17), (0.0, lw, 1.66, 1.7)):
        lf.rbox(fv, a, b, c, e, 0.0, 0.035, r=0.004, col=GREEN)
    for i in range(1, 5):
        bx = i * lw / 5; lf.rbox(fv, bx - 0.011, bx + 0.011, 1.17, DH - 0.05, 0.008, 0.028, r=0.002, col=GREEN)
    for (yy, hh) in ((0.32, 0.3), (0.72, 0.3)): lf.rbox(fv, lw * 0.18, lw * 0.82, yy, yy + hh, 0.035, 0.048, r=0.003, col='#35523f')

# ---------------------------------------------------------------- 西牆的木扶手（順著樓梯，離踏面 0.9 m）＋托架
ra = sh.a('walnut'); hx_ = X0 + 0.07
for k in range(1, N):
    za, zb = ZB - k * T, ZB - (k - 1) * T; ya, yb = k * R + 0.9, (k - 1) * R + 0.9
    Xf(0, 0).cyl(ra, (hx_, ya + R / 2, za), (hx_, yb + R / 2, zb + 0.002), 0.024, seg=8)
for k in (2, 8, 14):
    zc = ZB - (k - 0.5) * T; yc = k * R + 0.9
    Xf(0, 0).cyl(sh.a('vcm'), (X0, yc - 0.03, zc), (hx_, yc - 0.03, zc), 0.008, col='#3a3a36', seg=6)
# 東牆三個小相框（照片、明信片；參考圖的樓梯牆）
for (k, cy, w, h, cell) in ((3, 1.55, 0.32, 0.4, (5, 0)), (7, 1.6, 0.4, 0.3, (6, 0)), (11, 1.55, 0.3, 0.38, (7, 0))):
    zc = ZB - (k - 0.5) * T; y = k * R + cy
    fx = Xf(X1 - 0.012, zc, -math.pi / 2)
    fx.rbox(sh.a('vc'), -w / 2 - 0.03, w / 2 + 0.03, y - h / 2 - 0.03, y + h / 2 + 0.03, -0.015, 0.0, r=0.004, col='#3a2a1e')
    sh.img_quad(sh.a('print'), fx, 0.0, y, 0.004, w, h, K.cell_uv(*cell))
# 吊燈（樓梯口上方一盞、樓梯中段一盞：波浪邊乳白玻璃，和店裡同一款）
K.dome_pendant(sh, DX, ZB - 0.6, 2.75, r=0.15, kind='scallop', glow_size=0.5)
K.dome_pendant(sh, DX, ZB - 8 * T, 8 * R + 2.4, r=0.15, kind='scallop', glow_size=0.5)
# 二樓平台邊上的小木牌（「木曜日 2F →」的板子：字在遊戲裡畫，這裡是空白板面）
Xf(X1 - 0.015, ZB - 12.5 * T, -math.pi / 2).rbox(sh.a('walnut'), -0.22, 0.22, 12 * R + 1.25, 12 * R + 1.45, -0.02, 0.0, r=0.006)

# ---------------------------------------------------------------- 門外的街景卡（溫州街的對面：tools/blender/env_second/mokuyobi_street_view.py 渲染；離門 2.2 m）
vz = ZF + 2.4; vw = Mesh('WALL_front_VIEW_' + P + 'street_view', sh.M['view'])
xf0.quad(vw, [(DX + 2.2, -0.6, vz), (DX - 2.2, -0.6, vz), (DX - 2.2, 3.4, vz), (DX + 2.2, 3.4, vz)][::-1], uv=(1.0, 0.0, 0.0, 1.0))
vw.finish(sh.root, uv=False, props={'dir': K.DIRS['front'], 'windowView': True})

info = sh.finish(OUT, keep=lambda ob: 'VIEW' in ob.name, extra_info={'layout': LAY['version'], 'risers': N, 'rise': RISE, 'tread': T})
print(info)
