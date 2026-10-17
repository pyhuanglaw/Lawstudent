"""地方法院刑事法庭的道具組 → GLB。LAWWW2-C 2026-10-17。
來由：使用者 2026-10-17「刪除模擬法庭」「整個劇情都刪掉」，接著「模擬法庭做的東西，你可以留給可能某一堂課需要去法院旁聽，你就做成真的法院」；
AA-C AA_252：大四下「法律專題研究」第 6 週，全班去地方法院旁聽一場刑事審理（2D 底圖：法院走廊、法庭旁聽席）。
原本的模擬法庭道具（183aa717 moot_court_props.py：法官桌＋桌裙、計時牌、布條、分工表）改成真的法庭：
  CT_BENCH       法檯：高起的平台（0.45 m）＋整面木作的檯面（前緣 1.30 m 高、檯面 1.21 m），三位法官的螢幕、麥克風、桌牌「法官」「審判長」「法官」。
                 原點＝平台正面的中央地面；坐的人在 −z 那一側、面向 +z（旁聽席）
  CT_CHAIR_HIGH  法官的黑色高背椅（椅背高約 1.2 m），坐的人面向 +z
  CT_CHAIR       辦公椅（黑、中背、扶手、五爪腳），書記官、通譯、兩造坐的，面向 +z
  CT_CLERK       書記官席 1.8 × 0.7 m：正面木作擋板、螢幕兩台、鍵盤、印表機、卷宗、桌牌「書記官」；坐的人在 −z 那一側、面向 +z
  CT_INTERP      通譯席 1.2 × 0.6 m：桌牌「通譯」、麥克風
  CT_TABLE_PROS  檢察官席 2.0 × 0.65 m：正面木作擋板、桌牌「檢察官」、螢幕（看筆錄）、麥克風、卷宗（牛皮紙封面、綁繩）
  CT_TABLE_DEF   辯護人與被告席 3.0 × 0.65 m：桌牌「辯護人」「被告」（被告坐在辯護人旁邊）、各一台螢幕、麥克風、卷宗、六法全書
  CT_STAND       應訊台 0.7 × 0.5 × 1.05 m（桌面微斜）＋麥克風；站的人在 +z 那一側、面向 −z（法檯）
  CT_RAIL        欄杆（法庭和旁聽席的分隔）4.0 m：木作矮牆（0.9 m）＋扶手；CT_GATE 中間的小門 0.9 m（兩根門柱＋半開的門扇）
  CT_PEW         旁聽席長椅 3.4 m（木頭座板、靠背，五個人坐），坐的人面向 −z（法檯）
  CT_WAIT_SEATS  走廊的候審連排椅（四人座、鋼板沖孔、橫樑＋兩組腳），坐的人面向 +z
台灣的法庭沒有法槌，所以沒有法槌；不放國徽、法院名、案號、校名（D77、AA_252）；桌牌的字用文泉驛正黑畫進一張貼圖。
席位照公開資料（法務部／司法院的說明、法律百科）：從旁聽席看，檢察官多半在右邊、辯護人和被告在左邊（各法院不一定，例如有的地院相反）；
書記官、通譯在法檯前面的低處；應訊台在中間、面向法檯；欄杆隔開旁聽席。
  /opt/blenv/bin/python tools/blender/env_second/court_props.py [-- --out assets/models/env/second_ai/court_props.glb]
每件一個頂層節點（原點＝底部中央地面），GLB 裡的位置只是排開給人看；建議的擺法（一間 9 × 11 m 的小法庭）寫在同名 .json 的 layout，
2D 背景 bg_courthouse.py 照同一份擺。"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/court_props.glb')
GEN = os.path.join(HERE, 'textures', 'gen'); os.makedirs(GEN, exist_ok=True)
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
B.reset(texres=512)
rng = np.random.default_rng(601)

# ---------------- 貼圖集（1024²，左上原點）：桌牌、卷宗、螢幕 ----------------
N = 1024
atlas = Image.new('RGB', (N, N), (236, 234, 228)); dr = ImageDraw.Draw(atlas)
R = {}          # 名稱 → (x0, y0, x1, y1) 像素
def font(sz): return ImageFont.truetype(FONT, sz)
def text_box(name, rect, txt, bg, fg, sz, border=None):
    x0, y0, x1, y1 = rect; dr.rectangle(rect, fill=bg)
    if border: dr.rectangle((x0 + 5, y0 + 5, x1 - 5, y1 - 5), outline=border, width=2)
    f = font(sz); w = dr.textlength(txt, font=f); bb = f.getbbox(txt); h = bb[3] - bb[1]
    dr.text(((x0 + x1 - w) / 2, (y0 + y1 - h) / 2 - bb[1]), txt, font=f, fill=fg); R[name] = rect
# 桌牌（壓克力底座＋白底黑字，25 × 8 cm → 250 × 80 px）
PLATES = ('審判長', '法官', '書記官', '通譯', '檢察官', '辯護人', '被告')
y = 0
for k, t in enumerate(PLATES):
    text_box('plate_%d' % k, (0, y, 250, y + 80), t, (250, 250, 248), (22, 22, 24), 46 if len(t) <= 2 else 40, border=(150, 150, 150)); y += 82
R['plate_back'] = (0, y, 250, y + 80); dr.rectangle(R['plate_back'], fill=(232, 232, 230)); y += 82
# 卷宗：牛皮紙封面＋白色標籤（看不清楚的字）＋綁繩；側邊（紙疊）
def folder(name, rect, seed):
    r_ = np.random.default_rng(seed); x0, y0, x1, y1 = rect; R[name] = rect
    dr.rectangle(rect, fill=(186, 150, 104))
    for k in range(40):                                                               # 牛皮紙的纖維
        yy = r_.uniform(y0, y1); dr.line((x0, yy, x1, yy + r_.uniform(-3, 3)), fill=(176 + int(r_.uniform(-8, 8)), 140, 96), width=1)
    dr.rectangle((x0 + 30, y0 + 24, x1 - 30, y0 + 70), fill=(246, 244, 236))
    for k in range(2): dr.line((x0 + 40, y0 + 38 + k * 14, x0 + 40 + r_.uniform(40, x1 - x0 - 90), y0 + 38 + k * 14), fill=(90, 90, 96), width=3)
    xm = (x0 + x1) / 2; dr.line((xm, y0, xm, y1), fill=(236, 232, 220), width=4)       # 綁繩
folder('folder_a', (260, 0, 460, 260), 1); folder('folder_b', (464, 0, 664, 260), 2)
R['pages'] = (668, 0, 868, 60)
for k in range(30): dr.line((668, k * 2, 868, k * 2), fill=(250, 250, 246) if k % 3 else (214, 212, 204))
# 螢幕（筆錄的畫面：深底、淺色的行）
R['screen'] = (260, 270, 560, 470); dr.rectangle(R['screen'], fill=(26, 34, 46))
dr.rectangle((260, 270, 560, 292), fill=(52, 72, 104))
for k in range(12): dr.line((276, 304 + k * 13, 276 + rng.uniform(120, 270), 304 + k * 13), fill=(196, 206, 220), width=3)
# 六法全書封面
text_box('code_book', (580, 270, 720, 470), '六法全書', (122, 30, 34), (232, 210, 150), 26)
# 單色格子
for nm, col, xx in (('white', (246, 246, 242), 740), ('dark', (28, 28, 30), 784), ('grey_plastic', (96, 98, 102), 828), ('beige', (214, 206, 190), 872),
                    ('paper', (250, 250, 247), 916), ('kraft_edge', (200, 170, 126), 960)):
    R[nm] = (xx, 270, xx + 40, 310); dr.rectangle(R[nm], fill=col)
atlas_path = os.path.join(GEN, 'court_props_atlas.png'); atlas.save(atlas_path)

def atlas_mat(name, rough=0.6):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; bs = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(atlas_path, check_existing=True); tx.interpolation = 'Linear'
    nt.links.new(tx.outputs['Color'], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = rough
    return m
MA = atlas_mat('ct_atlas')
M = {'wood': L.pbr('ct_wood', 'walnut_veneer', maps=('diff', 'rough'), tile=1.2, target='#6e4b32'),        # 法檯、擋板、欄杆：中深色木作
     'wood_l': L.pbr('ct_wood_light', 'wood_table_001', maps=('diff', 'rough'), tile=1.0, target='#a47a52'),  # 桌面、長椅
     'wood_p': L.pbr('ct_wood_pew', 'walnut_veneer', maps=('diff', 'rough'), tile=1.6, target='#8a6444'),       # 旁聽席長椅（第一版用 wood_table_001：近景紋路太粗，像合板）
     'leather': L.pbr('ct_leather', 'fabric_leather_02', maps=('diff', 'nor'), tile=0.5, target='#1c1c1e'),
     'mesh': L.flat('ct_mesh', '#26272a', rough=0.85),                                                           # 辦公椅的網布
     'metal': L.flat('ct_metal', '#2a2b2e', rough=0.35, metal=0.4), 'steel': L.flat('ct_steel', '#a9acb0', rough=0.35, metal=0.45),
     'perf': L.flat('ct_perf', '#8d9296', rough=0.4, metal=0.45),                                                # 候審椅的沖孔鋼板（灰銀）
     'plastic': L.flat('ct_plastic', '#1e1f22', rough=0.45), 'acrylic': L.flat('ct_acrylic', '#e8eef0', rough=0.08, alpha=0.35)}

# ---------------- 有 UV 的方塊（字、紙）：front＝哪一面放 atlas 的哪一格；其他面放 other ----------------
def _uv(rect):
    x0, y0, x1, y1 = rect; return (x0 / N, 1 - y1 / N, x1 / N, 1 - y0 / N)      # (u0, v0, u1, v1)，v 往上
class AMesh:
    """atlas 材質的網格：quad 指定四個角（遊戲座標，逆時針、從外面看）與 atlas 的格子"""
    def __init__(self, name): self.name = name; self.bm = bmesh.new(); self.uv = self.bm.loops.layers.uv.new()
    def quad(self, pts, rect, flip=False, rot=False):
        u0, v0, u1, v1 = _uv(rect); vs = [self.bm.verts.new(g2b(*p)) for p in pts]; f = self.bm.faces.new(vs)
        uvs = [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]
        if flip: uvs = [(u1, v0), (u0, v0), (u0, v1), (u1, v1)]
        if rot: uvs = uvs[2:] + uvs[:2]           # 轉 180°：平放在桌上、給坐在 −z 那一側的人讀
        for lp, t in zip(f.loops, uvs): lp[self.uv].uv = t
        return self
    def box(self, x0, x1, y0, y1, z0, z1, front=None, other='white', top=None, top_rot=False):
        F = lambda r: front if (r == 'front' and front) else (top if (r == 'top' and top) else other)
        self.quad([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], R[F('front')])        # +z
        self.quad([(x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0)], R[other])             # −z
        self.quad([(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)], R[F('top')], rot=top_rot)          # +y
        self.quad([(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], R[other])             # −y
        self.quad([(x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1)], R[other])             # +x
        self.quad([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], R[other])             # −x
        return self
    def finish(self, parent):
        self.bm.normal_update(); return B.mesh_obj(self.name, self.bm, MA, parent)

# ---------------- 零件 ----------------
def panel_front(m, x0, x1, y0, y1, z, n=None, inset=0.012, frame=0.06):
    """木作擋板的正面（朝 +z）：外框＋一格一格凹進去的板（台灣法庭常見的框板木作）"""
    n = n or max(1, int(round((x1 - x0) / 0.75)))
    m.box(x0, x1, y0, y1, z - 0.03, z)                                                # 底板
    for k in range(n + 1):                                                            # 直的框
        xx = x0 + (x1 - x0) * k / n; m.rbox(max(x0, xx - frame / 2), min(x1, xx + frame / 2), y0, y1, z, z + inset, r=0.004, seg=1)
    for yy in (y0, y1 - frame): m.rbox(x0, x1, yy, yy + frame, z, z + inset, r=0.004, seg=1)   # 上下的框
    m.rbox(x0, x1, y0, y0 + 0.08, z, z + inset + 0.006, r=0.004, seg=1)              # 踢腳

def desk(g, name, w, d, h=0.76, front_panel=True):
    """法庭的桌子：檯面（淺木）＋兩側板＋正面擋板（木作框板，到地）；坐的人在 −z 那一側、擋板在 +z"""
    t = Mesh(name + '_top', M['wood_l']); t.rbox(-w / 2 - 0.02, w / 2 + 0.02, h - 0.035, h, -d / 2, d / 2 + 0.03, r=0.01); t.finish(parent=g)
    m = Mesh(name + '_body', M['wood'])
    for sx in (-1, 1): m.box(sx * w / 2 - 0.025, sx * w / 2 + 0.025, 0.0, h - 0.035, -d / 2 + 0.02, d / 2)
    if front_panel: panel_front(m, -w / 2, w / 2, 0.0, h - 0.035, d / 2, n=max(1, int(round(w / 0.9))))
    m.finish(parent=g)

def nameplate(a, x, y, z, k):
    """三角立牌 25 × 8 cm：正面朝 +z（給對面的人看），背面淺灰"""
    w, h, dz = 0.25, 0.08, 0.035
    a.quad([(x - w / 2, y, z + dz), (x + w / 2, y, z + dz), (x + w / 2, y + h, z), (x - w / 2, y + h, z)], R['plate_%d' % k])
    a.quad([(x + w / 2, y, z - dz), (x - w / 2, y, z - dz), (x - w / 2, y + h, z), (x + w / 2, y + h, z)], R['plate_back'])

def mic(g, name, x, y, z, toward=1.0):
    m = Mesh(name, M['metal']); m.cyl((x, y, z), (x, y + 0.02, z), 0.06, seg=16)       # 底座 Ø12 cm
    P = [(x, y + 0.02, z), (x, y + 0.20, z - 0.02 * toward), (x, y + 0.34, z + 0.06 * toward), (x, y + 0.38, z + 0.14 * toward)]
    for a_, b_ in zip(P[:-1], P[1:]): m.cyl(a_, b_, 0.006, seg=8)
    m.cyl(P[-1], (x, y + 0.385, z + 0.19 * toward), 0.012, seg=10, r2=0.014)
    m.finish(parent=g, smooth=True)

def monitor(g, a, name, x, y, z, w=0.50, h=0.31, face=-1.0):
    """液晶螢幕（筆錄）：畫面朝 face（−1＝朝 −z 坐的人）；黑框、細腳、底座"""
    m = Mesh(name, M['plastic']); zc = z; t = 0.025
    m.rbox(x - w / 2, x + w / 2, y + 0.11, y + 0.11 + h, zc - t / 2, zc + t / 2, r=0.006, seg=1)
    m.box(x - 0.02, x + 0.02, y + 0.01, y + 0.16, zc - face * 0.03, zc - face * 0.01)
    m.rbox(x - 0.10, x + 0.10, y, y + 0.012, zc - 0.08, zc + 0.08, r=0.004, seg=1)
    m.finish(parent=g)
    zs = zc + face * (t / 2 + 0.001); x0, x1 = x - w / 2 + 0.012, x + w / 2 - 0.012; y0, y1 = y + 0.11 + 0.012, y + 0.11 + h - 0.012
    if face < 0: a.quad([(x1, y0, zs), (x0, y0, zs), (x0, y1, zs), (x1, y1, zs)], R['screen'])
    else: a.quad([(x0, y0, zs), (x1, y0, zs), (x1, y1, zs), (x0, y1, zs)], R['screen'])

def files(a, x, y, z, n=2, seed=0):
    """卷宗一疊（A4 直放、每本厚 3～6 cm，牛皮紙封面朝上、給坐的人讀）"""
    r_ = np.random.default_rng(seed); yy = y
    for k in range(n):
        th = float(r_.uniform(0.03, 0.06)); dx = float(r_.uniform(-0.015, 0.015))
        a.box(x - 0.11 + dx, x + 0.11 + dx, yy, yy + th, z - 0.16, z + 0.16, top='folder_a' if k % 2 == 0 else 'folder_b', top_rot=True, other='pages')
        yy += th

GROUPS = []
def item(name):
    g = B.group(name); GROUPS.append(g); return g

# ---------------- 法檯 ----------------
BW, BD, BH = 6.4, 1.9, 0.45          # 平台寬、深、高
g = item('CT_BENCH')
pl = Mesh('CT_BENCH_platform', M['wood']); pl.box(-BW / 2, BW / 2, 0.0, BH, -BD, 0.0); pl.finish(parent=g)
carpet = Mesh('CT_BENCH_carpet', L.flat('ct_bench_carpet', '#3c4552', rough=0.95)); carpet.box(-BW / 2 + 0.02, BW / 2 - 0.02, BH, BH + 0.006, -BD + 0.02, -0.72); carpet.finish(parent=g)
fr = Mesh('CT_BENCH_front', M['wood']); TOP = BH + 0.76; FH = 1.30
panel_front(fr, -BW / 2, BW / 2, 0.0, FH, 0.0, n=8, frame=0.08, inset=0.016)
fr.rbox(-BW / 2 - 0.04, BW / 2 + 0.04, FH - 0.04, FH, -0.70, 0.05, r=0.012)               # 前緣的壓條（檯面外框）
for sx in (-1, 1): fr.box(sx * BW / 2 - 0.04, sx * BW / 2, 0.0, FH, -0.72, 0.0)        # 兩側板
fr.finish(parent=g)
tp = Mesh('CT_BENCH_desk', M['wood_l']); tp.box(-BW / 2, BW / 2, TOP - 0.03, TOP, -0.70, -0.04); tp.finish(parent=g)   # 法官的桌面（比前緣低 9 cm）
a = AMesh('CT_BENCH_items')
for k, (x, pk) in enumerate(((-2.0, 1), (0.0, 0), (2.0, 1))):
    nameplate(a, x - 0.05, TOP, -0.16, pk)                                               # 桌牌（前緣擋著，只看得到上半）
    monitor(g, a, 'CT_BENCH_mon%d' % k, x + 0.62, TOP, -0.36, w=0.44, h=0.27, face=-1.0)   # 螢幕在旁邊（第一版在正前方：從旁聽席看椅背和螢幕並排，像兩台螢幕）
    mic(g, 'CT_BENCH_mic%d' % k, x + 0.25, TOP, -0.25, toward=-1.0)
    files(a, x - 0.70, TOP, -0.40, n=2 if k != 1 else 3, seed=10 + k)
a.finish(g)

# ---------------- 椅子 ----------------
g = item('CT_CHAIR_HIGH')
c = Mesh('CT_CHAIR_HIGH_seat', M['leather']); c.rbox(-0.26, 0.26, 0.44, 0.53, -0.25, 0.25, r=0.04)
c.ell((0, 0.90, -0.255), 0.27, 0.36, 0.065, seg=24, rings=12)                    # 椅背：上緣圓的高背（第一版是方板，從旁聽席看像一台螢幕）
c.rbox(-0.22, 0.22, 0.53, 0.80, -0.31, -0.22, r=0.04)                             # 腰靠
for sx in (-1, 1): c.rbox(sx * 0.28 - 0.03, sx * 0.28 + 0.03, 0.62, 0.68, -0.20, 0.14, r=0.02)
c.finish(parent=g)
def star_base(g, name, h):
    b_ = Mesh(name, M['metal']); b_.cyl((0, 0.10, 0), (0, h, 0), 0.025, seg=10)
    for k in range(5):
        t = 2 * math.pi * k / 5; ex, ez = 0.30 * math.sin(t), 0.30 * math.cos(t)
        b_.cyl((0, 0.07, 0), (ex, 0.05, ez), 0.018, seg=8); b_.sphere((ex, 0.03, ez), 0.025, seg=8, rings=4)
    for sx in (-1, 1): b_.box(sx * 0.27 - 0.012, sx * 0.27 + 0.012, 0.50, 0.62, 0.02, 0.06)
    b_.finish(parent=g, smooth=True)
star_base(g, 'CT_CHAIR_HIGH_base', 0.44)
g = item('CT_CHAIR')
c = Mesh('CT_CHAIR_seat', M['leather']); c.rbox(-0.24, 0.24, 0.43, 0.50, -0.23, 0.23, r=0.03); c.finish(parent=g)
c = Mesh('CT_CHAIR_back', M['mesh']); c.rbox(-0.22, 0.22, 0.58, 0.98, -0.28, -0.25, r=0.03); c.finish(parent=g)
c = Mesh('CT_CHAIR_arm', M['plastic'])
for sx in (-1, 1): c.rbox(sx * 0.27 - 0.025, sx * 0.27 + 0.025, 0.62, 0.66, -0.18, 0.10, r=0.012)
c.box(-0.015, 0.015, 0.50, 0.60, -0.27, -0.24); c.finish(parent=g)
star_base(g, 'CT_CHAIR_base', 0.43)

# ---------------- 書記官席、通譯席 ----------------
g = item('CT_CLERK'); desk(g, 'CT_CLERK_t', 1.8, 0.70)
a = AMesh('CT_CLERK_items'); nameplate(a, 0.55, 0.76, 0.24, 2)
monitor(g, a, 'CT_CLERK_mon0', -0.40, 0.76, -0.05, face=-1.0); monitor(g, a, 'CT_CLERK_mon1', 0.15, 0.76, -0.05, face=-1.0)
a.box(-0.32, 0.12, 0.76, 0.785, -0.30, -0.16, top='dark', other='dark')                              # 鍵盤
k_ = Mesh('CT_CLERK_printer', L.flat('ct_printer', '#d9d8d4', rough=0.5)); k_.rbox(0.48, 0.86, 0.76, 0.98, -0.30, 0.06, r=0.02); k_.finish(parent=g)
files(a, -0.72, 0.76, -0.12, n=3, seed=21); a.finish(g)
mic(g, 'CT_CLERK_mic', 0.30, 0.76, -0.14, toward=-1.0)
g = item('CT_INTERP'); desk(g, 'CT_INTERP_t', 1.2, 0.60)
a = AMesh('CT_INTERP_items'); nameplate(a, 0.30, 0.76, 0.20, 3)
a.quad([(-0.35, 0.762, 0.05), (-0.14, 0.762, 0.05), (-0.14, 0.762, -0.25), (-0.35, 0.762, -0.25)], R['paper'], rot=True); a.finish(g)
mic(g, 'CT_INTERP_mic', 0.0, 0.76, -0.10, toward=-1.0)

# ---------------- 兩造的席位 ----------------
for nm, w, seats in (('CT_TABLE_PROS', 2.0, ((0.0, 4),)), ('CT_TABLE_DEF', 3.0, ((-0.70, 5), (0.80, 6)))):
    g = item(nm); desk(g, nm + '_t', w, 0.65)
    a = AMesh(nm + '_items')
    for k, (x, pk) in enumerate(seats):
        nameplate(a, x + 0.30, 0.76, 0.22, pk)
        monitor(g, a, '%s_mon%d' % (nm, k), x - 0.30, 0.76, 0.02, w=0.42, h=0.27, face=-1.0)
        mic(g, '%s_mic%d' % (nm, k), x + 0.05, 0.76, -0.06, toward=-1.0)
        if pk != 6: files(a, x - 0.75, 0.76, -0.12, n=3 if pk == 4 else 2, seed=30 + k)
    if nm == 'CT_TABLE_DEF':
        a.box(-0.28, -0.13, 0.76, 0.82, -0.27, -0.06, top='code_book', top_rot=True, other='kraft_edge')   # 辯護人的六法全書
        a.quad([(0.50, 0.762, -0.04), (0.71, 0.762, -0.04), (0.71, 0.762, -0.30), (0.50, 0.762, -0.30)], R['paper'], rot=True)   # 被告面前一張紙
    else:
        a.quad([(0.30, 0.762, -0.04), (0.51, 0.762, -0.04), (0.51, 0.762, -0.30), (0.30, 0.762, -0.30)], R['paper'], rot=True)
    a.finish(g)

# ---------------- 應訊台 ----------------
g = item('CT_STAND')
pd = Mesh('CT_STAND_body', M['wood']); pd.rbox(-0.33, 0.33, 0.0, 0.98, -0.23, 0.23, r=0.012)
bmT = bmesh.new()
for (x, y_, z) in ((-0.36, 0.98, 0.26), (0.36, 0.98, 0.26), (0.36, 1.06, -0.26), (-0.36, 1.06, -0.26)): bmT.verts.new(g2b(x, y_, z))
bmT.faces.new(bmT.verts); pd.add_bm(bmT); bmT.free()
pd.box(-0.36, 0.36, 0.98, 1.005, 0.255, 0.27); pd.finish(parent=g)
fp = Mesh('CT_STAND_panel', M['wood']); panel_front(fp, -0.30, 0.30, 0.06, 0.92, -0.232, n=1, frame=0.05); fp.finish(parent=g)   # 朝法檯那面的框板
mic(g, 'CT_STAND_mic', 0.0, 1.03, -0.14, toward=1.0)

# ---------------- 欄杆、小門 ----------------
def rail(g, name, x0, x1):
    m = Mesh(name, M['wood']); panel_front(m, x0, x1, 0.0, 0.84, 0.03, n=max(1, int(round((x1 - x0) / 0.9))), frame=0.06)
    m.box(x0, x1, 0.0, 0.84, -0.03, 0.0)
    t = Mesh(name + '_cap', M['wood_l']); t.rbox(x0 - 0.01, x1 + 0.01, 0.84, 0.90, -0.06, 0.06, r=0.015); t.finish(parent=g)
    m.finish(parent=g)
g = item('CT_RAIL'); rail(g, 'CT_RAIL_body', -2.0, 2.0)
g = item('CT_GATE')
po = Mesh('CT_GATE_posts', M['wood'])
for sx in (-1, 1): po.rbox(sx * 0.45 - 0.05, sx * 0.45 + 0.05, 0.0, 0.98, -0.05, 0.05, r=0.01); po.rbox(sx * 0.45 - 0.065, sx * 0.45 + 0.065, 0.98, 1.02, -0.065, 0.065, r=0.01)
po.finish(parent=g)
dl = Mesh('CT_GATE_door', M['wood'])                                                  # 門扇：關著（法庭裡的人進出才開）
panel_front(dl, -0.39, 0.39, 0.10, 0.80, 0.015, n=1, frame=0.05); dl.box(-0.39, 0.39, 0.10, 0.80, -0.015, 0.0)
dl.finish(parent=g)
Mesh('CT_GATE_cap', M['wood_l']).rbox(-0.40, 0.40, 0.80, 0.84, -0.035, 0.035, r=0.01).finish(parent=g)

# ---------------- 旁聽席長椅 ----------------
g = item('CT_PEW'); PW = 3.4
s = Mesh('CT_PEW_wood', M['wood_p'])
s.rbox(-PW / 2, PW / 2, 0.42, 0.46, -0.22, 0.20, r=0.012)                              # 座板（坐的人面向 −z：座板前緣在 −z）
for k in range(3): s.rbox(-PW / 2, PW / 2, 0.58 + k * 0.14, 0.68 + k * 0.14, 0.23 + k * 0.02, 0.255 + k * 0.02, r=0.01)   # 靠背三片橫板（往後仰）
s.finish(parent=g)
f = Mesh('CT_PEW_frame', M['wood'])
for xx in (-PW / 2 + 0.04, 0.0, PW / 2 - 0.04):
    f.box(xx - 0.03, xx + 0.03, 0.0, 0.42, -0.18, -0.12); f.box(xx - 0.03, xx + 0.03, 0.0, 0.96, 0.18, 0.24)              # 前腳、後腳（後腳往上接靠背）
    f.box(xx - 0.03, xx + 0.03, 0.36, 0.42, -0.20, 0.22)
for sx in (-1, 1): f.rbox(sx * PW / 2 - 0.03, sx * PW / 2 + 0.03, 0.42, 0.66, -0.20, 0.22, r=0.01)                         # 扶手側板
f.finish(parent=g)

# ---------------- 走廊的候審連排椅 ----------------
g = item('CT_WAIT_SEATS'); SW = 0.56
p = Mesh('CT_WAIT_SEATS_shell', M['perf'])
for k in range(4):
    x = (k - 1.5) * SW
    p.rbox(x - 0.25, x + 0.25, 0.43, 0.46, -0.24, 0.20, r=0.015)                         # 座（坐的人面向 +z）
    bmb = bmesh.new()                                                                 # 靠背（往後仰的板）
    for (xx, yy, zz) in ((x - 0.24, 0.50, -0.24), (x + 0.24, 0.50, -0.24), (x + 0.24, 0.86, -0.30), (x - 0.24, 0.86, -0.30)): bmb.verts.new(g2b(xx, yy, zz))
    bmb.faces.new(bmb.verts); bmesh.ops.solidify(bmb, geom=list(bmb.faces), thickness=0.012); p.add_bm(bmb); bmb.free()
p.finish(parent=g)
fr = Mesh('CT_WAIT_SEATS_frame', M['metal'])
fr.box(-2 * SW, 2 * SW, 0.36, 0.40, -0.06, 0.02)                                      # 橫樑
for sx in (-1, 1):
    x = sx * (1.5 * SW); fr.box(x - 0.03, x + 0.03, 0.0, 0.38, -0.04, 0.0); fr.box(x - 0.03, x + 0.03, 0.0, 0.02, -0.30, 0.26)
for k in range(5):
    x = (k - 2) * SW; fr.rbox(x - 0.02, x + 0.02, 0.40, 0.62, -0.24, 0.10, r=0.008)  # 扶手
for k in range(4):
    x = (k - 1.5) * SW; fr.box(x - 0.02, x + 0.02, 0.40, 0.50, -0.25, -0.21)          # 靠背的支撐
fr.finish(parent=g)

# 排開給人看
SPREAD = {'CT_BENCH': (0.0, 0.0, -1.0), 'CT_CHAIR_HIGH': (-2.0, BH, -1.6), 'CT_CLERK': (-2.0, 0.0, 0.6), 'CT_INTERP': (1.4, 0.0, 0.6),
          'CT_TABLE_PROS': (3.6, 0.0, 2.2), 'CT_TABLE_DEF': (-3.0, 0.0, 2.2), 'CT_STAND': (0.6, 0.0, 2.2), 'CT_CHAIR': (-3.0, 0.0, 1.5),
          'CT_RAIL': (-2.0, 0.0, 4.0), 'CT_GATE': (0.4, 0.0, 4.0), 'CT_PEW': (-1.2, 0.0, 5.4), 'CT_WAIT_SEATS': (3.4, 0.0, 5.4)}
for gg in GROUPS: gg.location = g2b(*SPREAD[gg.name])
# 建議擺法：一間 9 × 11 m 的小法庭（x −4.5～4.5、z −6.0（法檯那面牆）～+5.0（後門）），從旁聽席看法檯在前面（−z）
# ry＝繞 y 轉（0＝正面朝 +z）；兩造的桌子轉 ±90°，彼此相對、和法檯垂直
LAYOUT = {'room': {'x0': -4.5, 'x1': 4.5, 'z0': -6.0, 'z1': 5.0, 'h': 3.5},
          'CT_BENCH': {'x': 0.0, 'z': -4.1, 'ry': 0.0},
          'CT_CHAIR_HIGH': [{'x': -2.0, 'y': BH, 'z': -5.1, 'ry': 0.0}, {'x': 0.0, 'y': BH, 'z': -5.1, 'ry': 0.0}, {'x': 2.0, 'y': BH, 'z': -5.1, 'ry': 0.0}],
          'CT_CLERK': {'x': -1.6, 'z': -3.1, 'ry': 0.0, 'note': '書記官：法檯前、偏左'},
          'CT_INTERP': {'x': 1.7, 'z': -3.1, 'ry': 0.0, 'note': '通譯：法檯前、偏右'},
          'CT_TABLE_DEF': {'x': -3.35, 'z': -1.6, 'ry': 1.5708, 'note': '辯護人＋被告：從旁聽席看在左邊，坐的人面向東（中間）'},
          'CT_TABLE_PROS': {'x': 3.35, 'z': -1.9, 'ry': -1.5708, 'note': '檢察官：從旁聽席看在右邊，坐的人面向西；各法院不一定，有的相反'},
          'CT_STAND': {'x': 0.0, 'z': -1.2, 'ry': 0.0, 'note': '應訊台：站的人在 +z 那側、面向法檯；後面一張椅子（被告、證人坐，背對旁聽席）'},
          'CT_CHAIR': '書記官、通譯各 1（z −3.7、面向 +z）；檢察官 1、辯護人＋被告 2（坐在桌子靠牆那一側）；應訊台後面 1（面向 −z）',
          'CT_RAIL': [{'x': -2.5, 'z': 0.6, 'ry': 0.0}, {'x': 2.5, 'z': 0.6, 'ry': 0.0}], 'CT_GATE': {'x': 0.0, 'z': 0.6, 'ry': 0.0},
          'CT_PEW': [{'x': sx * 2.45, 'z': 1.7 + 1.05 * r, 'ry': 0.0} for r in range(3) for sx in (-1, 1)],
          'CT_WAIT_SEATS': '法庭外的走廊，靠牆一排一排'}
st = L.export(OUT, gpu_instances=False)
st['layout'] = LAYOUT; st['items'] = [gg.name for gg in GROUPS]
L.write_json(OUT.replace('.glb', '.json'), st)
print(json.dumps({'items': st['items'], 'tris': st.get('tris'), 'bytes': st.get('bytes')}, ensure_ascii=False))
