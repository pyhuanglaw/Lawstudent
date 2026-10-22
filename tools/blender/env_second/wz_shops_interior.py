"""溫州街三家新店的室內（ART-WZ3，LAWWW2-B 2026-10-16）→ GLB。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/wz_shops_interior.py -- --shop brunch|print|teahouse [--out 路徑]
配置（家具位置、大小、座位、導航阻擋）只寫在 src/data/wz_shops_layout.js，這裡讀同一份。座標＝遊戲區域座標（room()：中心在原點、店門在 +z）。
會淡出的牆：WALL_<front|back|left|right>_*（自訂屬性 dir；遊戲 attachRoomGLB）；掛在牆上的東西也放進牆的組（牆淡出時一起藏）。
美術方向（使用者 07:1x）：「日系加一點寫實 不要很像積木」——家具用倒角、旋轉體、圓柱，木頭、布、陶、金屬分開，生活痕跡（杯子、紙疊、鞋子）。"""
import json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
import cafe_layout as CL   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from cafe_layout import uv01, bush, pot   # noqa: E402
import plants as PL   # noqa: E402（cafe_layout 已經把 tools/blender 加進 sys.path）
_PLM = {}

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
SHOP = arg('--shop', 'brunch')
ALL = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./src/data/wz_shops_layout.js')))"], cwd=L.ROOT))
LAY = ALL[SHOP]
OUT = os.path.join(L.ROOT, arg('--out', LAY['glb']))
W, D, H = LAY['w'], LAY['d'], LAY['h']
if SHOP == 'teahouse': X0, X1, Z0, Z1 = -W / 2, W / 2, -5.0, 5.0      # 房子本體 z −5～5（緣側、前院在外面）
else: X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
GEN = os.path.join(HERE, 'textures', 'gen')
random.seed(164)
B.reset(texres=512)
root = B.group(f'wz_{SHOP}_interior', props={'kind': f'wz_{SHOP}_interior', 'w': W, 'd': D, 'h': H, 'layout': ALL['version']})
base = CL.materials()


def img_mat(name, fn, rough=0.6, emit=0.0, clip=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if clip:
        r = N.new('ShaderNodeMath'); r.operation = 'ROUND'; nt.links.new(tx.outputs['Alpha'], r.inputs[0]); nt.links.new(r.outputs[0], bs.inputs['Alpha'])
        try: m.surface_render_method = 'DITHERED'
        except Exception: pass
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    m['tile'] = 1.0; return m


P = 'wzs_'
M = {
    'wood_lt': L.pbr(P + 'wood_light', 'walnut_veneer', tile=0.9, target='#b48a5e', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.55),
    'wood_dk': L.pbr(P + 'wood_dark', 'dark_wood', tile=0.8, target='#5a3c28', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.6),
    'steel': L.flat(P + 'steel', '#b9bdc0', rough=0.28, metal=0.45), 'black': L.flat(P + 'black_metal', '#2a2a2c', rough=0.45, metal=0.3),
    'white': L.flat(P + 'white', '#f1efe9', rough=0.4), 'ceramic': L.flat(P + 'ceramic', '#f4f1ea', rough=0.25),
    'glass': base['glass'], 'frame_alu': L.flat(P + 'alu', '#c9ccce', rough=0.35, metal=0.4),
    'bulb': L.flat(P + 'bulb', '#fff4dc', rough=0.3, emit=B.srgb('#ffdcaa')), 'tube': L.flat(P + 'tube', '#ffffff', rough=0.3, emit=B.srgb('#f4f8ff')),
    'vc': L.vc_material(P + 'vc', rough=0.7), 'leaf': CL.leaf_mat(P + 'leaf_broad', 'broad_leaves.png'), 'pothos': CL.leaf_mat(P + 'leaf_pothos', 'pothos_leaf.png'),
    'soil': L.flat(P + 'soil', '#3e3024', rough=0.95), 'terra': L.flat(P + 'terracotta', '#b0653e', rough=0.8),
}
VC = L.CMesh(P + 'vc_parts', M['vc'])           # 小零件（顏色放頂點色，一次 draw call）


class Xf:
    """物件自己的座標（x 右、z 前、y 上；正面朝 +z）→ 區域座標：中心 (px,pz)、轉 ry"""
    def __init__(self, px, pz, ry=0.0): self.px, self.pz, self.c, self.s, self.ry = px, pz, math.cos(ry), math.sin(ry), ry
    def p(self, x, y, z): return (self.px + x * self.c + z * self.s, y, self.pz - x * self.s + z * self.c)
    def M(self, x, y, z, extra=None):
        m = Matrix.Translation(g2b(*self.p(x, y, z))) @ Matrix.Rotation(self.ry, 4, 'Z'); return m @ extra if extra is not None else m
    def rbox(self, m, x0, x1, y0, y1, z0, z1, r=0.02, seg=2):
        bm = L.rbox_bm(x1 - x0, y1 - y0, z1 - z0, r, seg); m.add_bm(bm, self.M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)); bm.free(); return m
    def cyl(self, m, a, b, r, **kw): m.cyl(self.p(*a), self.p(*b), r, **kw); return m
    def lathe(self, m, prof, x, y, z, seg=16):
        bm = L.lathe(prof, seg=seg); m.add_bm(bm, self.M(x, y, z)); bm.free(); return m
    def vbox(self, x0, x1, y0, y1, z0, z1, col, r=0.012):
        """頂點色的倒角方塊（只轉 π/2 的倍數時用）"""
        a = self.p(x0, y0, z0); b = self.p(x1, y1, z1)
        VC.crbox(min(a[0], b[0]), max(a[0], b[0]), y0, y1, min(a[2], b[2]), max(a[2], b[2]), col, r=r, seg=2)


_acc = {}
def acc(key):
    mat = M[key]
    if mat.name not in _acc: _acc[mat.name] = Mesh(P + key, mat)
    return _acc[mat.name]


# ---------------- 牆（淡出的組）----------------
walls = {'front': [], 'back': [], 'left': [], 'right': [], 'engawa': []}
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0], 'engawa': [0, 0, -1]}   # engawa：一盞緣側上方的橫樑（鏡頭在庭院那一側時跟著淡出）
WALL_IMGS = []   # (side, name, mat, pts, uv)
def wm(side, key):
    for m in walls[side]:
        if m.mat == M[key]: return m
    m = Mesh(f'{side}_{key}', M[key]); walls[side].append(m); return m


def wvc(side):
    """牆的組裡的頂點色零件（掛在牆上的小東西：罐子）"""
    for m in walls[side]:
        if isinstance(m, L.CMesh): return m
    m = L.CMesh(f'{side}_vc', M['vc']); walls[side].append(m); return m


def wall_box(side, key, a0, a1, y0, y1, t0=0.0, t1=0.12):
    m = wm(side, key)
    if side == 'back': m.box(a0, a1, y0, y1, Z0 + t0, Z0 + t1)
    elif side == 'front': m.box(a0, a1, y0, y1, Z1 - t1, Z1 - t0)
    elif side == 'left': m.box(X0 + t0, X0 + t1, y0, y1, a0, a1)
    else: m.box(X1 - t1, X1 - t0, y0, y1, a0, a1)


def wall_img(side, name, mat, cx, cy, w, h, off=0.125, uv=(0, 0, 1, 1)):
    """牆上的圖（黑板、價目表、掛軸、時鐘面）：在牆的內面前 off，cx＝沿著牆的座標"""
    if side == 'back': pts = [(cx - w / 2, cy - h / 2, Z0 + off), (cx + w / 2, cy - h / 2, Z0 + off), (cx + w / 2, cy + h / 2, Z0 + off), (cx - w / 2, cy + h / 2, Z0 + off)]
    elif side == 'left': pts = [(X0 + off, cy - h / 2, cx + w / 2), (X0 + off, cy - h / 2, cx - w / 2), (X0 + off, cy + h / 2, cx - w / 2), (X0 + off, cy + h / 2, cx + w / 2)]
    elif side == 'right': pts = [(X1 - off, cy - h / 2, cx - w / 2), (X1 - off, cy - h / 2, cx + w / 2), (X1 - off, cy + h / 2, cx + w / 2), (X1 - off, cy + h / 2, cx - w / 2)]
    else: pts = [(cx + w / 2, cy - h / 2, Z1 - off), (cx - w / 2, cy - h / 2, Z1 - off), (cx - w / 2, cy + h / 2, Z1 - off), (cx + w / 2, cy + h / 2, Z1 - off)]
    WALL_IMGS.append((side, name, mat, pts, uv))


def finish_wall_imgs():
    for side, name, mat, pts, uv in WALL_IMGS:
        bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); f = bm.faces.new([bm.verts.new(g2b(*q)) for q in pts]); u0, v0, u1, v1 = uv
        for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = t
        me = bpy.data.meshes.new(f'WALL_{side}_{name}'); bm.to_mesh(me); bm.free(); me.materials.append(mat)
        ob = bpy.data.objects.new(f'WALL_{side}_{name}', me); B.scene().collection.objects.link(ob); ob.parent = root; ob['dir'] = DIRS[side]


