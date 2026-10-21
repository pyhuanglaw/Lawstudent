"""溫州街路面貼圖（LAWWW2-B 2026-10-16，精修第 3 批：使用者「街道能不能更像真實的？」）。
原本的路面（src/townkit3d.js TK.road）是整片同一個淺灰柏油重複貼、一條連續的鐵柵、兩條白線：
手機直向時畫面下半部全是這片地面，看起來像模型展示。台北的巷子有：補過很多次的柏油（補丁、管線挖補的長條、裂縫的灌縫膠）、
車輪壓出來的深色帶、停車處的油漬、路邊的混凝土水溝蓋（一節一節）＋鐵柵、白線與禁停紅線、人孔蓋、手孔蓋、靠牆的暗角。
這支腳本（系統 python3，numpy＋PIL）把這些「畫進」一張整條路的貼圖（世界座標定位，和遊戲的導航、建築位置一致），wz_props.py 把它貼在路面上。
柏油底色維持使用者指定的淺灰（D30，約 #acacaa）。全部程序產生（不用外部貼圖）。

輸出 textures/gen/wz_road_atlas.jpg＋.json：主巷（x −37..47.3、z −5..5）、Café 前的南北向路（x 47.3..55.3、z −46..49.5）、三條側巷四塊，
合成一張貼圖（一個材質、一次 draw call）；json 是每塊的世界範圍和四個角的 UV，wz_props.py 讀。另外 wz_road_grain_nor.png：每公尺重複的柏油顆粒法線。
用法：python3 tools/blender/env_second/wz_road_tex.py
"""
import math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from scipy.ndimage import gaussian_filter, map_coordinates

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, 'textures', 'gen')
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
BASE_L = 168.0        # D30：淺灰柏油（sRGB 約 #a8a8a6）


