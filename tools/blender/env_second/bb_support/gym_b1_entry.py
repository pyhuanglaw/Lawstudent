"""ART-GYM-P2／P3a（LAWWW2-B 2026-10-16 HANDOFF d58dfec5 派工）新體育館 B1 健身中心的入口與周邊（BB_151 4b、BB_124 7-4；BB-B 支援製作）
  /opt/blenv/bin/python tools/blender/env_second/bb_support/gym_b1_entry.py [-- --out assets/models/env/second_ai/bb_support/gym_b1_entry.glb]

LAWWW2-B 的 B1（f3180c69）已經有鏡牆、橡膠地坪、水道繩、仰泳旗、出發台、扶梯；他寫還缺、等 BB-B 交的是服務櫃台、置物櫃、飲水機、救生員椅。
五件要用＋五件備用，每件一個頂層節點（原點＝底部中央、正面朝 +z；GLB 裡的位置只是排開給人看）：
  GYM2_COUNTER        服務櫃台：2.4 (x) × 0.75 (z) × 1.05 m；客人站 +z，櫃台人員在 −z；正面木條、檯面上刷卡機、報到平板、筆筒、一疊毛巾、背對客人的螢幕
  GYM2_LOCKERS        置物櫃：上下兩層 × 6 格＝12 格，1.8 × 0.45 × 1.05 m（含 0.1 m 底座）
  GYM2_WATER          飲水機：0.42 × 0.38 × 1.1 m；不鏽鋼
  GYM2_LIFEGUARD      救生員高椅：座面離地 1.6 m，前面一道梯子
  GYM2_SCALE          體重計（立柱式，**備用**）：0.4 × 0.5 × 1.45 m
  GYM2_TOWEL_BIN      毛巾回收籃（**備用**）：直徑 0.46、高 0.62 m
  GYM2_KICKBOARD_RACK 浮板架＋五塊浮板（**備用**，池邊）
  GYM2_MIRROR         鏡牆 3.0 × 2.0 m（**備用**：LAWWW2-B 的 B1 已經整面鏡牆）；鏡面是獨立網格 gymb2_mirror_pane
  GYM2_FLOOR          橡膠地墊拼塊 2 × 2 m（**備用**：B1 已經用橡膠地坪貼圖）
閘門不做：B1 已經有三道閘門。
兩個材質，和 P1 共用名字的規則：gymb2_metal（頂點色＋金屬 0.40）、gymb2_vc（頂點色）。
不放任何字、品牌、標誌（D77）。"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
PARENT = os.path.dirname(HERE)
sys.path.insert(0, PARENT)
import lib2 as L   # noqa: E402
from lib2 import B, g2b, bpy, bmesh   # noqa: E402
from mathutils import Matrix, Vector   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/bb_support/gym_b1_entry.glb'

# 顏色（sRGB）
LAMINATE = '#d9d4cb'   # 櫃台正面：淺色美耐板
TOP = '#4a4f55'        # 檯面：深灰
TRIM = '#2e3136'       # 深灰收邊
STEEL = '#b9bdc3'      # 不鏽鋼
STEEL2 = '#8f959c'     # 霧面不鏽鋼
SCREEN = '#0f1820'     # 螢幕、顯示面板
READER = '#202326'     # 刷卡機
TOWEL = '#eceae4'      # 毛巾（白）
TOWEL2 = '#9fb3c2'     # 毛巾（淺藍灰）
LOCKER = '#c3c8cc'     # 置物櫃本體
LDOOR = '#7f95a6'      # 置物櫃門
BIN = '#5a6068'        # 回收籃
RUB = '#222426'        # 橡膠地墊
RUB2 = '#2a2c2f'
MIRROR = '#8e99a3'
WOOD = '#7a6250'        # 櫃台正面的木條
ORANGE = '#d9772e'      # 救生員椅的座墊
FOAM_B = '#3d86c6'
FOAM_Y = '#e8c84a'
WHITE = '#e8e9e6'

B.reset(texres=256)
M_METAL = L.vc_metal('gymb2_metal', rough=0.42, metal=0.40)
M_VC = L.vc_material('gymb2_vc', rough=0.72)


class Part(L.CMesh):
    def _new(self, fn, col):
        before = set(self.bm.faces); fn(); return self.paint([f for f in self.bm.faces if f not in before], col)

    def tube(self, a, b, r, col, seg=10, caps=True):
        return self._new(lambda: self.cyl(a, b, r, seg=seg, caps=caps), col)

    def rb(self, x0, x1, y0, y1, z0, z1, col, r=0.012, seg=2):
        return self.crbox(x0, x1, y0, y1, z0, z1, col, r=r, seg=seg)

    def rb_rot(self, c, w, h, d, col, rx=0.0, ry=0.0, r=0.01, seg=2):
        bm = L.rbox_bm(w, h, d, r, seg)
        m = Matrix.Translation(g2b(*c)) @ Matrix.Rotation(ry, 4, 'Z') @ Matrix.Rotation(-rx, 4, 'X')
        return self._new(lambda: self.add_bm(bm, m), col)

    def lathe_at(self, prof, c, col, seg=16):
        bm = L.lathe(prof, seg)
        return self._new(lambda: self.add_bm(bm, Matrix.Translation(g2b(*c))), col)


ROOT = B.group('GYM_B1_ENTRY')
STATS = {}


PANE = None


def item(name, x_spread, build):
    global PANE
    g = B.group(name, ROOT); g.location = g2b(x_spread, 0, 0)
    pm, pv = Part(f'gymb2_{name.lower()}_metal', M_METAL), Part(f'gymb2_{name.lower()}_vc', M_VC)
    PANE = Part('gymb2_mirror_pane', M_METAL)
    build(pm, pv)
    tris = 0
    for p in (pm, pv, PANE):
        ob = p.finish(parent=g, uv=False, smooth=False, merge=True)
        if ob is None: continue
        L.smooth_mesh(ob, angle=0.6)
        tris += sum(len(f.vertices) - 2 for f in ob.data.polygons)
    STATS[name] = tris


def towel(v, x, y, z, w=0.30, d=0.22, h=0.05, col=TOWEL):
    v.rb(x - w / 2, x + w / 2, y, y + h, z - d / 2, z + d / 2, col, r=0.02, seg=2)


# ---------------- 服務櫃台 ----------------
def counter(m, v):
    W, D, H = 2.4, 0.75, 1.05
    v.rb(-W / 2, W / 2, 0.0, 0.08, -D / 2 + 0.05, D / 2 - 0.06, TRIM, r=0.01)                 # 踢腳
    v.rb(-W / 2, W / 2, 0.08, H - 0.04, D / 2 - 0.10, D / 2 - 0.04, LAMINATE, r=0.012)         # 正面板（客人那一面）
    for sx in (-1, 1):
        v.rb(sx * W / 2 - 0.03, sx * W / 2 + 0.03, 0.08, H - 0.04, -D / 2 + 0.05, D / 2 - 0.04, LAMINATE, r=0.012)   # 兩側板
    v.rb(-W / 2 - 0.02, W / 2 + 0.02, H - 0.04, H, -D / 2 + 0.02, D / 2 + 0.03, TOP, r=0.012)  # 檯面（往客人那邊多出 3 cm）
    v.rb(-W / 2 + 0.05, W / 2 - 0.05, 0.72, 0.75, -D / 2 + 0.05, D / 2 - 0.12, TOP, r=0.008)   # 裡面的工作檯（坐著的高度）
    for i in range(15):   # 正面的木條（客人那一面，下面留踢腳、上面留 6 cm）
        x0 = -W / 2 + 0.08 + i * (W - 0.16) / 15
        v.rb(x0, x0 + 0.07, 0.12, H - 0.10, D / 2 - 0.04, D / 2 - 0.015, WOOD, r=0.006, seg=1)
    # 刷卡機（客人那一側，右邊）
    m.tube((0.75, H, 0.18), (0.75, H + 0.10, 0.20), 0.012, STEEL2, seg=8)
    v.rb_rot((0.75, H + 0.13, 0.21), 0.10, 0.14, 0.03, READER, rx=-0.35, r=0.008)
    v.rb_rot((0.75, H + 0.135, 0.226), 0.07, 0.05, 0.004, SCREEN, rx=-0.35, r=0.002)
    # 報到用的平板（中間，立架，面向客人）、筆筒
    m.rb(-0.08, 0.08, H, H + 0.012, 0.10, 0.22, STEEL2, r=0.004, seg=1)
    v.rb_rot((0.0, H + 0.11, 0.17), 0.26, 0.18, 0.012, TRIM, rx=-0.45, r=0.008)
    v.rb_rot((0.0, H + 0.112, 0.177), 0.23, 0.15, 0.003, SCREEN, rx=-0.45, r=0.003)
    v.lathe_at([(0.0, 0.0), (0.035, 0.0), (0.035, 0.10), (0.03, 0.10), (0.03, 0.006), (0.0, 0.006)], (0.35, H, 0.12), TRIM, seg=12)
    for k, (dx, dz) in enumerate(((0.0, 0.0), (0.012, 0.01), (-0.01, 0.008))):
        m.tube((0.35 + dx, H + 0.02, 0.12 + dz), (0.35 + dx * 2, H + 0.15, 0.12 + dz * 2), 0.004, STEEL if k else READER, seg=6)
    # 一疊毛巾（左邊）
    for i, col in enumerate((TOWEL, TOWEL2, TOWEL, TOWEL2, TOWEL)):
        towel(v, -0.70 + (i % 2) * 0.01, H + i * 0.048, 0.05, col=col)
    # 螢幕（背對客人，給櫃台人員看）
    m.rb(-0.02, 0.06, 0.75, 0.76, -0.12, -0.02, STEEL2, r=0.004)
    m.tube((0.02, 0.76, -0.07), (0.02, 1.02, -0.07), 0.014, STEEL2, seg=8)
    v.rb_rot((0.02, 1.10, -0.06), 0.52, 0.32, 0.03, TRIM, rx=0.12, r=0.008)
    v.rb_rot((0.02, 1.10, -0.078), 0.48, 0.28, 0.004, SCREEN, rx=0.12, r=0.002)




# ---------------- 置物櫃 ----------------
def lockers(m, v):
    W, D = 1.8, 0.45
    v.rb(-W / 2, W / 2, 0.0, 0.10, -D / 2 + 0.02, D / 2 - 0.02, TRIM, r=0.008)               # 底座
    m.rb(-W / 2, W / 2, 0.10, 1.05, -D / 2, D / 2 - 0.02, LOCKER, r=0.008)                   # 本體
    cw = W / 6; ch = 0.47
    for r_ in range(2):
        for c in range(6):
            x0 = -W / 2 + c * cw + 0.012; x1 = x0 + cw - 0.024
            y0 = 0.115 + r_ * ch + 0.012; y1 = y0 + ch - 0.024
            m.rb(x0, x1, y0, y1, D / 2 - 0.02, D / 2, LDOOR, r=0.004, seg=1)                  # 門
            m.rb(x1 - 0.06, x1 - 0.035, (y0 + y1) / 2 - 0.05, (y0 + y1) / 2 + 0.05, D / 2, D / 2 + 0.015, STEEL, r=0.004, seg=1)  # 把手
            v.rb(x0 + 0.03, x0 + 0.08, y1 - 0.06, y1 - 0.035, D / 2, D / 2 + 0.002, LOCKER, r=0.002, seg=1)    # 號碼牌（空白）




# ---------------- 飲水機 ----------------
def water(m, v):
    m.rb(-0.21, 0.21, 0.0, 0.90, -0.19, 0.19, STEEL, r=0.02)
    m.rb(-0.20, 0.20, 0.90, 1.00, -0.18, 0.19, STEEL2, r=0.015)
    v.rb(-0.15, 0.15, 0.965, 1.001, -0.10, 0.14, TRIM, r=0.01)                                 # 水槽（深色）
    m.tube((-0.02, 1.00, -0.03), (-0.02, 1.07, 0.02), 0.012, STEEL, seg=8)                      # 出水口
    v.rb(0.12, 0.17, 0.80, 0.86, 0.19, 0.205, READER, r=0.008)                                 # 按鈕
    m.rb(-0.21, 0.21, 1.00, 1.10, -0.19, -0.14, STEEL2, r=0.01)                                # 後擋板


# ---------------- 救生員高椅 ----------------
def lifeguard(m, v):
    for sx in (-1, 1):
        m.tube((sx * 0.35, 0.0, -0.45), (sx * 0.28, 1.55, -0.20), 0.03, WHITE, seg=10)   # 後腳
        m.tube((sx * 0.35, 0.0, 0.45), (sx * 0.28, 1.55, 0.10), 0.03, WHITE, seg=10)     # 前腳
        m.tube((sx * 0.28, 1.55, -0.20), (sx * 0.28, 1.55, 0.10), 0.025, WHITE, seg=8)
        m.tube((sx * 0.28, 1.55, -0.20), (sx * 0.28, 2.05, -0.22), 0.02, WHITE, seg=8)   # 椅背的柱
        m.tube((sx * 0.28, 1.80, 0.10), (sx * 0.28, 1.80, -0.20), 0.018, WHITE, seg=8)   # 扶手
        m.tube((sx * 0.28, 1.55, 0.10), (sx * 0.28, 1.80, 0.10), 0.018, WHITE, seg=8)
    for i in range(5):   # 前面的梯子（兩前腳之間）
        y = 0.25 + i * 0.27; t = y / 1.55; z = 0.45 + (0.10 - 0.45) * t
        m.tube((-0.33 + 0.07 * t, y, z), (0.33 - 0.07 * t, y, z), 0.016, STEEL2, seg=8)
    v.rb(-0.30, 0.30, 1.55, 1.60, -0.22, 0.12, ORANGE, r=0.02)                       # 座墊
    v.rb(-0.30, 0.30, 1.70, 2.02, -0.25, -0.21, ORANGE, r=0.02)                      # 椅背
    m.rb(-0.36, 0.36, 0.0, 0.02, -0.50, 0.50, STEEL2, r=0.006, seg=1)                # 底框


# ---------------- 浮板架（備用） ----------------
def kickboard_rack(m, v):
    for sx in (-1, 1):
        m.tube((sx * 0.30, 0.0, -0.15), (sx * 0.30, 0.75, -0.15), 0.018, STEEL, seg=8)
        m.tube((sx * 0.30, 0.0, 0.15), (sx * 0.30, 0.75, 0.15), 0.018, STEEL, seg=8)
        m.tube((sx * 0.30, 0.02, -0.15), (sx * 0.30, 0.02, 0.15), 0.015, STEEL, seg=8)
    for y in (0.08, 0.40):
        m.tube((-0.30, y, -0.15), (0.30, y, -0.15), 0.014, STEEL, seg=8)
        m.tube((-0.30, y, 0.15), (0.30, y, 0.15), 0.014, STEEL, seg=8)
    for k in range(5):   # 五塊浮板，直立插在架上，往後微斜
        x = -0.22 + k * 0.11
        v.rb_rot((x, 0.30, 0.0), 0.035, 0.46, 0.30, FOAM_B if k % 2 == 0 else FOAM_Y, rx=0.08, r=0.015)


# ---------------- 體重計 ----------------
def scale(m, v):
    v.rb(-0.20, 0.20, 0.0, 0.07, -0.25, 0.25, TRIM, r=0.02)                                    # 底座
    v.rb(-0.17, 0.17, 0.07, 0.085, -0.20, 0.22, RUB, r=0.01)                                   # 踏板的橡膠
    m.tube((0, 0.07, -0.22), (0, 1.30, -0.22), 0.03, STEEL2, seg=10)                           # 立柱
    v.rb_rot((0, 1.36, -0.20), 0.26, 0.16, 0.08, TRIM, rx=-0.25, r=0.02)                       # 頭
    v.rb_rot((0, 1.365, -0.157), 0.18, 0.08, 0.004, SCREEN, rx=-0.25, r=0.003)                 # 顯示面板（沒有字）


# ---------------- 毛巾回收籃 ----------------
def towel_bin(m, v):
    prof = [(0.0, 0.0), (0.19, 0.0), (0.21, 0.02), (0.23, 0.58), (0.235, 0.62), (0.22, 0.62), (0.20, 0.06), (0.0, 0.06)]
    v.lathe_at(prof, (0, 0, 0), BIN, seg=20)
    v.rb_rot((0.03, 0.60, 0.02), 0.30, 0.06, 0.18, TOWEL, rx=0.5, ry=0.3, r=0.025)            # 露出來的兩條毛巾
    v.rb_rot((-0.06, 0.59, -0.04), 0.26, 0.05, 0.16, TOWEL2, rx=-0.4, ry=-0.6, r=0.022)


# ---------------- 鏡牆的框 ----------------
def mirror(m, v):
    W, H, y0 = 3.0, 2.0, 0.30
    PANE.rb(-W / 2, W / 2, y0, y0 + H, -0.03, 0.0, MIRROR, r=0.003, seg=1)                    # 鏡面（獨立網格，藍灰金屬色，LAWWW2-B 可以換材質）
    for (a, b, c, d) in ((-W / 2 - 0.03, -W / 2, y0 - 0.03, y0 + H + 0.03), (W / 2, W / 2 + 0.03, y0 - 0.03, y0 + H + 0.03),
                         (-W / 2, W / 2, y0 - 0.03, y0), (-W / 2, W / 2, y0 + H, y0 + H + 0.03)):
        m.rb(a, b, c, d, -0.035, 0.012, STEEL2, r=0.004, seg=1)
    for x in (-0.5, 0.5):   # 三片拼接的縫
        v.rb(x - 0.002, x + 0.002, y0, y0 + H, 0.0, 0.002, TRIM, r=0.0005, seg=1)


# ---------------- 橡膠地墊拼塊 ----------------
def floor(m, v):
    n, s = 4, 0.5
    for i in range(n):
        for j in range(n):
            x0 = -1.0 + i * s + 0.004; z0 = -1.0 + j * s + 0.004
            v.rb(x0, x0 + s - 0.008, 0.0, 0.015, z0, z0 + s - 0.008, RUB if (i + j) % 2 == 0 else RUB2, r=0.003, seg=1)


SPREAD = [('GYM2_COUNTER', -7.6, counter), ('GYM2_LOCKERS', -4.4, lockers), ('GYM2_WATER', -2.7, water), ('GYM2_LIFEGUARD', -1.4, lifeguard),
          ('GYM2_SCALE', 0.0, scale), ('GYM2_TOWEL_BIN', 0.9, towel_bin), ('GYM2_KICKBOARD_RACK', 1.9, kickboard_rack),
          ('GYM2_MIRROR', 4.4, mirror), ('GYM2_FLOOR', 7.8, floor)]
for nm, x, fn in SPREAD: item(nm, x, fn)

st = L.export(os.path.abspath(OUT), gpu_instances=False)
st['items_tris'] = STATS; st['tris_total'] = sum(STATS.values())
st['note'] = 'GYM-P2／P3a（LAWWW2-B 派工）；每件一個頂層節點；原點底部中央、正面 +z；GLB 裡的位置只是排開給人看'
L.write_json(os.path.abspath(OUT).replace('.glb', '.json'), st)
print(json.dumps({'items_tris': STATS, 'total': st['tris_total']}, ensure_ascii=False))
over = {k: t for k, t in STATS.items() if t > 3000}
assert not over, f'超過 3k 三角形：{over}'
assert st['tris_total'] <= 15000, st['tris_total']
