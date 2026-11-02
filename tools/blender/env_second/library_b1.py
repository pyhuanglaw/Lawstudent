"""總圖 B1 第二版（LIB-INTERIOR-1102，LAWWW2〔帳號 A〕2026-11-02）：照使用者給的照片和平面圖重排。
  - 第三版（BB_236，11-02 下午）：配置（座位、互動點、劇情站位）和第二版完全一樣，只換樣子：
    ①桌面、木作換成細紋的淺橡木（Poly Haven fine_grained_wood；第二版 wood_table_001 條紋粗、對比強）；
    ②椅子照照片改成高背、直條鏤空的實木椅，沒有坐墊（study_chair_parts）；
    ③約 55% 的座位桌上放一組桌上小物（desk_props.glb 的 tset_*：書、筆記、筆電、人暫時離開），其中約四成椅腳邊放背包（三色），全部 instancing（desk_items）。
  - 使用者 11-02 08:58「舊有的空間配置 能用的就沿用 按造實際配置安排 尤其B1自習室 以前沒有說要做嗎」（B1 平面圖）、10:0x「B1自習室我記得給我你照片 ?」
    ——10-17 給的兩張 24 小時自習室照片在企劃線 docs/story_planning/art_reference/photo_ref/ntu_lib_b1_room_a.jpg、room_b.jpg（BB README：room_b 只給人看）。
  - 照片：低的白色方格天花板＋一排排長條日光燈、白色方柱、淺灰石材地板、蜂蜜色木頭長桌（中間一道矮木隔板）、直條木椅背＋暗紅椅墊、綠燈罩檯燈。
  - 平面圖：24 小時自習室 A 區（L 形、最大）、B 區（禁止使用筆記型電腦）、國際會議廳（中間）、服務台（A 區入口）、討論室、影印中心、樓梯、電梯、洗手間、中庭（西邊）。
  - 沿用第一版（下面那段）的零件：長桌、綠色檯燈、木椅紅椅墊、玻璃隔間、討論室 1、2（劇情 AA_399 第 2 節接在這兩間）、影印中心、自助借還書機、置物櫃；
    互動點、劇情站位的 id 都不變（study24、disc1、disc2、copy、selfcheck、study_door、study_night…），位置照新的配置。
  - 範圍 x −22…22、z −13…13（第一版 −12…12、−9…9），天花板 3.0 m（照片：低的方格天花板）；樓梯間的門照舊在西牆 z −2.4、電梯井照舊在 x 9.4…11.4、z −2.6…−0.4（和大廳同一個位置）。
第一版（LAWWW2-B 10-23）的說明：
總圖 B1（CLOSED-SPACES-1023 第 2 項；AA_399 第 2 節；使用者 D46「總圖 B1」、10-23「遊戲裡任何現在關起來的空間都可以開始開發」）
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
H = 3.0; K.H = H; LU.H = H   # 第二版：照片的低方格天花板（第一版 3.2）
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
STAIR = dict(x=-22.0, z=-2.4, w=1.0)            # 西牆的樓梯間門（上 1F）：和大廳一樓西牆的門同一個 z（library_layout.js 的 b1Door；大廳 z −3.2 撞到西牆的窗，門放在 z −2.4 那扇窗的位置）
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


REGB2 = {'STUDYA': (0, 0, 512, 96), 'STUDYB': (512, 0, 1024, 96), 'NOLAP': (0, 96, 256, 352), 'CONF': (256, 96, 1024, 192), 'CONFNOTE': (256, 192, 640, 352),
         'WC': (640, 192, 832, 272), 'OFFICE': (832, 192, 1024, 272), 'SERVICE': (640, 272, 1024, 352), 'COURT': (0, 352, 512, 448), 'DIR2': (512, 352, 1024, 608)}
for _k, _v in REGB2.items(): REGB[_k] = _v   # 第二張貼圖集（library_b1_print2.png）的區塊；LU.uv 同一套換算（1024×1024）


def make_tex2():
    """第二版加的印刷品（library_b1_print2.png）：A 區、B 區門牌、禁用筆電、國際會議廳、洗手間、辦公室、服務台、中庭、新的樓層指引"""
    R = REGB2; im = Image.new('RGB', (1024, 1024), '#808080'); d = ImageDraw.Draw(im)
    for key, t, col in (('STUDYA', '24 小時自習室　A 區', (58, 92, 74)), ('STUDYB', '24 小時自習室　B 區', (40, 86, 120))):
        x0, y0, x1, y1 = R[key]; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=col); ctext(d, (x0 + x1) / 2, y0 + 24, t, F(40), (255, 255, 255))
    x0, y0, x1, y1 = R['NOLAP']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 250, 248)); d.ellipse([x0 + 40, y0 + 18, x1 - 40, y0 + 194], outline=(200, 30, 30), width=14)
    d.rectangle([x0 + 88, y0 + 80, x1 - 88, y0 + 136], fill=(60, 60, 60)); d.rectangle([x0 + 74, y0 + 136, x1 - 74, y0 + 146], fill=(60, 60, 60)); d.line([x0 + 70, y0 + 170, x1 - 70, y0 + 42], fill=(200, 30, 30), width=14)
    ctext(d, (x0 + x1) / 2, y0 + 206, '禁止使用筆電', F(30), (200, 30, 30))
    x0, y0, x1, y1 = R['CONF']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(92, 70, 48)); ctext(d, (x0 + x1) / 2, y0 + 18, '國　際　會　議　廳', F(52), (236, 218, 176))
    x0, y0, x1, y1 = R['CONFNOTE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 248, 242)); d.rectangle([x0, y0, x1 - 1, y0 + 36], fill=(92, 70, 48)); ctext(d, (x0 + x1) / 2, y0 + 4, '本日場地使用', F(24), (255, 255, 255))
    for k, ln in enumerate(['10:00　研討會（借用中）', '14:00　演講', '其他時間不開放']): d.text((x0 + 18, y0 + 50 + k * 34), ln, font=F(22), fill=(60, 50, 40))
    for key, t, col in (('WC', '洗手間', (58, 62, 66)), ('OFFICE', '辦公室', (58, 62, 66)), ('SERVICE', '服務台　借還・諮詢', (58, 92, 74)), ('COURT', '中庭（不開放）', (58, 62, 66))):
        x0, y0, x1, y1 = R[key]; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=col); ctext(d, (x0 + x1) / 2, y0 + (y1 - y0) / 2 - 20, t, F(34 if len(t) < 8 else 30), (255, 255, 255))
    x0, y0, x1, y1 = R['DIR2']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(58, 62, 66)); ctext(d, (x0 + x1) / 2, y0 + 10, 'B1', F(54), (240, 240, 236))
    for k, ln in enumerate(['→ 24 小時自習室 A 區', '→ 國際會議廳', '→ 討論室 1・2', '→ 影印中心・B 區・電梯']): d.text((x0 + 30, y0 + 84 + k * 40), ln, font=F(30), fill=(235, 235, 230))
    im.save(os.path.join(GEN, 'library_b1_print2.png'))


class B1(K.Shop):
    """B1 一層的建造狀態（沿用 Shop 的累積網格、配置；不跑 Shop.__init__）"""
    def __init__(self):
        self.sid = 'library_b1'; self.T = {'name': '總圖書館 B1', 'sub': 'B1 自習室・討論室'}; LU.CUR['reg'] = REGB
        self.S = dict(trim='#5a5f63', wainH=0.12); self.FD = {}
        self.W, self.D = 44.0, 26.0; self.X0, self.X1, self.Z0, self.Z1 = -22.0, 22.0, -13.0, 13.0   # 第二版（第一版 24×18）
        self.rng = random.Random(2001); self.extra = {}
        B.reset(texres=512)
        self.root = B.group(self.sid, props={'kind': 'library_b1', 'layout': f'{self.sid}.layout.json'})
        self.blocks, self.seats, self.inter = [], [], []; self.clerk = self.order = self.counter = None
        self.M = M = {
            'floor': L.pbr(f'{self.sid}_floor', 'large_floor_tiles_02', tile=0.8, target='#d2d0ca', contrast=0.45, normal=0.25, maps=('diff', 'nor'), res=512, rough_value=0.22),
            'wall': L.pbr(f'{self.sid}_wall', 'painted_plaster_wall', tile=2.0, target='#ecebe6', contrast=0.3, normal=0.1, maps=('diff', 'nor'), res=256, rough_value=0.85),
            'wain': L.pbr(f'{self.sid}_granite', 'granite_tile_03', tile=1.2, target='#7d7a76', contrast=0.8, normal=0.3, maps=('diff', 'nor'), res=256, rough_value=0.3),
            'wood': L.pbr(f'{self.sid}_wood', 'fine_grained_wood', tile=0.7, target='#c49862', contrast=0.45, normal=0.2, maps=('diff', 'nor'), res=256, rough_value=0.42),   # 第三版（BB_236 ①）：照片是細紋的淺橡木；原本 wood_table_001 條紋粗、對比 0.8
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
            'print2': img_mat(f'{self.sid}_print2', 'library_b1_print2.png', rough=0.55),
            'col': L.flat(f'{self.sid}_column', '#f1f0ec', rough=0.7),
            'woodpanel': L.pbr(f'{self.sid}_woodpanel', 'fine_grained_wood', tile=1.0, target='#93683f', contrast=0.5, normal=0.2, maps=('diff', 'nor'), res=256, rough_value=0.5),   # 第三版：同上，細紋
        }
        self.vc = CMesh(f'{self.sid}_props', M['vc']); self.vm = CMesh(f'{self.sid}_metal', M['vcm'])
        self.wood = Mesh(f'{self.sid}_woodparts', M['wood']); self.steel = Mesh(f'{self.sid}_steel', M['steel'])
        self.tube = Mesh(f'{self.sid}_tubes', M['tube']); self.warm = Mesh(f'{self.sid}_warm', M['warm']); self.fridgel = Mesh(f'{self.sid}_fridgelight', M['fridge'])
        self.shade = Mesh(f'{self.sid}_lampshades', M['shade'])
        self.prt = Mesh(f'{self.sid}_prints', M['print']); self.scr = Mesh(f'{self.sid}_screens', M['screen']); self.prt2 = Mesh(f'{self.sid}_prints2', M['print2'])
        self.colm = Mesh(f'{self.sid}_columns', M['col']); self.panel = Mesh(f'{self.sid}_woodpanels', M['woodpanel'], tile=1.2)
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


def court_garden(c, X0, CG0, CG1):
    """下沉中庭的植栽（從 B1 西門廳的玻璃看出去）：花台（土＋花崗石邊）、中間一棵小樹（樹幹＋分枝＋深色芯外面一圈葉片卡）、
    花台上的灌木（葉片卡圍著深色芯）、牆腳的蕨類（蕨葉卡）。做法和 118 巷牆後的大樹（lane118_ground.py）、tools/blender/plants.py 同一套；
    葉子貼圖 olive_leaves.png、fern_leaves.png（tools/blender/textures/gen，本作程式畫的）。"""
    try:
        import plants as PL
        PMc = PL.materials(f'{c.sid}_court_'); LEAFM, FERNM, BARKM = PMc['leaf_small'], PMc['leaf_fern'], PMc['bark']
    except Exception as ex:   # noqa: BLE001
        print('plants', ex); LEAFM = FERNM = L.flat(f'{c.sid}_court_leaf', '#46683a', rough=0.8); BARKM = L.flat(f'{c.sid}_court_bark', '#5a4a3c', rough=0.9)
    rng = random.Random(1102)
    cards = Mesh(f'{c.sid}_court_cards', LEAFM); ferns = Mesh(f'{c.sid}_court_ferns', FERNM); bark = Mesh(f'{c.sid}_court_bark', BARKM)
    core = Mesh(f'{c.sid}_court_core', L.flat(f'{c.sid}_court_core', '#2c4325', rough=0.98))
    bed = c.extra.setdefault('court', None)
    def card(m, px, py, pz, sz, yaw, tilt, h=None):
        ca, sa = math.cos(yaw), math.sin(yaw); hh = sz if h is None else h
        P = lambda du, dv: (px + ca * du, py + dv + tilt * du, pz + sa * du)
        f = m.bm.faces.new([m.bm.verts.new(L.g2b(*P(du, dv))) for (du, dv) in ((-sz / 2, -hh / 2), (sz / 2, -hh / 2), (sz / 2, hh / 2), (-sz / 2, hh / 2))])
        uvl = m.bm.loops.layers.uv.verify()
        for lp, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uvl].uv = uv
    def crown(cx, cy, cz, rx, ry, rz, n, csz):
        v0 = set(core.bm.verts); core.ell((cx, cy, cz), rx * 0.45, ry * 0.45, rz * 0.45, seg=9, rings=5)   # 芯縮小、多分段（11-02 遊戲截圖：灌木的深色芯露出來像多面體）
        c0 = L.g2b(cx, cy, cz)
        for vv in core.bm.verts:
            if vv not in v0: vv.co = c0 + (vv.co - c0) * rng.uniform(0.86, 1.08)
        for _ in range(n):
            a_ = rng.uniform(0, 2 * PI); e_ = math.asin(rng.uniform(-0.8, 1.0)); rr = rng.uniform(0.72, 1.02)
            card(cards, cx + rx * rr * math.cos(a_) * math.cos(e_), cy + ry * rr * math.sin(e_), cz + rz * rr * math.sin(a_) * math.cos(e_), csz * rng.uniform(0.8, 1.25), rng.uniform(0, PI), rng.uniform(-0.5, 0.5))
    zc = (CG0 + CG1) / 2
    # 花台：靠對面擋土牆一長條（土、花崗石邊 0.35 高）＋樹下一個方的
    for (x0, x1, z0, z1) in ((X0 - 6.2, X0 - 4.6, CG0 - 1.9, CG1 + 1.9), (X0 - 4.4, X0 - 2.8, zc - 0.9, zc + 0.9)):
        bed.cbox(x0, x1, 0.0, 0.35, z0, z0 + 0.12, '#a9a59c'); bed.cbox(x0, x1, 0.0, 0.35, z1 - 0.12, z1, '#a9a59c')
        bed.cbox(x0, x0 + 0.12, 0.0, 0.35, z0, z1, '#a9a59c'); bed.cbox(x1 - 0.12, x1, 0.0, 0.35, z0, z1, '#a9a59c')
        bed.cbox(x0 + 0.12, x1 - 0.12, 0.0, 0.3, z0 + 0.12, z1 - 0.12, '#4a3a2c')
    # 小樹（約 4.6 m 的庭園樹：樹冠在 2.8～3.9 m——從門廳的玻璃（窗頂 2.7）往外看得到；第一版 6.4 m 樹冠在玻璃上緣以上，只看到樹幹）
    tx_, tz_, th = X0 - 3.6, zc, 4.6
    bt = L.lathe([(0.2, 0.3), (0.15, 0.7), (0.12, th * 0.42), (0.08, th * 0.6)], seg=8); bark.add_bm(bt, L.Matrix.Translation(L.g2b(tx_, 0.0, tz_))); bt.free()
    for k in range(4):
        a_ = k * PI / 2 + rng.uniform(-0.4, 0.4); yb = th * rng.uniform(0.38, 0.5)
        bark.cyl((tx_, yb, tz_), (tx_ + math.cos(a_) * 1.2, th * rng.uniform(0.62, 0.74), tz_ + math.sin(a_) * 1.2), 0.06, seg=6, r2=0.025)
    for k in range(6):
        a_ = rng.uniform(0, 2 * PI); d_ = rng.uniform(0.3, 1.1); r_ = rng.uniform(0.8, 1.1)
        crown(tx_ + math.cos(a_) * d_, th * rng.uniform(0.66, 0.8), tz_ + math.sin(a_) * d_, r_, r_ * 0.62, r_, int(18 * r_ * r_), 0.62)
    # 對面擋土牆上的藤蔓（爬牆虎：貼著牆的葉片卡，一片一片往上爬；牆不再是一整面灰）
    for (vz, vh) in ((CG0 - 1.0, 3.6), (zc + 0.6, 2.8), (CG1 + 1.2, 3.9)):
        for _ in range(int(26 * vh)):
            yy = rng.uniform(0.35, vh); spread = 0.9 * (1.0 - 0.45 * yy / vh)
            card(cards, X0 - 6.18 + rng.uniform(0.0, 0.08), yy, vz + rng.uniform(-spread, spread), rng.uniform(0.28, 0.42), PI / 2 + rng.uniform(-0.3, 0.3), rng.uniform(-0.25, 0.25))
    # 灌木（靠牆那條花台上，一叢一叢；葉片卡圍著深色芯）
    z = CG0 - 1.6
    while z < CG1 + 1.6:
        r_ = rng.uniform(0.42, 0.6); crown(X0 - 5.4 + rng.uniform(-0.15, 0.15), 0.3 + r_ * 0.8, z, r_, r_ * 0.85, r_, int(34 * r_ * r_ + 14), 0.42); z += rng.uniform(0.75, 0.95)
    # 蕨類（樹下花台、兩頭的牆腳）：蕨葉卡從中心往外斜出去
    for (fx, fz) in [(X0 - 3.6 + dx, zc + dz) for (dx, dz) in ((-0.5, -0.5), (0.5, 0.45), (-0.45, 0.55), (0.5, -0.5))] + [(X0 - 1.2, CG0 - 1.5), (X0 - 1.2, CG1 + 1.5), (X0 - 2.0, CG0 - 1.6), (X0 - 2.0, CG1 + 1.6)]:
        y0 = 0.3 if abs(fx - (X0 - 3.6)) < 1.0 and abs(fz - zc) < 1.0 else 0.0
        for j in range(9):
            a_ = j * 2 * PI / 9 + rng.uniform(-0.2, 0.2); Lf = rng.uniform(0.5, 0.75)
            card(ferns, fx + math.cos(a_) * Lf * 0.45, y0 + 0.28, fz + math.sin(a_) * Lf * 0.45, Lf, a_, 0.35, h=0.36)
    # 中庭地面的步石（從玻璃看出去有一條路）
    for k in range(6):
        sz_ = CG0 - 0.6 + k * (CG1 - CG0 + 1.2) / 5; bed.cbox(X0 - 2.1, X0 - 1.3, 0.0, 0.03, sz_ - 0.3, sz_ + 0.3, '#b9b5ab')
    c.court_meshes = [cards, ferns, bark, core]


def banker_lamp(c, x, z, s):
    """綠色銀行燈（ntu_lib_b1 的樣子）：黃銅底座、桿、沿 x 的綠色半圓燈罩（兩端封口），燈罩下面亮的一條；s＝坐的人在哪一側（±1，燈罩往那邊偏 3 cm）。
    底座、桿、燈罩用 instancing（make_instances：一個網格、每盞一個物件，GLB 的 EXT_mesh_gpu_instancing；115 盞各畫一份太大）；
    燈罩下面亮的那一條照舊合在 c.warm（遊戲找 GLOW_ 材質、整層一個網格）"""
    c.__dict__.setdefault('inst_lamps', []).append((x, z, 0.0 if s > 0 else PI))
    zc, y0, r = z + s * 0.03, 0.99, 0.06
    c.warm.box(x - 0.13, x + 0.13, y0 + 0.004, y0 + 0.008, zc - r + 0.01, zc + r - 0.01)


def banker_lamp_parts(c, x, z, s):
    """banker_lamp 的底座、桿、燈罩（make_instances 在原點畫一份當樣板）"""
    ccyl(c.vm, (x, 0.75, z), (x, 0.765, z), 0.06, '#b08a3a', seg=10)
    ccyl(c.vm, (x, 0.765, z), (x, 0.99, z), 0.008, '#b08a3a', seg=6)
    zc, y0, r, n = z + s * 0.03, 0.99, 0.06, 8
    arc = [(r * math.cos(PI * k / n), r * math.sin(PI * k / n)) for k in range(n + 1)]      # 上半圓（z 方向的偏移, y）
    for (u0, v0), (u1, v1) in zip(arc, arc[1:]):
        c.shade.quad([(x - 0.14, y0 + v0, zc + u0), (x + 0.14, y0 + v0, zc + u0), (x + 0.14, y0 + v1, zc + u1), (x - 0.14, y0 + v1, zc + u1)])
        c.shade.quad([(x - 0.14, y0 + v1, zc + u1), (x + 0.14, y0 + v1, zc + u1), (x + 0.14, y0 + v0, zc + u0), (x - 0.14, y0 + v0, zc + u0)])   # 裡面（雙面）
    for xe in (x - 0.14, x + 0.14): c.shade.quad([(xe, y0 + v, zc + u) for (u, v) in arc]); c.shade.quad([(xe, y0 + v, zc + u) for (u, v) in reversed(arc)])


def study_chair(c, x, z, yaw):
    """自習室的木椅：只記位置，make_instances 用 instancing 放（一張椅子約 300 個三角形 × 115 張）"""
    c.__dict__.setdefault('inst_chairs', []).append((x, z, yaw))


def study_chair_parts(c, x, z, yaw):
    """第三版（BB_236 ②；使用者 10-17 的兩張 24 小時自習室照片）：高背、直條鏤空的蜂蜜色實木椅，木頭椅面、沒有坐墊。
    第二版是一般的矮背木椅（0.86 m）＋暗紅坐墊。(x, z) 是坐的位置，面向 yaw；椅背在後面（本地 −z）"""
    T = rot(x, z, yaw); col, dk, sh = '#b0763a', '#98632f', 0.45
    rbox(c.vc, T, -0.215, 0.215, sh - 0.03, sh, -0.2, 0.2, col, r=0.008, seg=1)                                # 木頭椅面
    for lx in (-0.185, 0.185):
        (px, pz) = T(lx, 0.17); ccyl(c.vc, (px, 0.0, pz), (px, sh - 0.03, pz), 0.017, dk, seg=6)              # 前腳
        (px, pz) = T(lx, -0.18); (qx, qz) = T(lx, -0.215); ccyl(c.vc, (px, 0.0, pz), (qx, 1.02, qz), 0.018, dk, seg=6)   # 後腳一路到椅背頂，往後一點
        rbox(c.vc, T, lx - 0.01, lx + 0.01, 0.148, 0.172, -0.18, 0.17, dk)                                   # 側面的橫撐
    rbox(c.vc, T, -0.185, 0.185, 0.188, 0.212, 0.158, 0.182, dk)                                               # 前面的橫撐
    rbox(c.vc, T, -0.205, 0.205, 0.93, 1.02, -0.232, -0.198, col, r=0.01, seg=1)                               # 椅背上橫木
    rbox(c.vc, T, -0.19, 0.19, 0.56, 0.6, -0.222, -0.196, col)                                                 # 椅背下橫木
    for k in range(5):                                                                                          # 直條（照片：五根）
        lx = -0.12 + k * 0.06; rbox(c.vc, T, lx - 0.011, lx + 0.011, 0.6, 0.93, -0.218, -0.202, col)


BAG_COLS = (('#22304a', '#1a2438'), ('#2b2b2e', '#1d1d20'), ('#56603e', '#424a2f'))   # 深藍、黑、橄欖綠（主色、側邊／揹帶）


def backpack_parts(t, v):
    """背包（BB_236 ③）：立著放在地上，背面（有揹帶那一面）朝 −z；約 0.30×0.42×0.18 m"""
    col, dk = BAG_COLS[v]; T = rot(0.0, 0.0, 0.0)
    rbox(t.vc, T, -0.15, 0.15, 0.0, 0.40, -0.09, 0.09, col, r=0.05, seg=2)                 # 本體
    rbox(t.vc, T, -0.12, 0.12, 0.05, 0.22, 0.085, 0.13, dk, r=0.03, seg=1)                 # 前面的小袋
    rbox(t.vc, T, -0.05, 0.05, 0.40, 0.45, -0.02, 0.02, dk, r=0.012, seg=1)                # 提把
    for lx in (-0.08, 0.08): rbox(t.vc, T, lx - 0.022, lx + 0.022, 0.06, 0.38, -0.11, -0.09, dk)   # 揹帶


def desk_items(c):
    """桌上小物（BB_236 ③）：assets/models/env/second_ai/desk_props.glb（LAWWW2 10-13 的桌上小物模組）的 tset_*——一個人面前的東西，
    原點＝坐的人正前方的桌緣、y=0＝桌面、+z 往桌子裡面。匯入一次當樣板，每個座位一個共用網格的物件（匯出成 EXT_mesh_gpu_instancing）；
    背包同一套（三種顏色各一個樣板）。"""
    from types import SimpleNamespace
    from lib2 import Matrix
    desk = c.__dict__.get('inst_desk') or []; bags = c.__dict__.get('inst_bags') or []; n = 0
    if desk:
        src = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'assets', 'models', 'env', 'second_ai', 'desk_props.glb')
        before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=os.path.abspath(src)); new = [o for o in bpy.data.objects if o not in before]
        tm = {o.name: o for o in new if o.type == 'MESH' and o.name.startswith('tset_') and not o.name.endswith('_lod1')}
        for i, (kind, x, z, yaw) in enumerate(desk):
            if kind not in tm: continue
            o = bpy.data.objects.new(f'INST_{c.sid}_desk_{kind}_{i}', tm[kind].data); bpy.context.scene.collection.objects.link(o); o.parent = c.root
            o.matrix_world = Matrix.Translation(L.g2b(x, 0.75, z)) @ Matrix.Rotation(yaw, 4, 'Z'); n += 1
        for o in new: bpy.data.objects.remove(o, do_unlink=True)   # 樣板本身不留（網格資料還被副本用著）
    for v in range(len(BAG_COLS)):
        spots = [b for b in bags if b[0] == v]
        if not spots: continue
        t = SimpleNamespace(vc=CMesh(f'INST_{c.sid}_bag{v}', c.vc.mat)); backpack_parts(t, v); ob = t.vc.finish(c.root, uv=False)
        if ob is None: continue
        for i, (_, x, z, yaw) in enumerate(spots):
            o = ob if i == 0 else bpy.data.objects.new(f'INST_{c.sid}_bag{v}_{i}', ob.data)
            if i: bpy.context.scene.collection.objects.link(o); o.parent = c.root
            o.name = f'INST_{c.sid}_bag{v}_{i}'; o.matrix_world = Matrix.Translation(L.g2b(x, 0.0, z)) @ Matrix.Rotation(yaw, 4, 'Z'); n += 1
    print(json.dumps({'desk_items': len(desk), 'bags': len(bags), 'objects': n}))


def make_instances(c):
    """椅子、檯燈：在原點畫一份樣板（每個材質一個網格），每個位置一個共用同一個網格的物件（位置＋繞垂直軸轉 yaw）。
    匯出時 export_gpu_instances → EXT_mesh_gpu_instancing（遊戲的 GLTFLoader 變成 InstancedMesh，總圖 3F 同一套）。
    rot() 的 yaw（面向 (sin, cos)）在 Blender 座標（g2b：x, −z, y）剛好是繞 Z 軸轉 +yaw。"""
    from types import SimpleNamespace
    from lib2 import Matrix
    n = 0
    for key, parts, fn in (('inst_chairs', (('vc', CMesh, c.vc.mat),), lambda t: study_chair_parts(t, 0.0, 0.0, 0.0)),
                           ('inst_lamps', (('vm', CMesh, c.vm.mat), ('shade', Mesh, c.shade.mat)), lambda t: banker_lamp_parts(t, 0.0, 0.0, 1))):
        spots = c.__dict__.get(key) or []
        if not spots: continue
        t = SimpleNamespace(**{a: cls(f'INST_{c.sid}_{key[5:]}_{a}', mat) for (a, cls, mat) in parts})
        fn(t)
        for (a, cls, mat) in parts:
            ob = getattr(t, a).finish(c.root, uv=False)
            if ob is None: continue
            ob.name = f'INST_{c.sid}_{key[5:]}_{a}_0'
            for i, (x, z, yaw) in enumerate(spots):
                o = ob if i == 0 else bpy.data.objects.new(f'INST_{c.sid}_{key[5:]}_{a}_{i}', ob.data)
                if i: bpy.context.scene.collection.objects.link(o); o.parent = c.root
                o.matrix_world = Matrix.Translation(L.g2b(x, 0.0, z)) @ Matrix.Rotation(yaw, 4, 'Z')
                n += 1
    print(json.dumps({'instances': n, 'chairs': len(c.__dict__.get('inst_chairs') or []), 'lamps': len(c.__dict__.get('inst_lamps') or [])}))


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
            # 第三版（BB_236 ③）：有人坐過的座位——桌上一組小物（desk_props.glb 的 tset_*）、椅腳邊的背包；第二版是一個色塊的「書」
            r_ = c.rng.random()
            if r_ < 0.55:
                kind = c.rng.choices(('tset_book', 'tset_notes', 'tset_laptop', 'tset_away'), weights=(30, 30, 25, 15))[0]
                c.__dict__.setdefault('inst_desk', []).append((kind, xx, zc + s * depth / 2, yaw))   # 原點＝坐的人正前方的桌緣，+z 往桌子裡面＝坐的人面向的方向
                if c.rng.random() < 0.4:
                    T = rot(xx, zs, yaw); (bx, bz) = T(0.36, -0.05)
                    c.__dict__.setdefault('inst_bags', []).append((c.rng.randrange(3), bx, bz, yaw + c.rng.uniform(-0.5, 0.5)))


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


def disc_room2(c, cx, z0, z1, wbkey, tvkey, tvx, tvn):
    """討論室（第二版）：玻璃那一面在 z0（北，對走廊），後牆是南邊外牆 z1；六人桌在中間、白板在後牆、電視在側邊隔間牆（tvx，tvn＝朝房間裡 ±1）"""
    zc = (z0 + z1) / 2 + 0.2
    c.vc.crbox(cx - 0.62, cx + 0.62, 0.72, 0.75, zc - 1.3, zc + 1.3, '#cfcac0', r=0.006, seg=1)
    for (lx, lz) in ((-0.55, -1.2), (0.55, -1.2), (-0.55, 1.2), (0.55, 1.2)): c.vm.cbox(cx + lx - 0.025, cx + lx + 0.025, 0.0, 0.72, zc + lz - 0.025, zc + lz + 0.025, '#3a3f45')
    c.block(cx - 0.64, cx + 0.64, zc - 1.32, zc + 1.32, 'disc_table')
    for s in (-1, 1):
        for dz in (-0.85, 0.0, 0.85):
            x = cx + s * 1.08; yaw = PI / 2 if s < 0 else -PI / 2
            LU.task_chair(c, x, zc + dz, yaw, '#2e3440'); c.seat(x, zc + dz, yaw, (cx, zc), 'study', ap=(cx + s * 1.65, zc + dz), label='坐下')
    T = rot(cx + 0.25, zc - 0.6, 0.0); rbox(c.vc, T, -0.15, 0.15, 0.75, 0.77, -0.11, 0.11, '#e8e4dc'); rbox(c.vc, T, -0.15, 0.15, 0.77, 0.80, -0.11, 0.11, '#2a4a6a')
    ccyl(c.vc, (cx - 0.3, 0.75, zc + 0.5), (cx - 0.3, 0.97, zc + 0.5), 0.035, '#8fa89a', seg=10)
    tr = c.wg('S', 'trim', c.M['vc'], cm=True); pr = c.wg('S', 'print', c.M['print'])
    tr.cbox(cx - 1.23, cx + 1.23, 0.845, 2.105, z1 - 0.03, z1, '#c9ced2'); LU.tquad(pr, cx, 1.475, z1 - 0.032, (0, -1), 2.4, 1.2, wbkey)
    tr.cbox(cx - 1.2, cx + 1.2, 0.81, 0.845, z1 - 0.09, z1, '#9aa0a4')
    side = c.wg(tvkey, 'trim', c.M['vc'], cm=True); sc = c.wg(tvkey, 'screen', c.M['screen'])
    side.cbox(*sorted((tvx, tvx + tvn * 0.05)), 1.27, 1.93, zc - 0.56, zc + 0.56, '#1a1a1a'); LU.tquad(sc, tvx + tvn * 0.052, 1.6, zc, (tvn, 0), 1.04, 0.62, 'TV')
    plant(c, cx + 2.2 * (1 if tvn < 0 else -1) * -1, z1 - 0.6, 1.1)
    return zc


def column(c, x, z, w=0.6):
    """白色方柱（照片：自習室裡一根一根白色方柱，地板到天花板）＋花崗石踢腳"""
    c.colm.box(x - w / 2, x + w / 2, 0.12, H, z - w / 2, z + w / 2)
    c.vc.cbox(x - w / 2 - 0.01, x + w / 2 + 0.01, 0.0, 0.12, z - w / 2 - 0.01, z + w / 2 + 0.01, '#7d7a76')
    c.block(x - w / 2, x + w / 2, z - w / 2, z + w / 2, 'column')


def build2(c):
    """第二版的配置（世界座標＝和總圖大廳同一套；B1 地板 y 0、天花板 3.0）：
       西門廳 x −22…−16（樓梯間的門 z −2.4、置物櫃、公告、飲水機、西牆一段玻璃看出去是下沉中庭）
       A 區 主要 x −16…8、z −13…−3（三排長桌：靠北牆單面一排、中間兩排雙面），A 區 西段 x −16…−8、z −3…5（服務台、一張長桌、參考書架）
       國際會議廳 x −8…8、z −3…5（關著：木門、門牌、場地使用公告）
       電梯走道 x 8…13、z −13…5（電梯井 x 9.4…11.4、z −2.6…−0.4，自助借還書機、還書口）
       B 區 x 13…22、z −13…−1（禁止使用筆電；北牆單面一排、中間兩排雙面）
       南邊走廊 z 5…13：洗手間（關）、討論室 1、2、辦公室（關）、影印中心"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M
    # ---- 地板、天花板（低的白色方格）、四面牆；西牆：樓梯間的門＋中庭的玻璃
    fl = Mesh(f'{c.sid}_floorm', M['floor'], tile=0.8); fl.box(X0, X1, -0.05, 0.0, Z0, Z1); fl.finish(c.root)
    ce = Mesh(f'{c.sid}_ceiling', M['ceil'], tile=0.6); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(c.root)
    for k in 'NSE':
        wl = c.wg(k, 'wall', M['wall']); wn = c.wg(k, 'wain', M['wain'])
        if k == 'N': wl.quad([(X0, 0.12, Z0), (X1, 0.12, Z0), (X1, H, Z0), (X0, H, Z0)]); wn.quad([(X0, 0.0, Z0), (X1, 0.0, Z0), (X1, 0.12, Z0), (X0, 0.12, Z0)])
        elif k == 'S': wl.quad([(X1, 0.12, Z1), (X0, 0.12, Z1), (X0, H, Z1), (X1, H, Z1)]); wn.quad([(X1, 0.0, Z1), (X0, 0.0, Z1), (X0, 0.12, Z1), (X1, 0.12, Z1)])
        else: wl.quad([(X1, 0.12, Z0), (X1, 0.12, Z1), (X1, H, Z1), (X1, H, Z0)]); wn.quad([(X1, 0.0, Z0), (X1, 0.0, Z1), (X1, 0.12, Z1), (X1, 0.12, Z0)])
    wl = c.wg('W', 'wall', M['wall']); wn = c.wg('W', 'wain', M['wain']); tr = c.wg('W', 'trim', M['vc'], cm=True); dm = c.wg('W', 'doormetal', M['vcm'], cm=True)
    a, b = STAIR['z'] - STAIR['w'] / 2, STAIR['z'] + STAIR['w'] / 2
    CG0, CG1 = -12.4, -5.2                                            # 西牆看出去中庭的玻璃（z）
    segs = [(Z0, CG0), (CG1, a - 0.08), (b + 0.08, Z1)]
    for (za, zb) in segs: wl.quad([(X0, 0.12, zb), (X0, 0.12, za), (X0, H, za), (X0, H, zb)]); wn.quad([(X0, 0.0, zb), (X0, 0.0, za), (X0, 0.12, za), (X0, 0.12, zb)])
    wl.quad([(X0, 2.2, b + 0.08), (X0, 2.2, a - 0.08), (X0, H, a - 0.08), (X0, H, b + 0.08)])
    for (za, zb) in ((a - 0.08, a), (b, b + 0.08)): tr.cbox(X0, X0 + 0.06, 0.0, 2.2, za, zb, '#5a5f63')
    tr.cbox(X0, X0 + 0.06, 2.12, 2.2, a - 0.08, b + 0.08, '#5a5f63')
    dm.cbox(X0 - 0.04, X0, 0.0, 2.13, a - 0.02, b + 0.02, '#6a7078')
    uvquad(c.wg('W', 'print', M['print']), [(X0 + 0.016, 1.72, b + 0.68), (X0 + 0.016, 1.72, b + 0.14), (X0 + 0.016, 1.92, b + 0.14), (X0 + 0.016, 1.92, b + 0.68)], LU.uv('STAIR'))
    c.look('stairs', X0 + 0.6, STAIR['z'], 0.7, '走樓梯上 1F', dev='src/library_b1_3d.js：換到 library_hall 一樓西牆的樓梯間門前（library_layout.js b1Door.spawn）')
    # 中庭的玻璃（窗台 0.1、窗頂 2.7；外面是下沉中庭：植栽、天光從上面來——白天亮、晚上暗）
    gl = c.wg('W', 'glass', M['glass']); fr = c.wg('W', 'trim', M['vcm'], cm=True)
    wl.quad([(X0, 2.7, CG1), (X0, 2.7, CG0), (X0, H, CG0), (X0, H, CG1)]); wn.quad([(X0, 0.0, CG1), (X0, 0.0, CG0), (X0, 0.1, CG0), (X0, 0.1, CG1)])
    gl.quad([(X0 - 0.02, 0.1, CG1), (X0 - 0.02, 0.1, CG0), (X0 - 0.02, 2.7, CG0), (X0 - 0.02, 2.7, CG1)])
    for zz in [CG0 + (CG1 - CG0) * k / 4 for k in range(5)]: fr.cbox(X0 - 0.05, X0 + 0.03, 0.0, 2.75, zz - 0.04, zz + 0.04, '#5a5f63')
    fr.cbox(X0 - 0.05, X0 + 0.03, 2.66, 2.75, CG0, CG1, '#5a5f63'); fr.cbox(X0 - 0.05, X0 + 0.06, 0.06, 0.12, CG0, CG1, '#5a5f63')
    c.block(X0 - 0.1, X0 + 0.1, CG0, CG1, 'court_glass')
    court = c.extra.setdefault('court', CMesh(f'{c.sid}_court', M['vc']))
    court.cbox(X0 - 6.2, X0 - 0.05, -0.05, 0.0, CG0 - 2.0, CG1 + 2.0, '#8a8e86')                       # 中庭地面（鋪石）
    court.cbox(X0 - 6.4, X0 - 6.2, 0.0, 4.4, CG0 - 2.0, CG1 + 2.0, '#b7b2a7')                          # 對面的擋土牆（一樓地面在 4.4 m）
    for zz in (CG0 - 2.0, CG1 + 2.0): court.cbox(X0 - 6.4, X0 - 0.05, 0.0, 4.4, zz - 0.1, zz + 0.1, '#b7b2a7')
    court_garden(c, X0, CG0, CG1)                                                                      # 植栽：小樹、灌木、蕨類（葉片卡；第一版是圓角方塊，11-02 遊戲截圖像積木）
    sky = c.extra.setdefault('sky', Mesh(f'GLOW_{c.sid}_courtsky', L.flat(f'GLOW_{c.sid}_courtsky', '#dfe8ef', rough=1.0, emit=B.srgb('#cfdae4'))))
    sky.quad([(X0 - 6.4, 4.45, CG1 + 2.0), (X0 - 6.4, 4.45, CG0 - 2.0), (X0 - 0.05, 4.45, CG0 - 2.0), (X0 - 0.05, 4.45, CG1 + 2.0)])   # 天光（往下看是一片亮的天）
    uvquad(c.wg('W', 'print2', M['print2']), [(X0 + 0.016, 1.6, CG1 + 1.5), (X0 + 0.016, 1.6, CG1 + 0.3), (X0 + 0.016, 1.84, CG1 + 0.3), (X0 + 0.016, 1.84, CG1 + 1.5)], LU.uv('COURT'))
    c.look('court', X0 + 1.0, (CG0 + CG1) / 2, 1.2, '中庭', '玻璃外面是下沉的中庭，天光從上面落下來。門上貼著「中庭（不開放）」。', dev='暫定的字；平面圖西邊的中庭（行政入口那一側）')
    # ---- 電梯井（和大廳同一個位置，門朝北）
    ex0, ex1, ez0, ez1 = EL['x0'], EL['x1'], EL['z0'], EL['z1']
    c.vc.cbox(ex0 - 0.15, ex1 + 0.15, 0.0, H, ez0, ez1 + 0.15, '#d6d2c9')
    dx0, dx1 = EL['doorX0'], EL['doorX1']; c.steel.box(dx0, (dx0 + dx1) / 2 - 0.005, 0.0, 2.1, ez0 - 0.02, ez0); c.steel.box((dx0 + dx1) / 2 + 0.005, dx1, 0.0, 2.1, ez0 - 0.02, ez0)
    c.vm.cbox(dx0 - 0.08, dx1 + 0.08, 2.1, 2.18, ez0 - 0.03, ez0, '#9aa0a4'); c.vm.cbox(dx0 - 0.08, dx0, 0.0, 2.1, ez0 - 0.03, ez0, '#9aa0a4'); c.vm.cbox(dx1, dx1 + 0.08, 0.0, 2.1, ez0 - 0.03, ez0, '#9aa0a4')
    c.vm.cbox(dx1 + 0.18, dx1 + 0.3, 1.0, 1.28, ez0 - 0.015, ez0, '#c9ced2'); c.fridgel.box(dx1 + 0.21, dx1 + 0.27, 1.06, 1.1, ez0 - 0.02, ez0 - 0.015)
    uvquad(c.prt, [(dx1 + 0.2, 2.3, ez0 - 0.005), (dx0 - 0.2, 2.3, ez0 - 0.005), (dx0 - 0.2, 2.68, ez0 - 0.005), (dx1 + 0.2, 2.68, ez0 - 0.005)], LU.uv('B1SIGN'))
    c.block(ex0 - 0.17, ex1 + 0.17, ez0 - 0.05, ez1 + 0.17, 'elevator_core')
    c.look('elevator', round((dx0 + dx1) / 2, 3), round(ez0 - 0.7, 3), 0.8, '電梯', '電梯門旁邊貼著：「B1 停靠限館員刷卡，讀者請走西側樓梯。」', dev='暫定的字；LAWWW-B 10-23：這一版電梯不停 B1（選 A）')
    # ---- 隔間
    AX0, AX1, AZ1, LX1, LZ1 = -16.0, 8.0, -2.4, -8.0, 5.0   # AZ1：會議廳北牆（第一次 −3.0：最南排南側的椅子走不到）             # A 區：主要 x AX0…AX1、z Z0…AZ1；西段 x AX0…LX1、z AZ1…LZ1
    BX0, BZ1 = 13.0, -1.0                                              # B 區：x BX0…X1、z Z0…BZ1
    DZ0 = 7.5                                                          # 討論室的玻璃（z）
    glass_wall(c, 'P1', 'z', AX0, Z0 + 0.05, LZ1 - 0.05, gaps=[(0.4, 2.0)], dir_=(1, 0, 0))                 # 門廳｜A 區（玻璃；A 區的正門：刷卡）
    LU.partition(c, 'P2', 'x', AZ1, LX1 - 0.05, AX1 + 0.05, dir_=(0, 0, -1))                                 # A 區｜國際會議廳（北牆）
    LU.partition(c, 'P3', 'z', LX1, AZ1 - 0.05, LZ1 + 0.05, dir_=(-1, 0, 0))                                 # A 區西段｜國際會議廳（西牆）
    LU.partition(c, 'P4', 'x', LZ1, AX0 + 0.05, LX1 + 0.05, gaps=[(-12.8, -11.6)], dir_=(0, 0, -1))          # A 區西段｜南走廊（側門）
    LU.partition(c, 'P5', 'x', LZ1, LX1 - 0.05, AX1 + 0.05, dir_=(0, 0, 1))                                  # 國際會議廳｜南走廊（南牆：木門）
    LU.partition(c, 'P6', 'z', AX1, AZ1 - 0.05, LZ1 + 0.05, dir_=(1, 0, 0))                                  # 國際會議廳｜電梯走道（東牆）
    glass_wall(c, 'P7', 'z', AX1, Z0 + 0.05, AZ1 + 0.05, gaps=[(-7.5, -6.3)], dir_=(-1, 0, 0))               # A 區｜電梯走道（玻璃、東門）
    glass_wall(c, 'P8', 'z', BX0, Z0 + 0.05, BZ1 + 0.05, gaps=[(-7.5, -6.3)], dir_=(1, 0, 0))                # 電梯走道｜B 區（玻璃、B 區的門）
    LU.partition(c, 'P9', 'x', BZ1, BX0 - 0.05, X1, dir_=(0, 0, -1))                                         # B 區｜影印中心那一邊（南牆）
    glass_wall(c, 'P10', 'x', DZ0, -6.0, 6.0, gaps=[(-3.6, -2.4), (2.4, 3.6)], dir_=(0, 0, -1))             # 討論室 1、2 的玻璃（對走廊）
    LU.partition(c, 'P11', 'z', -6.0, DZ0 - 0.05, Z1, dir_=(1, 0, 0))                                        # 討論室 1 西牆
    LU.partition(c, 'P12', 'z', 0.0, DZ0 - 0.05, Z1, dir_=(-1, 0, 0))                                        # 討論室 1｜2
    LU.partition(c, 'P13', 'z', 6.0, DZ0 - 0.05, Z1, dir_=(-1, 0, 0))                                        # 討論室 2 東牆（辦公室西牆）
    LU.partition(c, 'P14', 'x', 9.0, -16.0, -10.0, dir_=(0, 0, -1))                                          # 洗手間（北牆，門關著）
    LU.partition(c, 'P15', 'z', -10.0, 9.0 - 0.05, Z1, dir_=(-1, 0, 0))
    LU.partition(c, 'P16', 'x', 9.0, 6.0, 12.0, dir_=(0, 0, -1))                                             # 辦公室（北牆，門關著）
    LU.partition(c, 'P17', 'z', 12.0, 9.0 - 0.05, Z1, dir_=(1, 0, 0))
    # 關著的門（洗手間、辦公室：門片貼在隔間牆上；國際會議廳：雙開木門）
    for (cx_, key, lab) in ((-13.0, 'P14', 'WC'), (9.0, 'P16', 'OFFICE')):
        m = c.wg(key, 'trim', M['vc'], cm=True); m.cbox(cx_ - 0.5, cx_ + 0.5, 0.0, 2.15, 9.0 - 0.08, 9.0 - 0.05, '#b9b2a6'); m.cbox(cx_ + 0.3, cx_ + 0.38, 0.95, 1.0, 9.0 - 0.11, 9.0 - 0.08, '#5a5f63')
        uvquad(c.wg(key, 'print2', M['print2']), [(cx_ - 0.4, 2.25, 9.0 - 0.081), (cx_ + 0.4, 2.25, 9.0 - 0.081), (cx_ + 0.4, 2.55, 9.0 - 0.081), (cx_ - 0.4, 2.55, 9.0 - 0.081)], LU.uv(lab))
    c.look('wc', -13.0, 8.2, 0.8, '洗手間', '洗手間。', dev='暫定的字；平面圖西南角的洗手間（門關著，不進去）')
    c.look('office', 9.0, 8.2, 0.8, '辦公室', '門上寫著「辦公室」，門縫透出一點燈光。', dev='暫定的字')
    pm = c.wg('P5', 'trim', M['vc'], cm=True)
    for s_ in (-1, 1):                                                                                 # 國際會議廳的雙開木門（關著）
        x0_, x1_ = (-1.2, -0.01) if s_ < 0 else (0.01, 1.2)
        c.panel.box(x0_, x1_, 0.0, 2.4, LZ1 + 0.05, LZ1 + 0.09)
        pm.cbox(x1_ - 0.12 if s_ < 0 else x0_ + 0.06, x1_ - 0.06 if s_ < 0 else x0_ + 0.12, 0.9, 1.5, LZ1 + 0.09, LZ1 + 0.12, '#c8b07a')
    pm.cbox(-1.32, 1.32, 2.4, 2.5, LZ1 + 0.05, LZ1 + 0.1, '#5a4636'); pm.cbox(-1.32, -1.2, 0.0, 2.4, LZ1 + 0.05, LZ1 + 0.1, '#5a4636'); pm.cbox(1.2, 1.32, 0.0, 2.4, LZ1 + 0.05, LZ1 + 0.1, '#5a4636')
    c.panel.box(-7.9, -1.4, 0.12, 2.6, LZ1 + 0.05, LZ1 + 0.07); c.panel.box(1.4, 7.9, 0.12, 2.6, LZ1 + 0.05, LZ1 + 0.07)    # 會議廳南牆的木頭牆板
    p2 = c.wg('P5', 'print2', M['print2'])
    uvquad(p2, [(-1.5, 2.6, LZ1 + 0.101), (1.5, 2.6, LZ1 + 0.101), (1.5, 2.95, LZ1 + 0.101), (-1.5, 2.95, LZ1 + 0.101)], LU.uv('CONF'))
    uvquad(p2, [(2.0, 1.2, LZ1 + 0.075), (3.1, 1.2, LZ1 + 0.075), (3.1, 1.7, LZ1 + 0.075), (2.0, 1.7, LZ1 + 0.075)], LU.uv('CONFNOTE'))
    c.look('conf', 0.0, LZ1 + 0.9, 1.2, '國際會議廳', '國際會議廳的木門關著。旁邊的告示：「今天下午兩點有演講，其他時間不開放。」', dev='暫定的字；平面圖中間的國際會議廳（這一版不進去）')
    # 門牌：A 區（門廳那一面、玻璃門上方）、B 區（電梯走道那一面）、禁止使用筆電
    pa = c.wg('P1', 'print2', M['print2']); LU.tquad(pa, AX0 - 0.056, 2.74, 1.2, (-1, 0), 2.4, 0.42, 'STUDYA')
    c.vm.cbox(AX0 - 0.09, AX0 - 0.03, 1.0, 1.3, -0.3, -0.18, '#2b2f33'); LU.tquad(c.wg('P1', 'print', M['print']), AX0 - 0.091, 1.2, -0.24, (-1, 0), 0.1, 0.05, 'CARD')
    pb = c.wg('P8', 'print2', M['print2']); LU.tquad(pb, BX0 - 0.056, 2.74, -6.9, (-1, 0), 2.4, 0.42, 'STUDYB'); LU.tquad(pb, BX0 - 0.056, 1.55, -8.3, (-1, 0), 0.48, 0.48, 'NOLAP')
    c.look('study_door', AX0 - 0.9, 1.2, 0.9, '24 小時自習室 A 區', '玻璃門旁邊有一台刷卡機。門上貼著：「24 小時開放，請刷學生證進出。」', dev='暫定的字；刷卡進出由 LAWWW 接（AA_399 第 2 節）')
    c.look('studyb_door', BX0 - 0.9, -6.9, 0.9, '24 小時自習室 B 區', 'B 區的門上貼著：「本區禁止使用筆記型電腦。」裡面比 A 區更安靜。', dev='暫定的字；平面圖 B 區的「No Laptop」')
    # ---- A 區：三排長桌（靠北牆單面、中間兩排雙面）＋白色方柱；西段：服務台、一張長桌、參考書架
    TX = [-15.6, -11.4, -7.2, -0.9, 3.3]                              # 每張桌子的西端（3.9 m、三個位子）；中間 x −3.3…−0.9 是南北向的走道
    for x0 in TX:
        sx = [x0 + 0.65 + 1.3 * k for k in range(3)]
        long_desk(c, x0, x0 + 3.9, -12.55, 0.7, ('+z',), sx)
        long_desk(c, x0, x0 + 3.9, -8.9, 1.4, ('-z', '+z'), sx)
        long_desk(c, x0, x0 + 3.9, -4.9, 1.4, ('-z', '+z'), sx)
    # 排和排之間的走道：北排椅背 −11.47 ↔ 第一排北側椅背 −10.33（1.14 m）；第一排南側 −7.47 ↔ 第二排北側 −6.33（1.14 m）——東門、B 區的門開在第二條走道
    for (x, z) in ((-2.1, -10.9), (-2.1, -6.9), (-2.1, -4.9), (8.0 - 0.32, -11.0)): column(c, x, z)   # 方柱都在中間走道（2.4 m 寬，柱子兩邊各 0.9 m）
    long_desk(c, -15.2, -11.3, -0.9, 1.4, ('-z', '+z'), [-14.55, -13.25, -11.95])
    K.counter(c, -15.4, -13.0, 3.4, 4.2, h=1.0, top='wood', front='#d9d6cf', why='service_counter')    # 服務台（面向北：從 A 區正門進來在右手邊）
    LU.task_chair(c, -14.2, 4.6, PI, '#2e3440')
    uvquad(c.wg('P4', 'print2', M['print2']), [(-13.0, 2.2, LZ1 - 0.056), (-15.4, 2.2, LZ1 - 0.056), (-15.4, 2.55, LZ1 - 0.056), (-13.0, 2.55, LZ1 - 0.056)], LU.uv('SERVICE'))
    c.look('service', -14.2, 2.7, 0.9, '服務台', '服務台：借書、還書、問問題都在這裡。晚上十點以後沒有人。', dev='暫定的字；平面圖 A 區入口的服務台')
    for k in range(4):                                                                                # 參考書架（西段東牆，靠國際會議廳的西牆）
        z0_ = -2.6 + k * 1.8; c.wood.box(LX1 - 0.45, LX1 - 0.06, 0.0, 1.95, z0_, z0_ + 1.7)
        for r_ in range(5):
            y_ = 0.12 + r_ * 0.38; c.vc.cbox(LX1 - 0.43, LX1 - 0.14, y_, y_ + 0.3, z0_ + 0.06, z0_ + 1.64, ['#7a2a2a', '#2a4a6a', '#e8dcc0', '#3a5a3a', '#6a5a2a'][(k + r_) % 5])
    c.block(LX1 - 0.47, LX1, -2.6, -2.6 + 4 * 1.8, 'shelves')
    LU.board(c, 'P2', 'x', AZ1, (0, -1), -6.6, -4.2, 1.25, 1.95, 'RULE', frame='#3a5c4a')               # 使用須知（A 區南牆＝會議廳北牆）
    # ---- 電梯走道：自助借還書機兩台（靠 B 區玻璃）、還書口
    for kz in (-5.6, -4.4):
        c.vc.crbox(BX0 - 0.67, BX0 - 0.17, 0.0, 1.0, kz - 0.3, kz + 0.3, '#e4e4e0', r=0.02, seg=1)
        c.vc.cbox(BX0 - 0.62, BX0 - 0.22, 1.0, 1.06, kz - 0.26, kz + 0.26, '#cfcfcb')
        c.vc.cbox(BX0 - 0.56, BX0 - 0.52, 1.06, 1.42, kz - 0.24, kz + 0.24, '#2b2b2b'); LU.tquad(c.scr, BX0 - 0.562, 1.24, kz, (-1, 0), 0.44, 0.32, 'SCR')
        c.block(BX0 - 0.69, BX0 - 0.15, kz - 0.32, kz + 0.32, 'kiosk')
    c.look('selfcheck', BX0 - 1.5, -5.0, 1.0, '自助借還書機', '把書放上去就能借、能還。螢幕上寫著：「請放上書本」。', dev='LAWWW 接：AA_399 3-2 的借書、還書也可以在這裡（G.loans）')
    c.vc.cbox(AX1 + 0.06, AX1 + 0.1, 0.9, 1.15, -1.9, -1.1, '#3a3f45')
    uvquad(c.wg('P6', 'print', M['print']), [(AX1 + 0.101, 1.25, -1.1), (AX1 + 0.101, 1.25, -1.9), (AX1 + 0.101, 1.55, -1.9), (AX1 + 0.101, 1.55, -1.1)], LU.uv('RETURN'))
    c.look('return_slot', AX1 + 0.8, -1.5, 0.8, '還書口', '牆上的還書口，下面接著一個推車。', dev='LAWWW 接：還書（AA_399 3-2）')
    # ---- B 區（禁用筆電）：靠北牆單面一排、中間兩排雙面
    for x0 in (13.8, 18.6):                                            # 兩張 2.6 m 的桌子（每邊兩個位子），中間 x 16.4…18.6 是南北向的走道（第一次兩張 3.9 m 的桌子中間只有 0.3 m：B 區的走道接不起來）
        sx = [x0 + 0.65 + 1.3 * k for k in range(2)]
        long_desk(c, x0, x0 + 2.6, -12.55, 0.7, ('+z',), sx)
        long_desk(c, x0, x0 + 2.6, -8.9, 1.4, ('-z', '+z'), sx)
        long_desk(c, x0, x0 + 2.6, -4.9, 1.4, ('-z', '+z'), sx)
    column(c, 17.5, -2.4)
    # ---- 西門廳：置物櫃（北牆）、公告欄、飲水機、樓層指引、長椅
    for k in range(4):
        x0_ = -21.6 + k * 1.2; c.vc.cbox(x0_, x0_ + 1.15, 0.0, 1.9, Z0, Z0 + 0.45, '#d6d8d4')
        for r_ in range(4):
            for q in range(2):
                y_ = 0.08 + r_ * 0.45; xx = x0_ + 0.04 + q * 0.55; c.vc.cbox(xx, xx + 0.52, y_, y_ + 0.42, Z0 + 0.45, Z0 + 0.46, '#c4c8c4'); c.vm.cbox(xx + 0.42, xx + 0.47, y_ + 0.2, y_ + 0.24, Z0 + 0.46, Z0 + 0.475, '#5a5f63')
    c.block(-21.62, -21.6 + 4 * 1.2, Z0, Z0 + 0.48, 'lockers'); c.look('lockers', -19.2, Z0 + 1.1, 0.9, '置物櫃', '投幣式的置物櫃，一半以上鎖著。', dev='暫定的字')
    LU.board(c, 'P1', 'z', AX0, (-1, 0), -4.6, -2.4, 1.0, 2.2, 'NOTICE', frame='#6a4a30')               # 公告欄（A 區玻璃牆這一面……玻璃上的公告板：實心的板子）
    c.look('notice', AX0 - 0.9, -3.5, 0.9, '公告欄', '公告欄：期末考週自習室延長開放、討論室線上預約、影印卡加值。角落一張手寫的：「考古題讀書會招人」。', dev='暫定的字，AA 可以改')
    LU.board(c, 'P1', 'z', AX0, (-1, 0), 2.6, 4.6, 1.3, 2.3, 'DIR2', frame='#3a3f45')                    # 樓層指引（樓梯間出來看得到）
    water_station(c, -17.0, Z1 - 0.3, face='-z')
    c.wood.rbox(-21.6, -20.2, 0.43, 0.47, 4.0, 4.4, r=0.01, seg=2)
    for lx in (-21.5, -20.3): c.vm.cbox(lx - 0.025, lx + 0.025, 0.0, 0.43, 4.02, 4.38, '#5a5f63')
    c.block(-21.62, -20.18, 3.98, 4.42, 'bench')
    for k in (-0.35, 0.35): c.seat(-20.9 + k, 4.2, PI / 2, (-20.9 + k, 4.8), 'sit', ap=(-20.9 + k, 4.9), label='坐在長椅')
    plant(c, -21.4, 11.8, 1.2); plant(c, -16.6, -12.4, 1.1); plant(c, -16.6, 11.8, 1.1)
    # ---- 討論室 1、2（南走廊）
    zc1 = disc_room2(c, -3.1, DZ0, Z1, 'WB1', 'P11', -6.0 + 0.05, 1); zc2 = disc_room2(c, 3.1, DZ0, Z1, 'WB2', 'P13', 6.0 - 0.05, -1)
    p10 = c.wg('P10', 'print', M['print'])
    for (gx, key, bk) in ((-3.0, 'DISC1', 'BOOK1'), (3.0, 'DISC2', 'BOOK2')):
        LU.tquad(p10, gx, 2.86, DZ0 - 0.06, (0, -1), 1.0, 0.3, key); LU.tquad(p10, gx - 1.0, 1.55, DZ0 - 0.035, (0, -1), 0.24, 0.24, bk)
    c.look('disc1', -3.0, DZ0 - 0.8, 0.8, '討論室 1', '玻璃門上貼著這一週的預約表，週六下午那一格寫滿了。', dev='暫定的字；柏翰的考古題小組在這間（AA_399 第 2 節）')
    c.look('disc2', 3.0, DZ0 - 0.8, 0.8, '討論室 2', '玻璃門上貼著這一週的預約表。', dev='暫定的字；國考讀書會在這間（AA_399 第 2 節）')
    c.look('wb1', -3.1, Z1 - 1.0, 0.9, '白板', '白板上寫著「考古題分工」，後面幾格還空著。', dev='暫定的字')
    c.look('wb2', 3.1, Z1 - 1.0, 0.9, '白板', '白板上留著上一組寫的申論題架構，沒擦乾淨。', dev='暫定的字')
    # ---- 影印中心（東南）：櫃台、三台影印機、列印站、紙箱、價目表
    K.counter(c, 14.4, 20.4, 5.6, 6.2, h=1.0, top='wood', front='#d9d6cf', why='copy_counter')
    for x0_ in (15.0, 16.6, 18.2): LU.copier(c, x0_, x0_ + 0.9, 11.6, 12.23)
    c.vc.crbox(20.8, 21.4, 0.0, 1.2, 8.0, 8.5, '#e4e4e0', r=0.02, seg=1); c.vc.cbox(20.82, 21.38, 1.2, 1.5, 8.0, 8.04, '#2b2b2b'); LU.tquad(c.scr, 21.1, 1.35, 7.998, (0, -1), 0.5, 0.31, 'SCR'); c.block(20.78, 21.42, 7.98, 8.52, 'print_kiosk')
    for k in range(3): c.vc.cbox(21.0, 21.8, k * 0.28, 0.27 + k * 0.28, 10.0, 11.0, '#d8cfb8')
    c.block(20.98, 21.82, 9.98, 11.02, 'paper')
    uvquad(c.wg('S', 'print', M['print']), [(20.6, 1.55, Z1 - 0.016), (19.6, 1.55, Z1 - 0.016), (19.6, 2.05, Z1 - 0.016), (20.6, 2.05, Z1 - 0.016)], LU.uv('PRICE'))
    uvquad(c.wg('S', 'print', M['print']), [(18.0, 2.3, Z1 - 0.016), (16.8, 2.3, Z1 - 0.016), (16.8, 2.75, Z1 - 0.016), (18.0, 2.75, Z1 - 0.016)], LU.uv('COPY'))
    c.look('copy', 17.4, 4.6, 0.9, '影印中心', '櫃台後面貼著價目表：黑白一張一元。影印卡在這裡加值。', dev='暫定的字')
    c.look('copier', 16.0, 10.8, 0.9, '影印機', '影印機旁邊貼著：「卡紙請找櫃台，不要硬拉。」', dev='暫定的字')
    plant(c, 13.6, 12.2, 1.1)
    # ---- 日光燈（照片：一排排長條日光燈，和桌子平行）
    LT = []
    for z in (-12.0, -10.7, -9.4, -8.2, -6.9, -5.6, -4.2):
        LT += [(x, z) for x in (-14.4, -12.0, -9.6, -7.2, -4.8, -2.1, 0.6, 3.0, 5.4)] + [(x, z) for x in (14.6, 17.4, 20.2)]
    LT += [(x, z) for x in (-14.4, -11.4) for z in (-1.6, 0.8, 3.2)] + [(x, z) for x in (-20.4, -18.0) for z in (-10.0, -6.0, -2.0, 2.0, 6.0, 10.0)]
    LT += [(10.4, z) for z in (-11.0, -8.0, -5.0)] + [(x, 2.0) for x in (9.6, 12.0, 14.6, 17.4, 20.2)] + [(x, 6.2) for x in (-14.4, -11.4, -8.4, -5.4, -2.4, 0.6, 3.6, 6.6, 9.6)]
    LT += [(x, z) for x in (-3.1, 3.1) for z in (9.4, 11.6)] + [(x, z) for x in (15.0, 18.0, 21.0) for z in (8.0, 10.6)] + [(-13.0, 11.0), (9.0, 11.0)]
    for (x, z) in LT:
        c.vc.cbox(x - 0.62, x + 0.62, H - 0.02, H, z - 0.16, z + 0.16, '#f4f4f1'); c.tube.box(x - 0.58, x + 0.58, H - 0.026, H - 0.02, z - 0.12, z + 0.12)
    # ---- 出入口、配置的其他欄位
    c.spawn = dict(x=round(X0 + 1.5, 3), z=STAIR['z'], yaw=round(PI / 2, 4), note='從樓梯間進來，面向東；離樓梯間的門 1.5 m')
    c.spawn_el = dict(x=round((dx0 + dx1) / 2, 3), z=round(ez0 - 1.7, 3), yaw=PI, note='出電梯，面向北（如果電梯停 B1）')
    c.exits = []
    c.lay_extra = dict(
        rooms=[dict(id='study24', label='24 小時自習室 A 區', x0=AX0, x1=AX1, z0=Z0, z1=AZ1, door=dict(x=AX0, z=1.2, w=1.6, open=True, card=True, axis='z')),
               dict(id='study24', label='24 小時自習室 A 區（西段）', x0=AX0, x1=LX1, z0=AZ1, z1=LZ1),
               dict(id='study24', label='24 小時自習室 B 區（禁止使用筆電）', x0=BX0, x1=X1, z0=Z0, z1=BZ1, door=dict(x=BX0, z=-6.9, w=1.2, open=True, axis='z')),
               dict(id='disc1', label='討論室 1', x0=-6.0, x1=0.0, z0=DZ0, z1=Z1, door=dict(x=-3.0, z=DZ0, w=1.2, open=True)),
               dict(id='disc2', label='討論室 2', x0=0.0, x1=6.0, z0=DZ0, z1=Z1, door=dict(x=3.0, z=DZ0, w=1.2, open=True)),
               dict(id='copy', label='影印中心', x0=13.0, x1=X1, z0=BZ1, z1=Z1),
               dict(id='conf', label='國際會議廳（關著）', x0=LX1, x1=AX1, z0=AZ1, z1=LZ1),
               dict(id='lobby', label='門廳', x0=X0, x1=AX0, z0=Z0, z1=Z1)],
        spots=dict(copy_clerk=dict(x=17.4, z=6.9, yaw=PI, note='影印中心櫃台後面的工讀生（面向北、對著櫃台）'),
                   disc1_head=dict(x=-3.1, z=round(zc1 + 2.0, 3), yaw=PI, note='討論室 1：白板和桌子中間、面向桌子（柏翰講考古題；AA_399 第 2 節）'),
                   disc1_door=dict(x=-3.0, z=DZ0 + 0.8, yaw=0.0, note='討論室 1：剛進門、面向南（看到桌邊的人）'),
                   disc2_head=dict(x=3.1, z=round(zc2 + 2.0, 3), yaw=PI, note='討論室 2：白板和桌子中間、面向桌子（國考讀書會）'),
                   disc2_door=dict(x=3.0, z=DZ0 + 0.8, yaw=0.0, note='討論室 2：剛進門、面向南'),
                   study_door=dict(x=AX0 + 0.9, z=1.2, yaw=PI / 2, note='24 小時自習室 A 區：刷卡進門、面向東（看到整間）'),
                   study_night=dict(x=-0.25, z=-6.08, yaw=0.0, note='A 區最南那一排雙面長桌北側、靠中間走道的位子（期末前的夜，偶遇柏翰；AA_399 第 2 節）＝seats 裡同一個位子（kind study）：要讓 NPC 坐就用那個 seat'),
                   selfcheck=dict(x=BX0 - 1.4, z=-5.0, yaw=-PI / 2, note='自助借還書機前、面向東（interact id selfcheck）'),
                   stairs_door=dict(x=round(X0 + 1.5, 3), z=STAIR['z'], yaw=PI / 2, note='樓梯間的門前 1.5 m、面向東（＝spawn；從 1F 走樓梯下來站在這裡）')),
        nodes={'GLOW_l118_warm': '綠色檯燈燈罩下面亮的那一片（整層一個網格）', 'GLOW_library_b1_courtsky': '中庭上面的天光（白天亮）'})


