"""溫州街主巷兩側的台北老公寓（近景）→ 一個 GLB（溫州街區域的世界座標，同材質合併）。第二 AI 工作階段（環境美術）製作：
  /opt/blenv/bin/python tools/blender/env_second/wz_street.py [-- --out assets/models/env/second_ai/wenzhou_street.glb]

取代 src/zones3d.js buildWenzhou 裡 aptA／aptB 的 12 棟、以及 Café 南北兩側兩棟的 TK.apartment 外觀（位置、寬深、樓層、
牆面種類、顏色、一樓種類照遊戲）。導航阻擋、鏡頭碰撞、店家的「看櫥窗」互動點都在遊戲程式裡，不變。
遠景（detail:false）的公寓不換。

台北老公寓（ART_DIRECTION 第 5 節）：長條磁磚／小方塊馬賽克／水泥漆外牆、樓板線、鋁窗＋窗簾、外凸鐵窗（真的鐵條）、
浪板雨遮、冷氣室外機與排水管、陽台；一樓：店面（木或鋁框玻璃、窗內景深卡、橫招牌、直立招牌、帆布雨遮）、
住家（紅／綠鐵門、信箱、門燈、小窗）、鐵捲門、騎樓（柱子、天花板日光燈）；頂樓：女兒牆、不鏽鋼水塔、頂樓加蓋。

中文字不放在 GLB：招牌板面 SIGN_FACE_<棟>、直立招牌 VSIGN_FACE_<棟>、店內景深卡 INTERIOR_FACE_<棟> 是空白板面
（自訂屬性帶店名、顏色、店種），遊戲用 TK.signTex／TK.interiorTex 畫（和原本的套件同一套字型與設計）。
"""
import math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
import cafe_layout as CL   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from cafe_layout import bush, pot, card, rand_uv, proto, combine, uv01   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/wenzhou_street.glb'))

# ---------------- 遊戲裡的配置（照 zones3d.js buildWenzhou；改那邊要一起改這裡） ----------------
SHOP = lambda **k: k
SPECS = [
    # A 側（z>0，立面朝 −z）：aptA(x0,x1,spec) → 位置 ((x0+x1)/2, 5)、rotation.y=π、深 12
    dict(id='A1', side='A', x0=-12, x1=-4, floors=4, wall='tile', color='#d9c9a8', ground='shop', shop=SHOP(type='print', name='大學影印', sub='影印・裝訂・論文輸出', signBg='#f4f1ea', signColor='#1f4e8c', band='#1f4e8c', vertical='影印', vBg='#ffffff', vColor='#1f4e8c', vBand='#1f4e8c')),
    dict(id='A2', side='A', x0=-4, x1=3.1, floors=5, wall='mosaic', color='#cfd8d0', ground='door', door='#9c2f2a'),
    dict(id='A3', side='A', x0=8.4, x1=20, floors=4, wall='tile', color='#c9b49a', balcony=True, ground='shop', shop=SHOP(type='books', name='巷口書房', sub='二手書・人文社會・法律', signBg='#2f4a3a', signColor='#f4ead8', serif=True, awning='#2f4a3a', vertical='書', vBg='#f4ead8', vColor='#2f4a3a', vBand='#2f4a3a')),
    dict(id='A4', side='A', x0=32, x1=40, floors=4, wall='plaster', color='#e8e1d4', ground='shop', shop=SHOP(type='noodle', name='林家乾麵', sub='乾麵・餛飩・滷味', signBg='#f4ead8', signColor='#9c2f2a', vertical='麵', vBg='#ffffff', vColor='#9c2f2a', vBand='#9c2f2a', awning='#9c2f2a')),
    dict(id='A5', side='A', x0=40, x1=48, floors=3, wall='tile', color='#b8a088', roofAdd=True, ground='shop', shop=SHOP(type='cvs', name='日日便利', sub='24H', signBg='#ffffff', signColor='#1f6f78', band='#e8a33a', frame='#cfd6d6')),
    # B 側（z<0，立面朝 +z）：aptB → 位置 ((x0+x1)/2, −5)、rotation.y=0
    dict(id='B1', side='B', x0=-30, x1=-21, floors=3, wall='plaster', color='#d8d0c0', roofAdd=True, ground='shutter'),
    dict(id='B2', side='B', x0=-21, x1=-15, floors=4, wall='tile', color='#bfb3a3', ground='shop', shop=SHOP(type='laundry', name='自助洗衣', sub='24 小時・投幣式', signBg='#e9f2f6', signColor='#2a5f8a', frame='#cfd6d6')),
    dict(id='B3', side='B', x0=-9.6, x1=4, floors=5, wall='tile', color='#d5c7b0', ground='shop', shop=SHOP(type='teishoku', name='巷子裡定食', sub='日式家庭料理', signBg='#1f2e45', signColor='#f4ead8', serif=True, awning='#1f2e45', vertical='定食', vBg='#f4ead8', vColor='#1f2e45', vBand='#1f2e45')),
    dict(id='B4', side='B', x0=4, x1=16, floors=4, wall='mosaic', color='#d8d2c6', ground='door', door='#2f4a3a'),
    dict(id='B5', side='B', x0=16, x1=30, floors=4, wall='tile', color='#cbbba3', ground='arcade', shop=SHOP(type='tea', name='巷口茶飲', sub='手搖飲・現煮珍珠', signBg='#f4ead8', signColor='#5c3a21', band='#7a9a5a')),
    dict(id='B6', side='B', x0=30, x1=40, floors=5, wall='plaster', color='#e6dccb', ground='shop', shop=SHOP(type='fruit', name='阿忠水果', sub='當季水果・果汁', signBg='#f2b33e', signColor='#5c2a1a')),
    dict(id='B7', side='B', x0=40, x1=48, floors=4, wall='tile', color='#a89a88', ground='door', door='#8a3a2a'),
    # Café 南北兩側（立面朝西，rotation.y=−π/2）
    dict(id='C1', pos=(55.4, -12.4), ry=-math.pi / 2, w=10, d=12, floors=5, wall='tile', color='#cbbba6', ground='shutter'),
    dict(id='C2', pos=(55.4, 11.2), ry=-math.pi / 2, w=7, d=12, floors=4, wall='mosaic', color='#d3cbbd', balcony=True, ground='door', door='#2f4a3a'),
]
GH, FH = 3.4, 3.1          # TK.apartment 的預設一樓高、樓高

