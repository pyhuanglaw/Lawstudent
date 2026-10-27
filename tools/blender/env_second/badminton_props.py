"""羽球小短片的道具（BADMINTON-CLIP-1027，使用者 X106「跟陳語彤打羽球也只是對話帶過? 不能做個小短片?」；LAWWW2-C 2026-10-27）→ GLB。
  /opt/blenv/bin/python tools/blender/env_second/badminton_props.py [-- --out assets/models/env/second_ai/badminton_props.glb]

三組（各自一個群組，遊戲端照名字拿出來用；座標＝遊戲座標方向：x 東、y 上、z 南）：
  badminton_racket：球拍。原點＝握把底部中心，拍子沿 +y（握把 → 拍桿 → T 頭 → 拍框），拍面在 xy 平面（法線 ±z）。全長 0.675 m（比賽規格上限 680 mm）。
    握把：纏帶（一圈一圈微微凸起）＋底蓋；拍桿：細的碳纖維管（金屬灰）；T 頭；拍框：橢圓（寬 0.196、長 0.234），斷面 9×7.5 mm 的扁管；
    線床：一片貼圖（本作程式畫的十字編織線，橢圓外透明，alpha clip、雙面）。給兩個人用：祐廷深藍、語彤白底淺藍（badminton_racket_b）。
  badminton_shuttle：羽球。原點＝軟木頭最底下，球沿 +y（軟木頭在下、羽毛裙往上張開）；長 0.085、裙口直徑 0.066。
    軟木頭：白色皮革包覆的半球＋短圓柱；羽毛裙：開口的圓錐（16 片羽毛的貼圖，上緣扇形用 alpha 切），兩圈綁線。
  badminton_net：球網＋兩支網柱（原點＝網的中心線、地面；網沿 x、寬 6.1 m）。網高：中間 1.524 m、柱子 1.55 m；網深 0.76 m（上緣白色布帶 75 mm）。
    網目：本作程式畫的貼圖（墨綠細線、2 cm 方格，alpha clip、雙面）；網柱：白色鋼管＋圓形配重底座。
材質全部是本作的程式貼圖或純色（沒有外部素材）。
"""
import json, math, os, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/badminton_props.glb'))
GEN = os.path.join(HERE, 'textures', 'gen'); os.makedirs(GEN, exist_ok=True)
STR_PNG, NET_PNG, FEA_PNG = (os.path.join(GEN, n) for n in ('badminton_strings.png', 'badminton_net.png', 'badminton_feather.png'))

# ---------------- 貼圖（本作程式畫的）----------------
FW, FL = 0.098, 0.117            # 拍框橢圓的半寬（x）、半長（y）——外緣中心線
def write_textures():
    # 線床：256×256，對應拍框內緣的外接方框；直線、橫線各 22 條，線的地方白色、其他透明；橢圓外透明
    n = 256; yy, xx = np.mgrid[0:n, 0:n] / (n - 1) * 2 - 1
    inside = (xx ** 2 + yy ** 2) <= 1.0
    def lines(v, k, w):
        f = np.abs(((v + 1) / 2 * k) % 1 - 0.5); return np.clip((w - (0.5 - f)) / w, 0, 1)
    a = np.maximum(lines(xx, 22, 0.16), lines(yy, 26, 0.16)) * inside
    rgb = np.ones((n, n, 3)) * np.array([0.95, 0.95, 0.92])
    Image.fromarray(np.concatenate([(rgb * 255).astype(np.uint8), (a[..., None] * 255).astype(np.uint8)], -1), 'RGBA').save(STR_PNG)
    # 球網：256×256 ＝ 0.2 m × 0.2 m（10 格），墨綠線；四邊循環
    n = 256; yy, xx = np.mgrid[0:n, 0:n] / n
    def grid(v): f = (v * 10) % 1; return ((f < 0.09) | (f > 0.97)).astype(float)
    a = np.maximum(grid(xx), grid(yy))
    rgb = np.ones((n, n, 3)) * np.array([0.10, 0.14, 0.12])
    Image.fromarray(np.concatenate([(rgb * 255).astype(np.uint8), (a[..., None] * 255).astype(np.uint8)], -1), 'RGBA').save(NET_PNG)
    # 羽毛裙：512×128（u＝繞一圈 16 片，v＝0 下緣（綁在軟木頭）→ 1 上緣）；每片羽毛中間一條羽軸，上緣圓弧（扇形），羽毛之間有細縫
    w, h = 512, 128; v, u = np.mgrid[0:h, 0:w]; v = 1 - v / (h - 1); uu = (u / w * 16) % 1
    edge = 0.86 + 0.12 * np.sqrt(np.clip(1 - ((uu - 0.5) / 0.5) ** 2, 0, 1))
    a = ((v <= edge) & (np.abs(uu - 0.5) < 0.485)).astype(float)
    shaft = np.clip(1 - np.abs(uu - 0.5) / 0.025, 0, 1)
    col = np.ones((h, w, 3)) * np.array([0.97, 0.97, 0.95]); col *= (1 - 0.10 * shaft[..., None]); col *= (0.93 + 0.07 * v[..., None])
    Image.fromarray(np.concatenate([(np.clip(col, 0, 1) * 255).astype(np.uint8), (a[..., None] * 255).astype(np.uint8)], -1), 'RGBA').save(FEA_PNG)


