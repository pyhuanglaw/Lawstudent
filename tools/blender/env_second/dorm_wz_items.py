"""宿舍房間：溫州街打工、故事線留下來的六件東西（ART-WZ6；AA_420 第 9 節，任務 DL-11；LAWWW2-B 2026-10-24）→ GLB。
照 dorm_y3_items.py 的做法。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/dorm_wz_items.py [-- --out assets/models/env/second_ai/dorm_wz_items.glb]

故事（文字已經在 src/data/wz_jobs.js 的 room、src/jobs3d.js 的 S.room；這裡只做模型和位置）：每一件是一個節點 ITEM_wz_<key>，key 和 wz_jobs.js 的 room 一樣：
  ITEM_wz_timer     蛋的計時器（半熟離職，WZ_ITEM_TIMER）：書桌右後角（六法和衣櫃中間，靠牆）；轉盤上三分四十秒那一格有一道舊刮痕
  ITEM_wz_card      手寫的卡片（林太太，WZ_CARD）：書桌前緣、筆電左前方，攤開的對摺卡片（一頁平放、一頁翹起來）
  ITEM_wz_notebook  膠裝的空白筆記本（阿德影印離職，WZ_ITEM_NOTEBOOK）：層架頂上平放，書背朝房間
  ITEM_wz_tea       一小罐茶（一盞離職，WZ_ITEM_TEA；送出去以後 WZ_TEA_GIVEN 就收起來）：層架頂上、筆記本左邊
  ITEM_wz_board     讀書會白板的照片（WZ_YE_DONE）：層架和衣櫃中間那一條牆，紙膠帶貼著（網格 WALL_left_wz_board：跟左牆一起淡出）
  ITEM_wz_poster    子晴成發的藍色海報（A2，WZ_POSTER_ITEM）：上舖旁邊的牆（床的上方），紙膠帶貼四個角（網格 WALL_left_wz_poster：跟左牆一起淡出）
位置（遊戲 dorm 區域，四人房 dorm_room4.glb，祐廷＝L2＝左牆靠門那組；大一 203 到大四 409 都是同一組家具）：
  書桌 x −2.895～−2.28、z −0.96～0.315、桌面 0.76；層架頂 y 1.42（x −2.895～−2.63、z −0.51～0.19）；上舖床板底 1.56；牆面 x −2.90。
  已經有的東西（dorm_room4 的 Y203／Y312／Y507／Y409_YUTING、dorm_y2_items、dorm_y3_items、黃金葛 prop_pothos）都量過範圍，這裡全部避開：
  計時器在六法（z 到 0.215）和衣櫃（z 0.34）中間、單字卡（x −2.66 以後）的後面；卡片在大三起前緣那一疊紙的上面（紙只有 3 mm 厚，大一、大二是直接放桌上）；
  層架頂上大二的泡麵在 z −0.04 以後，這裡在 z −0.50～−0.19；牆上那一條在層架側板（z 0.19）和衣櫃（z 0.34）中間。
每一件一個網格、整組一個材質 wz6_print（貼圖集）：一件只多一次 draw call。印刷品、手寫都是本作程式畫的（PIL）；海報上的字是虛構的「成果發表會」，沒有店名、商標（D77）。
"""
import json, math, os, sys, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/dorm_wz_items.glb'))
GEN = os.path.join(HERE, 'textures', 'gen'); os.makedirs(GEN, exist_ok=True); ATLAS = os.path.join(GEN, 'dorm_wz_print.png')
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
rng = random.Random(420)

# ---------------- 貼圖集（1024×1024，本作程式畫的）----------------
AW, AH = 1024, 1024
SOLID = {'c_eggwhite': (246, 243, 234), 'c_seam': (120, 116, 108), 'c_pointer': (40, 40, 44), 'c_tin': (176, 160, 120), 'c_tinlid': (148, 132, 96),
         'c_white': (246, 246, 242), 'c_tape': (226, 214, 180)}
SIZES = [('poster', 256, 362), ('photo', 190, 134), ('card_out', 150, 212), ('card_in_a', 150, 212), ('card_in_b', 150, 212),
         ('nb_cover', 150, 212), ('dial', 256, 64), ('tea_label', 220, 70), ('nb_spine', 212, 18), ('pages', 212, 18), ('tape', 32, 16)] + [(k, 16, 16) for k in SOLID]
