"""大步球鞋的室內（新生南路新店；CC 建模子代理 2026-11-03 v1，BB 分派）→ GLB。Blender 5.2（bpy，無介面）：
  nice -n 15 /opt/blenv/bin/python tools/blender/env_second/bb_support/dabu_interior.py -- [--out 路徑] [--lib <env_second 資料夾>] [--gen <暫存資料夾>]
參考圖：使用者 11-03 生成的室內（dabu_int）、外觀（dabu_ext：櫥窗在西、玻璃門在東）。企劃：AA_620 第 1、2 節、3-1。
配置（家具位置、大小、座位、導航阻擋）只寫在 src/data/dabu_layout.js，這裡讀同一份。座標＝遊戲區域座標（room()：中心在原點、x 往東、z 往南、店門在 +z）。
共用工具：lib2、cafe_layout 一律用 claude/second-ai-env-art 那一份（--lib；預設是 CC 工作區的 wt_l2，找不到才用這個 repo 的 tools/blender/env_second）。
會淡出的牆：WALL_<front|back|left|right>_*（自訂屬性 dir）；鞋牆、層架、燈箱、襪子架、鞋盒牆、櫥窗展示架都在那一面牆的組裡。
必改（D77、D112）：鞋子沒有任何像真實品牌的標誌（側面只有虛構的色塊）；店名板只有木板（PLATE_FACE_dabu_name，字由遊戲畫、沒有勾勾線條）；
地板是中間偏淺的木地板；燈箱是抽象的運動色塊（沒有真人）。
鞋子：五種輪廓（籃球高筒、籃球中筒、跑鞋、休閒鞋、復古低筒），每雙有鞋底、中底、鞋面、鞋帶、鞋舌；每種四個配色＝20 個網格，用 instancing 擺滿鞋牆。"""
import json, math, os, random, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
_LIB_CAND = [arg('--lib'), os.environ.get('DABU_LIB2'),
             '/tmp/claude-0/-home-user-Lawstudent/d06332e2-ec70-5e42-a15c-5a4b27dbdb56/scratchpad/wt_l2/tools/blender/env_second',
             os.path.dirname(HERE)]
LIBDIR = next(p for p in _LIB_CAND if p and os.path.exists(os.path.join(p, 'lib2.py')))
sys.path.insert(0, LIBDIR)
import lib2 as L   # noqa: E402
import cafe_layout as CL   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
import numpy as np   # noqa: E402
from PIL import Image, ImageDraw, ImageFilter   # noqa: E402

LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./src/data/dabu_layout.js')))"], cwd=REPO))
OUT = os.path.abspath(arg('--out', os.path.join(REPO, LAY['glb'])))
GEN = arg('--gen') or tempfile.mkdtemp(prefix='dabu_gen_'); os.makedirs(GEN, exist_ok=True)
W, D, H = LAY['w'], LAY['d'], LAY['h']
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
WT = 0.12                      # 牆厚（內面在 X0+WT…）
random.seed(620)
B.reset(texres=512)
print(json.dumps({'lib2': LIBDIR, 'L.ROOT': L.ROOT, 'out': OUT}, ensure_ascii=False))
root = B.group('dabu_interior', props={'kind': 'dabu_interior', 'w': W, 'd': D, 'h': H, 'layout': LAY['version']})


# ---------------- 程式產生的圖：燈箱（抽象運動色塊）、圖面貼圖集（地毯、鏡子、螢幕） ----------------
def _grad(w, h, top, bot):
    t = np.linspace(0, 1, h)[:, None, None]; a = np.array(top, np.float32); b = np.array(bot, np.float32)
    return np.broadcast_to(a * (1 - t) + b * t, (h, w, 3)).copy()


