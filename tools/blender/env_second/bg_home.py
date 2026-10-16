"""2D 背景：臺北・家裡（outings3d.js 的 OUT.BG.home_living「臺北・家裡的客廳」；之後 home_balcony／祐廷的房間等 LAWWW-B 決定）。
LAWWW2-B 2026-10-16；LAWWW-B 佇列「台北的家 2D 兩張」。Blender 5.2（bpy，無介面）＋Cycles（CPU），1920×1080，畫面上沒有人（人物用 ADV 立繪疊上去），
做法照 bg_noodle_table.py：場景直接在這裡用 bpy 蓋（Poly Haven CC0 貼圖＋純色材質），不另外輸出 GLB。
  /opt/blenv/bin/python tools/blender/env_second/bg_home.py -- living <輸出.png> [--res 1920x1080] [--samples 96]
劇情（LAWWW-B 分支 src/data/events.js 的 LAND_Y1，交接包 v2 C2）：除夕，臺北家裡的客廳，一桌親戚；大伯拿出土地謄本（2026-10-14 使用者：祐廷是臺北人）。
→ 一般的臺北公寓（三房兩廳的那種）：米白牆、淺色磁磚地、鋁窗＋窗外鐵窗、窗外對面公寓的燈；客廳和飯廳連在一起，
  飯廳一張大圓桌（轉盤）擺滿年菜＋中間一鍋圍爐、親戚多所以加了紅色塑膠椅；大門貼春聯（傳統的吉祥句子）、電視櫃上一盤橘子、盆栽。
座標＝遊戲座標（x 東、y 上、z 南），g2b 轉成 Blender。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector   # noqa: E402
from PIL import Image, ImageDraw, ImageFont

A = sys.argv[sys.argv.index('--') + 1:]
SCENE, OUT = A[0], A[1]
def opt(name, default):
    return A[A.index(name) + 1] if name in A else default
RW, RH = map(int, opt('--res', '1920x1080').split('x')); SAMPLES = int(opt('--samples', '96'))
VAR = opt('--variant', 'everyday')   # living：everyday＝平常的晚餐（主圖）、cny＝除夕（年菜＋圍爐、加紅色塑膠椅）、day＝白天（桌上收乾淨、窗外白天）
TMP = os.path.join(os.path.dirname(os.path.abspath(OUT)), 'bg_home_tex'); os.makedirs(TMP, exist_ok=True)
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
rng = random.Random(1016)

B.reset(texres=1024)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = float(opt('--exposure', '0.0'))
try: sc.view_settings.look = opt('--look', 'AgX - Punchy')
except Exception: pass
sc.cycles.max_bounces = 6; sc.cycles.transparent_max_bounces = 32


def img_mat(name, path, emit=0.0, rough=0.7):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt = mt.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path); nt.links.new(tx.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = rough
    if emit:
        nt.links.new(tx.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = emit
    return mt


def emit_only(name, path, strength):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt = mt.node_tree; nt.nodes.clear()
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path); em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Strength'].default_value = strength
    o = nt.nodes.new('ShaderNodeOutputMaterial'); nt.links.new(tx.outputs['Color'], em.inputs['Color']); nt.links.new(em.outputs['Emission'], o.inputs['Surface']); return mt


def uvquad(name, p0, p1, p2, p3, mat):
    """四邊形（逆時針看是正面），UV 0..1"""
    bm = bmesh.new(); vs = [bm.verts.new(g2b(*p)) for p in (p0, p1, p2, p3)]; f = bm.faces.new(vs)
    uv = bm.loops.layers.uv.new()
    for lp, t in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uv].uv = t
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); return ob


def lathe_obj(name, profile, mat, at, seg=32, smooth=True, scale=(1, 1, 1)):
    bm = L.lathe(profile, seg); me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); ob.location = g2b(*at); ob.scale = scale
    if smooth: me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    return ob


def area_light(name, x, y, z, w, d, power, col=(1.0, 0.9, 0.78)):
    l = bpy.data.lights.new(name, 'AREA'); l.energy = power; l.color = col; l.shape = 'RECTANGLE'; l.size = w; l.size_y = d
    ob = bpy.data.objects.new(name, l); ob.location = g2b(x, y, z); sc.collection.objects.link(ob); return ob


def point_light(name, x, y, z, power, col=(1.0, 0.85, 0.65), r=0.1):
    l = bpy.data.lights.new(name, 'POINT'); l.energy = power; l.color = col; l.shadow_soft_size = r
    ob = bpy.data.objects.new(name, l); ob.location = g2b(x, y, z); sc.collection.objects.link(ob); return ob


def camera(eye, look, lens):
    if '--eye' in A: eye = tuple(map(float, opt('--eye', '').split(','))); look = tuple(map(float, opt('--look', '').split(',')))
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
    cam.data.lens = lens; cam.data.sensor_width = 36; cam.location = g2b(*eye)
    cam.rotation_euler = (g2b(*look) - g2b(*eye)).to_track_quat('-Z', 'Y').to_euler()


def night_city(path, W=2048, H=1024, seed=7):
    """窗外：對面幾棟公寓（磁磚外牆的暗色剪影、亮燈的窗有暖有冷、有的窗簾拉著）、更遠的大樓、夜空——只在窗外很遠的地方（遠景，D38 允許的用法）"""
    r = random.Random(seed); im = Image.new('RGB', (W, H)); d = ImageDraw.Draw(im)
    for y in range(H):                                                        # 夜空：上深藍、地平線帶一點城市的橘光
        t = y / H; c = (int(14 + 40 * t ** 2), int(20 + 32 * t ** 2), int(38 + 30 * t ** 2)); d.line([(0, y), (W, y)], fill=c)
    for layer, (y0, hmin, hmax, wmin, wmax, base, lit) in enumerate(((0.30, 0.1, 0.35, 120, 260, (26, 28, 36), 0.25), (0.42, 0.15, 0.5, 220, 420, (34, 34, 38), 0.4))):
        x = -r.randint(0, 80)
        while x < W:
            bw = r.randint(wmin, wmax); top = int(H * (y0 + r.uniform(-0.12, 0.05))); d.rectangle([x, top, x + bw, H], fill=base)
            fh = 34 if layer else 22; fw = 46 if layer else 28
            for yy in range(top + 14, H - 10, fh):
                for xx in range(x + 10, x + bw - fw, fw + 12):
                    if r.random() < lit:
                        c = r.choice([(255, 214, 150), (255, 226, 180), (236, 240, 255), (255, 200, 130)]); k = r.uniform(0.55, 1.0)
                        d.rectangle([xx, yy, xx + fw, yy + fh - 12], fill=tuple(int(v * k) for v in c))
                        if r.random() < 0.4: d.rectangle([xx, yy, xx + fw // 2, yy + fh - 12], fill=tuple(int(v * k * 0.7) for v in (220, 150, 110)))   # 半拉的窗簾
            x += bw + r.randint(6, 40)
    im.save(path); return path


def day_city(path, W=2048, H=1024, seed=7):
    """白天的窗外：淡藍的天、對面幾棟米色／灰色磁磚公寓（窗是深色的玻璃、有鐵窗與冷氣），遠景大樓淡一點（空氣透視）"""
    r = random.Random(seed); im = Image.new('RGB', (W, H)); d = ImageDraw.Draw(im)
    for y in range(H): t = y / H; d.line([(0, y), (W, y)], fill=(int(150 + 60 * t), int(185 + 45 * t), int(220 + 25 * t)))
    for layer, (y0, wmin, wmax, cols) in enumerate(((0.30, 120, 260, [(196, 200, 204), (186, 190, 196)]), (0.42, 220, 420, [(214, 204, 186), (200, 196, 188), (222, 214, 200), (180, 176, 170)]))):
        x = -r.randint(0, 80)
        while x < W:
            bw = r.randint(wmin, wmax); top = int(H * (y0 + r.uniform(-0.12, 0.05))); base = r.choice(cols); d.rectangle([x, top, x + bw, H], fill=base)
            fh = 34 if layer else 22; fw = 46 if layer else 28
            for yy in range(top + 14, H - 10, fh):
                for xx in range(x + 10, x + bw - fw, fw + 12):
                    g = r.randint(60, 95); d.rectangle([xx, yy, xx + fw, yy + fh - 12], fill=(g, g + 8, g + 16))
                    if layer and r.random() < 0.3: d.rectangle([xx + fw - 14, yy + fh - 20, xx + fw - 2, yy + fh - 12], fill=(232, 232, 228))   # 冷氣室外機
            x += bw + r.randint(6, 40)
    im.save(path); return path


def chunlian(path, text, vertical=True, W=None, H=None):
    """春聯：紅紙（帶一點紙的纖維）＋黑字（傳統的吉祥句子，不是任何人的作品）"""
    if vertical: W, H = W or 180, H or 1100
    else: W, H = W or 760, H or 190
    im = Image.new('RGB', (W, H), (196, 34, 32)); d = ImageDraw.Draw(im); r = random.Random(len(text))
    for _ in range(900): x, y = r.randrange(W), r.randrange(H); d.point((x, y), fill=(206 + r.randint(-12, 12), 40 + r.randint(-10, 10), 36))
    d.rectangle([6, 6, W - 7, H - 7], outline=(222, 176, 70), width=4)
    ch = list(text)
    if vertical:
        fs = int(min(W * 0.7, (H - 60) / len(ch) * 0.86)); f = ImageFont.truetype(FONT, fs)
        for i, c in enumerate(ch): d.text((W / 2, 40 + (i + 0.5) * (H - 80) / len(ch)), c, fill=(22, 18, 16), font=f, anchor='mm', stroke_width=2, stroke_fill=(22, 18, 16))
    else:
        fs = int(min(H * 0.66, (W - 60) / len(ch) * 0.86)); f = ImageFont.truetype(FONT, fs)
        for i, c in enumerate(ch): d.text((40 + (i + 0.5) * (W - 80) / len(ch), H / 2), c, fill=(22, 18, 16), font=f, anchor='mm', stroke_width=2, stroke_fill=(22, 18, 16))
    im.save(path); return path


def doufang(path, ch='春', S=420):
    """斗方（菱形的紅紙＋一個字）"""
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.polygon([(S / 2, 4), (S - 4, S / 2), (S / 2, S - 4), (4, S / 2)], fill=(198, 34, 32), outline=(222, 176, 70))
    d.text((S / 2, S / 2), ch, fill=(22, 18, 16), font=ImageFont.truetype(FONT, int(S * 0.42)), anchor='mm', stroke_width=3, stroke_fill=(22, 18, 16))
    im.save(path); return path


def cutout_mat(name, path):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt = mt.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path)
    nt.links.new(tx.outputs['Color'], b.inputs['Base Color']); nt.links.new(tx.outputs['Alpha'], b.inputs['Alpha']); b.inputs['Roughness'].default_value = 0.7
    try: mt.blend_method = 'HASHED'
    except Exception: pass
    return mt


# ================================================================ 客廳＋飯廳（除夕夜）
if SCENE == 'living':
    X0, X1, Z0, Z1, HT = -3.6, 3.6, -3.4, 3.4, 2.8
    M = {
        'floor': L.pbr('home_floor', 'large_floor_tiles_02', tile=0.6, target='#e2dbcf', normal=0.3, maps=('diff', 'nor'), rough_value=0.22),
        'wall': L.flat('home_wall', '#ece6da', rough=0.92),                    # 油漆牆（乾淨；灰泥貼圖有髒斑，不像有人住的家）
        'ceil': L.flat('home_ceiling', '#f1eee8', rough=0.9),
        'skirt': L.flat('home_skirt', '#b9ab95', rough=0.6),
        'wood': L.pbr('home_wood', 'wood_table_001', tile=0.8, target='#7a5236', maps=('diff', 'nor'), rough_value=0.45),
        'wood_l': L.pbr('home_wood_l', 'fine_grained_wood', tile=0.8, target='#a8825c', maps=('diff', 'nor'), rough_value=0.5),
        'alu': L.flat('home_alu', '#b9bec2', rough=0.35, metal=0.45),
        'glass': L.flat('home_glass', '#c9d6dc', rough=0.04, alpha=0.12),
        'grille': L.flat('home_grille', '#e8e6e0', rough=0.5, metal=0.2),
        'curtain': L.pbr('home_curtain', 'fabric_leather_02', tile=0.6, target='#c9b48f', maps=('diff',), rough_value=0.95),
        'sofa': L.pbr('home_sofa', 'fabric_leather_02', tile=0.5, target='#7b6a58', maps=('diff', 'nor'), rough_value=0.8),
        'black': L.flat('home_black', '#121314', rough=0.3),
        'door': L.flat('home_door', '#6e4a33', rough=0.45),
        'steel': L.flat('home_steel', '#c8ccd0', rough=0.18, metal=0.45),
        'plate': L.flat('home_plate', '#f6f3ec', rough=0.15),
        'bowl_blue': L.flat('home_bowl_rim', '#2f4f7a', rough=0.2),
        'red_stool': L.flat('home_stool', '#c9302a', rough=0.45),
        'chop': L.flat('home_chopstick', '#b88a4a', rough=0.5),
        'tablecloth': L.flat('home_susan', '#d9e2e0', rough=0.05, alpha=0.35),
        'soup': L.flat('home_soup', '#b8642c', rough=0.08),
        'fish': L.flat('home_fish', '#c58a3e', rough=0.35),
        'chicken': L.flat('home_chicken', '#f1dcb2', rough=0.45),
        'greens': L.flat('home_greens', '#2f6b2a', rough=0.5),
        'dumpling': L.flat('home_dumpling', '#f2ead8', rough=0.5),
        'shrimp': L.flat('home_shrimp', '#e2683c', rough=0.4),
        'orange': L.flat('home_orange', '#f08a1c', rough=0.45),
        'tea': L.flat('home_tea', '#8a4a1c', rough=0.05, alpha=0.75),
        'lamp': L.flat('home_lamp', '#fff3dc', rough=0.4, emit=B.srgb('#ffe2b0')),
        'tv': L.flat('home_tv', '#0d0e10', rough=0.15),
        'soup_light': L.flat('home_soup_l', '#d9b77a', rough=0.06),
        'tomato': L.flat('home_tomato', '#c8371f', rough=0.3),
        'egg': L.flat('home_egg', '#f2c443', rough=0.45),
        'braised': L.flat('home_braised', '#5a2f18', rough=0.3),
        'rice': L.flat('home_rice', '#f7f4ec', rough=0.6),
        'paper': L.flat('home_paper', '#e4e0d4', rough=0.85),
        'ledger': L.flat('home_ledger', '#2f5d50', rough=0.6),
        'calc': L.flat('home_calc', '#3a3d42', rough=0.4),
    }
    # ---- 房間：地板、天花板、四面牆（鏡頭在南邊 +z，那一面不蓋）、踢腳板
    fl = Mesh('floor', M['floor']); fl.box(X0, X1, -0.02, 0.0, Z0, Z1); fl.finish()
    ce = Mesh('ceiling', M['ceil']); ce.box(X0, X1, HT, HT + 0.05, Z0, Z1); ce.finish(uv=False)
    WIN = (-3.0, 0.9, 0.85, 2.35)                                             # 北牆的窗：x0, x1, y0, y1
    wl = Mesh('walls', M['wall'])
    wl.box(X0, WIN[0], 0, HT, Z0 - 0.12, Z0); wl.box(WIN[1], X1, 0, HT, Z0 - 0.12, Z0)
    wl.box(WIN[0], WIN[1], 0, WIN[2], Z0 - 0.12, Z0); wl.box(WIN[0], WIN[1], WIN[3], HT, Z0 - 0.12, Z0)
    DOOR = (1.0, 1.95)                                                        # 西牆的大門：z0, z1（高 2.1）
    wl.box(X0 - 0.12, X0, 0, HT, Z0, DOOR[0]); wl.box(X0 - 0.12, X0, 0, HT, DOOR[1], Z1); wl.box(X0 - 0.12, X0, 2.1, HT, DOOR[0], DOOR[1])
    wl.box(X1, X1 + 0.12, 0, HT, Z0, Z1)
    wl.finish()
    sk = Mesh('skirting', M['skirt']); sk.box(X0, X1, 0, 0.08, Z0, Z0 + 0.012); sk.box(X0, X0 + 0.012, 0, 0.08, Z0, DOOR[0]); sk.box(X0, X0 + 0.012, 0, 0.08, DOOR[1], Z1); sk.box(X1 - 0.012, X1, 0, 0.08, Z0, Z1); sk.finish()
    # ---- 窗：鋁框、中間兩扇推拉、玻璃；窗外一層白色鐵窗；更外面是夜景
    al = Mesh('window_alu', M['alu']); x0, x1, y0, y1 = WIN; zf = Z0 - 0.06
    for xa, xb in ((x0, x0 + 0.05), (x1 - 0.05, x1), ((x0 + x1) / 2 - 0.03, (x0 + x1) / 2 + 0.03)): al.box(xa, xb, y0, y1, zf - 0.04, zf + 0.04)
    for ya, yb in ((y0, y0 + 0.05), (y1 - 0.05, y1)): al.box(x0, x1, ya, yb, zf - 0.04, zf + 0.04)
    al.box(x0 - 0.06, x1 + 0.06, y0 - 0.04, y0, Z0, Z0 + 0.12)                  # 窗台
    al.finish()
    uvquad('window_glass', (x0, y0, zf), (x1, y0, zf), (x1, y1, zf), (x0, y1, zf), M['glass'])
    gr = Mesh('grille', M['grille']); zg = Z0 - 0.55                              # 外推的鐵窗（台北老公寓）
    for k in range(int((x1 - x0) / 0.12) + 1): gr.box(x0 + k * 0.12 - 0.008, x0 + k * 0.12 + 0.008, y0 - 0.1, y1 + 0.15, zg - 0.008, zg + 0.008)
    for yy in (y0 - 0.1, (y0 + y1) / 2, y1 + 0.15): gr.box(x0, x1, yy - 0.012, yy + 0.012, zg - 0.012, zg + 0.012)
    gr.box(x0, x1, y0 - 0.12, y0 - 0.1, zg, Z0 - 0.12); gr.box(x0, x1, y1 + 0.15, y1 + 0.17, zg, Z0 - 0.12)
    gr.finish()
    p = doufang(os.path.join(TMP, 'fu.png'), '福'); xc = (x0 + x1) / 2 + 0.55; zf2 = zf + 0.006           # 窗玻璃上貼一張「福」（過年）
    uvquad('fu', (xc - 0.22, 1.42, zf2), (xc + 0.22, 1.42, zf2), (xc + 0.22, 1.86, zf2), (xc - 0.22, 1.86, zf2), cutout_mat('fu', p))
    vp = night_city(os.path.join(TMP, 'night_city.png')) if VAR != 'day' else day_city(os.path.join(TMP, 'day_city.png'))
    uvquad('night_view', (-14, -3.5, -16), (12, -3.5, -16), (12, 9.5, -16), (-14, 9.5, -16), emit_only('night_view', vp, 1.0 if VAR != 'day' else 1.6))
    # 窗簾（兩側拉開、垂直的波浪）
    for xc, w in ((x0 - 0.05, 0.75), (x1 + 0.05, 0.75)):
        bm = bmesh.new(); n = 40; zc = Z0 + 0.12
        top = []; bot = []
        for i in range(n + 1):
            t = i / n; x = xc - w / 2 + w * t; dz = 0.05 * math.sin(t * math.pi * 9)
            top.append(bm.verts.new(g2b(x, 2.55, zc + dz))); bot.append(bm.verts.new(g2b(x, 0.6, zc + dz)))
        for i in range(n): bm.faces.new((bot[i], bot[i + 1], top[i + 1], top[i]))
        me = bpy.data.meshes.new('curtain'); bm.to_mesh(me); bm.free(); me.materials.append(M['curtain']); ob = bpy.data.objects.new('curtain', me); sc.collection.objects.link(ob)
        me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    rod = Mesh('curtain_rod', M['steel']); rod.cyl((x0 - 0.5, 2.58, Z0 + 0.12), (x1 + 0.5, 2.58, Z0 + 0.12), 0.012, seg=10); rod.finish(smooth=True)
    # ---- 大門（西牆）：深色木門＋春聯（上聯、下聯、橫批）＋門上的斗方
    dr = Mesh('door', M['door']); dr.box(X0 + 0.005, X0 + 0.05, 0, 2.08, DOOR[0] + 0.02, DOOR[1] - 0.02); dr.finish()
    df = Mesh('door_frame', M['wood']); df.box(X0, X0 + 0.07, 0, 2.15, DOOR[0] - 0.06, DOOR[0]); df.box(X0, X0 + 0.07, 0, 2.15, DOOR[1], DOOR[1] + 0.06); df.box(X0, X0 + 0.07, 2.1, 2.16, DOOR[0] - 0.06, DOOR[1] + 0.06); df.finish()
    hd = Mesh('door_handle', M['steel']); hd.box(X0 + 0.05, X0 + 0.09, 0.98, 1.02, DOOR[1] - 0.2, DOOR[1] - 0.1); hd.finish()
    xs = X0 + 0.075
    # 西牆朝東：面對大門時左手邊是 +z。上聯貼右邊（−z）、下聯貼左邊（+z）；貼圖的左緣＝z 大的那一邊（不然字是反的）
    cl = [('上聯', '天增歲月人增壽', DOOR[0] - 0.27, DOOR[0] - 0.09), ('下聯', '春滿乾坤福滿門', DOOR[1] + 0.09, DOOR[1] + 0.27)]
    for nm, tx, za, zb in cl:
        p = chunlian(os.path.join(TMP, nm + '.png'), tx)
        uvquad(nm, (xs, 0.75, zb), (xs, 0.75, za), (xs, 2.08, za), (xs, 2.08, zb), img_mat(nm, p, 0.05))
    p = chunlian(os.path.join(TMP, 'hengpi.png'), '福壽雙全', vertical=False)
    uvquad('hengpi', (xs, 2.2, DOOR[1] + 0.05), (xs, 2.2, DOOR[0] - 0.05), (xs, 2.42, DOOR[0] - 0.05), (xs, 2.42, DOOR[1] + 0.05), img_mat('hengpi', p, 0.05))
    p = doufang(os.path.join(TMP, 'doufang.png'), '春'); xc = X0 + 0.056; zc = (DOOR[0] + DOOR[1]) / 2
    uvquad('doufang', (xc, 1.35, zc + 0.24), (xc, 1.35, zc - 0.24), (xc, 1.83, zc - 0.24), (xc, 1.83, zc + 0.24), cutout_mat('doufang', p))
    # 西牆（門和窗之間那一大片）：矮櫃＋熱水瓶、面紙盒；上面一幅書法（傳統吉祥句「家和萬事興」）；時鐘
    sb = Mesh('sideboard', M['wood']); sb.box(X0, X0 + 0.42, 0, 0.82, -2.3, -0.5); sb.finish()
    sbt = Mesh('sideboard_top', M['wood_l']); sbt.box(X0, X0 + 0.44, 0.82, 0.85, -2.32, -0.48); sbt.finish()
    lathe_obj('thermos', [(0.0, 0.0), (0.09, 0.0), (0.095, 0.3), (0.07, 0.34), (0.05, 0.36), (0.0, 0.37)], M['red_stool'], (X0 + 0.22, 0.85, -2.0), seg=24)
    tb_ = Mesh('tissue', M['plate']); tb_.box(X0 + 0.1, X0 + 0.34, 0.85, 0.93, -1.0, -0.78); tb_.finish()
    cal = Image.new('RGB', (420, 1200), (240, 234, 220)); dd = ImageDraw.Draw(cal); fz = ImageFont.truetype(FONT, 200)
    for k, ch in enumerate('家和萬事興'): dd.text((210, 140 + k * 225), ch, fill=(30, 26, 24), font=fz, anchor='mm')
    dd.rectangle([0, 0, 419, 1199], outline=(150, 120, 80), width=14); cp = os.path.join(TMP, 'calligraphy.png'); cal.save(cp)
    xs2 = X0 + 0.02
    uvquad('calligraphy', (xs2, 1.05, -1.15), (xs2, 1.05, -1.65), (xs2, 2.45, -1.65), (xs2, 2.45, -1.15), img_mat('calligraphy', cp, 0.0))
    clk = Image.new('RGBA', (400, 400), (0, 0, 0, 0)); dd = ImageDraw.Draw(clk); dd.ellipse([8, 8, 392, 392], fill=(246, 244, 238), outline=(60, 50, 40), width=18)
    for k in range(12): a_ = k / 12 * 6.28; dd.line([(200 + 150 * math.sin(a_), 200 - 150 * math.cos(a_)), (200 + 170 * math.sin(a_), 200 - 170 * math.cos(a_))], fill=(40, 36, 32), width=8)
    dd.line([(200, 200), (200 + 90 * math.sin(4.0), 200 - 90 * math.cos(4.0))], fill=(30, 26, 24), width=12); dd.line([(200, 200), (200 + 140 * math.sin(1.2), 200 - 140 * math.cos(1.2))], fill=(30, 26, 24), width=8)
    ckp = os.path.join(TMP, 'clock.png'); clk.save(ckp)
    uvquad('clock', (xs2 + 0.01, 2.02, -2.28), (xs2 + 0.01, 2.02, -2.62), (xs2 + 0.01, 2.36, -2.62), (xs2 + 0.01, 2.36, -2.28), cutout_mat('clock', ckp))
    # 鞋櫃（門邊）
    sh = Mesh('shoe_cabinet', M['wood_l']); sh.box(X0, X0 + 0.38, 0, 1.0, DOOR[1] + 0.35, DOOR[1] + 1.25); sh.finish()
    # ---- 電視櫃（北牆右邊）＋電視（除夕特別節目：亮的畫面）＋一盤橘子＋盆栽；沙發在電視對面（東側、背對鏡頭的一角）
    tvc = Mesh('tv_cabinet', M['wood_l']); tvc.box(1.2, 3.4, 0, 0.5, Z0, Z0 + 0.45); tvc.finish()
    tvb = Mesh('tv', M['tv']); tvb.box(1.55, 3.05, 0.62, 1.48, Z0 + 0.12, Z0 + 0.17); tvb.box(2.2, 2.4, 0.5, 0.62, Z0 + 0.1, Z0 + 0.25); tvb.finish()
    tvimg = Image.new('RGB', (640, 360)); dd = ImageDraw.Draw(tvimg)
    for y in range(360): dd.line([(0, y), (640, y)], fill=(int(150 + 60 * y / 360), int(30 + 20 * y / 360), int(40 + 10 * y / 360)))
    for k in range(40): cx, cy = rng.randrange(640), rng.randrange(200); dd.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=(255, 210, 120))
    dd.rectangle([0, 300, 640, 360], fill=(110, 18, 24)); tvp = os.path.join(TMP, 'tv.png'); tvimg.save(tvp)
    if VAR == 'everyday':
        tvimg = Image.new('RGB', (640, 360)); dd = ImageDraw.Draw(tvimg)
        for y in range(360): dd.line([(0, y), (640, y)], fill=(int(30 + 30 * y / 360), int(60 + 40 * y / 360), int(110 + 50 * y / 360)))
        dd.rectangle([0, 290, 640, 330], fill=(230, 230, 236)); dd.rectangle([0, 330, 640, 360], fill=(170, 30, 36)); dd.rectangle([380, 60, 600, 250], fill=(70, 100, 140)); tvimg.save(tvp)
    uvquad('tv_screen', (1.58, 0.65, Z0 + 0.175), (3.02, 0.65, Z0 + 0.175), (3.02, 1.45, Z0 + 0.175), (1.58, 1.45, Z0 + 0.175), emit_only('tv_screen', tvp, 1.6) if VAR != 'day' else M['tv'])
    lg = Mesh('ledger', M['ledger']); lg.box(1.24, 1.5, 0.5, 0.535, Z0 + 0.08, Z0 + 0.42); lg.finish()                   # 帳本（媽媽管店裡的帳，AA_12）＋計算機
    pg_ = Mesh('ledger_pages', M['paper']); pg_.box(1.245, 1.495, 0.503, 0.532, Z0 + 0.085, Z0 + 0.415); pg_.finish()
    cc = Mesh('calculator', M['calc']); cc.box(1.27, 1.45, 0.535, 0.555, Z0 + 0.12, Z0 + 0.36); cc.finish()
    lathe_obj('fruit_plate', [(0.0, 0.0), (0.12, 0.0), (0.16, 0.035), (0.155, 0.04), (0.11, 0.008), (0.0, 0.008)], M['plate'], (3.25, 0.5, Z0 + 0.25))
    for k in range(7):
        a = k / 7 * 6.28; r = 0.07 if k else 0.0; ob = lathe_obj('orange', [(0.0, 0.0), (0.035, 0.008), (0.045, 0.035), (0.035, 0.065), (0.0, 0.072)], M['orange'], (3.25 + r * math.cos(a), 0.51 + (0.05 if k == 0 else 0), Z0 + 0.25 + r * math.sin(a)), seg=16)
    sofa = Mesh('sofa', M['sofa']); sofa.box(2.55, 3.45, 0.0, 0.45, -1.6, 1.0); sofa.box(3.15, 3.45, 0.45, 0.95, -1.6, 1.0); sofa.box(2.55, 3.45, 0.45, 0.68, -1.75, -1.55); sofa.box(2.55, 3.45, 0.45, 0.68, 0.95, 1.15); sofa.finish(smooth=False)
    ct = Mesh('coffee_table', M['wood']); ct.box(1.6, 2.3, 0.36, 0.41, -1.0, 0.4); ct.box(1.62, 1.68, 0, 0.36, -0.98, -0.92); ct.box(2.22, 2.28, 0, 0.36, -0.98, -0.92); ct.box(1.62, 1.68, 0, 0.36, 0.32, 0.38); ct.box(2.22, 2.28, 0, 0.36, 0.32, 0.38); ct.finish()
    # 盆栽（電視櫃旁邊的地上）：用遊戲裡的黃金葛模型（prop_pothos.glb）
    try:
        before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=os.path.join(L.ROOT, 'assets/models/env/second_ai/prop_pothos.glb'))
        new = [o for o in bpy.data.objects if o not in before and o.parent is None]
        for o in new: o.location = g2b(3.42, 0.0, Z0 + 0.7); o.scale = (1.6, 1.6, 1.6)
    except Exception as e: print('pothos', e)
    # ---- 飯廳：大圓桌（直徑 1.5 m、轉盤）＋圍爐＋年菜；八張木椅＋兩張紅色塑膠椅（親戚多）
    TX, TZ, TR, TH = -0.9, 0.35, 0.78, 0.76
    tb = Mesh('table_top', M['wood']); bmT = L.lathe([(0.0, TH - 0.04), (TR, TH - 0.04), (TR, TH), (0.0, TH)], 48)
    tb.add_bm(bmT, __import__('mathutils').Matrix.Translation(g2b(TX, 0, TZ))); bmT.free()
    tb.cyl((TX, 0.0, TZ), (TX, TH - 0.04, TZ), 0.07, seg=16); tb.cyl((TX, 0.0, TZ), (TX, 0.03, TZ), 0.36, seg=24); tb.finish(uv=True, smooth=True)
    lathe_obj('lazy_susan', [(0.0, 0.0), (0.48, 0.0), (0.48, 0.012), (0.0, 0.012)], M['tablecloth'], (TX, TH + 0.02, TZ), seg=48)
    lathe_obj('susan_base', [(0.0, 0.0), (0.12, 0.0), (0.12, 0.02), (0.0, 0.02)], M['steel'], (TX, TH, TZ), seg=24)
    SY = TH + 0.032                                                            # 轉盤上面
    def plate_at(x, z, r=0.14, y=SY, deep=False):
        prof = [(0.0, 0.0), (r * 0.7, 0.0), (r, 0.03 if not deep else 0.06), (r * 0.97, 0.034 if not deep else 0.064), (r * 0.66, 0.008), (0.0, 0.008)]
        return lathe_obj('plate', prof, M['plate'], (x, y, z), seg=36)
    if VAR == 'cny':
        # 圍爐：電磁爐＋不鏽鋼鍋（湯是紅的、浮著料）
        ck = Mesh('induction', M['black']); ck.box(TX - 0.17, TX + 0.17, SY, SY + 0.06, TZ - 0.17, TZ + 0.17); ck.finish()
        lathe_obj('hotpot', [(0.0, 0.0), (0.15, 0.0), (0.17, 0.02), (0.18, 0.13), (0.19, 0.135), (0.175, 0.13), (0.165, 0.025), (0.0, 0.025)], M['steel'], (TX, SY + 0.06, TZ), seg=40)
        lathe_obj('soup', [(0.0, 0.0), (0.168, 0.0), (0.0, 0.0)], M['soup'], (TX, SY + 0.06 + 0.11, TZ), seg=40)
        for k in range(18):                                                       # 鍋裡的料（白菜、丸子、肉片）
            a = rng.uniform(0, 6.28); r = rng.uniform(0.02, 0.14); m = rng.choice([M['dumpling'], M['greens'], M['chicken'], M['shrimp']])
            ob = lathe_obj('hotpot_item', [(0.0, 0.0), (0.022, 0.004), (0.026, 0.014), (0.0, 0.022)], m, (TX + r * math.cos(a), SY + 0.06 + 0.105, TZ + r * math.sin(a)), seg=10)
        for k, kind in enumerate(['fish', 'chicken', 'greens', 'dumpling', 'shrimp', 'greens2']):   # 年菜繞著鍋子排一圈
            a = k / 6 * 6.28 + 0.4; x, z = TX + 0.33 * math.cos(a), TZ + 0.33 * math.sin(a); plate_at(x, z, 0.12 if kind != 'fish' else 0.15)
            y = SY + 0.012
            if kind == 'fish':                                                      # 整條魚（年年有餘）：橢圓的身體＋尾巴
                ob = lathe_obj('fish', [(0.0, 0.0), (0.035, 0.006), (0.045, 0.02), (0.03, 0.035), (0.0, 0.04)], M['fish'], (x, y, z), seg=20, scale=(2.6, 1.0, 1.0))
                ob.rotation_euler = (0, 0, a + 1.2)
                th = a + 1.2; tx_t, tz_t = x - 0.125 * math.cos(th), z + 0.125 * math.sin(th)        # 尾巴：身體後面一片扁的扇形（Blender 的 z 轉角 → 遊戲 (x,z)＝(cos, −sin)）
                ob = lathe_obj('fish_tail', [(0.0, 0.0), (0.04, 0.0), (0.04, 0.008), (0.0, 0.008)], M['fish'], (tx_t, y + 0.01, tz_t), seg=3, smooth=False, scale=(0.9, 1.5, 1.0))
                ob.rotation_euler = (0, 0, th)
            elif kind == 'chicken':
                for j in range(9):
                    ob = lathe_obj('chicken', [(0.0, 0.0), (0.03, 0.0), (0.034, 0.012), (0.0, 0.018)], M['chicken'], (x + 0.06 * math.cos(j * 0.7), y, z + 0.06 * math.sin(j * 0.7)), seg=12, scale=(1.4, 0.7, 1.0))
            elif kind in ('greens', 'greens2'):
                for j in range(14):
                    ob = lathe_obj('greens', [(0.0, 0.0), (0.025, 0.004), (0.03, 0.012), (0.0, 0.016)], M['greens'], (x + rng.uniform(-0.07, 0.07), y + rng.uniform(0, 0.02), z + rng.uniform(-0.07, 0.07)), seg=10, scale=(1.8, 1.0, 0.8))
                    ob.rotation_euler = (0, 0, rng.uniform(0, 6.28))
            elif kind == 'dumpling':
                for j in range(8):
                    ob = lathe_obj('dumpling', [(0.0, 0.0), (0.022, 0.004), (0.024, 0.016), (0.0, 0.026)], M['dumpling'], (x + 0.06 * math.cos(j * 0.78), y, z + 0.06 * math.sin(j * 0.78)), seg=12, scale=(1.5, 0.8, 1.0))
                    ob.rotation_euler = (0, 0, j * 0.78)
            elif kind == 'shrimp':
                for j in range(7):
                    ob = lathe_obj('shrimp', [(0.0, 0.0), (0.016, 0.003), (0.018, 0.012), (0.0, 0.016)], M['shrimp'], (x + 0.055 * math.cos(j * 0.9), y, z + 0.055 * math.sin(j * 0.9)), seg=10, scale=(2.2, 0.8, 1.0))
                    ob.rotation_euler = (0, 0, j * 0.9 + 1.5)
    elif VAR == 'everyday':
        # 平常的晚餐（週末回家）：四菜一湯——炒青菜、番茄炒蛋、滷肉、煎魚，中間一大碗湯
        lathe_obj('soup_bowl', [(0.0, 0.0), (0.08, 0.0), (0.14, 0.08), (0.145, 0.095), (0.138, 0.095), (0.075, 0.012), (0.0, 0.012)], M['plate'], (TX, SY, TZ), seg=40)
        lathe_obj('soup_top', [(0.0, 0.0), (0.135, 0.0), (0.0, 0.0)], M['soup_light'], (TX, SY + 0.075, TZ), seg=40)
        for j in range(10): lathe_obj('soup_item', [(0.0, 0.0), (0.02, 0.003), (0.024, 0.01), (0.0, 0.016)], rng.choice([M['greens'], M['chicken']]), (TX + rng.uniform(-0.08, 0.08), SY + 0.072, TZ + rng.uniform(-0.08, 0.08)), seg=10)
        for k, kind in enumerate(['greens', 'tomato_egg', 'braised', 'fish']):
            a = k / 4 * 6.28 + 0.75; x, z = TX + 0.32 * math.cos(a), TZ + 0.32 * math.sin(a); plate_at(x, z, 0.12 if kind != 'fish' else 0.14); y = SY + 0.012
            if kind == 'greens':
                for j in range(16):
                    ob = lathe_obj('greens', [(0.0, 0.0), (0.025, 0.004), (0.03, 0.012), (0.0, 0.016)], M['greens'], (x + rng.uniform(-0.07, 0.07), y + rng.uniform(0, 0.02), z + rng.uniform(-0.07, 0.07)), seg=10, scale=(1.8, 1.0, 0.8)); ob.rotation_euler = (0, 0, rng.uniform(0, 6.28))
            elif kind == 'tomato_egg':
                for j in range(14):
                    m = M['egg'] if j % 2 else M['tomato']
                    ob = lathe_obj('tomato_egg', [(0.0, 0.0), (0.022, 0.004), (0.026, 0.014), (0.0, 0.02)], m, (x + rng.uniform(-0.065, 0.065), y + rng.uniform(0, 0.015), z + rng.uniform(-0.065, 0.065)), seg=10, scale=(1.3, 1.0, 1.0))
            elif kind == 'braised':
                for j in range(12):
                    ob = lathe_obj('braised', [(0.0, 0.0), (0.02, 0.0), (0.022, 0.02), (0.0, 0.024)], M['braised'], (x + rng.uniform(-0.06, 0.06), y + rng.uniform(0, 0.015), z + rng.uniform(-0.06, 0.06)), seg=6, smooth=False); ob.rotation_euler = (0, 0, rng.uniform(0, 6.28))
            else:
                ob = lathe_obj('fish', [(0.0, 0.0), (0.03, 0.006), (0.04, 0.018), (0.026, 0.03), (0.0, 0.034)], M['fish'], (x, y, z), seg=20, scale=(2.4, 1.0, 1.0)); th = a + 1.2; ob.rotation_euler = (0, 0, th)
                tx_t, tz_t = x - 0.11 * math.cos(th), z + 0.11 * math.sin(th)
                ob = lathe_obj('fish_tail', [(0.0, 0.0), (0.035, 0.0), (0.035, 0.007), (0.0, 0.007)], M['fish'], (tx_t, y + 0.01, tz_t), seg=3, smooth=False, scale=(0.9, 1.5, 1.0)); ob.rotation_euler = (0, 0, th)
    else:
        # 白天：桌上收乾淨——一盤水果、茶壺和三個茶杯、一份摺起來的報紙
        plate_at(TX - 0.05, TZ + 0.05, 0.16)
        for k in range(6): a = k / 6 * 6.28; lathe_obj('orange', [(0.0, 0.0), (0.035, 0.008), (0.045, 0.035), (0.035, 0.065), (0.0, 0.072)], M['orange'], (TX - 0.05 + 0.07 * math.cos(a), SY + 0.01, TZ + 0.05 + 0.07 * math.sin(a)), seg=16)
        lathe_obj('orange', [(0.0, 0.0), (0.035, 0.008), (0.045, 0.035), (0.035, 0.065), (0.0, 0.072)], M['orange'], (TX - 0.05, SY + 0.05, TZ + 0.05), seg=16)
        lathe_obj('teapot', [(0.0, 0.0), (0.06, 0.0), (0.08, 0.04), (0.075, 0.09), (0.04, 0.11), (0.045, 0.12), (0.0, 0.125)], M['plate'], (TX + 0.28, SY, TZ - 0.12), seg=28)
        for k in range(3): lathe_obj('teacup', [(0.0, 0.0), (0.025, 0.0), (0.033, 0.045), (0.03, 0.045), (0.0, 0.006)], M['plate'], (TX + 0.36 + 0.07 * math.cos(k * 2.1), SY, TZ - 0.02 + 0.07 * math.sin(k * 2.1)), seg=20)
        np_ = Mesh('newspaper', M['paper']); np_.box(TX - 0.45, TX - 0.12, TH, TH + 0.012, TZ + 0.18, TZ + 0.42); np_.finish()
    # 每個位子（除夕：十個位子、兩張紅色塑膠椅；平常：四個人吃飯，六張椅子；白天：六張椅子、不擺碗筷）
    NSEAT = 10 if VAR == 'cny' else 6
    SETS = range(NSEAT) if VAR == 'cny' else ((0, 1, 3, 4) if VAR == 'everyday' else ())
    for k in SETS:
        a = k / NSEAT * 6.28 + 0.15; cx, cz = TX + (TR - 0.17) * math.cos(a), TZ + (TR - 0.17) * math.sin(a)
        plate_at(cx, cz, 0.085, TH)
        lathe_obj('bowl', [(0.0, 0.0), (0.035, 0.0), (0.055, 0.04), (0.058, 0.055), (0.054, 0.055), (0.03, 0.012), (0.0, 0.012)], M['plate'], (cx, TH + 0.008, cz), seg=24)
        lathe_obj('bowl_rim', [(0.056, 0.05), (0.059, 0.052), (0.059, 0.056), (0.055, 0.056)], M['bowl_blue'], (cx, TH + 0.008, cz), seg=24, smooth=False)
        if VAR == 'everyday': lathe_obj('rice', [(0.0, 0.0), (0.05, 0.0), (0.04, 0.012), (0.0, 0.02)], M['rice'], (cx, TH + 0.055, cz), seg=20)
        tx_, tz_ = -math.sin(a), math.cos(a); ox, oz = cx + 0.09 * tx_, cz + 0.09 * tz_
        chs = Mesh('chopsticks', M['chop'])
        for s in (-0.012, 0.012): chs.cyl((ox + s * math.cos(a) - 0.1 * math.cos(a), TH + 0.008, oz + s * math.sin(a) - 0.1 * math.sin(a)), (ox + s * math.cos(a) + 0.1 * math.cos(a), TH + 0.008, oz + s * math.sin(a) + 0.1 * math.sin(a)), 0.0035, seg=6)
        chs.finish(smooth=True)
        gx, gz = cx - 0.1 * tx_, cz - 0.1 * tz_
        lathe_obj('cup', [(0.0, 0.0), (0.028, 0.0), (0.032, 0.085), (0.029, 0.085), (0.025, 0.004), (0.0, 0.004)], M['glass'], (gx, TH, gz), seg=20)
        lathe_obj('cup_tea', [(0.0, 0.0), (0.026, 0.0), (0.03, 0.06), (0.0, 0.06)], M['tea'], (gx, TH + 0.004, gz), seg=20)
    # 椅子：木椅（坐墊 0.45、椅背）＋兩張紅色塑膠椅
    for k in range(NSEAT):
        a = k / NSEAT * 6.28 + 0.15; r = TR + 0.22; cx, cz = TX + r * math.cos(a), TZ + r * math.sin(a)
        if VAR == 'cny' and k in (3, 7):                                          # 紅色塑膠椅（除夕親戚多，加位子的時候從陽台搬進來的那種）
            lathe_obj('red_stool', [(0.0, 0.0), (0.16, 0.0), (0.155, 0.02), (0.13, 0.42), (0.16, 0.44), (0.16, 0.46), (0.0, 0.46)], M['red_stool'], (cx, 0.0, cz), seg=20, smooth=True)
            continue
        ch = Mesh('chair', M['wood']); w, d = 0.21, 0.21
        rot = lambda px, pz: (cx + px * math.cos(a) - pz * math.sin(a), cz + px * math.sin(a) + pz * math.cos(a))
        def rbox(px0, px1, y0, y1, pz0, pz1):
            pts = [rot(px0, pz0), rot(px1, pz0), rot(px1, pz1), rot(px0, pz1)]
            b2 = bmesh.new(); vs = [b2.verts.new(g2b(p[0], yy, p[1])) for yy in (y0, y1) for p in pts]
            for f in ((0, 1, 2, 3), (7, 6, 5, 4), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)): b2.faces.new([vs[i] for i in f])
            ch.add_bm(b2); b2.free()
        rbox(-w, w, 0.43, 0.47, -d, d)
        for px, pz in ((-w + 0.03, -d + 0.03), (w - 0.03, -d + 0.03), (-w + 0.03, d - 0.03), (w - 0.03, d - 0.03)): rbox(px - 0.02, px + 0.02, 0, 0.43, pz - 0.02, pz + 0.02)
        rbox(w - 0.04, w, 0.47, 0.95, -d + 0.01, d - 0.01)                         # 椅背在離桌子遠的那一側（+r 方向）
        ch.finish()
    # ---- 燈：餐桌上方的吊燈（暖色）＋客廳的吸頂燈；窗外的夜景自己發光
    lathe_obj('pendant_shade', [(0.05, 0.0), (0.3, -0.18), (0.31, -0.19), (0.06, -0.01)], M['lamp'], (TX, 2.32, TZ), seg=40)
    cord = Mesh('pendant_cord', M['black']); cord.cyl((TX, 2.32, TZ), (TX, HT, TZ), 0.005, seg=6); cord.finish()
    if VAR != 'day':
        point_light('pendant', TX, 2.08, TZ, 160, (1.0, 0.82, 0.6), 0.12)
        area_light('table_fill', TX, 2.0, TZ, 0.6, 0.6, 90, (1.0, 0.85, 0.66))
    else:                                                                       # 白天：燈關著；窗戶進來的天光（窗外一片大的面光朝屋裡）＋一點陽光
        wl_ = area_light('window_sky', (WIN[0] + WIN[1]) / 2, (WIN[2] + WIN[3]) / 2, Z0 - 0.7, WIN[1] - WIN[0], WIN[3] - WIN[2], 900, (0.92, 0.96, 1.0)); wl_.rotation_euler = (math.radians(90), 0, 0)
        sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 2.2; sun.color = (1.0, 0.95, 0.86); so = bpy.data.objects.new('sun', sun); so.rotation_euler = (math.radians(55), 0, math.radians(200)); sc.collection.objects.link(so)
    lathe_obj('ceiling_lamp', [(0.0, 0.0), (0.32, 0.0), (0.3, -0.06), (0.0, -0.07)], M['lamp'], (2.1, HT, -1.2), seg=40)
    if VAR != 'day': area_light('living_light', 2.1, HT - 0.1, -1.2, 0.6, 0.6, 140, (1.0, 0.92, 0.82))
    area_light('fill_cam', 1.2, 2.3, 2.6, 2.0, 1.0, 70 if VAR != 'day' else 110, (1.0, 0.9, 0.8) if VAR != 'day' else (0.95, 0.97, 1.0))
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.01, 0.012, 0.02, 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.3 if VAR != 'day' else 1.0
    camera((1.05, 1.62, 2.45), (-1.15, 0.62, -0.45), float(opt('--lens', '22')))   # 從客廳這一側斜看飯桌：桌上的年菜在畫面中下、左邊大門春聯、後面窗

# ================================================================ 陽台（除夕晚上，姊姊那一幕）
elif SCENE == 'balcony':
    # 臺北公寓的前陽台：寬 1.4 m、長 4.6 m。北側（−z）＝外面：矮牆＋欄杆＋外推的白色鐵窗，外面是對面公寓的燈；
    # 南側（+z）＝屋裡：落地鋁拉門（開著一半，看得到暖色燈光的客廳）、牆上的熱水器；東邊盡頭一台洗衣機，頭上一支曬衣桿掛著衣服；
    # 盆栽、疊起來的紅色塑膠椅（除夕搬進去加位子的那幾張剩下的）。
    X0, X1, Z0, Z1, HT = -2.3, 2.3, -0.7, 0.7, 2.7
    M = {
        'floor': L.pbr('bal_floor', 'granite_tile_03', tile=0.5, target='#b9b3a8', normal=0.3, maps=('diff', 'nor'), rough_value=0.6),
        'wall': L.pbr('bal_wall', 'granular_concrete', tile=1.2, target='#d9d3c6', normal=0.2, maps=('diff', 'nor'), rough_value=0.9),
        'tile': L.flat('bal_tile', '#c9bfae', rough=0.5),
        'ceil': L.flat('bal_ceil', '#e8e4dc', rough=0.9),
        'alu': L.flat('bal_alu', '#b9bec2', rough=0.35, metal=0.45),
        'glass': L.flat('bal_glass', '#c9d6dc', rough=0.04, alpha=0.18),
        'grille': L.flat('bal_grille', '#e8e6e0', rough=0.5, metal=0.2),
        'steel': L.flat('bal_steel', '#c8ccd0', rough=0.18, metal=0.45),
        'washer': L.flat('bal_washer', '#eeeeea', rough=0.3),
        'black': L.flat('bal_black', '#18191b', rough=0.4),
        'pot': L.flat('bal_pot', '#9a5a3a', rough=0.7),
        'leaf': L.flat('bal_leaf', '#2f5a2a', rough=0.6),
        'red_stool': L.flat('bal_stool', '#c9302a', rough=0.45),
        'heater': L.flat('bal_heater', '#e9e7e2', rough=0.35),
        'room': L.flat('bal_room', '#f0dcb8', rough=0.9, emit=B.srgb('#ffd9a0')),
        'lamp': L.flat('bal_lamp', '#fff3dc', rough=0.4, emit=B.srgb('#ffe2b0')),
    }
    CLOTH = ['#5b7fa6', '#e8e4dc', '#8c3b47', '#2f3a44', '#c9b48f', '#7a9a5a']
    fl = Mesh('floor', M['floor']); fl.box(X0, X1, -0.02, 0.0, Z0, Z1); fl.finish()
    ce = Mesh('ceiling', M['ceil']); ce.box(X0, X1, HT, HT + 0.05, Z0 - 0.3, Z1); ce.finish(uv=False)
    # 南牆（屋裡那一側）：磁磚腰牆＋落地拉門（x −1.6～0.4，開著一半）＋熱水器
    DX0, DX1 = -1.6, 0.4
    wl = Mesh('wall_s', M['wall']); wl.box(X0, DX0, 0, HT, Z1, Z1 + 0.15); wl.box(DX1, X1, 0, HT, Z1, Z1 + 0.15); wl.box(DX0, DX1, 2.2, HT, Z1, Z1 + 0.15); wl.finish()
    wl2 = Mesh('wall_ends', M['wall']); wl2.box(X0 - 0.15, X0, 0, HT, Z0 - 0.3, Z1 + 0.15); wl2.box(X1, X1 + 0.15, 0, HT, Z0 - 0.3, Z1 + 0.15); wl2.finish()
    tl = Mesh('wainscot', M['tile']); tl.box(DX1, X1, 0, 0.9, Z1 - 0.01, Z1); tl.box(X0, DX0, 0, 0.9, Z1 - 0.01, Z1); tl.finish()
    fr = Mesh('door_frame', M['alu']); zd = Z1 + 0.06
    for xa in (DX0, (DX0 + DX1) / 2, DX1): fr.box(xa - 0.03, xa + 0.03, 0, 2.2, zd - 0.04, zd + 0.04)
    fr.box(DX0, DX1, 2.17, 2.22, zd - 0.04, zd + 0.04); fr.box(DX0, DX1, 0, 0.04, zd - 0.05, zd + 0.05); fr.finish()
    xm = (DX0 + DX1) / 2
    uvquad('door_glass', (xm, 0.04, zd + 0.02), (DX1, 0.04, zd + 0.02), (DX1, 2.17, zd + 0.02), (xm, 2.17, zd + 0.02), M['glass'])      # 一扇關著（玻璃）、一扇推開（看得到屋裡）
    # 屋裡：暖色的客廳（一片發光的牆＋天花板燈＋窗簾的影子）——只看得到一點
    rm = Mesh('room', M['room']); rm.box(DX0 - 0.6, DX1 + 0.6, 0, 2.6, Z1 + 2.6, Z1 + 2.7); rm.finish()
    rmf = Mesh('room_floor', L.flat('bal_room_floor', '#d9cdb8', rough=0.3)); rmf.box(DX0 - 0.6, DX1 + 0.6, -0.01, 0.0, Z1 + 0.15, Z1 + 2.6); rmf.finish()
    rms = Mesh('room_sides', L.flat('bal_room_side', '#e9dcc6', rough=0.9)); rms.box(DX0 - 0.7, DX0 - 0.6, 0, 2.6, Z1 + 0.15, Z1 + 2.6); rms.box(DX1 + 0.6, DX1 + 0.7, 0, 2.6, Z1 + 0.15, Z1 + 2.6); rms.finish()
    point_light('room_light', xm, 2.3, Z1 + 1.4, 220, (1.0, 0.82, 0.58), 0.3)
    chs = Mesh('room_chairs', L.flat('bal_room_chair', '#7a5236', rough=0.5))
    for cx_ in (-1.2, -0.5, 0.2): chs.box(cx_, cx_ + 0.4, 0, 0.45, Z1 + 1.6, Z1 + 2.0); chs.box(cx_, cx_ + 0.4, 0.45, 0.95, Z1 + 1.96, Z1 + 2.0)
    chs.box(-1.5, 0.6, 0.72, 0.76, Z1 + 1.0, Z1 + 1.65); chs.finish()                       # 屋裡的桌子一角、椅背（除夕那一桌）
    # 熱水器（牆上，門的右邊）
    ht = Mesh('water_heater', M['heater']); ht.box(1.0, 1.42, 1.3, 1.95, Z1 - 0.22, Z1); ht.finish()
    hp = Mesh('heater_pipes', M['steel']); hp.cyl((1.1, 1.3, Z1 - 0.1), (1.1, 0.6, Z1 - 0.1), 0.012, seg=8); hp.cyl((1.3, 1.3, Z1 - 0.1), (1.3, 0.6, Z1 - 0.1), 0.012, seg=8); hp.cyl((1.21, 1.95, Z1 - 0.1), (1.21, 2.5, Z1 - 0.1), 0.04, seg=12); hp.finish(smooth=True)
    # 北側（外面）：矮牆＋扶手＋外推的白色鐵窗（到天花板）
    pw = Mesh('parapet', M['wall']); pw.box(X0, X1, 0, 1.0, Z0 - 0.15, Z0); pw.finish()
    cap = Mesh('parapet_cap', M['tile']); cap.box(X0, X1, 1.0, 1.04, Z0 - 0.2, Z0 + 0.03); cap.finish()
    gr = Mesh('grille', M['grille']); zg = Z0 - 0.35
    for k in range(int((X1 - X0) / 0.12) + 1): gr.box(X0 + k * 0.12 - 0.008, X0 + k * 0.12 + 0.008, 1.04, HT, zg - 0.008, zg + 0.008)
    for yy in (1.04, 1.7, 2.3, HT - 0.02): gr.box(X0, X1, yy - 0.012, yy + 0.012, zg - 0.012, zg + 0.012)
    gr.box(X0, X1, 1.03, 1.05, zg, Z0 - 0.15); gr.finish()
    vp = night_city(os.path.join(TMP, 'night_city_bal.png'), seed=11)
    uvquad('night_view', (-16, -6.0, -14), (16, -6.0, -14), (16, 10.0, -14), (-16, 10.0, -14), emit_only('night_view', vp, 1.0))
    # 曬衣桿＋衣服（一排衣架，T 恤、襯衫、毛巾）
    rod = Mesh('laundry_rod', M['steel']); rod.cyl((X0, 2.3, -0.25), (X1, 2.3, -0.25), 0.014, seg=10); rod.finish(smooth=True)
    for k in range(9):
        x = -1.9 + k * 0.42 + rng.uniform(-0.05, 0.05); col = L.flat(f'cloth{k}', CLOTH[k % len(CLOTH)], rough=0.9)
        hg = Mesh('hanger', M['black']); hg.cyl((x - 0.18, 2.12, -0.25), (x, 2.24, -0.25), 0.004, seg=5); hg.cyl((x + 0.18, 2.12, -0.25), (x, 2.24, -0.25), 0.004, seg=5); hg.cyl((x, 2.24, -0.25), (x, 2.3, -0.25), 0.004, seg=5); hg.finish()
        cl = Mesh('cloth', col); w = rng.uniform(0.3, 0.38); hgt = rng.uniform(0.5, 0.7)
        if k % 3 == 2: cl.box(x - 0.16, x + 0.16, 2.12 - 0.75, 2.12, -0.26, -0.24)                    # 毛巾
        else:
            cl.box(x - w / 2, x + w / 2, 2.12 - hgt, 2.12, -0.27, -0.23); cl.box(x - w / 2 - 0.1, x - w / 2, 2.12 - 0.2, 2.12, -0.27, -0.23); cl.box(x + w / 2, x + w / 2 + 0.1, 2.12 - 0.2, 2.12, -0.27, -0.23)
        cl.finish()
    # 東邊盡頭：洗衣機（上掀式）＋洗衣精；西邊：盆栽、疊起來的紅色塑膠椅
    wm = Mesh('washer', M['washer']); wm.box(1.55, 2.25, 0, 0.95, -0.35, 0.35); wm.finish()
    wl_ = Mesh('washer_lid', M['black']); wl_.box(1.62, 2.18, 0.95, 0.97, -0.28, 0.2); wl_.box(1.6, 2.2, 0.85, 0.95, 0.28, 0.36); wl_.finish()
    lathe_obj('detergent', [(0.0, 0.0), (0.07, 0.0), (0.07, 0.2), (0.03, 0.25), (0.0, 0.26)], L.flat('bal_det', '#3a6fb0', rough=0.3), (1.75, 0.97, 0.15), seg=16)
    for k, (x, z, s_) in enumerate(((-0.9, -0.42, 1.0), (-0.45, -0.45, 0.8), (0.95, -0.45, 0.9))):   # 盆栽沿著矮牆（鏡頭在西邊盡頭，放在看得到的地方）
        lathe_obj('pot', [(0.0, 0.0), (0.11, 0.0), (0.15, 0.25), (0.16, 0.27), (0.0, 0.27)], M['pot'], (x, 0.0, z), seg=20, scale=(s_, s_, s_))
        for j in range(16):
            a_ = rng.uniform(0, 6.28); r_ = rng.uniform(0.0, 0.12) * s_
            ob = lathe_obj('leaf', [(0.0, 0.0), (0.04, 0.0), (0.05, 0.02), (0.0, 0.03)], M['leaf'], (x + r_ * math.cos(a_), 0.27 * s_ + rng.uniform(0.0, 0.35) * s_, z + r_ * math.sin(a_)), seg=6, scale=(1.0, 2.2, 0.4))
            ob.rotation_euler = (rng.uniform(-0.6, 0.6), rng.uniform(-0.6, 0.6), rng.uniform(0, 6.28))
    for k in range(3): lathe_obj('red_stool', [(0.0, 0.0), (0.16, 0.0), (0.155, 0.02), (0.13, 0.42), (0.16, 0.44), (0.16, 0.46), (0.0, 0.46)], M['red_stool'], (1.15, 0.05 * k, 0.42), seg=20)   # 拉門旁邊、熱水器下面
    # 燈：陽台的吸頂燈（白，關著——只有屋裡和外面的光）；外面城市的夜光＋一點月光
    lathe_obj('bal_lamp', [(0.0, 0.0), (0.15, 0.0), (0.14, -0.05), (0.0, -0.06)], M['lamp'], (0.0, HT, 0.0), seg=24)
    area_light('bal_fill', 0.0, HT - 0.1, 0.0, 0.5, 0.5, 45, (1.0, 0.92, 0.82))
    area_light('city_glow', 0.0, 1.8, -2.5, 4.0, 2.0, 60, (0.75, 0.82, 1.0)).rotation_euler = (math.radians(-90), 0, 0)
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.02, 0.025, 0.045, 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.4
    camera((-2.1, 1.5, 0.45), (1.2, 1.25, -0.45), float(opt('--lens', '20')))   # 從西邊盡頭往東看：左邊鐵窗外的夜景、右邊開著的拉門（屋裡的燈）、盡頭洗衣機、頭上曬的衣服

sc.render.filepath = os.path.abspath(OUT); sc.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)
print('rendered', OUT, SCENE, RW, RH, SAMPLES)
