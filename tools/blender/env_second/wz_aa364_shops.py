"""溫州街「林家乾麵」（A4）、「巷子裡定食」（B3）的室內（WZ-SHOP-AA364-ART，LAWWW2 2026-10-22；AA_364「林家乾麵、巷子裡定食用 118 巷的店面做法」）
→ assets/models/env/second_ai/wz_<lin|teishoku>_interior.glb（＋.json）。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/wz_aa364_shops.py -- --shop lin|teishoku
做法：
  - 零件是 118 巷九間店那一套（tools/blender/env_second/lane118_shops.py：桌子、圓凳、木椅、日光燈、飲料冰箱、電視、壁扇、層板、菜盤、櫃台）。
  - 配置（家具位置、阻擋、座位、店員、點餐點）只寫在 src/data/wz_shops_layout.js 的 lin／teishoku（遊戲 zones3d.js 的 wzShop 讀同一份）；
    這裡照配置擺。零件自己登記的阻擋框要落在配置的阻擋框裡：不一致的地方最後印出來（problems）。
  - 座標＝遊戲區域座標：x −W/2…W/2、z −D/2（後牆）…+D/2（店面），y 往上；單位公尺。
  - 牆分四組 WALL_<N|W|E|S>_*（props dir＝往室內的法線；遊戲 attachRoomGLB：鏡頭在牆外時那一面淡出）；掛在牆上的東西放進同一組。
  - 店面外面的街景是遊戲 room() 的窗景照片（assets/models/env/views/wz_<lin|teishoku>_day|night.webp，tools/shots/shop_views.py 拍），不在模型裡。
  - 菜單、營業時間、月曆、門簾、暖簾的字：tools/blender/env_second/shops_tex.py aa364（菜單照 AA_364 第 2 節；店名虛構，D77）。"""
import json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, Matrix   # noqa: E402
import lane118_shops as LS   # noqa: E402（118 巷店面的零件；import 不會建模）
from lane118_shops import ccyl, csph, clathe, uvquad, table, chair, tubes, wall_fan, drink_fridge, cups_stack, tv, wall_shelf, food_tray, plant, counter, frame_board, PI   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
SHOP = arg('--shop', 'lin')
ALL = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./src/data/wz_shops_layout.js')))"], cwd=L.ROOT))
LAY = ALL[SHOP]
OUT = os.path.join(L.ROOT, arg('--out', LAY['glb']))
W, D, H = LAY['w'], LAY['d'], LAY['h']
LS.H = H                                   # 118 巷零件的天花板高度（日光燈、吊燈的線）讀模組的 H
GEN = os.path.join(HERE, 'textures', 'gen')
def item(kind): return next(i for i in LAY['items'] if i['kind'] == kind)
def items(kind): return [i for i in LAY['items'] if i['kind'] == kind]


def img_mat(name, fn, rough=0.6, emit=0.0, clip=False, cull=False):
    """textures/gen 的圖；clip＝透明的地方挖掉（木札之間的空隙，不用半透明排序）；cull＝單面（木札的正反面各一張圖）"""
    m = bpy.data.materials.new(name); m.use_backface_culling = cull; m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if clip:
        r = N.new('ShaderNodeMath'); r.operation = 'ROUND'; nt.links.new(tx.outputs['Alpha'], r.inputs[0]); nt.links.new(r.outputs[0], bs.inputs['Alpha'])
        try: m.surface_render_method = 'DITHERED'
        except Exception: pass
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    m['tile'] = 1.0; return m


# 每間店：地板（Poly Haven 貼圖、顏色、每張幾公尺、粗糙度）、上半牆的漆、腰牆（貼圖、顏色、每張幾公尺）、腰牆高、木頭（桌面、檯面）、腰牆線、天花板
SPEC = {
    'lin': dict(floor=('rounded_square_tiled_wall', '#a9b1ac', 0.6, 0.35), wall='#d5e6db', wain=('long_white_tiles', '#eef0ec', 0.9), wainH=1.45,
                wood=('walnut_veneer', '#b08a5e'), trim='#6f9a86', ceil='#eef0ec'),
    'teishoku': dict(floor=('dark_planks', '#c9b08c', 1.6, 0.5), wall='#efe6d4', wain=('walnut_veneer', '#6e4f35', 1.0), wainH=0.95,
                     wood=('walnut_veneer', '#d2b083'), trim='#3d2a1c', ceil='#d8c6a2'),
}


class Ctx:
    """118 巷零件要的「店」：材質、各材質累積的網格、牆的分組、零件登記的阻擋框（座位、店員、點餐點寫在配置檔，零件的 seat／look 不用）"""
    def __init__(self, sid):
        self.sid = sid; self.S = s = SPEC[sid]; self.W, self.D = W, D
        self.X0, self.X1, self.Z0, self.Z1 = -W / 2, W / 2, -D / 2, D / 2
        self.rng = random.Random(364 + sum(map(ord, sid)))
        B.reset(texres=512)
        self.root = B.group(f'wz_{sid}_interior', props={'kind': f'wz_{sid}_interior', 'w': W, 'd': D, 'h': H, 'layout': ALL['version']})
        self.blocks, self.extra, self.pics = [], {}, {}
        P = f'wz_{sid}_'; fl, wn, wd = s['floor'], s['wain'], s['wood']
        self.M = M = {
            'floor': L.pbr(P + 'floor', fl[0], tile=fl[2], target=fl[1], contrast=0.6, normal=0.3, maps=('diff', 'nor'), res=512, rough_value=fl[3]),
            'wall': L.pbr(P + 'wall', 'white_plaster_02', tile=2.0, target=s['wall'], contrast=0.3, normal=0.1, maps=('diff', 'nor'), res=256, rough_value=0.85),
            'wain': L.pbr(P + 'wain', wn[0], tile=wn[2], target=wn[1], contrast=0.7, normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.3),
            'wood': L.pbr(P + 'wood', wd[0], tile=0.9, target=wd[1], contrast=0.8, normal=0.25, maps=('diff', 'nor'), res=256, rough_value=0.45),
            'vc': L.vc_material(P + 'vc', rough=0.6), 'vcm': L.vc_metal(P + 'vcmetal', rough=0.32, metal=0.4),
            'steel': L.flat(P + 'steel', '#b9bec2', rough=0.28, metal=0.45),
            'glass': L.flat(P + 'glass', '#dfe9ec', rough=0.05, alpha=0.16),
            'tube': L.flat('GLOW_' + P + 'tube', '#ffffff', rough=0.3, emit=B.srgb('#f2f6ff')),
            'warm': L.flat('GLOW_' + P + 'warm', '#ffe7c2', rough=0.4, emit=B.srgb('#ffc77a')),
            'fridge': L.flat('GLOW_' + P + 'fridge', '#f4f8ff', rough=0.3, emit=B.srgb('#cfe0f4')),
            'ceil': L.flat(P + 'ceiling', s['ceil'], rough=0.9, cull=True),          # 朝下的單面：鏡頭在天花板上面時看得穿（和溫州街另外三家店一樣）
            'screen': img_mat('GLOW_' + P + 'screens', 'l118_screens.png', rough=0.3, emit=0.9),
        }
        self.vc = CMesh(P + 'props', M['vc']); self.vm = CMesh(P + 'metal', M['vcm'])
        self.wood = Mesh(P + 'woodparts', M['wood']); self.steel = Mesh(P + 'steelparts', M['steel'])
        self.tube = Mesh(P + 'tubes', M['tube']); self.warm = Mesh(P + 'warm', M['warm']); self.fridgel = Mesh(P + 'fridgelight', M['fridge'])
        self.scr = Mesh(P + 'screens', M['screen'])
        self.WG = {k: {} for k in 'NWES'}

    def block(self, x0, x1, z0, z1, why): self.blocks.append((round(min(x0, x1), 3), round(max(x0, x1), 3), round(min(z0, z1), 3), round(max(z0, z1), 3), why))
    def seat(self, *a, **k): pass
    def look(self, *a, **k): pass

    def wg(self, side, key, mat, cm=False):
        d = self.WG[side]
        if key not in d: d[key] = (CMesh if cm else Mesh)(f'WALL_{side}_{key}', mat)
        return d[key]

    def mat(self, key, fn, **kw):
        if key not in self.pics: self.pics[key] = img_mat(f'wz_{self.sid}_{key}', fn, **kw)
        return self.pics[key]

    def pic(self, side, key, fn, a0, a1, y0, y1, inset=0.015, uv=(0.0, 0.0, 1.0, 1.0), **kw):
        """牆上的圖：side 牆（N W E S），a0..a1 沿牆（N、S：x；W、E：z。從室內看 W 牆左邊是 +z、E 牆左邊是 −z、S 牆左邊是 +x）"""
        X0, X1, Z0, Z1 = self.X0, self.X1, self.Z0, self.Z1; m = self.wg(side, key, self.mat(key, fn, **kw))
        if side == 'N': z = Z0 + inset; pts = [(a0, y0, z), (a1, y0, z), (a1, y1, z), (a0, y1, z)]
        elif side == 'S': z = Z1 - inset; pts = [(a1, y0, z), (a0, y0, z), (a0, y1, z), (a1, y1, z)]
        elif side == 'W': x = X0 + inset; pts = [(x, y0, a1), (x, y0, a0), (x, y1, a0), (x, y1, a1)]
        else: x = X1 - inset; pts = [(x, y0, a0), (x, y0, a1), (x, y1, a1), (x, y1, a0)]
        uvquad(m, pts, uv); return m


