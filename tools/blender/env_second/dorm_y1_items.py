"""大一的房間（203，阿凱同房）的兩樣東西 → GLB（ART-Y1-BOX-1021；AA_347 1-1、5-1，LAWWW-C 2026-10-21 派）。LAWWW2-C 2026-10-21。
Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/dorm_y1_items.py [-- --out assets/models/env/second_ai/dorm_y1_items.glb]

1. 「冬天的衣服」紙箱（AA_12 主線 1；AA_347 5-1；互動點 src/y1fill3d.js 的 S.boxSpot＝祐廷那組床的書桌和梯子中間、走道那一側）。
   - 書桌和梯子中間本來是衣櫃（dorm_room4.py 的 loft()：衣櫃 u ust−0.6～ust、離牆 0～0.585）。
   - 紙箱推在衣櫃門前、床板底下（離牆 0.62～0.93）：沒拆的話擋著衣櫃（劇情：外套要等拆了才掛進衣櫃）。
   - 箱子塞得很滿、上蓋微微鼓起；封箱膠帶；頂面、朝走道那一面有媽媽用黑色麥克筆寫的「冬天的衣服」。
   - Y1_BOX_WINTER：封好的紙箱（8/29 起、BOX_WINTER_OPEN 以前）。
   - Y1_BOX_FOLDED：拆了以後壓平的紙箱（「紙箱摺好，塞回床底下」）：靠在書桌底下的牆邊（抽屜櫃和右側板中間）。
   - 兩個都在 dorm_room4 的 L2 床桌組裡面（導航本來就擋著），不用改導航。
2. 阿凱的國界（F-K1；AA_347 1-1；擺法照 AA_209：繞他自己那組床桌一圈；R2＝右牆、靠門那組）。
   - 淺藍綠色的紙膠帶，3 cm 寬，在地上：
     - 走道那一邊一條（離牆 1.38 m，椅子、拖鞋也圈在裡面）；
     - 兩端各一條回到牆邊（床頭那一端沿著和 R1 的交界，床尾那一端沿著洗手間的牆）。
   - 一段一段撕下來貼的：每段 0.6～1.1 m，接頭重疊幾公分、角度差一點點、斷口斜斜的。
   - Y1_KAI_TAPE：膠帶（中間那一段除外）。
   - Y1_KAI_TAPE_MID：中間那一段沒寫字的版本。
   - Y1_KAI_TAPE_TEXT：中間那一段寫了「法律系可以無條件入境」的版本（ev_kai_tape2 以後）。
     - 黑色麥克筆、字頭朝阿凱那邊，站在走道看得懂；
     - 兩版只顯示一個，不疊在一起，所以不會疊面。
座標＝遊戲 dorm 區域（四人房 dorm_room4.glb、layout loft4-v2）。
- 印刷品貼圖是同一支腳本用 PIL 畫的（textures/gen/dorm_y1_print.png）：
  - 紙箱的瓦楞紋、封箱膠帶、通用的「向上」「怕濕」圖示，**沒有品牌、店名、商標**（D77）；
  - 手寫字是系統字型 WenQuanYi Zen Hei（GPL-2.0＋字型嵌入例外）一個字一個字歪一點畫成點陣圖，**不附字型檔**。
"""
import json, math, os, sys, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/dorm_y1_items.glb'))
GEN = os.path.join(HERE, 'textures', 'gen'); os.makedirs(GEN, exist_ok=True); ATLAS = os.path.join(GEN, 'dorm_y1_print.png')
LAY = json.load(open(os.path.join(L.ROOT, 'assets/models/env/second_ai/dorm_room4.layout.json')))
U = {u['id']: u for u in LAY['units']}
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
rng = random.Random(1021)

# ---------------- 印刷品貼圖（1024×1024；PIL 左上原點）----------------
AW, AH = 1024, 1024
R = {'top': (0, 0, 512, 320), 'side': (512, 0, 1024, 330), 'end': (0, 336, 330, 676), 'plain': (340, 336, 500, 496),
     'flat': (512, 340, 1024, 734), 'tape': (0, 690, 512, 731), 'tape_mid': (0, 740, 512, 781), 'tape_text': (0, 790, 512, 831)}   # 膠帶 4.8 cm：中間那段 0.6 m＝512×41（長寬比 12.5）
KRAFT, KRAFT_D = (184, 142, 94), (172, 132, 86)
TAPE_C = (112, 186, 178)