random.seed(707)
B.reset(texres=512)
root = B.group('wenzhou_street', props={'kind': 'wenzhou_street'})
base = CL.materials()      # Café 的共用材質（鋁窗、鐵窗、冷氣、浪板、水塔、植物…，名稱相同→遊戲同一套夜間設定）
_mats = {}


def wall_mat(kind, color):
    """外牆：tile＝長條磁磚、mosaic＝小方塊馬賽克、plaster＝水泥漆（每棟依顏色校正一張顏色貼圖；法線／粗糙度共用）"""
    key = (kind, color)
    if key not in _mats:
        nm = f'wz_wall_{kind}_{color.lstrip("#")}'
        if kind == 'mosaic': _mats[key] = L.pbr(nm, 'rounded_square_tiled_wall', tile=1.0, target=color, normal=0.8, maps=('diff', 'nor'), rough_value=0.45)
        elif kind == 'plaster': _mats[key] = L.pbr(nm, 'plaster_grey_04', tile=1.5, target=color, normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.9)
        else: _mats[key] = L.pbr(nm, 'long_white_tiles', tile=1.2, target=color, normal=0.8, maps=('diff', 'nor'), rough_value=0.5)
    return _mats[key]


def flat(name, hexcol, **kw):
    if name not in _mats: _mats[name] = L.flat(name, hexcol, **kw)
    return _mats[name]


M = dict(base)
M.update({
    'gwall': L.pbr('wz_ground_wall', 'terrazzo_tiles', tile=1.0, target='#8a8278', normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.7),
    'shutter': L.pbr('wz_shutter', 'painted_metal_shutter', tile=1.2, target='#a9aeb1', normal=0.9, maps=('diff', 'nor'), res=256, rough_value=0.5),
    'pillar': L.pbr('wz_pillar_tile', 'long_white_tiles', tile=1.0, target='#b8aa96', normal=0.7, maps=('diff', 'nor'), rough_value=0.5),
    'sidewalk': L.pbr('wz_arcade_floor', 'square_brick_paving', tile=1.6, target='#9a8f84', maps=('diff',), res=256, rough_value=0.85),
    'ceilA': flat('wz_arcade_ceiling', '#d8d2c6', rough=0.9),
    'tube': L.flat('wz_tube', '#f6f4ee', rough=0.4, emit=B.srgb('#ffffff')),
    'mailbox': flat('wz_mailbox', '#7d8a8f', rough=0.5, metal=0.3),
    'awning_fabric': None,
})


