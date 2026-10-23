"""總圖研究小間（2F 東側）＋5F 書庫（CLOSED-SPACES-1023 第 3 項；AA_399 第 3 節，AA-B；使用者 10-23「遊戲裡任何現在關起來的空間都可以開始開發」）
→ assets/models/env/second_ai/library_carrels.glb、library_stacks.glb＋各自的 .layout.json。LAWWW2-B 2026-10-23；Blender 5.2：
  /opt/blenv/bin/python tools/blender/env_second/library_upper.py [-- --part carrels|stacks|all] [--out-dir …] [--js <repo 根目錄>（順便寫 src/data/library_upper_layouts.js）]
書背圖集先跑 python3 tools/blender/env_second/lib5f_atlas.py（5F 書庫的書：照類號分組）。

研究小間（區域 library_carrels）：從總圖大廳二樓東牆那扇「研究小間」的門進來（library_layout.js 的 doors carrels）。
  x −8.6…8.6、z −3.6…3.6、高 3.0；西端門廳（大廳的門、使用須知、預約表）→ 中間一條走廊、兩側各五間研究小間（北 01～05、南 06～10，每間 2.4 m 寬）→ 東端閱讀角（窗、兩張單人沙發）。
  每間：靠外牆一張長桌、書架板、檯燈、辦公椅、掛勾、軟木小板；外牆高處一條霧面窗（白天亮、晚上暗：材質 CARREL_SKY，遊戲照時段調）。
  門：鋁框霧面玻璃門，門上一塊透明的小窗（AA_399 3-1「玻璃門上有小窗」）；門牌在門的右邊。門都關著，只有 08（玩家預約的那一間）有開著的版本：
    節點 CARREL08_DOOR_SHUT／CARREL08_DOOR_OPEN（遊戲照「今天有沒有預約」二選一；導航用配置 carrels[].door 擋住關著的門）。
  學姊的研究小間 03（北排中間，和 08 隔著走廊正對面）：SIS_CARREL_*（她的東西：筆電、論文影印稿、書、計畫本、保溫瓶、便利貼；她不在的時期遊戲可以藏）、
    SIS_CARREL_LAMP（她的檯燈，在的時候亮）、STICKY_SIS（貼在小窗裡面的黃色便利貼，敲玻璃以後遊戲才顯示；字由對話框顯示，紙上只有筆跡）。
5F 書庫（區域 library_stacks）：搭電梯（大廳、3F 閱覽區的電梯都多一個「5F 書庫」；4F、6F 照舊「整理中」）。
  x −12…12、z −9…9、高 3.2（和總圖大廳同一套座標；電梯井同一個位置 x 9.4…11.4、z −2.6…−0.4，門朝北：遊戲 B3.buildElevator 畫的玻璃電梯，模型這裡空著）。
  十排雙面鋼製書架（R1 最裡面～R10 靠電梯，照中國圖書分類法 300 科學總論…380 動物、R1 期刊合訂本），中間一條橫向走道把每一排分成北、南兩段；
  最裡面靠西牆一排單面的參考書（大開本的圖鑑、手冊、辭典：「參考書　不外借」）——方奕廷找的植物圖鑑在這一排（AA_399 3-3；needed_msgs「總圖五樓最裡面。」）。
  南牆一排窗（面向椰林大道，窗外的景是遊戲裡拍的 library_stacks），窗下的閱覽桌可以坐；電梯前：樓層牌、館藏查詢電腦、還書車、樓梯間的門（鎖著）。
  書：一層書架的一個開間做成一個「書模組」（一段一段同一類的書，書背圖集 lib5f_books.png），整層用 GPU instancing（EXT_mesh_gpu_instancing）。
地板：研究小間淺灰藍地毯（Poly Haven dirty_carpet 調色）、書庫淺色塑膠地磚（linoleum_brown 調淺）；沒有深色木地板（使用者 10-23）。
真實性：沒有照片或平面圖，是遊戲化設計（D43）；總圖外觀是四層樓，5F 書庫照劇情（AA_399、方奕廷的訊息「總圖五樓」）放在 5F，不改外觀。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lane118_shops as K   # noqa: E402
import linze_upper as LU    # noqa: E402  隔間牆、印刷品、辦公椅、檯燈、書、影印稿
from lane118_shops import L, B, Mesh, CMesh, bpy, uvquad, img_mat, rot, rbox, ccyl, csph, clathe, plant, water_station, navcheck, chair, auto_ap   # noqa: E402
from lib2 import g2b, bmesh   # noqa: E402
from PIL import Image, ImageDraw, ImageFont   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUTDIR = os.path.join(L.ROOT, arg('--out-dir', 'assets/models/env/second_ai'))
GEN = K.GEN; PI = math.pi
src = open(os.path.join(L.ROOT, 'src/data/library_layout.js'), encoding='utf-8').read()
LL = json.loads(src[src.index('{', src.index('const LIBRARY_LAYOUT=')):src.rindex('}') + 1])
EL = LL['elevator']
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
H = 3.0


def F(n): return ImageFont.truetype(CJK, n)


def ctext(d, cx, y, t, f, fill):
    w = d.textlength(t, font=f); d.text((cx - w / 2, y), t, font=f, fill=fill)


# ================= 研究小間：配置的數字 =================
CX0, CX1, CZ0, CZ1 = -8.6, 8.6, -3.6, 3.6          # 範圍（room() 置中：牆在 ±8.6、±3.6）
CW = 2.4; CXS = [-6.0 + CW * k for k in range(6)]  # 研究小間的分間牆 x（導航格的格心：−8.4＋0.4n）
FZ = 1.4                                           # 走廊兩側的前牆 z＝±1.4（走廊淨寬 2.7 m）
DOOR = (0.3, 1.3)                                  # 門洞在每一間的 xa＋0.3～xa＋1.3（1.0 m 寬；導航開口＝xa＋0.4、0.8、1.2 三格）
SIS, MINE = '03', '08'                             # 學姊的、玩家預約的
HALL_DOOR = dict(x=CX0, z=0.0, w=1.5)              # 西牆：回大廳二樓的門（大廳那一面是 library_layout.js doors carrels：x 11.8、z 5.6）
CWIN = dict(wall='right', xs=[0.0], y=1.65, w=2.4, h=1.8, note='遊戲 room() 的窗：winWall right（東牆，t＝−z）、winXs、winY、winW、winH；窗外的景 library_carrels')
REGC = {f'PLATE{n:02d}': ((n - 1) % 2 * 256, (n - 1) // 2 * 64, (n - 1) % 2 * 256 + 256, (n - 1) // 2 * 64 + 64) for n in range(1, 11)}
REGC.update({'SIGN': (512, 0, 1024, 128), 'RULE': (512, 128, 1024, 416), 'BOOKING': (0, 320, 512, 608), 'STICKY': (512, 416, 640, 544),
             'LAPTOP': (640, 416, 896, 576), 'CORK': (0, 608, 256, 800), 'PAPER': (256, 608, 512, 864), 'HALL': (512, 576, 1024, 672),
             'EXIT': (896, 416, 1024, 480), 'DIR': (512, 672, 1024, 768), 'NOTE2': (640, 544, 768, 576), 'CLOCK': (768, 768, 1024, 1024)})


def make_tex_carrels():
    """研究小間的印刷品貼圖集（library_carrels_print.png）：十塊門牌、入口牌、使用須知、預約表、便利貼、筆電畫面、軟木小板、影印稿、往大廳的牌子、出口標示、指引"""
    R = REGC; im = Image.new('RGB', (1024, 1024), '#808080'); d = ImageDraw.Draw(im); rr = random.Random(303)
    for n in range(1, 11):
        x0, y0, x1, y1 = R[f'PLATE{n:02d}']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(58, 62, 66)); d.rectangle([x0 + 4, y0 + 4, x1 - 5, y1 - 5], outline=(150, 154, 158))
        d.text((x0 + 18, y0 + 12), '研究小間', font=F(30), fill=(236, 236, 230)); d.text((x0 + 160, y0 + 6), f'{n:02d}', font=F(46), fill=(250, 250, 246))
    x0, y0, x1, y1 = R['SIGN']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(36, 48, 58)); d.text((x0 + 30, y0 + 18), '研究小間', font=F(64), fill=(243, 239, 228)); d.text((x0 + 330, y0 + 30), '01–10', font=F(48), fill=(200, 210, 214))
    x0, y0, x1, y1 = R['RULE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 248, 242)); d.rectangle([x0, y0, x1 - 1, y0 + 64], fill=(36, 48, 58))
    ctext(d, (x0 + x1) / 2, y0 + 12, '研究小間使用須知', F(40), (255, 255, 255))
    for k, ln in enumerate(['請到 1F 服務台預約（大四以上、研究生）', '一次三小時，一天一次', '請保持安靜，手機請轉靜音', '離開時請關燈、帶走個人物品', '長期使用（研究生）另依規定辦理']):
        d.text((x0 + 26, y0 + 84 + k * 40), '・' + ln, font=F(26), fill=(50, 50, 46))
    x0, y0, x1, y1 = R['BOOKING']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(252, 252, 250)); ctext(d, (x0 + x1) / 2, y0 + 8, '本週預約', F(30), (40, 40, 40))
    cols = ['9–12', '12–15', '15–18', '18–21']; cw = 100; rh = 22
    for j, t in enumerate(cols): d.text((x0 + 90 + j * cw, y0 + 48), t, font=F(18), fill=(90, 90, 90))
    for i in range(10):
        yy = y0 + 72 + i * rh; d.line([x0 + 10, yy, x1 - 10, yy], fill=(200, 200, 200)); d.text((x0 + 20, yy + 2), f'{i + 1:02d}', font=F(17), fill=(60, 60, 60))
        for j in range(4):
            if (i + 1 == 3 and j == 2) or rr.random() < 0.45: d.rectangle([x0 + 88 + j * cw, yy + 4, x0 + 88 + j * cw + rr.randint(50, 92), yy + rh - 4], fill=(70, 110, 160) if not (i + 1 == 3) else (60, 120, 80))
    x0, y0, x1, y1 = R['STICKY']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 226, 92)); d.rectangle([x0, y0, x1 - 1, y0 + 16], fill=(240, 212, 70))
    for k in range(3):   # 筆跡（不是字：字由遊戲的對話框顯示）
        yy = y0 + 38 + k * 26; pts = [(x0 + 16 + i * 8, yy + rr.randint(-5, 5)) for i in range(12 - k * 3)]; d.line(pts, fill=(40, 50, 90), width=3)
    x0, y0, x1, y1 = R['NOTE2']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 226, 92))
    x0, y0, x1, y1 = R['LAPTOP']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(244, 245, 247)); d.rectangle([x0, y0, x1 - 1, y0 + 14], fill=(60, 90, 140))
    d.rectangle([x0 + 40, y0 + 26, x0 + 200, y0 + 34], fill=(60, 60, 60))
    for k in range(9): d.rectangle([x0 + 24, y0 + 46 + k * 11, x0 + 24 + rr.randint(150, 208), y0 + 49 + k * 11], fill=(150, 150, 150))
    x0, y0, x1, y1 = R['CORK']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(176, 132, 88))
    for k, col in enumerate([(250, 250, 250), (250, 226, 92), (210, 232, 246), (250, 214, 214)]):
        px, py = x0 + 14 + (k % 2) * 118, y0 + 12 + (k // 2) * 90; d.rectangle([px, py, px + 104, py + 76], fill=col); d.ellipse([px + 46, py + 3, px + 58, py + 15], fill=(200, 40, 40))
        for j in range(3): d.line([px + 10, py + 28 + j * 14, px + 10 + rr.randint(40, 84), py + 28 + j * 14], fill=(120, 120, 120), width=2)
    x0, y0, x1, y1 = R['PAPER']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(246, 245, 240)); d.rectangle([x0 + 70, y0 + 22, x0 + 186, y0 + 30], fill=(70, 70, 70))
    for k in range(17): d.rectangle([x0 + 22, y0 + 46 + k * 11, x0 + 22 + rr.randint(150, 212), y0 + 49 + k * 11], fill=(150, 150, 150))
    for k in range(3): d.rectangle([x0 + 22, y0 + 238 - k * 6, x0 + 22 + rr.randint(90, 180), y0 + 239 - k * 6], fill=(170, 170, 170))
    x0, y0, x1, y1 = R['HALL']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(47, 93, 80)); d.text((x0 + 24, y0 + 22), '出口　2F 自習區・電梯', font=F(46), fill=(255, 255, 255))
    x0, y0, x1, y1 = R['EXIT']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(31, 154, 74)); d.rectangle([x0 + 76, y0 + 10, x0 + 112, y0 + 56], outline=(255, 255, 255), width=4)
    d.ellipse([x0 + 44, y0 + 8, x0 + 56, y0 + 20], fill=(255, 255, 255)); d.line([x0 + 49, y0 + 22, x0 + 42, y0 + 38], fill=(255, 255, 255), width=7); d.line([x0 + 42, y0 + 38, x0 + 56, y0 + 46], fill=(255, 255, 255), width=6); d.line([x0 + 42, y0 + 38, x0 + 32, y0 + 48], fill=(255, 255, 255), width=6)
    x0, y0, x1, y1 = R['DIR']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(36, 48, 58)); d.text((x0 + 24, y0 + 22), '01–05 北側　06–10 南側　→', font=F(40), fill=(236, 236, 230))
    x0, y0, x1, y1 = R['CLOCK']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(246, 246, 242))
    im.save(os.path.join(GEN, 'library_carrels_print.png'))


# ================= 5F 書庫：配置的數字 =================
SX0, SX1, SZ0, SZ1 = -12.0, 12.0, -9.0, 9.0
HS = 3.2
RANGES = [-10.2 + 1.6 * i for i in range(10)]     # R1（最裡面）…R10（靠電梯）：導航一格（格心 −11.8＋0.4n）
BANKS = [(-7.4, -1.4), (-0.2, 5.4)]               # 北段、南段（中間一條橫向走道 z −1.4…−0.2）
RCLS = ['J', '380', '370', '360', '350', '340', '330', '320', '310', '300']   # R1…R10 的類（R1＝期刊合訂本）
CLSNAME = {'300': '科學總論', '310': '數學', '320': '天文', '330': '物理', '340': '化學', '350': '地球科學', '360': '生物', '370': '植物', '380': '動物', 'J': '期刊合訂本', 'REF': '參考書'}
SWINX = [-9.0, -5.4, -1.8, 1.8, 5.4, 9.0]         # 南牆的窗（中心 x；room() 的 front 牆 x 是反的，遊戲端自己反）
SWIN = dict(wall='front', xs=SWINX, y=1.85, w=2.2, h=1.6)
FANG_Z = -4.4                                     # 方奕廷站的 z（西牆參考書那一排、北段第四個開間的中心）
LEVELS = [0.12, 0.44, 0.76, 1.08, 1.40, 1.72]     # 書架的層板（上面放書）；頂板 2.1
SHH, SHD, BAY = 2.1, 0.56, 0.92                   # 書架高、雙面的總深、一個開間寬
REGS = {('END_' + k): ((i % 4) * 256, (i // 4) * 128, (i % 4) * 256 + 256, (i // 4) * 128 + 128) for i, k in enumerate(['300', '310', '320', '330', '340', '350', '360', '370', '380', 'J', 'REF'])}
REGS.update({'FLOOR': (0, 384, 512, 544), 'DIRB': (512, 384, 1024, 704), 'RULE': (0, 544, 512, 800), 'STAIR': (0, 800, 256, 896), 'OPAC': (256, 800, 512, 960),
             'REF': (512, 704, 768, 768), 'EXIT': (768, 704, 896, 768), 'PAPER': (512, 768, 768, 1024), 'QUIET': (768, 768, 1024, 832), 'SFLOOR': (768, 832, 1024, 960),
             'CART': (896, 704, 1024, 768), 'STICK': (0, 896, 256, 960)})


def make_tex_stacks():
    """書庫的印刷品貼圖集（library_stacks_print.png）：書架端板的類號牌（11 塊）、5F 樓層牌、樓層配置圖、使用須知、樓梯間、館藏查詢畫面、「參考書　不外借」、出口、影印稿、請保持安靜、電梯前的 5F"""
    R = REGS; im = Image.new('RGB', (1024, 1024), '#808080'); d = ImageDraw.Draw(im); rr = random.Random(505)
    for i, k in enumerate(['300', '310', '320', '330', '340', '350', '360', '370', '380', 'J', 'REF']):
        x0, y0, x1, y1 = R['END_' + k]; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(244, 242, 234)); d.rectangle([x0 + 3, y0 + 3, x1 - 4, y1 - 4], outline=(60, 70, 80), width=3)
        big = {'J': '305', 'REF': '參考'}.get(k, k); sub = CLSNAME[k]; rng_ = {'J': '期刊', 'REF': '不外借'}[k] if k in ('J', 'REF') else f'{k}–{int(k) + 9}'
        d.text((x0 + 16, y0 + 10), big, font=F(56 if k != 'REF' else 50), fill=(36, 48, 58)); d.text((x0 + 140, y0 + 18), sub, font=F(34 if len(sub) < 4 else 26), fill=(36, 48, 58))
        d.rectangle([x0 + 10, y0 + 82, x1 - 11, y0 + 84], fill=(160, 166, 170)); d.text((x0 + 18, y0 + 90), rng_, font=F(26), fill=(90, 96, 100))
        rn = 'R' + str(10 - ['300', '310', '320', '330', '340', '350', '360', '370', '380', 'J'].index(k)) if k != 'REF' else '西牆'
        d.text((x0 + 170, y0 + 90), rn, font=F(26), fill=(90, 96, 100))
    x0, y0, x1, y1 = R['FLOOR']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(36, 48, 58)); d.text((x0 + 26, y0 + 14), '5F', font=F(110), fill=(243, 239, 228))
    d.text((x0 + 200, y0 + 26), '書庫', font=F(52), fill=(243, 239, 228)); d.text((x0 + 200, y0 + 96), '自然科學 300–389', font=F(32), fill=(200, 210, 214))
    x0, y0, x1, y1 = R['DIRB']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 248, 242)); d.rectangle([x0, y0, x1 - 1, y0 + 50], fill=(36, 48, 58)); d.text((x0 + 20, y0 + 8), '5F 書庫　配置圖', font=F(32), fill=(255, 255, 255))
    for i in range(10):   # 十排書架（左＝西＝最裡面）
        xx = x0 + 34 + i * 30; d.rectangle([xx, y0 + 70, xx + 12, y0 + 160], fill=(150, 160, 170)); d.rectangle([xx, y0 + 176, xx + 12, y0 + 250], fill=(150, 160, 170))
        d.text((xx - 4, y0 + 256), f'R{i + 1}', font=F(13), fill=(60, 60, 60))
    d.rectangle([x0 + 10, y0 + 64, x0 + 20, y0 + 250], fill=(120, 150, 120)); d.rectangle([x0 + 360, y0 + 120, x0 + 400, y0 + 160], fill=(80, 140, 200)); d.text((x0 + 404, y0 + 128), '電梯', font=F(18), fill=(40, 40, 40))
    d.ellipse([x0 + 372, y0 + 92, x0 + 386, y0 + 106], fill=(220, 50, 50)); d.text((x0 + 392, y0 + 88), '你在這裡', font=F(16), fill=(200, 40, 40))
    for k, ln in enumerate(['R1 期刊合訂本　R2 380 動物　R3 370 植物', 'R4 360 生物　R5 350 地科　R6 340 化學', 'R7 330 物理　R8 320 天文　R9 310 數學　R10 300']):
        d.text((x0 + 14, y0 + 276 + k * 0 + (k - 2) * 0), '', font=F(10), fill=(0, 0, 0))
    d.text((x0 + 22, y0 + 278), '最裡面靠牆：參考書（不外借）', font=F(18), fill=(60, 90, 60))
    x0, y0, x1, y1 = R['RULE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 248, 242)); d.rectangle([x0, y0, x1 - 1, y0 + 60], fill=(36, 48, 58))
    ctext(d, (x0 + x1) / 2, y0 + 10, '書庫使用須知', F(40), (255, 255, 255))
    for k, ln in enumerate(['書架之間請不要奔跑', '取下的書請放還書車，不要自己歸架', '參考書、期刊不外借', '借書請到 1F 服務台或 B1 自助借還', '書庫燈光有定時，請隨手按亮']):
        d.text((x0 + 22, y0 + 76 + k * 34), '・' + ln, font=F(23), fill=(50, 50, 46))
    x0, y0, x1, y1 = R['STAIR']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(47, 93, 80)); d.text((x0 + 14, y0 + 12), '樓梯間', font=F(36), fill=(255, 255, 255)); d.text((x0 + 14, y0 + 58), '4F・6F 整理中', font=F(24), fill=(220, 236, 228))
    x0, y0, x1, y1 = R['OPAC']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(240, 244, 248)); d.rectangle([x0, y0, x1 - 1, y0 + 26], fill=(40, 80, 130)); d.text((x0 + 10, y0 + 2), '館藏查詢', font=F(20), fill=(255, 255, 255))
    d.rectangle([x0 + 16, y0 + 40, x1 - 60, y0 + 62], outline=(120, 130, 140), width=2); d.rectangle([x1 - 54, y0 + 40, x1 - 16, y0 + 62], fill=(60, 120, 190))
    for k in range(5): d.rectangle([x0 + 16, y0 + 78 + k * 15, x0 + 16 + rr.randint(110, 210), y0 + 84 + k * 15], fill=(150, 156, 162))
    x0, y0, x1, y1 = R['REF']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(170, 40, 36)); ctext(d, (x0 + x1) / 2, y0 + 12, '參考書　不外借', F(34), (255, 255, 255))
    x0, y0, x1, y1 = R['EXIT']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(31, 154, 74)); d.rectangle([x0 + 76, y0 + 10, x0 + 112, y0 + 56], outline=(255, 255, 255), width=4)
    d.ellipse([x0 + 44, y0 + 8, x0 + 56, y0 + 20], fill=(255, 255, 255)); d.line([x0 + 49, y0 + 22, x0 + 42, y0 + 38], fill=(255, 255, 255), width=7); d.line([x0 + 42, y0 + 38, x0 + 56, y0 + 46], fill=(255, 255, 255), width=6); d.line([x0 + 42, y0 + 38, x0 + 32, y0 + 48], fill=(255, 255, 255), width=6)
    x0, y0, x1, y1 = R['PAPER']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(246, 245, 240))
    for k in range(18): d.rectangle([x0 + 22, y0 + 30 + k * 12, x0 + 22 + rr.randint(150, 212), y0 + 33 + k * 12], fill=(150, 150, 150))
    x0, y0, x1, y1 = R['QUIET']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(239, 233, 220)); ctext(d, (x0 + x1) / 2, y0 + 12, '請保持安靜', F(34), (42, 42, 42))
    x0, y0, x1, y1 = R['SFLOOR']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(36, 48, 58)); d.text((x0 + 20, y0 + 6), '5F', font=F(96), fill=(243, 239, 228)); d.text((x0 + 150, y0 + 40), '書庫', font=F(40), fill=(220, 224, 226))
    x0, y0, x1, y1 = R['CART']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 250, 246)); ctext(d, (x0 + x1) / 2, y0 + 16, '還書車', F(30), (40, 40, 40))
    x0, y0, x1, y1 = R['STICK']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 248, 240)); d.text((x0 + 10, y0 + 12), '燈光定時　請按這裡', font=F(24), fill=(60, 60, 60))
    im.save(os.path.join(GEN, 'library_stacks_print.png'))


class Up(K.Shop):
    """一層的建造狀態（沿用 Shop 的累積網格、配置；不跑 Shop.__init__）"""
    def __init__(self, sid, name, sub, bounds, h, floor, reg, print_png):
        self.sid = sid; self.T = {'name': name, 'sub': sub}; LU.CUR['reg'] = reg; LU.H = h; K.H = h
        self.S = dict(trim='#5a5f63', wainH=0.12); self.FD = {}
        self.X0, self.X1, self.Z0, self.Z1 = bounds; self.W, self.D = self.X1 - self.X0, self.Z1 - self.Z0
        self.rng = random.Random(sum(map(ord, sid)) * 31); self.extra = {}
        B.reset(texres=512); L._SMALL.clear()   # 同一個 Blender 跑兩層：reset 以後 lib2 縮小貼圖的快取指到已經刪掉的圖
        self.root = B.group(sid, props={'kind': sid, 'layout': f'{sid}.layout.json'})
        self.blocks, self.seats, self.inter = [], [], []; self.clerk = self.order = self.counter = None
        self.M = M = {
            'floor': floor,
            'wall': L.pbr(f'{sid}_wall', 'painted_plaster_wall', tile=2.0, target='#ecebe6', contrast=0.3, normal=0.1, maps=('diff', 'nor'), res=256, rough_value=0.85),
            'wain': L.pbr(f'{sid}_base', 'granite_tile_03', tile=1.2, target='#8a8680', contrast=0.8, normal=0.3, maps=('diff', 'nor'), res=256, rough_value=0.3),
            'wood': L.pbr(f'{sid}_wood', 'wood_table_001', tile=0.9, target='#c4a074', contrast=0.8, normal=0.25, maps=('diff', 'nor'), res=256, rough_value=0.4),
            'vc': L.vc_material(f'{sid}_vc', rough=0.6), 'vcm': L.vc_metal(f'{sid}_vcmetal', rough=0.32, metal=0.4),
            'steel': L.flat('l118_steel', '#b9bec2', rough=0.28, metal=0.45),
            'glass': L.flat('l118_glass', '#dfe9ec', rough=0.05, alpha=0.16),
            'frost': L.flat(f'{sid}_frost', '#f2f4f4', rough=0.4, alpha=0.7),
            'tube': L.flat('GLOW_l118_tube', '#ffffff', rough=0.3, emit=B.srgb('#f2f6ff')),
            'warm': L.flat('GLOW_l118_warm', '#ffe7c2', rough=0.4, emit=B.srgb('#ffc77a')),
            'fridge': L.flat('GLOW_l118_fridge', '#f4f8ff', rough=0.3, emit=B.srgb('#cfe0f4')),
            'ceil': L.pbr(f'{sid}_ceiling', 'ceiling_interior', tile=1.2, target='#eeeeea', contrast=0.6, normal=0.2, maps=('diff', 'nor'), res=256, rough_value=0.9, cull=True),
            'print': img_mat(f'{sid}_print', print_png, rough=0.55),
            'screen': img_mat(f'GLOW_{sid}_screens', print_png, rough=0.3, emit=0.9),
        }
        self.vc = CMesh(f'{sid}_props', M['vc']); self.vm = CMesh(f'{sid}_metal', M['vcm'])
        self.wood = Mesh(f'{sid}_woodparts', M['wood']); self.steel = Mesh(f'{sid}_steel', M['steel'])
        self.tube = Mesh(f'{sid}_tubes', M['tube']); self.warm = Mesh(f'{sid}_warm', M['warm']); self.fridgel = Mesh(f'{sid}_fridgelight', M['fridge'])
        self.prt = Mesh(f'{sid}_prints', M['print']); self.scr = Mesh(f'{sid}_screens', M['screen'])
        self.WG = {k: {} for k in 'NWES'}; self.WGP = {}; self.PDIR = {}; self.lay_extra = {}; self.nodes = {}

    def node(self, name, mat, cm=False):
        """要單獨開關的網格（遊戲用名字找）：不和別的東西合併"""
        if name not in self.nodes: self.nodes[name] = (CMesh if cm else Mesh)(name, mat)
        return self.nodes[name]


def door_leaf(m_frame, m_frost, m_glass, xa, xb, z, t, win, y0=0.02, y1=2.12):
    """鋁框霧面玻璃門片（沿 x、在 z 那一面，厚 t）：win＝透明小窗 (wx0, wx1, wy0, wy1)；框 4 cm"""
    m_frame.cbox(xa, xa + 0.04, y0, y1, z - t / 2, z + t / 2, '#a9aeb2'); m_frame.cbox(xb - 0.04, xb, y0, y1, z - t / 2, z + t / 2, '#a9aeb2')
    m_frame.cbox(xa, xb, y0, y0 + 0.1, z - t / 2, z + t / 2, '#a9aeb2'); m_frame.cbox(xa, xb, y1 - 0.04, y1, z - t / 2, z + t / 2, '#a9aeb2')
    wx0, wx1, wy0, wy1 = win
    m_frame.cbox(wx0 - 0.02, wx1 + 0.02, wy0 - 0.02, wy0, z - t / 2, z + t / 2, '#a9aeb2'); m_frame.cbox(wx0 - 0.02, wx1 + 0.02, wy1, wy1 + 0.02, z - t / 2, z + t / 2, '#a9aeb2')
    m_frame.cbox(wx0 - 0.02, wx0, wy0, wy1, z - t / 2, z + t / 2, '#a9aeb2'); m_frame.cbox(wx1, wx1 + 0.02, wy0, wy1, z - t / 2, z + t / 2, '#a9aeb2')
    a, b, ya, yb = xa + 0.04, xb - 0.04, y0 + 0.1, y1 - 0.04
    def Q(m, x0, x1, y0_, y1_):
        if x1 - x0 < 1e-3 or y1_ - y0_ < 1e-3: return
        m.quad([(x0, y0_, z), (x1, y0_, z), (x1, y1_, z), (x0, y1_, z)]); m.quad([(x1, y0_, z), (x0, y0_, z), (x0, y1_, z), (x1, y1_, z)])
    Q(m_frost, a, wx0 - 0.02, ya, yb); Q(m_frost, wx1 + 0.02, b, ya, yb); Q(m_frost, wx0 - 0.02, wx1 + 0.02, ya, wy0 - 0.02); Q(m_frost, wx0 - 0.02, wx1 + 0.02, wy1 + 0.02, yb)
    Q(m_glass, wx0, wx1, wy0, wy1)


# ================= 研究小間 =================
def carrel(c, k, row):
    """一間研究小間：row＝'N'（z −3.6…−1.4，門在 z −1.4）或 'S'；k＝0…4（西→東）。回傳編號"""
    xa, xb = CXS[k], CXS[k + 1]; s = -1 if row == 'N' else 1; num = f'{k + 1 if row == "N" else k + 6:02d}'
    zf, zb = s * FZ, s * CZ1                      # 前牆（走廊那一面）、外牆
    M = c.M; mine, sis = num == MINE, num == SIS
    # 前牆（隔間牆＋門洞；鏡頭和玩家在兩邊才淡出）
    da, db = xa + DOOR[0], xa + DOOR[1]
    key = 'PN' if row == 'N' else 'PS'
    if key not in c.WG: c.WG[key] = {}; c.PDIR[key] = [0, 0, 1] if row == 'N' else [0, 0, -1]; c.WGP[key] = {'partition': 1}   # 前牆：隔間牆（鏡頭和玩家在兩邊才淡出；dir＝走廊那一側）
    pw = c.wg(key, 'wall', M['wall']); pn = c.wg(key, 'wain', M['wain']); tr = c.wg(key, 'trim', M['vc'], cm=True)
    for (a, b) in ((xa + 0.05, da), (db, xb - 0.05)):
        pw.box(a, b, 0.12, H, zf - 0.05, zf + 0.05); pn.box(a, b, 0.0, 0.12, zf - 0.056, zf + 0.056)
    pw.box(da, db, 2.2, H, zf - 0.05, zf + 0.05)
    for (a, b) in ((da - 0.06, da), (db, db + 0.06)): tr.cbox(a, b, 0.0, 2.2, zf - 0.065, zf + 0.065, '#9aa0a4')
    tr.cbox(da - 0.06, db + 0.06, 2.14, 2.2, zf - 0.065, zf + 0.065, '#9aa0a4')
    c.block(xa, da, zf - 0.05, zf + 0.05, 'carrel_front'); c.block(db, xb, zf - 0.05, zf + 0.05, 'carrel_front')
    LU.plate(c, key, 'x', zf, (0, -s), db + 0.18, db + 0.58, 1.48, 1.58, f'PLATE{num}')   # 門牌：門的右手邊（從走廊看）
    win = (da + 0.52, da + 0.84, 1.22, 1.84)                                                    # 透明小窗（靠門把那一側、眼睛的高度）
    if mine:
        shut = c.node('CARREL08_DOOR_SHUT', M['vcm'], cm=True); shut_f = c.node('CARREL08_DOOR_SHUT_frost', M['frost']); shut_g = c.node('CARREL08_DOOR_SHUT_glass', M['glass'])
        door_leaf(shut, shut_f, shut_g, da + 0.02, db - 0.02, zf, 0.04, win)
        shut.cbox(db - 0.16, db - 0.06, 1.0, 1.03, zf - s * 0.06, zf - s * 0.02, '#c9ced2')
        op = c.node('CARREL08_DOOR_OPEN', M['vcm'], cm=True); op_f = c.node('CARREL08_DOOR_OPEN_frost', M['frost']); op_g = c.node('CARREL08_DOOR_OPEN_glass', M['glass'])
        # 開著：門片轉 90°，靠在門洞西側、往研究小間裡面（鉸鍊在 da）：沿 z 的門片，用 x↔z 對調的一扇門
        L_ = db - da - 0.04; za, zb_ = sorted((zf + s * 0.02, zf + s * (0.02 + L_)))
        op.cbox(da + 0.02, da + 0.06, 0.02, 2.12, za, zb_, '#a9aeb2')
        fx = da + 0.04; op_f.quad([(fx, 0.12, za + 0.04), (fx, 0.12, zb_ - 0.04), (fx, 2.08, zb_ - 0.04), (fx, 2.08, za + 0.04)]); op_f.quad([(fx + 0.001, 0.12, zb_ - 0.04), (fx + 0.001, 0.12, za + 0.04), (fx + 0.001, 2.08, za + 0.04), (fx + 0.001, 2.08, zb_ - 0.04)])
        c.lay_extra.setdefault('door_block', {})[num] = dict(x0=round(da, 3), x1=round(db, 3), z0=round(zf - 0.05, 3), z1=round(zf + 0.05, 3))
    else:
        fr = c.wg(key, 'doorframe', M['vcm'], cm=True); fs = c.wg(key, 'frost', M['frost']); gl = c.wg(key, 'glass', M['glass'])
        door_leaf(fr, fs, gl, da + 0.02, db - 0.02, zf, 0.04, win)
        fr.cbox(db - 0.16, db - 0.06, 1.0, 1.03, zf - s * 0.06, zf - s * 0.02, '#c9ced2'); fr.cbox(db - 0.16, db - 0.06, 1.0, 1.03, zf + s * 0.02, zf + s * 0.06, '#c9ced2')
        c.block(da, db, zf - 0.05, zf + 0.05, 'carrel_door_shut')
    # 分間牆（不淡出：在研究小間裡面，鏡頭在走廊時不擋）
    side = c.wg(key, 'side', M['wall'])
    for xw in ((xa, xb) if k == 4 else (xa,)):
        if row == 'N': side.box(xw - 0.05, xw + 0.05, 0.0, H, -CZ1, zf - 0.05)
        else: side.box(xw - 0.05, xw + 0.05, 0.0, H, zf + 0.05, CZ1)
        c.block(xw - 0.05, xw + 0.05, *sorted((zf, zb)), 'carrel_side')
    # 外牆的高窗（霧面、白天亮）：節點 CARREL_SKY（遊戲照時段調亮度）
    sky = c.node('CARREL_SKY', c.M['sky'])
    wz = zb - s * 0.002; y0, y1 = 2.0, 2.62
    sky.quad([(xa + 0.35, y0, wz), (xb - 0.35, y0, wz), (xb - 0.35, y1, wz), (xa + 0.35, y1, wz)] if row == 'N' else [(xb - 0.35, y0, wz), (xa + 0.35, y0, wz), (xa + 0.35, y1, wz), (xb - 0.35, y1, wz)])
    ow = c.wg('N' if row == 'N' else 'S', 'trim', M['vc'], cm=True)
    for (a, b, ya, yb) in ((xa + 0.32, xb - 0.32, y0 - 0.04, y0), (xa + 0.32, xb - 0.32, y1, y1 + 0.03), (xa + 0.32, xa + 0.35, y0, y1), (xb - 0.35, xb - 0.32, y0, y1)):
        ow.cbox(a, b, ya, yb, *sorted((zb, zb - s * 0.05)), '#a9aeb2')
    ow.cbox(xa + 0.32, xb - 0.32, y0 - 0.06, y0 - 0.04, *sorted((zb, zb - s * 0.12)), '#d9d6cf')   # 窗台
    # 桌子（靠外牆）、書架板、椅子、檯燈、掛勾、軟木小板
    dz0, dz1 = sorted((zb - s * 0.05, zb - s * 0.7)); T = rot((xa + xb) / 2, (dz0 + dz1) / 2, PI if row == 'N' else 0.0)
    c.wood.rbox(xa + 0.12, xb - 0.12, 0.72, 0.75, dz0, dz1, r=0.006, seg=1)
    for xx in (xa + 0.14, xb - 0.17): c.vm.cbox(xx, xx + 0.03, 0.0, 0.72, dz0 + 0.04, dz1 - 0.04, '#9aa0a4')
    c.vc.crbox(xb - 0.58, xb - 0.16, 0.0, 0.62, dz0 + 0.06, dz1 - 0.06, '#d6d3cc', r=0.004, seg=1)
    c.block(xa + 0.1, xb - 0.1, dz0, dz1, 'carrel_desk')
    sz0, sz1 = sorted((zb - s * 0.05, zb - s * 0.33)); c.wood.box(xa + 0.15, xb - 0.15, 1.42, 1.45, sz0, sz1)
    for xx in (xa + 0.4, xb - 0.4): c.vm.cbox(xx - 0.01, xx + 0.01, 1.3, 1.42, *sorted((zb - s * 0.05, zb - s * 0.3)), '#9aa0a4')
    cx_ = xa + 1.4; cz_ = zb - s * 1.15; yaw = PI if row == 'N' else 0.0
    LU.task_chair(c, cx_, cz_, yaw, '#3a4a5a' if not sis else '#4a3a3a')
    c.vm.cbox(xa + 0.05, xa + 0.08, 1.6, 1.64, *sorted((zf - s * 0.2, zf - s * 0.5)), '#5a5f63')     # 掛勾（西側分間牆）
    corkk = c.wg(key, 'side_print', M['print'])
    za_, zb_ = sorted((zb - s * 0.55, zb - s * 1.25)); xw_ = xb - 0.051
    uvquad(corkk, [(xw_, 0.95, za_), (xw_, 0.95, zb_), (xw_, 1.35, zb_), (xw_, 1.35, za_)], LU.uv('CORK'))   # 朝 −x：從研究小間裡面看，z 小的在左邊
    lamp_name = 'SIS_CARREL_LAMP' if sis else None
    LT = rot(xa + 0.55, (dz0 + dz1) / 2, yaw)
    if lamp_name: LU.desk_lamp(c, LT, 0.0, 0.0, name=lamp_name)
    else: LU.desk_lamp(c, LT, 0.0, 0.0, name='library_carrels_lampoff')
    # 座位（只有玩家預約的那一間可以坐；學姊的位子在 spots）
    st = dict(x=round(cx_, 3), z=round(cz_, 3), yaw=round(yaw, 4))
    if mine: c.seat(cx_, cz_, yaw, (cx_, (dz0 + dz1) / 2), 'study', ap=(cx_, round(cz_ - s * 0.6, 3)), label='坐下（研究小間）')
    return num, st, (xa, xb), zf, win


def carrel_stuff(c, num, xa, xb, zf, row):
    """各間桌上的東西（學姊的那一間另外）"""
    s = -1 if row == 'N' else 1; zb = s * CZ1; yaw = PI if row == 'N' else 0.0
    T = rot((xa + xb) / 2, zb - s * 0.4, yaw); r = c.rng.random()
    if r < 0.35: LU.book_stack(c, T, -0.5, 0.0, c.rng.randint(2, 5)); LU.paper_stack(c, T, 0.2, 0.05, n=c.rng.randint(20, 80), clip=c.rng.random() < 0.5)
    elif r < 0.6: LU.book_stack(c, T, 0.3, 0.0, c.rng.randint(1, 3))
    # 書架板上：一排書（沒有字的書背）
    if c.rng.random() < 0.8:
        x = xa + 0.25; end = xa + 0.25 + c.rng.uniform(0.4, 1.4)
        while x < end:
            w = c.rng.uniform(0.025, 0.05); h = c.rng.uniform(0.2, 0.27); col = c.rng.choice(['#7a2a2a', '#2a4a6a', '#e8dcc0', '#3a5a3a', '#c9a24a', '#5a4a6a', '#d8d0c0', '#24262a'])
            z0, z1 = sorted((zb - s * 0.07, zb - s * 0.27)); c.vc.cbox(x, x + w - 0.002, 1.45, 1.45 + h, z0, z1, col); x += w


def sis_carrel(c, xa, xb, row):
    """學姊的研究小間 03：筆電（開著）、論文影印稿兩疊、書、計畫本（深綠封面，和 5F 研究室同一本）、保溫瓶、便利貼一疊、外套掛在椅背"""
    s = -1 if row == 'N' else 1; zb = s * CZ1; yaw = PI if row == 'N' else 0.0
    vc = c.node('SIS_CARREL_props', c.M['vc'], cm=True); pr = c.node('SIS_CARREL_prints', c.M['print']); sc = c.node('SIS_CARREL_screen', c.M['screen'])
    T = rot((xa + xb) / 2, zb - s * 0.4, yaw); assert row == 'N'
    # 筆電（桌子中間偏東、螢幕往後仰 15°；從椅子看過去，螢幕朝 +z）
    xc, zc = (xa + xb) / 2 - 0.05, -3.2
    vc.crbox(xc - 0.17, xc + 0.17, 0.75, 0.768, zc - 0.12, zc + 0.12, '#b4b8bc', r=0.006, seg=1)
    ta = math.radians(15); hh = 0.23; z0_, z1_ = zc - 0.12, zc - 0.12 - math.sin(ta) * hh; y0_, y1_ = 0.768, 0.768 + math.cos(ta) * hh
    vc.poly([(xc + 0.17, y0_, z0_ - 0.006), (xc - 0.17, y0_, z0_ - 0.006), (xc - 0.17, y1_, z1_ - 0.006), (xc + 0.17, y1_, z1_ - 0.006)], '#2b2d30')   # 螢幕背面（朝 −z）
    vc.poly([(xc - 0.17, y0_, z0_), (xc + 0.17, y0_, z0_), (xc + 0.17, y1_, z1_), (xc - 0.17, y1_, z1_)], '#1e2024')                                 # 螢幕外框（朝 +z）
    k_ = 0.012; uvquad(sc, [(xc - 0.155, y0_ + 0.012, z0_ + k_ * 0.1), (xc + 0.155, y0_ + 0.012, z0_ + k_ * 0.1), (xc + 0.155, y1_ - 0.012, z1_ + k_ * 0.1), (xc - 0.155, y1_ - 0.012, z1_ + k_ * 0.1)], LU.uv('LAPTOP'))
    # 論文影印稿、書、計畫本、保溫瓶、便利貼一疊
    c_prt, c_vc = c.prt, c.vc; c.prt, c.vc = pr, vc
    LU.paper_stack(c, T, 0.42, 0.02, n=90); LU.paper_stack(c, T, 0.62, 0.0, n=40, clip=False)
    LU.book_stack(c, T, -0.55, 0.02, 4); LU.book_stack(c, T, -0.78, -0.02, 2, cols=('#2f5a3a',))
    rbox(vc, T, 0.2, 0.36, 0.75, 0.772, -0.24, -0.02, '#25453a')                                            # 計畫本（深綠封面）
    tx_, tz_ = T(-0.32, -0.2); ccyl(vc, (tx_, 0.75, tz_), (tx_, 0.97, tz_), 0.036, '#5a6a72', seg=12); ccyl(vc, (tx_, 0.97, tz_), (tx_, 1.0, tz_), 0.03, '#2b2b2b', seg=12)   # 保溫瓶
    rbox(vc, T, -0.1, -0.02, 0.75, 0.765, -0.26, -0.18, '#fae25c')                                          # 便利貼一疊
    cxp, czp = T(-0.06, -0.22); LU.hquad(pr, cxp, 0.766, czp, (math.sin(yaw), math.cos(yaw)), 0.076, 0.076, 'NOTE2')
    c.prt, c.vc = c_prt, c_vc
    # 椅背上的外套（灰色針織）
    cx_ = xa + 1.4; cz_ = zb - s * 1.15; TT = rot(cx_, cz_, yaw)
    rbox(vc, TT, -0.25, 0.25, 0.62, 1.05, -0.33, -0.27, '#8c8a86', r=0.03, seg=2); rbox(vc, TT, -0.22, 0.22, 0.35, 0.65, -0.36, -0.3, '#8c8a86', r=0.03, seg=2)


def build_carrels(c):
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M
    fl = Mesh(f'{c.sid}_floorm', M['floor'], tile=1.0); fl.box(X0, X1, -0.05, 0.0, Z0, Z1); fl.finish(c.root)
    ce = Mesh(f'{c.sid}_ceiling', M['ceil'], tile=1.2); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(c.root)
    # 北、南外牆（研究小間外側：高窗的窗洞）
    for k, zw in (('N', Z0), ('S', Z1)):
        wl = c.wg(k, 'wall', M['wall']); wn = c.wg(k, 'wain', M['wain']); s = -1 if k == 'N' else 1
        Q = (lambda a, b, y0, y1: [(a, y0, zw), (b, y0, zw), (b, y1, zw), (a, y1, zw)]) if k == 'N' else (lambda a, b, y0, y1: [(b, y0, zw), (a, y0, zw), (a, y1, zw), (b, y1, zw)])
        wn.quad(Q(X0, X1, 0.0, 0.12))
        holes = [(CXS[i] + 0.35, CXS[i + 1] - 0.35) for i in range(5)]
        xs = [X0] + [v for h_ in holes for v in h_] + [X1]
        for i in range(0, len(xs), 2): wl.quad(Q(xs[i], xs[i + 1], 0.12, H))
        for (a, b) in holes: wl.quad(Q(a, b, 0.12, 2.0)); wl.quad(Q(a, b, 2.62, H))
    # 東牆：閱讀角的大窗（room() 的窗，景深照遊戲）
    wl = c.wg('E', 'wall', M['wall']); wn = c.wg('E', 'wain', M['wain']); fr = c.wg('E', 'frame', M['vcm'], cm=True); gl = c.wg('E', 'glass', M['glass'])
    wz0, wz1 = -CWIN['w'] / 2, CWIN['w'] / 2; wy0, wy1 = CWIN['y'] - CWIN['h'] / 2, CWIN['y'] + CWIN['h'] / 2
    QE = lambda za, zb, y0, y1: [(X1, y0, za), (X1, y0, zb), (X1, y1, zb), (X1, y1, za)]
    wn.quad(QE(Z0, Z1, 0.0, 0.12)); wl.quad(QE(Z0, wz0, 0.12, H)); wl.quad(QE(wz1, Z1, 0.12, H)); wl.quad(QE(wz0, wz1, 0.12, wy0)); wl.quad(QE(wz0, wz1, wy1, H))
    fr.cbox(X1 - 0.3, X1, wy0 - 0.03, wy0, wz0, wz1, '#d9d6cf')
    for (za, zb) in ((wz0, wz0 + 0.05), (wz1 - 0.05, wz1), (-0.025, 0.025)): fr.cbox(X1 - 0.08, X1 - 0.03, wy0, wy1, za, zb, '#a9aeb2')
    for (ya, yb) in ((wy0, wy0 + 0.05), (wy1 - 0.05, wy1)): fr.cbox(X1 - 0.085, X1 - 0.035, ya, yb, wz0, wz1, '#a9aeb2')
    gl.quad([(X1 - 0.055, wy0, wz0), (X1 - 0.055, wy0, wz1), (X1 - 0.055, wy1, wz1), (X1 - 0.055, wy1, wz0)])
    c.block(X1 - 0.32, X1, wz0, wz1, 'window_sill')
    c.wins = dict(CWIN)
    # 西牆：回大廳的雙開門（淺木門、推板、門上的牌子）
    wl = c.wg('W', 'wall', M['wall']); wn = c.wg('W', 'wain', M['wain']); tr = c.wg('W', 'trim', M['vc'], cm=True); wd = c.wg('W', 'door', M['wood']); dm = c.wg('W', 'doormetal', M['vcm'], cm=True)
    a, b = HALL_DOOR['z'] - HALL_DOOR['w'] / 2, HALL_DOOR['z'] + HALL_DOOR['w'] / 2
    for (za, zb) in ((Z0, a - 0.08), (b + 0.08, Z1)): wl.quad([(X0, 0.12, zb), (X0, 0.12, za), (X0, H, za), (X0, H, zb)]); wn.quad([(X0, 0.0, zb), (X0, 0.0, za), (X0, 0.12, za), (X0, 0.12, zb)])
    wl.quad([(X0, 2.4, b + 0.08), (X0, 2.4, a - 0.08), (X0, H, a - 0.08), (X0, H, b + 0.08)])
    for (za, zb) in ((a - 0.08, a), (b, b + 0.08)): tr.cbox(X0, X0 + 0.06, 0.0, 2.4, za, zb, '#7a6a58')
    tr.cbox(X0, X0 + 0.06, 2.32, 2.4, a - 0.08, b + 0.08, '#7a6a58')
    for (za, zb) in ((a, HALL_DOOR['z'] - 0.005), (HALL_DOOR['z'] + 0.005, b)):
        wd.rbox(X0 - 0.04, X0, 0.0, 2.33, za, zb, r=0.004, seg=1)
        dm.cbox(X0, X0 + 0.04, 0.95, 1.05, za + 0.1, zb - 0.1, '#c9ced2')
    uvquad(c.wg('W', 'print', M['print']), [(X0 + 0.016, 2.5, b), (X0 + 0.016, 2.5, a), (X0 + 0.016, 2.78, a), (X0 + 0.016, 2.78, b)], LU.uv('HALL'))
    c.vc.cbox(X0, X0 + 0.04, 2.76, 2.94, -0.3, 0.3, '#f2f2f0'); uvquad(c.wg('W', 'print', M['print']), [(X0 + 0.042, 2.78, 0.26), (X0 + 0.042, 2.78, -0.26), (X0 + 0.042, 2.92, -0.26), (X0 + 0.042, 2.92, 0.26)], LU.uv('EXIT'))
    # 研究小間
    c.carrels = []
    for row in ('N', 'S'):
        for k in range(5):
            num, st, (xa, xb), zf, win = carrel(c, k, row)
            s = -1 if row == 'N' else 1
            c.carrels.append(dict(id=num, row=row, x0=round(xa, 3), x1=round(xb, 3), z0=round(min(zf, s * CZ1), 3), z1=round(max(zf, s * CZ1), 3),
                                  door=dict(x=round(xa + (DOOR[0] + DOOR[1]) / 2, 3), z=zf, w=round(DOOR[1] - DOOR[0], 3), win=[round(win[0], 3), round(win[1], 3), win[2], win[3]]),
                                  seat=st, mine=num == MINE, sis=num == SIS))
            if num == SIS: sis_carrel(c, xa, xb, row); c.sis_win = (win, zf, xa, xb, st)
            elif num != MINE: carrel_stuff(c, num, xa, xb, zf, row)
            # 外面的「看」：門前 0.75 m
            dx = xa + (DOOR[0] + DOOR[1]) / 2; dz = zf - s * 0.75
            if num == MINE: c.look(f'door{num}', dx, dz, 0.6, f'研究小間 {num}', '預約制。門上貼著：「請到 1F 服務台預約」。', dev='LAWWW 接：今天有預約（大四起，AA_399 3-1）就開門（zone 的 LCB.booked()）；沒有預約時「看」這一句')
            elif num == SIS: c.look(f'door{num}', dx, dz, 0.6, f'研究小間 {num}', '霧面玻璃門。門上的小窗看得到裡面亮著一盞檯燈。', dev='LAWWW 接：學姊在的時段（2028-02～2029-05 平日 14～17，美國期間除外）label 換成「敲玻璃」→ 便利貼（AA_399 3-1）；她不在的時候是這一句（暫定）')
    # 門廳（西端）：使用須知、預約表、入口牌、長椅、飲水機、植物、掛衣架
    sw = c.wg('W', 'print', M['print'])
    K.frame_board(c, 'N', -8.2, -6.6, 1.25, 2.15, '#3a3f45'); LU.pq(c, 'N', -8.2, -6.6, 1.25, 2.15, 'RULE', inset=0.014)
    side = c.wg('PN', 'side_print', M['print'])
    uvquad(side, [(CXS[0] - 0.081, 1.2, -3.2), (CXS[0] - 0.081, 1.2, -1.6), (CXS[0] - 0.081, 2.1, -1.6), (CXS[0] - 0.081, 2.1, -3.2)], LU.uv('BOOKING'))   # 朝 −x（門廳）
    c.wg('PN', 'trim', M['vc'], cm=True).cbox(CXS[0] - 0.08, CXS[0] - 0.05, 1.17, 2.13, -3.23, -1.57, '#c9ced2')
    c.look('booking', -6.75, -2.4, 0.8, '預約表', '這一週的預約表。03 那一格，平日下午都塗著同一種綠色。', dev='暫定的字（學姊長期使用 03，AA_399 3-1）；AA 可以改')
    c.look('rules', -7.4, -3.0, 0.7, '研究小間使用須知', '研究小間使用須知：請到 1F 服務台預約，一次三小時，一天一次。', dev='暫定的字')
    # 走廊入口上方的牌子（吊在天花板下，兩面：門廳那一面「研究小間 01–10」、走廊那一面「出口」）
    c.vc.cbox(-6.04, -5.96, 2.44, 2.8, -0.85, 0.85, '#24303a')
    uvquad(c.prt, [(-6.041, 2.47, -0.6), (-6.041, 2.47, 0.6), (-6.041, 2.77, 0.6), (-6.041, 2.77, -0.6)], LU.uv('SIGN'))   # 朝 −x
    uvquad(c.prt, [(-5.959, 2.47, 0.8), (-5.959, 2.47, -0.8), (-5.959, 2.77, -0.8), (-5.959, 2.77, 0.8)], LU.uv('HALL'))   # 朝 +x
    for zz in (-0.8, 0.8): c.vm.cbox(-6.01, -5.99, 2.8, H, zz - 0.01, zz + 0.01, '#5a5f63')
    c.wood.rbox(-8.3, -7.0, 0.43, 0.47, 3.0, 3.4, r=0.01, seg=2)
    for lx in (-8.2, -7.1): c.vm.cbox(lx - 0.025, lx + 0.025, 0.0, 0.43, 3.02, 3.38, '#5a5f63')
    c.block(-8.32, -6.98, 2.98, 3.42, 'bench')
    for k in (-0.35, 0.35): c.seat(-7.65 + k, 3.2, PI, (-7.65 + k, 2.6), 'sit', label='坐在長椅')
    water_station(c, -6.5, Z1 - 0.3, face='-z')
    plant(c, -8.25, -1.7, 1.2)
    hx, hz = -8.2, 2.3                                                                                        # 掛衣架（門廳西南角）
    ccyl(c.vm, (hx, 0.0, hz), (hx, 1.75, hz), 0.02, '#3a3f45', seg=8)
    for k in range(6):
        a_ = k * PI / 3; ccyl(c.vm, (hx, 1.68, hz), (hx + 0.2 * math.cos(a_), 1.74, hz + 0.2 * math.sin(a_)), 0.01, '#3a3f45', seg=6)
    for k in range(4):
        a_ = k * PI / 2 + 0.4; ccyl(c.vm, (hx, 0.04, hz), (hx + 0.25 * math.cos(a_), 0.0, hz + 0.25 * math.sin(a_)), 0.012, '#3a3f45', seg=6)
    c.block(hx - 0.22, hx + 0.22, hz - 0.22, hz + 0.22, 'coat_rack')
    # 東端閱讀角：兩張單人沙發（面向窗）、小茶几、還書車、植物
    for (zz, col) in ((-2.3, '#6f7d86'), (2.3, '#7d6f66')):
        T = rot(7.9, zz, PI / 2); rbox(c.vc, T, -0.38, 0.38, 0.0, 0.42, -0.36, 0.38, col, r=0.05, seg=2); rbox(c.vc, T, -0.38, 0.38, 0.42, 0.85, -0.42, -0.24, col, r=0.05, seg=2)
        for sx in (-1, 1): rbox(c.vc, T, sx * 0.38 - 0.08, sx * 0.38 + 0.08, 0.0, 0.62, -0.42, 0.38, col, r=0.04, seg=2)
        c.block(7.48, 8.32, zz - 0.45, zz + 0.45, 'armchair')   # 靠窗那一側（走道留 x 6.2～7.4 三格：6.0 是分間牆那一排）
        c.seat(7.9, zz, PI / 2, (8.5, zz), 'sit', ap=(6.95, zz), label='坐單人沙發')
    c.wood.rbox(7.35, 7.85, 0.0, 0.45, -1.0, -0.4, r=0.01, seg=2); c.block(7.33, 7.87, -1.02, -0.38, 'side_table')
    c.vc.crbox(6.35, 6.95, 0.0, 0.9, 2.95, 3.45, '#a9aeb2', r=0.01, seg=1)                                          # 還書車
    for yy in (0.25, 0.55, 0.85): c.vc.cbox(6.37, 6.93, yy, yy + 0.02, 2.97, 3.43, '#8a8f93')
    for i in range(9): c.vc.cbox(6.4 + i * 0.055, 6.45 + i * 0.055, 0.57, 0.57 + c.rng.uniform(0.18, 0.25), 3.0, 3.2, c.rng.choice(['#7a2a2a', '#2a4a6a', '#e8dcc0', '#3a5a3a', '#c9a24a']))
    c.block(6.33, 6.97, 2.93, 3.47, 'book_cart')
    plant(c, 8.25, -3.2, 1.3); plant(c, 8.25, 3.2, 1.1)
    # 燈：走廊一排、每間一盞
    LT = [(x, 0.0) for x in (-7.3, -4.8, -2.4, 0.0, 2.4, 4.8, 7.3)] + [((CXS[k] + CXS[k + 1]) / 2, s_ * 2.5) for k in range(5) for s_ in (-1, 1)]
    for (x, z) in LT:
        c.vc.cbox(x - 0.62, x + 0.62, H - 0.02, H, z - 0.32, z + 0.32, '#f4f4f1'); c.tube.box(x - 0.58, x + 0.58, H - 0.026, H - 0.02, z - 0.28, z + 0.28)
    # 學姊那一間：門外的位置、她的座位、便利貼
    win, zf, xa, xb, st = c.sis_win; s = -1
    stk = c.node('STICKY_SIS', M['print']); nx = (win[0] + win[1]) / 2 - 0.04; ny = 1.6; nz = zf - s * 0.0 - 0.024   # 小窗裡面（研究小間那一側）2.4 cm、字朝走廊（+z）
    uvquad(stk, [(nx - 0.038, ny - 0.038, nz), (nx + 0.038, ny - 0.038, nz), (nx + 0.038, ny + 0.038, nz), (nx - 0.038, ny + 0.038, nz)], LU.uv('STICKY'))
    c.spawn = dict(x=round(X0 + 1.6, 3), z=0.0, yaw=round(PI / 2, 4), note='從大廳的門進來，面向東（走廊）；離門 1.6 m（不會一進來就站在「回大廳」上）')
    c.exits = []
    c.look('hall', X0 + 0.6, 0.0, 0.8, '回 2F 自習區', dev='src/library_upper3d.js：換到 library_hall 二樓東牆那扇門前（library_layout.js doors carrels 的 spawn）')
    sdx = xa + (DOOR[0] + DOOR[1]) / 2
    c.lay_extra = dict(
        windows=c.wins, carrels=c.carrels, door_block=c.lay_extra.get('door_block', {}),
        spots=dict(sis_knock=dict(x=round(sdx + 0.1, 3), z=round(zf + 0.7, 3), yaw=PI, note='學姊那一間（03）門外：面向門的小窗（敲玻璃；AA_399 3-1）'),
                   sis_seat=dict(st, note='學姊坐的位置（03 的椅子，面向北邊的桌子；從門的小窗看得到她的側後方）。導航：03 關著，NPC 直接放在這裡'),
                   sis_note=dict(x=round(nx, 3), y=ny, z=round(nz, 3), yaw=0.0, note='便利貼：小窗裡面、字朝走廊（節點 STICKY_SIS，敲玻璃以後才顯示）'),
                   my_door=dict(x=round(CXS[2] + (DOOR[0] + DOOR[1]) / 2, 3), z=round(FZ - 0.75, 3), yaw=0.0, note='08（玩家預約的那一間）門外、面向門'),
                   my_seat=dict(next(cc['seat'] for cc in c.carrels if cc['id'] == MINE), note='08 的椅子（seats 裡同一個位子，kind study）'),
                   window=dict(x=7.0, z=0.0, yaw=PI / 2, note='走廊盡頭、閱讀角的窗前（面向東）'),
                   hall_door=dict(x=round(X0 + 1.0, 3), z=0.0, yaw=-PI / 2, note='門廳、面向回大廳的門')),
        nodes={'CARREL08_DOOR_SHUT*': '08 關著的門（沒有預約）', 'CARREL08_DOOR_OPEN*': '08 開著的門（今天有預約）', 'SIS_CARREL_*': '學姊的東西（她在用 03 的時期才顯示）',
               'SIS_CARREL_LAMP': '學姊的檯燈（她在的時候亮）', 'STICKY_SIS': '便利貼（敲玻璃以後顯示）', 'CARREL_SKY': '外牆高窗的霧面玻璃（白天亮、晚上暗）'})


# ================= 5F 書庫 =================
BOOK = {}


def book_mods(c):
    """書模組：一層一個開間（本地 x 沿書架、書背朝 +z、往 −z 是書的深度）。一段（run）＝同一類裡連續的 2～5 格書背（同一套書、高度一樣）：
    一段只要書背、頂面（書口）、露出來的側面三種面，一層幾段就好（比一本一本的書少很多三角形）"""
    meta = json.load(open(os.path.join(GEN, 'lib5f_books.json'))); AW, AH = meta['size']; REG = meta['regions']; pg = meta['pages']
    def uvr(px, ins=1.0): x0, y0, x1, y1 = px; return ((x0 + ins) / AW, 1 - (y1 - ins) / AH, (x1 - ins) / AW, 1 - (y0 + ins) / AH)
    mat = img_mat(f'{c.sid}_books', 'lib5f_books.png', rough=0.62); LM = BAY - 0.03; BOOK['LM'] = LM
    def mod(name, keys, seed, hr, wr, dr, fill=1.0, kr=(2, 5), bookend=False):
        rnd = random.Random(seed); bm = bmesh.new(); uvl = bm.loops.layers.uv.verify(); runs = []; x = -LM / 2 + 0.006; end = -LM / 2 + LM * fill
        while x < end - 0.03:
            if rnd.random() < 0.06: x += rnd.uniform(0.02, 0.07); continue
            key = rnd.choice(keys); cells = REG[key]; k = rnd.randint(kr[0], min(kr[1], len(cells))); i0 = rnd.randrange(0, len(cells) - k + 1)
            w = sum(rnd.uniform(*wr) for _ in range(k)); h = rnd.uniform(*hr); d = rnd.uniform(*dr)
            if x + w > end: break
            runs.append((x, x + w, h, d, cells[i0:i0 + k])); x += w + rnd.uniform(0.0, 0.003)
        def face(pts, uvs):
            f = bm.faces.new([bm.verts.new(g2b(*p)) for p in pts])
            for lp, uv in zip(f.loops, uvs): lp[uvl].uv = uv
        P = uvr(pg, 2.0)
        for i, (xa, xb, h, d, cl) in enumerate(runs):
            u0, v0, _, v1 = uvr(cl[0]); _, _, u1, _ = uvr(cl[-1])
            face([(xa, 0, 0), (xb, 0, 0), (xb, h, 0), (xa, h, 0)], [(u0, v0), (u1, v0), (u1, v1), (u0, v1)])
            face([(xa, h, 0), (xb, h, 0), (xb, h, -d), (xa, h, -d)], [(P[0], P[1]), (P[2], P[1]), (P[2], P[3]), (P[0], P[3])])
            us = (u0, u0 + 1.5 / AW)
            Lb = runs[i - 1] if i else None; Rb = runs[i + 1] if i + 1 < len(runs) else None
            if Lb is None or xa - Lb[1] > 0.002 or h > Lb[2] + 0.003: face([(xa, 0, -d), (xa, 0, 0), (xa, h, 0), (xa, h, -d)], [(us[0], v0), (us[1], v0), (us[1], v1), (us[0], v1)])
            if Rb is None or Rb[0] - xb > 0.002 or h > Rb[2] + 0.003: face([(xb, 0, 0), (xb, 0, -d), (xb, h, -d), (xb, h, 0)], [(us[0], v0), (us[1], v0), (us[1], v1), (us[0], v1)])
        if bookend and runs:
            st = uvr(meta['swatch']['steel'], 2.0); sv = [(st[0], st[1]), (st[2], st[1]), (st[2], st[3]), (st[0], st[3])]; bx = runs[-1][1] + 0.002
            face([(bx, 0.0, -0.03), (bx, 0.0, -0.17), (bx, 0.19, -0.17), (bx, 0.19, -0.03)], sv); face([(bx + 0.002, 0.0, -0.17), (bx + 0.002, 0.0, -0.03), (bx + 0.002, 0.19, -0.03), (bx + 0.002, 0.19, -0.17)], sv)
        bm.normal_update(); me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
        return me
    M = {}
    for cls in ['300', '310', '320', '330', '340', '350', '360', '370', '380']:
        M[cls] = [mod(f'{c.sid}_bk_{cls}_{v}', [cls], 1000 + int(cls) * 7 + v, (0.205, 0.265), (0.024, 0.048), (0.15, 0.21), fill=1.0 if v < 3 else 0.55 + 0.1 * v, bookend=v >= 3) for v in range(5)]
    M['J'] = [mod(f'{c.sid}_bk_J_{v}', ['journal'], 2000 + v, (0.255, 0.268), (0.034, 0.05), (0.18, 0.2), kr=(3, 5)) for v in range(3)]
    M['REF'] = [mod(f'{c.sid}_bk_REF_{v}', [k], 3000 + v, (0.29, 0.31), (0.05, 0.065), (0.24, 0.27), kr=(len(REG[k]), len(REG[k])), bookend=True)
                for v, k in enumerate(['ref_plant', 'ref_animal', 'ref_chem', 'ref_math', 'ref_astro'])]   # 一格一整套（植物圖鑑 1～8 冊…）＋書擋
    return M


def place_mod(c, me, cx, y, cz, yaw, bw):
    ob = bpy.data.objects.new(f'{c.sid}_bk_{BOOK.setdefault("n", 0)}', me); B.scene().collection.objects.link(ob); BOOK['n'] += 1
    ob.parent = BOOK['G']; ob.location = g2b(cx, y, cz); ob.rotation_euler = (0, 0, yaw); ob.scale = (bw / BOOK['LM'], 1.0, 1.0)


def shelf_range(c, xr, z0, z1, cls, mods, single=None, special=None):
    """一排鋼製書架（沿 z，從 z0 到 z1）：雙面（single＝'+x'／'-x' 是靠牆的單面）；端板（奶油色）＋類號牌、層板、隔板、底座、頂板；書面向走道"""
    vm = c.vm; L_ = z1 - z0; n = max(1, round(L_ / BAY)); bay = L_ / n; col, edge = '#dcd8cc', '#c9c4b6'
    d0, d1 = (xr - SHD / 2, xr + SHD / 2) if not single else ((xr - SHD / 4, xr + SHD / 4))
    vm.cbox(d0 + 0.02, d1 - 0.02, 0.0, 0.1, z0 + 0.02, z1 - 0.02, '#8a8f93')                       # 底座（踢腳）
    vm.cbox(d0, d1, SHH - 0.03, SHH, z0, z1, col)                                                  # 頂板
    vm.cbox(xr - 0.006, xr + 0.006, 0.1, SHH - 0.03, z0 + 0.02, z1 - 0.02, edge) if not single else vm.cbox((d0 if single == '+x' else d1 - 0.012), (d0 + 0.012 if single == '+x' else d1), 0.1, SHH - 0.03, z0, z1, edge)
    for i in range(n + 1):
        zz = z0 + i * bay; th = 0.03 if 0 < i < n else 0.02
        if 0 < i < n: vm.cbox(d0 + 0.01, d1 - 0.01, 0.0, SHH - 0.03, zz - th / 2, zz + th / 2, col)
    for (za, zb) in ((z0 - 0.02, z0), (z1, z1 + 0.02)): c.vc.cbox(d0 - 0.01, d1 + 0.01, 0.0, SHH + 0.01, za, zb, '#e6e1d2')   # 端板
    faces = ['+x', '-x'] if not single else [single]
    for lvl, y in enumerate(LEVELS):
        vm.cbox(d0 + 0.012, d1 - 0.012, y - 0.02, y, z0 + 0.01, z1 - 0.01, col)
        for f in faces:
            sgn = 1 if f == '+x' else -1; xf = (d1 if sgn > 0 else d0) - sgn * 0.012; yaw = PI / 2 if sgn > 0 else -PI / 2
            for i in range(n):
                zc = z0 + (i + 0.5) * bay
                if c.rng.random() < 0.06 and lvl not in (2, 3): continue                         # 空的一格（借走了）
                if lvl == 0 and c.rng.random() < 0.35: continue
                me = c.rng.choice(mods[:3] if c.rng.random() < 0.75 else mods)
                if special and abs(zc - special[0]) < bay / 2 and lvl == special[1]: me = special[2]   # 指定的一格（方奕廷的植物圖鑑）
                place_mod(c, me, xf, y, zc, yaw, bay - 0.04)
    c.block(d0, d1, z0 - 0.02, z1 + 0.02, 'stack_range')


def end_label(c, xr, z, s, cls):
    """端板的類號牌（朝走道 s＝±1：z 往哪邊；牌子離端板 1.2 cm，底板夾在中間）"""
    m = c.prt; y0, y1 = 1.42, 1.66; w = 0.48
    pts = [(xr - w / 2, y0, z), (xr + w / 2, y0, z), (xr + w / 2, y1, z), (xr - w / 2, y1, z)]
    uvquad(m, pts if s > 0 else [pts[1], pts[0], pts[3], pts[2]], LU.uv('END_' + cls))
    c.vm.cbox(xr - w / 2 - 0.02, xr + w / 2 + 0.02, y0 - 0.02, y1 + 0.02, *sorted((z - s * 0.002, z - s * 0.012)), '#5a5f63')


def build_stacks(c):
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M; Hs = HS
    fl = Mesh(f'{c.sid}_floorm', M['floor'], tile=1.2); fl.box(X0, X1, -0.05, 0.0, Z0, Z1); fl.finish(c.root)
    ce = Mesh(f'{c.sid}_ceiling', M['ceil'], tile=1.2); ce.quad([(X0, Hs, Z0), (X1, Hs, Z0), (X1, Hs, Z1), (X0, Hs, Z1)]); ce.finish(c.root)
    # 南牆：一排窗（room() 的窗）
    wl = c.wg('S', 'wall', M['wall']); wn = c.wg('S', 'wain', M['wain']); fr = c.wg('S', 'frame', M['vcm'], cm=True); gl = c.wg('S', 'glass', M['glass'])
    QS = lambda xa, xb, y0, y1: [(xb, y0, Z1), (xa, y0, Z1), (xa, y1, Z1), (xb, y1, Z1)]
    hw, wy0, wy1 = SWIN['w'] / 2, SWIN['y'] - SWIN['h'] / 2, SWIN['y'] + SWIN['h'] / 2
    xs = [X0] + [v for wx in SWINX for v in (wx - hw, wx + hw)] + [X1]
    for k in range(0, len(xs), 2): wl.quad(QS(xs[k], xs[k + 1], 0.12, Hs))
    wn.quad(QS(X0, X1, 0.0, 0.12))
    for wx in SWINX:
        a, b = wx - hw, wx + hw; wl.quad(QS(a, b, 0.12, wy0)); wl.quad(QS(a, b, wy1, Hs))
        fr.cbox(a, b, wy0 - 0.03, wy0, Z1 - 0.12, Z1, '#d9d6cf')
        for (xa, xb) in ((a, a + 0.05), (b - 0.05, b), (wx - 0.025, wx + 0.025)): fr.cbox(xa, xb, wy0, wy1, Z1 - 0.08, Z1 - 0.03, '#a9aeb2')
        for (ya, yb) in ((wy0, wy0 + 0.05), (wy1 - 0.05, wy1)): fr.cbox(a, b, ya, yb, Z1 - 0.085, Z1 - 0.035, '#a9aeb2')
        gl.quad([(b, wy0, Z1 - 0.055), (a, wy0, Z1 - 0.055), (a, wy1, Z1 - 0.055), (b, wy1, Z1 - 0.055)])
    c.wins = dict(SWIN, note='遊戲 room() 的窗：winWall front（南牆，x 是反的：遊戲端 winXs 取負號）、winY、winW、winH；窗外的景 library_stacks')
    # 北、西、東牆
    for k in 'NWE':
        wl = c.wg(k, 'wall', M['wall']); wn = c.wg(k, 'wain', M['wain'])
        if k == 'N': wl.quad([(X0, 0.12, Z0), (X1, 0.12, Z0), (X1, Hs, Z0), (X0, Hs, Z0)]); wn.quad([(X0, 0.0, Z0), (X1, 0.0, Z0), (X1, 0.12, Z0), (X0, 0.12, Z0)])
        elif k == 'W': wl.quad([(X0, 0.12, Z1), (X0, 0.12, Z0), (X0, Hs, Z0), (X0, Hs, Z1)]); wn.quad([(X0, 0.0, Z1), (X0, 0.0, Z0), (X0, 0.12, Z0), (X0, 0.12, Z1)])
        else:
            sz, sw_ = -6.0, 1.2   # 東牆：樓梯間的門（鎖著）
            for (za, zb) in ((Z0, sz - sw_ / 2 - 0.08), (sz + sw_ / 2 + 0.08, Z1)): wl.quad([(X1, 0.12, za), (X1, 0.12, zb), (X1, Hs, zb), (X1, Hs, za)]); wn.quad([(X1, 0.0, za), (X1, 0.0, zb), (X1, 0.12, zb), (X1, 0.12, za)])
            wl.quad([(X1, 2.2, sz - sw_ / 2 - 0.08), (X1, 2.2, sz + sw_ / 2 + 0.08), (X1, Hs, sz + sw_ / 2 + 0.08), (X1, Hs, sz - sw_ / 2 - 0.08)])
            tr = c.wg('E', 'trim', M['vc'], cm=True); dm = c.wg('E', 'doormetal', M['vcm'], cm=True)
            for (za, zb) in ((sz - sw_ / 2 - 0.08, sz - sw_ / 2), (sz + sw_ / 2, sz + sw_ / 2 + 0.08)): tr.cbox(X1 - 0.06, X1, 0.0, 2.2, za, zb, '#5a5f63')
            tr.cbox(X1 - 0.06, X1, 2.12, 2.2, sz - sw_ / 2 - 0.08, sz + sw_ / 2 + 0.08, '#5a5f63')
            dm.cbox(X1, X1 + 0.04, 0.0, 2.13, sz - sw_ / 2 - 0.02, sz + sw_ / 2 + 0.02, '#6a7078'); dm.cbox(X1 - 0.05, X1, 1.0, 1.04, sz - sw_ / 2 + 0.1, sz + 0.2, '#c9ced2')
            uvquad(c.wg('E', 'print', M['print']), [(X1 - 0.016, 2.32, sz + 0.5), (X1 - 0.016, 2.32, sz - 0.5), (X1 - 0.016, 2.68, sz - 0.5), (X1 - 0.016, 2.68, sz + 0.5)], LU.uv('STAIR'))
            c.vc.cbox(X1 - 0.04, X1, 2.76, 2.94, sz - 0.3, sz + 0.3, '#f2f2f0'); uvquad(c.wg('E', 'print', M['print']), [(X1 - 0.042, 2.78, sz + 0.26), (X1 - 0.042, 2.78, sz - 0.26), (X1 - 0.042, 2.92, sz - 0.26), (X1 - 0.042, 2.92, sz + 0.26)], LU.uv('EXIT'))
            c.look('stairs', X1 - 0.8, sz, 0.8, '樓梯間', '樓梯間的門鎖著。門上貼著：「4F、6F 書庫整理中，往下請搭電梯。」', dev='暫定的字；書庫只能搭電梯（大廳、3F 閱覽區的電梯都停 5F）')
    # 書架：十排雙面＋西牆一排單面（參考書）
    mods = book_mods(c); BOOK['G'] = B.group(f'{c.sid}_books', c.root)
    for i, (xr, cls) in enumerate(zip(RANGES, RCLS)):
        for (z0, z1) in BANKS:
            shelf_range(c, xr, z0, z1, cls, mods[cls])
            end_label(c, xr, z0 - 0.032, -1, cls); end_label(c, xr, z1 + 0.032, 1, cls)
    for (z0, z1) in BANKS:
        shelf_range(c, X0 + SHD / 4 + 0.01, z0, z1, 'REF', mods['REF'], single='+x', special=(FANG_Z, 3, mods['REF'][0]))
    for (z0, z1) in BANKS:   # 參考書那一排：每一格貼「參考書　不外借」
        n = max(1, round((z1 - z0) / BAY)); bay = (z1 - z0) / n
        for i in range(n):
            zc = z0 + (i + 0.5) * bay; xf = X0 + SHD / 2 + 0.012
            uvquad(c.prt, [(xf, 1.335, zc + 0.1), (xf, 1.335, zc - 0.1), (xf, 1.385, zc - 0.1), (xf, 1.385, zc + 0.1)], LU.uv('REF'))   # 層板下緣的小標籤（朝 +x）
    for zc in (-4.4, 2.6): uvquad(c.wg('W', 'print', M['print']), [(X0 + 0.014, 2.2, zc + 1.0), (X0 + 0.014, 2.2, zc - 1.0), (X0 + 0.014, 2.7, zc - 1.0), (X0 + 0.014, 2.7, zc + 1.0)], LU.uv('REF'))
    # 踏腳凳（最裡面那一排、靠書架；不擋路）
    ccyl(c.vc, (-11.5, 0.0, -2.7), (-11.5, 0.36, -2.7), 0.2, '#c8322a', seg=14, r2=0.15)
    # 南邊的閱覽桌（窗下：每扇窗一張兩人桌、中間矮隔板）
    for wx in SWINX:
        if wx > 7.0: continue
        z0, z1 = Z1 - 0.7, Z1 - 0.1
        c.wood.rbox(wx - 0.85, wx + 0.85, 0.72, 0.75, z0, z1, r=0.006, seg=1)
        for xx in (wx - 0.82, wx + 0.79): c.vm.cbox(xx, xx + 0.03, 0.0, 0.72, z0 + 0.04, z1 - 0.04, '#9aa0a4')
        c.wood.box(wx - 0.015, wx + 0.015, 0.75, 1.05, z0 + 0.05, z1 - 0.02)
        c.block(wx - 0.87, wx + 0.87, z0 - 0.02, z1, 'reading_desk')
        for sx in (-0.42, 0.42):
            xx = wx + sx; zz = z0 - 0.45; LU.task_chair(c, xx, zz, 0.0, '#4a5a4a')
            c.seat(xx, zz, 0.0, (xx, (z0 + z1) / 2), 'study', ap=(xx, round(zz - 0.6, 3)), label='坐下讀書')
            if c.rng.random() < 0.3: T = rot(xx, (z0 + z1) / 2, 0.0); LU.book_stack(c, T, 0.0, 0.05, c.rng.randint(1, 3))
    # 電梯前（東北）：5F 樓層牌、配置圖、館藏查詢、還書車、使用須知、請保持安靜
    ex0, ex1, ez0, ez1 = EL['x0'], EL['x1'], EL['z0'], EL['z1']
    LU.pq(c, 'N', 8.4, 11.0, 1.55, 2.37, 'FLOOR', inset=0.014)
    LU.pq(c, 'N', 5.2, 7.6, 1.15, 2.65, 'DIRB', inset=0.014)
    c.wg('N', 'trim', M['vc'], cm=True).cbox(5.17, 7.63, 1.12, 2.68, Z0, Z0 + 0.012, '#3a3f45')
    LU.pq(c, 'E', -4.4, -2.6, 1.2, 2.1, 'RULE', inset=0.014)
    c.wg('E', 'trim', M['vc'], cm=True).cbox(X1 - 0.012, X1, 1.17, 2.13, -4.43, -2.57, '#3a3f45')
    c.look('directory', 6.4, Z0 + 1.0, 0.9, '5F 書庫配置圖', '5F 書庫：自然科學 300–389。R1 期刊合訂本、R2 動物、R3 植物……R10 科學總論。最裡面靠牆一排是參考書，不外借。', dev='暫定的字')
    c.look('rules', X1 - 0.9, -3.5, 0.8, '書庫使用須知', '書庫使用須知：取下的書請放還書車，不要自己歸架。參考書、期刊不外借。借書請到 1F 服務台或 B1 自助借還。', dev='暫定的字；借書照 AA_399 3-2（LAWWW 接）')
    # 館藏查詢電腦（站著用）
    T = rot(8.2, -6.4, 0.0); rbox(c.vc, T, -0.25, 0.25, 0.0, 0.95, -0.2, 0.2, '#e4e4e0', r=0.02, seg=1); rbox(c.vc, T, -0.28, 0.28, 0.95, 1.0, -0.25, 0.22, '#cfcfcb')
    rbox(c.vc, T, -0.24, 0.24, 1.05, 1.4, -0.02, 0.02, '#2b2b2b'); LU.tquad(c.scr, 8.2, 1.225, -6.4 + 0.021, (0, 1), 0.44, 0.31, 'OPAC')
    rbox(c.vc, T, -0.03, 0.03, 1.0, 1.05, -0.02, 0.02, '#2b2b2b'); c.block(7.93, 8.47, -6.62, -6.18, 'opac')
    c.look('opac', 8.2, -5.7, 0.7, '館藏查詢', '館藏查詢的電腦。螢幕上是上一個人查的「植物圖鑑」：館藏地＝5F 參考書，不外借。', dev='暫定的字（AA_399 3-3：方奕廷找的那一套）；AA 可以改')
    # 還書車（電梯前）
    c.vc.crbox(6.0, 6.9, 0.0, 0.9, -4.3, -3.8, '#a9aeb2', r=0.01, seg=1)
    for yy in (0.25, 0.55, 0.85): c.vc.cbox(6.02, 6.88, yy, yy + 0.02, -4.28, -3.82, '#8a8f93')
    for i in range(14): c.vc.cbox(6.05 + i * 0.058, 6.1 + i * 0.058, 0.57, 0.57 + c.rng.uniform(0.18, 0.26), -4.2, -3.98, c.rng.choice(['#7a2a2a', '#2a4a6a', '#e8dcc0', '#3a5a3a', '#c9a24a', '#2f5a3a']))
    for i in range(10): c.vc.cbox(6.05 + i * 0.07, 6.11 + i * 0.07, 0.27, 0.27 + c.rng.uniform(0.18, 0.26), -4.2, -3.98, c.rng.choice(['#7a2a2a', '#2a4a6a', '#e8dcc0', '#3a5a3a']))
    for (xx, zz) in ((6.05, -4.25), (6.85, -4.25), (6.05, -3.85), (6.85, -3.85)): csph(c.vc, (xx, 0.04, zz), 0.04, '#2b2b2b', seg=6, rings=4)
    uvquad(c.prt, [(6.25, 0.6, -3.795), (6.65, 0.6, -3.795), (6.65, 0.8, -3.795), (6.25, 0.8, -3.795)], LU.uv('CART'))
    c.block(5.98, 6.92, -4.32, -3.78, 'book_cart'); c.look('cart', 6.45, -3.2, 0.7, '還書車', '還書車上堆著今天被取下來的書，等館員歸架。', dev='暫定的字')
    # 東南：大開本的矮書架（地圖集、畫冊平放）、植物
    for (z0, z1) in ((0.4, 3.0), (3.4, 6.0)):
        c.vc.cbox(X1 - 0.5, X1, 0.0, 1.05, z0, z1, '#dcd8cc'); c.vc.cbox(X1 - 0.52, X1, 1.05, 1.08, z0 - 0.02, z1 + 0.02, '#c9c4b6')
        for yy in (0.1, 0.45, 0.78):
            c.vc.cbox(X1 - 0.5, X1, yy - 0.02, yy, z0, z1, '#c9c4b6')
            zz = z0 + 0.05
            while zz < z1 - 0.4:
                w = c.rng.uniform(0.3, 0.42); t = 0.0
                for k in range(c.rng.randint(2, 5)):
                    th = c.rng.uniform(0.02, 0.05); c.vc.cbox(X1 - 0.47, X1 - 0.05, yy + t, yy + t + th, zz, zz + w, c.rng.choice(['#2f4a6b', '#7a2321', '#e8dcb4', '#3f5d3a', '#24262a'])); t += th
                zz += w + 0.04
        c.block(X1 - 0.52, X1, z0 - 0.02, z1 + 0.02, 'flat_shelf')
    plant(c, 11.4, 7.5, 1.3); plant(c, 7.6, -8.45, 1.2)
    # 燈：每一條走道一排日光燈（沿 z）；電梯前、閱覽區另外
    aisles = [-11.0] + [x + 0.8 for x in RANGES]
    for ax in aisles:
        for (z0, z1) in BANKS:
            for zz in (z0 + 1.0, (z0 + z1) / 2, z1 - 1.0):
                c.vc.cbox(ax - 0.12, ax + 0.12, Hs - 0.06, Hs, zz - 0.62, zz + 0.62, '#f0f0ec'); c.tube.box(ax - 0.07, ax + 0.07, Hs - 0.066, Hs - 0.06, zz - 0.58, zz + 0.58)
    for (x, z) in [(x, 7.6) for x in (-9.0, -5.4, -1.8, 1.8, 5.4, 9.0)] + [(x, -0.8) for x in (-9.0, -4.0, 1.0, 6.0)] + [(8.4, -5.0), (10.6, -7.4), (9.2, 3.2), (9.2, 6.0), (-8.0, -8.1), (-2.0, -8.1), (4.0, -8.1)]:
        c.vc.cbox(x - 0.62, x + 0.62, Hs - 0.02, Hs, z - 0.32, z + 0.32, '#f4f4f1'); c.tube.box(x - 0.58, x + 0.58, Hs - 0.026, Hs - 0.02, z - 0.28, z + 0.28)
    # 牆上：請保持安靜、出口、燈光定時按鈕、滅火器
    LU.pq(c, 'N', -6.0, -5.0, 2.15, 2.4, 'QUIET', inset=0.014); LU.pq(c, 'N', 0.0, 1.0, 2.15, 2.4, 'QUIET', inset=0.014)
    LU.pq(c, 'W', 6.6, 7.4, 1.25, 1.45, 'STICK', inset=0.014); c.wg('W', 'trim', M['vc'], cm=True).cbox(X0, X0 + 0.03, 1.3, 1.4, 6.3, 6.45, '#3a3f45')
    on = c.wg('N', 'trim', M['vc'], cm=True); on.cbox(3.0, 3.6, 0.3, 1.1, Z0, Z0 + 0.03, '#c8322a'); on.cbox(3.06, 3.54, 0.36, 1.04, Z0 + 0.03, Z0 + 0.035, '#f2f2f0')
    # 出入口、配置
    dx0, dx1 = EL['doorX0'], EL['doorX1']
    c.spawn = dict(x=round((dx0 + dx1) / 2, 3), z=round(ez0 - 1.7, 3), yaw=PI, note='出電梯，面向北（電梯前）；搭電梯來的時候遊戲直接放在車廂裡（B3.buildElevator）')
    c.exits = []
    c.look('elevator', round((dx0 + dx1) / 2, 3), round(ez0 - 1.0, 3), 0.8, '搭電梯', dev='src/library_upper3d.js 的 B3.buildElevator（玻璃電梯，樓層照 library_layout.js 的 stacks.elevator.floors）')
    rows = []
    for i, (xr, cls) in enumerate(zip(RANGES, RCLS)):
        rid = 'row_' + cls.lower(); rows.append(dict(id=rid, range=f'R{i + 1}', cls=cls, name=CLSNAME[cls], x=xr))
        c.look(rid, xr, -0.8, 0.7, f'看那一排（{cls if cls != "J" else "期刊"} {CLSNAME[cls]}）' if cls != 'J' else '看那一排（期刊合訂本）',
               {'J': '一整排期刊合訂本，書背燙金的年份一年一年排下去。', '370': '370 植物學。蕨類、樹木、野花，書背上的索書號一本接一本。'}.get(cls, f'{cls} {CLSNAME[cls]}。書背上的索書號一本接一本。'),
               dev='LAWWW 接：借書（AA_399 3-2：書在 5F 書庫＝來這裡「看」那一排拿書）；暫定的字')
    c.look('row_ref', -11.0, -3.0, 0.8, '看那一排（參考書）', '最裡面靠牆的一排是參考書：大開本的圖鑑、手冊、辭典，每一格都貼著「參考書　不外借」。植物圖鑑一套八冊，綠色的書背。',
           dev='AA_399 3-3：方奕廷找的植物圖鑑（只能在這裡看）；LAWWW 接借書時，這一排不能借；暫定的字')
    c.lay_extra = dict(
        windows=c.wins, rows=rows + [dict(id='row_ref', range='西牆', cls='REF', name='參考書（不外借）', x=round(X0 + SHD / 4 + 0.01, 3))],
        banks=[dict(z0=a, z1=b) for (a, b) in BANKS],
        spots=dict(fang=dict(x=-11.0, z=FANG_Z, yaw=-PI / 2, note='方奕廷：最裡面那一排（西牆的參考書）前，面向書架、站著翻植物圖鑑（AA_399 3-3：大二上第 12～14 週，週二 15～17）'),
                   fang_look=dict(x=-11.0, z=round(FANG_Z + 1.4, 3), yaw=PI, note='玩家走到最裡面那一排、看到方奕廷的位置（面向北，他在前面 1.4 m）'),
                   ref_plant=dict(x=round(X0 + SHD / 2, 3), y=LEVELS[3], z=FANG_Z, note='植物圖鑑那一格（西牆參考書、北段中間、第四層）'),
                   elevator_out=dict(c.spawn), reading=dict(x=-1.8, z=7.4, yaw=0.0, note='南邊窗下的閱覽桌前')),
        nodes={})


def finish(c, js_key):
    D = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}
    for k, ms in c.WG.items():
        for key, m in ms.items():
            uv = key in ('wall', 'wain', 'door', 'side'); mg = key not in ('print', 'screen', 'view', 'glass', 'frost', 'side_print')
            props = dict({'dir': D.get(k) or c.PDIR.get(k, [0, 0, 1])}, **c.WGP.get(k, {}))
            m.finish(c.root, props=props, uv=uv, merge=mg)
    for m in (c.vc, c.vm, c.tube, c.warm, c.fridgel, c.steel): m.finish(c.root, uv=False)
    c.wood.finish(c.root)
    for m in (c.prt, c.scr): m.finish(c.root, uv=False, merge=False)
    for m in c.extra.values(): m.finish(c.root, uv=False)
    for nm, m in c.nodes.items(): m.finish(c.root, uv=False, merge=False)
    for ob in list(c.root.children_recursive):   # 分間牆：拿掉 WALL_ 字首（不淡出）
        if ob.type == 'MESH' and ob.name.startswith('WALL_') and ('_side' in ob.name): ob.name = ob.name.replace('WALL_', 'CARREL_', 1)
    keep = lambda ob: ob.name.startswith(('WALL_', 'CARREL', 'SIS_', 'STICKY', 'GLOW_'))
    L.merge_by_material(c.root, keep=keep, key=lambda ob: '')
    out = os.path.join(OUTDIR, f'{c.sid}.glb'); st = L.export(out, gpu_instances=True)
    tris = 0; seen = set()
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    lay = dict(version=1, zone=c.sid, name=c.T['name'], label=c.T['sub'], src='使用者 10-23；AA_399 第 3 節（AA-B）；CLOSED-SPACES-1023（LAWWW2-B）',
               bounds=dict(x0=c.X0, x1=c.X1, z0=c.Z0, z1=c.Z1), h=c.h, cam_dist=4.4, spawn=c.spawn, doors=[], exits=c.exits, seats=c.seats, interact=c.inter, blocks=c.blocks, order=None, **c.lay_extra)
    auto_ap(c, lay)
    prob = navcheck(c, lay)
    lay['navcheck'] = dict(cell=0.4, inset=0.25, problems=prob, ap=sum(1 for s_ in lay['seats'] if s_.get('ap')))
    L.write_json(os.path.join(OUTDIR, f'{c.sid}.layout.json'), lay)
    L.write_json(out[:-4] + '.json', dict(st if isinstance(st, dict) else {}, tris_total=tris, layout=f'{c.sid}.layout.json', seats=len(c.seats)))
    print(json.dumps({'zone': c.sid, 'tris': tris, 'seats': len(c.seats), 'problems': prob}, ensure_ascii=False))
    return lay, prob


def write_js(lays):
    if not arg('--js'): return
    p = os.path.join(arg('--js'), 'src/data/library_upper_layouts.js')
    cur = {}
    if os.path.exists(p):
        s = open(p, encoding='utf-8').read(); cur = json.loads(s[s.index('{', s.index('LIBRARY_UPPER_LAYOUTS=')):s.rindex('}') + 1])
    for k, lay in lays.items():
        j = dict(lay); j.pop('navcheck', None); cur[k] = j
    open(p, 'w', encoding='utf-8').write('/* 總圖研究小間（2F 東側）、5F 書庫的配置（從 assets/models/env/second_ai/library_{carrels,stacks}.layout.json 產生：'
                                         'tools/blender/env_second/library_upper.py --js <repo>；不要手改）*/\nconst LIBRARY_UPPER_LAYOUTS=' + json.dumps(cur, ensure_ascii=False) + ';\n')


if __name__ == '__main__':
    part = arg('--part', 'all'); lays = {}; probs = []
    if part in ('carrels', 'all'):
        H = 3.0; make_tex_carrels()
        floor = None
        c = Up.__new__(Up)
        B.reset(texres=512)
        floor_mat = lambda sid: L.pbr(f'{sid}_carpet', 'dirty_carpet', tile=1.0, target='#a3a8ab', contrast=0.5, normal=0.35, maps=('diff', 'nor'), res=512, rough_value=0.95)
        c.__init__('library_carrels', '總圖 2F 研究小間', '研究小間 01–10', (CX0, CX1, CZ0, CZ1), H, None, REGC, 'library_carrels_print.png')
        c.M['floor'] = floor_mat(c.sid); c.h = H
        c.M['sky'] = L.flat('CARREL_SKY', '#eef3f6', rough=0.4, emit=B.srgb('#dfe8f0'))
        c.extra['library_carrels_lampoff'] = Mesh('library_carrels_lampoff', L.flat('library_carrels_lampoff', '#ece6d6', rough=0.5))   # 其他間的檯燈：關著（不發光）
        build_carrels(c); lay, p = finish(c, 'carrels'); lays['carrels'] = lay; probs += p
    if part in ('stacks', 'all'):
        H = HS; make_tex_stacks()
        c = Up.__new__(Up); c.__init__('library_stacks', '總圖 5F 書庫', '5F 書庫（自然科學）', (SX0, SX1, SZ0, SZ1), HS, None, REGS, 'library_stacks_print.png'); c.h = HS
        c.M['floor'] = L.pbr(f'{c.sid}_floor', 'linoleum_brown', tile=1.6, target='#d3cdbf', contrast=0.45, normal=0.2, maps=('diff', 'nor'), res=512, rough_value=0.35)
        build_stacks(c); lay, p = finish(c, 'stacks'); lays['stacks'] = lay; probs += p
    write_js(lays)
    print('LIBRARY_UPPER', 'OK' if not probs else probs)
