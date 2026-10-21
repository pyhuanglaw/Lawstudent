"""新社科院外觀（D56「現代台大平行校園」；LAWWW 2026-10-13 17:20Z 指定）→ GLB（校園世界座標）。第二 AI 工作階段（環境美術）製作：
  /opt/blenv/bin/python tools/blender/env_second/campus_socsci.py [-- --out 輸出.glb]

三個部分（位置照 LAWWW 的 docs/campus/SOCSCI_PLAN.md 第 3 節＋17:20Z 的回覆）：
  ① 辜先生紀念圖書館（社會科學院圖書館）：x 95–125、z −92～−70（30×22、一層、不轉向）。室內是 ⑬（src/data/soclib_layout.js，區域 soclib）：
     北、西兩面玻璃帷幕（朝萬才館、法學院廣場），南、東兩面實牆；入口在南牆、室內座標 x=−9（世界 x≈101），面向中庭。
     從玻璃看得到室內：白色樹狀柱＋荷葉柱頂（照 ⑬ 的 20 支柱子）、天花板的圓形天窗（照 ⑬ 的 40 個）、窗邊的長桌、閱覽桌；屋頂是植栽屋頂＋天窗的玻璃頂。
  ② 社會科學院大樓：x 95–125、z −58～−42（30×16、8 層），清水混凝土（模板分割線＋螺栓孔，gen_socsci_textures.py），每層一排深窗洞；
     一樓西面、北面往內退 2.4 m 的玻璃大廳（上面的樓層懸挑、外側一排柱子）：西面主入口（「社會科學院」匾額）、北面次入口（中庭）。
  ③ 中庭 z −70～−58：鋪面、長椅、樹穴（中間留空：開學典禮、迎新、聚會）。
**和真實不一樣（遊戲化，LAWWW／使用者決定）**：真實是大樓靠辛亥路（北）、圖書館在南；這裡南北對調，讓圖書館面向法學院廣場與霖澤館。
**沒有照片**：圖書館（玻璃、樹狀柱、荷葉柱頂、天窗、屋頂綠化）照公開的文字資料；大樓的立面分割（窗洞、一樓退縮）是推測。
材質名稱照校園地標的約定（zones3d.js attachWenzhouModel）：ck_glass（窗，亮燈／沒亮燈）、ck_frame、ck_trim_win（不投影）、ck_ceiling（屋簷底下）、
  ck_glass_lit（圖書館與大廳的天花板：晚上亮）、wz_lamp_lens（雨遮的燈）；透明玻璃 soc_glass_clear（遊戲端是透明材質：不投影）。招牌：PLATE_FACE_*（字由遊戲畫）。
"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy   # noqa: E402
from cafe_layout import uv01   # noqa: E402
import archkit as K   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/campus_socsci.glb'

# ---- 位置（世界座標）----
LX0, LX1, LZ0, LZ1 = 95.0, 125.0, -92.0, -70.0      # 圖書館
LCX, LCZ = (LX0 + LX1) / 2, (LZ0 + LZ1) / 2
HIN = 5.6                                           # 室內天花板（⑬ H）
HF0, HF1 = 5.6, 6.15                                # 屋簷（白色）
OVN = 0.6                                           # 北、西兩面玻璃上方的屋簷外挑
BX0, BX1, BZ0, BZ1 = 95.0, 125.0, -58.0, -42.0      # 大樓
GF, FH, NF = 4.5, 3.6, 8
YR = GF + (NF - 1) * FH                             # 屋頂 29.7
RECW, RECN = 97.4, -55.6                            # 一樓大廳的玻璃線（西面 x、北面 z）
DOOR_LIB = 101.0                                    # 圖書館入口（⑬ 入口 x=−9）


def load_soclib():
    src = open(os.path.join(L.ROOT, 'src/data/soclib_layout.js'), encoding='utf8').read()
    return json.loads(src[src.index('{', src.index('const SOCLIB_LAYOUT=')):src.rindex('}') + 1])


def build():
    out = os.path.join(L.ROOT, OUT)
    J = load_soclib()
    assert abs(J['W'] - (LX1 - LX0)) < 1e-6 and abs(J['D'] - (LZ1 - LZ0)) < 1e-6, '圖書館大小和 ⑬ 不一樣'
    B.reset(texres=512)
    root = B.group('campus_socsci', props={'kind': 'campus_socsci'})
    M = {
        'conc': L.pbr('soc_concrete', 'socsci_formwork', tile=1.8, normal=0.6, maps=('diff', 'nor'), rough_value=0.82),
        'pillar': L.pbr('wz_pillar_soc', 'socsci_formwork', tile=1.8, normal=0.6, maps=('diff', 'nor'), rough_value=0.82),   # 一樓柱廊的柱子：和 conc 同一組貼圖，另一個材質——遊戲端 wz_pillar_* 擋住玩家時網點透空（巡場景 2026-10-21：鏡頭在柱廊裡，柱子把人整個擋住）
        'white': L.flat('soc_white', '#eeede8', rough=0.55),                 # 圖書館屋簷、雨遮、女兒牆壓頂（白色烤漆）
        'gclear': L.flat('soc_glass_clear', '#9fb5bd', rough=0.06, alpha=0.3),
        'frame': L.flat('ck_frame', '#4b5056', rough=0.42, metal=0.3),       # 大樓的深灰鋁框、門框
        'glass': L.vc_material('ck_glass', rough=0.12),
        'ceilL': L.flat('ck_glass_lit', '#f2f1ec', rough=0.7),               # 圖書館、大廳的天花板＋樹狀柱（遊戲：晚上亮）
        'ceil': L.flat('ck_ceiling', '#e7eaeb', rough=0.9),                  # 屋簷底下、天花板上的圓形天窗
        'green': L.pbr('soc_green_roof', 'leafy_grass', tile=2.2, target='#5f7b47', maps=('diff',), res=256, rough_value=0.95),
        'pave': L.pbr('soc_paving', 'granite_tile', tile=1.2, target='#b8b3a9', normal=0.4, maps=('diff', 'nor'), rough_value=0.8),
        'misc': L.vc_material('soc_misc', rough=0.7),                       # 頂點色：閱覽桌、窗邊長桌、門、屋頂防水層、天窗玻璃、室內白牆、櫃台、沙發…（draw call 少）
        'lamp': L.flat('wz_lamp_lens', '#f3ead6', rough=0.4),
        'board': L.flat('ck_board', '#cfccc4', rough=0.8),
    }
    K.setup_glass(M['glass'])
    BAMBOO, DARK, ROOFC, SKYC, PLASTER = '#c8a66b', '#3a3d40', '#8b8d8c', '#506672', '#ecebe6'
    accs = {}
    VC = ('glass', 'misc')
    kit = K.Kit(M, accs, 'soc_', place=(0.0, 0.0, 0.0), vc=VC)
    A = kit.acc
    plates = []
    info_blocks = {'rects': [], 'circles': [], 'doors': [], 'cam': []}

    def plate(name, fr, u0, u1, v0, v1, d, props):
        m = Mesh(name, M['board']); kit.face(m, [fr.p(u0, v0, d), fr.p(u1, v0, d), fr.p(u1, v1, d), fr.p(u0, v1, d)], fr.N); plates.append((m, props))

    def hquad(m, x0, x1, z0, z1, y, up=True, col=None):
        f = kit.face(m, [(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)], (0, 1 if up else -1, 0))
        if col: m.paint([f], col)

    def disc(m, cx, cz, r, y, n=14, up=True, col=None):
        pts = [(cx + r * math.cos(2 * math.pi * k / n), y, cz + r * math.sin(2 * math.pi * k / n)) for k in range(n)]
        f = kit.face(m, pts, (0, 1 if up else -1, 0))
        if col: m.paint([f], col)

    def ring(m, cx, cz, r0, y0, r1, y1, n=14, outward=True):
        for k in range(n):
            a0, a1 = 2 * math.pi * k / n, 2 * math.pi * (k + 1) / n
            p = [(cx + r0 * math.cos(a0), y0, cz + r0 * math.sin(a0)), (cx + r0 * math.cos(a1), y0, cz + r0 * math.sin(a1)),
                 (cx + r1 * math.cos(a1), y1, cz + r1 * math.sin(a1)), (cx + r1 * math.cos(a0), y1, cz + r1 * math.sin(a0))]
            am = (a0 + a1) / 2; nrm = (math.cos(am) * (1 if outward else -1), 0.3 if r1 > r0 else 0.0, math.sin(am) * (1 if outward else -1))
            kit.face(m, p, nrm)

    # =====================================================================
    # ① 圖書館
    # =====================================================================
    LF = K.faces4(LX1 - LX0, LZ1 - LZ0, LCX, LCZ)
    NORTH, WEST, SOUTH, EAST = LF['back'], LF['left'], LF['front'], LF['right']

    def curtain(fr, half, step):
        """玻璃帷幕：一整片透明玻璃＋白色細框（直框每 step 公尺、一道橫框、上下框）＋深色基座"""
        y0 = 0.12
        kit.rect(A('gclear'), fr, -half, half, y0, HIN, 0.0)
        kit.fbox('misc', fr, -half, half, 0.0, y0, -0.12, 0.06, skip=('in', 'bottom'), col=DARK)
        n = int(round(2 * half / step))
        for i in range(n + 1):
            u = -half + 2 * half * i / n
            kit.fbox('white', fr, u - 0.035, u + 0.035, y0, HIN, -0.14, 0.07, skip=('bottom', 'top', 'in'))
        for v in (3.0,):
            kit.fbox('white', fr, -half, half, v - 0.03, v + 0.03, -0.1, 0.05, skip=('l', 'r', 'in'))
        kit.fbox('white', fr, -half, half, HIN - 0.08, HIN, -0.12, 0.06, skip=('l', 'r', 'in', 'top'))

    curtain(NORTH, 15.0, 1.5)
    curtain(WEST, 11.0, 22.0 / 14)
    # 南牆（中庭那一面）：清水混凝土、入口（⑬ 入口 x=−9：寬 2.4）、雨遮、招牌
    hole = {'u': DOOR_LIB - LCX, 'a': 1.25, 'vb': 0.0, 'vs': 2.9, 'arch': False, 'vt': 2.9}
    kit.wall_strip(SOUTH, -15.0, 15.0, 0.0, HF0, [hole], mk='conc')
    u = DOOR_LIB - LCX
    for s in (-1, 1):   # 門洞內側
        kit.strip(A('conc'), SOUTH, (u + s * 1.25, 0.0), (u + s * 1.25, 2.9), 0.0, -0.35, (-s, 0, 0))
    kit.strip(A('conc'), SOUTH, (u - 1.25, 2.9), (u + 1.25, 2.9), 0.0, -0.35, (0, -1, 0))
    kit.rect(A('gclear'), SOUTH, u - 1.25, u + 1.25, 0.0, 2.9, -0.3)                    # 玻璃自動門
    for uu in (u - 1.22, u, u + 1.22):
        kit.fbox('frame', SOUTH, uu - 0.04, uu + 0.04, 0.0, 2.9, -0.34, -0.26, skip=('in', 'bottom', 'top'))
    kit.fbox('frame', SOUTH, u - 1.25, u + 1.25, 2.3, 2.38, -0.34, -0.26, skip=('in',))
    # 雨遮（白色薄板，外挑 1.8 m）＋燈
    CX0, CX1 = DOOR_LIB - 2.4, DOOR_LIB + 2.4
    kit.box('white', CX0, CX1, 3.05, 3.25, LZ1, LZ1 + 1.8, skip=('back', 'bottom'))
    hquad(A('ceil'), CX0, CX1, LZ1, LZ1 + 1.8, 3.049, up=False)
    for x in (DOOR_LIB - 1.2, DOOR_LIB + 1.2):
        hquad(A('lamp'), x - 0.18, x + 0.18, LZ1 + 0.7, LZ1 + 1.06, 3.045, up=False)
    g = B.group('GLOW_soc_lib_door', root, props={'glow': 'rgba(255,226,180,1)', 'size': 1.6, 'day': 0, 'night': 0.6}); g.location = g2b(DOOR_LIB, 2.95, LZ1 + 0.9)
    plate('PLATE_FACE_SOC_LIB', SOUTH, u + 3.0, u + 9.6, 3.55, 4.25, 0.012, {'text': '社會科學院圖書館', 'bg': '#b8b5ae', 'color': '#2b2824', 'serif': 1, 'fs': 0.7})
    plate('PLATE_FACE_SOC_LIB_SUB', SOUTH, u + 3.6, u + 9.0, 3.1, 3.42, 0.012, {'text': '辜先生紀念圖書館', 'bg': '#b8b5ae', 'color': '#2b2824', 'serif': 1, 'fs': 0.62})
    info_blocks['doors'].append({'what': '圖書館入口（往 soclib 區域）', 'x': DOOR_LIB, 'z': LZ1 + 0.7, 'note': '門在南牆 x 99.8–102.2；互動點建議 (101, −69.3)，半徑 1.2；出來站在 (101, −67.6) 面向南'})
    # 東牆：實牆＋服務門
    sd = {'u': -(-75.4 - LCZ), 'a': 0.6, 'vb': 0.0, 'vs': 2.4, 'arch': False, 'vt': 2.4}
    kit.wall_strip(EAST, -11.0, 11.0, 0.0, HF0, [sd], mk='conc')
    kit.cface(A('misc'), [EAST.p(sd['u'] - 0.6, 0.0, -0.12), EAST.p(sd['u'] + 0.6, 0.0, -0.12), EAST.p(sd['u'] + 0.6, 2.4, -0.12), EAST.p(sd['u'] - 0.6, 2.4, -0.12)], EAST.N, DARK)
    for s in (-1, 1): kit.strip(A('conc'), EAST, (sd['u'] + s * 0.6, 0.0), (sd['u'] + s * 0.6, 2.4), 0.0, -0.12, (-s, 0, 0))
    kit.strip(A('conc'), EAST, (sd['u'] - 0.6, 2.4), (sd['u'] + 0.6, 2.4), 0.0, -0.12, (0, -1, 0))
    # 屋簷（白色）：北、西兩面外挑 OVN（玻璃上面遮陽），南、東兩面 0.3
    ex0, ex1, ez0, ez1 = LX0 - OVN, LX1 + 0.3, LZ0 - OVN, LZ1 + 0.3
    kit.box('white', ex0, ex1, HF0, HF1, ez0, ez1, skip=('bottom', 'top'))
    for (a0, a1, b0, b1) in ((ex0, ex1, ez0, LZ0), (ex0, LX0, LZ0, LZ1), (ex0, ex1, LZ1, ez1), (LX1, ex1, LZ0, LZ1)):
        hquad(A('ceil'), a0, a1, b0, b1, HF0 - 0.001, up=False)
    # 屋頂：植栽（內縮 0.8 m）＋白色壓頂＋天窗的玻璃頂（照 ⑬ 的位置）
    PI_ = 0.45
    hquad(A('white'), ex0, ex1, ez0, ez0 + PI_, HF1); hquad(A('white'), ex0, ex1, ez1 - PI_, ez1, HF1)
    hquad(A('white'), ex0, ex0 + PI_, ez0 + PI_, ez1 - PI_, HF1); hquad(A('white'), ex1 - PI_, ex1, ez0 + PI_, ez1 - PI_, HF1)
    for (a, b, c, d_, n) in (((ex0 + PI_, ez0 + PI_), (ex1 - PI_, ez0 + PI_), 0, 0, (0, 0, 1)), ((ex0 + PI_, ez1 - PI_), (ex1 - PI_, ez1 - PI_), 0, 0, (0, 0, -1)),
                             ((ex0 + PI_, ez0 + PI_), (ex0 + PI_, ez1 - PI_), 0, 0, (1, 0, 0)), ((ex1 - PI_, ez0 + PI_), (ex1 - PI_, ez1 - PI_), 0, 0, (-1, 0, 0))):
        kit.face(A('white'), [(a[0], HF1 - 0.15, a[1]), (b[0], HF1 - 0.15, b[1]), (b[0], HF1, b[1]), (a[0], HF1, a[1])], n)   # 壓頂內側
    hquad(A('green'), ex0 + PI_, ex1 - PI_, ez0 + PI_, ez1 - PI_, HF1 - 0.15)
    for s in J['skylights']:
        x, z, r = LCX + s['x'], LCZ + s['z'], s['r']
        ring(A('white'), x, z, r + 0.06, HF1 - 0.15, r + 0.06, HF1 - 0.03, n=14)   # 天窗的白色矮框（離植栽 12 cm）
        ring(A('white'), x, z, r + 0.06, HF1 - 0.03, r, HF1 - 0.03, n=14)
        disc(A('misc'), x, z, r, HF1 - 0.035, n=14, up=True, col=SKYC)            # 深色的玻璃頂
        disc(A('ceil'), x, z, r, HIN - 0.012, n=14, up=False)        # 室內天花板上的圓形天窗（從玻璃看進去）
    # 室內（從玻璃看進去）：地板、天花板、南牆與東牆的內側、樹狀柱＋荷葉柱頂、窗邊長桌、閱覽桌
    hquad(A('pave'), LX0 + 0.05, LX1 - 0.2, LZ0 + 0.05, LZ1 - 0.2, 0.006)
    hquad(A('ceilL'), LX0 + 0.05, LX1 - 0.2, LZ0 + 0.05, LZ1 - 0.2, HIN, up=False)
    zi = LZ1 - 0.2; dx0, dx1 = DOOR_LIB - 1.25, DOOR_LIB + 1.25   # 南牆內側（門的地方挖空：從門外看得到裡面）
    for (a0, a1, y0, y1) in ((LX0 + 0.05, dx0, 0.0, HIN), (dx1, LX1 - 0.2, 0.0, HIN), (dx0, dx1, 2.9, HIN)):
        kit.cface(A('misc'), [(a0, y0, zi), (a1, y0, zi), (a1, y1, zi), (a0, y1, zi)], (0, 0, -1), PLASTER)
    for s_ in (dx0, dx1): kit.cface(A('misc'), [(s_, 0.0, LZ1), (s_, 0.0, zi), (s_, 2.9, zi), (s_, 2.9, LZ1)], (1 if s_ == dx0 else -1, 0, 0), PLASTER)
    kit.cface(A('misc'), [(LX1 - 0.2, 0, LZ0 + 0.05), (LX1 - 0.2, 0, LZ1 - 0.2), (LX1 - 0.2, HIN, LZ1 - 0.2), (LX1 - 0.2, HIN, LZ0 + 0.05)], (-1, 0, 0), PLASTER)
    for c in J['columns']:
        x, z, r, cap, cy = LCX + c['x'], LCZ + c['z'], c['r'], c['cap'], c['capY']
        # 柱子、荷葉柱頂和天花板同一個材質（ck_glass_lit：白天是白色，晚上遊戲讓它亮——晚上從外面看，白色的樹狀柱是亮的；柱頂不亮會擋住大半個天花板）
        ring(A('ceilL'), x, z, r * 1.12, 0.0, r, cy - 0.6, n=10)
        ring(A('ceilL'), x, z, r, cy - 0.6, cap, cy, n=24)
        ring(A('ceilL'), x, z, cap, cy, cap, cy + 0.05, n=24)
        disc(A('ceilL'), x, z, cap, cy + 0.05, n=24, up=True)
    for f in J['furniture']:
        if f['type'] == 'windowCounter':
            if f['side'] == 'north': x0, x1, z0, z1 = LCX + f['x0'], LCX + f['x1'], LCZ + f['z'] - f['d'] / 2, LCZ + f['z'] + f['d'] / 2
            else: x0, x1, z0, z1 = LCX + f['x'] - f['d'] / 2, LCX + f['x'] + f['d'] / 2, LCZ + f['z0'], LCZ + f['z1']
            kit.box('misc', x0, x1, 0.72, 0.77, z0, z1, skip=('bottom',), col=BAMBOO)
            if f['side'] == 'north': kit.box('misc', x0, x1, 0.0, 0.72, z0, z0 + 0.04, skip=('top', 'bottom'), col=BAMBOO)
            else: kit.box('misc', x0, x0 + 0.04, 0.0, 0.72, z0, z1, skip=('top', 'bottom'), col=BAMBOO)
        elif f['type'] == 'readingTable':
            x, z, w, d = LCX + f['x'], LCZ + f['z'], f['w'], f['d']
            kit.box('misc', x - w / 2, x + w / 2, 0.72, 0.77, z - d / 2, z + d / 2, skip=('bottom',), col=BAMBOO)
            for s in (-1, 1): kit.box('misc', x + s * (w / 2 - 0.3) - 0.03, x + s * (w / 2 - 0.3) + 0.03, 0.0, 0.72, z - d / 2 + 0.1, z + d / 2 - 0.1, skip=('top', 'bottom'), col=BAMBOO)
    info_blocks['rects'].append({'what': '圖書館', 'x': LCX, 'z': LCZ, 'w': LX1 - LX0, 'd': LZ1 - LZ0})
    info_blocks['cam'].append({'what': '圖書館', 'box': [LX0, 0.0, LZ0, LX1, HF1, LZ1]})

    # =====================================================================
    # ② 大樓
    # =====================================================================
    BF = K.faces4(BX1 - BX0, BZ1 - BZ0, (BX0 + BX1) / 2, (BZ0 + BZ1) / 2)
    BN, BW, BS, BE = BF['back'], BF['left'], BF['front'], BF['right']
    bcx, bcz = (BX0 + BX1) / 2, (BZ0 + BZ1) / 2

    def floor_y(k): return 0.0 if k == 0 else GF + (k - 1) * FH

    def band(fr, half, bays, k, glass_gf=False):
        """一層樓的一面：每個開間一扇深窗洞（窗洞內側清水混凝土、深灰鋁框、中間一支直櫺）"""
        y0 = floor_y(k); y1 = GF if k == 0 else y0 + FH
        sill, head = (1.0, 3.4) if k == 0 else (1.0, 3.2)
        holes = []
        for u in bays:
            holes.append(kit.window(fr, u, y0 + sill, 2.3, head - sill, 0.0, K.lit_hash(fr.O[0], fr.O[2], u, k), rect_=True, dep=0.3, proud=0.0,
                                    has_sill=False, fmat='conc', mull=[0.0], transom=None))
        kit.wall_strip(fr, -half, half, y0, y1, holes, mk='conc')

    NS_BAYS = [-13.5 + 3 * i for i in range(10)]
    EW_BAYS = [-6.0 + 3 * i for i in range(5)]
    for k in range(NF):
        if k == 0:   # 一樓：南面、東面是實牆＋窗（西南角、東北角的實牆那一格不開窗）；西面、北面是往內退的玻璃大廳
            band(BS, 15.0, NS_BAYS[1:], 0)
            band(BE, 8.0, EW_BAYS[:-1], 0)
        else:
            for fr, half, bays in ((BN, 15.0, NS_BAYS), (BS, 15.0, NS_BAYS), (BW, 8.0, EW_BAYS), (BE, 8.0, EW_BAYS)):
                band(fr, half, bays, k)
    # 女兒牆（外側、壓頂、內側）
    for fr, half in ((BN, 15.0), (BS, 15.0), (BW, 8.0), (BE, 8.0)):
        kit.wall_strip(fr, -half, half, YR, YR + 0.9, [], mk='conc')
    kit.box('conc', BX0, BX1, YR + 0.9, YR + 0.98, BZ0, BZ1, skip=('bottom', 'front', 'back', 'left', 'right'))
    t = 0.25
    for (a0, a1, b0, b1, n) in ((BX0 + t, BX1 - t, BZ0 + t, BZ0 + t, (0, 0, 1)), (BX0 + t, BX1 - t, BZ1 - t, BZ1 - t, (0, 0, -1))):
        kit.face(A('conc'), [(a0, YR, b0), (a1, YR, b0), (a1, YR + 0.9, b1), (a0, YR + 0.9, b1)], n)
    for (a0, b0, b1, n) in ((BX0 + t, BZ0 + t, BZ1 - t, (1, 0, 0)), (BX1 - t, BZ0 + t, BZ1 - t, (-1, 0, 0))):
        kit.face(A('conc'), [(a0, YR, b0), (a0, YR, b1), (a0, YR + 0.9, b1), (a0, YR + 0.9, b0)], n)
    hquad(A('misc'), BX0 + t, BX1 - t, BZ0 + t, BZ1 - t, YR + 0.01, col=ROOFC)
    kit.box('conc', 104.0, 112.0, YR, YR + 3.6, -52.0, -47.0, skip=('bottom',))          # 樓梯、電梯的機房
    for (x, z) in ((98.5, -55.0), (101.0, -55.0), (98.5, -45.0), (101.0, -45.0), (118.0, -55.0), (120.5, -55.0)):
        kit.box('misc', x - 0.8, x + 0.8, YR, YR + 1.1, z - 0.6, z + 0.6, skip=('bottom',), col='#b9bcbd')   # 冷氣室外機
        kit.box('misc', x - 0.5, x + 0.5, YR + 1.1, YR + 1.12, z - 0.5, z + 0.5, skip=('bottom',), col='#3d4144')
    # ---- 一樓：西面、北面往內退的玻璃大廳（上面懸挑）----
    # 外側的柱子（0.6 × 0.6）
    cols = [(95.3, -57.7)] + [(95.3, z) for z in (-54.5, -51.5, -48.5, -45.5)] + [(x, -57.7) for x in (98.0, 101.0, 104.0, 107.0, 110.0, 113.0, 116.0, 119.0, 122.0)]
    for (x, z) in cols:
        kit.box('pillar', x - 0.3, x + 0.3, 0.0, GF, z - 0.3, z + 0.3, skip=('bottom', 'top'))
        info_blocks['rects'].append({'what': '大樓一樓的柱子', 'x': x, 'z': z, 'w': 0.6, 'd': 0.6})
    # 懸挑的底面、轉角的實牆
    hquad(A('ceil'), BX0, BX1 - 1.0, BZ0, RECN, GF - 0.001, up=False)
    hquad(A('ceil'), BX0, RECW, RECN, -43.0, GF - 0.001, up=False)
    kit.box('conc', BX0, RECW, 0.0, GF, -43.0, BZ1, skip=('bottom', 'top', 'front'))       # 西南角
    kit.box('conc', BX1 - 1.0, BX1, 0.0, GF, BZ0, RECN, skip=('bottom', 'top', 'right'))   # 東北角
    info_blocks['rects'].append({'what': '大樓（一樓大廳的玻璃線以內）', 'x': (RECW + BX1) / 2, 'z': (RECN + BZ1) / 2, 'w': BX1 - RECW, 'd': BZ1 - RECN})
    info_blocks['rects'].append({'what': '大樓西南角實牆', 'x': (BX0 + RECW) / 2, 'z': (-43.0 + BZ1) / 2, 'w': RECW - BX0, 'd': BZ1 + 43.0})
    info_blocks['rects'].append({'what': '大樓東北角實牆', 'x': BX1 - 0.5, 'z': (BZ0 + RECN) / 2, 'w': 1.0, 'd': RECN - BZ0})
    info_blocks['cam'].append({'what': '大樓（懸挑以上）', 'box': [BX0, GF, BZ0, BX1, YR + 0.98, BZ1]})
    info_blocks['cam'].append({'what': '大樓一樓', 'box': [RECW, 0.0, RECN, BX1, GF, BZ1]})
    # 大廳的玻璃（透明）、框、門
    LW = K.Fr((RECW, 0, (RECN - 43.0) / 2), (0, 0, 1), (-1, 0, 0))      # 西面玻璃線（u＝往南）
    LN = K.Fr(((RECW + BX1 - 1.0) / 2, 0, RECN), (-1, 0, 0), (0, 0, -1))   # 北面玻璃線（u＝往西）
    halfW = (-43.0 - RECN) / 2; halfN = (BX1 - 1.0 - RECW) / 2
    for fr, half, door_u in ((LW, halfW, -50.0 - (RECN - 43.0) / 2), (LN, halfN, ((RECW + BX1 - 1.0) / 2) - 110.0)):
        kit.rect(A('gclear'), fr, -half, half, 0.0, GF, 0.0)
        n = int(round(2 * half / 1.5))
        for i in range(n + 1):
            uu = -half + 2 * half * i / n
            if abs(uu - door_u) < 1.3 and i not in (0, n): continue
            kit.fbox('frame', fr, uu - 0.04, uu + 0.04, 0.0, GF, -0.08, 0.06, skip=('bottom', 'top', 'in'))
        kit.fbox('frame', fr, -half, half, 3.0 - 0.03, 3.0 + 0.03, -0.06, 0.05, skip=('l', 'r', 'in'))
        for uu in (door_u - 1.25, door_u + 1.25):
            kit.fbox('frame', fr, uu - 0.05, uu + 0.05, 0.0, 3.0, -0.08, 0.08, skip=('bottom', 'in'))
        kit.fbox('frame', fr, door_u - 0.03, door_u + 0.03, 0.0, 2.9, -0.04, 0.04, skip=('bottom', 'in'))   # 兩扇門中間
    info_blocks['doors'].append({'what': '大樓西面主入口', 'x': RECW - 0.8, 'z': -50.0, 'note': '玻璃門 z −51.25～−48.75（x=97.4）；外面是 2.4 m 寬、有柱子的走廊'})
    info_blocks['doors'].append({'what': '大樓北面入口（中庭）', 'x': 110.0, 'z': RECN - 0.8, 'note': '玻璃門 x 108.75–111.25（z=−55.6）'})
    # 大廳裡面（從玻璃看進去）：地板（鋪面延伸進來）、天花板（晚上亮）、後牆、櫃台、沙發、公告欄、螢幕
    for (a0, a1, b0, b1) in ((RECW, 103.4, RECN, -43.0), (103.4, BX1 - 1.0, RECN, -49.6)):
        hquad(A('pave'), a0, a1, b0, b1, 0.012)
        hquad(A('ceilL'), a0, a1, b0, b1, 4.3, up=False)
    kit.cface(A('misc'), [(103.4, 0, -49.6), (103.4, 0, -43.0), (103.4, 4.3, -43.0), (103.4, 4.3, -49.6)], (-1, 0, 0), PLASTER)
    kit.cface(A('misc'), [(103.4, 0, -49.6), (BX1 - 1.0, 0, -49.6), (BX1 - 1.0, 4.3, -49.6), (103.4, 4.3, -49.6)], (0, 0, -1), PLASTER)
    kit.cface(A('misc'), [(RECW, 0, -43.0), (103.4, 0, -43.0), (103.4, 4.3, -43.0), (RECW, 4.3, -43.0)], (0, 0, -1), PLASTER)
    kit.cface(A('misc'), [(BX1 - 1.0, 0, RECN), (BX1 - 1.0, 0, -49.6), (BX1 - 1.0, 4.3, -49.6), (BX1 - 1.0, 4.3, RECN)], (-1, 0, 0), PLASTER)
    kit.box('misc', 101.4, 102.3, 0.0, 1.05, -53.6, -50.9, skip=('bottom',), col='#6b5b4a')       # 服務台
    for x in (113.5, 119.0):
        kit.box('misc', x - 1.0, x + 1.0, 0.0, 0.45, -54.9, -54.1, skip=('bottom',), col='#4f5559')   # 沙發
        kit.box('misc', x - 1.0, x + 1.0, 0.45, 0.85, -54.1, -53.85, skip=('bottom',), col='#4f5559')
    kit.box('misc', 107.5, 112.5, 1.0, 2.3, -49.62, -49.6, skip=(), col='#a8865a')                  # 公告欄（院、經濟系、政治系）
    kit.box('misc', 103.38, 103.4, 1.7, 2.9, -47.6, -45.0, skip=(), col='#15181b')                  # 大螢幕
    D_ = K.Fr((103.38, 0, -46.3), (0, 0, -1), (-1, 0, 0))
    plate('PLATE_FACE_SOC_DIR', D_, -1.9, 1.9, 1.05, 1.45, 0.0, {'text': '經濟系．政治系．社會系．社工系', 'bg': '#f4f2ec', 'color': '#2b2824', 'serif': 0})
    # 匾額：西面一樓上方（2F 窗台下面的混凝土帶）
    plate('PLATE_FACE_SOC_MAIN', BW, -4.2, 4.2, GF + 0.12, GF + 0.86, 0.015, {'text': '社會科學院', 'bg': '#b9b6af', 'color': '#2a2622', 'serif': 1, 'fs': 0.72})
    # 大廳外的燈（懸挑底下）
    for z in (-56.6, -53.0, -50.0, -47.0, -44.0):
        hquad(A('lamp'), 96.0, 96.4, z - 0.2, z + 0.2, GF - 0.004, up=False)
    for x in (99.5, 104.5, 110.0, 115.5, 120.5):
        hquad(A('lamp'), x - 0.2, x + 0.2, -56.85, -56.45, GF - 0.004, up=False)
    for name, x, z in (('GLOW_soc_main_w', 96.4, -50.0), ('GLOW_soc_main_n', 110.0, -56.6)):
        g = B.group(name, root, props={'glow': 'rgba(255,226,180,1)', 'size': 1.8, 'day': 0, 'night': 0.55}); g.location = g2b(x, GF - 0.3, z)

    # =====================================================================
    # ③ 中庭與周邊鋪面
    # =====================================================================
    hquad(A('pave'), BX0, BX1, LZ1, BZ0, 0.015)                  # 中庭
    hquad(A('pave'), BX0, BX1 - 1.0, BZ0, RECN, 0.015)          # 北面懸挑底下
    hquad(A('pave'), BX0, RECW, RECN, -43.0, 0.015)             # 西面懸挑底下
    hquad(A('pave'), LX0 - 1.2, LX1, LZ0 - 1.2, LZ0, 0.012)      # 圖書館北側、西側的人行步道（玻璃前面）
    hquad(A('pave'), LX0 - 1.2, LX0, LZ0, LZ1, 0.012)
    # 中庭中間：淺色石材的長方形（集合、典禮的位置）
    kit.box('misc', 102.0, 118.0, 0.015, 0.021, -67.0, -61.0, skip=('bottom',), col='#d3cfc6')
    # 長椅（清水混凝土）與樹穴（混凝土圓框＋草）
    for (x, z, along_x) in ((108.0, -67.9, True), (117.0, -67.9, True), (122.6, -64.6, False), (122.6, -60.6, False)):
        w, d = (2.4, 0.45) if along_x else (0.45, 2.4)
        kit.box('conc', x - w / 2, x + w / 2, 0.0, 0.45, z - d / 2, z + d / 2, skip=('bottom',))
        info_blocks['rects'].append({'what': '中庭長椅', 'x': x, 'z': z, 'w': w, 'd': d, 'seat': True})
    for (x, z) in ((122.8, -68.6),):   # 西邊（往小路的入口）、中間（集合）都留空
        ring(A('conc'), x, z, 1.2, 0.0, 1.2, 0.45, n=18); ring(A('conc'), x, z, 1.05, 0.45, 1.05, 0.0, n=18, outward=False)
        ring(A('conc'), x, z, 1.05, 0.45, 1.2, 0.45, n=18)
        disc(A('green'), x, z, 1.05, 0.38, n=18, up=True)
        info_blocks['circles'].append({'what': '樹穴（可以在中間種樹）', 'x': x, 'z': z, 'r': 1.25})

    # ---------------- 完成 ----------------
    K.finish(accs, root, VC)
    for (m, props) in plates: uv01(m.finish(root, uv=True, props=props))
    L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name)
    lit_ramp()
    info = L.export(out, gpu_instances=False)
    info['nav'] = info_blocks
    info['note'] = '新社科院外觀（遊戲化：南北對調；圖書館照 ⑬ 的室內；大樓立面是推測）'
    L.write_json(out[:-4] + '.json', info)
    return info


def lit_ramp():
    """ck_glass_lit（圖書館、大廳的天花板＋樹狀柱）的自發光漸層（LAWWW-B 2026-10-16 17:29：晚上蓮花柱一條一條整片白亮，像柱子本身在發光）。
    遊戲晚上把 ck_glass_lit 的自發光整片打亮（顏色、強度由遊戲設；GLB 有自發光貼圖時會乘上它）。
    貼圖 64×64：左半全白＝天花板（整片亮，像燈）；右半由上往下變暗＝柱子（靠天花板亮 0.8、地面 0.3：像被天花板的燈照亮，不是自己發光）。
    天花板＝所有頂點同高、朝下的面；其他都是柱子，v＝高度／室內高。白天遊戲不打開自發光，看不出差別。"""
    import numpy as np
    from PIL import Image
    path = os.path.join(HERE, 'textures', 'gen', 'socsci_lit_ramp.png'); a = np.ones((64, 64), np.float32)
    a[:, 32:] = (0.30 + 0.50 * (1 - np.arange(64, dtype=np.float32) / 63) ** 1.4)[:, None]
    Image.fromarray((a * 255).astype(np.uint8), 'L').convert('RGB').save(path)
    mat = bpy.data.materials.get('ck_glass_lit')
    if mat is None: return
    nt = mat.node_tree; bs = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path); tx.interpolation = 'Linear'
    nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = 1.0
    hmax = max(HIN, 4.3)
    for ob in [o for o in bpy.data.objects if o.type == 'MESH' and any(m and m.name == 'ck_glass_lit' for m in o.data.materials)]:
        me = ob.data; uvl = me.uv_layers.active or me.uv_layers.new(name='UVMap'); W = ob.matrix_world
        for poly in me.polygons:
            if me.materials[poly.material_index].name != 'ck_glass_lit': continue
            zs = [(W @ me.vertices[i].co).z for i in poly.vertices]; nz = (W.to_3x3() @ poly.normal).normalized().z
            ceil = nz < -0.99 and max(zs) - min(zs) < 0.002
            for li in poly.loop_indices:
                y = (W @ me.vertices[me.loops[li].vertex_index].co).z
                uvl.data[li].uv = (0.25, 0.5) if ceil else (0.75, min(0.98, max(0.02, y / hmax)))


if __name__ == '__main__':
    build()
