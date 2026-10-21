"""118 巷的街道道具（ART-L118-LANE-1020；LAWWW-C 10-20 轉使用者 18:5x「負責美術的 ai……看一下他做好的東西是不是可以更精致一點」，截圖 06、07：118 巷很寬、很空，像大馬路，不像巷子）
→ assets/models/env/second_ai/lane118_props.glb（＋.json）＋lane118_props.layout.json。LAWWW2-C 2026-10-20；Blender 5.2：
  /opt/blenv/bin/python tools/blender/env_second/lane118_props.py
座標：118 巷區域座標（src/data/lane118_layout.js；x 往東、z 往南），放在原點、不用轉。
模型裡有：
  - 店門口的東西：盆栽、保麗龍箱、塑膠籃、回收桶、立式菜單板、瓦斯桶、靠牆的腳踏車（每一樣都離店門 1.4 m 以上，人行道留 1.2 m 以上可以走）；
  - 電線桿兩支（水泥桿、橫擔、變壓器）＋頭上的電線：橫過巷子、沿著兩側立面，會下垂。
模型裡沒有、交給遊戲的（layout.json）：
  - scooters：機車的位置 [x, z, ry, 組]——遊戲用和公館、溫州街同一套機車（bldg.wz_scooter，attachWzScooters），套件的機車是備用；
    巷口、巷底畫好的機車格（lane118_layout.js 的 scooters.zRanges）垂直停；中間那一段靠路邊順著停，店門口、紅線（禁停）不停；
  - blocks、circles：導航要擋的（道具、機車、電線桿）；
  - pools：晚上店門口灑到人行道的光（TK.lightPool 的位置、半徑）。
店名、菜單都是虛構（D77）；不寫電話。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, bpy, Matrix   # noqa: E402
from lane118_shops import ccyl, clathe, img_mat, uvquad   # noqa: E402
from PIL import Image, ImageDraw, ImageFont   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/lane118_props.glb')
GEN = os.path.join(HERE, 'textures', 'gen'); PI = math.pi
_src = open(os.path.join(L.ROOT, 'src/data/lane118_layout.js'), encoding='utf8').read()
LAY = json.loads(_src[_src.index('{', _src.index('const LANE118_LAYOUT=')):_src.rindex('}') + 1])
FW, FE = LAY['facade']['west'], LAY['facade']['east']; LX0, LX1 = LAY['lane']['x0'], LAY['lane']['x1']; Z0, Z1 = LAY['lane']['z0'], LAY['lane']['z1']
GH, FH = LAY['groundH'], LAY['floorH']
DOORS = {q['id']: (q['side'], (q['z0'] + q['z1']) / 2) for q in LAY['shops']}
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'


# ---------------- 印刷品（512 × 512）：立式菜單板 4 種（黑板）、回收桶的字 3 種 ----------------
def make_print():
    W = 512; img = Image.new('RGB', (W, W), (40, 60, 48)); d = ImageDraw.Draw(img)
    F = lambda n: ImageFont.truetype(CJK, n)
    boards = [('今日便當', ['排骨　95', '雞腿　110', '魚排　100'], (40, 64, 50)), ('午間套餐', ['白醬雞肉　130', '番茄海鮮　150', '＋30 元附飲料'], (30, 30, 34)),
              ('小菜可續', ['石鍋拌飯　140', '豆腐鍋　150', '加飯免費'], (52, 40, 32)), ('今天的甜點', ['蛋糕　90', '美式　70', '拿鐵　80'], (38, 52, 62))]
    for k, (t, lines, bg) in enumerate(boards):   # 每塊 128 × 256（u 0.25 × v 0.5），上排
        x0, y0 = k * 128, 0; d.rectangle([x0, y0, x0 + 127, y0 + 255], fill=bg); d.rectangle([x0 + 4, y0 + 4, x0 + 123, y0 + 251], outline=(200, 190, 160), width=3)
        d.text((x0 + 64, y0 + 34), t, font=F(24), fill=(250, 240, 200), anchor='mm')
        for j, ln in enumerate(lines): d.text((x0 + 64, y0 + 92 + j * 40), ln, font=F(17), fill=(235, 235, 225), anchor='mm')
        d.line([(x0 + 16, y0 + 222), (x0 + 112, y0 + 222)], fill=(220, 120, 110), width=3)
    labels = [('資源回收', (40, 110, 190)), ('一般垃圾', (60, 140, 80)), ('廚餘', (210, 170, 50))]
    for k, (t, bg) in enumerate(labels):   # 每塊 170 × 128，下排
        x0, y0 = k * 170, 384; d.rectangle([x0, y0, x0 + 169, y0 + 127], fill=bg); d.text((x0 + 85, y0 + 64), t, font=F(30), fill=(255, 255, 255), anchor='mm')
    fn = os.path.join(GEN, 'l118_props_print.png'); img.save(fn); return 'l118_props_print.png'


BOARD_UV = lambda k: (k * 0.25, 0.5, k * 0.25 + 0.25, 1.0)
LABEL_UV = lambda k: (k * 170 / 512, 0.0, (k * 170 + 170) / 512, 0.25)

B.reset(texres=512)
root = B.group('lane118_props', props={'kind': 'lane118_props', 'coords': 'lane118'})
VC = CMesh('l118p_parts', L.vc_material('l118p_vc', rough=0.7, cull=False))
PR = Mesh('l118p_print', img_mat('l118p_print', make_print(), rough=0.7))
WIRE = CMesh('l118p_wires', L.vc_material('l118p_wire', rough=0.6, cull=False))
rr = random.Random(118)
BLOCKS, CIRCLES, SCOOTERS, POOLS, SCB = [], [], [], [], []   # SCB：機車那幾排的導航阻擋（和道具分開：道具沒載入時遊戲用方塊代替，機車有套件機車代替）
side_x = lambda side, off: (FW + off) if side == 'W' else (FE - off)   # 從立面往巷子 off 公尺


def block(cx, cz, w, d, to=None): (BLOCKS if to is None else to).append([round(cx, 3), round(cz, 3), round(w, 3), round(d, 3)])


# ---------------- 道具 ----------------
def pot(x, z, h=1.0, big=True):
    """門口的盆栽：塑膠花盆＋葉子（頂點色）"""
    r = 0.24 if big else 0.17
    clathe(VC, [(0.0, 0.0), (r * 0.8, 0.0), (r, 0.38 if big else 0.28), (r * 1.05, 0.4 if big else 0.3), (0.0, 0.4 if big else 0.3)], x, 0.0, z, rr.choice(('#7a4a32', '#3a3a3a', '#a85a3a', '#5a6a72')), seg=12)
    top = 0.38 if big else 0.28; R = random.Random(int(abs(x * 100 + z * 37)))
    for k in range(18 if big else 10):
        a = R.uniform(0, 2 * PI); rd = R.uniform(0.03, r * 1.2); yy = R.uniform(top + 0.1, top + h * 0.8)
        f0 = set(VC.bm.faces); VC.ell((x + rd * math.cos(a), yy, z + rd * math.sin(a)), 0.12, 0.014, 0.05, seg=6, rings=3, matrix=Matrix.Rotation(-a, 4, 'Z') @ Matrix.Rotation(R.uniform(-0.6, 0.3), 4, 'X'))
        VC.paint([q for q in VC.bm.faces if q not in f0], R.choice(('#3f7a3a', '#4f8a3a', '#356a33')), k=R.uniform(0.85, 1.15))
    CIRCLES.append([round(x, 3), round(z, 3), round(r + 0.1, 3)])


def styro(x, z, n=3, along='z'):
    """保麗龍箱疊起來（餐廳進貨）：白色、膠帶"""
    w, d = (0.62, 0.42) if along == 'z' else (0.42, 0.62)
    for k in range(n):
        y0 = k * 0.3; ox = rr.uniform(-0.03, 0.03)
        VC.crbox(x - w / 2 + ox, x + w / 2 + ox, y0, y0 + 0.29, z - d / 2, z + d / 2, '#f2f2ee', r=0.02, seg=1)
        VC.cbox(x - w / 2 + ox - 0.003, x + w / 2 + ox + 0.003, y0 + 0.27, y0 + 0.292, z - 0.04, z + 0.04, '#c9a24a')   # 膠帶
    block(x, z, w + 0.1, d + 0.1)


def crates(x, z, n=2):
    """塑膠籃（紅、黃）"""
    for k in range(n):
        col = ('#c9463d', '#e0b24a', '#3a6fb0')[(k + int(abs(z))) % 3]; y0 = k * 0.31
        VC.cbox(x - 0.27, x + 0.27, y0, y0 + 0.3, z - 0.2, z + 0.2, col)
        VC.cbox(x - 0.25, x + 0.25, y0 + 0.08, y0 + 0.22, z - 0.205, z - 0.2, '#2b2b2b')   # 手把的洞（暗色）
    block(x, z, 0.64, 0.5)


def bins(x, z, along='z', kinds=(0, 1)):
    """回收桶（藍＝資源回收、綠＝一般、黃＝廚餘），蓋子、正面的字"""
    for j, k in enumerate(kinds):
        o = (j - (len(kinds) - 1) / 2) * 0.52; bx, bz = (x, z + o) if along == 'z' else (x + o, z)
        col = ('#2f6fb8', '#3f8a4f', '#d9a63a')[k]
        VC.crbox(bx - 0.22, bx + 0.22, 0.0, 0.82, bz - 0.22, bz + 0.22, col, r=0.03, seg=1); VC.crbox(bx - 0.24, bx + 0.24, 0.82, 0.9, bz - 0.24, bz + 0.24, col, k=0.85, r=0.02, seg=1)
        fx = bx + (0.225 if FACE_SIDE[0] == 'W' else -0.225)   # 字朝巷子
        u0, v0, u1, v1 = LABEL_UV(k)
        if FACE_SIDE[0] == 'W': uvquad(PR, [(fx, 0.45, bz + 0.15), (fx, 0.45, bz - 0.15), (fx, 0.68, bz - 0.15), (fx, 0.68, bz + 0.15)], (u0, v0, u1, v1))
        else: uvquad(PR, [(fx, 0.45, bz - 0.15), (fx, 0.45, bz + 0.15), (fx, 0.68, bz + 0.15), (fx, 0.68, bz - 0.15)], (u0, v0, u1, v1))
    n = len(kinds); block(x, z, 0.5 if along == 'z' else 0.52 * n, 0.52 * n if along == 'z' else 0.5)


def aframe(x, z, k, side):
    """立式菜單板（A 字架，黑板）：正面朝巷子（材質不剔背面：一片板子一個面）"""
    s = 1 if side == 'W' else -1; H = 0.95
    for sg in (1, -1):   # 前片、後片：從地面往中間斜上去
        xb, xt = x + sg * s * 0.28, x + sg * s * 0.02
        VC.poly([(xb, 0.0, z - 0.3), (xb, 0.0, z + 0.3), (xt, H, z + 0.3), (xt, H, z - 0.3)], '#6a4a30' if sg > 0 else '#5a3e28')
    xb, xt = x + s * 0.292, x + s * 0.032; lerp = lambda t: xb + (xt - xb) * t; u0, v0, u1, v1 = BOARD_UV(k)   # 黑板（比木板往外 1.2 cm）
    zl, zr = (z + 0.26, z - 0.26) if s > 0 else (z - 0.26, z + 0.26)   # 看的人的左手邊（西側朝 +x：左＝+z）
    uvquad(PR, [(lerp(0.08), 0.08, zl), (lerp(0.08), 0.08, zr), (lerp(0.94), 0.9, zr), (lerp(0.94), 0.9, zl)], (u0, v0, u1, v1))
    block(x, z, 0.7, 0.7)


def gas(x, z):
    """瓦斯桶（餐廳後面常見；灰色桶身、黃色頸圈）"""
    ccyl(VC, (x, 0.0, z), (x, 0.78, z), 0.16, '#8a9096', seg=12); ccyl(VC, (x, 0.78, z), (x, 0.86, z), 0.1, '#d9a63a', seg=10); ccyl(VC, (x, 0.86, z), (x, 0.95, z), 0.05, '#5a5a5a', seg=8)
    CIRCLES.append([round(x, 3), round(z, 3), 0.25])


def bike(x, z, col):
    """靠牆停的淑女車（車身順著立面、z 方向）：兩個輪子（扁圓柱）、車架、籃子、座墊"""
    for dz in (-0.47, 0.47):
        ccyl(VC, (x - 0.02, 0.33, z + dz), (x + 0.02, 0.33, z + dz), 0.33, '#2b2b2b', seg=16); ccyl(VC, (x - 0.025, 0.33, z + dz), (x + 0.025, 0.33, z + dz), 0.05, '#9aa0a4', seg=8)
    ccyl(VC, (x, 0.33, z - 0.47), (x, 0.62, z + 0.05), 0.022, col, seg=6); ccyl(VC, (x, 0.33, z + 0.47), (x, 0.82, z + 0.38), 0.022, col, seg=6)
    ccyl(VC, (x, 0.62, z + 0.05), (x, 0.8, z - 0.18), 0.022, col, seg=6); ccyl(VC, (x, 0.33, z - 0.47), (x, 0.8, z - 0.18), 0.02, col, seg=6)
    VC.crbox(x - 0.09, x + 0.09, 0.82, 0.88, z - 0.32, z - 0.08, '#2b2b2b', r=0.02, seg=1)   # 座墊
    ccyl(VC, (x - 0.24, 0.92, z + 0.36), (x + 0.24, 0.92, z + 0.36), 0.014, '#c9ced2', seg=6)   # 把手
    VC.cbox(x - 0.16, x + 0.16, 0.66, 0.86, z + 0.48, z + 0.72, '#c9ced2', k=0.8)   # 籃子
    block(x, z, 0.5, 1.75)


def pole(x, z):
    """電線桿（水泥）：桿子、兩根橫擔、變壓器、礙子；回傳電線掛的點"""
    ccyl(VC, (x, 0.0, z), (x, 9.2, z), 0.17, '#a8a49c', seg=10, r2=0.12)
    pts = []
    for y in (7.6, 8.6):
        VC.cbox(x - 0.06, x + 0.06, y - 0.06, y + 0.06, z - 0.9, z + 0.9, '#5a5d60')
        for dz in (-0.75, 0.0, 0.75): ccyl(VC, (x, y + 0.06, z + dz), (x, y + 0.2, z + dz), 0.035, '#e8e8e4', seg=6); pts.append((x, y + 0.2, z + dz))
    ccyl(VC, (x + 0.32, 5.6, z), (x + 0.32, 6.6, z), 0.24, '#8a9096', seg=12)   # 變壓器
    VC.cbox(x + 0.1, x + 0.18, 6.0, 6.2, z - 0.05, z + 0.05, '#5a5d60')
    VC.cbox(x - 0.16, x + 0.16, 2.2, 2.6, z - 0.165, z - 0.16, '#f2d24a')   # 桿號牌（黃底）
    CIRCLES.append([round(x, 3), round(z, 3), 0.3]); return pts


def wire(a, b, sag=0.4, r=0.012, col='#1e1e1e', n=10):
    """兩點之間下垂的電線（細長的四角管）"""
    P = []
    for i in range(n + 1):
        t = i / n; P.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t))
    for p, q in zip(P, P[1:]): ccyl(WIRE, p, q, r, col, seg=4)


# ---------------- 店門口 ----------------
FACE_SIDE = ['W']
def near_door(side, z, keep=1.45):
    return any(s == side and abs(z - dz) < keep for s, dz in DOORS.values())


PLAN = {   # 店 → [(種類, 離店門的 z 位移, 參數)]；種類的 x 都貼著立面
    'dian': [('pot', -2.4), ('pot', 2.4), ('aframe', -1.6, 0)],
    'self': [('styro', -2.9, 3), ('bins', 2.9, (0, 1, 2))],
    'tea': [('pot_s', -1.5)],
    'home': [('styro', -3.2, 2), ('crates', -2.4, 2), ('pot', 3.3), ('aframe', 1.6, 0)],
    'cafe2': [('pot', -2.8), ('pot', 2.8), ('aframe', -1.6, 3), ('bike', 4.4)],
    'pasta': [('pot', -3.4), ('pot', 2.6), ('aframe', -1.7, 1)],   # 北邊那一盆不能到 z 27.4（路燈在 28）
    'korea': [('pot', -2.9), ('styro', 2.9, 2), ('aframe', 1.65, 2)],
    'omu': [('aframe', -1.6, 1), ('pot', 3.0)],
    'noodle2': [('styro', -3.0, 3), ('gas', -2.2), ('bins', 2.9, (0, 1))],
}
for sid, items in PLAN.items():
    side, dz = DOORS[sid]; FACE_SIDE[0] = side
    for it in items:
        kind, oz = it[0], it[1]; z = dz + oz
        assert abs(oz) >= 1.45, (sid, it)
        if kind == 'pot': pot(side_x(side, 0.32), z)
        elif kind == 'pot_s': pot(side_x(side, 0.25), z, h=0.7, big=False)
        elif kind == 'styro': styro(side_x(side, 0.3), z, it[2])
        elif kind == 'crates': crates(side_x(side, 0.3), z, it[2])
        elif kind == 'bins': bins(side_x(side, 0.3), z, kinds=it[2])
        elif kind == 'aframe': aframe(side_x(side, 1.15), z, it[2], side)
        elif kind == 'gas': gas(side_x(side, 0.25), z)
        elif kind == 'bike': bike(side_x(side, 0.3), z, '#8c3b47')
# 沒有店的那幾段：靠牆的腳踏車、盆栽（住家門口）
for side, z, kind in (('W', -27.5, 'bike'), ('W', -21.0, 'pot'), ('E', -24.0, 'bike'), ('E', -20.5, 'pot'), ('E', 31.0, 'pot'), ('W', 31.5, 'bike'), ('E', -33.0, 'crates')):
    FACE_SIDE[0] = side; assert not near_door(side, z), (side, z)
    if kind == 'bike': bike(side_x(side, 0.3), z, rr.choice(('#3a6fb0', '#e8e8e4', '#2f5d50', '#c9b48a')))
    elif kind == 'pot': pot(side_x(side, 0.32), z)
    else: crates(side_x(side, 0.3), z, 3)

# ---------------- 電線桿、電線 ----------------
P1 = pole(FE - 1.55, -19.2); P2 = pole(FW + 1.55, 8.9)   # 人行道靠路邊（路燈在東側 x 4.85 的 z −30、−10、10、28）
attach = lambda side, z, y: ((FW + 0.05) if side == 'W' else (FE - 0.05), y, z)
for z in (-36.0, -29.0, -12.0, -4.5, 3.0, 15.0, 21.5, 30.0):   # 橫過巷子（立面到立面）
    y = 5.4 + rr.uniform(0, 1.6); wire(attach('W', z, y), attach('E', z + rr.uniform(-1.5, 1.5), y + rr.uniform(-0.5, 0.5)), sag=0.35 + rr.uniform(0, 0.25))
for p in P1: wire(p, attach('E', p[2] - 6.0, 6.2), sag=0.3); wire(p, attach('W', p[2] + 4.0, 6.6), sag=0.6)   # 電線桿 → 兩側的樓
for p in P2: wire(p, attach('W', p[2] + 6.5, 6.0), sag=0.3); wire(p, attach('E', p[2] - 3.5, 6.8), sag=0.6)
for p, q in zip(P1, P2): wire(p, q, sag=1.1)   # 桿到桿（斜過巷子）
for side in ('W', 'E'):   # 沿著立面的電線（二樓樓板下面）、幾段一捆
    for (za, zb) in ((Z0 + 1.0, -20.0), (-20.0, 4.0), (4.0, 20.0), (20.0, Z1 - 1.0)):
        for k, y in enumerate((GH + 0.25, GH + 0.4)):
            a = attach(side, za, y); b = attach(side, zb, y); off = (0.06 + 0.05 * k) * (1 if side == 'W' else -1)
            wire((a[0] + off, a[1], a[2]), (b[0] + off, b[1], b[2]), sag=0.25 + 0.1 * k, r=0.015 if k == 0 else 0.01, n=14)

# ---------------- 機車的位置（給遊戲；模型用 bldg.wz_scooter） ----------------
BAYS = [tuple(r) for r in LAY['scooters']['zRanges']]
rs = random.Random(1181)
for (za, zb) in BAYS:   # 畫好的機車格：垂直路邊停（車頭朝巷子或朝路邊）
    for side in ('W', 'E'):
        n = int((zb - za) / 0.85); sx = -1 if side == 'W' else 1
        for k in range(n):
            if rs.random() < 0.15: continue
            z = za + (k + 0.5) * 0.85; x = sx * (LX1 - 1.05)
            ry = (PI / 2 if side == 'W' else -PI / 2) + (PI if rs.random() < 0.35 else 0.0) + rs.uniform(-0.06, 0.06)
            SCOOTERS.append([round(x, 3), round(z, 3), round(ry, 4), f'{side}b{int(za)}'])
        block(sx * (LX1 - 1.05), (za + zb) / 2, 1.9, zb - za + 0.1, SCB)
RED_N, RED_S = -38.0, 26.0   # 巷底、巷口 8 m 內紅線（lane118_ground_tex.py）
for side in ('W', 'E'):   # 中間那一段：靠路邊順著停，兩三台一組；店門口、機車格、紅線不停
    sx = -1 if side == 'W' else 1; z = RED_N + 0.6; run = []
    while z < RED_S - 1.0:
        free = not near_door(side, z, keep=2.4) and not any(a - 1.2 <= z <= b + 1.2 for a, b in BAYS)
        if free and rs.random() < 0.82:
            run.append(z)
        elif run:
            for zz in run: SCOOTERS.append([round(sx * (LX1 - 0.62), 3), round(zz, 3), round((0.0 if rs.random() < 0.5 else PI) + rs.uniform(-0.05, 0.05), 4), f'{side}{int((zz + 40) // 24)}'])
            block(sx * (LX1 - 0.62), (run[0] + run[-1]) / 2, 0.85, run[-1] - run[0] + 1.95, SCB); run = []
        z += 1.95
    if run:
        for zz in run: SCOOTERS.append([round(sx * (LX1 - 0.62), 3), round(zz, 3), 0.0, f'{side}{int((zz + 40) // 24)}'])
        block(sx * (LX1 - 0.62), (run[0] + run[-1]) / 2, 0.85, run[-1] - run[0] + 1.95, SCB)

# ---------------- 晚上店門口的光（給遊戲：TK.lightPool） ----------------
for sid, (side, dz) in DOORS.items(): POOLS.append([round(side_x(side, 1.3), 3), round(dz, 3), 2.6])

# ---------------- 匯出 ----------------
for m in (VC, WIRE): m.finish(root, uv=False)
PR.finish(root, uv=False)
st = L.export(OUT, gpu_instances=False)
tris = 0
for ob in bpy.data.objects:
    if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
lay = dict(version=1, zone='lane118', coords='118 巷區域座標（x 東、z 南），放在原點',
           src='LAWWW2-C 2026-10-20 ART-L118-LANE-1020（lane118_props.py）', blocks=BLOCKS, circles=CIRCLES, scooters=SCOOTERS, scooter_blocks=SCB, pools=POOLS,
           note='blocks（道具）、scooter_blocks（機車那幾排）＝[中心 x, 中心 z, 寬（x）, 深（z）]；circles＝[x, z, 半徑]；scooters＝[x, z, ry（套件機車：ry 0＝車頭朝 +z）, 組]；pools＝[x, z, 半徑]（晚上店門口的光）')
L.write_json(OUT[:-4] + '.layout.json', lay)
L.write_json(OUT[:-4] + '.json', dict(st if isinstance(st, dict) else {}, tris_total=tris, scooters=len(SCOOTERS), blocks=len(BLOCKS), circles=len(CIRCLES), pools=len(POOLS)))
print(json.dumps(dict(tris=tris, scooters=len(SCOOTERS), blocks=len(BLOCKS), circles=len(CIRCLES), pools=len(POOLS)), ensure_ascii=False))
print('LANE118_PROPS OK')
