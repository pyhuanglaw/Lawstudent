"""美國交換：社區 Linden Grove 會所的室內（US-CLUBHOUSE-3D-1110，AA_741；LAWWW2 帳號 A 2026-11-10）→ assets/models/env/second_ai/us_clubhouse.glb（＋.json）。
  /opt/blenv/bin/python tools/blender/env_second/us_clubhouse.py [-- --out <glb>]
配置：src/data/us_clubhouse_layout.js（tools/blender/env_second/us_clubhouse_layout_gen.py 產生；遊戲 src/us_clubhouse3d.js 讀同一份）。座標＝配置的座標（x 東、z 南、y 上；地板 0、天花板 2.9）。
- 門廳：磨石子地磚、兩扇鋁框玻璃大門（關著）、社區辦公室的櫃台（窗口後面看得到辦公桌、電腦、檔案櫃；SHUTTER_DOWN＝下班拉下的鐵捲百葉）、東牆木頭信件架、盆栽
- 交誼廳：淺色木地板（D112：不用深色木地板）、西牆一面灰綠色的牆＋電視、L 型布沙發、茶几、地毯、東牆小廚房（水槽、微波爐、吊櫃）、熱飲販賣機、北牆通後面草地的鋁框玻璃門（關著）
  兩張長桌：TABLES_APART（平常分開）、TABLES_MERGED（併成一張）＋DINNER_SET（桌巾、一排菜、碗盤；12/14 晚餐）；XMAS_TREE＋XMAS_LIGHTS（12/1 起，晚上亮燈）
- 自習室：灰色地毯、四張長桌×四張椅子、每張桌子一盞檯燈、北牆軟木公布欄（CORK_NOTICE＝ev_usl_long3 多貼的一張單子）；SIS_COAT（學姊旁邊那張椅子上的外套）、SIS_PLAN（讀書計畫）
- LOUNGE_DOOR：交誼廳的門（12/14 晚上沒排晚餐時關著；US-CLUB-LOUNGE-CLOSE-1110）
- 窗：白色百葉拉下一半；窗外不在模型裡（遊戲在窗外放視差窗景 views/usch_<季節>_{day,night}.webp）。外牆外面一層米褐色壁板（社區會所的外觀色 #b8ad95）。
會淡出的牆：WALL_<id>_*（props dir＝配置的 dir；隔間另加 partition＝1）。天花板朝下的單面（ucl_ceiling）。
告示、傳單、販賣機面板上的英文都是虛構的通用字（不放社區名、校名、真的品牌：D77）。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
src = open(os.path.join(L.ROOT, 'src/data/us_clubhouse_layout.js'), encoding='utf-8').read()
LAY = json.loads(src[src.index('const US_CLUBHOUSE_LAYOUT=') + len('const US_CLUBHOUSE_LAYOUT='):].rstrip().rstrip(';'))
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/us_clubhouse.glb')); GEN = os.path.join(HERE, 'textures', 'gen')
H, T = LAY['ceilY'], LAY['wallT']; BD = LAY['bounds']
WALLS = {w['id']: w for w in LAY['walls']}; FUR = LAY['furniture']; SEATS = {s['id']: s for s in LAY['seats']}
rnd = random.Random(741)
# 頂點色網格的圓柱、球、橢球：記下呼叫前的面數，newf() 取這一次新加的面來上色
_n0 = {}
def _wrap(meth):
    def f(self, *a, **k):
        _n0[id(self)] = len(self.bm.faces); return meth(self, *a, **k)
    return f
for _nm in ('cyl', 'sphere', 'ell'): setattr(CMesh, _nm, _wrap(getattr(Mesh, _nm)))
def newf(cm): cm.bm.faces.ensure_lookup_table(); return [cm.bm.faces[i] for i in range(_n0.get(id(cm), 0), len(cm.bm.faces))]
B.reset(texres=512)
root = B.group('us_clubhouse', props={'kind': 'us_clubhouse', 'layout': LAY['version'], 'note': 'US-CLUBHOUSE-3D-1110 社區會所室內（AA_741）'})

# ======================== 貼圖（程式產生：告示、販賣機、公布欄） ========================
os.makedirs(GEN, exist_ok=True)
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; FR = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
def fnt(p, s): return ImageFont.truetype(p, s)
ATL = 2048
ATLAS = {}   # 名稱 → (u0, v0, u1, v1)（0～1；v 由下往上）
def tex_print(path):
    im = Image.new('RGB', (ATL, ATL), (240, 238, 232)); d = ImageDraw.Draw(im)
    def reg(nm, x0, y0, x1, y1): ATLAS[nm] = (x0 / ATL, 1 - y1 / ATL, x1 / ATL, 1 - y0 / ATL)
    # 販賣機正面（0,0）～（512,1024）：深紅底、上面三排飲料的照片格、右邊按鈕列、下面取物口
    d.rectangle((0, 0, 512, 1024), fill=(118, 34, 30)); d.rectangle((24, 30, 488, 92), fill=(250, 244, 230)); d.text((256, 61), 'HOT DRINKS', font=fnt(FB, 44), fill=(118, 34, 30), anchor='mm')
    cols = [((92, 58, 38), 'COFFEE'), ((142, 88, 52), 'MOCHA'), ((86, 54, 40), 'COCOA'), ((168, 138, 60), 'CHAI'), ((98, 130, 70), 'GREEN TEA'), ((200, 196, 186), 'MILK TEA')]
    for i, (c, nm) in enumerate(cols):
        x, y = 34 + (i % 2) * 190, 120 + (i // 2) * 230
        d.rounded_rectangle((x, y, x + 170, y + 200), 14, fill=(244, 236, 222)); d.ellipse((x + 40, y + 24, x + 130, y + 60), fill=(230, 226, 218), outline=(160, 150, 140), width=3)
        d.polygon([(x + 42, y + 42), (x + 128, y + 42), (x + 118, y + 150), (x + 52, y + 150)], fill=c); d.rectangle((x + 46, y + 80, x + 124, y + 110), fill=(250, 248, 240))
        d.text((x + 85, y + 178), nm, font=fnt(FB, 22), fill=(80, 40, 30), anchor='mm')
    d.rectangle((412, 120, 488, 790), fill=(60, 22, 20))
    for k in range(8): d.rounded_rectangle((426, 140 + k * 78, 474, 190 + k * 78), 8, fill=(220, 214, 200)); d.text((450, 165 + k * 78), str(k + 1), font=fnt(FB, 26), fill=(60, 22, 20), anchor='mm')
    d.rectangle((60, 830, 452, 990), fill=(30, 22, 22)); d.rectangle((80, 850, 432, 970), fill=(12, 10, 10)); d.text((256, 1004), 'PUSH', font=fnt(FB, 18), fill=(230, 220, 210), anchor='mm')
    reg('vending', 0, 0, 512, 1024)
    # 交誼廳的海報、告示（512..2048 × 0..512）：電影之夜、安靜時間、回收、泳池關閉——通用字、沒有社區名
    def flyer(x, y, w, h, bg, title, lines, fg=(30, 30, 34)):
        d.rectangle((x, y, x + w, y + h), fill=bg); d.text((x + w / 2, y + 50), title, font=fnt(FB, 40), fill=fg, anchor='mm')
        for k, t in enumerate(lines): d.text((x + w / 2, y + 120 + k * 46), t, font=fnt(FR, 28), fill=fg, anchor='mm')
    flyer(512, 0, 380, 512, (246, 214, 92), 'MOVIE NIGHT', ['FRIDAY 7 PM', 'LOUNGE', 'POPCORN PROVIDED', '', 'ALL RESIDENTS', 'WELCOME'])
    flyer(896, 0, 380, 512, (214, 230, 240), 'QUIET HOURS', ['10 PM - 8 AM', 'STUDY ROOM', 'PLEASE KEEP', 'VOICES LOW', '', 'THANK YOU'])
    flyer(1280, 0, 380, 512, (220, 236, 214), 'RECYCLING', ['PAPER', 'CANS & BOTTLES', 'CARDBOARD FLAT', '', 'BINS BY', 'THE MAILROOM'])
    flyer(1664, 0, 384, 512, (250, 250, 248), 'POOL CLOSED', ['FOR THE SEASON', '', 'REOPENS', 'MEMORIAL DAY', '', ''])
    for nm, x in (('fly_movie', 512), ('fly_quiet', 896), ('fly_recycle', 1280), ('fly_pool', 1664)): reg(nm, x, 0, x + 380, 512)
    # 公布欄多貼的一張單子（CORK_NOTICE；ev_usl_long3「公布欄貼著一張單子」）：白紙、標題空白線、一格一格的簽名欄（看不出字）
    x, y = 512, 512; d.rectangle((x, y, x + 380, y + 512), fill=(252, 252, 250)); d.rectangle((x + 40, y + 34, x + 340, y + 60), fill=(60, 60, 64))
    for k in range(9): d.line((x + 30, y + 110 + k * 42, x + 350, y + 110 + k * 42), fill=(150, 150, 156), width=3); d.line((x + 70, y + 92 + k * 42, x + 70 + rnd.randint(60, 180), y + 92 + k * 42), fill=(40, 60, 120), width=4) if k < 4 else None
    reg('notice', x, y, x + 380, y + 512)
    # 讀書計畫（SIS_PLAN）：方格表、紅藍筆的格子
    x, y = 896, 512; d.rectangle((x, y, x + 380, y + 512), fill=(250, 250, 246))
    for k in range(8): d.line((x + 20, y + 40 + k * 60, x + 360, y + 40 + k * 60), fill=(170, 176, 186), width=2)
    for k in range(6): d.line((x + 20 + k * 68, y + 40, x + 20 + k * 68, y + 460), fill=(170, 176, 186), width=2)
    for _ in range(14):
        cx, cy = rnd.randint(0, 4), rnd.randint(0, 6); col = rnd.choice([(196, 60, 52), (52, 84, 170), (60, 140, 90)])
        d.rectangle((x + 26 + cx * 68, y + 46 + cy * 60, x + 82 + cx * 68, y + 94 + cy * 60), fill=tuple(int(c * 0.35 + 255 * 0.65) for c in col)); d.line((x + 32 + cx * 68, y + 70 + cy * 60, x + 76 + cx * 68, y + 70 + cy * 60), fill=col, width=4)
    reg('plan', x, y, x + 380, y + 512)
    # 公布欄上其他的紙：社團、二手家具、共乘（只有色塊和線）
    for i, bg in enumerate([(255, 240, 160), (200, 226, 250), (250, 210, 210), (220, 244, 214)]):
        x, y = 1280 + (i % 2) * 384, 512 + (i // 2) * 256; d.rectangle((x, y, x + 380, y + 252), fill=bg)
        d.rectangle((x + 30, y + 26, x + 350, y + 56), fill=tuple(int(c * 0.55) for c in bg))
        for k in range(4): d.line((x + 30, y + 90 + k * 36, x + 30 + rnd.randint(160, 320), y + 90 + k * 36), fill=(80, 80, 90), width=5)
        for k in range(6): d.line((x + 30 + k * 54, y + 200, x + 30 + k * 54, y + 248), fill=(90, 90, 90), width=2)
        reg('paper%d' % i, x, y, x + 380, y + 252)
    # 掛畫（1024..2048 × 1024..1536）：抽象的湖、田野、山（色塊）
    for i in range(3):
        x, y = 0 + i * 512, 1024; sky = [(170, 200, 222), (232, 196, 160), (196, 214, 230)][i]
        d.rectangle((x, y, x + 500, y + 380), fill=sky); d.polygon([(x, y + 240), (x + 160, y + 150), (x + 300, y + 230), (x + 500, y + 170), (x + 500, y + 380), (x, y + 380)], fill=[(98, 128, 98), (176, 150, 92), (120, 140, 160)][i])
        d.rectangle((x, y + 300, x + 500, y + 380), fill=[(70, 110, 140), (150, 118, 70), (84, 110, 84)][i]); d.ellipse((x + 360, y + 40, x + 430, y + 110), fill=(250, 238, 200))
        reg('art%d' % i, x, y, x + 500, y + 380)
    # 微波爐的門（1536..2048 × 1024..1280）
    x, y = 1536, 1024; d.rectangle((x, y, x + 512, y + 256), fill=(40, 42, 44)); d.rectangle((x + 20, y + 20, x + 360, y + 236), fill=(18, 20, 22)); d.rectangle((x + 380, y + 20, x + 492, y + 236), fill=(60, 62, 64))
    d.rectangle((x + 392, y + 30, x + 480, y + 70), fill=(20, 40, 30)); d.text((x + 436, y + 50), '0:00', font=fnt(FB, 26), fill=(110, 220, 140), anchor='mm')
    for k in range(9): d.rounded_rectangle((x + 394 + (k % 3) * 30, y + 90 + (k // 3) * 40, x + 416 + (k % 3) * 30, y + 120 + (k // 3) * 40), 4, fill=(150, 152, 156))
    reg('microwave', x, y, x + 512, y + 256)
    # 信件架的小牌子（1536..2048 × 1280..1536）：字母＋數字（虛構）
    x, y = 1536, 1280; d.rectangle((x, y, x + 512, y + 256), fill=(232, 226, 210))
    for r_ in range(4):
        for c_ in range(6): d.text((x + 42 + c_ * 85, y + 32 + r_ * 64), '%s%d' % ('ABCD'[r_], c_ + 1), font=fnt(FB, 26), fill=(60, 50, 40), anchor='mm')
    reg('mailplates', x, y, x + 512, y + 256)
    # 自習室門口的牌子、櫃台的牌子（0..1024 × 1536..1792）
    x, y = 0, 1536; d.rectangle((x, y, x + 512, y + 160), fill=(40, 62, 84)); d.text((x + 256, y + 58), 'STUDY ROOM', font=fnt(FB, 52), fill=(245, 245, 240), anchor='mm'); d.text((x + 256, y + 118), 'QUIET PLEASE', font=fnt(FR, 30), fill=(200, 214, 226), anchor='mm')
    reg('sign_study', x, y, x + 512, y + 160)
    x, y = 512, 1536; d.rectangle((x, y, x + 512, y + 160), fill=(40, 62, 84)); d.text((x + 256, y + 58), 'LEASING OFFICE', font=fnt(FB, 46), fill=(245, 245, 240), anchor='mm'); d.text((x + 256, y + 118), 'MON - FRI  9 - 5', font=fnt(FR, 30), fill=(200, 214, 226), anchor='mm')
    reg('sign_office', x, y, x + 512, y + 160)
    x, y = 1024, 1536; d.rectangle((x, y, x + 512, y + 160), fill=(40, 62, 84)); d.text((x + 256, y + 80), 'LOUNGE', font=fnt(FB, 56), fill=(245, 245, 240), anchor='mm')
    reg('sign_lounge', x, y, x + 512, y + 160)
    # 時鐘面（1536..1792 × 1536..1792）
    x, y = 1536, 1536; d.rectangle((x, y, x + 256, y + 256), fill=(240, 238, 232)); d.ellipse((x + 6, y + 6, x + 250, y + 250), fill=(252, 252, 250), outline=(40, 40, 40), width=8)
    for k in range(12):
        a = k / 12 * math.tau; d.line((x + 128 + math.sin(a) * 100, y + 128 - math.cos(a) * 100, x + 128 + math.sin(a) * 114, y + 128 - math.cos(a) * 114), fill=(40, 40, 40), width=6)
    d.line((x + 128, y + 128, x + 128 + 60, y + 128 - 30), fill=(30, 30, 30), width=8); d.line((x + 128, y + 128, x + 128 - 10, y + 128 - 92), fill=(30, 30, 30), width=5)
    reg('clock', x, y, x + 256, y + 256)
    # 書背（0..1024 × 1792..2048）：自習室窗台的書、辦公室的資料夾
    x, y = 0, 1792
    for k in range(48):
        w = rnd.randint(14, 30); c = rnd.choice([(150, 50, 48), (40, 70, 120), (60, 110, 80), (200, 170, 90), (90, 60, 110), (220, 220, 210), (40, 40, 44)])
        d.rectangle((x, y, x + w, y + 256), fill=c); d.rectangle((x + 3, y + 40, x + w - 3, y + 48), fill=tuple(min(255, int(v * 1.5)) for v in c)); x += w + 1
        if x > 1000: break
    reg('books', 0, 1792, 1024, 2048)
    im.filter(ImageFilter.GaussianBlur(0.4)).save(path)
tex_print(os.path.join(GEN, 'usch_print.png'))
def tex_cork(path):
    r = random.Random(5); im = Image.new('RGB', (512, 512), (170, 128, 84)); px = im.load()
    for _ in range(26000):
        x, y = r.randrange(512), r.randrange(512); k = r.uniform(0.75, 1.2); px[x, y] = tuple(max(0, min(255, int(c * k))) for c in (170, 128, 84))
    im.filter(ImageFilter.GaussianBlur(0.8)).save(path)
tex_cork(os.path.join(GEN, 'usch_cork.png'))

def img_mat(name, fn, rough=0.6, emit=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    return m

P = 'ucl_'
M = {
    'wood': L.pbr(P + 'wood', 'laminate_floor_02', tile=1.6, target='#d3bc99', normal=0.4, maps=('diff', 'nor', 'rough'), rough_value=0.45),   # 交誼廳：淺色木地板（D112）
    'carpet': L.pbr(P + 'carpet', 'dirty_carpet', tile=1.2, target='#7d848c', sat=0.1, normal=0.5, maps=('diff', 'nor')),                   # 自習室：灰色地毯
    'tile': L.pbr(P + 'tile', 'terrazzo_tiles', tile=1.4, target='#cdc7ba', normal=0.3, maps=('diff', 'nor'), rough_value=0.35),          # 門廳、辦公室：磨石子
    'wall': L.pbr(P + 'wall', 'painted_plaster_wall', tile=2.5, target='#e9e3d6', normal=0.15, maps=('diff', 'nor')),   # white_plaster_02 有一塊一塊的髒斑（第一次預覽）：改用美國公寓那一張
    'accent': L.pbr(P + 'wall_accent', 'painted_plaster_wall', tile=2.5, target='#a8b6a5', normal=0.15, maps=('diff', 'nor')),                 # 交誼廳西牆（電視那一面）灰綠色
    'ext': L.pbr(P + 'siding', 'exterior_wall_cladding_02', tile=2.0, target='#b8ad95', normal=0.3, maps=('diff', 'nor')),               # 外牆（社區會所外觀的顏色）
    'oak': L.pbr(P + 'oak', 'walnut_veneer', tile=1.0, target='#c8a77d', normal=0.3, maps=('diff', 'nor', 'rough'), rough_value=0.5),     # 桌面、櫃台、信件架：淺色木頭
    'fabric': L.pbr(P + 'fabric', 'rough_linen', tile=0.7, target='#5f6a75', normal=0.5, maps=('diff', 'nor')),                            # 沙發：藍灰色布
    'shutter': L.pbr(P + 'shutter', 'painted_metal_shutter', tile=0.8, target='#c6c9cb', normal=0.5, maps=('diff', 'nor')),
    'splash': L.pbr(P + 'backsplash', 'long_white_tiles', tile=0.5, target='#e2ded6', normal=0.4, maps=('diff', 'nor'), rough_value=0.25),
    'ceiling': L.flat(P + 'ceiling', '#f2f0eb', rough=0.9, cull=True),
    'trim': L.flat(P + 'trim', '#f3f1eb', rough=0.4),
    'glass': L.flat(P + 'glass', '#a9bccb', rough=0.04, alpha=0.2),
    'blinds': L.flat(P + 'blinds', '#f2f0ea', rough=0.6),
    'tv': L.flat(P + 'tv', '#121316', rough=0.12),
    'panel': L.flat(P + 'ceil_panel', '#f8f6f0', rough=0.5, emit=B.srgb('#fff4e2')),
    'lamp': L.flat('GLOW_usch_lamp', '#fff1d6', rough=0.4, emit=B.srgb('#ffe2b0')),
    'xmas': L.flat('GLOW_usch_xmas', '#ffe9b8', rough=0.3, emit=B.srgb('#ffd98a')),
    'print': img_mat(P + 'print', 'usch_print.png', rough=0.7),
    'cork': img_mat(P + 'cork', 'usch_cork.png', rough=0.9),
    'vc': L.vc_material(P + 'vc', rough=0.6), 'vcm': L.vc_metal(P + 'vcm', rough=0.4, metal=0.35), 'vcg': L.vc_material(P + 'vcg', rough=0.25),
}
M['print']['tile'] = 1.0; M['cork']['tile'] = 0.6

# ======================== 累積器：靜態（root）、牆（WALL_<id>_<key>）、切換的群組 ========================
_acc = {}
def acc(k, grp=None):
    key = (grp or '', k)
    if key not in _acc: _acc[key] = (CMesh if k in ('vc', 'vcm', 'vcg') else Mesh)(((grp + '_') if grp else '') + P + k, M[k])
    return _acc[key]
walls = {}
def wm(wid, k):
    walls.setdefault(wid, {})
    if k not in walls[wid]: walls[wid][k] = (CMesh if k in ('vc', 'vcm') else Mesh)(f'WALL_{wid}_{k}', M[k])
    return walls[wid][k]
GROUPS = {}
def grp(name, note):
    if name not in GROUPS: GROUPS[name] = B.group(name, root, {'toggle': 1, 'note': note})
    return name

def tquad(m, pts, reg):
    """一片貼圖卡（pts 逆時針、從左下開始；reg＝ATLAS 的範圍）"""
    bm = m.bm; ul = bm.loops.layers.uv.active or bm.loops.layers.uv.new('UVMap'); u0, v0, u1, v1 = ATLAS[reg] if isinstance(reg, str) else reg
    f = bm.faces.new([bm.verts.new(g2b(*p)) for p in pts])
    for lp, uv in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[ul].uv = uv
def wall_card(m, wid, a, b_, y0, y1, reg, off=0.012):
    """貼在牆的房間那一面（沿牆 a～b_）"""
    w = WALLS[wid]; dx, _, dz = w['dir']; o = T / 2 + off
    if w['axis'] == 'x':
        z = w['at'] + dz * o; pts = [(a, y0, z), (b_, y0, z), (b_, y1, z), (a, y1, z)] if dz > 0 else [(b_, y0, z), (a, y0, z), (a, y1, z), (b_, y1, z)]
    else:
        x = w['at'] + dx * o; pts = [(x, y0, b_), (x, y0, a), (x, y1, a), (x, y1, b_)] if dx > 0 else [(x, y0, a), (x, y0, b_), (x, y1, b_), (x, y1, a)]
    tquad(m, pts, reg)

# ======================== 地板、天花板 ========================
FLOOR = {'wood': 'wood', 'carpet': 'carpet', 'tile': 'tile'}
for r in LAY['rooms']:
    acc(FLOOR[r['floor']]).quad([(r['x0'], 0.0, r['z1']), (r['x1'], 0.0, r['z1']), (r['x1'], 0.0, r['z0']), (r['x0'], 0.0, r['z0'])])
    acc('ceiling').quad([(r['x0'], H, r['z0']), (r['x1'], H, r['z0']), (r['x1'], H, r['z1']), (r['x0'], H, r['z1'])])
# 天花板的燈（嵌在天花板的方形燈盤：CEIL_，鏡頭高過天花板時藏起來）
CEIL = Mesh('CEIL_usch_panels', M['panel'])
for (x, z) in [(-8.5, -2), (-3.5, -2), (-8.5, 2), (-6, 2), (-3.5, 2), (1, 2), (1, -2), (5, 0), (9, 0), (5, 2.6), (9, 2.6)]:
    CEIL.box(x - 0.3, x + 0.3, H - 0.03, H - 0.005, z - 0.3, z + 0.3)
CEILV = CMesh('CEIL_usch_frames', M['vc'])
for (x, z) in [(-8.5, -2), (-3.5, -2), (-8.5, 2), (-6, 2), (-3.5, 2), (1, 2), (1, -2), (5, 0), (9, 0), (5, 2.6), (9, 2.6)]:
    CEILV.cbox(x - 0.33, x + 0.33, H - 0.035, H - 0.03, z - 0.33, z + 0.33, '#d9d7d2')
# 煙霧偵測器、冷氣出風口
for (x, z) in [(-6, 0), (7, 1), (1, 1)]: CEILV.cbox(x - 0.07, x + 0.07, H - 0.05, H - 0.005, z - 0.07, z + 0.07, '#f4f4f2')
for (x, z) in [(-6, -3), (7, -1.2)]: CEILV.cbox(x - 0.3, x + 0.3, H - 0.02, H - 0.005, z - 0.3, z + 0.3, '#e4e2dc'); [CEILV.cbox(x - 0.26, x + 0.26, H - 0.022, H - 0.02, z - 0.26 + k * 0.1, z - 0.22 + k * 0.1, '#9a9a96') for k in range(6)]

# ======================== 牆（照配置；開口：窗、門、門口、櫃台窗口） ========================
OUTER = {'S', 'N_l', 'N_o', 'N_s', 'W', 'E', 'E_o'}
DOOR_H = 2.15; WIN0, WIN1 = LAY['windows']['y0'], LAY['windows']['y1']
def opening_span(w, kind):
    if kind == 'window': return WIN0, WIN1
    if kind == 'counter': return w.get('sill', 1.05), w.get('head', 2.15)
    return 0.0, DOOR_H
def wall_seg(w, a, b_, y0, y1, key):
    at = w['at']; t2 = T / 2
    if w['axis'] == 'x': wm(w['id'], key).box(a, b_, y0, y1, at - t2, at + t2)
    else: wm(w['id'], key).box(at - t2, at + t2, y0, y1, a, b_)
for w in LAY['walls']:
    key = 'accent' if w['id'] == 'W' else 'wall'
    opens = sorted(w.get('open', []), key=lambda o: o[0]); cur = w['from']
    for (a, b_, kind) in opens:
        if a > cur: wall_seg(w, cur, a, 0.0, H, key)
        y0, y1 = opening_span(w, kind)
        if y0 > 0: wall_seg(w, a, b_, 0.0, y0, key)
        wall_seg(w, a, b_, y1, H, key); cur = b_
    if cur < w['to']: wall_seg(w, cur, w['to'], 0.0, H, key)
    # 外牆外面一層壁板（開口挖空，高到 H＋0.4：鏡頭比天花板高時從外面看）
    if w['id'] in OUTER:
        dx, _, dz = w['dir']; o = -(T / 2 + 0.012); at = w['at']; segs, cur = [], w['from']
        for (a, b_, kind) in opens:
            if a > cur: segs.append((cur, a, 0.0, H + 0.4))
            y0, y1 = opening_span(w, kind)
            if y0 > 0: segs.append((a, b_, 0.0, y0))
            segs.append((a, b_, y1, H + 0.4)); cur = b_
        if cur < w['to']: segs.append((cur, w['to'], 0.0, H + 0.4))
        for (a, b_, y0, y1) in segs:
            if w['axis'] == 'x':
                z = at + dz * o; pts = [(a, y0, z), (b_, y0, z), (b_, y1, z), (a, y1, z)]
                wm(w['id'], 'ext').quad(pts if dz < 0 else pts[::-1])
            else:
                x = at + dx * o; pts = [(x, y0, b_), (x, y0, a), (x, y1, a), (x, y1, b_)]
                wm(w['id'], 'ext').quad(pts if dx < 0 else pts[::-1])
        wm(w['id'], 'ext').box(*((w['from'] - 0.12, w['to'] + 0.12, H + 0.4, H + 0.55, at - 0.2, at + 0.2) if w['axis'] == 'x' else (at - 0.2, at + 0.2, H + 0.4, H + 0.55, w['from'] - 0.12, w['to'] + 0.12)))   # 屋簷
# 踢腳板（房間那一面；開口處不做；外牆只做裡面）
for w in LAY['walls']:
    opens = [(a, b_) for (a, b_, k) in w.get('open', []) if k not in ('window', 'counter')]
    segs, cur = [], w['from']
    for (a, b_) in sorted(opens):
        if a > cur: segs.append((cur, a))
        cur = b_
    if cur < w['to']: segs.append((cur, w['to']))
    sides = (1,) if w['id'] in OUTER else (1, -1)
    for (a, b_) in segs:
        for sd in sides:
            dx, _, dz = w['dir']; n = (dz if w['axis'] == 'x' else dx) * sd; o0 = w['at'] + n * (T / 2); o1 = o0 + n * 0.012
            if w['axis'] == 'x': wm(w['id'], 'trim').box(a, b_, 0.0, 0.1, min(o0, o1), max(o0, o1))
            else: wm(w['id'], 'trim').box(min(o0, o1), max(o0, o1), 0.0, 0.1, a, b_)

def frame(wid, a, b_, y0, y1, sides=(1, -1), t=0.06, sill=False):
    """開口的白色框（兩面）；sill＝窗台"""
    w = WALLS[wid]; dx, _, dz = w['dir']; nax = dz if w['axis'] == 'x' else dx
    for sd in sides:
        n = nax * sd; o0 = w['at'] + n * (T / 2 - 0.01); o1 = w['at'] + n * (T / 2 + 0.02)
        def bx(p0, p1, yy0, yy1, q0=o0, q1=o1):
            if w['axis'] == 'x': wm(wid, 'trim').box(p0, p1, yy0, yy1, min(q0, q1), max(q0, q1))
            else: wm(wid, 'trim').box(min(q0, q1), max(q0, q1), yy0, yy1, p0, p1)
        bx(a - t, a, y0, y1); bx(b_, b_ + t, y0, y1); bx(a - t, b_ + t, y1, y1 + t)
        if sill and y0 > 0.01: bx(a - t - 0.03, b_ + t + 0.03, y0 - 0.03, y0, w['at'] + n * (T / 2 - 0.02), w['at'] + n * (T / 2 + 0.07))
    # 開口的側面（牆厚）
    if w['axis'] == 'x':
        for u in (a, b_): wm(wid, 'trim').box(u - 0.005, u + 0.005, y0, y1, w['at'] - T / 2, w['at'] + T / 2)
    else:
        for u in (a, b_): wm(wid, 'trim').box(w['at'] - T / 2, w['at'] + T / 2, y0, y1, u - 0.005, u + 0.005)
def pane(wid, a, b_, y0, y1, mullions=1):
    """玻璃（牆線上）＋直櫺"""
    w = WALLS[wid]; at = w['at']
    if w['axis'] == 'x': wm(wid, 'glass').quad([(a, y0, at), (b_, y0, at), (b_, y1, at), (a, y1, at)])
    else: wm(wid, 'glass').quad([(at, y0, a), (at, y0, b_), (at, y1, b_), (at, y1, a)])
    for k in range(1, mullions + 1):
        u = a + (b_ - a) * k / (mullions + 1)
        if w['axis'] == 'x': wm(wid, 'trim').box(u - 0.02, u + 0.02, y0, y1, at - 0.03, at + 0.03)
        else: wm(wid, 'trim').box(at - 0.03, at + 0.03, y0, y1, u - 0.02, u + 0.02)
def blinds(wid, a, b_, y0, y1, frac):
    """白色百葉（房間那一面、拉下 frac）：一片一片的橫條"""
    w = WALLS[wid]; dx, _, dz = w['dir']; n = dz if w['axis'] == 'x' else dx; o = w['at'] + n * (T / 2 + 0.035); yb = y1 - (y1 - y0) * frac
    yy = y1 - 0.06
    while yy > yb:
        if w['axis'] == 'x': wm(wid, 'blinds').box(a + 0.02, b_ - 0.02, yy - 0.012, yy, o - 0.025, o + 0.025)
        else: wm(wid, 'blinds').box(o - 0.025, o + 0.025, yy - 0.012, yy, a + 0.02, b_ - 0.02)
        yy -= 0.05
    if w['axis'] == 'x': wm(wid, 'trim').box(a - 0.02, b_ + 0.02, y1 - 0.06, y1 + 0.02, o - 0.04, o + 0.04); wm(wid, 'trim').box(a + 0.02, b_ - 0.02, yb - 0.03, yb, o - 0.03, o + 0.03)
    else: wm(wid, 'trim').box(o - 0.04, o + 0.04, y1 - 0.06, y1 + 0.02, a - 0.02, b_ + 0.02); wm(wid, 'trim').box(o - 0.03, o + 0.03, yb - 0.03, yb, a + 0.02, b_ - 0.02)

BLIND = {(-9.4, 'S'): 0.35, (-6.0, 'S'): 0.3, (7.6, 'S'): 0.4, (-10.2, 'N_l'): 0.45, (-3.6, 'N_l'): 0.5, (0.4, 'W'): 0.35, (1.0, 'E'): 0.3}
for w in LAY['walls']:
    for (a, b_, kind) in w.get('open', []):
        if kind == 'window':
            frame(w['id'], a, b_, WIN0, WIN1, sides=(1,), sill=True); pane(w['id'], a, b_, WIN0, WIN1, 1); blinds(w['id'], a, b_, WIN0, WIN1, BLIND.get((a, w['id']), 0.4))
        elif kind in ('opening',):
            frame(w['id'], a, b_, 0.0, DOOR_H)
        elif kind == 'studyDoor':
            frame(w['id'], a, b_, 0.0, DOOR_H)
        elif kind == 'counter':
            pass

# ---- 大門（南牆）、往草地的玻璃門（北牆）：鋁框玻璃雙開門（關著）----
def glass_double(wid, a, b_, y1=DOOR_H, push=True):
    w = WALLS[wid]; at = w['at']; mid = (a + b_) / 2
    def bx(p0, p1, yy0, yy1, d=0.035):
        if w['axis'] == 'x': wm(wid, 'vcm').cbox(p0, p1, yy0, yy1, at - d, at + d, '#a7abb0')
        else: wm(wid, 'vcm').cbox(at - d, at + d, yy0, yy1, p0, p1, '#a7abb0')
    bx(a, a + 0.06, 0, y1); bx(b_ - 0.06, b_, 0, y1); bx(a, b_, y1 - 0.06, y1); bx(a, b_, 0, 0.1)
    bx(mid - 0.04, mid + 0.04, 0, y1)
    for (p0, p1) in ((a + 0.06, mid - 0.04), (mid + 0.04, b_ - 0.06)):
        if w['axis'] == 'x': wm(wid, 'glass').quad([(p0, 0.1, at), (p1, 0.1, at), (p1, y1 - 0.06, at), (p0, y1 - 0.06, at)])
        else: wm(wid, 'glass').quad([(at, 0.1, p0), (at, 0.1, p1), (at, y1 - 0.06, p1), (at, y1 - 0.06, p0)])
    if push:   # 門把：兩扇各一支直的拉桿（房間那一面）
        dx, _, dz = w['dir']; n = dz if w['axis'] == 'x' else dx
        for u in (mid - 0.14, mid + 0.14):
            if w['axis'] == 'x': wm(wid, 'vcm').cbox(u - 0.015, u + 0.015, 0.8, 1.3, at + n * 0.06, at + n * 0.09, '#c9ccd0')
            else: wm(wid, 'vcm').cbox(at + n * 0.06, at + n * 0.09, 0.8, 1.3, u - 0.015, u + 0.015, '#c9ccd0')
for w in LAY['walls']:
    for (a, b_, kind) in w.get('open', []):
        if kind in ('frontDoor', 'patioDoor'): glass_double(w['id'], a, b_); frame(w['id'], a, b_, 0.0, DOOR_H, sides=(1,))
# 交誼廳的門（US-CLUB-LOUNGE-CLOSE-1110，AA：12/14 晚上沒排晚餐的玩家走進會所，交誼廳的門關著；LOUNGE_DOOR 群組平常藏著，z.setLoungeClosed(true) 才看得到）：
# 門廳→交誼廳那個 1.6 m 的口，兩扇淺色木門關著（上半截一塊小玻璃窗、直的拉把）
lw = WALLS['lf']; la, lb = [o for o in lw['open'] if o[2] == 'opening'][0][:2]; lx = lw['at']; lm = (la + lb) / 2
grp('LOUNGE_DOOR', '交誼廳的門關著（12/14 晚上有聚餐、沒排晚餐的玩家：z.setLoungeClosed(true)）')
for (a, b_) in ((la + 0.01, lm - 0.004), (lm + 0.004, lb - 0.01)):
    acc('oak', 'LOUNGE_DOOR').box(lx - 0.022, lx + 0.022, 0.01, DOOR_H - 0.01, a, b_)
    c_ = (a + b_) / 2; acc('glass', 'LOUNGE_DOOR').quad([(lx + 0.0235, 1.45, c_ - 0.12), (lx + 0.0235, 1.45, c_ + 0.12), (lx + 0.0235, 1.85, c_ + 0.12), (lx + 0.0235, 1.85, c_ - 0.12)])
    acc('glass', 'LOUNGE_DOOR').quad([(lx - 0.0235, 1.45, c_ + 0.12), (lx - 0.0235, 1.45, c_ - 0.12), (lx - 0.0235, 1.85, c_ - 0.12), (lx - 0.0235, 1.85, c_ + 0.12)])
    for sx in (-1, 1): acc('vcm', 'LOUNGE_DOOR').cbox(lx + sx * 0.024 - 0.008, lx + sx * 0.024 + 0.008, 1.42, 1.88, c_ - 0.124, c_ - 0.116, '#b8bcc0'); acc('vcm', 'LOUNGE_DOOR').cbox(lx + sx * 0.024 - 0.008, lx + sx * 0.024 + 0.008, 1.42, 1.88, c_ + 0.116, c_ + 0.124, '#b8bcc0')
for zz in (lm - 0.07, lm + 0.07):   # 兩扇各一支直的拉把（兩面）
    for sx in (-1, 1): acc('vcm', 'LOUNGE_DOOR').cbox(lx + sx * 0.05 - 0.01, lx + sx * 0.05 + 0.01, 0.85, 1.25, zz - 0.01, zz + 0.01, '#c9ccd0'); acc('vcm', 'LOUNGE_DOOR').cbox(lx + sx * 0.03, lx + sx * 0.05, 0.9, 0.92, zz - 0.008, zz + 0.008, '#c9ccd0') if sx > 0 else acc('vcm', 'LOUNGE_DOOR').cbox(lx - 0.05, lx - 0.03, 0.9, 0.92, zz - 0.008, zz + 0.008, '#c9ccd0')
# 大門裡面的腳踏墊（深灰、有邊；不是全黑：BB P3 超市的地墊看起來像破洞）
V = acc('vc')
V.cbox(0.35, 1.65, 0.0, 0.012, 3.15, 3.85, '#5b5e61'); V.cbox(0.4, 1.6, 0.012, 0.014, 3.2, 3.8, '#6c6f72')
# 自習室的門：木門板開到底、貼著自習室這一面的牆（門軸在北邊 z 2.5，往自習室開 180°；門板不凸進房間——第一次預覽開 90°，凸進自習室 0.94 m、導航沒擋）
hz = 2.5; xw = 3.0 + T / 2
wm('fs', 'oak').box(xw + 0.01, xw + 0.05, 0.0, DOOR_H - 0.02, hz - 0.95, hz - 0.01)
wm('fs', 'vcm').cbox(xw + 0.05, xw + 0.11, 1.0, 1.06, hz - 0.88, hz - 0.82, '#c9ccd0'); wm('fs', 'vcm').cbox(xw, xw + 0.06, 0.0, 0.08, hz - 1.02, hz - 0.96, '#3a3c3f')   # 門把、門擋

# ======================== 門廳 ========================
F = {f['type'] + (f.get('id') or ''): f for f in FUR}
c = F['counter']
# 櫃台：門廳這一面的木櫃（下面一條踢腳、上面淺色木頭檯面往外凸 5 cm）
acc('oak').box(c['x0'] - 0.05, c['x1'] + 0.05, c['h'] - 0.04, c['h'], c['z0'] - 0.08, c['z1'] + 0.05)
V.cbox(c['x0'], c['x1'], 0.08, c['h'] - 0.04, c['z1'] - 0.03, c['z1'], '#7c6a56')
for k in range(1, 7): x = c['x0'] + (c['x1'] - c['x0']) * k / 7; V.cbox(x - 0.008, x + 0.008, 0.12, c['h'] - 0.08, c['z1'], c['z1'] + 0.006, '#6a5a48')
V.cbox(c['x0'], c['x1'], 0.0, 0.08, c['z1'] - 0.06, c['z1'] - 0.03, '#3e3a36')
# 窗口：鋁框、上面一個鐵捲百葉的箱子（一直都在）
wo = WALLS['fo']; o0, o1 = wo['open'][0][0], wo['open'][0][1]; ys, yh = wo['sill'], wo['head']
wm('fo', 'vcm').cbox(o0, o1, yh - 0.02, yh + 0.2, -0.16, 0.16, '#c4c7ca')
for u in (o0, o1): wm('fo', 'vcm').cbox(u - 0.03, u + 0.03, ys, yh, -0.11, 0.11, '#a7abb0')
wm('fo', 'oak').box(o0, o1, ys - 0.03, ys, -0.12, 0.12)
grp('SHUTTER_DOWN', '櫃台下班：鐵捲百葉拉下來（平日 09～17 以外；遊戲 US_CLUBHOUSE.officeOpen）')
acc('shutter', 'SHUTTER_DOWN').box(o0 + 0.03, o1 - 0.03, ys + 0.01, yh, -0.015, 0.015)
acc('vcm', 'SHUTTER_DOWN').cbox(o0 + 0.03, o1 - 0.03, ys + 0.01, ys + 0.06, -0.025, 0.025, '#8e9296')
# 櫃台的牌子（窗口上面）
tquad(acc('print'), [(o0 + 0.6, yh + 0.24, 0.17), (o1 - 0.6, yh + 0.24, 0.17), (o1 - 0.6, yh + 0.56, 0.17), (o0 + 0.6, yh + 0.56, 0.17)], 'sign_office')
# 辦公室裡（從窗口看得到）：辦公桌、螢幕、鍵盤、辦公椅、檔案櫃、書架、資料夾
od = F['officeDesk']
acc('oak').box(od['x0'], od['x1'], 0.72, 0.75, od['z0'], od['z1'])
for x in (od['x0'] + 0.04, od['x1'] - 0.08): V.cbox(x, x + 0.04, 0.0, 0.72, od['z0'] + 0.04, od['z1'] - 0.04, '#d8d6d0')
V.cbox(0.75, 1.05, 0.75, 0.78, -0.95, -0.82, '#2b2c2f'); V.cbox(0.88, 0.92, 0.78, 0.96, -1.12, -1.06, '#2b2c2f'); acc('tv').box(0.62, 1.18, 0.96, 1.3, -1.14, -1.11)
V.cbox(0.6, 1.0, 0.75, 0.77, -0.82, -0.68, '#333438')
V.cbox(0.65, 1.15, 0.45, 0.52, -0.52, -0.08, '#30333a'); V.cbox(0.65, 1.15, 0.5, 1.0, -0.12, -0.05, '#30333a'); V.cbox(0.87, 0.93, 0.0, 0.45, -0.33, -0.27, '#2a2a2c')
V.cbox(2.3, 2.85, 0.0, 1.3, -1.25, -0.6, '#b9bcbe')
for k in range(4): V.cbox(2.33, 2.82, 0.12 + k * 0.3, 0.14 + k * 0.3, -0.59, -0.585, '#8e9295')
acc('oak').box(-0.9, 0.6, 1.4, 1.43, -3.9, -3.6); acc('oak').box(-0.9, 0.6, 1.85, 1.88, -3.9, -3.6)
for k in range(14):
    x = -0.85 + k * 0.1; V.cbox(x, x + 0.07, 1.43, 1.73, -3.88, -3.62, rnd.choice(['#2f4f7a', '#7a2f2f', '#2f6a4a', '#d8d2c0', '#3a3a3e']))
V.cbox(-0.8, -0.5, 0.0, 0.32, -0.5, -0.2, '#5a5550'); acc('vc').ell((-0.65, 0.65, -0.35), 0.22, 0.32, 0.22); V.paint(newf(V), '#4f7a4a')
# 信件架（東牆）：木框、4 排 6 格、格子裡深色、幾封信
mr = F['mailRack']
acc('oak').box(mr['x0'], mr['x1'], mr['y0'], mr['y1'], mr['z0'], mr['z1'])
nr, nc = 4, 6; ch = (mr['y1'] - mr['y0'] - 0.04) / nr; cw = (mr['z1'] - mr['z0'] - 0.04) / nc
for r_ in range(nr):
    for c_ in range(nc):
        y0 = mr['y0'] + 0.02 + r_ * ch; z0 = mr['z0'] + 0.02 + c_ * cw
        V.cbox(mr['x0'] - 0.002, mr['x0'] + 0.001, y0 + 0.015, y0 + ch - 0.04, z0 + 0.012, z0 + cw - 0.012, '#3d342c')
        if rnd.random() < 0.35: V.cbox(mr['x0'] - 0.01, mr['x0'] + 0.08, y0 + 0.02, y0 + ch * 0.6, z0 + 0.03, z0 + cw - 0.05, '#f2efe8')
tquad(acc('print'), [(mr['x0'] - 0.003, mr['y0'] - 0.17, mr['z0']), (mr['x0'] - 0.003, mr['y0'] - 0.17, mr['z1']), (mr['x0'] - 0.003, mr['y0'] - 0.03, mr['z1']), (mr['x0'] - 0.003, mr['y0'] - 0.03, mr['z0'])], 'mailplates')
# 盆栽（門廳西南角）
pl = F['plant']; V.cbox(pl['x'] - 0.2, pl['x'] + 0.2, 0.0, 0.42, pl['z'] - 0.2, pl['z'] + 0.2, '#c9c2b4')
for k in range(9):
    a = k / 9 * math.tau; r_ = 0.14 + 0.08 * (k % 2); acc('vc').ell((pl['x'] + math.cos(a) * r_, 0.75 + 0.25 * (k % 3) / 2, pl['z'] + math.sin(a) * r_), 0.13, 0.28, 0.08, seg=8, rings=5, matrix=Matrix.Rotation(a, 4, 'Z') @ Matrix.Rotation(0.3, 4, 'X'))
    V.paint(newf(V), rnd.choice(['#3f6e3a', '#4c7d45', '#36603a']))
# 門廳的牌子：往交誼廳、往自習室
wall_card(acc('print'), 'lf', 1.5, 2.9, 2.3, 2.46, 'sign_lounge')   # 交誼廳的門口上面（門廳那一面：lf 的 dir 朝交誼廳，房間那一面在 −dir）
# 時鐘（門廳北牆、窗口的東邊）
tquad(acc('print'), [(2.5, 1.95, 0.105), (2.8, 1.95, 0.105), (2.8, 2.25, 0.105), (2.5, 2.25, 0.105)], 'clock')

# ======================== 交誼廳 ========================
tv = F['tvConsole']
acc('oak').box(tv['x'] - tv['d'] / 2, tv['x'] + tv['d'] / 2, 0.08, 0.5, tv['z'] - tv['w'] / 2, tv['z'] + tv['w'] / 2)
V.cbox(tv['x'] - tv['d'] / 2 + 0.03, tv['x'] + tv['d'] / 2 - 0.03, 0.0, 0.08, tv['z'] - tv['w'] / 2 + 0.05, tv['z'] + tv['w'] / 2 - 0.05, '#2c2b2a')
for k in (-1, 1): V.cbox(tv['x'] + tv['d'] / 2, tv['x'] + tv['d'] / 2 + 0.004, 0.12, 0.46, tv['z'] + k * 0.42 - 0.38, tv['z'] + k * 0.42 + 0.38, '#b39270')
acc('tv').box(-10.92, -10.86, 0.95, 1.7, tv['z'] - 0.67, tv['z'] + 0.67)
V.cbox(-10.93, -10.88, 0.93, 1.72, tv['z'] - 0.69, tv['z'] + 0.69, '#1c1d20')
V.cbox(-10.62, -10.5, 0.5, 0.56, tv['z'] - 0.35, tv['z'] - 0.05, '#2a2b2e')   # 遊戲機
# L 型沙發（布）：長的那一段（面向西）、短的那一段（靠北牆、面向南）、轉角
sl, ss = F['sofaLong'], F['sofaShort']; FAB = acc('fabric')
FAB.rbox(sl['x0'], sl['x1'], 0.12, 0.42, ss['z0'], sl['z1'], r=0.03)                         # 長的＋轉角的座墊底座
FAB.rbox(sl['x1'] - 0.28, sl['x1'], 0.12, 0.86, ss['z0'], sl['z1'], r=0.05)                  # 長的靠背
FAB.rbox(sl['x0'], sl['x1'], 0.12, 0.62, sl['z1'] - 0.22, sl['z1'], r=0.05)                  # 南端扶手
FAB.rbox(ss['x0'], sl['x0'], 0.12, 0.42, ss['z0'], ss['z1'], r=0.03)                         # 短的座墊底座
FAB.rbox(ss['x0'], sl['x1'], 0.12, 0.86, ss['z0'], ss['z0'] + 0.28, r=0.05)                  # 短的靠背（接到轉角）
FAB.rbox(ss['x0'], ss['x0'] + 0.22, 0.12, 0.62, ss['z0'], ss['z1'], r=0.05)                  # 西端扶手
for (z0, z1) in ((-2.75, -1.95), (-1.95, -1.15), (-1.15, -0.4)): FAB.rbox(sl['x0'] + 0.02, sl['x1'] - 0.3, 0.42, 0.55, z0 + 0.01, z1 - 0.23 if z1 > -0.5 else z1 - 0.01, r=0.04)
FAB.rbox(sl['x0'] + 0.02, sl['x1'] - 0.3, 0.42, 0.55, ss['z0'] + 0.3, -2.76, r=0.04)
FAB.rbox(ss['x0'] + 0.24, sl['x0'] - 0.01, 0.42, 0.55, ss['z0'] + 0.3, ss['z1'] - 0.02, r=0.04)
for (x, z0, z1) in ((sl['x1'] - 0.33, -2.6, -2.1), (sl['x1'] - 0.33, -1.0, -0.6)): V.crbox(x - 0.1, x, 0.5, 0.88, z0, z1, rnd.choice(['#c9b38a', '#8f6b4f', '#d6d0c4']), r=0.04)
for x in (ss['x0'] + 0.25, sl['x0'] + 0.1):
    for z in (ss['z1'] - 0.05, sl['z1'] - 0.03): V.cbox(x, x + 0.05, 0.0, 0.12, z - 0.05, z, '#2a2724')
# 茶几、地毯
ct = F['coffeeTable']; acc('oak').box(ct['x0'], ct['x1'], ct['h'] - 0.04, ct['h'], ct['z0'], ct['z1'])
for x in (ct['x0'] + 0.04, ct['x1'] - 0.06):
    for z in (ct['z0'] + 0.04, ct['z1'] - 0.06): V.cbox(x, x + 0.025, 0.0, ct['h'] - 0.04, z, z + 0.025, '#2d2e30')
V.cbox(ct['x0'] + 0.1, ct['x0'] + 0.32, ct['h'], ct['h'] + 0.02, ct['z0'] + 0.2, ct['z0'] + 0.5, '#7c3b33')   # 雜誌
rg = F['rug']; V.cbox(rg['x0'], rg['x1'], 0.002, 0.008, rg['z0'], rg['z1'], '#6e7c8a'); V.cbox(rg['x0'] + 0.12, rg['x1'] - 0.12, 0.008, 0.009, rg['z0'] + 0.12, rg['z1'] - 0.12, '#8e9aa6')
# 落地燈（沙發南端旁邊、靠牆不擋路：在地毯西南角外）
V.cbox(-10.62, -10.42, 0.0, 0.03, -0.3, -0.1, '#2b2b2d'); V.cbox(-10.535, -10.505, 0.03, 1.55, -0.215, -0.185, '#2b2b2d'); acc('lamp').cyl((-10.52, 1.45, -0.2), (-10.52, 1.75, -0.2), 0.17, seg=14, r2=0.13)
# 小廚房（東牆）：下櫃、檯面、水槽、微波爐、吊櫃、磁磚、咖啡機、紙巾
cr = F['counterRun']
V.cbox(cr['x0'] + 0.03, cr['x1'], 0.1, cr['h'] - 0.04, cr['z0'], cr['z1'], '#eeede8'); V.cbox(cr['x0'] + 0.06, cr['x1'], 0.0, 0.1, cr['z0'], cr['z1'], '#3a3836')
nd = 4
for k in range(nd + 1): z = cr['z0'] + (cr['z1'] - cr['z0']) * k / nd; V.cbox(cr['x0'] + 0.025, cr['x0'] + 0.03, 0.12, cr['h'] - 0.06, z - 0.004, z + 0.004, '#c9c7c0')
for k in range(nd): z = cr['z0'] + (cr['z1'] - cr['z0']) * (k + 0.5) / nd; acc('vcm').cbox(cr['x0'] + 0.0, cr['x0'] + 0.025, cr['h'] - 0.18, cr['h'] - 0.16, z - 0.08, z + 0.08, '#b8bbbe')
V.cbox(cr['x0'] - 0.03, cr['x1'], cr['h'] - 0.04, cr['h'], cr['z0'], cr['z1'], '#77736d')   # 檯面（灰色石英，不是黑）
sz = cr['sink']; acc('vcm').cbox(cr['x0'] + 0.05, cr['x1'] - 0.07, cr['h'] - 0.005, cr['h'] + 0.002, sz - 0.3, sz + 0.3, '#a9adb1'); acc('vcm').cbox(cr['x0'] + 0.08, cr['x1'] - 0.1, cr['h'] - 0.14, cr['h'] - 0.004, sz - 0.27, sz + 0.27, '#8f9397')
FV = acc('vcm'); FV.cyl((cr['x1'] - 0.06, cr['h'], sz), (cr['x1'] - 0.06, cr['h'] + 0.32, sz), 0.016, seg=8); FV.paint(newf(FV), '#c9ccd0'); FV.cyl((cr['x1'] - 0.06, cr['h'] + 0.32, sz), (cr['x1'] - 0.24, cr['h'] + 0.3, sz), 0.014, seg=8); FV.paint(newf(FV), '#c9ccd0')
for m_ in newf(acc('vcm')): pass
mz = cr['microwave']; V.cbox(cr['x0'] + 0.04, cr['x1'] - 0.03, cr['h'], cr['h'] + 0.3, mz - 0.26, mz + 0.26, '#2c2e30')
tquad(acc('print'), [(cr['x0'] + 0.039, cr['h'] + 0.02, mz - 0.25), (cr['x0'] + 0.039, cr['h'] + 0.02, mz + 0.25), (cr['x0'] + 0.039, cr['h'] + 0.28, mz + 0.25), (cr['x0'] + 0.039, cr['h'] + 0.28, mz - 0.25)], 'microwave')
V.cbox(cr['x0'] + 0.12, cr['x1'] - 0.08, cr['h'], cr['h'] + 0.34, -1.75, -1.5, '#1e1f21'); V.cbox(cr['x0'] + 0.1, cr['x0'] + 0.2, cr['h'] + 0.02, cr['h'] + 0.12, -1.7, -1.55, '#d9d6cf')   # 咖啡機
V.cbox(cr['x1'] - 0.33, cr['x1'], 1.45, 2.15, cr['z0'], cr['z1'], '#eeede8'); V.cbox(cr['x1'] - 0.34, cr['x1'] - 0.33, 1.47, 2.13, cr['z0'] + 0.02, cr['z1'] - 0.02, '#e2e1dc')
for k in range(nd + 1): z = cr['z0'] + (cr['z1'] - cr['z0']) * k / nd; V.cbox(cr['x1'] - 0.345, cr['x1'] - 0.335, 1.47, 2.13, z - 0.004, z + 0.004, '#c9c7c0')
# 磁磚：lf 牆的交誼廳那一面（x = −1 − T/2）
xs_ = -1.0 - T / 2 - 0.006; acc('splash').quad([(xs_, cr['h'], cr['z0']), (xs_, cr['h'], cr['z1']), (xs_, 1.45, cr['z1']), (xs_, 1.45, cr['z0'])])
# 熱飲販賣機（面向西）
vd = F['vending']; vx0, vx1 = vd['x'] - vd['d'] / 2, vd['x'] + vd['d'] / 2; vz0, vz1 = vd['z'] - vd['w'] / 2, vd['z'] + vd['w'] / 2
V.crbox(vx0 + 0.02, vx1, 0.05, 1.83, vz0, vz1, '#6a2621', r=0.02); V.cbox(vx0 + 0.04, vx1 - 0.04, 0.0, 0.05, vz0 + 0.04, vz1 - 0.04, '#2a2726')
tquad(acc('print'), [(vx0 + 0.015, 0.12, vz0 + 0.04), (vx0 + 0.015, 0.12, vz1 - 0.04), (vx0 + 0.015, 1.78, vz1 - 0.04), (vx0 + 0.015, 1.78, vz0 + 0.04)], 'vending')
acc('vcm').cbox(vx0 + 0.0, vx0 + 0.02, 0.98, 1.12, vz0 + 0.1, vz0 + 0.16, '#b8bbbe')
# 交誼廳的海報（南牆、門口兩邊）、掛畫（北牆）、時鐘（東牆）
wall_card(acc('print'), 'S', -3.6, -3.0, 1.2, 2.0, 'fly_movie'); wall_card(acc('print'), 'S', -2.7, -2.1, 1.2, 2.0, 'fly_recycle')
for (a, reg) in ((-8.3, 'art0'), (-4.9, 'art1')):
    wall_card(acc('print'), 'N_l', a, a + 1.0, 1.25, 2.01, reg, off=0.04)
    w_ = WALLS['N_l']; z = w_['at'] + T / 2; V.cbox(a - 0.04, a + 1.04, 1.21, 2.05, z, z + 0.035, '#2e2b28')
w_ = WALLS['lf']; tquad(acc('print'), [(-1.11, 2.05, 0.25), (-1.11, 2.05, 0.55), (-1.11, 2.35, 0.55), (-1.11, 2.35, 0.25)], 'clock')

# ---- 兩張長桌：平常（TABLES_APART）、併起來（TABLES_MERGED）＋晚餐（DINNER_SET）----
lt = F['longTables']
def table(g, cx, cz, w, d, h):
    acc('oak', g).box(cx - w / 2, cx + w / 2, h - 0.035, h, cz - d / 2, cz + d / 2)
    for sx in (-1, 1):
        x = cx + sx * (w / 2 - 0.12); acc('vcm', g).cbox(x - 0.03, x + 0.03, 0.0, h - 0.035, cz - d / 2 + 0.08, cz + d / 2 - 0.08, '#3a3c3f'); acc('vcm', g).cbox(x - 0.04, x + 0.04, 0.0, 0.03, cz - d / 2 + 0.05, cz + d / 2 - 0.05, '#3a3c3f')
    acc('vcm', g).cbox(cx - w / 2 + 0.12, cx + w / 2 - 0.12, h - 0.12, h - 0.06, cz - 0.02, cz + 0.02, '#3a3c3f')
def chair(g, s, col='#b48d63'):
    """椅子（座面朝 yaw；人坐在 s 的位置）：木座面、木靠背、黑色鐵腳"""
    x, z, yaw = s['x'], s['z'], s['yaw']; fx, fz = math.sin(yaw), math.cos(yaw)
    def at(u, v): return (x + u * fz + v * fx, z - u * fx + v * fz)   # u＝左右、v＝前後（前＝面向的方向）
    def box(u0, u1, y0, y1, v0, v1, colr, m='vc'):
        ps = [at(u, v) for u in (u0, u1) for v in (v0, v1)]; xs, zs = [p[0] for p in ps], [p[1] for p in ps]
        acc(m, g).cbox(min(xs), max(xs), y0, y1, min(zs), max(zs), colr)
    box(-0.22, 0.22, 0.43, 0.46, -0.2, 0.22, col)
    box(-0.22, 0.22, 0.62, 0.86, -0.25, -0.22, col)
    for (u, v) in ((-0.19, -0.19), (0.19, -0.19), (-0.19, 0.19), (0.19, 0.19)): box(u - 0.015, u + 0.015, 0.0, 0.43, v - 0.015, v + 0.015, '#2f3134', 'vcm')
    for u in (-0.19, 0.19): box(u - 0.012, u + 0.012, 0.46, 0.84, -0.245, -0.22, '#2f3134', 'vcm')
grp('TABLES_APART', '交誼廳的兩張長桌：平常分開（中間 0.9 m）')
for x in lt['apart']: table('TABLES_APART', x, lt['z'], lt['w'], lt['d'], lt['h'])
for s in LAY['seats']:
    if s.get('set') == 'apart': chair('TABLES_APART', s)
# 平常的桌上：一台筆電、一個馬克杯、桌遊盒
acc('vc', 'TABLES_APART').cbox(-8.15, -7.8, 0.75, 0.765, 1.55, 1.8, '#9fa3a8'); acc('vc', 'TABLES_APART').cbox(-8.15, -7.8, 0.765, 0.98, 1.53, 1.55, '#2a2b2e')
acc('vc', 'TABLES_APART').cyl((-4.2, 0.75, 2.2), (-4.2, 0.85, 2.2), 0.04, seg=10); acc('vc', 'TABLES_APART').paint(newf(acc('vc', 'TABLES_APART')), '#c94f3f')
acc('vc', 'TABLES_APART').cbox(-5.0, -4.7, 0.75, 0.8, 1.75, 2.0, '#3c6aa0')
grp('TABLES_MERGED', '交誼廳的兩張長桌併成一張（12/14 會所晚餐：z.setDinner(true)）')
for x in lt['merged']: table('TABLES_MERGED', x, lt['z'], lt['w'], lt['d'], lt['h'])
for s in LAY['seats']:
    if s.get('set') == 'merged': chair('TABLES_MERGED', s)
grp('DINNER_SET', '12/14 晚餐：白色桌巾、每個位子一套碗盤、桌子中間一排菜')
x0, x1 = lt['merged'][0] - lt['w'] / 2 - 0.05, lt['merged'][1] + lt['w'] / 2 + 0.05; z0, z1 = lt['z'] - lt['d'] / 2 - 0.05, lt['z'] + lt['d'] / 2 + 0.05; hy = lt['h'] + 0.003
DV = acc('vc', 'DINNER_SET')
DV.cbox(x0, x1, hy - 0.002, hy, z0, z1, '#f5f3ee')
for (a, b_, p0, p1) in ((x0, x1, z0 - 0.005, z0), (x0, x1, z1, z1 + 0.005)): DV.cbox(a, b_, hy - 0.28, hy, p0, p1, '#f1efe9')
for (p0, p1) in ((x0 - 0.005, x0), (x1, x1 + 0.005)): DV.cbox(p0, p1, hy - 0.28, hy, z0, z1, '#f1efe9')
for s in LAY['seats']:
    if s.get('set') != 'merged': continue
    fx, fz = math.sin(s['yaw']), math.cos(s['yaw']); px, pz = s['x'] + fx * 0.42, s['z'] + fz * 0.42
    DV.cyl((px, hy, pz), (px, hy + 0.015, pz), 0.12, seg=16); DV.paint(newf(DV), '#fbfbf8')
    DV.cyl((px + fz * 0.2, hy, pz - fx * 0.2), (px + fz * 0.2, hy + 0.1, pz - fx * 0.2), 0.035, seg=10); DV.paint(newf(DV), '#e8eef2')
    DV.cbox(px - fz * 0.17 - 0.01, px - fz * 0.17 + 0.01, hy, hy + 0.006, pz - 0.1, pz + 0.1, '#c9ccd0') if abs(fx) < 0.5 else DV.cbox(px - 0.1, px + 0.1, hy, hy + 0.006, pz + fx * 0.17 - 0.01, pz + fx * 0.17 + 0.01, '#c9ccd0')
dishes = [('#c98a3a', 0.16, 0.08), ('#7a4a2a', 0.15, 0.1), ('#4f8a3a', 0.14, 0.07), ('#d8c27a', 0.17, 0.06), ('#b8452f', 0.15, 0.09), ('#e6dcc4', 0.16, 0.12)]
for k, x in enumerate([-8.0 + i * 0.85 for i in range(6)]):
    col, r_, h_ = dishes[k]; DV.cyl((x, hy, lt['z']), (x, hy + 0.05, lt['z']), r_ + 0.03, seg=18, r2=r_ + 0.05); DV.paint(newf(DV), '#f4f2ec')
    DV.cyl((x, hy + 0.02, lt['z']), (x, hy + 0.02 + h_, lt['z']), r_, seg=16, r2=r_ * 0.7); DV.paint(newf(DV), col)
DV.cyl((-3.85, hy, lt['z']), (-3.85, hy + 0.2, lt['z']), 0.16, seg=18); DV.paint(newf(DV), '#5b5f63')   # 一鍋（祐廷帶的茶葉蛋或泡麵：鍋子，內容看不到）
DV.cbox(-6.25, -6.05, hy, hy + 0.28, lt['z'] - 0.1, lt['z'] + 0.1, '#e4dccb'); DV.cbox(-6.2, -6.1, hy + 0.28, hy + 0.33, lt['z'] - 0.03, lt['z'] + 0.03, '#c94f3f')   # 一盒果汁

# ---- 聖誕樹（12/1 起）＋燈（晚上亮）----
xt = F['xmasTree']; tx, tz, th = xt['x'], xt['z'], xt['h']
grp('XMAS_TREE', '聖誕樹（12/1 起到離開；AA_741）')
XV = acc('vc', 'XMAS_TREE')
XV.cbox(tx - 0.24, tx + 0.24, 0.0, 0.3, tz - 0.24, tz + 0.24, '#8a3a32'); XV.cbox(tx - 0.26, tx + 0.26, 0.28, 0.32, tz - 0.26, tz + 0.26, '#d8c58a')
XV.cyl((tx, 0.3, tz), (tx, 0.55, tz), 0.05, seg=8); XV.paint(newf(XV), '#5a3e2a')
tiers = [(0.5, 0.62, 1.05), (0.95, 0.5, 0.85), (1.35, 0.4, 0.7), (1.7, 0.28, 0.5), (2.0, 0.17, 0.32)]
for (y0, r_, hh) in tiers:
    XV.cyl((tx, y0, tz), (tx, y0 + hh, tz), r_, seg=14, r2=0.02); XV.paint(newf(XV), '#2c5a3a')
    for k in range(10):
        a = k / 10 * math.tau + y0; XV.cyl((tx + math.cos(a) * r_ * 0.15, y0 + 0.05, tz + math.sin(a) * r_ * 0.15), (tx + math.cos(a) * r_ * 1.02, y0 + 0.02, tz + math.sin(a) * r_ * 1.02), 0.05, seg=4, r2=0.02); XV.paint(newf(XV), '#25503a')
for k in range(26):
    y = 0.6 + (k / 26) * 1.5; rr = 0.62 * (1 - (y - 0.5) / 1.9) + 0.03; a = k * 2.4
    XV.sphere((tx + math.cos(a) * rr, y, tz + math.sin(a) * rr), 0.04, seg=8, rings=5); XV.paint(newf(XV), rnd.choice(['#b8322b', '#d8b24a', '#c9ccd0', '#3f6aa8']))
for k in range(5):   # 星星
    a = k / 5 * math.tau; XV.cyl((tx, th + 0.05, tz), (tx + math.cos(a) * 0.12, th + 0.05 + math.sin(a) * 0.12, tz), 0.03, seg=4, r2=0.005); XV.paint(newf(XV), '#e8c64a')
for (dx, dz, w_, col) in ((0.45, 0.1, 0.3, '#3f6aa8'), (-0.2, 0.45, 0.26, '#b8322b'), (0.3, -0.42, 0.22, '#d8b24a')):
    XV.cbox(tx + dx - w_ / 2, tx + dx + w_ / 2, 0.0, w_ * 0.8, tz + dz - w_ / 2, tz + dz + w_ / 2, col); XV.cbox(tx + dx - 0.02, tx + dx + 0.02, 0.0, w_ * 0.8 + 0.005, tz + dz - w_ / 2 - 0.002, tz + dz + w_ / 2 + 0.002, '#f2efe6')
grp('XMAS_LIGHTS', '聖誕樹的燈（晚上亮；遊戲照時段開關）')
XL = acc('xmas', 'XMAS_LIGHTS')
for k in range(64):
    y = 0.55 + (k / 64) * 1.6; rr = 0.64 * (1 - (y - 0.5) / 1.9) + 0.04; a = k * 0.9
    XL.sphere((tx + math.cos(a) * rr, y, tz + math.sin(a) * rr), 0.018, seg=6, rings=4)

# ======================== 自習室 ========================
for f in FUR:
    if f['type'] != 'studyTable': continue
    x, z, w, d, h = f['x'], f['z'], f['w'], f['d'], f['h']
    acc('oak').box(x - w / 2, x + w / 2, h - 0.035, h, z - d / 2, z + d / 2)
    for sx in (-1, 1): V.cbox(x + sx * (w / 2 - 0.06) - 0.03, x + sx * (w / 2 - 0.06) + 0.03, 0.0, h - 0.035, z - d / 2 + 0.06, z + d / 2 - 0.06, '#4a4d52')
    V.cbox(x - w / 2 + 0.1, x + w / 2 - 0.1, h - 0.3, h - 0.035, z - 0.012, z + 0.012, '#4a4d52')   # 中間的擋板（兩邊的人看不到對方的腳）
    # 每個座位一個插座（桌面中間的長條插座盒）
    acc('vcm').cbox(x - 0.5, x + 0.5, h, h + 0.05, z - 0.05, z + 0.05, '#c3c6c9')
    for k in range(4): V.cbox(x - 0.42 + k * 0.28, x - 0.36 + k * 0.28, h + 0.05, h + 0.052, z - 0.03, z + 0.03, '#2c2d30')
    # 檯燈（桌子中間偏東）
    lx = x + 0.0; acc('vcm').cbox(lx - 0.07, lx + 0.07, h + 0.05, h + 0.07, z - 0.07, z + 0.07, '#2f3134'); LV = acc('vcm'); LV.cyl((lx, h + 0.07, z), (lx, h + 0.36, z), 0.012, seg=6); LV.paint(newf(LV), '#2f3134')
    V.cyl((lx, h + 0.34, z), (lx, h + 0.48, z), 0.13, seg=14, r2=0.07); V.paint(newf(V), '#e6e1d4')
    acc('lamp').cyl((lx, h + 0.33, z), (lx, h + 0.34, z), 0.11, seg=12)
for s in LAY['seats']:
    if s['room'] == 'study': chair('', s, '#a8865f')
# 學姊的桌上（東北）：一疊書、筆記本；舊序章人物己的桌上（東南）：筆電、厚厚的判例書（平常就有）
for (x, z, col) in ((9.35, -0.6, '#2f4f7a'), (9.6, -0.55, '#7a2f2f')): V.cbox(x - 0.12, x + 0.12, 0.74, 0.79, z - 0.16, z + 0.16, col)
V.cbox(9.18, 9.52, 0.74, 0.755, 2.2, 2.44, '#9fa3a8'); V.cbox(9.6, 9.82, 0.74, 0.82, 2.0, 2.3, '#6a2f2a')
# 軟木公布欄（北牆）＋上面的紙
cb = F['corkBoard']; w_ = WALLS['N_s']; zc = w_['at'] + T / 2
acc('oak').box(cb['x0'] - 0.05, cb['x1'] + 0.05, cb['y0'] - 0.05, cb['y1'] + 0.05, zc, zc + 0.03)
acc('cork').quad([(cb['x0'], cb['y0'], zc + 0.032), (cb['x1'], cb['y0'], zc + 0.032), (cb['x1'], cb['y1'], zc + 0.032), (cb['x0'], cb['y1'], zc + 0.032)])
for (x, y, reg, s_) in ((4.0, 1.55, 'paper0', 0.36), (4.42, 1.2, 'paper1', 0.36), (5.3, 1.6, 'fly_quiet', 0.34), (5.28, 1.12, 'paper2', 0.3)):
    hw = s_ / 2 * (1.48 if reg.startswith('paper') else 0.74); hh = s_ / 2 if reg.startswith('paper') else s_ / 2
    tquad(acc('print'), [(x - hw, y - hh, zc + 0.036), (x + hw, y - hh, zc + 0.036), (x + hw, y + hh, zc + 0.036), (x - hw, y + hh, zc + 0.036)], reg)
    V.sphere((x, y + hh - 0.02, zc + 0.045), 0.008, seg=6, rings=4); V.paint(newf(V), rnd.choice(['#c9322b', '#2f5fa8', '#e2b23a']))
grp('CORK_NOTICE', 'ev_usl_long3 開頭：公布欄多貼的一張單子（z.setNotice(true)）')
x, y = 4.86, 1.48; tquad(acc('print', 'CORK_NOTICE'), [(x - 0.13, y - 0.17, zc + 0.04), (x + 0.13, y - 0.17, zc + 0.04), (x + 0.13, y + 0.17, zc + 0.04), (x - 0.13, y + 0.17, zc + 0.04)], 'notice')
acc('vc', 'CORK_NOTICE').sphere((x, y + 0.15, zc + 0.05), 0.009, seg=6, rings=4); acc('vc', 'CORK_NOTICE').paint(newf(acc('vc', 'CORK_NOTICE')), '#c9322b')
# 自習室的牌子（門口上面，門廳那一面）、時鐘（西牆，自習室那一面）
w_ = WALLS['fs']; xf = w_['at'] - T / 2 - 0.012
tquad(acc('print'), [(xf, 2.28, 2.55), (xf, 2.28, 3.45), (xf, 2.44, 3.45), (xf, 2.44, 2.55)], 'sign_study')
xs2 = w_['at'] + T / 2 + 0.012; tquad(acc('print'), [(xs2, 2.0, 0.9), (xs2, 2.0, 0.6), (xs2, 2.3, 0.6), (xs2, 2.3, 0.9)], 'clock')
# 窗台上的書（東牆的窗，窗台內側）
w_ = WALLS['E']; xe = w_['at'] - T / 2 - 0.05; u0, v0, u1, v1 = ATLAS['books']
for k in range(3):
    z0 = 1.15 + k * 0.32; tquad(acc('print'), [(xe, WIN0, z0), (xe, WIN0, z0 + 0.28), (xe, WIN0 + 0.24, z0 + 0.28), (xe, WIN0 + 0.24, z0)], (u0 + k * 0.08, v0, u0 + k * 0.08 + 0.25, v1))
# 學姊旁邊那張椅子上的外套（挽回中；z.setSisCoat(true)）
grp('SIS_COAT', '學姊旁邊那張椅子上放著她的外套（挽回中，不能坐；AA_741 第 3 節）')
sn = SEATS[LAY['npc']['sisNext']]; CV = acc('vc', 'SIS_COAT'); x, z = sn['x'], sn['z']   # yaw 0：面向南（+z），靠背在北邊（z − 0.24）
CV.crbox(x - 0.24, x + 0.24, 0.46, 0.52, z - 0.2, z + 0.12, '#7e6450', r=0.03)
CV.crbox(x - 0.25, x + 0.25, 0.5, 0.9, z - 0.29, z - 0.21, '#7e6450', r=0.03)
CV.crbox(x - 0.25, x + 0.25, 0.86, 0.92, z - 0.34, z - 0.2, '#6f5644', r=0.02)
CV.crbox(x + 0.16, x + 0.27, 0.2, 0.5, z - 0.05, z + 0.08, '#7e6450', r=0.03)   # 一隻袖子垂下來
# 讀書計畫（學姊那張桌子；z.setPlan(true)）
grp('SIS_PLAN', 'ev_sis_plan_us：學姊那張桌上攤著讀書計畫（兩張紙＋一支筆）')
sg = SEATS[LAY['npc']['sis']]; y = 0.742
for (dx, rot) in ((-0.45, 0.06), (-0.05, -0.04)):
    cx, cz = sg['x'] + dx, sg['z'] + 0.42; c_, s_ = math.cos(rot), math.sin(rot); hw, hd = 0.15, 0.2
    pts = [(cx + (-hw) * c_ - (hd) * s_, y, cz + (-hw) * s_ + (hd) * c_), (cx + (hw) * c_ - (hd) * s_, y, cz + (hw) * s_ + (hd) * c_), (cx + (hw) * c_ - (-hd) * s_, y, cz + (hw) * s_ + (-hd) * c_), (cx + (-hw) * c_ - (-hd) * s_, y, cz + (-hw) * s_ + (-hd) * c_)]
    tquad(acc('print', 'SIS_PLAN'), pts, 'plan')
acc('vc', 'SIS_PLAN').cbox(sg['x'] - 0.2, sg['x'] - 0.06, y, y + 0.01, sg['z'] + 0.5, sg['z'] + 0.51, '#2f5fa8')

# ======================== 收尾 ========================
for (g, k), m in _acc.items():
    parent = GROUPS[g] if g else root
    m.finish(parent, uv=k not in ('vc', 'vcm', 'vcg', 'print'), smooth=False)
CEIL.finish(root, uv=False); CEILV.finish(root, uv=False)
for wid, ms in walls.items():
    w = WALLS[wid]; props = {'dir': w['dir']}
    if w.get('partition'): props['partition'] = 1
    for k, m in ms.items():
        m.finish(root, uv=k not in ('vc', 'vcm', 'glass'), props=props)
info = L.export(OUT, gpu_instances=False)
tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')
info.update({'layout': LAY['version'], 'tris': tris, 'groups': sorted(GROUPS), 'note': 'US-CLUBHOUSE-3D-1110 社區會所室內（AA_741）'})
L.write_json(OUT[:-4] + '.json', info)
print(json.dumps(info, ensure_ascii=False))
