"""季節、節日的布置（LIFE-DETAILS-SEASONAL-1110，X317；使用者 2026-11-10「季節性的攤販、店門口的小變化、節日的布置 很棒」→ 20 項全做；LAWWW2 帳號 A 11-11 第一批）
→ assets/models/env/second_ai/season_<區域>.glb（＋.json）。不是單獨執行：由街景生成器帶 --season 呼叫（它知道每一扇門在哪裡）：
  /opt/blenv/bin/python tools/blender/env_second/wz_street.py -- --set wenzhou --season
  /opt/blenv/bin/python tools/blender/env_second/wz_street.py -- --set gongguan --season
街景模型（wenzhou_street.glb、gongguan_shops.glb）不動；這一顆是另外的檔，遊戲在那個節日才載入（src/season_deco3d.js，日期表 src/data/season_deco.js）。

節點（遊戲照名字整組顯示／隱藏）：
  SEASON_CNY_on   過年（除夕前兩週～元宵）：每一扇店門、住家門——左右一副春聯、門上一張橫批、門中間一張倒貼的「福」；指定的幾間多一對紅燈籠
  SEASON_XMAS_on  聖誕（12/1～12/25）：咖啡、早午餐店才有——門上一個花圈（紅蝴蝶結）、玻璃上緣一串小燈、玻璃上幾片雪花貼紙
都貼在門面上（不落地）：不佔騎樓、不用擋導航。字（春聯、橫批、福）畫在 textures/gen/season_atlas.jpg（常見的吉祥話；文泉驛正黑）。
座標＝遊戲的世界座標（x 往東、y 往上、z 往南）。"""
import json, math, os
import lib2 as L
from lib2 import B, Mesh, CMesh, g2b, bpy
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__)); GEN = os.path.join(HERE, 'textures', 'gen'); FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
RED, RED_D, GOLD, INK, GREEN, GREEN_D, WHITE = '#c8201c', '#a01814', '#e6b84a', '#1d1a16', '#2f6a3a', '#24522e', '#f6f4ee'
PAIRS = [('天增歲月人增壽', '春滿乾坤福滿門', '四季平安'), ('一帆風順年年好', '萬事如意步步高', '吉星高照'), ('生意興隆通四海', '財源茂盛達三江', '招財進寶'), ('迎新春事事如意', '接鴻福步步高升', '恭賀新禧')]
# 哪幾間多一對紅燈籠（日式、茶屋那一種門面）／哪幾間有聖誕布置（咖啡、早午餐；麵店、影印、藥局不放——提案 C3）
LANTERN = {'wenzhou': (), 'gongguan': ('G01',)}   # 小路（B3）門口本來就有白燈籠，不再加
XMAS = {'wenzhou': ('B7', 'W2'), 'gongguan': ('G07', 'G14')}
# 第二批（11-11）：都還是貼在門面上的東西——端午、情人節、萬聖節、飲料店的季節布條、便利店的季節海報、洗衣店的換季告示、期末考週的影印店
DRAGON_HERB = {'wenzhou': ('A4', 'B3'), 'gongguan': ('G01',)}        # 門邊綁一束艾草菖蒲：林家乾麵、小路、青木茶室
CVS = {'wenzhou': ('A5',), 'gongguan': ('G03',)}                     # 日和便利店：端午粽子、冬天關東煮熱飲、夏天冰品的海報貼在玻璃上
VDAY = {'wenzhou': ('B7', 'W2'), 'gongguan': ('G07', 'G14', 'G11')}  # 情人節：咖啡店玻璃上的小愛心；花序玻璃上一張玫瑰花束的海報
HALLOWEEN = {'wenzhou': (), 'gongguan': ('G07', 'G14')}              # 萬聖節：只有 afar、Daybreak（台灣比較少，不每間都放）
DRINK = {'wenzhou': (), 'gongguan': ('G01',)}                        # 飲料店門邊的季節布條（帝大紅茶的店面生成器沒有門的位置，先只有青木茶室）
LAUNDRY = {'wenzhou': ('B2',), 'gongguan': ()}                       # 常在洗衣：換季「棉被・大衣送洗」
EXAM = {'wenzhou': ('A1',), 'gongguan': ()}                          # 阿德影印（原本的店面）：期末考週的手寫告示
# 第三批（11-11）：落地的東西。位置都是在遊戲裡量的（Blender 往下打點量模型、Node 量導航）：除了中秋的騎樓烤肉架，都放在原本就擋住、人走不到的地方（門廊、花台上、樹上方），不動導航
FRUIT_SLOT = {'wenzhou': (32.95, 33.45, -5.8, -5.2)}      # 阿忠鮮果（B6）門廊：香蕉箱和前檯之間的空位（x 32.9～33.5 地上沒有東西；門廊 z −5.9～−5.0 整條是擋住的）
MOON_SLOT = {'wenzhou': (36.82, 37.25, -5.8, -5.15)}      # 阿忠鮮果門廊另一個空位：磅秤桌左邊
FN_PLANTER = {'gongguan': ((42.85, 44.75), (48.45, 50.35))}   # 花序 Flower Notes（G11）門兩邊的花台：z 21.62～21.98、台面 0.35（上面一排矮灌木）
FN_PZ = 21.8
LANTERN_LINE = {'wenzhou': ((21.3, 13.6), (30.7, 13.4))}   # 元宵：溫州街小公園入口步道上方，兩棵樟樹之間（WZ_PARK_LAYOUT 的 tree_f1、tree_f2）
BBQ = {'gongguan': (26.0, 27.0, 21.0, 21.5)}             # 中秋晚上：G09 鐵捲門前、貼著店面（東西在這一塊裡；src/data/season_deco.js 的 blocks 比它大一圈 0.5 m）
RAIN_KINDS = ('shop', 'gg')
def season_data():
    """src/data/season_deco.js 的 SEASON_DECO（攤販的位置、腳印只寫在那裡，這裡照著蓋）"""
    t = open(os.path.join(HERE, '..', '..', '..', 'src', 'data', 'season_deco.js'), encoding='utf-8').read()
    a = t.index('{', t.index('const SEASON_DECO')); b = t.rindex('};', 0, t.index('if (typeof window')) + 1
    return json.loads(t[a:b])                               # 下雨天：有門的店（敞開的水果攤、麵攤沒有門，不放）
SKIP = ('A2C',)   # 阿德影印搬到轉角以後的店面：要看劇情狀態（WZ_COPY_SHOP）才有，先不貼


