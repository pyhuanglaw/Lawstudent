"""ART-PARK2 溫州街小公園的鞦韆＋三件體健器材（LAWWW2-B 分工 2026-10-16 15:58；AA-B 支援製作；驗收清單 SCENE_RULES 第 9 節「得獎遊戲」標準）
  /opt/blenv/bin/python tools/blender/env_second/aa_support/park2_props.py [-- --out assets/models/env/second_ai/aa_support/park2_props.glb]

取代 wz_park.py 裡用圓柱、方塊拼的鞦韆和健身器材。位置照 src/data/wz_park_layout.js（swings、fit1～fit3），GLB 裡照各自的本地原點排開（PARK1 的做法）。
參考的真實樣子：台灣社區公園常見的體健設施——綠色烤漆鋼管、黃色的轉盤和轉輪、混凝土基座上的法蘭和螺栓、旁邊一塊畫圖示的說明牌；
鞦韆是 A 字型鋼架、鑄鐵頂座、鍍鋅鏈條、下段套黑色 PVC 護套、橡膠彎座。用了三到五年、有人維護：握把和踏板掉漆露出鋼，腳底有泥和一點鏽水。
節點（每件一個頂層節點；原點＝地面上的底部中央，正面＝人站的那一側朝 +z）：
  PARK_SWINGS          框架（A 字腳 x ±1.9、z ±0.7，橫桿 2.35 m）＋頂座、吊環、混凝土基座
  PARK_SWING_SEAT_A/B  鏈條＋護套＋橡膠座；原點＝橫桿下的吊點中心（本地 x ±0.9 在框架上），繞本地 x 軸轉就是盪鞦韆
  PARK_FIT_WAIST       扭腰盤（後面一根柱子＋U 型扶手、前面的轉盤）
  PARK_FIT_SHOULDER    肩部大轉輪（柱子前後各一個輪子）
  PARK_FIT_LEG         漫步機（兩根側柱、往前彎的扶手、兩支擺臂和踏板）
  PARK_FIT_TOWEL       掛在扭腰盤扶手上的毛巾（生活痕跡，可以拿掉）
  PARK_FIT_BOTTLE      漫步機腳邊的水瓶（生活痕跡，沒有字和品牌）
材質一個：park2（1024 底色圖集＋256 ORM；metal 最高 0.40）。混凝土＝Poly Haven concrete_wall_006（CC0）的明暗；其他（烤漆的橘皮紋、掉漆、鏽水、泥、
鏈環、橡膠的止滑點、轉盤的放射紋、說明牌的圖示）都是 numpy／PIL 畫的。AO 畫在底色上（接合處、落地端乘 0.75～0.85）。
"""
import json, math, os, random, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
PARENT = os.path.dirname(HERE)
sys.path.insert(0, PARENT)
import lib2 as L   # noqa: E402
from lib2 import B, g2b, bpy, bmesh   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/aa_support/park2_props.glb'
GEN = os.path.join(PARENT, 'textures', 'gen')
ATLAS, ATLAS_ORM = (os.path.join(GEN, f'park2_props_{k}.png') for k in ('atlas', 'orm'))
SRC_CONC = os.path.join(PARENT, 'textures', 'concrete_wall_006', 'concrete_wall_006_diff_1k.jpg')
N, SS, ORM_N = 1024, 2, 256
METAL = 0.40
rng = np.random.default_rng(20261016)
random.seed(20261016)