def gen_lightbox(path):
    """8 格（2 欄 × 4 列，每格 512×256）：0、1 籃球（橘色球場的線條）、2 跑道、3 城市黃昏的色塊、4 復古幾何、5 水藍波浪、6 薄荷色塊、7 夕陽弧線。沒有人物、沒有字、沒有標誌"""
    im = Image.new('RGB', (1024, 1024)); cw, ch = 512, 256
    def panel(k):
        w, h = cw, ch
        if k in (0, 1):   # 籃球：深藍黃昏＋橘色木地板＋白色場線（三分線弧、罰球圈、中線）
            a = _grad(w, h, (38, 52, 92) if k == 0 else (60, 44, 88), (232, 140, 78)); p = Image.fromarray(a.astype(np.uint8)); d = ImageDraw.Draw(p)
            d.polygon([(0, h * 0.58), (w, h * 0.5), (w, h), (0, h)], fill=(214, 128, 62))
            for j in range(9): x = j * w / 8; d.line([(x, h * 0.58 - j * h * 0.01), (x - 40, h)], fill=(196, 112, 52), width=2)
            cx = w * (0.36 if k == 0 else 0.62)
            d.arc([cx - 170, h * 0.42, cx + 170, h * 1.25], 180, 360, fill=(250, 244, 232), width=5)
            d.ellipse([cx - 52, h * 0.62, cx + 52, h * 0.86], outline=(250, 244, 232), width=4)
            d.ellipse([w * 0.78 - 34, h * 0.12, w * 0.78 + 34, h * 0.12 + 68], fill=(238, 120, 48)); d.arc([w * 0.78 - 34, h * 0.12, w * 0.78 + 34, h * 0.12 + 68], 0, 360, fill=(70, 34, 20), width=3)
            d.line([(w * 0.78, h * 0.12), (w * 0.78, h * 0.12 + 68)], fill=(70, 34, 20), width=3)
            d.rectangle([w * 0.06, h * 0.12, w * 0.24, h * 0.16], fill=(250, 214, 120))
        elif k == 2:      # 跑道：紅土色跑道＋白色分道線（透視）＋淡藍天空
            a = _grad(w, h, (156, 196, 226), (250, 226, 196)); p = Image.fromarray(a.astype(np.uint8)); d = ImageDraw.Draw(p)
            d.polygon([(0, h * 0.55), (w, h * 0.45), (w, h), (0, h)], fill=(196, 92, 70))
            for j in range(7): d.line([(w * 0.1 + j * 60, h), (w * 0.62 + j * 22, h * 0.48)], fill=(248, 240, 232), width=3)
            d.rectangle([w * 0.0, h * 0.38, w * 1.0, h * 0.46], fill=(110, 150, 110))
        elif k == 3:      # 城市黃昏：漸層＋大樓剪影色塊
            a = _grad(w, h, (250, 186, 140), (120, 92, 140)); p = Image.fromarray(a.astype(np.uint8)); d = ImageDraw.Draw(p)
            rnd = random.Random(3); x = 0
            while x < w:
                bw = rnd.randint(30, 70); bh = rnd.randint(50, 150); d.rectangle([x, h - bh, x + bw - 4, h], fill=(86, 70, 104)); x += bw
            d.ellipse([w * 0.7, h * 0.18, w * 0.7 + 60, h * 0.18 + 60], fill=(255, 224, 170))
        elif k == 4:      # 復古幾何：奶油底＋三道斜色帶
            p = Image.new('RGB', (w, h), (240, 226, 200)); d = ImageDraw.Draw(p)
            for j, c in enumerate([(206, 96, 62), (232, 170, 70), (70, 120, 120)]): o = j * 46; d.polygon([(120 + o, h), (220 + o, h), (420 + o, 0), (320 + o, 0)], fill=c)
            d.ellipse([30, 30, 110, 110], outline=(70, 120, 120), width=6)
        elif k == 5:      # 水藍波浪
            a = _grad(w, h, (180, 226, 232), (60, 150, 176)); p = Image.fromarray(a.astype(np.uint8)); d = ImageDraw.Draw(p)
            for j in range(5):
                pts = [(x, h * (0.3 + j * 0.15) + math.sin(x / 40 + j) * 10) for x in range(0, w + 8, 8)]; d.line(pts, fill=(240, 250, 250), width=3)
        elif k == 6:      # 薄荷色塊
            p = Image.new('RGB', (w, h), (214, 236, 222)); d = ImageDraw.Draw(p)
            d.rectangle([40, 40, 220, 216], fill=(150, 200, 176)); d.rectangle([180, 90, 400, 230], fill=(240, 246, 240)); d.rectangle([330, 20, 480, 150], fill=(96, 160, 140))
        else:             # 夕陽弧線
            a = _grad(w, h, (252, 214, 160), (236, 140, 110)); p = Image.fromarray(a.astype(np.uint8)); d = ImageDraw.Draw(p)
            for j in range(4): d.arc([w * 0.2 - j * 40, h * 0.3 - j * 30, w * 0.8 + j * 40, h * 1.6 + j * 30], 180, 360, fill=(255, 246, 230), width=3)
        return p.filter(ImageFilter.GaussianBlur(0.8))
    for k in range(8): im.paste(panel(k), ((k % 2) * cw, (k // 2) * ch))
    im.save(path)


def gen_graphic(path):
    """1024×512：左半（0–512）編織地毯；512–768 落地鏡（柔焦的店內倒影）；768–1024 上半＝收銀螢幕、下半＝刷卡機螢幕"""
    im = Image.new('RGB', (1024, 512), (0, 0, 0)); rnd = np.random.default_rng(7)
    # 地毯：淺麻色、橫向粗紋＋細雜訊、外圈一道深一點的邊
    a = np.full((512, 512, 3), (205, 188, 160), np.float32)
    y = np.arange(512)[:, None]; x = np.arange(512)[None, :]
    a += (np.sin(y / 2.2) * 9)[..., None] + (np.sin(x / 1.7 + y / 9.0) * 4)[..., None] + rnd.normal(0, 5, (512, 512, 1))
    edge = (np.minimum(np.minimum(x, 511 - x), np.minimum(y, 511 - y)) < 18)
    a[edge] *= 0.86
    im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), (0, 0))
    # 鏡子：店內的倒影（暖白牆、木地板、層架燈條的亮線），柔焦
    m = Image.new('RGB', (256, 512), (226, 214, 196)); d = ImageDraw.Draw(m)
    d.rectangle([0, 360, 256, 512], fill=(176, 138, 102))
    d.rectangle([0, 70, 110, 360], fill=(236, 222, 200))
    for j in range(7): d.rectangle([0, 92 + j * 40, 110, 96 + j * 40], fill=(255, 226, 170))
    for j in range(6):
        for k in range(3): d.rectangle([10 + k * 32, 104 + j * 40, 36 + k * 32, 116 + j * 40], fill=(214, 208, 200) if (j + k) % 3 else (150, 140, 136))
    d.rectangle([150, 110, 230, 360], fill=(214, 204, 188)); d.rectangle([140, 330, 240, 372], fill=(140, 136, 132))
    m = m.filter(ImageFilter.GaussianBlur(6.0)); ma = np.asarray(m, np.float32) * 0.92 + np.array((10, 14, 18), np.float32)
    im.paste(Image.fromarray(np.clip(ma, 0, 255).astype(np.uint8)), (512, 0))
    # 收銀螢幕：淺灰介面、幾個色塊（沒有字）
    s = Image.new('RGB', (256, 256), (36, 40, 46)); d = ImageDraw.Draw(s)
    d.rectangle([10, 40, 246, 216], fill=(226, 230, 234)); d.rectangle([10, 40, 246, 64], fill=(64, 120, 170))
    for j in range(5): d.rectangle([20, 76 + j * 24, 150, 90 + j * 24], fill=(180, 188, 196))
    d.rectangle([164, 150, 236, 204], fill=(90, 170, 120))
    im.paste(s, (768, 0))
    c = Image.new('RGB', (256, 256), (20, 22, 26)); d = ImageDraw.Draw(c)
    d.rectangle([24, 24, 232, 140], fill=(60, 110, 150)); d.rectangle([24, 160, 232, 232], fill=(40, 44, 50))
    for j in range(3):
        for k in range(3): d.rectangle([40 + k * 64, 166 + j * 22, 84 + k * 64, 182 + j * 22], fill=(120, 126, 134))
    im.paste(c, (768, 256))
    im.save(path)


LB_PNG, GR_PNG = os.path.join(GEN, 'dabu_lightbox.png'), os.path.join(GEN, 'dabu_graphic.png')
gen_lightbox(LB_PNG); gen_graphic(GR_PNG)


def img_mat(name, fn, rough=0.6, emit=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(fn, check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    m['tile'] = 1.0; return m


# ---------------- 材質（12 個） ----------------
P = 'dabu_'
M = {
    'floor': L.pbr(P + 'floor_oak', 'laminate_floor_02', tile=1.6, target='#bd9a72', normal=0.5, maps=('diff', 'nor'), rough_value=0.5),   # 中間偏淺（D112：不要深色木地板）
    'wood': L.pbr(P + 'oak', 'walnut_veneer', tile=0.9, target='#d6b58b', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.5, sat=0.85),  # 原木（層架、試穿椅、收銀台）
    'paint': L.pbr(P + 'wall_paint', 'painted_plaster_wall', tile=2.0, target='#efe7db', maps=('diff',), res=256, rough_value=0.85),
    'ceil': L.flat(P + 'ceiling', '#ebe7e1', rough=0.9, cull=True),                                                                       # 天花板：單面朝下（剖面視角）
    'fabric': L.pbr(P + 'cushion', 'rough_linen', tile=0.35, target='#8f8a84', normal=0.6, maps=('diff', 'nor'), res=256, rough_value=0.9),  # 灰布軟墊
    'vc': L.vc_material(P + 'vc', rough=0.62),                       # 鞋子、鞋盒、白色層架、毛巾、襪子……（頂點色）
    'vcm': L.vc_metal(P + 'vc_metal', rough=0.38, metal=0.4),        # 鐵網、軌道燈、風管、鋁框
    'glass': L.flat(P + 'glass', '#dfe9ec', rough=0.05, alpha=0.16),
    'led': L.flat(P + 'led', '#fff1d8', rough=0.3, emit=B.srgb('#ffd59a')),
    'lightbox': img_mat(P + 'lightbox', LB_PNG, rough=0.4, emit=0.85),
    'graphic': img_mat(P + 'graphic', GR_PNG, rough=0.35),
    'leaf': CL.leaf_mat(P + 'leaf_pothos', 'pothos_leaf.png'),
}
VC = L.CMesh(P + 'vc_parts', M['vc']); VCM = L.CMesh(P + 'metal_parts', M['vcm'])


def painted(cm, hexcol, fn):
    """fn() 往 cm 加的面全部塗成 hexcol（圓柱、旋轉體、球）"""
    before = set(cm.bm.faces); fn(); cm.paint([f for f in cm.bm.faces if f not in before], hexcol)


class Xf:
    """物件自己的座標（x 右、z 前、y 上；正面朝 +z）→ 區域座標：中心 (px,pz)、轉 ry"""
    def __init__(self, px, pz, ry=0.0): self.px, self.pz, self.c, self.s, self.ry = px, pz, math.cos(ry), math.sin(ry), ry
    def p(self, x, y, z): return (self.px + x * self.c + z * self.s, y, self.pz - x * self.s + z * self.c)
    def M(self, x, y, z): return Matrix.Translation(g2b(*self.p(x, y, z))) @ Matrix.Rotation(self.ry, 4, 'Z')
    def rbox(self, m, x0, x1, y0, y1, z0, z1, r=0.02, seg=2):
        bm = L.rbox_bm(x1 - x0, y1 - y0, z1 - z0, r, seg); m.add_bm(bm, self.M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)); bm.free(); return m
    def crbox(self, cm, x0, x1, y0, y1, z0, z1, col, r=0.02, seg=2):
        painted(cm, col, lambda: self.rbox(cm, x0, x1, y0, y1, z0, z1, r=r, seg=seg)); return cm
    def lathe(self, m, prof, x, y, z, seg=16):
        bm = L.lathe(prof, seg=seg); m.add_bm(bm, self.M(x, y, z)); bm.free(); return m


_acc = {}
def acc(key):
    if key not in _acc: _acc[key] = Mesh(P + key, M[key])
    return _acc[key]


# ---------------- 牆（淡出的組） ----------------
walls = {'front': {}, 'back': {}, 'left': {}, 'right': {}}
DIRS = LAY['wallsFade']
def wm(side, key):
    g = walls[side]
    if key not in g: g[key] = (L.CMesh if key in ('vc', 'vcm') else Mesh)(f'{side}_{key}', M[key])
    return g[key]


def wall_box(side, key, a0, a1, y0, y1, t0=0.0, t1=WT):
    m = wm(side, key)
    if side == 'back': m.box(a0, a1, y0, y1, Z0 + t0, Z0 + t1)
    elif side == 'front': m.box(a0, a1, y0, y1, Z1 - t1, Z1 - t0)
    elif side == 'left': m.box(X0 + t0, X0 + t1, y0, y1, a0, a1)
    else: m.box(X1 - t1, X1 - t0, y0, y1, a0, a1)


UVQ = []   # (side or None, name, mat, pts, uv)
def uv_quad(side, name, mat, pts, uv):
    UVQ.append((side, name, mat, pts, uv))


def finish_uvq():
    groups = {}
    for side, name, mat, pts, uv in UVQ: groups.setdefault((side, name, mat.name), []).append((pts, uv, mat))
    for (side, name, _), lst in groups.items():
        bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap')
        for pts, uv, mat in lst:
            u0, v0, u1, v1 = uv; f = bm.faces.new([bm.verts.new(g2b(*q)) for q in pts])
            for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = t
        nm = (f'WALL_{side}_' if side else P) + name
        me = bpy.data.meshes.new(nm); bm.to_mesh(me); bm.free(); me.materials.append(lst[0][2])
        ob = bpy.data.objects.new(nm, me); B.scene().collection.objects.link(ob); ob.parent = root
        if side: ob['dir'] = DIRS[side]


def face_quad(cx, cy, cz, w, h, normal):
    """牆面上一個朝 normal（'+x' '-x' '+z' '-z'）的四邊形：點的順序＝從正面看 左下、右下、右上、左上"""
    a, b = w / 2, h / 2
    if normal == '+x': return [(cx, cy - b, cz + a), (cx, cy - b, cz - a), (cx, cy + b, cz - a), (cx, cy + b, cz + a)]
    if normal == '-x': return [(cx, cy - b, cz - a), (cx, cy - b, cz + a), (cx, cy + b, cz + a), (cx, cy + b, cz - a)]
    if normal == '+z': return [(cx - a, cy - b, cz), (cx + a, cy - b, cz), (cx + a, cy + b, cz), (cx - a, cy + b, cz)]
    return [(cx + a, cy - b, cz), (cx - a, cy - b, cz), (cx - a, cy + b, cz), (cx + a, cy + b, cz)]


# ---------------- 鞋子：五種輪廓 × 四個配色（instancing 的原型） ----------------
PROF = [(1, 0), (1, .42), (.86, .8), (.42, 1), (-.42, 1), (-.86, .8), (-1, .42), (-1, 0)]
STY = {
    # t：沿鞋長的位置（0＝後跟、1＝鞋頭）；h：鞋面高（中底上面算起）；w：半寬；sole＝(大底厚, 中底頂在後跟, 中底頂在鞋頭)；collar＝鞋口幾段；lace＝鞋帶範圍；acc＝側面色塊的段
    'bb_high': dict(L=0.300, t=[0, .07, .25, .45, .66, .84, 1.0], h=[.150, .168, .158, .104, .078, .058, .026], w=[.021, .041, .045, .047, .050, .046, .017],
                    sole=(.013, .036, .028), spring=.014, collar=2, lace=(.28, .70), acc=(2, 3), ankle=True),
    'bb_mid': dict(L=0.296, t=[0, .07, .25, .45, .66, .84, 1.0], h=[.112, .124, .118, .090, .074, .056, .025], w=[.021, .041, .045, .047, .050, .046, .017],
                   sole=(.012, .034, .027), spring=.014, collar=2, lace=(.28, .70), acc=(2, 3), ankle=True),
    'run': dict(L=0.292, t=[0, .07, .25, .45, .66, .84, 1.0], h=[.078, .084, .064, .070, .058, .043, .015], w=[.020, .039, .042, .044, .046, .039, .012],
                sole=(.009, .042, .022), spring=.024, collar=2, lace=(.30, .68), acc=(1, 2), ankle=False),
    'casual': dict(L=0.290, t=[0, .07, .25, .45, .66, .84, 1.0], h=[.068, .076, .066, .074, .064, .050, .026], w=[.022, .042, .046, .048, .050, .047, .020],
                   sole=(.010, .031, .030), spring=.010, collar=2, lace=(.30, .70), acc=(0, 1), ankle=False),
    'retro': dict(L=0.286, t=[0, .07, .25, .45, .66, .84, 1.0], h=[.058, .066, .056, .061, .051, .040, .016], w=[.020, .037, .040, .042, .043, .036, .012],
                  sole=(.009, .020, .018), spring=.012, collar=2, lace=(.30, .70), acc=(2, 3), ankle=False),
}
#             base       toe        heel       accent     lining     lace       mid        out        tongue
COLS = {
    'bb_high': [('#f2f2ef', '#f2f2ef', '#b3262e', '#b3262e', '#2a2a2c', '#f7f7f5', '#f6f5f1', '#b3262e', '#2a2a2c'),
                ('#2b2d33', '#4c4f56', '#2b2d33', '#a2a8b0', '#c8663a', '#2b2d33', '#f4f3ef', '#2b2d33', '#2b2d33'),
                ('#f4f4f2', '#f4f4f2', '#2f58a6', '#2f58a6', '#1f2f55', '#f7f7f5', '#f6f5f1', '#2f58a6', '#f4f4f2'),
                ('#5b3a8c', '#5b3a8c', '#e3b23c', '#e3b23c', '#2a2a2c', '#f2efe6', '#f6f5f1', '#5b3a8c', '#5b3a8c')],
    'bb_mid': [('#8b9096', '#d8d9db', '#5b5f65', '#e0702e', '#2a2a2c', '#f0f0ee', '#f0f0ee', '#3a3c40', '#8b9096'),
               ('#f3f3f1', '#f3f3f1', '#2e7d4f', '#2e7d4f', '#2a2a2c', '#f7f7f5', '#f6f5f1', '#2e7d4f', '#f3f3f1'),
               ('#1f2a44', '#1f2a44', '#c8c9cc', '#c8c9cc', '#c2412f', '#1f2a44', '#f6f5f1', '#1f2a44', '#c2412f'),
               ('#efe9dd', '#d6cfc2', '#8a3a2e', '#8a3a2e', '#3a2e28', '#efe9dd', '#efe9dd', '#a7703f', '#efe9dd')],
    'run': [('#eef0f3', '#eef0f3', '#ff6b4a', '#ff6b4a', '#c9ccd2', '#ffffff', '#ffffff', '#ff6b4a', '#eef0f3'),
            ('#2d3a5a', '#2d3a5a', '#c8d64a', '#c8d64a', '#1d2538', '#c8d64a', '#f4f4f2', '#2d3a5a', '#2d3a5a'),
            ('#4fb3a9', '#7fcbc3', '#2f6f69', '#ffffff', '#2f6f69', '#ffffff', '#ffffff', '#2f6f69', '#4fb3a9'),
            ('#a9aeb3', '#c9cdd1', '#e98aa0', '#e98aa0', '#5d6166', '#f4f4f2', '#f7f6f2', '#5d6166', '#a9aeb3')],
    'casual': [('#f3efe6', '#f3efe6', '#2f6b4a', '#2f6b4a', '#ddd5c6', '#f3efe6', '#f3efe6', '#e8e2d4', '#f3efe6'),
               ('#f6f6f4', '#f6f6f4', '#c9c9c4', '#c9c9c4', '#e2e2de', '#f6f6f4', '#f6f6f4', '#e6e6e2', '#f6f6f4'),
               ('#c8a274', '#c8a274', '#8a6542', '#f1ece2', '#5a4632', '#f1ece2', '#f1ece2', '#6e5236', '#c8a274'),
               ('#2a2b2e', '#2a2b2e', '#2a2b2e', '#f2f2ef', '#2a2b2e', '#f2f2ef', '#f2f2ef', '#2a2b2e', '#2a2b2e')],
    'retro': [('#9aa09f', '#d9d6cf', '#d9d6cf', '#2d4f7a', '#3a3a3c', '#f0ede6', '#efeae0', '#a7703f', '#9aa09f'),
              ('#2f3b5c', '#efe9dc', '#efe9dc', '#efe9dc', '#2a2a2c', '#efe9dc', '#efe9dc', '#a7703f', '#2f3b5c'),
              ('#f2f0ea', '#5c7a4f', '#5c7a4f', '#5c7a4f', '#3a3a3c', '#f2f0ea', '#f2f0ea', '#a7703f', '#f2f0ea'),
              ('#7a2e36', '#e9e1d0', '#e9e1d0', '#e9e1d0', '#2a2a2c', '#e9e1d0', '#e9e1d0', '#e9e1d0', '#7a2e36')],
}
SHOES = {}   # (style, k) → mesh


def shoe_mesh(style, k):
    st, c = STY[style], COLS[style][k]
    base, toe, heel, accent, lining, lace, mid, out, tongue = c
    cm = L.CMesh(f'{P}shoe_{style}_{k}', M['vc']); bm = cm.bm
    Lg, T, Hs, Ws = st['L'], st['t'], st['h'], st['w']; ot, mh, mt = st['sole']; sp = st['spring']; n = len(T)
    xs = [(t - 0.5) * Lg for t in T]
    yb = lambda t: sp * max(0.0, (t - 0.72) / 0.28) ** 2
    ym = lambda t: yb(t) * 0.75 + mh + (mt - mh) * t
    def nv(x, y, z): return bm.verts.new(g2b(x, y, z))
    def face(vs, col):
        f = bm.faces.new(vs); cm.paint([f], col); return f
    # 鞋底：大底（out）＋中底（mid）三圈，外緣比鞋面寬 5 mm、前後各多出一點
    sel = [0, 1, 3, 5, 6]
    ol = [(xs[0] - 0.007, 0.0, 0.0)] + [(xs[i], Ws[i] + 0.005, T[i]) for i in sel] + [(xs[-1] + 0.008, 0.0, 1.0)] + [(xs[i], -(Ws[i] + 0.005), T[i]) for i in reversed(sel)]
    rings = [[nv(x, f(t), z) for (x, z, t) in ol] for f in (yb, lambda t: yb(t) + ot, ym)]
    m_ = len(ol)
    for lv in range(2):
        for i in range(m_):
            j = (i + 1) % m_; face([rings[lv][i], rings[lv][j], rings[lv + 1][j], rings[lv + 1][i]], out if lv == 0 else mid)
    face(list(reversed(rings[0])), out); face(list(rings[2]), mid)
    # 鞋面：7 個斷面、每個 8 點
    R = []
    for i in range(n):
        w, h, y0 = Ws[i], Hs[i], ym(T[i]) - 0.003
        R.append([nv(xs[i], y0 + yy * h, zz * w) for (zz, yy) in PROF])
    la, lb = st['lace']
    for i in range(n - 1):
        for j in range(8):
            j2 = (j + 1) % 8; col = base
            if j == 7: col = mid
            elif j == 3:
                if i < st['collar']: col = lining
                elif T[i] >= la - 0.01 and T[i + 1] <= lb + 0.06: col = tongue
                else: col = toe
            elif i >= n - 3: col = toe
            elif i == 0: col = heel
            elif i in st['acc'] and j in (1, 5): col = accent          # 側面的虛構色塊（不是任何品牌的標誌）
            elif st['ankle'] and i == 1 and j in (2, 4): col = accent   # 籃球鞋：腳踝的護墊色
            face([R[i][j], R[i][j2], R[i + 1][j2], R[i + 1][j]], col)
    face(list(reversed(R[0])), heel); face(list(R[-1]), toe)
    def top_at(t):
        for i in range(n - 1):
            if T[i] <= t <= T[i + 1]:
                u = (t - T[i]) / (T[i + 1] - T[i]); return ym(t) - 0.003 + Hs[i] * (1 - u) + Hs[i + 1] * u, Ws[i] * (1 - u) + Ws[i + 1] * u
        return ym(t) + Hs[-1], Ws[-1]
    # 鞋舌：鞋口前面翹起來一片（往後傾）
    tt = T[st['collar']] + 0.02; xt = (tt - 0.5) * Lg; yt, wt = top_at(tt)
    q = [(xt - 0.004, yt - 0.012), (xt + 0.010, yt - 0.012), (xt - 0.010, yt + 0.026), (xt - 0.024, yt + 0.022)]
    vs = [nv(x, y, z) for z in (-0.34 * wt, 0.34 * wt) for (x, y) in q]
    for a in ((0, 1, 2, 3), (7, 6, 5, 4), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)): face([vs[i] for i in a], tongue)
    # 鞋帶：兩條橫跨的細條
    for f_ in (0.3, 0.68):
        t = la + (lb - la) * f_; x = (t - 0.5) * Lg; y, w = top_at(t)
        cm.paint(L.bm_box(bm, x - 0.006, x + 0.006, y - 0.002, y + 0.006, -0.5 * w, 0.5 * w), lace)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    ob = cm.finish(None, uv=False, smooth=True); L.smooth_mesh(ob, angle=1.05); me = ob.data; bpy.data.objects.remove(ob); return me


for s_ in STY:
    for k in range(4): SHOES[(s_, k)] = shoe_mesh(s_, k)
CAT = {'basketball_high': 'bb_high', 'basketball_mid': 'bb_mid', 'running': 'run', 'casual': 'casual', 'retro': 'retro'}
SHOE_N = [0]
# instancing 的鞋子掛在每一面牆自己的空節點底下：匯出器把同一個父節點、同一個網格的物件合成一個 EXT_mesh_gpu_instancing 節點，
# 名字＝父節點名＋序號（WALL_left_shoes.3）→ 遊戲 /WALL_/ 認得、牆淡出時一起藏；空節點放在那一面牆的中間（遊戲用網格的中心判斷要不要淡出）。
# 匯出以後 patch_glb() 把 dir 寫進這些節點的 extras（匯出器不會把父節點的自訂屬性給 instancing 節點）。
SHOE_PAR = {}
SHOE_PAR_POS = {'left': (X0 + 0.3, 0.0, -2.6), 'right': (X1 - 0.3, 0.0, -1.4), 'front': (-1.4, 0.0, Z1 - 0.5), None: (0.0, 0.0, 0.0)}


def put_shoe(style, k, x, y, z, ry, side=None):
    SHOE_N[0] += 1
    if side not in SHOE_PAR:
        px, py, pz = SHOE_PAR_POS[side]
        SHOE_PAR[side] = B.group(f'WALL_{side}_shoes' if side else f'{P}shoes', root, {'dir': DIRS[side]} if side else None); SHOE_PAR[side].location = g2b(px, py, pz)
    px, py, pz = SHOE_PAR_POS[side]
    return B.instance(SHOES[(style, k)], f'{P}shoe_{SHOE_N[0]}', x - px, y - py, z - pz, SHOE_PAR[side], ry)


def patch_glb(path):
    """WALL_<side>_shoes.* 的 instancing 節點補上 extras.dir（照 wallsFade）"""
    import struct
    b = open(path, 'rb').read(); jl = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + jl]); rest = b[20 + jl:]; n = 0
    for nd in j['nodes']:
        nm = nd.get('name', '')
        for side in ('left', 'right', 'front', 'back'):
            if nm.startswith(f'WALL_{side}_shoes') and 'mesh' in nd: nd.setdefault('extras', {})['dir'] = DIRS[side]; n += 1
    js = json.dumps(j, ensure_ascii=False, separators=(',', ':')).encode('utf-8'); js += b' ' * ((4 - len(js) % 4) % 4)
    out = b[:12] + struct.pack('<I', len(js)) + b'JSON' + js + rest
    out = out[:8] + struct.pack('<I', len(out)) + out[12:]
    open(path, 'wb').write(out); print(json.dumps({'patch_glb_dir_nodes': n}))