def make_atlas():
    """春聯四副（上下聯各 7 字，直的）＋橫批四張＋倒貼的「福」＋「春」→ season_atlas.jpg（1024×1024）；回傳 {key: (u0, v0, u1, v1)}"""
    W, H = 2048, 1024; im = Image.new('RGB', (W, H), RED); d = ImageDraw.Draw(im); uv = {}
    def put(key, x, y, w, h): uv[key] = (x / W, 1 - (y + h) / H, (x + w) / W, 1 - y / H)
    fv = ImageFont.truetype(FONT, 84)
    for i, (a, b, _) in enumerate(PAIRS):
        for j, t in enumerate((a, b)):
            x = (i * 2 + j) * 112; d.rectangle([x, 0, x + 111, 767], fill=RED); d.rectangle([x + 5, 5, x + 106, 762], outline=GOLD, width=3)
            for k, ch in enumerate(t): bb = d.textbbox((0, 0), ch, font=fv); d.text((x + 56 - (bb[0] + bb[2]) / 2, 22 + k * 106 + 42 - (bb[1] + bb[3]) / 2), ch, font=fv, fill=INK)
            put('c%d%s' % (i, 'ab'[j]), x + 1, 1, 110, 766)
    fh = ImageFont.truetype(FONT, 88)
    for i, (_, _, t) in enumerate(PAIRS):
        x, y = (i % 2) * 448, 772 + (i // 2) * 124; d.rectangle([x, y, x + 443, y + 119], fill=RED); d.rectangle([x + 5, y + 5, x + 438, y + 114], outline=GOLD, width=3)
        for k, ch in enumerate(t): bb = d.textbbox((0, 0), ch, font=fh); d.text((x + 58 + k * 109 - (bb[0] + bb[2]) / 2, y + 60 - (bb[1] + bb[3]) / 2), ch, font=fh, fill=INK)
        put('h%d' % i, x + 1, y + 1, 442, 118)
    fb = ImageFont.truetype(FONT, 104)
    for i, ch in enumerate('福春'):
        x, y = 900, 4 + i * 128; cell = Image.new('RGB', (120, 120), RED); cd = ImageDraw.Draw(cell); cd.rectangle([4, 4, 115, 115], outline=GOLD, width=3)
        bb = cd.textbbox((0, 0), ch, font=fb); cd.text((60 - (bb[0] + bb[2]) / 2, 60 - (bb[1] + bb[3]) / 2), ch, font=fb, fill=GOLD if ch == '福' else INK)
        if ch == '福': cell = cell.rotate(180)   # 倒貼＝福到
        im.paste(cell, (x, y)); put('fu' if ch == '福' else 'chun', x + 1, y + 1, 118, 118)
    # ---- 第二批：海報（256×360）、直布條（128×512）、手寫告示（256×180）；字都是本作自己寫的一般用語，沒有品牌 ----
    def fit(t, w, px):
        while px > 12 and d.textlength(t, font=ImageFont.truetype(FONT, px)) > w: px -= 2
        return ImageFont.truetype(FONT, px)
    def ctext(cx, cy, t, w, px, col):
        f = fit(t, w, px); bb = d.textbbox((0, 0), t, font=f); d.text((cx - (bb[0] + bb[2]) / 2, cy - (bb[1] + bb[3]) / 2), t, font=f, fill=col)
    def poster(key, x, y, bg, edge, lines, icon):
        w_, h_ = 256, 360; d.rectangle([x, y, x + w_ - 1, y + h_ - 1], fill=bg); d.rectangle([x + 6, y + 6, x + w_ - 7, y + h_ - 7], outline=edge, width=4); icon(x + w_ // 2, y + 118)
        for i, (t, px, col) in enumerate(lines): ctext(x + w_ // 2, y + 232 + i * 62, t, w_ - 36, px, col)
        put(key, x + 1, y + 1, w_ - 2, h_ - 2)
    def ic_zong(cx, cy):   # 粽子：綠色三角形、棉繩
        for dx in (-52, 52): d.polygon([(cx + dx, cy - 58), (cx + dx - 50, cy + 44), (cx + dx + 50, cy + 44)], fill='#4f7a3a'); d.line([(cx + dx - 30, cy + 6), (cx + dx + 30, cy + 6)], fill='#e8dcc0', width=5); d.line([(cx + dx, cy - 58), (cx + dx, cy - 86)], fill='#e8dcc0', width=4)
    def ic_oden(cx, cy):   # 關東煮：一個碗、三串、熱氣
        d.pieslice([cx - 80, cy - 40, cx + 80, cy + 90], 0, 180, fill='#f4f1e8'); d.rectangle([cx - 84, cy + 18, cx + 84, cy + 28], fill='#c8201c')
        for i, dx in enumerate((-40, 0, 40)): d.line([(cx + dx, cy + 20), (cx + dx + 8, cy - 62)], fill='#b98a4a', width=5); d.ellipse([cx + dx - 14, cy - 40 + i * 6, cx + dx + 22, cy - 8 + i * 6], fill=('#e8d9b0', '#d98a4a', '#f4f1e8')[i])
        for dx in (-50, 0, 50): d.arc([cx + dx - 14, cy - 110, cx + dx + 14, cy - 66], 90, 270, fill='#ffffff', width=4)
    def ic_ice(cx, cy):    # 冰棒兩支
        for dx, col in ((-44, '#7fd0e8'), (44, '#f6a0b8')): d.rounded_rectangle([cx + dx - 34, cy - 84, cx + dx + 34, cy + 34], radius=28, fill=col); d.rectangle([cx + dx - 7, cy + 34, cx + dx + 7, cy + 84], fill='#d9b98a')
    def ic_rose(cx, cy):   # 玫瑰花束：三朵紅花、綠葉、包裝紙
        d.polygon([(cx - 70, cy - 10), (cx + 70, cy - 10), (cx + 14, cy + 96), (cx - 14, cy + 96)], fill='#f4e6d8')
        for dx, dy in ((-34, -30), (34, -30), (0, -62)): d.ellipse([cx + dx - 30, cy + dy - 30, cx + dx + 30, cy + dy + 30], fill='#c8201c'); d.arc([cx + dx - 16, cy + dy - 16, cx + dx + 16, cy + dy + 16], 30, 300, fill='#8f1410', width=4)
        d.polygon([(cx - 70, cy - 6), (cx - 30, cy + 10), (cx - 60, cy + 30)], fill='#3f7a3a'); d.polygon([(cx + 70, cy - 6), (cx + 30, cy + 10), (cx + 60, cy + 30)], fill='#3f7a3a')
    PX = 1024
    poster('p_zong', PX, 0, '#f6efd8', '#4f7a3a', [('端午粽子', 54, '#2f5a2a'), ('預購中', 40, '#c8201c')], ic_zong)
    poster('p_oden', PX + 256, 0, '#c8201c', '#f6d98a', [('關東煮', 60, '#fff6e0'), ('熱飲・熱食', 38, '#f6d98a')], ic_oden)
    poster('p_ice', PX + 512, 0, '#dff2f8', '#3d8ab0', [('冰品・涼飲', 48, '#1f5a80'), ('清涼一夏', 38, '#e0607a')], ic_ice)
    poster('p_rose', PX + 768, 0, '#fbe9ec', '#c8201c', [('情人節花束', 46, '#a01814'), ('預訂・代客包裝', 30, '#5a3a3a')], ic_rose)
    for i, (key, t, bg, col) in enumerate((('b_summer', '冬瓜檸檬・冰', '#2f8ab0', '#ffffff'), ('b_winter', '熱飲・暖暖上市', '#b0522a', '#fff3d8'))):   # 直布條
        x, y = PX + i * 128, 364; d.rectangle([x, y, x + 127, y + 511], fill=bg); d.rectangle([x + 5, y + 5, x + 122, y + 506], outline=col, width=3); n = len(t); st = 492 // n; fz = ImageFont.truetype(FONT, min(84, st - 6))
        for k, ch in enumerate(t): bb = d.textbbox((0, 0), ch, font=fz); d.text((x + 64 - (bb[0] + bb[2]) / 2, y + 10 + k * st + st / 2 - (bb[1] + bb[3]) / 2), ch, font=fz, fill=col)
        put(key, x + 1, y + 1, 126, 510)
    for i, (key, lines, bg, col) in enumerate((('n_laundry', ['換季囉', '棉被・大衣送洗'], '#fffbe8', '#1f4f9c'), ('n_exam1', ['考古題・講義', '影印 快速取件'], '#fff6c8', '#1d1a16'), ('n_exam2', ['期末加油！', '裝訂・雙面 都可以'], '#ffe6e0', '#c8201c'))):   # 手寫告示
        x, y = PX + 260 + i * 260, 364; d.rectangle([x, y, x + 255, y + 179], fill=bg); d.rectangle([x + 4, y + 4, x + 251, y + 175], outline=col, width=3)
        for k, t in enumerate(lines): ctext(x + 128, y + 58 + k * 68, t, 226, 52 if k == 0 else 38, col)
        put(key, x + 1, y + 1, 254, 178)
    # ---- 第三批：水果攤插在水果裡的手寫卡（256×180）；字是一般的水果名，沒有價錢（價錢以 AA 的「買水果」為準，不在模型裡寫死）----
    for i, (key, lines, bg, col, col2) in enumerate((('q_spring', ['當季', '枇杷'], '#fff3d0', '#c8201c', '#5a3a1a'), ('q_summer', ['當季', '愛文芒果'], '#fff3d0', '#c8201c', '#5a3a1a'),
                                                       ('q_autumn', ['文旦', '上市了'], '#fff3d0', '#c8201c', '#3f6a2a'), ('q_winter', ['椪柑', '草莓上市'], '#fff3d0', '#c8201c', '#5a3a1a'),
                                                       ('q_moon', ['中秋', '文旦禮盒'], '#c8201c', '#f6d98a', '#fff6e0'))):
        x, y = PX + (i % 4) * 256, 552 + (i // 4) * 184; d.rectangle([x, y, x + 255, y + 179], fill=bg); d.rectangle([x + 4, y + 4, x + 251, y + 175], outline=col, width=4)
        ctext(x + 128, y + 54, lines[0], 220, 56, col); ctext(x + 128, y + 124, lines[1], 228, 50, col2)
        put(key, x + 1, y + 1, 254, 178)
    # ---- 季節攤販的招牌（A1～A6）：只寫賣的東西（D147：使用者沒給店名的攤子，招牌只寫賣什麼）----
    def board(key, x, y, w, h, t, bg, col, px):
        d.rectangle([x, y, x + w - 1, y + h - 1], fill=bg); d.rectangle([x + 4, y + 4, x + w - 5, y + h - 5], outline=col, width=4); ctext(x + w // 2, y + h // 2, t, w - 30, px, col); put(key, x + 1, y + 1, w - 2, h - 2)
    board('st_yam', PX + 256, 736, 256, 180, '烤地瓜', '#f2d9a8', '#7a2a14', 70)
    board('st_aiyu', PX + 512, 736, 256, 180, '愛玉・仙草', '#2f6a8a', '#fff6e0', 50)
    board('st_mooncake', PX + 768, 736, 256, 180, '中秋禮盒', '#c8201c', '#f6d98a', 56)
    board('st_bouquet', PX, 920, 256, 100, '畢業花束', '#fbe9ec', '#a01814', 46)
    board('st_textbook', PX + 256, 920, 512, 100, '二手教科書 特價', '#fffbe8', '#1f4f9c', 50)
    x, y, w, h = 900, 262, 122, 758; d.rectangle([x, y, x + w - 1, y + h - 1], fill=RED); d.rectangle([x + 5, y + 5, x + w - 6, y + h - 6], outline=GOLD, width=3)   # 春聯攤的直招牌
    t = '春聯年貨'; fz = ImageFont.truetype(FONT, 92)
    for k, ch in enumerate(t): bb = d.textbbox((0, 0), ch, font=fz); d.text((x + w / 2 - (bb[0] + bb[2]) / 2, y + 30 + k * 178 + 89 - (bb[1] + bb[3]) / 2), ch, font=fz, fill=GOLD)
    put('st_couplet', x + 1, y + 1, w - 2, h - 2)
    os.makedirs(GEN, exist_ok=True); out = os.path.join(GEN, 'season_atlas.jpg'); im.save(out, quality=90); return out, uv


class Door:
    """一扇門的座標系：a＝沿著門（0＝門左緣…wd＝門右緣）、y＝高度、off＝離門面往外（朝街上）"""
    def __init__(self, r):
        self.r = r; (x0, z0), (x1, z1) = r['w0'], r['w1']; self.wd = math.hypot(x1 - x0, z1 - z0); self.o = (x0, z0); self.u = ((x1 - x0) / self.wd, (z1 - z0) / self.wd); self.n = tuple(r['n']); self.top = r['top']
    def P(self, a, y, off=0.0): return (self.o[0] + self.u[0] * a + self.n[0] * off, y, self.o[1] + self.u[1] * a + self.n[1] * off)
    def G(self, w):   # 整面玻璃的範圍（沿門的座標）；沒有就用門自己
        g = self.r.get('glass')
        if not g: return 0.0, self.wd
        v = sorted(((g[k][0] - self.o[0]) * self.u[0] + (g[k][1] - self.o[1]) * self.u[1]) for k in (0, 1)); return v[0], v[1]


def rain_spots(doors):
    """下雨天的傘架放哪裡（第三批）：每一扇有門的店，門的右邊、左邊各試兩個位置（離門面 0.3 m），往下打點——腳印（0.3×0.3）的五個點都只打到地面（≤ 地面＋0.1）才放。
    要在街景還在場景裡的時候做（export 一開始、B.reset 以前）；回傳 {門的 id: (a, 地面高度)}，a＝沿門的座標（Door.P 的 a）"""
    from mathutils import Vector
    try: dg = bpy.context.evaluated_depsgraph_get(); sc = bpy.context.scene
    except Exception: return {}
    if not len(sc.objects): return {}
    def hit(x, z):
        ok, loc, *_ = sc.ray_cast(dg, Vector((x, -z, 2.4)), Vector((0, 0, -1))); return loc.z if ok else None
    out = {}
    for r in doors:
        if r['kind'] not in RAIN_KINDS: continue
        D = Door(r)
        for a in (D.wd + 0.3, -0.3, D.wd + 0.62, -0.62):
            pts = [D.P(a + da, 0, 0.3 + dz) for (da, dz) in ((0, 0), (-0.14, -0.14), (0.14, -0.14), (-0.14, 0.14), (0.14, 0.14))]
            hs = [hit(p[0], p[2]) for p in pts]
            if all(h is not None for h in hs) and max(hs) - min(hs) < 0.03 and max(hs) < 0.12: out[r['id']] = (a, round(min(hs), 3)); break
    return out


def export(SET, doors, out):
    doors = [r for r in doors if r['id'] not in SKIP]
    RSPOT = rain_spots(doors)
    B.reset(texres=1024); root = B.group('season_' + SET, props={'kind': 'season_deco', 'set': SET})
    apath, AUV = make_atlas()
    am = bpy.data.materials.new('season_atlas'); am.use_nodes = True; nt = am.node_tree; bs = nt.nodes['Principled BSDF']; bs.inputs['Roughness'].default_value = 0.85
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(apath); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = 0.18   # 紅紙在騎樓的陰影裡不要變成暗紅
    gl = L.vc_material('season_glow', rough=0.6); gn = gl.node_tree; vcn = next(n for n in gn.nodes if n.type == 'VERTEX_COLOR'); gb = gn.nodes['Principled BSDF']
    gn.links.new(vcn.outputs['Color'], gb.inputs['Emission Color']); gb.inputs['Emission Strength'].default_value = 1.2
    vcm = L.vc_material('season_vc', rough=0.7)
    stat = {}

    def group(code):
        g = B.group('SEASON_%s_on' % code, root, props={'season': code}); A = Mesh('SEASON_%s_at' % code, am); lay = A.bm.loops.layers.uv.new('UVMap')
        return dict(g=g, A=A, lay=lay, V=CMesh('SEASON_%s_vc' % code, vcm), F=CMesh('SEASON_%s_flat' % code, vcm), Gl=CMesh('SEASON_%s_gl' % code, gl), n=0)   # F＝平的薄片（貼紙、蝴蝶結）：不做平滑（正反兩面疊在一起，平滑以後法線互相抵消、整片變黑）

    def tq(S, key, pts, flip=False):   # 一張貼圖的四邊形（左下、右下、右上、左上；兩面都看得到）
        u0, v0, u1, v1 = AUV[key]; bm = S['A'].bm; t = ((u0, v0), (u1, v0), (u1, v1), (u0, v1))
        f = bm.faces.new([bm.verts.new(g2b(*p)) for p in pts])
        for lp, tt in zip(f.loops, t): lp[S['lay']].uv = tt

    def flat2(cm, pts, col):   # 平的薄片：正反兩面都自己畫（各自上色）
        cm.poly(pts, col); cm.poly(list(reversed(pts)), col, 0.85)

    def ball(cm, c, r, col, sy=1.0, seg=8, rings=5):
        before = set(cm.bm.faces); cm.sphere(c, r, seg=seg, rings=rings, sy=sy); cm.paint([f for f in cm.bm.faces if f not in before], col)

    def cyl(cm, a, b, r, col, seg=6):
        before = set(cm.bm.faces); cm.cyl(a, b, r, seg=seg); cm.paint([f for f in cm.bm.faces if f not in before], col)

    # ---------- 過年 ----------
    S = group('CNY')
    for i, r in enumerate(doors):
        D = Door(r); wd = D.wd; k = (sum(ord(c) for c in (r['id'] or 'x')) + i) % 4
        if r['kind'] in ('gg', 'shop', 'open') and k == 0: k = 2                     # 店家多半貼生意興隆那一副
        house = r['kind'] == 'house'   # 住家：門在石材門框裡面退 0.2 m——春聯貼在門框外面的牆上（牆面的平面）、橫批貼在門上的氣窗
        cw, ch = 0.18, 1.24; y0 = min(1.0, max(0.75, D.top - ch - 0.25)); off = 0.03; coff, gap = (0.235, 0.27) if house else (off, 0.06)
        for side, key in ((-1, 'c%da' % k), (1, 'c%db' % k)):                        # 上聯在右（面對門），下聯在左
            a0 = (wd + gap) if side < 0 else (-gap - cw)
            tq(S, key, [D.P(a0, y0, coff), D.P(a0 + cw, y0, coff), D.P(a0 + cw, y0 + ch, coff), D.P(a0, y0 + ch, coff)])
        hw = min(0.72, max(0.5, wd * 0.55)); hh = hw * 118 / 442; hy = (D.top - 0.33) if house else (D.top + 0.04)
        tq(S, 'h%d' % k, [D.P(wd / 2 - hw / 2, hy, off), D.P(wd / 2 + hw / 2, hy, off), D.P(wd / 2 + hw / 2, hy + hh, off), D.P(wd / 2 - hw / 2, hy + hh, off)])
        if r['kind'] != 'open':                                                      # 門中間一張倒貼的福（斜 45°）；寬的對開門貼兩張
            fs = 0.21
            for ax in ((wd * 0.27, wd * 0.73) if wd >= 1.5 else (wd / 2,)):
                tq(S, 'fu' if (i + int(ax * 10)) % 3 else 'chun', [D.P(ax, 1.5 - fs, off), D.P(ax + fs, 1.5, off), D.P(ax, 1.5 + fs, off), D.P(ax - fs, 1.5, off)])
        if r['id'] in LANTERN.get(SET, ()):                                           # 一對紅燈籠：門兩邊、掛在門頂上面
            for a_ in (-0.35, wd + 0.35):
                c = D.P(a_, D.top - 0.12, 0.56); ball(S['Gl'], c, 0.17, '#d8261c', sy=1.12, seg=12, rings=7)   # 離門面 0.56 m、門頂下面一點（BB 11-11 04:4x：原本 0.28 m、在門頂的高度，下半顆埋進這間店的招牌橫帶）
                for yy in (0.2, -0.2): cyl(S['V'], (c[0], c[1] + yy - 0.02, c[2]), (c[0], c[1] + yy + 0.02, c[2]), 0.075, GOLD, seg=10)
                cyl(S['V'], (c[0], c[1] + 0.22, c[2]), (c[0], c[1] + 0.42, c[2]), 0.006, INK, seg=4); cyl(S['V'], (c[0], c[1] - 0.22, c[2]), (c[0], c[1] - 0.46, c[2]), 0.02, '#d8261c', seg=5)
                p0 = D.P(a_, D.top + 0.3, 0.0); cyl(S['V'], p0, (c[0], c[1] + 0.42, c[2]), 0.012, INK, seg=4)   # 從牆上伸出來的一支小鐵桿，燈籠掛在桿頭
        S['n'] += 1
    groups = [S]

    # ---------- 聖誕 ----------
    X = group('XMAS')
    for i, r in enumerate(doors):
        if r['id'] not in XMAS.get(SET, ()) or r['kind'] == 'open': continue
        D = Door(r); wd = D.wd; off = 0.05
        # 門上的花圈：一圈綠葉團＋幾顆紅果＋下面一個紅蝴蝶結
        cx, cy, R = wd / 2, min(1.78, D.top - 0.45), 0.2
        for k in range(12):
            a = k * math.pi / 6; ball(X['V'], D.P(cx + math.cos(a) * R, cy + math.sin(a) * R, off + 0.02), 0.062, GREEN if k % 2 else GREEN_D, seg=7, rings=4)
            if k % 3 == 0: ball(X['V'], D.P(cx + math.cos(a + 0.26) * R, cy + math.sin(a + 0.26) * R, off + 0.07), 0.022, '#d8261c', seg=6, rings=3)
        for sg in (-1, 1):
            flat2(X['F'], [D.P(cx, cy - R, off + 0.08), D.P(cx + sg * 0.11, cy - R + 0.06, off + 0.08), D.P(cx + sg * 0.11, cy - R - 0.05, off + 0.08)], '#c8201c')
            flat2(X['F'], [D.P(cx, cy - R, off + 0.08), D.P(cx + sg * 0.03, cy - R - 0.17, off + 0.08), D.P(cx + sg * 0.09, cy - R - 0.15, off + 0.08)], '#a01814')
        # 玻璃上緣一串小燈（暖白、紅、綠輪流；電線垂一點）
        g0, g1 = D.G(wd); n = max(6, int((g1 - g0) / 0.28)); ly = D.top + 0.02
        for k in range(n + 1):
            a = g0 + k * (g1 - g0) / n; sag = 0.05 * math.sin(k * math.pi)   # 節點在釘子上
            if k < n:
                am_ = a + (g1 - g0) / n / 2; cyl(X['V'], D.P(a, ly, off), D.P(am_, ly - 0.06, off), 0.004, INK, seg=3); cyl(X['V'], D.P(am_, ly - 0.06, off), D.P(a + (g1 - g0) / n, ly, off), 0.004, INK, seg=3)
                ball(X['Gl'], D.P(am_, ly - 0.085, off), 0.028, ('#ffe9b0', '#ff5a48', '#7fe08a', '#ffe9b0', '#6fb6ff')[k % 5], sy=1.3, seg=6, rings=4)
        # 玻璃上的雪花貼紙（白色、六角）
        for k in range(6):
            a = g0 + 0.35 + (k * 0.618 % 1.0) * max(0.2, g1 - g0 - 0.7); y = 1.0 + ((k * 37) % 10) / 10 * 0.95
            if 0.0 - 0.15 < a < wd + 0.15: continue                                   # 不貼在門上（門上是花圈）
            s_ = 0.07 + 0.03 * (k % 3)
            for j in range(3):
                t = j * math.pi / 3; dx_, dy_ = math.cos(t) * s_, math.sin(t) * s_; wq = 0.014
                flat2(X['F'], [D.P(a - dx_ - dy_ * wq / s_, y - dy_ + dx_ * wq / s_, 0.035), D.P(a + dx_ - dy_ * wq / s_, y + dy_ + dx_ * wq / s_, 0.035), D.P(a + dx_ + dy_ * wq / s_, y + dy_ - dx_ * wq / s_, 0.035), D.P(a - dx_ + dy_ * wq / s_, y - dy_ - dx_ * wq / s_, 0.035)], WHITE)
        X['n'] += 1
    groups.append(X)

    # ---------- 第二批 ----------
    def glass_spot(D, w, k=0):   # 門旁邊的玻璃上找一個放得下 w 寬的位置（沿門的座標；左右輪流；沒有玻璃就貼在門邊的牆上）
        g0, g1 = D.G(D.wd); left, right = (-0.12) - g0, g1 - (D.wd + 0.12)
        if (k % 2 == 0 and right >= w + 0.1) or left < w + 0.1: return D.wd + 0.12 + min(0.25, max(0.0, right - w) / 2)
        return -0.12 - w - min(0.25, max(0.0, left - w) / 2)
    def sheet(S, key, D, a0, y0, w, h, off=0.03): tq(S, key, [D.P(a0, y0, off), D.P(a0 + w, y0, off), D.P(a0 + w, y0 + h, off), D.P(a0, y0 + h, off)])
    def only(ids): return [(i, r, Door(r)) for i, r in enumerate(doors) if r['id'] in ids.get(SET, ())]
    # 端午：艾草菖蒲（一束綠葉、紅繩綁著，掛在門邊）＋便利店的粽子海報
    Dg = group('DRAGON')
    for i, r, D in only(DRAGON_HERB):
        a_, y1 = D.wd + 0.14, min(2.2, D.top - 0.25)   # 門的右邊（左邊留給飲料店的季節布條：端午那一週兩樣會同時出現）
        for k in range(7):
            dx = (k - 3) * 0.022; ln = 0.5 + 0.08 * (k % 3); col = ('#4f7a3a', '#6a9a4a', '#3f6a34')[k % 3]
            flat2(Dg['F'], [D.P(a_ + dx * 0.4, y1, 0.04), D.P(a_ + dx * 2.2 - 0.02, y1 - ln * 0.6, 0.05), D.P(a_ + dx * 3.0, y1 - ln, 0.06), D.P(a_ + dx * 2.2 + 0.02, y1 - ln * 0.6, 0.05)], col)
        cyl(Dg['V'], D.P(a_ - 0.05, y1 - 0.02, 0.05), D.P(a_ + 0.05, y1 - 0.02, 0.05), 0.012, '#c8201c', seg=5); cyl(Dg['V'], D.P(a_, y1, 0.02), D.P(a_, y1 + 0.1, 0.01), 0.004, '#c8201c', seg=3); Dg['n'] += 1
    for i, r, D in only(CVS): sheet(Dg, 'p_zong', D, glass_spot(D, 0.5, i), 1.05, 0.5, 0.7); Dg['n'] += 1
    groups.append(Dg)
    # 便利店：冬天、夏天的海報（同一個位置，日期不重疊）
    for code, key in (('CVSWINTER', 'p_oden'), ('CVSSUMMER', 'p_ice')):
        Gc = group(code)
        for i, r, D in only(CVS): sheet(Gc, key, D, glass_spot(D, 0.5, i + 1), 1.05, 0.5, 0.7); Gc['n'] += 1
        groups.append(Gc)
    # 情人節：咖啡店玻璃上的小愛心（紅、粉紅）；花序一張玫瑰花束的海報
    Vd = group('VDAY')
    for i, r, D in only(VDAY):
        if r['id'] == 'G11': sheet(Vd, 'p_rose', D, -0.12 - 0.5 - 1.05, 1.05, 0.5, 0.7); Vd['n'] += 1; continue   # 花序：貼在左邊櫥窗上、離門 1 m 多（門兩邊緊鄰的位置被門口的樹擋住）
        g0, g1 = D.G(D.wd)
        for k in range(8):
            a = g0 + 0.3 + (k * 0.618 % 1.0) * max(0.2, g1 - g0 - 0.6); y = 1.05 + ((k * 37) % 10) / 10 * 0.9; s_ = 0.055 + 0.02 * (k % 3); col = ('#d8261c', '#f08aa0', '#e85a78')[k % 3]
            if -0.1 < a < D.wd + 0.1 and 1.3 < y < 2.0: y = 1.1
            pts = [(0.0, -1.0), (0.95, 0.05), (1.0, 0.5), (0.75, 0.9), (0.35, 0.95), (0.0, 0.6), (-0.35, 0.95), (-0.75, 0.9), (-1.0, 0.5), (-0.95, 0.05)]
            flat2(Vd['F'], [D.P(a + px * s_, y + py * s_, 0.035) for (px, py) in pts], col)
        Vd['n'] += 1
    groups.append(Vd)
    # 萬聖節：玻璃上的黑色小蝙蝠＋上緣一串橘色的紙南瓜
    Hw = group('HALLOWEEN')
    for i, r, D in only(HALLOWEEN):
        g0, g1 = D.G(D.wd)
        for k in range(6):
            a = g0 + 0.35 + (k * 0.618 % 1.0) * max(0.2, g1 - g0 - 0.7); y = 1.2 + ((k * 53) % 10) / 10 * 0.8; s_ = 0.09 + 0.03 * (k % 2)
            pts = [(0.0, -0.25), (0.25, -0.05), (0.55, -0.3), (1.0, 0.25), (0.6, 0.15), (0.35, 0.35), (0.12, 0.2), (0.1, 0.45), (0.0, 0.3), (-0.1, 0.45), (-0.12, 0.2), (-0.35, 0.35), (-0.6, 0.15), (-1.0, 0.25), (-0.55, -0.3), (-0.25, -0.05)]
            flat2(Hw['F'], [D.P(a + px * s_, y + py * s_, 0.035) for (px, py) in reversed(pts)], '#1d1a16')
        n = max(5, int((g1 - g0) / 0.36)); ly = D.top + 0.0
        for k in range(n):
            a = g0 + (k + 0.5) * (g1 - g0) / n; cyl(Hw['V'], D.P(a - (g1 - g0) / n / 2, ly + 0.03, 0.05), D.P(a + (g1 - g0) / n / 2, ly + 0.03, 0.05), 0.004, INK, seg=3)
            ball(Hw['V'], D.P(a, ly - 0.07, 0.05), 0.07, '#e8862a' if k % 2 else '#f09a3a', sy=0.82, seg=8, rings=5); cyl(Hw['V'], D.P(a, ly - 0.02, 0.05), D.P(a, ly + 0.03, 0.05), 0.008, '#4f7a3a', seg=4)
            for sg in (-1, 1): flat2(Hw['F'], [D.P(a + sg * 0.012, ly - 0.07, 0.122), D.P(a + sg * 0.04, ly - 0.07, 0.118), D.P(a + sg * 0.026, ly - 0.045, 0.12)], '#1d1a16')   # 眼睛
        Hw['n'] += 1
    groups.append(Hw)
    # 飲料店門邊的季節布條（直的布旗，上面一根橫桿）
    for code, key in (('DRINKSUMMER', 'b_summer'), ('DRINKWINTER', 'b_winter')):
        Gd = group(code)
        for i, r, D in only(DRINK):
            a0, w_, h_ = -0.42, 0.28, 1.12; y0 = min(1.25, D.top - h_ - 0.2); sheet(Gd, key, D, a0, y0, w_, h_, off=0.06); cyl(Gd['V'], D.P(a0 - 0.03, y0 + h_ + 0.01, 0.06), D.P(a0 + w_ + 0.03, y0 + h_ + 0.01, 0.06), 0.012, INK, seg=5); Gd['n'] += 1
        groups.append(Gd)
    # 洗衣店的換季告示、期末考週影印店的兩張手寫告示（貼在玻璃上，四角一小段膠帶）
    for code, ids, keys in (('LAUNDRY', LAUNDRY, ('n_laundry',)), ('EXAM', EXAM, ('n_exam1', 'n_exam2'))):
        Gn = group(code)
        for i, r, D in only(ids):
            for j, key in enumerate(keys):
                w_, h_ = 0.46, 0.32; a0 = glass_spot(D, w_, i + j); y0 = 1.28 - j * 0.02 if len(keys) == 1 or glass_spot(D, w_, i) != glass_spot(D, w_, i + 1) else 1.5 - j * 0.38
                sheet(Gn, key, D, a0, y0, w_, h_)
                for (ca, cy_) in ((a0, y0), (a0 + w_, y0), (a0, y0 + h_), (a0 + w_, y0 + h_)): flat2(Gn['F'], [D.P(ca - 0.03, cy_ - 0.012, 0.034), D.P(ca + 0.03, cy_ - 0.012, 0.034), D.P(ca + 0.03, cy_ + 0.012, 0.034), D.P(ca - 0.03, cy_ + 0.012, 0.034)], '#e8dcb0')
            Gn['n'] += 1
        groups.append(Gn)

    # ---------- 第三批（11-11）----------
    FB_N = [0]
    def fbox(cm, x0, x1, y0, y1, z0, z1, col, k=1.0, e=None):
        # 平面著色的方塊每一面往裡縮 1.5 mm：兩個方塊貼在一起時角上的頂點位置一樣，single_side 會把它們當成「開口的零件」補反面，Cycles 打到反面＝整塊黑的
        # （第三批的水果箱、季節攤販的推車、桌子一開始都是這樣）；縮一點以後每一個方塊各自封閉
        #   縮多少每一個方塊輪流不一樣（1～2.5 mm）：兩個方塊共用一個角（例如書架的底板和側板都從同一個角開始）時，縮一樣多角還是會重疊
        if e is None: FB_N[0] += 1; e = 0.001 + 0.0005 * (FB_N[0] % 4)
        cm.cbox(x0 + e, x1 - e, y0 + e, y1 - e, z0 + e, z1 - e, col, k)
    FOOT = {}   # 落地東西的腳印 [x0, x1, z0, z1]（tests/season_deco_nav_unit.js：人站得到的地方離它們 ≥ 人的半徑）
    def foot(code, x0, x1, z0, z1): FOOT.setdefault(code, []).append([round(min(x0, x1), 3), round(max(x0, x1), 3), round(min(z0, z1), 3), round(max(z0, z1), 3)])
    def ell(cm, c, rx, ry, rz, col, seg=8, rings=5):
        before = set(cm.bm.faces); cm.ell(c, rx, ry, rz, seg=seg, rings=rings); cm.paint([f for f in cm.bm.faces if f not in before], col)
    def card(S, key, cx, y0, cz, w=0.26, h=0.18, facing=1, lean=0.0):   # 插在水果裡的手寫卡（atlas）＋一支竹籤；facing＝卡面朝 +z（1）或 −z（−1）
        dz = facing * lean
        tq(S, key, [(cx - w / 2 * facing, y0, cz + dz * 0), (cx + w / 2 * facing, y0, cz), (cx + w / 2 * facing, y0 + h, cz - dz), (cx - w / 2 * facing, y0 + h, cz - dz)])
        cyl(S['V'], (cx, y0 - 0.16, cz - 0.01 * facing), (cx, y0 + 0.02, cz - 0.01 * facing), 0.004, '#c9a46a', seg=4)
    def crate(S, x0, x1, y0, h, z0, z1, col='#b98a55'):   # 木箱：一個封閉的箱身＋每一面兩條深色的板條縫（貼在外面 3 mm 的薄片）
        # 第一版是一條一條板條＋四根角柱：角上的頂點重疊，匯出合併以後邊不是剛好兩個面，single_side 把它們當成開口的零件補了反面，Cycles 打到反面＝整箱黑的
        S['F'].cbox(x0, x1, y0, y0 + h, z0, z1, col)
        e = 0.003; dk = '#5a3a20'
        for k in (1, 2):
            ya = y0 + k * h / 3 - 0.006; yb = ya + 0.012
            flat2(S['F'], [(x0, ya, z1 + e), (x1, ya, z1 + e), (x1, yb, z1 + e), (x0, yb, z1 + e)], dk); flat2(S['F'], [(x1, ya, z0 - e), (x0, ya, z0 - e), (x0, yb, z0 - e), (x1, yb, z0 - e)], dk)
            flat2(S['F'], [(x1 + e, ya, z1), (x1 + e, ya, z0), (x1 + e, yb, z0), (x1 + e, yb, z1)], dk); flat2(S['F'], [(x0 - e, ya, z0), (x0 - e, ya, z1), (x0 - e, yb, z1), (x0 - e, yb, z0)], dk)
        for (xa, za) in ((x0, z0), (x1, z0), (x0, z1), (x1, z1)):   # 四個角的深色直條（角柱的樣子）
            sx = 1 if xa == x0 else -1; sz = 1 if za == z0 else -1
            flat2(S['F'], [(xa, y0, za - sz * e), (xa + sx * 0.03, y0, za - sz * e), (xa + sx * 0.03, y0 + h, za - sz * e), (xa, y0 + h, za - sz * e)], '#7a5430')
    def fruit_pile(S, x0, x1, y0, z0, z1, kind, seed):
        rr = __import__('random').Random(seed); V = S['V']; FL = S['F']
        if kind == 'spring':     # 枇杷：小小的橘黃色橢圓，一盒一盒（紙盒）
            for (a, b) in ((z0 + 0.02, (z0 + z1) / 2 - 0.01), ((z0 + z1) / 2 + 0.01, z1 - 0.02)):
                fbox(FL, x0 + 0.02, x1 - 0.02, y0, y0 + 0.05, a, b, '#f2e6c8', 0.95)
                for i in range(int((x1 - x0 - 0.06) / 0.07)):
                    for j in range(int((b - a - 0.02) / 0.07)):
                        c = (x0 + 0.06 + i * 0.07 + rr.uniform(-0.01, 0.01), y0 + 0.07, a + 0.04 + j * 0.07 + rr.uniform(-0.01, 0.01)); ell(V, c, 0.03, 0.026, 0.034, rr.choice(('#f0a32a', '#e8962a', '#f2b23a')), seg=7, rings=4)
        elif kind == 'summer':   # 芒果：紅到黃的漸層，堆成一座小山
            for k in range(14):
                c = (rr.uniform(x0 + 0.08, x1 - 0.08), y0 + 0.05 + (0.05 if k > 8 else 0.0), rr.uniform(z0 + 0.08, z1 - 0.08)); ell(V, c, 0.066, 0.046, 0.05, rr.choice(('#d8442a', '#e8702a', '#f0a020', '#e8c040')), seg=8, rings=5)
        elif kind == 'autumn':   # 文旦：淺黃綠的梨形，頭上一小段蒂
            for k in range(7):
                cx, cz = x0 + 0.1 + (k % 3) * ((x1 - x0 - 0.2) / 2), z0 + 0.12 + (k // 3) * ((z1 - z0 - 0.24) / 2); cy = y0 + 0.075 + (0.06 if k == 6 else 0.0)
                if k == 6: cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
                col = rr.choice(('#c8d070', '#d8d890', '#bcc864')); ball(V, (cx, cy, cz), 0.075, col, sy=0.95, seg=9, rings=6); ball(V, (cx, cy + 0.075, cz), 0.04, col, seg=7, rings=4); cyl(V, (cx, cy + 0.11, cz), (cx, cy + 0.13, cz), 0.006, '#4f6a2a', seg=4)
        else:                    # 冬天：椪柑一堆＋兩盒草莓（透明盒、紅色的小顆）
            for k in range(12):
                c = (rr.uniform(x0 + 0.06, x1 - 0.06), y0 + 0.04 + (0.04 if k > 7 else 0.0), rr.uniform(z0 + 0.06, (z0 + z1) / 2)); ell(V, c, 0.045, 0.036, 0.045, rr.choice(('#f08a1a', '#e8781a', '#f29a2a')), seg=8, rings=5)
            for j in range(2):
                bx0 = x0 + 0.03 + j * (x1 - x0 - 0.06) / 2; bx1 = bx0 + (x1 - x0 - 0.06) / 2 - 0.02; bz0 = (z0 + z1) / 2 + 0.03; bz1 = z1 - 0.03
                fbox(FL, bx0, bx1, y0, y0 + 0.005, bz0, bz1, '#e8eef0')
                for i in range(int((bx1 - bx0) / 0.035)):
                    for m in range(int((bz1 - bz0) / 0.035)): ell(V, (bx0 + 0.02 + i * 0.035, y0 + 0.022, bz0 + 0.02 + m * 0.035), 0.016, 0.018, 0.016, rr.choice(('#d8201c', '#c81818', '#e02a2a')), seg=5, rings=3)
                S['F'].poly([(bx0, y0 + 0.05, bz0), (bx1, y0 + 0.05, bz0), (bx1, y0 + 0.05, bz1), (bx0, y0 + 0.05, bz1)], '#eef4f6', 0.95)   # 盒蓋（平的薄片）
    # 阿忠鮮果的當季水果（四季各一組，同一個位置）
    if SET in FRUIT_SLOT:
        x0, x1, z0, z1 = FRUIT_SLOT[SET]
        for code, kind, key in (('FRUITSPRING', 'spring', 'q_spring'), ('FRUITSUMMER', 'summer', 'q_summer'), ('FRUITAUTUMN', 'autumn', 'q_autumn'), ('FRUITWINTER', 'winter', 'q_winter')):
            Fq = group(code); crate(Fq, x0, x1, 0.03, 0.26, z0, z1, '#a87a48'); crate(Fq, x0 + 0.01, x1 - 0.01, 0.29, 0.16, z0 + 0.03, z1 - 0.03)
            fbox(Fq['F'], x0 + 0.03, x1 - 0.03, 0.42, 0.44, z0 + 0.05, z1 - 0.05, '#c9a46a')   # 上面那個箱子裝滿了：水果堆在箱口上（第一版水果在箱子裡面，從街上看不到）
            fruit_pile(Fq, x0 + 0.02, x1 - 0.02, 0.44, z0 + 0.05, z1 - 0.05, kind, len(code)); card(Fq, key, (x0 + x1) / 2, 0.72, z1 - 0.06, w=0.34, h=0.24, facing=1)
            foot(code, x0, x1, z0, z1); Fq['n'] += 1; groups.append(Fq)
    # 中秋：阿忠鮮果門廊另一個空位，兩個文旦禮籃疊在木箱上（紅緞帶、提把）
    if SET in MOON_SLOT:
        x0, x1, z0, z1 = MOON_SLOT[SET]; Mo = group('MOON'); crate(Mo, x0, x1, 0.03, 0.3, z0, z1, '#a87a48')
        for k, (za, zb) in enumerate(((z0 + 0.03, (z0 + z1) / 2 - 0.01), ((z0 + z1) / 2 + 0.01, z1 - 0.03))):
            yb = 0.33; Mo['F'].crbox(x0 + 0.02, x1 - 0.02, yb, yb + 0.1, za, zb, '#b07a3a', r=0.02, seg=1)
            for (fx, fz) in ((0.27, 0.3), (0.73, 0.3), (0.27, 0.72), (0.73, 0.72)):
                c = (x0 + (x1 - x0) * fx, yb + 0.15, za + (zb - za) * fz); ball(Mo['V'], c, 0.075, '#d0d47a', sy=0.95, seg=9, rings=6); ball(Mo['V'], (c[0], c[1] + 0.07, c[2]), 0.04, '#d0d47a', seg=7, rings=4)
            cm_ = (x0 + x1) / 2
            for t in range(8):   # 提把（半圓）
                a0, a1 = math.pi * t / 8, math.pi * (t + 1) / 8; R_ = (x1 - x0) / 2 - 0.03; ym = yb + 0.12
                cyl(Mo['V'], (cm_ - math.cos(a0) * R_, ym + math.sin(a0) * 0.22, (za + zb) / 2), (cm_ - math.cos(a1) * R_, ym + math.sin(a1) * 0.22, (za + zb) / 2), 0.008, '#8a5a2a', seg=4)
            fbox(Mo['F'], x0 + 0.015, x1 - 0.015, yb + 0.06, yb + 0.09, zb - 0.006, zb, '#c8201c')   # 紅緞帶
        card(Mo, 'q_moon', (x0 + x1) / 2, 0.86, z1 - 0.05, w=0.24, h=0.17, facing=1); foot('MOON', x0, x1, z0, z1); Mo['n'] += 1; groups.append(Mo)
    # 花序門口花台上的季節花（一排盆花，面向街上＝−z）
    if SET in FN_PLANTER:
        rr = __import__('random').Random(11)
        def pot(S, x, z, col):
            cyl(S['V'], (x, 0.35, z), (x, 0.49, z), 0.085, col, seg=10); cyl(S['V'], (x, 0.485, z), (x, 0.5, z), 0.092, col, seg=10); ball(S['V'], (x, 0.495, z), 0.08, '#4a3424', sy=0.15, seg=8, rings=3)
        def leafs(S, x, z, n, ln, col, y=0.52):
            for k in range(n):
                a = k * 2 * math.pi / n + 0.3; dx, dz = math.cos(a), math.sin(a)
                flat2(S['F'], [(x, y, z), (x + dx * ln * 0.5 - dz * 0.025, y + 0.05, z + dz * ln * 0.5 + dx * 0.025), (x + dx * ln, y + 0.02, z + dz * ln), (x + dx * ln * 0.5 + dz * 0.025, y + 0.03, z + dz * ln * 0.5 - dx * 0.025)], col)
        for code in ('FNSPRING', 'FNMAY', 'FNJUNE', 'FNXMAS'):
            Fn = group(code)
            for (xa, xb) in FN_PLANTER[SET]:
                n = int((xb - xa) / 0.44) + 1
                for i in range(n):
                    x = xa + i * (xb - xa) / max(1, n - 1); z = FN_PZ + rr.uniform(-0.04, 0.04)
                    if code == 'FNXMAS':   # 聖誕紅：白盆、一叢紅色苞片（三層星形）、下面綠葉、中間黃點
                        pot(Fn, x, z, '#eeeae2'); leafs(Fn, x, z, 6, 0.13, '#2f5a2a', 0.53)
                        for L_, (rad, yy, col) in enumerate(((0.12, 0.57, '#b81818'), (0.09, 0.6, '#c8201c'), (0.06, 0.63, '#d82a22'))): leafs(Fn, x, z, 6 - L_, rad, col, yy)
                        for k in range(4): ball(Fn['V'], (x + 0.012 * math.cos(k * 1.6), 0.645, z + 0.012 * math.sin(k * 1.6)), 0.008, '#e8c83a', seg=4, rings=3)
                        continue
                    pot(Fn, x, z, '#b5653a'); leafs(Fn, x, z, 5, 0.1, '#3f6a34')
                    if code == 'FNJUNE':   # 向日葵：三支高的、花盤朝街上（−z）
                        for k in range(3):
                            sx, sz, h = x + (k - 1) * 0.05, z + (0.02 if k == 1 else -0.01), 0.42 + 0.08 * (k == 1)
                            cyl(Fn['V'], (sx, 0.5, sz), (sx, 0.5 + h, sz - 0.03), 0.007, '#4f7a3a', seg=4); cy, cz = 0.5 + h, sz - 0.05
                            for p_ in range(12):
                                a = p_ * math.pi / 6; flat2(Fn['F'], [(sx + math.cos(a) * 0.03, cy + math.sin(a) * 0.03, cz), (sx + math.cos(a + 0.2) * 0.075, cy + math.sin(a + 0.2) * 0.075, cz - 0.004), (sx + math.cos(a) * 0.085, cy + math.sin(a) * 0.085, cz - 0.006), (sx + math.cos(a - 0.2) * 0.075, cy + math.sin(a - 0.2) * 0.075, cz - 0.004)], '#f2c218')
                            ball(Fn['V'], (sx, cy, cz - 0.008), 0.034, '#5a3a1a', sy=1.0, seg=8, rings=4)
                        continue
                    heads = ('#d8261c', '#f07890', '#f2c22a', '#e84a6a') if code == 'FNSPRING' else ('#d8261c', '#f08aa0', '#e84a6a', '#f4d0d8')
                    for k in range(6):   # 鬱金香（杯形）／康乃馨（花瓣多、扁一點）
                        a = k * 1.05 + rr.uniform(-0.2, 0.2); sx, sz = x + math.cos(a) * 0.035, z + math.sin(a) * 0.035; h = 0.24 + rr.uniform(0, 0.08)
                        cyl(Fn['V'], (sx, 0.5, sz), (sx + math.cos(a) * 0.02, 0.5 + h + 0.06, sz + math.sin(a) * 0.02), 0.005, '#4f7a3a', seg=4)
                        c = (sx + math.cos(a) * 0.02, 0.5 + h + 0.02, sz + math.sin(a) * 0.02); col = heads[(i + k) % len(heads)]
                        c = (c[0], c[1] + 0.06, c[2])   # 比花台上的矮灌木（0.55）高出一截，從騎樓看得到
                        if code == 'FNSPRING': ell(Fn['V'], c, 0.03, 0.05, 0.03, col, seg=6, rings=3)
                        else: ell(Fn['V'], c, 0.04, 0.028, 0.04, col, seg=7, rings=3); ball(Fn['V'], (c[0], c[1] - 0.032, c[2]), 0.013, '#5a8a4a', seg=4, rings=2)   # 康乃馨（三角形數壓低：花台上二十幾朵）
            Fn['n'] += 1; groups.append(Fn)
    # 元宵：公園入口步道上方，兩棵樟樹之間一串小燈籠（電線垂下來一點；燈籠會發光）
    if SET in LANTERN_LINE:
        (ax, az), (bx, bz) = LANTERN_LINE[SET]; Ln = group('LANTERN'); N = 24; yA = 3.4; sag = 0.55; P_ = []
        for k in range(N + 1):
            t = k / N; P_.append((ax + (bx - ax) * t, yA - sag * 4 * t * (1 - t), az + (bz - az) * t))
        for k in range(N): cyl(Ln['V'], P_[k], P_[k + 1], 0.006, INK, seg=4)
        for k in range(2, N - 1, 2):
            px, py, pz = P_[k]; c = (px, py - 0.26, pz); col = '#d8261c' if k % 4 else '#e8862a'
            cyl(Ln['V'], (px, py, pz), (px, py - 0.12, pz), 0.004, INK, seg=3); ball(Ln['Gl'], c, 0.12, col, sy=1.15, seg=10, rings=6)
            for yy in (0.13, -0.13): cyl(Ln['V'], (c[0], c[1] + yy - 0.015, c[2]), (c[0], c[1] + yy + 0.015, c[2]), 0.055, GOLD, seg=8)
            cyl(Ln['V'], (c[0], c[1] - 0.145, c[2]), (c[0], c[1] - 0.3, c[2]), 0.012, col, seg=4)
        Ln['n'] += 1; groups.append(Ln)
    # 中秋晚上：騎樓的小烤肉架（木炭在發光）、一張紅色塑膠凳、一袋木炭；有自己的導航阻擋（data 的 blocks）
    if SET in BBQ:
        x0, x1, z0, z1 = BBQ[SET]; Bq = group('MOONBBQ'); V = Bq['V']; FB = Bq['F']; gx0, gx1, gz0, gz1 = x0 + 0.06, x0 + 0.56, z0 + 0.09, z0 + 0.39; top = 0.62
        for (lx, lz) in ((gx0 + 0.03, gz0 + 0.03), (gx1 - 0.03, gz0 + 0.03), (gx0 + 0.03, gz1 - 0.03), (gx1 - 0.03, gz1 - 0.03)): cyl(V, (lx, 0.05, lz), (lx, top - 0.1, lz), 0.012, '#2a2a2a', seg=5)
        fbox(FB, gx0, gx1, top - 0.12, top - 0.1, gz0, gz1, '#2a2a2a'); fbox(FB, gx0, gx0 + 0.012, top - 0.12, top, gz0, gz1, '#3a3a3a'); fbox(FB, gx1 - 0.012, gx1, top - 0.12, top, gz0, gz1, '#3a3a3a')
        fbox(FB, gx0, gx1, top - 0.12, top, gz0, gz0 + 0.012, '#3a3a3a'); fbox(FB, gx0, gx1, top - 0.12, top, gz1 - 0.012, gz1, '#3a3a3a')
        rr = __import__('random').Random(7)
        for k in range(16): ball(Bq['Gl'], (rr.uniform(gx0 + 0.04, gx1 - 0.04), top - 0.06, rr.uniform(gz0 + 0.04, gz1 - 0.04)), 0.028, rr.choice(('#ff6a20', '#ff8a2a', '#c83a14')), sy=0.6, seg=6, rings=3)   # 燒紅的木炭
        for k in range(7): fbox(FB, gx0 + 0.02, gx1 - 0.02, top - 0.012, top - 0.004, gz0 + 0.03 + k * 0.04, gz0 + 0.035 + k * 0.04, '#9aa0a4')   # 烤網
        for k, (col, rad, ln) in enumerate((('#f2c22a', 0.022, 0.12), ('#8a3a20', 0.016, 0.13), ('#f2c22a', 0.022, 0.12), ('#6a8a3a', 0.018, 0.1))):   # 玉米、香腸、玉米、青椒
            zz = gz0 + 0.07 + k * 0.07; cyl(V, (gx0 + 0.1, top + 0.02, zz), (gx0 + 0.1 + ln, top + 0.02, zz), rad, col, seg=7); cyl(V, (gx0 + 0.06, top + 0.02, zz), (gx1 - 0.04, top + 0.02, zz), 0.003, '#c9a46a', seg=3)
        sx0, sx1 = x0 + 0.66, x0 + 0.94; fbox(FB, sx0, sx1, 0.4, 0.43, z0 + 0.1, z0 + 0.38, '#c8302a')   # 紅色塑膠凳
        for (lx, lz) in ((sx0 + 0.02, z0 + 0.12), (sx1 - 0.02, z0 + 0.12), (sx0 + 0.02, z0 + 0.36), (sx1 - 0.02, z0 + 0.36)): cyl(V, (lx, 0.05, lz), (lx, 0.41, lz), 0.016, '#b82a24', seg=5)
        FB.crbox(x0 + 0.68, x0 + 0.92, 0.05, 0.3, z0 + 0.4, z0 + 0.48, '#3a3a3a', r=0.02, seg=1); fbox(FB, x0 + 0.72, x0 + 0.88, 0.12, 0.22, z0 + 0.398, z0 + 0.4, '#e8e4d8')   # 一袋木炭
        foot('MOONBBQ', x0 + 0.04, x0 + 0.96, z0 + 0.06, z0 + 0.49); Bq['n'] += 1; groups.append(Bq)
    # ---------- 季節攤販（A1～A6）：位置、腳印照 src/data/season_deco.js 的 stalls；招牌面向客人站的那一邊 ----------
    SD = season_data(); STL = SD['zones'].get(SET, {}).get('stalls', [])
    def cboxF(S, x0, x1, y0, y1, z0, z1, col): fbox(S['F'], x0, x1, y0, y1, z0, z1, col)
    def wheel(S, x, z, r, axis_z=True):
        a, b = ((x, r, z - 0.03), (x, r, z + 0.03)) if axis_z else ((x - 0.03, r, z), (x + 0.03, r, z)); cyl(S['V'], a, b, r, '#2a2a2a', seg=12); cyl(S['V'], (a[0], a[1], a[2] - 0.004 if axis_z else a[2]), (b[0], b[1], b[2] + 0.004 if axis_z else b[2]), r * 0.45, '#9aa0a4', seg=8)
    def sign_on_pole(S, key, x, z, y0, w, h, s_):   # 一支桿子上一塊招牌，面向 s_（+1＝+z、−1＝−z）
        cyl(S['V'], (x, 0.05, z), (x, y0 + h, z), 0.018, '#5a5f63', seg=6)
        tq(S, key, [(x - w / 2 * s_, y0, z + 0.025 * s_), (x + w / 2 * s_, y0, z + 0.025 * s_), (x + w / 2 * s_, y0 + h, z + 0.025 * s_), (x - w / 2 * s_, y0 + h, z + 0.025 * s_)])
        cboxF(S, x - w / 2 - 0.015, x + w / 2 + 0.015, y0 - 0.015, y0 + h + 0.015, z - 0.01 * s_ if s_ > 0 else z + 0.015, z + 0.015 if s_ > 0 else z - 0.01 * s_, '#3a3a3a')
    for st in STL:
        x0, x1, z0, z1 = st['foot']; cx, cz = (x0 + x1) / 2, (z0 + z1) / 2; s_ = 1 if st['at']['z'] > cz else -1; zf = z1 if s_ > 0 else z0; zb = z0 if s_ > 0 else z1   # zf＝客人那一面
        S = group(st['code']); rr = __import__('random').Random(len(st['key']) * 31)
        if st['code'] == 'YAM':        # 烤地瓜推車：鐵板車身、兩個輪子、一個大鐵桶烤爐（蓋子、煙囪）、一盤烤好的地瓜、一顆燈泡
            cboxF(S, x0, x1, 0.5, 0.56, z0, z1, '#6a6e72'); cboxF(S, x0 + 0.02, x1 - 0.02, 0.18, 0.5, z0 + 0.04, z1 - 0.04, '#4a4e52')
            for xx in (x0 + 0.2, x1 - 0.2): wheel(S, xx, zb, 0.17)
            ox = cx - 0.12; cyl(S['V'], (ox, 0.56, cz), (ox, 1.02, cz), 0.25, '#2a2a2a', seg=14); cyl(S['V'], (ox, 1.02, cz), (ox, 1.06, cz), 0.27, '#3a3a3a', seg=14); ball(S['V'], (ox, 1.08, cz), 0.04, '#9aa0a4', seg=6, rings=3)
            cyl(S['V'], (ox + 0.12, 1.04, cz - 0.1), (ox + 0.12, 1.55, cz - 0.1), 0.035, '#3a3a3a', seg=6)
            for k in range(3): ball(S['V'], (ox + 0.12 + 0.03 * k, 1.62 + 0.12 * k, cz - 0.1), 0.06 + 0.03 * k, '#d8d6d0', seg=6, rings=3)   # 一點煙
            tx0 = x1 - 0.42; cboxF(S, tx0, x1 - 0.04, 0.56, 0.6, z0 + 0.06, z1 - 0.06, '#b9bec2')
            for k in range(6): ell(S['V'], (tx0 + 0.07 + (k % 3) * 0.1, 0.63, z0 + 0.15 + (k // 3) * 0.28), 0.05, 0.035, 0.11, rr.choice(('#7a3a3a', '#8a4a3a', '#6a2a30')), seg=7, rings=4)
            cyl(S['V'], (cx, 1.6, zb), (cx, 2.0, zb), 0.015, '#5a5f63', seg=5); ball(S['Gl'], (cx, 1.55, zb), 0.05, '#ffe9b0', seg=7, rings=4)
            sign_on_pole(S, 'st_yam', x0 + 0.06, zf - 0.05 * s_, 1.15, 0.5, 0.35, s_)
        elif st['code'] == 'AIYU':     # 愛玉、仙草冰推車：白色車身、上面一個玻璃櫃（框）、兩大碗（黃的愛玉、黑的仙草）、一疊碗、一把紅白陽傘
            cboxF(S, x0, x1, 0.2, 0.85, z0, z1, '#f2f0ea'); cboxF(S, x0, x1, 0.85, 0.88, z0, z1, '#b9bec2')
            for xx in (x0 + 0.18, x1 - 0.18): wheel(S, xx, zb, 0.16)
            for (gx, gz) in ((x0 + 0.02, z0 + 0.02), (x1 - 0.04, z0 + 0.02), (x0 + 0.02, z1 - 0.04), (x1 - 0.04, z1 - 0.04)): cboxF(S, gx, gx + 0.02, 0.88, 1.2, gz, gz + 0.02, '#b9bec2')
            cboxF(S, x0, x1, 1.2, 1.22, z0, z1, '#b9bec2'); flat2(S['F'], [(x0 + 0.03, 0.9, zf), (x1 - 0.03, 0.9, zf), (x1 - 0.03, 1.19, zf), (x0 + 0.03, 1.19, zf)], '#dfeaf0')   # 玻璃（淡藍白，不透明的頂點色）
            for k, (col, top) in enumerate((('#f2d24a', '#f6dc6a'), ('#1d1a16', '#2a2420'))):
                bx = x0 + 0.3 + k * 0.4; clathe_ = None; cyl(S['V'], (bx, 0.88, cz), (bx, 1.02, cz), 0.16, '#f4f1ea', seg=12); cyl(S['V'], (bx, 1.0, cz), (bx, 1.015, cz), 0.145, top, seg=12)
            for k in range(5): cyl(S['V'], (x1 - 0.15, 0.88 + k * 0.03, cz + 0.1 * s_), (x1 - 0.15, 0.9 + k * 0.03, cz + 0.1 * s_), 0.06, '#f4f1ea', seg=8)
            ux, uz = cx, zb + 0.1 * s_; cyl(S['V'], (ux, 0.88, uz), (ux, 2.25, uz), 0.016, '#c9ccce', seg=5)
            for k in range(12):
                a0, a1 = k * math.pi / 6, (k + 1) * math.pi / 6; R_ = 0.95
                S['V'].poly([(ux, 2.35, uz), (ux + math.cos(a0) * R_, 2.05, uz + math.sin(a0) * R_), (ux + math.cos(a1) * R_, 2.05, uz + math.sin(a1) * R_)], '#d8261c' if k % 2 else '#f4f1ea')
                S['V'].poly([(ux, 2.34, uz), (ux + math.cos(a1) * R_, 2.04, uz + math.sin(a1) * R_), (ux + math.cos(a0) * R_, 2.04, uz + math.sin(a0) * R_)], '#b81818' if k % 2 else '#dcd8d0')
            sign_on_pole(S, 'st_aiyu', x0 + 0.05, zf - 0.04 * s_, 1.3, 0.42, 0.3, s_)
        elif st['code'] == 'MOONCAKE': # 中秋禮盒的臨時桌：折疊桌、紅桌巾（前面垂下來）、一疊一疊的禮盒、幾個月餅
            cboxF(S, x0, x1, 0.72, 0.75, z0, z1, '#c8201c'); cboxF(S, x0, x1, 0.28, 0.75, min(zf, zf + 0.008 * s_), max(zf, zf + 0.008 * s_), '#b81818')
            for (lx, lz) in ((x0 + 0.05, z0 + 0.05), (x1 - 0.05, z0 + 0.05), (x0 + 0.05, z1 - 0.05), (x1 - 0.05, z1 - 0.05)): cyl(S['V'], (lx, 0.0, lz), (lx, 0.72, lz), 0.015, '#9aa0a4', seg=5)
            bx = x0 + 0.06
            while bx < x1 - 0.3:
                n = rr.randint(2, 4); w_ = rr.uniform(0.26, 0.34)
                for k in range(n): cboxF(S, bx, bx + w_, 0.75 + k * 0.09, 0.75 + (k + 1) * 0.09 - 0.004, z0 + 0.08, z1 - 0.12, rr.choice(('#c8201c', '#a01814', '#d8a02a', '#7a1a2a'))); flat2(S['F'], [(bx + w_ * 0.2, 0.75 + k * 0.09 + 0.02, zf - 0.12 * s_ + 0.002 * s_), (bx + w_ * 0.8, 0.75 + k * 0.09 + 0.02, zf - 0.12 * s_ + 0.002 * s_), (bx + w_ * 0.8, 0.75 + k * 0.09 + 0.06, zf - 0.12 * s_ + 0.002 * s_), (bx + w_ * 0.2, 0.75 + k * 0.09 + 0.06, zf - 0.12 * s_ + 0.002 * s_)], '#f2d24a')
                bx += w_ + 0.04
            for k in range(3): cyl(S['V'], (x1 - 0.18 + (k % 2) * 0.08, 0.75, cz + (k - 1) * 0.1), (x1 - 0.18 + (k % 2) * 0.08, 0.79, cz + (k - 1) * 0.1), 0.05, '#c88a3a', seg=10)
            sign_on_pole(S, 'st_mooncake', x1 - 0.05, zf - 0.03 * s_, 1.05, 0.42, 0.3, s_)
        elif st['code'] == 'COUPLET':  # 春聯、年貨：兩支桿子＋一根橫桿，掛一排春聯（和過年門上的同一批字）；下面一張桌子（紅紙、紅包袋）；桿子上一塊直招牌
            for xx in (x0 + 0.03, x1 - 0.03): cyl(S['V'], (xx, 0.0, cz), (xx, 1.95, cz), 0.022, '#5a5f63', seg=6)
            cyl(S['V'], (x0, 1.9, cz), (x1, 1.9, cz), 0.015, '#5a5f63', seg=5)
            for k in range(7):
                ax = x0 + 0.18 + k * (x1 - x0 - 0.36) / 6; key = 'c%d%s' % (k % 4, 'ab'[k % 2]); w_, h_ = 0.13, 0.9
                tq(S, key, [(ax - w_ / 2 * s_, 0.98, cz + 0.01 * s_), (ax + w_ / 2 * s_, 0.98, cz + 0.01 * s_), (ax + w_ / 2 * s_, 0.98 + h_, cz + 0.01 * s_), (ax - w_ / 2 * s_, 0.98 + h_, cz + 0.01 * s_)])
                tq(S, key, [(ax + w_ / 2 * s_, 0.98, cz - 0.004 * s_), (ax - w_ / 2 * s_, 0.98, cz - 0.004 * s_), (ax - w_ / 2 * s_, 0.98 + h_, cz - 0.004 * s_), (ax + w_ / 2 * s_, 0.98 + h_, cz - 0.004 * s_)])
            tz0, tz1 = (cz, z1) if s_ > 0 else (z0, cz); cboxF(S, x0 + 0.1, x1 - 0.1, 0.7, 0.73, tz0, tz1, '#c8201c')
            for (lx, lz) in ((x0 + 0.14, tz0 + 0.03), (x1 - 0.14, tz0 + 0.03), (x0 + 0.14, tz1 - 0.03), (x1 - 0.14, tz1 - 0.03)): cyl(S['V'], (lx, 0.0, lz), (lx, 0.7, lz), 0.014, '#9aa0a4', seg=5)
            for k in range(8): cboxF(S, x0 + 0.2 + k * 0.22, x0 + 0.36 + k * 0.22, 0.73, 0.74 + 0.012 * (k % 3), tz0 + 0.04, tz1 - 0.04, ('#d8261c', '#e83a2a', '#f2c22a')[k % 3])   # 一疊疊的紅紙、紅包袋
            tq(S, 'st_couplet', [(x0 - 0.12 * s_ - 0.06, 0.95, cz + 0.03 * s_), (x0 - 0.12 * s_ + 0.06, 0.95, cz + 0.03 * s_), (x0 - 0.12 * s_ + 0.06, 1.85, cz + 0.03 * s_), (x0 - 0.12 * s_ - 0.06, 1.85, cz + 0.03 * s_)][::(1 if s_ > 0 else -1)])
        elif st['code'] == 'BOUQUET':  # 畢業花束：鋪白布的桌子、一束一束包好的花（牛皮紙＋向日葵、滿天星），招牌貼在桌前
            cboxF(S, x0, x1, 0.72, 0.75, z0, z1, '#f4f1ea'); cboxF(S, x0, x1, 0.3, 0.75, min(zf, zf + 0.008 * s_), max(zf, zf + 0.008 * s_), '#ece8e0')
            for (lx, lz) in ((x0 + 0.05, z0 + 0.05), (x1 - 0.05, z0 + 0.05), (x0 + 0.05, z1 - 0.05), (x1 - 0.05, z1 - 0.05)): cyl(S['V'], (lx, 0.0, lz), (lx, 0.72, lz), 0.015, '#9aa0a4', seg=5)
            for k in range(5):
                bx = x0 + 0.14 + k * (x1 - x0 - 0.28) / 4; bz = cz - 0.05 * s_; tip = (bx, 0.76, bz); top = (bx, 1.08, bz + 0.05 * s_)
                before = set(S['V'].bm.faces); S['V'].cyl(tip, top, 0.02, seg=8, r2=0.1); S['V'].paint([f for f in S['V'].bm.faces if f not in before], ('#c9a46a', '#f4f1ea', '#d8b88a')[k % 3])
                for j in range(3):
                    hx, hy, hz = bx + (j - 1) * 0.045, 1.12 + 0.03 * (j == 1), bz + 0.06 * s_
                    for p_ in range(8):
                        a = p_ * math.pi / 4; flat2(S['F'], [(hx + math.cos(a) * 0.015, hy + math.sin(a) * 0.015, hz), (hx + math.cos(a + 0.3) * 0.045, hy + math.sin(a + 0.3) * 0.045, hz + 0.003 * s_), (hx + math.cos(a) * 0.05, hy + math.sin(a) * 0.05, hz + 0.004 * s_), (hx + math.cos(a - 0.3) * 0.045, hy + math.sin(a - 0.3) * 0.045, hz + 0.003 * s_)], '#f2c218')
                    ball(S['V'], (hx, hy, hz + 0.004 * s_), 0.02, '#5a3a1a', seg=6, rings=3)
                for j in range(5): ball(S['V'], (bx + rr.uniform(-0.07, 0.07), 1.1 + rr.uniform(-0.03, 0.05), bz + rr.uniform(-0.03, 0.06) * s_), 0.012, '#f6f4ee', seg=4, rings=2)
            tq(S, 'st_bouquet', [(cx - 0.3 * s_, 0.42, zf + 0.014 * s_), (cx + 0.3 * s_, 0.42, zf + 0.014 * s_), (cx + 0.3 * s_, 0.65, zf + 0.014 * s_), (cx - 0.3 * s_, 0.65, zf + 0.014 * s_)])
        elif st['code'] == 'TEXTBOOK': # 二手教科書特價架：兩層木架（書背朝客人）、上面一塊長招牌
            cboxF(S, x0, x1, 0.05, 0.08, z0, z1, '#8a6a4a')
            for yy in (0.08, 0.48): cboxF(S, x0, x1, yy + 0.36, yy + 0.38, z0, z1, '#a07a50')
            for xx in (x0, x1 - 0.03): cboxF(S, xx, xx + 0.03, 0.05, 0.9, z0, z1, '#8a6a4a')
            cboxF(S, x0, x1, 0.05, 0.9, zb - 0.01 * s_ if s_ < 0 else zb, zb + 0.01 if s_ < 0 else zb + 0.01, '#7a5a3a')
            for yy in (0.08, 0.48):
                bx = x0 + 0.04
                while bx < x1 - 0.06:
                    w_ = rr.uniform(0.025, 0.05); h_ = rr.uniform(0.24, 0.33); cboxF(S, bx, bx + w_, yy, yy + h_, z0 + 0.03, z1 - 0.03, rr.choice(('#1f4f9c', '#8a2a26', '#2f5a3a', '#e8dcb8', '#4a4e52', '#c8a040', '#6a3a7a'))); bx += w_ + 0.004
            tq(S, 'st_textbook', [(x0 + 0.02 if s_ > 0 else x1 - 0.02, 0.92, zf + 0.01 * s_), (x1 - 0.02 if s_ > 0 else x0 + 0.02, 0.92, zf + 0.01 * s_), (x1 - 0.02 if s_ > 0 else x0 + 0.02, 1.12, zf + 0.01 * s_), (x0 + 0.02 if s_ > 0 else x1 - 0.02, 1.12, zf + 0.01 * s_)])
        foot(st['code'], x0, x1, z0, z1); S['n'] += 1; groups.append(S)
    # 下雨天：店門口一塊地墊（平的）；門邊有空位的放一個傘架（三、四支收起來的傘）
    Rn = group('RAIN')
    for i, r in enumerate(doors):
        if r['kind'] not in RAIN_KINDS: continue
        D = Door(r); wd = D.wd
        flat2(Rn['F'], [D.P(wd * 0.12, 0.012 + (0.05 if r['kind'] == 'gg' else 0.03), 0.06), D.P(wd * 0.88, 0.012 + (0.05 if r['kind'] == 'gg' else 0.03), 0.06), D.P(wd * 0.88, 0.012 + (0.05 if r['kind'] == 'gg' else 0.03), 0.62), D.P(wd * 0.12, 0.012 + (0.05 if r['kind'] == 'gg' else 0.03), 0.62)], ('#5a3a32', '#3a4048', '#6a2a26')[i % 3])
        if r['id'] in RSPOT:
            a, fy = RSPOT[r['id']]; c = D.P(a, fy, 0.3); col = ('#4a5058', '#2f5a8a', '#8a8f93')[i % 3]
            cyl(Rn['V'], (c[0], fy, c[2]), (c[0], fy + 0.44, c[2]), 0.12, col, seg=10); cyl(Rn['V'], (c[0], fy + 0.42, c[2]), (c[0], fy + 0.45, c[2]), 0.13, '#2a2a2a', seg=10)
            for k, ucol in enumerate(('#1f2f5a', '#c8302a', '#e8e8e8', '#2f6a3a')[:3 + (i % 2)]):
                ang = k * 2.1 + i; ox, oz = math.cos(ang) * 0.05, math.sin(ang) * 0.05; tip = (c[0] + ox * 0.6, fy + 0.08, c[2] + oz * 0.6); top_ = (c[0] + ox * 1.8, fy + 0.86, c[2] + oz * 1.8)
                before = set(Rn['V'].bm.faces); Rn['V'].cyl(tip, top_, 0.012, seg=6, r2=0.032); Rn['V'].paint([f for f in Rn['V'].bm.faces if f not in before], ucol)
                cyl(Rn['V'], top_, (top_[0], top_[1] + 0.1, top_[2]), 0.006, '#9aa0a4', seg=4); ball(Rn['V'], (top_[0], top_[1] + 0.12, top_[2]), 0.02, '#2a2a2a', seg=5, rings=3)
            foot('RAIN', c[0] - 0.13, c[0] + 0.13, c[2] - 0.13, c[2] + 0.13)
        Rn['n'] += 1
    groups.append(Rn)

    for S_ in groups:
        code = S_['g'].name.split('_')[1]; tris = 0
        if len(S_['A'].bm.faces): S_['A'].finish(S_['g'], uv=False, merge=False)
        else: S_['A'].bm.free()
        for key in ('V', 'Gl', 'F'):
            if len(S_[key].bm.faces): S_[key].finish(S_['g'], uv=False, smooth=key != 'F')
            else: S_[key].bm.free()
        for ob in S_['g'].children:
            ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
        stat[code] = dict(doors=S_['n'], tris=tris)
    L.single_side(root, nodup=r'season_atlas')   # 春聯貼在門面上，只從外面看
    info = L.export(out, gpu_instances=False)
    L.write_json(out[:-4] + '.json', dict(info if isinstance(info, dict) else {}, set=SET, doors=len(doors), groups=stat, foot=FOOT, rain_stands=sorted(RSPOT),
                                          note='LIFE-DETAILS-SEASONAL-1110 第一、二批：SEASON_<代號>_on（CNY 過年、XMAS 聖誕、DRAGON 端午、VDAY 情人節、HALLOWEEN 萬聖節、CVSWINTER／CVSSUMMER 便利店海報、DRINKSUMMER／DRINKWINTER 飲料店布條、LAUNDRY 洗衣店換季、EXAM 期末考週影印店）；日期表 src/data/season_deco.js'))
    json.dump(doors, open(out[:-4] + '.doors.json', 'w'), ensure_ascii=False, indent=1)
    print(json.dumps({'SEASON': SET, 'doors': len(doors), 'groups': stat}, ensure_ascii=False))
