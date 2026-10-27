"""美國交換：校外學生公寓社區的單人房（SCN-US-01；大三下，D47）→ GLB。LAWWW2-B 2026-10-16。Blender 5.2：
  /opt/blenv/bin/python tools/blender/env_second/us_apartment.py [-- --out assets/models/env/second_ai/us_apartment.glb]
配置：src/data/us_apartment_layout.js v2（房間、牆、開口、門、窗、家具；照使用者 2026-10-16 的三張照片：docs/art-rebuild/second_ai/research/us_apartment_photos.md）。
座標＝配置的座標（x 東、z 南、y 上；地板 0、天花板 2.6）。
- 房間：客廳、廚房、走道是紅棕色木紋地板；臥室、衣物間是米灰色地毯；衛浴是白色磁磚。牆暖米色、白色踢腳板和門框、白色六格門板。
- 開口照配置：客廳北牆的窗（白百葉＋黑白圓圈圖案的落地窗簾、黑色窗簾桿）、陽台的單扇玻璃門（內側百葉）、臥室北窗；
  廚房朝客廳的窗口（下緣 1.05、上緣 2.05）；開著的門口（大門、臥室）門板開著靠牆；關著的門（衛浴、衣物間、衣帽櫃）門板關著；洗衣機櫃是百葉摺門。
- 家具（照 furniture 擺，節點都在 furniture 群組底下）：客廳＝AA-B 的 ART-US1（us_living_props.glb）、廚房＝AA-B 的 ART-US2（us_kitchen_props.glb）、
  臥室＝BB-B 的 ART-US3（us_bedroom_props.glb）。衛浴（浴缸、馬桶、洗手台）現在是這裡做的簡單版，AA-B 的 ART-US4 交件以後換掉。
- 戶外：陽台（內凹、咖啡色木欄杆、兩張椅子）、樓梯平台（屋頂、白柱子、白鐵欄杆、往下的樓梯第一段、壁燈、隔壁 213 的門）、外牆是灰褐色橫向壁板。
- 窗外：社區的停車場、對面同樣的壁板公寓、遠一點的樹林（貼圖）；SEASON_SNOW_on／off 兩套（1～3 月雪景／4～6 月春天），遊戲照名字切換。
會淡出的牆：WALL_<id>_*（props dir＝配置的 dir；隔間另加 partition＝1；南牆 WALL_S_* 另加 inside＝1：玩家在屋裡時才淡出）。天花板朝下的單面。不放社區名、校名、校徽、真的門牌（D77；門牌 213、214 是虛構的）。"""
import json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
# 同一支腳本做兩個單位（LAWWW2-C 2026-10-17 模板化）：祐廷的單人戶（預設）、學姊的 C 棟合租戶（--layout src/data/us_shared_layout.js --const US_SHARED_LAYOUT --root us_shared --out …/us_shared.glb）
LAYPATH, LAYCONST, ROOTNAME = arg('--layout', 'src/data/us_apartment_layout.js'), arg('--const', 'US_APARTMENT_LAYOUT'), arg('--root', 'us_apartment')
src = open(os.path.join(L.ROOT, LAYPATH), encoding='utf-8').read()
LAY = json.loads(src[src.rindex('const %s=' % LAYCONST) + len('const %s=' % LAYCONST):].rstrip().rstrip(';'))
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/%s.glb' % ROOTNAME)); GEN = os.path.join(HERE, 'textures', 'gen')
H, T = LAY['ceilY'], LAY['wallT']; U = LAY['unit']
random.seed(47)
B.reset(texres=512)
root = B.group(ROOTNAME, props={'kind': ROOTNAME, 'layout': LAY['version']})


