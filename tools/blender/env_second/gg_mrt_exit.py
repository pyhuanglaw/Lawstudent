"""捷運公館站出口（玻璃亭）→ assets/models/env/second_ai/gongguan_mrt_exit.glb（ART-EXT-MRT；LAWWW2-C 2026-10-18，使用者 10-18 03:3x「四座全部改」）。
  /opt/blenv/bin/python tools/blender/env_second/gg_mrt_exit.py [-- --out 輸出.glb]
座標＝套件 TK.mrtExit 自己的座標（遊戲裡同一個位置、方向放）：入口在 z=0、朝 +z，亭子往 −z 延伸 L；地面 y=0。
  公館 (−36.6, 0, 11) rotation.y=π/2；校園背景（校門外）也有一座 (−181, 0, −36.6)。
原本（套件）：花崗石矮牆＋玻璃＋半透明弧形屋頂；裡面的電扶梯是一張貼圖。
現在：
  - 花崗石牆座（不鏽鋼壓頂）、細鋁框玻璃（每 1.3 m 一根直框、一道橫框）；
  - 銀色鋁板弧形屋頂（前面挑出 0.6 m、封簷板、兩側排水溝）＋中間一條玻璃天窗；
  - 入口上方的站名燈箱（SIGN_FACE_*：遊戲畫字「捷運 公館站／出口 2」，深藍底白字，沒有標誌，D77）、入口的導盲磚、不鏽鋼擋車柱；
  - 裡面：左邊電扶梯（兩側玻璃欄板、黑色扶手帶、梳齒板）、右邊樓梯（不鏽鋼扶手），往下 30° 到 −3.4 m 的平台（亮的地板、後牆、燈）。
    地面以下的部分（PIT_*）要從地面的「洞」看得到：遊戲端先畫 PIT_*（renderOrder −2），再畫 PITMASK（只寫深度、不寫顏色，renderOrder −1），
    之後畫的區域地面在洞口那一塊深度比較遠、畫不上去——不用改區域的地面。
材質名稱：wz_lamp_lens（燈，夜間亮）、mrt_*。"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, bpy, g2b   # noqa: E402
from cafe_layout import uv01   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/gongguan_mrt_exit.glb'
W, Lg, H = 3.4, 6.4, 2.7                  # 和套件一樣：寬、長、玻璃牆高
FY = 0.07                                 # 亭子裡的地板（比人行道高一點：洞口的深度遮罩在這個高度）
SLOPE = math.radians(30.0)
OP = dict(x0=-1.36, x1=1.36, z0=-0.95, z1=-Lg + 0.35)   # 往下的洞口（電扶梯＋樓梯）
DEPTH = (OP['z0'] - OP['z1']) * math.tan(SLOPE)         # 洞口裡最後一階的深度（約 −3.0 m）


def glow(root, name, x, y, z, color, size, day, night):
    o = B.group(name, parent=root, props={'glow': color, 'size': size, 'day': day, 'night': night}); o.location = g2b(x, y, z); return o


def build():
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=512)
    root = B.group('gongguan_mrt_exit', props={'kind': 'mrt_exit'})
    M = {
        'granite': L.pbr('mrt_granite', 'granite_tile_03', tile=1.0, target='#8c8e90', maps=('diff',), res=512, rough_value=0.7),
        'granite_d': L.flat('mrt_granite_dark', '#4a4c50', rough=0.6),
        'steel': L.flat('mrt_steel', '#c3c7cc', rough=0.25, metal=0.45),
        'alu': L.flat('mrt_alu', '#b6bbc1', rough=0.35, metal=0.4),
        'alu_dk': L.flat('mrt_alu_dark', '#5d6268', rough=0.4, metal=0.35),
        'glass': L.flat('mrt_glass', '#b9ccd4', rough=0.05, alpha=0.26),
        'sky': L.flat('mrt_skylight', '#cfe0e8', rough=0.05, alpha=0.45),
        'black': L.flat('mrt_black', '#1c1d20', rough=0.5),
        'yellow': L.flat('mrt_tactile', '#e0b43a', rough=0.7),
        'floor_lit': L.flat('mrt_floor_lit', '#d9d6cf', rough=0.5),
        'wall_lit': L.flat('mrt_wall_lit', '#eae7e0', rough=0.6),
        'lamp': L.flat('wz_lamp_lens', '#f3ead6', rough=0.4),
        'board': L.flat('mrt_board', '#1f3b63', rough=0.6),
        'mask': L.flat('mrt_pitmask', '#000000', rough=1.0),
    }
    X0, X1 = -W / 2, W / 2; T = 0.28
    # ---- 牆座（花崗石）、不鏽鋼壓頂 ----
    gr = Mesh('mrt_base', M['granite']); st = Mesh('mrt_cap', M['steel'])
    for sx in (-1, 1):
        x = sx * (W / 2 - T / 2); gr.box(x - T / 2, x + T / 2, 0, 0.95, -Lg, 0.0); st.box(x - T / 2 - 0.02, x + T / 2 + 0.02, 0.95, 0.99, -Lg - 0.02, 0.02)
    gr.box(X0, X1, 0, 0.95, -Lg, -Lg + T); st.box(X0 - 0.02, X1 + 0.02, 0.95, 0.99, -Lg - 0.02, -Lg + T + 0.02)
    gr.finish(root); st.finish(root)
    # ---- 玻璃牆、鋁框 ----
    gl = Mesh('mrt_glass', M['glass']); al = Mesh('mrt_frame', M['alu'])
    n = round((Lg - 0.2) / 1.3)
    for sx in (-1, 1):
        x = sx * (W / 2 - T / 2)
        gl.quad([(x, 0.99, -0.1), (x, 0.99, -Lg + 0.1), (x, H, -Lg + 0.1), (x, H, -0.1)])
        for k in range(n + 1):
            z = -0.1 - (Lg - 0.2) * k / n; al.box(x - 0.035, x + 0.035, 0.99, H, z - 0.035, z + 0.035)
        al.box(x - 0.04, x + 0.04, 1.95, 1.99, -Lg + 0.1, -0.1); al.box(x - 0.05, x + 0.05, H - 0.04, H + 0.04, -Lg - 0.05, 0.05)
    gl.quad([(X0 + T, 0.99, -Lg + T / 2), (X1 - T, 0.99, -Lg + T / 2), (X1 - T, H, -Lg + T / 2), (X0 + T, H, -Lg + T / 2)])
    for x in (X0 + T, 0.0, X1 - T): al.box(x - 0.035, x + 0.035, 0.99, H, -Lg + T / 2 - 0.035, -Lg + T / 2 + 0.035)
    al.box(X0, X1, H - 0.04, H + 0.04, -Lg + T / 2 - 0.05, -Lg + T / 2 + 0.05)
    gl.finish(root, uv=False)
    # ---- 弧形屋頂（鋁板）＋中間玻璃天窗、封簷板、排水溝 ----
    R = 4.2; hw = W / 2 + 0.32; half = math.asin(hw / R); top = H + 0.62; cy = top - R; zf, zb = 0.6, -Lg - 0.2
    rf = Mesh('mrt_roof', M['alu']); sk = Mesh('mrt_sky', M['sky']); dk = Mesh('mrt_roof_under', M['alu_dk'])
    segs = 16
    for k in range(segs):
        a0 = -half + 2 * half * k / segs; a1 = -half + 2 * half * (k + 1) / segs
        p0 = (R * math.sin(a0), cy + R * math.cos(a0)); p1 = (R * math.sin(a1), cy + R * math.cos(a1))
        mid = (a0 + a1) / 2; m_ = sk if abs(R * math.sin(mid)) < 0.42 else rf
        m_.quad([(p0[0], p0[1], zf), (p1[0], p1[1], zf), (p1[0], p1[1], zb), (p0[0], p0[1], zb)][::-1])           # 上面（朝外）
        dk.quad([(p0[0], p0[1] - 0.08, zf), (p1[0], p1[1] - 0.08, zf), (p1[0], p1[1] - 0.08, zb), (p0[0], p0[1] - 0.08, zb)])   # 下面
    for z in (zf, zb):                                                                                     # 前後封簷板（弧形的帶）
        for k in range(segs):
            a0 = -half + 2 * half * k / segs; a1 = -half + 2 * half * (k + 1) / segs
            p0 = (R * math.sin(a0), cy + R * math.cos(a0)); p1 = (R * math.sin(a1), cy + R * math.cos(a1))
            rf.quad([(p0[0], p0[1] - 0.16, z), (p1[0], p1[1] - 0.16, z), (p1[0], p1[1], z), (p0[0], p0[1], z)][:: (1 if z > 0 else -1)])
    for zz in [zf - 0.05] + [-(Lg) * k / 5 for k in range(6)]:                                            # 弧形鋼拱（每 1.3 m）
        for k in range(segs):
            a0 = -half + 2 * half * k / segs; a1 = -half + 2 * half * (k + 1) / segs
            dk.box(min(R * math.sin(a0), R * math.sin(a1)), max(R * math.sin(a0), R * math.sin(a1)), cy + R * math.cos(max(abs(a0), abs(a1))) - 0.2, cy + R * math.cos(max(abs(a0), abs(a1))) - 0.08, zz - 0.04, zz + 0.04)
    for sx in (-1, 1): al.box(sx * hw - 0.08, sx * hw + 0.04 * 0, cy + R * math.cos(half) - 0.22, cy + R * math.cos(half) - 0.08, zb, zf)   # 排水溝
    rf.finish(root, uv=False, smooth=True); sk.finish(root, uv=False); dk.finish(root, uv=False)
    al.finish(root)
    # ---- 站名燈箱（遊戲畫字）、入口的導盲磚、擋車柱 ----
    bx = Mesh('mrt_signbox', M['alu_dk']); bx.box(X0 - 0.15, X1 + 0.15, H - 0.02, H + 0.52, zf + 0.02, zf + 0.22); bx.finish(root)   # 燈箱掛在屋頂前緣的封簷板前面（第一版在封簷板後面，被擋住）
    sf = Mesh('SIGN_FACE_mrt', M['board']); sf.quad([(X0 - 0.1, H + 0.02, zf + 0.225), (X1 + 0.1, H + 0.02, zf + 0.225), (X1 + 0.1, H + 0.48, zf + 0.225), (X0 - 0.1, H + 0.48, zf + 0.225)])
    uv01(sf.finish(root, uv=True, props={'sign': '捷運 公館站', 'sub': '出口 2', 'bg': '#1f3b63', 'color': '#ffffff'}))   # 字牌 UV 0..1（遊戲照 UV 貼 canvas 字）
    glow(root, 'GLOW_mrt_sign', 0.0, H + 0.25, zf + 0.6, 'rgba(220,235,255,1)', 3.0, 0.0, 0.7)
    ye = Mesh('mrt_tactile', M['yellow']); ye.box(X0 + T, X1 - T, FY, FY + 0.012, -0.62, -0.32); ye.box(X0 + 0.3, X1 - 0.3, 0.0, 0.03, 0.25, 0.55); ye.finish(root)
    for x in (X0 - 0.5, X1 + 0.5):
        b_ = Mesh('mrt_bollard', M['steel']); b_.cyl((x, 0.0, 0.6), (x, 0.9, 0.6), 0.07, seg=14); b_.finish(root, uv=False, smooth=True)
    # ---- 亭子裡的地板（洞口以外）、入口的門檻 ----
    fl = Mesh('mrt_floor', M['granite_d'])
    fl.box(X0 + T, X1 - T, 0.0, FY, -0.32, 0.0)
    fl.box(X0 + T, X1 - T, 0.0, FY, -Lg + T, OP['z1'])
    for xa, xb in ((X0 + T, OP['x0']), (OP['x1'], X1 - T)): fl.box(xa, xb, 0.0, FY, OP['z1'], -0.32)
    fl.box(X0 + T, X1 - T, 0.0, FY, OP['z0'], -0.32)
    fl.finish(root)
    # ---- 地面以下（PIT_*）：電扶梯（左）、樓梯（右）、井道的牆、下面的平台 ----
    zt = OP['z0']; yb = -DEPTH; xm = -0.15
    def ystep(z): return -(zt - z) * math.tan(SLOPE)
    pit_w = Mesh('PIT_walls', M['granite_d']); pit_s = Mesh('PIT_steps', M['steel']); pit_b = Mesh('PIT_black', M['black']); pit_g = Mesh('PIT_glass', M['glass'])
    pit_f = Mesh('PIT_floor', M['floor_lit']); pit_l = Mesh('PIT_light', M['wall_lit']); pit_lamp = Mesh('PIT_lamp', M['lamp'])
    # 井道兩側、後面的牆（一直到平台以下）、井道的天花板（地面下 0.05 那一層不要，洞口看得到上面的屋頂）
    pit_w.box(OP['x0'] - 0.2, OP['x0'], yb - 0.2, FY - 0.001, OP['z1'] - 2.4, OP['z0']); pit_w.box(OP['x1'], OP['x1'] + 0.2, yb - 0.2, FY - 0.001, OP['z1'] - 2.4, OP['z0'])
    pit_w.box(OP['x0'] - 0.2, OP['x1'] + 0.2, yb - 0.2, FY - 0.001, OP['z0'], OP['z0'] + 0.2)
    # 斜的天花板（樓梯上方，從洞口後緣往下）
    pit_w.quad([(OP['x0'], -0.05, OP['z1']), (OP['x1'], -0.05, OP['z1']), (OP['x1'], yb + 2.6, OP['z1'] - 2.4), (OP['x0'], yb + 2.6, OP['z1'] - 2.4)][::-1])
    # 電扶梯（x0..xm）：一階一階、兩側玻璃欄板＋黑色扶手帶
    nst = int((zt - OP['z1']) / 0.4) + 6
    for k in range(nst):
        z0_ = zt - k * 0.4; z1_ = z0_ - 0.4; y0_ = ystep(z0_); y1_ = ystep(z1_)
        if y1_ < yb: y1_ = yb
        pit_s.box(OP['x0'] + 0.12, xm - 0.12, y1_ - 0.02, y0_, z1_, z0_)
        pit_b.box(xm + 0.12, OP['x1'] - 0.05, y1_ - 0.02, y0_ - 0.0, z1_, z0_) if False else None
    for xx in (OP['x0'] + 0.06, xm - 0.06):
        pit_g.quad([(xx, FY, zt), (xx, FY, zt - 0.2), (xx, ystep(OP['z1'] - 2.2) + 0.95, OP['z1'] - 2.2), (xx, ystep(OP['z1'] - 2.2), OP['z1'] - 2.2)])
        pit_b.cyl((xx, FY + 0.95, zt + 0.25), (xx, ystep(OP['z1'] - 2.2) + 0.95, OP['z1'] - 2.2), 0.04, seg=6)
    pit_s.box(OP['x0'] + 0.08, xm - 0.08, FY - 0.03, FY, zt - 0.05, zt + 0.25)                            # 梳齒板（入口那一頭，地面上）
    # 樓梯（xm..x1）：踏面＋踢面、中間的不鏽鋼扶手
    for k in range(nst):
        z0_ = zt - k * 0.3; y0_ = ystep(z0_)
        if y0_ < yb: break
        pit_w.box(xm, OP['x1'], y0_ - 0.17, y0_, z0_ - 0.3, z0_)
        pit_s.box(xm, OP['x1'], y0_ - 0.012, y0_ + 0.002, z0_ - 0.06, z0_)
    for xx in (xm + 0.04, OP['x1'] - 0.05):
        pit_s.cyl((xx, FY + 0.9, zt + 0.2), (xx, ystep(OP['z1'] - 2.2) + 0.9, OP['z1'] - 2.2), 0.025, seg=8)
    # 下面的平台（亮）、後牆、燈
    zl = zt - DEPTH / math.tan(SLOPE)
    pit_f.box(OP['x0'] - 0.2, OP['x1'] + 0.2, yb - 0.2, yb, zl - 3.0, zl + 0.1)
    pit_l.quad([(OP['x0'] - 0.2, yb, zl - 2.9), (OP['x1'] + 0.2, yb, zl - 2.9), (OP['x1'] + 0.2, yb + 2.6, zl - 2.9), (OP['x0'] - 0.2, yb + 2.6, zl - 2.9)])
    for sx in (OP['x0'] + 0.02, OP['x1'] - 0.02):                                                       # 井道兩側的燈條（往下）
        pit_lamp.quad([(sx, ystep(OP['z0'] - 0.6) + 2.2, OP['z0'] - 0.6), (sx, ystep(OP['z0'] - 0.6) + 2.3, OP['z0'] - 0.6), (sx, ystep(OP['z1'] - 2.2) + 2.3, OP['z1'] - 2.2), (sx, ystep(OP['z1'] - 2.2) + 2.2, OP['z1'] - 2.2)][:: (1 if sx > 0 else -1)])
    for m_ in (pit_w, pit_s, pit_b, pit_g, pit_f, pit_l, pit_lamp): m_.finish(root, uv=(m_ is pit_w))
    glow(root, 'GLOW_mrt_pit', 0.0, yb + 1.6, zl - 1.5, 'rgba(255,248,232,1)', 2.4, 0.5, 0.9)
    # 洞口的深度遮罩（遊戲端：只寫深度、不寫顏色）
    mk = Mesh('PITMASK', M['mask']); mk.quad([(OP['x0'], FY, OP['z0']), (OP['x1'], FY, OP['z0']), (OP['x1'], FY, OP['z1']), (OP['x0'], FY, OP['z1'])]); mk.finish(root, uv=False)   # 朝上（第一版反了：從上面看被背面剔除，地面照樣畫上去）
    # 屋頂下的燈（亭子裡，晚上亮）
    for z in (-1.6, -4.0):
        lp = Mesh('mrt_lamp', M['lamp']); lp.box(-0.5, 0.5, top - 0.32, top - 0.28, z - 0.08, z + 0.08); lp.finish(root, uv=False)
        glow(root, f'GLOW_mrt_in{int(-z)}', 0.0, top - 0.5, z, 'rgba(250,250,255,1)', 1.8, 0.0, 0.8)
    st_ = L.export(out, gpu_instances=False)
    L.write_json(out.replace('.glb', '.json'), {'glb': os.path.relpath(out, L.ROOT), 'bytes': st_['bytes'], 'tris': st_['tris'], 'size': [W, Lg, H],
        'origin': '入口在 z=0、朝 +z；和 TK.mrtExit 同一個座標', 'pit': {'opening': OP, 'depth': DEPTH, 'mask_y': FY, 'note': '遊戲端：PIT_* renderOrder −2；PITMASK colorWrite=false、renderOrder −1'},
        'note': '站名燈箱 SIGN_FACE_mrt（遊戲畫字）；沒有標誌（D77）'})
    print('mrt', st_)


build()
