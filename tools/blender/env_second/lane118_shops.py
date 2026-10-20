"""118 巷的店走得進去（LANE118-SHOPS-1020；使用者 10-20 試玩 v9.10.2：「118巷店員為什麼都站在店外 我要的是店裡可以進去 店員也在裡面阿 認真設計每個店面」）
→ 每間店一個室內區域的 GLB＋配置：assets/models/env/second_ai/l118_<id>.glb、l118_<id>.layout.json。LAWWW2-C 2026-10-20；Blender 5.2：
  /opt/blenv/bin/python tools/blender/env_second/lane118_shops.py [-- --shop dian|self|…|all] [--out-dir assets/models/env/second_ai]
店名、菜單、營業時間照 AA_280（虛構店名，D77：不畫商標、沒有真實品牌）；店員是誰、和哪條故事有關由 AA 定（LANE118-SHOP-STORY-1020），這裡只做店的樣子和站位。
做法（和美國的亞洲超市、法學院圖書館同一套，遊戲端 Z3.room＋attachRoomGLB）：
  座標：每間店自己的區域座標，x＝店面寬度方向（−W/2…W/2）、z＝深度（−D/2 後牆…+D/2 店面玻璃、門），y 往上；單位公尺。
  牆：四面各自一組 WALL_<N|W|E|S>_*（props dir＝往室內的法線）：鏡頭退到牆外時那一面淡出；廚房在後牆外面（從出菜口看得到），也算 N 那一組。
  店面玻璃外面一張「門口看出去的巷子」（tools/blender/env_second/render_cycles.py 從 118 巷街景 GLB 拍的，WALL_S_view）。
  發光：日光燈、吊燈、冰箱、螢幕是 GLOW_ 材質（遊戲整天亮，和美國的超市一樣）。
配置（遊戲讀）：bounds、h、door、spawn（進門）、exits（出門回 118 巷）、street（這間店在 118 巷的門口座標、出來站的位置）、
  counter、clerk（店員站位：櫃台後面，面向客人）、order（點餐的互動點）、seats（每張椅子：x、z、yaw、kind、table）、interact（看）、blocks（碰撞框）。
  配置寫完先用和遊戲一樣的導航格（0.4 m、牆內縮 0.25 m、人物半徑 0.3／0.33 m）檢查：出生點走得到出口、點餐、每一張椅子（seatApproach 的候選點）。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
import lane118_shops_tex as TX   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUTDIR = os.path.join(L.ROOT, arg('--out-dir', 'assets/models/env/second_ai'))
GEN = TX.GEN
LAY = json.loads((lambda s: s[s.index('{', s.index('const LANE118_LAYOUT=')):s.rindex('}') + 1])(open(os.path.join(L.ROOT, 'src/data/lane118_layout.js'), encoding='utf-8').read()))
H = 3.2
PI = math.pi

# 每間店：室內寬（店面寬減兩側壁柱）、深度、地板、牆、腰牆、木頭、門的位置（x）、照明
SPEC = {
    'dian': dict(W=5.6, D=8.0, floor=('terrazzo_tiles', '#c8bba6', 1.2), wall='#efe2c8', wain=('long_white_tiles', '#4f7a68', 1.0), wainH=1.1, wood=('walnut_veneer', '#7a5232'), door_x=1.5),
    'self': dict(W=6.6, D=9.0, floor=('floor_tiles_06', '#d3cdbf', 1.0), wall='#f4efe4', wain=('long_white_tiles', '#eceeea', 1.0), wainH=1.35, wood=('walnut_veneer', '#8a6a4a'), door_x=-2.2, trim='#c9463d'),
    'tea': dict(W=2.6, D=4.6, floor=('concrete_floor_painted', '#bdb8ae', 1.5), wall='#f6f1e6', wain=('long_white_tiles', '#d9ebe0', 1.0), wainH=1.0, wood=('walnut_veneer', '#b08a5e'), door_x=-0.5, trim='#2f7d5b', cam=3.6),
    'home': dict(W=7.6, D=8.5, floor=('granite_tile', '#b9b2a6', 1.0), wall='#f1ebdd', wain=('long_white_tiles', '#e6e2d6', 1.0), wainH=1.3, wood=('walnut_veneer', '#7a5a3a'), door_x=-2.6, trim='#8c3b2a'),
    'cafe2': dict(W=6.6, D=9.0, floor=('herringbone_parquet', '#8d6c4c', 1.4), wall='#eee6d8', wain=('dark_wood', '#5c4231', 1.0), wainH=0.95, wood=('black_walnut_veneer_01', '#6a4a33'), door_x=2.2, trim='#3b2a1e', ceil='#e9e2d4'),
    'pasta': dict(W=7.6, D=8.5, floor=('terrazzo_tiles', '#d9d3c7', 1.2), wall='#f4efe6', wain=('rounded_square_tiled_wall', '#3d6b5c', 0.8), wainH=1.0, wood=('walnut_veneer', '#8a6440'), door_x=-2.6, trim='#2f5d50'),
    'korea': dict(W=6.6, D=8.5, floor=('concrete_floor_painted', '#aaa69d', 1.5), wall='#f3f0ea', wain=('walnut_veneer', '#a07850', 0.9), wainH=1.0, wood=('walnut_veneer', '#9a7048'), door_x=2.2, trim='#1f4e8c', kpass=True),
    'omu': dict(W=6.6, D=8.0, floor=('laminate_floor_02', '#c9a77c', 1.2), wall='#fbf3df', wain=('long_white_tiles', '#f0cf6a', 1.0), wainH=1.0, wood=('walnut_veneer', '#b08a5e'), door_x=-2.2, trim='#e0a030'),
    'noodle2': dict(W=6.6, D=8.5, floor=('floor_tiles_06', '#c6c0b2', 1.0), wall='#f2ede2', wain=('long_white_tiles', '#e7e9e6', 1.0), wainH=1.3, wood=('walnut_veneer', '#7a5a3a'), door_x=1.6, trim='#9c2f2a', kpass=True, noren='#9c2f2a'),
}


def img_mat(name, fn, rough=0.6, emit=0.0, alpha=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    if alpha:
        nt.links.new(tx.outputs['Alpha'], bs.inputs['Alpha'])
        try: m.surface_render_method = 'BLENDED'
        except Exception: pass
    m['tile'] = 1.0
    return m


def uvquad(mesh, pts, rect):
    """一個貼圖的四邊形（遊戲座標的四個點：左下、右下、右上、左上，從正面看逆時針）；rect＝(u0, v0, u1, v1)"""
    bm = mesh.bm; uvl = bm.loops.layers.uv.verify(); u0, v0, u1, v1 = rect
    f = bm.faces.new([bm.verts.new(g2b(*p)) for p in pts])
    for lp, uv in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = uv
    return f


class Shop:
    """一間店的建造狀態：材質、各材質的網格、配置（blocks、seats…）"""
    def __init__(self, sid):
        self.sid = sid; self.S = dict(SPEC[sid]); self.T = TX.SHOPS[sid]; s = self.S
        self.W, self.D = s['W'], s['D']; self.X0, self.X1, self.Z0, self.Z1 = -s['W'] / 2, s['W'] / 2, -s['D'] / 2, s['D'] / 2
        self.rng = random.Random(sum(ord(c) for c in sid) * 97)
        B.reset(texres=512)
        self.root = B.group(f'l118_{sid}', props={'kind': 'l118_shop', 'shop': sid, 'layout': f'l118_{sid}.layout.json'})
        self.blocks, self.seats, self.inter = [], [], []; self.clerk = self.order = self.counter = None
        fl, wn, wd = s['floor'], s['wain'], s['wood']
        self.M = M = {
            'floor': L.pbr(f'l118_{sid}_floor', fl[0], tile=fl[2], target=fl[1], contrast=0.6, normal=0.3, maps=('diff', 'nor'), res=512, rough_value=0.32),
            'wall': L.pbr(f'l118_{sid}_wall', 'white_plaster_02', tile=2.0, target=s['wall'], contrast=0.3, normal=0.1, maps=('diff', 'nor'), res=256, rough_value=0.85),
            'wain': L.pbr(f'l118_{sid}_wain', wn[0], tile=wn[2], target=wn[1], contrast=0.7, normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.25),
            'wood': L.pbr(f'l118_{sid}_wood', wd[0], tile=0.9, target=wd[1], contrast=0.8, normal=0.25, maps=('diff', 'nor'), res=256, rough_value=0.45),
            'vc': L.vc_material(f'l118_{sid}_vc', rough=0.6), 'vcm': L.vc_metal(f'l118_{sid}_vcmetal', rough=0.32, metal=0.4),
            'steel': L.flat('l118_steel', '#b9bec2', rough=0.28, metal=0.45),
            'glass': L.flat('l118_glass', '#dfe9ec', rough=0.05, alpha=0.16),
            'tube': L.flat('GLOW_l118_tube', '#ffffff', rough=0.3, emit=B.srgb('#f2f6ff')),
            'warm': L.flat('GLOW_l118_warm', '#ffe7c2', rough=0.4, emit=B.srgb('#ffc77a')),
            'fridge': L.flat('GLOW_l118_fridge', '#f4f8ff', rough=0.3, emit=B.srgb('#cfe0f4')),
            'ceil': L.flat(f'l118_{sid}_ceiling', s.get('ceil', '#f2efe8'), rough=0.9),
            'print': img_mat(f'l118_{sid}_print', f'l118_{sid}_print.png', rough=0.55),
            'screen': img_mat('GLOW_l118_screens', 'l118_screens.png', rough=0.3, emit=0.9),
        }
        vf = os.path.join(GEN, f'l118_view_{sid}.png')
        if os.path.exists(vf): M['view'] = img_mat(f'l118_{sid}_view', f'l118_view_{sid}.png', rough=0.9)
        # 累積的網格（一個材質一個；牆、廚房另外分組）
        self.vc = CMesh(f'l118_{sid}_props', M['vc']); self.vm = CMesh(f'l118_{sid}_metal', M['vcm'])
        self.wood = Mesh(f'l118_{sid}_woodparts', M['wood']); self.steel = Mesh(f'l118_{sid}_steel', M['steel'])
        self.tube = Mesh(f'l118_{sid}_tubes', M['tube']); self.warm = Mesh(f'l118_{sid}_warm', M['warm']); self.fridgel = Mesh(f'l118_{sid}_fridgelight', M['fridge'])
        self.prt = Mesh(f'l118_{sid}_prints', M['print']); self.scr = Mesh(f'l118_{sid}_screens', M['screen'])
        self.WG = {k: {} for k in 'NWES'}     # 每一面牆的網格：WG['N']['wall'] …

    # ---------- 配置 ----------
    def block(self, x0, x1, z0, z1, why):
        self.blocks.append(dict(x0=round(min(x0, x1), 3), x1=round(max(x0, x1), 3), z0=round(min(z0, z1), 3), z1=round(max(z0, z1), 3), why=why))

    def seat(self, x, z, yaw, table, kind='eat', ap=None, label=None):
        s = dict(x=round(x, 3), z=round(z, 3), yaw=round(yaw, 4), kind=kind, table=[round(table[0], 3), round(table[1], 3)])
        if ap: s['ap'] = [round(ap[0], 3), round(ap[1], 3)]
        if label: s['label'] = label
        self.seats.append(s)

    def look(self, iid, x, z, r, label, note=''):
        self.inter.append(dict(id=iid, x=round(x, 3), z=round(z, 3), r=r, label=label, note=note))

    # ---------- 牆的分組網格 ----------
    def wg(self, side, key, mat, cm=False):
        d = self.WG[side]
        if key not in d: d[key] = (CMesh if cm else Mesh)(f'WALL_{side}_{key}', mat)
        return d[key]


# ================= 共用零件（遊戲座標；yaw 只用 0、±π/2、π） =================
def rot(x, z, yaw):
    """區域座標的旋轉：面向 yaw（(sin, cos)）的本地座標 (lx 右手邊, lz 前方) → 世界的位移"""
    f = (math.sin(yaw), math.cos(yaw)); r = (math.cos(yaw), -math.sin(yaw))
    return lambda lx, lz: (x + lx * r[0] + lz * f[0], z + lx * r[1] + lz * f[1])


def rbox(m, T, lx0, lx1, y0, y1, lz0, lz1, col=None, r=0.0, seg=2):
    (ax, az), (bx, bz) = T(lx0, lz0), T(lx1, lz1)
    x0, x1, z0, z1 = min(ax, bx), max(ax, bx), min(az, bz), max(az, bz)
    if col is None: (m.rbox(x0, x1, y0, y1, z0, z1, r=r, seg=seg) if r > 0 else m.box(x0, x1, y0, y1, z0, z1))
    else: (m.crbox(x0, x1, y0, y1, z0, z1, col, r=r, seg=seg) if r > 0 else m.cbox(x0, x1, y0, y1, z0, z1, col))


def ccyl(m, a, b, r, col, seg=10, r2=None, caps=True):
    f0 = set(m.bm.faces); m.cyl(a, b, r, seg=seg, r2=r2, caps=caps); m.paint([q for q in m.bm.faces if q not in f0], col)


def csph(m, c, r, col, seg=10, rings=6, sy=1.0):
    f0 = set(m.bm.faces); m.sphere(c, r, seg=seg, rings=rings, sy=sy); m.paint([q for q in m.bm.faces if q not in f0], col)


def clathe(m, prof, x, y, z, col, seg=14):
    f0 = set(m.bm.faces); bm = L.lathe(prof, seg=seg); m.add_bm(bm, Matrix.Translation(g2b(x, y, z))); bm.free(); m.paint([q for q in m.bm.faces if q not in f0], col)


def table(c, cx, cz, w, d, top='wood', h=0.74, base='legs', col='#6b4a30', legc='#2b2b2b', block=True):
    """桌子：桌面（木紋／不鏽鋼／美耐板頂點色）＋桌腳（四腳或中間一支）；w＝x 方向、d＝z 方向"""
    x0, x1, z0, z1 = cx - w / 2, cx + w / 2, cz - d / 2, cz + d / 2
    if top == 'wood': c.wood.rbox(x0, x1, h - 0.035, h, z0, z1, r=0.008, seg=2)
    elif top == 'steel': c.steel.box(x0, x1, h - 0.025, h, z0, z1); c.vm.cbox(x0 + 0.02, x1 - 0.02, h - 0.1, h - 0.025, z0 + 0.02, z1 - 0.02, '#9aa0a4')
    else: c.vc.crbox(x0, x1, h - 0.03, h, z0, z1, col, r=0.006, seg=1)
    if base == 'legs':
        for lx in (x0 + 0.05, x1 - 0.05):
            for lz in (z0 + 0.05, z1 - 0.05): ccyl(c.vm, (lx, 0.0, lz), (lx, h - 0.035, lz), 0.018, legc, seg=8)
        c.vm.cbox(x0 + 0.05, x1 - 0.05, h - 0.09, h - 0.05, z0 + 0.04, z0 + 0.06, legc); c.vm.cbox(x0 + 0.05, x1 - 0.05, h - 0.09, h - 0.05, z1 - 0.06, z1 - 0.04, legc)
    else:
        ccyl(c.vm, (cx, 0.0, cz), (cx, h - 0.035, cz), 0.04, legc, seg=10); clathe(c.vm, [(0.0, 0.0), (0.24, 0.0), (0.22, 0.03), (0.05, 0.05), (0.0, 0.05)], cx, 0.0, cz, legc, seg=14)
    if block: c.block(x0 - 0.03, x1 + 0.03, z0 - 0.03, z1 + 0.03, 'table')


def chair(c, x, z, yaw, style='wood', col='#6b4a30'):
    """椅子：wood＝木頭靠背椅、stool＝紅色塑膠圓凳、steelstool＝不鏽鋼圓凳、bar＝吧檯高腳椅；(x, z) 是坐的位置，面向 yaw"""
    T = rot(x, z, yaw)
    if style == 'wood':
        sh = 0.45
        rbox(c.vc, T, -0.21, 0.21, sh - 0.035, sh, -0.2, 0.2, col, r=0.01, seg=1)
        for lx in (-0.18, 0.18):
            for lz in (-0.17, 0.17):
                (px, pz) = T(lx, lz); ccyl(c.vc, (px, 0.0, pz), (px, sh - 0.035, pz), 0.016, col, seg=6)
        for lx in (-0.18, 0.18): (px, pz) = T(lx, -0.19); ccyl(c.vc, (px, sh, pz), (px, 0.86, pz), 0.016, col, seg=6)
        rbox(c.vc, T, -0.2, 0.2, 0.7, 0.84, -0.205, -0.175, col, r=0.008, seg=1); rbox(c.vc, T, -0.18, 0.18, 0.55, 0.6, -0.2, -0.18, col)
    elif style == 'stool':
        clathe(c.vc, [(0.0, 0.0), (0.17, 0.0), (0.16, 0.02), (0.13, 0.4), (0.165, 0.41), (0.165, 0.45), (0.0, 0.45)], x, 0.0, z, col, seg=14)
    elif style == 'steelstool':
        ccyl(c.vm, (x, 0.43, z), (x, 0.46, z), 0.17, '#c4c8cb', seg=14)
        for k in range(4):
            a = k * PI / 2 + PI / 4; ccyl(c.vm, (x + 0.06 * math.cos(a), 0.43, z + 0.06 * math.sin(a)), (x + 0.14 * math.cos(a), 0.0, z + 0.14 * math.sin(a)), 0.012, '#b3b8bc', seg=6)
        ccyl(c.vm, (x - 0.11, 0.17, z - 0.11), (x + 0.11, 0.17, z + 0.11), 0.008, '#b3b8bc', seg=5); ccyl(c.vm, (x - 0.11, 0.17, z + 0.11), (x + 0.11, 0.17, z - 0.11), 0.008, '#b3b8bc', seg=5)
    elif style == 'bar':
        ccyl(c.vc, (x, 0.7, z), (x, 0.76, z), 0.19, col, seg=14); ccyl(c.vm, (x, 0.0, z), (x, 0.7, z), 0.025, '#2b2b2b', seg=8)
        ccyl(c.vm, (x, 0.0, z), (x, 0.025, z), 0.2, '#2b2b2b', seg=14); clathe(c.vm, [(0.15, 0.0), (0.16, 0.005), (0.16, 0.02), (0.15, 0.02)], x, 0.3, z, '#2b2b2b', seg=14)


def table_seats(c, cx, cz, w, d, sides, style='wood', col='#6b4a30', kind='eat', gap=0.3, n_per=1):
    """桌子旁邊的椅子：sides＝'-z' '+z' '-x' '+x'（椅子在桌子哪一邊）；坐的人面向桌子"""
    for sd in sides:
        for k in range(n_per):
            t = (k + 0.5) / n_per - 0.5
            if sd in ('-z', '+z'):
                x = cx + t * w; z = cz - d / 2 - gap if sd == '-z' else cz + d / 2 + gap; yaw = 0.0 if sd == '-z' else PI
            else:
                z = cz + t * d; x = cx - w / 2 - gap if sd == '-x' else cx + w / 2 + gap; yaw = PI / 2 if sd == '-x' else -PI / 2
            chair(c, x, z, yaw, style, col); c.seat(x, z, yaw, (cx, cz), kind)


def table_set(c, x, z, kind='tw'):
    """桌上的東西：筷筒、面紙盒、醬料（台灣小吃店）；kind＝tw／dian（多一罐辣油）／cafe（只有小花瓶、糖罐）／korea（餐具盒）"""
    v = c.vc
    if kind == 'cafe':
        clathe(v, [(0.0, 0.0), (0.03, 0.0), (0.035, 0.08), (0.015, 0.14), (0.018, 0.16), (0.0, 0.16)], x, 0.74, z, '#d8e4e0', seg=10)
        csph(v, (x + 0.005, 0.9, z), 0.025, '#e7b8c0', seg=8, rings=5); ccyl(v, (x + 0.12, 0.74, z + 0.02), (x + 0.12, 0.81, z + 0.02), 0.03, '#f1ede4', seg=10)
        return
    ccyl(v, (x, 0.74, z), (x, 0.9, z), 0.035, '#b8322a' if kind != 'korea' else '#c9ced2', seg=10)          # 筷筒
    for k in range(7): a = k * 0.9; ccyl(v, (x + 0.018 * math.cos(a), 0.86, z + 0.018 * math.sin(a)), (x + 0.02 * math.cos(a), 0.99, z + 0.02 * math.sin(a)), 0.004, '#e6d4ae', seg=4, caps=False)
    v.crbox(x + 0.07, x + 0.21, 0.74, 0.82, z - 0.06, z + 0.06, '#f4f1ea', r=0.008, seg=1); v.cbox(x + 0.12, x + 0.16, 0.82, 0.84, z - 0.03, z + 0.03, '#ffffff')   # 面紙盒
    clathe(v, [(0.0, 0.0), (0.028, 0.0), (0.03, 0.1), (0.012, 0.13), (0.012, 0.15), (0.0, 0.15)], x - 0.09, 0.74, z + 0.03, '#3a2416', seg=8)   # 醬油
    if kind == 'dian': clathe(v, [(0.0, 0.0), (0.04, 0.0), (0.042, 0.08), (0.035, 0.09), (0.0, 0.09)], x - 0.09, 0.74, z - 0.06, '#a8241a', seg=10)   # 辣油罐


def tubes(c, pts, L_=1.2):
    """日光燈（燈座＋燈管）：pts＝[(x, z, 'x'|'z')]"""
    for (x, z, ax) in pts:
        if ax == 'x': c.vc.cbox(x - L_ / 2 - 0.04, x + L_ / 2 + 0.04, H - 0.06, H, z - 0.07, z + 0.07, '#e9e9e6'); c.tube.cyl((x - L_ / 2, H - 0.085, z), (x + L_ / 2, H - 0.085, z), 0.016, seg=8)
        else: c.vc.cbox(x - 0.07, x + 0.07, H - 0.06, H, z - L_ / 2 - 0.04, z + L_ / 2 + 0.04, '#e9e9e6'); c.tube.cyl((x, H - 0.085, z - L_ / 2), (x, H - 0.085, z + L_ / 2), 0.016, seg=8)


def bamboo_lamp(c, x, z, y=2.6, r=0.2):   # 吊燈都在 2.5 m 以上：遊戲的鏡頭在人物後上方，太低會擋住人物
    """竹編吊燈（滇緬小館）：上下兩圈竹篾、直條、裡面一顆暖光燈泡"""
    ccyl(c.vc, (x, y + 0.3, z), (x, H, z), 0.006, '#2a2a2a', seg=4)
    for yy, rr in ((y + 0.3, r * 0.55), (y + 0.0, r)):
        for k in range(16):
            a0, a1 = k * 2 * PI / 16, (k + 1) * 2 * PI / 16
            ccyl(c.vc, (x + rr * math.cos(a0), yy, z + rr * math.sin(a0)), (x + rr * math.cos(a1), yy, z + rr * math.sin(a1)), 0.008, '#b88a4e', seg=4, caps=False)
    for k in range(14):
        a = k * 2 * PI / 14; ccyl(c.vc, (x + r * 0.55 * math.cos(a), y + 0.3, z + r * 0.55 * math.sin(a)), (x + r * math.cos(a), y - 0.02, z + r * math.sin(a)), 0.006, '#a87a42', seg=4, caps=False)
    c.warm.sphere((x, y + 0.12, z), 0.07, seg=10, rings=6)


def wall_fan(c, x, y, z, face):
    """壁扇（台灣小吃店）：face＝扇子面向的方向（'+x' '-x' '+z' '-z'），裝在對面那面牆上"""
    yaw = {'+z': 0.0, '-z': PI, '+x': PI / 2, '-x': -PI / 2}[face]; T = rot(x, z, yaw)
    rbox(c.vc, T, -0.06, 0.06, y - 0.08, y + 0.08, -0.03, 0.0, '#f2f2ee', r=0.01)
    a = T(0, 0.02); b = T(0, 0.18); ccyl(c.vc, (a[0], y, a[1]), (b[0], y - 0.05, b[1]), 0.022, '#f2f2ee', seg=8)
    h0 = T(0, 0.17); h1 = T(0, 0.3); ccyl(c.vc, (h0[0], y - 0.05, h0[1]), (h1[0], y - 0.08, h1[1]), 0.07, '#f2f2ee', seg=12)
    g = T(0, 0.33)
    for k in range(10):                                                              # 前面的網罩（放射狀細條）
        a_ = k * 2 * PI / 10; e = T(0.2 * math.cos(a_), 0.33)
        ccyl(c.vm, (g[0], y - 0.09, g[1]), (e[0], y - 0.09 + 0.2 * math.sin(a_), e[1]), 0.004, '#d9dadb', seg=3, caps=False)
    for k in range(3):                                                               # 三片扇葉（淡藍半透明的塑膠用淺藍代替）
        a_ = k * 2 * PI / 3 + 0.4; e = T(0.17 * math.cos(a_), 0.31)
        ccyl(c.vc, (g[0] * 0.6 + e[0] * 0.4, y - 0.09 + 0.07 * math.sin(a_), g[1] * 0.6 + e[1] * 0.4), (e[0], y - 0.09 + 0.17 * math.sin(a_), e[1]), 0.045, '#bcd6e6', seg=6, r2=0.02)


def ac_unit(c, x, y, z, face, w=0.9):
    """分離式冷氣的室內機（掛在牆上）"""
    yaw = {'+z': 0.0, '-z': PI, '+x': PI / 2, '-x': -PI / 2}[face]; T = rot(x, z, yaw)
    rbox(c.vc, T, -w / 2, w / 2, y, y + 0.28, 0.0, 0.22, '#f4f4f1', r=0.03, seg=2)
    rbox(c.vc, T, -w / 2 + 0.03, w / 2 - 0.03, y + 0.01, y + 0.05, 0.12, 0.225, '#d9dad6', r=0.0)
    rbox(c.vc, T, w / 2 - 0.12, w / 2 - 0.06, y + 0.2, y + 0.215, 0.215, 0.226, '#3fbf6a')


def plant(c, x, z, h=1.1, pot='#5a4a3e', leaf='#3f7a3a'):
    """發財樹（門口、櫃台旁）：花盆＋樹幹三支＋一層層的葉子（頂點色）"""
    clathe(c.vc, [(0.0, 0.0), (0.15, 0.0), (0.2, 0.32), (0.21, 0.34), (0.0, 0.34)], x, 0.0, z, pot, seg=14)
    c.vc.cbox(x - 0.17, x + 0.17, 0.3, 0.32, z - 0.17, z + 0.17, '#3a2a1e')
    rr = random.Random(int(abs(x * 100 + z * 37)))
    for k in range(3):
        a = k * 2 * PI / 3; tx, tz = x + 0.03 * math.cos(a), z + 0.03 * math.sin(a); ccyl(c.vc, (tx, 0.3, tz), (tx + 0.04 * math.cos(a), h * 0.7, tz + 0.04 * math.sin(a)), 0.016, '#8a6a48', seg=6)
    for k in range(26):
        a = rr.uniform(0, 2 * PI); rd = rr.uniform(0.05, 0.3); yy = rr.uniform(h * 0.62, h)
        px, pz = x + rd * math.cos(a), z + rd * math.sin(a)
        f0 = set(c.vc.bm.faces); c.vc.ell((px, yy, pz), 0.09, 0.012, 0.04, seg=6, rings=3, matrix=Matrix.Rotation(-a, 4, 'Z') @ Matrix.Rotation(rr.uniform(-0.4, 0.2), 4, 'X'))
        c.vc.paint([q for q in c.vc.bm.faces if q not in f0], leaf, k=rr.uniform(0.8, 1.15))


def drink_fridge(c, x0, x1, zb, h=1.95, d=0.62, face='+z'):
    """飲料冰箱（玻璃門、裡面發光、四層飲料；沒有品牌）：背靠 zb，面向 +z（face='+z'）或 −z"""
    s = 1 if face == '+z' else -1; zf = zb + s * d; zz = sorted((zb, zf))
    for (a, b, ya, yb, za, zb2) in ((x0, x1, 0.0, h, zb, zb + s * 0.03), (x0, x0 + 0.04, 0.0, h, zb, zf), (x1 - 0.04, x1, 0.0, h, zb, zf), (x0, x1, h - 0.14, h, zb, zf), (x0, x1, 0.0, 0.1, zb, zf)):
        c.vc.cbox(a, b, ya, yb, *sorted((za, zb2)), '#e8eaec')                                            # 外殼：背板、兩側、上下（空心：前面是玻璃門）
    zi = zf - s * 0.04; zl = zb + s * 0.035                                                               # 內面；發光的背板（離背板 5 mm）
    c.fridgel.quad([(x0 + 0.05, 0.12, zl), (x1 - 0.05, 0.12, zl), (x1 - 0.05, h - 0.15, zl), (x0 + 0.05, h - 0.15, zl)][::(1 if s > 0 else -1)])
    rr = c.rng
    for k in range(4):
        y = 0.18 + k * 0.42; c.vm.cbox(x0 + 0.05, x1 - 0.05, y - 0.012, y, min(zb + s * 0.05, zi), max(zb + s * 0.05, zi), '#c9ccce')
        n = int((x1 - x0 - 0.1) / 0.085)
        for j in range(n):
            bx = x0 + 0.09 + j * 0.085; col = rr.choice(['#c8322a', '#2f6fb0', '#e8b640', '#3b8f4a', '#f2f2ee', '#7a4a2a', '#e6702e'])
            for row in range(2):
                bz = zi - s * (0.08 + row * 0.13)
                if k % 2 == 0: clathe(c.vc, [(0.0, 0.0), (0.03, 0.0), (0.03, 0.17), (0.013, 0.22), (0.013, 0.25), (0.0, 0.25)], bx, y, bz, col, seg=8)
                else: ccyl(c.vc, (bx, y, bz), (bx, y + 0.12, bz), 0.032, col, seg=8)
    # 玻璃門＋門框（往外 1 cm）
    zg = zf + s * 0.01; c.vm.cbox(x0, x1, 0.0, 0.1, min(zf, zg + s * 0.02), max(zf, zg + s * 0.02), '#3a3d40'); c.vm.cbox(x0, x1, h - 0.14, h, min(zf, zg + s * 0.02), max(zf, zg + s * 0.02), '#3a3d40')
    for xx in (x0, x1 - 0.04): c.vm.cbox(xx, xx + 0.04, 0.1, h - 0.14, min(zf, zg + s * 0.02), max(zf, zg + s * 0.02), '#3a3d40')
    gl = c.M['glass']; m = c.extra.setdefault('fglass', Mesh(f'l118_{c.sid}_fridgeglass', gl))
    pts = [(x0 + 0.04, 0.1, zg), (x1 - 0.04, 0.1, zg), (x1 - 0.04, h - 0.14, zg), (x0 + 0.04, h - 0.14, zg)]
    m.quad(pts if s > 0 else pts[::-1])
    c.vm.cbox(x1 - 0.1, x1 - 0.08, 0.7, 1.3, min(zg, zg + s * 0.04), max(zg, zg + s * 0.04), '#c9ccce')   # 把手
    c.block(x0 - 0.02, x1 + 0.02, zz[0], zz[1] + (0.04 if s > 0 else 0), 'fridge')


def rice_cooker(c, x, y, z, big=True):
    """大同電鍋式的大電鍋（白飯）：鍋身、蓋子、把手"""
    r = 0.2 if big else 0.14; hh = 0.3 if big else 0.22
    clathe(c.vc, [(0.0, 0.0), (r * 0.9, 0.0), (r, 0.03), (r, hh), (r * 0.95, hh + 0.01), (0.0, hh + 0.01)], x, y, z, '#e8e4dc', seg=18)
    clathe(c.vc, [(0.0, 0.0), (r * 0.95, 0.0), (r * 0.7, 0.07), (0.05, 0.1), (0.04, 0.13), (0.0, 0.13)], x, y + hh + 0.01, z, '#d6d2ca', seg=18)
    for s in (-1, 1): c.vc.cbox(x + s * r - 0.02 * s - 0.02, x + s * r - 0.02 * s + 0.02, y + hh - 0.06, y + hh - 0.02, z - 0.06, z + 0.06, '#3a3a3a')


def water_station(c, x, z, face='+z'):
    """飲水機＋不鏽鋼杯（自取）"""
    s = 1 if face == '+z' else -1
    c.vc.crbox(x - 0.18, x + 0.18, 0.0, 1.05, z - 0.18, z + 0.18, '#eceeef', r=0.02, seg=1)
    clathe(c.vc, [(0.0, 0.0), (0.14, 0.0), (0.14, 0.38), (0.06, 0.45), (0.0, 0.45)], x, 1.05, z, '#b9d8ea', seg=14)
    for xx in (x - 0.07, x + 0.07): c.vm.cbox(xx - 0.02, xx + 0.02, 0.78, 0.84, *sorted((z + s * 0.18, z + s * 0.22)), '#3a3a3a')   # 出水口
    c.block(x - 0.2, x + 0.2, z - 0.2, z + 0.2, 'water')


def cups_stack(c, x, y, z, n=5):
    for k in range(n): clathe(c.vm, [(0.0, 0.0), (0.03, 0.0), (0.036, 0.075), (0.032, 0.075), (0.0, 0.004)], x, y + k * 0.018, z, '#c9ced2', seg=10)


def printed(c, side, x0, x1, y0, y1, key, inset=0.015):
    """牆上的印刷品（菜單、店名、海報）：side＝貼在哪面牆（N W E S），往室內 inset；key＝lane118_shops_tex 的區域"""
    rect = TX.uv(TX.REG, key); X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; m = c.wg(side, 'print', c.M['print'])
    if side == 'N': z = Z0 + inset; pts = [(x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z)]
    elif side == 'S': z = Z1 - inset; pts = [(x1, y0, z), (x0, y0, z), (x0, y1, z), (x1, y1, z)]
    elif side == 'W': x = X0 + inset; pts = [(x, y0, x1), (x, y0, x0), (x, y1, x0), (x, y1, x1)]       # W、E：x0、x1 當成 z 的範圍（由左到右：W 牆從 +z 看到 −z）
    else: x = X1 - inset; pts = [(x, y0, x0), (x, y0, x1), (x, y1, x1), (x, y1, x0)]
    uvquad(m, pts, rect)


def frame_board(c, side, a0, a1, y0, y1, col='#3a2a1e', t=0.03, inset=0.012):
    """印刷品的框（牆面往外 inset 的薄框；印刷品貼在框的前面）"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; m = c.wg(side, 'trim', c.M['vc'], cm=True)
    if side == 'N': m.cbox(a0 - t, a1 + t, y0 - t, y1 + t, Z0, Z0 + inset, col)
    elif side == 'S': m.cbox(a0 - t, a1 + t, y0 - t, y1 + t, Z1 - inset, Z1, col)
    elif side == 'W': m.cbox(X0, X0 + inset, y0 - t, y1 + t, a0 - t, a1 + t, col)
    else: m.cbox(X1 - inset, X1, y0 - t, y1 + t, a0 - t, a1 + t, col)


