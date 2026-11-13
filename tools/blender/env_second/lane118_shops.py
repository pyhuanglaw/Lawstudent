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
NB_W, NB_H = 4.6, 4.2   # 店門外兩側鄰居店面卡的寬、高（m；lane118_neighbors.py 照這個大小拍）
BAR_LIFT = 0.31   # 吧檯高腳椅（chair 的 'bar'）座面 0.76 m、一般椅子 0.45 m：坐姿抬高 0.31（10-22 LAWWW2：原本沒寫，人坐在 0.45 m、凳子穿過大腿）

# 每間店：室內寬（店面寬減兩側壁柱）、深度、地板、牆、腰牆、木頭、門的位置（x）、照明
SPEC = {
    'dian': dict(W=5.6, D=8.0, floor=('granite_tile', '#d2d0c9', 1.0), wall='#f5f2ea', wain=('long_white_tiles', '#eef0ec', 1.0), wainH=2.3, wood=('walnut_veneer', '#8e4a34'), door_x=1.5, trim='#c4201a'),   # L118-SHOPS-REDO-1111：118牛排（參考圖：白磁磚牆、紅木色小桌配紅圓凳）
    'self': dict(W=6.6, D=9.0, floor=('granite_tile', '#d8d6cf', 1.0), wall='#f6f2e6', wain=('long_white_tiles', '#eef0ec', 1.0), wainH=1.2, wood=('walnut_veneer', '#8a6a4a'), door_x=-2.2, trim='#e0a814'),   # 水上便當（參考圖：不鏽鋼＋白磁磚、黃色）
    'tea': dict(W=2.6, D=8.0, floor=('granite_tile', '#b9b0a2', 1.0), wall='#f3e8d6', wain=('long_white_tiles', '#8a2a26', 1.0), wainH=1.0, wood=('walnut_veneer', '#6e4a32'), door_x=-0.5, trim='#7a1418', cam=3.6),   # L118-SHOPS-REDO-1111：辛亥韓食（店面 3 m 寬不動，室內加深到 8 m；LAWWW 11-11 04:15）
    'home': dict(W=7.6, D=8.5, floor=('granite_tile', '#b9b2a6', 1.0), wall='#f1ebdd', wain=('long_white_tiles', '#e6e2d6', 1.0), wainH=1.3, wood=('walnut_veneer', '#7a5a3a'), door_x=-2.6, trim='#8c3b2a'),
    'cafe2': dict(W=6.6, D=9.0, floor=('herringbone_parquet', '#cdb594', 1.4), wall='#eee6d8', wain=('dark_wood', '#5c4231', 1.0), wainH=0.95, wood=('black_walnut_veneer_01', '#6a4a33'), door_x=2.2, trim='#3b2a1e', ceil='#e9e2d4'),
    'pasta': dict(W=7.6, D=8.5, floor=('terrazzo_tiles', '#d9d3c7', 1.2), wall='#f4efe6', wain=('rounded_square_tiled_wall', '#3d6b5c', 0.8), wainH=1.0, wood=('walnut_veneer', '#8a6440'), door_x=-2.6, trim='#2f5d50'),
    'korea': dict(W=6.6, D=8.5, floor=('granite_tile', '#d0cec7', 1.0), wall='#f6f4ee', wain=('long_white_tiles', '#eef0ec', 1.0), wainH=2.3, wood=('walnut_veneer', '#9a7048'), door_x=2.2, trim='#b41e1c', kpass=True),   # 清州刀削麵（參考圖：白磁磚牆、不鏽鋼桌配圓凳、壁扇）
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
            'ceil': L.flat(f'l118_{sid}_ceiling', s.get('ceil', '#f2efe8'), rough=0.9, cull=True),   # 單面朝下：鏡頭在天花板上面（雙指拉遠、往上拖）時看得穿（10-22 LAWWW2；原本雙面，拉遠是一大片白）
            'kceil': L.flat(f'l118_{sid}_kceiling', '#cfcbc3', rough=0.9, cull=True),          # 廚房的天花板（暗一點），同上
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
        self.WGP = {}                           # 牆的網格另外帶的 props：(side, key) → dict（鄰居店面卡的 at）

    # ---------- 配置 ----------
    def block(self, x0, x1, z0, z1, why):
        self.blocks.append(dict(x0=round(min(x0, x1), 3), x1=round(max(x0, x1), 3), z0=round(min(z0, z1), 3), z1=round(max(z0, z1), 3), why=why))

    def seat(self, x, z, yaw, table, kind='eat', ap=None, label=None, lift=None):
        s = dict(x=round(x, 3), z=round(z, 3), yaw=round(yaw, 4), kind=kind, table=[round(table[0], 3), round(table[1], 3)])
        if ap: s['ap'] = [round(ap[0], 3), round(ap[1], 3)]
        if label: s['label'] = label
        if lift: s['lift'] = lift                                                                  # 高腳椅：坐姿抬高（遊戲 GAME.sitAt 的 seat.lift）
        self.seats.append(s)

    def look(self, iid, x, z, r, label, note='', dev=None):
        """只能看的東西：note＝遊戲裡顯示的字（空的＝等 AA 寫，遊戲顯示 label）；dev＝給開發組的說明（不顯示）"""
        self.inter.append(dict(id=iid, x=round(x, 3), z=round(z, 3), r=r, label=label, note=note, **({'dev': dev} if dev else {})))

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
    if getattr(c, 'ph', None) and style in c.CH:   # CC0 的店（SHOP-CC0-HELP-1113）：Poly Haven 掃描的椅凳（坐的位置、方向照舊）
        aid, kw = c.CH[style]; kw = dict(kw)
        if 'mat' in kw: kw['material'] = c.MX[kw.pop('mat')]   # 換成店裡的材質組
        c.ph.put(aid, x, 0.0, z, yaw, **kw); return
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


def table_seats(c, cx, cz, w, d, sides, style='wood', col='#6b4a30', kind='eat', gap=0.3, n_per=1, ap_side=False):
    """桌子旁邊的椅子：sides＝'-z' '+z' '-x' '+x'（椅子在桌子哪一邊）；坐的人面向桌子
    ap_side：'-z'／'+z' 的椅子從桌子的兩端走過來（走近點在椅子旁邊 0.5 m）——兩排桌子靠得近、椅子背對背的時候用（不然按鈕會被另一排的椅子搶走）"""
    for sd in sides:
        for k in range(n_per):
            t = (k + 0.5) / n_per - 0.5
            if sd in ('-z', '+z'):
                x = cx + t * w; z = cz - d / 2 - gap if sd == '-z' else cz + d / 2 + gap; yaw = 0.0 if sd == '-z' else PI
            else:
                z = cz + t * d; x = cx - w / 2 - gap if sd == '-x' else cx + w / 2 + gap; yaw = PI / 2 if sd == '-x' else -PI / 2
            chair(c, x, z, yaw, style, col); c.seat(x, z, yaw, (cx, cz), kind, ap=(x + (0.5 if x > cx else -0.5), z) if ap_side and sd in ('-z', '+z') else None)


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


CEIL4 = ('dian', 'self', 'korea', 'tea')


def _cn(c, name):
    """貼著天花板的東西（第 3 版；BB_341 第四節：辛亥韓食鏡頭拉到最遠時，燈具、橫樑從上面橫過畫面）：這四間的網格名字加 CEIL_——
    遊戲的 Z3.attachRoomGLB → ceilHide（zones3d.js 現成的）在鏡頭高過天花板時把 CEIL_* 整組藏起來。其他五間（LAWWW 那邊重做的）照舊、不加"""
    return ('CEIL_' if c.sid in CEIL4 else '') + name


def _cv(c): return c.extra.setdefault('ceil_vc', CMesh(f'CEIL_l118_{c.sid}_vc', c.M['vc'])) if c.sid in CEIL4 else c.vc
def _ct(c): return c.extra.setdefault('ceil_tube', Mesh(f'CEIL_l118_{c.sid}_light', c.M['tube'])) if c.sid in CEIL4 else c.tube
def _cw(c): return c.extra.setdefault('ceil_warm', Mesh(f'CEIL_l118_{c.sid}_warm', c.M['warm'])) if c.sid in CEIL4 else c.warm


def tubes(c, pts, L_=1.2):
    """日光燈（燈座＋燈管）：pts＝[(x, z, 'x'|'z')]"""
    for (x, z, ax) in pts:
        if ax == 'x': _cv(c).cbox(x - L_ / 2 - 0.04, x + L_ / 2 + 0.04, H - 0.06, H, z - 0.07, z + 0.07, '#e9e9e6'); _ct(c).cyl((x - L_ / 2, H - 0.085, z), (x + L_ / 2, H - 0.085, z), 0.016, seg=8)
        else: _cv(c).cbox(x - 0.07, x + 0.07, H - 0.06, H, z - L_ / 2 - 0.04, z + L_ / 2 + 0.04, '#e9e9e6'); _ct(c).cyl((x, H - 0.085, z - L_ / 2), (x, H - 0.085, z + L_ / 2), 0.016, seg=8)


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


def ac_unit(c, x, y, z, face, w=0.9, fade=False):
    """分離式冷氣的室內機（掛在牆上）。fade＝跟著那一面牆淡出（鏡頭在牆外時不會飄在半空中擋住畫面；10-20 起新做的房間都用）"""
    yaw = {'+z': 0.0, '-z': PI, '+x': PI / 2, '-x': -PI / 2}[face]; T = rot(x, z, yaw)
    m = c.wg({'+z': 'N', '-z': 'S', '+x': 'W', '-x': 'E'}[face], 'trim', c.M['vc'], cm=True) if fade else c.vc
    rbox(m, T, -w / 2, w / 2, y, y + 0.28, 0.0, 0.22, '#f4f4f1', r=0.03, seg=2)
    rbox(m, T, -w / 2 + 0.03, w / 2 - 0.03, y + 0.01, y + 0.05, 0.12, 0.225, '#d9dad6', r=0.0)
    rbox(m, T, w / 2 - 0.12, w / 2 - 0.06, y + 0.2, y + 0.215, 0.215, 0.226, '#3fbf6a')


def plant(c, x, z, h=1.1, pot='#5a4a3e', leaf='#3f7a3a'):
    """發財樹（門口、櫃台旁）：花盆＋樹幹三支＋一層層的葉子（頂點色）"""
    if getattr(c, 'ph', None): c.ph.put('potted_plant_02', x, 0.0, z, (abs(x * 7.3 + z * 3.1) % 6.283), s=h, share=False, height=1.0, decimate=0.02); return   # CC0 的店：Poly Haven 盆栽（植物不共用網格：烘焙）
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


def _over_trim(c, y0, y1):
    wh = c.S['wainH']; return c.sid in ('dian', 'korea') and y0 < wh + 0.03 and y1 > wh - 0.02


def printed(c, side, x0, x1, y0, y1, key, inset=0.015):
    """牆上的印刷品（菜單、店名、海報）：side＝貼在哪面牆（N W E S），往室內 inset；key＝lane118_shops_tex 的區域"""
    rect = TX.uv(TX.REG, key); X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; m = c.wg(side, 'print', c.M['print'])
    if _over_trim(c, y0, y1): inset = max(inset, 0.024)   # 第 3 版：白磁磚貼到 2.3 m 的兩間（118牛排、清州刀削麵），牆上的紅色收邊條凸出 1.5 cm，會橫切過跨在上面的菜單、海報——跨過收邊條的往外多墊一點
    if side == 'N': z = Z0 + inset; pts = [(x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z)]
    elif side == 'S': z = Z1 - inset; pts = [(x1, y0, z), (x0, y0, z), (x0, y1, z), (x1, y1, z)]
    elif side == 'W': x = X0 + inset; pts = [(x, y0, x1), (x, y0, x0), (x, y1, x0), (x, y1, x1)]       # W、E：x0、x1 當成 z 的範圍（由左到右：W 牆從 +z 看到 −z）
    else: x = X1 - inset; pts = [(x, y0, x0), (x, y0, x1), (x, y1, x1), (x, y1, x0)]
    uvquad(m, pts, rect)


def frame_board(c, side, a0, a1, y0, y1, col='#3a2a1e', t=0.03, inset=0.012):
    """印刷品的框（牆面往外 inset 的薄框；印刷品貼在框的前面）"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; m = c.wg(side, 'trim', c.M['vc'], cm=True)
    if _over_trim(c, y0 - t, y1 + t): inset = max(inset, 0.022)
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
    c.vc.cbox(X0 - NB_W, X1 + NB_W, -0.05, 0.0, Z1, vz, '#9a9893')                                     # 門口的騎樓地（往外到巷子那張景；兩側到鄰居店面卡的外緣）
    neighbors(c)
    # 天花板
    ce = Mesh(_cn(c, f'l118_{c.sid}_ceiling'), M['ceil']); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(c.root, uv=hasattr(c, 'cc0m'))   # CC0 的店：灰泥材質組要 UV   # 朝下（和溫州街店家、便利商店一樣）
    c.door = dict(x=dx, w=dw, z=Z1)
    c.spawn = dict(x=dx, z=round(Z1 - 1.5, 3), yaw=PI, note='從門進來、面向店裡')
    c.exits = [dict(x=dx, z=round(Z1 - 0.45, 3), r=0.7, label='離開' + c.T['name'], to='lane118')]



def neighbors(c):
    """店門外騎樓兩側的鄰居店面（10-22 LAWWW2）：進門時鏡頭在騎樓（店面外 2 m 多），門靠側牆的店（蛋包飯、自助餐、家常菜、慢讀咖啡）
    原本畫面一側三分之一是店外的空白（天空的下半）。改成 118 巷街景 GLB 真的鄰居店面（lane118_neighbors.py 正面拍的圖，和門外那張巷子同一種做法：
    遊戲讓它自己發光、晚上調暗，l118_shops3d.js 的 viewMats 認 _view），貼在店面那一條線上（z＝Z1），左右各 NB_W 寬、NB_H 高。
    歸左右牆的組（WALL_W_nb_view／WALL_E_nb_view）：鏡頭繞到側牆外面時一起淡出，不會擋住人。
    淡出判斷點 at＝牆線上（x＝X0／X1）：外框中心在牆線外 2.3 m，用外框中心判斷的話，鏡頭在牆線外 2.3 m 以內不會淡出、會擋住人
    （zones3d.js attachRoomGLB 讀 userData.at：patches/l118_arcade.diff）。單面、朝騎樓。"""
    X0, X1, Z1 = c.X0, c.X1, c.Z1
    for side, xa, xb, xat in (('W', X0 - NB_W, X0, X0), ('E', X1, X1 + NB_W, X1)):
        fn = f'l118_nb_{c.sid}_{side}.jpg'
        if os.path.exists(os.path.join(GEN, fn)): mat = img_mat(f'l118_{c.sid}_nb{side}_view', fn, rough=0.9)
        else: mat = L.flat(f'l118_{c.sid}_nb{side}_view', '#b9b4aa', rough=0.9); print('沒有鄰居店面圖（先跑 lane118_neighbors.py）：', fn)
        mat.use_backface_culling = True
        uvquad(c.wg(side, 'nb_view', mat), [(xa, 0.0, Z1), (xb, 0.0, Z1), (xb, NB_H, Z1), (xa, NB_H, Z1)], (0.0, 0.0, 1.0, 1.0))
        c.WGP[(side, 'nb_view')] = {'at': [round(xat, 3), 1.6, round(Z1, 3)]}


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
    c.wg('N', 'kceil', M['kceil']).quad([(X0, H, zk), (X1, H, zk), (X1, H, Z0), (X0, H, Z0)])          # 天花板：單面朝下（原本在頂點色網格裡、雙面）
    ks.box(X0 + 0.1, X1 - 0.1, 0.0, 0.86, zk, zk + 0.65); ks.box(X0 + 0.1, X1 - 0.1, 0.86, 0.9, zk, zk + 0.68)   # 爐台
    for k in range(int((X1 - X0 - 0.4) / 0.7)):
        bx = X0 + 0.5 + k * 0.7; ccyl(kt, (bx, 0.9, zk + 0.35), (bx, 0.93, zk + 0.35), 0.16, '#202020', seg=14)
        if k % 2 == 0: clathe(kt, [(0.0, 0.0), (0.12, 0.02), (0.2, 0.09), (0.21, 0.1), (0.0, 0.1)], bx, 0.93, zk + 0.35, '#2b2b2b', seg=16)   # 炒鍋
        else: clathe(c.vm, [(0.0, 0.0), (0.17, 0.0), (0.17, 0.26), (0.16, 0.26), (0.0, 0.01)], bx, 0.93, zk + 0.35, '#b9bec2', seg=16)        # 湯鍋
    ks.box(X0 + 0.05, X1 - 0.05, 2.1, 2.5, zk, zk + 0.75)                                                 # 抽油煙機
    kt.cbox((X0 + X1) / 2 - 0.7, (X0 + X1) / 2 + 0.7, H - 0.06, H, Z0 - 0.75, Z0 - 0.6, '#e9e9e6'); _ct(c).cyl(((X0 + X1) / 2 - 0.62, H - 0.085, Z0 - 0.675), ((X0 + X1) / 2 + 0.62, H - 0.085, Z0 - 0.675), 0.016, seg=8)   # 廚房的日光燈
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
            uv = key in ('wall', 'wain') or '_' in key; mg = key not in ('print', 'screen', 'view')   # '_'：CC0 的店分到材質組的牆上零件（trim_wood_d、ksteel_cc0…）要盒狀 UV
            m.finish(c.root, props=dict({'dir': D[k]}, **c.WGP.get((k, key), {})), uv=uv, merge=mg)
    cc0m = getattr(c, 'cc0m', None)
    if cc0m is not None: c.vc, c.vm, c.steel = c._vc0, c._vm0, c._steel0   # CC0 的店：轉接器拿掉，剩下沒分到材質組的頂點色零件照舊
    for m in (c.vc, c.vm, c.tube, c.warm, c.fridgel, c.steel): m.finish(c.root, uv=False)
    for m in (cc0m or {}).values(): m.finish(c.root)                          # 材質組網格（盒狀 UV）
    for m in getattr(c, 'cc0raw', []): m.finish(c.root, uv=False, smooth=True)   # 自己帶 UV 的（菜色貼圖集的菜面、炸物）
    c.wood.finish(c.root)
    for m in (c.prt, c.scr): m.finish(c.root, uv=False, merge=False)
    for m in c.extra.values(): m.finish(c.root, uv=False)
    if getattr(c, 'ph', None): c.ph.cleanup()   # Poly Haven 原型不匯出（複製的那幾份共用同一個網格）
    L.merge_by_material(c.root, keep=lambda ob: ob.name.startswith(('WALL_', 'CEIL_')), key=lambda ob: '')
    out = os.path.join(OUTDIR, f'l118_{c.sid}.glb'); st = L.export(out, gpu_instances=False)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    sh = next(q for q in LAY['shops'] if q['id'] == c.sid); Wst = sh['side'] == 'W'; fx = LAY['facade']['west'] if Wst else LAY['facade']['east']; cz = (sh['z0'] + sh['z1']) / 2
    street = dict(side=sh['side'], door=dict(x=round(fx + (0.9 if Wst else -0.9), 3), z=cz, note='118 巷的店門口互動點（現在 zones3d.js buildLane118 的位置）'),
                  spawn_out=dict(x=round(fx + (1.3 if Wst else -1.3), 3), z=round(cz + 1.7, 3), yaw=0.0, note='出店門站的位置：人行道上、面向後門（辛亥路）那一頭（面向巷子對面的話，鏡頭會被自己店的牆擠到人物背後）；離門口互動點 1.75 m（現在的互動半徑 1.4 m：一出來不會就顯示「進店」）'))
    lay = dict(version=1, zone=f'l118_{c.sid}', shop=c.sid, name=c.T['name'], type=c.T['sub'], src='AA_280（店名、菜單）；LANE118-SHOPS-1020（室內）',
               bounds=dict(x0=c.X0, x1=c.X1, z0=c.Z0, z1=c.Z1), h=H, cam_dist=c.S.get('cam', 3.6), door=c.door, spawn=c.spawn, exits=c.exits, street=street,
               counter=c.counter, clerk=c.clerk, order=c.order, seats=c.seats, interact=c.inter, blocks=c.blocks)
    if getattr(c, 'cook', None): lay['cook'] = c.cook   # 第二個店員的站位（清州刀削麵門口削麵的師傅；AA_772）——選用欄位，沒有的店不寫
    sys.path.insert(0, os.path.join(L.ROOT, 'tools', 'lane118')); import it_fix; _st = it_fix.apply(c.sid, lay)   # L118-IT-REACH-1111：按鈕位置、走近點、半徑照 tools/lane118/it_fix.py（BB 在使用者電腦驗過的值；原本是遊戲程式裡的覆寫表）
    if _st: print('IT_FIX 對不到配置：' + '、'.join(_st))
    prob = navcheck(c, lay); lay['navcheck'] = dict(cell=0.4, inset=0.25, problems=prob)
    L.write_json(os.path.join(OUTDIR, f'l118_{c.sid}.layout.json'), lay)
    L.write_json(out[:-4] + '.json', dict(st if isinstance(st, dict) else {}, tris_total=tris, layout=f'l118_{c.sid}.layout.json', seats=len(c.seats)))
    print(json.dumps({'shop': c.sid, 'tris': tris, 'seats': len(c.seats), 'problems': prob}, ensure_ascii=False))
    if getattr(c, 'ph', None): import cc0_kit; print('CC0_USED', json.dumps(cc0_kit.USED, ensure_ascii=False))
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
    if getattr(c, 'foodm', None):   # CC0 的店（SHOP-CC0-HELP-1113 v2，LAWWW2-C 驗收）：不鏽鋼盤＋一片中間隆起、貼菜色貼圖集的菜面（不是一堆扁色塊）
        c.vm.cbox(x0, x1, y - 0.06, y, z0, z1, '#c9ced2'); cell = FOOD.index(col) if col in FOOD else 0
        c.vm.cbox(x0, x1, y, y + 0.012, z0, z0 + 0.008, '#c9ced2'); c.vm.cbox(x0, x1, y, y + 0.012, z1 - 0.008, z1, '#c9ced2')   # 盤緣（前後兩條；左右靠隔條）
        food_dome(c, x0 + 0.006, x1 - 0.006, z0 + 0.008, z1 - 0.008, y + 0.004, 0.035, cell); return   # 菜面鋪滿整盤、中間堆高 3.5 cm
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
    # 輪廓從軸心往外、往下、再沿內面回到軸心（ART-LAMPSHADE-FLIP-1027，10-31）：原本的順序車出來的殼體積是負的＝裡外相反，
    #   單面材質從外面看到的是背面（慢讀咖啡 5 盞、義大利麵 3 盞；部署的 GLB 用 glb_flip_insideout.py 修過）
    clathe(vm, [(0.0, 0.185), (r * 0.57, 0.095), (r * 0.97, -0.004), (r, 0.0), (r * 0.6, 0.1), (0.05, 0.19), (0.02, 0.2)], x, y, z, col, seg=18)
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
    if getattr(c, 'ph', None) and items == 'bowls':   # CC0 的店（D159：不要一樣大小排成一排）：一疊一疊（1～4 個）、大小兩種、間距不一樣，偶爾空一格
        while a < a1 - 0.1:
            if rr.random() < 0.15: a += 0.14; continue
            big = rr.random() < 0.4; r0 = 0.075 if big else 0.06; col = rr.choice(['#f4f1ea', '#f4f1ea', '#e8e0d0', '#3a3a3a']); px, pz = P(a + r0, depth * 0.5)
            for k in range(rr.choice((1, 2, 2, 3, 4))): clathe(m, [(0.0, 0.0), (r0 * 0.66, 0.0), (r0, r0 * 0.93), (r0 * 0.93, r0 * 0.93), (0.0, 0.006)], px, y + k * r0 * 0.42, pz, col, seg=12)
            a += 2 * r0 + rr.uniform(0.03, 0.09)
        a = a1
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
    """118牛排（L118-SHOPS-REDO-1111，X338；參考圖 l118_ref/ext_dian）：使用者的規格「紅黃老式招牌；六張小桌、濃湯與紅茶自取」。
    白磁磚牆、紅木色小桌配紅色圓凳（兩排各三張）、最裡面左邊櫃台＋出菜口和不鏽鋼廚房、右邊「濃湯・紅茶自助區」（湯桶、茶桶、碗和杯子）、日光燈"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; c.S['kpass'] = True; RED = '#c4201a'
    shell(c); kitchen(c, X0 + 0.2, 1.7, depth=2.2, win=(1.05, 2.55))   # 第 2 版：開放式廚房（室內參考圖：不鏽鋼廚房、大抽油煙罩、鐵板煎台、冰箱一覽無遺）
    kitchen_rich(c, hood=(-1.7, 1.5), griddle=(-1.3, 0.5), fridge=(X0 + 0.15, X0 + 0.95), plates=1.0)
    c.spawn['z'] = round(Z1 - 1.35, 3)
    cz0, cz1 = Z0 + 1.0, Z0 + 1.55
    counter(c, X0, 0.55, cz0, cz1, h=1.05, top='steel', front=RED, block=False); register(c, -0.2, 1.05, (cz0 + cz1) / 2, face='+z')
    for k in range(3): clathe(c.vc, [(0.0, 0.0), (0.03, 0.0), (0.032, 0.12), (0.014, 0.16), (0.0, 0.16)], -1.5 + k * 0.14, 1.05, cz1 - 0.14, ['#3a2416', '#a8241a', '#3a2416'][k], seg=8)   # 黑胡椒醬、番茄醬、蘑菇醬
    c.vc.cbox(0.62, 0.66, 0.0, 1.0, cz0, cz1, '#8a8f93'); c.steel.box(0.55, 0.9, 0.95, 0.98, cz0, cz1)                                   # 櫃台右端的掀板（關著）
    c.block(X0, 0.92, Z0, cz1 + 0.02, 'counter')
    c.counter = dict(x0=X0, x1=0.55, z0=cz0, z1=cz1, h=1.05)
    c.clerk = dict(x=-0.6, z=round(Z0 + 0.55, 3), yaw=0.0, note='櫃台後面（出菜口前），面向客人；老闆娘（AA_772：原滇香小館的老闆娘，同一個人）')
    c.order = dict(x=-0.6, z=round(cz1 + 0.55, 3), r=0.8, label='點餐（' + c.T['name'] + '）', note='櫃台前面；shop118:dian')
    # 第 3 版（BB_341 第 2 條：遊戲裡自助台看不出來，只看到牆上一張黃牌子）：自助台搬到西牆邊、黃牌子正下方（室內參考圖：左牆邊的不鏽鋼自助台）——
    #   沿牆 1.56 m 長：玉米濃湯的大保溫桶、紅茶桶、一疊湯碗、紙杯、湯匙籃；下層櫃子；上方層架的碗。原本靠玻璃的位置改放一盆發財樹
    sx0, sx1, sz0, sz1 = X0, X0 + 0.66, 1.62, 3.18
    c.steel.box(sx0, sx1, 0.86, 0.9, sz0, sz1); c.vc.crbox(sx0, sx1 - 0.03, 0.0, 0.86, sz0 + 0.02, sz1 - 0.02, '#c9ccce', r=0.006, seg=1); c.vc.cbox(sx1 - 0.032, sx1 - 0.026, 0.1, 0.8, sz0 + 0.5, sz0 + 0.51, '#8a8f93'); c.vc.cbox(sx1 - 0.032, sx1 - 0.026, 0.1, 0.8, sz0 + 1.03, sz0 + 1.04, '#8a8f93')
    kx = X0 + 0.33
    clathe(c.vm, [(0.0, 0.0), (0.23, 0.0), (0.23, 0.36), (0.22, 0.37), (0.0, 0.37)], kx, 0.9, 2.05, '#b9bec2', seg=18); clathe(c.vc, [(0.0, 0.0), (0.23, 0.0), (0.24, 0.03), (0.07, 0.07), (0.03, 0.1), (0.0, 0.1)], kx, 1.27, 2.05, '#2b2b2b', seg=18)   # 玉米濃湯的保溫桶＋蓋子
    c.vc.cbox(sx1 - 0.105, sx1 - 0.1, 0.98, 1.16, 1.9, 2.2, '#f2c21a')                                                                      # 桶子上的黃色品名牌
    ccyl(c.vc, (kx, 0.9, 2.62), (kx, 1.42, 2.62), 0.17, '#6a3420', seg=16); ccyl(c.vm, (kx, 1.42, 2.62), (kx, 1.47, 2.62), 0.18, '#b9bec2', seg=16); ccyl(c.vm, (kx, 0.9, 2.62), (kx, 0.96, 2.62), 0.19, '#b9bec2', seg=16)
    c.vc.cbox(kx + 0.17, kx + 0.26, 1.0, 1.04, 2.6, 2.64, '#222222'); c.vc.cbox(sx1 - 0.105, sx1 - 0.1, 1.1, 1.26, 2.48, 2.76, '#f2c21a')   # 紅茶桶的龍頭、品名牌
    cups_stack(c, kx + 0.1, 0.9, 3.0, 7); cups_stack(c, kx - 0.08, 0.9, 3.02, 5)
    for k in range(6): clathe(c.vc, [(0.0, 0.0), (0.055, 0.0), (0.085, 0.065), (0.08, 0.065), (0.0, 0.006)], kx, 0.9 + k * 0.024, 1.75, '#f4f1ea', seg=10)   # 一疊湯碗
    c.block(X0, X0 + 0.8, 1.6, 3.2, 'soup')
    c.look('soup', -1.65, 2.4, 1.0, '濃湯和紅茶的桶子', note='（濃湯和紅茶自己裝。濃湯那一桶前面，永遠有人在排。）', dev='AA_772 look_lines.dian；使用者的規格「濃湯與紅茶自取」')
    plant(c, X0 + 0.45, Z1 - 0.45, 1.15)
    # 東牆靠門口：餐具台（BB_341：填右半邊）——不鏽鋼矮櫃＋筷筒、湯匙盒、醬料瓶、面紙
    ex0, ez0, ez1 = X1 - 0.4, 2.82, 3.58
    c.steel.box(ex0, X1, 0.86, 0.9, ez0, ez1); c.vc.crbox(ex0 + 0.02, X1, 0.0, 0.86, ez0 + 0.02, ez1 - 0.02, '#c9ccce', r=0.006, seg=1)
    for k in range(3): ccyl(c.vm, (X1 - 0.2, 0.9, ez0 + 0.14 + k * 0.17), (X1 - 0.2, 1.04, ez0 + 0.14 + k * 0.17), 0.05, '#c9ced2', seg=10)
    c.vc.crbox(X1 - 0.3, X1 - 0.08, 0.9, 0.98, ez1 - 0.22, ez1 - 0.06, '#d8b888', r=0.008, seg=1); c.block(ex0, X1, 2.8, 3.6, 'cutlery')
    # （右後方原本想放飲料冰箱：冰箱和第一張桌子之間會留一個 1 m 的口袋，10 fps 時人會卡在口袋口——l118_shops_notrap_1111_unit 抓到的；參考圖的冰箱在廚房裡，這裡不放）
    # 六張小桌（兩排各三張，中間走道）：深紅木色桌面、深色靠背椅（室內參考圖）
    # 西排三張、東排前兩張：桌子兩頭各一張椅子（x ±1.85，走近點在走道那一側）；東排靠門口那一張靠牆、一個座位。
    #   東排原本也是兩頭各一張：最裡面那張桌子和櫃台右端之間留了 0.5 m 的縫、後面是一個口袋，10 fps 時人卡在桌角（l118_shops_notrap_1111_unit 抓到的）
    #   → 櫃台那一條線一路擋到東牆（右邊是飲料冰箱和掀板，客人進不去）：口袋沒有了
    # 同一排相鄰兩桌背對背的椅子要隔 0.4 m 以上（桌距 1.8 m）：遊戲把 0.4 m 內的座位當成同一個位子有人（shop_diners_unit 抓到的：桌距 1.6 m 時隔壁桌有客人，留給玩家的兩人座就算被佔）
    # 第 3 版：四人桌（每邊兩張椅子，參考圖的密度）；桌寬 1.0 m 的阻擋剛好三格導航格
    for (tx, tz) in ((-1.85, -1.4), (-1.85, 0.4)):   # 西排兩張（第三張的位置給自助台）
        table(c, tx, tz, 1.0, 0.72, top='wood'); table_seats(c, tx, tz, 1.0, 0.72, ('-z', '+z'), style='wood', col='#3a2622', n_per=2, ap_side=True); table_set(c, tx + 0.36, tz, 'tw'); steak_plate(c, tx - 0.2, tz - 0.08); steak_plate(c, tx + 0.08, tz + 0.1)
    for (tx, tz) in ((1.85, -1.4), (1.85, 0.4)):   # 東排前兩張也是四人桌
        table(c, tx, tz, 1.0, 0.72, top='wood'); table_seats(c, tx, tz, 1.0, 0.72, ('-z', '+z'), style='wood', col='#3a2622', n_per=2, ap_side=True); table_set(c, tx + 0.36, tz, 'tw'); steak_plate(c, tx - 0.2, tz - 0.08); steak_plate(c, tx + 0.08, tz + 0.1)
    for q in c.seats:   # 四人桌靠牆的那兩個座位：走近點改到走道那一側（原本往牆那邊 0.5 m，站不住）
        if abs(q['x']) > 2.0 and q.get('table', [0])[0] != 2.36: q['ap'] = [round(1.05 if q['x'] > 0 else -1.05, 3), q['z']]
    table(c, 2.36, 1.9, 0.8, 0.72, top='wood'); table_seats(c, 2.36, 1.9, 0.8, 0.72, ('-x',), style='wood', col='#3a2622'); table_set(c, 2.36, 2.1, 'tw')   # 第六張靠東牆、一個座位（靠門口：兩頭放椅子會貼到進門的位置）
    drink_fridge(c, 1.85, 2.65, Z0, face='+z'); c.block(0.9, X1, Z0, cz1 + 0.02, 'counter_east')
    c.vc.cbox(0.92, X1, 0.0, 0.95, cz1 - 0.04, cz1, '#8a8f93'); c.steel.box(0.9, X1, 0.95, 0.98, cz0 + 0.25, cz1)                                  # 櫃台往東延伸的矮門（關著）
    troffers(c, [(-1.6, -1.0, 'z'), (-1.6, 1.4, 'z'), (1.6, -1.0, 'z'), (1.6, 1.4, 'z'), (0.0, 3.2, 'x'), (-1.0, Z0 + 1.0, 'x')])
    frame_board(c, 'W', -1.1, 0.95, 1.62, 2.39, '#7a100c'); printed(c, 'W', -1.1, 0.95, 1.62, 2.39, 'MENU', inset=0.014)   # 第 2 版：後牆開成開放式廚房，價目表搬到西牆（店名牌下面）
    printed(c, 'W', -1.25, 1.25, 2.55, 3.0, 'NAME'); c.vc.cbox(X0 + 0.012, X0 + 0.02, 1.52, 1.95, 1.75, 3.05, '#f2c21a'); printed(c, 'W', 1.82, 2.98, 1.58, 1.89, 'P2', inset=0.024)   # 自助台正上方的黃牌子（濃湯・紅茶 自取）
    for z0_ in (-2.1, -0.8, 0.5): big_photo(c, 'E', z0_, 1.05, 1.42, '#7a100c')   # 東牆：三張大的鐵板牛排圖（BB_341 第 2 條；參考圖右牆）
    dd = c.door; printed(c, 'S', dd['x'] - 1.0, dd['x'] - 0.55, 1.3, 1.5, 'HOURS', inset=0.03)
    wall_fan(c, X0, 2.45, 2.0, '+x'); ac_unit(c, X1, 2.55, -0.6, '-x', fade=True)
    # 第 3 版：天花板格線、自助台上方的層架（碗和杯子）、掛著的暗紅圍裙、東牆的壁扇和第三張海報、盆栽
    ceil_grid(c); wall_shelf(c, 'W', 1.7, 3.1, 2.1, items='bowls'); hooks(c, 'W', -2.0, 1.75, ('#7a2a26', '#7a2a26', '#f4f1ea'), ln=0.6)
    wall_fan(c, X1, 2.5, 2.4, '-x'); small_plant(c, X0 + 0.14, 2.1, 3.25, 0.2, seed=3, vine=0.5, out=(1.0, 0.0))
    c.cam = 4.2



def bento_stack(c, x, z, y, n, w, d):
    """CC0 的店（LAWWW2-C 驗收重點：同一種東西不同大小、顏色、要有包裝）：一疊便當盒——白色塑膠盒和牛皮紙盒輪著疊（一疊一種），
    每一個高度、位置差一點；白盒最上面那個綁一條黃色紙腰帶。顏色 #f6f4ee＝白盒（box_w）、#c9a46a＝牛皮紙盒（box_k），兩種都不烘光照（一疊疊貼在一起，烘出來是黑帶）"""
    rr = c.rng; kraft = rr.random() < 0.45; col = '#c9a46a' if kraft else '#f6f4ee'
    if kraft: w, d = w * 0.82, d * 0.9
    yy = y
    for k in range(n):
        h = rr.uniform(0.04, 0.052) if not kraft else rr.uniform(0.05, 0.06); jx, jz = _jit(c)
        c.vc.crbox(x - w / 2 + jx, x + w / 2 + jx, yy, yy + h - 0.004, z - d / 2 + jz, z + d / 2 + jz, col, r=0.004, seg=1)
        if k == n - 1 and not kraft:
            c.vc.cbox(x - 0.035 + jx, x + 0.035 + jx, yy - 0.002, yy + h - 0.002, z - d / 2 - 0.002 + jz, z + d / 2 + 0.002 + jz, '#f2c21a')   # 紙腰帶
        yy += h


def _jit(c, a=0.014):
    """CC0 的店（D159：同樣大小的東西不要疊得完全對齊）：一疊便當盒每一個錯開一點；其他店照舊 0"""
    return (c.rng.uniform(-a, a), c.rng.uniform(-a, a)) if getattr(c, 'ph', None) else (0.0, 0.0)


def build_self(c):
    """水上便當（L118-SHOPS-REDO-1111，X338；參考圖 l118_ref/ext_self、int_self）：使用者的規格「黃色大招牌；外帶為主，設配菜櫃及少量內用座位」。
    西邊沿牆一整排不鏽鋼配菜櫃（玻璃罩、保溫燈下的炸雞腿雞排排骨、下面一格一格的配菜），老闆站在櫃子後面；最前面一個大飯鍋（白飯自助）；
    中間後面是取餐檯（成疊的便當盒）；東牆一條不鏽鋼窄吧台配三張圓凳、靠門口一張兩人小桌（少量內用）；最裡面出菜口和廚房；白牆、淺灰地磚、日光燈"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; c.S['kpass'] = True   # 後牆由 kitchen() 畫（有出菜口）；shell() 不要再畫一層（疊在一起會閃）
    shell(c); kitchen(c, -0.6, 2.2, depth=2.2, win=(1.05, 2.5))   # 第 2 版：開放式廚房（室內參考圖）
    kitchen_rich(c, hood=(-0.4, 1.5), fridge=(1.55, 2.15), rack=(-1.45, -0.55))
    tr_ = c.wg('N', 'trim', c.M['vc'], cm=True); tr_.cbox(2.4, 3.05, 1.2, 2.1, Z0 + 0.0, Z0 + 0.012, '#e8b81e'); tr_.cbox(2.36, 3.09, 2.1, 2.14, Z0, Z0 + 0.03, '#6b4a30')   # 右邊的黃色「廚房」門簾（室內參考圖）
    # 配菜櫃：沿 z，客人在東邊（+x）；櫃子後面到西牆是老闆站的地方
    sx0, sx1, sz0, sz1 = -2.3, -1.5, -3.2, 1.0
    steam_table(c, sx0, sx1, sz0, sz1, face='+x', cols=2)
    c.block(X0, sx1 + 0.03, Z0, sz1 + 0.03, 'sides')
    if not getattr(c, 'foodm', None): clathe(c.vm, [(0.0, 0.0), (0.26, 0.0), (0.27, 0.34), (0.25, 0.36), (0.0, 0.36)], -1.9, 0.0, 1.45, '#b9bec2', seg=18); clathe(c.vm, [(0.0, 0.0), (0.27, 0.0), (0.24, 0.05), (0.05, 0.09), (0.0, 0.09)], -1.9, 0.72, 1.45, '#c9ced2', seg=18)   # 大飯鍋（放在矮台上）
    if getattr(c, 'foodm', None): rice_pot_cc0(c, -1.9, 0.36, 1.45)   # CC0（LAWWW2-C 驗收 ②）：圓的白飯保溫桶（32 邊）＋蓋子＋提把
    else: c.vc.crbox(-2.25, -1.55, 0.0, 0.36, 1.12, 1.78, '#c9ccce', r=0.006, seg=1); clathe(c.vm, [(0.0, 0.0), (0.26, 0.0), (0.27, 0.34), (0.25, 0.36), (0.0, 0.36)], -1.9, 0.36, 1.45, '#b9bec2', seg=18)
    c.vc.cbox(-1.72, -1.708, 0.42, 0.58, 1.3, 1.6, '#f2c21a'); c.block(X0, -1.5, 1.03, 1.85, 'rice')
    c.counter = dict(x0=sx0, x1=sx1, z0=sz0, z1=sz1, h=0.9)
    c.clerk = dict(x=-2.8, z=-1.0, yaw=round(PI / 2, 4), note='配菜櫃後面（靠西牆），面向東邊的客人；老闆（AA_772：新，五十多歲、圍裙，站在配菜櫃後面）')
    c.order = dict(x=-0.85, z=-1.0, r=0.8, label='點餐（' + c.T['name'] + '）', note='配菜櫃前面；shop118:self')
    c.look('sides', -0.9, 0.2, 0.9, '配菜櫃', note='（配菜櫃的玻璃起了霧。滷蛋那一格只剩兩顆。）', dev='AA_772 look_lines.self；使用者的規格「設配菜櫃」')
    # 取餐檯：中間後面（出菜口前），成疊的便當盒、塑膠袋
    counter(c, -0.5, 1.9, Z0 + 0.95, Z0 + 1.5, h=0.95, top='steel', front='#c9ccce', why='pickup'); c.block(-1.5, X1, Z0, Z0 + 0.98, 'pickup_back')
    for (bx, n_) in ((0.0, 7), (0.45, 5), (0.9, 6)):
        if getattr(c, 'ph', None): bento_stack(c, bx, Z0 + 1.225, 0.95, n_, 0.34, 0.35); continue
        for k in range(n_): jx, jz = _jit(c); c.vc.crbox(bx - 0.17 + jx, bx + 0.17 + jx, 0.95 + k * 0.045, 0.99 + k * 0.045, Z0 + 1.05 + jz, Z0 + 1.4 + jz, '#f6f4ee', r=0.004, seg=1)
    c.vc.cbox(1.2, 1.8, 0.4, 0.75, Z0 + 1.5, Z0 + 1.508, '#f2c21a'); uvquad(c.prt, [(1.23, 0.45, Z0 + 1.51), (1.77, 0.45, Z0 + 1.51), (1.77, 0.7, Z0 + 1.51), (1.23, 0.7, Z0 + 1.51)], TX.uv(TX.REG, 'P2'))   # 取餐檯正面的黃牌（內用・外帶）
    # 配菜櫃上層：保溫燈下的炸雞腿、雞排、排骨（室內參考圖最顯眼的東西）——一層不鏽鋼網架、三堆炸物、黃色品名牌、三盞保溫燈
    c.steel.box(sx0 + 0.08, sx1 - 0.3, 1.1, 1.115, sz0 + 0.15, sz1 - 0.15)
    for k, (zc_, col) in enumerate(((-2.5, '#c8842a'), (-1.2, '#d8a03a'), (0.1, '#b06a1e'))):
        if getattr(c, 'foodm', None): fried_pile(c, ('leg', 'cutlet', 'chop')[k], sx0 + 0.27, 1.115, zc_)   # CC0：炸雞腿（一頭粗一頭細＋骨頭）、雞排、排骨（扁長），貼菜色貼圖集
        else:
            for j in range(7): csph(c.vc, (sx0 + 0.2 + (j % 2) * 0.16, 1.16 + (j // 4) * 0.05, zc_ - 0.3 + (j % 4) * 0.2), 0.085, col if j % 3 else '#e0a848', seg=8, rings=5, sy=0.65)
        c.vc.cbox(sx1 - 0.3, sx1 - 0.292, 1.115, 1.2, zc_ - 0.14, zc_ + 0.14, '#f2c21a'); ccyl(c.vm, (sx0 + 0.3, 1.5, zc_), (sx0 + 0.3, 1.62, zc_), 0.09, '#b9bec2', seg=12, r2=0.03); c.warm.sphere((sx0 + 0.3, 1.5, zc_), 0.04, seg=8, rings=4)
    wall_shelf(c, 'W', 1.95, 3.6, 1.55, items='bowls')
    # 第 3 版：店中間的不鏽鋼取餐檯（參考圖：成疊的便當盒、塑膠袋、「取餐／外帶」黃牌；阻擋剛好 3×2 格導航格）、東牆的雙門冰箱、天花板格線、盆栽
    ix0, ix1, iz0, iz1 = 0.33, 1.47, -0.87, -0.13
    c.steel.box(ix0, ix1, 0.86, 0.9, iz0, iz1); c.vc.crbox(ix0 + 0.03, ix1 - 0.03, 0.0, 0.86, iz0 + 0.03, iz1 - 0.03, '#c9ccce', r=0.006, seg=1); c.steel.box(ix0 + 0.05, ix1 - 0.05, 0.3, 0.32, iz0 + 0.05, iz1 - 0.05)
    for (bx, bz, n_) in ((0.55, -0.6, 8), (0.55, -0.32, 6), (0.95, -0.55, 7), (1.3, -0.3, 5)):
        if getattr(c, 'ph', None): bento_stack(c, bx, bz, 0.9, n_, 0.32, 0.24); continue
        for k in range(n_): jx, jz = _jit(c); c.vc.crbox(bx - 0.16 + jx, bx + 0.16 + jx, 0.9 + k * 0.045, 0.94 + k * 0.045, bz - 0.12 + jz, bz + 0.12 + jz, '#f6f4ee', r=0.004, seg=1)
    for bx in (1.2, 1.36): csph(c.vc, (bx, 0.99, -0.68), 0.085, '#f4f1ea', seg=8, rings=5, sy=1.1)                                          # 兩袋裝好的塑膠袋
    c.vc.cbox(ix0 + 0.15, ix1 - 0.15, 0.4, 0.78, iz1, iz1 + 0.008, '#f2c21a'); c.block(ix0, ix1, iz0, iz1, 'pickup_island')
    steel_cabinet_e(c, -2.87, -1.66); c.block(X1 - 0.6, X1, -2.9, -1.6, 'fridge_e')
    ceil_grid(c); small_plant(c, X0 + 0.14, 1.55, 2.2, 0.2, seed=11, vine=0.55, out=(1.0, 0.0)); small_plant(c, X1 - 0.2, 0.75, 0.9, 0.17, seed=13); small_plant(c, X1 - 0.16, 1.95, -2.2, 0.2, seed=17, vine=0.4, out=(-1.0, 0.0))
    frame_board(c, 'E', -1.5, 0.9, 1.5, 2.4, '#b8860a'); printed(c, 'E', -1.5, 0.9, 1.5, 2.4, 'MENU', inset=0.014)   # 吧台上方的牆：價目長條（BB_341 第 3 條；品名價錢照文字規格）
    big_photo(c, 'E', 1.2, 1.0, 1.45, '#b8860a'); wall_art(c, 'E', 2.55, 3.15, 1.5, 2.0, 'photo'); wall_clock(c, 'E', 3.6, 2.4); wall_shelf(c, 'W', -3.0, -1.9, 1.75, items='bowls')   # 一張大的炸雞腿飯、老照片、時鐘；配菜櫃後面牆上的碗架
    for z_ in (-1.0, 0.0): ccyl(c.vm, (X1 - 0.18, 0.75, z_), (X1 - 0.18, 0.9, z_), 0.04, '#c9ced2', seg=10); c.vc.crbox(X1 - 0.3, X1 - 0.08, 0.75, 0.83, z_ + 0.12, z_ + 0.26, '#d8b888', r=0.008, seg=1)   # 吧台上的筷筒、面紙盒
    # 少量內用：東牆的不鏽鋼窄吧台＋三張圓凳、靠門口一張兩人小桌
    c.steel.box(X1 - 0.38, X1, 0.72, 0.75, -1.6, 1.8); [c.vm.cbox(X1 - 0.36, X1 - 0.33, 0.0, 0.72, zz, zz + 0.05, '#9aa0a4') for zz in (-1.55, 0.1, 1.7)]   # 第 3 版（BB_341 第 3 條）：吧台拉長到 3.4 m、四張圓凳
    c.block(X1 - 0.4, X1, -1.63, 1.83, 'ledge')
    for z_ in (-1.1, -0.3, 0.5, 1.3): chair(c, X1 - 0.7, z_, PI / 2, 'steelstool'); c.seat(X1 - 0.7, z_, PI / 2, (X1 - 0.19, z_), 'eat', ap=(X1 - 1.25, z_))
    table(c, 2.0, 2.6, 0.8, 0.7, top='steel'); table_seats(c, 2.0, 2.6, 0.8, 0.7, ('-x', '+x'), style='steelstool', ap_side=False); table_set(c, 2.0, 2.75, 'tw')
    # 第 3 版（BB_341：白地板佔畫面一半）：地上的東西——配菜櫃前面一條黃黑的排隊線、兩個腳印貼紙的位置、門口的紅色刮泥墊（都是貼地的薄片，不擋路）
    for k in range(9): c.vc.cbox(-1.22, -1.14, 0.001, 0.006, -3.1 + k * 0.5, -3.1 + k * 0.5 + 0.5, '#e8b616' if k % 2 == 0 else '#2a2a2a')
    for z_ in (-0.4, 0.7): c.vc.cbox(-0.98, -0.72, 0.001, 0.005, z_ - 0.13, z_ + 0.13, '#e8b616'); c.vc.cbox(-0.93, -0.77, 0.005, 0.007, z_ - 0.08, z_ + 0.08, '#2a2a2a')
    dx_ = c.door['x']; c.vc.cbox(dx_ - 0.55, dx_ + 0.55, 0.001, 0.012, c.Z1 - 0.95, c.Z1 - 0.2, '#8a1f1a'); c.vc.cbox(dx_ - 0.47, dx_ + 0.47, 0.012, 0.014, c.Z1 - 0.87, c.Z1 - 0.28, '#a52a22')
    troffers(c, [(-1.8, -2.1, 'z'), (-1.8, 0.3, 'z'), (-1.8, 2.7, 'z'), (0.6, -2.1, 'z'), (0.6, 2.7, 'z'), (2.4, -2.1, 'z'), (2.4, 0.3, 'z'), (2.4, 2.7, 'z')])
    hz = Z0 + 1.6; c.vc.cbox(-0.05, 1.75, 2.24, 2.96, hz - 0.025, hz, '#e8b81e')                                                           # 第 2 版：價目表吊在取餐檯上方的黃框牌上（兩組室內參考圖；品名價錢照文字規格）
    uvquad(c.prt, [(0.0, 2.28, hz + 0.002), (1.7, 2.28, hz + 0.002), (1.7, 2.92, hz + 0.002), (0.0, 2.92, hz + 0.002)], TX.uv(TX.REG, 'MENU'))
    for hx in (0.15, 1.55): ccyl(c.vm, (hx, 2.96, hz - 0.012), (hx, H, hz - 0.012), 0.006, '#8a8f93', seg=4)
    printed(c, 'W', -1.6, 1.0, 2.2, 2.68, 'NAME')                                                                                         # 西牆配菜櫃上方：店名
    for z0_ in (-1.45, -0.3): big_photo(c, 'W', z0_, 1.0, 1.2, '#b8860a')   # 西牆（配菜櫃後面）：兩張大的炸雞腿飯
    dd = c.door; printed(c, 'S', dd['x'] + 0.6, dd['x'] + 1.05, 1.3, 1.5, 'HOURS', inset=0.03); printed(c, 'N', 1.3, 1.75, 0.96, 1.19, 'P2', inset=-1.49) if False else None
    wall_fan(c, X0, 2.5, 1.9, '+x'); ac_unit(c, X1, 2.55, 2.0, '-x', fade=True); plant(c, X1 - 0.45, Z1 - 0.5, 1.1)
    c.cam = 4.2


# ---------- 第 2 版（LAWWW 11-11 05:56：四間比參考圖空——牆面大片空白、廚房只有一條櫃台、招牌物件不明顯）----------
def kitchen_rich(c, hood=None, griddle=None, fridge=None, rack=None, plates=None, dough=False):
    """開放式廚房裡的東西（kitchen() 之後呼叫；都算 N 那一組，鏡頭在後面時一起淡出）：
    hood＝(x0, x1) 大抽油煙罩（下大上小兩段＋排煙管＋罩子下面一排暖燈）；griddle＝(x0, x1) 鐵板煎台（上面幾塊牛排、一把鏟子）；
    fridge＝(x0, x1) 雙門不鏽鋼冰箱；rack＝(x0, x1) 不鏽鋼層架（鍋子、籃子、紙箱；dough＝一盤盤醒著的麵團）；plates＝x 一疊鐵板盤"""
    Z0 = c.Z0; zk = c.kz; kt = c.wg('N', 'kitchen', c.M['vc'], cm=True); ks = c.wg('N', 'ksteel', c.M['steel']); kl = c.wg('N', 'klamp', c.M['warm'])
    if hood:
        x0, x1 = hood; ks.box(x0, x1, 1.92, 2.14, zk, zk + 1.05); ks.box(x0 + 0.25, x1 - 0.25, 2.14, 2.62, zk, zk + 0.8); kt.cbox(x0, x1, 1.9, 1.92, zk, zk + 1.06, '#8a8f93')
        mx = (x0 + x1) / 2; ks.box(mx - 0.2, mx + 0.2, 2.62, H, zk + 0.1, zk + 0.5)
        n = max(2, int((x1 - x0) / 0.8))
        for k in range(n): lx = x0 + (k + 0.5) * (x1 - x0) / n; kl.box(lx - 0.12, lx + 0.12, 1.895, 1.9, zk + 0.45, zk + 0.75)
    if griddle:
        x0, x1 = griddle; kt.cbox(x0, x1, 0.9, 0.95, zk + 0.06, zk + 0.62, '#1c1c1c'); kt.cbox(x0 - 0.02, x1 + 0.02, 0.9, 1.02, zk + 0.02, zk + 0.06, '#8a8f93')
        n = max(2, int((x1 - x0) / 0.3))
        for k in range(n): csph(kt, (x0 + 0.16 + k * (x1 - x0 - 0.32) / max(1, n - 1), 0.965, zk + 0.3 + (k % 2) * 0.12), 0.085, ('#5a2c18', '#6a3a1e', '#c88a3a')[k % 3], seg=10, rings=4, sy=0.3)
        kt.cbox(x1 - 0.12, x1 - 0.04, 0.95, 0.96, zk + 0.2, zk + 0.5, '#c9ced2')
    if fridge:
        x0, x1 = fridge; ks.box(x0, x1, 0.0, 1.98, zk + 0.02, zk + 0.72); mx = (x0 + x1) / 2
        kt.cbox(mx - 0.006, mx + 0.006, 0.12, 1.9, zk + 0.72, zk + 0.726, '#5f6468'); kt.cbox(x0 + 0.03, x1 - 0.03, 1.0, 1.012, zk + 0.72, zk + 0.726, '#5f6468')
        for hx in (mx - 0.07, mx + 0.05): kt.cbox(hx, hx + 0.02, 1.15, 1.55, zk + 0.72, zk + 0.76, '#3a3d40'); kt.cbox(hx, hx + 0.02, 0.45, 0.85, zk + 0.72, zk + 0.76, '#3a3d40')
    if rack:
        x0, x1 = rack
        for xx in (x0, x1 - 0.03): 
            for zz in (zk + 0.05, zk + 0.5): kt.cbox(xx, xx + 0.03, 0.0, 1.9, zz, zz + 0.03, '#b9bec2')
        for j, yy in enumerate((0.35, 0.85, 1.3, 1.75)):
            ks.box(x0, x1, yy, yy + 0.02, zk + 0.05, zk + 0.53); n = max(2, int((x1 - x0) / 0.36))
            for k in range(n):
                cx = x0 + 0.2 + k * (x1 - x0 - 0.4) / max(1, n - 1)
                if dough: kt.cbox(cx - 0.16, cx + 0.16, yy + 0.02, yy + 0.04, zk + 0.1, zk + 0.48, '#c9ced2'); csph(kt, (cx - 0.07, yy + 0.08, zk + 0.29), 0.075, '#f1e6cc', seg=8, rings=4, sy=0.6); csph(kt, (cx + 0.08, yy + 0.08, zk + 0.29), 0.075, '#f1e6cc', seg=8, rings=4, sy=0.6)
                elif (j + k) % 3 == 0: clathe(kt, [(0.0, 0.0), (0.13, 0.0), (0.13, 0.2), (0.14, 0.21), (0.0, 0.21)], cx, yy + 0.02, zk + 0.29, '#c4c8cb', seg=14)
                elif (j + k) % 3 == 1: kt.cbox(cx - 0.15, cx + 0.15, yy + 0.02, yy + 0.2, zk + 0.12, zk + 0.46, ('#2a5fb8', '#c8281c', '#e0b24a')[(j + k) % 3 if False else (j * 2 + k) % 3])
                else: kt.cbox(cx - 0.14, cx + 0.14, yy + 0.02, yy + 0.24, zk + 0.12, zk + 0.44, '#c8a878')
    if plates is not None:
        for k in range(9): ccyl(kt, (plates, 0.9 + k * 0.022, zk + 0.3), (plates, 0.918 + k * 0.022, zk + 0.3), 0.13, '#3a2416' if k % 2 else '#1c1c1c', seg=14)


def steak_plate(c, x, z):
    """桌上的鐵板牛排（118牛排，室內參考圖每桌一份）：木墊板、黑鐵板、牛排、荷包蛋、玉米、一小撮麵"""
    v = c.vc; v.crbox(x - 0.18, x + 0.18, 0.74, 0.756, z - 0.12, z + 0.12, '#7a4a28', r=0.01, seg=1); csph(v, (x, 0.764, z), 0.15, '#1e1c1c', seg=14, rings=4, sy=0.1)
    csph(v, (x - 0.035, 0.782, z + 0.01), 0.08, '#5a2c18', seg=10, rings=5, sy=0.32); csph(v, (x + 0.075, 0.776, z - 0.045), 0.04, '#f6f2e6', seg=8, rings=4, sy=0.2); csph(v, (x + 0.075, 0.784, z - 0.045), 0.016, '#f0a81e', seg=6, rings=4, sy=0.6)
    csph(v, (x + 0.07, 0.778, z + 0.055), 0.032, '#f2cf3a', seg=6, rings=4, sy=0.45); csph(v, (x - 0.02, 0.776, z - 0.085), 0.04, '#e8cf8a', seg=6, rings=4, sy=0.3)


def banchan(c, x, z):
    """桌上的四小碟小菜＋兩個不鏽鋼杯（辛亥韓食，室內參考圖）"""
    for k, col in enumerate(('#c8281c', '#e8d8a0', '#3f7a2a', '#f4f0e0')):
        zz = z - 0.2 + k * 0.13; clathe(c.vm, [(0.0, 0.0), (0.04, 0.0), (0.052, 0.024), (0.048, 0.026), (0.0, 0.008)], x, 0.74, zz, '#c9ced2', seg=10); csph(c.vc, (x, 0.762, zz), 0.034, col, seg=8, rings=4, sy=0.35)
    for dz in (-0.2, 0.2): ccyl(c.vm, (x - 0.22, 0.74, z + dz), (x - 0.22, 0.83, z + dz), 0.033, '#c9ced2', seg=10, r2=0.038)


def wall_art(c, side, a0, a1, y0, y1, kind='photo', frame='#3a2a1e'):
    """牆上的畫（frame_board＋裡面的畫面，頂點色）：photo＝黑白老照片（灰階的街景色塊）、ink＝水墨山水、cloth＝深紅掛布＋梅花（沒有框）"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; m = c.wg(side, 'trim', c.M['vc'], cm=True); rr = c.rng
    if kind != 'cloth': frame_board(c, side, a0, a1, y0, y1, frame)
    d = 0.016
    def P(a, y):   # 沿牆 a、高 y → 世界座標（畫面比牆面凸 d）
        return {'N': (a, y, Z0 + d), 'S': (a, y, Z1 - d), 'W': (X0 + d, y, a), 'E': (X1 - d, y, a)}[side]
    def quad(a_, b_, ya, yb, col):
        pts = [P(a_, ya), P(b_, ya), P(b_, yb), P(a_, yb)]
        if side in ('S', 'W'): pts = pts[::-1]
        m.poly(pts, col)
    if kind == 'cloth':
        quad(a0, a1, y0, y1, '#7a1418'); m.cbox(*((min(P(a0, 0)[0], P(a1, 0)[0]) - 0.0, max(P(a0, 0)[0], P(a1, 0)[0]) + 0.0)), y1, y1 + 0.03, *((min(P(a0, 0)[2], P(a1, 0)[2]) - 0.02, max(P(a0, 0)[2], P(a1, 0)[2]) + 0.02)), '#3a2416') if side in ('W', 'E') else None
        d = 0.02
        for _ in range(14): a_ = rr.uniform(a0 + 0.06, a1 - 0.06); y_ = rr.uniform(y0 + 0.1, y1 - 0.08); r_ = rr.uniform(0.02, 0.035); quad(a_ - r_, a_ + r_, y_ - r_, y_ + r_, rr.choice(('#f2c8cf', '#f6dfe2', '#e8a8b4')))
        return
    quad(a0, a1, y0, y1, '#ece5d2' if kind == 'landscape' else '#e9e2d0' if kind == 'ink' else '#cfcac0'); d = 0.019; w = a1 - a0; h = y1 - y0
    if kind == 'landscape':   # 第 3 版（BB_341 第 4 條：山水畫）：三層山（遠的淡、近的濃）、山腰的雲霧、近處的坡和幾棵松、右下角的紅印、左上角一行題字；自己的亂數，不動 c.rng
        r2 = random.Random(118); N = 30
        def ridge(peaks, lo, col, dd):
            nonlocal d
            d = dd; ys = []
            for i in range(N + 1):
                t = i / N; yv = lo
                for (pc, ph, pw) in peaks: yv = max(yv, ph * max(0.0, 1.0 - abs(t - pc) / pw) ** 1.35)
                ys.append(y0 + 0.02 + h * min(0.93, yv + r2.uniform(-0.012, 0.012)))
            for i in range(N):
                aa, ab = a0 + 0.012 + (w - 0.024) * i / N, a0 + 0.012 + (w - 0.024) * (i + 1) / N; pts = [P(aa, y0 + 0.02), P(ab, y0 + 0.02), P(ab, ys[i + 1]), P(aa, ys[i])]
                m.poly(pts[::-1] if side in ('S', 'W') else pts, col)
        ridge([(0.2, 0.8, 0.2), (0.42, 0.62, 0.16), (0.72, 0.88, 0.22), (0.93, 0.5, 0.14)], 0.3, '#cfcfc6', 0.0190)
        d = 0.0193; quad(a0 + 0.012, a1 - 0.012, y0 + h * 0.3, y0 + h * 0.4, '#e6e0cf')                                              # 山腰的雲霧
        ridge([(0.08, 0.5, 0.2), (0.33, 0.66, 0.17), (0.58, 0.44, 0.18), (0.84, 0.6, 0.2)], 0.2, '#9e9e97', 0.0196)
        d = 0.0199; quad(a0 + 0.012, a1 - 0.012, y0 + h * 0.17, y0 + h * 0.24, '#ded8c7')
        ridge([(0.15, 0.3, 0.26), (0.52, 0.2, 0.3), (0.9, 0.34, 0.2)], 0.1, '#55554f', 0.0202)
        d = 0.0206
        for (t, sc) in ((0.12, 1.0), (0.17, 0.75), (0.86, 0.9), (0.92, 1.15)):   # 近處的松樹：樹幹＋三層樹冠
            ax = a0 + w * t; yb = y0 + h * 0.3
            quad(ax - 0.006, ax + 0.006, yb - h * 0.08, yb + h * 0.16 * sc, '#2e2e2a')
            for k in range(3):   # 三層疊起來的三角形樹冠（原本是三條橫槓，看起來像電線桿）
                ww = (0.06 - k * 0.014) * sc; yy = yb + h * (0.03 + k * 0.055) * sc; tri = [P(ax - ww, yy), P(ax + ww, yy), P(ax, yy + h * 0.1 * sc)]; m.poly(tri[::-1] if side in ('S', 'W') else tri, '#3c3f38')
        quad(a1 - 0.1, a1 - 0.05, y0 + 0.05, y0 + 0.1, '#b0261e')                                                                    # 紅印
        for k in range(5): quad(a0 + 0.06, a0 + 0.085, y1 - 0.08 - k * 0.05, y1 - 0.045 - k * 0.05, '#3a3a36')                        # 題字（一行五個墨點）
    elif kind == 'ink':
        for k in range(5): a_ = a0 + w * (0.08 + k * 0.18); hh = h * rr.uniform(0.3, 0.75); m.poly(([P(a_, y0 + 0.02), P(a_ + w * 0.22, y0 + 0.02), P(a_ + w * 0.1, y0 + hh)] if side in ('N', 'E') else [P(a_ + w * 0.22, y0 + 0.02), P(a_, y0 + 0.02), P(a_ + w * 0.1, y0 + hh)]), ('#8a8a86', '#a9a9a4', '#6f6f6c')[k % 3])
    else:
        for k in range(4): a_ = a0 + w * (0.05 + k * 0.23); quad(a_, a_ + w * 0.2, y0 + 0.02, y0 + h * rr.uniform(0.4, 0.8), ('#8f8b84', '#a8a39a', '#77736c')[k % 3])


def beams(c, zs, col='#7a1418', hh=0.14, ww=0.16):
    """天花板下面的橫樑（辛亥韓食：深紅）：只有朝下和朝兩側的面、單面——鏡頭在天花板上面時看不到"""
    X0, X1 = c.X0, c.X1; m = c.extra.setdefault('beams', Mesh(_cn(c, f'l118_{c.sid}_beams'), L.flat(f'l118_{c.sid}_beam', col, rough=0.8, cull=True)))
    for z in zs:
        y0 = H - hh; m.quad([(X0, y0, z - ww / 2), (X1, y0, z - ww / 2), (X1, y0, z + ww / 2), (X0, y0, z + ww / 2)])
        m.quad([(X0, y0, z + ww / 2), (X1, y0, z + ww / 2), (X1, H, z + ww / 2), (X0, H, z + ww / 2)]); m.quad([(X1, y0, z - ww / 2), (X0, y0, z - ww / 2), (X0, H, z - ww / 2), (X1, H, z - ww / 2)])


# ---------- 第 3 版（最後一版；使用者 11-11 再貼一次九張店內圖、LAWWW 06:34：比參考圖空——牆面素、天花板沒東西、沒有盆栽、桌椅不夠密）----------
def ceil_grid(c, step=0.6, col='#aeb0ac', w=0.022):
    """輕鋼架天花板的格線（參考圖：白色礦纖板一格一格）：貼在天花板下面 4 mm 的細條，單面朝下——鏡頭在天花板上面時看不到"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; y = H - 0.004
    m = c.extra.setdefault('cgrid', Mesh(_cn(c, f'l118_{c.sid}_ceilgrid'), L.flat(f'l118_{c.sid}_ceilgrid', col, rough=0.9, cull=True)))
    n = int((X1 - X0) / step)
    for k in range(1, n + 1): x = X0 + k * (X1 - X0) / (n + 1) if False else X0 + k * step; (m.quad([(x - w / 2, y, Z0), (x + w / 2, y, Z0), (x + w / 2, y, Z1), (x - w / 2, y, Z1)]) if x < X1 - 0.05 else None)
    n = int((Z1 - Z0) / step)
    for k in range(1, n + 1): z = Z0 + k * step; (m.quad([(X0, y, z - w / 2), (X1, y, z - w / 2), (X1, y, z + w / 2), (X0, y, z + w / 2)]) if z < Z1 - 0.05 else None)


def small_plant(c, x, y, z, s=0.2, seed=1, vine=0.0, out=(0.0, 0.0), pot='#c9ccce'):
    """層板、檯面上的小盆栽（黃金葛）：盆子＋一叢葉子；vine＞0 再垂幾條藤下來（out＝往室內偏的方向）"""
    rr = random.Random(seed * 131 + 7); v = c.vc
    if getattr(c, 'ph', None): c.ph.put('potted_plant_04', x, y, z, rr.uniform(0, 6.283), s=s * 6.5, share=False, height=0.2, decimate=0.15)   # CC0 的店：盆子和那一叢葉子換 Poly Haven 小盆栽（垂下來的藤照舊）
    else: clathe(v, [(0.0, 0.0), (s * 0.34, 0.0), (s * 0.42, s * 0.5), (s * 0.44, s * 0.52), (0.0, s * 0.52)], x, y, z, pot, seg=10)
    for k in range(9 if not getattr(c, 'ph', None) else 0):
        a = rr.uniform(0, 2 * PI); rd = rr.uniform(0.0, s * 0.45); csph(v, (x + rd * math.cos(a), y + s * 0.62 + rr.uniform(0, s * 0.55), z + rd * math.sin(a)), s * rr.uniform(0.2, 0.3), rr.choice(('#4f8f37', '#5f9a3c', '#3f7a2f')), seg=6, rings=4, sy=0.55)
    if vine > 0:
        for j in range(3):
            ox, oz = out[0] * (0.05 + 0.03 * j) + (rr.uniform(-0.12, 0.12) if out[1] else 0.0), out[1] * (0.05 + 0.03 * j) + (rr.uniform(-0.12, 0.12) if out[0] else 0.0); ln = vine * rr.uniform(0.55, 1.0)
            ccyl(v, (x + ox, y + s * 0.5, z + oz), (x + ox, y - ln, z + oz), 0.004, '#4a6a2c', seg=3, caps=False)
            for k in range(int(ln / 0.09) + 2): csph(v, (x + ox + rr.uniform(-0.03, 0.03), y + s * 0.4 - k * 0.09, z + oz + rr.uniform(-0.03, 0.03)), 0.045, rr.choice(('#4f8f37', '#5f9a3c')), seg=6, rings=3, sy=0.5)


def hooks(c, side, a, y, cols=('#f4f1ea', '#f4f1ea'), ln=0.42):
    """牆上的掛勾木條＋掛著的毛巾／圍裙（參考圖：清州的白毛巾、118牛排的暗紅圍裙）"""
    X0, X1 = c.X0, c.X1; m = c.wg(side, 'trim', c.M['vc'], cm=True); n = len(cols); w = 0.2 * n + 0.1
    if side == 'W': m.cbox(X0, X0 + 0.025, y, y + 0.06, a - w / 2, a + w / 2, '#6b4a30'); [m.cbox(X0 + 0.02, X0 + 0.045, y - ln, y + 0.01, a - w / 2 + 0.08 + k * 0.2, a - w / 2 + 0.22 + k * 0.2, col) for k, col in enumerate(cols)]
    else: m.cbox(X1 - 0.025, X1, y, y + 0.06, a - w / 2, a + w / 2, '#6b4a30'); [m.cbox(X1 - 0.045, X1 - 0.02, y - ln, y + 0.01, a - w / 2 + 0.08 + k * 0.2, a - w / 2 + 0.22 + k * 0.2, col) for k, col in enumerate(cols)]


def wall_clock(c, side, a, y, r=0.17):
    X0, X1 = c.X0, c.X1; m = c.wg(side, 'trim', c.M['vc'], cm=True); x0, x1 = (X0, X0 + 0.03) if side == 'W' else (X1 - 0.03, X1); xf = X0 + 0.034 if side == 'W' else X1 - 0.034
    ccyl(m, (x0, y, a), (x1, y, a), r, '#5a3524', seg=18); ccyl(m, (min(x1, xf), y, a), (max(x1, xf), y, a), r * 0.86, '#f4f1ea', seg=18)
    xh = X0 + 0.04 if side == 'W' else X1 - 0.04; m.cbox(min(xf, xh), max(xf, xh), y, y + r * 0.6, a - 0.008, a + 0.008, '#222222'); m.cbox(min(xf, xh), max(xf, xh), y - 0.008, y + 0.008, a, a + r * 0.45, '#222222')


def steel_cabinet_e(c, z0, z1, h=1.95, d=0.62):
    """靠東牆的雙門不鏽鋼冰箱／櫃子（面向店裡）"""
    X1 = c.X1; x0 = X1 - d; c.steel.box(x0, X1, 0.0, h, z0, z1); zm = (z0 + z1) / 2
    c.vc.cbox(x0 - 0.006, x0, 0.1, h - 0.08, zm - 0.006, zm + 0.006, '#5f6468'); c.vc.cbox(x0 - 0.006, x0, 1.0, 1.012, z0 + 0.03, z1 - 0.03, '#5f6468')
    for hz in (zm - 0.09, zm + 0.07): c.vc.cbox(x0 - 0.04, x0, 1.15, 1.55, hz, hz + 0.02, '#3a3d40'); c.vc.cbox(x0 - 0.04, x0, 0.45, 0.85, hz, hz + 0.02, '#3a3d40')
    c.vc.cbox(x0 - 0.004, x0, 1.3, 1.55, z0 + 0.1, z0 + 0.3, '#f4f1ea')                                                                  # 門上貼的一張紙


def side_fridge_e(c, z0, z1, h=1.85, d=0.55):
    """靠東牆、面向店裡（−x）的小菜冰箱：白色外殼、玻璃門、裡面發光、四層一碟一碟的涼拌小菜（沒有品牌）"""
    X1 = c.X1; xb = X1 - 0.005; xf = X1 - d
    for (xa, xc, ya, yb, za, zc) in ((xb - 0.03, xb, 0.0, h, z0, z1), (xf, xb, 0.0, h, z0, z0 + 0.04), (xf, xb, 0.0, h, z1 - 0.04, z1), (xf, xb, h - 0.16, h, z0, z1), (xf, xb, 0.0, 0.12, z0, z1)):
        c.vc.cbox(xa, xc, ya, yb, za, zc, '#e8eaec')
    xl = xb - 0.036; c.fridgel.quad([(xl, 0.14, z0 + 0.05), (xl, 0.14, z1 - 0.05), (xl, h - 0.17, z1 - 0.05), (xl, h - 0.17, z0 + 0.05)])
    rr = random.Random(int(z0 * 100) + 7)
    for k in range(4):
        y = 0.2 + k * 0.39; c.vm.cbox(xf + 0.04, xb - 0.04, y - 0.012, y, z0 + 0.05, z1 - 0.05, '#c9ccce'); n = int((z1 - z0 - 0.1) / 0.15)
        for j in range(n):
            for row in range(2):
                px, pz = xf + 0.12 + row * 0.17, z0 + 0.13 + j * 0.15
                clathe(c.vc, [(0.0, 0.0), (0.045, 0.0), (0.062, 0.018), (0.0, 0.018)], px, y, pz, '#f4f1ea', seg=10); ccyl(c.vc, (px, y + 0.018, pz), (px, y + 0.034, pz), 0.045, rr.choice(['#3f7d3a', '#c8502a', '#e8d9a8', '#7a4a2a', '#d8b23a', '#a83a2a', '#5a8a4a']), seg=8)
    gl = c.extra.setdefault('fglass', Mesh(f'l118_{c.sid}_fridgeglass', c.M['glass'])); gl.box(xf, xf + 0.012, 0.12, h - 0.16, z0 + 0.04, z1 - 0.04)
    c.vm.cbox(xf - 0.03, xf, 0.8, 1.2, z1 - 0.1, z1 - 0.08, '#8a8f93')                                                                      # 門把
    c.vc.cbox(xf - 0.004, xf, h - 0.14, h - 0.03, z0 + 0.08, z1 - 0.08, '#b41e1c')                                                          # 上緣的紅色飾條


def troffers(c, pts, L_=1.2, w=0.3):
    """輕鋼架天花板的雙管燈具（BB_341 第 6 條：四間都加天花板的燈具）：白色燈盤＋兩支燈管＋下面一片發亮的燈罩；pts＝[(x, z, 'x'|'z')]"""
    for (x, z, ax) in pts:
        ax_x = ax == 'x'; hx, hz = (L_ / 2, w / 2) if ax_x else (w / 2, L_ / 2)
        _cv(c).cbox(x - hx - 0.03, x + hx + 0.03, H - 0.07, H, z - hz - 0.03, z + hz + 0.03, '#f4f4f1')
        _ct(c).box(x - hx, x + hx, H - 0.078, H - 0.07, z - hz, z + hz)


def downlights(c, pts, r=0.07):
    for (x, z) in pts: _cv(c).cbox(x - r - 0.015, x + r + 0.015, H - 0.012, H, z - r - 0.015, z + r + 0.015, '#f1efe8'); _cw(c).cyl((x, H - 0.02, z), (x, H - 0.012, z), r, seg=12)


def ceil_fan(c, x, z, col='#f1efe8'):
    """吊扇（BB_341 第 4 條）：吊桿、馬達、四片扇葉；最低 2.78 m"""
    v = _cv(c); ccyl(v, (x, H - 0.3, z), (x, H, z), 0.015, '#c9ccce', seg=6); ccyl(v, (x, H - 0.4, z), (x, H - 0.3, z), 0.09, col, seg=12)
    for k in range(4):
        a = k * PI / 2 + 0.4; dx, dz = math.cos(a), math.sin(a); px, pz = -dz * 0.07, dx * 0.07
        v.poly([(x + dx * 0.1 + px, H - 0.36, z + dz * 0.1 + pz), (x + dx * 0.62 + px, H - 0.37, z + dz * 0.62 + pz), (x + dx * 0.62 - px, H - 0.35, z + dz * 0.62 - pz), (x + dx * 0.1 - px, H - 0.34, z + dz * 0.1 - pz)], col)


def steam(c, x, y, z, n=5, r=0.13):
    """鍋子上面的蒸氣（BB_341 第 4 條）：幾團半透明的白"""
    m = c.extra.setdefault('steam', Mesh(f'l118_{c.sid}_steam', L.flat('l118_steam', '#ffffff', rough=1.0, alpha=0.2))); rr = random.Random(int(x * 100 + z * 37))
    for k in range(n): m.sphere((x + rr.uniform(-0.08, 0.08) * (k + 1) * 0.6, y + 0.12 + k * 0.17, z + rr.uniform(-0.08, 0.08) * (k + 1) * 0.6), r * (0.7 + 0.18 * k), seg=8, rings=5)


def big_photo(c, side, a0, w=1.0, y0=1.45, col='#3a2a1e'):
    """牆上的大張餐點圖（P1：512×448）"""
    h = w * 448 / 512; frame_board(c, side, a0, a0 + w, y0, y0 + h, col); printed(c, side, a0, a0 + w, y0, y0 + h, 'P1', inset=0.014)


def booth(c, x0, x1, zc, cush='#262221', woodc='#5a3c2a'):
    """四人卡座（L118-SHOPS-REDO-1111 辛亥韓食）：桌子一端靠牆（x1），兩張長椅面對面、椅背 1.05 m；x0＝走道那一側。
    一張長椅坐兩個人：靠走道的那一個從走道就坐得到（互動半徑 0.7 m）；靠牆的那一個離走道 1 m 多，配置裡多寫 r＝1.25（給遊戲當互動半徑用）。
    整個卡座是一塊導航阻擋（呼叫的地方一次擋整排）"""
    tw = 0.6; mid = (x0 + x1) / 2
    c.wood.rbox(x0 + 0.04, x1 - 0.015, 0.705, 0.74, zc - tw / 2, zc + tw / 2, r=0.008, seg=2)                                               # 桌面
    ccyl(c.vm, (x0 + 0.32, 0.0, zc), (x0 + 0.32, 0.705, zc), 0.04, '#2b2b2b', seg=10); clathe(c.vm, [(0.0, 0.0), (0.24, 0.0), (0.22, 0.03), (0.05, 0.05), (0.0, 0.05)], x0 + 0.32, 0.0, zc, '#2b2b2b', seg=14)
    c.vm.cbox(x1 - 0.05, x1 - 0.015, 0.55, 0.705, zc - 0.22, zc + 0.22, '#2b2b2b')                                                            # 靠牆那一端的托架
    for sg in (-1, 1):
        zs = zc + sg * 0.6; zb = zc + sg * 0.835
        c.vc.crbox(x0, x1 - 0.015, 0.0, 0.4, min(zs - sg * 0.2, zb + sg * 0.03), max(zs - sg * 0.2, zb + sg * 0.03), woodc, r=0.008, seg=1)   # 椅座的木箱
        c.vc.crbox(x0 + 0.01, x1 - 0.02, 0.4, 0.47, zs - 0.2, zs + 0.2, cush, r=0.02, seg=2)                                                # 坐墊（頂面 0.47＝遊戲坐下對準的椅面）
        c.vc.crbox(x0, x1 - 0.015, 0.0, 1.05, zb - 0.03, zb + 0.03, woodc, r=0.008, seg=1)                                                  # 椅背
        c.vc.crbox(x0 + 0.03, x1 - 0.04, 0.53, 1.0, min(zb - sg * 0.03, zb - sg * 0.08), max(zb - sg * 0.03, zb - sg * 0.08), cush, r=0.02, seg=2)   # 椅背的靠墊
        yaw = 0.0 if sg < 0 else PI
        for k, sx in enumerate((x0 + 0.25, x0 + 0.75)):
            c.seat(sx, zs, yaw, (mid, zc), 'eat', ap=(x0 - 0.35, zs))
            if k: c.seats[-1]['r'] = 1.25; c.seats[-1]['inner'] = True


def build_tea(c):
    """辛亥韓食（L118-SHOPS-REDO-1111，X338；原一一八茶飲這一格，店面 3 m 寬、室內 2.6 × 8.0 m）：使用者的規格「深紅招牌、餐點照片；密集四人桌。
    鐵板肉由廚房做好，不是桌邊自行烤肉」→ 東牆一排三張四人卡座（深紅坐墊）、西邊一條走道直通最裡面的櫃台；櫃台後面是出菜口和廚房（鐵板、石鍋在裡面做）；
    櫃台東半是小菜櫃（AA：小菜可以續）。牆：米白＋深紅腰牆磁磚；地板淺色磨石子（D112：不用深色木）。走道對齊導航格（0.4 m）：卡座從 x 0.3 開始，走道兩格半寬"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; RED = '#7a1418'; c.S['kpass'] = True   # 後牆由 kitchen() 畫（同上）
    shell(c); kitchen(c, -0.9, 0.9, depth=1.8, win=(1.0, 1.6))
    BX0 = 0.3; ZC = (2.1, 0.38, -1.34)
    for zc in ZC:
        booth(c, BX0, X1, zc); table_set(c, BX0 + 0.72, zc, 'korea'); banchan(c, BX0 + 0.38, zc)
        c.vm.cbox(X1 - 0.3, X1 - 0.08, 0.74, 0.86, zc - 0.07, zc + 0.07, '#b9bec2'); ccyl(c.vm, (X1 - 0.19, 0.86, zc), (X1 - 0.19, 0.88, zc), 0.05, '#8a8f93', seg=8)   # 靠牆的不鏽鋼餐具盒
        ccyl(c.vc, (BX0 + 0.5, 2.82, zc), (BX0 + 0.5, H, zc), 0.005, '#2a2a2a', seg=4); c.warm.sphere((BX0 + 0.5, 2.66, zc), 0.17, seg=14, rings=8)   # 圓形紙燈籠（室內參考圖；2.5 m 以上）
    c.block(BX0, X1, -2.55, ZC[0] + 0.87, 'booths')                                                                                    # 三張卡座＋卡座到櫃台之間 0.35 m 的縫：一整塊
    # 最裡面：櫃台（西半：點餐、收銀；東半：小菜櫃），後面是店員和出菜口
    counter(c, X0, 0.25, -3.0, -2.55, h=1.0, top='wood', front=RED, why='counter'); register(c, -0.75, 1.0, -2.78, face='+z')
    glass_case(c, 0.25, X1, -3.0, -2.55, face='+z', rows=1, warm=False); c.block(0.22, X1, -3.03, -2.52, 'banchan')
    sys.path.insert(0, os.path.join(HERE, 'aa_support')); import sq_traces as TR; TR.sq13_korea(c.root, X1, cz=-2.78, y0=1.5)   # 店員支線 SQ13 做完以後小菜櫃上多一罐泡菜（「她的」）：TRACE_SQ13_jar，遊戲照名字開關；跟著韓食老闆從 korea 搬來（AA_772）
    for k in range(6): c.vc.crbox(0.36 + k * 0.15, 0.48 + k * 0.15, 0.89, 0.93, -2.92, -2.64, ['#c8281c', '#3f7a2a', '#e8d8a0', '#6a4a2e', '#e8842a', '#f4f0e0'][k], r=0.004, seg=1)   # 小菜盒（泡菜、海帶、豆芽、滷蛋…）
    ccyl(c.vm, (-1.08, 1.0, -2.8), (-1.08, 1.34, -2.8), 0.11, '#b9bec2', seg=14); ccyl(c.vc, (-1.08, 1.34, -2.8), (-1.08, 1.37, -2.8), 0.115, '#2a2a2c', seg=14); c.vc.cbox(-1.1, -1.06, 1.06, 1.1, -2.69, -2.62, '#222222')   # 茶水桶（第二組參考圖 int2_tea）
    for k in range(4): ccyl(c.vm, (-0.32, 1.0 + k * 0.03, -2.7), (-0.32, 1.09 + k * 0.03, -2.7), 0.036, '#c9ced2', seg=10, r2=0.042)   # 一疊不鏽鋼杯
    c.block(X0, X1, Z0, -3.0, 'staff')
    c.counter = dict(x0=X0, x1=0.25, z0=-3.0, z1=-2.55, h=1.0)
    c.clerk = dict(x=-0.45, z=-3.45, yaw=0.0, note='櫃台後面（出菜口前），面向門口；老闆＝原韓食小廚的老闆（AA_772）')
    c.order = dict(x=-0.45, z=-1.95, r=0.7, label='點餐（' + c.T['name'] + '）', note='櫃台前面的走道；shop118:tea')
    c.look('banchan', 0.75, -2.78, 1.3, '小菜櫃', note='（小菜自己夾。泡菜那一盒最先見底。）', dev='AA_772 look_lines.tea；櫃台東半的小菜櫃')
    for k in range(4): clathe(c.vc, [(0.0, 0.0), (0.07, 0.0), (0.09, 0.08), (0.08, 0.09), (0.0, 0.01)], -0.6 + k * 0.4, 1.0, Z0 + 0.1, '#2b2a28', seg=12)   # 出菜口檯面上的石鍋
    # 西牆（走道那一面）：菜單、兩張有餐點圖的海報、冷氣、壁扇；東牆卡座上方：店名、層板上的石鍋
    frame_board(c, 'W', 0.95, 2.55, 1.5, 2.1, RED); printed(c, 'W', 0.95, 2.55, 1.5, 2.1, 'MENU', inset=0.014)
    for z0_ in (-2.15, -1.2, -0.25): big_photo(c, 'W', z0_, 0.85, 1.42, RED)   # 第 3 版（BB_341 第 5 條、室內參考圖）：西牆三幅鍋物圖
    downlights(c, [(-0.75, 3.0), (-0.75, 1.2), (-0.75, -0.6), (-0.75, -2.4), (0.75, 3.2)])
    printed(c, 'N', -1.2, 1.2, 1.72, 2.17, 'NAME', inset=0.02); wall_shelf(c, 'E', -2.2, -0.2, 1.95, items='stone'); wall_shelf(c, 'E', 0.6, 2.4, 1.95, items='jars')   # 出菜口上方：深紅布簾上的店名（室內參考圖）；東牆卡座上方的木層板放石鍋
    dd = c.door; printed(c, 'S', 0.25, 0.75, 1.3, 1.52, 'HOURS', inset=0.03); printed(c, 'E', 2.3, 2.75, 1.5, 1.7, 'P2')
    ac_unit(c, X0, 2.6, -0.5, '+x', fade=True); wall_fan(c, X0, 2.35, 2.6, '+x')
    tubes(c, [(-0.5, 2.3, 'z'), (-0.5, 0.2, 'z'), (-0.5, -1.9, 'z'), (0.0, -3.5, 'x')], L_=1.0)
    # 第 2 版（室內參考圖）：天花板的深紅橫樑、西牆靠門口的深紅掛布（梅花）、東牆一張老照片、海報上方的壁燈
    beams(c, (3.0, 1.25, -0.5, -2.25)); wall_art(c, 'W', 3.05, 3.65, 1.25, 2.45, 'cloth'); wall_art(c, 'E', 2.9, 3.5, 1.45, 1.95, 'photo')
    small_plant(c, X1 - 0.14, 1.95, 2.3, 0.2, seed=31, vine=0.55, out=(-1.0, 0.0), pot='#3a2a1e'); small_plant(c, X1 - 0.14, 1.95, -0.3, 0.18, seed=33, vine=0.4, out=(-1.0, 0.0), pot='#3a2a1e'); small_plant(c, -1.05, 1.0, -2.62, 0.14, seed=35, pot='#f4f1ea')   # 第 3 版：層板、櫃台上的盆栽
    for z_ in (-1.72, -0.78, 0.18): c.vm.cbox(X0 + 0.0, X0 + 0.06, 2.3, 2.36, z_ - 0.03, z_ + 0.03, '#3a2a1e'); clathe(c.vm, [(0.0, 0.1), (0.05, 0.08), (0.1, 0.0), (0.09, 0.0), (0.04, 0.07), (0.0, 0.09)], X0 + 0.14, 2.24, z_, '#3a2a1e', seg=10); c.warm.sphere((X0 + 0.14, 2.27, z_), 0.03, seg=8, rings=4)
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
    tv(c, 'W', -1.2, 2.55, 0.95); c.look('tv', X0 + 0.5, 2.35, 0.6, '電視', '電視在播午間新聞，沒有人在看。', dev='AA_280 的原句')
    c.wg('W', 'trim', c.M['vc'], cm=True).cbox(X0, X0 + 0.3, 2.2, 2.24, -1.6, -0.8, '#3a3a3a')                 # 電視的架子
    counter(c, X0, X0 + 0.7, Z0, Z0 + 1.3, h=0.85, top='steel', front='#d9dadb', why='soup')                    # 自取的湯、白飯（西牆後段）
    rice_cooker(c, X0 + 0.35, 0.85, Z0 + 0.35); clathe(c.vm, [(0.0, 0.0), (0.17, 0.0), (0.17, 0.32), (0.18, 0.33), (0.0, 0.02)], X0 + 0.35, 0.85, Z0 + 0.95, '#c9ced2', seg=16)
    c.look('soup', X0 + 1.4, Z0 + 0.7, 0.8, '自取的湯', dev='湯免費自取；遊戲裡顯示的字等 AA 寫')
    # 湯鍋旁邊沿北牆的自取櫃（餐具、紙巾、辣椒醬、醬油、疊起來的碗；10-21 seatcheck：原本北邊那排椅子和北牆之間 0.8 m 的空地，
    # 人站得進去、照格子卻走不出來——玩家從某些方向按「坐下」可能被帶到那裡卡住）。櫃子 45 cm 深，前面再擋 20 cm（和椅背之間剩不到一個人寬）
    counter(c, X0 + 0.73, X0 + 1.95, Z0, Z0 + 0.45, h=0.85, top='steel', front='#d9dadb', block=False); c.block(X0 + 0.7, X0 + 1.98, Z0, Z0 + 0.65, 'self_serve')
    sx0 = X0 + 0.85; sz = Z0 + 0.25
    for k in range(3): ccyl(c.vc, (sx0 + 0.02, 0.85 + k * 0.045, sz), (sx0 + 0.02, 0.89 + k * 0.045, sz), 0.075 - k * 0.002, '#f2efe8', seg=14)   # 疊起來的碗
    ccyl(c.vc, (sx0 + 0.3, 0.85, sz), (sx0 + 0.3, 0.99, sz), 0.04, '#c9ced2', seg=10)                                                  # 筷筒
    for k in range(6): c.vc.cbox(sx0 + 0.27 + (k % 3) * 0.02, sx0 + 0.28 + (k % 3) * 0.02, 0.9, 1.1 + (k % 2) * 0.02, sz - 0.02 + (k // 3) * 0.03, sz - 0.01 + (k // 3) * 0.03, '#c8a46a')
    c.vc.cbox(sx0 + 0.48, sx0 + 0.72, 0.85, 0.94, sz - 0.07, sz + 0.07, '#f4f1ea'); c.vc.cbox(sx0 + 0.56, sx0 + 0.64, 0.94, 0.955, sz - 0.02, sz + 0.02, '#ffffff')   # 紙巾盒
    for k, col in enumerate(('#b8322c', '#b8322c', '#3a2414')): ccyl(c.vc, (sx0 + 0.85 + k * 0.08, 0.85, sz - 0.05), (sx0 + 0.85 + k * 0.08, 1.03, sz - 0.05), 0.028, col, seg=10)   # 辣椒醬、醬油
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
    bookshelf(c, X0, X0 + 0.32, -2.2, 2.4, h=2.3, along='z'); c.look('books', X0 + 0.9, 0.1, 1.0, '書架', dev='書可以自由取閱；遊戲裡顯示的字等 AA 寫')
    # 窗邊的吧檯（門的西邊）：高腳椅面向窗外，插座在檯面下
    c.wood.rbox(X0 + 0.35, 1.45, 1.0, 1.04, Z1 - 0.42, Z1 - 0.05, r=0.006, seg=1); c.vm.cbox(X0 + 0.4, 1.4, 0.0, 1.0, Z1 - 0.12, Z1 - 0.08, '#2b2b2b')
    outlets(c, X0 + 0.5, 1.3, 0.92, Z1 - 0.42, n=4)
    c.block(X0 + 0.32, 1.48, Z1 - 0.45, Z1, 'window_bar')
    for x_ in (-2.3, -1.4, -0.5, 0.4): chair(c, x_, Z1 - 0.78, 0.0, 'bar', '#3b2a1e'); c.seat(x_, Z1 - 0.78, 0.0, (x_, Z1 - 0.25), 'eat', label='坐窗邊（有插座）', lift=BAR_LIFT)
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
    for x_ in (-1.8, -1.0, -0.2, 0.6, 1.4, 2.2): chair(c, x_, -1.4, PI, 'bar', '#2f5d50'); c.seat(x_, -1.4, PI, (x_, -2.07), 'eat', label='坐吧檯', lift=BAR_LIFT)
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
    """清州刀削麵（L118-SHOPS-REDO-1111，X338；參考圖 l118_ref/ext_korea）：使用者的規格「白底紅字老式招牌、門口可見製麵區；不鏽鋼桌、廚房可見削麵及煮麵」。
    靠店面玻璃的左邊是製麵區（不鏽鋼工作台上的麵團、兩口大湯鍋——從街上的玻璃看得到；削麵的師傅站在台子後面）；最裡面櫃台＋出菜口；五張不鏽鋼四人桌配圓凳；白磁磚牆、壁扇、紅字菜單"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; RED = '#b41e1c'
    shell(c); kitchen(c, -1.6, 2.9, depth=2.2, win=(1.0, 2.5), door=(-2.6, -1.85))   # 第 2 版：開放式廚房（室內參考圖：大湯鍋、煮麵籃、抽油煙罩、層架上一盤盤醒著的麵團）
    kitchen_rich(c, hood=(0.3, 2.7), rack=(-1.5, -0.2), dough=True)
    counter(c, X0, 1.1, Z0 + 0.95, Z0 + 1.5, h=1.0, top='steel', front='#eef0ec', why='counter'); c.block(X0, 1.15, Z0, Z0 + 1.0, 'counter_back')
    register(c, 0.7, 1.0, Z0 + 1.22, face='+z')
    for k in range(6): clathe(c.vc, [(0.0, 0.0), (0.06, 0.0), (0.095, 0.075), (0.09, 0.08), (0.0, 0.01)], -2.3 + k * 0.22, 1.0, Z0 + 1.22, '#f4f1ea', seg=12)   # 一排白色麵碗
    c.counter = dict(x0=X0, x1=1.1, z0=Z0 + 0.95, z1=Z0 + 1.5, h=1.0)
    c.clerk = dict(x=-0.2, z=round(Z0 + 0.5, 3), yaw=0.0, note='櫃台後面（出菜口前），面向店裡；老闆（AA_772：原六張犁麵舖的老闆，只問「大碗小碗？」）')
    c.order = dict(x=-0.2, z=round(Z0 + 2.05, 3), r=0.8, label='點餐（' + c.T['name'] + '）', note='櫃台前面；shop118:korea')
    # 製麵區：靠店面玻璃的左邊（街上看得到）
    nz0, nz1 = Z1 - 0.85, Z1 - 0.12
    noodle_station(c, -3.0, -1.5, nz0, nz1)
    c.wood.rbox(-1.42, -0.73, 0.84, 0.9, nz0 - 0.02, nz1 + 0.0, r=0.008, seg=2); c.vc.crbox(-1.4, -0.75, 0.0, 0.84, nz0 + 0.03, nz1 - 0.03, '#8a6a4a', r=0.006, seg=1)   # 第 2 版：木頭的大工作檯（室內參考圖）
    csph(c.vc, (-1.12, 1.0, (nz0 + nz1) / 2), 0.2, '#f1e6cc', seg=12, rings=6, sy=0.55); csph(c.vc, (-0.86, 0.95, (nz0 + nz1) / 2 + 0.12), 0.09, '#f1e6cc', seg=10, rings=5, sy=0.6)   # 一大塊麵團＋一小塊
    c.vm.cbox(-1.3, -1.02, 1.09, 1.1, (nz0 + nz1) / 2 - 0.2, (nz0 + nz1) / 2 - 0.05, '#c9ced2'); c.vc.cbox(-1.36, -1.3, 1.085, 1.105, (nz0 + nz1) / 2 - 0.16, (nz0 + nz1) / 2 - 0.09, '#5a3a22')   # 削麵刀（架在麵團上）
    c.vc.crbox(-0.96, -0.77, 0.9, 1.2, nz1 - 0.3, nz1 - 0.06, '#e9e2cf', r=0.03, seg=2)   # 麵粉袋（立在工作檯靠玻璃那一端；原本放地上、多擋一塊：旁邊留下一個 10 fps 會卡的點，l118_shops_notrap 抓到的）
    c.vc.crbox(-1.36, -0.82, 0.9, 0.92, nz0 + 0.06, nz0 + 0.3, '#d8c8a8', r=0.004, seg=1)                                                             # 削麵的木板
    c.block(-3.05, -0.7, nz0 - 0.03, Z1, 'noodle_station')
    c.cook = dict(x=-1.1, z=round(nz0 - 0.5, 3), yaw=0.0, note='削麵的師傅（AA_772：不說話）：站在工作台後面、面向店面的玻璃（街上看得到他）')
    c.look('noodle_station', -1.9, round(nz0 - 0.65, 3), 1.0, '門口的製麵區', note='（師傅把麵團架在肩上，刀一片一片削進鍋裡。）', dev='AA_772 look_lines.korea；使用者的規格「門口可見製麵區」')
    for (tx, tz) in ((-1.75, -1.2), (-1.75, 0.75), (0.4, -1.2), (0.4, 0.75), (0.4, 2.7)):
        table(c, tx, tz, 1.0, 0.72, top='steel'); table_seats(c, tx, tz, 1.0, 0.72, ('-z', '+z'), style='wood', col='#26262a', n_per=2, ap_side=True); table_set(c, tx + 0.35, tz, 'tw')   # 不鏽鋼方桌、黑色靠背椅（室內參考圖）
    side_fridge_e(c, 0.6, 1.3); c.block(X1 - 0.6, X1, 0.55, 1.35, 'side_fridge')   # 第 3 版（BB_341：右半邊空）：東牆的小菜冰箱（麵店的涼拌小菜自己拿）
    # 東牆的調味料台（不鏽鋼矮櫃：醋、辣油、蒜泥的罐子，湯匙筷子，一桶麥茶和一疊杯子）。原本想放靠牆的兩人桌：座位變 22～24 個，
    #   shop_diners_unit「午晚餐坐滿三成半以上」不過（大店的客人上限不變）——不改測試，座位維持 20 個
    ex0 = X1 - 0.5; c.steel.box(ex0, X1, 0.84, 0.88, -1.4, -0.7); c.vc.crbox(ex0 + 0.02, X1, 0.0, 0.84, -1.38, -0.72, '#c9ccce', r=0.006, seg=1); c.vc.cbox(ex0 + 0.014, ex0 + 0.02, 0.1, 0.78, -1.055, -1.045, '#8a8f93')
    for k, col in enumerate(('#2b1a12', '#a8281e', '#e8dcb8')): ccyl(c.vc, (X1 - 0.34, 0.88, -1.3 + k * 0.13), (X1 - 0.34, 1.0, -1.3 + k * 0.13), 0.045, col, seg=10); ccyl(c.vm, (X1 - 0.34, 1.0, -1.3 + k * 0.13), (X1 - 0.34, 1.015, -1.3 + k * 0.13), 0.048, '#c9ced2', seg=10)
    ccyl(c.vm, (X1 - 0.16, 0.88, -1.24), (X1 - 0.16, 1.02, -1.24), 0.05, '#c9ced2', seg=10); ccyl(c.vm, (X1 - 0.16, 0.88, -1.1), (X1 - 0.16, 1.02, -1.1), 0.05, '#c9ced2', seg=10)   # 筷筒、湯匙筒
    ccyl(c.vm, (X1 - 0.24, 0.88, -0.86), (X1 - 0.24, 1.26, -0.86), 0.13, '#b9bec2', seg=14); ccyl(c.vc, (X1 - 0.24, 1.26, -0.86), (X1 - 0.24, 1.3, -0.86), 0.135, '#2b2b2b', seg=14); c.vc.cbox(X1 - 0.41, X1 - 0.37, 0.95, 0.99, -0.88, -0.84, '#222222')   # 麥茶桶＋龍頭
    cups_stack(c, X1 - 0.4, 0.88, -1.0, 6); c.block(X1 - 0.6, X1, -1.45, -0.65, 'sauce_station')
    troffers(c, [(-1.8, -1.0, 'z'), (-1.8, 1.4, 'z'), (0.6, -1.0, 'z'), (0.6, 1.4, 'z'), (2.4, -1.0, 'z'), (2.4, 1.4, 'z'), (-1.8, 3.4, 'x'), (-0.5, Z0 + 1.0, 'x')])
    ceil_fan(c, -0.6, 0.2); ceil_fan(c, 1.6, 2.6)                                                                                        # 第 3 版（BB_341 第 4 條）：吊扇
    steam(c, -2.25, 1.32, nz0 + 0.45, n=5); steam(c, -2.25, 1.32, nz0 + 1.15 if nz0 + 1.15 < Z1 - 0.2 else nz0 + 0.6, n=4, r=0.11)                # 門邊大鍋的蒸氣
    frame_board(c, 'E', -1.6, 0.4, 1.75, 2.5, RED); printed(c, 'E', -1.6, 0.4, 1.75, 2.5, 'MENU', inset=0.014)                                       # 東牆的紅字菜單（參考圖）
    printed(c, 'W', -1.2, 1.2, 2.5, 2.95, 'NAME')
    big_photo(c, 'W', -2.4, 1.0, 1.5, RED); big_photo(c, 'E', 1.0, 1.0, 1.5, RED)   # 兩張大的牛肉刀削麵（西牆裡面、東牆靠門口）
    wall_art(c, 'W', -0.7, 1.1, 1.45, 2.2, 'landscape')                                                                                 # 西牆的水墨山水（室內參考圖；第 3 版重畫：三層山、雲霧、松樹、紅印）
    dd = c.door; printed(c, 'S', dd['x'] - 0.95, dd['x'] - 0.5, 1.3, 1.5, 'HOURS', inset=0.03); frame_board(c, 'E', 2.35, 3.05, 1.5, 1.806, '#b8860a'); printed(c, 'E', 2.35, 3.05, 1.5, 1.806, 'P2')   # 「現削現煮」的黃牌子：搬到門邊（原本壓在大張麵圖上）
    wall_fan(c, X1, 2.45, 2.2, '-x'); wall_fan(c, X0, 2.45, 1.4, '+x'); ac_unit(c, X0, 2.55, -1.6, '+x', fade=True)
    # 第 3 版：天花板格線、西牆靠門口的不鏽鋼層板＋垂下來的黃金葛、掛勾上的白毛巾、東牆的碗架、時鐘
    ceil_grid(c); wall_shelf(c, 'W', 2.6, 3.5, 2.0, items='cups'); small_plant(c, X0 + 0.14, 2.0, 3.05, 0.22, seed=21, vine=0.75, out=(1.0, 0.0)); hooks(c, 'W', 2.45, 1.45, ('#f4f1ea', '#f4f1ea'))
    wall_shelf(c, 'E', -3.0, -1.9, 1.75, items='bowls'); wall_clock(c, 'E', 2.6, 2.45)
    c.cam = 4.2


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
    for x_ in (-1.0, -0.2, 0.6, 1.4, 2.2): chair(c, x_, -0.95, PI, 'bar', '#e0a030'); c.seat(x_, -0.95, PI, (x_, -1.62), 'eat', label='坐吧檯', lift=BAR_LIFT)
    # 兩側的桌子靠牆（10-21 seatcheck：原本 −1.95、2.25，桌子和牆之間 0.45～0.75 m——站得進去、照格子卻走不出來，玩家從某些方向按「坐下」可能被帶到那裡卡住）
    for (tx, tz) in ((-2.6, 0.65), (0.2, 0.75), (2.6, 0.75), (0.2, 2.6), (2.6, 2.6)):
        table(c, tx, tz, 0.7, 0.68, top='lam', col='#fbf3df', legc='#5c3a21'); table_seats(c, tx, tz, 0.7, 0.68, ('-z', '+z'), style='wood', col='#b08a5e'); table_set(c, tx + 0.15, tz, 'cafe')
    for (x_, z_) in ((-2.6, 0.65), (0.2, 0.75), (2.6, 0.75), (0.2, 2.6), (2.6, 2.6), (-0.4, -1.62), (1.6, -1.62)):   # 球形吊燈（2.6 m：不擋遊戲的鏡頭；吧檯上面那兩盞跟著後牆淡出）
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
    glass_case(c, -1.75, -1.3, 1.3, Z1 - 0.4, face='+x', rows=2, warm=False); c.look('sides', -0.75, 2.8, 0.7, '小菜櫃', dev='小菜自己拿，一盤三十；遊戲裡顯示的字等 AA 寫')
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


# ================= CC0 素材（D160、D161；SHOP-CC0-HELP-1113，AA-C 2026-11-13）=================
#   改好的店（CC0_SHOPS）：頂點色方塊照顏色分到 ambientCG／Poly Haven 材質組（cc0_kit.Route；CC0_ROUTE 表上沒有的顏色＝食物、植物、照片、小東西，照舊頂點色）、
#   金屬零件（c.vm）照顏色分到不鏽鋼／黑鐵材質組、不鏽鋼（c.steel）、天花板、廚房天花板、輕鋼架換材質組；椅凳、盆栽換 Poly Haven 掃描模型（cc0_kit.PH）。
#   形狀、配置、座位、互動點、導航都不動。牆上的東西（腰牆收邊、踢腳板、層板、框、廚房的牆和地）分到同一面牆的分組網格（WALL_<面>_<key>_<材質>），照舊跟著牆淡出。
#   油漆牆照舊平塗（店面測試：牆不貼圖）；玻璃、發光的燈、店門外的景照舊。做法、驗收：docs/art-rebuild/second_ai/research/SHOP_CC0_HOWTO.md
CC0_SHOPS = ('self',)
_W = ('#f4f1ea', '#f4f4f1', '#e9e9e6', '#f2f2ee', '#d9dad6', '#ffffff', '#f1ede4')
_ST = ('#c9ccce', '#c9ced2', '#b9bec2', '#c4c8cb', '#b3b8bc', '#9aa0a4', '#8a8f93', '#d9dadb', '#aeb0ac')
_SD = ('#5f6468', '#3a3d40', '#3a3d41', '#7f868b', '#8f969b')
_DK = ('#2a2a2a', '#2b2b2b', '#202020', '#1c1c1c', '#222222', '#2c2e31', '#202225')
_WD = ('#6b4a30', '#3a3530', '#3a2a1e', '#2f2b28', '#4a3a2a', '#3a2416')
_COMMON = dict([(k, 'plastic_w') for k in _W] + [(k, 'steel') for k in _ST] + [(k, 'steel_d') for k in _SD] + [(k, 'plastic_dk') for k in _DK] + [(k, 'wood_d') for k in _WD] +
               [('#d8b888', 'paper'), ('#c8a878', 'cardboard'), ('#dcd8cf', 'tile_w'), ('#d6d2c9', 'tile_w'), ('#8f8c86', 'tile_f'), ('#9a9893', 'paving')])   # 四間共用：殼、廚房、櫃台、收銀機、層架
CC0_ROUTE = {   # 顏色 → 材質 key（cc0_setup 的 MX）；表上沒有的顏色＝食物、植物、照片、小東西，照舊頂點色
    'self': dict(_COMMON, **{'#f6f4ee': 'box_w', '#c9a46a': 'box_k', '#b8860a': 'brass', '#f2c21a': 'plastic_y', '#e8b81e': 'plastic_y', '#e8b616': 'plastic_y', '#e0b24a': 'plastic_y', '#c8281c': 'plastic_red', '#2a5fb8': 'plastic_blue',
                             '#8a1f1a': 'mat', '#a52a22': 'mat_l'}),
}
CC0_FOOD = ('self',)   # 有配菜盤、炸物的店：用菜色貼圖集
CC0_VM = {'self': 'steel'}   # 金屬零件（c.vm）表上沒有的顏色、圓柱、車床零件（直接畫進網格的）歸哪一種：水上便當幾乎都是不鏽鋼（飯鍋、保溫燈罩、餐盤）
CC0_CHAIRS = {'steelstool': ('metal_stool_02', dict(height=0.46, decimate=0.15, mat='steel')),   # 掃描的是白烤漆凳：形狀照用、材質換不鏽鋼（參考圖、原本都是不鏽鋼）
              'wood': ('painted_wooden_chair_02', dict(height=0.92, recolor=('#170e08', '#5e3f29'), decimate=0.45, chair=True)),
              'bar': ('bar_chair_round_01', dict(height=0.76, decimate=0.1))}

FOOD_CELLS = 4   # 菜色貼圖集 4×4 格：0～11 照 FOOD 的順序（配菜盤），12 炸雞腿皮、13 排骨、14 滷蛋切半、15 白飯


def food_atlas(path, size=1024):
    """菜色貼圖集（SHOP-CC0-HELP-1113 v2；照 LAWWW2-C 東南大聯的做法：PIL 自己畫）：每格一種菜的表面——
    炸物的酥皮顆粒、炒青菜的葉子、玉米粒、滷肉塊、高麗菜、豆干、豆芽、四季豆、滷蛋切半、白飯粒……（程式畫的，不是照片）"""
    from PIL import Image, ImageDraw, ImageFilter
    rr = random.Random(118); n = FOOD_CELLS; cs = size // n; im = Image.new('RGB', (size, size)); d = ImageDraw.Draw(im)
    def hx(h, k=1.0): h = h.lstrip('#'); return tuple(max(0, min(255, int(int(h[i:i + 2], 16) * k))) for i in (0, 2, 4))
    def blobs(x0, y0, base, cols, n_, r0, r1, sq=False):
        d.rectangle([x0, y0, x0 + cs, y0 + cs], fill=hx(base, 0.8))
        for _ in range(n_):
            cx, cy = x0 + rr.uniform(0, cs), y0 + rr.uniform(0, cs); r = rr.uniform(r0, r1); col = hx(rr.choice(cols), rr.uniform(0.85, 1.12))
            if sq: d.rectangle([cx - r, cy - r * 0.8, cx + r, cy + r * 0.8], fill=col, outline=hx(base, 0.6))
            else: d.ellipse([cx - r, cy - r * rr.uniform(0.5, 1.0), cx + r, cy + r * rr.uniform(0.5, 1.0)], fill=col)
    def leaves(x0, y0, base, cols, stems):
        d.rectangle([x0, y0, x0 + cs, y0 + cs], fill=hx(base, 0.6))
        for _ in range(140):
            cx, cy = x0 + rr.uniform(0, cs), y0 + rr.uniform(0, cs); a = rr.uniform(0, math.pi); L_ = rr.uniform(10, 26); w = rr.uniform(4, 9)
            pts = [(cx + math.cos(a) * L_, cy + math.sin(a) * L_), (cx + math.cos(a + 1.57) * w, cy + math.sin(a + 1.57) * w), (cx - math.cos(a) * L_, cy - math.sin(a) * L_), (cx - math.cos(a + 1.57) * w, cy - math.sin(a + 1.57) * w)]
            d.polygon(pts, fill=hx(rr.choice(cols), rr.uniform(0.8, 1.15)))
            if rr.random() < 0.4: d.line([pts[0], pts[2]], fill=hx(stems), width=2)
    def sticks(x0, y0, base, cols, L0, L1, w):
        d.rectangle([x0, y0, x0 + cs, y0 + cs], fill=hx(base, 0.7))
        for _ in range(170):
            cx, cy = x0 + rr.uniform(0, cs), y0 + rr.uniform(0, cs); a = rr.uniform(0, math.pi); L_ = rr.uniform(L0, L1)
            d.line([(cx - math.cos(a) * L_, cy - math.sin(a) * L_), (cx + math.cos(a) * L_, cy + math.sin(a) * L_)], fill=hx(rr.choice(cols), rr.uniform(0.85, 1.1)), width=w)
    for i in range(n * n):
        x0, y0 = (i % n) * cs, (i // n) * cs
        if i == 0 or i == 12: blobs(x0, y0, '#b8742a', ['#d89a42', '#e8b45a', '#c98a3a', '#a8642a', '#f0c870'], 900, 3, 9)       # 炸物酥皮顆粒
        elif i == 1: leaves(x0, y0, '#3f6a2a', ['#5f9a3c', '#7aaa45', '#4f8a32', '#8aba55'], '#c9d9a0')                           # 炒青菜
        elif i == 2: blobs(x0, y0, '#d8a83a', ['#f0c84a', '#e8b83a', '#f5d860', '#dca030'], 520, 6, 10)                       # 玉米粒
        elif i == 3: blobs(x0, y0, '#6a2a1a', ['#8a3a22', '#a84a2a', '#7a321e', '#c9784a'], 160, 10, 24, sq=True)              # 滷肉、三杯
        elif i == 4: leaves(x0, y0, '#c8c8a0', ['#e6e6c8', '#d8dcb0', '#c9d49a', '#f0f0d8'], '#f4f4e8')                           # 高麗菜
        elif i == 5: leaves(x0, y0, '#2a4a1a', ['#3f6a2a', '#4a7a2e', '#355e24', '#5a8a3a'], '#8aa86a')                           # 菠菜
        elif i == 6: blobs(x0, y0, '#7a4a1e', ['#a8642a', '#b8742a', '#c98a4a', '#8a5222'], 70, 16, 28, sq=True)               # 滷豆干
        elif i == 7: sticks(x0, y0, '#d8cca0', ['#f2ecd0', '#e8e0b8', '#f8f4e0', '#d8c890'], 10, 22, 4)                         # 豆芽、馬鈴薯絲
        elif i == 8: blobs(x0, y0, '#4a1a12', ['#6a2a1a', '#7a3220', '#5a2216', '#9a5a3a'], 200, 8, 20)                       # 紅燒肉
        elif i == 9: sticks(x0, y0, '#4a7a2a', ['#7aaa45', '#8aba55', '#6a9a3a', '#9ac865'], 18, 34, 9)                         # 四季豆
        elif i == 10: blobs(x0, y0, '#b8862a', ['#d8a83a', '#c9963a', '#e8c060', '#a8762a', '#f0e0a0'], 360, 5, 14)           # 咖哩、炒麵
        elif i == 11: blobs(x0, y0, '#e8dcc0', ['#f8f0d8', '#f0e4c4', '#e0c890', '#fff8e8'], 420, 5, 12)                       # 蒸蛋、炒蛋
        elif i == 13: blobs(x0, y0, '#7a4a1e', ['#a86a2e', '#b87a36', '#c98a42', '#8a5a26', '#d8a050'], 800, 3, 8)            # 排骨的炸衣（深一點）
        elif i == 14:                                                                                                       # 滷蛋切半
            d.rectangle([x0, y0, x0 + cs, y0 + cs], fill=hx('#5a3a1e'))
            for gx in range(3):
                for gy in range(3):
                    cx, cy = x0 + 42 + gx * 86, y0 + 42 + gy * 86; d.ellipse([cx - 38, cy - 30, cx + 38, cy + 30], fill=hx('#8a5a2a')); d.ellipse([cx - 30, cy - 23, cx + 30, cy + 23], fill=hx('#e8dcc0')); d.ellipse([cx - 14, cy - 12, cx + 14, cy + 12], fill=hx('#e8b040'))
        else: blobs(x0, y0, '#e8e4d8', ['#fbf8f0', '#f4f0e4', '#ffffff', '#e8e2d2'], 1400, 2, 5)                              # 白飯
    im = im.filter(ImageFilter.GaussianBlur(0.6)); os.makedirs(os.path.dirname(path), exist_ok=True); im.save(path)


def _cell(i):
    n = FOOD_CELLS; u0, v0 = (i % n) / n, 1 - (i // n + 1) / n; e = 0.004; return (u0 + e, v0 + e, u0 + 1 / n - e, v0 + 1 / n - e)


def _uvface(m, pts, uvs):
    bm = m.bm; uvl = bm.loops.layers.uv.verify(); f = bm.faces.new([bm.verts.new(g2b(*p)) for p in pts])
    for lp, uv in zip(f.loops, uvs): lp[uvl].uv = uv
    f.normal_update()
    return f


def food_dome(c, x0, x1, z0, z1, y, h, cell, nx=5, nz=4):
    """一盤菜的表面：x0..x1 × z0..z1 的格子，中間比邊緣高 h（一盤菜堆起來的樣子），每個格點再抖一點；UV＝貼圖集的第 cell 格"""
    rr = c.rng; u0, v0, u1, v1 = _cell(cell); m = c.foodm
    H_ = [[y + h * (1 - (2 * i / nx - 1) ** 2) * (1 - (2 * j / nz - 1) ** 2) + (rr.uniform(-0.004, 0.004) if 0 < i < nx and 0 < j < nz else 0.0) for j in range(nz + 1)] for i in range(nx + 1)]
    P = lambda i, j: (x0 + (x1 - x0) * i / nx, H_[i][j], z0 + (z1 - z0) * j / nz); U = lambda i, j: (u0 + (u1 - u0) * i / nx, v0 + (v1 - v0) * j / nz)
    for i in range(nx):
        for j in range(nz):
            f = _uvface(m, [P(i, j + 1), P(i + 1, j + 1), P(i + 1, j), P(i, j)], [U(i, j + 1), U(i + 1, j + 1), U(i + 1, j), U(i, j)])
            if f.normal.z < 0: f.normal_flip()


def _lathe_uv(c, prof, M_, cell, seg=10, bone=None):
    """沿本地 x 軸的旋轉體（prof＝[(x, 半徑)…]），M_＝本地 → 遊戲座標（函式）；UV：繞一圈＝u、沿長度＝v，貼第 cell 格"""
    u0, v0, u1, v1 = _cell(cell); m = c.foodm; L_ = prof[-1][0] - prof[0][0]
    ring = lambda k: [M_(prof[k][0], prof[k][1] * math.cos(2 * PI * a / seg), prof[k][1] * math.sin(2 * PI * a / seg)) for a in range(seg + 1)]
    R = [ring(k) for k in range(len(prof))]
    for k in range(len(prof) - 1):
        for a in range(seg):
            va, vb = v0 + (v1 - v0) * (prof[k][0] - prof[0][0]) / L_, v0 + (v1 - v0) * (prof[k + 1][0] - prof[0][0]) / L_
            ua, ub = u0 + (u1 - u0) * a / seg, u0 + (u1 - u0) * (a + 1) / seg
            _uvface(m, [R[k][a], R[k + 1][a], R[k + 1][a + 1], R[k][a + 1]], [(ua, va), (ua, vb), (ub, vb), (ub, va)])


def _disc_uv(c, cx, y, cz, a, b, yaw, h, cell, seg=14, rings=3):
    """扁的一片（雞排、排骨）：橢圓 a×b、中間隆起 h、邊緣往下 0.012；上面貼第 cell 格（平面投影）"""
    u0, v0, u1, v1 = _cell(cell); m = c.foodm; cy_, sy_ = math.cos(yaw), math.sin(yaw); rr = c.rng
    wob = [1 + rr.uniform(-0.12, 0.12) for _ in range(seg)]
    def P(r, k, dy=0.0):
        t = 2 * PI * k / seg; w_ = wob[k % seg]; lx, lz = a * r * w_ * math.cos(t), b * r * w_ * math.sin(t)
        return (cx + lx * cy_ - lz * sy_, y + dy + h * (1 - r * r), cz + lx * sy_ + lz * cy_), (u0 + (u1 - u0) * (0.5 + 0.5 * r * math.cos(t)), v0 + (v1 - v0) * (0.5 + 0.5 * r * math.sin(t)))
    rs = [k / rings for k in range(rings + 1)]
    for i in range(rings):
        for k in range(seg):
            p = [P(rs[i], k), P(rs[i + 1], k), P(rs[i + 1], k + 1), P(rs[i], k + 1)]
            f = _uvface(m, [q[0] for q in p], [q[1] for q in p])
            if f.normal.z < 0: f.normal_flip()
    for k in range(seg):   # 邊緣往下
        p, q = P(1.0, k), P(1.0, k + 1); pd, qd = P(1.0, k, -0.012), P(1.0, k + 1, -0.012)
        _uvface(m, [pd[0], qd[0], q[0], p[0]], [pd[1], qd[1], q[1], p[1]])


def fried_pile(c, kind, x, y, zc):
    """配菜櫃上層網架上的一堆炸物：leg＝炸雞腿（一頭粗一頭細＋露出來的骨頭）、cutlet＝雞排（大片）、chop＝排骨（扁長）；位置隨機錯開、有疊"""
    rr = c.rng
    if kind == 'leg':
        prof = [(0.0, 0.012), (0.02, 0.035), (0.05, 0.048), (0.085, 0.044), (0.12, 0.028), (0.14, 0.016), (0.15, 0.012)]
        for j in range(7):
            px, pz, yaw = x - 0.08 + (j % 2) * 0.14 + rr.uniform(-0.02, 0.02), zc - 0.27 + (j % 4) * 0.17 + rr.uniform(-0.03, 0.03), rr.uniform(-0.6, 0.6) + (PI if j % 2 else 0.0)
            py = y + 0.04 + (0.045 if j >= 4 else 0.0); cy_, sy_ = math.cos(yaw), math.sin(yaw); tilt = rr.uniform(-0.15, 0.15)
            M_ = lambda lx, ly, lz, px=px, py=py, pz=pz, cy_=cy_, sy_=sy_, tilt=tilt: (px + (lx - 0.07) * cy_ - lz * sy_, py + ly + (lx - 0.07) * tilt, pz + (lx - 0.07) * sy_ + lz * cy_)
            _lathe_uv(c, prof, M_, 12)
            b0, b1 = M_(0.15, 0.0, 0.0), M_(0.19, 0.0, 0.0); ccyl(c.vc, b0, b1, 0.008, '#efe6d0', seg=6); csph(c.vc, b1, 0.013, '#efe6d0', seg=6, rings=4)   # 骨頭
    else:
        n_, a, b, cell = (5, 0.1, 0.075, 0) if kind == 'cutlet' else (6, 0.095, 0.045, 13)
        for j in range(n_):
            px, pz = x - 0.07 + (j % 2) * 0.13 + rr.uniform(-0.02, 0.02), zc - 0.24 + (j % 3) * 0.2 + rr.uniform(-0.03, 0.03)
            _disc_uv(c, px, y + 0.02 + (j // 3) * 0.022, pz, a * rr.uniform(0.85, 1.1), b * rr.uniform(0.85, 1.1), rr.uniform(0, PI), 0.014, cell)


def rice_pot_cc0(c, x, y, z):
    """白飯保溫桶（CC0 的店，LAWWW2-C 驗收 ②）：圓的（32 邊）不鏽鋼桶身＋底下的不鏽鋼矮台＋圓蓋＋蓋子上的提把、兩側把手"""
    st = c.vm_steel
    c.steel.box(x - 0.35, x + 0.35, 0.0, y, z - 0.33, z + 0.33)                                                                  # 矮台
    clathe(st, [(0.0, 0.0), (0.26, 0.0), (0.275, 0.02), (0.275, 0.33), (0.268, 0.35), (0.0, 0.35)], x, y, z, '#c9ced2', seg=32)   # 桶身
    clathe(st, [(0.0, 0.0), (0.285, 0.0), (0.28, 0.025), (0.22, 0.06), (0.06, 0.085), (0.0, 0.085)], x, y + 0.35, z, '#c9ced2', seg=32)   # 蓋子
    yt = y + 0.35 + 0.085
    for dx in (-0.06, 0.06): ccyl(st, (x + dx, yt - 0.005, z), (x + dx, yt + 0.035, z), 0.008, '#c9ced2', seg=8)               # 蓋子提把的兩支腳
    ccyl(c.vc, (x - 0.07, yt + 0.035, z), (x + 0.07, yt + 0.035, z), 0.013, '#2b2b2b', seg=10)                                     # 提把（黑色膠握）
    for sz in (-1, 1): ccyl(st, (x - 0.05, y + 0.27, z + sz * 0.275), (x + 0.05, y + 0.27, z + sz * 0.3), 0.01, '#c9ced2', seg=8)   # 兩側把手


def cc0_setup(c):
    import cc0_kit as K
    sid = c.sid; M = c.M; P = f'l118_{sid}_'
    MX = {
        'wood_d': L.pbr(P + 'wood_dark', 'dark_wood', tile=0.8, target='#4a3426', contrast=0.8, maps=('diff', 'nor'), res=256, rough_value=0.5),
        'plastic_w': K.acg(P + 'plastic_w', 'Plastic006', vary=0.05, maps=('diff',), target='#eceae4', tile=0.5, rough_value=0.45, res=256),
        'box_w': K.acg(P + 'bento_box', 'Plastic006', vary=0.05, maps=('diff',), target='#f2f0ea', tile=0.5, rough_value=0.45, res=256),   # 便當盒：自己一個材質（一疊疊的盒子烘光照會烘成一條條黑的：物件 l118_self_box_w，bake_l118_shops.sh 的 --nolm 排除）
        'box_k': K.acg(P + 'bento_kraft', 'Cardboard001', maps=('diff',), target='#c9a46a', tile=0.4, rough_value=0.85, res=256),   # 牛皮紙便當盒（同上，物件 l118_<店>_box_k 不烘光照）
        'plastic_dk': K.acg(P + 'plastic_dk', 'Plastic006', vary=0.05, maps=('diff',), target='#2c2e31', tile=0.5, rough_value=0.45, res=256),
        'plastic_y': K.acg(P + 'plastic_y', 'Plastic006', vary=0.05, maps=('diff',), target='#ecbe20', tile=0.5, rough_value=0.4, res=256),
        'plastic_red': K.acg(P + 'plastic_red', 'Plastic006', vary=0.05, maps=('diff',), target='#c8281c', tile=0.5, rough_value=0.4, res=256),
        'plastic_blue': K.acg(P + 'plastic_blue', 'Plastic006', vary=0.05, maps=('diff',), target='#2a5fb8', tile=0.5, rough_value=0.4, res=256),
        'steel': K.acg(P + 'steel', 'Metal009', target='#b6b7b5', tile=1.0, metal=0.4, rough_value=0.3),
        'steel_d': K.acg(P + 'steel_d', 'Metal009', maps=('diff',), target='#5f605f', tile=1.0, metal=0.4, rough_value=0.4, res=256),
        'blackmetal': K.acg(P + 'blackmetal', 'Metal009', maps=('diff',), target='#2e2c2a', tile=1.0, metal=0.3, rough_value=0.45, res=256),
        'alu': K.acg(P + 'alu', 'Metal009', maps=('diff',), target='#8f969b', tile=1.0, metal=0.4, rough_value=0.35, res=256),
        'brass': K.acg(P + 'brass', 'Metal009', maps=('diff',), target='#b8860a', tile=0.6, metal=0.5, rough_value=0.35, res=256),
        'mat': K.acg(P + 'mat', 'Rubber004', maps=('diff', 'nor'), target='#8a1f1a', tile=0.4, rough_value=0.9, res=256),
        'mat_l': K.acg(P + 'mat_l', 'Fabric036', maps=('diff',), target='#a52a22', tile=0.3, rough_value=0.9, res=256),
        'paper': K.acg(P + 'paper', 'Paper001', maps=('diff',), target='#d8b888', tile=0.3, rough_value=0.85, res=256),
        'cardboard': K.acg(P + 'cardboard', 'Cardboard001', maps=('diff',), target='#c8a878', tile=0.6, rough_value=0.85, res=256),
        'tile_w': K.acg(P + 'kitchen_tile', 'Tiles036', target='#dcd8cf', tile=0.6, rough_value=0.3),
        'tile_f': K.acg(P + 'kitchen_floor', 'Tiles036', maps=('diff',), target='#8f8c86', tile=0.6, rough_value=0.5, res=256),
        'paving': K.acg(P + 'paving', 'Concrete034', maps=('diff', 'nor'), target='#9a9893', tile=1.5, rough_value=0.85, res=256),
    }
    for k_, col, mat_ in (('ceil', c.S.get('ceil', '#f2efe8'), 'ceiling'), ('kceil', '#cfcbc3', 'kceiling')):   # 天花板：灰泥（雲斑壓到 1.5%：LAWWW2-C 11-13，0.04 在暖色店還看得出來）、單面朝下（同原本）
        M[k_].name = P + mat_ + '_flat_unused'   # 原本的平塗材質讓出名字（測試照 …_ceiling 找天花板；不讓的話新的會變成 …_ceiling.001）
        m_ = K.acg(P + mat_, 'Plaster001', vary=0.015, maps=('diff',), target=col, tile=2.0, rough_value=0.95, res=256); m_.use_backface_culling = True; M[k_] = m_
    M['steel'] = MX['steel']; c.MX = MX
    c.cc0m = meshes = {}; c._vc0, c._vm0, c._steel0 = c.vc, c.vm, c.steel
    def mx(k, name=None):
        name = name or P + k
        if name not in meshes: meshes[name] = Mesh(name, MX[k])
        return meshes[name]
    R = CC0_ROUTE[sid]
    c.vc = K.Route(c.vc, {col: (lambda k=k: mx(k)) for col, k in R.items()})
    c.vm = K.Route(K.AsTex(mx(CC0_VM.get(sid, 'blackmetal'))), {col: (lambda k=k: mx(k)) for col, k in R.items() if k in ('steel', 'steel_d', 'plastic_dk', 'brass')})
    c.steel = mx('steel'); c.vm_steel = K.AsTex(mx('steel'))   # vm_steel：圓柱、車床零件直接放進不鏽鋼材質組（rice_pot_cc0）
    if sid in CEIL4:   # 貼天花板的零件（燈盤框）：CEIL_ 開頭（ceilHide 照舊藏得到）
        c.extra['ceil_vc'] = K.Route(CMesh(f'CEIL_l118_{sid}_vcrest', M['vc']), {col: (lambda k=k: mx(k, f'CEIL_l118_{sid}_vc' if k == 'plastic_w' else f'CEIL_l118_{sid}_{k}')) for col, k in R.items()})   # 燈盤框（白）照舊叫 CEIL_…_vc（測試、ceilHide 照名字找）
    _wg = c.wg; cc0mats = set(MX.values()) | {M['ceil'], M['kceil']}
    def wg(side, key, mat, cm=False):
        if not cm: return _wg(side, key + '_cc0', mat) if mat in cc0mats else _wg(side, key, mat)   # 材質組的牆上網格（不鏽鋼出菜台、廚房天花板）：'_' 開頭的 key＝盒狀 UV
        base = _wg(side, key, mat, cm)
        if mat is M['vcm']: return K.Route(K.AsTex(_wg(side, key + '_alu', MX['alu'])), {})            # 店面的鋁框
        return K.Route(base, {col: (lambda k=k: _wg(side, key + '_' + k, MX[k])) for col, k in R.items()})
    c.wg = wg
    c.ph = K.PH(c.root, P + 'ph_'); c.CH = CC0_CHAIRS
    if sid in CC0_FOOD:   # 菜色貼圖集（程式畫，每次建模重畫到 textures/gen：.gitignore）＋菜面網格（自己的 UV，不做盒狀 UV）
        food_atlas(os.path.join(GEN, 'l118_food_atlas.png')); c.foodm = Mesh(P + 'food', img_mat(P + 'food', 'l118_food_atlas.png', rough=0.5)); c.cc0raw = [c.foodm]


def cc0_post(c):
    """建完以後：天花板的輕鋼架（ceil_grid 的平塗網格）換鋁材質組"""
    g = c.extra.pop('cgrid', None)
    if g is not None: g.mat = c.MX['alu']; g.tile = 1.0; c.cc0m[g.name] = g


def build(sid):
    c = Shop(sid); c.extra = {}
    if sid in CC0_SHOPS: cc0_setup(c)
    BUILD[sid](c)
    if sid in CC0_SHOPS: cc0_post(c)
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