def door_mat(color):
    return flat('wz_door_' + color.lstrip('#'), color, rough=0.5, metal=0.35)


def frame_mat(color):
    return flat('wz_frame_' + color.lstrip('#'), color, rough=0.55, metal=0.2 if color in ('#cfd6d6',) else 0.0)


def awning_mat(color):
    nm = 'wz_awning_' + color.lstrip('#')
    if nm not in _mats:
        m = L.flat(nm, color, rough=0.85); _mats[nm] = m
    return _mats[nm]


class Xf:
    """建築自己的座標（TK.apartment：正面朝 +z、原點在正面中央地面）→ 溫州街世界座標（只轉 π/2 的倍數）"""
    def __init__(self, px, pz, ry): self.px, self.pz, self.c, self.s, self.ry = px, pz, round(math.cos(ry)), round(math.sin(ry)), ry
    def p(self, x, y, z): return (self.px + x * self.c + z * self.s, y, self.pz - x * self.s + z * self.c)
    def box(self, m, x0, x1, y0, y1, z0, z1):
        a = self.p(x0, y0, z0); b = self.p(x1, y1, z1); m.box(min(a[0], b[0]), max(a[0], b[0]), y0, y1, min(a[2], b[2]), max(a[2], b[2])); return m
    def quad(self, m, pts): m.quad([self.p(*q) for q in pts]); return m
    def cyl(self, m, a, b, r, **kw): m.cyl(self.p(*a), self.p(*b), r, **kw); return m


def place(spec):
    if 'pos' in spec: return Xf(spec['pos'][0], spec['pos'][1], spec['ry']), spec['w'], spec['d']
    w = spec['x1'] - spec['x0']; cx = (spec['x0'] + spec['x1']) / 2
    return (Xf(cx, 5.0, math.pi), w, 12.0) if spec['side'] == 'A' else (Xf(cx, -5.0, 0.0), w, 12.0)


# 共用零件（instancing）：鐵窗、雨遮、冷氣、水塔
def grille_mesh(w_, h_, dep=0.42):
    m = Mesh('grille_proto', M['grille']); b = 0.018; n = max(6, int(w_ / 0.12))
    for i in range(n + 1):
        x = -w_ / 2 + i * w_ / n; m.box(x - b / 2, x + b / 2, 0, h_, dep - b, dep)
    for y in (0.0, 0.32, h_ * 0.55, h_ - b * 1.6): m.box(-w_ / 2, w_ / 2, y, y + b * 1.6, dep - b * 1.5, dep + 0.005)
    for s in (-1, 1):
        x = s * w_ / 2
        for k in range(4): m.box(x - b / 2, x + b / 2, 0, h_, dep * k / 3 - b / 2, dep * k / 3 + b / 2)
        for y in (0.0, h_ * 0.55, h_ - b * 1.6): m.box(x - b / 2, x + b / 2, y, y + b * 1.6, 0, dep)
    for k in range(3): m.box(-w_ / 2, w_ / 2, 0.0, 0.03, dep * (k + 0.5) / 3 - 0.03, dep * (k + 0.5) / 3 + 0.03)
    return proto(m.finish(None))


def hood_mesh(w_, dep=0.62):
    m = Mesh('hood_proto', M['corr'], tile=1.12)
    m.quad([(-w_ / 2, 0.16, -0.02), (w_ / 2, 0.16, -0.02), (w_ / 2, 0.0, dep), (-w_ / 2, 0.0, dep)][::-1])
    m.quad([(-w_ / 2, 0.16, -0.02), (w_ / 2, 0.16, -0.02), (w_ / 2, 0.0, dep), (-w_ / 2, 0.0, dep)])
    fr = Mesh('hood_frame', M['grille']); fr.box(-w_ / 2, w_ / 2, -0.03, 0.01, dep - 0.03, dep + 0.01)
    return combine([m.finish(None), fr.finish(None)], 'hood_proto')


