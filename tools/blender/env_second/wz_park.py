"""溫州街的小公園（溫州公園）：草地、鋪面步道與圓形小廣場、花崗石路緣、大樹的樹穴與樹圍座椅、單槓、公園名牌、後面的水泥圍牆 → 一個 GLB（溫州街區域的世界座標）。
第二 AI 工作階段（環境美術）製作：
  /opt/blenv/bin/python tools/blender/env_second/wz_park.py [-- --out assets/models/env/second_ai/wz_park.glb]

取代 src/zones3d.js buildWenzhou 小公園（A 側 x 20–32）裡的套件外觀：草地、步道與圓形廣場的貼圖鋪面、路緣、樹圍座椅、單槓、「溫州公園」牌子。
樹、灌木、公園路燈、長椅、盆栽、長椅上的貓、所有導航阻擋與互動點（坐在大樹下的圓椅、長椅）都在遊戲程式裡，不變；
樹圍座椅的高度和套件一樣（座面 0.47 m），坐下的位置不用改。
"""
import math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
import cafe_layout as CL   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from cafe_layout import uv01   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/wz_park.glb'))

random.seed(2026)
B.reset(texres=512)
root = B.group('wz_park', props={'kind': 'wz_park'})
base = CL.materials()
M = {
    'grass': L.pbr('park_grass', 'leafy_grass', tile=2.4, target='#71804a', normal=0.6, maps=('diff', 'nor'), rough_value=0.95),
    'paver': L.pbr('park_paver', 'square_brick_paving', tile=1.4, target='#ada290', maps=('diff',), rough_value=0.85),
    'granite': L.pbr('park_granite', 'concrete_wall_006', tile=1.0, target='#c3bdb2', maps=('diff',), res=256, rough_value=0.7),
    'soil': L.flat('park_soil', '#4a3b2e', rough=0.95),
    'wood': L.pbr('park_bench_wood', 'dark_wood', tile=0.8, target='#8c6a48', maps=('diff',), res=256, rough_value=0.7),
    'steel': L.flat('park_steel', '#3e4246', rough=0.45, metal=0.45),
    'green': L.flat('park_bar_green', '#3f7a5a', rough=0.45, metal=0.2), 'yellow': L.flat('park_bar_yellow', '#e2b934', rough=0.45),
    'board': base['board'],
    'wall': L.pbr('park_wall', 'concrete_wall_006', tile=2.0, target='#b5afa4', normal=0.8, maps=('diff', 'nor'), rough_value=0.9),
}
_acc = {}
def acc(key):
    mat = M[key]
    if mat.name not in _acc: _acc[mat.name] = Mesh('park_' + key, mat)
    return _acc[mat.name]


def disc(m, cx, cz, r, y, n=32, r0=0.0):
    """水平的圓（或環：r0>0），朝上"""
    bm = m.bm; vs = []
    if r0 <= 0:
        c = bm.verts.new(g2b(cx, y, cz)); ring = [bm.verts.new(g2b(cx + math.cos(2 * math.pi * i / n) * r, y, cz - math.sin(2 * math.pi * i / n) * r)) for i in range(n)]
        for i in range(n): bm.faces.new((c, ring[i], ring[(i + 1) % n]))
    else:
        a = [bm.verts.new(g2b(cx + math.cos(2 * math.pi * i / n) * r0, y, cz - math.sin(2 * math.pi * i / n) * r0)) for i in range(n)]
        b = [bm.verts.new(g2b(cx + math.cos(2 * math.pi * i / n) * r, y, cz - math.sin(2 * math.pi * i / n) * r)) for i in range(n)]
        for i in range(n): j = (i + 1) % n; bm.faces.new((a[i], b[i], b[j], a[j]))


def ring_wall(m, cx, cz, r0, r1, y0, y1, n=32):
    """立起來的環（樹穴、圓形廣場的路緣）：頂面＋內外側面"""
    disc(m, cx, cz, r1, y1, n, r0)
    bm = m.bm
    for r, out in ((r1, True), (r0, False)):
        lo = [bm.verts.new(g2b(cx + math.cos(2 * math.pi * i / n) * r, y0, cz - math.sin(2 * math.pi * i / n) * r)) for i in range(n)]
        hi = [bm.verts.new(g2b(cx + math.cos(2 * math.pi * i / n) * r, y1, cz - math.sin(2 * math.pi * i / n) * r)) for i in range(n)]
        for i in range(n):
            j = (i + 1) % n; bm.faces.new((lo[i], lo[j], hi[j], hi[i]) if out else (lo[j], lo[i], hi[i], hi[j]))