def tv(c, side, a, y, w=0.9):
    """掛在牆上的電視（家常菜：午間新聞）：side 牆、a＝沿著牆的位置、y＝中心高度"""
    h = w * 9 / 16; X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; m = c.wg(side, 'trim', c.M['vc'], cm=True); s = c.wg(side, 'screen', c.M['screen'])
    rect = TX.uv(TX.SCR, 'tv')
    if side == 'E':
        m.cbox(X1 - 0.07, X1, y - h / 2 - 0.02, y + h / 2 + 0.02, a - w / 2 - 0.02, a + w / 2 + 0.02, '#151618'); x = X1 - 0.072
        uvquad(s, [(x, y - h / 2, a - w / 2), (x, y - h / 2, a + w / 2), (x, y + h / 2, a + w / 2), (x, y + h / 2, a - w / 2)], rect)
    elif side == 'W':
        m.cbox(X0, X0 + 0.07, y - h / 2 - 0.02, y + h / 2 + 0.02, a - w / 2 - 0.02, a + w / 2 + 0.02, '#151618'); x = X0 + 0.072
        uvquad(s, [(x, y - h / 2, a + w / 2), (x, y - h / 2, a - w / 2), (x, y + h / 2, a - w / 2), (x, y + h / 2, a + w / 2)], rect)


