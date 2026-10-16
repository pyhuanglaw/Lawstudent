"""公館騎樓下的滷味攤（2D 背景 gongguan_luwei 用；BG-02，AA_147：「晚上騎樓下的滷味攤、一張折疊桌」，期中考完的宵夜 ev_midterm_supper）→ GLB。
LAWWW2-B 2026-10-16。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/luwei_stall.py [-- --out assets/models/env/second_ai/luwei_stall.glb]

遊戲座標（x 東、y 上、z 南），原點＝攤車前緣中間的地面；攤車朝 −z（客人站在 −z 那一側夾菜），折疊桌在攤車的 +x 側。
拍背景時由 tools/blender/env_second/shots/ 的截圖腳本載入，放在公館店面街 G05「滷味・鹹酥雞」的騎樓下（遊戲本身不放，這只是拍 2D 背景的道具）。

內容（台北常見的滷味攤，照一般樣子，不是某一家）：
- 不鏽鋼攤車（1.5×0.7、檯面 0.86）＋玻璃展示櫃（四層斜放的不鏽鋼淺盤：豆干、海帶、米血、甜不辣、貢丸、青菜、玉米、王子麵、鴨血、百頁豆腐）
- 夾菜用的紅色塑膠籃一疊、夾子；旁邊的大滷鍋（不鏽鋼湯鍋＋瓦斯爐架）、湯勺
- 攤車上方的吊燈（燈泡＋鐵燈罩，晚上發光）、手寫價目板（「滷味　自己夾」「秤重」；字是本作畫的，沒有店名）
- 折疊桌（木紋桌面 1.2×0.6、銀色鐵腳）＋紅色塑膠圓凳 5 張；桌上：兩袋滷味（透明塑膠袋套碗）、竹筷、兩杯手搖飲（杯身素面）、對答案的考卷與筆記
材質：不鏽鋼、玻璃、紅塑膠、木紋桌面、價目板（貼圖）、食物（頂點色）、燈泡（自發光）。
"""
import json, math, os, sys, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/luwei_stall.glb'))
GEN = os.path.join(HERE, 'textures', 'gen'); SIGN_PNG = os.path.join(GEN, 'luwei_sign.png'); PAPER_PNG = os.path.join(GEN, 'luwei_paper.png')
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
rnd = random.Random(1016)
B.reset(texres=512)