class Road:
    """一條路的貼圖。uv(x, z)→(col, row)：每條路自己定義（世界座標 → 像素）。"""
    def __init__(self, W, H, to_px, ppm, seed):
        self.W, self.H, self.to_px, self.ppm = W, H, to_px, ppm
        self.rng = np.random.default_rng(seed)
        self.L = np.zeros((H, W), np.float32)            # 亮度偏移（加在底色上）
        self.tint = np.zeros((H, W, 3), np.float32)       # 色偏（RGB 加量）
        self.paint = Image.new('RGBA', (W, H), (0, 0, 0, 0))   # 標線、字、鐵件（最後疊上去）
        self.dp = ImageDraw.Draw(self.paint)

    # ---- 底：柏油紋理＋大小尺度的深淺 ----
    def base(self):
        """柏油顆粒：程序產生（細雜訊＋零星的亮石子、暗點），不重複。
        第一、二版用 Poly Haven asphalt_02 每 1.6 m 重複一次：那張貼圖本身有幾條直的裂縫，重複之後變成規律的直線，截掉暗部也還留著亮邊 → 不用照片。"""
        r = self.rng; H, W = self.H, self.W
        self.L += gaussian_filter(r.standard_normal((H, W)).astype(np.float32), 0.6) * 9.0
        sp = r.random((H, W)) ; self.L += np.where(sp > 0.985, r.uniform(6, 16, (H, W)), 0) - np.where(sp < 0.012, r.uniform(6, 14, (H, W)), 0)
        for sig_m, amp in ((3.0, 3.5), (0.9, 2.5), (0.25, 2.0)):     # 大塊的新舊深淺、中尺度的斑、細的雜點
            nz = gaussian_filter(self.rng.standard_normal((self.H, self.W)).astype(np.float32), sig_m * self.ppm, mode='wrap')
            self.L += nz / (nz.std() + 1e-6) * amp

    def poly_mask(self, pts_world, blur=0.8):
        m = Image.new('L', (self.W, self.H), 0); ImageDraw.Draw(m).polygon([self.to_px(x, z) for x, z in pts_world], fill=255)
        a = np.asarray(m).astype(np.float32) / 255
        return gaussian_filter(a, blur) if blur else a

    def rect_world(self, x0, z0, x1, z1, jitter=0.06):
        j = lambda: self.rng.uniform(-jitter, jitter)
        return [(x0 + j(), z0 + j()), (x1 + j(), z0 + j()), (x1 + j(), z1 + j()), (x0 + j(), z1 + j())]

    # ---- 補丁：新鋪的柏油比較深、紋理比較細；邊緣一圈灌縫膠 ----
    def patch(self, pts, dL=-12.0, seam=-16.0, seam_w=1.6):
        """第一版（dL −16、灌縫 −34、紋理壓 45%）太像「畫上去的深色方塊」→ 色差小一點、保留柏油顆粒、邊緣不規則一點"""
        m = self.poly_mask(pts, 1.2)
        wob = gaussian_filter(self.rng.standard_normal(m.shape).astype(np.float32), 0.35 * self.ppm); wob /= wob.std() + 1e-6
        self.L = self.L * (1 - 0.12 * m) + m * (dL + wob * 2.0)
        edge = np.clip(gaussian_filter(m, seam_w) * (1 - gaussian_filter(m, seam_w)) * 4, 0, 1)
        brk = np.clip(gaussian_filter(self.rng.random(m.shape).astype(np.float32), 3) * 3 - 1.1, 0, 1)   # 灌縫膠有斷有續
        self.L += edge * seam * (0.4 + 0.6 * brk)

    # ---- 裂縫灌縫膠：彎彎曲曲的黑線 ----
    def crack(self, x, z, ang, length, w=0.035, dL=-48.0):
        pts = [(x, z)]; a = ang
        for _ in range(int(length / 0.12)):
            a += self.rng.normal(0, 0.28); x += 0.12 * math.cos(a); z += 0.12 * math.sin(a); pts.append((x, z))
        m = Image.new('L', (self.W, self.H), 0); ImageDraw.Draw(m).line([self.to_px(*p) for p in pts], fill=255, width=max(2, int(w * self.ppm)))
        self.L += gaussian_filter(np.asarray(m).astype(np.float32) / 255, 0.6) * dL

    # ---- 沿著路的帶狀（輪胎壓痕）：line(x 或 z 方向)，中心、寬、強度 ----
    def band(self, mask_fn, dL):
        self.L += mask_fn() * dL

    def stain(self, x, z, r, dL=-24.0, warm=4.0):
        cx, cy = self.to_px(x, z); rr = r * self.ppm
        yy, xx = np.ogrid[:self.H, :self.W]; d = ((xx - cx) ** 2 + (yy - cy) ** 2) / (rr * rr)
        m = np.exp(-d * 2.5) * (gaussian_filter(self.rng.random((self.H, self.W)).astype(np.float32), 2) > 0.45)
        m = gaussian_filter(m.astype(np.float32), 1.2)
        self.L += m * dL; self.tint[..., 0] += m * warm; self.tint[..., 2] -= m * warm

    def ao_edge(self, dist_fn, width=0.35, dL=-26.0):
        """靠牆、靠路緣的暗角：dist_fn() 回傳每個像素到牆的距離（公尺）"""
        d = dist_fn(); self.L += dL * np.clip(1 - d / width, 0, 1) ** 1.6

    # ---- 路邊水溝：一節一節的混凝土蓋（1 m 一節）＋每 6 m 一塊鐵柵 ----
    def gutter(self, x0, x1, z_wall, z_road, along='x', grate_every=6.0, gap=None):
        """along='x'：水溝沿著 x（主巷）；z_wall＝牆那一邊、z_road＝靠路那一邊（水溝寬 = |z_road − z_wall|）"""
        lo, hi = sorted((z_wall, z_road))
        for s in np.arange(x0, x1, 1.0):
            e = min(s + 1.0, x1)
            if gap and any(a < (s + e) / 2 < b for a, b in gap): continue
            pts = [(s + 0.01, lo), (e - 0.01, lo), (e - 0.01, hi), (s + 0.01, hi)] if along == 'x' else [(lo, s + 0.01), (lo, e - 0.01), (hi, e - 0.01), (hi, s + 0.01)]
            m = self.poly_mask(pts, 0.5)
            shade = self.rng.uniform(-4, 5)
            self.L = self.L * (1 - 0.7 * m) + m * (10 + shade)             # 混凝土蓋比柏油亮一點、紋理淡
            self.tint[..., 0] += m * 2.0; self.tint[..., 1] += m * 1.0          # 水泥偏暖一點
        # 節與節之間的縫（深色細線）
        for s in np.arange(x0, x1 + 0.01, 1.0):
            if gap and any(a < s < b for a, b in gap): continue
            p0, p1 = ((s, lo), (s, hi)) if along == 'x' else ((lo, s), (hi, s))
            self.dp.line([self.to_px(*p0), self.to_px(*p1)], fill=(55, 54, 52, 150), width=2)
        # 水溝和柏油的交界：一條灰縫（巷口沒有水溝的地方斷開：原本整條畫過去，巷口地上多一條橫線）
        segs, a0 = [], x0
        for a, b in sorted(gap or []):
            if a > a0: segs.append((a0, min(a, x1)))
            a0 = max(a0, b)
        if a0 < x1: segs.append((a0, x1))
        for sa, sb in segs:
            p0, p1 = ((sa, z_road), (sb, z_road)) if along == 'x' else ((z_road, sa), (z_road, sb))
            self.dp.line([self.to_px(*p0), self.to_px(*p1)], fill=(80, 79, 76, 120), width=2)
        # 鐵柵
        for s in np.arange(x0 + 2.2, x1 - 0.6, grate_every):
            s = s + self.rng.uniform(-0.6, 0.6)
            if gap and any(a - 0.8 < s < b + 0.8 for a, b in gap): continue
            self.grate(s, (lo + hi) / 2, along)

    def grate(self, s, c, along):
        gl, gw = 0.62, 0.30                                       # 鐵柵 62×30 cm（長邊沿著水溝）
        corners = [(-gl / 2, -gw / 2), (gl / 2, -gw / 2), (gl / 2, gw / 2), (-gl / 2, gw / 2)]
        P = lambda a, b: self.to_px(s + a, c + b) if along == 'x' else self.to_px(c + b, s + a)
        self.dp.polygon([P(a, b) for a, b in corners], fill=(52, 50, 47, 255))
        for k in np.linspace(-gl / 2 + 0.05, gl / 2 - 0.05, 9):   # 橫向的鐵條（亮）＋縫（黑）
            self.dp.line([P(k, -gw / 2 + 0.03), P(k, gw / 2 - 0.03)], fill=(96, 92, 86, 255), width=2)
        self.dp.line([P(-gl / 2, -gw / 2), P(gl / 2, -gw / 2), P(gl / 2, gw / 2), P(-gl / 2, gw / 2), P(-gl / 2, -gw / 2)], fill=(110, 104, 96, 255), width=2)
        # 鐵鏽暈開一點
        cx, cy = P(0, 0); r = int(0.5 * self.ppm)
        y0, y1, x0, x1 = max(0, cy - r), min(self.H, cy + r), max(0, cx - r), min(self.W, cx + r)
        yy, xx = np.ogrid[y0:y1, x0:x1]; m = np.exp(-(((xx - cx) ** 2 + (yy - cy) ** 2) / (r * r * 0.35)))
        self.tint[y0:y1, x0:x1, 0] += m * 6; self.tint[y0:y1, x0:x1, 1] += m * 2; self.tint[y0:y1, x0:x1, 2] -= m * 4; self.L[y0:y1, x0:x1] -= m * 8

    def manhole(self, x, z, r=0.4, kind='round'):
        cx, cy = self.to_px(x, z); R = r * self.ppm
        bb = lambda q: [cx - q, cy - q, cx + q, cy + q]
        self.dp.ellipse(bb(R + 0.09 * self.ppm), fill=(150, 146, 138, 255))      # 外圈混凝土
        self.dp.ellipse(bb(R), fill=(58, 56, 53, 255))
        for k in range(3, int(R), max(3, int(R / 6))): self.dp.ellipse(bb(k), outline=(84, 81, 76, 255), width=2)
        self.dp.line([cx - R * 0.7, cy, cx + R * 0.7, cy], fill=(84, 81, 76, 255), width=2)

    def handhole(self, x, z, w=0.6, d=0.4, ang=0.0):
        c, s = math.cos(ang), math.sin(ang)
        P = lambda a, b: self.to_px(x + a * c - b * s, z + a * s + b * c)
        self.dp.polygon([P(-w / 2 - 0.05, -d / 2 - 0.05), P(w / 2 + 0.05, -d / 2 - 0.05), P(w / 2 + 0.05, d / 2 + 0.05), P(-w / 2 - 0.05, d / 2 + 0.05)], fill=(150, 146, 138, 255))
        self.dp.polygon([P(-w / 2, -d / 2), P(w / 2, -d / 2), P(w / 2, d / 2), P(-w / 2, d / 2)], fill=(74, 72, 68, 255))
        for k in np.linspace(-w / 2 + 0.06, w / 2 - 0.06, 6): self.dp.line([P(k, -d / 2 + 0.04), P(k, d / 2 - 0.04)], fill=(92, 89, 84, 255), width=2)

    def line(self, pts, w, color, wear=0.25):
        """標線：熱塑型的漆，有點磨損（wear＝被磨掉的比例）"""
        m = Image.new('L', (self.W, self.H), 0); ImageDraw.Draw(m).line([self.to_px(*p) for p in pts], fill=255, width=max(2, int(round(w * self.ppm))))
        a = np.asarray(m).astype(np.float32) / 255
        nz = gaussian_filter(self.rng.random((self.H, self.W)).astype(np.float32), 1.5)
        a *= np.clip((nz - wear * 0.55) * 4, 0.35, 1.0)
        self._lay(a, color)

    def text(self, ch, x, z, w, h, ang, color=(236, 234, 228), wear=0.3):
        """路面字（「慢」）：沿著路拉長（w＝沿路方向的長、h＝橫向寬）；ang＝字頭朝哪個方向（弧度，世界座標 x→z）"""
        fs = 256; im = Image.new('L', (fs, fs), 0); d = ImageDraw.Draw(im); f = ImageFont.truetype(FONT, int(fs * 0.92))
        bx = d.textbbox((0, 0), ch, font=f); d.text(((fs - bx[2] - bx[0]) / 2, (fs - bx[3] - bx[1]) / 2), ch, fill=255, font=f)
        g = np.asarray(im).astype(np.float32) / 255
        # 把每個像素換回字的座標（字頭＝+v）：世界 (x, z) → 字的 (u 橫向, v 沿路)
        yy, xx = np.mgrid[:self.H, :self.W].astype(np.float32)
        wx, wz = self.from_px(xx, yy); dx, dz = wx - x, wz - z
        c, s = math.cos(ang), math.sin(ang)
        along = dx * c + dz * s; across = -dx * s + dz * c
        u = (across / h + 0.5) * fs; v = (0.5 - along / w) * fs
        ok = (u >= 0) & (u < fs) & (v >= 0) & (v < fs)
        a = np.zeros((self.H, self.W), np.float32)
        a[ok] = map_coordinates(g, [v[ok], u[ok]], order=1)
        nz = gaussian_filter(self.rng.random((self.H, self.W)).astype(np.float32), 1.5)
        self._lay(a * np.clip((nz - wear * 0.55) * 4, 0.35, 1.0), color)

    def _lay(self, a, color):
        p = np.asarray(self.paint).astype(np.float32)
        col = np.array(color, np.float32)[None, None, :]
        al = a[..., None]; old = p[..., 3:4] / 255
        p[..., :3] = p[..., :3] * old * (1 - al) / np.maximum(old * (1 - al) + al, 1e-6) + col * al / np.maximum(old * (1 - al) + al, 1e-6)
        p[..., 3:4] = 255 * (al + old * (1 - al))
        self.paint = Image.fromarray(p.clip(0, 255).astype(np.uint8), 'RGBA'); self.dp = ImageDraw.Draw(self.paint)

    def render(self, path):
        g = BASE_L + self.L
        rgb = np.stack([g + 0.0, g + 0.0, g - 2.0], -1) + self.tint      # 柏油略帶一點點冷灰（#acacaa 那種）
        base = Image.fromarray(rgb.clip(0, 255).astype(np.uint8), 'RGB').convert('RGBA')
        p = np.asarray(self.paint).astype(np.float32)
        # 標線、鐵件上也有一點點髒（和底下的柏油一起變暗）
        dirt = (np.clip(self.L, -40, 20)[..., None] * 0.35)
        p[..., :3] = np.clip(p[..., :3] + dirt, 0, 255)
        out = Image.alpha_composite(base, Image.fromarray(p.astype(np.uint8), 'RGBA')).convert('RGB')
        out = out.filter(ImageFilter.UnsharpMask(radius=1.2, percent=40, threshold=2))
        if path: out.save(path, quality=88); print('saved', path, out.size)
        return out