def img_mat(name, fn, rough=0.6, emit=0.0, alpha=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    if alpha:
        nt.links.new(tx.outputs['Alpha'], bs.inputs['Alpha'])
        try: m.surface_render_method = 'BLENDED'
        except Exception: pass
    return m


# ======================== 貼圖（程式產生） ========================
def tex_curtain(path):   # 黑白圓圈圖案的落地窗簾（照片一）
    W = 512; im = Image.new('RGB', (W, W), (238, 236, 230)); d = ImageDraw.Draw(im)
    for j in range(4):
        for i in range(4):
            cx, cy = i * 128 + (64 if j % 2 else 0), j * 128 + 64
            for r_ in (46, 30): d.ellipse([cx - r_, cy - r_, cx + r_, cy + r_], outline=(28, 28, 30), width=7)
    im.save(path)
def tex_view(path, snow, W=1600, Hh=800, seed=7):   # 窗外：停車場、對面的壁板公寓、樹林
    r = random.Random(seed); im = Image.new('RGB', (W, Hh)); d = ImageDraw.Draw(im)
    for y in range(Hh): t = y / Hh; d.line([(0, y), (W, y)], fill=(int(176 + 40 * t), int(200 + 26 * t), int(228 + 14 * t)) if not snow else (int(196 + 30 * t), int(204 + 26 * t), int(214 + 20 * t)))
    for x in range(0, W, 9):   # 遠的樹林（冬天光禿的灰褐、春天嫩綠）
        h_ = r.randint(150, 230); col = (r.randint(120, 150), r.randint(110, 130), r.randint(100, 115)) if snow else (r.randint(70, 110), r.randint(120, 160), r.randint(60, 90))
        d.ellipse([x - 22, Hh * 0.52 - h_, x + 22, Hh * 0.52 + 20], fill=col)
    d.rectangle([0, Hh * 0.52, W, Hh * 0.72], fill=(96, 112, 84) if not snow else (226, 230, 236))   # 樹林底下到停車場之間：草地（雪天：積雪）；不然這一段是天空的顏色、會被當成天空挖空
    for bx0, bx1, top in ((60, 640, 250), (760, 1500, 230)):   # 對面的公寓：灰褐色壁板、白色窗框、斜屋頂
        d.rectangle([bx0, top, bx1, Hh * 0.72], fill=(142, 132, 118))
        for yy in range(top, int(Hh * 0.72), 9): d.line([(bx0, yy), (bx1, yy)], fill=(128, 118, 106), width=2)
        d.polygon([(bx0 - 20, top), ((bx0 + bx1) / 2, top - 90), (bx1 + 20, top)], fill=(78, 70, 64) if not snow else (236, 238, 242))
        for fy in (top + 40, top + 150):
            for fx in range(bx0 + 40, bx1 - 80, 130): d.rectangle([fx, fy, fx + 70, fy + 70], fill=(244, 244, 240)); d.rectangle([fx + 6, fy + 6, fx + 64, fy + 64], fill=(70, 84, 98))
    d.rectangle([0, Hh * 0.72, W, Hh], fill=(92, 92, 96) if not snow else (232, 236, 240))   # 停車場（雪天：積雪）
    for k in range(9):   # 車
        cx = 80 + k * 175 + r.randint(-20, 20); cy = int(Hh * 0.8); c = r.choice([(170, 30, 32), (40, 50, 70), (200, 200, 205), (30, 30, 34), (120, 124, 128)])
        d.rounded_rectangle([cx - 60, cy - 28, cx + 60, cy + 14], 12, fill=c); d.rounded_rectangle([cx - 38, cy - 50, cx + 34, cy - 24], 10, fill=tuple(int(v * 0.8) for v in c))
        if snow: d.rounded_rectangle([cx - 40, cy - 56, cx + 36, cy - 46], 6, fill=(240, 242, 246))
    # 天空的部分透明（2026-10-17）：遊戲照時段畫的天空（黃昏是橘紅、晚上是暗藍）從景的上面、窗外透出來；
    # 原本整張不透明：樓梯平台朝南的景上半是白天的淡藍、景外面是黃昏的橘紅，接不起來（合租戶截圖）
    sky = lambda y: (int(176 + 40 * y / Hh), int(200 + 26 * y / Hh), int(228 + 14 * y / Hh)) if not snow else (int(196 + 30 * y / Hh), int(204 + 26 * y / Hh), int(214 + 20 * y / Hh))
    px = im.load(); mk = Image.new('L', (W, Hh), 255); mp = mk.load()
    for y in range(int(Hh * 0.72)):
        c = sky(y)
        for x in range(W):
            if px[x, y] == c: mp[x, y] = 0
    rgb = im.filter(ImageFilter.GaussianBlur(1.6)); rgb.putalpha(mk.filter(ImageFilter.GaussianBlur(1.2))); rgb.save(path)
def tex_blinds(path):   # 白色百葉（一片一片的橫條，中間透一點光）
    im = Image.new('RGBA', (64, 256), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for y in range(0, 256, 8): d.rectangle([0, y, 63, y + 5], fill=(246, 246, 242, 255))
    im.save(path)
def tex_siding(path):   # 灰褐色橫向壁板（lap siding；外觀照片）：一公尺六片，每片下緣一條陰影線、木紋淡淡的
    W = 512; r = random.Random(3); im = Image.new('RGB', (W, W)); d = ImageDraw.Draw(im); bh = W // 6
    for k in range(6):
        y0 = k * bh; base = (146 + r.randint(-4, 4), 136 + r.randint(-4, 4), 122 + r.randint(-4, 4))
        for y in range(bh): t = y / bh; d.line([(0, y0 + y), (W, y0 + y)], fill=tuple(int(c * (0.9 + 0.12 * t)) for c in base))
        d.line([(0, y0 + bh - 3), (W, y0 + bh - 3)], fill=(92, 84, 74), width=4)
        for _ in range(14): x = r.randint(0, W); d.line([(x, y0 + 4), (x + r.randint(40, 160), y0 + 4 + r.randint(-2, 2))], fill=tuple(int(c * 0.95) for c in base), width=1)
    im.filter(ImageFilter.GaussianBlur(0.6)).save(path)
tex_siding(os.path.join(GEN, 'us_siding.png'))
os.makedirs(GEN, exist_ok=True)
tex_curtain(os.path.join(GEN, 'us_curtain.png')); tex_view(os.path.join(GEN, 'us_view_spring.png'), False); tex_view(os.path.join(GEN, 'us_view_snow.png'), True); tex_blinds(os.path.join(GEN, 'us_blinds.png'))

P = 'usa_'
M = {
    'wood': L.pbr(P + 'wood_floor', 'laminate_floor_02', tile=1.6, target='#cfb796', normal=0.4, maps=('diff', 'nor', 'rough'), rough_value=0.45),   # 地板改淺色（使用者 10-23：不要深色木地板，整個遊戲都不要；ART-NO-DARK-WOOD-1023）
    'carpet': L.pbr(P + 'carpet', 'dirty_carpet', tile=1.2, target='#b3aba0', sat=0.1, normal=0.5, maps=('diff', 'nor')),   # sat 0.1：原貼圖的黃色斜紋（毛髮、污漬）在米灰地毯上太明顯
    'tile': L.pbr(P + 'bath_tile', 'rounded_square_tiled_wall', tile=0.6, target='#e8e6e0', normal=0.4, maps=('diff', 'nor'), rough_value=0.3),
    'wall': L.pbr(P + 'wall', 'painted_plaster_wall', tile=2.5, target='#e3d3b4', normal=0.15, maps=('diff', 'nor')),
    'wall_k': L.pbr(P + 'wall_kitchen', 'painted_plaster_wall', tile=2.5, target='#ece3cf', normal=0.15, maps=('diff', 'nor')),
    'siding': img_mat(P + 'siding', 'us_siding.png', rough=0.7),
    'concrete': L.pbr(P + 'concrete', 'concrete_floor_painted', tile=1.5, target='#c2bfb8', sat=0.0, normal=0.3, maps=('diff', 'nor')),   # sat 0：原貼圖剝落的藍色油漆在陽台地上一塊一塊藍
    'backsplash': L.pbr(P + 'backsplash', 'long_white_tiles', tile=0.5, target='#d8d2c4', normal=0.4, maps=('diff', 'nor'), rough_value=0.25),
    'ceil': L.flat(P + 'ceiling', '#f1efea', rough=0.9, cull=True),
    'trim': L.flat(P + 'trim', '#f4f2ec', rough=0.4), 'door': L.flat(P + 'door', '#f2f0ea', rough=0.35),
    'black': L.flat(P + 'black', '#1d1e20', rough=0.4), 'chrome': L.flat(P + 'chrome', '#c9cbcd', rough=0.25, metal=0.4),
    'glass': L.flat(P + 'glass', '#a9bccb', rough=0.04, alpha=0.2), 'mirror': L.flat(P + 'mirror', '#c8d2d8', rough=0.03, metal=0.4),
    'porcelain': L.flat(P + 'porcelain', '#f6f6f3', rough=0.15), 'rail_wood': L.flat(P + 'rail_wood', '#6a4630', rough=0.6),
    'rail_white': L.flat(P + 'rail_white', '#efefea', rough=0.4), 'roof': L.flat(P + 'roof_soffit', '#d9d6cf', rough=0.8),
    'curtain': img_mat(P + 'curtain', 'us_curtain.png', rough=0.85), 'blinds': img_mat(P + 'blinds', 'us_blinds.png', rough=0.6, alpha=True),
    'view_spring': img_mat(P + 'view_spring', 'us_view_spring.png', rough=1.0, emit=1.0, alpha=True), 'view_snow': img_mat(P + 'view_snow', 'us_view_snow.png', rough=1.0, emit=1.0, alpha=True),
    'sconce': L.flat(P + 'sconce', '#fff1d6', rough=0.3, emit=B.srgb('#ffe2b0')), 'plate': L.flat(P + 'plate', '#2a2c30', rough=0.4),
}
_acc = {}
def acc(k):
    if k not in _acc: _acc[k] = Mesh(P + k, M[k])
    return _acc[k]
walls = {}
def wm(wid, key):
    walls.setdefault(wid, {})
    if key not in walls[wid]: walls[wid][key] = Mesh(f'{wid}_{key}', M[key])
    return walls[wid][key]
WALLDEF = {w['id']: w for w in LAY['walls'][0]['list']}
DOOR_WALL = {'front': 'S', 'bedroom': 'bed_w', 'bedA': 'bed_w', 'bedB': 'bed_w', 'bedC': 'lau_w', 'bath': 'bath_n', 'coat': 'lau_w', 'storage': 'lau_w', 'closet': 'bath_n', 'laundry': 'lau_w'}
def door_wall(d):
    """門在哪一面牆（門板、門框、門上的裝飾都放進這面牆的組：牆淡出時一起淡出）。合租戶的臥室 C（x −0.2、z 1.4）在 lau_w 上——
    原本對照表沒有 bedC、預設成南牆 S：C 門門板跟著南牆淡出（2026-10-21 BB_218 補拍時一起查到）"""
    return DOOR_WALL.get(d['id'], 'S')

# ======================== 地板、天花板 ========================
FLOORMAT = {'wood': 'wood', 'carpet': 'carpet', 'tile': 'tile'}
for r in LAY['rooms']:
    acc(FLOORMAT[r['floor']]).quad([(r['x0'], 0.0, r['z1']), (r['x1'], 0.0, r['z1']), (r['x1'], 0.0, r['z0']), (r['x0'], 0.0, r['z0'])])
    acc('ceil').quad([(r['x0'], H, r['z0']), (r['x1'], H, r['z0']), (r['x1'], H, r['z1']), (r['x0'], H, r['z1'])])
BAL, BW = LAY['balcony'], LAY['breezeway']
acc('concrete').quad([(BAL['x0'], 0.0, BAL['z1']), (BAL['x1'], 0.0, BAL['z1']), (BAL['x1'], 0.0, BAL['z0']), (BAL['x0'], 0.0, BAL['z0'])])
acc('concrete').quad([(BW['x0'], 0.0, BW['z1']), (BW['x1'], 0.0, BW['z1']), (BW['x1'], 0.0, BW['z0']), (BW['x0'], 0.0, BW['z0'])])

# ======================== 牆（照配置；開口：窗、門、窗口） ========================
def wall_seg(w, a, b_, y0, y1, key='wall', inside_only=False):
    """一段牆（沿 w 的軸 a～b_、高 y0～y1、厚 T，中心在 w['at']）。外牆的外面一層用壁板"""
    at = w['at']; t2 = T / 2
    if w['axis'] == 'x':
        wm(w['id'], key).box(a, b_, y0, y1, at - t2, at + t2)
    else:
        wm(w['id'], key).box(at - t2, at + t2, y0, y1, a, b_)
OUTER = {'N': (0, 0, -1), 'S': (0, 0, 1), 'W': (-1, 0, 0), 'E': (1, 0, 0)}
DOOR_H = 2.05
for w in LAY['walls'][0]['list']:
    opens = sorted(w.get('open', []), key=lambda o: o[0]); cur = w['from']
    key = 'wall_k' if w['id'] in ('kit_n', 'kit_e', 'lau_w') else 'wall'
    for (a, b_, kind) in opens:
        if a > cur: wall_seg(w, cur, a, 0.0, H, key)
        if kind == 'window': sill, head = 0.9, 2.1
        elif kind == 'passThrough': sill, head = w.get('sill', 1.05), w.get('head', 2.05)
        else: sill, head = 0.0, DOOR_H
        if sill > 0: wall_seg(w, a, b_, 0.0, sill, key)
        wall_seg(w, a, b_, head, H, key); cur = b_
    if cur < w['to']: wall_seg(w, cur, w['to'], 0.0, H, key)
    if w['id'] in OUTER:   # 外牆外面一層灰褐色壁板（陽台、樓梯平台看得到）
        dx, _, dz = OUTER[w['id']]; at = w['at']
        for (a, b_, y0, y1) in [(w['from'], w['to'], 0.0, H + 0.4)]:
            if w['axis'] == 'x': wm(w['id'], 'siding').quad(([(a, y0, at + dz * (T / 2 + 0.01)), (b_, y0, at + dz * (T / 2 + 0.01)), (b_, y1, at + dz * (T / 2 + 0.01)), (a, y1, at + dz * (T / 2 + 0.01))])[::(1 if dz > 0 else -1)])
            else: wm(w['id'], 'siding').quad(([(at + dx * (T / 2 + 0.01), y0, b_), (at + dx * (T / 2 + 0.01), y0, a), (at + dx * (T / 2 + 0.01), y1, a), (at + dx * (T / 2 + 0.01), y1, b_)])[::(1 if dx > 0 else -1)])
# 踢腳板（每個房間沿牆；簡化：每段牆兩面各一條，開口處不做）
for w in LAY['walls'][0]['list']:
    opens = [(a, b_) for (a, b_, k) in w.get('open', []) if k not in ('window', 'passThrough')]
    segs, cur = [], w['from']
    for (a, b_) in sorted(opens):
        if a > cur: segs.append((cur, a))
        cur = b_
    if cur < w['to']: segs.append((cur, w['to']))
    for (a, b_) in segs:
        for sd in (-1, 1):
            if w['id'] in OUTER and sd == {'N': -1, 'S': 1, 'W': -1, 'E': 1}[w['id']] * (1 if w['axis'] == 'x' else 1): continue
            o = w['at'] + sd * (T / 2 + 0.008)
            if w['axis'] == 'x': wm(w['id'], 'trim').box(a, b_, 0.0, 0.1, min(o, o + sd * 0.012), max(o, o + sd * 0.012))
            else: wm(w['id'], 'trim').box(min(o, o + sd * 0.012), max(o, o + sd * 0.012), 0.0, 0.1, a, b_)

# ======================== 窗（框、百葉、窗簾、窗外） ========================
def wframe(wid, axis, at, a, b_, y0, y1, nrm):
    """白色窗框／門框（框條＋窗台），nrm＝房間內側的方向（+1／−1 沿法線軸）"""
    t = 0.06; off = nrm * (T / 2 + 0.005)
    def bx(p0, p1, q0, q1, yy0, yy1):
        if axis == 'x': wm(wid, 'trim').box(p0, p1, yy0, yy1, min(at + q0, at + q1), max(at + q0, at + q1))
        else: wm(wid, 'trim').box(min(at + q0, at + q1), max(at + q0, at + q1), yy0, yy1, p0, p1)
    bx(a - t, a, off - 0.01 * nrm, off + 0.02 * nrm, y0, y1); bx(b_, b_ + t, off - 0.01 * nrm, off + 0.02 * nrm, y0, y1)
    bx(a - t, b_ + t, off - 0.01 * nrm, off + 0.02 * nrm, y1, y1 + t)
    if y0 > 0.01: bx(a - t - 0.03, b_ + t + 0.03, off - 0.02 * nrm, off + 0.06 * nrm, y0 - 0.03, y0)   # 窗台
VIEW = []
for win in LAY['windows']:
    w = WALLDEF['N'] if win['side'] == 'N' else None
    a, b_, y0, y1 = win['x0'], win['x1'], win['y0'], win['y1']; at = w['at']
    wframe('N', 'x', at, a, b_, y0, y1, +1)
    acc('glass').quad([(a, y0, at), (b_, y0, at), (b_, y1, at), (a, y1, at)])
    for k in range(1, 2 if not win.get('door') else 1): acc('trim').box((a + b_) / 2 - 0.02, (a + b_) / 2 + 0.02, y0, y1, at - 0.03, at + 0.03)
    if win.get('blinds'):   # 百葉：拉下一半（窗）／整片（玻璃門內側）
        yb = y0 + (y1 - y0) * (0.45 if not win.get('door') else 0.0)
        bm = bmesh.new(); ul = bm.loops.layers.uv.new('UVMap'); z = at + T / 2 + 0.03
        vs = [bm.verts.new(g2b(*p)) for p in ((a + 0.02, yb, z), (b_ - 0.02, yb, z), (b_ - 0.02, y1 - 0.02, z), (a + 0.02, y1 - 0.02, z))]; f = bm.faces.new(vs)
        for lp, uv in zip(f.loops, ((0, 0), (1, 0), (1, (y1 - yb) / 0.5), (0, (y1 - yb) / 0.5))): lp[ul].uv = uv
        B.mesh_obj(P + f'blinds_{a}', bm, M['blinds'], root)
        acc('trim').box(a, b_, y1 - 0.06, y1, z - 0.02, z + 0.02)
    VIEW.append((a, b_, y0, y1, at))
# 客廳的窗：黑色窗簾桿＋黑白圓圈圖案的落地窗簾（兩邊各一片，打摺）
cw = LAY['windows'][0]; zc = WALLDEF['N']['at'] + T / 2 + 0.12
acc('black').cyl((cw['x0'] - 0.45, 2.35, zc), (cw['x1'] + 0.45, 2.35, zc), 0.014, seg=8)
for (p0, p1) in ((cw['x0'] - 0.42, cw['x0'] + 0.08), (cw['x1'] - 0.08, cw['x1'] + 0.42)):
    bm = bmesh.new(); ul = bm.loops.layers.uv.new('UVMap'); n = 8
    for k in range(n):
        xa, xb = p0 + (p1 - p0) * k / n, p0 + (p1 - p0) * (k + 1) / n; da, db = 0.04 * (k % 2), 0.04 * ((k + 1) % 2)
        vs = [bm.verts.new(g2b(*p)) for p in ((xa, 0.02, zc + da), (xb, 0.02, zc + db), (xb, 2.33, zc + db), (xa, 2.33, zc + da))]; f = bm.faces.new(vs)
        for lp, uv in zip(f.loops, ((k / n * 1.2, 0), ((k + 1) / n * 1.2, 0), ((k + 1) / n * 1.2, 4.5), (k / n * 1.2, 4.5))): lp[ul].uv = uv
    B.mesh_obj(P + f'curtain_{p0:.1f}', bm, M['curtain'], root)
# 窗外的景（北邊；春天／雪景兩套）
for tag, mk in (('off', 'view_spring'), ('on', 'view_snow')):
    g = B.group(f'SEASON_SNOW_{tag}', root, {'season': 'snow', 'state': tag})
    bm = bmesh.new(); ul = bm.loops.layers.uv.new('UVMap'); z = WALLDEF['N']['at'] - 9.0
    # 公寓在二樓：地面在 y −3.0。景的下緣放在地面（畫上的停車場和車子貼地），中間鋪一片地（從陽台往下看不會看到景的下緣懸空）
    vs = [bm.verts.new(g2b(*p)) for p in ((8.0, -3.0, z), (-10.0, -3.0, z), (-10.0, 4.5, z), (8.0, 4.5, z))]; f = bm.faces.new(vs)
    for lp, uv in zip(f.loops, ((1, 0), (0, 0), (0, 1), (1, 1))): lp[ul].uv = uv
    B.mesh_obj(P + f'view_{tag}', bm, M[mk], g)
    gm = Mesh(P + f'lot_{tag}', L.flat(P + f'lot_{tag}', '#6b6b67' if tag == 'off' else '#e6eaee', rough=0.9))
    gm.quad([(8.0, -3.0, z), (8.0, -3.0, WALLDEF['N']['at']), (-10.0, -3.0, WALLDEF['N']['at']), (-10.0, -3.0, z)][::-1]); gm.finish(g, uv=True)

# ======================== 門 ========================
def six_panel(m, axis, at, c, y0, w_, nrm, rot=0.0, hinge_end='W'):
    """白色六格門板（厚 4 cm）：axis＝門所在牆的軸；c＝門的中心（沿牆）；rot＝開門角度（0 關著）。用一個局部座標系畫。
    hinge_end＝鉸鍊在門的哪一端：'W'（預設，沿牆座標小的那一端）或 'E'（大的那一端：從那一端轉 180°−rot，一樣是轉動、不是鏡射，面的方向不變）"""
    hinge = c - w_ / 2
    if hinge_end == 'E': hinge = c + w_ / 2; rot = math.pi - rot
    def P_(u, v, s):   # u 沿門寬、v 高、s 厚度方向
        ca, sa = math.cos(rot), math.sin(rot); uu, ss = u * ca - s * sa * nrm, u * sa * nrm + s * ca
        return (hinge + uu, v, at + ss) if axis == 'x' else (at + ss, v, hinge + uu)
    def box(u0, u1, v0, v1, s0, s1):
        cs = [P_(u, v, s) for u in (u0, u1) for v in (v0, v1) for s in (s0, s1)]
        bm = m.bm; vs = [bm.verts.new(g2b(*p)) for p in cs]
        for f in ((0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)): bm.faces.new([vs[i] for i in f])
    box(0.0, w_, y0, y0 + DOOR_H - 0.01, -0.02, 0.02)
    for (u0, u1) in ((0.1, w_ / 2 - 0.04), (w_ / 2 + 0.04, w_ - 0.1)):   # 六格：凸起的方框
        for (v0, v1) in ((0.12, 0.82), (0.95, 1.5), (1.62, 1.92)):
            box(u0, u1, y0 + v0, y0 + v1, 0.02, 0.028); box(u0, u1, y0 + v0, y0 + v1, -0.028, -0.02)
    kp = P_(w_ - 0.08, y0 + 0.95, 0.05)
    acc('chrome').cyl(P_(w_ - 0.08, y0 + 0.95, -0.05), kp, 0.012, seg=8); acc('chrome').sphere(kp, 0.028, seg=10, rings=6)
for d in LAY['doors']:
    if d.get('breezeway'): continue
    axis = d.get('axis', 'x'); w_ = d['w']; at = d['z'] if axis == 'x' else d['x']; c = d['x'] if axis == 'x' else d['z']
    nrm = 1 if (axis == 'x' and d['z'] < 1.5) or (axis == 'z' and d['x'] > 0) else -1
    if d.get('glass'):   # 陽台的單扇玻璃門：白框、整片玻璃（百葉在窗的那一節做了）
        wframe('N', 'x', at, c - w_ / 2, c + w_ / 2, 0.0, DOOR_H, +1)
        for (u0, u1, v0, v1) in ((c - w_ / 2, c - w_ / 2 + 0.07, 0, DOOR_H), (c + w_ / 2 - 0.07, c + w_ / 2, 0, DOOR_H), (c - w_ / 2, c + w_ / 2, 0, 0.12), (c - w_ / 2, c + w_ / 2, DOOR_H - 0.07, DOOR_H)):
            acc('trim').box(u0, u1, v0, v1, at - 0.025, at + 0.025)
        acc('chrome').box(c + w_ / 2 - 0.14, c + w_ / 2 - 0.11, 0.95, 1.1, at + 0.03, at + 0.05)
        continue
    wid = door_wall(d)
    wframe(wid, axis, at, c - w_ / 2, c + w_ / 2, 0.0, DOOR_H, nrm)
    if d.get('style') == 'louverBifold':   # 洗衣機櫃的百葉摺門（關著）：四片、橫向百葉
        for k in range(4):
            u0 = c - w_ / 2 + k * w_ / 4 + 0.01; u1 = u0 + w_ / 4 - 0.02
            wm(wid, 'door').box(at - 0.02, at + 0.02, 0.02, DOOR_H - 0.02, u0, u1) if axis == 'z' else None
            for v in range(10): wm(wid, 'trim').box(at - 0.025, at - 0.02, 0.35 + v * 0.13, 0.4 + v * 0.13, u0 + 0.04, u1 - 0.04)
        continue
    # v3（使用者 10-27 美國公寓）：衣物間、衛浴的門開著、往臥室開（swingOut：門板轉到牆的另一邊）；衛浴的鉸鍊在東邊（hinge E：門板靠在書桌南邊的牆角）
    m = wm(wid, 'door'); six_panel(m, axis, at, c, 0.0, w_ - 0.02, -nrm if d.get('swingOut') else nrm, rot=(math.radians(95) if d.get('openDoor') else 0.0), hinge_end=d.get('hinge', 'W'))
    if d.get('plate'):   # 門牌（虛構的號碼）：遊戲照 PLATE_FACE 畫字
        x_, z_ = (c + 0.0, at + 0.03 * nrm * -1) if axis == 'x' else (at, c)
        pm = Mesh(f'PLATE_FACE_door_{d["id"]}', M['plate'])
        if axis == 'x' and d.get('openDoor'):   # 大門開著（門板轉進屋裡）：門牌貼在門框右邊的外牆上（原本在門的位置，門開著時浮在門洞裡、從屋裡看是反的：合租戶截圖「802」）
            zo = at - nrm * (T / 2 + 0.025); u0_ = c + w_ / 2 + 0.13
            pm.quad([(u0_, 1.5, zo), (u0_ + 0.18, 1.5, zo), (u0_ + 0.18, 1.62, zo), (u0_, 1.62, zo)][::(1 if -nrm > 0 else -1)])
        elif axis == 'x': pm.quad([(c - 0.09, 1.55, at + 0.035), (c + 0.09, 1.55, at + 0.035), (c + 0.09, 1.67, at + 0.035), (c - 0.09, 1.67, at + 0.035)])
        else: pm.quad([(at - 0.035, 1.55, c + 0.09), (at - 0.035, 1.55, c - 0.09), (at - 0.035, 1.67, c - 0.09), (at - 0.035, 1.67, c + 0.09)])   # 牆在 z 軸上（臥室 A、B 的門）：門牌在西邊（客廳那一面）
        L.uv01(pm.finish(root, uv=True, props={'plate': 'door', 'text': d['plate']})) if hasattr(L, 'uv01') else pm.finish(root, uv=True, props={'plate': 'door', 'text': d['plate']})

# ======================== 廚房：backsplash（房間的一部分） ========================
acc('backsplash').quad([(-4.6 + T / 2, 0.92, 3.0 - T / 2 - 0.005), (-1.8 - T / 2, 0.92, 3.0 - T / 2 - 0.005), (-1.8 - T / 2, 1.45, 3.0 - T / 2 - 0.005), (-4.6 + T / 2, 1.45, 3.0 - T / 2 - 0.005)][::-1])

# ======================== 衛浴（浴缸、馬桶、洗手台＋鏡子） ========================
# AA-B 的 ART-US4（us_bath_props.glb）交件以後用它（下面「衛浴＝ART-US4」）；沒有那個檔才做這裡的簡單版
US4 = os.path.join(L.ROOT, 'assets/models/env/second_ai/aa_support/us_bath_props.glb'); US4_OK = os.path.exists(US4)
F = {f['type']: f for f in LAY['furniture']}
# 浴室四面牆的室內面：照配置的 bath 房間（原本寫死 x 0.6～3.0；v3 衛浴搬到 x 2.6～5.0——使用者 10-27「床旁邊是書桌再旁邊是洗手間」）
_BR = next(r for r in LAY['rooms'] if r['id'] == 'bath')
WB, EB, SB, NB = _BR['x0'] + T / 2, _BR['x1'] - T / 2, _BR['z1'] - T / 2, _BR['z0'] + T / 2
if not US4_OK:
    tb = F['tub']; acc('porcelain').rbox(tb['x0'], tb['x1'], 0.0, 0.52, tb['z0'], tb['z1'], r=0.04, seg=3)
    acc('tile').quad([(tb['x0'] + 0.08, 0.36, tb['z1'] - 0.08), (tb['x1'] - 0.08, 0.36, tb['z1'] - 0.08), (tb['x1'] - 0.08, 0.36, tb['z0'] + 0.08), (tb['x0'] + 0.08, 0.36, tb['z0'] + 0.08)])
    acc('chrome').cyl((tb['x0'] + 0.3, 1.0, tb['z1'] - 0.02), (tb['x0'] + 0.3, 1.0, tb['z1'] - 0.12), 0.018, seg=8)
    acc('chrome').cyl((tb['x0'] + 0.1, 2.05, tb['z0'] - 0.02), (tb['x1'] - 0.1, 2.05, tb['z0'] - 0.02), 0.012, seg=8)   # 浴簾桿
    acc('curtain').quad([(tb['x0'] + 0.15, 0.6, tb['z0'] + 0.01), (tb['x0'] + 0.75, 0.6, tb['z0'] + 0.01), (tb['x0'] + 0.75, 2.03, tb['z0'] + 0.01), (tb['x0'] + 0.15, 2.03, tb['z0'] + 0.01)][::-1])
    tl = F['toilet']; tx_, tz_ = tl['x'], tl['z']
    bm = L.lathe([(0.0, 0.0), (0.12, 0.0), (0.14, 0.2), (0.2, 0.38), (0.18, 0.4), (0.0, 0.4)], seg=20); acc('porcelain').add_bm(bm, Matrix.Translation(g2b(tx_ + 0.05, 0.0, tz_)) @ Matrix.Scale(1.25, 4, (1.0, 0.0, 0.0))); bm.free()
    acc('porcelain').rbox(tx_ - 0.22, tx_ - 0.06, 0.4, 0.78, tz_ - 0.22, tz_ + 0.22, r=0.03, seg=2)
    vn = F['vanity']; acc('door').rbox(vn['x0'], vn['x1'], 0.0, 0.84, vn['z0'], vn['z1'], r=0.01, seg=1)
    acc('porcelain').rbox(vn['x0'] - 0.02, vn['x1'], 0.84, 0.88, vn['z0'] - 0.02, vn['z1'] + 0.02, r=0.01, seg=1)
    acc('chrome').cyl(((vn['x0'] + vn['x1']) / 2 + 0.18, 0.88, (vn['z0'] + vn['z1']) / 2), ((vn['x0'] + vn['x1']) / 2 + 0.18, 1.02, (vn['z0'] + vn['z1']) / 2), 0.015, seg=8)
    acc('mirror').quad([(EB - 0.01, 1.0, vn['z1'] - 0.05), (EB - 0.01, 1.0, vn['z0'] + 0.05), (EB - 0.01, 1.85, vn['z0'] + 0.05), (EB - 0.01, 1.85, vn['z1'] - 0.05)])

# 浴缸三面牆的白磁磚（美國的浴缸淋浴兩用：南牆、西牆、東端短牆 tub_e，高 0.45～1.95；用廚房擋水牆的長條白磚）
_tb = F['tub']; _te = [w for w in LAY['walls'][0]['list'] if w['id'] == 'tub_e']
_sx0, _sx1, _sz = WB, (_te[0]['at'] - T / 2) if _te else _tb['x1'], SB - 0.005
acc('backsplash').quad([(_sx1, 0.45, _sz), (_sx0, 0.45, _sz), (_sx0, 1.95, _sz), (_sx1, 1.95, _sz)])                       # 南牆，面向北
_wx = WB + 0.005
acc('backsplash').quad([(_wx, 0.45, SB), (_wx, 0.45, _tb['z0']), (_wx, 1.95, _tb['z0']), (_wx, 1.95, SB)])   # 西牆，面向東
if _te:
    _ex = _te[0]['at'] - T / 2 - 0.005
    acc('backsplash').quad([(_ex, 0.45, _te[0]['from']), (_ex, 0.45, SB), (_ex, 1.95, SB), (_ex, 1.95, _te[0]['from'])])   # 東端短牆，面向西

# ======================== 陽台、樓梯平台 ========================
for x in (BAL['x0'], BAL['x1']):
    pass
rz = BAL['z0'] + 0.05
acc('rail_wood').box(BAL['x0'], BAL['x1'], BAL['rail'] - 0.05, BAL['rail'], rz - 0.04, rz + 0.04)
for k in range(int((BAL['x1'] - BAL['x0']) / 0.12) + 1): x = BAL['x0'] + 0.06 + k * 0.12; acc('rail_wood').box(x - 0.018, x + 0.018, 0.0, BAL['rail'] - 0.05, rz - 0.018, rz + 0.018)
acc('roof').quad([(BAL['x0'], H + 0.3, BAL['z0']), (BAL['x1'], H + 0.3, BAL['z0']), (BAL['x1'], H + 0.3, BAL['z1']), (BAL['x0'], H + 0.3, BAL['z1'])])
for (cx, cz) in (((-2.1, -4.0), (-1.3, -4.1)) if not US4_OK else ()):   # 兩張戶外椅（金屬框＋網面）：簡單版，有 ART-US4 就用它的椅子
    acc('black').rbox(cx - 0.25, cx + 0.25, 0.42, 0.46, cz - 0.25, cz + 0.25, r=0.02, seg=1); acc('black').box(cx - 0.25, cx + 0.25, 0.46, 0.9, cz - 0.27, cz - 0.24)
    for sx in (-1, 1):
        for sz in (-1, 1): acc('black').cyl((cx + sx * 0.22, 0.0, cz + sz * 0.22), (cx + sx * 0.22, 0.44, cz + sz * 0.22), 0.012, seg=6)
# 樓梯平台：屋頂（簷底板）、白柱子、白鐵欄杆、往下的樓梯第一段、壁燈、隔壁 213 的門
acc('roof').quad([(BW['x0'], H + 0.25, BW['z0']), (BW['x1'] + 2.8, H + 0.25, BW['z0']), (BW['x1'] + 2.8, H + 0.25, BW['z1']), (BW['x0'], H + 0.25, BW['z1'])])
for (px, pz) in BW['posts']: acc('rail_white').rbox(px - 0.08, px + 0.08, 0.0, H + 0.25, pz - 0.08, pz + 0.08, r=0.01, seg=1)
rz = BW['z1'] - 0.05
acc('rail_white').box(BW['x0'], BW['x1'], 1.0, 1.05, rz - 0.025, rz + 0.025)
for k in range(int((BW['x1'] - BW['x0']) / 0.11) + 1): x = BW['x0'] + k * 0.11; acc('rail_white').box(x - 0.012, x + 0.012, 0.0, 1.0, rz - 0.012, rz + 0.012)
ST = BW['stairs']; n = 7
for j in range(n):
    x = ST['x0'] + j * 0.28; y = -0.18 * (j + 1)
    acc('concrete').box(x, x + 0.3, y - 0.05, y, ST['z0'], ST['z1'])
acc('rail_white').cyl((ST['x0'], 1.0, ST['z1']), (ST['x0'] + n * 0.28, 1.0 - 0.18 * n, ST['z1']), 0.022, seg=8)
acc('trim').rbox(-0.3, -0.14, 1.95, 2.25, 3.0 + T / 2, 3.0 + T / 2 + 0.08, r=0.02, seg=2); acc('sconce').box(-0.27, -0.17, 2.0, 2.2, 3.0 + T / 2 + 0.08, 3.0 + T / 2 + 0.09)
nb = [d for d in LAY['doors'] if d.get('breezeway')][0]
m213 = Mesh('door213', M['door']); six_panel(m213, 'z', nb['x'] + 0.01, nb['z'], 0.0, nb['w'], 1); m213.finish(root, uv=True)
pm = Mesh('PLATE_FACE_door_213', M['plate']); pm.quad([(nb['x'] + 0.04, 1.55, nb['z'] + 0.09), (nb['x'] + 0.04, 1.55, nb['z'] - 0.09), (nb['x'] + 0.04, 1.67, nb['z'] - 0.09), (nb['x'] + 0.04, 1.67, nb['z'] + 0.09)])
pm.finish(root, uv=True, props={'plate': 'door', 'text': nb['plate']})
wf = Mesh('breezeway_wall_w', M['siding']); wf.quad([(BW['x0'] + 0.0, 0.0, BW['z1']), (BW['x0'] + 0.0, 0.0, BW['z0']), (BW['x0'] + 0.0, H + 0.25, BW['z0']), (BW['x0'] + 0.0, H + 0.25, BW['z1'])]); wf.finish(root, uv=True)

# ======================== 家具：客廳＝AA-B 的 ART-US1 ========================
def import_props(path, prefix):
    if not os.path.exists(path): return {}
    before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=path); new = [o for o in bpy.data.objects if o not in before]
    tops = {}
    for o in new:
        nm = o.name.split('.')[0]
        if nm.startswith(prefix) and (o.parent is None or not o.parent.name.split('.')[0].startswith(prefix)): tops[nm] = o
    return tops, new
fur = B.group('furniture', root, {'kind': 'furniture'}); n_fur = 0
def place(tops, node, x, y, z, ry):
    global n_fur
    src = tops.get(node)
    if src is None: print('沒有', node); return
    def walk(o, par):
        c = o.copy(); bpy.context.scene.collection.objects.link(c); c.parent = par
        for ch in o.children: walk(ch, c)
        return c
    ob = walk(src, fur); ob.rotation_mode = 'XYZ'; ob.location = g2b(x, y, z); ob.rotation_euler = (0, 0, ry); ob.scale = (1, 1, 1); n_fur += 1
LIV = os.path.join(L.ROOT, 'assets/models/env/second_ai/aa_support/us_living_props.glb')
res = import_props(LIV, 'US_')
if res:
    tops, new = res
    MAP = {'sofa': 'US_SOFA', 'armchair': 'US_ARMCHAIR', 'coffeeTable': 'US_COFFEE', 'endTable': 'US_ENDTABLE', 'rug': 'US_RUG', 'ladderShelf': 'US_LADDER', 'tvStand': 'US_TVSTAND', 'barStool': 'US_BARSTOOL'}
    for f in LAY['furniture']:
        nd = MAP.get(f['type'])
        if nd: place(tops, nd, f['x'], 0.0, f['z'], f.get('ry', 0.0) + (math.pi if f['type'] == 'barStool' else 0.0))
    fan = [f for f in LAY['furniture'] if f['type'] == 'ceilingFan'][0]; place(tops, 'US_CEILINGFAN', fan['x'], H, fan['z'], 0.0)
    for o in new:
        if o.name in bpy.data.objects: bpy.data.objects.remove(o)

# ======================== 廚房＝AA-B 的 ART-US2 ========================
# 流理台一組（US_COUNTER、US_RANGE、US_SINK、US_DISHWASHER、US_UPPER）共用同一個原點、ry=π（本地 +x＝房間西邊、本地 −z＝南牆）：
# 本地 z −0.3 是靠牆那一面，貼到南牆的室內面（3.0 − T/2）；本地 x 0.2／−0.5／−1.1＝爐子／水槽／洗碗機，對到 layout 的 x −3.4／−2.7／−2.1
KIT = os.path.join(L.ROOT, 'assets/models/env/second_ai/aa_support/us_kitchen_props.glb')
res = import_props(KIT, 'US_')
if res:
    tops, new = res
    cr = [f for f in LAY['furniture'] if f['type'] == 'counterRun'][0]
    cx, cz = (cr['x0'] + cr['x1']) / 2, cr['z1'] - T / 2 - 0.3
    # 每一件相對 US_COUNTER 的位置照 GLB（AA-B 的 SPREAD：爐子 x 0.2、洗碗機 x −1.1、水槽 x −0.5／y 0.92…）。
    # 2026-10-16 17:5x 修：13:0x 起爐子、洗碗機、吊櫃都放在 US_COUNTER 的原點，爐子往水槽偏 0.2 m、洗碗機整台卡在爐子裡（爐面上一塊塊黑的就是洗碗機）
    cw = tops['US_COUNTER'].matrix_world.inverted(); RY = math.pi; c_, s_ = math.cos(RY), math.sin(RY)
    for nd in ('US_COUNTER', 'US_RANGE', 'US_DISHWASHER', 'US_UPPER', 'US_SINK', 'US_KITCHEN_LIFE'):   # US_KITCHEN_LIFE：ART-US2 第 9 節補強（AA-B 48393461），原點和 US_COUNTER 相同
        if nd not in tops: continue
        t = (cw @ tops[nd].matrix_world).to_translation(); lx, ly, lz = t.x, t.z, -t.y
        place(tops, nd, cx + lx * c_ + lz * s_, ly, cz - lx * s_ + lz * c_, RY)
    fr = [f for f in LAY['furniture'] if f['type'] == 'fridge'][0]
    place(tops, 'US_FRIDGE', cr['x0'] + T / 2 + 0.375 + 0.01, 0.0, fr['z'], fr.get('ry', 0.0))   # 背面貼西牆，門朝東（廚房裡面）
    ps = [f for f in LAY['furniture'] if f['type'] == 'passShelf'][0]
    place(tops, 'US_PASSSHELF', (ps['x0'] + ps['x1']) / 2, ps['h'] - 1.05, 1.0 + T / 2 + 0.15, 0.0)   # 窗口內側（廚房那一邊）
    bb = [f for f in LAY['furniture'] if f['type'] == 'breakfastBar'][0]
    place(tops, 'US_BAR', (bb['x0'] + bb['x1']) / 2, bb['h'] - 1.05, 1.0 - T / 2 - 0.18, math.pi)   # 窗口外側（客廳那一邊）：靠牆的 −z 轉到南邊，高腳椅在北邊
    for o in new:
        if o.name in bpy.data.objects: bpy.data.objects.remove(o)

# ======================== 臥室＝BB-B 的 ART-US3 ========================
# 每件照 layout 的 furniture 擺（原點底部中央、正面 +z；吸頂燈原點貼天花板往 −y）
BED = os.path.join(L.ROOT, 'assets/models/env/second_ai/bb_support/us_bedroom_props.glb')
res = import_props(BED, 'US_')
if res:
    tops, new = res
    MAP3 = {'bed': 'US_BED', 'nightstand': 'US_NIGHTSTAND', 'desk': 'US_DESK', 'deskChair': 'US_DESKCHAIR', 'suitcase': 'US_SUITCASE'}
    for f in LAY['furniture']:
        nd = MAP3.get(f['type'])
        if nd and str(f.get('room', '')).startswith('bed'): place(tops, nd, f['x'], 0.0, f['z'], f.get('ry', 0.0))   # bedroom（單人戶）、bedA／bedB（合租戶的兩間）
        if f['type'] == 'lifeSuitcase': place(tops, 'US_SUITCASE', f['x'], 0.0, f['z'], f.get('ry', 0.0))   # 合租戶：客廳裡沒收完的行李箱（BB_217）
    for cl in [f for f in LAY['furniture'] if f['type'] == 'ceilingLight']: place(tops, 'US_CEILINGLIGHT', cl['x'], H, cl['z'], 0.0)
    for o in new:
        if o.name in bpy.data.objects: bpy.data.objects.remove(o)

# ======================== 衛浴＝AA-B 的 ART-US4（＋陽台的椅子、小圓桌） ========================
def gbounds(top):
    """節點（含子節點）在自己座標系裡的遊戲座標範圍：(xmin, xmax, zmin, zmax)"""
    inv = top.matrix_world.inverted(); xs, zs = [], []
    for o in [top] + list(top.children_recursive):
        if o.type != 'MESH': continue
        m = inv @ o.matrix_world
        for v in o.data.vertices:
            p = m @ v.co; xs.append(p.x); zs.append(-p.y)
    return min(xs), max(xs), min(zs), max(zs)
if US4_OK:
    res = import_props(US4, 'US_')
    if res:
        tops, new = res
        bx = {k: gbounds(v) for k, v in tops.items()}
        # 浴室四面牆的室內面：WB、EB、SB、NB（上面照配置算好的）
        if 'US_TUB' in bx:        # 貼南牆、ry=π（本地 −z 靠牆轉到南邊）；西端貼西牆
            x0, x1, z0, z1 = bx['US_TUB']; place(tops, 'US_TUB', WB + x1 + 0.005, 0.0, SB + z0 - 0.005, math.pi)
        if 'US_TOILET' in bx:     # 靠西牆、面向東：ry=π/2（本地 −z 的水箱轉到西邊）
            x0, x1, z0, z1 = bx['US_TOILET']; place(tops, 'US_TOILET', WB - z0 + 0.01, 0.0, F['toilet']['z'], math.pi / 2)
        if 'US_VANITY' in bx:     # 貼東牆、面向西：ry=−π/2（本地 −z 的牆面那一側轉到東邊）
            x0, x1, z0, z1 = bx['US_VANITY']; vn = F['vanity']; place(tops, 'US_VANITY', EB + z0 - 0.005, 0.0, (vn['z0'] + vn['z1']) / 2, -math.pi / 2)
        if 'US_TOWELBAR' in bx:   # 北牆、門的西邊（馬桶上方偏東），面向南
            x0, x1, z0, z1 = bx['US_TOWELBAR']; place(tops, 'US_TOWELBAR', F['towelbar']['x'] if 'towelbar' in F else 1.3, 0.0, NB - z0 + 0.005, 0.0)
        if 'US_BATHMAT' in bx:    # 浴缸前面，長邊和浴缸平行
            _bm = F.get('bathmat', {'x': 1.5, 'z': 1.92}); x0, x1, z0, z1 = bx['US_BATHMAT']; place(tops, 'US_BATHMAT', _bm['x'], 0.0, _bm['z'], 0.0 if (x1 - x0) >= (z1 - z0) else math.pi / 2)
        bc = F.get('balconyChairs', {})
        for (cx, cz, a) in bc.get('chairs', [(-2.15, -4.1, 0.2), (-1.05, -4.1, -0.2)]): place(tops, 'US_BALCONY_CHAIR', cx, 0.0, cz, math.pi + a)   # 面向欄杆（北）
        if 'US_BALCONY_TABLE' in tops: tb_ = bc.get('table', {'x': -1.6, 'z': -4.15}); place(tops, 'US_BALCONY_TABLE', tb_['x'], 0.0, tb_['z'], 0.0)
        for o in new:
            if o.name in bpy.data.objects: bpy.data.objects.remove(o)

# ======================== 走得進去的衣物間（walk-in closet；v3，使用者 10-27「有一個小的 WALKIN CLOSET 不是衣櫃」）========================
# 美國公寓常見的白色鐵線層架：一層鐵線層板＋前緣下面的吊衣桿；西牆、南牆各一排（配置 closetRods 的 west、south：吊衣區的範圍）。
# 衣服是頂點色的薄片（肩膀斜、下襬寬一點；襯衫、T 恤、外套、長大衣長短不一），掛在白色衣架上；層板上摺好的衣服、收納盒；地上鞋子；
# 行李箱立在西南角最裡面（AA 的字「行李箱塞在最裡面」）、洗衣籃在東南角。只有配置有 closetRods 的 west／south 才做（合租戶的衣物間門關著，不做）
CL = next((f for f in LAY['furniture'] if f['type'] == 'closetRods' and 'west' in f), None)
if CL:
    CLM = L.vc_material(P + 'closet_vc', rough=0.8); clo = L.CMesh(P + 'closet_clothes', CLM)
    wire = L.flat(P + 'wire_shelf', '#f1f1ee', rough=0.35); shm = Mesh(P + 'closet_shelf', wire)
    rr_ = random.Random(1027)
    COLS = ['#2c3a55', '#4a5568', '#e9e6df', '#1f2023', '#5d6b4a', '#7a2f35', '#3f6f9a', '#9a8a72', '#c9c3b8', '#33475b', '#6b5b4a', '#b8b2a6']
    ROD_Y, SHELF_Y = 1.72, 1.86
    def garment(u, axis, wall_at, inward, kind, col):
        """一件衣服：沿衣桿的位置 u；axis＝衣桿沿哪個軸；wall_at＝背後那面牆的室內面；inward＝離開牆的方向（+1／−1）。衣服的寬（0.42～0.5）朝房間裡、厚 4～7 cm 沿衣桿"""
        L_ = {'shirt': 0.78, 'tee': 0.66, 'jacket': 0.86, 'coat': 1.12, 'hoodie': 0.72}[kind]; W2 = (0.24 if kind in ('jacket', 'coat', 'hoodie') else 0.22) + rr_.uniform(-0.01, 0.01)
        th = {'coat': 0.075, 'jacket': 0.07, 'hoodie': 0.065}.get(kind, 0.045); dmid = wall_at + inward * 0.30   # 衣服的中心離牆 0.30
        top = ROD_Y - 0.05
        prof = [(-0.07, top), (0.07, top), (W2, top - 0.08), (W2 + 0.01, top - L_ * 0.55), (W2 - 0.01, top - L_), (-W2 + 0.01, top - L_), (-W2 - 0.01, top - L_ * 0.55), (-W2, top - 0.08)]   # (橫向, 高)
        def P3(w, y, t):   # 橫向 w（垂直於牆）、高 y、厚度 t（沿衣桿）
            d_ = dmid + inward * w
            return (u + t, y, d_) if axis == 'x' else (d_, y, u + t)
        bm = clo.bm; F_ = [bm.verts.new(g2b(*P3(w, y, -th / 2))) for (w, y) in prof]; B_ = [bm.verts.new(g2b(*P3(w, y, th / 2))) for (w, y) in prof]
        fs = [bm.faces.new(F_), bm.faces.new(B_[::-1])]
        n_ = len(prof)
        for i in range(n_): fs.append(bm.faces.new([F_[i], B_[i], B_[(i + 1) % n_], F_[(i + 1) % n_]]))
        bmesh.ops.recalc_face_normals(bm, faces=fs); clo.paint(fs, col, k=rr_.uniform(0.92, 1.05))
        # 衣架（白色塑膠）：掛鉤＋肩線
        hk = P3(0, ROD_Y + 0.03, 0); hb = P3(0, top + 0.01, 0); acc('trim').cyl(hk, hb, 0.006, seg=6)
        acc('trim').cyl(P3(-0.2, top - 0.03, 0), P3(0, top + 0.01, 0), 0.007, seg=6); acc('trim').cyl(P3(0, top + 0.01, 0), P3(0.2, top - 0.03, 0), 0.007, seg=6)
    sx, sz = CL['suitcase']
    def rack(axis, a0, a1, wall_at, inward, short=()):
        """一排：鐵線層板（深 0.36）＋前緣的吊衣桿＋兩端的斜撐；衣服沿衣桿掛"""
        d0, d1 = (wall_at, wall_at + inward * 0.36) if inward > 0 else (wall_at + inward * 0.36, wall_at)
        if axis == 'x': shm.box(a0, a1, SHELF_Y - 0.012, SHELF_Y, d0, d1)
        else: shm.box(d0, d1, SHELF_Y - 0.012, SHELF_Y, a0, a1)
        for k in range(1, 18):   # 鐵線（看得到一條一條）
            dd = wall_at + inward * 0.36 * k / 18
            if axis == 'x': shm.box(a0, a1, SHELF_Y, SHELF_Y + 0.006, dd - 0.003, dd + 0.003)
            else: shm.box(dd - 0.003, dd + 0.003, SHELF_Y, SHELF_Y + 0.006, a0, a1)
        lip = wall_at + inward * 0.36
        rod_a = (a0 + 0.02, ROD_Y, lip) if axis == 'x' else (lip, ROD_Y, a0 + 0.02); rod_b = (a1 - 0.02, ROD_Y, lip) if axis == 'x' else (lip, ROD_Y, a1 - 0.02)
        acc('chrome').cyl(rod_a, rod_b, 0.014, seg=10)
        for e in (a0 + 0.04, a1 - 0.04):   # 斜撐：牆上 1.45 → 層板前緣
            pa = (e, 1.45, wall_at + inward * 0.01) if axis == 'x' else (wall_at + inward * 0.01, 1.45, e); pb = (e, SHELF_Y - 0.01, lip) if axis == 'x' else (lip, SHELF_Y - 0.01, e)
            shm.cyl(pa, pb, 0.008, seg=6)
        u = a0 + 0.08; kinds = ['shirt', 'shirt', 'tee', 'jacket', 'hoodie', 'shirt', 'coat', 'tee']
        while u < a1 - 0.08:
            kd = rr_.choice(['shirt', 'tee'] if any(s0 <= u <= s1 for s0, s1 in short) else kinds); garment(u, axis, wall_at, inward, kd, rr_.choice(COLS)); u += {'coat': 0.11, 'jacket': 0.1, 'hoodie': 0.095}.get(kd, 0.075) + rr_.uniform(0, 0.02)
        # 層板上：摺好的衣服（一疊三、四件）、收納盒
        u = a0 + 0.1
        while u < a1 - 0.3:
            if rr_.random() < 0.35:
                c0 = rr_.choice(['#d8cfc0', '#8a7f72', '#4b5563', '#e8e4dc']); bw = 0.3
                if axis == 'x': clo.crbox(u, u + bw, SHELF_Y + 0.006, SHELF_Y + 0.25, wall_at + inward * 0.03, wall_at + inward * 0.33, c0, r=0.012) if inward > 0 else clo.crbox(u, u + bw, SHELF_Y + 0.006, SHELF_Y + 0.25, wall_at + inward * 0.33, wall_at + inward * 0.03, c0, r=0.012)
                else: clo.crbox(*sorted((wall_at + inward * 0.03, wall_at + inward * 0.33)), SHELF_Y + 0.006, SHELF_Y + 0.25, u, u + bw, c0, r=0.012)
                u += bw + 0.06
            else:
                h0 = SHELF_Y + 0.006
                for j in range(rr_.randint(2, 4)):
                    hh = rr_.uniform(0.035, 0.05); c0 = rr_.choice(COLS)
                    a_, b_ = sorted((wall_at + inward * 0.05, wall_at + inward * 0.31))
                    if axis == 'x': clo.crbox(u, u + 0.28, h0, h0 + hh, a_, b_, c0, r=0.01)
                    else: clo.crbox(a_, b_, h0, h0 + hh, u, u + 0.28, c0, r=0.01)
                    h0 += hh
                u += 0.34
    W_, S_ = CL['west'], CL['south']
    rack('z', W_['z0'] + T / 2, W_['z1'] - T / 2, W_['x0'] + T / 2, +1, short=[(sz - 0.3, sz + 0.3)])   # 西牆那一排（衣服朝東）；行李箱上面只掛短的
    rack('x', S_['x0'] + 0.02, S_['x1'] - T / 2, S_['z1'] - T / 2, -1, short=[(2.1, 2.6)])            # 南牆那一排（衣服朝北）；洗衣籃上面只掛短的
    # 地上：鞋子（南牆那一排下面，一雙兩隻）
    for k, (bx_, c0) in enumerate([(1.55, '#f2f2ee'), (1.85, '#1e1f22'), (2.15, '#6b4a33')]):
        for j in (-0.06, 0.06):
            clo.crbox(bx_ + j - 0.045, bx_ + j + 0.045, 0.0, 0.03, 2.62, 2.9, '#e6e4de', r=0.012)          # 鞋底
            clo.crbox(bx_ + j - 0.042, bx_ + j + 0.042, 0.03, 0.1, 2.66, 2.89, c0, r=0.025)                 # 鞋面
    # 行李箱：立在西南角最裡面（深灰藍的硬殼、拉桿收著）
    clo.crbox(sx - 0.21, sx + 0.21, 0.04, 0.7, sz - 0.13, sz + 0.13, '#3b4a5c', r=0.04, seg=3)
    for gx in (sx - 0.12, sx - 0.04, sx + 0.04, sx + 0.12): clo.crbox(gx - 0.012, gx + 0.012, 0.08, 0.66, sz + 0.128, sz + 0.136, '#34414f', r=0.004, seg=1)   # 硬殼的直條紋
    for wx in (sx - 0.16, sx + 0.16): acc('black').cyl((wx, 0.03, sz - 0.08), (wx, 0.03, sz - 0.04), 0.03, seg=10)   # 輪子
    acc('black').box(sx - 0.1, sx + 0.1, 0.7, 0.73, sz - 0.1, sz - 0.08)   # 拉桿的把手
    # 洗衣籃（東南角，南牆那一排下面）
    clo.crbox(2.2, 2.48, 0.0, 0.5, 2.42, 2.82, '#cdbb98', r=0.03, seg=2); clo.crbox(2.22, 2.46, 0.5, 0.56, 2.44, 2.8, '#7a8a9a', r=0.02, seg=2)
    # 天花板中間一盞吸頂燈
    acc('sconce').sphere((1.6, H - 0.06, 2.0), 0.16, seg=16, rings=6, sy=0.35)
    shm.finish(root); clo.finish(root, uv=False)
# 衛浴：洗手台上方一條燈（v3 走得進去以後看得到；照美國公寓常見的三顆燈泡燈條）
if any(r['id'] == 'bath' and r.get('open') for r in LAY['rooms']):
    _vn = F.get('vanity')
    if _vn:
        _cz = (_vn['z0'] + _vn['z1']) / 2
        acc('chrome').box(EB - 0.05, EB - 0.005, 1.98, 2.06, _cz - 0.35, _cz + 0.35)
        for _k in (-0.24, 0.0, 0.24): acc('sconce').sphere((EB - 0.09, 2.02, _cz + _k), 0.055, seg=12, rings=6)

# ======================== 冰箱門上的輪值表（合租戶；BB_98 2-6）========================
def tex_chores(path):
    """手寫的輪值表：三欄 TRASH／DISHES／TP（倒垃圾、洗碗、買衛生紙）、八列（第 1～8 週），格子裡 A／B／C 輪；前兩週打勾、這週一格打勾、一格被紅筆劃掉。
    字只寫英文字母、數字（不寫名字；A／B／C＝房門上的字母）。2026-10-17 改：原本欄頭畫的是三角形、圓圈，遊戲裡看起來像亂碼"""
    W_, H_ = 480, 640; im = Image.new('RGB', (W_, H_), (250, 248, 240)); d = ImageDraw.Draw(im); rr = random.Random(913)
    ink, grid, green, red = (40, 60, 120), (150, 150, 160), (30, 120, 60), (200, 60, 50)
    FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
    def fnt(sz): return ImageFont.truetype(FONT, sz)
    def txt(x, y, s, sz, fill=ink, ang=0.0):   # 字置中在 (x, y)，稍微歪一點（手寫）
        f = fnt(sz); bb = d.textbbox((0, 0), s, font=f); w, h = bb[2] - bb[0], bb[3] - bb[1]
        t = Image.new('RGBA', (w + 8, h + 8), (0, 0, 0, 0)); ImageDraw.Draw(t).text((4 - bb[0], 4 - bb[1]), s, font=f, fill=fill + (255,))
        t = t.rotate(ang, resample=Image.BICUBIC, expand=True); im.paste(t, (int(x - t.width / 2), int(y - t.height / 2)), t)
    d.rectangle([0, 0, W_ - 1, 74], fill=(236, 206, 120)); txt(W_ / 2, 38, 'CHORES', 46, ang=1.5)
    X = [10, 86, 218, 350, W_ - 10]; Y0, RH = 74, 70   # 第一欄週數，後三欄家事
    for x in X: d.line([(x, Y0), (x, Y0 + RH * 8 + 6)], fill=grid, width=3)
    for j in range(9): y = Y0 + 6 + j * RH if j else Y0; d.line([(10, y), (W_ - 10, y)], fill=grid, width=3)
    # 第一列＝欄頭；第 2～8 列＝第 1～7 週
    for k, s_ in enumerate(('TRASH', 'DISHES', 'TP')): txt((X[k + 1] + X[k + 2]) / 2, Y0 + 6 + RH / 2, s_, 34, ang=rr.uniform(-2, 2))
    for j in range(1, 8):
        yc = Y0 + 6 + j * RH + RH / 2; txt((X[0] + X[1]) / 2, yc, str(j), 34, ang=rr.uniform(-3, 3))
        for k in range(3):
            xc = (X[k + 1] + X[k + 2]) / 2; txt(xc - 18, yc, 'ABC'[(j + k) % 3], 38, ang=rr.uniform(-6, 6))
            if j <= 2 or (j == 3 and k == 0): d.line([(xc + 12, yc), (xc + 22, yc + 14), (xc + 44, yc - 16)], fill=green, width=5)   # 做完打勾
    xc, yc = (X[2] + X[3]) / 2, Y0 + 6 + 3 * RH + RH / 2; d.line([(xc - 40, yc + 14), (xc + 40, yc - 12)], fill=red, width=4)   # 這週洗碗那格被紅筆劃掉
    im.filter(ImageFilter.GaussianBlur(0.6)).save(path)
for cc in [f for f in LAY['furniture'] if f['type'] == 'choreChart']:
    tex_chores(os.path.join(GEN, 'us_chores.png')); mt = img_mat(P + 'chores', 'us_chores.png', rough=0.8)
    x, y, z, w_, h_ = cc['x'], cc['y'], cc['z'], cc['w'], cc['h']
    ch = Mesh('chore_chart', mt); bm = ch.bm; ul = bm.loops.layers.uv.active or bm.loops.layers.uv.new('UVMap')
    vs = [bm.verts.new(g2b(*p)) for p in ((x, y - h_ / 2, z + w_ / 2), (x, y - h_ / 2, z - w_ / 2), (x, y + h_ / 2, z - w_ / 2), (x, y + h_ / 2, z + w_ / 2))]; f = bm.faces.new(vs)
    for lp, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[ul].uv = uv
    ch.finish(fur, uv=False)
    acc('black').box(x - 0.004, x + 0.012, y + h_ / 2 - 0.03, y + h_ / 2 - 0.005, z + w_ / 2 - 0.05, z + w_ / 2 - 0.012)   # 磁鐵（壓在角落，不蓋住 CHORES）

# ======================== 合租戶：房門的裝飾、冰箱的便條、生活痕跡、US2 的道具（BB_217）========================
def tex_simple(path, W_, H_, draw, blur=0.5):
    im = Image.new('RGB', (W_, H_), (250, 248, 240)); d = ImageDraw.Draw(im); draw(im, d); im.filter(ImageFilter.GaussianBlur(blur)).save(path); return os.path.basename(path)
def card(name, mat, x, y, z, w_, h_, axis, side):
    """貼在牆或門上的一張紙／板（axis：所在面的軸；side：朝向 +1／−1）"""
    m = Mesh(name, mat); bm = m.bm; ul = bm.loops.layers.uv.active or bm.loops.layers.uv.new('UVMap')
    if axis == 'x': pts = ((x - w_ / 2 * side, y - h_ / 2, z), (x + w_ / 2 * side, y - h_ / 2, z), (x + w_ / 2 * side, y + h_ / 2, z), (x - w_ / 2 * side, y + h_ / 2, z))
    else: pts = ((x, y - h_ / 2, z + w_ / 2 * side), (x, y - h_ / 2, z - w_ / 2 * side), (x, y + h_ / 2, z - w_ / 2 * side), (x, y + h_ / 2, z + w_ / 2 * side))
    vs = [bm.verts.new(g2b(*p)) for p in pts]; f = bm.faces.new(vs)
    for lp, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[ul].uv = uv
    return m
rr2 = random.Random(217)
def deco_whiteboard(im, d):   # 小白板：黑、藍麥克筆的線（看不出字）
    d.rectangle([0, 0, 239, 179], outline=(150, 150, 155), width=6)
    for k in range(5): y = 30 + k * 28; d.line([(20, y), (20 + rr2.randint(80, 190), y + rr2.randint(-4, 4))], fill=rr2.choice([(30, 30, 40), (40, 60, 150)]), width=4)
def deco_poster(im, d):       # 海報：色塊、圓（沒有字、沒有真的作品）
    d.rectangle([0, 0, 179, 249], fill=(40, 52, 80)); d.ellipse([40, 40, 140, 140], fill=(232, 160, 70)); d.rectangle([0, 170, 179, 249], fill=(200, 80, 70))
    for k in range(3): d.line([(20, 190 + k * 16), (150, 190 + k * 16)], fill=(240, 230, 210), width=3)
def deco_sticker(im, d):      # 幾張圓形、星形貼紙
    for (cx, cy, c) in ((50, 50, (240, 200, 60)), (130, 70, (90, 170, 220)), (80, 140, (230, 110, 140)), (150, 150, (120, 190, 110))):
        d.ellipse([cx - 28, cy - 28, cx + 28, cy + 28], fill=c, outline=(255, 255, 255), width=4)
DECO = {'whiteboard': (deco_whiteboard, 240, 180, 0.36, 0.27, 1.25), 'poster': (deco_poster, 180, 250, 0.3, 0.42, 1.2), 'sticker': (deco_sticker, 200, 200, 0.24, 0.24, 1.15)}
def coat_on_door(d_, col='#55623f'):
    """門後掛勾上的外套（BB_217 §1「一扇掛外套」、§7-4）：掛勾跨過門板上緣；外套一片布（肩膀斜、下襬張開、越往下褶子越深）＋兩隻袖子＋領子；平滑著色"""
    xf, zc, rs = d_['x'] - 0.022, d_['z'], random.Random(4)                      # 門板朝客廳那一面（門板 x±0.02）
    hk = Mesh('door_coat_hook_' + d_['id'], M['chrome']); yt = DOOR_H - 0.01
    for (a_, b_) in (((d_['x'] + 0.03, yt - 0.06, zc), (d_['x'] + 0.03, yt + 0.012, zc)), ((d_['x'] + 0.03, yt + 0.012, zc), (xf - 0.004, yt + 0.012, zc)),
                     ((xf - 0.004, yt + 0.012, zc), (xf - 0.004, yt - 0.24, zc)), ((xf - 0.004, yt - 0.24, zc), (xf - 0.045, yt - 0.2, zc))):
        hk.cyl(a_, b_, 0.005, seg=6)
    walls.setdefault(door_wall(d_), {})['deco_hook_' + d_['id']] = hk   # 掛勾、外套放進門所在那面牆的組（WALL_<牆>_deco_*）：牆淡出時一起淡出（BB_218：鏡頭在臥室 B 那一側時門板淡出、外套飄在半空）
    cm = Mesh('door_coat_' + d_['id'], L.flat(P + 'coat_' + d_['id'], col, rough=0.92)); bm_ = cm.bm; ytop = yt - 0.2; h_ = 0.8; nw, nh = 12, 16; grid = []; ph = [rs.uniform(0, 6.28) for _ in range(3)]
    for i in range(nw + 1):
        t = i / nw - 0.5; row = []
        for j in range(nh + 1):
            v = j / nh; wdt = 0.42 + 0.12 * v ** 1.4; sl = 0.08 * abs(2 * t) ** 1.25 * (1 - v)
            zz = zc + t * wdt; yy = ytop - 0.03 - sl - v * h_ - 0.025 * v * math.sin(t * 9 + ph[2]) * abs(2 * t)
            xx = xf - 0.004 - (0.045 * (1 - (2 * t) ** 2) * (0.35 + 0.65 * v) + 0.016 * v ** 1.5 * math.sin(t * 14 + ph[0]) + 0.007 * math.sin(t * 29 + v * 6 + ph[1]) + 0.006)
            row.append(bm_.verts.new(g2b(xx, yy, zz)))
        grid.append(row)
    for i in range(nw):
        for j in range(nh): bm_.faces.new((grid[i][j], grid[i][j + 1], grid[i + 1][j + 1], grid[i + 1][j]))   # 法線朝客廳（−x）
    for sg in (-1, 1):   # 袖子：從肩膀垂下來、貼著衣身兩邊、袖口張開一點，一長一短
        ln = 0.58 + 0.04 * sg; cm.cyl((xf - 0.05, ytop - 0.09, zc + sg * 0.215), (xf - 0.062, ytop - 0.09 - ln, zc + sg * 0.245), 0.043, seg=10, r2=0.038)
    cm.cyl((xf - 0.035, ytop - 0.035, zc - 0.1), (xf - 0.035, ytop - 0.035, zc + 0.1), 0.024, seg=8)   # 領子（翻領的一圈）
    walls[door_wall(d_)]['deco_coat_' + d_['id']] = cm
for d_ in LAY['doors']:
    if d_.get('deco') == 'coat': coat_on_door(d_); continue
    if not d_.get('deco'): continue
    fn, W_, H_, w_, h_, y_ = DECO[d_['deco']]
    mt = img_mat(P + 'deco_' + d_['id'], tex_simple(os.path.join(GEN, 'us_deco_%s.png' % d_['deco']), W_, H_, fn), rough=0.7)
    axis = d_.get('axis', 'x')
    cd_ = card('door_deco_' + d_['id'], mt, d_['x'] - 0.045, y_, d_['z'], w_, h_, 'z', 1) if axis == 'z' else card('door_deco_' + d_['id'], mt, d_['x'], y_, d_['z'] - 0.045, w_, h_, 'x', -1)   # 牆在 z 軸上：貼在門的西面（客廳、走道那一面）
    walls.setdefault(door_wall(d_), {})['deco_card_' + d_['id']] = cd_   # 和門板同一組：牆淡出時一起淡出（BB_218）
NOTE_MAT = None
for cc in [f for f in LAY['furniture'] if f['type'] == 'choreChart']:   # 輪值表旁邊兩張便條（黃、粉紅）
    for k, (dz, dy, col) in enumerate(((0.19, 0.08, '#f4dc6a'), (0.17, -0.12, '#f2a8b8'))):
        nm = L.flat(P + 'note%d' % k, col, rough=0.8); card('fridge_note%d' % k, nm, cc['x'] + 0.002, cc['y'] + dy, cc['z'] + dz, 0.08, 0.08, 'z', -1).finish(fur, uv=False)
FT = {f['type']: f for f in LAY['furniture']}
def card_uv(name, mat, x, y, z, w_, h_, axis, side, uv=(0, 0, 1, 1), rot=0.0):
    """card()＋貼圖的一塊（uv＝u0, v0, u1, v1）＋在牆面上轉 rot（弧度）"""
    m = Mesh(name, mat); bm = m.bm; ul = bm.loops.layers.uv.active or bm.loops.layers.uv.new('UVMap'); ca, sa = math.cos(rot), math.sin(rot)
    loc = [(-w_ / 2, -h_ / 2), (w_ / 2, -h_ / 2), (w_ / 2, h_ / 2), (-w_ / 2, h_ / 2)]; loc = [(p * ca - q * sa, p * sa + q * ca) for p, q in loc]
    pts = [(x + p * side, y + q, z) for p, q in loc] if axis == 'x' else [(x, y + q, z - p * side) for p, q in loc]
    f = bm.faces.new([bm.verts.new(g2b(*pp)) for pp in pts]); u0, v0, u1, v1 = uv
    for lp, uv_ in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[ul].uv = uv_
    return m
if 'lifeWallArt' in FT:   # 沙發上方的西牆：裱框的風景版畫（BB_217 §7-3：客廳牆面很空）；跟著西牆淡出（放進 walls['W']）
    f = FT['lifeWallArt']
    def tex_art(im, d):   # 版畫：白色卡紙邊、大太陽、兩層山、湖（色塊分明，遠看也看得出是山；沒有字、不是真的作品）
        W_, H_ = 360, 240; d.rectangle([0, 0, W_, H_], fill=(244, 240, 230)); x0, y0, x1, y1 = 34, 30, W_ - 34, H_ - 30
        d.rectangle([x0, y0, x1, y1], fill=(246, 196, 120)); d.rectangle([x0, y0, x1, y0 + 50], fill=(240, 160, 96))
        d.ellipse([196, 52, 262, 118], fill=(214, 82, 52))
        for k, (col, base, amp, fr) in enumerate((((122, 96, 128), 128, 30, 0.021), ((44, 58, 84), 150, 22, 0.032))):
            pts = [(x0, y1)] + [(xx, base + amp * math.sin((xx - x0) * fr + k * 1.7)) for xx in range(x0, x1 + 1, 4)] + [(x1, y1)]; d.polygon(pts, fill=col)
        d.rectangle([x0, 172, x1, y1], fill=(60, 104, 128))
        for k in range(4): yy = 178 + k * 7; d.line([(x0 + 40 + k * 14, yy), (x1 - 60 - k * 10, yy)], fill=(150, 186, 196), width=2)
    am = img_mat(P + 'life_art', tex_simple(os.path.join(GEN, 'us_life_art.png'), 360, 240, tex_art, blur=0.6), rough=0.8)
    xw = WALLDEF['W']['at'] + LAY['wallT'] / 2; w_, h_ = f['w'], f['h']
    walls.setdefault('W', {})['life_art'] = card_uv('life_art', am, xw + 0.022, f['y'], f['z'], w_ - 0.05, h_ - 0.05, 'z', 1)
    M['life_frame'] = L.flat(P + 'life_frame', '#2a2522', rough=0.5); fm = wm('W', 'life_frame'); fz0, fz1, fy0, fy1 = f['z'] - w_ / 2, f['z'] + w_ / 2, f['y'] - h_ / 2, f['y'] + h_ / 2
    for (za, zb, ya, yb) in ((fz0, fz1, fy0, fy0 + 0.025), (fz0, fz1, fy1 - 0.025, fy1), (fz0, fz0 + 0.025, fy0, fy1), (fz1 - 0.025, fz1, fy0, fy1)): fm.box(xw + 0.002, xw + 0.03, ya, yb, za, zb)
if 'lifePhotoString' in FT:   # 西牆北端：麻繩夾著四張拍立得（照片是色塊，沒有人臉）；跟著西牆淡出
    f = FT['lifePhotoString']; xw = WALLDEF['W']['at'] + LAY['wallT'] / 2
    PCOL = [((120, 170, 200), (230, 210, 150)), ((210, 150, 120), (90, 120, 80)), ((90, 110, 150), (230, 200, 200)), ((160, 190, 120), (240, 236, 220))]
    def tex_pol(im, d):   # 四張拍立得：白框、下面寬；照片是天空＋地面的色塊
        for k, (sky, gnd) in enumerate(PCOL):
            x0 = k * 128; d.rectangle([x0 + 2, 2, x0 + 125, 157], fill=(246, 244, 238)); d.rectangle([x0 + 12, 12, x0 + 115, 118], fill=sky); d.rectangle([x0 + 12, 80, x0 + 115, 118], fill=gnd)
            d.ellipse([x0 + 70, 24, x0 + 92, 46], fill=(250, 236, 200))
    pm = img_mat(P + 'life_polaroid', tex_simple(os.path.join(GEN, 'us_life_polaroid.png'), 512, 160, tex_pol, blur=0.4), rough=0.6)
    M['life_twine'] = L.flat(P + 'life_twine', '#b9a27a', rough=0.9); tw = wm('W', 'life_twine'); za, zb, yy = f['z1'], f['z0'], f['y']; n = 10   # 從房間看西牆：左邊是 +z
    pts = [(xw + 0.012, yy - 0.035 * math.sin(math.pi * i / n), za + (zb - za) * i / n) for i in range(n + 1)]
    for p0, p1 in zip(pts, pts[1:]): tw.cyl(p0, p1, 0.0022, seg=4)
    for (pa, pb) in ((pts[0], (xw + 0.004, yy + 0.01, za)), (pts[-1], (xw + 0.004, yy + 0.01, zb))): tw.cyl(pa, pb, 0.003, seg=4)   # 兩端的圖釘
    rr3 = random.Random(5)
    for k in range(4):
        t = (k + 0.65) / 4.3; pz = za + (zb - za) * t; py = yy - 0.035 * math.sin(math.pi * t) - 0.058
        walls['W']['life_pol%d' % k] = card_uv('life_pol%d' % k, pm, xw + 0.006 + 0.0006 * k, py, pz, 0.088, 0.112, 'z', 1, uv=(k / 4 + 0.004, 0.02, (k + 1) / 4 - 0.004, 0.98), rot=rr3.uniform(-0.12, 0.12))
        wm('W', 'black').box(xw + 0.004, xw + 0.016, py + 0.048, py + 0.068, pz - 0.006, pz + 0.006)   # 小夾子
if 'lifeBlanket' in FT:   # 沙發上的毯子：搭在椅背、垂到坐墊（兩片有厚度的布）
    f = FT['lifeBlanket']; bmat = L.flat(P + 'blanket', '#8a6f9e', rough=0.95); bk = Mesh('life_blanket', bmat)
    bk.rbox(-4.62, -4.35, 0.45, 0.95, f['z'] - 0.35, f['z'] + 0.35, r=0.03, seg=2); bk.rbox(-4.38, -3.85, 0.42, 0.47, f['z'] - 0.33, f['z'] + 0.37, r=0.02, seg=2); bk.finish(fur, uv=False, smooth=True)
if 'lifePlant' in FT:   # 快乾的盆栽：陶盆＋下垂、偏黃褐的葉子
    f = FT['lifePlant']; pm_ = Mesh('life_plant_pot', L.flat(P + 'pot', '#b8643e', rough=0.8)); bm_ = L.lathe([(0.0, 0.0), (0.1, 0.0), (0.13, 0.22), (0.12, 0.22), (0.0, 0.2)], seg=18)
    pm_.add_bm(bm_, Matrix.Translation(g2b(f['x'], 0.0, f['z']))); bm_.free(); pm_.finish(fur, uv=False, smooth=True)
    lf = Mesh('life_plant_leaves', L.flat(P + 'leaves_dry', '#857a3e', rough=0.85))   # 快乾：偏黃褐的橄欖綠
    for k in range(9):
        a_ = k * 2 * math.pi / 9 + rr2.uniform(-0.2, 0.2); ln = rr2.uniform(0.18, 0.3); droop = rr2.uniform(0.05, 0.16)
        x0, z0 = f['x'] + 0.03 * math.cos(a_), f['z'] + 0.03 * math.sin(a_); x1, z1 = f['x'] + ln * math.cos(a_), f['z'] + ln * math.sin(a_)
        lf.cyl((x0, 0.22, z0), (x1, 0.22 + 0.12 - droop, z1), 0.018, seg=4, r2=0.006)
    lf.finish(fur, uv=False)
if 'lifeRice' in FT:
    f = FT['lifeRice']; rm = L.flat(P + 'ricebag', '#e8e0cc', rough=0.85); rb = Mesh('life_rice', rm); rb.rbox(f['x'] - 0.17, f['x'] + 0.17, 0.0, 0.42, f['z'] - 0.12, f['z'] + 0.12, r=0.05, seg=2); rb.finish(fur, uv=False, smooth=True)
    Mesh('life_rice_band', L.flat(P + 'riceband', '#b8322a', rough=0.7)).box(f['x'] - 0.172, f['x'] + 0.172, 0.24, 0.3, f['z'] - 0.122, f['z'] + 0.122).finish(fur, uv=False)   # 米袋上的紅色色帶（沒有字）
if 'lifeSoy' in FT:
    f = FT['lifeSoy']; sb = Mesh('life_soy', L.flat(P + 'soy', '#2a1810', rough=0.25)); bm_ = L.lathe([(0.0, 0.0), (0.035, 0.0), (0.035, 0.14), (0.016, 0.19), (0.0, 0.19)], seg=14)
    sb.add_bm(bm_, Matrix.Translation(g2b(f['x'], f['y'], f['z']))); bm_.free(); sb.finish(fur, uv=False, smooth=True)
    Mesh('life_soy_cap', L.flat(P + 'soycap', '#c83a2c', rough=0.5)).cyl((f['x'], f['y'] + 0.19, f['z']), (f['x'], f['y'] + 0.215, f['z']), 0.018, seg=10).finish(fur, uv=False)
def bowl(m, x, y, z, r_, h_):
    bm_ = L.lathe([(0.0, 0.0), (r_ * 0.45, 0.0), (r_ * 0.5, 0.012), (r_, h_), (r_ - 0.006, h_), (r_ * 0.45, 0.016), (0.0, 0.016)], seg=20); m.add_bm(bm_, Matrix.Translation(g2b(x, y, z))); bm_.free()
BOWLM = [L.flat(P + 'bowl_a', '#f2efe6', rough=0.3), L.flat(P + 'bowl_b', '#3b5f8a', rough=0.3), L.flat(P + 'bowl_c', '#c9a06a', rough=0.4)]   # 三種不同的碗：白瓷、藍、木頭色
if 'lifeBowls' in FT:   # 瀝水架（鐵絲）＋三個不同的碗斜放
    f = FT['lifeBowls']; rk = Mesh('life_rack', M['chrome'])
    for k in range(5): rk.cyl((f['x'] - 0.2 + k * 0.1, f['y'], f['z'] - 0.1), (f['x'] - 0.2 + k * 0.1, f['y'] + 0.12, f['z'] - 0.1), 0.004, seg=4)
    rk.cyl((f['x'] - 0.22, f['y'] + 0.02, f['z'] - 0.1), (f['x'] + 0.22, f['y'] + 0.02, f['z'] - 0.1), 0.004, seg=4); rk.finish(fur, uv=False)
    for k, m_ in enumerate(BOWLM):
        bw = Mesh('life_bowl%d' % k, m_); bowl(bw, f['x'] - 0.13 + k * 0.13, f['y'] + 0.005, f['z'] + 0.02, 0.065 + 0.01 * k, 0.06); bw.finish(fur, uv=False, smooth=True)
if 'eventUS2' in FT:   # US2 的道具：一組，平常遊戲藏起來（EVENT_US2）
    f = FT['eventUS2']; ev = B.group('EVENT_US2', root, {'kind': 'event', 'event': 'US2'})
    p_ = f['pot']; pot = Mesh('EVENT_US2_pot', M['chrome']); bm_ = L.lathe([(0.0, 0.0), (0.11, 0.0), (0.12, 0.012), (0.12, 0.12), (0.115, 0.125), (0.0, 0.02)], seg=24)
    pot.add_bm(bm_, Matrix.Translation(g2b(p_['x'], p_['y'], p_['z']))); bm_.free(); pot.cyl((p_['x'] + 0.12, p_['y'] + 0.1, p_['z']), (p_['x'] + 0.3, p_['y'] + 0.12, p_['z']), 0.012, seg=8); pot.finish(ev, uv=False, smooth=True)
    soup = Mesh('EVENT_US2_soup', L.flat(P + 'soup', '#c98a3e', rough=0.2)); soup.cyl((p_['x'], p_['y'] + 0.085, p_['z']), (p_['x'], p_['y'] + 0.09, p_['z']), 0.112, seg=24); soup.finish(ev, uv=False)
    sticks = Mesh('EVENT_US2_chopsticks', L.flat(P + 'chopstick', '#d8b98a', rough=0.6))   # 長筷子：斜靠在鍋邊
    for dx in (-0.012, 0.012): sticks.cyl((p_['x'] + dx, p_['y'] + 0.12, p_['z'] - 0.1), (p_['x'] + dx + 0.05, p_['y'] + 0.25, p_['z'] + 0.22), 0.005, seg=5)
    sticks.finish(ev, uv=False)
    n_ = f['noodles']
    def noodle_bag(pk, cx, y, cz, a=0.088, b=0.064, c=0.026, ry=0.0):
        """泡麵袋（BB_217 §7-1：原本兩塊方塊像奶油、海綿）：鼓鼓的軟袋——上面圓、貼著檯面的底比較平、四邊收薄；兩端壓邊（扁的長條）；沒有字"""
        bq = bmesh.new(); bmesh.ops.create_uvsphere(bq, u_segments=22, v_segments=12, radius=1.0)
        for v in bq.verts:
            x_, y_, z_ = v.co; sx = math.hypot(x_, y_); th = math.atan2(y_, x_)
            nx = math.copysign(abs(math.cos(th)) ** 0.28, math.cos(th)); ny = math.copysign(abs(math.sin(th)) ** 0.5, math.sin(th))
            zz = math.copysign(abs(z_) ** 0.75, z_); zz = zz * (0.42 if zz < 0 else 1.0); ss = sx ** 0.35
            v.co = Vector((a * nx * ss, b * ny * ss * (1.0 - 0.06 * abs(nx) ** 8), c * zz + c * 0.42))
        for sgn in (-1, 1):   # 壓邊：從袋子的兩端伸出 1.4 cm、厚 4 mm
            bmesh.ops.create_cube(bq, size=1.0, matrix=Matrix.Translation((sgn * (a + 0.004), 0.0, c * 0.42)) @ Matrix.Diagonal((0.026, b * 1.8, 0.004, 1.0)))
        pk.add_bm(bq, Matrix.Translation(g2b(cx, y, cz)) @ Matrix.Rotation(ry, 4, 'Z')); bq.free()
    for k, (col, dx, ry, c_) in enumerate((('#c8322a', 0.0, 0.1, 0.026), ('#e2b52a', 0.205, -0.16, 0.03))):   # 紅、黃兩包（沒有字）：放得有點歪
        pk = Mesh('EVENT_US2_noodle%d' % k, L.flat(P + 'noodle%d' % k, col, rough=0.38)); noodle_bag(pk, n_['x'] + dx, n_['y'], n_['z'], c=c_, ry=ry); pk.finish(ev, uv=False, smooth=True)
    b_ = f['bowls']
    for k, m_ in enumerate(BOWLM):
        bw = Mesh('EVENT_US2_bowl%d' % k, m_); bowl(bw, b_['x'] + k * 0.17, b_['y'], b_['z'], 0.07, 0.065); bw.finish(ev, uv=False, smooth=True)
    def tex_report(im, d):   # 英文報告：一行一行的灰線（看不出字）＋紅筆圈滿、劃線、旁邊的評語
        for k in range(22):
            y = 30 + k * 16; d.line([(24, y), (24 + rr2.randint(140, 196), y)], fill=(120, 120, 128), width=3)
        for k in range(7):
            cx, cy = rr2.randint(50, 200), rr2.randint(40, 360); d.ellipse([cx - rr2.randint(24, 46), cy - 12, cx + rr2.randint(24, 46), cy + 12], outline=(210, 30, 30), width=3)
        for k in range(4): y = rr2.randint(60, 350); d.line([(10, y), (22, y + 30)], fill=(210, 30, 30), width=3)
        d.line([(120, 372), (210, 360)], fill=(210, 30, 30), width=4); d.line([(150, 385), (230, 380)], fill=(210, 30, 30), width=3)
    rmat = img_mat(P + 'report', tex_simple(os.path.join(GEN, 'us_report.png'), 240, 400, tex_report, blur=0.4), rough=0.85)
    r_ = f['report']
    for k in range(3):   # 三張微微錯開
        a_ = (k - 1) * 0.08; rp = Mesh('EVENT_US2_report%d' % k, rmat); bm = rp.bm; ul = bm.loops.layers.uv.active or bm.loops.layers.uv.new('UVMap')
        cxk, czk, w_, h_ = r_['x'] + k * 0.03, r_['z'] - k * 0.01, 0.215, 0.28; ca, sa = math.cos(a_), math.sin(a_)
        pts = [(cxk + (u * w_ / 2) * ca - (v * h_ / 2) * sa, r_['y'] + 0.002 + k * 0.001, czk + (u * w_ / 2) * sa + (v * h_ / 2) * ca) for (u, v) in ((-1, 1), (1, 1), (1, -1), (-1, -1))]   # 字的上方朝吧台裡面（廚房），從祐廷那一側看是正的
        vs = [bm.verts.new(g2b(*p)) for p in pts]; fc = bm.faces.new(vs)
        for lp, uv in zip(fc.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[ul].uv = uv
        rp.finish(ev, uv=False)

# ======================== 收尾 ========================
for k_, m in _acc.items(): m.finish(root, uv=True, smooth=k_ in ('porcelain', 'chrome'))
for wid, ms in walls.items():
    w = WALLDEF.get(wid, {}); props = {'dir': w['dir']} if w.get('fade') else {}
    if w.get('fade') and wid not in OUTER: props['partition'] = 1
    if w.get('fadeInside'): props['inside'] = 1   # 南牆（樓梯平台那一面）：遊戲只在玩家在屋裡、鏡頭在平台那一側時淡出（us3d.js）
    for key, m in ms.items():
        nm = (f'WALL_{wid}_{key}' if w.get('fade') else f'{wid}_{key}'); m.name = nm; m.finish(root, uv=not key.startswith(('life_art', 'life_pol', 'deco_')), props=props, smooth=key.startswith('deco_coat'))   # 牆上的畫、照片自己有 UV（uv=True 會照世界座標重算，貼圖變成一格一格重複）
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name or 'SEASON' in ob.name or 'EVENT_' in ob.name or (ob.parent is not None and 'EVENT_' in ob.parent.name) or (ob.parent is not None and ('SEASON' in ob.parent.name or ob.parent.name == 'furniture')) or ob.name.startswith('WALL_') or (ob.parent is not None and ob.parent.parent is not None and ob.parent.parent.name == 'furniture'),
                    key=lambda ob: '')
# PERF-SINGLESIDE-GLB-1025（LAWWW2-B 2026-10-25）：材質改單面（lib2.single_side）——遊戲把 WALL_* 設成 transparent 才能淡出，雙面又半透明要畫兩次。同一頁上限：公寓 2.0→3.05、C 棟 208 1.85→2.9。
_ss = L.single_side(root, keep=r'glass', skip=lambda ob: 'FACE' in ob.name)   # 門牌（PLATE_FACE_*）遊戲照名字接手，不動網格
print('{"single_side": %s}' % json.dumps({k: v for k, v in sorted(_ss.items(), key=lambda kv: -kv[1][1])}, ensure_ascii=False))
info = L.export(OUT, gpu_instances=True)
info.update({'layout': LAY['version'], 'furniture': n_fur})
L.write_json(OUT[:-4] + '.json', info)
print(json.dumps(info, ensure_ascii=False))