def register(c, x, y, z, face='+z'):
    """收銀機（螢幕朝店員、客人那一面有小螢幕）＋刷卡機"""
    s = 1 if face == '+z' else -1
    c.vc.crbox(x - 0.2, x + 0.2, y, y + 0.1, z - 0.18, z + 0.18, '#2c2e31', r=0.01, seg=1)
    c.vc.crbox(x - 0.16, x + 0.16, y + 0.1, y + 0.13, z - 0.14, z + 0.1, '#3a3d41', r=0.005, seg=1)
    c.vc.cbox(x - 0.17, x + 0.17, y + 0.13, y + 0.36, z - s * 0.16, z - s * 0.13, '#202225')
    zz = z - s * 0.13 - s * 0.002; ya, yb = y + 0.15, y + 0.34                                   # 店員那一面的螢幕（朝 −s）
    pts = [(x + 0.15, ya, zz), (x - 0.15, ya, zz), (x - 0.15, yb, zz), (x + 0.15, yb, zz)] if s > 0 else [(x - 0.15, ya, zz), (x + 0.15, ya, zz), (x + 0.15, yb, zz), (x - 0.15, yb, zz)]
    uvquad(c.scr, pts, TX.uv(TX.SCR, 'pos'))
    c.vc.crbox(x + 0.26, x + 0.36, y, y + 0.03, z - 0.05, z + 0.12, '#2a2a2a', r=0.006, seg=1)


def shell(c, light='tube'):
    """地板、牆、腰牆、踢腳板、天花板、店面玻璃＋門、門外的巷子"""
    s = c.S; X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M; wh = s['wainH']
    fl = Mesh(f'l118_{c.sid}_floorm', M['floor'], tile=s['floor'][2]); fl.box(X0, X1, -0.05, 0.0, Z0, Z1); fl.finish(c.root)
    dx, dw = s['door_x'], 1.0
    for k in 'NWE':
        wl = c.wg(k, 'wall', M['wall']); wn = c.wg(k, 'wain', M['wain']); tr = c.wg(k, 'trim', M['vc'], cm=True)
        if k == 'N': Q = lambda y0, y1: [(X0, y0, Z0), (X1, y0, Z0), (X1, y1, Z0), (X0, y1, Z0)]
        elif k == 'W': Q = lambda y0, y1: [(X0, y0, Z1), (X0, y0, Z0), (X0, y1, Z0), (X0, y1, Z1)]
        else: Q = lambda y0, y1: [(X1, y0, Z0), (X1, y0, Z1), (X1, y1, Z1), (X1, y1, Z0)]
        if k != 'N' or not c.S.get('kpass'): wl.quad(Q(wh, H)); wn.quad(Q(0.0, wh))
        tc = s.get('trim', '#6b4a30')
        if k == 'N' and c.S.get('kpass'): continue
        if k == 'N': tr.cbox(X0, X1, wh - 0.02, wh + 0.03, Z0, Z0 + 0.015, tc); tr.cbox(X0, X1, 0.0, 0.09, Z0, Z0 + 0.012, '#3a3530')
        elif k == 'W': tr.cbox(X0, X0 + 0.015, wh - 0.02, wh + 0.03, Z0, Z1, tc); tr.cbox(X0, X0 + 0.012, 0.0, 0.09, Z0, Z1, '#3a3530')
        else: tr.cbox(X1 - 0.015, X1, wh - 0.02, wh + 0.03, Z0, Z1, tc); tr.cbox(X1 - 0.012, X1, 0.0, 0.09, Z0, Z1, '#3a3530')
    # 店面（S）：兩側壁柱、下面一段矮牆、上面招牌底下的牆；中間是鋁框玻璃＋玻璃門
    wl = c.wg('S', 'wall', M['wall']); wn = c.wg('S', 'wain', M['wain']); fr = c.wg('S', 'frame', M['vcm'], cm=True); gl = c.wg('S', 'glass', M['glass'])
    g0, g1, gy0, gy1 = X0 + 0.3, X1 - 0.3, 0.32, 2.6
    QS = lambda xa, xb, y0, y1: [(xb, y0, Z1), (xa, y0, Z1), (xa, y1, Z1), (xb, y1, Z1)]
    for (xa, xb) in ((X0, g0), (g1, X1)): wl.quad(QS(xa, xb, wh, H)); wn.quad(QS(xa, xb, 0.0, wh))
    wl.quad(QS(g0, g1, gy1, H))
    d0, d1 = dx - dw / 2, dx + dw / 2
    for (xa, xb) in ((g0, d0), (d1, g1)):
        if xb - xa > 0.05: wn.quad(QS(xa, xb, 0.0, gy0))
    fz0, fz1 = Z1 - 0.06, Z1 + 0.02
    fr.cbox(g0, g1, gy1 - 0.0, gy1 + 0.06, fz0, fz1, '#8f969b')                                         # 上框
    for (xa, xb) in ((g0, d0), (d1, g1)):
        if xb - xa < 0.05: continue
        fr.cbox(xa, xb, gy0 - 0.05, gy0, fz0, fz1, '#8f969b')                                          # 下框
        n = max(1, round((xb - xa) / 1.2))
        for j in range(n + 1): xx = xa + j * (xb - xa) / n; fr.cbox(xx - 0.03, xx + 0.03, gy0, gy1, fz0 - 0.005, fz1 + 0.005, '#8f969b')
        gl.quad([(xb, gy0, Z1 - 0.02), (xa, gy0, Z1 - 0.02), (xa, gy1, Z1 - 0.02), (xb, gy1, Z1 - 0.02)])
    # 門：玻璃門片（兩側、上面的框；中間一支推把），地上門檻
    for xx in (d0, d1): fr.cbox(xx - 0.04, xx + 0.04, 0.0, gy1, fz0 - 0.01, fz1 + 0.01, '#7f868b')
    fr.cbox(d0 + 0.04, d1 - 0.04, 0.0, 0.1, Z1 - 0.045, Z1 + 0.005, '#7f868b'); fr.cbox(d0 + 0.04, d1 - 0.04, 2.08, 2.16, Z1 - 0.045, Z1 + 0.005, '#7f868b')
    fr.cbox(d0 + 0.04, d1 - 0.04, 0.0, 0.012, Z1 - 0.1, Z1 + 0.04, '#5f6468')
    gl.quad([(d1 - 0.04, 0.1, Z1 - 0.025), (d0 + 0.04, 0.1, Z1 - 0.025), (d0 + 0.04, 2.08, Z1 - 0.025), (d1 - 0.04, 2.08, Z1 - 0.025)])
    gl.quad([(d1 - 0.04, 2.16, Z1 - 0.025), (d0 + 0.04, 2.16, Z1 - 0.025), (d0 + 0.04, gy1, Z1 - 0.025), (d1 - 0.04, gy1, Z1 - 0.025)])
    fr.cbox(d1 - 0.2, d1 - 0.17, 0.85, 1.35, Z1 - 0.1, Z1 - 0.07, '#c9ccce')                             # 門把（裡面那一側）
    # 門外的巷子（118 巷街景 GLB 拍的；沒有的話是一片淺灰）
    vz = Z1 + 2.4; vw = (X1 - X0) * 1.9; vh = vw * 0.5; vy0 = 1.6 - vh / 2                              # 景的中間（拍的時候的地平線）在眼睛的高度
    vm = c.wg('S', 'view', M['view'] if 'view' in M else L.flat(f'l118_{c.sid}_viewflat', '#c9cbc6', rough=0.9))
    uvquad(vm, [(vw / 2, vy0, vz), (-vw / 2, vy0, vz), (-vw / 2, vy0 + vh, vz), (vw / 2, vy0 + vh, vz)], (0.0, 0.0, 1.0, 1.0))
    c.vc.cbox(X0 - 0.4, X1 + 0.4, -0.05, 0.0, Z1, vz, '#9a9893')                                       # 門口的騎樓地（往外到巷子那張景）
    # 天花板
    ce = Mesh(f'l118_{c.sid}_ceiling', M['ceil']); ce.quad([(X0, H, Z1), (X1, H, Z1), (X1, H, Z0), (X0, H, Z0)]); ce.finish(c.root, uv=False)
    c.door = dict(x=dx, w=dw, z=Z1)
    c.spawn = dict(x=dx, z=round(Z1 - 1.5, 3), yaw=PI, note='從門進來、面向店裡')
    c.exits = [dict(x=dx, z=round(Z1 - 0.45, 3), r=0.7, label='離開' + c.T['name'], to='lane118')]