def zebra(R):
    """巷口斑馬線：位置、條紋和套件的一樣（zones3d.js：PlaneGeometry(8.4, 2.4)，x 45.2..47.6、z ±4.2，貼圖 256 px 每 32 px 一條 18 px）。
    新路面（y 0.016）蓋在套件的斑馬線（y 0.012）上面，套件那片看不到了 → 畫進路面貼圖；兩條路（主巷到 x 47.3、南北向路從 47.3 起）各畫自己那一段。
    wz_props.glb 載入失敗時沒有新路面，套件的斑馬線照舊在同一個位置。"""
    k = 8.4 / 256
    for i in range(0, 256, 32):
        za, zb = 4.2 - (i + 22) * k, 4.2 - (i + 4) * k
        R.line([(45.2, (za + zb) / 2), (47.6, (za + zb) / 2)], zb - za, (236, 234, 228), wear=0.32)


# ======================== 主巷：x −37..47.3、z −5..5 ========================
def main_lane():
    X0, X1, Z0, Z1 = -37.0, 47.3, -5.0, 5.0
    W, H = 4064, 480; pu = W / (X1 - X0); pv = H / (Z1 - Z0)
    to_px = lambda x, z: (int(round((x - X0) * pu)), int(round((z - Z0) * pv)))
    R = Road(W, H, to_px, (pu + pv) / 2, seed=1016)
    R.from_px = lambda col, row: (X0 + col / pu, Z0 + row / pv)
    R.base()
    yy, xx = np.mgrid[:H, :W].astype(np.float32); wx, wz = R.from_px(xx, yy)
    # 巷口（側巷接進來的地方）：這些範圍沒有牆、沒有水溝和白線
    mouthA = [(-36.9, -29.9), (3.25, 8.25)]           # A 側（z=+5）：西端南北向巷、北巷
    mouthB = [(-36.9, -29.9), (-14.75, -9.75)]        # B 側（z=−5）：西端南北向巷、南巷
    inm = lambda x, M: any(a <= x <= b for a, b in M)
    # 輪胎壓痕：汽車兩條輪跡（巷子中線 ±0.8 m）、機車靠兩邊（±2.6 m）
    for zc, wdt, dL in ((0.8, 0.32, -10.0), (-0.8, 0.32, -10.0), (2.4, 0.4, -5.0), (-2.4, 0.4, -5.0)):   # 機車靠邊騎：停車格（到 z ±2.86）外面
        R.band(lambda: np.exp(-((wz - zc) / wdt) ** 2) * (0.75 + 0.25 * np.sin(wx * 0.37) * np.sin(wx * 0.11)), dL)
    # 補丁：管線挖補的長條（A 側 1.4 m、從 −22 到 9）、幾塊方形補丁、一塊整片重鋪（比較新）
    R.patch(R.rect_world(-22, 2.9, 9.0, 3.55, 0.03), dL=-10)
    R.patch(R.rect_world(24.0, -3.9, 31.0, -3.25, 0.03), dL=-9)
    for x0, z0, w, d in ((-27.5, -2.4, 2.6, 1.6), (-6.2, -1.0, 1.4, 1.1), (15.5, 0.4, 3.4, 2.2), (36.5, -1.8, 1.8, 1.3), (41.0, 1.6, 2.2, 1.8)):
        R.patch(R.rect_world(x0, z0, x0 + w, z0 + d), dL=R.rng.uniform(-14, -7))
    R.patch(R.rect_world(-35.5, -4.6, -30.5, 4.6, 0.04), dL=-6, seam=-14)   # 西端路口整片重鋪過
    for _ in range(9):
        x = R.rng.uniform(-34, 44); z = R.rng.uniform(-3.5, 3.5); R.crack(x, z, R.rng.uniform(0, math.pi), R.rng.uniform(0.8, 3.2))
    # 停車／機車停放處的油漬（靠兩邊）
    for _ in range(16):
        x = R.rng.uniform(-34, 44); z = R.rng.choice([-1, 1]) * R.rng.uniform(3.0, 4.2)
        if not (inm(x, mouthA) or inm(x, mouthB)): R.stain(x, z, R.rng.uniform(0.25, 0.6), dL=R.rng.uniform(-22, -12))
    for _ in range(7): R.stain(R.rng.uniform(-30, 44), R.rng.uniform(-0.4, 0.4), R.rng.uniform(0.12, 0.25), dL=-16)   # 中間零星的滴油
    # 靠牆的暗角（巷口沒有牆）
    def dist_wall():
        dA = 5.0 - wz; dB = wz + 5.0
        mA = np.vectorize(lambda x: inm(x, mouthA))(wx[0]); mB = np.vectorize(lambda x: inm(x, mouthB))(wx[0])
        dA = np.where(mA[None, :], 99, dA); dB = np.where(mB[None, :], 99, dB)
        return np.minimum(dA, dB)
    R.ao_edge(dist_wall, width=0.45, dL=-24.0)
    # 水溝（兩邊 38 cm）＋白線（距牆 0.55 m）；巷口斷開。禁停紅線：便利商店前（A 側 40..47.3）、路口前 8 m（B 側 39..47.3）
    shrink = lambda M: [(a + 0.38, b - 0.38) for a, b in M]     # 巷口兩邊各留一節水溝（38 cm）：接上側巷沿牆的水溝
    R.gutter(X0, X1, 5.0, 4.62, gap=shrink(mouthA))
    R.gutter(X0, X1, -5.0, -4.62, gap=shrink(mouthB))
    def edge_line(z, mouths, red):
        segs = []; s = X0
        for a, b in sorted(mouths):
            if a > s: segs.append((s, a))
            s = max(s, b)
        segs.append((s, X1 - 1.2))
        for a, b in segs:
            cuts = [a] + [c for c in sorted(set(sum(red, ()))) if a < c < b] + [b]
            for p, q in zip(cuts, cuts[1:]):
                isred = any(r0 <= (p + q) / 2 <= r1 for r0, r1 in red)
                R.line([(p + 0.3, z), (q - 0.3, z)], 0.1, (178, 52, 44) if isred else (233, 231, 225), wear=0.3)
    # 機車停車格（台北巷子的白框，一格一台）：位置照遊戲裡的機車（zones3d.js 溫州街的 scRow：起點 x、台數、z；間距 0.85，車身 z ±0.9）。
    # 停車格那一段沒有白色邊線（白框就在路邊）。改 scRow 的位置要一起改這裡（README）
    BAYS = [(-11.5, 2, 1), (-6.8, 3, 1), (16.4, 4, 1), (5.0, 12, -1), (31.5, 8, -1), (-28.5, 6, -1)]
    def bay_rng(sd): return [(x0 - 0.5, x0 + (n - 1) * 0.85 + 0.5) for x0, n, s in BAYS if s == sd]
    edge_line(4.45, mouthA + bay_rng(1), [(40.0, 47.3)])
    edge_line(-4.45, mouthB + bay_rng(-1), [(39.0, 47.3)])
    for x0, n, sd in BAYS:
        xa, xb = x0 - 0.425, x0 + (n - 1) * 0.85 + 0.425; zo, zi = 4.56 * sd, 2.86 * sd
        col = (232, 230, 223)
        R.line([(xa, zi), (xb, zi)], 0.1, col, wear=0.35)                 # 靠路中間的長邊
        for k in range(n + 1):
            xk = xa + k * 0.85; R.line([(xk, zi), (xk, zo)], 0.08, col, wear=0.35)   # 每一格的隔線
        for k in range(n):   # 停車的地方：機車腳架、輪胎的油漬和磨痕（比較髒）
            if R.rng.random() < 0.6: R.stain(xa + (k + 0.5) * 0.85 + R.rng.uniform(-0.1, 0.1), (3.75 + R.rng.uniform(-0.3, 0.3)) * sd, R.rng.uniform(0.12, 0.22), dL=R.rng.uniform(-14, -8))
    zebra(R)    # 先畫斑馬線：x 46.6 的人孔在斑馬線裡，鐵蓋上沒有漆
    # 人孔（位置照套件 TK.road 的 manholes：x＝−11、23、47）＋手孔
    R.manhole(-11.0, 0.5); R.manhole(23.0, -1.2); R.manhole(46.6, 0.8, r=0.38)
    R.handhole(-24.0, 3.9); R.handhole(12.6, -3.95); R.handhole(33.0, 3.95)
    # 「慢」（位置照套件：x −16（z −1.8）、x 13（z 1.8））：字頭朝前進方向
    R.text('慢', -16.0, -1.8, 2.6, 1.5, 0.0); R.text('慢', 13.0, 1.8, 2.6, 1.5, math.pi)
    # 路口停止線（斑馬線在上面先畫了）
    R.line([(44.75, -4.35), (44.75, 4.35)], 0.3, (233, 231, 225), wear=0.35)
    return R.render(None), (X0, X1, Z0, Z1), (lambda x, z: ((x - X0) * pu, (z - Z0) * pv))


