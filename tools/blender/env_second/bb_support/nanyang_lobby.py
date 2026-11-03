"""南洋戲院（新生南路的二輪戲院，AA_615 第 3 節）一樓大廳 → GLB。BB（帳號 A）2026-11-03 協助 LAWWW2（使用者：「lawww2在忙 你和bb cc協助建模」）。
  /opt/blenv/bin/python tools/blender/env_second/bb_support/nanyang_lobby.py [-- --out assets/models/env/second_ai/nanyang_lobby.glb]

參考（台北的老二輪戲院，不仿特定一家；D77 不放真實店名、商標、真實電影海報）：
  老大樓一樓、磨石子地、日光燈輕鋼架天花板、售票口（玻璃窗＋對講孔＋找錢凹槽）上面掛場次板、
  爆米花櫃檯（玻璃爆米花機亮著、價目燈箱）、海報牆（每張一盞小投射燈）、紅色人造皮長椅、
  往影廳的雙開門兩邊掛紅絨布、門口兩支銅柱拉紅絨繩、牆下半截淺色木腰板（D112：地板不用深色木頭；腰板用淺色）。
尺寸（實際二輪戲院大廳常見 12～16 m 寬）：W 14 × D 10 × H 4.2 m。
座標＝遊戲 nanyang_lobby 區域座標（room 風格，和 cvs_interior 相同的約定）：x 東、y 上、z 南；店面（新生南路）在 z=+5，
  大門在 x=0（寬 3 m 玻璃門）；影廳門在後牆 z=-5、x=+3.2（寬 2.2 m）。
建議互動點（給 LAWWW2 整合；導航阻擋照下面的 BLOCKS）：
  售票口 (-5.0, -0.2)、爆米花櫃檯 (-2.0, -2.9)（Alison 站櫃檯後 (-2.0, -4.3)）、進影廳 (3.2, -4.1)、離開 (0, 4.3)、長椅坐下 (6.2, 1.2)／(6.2, -0.4)。
會淡出的牆：WALL_<front|back|left|right>（自訂屬性 dir＝往室內的法線；遊戲 attachRoomGLB）。
"""
import ast, json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from PIL import Image, ImageDraw, ImageFont, ImageFilter   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/nanyang_lobby.glb'))
TMP = os.path.join(L.ROOT, 'tools/blender/env_second/textures/gen/nanyang'); os.makedirs(TMP, exist_ok=True)
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'

W, D, H = 14.0, 10.0, 4.2
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0]}
random.seed(615)
B.reset(texres=512)
root = B.group('nanyang_lobby', props={'kind': 'nanyang_lobby', 'w': W, 'd': D, 'h': H})
sc = bpy.context.scene

# ---------- 借 LAWWW2 bg_cinema.py 的虛構海報畫法（只讀，不改它） ----------
_src = open(os.path.join(os.path.dirname(HERE), 'bg_cinema.py'), encoding='utf-8').read()
_fn = next(n for n in ast.parse(_src).body if isinstance(n, ast.FunctionDef) and n.name == 'poster_tex')
_ns = {'Image': Image, 'ImageDraw': ImageDraw, 'ImageFilter': ImageFilter, 'random': random, 'math': math}
exec(compile(ast.Module(body=[_fn], type_ignores=[]), 'bg_cinema.poster_tex', 'exec'), _ns)
poster_tex = _ns['poster_tex']