def front_wall(lower, upper, wains, frame_key, door_style='glass'):
    """店面那一面：門＋窗（layout.front），窗台以下 lower、窗頂以上 upper；門、窗框用 frame_key；玻璃"""
    fr = LAY['front']; sill, head = fr.get('sill', 0.8), fr.get('head', 2.5); dx, dw = fr['door']['x'], fr['door']['w']; dh = 2.2
    ops = sorted([(a, b, 'win') for a, b in fr['windows']] + [(dx - dw / 2, dx + dw / 2, 'door')])
    xs = [X0]
    for a, b, k in ops: xs += [a, b]
    xs.append(X1)
    for i in range(0, len(xs), 2):                                     # 實牆段
        a, b = xs[i], xs[i + 1]
        if b - a < 1e-3: continue
        wall_box('front', lower, a, b, 0.0, wains); wall_box('front', upper, a, b, wains, H)
    for a, b, k in ops:
        top = dh if k == 'door' else head
        wall_box('front', upper, a, b, top, H)
        if k == 'win': wall_box('front', lower, a, b, 0.0, sill)
        f_ = wm('front', frame_key); y0 = 0.0 if k == 'door' else sill
        f_.box(a, b, top - 0.05, top + 0.02, Z1 - 0.14, Z1 - 0.02)
        if k == 'win': f_.box(a, b, sill - 0.02, sill + 0.05, Z1 - 0.16, Z1 - 0.0)
        n = max(1, round((b - a) / 1.0))
        for j in range(n + 1): x = a + j * (b - a) / n; f_.box(x - 0.03, x + 0.03, y0, top, Z1 - 0.14, Z1 - 0.02)
        wm('front', 'glass').quad([(b, y0 + 0.02, Z1 - 0.08), (a, y0 + 0.02, Z1 - 0.08), (a, top - 0.03, Z1 - 0.08), (b, top - 0.03, Z1 - 0.08)])
        if k == 'door': f_.box(dx + 0.08, dx + 0.11, 0.9, 1.3, Z1 - 0.2, Z1 - 0.14)        # 門把


def side_walls(lower, upper, wains, trim=None, sides=('back', 'left', 'right')):
    for side in sides:
        a0, a1 = (X0, X1) if side == 'back' else (Z0, Z1)
        wall_box(side, lower, a0, a1, 0.0, wains); wall_box(side, upper, a0, a1, wains, H)
        if trim: wall_box(side, trim, a0, a1, wains - 0.03, wains + 0.03, 0.0, 0.14)


def floor_ceiling(fkey, ckey, ftile=None):
    Mesh(P + 'floor', M[fkey], tile=ftile).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(root)
    ce = Mesh(P + 'ceiling', M[ckey]); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(root, uv=True)


# ---------------- 共用家具 ----------------
def chair(x, z, ry, seat='wood_lt', leg='wood_dk', back=True):
    xf = Xf(x, z, ry); s = acc(seat); l = acc(leg)
    xf.rbox(s, -0.21, 0.21, 0.43, 0.47, -0.21, 0.21, r=0.015)
    for sx in (-0.17, 0.17):
        for sz in (-0.17, 0.17): xf.cyl(l, (sx, 0.0, sz), (sx * 1.02, 0.43, sz * 1.02), 0.018, seg=8)
    if back:
        for sx in (-0.17, 0.17): xf.cyl(l, (sx, 0.45, -0.18), (sx, 0.88, -0.22), 0.016, seg=8)
        xf.rbox(s, -0.19, 0.19, 0.7, 0.86, -0.235, -0.205, r=0.01)


def plant(x, z, h=1.0, leaf='leaf', r=0.2):
    pm = acc('terra'); pot(pm, x, z, r, r * 1.5)
    if not _PLM: _PLM.update(PL.materials(P + 'pl_'))
    PL.potted(B.mesh_obj, _PLM, f'{P}plant_{x:.1f}_{z:.1f}', root, x, r * 1.5, z, r, seed=int(abs(x * 31 + z * 17)) + 3, h=h * 1.15)   # v2：模型葉子（葉片卡遠看像折紙）
    PL.broad_plant(B.mesh_obj, _PLM, f'{P}plant_{x:.1f}_{z:.1f}b', root, x, r * 1.48, z, h * 1.2, max(0.45, h * 0.45), seed=int(abs(x * 31 + z * 17)) + 9)   # 葉子大小照植物大小
def g2bp(x, y, z): return (x, y, z)


def pendant(x, z, y=2.3, shade='black', bulb_r=0.06, glow=True, kind='cone'):
    acc('black').cyl((x, H, z), (x, y + 0.2, z), 0.005, seg=4)
    if kind == 'cone': Xf(x, z).lathe(acc(shade), [(0.03, 0.2), (0.05, 0.18), (0.16, 0.02), (0.17, 0.0), (0.16, 0.0)], 0, y, 0, seg=16)
    elif kind == 'washi': Xf(x, z).lathe(acc(shade), [(0.0, 0.0), (0.14, 0.0), (0.2, 0.12), (0.2, 0.3), (0.14, 0.42), (0.0, 0.42)], 0, y - 0.1, 0, seg=16)
    acc('bulb').sphere((x, y + 0.02, z), bulb_r, seg=10, rings=6)
    if glow: CL.glow(root, 'pendant', x, y - 0.05, z, color='rgba(255,214,160,1)', size=1.5, day=0.2, night=1.0)


