"""宿舍 203 祐廷的書桌：「看東西」選單上的每一件，房間裡都看得到（DORM-DESK-ITEMS-3D-1103；使用者 11-03「不應該還有這些選項? 不然也是在書桌上?? 書桌牆面可以貼東西? 擺書」）→ GLB。
  /opt/blenv/bin/python tools/blender/env_second/dorm_desk_items.py [-- --out assets/models/env/second_ai/dorm_desk_items.glb]

每一件一個節點 ITEM_desk_<key>，key＝src/story3d.js 的 S.roomItemKeys(G)（和選單 S.roomItemList 同一份條件，不另外寫一套）：
  civil        書架上的舊《民法》      ：大一 203 書架上那本（dorm_room4 Y203_YUTING 的咖啡色方塊）貼上書背「民法」
  econ         經濟學原理              ：同一層的白底紅帶那本，貼書背「經濟學原理」
  notebook     寫滿的筆記本            ：203 書桌左前那本攤開的筆記本，兩頁寫滿（一半是你的字、一半是她的——兩種筆跡）
  ferris       摩天輪的票根（夾在桌墊下）：透明桌墊＋壓在下面的票根（書桌右前角）
  phone        手機相簿的一張照片      ：書桌右前方面朝上的手機，螢幕是河堤邊的腳踏車
  highlighters 桌上的三色螢光筆        ：三支螢光筆（黃、粉紅、藍），綠的那支（dorm_y2_items ITEM_green）在旁邊
  board        大一的軟木板（固定）    ：書桌前、層架左邊的牆（＝大二 dorm_y2_items 的軟木板同一個位置；大二起換成那一塊）
  kai_sheet    阿凱的泡麵評鑑表        ：釘在軟木板上
  film1／film3 電影票根／三張連號的票根 ：釘在軟木板上（同一個存檔只會有一種）
  trip_sea／trip_oldtown／trip_stars 旅行的照片：釘在軟木板上（照 KX_TRIP.Y1S2）
  anniv        她的週年卡片            ：釘在軟木板上
  （經濟系的系外套 jacket：dorm_room4 的 JACKET_ 已經有，照 ECON_JACKET 開關，這裡不做）
位置（遊戲 dorm 區域，四人房 dorm_room4.glb loft4-v2 的新床桌組，祐廷＝L2＝左牆靠門那組；座標直接照 11-02 以後的新床桌組寫，不用 dorm_loft_remap）：
  左牆室內面 x −2.0；書桌 x −2.0～−1.38、z −0.785～0.49、桌面 0.76；層架 z −0.335～0.365、下層板 1.0、頂 1.42。
  dorm_room4／dorm_y1～y3_items／dorm_wz_items 每一件的範圍都量過（scratchpad desk/aabb.py），這裡全部避開。
每一件一個網格、整組兩個材質（desk_print 貼圖集；desk_pad 透明桌墊）。印刷品、手寫都是本作程式畫的（PIL）；沒有店名、商標、真實片名（D77）。"""
import json, math, os, sys, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/dorm_desk_items.glb'))
GEN = os.path.join(HERE, 'textures', 'gen'); os.makedirs(GEN, exist_ok=True); ATLAS = os.path.join(GEN, 'dorm_desk_print.png')
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'

# ---------------- 貼圖集（1024×1024）----------------
AW, AH = 2048, 1024
SOLID = {'c_cork': (178, 134, 88), 'c_frame': (122, 86, 56), 'c_pin_r': (200, 52, 48), 'c_pin_b': (52, 96, 190), 'c_pin_y': (226, 190, 40),
         'c_hl_y': (238, 226, 60), 'c_hl_p': (236, 108, 160), 'c_hl_b': (88, 170, 226), 'c_cap': (40, 40, 44), 'c_phone': (28, 28, 32), 'c_white': (244, 242, 236)}