def img_mat(name, path, emit=0.0, rough=0.7):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt = mt.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path); nt.links.new(tx.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = rough
    if emit: nt.links.new(tx.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = emit
    return mt


def uvquad(name, p0, p1, p2, p3, mat, parent=None, props=None):
    bm = bmesh.new(); vs = [bm.verts.new(g2b(*p)) for p in (p0, p1, p2, p3)]; f = bm.faces.new(vs)
    ul = bm.loops.layers.uv.new()
    for lp, t in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[ul].uv = t
    return B.mesh_obj(name, bm, mat, parent or root, props)


def font(sz): return ImageFont.truetype(FONT, sz)


# ---------- 程式畫的字（場次板、價目燈箱、廳號、海報）----------
def board_tex():
    p = os.path.join(TMP, 'schedule.png'); im = Image.new('RGB', (1024, 384), (24, 26, 30)); d = ImageDraw.Draw(im)
    d.rectangle([8, 8, 1015, 375], outline=(150, 120, 70), width=6)
    d.text((40, 26), '今日場次', font=font(64), fill=(250, 214, 120))
    d.text((640, 40), '一票兩片　150 元', font=font(46), fill=(240, 236, 226))
    for i, t in enumerate(('12:00', '15:00', '18:30', '21:30')):
        x = 40 + i * 245; d.rounded_rectangle([x, 140, x + 220, 250], 10, fill=(44, 46, 52)); d.text((x + 30, 158), t, font=font(64), fill=(255, 246, 220))
        for k in range(2): d.line([(x + 20, 280 + k * 34), (x + 200 - (k * 40), 280 + k * 34)], fill=(130, 130, 140), width=8)   # 片名：遠看是線、不寫真實片名
    im.save(p); return p


def menu_tex():
    p = os.path.join(TMP, 'menu.png'); im = Image.new('RGB', (1024, 320), (252, 246, 226)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 1023, 70], fill=(196, 40, 40)); d.text((30, 6), '爆米花　飲料', font=font(52), fill=(255, 244, 220))
    items = [('爆米花（小）', '50'), ('爆米花（大）', '80'), ('焦糖口味', '+10'), ('可樂／汽水', '40'), ('熱茶', '30'), ('套餐（大＋飲料）', '100')]
    for i, (n, pr) in enumerate(items):
        x = 40 + (i % 3) * 330; y = 100 + (i // 3) * 104
        d.text((x, y), n, font=font(40), fill=(60, 40, 30)); d.text((x + 250, y + 44), pr, font=font(40), fill=(196, 40, 40))
    im.save(p); return p


def hall_tex():
    p = os.path.join(TMP, 'hall1.png'); im = Image.new('RGB', (512, 256), (30, 22, 20)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([6, 6, 505, 249], 18, outline=(200, 160, 90), width=6); d.text((150, 50), '１廳', font=font(130), fill=(240, 206, 130)); im.save(p); return p


def sign_tex():
    p = os.path.join(TMP, 'notice.png'); im = Image.new('RGB', (512, 680), (246, 240, 226)); d = ImageDraw.Draw(im)
    d.text((40, 40), '觀影須知', font=font(60), fill=(150, 30, 30))
    for i, t in enumerate(('請勿攜帶外食', '開演後請保持安靜', '手機請調靜音', '散場請由出口離開', '中場休息 10 分鐘')):
        d.text((44, 150 + i * 92), '．' + t, font=font(38), fill=(50, 44, 40))
    im.save(p); return p


# ---------- 材質 ----------
def glowmat(name, hexcol, k):
    c = B.srgb(hexcol); return L.flat(name, hexcol, rough=0.4, emit=tuple(v * k for v in c[:3]))

m_floor = L.pbr('ny_terrazzo', 'terrazzo_tiles', tile=1.2, target='#cfc7b8', normal=0.3, maps=('diff', 'nor'), rough_value=0.35)
m_wall = L.pbr('ny_plaster', 'painted_plaster_wall', tile=2.5, target='#e9dcc4', normal=0.25, maps=('diff', 'nor'))
m_wains = L.pbr('ny_wainscot', 'wood_table_001', tile=1.6, target='#cfae84', normal=0.2, maps=('diff', 'nor'), rough_value=0.4)   # 淺色木腰板
m_ceil = L.pbr('ny_ceiling', 'ceiling_interior', tile=1.2, target='#ecebe6', normal=0.2, maps=('diff',))
m_leather = L.pbr('ny_leather', 'fabric_leather_02', tile=0.6, target='#9c2a26', normal=0.5, maps=('diff', 'nor'), rough_value=0.5)
m_velvet = L.flat('ny_velvet', '#7a1418', rough=0.92)
m_brass = L.flat('ny_brass', '#b58a43', rough=0.32, metal=0.45)
m_steel = L.flat('ny_steel', '#a9adb2', rough=0.35, metal=0.4)
m_dark = L.flat('ny_darkmetal', '#2b2b2e', rough=0.5, metal=0.3)
m_counter = L.pbr('ny_counter', 'granite_tile_03', tile=0.8, target='#d8d2c8', normal=0.3, maps=('diff', 'nor'), rough_value=0.3)
m_red = L.flat('ny_redpanel', '#b8312c', rough=0.45)
m_cream = L.flat('ny_cream', '#f1e7d2', rough=0.6)
m_glass = L.flat('ny_glass', '#cfe2ea', rough=0.05, alpha=0.28)
m_tube = glowmat('ny_tube', '#fffaf0', 3.0)
m_lamp = glowmat('ny_lampwarm', '#ffe2b0', 4.0)
m_popglow = glowmat('ny_popglow', '#ffd27a', 2.2)
m_pop = L.vc_material('ny_popcorn', rough=0.7)
m_door = L.flat('ny_door', '#5a2a22', rough=0.55)
m_board = img_mat('ny_board', board_tex(), emit=0.6, rough=0.5)
m_menu = img_mat('ny_menu', menu_tex(), emit=1.6, rough=0.4)
m_hall = img_mat('ny_hall', hall_tex(), emit=0.8, rough=0.5)
m_notice = img_mat('ny_notice', sign_tex(), rough=0.8)

# ---------- 地板、天花板 ----------
Mesh('FLOOR', m_floor, tile=1.2).box(X0, X1, -0.05, 0.0, Z0, Z1).finish(root)
c = Mesh('CEILING', m_ceil, tile=1.2)
c.box(X0, X1, H, H + 0.04, Z0, Z1); c.finish(root, props={'ceiling': 1})
grid = Mesh('CEIL_GRID', m_steel)
for x in [X0 + 0.6 * i for i in range(1, int(W / 0.6))]: grid.box(x - 0.012, x + 0.012, H - 0.02, H, Z0, Z1)
for z in [Z0 + 0.6 * i for i in range(1, int(D / 0.6))]: grid.box(X0, X1, H - 0.02, H, z - 0.012, z + 0.012)
grid.finish(root)
tubes = Mesh('CEIL_LIGHT', m_tube)
for x in (-4.5, -1.5, 1.5, 4.5):
    for z in (-3.0, 0.0, 3.0): tubes.rbox(x - 0.55, x + 0.55, H - 0.06, H - 0.02, z - 0.28, z + 0.28, r=0.01, seg=1)
tubes.finish(root)


# ---------- 牆（四面，各自一組，可淡出）----------
def wall(name, d, quads, wains):
    g = B.group(f'WALL_{d}_{name}', root, props={'dir': DIRS[d]})
    m = Mesh(f'WALL_{d}_{name}_plaster', m_wall, tile=2.5)
    for q in quads: m.box(*q)
    m.finish(g)
    w = Mesh(f'WALL_{d}_{name}_wains', m_wains, tile=1.0)
    for q in wains: w.rbox(*q, r=0.008, seg=1)
    w.finish(g)
    return g


T = 0.2
# 後牆（z=-5）：影廳門洞 x 2.1..4.3、高 2.6
wall('back', 'back', [(X0, 2.1, 0, H, Z0 - T, Z0), (4.3, X1, 0, H, Z0 - T, Z0), (2.1, 4.3, 2.6, H, Z0 - T, Z0)],
     [(X0, 2.1, 0, 1.05, Z0, Z0 + 0.03), (4.3, X1, 0, 1.05, Z0, Z0 + 0.03)])
# 前牆（z=+5）：大門 x -1.5..1.5 高 2.8，兩邊大玻璃 x -6..-2.2、2.2..6（窗台 0.6、窗頂 2.9）
fq = [(X0, -6.0, 0, H, Z1, Z1 + T), (6.0, X1, 0, H, Z1, Z1 + T), (-2.2, -1.5, 0, H, Z1, Z1 + T), (1.5, 2.2, 0, H, Z1, Z1 + T),
      (-6.0, -2.2, 0, 0.6, Z1, Z1 + T), (2.2, 6.0, 0, 0.6, Z1, Z1 + T), (-6.0, 6.0, 2.9, H, Z1, Z1 + T)]
wall('front', 'front', fq, [])
wall('left', 'left', [(X0 - T, X0, 0, H, Z0, Z1)], [(X0, X0 + 0.03, 0, 1.05, Z0, Z1)])
wall('right', 'right', [(X1, X1 + T, 0, H, Z0, Z1)], [(X1 - 0.03, X1, 0, 1.05, Z0, Z1)])
# 腰板上緣的木線、踢腳
trim = Mesh('TRIM', m_wains, tile=1.0)
for (x0, x1, z0, z1) in ((X0, 2.1, Z0, Z0 + 0.05), (4.3, X1, Z0, Z0 + 0.05), (X0, X0 + 0.05, Z0, Z1), (X1 - 0.05, X1, Z0, Z1)):
    trim.rbox(x0, x1, 1.04, 1.1, z0, z1, r=0.01, seg=1)
trim.finish(root)

# 大門與玻璃（鋁框）
fr = Mesh('FRONT_FRAME', m_steel)
for x in (-6.0, -4.1, -2.2, -1.5, 0.0, 1.5, 2.2, 4.1, 6.0): fr.box(x - 0.03, x + 0.03, 0 if abs(x) <= 1.5 else 0.6, 2.9, Z1 - 0.02, Z1 + 0.04)
for (x0, x1, y) in ((-6.0, -2.2, 0.6), (-6.0, -2.2, 2.9), (2.2, 6.0, 0.6), (2.2, 6.0, 2.9), (-1.5, 1.5, 2.8)): fr.box(x0, x1, y - 0.03, y + 0.03, Z1 - 0.02, Z1 + 0.04)
for x in (-0.75, 0.75): fr.box(x - 0.012, x + 0.012, 0.95, 1.15, Z1 - 0.06, Z1 - 0.02)   # 門把
fr.finish(root)
gl = Mesh('FRONT_GLASS', m_glass)
gl.box(-6.0, -2.2, 0.6, 2.9, Z1 + 0.005, Z1 + 0.015); gl.box(2.2, 6.0, 0.6, 2.9, Z1 + 0.005, Z1 + 0.015); gl.box(-1.5, 1.5, 0.0, 2.8, Z1 + 0.005, Z1 + 0.015)
gl.finish(root, props={'glass': 1})
mat = Mesh('DOORMAT', L.flat('ny_mat', '#5a4c42', rough=0.95)); mat.rbox(-1.3, 1.3, 0.0, 0.015, Z1 - 1.2, Z1 - 0.1, r=0.006, seg=1); mat.finish(root)

# ---------- 左：售票口（x -7..-4.4, z -2..+1.6）----------
bx0, bx1, bz0, bz1 = -7.0, -4.4, -2.0, 1.6
bo = Mesh('BOOTH', m_cream, tile=1.0)
bo.rbox(-4.6, bx1, 0, 1.05, bz0, bz1, r=0.02, seg=2)          # 下半截
bo.rbox(-4.6, bx1, 2.35, 2.7, bz0, bz1, r=0.02, seg=2)        # 窗上方的楣板
bo.rbox(bx0, bx1, 2.7, 2.78, bz0, bz1, r=0.01, seg=1)          # 頂蓋
for z in (bz0, -0.2, bz1): bo.rbox(-4.6, bx1, 1.05, 2.35, z - 0.05, z + 0.05, r=0.01, seg=1)   # 窗框直條
bo.rbox(bx0, -4.6, 0, 2.78, bz0 - 0.05, bz0 + 0.05, r=0.01, seg=1); bo.rbox(bx0, -4.6, 0, 2.78, bz1 - 0.05, bz1 + 0.05, r=0.01, seg=1)
bo.finish(root)
red = Mesh('BOOTH_STRIPE', m_red); red.rbox(-4.42, -4.36, 0.82, 0.92, bz0, bz1, r=0.005, seg=1); red.finish(root)
ctop = Mesh('BOOTH_SILL', m_counter, tile=0.8); ctop.rbox(-4.75, -4.2, 1.05, 1.1, bz0 + 0.05, bz1 - 0.05, r=0.01, seg=2); ctop.finish(root)
bg = Mesh('BOOTH_GLASS', m_glass)
for (z0, z1) in ((bz0 + 0.05, -0.25), (-0.15, bz1 - 0.05)): bg.box(-4.5, -4.48, 1.1, 2.35, z0, z1)
bg.finish(root, props={'glass': 1})
talk = Mesh('BOOTH_TALK', m_steel)
talk.cyl((-4.47, 1.55, -1.1), (-4.45, 1.55, -1.1), 0.07, seg=18); talk.cyl((-4.47, 1.55, 0.7), (-4.45, 1.55, 0.7), 0.07, seg=18)
talk.rbox(-4.6, -4.25, 1.1, 1.16, -1.3, -0.9, r=0.01, seg=1); talk.rbox(-4.6, -4.25, 1.1, 1.16, 0.5, 0.9, r=0.01, seg=1)   # 找錢的凹槽
talk.finish(root)
# 窗後的桌燈、票捲、小電腦
inn = CMesh('BOOTH_INSIDE', L.vc_material('ny_booth_vc', rough=0.6))
inn.crbox(-6.9, -4.62, 0.0, 0.85, bz0 + 0.1, bz1 - 0.1, '#7c6a58', r=0.02)
inn.crbox(-5.6, -5.2, 0.85, 1.1, -0.7, -0.2, '#3a3a40', r=0.02)
inn.crbox(-5.9, -5.7, 0.85, 1.02, 0.4, 0.62, '#e8e0d0', r=0.03)
inn.finish(root)
lamp = Mesh('BOOTH_LAMP', m_dark); lamp.cyl((-5.6, 0.85, 1.0), (-5.6, 1.25, 1.0), 0.012, seg=10); lamp.finish(root)
ls = Mesh('BOOTH_LAMPSHADE', m_lamp); ls.add_bm(L.lathe([(0.0, 0.0), (0.11, 0.0), (0.07, 0.12), (0.02, 0.13)], seg=16), Matrix.Translation(g2b(-5.6, 1.2, 1.0))); ls.finish(root)
uvquad('SCHEDULE_BOARD', (-4.36, 2.36, bz1 - 0.05), (-4.36, 2.36, bz0 + 0.05), (-4.36, 2.69, bz0 + 0.05), (-4.36, 2.69, bz1 - 0.05), m_board)

# ---------- 後左：爆米花櫃檯（x -4.0..0, z -5..-3.4）----------
ct = Mesh('CONC_BODY', m_red, tile=1.0); ct.rbox(-4.0, 0.0, 0, 1.0, -3.95, -3.35, r=0.03, seg=2); ct.finish(root)
ck = Mesh('CONC_KICK', m_dark); ck.rbox(-3.95, -0.05, 0, 0.1, -3.4, -3.32, r=0.01, seg=1); ck.finish(root)
cto = Mesh('CONC_TOP', m_counter, tile=0.8); cto.rbox(-4.05, 0.05, 1.0, 1.05, -4.0, -3.3, r=0.012, seg=2); cto.finish(root)
def front_tex():
    p = os.path.join(TMP, 'conc_front.png'); im = Image.new('RGB', (768, 360), (252, 240, 210)); d = ImageDraw.Draw(im)
    for x in range(0, 768, 64): d.rectangle([x, 0, x + 31, 360], fill=(214, 52, 44))
    d.rounded_rectangle([150, 40, 618, 320], 40, fill=(252, 244, 222)); r_ = random.Random(9)
    for _ in range(90):
        x, y, rr = r_.randint(230, 540), r_.randint(70, 200), r_.randint(10, 20); d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=(250, 226, 150), outline=(220, 180, 100))
    d.polygon([(250, 190), (520, 190), (490, 300), (280, 300)], fill=(214, 52, 44)); d.text((300, 212), 'POPCORN', font=font(48), fill=(255, 246, 226))
    im.save(p); return p
m_front = img_mat('ny_concfront', front_tex(), emit=0.5, rough=0.5)
uvquad('CONC_FRONT_ART', (-3.85, 0.22, -3.34), (-2.35, 0.22, -3.34), (-2.35, 0.92, -3.34), (-3.85, 0.92, -3.34), m_front)
back = Mesh('CONC_BACK', m_cream, tile=1.0); back.rbox(-4.0, 0.0, 0, 0.95, -5.0, -4.55, r=0.02, seg=2); back.rbox(-4.0, 0.0, 0.95, 1.0, -5.0, -4.5, r=0.01, seg=1); back.finish(root)
# 爆米花機（不鏽鋼底座＋四面玻璃＋頂上的鍋＋裡面堆滿的爆米花）
pm = Mesh('POPMACHINE_FRAME', m_steel)
px, pz = -3.1, -3.65
pm.rbox(px - 0.36, px + 0.36, 1.05, 1.3, pz - 0.28, pz + 0.28, r=0.02, seg=2)
for sx in (-1, 1):
    for sz in (-1, 1): pm.box(px + sx * 0.34 - 0.015, px + sx * 0.34 + 0.015, 1.3, 2.0, pz + sz * 0.26 - 0.015, pz + sz * 0.26 + 0.015)
pm.rbox(px - 0.37, px + 0.37, 2.0, 2.1, pz - 0.29, pz + 0.29, r=0.02, seg=2)
pm.cyl((px, 1.8, pz), (px, 1.95, pz), 0.12, seg=18); pm.cyl((px, 1.95, pz), (px, 2.0, pz), 0.02, seg=8)
pm.finish(root)
pmg = Mesh('POPMACHINE_GLASS', m_glass); pmg.box(px - 0.335, px + 0.335, 1.3, 2.0, pz - 0.255, pz + 0.255); pmg.finish(root, props={'glass': 1})
glow = Mesh('POPMACHINE_GLOW', m_popglow); glow.box(px - 0.3, px + 0.3, 1.97, 1.99, pz - 0.22, pz + 0.22); glow.finish(root)
pc = CMesh('POPCORN', m_pop)
rng = random.Random(7)
for _ in range(420):
    x = px + rng.uniform(-0.3, 0.3); z = pz + rng.uniform(-0.22, 0.22); y = 1.31 + abs(rng.gauss(0, 0.09)) * (1.4 - abs(x - px) * 2)
    pc.ell((x, y, z), 0.022, 0.018, 0.02, seg=6, rings=4)
pc.paint(list(pc.bm.faces), '#f3dd9a'); pc.finish(root)
# 杯子塔、紙桶、收銀機、飲料機
cup = CMesh('CONC_ITEMS', L.vc_material('ny_items_vc', rough=0.5))
for i in range(6):
    x = -1.9 + i * 0.16
    cup.add_bm(L.lathe([(0.0, 0.0), (0.045, 0.0), (0.06, 0.16), (0.0, 0.16)], seg=12), Matrix.Translation(g2b(x, 1.05, -3.85)))
cup.paint(list(cup.bm.faces), '#e9e2d6')
cup.crbox(-0.9, -0.45, 1.05, 1.3, -3.85, -3.55, '#2e3036', r=0.03); cup.crbox(-0.85, -0.5, 1.3, 1.36, -3.75, -3.55, '#4a4d55', r=0.01)
cup.crbox(-3.8, -3.0, 0.95, 1.75, -4.95, -4.6, '#c9ccd0', r=0.03)       # 後檯的飲料機
for k in range(4): cup.crbox(-3.72 + k * 0.19, -3.6 + k * 0.19, 1.2, 1.5, -4.62, -4.58, '#cf3c34' if k % 2 == 0 else '#3a6fb0', r=0.01)
cup.finish(root)
for k in range(5):   # 紙桶（紅白條紋）
    x = -2.6 + (k % 3) * 0.22; y = 0.95 + (k // 3) * 0.2
    bk = Mesh(f'BUCKET_{k}', m_red if k % 2 == 0 else m_cream); bk.add_bm(L.lathe([(0.0, 0.0), (0.07, 0.0), (0.095, 0.2), (0.0, 0.2)], seg=14), Matrix.Translation(g2b(x, y, -4.8))); bk.finish(root)
# 價目燈箱（吊在櫃檯上方）
lb = Mesh('MENU_BOX', m_dark); lb.rbox(-4.0, 0.0, 2.55, 3.35, -4.98, -4.82, r=0.02, seg=2); lb.cyl((-3.6, 3.35, -4.9), (-3.6, H, -4.9), 0.008); lb.cyl((-0.4, 3.35, -4.9), (-0.4, H, -4.9), 0.008); lb.finish(root)
uvquad('MENU_FACE', (-3.95, 2.6, -4.81), (-0.05, 2.6, -4.81), (-0.05, 3.3, -4.81), (-3.95, 3.3, -4.81), m_menu)

# ---------- 後右：影廳門、紅絨布、銅柱 ----------
dfr = Mesh('HALL_DOORFRAME', m_brass)
dfr.rbox(2.0, 2.12, 0, 2.7, Z0 - 0.02, Z0 + 0.08, r=0.01, seg=1); dfr.rbox(4.28, 4.4, 0, 2.7, Z0 - 0.02, Z0 + 0.08, r=0.01, seg=1); dfr.rbox(2.0, 4.4, 2.6, 2.72, Z0 - 0.02, Z0 + 0.08, r=0.01, seg=1)
dfr.finish(root)
dr = Mesh('HALL_DOORS', m_door)
dr.rbox(2.13, 3.18, 0.0, 2.58, Z0 - 0.06, Z0 - 0.0, r=0.012, seg=2); dr.rbox(3.22, 4.27, 0.0, 2.58, Z0 - 0.06, Z0 - 0.0, r=0.012, seg=2)
dr.finish(root)
win = Mesh('HALL_DOOR_PORTHOLE', m_dark)
for x in (2.65, 3.75): win.cyl((x, 1.65, Z0 + 0.0), (x, 1.65, Z0 + 0.01), 0.14, seg=20)
win.finish(root)
pull = Mesh('HALL_DOOR_PULL', m_brass)
for x in (3.08, 3.32): pull.cyl((x, 0.85, Z0 + 0.06), (x, 1.35, Z0 + 0.06), 0.014, seg=10)
pull.finish(root)
uvquad('HALL_SIGN', (2.6, 2.78, Z0 + 0.01), (3.8, 2.78, Z0 + 0.01), (3.8, 3.38, Z0 + 0.01), (2.6, 3.38, Z0 + 0.01), m_hall)
cur = Mesh('HALL_CURTAIN', m_velvet)
for (cx, sgn) in ((1.85, -1), (4.55, 1)):   # 綁起來的紅絨布：上寬下窄、有褶
    for k in range(7):
        x = cx + sgn * k * 0.045; top = 0.32 - k * 0.02
        cur.add_bm(L.lathe([(0.0, 0.0), (0.05, 0.0), (0.07, 1.2), (0.05 + top * 0.1, 2.75), (0.0, 2.75)], seg=8), Matrix.Translation(g2b(x, 0.0, Z0 + 0.12)))
cur.finish(root, smooth=True)
rod = Mesh('HALL_CURTAIN_ROD', m_brass); rod.cyl((1.4, 2.8, Z0 + 0.12), (5.0, 2.8, Z0 + 0.12), 0.02, seg=10); rod.finish(root)
post = Mesh('STANCHIONS', m_brass)
for x in (1.9, 4.5):
    post.add_bm(L.lathe([(0.0, 0.0), (0.16, 0.0), (0.16, 0.03), (0.03, 0.06), (0.022, 0.95), (0.04, 0.98), (0.0, 1.02)], seg=18), Matrix.Translation(g2b(x, 0.0, -3.9)))
post.finish(root, smooth=True)
rope = Mesh('VELVET_ROPE', m_velvet)
pts = [(1.9 + (4.5 - 1.9) * t, 0.93 - 0.22 * math.sin(math.pi * t), -3.9) for t in [i / 16 for i in range(17)]]
for a, b in zip(pts, pts[1:]): rope.cyl(a, b, 0.022, seg=8)
rope.finish(root, smooth=True)

# ---------- 右牆：海報、投射燈、長椅 ----------
kinds = ('sea', 'train', 'umbrella', 'house', 'bike')
for i, k in enumerate(kinds):
    z = -3.4 + i * 1.55; p = os.path.join(TMP, f'poster_{k}.png')
    if not os.path.exists(p): poster_tex(p, k)
    mpo = img_mat(f'ny_poster_{k}', p, emit=0.15, rough=0.5)
    fr2 = Mesh(f'POSTER_FRAME_{i}', m_brass); fr2.rbox(X1 - 0.06, X1 - 0.02, 1.32, 2.62, z - 0.48, z + 0.48, r=0.008, seg=1); fr2.finish(root)
    uvquad(f'POSTER_{i}', (X1 - 0.065, 1.36, z + 0.44), (X1 - 0.065, 1.36, z - 0.44), (X1 - 0.065, 2.58, z - 0.44), (X1 - 0.065, 2.58, z + 0.44), mpo)
    sp = Mesh(f'POSTER_SPOT_{i}', m_dark); sp.cyl((X1 - 0.02, 3.05, z), (X1 - 0.35, 2.9, z), 0.012); sp.cyl((X1 - 0.35, 2.92, z), (X1 - 0.45, 2.82, z), 0.05, seg=14); sp.finish(root)
    sl = Mesh(f'POSTER_SPOTLENS_{i}', m_lamp); sl.cyl((X1 - 0.45, 2.82, z), (X1 - 0.47, 2.8, z), 0.042, seg=14); sl.finish(root)
bench_s = Mesh('BENCH_SEAT', m_leather, tile=0.6)
bench_m = Mesh('BENCH_LEGS', m_steel)
for (z0, z1) in ((-0.2, 1.9), (-2.4, -0.6)):
    bench_s.rbox(X1 - 1.05, X1 - 0.5, 0.38, 0.5, z0, z1, r=0.05, seg=3)          # 坐墊
    bench_s.rbox(X1 - 0.6, X1 - 0.45, 0.48, 0.98, z0, z1, r=0.05, seg=3)          # 靠背
    for zz in (z0 + 0.12, z1 - 0.12):
        bench_m.box(X1 - 1.0, X1 - 0.55, 0.0, 0.38, zz - 0.02, zz + 0.02); bench_m.box(X1 - 1.0, X1 - 0.55, 0.0, 0.03, zz - 0.05, zz + 0.05)
bench_s.finish(root, smooth=True); bench_m.finish(root)
uvquad('NOTICE', (X0 + 0.05, 1.3, 3.6), (X0 + 0.05, 1.3, 2.6), (X0 + 0.05, 2.62, 2.6), (X0 + 0.05, 2.62, 3.6), m_notice)

# ---------- 角落的生活感：垃圾桶、盆栽、飲水機、掉在地上的爆米花 ----------
misc = CMesh('MISC', L.vc_material('ny_misc_vc', rough=0.6))
misc.add_bm(L.lathe([(0.0, 0.0), (0.18, 0.0), (0.2, 0.72), (0.0, 0.72)], seg=16), Matrix.Translation(g2b(0.6, 0.0, -4.6))); misc.paint(list(misc.bm.faces), '#8a8f96')
misc.finish(root, smooth=True)
pot = CMesh('PLANT_POT', L.vc_material('ny_pot_vc', rough=0.7))
for (x, z) in ((-6.4, 4.3), (6.4, 4.3)):
    pot.add_bm(L.lathe([(0.0, 0.0), (0.2, 0.0), (0.27, 0.5), (0.29, 0.52), (0.0, 0.52)], seg=18), Matrix.Translation(g2b(x, 0.0, z)))
pot.paint(list(pot.bm.faces), '#d8cfc2'); pot.finish(root, smooth=True)
try:
    import plants as _P   # noqa
except Exception:
    _P = None
leaf = CMesh('PLANT_LEAVES', L.vc_material('ny_leaf_vc', rough=0.55))
lr = random.Random(3)
for (x, z) in ((-6.4, 4.3), (6.4, 4.3)):
    for k in range(18):   # 虎尾蘭：直立、尖、有點彎的葉
        a = lr.uniform(0, math.tau); r0 = lr.uniform(0.02, 0.15); h = lr.uniform(0.6, 1.1); bx, bz = x + math.cos(a) * r0, z + math.sin(a) * r0
        tip = (bx + math.cos(a) * 0.12, 0.5 + h, bz + math.sin(a) * 0.12)
        nx, nz = -math.sin(a) * 0.035, math.cos(a) * 0.035
        leaf.poly([(bx - nx, 0.5, bz - nz), (bx + nx, 0.5, bz + nz), ((bx + tip[0]) / 2 + nx * 0.8, 0.5 + h * 0.55, (bz + tip[2]) / 2 + nz * 0.8), tip,
                   ((bx + tip[0]) / 2 - nx * 0.8, 0.5 + h * 0.55, (bz + tip[2]) / 2 - nz * 0.8)], '#3f7a3a' if k % 3 else '#6f9b45')
leaf.finish(root)
fl = CMesh('FLOOR_POPCORN', m_pop)
for _ in range(14):
    x = lr.uniform(-3.6, -0.6); z = lr.uniform(-3.2, -1.8); fl.ell((x, 0.012, z), 0.018, 0.012, 0.016, seg=6, rings=3)
fl.paint(list(fl.bm.faces), '#f1d98e'); fl.finish(root)

st_p = os.path.join(TMP, 'poster_train.png')
m_std = img_mat('ny_standee', st_p, emit=0.1, rough=0.6)
uvquad('STANDEE', (3.6, 0.0, 3.4), (4.6, 0.0, 2.6), (4.6, 1.75, 2.6), (3.6, 1.75, 3.4), m_std)
stb = Mesh('STANDEE_BACK', L.flat('ny_card', '#b79e7c', rough=0.9)); stb.box(4.05, 4.25, 0.0, 0.9, 2.75, 2.95); stb.finish(root)

# ---------- 導航阻擋（給 LAWWW2 的 zone 定義；同一份寫成 json）----------
BLOCKS = [
    ['售票口', -7.0, -4.2, -2.1, 1.7], ['爆米花櫃檯', -4.1, 0.1, -5.0, -3.25], ['垃圾桶', 0.38, 0.82, -4.82, -4.38],
    ['紅絨繩', 1.8, 4.6, -4.05, -3.75], ['長椅北', 5.9, 7.0, -2.5, -0.5], ['長椅南', 5.9, 7.0, -0.3, 2.0],
    ['立牌', 3.5, 4.7, 2.5, 3.5], ['盆栽西', -6.7, -6.1, 4.0, 4.6], ['盆栽東', 6.1, 6.7, 4.0, 4.6]]
L.write_json(os.path.join(os.path.dirname(OUT), 'nanyang_lobby_layout.json'), {
    'room': {'w': W, 'd': D, 'h': H}, 'front': 'z+', 'door': {'x': 0, 'z': 4.3, 'w': 3.0}, 'hallDoor': {'x': 3.2, 'z': -4.1, 'w': 2.2},
    'points': {'ticket': [-4.0, -0.2], 'popcorn': [-2.0, -2.9], 'clerk': [-2.0, -4.3], 'hall': [3.2, -4.1], 'exit': [0, 4.3], 'benchA': [6.2, 1.2], 'benchB': [6.2, -1.4]},
    'blocks': BLOCKS, 'by': 'BB 帳號 A 2026-11-03（AA_615 第 3 節）'})

for ob in list(root.children_recursive):
    if ob.type == 'MESH' and ob.data and len(ob.data.polygons) == 0: B.remove(ob)
L.export(OUT)
print('OK', OUT, B.stats())
