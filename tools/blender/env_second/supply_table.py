"""霖澤館一樓的「考前補給包」桌子（NPC-POOL-ART-1028，LAWWW2-C 2026-10-28；AA_498 5-3：郁婷那一晚包好的隔天，霖澤館一樓入口內；
pool3d.js 的 ytTable「看補給的桌子」）→ GLB。只有那一天擺出來（pool3d.js 照 S.ytTableDue 放在 (4.6, 1.05)：玻璃電梯南邊；
互動點從 (4.6, 0.6) 移到桌子南邊 (4.6, 2.05)，不然會被桌子蓋住；見 patches/npc_pool_art_1028*.patch）。
  /opt/blenv/bin/python tools/blender/env_second/supply_table.py [-- --out assets/models/env/second_ai/linze_supply_table.glb]
原點＝桌子中心、地面；遊戲座標方向（x 東、y 上、z 南）。桌子長邊沿 x（1.8 m）；拿的人站 +z 那一邊（南：從入口進來的方向），發的人站 −z。
  摺疊桌：淺灰桌面（圓角）、灰色鐵管腳和橫桿；正面垂一張手寫的布條（本作程式畫：「期中考加油！」「補給包 一人一包」；沒有真的社團名字，D77）。
  桌上：三排夾鏈袋的補給包（每包一盒餅乾、兩顆糖、一張小卡；有幾包歪了）、拆開的紙箱（還有一疊）、立牌「一人一包」、一捲膠帶、筆筒。
  桌子後面一張摺疊椅（發的人坐的）。材質：純色＋頂點色＋一張本作畫的貼圖（布條、立牌），沒有外部素材。
"""
import math, os, random, sys
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, Vector   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/linze_supply_table.glb'))
GEN = os.path.join(HERE, 'textures', 'gen'); os.makedirs(GEN, exist_ok=True)
PNG = os.path.join(GEN, 'supply_table_print.png')
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'

