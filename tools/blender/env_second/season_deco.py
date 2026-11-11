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
SKIP = ('A2C',)   # 阿德影印搬到轉角以後的店面：要看劇情狀態（WZ_COPY_SHOP）才有，先不貼


def make_atlas():
    """春聯四副（上下聯各 7 字，直的）＋橫批四張＋倒貼的「福」＋「春」→ season_atlas.jpg（1024×1024）；回傳 {key: (u0, v0, u1, v1)}"""
    W = H = 1024; im = Image.new('RGB', (W, H), RED); d = ImageDraw.Draw(im); uv = {}
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
                                          note='LIFE-DETAILS-SEASONAL-1110 第一批：SEASON_CNY_on 過年（春聯、橫批、福、燈籠）、SEASON_XMAS_on 聖誕（花圈、燈串、雪花貼紙）；日期表 src/data/season_deco.js'))
    json.dump(doors, open(out[:-4] + '.doors.json', 'w'), ensure_ascii=False, indent=1)
    print(json.dumps({'SEASON': SET, 'doors': len(doors), 'groups': stat}, ensure_ascii=False))