# ---------------- 地板、天花板、牆 ----------------
Mesh(P + 'floor', M['floor']).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(root)
ce = Mesh(P + 'ceiling', M['ceil']); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(root, uv=False)
for side in ('back', 'left', 'right'):
    a0, a1 = (X0, X1) if side == 'back' else (Z0, Z1)
    wall_box(side, 'paint', a0, a1, 0.0, H)
    m = wm(side, 'vc')   # 踢腳板
    if side == 'back': m.cbox(a0, a1, 0.0, 0.08, Z0 + WT, Z0 + WT + 0.015, '#d9d2c6')
    elif side == 'left': m.cbox(X0 + WT, X0 + WT + 0.015, 0.0, 0.08, a0, a1, '#d9d2c6')
    else: m.cbox(X1 - WT - 0.015, X1 - WT, 0.0, 0.08, a0, a1, '#d9d2c6')

# 店面（+z）：西側整面櫥窗、東側兩扇玻璃門（外觀 dabu_ext）
FR = LAY['front']; sill, head = FR['sill'], FR['head']; dx, dw = FR['door']['x'], FR['door']['w']; dh = 2.35
ops = sorted([(a, b, 'win') for a, b in FR['windows']] + [(dx - dw / 2, dx + dw / 2, 'door')])
xs_ = [X0]
for a, b, kk in ops: xs_ += [a, b]
xs_.append(X1)
for i in range(0, len(xs_), 2):
    if xs_[i + 1] - xs_[i] > 1e-3: wall_box('front', 'paint', xs_[i], xs_[i + 1], 0.0, H)