# ======================== Café 前的南北向路：x 47.3..55.3、z −46..49.5 ========================
def ns_road():
    X0, X1, Z0, Z1 = 47.3, 55.3, -46.0, 49.5
    W, H = 4064, 344; pu = W / (Z1 - Z0); pv = H / (X1 - X0)
    to_px = lambda x, z: (int(round((z - Z0) * pu)), int(round((X1 - x) * pv)))    # 欄＝z（往北）、列 0＝東邊（Café 那一側）
    R = Road(W, H, to_px, (pu + pv) / 2, seed=1017)
    R.from_px = lambda col, row: (X1 - row / pv, Z0 + col / pu)
    R.base()
    yy, xx = np.mgrid[:H, :W].astype(np.float32); wx, wz = R.from_px(xx, yy)
    mouthW = [(-5.0, 5.0)]          # 西側：主巷接進來
    # 雙向：每個方向汽車兩條輪跡＋機車
    for xc, wdt, dL in ((49.0, 0.3, -6.5), (50.6, 0.3, -6.5), (52.0, 0.3, -6.5), (53.6, 0.3, -6.5), (48.3, 0.45, -3.5), (54.4, 0.45, -3.5)):
        R.band(lambda: np.exp(-((wx - xc) / wdt) ** 2) * (0.75 + 0.25 * np.sin(wz * 0.29) * np.sin(wz * 0.13)), dL)
    R.patch(R.rect_world(48.0, -30.0, 48.7, 2.0, 0.03), dL=-9)                # 西側管線挖補
    for x0, z0, w, d in ((50.2, -12.5, 2.4, 3.2), (51.6, 6.0, 1.6, 1.5), (49.2, 20.0, 2.8, 2.0), (52.4, -24.0, 1.8, 2.6)):
        R.patch(R.rect_world(x0, z0, x0 + w, z0 + d), dL=R.rng.uniform(-13, -7))
    R.patch(R.rect_world(47.6, -4.9, 55.0, 4.9, 0.04), dL=-5, seam=-12)        # 路口整片重鋪
    for _ in range(8):
        R.crack(R.rng.uniform(48, 54.6), R.rng.uniform(-40, 44), R.rng.uniform(0, math.pi), R.rng.uniform(0.8, 2.8))
    for _ in range(12):
        z = R.rng.uniform(-40, 44); x = R.rng.choice([48.0, 54.6]) + R.rng.uniform(-0.3, 0.3)
        if not (x < 49 and -5 < z < 5): R.stain(x, z, R.rng.uniform(0.25, 0.55), dL=R.rng.uniform(-20, -10))
    def dist_wall():
        dW = np.where((wz > -5) & (wz < 5), 99, wx - 47.3); dE = 55.3 - wx
        return np.minimum(dW, dE)
    R.ao_edge(dist_wall, width=0.45, dL=-22.0)
    R.gutter(Z0, Z1, 47.3, 47.68, along='z', gap=mouthW)
    R.gutter(Z0, Z1, 53.26, 52.88, along='z')                 # 東側：Café 門前的紅磚道（x 53.35..55.25）外面那一條
    for x in (47.85,):
        for a, b in ((Z0 + 0.3, -5.6), (5.6, Z1 - 0.3)):
            red = (a < 0 and b > -14) or (a > 0 and a < 14)
            if red:   # 路口 ±14 m 禁停紅線
                if a < 0: R.line([(x, a), (x, -14.0)], 0.1, (233, 231, 225), wear=0.3); R.line([(x, -14.0), (x, b)], 0.1, (178, 52, 44), wear=0.3)
                else: R.line([(x, a), (x, 14.0)], 0.1, (178, 52, 44), wear=0.3); R.line([(x, 14.0), (x, b)], 0.1, (233, 231, 225), wear=0.3)
    R.line([(52.75, Z0 + 0.3), (52.75, -14.0)], 0.1, (233, 231, 225), wear=0.3)
    R.line([(52.75, -14.0), (52.75, 14.0)], 0.1, (178, 52, 44), wear=0.3)
    R.line([(52.75, 14.0), (52.75, Z1 - 0.3)], 0.1, (233, 231, 225), wear=0.3)
    R.manhole(50.6, -8.5); R.manhole(51.2, 24.0, r=0.38); R.handhole(48.3, 11.0, ang=math.pi / 2)
    zebra(R)
    return R.render(None), (X0, X1, Z0, Z1), (lambda x, z: ((z - Z0) * pu, (X1 - x) * pv))