def kitchen(c, x0, x1, depth=1.8, win=(0.95, 1.55), door=None):
    """後牆外面的廚房（從出菜口看得到）：出菜口（不鏽鋼台面）、裡面的爐台、抽油煙機、架子、鍋子。全部算 N 那一組（鏡頭在後面時一起淡出）"""
    X0, X1, Z0 = c.X0, c.X1, c.Z0; M = c.M; zk = Z0 - depth
    wl = c.wg('N', 'wall', M['wall']); wn = c.wg('N', 'wain', M['wain']); kt = c.wg('N', 'kitchen', M['vc'], cm=True); ks = c.wg('N', 'ksteel', M['steel'])
    wh = c.S['wainH']; y0, y1 = win
    Q = lambda xa, xb, ya, yb: [(xa, ya, Z0), (xb, ya, Z0), (xb, yb, Z0), (xa, yb, Z0)]
    holes = [(x0, x1, y0, y1)] + ([(door[0], door[1], 0.0, 2.1)] if door else [])
    xs = sorted({X0, X1, x0, x1} | ({door[0], door[1]} if door else set()))
    for xa, xb in zip(xs, xs[1:]):
        hs = [(ya, yb) for (ha, hb, ya, yb) in holes if ha <= xa + 1e-6 and hb >= xb - 1e-6]
        cuts = sorted({0.0, H, wh} | {v for h in hs for v in h})
        for ya, yb in zip(cuts, cuts[1:]):
            if any(ya >= h[0] - 1e-6 and yb <= h[1] + 1e-6 for h in hs): continue
            (wn if yb <= wh + 1e-6 else wl).quad(Q(xa, xb, ya, yb))
    ks.box(x0 - 0.05, x1 + 0.05, y0 - 0.04, y0, Z0 - 0.35, Z0 + 0.22)                                   # 出菜口的不鏽鋼台面（往店裡凸出）
    kt.cbox(x0 - 0.05, x1 + 0.05, y1, y1 + 0.05, Z0 - 0.2, Z0 + 0.02, '#3a3530')
    # 廚房：地板、三面牆、天花板（暗一點）、爐台、抽油煙機、架子
    kt.cbox(X0, X1, -0.05, 0.0, zk, Z0, '#8f8c86'); kt.poly([(X0, 0, zk), (X1, 0, zk), (X1, H, zk), (X0, H, zk)], '#dcd8cf')
    kt.poly([(X0, 0, Z0), (X0, 0, zk), (X0, H, zk), (X0, H, Z0)], '#d6d2c9'); kt.poly([(X1, 0, zk), (X1, 0, Z0), (X1, H, Z0), (X1, H, zk)], '#d6d2c9')
    kt.poly([(X0, H, Z0), (X1, H, Z0), (X1, H, zk), (X0, H, zk)], '#cfcbc3')
    ks.box(X0 + 0.1, X1 - 0.1, 0.0, 0.86, zk, zk + 0.65); ks.box(X0 + 0.1, X1 - 0.1, 0.86, 0.9, zk, zk + 0.68)   # 爐台
    for k in range(int((X1 - X0 - 0.4) / 0.7)):
        bx = X0 + 0.5 + k * 0.7; ccyl(kt, (bx, 0.9, zk + 0.35), (bx, 0.93, zk + 0.35), 0.16, '#202020', seg=14)
        if k % 2 == 0: clathe(kt, [(0.0, 0.0), (0.12, 0.02), (0.2, 0.09), (0.21, 0.1), (0.0, 0.1)], bx, 0.93, zk + 0.35, '#2b2b2b', seg=16)   # 炒鍋
        else: clathe(c.vm, [(0.0, 0.0), (0.17, 0.0), (0.17, 0.26), (0.16, 0.26), (0.0, 0.01)], bx, 0.93, zk + 0.35, '#b9bec2', seg=16)        # 湯鍋
    ks.box(X0 + 0.05, X1 - 0.05, 2.1, 2.5, zk, zk + 0.75)                                                 # 抽油煙機
    kt.cbox((X0 + X1) / 2 - 0.7, (X0 + X1) / 2 + 0.7, H - 0.06, H, Z0 - 0.75, Z0 - 0.6, '#e9e9e6'); c.tube.cyl(((X0 + X1) / 2 - 0.62, H - 0.085, Z0 - 0.675), ((X0 + X1) / 2 + 0.62, H - 0.085, Z0 - 0.675), 0.016, seg=8)   # 廚房的日光燈
    ks.box(X0 + 0.2, X1 - 0.2, 1.5, 1.53, Z0 - 0.32, Z0 - 0.02)                                           # 出菜口後面的層架
    for k in range(10): x = X0 + 0.4 + k * (X1 - X0 - 0.8) / 9; clathe(kt, [(0.0, 0.0), (0.05, 0.0), (0.075, 0.06), (0.07, 0.06), (0.0, 0.006)], x, 1.53, Z0 - 0.17, '#f4f1ea', seg=10)
    # 後牆的腰牆線、踢腳板（開口的地方斷開）；廚房門口掛門簾
    tr = c.wg('N', 'trim', M['vc'], cm=True); tc = c.S.get('trim', '#6b4a30')
    for (ya, yb, col, t) in ((wh - 0.02, wh + 0.03, tc, 0.015), (0.0, 0.09, '#3a3530', 0.012)):
        xs2 = sorted({X0, X1} | {v for (ha, hb, hy0, hy1) in holes if hy0 < yb and hy1 > ya for v in (ha, hb)})
        for xa, xb in zip(xs2, xs2[1:]):
            if any(ha <= xa + 1e-6 and hb >= xb - 1e-6 and hy0 < yb and hy1 > ya for (ha, hb, hy0, hy1) in holes): continue
            tr.cbox(xa, xb, ya, yb, Z0, Z0 + t, col)
    if door:
        nc = c.S.get('noren', '#2f5d50'); n = 3; w_ = (door[1] - door[0] - 0.04) / n
        tr.cbox(door[0], door[1], 2.04, 2.1, Z0 - 0.02, Z0 + 0.02, '#4a3a2a')
        for k in range(n):
            a = door[0] + 0.02 + k * w_; tr.cbox(a + 0.005, a + w_ - 0.005, 1.25, 2.04, Z0 + 0.005, Z0 + 0.012, nc)
    c.kz = zk


def finish(c):
    """收尾：牆的分組（WALL_*，props dir）、各材質網格、合併、匯出、配置、導航檢查"""
    D = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}
    for k, ms in c.WG.items():
        for key, m in ms.items():
            uv = key in ('wall', 'wain'); mg = key not in ('print', 'screen', 'view')
            m.finish(c.root, props={'dir': D[k]}, uv=uv, merge=mg)
    for m in (c.vc, c.vm, c.tube, c.warm, c.fridgel, c.steel): m.finish(c.root, uv=False)
    c.wood.finish(c.root)
    for m in (c.prt, c.scr): m.finish(c.root, uv=False, merge=False)
    for m in c.extra.values(): m.finish(c.root, uv=False)
    L.merge_by_material(c.root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: '')
    out = os.path.join(OUTDIR, f'l118_{c.sid}.glb'); st = L.export(out, gpu_instances=False)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    sh = next(q for q in LAY['shops'] if q['id'] == c.sid); Wst = sh['side'] == 'W'; fx = LAY['facade']['west'] if Wst else LAY['facade']['east']; cz = (sh['z0'] + sh['z1']) / 2
    street = dict(side=sh['side'], door=dict(x=round(fx + (0.9 if Wst else -0.9), 3), z=cz, note='118 巷的店門口互動點（現在 zones3d.js buildLane118 的位置）'),
                  spawn_out=dict(x=round(fx + (1.3 if Wst else -1.3), 3), z=round(cz + 1.7, 3), yaw=0.0, note='出店門站的位置：人行道上、面向後門（辛亥路）那一頭（面向巷子對面的話，鏡頭會被自己店的牆擠到人物背後）；離門口互動點 1.75 m（現在的互動半徑 1.4 m：一出來不會就顯示「進店」）'))
    lay = dict(version=1, zone=f'l118_{c.sid}', shop=c.sid, name=c.T['name'], type=c.T['sub'], src='AA_280（店名、菜單）；LANE118-SHOPS-1020（室內）',
               bounds=dict(x0=c.X0, x1=c.X1, z0=c.Z0, z1=c.Z1), h=H, cam_dist=c.S.get('cam', 4.2), door=c.door, spawn=c.spawn, exits=c.exits, street=street,
               counter=c.counter, clerk=c.clerk, order=c.order, seats=c.seats, interact=c.inter, blocks=c.blocks)
    prob = navcheck(c, lay); lay['navcheck'] = dict(cell=0.4, inset=0.25, problems=prob)
    L.write_json(os.path.join(OUTDIR, f'l118_{c.sid}.layout.json'), lay)
    L.write_json(out[:-4] + '.json', dict(st if isinstance(st, dict) else {}, tris_total=tris, layout=f'l118_{c.sid}.layout.json', seats=len(c.seats)))
    print(json.dumps({'shop': c.sid, 'tris': tris, 'seats': len(c.seats), 'problems': prob}, ensure_ascii=False))
    return prob


def navcheck(c, lay, cell=0.4):
    """和遊戲一樣的導航格：0.4 m 格子、牆內縮 0.25 m、blockRect（最小 0.4 m）；站得住＝clear(0.3)；路線經過的格子要 clear(0.33)。
    檢查：出生點 → 出口、點餐、每張椅子的走近點（seatApproach 的候選點）都走得到；出生點不在出口範圍裡"""
    Bd = lay['bounds']; ox, oz = Bd['x0'], Bd['z0']; cols, rows = math.ceil((Bd['x1'] - ox) / cell), math.ceil((Bd['z1'] - oz) / cell)
    blk = [[False] * cols for _ in range(rows)]
    w2 = lambda cx, cz: (ox + (cx + 0.5) * cell, oz + (cz + 0.5) * cell)
    for r_ in range(rows):
        for c_ in range(cols):
            x, z = w2(c_, r_)
            if x < Bd['x0'] + 0.25 or x > Bd['x1'] - 0.25 or z < Bd['z0'] + 0.25 or z > Bd['z1'] - 0.25: blk[r_][c_] = True
    for b in lay['blocks']:
        cx_, cz_ = (b['x0'] + b['x1']) / 2, (b['z0'] + b['z1']) / 2; hw, hd = max(b['x1'] - b['x0'], 0.4) / 2, max(b['z1'] - b['z0'], 0.4) / 2
        for r_ in range(rows):
            for c_ in range(cols):
                x, z = w2(c_, r_)
                if abs(x - cx_) <= hw and abs(z - cz_) <= hd: blk[r_][c_] = True
    cellof = lambda x, z: (math.floor((x - ox) / cell), math.floor((z - oz) / cell))
    def free(x, z):
        cx, cz = cellof(x, z); return 0 <= cx < cols and 0 <= cz < rows and not blk[cz][cx]
    clear = lambda x, z, r: free(x, z) and free(x + r, z) and free(x - r, z) and free(x, z + r) and free(x, z - r)
    sp = lay['spawn']; s0 = cellof(sp['x'], sp['z']); seen = {s0}; q = [s0]
    while q:
        cx, cz = q.pop()
        for dx in (-1, 0, 1):
            for dz in (-1, 0, 1):
                n = (cx + dx, cz + dz)
                if n in seen or not (0 <= n[0] < cols and 0 <= n[1] < rows) or blk[n[1]][n[0]]: continue
                if not clear(*w2(*n), 0.33): continue
                seen.add(n); q.append(n)
    def reach(x, z):   # 終點本身可以貼邊：終點那一格不擋、旁邊有一格在 seen 裡
        cx, cz = cellof(x, z)
        if not free(x, z) or not clear(x, z, 0.3): return False
        return any((cx + dx, cz + dz) in seen for dx in (-1, 0, 1) for dz in (-1, 0, 1))
    P = []
    if not clear(sp['x'], sp['z'], 0.3): P.append('出生點站不住')
    for X in lay['exits']:
        if math.hypot(sp['x'] - X['x'], sp['z'] - X['z']) <= X['r'] + 0.15: P.append('出生點在出口範圍裡')
        if not any(reach(X['x'] + dx * 0.2, X['z'] + dz * 0.2) for dx in range(-3, 4) for dz in range(-3, 4) if math.hypot(dx * 0.2, dz * 0.2) <= X['r']): P.append('走不到出口 ' + X['label'])
    if lay['order']:
        o = lay['order']
        if not any(reach(o['x'] + dx * 0.2, o['z'] + dz * 0.2) for dx in range(-3, 4) for dz in range(-3, 4) if math.hypot(dx * 0.2, dz * 0.2) <= o['r']): P.append('走不到點餐')
    for q_ in lay['interact']:
        if not any(reach(q_['x'] + dx * 0.2, q_['z'] + dz * 0.2) for dx in range(-4, 5) for dz in range(-4, 5) if math.hypot(dx * 0.2, dz * 0.2) <= q_['r']): P.append('走不到 ' + q_['label'])
    for s in lay['seats']:
        fx, fz = math.sin(s['yaw']), math.cos(s['yaw'])
        cand = ([(s['ap'][0], s['ap'][1])] if s.get('ap') else []) + [(s['x'] + fx * 0.5, s['z'] + fz * 0.5), (s['x'] - fx * 0.6, s['z'] - fz * 0.6), (s['x'] + fz * 0.55, s['z'] - fx * 0.55), (s['x'] - fz * 0.55, s['z'] + fx * 0.55),
                                                                     (s['x'] - fx * 0.7, s['z'] - fz * 0.7), (s['x'] - fx * 0.75, s['z'] - fz * 0.75), (s['x'] + fx * 0.8, s['z'] + fz * 0.8), (s['x'] - fx * 0.9, s['z'] - fz * 0.9)]
        if not any(reach(x, z) for (x, z) in cand): P.append(f'椅子走不到 ({s["x"]}, {s["z"]})')
    return P


# ================= 其他店用的零件 =================
FOOD = ['#c98a3a', '#7a9a3a', '#e0b64a', '#a8422a', '#d9c7a0', '#5a7a2a', '#b8742a', '#e6d9b8', '#8a3a2a', '#9ab85a', '#c9a24a', '#f0e0c0']


def food_tray(c, x0, x1, y, z0, z1, col):
    """方形不鏽鋼菜盤＋裡面的菜（頂點色起伏的一層）"""
    c.vm.cbox(x0, x1, y - 0.06, y, z0, z1, '#c9ced2'); rr = c.rng
    for k in range(6):
        a = x0 + 0.03 + (x1 - x0 - 0.06) * rr.random(); b = z0 + 0.03 + (z1 - z0 - 0.06) * rr.random()
        csph(c.vc, (a, y - 0.005, b), min(x1 - x0, z1 - z0) * 0.28, col, seg=6, rings=4, sy=0.35)


def steam_table(c, x0, x1, z0, z1, face='-x', cols=2):
    """自助餐的保溫餐台（不鏽鋼台身、一格一格的菜盤、客人那一側的斜玻璃罩、罩子下的燈）；沿著 z 放，客人在 face 那一側"""
    c.steel.box(x0, x1, 0.0, 0.84, z0, z1); c.vm.cbox(x0 + 0.02, x1 - 0.02, 0.0, 0.08, z0 + 0.02, z1 - 0.02, '#3a3d40')
    n = int((z1 - z0) / 0.36); dx = (x1 - x0 - 0.1) / cols; k = 0
    for i in range(n):
        for j in range(cols):
            a = x0 + 0.05 + j * dx; b = z0 + 0.04 + i * (z1 - z0 - 0.08) / n
            food_tray(c, a + 0.02, a + dx - 0.02, 0.9, b + 0.02, b + (z1 - z0 - 0.08) / n - 0.02, FOOD[(i * cols + j * 5) % len(FOOD)]); k += 1
    c.steel.box(x0, x1, 0.84, 0.86, z0, z1)
    xg = x0 if face == '-x' else x1; s = -1 if face == '-x' else 1
    gl = c.extra.setdefault('sglass', Mesh(f'l118_{c.sid}_sneezeguard', c.M['glass']))
    gl.quad([(xg + s * 0.02, 1.0, z1), (xg + s * 0.02, 1.0, z0), (xg - s * 0.25, 1.42, z0), (xg - s * 0.25, 1.42, z1)][::(1 if s < 0 else -1)])
    c.vm.cbox(min(xg - s * 0.3, xg - s * 0.2), max(xg - s * 0.3, xg - s * 0.2), 1.42, 1.46, z0, z1, '#b9bec2')
    c.warm.box(min(xg - s * 0.29, xg - s * 0.21), max(xg - s * 0.29, xg - s * 0.21), 1.415, 1.42, z0 + 0.1, z1 - 0.1)
    for zz in (z0 + 0.05, z1 - 0.05): ccyl(c.vm, (xg - s * 0.25, 0.86, zz), (xg - s * 0.25, 1.42, zz), 0.012, '#b9bec2', seg=6)
    xr = xg + s * 0.18; c.vm.cbox(min(xg, xr), max(xg, xr), 0.8, 0.83, z0, z1, '#c9ced2')                  # 放餐盤的滑軌
    c.block(min(x0, xr) - 0.02, max(x1, xr) + 0.02, z0 - 0.02, z1 + 0.02, 'buffet')