# ---------------- 貼圖（本作：程式畫的）----------------
def write_textures():
    os.makedirs(GEN, exist_ok=True)
    # 價目板：白底壓克力、紅字「滷味」、黑字「自己夾・秤重」「一兩 ○○ 元」（只寫一般的字，沒有店名）
    W, H = 512, 256; im = Image.new('RGB', (W, H), (246, 244, 236)); d = ImageDraw.Draw(im)
    d.rectangle((6, 6, W - 7, H - 7), outline=(180, 40, 36), width=6)
    f1 = ImageFont.truetype(FONT, 118); f2 = ImageFont.truetype(FONT, 38)
    d.text((34, 24), '滷味', font=f1, fill=(186, 32, 30))
    d.text((300, 46), '自己夾', font=f2, fill=(30, 30, 30)); d.text((300, 100), '秤重計價', font=f2, fill=(30, 30, 30))
    d.text((34, 178), '青菜 王子麵 米血 豆干 海帶', font=ImageFont.truetype(FONT, 30), fill=(60, 60, 60))
    im.save(SIGN_PNG)
    # 考卷：白紙、細細的橫線和題號（看不出內容）
    W, H = 256, 360; im = Image.new('RGB', (W, H), (244, 242, 236)); d = ImageDraw.Draw(im)
    d.rectangle((18, 14, W - 18, 40), fill=(226, 224, 218))
    for k in range(13):
        y = 58 + k * 22; d.line((22, y, W - 22, y), fill=(196, 196, 196), width=1)
        if k % 3 == 0: d.text((22, y - 16), str(k // 3 + 1) + '.', font=ImageFont.truetype(FONT, 14), fill=(80, 80, 80))
        d.line((44, y - 6, 44 + rnd.randint(60, 170), y - 6), fill=(70, 70, 110), width=2)
    d.ellipse((W - 70, 12, W - 24, 46), outline=(200, 40, 40), width=3)
    im.save(PAPER_PNG)


write_textures()


def img_material(name, path, rough=0.6, emit=0.0):
    m = L.flat(name, '#ffffff', rough=rough); nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path)
    nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit:
        try: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
        except Exception: pass
    return m


M = {
    'steel': L.flat('luwei_steel', '#c9ccd0', rough=0.32, metal=0.45),
    'steel_d': L.flat('luwei_steel_dark', '#8a8e93', rough=0.45, metal=0.4),
    'glass': L.flat('luwei_glass', '#dfe9ec', rough=0.06, alpha=0.22),
    'red': L.flat('luwei_red_plastic', '#c8322c', rough=0.45),
    'green': L.flat('luwei_green_plastic', '#3f9a54', rough=0.45),
    'wood': L.pbr('luwei_table_top', 'laminate_floor_02', tile=0.8, rough=0.55) if os.path.isdir(L.tex_dir('laminate_floor_02')) else L.flat('luwei_table_top', '#b88a5a', rough=0.55),
    'bulb': L.flat('luwei_bulb', '#fff1c8', rough=0.3, emit=B.srgb('#ffd890')),
    'shade': L.flat('luwei_shade', '#2f3437', rough=0.5, metal=0.3),
    'sign': img_material('luwei_sign', SIGN_PNG, rough=0.35),
    'paper': img_material('luwei_paper', PAPER_PNG, rough=0.8),
    'food': L.vc_material('luwei_food', rough=0.55),
    'bag': L.flat('luwei_bag', '#f1f1ee', rough=0.25, alpha=0.55),
    'cup': L.flat('luwei_cup', '#e9e2d4', rough=0.3, alpha=0.85),
    'tea': L.flat('luwei_tea', '#a8743e', rough=0.3),
    'chop': L.flat('luwei_chopstick', '#d9c49a', rough=0.7),
    'black': L.flat('luwei_black', '#1e2022', rough=0.5),
}
M['bulb'].node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 6.0
root = B.group('luwei_stall', props={'kind': 'luwei_stall'})

# ---------------- 攤車（中心 x 0，前緣 z −0.35，後緣 z +0.35；檯面 0.86）----------------
st = Mesh('luwei_cart', M['steel']); sd = Mesh('luwei_cart_dark', M['steel_d'])
CW, CD, CT = 1.5, 0.7, 0.86
st.box(-CW / 2, CW / 2, CT - 0.04, CT, -CD / 2, CD / 2)                                  # 檯面
st.box(-CW / 2, CW / 2, 0.18, CT - 0.04, -CD / 2, -CD / 2 + 0.02)                        # 前板
st.box(-CW / 2, -CW / 2 + 0.02, 0.18, CT - 0.04, -CD / 2, CD / 2); st.box(CW / 2 - 0.02, CW / 2, 0.18, CT - 0.04, -CD / 2, CD / 2)
st.box(-CW / 2, CW / 2, 0.18, 0.2, -CD / 2, CD / 2)                                      # 下層板
for x in (-CW / 2 + 0.05, CW / 2 - 0.05):
    for z in (-CD / 2 + 0.05, CD / 2 - 0.05): sd.cyl((x, 0.0, z), (x, 0.18, z), 0.03, seg=10)   # 輪子座
for k in range(4): sd.box(-CW / 2 + 0.06, CW / 2 - 0.06, 0.3 + k * 0.13, 0.31 + k * 0.13, -CD / 2 - 0.004, -CD / 2)   # 前板的壓紋
# 玻璃展示櫃（檯面上 0.55 高，前面斜的玻璃）：四層斜盤
GY = CT; GH = 0.55
gl = Mesh('luwei_glass', M['glass'])
gl.quad([(-CW / 2 + 0.03, GY, -CD / 2 + 0.03), (CW / 2 - 0.03, GY, -CD / 2 + 0.03), (CW / 2 - 0.03, GY + GH, -CD / 2 + 0.28), (-CW / 2 + 0.03, GY + GH, -CD / 2 + 0.28)])
for x in (-CW / 2 + 0.03, CW / 2 - 0.03):
    gl.quad([(x, GY, -CD / 2 + 0.03), (x, GY, CD / 2 - 0.05), (x, GY + GH, CD / 2 - 0.05), (x, GY + GH, -CD / 2 + 0.28)])
st.box(-CW / 2 + 0.02, CW / 2 - 0.02, GY + GH, GY + GH + 0.03, -CD / 2 + 0.26, CD / 2 - 0.03)   # 櫃頂
for x in (-CW / 2 + 0.02, CW / 2 - 0.04): st.box(x, x + 0.02, GY, GY + GH, CD / 2 - 0.06, CD / 2 - 0.03)
# 盤子：櫃裡往後越高（階梯），每層 4～5 盤
food = CMesh('luwei_food', M['food'])
FOODS = [  # (名稱, 顏色, 形狀)
    ('豆干', '#6b4a2e', 'cube'), ('海帶', '#2f3a24', 'knot'), ('米血', '#3a2b2a', 'slab'), ('甜不辣', '#c7a070', 'slab'), ('貢丸', '#d3c2a6', 'ball'),
    ('青菜', '#3f8a33', 'leaf'), ('玉米', '#e2b739', 'corn'), ('王子麵', '#e8cf8e', 'noodle'), ('鴨血', '#5a2a26', 'cube'), ('百頁豆腐', '#d9c08a', 'slab'),
    ('高麗菜', '#a9c97a', 'leaf'), ('魚板', '#f0e6dc', 'slab'), ('花椰菜', '#4f8c3a', 'ball'), ('黑輪', '#9a6d45', 'roll'), ('鳥蛋', '#efe6d2', 'ball')]


def painted(fn, col, k):
    """在 food（頂點色網格）加一個零件，新加的面塗上顏色（k＝明暗）"""
    food.bm.faces.ensure_lookup_table(); n0 = len(food.bm.faces); fn(); food.bm.faces.ensure_lookup_table()
    food.paint([food.bm.faces[i] for i in range(n0, len(food.bm.faces))], col, k)


def food_items(x0, x1, y, z0, z1, kind, col):
    """一盤的內容：小方塊／球／葉子堆，頂點色（每一塊明暗不同）"""
    n = 10 if kind in ('ball', 'cube') else 7
    for i in range(n):
        x = rnd.uniform(x0 + 0.02, x1 - 0.02); z = rnd.uniform(z0 + 0.02, z1 - 0.02); k = rnd.uniform(0.8, 1.15)
        if kind == 'ball': painted(lambda: food.sphere((x, y + 0.016, z), 0.017, seg=8, rings=5), col, k)
        elif kind == 'cube': s = rnd.uniform(0.025, 0.035); food.cbox(x - s, x + s, y, y + 0.022, z - s * 0.7, z + s * 0.7, col, k)
        elif kind == 'slab': food.cbox(x - 0.04, x + 0.04, y, y + 0.012, z - 0.025, z + 0.025, col, k)
        elif kind == 'leaf': food.cbox(x - 0.05, x + 0.05, y, y + 0.03, z - 0.035, z + 0.035, col, k)
        elif kind == 'corn': painted(lambda: food.cyl((x - 0.04, y + 0.02, z), (x + 0.04, y + 0.02, z), 0.02, seg=8), col, k)
        elif kind == 'roll': painted(lambda: food.cyl((x - 0.045, y + 0.014, z), (x + 0.045, y + 0.014, z), 0.014, seg=8), col, k)
        elif kind == 'noodle': food.cbox(x - 0.04, x + 0.04, y, y + 0.018, z - 0.04, z + 0.04, col, k)
        elif kind == 'knot': food.cbox(x - 0.03, x + 0.03, y, y + 0.014, z - 0.02, z + 0.02, col, k)


fi = 0
if True:
    for row in range(3):
        y = GY + 0.05 + row * 0.15; z0 = -CD / 2 + 0.07 + row * 0.08; z1 = z0 + 0.16; npl = 5
        for k in range(npl):
            x0 = -CW / 2 + 0.06 + k * (CW - 0.12) / npl; x1 = x0 + (CW - 0.12) / npl - 0.02
            sd.box(x0, x1, y - 0.012, y, z0, z1)                                       # 不鏽鋼淺盤
            sd.box(x0, x1, y, y + 0.012, z0, z0 + 0.006); sd.box(x0, x1, y, y + 0.012, z1 - 0.006, z1)
            nm, col, kind = FOODS[fi % len(FOODS)]; fi += 1; food_items(x0, x1, y, z0, z1, kind, col)
            if row < 2: sd.box(x0 + 0.02, x0 + 0.03, y - 0.15, y - 0.012, z1 - 0.02, z1 - 0.01)   # 盤子的架子
# 檯面前緣：一疊紅色塑膠籃＋夾子；檯面右邊：電子秤
rd = Mesh('luwei_red', M['red'])
for k in range(5): rd.box(-0.68, -0.44, CT + k * 0.022, CT + k * 0.022 + 0.02, -0.33, -0.15)
for k in range(3): rd.box(-0.42 + k * 0.0, -0.20, CT, CT + 0.005, -0.33, -0.28) if k == 0 else None
sd.box(-0.40, -0.37, CT + 0.01, CT + 0.02, -0.34, -0.18); sd.box(-0.36, -0.33, CT + 0.01, CT + 0.02, -0.34, -0.18)   # 兩支夾子
sd.box(0.42, 0.68, CT, CT + 0.06, -0.32, -0.12); M_scale = Mesh('luwei_black', M['black']); M_scale.box(0.46, 0.6, CT + 0.035, CT + 0.06, -0.335, -0.32)   # 秤＋顯示窗
# 大滷鍋（攤車 +x 外側的瓦斯爐架上）
pot_x, pot_z = CW / 2 + 0.36, 0.05
sd.box(pot_x - 0.27, pot_x + 0.27, 0.0, 0.03, pot_z - 0.27, pot_z + 0.27);
for (dx, dz) in ((-0.24, -0.24), (0.24, -0.24), (-0.24, 0.24), (0.24, 0.24)): sd.cyl((pot_x + dx, 0.0, pot_z + dz), (pot_x + dx, 0.62, pot_z + dz), 0.015, seg=6)
sd.box(pot_x - 0.27, pot_x + 0.27, 0.6, 0.64, pot_z - 0.27, pot_z + 0.27)
potb = L.lathe([(0.0, 0.0), (0.25, 0.0), (0.26, 0.02), (0.26, 0.42), (0.27, 0.43), (0.255, 0.43), (0.245, 0.40), (0.0, 0.40)], seg=28)
st.add_bm(potb, Matrix.Translation(g2b(pot_x, 0.64, pot_z))); potb.free()
soup = Mesh('luwei_soup', L.flat('luwei_soup', '#4a2c18', rough=0.15)); soup.cyl((pot_x, 0.64 + 0.34, pot_z), (pot_x, 0.64 + 0.345, pot_z), 0.24, seg=24)
sd.cyl((pot_x + 0.1, 1.0, pot_z), (pot_x + 0.32, 1.25, pot_z - 0.05), 0.012, seg=6)   # 湯勺柄
# 吊燈（攤車上方，掛在騎樓天花板往下 0.6 m：燈泡中心 y 2.1）＋電線
bl = Mesh('luwei_bulb', M['bulb']); sh_ = Mesh('luwei_shade', M['shade']); wire = Mesh('luwei_wire', M['black'])
for bx in (-0.35, 0.45):
    bl.sphere((bx, 2.05, 0.0), 0.045, seg=12, rings=8)
    shade = L.lathe([(0.03, 0.12), (0.06, 0.10), (0.16, 0.0), (0.155, -0.004), (0.055, 0.094), (0.026, 0.114)], seg=20)
    sh_.add_bm(shade, Matrix.Translation(g2b(bx, 2.05, 0.0))); shade.free()
    wire.cyl((bx, 2.17, 0.0), (bx, 3.4, 0.0), 0.004, seg=5)
# 價目板（攤車後面立著，背對騎樓的店門、面向客人 −z）
sg = Mesh('luwei_sign', M['sign'])
sx0, sx1, sy0, sy1, szz = -0.55, 0.45, GY + GH + 0.06, GY + GH + 0.56, CD / 2 - 0.02
_vs = [sg.bm.verts.new(g2b(*p)) for p in ((sx1, sy0, szz), (sx0, sy0, szz), (sx0, sy1, szz), (sx1, sy1, szz))]   # 正面朝 −z（客人那一側）
_f = sg.bm.faces.new(_vs); _uv = sg.bm.loops.layers.uv.verify()
for _lp, _t in zip(_f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): _lp[_uv].uv = _t   # 從 −z（面向南）看，東（sx1）在左邊＝貼圖的左邊
sd.box(sx0 - 0.02, sx0, GY + GH, sy1, szz, szz + 0.02); sd.box(sx1, sx1 + 0.02, GY + GH, sy1, szz, szz + 0.02)

# ---------------- 折疊桌（攤車 +x 側，中心 (2.25, 0, −0.35)，長邊沿 x）＋紅色塑膠圓凳 5 張 ----------------
TX, TZ, TW, TDp, TH = 2.25, -0.35, 1.2, 0.6, 0.72
tb = Mesh('luwei_table', M['wood']); tb.box(TX - TW / 2, TX + TW / 2, TH - 0.025, TH, TZ - TDp / 2, TZ + TDp / 2)
for sx in (-1, 1):                                                                   # 銀色鐵腳（X 形摺腳）
    x = TX + sx * (TW / 2 - 0.12)
    st.cyl((x, 0.0, TZ - TDp / 2 + 0.04), (x, TH - 0.025, TZ + TDp / 2 - 0.04), 0.012, seg=6)
    st.cyl((x, 0.0, TZ + TDp / 2 - 0.04), (x, TH - 0.025, TZ - TDp / 2 + 0.04), 0.012, seg=6)
    st.cyl((x, 0.01, TZ - TDp / 2 + 0.04), (x, 0.01, TZ + TDp / 2 - 0.04), 0.01, seg=6)
st.box(TX - TW / 2 + 0.02, TX + TW / 2 - 0.02, TH - 0.07, TH - 0.025, TZ - TDp / 2 + 0.01, TZ - TDp / 2 + 0.02)
st.box(TX - TW / 2 + 0.02, TX + TW / 2 - 0.02, TH - 0.07, TH - 0.025, TZ + TDp / 2 - 0.02, TZ + TDp / 2 - 0.01)


def stool(cx, cz):
    """台灣常見的紅色塑膠圓凳：圓凳面（中間有把手孔的凹）、往下張開的四片腳"""
    seat = L.lathe([(0.0, 0.44), (0.15, 0.44), (0.16, 0.435), (0.16, 0.41), (0.145, 0.40), (0.135, 0.42), (0.0, 0.425)], seg=24)
    rd.add_bm(seat, Matrix.Translation(g2b(cx, 0.0, cz))); seat.free()
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2; c, s_ = math.cos(a), math.sin(a)
        p0 = (cx + c * 0.12, 0.41, cz + s_ * 0.12); p1 = (cx + c * 0.17, 0.0, cz + s_ * 0.17)
        rd.cyl(p0, p1, 0.028, seg=6, r2=0.032)
    rd.cyl((cx, 0.12, cz), (cx, 0.135, cz), 0.16, seg=20, r2=0.165)                   # 腳中間的環


for (sx, sz) in ((TX - 0.45, TZ - 0.55), (TX + 0.1, TZ - 0.6), (TX + 0.75, TZ - 0.1), (TX - 0.35, TZ + 0.5), (TX + 0.3, TZ + 0.55)): stool(sx, sz)
for k in range(3): stool(-1.05 + 0.0, 0.25) if k == 0 else None                       # 攤車旁邊疊著的備用凳（一張，上面再疊兩張）
for k in range(1, 3):
    seat = L.lathe([(0.0, 0.44), (0.15, 0.44), (0.16, 0.435), (0.16, 0.41), (0.145, 0.40), (0.135, 0.42), (0.0, 0.425)], seg=24)
    rd.add_bm(seat, Matrix.Translation(g2b(-1.05, 0.06 * k, 0.25))); seat.free()

# 桌上：兩碗滷味（紙碗套透明塑膠袋）、竹筷、兩杯手搖飲、考卷兩張、一本筆記
bw = Mesh('luwei_bowl', L.flat('luwei_paper_bowl', '#f3efe6', rough=0.6)); bag = Mesh('luwei_bag', M['bag'])
for (bx, bz) in ((TX - 0.3, TZ - 0.08), (TX + 0.12, TZ + 0.1)):
    b = L.lathe([(0.0, 0.0), (0.06, 0.0), (0.085, 0.07), (0.08, 0.07), (0.055, 0.008), (0.0, 0.008)], seg=20); bw.add_bm(b, Matrix.Translation(g2b(bx, TH, bz))); b.free()
    food_items(bx - 0.06, bx + 0.06, TH + 0.04, bz - 0.06, bz + 0.06, 'cube', '#6b4a2e'); food_items(bx - 0.06, bx + 0.06, TH + 0.05, bz - 0.06, bz + 0.06, 'leaf', '#3f8a33')
    g = L.lathe([(0.0, 0.0), (0.095, 0.0), (0.1, 0.09), (0.07, 0.13), (0.03, 0.15), (0.0, 0.15)], seg=16); bag.add_bm(g, Matrix.Translation(g2b(bx + 0.02, TH, bz))); g.free()
    st_ = Mesh('luwei_chop_' + str(bx), M['chop']); st_.box(bx + 0.11, bx + 0.12, TH, TH + 0.008, bz - 0.11, bz + 0.11); st_.finish(root, uv=False)
cp = Mesh('luwei_cup', M['cup']); tea = Mesh('luwei_tea', M['tea'])
for (cx, cz) in ((TX + 0.42, TZ - 0.15), (TX - 0.52, TZ + 0.17)):
    c = L.lathe([(0.0, 0.0), (0.035, 0.0), (0.045, 0.16), (0.0, 0.16)], seg=16); cp.add_bm(c, Matrix.Translation(g2b(cx, TH, cz))); c.free()
    t = L.lathe([(0.0, 0.005), (0.033, 0.005), (0.041, 0.12), (0.0, 0.12)], seg=16); tea.add_bm(t, Matrix.Translation(g2b(cx, TH, cz))); t.free()
    wire.cyl((cx + 0.01, TH + 0.12, cz), (cx + 0.02, TH + 0.24, cz + 0.01), 0.004, seg=5)   # 吸管（黑）
pp = Mesh('luwei_paper', M['paper'])
for (px, pz, a) in ((TX - 0.05, TZ - 0.12, 0.25), (TX + 0.3, TZ + 0.12, -0.4)):
    w, h = 0.21, 0.297; c, s_ = math.cos(a), math.sin(a); pts = []
    for (u, v) in ((-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2)): pts.append((px + u * c - v * s_, TH + 0.002, pz + u * s_ + v * c))
    vs = [pp.bm.verts.new(g2b(*p)) for p in pts]; f = pp.bm.faces.new(vs); uvl = pp.bm.loops.layers.uv.verify()
    for lp, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uvl].uv = uv
