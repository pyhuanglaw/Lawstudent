"""新體育館（綜合體育館）室內 第一階段：大廳＋1F 多功能球場（BB_151；LAWWW2-B 2026-10-16）→ GLB。Blender 5.2：
  python3 tools/blender/env_second/gym_tex.py           （地板球場線、開館時間牌、記分板）
  /opt/blenv/bin/python tools/blender/env_second/gym_interior.py [-- --out assets/models/env/second_ai/gym_interior.glb]
配置只寫在 src/data/gym_layout.js（這裡讀同一份）。座標＝遊戲區域座標（room()：中心在原點、入口在 +z）。
會淡出的牆：WALL_<side>_*（自訂屬性 dir）。第二會場（大螢幕＋折疊椅）是 SET_SECONDHALL 一組，平常藏起來（遊戲依事件顯示）。
「日系加一點寫實 不要很像積木」：護牆軟墊、看台、服務台、閘門都倒角；屋頂鋼桁架、吊掛式籃架、羽球網架。
參考：台大綜合體育館的公開資料（BB_151 第 2、4b 節；沒有室內照片——外觀、屋頂、樓梯的位置是一般體育館的做法，不是精確複製）。"""
import json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
import cafe_layout as CL   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./src/data/gym_layout.js')))"], cwd=L.ROOT))
OUT = os.path.join(L.ROOT, arg('--out', LAY['glb']))
GEN = os.path.join(HERE, 'textures', 'gen')
HALL, LOB = LAY['hall'], LAY['lobby']; X0, X1 = HALL['x0'], HALL['x1']; ZH0, ZH1, ZL1 = HALL['z0'], HALL['z1'], LOB['z1']; HH, LH = HALL['h'], LOB['h']
random.seed(151)
B.reset(texres=512)
root = B.group('gym_interior', props={'kind': 'gym_interior', 'layout': LAY['version']})
base = CL.materials()


def img_mat(name, fn, rough=0.6, emit=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    m['tile'] = 1.0; return m


P = 'gym_'
M = {
    'floor': img_mat(P + 'court_floor', 'gym_floor.jpg', rough=0.6),   # 0.32→0.6（BB_218 2026-10-21 的白霧：引擎的補光 E.fill（固定方向的平行光）在亮面地板上的高光，跟著鏡頭轉、不跟著平移；逐盞關燈量到只有關掉 E.fill 會消失。0.5 還剩四成，0.6 看不出來；球場的光澤由頂燈的點光源保留）
    'lobby_floor': L.pbr(P + 'lobby_floor', 'granite_tile', tile=1.2, target='#a9a7a2', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.35),
    'concrete': L.pbr(P + 'plaster', 'white_plaster_02', tile=2.5, target='#dedbd3', normal=0.5, maps=('diff', 'nor'), rough_value=0.85),   # v2：清水混凝土的水漬太髒（像停車場）→ 白色粉刷牆
    'pad': L.flat(P + 'wall_pad', '#2f5a8a', rough=0.7), 'pad_trim': L.flat(P + 'pad_trim', '#d9dde2', rough=0.5),
    'stone': L.pbr(P + 'stone_wall', 'granite_tile', tile=0.9, target='#8e8b85', normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.5),
    'roof': L.flat(P + 'roof_deck', '#5c6166', rough=0.8, cull=True), 'steel': L.flat(P + 'steel', '#8a9096', rough=0.4, metal=0.45),
    'steel_dk': L.flat(P + 'steel_dark', '#3a3e42', rough=0.45, metal=0.35), 'white': L.flat(P + 'white', '#eef0f0', rough=0.4),
    'glass': base['glass'], 'board_glass': L.flat(P + 'backboard', '#dfeaf0', rough=0.05, alpha=0.35),
    'rim': L.flat(P + 'rim', '#e2581e', rough=0.4, metal=0.3), 'net': L.flat(P + 'net', '#2a2c30', rough=0.8, alpha=0.45),
    'tape': L.flat(P + 'net_tape', '#f4f4f0', rough=0.6), 'light': L.flat(P + 'highbay', '#ffffff', rough=0.3, emit=B.srgb('#f4f8ff')),
    'wood': L.pbr(P + 'wood', 'walnut_veneer', tile=0.9, target='#b48a5e', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.5),
    'seat_blue': L.flat(P + 'seat_blue', '#2c5fa8', rough=0.5), 'seat_grey': L.flat(P + 'bleacher_riser', '#7a7f85', rough=0.6),
    'ceil_lobby': L.flat(P + 'ceiling_lobby', '#eceae4', rough=0.9, cull=True), 'red': L.flat(P + 'red', '#b23a30', rough=0.5),
    'brass': base['brass'], 'chair': L.flat(P + 'folding_chair', '#3c4046', rough=0.5, metal=0.2),
    'hours': img_mat(P + 'hours', 'gym_hours.png', rough=0.5), 'score': img_mat(P + 'score', 'gym_score.png', rough=0.3, emit=0.8),
    'screen': L.flat(P + 'screen', '#f4f6f8', rough=0.6, emit=B.srgb('#9fb4c8')), 'vc': L.vc_material(P + 'vc', rough=0.6),
    'sky': L.flat(P + 'window_sky', '#e8eff6', rough=0.2, emit=B.srgb('#c4d6e8')),   # 高窗：外面沒有東西，用發光的天空色（玻璃會透出後面的牆）
    'slat_back': L.flat(P + 'slat_back', '#2e2a26', rough=0.8),
    'wayfind': img_mat(P + 'wayfind', 'gym_wayfind.png', rough=0.4, emit=0.25), 'directory': img_mat(P + 'directory', 'gym_directory.png', rough=0.4),
    'notice': img_mat(P + 'notice', 'gym_notice.png', rough=0.8),
}
VC = L.CMesh(P + 'vc_parts', M['vc'])


class Xf:
    def __init__(self, px, pz, ry=0.0): self.px, self.pz, self.c, self.s, self.ry = px, pz, math.cos(ry), math.sin(ry), ry
    def p(self, x, y, z): return (self.px + x * self.c + z * self.s, y, self.pz - x * self.s + z * self.c)
    def M(self, x, y, z): return Matrix.Translation(g2b(*self.p(x, y, z))) @ Matrix.Rotation(self.ry, 4, 'Z')
    def rbox(self, m, x0, x1, y0, y1, z0, z1, r=0.02, seg=2):
        bm = L.rbox_bm(x1 - x0, y1 - y0, z1 - z0, r, seg); m.add_bm(bm, self.M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)); bm.free(); return m
    def cyl(self, m, a, b, r, **kw): m.cyl(self.p(*a), self.p(*b), r, **kw); return m
    def lathe(self, m, prof, x, y, z, seg=16): bm = L.lathe(prof, seg=seg); m.add_bm(bm, self.M(x, y, z)); bm.free(); return m