# ======================================================================
def build_brunch():
    M.update({'floor': L.pbr(P + 'oak_floor', 'laminate_floor_02', tile=1.6, target='#b89670', normal=0.5, maps=('diff', 'nor'), rough_value=0.55),
              'tile': L.pbr(P + 'subway', 'long_white_tiles', tile=0.8, target='#eeece6', normal=0.6, maps=('diff', 'nor'), rough_value=0.3),
              'paint': L.flat(P + 'paint_cream', '#f3ede2', rough=0.85), 'ceil': L.flat(P + 'ceiling', '#f4efe6', rough=0.9, cull=True),
              'board': img_mat(P + 'board', 'brunch_board.png', rough=0.85), 'clock': img_mat(P + 'clock', 'clock_face.png', rough=0.5),
              'eggprint': img_mat(P + 'eggprint', 'egg_print.png', rough=0.7), 'griddle': L.flat(P + 'griddle', '#3a3836', rough=0.35, metal=0.4)})
    floor_ceiling('floor', 'ceil')
    side_walls('wood_lt', 'paint', 1.0, trim='wood_dk', sides=('left', 'right'))
    wall_box('back', 'tile', X0, X1, 0.0, 1.9); wall_box('back', 'paint', X0, X1, 1.9, H)
    front_wall('wood_lt', 'paint', 1.0, 'wood_dk')
    it = {i['kind']: i for i in LAY['items']}
    # 後牆的料理台：不鏽鋼下櫃、煎台、爐子、水槽、咖啡機、盤子、排煙罩
    k = it['kitchen_line']; x0, x1, z0, z1 = k['x'] - k['w'] / 2, k['x'] + k['w'] / 2, k['z'] - k['d'] / 2, k['z'] + k['d'] / 2
    xf = Xf(0, 0); xf.rbox(acc('steel'), x0, x1, 0.0, 0.88, z0, z1, r=0.01); xf.rbox(acc('steel'), x0 - 0.02, x1 + 0.02, 0.88, 0.92, z0, z1 + 0.02, r=0.008)
    for j in range(5): xx = x0 + 0.1 + j * (k['w'] - 0.2) / 5; acc('black').box(xx + 0.4, xx + 0.43, 0.6, 0.64, z1, z1 + 0.03)   # 櫃門把手
    xf.rbox(acc('griddle'), x0 + 0.2, x0 + 1.1, 0.92, 0.97, z0 + 0.08, z1 - 0.08, r=0.01)                                              # 煎台
    for j in range(2): Xf(x0 + 1.45 + j * 0.42, (z0 + z1) / 2).lathe(acc('black'), [(0.0, 0.0), (0.13, 0.0), (0.14, 0.02), (0.0, 0.02)], 0, 0.92, 0)   # 爐口
    acc('griddle').box(x0 + 2.4, x0 + 3.0, 0.86, 0.92, z0 + 0.12, z1 - 0.12)                                                            # 水槽
    acc('steel').cyl((x0 + 2.7, 0.92, z0 + 0.1), (x0 + 2.7, 1.25, z0 + 0.1), 0.015, seg=6); acc('steel').cyl((x0 + 2.7, 1.25, z0 + 0.1), (x0 + 2.7, 1.22, z0 + 0.3), 0.012, seg=6)
    cx = x0 + 3.6; xf.rbox(acc('steel'), cx - 0.35, cx + 0.35, 0.92, 1.38, z0 + 0.05, z0 + 0.5, r=0.03); xf.rbox(acc('black'), cx - 0.3, cx + 0.3, 1.0, 1.08, z0 + 0.45, z0 + 0.55, r=0.01)
    for j in (-0.15, 0.15): acc('black').cyl((cx + j, 1.2, z0 + 0.5), (cx + j, 1.1, z0 + 0.58), 0.03, seg=8)                           # 咖啡機的沖煮頭
    for j in range(3): Xf(x0 + 4.4, z0 + 0.3).lathe(acc('ceramic'), [(0.0, 0.0), (0.12, 0.0), (0.13, 0.015), (0.0, 0.015)], 0, 0.92 + j * 0.02, 0)   # 盤子疊
    # 排煙罩、開放層架、杯子、罐子掛在後牆上：放進後牆的組（鏡頭退到後牆外面、後牆淡出時一起藏；原本留著，坐第一張桌子時排煙罩的煙囪擋住整個畫面，LAWWW2 10-22 j23）
    xf.rbox(wm('back', 'steel'), x0 + 0.05, x0 + 1.3, 2.05, 2.15, z0, z0 + 0.7, r=0.01); xf.rbox(wm('back', 'steel'), x0 + 0.35, x0 + 1.0, 2.15, H, z0, z0 + 0.35, r=0.01)   # 排煙罩
    for j in range(2): xf.rbox(wm('back', 'wood_lt'), x0 + 1.6, x1 - 0.2, 1.55 + j * 0.4, 1.58 + j * 0.4, Z0 + 0.12, Z0 + 0.36, r=0.008)          # 開放層架
    for j in range(8): Xf(x0 + 1.75 + j * 0.3, Z0 + 0.24).lathe(wm('back', 'ceramic'), [(0.0, 0.0), (0.045, 0.0), (0.05, 0.09), (0.045, 0.09)], 0, 1.98, 0, seg=10)   # 杯子
    for j in range(5):
        col = ['#c8a26a', '#e3d6b0', '#7a5a3a', '#d9c7a0', '#9a6a3a'][j]; cx_ = x0 + 1.8 + j * 0.45; wvc('back').crbox(cx_ - 0.06, cx_ + 0.06, 1.58, 1.8, Z0 + 0.18, Z0 + 0.30, col, r=0.012)   # 罐子
    f_ = it['fridge']; Xf(f_['x'], f_['z']).rbox(acc('steel'), -f_['w'] / 2, f_['w'] / 2, 0.0, f_['h'], -f_['d'] / 2, f_['d'] / 2, r=0.03)
    for y0_, y1_ in ((1.1, 1.75), (0.15, 0.95)): acc('black').box(f_['x'] - 0.3, f_['x'] - 0.27, y0_ + 0.2, y1_ - 0.2, f_['z'] + f_['d'] / 2, f_['z'] + f_['d'] / 2 + 0.04)
    # 出餐檯：木頭檯身、檯面、上面一層出餐板（兩根柱）、保溫燈；右端是蛋計時器
    pc = it['pass_counter']; x0, x1 = pc['x'] - pc['w'] / 2, pc['x'] + pc['w'] / 2; z0, z1 = pc['z'] - pc['d'] / 2, pc['z'] + pc['d'] / 2
    xf.rbox(acc('wood_dk'), x0, x1, 0.0, pc['h'] - 0.04, z0, z1, r=0.015); xf.rbox(acc('wood_lt'), x0 - 0.03, x1 + 0.03, pc['h'] - 0.04, pc['h'], z0 - 0.04, z1 + 0.06, r=0.01)
    for j in range(6): xx = x0 + 0.2 + j * (pc['w'] - 0.4) / 5; xf.rbox(acc('wood_lt'), xx - 0.012, xx + 0.012, 0.08, pc['h'] - 0.08, z1, z1 + 0.012, r=0.004)   # 檯身的木條
    for xx in (x0 + 0.1, x1 - 0.1): acc('black').cyl((xx, pc['h'], pc['z']), (xx, 1.48, pc['z']), 0.018, seg=8)
    xf.rbox(acc('steel'), x0, x1, 1.45, 1.49, z0 + 0.04, z1 - 0.04, r=0.008)
    for xx in (pc['x'] - 1.0, pc['x'] + 1.0):
        acc('black').cyl((xx, H, pc['z']), (xx, 1.95, pc['z']), 0.006, seg=4); Xf(xx, pc['z']).lathe(acc('black'), [(0.02, 0.18), (0.04, 0.16), (0.12, 0.0), (0.13, 0.0)], 0, 1.77, 0, seg=14)
        acc('bulb').sphere((xx, 1.8, pc['z']), 0.05, seg=8, rings=5); CL.glow(root, 'heatlamp', xx, 1.7, pc['z'], color='rgba(255,170,100,1)', size=1.0, day=0.3, night=0.8)
    tx = x1 - 0.25; Xf(tx, pc['z']).lathe(acc('white'), [(0.0, 0.0), (0.035, 0.0), (0.04, 0.03), (0.032, 0.07), (0.0, 0.075)], 0, pc['h'], 0, seg=12)   # 蛋計時器
    for j in range(2): Xf(pc['x'] - 0.4 + j * 0.6, pc['z']).lathe(acc('ceramic'), [(0.0, 0.0), (0.12, 0.0), (0.13, 0.02), (0.0, 0.02)], 0, 1.49, 0)   # 出餐板上的盤子
    # 結帳櫃台＋蛋糕櫃
    ca = it['cashier']; x0, x1, z0, z1 = ca['x'] - ca['w'] / 2, ca['x'] + ca['w'] / 2, ca['z'] - ca['d'] / 2, ca['z'] + ca['d'] / 2
    xf.rbox(acc('wood_dk'), x0, x1, 0.0, ca['h'] - 0.04, z0, z1, r=0.015); xf.rbox(acc('wood_lt'), x0 - 0.04, x1 + 0.02, ca['h'] - 0.04, ca['h'], z0 - 0.02, z1 + 0.02, r=0.01)
    Xf(ca['x'], z0 + 0.3, -math.pi / 2).vbox(-0.15, 0.15, ca['h'], ca['h'] + 0.06, -0.12, 0.12, '#2c2c2e'); Xf(ca['x'] - 0.05, z0 + 0.3).vbox(-0.02, 0.02, ca['h'] + 0.06, ca['h'] + 0.3, -0.12, 0.12, '#1e2a36')
    acc('glass').box(x0 + 0.05, x1 - 0.05, ca['h'], ca['h'] + 0.35, z1 - 0.6, z1 - 0.05)
    for j in range(3): Xf(ca['x'], z1 - 0.45 + j * 0.17).lathe(acc('white'), [(0.0, 0.0), (0.07, 0.0), (0.07, 0.07), (0.0, 0.07)], 0, ca['h'] + 0.01, 0, seg=12)
    # 桌椅
    for t in LAY['items']:
        if t['kind'] == 'table2':
            xf = Xf(t['x'], t['z']); xf.rbox(acc('wood_lt'), -0.35, 0.35, 0.72, 0.76, -0.35, 0.35, r=0.015)
            xf.cyl(acc('black'), (0, 0.0, 0), (0, 0.72, 0), 0.035, seg=10); xf.lathe(acc('black'), [(0.0, 0.0), (0.24, 0.0), (0.22, 0.03), (0.0, 0.03)], 0, 0, 0, seg=16)
        elif t['kind'] == 'table4':
            xf = Xf(t['x'], t['z']); xf.rbox(acc('wood_lt'), -0.4, 0.4, 0.72, 0.76, -0.65, 0.65, r=0.015)
            for sx in (-0.33, 0.33):
                for sz in (-0.58, 0.58): xf.cyl(acc('wood_dk'), (sx, 0.0, sz), (sx, 0.72, sz), 0.025, seg=8)
    for s in LAY['seats']: chair(s['x'], s['z'], s['yaw'])   # 椅子正面＝坐的人面向的方向（遊戲 sitAt：rotation.y＝seat.yaw）；v2 加了 π，整排椅背卡在人和桌子中間（LAWWW2 10-22）
    for s in LAY['seats'][::2]:                                                                              # 桌上的東西：水杯、餐巾
        tb = next(t for t in LAY['items'] if t['kind'] in ('table2', 'table4') and abs(t['x'] - s['x']) < 1.0 and abs(t['z'] - s['z']) < 1.0)
        Xf(tb['x'] + 0.12, tb['z'] - 0.1).lathe(acc('glass'), [(0.0, 0.0), (0.035, 0.0), (0.04, 0.11), (0.0, 0.11)], 0, 0.76, 0, seg=10)
        Xf(tb['x'] - 0.1, tb['z'] + 0.08).vbox(-0.05, 0.05, 0.76, 0.84, -0.04, 0.04, '#f4f1ea')
    # 牆上：大時鐘（左牆）、黑板（後牆上方）、蛋的線條畫、層架＋小盆栽
    c = it['clock']; wall_img('left', 'clock', M['clock'], c['z'], c['y'], c['r'] * 2, c['r'] * 2, off=0.15)
    cr = wm('left', 'black')
    for j in range(24):
        a0 = j / 24 * 2 * math.pi; a1 = (j + 1) / 24 * 2 * math.pi; R = c['r'] + 0.02
        cr.cyl((X0 + 0.14, c['y'] + math.sin(a0) * R, c['z'] + math.cos(a0) * R), (X0 + 0.14, c['y'] + math.sin(a1) * R, c['z'] + math.cos(a1) * R), 0.022, seg=5)
    cb = it['chalkboard']; wall_img('back', 'board', M['board'], cb['x'], cb['y'], cb['w'], cb['h'], off=0.13)
    wm('back', 'wood_dk').box(cb['x'] - cb['w'] / 2 - 0.05, cb['x'] + cb['w'] / 2 + 0.05, cb['y'] - cb['h'] / 2 - 0.05, cb['y'] + cb['h'] / 2 + 0.05, Z0 + 0.1, Z0 + 0.125)
    wall_img('right', 'eggprint', M['eggprint'], 1.0, 1.75, 0.45, 0.6, off=0.15); wm('right', 'wood_dk').box(X1 - 0.15, X1 - 0.12, 1.42, 2.08, 0.75, 1.25)
    sh = it['shelf_wall']; wm('left', 'wood_lt').box(X0 + 0.12, X0 + 0.36, sh['y'], sh['y'] + 0.03, sh['z'] - sh['w'] / 2, sh['z'] + sh['w'] / 2)
    for j in range(3): pz = sh['z'] - 0.4 + j * 0.4; pot(wm('left', 'terra'), X0 + 0.24, pz, 0.07, 0.1, y0=sh['y'] + 0.03); random.seed(j + 9); bush(wm('left', 'pothos'), X0 + 0.24, sh['y'] + 0.2, pz, 0.16, n=6, span=0.5)
    for p_ in (it['plant_big'], [i for i in LAY['items'] if i['kind'] == 'plant_big'][1]): plant(p_['x'], p_['z'], h=1.2)
    # 燈：桌子上方的吊燈、天花板的軌道燈
    for t in LAY['items']:
        if t['kind'] in ('table2', 'table4'): pendant(t['x'], t['z'], y=2.15)
    for zz in (-1.0, 1.8): acc('black').box(-0.9, 1.3, H - 0.04, H - 0.01, zz - 0.02, zz + 0.02)


