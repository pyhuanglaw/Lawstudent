"""第三個房間（主線 5，大三 507；1A-03）、第四個房間（主線 10，大四 409；1A-09）：拆箱以後房間裡多出來的東西 → GLB（SCN-V4-01／SCN-V5-01）。
LAWWW-C 的美術子代理 2026-10-20（使用者 18:5x「負責美術的 ai 做不完就請其他 ai 幫忙」；LAWWW2-C 19:13 建議把 507、409 的拆箱小道具交給子代理，做完它驗收）。
照 dorm_y2_items.py 的做法。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/dorm_y3_items.py [-- --out assets/models/env/second_ai/dorm_y3_items.glb]

故事（story3d.js 的 S.ROOM_Y3_TEXT、S.ROOM_Y4_TEXT；只有經歷過的才拿得出來）：每一件是一個節點 ITEM_<id>（id 和 story3d.js 的 key 一樣），遊戲照
F.ROOM_Y3_ITEMS／ROOM_Y4_ITEMS（扣掉 ROOM_Y3_DISCARD、BOX_KEPT_Y4）決定顯示哪幾個（zones3d.js 的 setY2Items 一起管 dorm_y2_items 和這一個）。
  大三（507，ROOM_Y3_TEXT）：
  ITEM_notes_y2   一疊大二的筆記（書桌左前，三本 B5 疊著）            ITEM_sis_plan  學姊研究計畫的第二段（疊在筆記上，邊邊有鉛筆字）
  ITEM_article    學姊給的那篇文章（書桌前緣那一疊紙最下面）          ITEM_zq_usb    「測試版　不准外流」的隨身碟（筆電前面；標籤沒有字）
  ITEM_zhe_notes  阿哲還回來的民法筆記＋兩張便利貼（層架右格直立）    ITEM_fafu_form 空白的筆錄紙，只寫了日期（衣櫃門上，紙膠帶貼著）
  ITEM_game_y2    系籃比賽的節目單（衣櫃門上）                        ITEM_expo      交換說明會的手冊（書桌後面靠牆立著，折了一個角）
  ITEM_welcome_badge 小隊輔的名牌（掛繩掛在床欄上）                   ITEM_vac_C02   營隊的隊輔名牌（掛繩掛在床欄上）
  ITEM_vac_C03    日語單字卡（一圈，書桌右後）                        ITEM_vac_C08   首爾地鐵的交通卡（筆電前面）
  ITEM_vac_C09    服務隊的隊服（搭在床欄上，洗很多次、字快看不見）    ITEM_vac_C10   加州的結業證書（衣櫃門上）
  ITEM_vac_C11    東京的課程講義（書桌前緣那一疊，有一頁畫了重點）    ITEM_vac_C12   京都茶室的明信片（衣櫃門上；沒有寄出去）
  大四（409，ROOM_Y4_TEXT；大三的東西照舊帶過來）：
  ITEM_form       志願表（衣櫃門上；子節點 FORM_STAMP＝系辦的章：日本、美國路線才有，遊戲照路線開關）
  ITEM_cold       便利商店的塑膠袋（衣櫃前的地上；裝了別的東西）      ITEM_land      大伯那塊地的謄本影本（書桌前緣那一疊，透明夾）
  ITEM_jp_key     日本宿舍的鑰匙圈（掛在衣櫃把手上；只剩圈圈）        ITEM_postcards 一疊英國的明信片（衣櫃門下面，三張）
  ITEM_credits    發表會的製作名單（衣櫃門上，有一行畫了螢光筆）      ITEM_field     語彤田野筆記的影本（書桌前緣那一疊最上面）
位置（遊戲 dorm 區域，四人房 dorm_room4.glb，祐廷＝L2＝左牆靠門那組；座標見 dorm_room4.py 的 loft()）：
  書桌沿左牆 z −0.96～0.315、桌面 0.76、前緣 x −2.28；層架 z −0.51～0.19、底板頂 1.018；筆電 x −2.70～−2.46、z −0.47～−0.13；
  衣櫃 z 0.34～0.935、門面 x −2.30（面朝 +x）、把手 (x −2.285, z 0.40, y 0.70～1.15)；床欄（實心）z −0.98～0.94、y 1.48～2.02、朝房間那一面 x −1.95。
  大二的東西（dorm_y2_items.glb）用掉了軟木板、書桌左邊的書堆、螢光筆和筆記本、層架上面的泡麵——這裡不和它們重疊。
每一件只有一個網格 y3_<id>、整組只有兩個材質（y3_print、床欄上的 seethru_y3_print）：一件只多一次 draw call；訂書針、鑰匙圈、掛繩這些單色零件貼貼圖集的 c_* 色塊。
床欄上的東西（隊服、兩條掛繩）材質名字 seethru_*：和上舖同一套（zones3d.js loadY2Items 照 attachDormInterior 標 userData.seeThrough）。
印刷品（證書、節目單、明信片、表格、講義、名牌、交通卡、隊服的字）是本作程式畫的圖（PIL），**沒有任何文字、店名、商標**（D77）。
"""
import json, math, os, sys, random
from PIL import Image, ImageDraw, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/dorm_y3_items.glb'))
GEN = os.path.join(HERE, 'textures', 'gen'); os.makedirs(GEN, exist_ok=True); ATLAS = os.path.join(GEN, 'dorm_y3_print.png')
rng = random.Random(507)

# ---------------- 印刷品貼圖（1024×1024，本作程式畫的；沒有字）----------------
AW, AH = 1024, 1024
SOLID = {'c_staple': (154, 160, 166), 'c_usb': (44, 48, 54), 'c_usbmetal': (200, 204, 210), 'c_flag': (242, 216, 78), 'c_metal': (184, 188, 194),
         'c_navy': (43, 63, 115), 'c_orange': (224, 122, 42), 'c_clip': (192, 196, 202), 'c_white': (238, 240, 238), 'c_shirt': (50, 104, 82), 'c_collar': (34, 80, 62), 'c_cuff': (88, 130, 108)}   # 單色的小零件（訂書針、隨身碟、鑰匙圈、掛繩、提把、隊服的袖子）：和紙用同一個材質，一件只要一次 draw call
SIZES = [   # 名稱, 寬, 高（像素）：照順序一列一列排
    ('cert', 300, 212), ('program', 150, 212), ('form', 160, 226), ('fafu', 160, 226), ('credits', 150, 212),
    ('kyoto', 210, 142), ('post1', 210, 142), ('post2', 210, 142), ('post3', 210, 142),
    ('sis_plan', 170, 240), ('article', 170, 240), ('c11', 170, 240), ('land', 170, 240), ('field', 170, 240),
    ('note_a', 128, 180), ('note_b', 128, 180), ('note_c', 128, 180), ('zhe', 128, 180), ('expo', 120, 170),
    ('shirt', 256, 200), ('bag', 128, 128), ('badge1', 90, 126), ('badge2', 90, 126), ('tmoney', 64, 100),
    ('pages', 180, 24), ('usb_label', 64, 24), ('wordcard', 64, 32), ('stamp', 48, 48), ('tape', 32, 32), ('sticky', 32, 32),
    ('holder', 32, 32), ('tag', 48, 36), ('paper_back', 32, 32), ('plastic', 32, 32)] + [(k, 16, 16) for k in SOLID]
R = {}
cx, cy, rowh = 4, 4, 0
for nm, w, h in SIZES:
    if cx + w + 4 > AW: cx, cy, rowh = 4, cy + rowh + 6, 0
    R[nm] = (cx, cy, cx + w, cy + h); cx += w + 6; rowh = max(rowh, h)
assert cy + rowh <= AH, ('貼圖集放不下', cy + rowh)