_acc = {}
def acc(key):
    mat = M[key]
    if mat.name not in _acc: _acc[mat.name] = Mesh(P + key, mat)
    return _acc[mat.name]


walls = {'front': [], 'back': [], 'left': [], 'right': []}
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0]}
def wm(side, key):
    for m in walls[side]:
        if m.mat == M[key]: return m
    m = Mesh(f'{side}_{key}', M[key]); walls[side].append(m); return m
IMGS = []   # (名稱, 材質, 四點, uv, 牆的那一面或 None)
PLATE = []  # 告示牌（字由遊戲畫：PLATE_FACE_*）
def img_quad(name, mat, pts, uv=(0, 0, 1, 1), side=None): IMGS.append((name, mat, pts, uv, side))
X0_ = Xf(0, 0)

# ======================== 球場：地板（球場線貼圖）、牆、屋頂桁架、燈 ========================
img_quad('court_floor', M['floor'], [(X0, 0.0, ZH1), (X1, 0.0, ZH1), (X1, 0.0, ZH0), (X0, 0.0, ZH0)], (0, 0, 1, 1))   # u＝x、v＝z（gym_tex：貼圖上緣是 z −19）
for side, (a0, a1) in (('back', (X0, X1)), ('left', (ZH0, ZH1)), ('right', (ZH0, ZH1))):
    if side == 'back': wm(side, 'concrete').box(a0, a1, 0.0, HH + 0.5, ZH0 - 0.25, ZH0)
    elif side == 'left': wm(side, 'concrete').box(X0 - 0.25, X0, 0.0, HH + 0.5, a0, a1)
    else: wm(side, 'concrete').box(X1, X1 + 0.25, 0.0, HH + 0.5, a0, a1)
    # 護牆軟墊（2.2 m 高，一片 1.2 m 寬，倒角）＋上緣的收邊
    n = int((a1 - a0) / 1.2)
    for k in range(n):
        c0 = a0 + k * (a1 - a0) / n + 0.02; c1 = a0 + (k + 1) * (a1 - a0) / n - 0.02
        if side == 'back': Xf(0, 0).rbox(wm(side, 'pad'), c0, c1, 0.12, 2.2, ZH0, ZH0 + 0.07, r=0.025, seg=2)
        elif side == 'left': Xf(0, 0).rbox(wm(side, 'pad'), X0, X0 + 0.07, 0.12, 2.2, c0, c1, r=0.025, seg=2)
        else: Xf(0, 0).rbox(wm(side, 'pad'), X1 - 0.07, X1, 0.12, 2.2, c0, c1, r=0.025, seg=2)
    if side == 'back': wm(side, 'pad_trim').box(a0, a1, 2.2, 2.26, ZH0, ZH0 + 0.09)
    elif side == 'left': wm(side, 'pad_trim').box(X0, X0 + 0.09, 2.2, 2.26, a0, a1)
    else: wm(side, 'pad_trim').box(X1 - 0.09, X1, 2.2, 2.26, a0, a1)
