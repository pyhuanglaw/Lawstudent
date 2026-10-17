"""宋家豪的「公館美食地圖」筆記本（BB_109：寫滿公館小吃的筆記本，是他的識別物；BB_201：「有的話拿在手上」）→ GLB。
LAWWW2-C 2026-10-17；Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/char_second/prop_foodmap_notebook.py [-- --out assets/models/char/second_ai/notebook_foodmap.glb]

A6 左右的硬殼筆記本（18.5×13×1.8 cm）：牛皮紙封面、封面上手畫的地圖塗鴉（彎彎的路、紅色圓點、小碗）＋一條紙膠帶標籤「公館美食地圖」（他自己取的外號，不是店名）；
書口和上緣冒出一排彩色索引貼（寫滿了的樣子）、一條黑色鬆緊帶。圖是本作用 PIL 畫的，**沒有真實店名、商標**（D77）。
座標＝three.js 模型座標（x 右、y 上、z 前），原點在筆記本中心；封面朝 +y、書背在 −x、書口在 +x。
props3d 的掛法照資料夾（folder：左手、平拿），寫在 .json 的 hold。"""
import math, os, random, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'env_second'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/char/second_ai/notebook_foodmap.glb')
GEN = os.path.join(HERE, '..', 'env_second', 'textures', 'gen'); os.makedirs(GEN, exist_ok=True); TEX = os.path.join(GEN, 'foodmap_cover.png')
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
W2, T2, D2 = 0.0925, 0.009, 0.065        # 半寬（x）、半厚（y）、半高（z）
CT = 0.0018                              # 硬殼封面的厚度
rr = random.Random(1017)


def cover_png(path):
    """封面（512×360）：牛皮紙的纖維、手畫的地圖、紙膠帶標籤"""
    Wd, Hd = 512, 360; im = Image.new('RGB', (Wd, Hd), (196, 160, 108)); d = ImageDraw.Draw(im)
    for _ in range(900):                                                                 # 牛皮紙的纖維
        x, y = rr.uniform(0, Wd), rr.uniform(0, Hd); a = rr.uniform(0, math.pi); l = rr.uniform(4, 14); c = rr.choice([(182, 146, 96), (208, 174, 122), (174, 138, 90)])
        d.line([(x, y), (x + math.cos(a) * l, y + math.sin(a) * l)], fill=c, width=1)
    ink = (58, 44, 34)
    for k in range(4):                                                                   # 彎彎的路（原子筆）
        pts = []; y0 = 70 + k * 72 + rr.uniform(-10, 10)
        for i in range(12):
            x = 20 + i * 44; pts.append((x, y0 + 18 * math.sin(i * 0.8 + k) + rr.uniform(-4, 4)))
        d.line(pts, fill=ink, width=3)
    for k in range(3):
        x0 = 90 + k * 140 + rr.uniform(-12, 12); d.line([(x0, 30), (x0 + 30, 180), (x0 - 10, 340)], fill=ink, width=3)
    for _ in range(11):                                                                  # 紅色圓點（去過的店）、小碗
        x, y = rr.uniform(40, 470), rr.uniform(60, 330)
        if rr.random() < 0.6:
            d.ellipse([x - 9, y - 9, x + 9, y + 9], fill=(196, 52, 44), outline=(120, 30, 26), width=2)
        else:
            d.chord([x - 14, y - 10, x + 14, y + 14], 0, 180, fill=None, outline=ink, width=3); d.line([(x - 16, y + 2), (x + 16, y + 2)], fill=ink, width=3)
            for j in range(3): d.arc([x - 8 + j * 6, y - 18, x - 2 + j * 6, y - 4], 200, 340, fill=ink, width=2)   # 熱氣
    for _ in range(5):                                                                   # 星號
        x, y = rr.uniform(40, 470), rr.uniform(50, 330)
        for a in range(3): aa = a * math.pi / 3; d.line([(x - 9 * math.cos(aa), y - 9 * math.sin(aa)), (x + 9 * math.cos(aa), y + 9 * math.sin(aa))], fill=(214, 120, 40), width=3)
    # 紙膠帶標籤（米白、半透明的邊）＋手寫感的字（稍微歪）
    lab = Image.new('RGBA', (300, 76), (236, 226, 196, 235)); ld = ImageDraw.Draw(lab)
    for x in range(0, 300, 6): ld.line([(x, 0), (x + 3, 0)], fill=(236, 226, 196, 120))
    f = ImageFont.truetype(FONT, 40); ld.text((22, 14), '公館美食地圖', font=f, fill=(40, 34, 30, 255))
    lab = lab.rotate(-4, expand=True, resample=Image.BICUBIC); im.paste(lab, (100, 140), lab)
    im = im.filter(ImageFilter.GaussianBlur(0.6)); im.save(path)


cover_png(TEX)
B.reset(texres=512)


