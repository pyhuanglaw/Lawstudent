"""大步球鞋的室內 v2（新生南路新店；CC 建模子代理 2026-11-03，照使用者的參考圖 dabu_int 重做；BB 分派、LAWWW2 整合）→ GLB。Blender 5.2（bpy，無介面）：
  nice -n 15 /opt/blenv/bin/python tools/blender/env_second/bb_support/dabu_interior.py -- [--out 路徑] [--lib <env_second 資料夾>] [--gen <貼圖資料夾>]
參考圖就是規格（SCENE_RULES 第 12 節）：企劃線 docs/story_planning/ref_images/shops/dabu_int.webp（室內）、dabu_ext.webp（外觀）。拆圖清單在 docs/story_planning/CC/CC_41_大步球鞋室內.md「v2 拆圖清單」。
配置（家具位置、大小、座位、導航阻擋、參考圖鏡頭 refView）只寫在 src/data/dabu_layout.js，這裡讀同一份。座標＝遊戲區域座標（room()：中心在原點、x 往東、z 往南、店門在 +z）。
共用工具：lib2、cafe_layout 一律用 claude/second-ai-env-art 那一份（--lib；預設是 CC 工作區的 wt_l2，找不到才用這個 repo 的 tools/blender/env_second）。
自製貼圖：dabu_tex.py（印刷圖集 dabu_print.png：海報、招牌「大步球鞋」、標籤、價格卡、手寫紙條…；鞋子圖集 dabu_shoe.png），輸出到 bb_support/textures/gen/。
會淡出的牆：WALL_<front|back|left|right>_*（自訂屬性 dir）；鞋牆、海報、隔間牆上的鏡子／襪子架、櫃台區的鞋盒牆、招牌都在那一面牆的組裡。
D77：鞋子沒有任何像真實品牌的標誌（側面是虛構的「步紋」側片）；店名「大步球鞋」是虛構的。D112：中間色的木地板（不用深色木地板）。
鞋子：五種輪廓（籃球高筒、籃球中筒、跑鞋、休閒鞋、復古低筒）× 四個配色＝20 個網格（大底、中底、鞋面 7 個斷面、鞋舌、鞋帶；鞋面、中底、大底的印刷在 dabu_shoe 圖集），instancing 擺滿鞋牆。"""
import json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
_LIB_CAND = [arg('--lib'), os.environ.get('DABU_LIB2'),
             '/tmp/claude-0/-home-user-Lawstudent/d06332e2-ec70-5e42-a15c-5a4b27dbdb56/scratchpad/wt_l2/tools/blender/env_second',
             os.path.dirname(HERE)]
LIBDIR = next(p for p in _LIB_CAND if p and os.path.exists(os.path.join(p, 'lib2.py')))
sys.path.insert(0, LIBDIR); sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
import cafe_layout as CL   # noqa: E402
import dabu_tex as TX   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./src/data/dabu_layout.js')))"], cwd=REPO))
OUT = os.path.abspath(arg('--out', os.path.join(REPO, LAY['glb'])))
GEN = arg('--gen') or os.path.join(HERE, 'textures', 'gen')
W, D, H = LAY['w'], LAY['d'], LAY['h']
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
WT = 0.12                      # 外牆厚（內面在 X0+WT…）
XI0, XI1, ZI0, ZI1 = X0 + WT, X1 - WT, Z0 + WT, Z1 - WT
random.seed(620)
B.reset(texres=512)
PRINT_PNG, SHOE_PNG = TX.gen(GEN)
print(json.dumps({'lib2': LIBDIR, 'out': OUT, 'print': PRINT_PNG, 'shoe': SHOE_PNG}, ensure_ascii=False))
root = B.group('dabu_interior', props={'kind': 'dabu_interior', 'w': W, 'd': D, 'h': H, 'layout': LAY['version']})