# ======================================================================
def build_print():
    M.update({'floor': L.pbr(P + 'vinyl', 'large_floor_tiles_02', tile=1.2, target='#b8b7b1', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.45),   # v2：原本的花磚在遊戲裡像黑白棋盤
              'paint': L.flat(P + 'paint_white', '#eef0ee', rough=0.85), 'lower': L.flat(P + 'paint_lower', '#c9ced0', rough=0.6), 'ceil': L.flat(P + 'ceiling', '#f2f2ee', rough=0.9, cull=True),
              'price': img_mat(P + 'price', 'print_price.png', rough=0.6), 'copier': L.flat(P + 'copier', '#e4e4e0', rough=0.4), 'copier_dk': L.flat(P + 'copier_dark', '#4a4e54', rough=0.45),
              'counter': L.flat(P + 'counter_top', '#f2f0ea', rough=0.35), 'counter_fr': L.flat(P + 'counter_front', '#5d7286', rough=0.5), 'paper': L.flat(P + 'paper', '#f8f8f4', rough=0.8),
              'card': L.flat(P + 'cardboard', '#b08a5c', rough=0.9), 'notes': img_mat(P + 'notes', 'shop_notes.png', rough=0.8, clip=True)})
    floor_ceiling('floor', 'ceil')
    side_walls('lower', 'paint', 1.0)
    front_wall('lower', 'paint', 1.0, 'frame_alu')
    it = [i for i in LAY['items']]
    def copier(x, z, ry, big=True):
        xf = Xf(x, z, ry); w, d, h = (0.7, 0.62, 1.05) if big else (0.6, 0.55, 0.95)
        xf.rbox(acc('copier'), -w / 2, w / 2, 0.08, h, -d / 2, d / 2, r=0.03)                                       # 本體
        xf.rbox(acc('copier_dk'), -w / 2 + 0.02, w / 2 - 0.02, 0.0, 0.08, -d / 2 + 0.02, d / 2 - 0.02, r=0.01)      # 底座
        for j in range(3 if big else 2): y = 0.18 + j * 0.2; xf.rbox(acc('copier_dk'), -w / 2 + 0.04, w / 2 - 0.04, y, y + 0.012, d / 2, d / 2 + 0.006, r=0.003)   # 紙匣的縫
        xf.rbox(acc('copier_dk'), -w / 2 + 0.03, w / 2 - 0.03, h, h + 0.06, -d / 2 + 0.03, d / 2 - 0.03, r=0.015)    # 原稿蓋
        xf.rbox(acc('copier_dk'), w / 2 - 0.26, w / 2 - 0.02, h - 0.02, h + 0.04, d / 2 - 0.12, d / 2 + 0.08, r=0.01)   # 操作面板
        Xf(*xf.p(w / 2 - 0.14, 0, d / 2 + 0.04)[0::2], xf.ry).vbox(-0.08, 0.08, h + 0.04, h + 0.045, -0.04, 0.04, '#7ab0d8', r=0.0)
        if big:
            xf.rbox(acc('copier'), w / 2, w / 2 + 0.28, 0.45, 0.95, -d / 2 + 0.05, d / 2 - 0.05, r=0.02)            # 出紙的分頁器
            xf.rbox(acc('paper'), w / 2 + 0.05, w / 2 + 0.3, 0.95, 0.99, -0.15, 0.15, r=0.003)
        else: xf.rbox(acc('copier_dk'), -0.12, 0.12, 0.55, 0.75, d / 2, d / 2 + 0.1, r=0.01)                       # 投幣機
    for t in it:
        k = t['kind']
        if k == 'copier_big': copier(t['x'], t['z'], t['ry'], True)
        elif k == 'copier_self': copier(t['x'], t['z'], t['ry'], False)
        elif k == 'counter':
            xf = Xf(t['x'], t['z']); x0, x1, z0, z1 = -t['w'] / 2, t['w'] / 2, -t['d'] / 2, t['d'] / 2
            xf.rbox(acc('counter_fr'), x0, x1, 0.0, t['h'] - 0.04, z0, z1, r=0.015); xf.rbox(acc('counter'), x0 - 0.02, x1 + 0.02, t['h'] - 0.04, t['h'], z0 - 0.02, z1 + 0.04, r=0.01)
            if t['w'] > 1.5:
                xf.vbox(-0.35, 0.05, t['h'], t['h'] + 0.02, -0.15, 0.1, '#2a2a2c', r=0.005)                          # 鍵盤
                xf.cyl(acc('black'), (-0.1, t['h'], -0.12), (-0.1, t['h'] + 0.2, -0.12), 0.015, seg=6)
                xf.rbox(acc('black'), -0.38, 0.18, t['h'] + 0.18, t['h'] + 0.52, -0.14, -0.11, r=0.01)               # 阿德的螢幕（朝裡面）
                xf.lathe(acc('steel'), [(0.0, 0.0), (0.05, 0.0), (0.05, 0.01), (0.03, 0.05), (0.0, 0.06)], 0.75, t['h'], 0.15, seg=12)   # 叫人鈴
                xf.vbox(0.95, 1.12, t['h'], t['h'] + 0.05, 0.02, 0.08, '#30343a', r=0.01)                           # 訂書機
                for j in range(4): xf.rbox(acc('paper'), -0.95 + j * 0.02, -0.7 + j * 0.02, t['h'] + j * 0.012, t['h'] + 0.012 + j * 0.012, -0.05, 0.25, r=0.002)   # 等人拿的紙疊
                for (cx_, cell) in ((-0.9, 'copyprice'), (0.3, 'copyprice2')):                                        # 櫃台客人那一面貼的價目
                    p0 = xf.p(cx_ - 0.22, 0.45, z1 + 0.003); p1 = xf.p(cx_ + 0.22, 0.45, z1 + 0.003); p2 = xf.p(cx_ + 0.22, 0.89, z1 + 0.003); p3 = xf.p(cx_ - 0.22, 0.89, z1 + 0.003)
                    NOTE_Q.append(([p0, p1, p2, p3], cell))
        elif k == 'office_chair':
            xf = Xf(t['x'], t['z'], t['ry']); xf.rbox(acc('copier_dk'), -0.24, 0.24, 0.44, 0.5, -0.24, 0.22, r=0.04); xf.rbox(acc('copier_dk'), -0.21, 0.21, 0.58, 0.95, -0.28, -0.22, r=0.04)
            xf.cyl(acc('black'), (0, 0.08, 0), (0, 0.44, 0), 0.025, seg=8)
            for j in range(5): a = j / 5 * 2 * math.pi; xf.cyl(acc('black'), (0, 0.08, 0), (math.sin(a) * 0.28, 0.05, math.cos(a) * 0.28), 0.015, seg=5); acc('black').sphere(xf.p(math.sin(a) * 0.28, 0.03, math.cos(a) * 0.28), 0.03, seg=6, rings=4)
        elif k == 'plotter':
            xf = Xf(t['x'], t['z'], t['ry']); w = t['w']
            xf.rbox(acc('copier_dk'), -w / 2, w / 2, 0.75, 1.1, -0.25, 0.25, r=0.08); xf.rbox(acc('copier'), -w / 2 + 0.15, w / 2 - 0.15, 1.02, 1.1, -0.22, 0.2, r=0.03)
            for sx in (-w / 2 + 0.1, w / 2 - 0.1): xf.rbox(acc('black'), sx - 0.03, sx + 0.03, 0.0, 0.75, -0.2, 0.2, r=0.01); xf.rbox(acc('black'), sx - 0.04, sx + 0.04, 0.0, 0.04, -0.28, 0.28, r=0.01)
            xf.cyl(acc('paper'), (-w / 2 + 0.12, 0.9, 0.0), (w / 2 - 0.12, 0.9, 0.0), 0.06, seg=12)
            xf.rbox(acc('paper'), -w / 2 + 0.2, w / 2 - 0.2, 0.3, 0.32, 0.2, 0.55, r=0.003)                         # 印出來的海報垂下來
            xf.rbox(acc('black'), -w / 2 + 0.15, w / 2 - 0.15, 0.25, 0.27, 0.25, 0.5, r=0.005)
        elif k == 'worktable':
            xf = Xf(t['x'], t['z'], t['ry']); w, d = t['w'], t['d']
            xf.rbox(acc('counter'), -w / 2, w / 2, 0.86, 0.9, -d / 2, d / 2, r=0.012)
            for sx in (-w / 2 + 0.08, w / 2 - 0.08):
                for sz in (-d / 2 + 0.06, d / 2 - 0.06): xf.cyl(acc('steel'), (sx, 0.0, sz), (sx, 0.86, sz), 0.02, seg=8)
            xf.rbox(acc('steel'), -w / 2 + 0.06, w / 2 - 0.06, 0.25, 0.28, -d / 2 + 0.06, d / 2 - 0.06, r=0.005)   # 下層板
            for j in range(6): xf.rbox(acc('card'), -w / 2 + 0.15 + j * 0.42, -w / 2 + 0.5 + j * 0.42, 0.28, 0.5, -0.2, 0.2, r=0.01)   # 下層的紙箱
            xf.rbox(acc('copier_dk'), -w / 2 + 0.2, -w / 2 + 0.75, 0.9, 1.15, -0.2, 0.2, r=0.03)                    # 膠裝機
            xf.cyl(acc('black'), (-w / 2 + 0.7, 1.15, 0.0), (-w / 2 + 0.95, 1.4, 0.0), 0.015, seg=6)
            xf.rbox(acc('copier'), -0.4, 0.3, 0.9, 0.94, -0.28, 0.28, r=0.008)                                         # 裁紙刀：底板＋刀臂
            xf.cyl(acc('steel'), (-0.38, 0.97, -0.26), (0.25, 1.1, -0.26), 0.012, seg=6); xf.cyl(acc('black'), (0.25, 1.1, -0.26), (0.32, 1.12, -0.26), 0.02, seg=8)
            for j in range(5): xf.rbox(acc('paper'), 0.55, 0.85, 0.9 + j * 0.015, 0.912 + j * 0.015, -0.15 + (j % 2) * 0.02, 0.15, r=0.002)   # 紙疊
            for j in range(3): xf.vbox(0.95 + j * 0.25, 1.15 + j * 0.25, 0.9, 0.93, -0.12, 0.16, ['#2f4a6a', '#6a2f2f', '#2f5a3a'][j], r=0.004)   # 做好的膠裝本
        elif k == 'kid_desk':
            xf = Xf(t['x'], t['z'], t['ry']); w, d = t['w'], t['d']
            xf.rbox(acc('wood_lt'), -w / 2, w / 2, 0.68, 0.71, -d / 2, d / 2, r=0.01)
            for sx in (-w / 2 + 0.05, w / 2 - 0.05):
                for sz in (-d / 2 + 0.05, d / 2 - 0.05): xf.cyl(acc('black'), (sx, 0.0, sz), (sx, 0.68, sz), 0.015, seg=6)
            xf.vbox(-0.2, 0.1, 0.71, 0.73, -0.1, 0.12, '#f4f1ea', r=0.003); xf.vbox(0.15, 0.32, 0.71, 0.72, -0.05, 0.08, '#e8c060', r=0.003)   # 作業簿、鉛筆盒
            sx_ = Xf(*xf.p(0, 0, d / 2 + 0.25)[0::2]); sx_.lathe(acc('copier_dk'), [(0.0, 0.42), (0.16, 0.42), (0.16, 0.45), (0.0, 0.45)], 0, 0, 0, seg=14); sx_.cyl(acc('black'), (0, 0, 0), (0, 0.42, 0), 0.02, seg=6)
            xf.vbox(w / 2 - 0.1, w / 2 + 0.2, 0.0, 0.32, -d / 2, -d / 2 + 0.2, '#d8643a', r=0.04)                     # 書包（靠在桌腳）
        elif k == 'paper_boxes':
            for j, (dx, dz, n) in enumerate(((-0.18, 0.0, 3), (0.2, 0.05, 2))):
                for q in range(n): Xf(t['x'] + dx, t['z'] + dz, q * 0.1).rbox(acc('card'), -0.17, 0.17, q * 0.27, q * 0.27 + 0.26, -0.22, 0.22, r=0.01)
        elif k == 'stationery':
            xf = Xf(t['x'], t['z'], t['ry']); w, d = t['w'], t['d']
            xf.rbox(acc('white'), -w / 2, w / 2, 0.0, 1.6, -d / 2, -d / 2 + 0.03, r=0.005)
            for y in (0.4, 0.75, 1.1, 1.45):
                xf.rbox(acc('white'), -w / 2, w / 2, y, y + 0.02, -d / 2, d / 2, r=0.004)
                rs = random.Random(int(y * 100)); x = -w / 2 + 0.04                                  # v2：一格一格的彩色方塊像積木 → 立著的筆記本、一疊色紙、筆筒，顏色淡一點
                while x < w / 2 - 0.12:
                    kind_ = rs.choice(('books', 'books', 'paper', 'cup'))
                    if kind_ == 'books':
                        for q in range(rs.randint(5, 9)):
                            t_ = rs.uniform(0.008, 0.018); hh = rs.uniform(0.2, 0.27)
                            if x + t_ > w / 2 - 0.04: break
                            xf.vbox(x, x + t_, y + 0.02, y + 0.02 + hh, -0.1, 0.1, rs.choice(['#c9b49a', '#8fa6b8', '#d9c48a', '#a8b89a', '#e8e2d6', '#b88a8a', '#5a6470']), r=0.0); x += t_ + 0.002
                        x += 0.03
                    elif kind_ == 'paper':
                        col = rs.choice(['#f2e6c8', '#e6eef0', '#f0dede', '#e4ecd8', '#f6f4ee'])
                        for q in range(rs.randint(3, 6)): xf.vbox(x, x + 0.22, y + 0.02 + q * 0.012, y + 0.031 + q * 0.012, -0.1, 0.08, col, r=0.0)
                        x += 0.26
                    else:
                        Xf(*xf.p(x + 0.05, 0, 0.0)[0::2]).lathe(acc('white'), [(0.0, 0.0), (0.035, 0.0), (0.035, 0.1), (0.032, 0.1), (0.032, 0.005), (0.0, 0.005)], 0, y + 0.02, 0, seg=10)
                        for q in range(5): xf.vbox(x + 0.035 + (q % 3) * 0.012, x + 0.043 + (q % 3) * 0.012, y + 0.05, y + 0.17 + (q % 2) * 0.02, -0.01 + (q // 3) * 0.012, -0.002 + (q // 3) * 0.012, ['#2a2a2c', '#3a6fb0', '#b03a4a'][q % 3], r=0.0)
                        x += 0.12
            xf.rbox(acc('white'), -w / 2, w / 2, 0.0, 0.4, -d / 2, d / 2, r=0.008)
        elif k == 'price_board':
            wall_img('right', 'price', M['price'], t['z'], t['y'], t['w'], t['h'], off=0.13)
        elif k == 'shelf_wall':
            for j in range(2):
                y = t['y'] + j * 0.4; wm('back', 'wood_lt').box(t['x'] - t['w'] / 2, t['x'] + t['w'] / 2, y, y + 0.025, Z0 + 0.12, Z0 + 0.42)
                for q in range(4): wm('back', 'paper').box(t['x'] - t['w'] / 2 + 0.05 + q * 0.38, t['x'] - t['w'] / 2 + 0.33 + q * 0.38, y + 0.025, y + 0.025 + 0.06 * (1 + q % 2), Z0 + 0.15, Z0 + 0.4)
    # 日光燈（平板燈）
    for zz in (-2.8, -0.6, 1.8, 3.6):
        Xf(0, zz).rbox(acc('frame_alu'), -0.62, 0.62, H - 0.04, H, -0.32, 0.32, r=0.01); acc('tube').box(-0.58, 0.58, H - 0.045, H - 0.04, zz - 0.28, zz + 0.28)
        CL.glow(root, 'panel', 0, H - 0.2, zz, color='rgba(245,250,255,1)', size=1.8, day=0.15, night=0.7)
    # 牆上貼的紙（本店不影印整本書、收件時間）
    wall_img('left', 'nobook', M['notes'], 1.2, 1.6, 0.42, 0.42, off=0.125, uv=note_uv('nobook'))
    wall_img('back', 'hours', M['notes'], 0.9, 1.7, 0.36, 0.36, off=0.125, uv=note_uv('hours'))


NOTES = ['hiring', 'hours', 'pay', 'rent', 'winter', 'copyprice', 'copyprice2', 'nobook', 'chalk', 'menu', 'closed', 'poster', 'lostcat', 'tutor', 'hours2', 'blank']
NOTE_Q = []
def note_uv(cell):
    i = NOTES.index(cell); col, row = i % 4, i // 4; v1 = 1 - row / 4; return (col / 4, v1 - 0.25, (col + 1) / 4, v1)


# ======================================================================
def build_teahouse():
    M.update({'planks': L.pbr(P + 'planks', 'dark_planks', tile=1.6, target='#6e4e34', normal=0.5, maps=('diff', 'nor'), rough_value=0.5),
              'tatami': img_mat(P + 'tatami', 'tatami_weave.png', rough=0.85), 'heri': L.flat(P + 'heri', '#24302a', rough=0.8),
              'plaster': L.pbr(P + 'jurakukabe', 'white_plaster_02', tile=1.0, target='#d9c9a6', contrast=0.4, normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.95),   # contrast 0.4：照片的大塊污漬在遊戲裡像髒牆，聚樂壁是細砂的乾淨土牆
              'post': L.pbr(P + 'post', 'dark_wood', tile=0.8, target='#4a3222', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.55),
              'ceil': L.pbr(P + 'ceiling_boards', 'walnut_veneer', tile=1.2, target='#a4855e', maps=('diff',), res=256, rough_value=0.7, cull=True),
              'batten': L.flat(P + 'ceiling_batten', '#4a3424', rough=0.6, cull=True),
              'shoji': L.pbr(P + 'shoji', 'jp_shoji', tile=1.0, maps=('diff',), res=512, rough_value=0.8), 'fusuma': L.flat(P + 'fusuma', '#e7dcc4', rough=0.85),
              'washi': L.flat(P + 'washi', '#f6efdc', rough=0.7, emit=B.srgb('#7a6a50')), 'cushion': L.flat(P + 'zabuton', '#3c4a6a', rough=0.9),
              'cushion2': L.flat(P + 'zabuton2', '#7a4a3a', rough=0.9), 'lacquer': L.flat(P + 'lacquer', '#3a2418', rough=0.3),
              'stone': L.pbr(P + 'stone', 'granite_tile', tile=0.8, target='#8e8a82', normal=0.6, maps=('diff', 'nor'), res=256, rough_value=0.6),
              'moss': L.pbr(P + 'moss', 'grass_ground', tile=1.5, target='#5d6a3c', normal=0.6, maps=('diff', 'nor'), res=256, rough_value=0.95),
              'gravel': L.pbr(P + 'gravel', 'granular_concrete', tile=0.6, target='#a9a49a', maps=('diff',), res=256, rough_value=0.95),
              'scroll': img_mat(P + 'scroll', 'scroll_cha.png', rough=0.8), 'fence': L.pbr(P + 'fence', 'dark_wood', tile=0.6, target='#5e4632', maps=('diff',), res=256, rough_value=0.7),
              'neighbor': L.pbr(P + 'neighbor', 'plaster_grey_04', tile=2.0, target='#bdb5a6', maps=('diff',), res=256, rough_value=0.9),
              'azalea': img_mat(P + 'azalea', 'azalea_leaves.png', rough=0.7, clip=True), 'maple': CL.leaf_mat(P + 'leaf_maple', 'tree_leaves_sweetgum_g.png')})
    it = LAY['items']; xf0 = Xf(0, 0)
    # 地板：茶席、緣側＝深色木地板；和室＝榻榻米（每間 2×4 張，深色緣）；玄關＝石材
    Mesh(P + 'floor', M['planks']).box(X0, X1, -0.02, 0.0, -0.6, Z1).finish(root)
    Mesh(P + 'engawa', M['planks']).box(-2.2, X1, -0.02, 0.0, Z1, Z1 + 1.2).finish(root)
    tm = acc('tatami'); hr = acc('heri')
    for t in [i for i in it if i['kind'] == 'tatami_room']:
        x0, z0 = t['x'] - t['w'] / 2, t['z'] - t['d'] / 2; mw, md = t['w'] / 2, t['d'] / 4
        for i in range(2):
            for j in range(4):
                a, b = x0 + i * mw, z0 + j * md; xf0.rbox(tm, a + 0.01, a + mw - 0.01, -0.02, 0.035, b + 0.01, b + md - 0.01, r=0.01, seg=1)
                hr.box(a, a + mw, 0.0, 0.037, b, b + 0.035); hr.box(a, a + mw, 0.0, 0.037, b + md - 0.035, b + md)      # 長邊的緣
    gk = next(i for i in it if i['kind'] == 'genkan')
    xf0.rbox(acc('stone'), gk['x'] - gk['w'] / 2, gk['x'] + gk['w'] / 2, -0.02, 0.005, gk['z'] - gk['d'] / 2, gk['z'] + gk['d'] / 2, r=0.01, seg=1)
    xf0.rbox(acc('post'), gk['x'] - gk['w'] / 2, gk['x'] + gk['w'] / 2, 0.0, 0.1, gk['z'] - gk['d'] / 2 - 0.08, gk['z'] - gk['d'] / 2 + 0.02, r=0.01)   # 上框（式台）
    # 天花板（木板＋格縁）、牆（聚樂壁＋柱、長押）
    ce = Mesh(P + 'ceiling', M['ceil']); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(root, uv=True)   # 朝下的單面（鏡頭在天花板上面時看得穿：v1 雙面，跟隨鏡頭只看到天花板的背面）
    bt = Mesh(P + 'ceiling_batten', M['batten'])
    for z in [Z0 + k * 0.9 for k in range(1, 11)]: bt.quad([(X0, H - 0.04, z - 0.02), (X1, H - 0.04, z - 0.02), (X1, H - 0.04, z + 0.02), (X0, H - 0.04, z + 0.02)])   # 格縁：只做朝下的面
    bt.finish(root, uv=False)
    for side in ('back', 'left', 'right'):
        a0, a1 = (X0, X1) if side == 'back' else (Z0, Z1)
        wall_box(side, 'plaster', a0, a1, 0.0, H); wall_box(side, 'post', a0, a1, 1.95, 2.05, 0.0, 0.16); wall_box(side, 'post', a0, a1, 0.0, 0.08, 0.0, 0.15)
        for k in range(int((a1 - a0) / 1.8) + 1):
            c = a0 + k * 1.8
            if side == 'back': wm(side, 'post').box(c - 0.06, c + 0.06, 0.0, H, Z0, Z0 + 0.18)
            elif side == 'left': wm(side, 'post').box(X0, X0 + 0.18, 0.0, H, c - 0.06, c + 0.06)
            else: wm(side, 'post').box(X1 - 0.18, X1, 0.0, H, c - 0.06, c + 0.06)
    # 玄關的前牆、鞋櫃；緣側和室內之間的紙拉門（拉開收兩端）；簷下的柱子、屋簷
    for x in (X0, -2.2): acc('post').box(x - 0.06, x + 0.06, 0.0, H, Z1 - 0.06, Z1 + 0.06)
    wm('engawa', 'post').box(X0, X1, H - 0.12, H, Z1 - 0.06, Z1 + 0.06)   # v2：緣側的橫樑放進會淡出的一組（跟隨鏡頭在庭院上方時，原本整條擋在玩家前面）
    for k, (a, b) in enumerate(((-4.15, -3.55), (-2.85, -2.25))): acc('shoji').box(a, b, 0.05, 2.05, Z1 - 0.03, Z1 + 0.03)   # 玄關的格子門（開著）
    sk = Xf(-3.95, 4.4); sk.rbox(acc('post'), -0.22, 0.22, 0.0, 0.85, -0.55, 0.55, r=0.015)
    for j in range(3): sk.vbox(-0.05, 0.12, 0.0, 0.08, -0.35 + j * 0.3, -0.2 + j * 0.3, ['#2a2a2c', '#6a4a30', '#3a4a6a'][j], r=0.02)   # 脫在門口的鞋
    sh = next(i for i in it if i['kind'] == 'shoji_wall')
    for (a, b) in ((-2.15, -1.25), (3.25, 4.15)): acc('shoji').box(a, b, 0.03, 2.0, Z1 - 0.02, Z1 + 0.02); acc('post').box(a, b, 1.98, 2.06, Z1 - 0.04, Z1 + 0.04)
    for x in (-2.2 + k * 1.6 for k in range(5)): acc('post').cyl((x, 0.0, Z1 + 1.15), (x, H + 0.1, Z1 + 1.15), 0.06, seg=8)   # 簷下的柱
    eb = Mesh(P + 'eave_soffit', M['ceil']); eb.quad([(-2.3, H + 0.05, Z1 - 0.1), (X1 + 0.1, H + 0.05, Z1 - 0.1), (X1 + 0.1, H + 0.05, Z1 + 1.9), (-2.3, H + 0.05, Z1 + 1.9)]); eb.finish(root, uv=True)   # 屋簷下的板：v2 改成朝下的單面（跟隨鏡頭在上面時看得穿；v1 的實心板擋住整個畫面）
    fz = Mesh(P + 'eave_fascia', M['batten']); fz.quad([(-2.3, H - 0.1, Z1 + 1.9), (X1 + 0.1, H - 0.1, Z1 + 1.9), (X1 + 0.1, H + 0.05, Z1 + 1.9), (-2.3, H + 0.05, Z1 + 1.9)]); fz.finish(root, uv=False)   # 簷口的封板（朝外的單面）
    # 和室前面的紙拉門（中間各開一段）、兩間和室之間的襖
    zz = sh['z']; xs_ = [sh['x0']] + [v for o in sh['open'] for v in o] + [sh['x1']]
    for i in range(0, len(xs_), 2):
        a, b = xs_[i], xs_[i + 1]; acc('shoji').box(a, b, 0.03, 2.0, zz - 0.03, zz + 0.03); acc('post').box(a, b, 1.98, H, zz - 0.06, zz + 0.06)
    for (a, b) in sh['open']: acc('post').box(a, b, 1.98, H, zz - 0.06, zz + 0.06)
    for x in (sh['x0'], -1.0, 0.0, 1.0, sh['x1']): acc('post').box(x - 0.06, x + 0.06, 0.0, H, zz - 0.07, zz + 0.07)
    fu = next(i for i in it if i['kind'] == 'fusuma')
    acc('fusuma').box(-0.05, 0.05, 0.03, 2.0, fu['z'] - fu['d'] / 2, fu['z'] + fu['d'] / 2); acc('post').box(-0.06, 0.06, 1.98, H, fu['z'] - fu['d'] / 2, fu['z'] + fu['d'] / 2)
    for zc in (fu['z'] - 1.1, fu['z'] + 1.1):
        for sx in (-0.052, 0.052): acc('black').cyl((sx, 0.95, zc), (sx * 1.15, 0.95, zc), 0.03, seg=10)                       # 引手
    # 茶席：長桌、六張椅子；矮桌、坐墊
    for t in it:
        k = t['kind']; xf = Xf(t.get('x', 0.0), t.get('z', 0.0), t.get('ry', 0.0))
        if k == 'long_table':
            xf.rbox(acc('post'), -t['w'] / 2, t['w'] / 2, 0.68, 0.74, -t['d'] / 2, t['d'] / 2, r=0.012)
            for sx in (-t['w'] / 2 + 0.15, t['w'] / 2 - 0.15): xf.rbox(acc('post'), sx - 0.05, sx + 0.05, 0.0, 0.68, -t['d'] / 2 + 0.08, t['d'] / 2 - 0.08, r=0.01)
            xf.rbox(acc('post'), -t['w'] / 2 + 0.2, t['w'] / 2 - 0.2, 0.1, 0.16, -0.04, 0.04, r=0.008)
            for j in range(3):                                                                    # 茶杯、茶托、茶壺
                xf.lathe(acc('ceramic'), [(0.0, 0.0), (0.03, 0.0), (0.04, 0.05), (0.0, 0.05)], -0.9 + j * 0.9, 0.74, -0.18, seg=10)
                xf.lathe(acc('ceramic'), [(0.0, 0.0), (0.03, 0.0), (0.04, 0.05), (0.0, 0.05)], -0.9 + j * 0.9, 0.74, 0.18, seg=10)
            xf.lathe(acc('lacquer'), [(0.0, 0.0), (0.06, 0.0), (0.075, 0.05), (0.06, 0.1), (0.02, 0.11), (0.0, 0.12)], 0.0, 0.74, 0.0, seg=12)
        elif k == 'chair_wood': chair(t['x'], t['z'], t['ry'], seat='post', leg='post')
        elif k == 'low_table':
            xf.rbox(acc('lacquer'), -t['w'] / 2, t['w'] / 2, 0.3, 0.34, -t['d'] / 2, t['d'] / 2, r=0.015)
            for sx in (-t['w'] / 2 + 0.08, t['w'] / 2 - 0.08):
                for sz in (-t['d'] / 2 + 0.08, t['d'] / 2 - 0.08): xf.rbox(acc('lacquer'), sx - 0.035, sx + 0.035, 0.035, 0.3, sz - 0.035, sz + 0.035, r=0.008)
            xf.lathe(acc('ceramic'), [(0.0, 0.0), (0.03, 0.0), (0.04, 0.05), (0.0, 0.05)], 0.2, 0.34, 0.1, seg=10)
        elif k == 'zabuton': xf.rbox(acc('cushion' if t['z'] < 0 else 'cushion2'), -0.27, 0.27, 0.0, 0.08, -0.3, 0.3, r=0.035)
        elif k == 'tokonoma':
            xf.rbox(acc('post'), -t['w'] / 2, t['w'] / 2, 0.0, 0.12, -t['d'] / 2, t['d'] / 2, r=0.01)
            acc('post').box(t['x'] + t['w'] / 2 - 0.06, t['x'] + t['w'] / 2 + 0.06, 0.0, H, t['z'] - t['d'] / 2, t['z'] - t['d'] / 2 + 0.12)   # 床柱
            wall_img('back', 'scroll', M['scroll'], t['x'], 1.35, 0.42, 1.4, off=0.17)
            Xf(t['x'] + 0.35, t['z'] + 0.05).lathe(acc('ceramic'), [(0.0, 0.0), (0.05, 0.0), (0.08, 0.06), (0.05, 0.22), (0.035, 0.26), (0.0, 0.26)], 0, 0.12, 0, seg=12)
            for j in range(3): a = j * 2.1; acc('post').cyl((t['x'] + 0.35, 0.36, t['z'] + 0.05), (t['x'] + 0.35 + math.sin(a) * 0.18, 0.75 + j * 0.06, t['z'] + 0.05 + math.cos(a) * 0.1), 0.008, seg=4)
            random.seed(41); bush(acc('leaf'), t['x'] + 0.35, 0.72, t['z'] + 0.05, 0.16, n=5, span=0.3)
        elif k == 'mizuya':
            mx, mz = t['x'], t['z']; x0, x1, z0, z1 = mx - t['w'] / 2, mx + t['w'] / 2, mz - t['d'] / 2, mz + t['d'] / 2
            xf0.rbox(acc('post'), x0, x1, 0.0, 0.82, z0, z1, r=0.015); xf0.rbox(acc('ceil'), x0 - 0.03, x1, 0.82, 0.86, z0, z1, r=0.01)
            acc('steel').box(x0 + 0.12, x1 - 0.12, 0.8, 0.86, z0 + 0.3, z0 + 0.8)                                       # 流理台的水槽
            acc('steel').cyl((x1 - 0.1, 0.86, z0 + 0.55), (x1 - 0.1, 1.15, z0 + 0.55), 0.012, seg=6); acc('steel').cyl((x1 - 0.1, 1.15, z0 + 0.55), (x1 - 0.3, 1.12, z0 + 0.55), 0.01, seg=6)
            Xf(mx, z0 + 1.3).lathe(acc('white'), [(0.0, 0.0), (0.08, 0.0), (0.09, 0.02), (0.085, 0.2), (0.05, 0.24), (0.0, 0.25)], 0, 0.86, 0, seg=12)   # 電熱水壺
            for j in range(4):
                col = ['#6a2f2f', '#2f4a3a', '#c9a46a', '#3a3a5a'][j]; Xf(mx, z0 + 1.75 + j * 0.2).vbox(-0.05, 0.05, 0.86, 1.0, -0.05, 0.05, col, r=0.02)   # 茶罐
            hg = Xf(mx, z0 + 2.7)                                                                                        # 計時沙漏
            hg.lathe(acc('post'), [(0.0, 0.0), (0.05, 0.0), (0.05, 0.015), (0.0, 0.015)], 0, 0.86, 0, seg=10); hg.lathe(acc('post'), [(0.0, 0.0), (0.05, 0.0), (0.05, 0.015), (0.0, 0.015)], 0, 1.03, 0, seg=10)
            hg.lathe(acc('glass'), [(0.0, 0.0), (0.035, 0.005), (0.006, 0.08), (0.035, 0.155), (0.0, 0.16)], 0, 0.872, 0, seg=10)
            for j in range(2): acc('post').box(x1 - 0.32, x1, 1.4 + j * 0.4, 1.43 + j * 0.4, z0 + 0.2, z1 - 0.2)        # 層架
            for j in range(9): Xf(x1 - 0.17, z0 + 0.4 + j * 0.3).lathe(acc('ceramic'), [(0.0, 0.0), (0.035, 0.0), (0.045, 0.06), (0.0, 0.06)], 0, 1.43, 0, seg=10)
            for j in range(3): Xf(x1 - 0.17, z0 + 0.6 + j * 0.9).vbox(-0.08, 0.08, 1.83, 1.95, -0.08, 0.08, '#8a6a4a', r=0.02)
            for j in range(3): acc('fusuma').box(x0 - 0.02, x0 + 0.0, 1.55, 2.05, z0 + 0.2 + j * 0.35, z0 + 0.52 + j * 0.35)   # 水屋的暖簾
    for z in (0.8, 2.4): pendant(-1.6, z, y=1.85, shade='washi', kind='washi', bulb_r=0.05)
    for x in (-2.15, 2.15): pendant(x, -2.8, y=1.95, shade='washi', kind='washi', bulb_r=0.05)
    # ---- 前院（看得到、走不到）：低一階的苔地、碎石、踏石、沓脫石、老樟樹、石燈籠、竹掃把、矮木牆、對面的牆
    gz0, gz1 = Z1 + 1.2, 9.6
    Mesh(P + 'garden_moss', M['moss']).box(X0, X1, -0.44, -0.4, gz0, gz1).finish(root)
    acc('post').box(-2.2, X1, -0.42, 0.0, Z1 + 1.12, Z1 + 1.22)                                                           # 緣側的邊
    Xf(1.5, Z1 + 1.55).lathe(acc('stone'), [(0.0, 0.0), (0.42, 0.0), (0.44, 0.18), (0.4, 0.22), (0.0, 0.22)], 0, -0.42, 0, seg=14)   # 沓脫石
    Mesh(P + 'gravel', M['gravel']).box(-1.0, 3.6, -0.4, -0.385, gz0 + 0.6, gz1 - 0.6).finish(root)
    for j, (sx, sz) in enumerate(((-3.0, 6.6), (-2.6, 7.3), (-2.0, 7.9), (-1.2, 8.4), (-0.3, 8.9))):
        Xf(sx, sz, j).lathe(acc('stone'), [(0.0, 0.0), (0.26 + 0.03 * (j % 2), 0.0), (0.27, 0.05), (0.24, 0.07), (0.0, 0.07)], 0, -0.4, 0, seg=9)
    lx, lz = -1.6, 7.0; ln = Xf(lx, lz)                                                                                     # 石燈籠
    ln.lathe(acc('stone'), [(0.0, 0.0), (0.2, 0.0), (0.2, 0.12), (0.07, 0.15), (0.07, 0.55), (0.16, 0.6), (0.16, 0.66), (0.0, 0.66)], 0, -0.4, 0, seg=6)
    ln.rbox(acc('stone'), -0.13, 0.13, 0.26, 0.48, -0.13, 0.13, r=0.02); ln.lathe(acc('stone'), [(0.0, 0.0), (0.3, 0.0), (0.26, 0.06), (0.06, 0.2), (0.04, 0.26), (0.0, 0.3)], 0, 0.48, 0, seg=6)
    acc('bulb').box(lx - 0.07, lx + 0.07, 0.3, 0.44, lz - 0.07, lz + 0.07); CL.glow(root, 'toro', lx, 0.37, lz, color='rgba(255,200,120,1)', size=0.9, day=0.0, night=0.9)
    bx = 3.6; acc('post').cyl((bx, -0.4, gz1 - 0.15), (bx - 0.25, 1.2, gz1 - 0.12), 0.015, seg=6)                       # 竹掃把：竹柄＋一束細枝
    bm = acc('post').bm
    for j in range(14): a = j / 14 * math.pi - math.pi / 2; acc('post').cyl((bx + 0.02, -0.0, gz1 - 0.15), (bx + 0.05 + math.sin(a) * 0.18, -0.4, gz1 - 0.2 + math.cos(a) * 0.08), 0.006, seg=3)
    for x in [X0 + k * 0.12 for k in range(int(W / 0.12) + 1)]: acc('fence').box(x, x + 0.1, -0.44, 1.1, gz1, gz1 + 0.04)   # 矮木牆
    acc('fence').box(X0, X1, 0.9, 0.98, gz1 + 0.04, gz1 + 0.1)
    Mesh(P + 'neighbor', M['neighbor']).box(X0 - 4, X1 + 4, -0.44, 5.2, gz1 + 4.5, gz1 + 4.7).finish(root)                 # 隔壁公寓的牆（背景；退後、降低，院子才看得到天空）
    for sx in (X0 - 0.3, X1 + 0.3): Mesh(P + 'neighbor_side', M['fence']).box(sx - 0.05, sx + 0.05, -0.44, 1.6, Z1 + 1.2, gz1).finish(root)   # 院子兩側的竹籬
    random.seed(77); lf = acc('leaf')
    for k in range(9): x = X0 + 0.6 + k * (W - 1.2) / 8; bush(lf, x, 0.3, gz1 - 0.45, 0.55, n=7, span=0.5, flat_y=0.9)        # 矮木牆前的灌木
    for (bx, bz, r) in ((-3.4, 7.2, 0.5), (-0.6, 7.6, 0.45), (1.0, 8.6, 0.55), (-2.6, 9.0, 0.4)): bush(acc('azalea'), bx, -0.1, bz, r, n=8, span=0.5, flat_y=0.8)   # 修剪過的圓形杜鵑
    mp = Xf(-2.4, 8.4); mp.cyl(acc('post'), (0, -0.4, 0), (0.15, 1.6, 0.05), 0.05, seg=6); mp.cyl(acc('post'), (0.1, 1.2, 0.03), (0.6, 2.0, -0.1), 0.03, seg=5)   # 小楓樹
    bush(acc('maple'), -2.2, 2.0, 8.4, 0.9, n=14, span=0.5, flat_y=0.7)
    try:                                                                                                                    # 老樟樹（和街道同一個模型）
        bpy.ops.import_scene.gltf(filepath=os.path.join(L.ROOT, 'assets', 'models', 'env', 'second_ai', 'street_trees.glb'))
        for part in ('bark', 'leaf'):
            o = bpy.data.objects['camphor_a_' + part]; o.parent = root; o.location = g2b(3.0, -0.42, 8.3); o.rotation_euler = (0, 0, 0.9); o.scale = (0.85, 0.85, 0.9); o.name = 'wzs_camphor_' + part
        for o in list(bpy.data.objects):
            if o.parent is None and o != root and o.name.startswith(('tree_', 'street_trees', 'camphor_b', 'banyan', 'palm')): bpy.data.objects.remove(o)
            elif o.name.startswith(('camphor_b_', 'banyan_', 'palm_')): bpy.data.objects.remove(o)
    except Exception as e: print('樟樹載入失敗', e)


# ======================================================================
{'brunch': build_brunch, 'print': build_print, 'teahouse': build_teahouse}[SHOP]()
for k, m in _acc.items(): m.finish(root, uv=True, smooth=True)
for side, ms in walls.items():
    for m in ms:
        m.name = f'WALL_{side}_{m.name}'; ob = m.finish(root, uv=not isinstance(m, L.CMesh), props={'dir': DIRS[side]})
finish_wall_imgs()
VC.finish(root, uv=False)
if NOTE_Q:
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap')
    for pts, cn in NOTE_Q:
        u0, v0, u1, v1 = note_uv(cn); f = bm.faces.new([bm.verts.new(g2b(*q)) for q in pts])
        for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = t
    me = bpy.data.meshes.new(P + 'notes'); bm.to_mesh(me); bm.free(); me.materials.append(M['notes']); ob = bpy.data.objects.new(P + 'notes', me); B.scene().collection.objects.link(ob); ob.parent = root
for ob in list(root.children):   # 模型葉子平滑著色
    if ob.type == 'MESH' and ob.data.materials and 'leaf_' in ob.data.materials[0].name: L.smooth_mesh(ob, angle=1.2)
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name or ob.name.startswith('wzs_camphor'), key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
info = L.export(OUT, gpu_instances=True)
info.update({'shop': SHOP, 'layout': ALL['version']})
L.write_json(OUT[:-4] + '.json', info)
