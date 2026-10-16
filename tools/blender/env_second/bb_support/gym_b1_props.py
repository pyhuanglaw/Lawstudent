"""ART-GYM-P1 新體育館 B1 健身中心的器材（BB_151 4b、BB_124 7-3；LAWWW2-B 分工 2026-10-16 08:1x；BB-B 支援製作）
  /opt/blenv/bin/python tools/blender/env_second/bb_support/gym_b1_props.py [-- --out assets/models/env/second_ai/bb_support/gym_b1_props.glb]

八件＋一件備用，每件一個頂層節點（原點＝底部中央、正面朝 +z；GLB 裡的位置只是排開給人看，遊戲端用每件的網格本身擺）：
  GYM_TREADMILL   跑步機：2.0 (z) × 0.85 (x) × 1.45 m；使用的人面向 +z，馬達罩和儀表板在 +z 那一端
  GYM_BIKE        飛輪：1.2 × 0.55 × 1.25 m；把手、飛輪在 +z
  GYM_ROWER       划船機：2.4 × 0.6 × 0.9 m；風扇、腳踏板在 +z，座椅在單軌上往 −z 滑
  GYM_SQUAT_RACK  深蹲架＋槓：1.3 (x) × 1.2 (z) × 2.3 m；槓 2.2 m 掛在 J 鉤上（1.4 m），兩邊各兩片黑色槓片
  GYM_SMITH       史密斯機：2.1 × 1.4 × 2.2 m；兩根導桿、槓、上方橫樑、兩側掛片桿
  GYM_DB_RACK     啞鈴架＋一組啞鈴：2.0 × 0.7 × 0.85 m；兩層斜架，10 對六角啞鈴（上層 2～10 kg、下層 12～20 kg）
  GYM_BENCH       可調式臥推椅：1.35 × 0.6 m，座面 0.45 m；椅背立 30°；椅背在 −z、座墊在 +z
  GYM_MAT         運動墊（平放）：1.8 × 0.6 × 0.012 m
  GYM_MAT_ROLL    運動墊（捲起來，備用）：長 0.6 m、直徑 0.16 m
兩個材質：gymb1_metal（頂點色＋金屬 0.40：烤漆框架、鍍鉻的槓與導桿）、gymb1_vc（頂點色：橡膠、皮墊、塑膠罩、跑帶、螢幕、運動墊）。
不放任何字、品牌、標誌（D77）：跑步機與划船機的螢幕是沒有字的暗色面板。"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
PARENT = os.path.dirname(HERE)
sys.path.insert(0, PARENT)
import lib2 as L   # noqa: E402
from lib2 import B, g2b, bpy, bmesh   # noqa: E402
from mathutils import Matrix, Vector   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/bb_support/gym_b1_props.glb'

# 顏色（sRGB）
FRAME = '#2e3136'    # 深灰烤漆
FRAME2 = '#4a5058'   # 淺一點的灰（護蓋、底座）
CHROME = '#b9bdc3'   # 鍍鉻
RUBBER = '#1d1d1f'   # 黑橡膠
VINYL = '#2b2b2e'    # 皮墊
PLASTIC = '#3a3e44'  # 塑膠罩
BELT = '#232325'     # 跑帶
SCREEN = '#0f1820'   # 螢幕（沒有字）
KNOB = '#7a1f1f'     # 飛輪阻力旋鈕（暗紅，不是品牌色）
MAT = '#45525c'      # 運動墊

B.reset(texres=256)
M_METAL = L.vc_metal('gymb1_metal', rough=0.42, metal=0.40)
M_VC = L.vc_material('gymb1_vc', rough=0.72)


class Part(L.CMesh):
    """CMesh 加上會上色的圓管、旋轉體、斜放的倒角方塊（全部遊戲座標，相對於器材原點）"""
    def _new(self, fn, col):
        before = set(self.bm.faces); fn(); return self.paint([f for f in self.bm.faces if f not in before], col)

    def tube(self, a, b, r, col, seg=10, caps=True):
        return self._new(lambda: self.cyl(a, b, r, seg=seg, caps=caps), col)

    def rb(self, x0, x1, y0, y1, z0, z1, col, r=0.015, seg=2):
        return self.crbox(x0, x1, y0, y1, z0, z1, col, r=r, seg=seg)

    def rb_rot(self, c, w, h, d, col, rx=0.0, ry=0.0, r=0.02, seg=2):
        """倒角方塊：中心 c（遊戲座標）、尺寸 w(x)×h(y)×d(z)、先繞遊戲 x 軸轉 rx（正＝前端往上翹）、再繞 y 軸轉 ry"""
        bm = L.rbox_bm(w, h, d, r, seg)
        m = Matrix.Translation(g2b(*c)) @ Matrix.Rotation(ry, 4, 'Z') @ Matrix.Rotation(-rx, 4, 'X')
        return self._new(lambda: self.add_bm(bm, m), col)

    def disc(self, c, r, t, axis, col, seg=20, r_in=0.0):
        """圓盤（槓片、飛輪）：中心 c、半徑 r、厚 t、axis＝'x'｜'y'｜'z'（遊戲座標的軸）；r_in>0 時中間有孔"""
        prof = ([(r_in, -t / 2)] if r_in > 0 else [(0.0, -t / 2)]) + [(r * 0.97, -t / 2), (r, -t / 2 + t * 0.15), (r, t / 2 - t * 0.15), (r * 0.97, t / 2)] + ([(r_in, t / 2)] if r_in > 0 else [(0.0, t / 2)])
        return self.lathe_at(prof, c, axis, col, seg)

    def lathe_at(self, prof, c, axis, col, seg=16):
        bm = L.lathe(prof, seg)   # 繞 Blender Z（＝遊戲 y）
        rot = {'y': Matrix.Identity(4), 'x': Matrix.Rotation(math.pi / 2, 4, 'Y'), 'z': Matrix.Rotation(math.pi / 2, 4, 'X')}[axis]
        return self._new(lambda: self.add_bm(bm, Matrix.Translation(g2b(*c)) @ rot), col)


ROOT = B.group('GYM_B1_PROPS')
STATS = {}


def item(name, x_spread, build):
    g = B.group(name, ROOT); g.location = g2b(x_spread, 0, 0)
    pm, pv = Part(f'gymb1_{name.lower()}_metal', M_METAL), Part(f'gymb1_{name.lower()}_vc', M_VC)
    build(pm, pv)
    tris = 0
    for p in (pm, pv):
        ob = p.finish(parent=g, uv=False, smooth=False, merge=True)
        if ob is None: continue
        L.smooth_mesh(ob, angle=0.6)
        tris += sum(len(f.vertices) - 2 for f in ob.data.polygons)
    STATS[name] = tris


# ---------------- 跑步機 ----------------
def treadmill(m, v):
    L_, W = 2.0, 0.85
    z0, z1 = -L_ / 2, L_ / 2
    m.rb(-W / 2, W / 2, 0.02, 0.16, z0 + 0.05, z1 - 0.32, FRAME, r=0.03)            # 底座框
    v.rb(-W / 2 + 0.02, -0.29, 0.16, 0.22, z0 + 0.06, z1 - 0.34, RUBBER, r=0.015)   # 左側踏台（防滑橡膠）
    v.rb(0.29, W / 2 - 0.02, 0.16, 0.22, z0 + 0.06, z1 - 0.34, RUBBER, r=0.015)     # 右側踏台
    v.rb(-0.28, 0.28, 0.16, 0.215, z0 + 0.10, z1 - 0.36, BELT, r=0.01)               # 跑帶
    m.tube((-0.28, 0.17, z0 + 0.08), (0.28, 0.17, z0 + 0.08), 0.045, CHROME, seg=12)  # 後滾筒
    for sx in (-1, 1):
        v.rb(sx * (W / 2 - 0.04) - 0.04, sx * (W / 2 - 0.04) + 0.04, 0.0, 0.025, z0 + 0.08, z0 + 0.18, RUBBER, r=0.008)   # 後腳墊
    v.rb(-W / 2, W / 2, 0.02, 0.30, z1 - 0.36, z1 - 0.02, PLASTIC, r=0.07, seg=3)    # 馬達罩（前端）
    for sx in (-1, 1):   # 兩根立柱：從馬達罩兩側往上、往後微斜
        x = sx * (W / 2 - 0.05)
        m.tube((x, 0.26, z1 - 0.12), (x, 1.22, z1 - 0.28), 0.035, FRAME, seg=10)
        m.tube((x, 1.02, z1 - 0.24), (x, 1.02, z1 - 0.78), 0.022, FRAME, seg=10)   # 側扶手往後
        v.tube((x, 1.02, z1 - 0.50), (x, 1.02, z1 - 0.76), 0.03, RUBBER, seg=10)   # 扶手的橡膠握把
    m.tube((-(W / 2 - 0.05), 1.18, z1 - 0.27), ((W / 2 - 0.05), 1.18, z1 - 0.27), 0.025, FRAME, seg=10)   # 前方橫桿
    v.rb_rot((0, 1.33, z1 - 0.30), 0.78, 0.26, 0.10, PLASTIC, rx=-0.45, r=0.035)     # 儀表板（往使用者那邊傾）
    v.rb_rot((0, 1.335, z1 - 0.355), 0.46, 0.15, 0.012, SCREEN, rx=-0.45, r=0.004)  # 螢幕（面向 −z、沒有字）
    v.rb_rot((0, 1.205, z1 - 0.40), 0.62, 0.05, 0.12, PLASTIC, rx=-0.2, r=0.02)     # 放手機的小托盤


# ---------------- 飛輪 ----------------
def bike(m, v):
    zf, zb = 0.48, -0.48
    for z in (zf, zb):   # 前後兩根底座橫管＋橡膠腳
        m.tube((-0.27, 0.05, z), (0.27, 0.05, z), 0.035, FRAME, seg=10)
        for sx in (-1, 1): v.rb(sx * 0.27 - 0.04, sx * 0.27 + 0.04, 0.0, 0.03, z - 0.04, z + 0.04, RUBBER, r=0.01)
    # 車架像「λ」：主樑從後腳往前上方到把手；座管從主樑中段往後上；前叉從把手下方接飛輪軸、再到前腳
    m.tube((0, 0.05, zb + 0.06), (0, 0.42, 0.02), 0.042, FRAME, seg=10)     # 主樑（後腳 → 中段）
    m.tube((0, 0.42, 0.02), (0, 1.00, 0.22), 0.042, FRAME, seg=10)          # 主樑（中段 → 把手立管）
    m.tube((0, 0.30, -0.10), (0, 0.80, -0.24), 0.038, FRAME, seg=10)        # 座管（往後傾）
    m.tube((0, 0.80, -0.24), (0, 0.92, -0.27), 0.025, CHROME, seg=10)       # 座管的可調內管
    m.tube((0, 1.00, 0.22), (0, 1.10, 0.25), 0.028, CHROME, seg=10)         # 把手立管的可調內管
    for sx in (-1, 1):   # 前叉：兩片夾住飛輪
        m.tube((sx * 0.045, 0.78, 0.17), (sx * 0.045, 0.32, 0.30), 0.022, FRAME, seg=8)
        m.tube((sx * 0.045, 0.32, 0.30), (sx * 0.045, 0.05, zf - 0.02), 0.022, FRAME, seg=8)
    v.lathe_at([(0.0, 0.0), (0.05, 0.0), (0.06, 0.01), (0.06, 0.03), (0.0, 0.035)], (0, 0.72, 0.13), 'y', KNOB, seg=12)   # 阻力旋鈕
    v.rb_rot((0, 0.95, -0.27), 0.17, 0.07, 0.27, VINYL, rx=0.06, r=0.03)   # 座墊（前窄後寬：用兩塊）
    v.rb_rot((0, 0.955, -0.36), 0.24, 0.07, 0.12, VINYL, rx=0.06, r=0.03)
    m.tube((0, 1.10, 0.25), (0, 1.12, 0.36), 0.025, FRAME, seg=10)        # 把手往前的連桿
    m.tube((-0.27, 1.12, 0.36), (0.27, 1.12, 0.36), 0.022, FRAME, seg=10)   # 把手橫桿
    for sx in (-1, 1):
        m.tube((sx * 0.27, 1.12, 0.36), (sx * 0.24, 1.18, 0.50), 0.022, FRAME, seg=10)   # 往前的把手
        v.tube((sx * 0.25, 1.165, 0.46), (sx * 0.24, 1.18, 0.50), 0.03, RUBBER, seg=10)
    m.disc((0, 0.32, 0.30), 0.24, 0.045, 'x', CHROME, seg=24)            # 飛輪
    v.disc((-0.04, 0.32, 0.30), 0.27, 0.02, 'x', PLASTIC, seg=24)       # 飛輪的護蓋（一側）
    m.tube((-0.07, 0.36, -0.02), (0.07, 0.36, -0.02), 0.03, CHROME, seg=10)   # 曲柄軸（在主樑上）
    for sx, phase in ((-1, 0.0), (1, math.pi)):
        ang = 0.9 + phase; dy, dz = 0.17 * math.cos(ang), 0.17 * math.sin(ang)
        m.tube((sx * 0.07, 0.36, -0.02), (sx * 0.07, 0.36 + dy, -0.02 + dz), 0.015, FRAME, seg=8)   # 曲柄
        v.rb(sx * 0.07 + (0.0 if sx > 0 else -0.10), sx * 0.07 + (0.10 if sx > 0 else 0.0), 0.35 + dy, 0.375 + dy, -0.08 + dz, 0.04 + dz, RUBBER, r=0.008)   # 踏板


# ---------------- 划船機 ----------------
def rower(m, v):
    zf, zb = 0.95, -1.15
    m.rb(-0.04, 0.04, 0.28, 0.34, zb + 0.05, zf - 0.30, CHROME, r=0.012)     # 單軌（鋁）
    m.tube((0, 0.31, zb + 0.06), (0, 0.04, zb + 0.02), 0.03, FRAME, seg=10)  # 後腳
    m.tube((-0.22, 0.03, zb + 0.02), (0.22, 0.03, zb + 0.02), 0.03, FRAME, seg=10)
    for sx in (-1, 1): v.rb(sx * 0.22 - 0.04, sx * 0.22 + 0.04, 0.0, 0.025, zb - 0.02, zb + 0.06, RUBBER, r=0.008)
    v.rb(-0.13, 0.13, 0.34, 0.40, -0.25, 0.05, VINYL, r=0.025)               # 座椅
    m.rb(-0.09, 0.09, 0.30, 0.34, -0.22, 0.02, FRAME, r=0.01)                # 座椅下的滑車
    m.rb(-0.08, 0.08, 0.10, 0.30, zf - 0.40, zf - 0.25, FRAME, r=0.02)       # 前端支架
    m.tube((-0.25, 0.03, zf - 0.30), (0.25, 0.03, zf - 0.30), 0.03, FRAME, seg=10)   # 前腳
    for sx in (-1, 1):
        v.rb(sx * 0.25 - 0.04, sx * 0.25 + 0.04, 0.0, 0.025, zf - 0.34, zf - 0.26, RUBBER, r=0.008)
        v.rb_rot((sx * 0.11, 0.30, zf - 0.48), 0.11, 0.02, 0.27, RUBBER, rx=0.9, r=0.008)   # 腳踏板（斜立）
    v.disc((0, 0.48, zf - 0.10), 0.30, 0.34, 'x', PLASTIC, seg=24)             # 風扇罩
    m.disc((0, 0.48, zf - 0.10), 0.18, 0.36, 'x', FRAME2, seg=20)             # 罩子兩側的格柵（深一點的圓）
    m.tube((0, 0.52, zf - 0.30), (0, 1.0, zf - 0.55), 0.02, FRAME, seg=8)    # 螢幕支臂
    v.rb_rot((0, 1.02, zf - 0.57), 0.20, 0.14, 0.04, PLASTIC, rx=-0.5, r=0.012)
    v.rb_rot((0, 1.02, zf - 0.595), 0.15, 0.09, 0.006, SCREEN, rx=-0.5, r=0.003)
    v.tube((-0.25, 0.46, zf - 0.42), (0.25, 0.46, zf - 0.42), 0.022, RUBBER, seg=10)   # 拉把（掛在前面）


# ---------------- 深蹲架 ----------------
def plate(part, x, y, z, r, t):
    part.disc((x, y, z), r, t, 'x', RUBBER, seg=18, r_in=0.026)


def bar(m, y, z, half=1.1, collar=0.62):
    m.tube((-half, y, z), (half, y, z), 0.014, CHROME, seg=10, caps=True)       # 槓身
    for sx in (-1, 1):
        m.tube((sx * collar, y, z), (sx * half, y, z), 0.025, CHROME, seg=12)   # 套筒
        m.tube((sx * (collar - 0.03), y, z), (sx * collar, y, z), 0.032, CHROME, seg=12)   # 擋環


def squat_rack(m, v):
    W, D, H = 1.3, 1.2, 2.3
    xs, zs = (-W / 2 + 0.04, W / 2 - 0.04), (-D / 2 + 0.04, D / 2 - 0.04)
    for x in xs:
        for z in zs: m.rb(x - 0.038, x + 0.038, 0.0, H, z - 0.038, z + 0.038, FRAME, r=0.008, seg=1)   # 四根立柱（75 mm 方管）
        m.rb(x - 0.038, x + 0.038, 0.0, 0.06, zs[0], zs[1], FRAME, r=0.008, seg=1)    # 兩側底樑
        m.rb(x - 0.038, x + 0.038, H - 0.08, H, zs[0], zs[1], FRAME, r=0.008, seg=1)  # 兩側頂樑
    for z in zs: m.rb(xs[0], xs[1], H - 0.08, H, z - 0.038, z + 0.038, FRAME, r=0.008, seg=1)   # 前後頂樑
    m.rb(xs[0], xs[1], 0.0, 0.06, zs[0] - 0.038, zs[0] + 0.038, FRAME, r=0.008, seg=1)          # 後底樑
    v.rb(-W / 2 + 0.02, W / 2 - 0.02, 0.0, 0.015, -D / 2 + 0.08, D / 2 - 0.08, RUBBER, r=0.005)   # 地上的橡膠墊
    for x in xs:   # J 鉤（掛在前排立柱內側）與安全槓
        sx = 1 if x > 0 else -1
        m.rb(x - sx * 0.06, x - sx * 0.035, 1.32, 1.42, zs[1] - 0.03, zs[1] + 0.09, FRAME2, r=0.008, seg=1)
        v.rb(x - sx * 0.06, x - sx * 0.035, 1.36, 1.40, zs[1] + 0.03, zs[1] + 0.09, RUBBER, r=0.006)
        m.rb(x - sx * 0.07, x - sx * 0.035, 0.62, 0.68, zs[0], zs[1], FRAME2, r=0.008, seg=1)   # 安全槓（前後貫穿）
    zbar = zs[1] + 0.05
    bar(m, 1.40, zbar)
    for sx in (-1, 1):
        plate(v, sx * 0.70, 1.40, zbar, 0.225, 0.05)
        plate(v, sx * 0.76, 1.40, zbar, 0.225, 0.05)


# ---------------- 史密斯機 ----------------
def smith(m, v):
    W, D, H = 2.1, 1.4, 2.2
    xs = (-W / 2 + 0.05, W / 2 - 0.05); zs = (-D / 2 + 0.05, D / 2 - 0.05)
    for x in xs:
        for z in zs: m.rb(x - 0.04, x + 0.04, 0.0, H, z - 0.04, z + 0.04, FRAME, r=0.008, seg=1)
        m.rb(x - 0.04, x + 0.04, 0.0, 0.07, zs[0], zs[1], FRAME, r=0.008, seg=1)
        m.rb(x - 0.04, x + 0.04, H - 0.09, H, zs[0], zs[1], FRAME, r=0.008, seg=1)
    for z in zs: m.rb(xs[0], xs[1], H - 0.09, H, z - 0.04, z + 0.04, FRAME, r=0.008, seg=1)
    gx = (-0.55, 0.55); gz = 0.0
    for x in gx:   # 兩根鍍鉻導桿（上下固定在中間的橫樑）
        m.tube((x, 0.07, gz), (x, H - 0.09, gz), 0.016, CHROME, seg=12)
    m.rb(xs[0], xs[1], 0.0, 0.07, -0.04, 0.04, FRAME, r=0.008, seg=1)          # 底下的中樑
    m.rb(xs[0], xs[1], H - 0.18, H - 0.09, -0.04, 0.04, FRAME, r=0.008, seg=1)  # 上面的中樑
    y = 1.25
    for x in gx:
        m.tube((x, y - 0.09, gz), (x, y + 0.09, gz), 0.032, FRAME2, seg=12)   # 滑套
        m.rb(x - 0.03, x + 0.03, y - 0.02, y + 0.02, gz, gz + 0.09, FRAME2, r=0.006, seg=1)
    bar(m, y, gz + 0.08, half=1.05, collar=0.68)
    for sx in (-1, 1):
        plate(v, sx * 0.76, y, gz + 0.08, 0.225, 0.05)
        m.tube((sx * (W / 2 - 0.05), 0.35, zs[0]), (sx * (W / 2 - 0.05 + 0.0), 0.35, zs[0] - 0.22), 0.025, CHROME, seg=10)   # 掛片桿（後面）
        m.tube((sx * (W / 2 - 0.05), 0.80, zs[0]), (sx * (W / 2 - 0.05), 0.80, zs[0] - 0.22), 0.025, CHROME, seg=10)
        v.disc((sx * (W / 2 - 0.05), 0.80, zs[0] - 0.12), 0.18, 0.045, 'z', RUBBER, seg=20, r_in=0.026)   # 掛著的一片
    v.rb(-W / 2 + 0.02, W / 2 - 0.02, 0.0, 0.015, -D / 2 + 0.1, D / 2 - 0.1, RUBBER, r=0.005)


# ---------------- 啞鈴架＋啞鈴 ----------------
def dumbbell(m, v, x, y, z, kg):
    head_r = 0.045 + 0.0035 * kg; head_l = 0.05 + 0.0045 * kg; hl = 0.13
    m.tube((x - hl / 2, y, z), (x + hl / 2, y, z), 0.016, CHROME, seg=8, caps=False)   # 握把
    for sx in (-1, 1):
        a = x + sx * hl / 2; b = x + sx * (hl / 2 + head_l)
        v.tube((a, y, z), (b, y, z), head_r, RUBBER, seg=6)                                # 六角頭


def db_rack(m, v):
    W = 2.0
    for x in (-W / 2 + 0.05, 0.0, W / 2 - 0.05):   # 三組側框（梯形）
        m.tube((x, 0.0, -0.32), (x, 0.82, -0.18), 0.03, FRAME, seg=8)
        m.tube((x, 0.0, 0.32), (x, 0.45, 0.25), 0.03, FRAME, seg=8)
        m.tube((x, 0.02, -0.32), (x, 0.02, 0.32), 0.03, FRAME, seg=8)
        v.rb(x - 0.05, x + 0.05, 0.0, 0.02, -0.36, -0.28, RUBBER, r=0.006); v.rb(x - 0.05, x + 0.05, 0.0, 0.02, 0.28, 0.36, RUBBER, r=0.006)
    tiers = [(0.45, 0.20, [12, 14, 16, 18, 20]), (0.80, -0.12, [2, 4, 6, 8, 10])]
    for y, z, kgs in tiers:   # 兩層斜放的托盤（前低後高）
        m.rb_rot((0, y - 0.03, z), W - 0.04, 0.025, 0.30, FRAME2, rx=-0.25, r=0.01)
        n = len(kgs)
        for i, kg in enumerate(kgs):
            cx = -W / 2 + (i + 0.5) * W / n
            for k in (-1, 1):   # 一對：左右各一支
                hr = 0.045 + 0.0035 * kg
                dumbbell(m, v, cx, y + hr - 0.012, z + k * 0.065, kg)


# ---------------- 可調式臥推椅 ----------------
def bench(m, v):
    zb, zf = -0.65, 0.65
    m.rb(-0.04, 0.04, 0.08, 0.16, zb + 0.08, zf - 0.08, FRAME, r=0.012)               # 主樑
    for z, w in ((zb + 0.06, 0.55), (zf - 0.06, 0.45)):   # 前後腳架
        m.rb(-w / 2, w / 2, 0.0, 0.07, z - 0.035, z + 0.035, FRAME, r=0.012)
        for sx in (-1, 1): v.rb(sx * w / 2 - 0.04, sx * w / 2 + 0.04, 0.0, 0.015, z - 0.04, z + 0.04, RUBBER, r=0.005)
    m.rb(-0.035, 0.035, 0.16, 0.40, 0.30, 0.36, FRAME, r=0.01)                        # 座墊支柱
    v.rb(-0.15, 0.15, 0.40, 0.46, 0.08, 0.52, VINYL, r=0.03)                          # 座墊
    ang = math.radians(30)
    L_ = 0.80; cz = 0.06 - math.cos(ang) * L_ / 2; cy = 0.44 + math.sin(ang) * L_ / 2
    v.rb_rot((0, cy, cz), 0.28, 0.065, L_, VINYL, rx=-ang, r=0.03)                    # 椅背（立 30°）
    m.tube((0, 0.16, -0.18), (0, cy - 0.12, cz - 0.02), 0.025, FRAME, seg=8)          # 椅背的撐桿
    m.rb(-0.03, 0.03, 0.14, 0.18, -0.50, -0.10, FRAME2, r=0.006)                     # 調整用的梯子
    for i in range(5): m.rb(-0.04, 0.04, 0.175, 0.19, -0.46 + i * 0.08, -0.44 + i * 0.08, CHROME, r=0.004)
    v.tube((-0.12, 0.10, zf - 0.02), (0.12, 0.10, zf - 0.02), 0.035, VINYL, seg=10)  # 前面勾腳的滾筒


# ---------------- 運動墊 ----------------
def mat_flat(m, v):
    v.rb(-0.30, 0.30, 0.0, 0.012, -0.90, 0.90, MAT, r=0.005, seg=2)


def mat_roll(m, v):
    prof = [(0.0, -0.30), (0.075, -0.30), (0.08, -0.295), (0.08, 0.295), (0.075, 0.30), (0.0, 0.30)]
    v.lathe_at(prof, (0, 0.08, 0), 'x', MAT, seg=18)


SPREAD = [('GYM_TREADMILL', -7.2, treadmill), ('GYM_BIKE', -5.4, bike), ('GYM_ROWER', -4.0, rower), ('GYM_SQUAT_RACK', -2.2, squat_rack),
          ('GYM_SMITH', 0.4, smith), ('GYM_DB_RACK', 3.2, db_rack), ('GYM_BENCH', 5.0, bench), ('GYM_MAT', 6.3, mat_flat), ('GYM_MAT_ROLL', 7.2, mat_roll)]
for nm, x, fn in SPREAD: item(nm, x, fn)

st = L.export(os.path.abspath(OUT), gpu_instances=False)
st['items_tris'] = STATS; st['tris_total'] = sum(STATS.values())
st['note'] = '每件一個頂層節點；原點底部中央、正面 +z；GLB 裡的位置只是排開給人看'
L.write_json(os.path.abspath(OUT).replace('.glb', '.json'), st)
print(json.dumps({'items_tris': STATS, 'total': st['tris_total']}, ensure_ascii=False))
over = {k: t for k, t in STATS.items() if t > 3000}
assert not over, f'超過 3k 三角形：{over}'
assert st['tris_total'] <= 15000, st['tris_total']
