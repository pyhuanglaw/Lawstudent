"""第二個房間（主線 3，大二上開學前一天搬進宿舍 112 號房；SCN-V3-01／SYS-06）：拆箱以後房間裡多出來的東西 → GLB。
LAWWW2-B 2026-10-16（D89：美術歸 LAWWW2；LAWWW-B 整合）。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/dorm_y2_items.py [-- --out assets/models/env/second_ai/dorm_y2_items.glb]

故事（AA_12 主線 3、story3d.js 的 S.roomY2Items）：新房間、四個紙箱，物件一件一件拿出來，**只有大一經歷過的才有**。
所以每一件是一個節點（ITEM_<id>，id 和 story3d.js S.ROOM_Y2_TEXT 的 key 一樣），遊戲照同一套條件決定顯示哪幾個：
  ITEM_film     《東京物語》電影票根（釘在軟木板上；票根上沒有字）       ITEM_pick    吉他彈片（書桌上，筆電旁）
  ITEM_civ      只讀了三分之一的民總課本（書桌後面，夾著書籤）           ITEM_report  周老師寫評語的報告影本（釘在軟木板上，紅筆）
  ITEM_noodle   阿凱留下的泡麵＋便條（書架最上層）                       ITEM_duty    法服的值班表（釘在軟木板上，單週週六那一格塗黃）
  ITEM_green    綠色螢光筆（攤開的筆記本上）                             ITEM_sticky  便利貼（釘在軟木板上，藍筆兩行；沒有字）
  ITEM_y1_ferris 大一的摩天輪票根（軟木板）                               ITEM_y1_album 大一的河堤相簿（書桌左邊的書堆上）
  黃金葛另外一個檔案（prop_pothos.glb，POTHOS_S1～S4）。
固定會有的：WALL_left_Y2_BOARD（祐廷書桌前的牆上的軟木板；AA_208 7-1「軟木板釘在祐廷書桌前的牆上」；牆淡出時一起淡出，自訂屬性 dir）；
紙箱兩種狀態：Y2_BOXES_CLOSED（拆箱前：四個封好的紙箱）、Y2_BOXES_OPEN（拆完：兩個壓平的紙箱疊在地上＋上面一個開著的空箱）。
座標＝遊戲 dorm 區域（2026-10-17 LAWWW2-C 改成四人房 dorm_room4.glb：祐廷是 L2＝左牆、靠門那組；書桌沿左牆 z −0.96～0.315、桌面 0.76、
左牆室內面 x=−2.9；層架 z −0.51～0.19、上層板頂 1.42（上面是床板 1.56）；軟木板在書桌前、層架左邊的空牆＝layout 的 wall_spot_by_desk）。
紙箱放在書桌旁的走道邊（x −1.80～−1.12、z −0.88～−0.36，layout 的 BOXES_FLOOR 附近）：顯示時導航要擋這一塊。
舊的雙人房（dorm_interior.glb）版本是 8a1af723（LAWWW2-B 的 WIP，沒有交）。
印刷品（票根、值班表、報告、便利貼、泡麵包裝、課本封面）是本作程式畫的圖（PIL），**沒有任何文字、店名、商標**（D77）；
軟木＝Poly Haven CC0 granular_concrete 調成軟木色（顆粒感），木框＝walnut_veneer。
"""
import json, math, os, sys, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/dorm_y2_items.glb'))
GEN = os.path.join(HERE, 'textures', 'gen'); os.makedirs(GEN, exist_ok=True); ATLAS = os.path.join(GEN, 'dorm_y2_print.png')
rng = random.Random(906)

# ---------------- 印刷品貼圖（1024×512，本作程式畫的；沒有字）----------------
AW, AH = 1024, 512
R = {   # 名稱: (x0, y0, x1, y1)（像素，PIL 座標：左上原點）
    'film': (8, 8, 248, 104), 'ferris': (8, 112, 248, 208), 'sticky': (256, 8, 384, 136), 'note': (256, 144, 384, 232),
    'duty': (392, 8, 600, 296), 'report': (608, 8, 816, 296), 'civ': (824, 8, 1016, 264), 'pages': (824, 272, 1016, 304),
    'noodle': (8, 216, 248, 376), 'noodle_side': (8, 384, 248, 416), 'album': (256, 240, 384, 400), 'pick': (392, 304, 456, 368),
    'kraft': (608, 304, 816, 504), 'kraft_tape': (824, 312, 1016, 504),
}