def glass_case(c, x0, x1, z0, z1, face='-x', h=1.05, rows=1, warm=True):
    """展示保溫櫃（家常菜的排骨、雞腿、菜；小菜櫃）：櫃身、上面的玻璃箱、裡面的菜盤"""
    c.vc.crbox(x0, x1, 0.0, 0.85, z0, z1, '#e8e4dc', r=0.01, seg=1); c.vm.cbox(x0, x1, 0.85, 0.88, z0, z1, '#b9bec2')
    gl = c.extra.setdefault('cglass', Mesh(f'l118_{c.sid}_caseglass', c.M['glass']))
    for (a, b) in ((x0, x1),):
        gl.quad([(a, 0.88, z1), (a, 0.88, z0), (a, h + 0.42, z0), (a, h + 0.42, z1)]); gl.quad([(b, 0.88, z0), (b, 0.88, z1), (b, h + 0.42, z1), (b, h + 0.42, z0)])
        gl.quad([(a, 0.88, z0), (b, 0.88, z0), (b, h + 0.42, z0), (a, h + 0.42, z0)]); gl.quad([(b, 0.88, z1), (a, 0.88, z1), (a, h + 0.42, z1), (b, h + 0.42, z1)])
    c.vm.cbox(x0, x1, h + 0.42, h + 0.45, z0, z1, '#b9bec2')
    for (a, b) in ((x0, z0), (x0, z1), (x1, z0), (x1, z1)): c.vm.cbox(a - 0.012, a + 0.012, 0.88, h + 0.42, b - 0.012, b + 0.012, '#b9bec2')
    (c.warm if warm else c.fridgel).box(x0 + 0.04, x1 - 0.04, h + 0.4, h + 0.415, z0 + 0.04, z1 - 0.04)
    n = max(1, int((z1 - z0) / 0.34))
    for r_ in range(rows):
        y = 0.94 + r_ * 0.3
        for i in range(n):
            b = z0 + 0.03 + i * (z1 - z0 - 0.06) / n; food_tray(c, x0 + 0.05, x1 - 0.05, y, b + 0.02, b + (z1 - z0 - 0.06) / n - 0.02, FOOD[(i * 3 + r_ * 7) % len(FOOD)])
        if r_ < rows - 1: gl.quad([(x0 + 0.02, y + 0.24, z0 + 0.02), (x0 + 0.02, y + 0.24, z1 - 0.02), (x1 - 0.02, y + 0.24, z1 - 0.02), (x1 - 0.02, y + 0.24, z0 + 0.02)])
    c.block(x0 - 0.02, x1 + 0.02, z0 - 0.02, z1 + 0.02, 'case')


def pendant(c, x, z, y=2.15, col='#2b2b2b', r=0.2, grp=None):
    """吊燈（金屬燈罩，下面一顆暖光燈泡）；grp＝'N' 等：跟著那一面牆淡出（吧檯上面的燈：鏡頭從吧檯那邊往門口看時不擋住人物）"""
    vc = c.wg(grp, 'lamps', c.M['vc'], cm=True) if grp else c.vc; vm = c.wg(grp, 'lampshade', c.M['vcm'], cm=True) if grp else c.vm; wm = c.wg(grp, 'lampbulb', c.M['warm']) if grp else c.warm
    ccyl(vc, (x, y + 0.2, z), (x, H, z), 0.005, '#2a2a2a', seg=4)
    clathe(vm, [(0.02, 0.2), (0.05, 0.19), (r * 0.6, 0.1), (r, 0.0), (r * 0.97, -0.004), (r * 0.57, 0.095), (0.0, 0.185)], x, y, z, col, seg=18)
    wm.sphere((x, y + 0.03, z), 0.055, seg=10, rings=6)


def counter(c, x0, x1, z0, z1, h=1.0, top='wood', front='#6b5a48', block=True, why='counter'):
    """櫃台：檯面（木頭／不鏽鋼）＋櫃身（頂點色）"""
    if top == 'wood': c.wood.rbox(x0 - 0.02, x1 + 0.02, h - 0.045, h, z0 - 0.02, z1 + 0.02, r=0.008, seg=2)
    else: c.steel.box(x0 - 0.02, x1 + 0.02, h - 0.03, h, z0 - 0.02, z1 + 0.02)
    c.vc.crbox(x0, x1, 0.0, h - 0.045, z0, z1, front, r=0.006, seg=1); c.vc.cbox(x0 + 0.03, x1 - 0.03, 0.0, 0.08, z0 + 0.03, z1 - 0.03, '#2f2b28')
    if block: c.block(x0 - 0.03, x1 + 0.03, z0 - 0.03, z1 + 0.03, why)


def wall_shelf(c, side, a0, a1, y, depth=0.25, items='bowls'):
    """牆上的層板＋東西（碗、杯子、玻璃罐、書…）：side 牆；a0..a1＝沿牆的範圍"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; rr = c.rng; m = c.wg(side, 'trim', c.M['vc'], cm=True)
    if side == 'N': box = lambda a, b, y0, y1, d0, d1, col: m.cbox(a, b, y0, y1, Z0 + d0, Z0 + d1, col); P = lambda a, d: (a, Z0 + d)
    elif side == 'W': box = lambda a, b, y0, y1, d0, d1, col: m.cbox(X0 + d0, X0 + d1, y0, y1, a, b, col); P = lambda a, d: (X0 + d, a)
    else: box = lambda a, b, y0, y1, d0, d1, col: m.cbox(X1 - d1, X1 - d0, y0, y1, a, b, col); P = lambda a, d: (X1 - d, a)
    box(a0, a1, y - 0.03, y, 0.0, depth, c.S.get('trim', '#6b4a30'))
    a = a0 + 0.08
    while a < a1 - 0.08:
        px, pz = P(a, depth * 0.5)
        if items == 'bowls': clathe(m, [(0.0, 0.0), (0.05, 0.0), (0.075, 0.07), (0.07, 0.07), (0.0, 0.006)], px, y, pz, rr.choice(['#f4f1ea', '#e8e0d0', '#3a3a3a']), seg=10); a += 0.17
        elif items == 'jars': clathe(m, [(0.0, 0.0), (0.05, 0.0), (0.05, 0.2), (0.035, 0.22), (0.035, 0.24), (0.0, 0.24)], px, y, pz, rr.choice(['#e0c070', '#d8b060', '#e8d8a0', '#c89040']), seg=10); a += 0.13
        elif items == 'bottles': clathe(m, [(0.0, 0.0), (0.035, 0.0), (0.035, 0.2), (0.012, 0.27), (0.012, 0.31), (0.0, 0.31)], px, y, pz, rr.choice(['#2f4a2a', '#5a2a2a', '#3a3020']), seg=8); a += 0.1
        elif items == 'cups': clathe(m, [(0.0, 0.0), (0.035, 0.0), (0.04, 0.08), (0.036, 0.08), (0.0, 0.005)], px, y, pz, rr.choice(['#f4f1ea', '#e9e4da', '#c9b8a0']), seg=10); a += 0.12
        elif items == 'stone': clathe(m, [(0.0, 0.0), (0.07, 0.0), (0.09, 0.08), (0.08, 0.09), (0.0, 0.01)], px, y, pz, '#2b2a28', seg=12); a += 0.22
        else: a += 0.2


def bookshelf(c, x0, x1, z0, z1, h=2.2, along='z'):
    """書架（慢讀咖啡）：五層、一格一格的書（顏色、高度、厚度隨機；沒有書名）"""
    c.wood.box(x0, x1, 0.0, 0.06, z0, z1); c.wood.box(x0, x1, h - 0.03, h, z0, z1)
    a0, a1 = (z0, z1) if along == 'z' else (x0, x1); rr = c.rng
    for side_ in (a0, a1 - 0.025):
        if along == 'z': c.wood.box(x0, x1, 0.0, h, side_, side_ + 0.025)
        else: c.wood.box(side_, side_ + 0.025, 0.0, h, z0, z1)
    for k in range(5):
        y = 0.06 + k * (h - 0.1) / 5
        if k: c.wood.box(x0, x1, y - 0.02, y, z0, z1)
        a = a0 + 0.04
        while a < a1 - 0.08:
            t = rr.uniform(0.025, 0.05); hh = rr.uniform(0.2, 0.33) if k < 4 else rr.uniform(0.18, 0.26); col = rr.choice(['#7a2a2a', '#2a4a6a', '#e8dcc0', '#3a5a3a', '#c9a24a', '#5a4a6a', '#d8d0c0', '#2a2a2a', '#a8543a'])
            if rr.random() < 0.08: a += 0.12; continue
            if along == 'z': c.vc.cbox(x0 + 0.03, x1 - 0.04, y, y + hh, a, a + t, col)
            else: c.vc.cbox(a, a + t, y, y + hh, z0 + 0.04, z1 - 0.03, col)
            a += t + 0.004
    c.block(min(x0, x1) - 0.02, max(x0, x1) + 0.02, z0 - 0.02, z1 + 0.02, 'bookshelf')


def espresso(c, x, y, z, face='+z'):
    """義式咖啡機＋磨豆機（沒有品牌）"""
    s = 1 if face == '+z' else -1
    c.vm.cbox(x - 0.32, x + 0.32, y, y + 0.42, z - 0.22, z + 0.22, '#c9ced2'); c.vc.cbox(x - 0.3, x + 0.3, y + 0.42, y + 0.46, z - 0.2, z + 0.2, '#2b2b2b')
    for dx in (-0.14, 0.14):
        ccyl(c.vm, (x + dx, y + 0.3, z + s * 0.22), (x + dx, y + 0.24, z + s * 0.27), 0.03, '#b9bec2', seg=8); c.vc.cbox(x + dx - 0.015, x + dx + 0.015, y + 0.2, y + 0.24, z + s * 0.27, z + s * 0.36, '#1a1a1a')
    c.vm.cbox(x - 0.25, x + 0.25, y, y + 0.03, z + s * 0.22, z + s * 0.3, '#9aa0a4')
    ccyl(c.vm, (x + 0.48, y, z), (x + 0.48, y + 0.32, z), 0.07, '#2b2b2b', seg=10); clathe(c.vc, [(0.0, 0.0), (0.05, 0.0), (0.09, 0.14), (0.0, 0.14)], x + 0.48, y + 0.32, z, '#c8b090', seg=10)


def tea_station(c, x0, x1, zb, face='+z'):
    """手搖飲的工作台（靠後牆）：三個茶桶（不鏽鋼、水龍頭）、封口機、搖杯、果糖機、冰桶"""
    s = 1 if face == '+z' else -1; zf = zb + s * 0.6; zz = sorted((zb, zf))
    c.steel.box(x0, x1, 0.0, 0.9, zz[0], zz[1]); c.vm.cbox(x0, x1, 0.0, 0.08, zz[0] + 0.02, zz[1] - 0.02, '#3a3d40')
    for k, xx in enumerate((x0 + 0.25, x0 + 0.6, x0 + 0.95)):
        ccyl(c.vm, (xx, 0.9, zb + s * 0.25), (xx, 1.38, zb + s * 0.25), 0.15, '#c9ced2', seg=16); ccyl(c.vm, (xx, 1.38, zb + s * 0.25), (xx, 1.41, zb + s * 0.25), 0.155, '#b9bec2', seg=16)
        c.vc.cbox(xx - 0.02, xx + 0.02, 1.0, 1.04, zb + s * 0.4, zb + s * 0.44, '#2b2b2b')
    xm = x1 - 0.35; c.vc.crbox(xm - 0.15, xm + 0.15, 0.9, 1.35, zb + s * 0.1, zb + s * 0.45, '#e8e8e4', r=0.02, seg=1)   # 封口機
    c.vc.cbox(xm - 0.08, xm + 0.08, 1.02, 1.05, zb + s * 0.45, zb + s * 0.5, '#2f7d5b')
    for k in range(4): ccyl(c.vm, (x0 + 1.25 + k * 0.1, 0.9, zb + s * 0.45), (x0 + 1.25 + k * 0.1, 1.12, zb + s * 0.45), 0.04, '#d9dadb', seg=8)   # 雪克杯
    c.block(x0 - 0.02, x1 + 0.02, zz[0], zz[1] + 0.02, 'teabar')


def outlets(c, x0, x1, y, z, n=4):
    """插座（窗邊的吧檯下面一排；慢讀咖啡「內用的話，插座在窗邊。」）"""
    for k in range(n): xx = x0 + (k + 0.5) * (x1 - x0) / n; c.vc.cbox(xx - 0.04, xx + 0.04, y - 0.05, y + 0.05, z - 0.012, z, '#f4f4f1'); c.vc.cbox(xx - 0.02, xx + 0.02, y - 0.012, y + 0.012, z - 0.015, z - 0.012, '#5a5a5a')


def frying_station(c, x0, x1, zb, pans=3):
    """蛋包飯／義大利麵的開放廚房：不鏽鋼爐台、平底鍋、煮麵鍋、抽油煙機"""
    c.steel.box(x0, x1, 0.0, 0.88, zb, zb + 0.7); c.steel.box(x0, x1, 0.88, 0.9, zb, zb + 0.72)
    for k in range(pans):
        bx = x0 + 0.35 + k * (x1 - x0 - 0.7) / max(1, pans - 1); ccyl(c.vc, (bx, 0.9, zb + 0.35), (bx, 0.92, zb + 0.35), 0.14, '#202020', seg=12)
        clathe(c.vc, [(0.0, 0.0), (0.12, 0.0), (0.14, 0.04), (0.13, 0.045), (0.0, 0.01)], bx, 0.92, zb + 0.35, '#2b2b2b', seg=16)
        c.vc.cbox(bx + 0.13, bx + 0.33, 0.95, 0.97, zb + 0.33, zb + 0.37, '#2b2b2b')
    c.steel.box(x0 - 0.05, x1 + 0.05, 2.15, 2.55, zb, zb + 0.8)


def eggs(c, x, y, z, n=10):
    """一盒雞蛋（蛋包飯研究所）"""
    c.vc.cbox(x - 0.16, x + 0.16, y, y + 0.04, z - 0.07, z + 0.07, '#cbb89a')
    for k in range(n): csph(c.vc, (x - 0.13 + (k % 5) * 0.065, y + 0.06, z - 0.032 + (k // 5) * 0.064), 0.027, '#f2e4cc' if k % 3 else '#d9b48a', seg=8, rings=5, sy=1.25)


def flasks(c, side, a0, a1, y):
    """「研究所」的層架：燒杯、錐形瓶（裝醬汁的顏色）"""
    X0, X1, Z0 = c.X0, c.X1, c.Z0; m = c.wg(side, 'trim', c.M['vc'], cm=True); rr = c.rng
    m.cbox(a0, a1, y - 0.03, y, Z0, Z0 + 0.26, '#e8e8e4'); a = a0 + 0.1
    while a < a1 - 0.08:
        col = rr.choice(['#c9822a', '#a8241a', '#e0b64a', '#6a8a3a'])
        if rr.random() < 0.5: clathe(m, [(0.0, 0.0), (0.06, 0.0), (0.06, 0.03), (0.02, 0.14), (0.02, 0.2), (0.0, 0.2)], a, y, Z0 + 0.13, col, seg=10)
        else: clathe(m, [(0.0, 0.0), (0.045, 0.0), (0.045, 0.13), (0.05, 0.14), (0.0, 0.14)], a, y, Z0 + 0.13, col, seg=10)
        a += 0.15


def noodle_station(c, x0, x1, z0, z1):
    """麵店的煮麵台（店門口那一側）：不鏽鋼台、兩口大湯鍋（一鍋湯、一鍋煮麵：麵杓掛在上面）、疊起來的碗"""
    c.steel.box(x0, x1, 0.0, 0.85, z0, z1); c.vm.cbox(x0 + 0.02, x1 - 0.02, 0.0, 0.08, z0 + 0.02, z1 - 0.02, '#3a3d40')
    cx = (x0 + x1) / 2
    for k, zz in enumerate((z0 + 0.45, z0 + 1.15)):
        clathe(c.vm, [(0.0, 0.0), (0.27, 0.0), (0.27, 0.42), (0.29, 0.43), (0.29, 0.45), (0.0, 0.02)], cx, 0.85, zz, '#c9ced2', seg=20)
        ccyl(c.vc, (cx, 1.29, zz), (cx, 1.3, zz), 0.26, '#d9c7a0' if k == 0 else '#e8e4dc', seg=18)
        for j in range(3): a = j * 2 * PI / 3; ccyl(c.vm, (cx + 0.14 * math.cos(a), 1.2, zz + 0.14 * math.sin(a)), (cx + 0.24 * math.cos(a), 1.55, zz + 0.24 * math.sin(a)), 0.008, '#b9bec2', seg=5)
    for j in range(8): clathe(c.vc, [(0.0, 0.0), (0.06, 0.0), (0.09, 0.08), (0.085, 0.085), (0.0, 0.006)], cx, 0.85 + j * 0.03, z1 - 0.35, '#f4f1ea', seg=12)
    c.block(x0 - 0.02, x1 + 0.02, z0 - 0.02, z1 + 0.02, 'noodle_station')


def tray_rack(c, x0, x1, z0, z1):
    """餐盤架＋餐盤、筷子筒（自助餐）"""
    c.steel.box(x0, x1, 0.0, 0.85, z0, z1)
    for k in range(10): c.vc.cbox(x0 + 0.05, x1 - 0.05, 0.85 + k * 0.02, 0.86 + k * 0.02, z0 + 0.05, z1 - 0.15, '#c8a070' if k % 2 else '#b8905e')
    ccyl(c.vc, (x0 + 0.15, 0.85, z1 - 0.08), (x0 + 0.15, 1.02, z1 - 0.08), 0.045, '#c9463d', seg=10)
    c.block(x0 - 0.02, x1 + 0.02, z0 - 0.02, z1 + 0.02, 'trays')


def soup_station(c, x0, x1, z0, z1):
    """自取的湯（大湯桶＋湯杓、碗）"""
    counter(c, x0, x1, z0, z1, h=0.85, top='steel', front='#d9dadb', why='soup')
    cx, cz = (x0 + x1) / 2 - 0.15, (z0 + z1) / 2
    clathe(c.vm, [(0.0, 0.0), (0.2, 0.0), (0.2, 0.38), (0.21, 0.39), (0.0, 0.02)], cx, 0.85, cz, '#c9ced2', seg=18); ccyl(c.vc, (cx, 1.18, cz), (cx, 1.19, cz), 0.19, '#d9c08a', seg=16)
    ccyl(c.vm, (cx + 0.05, 1.2, cz), (cx + 0.25, 1.5, cz), 0.008, '#b9bec2', seg=5)
    for j in range(6): clathe(c.vc, [(0.0, 0.0), (0.045, 0.0), (0.06, 0.06), (0.056, 0.064), (0.0, 0.005)], x1 - 0.18, 0.85 + j * 0.025, cz, '#f4f1ea', seg=10)


def return_station(c, x0, x1, z0, z1):
    """餐盤回收台（自助餐）：台面上疊的髒餐盤、廚餘桶"""
    counter(c, x0, x1, z0, z1, h=0.9, top='steel', front='#d9dadb', why='return')
    for k in range(4): c.vc.cbox(x0 + 0.1, x0 + 0.55, 0.9 + k * 0.02, 0.91 + k * 0.02, z0 + 0.08, z1 - 0.08, '#c8a070')
    ccyl(c.vc, (x1 - 0.25, 0.0, z1 + 0.22), (x1 - 0.25, 0.6, z1 + 0.22), 0.18, '#3f6fb0', seg=14)


def banners(c, side, a0, a1, cols):
    """布條（韓食小廚：天花板下一排三角小旗；沒有字）"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; m = c.wg(side, 'trim', c.M['vc'], cm=True); n = int((a1 - a0) / 0.32)
    for k in range(n):
        a = a0 + k * (a1 - a0) / n; b = a + (a1 - a0) / n * 0.9; mid = (a + b) / 2; col = cols[k % len(cols)]
        if side == 'N': tri = [(a, 2.95, Z0 + 0.02), (b, 2.95, Z0 + 0.02), (mid, 2.62, Z0 + 0.02)]
        elif side == 'W': tri = [(X0 + 0.02, 2.95, b), (X0 + 0.02, 2.95, a), (X0 + 0.02, 2.62, mid)]
        else: tri = [(X1 - 0.02, 2.95, a), (X1 - 0.02, 2.95, b), (X1 - 0.02, 2.62, mid)]
        m.poly(tri, col); m.poly(tri[::-1], col)                                                    # 兩面（布）


