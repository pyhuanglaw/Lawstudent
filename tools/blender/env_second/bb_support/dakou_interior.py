"""大口漢堡（新生南路、側門對面路口的 24 小時速食店，AA_621）兩層室內 → 一層一個 GLB。BB（帳號 A）2026-11-03 協助 LAWWW2。
  /opt/blenv/bin/python tools/blender/env_second/bb_support/dakou_interior.py -- --floor 1   （一樓 → dakou_1f.glb）
  /opt/blenv/bin/python tools/blender/env_second/bb_support/dakou_interior.py -- --floor 2   （二樓 → dakou_2f.glb）
  加 --preview --out <路徑>：窗外多放一張夜景卡片（只給 Blender 渲染看，正式 GLB 不放；遊戲窗外是 LAWWW2 的新生南路）。
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
from PIL import Image, ImageDraw, ImageFont   # noqa: E402

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


def t_counter(im, d):      # 一樓櫃檯正面：白底、深藍色塊、橘色弧線、小標誌
    w, h = im.size; d.rectangle([0, 0, w, h], fill=(244, 242, 236)); d.rectangle([0, 0, int(w * 0.16), h], fill=NAVY)
    pts = [(w * 0.16 + (w * 0.84) * t, h * 0.75 - h * 0.35 * math.sin(math.pi * t)) for t in [i / 40 for i in range(41)]]
    d.line(pts, fill=ORANGE, width=26); logo(d, int(w * 0.55), int(h * 0.42), 40)
    d.rectangle([0, h - 18, w, h], fill=(60, 62, 66))


def t_sign(txt):
    def f(im, d):
        w, h = im.size; d.rounded_rectangle([0, 0, w, h], 30, fill=ORANGE); d.text((60, 20), txt, font=font(130), fill=(255, 255, 255))
    return f


MENU = [[('雙層牛肉堡套餐', '159'), ('勁辣雞腿堡套餐', '149')], [('雞塊 6 塊', '69'), ('薯條（大）', '59')],
        [('可樂', '35'), ('熱咖啡', '45'), ('蘋果派', '35')], [('早餐 05:00～10:30', ''), ('豬肉滿福堡', '59')]]


def t_menu(i):
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
    w, h = im.size; d.rectangle([0, 0, w, h], fill=(236, 233, 226)); r = random.Random(9)
    for _ in range(4000): x, y = r.randint(0, w - 1), r.randint(0, h - 1); g = r.randint(222, 236); d.point((x, y), fill=(g, g - 2, g - 6))
    for k in range(0, w, w // 4): d.rectangle([k, 0, k + 3, h], fill=(206, 204, 200)); d.rectangle([0, k, w, k + 3], fill=(206, 204, 200))


def t_poster(im, d):      # 牆上的小海報：漢堡＋飲料（自己畫的）
    w, h = im.size; d.rectangle([0, 0, w, h], fill=NAVY); logo(d, w // 2 - 40, h // 2, 70)
    d.rounded_rectangle([w // 2 + 60, h // 2 - 60, w // 2 + 120, h // 2 + 60], 10, fill=(250, 248, 242)); d.rectangle([w // 2 + 60, h // 2 - 20, w // 2 + 120, h // 2 + 10], fill=ORANGE)
    d.line([(w // 2 + 100, h // 2 - 60), (w // 2 + 112, h // 2 - 110)], fill=(250, 248, 242), width=6)
    d.text((40, h - 110), '考試加油　宵夜半價', font=font(46), fill=(250, 248, 242))


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


P = {k: tex(f'{k}.png', s, f) for k, s, f in (('mural', (1400, 330), t_mural), ('study', (420, 840), t_study), ('counter', (1600, 200), t_counter),
                                               ('sign_order', (420, 170), t_sign('點餐')), ('sign_pick', (420, 170), t_sign('取餐')),
                                               ('kiosk', (420, 760), t_kiosk), ('ceiling', (512, 512), t_ceiling), ('poster', (520, 700), t_poster),
                                               ('staff', (340, 110), t_staff), ('night', (1600, 500), t_night))}
for i in range(4): P[f'menu{i}'] = tex(f'menu{i}.png', (640, 360), t_menu(i))

# ---------------- 材質（≤12，最後 vc_consolidate／atlas_small 合併）----------------
m_floor = L.pbr('dk_floor', 'floor_tiles_06', tile=1.2, target='#c9c7c2', normal=0.3, maps=('diff', 'nor'), rough_value=0.35)
m_lam = L.pbr('dk_laminate', 'laminate_floor_02', tile=1.4, target='#d7b78a', normal=0.2, maps=('diff',), rough_value=0.45)   # 桌面、吧台檯面、木椅、扶手（不是地板）
m_wall = L.flat('dk_wall', '#f1ede4', rough=0.8)
m_black = L.flat('dk_black', '#26282c', rough=0.45, metal=0.35)
m_steel = L.flat('dk_steel', '#b9bdc1', rough=0.3, metal=0.42)
m_glass = L.flat('dk_glass', '#cfe0e6', rough=0.05, alpha=0.22)
m_panel = glowmat('dk_lightpanel', '#fbf8f0', 3.0)
m_warm = glowmat('dk_warm', '#ffd9a0', 3.5)
m_vc = L.vc_material('dk_props_vc', rough=0.6)
m_ceil = img_mat('dk_ceiling', P['ceiling'], rough=0.9); m_ceil.use_backface_culling = True
IM = {k: img_mat('dk_' + k, p, rough=0.5) for k, p in P.items() if k != 'ceiling'}   # 選單螢幕不另外發光：全部併進一張貼圖集（材質 ≤ 12）；要亮由 LAWWW2 烘
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
            down_quad(pn, x - 0.06, x + 0.06, z - 0.06, z + 0.06, YC - 0.006)
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
        e = Mesh('STAIRHOLE_EDGE', m_wall); e.box(SH['x0'] - 0.02, SH['x0'], 3.4, 3.62, SH['z0'], SH['z1']); e.box(SH['x0'], X1, 3.4, 3.62, SH['z1'], SH['z1'] + 0.02); e.finish(root)


def glass_wall(side, a0, a1, y0, y1, solid_runs=(), door=None):
    """落地玻璃（黑色窗框）。side：front（z＝Z1）或 left（x＝X0）。玻璃不放進淡出群組（fadeWalls 會把整組設成不透明）"""
    g = B.group(f'WALL_{side}', root, props={'dir': DIRS[side]}); fr = Mesh(f'WALL_{side}_frame', m_black); gl = Mesh(f'{side}_glass', m_glass)
    def seg(u0, u1):
        n = max(1, round((u1 - u0) / 1.6)); us = [u0 + (u1 - u0) * i / n for i in range(n + 1)]
        for u in us:
            if side == 'front': fr.box(u - 0.04, u + 0.04, y0, y1, Z1 - 0.06, Z1 + 0.04)
            else: fr.box(X0 - 0.04, X0 + 0.06, y0, y1, u - 0.04, u + 0.04)
        if side == 'front':
            fr.box(u0, u1, y0, y0 + 0.1, Z1 - 0.06, Z1 + 0.04); fr.box(u0, u1, y1 - 0.08, y1, Z1 - 0.06, Z1 + 0.04); gl.box(u0, u1, y0 + 0.1, y1 - 0.08, Z1 - 0.01, Z1 + 0.0)
        else:
            fr.box(X0 - 0.04, X0 + 0.06, y0, y0 + 0.1, u0, u1); fr.box(X0 - 0.04, X0 + 0.06, y1 - 0.08, y1, u0, u1); gl.box(X0 + 0.0, X0 + 0.01, y0 + 0.1, y1 - 0.08, u0, u1)
    if door:
        dx0, dx1 = door['x'] - door['w'] / 2, door['x'] + door['w'] / 2
        seg(a0, dx0); seg(dx1, a1)
        for x in (dx0, (dx0 + dx1) / 2, dx1): fr.box(x - 0.04, x + 0.04, y0, 2.6, Z1 - 0.06, Z1 + 0.04)
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
    b = CMesh(f'WALL_{side}_base', m_vc)   # 踢腳板
    if side == 'right': b.cbox(X1 - 0.015, X1, Y0, Y0 + 0.1, Z0, Z1, '#5a5c60')
    else: b.cbox(X0, X1, Y0, Y0 + 0.1, Z0, Z0 + 0.015, '#5a5c60')
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
    """盆栽：白色方盆＋一叢葉子（頂點色）"""
    y = Y0 if y is None else y; r = random.Random(int(x * 100 + z * 7))
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
        tr.crbox(sx0, sx1, yt - 0.03, yt, za, zb + 0.02, '#cfcbc4', r=0.006)
        tr.cbox(sx0 + 0.05, sx1 - 0.05, yt - 0.004, yt + 0.003, zb - 0.05, zb - 0.01, '#3c3e42')   # 防滑條
        body.box(sx0, sx1, (0.0 if za >= 0.9 - 1e-6 else yt - 0.4), yt - 0.03, za, zb)
        if za < 0.9 - 1e-6: body.box(SH['x0'], SH['x0'] + 0.1, 0.0, yt - 0.4, za, zb)   # 樓梯下儲藏室 x 4.55 那一面的牆（跟著斜度）
        tr.cbox(sx0, sx1, yt - rise, yt - 0.03, zb, zb + 0.015, '#e6e3dc')   # 踢面
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
    """--preview 才有：窗外夜景卡片（給 Blender 渲染看）"""
    if not PREVIEW: return
    zcard('PREVIEW_NIGHT_FRONT', Z1 + 3.0, X0 - 4.0, X1 + 4.0, Y0 - 1.0, Y0 + 6.0, IM['night'], -1)
    wall_card('PREVIEW_NIGHT_WEST', X0 - 3.0, Z0 - 4.0, Z1 + 4.0, Y0 - 1.0, Y0 + 6.0, IM['night'], +1)


props = CMesh('PROPS', m_vc); legs = Mesh('LEGS', m_black); tops = Mesh('TOPS', m_lam, tile=1.4)
SEAT_COLS = ['#b8743e', '#2f3d63']

# ======================================================== 一樓 ========================================================
if FL == 1:
    floor_slab(); ceiling(); stairs(); outside_cards()
    glass_wall('front', X0, X1, 0.0, 3.2, door=F['front']['door'])
    wg = F['westGlass']; glass_wall('left', wg['z0'], wg['z1'], 0.0, 3.2, solid_runs=[(X0 - T, X0, 0.0, 3.2, Z0, wg['z0'])])
    solid_wall('right'); solid_wall('back')
    # 廚房後牆（白色長磁磚）＋設備
    kt = L.pbr('dk_kitchen_tile', 'long_white_tiles', tile=1.0, target='#eef0ee', normal=0.3, maps=('diff', 'nor'), rough_value=0.25)
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
    sf = F['staff']; sw = Mesh('STAFF_WALL', m_wall); sw.box(sf['x0'], sf['x0'] + 0.1, 0.0, YC, Z0, sf['z1']); sw.box(sf['x0'], sf['x1'], 0.0, YC, sf['z1'] - 0.1, sf['z1']); sw.box(sf['x1'] - 0.1, sf['x1'], 0.0, YC, sf['z1'], ST['za']); sw.finish(root)
    # （員工通道後面 x 4.55～6、z −8～−1.6 整塊關著：倉庫、廁所，這一版不做室內）
    props.crbox(3.55, 4.4, 0.0, 2.1, sf['z1'] + 0.0, sf['z1'] + 0.03, '#d8d4cc', r=0.01); props.cbox(4.25, 4.3, 0.95, 1.05, sf['z1'] + 0.03, sf['z1'] + 0.07, '#9a9c9e')
    zcard('STAFF_SIGN', sf['z1'] + 0.035, 3.7, 4.25, 1.6, 1.78, IM['staff'], +1)
    # 點餐櫃檯：檯面、正面貼圖、收銀機、取餐區
    Mesh('COUNTER_TOP', L.flat('dk_quartz', '#f4f2ee', rough=0.25)).rbox(ct['x0'], ct['x1'], ct['h'] - 0.04, ct['h'], ct['z0'], ct['z1'] + 0.04, r=0.01, seg=2).finish(root)
    Mesh('COUNTER_BODY', m_wall).box(ct['x0'], ct['x1'], 0.0, ct['h'] - 0.04, ct['z0'], ct['z1'] - 0.02).box(ct['x1'] - 0.02, ct['x1'], 0.0, ct['h'] - 0.04, ct['z0'], ct['z1']).finish(root)
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
        zcard(f'MENU_SCREEN_{i}', ms['z'] + 0.002, x - 0.55, x + 0.55, ms['y0'], ms['y1'], IM[f'menu{i}'], +1)
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
        props.crbox(x - 0.25, x + 0.25, 0.9, 1.85, z - 0.05, z + 0.03, '#f4f4f2', r=0.02); props.cbox(x - 0.25, x + 0.25, 1.85, 1.95, z - 0.05, z + 0.03, '#24345f')
        zcard(f'KIOSK_SCREEN_{x:.1f}', z + 0.032, x - 0.21, x + 0.21, 0.98, 1.78, IM['kiosk'], +1)
    # 回收餐盤
    tr_ = F['tray']; props.crbox(tr_['x'] - 0.45, tr_['x'] + 0.45, 0.0, 1.0, tr_['z'] - 0.25, tr_['z'] + 0.25, '#24345f', r=0.02)
    props.cbox(tr_['x'] - 0.4, tr_['x'] - 0.05, 0.75, 0.9, tr_['z'] + 0.249, tr_['z'] + 0.252, '#1a1a1a'); props.cbox(tr_['x'] + 0.05, tr_['x'] + 0.4, 0.75, 0.9, tr_['z'] + 0.249, tr_['z'] + 0.252, '#1a1a1a')
    for k in range(4): props.cbox(tr_['x'] - 0.35, tr_['x'] + 0.35, 1.0 + k * 0.015, 1.01 + k * 0.015, tr_['z'] - 0.2, tr_['z'] + 0.2, '#c84030')
    # 窗邊高腳吧台
    wb = F['westBar']; tops.rbox(wb['x0'], wb['x1'], wb['h'] - 0.04, wb['h'], wb['z0'], wb['z1'], r=0.008, seg=2)
    for z in (wb['z0'] + 0.1, (wb['z0'] + wb['z1']) / 2, wb['z1'] - 0.1): legs.box(wb['x0'] + 0.05, wb['x0'] + 0.1, 0.0, wb['h'] - 0.04, z - 0.03, z + 0.03)
    for i, z in enumerate(F['westStools']): newpaint(props, lambda: stool(props, legs, -5.2, z, None), SEAT_COLS[i % 2])
    fb = F['frontBar']; tops.rbox(fb['x0'], fb['x1'], fb['h'] - 0.04, fb['h'], fb['z0'], fb['z1'], r=0.008, seg=2)
    for x in (fb['x0'] + 0.1, fb['x1'] - 0.1): legs.box(x - 0.03, x + 0.03, 0.0, fb['h'] - 0.04, fb['z0'] + 0.05, fb['z0'] + 0.1)
    for i, x in enumerate(F['frontStools']): newpaint(props, lambda: stool(props, legs, x, 7.2, None), SEAT_COLS[(i + 1) % 2])
    for i, t in enumerate(F['tables2']):
        table(tops, legs, t['x'], t['z'], 0.7, 0.7); chair(props, legs, t['x'], t['z'] - 0.55, 0, SEAT_COLS[i % 2]); chair(props, legs, t['x'], t['z'] + 0.55, math.pi, SEAT_COLS[(i + 1) % 2])
    for t in F['highTables']: table(tops, legs, t['x'], t['z'], 0.6, 0.6, h=1.05, round_=True)
    # 牆上的海報（後牆、員工通道左邊）、門邊的垃圾桶、盆栽
    wall_card('POSTER_1F', X1 - 0.01, 5.2, 6.5, 1.2, 2.95, IM['poster'], -1)
    props.crbox(-3.1, -2.6, 0.0, 1.0, 7.5, 7.95, '#24345f', r=0.02); props.cbox(-3.05, -2.65, 0.8, 0.92, 7.49, 7.5, '#111111')
    plant(props, -5.6, 7.5); plant(props, 5.4, 7.45, s=0.9)
    # 桌上的東西（深夜也有人在讀書：可樂、紙袋、課本）
    r = random.Random(41)
    for t in F['tables2'][:2] + F['highTables'][:1]:
        newpaint(props, lambda: props.add_bm(L.lathe([(0.0, 0.0), (0.04, 0.0), (0.045, 0.14), (0.0, 0.14)], seg=10), Matrix.Translation(g2b(t['x'] + 0.12, (0.75 if t in F['tables2'] else 1.05), t['z'] - 0.1))), '#f4f4f2')
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
    # 桌上的東西（參考圖：課本、筆電、筆記本、筆袋、紙袋、杯子；外套掛在椅背）
    r = random.Random(88); spots = [(t['x'] + dx, t['z'] + sz * 0.3) for t in F['longTables'] for dx in (-1.0, 0.0, 1.0) for sz in (-1, 1)]
    spots += [(t['x'] + dx, t['z'] + sz * 0.22) for t in F['tables4'] for dx in (-0.3, 0.3) for sz in (-1, 1)]
    r.shuffle(spots); yT = Y0 + 0.75
    for k, (x, z) in enumerate(spots[:22]):
        kind = k % 5
        if kind == 0:   # 筆電
            props.crbox(x - 0.17, x + 0.17, yT, yT + 0.015, z - 0.12, z + 0.12, '#b8bcc0', r=0.005)
            sgn = 1 if z < min(F['longTables'] + F['tables4'], key=lambda t: abs(t['z'] - z))['z'] else -1
            props.cbox(x - 0.17, x + 0.17, yT + 0.015, yT + 0.24, z + sgn * 0.12 - 0.006, z + sgn * 0.12 + 0.006, '#9ea2a6')
        elif kind == 1:   # 兩三本課本
            for j in range(r.randint(1, 3)): props.crbox(x - 0.12, x + 0.12, yT + j * 0.035, yT + (j + 1) * 0.035, z - 0.16, z + 0.16, r.choice(['#24345f', '#a03a34', '#2f5a4a', '#5a3a2a']), r=0.004)
        elif kind == 2:   # 攤開的筆記本＋螢光筆
            props.cbox(x - 0.2, x + 0.2, yT, yT + 0.008, z - 0.14, z + 0.14, '#f6f4ee'); props.cbox(x + 0.05, x + 0.15, yT + 0.008, yT + 0.02, z - 0.02, z, '#e8e040')
        elif kind == 3:   # 杯子（白杯藍蓋＋吸管）
            newpaint(props, lambda: props.add_bm(L.lathe([(0.0, 0.0), (0.04, 0.0), (0.048, 0.16), (0.05, 0.17), (0.0, 0.175)], seg=12), Matrix.Translation(g2b(x, yT, z))), '#f4f4f2'); props.cbox(x - 0.004, x + 0.004, yT + 0.17, yT + 0.26, z - 0.004, z + 0.004, '#e8782a')
        else:            # 紙袋
            props.crbox(x - 0.1, x + 0.1, yT, yT + 0.28, z - 0.06, z + 0.06, '#d8b88a', r=0.008); props.cbox(x - 0.05, x + 0.05, yT + 0.12, yT + 0.2, z + 0.06, z + 0.062, '#24345f')
    for (x, z) in ((-0.0, -5.35), (2.4, -0.4)):   # 掛在椅背上的外套
        props.crbox(x - 0.2, x + 0.2, Y0 + 0.55, Y0 + 0.9, z - 0.04 - 0.22, z + 0.04 - 0.22, '#8a8c8e', r=0.04)

# ---------------- 收尾 ----------------
props.finish(root, smooth=True); legs.finish(root); tops.finish(root)
for ob in list(root.children_recursive):
    if ob.type == 'MESH' and ob.data and len(ob.data.polygons) == 0: B.remove(ob)
vc_m = L.vc_material('dk_vc_matte', rough=0.62); vc_g = L.vc_material('dk_vc_gloss', rough=0.3); vc_x = L.vc_metal('dk_vc_metal', rough=0.35, metal=0.4)
grp = L.auto_vc_groups(root, vc_m, vc_x, gloss=vc_g, protect={'dk_glass', 'dk_warm', 'dk_lightpanel', 'dk_ceiling', 'dk_props_vc'})
grp['dk_props_vc'] = vc_m
L.vc_consolidate(root, grp)
L.atlas_small(root, os.path.join(TMP, f'dk{FL}_atlas.png'), f'dk{FL}_atlas', protect={'dk_ceiling', 'dk_floor', 'dk_laminate'}, max_tris=6000, max_rep=1, cell=512, rough=0.55)
L.merge_by_material(root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
L.export(OUT)
print('OK', OUT, B.stats())