nb = Mesh('luwei_note', L.flat('luwei_notebook', '#2f5d8a', rough=0.6)); nb.box(TX - 0.58, TX - 0.36, TH, TH + 0.012, TZ - 0.27, TZ - 0.03)

for m_ in (st, sd, gl, rd, M_scale, soup, bl, sh_, wire, tb, bw, bag, cp, tea, nb): m_.finish(root, uv=m_ in (tb,), smooth=m_ in (bl, sh_, bag, cp, tea, bw, soup))
sg.finish(root, uv=False)
pp.finish(root, uv=False)
food.finish(root, uv=False)
st_ = L.export(OUT, gpu_instances=False)
L.write_json(OUT.replace('.glb', '.json'), {'glb': os.path.relpath(OUT, L.ROOT), 'bytes': st_['bytes'], 'tris': st_.get('tris'),
                                            'origin': '攤車前緣中間的地面；攤車朝 −z', 'table_center': [TX, TZ], 'bulbs': [[-0.35, 2.05, 0.0], [0.45, 2.05, 0.0]],
                                            'textures': ['tools/blender/env_second/textures/gen/luwei_sign.png（本作）', 'tools/blender/env_second/textures/gen/luwei_paper.png（本作）', 'Poly Haven laminate_floor_02（CC0）']})
