"""SCN-V3-03 模擬法庭的道具組（大二下模 5，5/1；霖澤館 201 擺成法庭）→ GLB。LAWWW2-C 2026-10-17。
規格：AA-C 的 docs/story_planning/AA_246_模擬法庭道具清單.md（分支 magical-albattani，3e5d8e04）——擺法、19 項道具、尺寸、顏色、字。
  /opt/blenv/bin/python tools/blender/env_second/moot_court_props.py [-- --out assets/models/env/second_ai/moot_court_props.glb]
每件一個頂層節點（原點＝底部中央地面、正面朝 +z＝朝旁聽席／坐的人看的方向在各件說明），GLB 裡的位置只是排開給人看；
建議的擺放位置（201 的室內座標，AA_246 §1）寫在同名 .json 的 layout（LAWWW 決定實際擺法）：
  MC_JUDGE_BENCH   法官席：三張 1.5 m 深色木桌連成一排（4.5 m）＋深藍桌裙（正面、兩側）＋桌牌「審判長」「評審」×2＋鵝頸麥克風＋卷宗、水瓶×3。正面（桌裙）朝 +z
  MC_DAIS          （可選）20 cm 木平台 4.8 × 1.2 m，前緣收邊；法官桌、高背椅放在上面（y＋0.20）
  MC_CHAIR_HIGH    法官的黑色仿皮高背椅（椅背高約 1.1 m），坐的人面向 +z
  MC_CHAIR_FOLD    灰色折疊椅（書記官、計時員、兩造），坐的人面向 +z
  MC_TABLE_DEF     被告（賣方，祐廷組）席：1.8 × 0.6 m 木桌＋桌牌「被告訴訟代理人」＋麥克風＋卷宗（側邊「被告」）＋書狀「民事答辯狀」＋六法全書（紅）
                   ＋水瓶、紙杯＋以安組的分工表（螢光筆分區）＋證物照片兩張（「證物一」「證物二」）。坐的人在 −z 那一側、面向 +z（桌牌正面朝 +z）
  MC_TABLE_PLA     原告（買方，芯慈組）席：同上，桌牌「原告訴訟代理人」、卷宗「原告」、書狀「民事起訴狀」、六法全書（深藍）、芯慈組的分工表（顏色多、格子整齊，比以安組的漂亮）
  MC_CLERK         書記官桌 1.2 × 0.6 m：桌牌「書記官」、筆電、一疊紙
  MC_TIMER         計時桌 0.9 × 0.5 m：桌牌「計時」、白色電子計時器、計時牌（黃「剩餘兩分鐘」、紅「時間到」，A3）
  MC_PODIUM        發言台 0.6 × 0.45 × 1.1 m（桌面微斜、淺木色、正面「發言台」）＋鵝頸麥克風。站的人在 −z 那一側、面向 −z（面對法官席）
  MC_BANNER        （可選）布條 3 × 0.6 m 白底藍字「模擬法庭　民事庭」，原點＝布條上緣中央（掛在黑板上緣）
不放校名、校徽、系名、年份、出版社、品牌（D77）；台灣的法庭不用法槌，所以沒有法槌（AA_246 §2）。字用文泉驛正黑畫進一張貼圖。"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/moot_court_props.glb')
GEN = os.path.join(HERE, 'textures', 'gen'); os.makedirs(GEN, exist_ok=True)
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
B.reset(texres=512)
rng = np.random.default_rng(501)

# ---------------- 貼圖集（1024²，左上原點）：字、紙、照片、計時牌 ----------------
N = 1024
atlas = Image.new('RGB', (N, N), (236, 234, 228)); dr = ImageDraw.Draw(atlas)
R = {}          # 名稱 → (x0, y0, x1, y1) 像素
def font(sz): return ImageFont.truetype(FONT, sz)
def text_box(name, rect, txt, bg, fg, sz, border=None):
    x0, y0, x1, y1 = rect; dr.rectangle(rect, fill=bg)
    if border: dr.rectangle((x0 + 4, y0 + 4, x1 - 4, y1 - 4), outline=border, width=3)
    f = font(sz); w = dr.textlength(txt, font=f); bb = f.getbbox(txt); h = bb[3] - bb[1]
    dr.text(((x0 + x1 - w) / 2, (y0 + y1 - h) / 2 - bb[1]), txt, font=f, fill=fg); R[name] = rect
# 桌牌（25 × 8 cm → 250 × 80 px）
y = 0
for k, t in enumerate(('審判長', '評審', '書記官', '原告訴訟代理人', '被告訴訟代理人', '計時')):
    text_box('plate_%d' % k, (0, y, 250, y + 80), t, (250, 250, 248), (24, 24, 26), 44 if len(t) <= 3 else 30, border=(40, 40, 44)); y += 82
R['plate_back'] = (0, y, 250, y + 80); dr.rectangle(R['plate_back'], fill=(250, 250, 248)); y += 82
# 計時牌（A3 → 280 × 196）
text_box('card_2min', (260, 0, 540, 196), '剩餘兩分鐘', (240, 200, 40), (20, 20, 20), 46)
text_box('card_end', (260, 200, 540, 396), '時間到', (196, 36, 36), (250, 250, 250), 64)
# 發言台正面、布條、六法全書封面、卷宗側標
text_box('podium', (560, 0, 1024, 120), '發言台', (214, 190, 150), (60, 44, 30), 64)
text_box('banner', (560, 130, 1024, 222), '模擬法庭　民事庭', (250, 250, 250), (30, 60, 140), 52)
text_box('code_red', (260, 400, 400, 600), '六法全書', (150, 30, 34), (236, 214, 150), 26)
text_box('code_navy', (404, 400, 544, 600), '六法全書', (30, 40, 80), (236, 214, 150), 26)
text_box('lab_def', (560, 230, 700, 270), '被告', (250, 250, 248), (20, 20, 20), 28)
text_box('lab_pla', (704, 230, 844, 270), '原告', (250, 250, 248), (20, 20, 20), 28)
# 書狀第一頁（A4 210 × 297 → 150 × 212）：標題＋看不清楚的內文
for name, t, x0 in (('doc_def', '民事答辯狀', 560), ('doc_pla', '民事起訴狀', 716)):
    rect = (x0, 280, x0 + 150, 492); dr.rectangle(rect, fill=(250, 250, 247)); R[name] = rect
    f = font(20); w = dr.textlength(t, font=f); dr.text((x0 + (150 - w) / 2, 292), t, font=f, fill=(20, 20, 20))
    for k in range(16):
        yy = 330 + k * 9; ln = rng.uniform(0.55, 0.95) * 126
        dr.line((x0 + 12, yy, x0 + 12 + ln, yy), fill=(150, 150, 150), width=2)
# 分工表：以安組（螢光筆分區、手寫感）、芯慈組（很多顏色、格子整齊）
def worksheet(name, rect, neat):
    x0, y0, x1, y1 = rect; dr.rectangle(rect, fill=(251, 251, 248)); R[name] = rect
    cols = [(255, 236, 120), (170, 230, 200), (250, 190, 210), (180, 210, 250), (250, 210, 160), (210, 190, 240)]
    if neat:
        for r_ in range(6):
            for c_ in range(3):
                xa = x0 + 10 + c_ * (x1 - x0 - 20) / 3; ya = y0 + 26 + r_ * (y1 - y0 - 36) / 6
                dr.rectangle((xa + 2, ya + 2, xa + (x1 - x0 - 20) / 3 - 2, ya + (y1 - y0 - 36) / 6 - 2), fill=cols[(r_ + c_) % 6], outline=(120, 120, 130), width=1)
                for k in range(2): dr.line((xa + 8, ya + 10 + k * 8, xa + 8 + rng.uniform(20, 36), ya + 10 + k * 8), fill=(80, 80, 90), width=2)
        dr.rectangle((x0 + 10, y0 + 6, x1 - 10, y0 + 20), fill=(90, 110, 170))
    else:
        for r_ in range(5):
            ya = y0 + 20 + r_ * (y1 - y0 - 30) / 5; c = cols[r_ % 3]
            dr.rectangle((x0 + 10, ya, x0 + 10 + rng.uniform(40, 90), ya + 12), fill=c)
            for k in range(3): dr.line((x0 + 12, ya + 18 + k * 7, x0 + 12 + rng.uniform(60, 120), ya + 18 + k * 7 + rng.uniform(-1, 1)), fill=(70, 70, 80), width=2)
worksheet('sheet_def', (560, 500, 710, 712), False)
worksheet('sheet_pla', (716, 500, 866, 712), True)
# 證物照片（二手機車：灰色街景＋機車剪影）＋「證物一」「證物二」貼紙
def photo(name, rect, label, seed):
    r_ = np.random.default_rng(seed); x0, y0, x1, y1 = rect; R[name] = rect
    dr.rectangle(rect, fill=(240, 240, 238)); ix0, iy0, ix1, iy1 = x0 + 6, y0 + 6, x1 - 6, y1 - 26
    for k in range(iy1 - iy0):
        t = k / (iy1 - iy0); c = tuple(int(v) for v in (np.array([150, 160, 170]) * (1 - t) + np.array([110, 108, 104]) * t))
        dr.line((ix0, iy0 + k, ix1, iy0 + k), fill=c)
    cx = (ix0 + ix1) / 2 + r_.uniform(-10, 10); cy = iy1 - 18; s = (ix1 - ix0) / 160
    col = tuple(int(v) for v in r_.choice([[200, 200, 196], [40, 70, 120], [180, 60, 50]]))
    dr.ellipse((cx - 52 * s, cy - 16 * s, cx - 20 * s, cy + 16 * s), fill=(30, 30, 30)); dr.ellipse((cx + 24 * s, cy - 16 * s, cx + 56 * s, cy + 16 * s), fill=(30, 30, 30))
    dr.polygon([(cx - 44 * s, cy - 6 * s), (cx - 20 * s, cy - 40 * s), (cx + 10 * s, cy - 40 * s), (cx + 30 * s, cy - 20 * s), (cx + 50 * s, cy - 8 * s), (cx + 20 * s, cy + 2 * s), (cx - 30 * s, cy + 2 * s)], fill=col)
    dr.rectangle((cx - 24 * s, cy - 52 * s, cx - 12 * s, cy - 40 * s), fill=(40, 40, 40))
    f = font(16); dr.rectangle((x0 + 6, y1 - 22, x0 + 70, y1 - 4), fill=(255, 240, 140)); dr.text((x0 + 10, y1 - 22), label, font=f, fill=(20, 20, 20))
photo('photo_1', (872, 500, 1020, 600), '證物一', 1); photo('photo_2', (872, 604, 1020, 704), '證物二', 2)
# 計時器螢幕、筆電螢幕
text_box('timer', (560, 720, 700, 790), '02:00', (24, 28, 26), (120, 250, 150), 44)
dr.rectangle((704, 720, 900, 840), fill=(40, 48, 60)); R['laptop'] = (704, 720, 900, 840)
for k in range(8): dr.line((716, 734 + k * 12, 716 + rng.uniform(80, 170), 734 + k * 12), fill=(180, 190, 200), width=3)
R['paper'] = (560, 800, 700, 900); dr.rectangle(R['paper'], fill=(250, 250, 247))
R['white'] = (260, 620, 300, 660); dr.rectangle(R['white'], fill=(246, 246, 242))
R['dark'] = (304, 620, 344, 660); dr.rectangle(R['dark'], fill=(30, 30, 32))
R['blue_folder'] = (348, 620, 388, 660); dr.rectangle(R['blue_folder'], fill=(40, 80, 150))
R['black_folder'] = (392, 620, 432, 660); dr.rectangle(R['black_folder'], fill=(28, 28, 30))
R['yellow'] = (436, 620, 476, 660); dr.rectangle(R['yellow'], fill=(240, 200, 40))
R['red'] = (480, 620, 520, 660); dr.rectangle(R['red'], fill=(196, 36, 36))
atlas_path = os.path.join(GEN, 'moot_court_atlas.png'); atlas.save(atlas_path)

def atlas_mat(name, rough=0.6):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; bs = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(atlas_path, check_existing=True); tx.interpolation = 'Linear'
    nt.links.new(tx.outputs['Color'], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = rough
    return m
MA = atlas_mat('mc_atlas')
M = {'wood': L.pbr('mc_wood', 'walnut_veneer', maps=('diff', 'rough'), tile=1.2, target='#4a3426'),       # 深色木紋桌（同 201 的長桌）
     'wood_l': L.pbr('mc_wood_light', 'wood_table_001', maps=('diff', 'rough'), tile=1.0, target='#b89468'),   # 發言台、平台（第二版：fine_grained_wood 的紋太粗，像合板）
     'skirt': L.flat('mc_skirt', '#23305a', rough=0.95),                                                        # 深藍桌裙
     'leather': L.pbr('mc_leather', 'fabric_leather_02', maps=('diff', 'nor'), tile=0.5, target='#1c1c1e'),
     'metal': L.flat('mc_metal', '#2a2b2e', rough=0.35, metal=0.4), 'steel': L.flat('mc_steel', '#a9acb0', rough=0.35, metal=0.45),
     'grey': L.flat('mc_grey', '#6f7276', rough=0.6), 'glass': L.flat('mc_bottle', '#dfe8ee', rough=0.08, alpha=0.45),
     'cup': L.flat('mc_cup', '#f2efe8', rough=0.7), 'plastic': L.flat('mc_plastic', '#e8e6e0', rough=0.5)}

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

# ---------------- 道具 ----------------
def table(g, name, w, d, h=0.75, mat='wood'):
    m = Mesh(name + '_top', M[mat]); m.rbox(-w / 2, w / 2, h - 0.03, h, -d / 2, d / 2, r=0.008)
    for sx in (-1, 1):                                                               # 兩側的板腳＋橫桿（教室長桌）
        m.box(sx * (w / 2 - 0.06) - 0.02, sx * (w / 2 - 0.06) + 0.02, 0.0, h - 0.03, -d / 2 + 0.05, d / 2 - 0.05)
    m.box(-w / 2 + 0.08, w / 2 - 0.08, h - 0.12, h - 0.03, -d / 2 + 0.06, -d / 2 + 0.08)   # 擋板（坐的那側的對面）
    m.finish(parent=g)

def nameplate(a, x, y, z, k, yaw_back=False):
    """三角立牌 25 × 8 cm：正面朝 +z（給對面的人看），背面白"""
    w, h, dz = 0.25, 0.08, 0.035
    a.quad([(x - w / 2, y, z + dz), (x + w / 2, y, z + dz), (x + w / 2, y + h, z), (x - w / 2, y + h, z)], R['plate_%d' % k])
    a.quad([(x + w / 2, y, z - dz), (x - w / 2, y, z - dz), (x - w / 2, y + h, z), (x + w / 2, y + h, z)], R['plate_back'])

def mic(g, name, x, y, z, toward=1.0):
    m = Mesh(name, M['metal']); m.cyl((x, y, z), (x, y + 0.02, z), 0.06, seg=16)       # 底座 Ø12 cm
    P = [(x, y + 0.02, z), (x, y + 0.20, z - 0.02 * toward), (x, y + 0.34, z + 0.06 * toward), (x, y + 0.38, z + 0.14 * toward)]
    for a_, b_ in zip(P[:-1], P[1:]): m.cyl(a_, b_, 0.006, seg=8)
    m.cyl(P[-1], (x, y + 0.385, z + 0.19 * toward), 0.012, seg=10, r2=0.014)
    m.finish(parent=g, smooth=True)

def bottle_cup(g, name, x, y, z):
    Mesh(name + '_bottle', M['glass']).cyl((x, y, z), (x, y + 0.20, z), 0.032, seg=14).cyl((x, y + 0.20, z), (x, y + 0.235, z), 0.032, seg=14, r2=0.013).finish(parent=g, smooth=True)
    Mesh(name + '_cap', M['grey']).cyl((x, y + 0.235, z), (x, y + 0.25, z), 0.014, seg=10).finish(parent=g)
    Mesh(name + '_cup', M['cup']).cyl((x + 0.09, y, z + 0.02), (x + 0.09, y + 0.09, z + 0.02), 0.026, seg=14, r2=0.036, caps=True).finish(parent=g, smooth=True)

def desk_set(g, name, a, cx, y, cz, side, sheet, doc, code, n_folder=3):
    """一席桌上的東西（坐的人在 −z 那一側、桌面 y）：卷宗、書狀、六法全書、分工表、證物照片（被告席）"""
    for k in range(n_folder):                                                         # 卷宗夾（A4、厚 4 cm、側邊貼「原告」「被告」）：疊在桌子左邊
        x0 = cx - 0.62; yy = y + k * 0.042
        a.box(x0 - 0.15, x0 + 0.15, yy, yy + 0.040, cz - 0.11, cz + 0.11, front='lab_' + side, other='blue_folder' if k % 2 == 0 else 'black_folder')
    a.quad([(cx - 0.32, y + 0.002, cz + 0.05), (cx - 0.11, y + 0.002, cz + 0.05), (cx - 0.11, y + 0.002, cz - 0.25), (cx - 0.32, y + 0.002, cz - 0.25)], R[doc], rot=True)   # 書狀（攤開的第一頁）
    a.box(cx - 0.10, cx + 0.05, y, y + 0.06, cz - 0.20, cz + 0.01, top=code, top_rot=True, other='red' if code == 'code_red' else 'black_folder')     # 六法全書（平放、封面朝上）
    a.quad([(cx + 0.08, y + 0.002, cz - 0.02), (cx + 0.29, y + 0.002, cz - 0.02), (cx + 0.29, y + 0.002, cz - 0.30), (cx + 0.08, y + 0.002, cz - 0.30)], R[sheet], rot=True)   # 分工表
    if side == 'def':                                                                 # 證物照片兩張（夾在卷宗外：斜放在卷宗旁）
        a.quad([(cx - 0.44, y + 0.003, cz + 0.16), (cx - 0.29, y + 0.003, cz + 0.16), (cx - 0.29, y + 0.003, cz + 0.06), (cx - 0.44, y + 0.003, cz + 0.06)], R['photo_1'], rot=True)
        a.quad([(cx - 0.40, y + 0.004, cz + 0.27), (cx - 0.25, y + 0.004, cz + 0.27), (cx - 0.25, y + 0.004, cz + 0.17), (cx - 0.40, y + 0.004, cz + 0.17)], R['photo_2'], rot=True)

GROUPS = []
def item(name):
    g = B.group(name); GROUPS.append(g); return g

# 法官席：三張桌連成一排＋桌裙（正面、兩側，離地 3 cm）
g = item('MC_JUDGE_BENCH')
m = Mesh('MC_JUDGE_BENCH_top', M['wood']); m.rbox(-2.25, 2.25, 0.72, 0.75, -0.30, 0.30, r=0.008); m.finish(parent=g)
sk = Mesh('MC_JUDGE_BENCH_skirt', M['skirt'])
NF = 90
for i in range(NF):                                                                  # 正面的桌裙：細褶（正弦）
    x0, x1 = -2.28 + 4.56 * i / NF, -2.28 + 4.56 * (i + 1) / NF
    z0 = 0.315 + 0.006 * math.sin(i * 1.3); z1 = 0.315 + 0.006 * math.sin((i + 1) * 1.3)
    sk.quad([(x0, 0.03, z0), (x1, 0.03, z1), (x1, 0.745, z1), (x0, 0.745, z0)])
for sx in (-1, 1):
    sk.box(sx * 2.28 - 0.003, sx * 2.28 + 0.003, 0.03, 0.745, -0.30, 0.315)
sk.finish(parent=g)
a = AMesh('MC_JUDGE_BENCH_items')
for k, (x, pk) in enumerate(((0.0, 0), (-1.5, 1), (1.5, 1))):
    nameplate(a, x, 0.75, 0.18, pk)
    for j in range(2): a.box(x - 0.36 - 0.15, x - 0.36 + 0.15, 0.75 + j * 0.04, 0.75 + j * 0.04 + 0.038, -0.13, 0.09, front='lab_pla' if j else 'lab_def', other='black_folder')
    a.quad([(x + 0.10, 0.752, 0.02), (x + 0.31, 0.752, 0.02), (x + 0.31, 0.752, -0.28), (x + 0.10, 0.752, -0.28)], R['paper'])
a.finish(g)
mic(g, 'MC_JUDGE_BENCH_mic', 0.42, 0.75, 0.05, toward=-1.0)
for k, x in enumerate((0.55, -1.0, 2.0)): bottle_cup(g, 'MC_JUDGE_BENCH_w%d' % k, x, 0.75, -0.18)

# 平台（可選）
g = item('MC_DAIS')
Mesh('MC_DAIS_body', M['wood_l']).rbox(-2.4, 2.4, 0.0, 0.20, -0.6, 0.6, r=0.01).finish(parent=g)
Mesh('MC_DAIS_edge', M['metal']).box(-2.41, 2.41, 0.17, 0.20, 0.6, 0.615).finish(parent=g)

# 高背椅（法官）
g = item('MC_CHAIR_HIGH')
c = Mesh('MC_CHAIR_HIGH_seat', M['leather']); c.rbox(-0.25, 0.25, 0.44, 0.52, -0.24, 0.24, r=0.035); c.rbox(-0.24, 0.24, 0.52, 1.18, -0.30, -0.20, r=0.05)
for sx in (-1, 1): c.rbox(sx * 0.27 - 0.03, sx * 0.27 + 0.03, 0.60, 0.66, -0.20, 0.14, r=0.02)
c.finish(parent=g)
b_ = Mesh('MC_CHAIR_HIGH_base', M['metal']); b_.cyl((0, 0.10, 0), (0, 0.44, 0), 0.025, seg=10)
for k in range(5):
    t = 2 * math.pi * k / 5; ex, ez = 0.30 * math.sin(t), 0.30 * math.cos(t)
    b_.cyl((0, 0.07, 0), (ex, 0.05, ez), 0.018, seg=8); b_.sphere((ex, 0.03, ez), 0.025, seg=8, rings=4)
for sx in (-1, 1): b_.box(sx * 0.27 - 0.012, sx * 0.27 + 0.012, 0.50, 0.60, 0.02, 0.06)
b_.finish(parent=g, smooth=True)

# 折疊椅（灰）
g = item('MC_CHAIR_FOLD')
f_ = Mesh('MC_CHAIR_FOLD_frame', M['steel'])
for sx in (-1, 1):
    f_.cyl((sx * 0.21, 0.0, 0.20), (sx * 0.21, 0.92, -0.20), 0.011, seg=8)
    f_.cyl((sx * 0.21, 0.0, -0.22), (sx * 0.21, 0.45, 0.10), 0.011, seg=8)
f_.finish(parent=g, smooth=True)
p_ = Mesh('MC_CHAIR_FOLD_seat', M['grey']); p_.rbox(-0.22, 0.22, 0.44, 0.47, -0.20, 0.20, r=0.012); p_.rbox(-0.21, 0.21, 0.66, 0.88, -0.20, -0.17, r=0.012); p_.finish(parent=g)

# 兩造的席位
for nm, side, pk, sheet, doc, code in (('MC_TABLE_DEF', 'def', 4, 'sheet_def', 'doc_def', 'code_red'), ('MC_TABLE_PLA', 'pla', 3, 'sheet_pla', 'doc_pla', 'code_navy')):
    g = item(nm); table(g, nm + '_t', 1.8, 0.6)
    a = AMesh(nm + '_items'); nameplate(a, 0.0, 0.75, 0.20, pk); desk_set(g, nm, a, 0.0, 0.75, 0.0, side, sheet, doc, code); a.finish(g)
    mic(g, nm + '_mic', 0.42, 0.75, 0.05, toward=-1.0); bottle_cup(g, nm + '_w', 0.62, 0.75, -0.15)

# 書記官桌
g = item('MC_CLERK'); table(g, 'MC_CLERK_t', 1.2, 0.6)
a = AMesh('MC_CLERK_items'); nameplate(a, 0.35, 0.75, 0.20, 2)
a.box(-0.20, 0.14, 0.75, 0.765, -0.24, -0.02, top='dark', other='dark')                              # 筆電（鍵盤面）
a.quad([(-0.20, 0.765, -0.24), (0.14, 0.765, -0.24), (0.14, 0.99, -0.27), (-0.20, 0.99, -0.27)], R['laptop'], flip=True)   # 螢幕（朝坐的人：−z）
a.box(0.20, 0.41, 0.75, 0.77, -0.25, 0.05, top='paper', other='white'); a.finish(g)

# 計時桌
g = item('MC_TIMER'); table(g, 'MC_TIMER_t', 0.9, 0.5)
a = AMesh('MC_TIMER_items'); nameplate(a, -0.20, 0.75, 0.17, 5)
a.box(0.05, 0.15, 0.75, 0.82, -0.05, 0.02, front='timer', other='white')                             # 白色電子計時器，螢幕朝 +z（對外）
a.quad([(-0.42, 0.752, 0.05), (-0.14, 0.752, 0.05), (-0.14, 0.752, -0.15), (-0.42, 0.752, -0.15)], R['card_2min'], rot=True)   # 計時牌平放（給計時員讀）
a.quad([(0.14, 0.756, 0.04), (0.42, 0.756, 0.04), (0.42, 0.756, -0.16), (0.14, 0.756, -0.16)], R['card_end'], rot=True)
a.finish(g)

# 發言台：站的人在 +z 那一側、面向法官席（−z）；桌面往站的人那邊低；「發言台」貼在朝法官席的那面（−z），擋書的邊在站的人那側
g = item('MC_PODIUM')
pd = Mesh('MC_PODIUM_body', M['wood_l']); pd.rbox(-0.30, 0.30, 0.0, 1.02, -0.225, 0.225, r=0.012)
bmT = bmesh.new()
for (x, y, z) in ((-0.32, 1.02, 0.24), (0.32, 1.02, 0.24), (0.32, 1.10, -0.24), (-0.32, 1.10, -0.24)): bmT.verts.new(g2b(x, y, z))
bmT.faces.new(bmT.verts); pd.add_bm(bmT); bmT.free()
pd.box(-0.32, 0.32, 1.02, 1.045, 0.235, 0.25); pd.finish(parent=g)
a = AMesh('MC_PODIUM_label'); a.quad([(0.24, 0.62, -0.227), (-0.24, 0.62, -0.227), (-0.24, 0.80, -0.227), (0.24, 0.80, -0.227)], R['podium']); a.finish(g)
mic(g, 'MC_PODIUM_mic', 0.0, 1.07, -0.12, toward=1.0)

# 布條（原點＝上緣中央；正面 +z）
g = item('MC_BANNER')
a = AMesh('MC_BANNER_cloth'); NB = 12
for i in range(NB):
    x0, x1 = -1.5 + 3.0 * i / NB, -1.5 + 3.0 * (i + 1) / NB; u0, v0, u1, v1 = _uv(R['banner'])
    zz0 = 0.008 * math.sin(i * 0.9); zz1 = 0.008 * math.sin((i + 1) * 0.9)
    vs = [a.bm.verts.new(g2b(*p)) for p in ((x0, -0.6, zz0), (x1, -0.6, zz1), (x1, 0.0, zz1), (x0, 0.0, zz0))]; f = a.bm.faces.new(vs)
    for lp, t in zip(f.loops, ((u0 + (u1 - u0) * i / NB, v0), (u0 + (u1 - u0) * (i + 1) / NB, v0), (u0 + (u1 - u0) * (i + 1) / NB, v1), (u0 + (u1 - u0) * i / NB, v1))): lp[a.uv].uv = t
a.finish(g)

# 排開給人看
SPREAD = {'MC_JUDGE_BENCH': (0.0, 0.20, -2.0), 'MC_DAIS': (0.0, 0.0, -2.0), 'MC_CHAIR_HIGH': (-1.5, 0.20, -2.75), 'MC_CLERK': (-3.4, 0.0, -0.6),
          'MC_TIMER': (3.2, 0.0, -0.6), 'MC_PODIUM': (0.0, 0.0, 0.6), 'MC_TABLE_DEF': (-4.2, 0.0, 1.8), 'MC_TABLE_PLA': (2.6, 0.0, 1.8),
          'MC_CHAIR_FOLD': (-4.2, 0.0, 1.0), 'MC_BANNER': (0.0, 2.9, -3.2)}
for gg in GROUPS: gg.location = g2b(*SPREAD[gg.name])
# 建議擺法（AA_246 §1；201 的室內座標：x 東、z 南，-z 是黑板；ry＝繞 y 轉，0＝正面朝 +z）
LAYOUT = {'source': 'AA_246 §1（AA-C 3e5d8e04）；LAWWW 決定實際擺法',
          'MC_DAIS': {'x': -1.5, 'z': -8.0, 'ry': 0.0, 'optional': True},
          'MC_JUDGE_BENCH': {'x': -1.5, 'z': -8.0, 'ry': 0.0, 'y_if_dais': 0.20},
          'MC_CHAIR_HIGH': [{'x': -3.0, 'z': -8.55, 'ry': 0.0}, {'x': -1.5, 'z': -8.55, 'ry': 0.0}, {'x': 0.0, 'z': -8.55, 'ry': 0.0}],
          'MC_CLERK': {'x': -4.0, 'z': -7.0, 'ry': 0.0, 'note': '講桌（lectern x −3.2, z −6.0）移開'},
          'MC_TIMER': {'x': 2.5, 'z': -7.0, 'ry': 0.0},
          'MC_TABLE_DEF': {'x': -6.5, 'z': -6.2, 'ry': -1.5708, 'note': '被告（賣方，祐廷組）：西側、坐的人面向東'},
          'MC_TABLE_PLA': {'x': 4.0, 'z': -6.2, 'ry': 1.5708, 'note': '原告（買方，芯慈組）：東側、坐的人面向西'},
          'MC_PODIUM': {'x': -1.5, 'z': -5.4, 'ry': 0.0, 'note': '站的人面向法官席（−z）'},
          'MC_CHAIR_FOLD': '書記官、計時員各 1，兩造各 3（坐在桌子靠牆那一側）',
          'MC_BANNER': {'x': -1.5, 'y': 3.0, 'z': -8.65, 'ry': 0.0, 'optional': True}}
st = L.export(OUT, gpu_instances=False)
st['layout'] = LAYOUT; st['items'] = [gg.name for gg in GROUPS]
L.write_json(OUT.replace('.glb', '.json'), st)
print(json.dumps({'items': st['items'], 'tris': st.get('tris'), 'bytes': st.get('bytes')}, ensure_ascii=False))
