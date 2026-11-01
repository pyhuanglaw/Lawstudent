"""霖澤館 201 階梯教室 正式模型 v2：Blender 5.2 bpy 無介面 → GLB（之後用光照烘焙工具加光照貼圖）。
v2（INTERIOR-AAA-REVIEW-1028 的示範間，LAWWW2-C 2026-10-28；使用者 10-28「校內建築 空間內配置 有很大的美術提升空間 現在是一個廉價手遊感」）：
  檢討報告 docs/art-rebuild/second_ai/INTERIOR_AAA_REVIEW_1028.md 第 5、6 節。v1（v9.4）是方塊拼的：12 m 一整塊的長桌、木板椅、單色牆、整片同一個灰地磚。
  - 椅子：真的階梯教室翻椅（中柱、模壓夾板椅背、椅面前緣下彎）；椅面（SEATPANS）另外一個網格：遊戲把沒有人坐的位子掀起來（zones3d.js 的 seatFold）。
  - 長桌：桌板分段（接縫）、圓角、正面擋板、鋼製懸臂桌腳、桌下置物網架、桌上電源盒。
  - 地面：講台區深色木地板（和 202 一樣）、座位區 60 cm 灰色地磚、走道踏階的鋁止滑條。
  - 牆：木腰牆到 2.4 m（四面同一條線；窗台 2.5 m 剛好在上面）、腰牆收邊、側牆的柱子（窗和窗之間）。
  - 西牆的窗：鋁窗框（兩扇推拉）、窗台、捲簾拉到不同高度。後牆的門：真的門洞、兩扇門（門板單獨的網格：door3d.js 推門會轉開）、門上的出口燈。
  - 天花板：輕鋼架（0.6 m）、T5 格柵燈具（燈的位置對齊格子）、吸頂冷氣、投影機、喇叭、偵煙器。
  - 生活感：粉筆、板擦、講桌上的筆電、麥克風、點名板、窗台上沒喝完的手搖杯、桌尾的講義、掛在桌邊的雨傘、後面的垃圾分類桶、滅火器、公告欄的傳單（字是虛構的，D77）。
  配置、座位、導航完全不動：讀同一份 src/data/classroom_layout.js（遊戲的平台高度、座位、導航讀同一份）。
  黑板上的字、時鐘（錶面、指針）、窗外的景、點地面用的透明地板由遊戲畫（黑板正面在 z −8.545，遊戲的字在 −8.53：在黑板前面 1.5 cm）。
節點約定（attachRoomGLB）：名字含 WALL_ 的會淡出（自訂屬性 dir＝往室內的法線，遊戲座標）；掛在牆上的東西用那面牆的 WALL_<面>_ 名字，牆淡出時一起淡出。
  玻璃（半透明的 WALL_）變成窗的零件。自訂屬性 lm＝光照貼圖分配的比例（小東西、天花板上的東西分少一點；bake_room.py 讀）。
座標：遊戲 (x 東, y 上, z 南) ＝ Blender (x, -z, y)。
用法：/opt/blenv/bin/python tools/blender/classroom_201.py [-- --out assets/models/env/classroom_201.glb] [--tex 512] [--render 輸出資料夾]
  正式流程（加光照貼圖）：tools/blender/env_second/lightbake/bake_classroom_201.sh
"""
import bpy, bmesh, json, math, os, re, sys, random
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, 'env_second'))
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
def arg(name, default=None): return argv[argv.index(name) + 1] if name in argv else default
OUT = os.path.join(ROOT, arg('--out', 'assets/models/env/classroom_201.glb'))
TEXRES = int(arg('--tex', '512')); RENDER = arg('--render')
import b3lib as B   # 共用：材質、方塊、UV、匯出（tools/blender/b3lib.py）
B.reset(TEXRES)
import lib2 as L   # env_second 的工具（Mesh／CMesh、貼圖資料夾）
from lib2 import g2b
GEN = os.path.join(HERE, 'env_second', 'textures', 'gen')
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
random.seed(201)

src = open(os.path.join(ROOT, 'src/data/classroom_layout.js'), encoding='utf8').read()
C = json.loads(re.search(r'=\s*(\{.*\})\s*;?\s*$', src, re.S).group(1))
W, D, H = C['W'], C['D'], C['H']; T = 0.25
XI, ZI = W / 2 - T / 2, D / 2 - T / 2          # 牆的室內面：東西牆 x=±7.875、前後牆 z=±8.575
rowZ = lambda r: C['rowZ0'] + r * C['rowDepth']
rowH = lambda r: 0.0 if r < 0 else C['rise'] * (r + 1)
A0, A1, ST = C['aisleX0'], C['aisleX1'], C['aisleStepDepth']
NR = C['rows']
rowZ1 = lambda r: ZI if r == NR - 1 else rowZ(r) + C['rowDepth']
WAIN = 2.4                                      # 腰牆上緣（四面同一條線）
DIRS = {'N': [0.0, 0.0, 1.0], 'S': [0.0, 0.0, -1.0], 'E': [-1.0, 0.0, 0.0], 'W': [1.0, 0.0, 0.0], 'ceil': [0.0, -1.0, 0.0]}
DOOR_X0, DOOR_X1, DOOR_Y0, DOOR_Y1 = -0.8, 0.8, rowH(NR - 1), rowH(NR - 1) + 2.2   # 後門洞（框在裡面）
PIL_Z = (-3.5, 0.5, 4.5)                         # 側牆的柱子（西牆在窗和窗之間）
WIN_XS = sorted(C['windows']['xs']); WY0, WY1 = C['windows']['y'] - 0.8, C['windows']['y'] + 0.8; WHW = 1.15
BLIND = {WIN_XS[0]: 3.3, WIN_XS[1]: 4.02, WIN_XS[2]: 2.85}   # 捲簾下緣的高度：一扇放一半、一扇收起來、一扇幾乎放到底（投影時拉下來的樣子）
LX = [-5.4, -1.8, 1.8, 5.4]; LZ = [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5]   # 燈具（1.2×0.6，對齊 0.6 m 的天花板格子；烘焙的面光源同一個位置）

# ---------------- 貼圖：公告、標示（印刷品：字是虛構的）、黑板 ----------------
from PIL import Image, ImageDraw, ImageFont, ImageFilter
PRINT_PNG, BOARD_PNG = os.path.join(GEN, 'cls201_print.png'), os.path.join(GEN, 'cls201_board.png')
REG = {'EXIT': (0, 0, 256, 96), 'RULES': (256, 0, 512, 352), 'TIME': (512, 0, 768, 352), 'SEAT': (768, 0, 1024, 180),
       'FIRE': (768, 180, 1024, 240), 'BIN0': (768, 240, 853, 290), 'BIN1': (853, 240, 938, 290), 'BIN2': (938, 240, 1023, 290),
       'FLY0': (0, 360, 170, 600), 'FLY1': (170, 360, 340, 600), 'FLY2': (340, 360, 510, 600), 'FLY3': (510, 360, 680, 600),
       'FLY4': (680, 360, 850, 600), 'FLY5': (850, 360, 1020, 600), 'SLIDE': (0, 96, 256, 256), 'SHEET': (768, 290, 1024, 352)}
def F(n): return ImageFont.truetype(CJK, n)
def ctext(d, cx, y, t, f, fill): w = d.textlength(t, font=f); d.text((cx - w / 2, y), t, font=f, fill=fill)


