"""霖澤館 外觀 正式模型：Blender 5.2 bpy 無介面 → GLB（WebP 貼圖、同材質合併）。v9.4（D38，任務：霖澤館照新照片重做）。
照使用者提供的照片（臺大法律學院霖澤館：辛亥路側的全景、穿堂往中庭方向）：
  一～三樓：灰色花崗石基座，中間三層樓高、穿過整棟的穿堂（白色梁格天花板、前排中柱、後段二樓天橋＋玻璃欄杆、兩側落地玻璃牆）；
  左邊兩層樓高的玻璃大廳、右邊退縮的玻璃牆；
  上面：灰色帶窗層（遮陽板＋退縮的帶狀長窗）、紅磚窗格（每開間三扇窄窗、每扇窗上面一個灰色預鑄遮陽盒）交替：
  四樓 灰帶（正面中間是館名石材帶）、五六樓 紅磚、七樓 灰帶、八九樓 紅磚、十樓 開放層（灰色女兒牆、方柱、往外伸的大屋頂板）。
量體、穿堂、台階、柱子位置和 src/campuskit3d.js 的 CK.lawhall({w:40,d:18,floors:10,centerCol:true}) 一樣——
導航阻擋、走路高度（穿堂 0.9 m、前後台階）、鏡頭碰撞都由套件給（遊戲：src/zones3d.js 校園的 ckPlace），這個模型只換外觀。
館名（金色字）、橘色直式「法律學院」招牌由遊戲畫（Canvas 字，不把字型做進模型）。
真實霖澤館的細部（窗數、樓層數、轉角）沒有圖面，是照照片概略重建，不是精確複製。
貼圖：Poly Haven CC0（tools/blender/fetch_polyhaven.py）。座標：遊戲 (x 東, y 上, z 南；正面朝 +z) ＝ Blender (x, -z, y)。
材質名稱約定（遊戲依名稱處理）：ext_glass_lit＝晚上會亮的窗；ext_glass_lobby＝大廳玻璃（晚上亮）；ext_downlight＝穿堂嵌燈（晚上更亮）。
用法：/opt/blenv/bin/python tools/blender/linze_exterior.py [--out assets/models/env/linze_exterior.glb] [--tex 512] [--render 輸出資料夾]
"""
import math, os, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
def arg(name, default=None): return argv[argv.index(name) + 1] if name in argv else default
OUT = os.path.join(ROOT, arg('--out', 'assets/models/env/linze_exterior.glb'))
TEXRES = int(arg('--tex', '512')); RENDER = arg('--render')
import b3lib as B
B.reset(TEXRES)

# ---------------- 量體（和 CK.lawhall 一樣）----------------
w, d, nf, gfh, fh = 40.0, 18.0, 10, 4.4, 3.5
H = gfh + (nf - 1) * fh                     # 35.9：十樓頂
PW, PF = 14.0, 0.9; PH = gfh + 2 * fh       # 穿堂寬 14、地坪 0.9、高 11.4（三層樓）
LW, RW, RD = 7.4, 7.4, 2.4; RH = gfh + fh   # 左邊玻璃大廳寬；右邊退縮玻璃牆寬、深；兩層樓高 7.9
BH = 1.7                                    # 穿堂前後大梁
NS, TR = 6, 0.42; RS = PF / NS; SW = PW + LW + RW + 1.0
CORE = 0.65                                 # 立面最外面（磚面）到建築本體：窗的退縮、窗台、遮陽盒都在這個深度裡
yF = lambda i: 0.0 if i == 0 else gfh + (i - 1) * fh
hF = lambda i: gfh if i == 0 else fh
BASE, BAND, BRICK, TOP = (0, 1, 2), (3, 6), (4, 5, 7, 8), 9
WW, MW = 0.62, 0.30                         # 紅磚層的窄窗寬、窗間磚柱寬（照片：每開間三扇）

def lit(x, y, z):   # 晚上哪些窗亮著（和 campuskit3d.js 的 winLit 同一個雜湊）
    h = math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453
    return h - math.floor(h) > 0.3