# ---- 草地（x 20.2–31.8、z 5.0–15.4，和套件相同）、步道（寬 2.2，到圓形廣場）、圓形廣場（大樹 (26,13.2)、半徑 2.75）
acc('grass').box(20.2, 31.8, 0.0, 0.01, 5.0, 15.4)
acc('paver').box(24.9, 27.1, 0.0, 0.022, 5.0, 10.6)
disc(acc('paver'), 26.0, 13.2, 2.75, 0.022, n=40)
gr = acc('granite')
for x0 in (24.78, 27.1): gr.box(x0, x0 + 0.12, 0.0, 0.06, 5.0, 10.62)                         # 步道兩側路緣
ring_wall(gr, 26.0, 13.2, 2.75, 2.87, 0.0, 0.06, n=40)                                     # 圓形廣場的路緣
ring_wall(gr, 26.0, 13.2, 0.72, 0.88, 0.0, 0.14, n=24)                                     # 樹穴（花崗石框）
disc(acc('soil'), 26.0, 13.2, 0.72, 0.05, n=24)

# ---- 樹圍座椅：八角形，每邊 5 條木條（中間有縫）、鋼腳；座面 0.47 m（套件：木條 0.44＋厚 0.06）
wd, st = acc('wood'), acc('steel'); R0, R1, H = 0.98, 1.34, 0.41          # 木條 0.41–0.47
for k in range(8):
    a0, a1 = k / 8 * 2 * math.pi + math.pi / 8, (k + 1) / 8 * 2 * math.pi + math.pi / 8
    for j in range(5):                                                                       # 木條：沿著這一邊的方向
        ra, rb = R0 + (R1 - R0) * j / 5 + 0.012, R0 + (R1 - R0) * (j + 1) / 5 - 0.012
        p = lambda a, r, y: (26.0 + math.sin(a) * r, y, 13.2 + math.cos(a) * r)
        top = [p(a0, ra, H + 0.06), p(a1, ra, H + 0.06), p(a1, rb, H + 0.06), p(a0, rb, H + 0.06)]
        bot = [(q[0], H, q[2]) for q in top]
        bm = wd.bm; vt = [bm.verts.new(g2b(*q)) for q in top]; vb = [bm.verts.new(g2b(*q)) for q in bot]
        bm.faces.new(vt[::-1]); bm.faces.new(vb)
        for i in range(4): bm.faces.new((vb[i], vb[(i + 1) % 4], vt[(i + 1) % 4], vt[i])[::-1])
    am = (a0 + a1) / 2                                                                       # 每邊中間一組鋼腳（內、外兩支＋橫撐）
    for r in (R0 + 0.06, R1 - 0.06):
        x, z = 26.0 + math.sin(am) * r, 13.2 + math.cos(am) * r; st.box(x - 0.025, x + 0.025, 0.0, H, z - 0.025, z + 0.025)
    st.cyl((26.0 + math.sin(am) * (R0 + 0.06), H - 0.04, 13.2 + math.cos(am) * (R0 + 0.06)), (26.0 + math.sin(am) * (R1 - 0.06), H - 0.04, 13.2 + math.cos(am) * (R1 - 0.06)), 0.02, seg=4)

# ---- 單槓（伸展架）：(22.3, 10.4)，兩支綠柱、上橫桿、黃色中桿、水泥底座
for sx in (-0.6, 0.6):
    acc('green').cyl((22.3 + sx, 0.0, 10.4), (22.3 + sx, 1.7, 10.4), 0.05, seg=10); acc('granite').box(22.3 + sx - 0.14, 22.3 + sx + 0.14, 0.0, 0.05, 10.26, 10.54)
    acc('green').sphere((22.3 + sx, 1.71, 10.4), 0.055, seg=8, rings=4)
acc('green').cyl((22.25 - 0.6, 1.62, 10.4), (22.35 + 0.6, 1.62, 10.4), 0.03, seg=8)
acc('yellow').cyl((22.3 - 0.6, 1.1, 10.4), (22.3 + 0.6, 1.1, 10.4), 0.035, seg=8)

# ---- 公園後面的水泥圍牆（可走範圍到 z 14.6，牆在 15.5–15.75：不影響導航）：原本後面是一片空地，從巷子看進公園會看到遠景的地面
cw = acc('wall'); cw.box(20.2, 31.8, 0.0, 2.3, 15.5, 15.75); acc('granite').box(20.15, 31.85, 2.3, 2.38, 15.45, 15.8)
for x in (20.2, 23.1, 26.0, 28.9, 31.8): cw.box(x - 0.15, x + 0.15, 0.0, 2.4, 15.42, 15.82)          # 壁柱

# ---- 公園名牌：兩支木柱＋深綠底的牌子（盆栽後面，朝巷子）
for px in (19.5, 20.9): acc('wood').box(px - 0.05, px + 0.05, 0.0, 1.66, 5.9, 6.0)
acc('wood').box(19.36, 21.04, 1.16, 1.64, 5.94, 6.0)
fm = Mesh('PLATE_FACE_parksign', M['board']); fm.quad([(21.0, 1.2, 5.935), (19.4, 1.2, 5.935), (19.4, 1.6, 5.935), (21.0, 1.6, 5.935)])

for k, m in _acc.items(): m.finish(root, uv=True, smooth=False)
uv01(fm.finish(root, uv=True, props={'plate': 'park', 'text': '溫州公園', 'bg': '#2f4a3a', 'color': '#f4ead8'}))
info = L.export(OUT, gpu_instances=True)
L.write_json(OUT[:-4] + '.json', info)
