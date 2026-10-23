"""總圖 B1（CLOSED-SPACES-1023 第 2 項；AA_399 第 2 節；使用者 D46「總圖 B1」、10-23「遊戲裡任何現在關起來的空間都可以開始開發」）
→ assets/models/env/second_ai/library_b1.glb＋library_b1.layout.json。LAWWW2-B 2026-10-23；Blender 5.2：
  /opt/blenv/bin/python tools/blender/env_second/library_b1.py [-- --out-dir assets/models/env/second_ai] [--js <repo 根目錄>（順便寫 src/data/library_b1_layout.js）]
座標和總圖大廳（src/data/library_layout.js）同一套：x −12…12（東）、z −9…9（南，+z 是正面），B1 地板 y＝0、天花板 3.2 m；地下室，沒有窗。
電梯井和大廳同一個位置（x 9.4…11.4、z −2.6…−0.4，門朝北）。樣子照兩張 2D 背景（assets/bg/ntu_lib_b1.webp 自習室、library_b1.webp 討論室）：
  - 24 小時自習室（北邊）：南側玻璃牆＋玻璃門（刷卡機）；靠北牆一排單面長桌、中間一排雙面長桌（中間木隔板），每個位子一盞綠色檯燈、木椅紅椅墊；
  - 討論室 1、2（南邊）：北側玻璃牆（中間一條霧面帶）＋玻璃門、六人桌、辦公椅、白板、電視、預約表；
  - 西邊門廳：樓梯間的門（上 1F）、置物櫃、公告欄、飲水機；電梯前：自助借還書機兩台、還書口；東南：影印中心（櫃台、三台影印機、列印站）。
地板淺色石英磚（不用深色木地板，使用者 10-23）；內容都是虛構的（沒有真實姓名、課號、價錢以外的真實資訊）。
做法和霖澤館 5F 一樣（linze_upper.py 的隔間牆、印刷品、辦公椅、白板；lane118_shops.py 的共用零件）：四面牆 WALL_<N|W|E|S>_*、隔間牆 WALL_P*（partition＝1）。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lane118_shops as K   # noqa: E402
import linze_upper as LU    # noqa: E402  隔間牆、印刷品、辦公椅、白板、門牌
from lane118_shops import L, B, Mesh, CMesh, bpy, uvquad, img_mat, rot, rbox, ccyl, csph, clathe, plant, water_station, navcheck, chair, auto_ap   # noqa: E402
from PIL import Image, ImageDraw, ImageFont   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUTDIR = os.path.join(L.ROOT, arg('--out-dir', 'assets/models/env/second_ai'))
GEN = K.GEN; PI = math.pi
src = open(os.path.join(L.ROOT, 'src/data/library_layout.js'), encoding='utf-8').read()
LL = json.loads(src[src.index('{', src.index('const LIBRARY_LAYOUT=')):src.rindex('}') + 1])
EL = LL['elevator']
H = 3.2; K.H = H; LU.H = H
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
STAIR = dict(x=-12.0, z=-2.4, w=1.0)            # 西牆的樓梯間門（上 1F）：和大廳一樓西牆的門同一個 z（library_layout.js 的 b1Door；大廳 z −3.2 撞到西牆的窗，門放在 z −2.4 那扇窗的位置）
REGB = {'B1SIGN': (0, 0, 512, 160), 'SCR': (512, 0, 768, 160), 'TV': (768, 0, 1024, 160),
        'STUDY': (0, 160, 512, 256), 'DISC1': (512, 160, 768, 256), 'DISC2': (768, 160, 1024, 256),
        'RULE': (0, 256, 512, 544), 'NOTICE': (512, 256, 1024, 544),
        'COPY': (0, 544, 256, 640), 'SELF': (256, 544, 512, 640), 'RETURN': (512, 544, 768, 640), 'STAIR': (768, 544, 1024, 640),
        'WB1': (0, 640, 512, 896), 'WB2': (512, 640, 1024, 896),
        'PRICE': (0, 896, 256, 1024), 'BOOK1': (256, 896, 384, 1024), 'BOOK2': (384, 896, 512, 1024), 'CARD': (512, 896, 640, 960),
        'LOCK': (640, 896, 768, 960), 'B1SMALL': (512, 960, 768, 1024), 'DIR': (768, 896, 1024, 1024)}


def F(n): return ImageFont.truetype(CJK, n)


def ctext(d, cx, y, t, f, fill):
    w = d.textlength(t, font=f); d.text((cx - w / 2, y), t, font=f, fill=fill)


def make_tex():
    """B1 的印刷品貼圖集（library_b1_print.png）：樓層牌、自習室門牌、討論室門牌、使用規則、公告欄、影印中心、自助借還、還書口、樓梯、白板、價目表、預約表、刷卡機、置物櫃號碼、樓層指引"""
    R = REGB; im = Image.new('RGB', (1024, 1024), '#808080'); d = ImageDraw.Draw(im); rr = random.Random(71)
    x0, y0, x1, y1 = R['B1SIGN']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(58, 62, 66)); d.text((x0 + 26, y0 + 18), 'B1', font=F(112), fill=(240, 240, 236)); d.text((x0 + 190, y0 + 30), '自習室・討論室', font=F(40), fill=(220, 220, 214)); d.text((x0 + 190, y0 + 86), '影印中心・自助借還', font=F(32), fill=(200, 200, 194))
    x0, y0, x1, y1 = R['SCR']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(28, 78, 120)); ctext(d, (x0 + x1) / 2, y0 + 20, '請放上書本', F(30), (255, 255, 255)); ctext(d, (x0 + x1) / 2, y0 + 70, '借書　還書', F(26), (220, 236, 250)); d.rectangle([x0 + 60, y0 + 112, x1 - 60, y0 + 140], fill=(240, 180, 60))
    x0, y0, x1, y1 = R['TV']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(18, 22, 30)); d.rectangle([x0 + 16, y0 + 14, x1 - 16, y1 - 14], fill=(240, 242, 245)); d.rectangle([x0 + 16, y0 + 14, x1 - 16, y0 + 34], fill=(60, 100, 160))
    for k in range(5): d.rectangle([x0 + 30, y0 + 48 + k * 18, x0 + 30 + rr.randint(90, 180), y0 + 54 + k * 18], fill=(150, 150, 150))
    for key, t, col in (('STUDY', '24 小時自習室　請刷學生證', (58, 92, 74)), ('DISC1', '討論室 1', (64, 70, 76)), ('DISC2', '討論室 2', (64, 70, 76))):
        x0, y0, x1, y1 = R[key]; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=col); ctext(d, (x0 + x1) / 2, y0 + 26, t, F(36 if len(t) < 6 else 32), (255, 255, 255))
    x0, y0, x1, y1 = R['RULE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 248, 242)); d.rectangle([x0, y0, x1 - 1, y0 + 64], fill=(58, 92, 74))
    ctext(d, (x0 + x1) / 2, y0 + 12, '自習室使用須知', F(40), (255, 255, 255))
    for k, ln in enumerate(['24 小時開放，請刷學生證進出', '請保持安靜，手機請關靜音', '請勿長時間佔位', '離開時請關檯燈', '飲料請加蓋，不要在座位吃東西']):
        d.text((x0 + 30, y0 + 86 + k * 40), '・' + ln, font=F(28), fill=(50, 50, 46))
    x0, y0, x1, y1 = R['NOTICE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(176, 132, 88))
    for k, (t, col) in enumerate([('期末考週\n自習室延長\n冷氣開放', (250, 250, 250)), ('討論室\n線上預約\n一次兩小時', (210, 232, 246)), ('影印卡\n加值\n請到櫃台', (250, 228, 140)),
                                  ('失物招領\n藍色水壺', (232, 246, 214)), ('考古題讀書會\n招人', (250, 214, 214)), ('請勿佔位\n違者移除物品', (240, 236, 250))]):
        px, py = x0 + 20 + (k % 3) * 164, y0 + 16 + (k // 3) * 138; w, h = 150, 124
        d.rectangle([px, py, px + w, py + h], fill=col); d.ellipse([px + w / 2 - 6, py + 4, px + w / 2 + 6, py + 16], fill=(200, 40, 40))
        for j, ln in enumerate(t.split('\n')): ctext(d, px + w / 2, py + 22 + j * 32, ln, F(22 if len(ln) > 5 else 24), (60, 50, 40))
    for key, t, col in (('COPY', '影印中心', (40, 90, 140)), ('SELF', '自助借還書', (40, 110, 80)), ('RETURN', '還書口', (120, 70, 40)), ('STAIR', '樓梯 ↑ 1F', (58, 92, 74))):
        x0, y0, x1, y1 = R[key]; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=col); ctext(d, (x0 + x1) / 2, y0 + 24, t, F(40), (255, 255, 255))
    for key, lines in (('WB1', ['考古題分工', '1～3 題：誰？', '4～6 題：（空白）', '週六 4 點這裡見']), ('WB2', ['申論題架構', '爭點 → 實務 → 學說', '結論先寫', '（還沒擦乾淨）'])):
        x0, y0, x1, y1 = R[key]; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(248, 250, 250))
        for k, ln in enumerate(lines): d.text((x0 + 26 + rr.randint(-6, 6), y0 + 22 + k * 56), ln, font=F(40 if k == 0 else 32), fill=[(30, 60, 160), (40, 40, 40), (180, 40, 40), (30, 120, 60)][k])
    x0, y0, x1, y1 = R['PRICE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 250, 246)); d.rectangle([x0, y0, x1 - 1, y0 + 26], fill=(40, 90, 140)); ctext(d, (x0 + x1) / 2, y0 + 2, '價目表', F(20), (255, 255, 255))
    for k, ln in enumerate(['黑白 A4　1 元', '彩色 A4　5 元', '掃描　免費', '請用影印卡']): d.text((x0 + 14, y0 + 34 + k * 22), ln, font=F(17), fill=(50, 50, 50))
    for key, n in (('BOOK1', 1), ('BOOK2', 2)):
        x0, y0, x1, y1 = R[key]; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(252, 252, 250)); ctext(d, (x0 + x1) / 2, y0 + 4, f'討論室 {n} 預約', F(15), (40, 40, 40))
        for k in range(6):
            yy = y0 + 28 + k * 16; d.line([x0 + 6, yy, x1 - 6, yy], fill=(190, 190, 190)); d.text((x0 + 8, yy + 1), f'{9 + k * 2}:00', font=F(11), fill=(110, 110, 110))
            if rr.random() < 0.6: d.line([x0 + 50, yy + 8, x0 + 50 + rr.randint(30, 60), yy + 8 + rr.randint(-2, 2)], fill=(40, 40, 120), width=2)
    x0, y0, x1, y1 = R['CARD']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(40, 44, 48)); d.rectangle([x0 + 30, y0 + 12, x1 - 30, y0 + 40], fill=(90, 200, 120)); ctext(d, (x0 + x1) / 2, y0 + 44, '刷卡', F(14), (220, 220, 220))
    x0, y0, x1, y1 = R['LOCK']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(230, 232, 228)); ctext(d, (x0 + x1) / 2, y0 + 16, '置物櫃', F(24), (60, 60, 60))
    x0, y0, x1, y1 = R['B1SMALL']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(58, 62, 66)); ctext(d, (x0 + x1) / 2, y0 + 12, 'B1', F(40), (240, 240, 236))
    x0, y0, x1, y1 = R['DIR']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(58, 62, 66))
    for k, ln in enumerate(['↑ 24 小時自習室', '→ 討論室 1・2', '→ 影印中心', '→ 自助借還・電梯']): d.text((x0 + 12, y0 + 10 + k * 28), ln, font=F(18), fill=(235, 235, 230))
    im.save(os.path.join(GEN, 'library_b1_print.png'))


class B1(K.Shop):
    """B1 一層的建造狀態（沿用 Shop 的累積網格、配置；不跑 Shop.__init__）"""
    def __init__(self):
        self.sid = 'library_b1'; self.T = {'name': '總圖書館 B1', 'sub': 'B1 自習室・討論室'}; LU.CUR['reg'] = REGB
        self.S = dict(trim='#5a5f63', wainH=0.12); self.FD = {}
        self.W, self.D = 24.0, 18.0; self.X0, self.X1, self.Z0, self.Z1 = -12.0, 12.0, -9.0, 9.0
        self.rng = random.Random(2001); self.extra = {}
        B.reset(texres=512)
        self.root = B.group(self.sid, props={'kind': 'library_b1', 'layout': f'{self.sid}.layout.json'})
        self.blocks, self.seats, self.inter = [], [], []; self.clerk = self.order = self.counter = None
        self.M = M = {
            'floor': L.pbr(f'{self.sid}_floor', 'large_floor_tiles_02', tile=0.8, target='#d2d0ca', contrast=0.45, normal=0.25, maps=('diff', 'nor'), res=512, rough_value=0.22),
            'wall': L.pbr(f'{self.sid}_wall', 'painted_plaster_wall', tile=2.0, target='#ecebe6', contrast=0.3, normal=0.1, maps=('diff', 'nor'), res=256, rough_value=0.85),
            'wain': L.pbr(f'{self.sid}_granite', 'granite_tile_03', tile=1.2, target='#7d7a76', contrast=0.8, normal=0.3, maps=('diff', 'nor'), res=256, rough_value=0.3),
            'wood': L.pbr(f'{self.sid}_wood', 'wood_table_001', tile=0.9, target='#b0824c', contrast=0.8, normal=0.25, maps=('diff', 'nor'), res=256, rough_value=0.4),
            'vc': L.vc_material(f'{self.sid}_vc', rough=0.6), 'vcm': L.vc_metal(f'{self.sid}_vcmetal', rough=0.32, metal=0.4),
            'steel': L.flat('l118_steel', '#b9bec2', rough=0.28, metal=0.45),
            'glass': L.flat('l118_glass', '#dfe9ec', rough=0.05, alpha=0.16),
            'frost': L.flat(f'{self.sid}_frost', '#f2f4f4', rough=0.4, alpha=0.62),
            'tube': L.flat('GLOW_l118_tube', '#ffffff', rough=0.3, emit=B.srgb('#f2f6ff')),
            'warm': L.flat('GLOW_l118_warm', '#ffe7c2', rough=0.4, emit=B.srgb('#ffc77a')),
            'fridge': L.flat('GLOW_l118_fridge', '#f4f8ff', rough=0.3, emit=B.srgb('#cfe0f4')),
            'shade': L.flat(f'{self.sid}_lampshade', '#1f6b3c', rough=0.25, metal=0.1),
            'ceil': L.pbr(f'{self.sid}_ceiling', 'ceiling_interior', tile=1.2, target='#eeeeea', contrast=0.6, normal=0.2, maps=('diff', 'nor'), res=256, rough_value=0.9, cull=True),
            'print': img_mat(f'{self.sid}_print', 'library_b1_print.png', rough=0.55),
            'screen': img_mat(f'GLOW_{self.sid}_screens', 'library_b1_print.png', rough=0.3, emit=0.9),
        }
        self.vc = CMesh(f'{self.sid}_props', M['vc']); self.vm = CMesh(f'{self.sid}_metal', M['vcm'])
        self.wood = Mesh(f'{self.sid}_woodparts', M['wood']); self.steel = Mesh(f'{self.sid}_steel', M['steel'])
        self.tube = Mesh(f'{self.sid}_tubes', M['tube']); self.warm = Mesh(f'{self.sid}_warm', M['warm']); self.fridgel = Mesh(f'{self.sid}_fridgelight', M['fridge'])
        self.shade = Mesh(f'{self.sid}_lampshades', M['shade'])
        self.prt = Mesh(f'{self.sid}_prints', M['print']); self.scr = Mesh(f'{self.sid}_screens', M['screen'])
        self.WG = {k: {} for k in 'NWES'}; self.WGP = {}; self.PDIR = {}; self.lay_extra = {}
        self.labtube = Mesh('LAB_unused', M['tube'])


def glass_wall(c, key, axis, at, a0, a1, gaps=(), dir_=(0, 0, 1), post=1.5):
    """玻璃隔間（鋁框、中間一條霧面帶）：WALL_<key>_glass／frost 是半透明（遊戲：窗的零件，牆淡出時一起藏），框是 trim。
    gaps＝門洞（門框＋門楣）；玻璃門片開著（推到旁邊的玻璃後面），導航只擋玻璃那幾段"""
    c.WG.setdefault(key, {}); c.PDIR[key] = list(dir_); c.WGP[key] = {'partition': 1}
    gl = c.wg(key, 'glass', c.M['glass']); fr = c.wg(key, 'trim', c.M['vcm'], cm=True); fs = c.wg(key, 'frost', c.M['frost'])
    def Q(m, b0, b1, y0, y1, off=0.0):
        if axis == 'x': m.quad([(b0, y0, at + off), (b1, y0, at + off), (b1, y1, at + off), (b0, y1, at + off)]); m.quad([(b1, y0, at + off), (b0, y0, at + off), (b0, y1, at + off), (b1, y1, at + off)])
        else: m.quad([(at + off, y0, b1), (at + off, y0, b0), (at + off, y1, b0), (at + off, y1, b1)]); m.quad([(at + off, y0, b0), (at + off, y0, b1), (at + off, y1, b1), (at + off, y1, b0)])
    def BX(b0, b1, y0, y1, th=0.03, col='#b4b9bd'):
        if axis == 'x': fr.cbox(b0, b1, y0, y1, at - th, at + th, col)
        else: fr.cbox(at - th, at + th, y0, y1, b0, b1, col)
    cuts = [a0] + [v for g in sorted(gaps) for v in g] + [a1]
    for k in range(0, len(cuts), 2):
        b0, b1 = cuts[k], cuts[k + 1]
        if b1 - b0 < 1e-3: continue
        Q(gl, b0, b1, 0.1, 1.05); Q(gl, b0, b1, 1.4, 2.6); Q(fs, b0, b1, 1.05, 1.4, 0.004)
        BX(b0, b1, 0.0, 0.1, th=0.04, col='#8a8f93'); BX(b0, b1, 2.6, 2.68); BX(b0, b1, 1.03, 1.05, th=0.025); BX(b0, b1, 1.4, 1.42, th=0.025)
        n = max(1, int(round((b1 - b0) / post)))
        for j in range(n + 1): b = b0 + (b1 - b0) * j / n; BX(b - 0.025, b + 0.025, 0.0, 2.68)
        if axis == 'x': c.block(b0, b1, at - 0.05, at + 0.05, 'glass_partition')
        else: c.block(at - 0.05, at + 0.05, b0, b1, 'glass_partition')
    wl = c.wg(key, 'wall', c.M['wall'])
    for (g0, g1) in gaps: (wl.box(g0, g1, 2.68, H, at - 0.05, at + 0.05) if axis == 'x' else wl.box(at - 0.05, at + 0.05, 2.68, H, g0, g1)); BX(g0 - 0.04, g1 + 0.04, 2.6, 2.68, th=0.04, col='#8a8f93')
    top = [(a0, a1)]   # 玻璃上面到天花板的實牆（2.68～3.2 m）
    for (b0, b1) in top:
        segs = [b0] + [v for g in sorted(gaps) for v in g] + [b1]
        for k in range(0, len(segs), 2): (wl.box(segs[k], segs[k + 1], 2.68, H, at - 0.05, at + 0.05) if axis == 'x' else wl.box(at - 0.05, at + 0.05, 2.68, H, segs[k], segs[k + 1]))


def banker_lamp(c, x, z, s):
    """綠色銀行燈（ntu_lib_b1 的樣子）：黃銅底座、桿、沿 x 的綠色半圓燈罩（兩端封口），燈罩下面亮的一條；s＝坐的人在哪一側（±1，燈罩往那邊偏 3 cm）"""
    ccyl(c.vm, (x, 0.75, z), (x, 0.765, z), 0.06, '#b08a3a', seg=10)
    ccyl(c.vm, (x, 0.765, z), (x, 0.99, z), 0.008, '#b08a3a', seg=6)
    zc, y0, r, n = z + s * 0.03, 0.99, 0.06, 8
    arc = [(r * math.cos(PI * k / n), r * math.sin(PI * k / n)) for k in range(n + 1)]      # 上半圓（z 方向的偏移, y）
    for (u0, v0), (u1, v1) in zip(arc, arc[1:]):
        c.shade.quad([(x - 0.14, y0 + v0, zc + u0), (x + 0.14, y0 + v0, zc + u0), (x + 0.14, y0 + v1, zc + u1), (x - 0.14, y0 + v1, zc + u1)])
        c.shade.quad([(x - 0.14, y0 + v1, zc + u1), (x + 0.14, y0 + v1, zc + u1), (x + 0.14, y0 + v0, zc + u0), (x - 0.14, y0 + v0, zc + u0)])   # 裡面（雙面）
    for xe in (x - 0.14, x + 0.14): c.shade.quad([(xe, y0 + v, zc + u) for (u, v) in arc]); c.shade.quad([(xe, y0 + v, zc + u) for (u, v) in reversed(arc)])
    c.warm.box(x - 0.13, x + 0.13, y0 + 0.004, y0 + 0.008, zc - r + 0.01, zc + r - 0.01)


def study_chair(c, x, z, yaw):
    """自習室的木椅（紅椅墊；ntu_lib_b1 的樣子）"""
    chair(c, x, z, yaw, 'wood', '#a8743e'); T = rot(x, z, yaw); rbox(c.vc, T, -0.19, 0.19, 0.45, 0.47, -0.18, 0.18, '#8a2a24', r=0.01, seg=1)


def long_desk(c, x0, x1, zc, depth, sides, seats_x):
    """長桌（淺木紋桌面、木頭側板）：sides＝'-z'／'+z'（坐哪一邊）；每個位子一盞綠色檯燈、座位之間一塊矮隔板；
    雙面的中間一塊木隔板（35 cm 高）、單面的檯燈靠牆那一側。ntu_lib_b1 的樣子"""
    z0, z1 = zc - depth / 2, zc + depth / 2; dbl = len(sides) == 2
    c.wood.rbox(x0, x1, 0.72, 0.75, z0, z1, r=0.006, seg=1)
    for xx in (x0 + 0.04, (x0 + x1) / 2 - 0.02, x1 - 0.08): c.wood.box(xx, xx + 0.04, 0.0, 0.72, z0 + 0.04, z1 - 0.04)
    if dbl: c.wood.box(x0 + 0.08, x1 - 0.08, 0.35, 0.7, zc - 0.015, zc + 0.015); c.wood.rbox(x0, x1, 0.75, 1.1, zc - 0.015, zc + 0.015, r=0.004, seg=1)
    else:
        s0 = 1 if sides[0] == '+z' else -1; zb = zc - s0 * (depth / 2 - 0.04); c.wood.box(x0 + 0.08, x1 - 0.08, 0.35, 0.7, zb - 0.015, zb + 0.015)
    c.block(x0 - 0.02, x1 + 0.02, z0 - 0.02, z1 + 0.02, 'study_desk')
    for sd in sides:
        s = -1 if sd == '-z' else 1; zs = zc + s * (depth / 2 + 0.48); yaw = 0.0 if s < 0 else PI
        zl = zc + s * 0.14 if dbl else zc - s * (depth / 2 - 0.13)
        for k, xx in enumerate(seats_x):
            study_chair(c, xx, zs, yaw); c.seat(xx, zs, yaw, (xx, zc), 'study', ap=(xx, zs + s * 0.55), label='坐下（自習）')
            banker_lamp(c, xx + 0.3, zl, s)
            if k:   # 座位之間的矮隔板（雙面：中間到這一側的桌緣；單面：整個桌深）
                xm = (seats_x[k - 1] + xx) / 2; za, zb_ = (zc, z1 - 0.03) if (dbl and s > 0) else ((z0 + 0.03, zc) if dbl else (z0 + 0.03, z1 - 0.03))
                c.wood.box(xm - 0.015, xm + 0.015, 0.75, 1.02, za, zb_)
            if c.rng.random() < 0.35:   # 有人留著的書、筆記（佔位）
                T = rot(xx - 0.08, zc + s * (depth / 2 - 0.22), yaw); rbox(c.vc, T, -0.12, 0.12, 0.75, 0.79, -0.16, 0.16, c.rng.choice(['#7a2a2a', '#2a4a6a', '#e8dcc0', '#3a5a3a']))


def disc_room(c, cx, wbkey, tvside):
    """討論室：六人桌（灰色桌面）、六張辦公椅、南牆白板、側邊隔間牆上的電視（tvside＝'P7' 西側／'P6' 東側）、植物"""
    zc = 4.4
    c.vc.crbox(cx - 0.62, cx + 0.62, 0.72, 0.75, zc - 1.3, zc + 1.3, '#cfcac0', r=0.006, seg=1)
    for (lx, lz) in ((-0.55, -1.2), (0.55, -1.2), (-0.55, 1.2), (0.55, 1.2)): c.vm.cbox(cx + lx - 0.025, cx + lx + 0.025, 0.0, 0.72, zc + lz - 0.025, zc + lz + 0.025, '#3a3f45')
    c.block(cx - 0.64, cx + 0.64, zc - 1.32, zc + 1.32, 'disc_table')
    for s in (-1, 1):
        for dz in (-0.85, 0.0, 0.85):
            x = cx + s * 1.08; yaw = PI / 2 if s < 0 else -PI / 2
            LU.task_chair(c, x, zc + dz, yaw, '#2e3440'); c.seat(x, zc + dz, yaw, (cx, zc), 'study', ap=(cx + s * 1.65, zc + dz), label='坐下')
    T = rot(cx + 0.25, zc - 0.6, 0.0); rbox(c.vc, T, -0.15, 0.15, 0.75, 0.77, -0.11, 0.11, '#e8e4dc'); rbox(c.vc, T, -0.15, 0.15, 0.77, 0.80, -0.11, 0.11, '#2a4a6a')   # 桌上的講義、書
    ccyl(c.vc, (cx - 0.3, 0.75, zc + 0.5), (cx - 0.3, 0.97, zc + 0.5), 0.035, '#8fa89a', seg=10)
    tr = c.wg('S', 'trim', c.M['vc'], cm=True); pr = c.wg('S', 'print', c.M['print'])   # 南牆的白板（跟著南牆淡出）
    tr.cbox(cx - 1.23, cx + 1.23, 0.845, 2.105, 9.0 - 0.03, 9.0, '#c9ced2'); LU.tquad(pr, cx, 1.475, 9.0 - 0.032, (0, -1), 2.4, 1.2, wbkey)
    tr.cbox(cx - 1.2, cx + 1.2, 0.81, 0.845, 9.0 - 0.09, 9.0, '#9aa0a4')
    side = c.wg(tvside, 'trim', c.M['vc'], cm=True); sc = c.wg(tvside, 'screen', c.M['screen'])   # 側邊隔間牆上的電視（跟著那一面隔間牆淡出）
    xw = cx - 2.45 if tvside == 'P7' else cx + 2.45; n = (1, 0) if tvside == 'P7' else (-1, 0)
    side.cbox(*sorted((xw, xw + n[0] * 0.05)), 1.27, 1.93, zc - 0.56, zc + 0.56, '#1a1a1a'); LU.tquad(sc, xw + n[0] * 0.052, 1.6, zc, n, 1.04, 0.62, 'TV')
    plant(c, cx + 2.0, 8.3, 1.1)


def build(c):
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M
    # ---- 地板、天花板、四面牆（地下室：沒有窗）；西牆樓梯間的門
    fl = Mesh(f'{c.sid}_floorm', M['floor'], tile=0.8); fl.box(X0, X1, -0.05, 0.0, Z0, Z1); fl.finish(c.root)
    ce = Mesh(f'{c.sid}_ceiling', M['ceil'], tile=1.2); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(c.root)
    for k in 'NSE':
        wl = c.wg(k, 'wall', M['wall']); wn = c.wg(k, 'wain', M['wain'])
        if k == 'N': wl.quad([(X0, 0.12, Z0), (X1, 0.12, Z0), (X1, H, Z0), (X0, H, Z0)]); wn.quad([(X0, 0.0, Z0), (X1, 0.0, Z0), (X1, 0.12, Z0), (X0, 0.12, Z0)])
        elif k == 'S': wl.quad([(X1, 0.12, Z1), (X0, 0.12, Z1), (X0, H, Z1), (X1, H, Z1)]); wn.quad([(X1, 0.0, Z1), (X0, 0.0, Z1), (X0, 0.12, Z1), (X1, 0.12, Z1)])
        else: wl.quad([(X1, 0.12, Z0), (X1, 0.12, Z1), (X1, H, Z1), (X1, H, Z0)]); wn.quad([(X1, 0.0, Z0), (X1, 0.0, Z1), (X1, 0.12, Z1), (X1, 0.12, Z0)])
    wl = c.wg('W', 'wall', M['wall']); wn = c.wg('W', 'wain', M['wain']); tr = c.wg('W', 'trim', M['vc'], cm=True); dm = c.wg('W', 'doormetal', M['vcm'], cm=True)
    a, b = STAIR['z'] - STAIR['w'] / 2, STAIR['z'] + STAIR['w'] / 2
    for (za, zb) in ((Z0, a - 0.08), (b + 0.08, Z1)): wl.quad([(X0, 0.12, zb), (X0, 0.12, za), (X0, H, za), (X0, H, zb)]); wn.quad([(X0, 0.0, zb), (X0, 0.0, za), (X0, 0.12, za), (X0, 0.12, zb)])
    wl.quad([(X0, 2.2, b + 0.08), (X0, 2.2, a - 0.08), (X0, H, a - 0.08), (X0, H, b + 0.08)])
    for (za, zb) in ((a - 0.08, a), (b, b + 0.08)): tr.cbox(X0, X0 + 0.06, 0.0, 2.2, za, zb, '#5a5f63')
    tr.cbox(X0, X0 + 0.06, 2.12, 2.2, a - 0.08, b + 0.08, '#5a5f63')
    dm.cbox(X0 - 0.04, X0, 0.0, 2.13, a - 0.02, b + 0.02, '#6a7078')   # 門片比門洞大一點、退在門框後面（沒有縫：Cycles 的天光會從縫漏進來在地板畫一條白線）; dm.cbox(X0, X0 + 0.05, 1.0, 1.04, a + 0.1, a + 0.5, '#c9ced2')
    uvquad(c.wg('W', 'print', M['print']), [(X0 + 0.016, 1.72, b + 0.68), (X0 + 0.016, 1.72, b + 0.14), (X0 + 0.016, 1.92, b + 0.14), (X0 + 0.016, 1.92, b + 0.68)], LU.uv('STAIR'))
    c.look('stairs', X0 + 0.6, STAIR['z'], 0.7, '走樓梯上 1F', dev='src/library_b1_3d.js：換到 library_hall 一樓西牆的樓梯間門前（library_layout.js b1Door.spawn）')
    # ---- 電梯井（和大廳同一個位置，門朝北）
    ex0, ex1, ez0, ez1 = EL['x0'], EL['x1'], EL['z0'], EL['z1']
    c.vc.cbox(ex0 - 0.15, ex1 + 0.15, 0.0, H, ez0, ez1 + 0.15, '#d6d2c9')
    dx0, dx1 = EL['doorX0'], EL['doorX1']; c.steel.box(dx0, (dx0 + dx1) / 2 - 0.005, 0.0, 2.1, ez0 - 0.02, ez0); c.steel.box((dx0 + dx1) / 2 + 0.005, dx1, 0.0, 2.1, ez0 - 0.02, ez0)
    c.vm.cbox(dx0 - 0.08, dx1 + 0.08, 2.1, 2.18, ez0 - 0.03, ez0, '#9aa0a4'); c.vm.cbox(dx0 - 0.08, dx0, 0.0, 2.1, ez0 - 0.03, ez0, '#9aa0a4'); c.vm.cbox(dx1, dx1 + 0.08, 0.0, 2.1, ez0 - 0.03, ez0, '#9aa0a4')
    c.vm.cbox(dx1 + 0.18, dx1 + 0.3, 1.0, 1.28, ez0 - 0.015, ez0, '#c9ced2'); c.fridgel.box(dx1 + 0.21, dx1 + 0.27, 1.06, 1.1, ez0 - 0.02, ez0 - 0.015)
    uvquad(c.prt, [(dx1 + 0.2, 2.3, ez0 - 0.005), (dx0 - 0.2, 2.3, ez0 - 0.005), (dx0 - 0.2, 2.68, ez0 - 0.005), (dx1 + 0.2, 2.68, ez0 - 0.005)], LU.uv('B1SIGN'))
    c.block(ex0 - 0.17, ex1 + 0.17, ez0 - 0.05, ez1 + 0.17, 'elevator_core')
    c.look('elevator', round((dx0 + dx1) / 2, 3), round(ez0 - 0.7, 3), 0.8, '電梯', '電梯門旁邊貼著：「B1 停靠限館員刷卡，讀者請走西側樓梯。」', dev='暫定的字；LAWWW-B 10-23：這一版電梯不停 B1（選 A）')
    # ---- 隔間：自習室（北）玻璃牆、西牆、東牆；討論室玻璃牆、中間、東牆；門廳和討論室 1 之間
    SX0, SX1, SZ = -7.0, 7.4, -1.2
    glass_wall(c, 'P1', 'x', SZ, SX0 + 0.05, SX1 - 0.05, gaps=[(-5.6, -4.4)], dir_=(0, 0, 1))
    LU.partition(c, 'P2', 'z', SX0, Z0, SZ + 0.05, dir_=(-1, 0, 0))
    LU.partition(c, 'P3', 'z', SX1, Z0, SZ + 0.05, dir_=(1, 0, 0))
    glass_wall(c, 'P4', 'x', 1.2, SX0 + 0.05, 2.95, gaps=[(-3.6, -2.4), (1.4, 2.6)], dir_=(0, 0, -1))
    LU.partition(c, 'P5', 'z', -2.0, 1.25, Z1, dir_=(-1, 0, 0))
    LU.partition(c, 'P6', 'z', 3.0, 1.15, Z1, dir_=(1, 0, 0))
    LU.partition(c, 'P7', 'z', SX0, 1.15, Z1, dir_=(-1, 0, 0))
    # 門牌：自習室（玻璃門旁邊、走廊那一面）、討論室 1、2（門楣上面）；刷卡機
    pr1 = c.wg('P1', 'print', M['print']); LU.tquad(pr1, -3.2, 2.93, SZ + 0.056, (0, 1), 2.2, 0.41, 'STUDY')
    c.vm.cbox(-4.3, -4.18, 1.0, 1.3, SZ + 0.03, SZ + 0.08, '#2b2f33'); LU.tquad(pr1, -4.24, 1.2, SZ + 0.081, (0, 1), 0.1, 0.05, 'CARD')
    pr4 = c.wg('P4', 'print', M['print'])
    for (gx, key, bk) in ((-3.0, 'DISC1', 'BOOK1'), (2.0, 'DISC2', 'BOOK2')):
        LU.tquad(pr4, gx, 2.9, 1.2 - 0.06, (0, -1), 1.0, 0.37, key); LU.tquad(pr4, gx - 1.0, 1.55, 1.2 - 0.035, (0, -1), 0.24, 0.24, bk)
    c.look('study_door', -5.0, -0.4, 0.8, '24 小時自習室', '玻璃門旁邊有一台刷卡機。門上貼著：「24 小時開放，請刷學生證進出。」', dev='暫定的字；刷卡進出由 LAWWW 接（AA_399 第 2 節）')
    c.look('disc1', -3.0, 0.4, 0.8, '討論室 1', '玻璃門上貼著這一週的預約表，週六下午那一格寫滿了。', dev='暫定的字；柏翰的考古題小組在這間（AA_399 第 2 節）')
    c.look('disc2', 2.0, 0.4, 0.8, '討論室 2', '玻璃門上貼著這一週的預約表。', dev='暫定的字；國考讀書會在這間（AA_399 第 2 節）')
    # ---- 24 小時自習室：靠北牆一排單面、中間一排雙面
    long_desk(c, -6.6, 7.0, -8.6, 0.7, ('+z',), [-6.0 + 1.4 * k for k in range(10)])
    long_desk(c, -5.2, 6.4, -4.0, 1.4, ('-z', '+z'), [-4.6 + 1.3 * k for k in range(9)])
    LU.board(c, 'P2', 'z', SX0, (1, 0), -7.2, -5.8, 1.25, 1.95, 'RULE', frame='#3a5c4a')
    K.ac_unit(c, -1.0, 2.75, Z0, '+z', w=1.0, fade=True)
    # ---- 西邊門廳：置物櫃、公告欄、飲水機、樓層指引、長椅
    for k in range(4):
        z0 = 1.6 + k * 1.2; c.vc.cbox(X0, X0 + 0.45, 0.0, 1.9, z0, z0 + 1.15, '#d6d8d4')
        for r in range(4):
            for q in range(2):
                y = 0.08 + r * 0.45; zz = z0 + 0.04 + q * 0.55; c.vc.cbox(X0 + 0.45, X0 + 0.46, y, y + 0.42, zz, zz + 0.52, '#c4c8c4'); c.vm.cbox(X0 + 0.46, X0 + 0.475, y + 0.2, y + 0.24, zz + 0.42, zz + 0.47, '#5a5f63')
    c.block(X0, X0 + 0.48, 1.58, 6.42, 'lockers'); c.look('lockers', X0 + 1.1, 4.0, 0.9, '置物櫃', '投幣式的置物櫃，一半以上鎖著。', dev='暫定的字')
    K.frame_board(c, 'W', -7.7, -5.5, 1.0, 2.2, '#6a4a30'); LU.pq(c, 'W', -7.7, -5.5, 1.0, 2.2, 'NOTICE', inset=0.014)
    c.look('notice', X0 + 0.9, -6.4, 0.9, '公告欄', '公告欄：期末考週自習室延長開放、討論室線上預約、影印卡加值。角落一張手寫的：「考古題讀書會招人」。', dev='暫定的字，AA 可以改')
    water_station(c, -9.6, Z0 + 0.3, face='+z')
    # 樓梯間出來正對面（自習室西牆的門廳那一面）：大的 B1 樓層牌、樓層指引
    LU.board(c, 'P2', 'z', SX0, (-1, 0), -6.6, -4.0, 1.75, 2.55, 'B1SIGN', frame='#3a3f45')
    LU.board(c, 'P2', 'z', SX0, (-1, 0), -3.5, -2.5, 1.35, 1.85, 'DIR', frame='#3a3f45')
    for (za, zb, col) in ((4.4, 5.4, '#c8322a'), (5.5, 6.5, '#2f6fb0')): LU.vend_x(c, SX0 - 0.05, za, zb, col)   # 討論室 1 西牆的門廳那一面：兩台飲料販賣機（自習室不能吃東西，飲料可以）
    c.wood.rbox(-9.4, -8.0, 0.43, 0.47, 6.6, 7.0, r=0.01, seg=2)
    for lx in (-9.3, -8.1): c.vm.cbox(lx - 0.025, lx + 0.025, 0.0, 0.43, 6.62, 6.98, '#5a5f63')
    c.block(-9.42, -7.98, 6.58, 7.02, 'bench')
    for k in (-0.35, 0.35): c.seat(-8.7 + k, 6.8, PI, (-8.7 + k, 6.2), 'sit', label='坐在長椅')
    plant(c, -11.4, 8.4, 1.2); plant(c, -7.6, -8.4, 1.1)
    # ---- 電梯前：自助借還書機兩台、還書口
    for kx in (8.4, 10.4):
        c.vc.crbox(kx - 0.3, kx + 0.3, 0.0, 1.0, Z0 + 0.15, Z0 + 0.65, '#e4e4e0', r=0.02, seg=1)
        c.vc.cbox(kx - 0.26, kx + 0.26, 1.0, 1.06, Z0 + 0.2, Z0 + 0.6, '#cfcfcb')
        c.vc.cbox(kx - 0.24, kx + 0.24, 1.06, 1.42, Z0 + 0.3, Z0 + 0.34, '#2b2b2b'); LU.tquad(c.scr, kx, 1.24, Z0 + 0.342, (0, 1), 0.44, 0.32, 'SCR')
        c.block(kx - 0.32, kx + 0.32, Z0, Z0 + 0.67, 'kiosk')
    uvquad(c.wg('N', 'print', M['print']), [(8.8, 1.95, Z0 + 0.016), (10.0, 1.95, Z0 + 0.016), (10.0, 2.4, Z0 + 0.016), (8.8, 2.4, Z0 + 0.016)], LU.uv('SELF'))
    c.look('selfcheck', 9.4, Z0 + 1.3, 1.0, '自助借還書機', '把書放上去就能借、能還。螢幕上寫著：「請放上書本」。', dev='LAWWW 接：AA_399 3-2 的借書、還書也可以在這裡（G.loans）')
    c.wg('E', 'trim', M['vc'], cm=True).cbox(X1 - 0.04, X1, 0.9, 1.15, -6.4, -5.6, '#3a3f45'); c.wg('E', 'trim', M['vc'], cm=True).cbox(X1 - 0.05, X1, 0.98, 1.06, -6.3, -5.7, '#111111')
    uvquad(c.wg('E', 'print', M['print']), [(X1 - 0.016, 1.25, -6.4), (X1 - 0.016, 1.25, -5.6), (X1 - 0.016, 1.55, -5.6), (X1 - 0.016, 1.55, -6.4)], LU.uv('RETURN'))
    c.look('return_slot', X1 - 0.8, -6.0, 0.8, '還書口', '牆上的還書口，下面接著一個推車。', dev='LAWWW 接：還書（AA_399 3-2）')
    # ---- 討論室 1、2
    disc_room(c, -4.5, 'WB1', 'P7'); disc_room(c, 0.5, 'WB2', 'P6')
    c.look('wb1', -4.5, 7.6, 0.9, '白板', '白板上寫著「考古題分工」，後面幾格還空著。', dev='暫定的字')
    c.look('wb2', 0.5, 7.6, 0.9, '白板', '白板上留著上一組寫的申論題架構，沒擦乾淨。', dev='暫定的字')
    # ---- 影印中心（東南）：櫃台、三台影印機、列印站、紙箱、價目表
    K.counter(c, 5.0, 10.6, 6.6, 7.2, h=1.0, top='wood', front='#d9d6cf', why='copy_counter')
    for x0 in (4.0, 5.5, 7.0): LU.copier(c, x0, x0 + 0.9, 3.4, 4.03)
    c.vc.crbox(10.4, 11.0, 0.0, 1.2, 2.6, 3.1, '#e4e4e0', r=0.02, seg=1); c.vc.cbox(10.42, 10.98, 1.2, 1.5, 2.6, 2.64, '#2b2b2b'); LU.tquad(c.scr, 10.7, 1.35, 2.598, (0, -1), 0.5, 0.31, 'SCR'); c.block(10.38, 11.02, 2.58, 3.12, 'print_kiosk')
    for k in range(3): c.vc.cbox(11.0, 11.8, 0.0 + k * 0.28, 0.27 + k * 0.28, 7.6, 8.6, '#d8cfb8')
    c.block(10.98, 11.82, 7.58, 8.62, 'paper')
    uvquad(c.wg('S', 'print', M['print']), [(9.6, 1.55, Z1 - 0.016), (8.6, 1.55, Z1 - 0.016), (8.6, 2.05, Z1 - 0.016), (9.6, 2.05, Z1 - 0.016)], LU.uv('PRICE'))
    uvquad(c.wg('S', 'print', M['print']), [(7.6, 2.25, Z1 - 0.016), (6.4, 2.25, Z1 - 0.016), (6.4, 2.7, Z1 - 0.016), (7.6, 2.7, Z1 - 0.016)], LU.uv('COPY'))
    c.look('copy', 7.8, 6.0, 0.9, '影印中心', '櫃台後面貼著價目表：黑白一張一元。影印卡在這裡加值。', dev='暫定的字')
    c.look('copier', 5.95, 2.8, 0.9, '影印機', '影印機旁邊貼著：「卡紙請找櫃台，不要硬拉。」', dev='暫定的字')
    plant(c, 3.6, 8.4, 1.1)
    # ---- 日光燈（整個天花板，避開隔間牆）
    LT = [(x, z) for x in (-10.0, -8.0) for z in (-7.0, -4.0, -1.0, 2.0, 5.0, 8.0)]
    LT += [(x, z) for x in (-5.0, -2.0, 1.0, 4.0) for z in (-7.5, -5.5, -3.0)] + [(6.0, -7.5), (6.0, -5.5), (6.0, -3.0)]
    LT += [(x, 0.0) for x in (-5.0, -1.0, 3.0, 7.0)] + [(8.6, -7.0), (10.6, -7.0), (8.6, -4.6), (10.6, -4.6)]
    LT += [(x, z) for x in (-4.5, 0.5) for z in (3.0, 6.0)] + [(x, z) for x in (5.0, 8.0, 10.8) for z in (3.0, 6.0, 8.3)]
    for (x, z) in LT:
        c.vc.cbox(x - 0.62, x + 0.62, H - 0.02, H, z - 0.32, z + 0.32, '#f4f4f1'); c.tube.box(x - 0.58, x + 0.58, H - 0.026, H - 0.02, z - 0.28, z + 0.28)
    # ---- 出入口、配置的其他欄位
    c.spawn = dict(x=round(X0 + 1.5, 3), z=STAIR['z'], yaw=round(PI / 2, 4), note='從樓梯間進來，面向東；離樓梯間的門 1.5 m')
    c.spawn_el = dict(x=round((dx0 + dx1) / 2, 3), z=round(ez0 - 1.7, 3), yaw=PI, note='出電梯，面向北（如果電梯停 B1）')
    c.exits = []
    c.lay_extra = dict(
        rooms=[dict(id='study24', label='24 小時自習室', x0=SX0, x1=SX1, z0=Z0, z1=SZ, door=dict(x=-5.0, z=SZ, w=1.2, open=True, card=True)),
               dict(id='disc1', label='討論室 1', x0=SX0, x1=-2.0, z0=1.2, z1=Z1, door=dict(x=-3.0, z=1.2, w=1.2, open=True)),
               dict(id='disc2', label='討論室 2', x0=-2.0, x1=3.0, z0=1.2, z1=Z1, door=dict(x=2.0, z=1.2, w=1.2, open=True)),
               dict(id='copy', label='影印中心', x0=3.0, x1=X1, z0=1.2, z1=Z1),
               dict(id='lobby', label='門廳', x0=X0, x1=SX0, z0=Z0, z1=Z1)],
        spots=dict(copy_clerk=dict(x=7.8, z=8.0, yaw=PI, note='影印中心櫃台後面的工讀生（面向北、對著櫃台）'),
                   disc1_head=dict(x=-4.5, z=6.4, yaw=PI, note='討論室 1：白板和桌子中間、面向桌子（柏翰講考古題；AA_399 第 2 節）'),
                   disc1_door=dict(x=-3.0, z=2.0, yaw=0.0, note='討論室 1：剛進門、面向南（看到桌邊的人）'),
                   disc2_head=dict(x=0.5, z=6.4, yaw=PI, note='討論室 2：白板和桌子中間、面向桌子（國考讀書會）'),
                   disc2_door=dict(x=2.0, z=2.0, yaw=0.0, note='討論室 2：剛進門、面向南'),
                   study_door=dict(x=-5.0, z=-1.9, yaw=PI, note='24 小時自習室：刷卡進門、面向北（看到整間）'),
                   study_night=dict(x=-0.7, z=-2.82, yaw=PI, note='自習室中間那排南側的一個座位（期末前的夜，偶遇柏翰；AA_399 第 2 節）＝seats 裡同一個位子（kind study）：要讓 NPC 坐就用那個 seat'),
                   selfcheck=dict(x=9.4, z=-7.7, yaw=PI, note='自助借還書機前、面向北（interact id selfcheck）'),
                   stairs_door=dict(x=-10.5, z=-2.4, yaw=PI / 2, note='樓梯間的門前 1.5 m、面向東（＝spawn；從 1F 走樓梯下來站在這裡）')),
        nodes={'GLOW_l118_warm': '綠色檯燈燈罩下面亮的那一片（整層一個網格）'})


def finish(c):
    D = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}
    for k, ms in c.WG.items():
        for key, m in ms.items():
            uv = key in ('wall', 'wain', 'door'); mg = key not in ('print', 'screen', 'view', 'glass', 'frost')
            m.finish(c.root, props=dict({'dir': D.get(k) or c.PDIR[k]}, **c.WGP.get(k, {})), uv=uv, merge=mg)
    for m in (c.vc, c.vm, c.tube, c.warm, c.fridgel, c.steel, c.shade): m.finish(c.root, uv=False)
    c.wood.finish(c.root)
    for m in (c.prt, c.scr): m.finish(c.root, uv=False, merge=False)
    for m in c.extra.values(): m.finish(c.root, uv=False)
    L.merge_by_material(c.root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: '')
    out = os.path.join(OUTDIR, f'{c.sid}.glb'); st = L.export(out, gpu_instances=False)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    lay = dict(version=1, zone=c.sid, name=c.T['name'], label=c.T['sub'], src='使用者 D46、10-23；AA_399 第 2 節（AA-B）；CLOSED-SPACES-1023（LAWWW2-B）',
               bounds=dict(x0=c.X0, x1=c.X1, z0=c.Z0, z1=c.Z1), h=H, cam_dist=4.6, coords='和 library_layout.js 同一套（x、z），B1 地板 y＝0',
               spawn=c.spawn, spawn_elevator=c.spawn_el, stairs=dict(door=dict(x=STAIR['x'], z=STAIR['z'], w=STAIR['w']), spawn=c.spawn, up=dict(label='走樓梯上 1F', to='library_hall', note='到大廳一樓西牆的樓梯間門前（library_layout.js b1Door.spawn）')),
               elevator=dict(EL, stops=False, note='位置和 library_layout.js 的 elevator 相同；這一版不停 B1（LAWWW-B 10-23 選 A），只有門和「看」'),
               doors=[], windows=None, exits=c.exits, seats=c.seats, interact=c.inter, blocks=c.blocks, order=None, **c.lay_extra)
    auto_ap(c, lay)
    prob = navcheck(c, lay)
    lay['navcheck'] = dict(cell=0.4, inset=0.25, problems=prob, ap=sum(1 for s_ in lay['seats'] if s_.get('ap')))
    L.write_json(os.path.join(OUTDIR, f'{c.sid}.layout.json'), lay)
    if arg('--js'):   # 遊戲讀的配置：src/data/library_b1_layout.js（拿掉 navcheck；不要手改那個檔案）
        j = dict(lay); j.pop('navcheck', None)
        open(os.path.join(arg('--js'), 'src/data/library_b1_layout.js'), 'w', encoding='utf-8').write(
            '/* 總圖 B1 的配置（從 assets/models/env/second_ai/library_b1.layout.json 產生：tools/blender/env_second/library_b1.py --js <repo>；不要手改）*/\nconst LIBRARY_B1_LAYOUT=' + json.dumps(j, ensure_ascii=False) + ';\n')
    L.write_json(out[:-4] + '.json', dict(st if isinstance(st, dict) else {}, tris_total=tris, layout=f'{c.sid}.layout.json', seats=len(c.seats)))
    print(json.dumps({'zone': c.sid, 'tris': tris, 'seats': len(c.seats), 'problems': prob}, ensure_ascii=False))
    return prob


if __name__ == '__main__':
    make_tex(); c = B1(); build(c); p = finish(c); print('LIBRARY_B1', 'OK' if not p else p)