def on_wall(c, side, fn, *a, **k):
    """把零件畫進那一面牆的組（壁扇、層板這種凸出牆面的東西：鏡頭在牆外、牆淡出時一起藏，不會飄在半空中）"""
    vc, vm, wm = c.vc, c.vm, c.warm
    c.vc = c.wg(side, 'trim', c.M['vc'], cm=True); c.vm = c.wg(side, 'wmetal', c.M['vcm'], cm=True); c.warm = c.wg(side, 'wwarm', c.M['warm'])
    try: return fn(c, *a, **k)
    finally: c.vc, c.vm, c.warm = vc, vm, wm


# ================= 殼：地板、天花板、三面牆（開口、腰牆線、踢腳板） =================
def floor_ceiling(c, battens=None):
    fl = c.S['floor']; m = Mesh(f'wz_{c.sid}_floorm', c.M['floor'], tile=fl[2]); m.box(c.X0, c.X1, -0.05, 0.0, c.Z0, c.Z1); m.finish(c.root)
    ce = Mesh(f'wz_{c.sid}_ceiling', c.M['ceil']); ce.quad([(c.X0, H, c.Z0), (c.X1, H, c.Z0), (c.X1, H, c.Z1), (c.X0, H, c.Z1)]); ce.finish(c.root, uv=False)
    if battens:                                                                                   # 天花板的格縁（只做朝下的面）
        bt = Mesh(f'wz_{c.sid}_ceiling_batten', L.flat(f'wz_{c.sid}_ceiling_batten', battens, rough=0.6, cull=True))
        z = c.Z0 + 0.9
        while z < c.Z1 - 0.2: bt.quad([(c.X0, H - 0.03, z - 0.02), (c.X1, H - 0.03, z - 0.02), (c.X1, H - 0.03, z + 0.02), (c.X0, H - 0.03, z + 0.02)]); z += 0.9
        bt.finish(c.root, uv=False)