def make_textures():
    os.makedirs(GEN, exist_ok=True); S = 4; N = 1024
    im = Image.new('RGBA', (N * S, N * S), (236, 234, 228, 255)); d = ImageDraw.Draw(im)
    def R(k): x0, y0, x1, y1 = REG[k]; return x0 * S, y0 * S, x1 * S, y1 * S
    # 出口燈（綠底白色奔跑的人＋門）
    x0, y0, x1, y1 = R('EXIT'); d.rectangle((x0, y0, x1, y1), fill=(24, 138, 78)); cx, cy = x0 + 70 * S, y0 + 48 * S
    d.rectangle((x0 + 18 * S, y0 + 14 * S, x0 + 48 * S, y0 + 82 * S), outline=(255, 255, 255), width=5 * S)   # 門
    d.ellipse((cx - 7 * S, cy - 33 * S, cx + 7 * S, cy - 19 * S), fill='white')
    for (ax, ay), (bx, by) in (((0, -17), (-6, 6)), ((-6, 6), (10, 20)), ((-6, 6), (-22, 22)), ((-2, -12), (14, -2)), ((-2, -12), (-18, -4))):   # 奔跑的人
        d.line((cx + ax * S, cy + ay * S, cx + bx * S, cy + by * S), fill='white', width=6 * S)
    ctext(d, x0 + 175 * S, y0 + 22 * S, 'EXIT', F(40 * S), 'white')
    # 教室使用規則
    x0, y0, x1, y1 = R('RULES'); d.rectangle((x0, y0, x1, y1), fill=(250, 248, 242)); d.rectangle((x0 + 8 * S, y0 + 8 * S, x1 - 8 * S, y1 - 8 * S), outline=(120, 40, 40), width=3 * S)
    ctext(d, (x0 + x1) / 2, y0 + 26 * S, '教室使用規則', F(26 * S), (120, 30, 30))
    for i, t in enumerate(['一、教室內請勿飲食', '二、離開前請關燈、關冷氣', '三、投影設備用畢請關機', '四、桌椅請保持整潔', '五、借用教室請洽系辦', '六、遺失物請送系辦招領']):
        d.text((x0 + 26 * S, y0 + (84 + i * 36) * S), t, font=F(17 * S), fill=(40, 36, 32))
    ctext(d, (x0 + x1) / 2, y1 - 40 * S, '法律學院　敬啟', F(15 * S), (80, 70, 60))
    # 201 教室週課表
    x0, y0, x1, y1 = R('TIME'); d.rectangle((x0, y0, x1, y1), fill=(252, 251, 247)); ctext(d, (x0 + x1) / 2, y0 + 14 * S, '201 教室　週課表', F(20 * S), (30, 30, 30))
    days = ['一', '二', '三', '四', '五']; gx0, gy0, cw, ch = x0 + 34 * S, y0 + 50 * S, 42 * S, 40 * S
    for j, t in enumerate(days): ctext(d, gx0 + cw * j + cw / 2, gy0 - 22 * S, t, F(14 * S), (60, 60, 60))
    names = ['民總', '刑總', '憲法', '法緒', '民總', '刑總', '', '英文', '憲法', '', '法緒', '', '刑總', '民總', '', '', '法英', '', '民總', '憲法', '', '刑總', '', '', '', '法緒', '', '']
    k = 0
    for i in range(7):
        ctext(d, x0 + 18 * S, gy0 + ch * i + 12 * S, str(i + 1), F(12 * S), (90, 90, 90))
        for j in range(5):
            r = (gx0 + cw * j, gy0 + ch * i, gx0 + cw * (j + 1), gy0 + ch * (i + 1)); d.rectangle(r, outline=(150, 150, 150), width=S)
            t = names[k % len(names)]; k += 1
            if t: d.rectangle((r[0] + 2 * S, r[1] + 2 * S, r[2] - 2 * S, r[3] - 2 * S), fill=(226, 236, 246) if (i + j) % 2 else (246, 236, 220)); ctext(d, (r[0] + r[2]) / 2, r[1] + 11 * S, t, F(13 * S), (40, 40, 40))
    # 期中考座位表（公告欄上）
    x0, y0, x1, y1 = R('SEAT'); d.rectangle((x0, y0, x1, y1), fill=(255, 255, 252)); ctext(d, (x0 + x1) / 2, y0 + 8 * S, '期中考座位表', F(18 * S), (20, 20, 20))
    for i in range(6):
        for j in range(8):
            r = (x0 + (14 + j * 29) * S, y0 + (40 + i * 22) * S, x0 + (41 + j * 29) * S, y0 + (58 + i * 22) * S); d.rectangle(r, outline=(120, 120, 120), width=S)
            d.line((r[0] + 4 * S, r[1] + 9 * S, r[2] - 4 * S, r[1] + 9 * S), fill=(150, 150, 150), width=2 * S)
    # 滅火器標示、垃圾分類標籤、講義（紙）
    x0, y0, x1, y1 = R('FIRE'); d.rectangle((x0, y0, x1, y1), fill=(200, 30, 30)); ctext(d, (x0 + x1) / 2, y0 + 12 * S, '滅火器', F(30 * S), 'white')
    for k2, (t, col) in zip(('BIN0', 'BIN1', 'BIN2'), (('一般垃圾', (90, 96, 100)), ('資源回收', (40, 96, 160)), ('紙類', (50, 120, 70)))):
        x0, y0, x1, y1 = R(k2); d.rectangle((x0, y0, x1, y1), fill=col); ctext(d, (x0 + x1) / 2, y0 + 14 * S, t, F(17 * S), 'white')
    x0, y0, x1, y1 = R('SHEET'); d.rectangle((x0, y0, x1, y1), fill=(250, 250, 246))
    for i in range(5): d.line((x0 + 12 * S, y0 + (12 + i * 10) * S, x1 - (12 + (i % 3) * 30) * S, y0 + (12 + i * 10) * S), fill=(130, 130, 130), width=2 * S)
    # 講桌筆電的畫面（投影片）
    x0, y0, x1, y1 = R('SLIDE'); d.rectangle((x0, y0, x1, y1), fill=(246, 246, 242)); d.rectangle((x0, y0, x1, y0 + 34 * S), fill=(44, 72, 110))
    d.text((x0 + 12 * S, y0 + 7 * S), '法律行為的成立與生效', font=F(16 * S), fill='white')
    for i in range(5): d.line((x0 + 16 * S, y0 + (56 + i * 18) * S, x1 - (20 + (i % 2) * 60) * S, y0 + (56 + i * 18) * S), fill=(110, 110, 110), width=3 * S)
    # 傳單（社團、讀書會、遺失物；都是虛構的）
    fly = [('法律服務社', '志工招募', '每週四 19:00\n法律系館B', (38, 84, 140)), ('模擬法庭', '期中練習賽', '報名至 10/31\n歡迎大一', (128, 36, 44)),
           ('民法讀書會', '每週三晚上', '法律系館A 3F\n自備六法', (52, 110, 74)), ('遺失物招領', '藍色保溫瓶', '請至系辦\n領取', (210, 170, 40)),
           ('法學英文', '工作坊', '名額 30 人\n掃碼報名', (214, 112, 40)), ('系學會', '迎新宿營', '報名開始\n大一優先', (96, 70, 140))]
    for i, (t1, t2, t3, col) in enumerate(fly):
        x0, y0, x1, y1 = R(f'FLY{i}'); d.rectangle((x0, y0, x1, y1), fill=(250, 248, 240)); d.rectangle((x0, y0, x1, y0 + 70 * S), fill=col)
        ctext(d, (x0 + x1) / 2, y0 + 12 * S, t1, F(20 * S), 'white'); ctext(d, (x0 + x1) / 2, y0 + 40 * S, t2, F(15 * S), 'white')
        for li, ln in enumerate(t3.split('\n')): ctext(d, (x0 + x1) / 2, y0 + (92 + li * 24) * S, ln, F(15 * S), (40, 40, 40))
        if i == 4:   # 報名用的碼（隨機方格，不是真的連結）
            rnd = random.Random(7); q0x, q0y, qs = x0 + 55 * S, y0 + 150 * S, 4 * S
            for a in range(15):
                for b in range(15):
                    if rnd.random() < 0.5 or (a < 4 and b < 4) or (a > 10 and b < 4) or (a < 4 and b > 10): d.rectangle((q0x + a * qs, q0y + b * qs, q0x + (a + 1) * qs, q0y + (b + 1) * qs), fill=(20, 20, 20))
        else:
            for li in range(3): d.line((x0 + 20 * S, y0 + (160 + li * 16) * S, x1 - (20 + li * 15) * S, y0 + (160 + li * 16) * S), fill=(150, 150, 150), width=2 * S)
    im.resize((N, N), Image.LANCZOS).convert('RGB').save(PRINT_PNG)
    # 黑板：墨綠石板＋擦過的粉筆痕（板擦一來一回的弧線；字由遊戲畫）
    bw, bh = 1024, 256; bd = Image.new('RGB', (bw * 2, bh * 2), (40, 64, 56)); ov = Image.new('L', (bw * 2, bh * 2), 0); od = ImageDraw.Draw(ov); rnd = random.Random(11)
    for k in range(70):
        cx, cy, rr = rnd.uniform(0, bw * 2), rnd.uniform(40, bh * 2 - 40), rnd.uniform(60, 220)
        a0 = rnd.uniform(180, 300); od.arc((cx - rr, cy - rr * 0.35, cx + rr, cy + rr * 0.35), a0, a0 + rnd.uniform(40, 120), fill=rnd.randint(10, 26), width=rnd.randint(30, 60))
    for k in range(40):   # 粉筆槽上方的粉筆灰（下緣）
        x = rnd.uniform(0, bw * 2); od.ellipse((x - 40, bh * 2 - 30, x + 40, bh * 2 + 10), fill=rnd.randint(12, 30))
    ov = ov.filter(ImageFilter.GaussianBlur(9)); bd = Image.composite(Image.new('RGB', bd.size, (190, 200, 190)), bd, ov.point(lambda v: min(255, v)))
    bd.resize((bw, bh), Image.LANCZOS).save(BOARD_PNG)


make_textures()