MAT = {
    'granite': B.pbr('ext_granite', 'granite_tile_03', tile=2.4, tint=B.srgb('#d4d6d8'), sat=0.12, gain=1.08, cull=True),   # 照片：淺灰花崗石（貼圖偏棕，去彩度）
    'graniteD': B.pbr('ext_granite_dark', 'granite_tile_03', tile=2.4, tint=B.srgb('#a9abad'), sat=0.12, cull=True),       # 台階、穿堂地坪邊
    'precast': B.pbr('ext_precast', 'granular_concrete', tile=2.0, tint=B.srgb('#c9c9c6'), sat=0.2, gain=1.12, cull=True), # 灰色預鑄：遮陽板、窗楣盒、帶窗層
    'brick': B.pbr('ext_brick', 'red_brick', tile=1.0, tint=B.srgb('#d9c4bc'), sat=0.8, cull=True),                        # 照片：紅褐色面磚
    'paver': B.pbr('ext_paver', 'large_floor_tiles_02', tile=1.2, tint=B.srgb('#d8d6d0'), sat=0.3, cull=True),             # 穿堂地坪
    'ceiling': B.pbr('ext_ceiling', 'painted_plaster_wall', tile=3.0, tint=B.srgb('#f4f3ef'), normal=0.3, cull=True),       # 穿堂白色天花板與梁
    'frame': B.pbr('ext_frame', None, tint=B.srgb('#34383c'), rough=0.45, metal=0.6, cull=True),                         # 深灰鋁框
    'steel': B.pbr('ext_steel', None, tint=B.srgb('#c9ccd0'), rough=0.3, metal=1.0, cull=True),
    'glass_lit': B.pbr('ext_glass_lit', None, tint=B.srgb('#3c4650'), rough=0.12, metal=0.4, cull=True),
    'glass_dark': B.pbr('ext_glass_dark', None, tint=B.srgb('#353d45'), rough=0.12, metal=0.4, cull=True),
    'glass_lobby': B.pbr('ext_glass_lobby', None, tint=B.srgb('#6d7c84'), rough=0.08, metal=0.3, cull=True),
    'glass_rail': B.pbr('ext_glass_rail', None, tint=B.srgb('#b9cdd4'), rough=0.05, alpha=0.3),                           # 天橋玻璃欄杆（兩面都看得到）
    'door': B.pbr('ext_door', None, tint=B.srgb('#20262b'), rough=0.25, metal=0.3, cull=True),
    'downlight': B.pbr('ext_downlight', None, tint=B.srgb('#fff3dc'), rough=0.9, emit=B.srgb('#fff3dc'), cull=True),
}
root = B.group('LinzeExterior')
_n = [0]
def nm(p): _n[0] += 1; return f'{p}_{_n[0]}'

# ---------------- 立面座標：t＝沿牆（從外面看往右）、y＝高、n＝離牆面（往外為正）----------------
FACES = {'S': w, 'N': w, 'E': d, 'W': d}
def fb(f, t0, t1, n0, n1):
    t0, t1 = min(t0, t1), max(t0, t1); n0, n1 = min(n0, n1), max(n0, n1)
    if f == 'S': return (t0, t1, d / 2 + n0, d / 2 + n1)
    if f == 'N': return (-t1, -t0, -d / 2 - n1, -d / 2 - n0)
    if f == 'E': return (w / 2 + n0, w / 2 + n1, -t1, -t0)
    return (-w / 2 - n1, -w / 2 - n0, t0, t1)
def fpt(f, t, y, n):
    if f == 'S': return (t, y, d / 2 + n)
    if f == 'N': return (-t, y, -d / 2 - n)
    if f == 'E': return (w / 2 + n, y, -t)
    return (-w / 2 - n, y, t)
def BOX(mat, f, t0, t1, y0, y1, n0, n1, tag='p'):
    if t1 - t0 < 0.005 or y1 - y0 < 0.005: return None
    if f in 'SN':
        ax0, ax1, az0, az1 = fb(f, t0, t1, n0, n1); return B.box(nm(tag), MAT[mat], ax0, ax1, y0, y1, az0, az1, root)
    ax0, ax1, az0, az1 = fb(f, t0, t1, n0, n1); return B.box(nm(tag), MAT[mat], ax0, ax1, y0, y1, az0, az1, root)
