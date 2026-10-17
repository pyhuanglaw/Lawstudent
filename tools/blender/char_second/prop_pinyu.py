"""曾品妤的兩個隨身物（BB_131 標準圖：「手上常拿工程計算機、黑色保溫瓶」）→ 兩個 GLB。
LAWWW2-C 2026-10-17；Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/char_second/prop_pinyu.py [-- --outdir assets/models/char/second_ai]

- calc_engineering.glb：工程計算機（16×8×1.6 cm）：深灰機身、上面一塊液晶（灰綠、兩行數字）、太陽能板、6×8 顆按鍵（上兩排小的功能鍵、下面數字鍵，
  數字鍵淺灰、功能鍵深灰、運算鍵橘一顆）。**沒有牌子、型號**（D77）；鍵上不寫字（遊戲裡看不到）。
- thermos_black.glb：黑色保溫瓶（直徑 7 cm、高 22 cm）：霧黑瓶身、亮一點的瓶蓋、蓋子上一條提環、瓶底一圈。
座標＝three.js 模型座標（x 右、y 上、z 前）：計算機原點在中心、螢幕朝 +y、上端（液晶那一端）朝 −z；保溫瓶原點在瓶身中間、瓶蓋朝 +y。
props3d 的掛法建議寫在 .json 的 hold（計算機照資料夾左手平拿；保溫瓶右手直握）。"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'env_second'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUTDIR = os.path.join(L.ROOT, ARGS[ARGS.index('--outdir') + 1] if '--outdir' in ARGS else 'assets/models/char/second_ai')


def calculator(out):
    B.reset(texres=256)
    M = {'body': L.flat('calc_body', '#2b2d31', rough=0.45), 'face': L.flat('calc_face', '#3a3d43', rough=0.5),
         'lcd': L.flat('calc_lcd', '#aab59a', rough=0.25), 'keys': L.vc_material('calc_keys', rough=0.45), 'solar': L.flat('calc_solar', '#3a2f2a', rough=0.2)}
    root = B.group('calc_engineering', props={'kind': 'prop_calculator', 'owner': 'econ_pinyu', 'screen': '+y', 'top': '-z'})
    W, H, D = 0.04, 0.008, 0.08                                         # 半寬、半厚、半長
    bd = Mesh('calc_body', M['body']); bd.rbox(-W, W, -H, H, -D, D, r=0.006, seg=2); bd.finish(root, uv=False)
    fc = Mesh('calc_face', M['face']); fc.box(-W + 0.004, W - 0.004, H - 0.0005, H + 0.0004, -D + 0.004, D - 0.004); fc.finish(root, uv=False)
    sl = Mesh('calc_solar', M['solar']); sl.box(0.006, W - 0.008, H + 0.0004, H + 0.001, -D + 0.008, -D + 0.018); sl.finish(root, uv=False)
    lc = Mesh('calc_lcd', M['lcd']); lc.box(-W + 0.008, W - 0.008, H + 0.0004, H + 0.0012, -D + 0.022, -D + 0.046); lc.finish(root, uv=False)
    k = CMesh('calc_keys', M['keys']); y0 = H + 0.0004
    for i in range(7):                                                    # 液晶上的兩行數字（深色小塊；不寫字）
        k.cbox(W - 0.012 - (i + 1) * 0.0068, W - 0.012 - i * 0.0068 - 0.0016, H + 0.0012, H + 0.0014, -D + 0.036, -D + 0.042, '#2c3326')
    for i in range(4): k.cbox(-W + 0.011 + i * 0.006, -W + 0.015 + i * 0.006, H + 0.0012, H + 0.0014, -D + 0.026, -D + 0.029, '#3c4436')
    rows = [(-D + 0.056 + r * 0.0115, True) for r in range(3)] + [(-D + 0.0935 + r * 0.0145, False) for r in range(5)]   # 上三排功能鍵（小）、下五排數字鍵（大）；最後一排的下緣在機身邊緣內 4 mm
    for r, (z, small) in enumerate(rows):
        ncol = 6 if small else 5
        for c in range(ncol):
            x = -W + 0.008 + (c + 0.5) * ((2 * W - 0.016) / ncol); hw = (2 * W - 0.016) / ncol / 2 - 0.0016
            hz = 0.0042 if small else 0.0052
            col = '#4a4e56' if small else ('#d8d6cf' if c < 3 else '#8c9098')
            if not small and r == 7 and c == 4: col = '#d9772e'
            k.cbox(x - hw, x + hw, y0, y0 + (0.0016 if small else 0.0022), z - hz, z + hz, col)
    k.finish(root, uv=False)
    st = L.export(out, gpu_instances=False)
    L.write_json(out.replace('.glb', '.json'), {'glb': os.path.relpath(out, L.ROOT), 'owner': 'econ_pinyu', 'bytes': st['bytes'], 'size_m': [2 * W, 2 * H, 2 * D],
        'origin': '中心；螢幕朝 +y、液晶那一端朝 −z', 'hold': {'bone': 'leftHand', 'pos': [-0.07, -0.02, 0.0], 'rot': [0, 0, 0], 'note': '照資料夾（folder）的拿法：左手平拿'},
        'note': '沒有牌子、型號（D77）'})
    return st


def thermos(out):
    B.reset(texres=256)
    M = {'body': L.flat('thermos_body', '#1a1b1e', rough=0.7), 'cap': L.flat('thermos_cap', '#26282c', rough=0.35, metal=0.2),
         'ring': L.flat('thermos_ring', '#9a9da3', rough=0.3, metal=0.45), 'loop': L.flat('thermos_loop', '#202124', rough=0.6)}
    root = B.group('thermos_black', props={'kind': 'prop_thermos', 'owner': 'econ_pinyu', 'cap': '+y'})
    R, H0, H1 = 0.035, -0.11, 0.075                                       # 瓶身半徑、底、瓶身頂（瓶蓋另外）
    prof = [(0.0, H0), (R - 0.004, H0), (R, H0 + 0.006), (R, H1 - 0.006), (R - 0.002, H1)]
    bd = Mesh('thermos_body', M['body']); bd.add_bm(L.lathe(prof, seg=28)); bd.finish(root, uv=False, smooth=True)
    rg = Mesh('thermos_ring', M['ring']); rg.add_bm(L.lathe([(R - 0.0015, H1 - 0.001), (R + 0.0005, H1 - 0.001), (R + 0.0005, H1 + 0.004), (R - 0.0015, H1 + 0.004)], seg=28)); rg.finish(root, uv=False, smooth=True)
    cp = Mesh('thermos_cap', M['cap']); cp.add_bm(L.lathe([(0.0, H1 + 0.004), (R - 0.001, H1 + 0.004), (R - 0.001, H1 + 0.034), (R - 0.006, H1 + 0.04), (0.0, H1 + 0.04)], seg=28)); cp.finish(root, uv=False, smooth=True)
    lp = Mesh('thermos_loop', M['loop'])                                  # 瓶蓋上的提環（一圈扁的帶子）
    pts = [(0.016 * math.cos(a), H1 + 0.04 + 0.018 * max(0.0, math.sin(a)), 0.0) for a in [i * math.pi / 10 for i in range(11)]]
    for a_, b_ in zip(pts[:-1], pts[1:]): lp.cyl(a_, b_, 0.003, seg=6)
    lp.finish(root, uv=False)
    st = L.export(out, gpu_instances=False)
    L.write_json(out.replace('.glb', '.json'), {'glb': os.path.relpath(out, L.ROOT), 'owner': 'econ_pinyu', 'bytes': st['bytes'], 'size_m': [2 * R, H1 + 0.058 - H0, 2 * R],
        'origin': '瓶身中間；瓶蓋朝 +y', 'hold': {'bone': 'rightHand', 'pos': [0.07, -0.03, 0.0], 'rot': [0, 0, 0], 'note': '右手直握（瓶蓋朝上）；位置要在遊戲裡對手掌'}, 'note': '沒有牌子（D77）'})
    return st


os.makedirs(OUTDIR, exist_ok=True)
print('calc', calculator(os.path.join(OUTDIR, 'calc_engineering.glb')))
print('thermos', thermos(os.path.join(OUTDIR, 'thermos_black.glb')))
