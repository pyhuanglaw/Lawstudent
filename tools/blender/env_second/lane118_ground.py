"""118 巷的地面與台大後門（ART-L118-GROUND，LAWWW-C 2026-10-18 02:10 派，v9.10）→ assets/models/env/second_ai/lane118_ground.glb。LAWWW2-C。
lane118_street.glb（兩側店面、招牌）沒有地面：LAWWW-C 接區域時在程式裡用套件暫代了柏油（TK.road）、人行道（stoneTex 平面）、辛亥路／和平東路、
白長條斑馬線、台大圍牆和門柱（方塊）。這支把它們做成正式模型，座標照 src/data/lane118_layout.js（和遊戲、街景 GLB 同一份）：
- 路面：118 巷（x −3.4～3.4、z −42～36.2）、辛亥路（z 36.2～46）、和平東路（z −56～−44.2）——貼圖 lane118_ground_tex.py（和溫州街同一套程序路面：
  補丁、灌縫膠、輪跡、油漬、混凝土水溝蓋＋鐵柵、人孔、標線、斑馬線、停止線、機車停等區、機車停車格、「慢」）。
- 人行道：巷子兩邊（x ±3.4～±5.2）、辛亥路北邊（z 34～36.2，巷口除外）、辛亥路南邊（z 46～48.6，台大圍牆前）、和平東路南邊。
  **只高 3 cm**（導航是平的，人走上去腳不會陷進去），邊上一條 15 cm 寬的花崗石路緣（高 5 cm）。斑馬線兩端的路緣斷開＋黃色導盲磚。
- 台大後門（沒有照片：一般台大校門的做法，PROPOSAL）：兩根灰色花崗石門柱（頂上黑色燈籠、門柱上一塊**空白**的深色牌子）、
  開口 8 m（遊戲的出口互動點 (0, 48.4)）、地上的滑門軌道、收在東邊圍牆後面的黑色鐵滑門、門內一間警衛亭；
  圍牆＝花崗石矮牆＋黑色鐵欄杆＋每 4 m 一根石柱；牆後是校園的草地、一小段紅磚步道、大樹。
- 路燈：沿用遊戲的 W3.lampPost（全遊戲一樣的路燈、晚上的光圈和燈頭位置已經調好），這裡不做。
遊戲端：載入這份 GLB 以後藏掉暫代的 TK.road、兩條人行道平面、辛亥路／和平東路、斑馬線長條、圍牆和門柱方塊、遠景地面（見 README）。
  /opt/blenv/bin/python tools/blender/env_second/lane118_ground.py [-- --out …] [--preview <png> --cam gate|lane|corner|aerial] [--samples 24] [--res 1280x720]"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, Vector, Matrix   # noqa: E402
from PIL import Image, ImageDraw   # noqa: E402

A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def opt(n, d=None): return A[A.index(n) + 1] if n in A else d
OUT = os.path.join(L.ROOT, opt('--out', 'assets/models/env/second_ai/lane118_ground.glb')); PREVIEW = opt('--preview')
GEN = os.path.join(HERE, 'textures', 'gen')
src = open(os.path.join(L.ROOT, 'src', 'data', 'lane118_layout.js'), encoding='utf-8').read(); key = 'const LANE118_LAYOUT='
LAY = json.loads(src[src.rindex(key) + len(key):].strip().rstrip(';'))
RT = json.load(open(os.path.join(GEN, 'l118_road.json'), encoding='utf-8'))
rng = random.Random(1182)
B.reset(texres=512)
root = B.group('lane118_ground', props={'kind': 'lane118_ground', 'layout': 'src/data/lane118_layout.js'})

# 導盲磚（黃色、一排排的小圓點）：程式畫的小貼圖
tp = os.path.join(GEN, 'l118_tactile.png')
if not os.path.exists(tp):
    im = Image.new('RGB', (128, 128), (214, 172, 52)); d = ImageDraw.Draw(im)
    for i in range(6):
        for j in range(6): cx, cy = 11 + i * 21, 11 + j * 21; d.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=(236, 196, 74)); d.ellipse([cx - 6, cy + 2, cx + 6, cy + 6], fill=(184, 146, 40))
    d.rectangle([0, 0, 127, 127], outline=(160, 128, 36)); im.save(tp)


def img_mat(name, fn, rough=0.9):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    m['tile'] = 1.0
    return m


M = {k: img_mat('l118_road_' + k, RT[k]['file']) for k in ('lane', 'xinhai', 'heping')}
M.update({'pave': L.pbr('l118_sidewalk_tiles', 'granite_tile', tile=1.2, target='#b2aca2', contrast=0.8, normal=0.5, maps=('diff', 'nor'), res=512, rough_value=0.85),
          'curb': L.flat('l118_curb_granite', '#9d988f', rough=0.8),
          'tactile': img_mat('l118_tactile', 'l118_tactile.png', rough=0.7),
          'granite': L.pbr('l118_gate_granite', 'granite_tile', tile=0.9, target='#8e8b85', contrast=0.9, normal=0.6, maps=('diff', 'nor'), res=512, rough_value=0.8),
          'cap': L.flat('l118_gate_cap', '#a9a59d', rough=0.75), 'iron': L.flat('l118_iron', '#1f2123', rough=0.45, metal=0.5),
          'plaque': L.flat('l118_plaque_blank', '#34332f', rough=0.4, metal=0.3), 'lamp': L.flat('GLOW_l118_gate_lamp', '#fff1d0', rough=0.3, emit=B.srgb('#ffe2a8')),
          'booth': L.flat('l118_booth_white', '#e6e3dc', rough=0.7), 'glass': L.flat('l118_booth_glass', '#3b4650', rough=0.1, metal=0.3),
          'grass': L.pbr('l118_campus_grass', 'grass_ground', tile=3.0, target='#5c7142', normal=0.4, maps=('diff', 'nor'), rough_value=0.95),
          'brick': L.pbr('l118_campus_brick', 'brick_pavement_04', tile=3.2, target='#9c4b35', contrast=1.1, normal=0.4, maps=('diff', 'nor'), rough_value=0.85),
          'city': L.flat('l118_far_ground', '#6f6c66', rough=0.95)})
try:
    import plants as PL
    PM = PL.materials('l118_'); LEAF = PM['leaf_small']; BARK = PM['bark']
except Exception as ex:
    print('plants', ex); LEAF = L.flat('l118_leaf', '#4a6a3a', rough=0.8); BARK = L.flat('l118_bark', '#54473b', rough=0.9)

LX0, LX1 = LAY['lane']['x0'], LAY['lane']['x1']; FW, FE = LAY['facade']['west'], LAY['facade']['east']; LZ0 = LAY['lane']['z0']; LZ1 = LAY['lane']['z1']
XS0, XS1 = RT['xinhai']['rect'][2], RT['xinhai']['rect'][3]      # 辛亥路車道 36.2～46
HN0, HN1 = RT['heping']['rect'][2], RT['heping']['rect'][3]      # 和平東路車道 −56～−44.2
GZ = LAY['backGate']['z']; CX, CW = LAY['roadSouth'].get('crossX', 0.0), LAY['roadSouth'].get('crossW', 4.0)
YR, YW, YC = 0.01, 0.03, 0.05                                      # 路面、人行道面、路緣頂

# ================= 路面（世界座標 → 貼圖 UV，和 lane118_ground_tex.py 的畫法一樣）=================
for k, m in M.items():
    if k not in ('lane', 'xinhai', 'heping'): continue
    X0, X1, Z0, Z1 = RT[k]['rect']; along = RT[k]['along']
    me = Mesh('l118_road_' + k, m); bm = me.bm; uvl = bm.loops.layers.uv.verify()
    pts = [(X0, Z1), (X1, Z1), (X1, Z0), (X0, Z0)]
    f = bm.faces.new([bm.verts.new(g2b(x, YR, z)) for (x, z) in pts])
    for lp, (x, z) in zip(f.loops, pts):
        lp[uvl].uv = ((z - Z0) / (Z1 - Z0), (x - X0) / (X1 - X0)) if along == 'z' else ((x - X0) / (X1 - X0), 1 - (z - Z0) / (Z1 - Z0))
    me.finish(root, uv=False)
# 遠景地面（路面外、建築底下）＋台大那一側的草地
cg = Mesh('l118_far_ground', M['city']); cg.box(-120, 120, -0.06, -0.02, -140, GZ + 0.4); cg.finish(root, uv=False)
gr = Mesh('l118_campus_grass', M['grass'], tile=3.0); gr.box(-120, 120, -0.06, -0.015, GZ + 0.4, 150); gr.finish(root)

# ================= 人行道＋路緣＋導盲磚 =================
pv = Mesh('l118_sidewalks', M['pave'], tile=1.2); cb = Mesh('l118_curbs', M['curb']); tc = Mesh('l118_tactile', M['tactile'])
def walk(x0, x1, z0, z1): pv.box(x0, x1, -0.02, YW, z0, z1)
def curb(x0, x1, z0, z1): cb.box(x0, x1, -0.02, YC, z0, z1)
for s in (-1, 1):   # 巷子兩邊：x ±3.4～±5.2（巷口 z 34 轉進辛亥路北邊的人行道）
    xa, xb = sorted((s * LX1, s * FE)); walk(xa, xb, LZ0, XS0)
    ca, cc = sorted((s * LX1, s * (LX1 + 0.15))); curb(ca, cc, LZ0, XS0)
    xa, xb = sorted((s * FE, s * 46.0)); walk(xa, xb, LZ1, XS0)                              # 辛亥路北邊（巷口以外）
    xa, xb = sorted((s * LX1, s * 46.0)); curb(xa, xb, XS0 - 0.15, XS0)
    xa, xb = sorted((s * LX1, s * 46.0)); walk(xa, xb, HN1, LZ0); curb(xa, xb, HN1, HN1 + 0.15)   # 和平東路南邊
# 辛亥路南邊（台大圍牆前）：斑馬線那一段路緣斷開、降到路面高度＋導盲磚
for (xa, xb) in ((-46.0, CX - CW / 2 - 0.3), (CX + CW / 2 + 0.3, 46.0)):
    walk(xa, xb, XS1, GZ + 0.4); curb(xa, xb, XS1, XS1 + 0.15)
pv.box(CX - CW / 2 - 0.3, CX + CW / 2 + 0.3, -0.02, YR + 0.004, XS1, GZ + 0.4)            # 斜坡（和路面一樣高）
for (xa, xb, za, zb) in ((CX - CW / 2, CX + CW / 2, XS1 + 0.05, XS1 + 0.65),):
    f = tc.bm.faces.new([tc.bm.verts.new(g2b(x, YR + 0.008, z)) for (x, z) in ((xa, zb), (xb, zb), (xb, za), (xa, za))]); uvl = tc.bm.loops.layers.uv.verify()
    for lp, uv in zip(f.loops, ((0, 0), ((xb - xa) / 0.6, 0), ((xb - xa) / 0.6, 1), (0, 1))): lp[uvl].uv = uv
pv.finish(root); cb.finish(root, uv=False); tc.finish(root, uv=False)

# ================= 台大後門（PROPOSAL：一般台大校門的做法）＋圍牆 =================
gm = Mesh('l118_gate_granite', M['granite'], tile=0.9); cp = Mesh('l118_gate_caps', M['cap']); ir = Mesh('l118_gate_iron', M['iron']); pl = Mesh('l118_gate_plaques', M['plaque']); lp_ = Mesh('GLOW_l118_gate_lamps', M['lamp'])
WZ = GZ + 0.2                                                                                    # 圍牆中線
OPEN = 4.0
for s in (-1, 1):
    x = s * (OPEN + 0.55)
    gm.box(x - 0.55, x + 0.55, 0.0, 3.4, WZ - 0.55, WZ + 0.55)                                 # 門柱 1.1 × 1.1 × 3.4
    cp.box(x - 0.68, x + 0.68, 3.4, 3.6, WZ - 0.68, WZ + 0.68); cp.box(x - 0.58, x + 0.58, 3.6, 3.75, WZ - 0.58, WZ + 0.58)
    cp.box(x - 0.62, x + 0.62, 0.0, 0.35, WZ - 0.62, WZ + 0.62)                                 # 柱腳
    pl.box(x - 0.32, x + 0.32, 1.7, 2.6, WZ - 0.58, WZ - 0.55)                                  # 牌子（空白）朝辛亥路
    ir.box(x - 0.07, x + 0.07, 3.75, 4.05, WZ - 0.07, WZ + 0.07); ir.box(x - 0.2, x + 0.2, 4.05, 4.1, WZ - 0.2, WZ + 0.2)   # 柱頂燈籠
    lp_.box(x - 0.15, x + 0.15, 4.1, 4.55, WZ - 0.15, WZ + 0.15)
    for sx in (-1, 1):
        for sz in (-1, 1): ir.box(x + sx * 0.17 - 0.02, x + sx * 0.17 + 0.02, 4.1, 4.58, WZ + sz * 0.17 - 0.02, WZ + sz * 0.17 + 0.02)
    ir.cyl((x, 4.58, WZ), (x, 4.85, WZ), 0.24, seg=4, r2=0.02)
    # 圍牆：花崗石矮牆（0.9 m）＋壓頂＋黑色鐵欄杆（到 2.0 m）＋每 4 m 一根石柱
    xa, xb = sorted((s * (OPEN + 1.1), s * 46.0))
    gm.box(xa, xb, 0.0, 0.9, WZ - 0.25, WZ + 0.25); cp.box(xa, xb, 0.9, 1.0, WZ - 0.3, WZ + 0.3)
    ir.box(xa, xb, 1.92, 1.97, WZ - 0.03, WZ + 0.03); ir.box(xa, xb, 1.12, 1.16, WZ - 0.03, WZ + 0.03)
    n = int((xb - xa) / 0.13)
    for k in range(n + 1):   # 欄杆的鐵條：一片朝外的細長面（雙面材質）＋頂上的小尖頭（三角形）——第一版每根做成方塊，整排 1.2 萬個三角形
        xx = xa + k * (xb - xa) / max(1, n); ir.quad([(xx - 0.013, 1.0, WZ), (xx + 0.013, 1.0, WZ), (xx + 0.013, 1.97, WZ), (xx - 0.013, 1.97, WZ)])
        if k % 2 == 0: ir.bm.faces.new([ir.bm.verts.new(g2b(*p_)) for p_ in ((xx - 0.025, 1.97, WZ), (xx + 0.025, 1.97, WZ), (xx, 2.08, WZ))])
    for k in range(int((xb - xa) / 4.0) + 1):
        xx = xa + k * 4.0
        if xx < xb - 0.3: gm.box(xx - 0.25, xx + 0.25, 0.0, 2.2, WZ - 0.3, WZ + 0.3); cp.box(xx - 0.3, xx + 0.3, 2.2, 2.32, WZ - 0.35, WZ + 0.35)
# 滑門：地上的軌道（橫過開口）＋收在東邊圍牆後面的黑色鐵門（兩片）
ir.box(-OPEN - 0.1, OPEN + 0.1, 0.0, 0.02, WZ + 0.3, WZ + 0.36)
for k in range(2):
    x0 = OPEN + 1.2 + k * 0.05; z = WZ + 0.55 + k * 0.12; ir.box(x0, x0 + 4.0, 0.08, 0.16, z - 0.03, z + 0.03); ir.box(x0, x0 + 4.0, 1.72, 1.8, z - 0.03, z + 0.03)
    for j in range(31): xx = x0 + j * 4.0 / 30; ir.quad([(xx - 0.015, 0.08, z), (xx + 0.015, 0.08, z), (xx + 0.015, 1.8, z), (xx - 0.015, 1.8, z)])
    for xx in (x0 + 0.4, x0 + 3.6): ir.cyl((xx, 0.05, z), (xx, 0.0, z), 0.07, seg=8)
# 警衛亭（門內東邊）
bx, bz = OPEN + 3.0, WZ + 3.2; bo = Mesh('l118_booth', M['booth']); bg = Mesh('l118_booth_glass', M['glass'])
bo.box(bx - 1.1, bx + 1.1, 0.0, 0.9, bz - 1.0, bz + 1.0); bo.box(bx - 1.1, bx + 1.1, 2.2, 2.55, bz - 1.0, bz + 1.0)
for (a, b) in ((-1.1, -1.0), (1.0, 1.1)):
    for (c, d) in ((-1.0, -0.9), (0.9, 1.0)): bo.box(bx + a, bx + b, 0.9, 2.2, bz + c, bz + d)
bo.box(bx - 1.25, bx + 1.25, 2.55, 2.65, bz - 1.15, bz + 1.15)
bg.box(bx - 1.0, bx + 1.0, 0.9, 2.2, bz - 0.98, bz - 0.95); bg.box(bx - 1.08, bx - 1.05, 0.9, 2.2, bz - 0.9, bz + 0.9); bg.box(bx + 1.05, bx + 1.08, 0.9, 2.2, bz - 0.9, bz + 0.6)
bo.finish(root, uv=False); bg.finish(root, uv=False)
# 門內一小段紅磚步道
bw = Mesh('l118_campus_brick', M['brick'], tile=3.2); bw.box(-OPEN, OPEN, -0.02, 0.012, WZ - 0.1, WZ + 14.0); bw.finish(root)
gm.finish(root); cp.finish(root, uv=False); ir.finish(root, uv=False); pl.finish(root, uv=False); lp_.finish(root, uv=False)

# ================= 牆後的大樹（芯＋葉片卡，和美國校園同一個做法）=================
trunk = Mesh('l118_trunks', BARK); cards = Mesh('l118_tree_cards', LEAF); core = Mesh('l118_tree_core', L.flat('l118_tree_core', '#33472a', rough=0.98))
def leaf_card(m, px, py, pz, sz, yaw, tilt):
    ca, sa = math.cos(yaw), math.sin(yaw)
    def P(du, dv): return (px + ca * du, py + dv + tilt * du, pz + sa * du)
    f = m.bm.faces.new([m.bm.verts.new(g2b(*P(du, dv))) for (du, dv) in ((-sz / 2, -sz / 2), (sz / 2, -sz / 2), (sz / 2, sz / 2), (-sz / 2, sz / 2))])
    uvl = m.bm.loops.layers.uv.verify()
    for lp, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uvl].uv = uv
def crown(cx, cy, cz, rx, ry, rz, ncard, csz):
    v0 = set(core.bm.verts); core.ell((cx, cy, cz), rx * 0.62, ry * 0.62, rz * 0.62, seg=7, rings=4)
    for vv in core.bm.verts:
        if vv not in v0: k = rng.uniform(0.88, 1.08); c0 = Vector(g2b(cx, cy, cz)); vv.co = c0 + (vv.co - c0) * k
    for j in range(ncard):
        a_ = rng.uniform(0, 2 * math.pi); e_ = math.asin(rng.uniform(-0.85, 1.0)); rr = rng.uniform(0.72, 1.02)
        leaf_card(cards, cx + rx * rr * math.cos(a_) * math.cos(e_), cy + ry * rr * math.sin(e_), cz + rz * rr * math.sin(a_) * math.cos(e_), csz * rng.uniform(0.8, 1.25), rng.uniform(0, math.pi), rng.uniform(-0.5, 0.5))
def tree(x, z, h):
    rb = rng.uniform(0.25, 0.38)
    bt = L.lathe([(rb * 1.4, 0.0), (rb, 0.4), (rb * 0.82, h * 0.38), (rb * 0.55, h * 0.6)], seg=8)
    trunk.add_bm(bt, Matrix.Translation(g2b(x, 0, z))); bt.free()
    cr = h * 0.33; cy = h * 0.66
    for k in range(3):
        a_ = rng.uniform(0, 2 * math.pi); yb = h * rng.uniform(0.36, 0.48)
        trunk.cyl((x, yb, z), (x + math.cos(a_) * cr * 0.7, cy + rng.uniform(-0.5, 1.0), z + math.sin(a_) * cr * 0.7), rb * 0.4, seg=6, r2=rb * 0.18)
    for k in range(rng.randint(4, 5)):
        a_ = rng.uniform(0, 2 * math.pi); d_ = cr * rng.uniform(0.2, 0.6); r_ = cr * rng.uniform(0.48, 0.68)
        crown(x + math.cos(a_) * d_, cy + rng.uniform(-0.2, 0.4) * cr, z + math.sin(a_) * d_, r_, r_ * 0.78, r_, int(5 * r_ * r_), 2.0)
for k in range(16):
    x = -42 + k * 5.6 + rng.uniform(-1.2, 1.2)
    if abs(x) < OPEN + 1.5: continue
    tree(x, WZ + rng.uniform(3.5, 8.0), rng.uniform(11, 16))
for k in range(9):
    x = -36 + k * 9.0 + rng.uniform(-2, 2)
    if abs(x) < OPEN + 2.0: continue                                                              # 門口正對的那一條留空（從巷口看得進校園）
    tree(x, WZ + rng.uniform(13, 20), rng.uniform(13, 18))
for k in range(7): tree(-48 + k * 16.0 + rng.uniform(-2, 2), WZ + rng.uniform(34, 42), rng.uniform(14, 19))   # 遠一排
trunk.finish(root, uv=False); cards.finish(root, uv=False, merge=False); core.finish(root, uv=False, smooth=True)
# 遠景：校園裡的系館（D38 分類 ②：遠景、走不到；米白面磚、一排排窗、平屋頂），在樹後面
fm = Mesh('l118_far_halls', L.flat('l118_far_hall_wall', '#cdc4b4', rough=0.85)); fw_ = Mesh('l118_far_hall_windows', L.flat('l118_far_hall_win', '#3d4650', rough=0.3, metal=0.2))
for (x0, x1, z0, h) in ((-30.0, -8.0, WZ + 26.0, 13.0), (9.0, 34.0, WZ + 30.0, 16.5)):
    fm.box(x0, x1, 0.0, h, z0, z0 + 12.0); fm.box(x0 - 0.3, x1 + 0.3, h, h + 0.5, z0 - 0.3, z0 + 12.3)
    for f in range(int(h / 3.4)):
        for k in range(int((x1 - x0 - 1.0) / 2.2)):
            wx = x0 + 0.9 + k * 2.2; fw_.box(wx, wx + 1.3, 1.0 + f * 3.4, 2.6 + f * 3.4, z0 - 0.02, z0)
fm.finish(root, uv=False); fw_.finish(root, uv=False)

if '--stats' in A:
    rows = []
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); rows.append((len(ob.data.loop_triangles), ob.name))
    for n, nm in sorted(rows, reverse=True)[:12]: print('STATS', n, nm)
if not PREVIEW:
    L.merge_by_material(root, keep=lambda ob: False)
    st_ = L.export(OUT, gpu_instances=False)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    L.write_json(OUT[:-4] + '.json', dict(st_ if isinstance(st_, dict) else {}, tris_total=tris, layout='src/data/lane118_layout.js'))
    print('lane118_ground tris', tris)
else:
    if '--with-street' in A:   # 預覽時把街景 GLB 一起放進來（看接起來的樣子）
        bpy.ops.import_scene.gltf(filepath=os.path.join(L.ROOT, 'assets/models/env/second_ai/lane118_street.glb'))
    sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = int(opt('--samples', '24'))
    try: sc.cycles.use_denoising = True
    except Exception: pass
    rw, rh = map(int, opt('--res', '1280x720').split('x')); sc.render.resolution_x, sc.render.resolution_y = rw, rh; sc.view_settings.view_transform = 'AgX'
    sc.view_settings.exposure = float(opt('--exposure', '-0.2'))
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree; bgn = nt.nodes['Background']
    sky = nt.nodes.new('ShaderNodeTexSky')
    try: sky.sky_type = 'NISHITA'; sky.sun_elevation = math.radians(40); sky.sun_rotation = math.radians(200)
    except Exception: pass
    nt.links.new(sky.outputs['Color'], bgn.inputs['Color']); bgn.inputs['Strength'].default_value = 0.3
    lt = bpy.data.lights.new('sun', 'SUN'); lt.energy = 3.2; lt.angle = math.radians(1.5); o = bpy.data.objects.new('sun', lt); sc.collection.objects.link(o); o.rotation_euler = (math.radians(50), 0, math.radians(35))
    CAMS = {'gate': ((2.5, 1.65, 37.5), (0.0, 2.0, 52.0), 24), 'lane': ((0.8, 1.65, 31.0), (0.0, 1.5, 10.0), 24), 'corner': ((-9.0, 1.65, 44.0), (1.0, 1.0, 34.0), 22),
            'aerial': ((26.0, 26.0, 62.0), (0.0, 0.0, 34.0), 24), 'game': ((0.0, 3.6, 38.5), (0.0, 0.8, 33.0), 26)}
    eye, look, lens = CAMS[opt('--cam', 'gate')]
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = lens; cam.data.clip_end = 600
    e, l_ = Vector(g2b(*eye)), Vector(g2b(*look)); cam.location = e; cam.rotation_euler = (l_ - e).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.abspath(PREVIEW); bpy.ops.render.render(write_still=True); print('saved', PREVIEW)
