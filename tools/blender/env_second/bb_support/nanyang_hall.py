"""南洋戲院 1 廳（nanyang_hall）v1 → GLB。BB（帳號 A）2026-11-03。使用者：「盡量接近我給你的圖 復古風」。
參考：docs/story_planning/ref_images/shops/nanyang_lobby.webp 右邊那組開著的門後面看得到的影廳——
  紅地毯、亮紅高背座椅一排一排、右邊一條直走道、走道邊一顆一顆的小地燈、遠處的白銀幕。
其他照大廳同一套復古語彙：下半截深紅直條護牆板、上半截米色灰泥（影廳裡是深紅絨布牆板＋米色壁柱）、Art Deco 層層燈罩的壁燈、
  米色台口拱框＋金色階梯線、紅絨布幕（收在兩邊、上面一條垂幔＋金流蘇）、綠色「太平門」燈箱、後牆放映窗。
D77：沒有真實品牌。D112：地板是紅地毯。配置只寫在 src/data/nanyang_layout.js 的 hall。
  /opt/blenv/bin/python tools/blender/env_second/bb_support/nanyang_hall.py [-- --out <glb>]
座標：房間中心在原點，x 東、y 上、z 南；往大廳的門在 +z，銀幕在 −z。
"""
import json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from PIL import Image, ImageDraw, ImageFont   # noqa: E402

LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./src/data/nanyang_layout.js')))"], cwd=L.ROOT))['hall']
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else LAY['glb'])
TMP = os.path.join(L.ROOT, 'tools/blender/env_second/textures/gen/nanyang'); os.makedirs(TMP, exist_ok=True)
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
W, D, H = LAY['w'], LAY['d'], LAY['h']
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
DIRS = LAY['wallsFade']
WAIN = 1.15
SL = LAY['slope']; YF = SL['y1']   # v2：斜地板（前低後高）；銀幕那頭的地板 y＝YF（−0.96）
def floorY(z): return SL['y0'] if z >= SL['z0'] else SL['y1'] if z <= SL['z1'] else SL['y0'] + (SL['y1'] - SL['y0']) * (SL['z0'] - z) / (SL['z0'] - SL['z1'])
random.seed(6151)
B.reset(texres=512)
root = B.group('nanyang_hall', props={'kind': 'nanyang_hall', 'w': W, 'd': D, 'h': H, 'layout': LAY.get('v', 1)})
def font(sz): return ImageFont.truetype(FONT, sz)