# ---------------- 貼圖：上 3/4 布條（1024×288）、下面立牌（兩面一樣，512×224）----------------
def write_texture():
    W, H = 1024, 512; im = Image.new('RGB', (W, H), '#efe3c4'); d = ImageDraw.Draw(im); rr = random.Random(5)
    F = lambda n: ImageFont.truetype(CJK, n)
    # 布條：牛皮紙色、手畫的邊框（歪一點）、大字、小字、星星、手畫的愛心
    for k in range(3):
        o = 10 + k * 3; d.rectangle([o + rr.randint(-2, 2), o, W - o + rr.randint(-2, 2), 288 - o], outline=('#c0392b', '#d35400', '#c0392b')[k], width=3)
    def ctext(cx, y, t, f, fill):
        w = d.textlength(t, font=f); d.text((cx - w / 2, y), t, font=f, fill=fill)
    ctext(W / 2, 34, '期中考加油！', F(118), '#b5302a')
    ctext(W / 2, 178, '補給包　一人一包', F(72), '#2c4a7c')
    for (cx, cy, s) in ((92, 80, 26), (930, 70, 30), (120, 230, 18), (905, 228, 22), (300, 40, 14), (720, 250, 16)):
        pts = [(cx + s * math.cos(a * math.pi / 5 - math.pi / 2) * (1 if a % 2 == 0 else 0.45), cy + s * math.sin(a * math.pi / 5 - math.pi / 2) * (1 if a % 2 == 0 else 0.45)) for a in range(10)]
        d.polygon(pts, fill=('#e6b422', '#d35400')[int(cx) % 2])
    # 立牌（y 288～512）：白底、紅色邊、「一人一包」「不要搶 :)」
    d.rectangle([0, 288, W // 2, H], fill='#fbfaf5'); d.rectangle([6, 294, W // 2 - 6, H - 6], outline='#c0392b', width=6)
    ctext(W // 4, 318, '一人一包', F(84), '#b5302a'); ctext(W // 4, 430, '不要搶 :)', F(44), '#2c4a7c')
    # 右下：補給包裡的小卡（白色小卡、一行手寫）
    d.rectangle([W // 2, 288, W, H], fill='#fdfbf2'); d.line([(W // 2 + 30, 360), (W - 30, 360)], fill='#9db6d6', width=3); d.line([(W // 2 + 30, 430), (W - 30, 430)], fill='#9db6d6', width=3)
    ctext(W * 3 // 4, 318, '加油！', F(60), '#c0392b')
    im.save(PNG)
    return (0.0, 1 - 288 / H, 1.0, 1.0), (0.0, 0.0, 0.5, 1 - 288 / H), (0.5, 0.0, 1.0, 1 - 288 / H)   # 布條、立牌、小卡的 UV（u0, v0, u1, v1）


def img_material(name, png, rough=0.8):
    m = L.flat(name, '#ffffff', rough=rough); nt = m.node_tree; N = nt.nodes
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(png); nt.links.new(tx.outputs['Color'], N['Principled BSDF'].inputs['Base Color'])
    m.use_backface_culling = False; return m


def uvquad(mesh, pts, rect):
    bm = mesh.bm; uvl = bm.loops.layers.uv.verify(); u0, v0, u1, v1 = rect
    f = bm.faces.new([bm.verts.new(g2b(*p)) for p in pts])
    for lp, uv in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = uv
    return f


def tube(mesh, a, b, r, hexcol, seg=8):
    """兩點之間的圓管（頂點色）"""
    import bmesh
    A, Bv = g2b(*a), g2b(*b); d = Bv - A; ln = d.length
    if ln < 1e-6: return
    before = set(mesh.bm.faces)
    res = bmesh.ops.create_cone(mesh.bm, cap_ends=True, segments=seg, radius1=r, radius2=r, depth=ln)
    q = Vector((0, 0, 1)).rotation_difference(d.normalized()); M = q.to_matrix().to_4x4(); M.translation = (A + Bv) / 2
    bmesh.ops.transform(mesh.bm, matrix=M, verts=res['verts'])
    mesh.paint([f for f in mesh.bm.faces if f not in before], hexcol)


B.reset(texres=512)
UV_BAN, UV_SIGN, UV_CARD = write_texture()
VC = L.vc_material('st_vc', rough=0.6)
M = {'top': L.flat('st_top', '#e2e0da', rough=0.45), 'steel': L.flat('st_steel', '#8d939a', rough=0.4, metal=0.4), 'print': img_material('st_print', PNG)}
root = B.group('linze_supply_table', props={'kind': 'supply_table'})
TW, TD, TH = 1.8, 0.6, 0.74
top = Mesh('st_top', M['top']); top.rbox(-TW / 2, TW / 2, TH - 0.03, TH, -TD / 2, TD / 2, r=0.012, seg=2); top.finish(root)
vc = CMesh('st_parts', VC); st = CMesh('st_frame', L.vc_metal('st_frame_m', rough=0.42, metal=0.4))
# 摺疊桌腳：兩組 U 形（每邊兩支腳＋下面的橫桿）、中間的斜撐
for sx in (-1, 1):
    x = sx * (TW / 2 - 0.12)
    for sz in (-1, 1): tube(st, (x, 0.0, sz * (TD / 2 - 0.06)), (x, TH - 0.03, sz * (TD / 2 - 0.06)), 0.013, '#8d939a')
    tube(st, (x, 0.08, -(TD / 2 - 0.06)), (x, 0.08, TD / 2 - 0.06), 0.011, '#8d939a')
    tube(st, (x, TH - 0.06, 0.0), (sx * 0.25, TH - 0.06, 0.0), 0.009, '#8d939a')
    for sz in (-1, 1): vc.crbox(x - 0.02, x + 0.02, 0.0, 0.012, sz * (TD / 2 - 0.06) - 0.02, sz * (TD / 2 - 0.06) + 0.02, '#2a2c2f', r=0.004, seg=1)   # 腳套
st.cbox(-TW / 2 + 0.05, TW / 2 - 0.05, TH - 0.06, TH - 0.03, -TD / 2 + 0.03, -TD / 2 + 0.05, '#8d939a')   # 桌面下的框
st.cbox(-TW / 2 + 0.05, TW / 2 - 0.05, TH - 0.06, TH - 0.03, TD / 2 - 0.05, TD / 2 - 0.03, '#8d939a')
# 正面的布條（從桌緣垂下來，用膠帶貼住：四個角的膠帶）
pr = Mesh('st_print', M['print'])
bz = TD / 2 + 0.006; by0, by1 = TH - 0.33, TH - 0.02
uvquad(pr, [(-0.78, by0, bz), (0.78, by0, bz), (0.78, by1, bz), (-0.78, by1, bz)], UV_BAN)
for tx in (-0.76, 0.76): vc.cbox(tx - 0.03, tx + 0.03, by1 - 0.02, by1 + 0.035, bz - 0.002, bz + 0.002, '#e8e2c8')
# 立牌（A 字形，桌子後半中間）：兩片紙板頂端靠在一起，底下各往外 6 cm
sw, sh, zt = 0.26, 0.19, -0.12
for zb_, flip in ((zt + 0.06, False), (zt - 0.06, True)):
    xl, xr = (sw / 2, -sw / 2) if flip else (-sw / 2, sw / 2)
    uvquad(pr, [(xl, TH, zb_), (xr, TH, zb_), (xr, TH + sh, zt), (xl, TH + sh, zt)], UV_SIGN)
# 補給包：三排、每排七包（前兩排整齊、最後一排有幾包歪了）；夾鏈袋（半透明的白）＋裡面一盒餅乾、兩顆糖、一張小卡
rr = random.Random(11); packs = 0
for row, zc in enumerate((0.19, 0.04, -0.11)):
    for i in range(7):
        x = -0.75 + i * 0.13 + (rr.uniform(-0.01, 0.01)); z = zc + rr.uniform(-0.012, 0.012); tilt = rr.uniform(-0.25, 0.25) if row == 2 else rr.uniform(-0.06, 0.06)
        if row == 2 and i in (5, 6): continue   # 已經被拿走的
        if abs(x) < 0.16 and row == 2: continue   # 立牌的位置
        cos_, sin_ = math.cos(tilt), math.sin(tilt)
        def P(lx, lz): return (x + lx * cos_ - lz * sin_, z + lx * sin_ + lz * cos_)
        y0 = TH
        # 袋子：一個稍微鼓起來的扁盒（白、偏灰）
        bag = [P(-0.055, -0.07), P(0.055, -0.07), P(0.055, 0.07), P(-0.055, 0.07)]
        xs = [p[0] for p in bag]; zs = [p[1] for p in bag]
        vc.crbox(min(xs) + 0.012, max(xs) - 0.012, y0, y0 + 0.035, min(zs) + 0.012, max(zs) - 0.012, '#eceee9', r=0.012, seg=2)
        cx_, cz_ = P(0.0, -0.015)
        vc.crbox(cx_ - 0.035, cx_ + 0.035, y0 + 0.006, y0 + 0.037, cz_ - 0.045, cz_ + 0.02, ('#d9822b', '#c0392b', '#2e86c1', '#d4ac0d')[(row * 7 + i) % 4], r=0.004, seg=1)   # 餅乾盒（四種顏色）
        for k in range(2):
            gx, gz = P(-0.02 + k * 0.04, 0.045)
            vc.crbox(gx - 0.012, gx + 0.012, y0 + 0.006, y0 + 0.022, gz - 0.008, gz + 0.008, ('#e74c3c', '#27ae60', '#f39c12')[(i + k) % 3], r=0.005, seg=1)   # 糖果
        vc.cbox(cx_ - 0.04, cx_ + 0.04, y0 + 0.037, y0 + 0.039, cz_ + 0.025, cz_ + 0.055, '#ffd6e0')   # 夾鏈（粉紅的封口）
        packs += 1
# 紙箱（打開的，桌子後面左邊；裡面還有一疊）、膠帶、筆筒
bx, bz2 = -0.62, -0.17
vc.cbox(bx - 0.2, bx + 0.2, TH, TH + 0.2, bz2 - 0.11, bz2 + 0.11, '#b98e5a')
vc.cbox(bx - 0.19, bx + 0.19, TH + 0.12, TH + 0.19, bz2 - 0.1, bz2 + 0.1, '#eceee9')   # 箱子裡的補給包（頂）
for s_ in (-1, 1): vc.cbox(bx - 0.2, bx + 0.2, TH + 0.2, TH + 0.205, bz2 + s_ * 0.11, bz2 + s_ * 0.22, '#c49a63')   # 掀開的蓋子
tube(vc, (0.55, TH, -0.15), (0.55, TH + 0.05, -0.15), 0.045, '#d9d2b8', seg=14)   # 膠帶
tube(vc, (0.72, TH, -0.18), (0.72, TH + 0.1, -0.18), 0.035, '#34495e', seg=12)   # 筆筒
for k in range(3): tube(vc, (0.72 + (k - 1) * 0.012, TH + 0.08, -0.18), (0.72 + (k - 1) * 0.02, TH + 0.16, -0.18 + (k - 1) * 0.01), 0.004, ('#1a1a1a', '#c0392b', '#2e86c1')[k], seg=6)
# 桌上散落的兩張小卡
for (cx2, cz2, a) in ((0.32, -0.2, 0.3), (0.42, -0.16, -0.2)):
    ca, sa = math.cos(a), math.sin(a); Q = lambda lx, lz: (cx2 + lx * ca - lz * sa, TH + 0.002, cz2 + lx * sa + lz * ca)
    uvquad(pr, [Q(-0.045, 0.03), Q(0.045, 0.03), Q(0.045, -0.03), Q(-0.045, -0.03)], UV_CARD)
# 摺疊椅（桌子後面，偏右；朝 +z 坐）
chx, chz = 0.35, -0.62
for sx in (-1, 1):
    tube(st, (chx + sx * 0.2, 0.0, chz + 0.2), (chx + sx * 0.2, 0.46, chz + 0.02), 0.011, '#5d6166')
    tube(st, (chx + sx * 0.2, 0.0, chz - 0.2), (chx + sx * 0.2, 0.88, chz - 0.17), 0.011, '#5d6166')
vc.crbox(chx - 0.21, chx + 0.21, 0.44, 0.47, chz - 0.17, chz + 0.21, '#4a5866', r=0.012, seg=2)   # 椅面
vc.crbox(chx - 0.2, chx + 0.2, 0.62, 0.84, chz - 0.2, chz - 0.17, '#4a5866', r=0.01, seg=2)   # 椅背
vc.crbox(chx - 0.12, chx + 0.06, 0.47, 0.52, chz - 0.05, chz + 0.12, '#2b3a4a', r=0.015, seg=2)   # 椅子上放著的外套（發的人剛站起來）
for m_ in (vc, st): m_.finish(root, uv=False)
pr.finish(root, uv=False)
print('packs', packs)
L.export(OUT, gpu_instances=False)