def PANE(mat, f, t0, t1, y0, y1, n, tag='g'):
    return B.quad(nm(tag), MAT[mat], [fpt(f, t0, y0, n), fpt(f, t1, y0, n), fpt(f, t1, y1, n), fpt(f, t0, y1, n)], root)
def trng(f, ext=0.0):
    """整面牆的 t 範圍：正面／背面包到轉角（往外伸的板再多包 ext）；側面兩端各退 CORE（避免和正背面的轉角重疊、閃爍）"""
    L = FACES[f]
    return (-L / 2 - ext, L / 2 + ext) if f in 'SN' else (-L / 2 + CORE, L / 2 - CORE)
def bays(f):
    L = FACES[f]; CW = 1.2; inner = L - 2 * CW; n = max(2, round(inner / 3.6)); bw = inner / n
    return [(-inner / 2 + k * bw, -inner / 2 + (k + 1) * bw) for k in range(n)], bw

ROT = {'S': 0.0, 'N': math.pi, 'E': math.pi / 2, 'W': -math.pi / 2}   # 正面（+z）的零件轉到各面（遊戲 y 軸旋轉＝Blender z 軸旋轉）
WINS = {}   # 窗的種類 → [(面, t, 窗台高)]：同一種窗只做一個網格，其他用 GPU instancing（EXT_mesh_gpu_instancing）擺上去

def window(f, c, ww, ys, ye, glass_n=-0.32, hood=True, sill='precast'):
    x, _, z = fpt(f, c, ys, 0)
    key = (round(ww, 3), round(ye - ys, 3), glass_n, hood, sill, lit(x, ys, z))
    WINS.setdefault(key, []).append((f, c, ys))

def win_proto(key, k):
    """一扇窗（正面朝 +z、原點在窗洞下緣中間、z＝0 是牆面）：玻璃、鋁框（下框、上框、橫框、下半部中間直框）、窗台、窗楣遮陽盒"""
    ww, hh, gn, hood, sill, on = key; grp = B.group(f'winproto_{k}')
    B.quad('glass', MAT['glass_lit' if on else 'glass_dark'], [(-ww / 2, 0.04, gn), (ww / 2, 0.04, gn), (ww / 2, hh, gn), (-ww / 2, hh, gn)], grp)
    for (a, b) in ((0.04, 0.09), (hh - 0.05, hh), (hh * 0.7, hh * 0.7 + 0.045)): B.box('fr', MAT['frame'], -ww / 2, ww / 2, a, b, gn - 0.02, gn + 0.035, grp)
    B.box('fr', MAT['frame'], -0.02, 0.02, 0.04, hh * 0.7, gn - 0.02, gn + 0.035, grp)
    B.box('sill', MAT[sill], -ww / 2 - 0.05, ww / 2 + 0.05, 0.0, 0.04, gn, 0.07, grp)
    if hood: B.box('hood', MAT['precast'], -ww / 2 - 0.1, ww / 2 + 0.1, hh - 0.04, hh + 0.22, 0.0, 0.27, grp)
    me = B.join_children(grp, f'win_{k}'); B.remove(grp); return me

def build_windows():
    for k, (key, items) in enumerate(sorted(WINS.items(), key=lambda kv: str(kv[0]))):
        me = win_proto(key, k); par = B.group(f'WINS_{k}', root)   # 每種窗一個父節點：匯出時這一組變成一個 InstancedMesh
        for j, (f, c, ys) in enumerate(items):
            x, y, z = fpt(f, c, ys, 0); B.instance(me, f'w{k}_{j}', x, y, z, par, ROT[f])

def wall_row(f, mat, ta, tb, y0, y1, ys, ye, wins, ww, **kw):
    """一層的牆：窗下、窗上兩條，窗與窗之間的牆柱；wins＝窗中心"""
    BOX(mat, f, ta, tb, y0, ys, -CORE, 0); BOX(mat, f, ta, tb, ye, y1, -CORE, 0)
    edges = [ta] + [v for c in sorted(wins) for v in (c - ww / 2, c + ww / 2)] + [tb]
    for k in range(0, len(edges), 2): BOX(mat, f, edges[k], edges[k + 1], ys, ye, -CORE, 0)
    for c in wins: window(f, c, ww, ys, ye, **kw)