# 東、西牆上方的高窗（一排，6～8 m）：窗框＋玻璃（天光）
for side, xw, sgn in (('left', X0, 1), ('right', X1, -1)):
    for k in range(7):
        z0 = ZH0 + 1.5 + k * 4.0; z1 = z0 + 3.2
        if z1 > ZH1 - 0.5: break
        wm(side, 'steel_dk').box(xw + sgn * 0.0 - (0.06 if sgn < 0 else 0), xw + sgn * 0.0 + (0.06 if sgn > 0 else 0), 6.0, 6.06, z0, z1)
        wm(side, 'steel_dk').box(xw - (0.06 if sgn < 0 else 0), xw + (0.06 if sgn > 0 else 0), 7.94, 8.0, z0, z1)
        for zz in (z0, (z0 + z1) / 2, z1): wm(side, 'steel_dk').box(xw - (0.06 if sgn < 0 else 0), xw + (0.06 if sgn > 0 else 0), 6.0, 8.0, zz - 0.03, zz + 0.03)
        wm(side, 'sky').quad([(xw + sgn * 0.04, 6.06, z1 if sgn > 0 else z0), (xw + sgn * 0.04, 6.06, z0 if sgn > 0 else z1), (xw + sgn * 0.04, 7.94, z0 if sgn > 0 else z1), (xw + sgn * 0.04, 7.94, z1 if sgn > 0 else z0)])
        CL.glow(root, 'skylight', xw + sgn * 0.5, 7.0, (z0 + z1) / 2, color='rgba(235,245,255,1)', size=3.0, day=0.35, night=0.0)
# 屋頂：鋼桁架（每 6 m 一榀，跨 x）、屋頂板、高天井燈
rf = Mesh(P + 'roof', M['roof']); rf.quad([(X0, HH + 0.6, ZH0), (X1, HH + 0.6, ZH0), (X1, HH + 0.6, ZH1), (X0, HH + 0.6, ZH1)]); rf.finish(root, uv=False)
st = acc('steel')
for k in range(6):
    z = ZH0 + 2.5 + k * 5.0
    st.cyl((X0, HH - 1.2, z), (X1, HH - 1.2, z), 0.07, seg=8); st.cyl((X0, HH + 0.4, z), (X1, HH + 0.4, z), 0.08, seg=8)
    for j in range(20):
        xa = X0 + j * 2.0; xb = xa + 2.0
        st.cyl((xa, HH - 1.2, z), (xb, HH + 0.4, z), 0.035, seg=5); st.cyl((xb, HH - 1.2, z), (xb, HH + 0.4, z), 0.03, seg=5)
    for x in (-12.0, -4.0, 4.0, 12.0):                                                                # 高天井燈（燈罩＋發光面）
        X0_.lathe(acc('steel_dk'), [(0.06, 0.4), (0.1, 0.36), (0.28, 0.05), (0.3, 0.0), (0.27, 0.0)], x, HH - 1.75, z + 2.5, seg=14)   # 燈罩底下只留一圈（原本整片圓蓋住發光面、疊面）
        acc('light').cyl((x, HH - 1.752, z + 2.5), (x, HH - 1.748, z + 2.5), 0.27, seg=14)
        acc('steel_dk').cyl((x, HH - 1.35, z + 2.5), (x, HH + 0.4, z + 2.5), 0.01, seg=4)
        CL.glow(root, 'highbay', x, HH - 2.0, z + 2.5, color='rgba(245,250,255,1)', size=3.2, day=0.5, night=1.0)
for k in range(8): st.cyl((X0, HH + 0.4, ZH0 + k * 4.0), (X1, HH + 0.4, ZH0 + k * 4.0), 0.04, seg=5)       # 屋頂的次樑

# ======================== 羽球網、吊掛式籃架 ========================
nets_g = B.group('SET_NETS', root, {'set': 'nets', 'default': 'on'})   # v3：羽球網＋網柱自己一組（平常顯示；第二會場打開時收起來——BB-B：辦活動前會收網）
nm_base, nm_post, nm_net, nm_tape = Mesh('SET_NETS_base', M['steel_dk']), Mesh('SET_NETS_post', M['steel']), Mesh('SET_NETS_net', M['net']), Mesh('SET_NETS_tape', M['tape'])
for (cx, cz) in LAY['courts']['badminton']:
    for sx in (-3.1, 3.1):
        X0_.lathe(nm_base, [(0.0, 0.0), (0.2, 0.0), (0.2, 0.05), (0.06, 0.07), (0.0, 0.07)], cx + sx, 0.0, cz, seg=14)   # 底座
        nm_post.cyl((cx + sx, 0.05, cz), (cx + sx, 1.55, cz), 0.022, seg=8)
    nm_net.quad([(cx - 3.08, 0.79, cz), (cx + 3.08, 0.79, cz), (cx + 3.08, 1.52, cz), (cx - 3.08, 1.52, cz)])
    nm_net.quad([(cx + 3.08, 0.79, cz), (cx - 3.08, 0.79, cz), (cx - 3.08, 1.52, cz), (cx + 3.08, 1.52, cz)])
    nm_tape.box(cx - 3.08, cx + 3.08, 1.5, 1.55, cz - 0.01, cz + 0.01)