def tex_mat(name, path, rough=0.8):
    m = L.flat(name, '#ffffff', rough=rough); nt = m.node_tree; tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path)
    nt.links.new(tx.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color']); return m


M = {'cover': tex_mat('foodmap_cover', TEX), 'kraft': L.flat('foodmap_kraft', '#b88f5c', rough=0.85), 'spine': L.flat('foodmap_spine', '#7a5634', rough=0.75),
     'paper': L.flat('foodmap_paper', '#f1ead8', rough=0.9), 'band': L.flat('foodmap_band', '#141416', rough=0.6), 'tab': L.vc_material('foodmap_tabs', rough=0.6)}
root = B.group('notebook_foodmap', props={'kind': 'prop_notebook', 'owner': 'econ_jiahao', 'cover': '+y', 'spine': '-x'})

# 封面（上、下兩片硬殼）：上面那片的頂面貼封面圖
cv = Mesh('foodmap_cover', M['cover']); uv = cv.bm.loops.layers.uv.new('UVMap')
f = cv.bm.faces.new([cv.bm.verts.new(g2b(x, T2 + 0.0001, z)) for x, z in ((-W2, D2), (W2, D2), (W2, -D2), (-W2, -D2))])
for lp, u in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uv].uv = u
cv.finish(root, uv=False)
kr = Mesh('foodmap_boards', M['kraft'])
kr.box(-W2, W2, T2 - CT, T2, -D2, D2); kr.box(-W2, W2, -T2, -T2 + CT, -D2, D2)
kr.finish(root, uv=True)
sp = Mesh('foodmap_spine', M['spine']); sp.rbox(-W2 - 0.0015, -W2 + 0.006, -T2, T2, -D2, D2, r=0.002, seg=1); sp.finish(root, uv=True)
pg = Mesh('foodmap_pages', M['paper']); pg.box(-W2 + 0.004, W2 - 0.0025, -T2 + CT, T2 - CT, -D2 + 0.0025, D2 - 0.0025); pg.finish(root, uv=True)
# 鬆緊帶：書口附近一圈（上、下、外側）
bd = Mesh('foodmap_band', M['band']); bx0, bx1 = W2 - 0.021, W2 - 0.013
bd.box(bx0, bx1, T2, T2 + 0.0012, -D2 - 0.0012, D2 + 0.0012); bd.box(bx0, bx1, -T2 - 0.0012, -T2, -D2 - 0.0012, D2 + 0.0012)
bd.box(bx0, bx1, -T2 - 0.0012, T2 + 0.0012, D2, D2 + 0.0012); bd.box(bx0, bx1, -T2 - 0.0012, T2 + 0.0012, -D2 - 0.0012, -D2)
bd.finish(root, uv=False)
# 索引貼：書口（+x）八張、上緣（+z）四張，夾在不同的頁之間
tb = CMesh('foodmap_tabs', M['tab']); COLS = ['#f2c14e', '#ef8a6a', '#7cc6a4', '#7fb2e0', '#e88fb3', '#c3a4e3', '#f5e27a', '#9ad06d']
for k in range(8):
    z = -D2 + 0.012 + k * (2 * D2 - 0.024) / 7 + rr.uniform(-0.003, 0.003); y = -T2 + CT + 0.001 + rr.uniform(0, 2 * (T2 - CT) - 0.002)
    tb.cbox(W2 - 0.012, W2 + 0.007 + rr.uniform(0, 0.003), y, y + 0.0004, z - 0.006, z + 0.006, COLS[k % len(COLS)])
for k in range(4):
    x = -W2 + 0.03 + k * 0.035 + rr.uniform(-0.004, 0.004); y = -T2 + CT + 0.001 + rr.uniform(0, 2 * (T2 - CT) - 0.002)
    tb.cbox(x - 0.006, x + 0.006, y, y + 0.0004, D2 - 0.012, D2 + 0.007 + rr.uniform(0, 0.003), COLS[(k + 3) % len(COLS)])
tb.finish(root, uv=False)

for ob in bpy.data.objects:
    if ob.type == 'MESH':
        for m in ob.data.materials:
            if m and m.name == 'foodmap_tabs': m.use_backface_culling = False
st = L.export(OUT, gpu_instances=False)
L.write_json(OUT.replace('.glb', '.json'), {
    'glb': os.path.relpath(OUT, L.ROOT), 'owner': 'econ_jiahao', 'bytes': st['bytes'], 'size_m': [2 * W2, 2 * T2, 2 * D2],
    'origin': '筆記本中心；封面朝 +y、書背 −x、書口 +x', 'texture': os.path.relpath(TEX, L.ROOT) + '（本作 PIL 畫的；標籤字「公館美食地圖」是家豪自己取的外號，不是店名）',
    'hold': {'bone': 'leftHand', 'pos': [-0.07, -0.02, 0.0], 'rot': [0, 0, 0], 'note': '照 props3d 的資料夾（folder）：左手平拿；拿著走路時封面朝外'},
    'nodes': ['foodmap_cover', 'foodmap_boards', 'foodmap_spine', 'foodmap_pages', 'foodmap_band', 'foodmap_tabs']})
print('foodmap notebook', st)