def auto_ap(c, lay):
    """navcheck 走不到的座位：在旁邊找一個走得到的點當 ap（遊戲的 seatApproach 先試 ap；和法學院圖書館方柱後面那張椅子一樣）"""
    for s in lay['seats']:
        if s.get('ap'): continue
        if not navcheck(c, dict(lay, seats=[s])): continue
        best = None
        for r in (0.7, 0.85, 1.0, 1.15, 1.3, 1.5):
            for k in range(16):
                a = k * PI / 8; x, z = s['x'] + r * math.cos(a), s['z'] + r * math.sin(a)
                if not navcheck(c, dict(lay, seats=[dict(s, ap=[round(x, 3), round(z, 3)])])): best = (round(x, 3), round(z, 3)); break
            if best: break
        if best: s['ap'] = list(best)

# ================= 每一間店 =================
def build_dian(c):
    """滇香小館（滇緬料理）：深綠瓷磚腰牆＋米色牆、竹編吊燈、織布掛毯；後牆是出菜口＋廚房，櫃台在後面（店員站在櫃台後面）；兩排兩人桌（十個位子）"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; c.S['kpass'] = True
    shell(c); kitchen(c, -2.0, -0.35, depth=1.8, win=(1.05, 1.6), door=(0.1, 0.82))   # 廚房門在櫃台後面（店員從廚房出來就在櫃台裡）
    # 櫃台（後面，左半邊）：木頭檯面、前面一排深綠瓷磚；店員在櫃台後面（和出菜口之間）
    cz0, cz1 = Z0 + 1.0, Z0 + 1.55
    c.wood.rbox(X0, 0.55, 1.0, 1.05, cz0 - 0.03, cz1 + 0.04, r=0.01, seg=2)
    c.vc.crbox(X0, 0.5, 0.0, 1.0, cz1 - 0.06, cz1, '#3f6b5a', r=0.004, seg=1); c.vc.cbox(X0, 0.5, 0.0, 1.0, cz0, cz0 + 0.04, '#6b5a48')
    c.vc.cbox(0.46, 0.5, 0.0, 1.0, cz0, cz1, '#3f6b5a')
    c.vc.cbox(X0, X0 + 0.03, 0.0, 1.0, cz0, cz1, '#6b5a48')
    register(c, -0.2, 1.05, (cz0 + cz1) / 2, face='+z')
    rice_cooker(c, -1.65, 1.05, (cz0 + cz1) / 2 - 0.02)
    for k in range(4): clathe(c.vc, [(0.0, 0.0), (0.05, 0.0), (0.055, 0.09), (0.045, 0.1), (0.045, 0.12), (0.0, 0.12)], -1.15 + k * 0.13, 1.05, cz1 - 0.12, ['#a8241a', '#c98a2a', '#5a7a2a', '#a8241a'][k], seg=10)   # 辣椒醬、醃菜罐
    c.vc.cbox(0.62, 0.66, 0.0, 1.0, cz0, cz1, '#6b5a48'); c.wood.rbox(0.55, 0.9, 0.95, 0.99, cz0, cz1, r=0.006, seg=1)   # 櫃台右端：掀板（關著，進不去櫃台後面）
    c.block(X0, 0.92, Z0, cz1 + 0.02, 'counter')
    c.counter = dict(x0=X0, x1=0.55, z0=cz0, z1=cz1, h=1.05)
    c.clerk = dict(x=-0.6, z=round(Z0 + 0.55, 3), yaw=0.0, note='櫃台後面（出菜口前），面向客人；從門口走進來看得到')
    c.order = dict(x=-0.6, z=round(cz1 + 0.55, 3), r=0.8, label='點餐（' + c.T['name'] + '）', note='櫃台前面；交給 LAWWW 接 AA_280 的點餐（shop118:dian）')
    # 後面右邊：飲料冰箱、飲水機
    drink_fridge(c, 1.85, 2.65, Z0, face='+z'); water_station(c, 1.25, Z0 + 0.3)
    cups_stack(c, 1.3, 1.05, Z0 + 0.42, 5)
    # 桌子：兩排兩人桌（x −1.85、+1.85），每排兩張；西邊靠門那一側多一張
    for (tx, tz) in ((-1.85, -1.25), (-1.85, 0.6), (-1.85, 2.45), (1.85, -0.75), (1.85, 1.2)):
        table(c, tx, tz, 0.8, 0.72, top='wood'); table_seats(c, tx, tz, 0.8, 0.72, ('-z', '+z'), style='wood', col='#5a3a24'); table_set(c, tx + 0.25, tz, 'dian')
    # 竹編吊燈（每張桌子上面一盞）、日光燈（櫃台上方）
    for (tx, tz) in ((-1.85, -1.25), (-1.85, 0.6), (-1.85, 2.45), (1.85, -0.75), (1.85, 1.2)): bamboo_lamp(c, tx, tz)
    tubes(c, [(-1.0, Z0 + 1.3, 'x'), (0.4, 2.7, 'z')])
    # 牆：菜單（後牆，出菜口右邊）、店名（櫃台後面上方）、今日推薦（西牆）、營業時間（店面門邊）、白飯可以續（櫃台旁）
    frame_board(c, 'N', -2.2, -0.15, 1.85, 2.62, '#2a3a32'); printed(c, 'N', -2.2, -0.15, 1.85, 2.62, 'MENU', inset=0.014)   # 菜單在出菜口上面
    printed(c, 'W', -1.25, 1.25, 2.6, 3.05, 'NAME')                                                     # 店名牌：西牆高處（從門口一進來就看到）
    frame_board(c, 'W', 1.4, 2.0, 1.35, 2.15, '#6b5a48'); printed(c, 'W', 1.4, 2.0, 1.35, 2.15, 'P1', inset=0.014)
    dd = c.door; printed(c, 'S', dd['x'] + 0.55, dd['x'] + 1.0, 1.3, 1.5, 'HOURS', inset=0.03)          # 營業時間：貼在門邊的玻璃上（裡面看是正的）
    printed(c, 'N', -2.72, -2.24, 1.7, 1.91, 'P2')
    # 西牆的織布掛毯（緬甸條紋布）：一根木棍、布面上下幾條顏色
    tr = c.wg('W', 'trim', c.M['vc'], cm=True); za, zb = -0.4, 0.6
    tr.cbox(X0 + 0.02, X0 + 0.05, 2.47, 2.5, za - 0.08, zb + 0.08, '#6b4a30')
    for k, col in enumerate(['#8c2a2a', '#d9a441', '#2f5d50', '#8c2a2a', '#e8d9b5', '#3b3f6b', '#d9a441', '#8c2a2a']):
        y1 = 2.45 - k * 0.12; tr.cbox(X0 + 0.02, X0 + 0.028, y1 - 0.12, y1, za, zb, col)
    c.look('tapestry', X0 + 0.6, 0.1, 0.9, '牆上的織布', '看（緬甸的條紋布；說明文字由 AA 寫）')
    wall_fan(c, X0, 2.45, 2.0, '+x'); ac_unit(c, X1, 2.5, -0.6, '-x')
    plant(c, X1 - 0.4, Z1 - 0.45, 1.15)
    c.cam = 4.2



def build_self(c):
    """好家自助餐：東牆一整排保溫餐台（從後面拿餐盤開始夾，往前走到門口邊的結帳台）；阿姨在結帳台後面（面向店裡）；後面有自取的湯、回收台；中間兩排長桌（不鏽鋼圓凳）"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1
    shell(c)
    tray_rack(c, 2.45, X1, Z0, Z0 + 0.75)
    steam_table(c, 2.45, X1, Z0 + 0.85, 1.9, face='-x', cols=2)
    counter(c, 1.55, X1, 2.45, 2.95, h=0.95, top='steel', front='#c9463d', why='cashier')                  # 結帳台（秤、收銀機）
    c.block(1.5, X1, 2.4, Z1, 'cashier_back')                                                                  # 結帳台後面（阿姨站的地方，客人進不去）
    register(c, 2.0, 0.95, 2.7, face='-z'); c.vm.cbox(2.55, 2.9, 0.95, 1.0, 2.55, 2.85, '#c9ced2'); c.vc.cbox(2.6, 2.85, 1.0, 1.06, 2.6, 2.8, '#2b2b2b')   # 秤
    c.counter = dict(x0=1.55, x1=X1, z0=2.45, z1=2.95, h=0.95, note='結帳台（自助餐：夾好菜拿過來算）')
    c.clerk = dict(x=2.4, z=3.55, yaw=PI, note='結帳台後面，面向店裡（阿姨：「自己夾，夾好拿過來算。」）；從巷子隔著玻璃也看得到')
    c.order = dict(x=1.55, z=1.95, r=0.8, label='點餐（' + c.T['name'] + '）', note='餐台的尾巴、結帳台前面；交給 LAWWW 接 AA_280（shop118:self）')
    soup_station(c, 0.2, 1.3, Z0, Z0 + 0.6); return_station(c, X0, X0 + 1.1, Z0, Z0 + 0.65)
    rice_cooker(c, 3.0, 0.85, Z0 + 0.45 + 0.0)                                                                 # 餐盤架上的大電鍋（白飯）
    # 西牆一條靠牆的長桌（面向牆坐，一個人吃很常見）＋中間一排兩張長桌（兩側坐）；前面留給排隊、結帳
    c.wood.rbox(X0, X0 + 0.45, 0.72, 0.75, -3.1, 1.4, r=0.006, seg=1); c.vm.cbox(X0 + 0.38, X0 + 0.42, 0.0, 0.72, -3.0, 1.3, '#9aa0a4')
    c.block(X0, X0 + 0.48, -3.13, 1.43, 'wall_table')
    for k in range(6):
        z_ = -2.7 + k * 0.75; chair(c, X0 + 0.78, z_, -PI / 2, 'steelstool'); c.seat(X0 + 0.78, z_, -PI / 2, (X0 + 0.22, z_), 'eat', label='坐靠牆的長桌')
        if k % 2 == 0: table_set(c, X0 + 0.2, z_ + 0.35, 'tw')
    for (tx, tz) in ((-0.6, -2.3), (-0.6, 0.05)):
        table(c, tx, tz, 0.72, 1.5, top='lam', col='#e8e2d4', legc='#9aa0a4'); table_seats(c, tx, tz, 0.72, 1.5, ('-x', '+x'), style='steelstool', n_per=2); table_set(c, tx, tz - 0.4, 'tw')
    tubes(c, [(-2.4, -1.5, 'z'), (-2.4, 0.9, 'z'), (-0.6, -2.0, 'z'), (-0.6, 0.4, 'z'), (2.6, -1.8, 'z'), (2.6, 0.6, 'z'), (2.4, 3.2, 'x')])
    frame_board(c, 'E', -2.2, -0.2, 2.1, 2.85, '#8c2a22'); printed(c, 'E', -2.2, -0.2, 2.1, 2.85, 'MENU', inset=0.014)
    printed(c, 'N', -1.8, 1.2, 2.55, 3.1, 'NAME')
    printed(c, 'N', 2.55, 3.05, 1.35, 1.79, 'P1')
    dd = c.door; printed(c, 'S', dd['x'] + 0.55, dd['x'] + 1.0, 1.3, 1.5, 'HOURS', inset=0.03)
    printed(c, 'W', Z0 + 0.15, Z0 + 0.65, 1.45, 1.67, 'P2')
    wall_fan(c, X0, 2.5, 1.2, '+x'); ac_unit(c, 1.95, 2.6, Z0, '+z', w=0.9)   # 冷氣在店名牌東邊（不蓋住店名）
    c.look('soup', 0.75, Z0 + 1.05, 0.7, '自取的湯', '看（今天是什麼湯；說明文字由 AA 寫）')
    c.look('return', X0 + 0.55, Z0 + 1.1, 0.8, '餐盤回收台', '吃完把餐盤放這裡（AA_280：「你把餐盤放到回收台，順手拿了一張餐巾紙。」）')