def finish(c):
    D = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}
    for k, ms in c.WG.items():
        for key, m in ms.items():
            uv = key in ('wall', 'wain', 'door'); mg = key not in ('print', 'screen', 'view', 'glass', 'frost')
            m.finish(c.root, props=dict({'dir': D.get(k) or c.PDIR[k]}, **c.WGP.get(k, {})), uv=uv, merge=mg)
    for m in (c.vc, c.vm, c.tube, c.warm, c.fridgel, c.steel, c.shade): m.finish(c.root, uv=False)
    c.wood.finish(c.root)
    for m in (c.prt, c.scr, c.prt2): m.finish(c.root, uv=False, merge=False)
    c.colm.finish(c.root); c.panel.finish(c.root)
    for m in c.extra.values(): m.finish(c.root, uv=False)
    for m in getattr(c, 'court_meshes', []): m.finish(c.root, uv=False, merge=False, smooth=(m.name.endswith('_core')))
    make_instances(c)
    desk_items(c)
    L.merge_by_material(c.root, keep=lambda ob: ob.name.startswith('WALL_') or ob.name.startswith('INST_'), key=lambda ob: '')
    out = os.path.join(OUTDIR, f'{c.sid}.glb'); st = L.export(out, gpu_instances=True)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    lay = dict(version=2, zone=c.sid, name=c.T['name'], label=c.T['sub'], src='第二版：使用者 11-02 平面圖、10-17 兩張自習室照片（LIB-INTERIOR-1102，LAWWW2）；第一版：使用者 D46、10-23；AA_399 第 2 節（AA-B）；CLOSED-SPACES-1023（LAWWW2-B）',
               bounds=dict(x0=c.X0, x1=c.X1, z0=c.Z0, z1=c.Z1), h=H, cam_dist=5.2, coords='和 library_layout.js 同一套（x、z），B1 地板 y＝0',
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
    make_tex(); make_tex2(); c = B1(); build2(c); p = finish(c); print('LIBRARY_B1', 'OK' if not p else p)