def img_mat(name, path, rough=0.6, emit=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; bs = nt.nodes['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path, check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    m['tile'] = 1.0; return m


MAT = {
    'tile':   L.pbr('cls_floor', 'large_floor_tiles_02', tile=1.8, sat=0.2, contrast=0.5, target='#b4b3ae', normal=0.35),   # 60 cm 灰地磚（貼圖一張 3×3 塊）
    'stage':  L.pbr('cls_stage', 'laminate_floor_02', tile=1.2, target='#cdb594', normal=0.4),                              # 講台區木地板：淺色（UA-LAWWW2-1023-03 永久規則：整個遊戲不要深色木地板；目標色 #cdb594＝宿舍四人房。10-28 第一版 #6c5442 是深色，scan_floors.py 標 DARK）
    'riser':  L.pbr('cls_riser', 'painted_plaster_wall', tile=1.5, target='#86827b', contrast=0.5, normal=0.3, maps=('diff', 'nor')),
    'wall':   L.pbr('cls_wall', 'painted_plaster_wall', tile=2.5, target='#e2ded5', contrast=0.4, normal=0.3, maps=('diff', 'nor')),
    'wain':   L.pbr('cls_wain', 'walnut_veneer', tile=1.0, target='#5c4434', normal=0.35),                                 # 木腰牆（直紋）
    'cap':    L.flat('cls_cap', '#3b2d24', rough=0.5),
    'desk':   L.pbr('cls_desk', 'walnut_veneer', tile=1.4, target='#463529', normal=0.3),                                  # 深色長桌（照片）
    'seat':   L.pbr('cls_seat', 'walnut_veneer', tile=0.7, target='#a77650', normal=0.35),                                 # 木翻椅（照片）
    'lect':   L.pbr('cls_lectern', 'walnut_veneer', tile=1.0, target='#94704f', normal=0.35),                              # 木講桌（照片）
    'steel':  L.flat('cls_steel', '#2e3033', rough=0.45, metal=0.35),
    'alu':    L.flat('cls_alu', '#b2b5b8', rough=0.35, metal=0.45),
    'rubber': L.flat('cls_rubber', '#2b2b2c', rough=0.85),
    'frame':  L.flat('cls_frame', '#b4afa5', rough=0.35, metal=0.4),        # 鋁窗框（香檳色）
    'glass':  L.flat('cls_glass', '#c4d6dc', rough=0.05, alpha=0.25),
    'blind':  L.flat('cls_blind', '#c7c1b4', rough=0.95),
    'sill':   L.flat('cls_sill', '#cfccc5', rough=0.45),
    'board':  img_mat('cls_board', BOARD_PNG, rough=0.75),
    'screen': L.flat('cls_screen', '#f0efea', rough=0.95),
    'black':  L.flat('cls_black', '#1e1f21', rough=0.6),
    'ceiling': L.pbr('cls_ceiling', 'ceiling_interior', tile=1.2, sat=0.2, target='#efeeea', normal=0.2, cull=True),     # 單面朝下（鏡頭拉到天花板上面看得穿）
    'grid':   L.flat('cls_grid', '#e6e5e1', rough=0.6),
    'fix':    L.flat('cls_fix', '#ecebe7', rough=0.5),
    'light':  B.pbr('cls_light', None, tint=B.srgb('#fffaf0'), rough=0.9, emit=B.srgb('#fff8ea')),
    'louvre': L.flat('cls_louvre', '#d3d6d9', rough=0.25, metal=0.45),
    'plastic': L.flat('cls_plastic', '#e7e6e1', rough=0.55),
    'print':  img_mat('cls_print', PRINT_PNG, rough=0.7),
    'exit':   img_mat('cls_exit', PRINT_PNG, rough=0.5, emit=1.2),
    'vc':     L.vc_material('cls_props', rough=0.55),
}
ROOTG = B.group('Classroom201')
MESH = {}   # 名字 → (Mesh, props)


def mesh(name, mat, kind=None, lm=None, cmesh=False):
    """名字一樣的零件累積進同一個網格。kind＝'N'／'S'／'E'／'W'／'ceil'：會淡出的牆（名字要含 WALL_、dir）"""
    if name not in MESH:
        m = (L.CMesh if cmesh else L.Mesh)(name, MAT[mat] if isinstance(mat, str) else mat); p = {}
        if kind: p['dir'] = DIRS[kind]
        if lm is not None: p['lm'] = lm
        MESH[name] = (m, p)
    return MESH[name][0]


def face(m, pts, want):
    """一個面（遊戲座標的點），法線朝 want（遊戲座標的方向）"""
    f = m.bm.faces.new([m.bm.verts.new(g2b(*p)) for p in pts]); f.normal_update()
    if f.normal.dot(g2b(*want)) < 0: f.normal_flip()
    return f


def qy(m, x0, x1, z0, z1, y, up=True): return face(m, [(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)], (0, 1 if up else -1, 0))
def qz(m, x0, x1, y0, y1, z, s): return face(m, [(x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z)], (0, 0, s))
def qx(m, z0, z1, y0, y1, x, s): return face(m, [(x, y0, z0), (x, y0, z1), (x, y1, z1), (x, y1, z0)], (s, 0, 0))


def prism_x(m, xa, xb, zy):
    """(z, y) 多邊形沿 x 擠出（桌腳的懸臂鋼板）"""
    bm = m.bm; A = [bm.verts.new(g2b(xa, y, z)) for (z, y) in zy]; Bv = [bm.verts.new(g2b(xb, y, z)) for (z, y) in zy]
    fs = [bm.faces.new(A), bm.faces.new(list(reversed(Bv)))]
    for i in range(len(zy)): j = (i + 1) % len(zy); fs.append(bm.faces.new((A[i], A[j], Bv[j], Bv[i])))
    bmesh.ops.recalc_face_normals(bm, faces=fs); return fs


def shell(m, P, nu, nv, off):
    """曲面板（模壓夾板的椅背、椅面）：P(u,v)＝正面的點（u、v 都是 0..1），off＝背面的位移（遊戲座標）；正面、背面、周邊封起來"""
    bm = m.bm; Fv = [[bm.verts.new(g2b(*P(i / nu, j / nv))) for j in range(nv + 1)] for i in range(nu + 1)]
    Kv = [[bm.verts.new(g2b(*[a + b for a, b in zip(P(i / nu, j / nv), off)])) for j in range(nv + 1)] for i in range(nu + 1)]
    fs = []
    for i in range(nu):
        for j in range(nv):
            fs.append(bm.faces.new((Fv[i][j], Fv[i + 1][j], Fv[i + 1][j + 1], Fv[i][j + 1]))); fs.append(bm.faces.new((Kv[i][j], Kv[i][j + 1], Kv[i + 1][j + 1], Kv[i + 1][j])))
    ring = [(i, 0) for i in range(nu)] + [(nu, j) for j in range(nv)] + [(i, nv) for i in range(nu, 0, -1)] + [(0, j) for j in range(nv, 0, -1)]
    for k in range(len(ring)):
        (a0, a1), (b0, b1) = ring[k], ring[(k + 1) % len(ring)]; fs.append(bm.faces.new((Fv[a0][a1], Fv[b0][b1], Kv[b0][b1], Kv[a0][a1])))
    bmesh.ops.recalc_face_normals(bm, faces=fs); return fs


def uvquad(m, pts, key, want):
    """印刷品（貼圖集的一塊）：pts＝左下、右下、右上、左上（從正面看）"""
    x0, y0, x1, y1 = REG[key]; u0, v0, u1, v1 = x0 / 1024, 1 - y1 / 1024, x1 / 1024, 1 - y0 / 1024
    f = m.bm.faces.new([m.bm.verts.new(g2b(*p)) for p in pts]); uvl = m.bm.loops.layers.uv.verify()
    for lp, uv in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = uv
    f.normal_update()
    if f.normal.dot(g2b(*want)) < 0: f.normal_flip()
    return f


def wall_pt(side, a, y, d):
    """牆面上的點：side 那面牆、沿牆座標 a（N／S 是 x，E／W 是 z）、高 y、離牆面 d（往室內）"""
    if side == 'N': return (a, y, -ZI + d)
    if side == 'S': return (a, y, ZI - d)
    if side == 'E': return (XI - d, y, a)
    return (-XI + d, y, a)


def wq(m, side, a0, a1, y0, y1, d, key=None):
    """貼在牆上的矩形（從室內看正面）；key＝貼圖集的一塊（印刷品）"""
    sgn = {'N': 1, 'S': -1, 'E': 1, 'W': -1}[side]   # 從室內看牆，沿牆座標往右是 + 還是 −（和 flat_classroom.py 的 RIGHT 一樣）
    la, lb = (a0, a1) if sgn > 0 else (a1, a0)
    pts = [wall_pt(side, la, y0, d), wall_pt(side, lb, y0, d), wall_pt(side, lb, y1, d), wall_pt(side, la, y1, d)]
    return uvquad(m, pts, key, DIRS[side]) if key else face(m, pts, DIRS[side])


def wbox(m, side, a0, a1, y0, y1, d0, d1, col=None, r=0.0):
    """貼在牆上的方塊：沿牆 a0..a1、高 y0..y1、離牆 d0..d1"""
    p0, p1 = wall_pt(side, a0, y0, d0), wall_pt(side, a1, y1, d1)
    x0, x1, z0, z1 = min(p0[0], p1[0]), max(p0[0], p1[0]), min(p0[2], p1[2]), max(p0[2], p1[2])
    if col is None: return m.rbox(x0, x1, y0, y1, z0, z1, r=r) if r > 0 else m.box(x0, x1, y0, y1, z0, z1)
    return m.crbox(x0, x1, y0, y1, z0, z1, col, r=r) if r > 0 else m.cbox(x0, x1, y0, y1, z0, z1, col)


def ccyl(m, a, b, r, col, seg=10, r2=None, caps=True):
    f0 = set(m.bm.faces); m.cyl(a, b, r, seg=seg, r2=r2, caps=caps); m.paint([q for q in m.bm.faces if q not in f0], col)


# ================= 地面：講台區木地板、座位平台、兩側走道踏階 =================
stage = mesh('floor_stage', 'stage'); qy(stage, -XI, XI, -ZI, rowZ(0), 0.0)
tops, ris = mesh('plat_tops', 'tile'), mesh('plat_risers', 'riser')
alu, rub = mesh('nosing_alu', 'alu', lm=0.5), mesh('nosing_rubber', 'rubber', lm=0.5)
for r in range(NR):
    z0, z1, h, hp = rowZ(r), rowZ1(r), rowH(r), rowH(r - 1)
    qy(tops, -A0, A0, z0, z1, h); qz(ris, -A0, A0, hp, h, z0, -1)                      # 平台面、前緣的立面（被桌子的擋板遮住大半）
    alu.box(-A0, A0, h - 0.03, h + 0.003, z0 - 0.004, z0 + 0.035)                      # 平台前緣的鋁收邊
    for sx in (-1, 1):
        xa, xb = (-XI, -A0) if sx < 0 else (A0, XI)
        qx(ris, z0, z1, hp, h, sx * A0, sx)                                            # 平台側面（走道比較低的地方看得到）
        ya, yb = hp + 0.15, h; za, zb = z0 + ST / 2, z0 + ST
        qy(tops, xa, xb, z0, za, ya); qz(ris, xa, xb, hp, ya, z0, -1)                     # 第一階
        qy(tops, xa, xb, za, z1, yb); qz(ris, xa, xb, ya, yb, za, -1)                     # 第二階＋平的一段
        for (zz, yy) in ((z0, ya), (za, yb)):                                           # 止滑條：鋁的前緣＋黑色橡膠
            alu.box(xa + 0.02, xb - 0.02, yy - 0.025, yy + 0.003, zz - 0.004, zz + 0.05); rub.box(xa + 0.03, xb - 0.03, yy + 0.003, yy + 0.005, zz + 0.008, zz + 0.042)
alu.box(-XI, XI, 0.0, 0.003, rowZ(0) - 0.03, rowZ(0) - 0.004)                          # 木地板和地磚的交界壓條

# ================= 長桌（每排 12 m：桌板分五段、擋板、懸臂鋼板桌腳、置物網架、電源盒）=================
desk, dst = mesh('desks_top', 'desk'), mesh('desks_steel', 'steel', lm=0.7)
props = mesh('PROPS', 'vc', lm=0.35, cmesh=True)
dk = C['desk']
for r in range(NR):
    z0, h = rowZ(r), rowH(r); top = h + dk['top']; zA, zB = z0 + dk['dz'] - dk['d'] / 2, z0 + dk['dz'] + dk['d'] / 2
    xs = [-dk['w'] / 2 + i * dk['w'] / 5 for i in range(6)]
    for a, b in zip(xs, xs[1:]): desk.rbox(a + 0.0015, b - 0.0015, top - 0.03, top, zA, zB, r=0.006, seg=2)
    desk.box(-dk['w'] / 2, dk['w'] / 2, h + 0.04, top - 0.03, zA + 0.004, zA + 0.024)       # 正面擋板（面向講台）
    for bx in [-dk['w'] / 2 + 0.012] + [-4.5, -3.0, -1.5, 0.0, 1.5, 3.0, 4.5] + [dk['w'] / 2 - 0.012]:   # 桌腳在兩個座位中間（膝蓋不會撞到）
        prism_x(dst, bx - 0.006, bx + 0.006, [(zA + 0.024, h), (zA + 0.17, h), (zB - 0.035, top - 0.03), (zA + 0.024, top - 0.03)])
    dst.box(-dk['w'] / 2 + 0.02, dk['w'] / 2 - 0.02, top - 0.235, top - 0.225, zA + 0.03, zA + 0.33)    # 桌下置物架
    dst.box(-dk['w'] / 2 + 0.02, dk['w'] / 2 - 0.02, top - 0.235, top - 0.2, zA + 0.325, zA + 0.335)    # 置物架的前緣
    for ox in (-4.5, -1.5, 1.5, 4.5):                                                    # 桌上的電源盒（兩個位子共用）
        props.crbox(ox - 0.07, ox + 0.07, top, top + 0.007, zA + 0.03, zA + 0.11, '#2a2b2d', r=0.003, seg=1); props.cbox(ox - 0.05, ox + 0.05, top + 0.007, top + 0.008, zA + 0.045, zA + 0.095, '#3a3c3f')

# ================= 翻椅（48 張：中柱、模壓夾板椅背；椅面 SEATPANS 另外一個網格，遊戲把空位掀起來）=================
sw, ss, pans = mesh('seats_wood', 'seat', lm=0.6), mesh('seats_steel', 'steel', lm=0.45), mesh('SEATPANS', 'seat', lm=0.6)
SEATS = []
for r in range(NR):
    for i in range(C['cols']):
        sx, h, sz = C['colX0'] + i * C['colDX'], rowH(r), rowZ(r) + C['seat']['dz']; SEATS.append((sx, h, sz))
        def pan_P(u, v, sx=sx, h=h, sz=sz):   # u：左右、v：前（0）到後（1）
            x = -0.24 + 0.48 * u; xn = x / 0.24; z = -0.25 + 0.42 * v
            y = 0.475 + 0.01 * xn * xn - (0.032 * (1 - v / 0.22) ** 2 if v < 0.22 else 0.0)   # 中間微凹、前緣往下彎
            if v < 0.1 or v > 0.92: x *= 0.93                                            # 四個角收一點（圓角）
            return (sx + x, h + y, sz + z)
        shell(pans, pan_P, 8, 7, (0.0, -0.022, 0.0))
        def back_P(u, v, sx=sx, h=h, sz=sz):  # u：左右、v：下（0）到上（1）
            x = -0.25 + 0.5 * u; xn = x / 0.25; y = 0.53 + 0.38 * v; z = 0.205 + 0.07 * v - 0.03 * xn * xn
            e = max(0.0, abs(2 * v - 1) - 0.7) / 0.3; x *= 1 - 0.1 * e * e                  # 上下兩端收窄（圓角）
            return (sx + x, h + y, sz + z)
        shell(sw, back_P, 8, 6, (0.0, 0.0, 0.018))
        ss.cyl((sx, h, sz + 0.06), (sx, h + 0.012, sz + 0.06), 0.1, seg=14)               # 地上的固定座
        ss.cyl((sx, h + 0.012, sz + 0.06), (sx, h + 0.41, sz + 0.06), 0.032, seg=10)      # 中柱
        ss.rbox(sx - 0.05, sx + 0.05, h + 0.38, h + 0.44, sz + 0.02, sz + 0.13, r=0.01)   # 柱頭（轉軸座）
        ss.box(sx - 0.21, sx + 0.21, h + 0.425, h + 0.445, sz + 0.13, sz + 0.17)           # 椅面的轉軸
        ss.cyl((sx, h + 0.42, sz + 0.12), (sx, h + 0.47, sz + 0.27), 0.017, seg=8)         # 椅背的支架：往後
        ss.cyl((sx, h + 0.47, sz + 0.27), (sx, h + 0.8, sz + 0.29), 0.017, seg=8)          # 再往上（在椅背後面）
        ss.box(sx - 0.07, sx + 0.07, h + 0.62, h + 0.74, sz + 0.262, sz + 0.274)           # 椅背的固定板

# ================= 牆：灰泥牆、木腰牆（四面 2.4 m）、收邊、側牆的柱子、西牆的窗、後牆的門 =================
def plaster(name, kind, x0, x1, y0, y1, z0, z1):
    mesh(name, 'wall', kind).box(x0, x1, y0, y1, z0, z1)
plaster('WALL_N', 'N', -XI, XI, 0, H, -D / 2 - T / 2, -ZI)
plaster('WALL_E', 'E', XI, W / 2 + T / 2, 0, H, -D / 2 - T / 2, D / 2 + T / 2)
for (x0, x1, y0, y1) in ((-XI, DOOR_X0 - 0.08, 0, H), (DOOR_X1 + 0.08, XI, 0, H), (DOOR_X0 - 0.08, DOOR_X1 + 0.08, DOOR_Y1 + 0.08, H), (DOOR_X0 - 0.08, DOOR_X1 + 0.08, 0, DOOR_Y0)):
    plaster('WALL_S', 'S', x0, x1, y0, y1, ZI, D / 2 + T / 2)   # 門洞四周（同一面牆合成一個網格：一次 draw call）
zs = [-D / 2 - T / 2] + [v for t in WIN_XS for v in (t - WHW, t + WHW)] + [D / 2 + T / 2]
for k in range(0, len(zs), 2):
    if zs[k + 1] - zs[k] > 0.02: plaster('WALL_W', 'W', -W / 2 - T / 2, -XI, 0, H, zs[k], zs[k + 1])
for t in WIN_XS:
    plaster('WALL_W', 'W', -W / 2 - T / 2, -XI, 0, WY0, t - WHW, t + WHW); plaster('WALL_W', 'W', -W / 2 - T / 2, -XI, WY1, H, t - WHW, t + WHW)


def floor_at(z):
    """側牆邊（走道）z 那裡的地面高度"""
    if z < rowZ(0): return 0.0
    for r in range(NR):
        if rowZ(r) <= z < rowZ1(r) + 1e-6: return rowH(r - 1) + (0.15 if z < rowZ(r) + ST / 2 else 0.3)
    return rowH(NR - 1)


def side_wain(side):
    """側牆的腰牆：在柱子那裡斷開（柱子下半自己包木頭）；底邊跟著走道每一段的高度（看不到的部分不做）"""
    wn, cap = mesh(f'WALL_{side}_wain', 'wain', side), mesh(f'WALL_{side}_cap', 'cap', side, lm=0.4)
    cuts = [-ZI] + [v for p in PIL_Z for v in (p - 0.27, p + 0.27)] + [ZI]
    bounds = sorted(set([-ZI, ZI, rowZ(0)] + [rowZ(r) for r in range(NR)] + [rowZ(r) + ST / 2 for r in range(NR)]))
    for k in range(0, len(cuts), 2):
        a, b = cuts[k], cuts[k + 1]
        segs = [v for v in bounds if a < v < b]; pts = [a] + segs + [b]
        for p, q in zip(pts, pts[1:]):
            y0 = min(floor_at(p + 1e-4), floor_at(q - 1e-4)) - 0.02; wbox(wn, side, p, q, max(0.0, y0), WAIN, 0.0, 0.02)
        wbox(cap, side, a, b, WAIN, WAIN + 0.035, 0.0, 0.04)
    for p in PIL_Z:   # 柱子：下半木頭（和腰牆同高）、上半灰泥
        wbox(wn, side, p - 0.27, p + 0.27, max(0.0, floor_at(p) - 0.02), WAIN, 0.0, 0.14); wbox(cap, side, p - 0.28, p + 0.28, WAIN, WAIN + 0.035, 0.0, 0.16)
        wbox(mesh(f'WALL_{side}_pil', 'wall', side), side, p - 0.25, p + 0.25, WAIN + 0.035, H, 0.0, 0.12)
side_wain('E'); side_wain('W')
# 前牆：黑板那一塊沒有腰牆（黑板直接掛在牆上：遊戲的字在黑板前面 1.5 cm）；後牆：最後一排的地面 1.8 m 以上
wn, cap = mesh('WALL_N_wain', 'wain', 'N'), mesh('WALL_N_cap', 'cap', 'N', lm=0.4)
BX0, BX1, BY0, BY1 = C['board']['x'] - C['board']['w'] / 2, C['board']['x'] + C['board']['w'] / 2, C['board']['y'] - C['board']['h'] / 2, C['board']['y'] + C['board']['h'] / 2
for (a, b, y0, y1) in ((-XI, BX0 - 0.12, 0, WAIN), (BX1 + 0.12, XI, 0, WAIN), (BX0 - 0.12, BX1 + 0.12, 0, BY0 - 0.1)):
    wbox(wn, 'N', a, b, y0, y1, 0.0, 0.02)
for (a, b, y) in ((-XI, BX0 - 0.12, WAIN), (BX1 + 0.12, XI, WAIN), (BX0 - 0.12, BX1 + 0.12, BY0 - 0.1)): wbox(cap, 'N', a, b, y, y + 0.035, 0.0, 0.04)
wn, cap = mesh('WALL_S_wain', 'wain', 'S'), mesh('WALL_S_cap', 'cap', 'S', lm=0.4)
for (a, b) in ((-XI, DOOR_X0 - 0.08), (DOOR_X1 + 0.08, XI)): wbox(wn, 'S', a, b, DOOR_Y0 - 0.02, WAIN, 0.0, 0.02); wbox(cap, 'S', a, b, WAIN, WAIN + 0.035, 0.0, 0.04)
# 腰牆的分割縫（每 1.2 m 一條細的深色縫：一整片木頭看起來像一張貼圖）
for side in 'NSEW':
    jm = mesh(f'WALL_{side}_wainjoint', 'cap', side, lm=0.25)
    span = (-XI, XI) if side in 'NS' else (-ZI, ZI); a = span[0] + 1.2
    while a < span[1] - 0.3:
        ok = True
        if side == 'N' and BX0 - 0.15 < a < BX1 + 0.15: ok = False
        if side == 'S' and DOOR_X0 - 0.2 < a < DOOR_X1 + 0.2: ok = False
        if side in 'EW' and any(abs(a - p) < 0.35 for p in PIL_Z): ok = False
        if ok:
            y0 = DOOR_Y0 if side == 'S' else max(0.0, floor_at(a) - 0.02) if side in 'EW' else 0.0
            wbox(jm, side, a - 0.004, a + 0.004, y0, WAIN, 0.02, 0.021)
        a += 1.2

# 西牆的窗：窗台（石材）、鋁窗框、兩扇推拉窗、玻璃（半透明：遊戲當作窗的零件）、捲簾
fr, sill, bl = mesh('WALL_W_frame', 'frame', 'W', lm=0.4), mesh('WALL_W_sill', 'sill', 'W', lm=0.5), mesh('WALL_W_blind', 'blind', 'W', lm=0.6)
for wi, t in enumerate(WIN_XS):
    sill.rbox(-XI - 0.13, -XI + 0.06, WY0 - 0.02, WY0 + 0.012, t - WHW - 0.06, t + WHW + 0.06, r=0.006)
    xf = -W / 2   # 窗框在牆的中間
    for (z0, z1) in ((t - WHW, t - WHW + 0.05), (t + WHW - 0.05, t + WHW)): fr.box(xf - 0.04, xf + 0.04, WY0, WY1, z0, z1)
    for (y0, y1) in ((WY0 + 0.012, WY0 + 0.06), (WY1 - 0.05, WY1)): fr.box(xf - 0.04, xf + 0.04, y0, y1, t - WHW, t + WHW)
    for k, (z0, z1, xo) in enumerate(((t - WHW + 0.05, t + 0.03, -0.018), (t - 0.03, t + WHW - 0.05, 0.018))):   # 兩扇推拉窗（前後錯開）
        for (a, b) in ((z0, z0 + 0.04), (z1 - 0.04, z1)): fr.box(xf + xo - 0.015, xf + xo + 0.015, WY0 + 0.06, WY1 - 0.05, a, b)
        for (a, b) in ((WY0 + 0.06, WY0 + 0.1), (WY1 - 0.09, WY1 - 0.05)): fr.box(xf + xo - 0.015, xf + xo + 0.015, a, b, z0, z1)
        g = mesh('WALL_W_glass', 'glass', 'W')   # 六片玻璃一個網格（窗的零件，牆淡出時一起藏）
        face(g, [(xf + xo, WY0 + 0.1, z0 + 0.04), (xf + xo, WY0 + 0.1, z1 - 0.04), (xf + xo, WY1 - 0.09, z1 - 0.04), (xf + xo, WY1 - 0.09, z0 + 0.04)], (1, 0, 0))
    fr.box(xf + 0.035, xf + 0.05, WY0 + 0.75, WY0 + 0.85, t - 0.06, t - 0.03)      # 窗閂
    yb = BLIND[t]   # 捲簾：上面的捲軸盒、布、下緣的鋁條、拉繩
    bl.rbox(-XI + 0.0, -XI + 0.11, WY1 + 0.01, WY1 + 0.12, t - WHW - 0.04, t + WHW + 0.04, r=0.02)
    if yb < WY1 - 0.03:
        face(bl, [(-XI + 0.055, yb, t - WHW + 0.02), (-XI + 0.055, yb, t + WHW - 0.02), (-XI + 0.055, WY1 + 0.02, t + WHW - 0.02), (-XI + 0.055, WY1 + 0.02, t - WHW + 0.02)], (1, 0, 0))
        face(bl, [(-XI + 0.05, yb, t - WHW + 0.02), (-XI + 0.05, WY1 + 0.02, t - WHW + 0.02), (-XI + 0.05, WY1 + 0.02, t + WHW - 0.02), (-XI + 0.05, yb, t + WHW - 0.02)], (-1, 0, 0))
    fr.box(-XI + 0.04, -XI + 0.07, yb - 0.03, yb, t - WHW + 0.02, t + WHW - 0.02)
    fr.cyl((-XI + 0.08, yb - 0.02, t + WHW - 0.12), (-XI + 0.08, max(WY0 + 0.25, yb - 0.6), t + WHW - 0.12), 0.003, seg=4)

# 後牆的門：鋼製門框、兩扇門（門板單獨的網格；door3d.js 推門時轉開其中一扇，門上的零件跟著轉）
dfr = mesh('WALL_S_doorframe', 'steel', 'S', lm=0.5)
for (x0, x1) in ((DOOR_X0 - 0.08, DOOR_X0), (DOOR_X1, DOOR_X1 + 0.08)): dfr.box(x0, x1, DOOR_Y0, DOOR_Y1 + 0.08, ZI - 0.035, D / 2 + T / 2)
dfr.box(DOOR_X0 - 0.08, DOOR_X1 + 0.08, DOOR_Y1, DOOR_Y1 + 0.08, ZI - 0.035, D / 2 + T / 2)
leafM = L.pbr('cls_door', 'walnut_veneer', tile=1.0, target='#7d5f45', normal=0.35)
for side, (x0, x1) in (('L', (DOOR_X0 + 0.005, -0.025)), ('R', (0.025, DOOR_X1 - 0.005))):   # 兩扇中間留 5 cm（推門時找門上零件的範圍放寬 4 cm：不會切到另一扇的邊）、左扇蓋一條壓條
    lf = mesh(f'WALL_S_door_{side}', leafM, 'S', lm=0.6); lf.rbox(x0, x1, DOOR_Y0 + 0.01, DOOR_Y1 - 0.005, ZI + 0.03, ZI + 0.075, r=0.005)
    xm = (x0 + x1) / 2; vis = mesh(f'WALL_S_doorvis_{side}', 'black', 'S', lm=0.3)   # 門上的小窗（後面是暗的走廊）
    vis.box(xm - 0.1, xm + 0.1, DOOR_Y0 + 1.15, DOOR_Y0 + 1.85, ZI + 0.026, ZI + 0.03)
    pl = mesh(f'WALL_S_doorpull_{side}', 'alu', 'S', lm=0.3); hx = -0.1 if side == 'L' else 0.1
    pl.cyl((hx, DOOR_Y0 + 0.85, ZI + 0.0), (hx, DOOR_Y0 + 1.25, ZI + 0.0), 0.012, seg=8)
    for yy in (DOOR_Y0 + 0.88, DOOR_Y0 + 1.22): pl.box(hx - 0.008, hx + 0.008, yy - 0.008, yy + 0.008, ZI + 0.0, ZI + 0.03)
    pl.box(x0 + 0.03, x1 - 0.03, DOOR_Y0 + 0.02, DOOR_Y0 + 0.24, ZI + 0.026, ZI + 0.03)   # 踢腳板
    if side == 'L': pl.box(-0.03, 0.012, DOOR_Y0 + 0.02, DOOR_Y1 - 0.02, ZI + 0.02, ZI + 0.03)   # 兩扇門中間的壓條（跟著左扇轉）

# ================= 前牆：黑板（粉筆槽、粉筆、板擦）、投影幕、喇叭 =================
bdm = mesh('WALL_N_board', 'board', 'N', lm=0.6)
uvq = [(BX0, BY0, -ZI + 0.03), (BX1, BY0, -ZI + 0.03), (BX1, BY1, -ZI + 0.03), (BX0, BY1, -ZI + 0.03)]
f = bdm.bm.faces.new([bdm.bm.verts.new(g2b(*p)) for p in uvq]); uvl = bdm.bm.loops.layers.uv.verify()
for lp, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uvl].uv = uv
f.normal_update()
if f.normal.dot(g2b(0, 0, 1)) < 0: f.normal_flip()
na = mesh('WALL_N_alu', 'alu', 'N', lm=0.4)
for (a, b, y0, y1) in ((BX0 - 0.035, BX1 + 0.035, BY1, BY1 + 0.035), (BX0 - 0.035, BX0, BY0, BY1), (BX1, BX1 + 0.035, BY0, BY1)): wbox(na, 'N', a, b, y0, y1, 0.0, 0.04)
wbox(na, 'N', BX0 - 0.05, BX1 + 0.05, BY0 - 0.045, BY0, 0.0, 0.1)                       # 粉筆槽
wbox(na, 'N', BX0 - 0.05, BX1 + 0.05, BY0 - 0.045, BY0 + 0.02, 0.095, 0.105)             # 粉筆槽的前緣
nb = mesh('WALL_N_back', 'board', 'N', lm=0.3); wbox(nb, 'N', BX0, BX1, BY0, BY1, 0.0, 0.028)   # 黑板本體（正面那張貼圖在前面 2 mm）
ch = mesh('WALL_N_props', 'vc', 'N', lm=0.3, cmesh=True)
for (x, col, ln) in ((-4.1, '#f2f0e8', 0.07), (-3.95, '#f2f0e8', 0.05), (-2.6, '#efe08a', 0.08), (-0.4, '#f2f0e8', 0.03), (0.2, '#e8a0a8', 0.06), (0.9, '#f2f0e8', 0.08), (1.2, '#9cc4e4', 0.05)):
    zz = -ZI + 0.05 + random.uniform(-0.015, 0.015); ccyl(ch, (x, BY0 + 0.006, zz), (x + ln, BY0 + 0.006, zz + random.uniform(-0.01, 0.01)), 0.0055, col, seg=6)
for x in (-3.4, 0.6):   # 板擦（藍色塑膠＋灰色毛氈）
    ch.crbox(x - 0.075, x + 0.075, BY0 + 0.015, BY0 + 0.045, -ZI + 0.03, -ZI + 0.085, '#2e5a8c', r=0.006); ch.cbox(x - 0.072, x + 0.072, BY0 + 0.0, BY0 + 0.016, -ZI + 0.033, -ZI + 0.082, '#5d5f62')
sc = C['screen']; SX0, SX1 = sc['x'] - sc['w'] / 2, sc['x'] + sc['w'] / 2; SY0, SY1 = sc['y'] - sc['h'] / 2, sc['y'] + sc['h'] / 2
wbox(mesh('WALL_N_alu', 'alu', 'N'), 'N', SX0 - 0.15, SX1 + 0.15, SY1 + 0.02, SY1 + 0.16, 0.0, 0.14, r=0.01)          # 投影幕的捲軸盒
scr = mesh('WALL_N_screen', 'screen', 'N', lm=0.5); wq(scr, 'N', SX0, SX1, SY0 + 0.06, SY1 - 0.25, 0.1)
blk = mesh('WALL_N_black', 'black', 'N', lm=0.4)
wq(blk, 'N', SX0, SX1, SY1 - 0.25, SY1 + 0.02, 0.1)                                      # 上面的黑邊
for (a, b) in ((SX0 - 0.0, SX0 + 0.06), (SX1 - 0.06, SX1)): wq(blk, 'N', a, b, SY0 + 0.06, SY1 - 0.25, 0.101)
wbox(blk, 'N', SX0 - 0.02, SX1 + 0.02, SY0 + 0.03, SY0 + 0.06, 0.09, 0.11)               # 下緣的配重條
for x in (-XI + 0.35, XI - 0.35):   # 牆上的喇叭（往下斜）
    wbox(blk, 'N', x - 0.15, x + 0.15, 4.25, 4.75, 0.05, 0.27, r=0.02); wbox(mesh('WALL_N_alu', 'alu', 'N'), 'N', x - 0.03, x + 0.03, 4.45, 4.55, 0.0, 0.06)

# ================= 天花板：輕鋼架、T5 格柵燈具、吸頂冷氣、投影機、喇叭、偵煙器 =================
mesh('ceiling', 'ceiling', lm=0.35); qy(MESH['ceiling'][0], -XI, XI, -ZI, ZI, H, up=False)
gm = mesh('WALL_ceil_grid', 'grid', 'ceil', lm=0.2)
k = -13
while k * 0.6 <= XI:
    x = k * 0.6
    if x > -XI + 0.05: gm.box(x - 0.012, x + 0.012, H - 0.018, H - 0.001, -ZI, ZI)
    k += 1
k = -15
while k * 0.6 <= ZI:
    z = k * 0.6
    if z > -ZI + 0.05: gm.box(-XI, XI, H - 0.018, H - 0.001, z - 0.012, z + 0.012)
    k += 1
fx, lt, lv = mesh('WALL_ceil_fix', 'fix', 'ceil', lm=0.3), mesh('WALL_ceil_light', 'light', 'ceil'), mesh('WALL_ceil_louvre', 'louvre', 'ceil', lm=0.2)
for cx in LX:
    for cz in LZ:
        fx.box(cx - 0.6, cx + 0.6, H - 0.045, H - 0.002, cz - 0.3, cz + 0.3)                  # 燈具外殼（凸出天花板 4 cm）
        qy(lt, cx - 0.57, cx + 0.57, cz - 0.27, cz + 0.27, H - 0.047, up=False)              # 發光面
        for dz in (-0.18, -0.09, 0.0, 0.09, 0.18): lv.box(cx - 0.57, cx + 0.57, H - 0.062, H - 0.046, cz + dz - 0.004, cz + dz + 0.004)   # 格柵（鋁）
        for dx in (-0.38, 0.0, 0.38): lv.box(cx + dx - 0.004, cx + dx + 0.004, H - 0.062, H - 0.046, cz - 0.27, cz + 0.27)
ac = mesh('WALL_ceil_ac', 'plastic', 'ceil', lm=0.3); cp = mesh('WALL_ceil_props', 'vc', 'ceil', lm=0.25, cmesh=True)
for (x, z) in ((-3.3, -2.7), (3.3, -2.7), (-3.3, 3.3), (3.3, 3.3)):   # 吸頂冷氣（62 cm 面板、四面出風）
    ac.rbox(x - 0.31, x + 0.31, H - 0.035, H - 0.002, z - 0.31, z + 0.31, r=0.01)
    cp.cbox(x - 0.17, x + 0.17, H - 0.038, H - 0.035, z - 0.17, z + 0.17, '#c9c8c3')
    for (a0, a1, b0, b1) in ((-0.25, 0.25, -0.27, -0.21), (-0.25, 0.25, 0.21, 0.27), (-0.27, -0.21, -0.25, 0.25), (0.21, 0.27, -0.25, 0.25)): cp.cbox(x + a0, x + a1, H - 0.038, H - 0.035, z + b0, z + b1, '#3b3d40')
for (x, z) in ((0.0, -5.7), (0.0, 0.3), (0.0, 6.3), (-6.0, 0.3), (6.0, 0.3)):   # 吸頂喇叭、偵煙器
    ccyl(cp, (x, H - 0.012, z), (x, H - 0.002, z), 0.1, '#e9e8e4', seg=16); ccyl(cp, (x, H - 0.014, z), (x, H - 0.012, z), 0.08, '#cfcfcb', seg=16)
for (x, z) in ((-3.3, 0.3), (3.3, 6.3), (-3.3, -6.3), (3.3, -0.3)):
    ccyl(cp, (x, H - 0.035, z), (x, H - 0.002, z), 0.055, '#f0efeb', seg=12); ccyl(cp, (x, H - 0.038, z), (x, H - 0.035, z), 0.012, '#c84030', seg=6)
px, pz = sc['x'], -2.3   # 投影機（離投影幕 6.3 m，對準投影幕）
ccyl(cp, (px, H - 0.002, pz), (px, H - 0.45, pz), 0.02, '#cfd0cc', seg=8); cp.cbox(px - 0.12, px + 0.12, H - 0.47, H - 0.44, pz - 0.12, pz + 0.12, '#bfc0bc')
cp.crbox(px - 0.21, px + 0.21, H - 0.62, H - 0.47, pz - 0.17, pz + 0.17, '#e4e3df', r=0.02); ccyl(cp, (px + 0.1, H - 0.545, pz - 0.17), (px + 0.1, H - 0.545, pz - 0.2), 0.045, '#2c2d30', seg=12)
cp.cbox(px - 0.18, px - 0.02, H - 0.6, H - 0.59, pz - 0.171, pz - 0.169, '#6a6c70')
ccyl(cp, (px - 0.1, H - 0.47, pz + 0.17), (px - 0.1, H - 0.002, pz + 0.25), 0.008, '#2a2a2a', seg=5)   # 電線

# ================= 講桌（木、深色桌面、正面的直線）＋桌上的東西 =================
Lc = C['lectern']; lx0, lx1, lz0, lz1 = Lc['x'] - Lc['w'] / 2, Lc['x'] + Lc['w'] / 2, Lc['z'] - Lc['d'] / 2, Lc['z'] + Lc['d'] / 2
lw = mesh('lectern_wood', 'lect', lm=0.6); lw.rbox(lx0, lx1, 0.06, Lc['h'] - 0.04, lz0, lz1, r=0.02, seg=2)
lw.rbox(lx0 + 0.05, lx1 - 0.05, 0.0, 0.07, lz0 + 0.05, lz1 - 0.05, r=0.005)
ld = mesh('lectern_dark', 'desk', lm=0.5); ld.rbox(lx0 - 0.04, lx1 + 0.04, Lc['h'] - 0.04, Lc['h'], lz0 - 0.05, lz1 + 0.04, r=0.008)
ld.box(Lc['x'] - 0.12, Lc['x'] + 0.12, 0.12, Lc['h'] - 0.08, lz1, lz1 + 0.012)            # 正面的深色直條
top = Lc['h']
props.cbox(Lc['x'] - 0.27, Lc['x'] + 0.07, top, top + 0.015, Lc['z'] - 0.27, Lc['z'] - 0.04, '#a9acb0')   # 筆電（鍵盤那一半，老師那一側＝北）
pr = mesh('PROPS_print', 'print', lm=0.3)
hz, hy = Lc['z'] - 0.04, top + 0.015; a = math.radians(102)   # 螢幕（轉軸在南邊、往北仰：老師看得到；學生看到銀色的背蓋）
p0, p1 = (Lc['x'] - 0.27, hy, hz), (Lc['x'] + 0.07, hy, hz)
p2, p3 = (p1[0], hy + 0.215, hz + 0.045), (p0[0], hy + 0.215, hz + 0.045)
props.poly([(p0[0], p0[1], p0[2] + 0.006), (p1[0], p1[1], p1[2] + 0.006), (p2[0], p2[1], p2[2] + 0.006), (p3[0], p3[1], p3[2] + 0.006)], '#b9bcc0')   # 背蓋（朝南）
uvquad(pr, [(p1[0] - 0.015, p1[1] + 0.012, p1[2] - 0.001), (p0[0] + 0.015, p0[1] + 0.012, p0[2] - 0.001), (p3[0] + 0.015, p3[1] - 0.01, p3[2] - 0.001), (p2[0] - 0.015, p2[1] - 0.01, p2[2] - 0.001)], 'SLIDE', (0, 0.2, -1))
ccyl(props, (lx1 - 0.12, top, Lc['z'] - 0.2), (lx1 - 0.12, top + 0.02, Lc['z'] - 0.2), 0.04, '#26272a', seg=10)   # 鵝頸麥克風
ccyl(props, (lx1 - 0.12, top + 0.02, Lc['z'] - 0.2), (lx1 - 0.13, top + 0.3, Lc['z'] - 0.26), 0.006, '#2d2e31', seg=6)
ccyl(props, (lx1 - 0.13, top + 0.3, Lc['z'] - 0.26), (lx1 - 0.14, top + 0.36, Lc['z'] - 0.36), 0.006, '#2d2e31', seg=6)
ccyl(props, (lx1 - 0.14, top + 0.36, Lc['z'] - 0.36), (lx1 - 0.145, top + 0.35, Lc['z'] - 0.42), 0.014, '#18191b', seg=8)
props.crbox(lx0 + 0.08, lx0 + 0.3, top, top + 0.012, Lc['z'] - 0.05, Lc['z'] + 0.25, '#7a5a3a', r=0.004)       # 點名板
uvquad(pr, [(lx0 + 0.095, top + 0.0125, Lc['z'] + 0.235), (lx0 + 0.285, top + 0.0125, Lc['z'] + 0.235), (lx0 + 0.285, top + 0.0125, Lc['z'] - 0.035), (lx0 + 0.095, top + 0.0125, Lc['z'] - 0.035)], 'SHEET', (0, 1, 0))
props.cbox(lx0 + 0.16, lx0 + 0.22, top + 0.012, top + 0.022, Lc['z'] - 0.06, Lc['z'] - 0.03, '#9a9a9a')
ccyl(props, (lx1 - 0.18, top, Lc['z'] + 0.2), (lx1 - 0.18, top + 0.21, Lc['z'] + 0.2), 0.034, '#5d7a8c', seg=12)   # 保溫瓶
ccyl(props, (lx1 - 0.18, top + 0.21, Lc['z'] + 0.2), (lx1 - 0.18, top + 0.24, Lc['z'] + 0.2), 0.03, '#2b2c2e', seg=12)
props.cbox(lx0 + 0.36, lx0 + 0.46, top, top + 0.07, Lc['z'] + 0.12, Lc['z'] + 0.2, '#f0ece2')   # 粉筆盒
props.crbox(Lc['x'] + 0.12, Lc['x'] + 0.26, top, top + 0.01, Lc['z'] - 0.28, Lc['z'] - 0.18, '#1d1e20', r=0.004)   # 簡報器、HDMI 線
ccyl(props, (Lc['x'] + 0.07, top + 0.007, Lc['z'] - 0.12), (lx1 + 0.03, top + 0.004, Lc['z'] - 0.05), 0.004, '#202020', seg=4)

# ================= 生活感：桌尾的講義、掛在桌邊的雨傘、桌上的水、手搖杯、窗台上沒喝完的飲料 =================
def desk_top(r): return rowH(r) + dk['top']
r = 5; z0 = rowZ(r); t5 = desk_top(r)
for k2 in range(6): props.cbox(-5.86, -5.62, t5 + k2 * 0.0035, t5 + (k2 + 1) * 0.0035, z0 + 0.1 + k2 * 0.004, z0 + 0.41 + k2 * 0.004, '#f4f2ec' if k2 % 2 else '#ecebe5')   # 一疊講義
props.crbox(-5.95, -5.88, t5, t5 + 0.04, z0 + 0.32, z0 + 0.45, '#2f3a48', r=0.006)   # 訂書機
r = 2; z0 = rowZ(r); t2 = desk_top(r); ux, uz = 5.93, z0 + dk['dz'] + dk['d'] / 2 + 0.03   # 掛在桌邊的雨傘（深藍、收起來）
ccyl(props, (ux, t2 - 0.02, uz), (ux, rowH(r) + 0.08, uz + 0.02), 0.03, '#26324a', seg=8, r2=0.012)
ccyl(props, (ux, rowH(r) + 0.08, uz + 0.02), (ux, rowH(r) + 0.02, uz + 0.02), 0.004, '#9a9a9a', seg=5)
for (a0, a1) in (((ux, t2 - 0.02, uz), (ux, t2 + 0.03, uz))), (((ux, t2 + 0.03, uz), (ux, t2 + 0.05, uz - 0.04))), (((ux, t2 + 0.05, uz - 0.04), (ux, t2 + 0.03, uz - 0.08))):
    ccyl(props, a0, a1, 0.011, '#3a2a20', seg=6)
r = 4; z0 = rowZ(r); t4 = desk_top(r)   # 水（寶特瓶）
ccyl(props, (0.02, t4, z0 + 0.3), (0.02, t4 + 0.2, z0 + 0.3), 0.032, '#a9c8dc', seg=10); ccyl(props, (0.02, t4 + 0.2, z0 + 0.3), (0.02, t4 + 0.235, z0 + 0.3), 0.014, '#2e6aa8', seg=8)
r = 0; z0 = rowZ(r); t0 = desk_top(r)   # 手搖杯（奶茶、封膜、吸管）
ccyl(props, (3.0, t0, z0 + 0.32), (3.0, t0 + 0.15, z0 + 0.32), 0.038, '#c9a27a', seg=12, r2=0.046); ccyl(props, (3.0, t0 + 0.15, z0 + 0.32), (3.0, t0 + 0.155, z0 + 0.32), 0.047, '#e8e2d6', seg=12)
ccyl(props, (3.0, t0 + 0.1, z0 + 0.32), (3.02, t0 + 0.26, z0 + 0.3), 0.005, '#e45a5a', seg=5)
r = 1; z0 = rowZ(r); t1 = desk_top(r)   # 闔起來的筆記本＋筆
props.crbox(-3.12, -2.88, t1, t1 + 0.012, z0 + 0.12, z0 + 0.42, '#3f6d8c', r=0.004); ccyl(props, (-2.84, t1 + 0.005, z0 + 0.15), (-2.84, t1 + 0.005, z0 + 0.3), 0.0045, '#22262c', seg=5)
wp = mesh('WALL_W_props', 'vc', 'W', lm=0.3, cmesh=True); t = WIN_XS[2]   # 窗台上沒喝完的手搖杯（西牆的東西：牆淡出時一起淡出）
ccyl(wp, (-XI + 0.02, WY0 + 0.012, t - 0.7), (-XI + 0.02, WY0 + 0.162, t - 0.7), 0.038, '#d8b98e', seg=12, r2=0.046); ccyl(wp, (-XI + 0.02, WY0 + 0.162, t - 0.7), (-XI + 0.02, WY0 + 0.167, t - 0.7), 0.047, '#ece8de', seg=12)
ccyl(wp, (-XI + 0.02, WY0 + 0.1, t - 0.7), (-XI + 0.03, WY0 + 0.27, t - 0.72), 0.005, '#3a7ad0', seg=5)
wbox(wp, 'W', -ZI + 0.35, -ZI + 0.47, 1.25, 1.37, 0.02, 0.035, '#f2f1ec')   # 講台邊的電燈開關、冷氣控制器（裝在腰牆上）
for k2 in range(3): wbox(wp, 'W', -ZI + 0.37 + k2 * 0.033, -ZI + 0.395 + k2 * 0.033, 1.28, 1.34, 0.035, 0.04, '#e2e1dc')
wbox(wp, 'W', -ZI + 0.55, -ZI + 0.67, 1.24, 1.38, 0.02, 0.04, '#f2f1ec'); wbox(wp, 'W', -ZI + 0.57, -ZI + 0.65, 1.3, 1.36, 0.04, 0.041, '#5c6b70')

# ================= 後牆：公告欄、課表、出口燈、電燈開關；地上：垃圾分類桶、滅火器 =================
sp, spr = mesh('WALL_S_props', 'vc', 'S', lm=0.3, cmesh=True), mesh('WALL_S_print', 'print', 'S', lm=0.4)
FY = DOOR_Y0   # 後面的地面 1.8
wbox(sp, 'S', -4.65, -2.55, FY + 0.75, FY + 1.8, 0.0, 0.025, '#a9845a'); wbox(sp, 'S', -4.68, -2.52, FY + 0.72, FY + 1.83, 0.0, 0.02, '#9da0a4')   # 軟木公告欄＋鋁框
for i, (a, y, rot) in enumerate(((-4.45, FY + 1.12, 2), (-4.2, FY + 1.42, -3), (-3.95, FY + 1.1, 1), (-3.65, FY + 1.45, 4), (-3.35, FY + 1.13, -2), (-2.95, FY + 1.4, 3))):
    wq(spr, 'S', a - 0.085, a + 0.085, y - 0.12, y + 0.12, 0.03 + i * 0.0005, f'FLY{i}')
    wbox(sp, 'S', a - 0.006, a + 0.006, y + 0.105, y + 0.117, 0.03, 0.04, '#c83228')   # 圖釘
wq(spr, 'S', -3.1, -2.62, FY + 0.82, FY + 1.02, 0.03, 'SEAT')
wbox(sp, 'S', 1.22, 1.78, FY + 0.92, FY + 1.68, 0.0, 0.015, '#3a3b3e'); wq(spr, 'S', 1.25, 1.75, FY + 0.95, FY + 1.65, 0.016, 'TIME')   # 課表（框）
wbox(sp, 'S', -1.27, -1.05, FY + 1.02, FY + 1.18, 0.0, 0.015, '#f2f1ec')                # 電燈開關
for k2 in range(3): wbox(sp, 'S', -1.25 + k2 * 0.07, -1.2 + k2 * 0.07, FY + 1.05, FY + 1.15, 0.015, 0.02, '#e2e1dc')
wbox(sp, 'S', -0.32, 0.32, DOOR_Y1 + 0.2, DOOR_Y1 + 0.44, 0.0, 0.07, '#f2f1ec', r=0.01)   # 出口燈的外殼
ex = mesh('WALL_S_exit', 'exit', 'S', lm=0.2); wq(ex, 'S', -0.29, 0.29, DOOR_Y1 + 0.225, DOOR_Y1 + 0.415, 0.071, 'EXIT')
# 垃圾分類桶、滅火器：講台區的東北角（靠東牆；10-28 第一版放在後牆，玩家一進門的鏡頭在後牆外，桶子被畫面切一半擋在最前面）
for i, (z, col) in enumerate(((-8.05, '#70777b'), (-7.6, '#2f6aa6'), (-7.15, '#3f8456'))):
    props.crbox(XI - 0.33, XI - 0.02, 0.0, 0.6, z - 0.19, z + 0.19, col, r=0.02); props.crbox(XI - 0.34, XI - 0.01, 0.6, 0.65, z - 0.2, z + 0.2, '#2b2c2e', r=0.012)
    props.cbox(XI - 0.22, XI - 0.13, 0.6, 0.655, z - 0.12, z + 0.12, '#151516')
    uvquad(pr, [(XI - 0.331, 0.38, z + 0.09), (XI - 0.331, 0.38, z - 0.09), (XI - 0.331, 0.5, z - 0.09), (XI - 0.331, 0.5, z + 0.09)], f'BIN{i}', (-1, 0, 0))
fz = -6.65; ccyl(props, (XI - 0.15, 0.0, fz), (XI - 0.15, 0.46, fz), 0.075, '#c42a22', seg=14)   # 滅火器
ccyl(props, (XI - 0.15, 0.46, fz), (XI - 0.15, 0.53, fz), 0.03, '#2b2b2b', seg=8); props.cbox(XI - 0.17, XI - 0.13, 0.53, 0.55, fz - 0.03, fz + 0.06, '#2b2b2b')
ccyl(props, (XI - 0.15, 0.5, fz + 0.04), (XI - 0.1, 0.15, fz + 0.1), 0.008, '#1b1b1b', seg=5)
props.cbox(XI - 0.28, XI - 0.02, 0.0, 0.03, fz - 0.12, fz + 0.12, '#3a3a3a')

# ================= 東牆：教室使用規則、緊急照明、火警警鈴 =================
ep, epr = mesh('WALL_E_props', 'vc', 'E', lm=0.3, cmesh=True), mesh('WALL_E_print', 'print', 'E', lm=0.4)
wbox(ep, 'E', -5.5, -4.9, WAIN + 0.3, WAIN + 1.15, 0.0, 0.02, '#5a4636'); wq(epr, 'E', -5.46, -4.94, WAIN + 0.34, WAIN + 1.11, 0.021, 'RULES')
wq(epr, 'E', -6.83, -6.47, WAIN + 0.1, WAIN + 0.18, 0.005, 'FIRE')                     # 滅火器的標示（下面就是滅火器）
wbox(ep, 'E', -1.25, -0.85, 3.6, 3.75, 0.0, 0.09, '#f2f1ec', r=0.01)                     # 緊急照明
for dz in (-0.12, 0.12): ccyl(ep, wall_pt('E', -1.05 + dz, 3.62, 0.09), wall_pt('E', -1.05 + dz, 3.62, 0.15), 0.035, '#e8e8e4', seg=10)
ccyl(ep, wall_pt('E', 7.0, 3.1, 0.0), wall_pt('E', 7.0, 3.1, 0.06), 0.09, '#c42a22', seg=16)   # 火警警鈴＋按鈕
wbox(ep, 'E', 6.92, 7.08, 2.75, 2.9, 0.0, 0.04, '#c42a22', r=0.008)

# ================= 合成、光照貼圖的比例、匯出 =================
SMOOTH = {'SEATPANS', 'seats_wood', 'seats_steel'}
UVKEEP = {'WALL_N_board', 'PROPS_print', 'WALL_S_print', 'WALL_E_print', 'WALL_S_exit'}   # 自己指定 UV 的（貼圖集的一塊）：不做盒狀 UV
for name, (m, p) in MESH.items():
    ob = m.finish(ROOTG, props=p, smooth=name in SMOOTH, uv=name not in UVKEEP)
    if ob is None: continue
    if name in ('desks_top', 'lectern_dark'):   # 桌面的木紋沿長邊（貼圖的紋是直的：u、v 對調）
        uvl = ob.data.uv_layers.active
        for lp in ob.data.loops: u, v = uvl.data[lp.index].uv; uvl.data[lp.index].uv = (v, u)
print(json.dumps({'meshes': len(MESH), 'tris': sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in bpy.data.objects if o.type == 'MESH'),
                  'seats': len(SEATS)}, ensure_ascii=False))
L.export(OUT, gpu_instances=False)
if RENDER:
    B.render_views(RENDER, 'classroom', [('from_door', (0.0, 3.9, 7.6), (-1.5, 1.2, -6.5)), ('from_lectern', (2.5, 2.2, -7.0), (-0.5, 1.4, 4.0)), ('row2_side', (7.0, 2.8, 0.5), (-2.0, 1.0, -1.5))],
                   lights=[(0, 4.8, -4, 400), (0, 4.8, 2, 400), (0, 4.8, 6, 300)])