def ac_mesh():
    body = Mesh('ac_body', M['ac']); body.box(-0.4, 0.4, 0, 0.56, 0, 0.3)
    fan = Mesh('ac_fan', M['ac_dark']); fan.cyl((0.1, 0.28, 0.3), (0.1, 0.28, 0.305), 0.21, seg=20)
    for k in range(7): fan.box(-0.13, 0.33, 0.1 + k * 0.06, 0.11 + k * 0.06, 0.304, 0.312)
    for k in range(9): fan.box(-0.38, -0.2, 0.06 + k * 0.05, 0.075 + k * 0.05, 0.3, 0.306)
    br = Mesh('ac_bracket', M['metal'])
    for x in (-0.4, 0.4): br.box(x - 0.02, x + 0.02, -0.06, 0.0, -0.02, 0.36); br.box(x - 0.02, x + 0.02, -0.3, 0.0, -0.02, 0.02)
    return combine([body.finish(None), fan.finish(None), br.finish(None)], 'ac_unit')


def tank_mesh():
    t = Mesh('tank', M['tank']); bmt = L.lathe([(0.0, 0.0), (0.55, 0.0), (0.6, 0.08), (0.6, 1.1), (0.55, 1.2), (0.25, 1.38), (0.0, 1.42)], seg=18)
    t.add_bm(bmt, Matrix.Translation(Vector((0, 0, 0.55)))); bmt.free()
    st = Mesh('tank_stand', M['metal'])
    for sx in (-1, 1):
        for sz in (-1, 1): st.box(sx * 0.45 - 0.03, sx * 0.45 + 0.03, 0, 0.55, sz * 0.45 - 0.03, sz * 0.45 + 0.03)
    st.box(-0.5, 0.5, 0.5, 0.56, -0.5, 0.5)
    tob = t.finish(None); L.smooth_mesh(tob)
    return combine([tob, st.finish(None)], 'roof_tank')


GRILLE = grille_mesh(2.5, 1.75); HOOD = hood_mesh(2.7); AC = ac_mesh(); TANK = tank_mesh()

# 累積的網格（同材質一個）：用 dict 依材質名取用
_acc = {}
def acc(mat, name=None):
    k = mat.name
    if k not in _acc: _acc[k] = Mesh(name or ('wz_' + k), mat)
    return _acc[k]


faces = []   # (名稱, 材質, 四點, 自訂屬性)


def face(name, mat, xf, pts, props):
    m = Mesh(name, mat); xf.quad(m, pts); faces.append((m, props))