for m_ in (nm_base, nm_post, nm_tape): m_.finish(nets_g, uv=False, smooth=True)
nm_net.finish(nets_g, uv=False)
for (hx, hz) in LAY['courts']['basketball']['hoops']:
    s = 1 if hx < 0 else -1; bx = hx - s * 0.375                                                      # 籃板在籃框後面 0.375 m（籃框中心離籃板 0.15＋半徑 0.225）
    acc('board_glass').box(bx - 0.025, bx + 0.025, 2.905, 3.945, hz - 0.895, hz + 0.895)   # 比白框小 5 mm（原本上下左右的面和框疊在一起）
    for (y0, y1, z0, z1) in ((2.9, 2.95, hz - 0.9, hz + 0.9), (3.9, 3.95, hz - 0.9, hz + 0.9), (2.9, 3.95, hz - 0.9, hz - 0.85), (2.9, 3.95, hz + 0.85, hz + 0.9)):
        acc('white').box(bx - 0.03, bx + 0.03, y0, y1, z0, z1)
    acc('white').box(bx - 0.03, bx + 0.03, 3.05, 3.5, hz - 0.3, hz + 0.3)
    rim = acc('rim'); n = 20
    for k in range(n):
        a0 = k / n * 2 * math.pi; a1 = (k + 1) / n * 2 * math.pi
        rim.cyl((hx + 0.225 * math.cos(a0), 3.05, hz + 0.225 * math.sin(a0)), (hx + 0.225 * math.cos(a1), 3.05, hz + 0.225 * math.sin(a1)), 0.01, seg=4, caps=False)
    rim.box(bx, hx - s * 0.2, 3.03, 3.07, hz - 0.08, hz + 0.08)
    for k in range(10):                                                                                # 籃網：白色細繩往下收
        a = k / 10 * 2 * math.pi; acc('tape').cyl((hx + 0.22 * math.cos(a), 3.04, hz + 0.22 * math.sin(a)), (hx + 0.13 * math.cos(a + 0.4), 2.62, hz + 0.13 * math.sin(a + 0.4)), 0.005, seg=3)
    for dz in (-0.6, 0.6):                                                                             # 吊架：從籃板後面往上到桁架
        acc('steel').cyl((bx - s * 0.05, 3.95, hz + dz), (bx - s * 0.05, HH - 1.2, hz + dz * 1.3), 0.05, seg=8)
        acc('steel').cyl((bx - s * 0.05, 3.5, hz + dz), (bx - s * 1.6, HH - 1.2, hz + dz * 1.3), 0.04, seg=8)

# ======================== 看台、記分板、場邊長椅 ========================
for it in LAY['items']:
    k = it['kind']
    if k == 'bleacher':
        x0, x1, z0 = it['x'] - it['w'] / 2, it['x'] + it['w'] / 2, it['z'] + it['d'] / 2
        for r in range(it['rows']):
            zr = z0 - r * 0.7; yr = 0.45 * r
            X0_.rbox(acc('seat_grey'), x0, x1, 0.0, yr + 0.02, max(zr - 0.7, ZH0 + 0.075), zr, r=0.01, seg=1)   # 最後一排停在護牆軟墊前面（原本穿進軟墊、背面和軟墊疊在一起）
            X0_.rbox(acc('wood'), x0 + 0.05, x1 - 0.05, yr + 0.42, yr + 0.47, zr - 0.38, zr - 0.06, r=0.012, seg=2)
            for j in range(int((x1 - x0) / 2.0) + 1): acc('steel_dk').box(x0 + j * 2.0 - 0.02, x0 + j * 2.0 + 0.02, yr, yr + 0.42, zr - 0.3, zr - 0.25)
        acc('steel').cyl((x0, 2.3, z0 - 2.8), (x1, 2.3, z0 - 2.8), 0.025, seg=6)
    elif k == 'scoreboard':
        wm('back', 'steel_dk').box(it['x'] - it['w'] / 2 - 0.1, it['x'] + it['w'] / 2 + 0.1, it['y'] - it['h'] / 2 - 0.1, it['y'] + it['h'] / 2 + 0.1, ZH0, ZH0 + 0.12)
        img_quad('score', M['score'], [(it['x'] - it['w'] / 2, it['y'] - it['h'] / 2, ZH0 + 0.125), (it['x'] + it['w'] / 2, it['y'] - it['h'] / 2, ZH0 + 0.125), (it['x'] + it['w'] / 2, it['y'] + it['h'] / 2, ZH0 + 0.125), (it['x'] - it['w'] / 2, it['y'] + it['h'] / 2, ZH0 + 0.125)], side='back')
    elif k == 'team_bench':
        xf = Xf(it['x'], it['z'], it['ry']); w = it['w']
        xf.rbox(acc('wood'), -w / 2, w / 2, 0.42, 0.47, -0.2, 0.2, r=0.015, seg=2)
        for sx in (-w / 2 + 0.2, 0.0, w / 2 - 0.2): xf.rbox(acc('steel_dk'), sx - 0.03, sx + 0.03, 0.0, 0.42, -0.18, 0.18, r=0.008, seg=1)
        for j in range(3): VC.cbox(*sorted((xf.p(-w / 2 + 0.6 + j * 1.3, 0, 0)[0] - 0.12, xf.p(-w / 2 + 0.6 + j * 1.3, 0, 0)[0] + 0.12)), 0.47, 0.5, *sorted((xf.p(-w / 2 + 0.6 + j * 1.3, 0, 0)[2] - 0.12, xf.p(-w / 2 + 0.6 + j * 1.3, 0, 0)[2] + 0.12)), ['#f4f4f0', '#3a6fb0', '#e8c060'][j])   # 毛巾、水瓶的位置（小方塊）