# ================= 貼圖集的區塊（像素，左上原點） =================
REG = {
    'pg_body': (0, 0, 256, 256), 'pg_foot': (256, 0, 512, 256), 'py_body': (512, 0, 768, 256), 'py_worn': (768, 0, 1024, 256),
    'pg_worn': (0, 256, 256, 512), 'rubber': (256, 256, 512, 384), 'sleeve': (256, 384, 512, 512), 'chain': (512, 256, 640, 512),
    'disc': (640, 256, 896, 512), 'pedal': (896, 256, 1024, 384), 'towel': (896, 384, 1024, 512),
    'concrete': (0, 512, 256, 768), 'cast': (256, 512, 512, 768), 'plate_w': (512, 512, 640, 768), 'plate_s': (640, 512, 768, 768),
    'plate_l': (768, 512, 896, 768), 'bottle': (896, 512, 1024, 768),
    'pg_join': (0, 768, 128, 1024), 'py_join': (128, 768, 256, 1024),
}
GREEN, YELLOW, STEEL, RUST, DIRT = (62, 110, 78), (214, 168, 52), (100, 100, 98), (122, 72, 42), (106, 90, 72)
SW = {   # 色塊：顏色、粗糙度、金屬度
    'galv': ((138, 140, 142), 0.42, METAL), 'bolt': ((104, 106, 108), 0.45, METAL), 'steel': (STEEL, 0.32, 0.35),
    'weld_g': ((46, 82, 58), 0.6, 0.0), 'weld_y': ((168, 128, 40), 0.6, 0.0), 'cap_g': ((58, 104, 74), 0.4, 0.0),
    'cap_y': ((206, 160, 50), 0.42, 0.0), 'tape': ((44, 92, 160), 0.5, 0.0), 'grip_k': ((34, 34, 36), 0.55, 0.0),
    'bear': ((70, 72, 74), 0.5, 0.3), 'cap_w': ((226, 228, 230), 0.35, 0.0), 'cap_b': ((52, 96, 150), 0.35, 0.0),
    'flange_g': ((52, 94, 66), 0.5, 0.0), 'cast_dark': ((36, 62, 46), 0.6, 0.0),
}
SW_CELL = 32
for i, k in enumerate(SW):
    REG['sw_' + k] = (256 + (i % 24) * SW_CELL, 768 + (i // 24) * SW_CELL, 256 + (i % 24) * SW_CELL + SW_CELL, 768 + (i // 24) * SW_CELL + SW_CELL)


def sz(name):
    x0, y0, x1, y1 = REG[name]; return (y1 - y0) * SS, (x1 - x0) * SS   # (高, 寬)


# ================= 畫貼圖 =================
def pnoise(h, w, radius, seed=None, wrap=True):
    """常態化的平滑雜訊；wrap：上下左右都能接（管子繞一圈、一段接一段不會有縫）"""
    g = np.random.default_rng(seed) if seed is not None else rng
    a = g.standard_normal((h, w)).astype(np.float32)
    if wrap: a = np.tile(a, (3, 3))
    im = Image.fromarray(np.clip(a * 40 + 128, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius))
    b = np.asarray(im, np.float32)
    if wrap: b = b[h:2 * h, w:2 * w]
    return (b - b.mean()) / max(1e-3, b.std())


def col(h, w, c): return np.ones((h, w, 3), np.float32) * np.array(c, np.float32)


def paint_steel(h, w, base, seed, chips=0.0025, chip_scale=1.1, worn_band=None, worn_k=0.0, foot=False, join=False):
    """烤漆鋼管：橘皮紋＋細刮痕＋掉漆（露出鋼）＋掉漆邊緣的暗圈；foot：下面有泥和鏽水；join：下面一段是接合處的暗（AO）。
    回傳 (rgb, rough, metal) 三個陣列。worn_band：(t0, t1) 的範圍（列的比例）掉漆比較多（握把）"""
    rgb = col(h, w, base)
    peel = pnoise(h, w, 1.2 * SS, seed); rgb *= (1 + 0.035 * np.clip(peel, -2.5, 2.5))[..., None]
    broad = pnoise(h, w, 18 * SS, seed + 1); rgb *= (1 + 0.04 * np.clip(broad, -2.5, 2.5))[..., None]   # 曬過的深淺
    rough = 0.46 + 0.04 * np.clip(peel, -2, 2); metal = np.zeros((h, w), np.float32)
    # 掉漆：閾值化的雜訊，握把的範圍比較多
    cn = pnoise(h, w, chip_scale * SS, seed + 2)
    dens = np.full((h, 1), chips, np.float32)
    if worn_band:
        r0, r1 = int(worn_band[0] * h), int(worn_band[1] * h); dens[r0:r1] = chips + worn_k
    if foot: dens += np.linspace(0, 0.05, h, dtype=np.float32)[:, None] ** 1.5 * 6   # 靠地面（下面的列）比較多
    thr = np.quantile(cn, 1 - np.clip(dens, 0, 0.6), axis=None) if np.ndim(dens) == 0 else None
    q = np.argsort(np.argsort(cn.ravel())).reshape(cn.shape) / cn.size   # 每個像素的分位
    chip = (q > 1 - dens).astype(np.float32)
    chip_im = Image.fromarray((chip * 255).astype(np.uint8))
    rim = np.asarray(chip_im.filter(ImageFilter.MaxFilter(5)), np.float32) / 255 - chip
    rgb = rgb * (1 - 0.22 * rim[..., None])
    steel = col(h, w, STEEL) * (1 + 0.06 * np.clip(pnoise(h, w, 0.8 * SS, seed + 3), -2, 2))[..., None]
    rgb = rgb * (1 - chip[..., None]) + steel * chip[..., None]
    rough = rough * (1 - chip) + 0.3 * chip; metal = 0.35 * chip
    # 細刮痕（淺）
    im = Image.fromarray(np.zeros((h, w), np.uint8)); d = ImageDraw.Draw(im); g = random.Random(seed)
    for _ in range(int(w * h / 9000)):
        x, y = g.uniform(0, w), g.uniform(0, h); L_ = g.uniform(6, 30) * SS; a = g.uniform(-0.6, 0.6) + (math.pi / 2 if g.random() < 0.5 else 0)
        d.line([(x, y), (x + L_ * math.cos(a), y + L_ * math.sin(a))], fill=g.randint(40, 90), width=1)
    sc = np.asarray(im, np.float32) / 255; rgb = rgb * (1 + 0.18 * sc[..., None]); rough = rough - 0.08 * sc
    if foot:   # 泥（下面一段）、鏽水從掉漆往下流
        t = np.linspace(0, 1, h, dtype=np.float32)[:, None]   # 0＝上面（離地 0.4 m），1＝地面
        dn = pnoise(h, w, 6 * SS, seed + 4)
        mud = np.clip((t - 0.55 + 0.06 * dn) / 0.27, 0, 1) ** 1.2
        rgb = rgb * (1 - 0.75 * mud[..., None]) + col(h, w, DIRT) * (0.75 * mud[..., None])
        rough = rough * (1 - mud) + 0.85 * mud; metal = metal * (1 - mud)
        streak = np.zeros((h, w), np.float32)
        ys, xs = np.nonzero(chip[: int(h * 0.8)])
        for k in range(0, len(ys), max(1, len(ys) // 60)):
            y0, x0 = ys[k], xs[k]; ln = int(g.uniform(10, 40) * SS); x1 = min(w, x0 + 2)
            streak[y0:min(h, y0 + ln), x0:x1] += np.linspace(0.5, 0, min(h, y0 + ln) - y0)[:, None]
        streak = np.asarray(Image.fromarray(np.clip(streak * 255, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0 * SS)), np.float32) / 255
        rgb = rgb * (1 - 0.6 * streak[..., None]) + col(h, w, RUST) * (0.6 * streak[..., None])
        # 落地的最後一段：接觸的暗（AO）
        ao = np.clip((t - 0.9) / 0.1, 0, 1); rgb *= (1 - 0.25 * ao)[..., None]
    if join:   # 下面（t＝0）是接合處：AO 乘 0.78，往上 8 cm 淡掉
        t = np.linspace(0, 1, h, dtype=np.float32)[:, None]
        ao = np.clip((t - 0.5) / 0.5, 0, 1) ** 1.4; rgb *= (1 - 0.25 * ao)[..., None]; rough = rough + 0.05 * ao
    return rgb, np.clip(rough, 0.12, 0.95), np.clip(metal, 0, METAL)


def paint_rubber(h, w):
    rgb = col(h, w, (40, 40, 42)); n = pnoise(h, w, 1.0 * SS, 51); rgb *= (1 + 0.05 * np.clip(n, -2, 2))[..., None]
    rough = np.full((h, w), 0.86, np.float32)
    im = Image.fromarray(np.zeros((h, w), np.uint8)); d = ImageDraw.Draw(im)
    step = 8 * SS
    for y in range(step // 2, h, step):
        for x in range((y // step % 2) * step // 2, w, step): d.ellipse([x - 2 * SS, y - 2 * SS, x + 2 * SS, y + 2 * SS], fill=255)   # 止滑點
    dots = np.asarray(im.filter(ImageFilter.GaussianBlur(0.6 * SS)), np.float32) / 255
    rgb *= (1 + 0.16 * dots)[..., None]
    s = np.linspace(-1, 1, w, dtype=np.float32)[None, :]; tt = np.linspace(-1, 1, h, dtype=np.float32)[:, None]
    worn = np.clip(1 - (s / 0.55) ** 2, 0, 1) * np.clip(1 - (tt / 0.75) ** 2, 0, 1)   # 座面中間磨淺
    rgb = rgb * (1 - 0.35 * worn[..., None]) + col(h, w, (70, 70, 72)) * (0.35 * worn[..., None]); rgb *= (1 - 0.12 * dots * worn)[..., None]
    rough = rough - 0.16 * worn
    edge = np.clip((np.abs(s) - 0.9) / 0.1, 0, 1); rgb *= (1 - 0.3 * edge)[..., None]   # 兩端夾在鋼夾裡：暗
    return rgb, rough, np.zeros((h, w), np.float32)


def paint_sleeve(h, w):
    rgb = col(h, w, (30, 30, 32)); n = pnoise(h, w, 2 * SS, 61); rgb *= (1 + 0.05 * np.clip(n, -2, 2))[..., None]
    t = np.linspace(0, 1, h, dtype=np.float32)[:, None]   # 0＝上端
    hand = np.clip(1 - ((t - 0.25) / 0.18) ** 2, 0, 1) * (0.7 + 0.3 * np.clip(pnoise(h, w, 4 * SS, 62), -1, 1))   # 手握的高度：亮、滑
    rgb = rgb + 16 * hand[..., None]; rough = 0.62 - 0.22 * hand
    for y in range(0, h, 10 * SS): rgb[y:y + SS] *= 0.9   # 擠出管的細紋
    return rgb, rough.astype(np.float32), np.zeros((h, w), np.float32)


def paint_chain(h, w):
    """鍍鋅鏈：沿 t 一環一環（亮的正面環、窄的側面環交替），環之間是暗的縫"""
    rgb = col(h, w, (70, 72, 74)); rough = np.full((h, w), 0.5, np.float32); metal = np.full((h, w), 0.2, np.float32)
    im = Image.fromarray(np.zeros((h, w), np.uint8)); d = ImageDraw.Draw(im)
    pitch = h / 25.0
    for k in range(26):
        y = k * pitch; wide = k % 2 == 0; hw = (0.36 if wide else 0.16) * w
        d.ellipse([w / 2 - hw, y - pitch * 0.62, w / 2 + hw, y + pitch * 0.62], outline=255, width=int(max(2, pitch * 0.22)))
        if not wide: d.line([(w / 2, y - pitch * 0.5), (w / 2, y + pitch * 0.5)], fill=200, width=int(max(2, pitch * 0.2)))
    m = np.asarray(im.filter(ImageFilter.GaussianBlur(0.7 * SS)), np.float32) / 255
    rgb = rgb * (1 - m[..., None]) + col(h, w, (178, 180, 182)) * m[..., None] * (1 + 0.08 * np.clip(pnoise(h, w, 1 * SS, 71), -2, 2))[..., None]
    rough = 0.55 - 0.15 * m; metal = 0.15 + 0.25 * m
    return rgb, rough, np.clip(metal, 0, METAL)


def paint_disc(h, w):
    """轉盤的頂面（平面投影）：黃色、放射狀的止滑紋、中間踩得比較亮、邊緣一圈深色"""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32); cx, cy = w / 2, h / 2; r = np.hypot(xx - cx, yy - cy) / (w / 2); a = np.arctan2(yy - cy, xx - cx)
    rgb = col(h, w, YELLOW) * (1 + 0.03 * np.clip(pnoise(h, w, 1.2 * SS, 81), -2, 2))[..., None]
    ridge = (np.cos(a * 36) > 0.55) & (r > 0.32) & (r < 0.9)
    rgb[ridge] *= 1.1
    rgb *= (1 - 0.18 * ((r > 0.92) & (r < 1.0)))[..., None]
    foot = np.clip(1 - (r / 0.75) ** 2, 0, 1) * (0.6 + 0.4 * np.clip(pnoise(h, w, 6 * SS, 82), -1, 1))   # 踩的地方：漆磨薄、有灰
    rgb = rgb * (1 - 0.3 * foot[..., None]) + col(h, w, (150, 140, 118)) * (0.3 * foot[..., None])
    cn = pnoise(h, w, 1.5 * SS, 83); chip = (cn > 2.0 - 0.8 * foot).astype(np.float32)
    rgb = rgb * (1 - chip[..., None]) + col(h, w, STEEL) * chip[..., None]
    hub = r < 0.14; rgb[hub] = (rgb[hub] * 0.5 + np.array((90, 90, 92)) * 0.5)
    rough = 0.5 - 0.15 * foot; rough[ridge] += 0.05; metal = 0.35 * chip
    return rgb, rough.astype(np.float32), metal.astype(np.float32)


def paint_pedal(h, w):
    rgb = col(h, w, YELLOW); yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    ridge = ((xx + yy) % (10 * SS) < 3 * SS) | ((xx - yy) % (10 * SS) < 3 * SS)   # 菱形止滑紋
    rgb[ridge] *= 1.08
    s = (xx / w - 0.5) * 2; t = (yy / h - 0.5) * 2; foot = np.clip(1 - (s / 0.8) ** 2, 0, 1) * np.clip(1 - (t / 0.7) ** 2, 0, 1)
    rgb = rgb * (1 - 0.4 * foot[..., None]) + col(h, w, (124, 118, 100)) * (0.4 * foot[..., None])
    chip = (pnoise(h, w, 1.2 * SS, 91) > 1.8 - 1.0 * foot).astype(np.float32)
    rgb = rgb * (1 - chip[..., None]) + col(h, w, STEEL) * chip[..., None]
    return rgb, (0.5 - 0.12 * foot).astype(np.float32), (0.35 * chip).astype(np.float32)


def paint_towel(h, w):
    rgb = col(h, w, (232, 230, 222)) * (1 + 0.05 * np.clip(pnoise(h, w, 0.6 * SS, 101), -2, 2))[..., None]
    for y0 in (int(h * 0.1), int(h * 0.82)): rgb[y0:y0 + int(h * 0.06)] = rgb[y0:y0 + int(h * 0.06)] * 0.55 + np.array((60, 110, 170)) * 0.45   # 兩條藍線
    rgb[: int(h * 0.04)] *= 0.92; rgb[-int(h * 0.04):] *= 0.92   # 收邊
    return rgb, np.full((h, w), 0.95, np.float32), np.zeros((h, w), np.float32)


def paint_concrete(h, w):
    im = Image.open(SRC_CONC).convert('L').resize((w, h), Image.LANCZOS); z = np.asarray(im, np.float32); z = (z - z.mean()) / max(1, z.std())
    rgb = col(h, w, (158, 154, 146)) * (1 + 0.09 * np.clip(z, -2.5, 2.5))[..., None]
    t = np.linspace(0, 1, h, dtype=np.float32)[:, None]   # 0＝上面（鋼管插進去的地方）
    ao = np.clip(1 - t / 0.25, 0, 1) ** 1.5 * 0.0 + np.clip((t - 0.75) / 0.25, 0, 1) * 0.25   # 下緣和地面接觸：暗
    dirt = np.clip((t - 0.45) / 0.55, 0, 1) * (0.5 + 0.5 * np.clip(pnoise(h, w, 5 * SS, 111), -1, 1))
    rgb = rgb * (1 - 0.35 * dirt[..., None]) + col(h, w, DIRT) * (0.35 * dirt[..., None]); rgb *= (1 - ao)[..., None]
    return rgb, (0.88 + 0.04 * np.clip(z, -1, 1)).astype(np.float32), np.zeros((h, w), np.float32)


def paint_cast(h, w):
    """鑄鐵頂座：深綠漆、鑄件的粗面、邊角掉漆"""
    rgb = col(h, w, (44, 82, 58)); z = pnoise(h, w, 0.7 * SS, 121); rgb *= (1 + 0.07 * np.clip(z, -2, 2))[..., None]
    chip = (pnoise(h, w, 2.5 * SS, 122) > 1.9).astype(np.float32)
    rgb = rgb * (1 - chip[..., None]) + col(h, w, (96, 92, 88)) * chip[..., None]
    rust = (pnoise(h, w, 3 * SS, 123) > 2.3).astype(np.float32) * 0.5; rgb = rgb * (1 - rust[..., None]) + col(h, w, RUST) * rust[..., None]
    return rgb, (0.58 + 0.05 * np.clip(z, -1, 1)).astype(np.float32), (0.2 * chip).astype(np.float32)


def paint_plate(h, w, kind):
    """說明牌：米白搪瓷、綠框、四個鉚釘、器材的圖示（沒有字），褪色、一道鏽水"""
    im = Image.new('RGB', (w, h), (226, 222, 210)); d = ImageDraw.Draw(im); m = int(0.06 * w)
    d.rectangle([m // 2, m // 2, w - m // 2, h - m // 2], outline=(58, 104, 74), width=m)
    for (x, y) in ((1.6 * m, 1.6 * m), (w - 1.6 * m, 1.6 * m), (1.6 * m, h - 1.6 * m), (w - 1.6 * m, h - 1.6 * m)): d.ellipse([x - 5 * SS, y - 5 * SS, x + 5 * SS, y + 5 * SS], fill=(150, 150, 150))
    c = (58, 104, 74); lw = int(5 * SS); cx = w / 2
    def person(px, py, sc=1.0, arms='up'):
        d.ellipse([px - 10 * SS * sc, py - 62 * SS * sc, px + 10 * SS * sc, py - 42 * SS * sc], fill=c)
        d.line([(px, py - 40 * SS * sc), (px, py)], fill=c, width=lw)
        d.line([(px, py), (px - 12 * SS * sc, py + 34 * SS * sc)], fill=c, width=lw); d.line([(px, py), (px + 12 * SS * sc, py + 34 * SS * sc)], fill=c, width=lw)
        if arms == 'up': d.line([(px - 22 * SS * sc, py - 30 * SS * sc), (px + 22 * SS * sc, py - 30 * SS * sc)], fill=c, width=lw)
        else: d.line([(px, py - 32 * SS * sc), (px + 26 * SS * sc, py - 50 * SS * sc)], fill=c, width=lw); d.line([(px, py - 32 * SS * sc), (px - 26 * SS * sc, py - 14 * SS * sc)], fill=c, width=lw)
    if kind == 'w':
        person(cx, h * 0.5); d.ellipse([cx - 34 * SS, h * 0.5 + 30 * SS, cx + 34 * SS, h * 0.5 + 44 * SS], outline=c, width=lw)
        d.arc([cx - 50 * SS, h * 0.5 - 20 * SS, cx + 50 * SS, h * 0.5 + 20 * SS], 200, 340, fill=c, width=lw)
        d.polygon([(cx + 48 * SS, h * 0.5 - 6 * SS), (cx + 56 * SS, h * 0.5 + 8 * SS), (cx + 40 * SS, h * 0.5 + 6 * SS)], fill=c)
    elif kind == 's':
        d.ellipse([cx - 44 * SS, h * 0.38 - 44 * SS, cx + 44 * SS, h * 0.38 + 44 * SS], outline=c, width=lw); person(cx - 6 * SS, h * 0.62, 0.9, arms='wheel')
        d.arc([cx - 58 * SS, h * 0.38 - 58 * SS, cx + 58 * SS, h * 0.38 + 58 * SS], 300, 30, fill=c, width=lw)
    else:
        person(cx, h * 0.48); d.line([(cx - 36 * SS, h * 0.48 + 40 * SS), (cx + 36 * SS, h * 0.48 + 40 * SS)], fill=c, width=lw)
        d.arc([cx - 40 * SS, h * 0.48 + 10 * SS, cx + 40 * SS, h * 0.48 + 60 * SS], 200, 340, fill=c, width=lw)
    rgb = np.asarray(im, np.float32)
    fade = 0.15 + 0.1 * np.clip(pnoise(h, w, 14 * SS, 131 + ord(kind)), -1, 1); rgb = rgb * (1 - fade[..., None]) + 220 * fade[..., None]   # 曬褪色
    t = np.linspace(0, 1, h, dtype=np.float32)[:, None]; sx = np.abs(np.linspace(0, 1, w, dtype=np.float32)[None, :] - (1.6 * m / w)) < 0.012
    streak = sx * np.clip(t - 1.6 * m / h, 0, 0.5) * 1.2; rgb = rgb * (1 - streak[..., None]) + col(h, w, RUST) * streak[..., None]   # 左上鉚釘的鏽水
    return rgb, np.full((h, w), 0.4, np.float32), np.zeros((h, w), np.float32)


def paint_bottle(h, w):
    """水瓶（展開）：淺藍的塑膠、中間一圈沒有字的白標籤、上面的瓶蓋另外是色塊"""
    rgb = col(h, w, (150, 188, 206)); t = np.linspace(0, 1, h, dtype=np.float32)[:, None]
    band = (t > 0.35) & (t < 0.62); rgb[np.broadcast_to(band, (h, w))] = (230, 232, 230)
    s = np.linspace(0, 1, w, dtype=np.float32)[None, :]; spec = np.clip(1 - (np.abs(s - 0.3) / 0.05) ** 2, 0, 1) * 40
    rgb += spec[..., None]
    for y in np.linspace(0.68, 0.9, 5): rgb[int(y * h):int(y * h) + SS] *= 0.9   # 瓶身的環紋
    return rgb, np.full((h, w), 0.22, np.float32), np.zeros((h, w), np.float32)


def make_textures():
    P = np.zeros((N * SS, N * SS, 3), np.float32); RO = np.full((N * SS, N * SS), 0.6, np.float32); ME = np.zeros((N * SS, N * SS), np.float32)
    def put(name, res):
        x0, y0, x1, y1 = REG[name]; rgb, ro, me = res
        P[y0 * SS:y1 * SS, x0 * SS:x1 * SS] = rgb; RO[y0 * SS:y1 * SS, x0 * SS:x1 * SS] = ro; ME[y0 * SS:y1 * SS, x0 * SS:x1 * SS] = me
    h, w = sz('pg_body'); put('pg_body', paint_steel(h, w, GREEN, 1))
    put('pg_foot', paint_steel(*sz('pg_foot'), GREEN, 11, chips=0.004, foot=True))
    put('py_body', paint_steel(*sz('py_body'), YELLOW, 21))
    put('py_worn', paint_steel(*sz('py_worn'), YELLOW, 31, chips=0.02, worn_band=(0.15, 0.85), worn_k=0.12, chip_scale=1.5))
    put('pg_worn', paint_steel(*sz('pg_worn'), GREEN, 41, chips=0.02, worn_band=(0.15, 0.85), worn_k=0.12, chip_scale=1.5))
    put('pg_join', paint_steel(*sz('pg_join'), GREEN, 141, join=True))
    put('py_join', paint_steel(*sz('py_join'), YELLOW, 151, join=True))
    put('rubber', paint_rubber(*sz('rubber'))); put('sleeve', paint_sleeve(*sz('sleeve'))); put('chain', paint_chain(*sz('chain')))
    put('disc', paint_disc(*sz('disc'))); put('pedal', paint_pedal(*sz('pedal'))); put('towel', paint_towel(*sz('towel')))
    put('concrete', paint_concrete(*sz('concrete'))); put('cast', paint_cast(*sz('cast')))
    for k in 'wsl': put('plate_' + k, paint_plate(*sz('plate_' + k), k))
    put('bottle', paint_bottle(*sz('bottle')))
    for k, (c, ro, me) in SW.items():
        x0, y0, x1, y1 = REG['sw_' + k]; P[y0 * SS:y1 * SS, x0 * SS:x1 * SS] = c; RO[y0 * SS:y1 * SS, x0 * SS:x1 * SS] = ro; ME[y0 * SS:y1 * SS, x0 * SS:x1 * SS] = min(me, METAL)
    os.makedirs(GEN, exist_ok=True)
    Image.fromarray(np.clip(P, 0, 255).astype(np.uint8)).resize((N, N), Image.LANCZOS).save(ATLAS)
    orm = np.stack([np.full_like(RO, 255), np.clip(RO, 0, 1) * 255, np.clip(ME, 0, METAL) * 255], -1).astype(np.uint8)
    Image.fromarray(orm).resize((ORM_N, ORM_N), Image.BILINEAR).save(ATLAS_ORM)


# ================= 網格工具（同 us_bath_props.py） =================
def ruv(name, s, t):
    x0, y0, x1, y1 = REG[name]; inset = SW_CELL * 0.33 if name.startswith('sw_') else 1.0
    px = x0 + inset + min(1, max(0, s)) * (x1 - x0 - 2 * inset); py = y0 + inset + (1 - min(1, max(0, t))) * (y1 - y0 - 2 * inset)
    return (px / N, 1 - py / N)


def R(name, flip=False): return lambda s, t: ruv(name, 1 - s if flip else s, t)
def S(name): return lambda s, t: ruv('sw_' + name, 0.5, 0.5)


def newell(ps):
    n = np.zeros(3)
    for i in range(len(ps)):
        a, b = ps[i], ps[(i + 1) % len(ps)]
        n += np.array([(a[1] - b[1]) * (a[2] + b[2]), (a[2] - b[2]) * (a[0] + b[0]), (a[0] - b[0]) * (a[1] + b[1])])
    return n


class PM:
    def __init__(self): self.v = []; self.f = []; self.uv = []
    def vid(self, p): self.v.append(np.array(p, float)); return len(self.v) - 1
    def face(self, ids, uvs, want=None):
        ids, uvs = list(ids), list(uvs)
        if want is not None and np.dot(newell([self.v[i] for i in ids]), want) < 0: ids.reverse(); uvs.reverse()
        self.f.append(ids); self.uv.append(uvs)
    def poly(self, pts, uvs, want): self.face([self.vid(p) for p in pts], uvs, want)
    def add(self, other, M=None):
        off = len(self.v)
        for p in other.v: self.v.append(p if M is None else M[:3, :3] @ p + M[:3, 3])
        for ids, uvs in zip(other.f, other.uv): self.f.append([i + off for i in ids]); self.uv.append(list(uvs))
        return self
    def tris(self): return sum(len(f) - 2 for f in self.f)
    def bbox(self):
        a = np.array(self.v); return [round(float(v), 4) for v in a.min(0)], [round(float(v), 4) for v in a.max(0)]


def T(x, y, z): M = np.eye(4); M[:3, 3] = (x, y, z); return M
def Ry(a): c, s = math.cos(a), math.sin(a); M = np.eye(4); M[0, 0], M[0, 2], M[2, 0], M[2, 2] = c, s, -s, c; return M
def Rx(a): c, s = math.cos(a), math.sin(a); M = np.eye(4); M[1, 1], M[1, 2], M[2, 1], M[2, 2] = c, -s, s, c; return M
def Rz(a): c, s = math.cos(a), math.sin(a); M = np.eye(4); M[0, 0], M[0, 1], M[1, 0], M[1, 1] = c, -s, s, c; return M


def rbox(pm, x0, x1, y0, y1, z0, z1, fn, r=0.004, seg=2, M=None):
    W, H, D = x1 - x0, y1 - y0, z1 - z0; bm = L.rbox_bm(W, H, D, r, seg); cx, cy, cz = (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2; sub = PM()
    for f in bm.faces:
        pts = [(v.co.x + cx, v.co.z + cy, -v.co.y + cz) for v in f.verts]; n = np.array([f.normal.x, f.normal.z, -f.normal.y]); k = int(np.argmax(np.abs(n)))
        def m(p):
            x, y, z = p
            if k == 2: return ((x - x0) / W, (y - y0) / H)
            if k == 0: return ((z - z0) / D, (y - y0) / H)
            return ((x - x0) / W, (z - z0) / D)
        sub.poly(pts, [fn(*m(p)) for p in pts], tuple(n))
    bm.free(); return pm.add(sub, M)


def lathe(pm, bands, n, caps=(), M=None):
    """旋轉體（繞本地 y 軸）：bands＝[(r0, y0, r1, y1, fn, 'out'|'in'|'up'|'down')]；caps＝[(r, y, fn, 'up'|'down')]，fn 是平面投影"""
    sub = PM()
    for (r0, y0, r1, y1, fn, want) in bands:
        a = [sub.vid((r0 * math.cos(2 * math.pi * k / n), y0, r0 * math.sin(2 * math.pi * k / n))) for k in range(n + 1)]
        b = [sub.vid((r1 * math.cos(2 * math.pi * k / n), y1, r1 * math.sin(2 * math.pi * k / n))) for k in range(n + 1)]
        for k in range(n):
            ang = 2 * math.pi * (k + 0.5) / n; o = (math.cos(ang), 0, math.sin(ang))
            w = {'out': o, 'in': (-o[0], 0, -o[2]), 'up': (0, 1, 0), 'down': (0, -1, 0)}[want]
            sub.face([a[k], a[k + 1], b[k + 1], b[k]], [fn(k / n, 0), fn((k + 1) / n, 0), fn((k + 1) / n, 1), fn(k / n, 1)], w)
    for (r, y, fn, want) in caps:
        pts = [(r * math.cos(2 * math.pi * k / n), y, r * math.sin(2 * math.pi * k / n)) for k in range(n)]
        sub.poly(pts, [fn(0.5 + p[0] / (2 * r), 0.5 - p[2] / (2 * r)) for p in pts], (0, 1, 0) if want == 'up' else (0, -1, 0))
    return pm.add(sub, M)


def frame_to(a, b):
    """把本地 y 軸對到 a→b 的方向、原點在 a 的矩陣（給 lathe 用：螺栓、套管）"""
    a, b = np.array(a, float), np.array(b, float); d = b - a; L_ = np.linalg.norm(d); y = d / L_
    x = np.cross(y, [0, 0, 1.0]); x = x if np.linalg.norm(x) > 1e-6 else np.cross(y, [1.0, 0, 0]); x /= np.linalg.norm(x); z = np.cross(x, y)
    M = np.eye(4); M[:3, 0], M[:3, 1], M[:3, 2], M[:3, 3] = x, y, z, a; return M, L_


def fillet(pts, rad, n=5):
    """折線的每個轉角換成半徑 rad 的圓弧（n 段）"""
    P = [np.array(p, float) for p in pts]; out = [P[0]]
    for i in range(1, len(P) - 1):
        a, b, c = P[i - 1], P[i], P[i + 1]; u, v = a - b, c - b; lu, lv = np.linalg.norm(u), np.linalg.norm(v); u, v = u / lu, v / lv
        ang = math.acos(max(-1, min(1, float(np.dot(u, v)))))
        if ang > math.pi - 1e-3: out.append(b); continue
        t = min(rad / math.tan(ang / 2), lu * 0.45, lv * 0.45); r = t * math.tan(ang / 2)
        p0, p1 = b + u * t, b + v * t; bis = (u + v) / np.linalg.norm(u + v); cen = b + bis * (r / math.sin(ang / 2))
        e0, e1 = p0 - cen, p1 - cen
        for k in range(n + 1):
            f = k / n; om = math.acos(max(-1, min(1, float(np.dot(e0, e1) / (np.linalg.norm(e0) * np.linalg.norm(e1))))))
            q = (math.sin((1 - f) * om) * e0 + math.sin(f * om) * e1) / math.sin(om) if om > 1e-6 else e0
            out.append(cen + q)
    out.append(P[-1]); return out


def spans(total, ends=('free', 'free'), body='pg_body', foot='pg_foot', join='pg_join', worn=(), worn_reg='pg_worn', unit=1.0, foot_len=0.4, join_len=0.08):
    """把一根管子的長度分成貼圖的段：(d0, d1, 區塊, 反向)。ground 端用 foot（0.4 m），joint 端用 join（8 cm），中間是 body（每段 ≤ unit），worn 是握把的範圍"""
    cut = [(0.0, 'start')]; S_ = []
    a = 0.0; b = total
    if ends[0] == 'ground': S_.append((0.0, min(foot_len, total * 0.5), foot, False)); a = min(foot_len, total * 0.5)
    elif ends[0] == 'joint': S_.append((0.0, min(join_len, total * 0.3), join, False)); a = min(join_len, total * 0.3)
    tail = None
    if ends[1] == 'joint': tail = (max(a, total - join_len), total, join, True); b = tail[0]
    elif ends[1] == 'ground': tail = (max(a, total - foot_len), total, foot, True); b = tail[0]
    # 中間：worn 的範圍切出來
    marks = sorted({a, b} | {min(b, max(a, w0)) for w0, _ in worn} | {min(b, max(a, w1)) for _, w1 in worn})
    for d0, d1 in zip(marks, marks[1:]):
        if d1 - d0 < 1e-6: continue
        reg = worn_reg if any(w0 <= (d0 + d1) / 2 <= w1 for w0, w1 in worn) else body
        n = max(1, int(math.ceil((d1 - d0) / unit - 1e-6)))
        for k in range(n): S_.append((d0 + (d1 - d0) * k / n, d0 + (d1 - d0) * (k + 1) / n, reg, False))
    if tail: S_.append(tail)
    return S_


def tube(pm, pts, r, sides, sp, caps=('flat', 'flat'), cap_fn=None, rad=None, nf=5):
    """沿折線的鋼管：rad＝轉角的彎管半徑；sp＝spans(...) 的結果（依距離決定每段用哪個貼圖區塊，段落的邊界上會切一圈）；
    caps：'flat'｜'dome'｜None；s 繞一圈、t 沿管子"""
    P = fillet(pts, rad, nf) if rad else [np.array(p, float) for p in pts]
    D = [0.0]
    for a, b in zip(P, P[1:]): D.append(D[-1] + float(np.linalg.norm(b - a)))
    # 在段落邊界插點
    cuts = sorted({round(d, 6) for s0, s1, _, _ in sp for d in (s0, s1)} | {round(d, 6) for d in D})
    Q = []
    for d in cuts:
        if d > D[-1] + 1e-6: continue
        i = max(0, min(len(D) - 2, int(np.searchsorted(D, d, side='right') - 1))); f = (d - D[i]) / max(1e-9, D[i + 1] - D[i])
        Q.append((d, P[i] + (P[i + 1] - P[i]) * f))
    # 平行移動的框架
    rings = []; prev_u = None; pts_ = [q for _, q in Q]; n = len(pts_)
    for i in range(n):
        tdir = pts_[min(i + 1, n - 1)] - pts_[max(i - 1, 0)]; tdir = tdir / max(1e-9, np.linalg.norm(tdir))
        if prev_u is None:
            u = np.cross(tdir, [0, 1.0, 0]); u = u if np.linalg.norm(u) > 1e-6 else np.cross(tdir, [1.0, 0, 0])
        else: u = prev_u - tdir * np.dot(prev_u, tdir)
        u /= np.linalg.norm(u); w = np.cross(tdir, u); prev_u = u
        rings.append([pts_[i] + (u * math.cos(2 * math.pi * k / sides) + w * math.sin(2 * math.pi * k / sides)) * r for k in range(sides)])
    sub = PM()
    for i in range(n - 1):
        d0, d1 = Q[i][0], Q[i + 1][0]
        if d1 - d0 < 1e-7: continue
        mid = (d0 + d1) / 2; seg = next((s for s in sp if s[0] - 1e-7 <= mid <= s[1] + 1e-7), sp[-1]); s0, s1, reg, rev = seg
        f0, f1 = (d0 - s0) / max(1e-9, s1 - s0), (d1 - s0) / max(1e-9, s1 - s0)
        if rev: f0, f1 = 1 - f0, 1 - f1
        A, Bv = rings[i], rings[i + 1]; ctr = (pts_[i] + pts_[i + 1]) / 2
        for k in range(sides):
            k1 = (k + 1) % sides; c = (A[k] + A[k1] + Bv[k] + Bv[k1]) / 4
            sub.poly([A[k], A[k1], Bv[k1], Bv[k]], [ruv(reg, k / sides, f0), ruv(reg, (k + 1) / sides, f0), ruv(reg, (k + 1) / sides, f1), ruv(reg, k / sides, f1)], tuple(c - ctr))
    for idx, sgn, cp in ((0, -1, caps[0]), (n - 1, 1, caps[1])):
        if not cp: continue
        tdir = pts_[min(idx + 1, n - 1)] - pts_[max(idx - 1, 0)]; tdir = tdir / np.linalg.norm(tdir) * sgn
        fn = cap_fn or S('cap_g')
        if cp == 'flat': sub.poly(rings[idx], [fn(0, 0)] * sides, tuple(tdir))
        else:   # 圓頂蓋：兩圈＋尖
            c0 = pts_[idx]; prev = rings[idx]
            for h_, rr in ((0.45, 0.82), (0.8, 0.45)):
                ring = [c0 + (p - c0) * rr + tdir * r * h_ for p in rings[idx]]
                for k in range(sides): k1 = (k + 1) % sides; sub.poly([prev[k], prev[k1], ring[k1], ring[k]], [fn(0, 0)] * 4, tuple((prev[k] + ring[k1]) / 2 - c0))
                prev = ring
            tip = c0 + tdir * r
            for k in range(sides): k1 = (k + 1) % sides; sub.poly([prev[k], prev[k1], tip], [fn(0, 0)] * 3, tuple((prev[k] + prev[k1]) / 2 - c0))
    return pm.add(sub)


def ring(pm, c, axis, R_, r, n, sides, fn):
    """圓環（環的平面垂直 axis：'x'｜'y'｜'z'）：吊環、輪子的外圈"""
    pts = []
    for k in range(n):
        a = 2 * math.pi * k / n; p = {'z': (R_ * math.cos(a), R_ * math.sin(a), 0), 'x': (0, R_ * math.sin(a), R_ * math.cos(a)), 'y': (R_ * math.cos(a), 0, R_ * math.sin(a))}[axis]
        pts.append(np.array(c, float) + np.array(p))
    pts.append(pts[0])
    return pts


def closed_tube(pm, pts, r, sides, fn_of_frac):
    """閉合的管子（輪圈）：fn_of_frac(f) → 區塊名稱與 t；每段 t 從 0 到 1"""
    n = len(pts) - 1; rings = []; prev_u = None
    for i in range(n):
        tdir = pts[(i + 1) % n] - pts[(i - 1) % n]; tdir /= np.linalg.norm(tdir)
        u = np.cross(tdir, [0, 0, 1.0]) if prev_u is None else prev_u - tdir * np.dot(prev_u, tdir)
        if np.linalg.norm(u) < 1e-6: u = np.cross(tdir, [1.0, 0, 0])
        u /= np.linalg.norm(u); w = np.cross(tdir, u); prev_u = u
        rings.append([pts[i] + (u * math.cos(2 * math.pi * k / sides) + w * math.sin(2 * math.pi * k / sides)) * r for k in range(sides)])
    sub = PM()
    for i in range(n):
        A, Bv = rings[i], rings[(i + 1) % n]; reg, t0, t1 = fn_of_frac(i / n, (i + 1) / n); ctr = (pts[i] + pts[(i + 1) % n]) / 2
        for k in range(sides):
            k1 = (k + 1) % sides; c = (A[k] + A[k1] + Bv[k] + Bv[k1]) / 4
            sub.poly([A[k], A[k1], Bv[k1], Bv[k]], [ruv(reg, k / sides, t0), ruv(reg, (k + 1) / sides, t0), ruv(reg, (k + 1) / sides, t1), ruv(reg, k / sides, t1)], tuple(c - ctr))
    return pm.add(sub)


def footing(pm, x, z, r=0.11, top=0.055):
    """混凝土基座：地下 3 cm 起、上面倒角的圓台，14 邊（輪廓近景看得到）"""
    fc = R('concrete'); n = 14
    lathe(pm, [(r + 0.012, -0.03, r + 0.006, top - 0.012, fc, 'out'), (r + 0.006, top - 0.012, r - 0.006, top, fc, 'out')],
          n, caps=[(r - 0.006, top, lambda s, t: ruv('concrete', s, 0.92), 'up')], M=T(x, 0, z))


def flange(pm, x, z, y0, r=0.075, rp=0.04, color='flange_g', bolts=4):
    """法蘭盤＋螺栓（六角）"""
    fs = S(color)
    lathe(pm, [(r, y0, r, y0 + 0.012, fs, 'out'), (r, y0 + 0.012, rp + 0.01, y0 + 0.02, fs, 'out')], 14, caps=[(r, y0, fs, 'down')], M=T(x, 0, z))
    for k in range(bolts):
        a = math.pi / 4 + k * math.pi / 2; bx, bz = x + math.cos(a) * r * 0.72, z + math.sin(a) * r * 0.72
        lathe(pm, [(0.011, y0 + 0.012, 0.011, y0 + 0.024, S('bolt'), 'out')], 6, caps=[(0.011, y0 + 0.024, S('bolt'), 'up')], M=T(bx, 0, bz))   # 六角螺帽


def weld(pm, c, axis_pts, r, color='weld_g'):
    """焊道：管子接合處的一圈（8 邊），比管子粗 3 mm"""
    M, L_ = frame_to(*axis_pts)
    lathe(pm, [(r + 0.003, 0, r + 0.004, 0.006, S(color), 'out'), (r + 0.004, 0.006, r + 0.002, 0.012, S(color), 'out')], 8, M=M @ T(0, -0.006, 0))


def plate(pm, kind, x, y, z, w=0.16, h=0.2, post_r=0.045, M=None):
    """說明牌：倒角薄板，正面（+z）是圖示；用上下兩道鍍鋅箍鎖在柱子上（柱子中心在 z − post_r）"""
    sub = PM(); fr = lambda s, t: ruv('plate_' + kind, s, t)
    rbox(sub, x - w / 2, x + w / 2, y - h / 2, y + h / 2, z + 0.004, z + 0.01, lambda s, t: fr(s, t), r=0.0025, seg=1)
    rbox(sub, x - 0.03, x + 0.03, y - h / 2 + 0.02, y + h / 2 - 0.02, z - 0.002, z + 0.004, S('galv'), r=0.002, seg=1)   # 牌子後面的墊條
    for yy in (y - h / 2 + 0.035, y + h / 2 - 0.035):
        lathe(sub, [(post_r + 0.003, yy - 0.009, post_r + 0.003, yy + 0.009, S('galv'), 'out')], 10, M=T(x, 0, z - post_r))
    return pm.add(sub, M)


# ================= 鞦韆 =================
SW_W2, SW_H, BEAM_R, LEG_R = 1.9, 2.35, 0.045, 0.038
SEAT_X = (-0.9, 0.9); PIVOT_Y = SW_H - BEAM_R - 0.075


def swings():
    pm = PM()
    for sx in (-SW_W2, SW_W2):
        for sz_ in (-0.7, 0.7):
            footing(pm, sx, sz_, r=0.082)
            top = np.array((sx, SW_H - 0.06, sz_ * 0.04)); foot = np.array((sx, 0.05, sz_ * (1 - 0.05 / (SW_H - 0.06) * 0.96))); d = np.linalg.norm(top - foot)
            tube(pm, [foot, top], LEG_R, 8, spans(d, ('ground', 'joint')), caps=(None, None))
        # 頂座：鑄鐵三通（倒角塊＋兩個插腳的套筒＋前後兩顆螺栓）
        rbox(pm, sx - 0.075, sx + 0.075, SW_H - 0.09, SW_H + 0.07, -0.085, 0.085, R('cast'), r=0.026, seg=2)
        for sz_ in (-0.7, 0.7):
            top = np.array((sx, SW_H - 0.06, sz_ * 0.04)); foot = np.array((sx, -0.02, sz_)); u = (foot - top) / np.linalg.norm(foot - top)
            M, _ = frame_to(top, top + u)
            lathe(pm, [(0.05, 0.0, 0.05, 0.13, R('cast'), 'out'), (0.05, 0.13, 0.042, 0.15, S('cast_dark'), 'out')], 12, M=M)
        for sz_ in (-0.085, 0.085):   # 前後各一顆：墊片＋六角頭
            M, _ = frame_to((sx, SW_H - 0.01, sz_), (sx, SW_H - 0.01, sz_ + (0.01 if sz_ > 0 else -0.01)))
            lathe(pm, [(0.018, 0, 0.018, 0.003, S('galv'), 'out'), (0.013, 0.003, 0.013, 0.011, S('bolt'), 'out'), (0.013, 0.011, 0.009, 0.013, S('bolt'), 'out')], 6,
                  caps=[(0.018, 0.003, S('galv'), 'up'), (0.009, 0.013, S('bolt'), 'up')], M=M)
        for ex in (-1, 1):   # 橫桿進頂座的鑄件環
            M, _ = frame_to((sx + ex * 0.075, SW_H, 0), (sx + ex * 0.105, SW_H, 0))
            lathe(pm, [(0.062, 0, 0.06, 0.02, R('cast'), 'out'), (0.06, 0.02, 0.05, 0.03, R('cast'), 'out')], 12, M=M)
    # 橫桿：兩端圓頂蓋，接頂座的地方是 join
    tube(pm, [(-SW_W2 - 0.085, SW_H, 0), (SW_W2 + 0.085, SW_H, 0)], BEAM_R, 10,
         [(0, 0.16, 'pg_join', False), (0.16, 0.24, 'pg_join', False)]
         + [(0.24 + (3.97 - 0.48) * k / 4, 0.24 + (3.97 - 0.48) * (k + 1) / 4, 'pg_body', False) for k in range(4)]
         + [(3.97 - 0.24, 3.97 - 0.16, 'pg_join', True), (3.97 - 0.16, 3.97, 'pg_join', False)], caps=('dome', 'dome'))
    # 吊環：每個座位兩個（U 型螺栓包住橫桿＋下面的旋轉吊環）
    for cx in SEAT_X:
        for dx in (-0.22, 0.22):
            hx = cx + dx
            arc = [(hx, SW_H + math.sin(a) * (BEAM_R + 0.008), math.cos(a) * (BEAM_R + 0.008)) for a in np.linspace(-0.25, math.pi + 0.25, 6)]
            tube(pm, [(hx, SW_H - 0.055, BEAM_R + 0.008)] + arc + [(hx, SW_H - 0.055, -BEAM_R - 0.008)], 0.006, 6, [(0, 1, 'sw_galv', False)], caps=('flat', 'flat'))
            rbox(pm, hx - 0.02, hx + 0.02, SW_H - 0.07, SW_H - 0.052, -0.07, 0.07, S('galv'), r=0.004, seg=1)
            for sz_ in (-BEAM_R - 0.008, BEAM_R + 0.008): lathe(pm, [(0.011, 0, 0.011, 0.012, S('bolt'), 'out')], 6, M=T(hx, SW_H - 0.082, sz_))
            tube(pm, [(hx, SW_H - 0.07, 0), (hx, PIVOT_Y + 0.026, 0)], 0.0065, 6, [(0, 1, 'sw_galv', False)], caps=(None, None))
            ring_pts = ring(pm, (hx, PIVOT_Y + 0.012, 0), 'x', 0.016, 0.005, 8, 4, None)
            closed_tube(pm, [np.array(p) for p in ring_pts], 0.005, 4, lambda f0, f1: ('sw_galv', 0.5, 0.5))
    return pm


def seat(tape=False):
    """一個座位：原點＝吊點中心（橫桿下）；兩條鏈條、下段 PVC 護套、橡膠彎座、兩端的鋼夾和 S 鉤"""
    pm = PM(); seat_y = 0.47 - PIVOT_Y; end_y = seat_y + 0.05; HW = 0.245
    for dx in (-0.22, 0.22):
        top = np.array((dx, 0.0, 0)); bot = np.array((dx * 1.04, end_y + 0.06, 0)); L_ = float(np.linalg.norm(bot - top))
        ch_sp = [(L_ * k / 3, L_ * (k + 1) / 3, 'chain', False) for k in range(3)]
        tube(pm, [top, bot], 0.0055, 6, ch_sp, caps=(None, None))
        s_top = bot + (top - bot) / L_ * 0.6
        tube(pm, [bot + (top - bot) / L_ * 0.03, s_top], 0.0115, 8, [(0, 0.57, 'sleeve', True)], caps=('flat', 'flat'), cap_fn=S('grip_k'))
        if tape and dx > 0:   # 生活痕跡：一段藍色電工膠帶補過的護套
            mid = bot + (top - bot) / L_ * 0.36; e = (top - bot) / L_
            tube(pm, [mid, mid + e * 0.045], 0.0123, 8, [(0, 1, 'sw_tape', False)], caps=('flat', 'flat'), cap_fn=S('tape'))
        # S 鉤
        hook = [bot + np.array((0, 0.035, 0)), bot + np.array((0.006 * np.sign(dx), 0.0, 0.008)), bot + np.array((0, -0.03, 0))]
        tube(pm, hook, 0.004, 5, [(0, 1, 'sw_galv', False)], caps=('flat', 'flat'), cap_fn=S('galv'))
    # 橡膠彎座：中間下垂，斷面是圓角長方形（寬 0.17、厚 1.4 cm）
    nx = 10; prof = []
    for k in range(8):
        a = 2 * math.pi * k / 8 + math.pi / 8; prof.append((0.085 * np.sign(math.cos(a)) * min(1, abs(math.cos(a)) * 1.6), 0.007 * np.sign(math.sin(a)) * min(1, abs(math.sin(a)) * 1.6)))
    xs = np.linspace(-HW, HW, nx + 1)
    def yc(x): return seat_y + 0.055 * (x / HW) ** 2
    rings = [[np.array((x, yc(x) + py, pz)) for (pz, py) in prof] for x in xs]
    per = [0];
    for a, b in zip(prof, prof[1:] + prof[:1]): per.append(per[-1] + math.hypot(a[0] - b[0], a[1] - b[1]))
    for i in range(nx):
        for k in range(8):
            k1 = (k + 1) % 8; t0, t1 = per[k] / per[-1], per[k + 1] / per[-1]
            A, Bv = rings[i], rings[i + 1]; c = (A[k] + A[k1] + Bv[k] + Bv[k1]) / 4; ctr = np.array((c[0], yc(c[0]), 0))
            pm.poly([A[k], A[k1], Bv[k1], Bv[k]], [ruv('rubber', i / nx, t0), ruv('rubber', i / nx, t1), ruv('rubber', (i + 1) / nx, t1), ruv('rubber', (i + 1) / nx, t0)], tuple(c - ctr))
    for x, sgn in ((-HW, -1), (HW, 1)): pm.poly(rings[0 if sgn < 0 else -1], [ruv('sw_grip_k', 0.5, 0.5)] * 8, (sgn, 0, 0))
    # 兩端的鋼夾
    for sx in (-1, 1):
        x0 = sx * (HW - 0.018); x1 = sx * (HW + 0.012); y = yc(sx * HW)
        rbox(pm, min(x0, x1), max(x0, x1), y - 0.016, y + 0.024, -0.094, 0.094, S('galv'), r=0.004, seg=1)
        lathe(pm, [(0.008, 0, 0.008, 0.032, S('galv'), 'out')], 6, M=T(sx * 0.226, y + 0.022, 0))   # 夾子上的吊耳
    return pm


# ================= 健身器材 =================
def post(pm, x, z, top, r=0.045, color='g', cap='dome'):
    footing(pm, x, z); flange(pm, x, z, 0.056)
    body = 'pg_body' if color == 'g' else 'py_body'; foot = 'pg_foot' if color == 'g' else 'py_body'
    tube(pm, [(x, 0.07, z), (x, top, z)], r, 10, spans(top - 0.07, ('ground', 'free'), body=body, foot=foot), caps=(None, cap), cap_fn=S('cap_g'))


def fit_waist():
    pm = PM(); pz = -0.24
    post(pm, 0, pz, 1.16, 0.045)
    # 扶手：一圈圓角長方形（前面那一段是握把，掉漆）＋接到柱子的短橫桿
    loop = [(0, 1.08, pz), (-0.21, 1.08, pz), (-0.21, 1.08, -0.06), (0.21, 1.08, -0.06), (0.21, 1.08, pz), (0, 1.08, pz)]
    P = fillet(loop, 0.06, 5); Ltot = sum(float(np.linalg.norm(b - a)) for a, b in zip(P, P[1:]))
    tube(pm, loop, 0.017, 8, spans(Ltot, worn=[(Ltot / 2 - 0.16, Ltot / 2 + 0.16)], body='py_body', worn_reg='py_worn', unit=0.6), caps=(None, None), rad=0.06)
    for sx in (-1, 1): weld(pm, None, ((sx * 0.045, 1.08, pz), (sx * 0.06, 1.08, pz)), 0.017, 'weld_y')
    # 轉盤：底座（綠管）＋軸承座＋黃色盤子
    dz = 0.12
    footing(pm, 0, dz, 0.12); flange(pm, 0, dz, 0.056, r=0.085, rp=0.05)
    tube(pm, [(0, 0.07, dz), (0, 0.13, dz)], 0.05, 12, [(0, 0.06, 'pg_join', False)], caps=(None, None))
    lathe(pm, [(0.075, 0.13, 0.085, 0.15, S('bear'), 'out')], 14, caps=[(0.075, 0.13, S('bear'), 'down')], M=T(0, 0, dz))
    dk = R('py_body')
    lathe(pm, [(0.235, 0.15, 0.25, 0.165, dk, 'out'), (0.25, 0.165, 0.25, 0.188, dk, 'out'), (0.25, 0.188, 0.24, 0.195, R('py_worn'), 'out')], 24,
          caps=[(0.24, 0.195, R('disc'), 'up'), (0.235, 0.15, S('cap_y'), 'down')], M=T(0, 0, dz))
    plate(pm, 'w', 0, 0.56, pz + 0.045, post_r=0.045)
    return pm


def towel():
    """毛巾：對折掛在扭腰盤扶手的前面一段（扶手在 y 1.08、z −0.06，半徑 1.7 cm），前面垂得比較長；外層、內層兩片（各自朝外、朝內）"""
    pm = PM(); xs = np.linspace(-0.13, 0.15, 7); zc, yc = -0.06, 1.08
    def prof(r):
        return [(zc + r + 0.004, yc - 0.30), (zc + r + 0.002, yc - 0.22), (zc + r + 0.001, yc - 0.12)] + [(zc + r * math.cos(a), yc + r * math.sin(a)) for a in np.linspace(0, math.pi, 7)] + [(zc - r - 0.002, yc - 0.12), (zc - r - 0.006, yc - 0.2)]
    def wob(x, k): return 0.011 * math.sin(x * 31 + k * 0.9) + 0.004 * math.sin(x * 77 + k * 2.1)
    for r, outer in ((0.026, True), (0.0205, False)):
        pts = prof(r); nk = len(pts) - 1; ni = len(xs) - 1
        cum = [0.0]
        for (za, ya), (zb, yb) in zip(pts, pts[1:]): cum.append(cum[-1] + math.hypot(zb - za, yb - ya))
        tk = [1 - c / cum[-1] for c in cum]
        for i in range(ni):
            for k in range(nk):
                (z0, y0), (z1, y1) = pts[k], pts[k + 1]; dy0, dy1 = (xs[i] - xs[0]) * -0.05, (xs[i + 1] - xs[0]) * -0.05
                q = [(xs[i], y0 + dy0, z0 + wob(xs[i], k)), (xs[i + 1], y0 + dy1, z0 + wob(xs[i + 1], k)), (xs[i + 1], y1 + dy1, z1 + wob(xs[i + 1], k + 1)), (xs[i], y1 + dy0, z1 + wob(xs[i], k + 1))]
                c = np.mean(np.array(q), 0)
                d = np.array((0, c[1] - yc, c[2] - zc)) if c[1] > yc - 0.02 else np.array((0, 0, c[2] - zc))
                want = tuple(d if outer else -d)
                pm.poly(q, [ruv('towel', i / ni, tk[k]), ruv('towel', (i + 1) / ni, tk[k]), ruv('towel', (i + 1) / ni, tk[k + 1]), ruv('towel', i / ni, tk[k + 1])], want)
    return pm


def fit_shoulder():
    pm = PM(); hub_y = 1.32
    post(pm, 0, 0, 1.62, 0.055)
    # 軸：沿 z 穿過柱子
    M, _ = frame_to((0, hub_y, -0.2), (0, hub_y, 0.2))
    lathe(pm, [(0.022, 0, 0.022, 0.4, S('steel'), 'out')], 10, M=M)
    for sz_ in (-1, 1): weld(pm, None, ((0, hub_y, sz_ * 0.055), (0, hub_y, sz_ * 0.07)), 0.022, 'weld_g')
    for wz, sg in ((0.17, 1), (-0.17, -1)):
        # 輪轂
        M, _ = frame_to((0, hub_y, wz - 0.03 * sg), (0, hub_y, wz + 0.03 * sg))
        lathe(pm, [(0.06, 0, 0.06, 0.06, R('py_body'), 'out')], 14, caps=[(0.06, 0.06, S('cap_y'), 'up'), (0.06, 0.0, S('bear'), 'down')], M=M)
        # 輪圈（握把附近掉漆）
        RR = 0.4; pts = [np.array((RR * math.cos(a), hub_y + RR * math.sin(a), wz)) for a in np.linspace(0, 2 * math.pi, 29)]
        grips = (math.radians(30), math.radians(210))
        def fr(f0, f1):
            fm = (f0 + f1) / 2 * 2 * math.pi; near = any(abs((fm - g + math.pi) % (2 * math.pi) - math.pi) < 0.45 for g in grips)
            return ('py_worn' if near else 'py_body', (f0 * 4) % 1.0, ((f0 * 4) % 1.0) + (f1 - f0) * 4)
        closed_tube(pm, pts[:-1] + [pts[0]], 0.019, 6, fr)
        # 輻條 ×4
        for k in range(4):
            a = math.pi / 4 + k * math.pi / 2
            tube(pm, [(0.058 * math.cos(a), hub_y + 0.058 * math.sin(a), wz), ((RR - 0.012) * math.cos(a), hub_y + (RR - 0.012) * math.sin(a), wz)], 0.012, 6,
                 [(0, 0.33, 'py_body', False)], caps=(None, None))
        # 握把：從輪圈往外伸（±z），黑色橡膠套
        for g in grips:
            gx, gy = RR * math.cos(g), hub_y + RR * math.sin(g)
            tube(pm, [(gx, gy, wz), (gx, gy, wz + 0.07 * sg)], 0.016, 8, [(0, 0.07, 'py_join', False)], caps=(None, None))
            tube(pm, [(gx, gy, wz + 0.07 * sg), (gx, gy, wz + 0.17 * sg)], 0.019, 10, [(0, 0.1, 'sleeve', False)], caps=(None, 'dome'), cap_fn=S('grip_k'))
    plate(pm, 's', 0, 0.62, 0.055, post_r=0.055)
    return pm


def fit_leg():
    pm = PM(); pz = -0.04; hz = -0.3
    for sx in (-0.45, 0.45):
        footing(pm, sx, pz); flange(pm, sx, pz, 0.056)
    # 框架：兩根側柱往上、在頂端往前（−z）彎成扶手橫桿；一整根彎管
    path = [(-0.45, 0.07, pz), (-0.45, 1.02, pz), (-0.45, 1.2, hz), (0.45, 1.2, hz), (0.45, 1.02, pz), (0.45, 0.07, pz)]
    P = fillet(path, 0.08, 5); Ltot = sum(float(np.linalg.norm(b - a)) for a, b in zip(P, P[1:]))
    tube(pm, path, 0.04, 8, spans(Ltot, ('ground', 'ground'), worn=[(Ltot / 2 - 0.25, Ltot / 2 + 0.25)], unit=0.8), caps=(None, None), rad=0.08)
    # 擺臂的軸：兩根側柱之間的橫桿（y 0.98）
    tube(pm, [(-0.45, 0.98, pz), (0.45, 0.98, pz)], 0.03, 10, [(0, 0.08, 'pg_join', False), (0.08, 0.82, 'pg_body', False), (0.82, 0.9, 'pg_join', True)], caps=(None, None))
    for sx in (-0.45, 0.45): weld(pm, None, ((sx - np.sign(sx) * 0.04, 0.98, pz), (sx - np.sign(sx) * 0.06, 0.98, pz)), 0.03, 'weld_g')
    # 兩支擺臂＋踏板
    for ax in (-0.15, 0.15):
        M, _ = frame_to((ax - 0.04, 0.98, pz), (ax + 0.04, 0.98, pz))
        lathe(pm, [(0.042, 0, 0.042, 0.08, R('py_body'), 'out')], 12, caps=[(0.042, 0, S('cap_y'), 'down'), (0.042, 0.08, S('cap_y'), 'up')], M=M)
        tube(pm, [(ax, 0.96, pz), (ax, 0.27, pz)], 0.024, 8, spans(0.69, ('joint', 'joint'), body='py_body', join='py_join'), caps=(None, None))
        rbox(pm, ax - 0.075, ax + 0.075, 0.2, 0.27, pz - 0.035, pz + 0.035, S('cap_y'), r=0.01, seg=2)   # 擺臂下面的接頭
        rbox(pm, ax - 0.08, ax + 0.08, 0.235, 0.262, pz - 0.17, pz + 0.17, R('pedal'), r=0.006, seg=1)   # 踏板
        for e in (-1, 1): rbox(pm, ax - 0.085, ax + 0.085, 0.235, 0.278, pz + e * 0.17 - 0.012, pz + e * 0.17 + 0.012, S('cap_y'), r=0.006, seg=1)   # 前後擋邊
    plate(pm, 'l', -0.45, 0.72, pz + 0.04, post_r=0.04)
    return pm


def bottle():
    pm = PM(); fb = R('bottle')
    prof = [(0.0, 0.0), (0.03, 0.0), (0.034, 0.012), (0.034, 0.15), (0.03, 0.172), (0.016, 0.19), (0.014, 0.205)]
    bands = []
    for (r0, y0), (r1, y1) in zip(prof, prof[1:]):
        if r0 == 0: continue
        bands.append((r0, y0, r1, y1, lambda s, t, a=y0, b=y1: ruv('bottle', s, (a + (b - a) * t) / 0.205), 'out'))
    lathe(pm, bands, 14, caps=[(0.03, 0.0, S('cap_w'), 'down')])
    lathe(pm, [(0.0155, 0.203, 0.0155, 0.228, S('cap_b'), 'out')], 14, caps=[(0.0155, 0.228, S('cap_b'), 'up')])
    return pm


ITEMS = {'PARK_SWINGS': swings, 'PARK_SWING_SEAT_A': lambda: seat(False), 'PARK_SWING_SEAT_B': lambda: seat(True),
         'PARK_FIT_WAIST': fit_waist, 'PARK_FIT_SHOULDER': fit_shoulder, 'PARK_FIT_LEG': fit_leg, 'PARK_FIT_TOWEL': towel, 'PARK_FIT_BOTTLE': bottle}
# GLB 裡的位置（遊戲座標）：鞦韆在原點；座位掛在框架的吊點；健身器材排在後面（PARK1 的做法，LAWWW2-B 搬）
SPREAD = {'PARK_SWINGS': (0, 0, 0, 0), 'PARK_SWING_SEAT_A': (SEAT_X[0], PIVOT_Y, 0, 0), 'PARK_SWING_SEAT_B': (SEAT_X[1], PIVOT_Y, 0, 0),
          'PARK_FIT_WAIST': (-1.4, 0, 2.2, 0), 'PARK_FIT_SHOULDER': (0.0, 0, 2.2, 0), 'PARK_FIT_LEG': (1.4, 0, 2.2, 0),
          'PARK_FIT_TOWEL': (-1.4, 0, 2.2, 0), 'PARK_FIT_BOTTLE': (1.4 + 0.33, 0, 2.2 + 0.2, 0)}
BUDGET = {'PARK_SWINGS': 2550, 'PARK_SWING_SEAT_A': 520, 'PARK_SWING_SEAT_B': 520, 'PARK_FIT_WAIST': 2000, 'PARK_FIT_SHOULDER': 2000, 'PARK_FIT_LEG': 2000,
          'PARK_FIT_TOWEL': 300, 'PARK_FIT_BOTTLE': 250}
TOTAL_BUDGET = 9000
TILT = {'PARK_SWING_SEAT_B': 7.0}   # 繞本地 x 軸（吊點）的角度：有人剛下來、還沒停正（生活痕跡）
SMOOTH = {'PARK_SWINGS': 0.9, 'PARK_SWING_SEAT_A': 1.0, 'PARK_SWING_SEAT_B': 1.0, 'PARK_FIT_WAIST': 0.9, 'PARK_FIT_SHOULDER': 1.12, 'PARK_FIT_LEG': 0.9,
          'PARK_FIT_TOWEL': 1.2, 'PARK_FIT_BOTTLE': 1.0}


def to_blender(pm, name, mat, parent, angle=0.6):
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(g2b(*p)) for p in pm.v], [], [tuple(f) for f in pm.f])
    uvl = me.uv_layers.new(name='UVMap')
    for poly, uvs in zip(me.polygons, pm.uv):
        for li, uv in zip(poly.loop_indices, uvs): uvl.data[li].uv = uv
    me.materials.append(mat); me.validate(clean_customdata=False); me.update()
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6); bm.to_mesh(me); bm.free(); me.update()
    ob = bpy.data.objects.new(name, me); B.scene().collection.objects.link(ob); ob.parent = parent; ob['module'] = name
    L.smooth_mesh(ob, angle=angle)
    return ob


def build():
    make_textures()
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=1024)
    root = B.group('park2_props', props={'kind': 'park2_props'})
    mat = bpy.data.materials.new('park2'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS); tx.image.pack(); nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
    to = nt.nodes.new('ShaderNodeTexImage'); to.image = bpy.data.images.load(ATLAS_ORM); to.image.colorspace_settings.name = 'Non-Color'; to.image.pack()
    sp = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(to.outputs['Color'], sp.inputs['Color'])
    nt.links.new(sp.outputs['Green'], bsdf.inputs['Roughness']); nt.links.new(sp.outputs['Blue'], bsdf.inputs['Metallic'])
    mods = {}; over = []
    for name, fn in ITEMS.items():
        pm = fn()
        ob = to_blender(pm, name, mat, root, SMOOTH.get(name, 0.8)); x, y, z, a = SPREAD[name]; ob.location = g2b(x, y, z); ob.rotation_euler = (math.radians(TILT.get(name, 0)), 0, math.radians(a))
        mn, mx = pm.bbox(); tris = sum(len(p.vertices) - 2 for p in ob.data.polygons); mods[name] = {'tris': tris, 'min': mn, 'max': mx}
        if tris > BUDGET[name]: over.append((name, tris))
    total = sum(m['tris'] for m in mods.values())
    print('TRIS', json.dumps({k: v['tris'] for k, v in mods.items()}), total, flush=True)
    print('BBOX', json.dumps({k: (v['min'], v['max']) for k, v in mods.items()}), flush=True)
    assert not over, over
    assert total <= TOTAL_BUDGET, total
    info = L.export(out, gpu_instances=False)
    info['materials'] = 1; info['modules'] = mods; info['tris_total'] = total
    info['atlas'] = [os.path.relpath(p, L.ROOT) for p in (ATLAS, ATLAS_ORM)]
    info['origins'] = {'*': '地面上的底部中央、正面（人站的那一側）朝 +z；GLB 裡的位置只是排開給人看（SPREAD）',
                       'PARK_SWINGS': 'A 字腳 x ±1.9、z ±0.7；橫桿 y 2.35（含兩端圓頂蓋 x ±2.01）；layout swings yaw π',
                       'PARK_SWING_SEAT_A/B': f'原點＝吊點中心：框架本地 (x ∓0.9, y {PIVOT_Y:.3f}, z 0)；繞本地 x 軸轉就是盪；座面中間高 0.47、兩端 0.52',
                       'PARK_FIT_WAIST': '柱子在 z −0.24、轉盤中心 z 0.12（直徑 0.5，盤面高 0.195）；扶手 y 1.08',
                       'PARK_FIT_SHOULDER': '柱子在原點，高 1.62；輪子前後各一（z ±0.17，直徑 0.8，軸心 1.32）；握把往外伸到 z ±0.34',
                       'PARK_FIT_LEG': '兩根側柱 x ±0.45、z −0.04；扶手往前（−z）彎到 z −0.3、高 1.2；擺臂的軸 y 0.98；踏板 y 0.26',
                       'PARK_FIT_TOWEL': '和 PARK_FIT_WAIST 同一個原點（掛在扶手前面那一段）', 'PARK_FIT_BOTTLE': '水瓶，底部中央；建議放在漫步機右前方的地上'}
    info['note'] = '一個材質：park2（底色 1024＋ORM 256，metal 最高 0.40；混凝土＝Poly Haven concrete_wall_006 的明暗，CC0；其他都是 numpy／PIL 畫的）'
    L.write_json(out[:-4] + '.json', info)
    return info


if __name__ == '__main__':
    build()
