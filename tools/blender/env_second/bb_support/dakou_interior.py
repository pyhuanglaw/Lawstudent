"""大口漢堡（新生南路、側門對面路口的 24 小時速食店，AA_621）兩層室內 → 一層一個 GLB。BB（帳號 A）2026-11-03 協助 LAWWW2。
  /opt/blenv/bin/python tools/blender/env_second/bb_support/dakou_interior.py -- --floor 1   （一樓 → dakou_1f.glb）
  /opt/blenv/bin/python tools/blender/env_second/bb_support/dakou_interior.py -- --floor 2   （二樓 → dakou_2f.glb）
  v2：窗外夜景卡片（NIGHT_FRONT、NIGHT_WEST，發光）正式 GLB 也有；--preview 已經不用（留著不影響）。
參考圖（使用者 11-03）：docs/story_planning/ref_images/shops/dakou_2f.webp（二樓學生自習區）、dakou_ext.webp（外觀，一樓看得到櫃檯）。
照做的重點：淺灰大磁磚地板；輕鋼架天花板＋方形燈板＋崁燈；轉角兩面落地玻璃（黑色窗框）；二樓：中間淺色木紋長桌（黑鐵腳）、
  橘棕色木椅和深藍色布面椅交錯、靠牆一排插座吧台（牆上一格一格的插座、暖光燈條）、東牆上方深藍色「大口漢堡 24h」大牆面、
  樓梯口的直幅「2F 學生自習區／長時間學習／全區插座／免費 Wi-Fi」、橘色半圓吊燈、書架、盆栽；樓梯是玻璃欄杆＋木扶手。
一樓（外觀看得到的）：點餐櫃檯（白底、深藍色塊、橘色弧線）、上方的菜單螢幕、「點餐」「取餐」橘色牌、自助點餐機、後面的廚房、高腳吧台與桌椅。
D77：店名、標誌都是自己畫的（漢堡＋三道光，深藍／橘／米色；不像任何品牌）；菜單照 AA_621 第 1 節。D112：地板是淺灰磁磚、不是深色木地板。
配置只寫在 src/data/dakou_layout.js（Blender 和遊戲共用）。座標：房間中心在原點，x 東、y 上、z 南；店門在 +z（新生南路）；模型用絕對高度。
"""
import json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from PIL import Image, ImageDraw, ImageFont, ImageFilter   # noqa: E402

LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./src/data/dakou_layout.js')))"], cwd=L.ROOT))['shop']
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
FL = int(ARGS[ARGS.index('--floor') + 1]) if '--floor' in ARGS else 1
PREVIEW = '--preview' in ARGS
LV = LAY['levels'][FL - 1]
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else LV['glb'])
TMP = os.path.join(L.ROOT, 'tools/blender/env_second/textures/gen/dakou'); os.makedirs(TMP, exist_ok=True)
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
W, D = LAY['w'], LAY['d']
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
Y0 = LV['y']; HH = LV['h']; YC = Y0 + (3.4 if FL == 1 else 3.6)   # 天花板高度（一樓 3.4：上面 0.2 是樓板）
F = LAY['floor1'] if FL == 1 else LAY['floor2']
DIRS = F['wallsFade']; ST = LAY['stairs']; SH = LAY['stairHole']
NAVY, ORANGE, CREAM = (36, 52, 95), (232, 120, 42), (246, 236, 214)
random.seed(621 + FL)
B.reset(texres=512)
root = B.group(f'dakou_{FL}f', props={'kind': f'dakou_{FL}f', 'w': W, 'd': D, 'y': Y0, 'h': HH, 'layout': LAY.get('version', 1) if 'version' in LAY else 1})
# CC0 化（SHOP-REALISM-1112／SHOP-CC0-HELP-1113，D159、D160、D161；第③群幫手 2026-11-13）：工具 cc0_kit.py（tz_shops_interior.py 同一套）。
#   黑色窗框、桌腳、椅腳＝ambientCG Metal009（校成 #26282c）；踢腳板＝ambientCG Plastic006；盆栽＝Poly Haven potted_plant_02（原本白方盆＋橢球葉子）；
#   最後合併的頂點色材質（櫃檯、椅面、吧台、小東西）＝ambientCG Plastic006／Metal009 × 每一件的顏色（vc_tex：顏色照舊、多了材質組的細紋和法線）。
#   牆（dk_wall）照舊乾淨的平塗（BB 11-10：油漆牆不給灰泥貼圖）。
sys.path.insert(0, HERE)
import cc0_kit   # noqa: E402
K = cc0_kit.Kit(root, 'dk_')
def font(sz): return ImageFont.truetype(FONT, sz)