def wall_side(c, side, holes=(), segs=None):
    """一面牆（N W E）：腰牆以下、上面的漆；holes＝[(a0, a1, y0, y1)] 開口；segs＝[(a0, a1, 腰牆材質, 腰牆高)] 分段（定食店的廚房那一段是白磁磚）；
    腰牆線、踢腳板在開口的地方斷開"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M
    if side == 'N': A0, A1 = X0, X1; Q = lambda a, b, y0, y1: [(a, y0, Z0), (b, y0, Z0), (b, y1, Z0), (a, y1, Z0)]
    elif side == 'W': A0, A1 = Z0, Z1; Q = lambda a, b, y0, y1: [(X0, y0, b), (X0, y0, a), (X0, y1, a), (X0, y1, b)]
    else: A0, A1 = Z0, Z1; Q = lambda a, b, y0, y1: [(X1, y0, a), (X1, y0, b), (X1, y1, b), (X1, y1, a)]
    segs = segs or [(A0, A1, 'wain', c.S['wainH'])]
    wl = c.wg(side, 'wall', M['wall']); tr = c.wg(side, 'trim', M['vc'], cm=True)
    for (s0, s1, wkey, wh) in segs:
        wn = c.wg(side, wkey, M[wkey])
        hl = [(max(h0, s0), min(h1, s1), y0, y1) for (h0, h1, y0, y1) in holes if h1 > s0 and h0 < s1]
        xs = sorted({s0, s1} | {v for h in hl for v in h[:2]})
        for a, b in zip(xs, xs[1:]):
            hs = [(y0, y1) for (h0, h1, y0, y1) in hl if h0 <= a + 1e-6 and h1 >= b - 1e-6]
            cuts = sorted({0.0, H, wh} | {v for h in hs for v in h})
            for y0, y1 in zip(cuts, cuts[1:]):
                if any(y0 >= h[0] - 1e-6 and y1 <= h[1] + 1e-6 for h in hs): continue
                (wn if y1 <= wh + 1e-6 else wl).quad(Q(a, b, y0, y1))
        for (y0, y1, col, t) in ((wh - 0.02, wh + 0.03, c.S['trim'], 0.015), (0.0, 0.09, '#3a3530', 0.012)):
            xs2 = sorted({s0, s1} | {v for (h0, h1, hy0, hy1) in hl if hy0 < y1 and hy1 > y0 for v in (h0, h1)})
            for a, b in zip(xs2, xs2[1:]):
                if any(h0 <= a + 1e-6 and h1 >= b - 1e-6 and hy0 < y1 and hy1 > y0 for (h0, h1, hy0, hy1) in hl): continue
                if side == 'N': tr.cbox(a, b, y0, y1, Z0, Z0 + t, col)
                elif side == 'W': tr.cbox(X0, X0 + t, y0, y1, a, b, col)
                else: tr.cbox(X1 - t, X1, y0, y1, a, b, col)


def back_passage(c, x0, x1, top, depth=0.75, col=('#77736c', '#5d5a54', '#3f3d39')):
    """後牆開口後面的通道（往後面的廚房，不能進去）：短短一段暗一點的地板、兩側牆、盡頭的牆、天花板；算 N 那一組"""
    k = c.wg('N', 'passage', c.M['vc'], cm=True); z0, z1 = c.Z0 - depth, c.Z0
    k.cbox(x0, x1, -0.05, 0.0, z0, z1, col[0])
    k.poly([(x0, 0.0, z1), (x0, 0.0, z0), (x0, top + 0.3, z0), (x0, top + 0.3, z1)], col[1]); k.poly([(x1, 0.0, z0), (x1, 0.0, z1), (x1, top + 0.3, z1), (x1, top + 0.3, z0)], col[1])
    k.poly([(x0, 0.0, z0), (x1, 0.0, z0), (x1, top + 0.3, z0), (x0, top + 0.3, z0)], col[2]); k.poly([(x0, top + 0.3, z1), (x1, top + 0.3, z1), (x1, top + 0.3, z0), (x0, top + 0.3, z0)], col[1])
    k.cbox(x0 - 0.05, x0, 0.0, top + 0.05, c.Z0, c.Z0 + 0.02, c.S['trim']); k.cbox(x1, x1 + 0.05, 0.0, top + 0.05, c.Z0, c.Z0 + 0.02, c.S['trim'])   # 門框
    k.cbox(x0 - 0.05, x1 + 0.05, top, top + 0.05, c.Z0, c.Z0 + 0.02, c.S['trim'])


def curtain(c, x0, x1, y0, y1, z, key, fn=None, col=None, n=2, gap=0.02):
    """門簾（n 片，中間開縫）：fn＝整面一張圖（各片取圖的那一段），col＝素色；掛在牆內側 z，橫桿跟著"""
    w_ = (x1 - x0 - gap * (n - 1)) / n
    m = c.wg('N', key, c.mat(key, fn)) if fn else c.wg('N', 'trim', c.M['vc'], cm=True)
    for k in range(n):
        a = x0 + k * (w_ + gap); b = a + w_
        if fn: uvquad(m, [(a, y0, z), (b, y0, z), (b, y1, z), (a, y1, z)], ((a - x0) / (x1 - x0), 0.0, (b - x0) / (x1 - x0), 1.0))
        else: m.cbox(a, b, y0, y1, z - 0.004, z + 0.004, col)
    ccyl(c.wg('N', 'wmetal', c.M['vcm'], cm=True), (x0 - 0.04, y1 + 0.02, z), (x1 + 0.04, y1 + 0.02, z), 0.012, '#8a8f92', seg=6)


# ================= 林家乾麵 =================
def lin_front(c):
    """店面整面開著：鐵捲門捲在上面（從店裡看得到開口兩側的導軌、最下面那一片和拉把），右邊 1.1 m 牆墩貼營業時間；開口外一小段騎樓地"""
    X0, X1, Z1 = c.X0, c.X1, c.Z1; M = c.M; wh = c.S['wainH']; o0, o1 = LAY['front']['open']; oh = 2.55; T0, T1 = Z1 - 0.02, Z1 + 0.24
    wl = c.wg('S', 'wall', M['wall']); wn = c.wg('S', 'wain', M['wain']); tr = c.wg('S', 'trim', M['vc'], cm=True); mt = c.wg('S', 'wmetal', M['vcm'], cm=True)
    for (a, b) in ((X0, o0), (o1, X1)):
        wn.box(a, b, 0.0, wh, T0, T1); wl.box(a, b, wh, H, T0, T1)
        tr.cbox(a, b, wh - 0.02, wh + 0.03, T0 - 0.015, T0, c.S['trim']); tr.cbox(a, b, 0.0, 0.09, T0 - 0.012, T0, '#3a3530')
    wl.box(o0, o1, oh, H, T0, T1)                                                                   # 開口上面的樑（捲軸箱在外面）
    for (x, s) in ((o0, 1), (o1, -1)): mt.cbox(min(x, x + s * 0.05), max(x, x + s * 0.05), 0.0, oh, T1 - 0.1, T1 - 0.02, '#7d8286')   # 導軌
    mt.cbox(o0 + 0.04, o1 - 0.04, oh - 0.07, oh, T1 - 0.09, T1 - 0.03, '#8a8f92')                    # 鐵捲門最下面那一片
    for x in (o0 + 1.0, (o0 + o1) / 2, o1 - 1.0): mt.cbox(x - 0.06, x + 0.06, oh - 0.11, oh - 0.07, T1 - 0.1, T1 - 0.06, '#55595c')   # 拉把
    tr.cbox(o0, o1, -0.05, 0.0, Z1, Z1 + 0.5, '#9a9893')                                            # 開口外的騎樓地（接到窗景照片）
    tr.cbox(o0, o1, 0.0, 0.006, T0, T0 + 0.06, '#8a8f92')                                           # 地上的鐵捲門溝
    c.pic('S', 'hours', 'lin_hours.png', o1 + 0.37, o1 + 0.73, 1.3, 1.6, inset=0.035)


def noodle_cart(c, it):
    """煮麵攤車（店面左邊，朝街上）：不鏽鋼車身＋四個輪子、左半三口鍋（滾水＋麵杓、大骨湯、滷汁）、右半玻璃櫥（生麵、青菜、餛飩；上層滷蛋、豆干）、
    店員那一側的層架（碗、外帶碗）、上面一顆罩著鐵網的燈泡"""
    x0, x1 = it['x'] - it['w'] / 2, it['x'] + it['w'] / 2; z0, z1 = it['z'] - it['d'] / 2, it['z'] + it['d'] / 2; h = it['h']; st, vm, vc = c.steel, c.vm, c.vc
    st.box(x0, x1, 0.14, h - 0.03, z1 - 0.04, z1); st.box(x0, x0 + 0.04, 0.14, h - 0.03, z0, z1); st.box(x1 - 0.04, x1, 0.14, h - 0.03, z0, z1)
    st.box(x0, x1, 0.14, 0.18, z0, z1); st.box(x0 + 0.04, x1 - 0.04, 0.5, 0.52, z0 + 0.02, z1 - 0.04)
    st.box(x0 - 0.02, x1 + 0.02, h - 0.03, h, z0 - 0.02, z1 + 0.02)
    vc.cbox(x0 + 0.05, x1 - 0.05, h - 0.3, h - 0.26, z1, z1 + 0.012, '#b8322a')                       # 朝街上那一面的紅色飾條
    for (wx, wz) in ((x0 + 0.12, z0 + 0.1), (x1 - 0.12, z0 + 0.1), (x0 + 0.12, z1 - 0.1), (x1 - 0.12, z1 - 0.1)):
        ccyl(vm, (wx, 0.14, wz), (wx, 0.1, wz), 0.014, '#6a6e72', seg=6); ccyl(vc, (wx - 0.025, 0.06, wz), (wx + 0.025, 0.06, wz), 0.06, '#2a2a2a', seg=12)
    pz = (z0 + z1) / 2; top = h
    pots = [(x0 + 0.32, 0.25, 0.3, '#dfe6e6'), (x0 + 0.82, 0.2, 0.27, '#d9c7a0'), (x0 + 1.2, 0.13, 0.2, '#5a3a22')]
    for (px, r, ph, col) in pots:
        clathe(vm, [(0.0, 0.0), (r, 0.0), (r, ph), (r + 0.015, ph + 0.01), (r + 0.015, ph + 0.025), (0.0, 0.02)], px, top - 0.12, pz, '#c9ced2', seg=20)
        ccyl(vc, (px, top - 0.12 + ph - 0.035, pz), (px, top - 0.12 + ph - 0.03, pz), r - 0.008, col, seg=18)
    bx, ly = pots[0][0], top - 0.12 + pots[0][2]
    for k in range(3):                                                                              # 麵杓（鐵絲籃、竹柄斜靠在店員那一側）
        a = 0.6 + k * 1.0; cx_, cz_ = bx + 0.13 * math.cos(a), pz + 0.13 * math.sin(a)
        clathe(vm, [(0.0, 0.0), (0.045, 0.005), (0.06, 0.08), (0.057, 0.08), (0.0, 0.008)], cx_, ly - 0.07, cz_, '#a9aeb2', seg=10)
        ccyl(vm, (cx_, ly + 0.01, cz_), (cx_ - 0.04 + 0.03 * k, ly + 0.45, z0 - 0.03), 0.009, '#9a7a52', seg=5)
    ccyl(vm, (pots[1][0] + 0.05, ly + 0.02, pz), (pots[1][0] + 0.12, ly + 0.4, z0), 0.008, '#b9bec2', seg=5)   # 湯杓
    gx0, gx1, gz0, gz1, gy0, gy1 = x0 + 1.42, x1 - 0.06, z0 + 0.06, z1 - 0.06, top, top + 0.48       # 玻璃櫥
    gl = c.extra.setdefault('cartglass', Mesh(f'wz_{c.sid}_cartglass', c.M['glass']))
    for q in ([(gx0, gy0, gz1), (gx1, gy0, gz1), (gx1, gy1, gz1), (gx0, gy1, gz1)], [(gx1, gy0, gz0), (gx0, gy0, gz0), (gx0, gy1, gz0), (gx1, gy1, gz0)],
              [(gx0, gy0, gz0), (gx0, gy0, gz1), (gx0, gy1, gz1), (gx0, gy1, gz0)], [(gx1, gy0, gz1), (gx1, gy0, gz0), (gx1, gy1, gz0), (gx1, gy1, gz1)],
              [(gx0, gy1, gz1), (gx1, gy1, gz1), (gx1, gy1, gz0), (gx0, gy1, gz0)], [(gx0, gy0 + 0.25, gz0), (gx1, gy0 + 0.25, gz0), (gx1, gy0 + 0.25, gz1), (gx0, gy0 + 0.25, gz1)]): gl.quad(q)
    for (a, b) in ((gx0, gz0), (gx0, gz1), (gx1, gz0), (gx1, gz1)): vm.cbox(a - 0.012, a + 0.012, gy0, gy1, b - 0.012, b + 0.012, '#b9bec2')
    vm.cbox(gx0 - 0.012, gx1 + 0.012, gy1, gy1 + 0.015, gz0 - 0.012, gz1 + 0.012, '#b9bec2')
    rr = c.rng; seg = (gx1 - gx0 - 0.04) / 3
    for k in range(5):                                                                              # 生麵（黃色一球一球）
        csph(vc, (gx0 + 0.07 + k * 0.075, gy0 + 0.04, gz1 - 0.12 - (k % 2) * 0.1), 0.05, '#e3c463', seg=8, rings=5, sy=0.45)
    food_tray(c, gx0 + 0.02 + seg, gx0 + 0.02 + 2 * seg - 0.02, gy0 + 0.07, gz0 + 0.04, gz1 - 0.04, '#5f8f3a')   # 青菜
    for k in range(10): csph(vc, (gx0 + 0.04 + 2 * seg + rr.uniform(0.02, seg - 0.04), gy0 + 0.035, gz0 + rr.uniform(0.08, gz1 - gz0 - 0.08)), 0.028, '#efe2cf', seg=7, rings=4, sy=0.6)   # 餛飩
    for k in range(8): csph(vc, (gx0 + 0.06 + k * 0.06, gy0 + 0.29, gz0 + 0.12 + (k % 2) * 0.14), 0.026, '#7a4a26', seg=8, rings=5, sy=1.25)   # 滷蛋
    for k in range(4): vc.crbox(gx0 + 0.55 + k * 0.08, gx0 + 0.62 + k * 0.08, gy0 + 0.26, gy0 + 0.285, gz0 + 0.1, gz1 - 0.1, '#5a3a22', r=0.006, seg=1)   # 豆干
    for j, bxx in enumerate((x0 + 0.35, x0 + 0.75, x0 + 1.15)):                                     # 店員那一側的層架：碗
        for k in range(7 if j < 2 else 4): clathe(vc, [(0.0, 0.0), (0.055, 0.0), (0.085, 0.07), (0.08, 0.075), (0.0, 0.006)], bxx, 0.52 + k * 0.028, z0 + 0.25, '#f4f1ea' if j < 2 else '#e9e1cf', seg=12)
    for k in range(12): ccyl(vc, (x1 - 0.5, 0.52 + k * 0.012, z0 + 0.25), (x1 - 0.5, 0.53 + k * 0.012, z0 + 0.25), 0.075, '#f7f5ef', seg=12)   # 外帶紙碗
    clathe(vc, [(0.0, 0.0), (0.13, 0.0), (0.15, 0.26), (0.155, 0.27), (0.0, 0.27)], x0 + 0.35, 0.18, z1 - 0.22, '#c8322a', seg=14)              # 下層：紅色水桶、疊起來的塑膠籃
    for k in range(3): vc.crbox(x0 + 0.65, x0 + 1.05, 0.18 + k * 0.09, 0.26 + k * 0.09, z0 + 0.08, z1 - 0.1, ['#2f6fb0', '#e8b640', '#2f6fb0'][k], r=0.01, seg=1)
    rl = top + 0.62                                                                                  # 湯鍋上方的鐵桿：掛著的湯杓、麵杓、漏勺
    for (a, b) in ((x0 + 0.05, x0 + 0.06), (x0 + 1.33, x0 + 1.34)): ccyl(vm, (a, top, z0 + 0.06), (a, rl, z0 + 0.06), 0.012, '#9aa0a4', seg=6)
    ccyl(vm, (x0 + 0.05, rl, z0 + 0.06), (x0 + 1.34, rl, z0 + 0.06), 0.01, '#9aa0a4', seg=6)
    for k in range(5):
        hx = x0 + 0.2 + k * 0.24; ccyl(vm, (hx, rl, z0 + 0.06), (hx, rl - 0.32, z0 + 0.07), 0.006, '#b9bec2', seg=5)
        clathe(vm, [(0.0, 0.0), (0.04 if k % 2 else 0.055, 0.0), (0.05 if k % 2 else 0.06, 0.05), (0.0, 0.05)], hx, rl - 0.37, z0 + 0.07, '#b9bec2', seg=10)
    c.wood.rbox(gx0 - 0.02, gx0 + 0.3, top, top + 0.025, z0 + 0.02, z0 + 0.22, r=0.005, seg=1)       # 砧板＋一小堆蔥花
    for k in range(14): csph(vc, (gx0 + 0.05 + rr.uniform(0, 0.2), top + 0.03, z0 + 0.06 + rr.uniform(0, 0.12)), 0.012, '#5f9a3a', seg=5, rings=3, sy=0.5)
    lx, lz = it['x'], it['z']                                                                       # 罩著鐵網的燈泡（從天花板吊下來）
    ccyl(vc, (lx, H, lz), (lx, 2.64, lz), 0.005, '#2a2a2a', seg=4); c.warm.sphere((lx, 2.53, lz), 0.055, seg=10, rings=6)
    for k in range(6): a = k * PI / 3; ccyl(vm, (lx + 0.075 * math.cos(a), 2.63, lz + 0.075 * math.sin(a)), (lx + 0.08 * math.cos(a), 2.44, lz + 0.08 * math.sin(a)), 0.004, '#3a3a3a', seg=3, caps=False)
    c.block(x0 - 0.02, x1 + 0.02, z0 - 0.02, z1 + 0.02, 'noodle_cart')


def red_cooker(c, x, y, z):
    """紅色的大電鍋（白飯；沒有品牌）"""
    r, hh = 0.18, 0.27
    clathe(c.vc, [(0.0, 0.0), (r * 0.9, 0.0), (r, 0.03), (r, hh), (r * 0.95, hh + 0.01), (0.0, hh + 0.01)], x, y, z, '#b8322a', seg=18)
    clathe(c.vc, [(0.0, 0.0), (r * 0.95, 0.0), (r * 0.7, 0.07), (0.05, 0.1), (0.04, 0.13), (0.0, 0.13)], x, y + hh + 0.01, z, '#c9ced2', seg=18)
    for s in (-1, 1): c.vc.cbox(x + s * (r - 0.01) - 0.02, x + s * (r - 0.01) + 0.02, y + hh - 0.06, y + hh - 0.02, z - 0.06, z + 0.06, '#2a2a2a')
    c.vc.cbox(x - 0.04, x + 0.04, y + 0.05, y + 0.1, z + r - 0.01, z + r + 0.01, '#f2f2ee')


def altar(c, x, y, z):
    """神明桌（後牆高處的紅色小層板）：神像（只做輪廓）、香爐、兩盞紅燈"""
    vc = c.vc
    vc.cbox(x - 0.4, x + 0.4, y - 0.04, y, c.Z0, c.Z0 + 0.3, '#8c2a22'); vc.cbox(x - 0.4, x + 0.4, y - 0.2, y - 0.04, c.Z0, c.Z0 + 0.03, '#8c2a22')
    for s in (-1, 1): vc.cbox(x + s * 0.38 - 0.02, x + s * 0.38 + 0.02, y - 0.2, y - 0.04, c.Z0, c.Z0 + 0.28, '#7a2420')
    clathe(vc, [(0.0, 0.0), (0.07, 0.0), (0.06, 0.12), (0.045, 0.16), (0.0, 0.17)], x, y, c.Z0 + 0.12, '#c9a24a', seg=12); csph(vc, (x, y + 0.2, c.Z0 + 0.12), 0.035, '#d6b46a', seg=10, rings=6)
    clathe(vc, [(0.0, 0.0), (0.05, 0.0), (0.06, 0.05), (0.055, 0.06), (0.0, 0.01)], x, y, c.Z0 + 0.25, '#b8962e', seg=12)   # 香爐
    for k in range(3): ccyl(vc, (x - 0.02 + k * 0.02, y + 0.05, c.Z0 + 0.25), (x - 0.025 + k * 0.025, y + 0.22, c.Z0 + 0.25), 0.002, '#7a4a2a', seg=3, caps=False)
    for s in (-1, 1):
        ccyl(vc, (x + s * 0.25, y, c.Z0 + 0.15), (x + s * 0.25, y + 0.1, c.Z0 + 0.15), 0.025, '#c8322a', seg=10); c.warm.sphere((x + s * 0.25, y + 0.13, c.Z0 + 0.15), 0.03, seg=8, rings=5)


def lin_condiments(c, it):
    """自取的小桌（右牆）：筷子筒、湯匙、餐巾紙、辣椒醬、烏醋、小碟子"""
    x0, x1, z0, z1 = it['x'] - it['w'] / 2, it['x'] + it['w'] / 2, it['z'] - it['d'] / 2, it['z'] + it['d'] / 2; h = it['h']; v = c.vc
    counter(c, x0, x1, z0, z1, h=h, top='steel', front='#cfd6cc', why='condiments')
    cx = (x0 + x1) / 2
    ccyl(v, (cx, h, z0 + 0.12), (cx, h + 0.17, z0 + 0.12), 0.04, '#b8322a', seg=10)
    for k in range(9): a = k * 0.7; ccyl(v, (cx + 0.02 * math.cos(a), h + 0.12, z0 + 0.12 + 0.02 * math.sin(a)), (cx + 0.025 * math.cos(a), h + 0.27, z0 + 0.12 + 0.025 * math.sin(a)), 0.004, '#e6d4ae', seg=4, caps=False)
    c.vm.cbox(cx - 0.1, cx + 0.1, h, h + 0.05, z0 + 0.24, z0 + 0.4, '#c9ced2')
    for k in range(5): c.vm.cbox(cx - 0.08 + k * 0.035, cx - 0.065 + k * 0.035, h + 0.05, h + 0.06, z0 + 0.26, z0 + 0.38, '#e2e4e6')
    v.crbox(cx - 0.07, cx + 0.07, h, h + 0.08, z0 + 0.45, z0 + 0.58, '#f4f1ea', r=0.008, seg=1)
    clathe(v, [(0.0, 0.0), (0.04, 0.0), (0.042, 0.09), (0.03, 0.1), (0.0, 0.1)], cx - 0.06, h, z1 - 0.12, '#a8241a', seg=10)
    clathe(v, [(0.0, 0.0), (0.03, 0.0), (0.03, 0.13), (0.012, 0.17), (0.012, 0.2), (0.0, 0.2)], cx + 0.07, h, z1 - 0.12, '#2a1c14', seg=10)
    for k in range(6): clathe(v, [(0.0, 0.0), (0.04, 0.0), (0.05, 0.015), (0.0, 0.004)], cx + 0.07, h + k * 0.012, z1 - 0.28, '#f4f1ea', seg=10)


def build_lin(c):
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1
    floor_ceiling(c)
    kc = item('kitchen_curtain'); kx0, kx1 = kc['x'] - kc['w'] / 2, kc['x'] + kc['w'] / 2; ktop = 2.0
    wall_side(c, 'N', holes=[(kx0, kx1, 0.0, ktop)]); wall_side(c, 'W'); wall_side(c, 'E')
    back_passage(c, kx0, kx1, ktop)
    curtain(c, kx0 + 0.02, kx1 - 0.02, 0.75, ktop - 0.03, Z0 + 0.03, 'curtain', fn='lin_curtain.png')
    lin_front(c)
    noodle_cart(c, item('noodle_cart'))
    bc = item('back_counter'); bx0, bx1, bz0, bz1 = bc['x'] - bc['w'] / 2, bc['x'] + bc['w'] / 2, bc['z'] - bc['d'] / 2, bc['z'] + bc['d'] / 2
    counter(c, bx0, bx1, bz0, bz1, h=bc['h'], top='steel', front='#d9dadb', why='back_counter')
    for k in range(7):                                                                               # 下櫃的門縫、把手
        xx = bx0 + 0.6 * (k + 0.5); c.vm.cbox(xx - 0.004, xx + 0.004, 0.1, bc['h'] - 0.06, bz1, bz1 + 0.004, '#9aa0a4')
        if k < 6: c.vm.cbox(xx + 0.22, xx + 0.25, 0.62, 0.7, bz1, bz1 + 0.02, '#7d8286')
    c.vm.cbox(bx0 + 0.25, bx0 + 0.8, bc['h'] - 0.04, bc['h'] + 0.001, bz0 + 0.08, bz1 - 0.08, '#4a4e52')            # 水槽
    ccyl(c.vm, (bx0 + 0.52, bc['h'], bz0 + 0.06), (bx0 + 0.52, bc['h'] + 0.3, bz0 + 0.06), 0.014, '#c9ced2', seg=6); ccyl(c.vm, (bx0 + 0.52, bc['h'] + 0.3, bz0 + 0.06), (bx0 + 0.52, bc['h'] + 0.27, bz0 + 0.25), 0.011, '#c9ced2', seg=6)
    c.wood.rbox(bx0 + 1.05, bx0 + 1.6, bc['h'], bc['h'] + 0.035, bz0 + 0.1, bz1 - 0.08, r=0.006, seg=1)          # 砧板＋菜刀
    c.vm.cbox(bx0 + 1.3, bx0 + 1.48, bc['h'] + 0.035, bc['h'] + 0.04, bz0 + 0.25, bz0 + 0.36, '#d0d4d8'); c.vc.cbox(bx0 + 1.48, bx0 + 1.6, bc['h'] + 0.035, bc['h'] + 0.055, bz0 + 0.28, bz0 + 0.33, '#2a2a2a')
    red_cooker(c, bx0 + 2.05, bc['h'], (bz0 + bz1) / 2)
    c.vm.cbox(bx0 + 2.55, bx1 - 0.15, bc['h'], bc['h'] + 0.015, bz0 + 0.08, bz1 - 0.08, '#b9bec2')                 # 碗盤架
    for k in range(5):
        for j in range(2): clathe(c.vc, [(0.0, 0.0), (0.055, 0.0), (0.085, 0.07), (0.08, 0.075), (0.0, 0.006)], bx0 + 2.7 + k * 0.17, bc['h'] + 0.015 + j * 0.03, bz0 + 0.3, '#f4f1ea', seg=12)
    for k in range(3): clathe(c.vc, [(0.0, 0.0), (0.03, 0.0), (0.03, 0.16), (0.012, 0.21), (0.012, 0.24), (0.0, 0.24)], bx0 + 3.75 + k * 0.08, bc['h'], bz0 + 0.12, ['#2a1c14', '#3a2a1a', '#7a5a2a'][k], seg=10)
    on_wall(c, 'N', wall_shelf, 'N', bx0 + 0.1, bx1 - 0.2, 1.75, depth=0.28, items='bowls')
    on_wall(c, 'N', altar, -2.3, 2.42, 0.0)
    ft = item('fridge'); drink_fridge(c, ft['x'] - ft['w'] / 2, ft['x'] + ft['w'] / 2, Z0 + 0.01, h=ft['h'], d=ft['d'] - 0.03, face='+z')
    lin_condiments(c, item('condiments'))
    cols = ['#c8322a', '#2f5fa8']
    for t in items('table_sq'):
        table(c, t['x'], t['z'], 0.75, 0.75, top='formica', col='#9fc2b6', legc='#9aa0a4')   # 翠綠的美耐板桌面（老麵店）
        for (a, b, z_) in ((-0.375, 0.375, t['z'] - 0.375), (-0.375, 0.375, t['z'] + 0.375)): c.vm.cbox(t['x'] + a, t['x'] + b, 0.7, 0.74, z_ - 0.006, z_ + 0.006, '#b9bec2')   # 桌邊的鋁條
        for x_ in (t['x'] - 0.375, t['x'] + 0.375): c.vm.cbox(x_ - 0.006, x_ + 0.006, 0.7, 0.74, t['z'] - 0.375, t['z'] + 0.375, '#b9bec2')
        LS.table_set(c, t['x'] + 0.2, t['z'] + 0.14, 'dian')
    for k, s in enumerate(LAY['seats']): chair(c, s['x'], s['z'], s['yaw'], 'stool', cols[(k // 2 + k) % 2])
    tvi = item('tv'); tv(c, 'E', tvi['z'], tvi['y'], 0.85); c.wg('E', 'trim', c.M['vc'], cm=True).cbox(X1 - 0.32, X1, tvi['y'] - 0.31, tvi['y'] - 0.27, tvi['z'] - 0.35, tvi['z'] + 0.35, '#3a3a3a')
    fi = item('wall_fan'); on_wall(c, 'E', wall_fan, X1, fi['y'], fi['z'], '-x')
    mi = item('menu_strips'); a0, a1 = mi['z'] - mi['w'] / 2, mi['z'] + mi['w'] / 2; y0, y1 = mi['y'] - mi['h'] / 2, mi['y'] + mi['h'] / 2
    frame_board(c, 'W', a0, a1, y0, y1, '#5a3a22'); c.pic('W', 'menu', 'lin_menu.png', a0, a1, y0, y1, inset=0.016)
    ci = item('calendar'); c.pic('W', 'calendar', 'calendar_oct.png', ci['z'] - 0.15, ci['z'] + 0.15, ci['y'] - 0.21, ci['y'] + 0.21, inset=0.02)
    c.wg('W', 'trim', c.M['vc'], cm=True).cbox(X0, X0 + 0.03, ci['y'] + 0.22, ci['y'] + 0.24, ci['z'] - 0.01, ci['z'] + 0.01, '#3a3a3a')
    tubes(c, [(-2.0, -0.2, 'z'), (1.6, -0.2, 'z'), (-1.0, -2.95, 'x')])
    on_wall(c, 'W', LS.ac_unit, X0, 2.45, 1.2, '+x')
    cz_, cy_, r_ = -2.55, 2.3, 0.15                                                                  # 右牆的掛鐘（自取小桌上方）
    c.pic('E', 'clock', 'clock_face.png', cz_ - r_, cz_ + r_, cy_ - r_, cy_ + r_, inset=0.035)
    cr = c.wg('E', 'trim', c.M['vc'], cm=True)
    for j in range(20):
        a0, a1 = j / 20 * 2 * PI, (j + 1) / 20 * 2 * PI; R = r_ + 0.018
        ccyl(cr, (X1 - 0.03, cy_ + math.sin(a0) * R, cz_ + math.cos(a0) * R), (X1 - 0.03, cy_ + math.sin(a1) * R, cz_ + math.cos(a1) * R), 0.02, '#c8322a', seg=5)
    ccyl(c.vc, (X1 - 0.09, 0.02, Z0 + 0.32), (X1 - 0.05, 1.3, Z0 + 0.12), 0.012, '#c9a24a', seg=6)    # 冰箱旁邊牆角的掃把、畚箕
    for k in range(9): a_ = -0.5 + k * 0.125; ccyl(c.vc, (X1 - 0.09, 0.3, Z0 + 0.3), (X1 - 0.09 + 0.05 * a_, 0.0, Z0 + 0.36 + 0.06 * a_), 0.01, '#8a6a3a', seg=4)
    c.vc.crbox(X1 - 0.14, X1 - 0.03, 0.0, 0.32, Z0 + 0.5, Z0 + 0.53, '#2f6fb0', r=0.01, seg=1)


# ================= 巷子裡定食 =================
def lantern(c, x, z, y=2.45, r=0.16, hh=0.32):
    """和紙燈籠（吊燈，下緣在 2.45 m 以上：遊戲鏡頭在人物後上方，太低會擋住人物）"""
    m = c.extra.setdefault('washi', Mesh(f'wz_{c.sid}_washi', c.M['washi']))
    bm = L.lathe([(0.0, 0.0), (r * 0.55, 0.0), (r, hh * 0.25), (r, hh * 0.75), (r * 0.55, hh), (0.0, hh)], seg=16); m.add_bm(bm, Matrix.Translation(g2b(x, y, z))); bm.free()
    for yy in (y, y + hh): ccyl(c.vc, (x, yy - 0.012, z), (x, yy + 0.012, z), r * 0.57, '#2f2219', seg=14)
    ccyl(c.vc, (x, y + hh, z), (x, H, z), 0.005, '#2a2a2a', seg=4)


def stool_high(c, x, z, col='#5a3c28'):
    """吧台高腳凳（座面 0.72 m：配置的座位 lift 0.27，和 Café 的吧台一樣）：圓木座面、四支外斜的腳、腳踏圈"""
    clathe(c.vc, [(0.0, 0.0), (0.18, 0.0), (0.185, 0.015), (0.18, 0.035), (0.0, 0.035)], x, 0.685, z, '#a0764e', seg=16)
    for k in range(4):
        a = k * PI / 2 + PI / 4; ccyl(c.vc, (x + 0.1 * math.cos(a), 0.69, z + 0.1 * math.sin(a)), (x + 0.17 * math.cos(a), 0.0, z + 0.17 * math.sin(a)), 0.016, col, seg=6)
    for k in range(8):
        a0, a1 = k * PI / 4, (k + 1) * PI / 4; r = 0.145
        ccyl(c.vm, (x + r * math.cos(a0), 0.26, z + r * math.sin(a0)), (x + r * math.cos(a1), 0.26, z + r * math.sin(a1)), 0.008, '#8a8f92', seg=4, caps=False)


def jp_set(c, x, z, h=0.74):
    """定食店的桌上：小木盤、醬油瓶、七味粉、牙籤筒"""
    v = c.vc
    v.crbox(x - 0.1, x + 0.1, h, h + 0.015, z - 0.06, z + 0.06, '#3a2a1e', r=0.004, seg=1)
    clathe(v, [(0.0, 0.0), (0.025, 0.0), (0.027, 0.09), (0.012, 0.12), (0.012, 0.14), (0.0, 0.14)], x - 0.06, h + 0.015, z, '#2a1c14', seg=10)
    clathe(v, [(0.0, 0.0), (0.016, 0.0), (0.016, 0.07), (0.0, 0.075)], x, h + 0.015, z + 0.02, '#c8322a', seg=8)
    ccyl(v, (x + 0.06, h + 0.015, z - 0.01), (x + 0.06, h + 0.08, z - 0.01), 0.018, '#d9c7a0', seg=8)


def maneki(c, x, y, z, yaw=PI / 2):
    """招財貓（白、紅項圈、舉右手；民俗擺飾）：朝 yaw"""
    v = c.vc; f = (math.sin(yaw), math.cos(yaw)); r_ = (math.cos(yaw), -math.sin(yaw))
    clathe(v, [(0.0, 0.0), (0.045, 0.0), (0.05, 0.04), (0.04, 0.09), (0.0, 0.095)], x, y, z, '#f4f1ea', seg=12)
    csph(v, (x, y + 0.125, z), 0.045, '#f4f1ea', seg=10, rings=7)
    ccyl(v, (x, y + 0.085, z), (x, y + 0.093, z), 0.042, '#c8322a', seg=12); csph(v, (x + f[0] * 0.04, y + 0.08, z + f[1] * 0.04), 0.01, '#e8b640', seg=6, rings=4)
    for s in (-1, 1): csph(v, (x + r_[0] * s * 0.028, y + 0.168, z + r_[1] * s * 0.028), 0.014, '#f4f1ea', seg=6, rings=4)   # 耳朵
    csph(v, (x + r_[0] * 0.05 + f[0] * 0.01, y + 0.14, z + r_[1] * 0.05 + f[1] * 0.01), 0.018, '#f4f1ea', seg=6, rings=4)     # 舉起來的手


def umbrella_stand(c, x, z):
    clathe(c.vc, [(0.0, 0.0), (0.11, 0.0), (0.12, 0.04), (0.12, 0.42), (0.125, 0.45), (0.1, 0.45), (0.1, 0.05), (0.0, 0.05)], x, 0.0, z, '#3f5f8a', seg=16)
    for k, col in enumerate(('#2a2a30', '#7a2a2a')):
        a = 0.8 + k * 2.2; px, pz = x + 0.04 * math.cos(a), z + 0.04 * math.sin(a)
        ccyl(c.vc, (px, 0.06, pz), (px + 0.03, 0.75, pz + 0.01), 0.035, col, seg=8, r2=0.012)
        ccyl(c.vm, (px + 0.03, 0.75, pz + 0.01), (px + 0.035, 0.86, pz + 0.012), 0.006, '#5a3a22', seg=5)


def teishoku_front(c):
    """店面：格子拉門（拉開、門外掛暖簾）、左邊小窗（竪格子）、右邊一大片窗（四格、上面捲起來的竹簾）；窗台以下是木頭腰牆；門外一小段騎樓地"""
    X0, X1, Z1 = c.X0, c.X1, c.Z1; M = c.M; fr = LAY['front']; sill, head = fr['sill'], fr['head']; dx, dw = fr['door']['x'], fr['door']['w']; dh = 2.1
    T0, T1 = Z1 - 0.02, Z1 + 0.2; wh = c.S['wainH']
    wl = c.wg('S', 'wall', M['wall']); wn = c.wg('S', 'wain', M['wain']); tr = c.wg('S', 'trim', M['vc'], cm=True); gl = c.wg('S', 'glass', M['glass'])
    ops = sorted([(a, b, 'win') for a, b in fr['windows']] + [(dx - dw / 2, dx + dw / 2, 'door')])
    xs = [X0]
    for a, b, k in ops: xs += [a, b]
    xs.append(X1)
    for i in range(0, len(xs), 2):
        a, b = xs[i], xs[i + 1]
        if b - a < 1e-3: continue
        wn.box(a, b, 0.0, wh, T0, T1); wl.box(a, b, wh, H, T0, T1)
        tr.cbox(a, b, wh - 0.02, wh + 0.03, T0 - 0.015, T0, c.S['trim']); tr.cbox(a, b, 0.0, 0.09, T0 - 0.012, T0, '#2a1d14')
    fc = '#3d2a1c'
    for a, b, k in ops:
        top = dh if k == 'door' else head
        wl.box(a, b, top, H, T0, T1)
        if k == 'win':
            wn.box(a, b, 0.0, sill, T0, T1); tr.cbox(a - 0.03, b + 0.03, sill - 0.03, sill + 0.03, T0 - 0.06, T1, fc)   # 窗台
        tr.cbox(a - 0.04, b + 0.04, top - 0.02, top + 0.06, T0 - 0.04, T1, fc)                                      # 上框（鴨居）
        for x in (a, b): tr.cbox(x - 0.04, x + 0.04, 0.0 if k == 'door' else sill, top, T0 - 0.04, T1, fc)          # 兩側的框
        if k == 'door':
            tr.cbox(a, b, 0.0, 0.015, T0 - 0.02, T1, '#2a1d14')                                                    # 門檻（敷居）的溝
            continue
        n = max(1, round((b - a) / 1.0)); gz = (T0 + T1) / 2
        for j in range(1, n): x = a + j * (b - a) / n; tr.cbox(x - 0.025, x + 0.025, sill, top, gz - 0.03, gz + 0.03, fc)
        if b - a > 2.0: tr.cbox(a, b, 1.98, 2.02, gz - 0.03, gz + 0.03, fc)                                       # 欄間的橫木
        gl.quad([(b, sill + 0.02, gz), (a, sill + 0.02, gz), (a, top - 0.02, gz), (b, top - 0.02, gz)])
        if b - a < 1.0:                                                                                              # 小窗：竪格子（玻璃外面）
            x = a + 0.03
            while x < b - 0.03: tr.cbox(x - 0.011, x + 0.011, sill, top, T1 - 0.05, T1 - 0.02, '#4a3324'); x += 0.05
        else:
            for j in range(n):                                                                                       # 大窗：每一格上面捲起來的竹簾
                xa, xb = a + j * (b - a) / n + 0.04, a + (j + 1) * (b - a) / n - 0.04
                ccyl(tr, (xa, top - 0.08, T0 - 0.05), (xb, top - 0.08, T0 - 0.05), 0.035, '#b8955a', seg=10)
                for xx in (xa + 0.1, xb - 0.1): tr.cbox(xx - 0.005, xx + 0.005, top - 0.13, top - 0.02, T0 - 0.09, T0 - 0.08, '#e8dcc0')
    dx0, dx1 = dx - dw / 2, dx + dw / 2                                                                             # 門外的暖簾（三片；從店裡看是背面）
    nm = c.wg('S', 'noren', c.mat('noren', 'teishoku_noren.png', rough=0.9)); n = 3; gap = 0.025; w_ = (dx1 - dx0 - 0.08 - gap * (n - 1)) / n; zn = T1 + 0.08
    for k in range(n):
        a = dx0 + 0.04 + k * (w_ + gap); b = a + w_; u0, u1 = (a - dx0 - 0.04) / (dx1 - dx0 - 0.08), (b - dx0 - 0.04) / (dx1 - dx0 - 0.08)
        uvquad(nm, [(a, 1.42, zn), (b, 1.42, zn), (b, dh - 0.02, zn), (a, dh - 0.02, zn)], (u0, 0.0, u1, 1.0))   # 從街上看是正的「食」（雙面材質：店裡看到的是背面）
    ccyl(tr, (dx0, dh, zn), (dx1, dh, zn), 0.014, '#3d2a1c', seg=8)
    tr.cbox(X0, X1, -0.05, 0.0, T1, Z1 + 0.5, '#9a9893')                                                            # 門外的騎樓地（接到窗景照片）


def teishoku_counter(c):
    """木吧台（左端接到左牆）：客人那一面是直木條、淺色木檯面往客人那一側凸出、後面高一階的出餐台；右端廚房的半門（出水台＋兩片矮門）"""
    ci = item('counter'); x0, x1 = ci['x'] - ci['w'] / 2, ci['x'] + ci['w'] / 2; z0, z1 = ci['z'] - ci['d'] / 2, ci['z'] + ci['d'] / 2; h = ci['h']; v = c.vc
    v.crbox(x0, x1, 0.0, h - 0.06, z0, z1, '#4a3324', r=0.006, seg=1)
    k = 0; x = x0 + 0.06
    while x < x1 - 0.04: v.cbox(x - 0.02, x + 0.02, 0.1, h - 0.08, z1, z1 + 0.018, '#7a5a3e'); x += 0.09
    v.cbox(x0, x1, 0.0, 0.1, z1 - 0.02, z1 + 0.025, '#2a1d14')
    c.wood.rbox(x0, x1, h - 0.06, h, z0 + 0.12, z1 + 0.12, r=0.01, seg=2)
    c.wood.rbox(x0, x1, h, h + 0.18, z0, z0 + 0.12, r=0.008, seg=2)
    c.block(x0, x1, z0, z1, 'counter')
    for j in range(5): clathe(v, [(0.0, 0.0), (0.05, 0.0), (0.07, 0.06), (0.065, 0.065), (0.0, 0.006)], -2.8 + j * 1.0, h + 0.18, z0 + 0.06, '#3a3a40' if j % 2 else '#e9e1cf', seg=12)   # 出餐台上的碗
    for s in item_seats_counter():
        clathe(v, [(0.0, 0.0), (0.03, 0.0), (0.035, 0.08), (0.0, 0.08)], s['x'] + 0.18, h, z1 + 0.0, '#c9b8a0', seg=10)           # 茶杯
        v.cbox(s['x'] - 0.12, s['x'] + 0.1, h, h + 0.006, z1 - 0.05, z1 + 0.06, '#3a2a1e')                                          # 筷子架＋筷子
    sx0, sx1 = x1, x1 + 1.0
    counter(c, sx0, sx1, z0, z1, h=0.9, top='wood', front='#4a3324', why='service')                                             # 出水台
    clathe(v, [(0.0, 0.0), (0.06, 0.0), (0.065, 0.2), (0.04, 0.24), (0.045, 0.26), (0.0, 0.26)], sx0 + 0.25, 0.9, (z0 + z1) / 2, '#cfe0e6', seg=12)   # 水壺
    cups_stack(c, sx0 + 0.5, 0.9, (z0 + z1) / 2, 5)
    for j in range(6): v.cbox(sx0 + 0.65, sx1 - 0.05, 0.9 + j * 0.018, 0.912 + j * 0.018, z0 + 0.06, z1 - 0.06, '#5a3c28' if j % 2 else '#7a5a3e')   # 托盤
    dx0, dx1 = sx1, c.X1
    for x in (dx0 + 0.02,): v.cbox(x - 0.03, x + 0.03, 0.0, 1.3, (z0 + z1) / 2 - 0.04, (z0 + z1) / 2 + 0.04, '#3d2a1c')
    lw = (dx1 - dx0 - 0.06) / 2
    for j in range(2):                                                                                                           # 兩片矮門（直木條）
        a = dx0 + 0.05 + j * lw; b = a + lw - 0.01; zc = (z0 + z1) / 2
        v.cbox(a, b, 1.17, 1.22, zc - 0.02, zc + 0.02, '#4a3324'); v.cbox(a, b, 0.3, 0.35, zc - 0.02, zc + 0.02, '#4a3324')
        x = a + 0.04
        while x < b - 0.02: v.cbox(x - 0.012, x + 0.012, 0.35, 1.17, zc - 0.012, zc + 0.012, '#7a5a3e'); x += 0.055
    c.block(sx0, dx1, z0, z1, 'service')


def item_seats_counter(): return [s for s in LAY['seats'] if s.get('lift')]


def teishoku_kitchen(c):
    """開放廚房（吧台後面）：不鏽鋼工作檯（水槽、三口爐＋鍋、烤魚爐、大電鍋、味噌湯鍋、盤子）、排油煙罩、碗架、後面的暖簾門、冰箱；地板是灰色止滑磚"""
    X0, X1, Z0 = c.X0, c.X1, c.Z0; ki = item('kitchen'); kz1 = ki['z'] + ki['d'] / 2
    kf = Mesh(f'wz_{c.sid}_kfloor', L.pbr(f'wz_{c.sid}_kfloor', 'concrete_floor_painted', tile=1.4, target='#8f8c86', contrast=0.5, maps=('diff',), res=256, rough_value=0.7))
    kf.box(X0, X1, -0.04, 0.004, Z0, ci_back(c)); kf.finish(c.root)
    bz0, bz1 = Z0, Z0 + 0.62; bx0, bx1 = X0 + 0.1, 2.45
    counter(c, bx0, bx1, bz0, bz1, h=0.9, top='steel', front='#c9ced2', why='kitchen_back')
    v, vm = c.vc, c.vm; y = 0.9
    vm.cbox(bx0 + 0.2, bx0 + 0.75, y - 0.04, y + 0.001, bz0 + 0.08, bz1 - 0.08, '#4a4e52')                                            # 水槽
    ccyl(vm, (bx0 + 0.47, y, bz0 + 0.06), (bx0 + 0.47, y + 0.32, bz0 + 0.06), 0.014, '#c9ced2', seg=6); ccyl(vm, (bx0 + 0.47, y + 0.32, bz0 + 0.06), (bx0 + 0.47, y + 0.29, bz0 + 0.26), 0.011, '#c9ced2', seg=6)
    for j, bx in enumerate((-2.3, -1.65, -1.0)):                                                                                       # 三口爐＋鍋
        ccyl(v, (bx, y, (bz0 + bz1) / 2), (bx, y + 0.03, (bz0 + bz1) / 2), 0.15, '#202020', seg=14)
        if j == 0: clathe(vm, [(0.0, 0.0), (0.17, 0.0), (0.17, 0.28), (0.16, 0.28), (0.0, 0.01)], bx, y + 0.03, (bz0 + bz1) / 2, '#b9bec2', seg=16)
        elif j == 1: clathe(v, [(0.0, 0.0), (0.12, 0.02), (0.2, 0.08), (0.21, 0.09), (0.0, 0.09)], bx, y + 0.03, (bz0 + bz1) / 2, '#2b2b2b', seg=16); ccyl(v, (bx + 0.2, y + 0.1, (bz0 + bz1) / 2), (bx + 0.42, y + 0.13, (bz0 + bz1) / 2), 0.014, '#2b2b2b', seg=6)
        else: clathe(vm, [(0.0, 0.0), (0.12, 0.0), (0.12, 0.14), (0.11, 0.14), (0.0, 0.01)], bx, y + 0.03, (bz0 + bz1) / 2, '#c9ced2', seg=14)
    gx = -0.2                                                                                                                         # 烤魚爐（裡面紅色的火）
    vm.cbox(gx - 0.32, gx + 0.32, y, y + 0.32, bz0 + 0.05, bz1 - 0.05, '#9aa0a4'); v.cbox(gx - 0.27, gx + 0.27, y + 0.08, y + 0.18, bz1 - 0.06, bz1 - 0.045, '#1a1a1a')
    c.extra.setdefault('grill', Mesh(f'wz_{c.sid}_grill', L.flat(f'GLOW_wz_{c.sid}_grill', '#ff7a3a', rough=0.5, emit=B.srgb('#ff5a1a')))).box(gx - 0.25, gx + 0.25, y + 0.2, y + 0.215, bz0 + 0.1, bz1 - 0.08)
    for k in range(2): v.crbox(gx - 0.2 + k * 0.22, gx - 0.02 + k * 0.22, y + 0.1, y + 0.13, bz0 + 0.2, bz1 - 0.15, '#a8743a', r=0.01, seg=1)   # 鯖魚
    LS.rice_cooker(c, 0.55, y, (bz0 + bz1) / 2, big=True)
    clathe(vm, [(0.0, 0.0), (0.18, 0.0), (0.18, 0.3), (0.19, 0.31), (0.0, 0.02)], 1.15, y, (bz0 + bz1) / 2, '#c9ced2', seg=18); ccyl(v, (1.15, y + 0.26, (bz0 + bz1) / 2), (1.15, y + 0.265, (bz0 + bz1) / 2), 0.17, '#b8935a', seg=16)   # 味噌湯
    ccyl(vm, (1.2, y + 0.27, (bz0 + bz1) / 2), (1.32, y + 0.55, bz0 + 0.1), 0.008, '#b9bec2', seg=5)
    for j in range(2):
        for k in range(6): clathe(v, [(0.0, 0.0), (0.1, 0.0), (0.12, 0.02), (0.0, 0.005)], 1.75 + j * 0.3, y + k * 0.022, (bz0 + bz1) / 2, '#f4f1ea' if j == 0 else '#3a3a40', seg=14)
    hood = c.wg('N', 'ksteel', c.M['steel'])                                                                                          # 排油煙罩（算後牆那一組）
    hood.box(-2.65, -0.65, 2.05, 2.45, Z0, Z0 + 0.72); hood.box(-2.0, -1.3, 2.45, H, Z0, Z0 + 0.35)
    c.wg('N', 'kglow', c.M['warm']).box(-2.5, -0.8, 2.045, 2.05, Z0 + 0.1, Z0 + 0.6)
    on_wall(c, 'N', wall_shelf, 'N', 0.3, 2.4, 1.55, depth=0.28, items='bowls')
    on_wall(c, 'N', wall_shelf, 'N', 0.3, 2.4, 1.95, depth=0.28, items='cups')
    on_wall(c, 'N', wall_shelf, 'N', -3.85, -2.9, 1.6, depth=0.25, items='jars')
    nx0, nx1 = 2.6, 3.35                                                                                                              # 往後面的暖簾門
    back_passage(c, nx0, nx1, 1.95, col=('#6f6c66', '#5a5650', '#3a3834'))
    curtain(c, nx0 + 0.02, nx1 - 0.02, 1.2, 1.92, Z0 + 0.03, 'knoren', col='#22314a', n=3)
    fx0, fx1 = 3.45, 3.95                                                                                                             # 冰箱（不鏽鋼、兩門）
    c.steel.box(fx0, fx1, 0.0, 1.85, Z0 + 0.02, Z0 + 0.66)
    for (ya, yb) in ((1.05, 1.82), (0.08, 1.0)): vm.cbox(fx0 + 0.04, fx0 + 0.06, ya + 0.15, yb - 0.15, Z0 + 0.66, Z0 + 0.7, '#3a3d40')
    vm.cbox(fx0, fx1, 1.02, 1.035, Z0 + 0.66, Z0 + 0.665, '#3a3d40')
    tubes(c, [(-1.4, Z0 + 1.0, 'x'), (1.4, Z0 + 1.0, 'x')])
    return kz1


def ci_back(c):
    ci = item('counter'); return ci['z'] - ci['d'] / 2


def build_teishoku(c):
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M
    M['tile'] = L.pbr(f'wz_{c.sid}_ktile', 'long_white_tiles', tile=0.8, target='#eeece6', contrast=0.7, normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.3)
    M['washi'] = L.flat(f'GLOW_wz_{c.sid}_washi', '#f6efdc', rough=0.7, emit=B.srgb('#b09a72'))
    floor_ceiling(c, battens='#5a4030')
    zk = ci_back(c)                                                                                                                   # 廚房那一段（吧台後面）：白磁磚到 1.6 m
    wall_side(c, 'N', holes=[(2.6, 3.35, 0.0, 1.95)], segs=[(X0, X1, 'tile', 1.6)])
    for sd in ('W', 'E'): wall_side(c, sd, segs=[(Z0, zk, 'tile', 1.6), (zk, Z1, 'wain', c.S['wainH'])])
    teishoku_front(c)
    gk = item('genkan'); gx0, gx1, gz0 = gk['x'] - gk['w'] / 2, gk['x'] + gk['w'] / 2, gk['z'] - gk['d'] / 2
    gm = Mesh(f'wz_{c.sid}_genkan', L.pbr(f'wz_{c.sid}_genkan', 'floor_tiles_06', tile=0.6, target='#cfc6b4', contrast=0.7, normal=0.3, maps=('diff', 'nor'), res=256, rough_value=0.4))
    gm.box(gx0, gx1, -0.04, 0.004, gz0, Z1 - 0.02); gm.finish(c.root)
    c.vc.cbox(gx0, gx1, 0.0, 0.012, gz0 - 0.03, gz0 + 0.01, '#2a1d14')
    rg = item('register'); rx0, rx1, rz0, rz1 = rg['x'] - rg['w'] / 2, rg['x'] + rg['w'] / 2, rg['z'] - rg['d'] / 2, rg['z'] + rg['d'] / 2
    counter(c, rx0, rx1, rz0, rz1, h=rg['h'], top='wood', front='#4a3324', why='register')
    LS.register(c, rg['x'], rg['h'], rz0 + 0.3, face='+z')
    maneki(c, rg['x'] - 0.12, rg['h'], rz1 - 0.12, yaw=PI / 2)
    c.vc.crbox(rg['x'] + 0.08, rg['x'] + 0.2, rg['h'], rg['h'] + 0.05, rz1 - 0.2, rz1 - 0.12, '#d9cfbf', r=0.004, seg=1)                     # 名片盒
    clathe(c.vc, [(0.0, 0.0), (0.045, 0.0), (0.06, 0.04), (0.055, 0.045), (0.0, 0.005)], rg['x'] + 0.14, rg['h'], rz1 - 0.34, '#e8e0d0', seg=12)
    for k in range(6): csph(c.vc, (rg['x'] + 0.12 + 0.03 * math.cos(k), rg['h'] + 0.03, rz1 - 0.34 + 0.03 * math.sin(k)), 0.011, ['#f2f2ee', '#9fd3c4', '#f2c6d0'][k % 3], seg=6, rings=4)
    c.pic('W', 'hours', 'teishoku_hours.png', rz1 - 0.38, rz1 - 0.02, 1.42, 1.72, inset=0.016)
    ub = item('umbrella'); umbrella_stand(c, ub['x'], ub['z'])
    teishoku_counter(c)
    teishoku_kitchen(c)
    mb = item('menu_beam'); bx0, bx1 = mb['x'] - mb['w'] / 2, mb['x'] + mb['w'] / 2
    c.vc.cbox(bx0, bx1, mb['y'] - 0.05, mb['y'] + 0.07, mb['z'] - 0.06, mb['z'] + 0.06, '#3d2a1c')                                              # 掛木札的橫樑
    fu = c.extra.setdefault('fuda', Mesh(f'wz_{c.sid}_fuda', c.mat('fuda', 'teishoku_fuda.png', rough=0.7, clip=True, cull=True)))
    fb = c.extra.setdefault('fudab', Mesh(f'wz_{c.sid}_fudab', c.mat('fudab', 'teishoku_fuda_back.png', rough=0.7, clip=True, cull=True)))
    fw = 1.5; fx0 = mb['x'] - fw / 2; fz = mb['z'] + 0.065; fy1 = mb['y'] - 0.06; fy0 = fy1 - fw / 3                                        # 五片木札（貼圖 3:1；每片約 24×48 cm，鏡頭 4 m 外還看得出是菜單）
    uvquad(fu, [(fx0, fy0, fz), (fx0 + fw, fy0, fz), (fx0 + fw, fy1, fz), (fx0, fy1, fz)], (0.0, 0.0, 1.0, 1.0))                               # 正面（客人那一側）
    uvquad(fb, [(fx0 + fw, fy0, fz - 0.004), (fx0, fy0, fz - 0.004), (fx0, fy1, fz - 0.004), (fx0 + fw, fy1, fz - 0.004)], (1.0, 0.0, 0.0, 1.0))   # 背面（廚房那一側：沒有字的木片，形狀和正面疊在一起）
    for f in (0.095, 0.294, 0.492, 0.69, 0.889): ccyl(c.vc, (fx0 + f * fw, fy1, fz - 0.002), (fx0 + f * fw, mb['y'] - 0.05, fz - 0.002), 0.003, '#d9c7a0', seg=3, caps=False)   # 掛木札的細繩（貼圖裡每片的中心）
    for t in LAY['items']:
        if t['kind'] == 'table2': table(c, t['x'], t['z'], 0.7, 0.7, top='wood', legc='#3a2a1e'); jp_set(c, t['x'] + 0.18, t['z'] - 0.18)
        elif t['kind'] == 'table4': table(c, t['x'], t['z'], 1.2, 0.75, top='wood', legc='#3a2a1e'); jp_set(c, t['x'] + 0.4, t['z'])
    for s in LAY['seats']:
        if s.get('lift'): stool_high(c, s['x'], s['z'])
        else: chair(c, s['x'], s['z'], s['yaw'], 'wood', '#5a3c28')
    cl = item('clock'); r_ = cl['r']; c.pic('W', 'clock', 'clock_face.png', cl['z'] - r_, cl['z'] + r_, cl['y'] - r_, cl['y'] + r_, inset=0.04)
    cr = c.wg('W', 'trim', M['vc'], cm=True)
    for j in range(20):
        a0, a1 = j / 20 * 2 * PI, (j + 1) / 20 * 2 * PI; R = r_ + 0.02
        ccyl(cr, (X0 + 0.035, cl['y'] + math.sin(a0) * R, cl['z'] + math.cos(a0) * R), (X0 + 0.035, cl['y'] + math.sin(a1) * R, cl['z'] + math.cos(a1) * R), 0.022, '#5a3c28', seg=5)
    sh = item('shelf_wall'); a0, a1 = sh['z'] - sh['w'] / 2, sh['z'] + sh['w'] / 2
    on_wall(c, 'E', wall_shelf, 'E', a0, a1, sh['y'], depth=0.24, items='none')
    m = c.wg('E', 'trim', M['vc'], cm=True)
    for k, (col, prof) in enumerate((('#6a4a3a', [(0.0, 0.0), (0.06, 0.0), (0.08, 0.06), (0.06, 0.16), (0.035, 0.19), (0.0, 0.19)]),
                                     ('#d9cfbf', [(0.0, 0.0), (0.05, 0.0), (0.07, 0.1), (0.05, 0.13), (0.0, 0.13)]),
                                     ('#3f4f5f', [(0.0, 0.0), (0.045, 0.0), (0.05, 0.08), (0.03, 0.2), (0.02, 0.24), (0.0, 0.24)]))):
        clathe(m, prof, X1 - 0.12, sh['y'], a0 + 0.3 + k * 0.45, col, seg=14)
    csph(m, (X1 - 0.12, sh['y'] + 0.12, a1 - 0.2), 0.09, '#3f6a3a', seg=10, rings=6); clathe(m, [(0.0, 0.0), (0.06, 0.0), (0.07, 0.07), (0.0, 0.07)], X1 - 0.12, sh['y'], a1 - 0.2, '#8a5a3a', seg=12)
    p = item('plant_big'); plant(c, p['x'], p['z'], h=1.3)
    for t in LAY['items']:
        if t['kind'] in ('table2', 'table4'): lantern(c, t['x'], t['z'])
    for x in (-3.0, -1.6, -0.2, 1.2): lantern(c, x, -1.95, r=0.13, hh=0.26)


# ================= 收尾 =================
def check_blocks(c):
    """零件登記的阻擋框要在配置的阻擋框裡（容許 6 cm）：不然遊戲裡人會走進家具"""
    lb = [(b[0] - b[2] / 2, b[0] + b[2] / 2, b[1] - b[3] / 2, b[1] + b[3] / 2) for b in LAY['blocks']]
    prob = []
    for (x0, x1, z0, z1, why) in c.blocks:
        tol = 0.06; xs = [x0 + tol + (x1 - x0 - 2 * tol) * i / 4 for i in range(5)]; zs = [z0 + tol + (z1 - z0 - 2 * tol) * j / 4 for j in range(5)]
        out = [(round(x, 2), round(z, 2)) for x in xs for z in zs if not any(a <= x <= b and cz <= z <= d for (a, b, cz, d) in lb)]
        if out: prob.append({'what': why, 'box': [x0, x1, z0, z1], 'outside': out[:4]})
    return prob


def finish(c):
    Dd = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}
    for k, ms in c.WG.items():
        for key, m in ms.items():
            uv = key in ('wall', 'wain', 'tile'); mg = key not in c.pics and key not in ('screen',)
            m.finish(c.root, props={'dir': Dd[k]}, uv=uv, merge=mg)
    for m in (c.vc, c.vm, c.tube, c.warm, c.fridgel, c.steel): m.finish(c.root, uv=False)
    c.wood.finish(c.root)
    c.scr.finish(c.root, uv=False, merge=False)
    for k, m in c.extra.items(): m.finish(c.root, uv=False, merge=k not in ('fuda', 'fudab'))
    L.merge_by_material(c.root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: '')
    st = L.export(OUT, gpu_instances=False)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    prob = check_blocks(c)
    L.write_json(OUT[:-4] + '.json', dict(st if isinstance(st, dict) else {}, shop=SHOP, layout=ALL['version'], tris_total=tris, seats=len(LAY['seats']), block_problems=prob))
    print(json.dumps({'shop': SHOP, 'out': os.path.relpath(OUT, L.ROOT), 'tris': tris, 'seats': len(LAY['seats']), 'block_problems': prob}, ensure_ascii=False))
    return prob


if __name__ == '__main__':
    c = Ctx(SHOP)
    {'lin': build_lin, 'teishoku': build_teishoku}[SHOP](c)
    finish(c)