# ======================== 側巷（北巷、南巷、西端南北向巷的兩段）：一張貼圖集 ========================
# 套件的側巷路面（zones3d.js 溫州街 roads[1..3]）：北巷 x 3.25..8.25、z 4..21；南巷 x −14.75..−9.75、z −20..−4；西端 x −36.9..−29.9、z −16..16。
# 主巷那一段（z ±5）在主巷那一塊裡，這裡只畫主巷外面的部分；四塊在 build_atlas 轉 90° 排成一列。
SIDE_PPM = 40.0
SIDE = [  # 名字、X0、X1、Z0、Z1、牆在哪幾邊（'x0'、'x1'＝沿 z 的兩側牆；'z0'、'z1'＝巷底）、接主巷的那一邊、種子
    ('n', 3.25, 8.25, 5.0, 21.0, ('x0', 'x1', 'z1'), 'z0', 2101),
    ('s', -14.75, -9.75, -20.0, -5.0, ('x0', 'x1'), 'z1', 2102),
    ('wn', -36.9, -29.9, 5.0, 16.0, ('x1',), 'z0', 2103),
    ('ws', -36.9, -29.9, -16.0, -5.0, ('x1',), 'z1', 2104),
]


def side_piece(X0, X1, Z0, Z1, walls, joint, seed):
    W, H = int(round((X1 - X0) * SIDE_PPM)), int(round((Z1 - Z0) * SIDE_PPM)); pu, pv = W / (X1 - X0), H / (Z1 - Z0)
    R = Road(W, H, lambda x, z: (int(round((x - X0) * pu)), int(round((z - Z0) * pv))), (pu + pv) / 2, seed)
    R.from_px = lambda col, row: (X0 + col / pu, Z0 + row / pv)
    R.base(); R.L -= R.L.mean()     # 一塊只有 5～7 m 寬：大尺度的深淺（3 m）平均不是 0，整塊會比主巷深或淺 → 拉回主巷的底色
    yy, xx = np.mgrid[:H, :W].astype(np.float32); wx, wz = R.from_px(xx, yy); xc = (X0 + X1) / 2
    for d, wdt, dL in ((-0.7, 0.3, -7.0), (0.7, 0.3, -7.0)):          # 窄巷：車走中間一條
        R.band(lambda: np.exp(-((wx - xc - d) / wdt) ** 2) * (0.75 + 0.25 * np.sin(wz * 0.41) * np.sin(wz * 0.17)), dL)
    for h in range(2):   # 前半段、後半段各一塊（不重疊）
        x0 = R.rng.uniform(X0 + 0.8, X1 - 2.2); zm = Z0 + (Z1 - Z0) * h / 2; z0 = R.rng.uniform(zm + 0.8, zm + (Z1 - Z0) / 2 - 3.0)
        R.patch(R.rect_world(x0, z0, x0 + R.rng.uniform(1.0, 1.8), z0 + R.rng.uniform(1.0, 2.2)), dL=R.rng.uniform(-13, -7))
    if X1 - X0 > 6:   # 西端巷子比較寬：一條管線挖補
        R.patch(R.rect_world(X0 + 1.2, Z0 + 0.4, X0 + 1.8, Z1 - 0.4, 0.03), dL=-9)
    for _ in range(3): R.crack(R.rng.uniform(X0 + 0.6, X1 - 0.6), R.rng.uniform(Z0 + 0.6, Z1 - 0.6), R.rng.uniform(0, math.pi), R.rng.uniform(0.6, 2.2))
    for _ in range(4): R.stain(R.rng.choice([X0 + 0.9, X1 - 0.9]) + R.rng.uniform(-0.2, 0.2), R.rng.uniform(Z0 + 1, Z1 - 1), R.rng.uniform(0.2, 0.45), dL=R.rng.uniform(-18, -10))
    def dist_wall():
        d = np.full(wx.shape, 99.0, np.float32)
        if 'x0' in walls: d = np.minimum(d, wx - X0)
        if 'x1' in walls: d = np.minimum(d, X1 - wx)
        if 'z0' in walls: d = np.minimum(d, wz - Z0)
        if 'z1' in walls: d = np.minimum(d, Z1 - wz)
        return d
    R.ao_edge(dist_wall, width=0.45, dL=-24.0)
    for k in ('x0', 'x1'):   # 沿牆的水溝（接主巷那一頭接到主巷的水溝）
        if k in walls: R.gutter(Z0, Z1, X0 if k == 'x0' else X1, X0 + 0.38 if k == 'x0' else X1 - 0.38, along='z')
    R.manhole(xc + R.rng.uniform(-0.6, 0.6), (Z0 + Z1) / 2 + R.rng.uniform(-2, 2), r=0.36)
    if 'x1' in walls: R.handhole(X1 - 0.9, Z0 + (Z1 - Z0) * 0.3, ang=math.pi / 2)
    return R.render(None)