# ---------------- 建築本體（看不到的內部，只在窗後面與穿堂側面露出）----------------
gr = 'granite'
B.box('core_W', MAT[gr], -w / 2 + CORE, -PW / 2, 0, PH, -d / 2 + CORE, d / 2 - CORE, root)
B.box('core_EA', MAT[gr], PW / 2, w / 2 - CORE, 0, PH, -d / 2 + CORE, d / 2 - RD, root)
B.box('core_EB', MAT[gr], PW / 2 + RW, w / 2 - CORE, 0, PH, d / 2 - RD, d / 2 - CORE, root)
B.box('core_EC', MAT[gr], PW / 2, PW / 2 + RW, RH, PH, d / 2 - RD, d / 2 - CORE, root)          # 右邊退縮玻璃牆的上面（底面＝退縮處的天花板）
B.box('core_up', MAT[gr], -w / 2 + CORE, w / 2 - CORE, PH + 0.01, yF(TOP), -d / 2 + CORE, d / 2 - CORE, root)
B.box('core_roofroom', MAT['precast'], -w / 2 + 3.6, w / 2 - 3.6, yF(TOP), H - 0.6, -d / 2 + 3.6, d / 2 - 3.6, root)   # 頂樓開放層裡面的機房（退縮 3.6 m：柱子之間看得到天空）

# ---------------- 一～三樓：花崗石基座 ----------------
for f in 'SNEW':
    bl, bw = bays(f)
    for i in BASE:
        y0, h = yF(i), hF(i); ys, ye = (y0 + 1.0, y0 + 3.5) if i == 0 else (y0 + 0.9, y0 + 2.75)
        if f == 'S': segs = [(-w / 2, -PW / 2 - LW), (PW / 2 + RW, w / 2)] if i < 2 else [(-w / 2, -PW / 2), (PW / 2, w / 2)]
        elif f == 'N': segs = [(-w / 2, -PW / 2), (PW / 2, w / 2)]
        else: segs = [trng(f)]
        for (ta, tb) in segs:
            wins = [c for (b0, b1) in bl if b0 >= ta - 1e-6 and b1 <= tb + 1e-6 for c in ((b0 + b1) / 2 - 0.62, (b0 + b1) / 2 + 0.62)]
            wall_row(f, gr, ta, tb, y0, y0 + h, ys, ye, wins, 0.82, hood=False, sill='graniteD', glass_n=-0.3)
    # 基座和上面之間：往外伸的灰色石材帶（照片：基座頂上一道水平線）
    ta, tb = trng(f, 0.25); BOX('graniteD', f, ta, tb, PH - 0.3, PH, -CORE, 0.25)