def build_tea(c):
    """一一八茶飲（外帶小店，寬 2.6 m）：櫃台橫在店中間，後面是茶桶、封口機；點餐的螢幕；靠東牆一條窄桌＋兩張高腳椅（等飲料）"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1
    shell(c)
    tea_station(c, X0 + 0.05, X1 - 0.05, Z0, face='+z')
    counter(c, X0, 0.55, -0.85, -0.35, h=1.0, top='wood', front='#2f7d5b', why='counter')
    c.vc.cbox(0.55, X1, 0.0, 1.0, -0.85, -0.81, '#2f7d5b'); c.block(0.5, X1, -0.9, -0.3, 'counter_gate')       # 櫃台右端：矮門（關著）
    c.block(X0, X1, Z0, -0.85, 'staff')
    xs = 0.05; c.vc.crbox(xs - 0.14, xs + 0.14, 1.0, 1.02, -0.68, -0.48, '#2b2b2b', r=0.005, seg=1); c.vc.cbox(xs - 0.12, xs + 0.12, 1.02, 1.2, -0.52, -0.5, '#202225')
    uvquad(c.scr, [(xs - 0.11, 1.03, -0.497), (xs + 0.11, 1.03, -0.497), (xs + 0.11, 1.19, -0.497), (xs - 0.11, 1.19, -0.497)], TX.uv(TX.SCR, 'order'))   # 點餐的平板（朝客人）
    for k in range(5): clathe(c.vc, [(0.0, 0.0), (0.04, 0.0), (0.048, 0.15), (0.044, 0.15), (0.0, 0.005)], -1.0 + k * 0.1, 1.0, -0.62, '#f4f4f1', seg=10)   # 杯子
    c.counter = dict(x0=X0, x1=0.55, z0=-0.85, z1=-0.35, h=1.0)
    c.clerk = dict(x=-0.35, z=-1.35, yaw=0.0, note='櫃台後面，面向門口（「甜度冰塊？」）')
    c.order = dict(x=-0.35, z=0.15, r=0.7, label='點餐（' + c.T['name'] + '）', note='櫃台前面；交給 LAWWW 接 AA_280（shop118:tea）')
    c.wood.rbox(X1 - 0.32, X1, 0.98, 1.02, 0.4, 1.6, r=0.006, seg=1); c.vm.cbox(X1 - 0.3, X1 - 0.28, 0.0, 0.98, 1.0, 1.04, '#2b2b2b')   # 靠牆的窄桌
    c.block(X1 - 0.34, X1, 0.38, 1.62, 'ledge')
    for z_ in (0.7, 1.3): chair(c, X1 - 0.62, z_, PI / 2, 'bar', '#2f7d5b'); c.seat(X1 - 0.62, z_, PI / 2, (X1 - 0.16, z_), 'wait')
    tubes(c, [(0.0, -1.6, 'x'), (0.0, 0.9, 'z')], L_=1.0)
    frame_board(c, 'N', -1.2, 1.2, 1.75, 2.65, '#2f7d5b'); printed(c, 'N', -1.2, 1.2, 1.75, 2.65, 'MENU', inset=0.014)
    printed(c, 'S', -1.0, 1.0, 2.68, 3.05, 'NAME', inset=0.016)
    printed(c, 'W', -0.2, 0.4, 1.3, 1.83, 'P1')
    printed(c, 'S', 0.15, 0.6, 1.3, 1.5, 'HOURS', inset=0.03)
    printed(c, 'E', 1.7, 2.1, 1.55, 1.73, 'P2')
    plant(c, X0 + 0.32, Z1 - 0.4, 0.9)
    c.cam = 3.6


def build_home(c):
    """巷口家常菜：東牆的保溫展示櫃（排骨、雞腿、菜），老闆娘在櫃子後面；西牆高處的電視（午間新聞）；方桌＋紅藍塑膠凳；後面出菜口、廚房、自取的湯"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; c.S['kpass'] = True
    shell(c); kitchen(c, -0.8, 1.2, depth=1.8, win=(1.0, 1.6), door=(2.4, 3.15))
    glass_case(c, 2.25, 2.85, -0.7, 2.4, face='-x', rows=2, warm=True)
    counter(c, 2.25, 2.85, -1.6, -0.75, h=0.9, top='steel', front='#e8e4dc', why='counter'); register(c, 2.55, 0.9, -1.2, face='-z') if False else register(c, 2.55, 0.9, -1.15, face='+z')
    c.block(2.2, X1, -1.65, 2.45, 'counter_back'); c.block(2.2, X1, Z0, -1.6, 'counter_back2')
    c.counter = dict(x0=2.25, x1=2.85, z0=-1.6, z1=2.4, h=0.9, note='東牆：保溫展示櫃＋收銀')
    c.clerk = dict(x=3.35, z=0.6, yaw=-PI / 2, note='展示櫃後面，面向店裡（老闆娘：「排骨剛炸好喔。」）')
    c.order = dict(x=1.7, z=0.6, r=0.8, label='點餐（' + c.T['name'] + '）', note='展示櫃前面；交給 LAWWW 接 AA_280（shop118:home）')
    for (tx, tz) in ((-2.6, -2.25), (-2.6, -0.15), (-0.45, -2.25), (-0.45, -0.15), (-0.45, 1.95)):   # 東邊留給點餐、排隊（展示櫃前面）
        cols = ['#c8322a', '#2f6fb0']
        table(c, tx, tz, 0.78, 0.78, top='lam', col='#efe9dc', legc='#9aa0a4')
        for k, sd in enumerate(('-z', '+z', '-x', '+x')):
            if tx < -2 and sd == '-x': continue
            if tx > 1 and sd == '+x': continue
            table_seats(c, tx, tz, 0.78, 0.78, (sd,), style='stool', col=cols[(k + int(tx)) % 2])
        table_set(c, tx + 0.2, tz + 0.2, 'tw')
    tv(c, 'W', -1.2, 2.55, 0.95); c.look('tv', X0 + 0.9, -1.2, 0.9, '電視', '看（午間新聞；AA_280：「電視在播午間新聞，沒有人在看。」）')
    c.wg('W', 'trim', c.M['vc'], cm=True).cbox(X0, X0 + 0.3, 2.2, 2.24, -1.6, -0.8, '#3a3a3a')                 # 電視的架子
    counter(c, X0, X0 + 0.7, Z0, Z0 + 1.3, h=0.85, top='steel', front='#d9dadb', why='soup')                    # 自取的湯、白飯（西牆後段）
    rice_cooker(c, X0 + 0.35, 0.85, Z0 + 0.35); clathe(c.vm, [(0.0, 0.0), (0.17, 0.0), (0.17, 0.32), (0.18, 0.33), (0.0, 0.02)], X0 + 0.35, 0.85, Z0 + 0.95, '#c9ced2', seg=16)
    c.look('soup', X0 + 1.4, Z0 + 0.7, 0.8, '自取的湯', '湯免費自取（說明文字由 AA 寫）')
    drink_fridge(c, 1.35, 2.15, Z0, face='+z')
    tubes(c, [(-2.6, -1.5, 'x'), (-0.45, -1.5, 'x'), (-0.45, 0.6, 'x'), (-2.6, 0.6, 'x'), (2.0, 0.6, 'z')])
    frame_board(c, 'E', -0.4, 1.6, 2.1, 2.85, '#5a2a1e'); printed(c, 'E', -0.4, 1.6, 2.1, 2.85, 'MENU', inset=0.014)
    printed(c, 'N', -3.4, -1.0, 2.55, 3.0, 'NAME')
    frame_board(c, 'W', 1.6, 2.2, 1.3, 1.85, '#8c3b2a'); printed(c, 'W', 1.6, 2.2, 1.3, 1.85, 'P1', inset=0.014)
    dd = c.door; printed(c, 'S', dd['x'] + 0.55, dd['x'] + 1.0, 1.3, 1.5, 'HOURS', inset=0.03)
    printed(c, 'E', -2.6, -2.1, 1.45, 1.67, 'P2')
    wall_fan(c, X0, 2.4, 1.4, '+x'); ac_unit(c, X1, 2.55, -2.6, '-x')
    plant(c, X1 - 0.4, Z1 - 0.45, 1.1)


def build_cafe2(c):
    """慢讀咖啡：西牆一整面書架（書可以拿）、窗邊的吧檯（插座在窗邊）、後面的吧台（咖啡機、蛋糕櫃）；木頭兩人桌、吊燈"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1
    shell(c)
    counter(c, X0 + 0.6, 1.2, Z0 + 0.95, Z0 + 1.5, h=1.0, top='wood', front='#3b2a1e', why='bar')                 # 吧台
    c.block(X0, 1.25, Z0, Z0 + 1.0, 'bar_back')
    espresso(c, -0.6, 1.0, Z0 + 1.22, face='-z'); register(c, 0.75, 1.0, Z0 + 1.22, face='+z')
    glass_case(c, -2.6, -1.4, Z0 + 0.95, Z0 + 1.5, face='+z', rows=1, warm=False) if False else None
    c.vc.crbox(-2.45, -1.35, 1.0, 1.32, Z0 + 1.0, Z0 + 1.45, '#f4f1ea', r=0.01, seg=1)                             # 蛋糕櫃（玻璃圓頂下兩塊蛋糕）
    for k in range(3): ccyl(c.vc, (-2.25 + k * 0.32, 1.02, Z0 + 1.22), (-2.25 + k * 0.32, 1.1, Z0 + 1.22), 0.09, ['#e8d0b0', '#6a4030', '#f0e0e8'][k], seg=12)
    gl = c.extra.setdefault('cglass', Mesh(f'l118_{c.sid}_caseglass', c.M['glass'])); gl.box(-2.47, -1.33, 1.02, 1.36, Z0 + 0.98, Z0 + 1.47)
    wall_shelf(c, 'N', X0 + 0.5, 1.0, 1.5, items='cups'); wall_shelf(c, 'N', X0 + 0.5, 1.0, 1.95, items='jars')
    c.counter = dict(x0=X0 + 0.6, x1=1.2, z0=Z0 + 0.95, z1=Z0 + 1.5, h=1.0)
    c.clerk = dict(x=-0.2, z=round(Z0 + 0.5, 3), yaw=0.0, note='吧台後面（咖啡機旁），面向店裡（「內用的話，插座在窗邊。」）')
    c.order = dict(x=0.1, z=round(Z0 + 2.05, 3), r=0.8, label='點餐（' + c.T['name'] + '）', note='吧台前面；交給 LAWWW 接 AA_280（shop118:cafe2）')
    bookshelf(c, X0, X0 + 0.32, -2.2, 2.4, h=2.3, along='z'); c.look('books', X0 + 0.9, 0.1, 1.0, '書架', '書可以自由取閱（說明文字由 AA 寫）')
    # 窗邊的吧檯（門的西邊）：高腳椅面向窗外，插座在檯面下
    c.wood.rbox(X0 + 0.35, 1.45, 1.0, 1.04, Z1 - 0.42, Z1 - 0.05, r=0.006, seg=1); c.vm.cbox(X0 + 0.4, 1.4, 0.0, 1.0, Z1 - 0.12, Z1 - 0.08, '#2b2b2b')
    outlets(c, X0 + 0.5, 1.3, 0.92, Z1 - 0.42, n=4)
    c.block(X0 + 0.32, 1.48, Z1 - 0.45, Z1, 'window_bar')
    for x_ in (-2.3, -1.4, -0.5, 0.4): chair(c, x_, Z1 - 0.78, 0.0, 'bar', '#3b2a1e'); c.seat(x_, Z1 - 0.78, 0.0, (x_, Z1 - 0.25), 'eat', label='坐窗邊（有插座）')
    for (tx, tz) in ((-1.55, -1.35), (-1.55, 0.85), (0.75, -1.35), (0.75, 0.85), (2.55, -1.6)):
        table(c, tx, tz, 0.72, 0.7, top='wood'); table_seats(c, tx, tz, 0.72, 0.7, ('-z', '+z'), style='wood', col='#4a3426'); table_set(c, tx + 0.15, tz, 'cafe')
        pendant(c, tx, tz, 2.5, '#2f2a26')
    tubes(c, [(-0.6, Z0 + 1.2, 'x')], L_=1.2)
    frame_board(c, 'N', -2.4, -0.2, 2.25, 3.05, '#2a2018'); printed(c, 'N', -2.4, -0.2, 2.25, 3.05, 'MENU', inset=0.014)
    printed(c, 'S', -2.6, 0.4, 2.66, 3.1, 'NAME', inset=0.016)
    printed(c, 'E', -0.5, 0.1, 1.3, 1.83, 'P1')
    dd = c.door; printed(c, 'S', dd['x'] - 0.95, dd['x'] - 0.5, 1.3, 1.5, 'HOURS', inset=0.03)
    printed(c, 'E', Z0 + 1.0, Z0 + 1.5, 1.45, 1.67, 'P2')
    plant(c, X1 - 0.45, 0.6, 1.3, pot='#e8e4dc'); plant(c, X0 + 0.55, Z1 - 0.95, 1.0, pot='#e8e4dc') if False else None
    ac_unit(c, X1, 2.55, 1.6, '-x')
    c.cam = 4.4


def build_pasta(c):
    """Pasta 118：後面是開放式廚房（爐台、煮麵鍋），前面一排吧檯＋六張高腳椅（「一位嗎？吧檯可以嗎？」）；前面五張兩人桌；黑板菜單、綠色瓷磚"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1
    shell(c)
    frying_station(c, X0 + 0.3, X1 - 1.6, Z0, pans=4)
    c.steel.box(X1 - 1.5, X1, 0.0, 0.9, Z0, Z0 + 0.7)                                                               # 備料台
    clathe(c.vm, [(0.0, 0.0), (0.22, 0.0), (0.22, 0.36), (0.23, 0.37), (0.0, 0.02)], X1 - 0.8, 0.9, Z0 + 0.35, '#c9ced2', seg=18)   # 煮麵的大鍋
    wall_shelf(c, 'N', X0 + 0.4, X1 - 0.4, 1.6, items='jars'); wall_shelf(c, 'N', X0 + 0.4, X1 - 0.4, 2.0, items='bottles')
    counter(c, X0 + 0.6, X1 - 0.6, -2.35, -1.8, h=1.05, top='wood', front='#2f5d50', why='bar')
    c.block(X0, X1, Z0, -2.3, 'open_kitchen'); c.block(X0, X0 + 0.65, -2.35, -1.75, 'bar_end'); c.block(X1 - 0.65, X1, -2.35, -1.75, 'bar_end')
    c.counter = dict(x0=X0 + 0.6, x1=X1 - 0.6, z0=-2.35, z1=-1.8, h=1.05, note='吧檯（後面是開放式廚房）')
    c.clerk = dict(x=0.0, z=-2.95, yaw=0.0, note='開放式廚房、吧檯後面，面向吧檯和店裡')
    c.order = dict(x=-2.7, z=-1.1, r=0.8, label='點餐（' + c.T['name'] + '）', note='吧檯西端；交給 LAWWW 接 AA_280（shop118:pasta）')
    register(c, -2.75, 1.05, -2.07, face='+z')
    for x_ in (-1.8, -1.0, -0.2, 0.6, 1.4, 2.2): chair(c, x_, -1.4, PI, 'bar', '#2f5d50'); c.seat(x_, -1.4, PI, (x_, -2.07), 'eat', label='坐吧檯')
    for (tx, tz) in ((-1.0, 0.55), (1.05, 0.55), (3.0, 0.3), (-1.0, 2.6), (1.05, 2.6)):
        table(c, tx, tz, 0.72, 0.7, top='lam', col='#f4f1ea', legc='#2b2b2b'); table_seats(c, tx, tz, 0.72, 0.7, ('-z', '+z'), style='wood', col='#3d6b5c'); table_set(c, tx + 0.15, tz, 'cafe')
    for x_ in (-1.6, 0.0, 1.6): pendant(c, x_, -2.07, 2.55, '#2f5d50', r=0.16, grp='N')   # 吧檯上面：跟著後牆淡出
    tubes(c, [(-1.5, Z0 + 0.9, 'x'), (1.5, Z0 + 0.9, 'x'), (0.0, 1.6, 'x'), (-2.6, 1.0, 'z')])
    frame_board(c, 'E', -1.0, 1.0, 1.55, 2.3, '#4a3020'); printed(c, 'E', -1.0, 1.0, 1.55, 2.3, 'MENU', inset=0.014)
    printed(c, 'S', -1.6, 1.4, 2.66, 3.1, 'NAME', inset=0.016)
    frame_board(c, 'W', -0.8, -0.2, 1.3, 1.85, '#2b2b2b'); printed(c, 'W', -0.8, -0.2, 1.3, 1.85, 'P1', inset=0.014)
    dd = c.door; printed(c, 'S', dd['x'] + 0.55, dd['x'] + 1.0, 1.3, 1.5, 'HOURS', inset=0.03)
    printed(c, 'W', -2.0, -1.5, 1.45, 1.67, 'P2')
    plant(c, X1 - 0.45, Z1 - 0.45, 1.2, pot='#e8e4dc'); ac_unit(c, X0, 2.55, 1.6, '+x')