def build_atlas():
    """三種路面合成一張貼圖、一個材質（wz_road）：原本三個材質＝三次 draw call，溫州街 arcade 鏡頭因此到 311（LAWWW 的目標 ≤310）。
    排法（AW 4096）：主巷 4064×480、南北向路 4064×344、側巷四塊轉 90°（沿 z 的長邊放橫的）排一列；每塊四周 16 px 邊緣延伸（mipmap 不會混到隔壁）。
    wz_road_atlas.json：每塊的世界範圍和四個角的 UV（Blender 的 UV，圖的上緣 v＝1），wz_props.py 照這個鋪四邊形。"""
    pad = 16; AW = 4096
    parts = [('main',) + main_lane(), ('ns',) + ns_road()]
    for nm, X0, X1, Z0, Z1, walls, joint, seed in SIDE:
        im = side_piece(X0, X1, Z0, Z1, walls, joint, seed).transpose(Image.TRANSPOSE)          # 轉 90°：欄＝z、列＝x
        parts.append((nm, im, (X0, X1, Z0, Z1), (lambda X0, Z0: (lambda x, z: ((z - Z0) * SIDE_PPM, (x - X0) * SIDE_PPM)))(X0, Z0)))
    place = {}; y = pad; place['main'] = (pad, y); y += parts[0][1].height + 2 * pad; place['ns'] = (pad, y); y += parts[1][1].height + 2 * pad
    x = pad; rowh = 0
    for nm, im, *_ in parts[2:]: place[nm] = (x, y); x += im.width + 2 * pad; rowh = max(rowh, im.height)
    assert x - pad <= AW, x
    AH = int(math.ceil((y + rowh + pad) / 16) * 16)
    atlas = np.zeros((AH, AW, 3), np.uint8) + np.array([168, 168, 166], np.uint8); quads = []
    for nm, im, (X0, X1, Z0, Z1), lpx in parts:
        ox, oy = place[nm]; a = np.pad(np.asarray(im), ((pad, pad), (pad, pad), (0, 0)), mode='edge')       # 邊緣往外延伸
        atlas[oy - pad:oy - pad + a.shape[0], ox - pad:ox - pad + a.shape[1]] = a
        uv = lambda x, z: ((ox + lpx(x, z)[0]) / AW, 1 - (oy + lpx(x, z)[1]) / AH)
        quads.append({'name': nm, 'x0': X0, 'x1': X1, 'z0': Z0, 'z1': Z1, 'uv': [uv(X0, Z0), uv(X1, Z0), uv(X1, Z1), uv(X0, Z1)]})
    Image.fromarray(atlas, 'RGB').save(os.path.join(GEN, 'wz_road_atlas.jpg'), quality=88)
    import json; json.dump({'size': [AW, AH], 'grain_ppm': 45.0, 'quads': quads}, open(os.path.join(GEN, 'wz_road_atlas.json'), 'w'), indent=1)
    print('saved wz_road_atlas.jpg', (AW, AH))