def img_material(name, png, rough=0.6, metal=0.0):
    m = L.flat(name, '#ffffff', rough=rough, metal=metal); nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(png); tx.image.alpha_mode = 'STRAIGHT'
    nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    rd = N.new('ShaderNodeMath'); rd.operation = 'ROUND'; nt.links.new(tx.outputs['Alpha'], rd.inputs[0]); nt.links.new(rd.outputs[0], bs.inputs['Alpha'])   # alphaMode MASK
    m.use_backface_culling = False; return m


B.reset(texres=512)
write_textures()
M = {'frameA': L.flat('bm_frame_navy', '#1d2b57', rough=0.28, metal=0.25), 'frameB': L.flat('bm_frame_white', '#eef1f4', rough=0.3, metal=0.15),
     'accentB': L.flat('bm_frame_skyblue', '#6fb3dc', rough=0.3, metal=0.15),
     'shaft': L.flat('bm_shaft', '#7c838c', rough=0.32, metal=0.42), 'grip': L.flat('bm_grip_towel', '#ece8de', rough=0.9), 'gripB': L.flat('bm_grip_blue', '#3a6fa8', rough=0.85),
     'cap': L.flat('bm_cap', '#26282c', rough=0.5), 'strings': img_material('bm_strings', STR_PNG, rough=0.5),
     'cork': L.flat('bm_cork', '#f4f0e6', rough=0.55), 'thread': L.flat('bm_thread', '#c9312e', rough=0.6), 'feather': img_material('bm_feather', FEA_PNG, rough=0.7),
     'net': img_material('bm_net', NET_PNG, rough=0.8), 'tape': L.flat('bm_net_tape', '#f2f2ee', rough=0.7), 'post': L.flat('bm_post', '#e9eaec', rough=0.35, metal=0.3),
     'base': L.flat('bm_post_base', '#2a2c30', rough=0.6)}
root = B.group('badminton_props', props={'kind': 'badminton_props'})


def ring_tube(mesh, pts, normals, w, t):
    """沿一圈閉合的路徑（xy 平面，z=0）做扁管：w＝徑向寬、t＝厚（z）；pts、normals 是 (x, y) 與往外的法線"""
    bm = mesh.bm; rings = []
    for (x, y), (nx, ny) in zip(pts, normals):
        rings.append([bm.verts.new(g2b(x + nx * dw, y + ny * dw, dz)) for (dw, dz) in ((-w / 2, -t / 2), (w / 2, -t / 2), (w / 2, t / 2), (-w / 2, t / 2))])
    n = len(rings)
    for i in range(n):
        a, b = rings[i], rings[(i + 1) % n]
        for k in range(4):
            bm.faces.new((a[k], a[(k + 1) % 4], b[(k + 1) % 4], b[k]))