SIZES = [('spine_civil', 64, 300), ('spine_econ', 96, 420), ('nb_l', 200, 240), ('nb_r', 200, 240), ('ferris', 120, 280), ('phone', 120, 250),
         ('kai', 300, 400), ('film1', 260, 110), ('film3', 330, 110), ('trip_sea', 260, 180), ('trip_oldtown', 260, 180), ('trip_stars', 260, 180),
         ('anniv', 180, 250), ('cork', 256, 256)] + [(k, 16, 16) for k in SOLID]
R = {}
cx, cy, rowh = 4, 4, 0
for nm, w, h in SIZES:
    if cx + w + 4 > AW: cx, cy, rowh = 4, cy + rowh + 6, 0
    R[nm] = (cx, cy, cx + w, cy + h); cx += w + 6; rowh = max(rowh, h)
assert cy + rowh <= AH, ('貼圖集放不下', cy + rowh)


def draw_atlas():
    im = Image.new('RGB', (AW, AH), (200, 200, 200)); d = ImageDraw.Draw(im)
    F = lambda s: ImageFont.truetype(FONT, s)
    def fill(k, c): d.rectangle(R[k], fill=c)
    def scribble(bx, col, rows, w=2, amp=3, seed=0, slant=0.0):
        r = random.Random(seed); x0, y0, x1, y1 = bx
        for k in range(rows):
            y = y0 + (k + 0.5) * (y1 - y0) / rows; xe = x1 - r.uniform(0, (x1 - x0) * 0.25); pts = []; x = x0 + r.uniform(0, 6)
            while x < xe:
                pts.append((x, y + amp * math.sin(x * r.uniform(0.45, 0.75)) + r.uniform(-0.8, 0.8) + slant * (x - x0))); x += 2
            if len(pts) > 1: d.line(pts, fill=col, width=w)
    for k, c in SOLID.items(): fill(k, c)
    # 書背：舊《民法》（褪色咖啡色、燙金字直排）
    x0, y0, x1, y1 = R['spine_civil']; d.rectangle(R['spine_civil'], fill=(112, 82, 56))
    for i, ch in enumerate('民法'): d.text(((x0 + x1) / 2, y0 + 70 + i * 62), ch, font=F(44), fill=(222, 196, 140), anchor='mm')
    d.rectangle((x0 + 6, y1 - 46, x1 - 6, y1 - 40), fill=(196, 168, 110))
    # 書背：經濟學原理（白底、紅帶、黑字）
    x0, y0, x1, y1 = R['spine_econ']; d.rectangle(R['spine_econ'], fill=(236, 230, 214)); d.rectangle((x0, y0 + 300, x1, y0 + 336), fill=(176, 52, 42))
    for i, ch in enumerate('經濟學原理'): d.text(((x0 + x1) / 2, y0 + 36 + i * 52), ch, font=F(40), fill=(34, 32, 30), anchor='mm')
    d.text(((x0 + x1) / 2, y1 - 40), '第八版', font=F(20), fill=(60, 56, 50), anchor='mm')
    # 筆記本：左頁祐廷的字（藍、歪）、右頁她的字（黑、工整）＋螢光筆
    for k, col, seed, neat in (('nb_l', (40, 70, 150), 11, False), ('nb_r', (30, 30, 34), 23, True)):
        x0, y0, x1, y1 = R[k]; d.rectangle(R[k], fill=(246, 244, 236))
        for j in range(12): d.line((x0 + 4, y0 + 14 + j * 19, x1 - 4, y0 + 14 + j * 19), fill=(196, 208, 226), width=1)
        scribble((x0 + 12, y0 + 6, x1 - 10, y1 - 10), col, 12, w=2, amp=2.0 if neat else 3.4, seed=seed, slant=0.0 if neat else 0.03)
        if neat: d.rectangle((x0 + 12, y0 + 64, x1 - 60, y0 + 74), fill=(250, 236, 120))
    # 摩天輪的票根（直式）：淺藍、摩天輪的線圖、日期一行（數字不寫實際日期）
    x0, y0, x1, y1 = R['ferris']; d.rectangle(R['ferris'], fill=(214, 232, 244)); cxx, cyy, rr = (x0 + x1) / 2, y0 + 96, 40
    d.ellipse((cxx - rr, cyy - rr, cxx + rr, cyy + rr), outline=(60, 90, 150), width=3)
    for a in range(0, 360, 30): d.line((cxx, cyy, cxx + rr * math.cos(math.radians(a)), cyy + rr * math.sin(math.radians(a))), fill=(60, 90, 150), width=1)
    d.line((cxx, cyy, cxx - 28, cyy + 70), fill=(60, 90, 150), width=3); d.line((cxx, cyy, cxx + 28, cyy + 70), fill=(60, 90, 150), width=3)
    d.text((cxx, y0 + 196), '摩天輪', font=F(24), fill=(40, 60, 110), anchor='mm'); d.text((cxx, y0 + 230), '成人 一張', font=F(16), fill=(60, 70, 90), anchor='mm')
    for yy in range(y0 + 250, y1 - 4, 8): d.line((x0 + 6, yy, x0 + 12, yy), fill=(120, 140, 170))   # 撕線
    # 手機螢幕：河堤邊的腳踏車（傍晚）
    x0, y0, x1, y1 = R['phone']; d.rectangle(R['phone'], fill=(18, 18, 22)); sx0, sy0, sx1, sy1 = x0 + 6, y0 + 10, x1 - 6, y1 - 10
    for yy in range(sy0, sy1):
        t = (yy - sy0) / (sy1 - sy0); d.line((sx0, yy, sx1, yy), fill=(int(240 - 80 * t), int(176 - 40 * t), int(120 + 40 * t)) if t < 0.55 else (int(88 + 20 * t), int(120 + 10 * t), int(96)))
    d.rectangle((sx0, sy0 + int((sy1 - sy0) * 0.52), sx1, sy0 + int((sy1 - sy0) * 0.6)), fill=(90, 120, 150))   # 河
    for k in range(3):
        bx = sx0 + 18 + k * 30; by = sy0 + int((sy1 - sy0) * 0.78)
        for ox in (0, 18): d.ellipse((bx + ox - 7, by - 7, bx + ox + 7, by + 7), outline=(30, 30, 34), width=2)
        d.line((bx, by, bx + 9, by - 10, bx + 18, by), fill=(30, 30, 34), width=2)
    # 阿凱的泡麵評鑑表（A5 橫線紙、手寫標題、表格、星星）
    x0, y0, x1, y1 = R['kai']; d.rectangle(R['kai'], fill=(248, 246, 238))
    d.text((x0 + 150, y0 + 34), '泡麵評鑑表', font=F(34), fill=(30, 30, 34), anchor='mm'); d.text((x0 + 150, y0 + 66), '評審：凱', font=F(18), fill=(70, 70, 76), anchor='mm')
    rows = ['紅燒牛肉', '蔥燒排骨', '沙茶羊肉', '鮮蝦魚板', '麻辣鍋', '味噌拉麵']; r = random.Random(7)
    for i, nm in enumerate(rows):
        yy = y0 + 104 + i * 46; d.line((x0 + 14, yy + 22, x1 - 14, yy + 22), fill=(170, 170, 176), width=1)
        d.text((x0 + 20, yy), nm, font=F(22), fill=(40, 40, 46)); n = r.randint(2, 5)
        for s in range(5):
            cxs = x0 + 178 + s * 22; c = (226, 168, 30) if s < n else (200, 200, 204)
            pts = [(cxs + 9 * math.cos(math.radians(-90 + 72 * q)) * (1 if q % 2 == 0 else 1), yy + 10 + 9 * math.sin(math.radians(-90 + 72 * q))) for q in range(0, 10, 2)]
            d.polygon([pts[0], pts[2], pts[4], pts[1], pts[3]], fill=c)
    # 電影票根（一張／三張連號）：二輪戲院的票（不寫戲院名、片名）
    for k, n in (('film1', 1), ('film3', 3)):
        x0, y0, x1, y1 = R[k]; w = (x1 - x0) / n
        for i in range(n):
            a = x0 + i * w; d.rectangle((a, y0, a + w - (0 if i == n - 1 else 1), y1), fill=(238, 222, 184))
            d.text((a + w / 2, y0 + 28), '電影票', font=F(22 if n == 1 else 16), fill=(130, 50, 40), anchor='mm')
            d.text((a + w / 2, y0 + 62), '第 7 排　%d 號' % (11 + i), font=F(16 if n == 1 else 12), fill=(70, 50, 40), anchor='mm')
            d.text((a + w / 2, y0 + 88), '一票兩片', font=F(14 if n == 1 else 11), fill=(90, 70, 60), anchor='mm')
            if i < n - 1:
                for yy in range(y0, y1, 8): d.line((a + w - 1, yy, a + w - 1, yy + 4), fill=(160, 140, 110))
    # 旅行的照片（三種，照 KX_TRIP.Y1S2）：白邊相片
    def photo(k, sky, ground, extra):
        x0, y0, x1, y1 = R[k]; d.rectangle(R[k], fill=(248, 248, 246)); px0, py0, px1, py1 = x0 + 10, y0 + 10, x1 - 10, y1 - 26
        mid = py0 + int((py1 - py0) * 0.55)
        for yy in range(py0, mid): t = (yy - py0) / max(1, mid - py0); d.line((px0, yy, px1, yy), fill=tuple(int(sky[0][i] + (sky[1][i] - sky[0][i]) * t) for i in range(3)))
        d.rectangle((px0, mid, px1, py1), fill=ground); extra(px0, py0, px1, py1, mid)
    def sea(px0, py0, px1, py1, mid):
        for j in range(5): d.line((px0, mid + 8 + j * 9, px1, mid + 6 + j * 9), fill=(236, 244, 248), width=2)
        d.rectangle((px0 + 120, mid - 46, px0 + 132, mid + 18), fill=(60, 50, 50)); d.ellipse((px0 + 118, mid - 62, px0 + 134, mid - 46), fill=(40, 34, 32))
    def oldtown(px0, py0, px1, py1, mid):
        for j in range(6): d.rectangle((px0 + 6 + j * 40, py0 + 10, px0 + 36 + j * 40, py0 + 40 + (j % 2) * 14), fill=(196, 170, 120), outline=(150, 120, 80))
        d.rectangle((px0 + 110, mid - 50, px0 + 124, mid + 30), fill=(70, 60, 80)); d.ellipse((px0 + 108, mid - 66, px0 + 126, mid - 50), fill=(40, 34, 32))
    def stars(px0, py0, px1, py1, mid):
        d.rectangle((px0, py0, px1, py1), fill=(10, 12, 20)); d.ellipse((px1 - 30, py0 + 14, px1 - 25, py0 + 19), fill=(246, 246, 236))
    photo('trip_sea', ((150, 196, 226), (206, 228, 240)), (70, 130, 170), sea)
    photo('trip_oldtown', ((200, 214, 224), (228, 230, 228)), (150, 136, 120), oldtown)
    photo('trip_stars', ((10, 12, 20), (12, 14, 24)), (10, 12, 20), stars)
    # 週年卡片（封面：手畫的摩天輪＋「1」）
    x0, y0, x1, y1 = R['anniv']; d.rectangle(R['anniv'], fill=(250, 238, 230)); d.rounded_rectangle((x0 + 10, y0 + 10, x1 - 10, y1 - 10), radius=12, outline=(214, 120, 120), width=3)
    cxx, cyy = (x0 + x1) / 2, y0 + 100; d.ellipse((cxx - 44, cyy - 44, cxx + 44, cyy + 44), outline=(200, 90, 100), width=3)
    for a in range(0, 360, 45): d.line((cxx, cyy, cxx + 44 * math.cos(math.radians(a)), cyy + 44 * math.sin(math.radians(a))), fill=(200, 90, 100), width=1)
    d.text((cxx, y0 + 190), '1', font=F(48), fill=(190, 80, 90), anchor='mm')
    # 軟木（顆粒）
    x0, y0, x1, y1 = R['cork']; r = random.Random(3)
    for yy in range(y0, y1):
        for xx in range(x0, x1, 2):
            v = r.randint(-26, 22); d.line((xx, yy, xx + 1, yy), fill=(178 + v, 134 + v, 88 + v // 2))
    im = im.filter(ImageFilter.SMOOTH_MORE) if False else im
    im.save(ATLAS); return im


draw_atlas()


def uvr(key):
    x0, y0, x1, y1 = R[key]; return (x0 / AW, 1 - y1 / AH, x1 / AW, 1 - y0 / AH)


class TMesh(Mesh):
    def __init__(self, name, mat):
        super().__init__(name, mat); self.uv = self.bm.loops.layers.uv.new('UVMap')

    def tquad(self, pts, key, rot=0):
        u0, v0, u1, v1 = uvr(key); f = self.bm.faces.new([self.bm.verts.new(g2b(*p)) for p in pts])
        uvs = [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]; uvs = uvs[rot:] + uvs[:rot]
        for lp, uv in zip(f.loops, uvs): lp[self.uv].uv = uv
        return f

    def solid_box(self, key, x0, x1, y0, y1, z0, z1):
        f0 = len(self.bm.faces); self.box(x0, x1, y0, y1, z0, z1); self.bm.faces.ensure_lookup_table()
        u0, v0, u1, v1 = uvr(key); c = ((u0 + u1) / 2, (v0 + v1) / 2)
        for i in range(f0, len(self.bm.faces)):
            for lp in self.bm.faces[i].loops: lp[self.uv].uv = c

    def solid_cyl(self, key, a, b, r, seg=10):
        f0 = len(self.bm.faces); self.cyl(a, b, r, seg=seg); self.bm.faces.ensure_lookup_table()
        u0, v0, u1, v1 = uvr(key); c = ((u0 + u1) / 2, (v0 + v1) / 2)
        for i in range(f0, len(self.bm.faces)):
            for lp in self.bm.faces[i].loops: lp[self.uv].uv = c

    def finish(self, parent=None, props=None, uv=False, smooth=False, merge=True):
        return super().finish(parent, props, uv=False, smooth=smooth, merge=merge)


B.reset(texres=512)
def print_mat(name):
    m = L.flat(name, '#ffffff', rough=0.7); nt = m.node_tree; tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS)
    nt.links.new(tx.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color']); return m
MAT = print_mat('desk_print')
PAD = L.flat('desk_pad_glass', '#e8eef0', rough=0.12, alpha=0.22)   # 透明 PVC 桌墊（名字有 glass：遊戲當透明處理）
root = B.group('dorm_desk_items', props={'kind': 'dorm_desk_items'})
def item(key, props=None):
    g = B.group('ITEM_desk_' + key, root, dict({'kind': 'room_item', 'key': key}, **(props or {})))
    return g, TMesh('desk_' + key, MAT)


Y = 0.76                       # 桌面
WALLX = -2.0                   # 左牆室內面
# 從房間看左牆：法線 +x；圖的右邊＝−z、上面＝+y
def wall_quad(t, x, zl, zr, y0, y1, key):   # zl＝從房間看的左邊緣（z 大）
    t.tquad([(x, y0, zl), (x, y0, zr), (x, y1, zr), (x, y1, zl)], key)
def flat_quad(t, x0, x1, z0, z1, y, key, rot=0):   # 平放在桌上（從走道看：圖的上面朝牆＝−x）
    t.tquad([(x1, y, z1), (x1, y, z0), (x0, y, z0), (x0, y, z1)], key, rot=rot)
def pin(t, x, z, y, col):
    t.solid_cyl(col, (x, y, z), (x + 0.012, y, z), 0.0055, seg=8)

# ---- 書背（大一 203：dorm_room4 Y203_YUTING 那兩本的朝房間那一面）
g, t = item('civil', {'room': '203'}); wall_quad(t, WALLX + 0.23 + 0.0015, -0.197, -0.233, 1.04, 1.25, 'spine_civil'); t.finish(g)
g, t = item('econ', {'room': '203'}); wall_quad(t, WALLX + 0.25 + 0.0015, -0.242, -0.303, 1.035, 1.30, 'spine_econ'); t.finish(g)
# ---- 寫滿的筆記本（203 書桌左前那本攤開的筆記本：x −1.65～−1.48、z −0.765～−0.585、頁面 0.77）
g, t = item('notebook', {'room': '203'}); flat_quad(t, -1.646, -1.484, -0.676, -0.590, 0.7708, 'nb_r'); flat_quad(t, -1.646, -1.484, -0.760, -0.676, 0.7708, 'nb_l'); t.finish(g)
# ---- 透明桌墊＋壓在下面的摩天輪票根（右前角）
g, t = item('ferris', {'room': '203'})
flat_quad(t, -1.50, -1.445, 0.34, 0.47, 0.7604, 'ferris', rot=1)
t.finish(g)
pm = Mesh('desk_pad_glass', PAD); pm.quad([(-1.985, 0.7616, -0.775), (-1.39, 0.7616, -0.775), (-1.39, 0.7616, 0.48), (-1.985, 0.7616, 0.48)]); pm.finish(g, uv=False)
# ---- 手機（面朝上，螢幕是河堤的腳踏車）
g, t = item('phone')
t.solid_box('c_phone', -1.628, -1.562, 0.7616, 0.7696, 0.175, 0.318); flat_quad(t, -1.624, -1.566, 0.180, 0.313, 0.7700, 'phone', rot=1); t.finish(g)
# ---- 三色螢光筆（平放，稍微散開；綠的那支在左邊 dorm_y2_items）
g, t = item('highlighters')
for i, (col, dx, a) in enumerate((('c_hl_y', -1.515, 0.10), ('c_hl_p', -1.485, -0.06), ('c_hl_b', -1.455, 0.04))):
    za, zb = 0.185, 0.305; xa, xb = dx - math.sin(a) * 0.06, dx + math.sin(a) * 0.06
    t.solid_cyl(col, (xa, Y + 0.0116, za), (xb, Y + 0.0116, zb), 0.0085, seg=10)
    t.solid_cyl('c_cap', (xb, Y + 0.0116, zb), (xb + math.sin(a) * 0.022, Y + 0.0116, zb + 0.022), 0.0092, seg=10)
t.finish(g)
# ---- 大一的小軟木板＋貼在牆上的東西：層架右側板（z 0.365）和衣櫃（z 0.645）中間那一條牆（書桌前、層架左邊那面牆整面是法服社的傳單 0.42×0.6，不能蓋）。
#      這一條牆 y 1.15～1.26 是溫州街讀書會白板照片（dorm_wz_items ITEM_wz_board）的位置：避開——軟木板在上面（y 1.285～1.555），照片、票根貼在下面
g, t = item('board', {'room': '203'})
t.solid_box('c_frame', WALLX, WALLX + 0.02, 1.285, 1.555, 0.385, 0.630)
wall_quad(t, WALLX + 0.0215, 0.615, 0.400, 1.300, 1.540, 'cork')
ob = t.finish(g); ob.name = 'WALL_left_desk_board'; ob['dir'] = [1, 0, 0]
PX = WALLX + 0.0225   # 紙釘在軟木上
TX_ = WALLX + 0.0015  # 紙膠帶貼在牆上
def pinned(key, zl, zr, y0, y1, col='c_pin_r', atlas=None, on_board=True):
    x = PX if on_board else TX_
    g, t = item(key, dict({'room': '203'}, **({'on': 'board'} if on_board else {}))); wall_quad(t, x, zl, zr, y0, y1, atlas or key)
    if on_board: pin(t, x, (zl + zr) / 2, y1 - 0.004, col)   # 圖釘在紙的上緣（不壓到標題）
    else:
        for zz in (zl - 0.012, zr + 0.012): t.solid_box('c_white', x, x + 0.0006, y1 - 0.009, y1 + 0.006, min(zz, zz) - 0.012, zz + 0.012)   # 紙膠帶
    ob = t.finish(g); ob.name = 'WALL_left_desk_' + key; ob['dir'] = [1, 0, 0]
pinned('kai_sheet', 0.598, 0.417, 1.308, 1.528, 'c_pin_b', atlas='kai')
pinned('film1', 0.487, 0.387, 1.020, 1.062, on_board=False)
pinned('film3', 0.497, 0.372, 1.020, 1.062, on_board=False)
for k in ('trip_sea', 'trip_oldtown', 'trip_stars'): pinned(k, 0.630, 0.505, 0.975, 1.065, on_board=False)
# ---- 她的週年卡片：立在層架頂上（溫州街的筆記本 z −0.22～−0.01、大二的泡麵 z 0.14 以後的中間），大一 203
g, t = item('anniv', {'room': '203'})
a = 0.32; cxx, czz = -1.86, 0.065; hw = 0.05; dx, dz = math.sin(a) * 0.018, math.cos(a) * 0.0
t.tquad([(cxx + 0.012, 1.4205, czz + hw), (cxx + 0.012, 1.4205, czz - hw), (cxx - 0.018, 1.556, czz - hw), (cxx - 0.018, 1.556, czz + hw)], 'anniv')   # 封面（稍微往後靠）
t.tquad([(cxx - 0.03, 1.4205, czz - hw), (cxx - 0.03, 1.4205, czz + hw), (cxx - 0.02, 1.556, czz + hw), (cxx - 0.02, 1.556, czz - hw)], 'c_white')   # 背面那一頁（攤開一點撐著）
t.finish(g)

# ---------------- 匯出 ----------------
MAT.use_backface_culling = False
tris, pos = {}, {}
for ob in bpy.data.objects:
    if ob.type != 'MESH': continue
    p = ob.parent
    while p is not None and not p.name.startswith('ITEM_'): p = p.parent
    if p is None: continue
    tris[p.name] = tris.get(p.name, 0) + sum(len(q.vertices) - 2 for q in ob.data.polygons)
    gs = [((ob.matrix_world @ v.co).x, (ob.matrix_world @ v.co).z, -(ob.matrix_world @ v.co).y) for v in ob.data.vertices]
    mn = [min(g_[i] for g_ in gs) for i in range(3)]; mx = [max(g_[i] for g_ in gs) for i in range(3)]
    pos[p.name] = {'min': [round(v, 3) for v in mn], 'max': [round(v, 3) for v in mx]}
print('dorm_desk tris', tris, 'total', sum(tris.values()))
st = L.export(OUT, gpu_instances=False)
L.write_json(OUT.replace('.glb', '.json'), {
    'glb': os.path.relpath(OUT, L.ROOT), 'zone': 'dorm（四人房 dorm_room4 loft4-v2，祐廷 L2）', 'tris': tris, 'tris_total': sum(tris.values()), 'bytes': st['bytes'], 'pos': dict(sorted(pos.items())),
    'show': 'ITEM_desk_<key>：key 在 STORY.roomItemKeys(G) 裡才顯示；room=203 的只在大一 203（dormSetKey 203）；on=board 的要軟木板也顯示；搬家、收拾那幾天全部收起來。牆上的網格叫 WALL_left_desk_*（跟左牆一起淡出，dir [1,0,0]）',
    'texture': 'tools/blender/env_second/textures/gen/dorm_desk_print.png（本作，PIL 畫的；沒有店名、商標、真實片名）'})
print('done', OUT, st)
