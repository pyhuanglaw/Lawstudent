"""溫州街小公園的二手市集（ART-WZ-MARKET-1023；AA_420 12-2，wzlines3d.js 的 WZL.market：每月第一個週六 09:00～13:00；LAWWW2-B 2026-10-24）→ GLB。
Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/wz_market.py [-- --out assets/models/env/second_ai/wz_market.glb]
配置（每一攤的位置、轉向、攤主的位置、要擋的導航格）只寫在 src/data/wz_park_layout.js 的 market，這裡讀同一份。座標＝溫州街區域的世界座標（和 wz_park.glb 一樣）。
兩個節點，遊戲照天氣開一個（市集時段以外兩個都藏）：
  MARKET_CLEAR  晴天：入口步道兩邊——西「舊書」（摺疊桌：平放的書堆＋紙箱裡立著的書、手寫價錢牌）、東「雜貨唱片」（摺疊桌＋陽傘：唱片箱、杯盤、茶壺、舊收音機）、
                西側樟樹下一塊地攤布（藍白格子帆布：舊雜誌、童書、玩具）；攤主的塑膠凳、露營椅
  MARKET_RAIN   下雨：老樹下的環狀步道兩張桌子，各搭一個藍色帆布雨棚（四根鐵柱），書上蓋透明塑膠布
攤主是 NPC（遊戲放；位置在配置的 keeper）。材質：頂點色一個、頂點色金屬一個、印刷品貼圖集一個（價錢牌、唱片封套、雜誌封面、傘布、帆布）、透明塑膠布一個（只有雨天）。
貼圖是本作程式畫的（PIL）：沒有真實的店名、商標、書名（D77）；價錢牌的字是虛構的。
"""
import json, math, os, random, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/wz_market.glb'))
PARK = json.loads(subprocess.check_output(['node', '-e', "global.window={}; process.stdout.write(JSON.stringify(require('./src/data/wz_park_layout.js')))"], cwd=L.ROOT))
MK = PARK['market']
GEN = os.path.join(HERE, 'textures', 'gen'); os.makedirs(GEN, exist_ok=True); ATLAS = os.path.join(GEN, 'wz_market_print.png')
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
rng = random.Random(1023)

# ---------------- 貼圖集（1024×512）----------------
AW, AH = 1024, 512
CELLS = {'price': (0, 0, 160, 120), 'price2': (164, 0, 324, 120), 'umbrella': (328, 0, 584, 64), 'tarp': (588, 0, 844, 128), 'blanket': (848, 0, 1024, 176),
         'cardboard': (0, 124, 128, 252), 'plastic_tag': (132, 124, 196, 188)}