R = {}
cx, cy, rowh = 4, 4, 0
for nm, w, h in SIZES:
    if cx + w + 4 > AW: cx, cy, rowh = 4, cy + rowh + 6, 0
    R[nm] = (cx, cy, cx + w, cy + h); cx += w + 6; rowh = max(rowh, h)
assert cy + rowh <= AH, ('貼圖集放不下', cy + rowh)


def draw_atlas():
    im = Image.new('RGB', (AW, AH), (200, 200, 200)); d = ImageDraw.Draw(im)
    def box(k): return R[k]
    def fill(k, c): d.rectangle(box(k), fill=c)
    def scribble(bx, col, rows, w=2, amp=3, seed=0, neat=False):   # 手寫的筆跡（波浪線，不是字）；neat＝字很工整（行很直、長短一樣）
        r = random.Random(seed); x0, y0, x1, y1 = bx
        for k in range(rows):
            y = y0 + (k + 0.5) * (y1 - y0) / rows; xe = x1 - (r.uniform(0, (x1 - x0) * 0.1) if neat else r.uniform(0, (x1 - x0) * 0.35))
            if k == rows - 1 and neat: xe = x0 + (x1 - x0) * 0.32   # 最後一行很短（「下週見。」）
            pts = []; x = x0
            while x < xe:
                pts.append((x, y + amp * math.sin(x * r.uniform(0.5, 0.7)) * (0.6 if neat else 1.0) + (0 if neat else r.uniform(-1, 1)))); x += 2
            if len(pts) > 1: d.line(pts, fill=col, width=w)
            if neat:
                for k2 in range(int((xe - x0) // 11)): d.line((x0 + 11 * k2 + 5, y - amp - 1, x0 + 11 * k2 + 6, y + amp + 1), fill=col, width=1)   # 一格一格的字（工整）
    # ---- 子晴成發的海報（A2 直式，亮藍）：上面兩行標題（白字，虛構）、中間幾何的點陣圖形、下面日期地點的白條
    x0, y0, x1, y1 = box('poster'); W_, H_ = x1 - x0, y1 - y0
    pim = Image.new('RGB', (W_, H_), (24, 104, 230)); pd = ImageDraw.Draw(pim)
    for yy in range(H_): t = yy / H_; pd.line((0, yy, W_, yy), fill=(int(20 + 14 * t), int(112 - 30 * t), int(236 - 20 * t)))
    for k in range(9):   # 點陣的波（像程式的輸出）
        for j in range(22):
            px = 18 + j * 10; py = 150 + k * 12 + int(18 * math.sin(j * 0.45 + k * 0.6)); rr = 2 + (k + j) % 3
            pd.ellipse((px - rr, py - rr, px + rr, py + rr), fill=(255, 255, 255) if (k * 7 + j) % 5 else (255, 214, 64))
    pd.rectangle((18, 112, W_ - 18, 116), fill=(255, 214, 64))
    try:
        f1 = ImageFont.truetype(FONT, 34); f2 = ImageFont.truetype(FONT, 16); f3 = ImageFont.truetype(FONT, 12)
        pd.text((20, 26), '成果發表會', font=f1, fill=(255, 255, 255)); pd.text((22, 76), 'DEMO DAY', font=f2, fill=(190, 222, 255))
        pd.text((22, H_ - 66), '十二月　週六　14:00', font=f3, fill=(255, 255, 255)); pd.text((22, H_ - 46), '入場免費', font=f3, fill=(255, 255, 255))
    except Exception as e:
        print('字型讀不到，海報只有色塊', e); pd.rectangle((20, 26, 200, 60), fill=(255, 255, 255))
    pd.rectangle((W_ - 74, H_ - 74, W_ - 18, H_ - 18), fill=(255, 255, 255))   # 報名的方塊（像 QR code 的位置，沒有碼：一格一格的淡藍）
    for i in range(7):
        for j in range(7):
            if (i * 3 + j * 5) % 4: pd.rectangle((W_ - 70 + i * 7, H_ - 70 + j * 7, W_ - 65 + i * 7, H_ - 65 + j * 7), fill=(30, 80, 170))
    im.paste(pim, (x0, y0))
    # ---- 讀書會白板的照片（4×6 吋相紙橫式，白邊）：白板上一條時間線，中間以安的藍字（整齊）、旁邊 Alison 的紅字（斜、擠）
    x0, y0, x1, y1 = box('photo'); fill('photo', (250, 250, 248))
    bx0, by0, bx1, by1 = x0 + 7, y0 + 7, x1 - 7, y1 - 7
    for yy in range(by0, by1): t = (yy - by0) / (by1 - by0); d.line((bx0, yy, bx1, yy), fill=(int(214 - 30 * t), int(216 - 28 * t), int(212 - 24 * t)))   # 教室的燈：上亮下暗
    d.rectangle((bx0 + 8, by0 + 6, bx1 - 8, by1 - 18), fill=(244, 246, 244), outline=(150, 150, 154), width=2)   # 白板
    ty = (by0 + by1) // 2 - 4; d.line((bx0 + 16, ty, bx1 - 16, ty), fill=(30, 50, 140), width=2)
    for k in range(7):
        tx = bx0 + 22 + k * 22; d.line((tx, ty - 4, tx, ty + 4), fill=(30, 50, 140), width=2)
        scribble((tx - 8, ty + 8, tx + 8, ty + 18), (30, 50, 140), 1, w=1, amp=1, seed=k, neat=False)
    scribble((bx0 + 40, by0 + 14, bx0 + 120, by0 + 30), (30, 50, 140), 2, w=1, amp=1, seed=9, neat=True)
    for k in range(3): scribble((bx0 + 120 + k * 6, by0 + 12 + k * 10, bx1 - 14, by0 + 22 + k * 10), (190, 40, 40), 1, w=1, amp=2, seed=20 + k)
    d.line((bx0 + 126, by0 + 50, bx0 + 150, ty - 6), fill=(190, 40, 40), width=1)   # 紅色的箭頭指到時間線
    d.rectangle((bx0 + 10, by1 - 16, bx1 - 10, by1 - 12), fill=(176, 176, 180))   # 白板的筆槽
    # ---- 手寫的卡片：外面（米色、淡綠的葉子壓紋）、裡面兩頁（工整的藍黑色字，最後一行很短）
    x0, y0, x1, y1 = box('card_out'); fill('card_out', (242, 236, 220))
    for k in range(6):
        lx, ly = x0 + 30 + (k % 3) * 40, y0 + 50 + (k // 3) * 70; d.ellipse((lx - 10, ly - 20, lx + 10, ly + 20), outline=(150, 176, 128), width=2); d.line((lx, ly - 18, lx, ly + 18), fill=(150, 176, 128), width=1)
    x0, y0, x1, y1 = box('card_in_a'); fill('card_in_a', (250, 247, 238)); scribble((x0 + 16, y0 + 24, x1 - 16, y0 + 150), (40, 48, 92), 8, w=1, amp=2, seed=31, neat=True)
    x0, y0, x1, y1 = box('card_in_b'); fill('card_in_b', (250, 247, 238)); scribble((x0 + 16, y0 + 24, x1 - 16, y0 + 120), (40, 48, 92), 6, w=1, amp=2, seed=32, neat=True)
    scribble((x1 - 70, y0 + 150, x1 - 18, y0 + 166), (40, 48, 92), 1, w=1, amp=3, seed=33)   # 署名
    # ---- 膠裝的空白筆記本：封面是阿德店裡的牛皮紙封面（沒有字，右下角一個小小的打洞）、書背很直、書口
    x0, y0, x1, y1 = box('nb_cover'); fill('nb_cover', (198, 168, 124))
    for k in range(40): yy = y0 + rng.randint(0, y1 - y0); d.line((x0, yy, x1, yy + rng.randint(-2, 2)), fill=(190, 160, 116), width=1)   # 牛皮紙的纖維
    d.rectangle((x0, y0, x0 + 8, y1), fill=(176, 146, 104))
    x0, y0, x1, y1 = box('nb_spine'); fill('nb_spine', (172, 142, 100)); d.line((x0, (y0 + y1) // 2, x1, (y0 + y1) // 2), fill=(160, 130, 90), width=1)
    x0, y0, x1, y1 = box('pages'); fill('pages', (244, 241, 232))
    for yy in range(y0 + 2, y1, 3): d.line((x0, yy, x1, yy), fill=(226, 222, 210))
    # ---- 計時器的轉盤：一圈刻度（0～55 分，每 5 分一個數字），三分四十秒那一格有一道斜斜的舊刮痕
    x0, y0, x1, y1 = box('dial'); fill('dial', (250, 226, 120))
    band0, band1 = y0 + 30, y1 - 4; d.rectangle((x0, band0, x1, band1), fill=(252, 244, 214))
    try: fd = ImageFont.truetype(FONT, 11)
    except Exception: fd = None
    for m in range(60):
        tx = x0 + (x1 - x0) * (m + 0.5) / 60.0; long_ = m % 5 == 0   # 半格的位移：0 分的數字不會畫到隔壁那一塊
        d.line((tx, band1 - (14 if long_ else 7), tx, band1), fill=(60, 56, 50), width=2 if long_ else 1)
        if long_ and fd is not None: d.text((tx - 6, band0 + 1), str(m), font=fd, fill=(60, 56, 50))
    sx = x0 + (x1 - x0) * (3.667 + 0.5) / 60.0; d.line((sx - 3, band1 - 2, sx + 4, band0 + 4), fill=(206, 200, 184), width=1); d.line((sx - 2, band1 - 1, sx + 5, band0 + 5), fill=(150, 144, 130), width=1)   # 刮痕
    # ---- 茶罐的和紙標籤（淺綠的和紙、細纖維、小小的紅色方印；沒有字）
    x0, y0, x1, y1 = box('tea_label'); fill('tea_label', (206, 220, 196))
    for k in range(60): fx = x0 + rng.randint(0, x1 - x0); fy = y0 + rng.randint(0, y1 - y0); d.line((fx, fy, fx + rng.randint(-8, 8), fy + rng.randint(-3, 3)), fill=(222, 232, 214), width=1)
    d.rectangle((x0, y0, x1, y0 + 6), fill=(120, 150, 110)); d.rectangle((x0, y1 - 6, x1, y1), fill=(120, 150, 110))
    for k in range(4): d.rectangle((x0 + 20 + k * 55, y0 + 26, x0 + 34 + k * 55, y0 + 40), fill=(186, 52, 44))
    x0, y0, x1, y1 = box('tape'); fill('tape', SOLID['c_tape'])
    for xx in range(x0, x1, 4): d.line((xx, y0, xx, y1), fill=(216, 202, 166))
    im = im.filter(ImageFilter.GaussianBlur(0.4)); d = ImageDraw.Draw(im)
    for k, col in SOLID.items(): x0, y0, x1, y1 = box(k); d.rectangle((x0 - 2, y0 - 2, x1 + 2, y1 + 2), fill=col)   # 單色塊不模糊、四周多 2 px
    im.save(ATLAS); return im


draw_atlas()


def uvr(key):
    x0, y0, x1, y1 = R[key]; return (x0 / AW, 1 - y1 / AH, x1 / AW, 1 - y0 / AH)   # Blender UV（v 往上）


class TMesh(Mesh):
    """貼圖集的網格：每個面指定貼圖集裡的一塊（同 dorm_y3_items.py）"""
    def __init__(self, name, mat):
        super().__init__(name, mat); self.uv = self.bm.loops.layers.uv.new('UVMap')

    def tquad(self, pts, key, flip=False):
        u0, v0, u1, v1 = uvr(key); f = self.bm.faces.new([self.bm.verts.new(g2b(*p)) for p in pts])
        uvs = [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]
        if flip: uvs = [uvs[1], uvs[0], uvs[3], uvs[2]]
        for lp, uv in zip(f.loops, uvs): lp[self.uv].uv = uv
        return f

    def uvface(self, pts, uvs):
        f = self.bm.faces.new([self.bm.verts.new(g2b(*p)) for p in pts])
        for lp, uv in zip(f.loops, uvs): lp[self.uv].uv = uv
        return f

    def finish(self, parent=None, props=None, uv=False, smooth=False, merge=True):
        return super().finish(parent, props, uv=False, smooth=smooth, merge=merge)


def vadd(*vs): return tuple(sum(v[i] for v in vs) for i in range(3))
def vmul(v, s): return (v[0] * s, v[1] * s, v[2] * s)
def roty(v, a):
    ca, sa = math.cos(a), math.sin(a); return (v[0] * ca + v[2] * sa, v[1], -v[0] * sa + v[2] * ca)
def inplane(R_, U_, t):
    c, s = math.cos(t), math.sin(t); return vadd(vmul(R_, c), vmul(U_, s)), vadd(vmul(U_, c), vmul(R_, -s))
def card(tm, c, R_, U_, hw, hh, key, tilt=0.0, flip=False):
    """一張紙（四邊形）：中心 c、圖的右邊 R、上面 U（法線＝R×U）、半寬 hw、半高 hh"""
    if tilt: R_, U_ = inplane(R_, U_, tilt)
    BL = vadd(c, vmul(R_, -hw), vmul(U_, -hh)); BR = vadd(c, vmul(R_, hw), vmul(U_, -hh)); TR = vadd(c, vmul(R_, hw), vmul(U_, hh)); TL = vadd(c, vmul(R_, -hw), vmul(U_, hh))
    tm.tquad([BL, BR, TR, TL], key, flip=flip); return (BL, BR, TR, TL)


def solid_uv(t, key, f0, v0=None):
    """f0 以後新加的面全部貼貼圖集 key 那一塊單色"""
    u0, v0_, u1, v1 = uvr(key); c = ((u0 + u1) / 2, (v0_ + v1) / 2); t.bm.faces.ensure_lookup_table()
    for i in range(f0, len(t.bm.faces)):
        for lp in t.bm.faces[i].loops: lp[t.uv].uv = c


def lathe(t, cx, y0, cz, prof, seg, uvfun, rot=0.0):
    """旋轉體（遊戲座標，繞過 (cx, cz) 的鉛直軸）：prof＝[(半徑, 高度)…] 由下往上；uvfun(i_ring, frac_around)→(u, v)；縫多一排頂點，貼圖不會在縫上擠成一條"""
    rows = []
    for (r, h) in prof:
        rows.append([(cx + r * math.cos(2 * math.pi * j / seg + rot), y0 + h, cz - r * math.sin(2 * math.pi * j / seg + rot)) for j in range(seg + 1)])
    for i in range(len(prof) - 1):
        for j in range(seg):
            pts = [rows[i][j], rows[i][j + 1], rows[i + 1][j + 1], rows[i + 1][j]]
            uvs = [uvfun(i, j / seg), uvfun(i, (j + 1) / seg), uvfun(i + 1, (j + 1) / seg), uvfun(i + 1, j / seg)]
            if prof[i][0] < 1e-5 and prof[i + 1][0] < 1e-5: continue
            if prof[i][0] < 1e-5: pts, uvs = [pts[0], pts[2], pts[3]], [uvs[0], uvs[2], uvs[3]]
            elif prof[i + 1][0] < 1e-5: pts, uvs = pts[:3], uvs[:3]
            t.uvface(pts, uvs)


B.reset(texres=512)
def print_mat(name):
    m = L.flat(name, '#ffffff', rough=0.72); nt = m.node_tree; tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS)
    nt.links.new(tx.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color']); return m
MAT = print_mat('wz6_print')   # 整組一個材質
root = B.group('dorm_wz_items', props={'kind': 'dorm_wz_items'})
def item(key, flag, mesh_name=None, props=None):
    """一件東西：節點 ITEM_wz_<key>＋它唯一的網格（貼在牆上的網格叫 WALL_left_wz_<key>：遊戲照左牆一起淡出）"""
    g = B.group('ITEM_wz_' + key, root, dict({'kind': 'room_item', 'key': key, 'flag': flag}, **(props or {})))
    return g, TMesh(mesh_name or ('wz6_' + key), MAT)


Y = 0.76                              # 桌面
WALL = -2.90 + 0.0012                 # 左牆的牆面（往房間 1.2 mm）
WR, WU = (0.0, 0.0, -1.0), (0.0, 1.0, 0.0)   # 左牆上的紙：法線 +x；從房間看，圖的右邊＝−z、上面＝+y
SHELF = 1.42                          # 層架頂


def taped_wall(t, zl, zr, y0, y1, key, tilt=0.0, corners=2):
    """貼在左牆的紙（紙膠帶貼上面兩個角，corners=4＝四個角）：zl＝從房間看的左邊緣（z 大）"""
    c = (WALL, (y0 + y1) / 2, (zl + zr) / 2); hw, hh = (zl - zr) / 2, (y1 - y0) / 2
    card(t, c, WR, WU, hw, hh, key, tilt); Rt, Ut = inplane(WR, WU, tilt)
    for sx, sy in ((-1, 1), (1, 1)) + (((-1, -1), (1, -1)) if corners == 4 else ()):
        tc = vadd(c, vmul(Rt, sx * (hw - 0.014)), vmul(Ut, sy * (hh - 0.002)), (0.0004, 0, 0))
        card(t, tc, Rt, Ut, 0.018, 0.009, 'tape', tilt=sx * sy * 0.6)


# ---- 蛋的計時器：書桌右後角（六法 z 到 0.215、衣櫃從 0.34；大三起的單字卡在 x −2.66 以後）。下半白色、上半黃色的轉盤＋刻度，接縫一圈、正面一個小三角指標
TX, TZ = -2.745, 0.276
g, t = item('timer', 'WZ_ITEM_TIMER')
EGG = [(0.0, 0.0), (0.016, 0.001), (0.024, 0.005), (0.0285, 0.013), (0.0298, 0.022), (0.0296, 0.031), (0.0288, 0.0355)]   # 下半（白）
TOP = [(0.0288, 0.0362), (0.0276, 0.042), (0.0258, 0.049), (0.0224, 0.057), (0.0172, 0.064), (0.0098, 0.0695), (0.0, 0.0715)]   # 上半（轉盤）
f0 = len(t.bm.faces); lathe(t, TX, Y, TZ, EGG, 24, lambda i, a: (0, 0)); solid_uv(t, 'c_eggwhite', f0)
f0 = len(t.bm.faces); lathe(t, TX, Y, TZ, [(0.0288, 0.0355), (0.0291, 0.0358), (0.0291, 0.0362), (0.0288, 0.0362)], 24, lambda i, a: (0, 0)); solid_uv(t, 'c_seam', f0)
du0, dv0, du1, dv1 = uvr('dial')
def dial_uv(i, a):
    h = TOP[i][1] - TOP[0][1]; hb = 0.013   # 最下面 13 mm 是刻度帶（下緣是刻度、上緣是數字），上面是黃色
    v = dv0 + (dv1 - dv0) * (0.06 + 0.47 * h / hb) if h <= hb + 1e-6 else dv0 + (dv1 - dv0) * 0.85
    return (du0 + (du1 - du0) * a, v)
lathe(t, TX, Y, TZ, TOP, 24, dial_uv)   # 0 分在正面（+x）的指標上方，三分四十秒的刮痕在旁邊
f0 = len(t.bm.faces); px = TX + 0.0294; t.bm.faces.new([t.bm.verts.new(g2b(*p)) for p in ((px, Y + 0.0345, TZ - 0.004), (px, Y + 0.0345, TZ + 0.004), (px + 0.0006, Y + 0.0285, TZ))]); solid_uv(t, 'c_pointer', f0)
t.finish(g, smooth=True)

# ---- 手寫的卡片：攤開的對摺卡（A6），右頁平放、左頁翹起來 30°；放在書桌前緣（大三起那一疊紙的上面；紙最厚 3 mm：卡片底在桌面上 3.5 mm，大一、大二看不出來浮著）
g, t = item('card', 'WZ_CARD')
CY = Y + 0.0035; ccz, crot = -0.563, -0.10
FOLD_X, LW, LH = -2.448, 0.104, 0.146                       # 摺線在 x −2.448（沿 z），每一頁寬 10.4 cm（沿 x）、高 14.6 cm（沿 z）
def place(p):   # 卡片自己的座標（摺線上的中點為原點）→ 世界座標，整張轉 crot
    dxz = roty((p[0], 0, p[2]), crot); return (FOLD_X + dxz[0] + 0.0, p[1], ccz + dxz[2])
flat_ = [(0.0, CY, LH / 2), (0.0, CY, -LH / 2), (LW, CY, -LH / 2), (LW, CY, LH / 2)]   # 右頁（平放，朝上的是裡面）
ang = math.radians(32); up_ = [(0.0, CY, LH / 2), (0.0, CY, -LH / 2), (-LW * math.cos(ang), CY + LW * math.sin(ang), -LH / 2), (-LW * math.cos(ang), CY + LW * math.sin(ang), LH / 2)]   # 左頁（翹起來）
u0, v0, u1, v1 = uvr('card_in_b'); t.uvface([place(p) for p in (flat_[1], flat_[2], flat_[3], flat_[0])], [(u0, v1), (u1, v1), (u1, v0), (u0, v0)])   # 裡面右頁：字朝上、從房間（+x）看是正的
t.uvface([place((p[0], p[1] - 0.0004, p[2])) for p in (flat_[0], flat_[3], flat_[2], flat_[1])], [(u0, v0), (u1, v0), (u1, v1), (u0, v1)])   # 背面（朝下，看不到；兩面材質）
u0, v0, u1, v1 = uvr('card_in_a'); t.uvface([place(p) for p in (up_[1], up_[0], up_[3], up_[2])], [(u1, v1), (u1, v0), (u0, v0), (u0, v1)])   # 裡面左頁（朝房間）
u0, v0, u1, v1 = uvr('card_out')
t.uvface([place(vadd(p, (-0.0004 * math.sin(ang), -0.0004 * math.cos(ang), 0))) for p in (up_[0], up_[1], up_[2], up_[3])], [(u0, v0), (u1, v0), (u1, v1), (u0, v1)])   # 封面（朝牆）
t.finish(g)

# ---- 膠裝的空白筆記本：層架頂上平放（A5，長邊沿 z），書背朝房間（+x）
g, t = item('notebook', 'WZ_ITEM_NOTEBOOK')
nx0, nx1, nz0, nz1, ny0, ny1 = -2.858, -2.71, -0.398, -0.188, SHELF, SHELF + 0.013
P = lambda x, y, z: (x, y, z)
t.tquad([P(nx0, ny1, nz1), P(nx1, ny1, nz1), P(nx1, ny1, nz0), P(nx0, ny1, nz0)], 'nb_cover')   # 封面（朝上）
t.tquad([P(nx1, ny0, nz1), P(nx1, ny0, nz0), P(nx1, ny1, nz0), P(nx1, ny1, nz1)], 'nb_spine')   # 書背（朝房間）
t.tquad([P(nx0, ny0, nz0), P(nx0, ny0, nz1), P(nx0, ny1, nz1), P(nx0, ny1, nz0)], 'pages')      # 書口（朝牆）
t.tquad([P(nx0, ny0, nz1), P(nx1, ny0, nz1), P(nx1, ny1, nz1), P(nx0, ny1, nz1)], 'pages')
t.tquad([P(nx1, ny0, nz0), P(nx0, ny0, nz0), P(nx0, ny1, nz0), P(nx1, ny1, nz0)], 'pages')
t.finish(g)

# ---- 一小罐茶：層架頂上、筆記本左邊（和紙標籤、金色的蓋子）
g, t = item('tea', 'WZ_ITEM_TEA', props={'hide_flag': 'WZ_TEA_GIVEN'})
KX, KZ, KR = -2.792, -0.462, 0.0275
lu0, lv0, lu1, lv1 = uvr('tea_label')
f0 = len(t.bm.faces); lathe(t, KX, SHELF, KZ, [(0.0, 0.0), (KR - 0.002, 0.0), (KR, 0.002), (KR, 0.012)], 20, lambda i, a: (0, 0)); solid_uv(t, 'c_tin', f0)
lathe(t, KX, SHELF, KZ, [(KR, 0.012), (KR, 0.060)], 20, lambda i, a: (lu0 + (lu1 - lu0) * a, lv0 if i == 0 else lv1))
f0 = len(t.bm.faces); lathe(t, KX, SHELF, KZ, [(KR, 0.060), (KR + 0.0012, 0.0605), (KR + 0.0012, 0.079), (KR - 0.001, 0.0805), (0.0, 0.0805)], 20, lambda i, a: (0, 0)); solid_uv(t, 'c_tinlid', f0)
t.finish(g, smooth=True)

# ---- 讀書會白板的照片：層架側板（z 0.19）和衣櫃（z 0.34）中間那一條牆，4×6 吋相紙橫式（15.2×10.2 太寬：裁小一點的 12.6×8.9），紙膠帶貼上面兩個角
g, t = item('board', 'WZ_YE_DONE', mesh_name='WALL_left_wz_board', props={})
taped_wall(t, 0.3275, 0.2015, 1.152, 1.241, 'photo', tilt=0.025)
ob = t.finish(g); ob['dir'] = [1, 0, 0]

# ---- 子晴成發的藍色海報（A2 直式 42×59.4）：上舖旁邊的牆（床的上方、枕頭往床尾一點），四個角貼紙膠帶
g, t = item('poster', 'WZ_POSTER_ITEM', mesh_name='WALL_left_wz_poster')
taped_wall(t, 0.16, -0.26, 2.04, 2.634, 'poster', tilt=-0.012, corners=4)
ob = t.finish(g); ob['dir'] = [1, 0, 0]

# ---------------- 匯出 ----------------
MAT.use_backface_culling = False   # 紙兩面都看得到
tris = {}
pos = {}
for ob in bpy.data.objects:
    if ob.type != 'MESH': continue
    p = ob.parent
    while p is not None and not p.name.startswith('ITEM_'): p = p.parent
    if p is None: continue
    tris[p.name] = tris.get(p.name, 0) + sum(len(q.vertices) - 2 for q in ob.data.polygons)
    ws = [ob.matrix_world @ v.co for v in ob.data.vertices]; gs = [(w.x, w.z, -w.y) for w in ws]
    mn = [min(g_[i] for g_ in gs) for i in range(3)]; mx = [max(g_[i] for g_ in gs) for i in range(3)]
    pos[p.name] = {'min': [round(v, 3) for v in mn], 'max': [round(v, 3) for v in mx], 'center': [round((a_ + b_) / 2, 3) for a_, b_ in zip(mn, mx)]}
print('dorm_wz tris', tris, 'total', sum(tris.values()))
print('dorm_wz pos', json.dumps(pos))
st = L.export(OUT, gpu_instances=False)
L.write_json(OUT.replace('.glb', '.json'), {
    'glb': os.path.relpath(OUT, L.ROOT), 'zone': 'dorm（四人房 dorm_room4，祐廷 L2；大一 203～大四 409 同一組家具，四個年級都放得下）', 'layout': 'loft4-v2',
    'tris': tris, 'tris_total': sum(tris.values()), 'bytes': st['bytes'], 'meshes': st['objects'], 'pos': dict(sorted(pos.items())),
    'nodes': {
        'ITEM_wz_timer': 'room.timer 蛋的計時器（WZ_ITEM_TIMER）：書桌右後角', 'ITEM_wz_card': 'room.card 手寫的卡片（WZ_CARD）：書桌前緣，攤開',
        'ITEM_wz_notebook': 'room.notebook 膠裝的空白筆記本（WZ_ITEM_NOTEBOOK）：層架頂，書背朝房間', 'ITEM_wz_tea': 'room.tea 一小罐茶（WZ_ITEM_TEA，WZ_TEA_GIVEN 以後收起來）：層架頂',
        'ITEM_wz_board': 'room.board 讀書會白板的照片（WZ_YE_DONE）：層架和衣櫃中間的牆（網格 WALL_left_wz_board，dir [1,0,0]）',
        'ITEM_wz_poster': 'room.poster 子晴成發的藍色海報（WZ_POSTER_ITEM）：上舖旁邊的牆（網格 WALL_left_wz_poster，dir [1,0,0]）'},
    'show': '照 src/jobs3d.js S.room 的條件（JOBS.roomKeys）；搬家、收拾的那幾天（ROOM_Y2/Y3/Y4_MOVING、PACKED_Y4）全部收起來',
    'texture': 'tools/blender/env_second/textures/gen/dorm_wz_print.png（本作，PIL 畫的；海報的字是虛構的「成果發表會」）',
    'materials': ['wz6_print']})