def img_mat(name, fn, rough=0.6):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(fn, check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    m['tile'] = 1.0; return m


# ---------------- 材質（12 個） ----------------
P = 'dabu_'
M = {
    'floor': L.pbr(P + 'floor_oak', 'laminate_floor_02', tile=1.6, target='#a97d55', normal=0.5, maps=('diff', 'nor'), rough_value=0.42),   # 參考圖的暖色中間木地板（D112）
    'wood': L.pbr(P + 'oak', 'walnut_veneer', tile=0.9, target='#d3ae7e', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.5, sat=0.85),  # 淺橡木（層板、長凳、櫃台、下櫃門）
    'paint': L.pbr(P + 'wall_paint', 'painted_plaster_wall', tile=2.0, target='#e6d8c4', maps=('diff',), res=256, rough_value=0.88),   # 暖米白（不是純白）
    'sun': None,                                                     # 地上的光斑（v2b；天花板改用牆的材質，空出這一個）
    'fabric': L.pbr(P + 'cushion', 'rough_linen', tile=0.35, target='#8a8078', normal=0.6, maps=('diff', 'nor'), res=256, rough_value=0.92),  # 灰褐布座墊
    'vc': L.vc_material(P + 'vc', rough=0.6),                        # 層板背板、隔板、鞋盒、襪子、毛巾、燈具外殼……（頂點色）
    'vcm': L.vc_metal(P + 'vc_metal', rough=0.38, metal=0.4),        # 鐵網、軌道、鋁框、門把
    'glass': L.flat(P + 'glass', '#dfe9ec', rough=0.05, alpha=0.16),
    'led': L.flat(P + 'led', '#fff1d8', rough=0.3, emit=B.srgb('#ffd59a')),   # 層板燈條、投射燈頭、吊燈泡（發光；遊戲的夜間光暈在 GLOW_*）
    'print': img_mat(P + 'print', PRINT_PNG, rough=0.55),            # 印刷圖集（海報、招牌、標籤、價格卡、紙條、地毯、鏡子、螢幕）
    'shoe': img_mat(P + 'shoe', SHOE_PNG, rough=0.58),               # 鞋子圖集
    'leaf': CL.leaf_mat(P + 'leaf_pothos', 'pothos_leaf.png'),
}
def sun_mat(name, fn):
    """窗外照進來的光斑：暖色、半透明（貼圖 alpha）、一點點自發光；glTF alphaMode BLEND"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = 0.9
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(fn, check_existing=True)
    nt.links.new(tx.outputs['Color'], bs.inputs['Base Color']); nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); nt.links.new(tx.outputs['Alpha'], bs.inputs['Alpha'])
    bs.inputs['Emission Strength'].default_value = 2.0
    try: m.surface_render_method = 'BLENDED'
    except Exception: pass
    try: m.blend_method = 'BLEND'
    except Exception: pass
    m['tile'] = 1.0; return m


M['sun'] = sun_mat(P + 'sunpatch', os.path.join(GEN, 'dabu_sun.png'))
# CC0 化（SHOP-REALISM-1112／SHOP-CC0-HELP-1113，D159、D160、D161；第③群幫手 2026-11-13）：工具 cc0_kit.py（tz_shops_interior.py 同一套）。
#   白色檯身（收銀台、展示架檯面）＝ambientCG Plastic006（vary 0.05，不起黑紋）；鐵網、軌道、推車、門把＝ambientCG Metal009 黑鐵；
#   盆栽＝Poly Haven potted_plant_01（高的）／potted_plant_02（矮胖的）／potted_plant_04（小的）（共用網格：烘焙只烘地板、天花板、牆，植物不進光照貼圖）；打開的鞋盒＝ambientCG Cardboard001；鞋盒推車、櫃台後面疊的紙箱＝Poly Haven cardboard_box_01。
import cc0_kit   # noqa: E402
K = cc0_kit.Kit(root, P)
M['white'] = K.acg(P + 'white_counter', 'Plastic006', vary=0.05, target='#ebe6de', tile=0.5, rough_value=0.45)
M['iron'] = K.acg(P + 'blackiron', 'Metal009', maps=('diff',), target='#3a3b3e', tile=1.0, metal=0.3, rough_value=0.42, res=256)
M['shoebox'] = K.acg(P + 'shoebox', 'Cardboard001', vary=0.06, target='#efe9dd', tile=0.4, rough_value=0.85, res=256)   # vary：紙紋不起髒斑
VC = L.CMesh(P + 'vc_parts', M['vc']); M['iron_g'] = K.acg(P + 'steel_grey', 'Metal009', maps=('diff',), target='#7d8084', tile=1.0, metal=0.4, rough_value=0.38, res=256)
VCM = L.CMesh(P + 'metal_parts', M['vcm'])


def PU(name, inset=1.5):
    """印刷圖集的格子 → UV (u0,v0,u1,v1)（v 往上）"""
    x0, y0, x1, y1 = TX.CELLS[name]
    return ((x0 + inset) / TX.PW, 1 - (y1 - inset) / TX.PH, (x1 - inset) / TX.PW, 1 - (y0 + inset) / TX.PH)


def painted(cm, hexcol, fn):
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
    def quad(self, x, y, z, w, h):   # 物件座標裡朝 +z 的四邊形（左下、右下、右上、左上）
        return [self.p(x - w / 2, y - h / 2, z), self.p(x + w / 2, y - h / 2, z), self.p(x + w / 2, y + h / 2, z), self.p(x - w / 2, y + h / 2, z)]


_acc = {}
def acc(key):
    if key not in _acc: _acc[key] = Mesh(P + key, M[key])
    return _acc[key]


# 鐵網籃、鐵架、推車層板（cbox／crbox 畫成黑鐵、鐵灰的零件）→ 材質組網格（Metal009）；細的圓管、軌道燈（白）照舊頂點色
VCM = cc0_kit.Route(VCM, {'#2c2c2e': acc('iron'), '#7d8084': acc('iron_g')})


walls = {'front': {}, 'back': {}, 'left': {}, 'right': {}}
DIRS = LAY['wallsFade']
def wm(side, key):
    g = walls[side]
    if key not in g: g[key] = (L.CMesh if key in ('vc', 'vcm', 'sbv') else Mesh)(f'{side}_{key}', M[key])
    return g[key]


UVQ = []
def uv_quad(side, name, mat, pts, uv): UVQ.append((side, name, mat, pts, uv))
def pq(side, cell, pts, inset=1.5): uv_quad(side, 'print', M['print'], pts, PU(cell, inset))


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
    """朝 normal（'+x' '-x' '+z' '-z' '+y'）的四邊形：點的順序＝從正面看 左下、右下、右上、左上"""
    a, b = w / 2, h / 2
    if normal == '+x': return [(cx, cy - b, cz + a), (cx, cy - b, cz - a), (cx, cy + b, cz - a), (cx, cy + b, cz + a)]
    if normal == '-x': return [(cx, cy - b, cz - a), (cx, cy - b, cz + a), (cx, cy + b, cz + a), (cx, cy + b, cz - a)]
    if normal == '+z': return [(cx - a, cy - b, cz), (cx + a, cy - b, cz), (cx + a, cy + b, cz), (cx - a, cy + b, cz)]
    if normal == '+y': return [(cx - a, cy, cz + b), (cx + a, cy, cz + b), (cx + a, cy, cz - b), (cx - a, cy, cz - b)]   # 朝上：w 沿 x、h 沿 z
    return [(cx + a, cy - b, cz), (cx - a, cy - b, cz), (cx - a, cy + b, cz), (cx + a, cy + b, cz)]


# ---------------- 鞋子：五種輪廓 × 四個配色（UV 到 dabu_shoe 圖集；instancing 的原型） ----------------
PROF = [(1, 0), (1, .4), (.9, .76), (.5, .97), (-.5, .97), (-.9, .76), (-1, .4), (-1, 0)]
SCV = 1.05  # 鞋面高度
SCS = 1.45  # 鞋底厚度：參考圖的鞋都是厚中底的款
SC = 1.2    # 參考圖的鞋在層板上看起來比較大（一雙約佔一層高度的六成）：照參考圖放大到鞋長約 35 cm（展示用的大尺碼樣品）
STY = {
    'bb_high': dict(L=0.300, t=[0, .07, .25, .45, .66, .84, 1.0], h=[.150, .168, .158, .104, .078, .058, .026], w=[.021, .041, .045, .047, .050, .046, .017],
                    sole=(.013, .036, .028), spring=.014, lace=(.28, .70)),
    'bb_mid': dict(L=0.296, t=[0, .07, .25, .45, .66, .84, 1.0], h=[.112, .124, .118, .090, .074, .056, .025], w=[.021, .041, .045, .047, .050, .046, .017],
                   sole=(.012, .034, .027), spring=.014, lace=(.28, .70)),
    'run': dict(L=0.292, t=[0, .07, .25, .45, .66, .84, 1.0], h=[.078, .084, .064, .070, .058, .043, .015], w=[.020, .039, .042, .044, .046, .039, .012],
                sole=(.009, .042, .022), spring=.024, lace=(.30, .68)),
    'casual': dict(L=0.290, t=[0, .07, .25, .45, .66, .84, 1.0], h=[.068, .076, .066, .074, .064, .050, .026], w=[.022, .042, .046, .048, .050, .047, .020],
                   sole=(.010, .031, .030), spring=.010, lace=(.30, .70)),
    'retro': dict(L=0.286, t=[0, .07, .25, .45, .66, .84, 1.0], h=[.058, .066, .056, .061, .051, .040, .016], w=[.020, .037, .040, .042, .043, .036, .012],
                  sole=(.009, .020, .018), spring=.012, lace=(.30, .70)),
}
SHOES = {}


def shoe_mesh(style, k):
    st = STY[style]; cx, cy = TX.shoe_cell(style, k)
    def uv(px, py): return ((cx + px) / TX.SW, 1 - (cy + py) / TX.SH)
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap')
    # 斷面加密到 10 個（鞋頭那一段多三個）：鞋頭圓弧往下收，側面輪廓不是一塊楔形積木
    T = [0, .05, .14, .3, .48, .64, .78, .89, .96, 1.0]
    def _ip(arr, t):
        for i in range(len(st['t']) - 1):
            if st['t'][i] <= t <= st['t'][i + 1]:
                u = (t - st['t'][i]) / (st['t'][i + 1] - st['t'][i]); return arr[i] * (1 - u) + arr[i + 1] * u
        return arr[-1]
    TOE = {0.89: 0.82, 0.96: 0.55, 1.0: 0.2}; TW = {0.96: 0.8, 1.0: 0.5}
    hs0 = [_ip(st['h'], t) * TOE.get(t, 1.0) for t in T]; ws0 = [_ip(st['w'], t) * TW.get(t, 1.0) for t in T]
    Lg, Hs, Ws = st['L'] * SC, [h * SC * SCV for h in hs0], [w * SC * 0.95 for w in ws0]; ot, mh, mt = [v * SC * SCS for v in st['sole']]; sp = st['spring'] * SC; n = len(T)
    xs = [(t - 0.5) * Lg for t in T]
    yb = lambda t: sp * max(0.0, (t - 0.72) / 0.28) ** 2
    ym = lambda t: yb(t) * 0.75 + mh + (mt - mh) * t
    def nv(x, y, z): return bm.verts.new(g2b(x, y, z))
    def face(vs, uvs):
        f = bm.faces.new(vs)
        for lp, t in zip(f.loops, uvs): lp[uvl].uv = t
        return f
    def patch(i): return uv(i * 64 + 32, (TX.PATCH_Y[0] + TX.PATCH_Y[1]) / 2)   # 0 鞋帶、1 鞋舌、2 內裡、3 大底
    # 鞋底：大底、中底三圈（外緣比鞋面寬 5 mm）
    sel = [0, 2, 4, 6, 8]
    ol = [(xs[0] - 0.007, 0.0, 0.0)] + [(xs[i], Ws[i] + 0.005, T[i]) for i in sel] + [(xs[-1] + 0.008, 0.0, 1.0)] + [(xs[i], -(Ws[i] + 0.005), T[i]) for i in reversed(sel)]
    rings = [[nv(x, f(t), z) for (x, z, t) in ol] for f in (yb, lambda t: yb(t) + ot, ym)]
    m_ = len(ol); ys = [(TX.OUT_Y[1], TX.OUT_Y[0]), (TX.MID_Y[1], TX.MID_Y[0])]
    for lv in range(2):
        for i in range(m_):
            j = (i + 1) % m_; u0, u1 = i / m_ * 255, (i + 1) / m_ * 255; ya, yb_ = ys[lv]
            face([rings[lv][i], rings[lv][j], rings[lv + 1][j], rings[lv + 1][i]], [uv(u0, ya), uv(u1, ya), uv(u1, yb_), uv(u0, yb_)])
    face(list(reversed(rings[0])), [patch(3)] * m_)   # 中底的上蓋在鞋裡面看不到：不做
    # 鞋面：7 個斷面、每個 8 點；第 j 段對到圖集的列（右側 0–2、鞋口 3、左側 4–6、底 7）
    R = []
    for i in range(n):
        w, h, y0 = Ws[i], Hs[i], ym(T[i]) - 0.003
        dip = {0: 0.5, 1: 0.55, 2: 0.66, 3: 0.9}.get(i, 1.0)   # 鞋口：後半段的上緣往下凹（看得到內裡）
        R.append([nv(xs[i], y0 + yy * h * (dip if k_ in (3, 4) else 1.0), zz * w * (0.8 if (k_ in (3, 4) and dip < 1) else 1.0)) for k_, (zz, yy) in enumerate(PROF)])
    bd = TX.UP_Y1 / 8.0
    VY = {0: (3, 2), 1: (2, 1), 2: (1, 0), 3: (3, 4), 4: (7, 6), 5: (6, 5), 6: (5, 4), 7: (7.2, 7.8)}
    U = lambda t: 4 + t * 248
    for i in range(n - 1):
        for j in range(7):   # 第 7 段（鞋面的底）被鞋底蓋住：不做
            j2 = (j + 1) % 8; ya, yb_ = VY[j][0] * bd, VY[j][1] * bd; ua, ub = U(T[i]), U(T[i + 1])
            face([R[i][j], R[i][j2], R[i + 1][j2], R[i + 1][j]], [uv(ua, ya), uv(ua, yb_), uv(ub, yb_), uv(ub, ya)])
    face(list(reversed(R[0])), [uv(6, 1.5 * bd)] * 8); face(list(R[-1]), [uv(250, 1.5 * bd)] * 8)
    def top_at(t):
        for i in range(n - 1):
            if T[i] <= t <= T[i + 1]:
                u = (t - T[i]) / (T[i + 1] - T[i]); return ym(t) - 0.003 + Hs[i] * (1 - u) + Hs[i + 1] * u, Ws[i] * (1 - u) + Ws[i + 1] * u
        return ym(t) + Hs[-1], Ws[-1]
    # 鞋舌（往後翹）
    tt = T[3] - 0.04; xt = (tt - 0.5) * Lg; yt, wt = top_at(tt)
    q = [(xt - 0.004, yt - 0.014), (xt + 0.012, yt - 0.014), (xt - 0.006, yt + 0.012), (xt - 0.02, yt + 0.01)]
    vs = [nv(x, y, z) for z in (-0.34 * wt, 0.34 * wt) for (x, y) in q]
    for a in ((0, 1, 2, 3), (7, 6, 5, 4), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)): face([vs[i] for i in a], [patch(1)] * 4)
    # 鞋帶：三條橫跨的細條
    la, lb = st['lace']
    for f_ in (0.5,):
        t = la + (lb - la) * f_; x = (t - 0.5) * Lg; y, w = top_at(t)
        for fc in L.bm_box(bm, x - 0.005, x + 0.005, y - 0.002, y + 0.005, -0.52 * w, 0.52 * w):
            for lp in fc.loops: lp[uvl].uv = patch(0)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(f'{P}shoe_{style}_{k}'); bm.to_mesh(me); bm.free(); me.materials.append(M['shoe'])
    ob = bpy.data.objects.new('_tmp', me); B.scene().collection.objects.link(ob); L.smooth_mesh(ob, angle=1.05); bpy.data.objects.remove(ob)
    return me


for s_ in STY:
    for k in range(4): SHOES[(s_, k)] = shoe_mesh(s_, k)
SHOE_N = [0]
SHOE_PAR = {}
SHOE_PAR_POS = {'left': (X0 + 0.3, 0.0, -0.85), 'right': (X1 - 0.3, 0.0, -1.45), 'front': (-1.2, 0.0, Z1 - 0.4), None: (0.0, 0.0, 0.0)}


def put_shoe(style, k, x, y, z, ry, side=None):
    """instancing 的鞋：掛在每一面牆自己的空節點底下（匯出器合成 EXT_mesh_gpu_instancing 節點，名字＝父節點名＋序號→遊戲 /WALL_/ 認得）"""
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


it = {}
for i_ in LAY['items']: it.setdefault(i_['kind'], []).append(i_)
rs = random.Random(77)
WHITE, CREAM = '#efe9de', '#ecdcc2'
BOXC = [('#efede7', '#e1ded6'), ('#b9bdc2', '#a9adb3'), ('#5e636b', '#53575e'), ('#c4a27a', '#b5946e'), ('#34405e', '#2b3550'), ('#c4583a', '#b04c32')]   # v2：多兩個品牌色（深藍、磚橘）
# v2（LAWWW2 11-14 P2：鞋盒牆不要一樣大的白方塊）：每個顏色一組 ambientCG Cardboard001（盒身、盒蓋各一個顏色）；盒蓋另外一塊、比盒身大 3 mm；大小、顏色錯開，有的蓋子推開一點
#   一個材質（Cardboard001 × 頂點色）：每一面牆組只多盒身、盒蓋兩個網格（每個顏色各一個網格的話，淡出的牆節點 23 → 47、多 24 個 draw call）
M['sbv'] = K.vc_tex(f'{P}shoebox', 'Cardboard001', maps=('diff',), vary=0.05, tile=0.3, rough_value=0.8, res=256)

# ---------------- 地板、天花板、外牆 ----------------
Mesh(P + 'floor', M['floor']).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(root)
ce = Mesh(P + 'ceiling', M['paint']); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(root)   # 平頂（牆的材質、單面朝下＝剖面視角）


def wall_box(side, key, a0, a1, y0, y1, t0=0.0, t1=WT):
    m = wm(side, key)
    if side == 'back': m.box(a0, a1, y0, y1, Z0 + t0, Z0 + t1)
    elif side == 'front': m.box(a0, a1, y0, y1, Z1 - t1, Z1 - t0)
    elif side == 'left': m.box(X0 + t0, X0 + t1, y0, y1, a0, a1)
    else: m.box(X1 - t1, X1 - t0, y0, y1, a0, a1)


for side in ('back', 'left', 'right'):
    a0, a1 = (X0, X1) if side == 'back' else (Z0, Z1)
    wall_box(side, 'paint', a0, a1, 0.0, H)
    m = wm(side, 'vc'); KICK = '#b49a7c'   # 踢腳板（木色，邊上有一點髒）
    if side == 'back': m.cbox(a0, a1, 0.0, 0.08, ZI0, ZI0 + 0.015, KICK)
    elif side == 'left': m.cbox(XI0, XI0 + 0.015, 0.0, 0.08, a0, a1, KICK)
    else: m.cbox(XI1 - 0.015, XI1, 0.0, 0.08, a0, a1, KICK)

# 店面（+z）：西側整面櫥窗、東側兩扇玻璃門（外觀 dabu_ext）
FR = LAY['front']; sill, head = FR['sill'], FR['head']; dx, dw = FR['door']['x'], FR['door']['w']; dh = 2.4
ops = sorted([(a, b, 'win') for a, b in FR['windows']] + [(dx - dw / 2, dx + dw / 2, 'door')])
xs_ = [X0]
for a, b, kk in ops: xs_ += [a, b]
xs_.append(X1)
G = 0.0015   # 牆段之間留縫：相鄰方塊共用頂點會被 single_side 當成開口零件補反面（Cycles 變黑）
for i in range(0, len(xs_), 2):
    if xs_[i + 1] - xs_[i] > 1e-3: wall_box('front', 'paint', xs_[i] + G, xs_[i + 1] - G, 0.0, H)
fv = wm('front', 'vcm'); ALU = '#b9bcbe'
for a, b, kk in ops:
    top = dh if kk == 'door' else head; y0 = 0.0 if kk == 'door' else sill
    wall_box('front', 'paint', a + G, b - G, top, H)
    if kk == 'win': wall_box('front', 'paint', a + G, b - G, 0.0, sill); fv.cbox(a, b, sill - 0.02, sill + 0.04, Z1 - WT - 0.05, Z1 - 0.02, ALU)
    fv.cbox(a, b, top - 0.05, top + 0.02, Z1 - WT - 0.02, Z1 - 0.02, ALU)
    nseg = max(1, round((b - a) / 1.5))
    for j in range(nseg + 1): x = a + j * (b - a) / nseg; fv.cbox(x - 0.03, x + 0.03, y0, top, Z1 - WT - 0.02, Z1 - 0.02, ALU)
    if kk == 'door':
        fv.cbox(a + 0.03, b - 0.03, 0.0, 0.05, Z1 - WT - 0.01, Z1 - 0.03, ALU)
        for hx in (dx - 0.1, dx + 0.1): painted(fv, '#a9adb0', lambda hx=hx: fv.cyl((hx, 0.8, Z1 - WT - 0.07), (hx, 1.6, Z1 - WT - 0.07), 0.015, seg=8))   # 長門把
        pq('front', 'hours', face_quad(dx + 0.45, 1.5, Z1 - WT - 0.075, 0.26, 0.19, '-z'))   # 門上的營業時間（從店裡看是背面，紙貼在玻璃裡面）
    wm('front', 'glass').quad([(b, y0 + 0.02, Z1 - 0.07), (a, y0 + 0.02, Z1 - 0.07), (a, top - 0.03, Z1 - 0.07), (b, top - 0.03, Z1 - 0.07)])
uv_quad(None, 'print', M['print'], face_quad(dx, 0.006, Z1 - WT - 0.55, 1.5, 0.75, '+y'), PU('doormat'))   # 門口地墊

# ---------------- 鞋牆（左牆五格、右牆三格）：淺木層板、層板下燈條、白隔板、米色背板、下櫃木門、上面一排海報 ----------------
SHELF_T = [0.60, 1.01, 1.42, 1.83, 2.24]; CAP = 2.65; PST = (2.74, 3.30)


def shoe_wall(sw):
    side = sw['side']; sgn = -1 if side == 'left' else 1
    wx = XI0 if side == 'left' else XI1
    fx = (X0 + sw['depth']) if side == 'left' else (X1 - sw['depth'])
    z0, z1, nb = sw['z0'], sw['z1'], sw['bays']; bw = (z1 - z0) / nb
    vc, wd, led = wm(side, 'vc'), wm(side, 'wood'), wm(side, 'led')
    lo, hi = min(wx, fx), max(wx, fx); nrm = '+x' if side == 'left' else '-x'
    vc.cbox(lo + (0.0 if side == 'left' else 0.05), hi - (0.05 if side == 'left' else 0.0), 0.0, 0.07, z0, z1, '#3a3430')   # 內縮踢腳
    for b in range(nb):
        za = z0 + b * bw
        for dz in range(2):   # 下櫃：每格兩扇木門＋把手溝
            ca, cb = za + 0.03 + dz * (bw - 0.06) / 2, za + 0.03 + (dz + 1) * (bw - 0.06) / 2 - 0.01
            wd.rbox(min(fx, fx + sgn * 0.02), max(fx, fx + sgn * 0.02), 0.08, 0.57, ca, cb, r=0.006, seg=1)
            vc.cbox(min(fx, fx - sgn * 0.012), max(fx, fx - sgn * 0.012), 0.52, 0.528, (ca + cb) / 2 - 0.15, (ca + cb) / 2 + 0.15, '#8a7258')
    vc.cbox(lo + 0.002, hi - 0.002, 0.07, 0.575, z0, z1, '#d8c7ad')
    vc.cbox(min(wx, wx - sgn * 0.012), max(wx, wx - sgn * 0.012), 0.6, CAP, z0, z1, CREAM)    # 背板
    for b in range(nb + 1):
        z = z0 + b * bw; vc.crbox(lo, hi + (0.012 if side == 'left' else 0), 0.0 if b in (0, nb) else 0.58, CAP + 0.03, z - 0.022, z + 0.022, WHITE, r=0.006)
    for t in SHELF_T:
        wd.rbox(lo + 0.01, hi - 0.01, t - 0.028, t, z0 + 0.02, z1 - 0.02, r=0.006, seg=1)
        led.box(min(fx + sgn * 0.04, fx + sgn * 0.025), max(fx + sgn * 0.04, fx + sgn * 0.025), t + 0.37, t + 0.379, z0 + 0.03, z1 - 0.03)   # 上一層層板底下的燈條
    vc.crbox(lo, hi + (0.02 if side == 'left' else -0.02) * 0, CAP, CAP + 0.05, z0, z1, WHITE, r=0.008)
    # 海報（白框＋印刷）
    for b in range(nb):
        za, zb = z0 + b * bw + 0.06, z0 + (b + 1) * bw - 0.06; zc = (za + zb) / 2
        vc.crbox(min(wx, wx - sgn * 0.04), max(wx, wx - sgn * 0.04), PST[0], PST[1], za, zb, '#f3efe8', r=0.008)
        pq(side, f"poster{sw['posters'][b]}", face_quad(wx - sgn * 0.0405, (PST[0] + PST[1]) / 2, zc, (zb - za) - 0.07, PST[1] - PST[0] - 0.07, nrm))
    # 鞋：每層三雙，鞋頭朝店門（+z）、往走道轉一點；每層一張價格卡
    sx = (wx + fx) / 2 + sgn * 0.02
    for b in range(nb):
        rows = sw['rows'][b]
        for r_, t in enumerate(SHELF_T):
            style = rows[r_]
            for q in range(3):
                z = z0 + b * bw + bw * (q + 0.5) / 3 + rs.uniform(-0.02, 0.02)
                ry = -math.pi / 2 + (-0.42 if side == 'left' else 0.42) + rs.uniform(-0.05, 0.05)   # 鞋頭朝店門（+z）、往牆裡斜 24°：從店中間看是側面（參考圖每一雙都是側面朝人）
                put_shoe(style, rs.randrange(4), sx, t, z, ry, side)
            # 價格卡：層板前緣，斜立的小卡
            q = rs.randrange(3); zc = z0 + b * bw + bw * (q + 0.5) / 3 + 0.17; xc = fx + sgn * 0.035
            cell = f'price{rs.randrange(12)}'
            if side == 'left': pts = [(xc, t + 0.002, zc + 0.045), (xc, t + 0.002, zc - 0.045), (xc - 0.012, t + 0.056, zc - 0.045), (xc - 0.012, t + 0.056, zc + 0.045)]
            else: pts = [(xc, t + 0.002, zc - 0.045), (xc, t + 0.002, zc + 0.045), (xc + 0.012, t + 0.056, zc + 0.045), (xc + 0.012, t + 0.056, zc - 0.045)]
            pq(side, cell, pts)


for sw in LAY['shoeWalls']: shoe_wall(sw)
lw = LAY['shoeWalls'][0]
pq('left', 'note2', face_quad(X0 + lw['depth'] + 0.002, 2.42, -1.5, 0.2, 0.15, '+x'), 2)            # 「本週新到 籃球鞋 →」貼在隔板上
# 左牆前段（鞋牆和櫥窗中間）：直條木板＋一張大海報、一盆大盆栽
for k in range(14): z = lw['z1'] + 0.05 + k * 0.2; wm('left', 'wood').box(XI0, XI0 + 0.02, 0.0, 2.65, z + 0.004, z + 0.196)
wm('left', 'vc').crbox(XI0 + 0.02, XI0 + 0.06, 1.2, 2.3, 3.2, 4.9, '#f3efe8', r=0.008)
pq('left', 'poster3', face_quad(XI0 + 0.0605, 1.75, 4.05, 1.62, 1.02, '+x'))

# ---------------- 隔間牆（正後方）：落地鏡、襪子掛架、毛巾桶、鞋拔；櫃台區：側牆鞋盒、後牆鞋盒＋招牌、員工門 ----------------
PT = LAY['partition']; PZ = PT['z']; PX1 = PT['x1']; PTT = PT['t']
bk = wm('back', 'paint')
bk.box(XI0 + G, PX1, 0.0, H, PZ - PTT, PZ)                       # 隔間牆
bk.box(PX1 - PTT, PX1, 0.0, H, ZI0 + G, PZ - PTT - G)             # 櫃台區左側牆
bk.box(PX1 + G, XI1 - G, 3.06, H, PZ - PTT, PZ)                   # 櫃台區上方的垂壁
wm('back', 'vc').cbox(XI0, PX1, 0.0, 0.08, PZ, PZ + 0.015, '#b49a7c')
BZ = PZ
mr = it['mirror'][0]; mx, mw, mh_ = mr['x'], mr['w'], mr['h']; wb = wm('back', 'wood'); mxf = Xf(mx, BZ + 0.09, 0.0)
tilt = Matrix.Rotation(-0.06, 4, 'X')
def mbox(x0, x1, y0, y1, z0, z1):
    bm = L.rbox_bm(x1 - x0, y1 - y0, z1 - z0, 0.01, 1); wb.add_bm(bm, Matrix.Translation(g2b(mx, 0, BZ + 0.1)) @ tilt @ Matrix.Translation(g2b((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2))); bm.free()
for (a, b_, c, d_) in ((-mw / 2, -mw / 2 + 0.06, 0.0, mh_), (mw / 2 - 0.06, mw / 2, 0.0, mh_), (-mw / 2, mw / 2, 0.0, 0.07), (-mw / 2, mw / 2, mh_ - 0.06, mh_)): mbox(a, b_, c, d_, -0.03, 0.02)
_mq = [Vector(g2b(x, y, 0.021)) for (x, y) in ((-mw / 2 + 0.06, 0.07), (mw / 2 - 0.06, 0.07), (mw / 2 - 0.06, mh_ - 0.06), (-mw / 2 + 0.06, mh_ - 0.06))]
_mT = Matrix.Translation(g2b(mx, 0, BZ + 0.1)) @ tilt
_mp = [tuple((_mT @ v)) for v in _mq]; _mp = [(v[0], v[2], -v[1]) for v in _mp]
pq('back', 'mirror', _mp)
pq('back', 'note6', face_quad(-2.95, 1.55, BZ + 0.002, 0.2, 0.15, '+z'), 2)                        # 「請勿在店內試跑 :)」
# 襪子掛架：白色洞洞板＋兩排掛勾、牛皮紙吊卡＋一雙襪子；上面一層小木架放黃金葛
sk = it['sock_rack'][0]; sxc, sw_ = sk['x'], sk['w']; wv = wm('back', 'vc'); wmv = wm('back', 'vcm')
wv.crbox(sxc - sw_ / 2, sxc + sw_ / 2, 1.05, 2.3, BZ, BZ + 0.02, '#f2efe9', r=0.005)
for j in range(13):
    for i in range(6): wv.cbox(sxc - 0.25 + i * 0.1 - 0.005, sxc - 0.25 + i * 0.1 + 0.005, 1.1 + j * 0.09, 1.11 + j * 0.09, BZ + 0.02, BZ + 0.022, '#cfc9c0')
SOCK = ['#f4f4f2', '#f4f4f2', '#f4f4f2', '#2a2a2c', '#f4f4f2', '#e4e6e8', '#f4f4f2', '#2a2a2c']
for r_ in range(2):
    for c_ in range(4):
        hx, hy = sxc - 0.21 + c_ * 0.14, 2.12 - r_ * 0.52; col = SOCK[r_ * 4 + c_]
        painted(wmv, '#a9adb0', lambda hx=hx, hy=hy: wmv.cyl((hx, hy, BZ + 0.02), (hx, hy + 0.012, BZ + 0.12), 0.004, seg=4))
        pq('back', f'sockcard{(r_ * 4 + c_) % 4}', face_quad(hx, hy - 0.02, BZ + 0.112, 0.055, 0.08, '+z'), 1)
        for s_ in (-0.02, 0.02):
            wv.crbox(hx + s_ - 0.018, hx + s_ + 0.018, hy - 0.32, hy - 0.06, BZ + 0.095, BZ + 0.11, col, r=0.006, seg=1)   # 襪筒
            wv.crbox(hx + s_ - 0.018, hx + s_ + 0.045, hy - 0.37, hy - 0.3, BZ + 0.095, BZ + 0.11, col, r=0.01, seg=1)      # 腳掌
            for yy in (hy - 0.1, hy - 0.125):
                wv.cbox(hx + s_ - 0.018, hx + s_ + 0.018, yy - 0.008, yy, BZ + 0.1105, BZ + 0.1115, '#2f4a7a' if col != '#2a2a2c' else '#d8d8d4')   # 襪口條紋
wb.rbox(sxc - 0.36, sxc + 0.36, 2.36, 2.39, BZ, BZ + 0.22, r=0.006, seg=1)
for s_ in (-0.28, 0.28): wv.cbox(sxc + s_ - 0.01, sxc + s_ + 0.01, 2.24, 2.36, BZ, BZ + 0.18, '#2a2a2c')
pq('back', 'note1', face_quad(sxc, 0.93, BZ + 0.002, 0.22, 0.165, '+z'), 2)                         # 「運動襪 3雙 NT$299」
# 毛巾桶（鐵網）
tb = it['towel_bin'][0]; tx_, tz_, tr = tb['x'], tb['z'], tb['r']
for yy in (0.02, 0.3, 0.56):
    painted(VCM, '#2c2c2e', lambda yy=yy: Xf(tx_, tz_).lathe(VCM, [(tr - 0.004, 0), (tr + 0.004, 0), (tr + 0.004, 0.012), (tr - 0.004, 0.012)], 0, yy, 0, seg=16))
for k in range(18):
    a = 2 * math.pi * k / 18; painted(VCM, '#2c2c2e', lambda a=a: VCM.cyl((tx_ + math.cos(a) * tr * 0.92, 0.02, tz_ + math.sin(a) * tr * 0.92), (tx_ + math.cos(a) * tr, 0.57, tz_ + math.sin(a) * tr), 0.003, seg=4))
painted(VCM, '#2c2c2e', lambda: Xf(tx_, tz_).lathe(VCM, [(0, 0), (tr * 0.93, 0), (tr * 0.93, 0.02), (0, 0.02)], 0, 0.0, 0, seg=16))
for k, (ox, oz, hh) in enumerate(((-0.06, -0.05, 0.66), (0.06, -0.04, 0.63), (0.0, 0.07, 0.68), (-0.08, 0.07, 0.6), (0.09, 0.08, 0.62))):
    painted(VC, '#f6f5f1' if k % 3 else '#e4e6e8', lambda ox=ox, oz=oz, hh=hh: VC.cyl((tx_ + ox, 0.05, tz_ + oz), (tx_ + ox * 1.1, hh, tz_ + oz * 1.1), 0.05, seg=10))
# 長鞋拔（木座）
sh = it['shoehorn'][0]; hx_, hz_ = sh['x'], sh['z']; ww = acc('wood')
ww.rbox(hx_ - 0.1, hx_ + 0.1, 0.0, 0.04, hz_ - 0.1, hz_ + 0.1, r=0.01, seg=1)
ww.rbox(hx_ - 0.035, hx_ + 0.035, 0.04, 0.82, hz_ - 0.085, hz_ - 0.045, r=0.008, seg=1)
for k in range(5):
    y0, y1 = 0.1 + k * 0.15, 0.25 + k * 0.15; wdt = 0.022 if k < 4 else 0.032
    VCM.crbox(hx_ - wdt, hx_ + wdt, y0, y1, hz_ - 0.04, hz_ - 0.03, '#e6e6e2', r=0.003)
VCM.cbox(hx_ - 0.004, hx_ + 0.004, 0.7, 0.98, hz_ - 0.042, hz_ - 0.03, '#b23a2e')   # 掛繩


# 鞋盒層架（三面）：原木層板、白隔板；盒子是盒身＋盒蓋，朝外那一面貼標籤（印刷）
rb = random.Random(31)
def box_wall(face, a0, a1, depth, top, sh_n=6):
    """face：'back'（z＝ZI0、沿 x、朝 +z）、'side'（x＝PX1、沿 z、朝 +x）、'right'（x＝XI1、沿 z、朝 −x）"""
    grp = 'right' if face == 'right' else 'back'; vc, wd = wm(grp, 'vc'), wm(grp, 'wood')
    def T_(u0, u1, y0, y1, d0, d1):
        if face == 'back': return (u0, u1, y0, y1, ZI0 + d0, ZI0 + d1)
        if face == 'side': return (PX1 + d0, PX1 + d1, y0, y1, u0, u1)
        return (XI1 - d1, XI1 - d0, y0, y1, u0, u1)
    def fpt(u, y, d): return (u, y, ZI0 + d) if face == 'back' else ((PX1 + d, y, u) if face == 'side' else (XI1 - d, y, u))
    nrm = {'back': '+z', 'side': '+x', 'right': '-x'}[face]
    nb = max(1, round((a1 - a0) / 0.9)); bw = (a1 - a0) / nb; ys = [0.08 + k * (top - 0.08) / sh_n for k in range(sh_n + 1)]
    # v2：整座層架離牆 2 mm（原本背板、直板、層板、踢腳的背面和牆面在同一平面：place_gate 疊面 5.1／4.8／4.5 m²）
    vc.cbox(*T_(a0, a1, 0.0, 0.08, 0.002, depth - 0.03), '#3a3430')
    for y in ys: wd.rbox(*T_(a0, a1, y - 0.024, y, 0.002, depth), r=0.005, seg=1)
    for b in range(nb + 1): u = a0 + b * bw; vc.cbox(*T_(u - 0.018, u + 0.018, 0.0, top, 0.002, depth), WHITE)
    vc.cbox(*T_(a0, a1, 0.08, top, 0.002, 0.012), '#e9dfcf')
    for b in range(nb):
        for y in ys[:-1]:
            gap = ys[1] - ys[0]; ncol = 3; cw = (bw - 0.04) / ncol
            for c in range(ncol):
                if rb.random() < 0.06: continue   # 空一格（被拿走了）
                stack = 2 if gap > 0.3 and rb.random() > 0.3 else 1
                u0c = a0 + b * bw + 0.02 + c * cw + 0.01; u1c = u0c + cw - 0.02; yb0 = y
                for s_ in range(stack):
                    ci = rb.choice([0, 0, 0, 1, 1, 2, 3, 4, 5]); h_ = rb.uniform(0.1, 0.125); wc_ = rb.uniform(0.0, 0.025)
                    u0 = u0c + wc_ / 2 + rb.uniform(-0.004, 0.004); u1 = u0 + (u1c - u0c) - wc_
                    dd = depth - 0.03 - rb.uniform(0, 0.03)
                    if yb0 + h_ + 0.001 > y + gap - 0.02: break
                    wm(grp, 'sbv').cbox(*T_(u0, u1, yb0, yb0 + h_ - 0.028, 0.016, dd), BOXC[ci][0])                        # 盒身
                    ofs = rb.uniform(0.02, 0.05) if rb.random() < 0.15 else 0.0                                            # 有的蓋子推開一點（店員剛拿過）
                    wm(grp, 'sbv').cbox(*T_(u0 - 0.003, u1 + 0.003, yb0 + h_ - 0.03, yb0 + h_, 0.013 + ofs, dd + 0.003 + ofs), BOXC[ci][1])   # 盒蓋
                    uc = (u0 + u1) / 2; cx_, cy_, cz_ = fpt(uc, yb0 + (h_ - 0.03) / 2, dd + 0.0015); hb_ = h_ - 0.034
                    pq(grp, f'boxend{ci % 4 + 4 * rb.randrange(4)}', face_quad(cx_, cy_, cz_, u1 - u0 - 0.004, hb_, nrm), 2)
                    yb0 += h_ + 0.004


bws = {b['side']: b for b in it['box_wall']}
box_wall('side', bws['side']['z0'] + WT, bws['side']['z1'], bws['side']['depth'], 2.95, 7)
box_wall('back', bws['back']['x0'] + bws['side']['depth'], bws['back']['x1'], bws['back']['depth'], bws['back']['top'], 4)
box_wall('right', bws['right']['z0'], bws['right']['z1'], bws['right']['depth'], 2.3, 6)
# 招牌：木板（印刷：直條木紋＋「大步球鞋」＋步紋），兩側接直條木板到右端
nb_ = it['name_board'][0]; sx0, sx1 = nb_['x'] - nb_['w'] / 2, nb_['x'] + nb_['w'] / 2; sy0, sy1 = nb_['y'] - nb_['h'] / 2, nb_['y'] + nb_['h'] / 2
wm('back', 'wood').rbox(sx0, sx1, sy0, sy1, ZI0, ZI0 + 0.04, r=0.01, seg=1)
pq('back', 'sign', face_quad(nb_['x'], nb_['y'], ZI0 + 0.0405, nb_['w'] - 0.02, nb_['h'] - 0.02, '+z'), 1)
for k_ in range(12):
    x0_ = sx1 + 0.01 + k_ * 0.39
    if x0_ + 0.38 < XI1 and not (it['staff_door'][0]['x'] - 0.6 < x0_ + 0.19 < it['staff_door'][0]['x'] + 0.6): pq('back', 'woodpanel', face_quad(x0_ + 0.19, (sy0 + sy1) / 2, ZI0 + 0.002, 0.38, sy1 - sy0, '+z'), 1)
# 員工門（後牆右端，關著）
sd = it['staff_door'][0]; dx0, dx1 = sd['x'] - sd['w'] / 2, sd['x'] + sd['w'] / 2
wm('back', 'vc').crbox(dx0 - 0.05, dx1 + 0.05, 0.0, 2.15, ZI0, ZI0 + 0.03, '#d8d2c8', r=0.008)
wm('back', 'vc').crbox(dx0, dx1, 0.0, 2.1, ZI0 + 0.03, ZI0 + 0.06, '#c9c3b8', r=0.006)
painted(wm('back', 'vcm'), '#a9adb0', lambda: wm('back', 'vcm').cyl((dx0 + 0.08, 1.02, ZI0 + 0.06), (dx0 + 0.08, 1.02, ZI0 + 0.11), 0.02, seg=8))
pq('back', 'staffdoor', face_quad(sd['x'], 1.6, ZI0 + 0.0615, 0.3, 0.15, '+z'), 1)
pq('back', 'calendar', face_quad(dx0 - 0.35, 1.45, ZI0 + 0.002, 0.3, 0.41, '+z'), 1)
# 櫃台區側牆上的壓條走線（插座→天花板）＋插座蓋
VC.cbox(PX1 + bws['side']['depth'] + 0.002, PX1 + bws['side']['depth'] + 0.014, 0.25, 3.06, -4.3, -4.27, '#ece6dc')
VC.cbox(PX1 + bws['side']['depth'] + 0.002, PX1 + bws['side']['depth'] + 0.012, 0.22, 0.32, -4.33, -4.24, '#f2efe9')

# ---------------- 收銀台、吊燈 ----------------
ct = it['counter'][0]; cx_, cz_, cw_, cd_, chh = ct['x'], ct['z'], ct['w'], ct['d'], ct['h']
x0c, x1c, z0c, z1c = cx_ - cw_ / 2, cx_ + cw_ / 2, cz_ - cd_ / 2, cz_ + cd_ / 2
VC.cbox(x0c + 0.04, x1c - 0.04, 0.0, 0.07, z0c + 0.04, z1c - 0.04, '#3a3430')
acc('white').rbox(x0c, x1c, 0.07, 0.84, z0c, z1c, r=0.01, seg=2)
uv_quad(None, 'print', M['print'], face_quad(cx_, 0.455, z1c + 0.0015, cw_ - 0.02, 0.77, '+z'), PU('counterfront', 2))
acc('led').box(x0c + 0.02, x1c - 0.02, 0.84, 0.852, z1c - 0.03, z1c + 0.004)
acc('wood').rbox(x0c - 0.02, x1c + 0.02, 0.852, 0.95, z0c + 0.02, z1c + 0.06, r=0.012, seg=2)
acc('wood').rbox(x0c - 0.03, x1c + 0.03, 0.95, 0.99, z0c - 0.02, z1c + 0.07, r=0.012, seg=2)
pq(None, 'note3', face_quad(x0c + 0.45, 0.62, z1c + 0.003, 0.24, 0.18, '+z'), 2)                   # 「出示學生證 全面95折」
pq(None, 'paysticker', face_quad(x1c - 0.5, 0.7, z1c + 0.003, 0.22, 0.11, '+z'), 1)
# 螢幕（朝店員、往客人轉一點）、刷卡機、筆筒、紙提袋、小盆栽
mxf = Xf(cx_ - 0.75, cz_ - 0.05, math.pi - 0.45)
for a_ in [(-0.1, 0.1, 0.99, 1.0, -0.07, 0.07), (-0.02, 0.02, 1.0, 1.17, -0.04, 0.0), (-0.25, 0.25, 1.09, 1.42, -0.015, 0.015)]: mxf.crbox(VC, *a_, '#2a2a2c', r=0.004)
pts = mxf.quad(0.0, 1.255, 0.0155, 0.46, 0.29); uv_quad(None, 'print', M['print'], pts, PU('monitor'))
pxf = Xf(cx_ - 1.15, cz_ + 0.12, 0.3)
pxf.crbox(VC, -0.045, 0.045, 0.99, 1.01, -0.08, 0.08, '#1e1f22', r=0.006); pxf.crbox(VC, -0.04, 0.04, 1.01, 1.06, -0.07, 0.02, '#1e1f22', r=0.006)
pts = [pxf.p(-0.033, 1.061, 0.012), pxf.p(0.033, 1.061, 0.012), pxf.p(0.033, 1.061, -0.06), pxf.p(-0.033, 1.061, -0.06)]
uv_quad(None, 'print', M['print'], pts, PU('reader'))
painted(VC, '#d9cfc0', lambda: Xf(cx_ - 0.35, cz_ - 0.12).lathe(VC, [(0, 0), (0.035, 0), (0.035, 0.1), (0, 0.1)], 0, 0.99, 0, seg=10))
for k in range(4): painted(VC, ['#2f58a6', '#2a2a2c', '#b3262e', '#2a2a2c'][k], lambda k=k: VC.cyl((cx_ - 0.36 + (k % 2) * 0.02, 1.0, cz_ - 0.13 + (k // 2) * 0.02), (cx_ - 0.36 + (k % 2) * 0.03, 1.15, cz_ - 0.13 + (k // 2) * 0.03), 0.004, seg=4))
bxf = Xf(cx_ + 0.3, cz_ - 0.1, 0.15)   # 紙提袋（印刷：大步球鞋）
bxf.crbox(VC, -0.16, 0.16, 0.99, 1.31, -0.06, 0.06, '#e6dccb', r=0.004, seg=1)
uv_quad(None, 'print', M['print'], bxf.quad(0.0, 1.15, 0.0615, 0.31, 0.3), PU('shoebag'))
for s_ in (-0.08, 0.08): painted(VC, '#b89a72', lambda s_=s_: VC.cyl(bxf.p(s_, 1.31, 0.0), bxf.p(s_, 1.38, 0.0), 0.005, seg=4))
acc('shoebox').rbox(x1c - 0.6, x1c - 0.3, 0.99, 1.1, cz_ - 0.12, cz_ + 0.08, r=0.004, seg=1); acc('shoebox').rbox(x1c - 0.605, x1c - 0.295, 1.1, 1.124, cz_ - 0.125, cz_ + 0.085, r=0.003, seg=1)   # 打開過的鞋盒
pd = it['pendant'][0]
painted(VCM, '#2a2a2c', lambda: VCM.cyl((pd['x'], H, pd['z']), (pd['x'], pd['y'] + 0.2, pd['z']), 0.004, seg=4))
painted(VC, '#f3f0ea', lambda: Xf(pd['x'], pd['z']).lathe(VC, [(0.02, 0.22), (0.05, 0.215), (0.15, 0.16), (0.21, 0.06), (0.23, 0.0), (0.22, 0.0)], 0, pd['y'], 0, seg=24))
acc('led').sphere((pd['x'], pd['y'] + 0.05, pd['z']), 0.05, seg=10, rings=6)
CL.glow(root, 'pendant', pd['x'], pd['y'] - 0.05, pd['z'], color='rgba(255,226,180,1)', size=1.4, day=0.25, night=1.0)
CL.glow(root, 'counter_led', cx_, 0.84, z1c + 0.05, color='rgba(255,214,160,1)', size=1.2, day=0.2, night=0.9)


# ---------------- 長凳（原木腳、下層木條、灰布格子座墊）＋地毯 ----------------
def cushion(x, z, w, d, y0, y1, ry):
    """格子縫線的座墊（物件座標 w 沿 x、d 沿 z，轉 ry）"""
    xf = Xf(x, z, ry); nx, nz = 10, 3; bm = bmesh.new(); grid = {}
    for i in range(nx + 1):
        for j in range(nz + 1):
            u, v = i / nx, j / nz; edge = i in (0, nx) or j in (0, nz)
            yy = y1 - (0.024 if edge else (0.014 if (i % 2 == 0 and j % 1 == 0 and 0 < j < nz) else 0.0))
            grid[(i, j)] = bm.verts.new(g2b(*xf.p(-w / 2 + u * w, yy, -d / 2 + v * d)))
    for i in range(nx):
        for j in range(nz): bm.faces.new([grid[(i, j)], grid[(i + 1, j)], grid[(i + 1, j + 1)], grid[(i, j + 1)]])
    ring = [grid[(i, 0)] for i in range(nx)] + [grid[(nx, j)] for j in range(nz)] + [grid[(i, nz)] for i in range(nx, 0, -1)] + [grid[(0, j)] for j in range(nz, 0, -1)]
    low = [bm.verts.new(Vector((v.co.x, v.co.y, y0))) for v in ring]; nr = len(ring)
    for k in range(nr): bm.faces.new([ring[k], ring[(k + 1) % nr], low[(k + 1) % nr], low[k]])
    bm.faces.new(list(reversed(low))); bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    acc('fabric').add_bm(bm); bm.free()


for bn in it['bench']:
    xf = Xf(bn['x'], bn['z'], bn.get('ry', 0)); w, d = bn['w'], bn['d']; wd = acc('wood')
    for sx in (-w / 2 + 0.035, w / 2 - 0.035):
        for sz in (-d / 2 + 0.035, d / 2 - 0.035): xf.rbox(wd, sx - 0.028, sx + 0.028, 0.0, 0.385, sz - 0.028, sz + 0.028, r=0.006, seg=1)
    for sz in (-d / 2 + 0.035, d / 2 - 0.035): xf.rbox(wd, -w / 2 + 0.03, w / 2 - 0.03, 0.31, 0.385, sz - 0.018, sz + 0.018, r=0.005, seg=1)
    for sx in (-w / 2 + 0.035, w / 2 - 0.035): xf.rbox(wd, sx - 0.018, sx + 0.018, 0.31, 0.385, -d / 2 + 0.03, d / 2 - 0.03, r=0.005, seg=1)
    for sz in (-d / 2 + 0.035, d / 2 - 0.035): xf.rbox(wd, -w / 2 + 0.03, w / 2 - 0.03, 0.1, 0.13, sz - 0.015, sz + 0.015, r=0.004, seg=1)
    for k in range(9): sx = -w / 2 + 0.09 + k * (w - 0.18) / 8; xf.rbox(wd, sx - 0.022, sx + 0.022, 0.13, 0.148, -d / 2 + 0.05, d / 2 - 0.05, r=0.004, seg=1)   # 下層木條（橫向，參考圖）
    cushion(bn['x'], bn['z'], w - 0.005, d + 0.01, 0.385, bn['h'], bn.get('ry', 0))
# 長凳 A 旁邊地上：打開的鞋盒（包鞋紙）＋一雙正在試穿的籃球鞋
ob_x, ob_z = -2.45, -0.15
acc('shoebox').rbox(ob_x - 0.1, ob_x + 0.1, 0.0, 0.11, ob_z - 0.17, ob_z + 0.17, r=0.004, seg=1); acc('shoebox').rbox(ob_x - 0.36, ob_x - 0.14, 0.0, 0.024, ob_z - 0.175, ob_z + 0.175, r=0.003, seg=1)
VC.cbox(ob_x - 0.09, ob_x + 0.09, 0.11, 0.115, ob_z - 0.16, ob_z + 0.16, '#f4ecdc')
put_shoe('bb_high', 0, -2.4, 0.0, -0.62, 0.1 - math.pi / 2); put_shoe('bb_high', 0, -2.28, 0.0, -0.55, -0.15 - math.pi / 2)
rg = it['rug'][0]; rx0, rx1, rz0, rz1 = rg['x'] - rg['w'] / 2, rg['x'] + rg['w'] / 2, rg['z'] - rg['d'] / 2, rg['z'] + rg['d'] / 2; ry_ = 0.01
uv_quad(None, 'print', M['print'], [(rx0, ry_, rz1), (rx1, ry_, rz1), (rx1, ry_, rz0), (rx0, ry_, rz0)], PU('rug'))
# 地上的光斑（v2b）：午後的太陽從櫥窗照進來（往 −z、偏西），兩道斜的平行四邊形，一道落在地毯邊上、一道在櫃台前的走道（參考圖右下那片光）
for (x0_, x1_, za_, zb_, sk_) in ((-0.95, 0.15, 0.1, -2.3, -0.55), (-0.35, 0.45, -2.85, -4.15, -0.3)):
    uv_quad(None, 'sun', M['sun'], [(x0_, 0.016, za_), (x1_, 0.016, za_), (x1_ + sk_, 0.016, zb_), (x0_ + sk_, 0.016, zb_)], (0.0, 0.0, 1.0, 1.0))

# ---------------- 展示架（白檯面＋原木框，兩側鐵網籃）、落地盆栽 ----------------
ir = it['island_rack'][0]; ixf = Xf(ir['x'], ir['z']); iw, idp, ih = ir['w'], ir['d'], ir['h']; wd = acc('wood')
for sx in (-iw / 2 + 0.03, iw / 2 - 0.03):
    for sz in (-idp / 2 + 0.03, idp / 2 - 0.03): ixf.rbox(wd, sx - 0.022, sx + 0.022, 0.0, ih - 0.03, sz - 0.022, sz + 0.022, r=0.005, seg=1)
ixf.rbox(acc('white'), -iw / 2, iw / 2, ih - 0.03, ih, -idp / 2, idp / 2, r=0.008)
for yy in (0.12, 0.55): ixf.rbox(wd, -iw / 2 + 0.03, iw / 2 - 0.03, yy - 0.02, yy, -idp / 2 + 0.03, idp / 2 - 0.03, r=0.004, seg=1)
CANS = ['#f4f4f2', '#3c6ea0', '#dc7a3c', '#f4f4f2', '#3c3c42', '#e9e4da']
for side_ in (-1, 1):
    for k, yb_ in enumerate((0.62, 0.2)):   # 鐵網籃：外框＋直條
        x_out = side_ * (iw / 2 + 0.16); x_in = side_ * (iw / 2 + 0.01)
        for zz in (-0.38, 0.38): VCM.cbox(*sorted((ixf.p(x_in, 0, 0)[0], ixf.p(x_out, 0, 0)[0])), yb_ - 0.004, yb_ + 0.004, ir['z'] + zz - 0.004, ir['z'] + zz + 0.004, '#2c2c2e')
        for yy in (yb_, yb_ + 0.2): VCM.cbox(ixf.p(x_out, 0, 0)[0] - 0.004, ixf.p(x_out, 0, 0)[0] + 0.004, yy - 0.004, yy + 0.004, ir['z'] - 0.38, ir['z'] + 0.38, '#2c2c2e')
        for j in range(8):
            zz = ir['z'] - 0.38 + j * 0.76 / 7; xo = ixf.p(x_out, 0, 0)[0]
            VCM.cbox(xo - 0.003, xo + 0.003, yb_, yb_ + 0.2, zz - 0.002, zz + 0.002, '#2c2c2e')
            VCM.cbox(*sorted((ixf.p(x_in, 0, 0)[0], xo)), yb_ - 0.002, yb_ + 0.002, zz - 0.002, zz + 0.002, '#2c2c2e')
        xc = (ixf.p(x_in, 0, 0)[0] + ixf.p(x_out, 0, 0)[0]) / 2
        if k == 0:
            for j in range(7):   # 噴霧罐（旋轉體）
                cz = ir['z'] - 0.32 + j * 0.105; col = CANS[(j + side_) % len(CANS)]; ht = 0.17 + (j % 3) * 0.02
                painted(VC, col, lambda cz=cz, ht=ht: Xf(xc, cz).lathe(VC, [(0, 0), (0.028, 0), (0.03, 0.01), (0.03, ht), (0.022, ht + 0.02), (0, ht + 0.02)], 0, yb_ + 0.005, 0, seg=8))
                painted(VC, '#f4f4f2' if col != '#f4f4f2' else '#3c6ea0', lambda cz=cz, ht=ht: Xf(xc, cz).lathe(VC, [(0, 0), (0.018, 0), (0.018, 0.035), (0, 0.035)], 0, yb_ + ht + 0.025, 0, seg=6))
        else:
            for j in range(3):
                for s_ in range(2): VC.crbox(xc - 0.07, xc + 0.07, yb_ + 0.004 + s_ * 0.05, yb_ + 0.05 + s_ * 0.05, ir['z'] - 0.36 + j * 0.25, ir['z'] - 0.14 + j * 0.25, ['#f6f5f1', '#e4e6e8', '#d9d3c9'][(j + s_) % 3], r=0.02, seg=1)
pq(None, 'note5', face_quad(ir['x'], ih - 0.12, ir['z'] + idp / 2 + 0.003, 0.2, 0.15, '+z'), 2)        # 「鞋帶 一雙 NT$60」


# ---------------- 植物（黃金葛的葉片卡；白色陶盆） ----------------
def plant(x, z, h=1.1, r=0.2, y0=0.0, trail=False):
    painted(VC, '#efece6', lambda: Xf(x, z).lathe(VC, [(r * 0.72, 0), (r * 0.78, 0.02), (r, r * 1.4), (r * 1.04, r * 1.45), (r * 0.94, r * 1.45), (r * 0.9, r * 1.3), (0, r * 1.3)], 0, y0, 0, seg=14))
    VC.cbox(x - r * 0.6, x + r * 0.6, y0 + r * 1.32, y0 + r * 1.34, z - r * 0.6, z + r * 0.6, '#3e3024')
    lf = acc('leaf'); rnd = random.Random(int(abs(x * 31 + z * 17)) + 5)
    if trail:
        for s_ in range(6):
            a = rnd.uniform(0, 2 * math.pi); px, pz = x + math.cos(a) * r * 0.8, z + math.sin(a) * r * 0.8
            for k in range(6): CL.card(lf, px + math.cos(a) * k * 0.02, y0 + r * 1.4 - k * 0.09, pz + math.sin(a) * k * 0.02 + rnd.uniform(-0.02, 0.02), 0.11, 0.11, ry=rnd.uniform(0, math.pi), rx=rnd.uniform(-0.6, 0.6), uv=CL.rand_uv(0.5))
        for k in range(10): CL.card(lf, x + rnd.uniform(-r, r), y0 + r * 1.5 + rnd.uniform(0, 0.12), z + rnd.uniform(-r, r), 0.13, 0.13, ry=rnd.uniform(0, math.pi), rx=rnd.uniform(-1.0, 1.0), uv=CL.rand_uv(0.5))
        return
    painted(VC, '#6a5644', lambda: VC.cyl((x, y0 + r, z), (x + 0.03, y0 + h * 0.75, z - 0.02), 0.02, seg=6))
    random.seed(int(abs(x * 13 + z * 7)) + 11)
    for lvl in range(4 if h > 1.0 else 2):
        cy = y0 + r * 1.4 + (h - r * 1.4) * (0.35 + lvl * 0.2); rr = 0.26 + (0.1 if lvl in (1, 2) else 0.0)
        CL.bush(lf, x, cy, z, rr * (h / 1.1), n=9, span=0.5, flat_y=0.9)


# 落地盆栽、展示架上、收銀台上的盆栽：Poly Haven 掃描模型（CC0）；高處垂下來的黃金葛照舊葉片卡（參考圖）
for k_, p_ in enumerate(it['plant_big']): K.ph_put('potted_plant_01', p_['x'], 0.0, p_['z'], 0.7 + k_ * 2.1, height=1.45, decimate=0.022)   # 高的（0.6 m 寬）
pf = it['plant_floor'][0]; K.ph_put('potted_plant_02', pf['x'], 0.0, pf['z'], 2.4, height=0.75, decimate=0.04)   # 矮胖的（0.6 m 寬）
plant(sxc, BZ + 0.12, r=0.08, y0=2.39, trail=True)                         # 襪子架上面的黃金葛（參考圖）
K.ph_put('potted_plant_04', x1c - 0.15, 0.99, cz_ - 0.05, 0.4, 0.22 / 0.32, height=0.32, decimate=0.1)   # 收銀台右端的小盆栽
K.ph_put('potted_plant_04', ir['x'], ih, ir['z'] - 0.15, 1.3, height=0.32, decimate=0.1)   # 展示架上的盆栽（參考圖右邊）
plant(sx1 + 0.35, ZI0 + 0.17, r=0.08, y0=bws['back']['top'], trail=True)   # 鞋盒層架頂上（招牌右邊）
# 鞋盒層架頂上（招牌右邊、黃金葛再過去）：還沒拆的進貨紙箱（Poly Haven cardboard_box_01，大小、方向各不同；不擋招牌）
for k_, (dx_, sc_, yw_) in enumerate(((0.3, 1.0, 0.1), (0.78, 0.85, -0.2), (0.5, 0.7, 1.45))):
    K.ph_put('cardboard_box_01', bws['back']['x1'] - dx_, bws['back']['top'] + (0.3 if k_ == 2 else 0.0), ZI0 + 0.24, yw_, sc_, height=0.3, decimate=0.03)

# ---------------- 前半間：新品展示桌、櫥窗、鞋盒推車、門邊鐵網架 ----------------
dt = it['display_table'][0]; xf = Xf(dt['x'], dt['z']); w, d, hh = dt['w'], dt['d'], dt['h']
xf.rbox(acc('wood'), -w / 2, w / 2, hh - 0.045, hh, -d / 2, d / 2, r=0.012, seg=2)
for sx in (-w / 2 + 0.06, w / 2 - 0.06):
    for sz in (-d / 2 + 0.06, d / 2 - 0.06): xf.rbox(acc('wood'), sx - 0.03, sx + 0.03, 0.0, hh - 0.045, sz - 0.03, sz + 0.03, r=0.006, seg=1)
xf.rbox(acc('wood'), -w / 2 + 0.05, w / 2 - 0.05, 0.16, 0.19, -d / 2 + 0.05, d / 2 - 0.05, r=0.006, seg=1)
for k in range(4):
    ci = k % 4; col = BOXC[ci]; bx0 = -w / 2 + 0.1 + k * 0.36
    for s_ in range(2 if k % 2 == 0 else 1):
        y = 0.19 + s_ * 0.125; xf.crbox(VC, bx0, bx0 + 0.33, y, y + 0.1, -0.1, 0.1, col[0], r=0.0); xf.crbox(VC, bx0 - 0.004, bx0 + 0.334, y + 0.1, y + 0.124, -0.104, 0.104, col[1], r=0.0)
for k, (style, cw_k) in enumerate((('bb_high', 1), ('run', 0), ('casual', 0), ('bb_mid', 2), ('run', 2), ('retro', 1))):
    ox = -w / 2 + 0.25 + (k % 3) * 0.55; oz = -0.18 if k < 3 else 0.18
    put_shoe(style, cw_k, *xf.p(ox, hh, oz), (0.4 if k < 3 else math.pi - 0.4) + random.uniform(-0.1, 0.1))
pq(None, 'price0', [xf.p(0.55, hh, 0.34), xf.p(0.71, hh, 0.34), xf.p(0.71, hh + 0.09, 0.32), xf.p(0.55, hh + 0.09, 0.32)])
wdp = it['window_display'][0]; wx0, wx1 = wdp['x'] - wdp['w'] / 2, wdp['x'] + wdp['w'] / 2; wz0, wz1 = wdp['z'] - wdp['d'] / 2, wdp['z'] + wdp['d'] / 2 - 0.02
fvc, fvm, fgl = wm('front', 'vc'), wm('front', 'vcm'), wm('front', 'glass')
posts = [wx0 + k * (wx1 - wx0) / 3 for k in range(4)]
for px in posts:
    for pz in (wz0, wz1): painted(fvm, ALU, lambda px=px, pz=pz: fvm.cyl((px, 0.0, pz), (px, 2.3, pz), 0.012, seg=6))
for yy in (1.2, 1.85):
    fgl.box(wx0, wx1, yy - 0.012, yy, wz0 - 0.03, wz1 + 0.01)
    for px in posts: fvm.cbox(px - 0.02, px + 0.02, yy - 0.03, yy - 0.012, wz0 - 0.03, wz1 + 0.01, ALU)
    for q in range(4):
        sx_ = wx0 + 0.45 + q * (wx1 - wx0 - 0.9) / 3; style = ['bb_high', 'run', 'casual', 'bb_mid', 'retro', 'run', 'bb_high', 'casual'][(q + int(yy * 10)) % 8]
        put_shoe(style, (q + int(yy * 2)) % 4, sx_, yy, (wz0 + wz1) / 2, (0.5 if q % 2 else math.pi - 0.5), 'front')
for (px, pw, ph) in ((wx0 + 0.55, 0.6, 0.42), (wdp['x'] + 0.2, 0.5, 0.3), (wx1 - 0.5, 0.55, 0.5)):
    fvc.crbox(px - pw / 2, px + pw / 2, 0.0, ph, wz0 + 0.02, wz1 - 0.02, '#ece8e0', r=0.01)
bbx, bby, bbz = wx0 + 0.55, 0.42 + 0.12, (wz0 + wz1) / 2
_n0 = len(fvc.bm.faces); fvc.sphere((bbx, bby, bbz), 0.12, seg=16, rings=10)
fvc.bm.faces.ensure_lookup_table(); _bf = [fvc.bm.faces[i] for i in range(_n0, len(fvc.bm.faces))]
for f in _bf:
    c = f.calc_center_median()
    mer = any(abs(v.co.y + bbz) < 1e-4 for v in f.verts) and c.y > -bbz
    equ = any(abs(v.co.z - bby) < 1e-4 for v in f.verts) and c.z > bby
    fvc.paint([f], '#3a2418' if (mer or equ) else '#c9622c')
put_shoe('bb_high', 3, wdp['x'] + 0.2, 0.3, bbz, math.pi - 0.4, 'front'); put_shoe('run', 1, wx1 - 0.5, 0.5, bbz, 0.45, 'front')
plant(wx1 - 0.12, (wz0 + wz1) / 2 - 0.05, h=0.9, r=0.14, y0=0.0)
# 鞋盒推車（鐵管推車、兩層、上面疊滿鞋盒）
bc = it['box_cart'][0]; bcx = Xf(bc['x'], bc['z'], math.pi / 2)
for sx in (-0.4, 0.4):
    for sz in (-0.22, 0.22):
        painted(VCM, '#3a3c40', lambda sx=sx, sz=sz: VCM.cyl(bcx.p(sx, 0.08, sz), bcx.p(sx, 0.95, sz), 0.012, seg=6))
        painted(VCM, '#2a2a2c', lambda sx=sx, sz=sz: VCM.cyl(bcx.p(sx, 0.0, sz - 0.03), bcx.p(sx, 0.0, sz + 0.03), 0.04, seg=10))
for yy in (0.15, 0.6): bcx.crbox(VCM, -0.43, 0.43, yy - 0.015, yy, -0.25, 0.25, '#7d8084', r=0.004, seg=1)
painted(VCM, '#3a3c40', lambda: VCM.cyl(bcx.p(-0.43, 0.95, -0.22), bcx.p(-0.43, 0.95, 0.22), 0.012, seg=6))
for lv, yy in enumerate((0.15, 0.6)):
    for c in range(2):
        for s_ in range(3 if lv == 0 else 2):
            ci = rs.choice([0, 1, 3]); col = BOXC[ci]; ox = -0.38 + c * 0.38; y = yy + s_ * 0.125
            bcx.crbox(VC, ox, ox + 0.34, y, y + 0.1, -0.2, 0.0, col[0], r=0.0); bcx.crbox(VC, ox - 0.004, ox + 0.344, y + 0.1, y + 0.124, -0.204, 0.004, col[1], r=0.0)
            bcx.crbox(VC, ox, ox + 0.34, y, y + 0.1, 0.02, 0.22, BOXC[(ci + 1) % 4][0], r=0.0); bcx.crbox(VC, ox - 0.004, ox + 0.344, y + 0.1, y + 0.124, 0.016, 0.224, BOXC[(ci + 1) % 4][1], r=0.0)
# 門邊的鐵網架：三層鐵網籃（鞋帶包、鞋墊盒、噴霧）
wr = it['wire_rack'][0]; rx, rz, rw, rd, rh = wr['x'], wr['z'], wr['w'], wr['d'], wr['h']
for sx in (-rw / 2 + 0.02, rw / 2 - 0.02):
    for sz in (-rd / 2 + 0.02, rd / 2 - 0.02): painted(VCM, '#2c2c2e', lambda sx=sx, sz=sz: VCM.cyl((rx + sx, 0.0, rz + sz), (rx + sx, rh, rz + sz), 0.009, seg=6))
for k, yy in enumerate((0.15, 0.62, 1.09)):
    for s_ in (-1, 1): VCM.cbox(rx - rw / 2, rx + rw / 2, yy - 0.006, yy + 0.006, rz + s_ * (rd / 2 - 0.02) - 0.004, rz + s_ * (rd / 2 - 0.02) + 0.004, '#2c2c2e')
    for s_ in (-1, 1): VCM.cbox(rx + s_ * (rw / 2 - 0.02) - 0.004, rx + s_ * (rw / 2 - 0.02) + 0.004, yy - 0.006, yy + 0.006, rz - rd / 2, rz + rd / 2, '#2c2c2e')
    for j in range(9): z = rz - rd / 2 + 0.04 + j * (rd - 0.08) / 8; VCM.cbox(rx - rw / 2 + 0.02, rx + rw / 2 - 0.02, yy - 0.003, yy, z - 0.002, z + 0.002, '#2c2c2e')
    for j in range(6):
        z = rz - rd / 2 + 0.1 + j * (rd - 0.2) / 5
        if k == 2: painted(VC, CANS[j % len(CANS)], lambda z=z, yy=yy: Xf(rx, z).lathe(VC, [(0, 0), (0.03, 0), (0.03, 0.18), (0.022, 0.2), (0, 0.2)], 0, yy, 0, seg=10))
        else: VC.crbox(rx - 0.16, rx + 0.16, yy, yy + (0.05 if k == 0 else 0.09), z - 0.055, z + 0.055, ['#f2efe9', '#3c6ea0', '#e9e4da', '#5e636b'][(j + k) % 4], r=0.006, seg=1)
pq(None, 'note7', face_quad(rx - rw / 2 - 0.003, 0.85, rz, 0.2, 0.15, '-x'), 2)                    # 「鞋墊 加購 NT$350」
# 右牆前段：直條木板＋系隊團購傳單、手寫紙條
for k in range(26): z = 0.6 + k * 0.2; wm('right', 'wood').box(XI1 - 0.02, XI1, 0.0, 2.65, z + 0.004, z + 0.196)   # 直條木板（板縫 8 mm；不倒角，省三角形）
pq('right', 'flyer', face_quad(XI1 - 0.022, 1.55, 1.6, 0.42, 0.57, '-x'), 1)
pq('right', 'note0', face_quad(XI1 - 0.022, 1.3, 0.95, 0.24, 0.18, '-x'), 2)
pq('back', 'note0', face_quad(-3.25, 1.25, BZ + 0.002, 0.24, 0.18, '+z'), 2)                       # 「試穿請坐這邊 謝謝！」（鏡子左邊）

# ---------------- 天花板：平頂、軌道燈（縱向三條＋櫃台區橫向一條）、吸頂冷氣 ----------------
SPOTS = []   # (燈頭位置, 照射方向)：渲染腳本（dabu_render.py）用同一份放投射燈


def track(a, b, n, aimf):
    if a[0] == b[0]: VCM.cbox(a[0] - 0.018, a[0] + 0.018, H - 0.04, H, a[1], b[1], '#ece8e0')
    else: VCM.cbox(a[0], b[0], H - 0.04, H, a[1] - 0.018, a[1] + 0.018, '#ece8e0')
    for k in range(n):
        f = (k + 0.5) / n; hx, hz = a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f
        d_ = Vector(aimf(hx, hz, k)).normalized(); hy = H - 0.16
        pa, pb = (hx - d_.x * 0.05, hy - d_.y * 0.05, hz - d_.z * 0.05), (hx + d_.x * 0.09, hy + d_.y * 0.09, hz + d_.z * 0.09)
        painted(VCM, '#ece8e0', lambda hx=hx, hz=hz: VCM.cyl((hx, H - 0.04, hz), (hx, hy + 0.02, hz), 0.008, seg=4))
        painted(VC, '#f1ede6', lambda pa=pa, pb=pb: VC.cyl(pa, pb, 0.04, seg=10))
        lens = (pb[0] + d_.x * 0.002, pb[1] + d_.y * 0.002, pb[2] + d_.z * 0.002); acc('led').cyl(pb, lens, 0.032, seg=8)
        SPOTS.append((lens, tuple(d_)))
        if k % 3 == 1: CL.glow(root, 'spot', lens[0] + d_.x * 0.3, lens[1] + d_.y * 0.3, lens[2] + d_.z * 0.3, color='rgba(255,224,176,1)', size=0.9, day=0.15, night=0.8)


def aim_to(tx, ty, dz=0.0): return lambda hx, hz, k: (tx - hx, ty - (H - 0.16), dz)
track((-2.45, -3.85), (-2.45, 5.5), 9, lambda hx, hz, k: (-0.85, -1.0, -0.15))           # 打左牆鞋牆
track((2.35, -3.85), (2.35, 5.5), 9, lambda hx, hz, k: (0.85, -1.0, -0.15) if hz < 0.8 else (0.3, -1.0, -0.2))   # 打右牆（前段打地上）
track((-0.15, -3.85), (-0.15, 5.5), 7, lambda hx, hz, k: ((-0.5 if k % 2 else 0.35), -1.0, -0.3))   # 中間：長凳、展示桌、地板
track((-0.45, -5.15), (2.5, -5.15), 4, lambda hx, hz, k: (0.0, -0.5, -1.0) if k % 2 == 0 else (0.0, -1.0, -0.55))               # 櫃台區：打招牌、鞋盒
ac_x, ac_z = 0.75, -2.9   # 吸頂冷氣（參考圖上方中間）
VC.crbox(ac_x - 0.42, ac_x + 0.42, H - 0.05, H, ac_z - 0.42, ac_z + 0.42, '#eeebe5', r=0.012)
VC.cbox(ac_x - 0.25, ac_x + 0.25, H - 0.054, H - 0.05, ac_z - 0.25, ac_z + 0.25, '#d6d2cc')
for s_ in (-1, 1):
    VC.cbox(ac_x - 0.3, ac_x + 0.3, H - 0.056, H - 0.05, ac_z + s_ * 0.34 - 0.03, ac_z + s_ * 0.34 + 0.03, '#56585c')
    VC.cbox(ac_x + s_ * 0.34 - 0.03, ac_x + s_ * 0.34 + 0.03, H - 0.056, H - 0.05, ac_z - 0.3, ac_z + 0.3, '#56585c')
for j in range(8): VC.cbox(ac_x - 0.24, ac_x + 0.24, H - 0.058, H - 0.054, ac_z - 0.22 + j * 0.063, ac_z - 0.21 + j * 0.063, '#c6c2bc')
for z in (-3.0, -0.5, 1.8): CL.glow(root, 'shelf_led', -3.15, 1.5, z, color='rgba(255,214,160,1)', size=1.6, day=0.2, night=0.9)
for z in (-2.7, -0.6): CL.glow(root, 'shelf_led', 3.15, 1.5, z, color='rgba(255,214,160,1)', size=1.6, day=0.2, night=0.9)

# ---------------- 收尾：合併、單面、匯出 ----------------
for k, m in _acc.items(): m.finish(root, uv=(k not in ('leaf',)), smooth=k in ('wood', 'fabric'))
for side, g in walls.items():
    for key, m in g.items():
        m.name = f'WALL_{side}_{m.name}'; m.finish(root, uv=(not isinstance(m, L.CMesh)) or key == 'sbv', props={'dir': DIRS[side]}, smooth=key == 'wood')
finish_uvq()
VC.finish(root, uv=False, smooth=True); VCM.finish(root, uv=False, smooth=True)
for ob in list(root.children):
    if ob.type == 'MESH' and ob.data.materials and 'leaf_' in ob.data.materials[0].name: L.smooth_mesh(ob, angle=1.2)
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name, key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
# 圖面（印刷：海報、標籤、紙條、地毯）只從正面看、鞋子（底部、鞋口裡面開口，看不到）：單面、不補反面（nodup）；拼起來的牆、木作也不補（補了反面重疊的面在 Cycles 變黑）
_ss = L.single_side(root, keep=r'glass|sunpatch', nodup=r'^dabu_(print|wall_paint|oak|floor_oak|shoe)$')
print('{"single_side": %s}' % json.dumps({k: v for k, v in sorted(_ss.items(), key=lambda kv: -kv[1][1])}, ensure_ascii=False))
K.report()
info = L.export(OUT, gpu_instances=True)
patch_glb(OUT); info['bytes'] = os.path.getsize(OUT)
info.update({'shop': 'dabu', 'layout': LAY['version'], 'shoes': SHOE_N[0], 'shoe_meshes': len(SHOES), 'spots': len(SPOTS)})
L.write_json(OUT[:-4] + '.json', info)
L.write_json(os.path.join(os.path.dirname(OUT), 'dabu_spots.json') if arg('--spots') is None else arg('--spots'), [list(a) + list(b) for a, b in SPOTS]) if arg('--spots') else None