def draw_atlas():
    im = Image.new('RGB', (AW, AH), (200, 200, 200)); d = ImageDraw.Draw(im)
    def scribble(box, col, rows, w=2, amp=3, seed=0):   # 手寫的筆跡（波浪線，不是字）
        r = random.Random(seed); x0, y0, x1, y1 = box
        for k in range(rows):
            y = y0 + (k + 0.5) * (y1 - y0) / rows; xe = x1 - r.uniform(0, (x1 - x0) * 0.35); pts = []
            x = x0
            while x < xe: pts.append((x, y + amp * math.sin(x * r.uniform(0.25, 0.4)) + r.uniform(-1, 1))); x += 3
            if len(pts) > 1: d.line(pts, fill=col, width=w)
    # 電影票根：米白紙、左邊撕過的鋸齒、青色色帶、印的方塊（沒有字）
    x0, y0, x1, y1 = R['film']; d.rectangle(R['film'], fill=(236, 228, 208)); d.rectangle((x0 + 28, y0 + 8, x0 + 44, y1 - 8), fill=(46, 112, 118))
    for k in range(5): d.rectangle((x0 + 60, y0 + 16 + k * 15, x0 + 60 + rng.randint(60, 150), y0 + 22 + k * 15), fill=(120, 112, 100))
    d.rectangle((x1 - 50, y0 + 18, x1 - 14, y1 - 18), outline=(120, 112, 100), width=2)
    for y in range(y0, y1, 8): d.polygon([(x0, y), (x0 + 6, y + 4), (x0, y + 8)], fill=(200, 200, 200))
    # 摩天輪票根：淡粉紅、摩天輪的線圖
    x0, y0, x1, y1 = R['ferris']; d.rectangle(R['ferris'], fill=(240, 214, 214)); cx, cy, rr = x0 + 60, y0 + 48, 34
    d.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), outline=(170, 80, 96), width=3)
    for k in range(8): a = k * math.pi / 4; d.line((cx, cy, cx + rr * math.cos(a), cy + rr * math.sin(a)), fill=(170, 80, 96), width=2)
    for k in range(4): d.rectangle((x0 + 112, y0 + 20 + k * 16, x0 + 112 + rng.randint(50, 110), y0 + 26 + k * 16), fill=(150, 110, 118))
    # 便利貼：黃色、藍筆兩行；便條：白紙、黑筆三行
    d.rectangle(R['sticky'], fill=(246, 226, 112)); scribble((R['sticky'][0] + 12, R['sticky'][1] + 24, R['sticky'][2] - 10, R['sticky'][1] + 92), (40, 60, 150), 2, w=3, seed=3)
    d.rectangle(R['note'], fill=(246, 244, 236)); scribble((R['note'][0] + 10, R['note'][1] + 10, R['note'][2] - 8, R['note'][3] - 14), (40, 40, 44), 3, w=2, seed=5)
    # 值班表：白紙、灰色表頭、5×8 格；單週週六那一欄的格子塗黃
    x0, y0, x1, y1 = R['duty']; d.rectangle(R['duty'], fill=(248, 247, 242)); d.rectangle((x0 + 12, y0 + 14, x1 - 12, y0 + 34), fill=(150, 150, 150))
    gx0, gy0, gx1, gy1 = x0 + 12, y0 + 48, x1 - 12, y1 - 20; cols, rows = 5, 8
    for r_ in range(rows):
        for c in range(cols):
            bx = (gx0 + (gx1 - gx0) * c / cols, gy0 + (gy1 - gy0) * r_ / rows, gx0 + (gx1 - gx0) * (c + 1) / cols, gy0 + (gy1 - gy0) * (r_ + 1) / rows)
            if c == 4 and r_ % 2 == 0: d.rectangle(bx, fill=(246, 222, 96))
            d.rectangle(bx, outline=(120, 120, 120), width=1)
            if c == 0: d.rectangle((bx[0] + 5, bx[1] + 9, bx[2] - 8, bx[1] + 14), fill=(150, 150, 150))
    # 報告影本：灰色的字行、紅筆劃線、圈、最後一段紅筆評語
    x0, y0, x1, y1 = R['report']; d.rectangle(R['report'], fill=(244, 243, 238)); d.rectangle((x0 + 50, y0 + 16, x1 - 50, y0 + 26), fill=(110, 110, 110))
    for k in range(17):
        y = y0 + 40 + k * 11; d.rectangle((x0 + 16, y, x1 - 16 - (rng.randint(0, 60) if k % 5 == 4 else 0), y + 4), fill=(160, 160, 160))
    d.line((x0 + 40, y0 + 87, x0 + 150, y0 + 87), fill=(196, 40, 40), width=2); d.ellipse((x0 + 120, y0 + 128, x0 + 176, y0 + 146), outline=(196, 40, 40), width=2)
    scribble((x0 + 20, y1 - 62, x1 - 20, y1 - 14), (196, 40, 40), 3, w=2, seed=7)
    # 民總課本封面：深綠、金色細框、抽象的天平線圖（沒有書名）；書口（頁面）
    x0, y0, x1, y1 = R['civ']; d.rectangle(R['civ'], fill=(32, 78, 62)); d.rectangle((x0 + 14, y0 + 14, x1 - 14, y1 - 14), outline=(196, 168, 92), width=3)
    cx = (x0 + x1) // 2; d.line((cx, y0 + 90, cx, y0 + 170), fill=(196, 168, 92), width=4); d.line((cx - 50, y0 + 110, cx + 50, y0 + 110), fill=(196, 168, 92), width=4)
    for sx in (-1, 1): d.arc((cx + sx * 50 - 22, y0 + 112, cx + sx * 50 + 22, y0 + 150), 0, 180, fill=(196, 168, 92), width=3)
    d.rectangle((cx - 30, y0 + 170, cx + 30, y0 + 176), fill=(196, 168, 92))
    x0, y0, x1, y1 = R['pages']; d.rectangle(R['pages'], fill=(242, 238, 226))
    for y in range(y0 + 2, y1, 3): d.line((x0, y, x1, y), fill=(222, 216, 200))
    # 泡麵包裝：橘紅漸層、白色碗＋麵＋熱氣（沒有字）
    x0, y0, x1, y1 = R['noodle']
    for y in range(y0, y1): t = (y - y0) / (y1 - y0); d.line((x0, y, x1, y), fill=(int(226 - 40 * t), int(92 - 30 * t), int(40 - 10 * t)))
    d.pieslice((x0 + 70, y0 + 40, x0 + 170, y0 + 140), 0, 180, fill=(246, 240, 228)); d.ellipse((x0 + 70, y0 + 78, x0 + 170, y0 + 102), fill=(236, 196, 120))
    for k in range(5): d.arc((x0 + 80 + k * 16, y0 + 74, x0 + 104 + k * 16, y0 + 98), 180, 360, fill=(250, 220, 150), width=3)
    for k in range(3): d.line([(x0 + 95 + k * 22, y0 + 70 - j * 8 + (4 if j % 2 else -4)) for j in range(5)], fill=(255, 236, 214), width=3)
    d.rectangle((x0, y1 - 26, x1, y1 - 14), fill=(250, 210, 60)); d.rectangle((x1 - 50, y0 + 12, x1 - 12, y0 + 40), fill=(250, 210, 60))
    x0, y0, x1, y1 = R['noodle_side']; d.rectangle(R['noodle_side'], fill=(196, 70, 34))
    # 相簿：藍色布面、相片框
    x0, y0, x1, y1 = R['album']; d.rectangle(R['album'], fill=(58, 86, 120))
    for k in range(0, x1 - x0, 4): d.line((x0 + k, y0, x0 + k, y1), fill=(52, 78, 110))
    d.rectangle((x0 + 30, y0 + 40, x1 - 30, y0 + 110), fill=(232, 228, 214)); d.rectangle((x0 + 36, y0 + 46, x1 - 36, y0 + 104), fill=(110, 140, 160))
    d.polygon([(x0 + 36, y0 + 104), (x0 + 70, y0 + 74), (x0 + 92, y0 + 92), (x1 - 36, y0 + 80), (x1 - 36, y0 + 104)], fill=(70, 98, 80))
    # 彈片：玳瑁紋
    x0, y0, x1, y1 = R['pick']; d.rectangle(R['pick'], fill=(120, 52, 30))
    for k in range(40): cx_, cy_ = rng.randint(x0, x1), rng.randint(y0, y1); r_ = rng.randint(2, 7); d.ellipse((cx_ - r_, cy_ - r_, cx_ + r_, cy_ + r_), fill=(rng.randint(30, 60), 18, 10) if k % 2 else (196, 120, 50))
    # 紙箱：牛皮紙（瓦楞的細直紋）；封箱膠帶那一面
    for key in ('kraft', 'kraft_tape'):
        x0, y0, x1, y1 = R[key]; d.rectangle(R[key], fill=(186, 146, 98))
        for k in range(x0, x1, 3): d.line((k, y0, k, y1), fill=(178, 139, 92))
    x0, y0, x1, y1 = R['kraft_tape']; d.rectangle(((x0 + x1) // 2 - 14, y0, (x0 + x1) // 2 + 14, y1), fill=(204, 172, 120))
    d.line(((x0 + x1) // 2 - 14, y0, (x0 + x1) // 2 - 14, y1), fill=(170, 140, 96)); d.line(((x0 + x1) // 2 + 14, y0, (x0 + x1) // 2 + 14, y1), fill=(170, 140, 96))
    im = im.filter(ImageFilter.GaussianBlur(0.5)); im.save(ATLAS); return im


draw_atlas()


def uvr(key):
    x0, y0, x1, y1 = R[key]; return (x0 / AW, 1 - y1 / AH, x1 / AW, 1 - y0 / AH)   # Blender UV（v 往上）


class TMesh(Mesh):
    """貼圖集的網格：每個面指定貼圖集裡的一塊"""
    def __init__(self, name, mat):
        super().__init__(name, mat); self.uv = self.bm.loops.layers.uv.new('UVMap')

    def tquad(self, pts, key, flip=False):
        u0, v0, u1, v1 = uvr(key); f = self.bm.faces.new([self.bm.verts.new(g2b(*p)) for p in pts])
        uvs = [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]
        if flip: uvs = [uvs[1], uvs[0], uvs[3], uvs[2]]
        for lp, uv in zip(f.loops, uvs): lp[self.uv].uv = uv
        return f

    def tbox(self, x0, x1, y0, y1, z0, z1, top, side, bottom=None):
        """方塊：頂面 top、四個側面 side、底面 bottom（貼圖集的名稱）"""
        P = lambda x, y, z: (x, y, z)
        self.tquad([P(x0, y1, z1), P(x1, y1, z1), P(x1, y1, z0), P(x0, y1, z0)], top)
        self.tquad([P(x0, y0, z0), P(x1, y0, z0), P(x1, y0, z1), P(x0, y0, z1)], bottom or side)
        self.tquad([P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)], side)
        self.tquad([P(x1, y0, z0), P(x0, y0, z0), P(x0, y1, z0), P(x1, y1, z0)], side)
        self.tquad([P(x1, y0, z1), P(x1, y0, z0), P(x1, y1, z0), P(x1, y1, z1)], side)
        self.tquad([P(x0, y0, z0), P(x0, y0, z1), P(x0, y1, z1), P(x0, y1, z0)], side)

    def finish(self, parent=None, props=None, uv=False, smooth=False, merge=False):
        return super().finish(parent, props, uv=False, smooth=smooth, merge=merge)


def rot_y(pts, c, a):
    """點繞 (cx, cz) 轉 a（俯視逆時針）"""
    ca, sa = math.cos(a), math.sin(a); out = []
    for x, y, z in pts:
        dx, dz = x - c[0], z - c[1]; out.append((c[0] + dx * ca + dz * sa, y, c[1] - dx * sa + dz * ca))
    return out


B.reset(texres=512)
def print_mat():
    m = L.flat('y2_print', '#ffffff', rough=0.72); nt = m.node_tree; tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS)
    nt.links.new(tx.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color']); return m
M = {'print': print_mat(), 'cork': L.pbr('y2_cork', 'granular_concrete', tile=0.5, target='#b8895a', normal=0.6, maps=('diff', 'nor'), res=512, rough_value=0.85),
     'frame': L.pbr('y2_frame', 'walnut_veneer', tile=0.6, target='#8a6a4a', normal=0.3, maps=('diff', 'nor'), rough_value=0.55),
     'vc': L.vc_material('y2_vc', rough=0.45)}
root = B.group('dorm_y2_items', props={'kind': 'dorm_y2_items'})
Y = 0.76                                                         # 桌面（四人房 dorm_room4 的 desk_top_y）
nodes = {}


def node(name, props=None, parent=None):
    g = B.group(name, parent or root, props); nodes[name] = g; return g


# ---------------- 軟木板（左牆室內面 x=−2.9，面朝 +x；祐廷書桌前、層架左邊的空牆）----------------
# 從房間看左牆（面朝 −x）：右手邊是 −z。所以「由左到右」＝ z 由大到小；紙的左邊緣放在 z 大的那一邊
XW = -2.9; BZ0, BZ1, BY0, BY1 = -0.93, -0.54, 0.98, 1.50; XC = XW + 0.016    # 軟木面
board = node('WALL_left_Y2_BOARD', {'dir': json.dumps([1, 0, 0]), 'kind': 'wall_item'})
def pins(cm, pts, cols=('#c23f35', '#2f6db0', '#f2f0ea', '#e0b95b')):
    """圖釘（左牆的軟木板：釘頭朝 +x）"""
    for k, (y, z) in enumerate(pts):
        x = XC + 0.004; c = cols[k % len(cols)]
        before = set(cm.bm.faces); cm.cyl((x, y, z), (x + 0.006, y, z), 0.0055, seg=10); cm.cyl((x + 0.006, y, z), (x + 0.012, y, z), 0.004, seg=8)
        cm.paint([q for q in cm.bm.faces if q not in before], c)
fr = Mesh('y2_board_frame', M['frame'])
for (za, zb, ya, yb) in ((BZ0 - 0.02, BZ1 + 0.02, BY0 - 0.02, BY0), (BZ0 - 0.02, BZ1 + 0.02, BY1, BY1 + 0.02), (BZ0 - 0.02, BZ0, BY0, BY1), (BZ1, BZ1 + 0.02, BY0, BY1)):
    fr.rbox(XW, XW + 0.022, ya, yb, za, zb, r=0.004, seg=1)
fr.finish(board, uv=True)
ck = Mesh('y2_board_cork', M['cork']); ck.box(XW, XC, BY0, BY1, BZ0, BZ1); ck.finish(board, uv=True)
def pinned(name, key, za, zb, y0, y1, tilt=0.0, pin_pts=None, parent=None):
    """釘在軟木板上的紙（面朝 +x；za＝從房間看的左邊緣（z 大）、zb＝右邊緣；tilt＝在牆面上轉一點點）"""
    g = node(name, parent=parent or board); t = TMesh(name + '_paper', M['print'])
    cz, cy = (za + zb) / 2, (y0 + y1) / 2; ct, st = math.cos(tilt), math.sin(tilt)
    def P(z, y): dz, dy = z - cz, y - cy; return (XC + 0.0015, cy + dz * st + dy * ct, cz + dz * ct - dy * st)
    t.tquad([P(za, y0), P(zb, y0), P(zb, y1), P(za, y1)], key); t.finish(g)
    cm = CMesh(name + '_pins', M['vc']); pins(cm, [(P(z, y)[1], P(z, y)[2]) for z, y in (pin_pts or [((za + zb) / 2, y1 - 0.012)])]); cm.finish(g, uv=False)
    return g
# 由左到右（從房間看）：值班表（A5）、便利貼（下面）；票根兩張（上面）、報告影本（A4，下面）
pinned('ITEM_duty', 'duty', -0.56, -0.71, 1.26, 1.47, tilt=0.03, pin_pts=[(-0.635, 1.457)])
pinned('ITEM_sticky', 'sticky', -0.58, -0.66, 1.10, 1.18, tilt=0.06, pin_pts=[(-0.62, 1.17)])
pinned('ITEM_film', 'film', -0.76, -0.87, 1.41, 1.454, tilt=0.08, pin_pts=[(-0.775, 1.432)])
pinned('ITEM_y1_ferris', 'ferris', -0.79, -0.90, 1.33, 1.374, tilt=-0.1, pin_pts=[(-0.885, 1.352)])
pinned('ITEM_report', 'report', -0.73, -0.91, 1.03, 1.285, tilt=-0.04, pin_pts=[(-0.745, 1.27), (-0.895, 1.27)])
# ---------------- 書桌上（L2：書桌沿左牆，離牆 v＝x+2.9；層架 z −0.51～0.19；筆電 z −0.47～−0.13、六法 z −0.045～0.215 在 dorm_room4 的 Y312_YUTING；黃金葛 (−2.39, 0.145)）----------------
# 民總課本：書桌左邊、抽屜櫃上面，平放（書背靠牆、書口朝走道），書口夾著一張紅色書籤（讀到三分之一的地方）
g = node('ITEM_civ'); t = TMesh('ITEM_civ_book', M['print']); bx0, bx1, bz0, bz1, bt = -2.84, -2.65, -0.93, -0.67, 0.034
t.tbox(bx0, bx1, Y, Y + bt, bz0, bz1, 'civ', 'pages', bottom='civ'); t.finish(g)
cm = CMesh('ITEM_civ_mark', M['vc']); cm.cbox(bx1 - 0.002, bx1 + 0.022, Y + bt * 0.62, Y + bt * 0.62 + 0.0012, -0.82, -0.79, '#b8322c'); cm.finish(g, uv=False)
# 吉他彈片：筆電右邊（圓角三角形，1 mm 厚）
g = node('ITEM_pick'); t = TMesh('ITEM_pick_body', M['print']); px, pz, pa = -2.54, -0.09, 0.5
tri = []
for k in range(18):
    a = k * 2 * math.pi / 18; r = 0.0145 * (1 + 0.18 * math.cos(3 * a)) * (1.15 if abs(math.sin(a / 2 * 3)) < 0.3 else 1.0)
    tri.append((px + r * math.cos(a + pa), Y + 0.0012, pz + r * math.sin(a + pa)))
f = t.bm.faces.new([t.bm.verts.new(g2b(*p)) for p in reversed(tri)]); u0, v0, u1, v1 = uvr('pick')
for lp in f.loops:
    co = lp.vert.co; lp[t.uv].uv = (u0 + (u1 - u0) * (0.5 + (co.x - px) / 0.04), v0 + (v1 - v0) * (0.5 + (co.y + pz) / 0.04))
t.finish(g)
# 綠色螢光筆：斜放在攤開的筆記本上（筆記本跟著這一組：大一的房間裡筆記本是 dorm_room4 的 Y203_YUTING，大二起祐廷的桌面留空）
g = node('ITEM_green'); cm = CMesh('ITEM_green_pen', M['vc'])
nx0, nx1, nz0, nz1 = -2.45, -2.30, -0.185, -0.015   # 10-30（DORM203-LM-1030）往筆電那邊移 7 cm、往前 2 cm：原本和黃金葛的盆子、藤疊在一起（使用者「書桌上東西不要重疊」）；不碰筆電（v ≤ 0.44）、vac_C08（z ≤ −0.2）
cm.cbox(nx0, nx1, Y, Y + 0.008, nz0, (nz0 + nz1) / 2 - 0.002, '#f4f1e8'); cm.cbox(nx0, nx1, Y, Y + 0.008, (nz0 + nz1) / 2 + 0.002, nz1, '#f4f1e8')   # 左右兩頁
cm.cbox(nx0, nx1, Y, Y + 0.006, (nz0 + nz1) / 2 - 0.002, (nz0 + nz1) / 2 + 0.002, '#cfc9b8')                                                       # 中間的摺線
for k in range(5): cm.cbox(nx0 + 0.02, nx1 - 0.02, Y + 0.0082, Y + 0.0086, nz0 + 0.02 + k * 0.014, nz0 + 0.021 + k * 0.014, '#9fb4c8')               # 左頁的格線
a0, a1 = (-2.41, Y + 0.0175, -0.14), (-2.34, Y + 0.0175, -0.05)
before = set(cm.bm.faces); cm.cyl(a0, a1, 0.0085, seg=10); cm.paint([q for q in cm.bm.faces if q not in before], '#45b64f')
mid = tuple(a0[i] + (a1[i] - a0[i]) * 0.78 for i in range(3)); before = set(cm.bm.faces); cm.cyl(mid, a1, 0.0092, seg=10); cm.paint([q for q in cm.bm.faces if q not in before], '#2b7a34')
before = set(cm.bm.faces); cm.cyl(a1, (a1[0] + 0.0045, a1[1], a1[2] + 0.011), 0.0035, seg=8); cm.paint([q for q in cm.bm.faces if q not in before], '#7be36f')
cm.finish(g, uv=False)
# 河堤相簿：疊在民總課本上面（書桌左邊的書堆）
g = node('ITEM_y1_album'); t = TMesh('ITEM_y1_album_book', M['print']); t.tbox(-2.86, -2.62, Y + 0.034, Y + 0.059, -0.945, -0.655, 'album', 'pages', bottom='album'); t.finish(g)
# ---------------- 層架上層板的上面（y 1.42，上面是床板 1.56）：阿凱的泡麵＋便條 ----------------
g = node('ITEM_noodle'); t = TMesh('ITEM_noodle_pack', M['print']); Y5 = 1.42
t.tbox(-2.84, -2.70, Y5, Y5 + 0.055, -0.03, 0.19, 'noodle', 'noodle_side', bottom='noodle_side')
nt = TMesh('ITEM_noodle_note', M['print']); nz0_, nx0_ = 0.02, -2.82
nt.tquad([(nx0_, Y5 + 0.0562, nz0_ + 0.085), (nx0_ + 0.06, Y5 + 0.0562, nz0_ + 0.085), (nx0_ + 0.06, Y5 + 0.0562, nz0_), (nx0_, Y5 + 0.0562, nz0_)], 'note')
for m_ in (t, nt):
    for v in m_.bm.verts:                                         # 整包轉一點點（不是對齊層板的）
        x, y, z = v.co.x, v.co.z, -v.co.y; (x2, _, z2), = rot_y([(x, y, z)], (-2.77, 0.08), 0.12); v.co = g2b(x2, y, z2)
t.finish(g); nt.finish(g)
# ---------------- 紙箱（書桌旁的走道邊，L2 的抽屜櫃那一端前面；layout 的 BOXES_FLOOR (−1.45, −0.61) 附近）----------------
def carton(tm, x0, x1, y0, y1, z0, z1, a=0.0):
    c = ((x0 + x1) / 2, (z0 + z1) / 2); n0 = len(tm.bm.verts)
    tm.tbox(x0, x1, y0, y1, z0, z1, 'kraft_tape', 'kraft')
    if a:
        for v in list(tm.bm.verts)[n0:]:
            x, y, z = v.co.x, v.co.z, -v.co.y; (x2, _, z2), = rot_y([(x, y, z)], c, a); v.co = g2b(x2, y, z2)
NAV = [-1.80, -1.12, -0.88, -0.36]
g = node('Y2_BOXES_CLOSED', {'nav_block': json.dumps(NAV)}); t = TMesh('Y2_boxes_closed', M['print'])
carton(t, -1.77, -1.47, 0.0, 0.32, -0.84, -0.40, 0.02); carton(t, -1.44, -1.15, 0.0, 0.32, -0.82, -0.39, -0.03)
carton(t, -1.73, -1.48, 0.32, 0.58, -0.79, -0.45, -0.06); carton(t, -1.42, -1.18, 0.32, 0.56, -0.80, -0.44, 0.05)
t.finish(g)
g = node('Y2_BOXES_OPEN', {'nav_block': json.dumps(NAV)}); t = TMesh('Y2_boxes_open', M['print'])
# 兩個壓平的紙箱疊在地上（等資源回收）
for k, (xa, xb, za, zb) in enumerate(((-1.79, -1.15, -0.86, -0.40), (-1.75, -1.17, -0.83, -0.42))):
    y0, y1 = 0.002 + k * 0.007, 0.008 + k * 0.007; carton(t, xa, xb, y0, y1, za, zb, (0.03, -0.05)[k])
# 一個開著的空箱放在上面：沒有蓋、四片蓋子往外翻
x0, x1, z0, z1, h0 = -1.64, -1.30, -0.76, -0.52, 0.015; h = h0 + 0.30
for quad in (((x0, h0, z1), (x1, h0, z1), (x1, h, z1), (x0, h, z1)), ((x1, h0, z0), (x0, h0, z0), (x0, h, z0), (x1, h, z0)),
             ((x1, h0, z1), (x1, h0, z0), (x1, h, z0), (x1, h, z1)), ((x0, h0, z0), (x0, h0, z1), (x0, h, z1), (x0, h, z0))):
    t.tquad(list(quad), 'kraft'); t.tquad(list(reversed(quad)), 'kraft')
t.tquad([(x0, h0 + 0.004, z0), (x1, h0 + 0.004, z0), (x1, h0 + 0.004, z1), (x0, h0 + 0.004, z1)], 'kraft')
fl = 0.12
for quad in (((x0, h, z1), (x1, h, z1), (x1, h + fl * 0.6, z1 + fl * 0.8), (x0, h + fl * 0.6, z1 + fl * 0.8)),
             ((x1, h, z0), (x0, h, z0), (x0, h + fl * 0.6, z0 - fl * 0.8), (x1, h + fl * 0.6, z0 - fl * 0.8)),
             ((x1, h, z1), (x1, h, z0), (x1 + fl * 0.8, h + fl * 0.5, z0), (x1 + fl * 0.8, h + fl * 0.5, z1)),
             ((x0, h, z0), (x0, h, z1), (x0 - fl * 0.8, h + fl * 0.5, z1), (x0 - fl * 0.8, h + fl * 0.5, z0))):
    t.tquad(list(quad), 'kraft'); t.tquad(list(reversed(quad)), 'kraft')
t.finish(g)
# ---------------- 匯出 ----------------
for ob in bpy.data.objects:
    if ob.type == 'MESH':
        for m in ob.data.materials:
            if m and m.name in ('y2_print',): m.use_backface_culling = False
tris = {}
for ob in bpy.data.objects:
    if ob.type == 'MESH':
        p = ob.parent.name if ob.parent else ''; tris[p] = tris.get(p, 0) + sum(len(q.vertices) - 2 for q in ob.data.polygons)
print('dorm_y2 tris', tris, 'total', sum(tris.values()))
st = L.export(OUT, gpu_instances=False)
L.write_json(OUT.replace('.glb', '.json'), {
    'glb': os.path.relpath(OUT, L.ROOT), 'zone': 'dorm（大二 312 起：同一個四人房模型 dorm_room4，祐廷 L2）', 'layout': 'loft4-v2', 'tris': tris, 'tris_total': sum(tris.values()), 'bytes': st['bytes'],
    'nodes': {
        'WALL_left_Y2_BOARD': '軟木板（左牆、祐廷書桌前＝layout 的 wall_spot_by_desk；ROOM_Y2 以後一直有；牆淡出時一起淡出，dir＝[1,0,0]）；下面的 ITEM_duty／report／film／y1_ferris／sticky 是釘在板上的；社團傳單之後也釘在板上（x 往房間 +0.02）',
        'ITEM_film': 'S.ROOM_Y2_TEXT.film', 'ITEM_pick': 'pick', 'ITEM_civ': 'civ（一定有）', 'ITEM_report': 'report', 'ITEM_noodle': 'noodle（一定有）',
        'ITEM_duty': 'duty', 'ITEM_green': 'green（螢光筆＋攤開的筆記本）', 'ITEM_sticky': 'sticky', 'ITEM_y1_ferris': '大一房間的摩天輪票根', 'ITEM_y1_album': '大一房間的河堤相簿（疊在民總課本上）',
        'Y2_BOXES_CLOSED': '拆箱前：四個封好的紙箱（導航擋 nav_block＝[x0,x1,z0,z1]）', 'Y2_BOXES_OPEN': '拆完：兩個壓平的紙箱疊在地上＋上面一個開著的空箱（導航擋 nav_block）'},
    'pothos': 'prop_pothos.glb（POTHOS_S1～S4，書桌左前角）', 'texture': 'tools/blender/env_second/textures/gen/dorm_y2_print.png（本作，PIL 畫的，沒有字）',
    'materials': ['y2_print', 'y2_cork（Poly Haven granular_concrete）', 'y2_frame（Poly Haven walnut_veneer）', 'y2_vc']})