def racket(name, frame_mat, grip_mat, accent=None):
    g = B.group(name, parent=root, props={'kind': 'badminton_racket'})
    # 握把（纏帶：每 12 mm 一圈微凸）＋底蓋
    prof = [(0.0, 0.0), (0.0135, 0.0), (0.0145, 0.004)]
    for i in range(17):
        y = 0.008 + i * 0.012; r = 0.0142 - 0.0018 * (i / 16)
        prof += [(r - 0.0006, y), (r + 0.0003, y + 0.006)]
    prof += [(0.0118, 0.206), (0.0062, 0.214), (0.0, 0.214)]
    gm = Mesh(name + '_grip', grip_mat); bmg = L.lathe(prof, seg=10); gm.add_bm(bmg); bmg.free()
    ob = gm.finish(g, uv=True); L.smooth_mesh(ob, angle=0.9)
    cp = Mesh(name + '_cap', M['cap']); bmc = L.lathe([(0.0, -0.004), (0.0142, -0.004), (0.0148, 0.0005), (0.0, 0.0005)], seg=10); cp.add_bm(bmc); bmc.free(); cp.finish(g, uv=False)
    # 拍桿＋T 頭
    sh = Mesh(name + '_shaft', M['shaft']); sh.cyl((0, 0.212, 0), (0, 0.447, 0), 0.0043, seg=8, r2=0.0037)
    sh.cyl((0, 0.444, 0), (0, 0.468, 0), 0.0062, seg=8, r2=0.0058); o2 = sh.finish(g, uv=False); L.smooth_mesh(o2, angle=1.2)
    # 拍框：橢圓（上半圓弧稍微方一點：超級橢圓 n=2.3）
    cy = 0.468 + FL; N_ = 56; pts, nrm = [], []
    for i in range(N_):
        th = 2 * math.pi * i / N_; c, s = math.cos(th), math.sin(th); e = 2 / 2.3
        x = FW * math.copysign(abs(c) ** e, c); y = cy + FL * math.copysign(abs(s) ** e, s); pts.append((x, y))
    for i in range(N_):
        (x0, y0), (x1, y1) = pts[i - 1], pts[(i + 1) % N_]; tx, ty = x1 - x0, y1 - y0; ln = math.hypot(tx, ty); nrm.append((ty / ln, -tx / ln))
    fr = Mesh(name + '_frame', frame_mat); ring_tube(fr, pts, nrm, 0.009, 0.0075); o3 = fr.finish(g, uv=False, merge=False); L.smooth_mesh(o3, angle=0.9)
    if accent is not None:   # 白拍：框的上半圈一段淺藍
        ac = Mesh(name + '_accent', accent); sel = [i for i in range(N_) if math.sin(2 * math.pi * i / N_) > 0.55]
        bm = ac.bm; rings = []
        for i in sel:
            (x, y), (nx, ny) = pts[i], nrm[i]; rings.append([bm.verts.new(g2b(x + nx * dw, y + ny * dw, dz)) for (dw, dz) in ((-0.0047, -0.0039), (0.0047, -0.0039), (0.0047, 0.0039), (-0.0047, 0.0039))])
        for a_, b_ in zip(rings, rings[1:]):
            for k in range(4): bm.faces.new((a_[k], a_[(k + 1) % 4], b_[(k + 1) % 4], b_[k]))
        o4 = ac.finish(g, uv=False, merge=False); L.smooth_mesh(o4, angle=0.9)
    # 線床：一片四邊形，對應框內緣（半寬 FW−0.0045、半長 FL−0.0045）
    st = Mesh(name + '_strings', M['strings']); iw, il = FW - 0.0045, FL - 0.0045
    uvl = st.bm.loops.layers.uv.new('UVMap'); vs = [st.bm.verts.new(g2b(x, cy + y, 0)) for (x, y) in ((-iw, -il), (iw, -il), (iw, il), (-iw, il))]
    f = st.bm.faces.new(vs)
    for lp, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uvl].uv = uv
    st.finish(g, uv=False)
    return g


racket('badminton_racket', M['frameA'], M['grip'])
racket('badminton_racket_b', M['frameB'], M['gripB'], accent=M['accentB'])