for k in range(8): CELLS[f'rec{k}'] = (200 + (k % 4) * 132, 132 + (k // 4) * 132, 328 + (k % 4) * 132, 260 + (k // 4) * 132)   # 唱片封套 128×128
for k in range(8): CELLS[f'mag{k}'] = (k * 128, 400, k * 128 + 92, 512)                                                    # 雜誌、童書封面 92×112


def draw_atlas():
    im = Image.new('RGB', (AW, AH), (200, 200, 200)); d = ImageDraw.Draw(im)
    f = lambda sz: ImageFont.truetype(FONT, sz)
    def cell(k): return CELLS[k]
    # 價錢牌（紙箱的硬紙板、黑色麥克筆）
    for k, lines in (('price', ['一本 50', '三本 100']), ('price2', ['都可以問', '唱片 80'])):
        x0, y0, x1, y1 = cell(k); d.rectangle((x0, y0, x1 - 1, y1 - 1), fill=(196, 160, 112))
        for j in range(6): d.line((x0, y0 + 10 + j * 20, x1, y0 + 12 + j * 20), fill=(186, 150, 104), width=1)
        for j, s in enumerate(lines): d.text((x0 + 14, y0 + 16 + j * 48), s, font=f(34), fill=(30, 26, 22))
    # 陽傘布：紅白相間（八片：u 方向一片一色）
    x0, y0, x1, y1 = cell('umbrella')
    for k in range(8): d.rectangle((x0 + k * 32, y0, x0 + k * 32 + 31, y1 - 1), fill=(196, 54, 46) if k % 2 == 0 else (240, 232, 214))
    # 藍色帆布（雨棚）：布紋、接縫、邊上的金屬扣眼
    x0, y0, x1, y1 = cell('tarp'); d.rectangle((x0, y0, x1 - 1, y1 - 1), fill=(40, 96, 170))
    for j in range(0, 128, 4): d.line((x0, y0 + j, x1, y0 + j), fill=(36, 88, 158), width=1)
    for j in range(0, 256, 4): d.line((x0 + j, y0, x0 + j, y1), fill=(44, 102, 178), width=1)
    d.line((x0, y0 + 64, x1, y0 + 64), fill=(30, 76, 140), width=2)
    for j in range(8): d.ellipse((x0 + 12 + j * 32, y1 - 12, x0 + 20 + j * 32, y1 - 4), outline=(200, 200, 204), width=2)
    # 地攤布：藍白格子帆布
    x0, y0, x1, y1 = cell('blanket'); d.rectangle((x0, y0, x1 - 1, y1 - 1), fill=(236, 238, 240))
    for j in range(0, 176, 22): d.rectangle((x0, y0 + j, x1, y0 + j + 10), fill=(70, 110, 170))
    for j in range(0, 176, 22): d.rectangle((x0 + j, y0, x0 + j + 10, y1), fill=(70, 110, 170))
    for j in range(0, 176, 22):
        for i in range(0, 176, 22): d.rectangle((x0 + i, y0 + j, x0 + i + 10, y0 + j + 10), fill=(40, 70, 130))
    # 紙箱
    x0, y0, x1, y1 = cell('cardboard'); d.rectangle((x0, y0, x1 - 1, y1 - 1), fill=(186, 146, 98))
    for j in range(0, 128, 6): d.line((x0, y0 + j, x1, y0 + j), fill=(178, 138, 92), width=1)
    d.rectangle((x0 + 40, y0 + 56, x0 + 88, y0 + 72), fill=(160, 120, 80))
    x0, y0, x1, y1 = cell('plastic_tag'); d.rectangle((x0, y0, x1 - 1, y1 - 1), fill=(248, 246, 236))
    # 唱片封套：抽象的圖形（色塊、圓、線條），沒有字
    for k in range(8):
        x0, y0, x1, y1 = cell(f'rec{k}'); r = random.Random(k * 7 + 3)
        bg = [(214, 196, 160), (40, 48, 70), (176, 52, 48), (230, 214, 120), (90, 130, 110), (236, 236, 230), (120, 90, 140), (60, 120, 170)][k]; d.rectangle((x0, y0, x1 - 1, y1 - 1), fill=bg)
        for j in range(3):
            c = tuple(min(255, max(0, v + r.randint(-90, 90))) for v in bg); cx, cy, rr = x0 + r.randint(20, 108), y0 + r.randint(20, 108), r.randint(14, 44)
            (d.ellipse if j % 2 == 0 else d.rectangle)((cx - rr, cy - rr, cx + rr, cy + rr), fill=c)
        d.rectangle((x0 + 8, y1 - 26, x0 + 8 + r.randint(40, 100), y1 - 18), fill=(250, 250, 246) if k != 5 else (30, 30, 30))   # 標題的位置（色條，不是字）
        im_ = im.crop((x0, y0, x1, y1)).filter(ImageFilter.GaussianBlur(0.6)); im.paste(Image.blend(im_, Image.new('RGB', im_.size, (200, 190, 170)), 0.18), (x0, y0))   # 舊：褪色
    # 雜誌、童書封面：色塊＋白色標題條＋小圖
    for k in range(8):
        x0, y0, x1, y1 = cell(f'mag{k}'); r = random.Random(k + 40)
        bg = [(220, 80, 70), (250, 214, 90), (90, 160, 210), (240, 240, 236), (130, 190, 120), (230, 150, 180), (60, 70, 90), (250, 170, 70)][k]; d.rectangle((x0, y0, x1 - 1, y1 - 1), fill=bg)
        d.rectangle((x0 + 6, y0 + 6, x1 - 6, y0 + 22), fill=(250, 250, 248) if k != 3 else (40, 40, 40))
        cx, cy = x0 + 46, y0 + 66; d.ellipse((cx - 24, cy - 24, cx + 24, cy + 24), fill=tuple(min(255, v + 40) for v in bg[::-1]))
        for j in range(3): d.rectangle((x0 + 8, y1 - 26 + j * 7, x0 + 8 + r.randint(30, 70), y1 - 23 + j * 7), fill=(250, 250, 248))
    im.save(ATLAS)


draw_atlas()


def uvr(key):
    x0, y0, x1, y1 = CELLS[key]; return (x0 / AW, 1 - y1 / AH, x1 / AW, 1 - y0 / AH)


B.reset(texres=1024)
def print_mat(name):
    m = L.flat(name, '#ffffff', rough=0.8); nt = m.node_tree; tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS)
    nt.links.new(tx.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color']); return m
MAT = {'vc': L.vc_material('wzm_vc', rough=0.75), 'metal': L.vc_metal('wzm_vc_metal', rough=0.4, metal=0.35), 'print': print_mat('wzm_print'),
       'plastic': L.flat('wzm_plastic', '#e9f1f4', rough=0.08, alpha=0.32)}
MAT['print'].use_backface_culling = False; MAT['plastic'].use_backface_culling = False
root = B.group('wz_market', props={'kind': 'wz_market', 'layout': PARK.get('version')})


class TMesh(Mesh):
    """貼圖集的網格（每個面指定一塊）"""
    def __init__(self, name, mat):
        super().__init__(name, mat); self.uv = self.bm.loops.layers.uv.new('UVMap')

    def tquad(self, pts, key, sub=None):
        u0, v0, u1, v1 = uvr(key)
        if sub: a, b, c, e = sub; u0, v0, u1, v1 = u0 + (u1 - u0) * a, v0 + (v1 - v0) * b, u0 + (u1 - u0) * c, v0 + (v1 - v0) * e
        f = self.bm.faces.new([self.bm.verts.new(g2b(*p)) for p in pts])
        for lp, uv in zip(f.loops, [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]): lp[self.uv].uv = uv
        return f

    def finish(self, parent=None, props=None, uv=False, smooth=False, merge=True):
        return super().finish(parent, props, uv=False, smooth=smooth, merge=merge)


class Stall:
    """一攤：在自己的座標裡做（原點＝攤子中心、+z＝面向客人、y 往上），最後整組轉到世界（yaw，同 three.js 的 rotation.y）"""
    def __init__(self, sp):
        self.sp = sp; self.vc = CMesh('wzm_part_vc', MAT['vc']); self.mt = CMesh('wzm_part_metal', MAT['metal']); self.pr = TMesh('wzm_part_print', MAT['print']); self.pl = Mesh('wzm_part_plastic', MAT['plastic'])

    def place(self, group, tag):
        ya, cx, cz = self.sp['yaw'], self.sp['x'], self.sp['z']; ca, sa = math.cos(ya), math.sin(ya)
        for m in (self.vc, self.mt, self.pr, self.pl):
            for v in m.bm.verts:
                x, y, z = v.co.x, v.co.z, -v.co.y; wx, wz = cx + x * ca + z * sa, cz - x * sa + z * ca; v.co = g2b(wx, y, wz)
            m.name = f'{tag}_{m.name[9:]}'
            ob = m.finish(group, uv=False, smooth=False)
            if ob is not None and m is self.mt: L.smooth_mesh(ob, angle=0.9)


def cylv(cm, a, b, r, col, seg=8):
    """頂點色圓柱（CMesh）：加完把新面塗色"""
    n0 = len(cm.bm.faces); cm.cyl(a, b, r, seg=seg); cm.bm.faces.ensure_lookup_table(); cm.paint([cm.bm.faces[i] for i in range(n0, len(cm.bm.faces))], col)


def lathev(cm, prof, x, y, z, col, seg=12):
    n0 = len(cm.bm.faces); bm2 = L.lathe(prof, seg=seg); cm.add_bm(bm2, Matrix.Translation(g2b(x, y, z))); bm2.free(); cm.bm.faces.ensure_lookup_table()
    cm.paint([cm.bm.faces[i] for i in range(n0, len(cm.bm.faces))], col)


def folding_table(s, L_=1.8, D_=0.6, H=0.72):
    """摺疊桌：白色塑膠桌面（倒角）、四根鐵管腳＋兩條橫桿"""
    s.vc.crbox(-L_ / 2, L_ / 2, H - 0.04, H, -D_ / 2, D_ / 2, '#ecebe6', r=0.015)
    s.vc.cbox(-L_ / 2 + 0.03, L_ / 2 - 0.03, H - 0.07, H - 0.04, -D_ / 2 + 0.03, -D_ / 2 + 0.05, '#d8d6d0'); s.vc.cbox(-L_ / 2 + 0.03, L_ / 2 - 0.03, H - 0.07, H - 0.04, D_ / 2 - 0.05, D_ / 2 - 0.03, '#d8d6d0')
    for sx in (-1, 1):
        for sz in (-1, 1): cylv(s.mt, (sx * (L_ / 2 - 0.12), 0.0, sz * (D_ / 2 - 0.06)), (sx * (L_ / 2 - 0.12), H - 0.07, sz * (D_ / 2 - 0.06)), 0.013, '#9ea3a8')
        cylv(s.mt, (sx * (L_ / 2 - 0.12), 0.18, -(D_ / 2 - 0.06)), (sx * (L_ / 2 - 0.12), 0.18, D_ / 2 - 0.06), 0.009, '#9ea3a8')
    cylv(s.mt, (-(L_ / 2 - 0.12), 0.18, 0.0), (L_ / 2 - 0.12, 0.18, 0.0), 0.009, '#9ea3a8')


BOOKC = ['#7a3b2e', '#2f4d6b', '#c9b48a', '#3d5c45', '#8e6b3a', '#a63a32', '#4a4a52', '#d8cfb8', '#5b3f62', '#2e5f63', '#b7914f', '#6b6f75']


def book_stack(s, x, z, y, n, rot=0.0, big=False):
    """平放的一疊書（每本一個頂點色方塊，大小、顏色、轉角都有一點不一樣）"""
    for k in range(n):
        w, d_, t = (0.21 if big else 0.15) + rng.uniform(-0.02, 0.03), (0.28 if big else 0.21) + rng.uniform(-0.02, 0.03), rng.uniform(0.015, 0.035)
        a = rot + rng.uniform(-0.12, 0.12); n0 = len(s.vc.bm.verts)
        fs = s.vc.cbox(-w / 2, w / 2, y, y + t, -d_ / 2, d_ / 2, rng.choice(BOOKC)); s.vc.bm.verts.ensure_lookup_table()
        ca, sa = math.cos(a), math.sin(a)
        for v in list({vv for f in fs for vv in f.verts}):
            bx, by_ = v.co.x, -v.co.y; v.co.x, v.co.y = x + bx * ca + by_ * sa, -(z - bx * sa + by_ * ca)
        y += t
    return y


def book_box(s, x, z, rot=0.0, w=0.42, d_=0.32, h=0.24):
    """紙箱（四面＋底、翻開的蓋子）裡立著一排一排的書（書背朝上）"""
    ca, sa = math.cos(rot), math.sin(rot)
    P = lambda u, y, v: (x + u * ca + v * sa, y, z - u * sa + v * ca)
    y0 = 0.72
    for (u0, u1, v0, v1) in ((-w / 2, w / 2, -d_ / 2, -d_ / 2), (-w / 2, w / 2, d_ / 2, d_ / 2), (-w / 2, -w / 2, -d_ / 2, d_ / 2), (w / 2, w / 2, -d_ / 2, d_ / 2)):
        s.pr.tquad([P(u0, y0, v0), P(u1, y0, v1), P(u1, y0 + h, v1), P(u0, y0 + h, v0)], 'cardboard')
    s.pr.tquad([P(-w / 2, y0 + 0.002, -d_ / 2), P(w / 2, y0 + 0.002, -d_ / 2), P(w / 2, y0 + 0.002, d_ / 2), P(-w / 2, y0 + 0.002, d_ / 2)], 'cardboard')
    for (u0, u1, v0, v1, du, dv) in ((-w / 2, w / 2, -d_ / 2, -d_ / 2, 0, -0.16), (-w / 2, w / 2, d_ / 2, d_ / 2, 0, 0.14)):   # 前後兩片蓋子往外翻
        s.pr.tquad([P(u0, y0 + h, v0), P(u1, y0 + h, v1), P(u1 + du, y0 + h - 0.05, v1 + dv), P(u0 + du, y0 + h - 0.05, v0 + dv)], 'cardboard')
    rows = 3
    for r_ in range(rows):
        v = -d_ / 2 + (r_ + 0.5) * d_ / rows; u = -w / 2 + 0.01
        while u < w / 2 - 0.03:
            t = rng.uniform(0.018, 0.04); hh = rng.uniform(0.16, 0.23); tilt = rng.uniform(-0.05, 0.05)
            fs = s.vc.cbox(u, u + t, y0 + 0.01, y0 + 0.01 + hh, v - d_ / rows / 2 + 0.01, v + d_ / rows / 2 - 0.01, rng.choice(BOOKC))
            for vv in list({q for f in fs for q in f.verts}):
                lx, ly, lz = vv.co.x, vv.co.z, -vv.co.y; lx += (ly - y0) * tilt
                vv.co = g2b(*P(lx, ly, lz))
            u += t + 0.002


def price_card(s, x, z, key, rot=0.0, y=0.72):
    """價錢牌：硬紙板對折立著（A 字）"""
    ca, sa = math.cos(rot), math.sin(rot); P = lambda u, yy, v: (x + u * ca + v * sa, yy, z - u * sa + v * ca)
    w, h, lean = 0.16, 0.12, 0.05
    s.pr.tquad([P(w / 2, y, lean), P(-w / 2, y, lean), P(-w / 2, y + h, 0.0), P(w / 2, y + h, 0.0)], key)
    s.pr.tquad([P(-w / 2, y, -lean), P(w / 2, y, -lean), P(w / 2, y + h, 0.0), P(-w / 2, y + h, 0.0)], 'cardboard')


def stool(s, x, z, col='#c0392b'):
    """紅色塑膠凳"""
    lathev(s.vc, [(0.0, 0.0), (0.16, 0.0), (0.155, 0.02), (0.13, 0.4), (0.15, 0.42), (0.15, 0.45), (0.0, 0.45)], x, 0.0, z, col, seg=14)


def camp_chair(s, x, z, rot=0.0):
    """露營椅：鐵管 X 腳、深綠色的布（座面、椅背）"""
    ca, sa = math.cos(rot), math.sin(rot); P = lambda u, y, v: (x + u * ca + v * sa, y, z - u * sa + v * ca)
    for sx in (-1, 1):
        cylv(s.mt, P(sx * 0.24, 0.0, 0.22), P(sx * 0.24, 0.46, -0.18), 0.011, '#3a3c40'); cylv(s.mt, P(sx * 0.24, 0.0, -0.2), P(sx * 0.24, 0.46, 0.22), 0.011, '#3a3c40')
        cylv(s.mt, P(sx * 0.24, 0.46, -0.18), P(sx * 0.25, 0.86, -0.28), 0.011, '#3a3c40')
    s.vc.poly([P(-0.24, 0.44, 0.22), P(0.24, 0.44, 0.22), P(0.24, 0.42, -0.16), P(-0.24, 0.42, -0.16)][::-1], '#2f5a46')
    s.vc.poly([P(-0.24, 0.42, -0.16), P(0.24, 0.42, -0.16), P(0.25, 0.84, -0.27), P(-0.25, 0.84, -0.27)][::-1], '#2f5a46')
    s.vc.poly([P(-0.24, 0.42, -0.16), P(0.24, 0.42, -0.16), P(0.25, 0.84, -0.27), P(-0.25, 0.84, -0.27)], '#2f5a46')


def parasol(s, x, z, r, h):
    """陽傘：鐵桿、八片紅白傘布（傘頂往下 0.32）、底座水泥墩"""
    lathev(s.vc, [(0.0, 0.0), (0.2, 0.0), (0.2, 0.08), (0.06, 0.12), (0.0, 0.12)], x, 0.0, z, '#8a8a86', seg=12)
    cylv(s.mt, (x, 0.1, z), (x, h + 0.05, z), 0.018, '#d8d8d4')
    u0, v0, u1, v1 = uvr('umbrella')
    for k in range(8):
        a0, a1 = k * math.pi / 4, (k + 1) * math.pi / 4; ru = 0.5 * (u0 + u1) - (u1 - u0) / 2 + (u1 - u0) * (k + 0.5) / 8
        tip = (x, h, z); pa = (x + r * math.cos(a0), h - 0.32, z + r * math.sin(a0)); pb = (x + r * math.cos(a1), h - 0.32, z + r * math.sin(a1))
        for pts in ((tip, pb, pa),):                                       # 一面就好（材質兩面都畫；正反各一片會在同一個平面上閃）
            f = s.pr.bm.faces.new([s.pr.bm.verts.new(g2b(*p)) for p in pts])
            for lp in f.loops: lp[s.pr.uv].uv = (ru, (v0 + v1) / 2)
        for pts in ((pa, pb, (pb[0], pb[1] - 0.12, pb[2]), (pa[0], pa[1] - 0.12, pa[2])),):   # 垂下來的傘緣
            f = s.pr.bm.faces.new([s.pr.bm.verts.new(g2b(*p)) for p in pts])
            for lp in f.loops: lp[s.pr.uv].uv = (ru, (v0 + v1) / 2)


def canopy(s, w, d_, h, oz=0.0):
    """雨棚：四根鐵柱、斜的藍色帆布頂（前面客人那邊高、後面低：雨水往攤主後面流）、前面一條垂邊；oz＝往後挪（攤主的椅子也在棚子裡）"""
    hf, hb = h, h - 0.22; z0, z1 = oz - d_ / 2, oz + d_ / 2
    for sx in (-1, 1):
        for zz, top in ((z0, hb), (z1, hf)): cylv(s.mt, (sx * w / 2, 0.0, zz), (sx * w / 2, top - 0.02, zz), 0.018, '#c8ccd0')
    s.pr.tquad([(-w / 2 - 0.1, hb, z0 - 0.12), (w / 2 + 0.1, hb, z0 - 0.12), (w / 2 + 0.1, hf, z1 + 0.1), (-w / 2 - 0.1, hf, z1 + 0.1)], 'tarp')
    s.pr.tquad([(-w / 2 - 0.1, hf - 0.2, z1 + 0.1), (w / 2 + 0.1, hf - 0.2, z1 + 0.1), (w / 2 + 0.1, hf, z1 + 0.1), (-w / 2 - 0.1, hf, z1 + 0.1)], 'tarp', sub=(0, 0.8, 1, 1))


def plastic_sheet(s, x0, x1, z0, z1, y):
    """透明塑膠布蓋在書上（中間鼓、四邊垂下來一點）"""
    n = 4
    for i in range(n):
        for j in range(n):
            def p(ii, jj):
                u, v = ii / n, jj / n; edge = min(u, 1 - u, v, 1 - v); return (x0 + (x1 - x0) * u, y + 0.03 * min(1.0, edge * 4) - (0.02 if edge == 0 else 0.0), z0 + (z1 - z0) * v)
            s.pl.quad([p(i, j), p(i + 1, j), p(i + 1, j + 1), p(i, j + 1)])


def books_table(s, rain=False):
    folding_table(s)
    yy = book_stack(s, -0.62, 0.05, 0.72, 5, rot=0.1, big=True); book_stack(s, -0.3, 0.12, 0.72, 3, rot=-0.2)
    book_stack(s, 0.05, 0.1, 0.72, 4, rot=0.05); book_stack(s, 0.0, -0.14, 0.72, 2, rot=1.5)
    book_box(s, 0.5, 0.0, rot=0.06)
    price_card(s, -0.25, 0.2, 'price', rot=0.0)
    s.pr.tquad([(-0.86, 0.0, 0.32), (-0.4, 0.0, 0.32), (-0.4, 0.32, 0.32), (-0.86, 0.32, 0.32)], 'cardboard')   # 桌下還有一箱（只看得到正面）
    s.pr.tquad([(-0.86, 0.32, 0.32), (-0.4, 0.32, 0.32), (-0.4, 0.32, -0.02), (-0.86, 0.32, -0.02)], 'cardboard')
    for k in range(4):
        b = rng.choice(BOOKC); s.vc.cbox(-0.84 + k * 0.1, -0.84 + k * 0.1 + 0.08, 0.32, 0.36, 0.0, 0.28, b)
    if rain: plastic_sheet(s, -0.85, 0.25, -0.25, 0.28, 0.76)


def misc_table(s, rain=False):
    folding_table(s)
    # 唱片箱（木箱，封套立著、往後靠）
    ca = '#9a6a3e'; s.vc.cbox(-0.85, -0.38, 0.72, 0.74, -0.2, 0.2, ca)
    for (x0, x1, z0, z1) in ((-0.85, -0.38, -0.2, -0.18), (-0.85, -0.38, 0.18, 0.2), (-0.85, -0.83, -0.2, 0.2), (-0.4, -0.38, -0.2, 0.2)): s.vc.cbox(x0, x1, 0.72, 0.88, z0, z1, ca)
    for k in range(7):
        z = 0.14 - k * 0.045; tilt = 0.12 + k * 0.01; key = f'rec{k % 8}'
        s.pr.tquad([(-0.8, 0.74, z), (-0.43, 0.74, z), (-0.43, 0.74 + 0.31 * math.cos(tilt), z - 0.31 * math.sin(tilt)), (-0.8, 0.74 + 0.31 * math.cos(tilt), z - 0.31 * math.sin(tilt))], key)
    # 杯盤、茶壺、舊收音機、一盞檯燈
    for k, (x, z) in enumerate(((-0.15, 0.12), (-0.02, 0.15), (0.11, 0.12))): lathev(s.vc, [(0.0, 0.0), (0.03, 0.0), (0.04, 0.07), (0.037, 0.075), (0.0, 0.01)], x, 0.72, z, ['#f0ece2', '#c9dbe2', '#e8d4b8'][k])
    for k in range(4): lathev(s.vc, [(0.0, 0.0), (0.09, 0.0), (0.11, 0.015), (0.0, 0.016)], 0.0, 0.72 + k * 0.016, -0.12, '#f2efe6', seg=14)
    lathev(s.vc, [(0.0, 0.0), (0.06, 0.0), (0.085, 0.05), (0.07, 0.1), (0.03, 0.12), (0.0, 0.13)], 0.32, 0.72, 0.05, '#3c5a72', seg=14)
    cylv(s.vc, (0.39, 0.78, 0.05), (0.47, 0.83, 0.05), 0.012, '#3c5a72', seg=6)
    s.vc.crbox(0.55, 0.83, 0.72, 0.88, -0.17, -0.05, '#7a5a3a', r=0.01); s.vc.cbox(0.58, 0.7, 0.75, 0.85, -0.051, -0.049, '#d9c9a8')
    for kx in (0.74, 0.79): cylv(s.vc, (kx, 0.8, -0.05), (kx, 0.8, -0.03), 0.012, '#2a2a2a', seg=8)
    price_card(s, 0.2, 0.22, 'price2', rot=0.0)
    if rain: plastic_sheet(s, -0.88, -0.35, -0.24, 0.24, 0.9)


def mat_stall(s):
    """地攤布：藍白格子帆布（1.4×1.2），舊雜誌一疊一疊、童書攤開、玩具（球、小車、積木）"""
    s.pr.tquad([(-0.7, 0.012, -0.6), (0.7, 0.012, -0.6), (0.7, 0.012, 0.6), (-0.7, 0.012, 0.6)], 'blanket')
    for k in range(6):
        x, z = -0.5 + (k % 3) * 0.3, -0.25 + (k // 3) * 0.35; n = 2 + k % 3; y = 0.013
        for j in range(n):
            key = f'mag{(k * 3 + j) % 8}'; w, d_ = 0.21, 0.27; a = rng.uniform(-0.15, 0.15); ca, sa = math.cos(a), math.sin(a)
            P = lambda u, v: (x + u * ca + v * sa, y + 0.006, z - u * sa + v * ca)
            s.vc.cbox(x - w / 2, x + w / 2, y, y + 0.005, z - d_ / 2, z + d_ / 2, '#f4f2ea')
            s.pr.tquad([P(w / 2, d_ / 2), P(-w / 2, d_ / 2), P(-w / 2, -d_ / 2), P(w / 2, -d_ / 2)], key)
            y += 0.007
    s.vc.sphere((0.45, 0.09, 0.32), 0.08, seg=10, rings=6); s.vc.paint(list(s.vc.bm.faces)[-60:], '#e04a3a')
    s.vc.crbox(0.3, 0.46, 0.012, 0.07, -0.42, -0.34, '#2f6db0', r=0.012)
    for k, c in enumerate(('#e8b84a', '#3c9a5a', '#c0392b', '#2f6db0')): s.vc.cbox(0.52 + (k % 2) * 0.06, 0.57 + (k % 2) * 0.06, 0.012 + (k // 2) * 0.05, 0.062 + (k // 2) * 0.05, 0.02, 0.07, c)


def build(state):
    g = B.group('MARKET_' + state.upper(), root, {'kind': 'market', 'weather': state, 'show': 'WZL.marketOn(G)：' + ('晴天、陰天' if state == 'clear' else "G.weather==='rain'")})
    for sp in MK[state]['stalls']:
        s = Stall(sp); rain = state == 'rain'
        if sp['id'] == 'books': books_table(s, rain)
        elif sp['id'] == 'misc': misc_table(s, rain)
        else: mat_stall(s)
        # 攤主的椅子（在攤子自己的座標：keeper 換算回來）
        kp = sp['keeper']; ya = sp['yaw']; ca, sa = math.cos(ya), math.sin(ya); dx, dz = kp['x'] - sp['x'], kp['z'] - sp['z']; lx, lz = dx * ca - dz * sa, dx * sa + dz * ca
        if sp['id'] == 'misc': camp_chair(s, lx, lz)
        else: stool(s, lx, lz, '#c0392b' if sp['id'] == 'books' else '#2f6db0')
        if rain and sp.get('canopy'): c = sp['canopy']; canopy(s, c['w'], c['d'], c['h'], c.get('oz', 0.0))
        if not rain and sp.get('umbrella'):
            u = sp['umbrella']; ux, uz = u['x'] - sp['x'], u['z'] - sp['z']; parasol(s, ux * ca - uz * sa, ux * sa + uz * ca, u['r'], u['h'])
        s.place(g, f'{state}_{sp["id"]}')
    L.merge_by_material(g)
    return g


for st in ('clear', 'rain'): build(st)
tris = {}
for ob in bpy.data.objects:
    if ob.type != 'MESH': continue
    p = ob.parent
    while p is not None and not p.name.startswith('MARKET_'): p = p.parent
    k = p.name if p is not None else '?'; tris[k] = tris.get(k, 0) + sum(len(q.vertices) - 2 for q in ob.data.polygons)
print('wz_market tris', tris)
st = L.export(OUT, gpu_instances=False)
L.write_json(OUT.replace('.glb', '.json'), {'glb': os.path.relpath(OUT, L.ROOT), 'zone': 'wenzhou（世界座標，同 wz_park.glb）', 'tris': tris, 'bytes': st['bytes'], 'meshes': st['objects'],
    'nodes': {'MARKET_CLEAR': '晴天：入口步道兩邊兩張摺疊桌（舊書／雜貨唱片＋陽傘）＋樟樹下的地攤布', 'MARKET_RAIN': '下雨：老樹下兩張桌子，各一個藍色雨棚，書蓋透明塑膠布'},
    'show': 'WZL.marketOn(G)（每月第一個週六 09:00～13:00）；G.weather===\'rain\' 開 MARKET_RAIN，其他開 MARKET_CLEAR；導航阻擋照 WZ_PARK_LAYOUT.market.<天氣>.blocks（只在市集時段）',
    'keepers': {k: [dict(s['keeper'], stall=s['id']) for s in MK[k]['stalls']] for k in ('clear', 'rain')},
    'texture': 'tools/blender/env_second/textures/gen/wz_market_print.png（本作，PIL 畫的；沒有真實的店名、書名、商標）'})