def kraft(d, box, vertical=True):
    x0, y0, x1, y1 = box; d.rectangle(box, fill=KRAFT)
    for k in range(x0 if vertical else y0, x1 if vertical else y1, 3):   # 瓦楞的細紋
        if vertical: d.line((k, y0, k, y1), fill=KRAFT_D)
        else: d.line((x0, k, x1, k), fill=KRAFT_D)
    for _ in range(int((x1 - x0) * (y1 - y0) / 900)):                    # 髒點、擦痕
        cx, cy = rng.randint(x0, x1), rng.randint(y0, y1); r = rng.randint(1, 4); c = rng.randint(-18, 10)
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(KRAFT[0] + c, KRAFT[1] + c, KRAFT[2] + c))


def opp_tape(d, box):
    """封箱膠帶（透明偏黃、邊緣反光、皺摺）"""
    x0, y0, x1, y1 = box; d.rectangle(box, fill=(204, 168, 112))
    d.line((x0, y0, x1, y0), fill=(226, 200, 150), width=2); d.line((x0, y1, x1, y1), fill=(160, 124, 80), width=2)
    for _ in range(max(2, (x1 - x0) // 40)):
        xx = rng.randint(x0, x1); d.line((xx, y0, xx + rng.randint(-6, 6), y1), fill=(214, 182, 128), width=1)


def hand(im, text, cx, cy, size, ang=0.0, col=(28, 28, 32), wob=6.0, seed=0, stroke=1, gap=0.94):
    """麥克筆手寫：一個字一個字，大小、角度、高低差一點點；整串轉 ang 度"""
    r = random.Random(seed); n = len(text); W = int(size * gap * n + size); H = int(size * 1.8)
    lay = Image.new('L', (W, H), 0); dl = ImageDraw.Draw(lay)
    for i, ch in enumerate(text):
        s = int(size * r.uniform(0.92, 1.08)); f = ImageFont.truetype(CJK, s)
        g = Image.new('L', (s * 2, s * 2), 0); ImageDraw.Draw(g).text((s // 2, s // 2), ch, font=f, fill=255, stroke_width=stroke, stroke_fill=255)
        g = g.rotate(r.uniform(-wob, wob), resample=Image.BICUBIC)
        lay.paste(255, (int(size * 0.5 + i * size * gap - s // 2 + r.uniform(-2, 2)), int(H / 2 - s + r.uniform(-size * 0.06, size * 0.06))), g)
    lay = lay.rotate(ang, resample=Image.BICUBIC, expand=True).filter(ImageFilter.GaussianBlur(0.6))
    im.paste(Image.new('RGB', lay.size, col), (int(cx - lay.size[0] / 2), int(cy - lay.size[1] / 2)), lay)


def icons(d, x, y, s, col=(120, 84, 52)):
    """紙箱上印的通用圖示：向上（兩個箭頭）、怕濕（傘＋雨滴）；沒有字"""
    for k in (0, 1):
        ax = x + k * s * 0.5; d.polygon([(ax, y), (ax + s * 0.18, y + s * 0.3), (ax - s * 0.18, y + s * 0.3)], fill=col); d.rectangle((ax - s * 0.05, y + s * 0.3, ax + s * 0.05, y + s * 0.8), fill=col)
    ux = x + s * 1.4; d.pieslice((ux - s * 0.4, y + s * 0.1, ux + s * 0.4, y + s * 0.9), 180, 360, fill=col); d.line((ux, y + s * 0.5, ux, y + s * 0.95), fill=col, width=max(2, int(s * 0.06)))
    for k in range(3): dx = ux - s * 0.3 + k * s * 0.3; d.line((dx, y - s * 0.2, dx - s * 0.05, y - s * 0.05), fill=col, width=2)
    d.rectangle((x - s * 0.35, y - s * 0.35, ux + s * 0.55, y + s * 1.1), outline=col, width=2)


def washi(d, box):
    """紙膠帶：淺藍綠、和紙的纖維、邊緣淡一點"""
    x0, y0, x1, y1 = box; d.rectangle(box, fill=TAPE_C)
    for _ in range((x1 - x0) // 2):
        xx, yy = rng.randint(x0, x1), rng.randint(y0, y1); c = rng.randint(-10, 14); d.point((xx, yy), fill=(TAPE_C[0] + c, TAPE_C[1] + c, TAPE_C[2] + c))
    d.line((x0, y0, x1, y0), fill=(150, 210, 202)); d.line((x0, y1 - 1, x1, y1 - 1), fill=(150, 210, 202))


def draw_atlas():
    im = Image.new('RGB', (AW, AH), KRAFT); d = ImageDraw.Draw(im)
    # 頂面（橫＝箱子長邊 z、上＝離牆那一側的反方向）：兩片上蓋的接縫在中間、封箱膠帶沿接縫；朝走道那一片寫「冬天的衣服」
    x0, y0, x1, y1 = R['top']; kraft(d, R['top'], vertical=False); my = (y0 + y1) // 2
    d.line((x0, my, x1, my), fill=(120, 88, 56), width=2); opp_tape(d, (x0, my - 24, x1, my + 24))
    hand(im, '冬天的衣服', (x0 + x1) // 2 + 6, my + 78, 46, ang=2.5, seed=3, stroke=1)
    # 朝走道的側面：一樣的字（小一點、斜一點）、通用圖示
    x0, y0, x1, y1 = R['side']; kraft(d, R['side']); hand(im, '冬天的衣服', x0 + 220, y0 + 86, 40, ang=-3.0, seed=5, stroke=1); icons(d, x1 - 128, y1 - 96, 54)
    d.line((x0, y0 + 3, x1, y0 + 3), fill=(150, 112, 72), width=3)                       # 上蓋的折線
    # 兩端：封箱膠帶從頂面往下包 9 cm（圖的上緣＝頂面那一邊）
    x0, y0, x1, y1 = R['end']; kraft(d, R['end']); mx = (x0 + x1) // 2; opp_tape(d, (mx - 24, y0, mx + 24, y0 + 90))
    d.polygon([(mx - 24, y0 + 90), (mx + 24, y0 + 90), (mx + 24, y0 + 96), (mx - 10, y0 + 100)], fill=(204, 168, 112))   # 斷口斜斜的
    d.line((x0, y0 + 3, x1, y0 + 3), fill=(150, 112, 72), width=3)
    kraft(d, R['plain'])
    # 壓平的紙箱：四片側板（中間三條折線）、上下蓋的折線、撕開的膠帶殘片、「冬天的衣服」倒著（其中一片）
    x0, y0, x1, y1 = R['flat']; kraft(d, R['flat']); W_ = x1 - x0; H_ = y1 - y0
    for t in (0.3, 0.5, 0.8): d.line((x0 + W_ * t, y0, x0 + W_ * t, y1), fill=(140, 104, 66), width=3)
    for t in (0.22, 0.78): d.line((x0, y0 + H_ * t, x1, y0 + H_ * t), fill=(150, 112, 72), width=2)
    for (a, b) in ((0.05, 0.2), (0.55, 0.72)): opp_tape(d, (int(x0 + W_ * a), int(y0 + H_ * 0.2), int(x0 + W_ * b), int(y0 + H_ * 0.26)))
    hand(im, '冬天的衣服', x0 + W_ * 0.4, y0 + H_ * 0.5, 34, ang=180 + 2, seed=3); icons(d, x0 + W_ * 0.62, y0 + H_ * 0.62, 40)
    # 紙膠帶三種：沒字（其他段）、中間那段寫「國界」（ev_kai_tape2 以前）、寫「法律系免簽」（以後）——AA 2026-10-21 定（BB_218：原本的「法律系可以無條件入境」字太小，玩家看不出來）
    # 字放到最大（佔滿膠帶寬度）、麥克筆粗一點；字頭＝圖的上緣＝阿凱那一邊
    washi(d, R['tape']); washi(d, R['tape_mid']); washi(d, R['tape_text'])
    x0, y0, x1, y1 = R['tape_mid']; hand(im, '國界', (x0 + x1) // 2, (y0 + y1) // 2 - 3, 31, ang=0.6, seed=11, stroke=1, gap=1.1, wob=4)   # 字的墨跡比圖層中心低約 4 px（字畫在 2s 方框的 (s/2, s/2)）：往上 4 px 才不會貼到膠帶下緣
    x0, y0, x1, y1 = R['tape_text']; hand(im, '法律系免簽', (x0 + x1) // 2, (y0 + y1) // 2 - 3, 31, ang=0.4, seed=1, stroke=1, gap=1.04, wob=4)   # seed 12 的「律」「系」中間空了一格（字距 −4、+2、−3、+1 px），seed 1 是 −1、0、0、0；「簽」原本超出膠帶下緣 2 px
    im.save(ATLAS); return im


draw_atlas()


def uvr(key):
    x0, y0, x1, y1 = R[key]; return (x0 / AW, 1 - y1 / AH, x1 / AW, 1 - y0 / AH)   # Blender UV（v 往上）


class TMesh(Mesh):
    """貼圖集的網格：每個面指定貼圖集裡的一塊（四個角＝圖的左下、右下、右上、左上）"""
    def __init__(self, name, mat):
        super().__init__(name, mat); self.uv = self.bm.loops.layers.uv.new('UVMap')

    def q(self, pts, key, sub=None):
        u0, v0, u1, v1 = uvr(key)
        if sub: a, b, c, e = sub; u0, v0, u1, v1 = u0 + (u1 - u0) * a, v0 + (v1 - v0) * b, u0 + (u1 - u0) * c, v0 + (v1 - v0) * e
        f = self.bm.faces.new([self.bm.verts.new(g2b(*p)) for p in pts])
        for lp, uv in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[self.uv].uv = uv
        return f

    def finish(self, parent=None, props=None, uv=False, smooth=False, merge=False):
        return super().finish(parent, props, uv=False, smooth=smooth, merge=merge)


def rot(p, c, a):
    """點繞 (cx, cz) 轉 a（俯視逆時針）"""
    x, y, z = p; dx, dz = x - c[0], z - c[1]; ca, sa = math.cos(a), math.sin(a)
    return (c[0] + dx * ca + dz * sa, y, c[1] - dx * sa + dz * ca)


B.reset(texres=1024)
def print_mat():
    m = L.flat('y1_print', '#ffffff', rough=0.78); nt = m.node_tree; tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS)
    nt.links.new(tx.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color']); return m
M = {'print': print_mat()}
root = B.group('dorm_y1_items', props={'kind': 'dorm_y1_items'})
NOTE = {}


# ---------------- 1. 紙箱（祐廷 L2：左牆 x=−2.9，離牆 v → x=−2.9+v）----------------
P2 = U['L2']; ust = P2['stair_u'][0]; w0 = ust - 0.6; XW = -2.9
bz0, bz1 = w0 + 0.035, ust - 0.045                                  # 衣櫃門的寬度內（0.52 m）
bv0, bv1, bh = 0.62, 0.93, 0.34                                       # 離牆 0.62～0.93（衣櫃前面、床板底下）、高 0.34
X0b, X1b = XW + bv0, XW + bv1; cz = (bz0 + bz1) / 2; C = ((X0b + X1b) / 2, cz); A = math.radians(-3.5)   # 推進去的時候歪了一點
g = B.group('Y1_BOX_WINTER', root, {'kind': 'y1_box', 'state': 'closed'}); t = TMesh('Y1_box_winter', M['print'])
R_ = lambda pts: [rot(p, C, A) for p in pts]
xm, dome = (X0b + X1b) / 2, 0.009                                     # 上蓋：兩片在中間接縫，塞太滿、接縫鼓起來一點
t.q(R_([(X1b, bh, bz1), (X1b, bh, bz0), (xm, bh + dome, bz0), (xm, bh + dome, bz1)]), 'top', (0, 0, 1, 0.5))   # 朝走道那一片（圖的下半）
t.q(R_([(xm, bh + dome, bz1), (xm, bh + dome, bz0), (X0b, bh, bz0), (X0b, bh, bz1)]), 'top', (0, 0.5, 1, 1))
t.q(R_([(X1b, 0, bz1), (X1b, 0, bz0), (X1b, bh, bz0), (X1b, bh, bz1)]), 'side')                                  # 朝走道（+x）
t.q(R_([(X0b, 0, bz0), (X0b, 0, bz1), (X0b, bh, bz1), (X0b, bh, bz0)]), 'plain')                                 # 朝衣櫃
t.q(R_([(X1b, 0, bz0), (X0b, 0, bz0), (X0b, bh, bz0), (X1b, bh, bz0)]), 'end')                                   # 兩端（圖的上緣＝頂面）
t.q(R_([(X0b, 0, bz1), (X1b, 0, bz1), (X1b, bh, bz1), (X0b, bh, bz1)]), 'end')
for (za, zb) in ((bz0, bz0), (bz1, bz1)):                                                                       # 端面的上緣接到鼓起的接縫（小三角）
    f = t.bm.faces.new([t.bm.verts.new(g2b(*rot(p, C, A))) for p in ((X1b, bh, za), (xm, bh + dome, za), (X0b, bh, za))] if za == bz1 else [t.bm.verts.new(g2b(*rot(p, C, A))) for p in ((X0b, bh, za), (xm, bh + dome, za), (X1b, bh, za))])
    u0, v0, u1, v1 = uvr('plain')
    for lp, uv in zip(f.loops, ((u0, v0), (0.5 * (u0 + u1), v1), (u1, v0))): lp[t.uv].uv = uv
t.finish(g)
NOTE['Y1_BOX_WINTER'] = '封好的紙箱：8/29 起、BOX_WINTER_OPEN 以前（衣櫃前、床板底下，在 L2 床桌組裡面，導航本來就擋著）'

# 壓平的紙箱（BB_218 2026-10-21：原本在書桌底下的牆邊，被書桌下的深藍色物品整個擋住，玩家看不到）→ 靠在衣櫃門前（原本封好的紙箱那個位置、床板底下＝「塞回床底下」），
# 朝走道那一面看得到；在 L2 床桌組裡面（導航本來就擋著）。XW 換成衣櫃門面（離牆 0.585），寬度照衣櫃門（0.56 m）
XW = -2.9 + 0.585; fz0, fz1 = w0 + 0.02, ust - 0.02; fh = 0.62; vb, vt = 0.13, 0.03                    # 底邊離衣櫃門 13 cm、上緣靠在門上
g = B.group('Y1_BOX_FOLDED', root, {'kind': 'y1_box', 'state': 'folded'}); t = TMesh('Y1_box_folded', M['print'])
th = 0.008
t.q([(XW + vb, 0.0, fz1), (XW + vb, 0.0, fz0), (XW + vt, fh, fz0), (XW + vt, fh, fz1)], 'flat')              # 朝走道那一面
t.q([(XW + vb - th, 0.0, fz0), (XW + vb - th, 0.0, fz1), (XW + vt - th, fh, fz1), (XW + vt - th, fh, fz0)], 'plain')
for (za, zb, s) in ((fz0, fz0, 1), (fz1, fz1, -1)):
    t.q([(XW + vb - th, 0.0, za), (XW + vb, 0.0, za), (XW + vt, fh, za), (XW + vt - th, fh, za)][::s], 'plain', (0, 0, 0.1, 1))
t.q([(XW + vt - th, fh, fz0), (XW + vt - th, fh, fz1), (XW + vt, fh, fz1), (XW + vt, fh, fz0)], 'plain', (0, 0, 1, 0.1))
t.finish(g)
NOTE['Y1_BOX_FOLDED'] = '拆了以後：壓平的紙箱靠在衣櫃門前、床板底下（原本封好的紙箱那個位置；BOX_WINTER_OPEN；寒流那天才拆的也一樣）'

# ---------------- 2. 阿凱的國界（R2：右牆 x=2.9，離牆 v → x=2.9−v）----------------
P = U['R2']; ua, ub = P['u']; XR = 2.9; TW = 0.048; VF = 1.38   # 膠帶寬 4.8 cm（一般封箱膠帶；原本 3 cm 的紙膠帶，字看不出來）   # 走道那一條在拖鞋（離牆 1.05～1.31）外面
TY0, TY1 = 0.0015, 0.0022                                             # 貼在地上（地板 y=0）；接頭重疊的那一段高 0.7 mm
def tape_piece(tm, a, b, key='tape', y=TY0, cut=(0.0, 0.0)):
    """一段膠帶：中心線 a→b（遊戲座標 (x, z)）、寬 TW；cut＝兩端斷口斜的程度（公尺）"""
    dx, dz = b[0] - a[0], b[1] - a[1]; Ln = math.hypot(dx, dz); dx, dz = dx / Ln, dz / Ln; nx, nz = dz, -dx   # n＝(d.z, −d.x)：法線朝上、字頭朝 n
    h = TW / 2
    p00 = (a[0] - nx * h + dx * cut[0], y, a[1] - nz * h + dz * cut[0]); p10 = (b[0] - nx * h, y, b[1] - nz * h)
    p11 = (b[0] + nx * h - dx * cut[1], y, b[1] + nz * h - dz * cut[1]); p01 = (a[0] + nx * h, y, a[1] + nz * h)
    tm.q([p00, p10, p11, p01], key)
def run(tm, a, b, pieces, skip=None, flip=False):
    """一條直線分成幾段撕下來貼：每段角度差一點、接頭重疊 2～4 cm，交替高低（重疊處不疊面）"""
    dx, dz = b[0] - a[0], b[1] - a[1]; Ln = math.hypot(dx, dz); s = 0.0; out = []
    for i, f in enumerate(pieces):
        e = min(Ln, s + f * Ln + (0.03 if i < len(pieces) - 1 else 0.0)); ang = rng.uniform(-0.006, 0.006); off = rng.uniform(-0.003, 0.003)
        pa = (a[0] + dx * s / Ln - dz / Ln * off, a[1] + dz * s / Ln + dx / Ln * off); ln = e - s
        pb = (pa[0] + (dx * math.cos(ang) - dz * math.sin(ang)) / Ln * ln, pa[1] + (dz * math.cos(ang) + dx * math.sin(ang)) / Ln * ln)
        out.append((pa, pb, TY1 if (i % 2) != flip else TY0)); s = e - 0.03
    for i, (pa, pb, y) in enumerate(out):
        if skip is not None and i == skip: continue
        tape_piece(tm, pa, pb, y=y, cut=(rng.uniform(-0.012, 0.012), rng.uniform(-0.012, 0.012)))
    return out
xf, xw = XR - VF, XR - 0.02                                          # 走道那一條、牆邊
z0_, z1_ = ua + 0.015, ub - 0.035                                    # 床頭那一端（和 R1 的交界）、床尾那一端（洗手間的牆前）
g = B.group('Y1_KAI_TAPE', root, {'kind': 'kai_tape'}); t = TMesh('Y1_kai_tape', M['print'])
LF = z1_ - z0_; MID = 0.6; fa = (LF - MID) / 2 / LF                  # 走道那一條：三段，中間那段 0.6 m（貼圖的長寬比）
front = run(t, (xf, z0_ - 0.012), (xf, z1_ + 0.012), [fa, MID / LF, fa], skip=1)
run(t, (xf + 0.012, z0_), (xw, z0_), [0.55, 0.45], flip=True)         # 兩端：從走道那一條回到牆邊（大半在床桌組底下，看得到的是走道那一頭）；轉角壓在走道那一條上面（高低交替，不疊面）
run(t, (xf + 0.012, z1_), (xw, z1_), [0.5, 0.5], flip=True)
t.finish(g)
pa, pb, y = front[1]
for nm, key in (('Y1_KAI_TAPE_MID', 'tape_mid'), ('Y1_KAI_TAPE_TEXT', 'tape_text')):
    g = B.group(nm, root, {'kind': 'kai_tape', 'part': 'mid'}); t = TMesh(nm + '_m', M['print']); tape_piece(t, pa, pb, key=key, y=y, cut=(0.008, -0.006)); t.finish(g)
NOTE['Y1_KAI_TAPE'] = '阿凱的國界（KAI_TAPE 以後；R2 床桌組外面一圈，走道那一條離牆 1.38 m）'
NOTE['Y1_KAI_TAPE_MID'] = '走道那一條中間那一段：寫「國界」兩個大字（ev_kai_tape2 以前；AA 2026-10-21）'
NOTE['Y1_KAI_TAPE_TEXT'] = '同一段寫「法律系免簽」五個大字（ev_kai_tape2 以後；AA 2026-10-21）；和 MID 只顯示一個'

# ---------------- 匯出 ----------------
for m in bpy.data.materials:
    if m.name == 'y1_print': m.use_backface_culling = False
tris = {}
for ob in bpy.data.objects:
    if ob.type == 'MESH':
        p = ob.parent.name if ob.parent else ''; tris[p] = tris.get(p, 0) + sum(len(q.vertices) - 2 for q in ob.data.polygons)
st = L.export(OUT, gpu_instances=False)
L.write_json(OUT.replace('.glb', '.json'), {
    'glb': os.path.relpath(OUT, L.ROOT), 'zone': 'dorm（大一 203：四人房 dorm_room4，祐廷 L2、阿凱 R2）', 'layout': LAY['version'], 'tris': tris, 'tris_total': sum(tris.values()), 'bytes': st['bytes'],
    'nodes': NOTE, 'box_spot_game': [round(P2['seat_approach'][0], 3), round(cz, 3)], 'texture': 'tools/blender/env_second/textures/gen/dorm_y1_print.png（本作，PIL 畫的；手寫字 WenQuanYi Zen Hei 點陣圖）',
    'materials': ['y1_print']})
print('dorm_y1 tris', tris, st)