# ---------------- 四～九樓：灰色帶窗層與紅磚窗格 ----------------
for f in 'SNEW':
    bl, bw = bays(f); ta, tb = trng(f); tA, tB = trng(f, 0.45)
    bounds = [bl[0][0]] + [b1 for (_, b1) in bl]                     # 開間分界（含兩端）
    for i in BAND:
        y0 = yF(i)
        BOX('precast', f, tA, tB, y0, y0 + 0.24, -CORE, 0.45)              # 下緣遮陽板
        BOX('precast', f, tA, tB, y0 + fh - 0.24, y0 + fh, -CORE, 0.45)    # 上緣遮陽板
        BOX('precast', f, ta, tb, y0 + 0.24, y0 + 0.95, -CORE, 0)          # 窗下牆
        BOX('precast', f, ta, tb, y0 + 2.85, y0 + fh - 0.24, -CORE, 0)     # 窗上牆
        name = (f == 'S' and i == 3)                                       # 正面四樓中間：館名石材帶
        gaps = [(ta, bounds[0] + 0.45)] + [(b - 0.45, b + 0.45) for b in bounds[1:-1]] + [(bounds[-1] - 0.45, tb)]
        if name: gaps.append((-8.2, 8.2))
        gaps.sort(); merged = []
        for a, b in gaps:
            if merged and a <= merged[-1][1]: merged[-1] = (merged[-1][0], max(merged[-1][1], b))
            else: merged.append((a, b))
        for a, b in merged: BOX('precast', f, a, b, y0 + 0.95, y0 + 2.85, -CORE, 0.05)   # 灰色牆柱
        for k in range(len(merged) - 1):                                   # 帶狀長窗（退縮 0.5 m）＋直櫺
            a, b = merged[k][1], merged[k + 1][0]
            if b - a < 0.3: continue
            x, _, z = fpt(f, (a + b) / 2, y0, 0)
            PANE('glass_lit' if lit(x, y0, z) else 'glass_dark', f, a, b, y0 + 0.95, y0 + 2.85, -0.5)
            nmul = max(1, round((b - a) / 1.25))
            for m in range(1, nmul): xm = a + (b - a) * m / nmul; BOX('frame', f, xm - 0.03, xm + 0.03, y0 + 0.95, y0 + 2.85, -0.52, -0.44, 'mul')
            BOX('frame', f, a, b, y0 + 2.2, y0 + 2.25, -0.52, -0.44, 'mul')
        if name: BOX('granite', f, -8.2, 8.2, y0 + 0.24, y0 + fh - 0.24, -CORE, 0.4)   # 館名石材帶（字由遊戲畫）
    for i in BRICK:
        y0 = yF(i); ys, ye = y0 + 0.95, y0 + 2.65
        wins = []
        for (b0, b1) in bl:
            pier = bw - 3 * WW - 2 * MW; c0 = b0 + pier / 2 + WW / 2
            wins += [c0 + k * (WW + MW) for k in range(3)]
        wall_row(f, 'brick', ta, tb, y0, y0 + fh, ys, ye, wins, WW)
        BOX('precast', f, tA if f in 'SN' else ta, tB if f in 'SN' else tb, y0 - 0.0, y0 + 0.12, -CORE, 0.12)   # 樓板線（細的灰色帶）

# ---------------- 十樓：開放層（女兒牆、方柱）＋往外伸的大屋頂板 ----------------
y9 = yF(TOP)
for f in 'SNEW':
    bl, bw = bays(f); ta, tb = trng(f, 0.1)
    BOX('precast', f, ta, tb, y9, y9 + 1.1, -CORE, 0.1)
    bounds = [bl[0][0]] + [b1 for (_, b1) in bl]
    L = FACES[f]
    for b in [-L / 2 + 0.6 if f in 'SN' else -L / 2 + CORE + 0.35] + bounds[1:-1] + [L / 2 - 0.6 if f in 'SN' else L / 2 - CORE - 0.35]:
        BOX('precast', f, b - 0.35, b + 0.35, y9 + 1.1, H - 0.6, -0.75, -0.05, 'col')
B.box('roof_slab', MAT['precast'], -w / 2 - 1.8, w / 2 + 1.8, H - 0.6, H, -d / 2 - 1.8, d / 2 + 1.8, root)

# ---------------- 正面：左邊兩層樓的玻璃大廳、右邊退縮的玻璃牆 ----------------
x0, x1 = -PW / 2 - LW, -PW / 2 - 0.2; gh = RH - 0.4 - PF
PANE('glass_lobby', 'S', x0, x1, PF, PF + gh, 0.03)
for k in range(7): xx = x0 + (x1 - x0) * k / 6; BOX('frame', 'S', xx - 0.05, xx + 0.05, PF, PF + gh, 0.0, 0.12, 'lf')
for yy in (PF + 2.9, PF + gh - 0.06): BOX('frame', 'S', x0, x1, yy, yy + 0.12, 0.0, 0.12, 'lf')
BOX('granite', 'S', x0 - 0.2, x1 + 0.2, PF + gh, RH, -CORE, 0.25)                # 玻璃上面的石材楣
BOX('granite', 'S', x1, -PW / 2, PF, RH, -CORE, 0.0)                              # 玻璃和穿堂之間的窄牆
xr0 = PW / 2; B.box('recess_floor', MAT['paver'], xr0, xr0 + RW, 0, PF, d / 2 - RD, d / 2, root)
B.quad('recess_glass', MAT['glass_lobby'], [(xr0, PF, d / 2 - RD + 0.02), (xr0 + RW, PF, d / 2 - RD + 0.02), (xr0 + RW, RH, d / 2 - RD + 0.02), (xr0, RH, d / 2 - RD + 0.02)], root)
for k in range(6): xx = xr0 + 0.1 + (RW - 0.2) * k / 5; B.box(nm('rf'), MAT['frame'], xx - 0.05, xx + 0.05, PF, RH, d / 2 - RD + 0.02, d / 2 - RD + 0.14, root)
B.box(nm('rf'), MAT['frame'], xr0, xr0 + RW, PF + 2.9, PF + 3.02, d / 2 - RD + 0.02, d / 2 - RD + 0.14, root)
B.box('recess_col', MAT['granite'], xr0 + 3.2 - 0.6, xr0 + 3.2 + 0.6, PF, RH, d / 2 - 1.2, d / 2, root)   # 「法律學院」直式招牌掛在這根（遊戲畫）