def build_korea(c):
    """韓食小廚：後面櫃台＋出菜口（石鍋擺在架上），東牆的小菜櫃（「小菜可以續喔」），三角小旗；木頭四人桌"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1
    shell(c); kitchen(c, -1.0, 0.8, depth=1.8, win=(1.0, 1.6), door=(-2.6, -1.85))
    counter(c, X0, 1.1, Z0 + 0.95, Z0 + 1.5, h=1.0, top='wood', front='#1f4e8c', why='counter'); c.block(X0, 1.15, Z0, Z0 + 1.0, 'counter_back')
    register(c, 0.7, 1.0, Z0 + 1.22, face='+z')
    for k in range(5): clathe(c.vc, [(0.0, 0.0), (0.07, 0.0), (0.09, 0.08), (0.08, 0.09), (0.0, 0.01)], -2.1 + k * 0.24, 1.0, Z0 + 1.22, '#2b2a28', seg=12)   # 石鍋
    wall_shelf(c, 'W', -1.2, 0.6, 2.0, items='stone')
    c.counter = dict(x0=X0, x1=1.1, z0=Z0 + 0.95, z1=Z0 + 1.5, h=1.0)
    c.clerk = dict(x=-0.2, z=round(Z0 + 0.5, 3), yaw=0.0, note='櫃台後面（出菜口前），面向店裡（「小菜可以續喔。」）')
    c.order = dict(x=-0.2, z=round(Z0 + 2.05, 3), r=0.8, label='點餐（' + c.T['name'] + '）', note='櫃台前面；交給 LAWWW 接 AA_280（shop118:korea）')
    glass_case(c, X1 - 0.6, X1, -1.2, 0.4, face='-x', rows=1, warm=False); c.look('banchan', X1 - 1.15, -0.4, 0.8, '小菜櫃', '小菜可以續（自己拿；說明文字由 AA 寫）')
    drink_fridge(c, 1.5, 2.3, Z0, face='+z')
    for (tx, tz) in ((-1.9, -1.2), (-1.9, 1.0), (0.4, -1.2), (0.4, 1.0), (0.4, 3.0)):
        table(c, tx, tz, 1.0, 0.72, top='wood'); table_seats(c, tx, tz, 1.0, 0.72, ('-z', '+z'), style='wood', col='#6a4a30', n_per=2); table_set(c, tx + 0.35, tz, 'korea')
    banners(c, 'W', -3.0, 3.0, ['#c9463d', '#1f4e8c', '#f4f1ea']); banners(c, 'E', 0.8, 3.6, ['#1f4e8c', '#c9463d', '#f4f1ea'])
    tubes(c, [(-1.9, -0.1, 'x'), (0.4, -0.1, 'x'), (0.4, 2.0, 'x'), (-1.9, 2.0, 'x'), (-0.5, Z0 + 1.2, 'x')])
    frame_board(c, 'N', 1.2, 3.1, 2.0, 2.72, '#1f2e4c') if False else None
    printed(c, 'N', -3.0, -1.2, 1.85, 2.52, 'MENU', inset=0.016)
    printed(c, 'W', -0.9, 1.5, 2.5, 2.95, 'NAME') if False else printed(c, 'E', 1.0, 3.4, 2.15, 2.6, 'NAME')
    printed(c, 'E', -1.0, -0.4, 1.55, 2.08, 'P1')
    dd = c.door; printed(c, 'S', dd['x'] - 0.95, dd['x'] - 0.5, 1.3, 1.5, 'HOURS', inset=0.03)
    printed(c, 'N', 1.25, 1.75, 2.1, 2.32, 'P2')
    ac_unit(c, X0, 2.55, 2.0, '+x'); plant(c, X0 + 0.45, Z1 - 0.45, 1.1)


def build_omu(c):
    """蛋包飯研究所：後面開放式廚房（平底鍋、一盒一盒的蛋、燒杯錐形瓶裝醬汁）、前面一排吧檯＋五張高腳椅；白板「今日實驗」；黃色瓷磚；球形吊燈"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1
    shell(c)
    frying_station(c, -1.5, X1 - 0.3, Z0, pans=3)
    c.steel.box(X0 + 0.3, -1.6, 0.0, 0.9, Z0, Z0 + 0.7); rice_cooker(c, -2.5, 0.9, Z0 + 0.35)
    for k in range(3): eggs(c, -1.25 + k * 0.4, 0.9, Z0 + 0.6)
    flasks(c, 'N', X0 + 0.4, 1.2, 1.55); flasks(c, 'N', X0 + 0.4, 1.2, 1.95)
    counter(c, -1.6, X1 - 0.45, -1.9, -1.35, h=1.05, top='wood', front='#e0a030', why='bar')
    c.block(X0, X1, Z0, -1.85, 'open_kitchen'); c.block(X1 - 0.5, X1, -1.9, -1.3, 'bar_end')
    counter(c, X0 + 0.25, -1.6, -1.9, -1.35, h=1.05, top='wood', front='#e0a030', why='register_counter'); register(c, -2.3, 1.05, -1.62, face='+z')
    c.counter = dict(x0=X0 + 0.25, x1=X1 - 0.45, z0=-1.9, z1=-1.35, h=1.05, note='吧檯（後面是開放式廚房）')
    c.clerk = dict(x=0.6, z=-2.55, yaw=0.0, note='開放式廚房、吧檯後面（平底鍋前），面向客人（「蛋要全熟還是半熟？」）')
    c.order = dict(x=-2.3, z=-0.7, r=0.8, label='點餐（' + c.T['name'] + '）', note='吧檯西端的收銀；交給 LAWWW 接 AA_280（shop118:omu）')
    for x_ in (-1.0, -0.2, 0.6, 1.4, 2.2): chair(c, x_, -0.95, PI, 'bar', '#e0a030'); c.seat(x_, -0.95, PI, (x_, -1.62), 'eat', label='坐吧檯')
    for (tx, tz) in ((-1.95, 0.65), (0.2, 0.75), (2.25, 0.75), (0.2, 2.6), (2.25, 2.6)):
        table(c, tx, tz, 0.7, 0.68, top='lam', col='#fbf3df', legc='#5c3a21'); table_seats(c, tx, tz, 0.7, 0.68, ('-z', '+z'), style='wood', col='#b08a5e'); table_set(c, tx + 0.15, tz, 'cafe')
    for (x_, z_) in ((-1.95, 0.65), (0.2, 0.75), (2.25, 0.75), (0.2, 2.6), (2.25, 2.6), (-0.4, -1.62), (1.6, -1.62)):   # 球形吊燈（2.6 m：不擋遊戲的鏡頭；吧檯上面那兩盞跟著後牆淡出）
        bar = z_ < -1; vc_ = c.wg('N', 'lamps', c.M['vc'], cm=True) if bar else c.vc; wm_ = c.wg('N', 'lampbulb', c.M['warm']) if bar else c.warm
        ccyl(vc_, (x_, 2.7, z_), (x_, H, z_), 0.005, '#2a2a2a', seg=4); wm_.sphere((x_, 2.6, z_), 0.1, seg=14, rings=8)
    frame_board(c, 'N', 1.35, 2.65, 2.2, 2.68, '#e8e8e4') if False else None
    printed(c, 'E', -0.9, 1.1, 1.75, 2.5, 'MENU', inset=0.016)
    printed(c, 'S', -1.0, 2.0, 2.66, 3.1, 'NAME', inset=0.016)
    c.wg('N', 'trim', c.M['vc'], cm=True).cbox(1.45, 2.45, 1.4, 2.32, Z0, Z0 + 0.02, '#f4f4f1'); printed(c, 'N', 1.5, 2.4, 1.45, 2.27, 'P1', inset=0.024)   # 白板「今日實驗」
    dd = c.door; printed(c, 'S', dd['x'] + 0.55, dd['x'] + 1.0, 1.3, 1.5, 'HOURS', inset=0.03)
    printed(c, 'W', 1.6, 2.1, 1.45, 1.67, 'P2')
    ac_unit(c, X0, 2.55, 1.2, '+x'); plant(c, X1 - 0.45, Z1 - 0.45, 1.1, pot='#e0a030')


def build_noodle2(c):
    """六張犁麵舖：店門口那一側（西牆前段）是煮麵台（兩口大湯鍋），老闆站在後面、隔著小菜櫃面向客人（「大碗小碗？」）；不鏽鋼方桌＋圓凳、電視、壁扇；後面出菜口"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1
    shell(c); kitchen(c, -1.2, 0.8, depth=1.6, win=(1.0, 1.55), door=(1.4, 2.15))
    noodle_station(c, X0, X0 + 0.75, 1.3, Z1 - 0.2)
    glass_case(c, -1.75, -1.3, 1.3, Z1 - 0.4, face='+x', rows=2, warm=False); c.look('sides', -0.75, 2.8, 0.7, '小菜櫃', '小菜自己拿，一盤三十（說明文字由 AA 寫）')
    c.block(X0, -1.25, 1.25, Z1, 'noodle_back')
    c.counter = dict(x0=-1.75, x1=-1.3, z0=1.3, z1=Z1 - 0.4, h=1.05, note='小菜櫃（老闆隔著它面向客人）')
    c.clerk = dict(x=-2.1, z=2.6, yaw=PI / 2, note='煮麵台和小菜櫃中間，面向店裡（老闆：「大碗小碗？」）；從巷子隔著玻璃看得到')
    c.order = dict(x=-0.75, z=2.0, r=0.8, label='點餐（' + c.T['name'] + '）', note='小菜櫃前面；交給 LAWWW 接 AA_280（shop118:noodle2）')
    for (tx, tz) in ((-2.2, -2.4), (-2.2, -0.35), (0.05, -2.4), (0.05, -0.35), (2.3, -2.4), (2.3, -0.35), (0.05, 1.7), (2.3, 1.7)):
        table(c, tx, tz, 0.75, 0.75, top='steel', legc='#9aa0a4'); table_seats(c, tx, tz, 0.75, 0.75, ('-z', '+z'), style='steelstool' if tx > 0 else 'stool', col='#c8322a'); table_set(c, tx + 0.2, tz + 0.15, 'tw')
    water_station(c, 2.75, Z0 + 0.3); cups_stack(c, 2.75, 1.05, Z0 + 0.42, 6)
    tv(c, 'E', -1.4, 2.5, 0.85); c.wg('E', 'trim', c.M['vc'], cm=True).cbox(X1 - 0.3, X1, 2.15, 2.19, -1.8, -1.0, '#3a3a3a')
    tubes(c, [(-2.2, -1.4, 'x'), (0.05, -1.4, 'x'), (2.3, -1.4, 'x'), (0.05, 0.7, 'x'), (2.3, 0.7, 'x'), (-2.0, 2.7, 'z')])
    frame_board(c, 'W', 1.5, 3.5, 2.2, 2.95, '#f4ead8'); printed(c, 'W', 1.5, 3.5, 2.2, 2.95, 'MENU', inset=0.014)
    printed(c, 'N', -3.0, -1.4, 2.6, 2.9, 'NAME') if False else printed(c, 'N', 1.0, 3.2, 2.5, 2.92, 'NAME')
    printed(c, 'W', -1.0, -0.4, 1.3, 1.83, 'P1')
    dd = c.door; printed(c, 'S', dd['x'] + 0.55, dd['x'] + 1.0, 1.3, 1.5, 'HOURS', inset=0.03)
    printed(c, 'E', 1.4, 1.9, 1.45, 1.67, 'P2')
    wall_fan(c, X0, 2.45, -1.4, '+x'); ac_unit(c, X1, 2.55, 1.2, '-x')


BUILD = {'dian': build_dian, 'self': build_self, 'tea': build_tea, 'home': build_home, 'cafe2': build_cafe2, 'pasta': build_pasta, 'korea': build_korea, 'omu': build_omu, 'noodle2': build_noodle2}


def build(sid):
    c = Shop(sid); c.extra = {}
    BUILD[sid](c)
    return finish(c)


if __name__ == '__main__':
    os.makedirs(GEN, exist_ok=True)
    if not all(os.path.exists(os.path.join(GEN, f'l118_{k}_print.png')) for k in TX.SHOPS) or not os.path.exists(os.path.join(GEN, 'l118_screens.png')): TX.all_tex()
    which = arg('--shop', 'all'); todo = list(BUILD) if which == 'all' else which.split(',')
    if len(todo) == 1:
        p = build(todo[0]); print('LANE118_SHOPS', 'OK' if not p else {todo[0]: p})
    else:   # 一間店一個 Blender 程序（lib2 的貼圖快取在 B.reset 之後會指到已經刪掉的圖）
        import subprocess
        for sid in todo: subprocess.run([sys.executable, os.path.abspath(__file__), '--', '--shop', sid, '--out-dir', OUTDIR], check=False)