def apartment(spec):
    xf, Wd, Dd = place(spec); F = spec['floors']; totalH = GH + (F - 1) * FH; rng = random.Random(sum(ord(c) * (i + 7) for i, c in enumerate(spec['id'])))   # 固定種子（Python 的 hash() 每次執行不同）
    wm = wall_mat(spec['wall'], spec['color'])
    gt = spec['ground']; rec = 1.3 if gt == 'shop' else (4.3 if gt == 'arcade' else 0.2)
    W = Wd; D = Dd
    # ---- 樓上的窗：每層 n 扇（和套件相同的算法：n＝round(W/3.6)）
    n = max(1, round(W / 3.6)); ww = min(2.2, W / n - 0.9); wh = 1.5
    wins = []
    for f in range(1, F):
        yc = GH + (f - 1) * FH + FH * 0.52
        for i in range(n):
            x = -W / 2 + (i + 0.5) * W / n
            kind = 'balcony' if (spec.get('balcony') and i == n // 2 and f == 1) else ('grille' if rng.random() < 0.7 else 'plain')
            wins.append(dict(f=f, x=x, y0=yc - wh / 2, y1=yc + wh / 2, kind=kind, hood=(kind != 'grille' and rng.random() < 0.5), ac=rng.random() < 0.65, lit=rng.random() < 0.35, acs=rng.choice((-1, 1))))
    # ---- 牆：一樓以上（留窗洞，牆厚 0.25）
    wall = acc(wm)
    for f in range(1, F):
        y0 = GH + (f - 1) * FH; y1 = y0 + FH
        ws = sorted([w for w in wins if w['f'] == f], key=lambda w: w['x'])
        xs = [-W / 2] + [v for w in ws for v in (w['x'] - ww / 2, w['x'] + ww / 2)] + [W / 2]
        for k in range(0, len(xs), 2): xf.box(wall, xs[k], xs[k + 1], y0, y1, -0.25, 0)
        for w in ws:
            xf.box(wall, w['x'] - ww / 2, w['x'] + ww / 2, y0, w['y0'], -0.25, 0); xf.box(wall, w['x'] - ww / 2, w['x'] + ww / 2, w['y1'], y1, -0.25, 0)
    xf.box(wall, -W / 2, W / 2, totalH, totalH + 0.9, -0.2, 0)                                   # 女兒牆
    side = acc(wm)
    xf.box(side, -W / 2, -W / 2 + 0.2, GH, totalH + 0.9, -D, -0.25); xf.box(side, W / 2 - 0.2, W / 2, GH, totalH + 0.9, -D, -0.25)
    xf.box(side, -W / 2, W / 2, GH, totalH + 0.9, -D, -D + 0.2)
    band = acc(M['band'])
    for f in range(1, F): xf.box(band, -W / 2 - 0.03, W / 2 + 0.03, GH + (f - 1) * FH - 0.09, GH + (f - 1) * FH + 0.09, -0.25, 0.08)
    xf.box(band, -W / 2 - 0.04, W / 2 + 0.04, totalH + 0.9, totalH + 0.97, -0.26, 0.05)
    xf.box(acc(M['roof']), -W / 2 + 0.2, W / 2 - 0.2, totalH - 0.05, totalH + 0.05, -D + 0.2, -0.2)
    # ---- 窗：鋁框、玻璃、窗簾、窗內房間；鐵窗／雨遮／冷氣／陽台
    for w in wins:
        x0, x1, y0, y1 = w['x'] - ww / 2, w['x'] + ww / 2, w['y0'], w['y1']; fz = -0.12; t = 0.05; cx = w['x']
        rm = acc(M['room_dark'])
        xf.box(rm, x0, x1, y0, y1, -0.92, -0.88); xf.box(rm, x0, x1, y0 - 0.02, y0, -0.9, fz); xf.box(rm, x0, x1, y1, y1 + 0.02, -0.9, fz)
        xf.box(rm, x0, x0 + 0.02, y0, y1, -0.9, fz); xf.box(rm, x1 - 0.02, x1, y0, y1, -0.9, fz)
        cm = acc(M['curtain_lit'] if w['lit'] else M['curtain']); cw = ww * rng.uniform(0.3, 0.55)
        if rng.random() < 0.5: xf.box(cm, x1 - cw, x1 - 0.03, y0 + 0.03, y1 - 0.05, -0.3, -0.28)
        else: xf.box(cm, x0 + 0.03, x0 + cw, y0 + 0.03, y1 - 0.05, -0.3, -0.28)
        al = acc(M['alu'])
        xf.box(al, x0, x1, y0, y0 + t, fz - 0.05, fz + 0.03); xf.box(al, x0, x1, y1 - t, y1, fz - 0.05, fz + 0.03)
        xf.box(al, x0, x0 + t, y0, y1, fz - 0.05, fz + 0.03); xf.box(al, x1 - t, x1, y0, y1, fz - 0.05, fz + 0.03)
        xf.box(al, cx - 0.03, cx + 0.01, y0 + t, y1 - t, fz - 0.03, fz + 0.02)
        gl = acc(M['win_glass'])
        xf.quad(gl, [(x0 + t, y0 + t, fz - 0.01), (x1 - t, y0 + t, fz - 0.01), (x1 - t, y1 - t, fz - 0.01), (x0 + t, y1 - t, fz - 0.01)])
        xf.box(acc(M['band']), x0 - 0.08, x1 + 0.08, y0 - 0.07, y0, -0.25, 0.07)               # 窗台
        if w['kind'] == 'grille':
            wx, _, wz = xf.p(cx, 0, 0.0); B.instance(GRILLE, f'grille_{spec["id"]}_{len(_inst)}', wx, y0 - 0.14, wz, root, ry=xf.ry); _inst.append(1)
            wx, _, wz = xf.p(cx, 0, 0.0); B.instance(HOOD, f'ghood_{spec["id"]}_{len(_inst)}', wx, y0 - 0.14 + 1.77, wz, root, ry=xf.ry); _inst.append(1)
            if rng.random() < 0.6:
                px_ = cx + rng.uniform(-0.9, 0.9); pz_ = rng.uniform(0.16, 0.28)
                q = xf.p(px_, 0, pz_); pot(acc(M['pot_terra']), q[0], q[2], 0.09, 0.16, 'taper', y0=y0 - 0.11); bush(acc(M['fern']), q[0], y0 + 0.22, q[2], 0.32, n=4, span=0.45)
        elif w['kind'] == 'balcony':
            bx0, bx1, bd = x0 - 0.6, x1 + 0.6, 1.05; sl = acc(M['band']); xf.box(sl, bx0, bx1, y0 - 0.3, y0 - 0.16, -0.25, bd)
            pw = acc(wm); xf.box(pw, bx0, bx1, y0 - 0.16, y0 + 0.4, bd - 0.12, bd); xf.box(pw, bx0, bx0 + 0.12, y0 - 0.16, y0 + 0.4, 0, bd); xf.box(pw, bx1 - 0.12, bx1, y0 - 0.16, y0 + 0.4, 0, bd)
            rl = acc(M['grille']); xx = bx0 + 0.06
            while xx < bx1 - 0.05: xf.box(rl, xx - 0.01, xx + 0.01, y0 + 0.4, y0 + 0.92, bd - 0.07, bd - 0.05); xx += 0.13
            xf.box(rl, bx0, bx1, y0 + 0.9, y0 + 0.94, bd - 0.09, bd - 0.03)
            for k in range(3):
                q = xf.p(bx0 + 0.5 + k * (bx1 - bx0 - 1.0) / 2, 0, bd - 0.45); pot(acc(M['pot_terra']), q[0], q[2], 0.16, 0.3, y0=y0 - 0.16)
                bush(acc(M['broad']), q[0], y0 + 0.5, q[2], 0.45, n=5, span=0.42)
        elif w['hood']:
            wx, _, wz = xf.p(cx, 0, 0.0); B.instance(HOOD, f'hood_{spec["id"]}_{len(_inst)}', wx, y1 + 0.18, wz, root, ry=xf.ry); _inst.append(1)
        if w['ac'] and w['kind'] != 'balcony':
            ax = cx + w['acs'] * (ww / 2 + 0.55)
            if -W / 2 + 0.5 < ax < W / 2 - 0.5:
                wx, _, wz = xf.p(ax, 0, 0.0); B.instance(AC, f'ac_{spec["id"]}_{len(_inst)}', wx, y0 - 0.2, wz, root, ry=xf.ry); _inst.append(1)
                xf.cyl(acc(M['pipe']), (ax + 0.3, y0 - 0.2, 0.04), (ax + 0.3, GH + 0.1, 0.04), 0.018, seg=6)
    # ---- 頂樓：水塔、頂樓加蓋
    if spec.get('roofAdd'):
        aw, ad = W * 0.7, D * 0.55; ra = acc(M['corr']); xf.box(ra, -aw / 2, aw / 2, totalH, totalH + 2.4, -D * 0.5 - ad / 2, -D * 0.5 + ad / 2)
        xf.box(acc(M['band']), -aw / 2 - 0.15, aw / 2 + 0.15, totalH + 2.4, totalH + 2.5, -D * 0.5 - ad / 2 - 0.15, -D * 0.5 + ad / 2 + 0.15)
    else:
        tx = rng.uniform(-W / 2 + 1.5, W / 2 - 1.5); wx, _, wz = xf.p(tx, 0, -D * 0.45); B.instance(TANK, f'tank_{spec["id"]}', wx, totalH, wz, root, ry=xf.ry)
    # ---- 一樓
    gw = acc(M['gwall'])
    xf.box(gw, -W / 2, W / 2, 0, GH, -D, -rec)                                                    # 一樓牆體（店面退縮）
    if gt in ('shop', 'arcade'):
        r0 = 3.0 if gt == 'arcade' else 0.0
        for sx in (-1, 1): xf.box(gw, sx * (W / 2 - 0.15) - 0.15, sx * (W / 2 - 0.15) + 0.15, 0, GH, -rec, -r0)
    xf.box(acc(M['band']), -W / 2, W / 2, GH - 0.12, GH, -0.25, 0.06)
    if gt in ('shop', 'arcade'): shopfront(spec, xf, W, gt)
    elif gt == 'shutter': shutter(spec, xf, W)
    else: housedoor(spec, xf, W, rng)


_inst = []


def shopfront(spec, xf, W, gt):
    s = spec['shop']; dep = 3.0 if gt == 'arcade' else 0.0; iw = W - 0.6; ih = GH - 0.9; fr = frame_mat(s.get('frame', '#3b2a1e'))
    # 店內景深卡（後退 1.2 m）：遊戲貼 TK.interiorTex(店種)
    face(f'INTERIOR_FACE_{spec["id"]}', M['board'], xf, [(-iw / 2, 0.15, -1.2 - dep), (iw / 2, 0.15, -1.2 - dep), (iw / 2, ih + 0.15, -1.2 - dep), (-iw / 2, ih + 0.15, -1.2 - dep)], {'interior': s['type']})
    fl = acc(M['gwall']); xf.box(fl, -iw / 2, iw / 2, 0, 0.15, -1.3 - dep, -dep)
    for sx in (-1, 1): xf.box(acc(M['plaster']), sx * iw / 2 - 0.03, sx * iw / 2 + 0.03, 0.15, ih + 0.15, -1.2 - dep, -dep)
    f_ = acc(fr)
    xf.box(f_, -W / 2, W / 2, ih + 0.15, ih + 0.4, -dep - 0.12, -dep + 0.12)
    for sx in (-0.5, -0.17, 0.17, 0.5): xf.box(f_, sx * iw - 0.05, sx * iw + 0.05, 0.15, ih + 0.15, -dep - 0.06, -dep + 0.06)
    xf.box(f_, -iw / 2, iw / 2, 0.1, 0.18, -dep - 0.06, -dep + 0.08)
    xf.quad(acc(M['glass']), [(-iw / 2, 0.18, -dep + 0.01), (iw / 2, 0.18, -dep + 0.01), (iw / 2, ih + 0.15, -dep + 0.01), (-iw / 2, ih + 0.15, -dep + 0.01)])
    # 橫招牌（板面＋框）
    sw = min(W - 0.4, 6.5); sy0, sy1 = GH - 0.67, GH - 0.03
    xf.box(acc(fr), -sw / 2 - 0.05, sw / 2 + 0.05, sy0 - 0.04, sy1 + 0.04, 0.0, 0.1)
    face(f'SIGN_FACE_{spec["id"]}', M['board'], xf, [(-sw / 2, sy0, 0.105), (sw / 2, sy0, 0.105), (sw / 2, sy1, 0.105), (-sw / 2, sy1, 0.105)],
         {'sign': s['name'], 'sub': s.get('sub', ''), 'bg': s.get('signBg', '#3b2a1e'), 'color': s.get('signColor', '#f4ead8'), 'serif': 1 if s.get('serif') else 0, 'band': s.get('band', '')})
    # 直立招牌（突出牆面，兩面都有字）＋鐵架
    if s.get('vertical'):
        vx = W / 2 - 0.5; vy0, vy1 = GH + 0.3, GH + 2.9
        xf.box(acc(M['metal']), vx - 0.04, vx + 0.04, vy1 + 0.02, vy1 + 0.08, 0.0, 0.95); xf.box(acc(M['metal']), vx - 0.04, vx + 0.04, vy0 - 0.08, vy0 - 0.02, 0.0, 0.95)
        xf.box(acc(M['ac']), vx - 0.07, vx + 0.07, vy0, vy1, 0.18, 0.92)
        vp = {'vertical': s['vertical'], 'vBg': s.get('vBg', '#ffffff'), 'vColor': s.get('vColor', '#b0332a'), 'vBand': s.get('vBand', '#b0332a')}
        face(f'VSIGN_FACE_{spec["id"]}_a', M['board'], xf, [(vx + 0.075, vy0, 0.92), (vx + 0.075, vy0, 0.18), (vx + 0.075, vy1, 0.18), (vx + 0.075, vy1, 0.92)], vp)
        face(f'VSIGN_FACE_{spec["id"]}_b', M['board'], xf, [(vx - 0.075, vy0, 0.18), (vx - 0.075, vy0, 0.92), (vx - 0.075, vy1, 0.92), (vx - 0.075, vy1, 0.18)], vp)
    # 帆布雨遮（斜的，有前緣垂邊）
    if s.get('awning'):
        am = awning_mat(s['awning']); aw = W - 0.4; ay0, ay1, ad = GH - 0.75, GH - 1.25, 1.2
        m = acc(am); xf.quad(m, [(-aw / 2, ay0, 0.02), (aw / 2, ay0, 0.02), (aw / 2, ay1, ad), (-aw / 2, ay1, ad)][::-1])
        xf.quad(m, [(-aw / 2, ay0, 0.02), (aw / 2, ay0, 0.02), (aw / 2, ay1, ad), (-aw / 2, ay1, ad)])
        xf.box(m, -aw / 2, aw / 2, ay1 - 0.22, ay1, ad - 0.01, ad + 0.01)
        for sx in (-1, 1): xf.cyl(acc(M['metal']), (sx * aw / 2, ay0 + 0.05, 0.02), (sx * aw / 2, ay1 + 0.02, ad), 0.015, seg=5)
    # 騎樓：上面樓板延伸到街邊、兩端柱子、地坪、天花板日光燈
    if gt == 'arcade':
        xf.box(acc(M['ceilA']), -W / 2, W / 2, GH - 0.35, GH - 0.12, -dep, 0.0)
        for sx in (-W / 2 + 0.3, W / 2 - 0.3): xf.box(acc(M['pillar']), sx - 0.275, sx + 0.275, 0.05, GH - 0.35, -0.575, -0.025)
        xf.box(acc(M['sidewalk']), -W / 2, W / 2, 0.0, 0.05, -dep, 0.0)
        nl = max(1, round(W / 2.5))
        for k in range(nl):
            tx = -W / 2 + (k + 0.5) * W / nl; xf.box(acc(M['tube']), tx - 0.6, tx + 0.6, GH - 0.38, GH - 0.35, -dep * 0.55 - 0.05, -dep * 0.55 + 0.05)


def shutter(spec, xf, W):
    sm = acc(M['shutter']); xf.quad(sm, [(-W / 2 + 0.4, 0.05, 0.02), (W / 2 - 0.4, 0.05, 0.02), (W / 2 - 0.4, GH - 0.55, 0.02), (-W / 2 + 0.4, GH - 0.55, 0.02)])
    xf.box(acc(M['alu']), -W / 2 + 0.3, W / 2 - 0.3, GH - 0.62, GH - 0.27, -0.03, 0.27)
    for sx in (-1, 1): xf.box(acc(M['alu']), sx * (W / 2 - 0.4) - 0.04, sx * (W / 2 - 0.4) + 0.04, 0.0, GH - 0.55, -0.02, 0.06)


def housedoor(spec, xf, W, rng):
    dc = door_mat(spec.get('door', '#9c2f2a')); dx = -W * 0.2
    d = acc(dc); xf.box(d, dx - 0.7, dx + 0.7, 0.05, 2.35, -0.02, 0.03)
    for k in range(3):                                   # 鐵門上的凸起方框（台灣老公寓常見的造型鐵門）
        y = 0.25 + k * 0.72; xf.box(d, dx - 0.58, dx + 0.58, y, y + 0.55, 0.03, 0.05)
    xf.box(acc(M['brass']), dx + 0.48, dx + 0.53, 1.0, 1.25, 0.05, 0.09)
    xf.box(acc(M['base']), dx - 0.85, dx + 0.85, 0.0, 0.12, -0.05, 0.4)                          # 門口台階
    mb = acc(M['mailbox']); xf.box(mb, dx + 0.85, dx + 1.3, 1.1, 1.55, 0.0, 0.18)                 # 信箱
    q = xf.p(dx + 0.95, 2.25, 0.12); acc(M['bulb']).sphere(q, 0.08, seg=8, rings=4)              # 門燈
    if W > 4:
        wx = W * 0.18; al = acc(M['alu']); fz = 0.0
        xf.box(al, wx - 1.0, wx + 1.0, 1.0, 1.06, -0.05, 0.05); xf.box(al, wx - 1.0, wx + 1.0, 2.14, 2.2, -0.05, 0.05)
        for xx in (wx - 1.0, wx - 0.03, wx + 0.94): xf.box(al, xx, xx + 0.06, 1.0, 2.2, -0.05, 0.05)
        xf.quad(acc(M['win_glass']), [(wx - 0.97, 1.06, 0.0), (wx + 0.97, 1.06, 0.0), (wx + 0.97, 2.14, 0.0), (wx - 0.97, 2.14, 0.0)])
        wx_, _, wz_ = xf.p(wx, 0, 0.0); B.instance(GRILLE, f'dgrille_{spec["id"]}', wx_, 0.95, wz_, root, ry=xf.ry) if rng.random() < 0.5 else None


for sp in SPECS: apartment(sp)
for k, m in _acc.items():
    m.finish(root, uv=(k not in ('cafe_leaf_fern', 'cafe_leaf_broad', 'cafe_leaf_olive', 'cafe_leaf_ivy')), smooth=k in ('cafe_pot_terracotta', 'cafe_bulb'))
for m, props in faces: uv01(m.finish(root, uv=True, props=props))

L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name)
info = L.export(OUT, gpu_instances=True)
info.update({'buildings': [s['id'] for s in SPECS]})
L.write_json(OUT[:-4] + '.json', info)