# ---------------- 穿堂：地坪、台階、柱子（含中柱）、大梁、梁格天花板＋嵌燈、兩側玻璃牆、大廳自動門、二樓天橋 ----------------
B.box('pass_floor', MAT['paver'], -PW / 2, PW / 2, 0, PF, -d / 2, d / 2, root)
def stairs(tag, xa, xb, z0, sgn):
    """台階：從 z0 往 sgn 方向下去（最上面一階和地坪同高）；每一階一個不重疊的方塊"""
    for k in range(NS):
        za, zb = z0 + sgn * (NS - 1 - k) * TR, z0 + sgn * (NS - k) * TR
        B.box(nm(tag), MAT['graniteD'], xa, xb, 0, (k + 1) * RS, min(za, zb), max(za, zb), root)
stairs('stepF', -SW / 2, SW / 2, d / 2, +1)
stairs('stepB', -(PW + 1.2) / 2, (PW + 1.2) / 2, -d / 2, -1)
for rx in (-SW / 2 + 0.3, SW / 2 - 0.3, -(PW / 2 - 0.6), PW / 2 - 0.6):          # 不鏽鋼扶手（和套件的導航阻擋同一個位置）
    za, zb = d / 2 + 0.15, d / 2 + NS * TR - 0.15
    B.cyl(nm('rail'), MAT['steel'], (rx, PF + 0.95, za), (rx, 0.95 + RS * 0.5, zb), 0.035, root, seg=8)
    for k in range(4):
        zz = za + (zb - za) * k / 3; top = PF + 0.95 + (0.95 + RS * 0.5 - PF - 0.95) * k / 3; base = PF - RS * min(NS, math.floor((zz - d / 2) / TR))
        B.cyl(nm('post'), MAT['steel'], (rx, base, zz), (rx, top, zz), 0.025, root, seg=6)
colH0, colH1 = PF, PH - BH
for (cx, cz) in [(sx * (PW / 2 - 0.6), zc) for sx in (-1, 1) for zc in (d / 2 - 0.6, 0.0, -d / 2 + 0.6)] + [(0.0, d / 2 - 0.6)]:
    B.box(nm('pcol'), MAT['granite'], cx - 0.6, cx + 0.6, colH0, colH1, cz - 0.6, cz + 0.6, root)
for zs in (1, -1):
    B.box(nm('beam'), MAT['granite'], -PW / 2 - 1.2, PW / 2 + 1.2, PH - BH, PH, zs * (d / 2 - 0.45) - 0.75, zs * (d / 2 - 0.45) + 0.75, root)
B.quad('pass_ceiling', MAT['ceiling'], [(-PW / 2, PH, -d / 2 + 1.2), (PW / 2, PH, -d / 2 + 1.2), (PW / 2, PH, d / 2 - 1.2), (-PW / 2, PH, d / 2 - 1.2)], root)
for x in (-3.5, 0.0, 3.5): B.box(nm('cb'), MAT['ceiling'], x - 0.22, x + 0.22, PH - 0.55, PH, -d / 2 + 1.2, d / 2 - 1.2, root)
zz = -d / 2 + 3
while zz < d / 2 - 1.2:
    B.box(nm('cb'), MAT['ceiling'], -PW / 2, PW / 2, PH - 0.5, PH, zz - 0.22, zz + 0.22, root); zz += 3   # 橫梁比縱梁淺 5 cm（交叉處底面不重疊）
