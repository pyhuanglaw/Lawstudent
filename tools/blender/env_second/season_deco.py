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


def export(SET, doors, out):
    doors = [r for r in doors if r['id'] not in SKIP]
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
                c = D.P(a_, D.top + 0.02, 0.28); ball(S['Gl'], c, 0.17, '#d8261c', sy=1.12, seg=12, rings=7)
                for yy in (0.2, -0.2): cyl(S['V'], (c[0], c[1] + yy - 0.02, c[2]), (c[0], c[1] + yy + 0.02, c[2]), 0.075, GOLD, seg=10)
                cyl(S['V'], (c[0], c[1] + 0.22, c[2]), (c[0], c[1] + 0.42, c[2]), 0.006, INK, seg=4); cyl(S['V'], (c[0], c[1] - 0.22, c[2]), (c[0], c[1] - 0.46, c[2]), 0.02, '#d8261c', seg=5)
                p0 = D.P(a_, D.top + 0.44, 0.0); cyl(S['V'], p0, (c[0], c[1] + 0.42, c[2]), 0.008, INK, seg=4)
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
    L.write_json(out[:-4] + '.json', dict(info if isinstance(info, dict) else {}, set=SET, doors=len(doors), groups=stat,
                                          note='LIFE-DETAILS-SEASONAL-1110 第一、二批：SEASON_<代號>_on（CNY 過年、XMAS 聖誕、DRAGON 端午、VDAY 情人節、HALLOWEEN 萬聖節、CVSWINTER／CVSSUMMER 便利店海報、DRINKSUMMER／DRINKWINTER 飲料店布條、LAUNDRY 洗衣店換季、EXAM 期末考週影印店）；日期表 src/data/season_deco.js'))
    json.dump(doors, open(out[:-4] + '.doors.json', 'w'), ensure_ascii=False, indent=1)
    print(json.dumps({'SEASON': SET, 'doors': len(doors), 'groups': stat}, ensure_ascii=False))