fv = wm('front', 'vcm'); ALU = '#c9ccce'
for a, b, kk in ops:
    top = dh if kk == 'door' else head; y0 = 0.0 if kk == 'door' else sill
    G = 0.0015   # 牆段之間留 1.5 mm：相鄰的方塊共用頂點會被 single_side 當成開口零件補反面（重疊的兩面在 Cycles 變黑）
    wall_box('front', 'paint', a + G, b - G, top, H)
    if kk == 'win': wall_box('front', 'paint', a + G, b - G, 0.0, sill); fv.cbox(a, b, sill - 0.02, sill + 0.04, Z1 - WT - 0.05, Z1 - 0.02, ALU)
    fv.cbox(a, b, top - 0.05, top + 0.02, Z1 - WT - 0.02, Z1 - 0.02, ALU)
    nseg = max(1, round((b - a) / 1.4))
    for j in range(nseg + 1): x = a + j * (b - a) / nseg; fv.cbox(x - 0.03, x + 0.03, y0, top, Z1 - WT - 0.02, Z1 - 0.02, ALU)
    if kk == 'door':
        fv.cbox(a + 0.03, b - 0.03, 0.0, 0.06, Z1 - WT - 0.01, Z1 - 0.03, ALU)
        for hx in (dx - 0.1, dx + 0.1): painted(fv, '#b9bdc0', lambda hx=hx: fv.cyl((hx, 0.75, Z1 - WT - 0.07), (hx, 1.55, Z1 - WT - 0.07), 0.014, seg=8))   # 長門把
    wm('front', 'glass').quad([(b, y0 + 0.02, Z1 - 0.07), (a, y0 + 0.02, Z1 - 0.07), (a, top - 0.03, Z1 - 0.07), (b, top - 0.03, Z1 - 0.07)])

# ---------------- 鞋牆（左牆五格、右牆兩格） ----------------
SHELF_T = [0.60, 0.91, 1.22, 1.53, 1.84, 2.15]
BOXC = [('#f4f3ef', '#e6e4de'), ('#b4b9be', '#a6abb1'), ('#f4f3ef', '#d9d6cf'), ('#c8a77e', '#b89770'), ('#f4f3ef', '#e6e4de'), ('#8d9399', '#7f858b')]
LB_IDX = {'left': [0, 1, 2, 3], 'right': [5, 4]}
WHITE, CREAM = '#f3f1ec', '#f1e8da'
rs = random.Random(77)