# ---------------- 羽球 ----------------
sg = B.group('badminton_shuttle', parent=root, props={'kind': 'badminton_shuttle'})
ck = Mesh('shuttle_cork', M['cork']); bmk = L.lathe([(0.0, 0.0), (0.0058, 0.0012), (0.0098, 0.0048), (0.0122, 0.0098), (0.0128, 0.0145), (0.0128, 0.0245), (0.0, 0.0245)], seg=16)
ck.add_bm(bmk); bmk.free(); o5 = ck.finish(sg, uv=False); L.smooth_mesh(o5, angle=1.0)
fe = Mesh('shuttle_skirt', M['feather']); uvl = fe.bm.loops.layers.uv.new('UVMap'); SEG = 32; y0, y1, r0, r1 = 0.0235, 0.087, 0.0118, 0.033
ring0 = [fe.bm.verts.new(g2b(r0 * math.cos(2 * math.pi * i / SEG), y0, r0 * math.sin(2 * math.pi * i / SEG))) for i in range(SEG)]
ring1 = [fe.bm.verts.new(g2b(r1 * math.cos(2 * math.pi * i / SEG), y1, r1 * math.sin(2 * math.pi * i / SEG))) for i in range(SEG)]
for i in range(SEG):
    j = (i + 1) % SEG; f = fe.bm.faces.new((ring0[i], ring0[j], ring1[j], ring1[i])); u0, u1 = i / SEG, (i + 1) / SEG
    for lp, uv in zip(f.loops, ((u0, 0), (u1, 0), (u1, 1), (u0, 1))): lp[uvl].uv = uv
o6 = fe.finish(sg, uv=False, merge=False); L.smooth_mesh(o6, angle=1.2)
th = Mesh('shuttle_thread', M['thread'])
for (y, r) in ((0.0345, 0.0154), (0.0505, 0.0207)):
    th.cyl((0, y - 0.0012, 0), (0, y + 0.0012, 0), r, seg=16, caps=False)
th.finish(sg, uv=False)

# ---------------- 球網 ----------------
ng = B.group('badminton_net', parent=root, props={'kind': 'badminton_net'})
nm = Mesh('net_mesh', M['net']); uvl = nm.bm.loops.layers.uv.new('UVMap'); HW = 3.05; NT, NB = 1.524 - 0.075, 0.79
# 中間低一點（1.524 vs 1.55）：分 12 段，上緣照拋物線
segs = 12; top = lambda x: (1.55 - 0.026 * (1 - (x / HW) ** 2)) - 0.075
cols = [-HW + 2 * HW * i / segs for i in range(segs + 1)]
vt = [nm.bm.verts.new(g2b(x, top(x), 0)) for x in cols]; vb = [nm.bm.verts.new(g2b(x, NB, 0)) for x in cols]
for i in range(segs):
    f = nm.bm.faces.new((vb[i], vb[i + 1], vt[i + 1], vt[i]))
    for lp, (x, y) in zip(f.loops, ((cols[i], NB), (cols[i + 1], NB), (cols[i + 1], top(cols[i + 1])), (cols[i], top(cols[i])))): lp[uvl].uv = (x / 0.2, y / 0.2)
nm.finish(ng, uv=False, merge=False)
tp = Mesh('net_tape', M['tape'])
for i in range(segs):
    xa, xb = cols[i], cols[i + 1]; ya, yb = top(xa), top(xb)
    tp.quad([(xa, ya, -0.004), (xb, yb, -0.004), (xb, yb + 0.075, -0.004), (xa, ya + 0.075, -0.004)]).quad([(xb, yb, 0.004), (xa, ya, 0.004), (xa, ya + 0.075, 0.004), (xb, yb + 0.075, 0.004)])
    tp.quad([(xa, ya + 0.075, -0.004), (xb, yb + 0.075, -0.004), (xb, yb + 0.075, 0.004), (xa, ya + 0.075, 0.004)])
tp.box(-HW, HW, NB - 0.012, NB, -0.003, 0.003)   # 下緣的繩
tp.finish(ng, uv=False)
po = Mesh('net_post', M['post']); ba = Mesh('net_post_base', M['base'])
for sx in (-1, 1):
    x = sx * 3.1; po.cyl((x, 0.06, 0), (x, 1.55, 0), 0.02, seg=12); po.cyl((x, 1.55, 0), (x, 1.565, 0), 0.023, seg=12)
    bmb = L.lathe([(0.0, 0.0), (0.13, 0.0), (0.135, 0.02), (0.11, 0.06), (0.03, 0.07), (0.0, 0.07)], seg=20); ba.add_bm(bmb, Matrix.Translation(g2b(x, 0, 0))); bmb.free()
o7 = po.finish(ng, uv=False); L.smooth_mesh(o7, angle=1.0); o8 = ba.finish(ng, uv=False); L.smooth_mesh(o8, angle=1.0)

st = L.export(OUT, gpu_instances=False)
L.write_json(os.path.splitext(OUT)[0] + '.json', st)
