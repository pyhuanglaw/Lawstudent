"""教學館的家具模組（LAWWW 2026-10-13 18:05Z 分派）：自習雙人桌、自習椅、圓桌、講堂椅（＋排尾側板、前排桌板、遠處用的簡化講堂椅）→ GLB，給遊戲用 InstancedMesh 放。
  /opt/blenv/bin/python tools/blender/env_second/furniture_study.py [-- --out 輸出.glb]

約定（照 LAWWW）：
  - 一件家具＝一個網格、一個材質（共用一張 1024 貼圖集：淺色橡木、深色胡桃木、深灰金屬、深藍布面、白色塑膠），所以每一種家具在遊戲裡是一次 draw call（InstancedMesh）。
  - 原點在地面中心、+z 朝前（椅子：坐的人面向 +z；桌子：+z 是長邊的一側）、地面 y=0、公尺。
  - 尺寸表寫在 GLB 旁邊的 .json（`modules`），也寫在 docs/art-rebuild/second_ai/VISUAL_REVIEW.md 第 23 節。
貼圖集 tools/blender/env_second/textures/gen/study_furn_atlas.png：本作程式產生（木紋來自 Poly Haven walnut_veneer CC0 改色；金屬、布面、塑膠是程式畫的雜訊）。
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, g2b, bpy, bmesh   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/furniture_study.glb'
ATLAS = os.path.join(HERE, 'textures', 'gen', 'study_furn_atlas.png')
N = 1024
# 貼圖集的區域（u0, v0, u1, v1；v 往上）：一個區域代表 1 m × 1 m（比 1 m 長的面不會出現在家具上）
REG = {'oak': (0.0, 0.5, 0.5, 1.0), 'walnut': (0.5, 0.5, 1.0, 1.0), 'metal': (0.0, 0.0, 0.5, 0.5), 'fabric': (0.5, 0.125, 1.0, 0.5), 'plastic': (0.5, 0.0, 1.0, 0.125)}


def make_atlas():
    src = Image.open(os.path.join(HERE, 'textures', 'walnut_veneer', 'walnut_veneer_diff_1k.jpg')).convert('RGB').resize((512, 512), Image.LANCZOS)
    a = np.asarray(src, dtype=np.float32) / 255.0

    def recolor(arr, target, contrast):
        g = arr.mean(axis=2, keepdims=True); arr = g + (arr - g) * 0.5
        arr = (arr - arr.mean(axis=(0, 1))) * contrast + np.array(target)
        return np.clip(arr, 0, 1)
    oak = recolor(a, (0.80, 0.66, 0.47), 1.1)            # 淺色橡木（桌面、椅面）
    wal = recolor(a, (0.42, 0.29, 0.19), 1.2)            # 胡桃木（講堂椅的桌板、扶手、椅背殼）
    rng = np.random.default_rng(5)
    met = np.full((512, 512, 3), (0.24, 0.25, 0.27), np.float32) + (rng.normal(0, 1, (512, 1, 1)) * 0.012).astype(np.float32)   # 深灰金屬（細的橫向髮絲紋）
    met = np.clip(met + rng.normal(0, 0.008, (512, 512, 1)).astype(np.float32), 0, 1)
    y, x = np.mgrid[0:384, 0:512].astype(np.float32)
    weave = 0.5 + 0.5 * np.sin(x * 1.6) * np.sin(y * 1.6)                                     # 布面的織紋
    fab = np.stack([0.17 + 0.02 * weave, 0.22 + 0.02 * weave, 0.33 + 0.03 * weave], axis=2) + rng.normal(0, 0.012, (384, 512, 1))
    pla = np.full((128, 512, 3), (0.90, 0.89, 0.87), np.float32) + rng.normal(0, 0.006, (128, 512, 1))
    img = np.zeros((N, N, 3), np.float32)
    img[0:512, 0:512] = oak; img[0:512, 512:1024] = wal          # 圖片上半＝v 0.5–1.0
    img[512:1024, 0:512] = met
    img[512:896, 512:1024] = np.clip(fab, 0, 1)                   # v 0.125–0.5
    img[896:1024, 512:1024] = np.clip(pla, 0, 1)                  # v 0–0.125
    os.makedirs(os.path.dirname(ATLAS), exist_ok=True)
    Image.fromarray((img * 255).astype(np.uint8)).save(ATLAS)


class AM:
    """一件家具的網格（遊戲座標）：每個面指定貼圖集的區域，UV 照面的實際尺寸（1 個區域＝1 m）"""
    def __init__(self, name):
        self.name = name; self.bm = bmesh.new(); self.uv = self.bm.loops.layers.uv.new('UVMap')

    def quad(self, pts, reg, grain_v=True):
        r = REG[reg]; p = [np.array(q, dtype=float) for q in pts]
        e1 = p[1] - p[0]; e2 = p[3] - p[0]; l1 = np.linalg.norm(e1); l2 = np.linalg.norm(e2)
        uvl = [(0, 0), (l1, 0), (l1, l2), (0, l2)] if not grain_v else [(0, 0), (0, l1), (l2, l1), (l2, 0)]
        span = max(1e-6, max(max(u for u, v in uvl), max(v for u, v in uvl)))
        k = min(1.0, 0.94 / span)      # 比區域大的面縮小放進去（家具最大的面 1 m）
        f = self.bm.faces.new([self.bm.verts.new(g2b(*q)) for q in pts])
        for lp, (u, v) in zip(f.loops, uvl):
            lp[self.uv].uv = (r[0] + (0.03 + u * k) * (r[2] - r[0]), r[1] + (0.03 + v * k) * (r[3] - r[1]))
        return f

    def box(self, x0, x1, y0, y1, z0, z1, reg, side=None, skip=()):
        side = side or reg
        F = {'top': ([(x0, y1, z0), (x0, y1, z1), (x1, y1, z1), (x1, y1, z0)], reg), 'bottom': ([(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], reg),
             'front': ([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], side), 'back': ([(x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0)], side),
             'left': ([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], side), 'right': ([(x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1)], side)}
        for k, (pts, rg) in F.items():
            if k not in skip: self.quad(pts, rg, grain_v=(k not in ('top', 'bottom')))

    def tbox(self, pts8, reg):
        """斜的方塊：8 個角（下面 4 個逆時針、上面 4 個）"""
        b0, b1, b2, b3, t0, t1, t2, t3 = pts8
        for q in ((b0, b3, b2, b1), (t0, t1, t2, t3), (b0, b1, t1, t0), (b1, b2, t2, t1), (b2, b3, t3, t2), (b3, b0, t0, t3)): self.quad(q, reg)

    def cyl(self, cx, cz, r0, r1, y0, y1, reg, n=16, caps=True, cap_reg=None):
        pts = lambda r, y: [(cx + r * math.cos(2 * math.pi * k / n), y, cz + r * math.sin(2 * math.pi * k / n)) for k in range(n)]
        lo, hi = pts(r0, y0), pts(r1, y1)
        for k in range(n):
            j = (k + 1) % n; self.quad([lo[j], lo[k], hi[k], hi[j]], reg)
        if caps:
            cr = REG[cap_reg or reg]
            for ring, up in ((hi, True), (lo, False)):
                vs = [self.bm.verts.new(g2b(*q)) for q in (ring if up else ring[::-1])]
                f = self.bm.faces.new(vs)
                for lp, q in zip(f.loops, (ring if up else ring[::-1])):
                    u = 0.5 + (q[0] - cx) / max(2 * r1, 1e-6) * 0.94; v = 0.5 + (q[2] - cz) / max(2 * r1, 1e-6) * 0.94
                    lp[self.uv].uv = (cr[0] + u * (cr[2] - cr[0]), cr[1] + v * (cr[3] - cr[1]))

    def finish(self, root, mat, props):
        bmesh.ops.remove_doubles(self.bm, verts=self.bm.verts, dist=1e-6); self.bm.normal_update()
        bmesh.ops.recalc_face_normals(self.bm, faces=self.bm.faces)
        me = bpy.data.meshes.new(self.name); self.bm.to_mesh(me); self.bm.free(); me.materials.append(mat)
        ob = bpy.data.objects.new(self.name, me); B.scene().collection.objects.link(ob); ob.parent = root
        for k, v in props.items(): ob[k] = v
        return ob


def legs4(m, xs, zs, y0, y1, t=0.03):
    for x in xs:
        for z in zs: m.box(x - t / 2, x + t / 2, y0, y1, z - t / 2, z + t / 2, 'metal', skip=('bottom',))


def study_table2():
    m = AM('study_table2'); W, D, H = 0.9, 0.6, 0.75
    m.box(-W / 2, W / 2, H - 0.025, H, -D / 2, D / 2, 'oak', side='walnut')                     # 桌面（橡木、深色封邊）
    legs4(m, (-W / 2 + 0.04, W / 2 - 0.04), (-D / 2 + 0.04, D / 2 - 0.04), 0.0, H - 0.025)
    for z in (-D / 2 + 0.04, D / 2 - 0.04): m.box(-W / 2 + 0.04, W / 2 - 0.04, H - 0.085, H - 0.055, z - 0.012, z + 0.012, 'metal')   # 橫撐
    for x in (-W / 2 + 0.04, W / 2 - 0.04): m.box(x - 0.012, x + 0.012, H - 0.085, H - 0.055, -D / 2 + 0.04, D / 2 - 0.04, 'metal')
    m.box(-0.07, 0.07, H, H + 0.035, -0.045, 0.045, 'plastic')                                    # 桌面中間的插座盒（兩邊各一個插座）
    for z in (-0.046, 0.046): m.quad([(-0.03, H + 0.008, z), (0.03, H + 0.008, z), (0.03, H + 0.028, z), (-0.03, H + 0.028, z)][::(1 if z > 0 else -1)], 'metal')
    return m, {'size': [W, H, D], 'seats': [{'x': 0, 'y': 0.45, 'z': 0.65, 'yaw': math.pi, 'note': '+z 那一側的椅子（面向 −z）'}, {'x': 0, 'y': 0.45, 'z': -0.65, 'yaw': 0, 'note': '−z 那一側的椅子（面向 +z）'}],
               'nav': '桌子 0.9×0.6；兩張椅子各 0.46×0.46（中心 z=±0.65）', 'tris': None}


def study_chair():
    m = AM('study_chair'); SH = 0.45
    for x in (-0.2, 0.2):
        m.box(x - 0.012, x + 0.012, 0.0, SH - 0.02, 0.17, 0.194, 'metal', skip=('bottom',))            # 前腳
        m.tbox([(x - 0.012, 0.0, -0.215), (x + 0.012, 0.0, -0.215), (x + 0.012, 0.0, -0.191), (x - 0.012, 0.0, -0.191),
                (x - 0.012, 0.86, -0.245), (x + 0.012, 0.86, -0.245), (x + 0.012, 0.86, -0.221), (x - 0.012, 0.86, -0.221)], 'metal')   # 後腳一路到椅背（往後斜）
    for z in (0.18, -0.2): m.box(-0.2, 0.2, SH - 0.06, SH - 0.035, z - 0.01, z + 0.01, 'metal')
    m.box(-0.225, 0.225, SH - 0.02, SH, -0.215, 0.215, 'oak', side='walnut')                     # 椅面（夾板）
    m.tbox([(-0.215, 0.56, -0.212), (0.215, 0.56, -0.212), (0.215, 0.56, -0.194), (-0.215, 0.56, -0.194),
            (-0.215, 0.84, -0.245), (0.215, 0.84, -0.245), (0.215, 0.84, -0.227), (-0.215, 0.84, -0.227)], 'oak')   # 椅背（往後斜約 7°）
    return m, {'size': [0.45, 0.86, 0.46], 'seat': {'x': 0, 'y': SH, 'z': 0.0, 'yaw': 0}, 'nav': '0.46×0.46', 'tris': None}


def round_table():
    m = AM('round_table'); R, H = 0.5, 0.75
    m.cyl(0, 0, R, R, H - 0.03, H, 'walnut', n=28, caps=True, cap_reg='oak')
    m.cyl(0, 0, 0.04, 0.04, 0.03, H - 0.03, 'metal', n=10, caps=False)
    m.cyl(0, 0, 0.26, 0.24, 0.0, 0.03, 'metal', n=20, caps=True)
    return m, {'size': [1.0, H, 1.0], 'seats': [{'x': round(0.85 * math.sin(a), 3), 'y': 0.45, 'z': round(0.85 * math.cos(a), 3), 'yaw': round(a + math.pi, 4)} for a in (math.pi / 4, 3 * math.pi / 4, 5 * math.pi / 4, 7 * math.pi / 4)],
               'nav': '圓：半徑 0.5（＋椅子 4 張，中心離桌心 0.85）', 'tris': None}


def lecture_seat(lod=0):
    """講堂椅（固定式、座墊放下的樣子）：寬 0.52（座位間距）；右側一片側板（左邊那一片是隔壁座位的；排尾另外放 lecture_standard）"""
    m = AM('lecture_seat' if lod == 0 else 'lecture_seat_lod1'); SH = 0.47
    if lod == 0:
        m.box(0.245, 0.26, 0.0, 0.66, -0.26, 0.26, 'walnut', side='walnut')                       # 右側板（胡桃木）
        m.box(0.235, 0.27, 0.66, 0.69, -0.18, 0.30, 'walnut')                                       # 扶手
        m.box(-0.235, 0.235, SH - 0.08, SH - 0.06, -0.17, 0.24, 'metal')                            # 座墊底盤
        m.tbox([(-0.235, SH - 0.06, -0.17), (0.235, SH - 0.06, -0.17), (0.235, SH - 0.06, 0.24), (-0.235, SH - 0.06, 0.24),
                (-0.23, SH, -0.17), (0.23, SH, -0.17), (0.23, SH + 0.01, 0.235), (-0.23, SH + 0.01, 0.235)], 'fabric')     # 座墊（布面，前緣微微翹）
        m.tbox([(-0.235, SH + 0.02, -0.25), (0.235, SH + 0.02, -0.25), (0.235, SH + 0.02, -0.17), (-0.235, SH + 0.02, -0.17),
                (-0.235, 0.98, -0.33), (0.235, 0.98, -0.33), (0.235, 0.98, -0.25), (-0.235, 0.98, -0.25)], 'fabric')      # 椅背（布面，往後斜約 9°）
        m.tbox([(-0.24, SH + 0.02, -0.27), (0.24, SH + 0.02, -0.27), (0.24, SH + 0.02, -0.25), (-0.24, SH + 0.02, -0.25),
                (-0.24, 1.0, -0.35), (0.24, 1.0, -0.35), (0.24, 1.0, -0.33), (-0.24, 1.0, -0.33)], 'walnut')            # 椅背後面的木殼
        m.box(-0.03, 0.03, 0.0, SH - 0.08, -0.06, 0.0, 'metal', skip=('bottom',))                  # 中間的支撐
    else:
        m.box(0.245, 0.26, 0.0, 0.69, -0.26, 0.28, 'walnut', skip=('bottom', 'left'))
        m.box(-0.235, 0.235, SH - 0.06, SH, -0.17, 0.24, 'fabric', skip=('bottom',))
        m.tbox([(-0.235, SH, -0.27), (0.235, SH, -0.27), (0.235, SH, -0.17), (-0.235, SH, -0.17),
                (-0.235, 0.99, -0.35), (0.235, 0.99, -0.35), (0.235, 0.99, -0.25), (-0.235, 0.99, -0.25)], 'fabric')
    return m, {'size': [0.52, 1.0, 0.6], 'pitch': 0.52, 'seat': {'x': 0, 'y': SH, 'z': 0.03, 'yaw': 0}, 'nav': '整排不能走（從走道側身進去）', 'tris': None}


def lecture_standard():
    m = AM('lecture_standard')
    m.box(-0.0075, 0.0075, 0.0, 0.66, -0.26, 0.26, 'walnut'); m.box(-0.0175, 0.0175, 0.66, 0.69, -0.18, 0.30, 'walnut')
    return m, {'size': [0.035, 0.69, 0.56], 'note': '排尾（最左邊座位的左邊）的側板＋扶手：放在 x＝座位中心 −0.2525', 'tris': None}


def lecture_desk():
    """前方的連續桌板（一段＝一個座位寬 0.52）：放在座位原點的 +z 0.36–0.70（排距 1.0 m 時，桌板前緣離下一排椅背 4 cm）"""
    m = AM('lecture_desk')
    m.box(-0.26, 0.26, 0.72, 0.75, 0.36, 0.70, 'walnut', side='walnut')
    m.box(-0.26, 0.26, 0.30, 0.72, 0.68, 0.70, 'walnut', skip=('top', 'bottom'))                     # 前面的擋板（不碰到下一排的台階）
    m.box(-0.012, 0.012, 0.30, 0.72, 0.62, 0.68, 'metal', skip=('top', 'bottom'))                    # 托架
    return m, {'size': [0.52, 0.75, 0.34], 'offset': '和講堂椅同一個 x；z＝座位原點（桌板在 z 0.36–0.70）', 'tris': None}


def build():
    make_atlas()
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=1024)
    root = B.group('furniture_study', props={'kind': 'furniture_study'})
    mat = bpy.data.materials.new('study_furn'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS); tx.image.pack()
    nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color']); bsdf.inputs['Roughness'].default_value = 0.62; mat.use_backface_culling = True
    mods = {}
    for fn in (study_table2, study_chair, round_table, lecture_seat, lambda: lecture_seat(1), lecture_standard, lecture_desk):
        m, info = fn()
        ob = m.finish(root, mat, {'module': m.name})
        info['tris'] = sum(len(p.vertices) - 2 for p in ob.data.polygons)
        mods[m.name] = info
    # 檢視用：把每一件排開（只改物件的位置，網格的原點不變；遊戲端拿網格用，不管這個位置）
    for i, ob in enumerate([o for o in root.children]):
        ob.location = g2b(i * 1.3 - 4.0, 0, 0)
    info = L.export(out, gpu_instances=False)
    info['modules'] = mods
    info['atlas'] = os.path.relpath(ATLAS, L.ROOT)
    info['note'] = '每件家具一個網格、一個材質（study_furn，共用貼圖集）；原點在地面中心、+z 朝前；GLB 裡的物件位置只是排開給人看，遊戲端用網格本身'
    L.write_json(out[:-4] + '.json', info)
    print(json.dumps(mods, ensure_ascii=False))
    return info


if __name__ == '__main__':
    build()