def draw_atlas():
    im = Image.new('RGB', (AW, AH), (200, 200, 200)); d = ImageDraw.Draw(im)
    def box(k): return R[k]
    def fill(k, c): d.rectangle(box(k), fill=c)
    def scribble(bx, col, rows, w=2, amp=3, seed=0, gap=None):   # 手寫的筆跡（波浪線，不是字）
        r = random.Random(seed); x0, y0, x1, y1 = bx
        for k in range(rows):
            y = y0 + (k + 0.5) * (y1 - y0) / rows; xe = x1 - r.uniform(0, (x1 - x0) * 0.35); pts = []; x = x0
            while x < xe: pts.append((x, y + amp * math.sin(x * r.uniform(0.25, 0.4)) + r.uniform(-1, 1))); x += 3
            if len(pts) > 1: d.line(pts, fill=col, width=w)
    def textlines(bx, rows, col=(150, 150, 150), h=4, short_every=5, seed=1, indent=0):   # 印刷的字行（灰色的條）
        r = random.Random(seed); x0, y0, x1, y1 = bx; step = (y1 - y0) / rows
        for k in range(rows):
            y = int(y0 + k * step); xs = x0 + (indent if k % short_every == 0 else 0); xe = x1 - (r.randint(10, (x1 - x0) // 3) if k % short_every == short_every - 1 else 0)
            d.rectangle((xs, y, xe, y + h), fill=col)
    # 加州的結業證書：米色、金色雙框、標題的深色條、三行字、兩個簽名、金色封印＋紅緞帶
    x0, y0, x1, y1 = box('cert'); fill('cert', (244, 236, 214))
    d.rectangle((x0 + 6, y0 + 6, x1 - 6, y1 - 6), outline=(184, 150, 74), width=4); d.rectangle((x0 + 14, y0 + 14, x1 - 14, y1 - 14), outline=(196, 170, 104), width=1)
    d.rectangle((x0 + 70, y0 + 34, x1 - 70, y0 + 46), fill=(70, 62, 52)); d.rectangle((x0 + 100, y0 + 56, x1 - 100, y0 + 62), fill=(140, 128, 108))
    d.rectangle((x0 + 90, y0 + 84, x1 - 90, y0 + 96), fill=(40, 40, 60))   # 名字那一行（印的，沒有字）
    textlines((x0 + 50, y0 + 110, x1 - 50, y0 + 140), 3, col=(160, 150, 136), h=3, seed=3)
    for sx in (x0 + 150, x1 - 70):
        scribble((sx - 50, y1 - 52, sx + 20, y1 - 38), (30, 40, 90), 1, w=2, amp=5, seed=sx); d.line((sx - 55, y1 - 34, sx + 25, y1 - 34), fill=(120, 110, 96), width=1)
    scx, scy = x0 + 46, y1 - 46
    d.polygon([(scx + 9, scy + 18), (scx + 2, scy + 40), (scx + 12, scy + 34), (scx + 18, scy + 44), (scx + 20, scy + 20)], fill=(170, 40, 46))
    d.polygon([(scx - 9, scy + 18), (scx - 2, scy + 40), (scx - 12, scy + 34), (scx - 18, scy + 44), (scx - 20, scy + 20)], fill=(150, 32, 40))
    pts = [(scx + (24 if k % 2 == 0 else 20) * math.cos(k * math.pi / 12), scy + (24 if k % 2 == 0 else 20) * math.sin(k * math.pi / 12)) for k in range(24)]
    d.polygon(pts, fill=(206, 168, 72)); d.ellipse((scx - 14, scy - 14, scx + 14, scy + 14), outline=(160, 124, 44), width=2)
    # 系籃比賽的節目單（A5 直式）：上半深藍、橘色籃球、兩條白色標題塊；下半灰色賽程表
    x0, y0, x1, y1 = box('program'); fill('program', (246, 244, 238)); d.rectangle((x0, y0, x1, y0 + 118), fill=(30, 48, 92))
    bx_, by_, br = x0 + 104, y0 + 64, 30; d.ellipse((bx_ - br, by_ - br, bx_ + br, by_ + br), fill=(228, 116, 40))
    d.line((bx_ - br, by_, bx_ + br, by_), fill=(60, 30, 16), width=2); d.line((bx_, by_ - br, bx_, by_ + br), fill=(60, 30, 16), width=2)
    d.arc((bx_ - br - 22, by_ - br, bx_ + br - 22, by_ + br), -60, 60, fill=(60, 30, 16), width=2); d.arc((bx_ - br + 22, by_ - br, bx_ + br + 22, by_ + br), 120, 240, fill=(60, 30, 16), width=2)
    d.rectangle((x0 + 12, y0 + 18, x0 + 70, y0 + 32), fill=(250, 250, 250)); d.rectangle((x0 + 12, y0 + 40, x0 + 56, y0 + 48), fill=(232, 182, 60))
    d.rectangle((x0, y0 + 112, x1, y0 + 118), fill=(232, 116, 40))
    for k in range(6):
        yy = y0 + 132 + k * 12; d.rectangle((x0 + 10, yy, x1 - 10, yy + 9), outline=(170, 170, 170), width=1); d.rectangle((x0 + 14, yy + 3, x0 + 54, yy + 6), fill=(130, 130, 130))
        d.rectangle((x1 - 40, yy + 3, x1 - 16, yy + 6), fill=(130, 130, 130))
    # 志願表（B5 直式）：灰色表頭、6 列 3 欄的表格；空白的（台灣路線）／影本＋章（FORM_STAMP 另外一塊）
    x0, y0, x1, y1 = box('form'); fill('form', (248, 248, 244)); d.rectangle((x0 + 12, y0 + 12, x1 - 12, y0 + 30), fill=(140, 140, 140))
    gx0, gy0, gx1, gy1 = x0 + 12, y0 + 44, x1 - 12, y1 - 40
    for k in range(7): yy = gy0 + (gy1 - gy0) * k / 6; d.line((gx0, yy, gx1, yy), fill=(120, 120, 120), width=1)
    for xx in (gx0, gx0 + 42, gx0 + 92, gx1): d.line((xx, gy0, xx, gy1), fill=(120, 120, 120), width=1)
    for k in range(6): d.rectangle((gx0 + 5, gy0 + (gy1 - gy0) * k / 6 + 10, gx0 + 34, gy0 + (gy1 - gy0) * k / 6 + 14), fill=(150, 150, 150))
    d.rectangle((x0 + 12, y1 - 28, x0 + 70, y1 - 24), fill=(150, 150, 150)); d.line((x0 + 76, y1 - 22, x1 - 14, y1 - 22), fill=(120, 120, 120), width=1)
    # 空白的筆錄紙（B5 直式）：表頭、格線；只有最上面的日期寫了（藍筆）
    x0, y0, x1, y1 = box('fafu'); fill('fafu', (249, 248, 243)); d.rectangle((x0 + 30, y0 + 12, x1 - 30, y0 + 24), fill=(120, 120, 120))
    d.rectangle((x0 + 12, y0 + 34, x0 + 44, y0 + 38), fill=(150, 150, 150)); scribble((x0 + 50, y0 + 30, x0 + 110, y0 + 40), (40, 60, 150), 1, w=2, amp=2, seed=11)
    for k in range(13): yy = y0 + 54 + k * 13; d.line((x0 + 12, yy, x1 - 12, yy), fill=(176, 186, 200), width=1)
    d.rectangle((x0 + 12, y0 + 48, x1 - 12, y1 - 12), outline=(150, 150, 150), width=1)
    # 發表會的製作名單：置中的短字行；其中一行畫了淡黃色螢光筆
    x0, y0, x1, y1 = box('credits'); fill('credits', (250, 250, 250)); d.rectangle((x0 + 40, y0 + 16, x1 - 40, y0 + 26), fill=(60, 60, 60))
    for k in range(13):
        yy = y0 + 42 + k * 12; w_ = random.Random(k).randint(30, 64); cxm = (x0 + x1) // 2
        if k == 8: d.rectangle((cxm - w_ // 2 - 6, yy - 3, cxm + w_ // 2 + 6, yy + 7), fill=(250, 238, 120))
        d.rectangle((cxm - w_ // 2, yy, cxm + w_ // 2, yy + 4), fill=(140, 140, 140))
    # 京都茶室的明信片：天空、樹、茶室（深色屋頂、米色牆、木框）、石板路
    x0, y0, x1, y1 = box('kyoto')
    for yy in range(y0, y1): t = (yy - y0) / (y1 - y0); d.line((x0, yy, x1, yy), fill=(int(186 + 40 * t), int(206 + 20 * t), int(222 - 10 * t)))
    for k in range(9): rx_ = x0 + rng.randint(0, 200); ry_ = y0 + rng.randint(30, 70); rr = rng.randint(18, 30); d.ellipse((rx_ - rr, ry_ - rr, rx_ + rr, ry_ + rr), fill=(rng.randint(60, 90), rng.randint(110, 140), rng.randint(60, 80)))
    d.rectangle((x0, y0 + 96, x1, y1), fill=(120, 132, 96)); d.polygon([(x0 + 52, y0 + 66), (x0 + 160, y0 + 66), (x0 + 176, y0 + 82), (x0 + 36, y0 + 82)], fill=(58, 52, 48))
    d.rectangle((x0 + 48, y0 + 82, x0 + 164, y0 + 116), fill=(226, 214, 188)); [d.line((xx, y0 + 82, xx, y0 + 116), fill=(96, 70, 48), width=2) for xx in range(x0 + 48, x0 + 166, 23)]
    d.rectangle((x0 + 92, y0 + 94, x0 + 118, y0 + 116), fill=(70, 56, 44))
    for k in range(6): d.ellipse((x0 + 98 + k * 10 - 6, y0 + 120 + k * 3, x0 + 98 + k * 10 + 6, y0 + 126 + k * 3), fill=(176, 172, 160))
    d.rectangle(box('kyoto'), outline=(250, 250, 250), width=5)
    # 英國的明信片三張：①灰天、紅色雙層巴士 ②公園、長椅、樹 ③一排彩色門的連棟房子
    x0, y0, x1, y1 = box('post1'); fill('post1', (176, 182, 190)); d.rectangle((x0, y0 + 100, x1, y1), fill=(96, 96, 100))
    for k in range(5): d.rectangle((x0 + 6 + k * 42, y0 + 30 + (k % 2) * 12, x0 + 40 + k * 42, y0 + 100), fill=(rng.randint(120, 160), rng.randint(110, 140), rng.randint(100, 130)))
    d.rounded_rectangle((x0 + 50, y0 + 56, x0 + 160, y0 + 118), 8, fill=(196, 40, 36)); d.rectangle((x0 + 58, y0 + 62, x0 + 152, y0 + 76), fill=(220, 226, 230)); d.rectangle((x0 + 58, y0 + 86, x0 + 152, y0 + 98), fill=(220, 226, 230))
    for xx in (x0 + 72, x0 + 138): d.ellipse((xx - 9, y0 + 110, xx + 9, y0 + 128), fill=(30, 30, 30))
    d.rectangle(box('post1'), outline=(250, 250, 250), width=5)
    x0, y0, x1, y1 = box('post2'); fill('post2', (190, 210, 226)); d.rectangle((x0, y0 + 70, x1, y1), fill=(96, 150, 82))
    for k in range(4): tx = x0 + 20 + k * 52; d.rectangle((tx + 14, y0 + 60, tx + 20, y0 + 96), fill=(90, 66, 44)); d.ellipse((tx - 4, y0 + 22, tx + 38, y0 + 70), fill=(56 + k * 8, 110, 60))
    d.rectangle((x0 + 70, y0 + 104, x0 + 140, y0 + 110), fill=(120, 84, 52)); d.rectangle((x0 + 74, y0 + 110, x0 + 78, y0 + 122), fill=(60, 60, 60)); d.rectangle((x0 + 132, y0 + 110, x0 + 136, y0 + 122), fill=(60, 60, 60))
    d.rectangle(box('post2'), outline=(250, 250, 250), width=5)
    x0, y0, x1, y1 = box('post3'); fill('post3', (200, 206, 214)); d.rectangle((x0, y0 + 112, x1, y1), fill=(150, 150, 146))
    for k in range(4):
        hx = x0 + 6 + k * 50; d.rectangle((hx, y0 + 30, hx + 48, y0 + 112), fill=(222, 210, 190)); d.polygon([(hx, y0 + 30), (hx + 24, y0 + 14), (hx + 48, y0 + 30)], fill=(90, 80, 80))
        d.rectangle((hx + 16, y0 + 74, hx + 32, y0 + 112), fill=[(40, 70, 130), (170, 40, 46), (40, 110, 70), (230, 190, 60)][k]); d.rectangle((hx + 6, y0 + 40, hx + 20, y0 + 60), fill=(180, 200, 220)); d.rectangle((hx + 28, y0 + 40, hx + 42, y0 + 60), fill=(180, 200, 220))
    d.rectangle(box('post3'), outline=(250, 250, 250), width=5)
    # 學姊研究計畫（印出來的）：字行、第二段鉛筆括起來、邊邊很多鉛筆字
    x0, y0, x1, y1 = box('sis_plan'); fill('sis_plan', (250, 250, 248)); d.rectangle((x0 + 30, y0 + 14, x1 - 30, y0 + 22), fill=(80, 80, 80))
    textlines((x0 + 26, y0 + 36, x1 - 26, y0 + 92), 7, seed=21); textlines((x0 + 26, y0 + 104, x1 - 26, y0 + 176), 9, seed=22); textlines((x0 + 26, y0 + 188, x1 - 26, y1 - 14), 6, seed=23)
    d.line((x0 + 20, y0 + 102, x0 + 16, y0 + 178), fill=(110, 110, 116), width=2)
    for k in range(6): scribble((x0 + 4 if k % 2 == 0 else x1 - 24, y0 + 30 + k * 32, x0 + 22 if k % 2 == 0 else x1 - 4, y0 + 50 + k * 32), (112, 112, 120), 2, w=1, amp=2, seed=40 + k)
    # 學姊給的那篇文章：粗標題、兩欄字行、黃色螢光筆
    x0, y0, x1, y1 = box('article'); fill('article', (247, 246, 240)); d.rectangle((x0 + 18, y0 + 14, x1 - 18, y0 + 26), fill=(50, 50, 50)); d.rectangle((x0 + 40, y0 + 32, x1 - 40, y0 + 36), fill=(130, 130, 130))
    for c in range(2):
        cx0 = x0 + 14 + c * 74; textlines((cx0, y0 + 48, cx0 + 66, y1 - 14), 22, seed=30 + c, h=3)
    for (yy, c) in ((y0 + 84, 0), (y0 + 140, 1), (y0 + 150, 1)): d.rectangle((x0 + 14 + c * 74, yy - 2, x0 + 80 + c * 74, yy + 5), fill=(250, 236, 120))
    textlines((x0 + 14, y0 + 48, x0 + 80, y1 - 14), 22, seed=30, h=3); textlines((x0 + 88, y0 + 48, x0 + 154, y1 - 14), 22, seed=31, h=3)
    # 東京的課程講義：字行、有一段畫了重點、邊邊一顆星
    x0, y0, x1, y1 = box('c11'); fill('c11', (250, 250, 250)); d.rectangle((x0 + 20, y0 + 14, x1 - 60, y0 + 24), fill=(70, 70, 90))
    d.rectangle((x0 + 22, y0 + 96, x1 - 22, y0 + 134), fill=(250, 238, 140)); textlines((x0 + 24, y0 + 36, x1 - 24, y1 - 16), 18, seed=50)
    sxs, sys_ = x1 - 14, y0 + 112; d.polygon([(sxs + 8 * math.cos(-math.pi / 2 + k * math.pi / 5) * (1 if k % 2 == 0 else 0.45), sys_ + 8 * math.sin(-math.pi / 2 + k * math.pi / 5) * (1 if k % 2 == 0 else 0.45)) for k in range(10)], outline=(200, 40, 40))
    # 謄本影本（影印：偏灰、邊緣暗、有噪點）：表格 16 列
    x0, y0, x1, y1 = box('land'); fill('land', (232, 232, 228)); d.rectangle((x0 + 24, y0 + 12, x1 - 24, y0 + 22), fill=(90, 90, 90))
    for k in range(17): yy = y0 + 34 + k * 11.5; d.line((x0 + 10, yy, x1 - 10, yy), fill=(110, 110, 110), width=1)
    for xx in (x0 + 10, x0 + 30, x0 + 96, x1 - 10): d.line((xx, y0 + 34, xx, y0 + 34 + 16 * 11.5), fill=(110, 110, 110), width=1)
    for k in range(16): d.rectangle((x0 + 36, y0 + 38 + k * 11.5, x0 + 36 + random.Random(k).randint(28, 54), y0 + 41 + k * 11.5), fill=(120, 120, 120))
    d.ellipse((x1 - 46, y1 - 46, x1 - 14, y1 - 14), outline=(120, 120, 120), width=2)
    # 語彤田野筆記的影本：格線＋手寫（灰）
    x0, y0, x1, y1 = box('field'); fill('field', (236, 236, 232))
    for k in range(17): yy = y0 + 18 + k * 13; d.line((x0 + 8, yy, x1 - 8, yy), fill=(200, 200, 200), width=1)
    scribble((x0 + 12, y0 + 10, x1 - 10, y1 - 30), (86, 86, 92), 16, w=2, amp=3, seed=61)
    # 筆記本封面三色、阿哲的筆記（深紅）、書口
    for k, col in (('note_a', (64, 96, 140)), ('note_b', (70, 122, 90)), ('note_c', (150, 66, 60)), ('zhe', (118, 34, 40))):
        x0, y0, x1, y1 = box(k); fill(k, col); d.rectangle((x0, y0, x0 + 14, y1), fill=tuple(int(c * 0.7) for c in col))
        d.rectangle((x0 + 34, y0 + 30, x1 - 18, y0 + 62), fill=(242, 240, 232)); d.rectangle((x0 + 40, y0 + 40, x1 - 30, y0 + 44), fill=(170, 170, 170))
    x0, y0, x1, y1 = box('pages'); fill('pages', (240, 236, 224))
    for yy in range(y0 + 2, y1, 3): d.line((x0, yy, x1, yy), fill=(220, 214, 198))
    # 交換說明會的手冊：藍色封面、抽象的世界地圖、白色帶（沒有字）
    x0, y0, x1, y1 = box('expo'); fill('expo', (40, 92, 140))
    for k in range(7): ex, ey = x0 + rng.randint(10, 100), y0 + rng.randint(20, 110); d.ellipse((ex, ey, ex + rng.randint(16, 38), ey + rng.randint(10, 24)), fill=(102, 162, 112))
    d.rectangle((x0, y0 + 130, x1, y0 + 150), fill=(246, 244, 236)); d.rectangle((x0 + 10, y0 + 137, x0 + 70, y0 + 143), fill=(80, 100, 130))
    # 隊服（洗很多次的深綠棉 T）：布紋、胸前淡掉的白色圖（沒有字）、領口
    x0, y0, x1, y1 = box('shirt')
    for yy in range(y0, y1):
        for xx in range(x0, x1, 2): v = rng.randint(-6, 6); d.line((xx, yy, xx + 1, yy), fill=(46 + v, 104 + v, 80 + v))
    # 上半件倒掛在床欄朝房間那一面：胸前的圖在下襬（領口）往上 10～20 cm、上下顛倒；洗很多次＝和布的顏色差很少
    d.ellipse((x0 + 100, y0 + 94, x0 + 156, y0 + 146), outline=(98, 140, 118), width=5); d.rectangle((x0 + 74, y0 + 80, x0 + 182, y0 + 87), fill=(92, 134, 112))
    d.rectangle((x0 + 88, y0 + 68, x0 + 168, y0 + 73), fill=(84, 126, 104))
    # 塑膠袋：白色、皺褶、淡綠的細條（沒有店名）
    x0, y0, x1, y1 = box('bag'); fill('bag', (238, 240, 238))
    for k in range(14): wx_ = x0 + rng.randint(0, 120); d.line((wx_, y0, wx_ + rng.randint(-20, 20), y1), fill=(214, 218, 216), width=2)
    d.rectangle((x0, y0 + 40, x1, y0 + 48), fill=(120, 190, 150))
    # 名牌：小隊輔（紫色帶）、營隊（綠色帶，太陽塗鴉）；中間是手寫的名字（黑色麥克筆的筆跡）
    for k, col in (('badge1', (106, 79, 176)), ('badge2', (60, 150, 90))):
        x0, y0, x1, y1 = box(k); fill(k, (250, 250, 248)); d.rectangle((x0, y0, x1, y0 + 26), fill=col); d.rectangle((x0 + 20, y0 + 10, x1 - 20, y0 + 16), fill=(250, 250, 250))
        scribble((x0 + 12, y0 + 50, x1 - 8, y0 + 80), (24, 24, 28), 1, w=4, amp=6, seed=ord(k[-1])); d.rectangle((x0, y1 - 14, x1, y1), fill=col)
        if k == 'badge2':
            d.ellipse((x1 - 30, y0 + 86, x1 - 12, y0 + 104), outline=(240, 160, 40), width=2)
            for a in range(8): d.line((x1 - 21 + 11 * math.cos(a * math.pi / 4), y0 + 95 + 11 * math.sin(a * math.pi / 4), x1 - 21 + 15 * math.cos(a * math.pi / 4), y0 + 95 + 15 * math.sin(a * math.pi / 4)), fill=(240, 160, 40), width=2)
    fill('holder', (236, 242, 246))
    # 交通卡：粉橘漸層、斜條紋（沒有字、沒有標誌）
    x0, y0, x1, y1 = box('tmoney'); tw, th = x1 - x0, y1 - y0; tm = Image.new('RGB', (tw, th)); td = ImageDraw.Draw(tm)   # 另外畫再貼上：斜條紋不會畫到旁邊的書口（pages）
    for yy in range(th): t = yy / th; td.line((0, yy, tw, yy), fill=(int(240 - 20 * t), int(120 + 60 * t), int(140 - 40 * t)))
    for k in range(5): td.line((k * 18 - 20, th, k * 18 + 30, 0), fill=(250, 220, 200), width=4)
    td.rounded_rectangle((8, 8, 30, 24), 3, fill=(250, 246, 236)); im.paste(tm, (x0, y0))
    # 隨身碟的標籤：白底、紅色斜條（沒有字）；單字卡：白卡、藍色上緣、手寫
    x0, y0, x1, y1 = box('usb_label'); fill('usb_label', (250, 250, 250)); d.polygon([(x0 + 10, y1), (x0 + 22, y0), (x0 + 30, y0), (x0 + 18, y1)], fill=(210, 40, 40))
    x0, y0, x1, y1 = box('wordcard'); fill('wordcard', (252, 252, 250)); d.rectangle((x0, y0, x1, y0 + 4), fill=(70, 110, 180)); scribble((x0 + 8, y0 + 10, x1 - 8, y1 - 6), (40, 40, 50), 1, w=2, amp=2, seed=71)
    # 系辦的章（紅色圓、有一點歪）；紙膠帶；便利貼；紙背面；透明夾；鑰匙圈的壓克力牌
    x0, y0, x1, y1 = box('stamp'); fill('stamp', (248, 248, 244)); d.ellipse((x0 + 5, y0 + 5, x1 - 5, y1 - 5), outline=(200, 52, 52), width=3); d.ellipse((x0 + 10, y0 + 10, x1 - 10, y1 - 10), outline=(214, 104, 104), width=1)
    for k, (a, b) in enumerate(((17, 31), (15, 33), (18, 30))): d.line((x0 + a, y0 + 17 + k * 7, x0 + b, y0 + 17 + k * 7), fill=(204, 64, 64), width=2)   # 章裡的字：三行短短的紅色筆畫（不是字；一條粗槓看起來像禁止標誌）
    x0, y0, x1, y1 = box('tape'); fill('tape', (230, 216, 178))
    for xx in range(x0, x1, 4): d.line((xx, y0, xx, y1), fill=(222, 206, 166))
    fill('sticky', (246, 222, 96)); fill('paper_back', (238, 236, 230)); fill('plastic', (222, 230, 234))
    x0, y0, x1, y1 = box('tag'); fill('tag', (150, 196, 226)); d.ellipse((x0 + 14, y0 + 8, x1 - 14, y1 - 8), fill=(246, 250, 252)); d.ellipse((x0 + 4, y0 + 4, x0 + 10, y0 + 10), fill=(90, 120, 140))
    im = im.filter(ImageFilter.GaussianBlur(0.5)); d = ImageDraw.Draw(im)
    for k, col in SOLID.items(): x0, y0, x1, y1 = box(k); d.rectangle((x0 - 2, y0 - 2, x1 + 2, y1 + 2), fill=col)   # 單色塊不模糊、四周多 2 px（縮小的 mipmap 不會混到旁邊的顏色）
    im.save(ATLAS); return im


draw_atlas()


def uvr(key):
    x0, y0, x1, y1 = R[key]; return (x0 / AW, 1 - y1 / AH, x1 / AW, 1 - y0 / AH)   # Blender UV（v 往上）


class TMesh(Mesh):
    """貼圖集的網格：每個面指定貼圖集裡的一塊（同 dorm_y2_items.py）"""
    def __init__(self, name, mat):
        super().__init__(name, mat); self.uv = self.bm.loops.layers.uv.new('UVMap')

    def tquad(self, pts, key, flip=False):
        u0, v0, u1, v1 = uvr(key); f = self.bm.faces.new([self.bm.verts.new(g2b(*p)) for p in pts])
        uvs = [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]
        if flip: uvs = [uvs[1], uvs[0], uvs[3], uvs[2]]
        for lp, uv in zip(f.loops, uvs): lp[self.uv].uv = uv
        return f

    def tbox(self, x0, x1, y0, y1, z0, z1, top, side, bottom=None):
        P = lambda x, y, z: (x, y, z)
        self.tquad([P(x0, y1, z1), P(x1, y1, z1), P(x1, y1, z0), P(x0, y1, z0)], top)
        self.tquad([P(x0, y0, z0), P(x1, y0, z0), P(x1, y0, z1), P(x0, y0, z1)], bottom or side)
        self.tquad([P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)], side)
        self.tquad([P(x1, y0, z0), P(x0, y0, z0), P(x0, y1, z0), P(x1, y1, z0)], side)
        self.tquad([P(x1, y0, z1), P(x1, y0, z0), P(x1, y1, z0), P(x1, y1, z1)], side)
        self.tquad([P(x0, y0, z0), P(x0, y0, z1), P(x0, y1, z1), P(x0, y1, z0)], side)

    def finish(self, parent=None, props=None, uv=False, smooth=False, merge=True):
        return super().finish(parent, props, uv=False, smooth=smooth, merge=merge)


# ---------------- 幾何小工具（遊戲座標）----------------
def vadd(*vs): return tuple(sum(v[i] for v in vs) for i in range(3))
def vmul(v, s): return (v[0] * s, v[1] * s, v[2] * s)
def roty(v, a):
    """方向繞 +y 轉 a（俯視逆時針）"""
    ca, sa = math.cos(a), math.sin(a); return (v[0] * ca + v[2] * sa, v[1], -v[0] * sa + v[2] * ca)
def inplane(R_, U_, t):
    """紙在自己的平面上轉 t（R＝圖的右邊、U＝圖的上面）"""
    c, s = math.cos(t), math.sin(t); return vadd(vmul(R_, c), vmul(U_, s)), vadd(vmul(U_, c), vmul(R_, -s))
def card(tm, c, R_, U_, hw, hh, key, tilt=0.0):
    """一張紙（四邊形）：中心 c、圖的右邊 R、上面 U（法線＝R×U）、半寬 hw、半高 hh"""
    if tilt: R_, U_ = inplane(R_, U_, tilt)
    BL = vadd(c, vmul(R_, -hw), vmul(U_, -hh)); BR = vadd(c, vmul(R_, hw), vmul(U_, -hh)); TR = vadd(c, vmul(R_, hw), vmul(U_, hh)); TL = vadd(c, vmul(R_, -hw), vmul(U_, hh))
    tm.tquad([BL, BR, TR, TL], key); return (BL, BR, TR, TL)


B.reset(texres=512)
def print_mat(name):
    m = L.flat(name, '#ffffff', rough=0.72); nt = m.node_tree; tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS)
    nt.links.new(tx.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color']); return m
M = {'print': print_mat('y3_print'), 'print_rail': print_mat('seethru_y3_print')}   # 只有兩個材質：每一件一個網格（一次 draw call），單色零件用貼圖集的 c_* 色塊
root = B.group('dorm_y3_items', props={'kind': 'dorm_y3_items'})
nodes = {}
def node(name, props=None, parent=None):
    g = B.group(name, parent or root, props); nodes[name] = g; return g
def item(iid, year='Y3', rail=False):
    """一件東西：節點 ITEM_<id>＋它唯一的網格 y3_<id>（網格不用 ITEM_ 開頭：遊戲只認每一件的根節點）"""
    g = node('ITEM_' + iid, dict({'kind': 'room_item', 'year': year}, **({'seethru': 1} if rail else {})))
    return g, TMesh('y3_' + iid, M['print_rail' if rail else 'print'])


def solid(t, key, add):
    """add() 加進來的面全部貼貼圖集 key 那一塊單色（訂書針、鑰匙圈、掛繩…）；回傳新加的頂點（要再轉的時候用）"""
    t.bm.faces.ensure_lookup_table(); nf0 = len(t.bm.faces); nv0 = len(t.bm.verts); add()
    u0, v0, u1, v1 = uvr(key); c = ((u0 + u1) / 2, (v0 + v1) / 2); t.bm.faces.ensure_lookup_table(); t.bm.verts.ensure_lookup_table()
    for i in range(nf0, len(t.bm.faces)):
        for lp in t.bm.faces[i].loops: lp[t.uv].uv = c
    return [t.bm.verts[i] for i in range(nv0, len(t.bm.verts))]


def spin(verts, cx, cz, a):
    """頂點繞 (cx, cz) 的鉛直軸轉 a（遊戲座標）"""
    for v in verts:
        x, yv, z = v.co.x, v.co.z, -v.co.y; dxz = roty((x - cx, 0, z - cz), a); v.co = g2b(cx + dxz[0], yv, cz + dxz[2])


Y = 0.76                              # 桌面
XD = -2.30 + 0.0015                   # 衣櫃門面（往房間 1.5 mm）
UPY, RZ = (0.0, 1.0, 0.0), (0.0, 0.0, -1.0)   # 衣櫃門：法線 +x；從房間看，圖的右邊＝−z、上面＝+y
DESK_U = (-1.0, 0.0, 0.0)            # 桌上平放的紙：坐在書桌前（面朝 −x）看，圖的上面＝−x、右邊＝−z


def taped(iid, key, zl, zr, y0, y1, tilt=0.0, layer=0, year='Y3'):
    """貼在衣櫃門上的紙（紙膠帶貼上面兩個角）：zl＝從房間看的左邊緣（z 大）、zr＝右邊緣；回傳 (節點, 網格)，還沒 finish"""
    g, t = item(iid, year); c = (XD + layer * 0.0006, (y0 + y1) / 2, (zl + zr) / 2); hw, hh = (zl - zr) / 2, (y1 - y0) / 2
    card(t, c, RZ, UPY, hw, hh, key, tilt); Rt, Ut = inplane(RZ, UPY, tilt)
    for sgn in (-1, 1):
        tc = vadd(c, vmul(Rt, sgn * (hw - 0.012)), vmul(Ut, hh - 0.002), (0.0004, 0, 0))
        card(t, tc, Rt, Ut, 0.016, 0.008, 'tape', tilt=sgn * 0.5)
    return g, t


def desk_sheet(t, key, cxz, w, d, y, rot=0.0):
    """書桌上平放的紙：中心 (x, z)、w＝圖的寬（沿右邊）、d＝圖的高、rot＝俯視轉角"""
    R_, U_ = roty(RZ, rot), roty(DESK_U, rot); return card(t, (cxz[0], y, cxz[1]), R_, U_, w / 2, d / 2, key)


def staple(t, x0, x1, y0, y1, z0, z1): solid(t, 'c_staple', lambda: t.box(x0, x1, y0, y1, z0, z1))


# ================= 大三（507）=================
# ---- 一疊大二的筆記：書桌左前（大二的民總課本、相簿那一堆的前面），三本 B5 疊著，每本轉一點點
g, t = item('notes_y2')
for k, (key, rot, dx, dz) in enumerate((('note_a', 0.02, 0.0, 0.0), ('note_b', -0.05, 0.006, -0.008), ('note_c', 0.07, -0.004, 0.006))):
    y0, y1 = Y + k * 0.006, Y + (k + 1) * 0.006; cxz = (-2.518 + dx, -0.827 + dz)   # 10-30 往後 2 cm（DORM203-LM-1030）：前面那一疊 A4 才放得進筆電和這疊中間
    n0 = len(t.bm.verts); t.tbox(cxz[0] - 0.091, cxz[0] + 0.091, y0, y1, cxz[1] - 0.1285, cxz[1] + 0.1285, key, 'pages', bottom=key)
    t.bm.verts.ensure_lookup_table(); spin([t.bm.verts[i] for i in range(n0, len(t.bm.verts))], cxz[0], cxz[1], rot)
t.finish(g)
# ---- 學姊研究計畫的第二段（印出來的，兩頁、訂書針）：疊在筆記上
g, t = item('sis_plan')
desk_sheet(t, 'paper_back', (-2.484, -0.812), 0.205, 0.292, Y + 0.0186, rot=-0.16); desk_sheet(t, 'sis_plan', (-2.478, -0.818), 0.205, 0.292, Y + 0.0192, rot=-0.13)   # 不插進大二的民總課本（x −2.65 以後）
staple(t, -2.599, -2.597, Y + 0.0195, Y + 0.0205, -0.726, -0.714); t.finish(g)
# ---- 書桌前緣那一疊（A4 橫放，長邊沿 x；不碰筆電 z −0.47）：最下面學姊給的文章 → 東京講義 → 謄本影本（大四）→ 田野筆記影本（大四）
PILE = (-2.435, -0.578)   # 10-30（DORM203-LM-1030，使用者「書桌上東西不要重疊」）：往後 2.6 cm、每張只轉一點點——原本最歪的那張角落插進筆電的底座 3 cm；現在 z −0.68～−0.476（筆記到 −0.692、筆電從 −0.47）
_PILE_OLD = (-2.435, -0.552)   # 長邊沿 x、圖的上面朝牆；z 夾在大三的筆記（到 −0.666）和筆電（從 −0.47 起）中間，最歪的那張角落塞進筆電下 3 cm
g, t = item('article'); desk_sheet(t, 'article', PILE, 0.196, 0.282, Y + 0.0004, rot=0.02); staple(t, -2.5695, -2.5575, Y + 0.0006, Y + 0.0010, -0.6582, -0.6562); t.finish(g)
g, t = item('vac_C11'); desk_sheet(t, 'c11', (PILE[0] - 0.008, PILE[1] + 0.003), 0.196, 0.282, Y + 0.0011, rot=-0.025); t.finish(g)
# ---- 「測試版　不准外流」的隨身碟、首爾的交通卡：筆電前面（坐下來手放的地方）
g, t = item('zq_usb'); ux, uz, ua = -2.372, -0.385, 0.55   # 前緣那一疊紙的角到 z −0.414：不壓在隨身碟上
vs = solid(t, 'c_usb', lambda: t.box(ux - 0.027, ux + 0.016, Y, Y + 0.008, uz - 0.009, uz + 0.009)) + solid(t, 'c_usbmetal', lambda: t.box(ux + 0.016, ux + 0.028, Y + 0.0015, Y + 0.0065, uz - 0.006, uz + 0.006))
spin(vs, ux, uz, ua); card(t, (ux, Y + 0.0083, uz), roty((1.0, 0, 0), ua), roty((0, 0, -1.0), ua), 0.017, 0.0065, 'usb_label'); t.finish(g)
g, t = item('vac_C08'); tcx, tcz, tca = -2.346, -0.245, -0.28
n0 = len(t.bm.verts); t.tbox(tcx - 0.027, tcx + 0.027, Y, Y + 0.0009, tcz - 0.0428, tcz + 0.0428, 'tmoney', 'paper_back')
t.bm.verts.ensure_lookup_table(); spin([t.bm.verts[i] for i in range(n0, len(t.bm.verts))], tcx, tcz, tca); t.finish(g)
# ---- 日語單字卡：一圈，書桌右後（六法和衣櫃中間；黃金葛在 (−2.39, 0.145)）
g, t = item('vac_C03'); wcx, wcz = -2.62, 0.262
for k in range(5): t.tbox(wcx - 0.036 + k * 0.0012, wcx + 0.036 + k * 0.0012, Y + k * 0.0024, Y + (k + 1) * 0.0024, wcz - 0.017, wcz + 0.017, 'wordcard', 'paper_back')
rcx, rcy, rcz, rr = wcx - 0.028, Y + 0.012, wcz + 0.006, 0.011
ring_ = [(rcx + rr * math.cos(a * math.pi / 5), rcy + rr * math.sin(a * math.pi / 5) * 0.9, rcz) for a in range(11)]
solid(t, 'c_metal', lambda: [t.cyl(a, b, 0.0012, seg=5) for a, b in zip(ring_[:-1], ring_[1:])]); t.finish(g)
# ---- 阿哲還回來的民法筆記：層架右格、講義夾後面的空位（507 四本、409 五本講義夾到 z 0.135）直立，上面和朝房間那一面各一張便利貼
g, t = item('zhe_notes'); t.tbox(-2.888, -2.712, 1.018, 1.268, 0.143, 0.157, 'pages', 'zhe')
solid(t, 'c_flag', lambda: (t.box(-2.80, -2.77, 1.262, 1.29, 0.1455, 0.1465), t.box(-2.716, -2.700, 1.18, 1.205, 0.1455, 0.1465))); t.finish(g)
# ---- 交換說明會的手冊：書桌左後、筆電左邊靠牆立著（軟木板下面），右上角折了一個角
g, t = item('expo')
lean = 0.05; ex0, ex1, ez0, ez1, eh = -2.865, -2.865 - 0.21 * math.sin(lean), -0.488, -0.636, 0.21 * math.cos(lean)   # 上緣靠在大二軟木板的框上（框的正面 x −2.878、下緣 y 0.96），不插進去
BLp, BRp = (ex0, Y, ez0), (ex0, Y, ez1); TRp, TLp = (ex1, Y + eh, ez1), (ex1, Y + eh, ez0)
f_ = 0.035; TRc1 = (ex1 + (ex0 - ex1) * f_ / 0.21, Y + eh - eh * f_ / 0.21, ez1); TRc2 = (ex1, Y + eh, ez1 + f_)   # 折角：右上角往內折
u0, v0, u1, v1 = uvr('expo'); fv = [t.bm.verts.new(g2b(*p)) for p in (BLp, BRp, TRc1, TRc2, TLp)]; ff = t.bm.faces.new(fv)
for lp, uv in zip(ff.loops, [(u0, v0), (u1, v0), (u1, v1 - (v1 - v0) * f_ / 0.21), (u1 - (u1 - u0) * f_ / 0.148, v1), (u0, v1)]): lp[t.uv].uv = uv
t.tquad([TRc1, TRc2, vadd(TRc2, (0.004, -0.004, -0.004)), vadd(TRc1, (0.004, 0.002, -0.006))], 'paper_back')
t.finish(g)
# ---- 衣櫃門上（從房間看，左＝z 大；把手在右邊 z 0.40）：加州的結業證書、系籃節目單、京都的明信片、空白的筆錄紙
for iid, key, zl, zr, y0, y1, tl in (('vac_C10', 'cert', 0.895, 0.598, 1.10, 1.31, 0.012), ('game_y2', 'program', 0.585, 0.437, 1.115, 1.325, -0.04),
                                     ('vac_C12', 'kyoto', 0.880, 0.732, 0.955, 1.055, 0.06), ('fafu_form', 'fafu', 0.715, 0.533, 0.80, 1.057, -0.015)):
    g, t = taped(iid, key, zl, zr, y0, y1, tilt=tl); t.finish(g)
# ---- 床欄（朝房間那一面 x −1.95、頂 2.02）：隊服搭在床尾那一段；兩條掛繩的名牌
RTOP = 2.02
# 隊服：上半件倒掛在房間這一面（下緣＝肩線，中間凹上去的是領口、兩邊斜斜垂下來的是袖子；另一半搭過床欄頂、垂在床那一面）
g, t = item('vac_C09', rail=True)
prof = [(-1.937, 1.665), (-1.936, 1.78), (-1.938, 1.90), (-1.941, 1.985), (-1.947, 2.022), (-1.9625, 2.035), (-1.978, 2.022), (-1.985, 1.98), (-1.988, 1.915)]
SZ0, SZ1, NZ, ZC = 0.42, 0.80, 12, 0.61
su0, sv0, su1, sv1 = uvr('shirt')
lens = [0.0]
for a, b in zip(prof[:-1], prof[1:]): lens.append(lens[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
grid, hem = [], []
for i in range(NZ + 1):
    z = SZ0 + (SZ1 - SZ0) * i / NZ; row = []; q = (z - ZC) / 0.085
    neck = 0.042 * (1 - q * q) if abs(q) < 1 else 0.0   # 領口
    for j, (px, py) in enumerate(prof):
        hang = max(0.0, 1.0 - (py - 1.66) / 0.37); wob = 0.006 * math.sin(i * 1.1 + j * 0.9) * hang
        bottom = (neck + 0.003 * math.sin(i * 1.9)) if j == 0 else 0.0
        row.append(t.bm.verts.new(g2b(px + (wob if j < 4 else -wob * 0.5), py + bottom, z)))
        if j == 0: hem.append((px + wob, py + bottom, z, abs(q) < 1))
    grid.append(row)
for i in range(NZ):
    for j in range(len(prof) - 1):
        f = t.bm.faces.new([grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]])
        for lp, (ii, jj) in zip(f.loops, [(i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)]):
            lp[t.uv].uv = (su0 + (su1 - su0) * (1 - ii / NZ), sv0 + (sv1 - sv0) * (lens[jj] / lens[-1]))
def collar():   # 領口的羅紋（深一點的一圈，貼著下緣、往房間 0.8 mm）
    for (xa, ya, za, na), (xb, yb, zb, nb) in zip(hem[:-1], hem[1:]):
        if na or nb: t.quad([(xa + 0.0008, ya, za), (xb + 0.0008, yb, zb), (xb + 0.0008, yb + 0.012, zb), (xa + 0.0008, ya + 0.012, za)])
solid(t, 'c_collar', collar)
def sleeve_pts(s_, z0_):
    """袖子（倒掛：肩線在下面）：根部在身體兩側（肩點 1.68 到腋下 1.86），整隻往下垂、只往外一點點（2026-10-20 第二版：第一版斜斜往外張開像翅膀）；
    中段往房間鼓 1 cm（布有厚度，不是貼在床欄上的一張紙）；袖口那一段是淡掉的字（c_cuff）"""
    root_lo, root_hi = (-1.937, 1.68, z0_), (-1.937, 1.86, z0_)
    cuff_lo, cuff_hi = (-1.931, 1.505, z0_ + s_ * 0.055), (-1.931, 1.655, z0_ + s_ * 0.105)
    mid_lo = tuple(root_lo[k] + (cuff_lo[k] - root_lo[k]) * 0.8 for k in range(3)); mid_hi = tuple(root_hi[k] + (cuff_hi[k] - root_hi[k]) * 0.8 for k in range(3))
    mid_lo = (mid_lo[0] + 0.009, mid_lo[1], mid_lo[2]); mid_hi = (mid_hi[0] + 0.009, mid_hi[1], mid_hi[2])
    return root_lo, root_hi, mid_lo, mid_hi, cuff_lo, cuff_hi
def sleeves():
    for s_, z0_ in ((1, SZ1), (-1, SZ0)):
        root_lo, root_hi, mid_lo, mid_hi, cuff_lo, cuff_hi = sleeve_pts(s_, z0_)
        t.quad([root_lo, mid_lo, mid_hi, root_hi] if s_ > 0 else [root_hi, mid_hi, mid_lo, root_lo])
def cuffs():
    for s_, z0_ in ((1, SZ1), (-1, SZ0)):
        root_lo, root_hi, mid_lo, mid_hi, cuff_lo, cuff_hi = sleeve_pts(s_, z0_)
        t.quad([mid_lo, cuff_lo, cuff_hi, mid_hi] if s_ > 0 else [mid_hi, cuff_hi, cuff_lo, mid_lo])
solid(t, 'c_shirt', sleeves); solid(t, 'c_cuff', cuffs)
t.finish(g, smooth=True)
def lanyard(iid, zc, ytop_card, cord_key, key):
    """掛繩名牌：繩子繞過床欄頂，兩股往房間那一面垂到名牌套上緣；名牌在床欄前 1.4 cm（透明套在後面當外框，名牌的圖在前面）"""
    g, t = item(iid, rail=True); xc = -1.936; hw = 0.0375; top_y = ytop_card
    over = [(-1.986, RTOP - 0.03, zc - 0.012), (-1.976, RTOP + 0.012, zc - 0.012), (-1.95, RTOP + 0.012, zc - 0.012), (-1.943, RTOP - 0.01, zc - 0.012)]
    def cord():
        for a, b in zip(over[:-1], over[1:]): t.cyl(a, b, 0.0022, seg=5)
        for side_ in (-1, 1): t.cyl((-1.943, RTOP - 0.01, zc - 0.012 + side_ * 0.002), (xc, top_y + 0.004, zc + side_ * (hw - 0.012)), 0.0018, seg=5)
    solid(t, cord_key, cord); solid(t, 'c_clip', lambda: t.box(xc - 0.002, xc + 0.002, top_y - 0.004, top_y + 0.006, zc - 0.006, zc + 0.006))
    card(t, (xc - 0.0004, top_y - 0.0525, zc), RZ, UPY, hw, 0.0525, 'holder'); card(t, (xc + 0.0006, top_y - 0.0525, zc), RZ, UPY, hw - 0.005, 0.0475, key)
    t.finish(g); return g
lanyard('welcome_badge', -0.30, 1.735, 'c_navy', 'badge1')
lanyard('vac_C02', -0.13, 1.705, 'c_orange', 'badge2')

# ================= 大四（409）=================
FORM_LAYER = 2   # 志願表蓋在京都明信片的下緣、筆錄紙的左緣上面（同一個平面會閃）
g, t = taped('form', 'form', 0.895, 0.713, 0.70, 0.957, tilt=0.01, layer=FORM_LAYER, year='Y4'); t.finish(g)
st_ = node('FORM_STAMP', {'kind': 'form_stamp', 'note': '日本、美國路線（志願表的影本、系辦蓋的章）才顯示；台灣路線是空白的那一張'}, g)
t = TMesh('y3_form_stamp', M['print']); card(t, (XD + FORM_LAYER * 0.0006 + 0.0004, 0.742, 0.745), RZ, UPY, 0.018, 0.018, 'stamp', tilt=-0.12); t.finish(st_)
g, t = taped('credits', 'credits', 0.600, 0.452, 0.86, 1.07, tilt=0.03, layer=1, year='Y4'); t.finish(g)
g, t = item('postcards', 'Y4')
for k, (key, zl, y0, tl) in enumerate((('post1', 0.620, 0.680, 0.03), ('post2', 0.600, 0.600, -0.05), ('post3', 0.640, 0.515, 0.02))):
    c = (XD + 0.0003 * (k + 1), y0 + 0.05, zl - 0.074); card(t, c, RZ, UPY, 0.074, 0.05, key, tilt=tl)
    Rt, Ut = inplane(RZ, UPY, tl); card(t, vadd(c, vmul(Ut, 0.048), (0.0004, 0, 0)), Rt, Ut, 0.014, 0.007, 'tape')
t.finish(g)
# 鑰匙圈：掛在衣櫃把手（x −2.285、z 0.40、y 0.70～1.15）上，只剩圈圈和一塊壓克力牌
g, t = item('jp_key', 'Y4'); kx, ky, kz, kr = -2.285, 1.085, 0.40, 0.016
ring = [(kx + kr * 0.6 * math.sin(a * math.pi / 6), ky - kr * math.cos(a * math.pi / 6) - kr * 0.2, kz + kr * 0.8 * math.sin(a * math.pi / 6)) for a in range(13)]
solid(t, 'c_metal', lambda: ([t.cyl(a, b, 0.0015, seg=5) for a, b in zip(ring[:-1], ring[1:])], t.cyl((kx + 0.002, ky - 0.036, kz), (kx + 0.006, ky - 0.040, kz - 0.002), 0.0012, seg=4)))
card(t, (kx + 0.006, ky - 0.052, kz - 0.002), RZ, UPY, 0.016, 0.012, 'tag', tilt=0.1); t.finish(g)
# 書桌前緣那一疊的上面兩張：謄本影本（透明夾）、田野筆記影本
g, t = item('land', 'Y4')
desk_sheet(t, 'land', (PILE[0] + 0.006, PILE[1] + 0.002), 0.196, 0.282, Y + 0.0018, rot=0.025)
desk_sheet(t, 'plastic', (PILE[0] + 0.006, PILE[1] + 0.002), 0.204, 0.29, Y + 0.0021, rot=0.025); t.finish(g)
g, t = item('field', 'Y4')
desk_sheet(t, 'field', (PILE[0] - 0.004, PILE[1] + 0.003), 0.196, 0.282, Y + 0.0026, rot=-0.03); staple(t, -2.560, -2.548, Y + 0.0029, Y + 0.0034, -0.6685, -0.6665); t.finish(g)
# 便利商店的塑膠袋：衣櫃前的地上（床桌組的範圍，走不到），裝了別的東西鼓鼓的，提把垂在旁邊
g, t = item('cold', 'Y4'); bcx, bcz = -2.14, 0.70
bm2 = bmesh.new(); bmesh.ops.create_uvsphere(bm2, u_segments=12, v_segments=8, radius=1.0)
uvl = bm2.loops.layers.uv.new('UVMap'); bu0, bv0, bu1, bv1 = uvr('bag')
for v in bm2.verts:
    x, y, z = v.co.x, v.co.y, v.co.z; lump = 1.0 + 0.08 * math.sin(x * 7 + z * 5) + 0.05 * math.cos(y * 9)
    v.co = Vector((x * 0.13 * lump, y * 0.085 * lump, (z * 0.5 + 0.5) * 0.21 * (1.0 if z < 0.6 else 0.85)))
for f in bm2.faces:
    for lp in f.loops:
        co = lp.vert.co; lp[uvl].uv = (bu0 + (bu1 - bu0) * (0.5 + math.atan2(co.y, co.x) / (2 * math.pi)), bv0 + (bv1 - bv0) * min(1.0, co.z / 0.21))
me = bpy.data.meshes.new('_bag'); bm2.to_mesh(me); bm2.free(); me.transform(Matrix.Translation(g2b(bcx, 0.0, bcz)) @ Matrix.Rotation(0.4, 4, 'Z'))
t.bm.from_mesh(me); bpy.data.meshes.remove(me)
def handles():
    for sgn in (-1, 1):
        h_ = [(bcx + 0.02 * sgn, 0.20, bcz - 0.05), (bcx + 0.03 * sgn, 0.245, bcz - 0.02), (bcx + 0.035 * sgn, 0.25, bcz + 0.02), (bcx + 0.025 * sgn, 0.205, bcz + 0.05)]
        for a, b in zip(h_[:-1], h_[1:]): t.cyl(a, b, 0.006, seg=6)
solid(t, 'c_white', handles); t.finish(g, smooth=True)

# ---------------- 匯出 ----------------
for m in M.values(): m.use_backface_culling = False   # 紙、名牌兩面都看得到
tris = {}
for ob in bpy.data.objects:
    if ob.type == 'MESH':
        p = ob.parent
        while p is not None and not p.name.startswith('ITEM_'): p = p.parent
        key = p.name if p is not None else ''
        tris[key] = tris.get(key, 0) + sum(len(q.vertices) - 2 for q in ob.data.polygons)
print('dorm_y3 tris', tris, 'total', sum(tris.values()), 'meshes', sum(1 for ob in bpy.data.objects if ob.type == 'MESH'))
pos = {}   # 每一件在遊戲裡的位置（遊戲座標 x 東、y 上、z 南；外框的最小、最大、中心）：給 LAWWW 接互動點、運鏡用
for ob in bpy.data.objects:
    if ob.type != 'MESH': continue
    p = ob.parent
    while p is not None and not p.name.startswith('ITEM_') and p.name != 'FORM_STAMP': p = p.parent
    if p is None: continue
    ws = [ob.matrix_world @ v.co for v in ob.data.vertices]; gs = [(w.x, w.z, -w.y) for w in ws]
    mn = [min(g[i] for g in gs) for i in range(3)]; mx = [max(g[i] for g in gs) for i in range(3)]
    if p.name in pos: mn = [min(a_, b_) for a_, b_ in zip(mn, pos[p.name]['min'])]; mx = [max(a_, b_) for a_, b_ in zip(mx, pos[p.name]['max'])]
    pos[p.name] = {'min': [round(v, 3) for v in mn], 'max': [round(v, 3) for v in mx], 'center': [round((a_ + b_) / 2, 3) for a_, b_ in zip(mn, mx)]}
st = L.export(OUT, gpu_instances=False)
L.write_json(OUT.replace('.glb', '.json'), {
    'glb': os.path.relpath(OUT, L.ROOT), 'zone': 'dorm（大三 507、大四 409：同一個四人房模型 dorm_room4，祐廷 L2；大二的 dorm_y2_items.glb 照舊一起載）', 'layout': 'loft4-v2',
    'tris': tris, 'tris_total': sum(tris.values()), 'bytes': st['bytes'], 'meshes': st['objects'], 'pos': dict(sorted(pos.items())),
    'nodes': {
        'ITEM_notes_y2': 'S.ROOM_Y3_TEXT.notes_y2（書桌左前，三本 B5）', 'ITEM_sis_plan': 'sis_plan（疊在筆記上）', 'ITEM_article': 'article（書桌前緣那一疊最下面）',
        'ITEM_vac_C11': 'vac_C11（前緣那一疊第二張）', 'ITEM_zq_usb': 'zq_usb（筆電前）', 'ITEM_vac_C08': 'vac_C08（筆電前）', 'ITEM_vac_C03': 'vac_C03（書桌右後）',
        'ITEM_zhe_notes': 'zhe_notes（層架右格直立）', 'ITEM_expo': 'expo（書桌左後靠牆立著，右上角折角）',
        'ITEM_vac_C10': 'vac_C10（衣櫃門）', 'ITEM_game_y2': 'game_y2（衣櫃門）', 'ITEM_vac_C12': 'vac_C12（衣櫃門）', 'ITEM_fafu_form': 'fafu_form（衣櫃門）',
        'ITEM_vac_C09': 'vac_C09（搭在床欄上；seethru）', 'ITEM_welcome_badge': 'welcome_badge（床欄上的掛繩；seethru）', 'ITEM_vac_C02': 'vac_C02（床欄上的掛繩；seethru）',
        'ITEM_form': 'S.ROOM_Y4_TEXT.form（衣櫃門；子節點 FORM_STAMP＝日本、美國路線才顯示的章）', 'ITEM_credits': 'credits（衣櫃門）', 'ITEM_postcards': 'postcards（衣櫃門下面三張）',
        'ITEM_jp_key': 'jp_key（衣櫃把手）', 'ITEM_land': 'land（前緣那一疊，透明夾）', 'ITEM_field': 'field（前緣那一疊最上面）', 'ITEM_cold': 'cold（衣櫃前的地上）'},
    'texture': 'tools/blender/env_second/textures/gen/dorm_y3_print.png（本作，PIL 畫的，沒有字；執行時產生，GLB 裡是 webp）',
    'materials': ['y3_print', 'seethru_y3_print（床欄上的）']})
