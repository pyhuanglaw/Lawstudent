"""總圖書館北側的露天下沉中庭（LIB-B1-COURT-ART-1110，USER_WANTS X307；使用者 11-10 對 LAWWW：「總圖b1樓梯 是往地下走到一個中庭 中庭的部分，我現在看不出來 你請lawww2做」）
→ assets/models/env/second_ai/lib_b1_court.glb（＋.json）。LAWWW2 帳號 A，2026-11-10。用法：
  /opt/blenv/bin/python tools/blender/env_second/lib_b1_court.py [-- --out <glb>]
座標＝校園座標（x 東、y 上、z 南），放在 (0,0,0) 不用轉。尺寸全部照 src/zones3d.js 的 B1C（LAWWW-B 11-10 第一階段 BLOCKOUT），導航、門、樓梯一格都不動：
  中庭 x 92～104、z −41～−31、深 4.2 m；北邊 24 階（踏面 0.3、級高 0.175）沿北牆從 x 92（地面）往東走到 x 99.2（中庭地面），z −41～−39；
  南牆（總圖 B1 的外牆）中間是 B1 的玻璃門 x 97.2～98.8、高 2.4；地面那一圈是 0.5 m 的矮牆（導航本來就擋住）。
參考：docs/handoff/user_shots/1110_library_b1_plan_ref.webp（使用者給的 B1 平面圖，中庭在北側）。照氣氛做，不照抄（D136）：
  清水模板牆（和社科院同一種木紋模板）＋花崗石壓頂；花崗石大方磚地面、深色收邊、沿牆的排水溝蓋；
  花崗石踏面＋深色防滑條、牆上的腳燈；靠中庭那一側是清水模的斜矮牆＋不鏽鋼扶手，北牆也有一支扶手；
  地面那一圈矮牆上面是種花的槽（常春藤從牆頂垂下來）；南牆是 B1 的玻璃帷幕（鋁框、裡面是亮著的自習室）、玻璃門、門上的玻璃雨遮、招牌；
  中庭裡兩個角落的花崗石樹槽（小樹＋灌木）、東牆前一張石凳——這三個要在遊戲加導航阻擋（patch 一起交）。
晚上：壁燈、腳燈、門上的燈、玻璃後面的自習室是發光材質（名字 lbc_lit_*，遊戲照 TK.addNight 調亮；白天弱一點）。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
import cafe_layout as CL   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from PIL import Image, ImageDraw, ImageFont   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/lib_b1_court.glb'))
GEN = os.path.join(HERE, 'textures', 'gen')

# ---- B1C（和 src/zones3d.js 同一組數字；改這裡要一起改那邊）----
X0, X1, Z0, Z1 = 92.0, 104.0, -41.0, -31.0
DEP = 4.2; Y = -DEP
ST0, ST1, STX, TREAD, RISE = -41.0, -39.0, 99.2, 0.3, 0.175
DX, DW, DH = 98.0, 1.6, 2.4            # 門中心 x、寬、高（門在 z −31）
T = 0.3                                # 牆厚
PH = 0.5                               # 地面那一圈矮牆高
# 中庭裡加的三個東西（導航阻擋寫在 patch）：(x0, x1, z0, z1)
PLANTER_SE = (102.2, 103.9, -32.8, -31.1)
PLANTER_NE = (102.2, 103.9, -38.9, -37.2)
BENCH_E = (103.35, 103.95, -36.4, -33.8)

random.seed(1110)
B.reset(texres=512)
root = B.group('lib_b1_court', props={'kind': 'lib_b1_court', 'note': 'LIB-B1-COURT-ART-1110：尺寸照 zones3d.js B1C；lbc_lit_* 晚上亮'})
base = CL.materials()
P = 'lbc_'
M = {
    'form': L.pbr(P + 'formwork', 'socsci_formwork', tile=2.4, target='#bdb8ae', normal=0.7, maps=('diff', 'nor'), res=512, rough_value=0.88),
    'cap': L.pbr(P + 'granite_cap', 'granite_tile', tile=0.9, target='#8d8a84', normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.55),
    'floor': L.pbr(P + 'floor', 'granite_tile', tile=1.2, target='#a39f97', normal=0.6, maps=('diff', 'nor'), res=512, rough_value=0.6),
    'floor_dk': L.pbr(P + 'floor_dark', 'granite_tile', tile=0.6, target='#5f5c58', normal=0.6, maps=('diff', 'nor'), res=256, rough_value=0.5),
    'tread': L.pbr(P + 'tread', 'granite_tile', tile=0.6, target='#9a968e', normal=0.6, maps=('diff', 'nor'), res=256, rough_value=0.6),
    'soil': L.pbr(P + 'soil', 'forest_ground_04', tile=1.0, target='#4a3b2c', normal=0.6, maps=('diff', 'nor'), res=256, rough_value=0.95),
    'steel': L.flat(P + 'steel', '#b8bcc0', rough=0.25, metal=0.45),
    'alu': L.flat(P + 'alu', '#5d6268', rough=0.35, metal=0.45),
    'grate': L.flat(P + 'grate', '#3b3e42', rough=0.5, metal=0.4),
    'nosing': L.flat(P + 'nosing', '#3a3a38', rough=0.7),
    'glass': L.flat(P + 'glass', '#55636c', rough=0.08, metal=0.3, alpha=0.38),
    'canopy': L.flat(P + 'canopy_glass', '#9fb2ba', rough=0.08, metal=0.2, alpha=0.3),
    'lit_room': L.flat(P + 'lit_room', '#efe6d2', rough=0.9, emit=B.srgb('#f3e7cc')),
    'lit_lamp': L.flat(P + 'lit_lamp', '#fff3dc', rough=0.4, emit=B.srgb('#fff1d6')),
    'room_dk': L.flat(P + 'room_desk', '#6b5a48', rough=0.7),
    'room_chair': L.flat(P + 'room_chair', '#2f3438', rough=0.6),
    'bench': L.pbr(P + 'bench', 'granite_tile', tile=0.8, target='#7d7a74', normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.55),
    'wood': L.pbr(P + 'bench_wood', 'fine_grained_wood' if os.path.isdir(os.path.join(HERE, 'textures', 'fine_grained_wood')) else 'walnut_veneer', tile=0.8, target='#9a7a58', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.6),
    'ivy': base['ivy'], 'broad': base['broad'], 'fern': base['fern'],
}
# 雨遮也只畫朝下那一面（X307 第三輪，BB 11-10 09:46 退回：站在中庭 (98,−37)、鏡頭朝南時，followCam 的鏡頭在 (98, −1.14, −31.14)，正好在雨遮（Y+2.75＝−1.45）上方 0.3 m，
# 雙面的雨遮從上面看＝畫面下半整片白霧；第二輪只改了玻璃帷幕，沒改到這一塊）。人在中庭裡是從下面看雨遮（眼睛 Y+1.6），照常看得到
M['canopy'].use_backface_culling = True
# 玻璃帷幕只畫朝中庭（−z）那一面（X307 BB 11-10 GAME_BUG：站在 B1 門口、鏡頭在背後時，engine3d.js followCam 碰到南牆拉近，最近 0.7 m，
# 會把鏡頭放到玻璃後面；雙面玻璃從背後看＝畫面下半整片白霧）。從背後看不畫＝看出去是中庭（玻璃後面是亮著的自習室，本來就看得到外面）
M['glass'].use_backface_culling = True
_acc = {}
def acc(key):
    if key not in _acc: _acc[key] = Mesh(P + key, M[key])
    return _acc[key]


def sign_tex():
    """門上的招牌：深灰底、米白字（不用館方的字體、標誌；名字照 WORLD_NAMING：總圖書館）"""
    W, H = 1024, 180; img = Image.new('RGB', (W, H), (36, 48, 58)); d = ImageDraw.Draw(img)
    f1 = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 78); f2 = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 44)
    t1, t2 = '總圖書館 B1', '24 小時自習室'
    w1 = d.textlength(t1, font=f1); w2 = d.textlength(t2, font=f2)
    d.text((60, (H - 78) / 2 - 6), t1, font=f1, fill=(243, 239, 228)); d.text((W - 60 - w2, (H - 44) / 2 + 4), t2, font=f2, fill=(214, 206, 188))
    d.rectangle([60 + w1 + 30, 50, 60 + w1 + 34, H - 50], fill=(150, 145, 135))
    p = os.path.join(GEN, 'lib_b1_court_sign.png'); img.save(p); return p


def img_mat(name, path, emit=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = 0.5
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path, check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    return m


def uv_quad(name, mat, pts):
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); f = bm.faces.new([bm.verts.new(g2b(*q)) for q in pts])
    for lp, t in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uvl].uv = t
    bm.normal_update(); return B.mesh_obj(name, bm, mat, root)


# ======================================================================
# 地面：花崗石大方磚，四周一圈深色收邊（0.3 m），沿東、西、南牆一條排水溝蓋
acc('floor').box(X0 + 0.3, X1 - 0.3, Y - 0.05, Y, ST1 + 0.3, Z1 - 0.3)
fd = acc('floor_dk')
fd.box(X0, X1, Y - 0.05, Y, Z1 - 0.3, Z1); fd.box(X0, X1, Y - 0.05, Y, ST1, ST1 + 0.3)
fd.box(X0, X0 + 0.3, Y - 0.05, Y, ST1 + 0.3, Z1 - 0.3); fd.box(X1 - 0.3, X1, Y - 0.05, Y, ST0, Z1 - 0.3)
fd.box(STX, X1 - 0.3, Y - 0.05, Y, ST0, ST1)                                   # 樓梯底到東牆（樓梯下面那一段地面）
gr = acc('grate')
for (x0, x1, z0, z1) in ((X1 - 0.28, X1 - 0.08, ST0 + 0.1, Z1 - 0.1), (X0 + 0.08, X0 + 0.28, ST1 + 0.4, Z1 - 0.1)):   # 東、西兩條排水溝蓋（細格子）
    gr.box(x0, x1, Y, Y + 0.004, z0, z1)
    n = int((z1 - z0) / 0.05)
    for k in range(n): z = z0 + k * (z1 - z0) / n; acc('nosing').box(x0 + 0.02, x1 - 0.02, Y + 0.004, Y + 0.008, z, z + 0.012)

# ======================================================================
# 擋土牆的內面：清水模（模板木紋），頂上一圈花崗石壓頂；外面（地面那一圈）0.5 m 的矮牆兼種花槽
fm = acc('form')
fm.box(X0 - T, X1 + T, Y, 0.0, Z0 - T, Z0)                                     # 北牆（樓梯靠著）
fm.box(X1, X1 + T, Y, 0.0, Z0 - T, Z1 + T)                                     # 東牆
fm.box(X0 - T, X0, Y, 0.0, ST1, Z1 + T)                                        # 西牆（北邊兩公尺是樓梯口）
for (x0, x1, z0, z1) in ((X0 - T, X1 + T, Z0 - T, Z0), (X1, X1 + T, Z0 - T, Z1 + T), (X0 - T, X0, ST1, Z1 + T), (X0 - T, X1 + T, Z1, Z1 + T)):
    fm.box(x0, x1, 0.0, PH - 0.05, z0, z1)                                     # 地面那一圈的矮牆（導航本來就擋）
    acc('cap').box(x0 - 0.03, x1 + 0.03, PH - 0.05, PH, z0 - 0.03, z1 + 0.03)  # 壓頂
for (x0, x1, z0, z1) in ((X0 - T + 0.04, X1 + T - 0.04, Z0 - T + 0.04, Z0 - 0.04), (X1 + 0.04, X1 + T - 0.04, Z0 - T + 0.04, Z1 + T - 0.04), (X0 - T + 0.04, X0 - 0.04, ST1 + 0.04, Z1 + T - 0.04)):
    acc('soil').box(x0, x1, PH, PH + 0.01, z0, z1)                             # 槽裡的土（壓頂往內縮）
# 牆面的水平分縫（每 1.2 m 一條，清水模的施工縫）、上緣滴水線
for y in (Y + 1.2, Y + 2.4, Y + 3.6):
    for (a, b, c, d, dirn) in ((X0, X1, Z0, Z0 + 0.012, 'z'), (X1 - 0.012, X1, ST0, Z1, 'x'), (X0, X0 + 0.012, ST1, Z1, 'x')):
        acc('nosing').box(a, b, y - 0.008, y + 0.008, c, d)
for (a, b, c, d) in ((X0, X1, Z0, Z0 + 0.05), (X1 - 0.05, X1, Z0, Z1), (X0, X0 + 0.05, ST1, Z1)):
    acc('cap').box(a, b, -0.12, 0.0, c, d)

# 種花槽：常春藤從牆頂垂下來（東、西、北牆），槽頂一叢叢的灌木葉片卡
iv = acc('ivy'); br = acc('broad')
for (xa, xb, z, face) in ((X0 + 0.4, X1 - 0.4, Z0 + 0.02, 0.0),):
    for k in range(int((xb - xa) / 0.45)):
        x = xa + k * (xb - xa) / int((xb - xa) / 0.45) + random.uniform(-0.1, 0.1)
        if x < STX + 0.3: continue                                             # 樓梯那一段（人走的地方）不垂
        h = random.uniform(0.6, 1.6); CL.card(iv, x, -h / 2 + 0.05, z, random.uniform(0.25, 0.4), h, ry=random.uniform(-0.3, 0.3), uv=CL.rand_uv(0.4))
for (x, za, zb) in ((X1 - 0.02, Z0 + 0.4, Z1 - 0.4), (X0 + 0.02, ST1 + 0.4, Z1 - 0.4)):
    for k in range(int((zb - za) / 0.45)):
        z = za + k * (zb - za) / int((zb - za) / 0.45) + random.uniform(-0.1, 0.1)
        if abs(z - (-34.0)) < 1.2 and x > 100: continue                        # 東牆壁燈那一段留空
        h = random.uniform(0.5, 1.5); CL.card(iv, x, -h / 2 + 0.05, z, random.uniform(0.25, 0.4), h, ry=math.pi / 2 + random.uniform(-0.3, 0.3), uv=CL.rand_uv(0.4))
for (x0, x1, z0, z1) in ((X0 - T, X1 + T, Z0 - T, Z0), (X1, X1 + T, Z0 - T, Z1 + T), (X0 - T, X0, ST1, Z1 + T)):
    L_ = max(x1 - x0, z1 - z0); n = int(L_ / 0.2)
    for k in range(n):
        u = (k + random.random()) / n; x = x0 + (x1 - x0) * (u if x1 - x0 > z1 - z0 else 0.5); z = z0 + (z1 - z0) * (u if z1 - z0 >= x1 - x0 else 0.5)
        CL.card(br, x, PH + 0.12, z, random.uniform(0.16, 0.26), random.uniform(0.14, 0.22), ry=random.uniform(0, math.pi), rx=random.uniform(-0.4, 0.4), uv=CL.rand_uv(0.5))

# ======================================================================
# 樓梯：花崗石踏面（前緣深色防滑條）、清水模踢面；靠中庭那一側一道清水模斜矮牆＋不鏽鋼扶手；北牆上一支扶手、每三階一盞腳燈
nst = int(round(DEP / RISE))
for k in range(nst):
    xa, xb, top = STX - (k + 1) * TREAD, STX - k * TREAD, Y + (k + 1) * RISE
    if top > -0.01: continue
    acc('form').box(xa, xb, Y, top - 0.03, ST0, ST1 - 0.15)                    # 踏階本體
    acc('tread').box(xa - 0.02, xb, top - 0.03, top, ST0, ST1 - 0.15)          # 踏面（往前凸 2 cm）
    acc('nosing').box(xb - 0.05, xb, top - 0.002, top + 0.002, ST0 + 0.05, ST1 - 0.2)   # 防滑條（低的那端在 x 大的一側）
    if k % 3 == 1: acc('lit_lamp').box(xb - 0.2, xb - 0.08, top + 0.25, top + 0.31, Z0, Z0 + 0.012)   # 北牆的腳燈
# 斜矮牆（樓梯和中庭地面之間，導航本來就擋）：每一階一段，上緣跟著樓梯斜
for k in range(nst):
    xa, xb, top = STX - (k + 1) * TREAD, STX - k * TREAD, Y + (k + 1) * RISE
    if top > 0.0: top = 0.0
    acc('form').box(xa, xb, Y, top + 0.85, ST1 - 0.15, ST1)
    acc('cap').box(xa, xb, top + 0.85, top + 0.9, ST1 - 0.17, ST1 + 0.02)
L_ = STX - X0
def rail(z, h, r=0.022):
    acc('steel').cyl((X0 - 0.3, h, z), (STX + 0.2, Y + h, z), r, seg=8)
rail(ST1 - 0.08, 1.0)                                                          # 矮牆上面的扶手（離踏面約 1 m）
for x in [X0 + 0.6 + 1.2 * k for k in range(6)]:
    yy = -(x - X0) / L_ * DEP; acc('steel').cyl((x, yy + 0.9, ST1 - 0.08), (x, yy + 1.0, ST1 - 0.08), 0.015, seg=6)
rail(Z0 + 0.08, 0.9, 0.02)                                                     # 北牆的扶手
for x in [X0 + 0.5 + 1.4 * k for k in range(5)]:
    yy = -(x - X0) / L_ * DEP; acc('steel').cyl((x, yy + 0.9, Z0 + 0.08), (x, yy + 0.9, Z0 + 0.01), 0.012, seg=6)

# ======================================================================
# 南牆＝總圖 B1 的外牆：玻璃帷幕（鋁框）、中間的玻璃門、門上的玻璃雨遮和招牌；玻璃後面是亮著的自習室（一間 3 m 深的房間）
GZ = Z1 + 0.06                                                                # 玻璃面
fm.box(X0 - T, X1 + T, Y + 3.0, 0.0, Z1, Z1 + T)                              # 玻璃上面的牆（地面那一圈的矮牆之下）
fm.box(X0 - T, X0 + 0.6, Y, Y + 3.0, Z1, Z1 + T); fm.box(X1 - 0.6, X1 + T, Y, Y + 3.0, Z1, Z1 + T)   # 兩端的牆墩
al = acc('alu')
gx0, gx1 = X0 + 0.6, X1 - 0.6
al.box(gx0, gx1, Y, Y + 0.12, GZ - 0.05, GZ + 0.05); al.box(gx0, gx1, Y + 2.92, Y + 3.0, GZ - 0.05, GZ + 0.05)   # 上下框
al.box(gx0, gx1, Y + 2.55, Y + 2.6, GZ - 0.04, GZ + 0.04)                     # 氣窗橫框
nb = int(round((gx1 - gx0) / 1.35))
for k in range(nb + 1):
    x = gx0 + k * (gx1 - gx0) / nb
    if DX - DW / 2 - 0.06 < x < DX + DW / 2 + 0.06: continue
    al.box(x - 0.035, x + 0.035, Y, Y + 3.0, GZ - 0.06, GZ + 0.06)
for x in (DX - DW / 2, DX, DX + DW / 2): al.box(x - 0.045, x + 0.045, Y, Y + DH, GZ - 0.07, GZ + 0.07)   # 門框、兩扇門中間
al.box(DX - DW / 2, DX + DW / 2, Y + DH - 0.05, Y + DH + 0.03, GZ - 0.07, GZ + 0.07)
for sx in (-1, 1): acc('steel').cyl((DX + sx * 0.12, Y + 0.95, GZ - 0.12), (DX + sx * 0.12, Y + 1.35, GZ - 0.12), 0.016, seg=8)   # 門把（直把手）
gl = acc('glass'); gl.quad([(gx0, Y + 0.12, GZ), (gx0, Y + 2.92, GZ), (gx1, Y + 2.92, GZ), (gx1, Y + 0.12, GZ)])   # 朝中庭（−z）
# 玻璃後面的自習室：亮的天花板、後牆，幾排桌椅的剪影
RZ0, RZ1 = Z1 + 0.15, Z1 + 3.0
lr = acc('lit_room'); lr.quad([(gx0, Y + 2.9, RZ0), (gx1, Y + 2.9, RZ0), (gx1, Y + 2.9, RZ1), (gx0, Y + 2.9, RZ1)])   # 天花板（朝下）
lr.quad([(gx0, Y, RZ1), (gx0, Y + 2.9, RZ1), (gx1, Y + 2.9, RZ1), (gx1, Y, RZ1)][::-1])   # 後牆（朝 −z）
for x in (gx0, gx1): acc('form').box(x - 0.1 if x == gx0 else x, x if x == gx0 else x + 0.1, Y, Y + 2.9, RZ0, RZ1)
acc('floor').box(gx0, gx1, Y - 0.02, Y, RZ0, RZ1)
for row in (0, 1):
    z = RZ0 + 0.9 + row * 1.2
    for x in [gx0 + 0.8 + k * 1.5 for k in range(int((gx1 - gx0 - 1.0) / 1.5) + 1)]:
        if abs(x - DX) < 1.1: continue
        acc('room_dk').box(x - 0.6, x + 0.6, Y + 0.72, Y + 0.76, z, z + 0.6)
        for lx in (x - 0.55, x + 0.5): acc('room_chair').box(lx, lx + 0.05, Y, Y + 0.72, z + 0.05, z + 0.55)
        for cx in (x - 0.3, x + 0.3): acc('room_chair').box(cx - 0.2, cx + 0.2, Y + 0.43, Y + 0.47, z - 0.45, z - 0.05); acc('room_chair').box(cx - 0.2, cx + 0.2, Y + 0.47, Y + 0.9, z - 0.47, z - 0.43)
# 門上的玻璃雨遮（不鏽鋼拉桿）、招牌、門燈
CY = Y + 2.75
acc('canopy').quad([(DX - 1.6, CY, Z1 - 1.3), (DX + 1.6, CY, Z1 - 1.3), (DX + 1.6, CY, Z1), (DX - 1.6, CY, Z1)])   # 朝下（−y）的一片：從上面（鏡頭）看不畫
for sx in (-1, 1):
    acc('steel').box(DX + sx * 1.55 - 0.02, DX + sx * 1.55 + 0.02, CY - 0.04, CY, Z1 - 1.3, Z1)
    acc('steel').cyl((DX + sx * 1.45, CY + 0.02, Z1 - 1.2), (DX + sx * 1.45, CY + 0.75, Z1), 0.012, seg=6)
for x in (DX - 0.9, DX + 0.9): acc('lit_lamp').box(x - 0.1, x + 0.1, CY - 0.03, CY - 0.01, Z1 - 0.7, Z1 - 0.5)   # 雨遮下的崁燈
sm = img_mat(P + 'sign', sign_tex(), emit=0.6)
uv_quad(P + 'sign_face', sm, [(DX + 1.3, CY + 0.08, Z1 - 0.02), (DX - 1.3, CY + 0.08, Z1 - 0.02), (DX - 1.3, CY + 0.54, Z1 - 0.02), (DX + 1.3, CY + 0.54, Z1 - 0.02)])   # 朝 −z（從中庭看）
acc('alu').box(DX - 1.36, DX + 1.36, CY + 0.04, CY + 0.58, Z1 - 0.01, Z1 + 0.0)

# 東、西牆的壁燈（方形、往下打）
for (x, z, face) in ((X1 - 0.08, -34.0, -1), (X1 - 0.08, -37.6, -1), (X0 + 0.08, -34.0, 1), (X0 + 0.08, -36.8, 1)):
    acc('alu').box(min(x, x + face * 0.1), max(x, x + face * 0.1), Y + 2.2, Y + 2.5, z - 0.12, z + 0.12)
    acc('lit_lamp').box(min(x, x + face * 0.1), max(x, x + face * 0.1), Y + 2.19, Y + 2.2, z - 0.1, z + 0.1)

# ======================================================================
# 中庭裡：兩個花崗石樹槽（小樹＋灌木）、東牆前一張石凳（木頭坐面）——遊戲加導航阻擋
def planter(x0, x1, z0, z1, tree=True):
    acc('bench').box(x0, x1, Y, Y + 0.45, z0, z1); acc('cap').box(x0 - 0.02, x1 + 0.02, Y + 0.45, Y + 0.5, z0 - 0.02, z1 + 0.02)
    acc('soil').box(x0 + 0.08, x1 - 0.08, Y + 0.5, Y + 0.51, z0 + 0.08, z1 - 0.08)
    cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
    for k in range(14):
        a = random.uniform(0, 2 * math.pi); r = random.uniform(0.1, min(x1 - x0, z1 - z0) / 2 - 0.15)
        CL.card(acc('fern' if k % 3 else 'broad'), cx + math.cos(a) * r, Y + 0.7 + random.uniform(-0.1, 0.15), cz + math.sin(a) * r, random.uniform(0.35, 0.55), random.uniform(0.35, 0.5), ry=random.uniform(0, math.pi), rx=random.uniform(-0.6, 0.6), uv=CL.rand_uv(0.5))
    if tree:
        acc('room_dk').cyl((cx, Y + 0.5, cz), (cx + 0.05, Y + 2.6, cz - 0.03), 0.06, seg=7, r2=0.035)   # 樹幹（深木色）
        for k in range(34):
            a = random.uniform(0, 2 * math.pi); e = random.uniform(-0.3, 1.0); r = 0.75 * random.uniform(0.6, 1.0)
            CL.card(acc('broad'), cx + math.cos(a) * r * math.cos(e), Y + 2.9 + math.sin(e) * 0.55, cz + math.sin(a) * r * math.cos(e), random.uniform(0.45, 0.7), random.uniform(0.4, 0.6), ry=random.uniform(0, math.pi), rx=random.uniform(-0.8, 0.8), uv=CL.rand_uv(0.5))
planter(*PLANTER_SE); planter(*PLANTER_NE)
bx0, bx1, bz0, bz1 = BENCH_E
acc('bench').box(bx0 + 0.05, bx1 - 0.05, Y, Y + 0.38, bz0 + 0.15, bz0 + 0.45); acc('bench').box(bx0 + 0.05, bx1 - 0.05, Y, Y + 0.38, bz1 - 0.45, bz1 - 0.15)
acc('wood').box(bx0, bx1, Y + 0.38, Y + 0.45, bz0, bz1)

# ======================================================================
for k, m in _acc.items():
    m.finish(root, uv=(k not in ('ivy', 'broad', 'fern')), smooth=False)
L.merge_by_material(root)
info = L.export(OUT, gpu_instances=True)
info.update({'B1C': [X0, X1, Z0, Z1, DEP], 'planters': [PLANTER_SE, PLANTER_NE], 'bench': BENCH_E})
L.write_json(OUT[:-4] + '.json', info)
print('OK', OUT, info.get('tris'))