def shoe_wall(sw):
    side = sw['side']; sgn = -1 if side == 'left' else 1          # sgn：牆在 −x（左）或 +x（右）
    wx = X0 + WT if side == 'left' else X1 - WT                    # 牆的內面
    fx = wx - sgn * (sw['depth'] - WT)                            # 層架前緣
    z0, z1, nb = sw['z0'], sw['z1'], sw['bays']; bw = (z1 - z0) / nb
    vc, wd, led = wm(side, 'vc'), wm(side, 'wood'), wm(side, 'led')
    lo, hi = min(wx, fx), max(wx, fx)
    # 下櫃（原木抽屜面、內縮踢腳）
    vc.cbox(lo + (0.0 if side == 'left' else 0.05), hi - (0.05 if side == 'left' else 0.0), 0.0, 0.08, z0, z1, '#3a3632')
    for b in range(nb):
        za, zb = z0 + b * bw, z0 + (b + 1) * bw
        for dz in range(2):
            ca, cb = za + 0.03 + dz * (bw - 0.06) / 2, za + 0.03 + (dz + 1) * (bw - 0.06) / 2 - 0.012
            wd.rbox(min(fx, fx + sgn * 0.022), max(fx, fx + sgn * 0.022), 0.09, 0.575, ca, cb, r=0.006, seg=1)
            vc.cbox(min(fx, fx - sgn * 0.012), max(fx, fx - sgn * 0.012), 0.52, 0.53, (ca + cb) / 2 - 0.12, (ca + cb) / 2 + 0.12, '#b9b2a6')   # 把手溝
    vc.cbox(lo + 0.002, hi - 0.002, 0.08, 0.578, z0, z1, '#e9e3d8')                 # 下櫃的身
    wd.rbox(lo - (0.0 if side == 'left' else 0.015), hi + (0.015 if side == 'left' else 0.0), 0.575, 0.60, z0, z1, r=0.006, seg=1)   # 櫃頂板（第一層）
    # 背板（奶油色、上面一點暖光）、隔板（白）、層板（原木）、燈條
    vc.cbox(min(wx, wx - sgn * 0.012), max(wx, wx - sgn * 0.012), 0.6, 2.45, z0, z1, CREAM)
    for b in range(nb + 1):
        z = z0 + b * bw; vc.crbox(lo, hi, 0.0 if b in (0, nb) else 0.6, 3.32, z - 0.025, z + 0.025, WHITE, r=0.006)
    for t in SHELF_T[1:] + [2.47]:
        wd.rbox(lo + 0.01, hi - 0.01, t - 0.025, t, z0, z1, r=0.005, seg=1) if t < 2.4 else vc.crbox(lo, hi, 2.42, 2.47, z0, z1, WHITE, r=0.006)
        led.box(min(fx + sgn * 0.035, fx + sgn * 0.02), max(fx + sgn * 0.035, fx + sgn * 0.02), t - 0.034 if t < 2.4 else 2.408, t - 0.026 if t < 2.4 else 2.42, z0 + 0.03, z1 - 0.03)
    # 燈箱（每一格一個）：白框＋抽象運動色塊
    for b in range(nb):
        za, zb = z0 + b * bw + 0.03, z0 + (b + 1) * bw - 0.03
        vc.cbox(min(wx, wx - sgn * 0.09), max(wx, wx - sgn * 0.09), 2.52, 3.3, za, zb, WHITE)
        p = LB_IDX[side][b]; u0, v0 = (p % 2) / 2, 1 - (p // 2 + 1) / 4
        fxp = wx - sgn * 0.0915; zc = (za + zb) / 2
        uv_quad(side, 'lightbox', M['lightbox'], face_quad(fxp, 2.91, zc, (zb - za) - 0.1, 0.66, '+x' if side == 'left' else '-x'), (u0 + 0.004, v0 + 0.004, u0 + 0.496, v0 + 0.246))
    # 鞋：每層 4 隻，鞋頭朝門口、往走道轉一點
    sx = (wx + fx) / 2 + sgn * 0.01
    rows = sw['rows']; skip = len(SHELF_T) - rows
    for b in range(nb):
        style = CAT[sw['cats'][b]]
        for r_ in range(skip):   # 沒放鞋的最下層：鞋盒
            for q in range(3):
                za = z0 + b * bw + 0.12 + q * (bw - 0.24) / 3; col = BOXC[(q + b) % len(BOXC)]
                for s_ in range(2):
                    y = SHELF_T[r_] + s_ * 0.125; xa, xb = sx - 0.1, sx + 0.1
                    vc.cbox(xa, xb, y, y + 0.1, za + 0.01, za + (bw - 0.24) / 3 - 0.01, col[0]); vc.cbox(xa - 0.004, xb + 0.004, y + 0.1, y + 0.124, za + 0.006, za + (bw - 0.24) / 3 - 0.006, col[1])
        for r_, t in enumerate(SHELF_T):
            if r_ < skip: continue
            for q in range(4):
                z = z0 + b * bw + bw * (q + 0.5) / 4 + rs.uniform(-0.015, 0.015)
                ry = (-math.pi / 2 + (0.32 if side == 'left' else -0.32)) + rs.uniform(-0.05, 0.05)
                put_shoe(style, (q + r_ + b) % 4 if style != 'bb_high' else (q + 2 * r_) % 4, sx, t, z, ry, side)


for sw in LAY['shoeWalls']: shoe_wall(sw)
for lb in [i_ for i_ in LAY['items'] if i_['kind'] == 'lightbox_big']:   # 左牆前段的大燈箱
    wv_ = wm(lb['side'], 'vc'); wx_ = X0 + WT
    wv_.cbox(wx_, wx_ + 0.08, lb['y0'], lb['y1'], lb['z0'], lb['z1'], WHITE)
    uv_quad(lb['side'], 'lightbox', M['lightbox'], face_quad(wx_ + 0.0815, (lb['y0'] + lb['y1']) / 2, (lb['z0'] + lb['z1']) / 2, lb['z1'] - lb['z0'] - 0.1, lb['y1'] - lb['y0'] - 0.1, '+x'), (0.504, 0.004, 0.996, 0.246))

# 籃球鞋區的地面標示：一條橘色的細線（地板上，木地板接縫那種寬度；好認但不吵）
zb_ = next(z for z in LAY['zones'] if z['kind'] == 'basketball')
VC.cbox(-4.02, -3.98, 0.0, 0.003, zb_['z0'] + 0.1, zb_['z1'] - 0.1, '#e0782e')

# ---------------- 後牆：落地鏡、襪子掛架、毛巾桶、鞋拔；右段鞋盒牆＋原木板牆＋店名木板 ----------------
it = {}
for i_ in LAY['items']: it.setdefault(i_['kind'], []).append(i_)
bz = Z0 + WT
mr = it['mirror'][0]; mx, mw, mh_ = mr['x'], mr['w'], mr['h']
wb = wm('back', 'wood')
for (a, b_, c, d_) in ((mx - mw / 2, mx - mw / 2 + 0.05, 0.02, mh_), (mx + mw / 2 - 0.05, mx + mw / 2, 0.02, mh_), (mx - mw / 2, mx + mw / 2, 0.02, 0.08), (mx - mw / 2, mx + mw / 2, mh_ - 0.06, mh_)):
    wb.rbox(a, b_, c, d_, bz + 0.02, bz + 0.07, r=0.008, seg=1)
uv_quad('back', 'mirror', M['graphic'], face_quad(mx, (0.08 + mh_ - 0.06) / 2, bz + 0.05, mw - 0.1, mh_ - 0.14, '+z'), (0.502, 0.01, 0.748, 0.99))
# 襪子掛架：白色洞洞板＋三排掛勾，每個掛勾一雙襪子（紙卡＋兩隻）；上面一層小木架放黃金葛
sk = it['sock_rack'][0]; sxc, sw_ = sk['x'], sk['w']; wv = wm('back', 'vc'); wmv = wm('back', 'vcm')
wv.crbox(sxc - sw_ / 2, sxc + sw_ / 2, 0.95, 2.1, bz, bz + 0.025, '#f4f2ee', r=0.006)
for j in range(12):
    for i in range(5): wv.cbox(sxc - 0.38 + i * 0.19 - 0.006, sxc - 0.38 + i * 0.19 + 0.006, 1.0 + j * 0.09, 1.012 + j * 0.09, bz + 0.025, bz + 0.027, '#cfcac2')
SOCK = ['#f4f4f2', '#f4f4f2', '#2a2a2c', '#9a9ea3', '#f4f4f2', '#2a2a2c', '#c9cbcd', '#f4f4f2', '#2a2a2c']
for r_ in range(3):
    for c_ in range(3):
        hx, hy = sxc - 0.28 + c_ * 0.28, 1.95 - r_ * 0.34; col = SOCK[r_ * 3 + c_]
        painted(wmv, '#b9bdc0', lambda hx=hx, hy=hy: wmv.cyl((hx, hy, bz + 0.025), (hx, hy + 0.01, bz + 0.12), 0.004, seg=4))
        wv.cbox(hx - 0.05, hx + 0.05, hy - 0.06, hy + 0.012, bz + 0.1, bz + 0.104, '#c8a77e')                  # 紙卡
        for s_ in (-0.024, 0.024):
            wv.cbox(hx + s_ - 0.022, hx + s_ + 0.022, hy - 0.26, hy - 0.055, bz + 0.096, bz + 0.112, col)   # 襪筒
            wv.crbox(hx + s_ - 0.022, hx + s_ + 0.06, hy - 0.3, hy - 0.24, bz + 0.096, bz + 0.112, col, r=0.008, seg=1)      # 腳掌（往右彎）
            wv.cbox(hx + s_ - 0.022, hx + s_ + 0.022, hy - 0.11, hy - 0.09, bz + 0.113, bz + 0.114, '#b8bcc0' if col != '#2a2a2c' else '#5a5c60')  # 襪口的條紋
wb.rbox(sxc - 0.5, sxc + 0.5, 2.18, 2.21, bz, bz + 0.22, r=0.006, seg=1)
for s_ in (-0.4, 0.4): wv.cbox(sxc + s_ - 0.01, sxc + s_ + 0.01, 2.06, 2.18, bz, bz + 0.18, '#2a2a2c')   # 層架的鐵托架
# 毛巾桶（鐵網）
tb = it['towel_bin'][0]; tx_, tz_, tr = tb['x'], tb['z'], tb['r']
for yy in (0.02, 0.3, 0.56):
    painted(VCM, '#2c2c2e', lambda yy=yy: Xf(tx_, tz_).lathe(VCM, [(tr - 0.004, 0), (tr + 0.004, 0), (tr + 0.004, 0.012), (tr - 0.004, 0.012)], 0, yy, 0, seg=16))
for k in range(16):
    a = 2 * math.pi * k / 16; painted(VCM, '#2c2c2e', lambda a=a: VCM.cyl((tx_ + math.cos(a) * tr * 0.92, 0.02, tz_ + math.sin(a) * tr * 0.92), (tx_ + math.cos(a) * tr, 0.57, tz_ + math.sin(a) * tr), 0.003, seg=4))
painted(VCM, '#2c2c2e', lambda: Xf(tx_, tz_).lathe(VCM, [(0, 0), (tr * 0.93, 0), (tr * 0.93, 0.02), (0, 0.02)], 0, 0.0, 0, seg=16))
for k, (ox, oz, hh) in enumerate(((-0.06, -0.05, 0.66), (0.06, -0.04, 0.63), (0.0, 0.07, 0.68), (-0.08, 0.07, 0.6), (0.09, 0.08, 0.62))):
    painted(VC, '#f6f5f1' if k % 3 else '#e4e6e8', lambda ox=ox, oz=oz, hh=hh: VC.cyl((tx_ + ox, 0.05, tz_ + oz), (tx_ + ox * 1.1, hh, tz_ + oz * 1.1), 0.05, seg=10))
# 長鞋拔（木座、細長的鞋拔）
sh = it['shoehorn'][0]; hx_, hz_ = sh['x'], sh['z']; ww = acc('wood')
ww.rbox(hx_ - 0.11, hx_ + 0.11, 0.0, 0.04, hz_ - 0.11, hz_ + 0.11, r=0.01, seg=1)
ww.rbox(hx_ - 0.03, hx_ + 0.03, 0.04, 0.9, hz_ - 0.09, hz_ - 0.05, r=0.008, seg=1)
for k in range(5):
    y0, y1 = 0.12 + k * 0.15, 0.27 + k * 0.15; wdt = 0.024 if k < 4 else 0.034
    VCM.crbox(hx_ - wdt, hx_ + wdt, y0, y1, hz_ - 0.035 + (0.006 if k in (0, 4) else 0), hz_ - 0.026 + (0.006 if k in (0, 4) else 0), '#e8e8e6', r=0.003)
VCM.crbox(hx_ - 0.01, hx_ + 0.01, 0.88, 0.96, hz_ - 0.035, hz_ - 0.026, '#e8e8e6', r=0.003)

# 鞋盒牆：後牆右段＋右牆後段（原木層架，白、灰、牛皮色盒子；盒身＋盒蓋）
rb = random.Random(31)


def box_wall(side, a0, a1, depth):
    """side＝'back'（沿 x）或 'right'（沿 z）；a0～a1＝範圍"""
    vc, wd = wm(side, 'vc'), wm(side, 'wood')
    nb = max(1, round((a1 - a0) / 1.0)); bw = (a1 - a0) / nb; ys = [0.1, 0.46, 0.82, 1.18, 1.54, 1.9, 2.26]
    def bx(u0, u1, y0, y1, d0, d1, col, wood=False, r=0.0):
        if side == 'back': args = (u0, u1, y0, y1, Z0 + WT + d0, Z0 + WT + d1)
        else: args = (X1 - WT - d1, X1 - WT - d0, y0, y1, u0, u1)
        if wood: wd.rbox(*args, r=0.005, seg=1)
        elif r: vc.crbox(*args, col, r=r)
        else: vc.cbox(*args, col)
    bx(a0, a1, 0.0, 0.1, 0.0, depth - 0.04, '#3a3632')
    for y in ys: bx(a0, a1, y - 0.025, y, 0.0, depth, None, wood=True)
    for b in range(nb + 1): u = a0 + b * bw; bx(u - 0.02, u + 0.02, 0.0, 2.28, 0.0, depth, '#efe9df')
    bx(a0, a1, 0.1, 2.26, 0.0, 0.01, '#ece6dc')
    for b in range(nb):
        for y in ys[:-1]:
            ncol = 3; cw = (bw - 0.04) / ncol
            for c in range(ncol):
                stack = 2 if rb.random() > 0.42 else 1
                col = BOXC[rb.randrange(len(BOXC))]; u0 = a0 + b * bw + 0.02 + c * cw + 0.01; u1 = u0 + cw - 0.02
                for s_ in range(stack):
                    yb0 = y + s_ * 0.128; dd = depth - 0.05 - rb.uniform(0, 0.03)
                    bx(u0 + 0.004, u1 - 0.004, yb0, yb0 + 0.1, 0.02, dd - 0.004, col[0])
                    bx(u0, u1, yb0 + 0.1, yb0 + 0.124, 0.016, dd, col[1])


bwb = [b for b in it['box_wall'] if b['side'] == 'back'][0]; bwr = [b for b in it['box_wall'] if b['side'] == 'right'][0]
box_wall('back', bwb['x0'], bwb['x1'] - WT, bwb['depth'] - WT)
box_wall('right', bwr['z0'], bwr['z1'], bwr['depth'] - WT)
# 收銀台後面的原木板牆（直條）＋店名木板（只有木板，字由遊戲畫）
for k in range(int((bwb['x1'] - WT - bwb['x0']) / 0.2)):
    x = bwb['x0'] + k * 0.2; wb.rbox(x + 0.004, x + 0.196, 2.3, H - 0.02, bz, bz + 0.02, r=0.004, seg=1)
nb_ = it['name_board'][0]
wb.rbox(nb_['x'] - nb_['w'] / 2, nb_['x'] + nb_['w'] / 2, nb_['y'] - nb_['h'] / 2, nb_['y'] + nb_['h'] / 2, bz + 0.02, bz + 0.07, r=0.012, seg=2)
pf = Mesh('WALL_back_PLATE_FACE_dabu_name', M['wood']); pf.quad(face_quad(nb_['x'], nb_['y'], bz + 0.0705, nb_['w'] - 0.04, nb_['h'] - 0.04, '+z'))
pfo = pf.finish(root, uv=False, props={'dir': DIRS['back'], 'sign': '大步球鞋', 'note': '店名由遊戲畫（canvas）；只有木板，沒有勾勾線條（D77）'}); L.uv_text(pfo)

# ---------------- 收銀台、吊燈 ----------------
ct = it['counter'][0]; cx_, cz_, cw_, cd_, chh = ct['x'], ct['z'], ct['w'], ct['d'], ct['h']
x0c, x1c, z0c, z1c = cx_ - cw_ / 2, cx_ + cw_ / 2, cz_ - cd_ / 2, cz_ + cd_ / 2
VC.cbox(x0c + 0.04, x1c - 0.04, 0.0, 0.07, z0c + 0.04, z1c - 0.04, '#3a3632')
VC.crbox(x0c, x1c, 0.07, 0.72, z0c, z1c, '#f4f2ee', r=0.01)
acc('led').box(x0c + 0.02, x1c - 0.02, 0.72, 0.735, z1c - 0.03, z1c + 0.005)
acc('wood').rbox(x0c, x1c, 0.735, 0.94, z0c + 0.05, z1c, r=0.01, seg=1)
acc('wood').rbox(x0c - 0.03, x1c + 0.03, 0.94, 0.98, z0c - 0.03, z1c + 0.04, r=0.012, seg=2)
# 螢幕（朝店員、往客人轉一點）、刷卡機（客人那一側）、筆筒、小盆栽
mxf = Xf(cx_ + 0.35, cz_ - 0.05, math.pi - 0.5)
for a_ in [(-0.09, 0.09, 0.98, 0.99, -0.07, 0.07), (-0.02, 0.02, 0.99, 1.16, -0.04, 0.0), (-0.24, 0.24, 1.08, 1.4, -0.015, 0.015)]: mxf.crbox(VC, *a_, '#2a2a2c', r=0.004)
uv_quad(None, 'screens', M['graphic'], [mxf.p(-0.22, 1.1, 0.0155), mxf.p(0.22, 1.1, 0.0155), mxf.p(0.22, 1.38, 0.0155), mxf.p(-0.22, 1.38, 0.0155)], (0.752, 0.53, 0.998, 0.97))
pxf = Xf(cx_ - 0.45, cz_ + 0.18, 0.25)
pxf.crbox(VC, -0.045, 0.045, 0.98, 1.0, -0.08, 0.08, '#1e1f22', r=0.006); pxf.crbox(VC, -0.04, 0.04, 1.0, 1.05, -0.07, 0.02, '#1e1f22', r=0.006)
pts = [pxf.p(-0.032, 1.051, -0.06), pxf.p(0.032, 1.051, -0.06), pxf.p(0.032, 1.051, 0.012), pxf.p(-0.032, 1.051, 0.012)]
uv_quad(None, 'screens', M['graphic'], pts[::-1], (0.76, 0.03, 0.99, 0.47))   # 朝上
painted(VC, '#d9d4ca', lambda: Xf(cx_ - 0.85, cz_ - 0.1).lathe(VC, [(0, 0), (0.035, 0), (0.035, 0.1), (0, 0.1)], 0, 0.98, 0, seg=10))
for k in range(4): painted(VC, ['#2f58a6', '#2a2a2c', '#b3262e', '#2a2a2c'][k], lambda k=k: VC.cyl((cx_ - 0.86 + (k % 2) * 0.02, 1.0, cz_ - 0.11 + (k // 2) * 0.02), (cx_ - 0.86 + (k % 2) * 0.03, 1.15, cz_ - 0.11 + (k // 2) * 0.025), 0.004, seg=4))
pd = it['pendant'][0]
painted(VCM, '#2a2a2c', lambda: VCM.cyl((pd['x'], H, pd['z']), (pd['x'], pd['y'] + 0.2, pd['z']), 0.004, seg=4))
painted(VC, '#f6f5f2', lambda: Xf(pd['x'], pd['z']).lathe(VC, [(0.02, 0.2), (0.05, 0.195), (0.14, 0.15), (0.2, 0.06), (0.22, 0.0), (0.21, 0.0)], 0, pd['y'], 0, seg=20))
acc('led').sphere((pd['x'], pd['y'] + 0.04, pd['z']), 0.05, seg=10, rings=6)
CL.glow(root, 'pendant', pd['x'], pd['y'] - 0.05, pd['z'], color='rgba(255,226,180,1)', size=1.4, day=0.25, night=1.0)

# ---------------- 試穿椅（原木腳、下層木條、灰布格子軟墊）＋地毯 ----------------
def cushion(x, z, w, d, y0, y1):
    nx, nz = 12, 4; bm = bmesh.new(); grid = {}
    for i in range(nx + 1):
        for j in range(nz + 1):
            u, v = i / nx, j / nz; px, pz = x - w / 2 + u * w, z - d / 2 + v * d
            edge = i in (0, nx) or j in (0, nz)
            dip = (i % 2 == 0 and j % 2 == 0)
            yy = y1 - (0.022 if edge else (0.014 if dip else 0.0))
            grid[(i, j)] = bm.verts.new(g2b(px, yy, pz))
    for i in range(nx):
        for j in range(nz): bm.faces.new([grid[(i, j)], grid[(i + 1, j)], grid[(i + 1, j + 1)], grid[(i, j + 1)]])
    ring = [grid[(i, 0)] for i in range(nx)] + [grid[(nx, j)] for j in range(nz)] + [grid[(i, nz)] for i in range(nx, 0, -1)] + [grid[(0, j)] for j in range(nz, 0, -1)]
    low = [bm.verts.new(Vector((v.co.x, v.co.y, y0))) for v in ring]   # Blender z＝遊戲 y
    nr = len(ring)
    for k in range(nr): bm.faces.new([ring[k], ring[(k + 1) % nr], low[(k + 1) % nr], low[k]])
    bm.faces.new(list(reversed(low)))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    acc('fabric').add_bm(bm); bm.free()


for bn in it['bench']:
    xf = Xf(bn['x'], bn['z'], bn.get('ry', 0)); w, d = bn['w'], bn['d']; wd = acc('wood')
    for sx in (-w / 2 + 0.035, w / 2 - 0.035):
        for sz in (-d / 2 + 0.035, d / 2 - 0.035): xf.rbox(wd, sx - 0.028, sx + 0.028, 0.0, 0.385, sz - 0.028, sz + 0.028, r=0.006, seg=1)
    for sz in (-d / 2 + 0.035, d / 2 - 0.035): xf.rbox(wd, -w / 2 + 0.03, w / 2 - 0.03, 0.31, 0.385, sz - 0.018, sz + 0.018, r=0.005, seg=1)   # 上框
    for sx in (-w / 2 + 0.035, w / 2 - 0.035): xf.rbox(wd, sx - 0.018, sx + 0.018, 0.31, 0.385, -d / 2 + 0.03, d / 2 - 0.03, r=0.005, seg=1)
    for sz in (-d / 2 + 0.035, d / 2 - 0.035): xf.rbox(wd, -w / 2 + 0.03, w / 2 - 0.03, 0.1, 0.13, sz - 0.015, sz + 0.015, r=0.004, seg=1)    # 下層的框
    for k in range(5): sz = -d / 2 + 0.07 + k * (d - 0.14) / 4; xf.rbox(wd, -w / 2 + 0.06, w / 2 - 0.06, 0.13, 0.148, sz - 0.017, sz + 0.017, r=0.004, seg=1)   # 下層木條
    cushion(bn['x'], bn['z'], w - 0.01, d - 0.01, 0.385, bn['h'])
# 試穿椅 A 旁邊地上：一個打開的鞋盒＋一雙籃球鞋（試穿中）
ob_x, ob_z = -2.75, -0.35
VC.cbox(ob_x - 0.16, ob_x + 0.16, 0.0, 0.1, ob_z - 0.1, ob_z + 0.1, '#f4f3ef'); VC.cbox(ob_x - 0.165, ob_x + 0.165, 0.0, 0.024, ob_z - 0.36, ob_z - 0.14, '#e6e4de')
VC.cbox(ob_x - 0.15, ob_x + 0.15, 0.1, 0.104, ob_z - 0.09, ob_z + 0.09, '#e9e2d4')
put_shoe('bb_high', 0, -2.45, 0.0, -0.2, -0.1); put_shoe('bb_high', 0, -2.4, 0.0, -0.05, 0.05)
rg = it['rug'][0]; rx0, rx1, rz0, rz1 = rg['x'] - rg['w'] / 2, rg['x'] + rg['w'] / 2, rg['z'] - rg['d'] / 2, rg['z'] + rg['d'] / 2; ry_ = 0.012
uv_quad(None, 'rug', M['graphic'], [(rx0, ry_, rz1), (rx1, ry_, rz1), (rx1, ry_, rz0), (rx0, ry_, rz0)], (0.0, 0.0, 0.5, 1.0))
for (a, b_, nrm) in (((rx0, rz1), (rx1, rz1), '+z'), ((rx1, rz1), (rx1, rz0), '+x'), ((rx1, rz0), (rx0, rz0), '-z'), ((rx0, rz0), (rx0, rz1), '-x')):
    uv_quad(None, 'rug', M['graphic'], [(a[0], 0.0, a[1]), (b_[0], 0.0, b_[1]), (b_[0], ry_, b_[1]), (a[0], ry_, a[1])], (0.0, 0.0, 0.5, 0.02))

# ---------------- 展示桌、鐵網架 ----------------
dt = it['display_table'][0]; xf = Xf(dt['x'], dt['z']); w, d, hh = dt['w'], dt['d'], dt['h']
xf.rbox(acc('wood'), -w / 2, w / 2, hh - 0.045, hh, -d / 2, d / 2, r=0.01, seg=2)
for sx in (-w / 2 + 0.06, w / 2 - 0.06):
    for sz in (-d / 2 + 0.06, d / 2 - 0.06): xf.rbox(acc('wood'), sx - 0.03, sx + 0.03, 0.0, hh - 0.045, sz - 0.03, sz + 0.03, r=0.006, seg=1)
xf.rbox(acc('wood'), -w / 2 + 0.05, w / 2 - 0.05, 0.16, 0.19, -d / 2 + 0.05, d / 2 - 0.05, r=0.006, seg=1)
for k in range(5):
    col = BOXC[k % len(BOXC)]; bx0 = -w / 2 + 0.12 + k * 0.33
    for s_ in range(2 if k % 2 == 0 else 1):
        y = 0.19 + s_ * 0.125; xf.crbox(VC, bx0, bx0 + 0.3, y, y + 0.1, -0.1, 0.1, col[0], r=0.002, seg=1); xf.crbox(VC, bx0 - 0.004, bx0 + 0.304, y + 0.1, y + 0.124, -0.104, 0.104, col[1], r=0.002, seg=1)
for k, (style, cw_k) in enumerate((('bb_high', 1), ('run', 0), ('casual', 0), ('bb_mid', 0), ('run', 2), ('retro', 1))):
    ox = -w / 2 + 0.2 + (k % 3) * 0.7; oz = -0.18 if k < 3 else 0.18
    put_shoe(style, cw_k, *xf.p(ox, hh, oz), (0.4 if k < 3 else math.pi - 0.4) + random.uniform(-0.1, 0.1))
xf.crbox(VC, 0.62, 0.92, hh, hh + 0.1, -0.12, 0.08, '#9aa0a6', r=0.002, seg=1); xf.crbox(VC, 0.616, 0.924, hh + 0.1, hh + 0.124, -0.124, 0.084, '#8a9096', r=0.002, seg=1)
wr = it['wire_rack'][0]; rx, rz, rw, rd, rh = wr['x'], wr['z'], wr['w'], wr['d'], wr['h']
for sx in (-rw / 2 + 0.02, rw / 2 - 0.02):
    for sz in (-rd / 2 + 0.02, rd / 2 - 0.02): painted(VCM, '#2c2c2e', lambda sx=sx, sz=sz: VCM.cyl((rx + sx, 0.0, rz + sz), (rx + sx, rh, rz + sz), 0.009, seg=6))
CANS = ['#f4f4f2', '#2f58a6', '#e0702e', '#4fb3a9', '#2a2a2c', '#c8d64a']
for k, yy in enumerate((0.12, 0.62, 1.12)):
    for s_ in (-1, 1): VCM.cbox(rx - rw / 2, rx + rw / 2, yy - 0.006, yy + 0.006, rz + s_ * (rd / 2 - 0.02) - 0.004, rz + s_ * (rd / 2 - 0.02) + 0.004, '#2c2c2e')
    for s_ in (-1, 1): VCM.cbox(rx + s_ * (rw / 2 - 0.02) - 0.004, rx + s_ * (rw / 2 - 0.02) + 0.004, yy - 0.006, yy + 0.006, rz - rd / 2, rz + rd / 2, '#2c2c2e')
    for j in range(9): z = rz - rd / 2 + 0.04 + j * (rd - 0.08) / 8; VCM.cbox(rx - rw / 2 + 0.02, rx + rw / 2 - 0.02, yy - 0.003, yy + 0.0, z - 0.002, z + 0.002, '#2c2c2e')
    for s_ in (-1, 1): VCM.cbox(rx - rw / 2, rx + rw / 2, yy + 0.08, yy + 0.088, rz + s_ * (rd / 2 - 0.02) - 0.003, rz + s_ * (rd / 2 - 0.02) + 0.003, '#2c2c2e')   # 籃子的邊
    if k == 0:   # 下層：折好的毛巾
        for j in range(3):
            for s_ in range(2): VC.crbox(rx - 0.17, rx + 0.17, yy + 0.002 + s_ * 0.045, yy + 0.044 + s_ * 0.045, rz - 0.42 + j * 0.3, rz - 0.18 + j * 0.3, ['#f6f5f1', '#e4e6e8', '#c9cbcd'][(j + s_) % 3], r=0.018, seg=1)
    else:        # 噴霧、除臭劑
        for j in range(6):
            cz = rz - 0.36 + (j % 3) * 0.36; cxx = rx - 0.09 + (j // 3) * 0.18; col = CANS[(j + k) % len(CANS)]; ht = 0.17 + (j % 3) * 0.03
            painted(VC, col, lambda cxx=cxx, cz=cz, ht=ht: Xf(cxx, cz).lathe(VC, [(0, 0), (0.03, 0), (0.032, 0.01), (0.032, ht), (0.024, ht + 0.02), (0, ht + 0.02)], 0, yy, 0, seg=8))
            painted(VC, '#f4f4f2' if col != '#f4f4f2' else '#2a2a2c', lambda cxx=cxx, cz=cz, ht=ht: Xf(cxx, cz).lathe(VC, [(0, 0), (0.02, 0), (0.02, 0.035), (0, 0.035)], 0, yy + ht + 0.02, 0, seg=6))

# ---------------- 櫥窗展示（前牆的組）：三層玻璃層架、白色矮台、籃球 ----------------
wdp = it['window_display'][0]; wx0, wx1 = wdp['x'] - wdp['w'] / 2, wdp['x'] + wdp['w'] / 2; wz0, wz1 = wdp['z'] - wdp['d'] / 2 + 0.05, wdp['z'] + wdp['d'] / 2 - 0.05
fvc, fvm, fgl = wm('front', 'vc'), wm('front', 'vcm'), wm('front', 'glass')
posts = [wx0 + k * (wx1 - wx0) / 3 for k in range(4)]
for px in posts:
    for pz in (wz0, wz1): painted(fvm, ALU, lambda px=px, pz=pz: fvm.cyl((px, 0.0, pz), (px, 2.3, pz), 0.012, seg=6))
for yy in (0.95, 1.45, 1.95):
    fgl.box(wx0, wx1, yy - 0.012, yy, wz0 - 0.03, wz1 + 0.03)
    for px in posts: fvm.cbox(px - 0.02, px + 0.02, yy - 0.03, yy - 0.012, wz0 - 0.03, wz1 + 0.03, ALU)
    nq = 3 if yy < 1.0 else 5
    for q in range(nq):
        sx_ = wx0 + 0.45 + q * (wx1 - wx0 - 0.9) / (nq - 1); style = ['bb_high', 'run', 'casual', 'bb_mid', 'retro', 'run', 'bb_high', 'casual'][(q + int(yy * 10)) % 8]
        put_shoe(style, (q + int(yy * 2)) % 4, sx_, yy, (wz0 + wz1) / 2, (0.5 if q % 2 else math.pi - 0.5), 'front')
for (px, pw, ph) in ((wx0 + 0.55, 0.6, 0.42), (wdp['x'] + 0.2, 0.5, 0.3), (wx1 - 0.5, 0.55, 0.5)):
    fvc.crbox(px - pw / 2, px + pw / 2, 0.0, ph, wz0 + 0.02, wz1 - 0.02, '#f1efea', r=0.01)
bbx, bby, bbz = wx0 + 0.55, 0.42 + 0.12, (wz0 + wz1) / 2
_n0 = len(fvc.bm.faces); fvc.sphere((bbx, bby, bbz), 0.12, seg=16, rings=10)
fvc.bm.faces.ensure_lookup_table(); _bf = [fvc.bm.faces[i] for i in range(_n0, len(fvc.bm.faces))]
for f in _bf:   # 籃球的黑線：一條經線、赤道（貼著那條線的一排面）
    c = f.calc_center_median()
    mer = any(abs(v.co.y + bbz) < 1e-4 for v in f.verts) and c.y > -bbz
    equ = any(abs(v.co.z - bby) < 1e-4 for v in f.verts) and c.z > bby
    fvc.paint([f], '#3a2418' if (mer or equ) else '#d9692e')
put_shoe('bb_high', 3, wdp['x'] + 0.2, 0.3, bbz, math.pi - 0.4, 'front'); put_shoe('run', 1, wx1 - 0.5, 0.5, bbz, 0.45, 'front')


# ---------------- 植物（黃金葛的葉片卡；白色陶盆） ----------------
def plant(x, z, h=1.1, r=0.2, y0=0.0, trail=False):
    painted(VC, '#f1efea', lambda: Xf(x, z).lathe(VC, [(r * 0.72, 0), (r * 0.78, 0.02), (r, r * 1.4), (r * 1.04, r * 1.45), (r * 0.94, r * 1.45), (r * 0.9, r * 1.3), (0, r * 1.3)], 0, y0, 0, seg=12))
    VC.cbox(x - r * 0.6, x + r * 0.6, y0 + r * 1.32, y0 + r * 1.34, z - r * 0.6, z + r * 0.6, '#3e3024')
    lf = acc('leaf'); rnd = random.Random(int(abs(x * 31 + z * 17)) + 5)
    if trail:   # 垂下來的黃金葛
        for s_ in range(6):
            a = rnd.uniform(0, 2 * math.pi); px, pz = x + math.cos(a) * r * 0.8, z + math.sin(a) * r * 0.8
            for k in range(7): CL.card(lf, px + math.cos(a) * k * 0.02, y0 + r * 1.4 - k * 0.09, pz + math.sin(a) * k * 0.02 + rnd.uniform(-0.02, 0.02), 0.11, 0.11, ry=rnd.uniform(0, math.pi), rx=rnd.uniform(-0.6, 0.6), uv=CL.rand_uv(0.5))
        for k in range(10): CL.card(lf, x + rnd.uniform(-r, r), y0 + r * 1.5 + rnd.uniform(0, 0.12), z + rnd.uniform(-r, r), 0.13, 0.13, ry=rnd.uniform(0, math.pi), rx=rnd.uniform(-1.0, 1.0), uv=CL.rand_uv(0.5))
        return
    painted(VC, '#6a5644', lambda: VC.cyl((x, y0 + r, z), (x + 0.03, y0 + h * 0.75, z - 0.02), 0.02, seg=6))
    random.seed(int(abs(x * 13 + z * 7)) + 11)
    for lvl in range(4):
        cy = y0 + r * 1.4 + (h - r * 1.4) * (0.35 + lvl * 0.2); rr = 0.26 + (0.1 if lvl in (1, 2) else 0.0)
        CL.bush(lf, x, cy, z, rr * (h / 1.1), n=9, span=0.5, flat_y=0.9)


for p_ in it['plant_big']: plant(p_['x'], p_['z'], h=1.45 if p_['z'] > 6 or p_['z'] < -7 else 1.25, r=0.21)
plant(sxc, bz + 0.12, r=0.08, y0=2.21, trail=True)                         # 襪子架上面的黃金葛（參考圖）
plant(cx_ + 0.85, cz_ - 0.05, r=0.07, y0=0.98, trail=True)                # 收銀台上的小盆栽
plant(wx1 - 0.15, (wz0 + wz1) / 2, h=0.9, r=0.15, y0=0.0)                  # 櫥窗角落的盆栽

# ---------------- 天花板：外露風管、管線、軌道投射燈、吸頂冷氣、橫梁 ----------------
for zb in (-3.0, 3.2): acc('paint').box(X0 + WT, X1 - WT, H - 0.36, H, zb - 0.16, zb + 0.16)
DX = 1.25; DY = 3.12; DR = 0.19
painted(VCM, '#c9ccce', lambda: VCM.cyl((DX, DY, Z0 + WT), (DX, DY, Z1 - WT), DR, seg=18, caps=False))
for k in range(9):
    z = Z0 + 1.0 + k * 1.75
    if abs(z - -3.0) < 0.3 or abs(z - 3.2) < 0.3: continue
    painted(VCM, '#b9bdc0', lambda z=z: VCM.cyl((DX, DY, z - 0.03), (DX, DY, z + 0.03), DR + 0.012, seg=18))
    painted(VCM, '#2c2c2e', lambda z=z: VCM.cyl((DX, DY + DR, z), (DX, H, z), 0.006, seg=4))
for (px, py, pr, col) in ((-0.25, 3.47, 0.04, '#f1efea'), (-0.4, 3.5, 0.025, '#9aa0a6'), (3.6, 3.48, 0.035, '#f1efea')):
    painted(VC if col == '#f1efea' else VCM, col, lambda px=px, py=py, pr=pr, col=col: (VC if col == '#f1efea' else VCM).cyl((px, py, Z0 + WT), (px, py, Z1 - WT), pr, seg=8, caps=False))
TRACKS = [(-2.95, 'left'), (0.35, 'mid'), (3.0, 'right')]
for tx, kind in TRACKS:
    VCM.cbox(tx - 0.02, tx + 0.02, H - 0.06, H - 0.03, Z0 + 0.6, Z1 - 0.6, '#2a2a2c')
    for k in range(7):
        z = Z0 + 1.3 + k * 2.2; aim = {'left': (-1, -0.2), 'mid': (0.0, 0.0), 'right': (0.6, -0.3)}[kind]
        if kind == 'mid': aim = (-0.5 if k % 2 else 0.4, 0.0)
        hx, hy, hz = tx, H - 0.14, z; d_ = Vector((aim[0], -1.0, aim[1])).normalized()
        a, b_ = (hx - d_.x * 0.06, hy - d_.y * 0.06, hz - d_.z * 0.06), (hx + d_.x * 0.08, hy + d_.y * 0.08, hz + d_.z * 0.08)
        painted(VCM, '#2a2a2c', lambda hx=hx, hz=hz: VCM.cyl((hx, H - 0.05, hz), (hx, hy + 0.02, hz), 0.008, seg=4))
        painted(VC, '#f3f1ec', lambda a=a, b_=b_: VC.cyl(a, b_, 0.042, seg=8))
        lens = (b_[0] + d_.x * 0.002, b_[1] + d_.y * 0.002, b_[2] + d_.z * 0.002)
        acc('led').cyl(b_, lens, 0.032, seg=6)
        if k % 3 == 1: CL.glow(root, 'spot', lens[0] + d_.x * 0.3, lens[1] + d_.y * 0.3, lens[2] + d_.z * 0.3, color='rgba(255,224,176,1)', size=0.9, day=0.15, night=0.8)
for (ax, az) in ((-1.35, -5.0), (-1.35, 1.0)):
    VC.crbox(ax - 0.42, ax + 0.42, H - 0.06, H, az - 0.42, az + 0.42, '#f3f2ef', r=0.012)
    VC.cbox(ax - 0.25, ax + 0.25, H - 0.064, H - 0.06, az - 0.25, az + 0.25, '#dcdad6')
    for s_ in (-1, 1):
        VC.cbox(ax - 0.3, ax + 0.3, H - 0.065, H - 0.06, az + s_ * 0.34 - 0.03, az + s_ * 0.34 + 0.03, '#5a5c60')
        VC.cbox(ax + s_ * 0.34 - 0.03, ax + s_ * 0.34 + 0.03, H - 0.065, H - 0.06, az - 0.3, az + 0.3, '#5a5c60')
    for j in range(8): VC.cbox(ax - 0.24, ax + 0.24, H - 0.067, H - 0.064, az - 0.22 + j * 0.063, az - 0.21 + j * 0.063, '#c9c7c3')
for z in (-4.0, 0.0, 4.0): CL.glow(root, 'shelf_led', -4.05, 1.5, z, color='rgba(255,214,160,1)', size=1.6, day=0.2, night=0.9)
CL.glow(root, 'counter_led', cx_, 0.73, z1c + 0.05, color='rgba(255,214,160,1)', size=1.2, day=0.2, night=0.9)

# ---------------- 收尾：合併、單面、匯出 ----------------
for k, m in _acc.items(): m.finish(root, uv=(k not in ('leaf',)), smooth=k in ('wood', 'fabric'))
for side, g in walls.items():
    for key, m in g.items():
        m.name = f'WALL_{side}_{m.name}'; m.finish(root, uv=not isinstance(m, L.CMesh), props={'dir': DIRS[side]}, smooth=key == 'wood')
finish_uvq()
VC.finish(root, uv=False, smooth=True); VCM.finish(root, uv=False, smooth=True)
for ob in list(root.children):
    if ob.type == 'MESH' and ob.data.materials and 'leaf_' in ob.data.materials[0].name: L.smooth_mesh(ob, angle=1.2)
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name, key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
# 圖面（地毯只從上面看、鏡子／螢幕／燈箱只從正面看）：單面、不補反面（nodup）；補了反面，兩片重疊的面在 Cycles 會算成背光的黑色
_ss = L.single_side(root, keep=r'glass', nodup=r'^dabu_(graphic|lightbox)$', skip=lambda ob: 'FACE' in ob.name)
print('{"single_side": %s}' % json.dumps({k: v for k, v in sorted(_ss.items(), key=lambda kv: -kv[1][1])}, ensure_ascii=False))
info = L.export(OUT, gpu_instances=True)
patch_glb(OUT); info['bytes'] = os.path.getsize(OUT)
info.update({'shop': 'dabu', 'layout': LAY['version'], 'shoes': SHOE_N[0], 'shoe_meshes': len(SHOES)})
L.write_json(OUT[:-4] + '.json', info)