def img_mat(name, path, rough=0.6, emit=0.0):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt = mt.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path); nt.links.new(tx.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = rough
    if emit > 0:   # 螢幕、燈箱：自己發光
        nt.links.new(tx.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = emit
    return mt


def uvquad(name, p0, p1, p2, p3, mat, parent=None):
    """一片貼圖：p0 左下、p1 右下、p2 右上、p3 左上（站在正面看）"""
    bm = bmesh.new(); vs = [bm.verts.new(g2b(*p)) for p in (p0, p1, p2, p3)]; f = bm.faces.new(vs)
    ul = bm.loops.layers.uv.new()
    for lp, t in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[ul].uv = t
    return B.mesh_obj(name, bm, mat, parent or root, None)


def wall_card(name, x, z0, z1, y0, y1, mat, facing, parent=None):
    """貼在 x＝常數 牆上的一片貼圖；facing＝+1 朝 +x、−1 朝 −x（人面向牆時左手邊是哪一端，這裡自己算）"""
    if facing > 0: return uvquad(name, (x, y0, z1), (x, y0, z0), (x, y1, z0), (x, y1, z1), mat, parent)
    return uvquad(name, (x, y0, z0), (x, y0, z1), (x, y1, z1), (x, y1, z0), mat, parent)


def zcard(name, z, x0, x1, y0, y1, mat, facing, parent=None):
    """貼在 z＝常數 的一片貼圖；facing＝+1 朝 +z（從店門那邊看）、−1 朝 −z"""
    if facing > 0: return uvquad(name, (x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z), mat, parent)
    return uvquad(name, (x1, y0, z), (x0, y0, z), (x0, y1, z), (x1, y1, z), mat, parent)


def glowmat(name, hexcol, k):
    c = B.srgb(hexcol); return L.flat(name, hexcol, rough=0.4, emit=tuple(v * k for v in c[:3]))


def down_quad(m, x0, x1, z0, z1, y):
    """朝下的單面（天花板）：bmesh 算法線，朝上就翻"""
    f = m.bm.faces.new([m.bm.verts.new(g2b(x, y, z)) for (x, z) in ((x0, z0), (x1, z0), (x1, z1), (x0, z1))])
    f.normal_update()
    if f.normal.z > 0: f.normal_flip()


def rot(lx, lz, yaw): return lx * math.cos(yaw) + lz * math.sin(yaw), -lx * math.sin(yaw) + lz * math.cos(yaw)


def newpaint(cm, fn, col):
    """fn() 加進 cm 的新面全部塗 col（用集合比對：倒角會釋放面、新面可能佔進前面的位置，不能用 list[n:]）"""
    before = set(cm.bm.faces); fn(); cm.paint([f for f in cm.bm.faces if f not in before], col)


def lbox(m, cx, cz, yaw, lx0, lx1, y0, y1, lz0, lz1, col=None, r=0.0):
    """家具的本地座標（正面朝 +z）轉 yaw（只用 90° 的倍數）後的方塊"""
    ps = [rot(a, b, yaw) for a in (lx0, lx1) for b in (lz0, lz1)]
    xs = [cx + p[0] for p in ps]; zs = [cz + p[1] for p in ps]
    a = (min(xs), max(xs), y0, y1, min(zs), max(zs))
    if col is None: return m.rbox(*a, r=r, seg=2) if r > 0 else m.box(*a)
    return m.crbox(*a, col, r=r) if r > 0 else m.cbox(*a, col)


# ---------------- 貼圖（PIL）----------------
def tex(name, size, draw, bg=(0, 0, 0)):
    p = os.path.join(TMP, name); im = Image.new('RGB', size, bg); draw(im, ImageDraw.Draw(im)); im.save(p); return p


def logo(d, cx, cy, s):
    """自己畫的標誌：米色上下麵包、橘色餡、右上三道光（不像任何品牌）"""
    d.pieslice([cx - s, cy - s * 0.9, cx + s, cy + s * 0.5], 180, 360, fill=CREAM)
    d.rounded_rectangle([cx - s * 1.02, cy - s * 0.12, cx + s * 1.02, cy + s * 0.12], int(s * 0.1), fill=ORANGE)
    d.rounded_rectangle([cx - s * 0.95, cy + s * 0.2, cx + s * 0.95, cy + s * 0.48], int(s * 0.14), fill=CREAM)
    for k, a in enumerate((-70, -45, -20)):
        r0, r1 = s * 1.05, s * 1.45; t = math.radians(a)
        d.line([(cx + s * 0.35 + r0 * math.cos(t) * 0.6, cy - s * 0.5 + r0 * math.sin(t) * 0.6), (cx + s * 0.35 + r1 * math.cos(t) * 0.6, cy - s * 0.5 + r1 * math.sin(t) * 0.6)], fill=ORANGE, width=max(3, int(s * 0.12)))


def swoosh(d, w, h, y0):
    """右下角的橘色弧線（參考圖的色帶）"""
    pts = [(w * x / 40, y0 + (h - y0) * (0.55 - 0.55 * math.sin(math.pi * x / 40) * 0.9) + (h - y0) * 0.45 * (x / 40)) for x in range(41)]
    d.polygon(pts + [(w, h), (0, h)], fill=ORANGE)
    pts2 = [(x, y + (h - y0) * 0.18) for (x, y) in pts]
    d.polygon(pts2 + [(w, h), (0, h)], fill=CREAM)


def t_mural(im, d):        # 二樓東牆：深藍大牆面「大口漢堡｜24h」
    w, h = im.size; d.rectangle([0, 0, w, h], fill=NAVY); logo(d, 150, 170, 80)
    d.text((270, 95), '大口漢堡', font=font(130), fill=(250, 248, 242)); d.line([(880, 80), (880, 260)], fill=(250, 248, 242), width=5)
    d.arc([940, 70, 1140, 270], 30, 330, fill=(250, 248, 242), width=12); d.text((975, 128), '24h', font=font(78), fill=(250, 248, 242))
    d.polygon([(1150, 70), (1180, 95), (1140, 105)], fill=(250, 248, 242))
    pts = [(w * 0.62 + (w * 0.38) * t, h - (h * 0.38) * math.sin(math.pi * t / 2)) for t in [i / 20 for i in range(21)]]
    d.polygon(pts + [(w, h)], fill=ORANGE)


def t_study(im, d):        # 二樓樓梯口的直幅
    w, h = im.size; d.rectangle([0, 0, w, h], fill=NAVY)
    d.text((40, 40), '2F', font=font(150), fill=(250, 248, 242)); d.text((40, 220), '學生自習區', font=font(70), fill=(250, 248, 242))
    d.line([(40, 320), (w - 40, 320)], fill=(250, 248, 242), width=4)
    for i, t in enumerate(('長時間學習', '全區插座', '免費 Wi-Fi')):
        y = 370 + i * 110; d.rounded_rectangle([40, y + 8, 100, y + 58], 8, outline=(250, 248, 242), width=5); d.text((125, y), t, font=font(58), fill=(250, 248, 242))
    swoosh(d, w, h, h * 0.72)


def logo_light(d, cx, cy, s):
    """v2b：淺色底用的標誌（櫃檯正面）：深藍上下麵包、白色分隔、橘色肉排、右上三道橘光（自己畫的，不像任何品牌）"""
    W_ = (252, 250, 246)
    d.pieslice([cx - s, cy - s * 0.95, cx + s, cy + s * 0.45], 180, 360, fill=NAVY)                      # 上麵包
    for (sx, sy) in ((-0.45, -0.55), (0.0, -0.68), (0.42, -0.52), (-0.18, -0.36), (0.24, -0.34)):      # 芝麻
        d.ellipse([cx + s * sx - s * 0.05, cy + s * sy - s * 0.03, cx + s * sx + s * 0.05, cy + s * sy + s * 0.03], fill=W_)
    d.rectangle([cx - s * 1.0, cy - s * 0.25, cx + s * 1.0, cy - s * 0.16], fill=W_)
    d.rounded_rectangle([cx - s * 1.06, cy - s * 0.16, cx + s * 1.06, cy + s * 0.12], int(s * 0.12), fill=ORANGE)   # 肉排
    d.rectangle([cx - s * 1.0, cy + s * 0.12, cx + s * 1.0, cy + s * 0.2], fill=W_)
    d.rounded_rectangle([cx - s * 0.96, cy + s * 0.2, cx + s * 0.96, cy + s * 0.55], int(s * 0.16), fill=NAVY)      # 下麵包
    for a in (-72, -47, -22):                                                                            # 右上三道光
        t = math.radians(a); ox, oy = cx + s * 0.62, cy - s * 0.62
        d.line([(ox + s * 0.62 * math.cos(t), oy + s * 0.62 * math.sin(t)), (ox + s * 0.95 * math.cos(t), oy + s * 0.95 * math.sin(t))], fill=ORANGE, width=max(4, int(s * 0.13)))


def t_counter(im, d):      # 一樓櫃檯正面（v2b，照外觀圖）：白底、正中間一個大漢堡標誌、左下深藍、右下橘弧、底下一條橘
    w, h = im.size; d.rectangle([0, 0, w, h], fill=(250, 246, 238))
    # 左下深藍：從左邊往右，上緣是往下彎的弧（外觀圖櫃檯左邊那一塊）
    nv = [(0, h * 0.18)] + [(w * 0.27 * t, h * 0.18 + h * 0.82 * (t ** 2.2)) for t in [i / 40 for i in range(41)]] + [(0, h)]
    d.polygon(nv, fill=NAVY)
    # 右下橘弧：從中間偏右往右邊往上翹
    og = [(w * 0.66 + w * 0.34 * t, h - h * 0.62 * math.sin(math.pi * t / 2) ** 1.2) for t in [i / 40 for i in range(41)]] + [(w, h)]
    d.polygon(og, fill=ORANGE)
    og2 = [(w * 0.70 + w * 0.30 * t, h - h * 0.44 * math.sin(math.pi * t / 2) ** 1.2) for t in [i / 40 for i in range(41)]] + [(w, h)]
    d.line(og2[:-1], fill=(250, 246, 238), width=max(3, h // 40))
    logo_light(d, int(w * 0.572), int(h * 0.55), int(h * 0.34))   # 位置（x −0.34）：從街上（同角度圖的鏡頭 x 1.4）隔著右邊那扇門看得到整個標誌
    d.rectangle([0, h - h // 14, w, h], fill=ORANGE); d.rectangle([0, h - h // 40, w, h], fill=(60, 62, 66))


def t_sign(txt):
    def f(im, d):
        w, h = im.size; d.rounded_rectangle([0, 0, w, h], 30, fill=ORANGE); d.text((60, 20), txt, font=font(130), fill=(255, 255, 255))
    return f


MENU = [[('雙層牛肉堡套餐', '159'), ('勁辣雞腿堡套餐', '149')], [('雞塊 6 塊', '69'), ('薯條（大）', '59')],
        [('可樂', '35'), ('熱咖啡', '45'), ('蘋果派', '35')], [('早餐 05:00～10:30', ''), ('豬肉滿福堡', '59')]]


def food_burger(d, cx, cy, s):
    """菜單照片用的漢堡（自己畫的：麵包有亮面、芝麻、生菜、起司、肉排）"""
    for k in range(12):   # 上麵包：由暗到亮疊幾層，看起來有立體感
        t = k / 11; c = (int(186 + 50 * t), int(112 + 60 * t), int(44 + 46 * t)); ss = s * (1 - 0.35 * t)
        d.pieslice([cx - ss, cy - s * 0.95 + (s - ss) * 0.4, cx + ss, cy + s * 0.25], 180, 360, fill=c)
    for (sx, sy) in ((-0.5, -0.5), (-0.15, -0.66), (0.25, -0.6), (0.55, -0.4), (0.0, -0.4), (-0.35, -0.3)):
        d.ellipse([cx + s * sx - s * 0.05, cy + s * sy - s * 0.025, cx + s * sx + s * 0.05, cy + s * sy + s * 0.025], fill=(250, 238, 200))
    d.polygon([(cx - s * 1.08, cy - s * 0.12)] + [(cx - s + s * 2 * t, cy - s * 0.1 + s * 0.08 * math.sin(t * 18)) for t in [j / 30 for j in range(31)]] + [(cx + s * 1.08, cy - s * 0.12), (cx + s, cy + s * 0.05), (cx - s, cy + s * 0.05)], fill=(96, 170, 60))   # 生菜
    d.polygon([(cx - s * 0.95, cy + s * 0.0), (cx + s * 0.95, cy + s * 0.0), (cx + s * 0.6, cy + s * 0.2), (cx + s * 0.3, cy + s * 0.08), (cx - s * 0.2, cy + s * 0.22), (cx - s * 0.6, cy + s * 0.08)], fill=(250, 190, 40))   # 起司
    d.rounded_rectangle([cx - s * 1.0, cy + s * 0.08, cx + s * 1.0, cy + s * 0.34], int(s * 0.12), fill=(98, 50, 28)); d.line([(cx - s * 0.9, cy + s * 0.16), (cx + s * 0.9, cy + s * 0.16)], fill=(140, 76, 40), width=max(2, int(s * 0.04)))   # 肉排
    d.rounded_rectangle([cx - s * 0.95, cy + s * 0.32, cx + s * 0.95, cy + s * 0.6], int(s * 0.14), fill=(214, 150, 70)); d.line([(cx - s * 0.8, cy + s * 0.38), (cx + s * 0.7, cy + s * 0.38)], fill=(236, 186, 110), width=max(2, int(s * 0.05)))   # 下麵包
    d.ellipse([cx - s * 0.55, cy - s * 0.78, cx - s * 0.15, cy - s * 0.6], fill=(246, 206, 140))   # 亮面


def food_fries(d, cx, cy, s):
    """薯條：紅色紙盒（橘色標誌）＋一把金黃的薯條"""
    r = random.Random(int(cx + cy))
    for k in range(16):
        x = cx + r.uniform(-0.55, 0.55) * s; a = r.uniform(-0.25, 0.25); L_ = r.uniform(0.7, 1.05) * s
        c = (r.randint(240, 255), r.randint(196, 222), r.randint(60, 90))
        d.line([(x, cy + s * 0.1), (x + math.sin(a) * L_, cy - L_)], fill=c, width=max(4, int(s * 0.2)))
    d.polygon([(cx - s * 0.6, cy + s * 0.25), (cx + s * 0.6, cy + s * 0.25), (cx + s * 0.48, cy + s * 0.95), (cx - s * 0.48, cy + s * 0.95)], fill=(206, 40, 36))   # 紙盒（下半）
    d.polygon([(cx - s * 0.6, cy + s * 0.25), (cx, cy + s * 0.42), (cx + s * 0.6, cy + s * 0.25)], fill=(226, 60, 48))
    d.ellipse([cx - s * 0.17, cy + s * 0.5, cx + s * 0.17, cy + s * 0.75], fill=(250, 200, 60))


def food_drink(d, cx, cy, s, col=(150, 60, 30)):
    """飲料：透明杯（看得到可樂／紅茶的顏色、冰塊）＋白蓋＋吸管"""
    d.polygon([(cx - s * 0.45, cy - s * 0.8), (cx + s * 0.45, cy - s * 0.8), (cx + s * 0.36, cy + s * 0.9), (cx - s * 0.36, cy + s * 0.9)], fill=col)
    for (ix, iy) in ((-0.15, -0.5), (0.15, -0.3), (-0.1, -0.05)): d.rectangle([cx + s * ix - s * 0.1, cy + s * iy - s * 0.08, cx + s * ix + s * 0.1, cy + s * iy + s * 0.08], fill=tuple(min(255, v + 70) for v in col))
    d.polygon([(cx - s * 0.3, cy - s * 0.78), (cx - s * 0.2, cy - s * 0.78), (cx - s * 0.16, cy + s * 0.85), (cx - s * 0.24, cy + s * 0.85)], fill=tuple(min(255, v + 50) for v in col))   # 杯子的反光
    d.rounded_rectangle([cx - s * 0.5, cy - s * 0.92, cx + s * 0.5, cy - s * 0.78], int(s * 0.06), fill=(246, 246, 244))
    d.line([(cx + s * 0.1, cy - s * 0.9), (cx + s * 0.25, cy - s * 1.35)], fill=ORANGE, width=max(3, int(s * 0.09)))


def food_nuggets(d, cx, cy, s):
    r = random.Random(7)
    d.rounded_rectangle([cx - s, cy - s * 0.2, cx + s, cy + s * 0.6], int(s * 0.15), fill=(246, 236, 214))
    for k in range(6):
        x, y = cx + (k % 3 - 1) * s * 0.55 + r.uniform(-8, 8), cy - s * 0.2 + (k // 3) * s * 0.32 + r.uniform(-6, 6)
        d.rounded_rectangle([x - s * 0.28, y - s * 0.2, x + s * 0.28, y + s * 0.2], int(s * 0.15), fill=(214, 146, 58)); d.ellipse([x - s * 0.14, y - s * 0.14, x, y - s * 0.02], fill=(236, 180, 96))


def food_pie(d, cx, cy, s):
    d.rounded_rectangle([cx - s, cy - s * 0.35, cx + s, cy + s * 0.35], int(s * 0.25), fill=(220, 150, 64))
    for k in range(5): d.line([(cx - s * 0.7 + k * s * 0.35, cy - s * 0.25), (cx - s * 0.8 + k * s * 0.35, cy + s * 0.25)], fill=(176, 100, 40), width=max(2, int(s * 0.08)))


def food_coffee(d, cx, cy, s):
    d.polygon([(cx - s * 0.45, cy - s * 0.6), (cx + s * 0.45, cy - s * 0.6), (cx + s * 0.36, cy + s * 0.8), (cx - s * 0.36, cy + s * 0.8)], fill=(248, 246, 240))
    d.rectangle([cx - s * 0.42, cy - s * 0.1, cx + s * 0.42, cy + s * 0.25], fill=(120, 76, 46)); d.rounded_rectangle([cx - s * 0.5, cy - s * 0.74, cx + s * 0.5, cy - s * 0.58], int(s * 0.06), fill=(60, 44, 36))
    for k in range(3): d.arc([cx - s * 0.2 + k * s * 0.15, cy - s * 1.2, cx + k * s * 0.15, cy - s * 0.8], 200, 340, fill=(240, 240, 240), width=3)


def t_menu(i):
    """v2b：菜單螢幕改成有食物照片的那種（自己畫的漢堡、薯條、飲料；明亮的暖色底、橘色標題、價錢）"""
    def f(im, d):
        w, h = im.size
        for y in range(h):   # 照片的背景：暖白到淺橘的漸層（像打光的商品照）
            t = y / h; d.line([(0, y), (w, y)], fill=(int(70 + 90 * t), int(130 + 80 * t), int(214 + 30 * t)))   # 外觀圖的菜單螢幕：亮藍底
        d.ellipse([w * 0.06, h * 0.6, w * 0.94, h * 1.1], fill=(236, 240, 250))   # 白色的盤子／桌面的光
        d.rectangle([0, 0, w, 50], fill=ORANGE); d.text((20, 4), ['超值套餐', '點心', '飲料・甜點', '早餐'][i], font=font(38), fill=(255, 255, 255))
        logo_light(d, w - 46, 26, 18)
        if i == 0:
            food_burger(d, int(w * 0.36), int(h * 0.55), 120); food_fries(d, int(w * 0.72), int(h * 0.46), 70); food_drink(d, int(w * 0.88), int(h * 0.55), 58)
        elif i == 1:
            food_nuggets(d, int(w * 0.3), int(h * 0.58), 95); food_fries(d, int(w * 0.72), int(h * 0.46), 95)
        elif i == 2:
            food_drink(d, int(w * 0.2), int(h * 0.55), 80); food_coffee(d, int(w * 0.5), int(h * 0.6), 80); food_pie(d, int(w * 0.8), int(h * 0.68), 80)
        else:
            food_burger(d, int(w * 0.32), int(h * 0.58), 105); food_coffee(d, int(w * 0.72), int(h * 0.6), 80)
        rows = MENU[i]; y = h - 46; d.rectangle([0, y - 4, w, h], fill=(36, 52, 95))
        x = 14
        for (n, p) in rows:
            t_ = n + (' ' + p if p else ''); d.text((x, y), t_, font=font(28), fill=(255, 255, 255)); x += int(d.textlength(t_, font=font(28))) + 26
    return f


def t_menu_old(i):
    def f(im, d):
        w, h = im.size; d.rectangle([0, 0, w, h], fill=(22, 30, 56)); d.rectangle([0, 0, w, 54], fill=ORANGE)
        d.text((24, 6), ['超值套餐', '點心', '飲料・甜點', '早餐'][i], font=font(40), fill=(255, 255, 255))
        rows = MENU[i]
        for k, (n, p) in enumerate(rows):
            y = 80 + k * (h - 90) // len(rows); r = random.Random(i * 10 + k)
            cx, cy = 90, y + 55
            if i == 0 or (i == 3 and k == 1):
                d.pieslice([cx - 60, cy - 50, cx + 60, cy + 20], 180, 360, fill=(222, 160, 80)); d.rectangle([cx - 62, cy - 12, cx + 62, cy + 6], fill=(110, 60, 36))
                d.rectangle([cx - 64, cy - 18, cx + 64, cy - 10], fill=(100, 170, 70)); d.rounded_rectangle([cx - 58, cy + 6, cx + 58, cy + 26], 10, fill=(222, 160, 80))
            elif i == 1:
                for _ in range(5): x_ = cx + r.randint(-50, 40); d.rounded_rectangle([x_, cy - 20 + r.randint(-10, 10), x_ + 30, cy + 4], 8, fill=(214, 156, 70))
            else:
                d.rounded_rectangle([cx - 30, cy - 50, cx + 30, cy + 30], 10, fill=[(200, 40, 40), (120, 80, 50), (214, 150, 70)][k % 3])
            d.text((180, y + 20), n, font=font(44 if len(n) < 8 else 34), fill=(255, 255, 255))
            if p: d.text((w - 130, y + 20), p, font=font(56), fill=(255, 196, 90))
    return f


def t_kiosk(im, d):
    w, h = im.size; d.rectangle([0, 0, w, h], fill=(250, 250, 248)); d.rectangle([0, 0, w, 80], fill=NAVY); logo(d, 60, 48, 26)
    d.text((110, 18), '自助點餐', font=font(44), fill=(255, 255, 255))
    r = random.Random(3)
    for j in range(3):
        for i in range(2):
            x, y = 24 + i * 186, 110 + j * 190; d.rounded_rectangle([x, y, x + 168, y + 170], 16, fill=(240, 236, 228))
            d.ellipse([x + 44, y + 24, x + 124, y + 104], fill=[(222, 160, 80), (214, 156, 70), (200, 40, 40)][r.randint(0, 2)])
    d.rounded_rectangle([24, h - 110, w - 24, h - 30], 20, fill=ORANGE); d.text((120, h - 100), '開始點餐', font=font(48), fill=(255, 255, 255))


def t_ceiling(im, d):     # 輕鋼架天花板：60 cm 一格
    w, h = im.size; d.rectangle([0, 0, w, h], fill=(228, 220, 204)); r = random.Random(9)
    for _ in range(4000): x, y = r.randint(0, w - 1), r.randint(0, h - 1); g = r.randint(212, 228); d.point((x, y), fill=(g, g - 4, g - 12))
    for k in range(0, w, w // 4): d.rectangle([k, 0, k + 3, h], fill=(206, 204, 200)); d.rectangle([0, k, w, k + 3], fill=(206, 204, 200))


def t_floor(im, d):       # 地板：淺灰大磁磚（60 cm，一張貼圖 2×2 片），細縫、淡淡的石紋——floor_tiles_06 是黑白交錯的，太像棋盤
    w, h = im.size; r = random.Random(21)
    for j in range(2):
        for i in range(2):
            g = 196 + r.randint(-4, 4); d.rectangle([i * w // 2, j * h // 2, (i + 1) * w // 2, (j + 1) * h // 2], fill=(g, g - 8, g - 24))   # v2：暖一點的灰
    for _ in range(9000):
        x, y = r.randint(0, w - 1), r.randint(0, h - 1); g = r.randint(182, 208); d.point((x, y), fill=(g, g - 8, g - 24))
    for k in (0, w // 2): d.rectangle([k, 0, k + 2, h], fill=(168, 166, 162)); d.rectangle([0, k, w, k + 2], fill=(168, 166, 162))


def t_poster(im, d):      # 牆上的小海報：漢堡＋飲料（自己畫的）
    w, h = im.size; d.rectangle([0, 0, w, h], fill=NAVY); logo(d, w // 2 - 40, h // 2, 70)
    d.rounded_rectangle([w // 2 + 60, h // 2 - 60, w // 2 + 120, h // 2 + 60], 10, fill=(250, 248, 242)); d.rectangle([w // 2 + 60, h // 2 - 20, w // 2 + 120, h // 2 + 10], fill=ORANGE)
    d.line([(w // 2 + 100, h // 2 - 60), (w // 2 + 112, h // 2 - 110)], fill=(250, 248, 242), width=6)
    d.text((40, h - 110), '考試加油　宵夜半價', font=font(46), fill=(250, 248, 242))


def t_poster1(im, d):     # v2b：一樓座位區東牆的海報（外觀圖右邊）：深藍底、薯條＋飲料、「宵夜也開著」
    w, h = im.size; d.rectangle([0, 0, w, h], fill=NAVY)
    d.text((40, 36), '24h 大口漢堡', font=font(48), fill=(250, 248, 242)); d.line([(40, 104), (w - 40, 104)], fill=ORANGE, width=6)
    food_fries(d, int(w * 0.32), int(h * 0.56), 95); food_drink(d, int(w * 0.68), int(h * 0.58), 95, col=(232, 140, 50))
    d.text((40, h - 120), '宵夜也開著', font=font(56), fill=(250, 248, 242)); swoosh(d, w, h, h * 0.86)


def t_study_logo(im, d):   # v2：樓梯間的標誌牆（深藍底、漢堡標誌、「大口漢堡」、橘色弧）
    w, h = im.size; d.rectangle([0, 0, w, h], fill=NAVY); logo(d, w // 2, int(h * 0.35), int(w * 0.22))
    d.text((int(w * 0.12), int(h * 0.55)), '大口漢堡', font=font(int(w * 0.18)), fill=(250, 248, 242)); swoosh(d, w, h, h * 0.78)


def t_staff(im, d):
    w, h = im.size; d.rectangle([0, 0, w, h], fill=(250, 248, 242)); d.text((24, 16), '員工專用', font=font(70), fill=NAVY)


def t_night(im, d):       # 只給渲染：窗外的新生南路夜景（樹、路燈、校園的圍牆）
    w, h = im.size
    for y in range(h): t = y / h; d.line([(0, y), (w, y)], fill=(int(14 + 20 * t), int(18 + 20 * t), int(30 + 16 * t)))
    d.rectangle([0, int(h * 0.62), w, h], fill=(40, 42, 46)); r = random.Random(5)
    for k in range(9):
        x = int(w * (k + 0.5) / 9); d.rectangle([x - 6, int(h * 0.25), x + 6, int(h * 0.64)], fill=(30, 26, 22))
        for _ in range(60):
            cx, cy = x + r.randint(-110, 110), int(h * 0.25) + r.randint(-120, 40); rr = r.randint(18, 40)
            g = r.randint(40, 80); d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=(int(g * 0.8), g, int(g * 0.5)))
        d.rectangle([x + 60, int(h * 0.2), x + 64, int(h * 0.64)], fill=(70, 70, 70)); d.ellipse([x + 46, int(h * 0.18), x + 80, int(h * 0.22)], fill=(255, 220, 150))
    d.rectangle([0, int(h * 0.55), w, int(h * 0.62)], fill=(70, 66, 60))


# ---------------- v2：一張發光貼圖集 GLOW_dk_screens（窗外夜景、菜單螢幕、點餐機、筆電螢幕；正式 GLB 也有）----------------
GS = 2048
GEMIT = 1.0 if FL == 2 else 1.5   # v2b：一樓的發光貼圖集（菜單螢幕、點餐機）亮一點；二樓照舊（MODEL_READY，不動）
GR = {}   # 名稱 → (u0, v0, u1, v1)，v 從下往上


def _grect(name, x, y, w, h):
    GR[name] = (x / GS, 1 - (y + h) / GS, (x + w) / GS, 1 - y / GS); return (x, y, x + w, y + h)


def night_scene(im, box, seed, west=False):
    """窗外的新生南路夜景（從店裡往外看）：深藍夜空、對面校園圍牆與行道樹（路燈照亮的樹冠）、暖色路燈、馬路的反光、遠處大樓的窗、紅綠燈、公車亭"""
    x0, y0, x1, y1 = box; w, h = x1 - x0, y1 - y0; d = ImageDraw.Draw(im); r = random.Random(seed)
    for y in range(h):
        t = y / h; d.line([(x0, y0 + y), (x1, y0 + y)], fill=(int(10 + 16 * t), int(14 + 18 * t), int(30 + 14 * t)))
    for k in range(14):   # 遠處大樓（亮著的窗）
        bx = x0 + r.randint(0, w - 120); bw = r.randint(80, 200); bt = y0 + r.randint(int(h * 0.05), int(h * 0.3))
        d.rectangle([bx, bt, bx + bw, y0 + int(h * 0.6)], fill=(24, 26, 34))
        for wy in range(bt + 10, y0 + int(h * 0.58), 22):
            for wx in range(bx + 8, bx + bw - 8, 18):
                if r.random() < 0.35: d.rectangle([wx, wy, wx + 8, wy + 10], fill=(220, 200, 140) if r.random() < 0.7 else (180, 200, 220))
    gy = y0 + int(h * 0.66)
    d.rectangle([x0, gy, x1, y1], fill=(34, 34, 38))                                   # 馬路
    d.rectangle([x0, gy - int(h * 0.05), x1, gy], fill=(58, 54, 50))                  # 人行道
    d.rectangle([x0, gy - int(h * 0.13), x1, gy - int(h * 0.05)], fill=(70, 64, 56))  # 對面校園的圍牆
    for k in range(12): xx = x0 + k * w // 12; d.rectangle([xx, gy - int(h * 0.16), xx + 10, gy - int(h * 0.05)], fill=(90, 84, 74))
    for k in range(9):    # 行道樹（路燈照亮的樹冠：近燈的地方暖黃綠）
        cx = x0 + int(w * (k + 0.5) / 9) + r.randint(-30, 30); d.rectangle([cx - 8, y0 + int(h * 0.3), cx + 8, gy - int(h * 0.03)], fill=(40, 32, 24))
        for _ in range(110):   # v2：樹冠小一點、暗一點，只有路燈旁邊被照亮（暖黃綠）
            px, py = cx + r.randint(-110, 110), y0 + int(h * 0.3) + r.randint(-110, 50); rr = r.randint(8, 22); lit = max(0.0, 1 - abs(px - cx - 60) / 150) ** 1.5
            g = r.randint(18, 34); d.ellipse([px - rr, py - rr, px + rr, py + rr], fill=(int(g * 0.8 + 110 * lit), int(g + 90 * lit), int(g * 0.5 + 30 * lit)))
    for k in range(5):    # 路燈（暖色）＋地上的光
        lx = x0 + int(w * (k * 2 + 1) / 10) + 40
        d.line([(lx, gy), (lx, y0 + int(h * 0.22))], fill=(80, 80, 84), width=7); d.line([(lx, y0 + int(h * 0.22)), (lx + 50, y0 + int(h * 0.2))], fill=(80, 80, 84), width=6)
        for rr, c in ((40, (120, 90, 40)), (24, (220, 170, 90)), (12, (255, 236, 190))): d.ellipse([lx + 50 - rr, y0 + int(h * 0.2) - rr, lx + 50 + rr, y0 + int(h * 0.2) + rr], fill=c)
        d.ellipse([lx - 70, gy + 10, lx + 170, gy + 60], fill=(90, 74, 50))
    for k in range(10): d.rectangle([x0 + k * w // 10 + 30, gy + int(h * 0.15), x0 + k * w // 10 + 110, gy + int(h * 0.165)], fill=(180, 176, 160))   # 車道線
    if west:   # 路口：紅綠燈、斑馬線
        tx = x0 + int(w * 0.55); d.rectangle([tx, y0 + int(h * 0.3), tx + 10, gy], fill=(70, 72, 70)); d.rectangle([tx - 30, y0 + int(h * 0.3), tx + 10, y0 + int(h * 0.42)], fill=(30, 32, 30))
        d.ellipse([tx - 24, y0 + int(h * 0.31), tx + 2, y0 + int(h * 0.35)], fill=(230, 60, 50)); d.ellipse([tx - 24, y0 + int(h * 0.37), tx + 2, y0 + int(h * 0.41)], fill=(50, 60, 50))
        for k in range(8): d.rectangle([x0 + int(w * 0.6) + k * 40, gy + int(h * 0.04), x0 + int(w * 0.6) + k * 40 + 22, y1 - 6], fill=(150, 148, 140))
    else:      # 新生南路的路牌、公車亭
        sx = x0 + int(w * 0.18); d.rectangle([sx, y0 + int(h * 0.28), sx + 8, gy], fill=(80, 82, 80)); d.rectangle([sx - 60, y0 + int(h * 0.24), sx + 70, y0 + int(h * 0.3)], fill=(24, 110, 64))
        d.text((sx - 52, y0 + int(h * 0.245)), '新生南路', font=font(24), fill=(240, 240, 236))
        bx = x0 + int(w * 0.7); d.rectangle([bx, gy - int(h * 0.2), bx + 180, gy - int(h * 0.18)], fill=(90, 94, 98)); d.rectangle([bx + 20, gy - int(h * 0.18), bx + 70, gy], fill=(120, 150, 170))
    im.paste(im.crop(box).filter(ImageFilter.GaussianBlur(1.0)).point(lambda v: int(v * 0.75 / GEMIT)), (x0, y0))   # v2b：一樓的貼圖集發光加強（GEMIT），窗外夜景照比例調暗，亮度和 v2 一樣   # v2：整張暗一點（晚上的窗外比店裡暗）


def make_glow_atlas():
    im = Image.new('RGB', (GS, GS), (0, 0, 0))
    night_scene(im, _grect('night_front', 0, 0, GS, 640), 5); night_scene(im, _grect('night_west', 0, 640, GS, 640), 9, west=True)
    for i in range(4):
        b = _grect(f'menu{i}', i * 512, 1280, 512, 288); m = Image.new('RGB', (640, 360)); t_menu(i)(m, ImageDraw.Draw(m)); im.paste(m.resize((512, 288)), b[:2])
    b = _grect('kiosk', 0, 1568, 256, 464); m = Image.new('RGB', (420, 760)); t_kiosk(m, ImageDraw.Draw(m)); im.paste(m.resize((256, 464)), b[:2])
    for k in range(6):   # 筆電螢幕：文件、簡報、判決、網頁、程式、PDF（深淺不一）
        b = _grect(f'laptop{k}', 256 + (k % 3) * 256, 1568 + (k // 3) * 170, 256, 160); d = ImageDraw.Draw(im); x, y = b[:2]
        bg = [(240, 242, 246), (30, 34, 44), (246, 244, 236), (232, 238, 248), (24, 28, 36), (236, 236, 232)][k]
        d.rectangle([x, y, x + 255, y + 159], fill=bg); d.rectangle([x, y, x + 255, y + 14], fill=[(60, 90, 160), (50, 50, 60), (120, 40, 40), (40, 120, 200), (70, 70, 90), (180, 60, 50)][k])
        r = random.Random(k)
        for ln in range(9):
            lw = r.randint(80, 220); c = (90, 96, 110) if sum(bg) > 300 else (170, 200, 180)
            d.rectangle([x + 14, y + 24 + ln * 14, x + 14 + lw, y + 29 + ln * 14], fill=c)
    p = os.path.join(TMP, 'dk_glow_atlas.png'); im.save(p); return p


def gquad(m, pts, rect):
    """發光貼圖集上的一片：pts＝左下、右下、右上、左上（站在正面看）"""
    bm = m.bm; uvl = bm.loops.layers.uv.verify(); u0, v0, u1, v1 = rect
    f = bm.faces.new([bm.verts.new(g2b(*p_)) for p_ in pts])
    for lp, uv in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = uv
    return f


def gz(m, z, x0, x1, y0, y1, facing, rect):   # z＝常數的一片，facing ±1
    if facing > 0: return gquad(m, [(x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z)], rect)
    return gquad(m, [(x1, y0, z), (x0, y0, z), (x0, y1, z), (x1, y1, z)], rect)


def gx(m, x, z0, z1, y0, y1, facing, rect):   # x＝常數的一片
    if facing > 0: return gquad(m, [(x, y0, z1), (x, y0, z0), (x, y1, z0), (x, y1, z1)], rect)
    return gquad(m, [(x, y0, z0), (x, y0, z1), (x, y1, z1), (x, y1, z0)], rect)


def t_books(im, d):   # 課本封面（照參考圖：民法（總則）、刑法、憲法；另外兩本是虛構的書名）
    w, h = im.size; titles = [('民法（總則）', (36, 52, 95)), ('刑法', (140, 36, 34)), ('憲法', (32, 48, 92)), ('行政法', (40, 90, 70)), ('法學緒論', (110, 70, 40))]
    cw = w // len(titles)
    for i, (t, c) in enumerate(titles):
        d.rectangle([i * cw, 0, (i + 1) * cw - 1, h], fill=c); d.rectangle([i * cw + 6, 6, (i + 1) * cw - 7, h - 7], outline=(230, 210, 150), width=3)
        fs = 52 if len(t) <= 3 else 34; d.text((i * cw + 16, h // 2 - fs // 2), t, font=font(fs), fill=(244, 236, 214))


P = {k: tex(f'{k}.png', s, f) for k, s, f in (('mural', (1400, 330), t_mural), ('study', (420, 840), t_study), ('counter', (2400, 310), t_counter),
                                               ('sign_order', (420, 170), t_sign('點餐')), ('sign_pick', (420, 170), t_sign('取餐')),
                                               ('kiosk', (420, 760), t_kiosk), ('ceiling', (512, 512), t_ceiling), ('poster', (520, 700), t_poster),
                                               ('staff', (340, 110), t_staff), ('floor', (512, 512), t_floor), ('books', (1000, 120), t_books), ('study_logo', (420, 360), t_study_logo))}
if FL == 1: P['poster1'] = tex('poster1.png', (520, 700), t_poster1)
GLOW_PATH = make_glow_atlas()
for i in range(4): P[f'menu{i}'] = tex(f'menu{i}.png', (640, 360), t_menu(i))

# ---------------- 材質（≤12，最後 vc_consolidate／atlas_small 合併）----------------
m_floor = img_mat('dk_floor', P['floor'], rough=0.35); m_floor['tile'] = 1.2
m_lam = L.pbr('dk_laminate', 'laminate_floor_02', tile=1.4, target='#d7b78a', normal=0.2, maps=('diff',), rough_value=0.45)   # 桌面、吧台檯面、木椅、扶手（不是地板）
m_wall = L.flat('dk_wall', '#e8c492' if FL == 2 else '#f2e0c6', rough=0.8)   # v2b：一樓的牆淺一點（外觀圖是暖白）   # v2：晚上暖光下的奶油色   # v2：暖一點的米白（晚上的暖光下）
m_black = K.acg('dk_black', 'Metal009', maps=('diff',), target='#26282c', metal=0.35, rough_value=0.45, tile=1.0, res=256)   # CC0（原本純色）
m_base = K.acg('dk_base', 'Plastic006', maps=('diff',), vary=0.05, target='#5a5c60', rough_value=0.6, tile=0.5, res=256)   # 踢腳板（PVC）
m_steel = L.flat('dk_steel', '#b9bdc1', rough=0.3, metal=0.42)
m_glass = L.flat('dk_glass', '#c8d4d8', rough=0.04, alpha=0.07)   # v2：透明的玻璃（不是霧面板），看得到窗外的夜景
m_panel = glowmat('dk_lightpanel', '#ffc98a' if FL == 2 else '#ffcf96', 2.4 if FL == 2 else 26.0)   # v2b：一樓的燈板、崁燈再亮再暖（曝光 0 就接近參考圖）   # v2：晚上的燈板約 3000K 暖光   # v2：晚上的燈板，暖白、不刺眼
m_warm = glowmat('dk_warm', '#ffc070', 5.0 if FL == 2 else 9.0)
m_screens = img_mat('GLOW_dk_screens', GLOW_PATH, rough=0.3, emit=GEMIT)   # v2：窗外夜景、菜單、點餐機、筆電螢幕（一張發光貼圖集＝一個材質）
SCR = Mesh('GLOW_SCREENS', m_screens)
m_vc = L.vc_material('dk_props_vc', rough=0.6)
m_ceil = img_mat('dk_ceiling', P['ceiling'], rough=0.9); m_ceil.use_backface_culling = True
IM = {k: img_mat('dk_' + k, p, rough=0.5) for k, p in P.items() if k not in ('ceiling', 'floor')}   # 選單螢幕不另外發光：全部併進一張貼圖集（材質 ≤ 12）；要亮由 LAWWW2 烘
T = 0.2


def ceiling():
    """天花板（單面朝下）：輕鋼架貼圖；方形燈板、崁燈；樓梯那一塊開洞"""
    c = Mesh('CEILING', m_ceil); step = 0.6
    xs = [X0 + i * step for i in range(int(W / step) + 1)]; zs = [Z0 + i * step for i in range(int(D / step) + 1)]
    bm = bmesh.new(); ul = bm.loops.layers.uv.new()
    for xa, xb in zip(xs, xs[1:]):
        for za, zb in zip(zs, zs[1:]):
            if SH['x0'] - 1e-6 <= xa and xb <= SH['x1'] + 1e-6 and SH['z0'] - 1e-6 <= za and zb <= SH['z1'] + 1e-6: continue
            vs = [bm.verts.new(g2b(x, YC, z)) for (x, z) in ((xa, za), (xb, za), (xb, zb), (xa, zb))]; f = bm.faces.new(vs); f.normal_update()
            uvs = ((0, 0), (1, 0), (1, 1), (0, 1))
            if f.normal.z > 0: f.normal_flip()
            for lp in f.loops:
                co = lp.vert.co; lp[ul].uv = ((co.x - X0) / 2.4, (co.y + Z0) / 2.4)
    B.mesh_obj('CEILING', bm, m_ceil, root, {'ceiling': 1}); c.bm.free()
    pn = Mesh('CEIL_LIGHTS', m_panel); fr = CMesh('CEIL_FRAMES', m_vc)
    for lt in F['lights']:
        if lt['kind'] == 'panel':
            x, z = lt['x'], lt['z']; down_quad(pn, x - 0.29, x + 0.29, z - 0.29, z + 0.29, YC - 0.012); fr.cbox(x - 0.31, x + 0.31, YC - 0.01, YC, z - 0.31, z + 0.31, '#d8d8d6')
    r = random.Random(12)
    for x in [X0 + 1.2 + 1.8 * i for i in range(6)]:   # 崁燈
        for z in [Z0 + 1.0 + 2.0 * j for j in range(8)]:
            if SH['x0'] - 0.3 < x < SH['x1'] and SH['z0'] - 0.3 < z < SH['z1'] + 0.3: continue
            dq = 0.06 if FL == 2 else 0.09; down_quad(pn, x - dq, x + dq, z - dq, z + dq, YC - 0.006)   # v2b：一樓的崁燈大一點
    for (x, z) in ((-3.0, -6.6), (2.0, 6.6), (-4.6, 3.0)):   # 空調出風口
        fr.cbox(x - 0.4, x + 0.4, YC - 0.03, YC, z - 0.4, z + 0.4, '#e2e2e0')
        for k in range(5): fr.cbox(x - 0.34, x + 0.34, YC - 0.035, YC - 0.03, z - 0.3 + k * 0.15, z - 0.26 + k * 0.15, '#9a9c9e')
    newpaint(fr, lambda: fr.add_bm(L.lathe([(0.0, -0.1), (0.06, -0.09), (0.08, -0.03), (0.08, 0.0), (0.0, 0.0)], seg=14), Matrix.Translation(g2b(X1 - 0.4, YC - 0.1, Z0 + 0.4))), '#2c2e32')   # 監視器
    pn.finish(root); fr.finish(root, smooth=True)


def floor_slab():
    """地板：一樓整片；二樓扣掉樓梯口"""
    fm = Mesh('FLOOR', m_floor, tile=1.2)
    if FL == 1: fm.box(X0, X1, Y0 - 0.05, Y0, Z0, Z1)
    else:
        for (a, b, c, d_) in ((X0, SH['x0'], Z0, Z1), (SH['x0'], X1, Z0, SH['z0']), (SH['x0'], X1, SH['z1'], Z1)): fm.box(a, b, Y0 - 0.05, Y0, c, d_)
    fm.finish(root)
    if FL == 1:   # 樓梯口的樓板邊（一樓抬頭看得到）
        e = Mesh('STAIRHOLE_EDGE', m_wall); e.box(SH['x0'] - 0.02, SH['x0'], 3.402, 3.62, SH['z0'], SH['z1']); e.box(SH['x0'], X1, 3.402, 3.62, SH['z1'], SH['z1'] + 0.02); e.finish(root)   # SHOP-CC0-HELP-1113：疊面錯開（place_gate）：底面離天花板 2 mm


def glass_wall(side, a0, a1, y0, y1, solid_runs=(), door=None):
    """落地玻璃（黑色窗框）。side：front（z＝Z1）或 left（x＝X0）。玻璃不放進淡出群組（fadeWalls 會把整組設成不透明）"""
    g = B.group(f'WALL_{side}', root, props={'dir': DIRS[side]}); fr = Mesh(f'WALL_{side}_frame', m_black); gl = Mesh(f'{side}_glass', m_glass)
    def seg(u0, u1):
        n = max(1, round((u1 - u0) / 1.6)); us = [u0 + (u1 - u0) * i / n for i in range(n + 1)]
        for u in us:
            # 直框比橫框薄 2 mm（前後各縮 2 mm）：兩個方塊的前、後面不在同一平面（SHOP-CC0-HELP-1113，place_gate 疊面：原本直框、橫框交接處整片疊在一起會閃）
            if side == 'front': fr.box(u - 0.04, u + 0.04, y0, y1, Z1 - 0.058, Z1 + 0.038)
            else: fr.box(X0 - 0.038, X0 + 0.058, y0, y1, u - 0.04, u + 0.04)
        if side == 'front':
            fr.box(u0, u1, y0, y0 + 0.1, Z1 - 0.06, Z1 + 0.04); fr.box(u0, u1, y1 - 0.08, y1, Z1 - 0.06, Z1 + 0.04); gl.box(u0, u1, y0 + 0.1, y1 - 0.08, Z1 - 0.01, Z1 + 0.0)
        else:
            fr.box(X0 - 0.04, X0 + 0.06, y0, y0 + 0.1, u0, u1); fr.box(X0 - 0.04, X0 + 0.06, y1 - 0.08, y1, u0, u1); gl.box(X0 + 0.0, X0 + 0.01, y0 + 0.1, y1 - 0.08, u0, u1)
    if door:
        dx0, dx1 = door['x'] - door['w'] / 2, door['x'] + door['w'] / 2
        seg(a0, dx0); seg(dx1, a1)
        x = (dx0 + dx1) / 2; fr.box(x - 0.04, x + 0.04, y0, 2.6, Z1 - 0.058, Z1 + 0.038)   # 門中間的直框（門兩邊的直框 seg() 已經有了：原本又疊一根一模一樣的）
        fr.box(dx0, dx1, 2.52, 2.6, Z1 - 0.06, Z1 + 0.04); gl.box(dx0 + 0.04, dx1 - 0.04, 0.05, 2.52, Z1 - 0.01, Z1)
        fr.box(dx0, dx1, 2.6, y1, Z1 - 0.06, Z1 + 0.04)   # 門上的窗框（簡化：一整塊）
        for x in ((dx0 + dx1) / 2 - 0.12, (dx0 + dx1) / 2 + 0.12): fr.box(x - 0.015, x + 0.015, 0.9, 1.3, Z1 - 0.12, Z1 - 0.06)   # 門把
    else: seg(a0, a1)
    w = Mesh(f'WALL_{side}_solid', m_wall)
    for q in solid_runs: w.box(*q)
    top = (YC, Y0 + HH)
    if side == 'front': w.box(X0, X1, y1, top[1], Z1, Z1 + T)
    else: w.box(X0 - T, X0, y1, top[1], Z0, Z1)
    fr.finish(g); w.finish(g); gl.finish(root, props={'glass': 1}); return g


def solid_wall(side):
    g = B.group(f'WALL_{side}', root, props={'dir': DIRS[side]}); w = Mesh(f'WALL_{side}_plaster', m_wall)
    if side == 'right': w.box(X1, X1 + T, Y0, Y0 + HH, Z0, Z1)
    elif side == 'back': w.box(X0, X1, Y0, Y0 + HH, Z0 - T, Z0)
    w.finish(g)
    b = Mesh(f'WALL_{side}_base', m_base)   # 踢腳板（CC0 塑膠）
    if side == 'right': b.box(X1 - 0.015, X1 - 0.002, Y0 + 0.001, Y0 + 0.1, Z0, Z1)   # SHOP-CC0-HELP-1113：疊面錯開（place_gate）：離牆 2 mm、離地 1 mm
    else: b.box(X0, X1, Y0 + 0.001, Y0 + 0.1, Z0 + 0.002, Z0 + 0.015)
    b.finish(g); return g


def chair(cm, legs, x, z, yaw, col, y=None):
    """參考圖的椅子：木紋（橘棕）或深藍布面的座位和靠背、黑鐵腳；(x,z) 是人坐的位置、面向 yaw"""
    y = Y0 if y is None else y
    lbox(cm, x, z, yaw, -0.22, 0.22, y + 0.44, y + 0.49, -0.2, 0.22, col, r=0.02)
    lbox(cm, x, z, yaw, -0.21, 0.21, y + 0.58, y + 0.86, -0.25, -0.2, col, r=0.02)
    for lx in (-0.19, 0.19):
        for lz in (-0.17, 0.19): lbox(legs, x, z, yaw, lx - 0.013, lx + 0.013, y, y + 0.44, lz - 0.013, lz + 0.013)
        lbox(legs, x, z, yaw, lx - 0.012, lx + 0.012, y + 0.44, y + 0.86, -0.24, -0.215)
    lbox(legs, x, z, yaw, -0.19, 0.19, y + 0.12, y + 0.14, 0.18, 0.2)


def stool(cm, legs, x, z, col):
    """一樓吧台的高腳椅：圓座墊、黑桿、圓底座、腳踏環"""
    cm.add_bm(L.lathe([(0.0, 0.0), (0.19, 0.0), (0.2, 0.04), (0.18, 0.07), (0.0, 0.075)], seg=18), Matrix.Translation(g2b(x, Y0 + 0.72, z)))
    legs.cyl((x, Y0 + 0.02, z), (x, Y0 + 0.72, z), 0.028, seg=10); legs.cyl((x, Y0, z), (x, Y0 + 0.02, z), 0.2, seg=20)
    legs.add_bm(L.lathe([(0.17, 0.0), (0.185, 0.0), (0.185, 0.015), (0.17, 0.015)], seg=20), Matrix.Translation(g2b(x, Y0 + 0.3, z)))
    return col


def table(top, legs, x, z, w, d, h=0.75, round_=False):
    y = Y0
    if round_:
        top.add_bm(L.lathe([(0.0, 0.0), (w / 2, 0.0), (w / 2, 0.03), (0.0, 0.03)], seg=24), Matrix.Translation(g2b(x, y + h - 0.03, z)))
        legs.cyl((x, y + 0.02, z), (x, y + h - 0.03, z), 0.035, seg=10); legs.cyl((x, y, z), (x, y + 0.02, z), 0.24, seg=20); return
    top.rbox(x - w / 2, x + w / 2, y + h - 0.035, y + h, z - d / 2, z + d / 2, r=0.008, seg=2)
    for sx in (-1, 1):
        for sz in (-1, 1): legs.box(x + sx * (w / 2 - 0.06) - 0.02, x + sx * (w / 2 - 0.06) + 0.02, y, y + h - 0.035, z + sz * (d / 2 - 0.06) - 0.02, z + sz * (d / 2 - 0.06) + 0.02)
    legs.box(x - w / 2 + 0.04, x + w / 2 - 0.04, y + h - 0.09, y + h - 0.035, z - d / 2 + 0.05, z - d / 2 + 0.07); legs.box(x - w / 2 + 0.04, x + w / 2 - 0.04, y + h - 0.09, y + h - 0.035, z + d / 2 - 0.07, z + d / 2 - 0.05)


def plant(cm, x, z, s=1.0, y=None):
    """盆栽：Poly Haven potted_plant_02（CC0 掃描模型；原本白色方盆＋一叢橢球葉子）。高度照原本的 1.25 m × s"""
    y = Y0 if y is None else y; r = random.Random(int(x * 100 + z * 7))
    K.ph_put('potted_plant_02', x, y, z, r.uniform(0, 6.28), s, height=1.2, decimate=0.04); return
    cm.crbox(x - 0.25 * s, x + 0.25 * s, y, y + 0.5 * s, z - 0.25 * s, z + 0.25 * s, '#e8e6e0', r=0.02)
    cm.cbox(x - 0.22 * s, x + 0.22 * s, y + 0.48 * s, y + 0.5 * s, z - 0.22 * s, z + 0.22 * s, '#4a3a2a')
    n0 = set(cm.bm.faces)
    for k in range(26):
        a = r.uniform(0, 2 * math.pi); rr = r.uniform(0.0, 0.32) * s; hy = y + 0.5 * s + r.uniform(0.1, 0.75) * s
        cm.ell((x + math.cos(a) * rr, hy, z + math.sin(a) * rr), 0.14 * s, 0.05 * s, 0.07 * s, seg=6, rings=3,
               matrix=Matrix.Rotation(a, 4, 'Z') @ Matrix.Rotation(r.uniform(-0.6, 0.6), 4, 'X'))
    fs = [f for f in cm.bm.faces if f not in n0]
    for i, f in enumerate(fs): cm.paint([f], ['#3f7a3a', '#4d8a42', '#356b33'][i % 3])


def stairs():
    """靠東牆的直跑樓梯（一樓 GLB）：21 階、踏面 0.28、每階 0.1714；z 0.9～4.0 底下是實心、z −1.6～0.9 底下是儲藏室"""
    n, rise, tread = ST['n'], ST['rise'], ST['tread']; sx0, sx1 = SH['x0'] + 0.05, X1
    tr = CMesh('STAIR_TREADS', m_vc); body = Mesh('STAIR_BODY', m_wall)
    for i in range(n - 1):
        za, zb = ST['zb'] - (i + 1) * tread, ST['zb'] - i * tread; yt = (i + 1) * rise
        tr.crbox(sx0, sx1, yt - 0.03, yt, za, zb + 0.02, '#d6c6ac', r=0.006)
        tr.cbox(sx0 + 0.05, sx1 - 0.05, yt - 0.004, yt + 0.003, zb - 0.05, zb - 0.01, '#3c3e42')   # 防滑條
        body.box(sx0, sx1, (0.0 if za >= 0.9 - 1e-6 else yt - 0.4), yt - 0.03, za, zb)
        if za < 0.9 - 1e-6: body.box(SH['x0'], SH['x0'] + 0.1, 0.0, yt - 0.4, za, zb)   # 樓梯下儲藏室 x 4.55 那一面的牆（跟著斜度）
        tr.cbox(sx0, sx1, yt - rise, yt - 0.03, zb, zb + 0.015, '#e8d8be')   # 踢面
    tr.cbox(sx0, sx1, ST['ya'] - rise, ST['ya'], ST['za'] - 0.015, ST['za'], '#e6e3dc')
    # 樓梯下的儲藏室：x 4.55 那一面的牆＋門
    us = F['underStair']
    tr.crbox(us['x0'] - 0.02, us['x0'], 0.0, 2.05, -1.2, -0.3, '#8a8f96', r=0.01); tr.cbox(us['x0'] - 0.04, us['x0'] - 0.02, 1.0, 1.04, -0.42, -0.34, '#c0c4c8')
    tr.finish(root); body.finish(root)
    # 內側：玻璃欄杆＋木扶手（跟著斜度）；東牆上的扶手、踏階燈
    gl = Mesh('STAIR_glass', m_glass); hr = Mesh('STAIR_HANDRAIL', m_lam); po = Mesh('STAIR_POSTS', m_steel); lt = Mesh('STAIR_STEPLIGHTS', m_warm)
    xg = SH['x0'] + 0.04
    yA, yB = lambda z: (ST['zb'] - z) / (ST['zb'] - ST['za']) * ST['ya'], None
    zs = [ST['zb'] - 0.1] + [ST['zb'] - k * 0.9 for k in range(1, 7)] + [ST['za'] + 0.05]
    for za, zb in zip(zs[1:], zs):
        ya, yb = yA(za), yA(zb)
        gl.quad([(xg, yb + 0.12, zb), (xg, ya + 0.12, za), (xg, ya + 0.95, za), (xg, yb + 0.95, zb)])
        po.box(xg - 0.02, xg + 0.02, yb, yb + 0.98, zb - 0.02, zb + 0.02)
    zh = [ST['zb'] - k * 0.4 for k in range(15)] + [ST['za']]
    for za, zb in zip(zh[1:], zh): hr.cyl((xg, yA(zb) + 1.0, zb), (xg, yA(za) + 1.0, za), 0.03, seg=10); hr.cyl((X1 - 0.07, yA(zb) + 0.9, zb), (X1 - 0.07, yA(za) + 0.9, za), 0.025, seg=10)
    for k in range(0, n - 1, 3):
        z = ST['zb'] - (k + 0.5) * tread; y = (k + 1) * rise + 0.25
        lt.box(X1 - 0.012, X1, y, y + 0.06, z - 0.06, z + 0.06)
    gl.finish(root, props={'glass': 1}); hr.finish(root, smooth=True); po.finish(root); lt.finish(root)


def outside_cards():
    """v2：窗外夜景卡片（發光，正式 GLB 也有；LAWWW2 接上新生南路以後可以藏起來或刪掉：物件名 NIGHT_FRONT、NIGHT_WEST）"""
    yb = Y0 - (1.5 if FL == 1 else 5.0); yt = Y0 + (6.0 if FL == 1 else 4.6)   # 二樓往下看得到馬路：卡片往下延伸
    nf = Mesh('NIGHT_FRONT', m_screens); gz(nf, Z1 + 8.0, X0 - 14.0, X1 + 14.0, yb - 2.0, yt + 3.0, -1, GR['night_front']); nf.finish(root, uv=False)   # v2：放遠一點（對面的人行道、校園）
    nw = Mesh('NIGHT_WEST', m_screens); gx(nw, X0 - 8.0, Z0 - 14.0, Z1 + 14.0, yb - 2.0, yt + 3.0, +1, GR['night_west']); nw.finish(root, uv=False)


props = CMesh('PROPS', m_vc); legs = Mesh('LEGS', m_black); tops = Mesh('TOPS', m_lam, tile=1.4)
SEAT_COLS = ['#b8743e', '#2f3d63']

# ======================================================== 一樓 ========================================================
if FL == 1:
    floor_slab(); ceiling(); stairs(); outside_cards()
    glass_wall('front', X0, X1, 0.0, 3.2, door=F['front']['door'])
    wg = F['westGlass']; glass_wall('left', wg['z0'], wg['z1'], 0.0, 3.2, solid_runs=[(X0 - T, X0, 0.0, 3.2, Z0, wg['z0'])])
    solid_wall('right'); solid_wall('back')
    # v2：外觀圖看得到的牆面色帶（深藍護牆＋一條橘色）：西牆實心那一段、東牆
    band = CMesh('WALL_BANDS', m_vc)
    for (a, b) in ((Z0 + 3.6, wg['z0']),): band.cbox(X0, X0 + 0.012, 0.0, 0.95, a, b, '#24345f'); band.cbox(X0, X0 + 0.014, 0.95, 1.08, a, b, '#e8782a')
    band.cbox(X1 - 0.012, X1, 0.0, 0.95, 4.2, Z1, '#24345f'); band.cbox(X1 - 0.014, X1, 0.95, 1.08, 4.2, Z1, '#e8782a')
    band.finish(root)
    # 廚房後牆（白色長磁磚）＋設備
    kt = L.flat('dk_kitchen_tile', '#eedcc0', rough=0.25)   # v2：純色（材質 ≤ 12；從店外看只是櫃檯後面一片白牆）
    kc = F['kitchen']; Mesh('KITCHEN_TILES', kt).box(kc['x0'], kc['x1'], 0.0, 2.4, Z0, Z0 + 0.02).box(X0, X0 + 0.02, 0.0, 2.4, Z0, kc['z1']).finish(root)
    st = Mesh('KITCHEN_STEEL', m_steel); kp = CMesh('KITCHEN_PROPS', m_vc)
    st.box(kc['x0'] + 0.1, kc['x1'] - 0.1, 0.0, 0.9, Z0 + 0.05, Z0 + 0.8)                        # 後面一排料理台
    st.box(kc['x0'] + 0.1, kc['x1'] - 0.1, 2.05, 2.1, Z0 + 0.05, Z0 + 0.45); st.box(kc['x0'] + 0.1, kc['x1'] - 0.1, 1.55, 1.58, Z0 + 0.05, Z0 + 0.35)   # 層架
    st.box(-3.6, 0.6, 2.5, 3.4, Z0 + 0.05, Z0 + 1.1)                                             # 排油煙罩
    for i, x in enumerate((-5.2, -4.5, -3.8)):                                                    # 炸鍋＋籃子
        kp.cbox(x - 0.3, x + 0.3, 0.9, 0.92, Z0 + 0.2, Z0 + 0.75, '#2a2a2a'); kp.cbox(x - 0.22, x + 0.22, 0.92, 1.0, Z0 + 0.3, Z0 + 0.6, '#d7a23e')
        st.cyl((x, 1.0, Z0 + 0.62), (x, 1.12, Z0 + 0.9), 0.012, seg=6)
    kp.cbox(-3.1, -1.1, 0.9, 0.95, Z0 + 0.15, Z0 + 0.78, '#3a3a3c')                              # 煎台
    for k in range(6): kp.cbox(-3.0 + k * 0.32, -2.8 + k * 0.32, 0.95, 0.97, Z0 + 0.3, Z0 + 0.5, '#6a3e26')   # 牛肉片
    kp.crbox(1.0, 1.7, 0.9, 1.7, Z0 + 0.1, Z0 + 0.7, '#d8dadc', r=0.02); kp.cbox(1.1, 1.6, 1.3, 1.6, Z0 + 0.7, Z0 + 0.71, '#30343a')   # 冰淇淋機
    kp.crbox(2.0, 3.2, 0.0, 2.0, Z0 + 0.05, Z0 + 0.8, '#c8ccd0', r=0.02)                         # 冰箱
    for k in range(14): kp.cbox(kc['x0'] + 0.3 + k * 0.62, kc['x0'] + 0.62 + k * 0.62, 1.58, 1.8, Z0 + 0.1, Z0 + 0.32, ['#e8d9b8', '#c84030', '#f0f0ec', '#d8a030'][k % 4])   # 層架上的紙盒、杯子
    # 出餐保溫檯（櫃檯後面）
    ct = F['counter']
    st.box(-3.6, 1.2, 1.25, 1.28, ct['z0'] - 0.55, ct['z0'] - 0.1); st.box(-3.6, 1.2, 1.75, 1.78, ct['z0'] - 0.55, ct['z0'] - 0.1)
    for x in (-3.6, 1.2): st.box(x - 0.02, x + 0.02, 1.0, 1.78, ct['z0'] - 0.35, ct['z0'] - 0.31)
    Mesh('HEATLAMP', m_warm).box(-3.5, 1.1, 1.73, 1.75, ct['z0'] - 0.5, ct['z0'] - 0.15).finish(root)
    for k in range(12): kp.crbox(-3.4 + k * 0.38, -3.1 + k * 0.38, 1.28, 1.36, ct['z0'] - 0.45, ct['z0'] - 0.2, ['#f2e6cc', '#e8782a', '#f2e6cc', '#24345f'][k % 4], r=0.01)   # 包好的漢堡
    st.box(kc['x0'] + 0.1, ct['x0'] + 0.0, 0.0, 1.0, ct['z0'] - 0.75, ct['z0'] - 0.1)            # 櫃檯後面左邊的飲料機檯
    kp.crbox(-5.6, -5.0, 1.0, 1.75, ct['z0'] - 0.7, ct['z0'] - 0.2, '#30343a', r=0.02); kp.cbox(-5.55, -5.05, 1.55, 1.7, ct['z0'] - 0.2, ct['z0'] - 0.19, '#c84030')
    for k in range(4): kp.cbox(-5.5 + k * 0.12, -5.44 + k * 0.12, 1.12, 1.2, ct['z0'] - 0.21, ct['z0'] - 0.18, '#d8d8d8')
    for k in range(6): kp.add_bm(L.lathe([(0.0, 0.0), (0.04, 0.0), (0.05, 0.14), (0.0, 0.14)], seg=10), Matrix.Translation(g2b(-4.9 + k * 0.11, 1.0, ct['z0'] - 0.5)))
    st.finish(root); kp.finish(root, smooth=True)
    # 員工通道的牆＋門
    sf = F['staff']; sw = Mesh('STAFF_WALL', m_wall); sw.box(sf['x0'], sf['x0'] + 0.1, 0.0, YC, Z0, sf['z1'] - 0.1); sw.box(sf['x0'], sf['x1'], 0.0, YC, sf['z1'] - 0.1, sf['z1']); sw.box(sf['x1'] - 0.1, sf['x1'], 0.0, YC, sf['z1'], ST['za']); sw.finish(root)
    # （員工通道後面 x 4.55～6、z −8～−1.6 整塊關著：倉庫、廁所，這一版不做室內）
    props.crbox(3.55, 4.4, 0.0, 2.1, sf['z1'] + 0.0, sf['z1'] + 0.03, '#d8d4cc', r=0.01); props.cbox(4.25, 4.3, 0.95, 1.05, sf['z1'] + 0.03, sf['z1'] + 0.07, '#9a9c9e')
    zcard('STAFF_SIGN', sf['z1'] + 0.035, 3.7, 4.25, 1.6, 1.78, IM['staff'], +1)
    # 點餐櫃檯：檯面、正面貼圖、收銀機、取餐區
    Mesh('COUNTER_TOP', L.flat('dk_quartz', '#f2e4cc', rough=0.25)).rbox(ct['x0'], ct['x1'], ct['h'] - 0.04, ct['h'], ct['z0'], ct['z1'] + 0.04, r=0.01, seg=2).finish(root)
    Mesh('COUNTER_BODY', m_wall).box(ct['x0'], ct['x1'] - 0.02, 0.0, ct['h'] - 0.04, ct['z0'], ct['z1'] - 0.02).box(ct['x1'] - 0.02, ct['x1'], 0.0, ct['h'] - 0.04, ct['z0'], ct['z1']).finish(root)
    zcard('COUNTER_FACE', ct['z1'] + 0.001 - 0.02, ct['x0'], ct['x1'], 0.0, ct['h'] - 0.04, IM['counter'], +1)
    for x in (-2.6, 0.2):
        props.crbox(x - 0.18, x + 0.18, ct['h'], ct['h'] + 0.06, ct['z0'] + 0.2, ct['z0'] + 0.5, '#2a2c30', r=0.01)
        props.crbox(x - 0.16, x + 0.16, ct['h'] + 0.06, ct['h'] + 0.34, ct['z0'] + 0.3, ct['z0'] + 0.36, '#1c1e22', r=0.01)
    for k in range(5): props.crbox(2.2 + k * 0.0, 2.65, ct['h'] + k * 0.012, ct['h'] + k * 0.012 + 0.01, ct['z0'] + 0.25, ct['z0'] + 0.6, '#c84030', r=0.003)   # 餐盤一疊
    for k in range(3): props.crbox(1.75 + k * 0.14, 1.87 + k * 0.14, ct['h'], ct['h'] + 0.28, ct['z0'] + 0.3, ct['z0'] + 0.42, '#d8b88a', r=0.01)   # 紙袋
    for (a, b, k) in ((-5.4, -4.3, 'sign_order'), (1.75, 2.95, 'sign_pick')):   # 「點餐」「取餐」橘色牌（外觀圖：在菜單螢幕的左右兩邊）
        zcard(k.upper(), -4.498, a, b, 2.38, 2.86, IM[k], +1); props.cbox(a, b, 2.36, 2.88, -4.53, -4.5, '#e8782a')
        for x in (a + 0.1, b - 0.1): legs.box(x - 0.006, x + 0.006, 2.88, YC, -4.52, -4.51)
    ms = F['menuScreens']
    for i, x in enumerate(ms['xs']):
        props.crbox(x - 0.58, x + 0.58, ms['y0'] - 0.03, ms['y1'] + 0.03, ms['z'] - 0.06, ms['z'], '#16181c', r=0.01); legs.box(x - 0.01, x + 0.01, ms['y1'] + 0.03, YC, ms['z'] - 0.04, ms['z'] - 0.02)
        gz(SCR, ms['z'] + 0.002, x - 0.55, x + 0.55, ms['y0'], ms['y1'], +1, GR[f'menu{i}'])   # v2：菜單螢幕發光
    pend = Mesh('COUNTER_PENDANTS', L.flat('dk_orange', '#e07a30', rough=0.4)); pl = Mesh('COUNTER_PENDANT_GLOW', m_warm)
    for lt in F['lights']:
        if lt['kind'] == 'pendant_counter':
            x, z = lt['x'], lt['z']; legs.cyl((x, lt['y'] + 0.2, z), (x, YC, z), 0.006, seg=6)
            pend.add_bm(L.lathe([(0.0, 0.25), (0.06, 0.24), (0.2, 0.08), (0.22, 0.0), (0.205, 0.0), (0.185, 0.07), (0.05, 0.22), (0.0, 0.23)], seg=24), Matrix.Translation(g2b(x, lt['y'] - 0.05, z)))
            down_quad(pl, x - 0.12, x + 0.12, z - 0.12, z + 0.12, lt['y'])
    pend.finish(root, smooth=True); pl.finish(root)
    # 自助點餐機
    for k in F['kiosks']:
        x, z = k['x'], k['z']
        props.crbox(x - 0.22, x + 0.22, 0.0, 0.05, z - 0.18, z + 0.18, '#2a2c30', r=0.01); props.crbox(x - 0.06, x + 0.06, 0.05, 0.9, z - 0.06, z + 0.06, '#e8e8e6', r=0.02)
        props.crbox(x - 0.25, x + 0.25, 0.9, 1.85, z - 0.05, z + 0.03, '#f2e6d0', r=0.02); props.cbox(x - 0.25, x + 0.25, 1.85, 1.95, z - 0.05, z + 0.03, '#24345f')
        gz(SCR, z + 0.032, x - 0.21, x + 0.21, 0.98, 1.78, +1, GR['kiosk'])   # v2：點餐機螢幕發光
    # 回收餐盤
    tr_ = F['tray']; props.crbox(tr_['x'] - 0.45, tr_['x'] + 0.45, 0.0, 1.0, tr_['z'] - 0.25, tr_['z'] + 0.25, '#24345f', r=0.02)
    props.cbox(tr_['x'] - 0.4, tr_['x'] - 0.05, 0.75, 0.9, tr_['z'] + 0.249, tr_['z'] + 0.252, '#1a1a1a'); props.cbox(tr_['x'] + 0.05, tr_['x'] + 0.4, 0.75, 0.9, tr_['z'] + 0.249, tr_['z'] + 0.252, '#1a1a1a')
    for k in range(4): props.cbox(tr_['x'] - 0.35, tr_['x'] + 0.35, 1.0 + k * 0.015, 1.01 + k * 0.015, tr_['z'] - 0.2, tr_['z'] + 0.2, '#c84030')
    # 窗邊高腳吧台
    wb = F['westBar']; tops.rbox(wb['x0'], wb['x1'], wb['h'] - 0.04, wb['h'], wb['z0'], wb['z1'], r=0.008, seg=2)
    for z in (wb['z0'] + 0.1, (wb['z0'] + wb['z1']) / 2, wb['z1'] - 0.1): legs.box(wb['x0'] + 0.05, wb['x0'] + 0.1, 0.0, wb['h'] - 0.04, z - 0.03, z + 0.03)
    for i, z in enumerate(F['westStools']): newpaint(props, lambda: stool(props, legs, -5.2, z, None), SEAT_COLS[i % 2])
    for i, t in enumerate(F['tables2']):
        table(tops, legs, t['x'], t['z'], 0.7, 0.7); chair(props, legs, t['x'], t['z'] - 0.55, 0, SEAT_COLS[i % 2]); chair(props, legs, t['x'], t['z'] + 0.55, math.pi, SEAT_COLS[(i + 1) % 2])
    # v2b：樓梯前、靠正面窗的座位區（外觀圖右邊那一段）：兩張雙人桌（椅子在東西兩邊，深藍布面＋木頭）、三盞白色吊燈
    for i, t in enumerate(F['frontTables2']):
        table(tops, legs, t['x'], t['z'], 0.7, 0.7); chair(props, legs, t['x'] - 0.55, t['z'], math.pi / 2, SEAT_COLS[(i + 1) % 2]); chair(props, legs, t['x'] + 0.55, t['z'], -math.pi / 2, SEAT_COLS[i % 2])
    sp = Mesh('SEAT_PENDANTS', m_panel);   # 白色燈罩，亮著（外觀圖的三盞吊燈）
    spl = Mesh('SEAT_PENDANT_GLOW', m_warm)
    for (x, z) in F['seatPendants']:
        y = 2.45; legs.cyl((x, y + 0.3, z), (x, YC, z), 0.006, seg=6)
        sp.add_bm(L.lathe([(0.0, 0.32), (0.03, 0.31), (0.05, 0.22), (0.2, 0.03), (0.21, 0.0), (0.195, 0.0), (0.185, 0.03), (0.04, 0.21), (0.0, 0.22)], seg=24), Matrix.Translation(g2b(x, y, z)))
        down_quad(spl, x - 0.14, x + 0.14, z - 0.14, z + 0.14, y + 0.03)
    sp.finish(root, smooth=True); spl.finish(root)
    # 牆上的海報（後牆、員工通道左邊）、門邊的垃圾桶、盆栽
    # v2b：漢堡飲料海報（外觀圖右邊）：掛在座位區靠窗的地方、面向新生南路（兩面都印）；東牆從街上看是斜的，看不到
    pz = Z1 - 0.35; zcard('POSTER_1F', pz + 0.006, 4.85, 5.75, 1.25, 2.5, IM['poster1'], +1); zcard('POSTER_1F_back', pz - 0.006, 4.85, 5.75, 1.25, 2.5, IM['poster1'], -1)
    props.cbox(4.82, 5.78, 1.22, 2.53, pz - 0.005, pz + 0.005, '#24345f')
    for x in (4.95, 5.65): legs.box(x - 0.004, x + 0.004, 2.53, YC, pz - 0.004, pz + 0.004)
    props.crbox(-3.1, -2.6, 0.0, 1.0, 7.5, 7.95, '#24345f', r=0.02); props.cbox(-3.05, -2.65, 0.8, 0.92, 7.49, 7.5, '#111111')
    plant(props, -5.6, 7.5); plant(props, 5.5, 7.1, s=0.9)   # v2b：讓出海報
    # 桌上的東西（深夜也有人在讀書：可樂、紙袋、課本）
    r = random.Random(41)
    for t in F['tables2'][:2] + F['frontTables2']:
        newpaint(props, lambda: props.add_bm(L.lathe([(0.0, 0.0), (0.04, 0.0), (0.045, 0.14), (0.0, 0.14)], seg=10), Matrix.Translation(g2b(t['x'] + 0.12, 0.75, t['z'] - 0.1))), '#f4f4f2')
    for t in F['frontTables2']:   # v2b：座位區桌上的餐盤＋漢堡紙＋薯條
        props.crbox(t['x'] - 0.2, t['x'] + 0.1, 0.75, 0.765, t['z'] - 0.05, t['z'] + 0.2, '#c84030', r=0.004); props.crbox(t['x'] - 0.12, t['x'] + 0.0, 0.765, 0.82, t['z'] + 0.02, t['z'] + 0.14, '#f2e6cc', r=0.02)
        props.cbox(t['x'] - 0.17, t['x'] - 0.13, 0.765, 0.88, t['z'] + 0.0, t['z'] + 0.05, '#d83a2e')
    props.crbox(-3.45, -3.1, 0.75, 0.79, -0.75, -0.5, '#3a5a8a', r=0.005); props.crbox(-3.4, -3.12, 0.79, 0.82, -0.72, -0.52, '#a03a34', r=0.005)
    props.crbox(-3.5, -3.2, 0.75, 1.0, 1.75, 1.92, '#d8b88a', r=0.01)

# ======================================================== 二樓 ========================================================
else:
    floor_slab(); ceiling(); outside_cards()
    glass_wall('front', X0, X1, Y0 + 0.0, Y0 + 3.35)
    glass_wall('left', Z0, Z1, Y0 + 0.0, Y0 + 3.35)
    solid_wall('right'); solid_wall('back')
    # 樓梯口：玻璃欄杆＋木扶手
    gl = Mesh('RAIL_glass', m_glass); hr = Mesh('RAIL_HANDRAIL', m_lam); po = Mesh('RAIL_POSTS', m_steel)
    xg = SH['x0'] + 0.02
    gl.box(xg - 0.008, xg + 0.008, Y0 + 0.08, Y0 + 1.0, SH['z0'], SH['z1']); gl.box(SH['x0'], X1, Y0 + 0.08, Y0 + 1.0, SH['z1'] - 0.008, SH['z1'] + 0.008)
    hr.rbox(xg - 0.035, xg + 0.035, Y0 + 1.0, Y0 + 1.06, SH['z0'], SH['z1'] + 0.035, r=0.02, seg=3); hr.rbox(SH['x0'], X1, Y0 + 1.0, Y0 + 1.06, SH['z1'] - 0.035, SH['z1'] + 0.035, r=0.02, seg=3)
    for z in [SH['z0'] + k * (SH['z1'] - SH['z0']) / 4 for k in range(5)]: po.box(xg - 0.02, xg + 0.02, Y0, Y0 + 1.0, z - 0.02, z + 0.02)
    po.box(X1 - 0.05, X1 - 0.01, Y0, Y0 + 1.0, SH['z1'] - 0.02, SH['z1'] + 0.02)
    e = Mesh('RAIL_EDGE', m_steel); e.box(SH['x0'] - 0.03, SH['x0'], Y0 - 0.2, Y0 + 0.08, SH['z0'], SH['z1']); e.box(SH['x0'], X1, Y0 - 0.2, Y0 + 0.08, SH['z1'], SH['z1'] + 0.03); e.finish(root)
    gl.finish(root, props={'glass': 1}); hr.finish(root, smooth=True); po.finish(root)
    # 東牆、後牆：靠牆插座吧台（暖光燈條、一格一格的插座）
    wl = Mesh('BAR_STRIP', m_warm); wbars = [F['eastBar'], F['backBar']]
    eb, bb = F['eastBar'], F['backBar']
    tops.rbox(eb['x0'], eb['x1'], eb['h'] - 0.04, eb['h'], eb['z0'], eb['z1'], r=0.008, seg=2); tops.rbox(bb['x0'], bb['x1'], bb['h'] - 0.04, bb['h'], bb['z0'], bb['z1'], r=0.008, seg=2)
    for z in (eb['z0'] + 0.3, (eb['z0'] + eb['z1']) / 2, eb['z1'] - 0.3): legs.box(eb['x0'] + 0.05, eb['x0'] + 0.09, Y0, eb['h'] - 0.04, z - 0.02, z + 0.02)
    for x in [bb['x0'] + 0.3 + k * 2.3 for k in range(5)]: legs.box(x - 0.02, x + 0.02, Y0, bb['h'] - 0.04, bb['z1'] - 0.09, bb['z1'] - 0.05)
    props.cbox(X1 - 0.12, X1, Y0 + 1.25, Y0 + 1.29, eb['z0'], eb['z1'], '#d7b78a'); wl.box(X1 - 0.11, X1 - 0.02, Y0 + 1.23, Y0 + 1.25, eb['z0'] + 0.05, eb['z1'] - 0.05)   # 吧台上方的木條＋暖光燈條
    props.cbox(bb['x0'], bb['x1'], Y0 + 1.25, Y0 + 1.29, Z0, Z0 + 0.12, '#d7b78a'); wl.box(bb['x0'] + 0.05, bb['x1'] - 0.05, Y0 + 1.23, Y0 + 1.25, Z0 + 0.02, Z0 + 0.11)
    for z in [eb['z0'] + 0.25 + k * 0.9 for k in range(int((eb['z1'] - eb['z0']) / 0.9))]:   # 插座
        props.crbox(X1 - 0.012, X1, Y0 + 0.92, Y0 + 1.02, z - 0.06, z + 0.06, '#f6f6f4', r=0.004)
        for dz in (-0.025, 0.025): props.cbox(X1 - 0.014, X1 - 0.012, Y0 + 0.96, Y0 + 0.98, z + dz - 0.006, z + dz + 0.006, '#3a3a3a')
    for x in [bb['x0'] + 0.3 + k * 0.95 for k in range(int((bb['x1'] - bb['x0']) / 0.95))]:
        props.crbox(x - 0.06, x + 0.06, Y0 + 0.92, Y0 + 1.02, Z0, Z0 + 0.012, '#f6f6f4', r=0.004)
        for dx in (-0.025, 0.025): props.cbox(x + dx - 0.006, x + dx + 0.006, Y0 + 0.96, Y0 + 0.98, Z0 + 0.012, Z0 + 0.014, '#3a3a3a')
    wl.finish(root)
    for i, z in enumerate(F['eastStools']): chair(props, legs, 5.05, z, math.pi / 2, SEAT_COLS[1 - i % 2])
    for i, x in enumerate(F['backStools']): chair(props, legs, x, -7.05, math.pi, SEAT_COLS[1 - i % 2])
    # 東牆的大牆面、樓梯口的直幅、書架
    mu = F['mural']; wall_card('MURAL', X1 - 0.01, mu['z0'], mu['z1'], mu['y0'], mu['y1'], IM['mural'], -1)
    sg = F['signStudy']; wall_card('SIGN_STUDY', X1 - 0.01, sg['z0'], sg['z1'], sg['y0'], sg['y1'], IM['study'], -1)
    zcard('POSTER_2F', Z0 + 0.012, -3.4, -2.5, Y0 + 1.55, Y0 + 2.75, IM['poster'], +1)                      # v2：後牆的小海報（參考圖第 12 項）
    wall_card('STAIRWELL_LOGO', X1 - 0.012, 0.6, 2.6, Y0 - 1.9, Y0 - 0.25, IM['study_logo'], -1)            # v2：樓梯間牆上的標誌（從二樓樓梯口往下看得到，參考圖第 3 項）
    bk = F['bookcase']; shelf = Mesh('BOOKCASE', m_lam); shelf.box(bk['x0'], bk['x1'], Y0, Y0 + bk['h'], Z0, Z0 + 0.03)
    for x in (bk['x0'], bk['x1'] - 0.03): shelf.box(x, x + 0.03, Y0, Y0 + bk['h'], Z0, bk['z1'])
    for k in range(5): shelf.box(bk['x0'], bk['x1'], Y0 + k * bk['h'] / 4.6, Y0 + k * bk['h'] / 4.6 + 0.03, Z0, bk['z1'])
    shelf.finish(root); r = random.Random(77)
    for k in range(4):
        x = bk['x0'] + 0.05
        while x < bk['x1'] - 0.1:
            w_ = r.uniform(0.03, 0.06); hh = r.uniform(0.2, 0.34); y = Y0 + k * bk['h'] / 4.6 + 0.03
            props.cbox(x, x + w_, y, y + hh, Z0 + 0.05, Z0 + r.uniform(0.22, 0.3), r.choice(['#24345f', '#a03a34', '#3a6a5a', '#d8c8a0', '#e8782a', '#5a4a7a']))
            x += w_ + 0.004
    plant(props, (bk['x0'] + bk['x1']) / 2, Z0 + 0.2, s=0.7, y=Y0 + bk['h'])
    # 長桌、四人桌、窗邊雙人桌
    for i, t in enumerate(F['longTables']):
        table(tops, legs, t['x'], t['z'], F['longW'], F['longD'])
        for j, dx in enumerate((-1.0, 0.0, 1.0)):
            chair(props, legs, t['x'] + dx, t['z'] - 0.75, 0, SEAT_COLS[(i + j) % 2]); chair(props, legs, t['x'] + dx, t['z'] + 0.75, math.pi, SEAT_COLS[(i + j + 1) % 2])
    for i, t in enumerate(F['tables4']):
        table(tops, legs, t['x'], t['z'], 1.2, 0.8)
        for j, dx in enumerate((-0.3, 0.3)): chair(props, legs, t['x'] + dx, t['z'] - 0.6, 0, SEAT_COLS[(i + j) % 2]); chair(props, legs, t['x'] + dx, t['z'] + 0.6, math.pi, SEAT_COLS[(i + j) % 2])
    for i, z in enumerate(F['westTables2']):
        table(tops, legs, -5.1, z, 0.7, 0.7); chair(props, legs, -5.1, z - 0.55, 0, SEAT_COLS[i % 2]); chair(props, legs, -5.1, z + 0.55, math.pi, SEAT_COLS[(i + 1) % 2])
    for i, x in enumerate(F['frontTables2']):
        table(tops, legs, x, 7.1, 0.7, 0.7); chair(props, legs, x - 0.55, 7.1, math.pi / 2, SEAT_COLS[i % 2]); chair(props, legs, x + 0.55, 7.1, -math.pi / 2, SEAT_COLS[(i + 1) % 2])
    for (x, z) in F['plants']:
        if x < -5.0 and z < -7.0: continue   # 書架上那一盆已經放了
        plant(props, x, z)
    # 橘色半圓吊燈
    pend = Mesh('PENDANTS', L.flat('dk_orange', '#e07a30', rough=0.4)); pl = Mesh('PENDANT_GLOW', m_warm)
    for (x, z) in F['pendants']:
        y = Y0 + 2.85; legs.cyl((x, y + 0.25, z), (x, YC, z), 0.006, seg=6)
        pend.add_bm(L.lathe([(0.0, 0.25), (0.06, 0.24), (0.26, 0.08), (0.29, 0.0), (0.27, 0.0), (0.245, 0.07), (0.05, 0.22), (0.0, 0.23)], seg=28), Matrix.Translation(g2b(x, y, z)))
        down_quad(pl, x - 0.15, x + 0.15, z - 0.15, z + 0.15, y + 0.04)
    pend.finish(root, smooth=True); pl.finish(root)
    # v2：每張桌子都有東西（參考圖：筆電、課本、筆記本、筆袋、飲料杯、紙袋、背包；外套掛在椅背）——重複的小東西用 instancing（同一個網格放很多個）
    PROTO = {}

    def proto(name, build, mat=None):
        m = CMesh(f'P_{name}', mat or m_vc) if mat is None else Mesh(f'P_{name}', mat)
        build(m); ob = m.finish(root, uv=(mat is None), smooth=True) if mat is None else m.finish(root, uv=False)
        me = ob.data; bpy.data.objects.remove(ob); PROTO[name] = me

    def put(name, x, y, z, yaw):
        ob = bpy.data.objects.new(f'I_{name}_{len(bpy.data.objects)}', PROTO[name]); B.scene().collection.objects.link(ob); ob.parent = root
        ob.matrix_world = Matrix.Translation(g2b(x, y, z)) @ Matrix.Rotation(yaw, 4, 'Z')

    # 本地座標：+z＝朝向坐的人；y 0＝桌面
    def b_laptop(col):
        def f(m):
            m.crbox(-0.16, 0.16, 0.0, 0.016, -0.11, 0.11, col, r=0.006, seg=1)                   # 底座
            m.cbox(-0.13, 0.13, 0.016, 0.018, -0.02, 0.08, '#2a2c30')                               # 鍵盤
            m.crbox(-0.16, 0.16, 0.016, 0.235, -0.125, -0.11, col, r=0.006, seg=1)               # 螢幕的殼（立著）
        return f
    proto('laptop_s', b_laptop('#b8bcc0')); proto('laptop_d', b_laptop('#3c3e44'))
    for k in range(6):
        proto(f'screen{k}', lambda m, k=k: gquad(m, [(-0.145, 0.03, -0.108), (0.145, 0.03, -0.108), (0.145, 0.225, -0.108), (-0.145, 0.225, -0.108)], GR[f'laptop{k}']), m_screens)
    BK = [('#24345f', 0), ('#8c2422', 1), ('#203060', 2), ('#285a46', 3), ('#6e4628', 4)]
    def b_books(idx):
        def f(m):
            y = 0.0
            for (bi, th) in idx:
                col = BK[bi][0]; m.crbox(-0.12, 0.12, y, y + th, -0.165, 0.165, col, r=0.004, seg=1)
                m.cbox(-0.115, 0.115, y + 0.004, y + th - 0.004, -0.17, -0.165, '#efe8d8')             # 書頁那一側
                y += th
        return f
    def b_titles(idx):
        def f(m):
            y = 0.0
            for (bi, th) in idx: y += th
            bi = idx[-1][0]; u0, v0, u1, v1 = 0, 0, 1, 1
            r_ = (bi / 5, 0.0, (bi + 1) / 5, 1.0)
            uvl = m.bm.loops.layers.uv.verify(); f_ = m.bm.faces.new([m.bm.verts.new(g2b(*p_)) for p_ in ((-0.11, y + 0.001, 0.155), (0.11, y + 0.001, 0.155), (0.11, y + 0.001, -0.155), (-0.11, y + 0.001, -0.155))])
            for lp, uv in zip(f_.loops, ((r_[0], 0.05), (r_[2], 0.05), (r_[2], 0.95), (r_[0], 0.95))): lp[uvl].uv = (uv[0], uv[1])
            y = 0.0   # 書背（朝坐的人）也貼書名
            for (bi, th) in idx:
                f2 = m.bm.faces.new([m.bm.verts.new(g2b(*p_)) for p_ in ((-0.12, y + 0.003, 0.1655), (0.12, y + 0.003, 0.1655), (0.12, y + th - 0.003, 0.1655), (-0.12, y + th - 0.003, 0.1655))])
                for lp, uv in zip(f2.loops, ((bi / 5, 0.3), ((bi + 1) / 5, 0.3), ((bi + 1) / 5, 0.7), (bi / 5, 0.7))): lp[uvl].uv = uv
                y += th
        return f
    STACKS = [[(1, 0.045), (0, 0.05)], [(2, 0.04)], [(4, 0.035), (3, 0.04), (1, 0.045)], [(0, 0.05)]]   # 刑法＋民法（總則）、憲法、法學緒論＋行政法＋刑法、民法（總則）
    for k, st_ in enumerate(STACKS): proto(f'books{k}', b_books(st_)); proto(f'titles{k}', b_titles(st_), IM['books'])
    def b_cup(m):
        m.paint(clathe_(m, [(0.0, 0.0), (0.04, 0.0), (0.048, 0.16), (0.0, 0.16)]), '#f4f4f2')
        m.paint(clathe_(m, [(0.0, 0.0), (0.05, 0.0), (0.05, 0.012), (0.0, 0.014)], y=0.16), '#24345f')
        m.paint(clathe_(m, [(0.044, 0.0), (0.0465, 0.0), (0.0472, 0.04), (0.0446, 0.04)], y=0.07), '#e8782a')
        m.cbox(-0.004, 0.004, 0.17, 0.27, -0.004, 0.004, '#e8782a')
    def clathe_(m, prof, y=0.0, seg=12):
        f0 = set(m.bm.faces); m.add_bm(L.lathe(prof, seg=seg), Matrix.Translation(g2b(0, y, 0))); return [f for f in m.bm.faces if f not in f0]
    proto('cup', b_cup)
    def b_notebook(m):
        m.cbox(-0.21, 0.0, 0.0, 0.008, -0.15, 0.15, '#f6f4ee'); m.cbox(0.0, 0.21, 0.0, 0.01, -0.15, 0.15, '#f2f0ea')
        for k in range(8): m.cbox(-0.19, -0.02, 0.0085, 0.009, -0.12 + k * 0.03, -0.115 + k * 0.03, '#9ab0c8')
        m.cbox(0.05, 0.16, 0.01, 0.022, 0.02, 0.035, '#e8e040'); m.cbox(0.02, 0.15, 0.01, 0.02, -0.06, -0.05, '#3a6ac8')
    proto('notebook', b_notebook)
    proto('pencase', lambda m: m.crbox(-0.1, 0.1, 0.0, 0.05, -0.035, 0.035, '#2c3448', r=0.02, seg=2))
    def b_bag(m): m.crbox(-0.1, 0.1, 0.0, 0.28, -0.06, 0.06, '#d8b88a', r=0.006, seg=1); m.cbox(-0.05, 0.05, 0.12, 0.2, 0.06, 0.063, '#24345f'); m.cbox(-0.03, 0.03, 0.15, 0.18, 0.063, 0.064, '#e8782a')
    proto('bag', b_bag)
    def b_pack(col):
        def f(m):
            m.crbox(-0.15, 0.15, 0.0, 0.44, -0.09, 0.09, col, r=0.05, seg=2); m.crbox(-0.11, 0.11, 0.05, 0.22, 0.09, 0.15, col, r=0.03, seg=1)   # 本體、前口袋
            m.cbox(-0.1, 0.1, 0.2, 0.21, 0.15, 0.152, '#1a1a1a'); m.crbox(-0.04, 0.04, 0.44, 0.47, -0.02, 0.02, '#1a1a1a', r=0.008, seg=1)       # 拉鍊、提把
            for sx in (-0.09, 0.09): m.crbox(sx - 0.025, sx + 0.025, 0.08, 0.4, -0.12, -0.09, '#1e1e20', r=0.01, seg=1)                          # 背帶
        return f
    proto('pack_k', b_pack('#26272a')); proto('pack_n', b_pack('#2c3a5c')); proto('pack_g', b_pack('#6a6e72'))
    # 每一個座位前面的桌面放什麼
    spots = []   # (人坐的 x, z, 面向 yaw, 到桌面中心的距離, 桌面高度)
    for t in F['longTables']:
        for dx in (-1.0, 0.0, 1.0): spots += [(t['x'] + dx, t['z'] - 0.75, 0.0, 0.5), (t['x'] + dx, t['z'] + 0.75, math.pi, 0.5)]
    for t in F['tables4']:
        for dx in (-0.3, 0.3): spots += [(t['x'] + dx, t['z'] - 0.6, 0.0, 0.42), (t['x'] + dx, t['z'] + 0.6, math.pi, 0.42)]
    for z in F['westTables2']: spots += [(-5.1, z - 0.55, 0.0, 0.38), (-5.1, z + 0.55, math.pi, 0.38)]
    for x in F['frontTables2']: spots += [(x - 0.55, 7.1, math.pi / 2, 0.38), (x + 0.55, 7.1, -math.pi / 2, 0.38)]
    for z in F['eastStools']: spots.append((5.05, z, math.pi / 2, 0.62))
    for x in F['backStools']: spots.append((x, -7.05, math.pi, 0.62))
    r = random.Random(88); yT = Y0 + 0.75; cnt = {}
    for (sx, sz, yaw, fw) in spots:
        fx, fz = math.sin(yaw), math.cos(yaw); rx, rz = math.cos(yaw), -math.sin(yaw); iy = yaw + math.pi
        def at(lat, fwd): return sx + fx * fwd + rx * lat, sz + fz * fwd + rz * lat
        lap = r.random() < 0.55
        if lap:
            nm = r.choice(['laptop_s', 'laptop_s', 'laptop_d']); x, z = at(0.0, fw + 0.02); put(nm, x, yT, z, iy); put(f'screen{r.randint(0, 5)}', x, yT, z, iy)
        else:
            x, z = at(0.0, fw - 0.06); put('notebook', x, yT, z, iy + r.uniform(-0.2, 0.2))
        if r.random() < 0.65:
            k = r.randint(0, 3); x, z = at(r.choice([-0.28, 0.27]), fw); a_ = iy + r.uniform(-0.25, 0.25); put(f'books{k}', x, yT, z, a_); put(f'titles{k}', x, yT, z, a_)
        if r.random() < 0.7: x, z = at(r.choice([-0.24, 0.26]), fw - 0.12); put('cup', x, yT, z, 0.0)
        if r.random() < 0.3: x, z = at(0.12, fw - 0.2); put('pencase', x, yT, z, iy + r.uniform(-0.4, 0.4))
        if r.random() < 0.14: x, z = at(-0.2, fw + 0.12); put('bag', x, yT, z, iy)
        if r.random() < 0.3: x, z = at(0.34, -0.05); put(r.choice(['pack_k', 'pack_n', 'pack_g']), x, Y0, z, yaw + math.pi / 2 + r.uniform(-0.3, 0.3))   # 背包靠在椅子旁邊的地上
    for (x, z) in ((-0.0, -5.35), (2.4, -0.4)):   # 掛在椅背上的外套
        props.crbox(x - 0.2, x + 0.2, Y0 + 0.55, Y0 + 0.9, z - 0.04 - 0.22, z + 0.04 - 0.22, '#8a8c8e', r=0.04)

# ---------------- 收尾 ----------------
props.finish(root, smooth=True); legs.finish(root); tops.finish(root); SCR.finish(root, uv=False)
for ob in list(root.children_recursive):
    if ob.type == 'MESH' and ob.data and len(ob.data.polygons) == 0: B.remove(ob)
vc_m = K.vc_tex('dk_vc_matte', 'Plastic006', vary=0.05, maps=('diff', 'nor'), rough_value=0.62, tile=0.5, res=256)
vc_g = K.vc_tex('dk_vc_gloss', 'Plastic006', vary=0.05, maps=('diff', 'nor'), rough_value=0.3, tile=0.5, res=256)
vc_x = K.vc_tex('dk_vc_metal', 'Metal009', maps=('diff',), metal=0.4, rough_value=0.35, tile=1.0, res=256)
CC0_PROTECT = {'dk_wall', 'dk_black', 'dk_base', 'dk_vc_matte', 'dk_vc_gloss', 'dk_vc_metal'} | {m.name for m in bpy.data.materials if m.name.startswith('dk_ph_')}
grp = L.auto_vc_groups(root, vc_m, vc_x, gloss=vc_g, protect={'dk_glass', 'dk_warm', 'dk_lightpanel', 'dk_ceiling', 'dk_props_vc', 'GLOW_dk_screens'} | CC0_PROTECT)
grp['dk_props_vc'] = vc_m
L.vc_consolidate(root, grp)
L.atlas_small(root, os.path.join(TMP, f'dk{FL}_atlas.png'), f'dk{FL}_atlas', protect={'dk_ceiling', 'dk_floor', 'dk_laminate', 'GLOW_dk_screens'} | CC0_PROTECT, max_tris=6000, max_rep=1, cell=512, rough=0.55)
L.merge_by_material(root, keep=lambda ob: ob.name.startswith('WALL_') or ob.name.startswith('NIGHT_'), key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
K.report()
L.export(OUT)
print('OK', OUT, B.stats())