for x in (-5.2, -1.75, 1.75, 5.2):
    zz = -d / 2 + 1.5
    while zz < d / 2 - 1.2:
        B.quad(nm('dl'), MAT['downlight'], [(x - 0.12, PH - 0.01, zz - 0.12), (x + 0.12, PH - 0.01, zz - 0.12), (x + 0.12, PH - 0.01, zz + 0.12), (x - 0.12, PH - 0.01, zz + 0.12)], root); zz += 3
gh2 = PH - 2.4 - PF
for sx, za, zb in ((-1, -d / 2 + 0.7, d / 2 - 0.7), (1, -d / 2 + 0.7, d / 2 - RD)):   # 右邊只到退縮處（退縮的前廊和穿堂相通：導航也是）
    xg = sx * (PW / 2 - 0.02)
    pts = [(xg, PF, zb), (xg, PF, za), (xg, PF + gh2, za), (xg, PF + gh2, zb)] if sx < 0 else [(xg, PF, za), (xg, PF, zb), (xg, PF + gh2, zb), (xg, PF + gh2, za)]
    B.quad(nm('pglass'), MAT['glass_lobby'], pts, root)
    zz = za
    while zz <= zb + 1e-6:
        B.box(nm('pm'), MAT['frame'], xg - 0.06 * sx - 0.05, xg - 0.06 * sx + 0.05, PF, PF + gh2, zz - 0.05, zz + 0.05, root); zz += 1.6
    B.box(nm('pm'), MAT['frame'], xg - 0.06 * sx - 0.05, xg - 0.06 * sx + 0.05, PF + 2.8, PF + 2.92, za, zb, root)
# 大廳自動門（遊戲：「進入霖澤館」）：門框（兩側＋上框＋中縫）、深色玻璃門片
xd0, xd1 = -PW / 2 + 0.02, -PW / 2 + 0.17
for (za, zb) in ((4.5 - 1.7, 4.5 - 1.5), (4.5 + 1.5, 4.5 + 1.7), (4.5 - 0.03, 4.5 + 0.03)): B.box(nm('df'), MAT['frame'], xd0, xd1, PF, PF + 2.5, za, zb, root)
B.box(nm('df'), MAT['frame'], xd0, xd1, PF + 2.5, PF + 2.7, 4.5 - 1.7, 4.5 + 1.7, root)
B.box('lobby_door', MAT['door'], xd0, xd0 + 0.08, PF, PF + 2.5, 4.5 - 1.5, 4.5 + 1.5, root)
by, bz = PF + gfh - 0.3, -d / 2 + 2.6                                                 # 二樓天橋（和套件的鏡頭碰撞同一個位置）
B.box('bridge', MAT['granite'], -PW / 2, PW / 2, by - 0.5, by, bz - 1.1, bz + 1.1, root)
for e in (1, -1):
    ze = bz + e * 1.08
    pts = [(-PW / 2, by, ze), (PW / 2, by, ze), (PW / 2, by + 1.0, ze), (-PW / 2, by + 1.0, ze)]
    B.quad(nm('brail'), MAT['glass_rail'], pts if e > 0 else pts[::-1], root)
    B.box(nm('bhand'), MAT['steel'], -PW / 2, PW / 2, by + 1.0, by + 1.06, ze - 0.04, ze + 0.04, root)

build_windows()
B.join_by_material(root, 'EXT')
st = B.export(OUT, ROOT, gpu_instances=True)
print('window kinds', {str(k): len(v) for k, v in WINS.items()})
if RENDER:
    B.render_views(RENDER, 'linze_ext', [('front', (-14.0, 2.0, 44.0), (2.0, 15.0, 0.0)), ('passage', (2.0, 2.4, 19.0), (0.0, 4.0, -10.0)), ('corner', (36.0, 3.0, 30.0), (0.0, 14.0, 0.0))],
                   lights=[(0, 10.5, 5, 600), (0, 10.5, -4, 600)], lens=20)