def img_mat(name, path, rough=0.7, emit=0.0):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt = mt.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path); nt.links.new(tx.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = rough
    if emit:
        nt.links.new(tx.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = emit
    return mt


def uvquad(name, p0, p1, p2, p3, mat, parent=None):
    bm = bmesh.new(); vs = [bm.verts.new(g2b(*p)) for p in (p0, p1, p2, p3)]; f = bm.faces.new(vs)
    ul = bm.loops.layers.uv.new()
    for lp, t in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[ul].uv = t
    return B.mesh_obj(name, bm, mat, parent or root, None)


def glowmat(name, hexcol, k):
    c = B.srgb(hexcol); return L.flat(name, hexcol, rough=0.4, emit=tuple(v * k for v in c[:3]))


def tex(name, size, draw):
    p = os.path.join(TMP, name); im = Image.new('RGB', size, (0, 0, 0)); draw(im, ImageDraw.Draw(im)); im.save(p); return p


def exit_sign(im, d):   # 復古的「太平門」燈箱：綠底白字＋跑步小人
    w, h = im.size; d.rectangle([0, 0, w, h], fill=(20, 120, 60)); d.rectangle([8, 8, w - 8, h - 8], outline=(220, 250, 226), width=5)
    d.text((150, 22), '太平門', font=font(100), fill=(240, 255, 244))
    x, y = 40, 30; d.ellipse([x + 30, y, x + 58, y + 28], fill=(240, 255, 244)); d.line([(x + 44, y + 28), (x + 34, y + 80)], fill=(240, 255, 244), width=12)
    d.line([(x + 34, y + 80), (x + 10, y + 120)], fill=(240, 255, 244), width=12); d.line([(x + 34, y + 80), (x + 64, y + 118)], fill=(240, 255, 244), width=12)
    d.line([(x + 40, y + 46), (x + 76, y + 60)], fill=(240, 255, 244), width=10); d.line([(x + 40, y + 46), (x + 6, y + 62)], fill=(240, 255, 244), width=10)


def row_plate(im, d):   # 排號牌（走道邊每一排一張：米色底、深紅字），一張圖九格
    w, h = im.size; n = LAY['rows']['n']; cw = w // n
    for i in range(n):
        d.rectangle([i * cw, 0, (i + 1) * cw - 2, h], fill=(232, 216, 180)); d.rectangle([i * cw + 6, 6, (i + 1) * cw - 8, h - 6], outline=(150, 40, 34), width=3)
        d.text((i * cw + 14, 18), str(i + 1), font=font(70), fill=(140, 30, 28)); d.text((i * cw + 14, 96), '排', font=font(40), fill=(140, 30, 28))


def screen_tex(im, d):  # 銀幕：中間亮、邊緣一點暗角（放映燈打在白幕上）
    w, h = im.size
    for y in range(0, h, 4):
        for x in range(0, w, 4):
            dx, dy = (x - w / 2) / (w / 2), (y - h / 2) / (h / 2); v = int(200 - 50 * (dx * dx * 0.6 + dy * dy * 0.8))
            d.rectangle([x, y, x + 3, y + 3], fill=(v, v - 8, v - 22))   # v2：暗一點、偏暖（放映機的光打在舊銀幕上）


def velvet(im, d):      # 絨布：直條皺褶的明暗（布幕、牆板共用）
    w, h = im.size; r = random.Random(3)
    for x in range(w):
        t = math.sin(x / w * math.pi * 10 + r.random() * 0.2) * 0.5 + 0.5; v = 0.62 + 0.38 * t
        d.line([(x, 0), (x, h)], fill=(int(150 * v), int(22 * v), int(30 * v)))


P = {k: tex(f'hall_{k}.png', s, f) for k, s, f in (('exit', (520, 180), exit_sign), ('rowplate', (900, 160), row_plate),
                                                   ('screen', (512, 256), screen_tex), ('velvet', (512, 128), velvet))}

# ---------------- 材質（≤12，最後合併）----------------
m_carpet = L.pbr('nh_carpet', 'dirty_carpet', tile=1.6, target='#8a1c24', normal=0.4, maps=('diff', 'nor'), rough_value=0.95)
m_wall = L.pbr('nh_plaster', 'painted_plaster_wall', tile=2.5, target='#a87c50', normal=0.3, maps=('diff', 'nor'))   # v2：暖褐（不是白）
m_wood = L.pbr('nh_wood', 'wood_table_001', tile=1.0, target='#4a2c1a', normal=0.3, maps=('diff', 'nor'), rough_value=0.5)   # 扶手、門（不是地板）
m_maroon = L.flat('nh_maroon', '#7c1e24', rough=0.55)
m_seat = L.flat('nh_seat', '#b4222a', rough=0.82)        # 參考圖的亮紅座椅（絨布）
m_seatback = L.flat('nh_seatback', '#5a161b', rough=0.7)  # 椅背後面的殼
m_ceil = L.flat('nh_ceil', '#3a2420', rough=0.9)
m_cream = L.flat('nh_cream', '#a88660', rough=0.75)   # v2：壁柱、台口、天花板格樑：暖褐米色（不是白）
m_gold = L.flat('nh_gold', '#c39a4c', rough=0.35, metal=0.42)
m_iron = L.flat('nh_iron', '#2b2a2a', rough=0.5, metal=0.35)
m_black = L.flat('nh_black', '#101010', rough=0.9)
m_warm = glowmat('nh_warm', '#ffd9a0', 4.0)
m_aisle = glowmat('nh_aisle', '#ffc27a', 6.0)
IM = {k: img_mat('nh_' + k, p, rough=0.85 if k == 'velvet' else 0.6,
                 emit=(2.2 if k == 'exit' else 0.3 if k == 'screen' else 0.0)) for k, p in P.items()}   # v2：銀幕暗一點

# ---------------- 地板、天花板 ----------------
fl = Mesh('FLOOR', m_carpet, tile=1.6)   # v2：三段——門口平的（y 0）、斜面（每排降 0.12）、銀幕前平的（y YF）
for (za, zb) in ((SL['z0'], Z1), (SL['z1'], SL['z0']), (Z0, SL['z1'])):
    fl.quad([(X0, floorY(zb), zb), (X1, floorY(zb), zb), (X1, floorY(za), za), (X0, floorY(za), za)])
fl.finish(root, props={'slope': json.dumps(SL)})
Mesh('CEILING', m_ceil).box(X0, X1, H, H + 0.04, Z0, Z1).finish(root, props={'ceiling': 1})
cb = Mesh('CEIL_DECO', m_cream)   # 天花板的米色格樑（Art Deco 的階梯邊）
for z in [Z0 + 2.0 * i for i in range(1, int(D / 2.0))]:
    cb.rbox(X0, X1, H - 0.22, H, z - 0.14, z + 0.14, r=0.02, seg=1); cb.rbox(X0, X1, H - 0.3, H - 0.22, z - 0.08, z + 0.08, r=0.01, seg=1)
for x in (X0 + 1.6, X1 - 1.6): cb.rbox(x - 0.14, x + 0.14, H - 0.22, H, Z0, Z1, r=0.02, seg=1)
cb.finish(root)

# ---------------- 牆：下半深紅直條護牆板、上半絨布牆板＋米色壁柱（可淡出）----------------
T = 0.2


def wains(m, ax, a0, a1, fixed, inward, y0=0.0):
    n = int(abs(a1 - a0) / 0.12)
    for i in range(n):
        u0 = a0 + i * (a1 - a0) / n; u1 = a0 + (i + 1) * (a1 - a0) / n; g_ = 0.006
        if ax == 'x': m.rbox(min(u0, u1) + g_, max(u0, u1) - g_, y0, WAIN, min(fixed, fixed + inward), max(fixed, fixed + inward), r=0.004, seg=1)
        else: m.rbox(min(fixed, fixed + inward), max(fixed, fixed + inward), y0, WAIN, min(u0, u1) + g_, max(u0, u1) - g_, r=0.004, seg=1)
    if ax == 'x': m.rbox(min(a0, a1), max(a0, a1), WAIN - 0.02, WAIN + 0.06, min(fixed, fixed + inward * 1.8), max(fixed, fixed + inward * 1.8), r=0.01, seg=1)
    else: m.rbox(min(fixed, fixed + inward * 1.8), max(fixed, fixed + inward * 1.8), WAIN - 0.02, WAIN + 0.06, min(a0, a1), max(a0, a1), r=0.01, seg=1)


def side_wall(dname, xw, inward):
    g = B.group(f'WALL_{dname}', root, props={'dir': DIRS[dname]})
    out = xw - (T if inward > 0 else -T)
    Mesh(f'WALL_{dname}_plaster', m_wall, tile=2.5).box(min(xw, out), max(xw, out), YF, H, Z0, Z1).finish(g)
    wm = Mesh(f'WALL_{dname}_wains', m_maroon); wains(wm, 'z', Z0, Z1, xw, inward, YF); wm.finish(g)
    pil = Mesh(f'WALL_{dname}_pilasters', m_cream); pz = [Z0 + 1.0 + k * 2.0 for k in range(int(D / 2.0))]
    vel = []
    for k, z in enumerate(pz):
        pil.rbox(min(xw, xw + inward * 6), max(xw, xw + inward * 6), WAIN + 0.06, H - 0.3, z - 0.22, z + 0.22, r=0.02, seg=1)        # 壁柱
        pil.rbox(min(xw, xw + inward * 8), max(xw, xw + inward * 8), H - 0.75, H - 0.55, z - 0.3, z + 0.3, r=0.02, seg=1)              # 柱頭（階梯）
        pil.rbox(min(xw, xw + inward * 7), max(xw, xw + inward * 7), H - 0.95, H - 0.75, z - 0.26, z + 0.26, r=0.02, seg=1)
        if k < len(pz) - 1: vel.append((z + 0.22, pz[k + 1] - 0.22))
    pil.finish(g)
    bmv = bmesh.new(); ulv = bmv.loops.layers.uv.new(); xf = xw + inward * 1.0   # 柱子中間：絨布牆板（一面牆合成一個網格，少 draw call）
    for (za, zb) in vel:
        a, b_ = (za, zb) if inward > 0 else (zb, za)
        f = bmv.faces.new([bmv.verts.new(g2b(xf, WAIN + 0.12, a)), bmv.verts.new(g2b(xf, WAIN + 0.12, b_)), bmv.verts.new(g2b(xf, H - 1.0, b_)), bmv.verts.new(g2b(xf, H - 1.0, a))])
        for lp, t in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[ulv].uv = t
    B.mesh_obj(f'WALL_{dname}_velvet', bmv, IM['velvet'], g, None)
    fr = Mesh(f'WALL_{dname}_trim', m_gold)
    for (za, zb) in vel:
        xf = xw + inward * 1.4
        for y in (WAIN + 0.12, H - 1.0): fr.box(min(xw, xf), max(xw, xf), y - 0.015, y + 0.015, za, zb)
    fr.finish(g); return g


side_wall('left', X0, 0.025)
side_wall('right', X1, -0.025)
# 後牆（+z，往大廳的門；上面有放映窗）
DR = LAY['door']; dx0, dx1 = DR['x'] - DR['w'] / 2, DR['x'] + DR['w'] / 2
gb = B.group('WALL_back', root, props={'dir': DIRS['back']})
bw = Mesh('WALL_back_plaster', m_wall, tile=2.5); bw.box(X0, dx0, 0, H, Z1, Z1 + T); bw.box(dx1, X1, 0, H, Z1, Z1 + T); bw.box(dx0, dx1, DR['h'], H, Z1, Z1 + T); bw.finish(gb)
bwm = Mesh('WALL_back_wains', m_maroon); wains(bwm, 'x', X0, dx0, Z1, -0.025); wains(bwm, 'x', dx1, X1, Z1, -0.025); bwm.finish(gb)
bo = LAY['booth']
bfr = Mesh('WALL_back_boothframe', m_wood); bgl = Mesh('WALL_back_boothglow', m_warm)
for x in bo['xs']:   # 放映窗：小方窗、裡面一點暖光（放映機的光）
    bfr.rbox(x - 0.38, x + 0.38, bo['y'] - 0.3, bo['y'] + 0.3, Z1 - 0.06, Z1, r=0.01, seg=1); bgl.box(x - 0.3, x + 0.3, bo['y'] - 0.22, bo['y'] + 0.22, Z1 - 0.07, Z1 - 0.06)
bfr.finish(gb); bgl.finish(gb)
df = Mesh('WALL_back_doorframe', m_wood)
df.rbox(dx0 - 0.1, dx0, 0, DR['h'] + 0.1, Z1 - 0.08, Z1 + 0.02, r=0.01, seg=1); df.rbox(dx1, dx1 + 0.1, 0, DR['h'] + 0.1, Z1 - 0.08, Z1 + 0.02, r=0.01, seg=1); df.rbox(dx0 - 0.1, dx1 + 0.1, DR['h'], DR['h'] + 0.1, Z1 - 0.08, Z1 + 0.02, r=0.01, seg=1)
df.finish(gb)
Mesh('WALL_back_curtain_hint', m_black).box(dx0, dx1, 0, DR['h'], Z1 + T - 0.01, Z1 + T).finish(gb)   # 門外（大廳那邊另一個區域）先黑
uvquad('WALL_back_exitsign', (DR['x'] + 0.55, 2.86, Z1 - 0.09), (DR['x'] - 0.55, 2.86, Z1 - 0.09), (DR['x'] - 0.55, 3.24, Z1 - 0.09), (DR['x'] + 0.55, 3.24, Z1 - 0.09), IM['exit'], gb)
# 前牆（−z：銀幕那面，不淡出——鏡頭在後面看過來）
gf = B.group('WALL_front', root, props={'dir': DIRS['front']})
Mesh('WALL_front_plaster', L.flat('nh_frontdark', '#2a1416', rough=0.9)).box(X0, X1, YF, H, Z0 - T, Z0).finish(gf)

# ---------------- 舞台、台口拱框、銀幕、布幕 ----------------
st = LAY['stage']; sc = LAY['screen']; pr = LAY['proscenium']
stg = Mesh('STAGE_FRONT', IM['velvet'])
stg.box(X0 + 0.4, X1 - 0.4, YF, YF + st['h'], st['z1'] - 0.02, st['z1']); stg.finish(root)
Mesh('STAGE_TOP', m_carpet, tile=1.6).box(X0 + 0.4, X1 - 0.4, YF + st['h'] - 0.03, YF + st['h'], st['z0'], st['z1']).finish(root)
Mesh('STAGE_NOSING', m_gold).box(X0 + 0.4, X1 - 0.4, YF + st['h'] - 0.04, YF + st['h'] + 0.01, st['z1'] - 0.04, st['z1'] + 0.01).finish(root)
for sx in (X0 + 0.4, X1 - 0.4):   # 舞台兩端的小台階（左右各三階，往後台）
    s = 1 if sx < 0 else -1; xs = sx; stp = Mesh(f'STAGE_STEP{int(s)}', m_maroon)
    for k in range(3): stp.box(min(xs, xs - s * (0.9 - k * 0.3)), max(xs, xs - s * (0.9 - k * 0.3)), YF, YF + st['h'] * (k + 1) / 3, st['z1'], st['z1'] + 0.36 - k * 0.12)
    stp.finish(root)
# 台口拱框：米色、兩側方柱、上面一道帶階梯線的楣，中間頂端一個扇形裝飾
pro = Mesh('PROSCENIUM', m_cream); gold = Mesh('PROSCENIUM_GOLD', m_gold)
zf = st['z1'] - 0.05
for x0_, x1_ in ((pr['x0'] - 0.55, pr['x0']), (pr['x1'], pr['x1'] + 0.55)):
    pro.rbox(x0_, x1_, YF, pr['top'], zf - 0.3, zf, r=0.02, seg=1)
    for k in range(3): gold.box(x0_ + 0.06 + k * 0.14, x0_ + 0.09 + k * 0.14, 0.3, pr['top'] - 0.3, zf + 0.0, zf + 0.012)
pro.rbox(pr['x0'] - 0.55, pr['x1'] + 0.55, pr['top'] - 0.6, pr['top'] + 0.35, zf - 0.3, zf, r=0.02, seg=1)
for k in range(3): gold.box(pr['x0'] - 0.4 + k * 0.1, pr['x1'] + 0.4 - k * 0.1, pr['top'] - 0.5 + k * 0.12, pr['top'] - 0.47 + k * 0.12, zf, zf + 0.012)
for k in range(7):   # 楣中間的扇形（Art Deco 放射線）
    a = math.radians(30 + k * 20); r0, r1 = 0.12, 0.42; cy = pr['top'] - 0.05
    gold.quad([(math.cos(a) * r0 - 0.02, cy + math.sin(a) * r0 * 0.6, zf + 0.014), (math.cos(a) * r0 + 0.02, cy + math.sin(a) * r0 * 0.6, zf + 0.014),
               (math.cos(a) * r1 + 0.04, cy + math.sin(a) * r1 * 0.6, zf + 0.014), (math.cos(a) * r1 - 0.04, cy + math.sin(a) * r1 * 0.6, zf + 0.014)])
pro.finish(root); gold.finish(root)
# 銀幕＋黑邊
sx0, sx1, sy0, sy1 = sc['x'] - sc['w'] / 2, sc['x'] + sc['w'] / 2, sc['y'], sc['y'] + sc['h']
Mesh('SCREEN_MASK', m_black).box(sx0 - 0.25, sx1 + 0.25, sy0 - 0.2, sy1 + 0.2, sc['z'] - 0.04, sc['z']).finish(root)
uvquad('SCREEN', (sx0, sy0, sc['z'] + 0.005), (sx1, sy0, sc['z'] + 0.005), (sx1, sy1, sc['z'] + 0.005), (sx0, sy1, sc['z'] + 0.005), IM['screen'])


def curtain(name, xa, xb, y0, y1, z, folds, depth=0.12):   # 一片有皺褶的布幕（正弦起伏的直條）
    bm = bmesh.new(); ul = bm.loops.layers.uv.new(); n = folds * 6
    for i in range(n):
        ta, tb = i / n, (i + 1) / n; xa_, xb_ = xa + (xb - xa) * ta, xa + (xb - xa) * tb
        za, zb = z + depth * math.sin(ta * folds * 2 * math.pi), z + depth * math.sin(tb * folds * 2 * math.pi)
        vs = [bm.verts.new(g2b(xa_, y0, za)), bm.verts.new(g2b(xb_, y0, zb)), bm.verts.new(g2b(xb_, y1, zb)), bm.verts.new(g2b(xa_, y1, za))]
        f = bm.faces.new(vs)
        for lp, uv in zip(f.loops, ((ta, 0), (tb, 0), (tb, 1), (ta, 1))): lp[ul].uv = uv
    return B.mesh_obj(name, bm, IM['velvet'], root, None)


zc = st['z1'] - 0.45
curtain('CURTAIN_L', pr['x0'], sx0 + 0.25, YF + st['h'], pr['top'] - 0.6, zc, 5)          # v2：布幔收在兩邊、蓋住銀幕的邊（參考圖銀幕兩邊是暗的布）
curtain('CURTAIN_R', sx1 - 0.25, pr['x1'], YF + st['h'], pr['top'] - 0.6, zc, 5)
curtain('CURTAIN_VALANCE', pr['x0'], pr['x1'], pr['top'] - 1.25, pr['top'] - 0.6, zc + 0.12, 14, depth=0.06)   # 上面的垂幔
fr_ = Mesh('CURTAIN_FRINGE', m_gold); fr_.box(pr['x0'], pr['x1'], pr['top'] - 1.32, pr['top'] - 1.24, zc + 0.1, zc + 0.2)
for k in range(40): x = pr['x0'] + (pr['x1'] - pr['x0']) * (k + 0.5) / 40; fr_.box(x - 0.012, x + 0.012, pr['top'] - 1.44, pr['top'] - 1.32, zc + 0.14, zc + 0.16)   # 流蘇
for x in (sx0 - 0.25, sx1 + 0.25): fr_.cyl((x, 2.2, zc + 0.15), (x + (0.12 if x < 0 else -0.12), 2.1, zc + 0.15), 0.05, seg=10)   # 綁布幕的金繩結
fr_.finish(root)

# ---------------- 座椅：亮紅高背、黑鐵腳、木扶手（一排 n 張，扶手兩張共用）----------------
sb = LAY['seatBlock']; rows = LAY['rowZ']; rowY = LAY['rowY']
cush = Mesh('SEAT_CUSHION', m_seat); back = Mesh('SEAT_BACK', m_seat); shell = Mesh('SEAT_SHELL', m_seatback); std = Mesh('SEAT_STANDARD', m_iron); arm = Mesh('SEAT_ARM', m_wood)
plates = []
NU, NV = 6, 3


def seat_back(x, hw, z, yr):
    """v2：弧形椅背——上緣是圓弧（中間高）、整片微微往前包（兩邊比中間靠前）；正面紅絨、背面深色殼、頂和兩側也包起來"""
    def P(u, v, t):   # u −1..1（左右）、v 0..1（下到上）、t 0＝正面 1＝背面
        top = 0.5 + 0.08 * math.cos(u * PI / 2)
        return (x + u * hw, yr + 0.47 + v * top, z + 0.22 + 0.045 * (1 - u * u) * 0 - 0.04 * u * u + t * 0.075 + 0.02 * v)
    for i in range(NU):
        for j in range(NV):
            u0, u1 = -1 + 2 * i / NU, -1 + 2 * (i + 1) / NU; v0, v1 = j / NV, (j + 1) / NV
            back.quad([P(u1, v0, 0), P(u0, v0, 0), P(u0, v1, 0), P(u1, v1, 0)])          # 正面（面向銀幕 −z）
            shell.quad([P(u0, v0, 1), P(u1, v0, 1), P(u1, v1, 1), P(u0, v1, 1)])         # 背面
        shell.quad([P(u1, 1, 0), P(u0, 1, 0), P(u0, 1, 1), P(u1, 1, 1)])                 # 上緣（包邊）
    for u in (-1, 1):
        for j in range(NV):
            v0, v1 = j / NV, (j + 1) / NV
            q = [P(u, v0, 0), P(u, v0, 1), P(u, v1, 1), P(u, v1, 0)]
            shell.quad(q if u > 0 else q[::-1])


PI = math.pi
for r, z in enumerate(rows):
    yr = rowY[r]
    for i in range(sb['n']):
        x = sb['x0'] + sb['pitch'] * (i + 0.5); hw = sb['pitch'] / 2 - 0.05
        cush.rbox(x - hw, x + hw, yr + 0.40, yr + 0.50, z - 0.24, z + 0.20, r=0.04, seg=1)        # 坐墊（翻下來）
        seat_back(x, hw, z, yr)
    for i in range(sb['n'] + 1):   # 扶手立柱（兩端是大一點的鑄鐵側板）＋木扶手（前端圓頭）
        x = sb['x0'] + sb['pitch'] * i; end = i in (0, sb['n'])
        if end: std.rbox(x - 0.025, x + 0.025, yr + 0.0, yr + 0.62, z - 0.22, z + 0.32, r=0.02, seg=1)
        else: std.box(x - 0.03, x + 0.03, yr + 0.0, yr + 0.62, z - 0.12, z + 0.3)
        std.box(x - 0.06, x + 0.06, yr + 0.0, yr + 0.03, z - 0.2, z + 0.34)
        arm.rbox(x - 0.04, x + 0.04, yr + 0.62, yr + 0.68, z - 0.26, z + 0.3, r=0.02, seg=1)
        arm.cyl((x, yr + 0.65, z - 0.26), (x, yr + 0.65, z - 0.3), 0.035, seg=6)
    plates.append((sb['x1'] + 0.03, z, yr))
cush.finish(root); back.finish(root); shell.finish(root); std.finish(root); arm.finish(root)
# 走道邊每一排的排號牌（貼在最右邊立柱外側）＋地燈
pl = bmesh.new(); ul = pl.loops.layers.uv.new(); n = len(rows)
for i, (x, z, yr) in enumerate(plates):
    vs = [pl.verts.new(g2b(x, yr + 0.3, z + 0.14)), pl.verts.new(g2b(x, yr + 0.3, z - 0.1)), pl.verts.new(g2b(x, yr + 0.5, z - 0.1)), pl.verts.new(g2b(x, yr + 0.5, z + 0.14))]
    f = pl.faces.new(vs)
    for lp, uv in zip(f.loops, ((i / n, 0), ((i + 1) / n - 0.01, 0), ((i + 1) / n - 0.01, 1), (i / n, 1))): lp[ul].uv = uv
B.mesh_obj('ROW_PLATES', pl, IM['rowplate'], root, None)
al = Mesh('AISLE_LIGHTS', m_aisle); ah = Mesh('AISLE_LIGHT_HOUSING', m_gold)
for L_ in LAY['lights']:
    if L_['kind'] != 'aisle': continue
    yl = L_['y'] - 0.18; al.box(L_['x'] - 0.06, L_['x'] + 0.06, yl + 0.08, yl + 0.16, L_['z'] - 0.02, L_['z'] + 0.02); ah.box(L_['x'] - 0.08, L_['x'] + 0.08, yl + 0.06, yl + 0.18, L_['z'] - 0.04, L_['z'] - 0.02)
al.finish(root); ah.finish(root)
# 左邊前方的太平門（左牆上、靠銀幕）
ez = -6.0; ed = Mesh('EXIT_DOOR_L', m_wood); ed.rbox(X0 + 0.02, X0 + 0.07, YF, YF + 2.3, ez - 0.55, ez + 0.55, r=0.01, seg=1); ed.finish(root)
Mesh('EXIT_DOOR_L_BAR', m_gold).box(X0 + 0.07, X0 + 0.11, YF + 1.0, YF + 1.05, ez - 0.45, ez + 0.45).finish(root)
uvquad('EXIT_SIGN_L', (X0 + 0.09, YF + 2.42, ez + 0.5), (X0 + 0.09, YF + 2.42, ez - 0.5), (X0 + 0.09, YF + 2.78, ez - 0.5), (X0 + 0.09, YF + 2.78, ez + 0.5), IM['exit'])   # 面向 +x：看的人右手是 −z

# ---------------- Art Deco 壁燈（層層燈罩，掛在壁柱上）----------------
scn = Mesh('SCONCE', m_gold); scg = Mesh('SCONCE_GLASS', m_warm)
for L_ in LAY['lights']:
    if L_['kind'] != 'house': continue
    s = 1 if L_['x'] < 0 else -1; xw = L_['x'] + s * 0.0
    xb = X0 + 0.15 if s > 0 else X1 - 0.15
    scn.rbox(min(xb, xb - s * 0.04), max(xb, xb - s * 0.04), 2.55, 3.25, L_['z'] - 0.09, L_['z'] + 0.09, r=0.01, seg=1)
    for k in range(5): scg.rbox(min(xb, xb + s * 0.1), max(xb, xb + s * 0.1), 2.62 + k * 0.12, 2.71 + k * 0.12, L_['z'] - 0.07 + k * 0.005, L_['z'] + 0.07 - k * 0.005, r=0.02, seg=1)
scn.finish(root); scg.finish(root, smooth=True)

# ---------------- 減量（材質 ≤ 12）----------------
for ob in list(root.children_recursive):
    if ob.type == 'MESH' and ob.data and len(ob.data.polygons) == 0: B.remove(ob)
vc_m = L.vc_material('nh_vc_matte', rough=0.75); vc_g = L.vc_material('nh_vc_gloss', rough=0.35); vc_x = L.vc_metal('nh_vc_metal', rough=0.35, metal=0.4)
grp = L.auto_vc_groups(root, vc_m, vc_x, gloss=vc_g, protect={'nh_warm', 'nh_aisle', 'nh_exit', 'nh_screen'})
L.vc_consolidate(root, grp)
L.atlas_small(root, os.path.join(TMP, 'nh_atlas.png'), 'nh_atlas', max_tris=6000, max_rep=1, cell=512, rough=0.7)
L.merge_by_material(root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
L.export(OUT)
print('OK', OUT, B.stats())