def grain_normal(path, N=512, tile_m=1.0, seed=1018):
    """柏油顆粒的法線貼圖（可以無縫重複；一張＝tile_m 公尺）：路面大貼圖約 2 cm／像素，近景（手機直向下半部）是平的，
    這張用 KHR_texture_transform 每公尺重複一次，斜光下有細細的石子凹凸。全部程式產生（wrap 模糊，四邊接得起來）。"""
    r = np.random.default_rng(seed); ppm = N / tile_m
    h = gaussian_filter(r.standard_normal((N, N)).astype(np.float32), 0.7, mode='wrap') * 1.0          # 細砂
    st = (r.random((N, N)) > 0.9965).astype(np.float32)                                                    # 小石子（約 5～8 mm）
    h += gaussian_filter(st, 2.2, mode='wrap') * 9.0
    h -= gaussian_filter(r.standard_normal((N, N)).astype(np.float32), 0.004 * ppm * 3, mode='wrap') * 0.4  # 石子之間的縫
    h = (h - h.mean()) / (h.std() + 1e-6)
    gx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * 0.5; gy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * 0.5
    k = 0.35; nx, ny, nz = -gx * k, gy * k, np.ones_like(h)                                                 # OpenGL 法線（+y 往上）
    ln = np.sqrt(nx * nx + ny * ny + nz * nz); n = np.stack([nx / ln, ny / ln, nz / ln], -1)
    Image.fromarray(((n * 0.5 + 0.5) * 255).clip(0, 255).astype(np.uint8), 'RGB').save(path); print('saved', path)


if __name__ == '__main__':
    os.makedirs(GEN, exist_ok=True)
    build_atlas(); grain_normal(os.path.join(GEN, 'wz_road_grain_nor.png'))