# ======================== 大廳 ========================
SD = next(i for i in LAY['items'] if i['kind'] == 'stairs_down')                                          # 大廳地板：挖掉往 B1 的樓梯井
for (a, b, c, d) in ((X0, SD['x0'], ZH1, ZL1), (SD['x0'], SD['x1'], ZH1, SD['z0']), (SD['x0'], SD['x1'], SD['z1'], ZL1), (SD['x1'], X1, ZH1, ZL1)):
    img_quad(f'lobby_floor_{a:.0f}_{c:.0f}', M['lobby_floor'], [(a, 0.001, d), (b, 0.001, d), (b, 0.001, c), (a, 0.001, c)], ((a - X0) / 1.2, (ZL1 - d) / 1.2, (b - X0) / 1.2, (ZL1 - c) / 1.2))
lc = Mesh(P + 'lobby_ceiling', M['ceil_lobby']); lc.quad([(X0, LH, ZH1), (X1, LH, ZH1), (X1, LH, ZL1), (X0, LH, ZL1)]); lc.finish(root, uv=False)
for x in (-14, -7, 0, 7, 14):                                                                          # 大廳的嵌燈
    for zz in (13.0, 17.0): acc('light').cyl((x, LH - 0.01, zz), (x, LH, zz), 0.18, seg=12); CL.glow(root, 'downlight', x, LH - 0.2, zz, color='rgba(255,244,226,1)', size=1.0, day=0.22, night=0.65)   # 2026-10-21 光暈接進遊戲：原本 1.4 m 在白天花板上太亮
# 大廳和球場之間的牆（三個開口）：下面石材、上面混凝土；開口上方到大廳天花板
pz = LAY['partition']['z']; ops = LAY['partition']['openings']; xs = [X0] + [v for o in ops for v in o] + [X1]
for i in range(0, len(xs), 2):
    acc('stone').box(xs[i], xs[i + 1], 0.0, 1.2, pz - 0.15, pz + 0.15); acc('concrete').box(xs[i], xs[i + 1], 1.2, HH + 0.5, pz - 0.15, pz + 0.15)
for (a, b) in ops: acc('concrete').box(a, b, 3.0, HH + 0.5, pz - 0.15, pz + 0.15); acc('steel_dk').box(a, b, 2.95, 3.05, pz - 0.18, pz + 0.18)
# v2：大廳那一面（z＝pz＋0.15）——開口上方的指標、中間兩段木格柵牆、公告欄、樓層指引（gym_tex 的 wayfind／notice／directory）
zf = pz + 0.15
for i, (a, b) in enumerate(ops):                                                                       # 指標：← 3F（樓梯在西）、↑ 1F、→ B1（樓梯在東）
    c = (a + b) / 2; v0, v1 = 1 - (i + 1) / 3, 1 - i / 3
    acc('steel_dk').box(c - 2.05, c + 2.05, 3.2, 3.8, zf, zf + 0.04)
    img_quad(f'wayfind_{i}', M['wayfind'], [(c - 2.0, 3.25, zf + 0.045), (c + 2.0, 3.25, zf + 0.045), (c + 2.0, 3.75, zf + 0.045), (c - 2.0, 3.75, zf + 0.045)], (0, v0, 1, v1))
for (a, b) in ((ops[0][1], ops[1][0]), (ops[1][1], ops[2][0])):                                        # 木格柵（4.5 cm 寬、間隔 8 cm）
    acc('slat_back').box(a + 0.1, b - 0.1, 1.25, LH - 0.05, zf, zf + 0.01)
    x = a + 0.14
    while x < b - 0.16: acc('wood').box(x, x + 0.045, 1.25, LH - 0.05, zf + 0.01, zf + 0.04); x += 0.08
nb = (ops[0][1] + ops[1][0]) / 2                                                                       # 公告欄（軟木，3.2×1.2）
Xf(nb, zf + 0.06).rbox(acc('wood'), -1.68, 1.68, 1.28, 2.62, -0.02, 0.02, r=0.012, seg=2)
img_quad('notice', M['notice'], [(nb - 1.6, 1.35, zf + 0.083), (nb + 1.6, 1.35, zf + 0.083), (nb + 1.6, 2.55, zf + 0.083), (nb - 1.6, 2.55, zf + 0.083)])
dr = (ops[1][1] + ops[2][0]) / 2                                                                       # 樓層指引（0.9×1.2）
Xf(dr, zf + 0.06).rbox(acc('steel_dk'), -0.5, 0.5, 1.25, 2.6, -0.02, 0.02, r=0.01, seg=2)
img_quad('directory', M['directory'], [(dr - 0.45, 1.33, zf + 0.083), (dr + 0.45, 1.33, zf + 0.083), (dr + 0.45, 2.53, zf + 0.083), (dr - 0.45, 2.53, zf + 0.083)])
# 前牆：玻璃帷幕＋自動門（窗框）＋門上的雨遮在外面看不到，不做
fr = LAY['front']; dx, dw = fr['door']['x'], fr['door']['w']
for (a, b) in fr['glass'] + [(-18.0 - 2.0, -18.0), (18.0, 20.0)]:
    if b - a <= 0: continue
    wm('front', 'glass').quad([(b, 0.05, ZL1 - 0.06), (a, 0.05, ZL1 - 0.06), (a, LH, ZL1 - 0.06), (b, LH, ZL1 - 0.06)])
    n = max(1, round((b - a) / 1.6))
    for j in range(n + 1): x = a + j * (b - a) / n; wm('front', 'steel_dk').box(x - 0.04, x + 0.04, 0.0, LH, ZL1 - 0.1, ZL1)
    wm('front', 'steel_dk').box(a, b, 0.0, 0.08, ZL1 - 0.12, ZL1); wm('front', 'steel_dk').box(a, b, LH - 0.1, LH, ZL1 - 0.12, ZL1)
wm('front', 'glass').quad([(dx + dw / 2, 0.02, ZL1 - 0.05), (dx - dw / 2, 0.02, ZL1 - 0.05), (dx - dw / 2, 2.5, ZL1 - 0.05), (dx + dw / 2, 2.5, ZL1 - 0.05)])
for x in (dx - dw / 2, dx, dx + dw / 2): wm('front', 'steel_dk').box(x - 0.04, x + 0.04, 0.0, 2.5, ZL1 - 0.1, ZL1)
wm('front', 'steel_dk').box(dx - dw / 2 - 0.2, dx + dw / 2 + 0.2, 2.5, 2.9, ZL1 - 0.25, ZL1)                          # 自動門的機箱
wm('front', 'concrete').box(dx - dw / 2, dx + dw / 2, 2.9, LH, ZL1 - 0.095, ZL1)   # 往外退 5 mm：兩側窗框的面原本和它疊在一起
wm('left', 'stone').box(X0 - 0.25, X0, 0.0, LH, ZH1, ZL1); wm('right', 'stone').box(X1, X1 + 0.25, 0.0, LH, ZH1, ZL1)   # 大廳的東西兩面牆（石材）
for it in LAY['items']:
    k = it['kind']
    if k == 'info_desk':
        xf = Xf(it['x'], it['z']); w, d = it['w'], it['d']
        xf.rbox(acc('wood'), -w / 2, w / 2, 0.0, 1.05, -d / 2, d / 2, r=0.03, seg=2); xf.rbox(acc('white'), -w / 2 - 0.04, w / 2 + 0.04, 1.05, 1.1, -d / 2 - 0.04, d / 2 + 0.08, r=0.015, seg=2)
        xf.rbox(acc('steel_dk'), -0.9, -0.3, 1.1, 1.14, -0.3, 0.0, r=0.01, seg=1); xf.rbox(acc('steel_dk'), -0.85, -0.35, 1.14, 1.5, -0.38, -0.34, r=0.01, seg=1)   # 螢幕
        VC.cbox(*sorted((xf.p(0.6, 0, 0)[0] - 0.15, xf.p(0.6, 0, 0)[0] + 0.15)), 1.1, 1.13, *sorted((xf.p(0.6, 0, 0)[2] - 0.1, xf.p(0.6, 0, 0)[2] + 0.1)), '#e8e0c8')   # 登記簿
    elif k == 'turnstile':
        for j in range(it['lanes'] + 1):
            x = it['x'] - 1.4 + j * 1.2 + (0.0 if j < 3 else -0.2)
            xf = Xf(x, it['z']); xf.rbox(acc('steel'), -0.06, 0.06, 0.0, 1.0, -0.45, 0.45, r=0.04, seg=2)
            VC.cbox(x - 0.05, x + 0.05, 1.0, 1.02, it['z'] + 0.25, it['z'] + 0.38, '#40c060')   # 綠燈（刷學生證的讀卡區）
            if j < it['lanes']: acc('steel').cyl((x + 0.06, 0.85, it['z']), (x + 0.6, 0.85, it['z']), 0.015, seg=6)
    elif k in ('stairs_up', 'stairs_down'):
        x0, x1, z0, z1 = it['x0'], it['x1'], it['z0'], it['z1']
        if k == 'stairs_up':                                                                            # 第一跑：從 z1（地面）往 −z 上到平台 2.1 m
            n = 14; run = (z1 - z0 - 1.6) / n
            for j in range(n): zz = z1 - (j + 1) * run; X0_.rbox(acc('stone'), x0, x1, 0.0, (j + 1) * 0.15, zz, zz + run + 0.02, r=0.01, seg=1)
            X0_.rbox(acc('stone'), x0, x1, 0.0, 2.1, z0, z0 + 1.6, r=0.01, seg=1)
            acc('steel').cyl((x1, 1.0, z1), (x1, 3.1, z0 + 1.6), 0.025, seg=6)
            for j in range(6): t = j / 5; acc('steel').cyl((x1, t * 2.1, z1 - t * (z1 - z0 - 1.6)), (x1, t * 2.1 + 1.0, z1 - t * (z1 - z0 - 1.6)), 0.015, seg=5)
            sx0, sz = x1 + 0.2, z1 + 0.15
        else:                                                                                           # 往 B1：地上的樓梯井（從 z1 的開口往 −z 下去；B1 那一跑是往 +z 上來）＋欄杆
            acc('steel_dk').box(x0 + 0.005, x1 - 0.005, -2.2, -2.105, z0 + 0.005, z1 - 0.005)   # 縮 5 mm：側面原本和兩側的石牆、頂面和最下面一階疊在一起
            n = 14; run = (z1 - z0) / n
            for j in range(n): zz = z1 - (j + 1) * run; X0_.rbox(acc('stone'), x0, x1, -2.2, -(j + 1) * 0.15, zz, zz + run, r=0.01, seg=1)   # BUG-GYM-STAIRS-1020：原本 zz＝z0＋j·run，第一階在北端、畫反了（開口、紅龍、「下樓到 B1」都在 z1）
            for (a, b) in (((x0, z0), (x1, z0)), ((x0, z0), (x0, z1)), ((x0, z1), (x1 - 1.2, z1))):
                acc('steel').cyl((a[0], 1.0, a[1]), (b[0], 1.0, b[1]), 0.025, seg=6)
                L_ = math.hypot(b[0] - a[0], b[1] - a[1]); m = max(1, int(L_ / 0.9))
                for j in range(m + 1): t = j / m; acc('steel').cyl((a[0] + (b[0] - a[0]) * t, 0.0, a[1] + (b[1] - a[1]) * t), (a[0] + (b[0] - a[0]) * t, 1.0, a[1] + (b[1] - a[1]) * t), 0.015, seg=5)
            sx0, sz = x0 - 0.2, z1 - 0.3
        # 紅龍（不鏽鋼柱＋紅繩）拿掉了：3F 主球場（ART-GYM2-INT，LAWWW2 2026-10-21）、B1（f3180c69）都開了，樓梯口留 A 字架的樓層告示
        sxm = (x0 + x1) / 2; szm = (sz if k == 'stairs_up' else z1 + 0.25)                              # 告示牌（A 字架）
        Xf(sxm, szm + 0.35).rbox(acc('white'), -0.3, 0.3, 0.55, 1.2, -0.02, 0.02, r=0.01, seg=1)
        PLATE.append((f'PLATE_FACE_gym_{k}', [(sxm - 0.27, 0.6, szm + 0.375), (sxm + 0.27, 0.6, szm + 0.375), (sxm + 0.27, 1.15, szm + 0.375), (sxm - 0.27, 1.15, szm + 0.375)],
                      {'plate': 'notice', 'text': '3F 主球場' if k == 'stairs_up' else 'B1 游泳池・健身中心', 'sub': '今日不開放', 'bg': '#f4f1ea', 'color': '#a3262a'}))
    elif k == 'vending':
        for j in range(it['n']):
            x = it['x'] - 0.55 + j * 1.1; xf = Xf(x, it['z'], math.pi)
            xf.rbox(acc('white'), -0.5, 0.5, 0.0, 1.85, -0.35, 0.35, r=0.03, seg=2)
            VC.cbox(x - 0.42, x + 0.18, 0.75, 1.75, it['z'] - 0.36, it['z'] - 0.35, '#2a3a4a')
            for r in range(5):
                for c in range(5): VC.cbox(x - 0.4 + c * 0.11, x - 0.33 + c * 0.11, 0.8 + r * 0.19, 0.95 + r * 0.19, it['z'] - 0.37, it['z'] - 0.36, ['#d84a3a', '#3a8ad8', '#f0d040', '#5ab05a', '#f4f4f0'][(r + c) % 5])
            CL.glow(root, 'vending', x - 0.1, 1.3, it['z'] - 0.6, color='rgba(230,240,255,1)', size=1.4, day=0.2, night=0.8)
    elif k == 'fountain':
        xf = Xf(it['x'], it['z'], math.pi); xf.rbox(acc('steel'), -0.25, 0.25, 0.0, 0.95, -0.2, 0.2, r=0.04, seg=2); xf.rbox(acc('steel'), -0.3, 0.3, 0.95, 1.0, -0.28, 0.2, r=0.03, seg=2)
    elif k == 'bench':
        xf = Xf(it['x'], it['z'], it['ry']); xf.rbox(acc('wood'), -0.9, 0.9, 0.42, 0.47, -0.25, 0.25, r=0.015, seg=2)
        for sx in (-0.75, 0.75): xf.rbox(acc('steel_dk'), sx - 0.03, sx + 0.03, 0.0, 0.42, -0.22, 0.22, r=0.008, seg=1)
    elif k == 'hours_board':
        acc('steel_dk').box(it['x'] - it['w'] / 2 - 0.05, it['x'] + it['w'] / 2 + 0.05, it['y'] - it['h'] / 2 - 0.05, it['y'] + it['h'] / 2 + 0.05, it['z'] - 0.02, it['z'])
        img_quad('hours', M['hours'], [(it['x'] - it['w'] / 2, it['y'] - it['h'] / 2, it['z'] + 0.002), (it['x'] + it['w'] / 2, it['y'] - it['h'] / 2, it['z'] + 0.002), (it['x'] + it['w'] / 2, it['y'] + it['h'] / 2, it['z'] + 0.002), (it['x'] - it['w'] / 2, it['y'] + it['h'] / 2, it['z'] + 0.002)])
    elif k == 'trophy':
        xf = Xf(it['x'], it['z']); w = it['w']; xf.rbox(acc('wood'), -w / 2, w / 2, 0.0, 0.9, -0.22, 0.22, r=0.02, seg=2)
        acc('glass').box(it['x'] - w / 2 + 0.05, it['x'] + w / 2 - 0.05, 0.9, 2.1, it['z'] - 0.2, it['z'] + 0.2)
        for j in range(5): X0_.lathe(acc('brass'), [(0.0, 0.0), (0.06, 0.0), (0.03, 0.05), (0.03, 0.15), (0.08, 0.22), (0.07, 0.3), (0.0, 0.28)], it['x'] - 0.9 + j * 0.45, 0.95 + (j % 2) * 0.55, it['z'], seg=10)

# ======================== 第二會場（SET_SECONDHALL；平常藏起來）========================
sg = B.group('SET_SECONDHALL', root, {'set': 'second_hall'})
scr = Mesh('SET_SECONDHALL_screen', M['screen']); scr.box(X0 + 0.3, X0 + 0.35, 2.6, 6.2, -8.2, 0.2); scr.finish(sg, uv=False)
sfr = Mesh('SET_SECONDHALL_frame', M['steel_dk']); sfr.box(X0 + 0.25, X0 + 0.3, 2.5, 6.3, -8.3, 0.3)
for zz in (-8.0, 0.0): sfr.box(X0 + 0.3, X0 + 1.5, 0.0, 2.6, zz - 0.05, zz + 0.05)
sfr.finish(sg, uv=False)
ch = Mesh('gym_chair_proto', M['chair']); cx = Xf(0, 0)
cx.rbox(ch, -0.22, 0.22, 0.44, 0.47, -0.2, 0.22, r=0.02, seg=1); cx.rbox(ch, -0.21, 0.21, 0.6, 0.86, -0.23, -0.2, r=0.02, seg=1)
for sx in (-0.2, 0.2): cx.cyl(ch, (sx, 0.0, -0.22), (sx, 0.86, -0.22), 0.012, seg=5); cx.cyl(ch, (sx, 0.0, 0.2), (sx, 0.45, 0.15), 0.012, seg=5)
cho = ch.finish(None, uv=False); chm = cho.data; bpy.data.objects.remove(cho)
n = 0
for xi in range(20):
    x = -14.5 + xi * 1.0
    for zi in range(16):
        z = -13.5 + zi * 1.2
        if abs(z + 4.0) < 0.7: continue                                                                # 中間留一條走道
        ob = B.instance(chm, f'SET_SECONDHALL_chair_{n}', x, 0.0, z, sg, ry=-math.pi / 2); n += 1

# ======================== 收尾 ========================
for k_, m in _acc.items(): m.finish(root, uv=True, smooth=True)
for side, ms in walls.items():
    for m in ms: m.name = f'WALL_{side}_{m.name}'; m.finish(root, uv=True, props={'dir': DIRS[side]})
for name, mat, pts, uv, side in IMGS:
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); f = bm.faces.new([bm.verts.new(g2b(*q)) for q in pts]); u0, v0, u1, v1 = uv
    for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = t
    nm = f'WALL_{side}_{name}' if side else P + name; me = bpy.data.meshes.new(nm); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    ob = bpy.data.objects.new(nm, me); B.scene().collection.objects.link(ob); ob.parent = root
    if side: ob['dir'] = DIRS[side]
for name, pts, props in PLATE:
    pm = Mesh(name, base['board']); pm.quad(pts); CL.uv01(pm.finish(root, uv=True, props=props))
VC.finish(root, uv=False)
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name or 'SET_' in ob.name or (ob.parent is not None and 'SET_' in ob.parent.name), key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
# PERF-SINGLESIDE-GLB-1025（LAWWW2-B 2026-10-25）：材質改單面（lib2.single_side）——遊戲把 WALL_* 設成 transparent 才能淡出，雙面又半透明要畫兩次。
# 封閉的殼直接單面；開口的零件補反面，看起來和原本一樣；原本就單面的（天花板朝下、屋頂）不動；玻璃照舊雙面；*_FACE_* 板面不動網格
_ss = L.single_side(root, keep=r'glass', skip=lambda ob: 'FACE' in ob.name)
print('{"single_side": %s}' % json.dumps({k: v for k, v in sorted(_ss.items(), key=lambda kv: -kv[1][1])}, ensure_ascii=False))
info = L.export(OUT, gpu_instances=True)
info.update({'layout': LAY['version'], 'set_second_hall_chairs': n})
L.write_json(OUT[:-4] + '.json', info)
