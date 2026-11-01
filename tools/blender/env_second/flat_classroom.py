"""平面教室（LINZE-WANCAI-FLOORS-1020；LAWWW-C 10-20 15:51 回覆：霖澤館 202 開成第二間平面教室、萬才館多功能教室要能走進去）
→ 室內區域的 GLB＋配置：assets/models/env/second_ai/<id>.glb＋<id>.layout.json。LAWWW2-C 2026-10-20；Blender 5.2：
  /opt/blenv/bin/python tools/blender/env_second/flat_classroom.py [-- --room linze_202|wancai_multi|all] [--out-dir assets/models/env/second_ai]
兩間都是同一套做法（取代 10-20 的草稿 wancai_room.py）：房間自己的座標，
  −z 那一面是走廊（門在後面靠東）、+z 那一面一排窗（窗洞 2.2 × 1.6、中心 2.1 m，和遊戲 room() 的 front 窗一樣）；
  講台、黑板／白板、投影幕在西牆（−x），學生面向西（窗在學生的左手邊）；後面（東牆）是公告欄、置物櫃或層架。
  排和排相距約 1.9 m（和 201 階梯教室一樣的道理：導航格 0.4 m 量化之後，椅子後面要站得住、走得過去，
  玩家和 NPC 從前後的橫走道、排和排之間的走道走進每一排）；講台前留老師走動的空間。
  linze_202：霖澤館 2F 的 202（linze_layout.js doors.c202，x 3.0）：13.6 × 9.6 m、5 排 40 位（courses.js 的 LINZE 8 門課由 LAWWW-C 搬過來）；
  wancai_multi：萬才館 1F 的多功能教室（wancai_layout.js doors.multi，x 2.0）：11.6 × 9.0 m、4 排 32 位（吉他社的社課；講台前的空地比較大）。
做法和霖澤館 3F、118 巷的店一樣（lane118_shops.py 的共用零件；遊戲端 Z3.room＋attachRoomGLB）。黑板、白板是擦過的（字由遊戲或事件決定）。

2026-10-20 美術子代理（LAWWW-C 派、幫 LAWWW2-C 分擔；ART-ROOM-MULTI-1020、ART-ROOM-LIFE-1020；LAWWW-C 巡檢截圖 00、01「幾乎一樣、太空」）：
  兩間一眼看得出不同（企劃 AA_330 的旁白）＋生活感：
  linze_202（style 'lecture'：「二樓的 202 是平面教室。長桌一排一排，沒有階梯。坐後面也看得到黑板。」；和 201 同一棟，感覺跟 201 一樣）：
    灰色 60 cm 大地磚、講台區深色木地板（平的：講台墊高的話老師的腳會陷進去）、深色木紋長桌＋木頭椅面的黑鐵椅（201 也是深色桌、木頭椅）、
    深色木腰牆、墨綠色黑板（粉筆、板擦）、黑板上方的掛鐘、藍灰色窗簾（中間那扇拉了一半）、後面置物櫃上的書包和安全帽、窗台的小盆栽；
    座位照舊 40 位、位置和走近點不動；兩張長桌的桌尾各多一張沒有人坐的椅子放書包（不是座位：坐的位置不會穿模）。
  wancai_multi（style 'multi'：「萬才館一樓的多功能教室。椅子是可以移動的那種，大家坐得比在 201 鬆。」）：
    淺色木地板＋前面一塊方塊地毯（毛的方向一塊橫一塊直；講台前的空地照舊，吉他社社課用）、
    單人課桌椅：白色桌面的單人桌（56 × 44 cm）＋可以疊的彩色塑膠椅，四排 32 位（每排兩組、一組 4 張），一張一張分開（桌距 0.78 m、中間留縫），
    每張桌子角度、前後都差一點（兩端往中間轉一點），椅子拉出來的距離不一樣；幾張桌子側邊掛帆布袋；
    投影幕放下來（白板露出兩邊）、兩支壁掛喇叭、有輪子的講桌（筆電、小混音器）、天花板嵌入式冷氣、捲簾拉到不同高度、
    牆邊疊起來的椅子（三疊）、北牆的吸音板、護牆條（兩色牆）、沒有人坐的椅子上放書包和外套。
  兩間共同：立體掛鐘、公告欄（傳單、圖釘；字是虛構的、小字看不清楚）、滅火器、門口地墊、兩個垃圾桶、桌上的筆記本講義課本水壺（約三分之一的座位）。
  掛在牆上、放在置物櫃或窗台上的東西都在那一面牆的群組（牆淡出時一起淡出，不會飄在半空中：照 LAWWW2 75ef4ae3 的做法）；
  桌上、地上、椅子上的東西不在牆的群組。
2026-10-28 202 v2（INTERIOR-AAA-REVIEW-1028，LAWWW2-C；使用者「廉價手遊感」，和 201 v2 同一棟要一樣）：
  課椅＝模壓夾板（ply_shell：椅面微凹、前緣往下彎，椅背弧形往後仰）＋鐵管椅腳、橡膠腳套；長桌＝C 形鋼腳（原本整片 4 cm 鐵板）＋腳墊＋桌上電源盒；
  天花板＝0.6 m 輕鋼架格子＋T5 格柵燈具（WALL_ceil_*，dir 朝下：鏡頭在天花板上面時藏起來）。座位、碰撞框、配置 JSON 都不變。
  光照貼圖：tools/blender/env_second/lightbake/bake_flat_rooms.sh（燈的位置照這裡的燈具）。
2026-10-30 多功能教室 v2（MULTI-ROOM-V2-1030，LAWWW2-B；VISUAL_REVIEW 26.3「家具沒有換……下一輪要照 202 換家具」、LAWWW-B D111 佇列）：
  塑膠椅＝一體成形的殼（ply_shell：座面微凹、前緣瀑布邊、椅背彎上來往前包）＋側框、橫桿、腳套；單人桌＝深灰 PVC 封邊＋腳墊；
  天花板＝和 202 同一套的 0.6 m 輕鋼架＋T5 格柵燈具（x ±1.5、±4.5、z ±2.4）；白牆調暗一點（#f0eee9 → #e7e3da）。座位、碰撞框、配置 JSON 都不變。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lane118_shops as K   # noqa: E402
from lane118_shops import L, B, Mesh, CMesh, bpy, uvquad, img_mat, rot, rbox, ccyl, csph, clathe, navcheck, auto_ap, g2b, Matrix   # noqa: E402
from PIL import Image, ImageDraw, ImageFont, ImageFilter   # noqa: E402
import bmesh   # noqa: E402（模壓夾板的曲面 ply_shell；要在 bpy 載入以後）

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUTDIR = os.path.join(L.ROOT, arg('--out-dir', 'assets/models/env/second_ai'))
GEN = K.GEN; PI = math.pi
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
REG = {'PLATE': (0, 0, 512, 128), 'RULES': (512, 0, 1024, 384), 'BOARD': (0, 128, 512, 640), 'NOTICE': (0, 640, 512, 1024), 'CLOCK': (512, 672, 768, 928), 'EXIT': (768, 672, 1024, 768),
       'FLY1': (512, 384, 682, 672), 'FLY2': (682, 384, 852, 672), 'FLY3': (852, 384, 1022, 672), 'FIRE': (768, 768, 1024, 864),
       'SLIDE': (768, 864, 1024, 1024)}   # 講桌筆電的螢幕（投影片；原本借 118 巷收銀機的「小計 0」畫面）
ROOMS = {
    'linze_202': dict(name='法律系館A 202 教室', plate='202 教室', W=13.6, D=9.6, H=3.4, door_x=5.9, wins=[-4.0, -0.4, 3.2], rows=[-3.4, -1.5, 0.4, 2.3, 4.2], tables=[(-3.6, -0.8), (0.8, 3.6)],
                      style='lecture', floor=('large_floor_tiles_02', '#c2c1bb', 1.8), wall='#ece6da', wain=('walnut_veneer', '#5f4a3a'), back='lockers',
                      src='LAWWW-C 10-20 15:51 回覆 Q1（B：開成第二間平面教室）', door_id='c202', host='linze', host_lv=1, view='linze_201'),   # 窗景用 201 的（同一層樓；往北拍到的是很近的背景大樓牆）
    # rows：排距 1.9；最後一排往西一點（3.55）：進門的出生點 (4.8, −3.05) 離最近的椅子 0.7 m 以上，一進來不會就貼著椅背、出現「坐下」（原本長桌版也是這樣）
    'wancai_multi': dict(name='法律系館B 多功能教室', plate='多功能教室', W=11.6, D=9.0, H=3.4, door_x=4.8, wins=[-3.2, 0.0, 3.2], rows=[-2.15, -0.25, 1.65, 3.55],
                         style='multi', floor=('laminate_floor_02', '#c4a47e', 2.4), wall='#e7e3da', wain=('painted_plaster_wall', '#d5d3cb'), back='shelf', blinds=[0.45, 0.0, 0.7],
                         src='LAWWW-C 10-20 15:51 回覆 Q2（多功能教室走進去：吉他社）', door_id='multi', host='wancai', host_lv=0),
}
RIGHT = {'N': 1, 'S': -1, 'W': -1, 'E': 1}   # 從室內看牆：沿牆的座標（N／S 是 x、W／E 是 z）往右是 +1 還是 −1


def F(n): return ImageFont.truetype(CJK, n)
def uv(key): x0, y0, x1, y1 = REG[key]; return (x0 / 1024, 1 - y1 / 1024, x1 / 1024, 1 - y0 / 1024)
def ctext(d, cx, y, t, f, fill): w = d.textlength(t, font=f); d.text((cx - w / 2, y), t, font=f, fill=fill)


def flyer_img(w, h, kind, title, sub, bg, ac, seed):
    """一張傳單（虛構：只有大標題看得出來，小字是灰色的條，看不清楚；沒有真實課號、姓名、品牌）"""
    rr = random.Random(seed); im = Image.new('RGB', (w, h), bg); d = ImageDraw.Draw(im)
    if kind == 'poster':      # 海報：上面色帶＋標題、下面幾行小字
        d.rectangle([0, 0, w, int(h * 0.36)], fill=ac)
        for j, ln in enumerate(title.split('\n')): ctext(d, w / 2, 10 + j * int(w * 0.2), ln, F(int(w * 0.17)), (255, 255, 255))
        ctext(d, w / 2, int(h * 0.4), sub, F(int(w * 0.12)), (60, 60, 60))
        for j in range(5): y = int(h * 0.56) + j * int(h * 0.075); d.rectangle([int(w * 0.1), y, int(w * 0.9) - rr.randint(0, int(w * 0.3)), y + max(3, int(h * 0.025))], fill=(165, 165, 160))
    elif kind == 'tear':      # 撕條：標題、幾行小字、下面一排可以撕的電話條
        for j, ln in enumerate(title.split('\n')): ctext(d, w / 2, int(h * 0.05) + j * int(w * 0.2), ln, F(int(w * 0.17)), ac)
        ctext(d, w / 2, int(h * 0.36), sub, F(int(w * 0.11)), (70, 70, 70))
        for j in range(3): y = int(h * 0.5) + j * int(h * 0.06); d.rectangle([int(w * 0.12), y, int(w * 0.88) - rr.randint(0, int(w * 0.25)), y + max(3, int(h * 0.022))], fill=(160, 160, 155))
        t0 = int(h * 0.74); n = 6
        for k in range(n + 1): x = int(k * w / n); d.line([(x, t0), (x, h)], fill=(150, 150, 145), width=2)
        for k in range(n): x = int((k + 0.5) * w / n); d.rectangle([x - 3, t0 + 8, x + 3, h - 10], fill=(120, 120, 118))
    else:                     # 表格：標題＋一張時段表（有幾格塗了顏色）
        for j, ln in enumerate(title.split('\n')): ctext(d, w / 2, int(h * 0.04) + j * int(w * 0.19), ln, F(int(w * 0.16)), (50, 50, 50))
        x0, y0, x1, y1 = int(w * 0.08), int(h * 0.3), int(w * 0.92), int(h * 0.94); cols, rows = 5, 8
        for r_ in range(rows):
            for c_ in range(cols):
                a, b = x0 + c_ * (x1 - x0) // cols, y0 + r_ * (y1 - y0) // rows
                if rr.random() < 0.3: d.rectangle([a + 2, b + 2, a + (x1 - x0) // cols - 2, b + (y1 - y0) // rows - 2], fill=ac)
        for c_ in range(cols + 1): x = x0 + c_ * (x1 - x0) // cols; d.line([(x, y0), (x, y1)], fill=(90, 90, 90), width=2)
        for r_ in range(rows + 1): y = y0 + r_ * (y1 - y0) // rows; d.line([(x0, y), (x1, y)], fill=(90, 90, 90), width=2)
    return im


def make_tex(rid, R):
    """門牌、教室使用須知、黑板（202：墨綠、擦過的粉筆痕）或白板（多功能教室：擦過的淡字跡）、公告欄（軟木板＋傳單）、時鐘、安全門、
    三張另外貼的傳單（立體的，有圖釘）、滅火器標示（虛構：沒有真實課號、姓名）"""
    lec = R['style'] == 'lecture'
    im = Image.new('RGB', (1024, 1024), '#808080'); d = ImageDraw.Draw(im)
    x0, y0, x1, y1 = REG['PLATE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(64, 70, 76)); ctext(d, (x0 + x1) / 2, y0 + 26, R['plate'], F(64), (240, 240, 236))
    x0, y0, x1, y1 = REG['RULES']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 248, 242)); d.rectangle([x0, y0, x1 - 1, y0 + 64], fill=(90, 60, 50))
    ctext(d, (x0 + x1) / 2, y0 + 12, '教室使用須知', F(40), (255, 255, 255))
    lines = ['上課時請把手機調成靜音', '離開時關燈、關冷氣', '飲料請放在桌下', '借用請到學院辦公室登記', '投影機遙控器在講桌抽屜'] if lec else \
            ['社團借用請先登記', '練習結束請把桌椅排回原位', '音量請在晚上九點前降低', '離開時關燈、關冷氣', '樂器不可留在教室過夜']
    for k, ln in enumerate(lines): d.text((x0 + 30, y0 + 90 + k * 54), '・' + ln, font=F(32), fill=(50, 50, 46))
    # 黑板（墨綠，和材質 board 同一個顏色）／白板：擦過的痕跡
    x0, y0, x1, y1 = REG['BOARD']; base = (47, 74, 64) if lec else (246, 248, 248); d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=base)
    ghost = Image.new('L', (x1 - x0, y1 - y0), 0); gd = ImageDraw.Draw(ghost); rr = random.Random(11 if lec else 13)
    for k in range(9):
        y = 40 + k * 50; xx = 30 + rr.randint(0, 40)
        while xx < (x1 - x0) - 60:
            w = rr.randint(20, 70); gd.line([(xx, y + rr.randint(-4, 4)), (xx + w, y + rr.randint(-4, 4))], fill=rr.randint(30, 70) if not lec else rr.randint(22, 48), width=rr.randint(5, 9)); xx += w + rr.randint(8, 30)
    if lec:   # 黑板擦過的一道一道弧形（板擦來回擦的方向）
        for k in range(7):
            cy = rr.randint(40, (y1 - y0) - 40); gd.arc([rr.randint(-200, 100), cy - 160, rr.randint(300, 700), cy + 160], 200, 340, fill=rr.randint(14, 26), width=rr.randint(30, 50))
    ghost = ghost.filter(ImageFilter.GaussianBlur(5 if not lec else 7)); bimg = im.crop((x0, y0, x1, y1)); tint = Image.new('RGB', bimg.size, (150, 160, 175) if not lec else (176, 196, 186))
    im.paste(Image.composite(tint, bimg, ghost), (x0, y0))
    # 公告欄：軟木板（平的顏色）＋釘在上面的公告（有一點歪）
    x0, y0, x1, y1 = REG['NOTICE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(176, 132, 88))
    notes = [('期中考\n考場公告', (250, 228, 140)), ('讀書會\n招人', (250, 250, 250)), ('講座\n週三 18:30', (210, 232, 246)), ('失物招領', (232, 246, 214)), ('二手書\n轉讓', (248, 214, 214)), ('系學會\n公告', (245, 245, 238))] if lec else \
            [('社團借用\n時段表', (250, 250, 250)), ('成果發表\n報名', (250, 228, 140)), ('講座\n週四 18:30', (210, 232, 246)), ('失物招領', (232, 246, 214)), ('器材借用\n登記', (245, 245, 238)), ('社課\n地點異動', (248, 214, 214))]
    rn = random.Random(5 if lec else 7)
    for k, (t, col) in enumerate(notes):
        w, h = 150, 158; card = Image.new('RGBA', (w, h), col + (255,)); cd = ImageDraw.Draw(card)
        for j, ln in enumerate(t.split('\n')): ctext(cd, w / 2, 26 + j * 38, ln, F(28), (60, 50, 40))
        for j in range(2): yy = 112 + j * 16; cd.rectangle([20, yy, w - 20 - rn.randint(0, 40), yy + 6], fill=(160, 155, 150))
        card = card.rotate(rn.uniform(-5, 5), expand=True, resample=Image.BICUBIC)
        px, py = x0 + 12 + (k % 3) * 166 + rn.randint(-6, 6), y0 + 14 + (k // 3) * 182 + rn.randint(-6, 6)
        im.paste(card, (int(px), int(py)), card); d.ellipse([px + card.width / 2 - 7, py + 6, px + card.width / 2 + 7, py + 20], fill=rn.choice([(200, 40, 40), (40, 90, 200), (230, 180, 30)]))
    x0, y0, x1, y1 = REG['CLOCK']; cx, cy, r = (x0 + x1) / 2, (y0 + y1) / 2, 120
    d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(246, 246, 242)); d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(40, 40, 40), width=8)
    for k in range(12): a = k * math.pi / 6; d.line([(cx + (r - 22) * math.sin(a), cy - (r - 22) * math.cos(a)), (cx + (r - 8) * math.sin(a), cy - (r - 8) * math.cos(a))], fill=(40, 40, 40), width=6)
    d.line([(cx, cy), (cx + 55 * math.sin(0.4), cy - 55 * math.cos(0.4))], fill=(30, 30, 30), width=10); d.line([(cx, cy), (cx + 90 * math.sin(3.4), cy - 90 * math.cos(3.4))], fill=(30, 30, 30), width=6)
    d.ellipse([cx - 9, cy - 9, cx + 9, cy + 9], fill=(30, 30, 30))
    x0, y0, x1, y1 = REG['EXIT']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(30, 140, 70)); ctext(d, (x0 + x1) / 2, y0 + 26, '安全門 →', F(40), (255, 255, 255))
    x0, y0, x1, y1 = REG['FIRE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(200, 36, 30)); ctext(d, (x0 + x1) / 2, y0 + 22, '滅火器 ↓', F(44), (255, 255, 255))
    fl = [('poster', '講座', '週三 18:30', (252, 252, 248), (46, 92, 140)), ('tear', '二手書', '便宜賣', (250, 248, 236), (180, 60, 50)), ('table', '讀書會\n時間表', '', (250, 250, 250), (150, 200, 170))] if lec else \
         [('poster', '成果發表', '報名中', (252, 250, 244), (214, 120, 40)), ('tear', '社課', '一起來玩', (246, 250, 252), (40, 120, 130)), ('table', '借用\n時段', '', (250, 250, 250), (240, 200, 110))]
    for k, (kind, t, s, bg, ac) in enumerate(fl):
        x0, y0, x1, y1 = REG[f'FLY{k + 1}']; im.paste(flyer_img(x1 - x0, y1 - y0, kind, t, s, bg, ac, k + (0 if lec else 10)), (x0, y0))
    # 講桌筆電的螢幕：投影片（202：上課的講義投影片；多功能教室：社團借用、桌布）。字是虛構的，小字是灰色的條
    x0, y0, x1, y1 = REG['SLIDE']; rs = random.Random(21 if lec else 23)
    if lec:
        d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 250, 247)); d.rectangle([x0, y0, x1 - 1, y0 + 40], fill=(47, 74, 64)); d.text((x0 + 12, y0 + 6), '第五週', font=F(26), fill=(255, 255, 255))
        for j in range(5): y = y0 + 54 + j * 20; d.rectangle([x0 + 16, y + 4, x0 + 22, y + 10], fill=(47, 74, 64)); d.rectangle([x0 + 30, y + 4, x1 - 20 - rs.randint(0, 90), y + 10], fill=(150, 150, 146))
    else:
        d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(28, 46, 70)); d.text((x0 + 12, y0 + 10), '社課', font=F(30), fill=(240, 200, 110))
        for j in range(3): y = y0 + 62 + j * 26; d.rectangle([x0 + 14, y, x1 - 30 - rs.randint(0, 80), y + 9], fill=(130, 150, 176))
        for j in range(4): d.rectangle([x1 - 70 + (j % 2) * 30, y0 + 14 + (j // 2) * 22, x1 - 48 + (j % 2) * 30, y0 + 30 + (j // 2) * 22], outline=(200, 210, 225), width=2)
    im.save(os.path.join(GEN, f'{rid}_print.png'))


class Room(K.Shop):
    def __init__(self, rid, R):
        self.sid = rid; self.R = R; self.T = {'name': R['name'], 'sub': '教室'}; self.S = dict(trim='#5a4a3e', wainH=1.0)
        self.W, self.D = R['W'], R['D']; self.X0, self.X1, self.Z0, self.Z1 = -R['W'] / 2, R['W'] / 2, -R['D'] / 2, R['D'] / 2
        self.rng = random.Random(sum(map(ord, rid))); self.extra = {}   # 固定的種子（hash() 每個行程不一樣）
        self.lec = R['style'] == 'lecture'
        B.reset(texres=512)
        self.root = B.group(rid, props={'kind': rid, 'layout': f'{rid}.layout.json'})
        self.blocks, self.seats, self.inter = [], [], []; self.clerk = self.order = self.counter = None
        fid, ftgt, ftile = R['floor']; wid, wtgt = R['wain']
        self.M = M = {
            'floor': L.pbr(f'{rid}_floor', fid, tile=ftile, target=ftgt, contrast=0.5 if self.lec else 0.9, normal=0.25, maps=('diff', 'nor'), res=512, rough_value=0.35 if self.lec else 0.42),
            'wall': L.pbr(f'{rid}_wall', 'painted_plaster_wall', tile=2.0, target=R['wall'], contrast=0.3, normal=0.1, maps=('diff', 'nor'), res=256, rough_value=0.85),
            'wain': L.pbr(f'{rid}_wain', wid, tile=0.9 if self.lec else 2.0, target=wtgt, contrast=0.8 if self.lec else 0.3, normal=0.3 if self.lec else 0.1, maps=('diff', 'nor'), res=256, rough_value=0.5 if self.lec else 0.8),
            # 木頭：202＝椅面、椅背、講桌面的夾板（淺一點的胡桃木）；多功能教室＝層架、護牆條、門
            'wood': L.pbr(f'{rid}_wood', 'walnut_veneer' if self.lec else 'wood_table_001', tile=0.6 if self.lec else 0.9, target='#9a7350' if self.lec else '#b9966c', contrast=0.8, normal=0.25, maps=('diff', 'nor'), res=256, rough_value=0.45),
            'vc': L.vc_material(f'{rid}_vc', rough=0.6), 'vcm': L.vc_metal(f'{rid}_vcmetal', rough=0.32, metal=0.4),
            'steel': L.flat('l118_steel', '#b9bec2', rough=0.28, metal=0.45), 'glass': L.flat('l118_glass', '#dfe9ec', rough=0.05, alpha=0.16),
            'tube': L.flat('GLOW_l118_tube', '#ffffff', rough=0.3, emit=B.srgb('#f2f6ff')), 'warm': L.flat('GLOW_l118_warm', '#ffe7c2', rough=0.4, emit=B.srgb('#ffc77a')),
            'fridge': L.flat('GLOW_l118_fridge', '#f4f8ff', rough=0.3, emit=B.srgb('#cfe0f4')),
            'ceil': L.pbr(f'{rid}_ceiling', 'ceiling_interior', tile=1.2, target='#eeeeea', contrast=0.6, normal=0.2, maps=('diff', 'nor'), res=256, rough_value=0.9, cull=True),   # 單面朝下（10-22：原本雙面朝上，拉遠、往上拖是一大片白）
            # 筆電螢幕：同一張印刷品貼圖的 SLIDE 那一塊，發光（GLOW_：遊戲整天亮；貼圖和印刷品共用一張，不多載一張圖）
            'print': img_mat(f'{rid}_print', f'{rid}_print.png', rough=0.55), 'screen': img_mat(f'GLOW_{rid}_screen', f'{rid}_print.png', rough=0.3, emit=0.9),
            'board': L.flat(f'{rid}_chalkboard', '#2f4a40', rough=0.85) if self.lec else L.flat(f'{rid}_whiteboard', '#f6f8f8', rough=0.15),
            # 窗簾（202：藍灰色的布；多功能教室：米白的捲簾布）：Poly Haven rough_linen 去色後校正到指定的顏色
            'fabric': L.pbr(f'{rid}_fabric', 'rough_linen', tile=0.7, sat=0.0, target='#6e8293' if self.lec else '#ddd9cf', contrast=1.4, normal=0.0, maps=('diff',), res=256),
        }
        M['fabric'].node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.92
        if self.lec:
            # 木紋長桌（201 也是深色桌）：10-21 BB-C「坐下的鏡頭裡桌面幾乎是黑的、木紋看不出來」→ 從 #5b4738 調亮到中等的胡桃色，比椅面（#9a7350）深一點
            M['desk'] = L.pbr(f'{rid}_desk', 'fine_grained_wood', tile=1.2, target='#7e6048', contrast=1.0, normal=0.25, maps=('diff', 'nor'), res=256, rough_value=0.4)
            M['front'] = L.pbr(f'{rid}_front', 'laminate_floor_02', tile=2.4, target='#cdb594', contrast=0.9, normal=0.3, maps=('diff', 'nor'), res=256, rough_value=0.4)   # 講台區的木地板：淺色（UA-LAWWW2-1023-03 永久規則：整個遊戲不要深色木地板；目標色和宿舍四人房一樣 #cdb594。10-28 以前是 #7a5c43，scan_floors.py 標 DARK）
        else:
            M['carpet'] = L.pbr(f'{rid}_carpet', 'dirty_carpet', tile=1.0, sat=0.25, target='#56616b', contrast=0.9, normal=0.4, maps=('diff', 'nor'), res=512, rough_value=0.95)   # 方塊地毯
            carpet_sheen(M['carpet'])
        self.vc = CMesh(f'{rid}_props', M['vc']); self.vm = CMesh(f'{rid}_metal', M['vcm'])
        self.wood = Mesh(f'{rid}_woodparts', M['wood']); self.steel = Mesh(f'{rid}_steel', M['steel'])
        self.tube = Mesh(f'{rid}_tubes', M['tube']); self.warm = Mesh(f'{rid}_warm', M['warm']); self.fridgel = Mesh(f'{rid}_glowpanel', M['fridge'])
        self.prt = Mesh(f'{rid}_prints', M['print']); self.scr = Mesh(f'{rid}_screens', M['screen'])
        self.desk = Mesh(f'{rid}_desktops', M['desk']) if self.lec else None
        self.WG = {k: {} for k in 'NWES'}


# ================= 小工具：任意角度的零件（遊戲座標：x 東、y 上、z 南） =================
def lw(x, z, yaw):
    """本地座標 → 世界：本地 +z＝面向的方向 (sin yaw, cos yaw)、本地 +x＝(cos yaw, −sin yaw)（和 lane118_shops.rot 同一個慣例）；y 照抄"""
    s, c_ = math.sin(yaw), math.cos(yaw)
    return lambda lx, ly, lz: (x + lx * c_ + lz * s, ly, z - lx * s + lz * c_)


def Mloc(x, y, z, yaw, rx=0.0):
    """Blender 世界矩陣：放在遊戲座標 (x, y, z)、面向 yaw；rx＝繞本地 x 軸轉（負的＝上端往後仰）"""
    return Matrix.Translation(g2b(x, y, z)) @ Matrix.Rotation(yaw, 4, 'Z') @ Matrix.Rotation(rx, 4, 'X')


def mark(m):
    """加零件之前先記下網格裡已經有的面（newf 用）"""
    return set(m.bm.faces)


def newf(m, f0):
    """mark() 以後新加的面。不能用「面的編號 ≥ 加之前的面數」：CMesh.crbox 的倒角會刪掉方塊原本的面、在最後補新的面，
    之後新加的面會填進刪掉留下的空位（排在中間），用編號會把顏色塗到前一個倒角方塊上
    （10-20 截圖：202 的講桌變成講義的白色；多功能教室的喇叭、掛鐘、桌上的東西也一樣）。和 lane118_shops.ccyl／clathe 同一個做法。"""
    return [f for f in m.bm.faces if f not in f0]


def part(m, M, lx, ly, lz, w, h, d, col=None, r=0.0, seg=1, rx=0.0, ry=0.0, k=1.0, sm=False):
    """M 底下的一個方塊：本地中心 (lx, ly, lz)、大小 w（本地 x）× h（高）× d（本地 z）；r＞0 倒角；rx、ry＝這個零件自己再轉（繞本地 x、繞垂直軸）；
    sm＝平滑著色（布做的東西：書包、袋子；lib2.export 保留每一面的平滑設定）"""
    bm = L.rbox_bm(w, h, d, r, seg); f0 = mark(m) if (col or sm) else None
    m.add_bm(bm, M @ Matrix.Translation(g2b(lx, ly, lz)) @ Matrix.Rotation(ry, 4, 'Z') @ Matrix.Rotation(rx, 4, 'X')); bm.free()
    if f0 is not None:
        fs = newf(m, f0)
        if sm:
            for f in fs: f.smooth = True
        if col: m.paint(fs, col, k)


def lcyl(m, T, a, b, r, col, seg=5, caps=False):
    """本地座標的兩點（T＝lw(...)）之間一支圓管"""
    f0 = mark(m); m.cyl(T(*a), T(*b), r, seg=seg, caps=caps); m.paint(newf(m, f0), col)


def uvpoly(mesh, pts, uvs):
    """一個貼圖的多邊形（遊戲座標的點，從正面看逆時針）＋每個點的 UV"""
    bm = mesh.bm; uvl = bm.loops.layers.uv.verify(); f = bm.faces.new([bm.verts.new(g2b(*p)) for p in pts])
    for lp, q in zip(f.loops, uvs): lp[uvl].uv = q
    return f


def wall_pt(c, side, a, y, d):
    """牆上的點：沿牆的位置 a（N／S 是 x、W／E 是 z）、高度 y、離牆 d（往室內）"""
    return {'N': (a, y, c.Z0 + d), 'S': (a, y, c.Z1 - d), 'W': (c.X0 + d, y, a), 'E': (c.X1 - d, y, a)}[side]


def obb_block(c, x, z, yaw, hw, hd, why, pad=0.03):
    """轉了 yaw 的矩形（半寬 hw：本地 x、半深 hd：本地 z）的碰撞框（外接的軸對齊矩形）"""
    T = lw(x, z, yaw); P = [T(sx * hw, 0, sz * hd) for sx in (-1, 1) for sz in (-1, 1)]
    c.block(min(p[0] for p in P) - pad, max(p[0] for p in P) + pad, min(p[2] for p in P) - pad, max(p[2] for p in P) + pad, why)


def shade(col, k):
    return '#' + ''.join(f'{min(255, int(int(col[i:i + 2], 16) * k)):02x}' for i in (1, 3, 5))


# ================= 椅子、桌子 =================
SHELL = ['#2f7f86', '#2f7f86', '#2f7f86', '#8d949b', '#8d949b', '#d39a35']   # 塑膠椅殼：藍綠、灰、芥末黃


def shell_chair(c, x, z, yaw, col, y0=0.0, mv=None, mm=None):
    """可以移動、可以疊的塑膠椅（萬才館多功能教室）：一體成形的座面＋椅背、四支銀色鐵腳；(x, z) 是坐的位置、面向 yaw；y0＝疊起來時往上的高度。
    v2（MULTI-ROOM-V2-1030，LAWWW2-B；照 202 v2 的做法）：原本座面、椅背、中間那段是三塊倒角方塊 → 一體成形的塑膠殼（ply_shell）：
    座面中間微凹、兩側和後緣往上翹、前緣往下彎（瀑布邊），椅背從座面後緣一路彎上去、左右往前包一點；鐵腳多了座面下的側框、前後的橫桿和黑色腳套。
    座面上緣照舊約 0.46（坐姿高度不變）、腳的位置照舊（碰撞框不變）"""
    mv = mv or c.vc; mm = mm or c.vm; M = Mloc(x, y0, z, yaw); T = lw(x, z, yaw)
    def seat(u, v):
        xx = -0.22 + 0.44 * u; xn = xx / 0.22; zz = -0.19 + 0.41 * v
        y = 0.45 + 0.014 * xn ** 4 - (0.04 * ((v - 0.84) / 0.16) ** 2 if v > 0.84 else 0.0) + (0.035 * ((0.14 - v) / 0.14) ** 2 if v < 0.14 else 0.0)
        e = max(0.0, abs(2 * v - 1) - 0.7) / 0.3; xx *= 1 - 0.07 * e * e                  # 前後兩角收圓
        return (xx, y, zz)
    mv.paint(ply_shell(mv, M, seat, 6, 5, (0.0, -0.016, 0.0)), col)   # 格子比 202 的木頭椅粗一點：這間有 47 張（含疊起來的）
    def back(u, v):
        xx = -0.215 + 0.43 * u; xn = xx / 0.215; y = 0.485 + 0.42 * v
        zz = -0.19 - 0.075 * v - 0.02 * v * v + 0.035 * xn * xn * min(1.0, v * 2.5)      # 往後仰；左右往前包（上半部）
        e = max(0.0, 2 * v - 1.4) / 0.6; xx *= 1 - 0.1 * e * e                          # 上緣兩角收圓
        return (xx, y, zz)
    mv.paint(ply_shell(mv, M, back, 6, 5, (0.0, 0.0, -0.015)), col)
    g = '#c4c8cb'
    for sx in (-1, 1):
        for sz in (-1, 1): lcyl(mm, T, (sx * 0.205, y0, sz * 0.195), (sx * 0.175, y0 + 0.43, sz * 0.165), 0.011, g)
        lcyl(mm, T, (sx * 0.175, y0 + 0.43, 0.165), (sx * 0.175, y0 + 0.43, -0.165), 0.009, g)     # 座面下的側框
        for sz in (-1, 1): lcyl(c.vc if mm is c.vm else mv, T, (sx * 0.205, y0, sz * 0.195), (sx * 0.205, y0 + 0.014, sz * 0.195), 0.013, '#1d1d1f', seg=6, caps=True)   # 黑色腳套
    for sz in (-1, 1): lcyl(mm, T, (-0.19, y0 + 0.2, sz * 0.18), (0.19, y0 + 0.2, sz * 0.18), 0.008, g)   # 前後的橫桿


def ply_shell(m, M, P, nu, nv, off):
    """模壓夾板的曲面（椅面、椅背；INTERIOR-AAA-REVIEW-1028）：P(u,v)＝本地座標（Mloc：+z＝面向的方向）的正面點，u、v 都是 0..1；
    off＝背面的位移（本地）；正面、背面、周邊封起來，平滑著色（和 tools/blender/classroom_201.py 的 shell 同一個做法）"""
    bm = m.bm; V = lambda p: bm.verts.new(M @ g2b(*p))
    Fv = [[V(P(i / nu, j / nv)) for j in range(nv + 1)] for i in range(nu + 1)]
    Kv = [[V(tuple(a + b for a, b in zip(P(i / nu, j / nv), off))) for j in range(nv + 1)] for i in range(nu + 1)]
    fs = []
    for i in range(nu):
        for j in range(nv):
            fs.append(bm.faces.new((Fv[i][j], Fv[i + 1][j], Fv[i + 1][j + 1], Fv[i][j + 1]))); fs.append(bm.faces.new((Kv[i][j], Kv[i][j + 1], Kv[i + 1][j + 1], Kv[i + 1][j])))
    ring = [(i, 0) for i in range(nu)] + [(nu, j) for j in range(nv)] + [(i, nv) for i in range(nu, 0, -1)] + [(0, j) for j in range(nv, 0, -1)]
    for k in range(len(ring)):
        (a0, a1), (b0, b1) = ring[k], ring[(k + 1) % len(ring)]; fs.append(bm.faces.new((Fv[a0][a1], Fv[b0][b1], Kv[b0][b1], Kv[a0][a1])))
    bmesh.ops.recalc_face_normals(bm, faces=fs)
    for f in fs: f.smooth = True
    return fs


def wood_chair(c, x, z, yaw):
    """霖澤館的課椅（202）：模壓夾板的椅面、椅背（木紋材質），黑色鐵管椅腳＋橡膠腳套；(x, z) 是坐的位置、面向 yaw。
    v2（INTERIOR-AAA-REVIEW-1028，LAWWW2-C 10-28）：原本椅面、椅背是兩塊平板（使用者「廉價手遊感」）→ 椅面中間微凹、前緣往下彎，椅背弧形、往後仰；
    椅面上緣照舊 0.455（坐姿高度不變）、椅腳位置照舊（碰撞框不變）"""
    M = Mloc(x, 0.0, z, yaw); T = lw(x, z, yaw); k = '#262626'
    def seat(u, v):
        xx = -0.21 + 0.42 * u; xn = xx / 0.21; zz = -0.19 + 0.40 * v
        y = 0.455 + 0.008 * xn * xn - (0.03 * ((v - 0.8) / 0.2) ** 2 if v > 0.8 else 0.0)
        if v < 0.08 or v > 0.94: xx *= 0.93
        return (xx, y, zz)
    ply_shell(c.wood, M, seat, 8, 7, (0.0, -0.018, 0.0))
    def back(u, v):
        xx = -0.2 + 0.4 * u; xn = xx / 0.2; y = 0.6 + 0.26 * v; zz = -0.215 - 0.05 * v + 0.025 * xn * xn
        e = max(0.0, abs(2 * v - 1) - 0.6) / 0.4; xx *= 1 - 0.08 * e * e
        return (xx, y, zz)
    ply_shell(c.wood, M, back, 8, 5, (0.0, 0.0, -0.016))
    for sx in (-1, 1):
        lcyl(c.vm, T, (sx * 0.185, 0.015, 0.17), (sx * 0.18, 0.433, 0.17), 0.011, k)          # 前腳
        lcyl(c.vm, T, (sx * 0.185, 0.015, -0.18), (sx * 0.178, 0.44, -0.2), 0.011, k)         # 後腳
        lcyl(c.vm, T, (sx * 0.178, 0.44, -0.2), (sx * 0.17, 0.85, -0.262), 0.011, k)          # 椅背後面的直管
        lcyl(c.vm, T, (sx * 0.18, 0.43, 0.17), (sx * 0.178, 0.43, -0.19), 0.009, k)           # 座面下的側框
        lcyl(c.vm, T, (sx * 0.183, 0.14, 0.17), (sx * 0.183, 0.14, -0.18), 0.008, k)          # 下面的橫桿
        for zz in (0.17, -0.18): lcyl(c.vc, T, (sx * 0.185, 0.0, zz), (sx * 0.185, 0.016, zz), 0.014, '#1a1a1a', seg=6, caps=True)   # 橡膠腳套
    lcyl(c.vm, T, (-0.17, 0.43, 0.17), (0.17, 0.43, 0.17), 0.008, k)
    lcyl(c.vm, T, (-0.165, 0.7, -0.252), (0.165, 0.7, -0.252), 0.008, k)                    # 椅背後面的橫管（托住椅背）


def long_table(c, cx, z0, z1, d=0.5):
    """202 的長桌（學生面向 −x）：深色木紋桌面、朝講台那一面的木頭前擋板、桌下置物網；z0..z1＝桌子的長、d＝沿 x 的深。
    v2（INTERIOR-AAA-REVIEW-1028）：原本兩端和中間是整片 4 cm 的鐵板（看起來像方塊）→ C 形鋼腳（擋板那一側的立柱＋往學生那一側伸出的腳座＋桌面下的托架）、腳墊、
    桌上的電源盒（兩個位子共用一個，和 201 一樣）；桌面、碰撞框照舊"""
    c.desk.rbox(cx - d / 2, cx + d / 2, 0.72, 0.75, z0, z1, r=0.006, seg=1)
    c.vc.cbox(cx - d / 2, cx - d / 2 + 0.02, 0.32, 0.72, z0 + 0.03, z1 - 0.03, '#46372c')       # 前擋板（面向講台）
    k = '#2b2b2b'
    for zz in (z0 + 0.06, (z0 + z1) / 2, z1 - 0.06):
        c.vm.cbox(cx - d / 2 + 0.03, cx - d / 2 + 0.07, 0.0, 0.72, zz - 0.02, zz + 0.02, k)      # 立柱（擋板那一側）
        c.vm.cbox(cx - d / 2 + 0.02, cx + d / 2 - 0.04, 0.0, 0.03, zz - 0.025, zz + 0.025, k)     # 腳座（往學生那一側伸出來）
        c.vm.cbox(cx - d / 2 + 0.03, cx + d / 2 - 0.03, 0.69, 0.72, zz - 0.02, zz + 0.02, k)      # 桌面下的托架
        for xx in (cx - d / 2 + 0.03, cx + d / 2 - 0.07): c.vc.cbox(xx, xx + 0.03, 0.0, 0.008, zz - 0.03, zz + 0.03, '#141414')   # 腳墊
    c.vm.cbox(cx - d / 2 + 0.03, cx + d / 2 - 0.08, 0.55, 0.57, z0 + 0.06, z1 - 0.06, '#4a4f54')    # 桌下置物網
    for k2 in range(2):   # 桌上的電源盒（擋板那一側，兩個位子共用一個）
        zz = z0 + (z1 - z0) * (0.25 + 0.5 * k2); c.vc.crbox(cx - d / 2 + 0.05, cx - d / 2 + 0.13, 0.75, 0.757, zz - 0.07, zz + 0.07, '#2a2b2d', r=0.003, seg=1)
    c.block(cx - d / 2 - 0.03, cx + d / 2 + 0.03, z0 - 0.03, z1 + 0.03, 'desk')


def single_desk(c, x, z, yaw):
    """單人課桌（萬才館多功能教室）：白色美耐板桌面、淺灰鐵架（兩側ㄈ字腳＋地上的滑軌）、桌下置物架、前擋板；(x, z) 是桌子中心，面向 yaw（坐的人面向的方向）"""
    M = Mloc(x, 0.0, z, yaw); T = lw(x, z, yaw); g = '#b5babe'
    part(c.vc, M, 0, 0.7275, 0, 0.56, 0.025, 0.44, '#ebeae5', r=0.008)                # 桌面 56 × 44 cm
    for sx in (-1, 1):
        lx = sx * 0.25
        lcyl(c.vm, T, (lx, 0.0, 0.17), (lx, 0.715, 0.17), 0.012, g); lcyl(c.vm, T, (lx, 0.0, -0.17), (lx, 0.715, -0.17), 0.012, g)
        lcyl(c.vm, T, (lx, 0.012, -0.2), (lx, 0.012, 0.2), 0.012, g); lcyl(c.vm, T, (lx, 0.69, -0.19), (lx, 0.69, 0.19), 0.01, g)
    part(c.vm, M, 0, 0.58, 0.18, 0.5, 0.24, 0.006, '#c9cdd0')                      # 前擋板（朝講台那一面）
    part(c.vm, M, 0, 0.6, 0.02, 0.48, 0.012, 0.3, '#8f959a')                       # 桌下置物架
    # v2（MULTI-ROOM-V2-1030）：桌面一圈深灰的 PVC 封邊（原本白色方板看起來像紙板）、四支腳的黑色腳墊
    for (lx, lz, w, d) in ((0, 0.219, 0.56, 0.006), (0, -0.219, 0.56, 0.006), (0.279, 0, 0.006, 0.44), (-0.279, 0, 0.006, 0.44)):
        part(c.vc, M, lx, 0.7275, lz, w + 0.002, 0.026, d, '#5d6064')
    for sx in (-1, 1):
        for sz in (-1, 1): lcyl(c.vc, T, (sx * 0.25, 0.0, sz * 0.17), (sx * 0.25, 0.012, sz * 0.17), 0.016, '#1d1d1f', seg=6, caps=True)
    obb_block(c, x, z, yaw, 0.28, 0.22, 'desk')


# ================= 生活感：書包、外套、桌上的東西 =================
BAGC = ['#2c3e5c', '#26282b', '#5b6345', '#6e2f35', '#7a7f85', '#bfae8f', '#2f6f73', '#8a5a3a']


def backpack(m, M, col):
    """後背包（本地：背面 −z、前面的口袋 +z；底在 y=0）。10-21 精修（LAWWW-C「書包近看偏硬」）：倒角大一點、多一段（裝了東西鼓鼓的），前面口袋也是圓的"""
    part(m, M, 0, 0.21, 0, 0.30, 0.42, 0.15, col, r=0.07, seg=3, sm=True)
    part(m, M, 0, 0.13, 0.087, 0.23, 0.17, 0.05, col, r=0.024, seg=2, k=0.82, sm=True)
    for sx in (-1, 1): part(m, M, sx * 0.075, 0.22, -0.084, 0.05, 0.32, 0.018, col, r=0.006, k=0.62)
    part(m, M, 0, 0.428, -0.02, 0.09, 0.02, 0.022, col, k=0.6)


def backpack_flat(m, M, col):
    """平放（背面朝下）的後背包：底在 y=0，頂端朝本地 −z"""
    part(m, M, 0, 0.075, 0, 0.30, 0.15, 0.42, col, r=0.065, seg=3, sm=True)
    part(m, M, 0, 0.16, 0.08, 0.23, 0.05, 0.17, col, r=0.024, seg=2, k=0.82, sm=True)
    part(m, M, 0, 0.09, -0.218, 0.09, 0.022, 0.02, col, k=0.6)


def tote(m, M, col):
    """帆布袋（立著放；底在 y=0）：10-21 邊角圓一點（布袋不是硬殼）"""
    part(m, M, 0, 0.17, 0, 0.34, 0.34, 0.08, col, r=0.03, seg=2, sm=True)
    for sx in (-1, 1): part(m, M, sx * 0.07, 0.4, 0.0, 0.02, 0.13, 0.008, col, k=0.8)
    part(m, M, 0, 0.465, 0.0, 0.16, 0.02, 0.008, col, k=0.8)


def jacket(m, M, col, top=0.895, zb=-0.232, w=0.44, seed=0):
    """掛在椅背上的外套（M＝椅子的本地座標；top、zb＝椅背上緣的高度和本地 z：塑膠椅 0.895／−0.232、202 的木頭椅 0.85／−0.222）：
    一片布從椅背上面翻過去（前面短、後面長；往下垂的那一段下襬往外張一點），領子、兩隻袖子垂在後面。
    （10-20 截圖：原本是幾塊方板，看起來像木板。）布是一片的（材質是雙面的）。
    10-21 精修（LAWWW-C「外套近看偏硬」）：布切得細一點（12 × 19）；往下垂的那一段有大、中、小三種褶子（每件相位不同，越往下越深）；
    下襬高低不齊；兩側往椅背那邊包一點（布掛在椅背上，邊緣會往前收）；袖子微彎、一長一短、袖口張開一點；布平滑著色"""
    rs = random.Random(seed * 7919 + 13)
    prof0 = [(0.046, -0.15), (0.04, -0.07), (0.031, -0.016), (0.014, 0.01), (-0.008, 0.016), (-0.03, -0.002), (-0.046, -0.07), (-0.056, -0.2), (-0.068, -0.32), (-0.08, -0.43)]   # (離椅背上緣的 z, y)
    prof = [(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t) for a, b in zip(prof0, prof0[1:]) for t in (0.0, 0.5)] + [prof0[-1]]
    nx = 12; f0 = mark(m); bm = m.bm; grid = []
    ph = [rs.uniform(0, 2 * PI) for _ in range(3)]; fr = [rs.uniform(2.2, 2.8), rs.uniform(3.8, 4.6), rs.uniform(6.2, 7.4)]; am = (0.017, 0.008, 0.004)
    hem0 = [rs.uniform(-0.02, 0.012) for _ in range(nx + 1)]; hem = [(hem0[max(0, i - 1)] + 2 * hem0[i] + hem0[min(nx, i + 1)]) / 4 for i in range(nx + 1)]
    for i in range(nx + 1):
        t = i / nx; row = []; fold = sum(a * math.sin(t * PI * f + p) for a, f, p in zip(am, fr, ph)); wrap = abs(t - 0.5) * 2
        for (dz, dy) in prof:
            hang = min(1.0, max(0.0, (-dy - 0.07) / 0.36))                         # 後面往下垂的那一段：0（椅背上）→ 1（下襬）
            lx = (t - 0.5) * w * (1 + 0.08 * hang) * (1 - 0.06 * wrap ** 3 * hang)
            lz = zb + dz + (fold - 0.01) * hang + 0.03 * wrap ** 3 * hang
            ly = top + dy + hem[i] * hang ** 2
            row.append(bm.verts.new(M @ g2b(lx, ly, lz)))
        grid.append(row)
    for i in range(nx):
        for j in range(len(prof) - 1): bm.faces.new((grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]))
    def soft(fs):   # 布：平滑著色（原本一格一格的平面，褶子看起來像摺紙）
        for f in fs: f.smooth = True
        return fs
    m.paint(soft(newf(m, f0)), col)
    f0 = mark(m); bm2 = _tube(w * 0.5, 0.018); m.add_bm(bm2, M @ Matrix.Translation(g2b(0, top + 0.022, zb - 0.004)) @ Matrix.Rotation(PI / 2, 4, 'Y')); bm2.free(); m.paint(soft(newf(m, f0)), col, 0.82)   # 領子
    for sx in (-1, 1):   # 兩隻袖子：從肩膀垂到後面，往外、往後一點；空的袖子是扁的（10-20 Blender 算圖：圓管看起來像兩根柱子）
        ln = 0.36 + rs.uniform(-0.035, 0.015); f0 = mark(m); bm2 = _tube(ln, 0.034, seg=10, r1=0.03)
        for v in bm2.verts:
            zz = v.co.z / ln; v.co.x *= 1.25; v.co.y *= 0.5
            v.co.y += 0.03 * (1 - (2 * zz) ** 2)                                     # 微彎（手肘那裡往後拱一點）
            v.co.x += sx * 0.012 * (0.5 - zz) ** 2                                   # 越往下越往外
        m.add_bm(bm2, M @ Matrix.Translation(g2b(sx * (w / 2 - 0.04), top - 0.04 - ln / 2, zb - 0.074)) @ Matrix.Rotation(-sx * 0.1, 4, 'Y') @ Matrix.Rotation(0.06, 4, 'X')); bm2.free()   # 繞 Blender Y（遊戲 −z）：下端往外；繞 X：下端往後
        m.paint(soft(newf(m, f0)), col, 0.88)


def _tube(length, r, seg=8, r1=None):
    """沿 Blender Z 的圓管（中心在原點）；r1＝下端的半徑（袖口比較細）"""
    import bmesh as _bm
    bm = _bm.new(); _bm.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r if r1 is None else r1, radius2=r, depth=length); return bm


def helmet(m, x, y, z, yaw, col):
    """腳踏車安全帽（放在置物櫃上）：殼、三條通風孔、帽簷"""
    f0 = mark(m); m.ell((x, y + 0.06, z), 0.13, 0.11, 0.16, seg=12, rings=6, matrix=Matrix.Rotation(yaw, 4, 'Z')); m.paint(newf(m, f0), col)
    M = Mloc(x, y, z, yaw)
    for k in (-1, 0, 1): part(m, M, k * 0.045, 0.165, 0.0, 0.018, 0.012, 0.2, '#202020')
    part(m, M, 0, 0.07, 0.15, 0.16, 0.012, 0.05, '#202020', rx=0.2)


def book(m, M, w, t, d, col):
    """一本書（平放；底在 y=0）：白色的書頁＋上下封面（封面大一點，書頁看得到）"""
    part(m, M, 0, t / 2, 0, w - 0.006, t - 0.004, d - 0.006, '#f1ede2')
    part(m, M, 0, t - 0.0015, 0, w, 0.003, d, col); part(m, M, 0, 0.0015, 0, w, 0.003, d, col)
    part(m, M, -w / 2 + 0.0015, t / 2, 0, 0.003, t, d, col)


def bottle(m, x, y, z, col):
    clathe(m, [(0.0, 0.0), (0.034, 0.0), (0.035, 0.18), (0.028, 0.2), (0.02, 0.205), (0.0, 0.205)], x, y, z, col, seg=10)
    clathe(m, [(0.0, 0.0), (0.022, 0.0), (0.022, 0.035), (0.0, 0.035)], x, y + 0.2, z, '#2b2b2b', seg=10)


def desk_stuff(c, x, y, z, yaw, rr, laptop=False):
    """桌上的東西（坐的人前面那一塊；隨機一兩樣）：(x, z)＝桌面上的中心、y＝桌面高度、yaw＝坐的人面向的方向"""
    T = lw(x, z, yaw); m = c.vc
    picks = [rr.choice(['note', 'open', 'hand', 'text'] + (['laptop', 'laptop'] if laptop else []))] + ([rr.choice(['pcase', 'bottle', 'phone', 'pen'])] if rr.random() < 0.55 else [])
    for i, kind in enumerate(picks):   # 大的（筆記本、講義、課本、筆電）放中間偏一邊，小的（筆袋、水壺、手機、筆）放另一邊：不會疊在一起
        lx = (-0.07 if i == 0 else 0.2) + rr.uniform(-0.03, 0.03); lz = rr.uniform(-0.05, 0.05); a = yaw + rr.uniform(-0.2, 0.2) * (1 if i == 0 else 2)
        px, _, pz = T(lx, 0, lz); M = Mloc(px, y, pz, a); col = rr.choice(['#2f5d8a', '#8a2f3a', '#3f6a3a', '#c99a2e', '#4a4a52', '#d8d2c4', '#6a4a8a'])
        if kind == 'note': book(m, M, 0.18, 0.012, 0.25, col); part(m, M, 0.13, 0.006, 0.02, 0.012, 0.012, 0.14, '#1d2a55', ry=0.3)
        elif kind == 'open':   # 攤開的筆記本＋一支筆
            part(m, M, 0, 0.002, 0, 0.36, 0.004, 0.25, col); part(m, M, -0.088, 0.008, 0, 0.172, 0.008, 0.24, '#f6f4ee', rx=0.0); part(m, M, 0.088, 0.008, 0, 0.172, 0.008, 0.24, '#f6f4ee')
            part(m, M, 0.06, 0.016, 0.03, 0.01, 0.01, 0.14, '#202020', ry=0.5)
        elif kind == 'hand':   # 講義（一疊 A4、長尾夾）
            part(m, M, 0, 0.004, 0, 0.21, 0.008, 0.297, '#f7f6f1'); part(m, Mloc(px, y + 0.008, pz, a + 0.12), 0, 0.002, 0, 0.21, 0.004, 0.297, '#fbfaf6')
            part(m, M, 0, 0.012, -0.14, 0.04, 0.012, 0.03, '#1a1a1a')
        elif kind == 'text': book(m, M, 0.19, rr.uniform(0.025, 0.04), 0.26, col)
        elif kind == 'pcase': part(m, M, 0, 0.03, 0, 0.065, 0.06, 0.2, col, r=0.025)
        elif kind == 'bottle': bottle(m, px, y, pz, rr.choice(['#b8bcc0', '#3a6f9a', '#d97a6a', '#2b2b2b']))
        elif kind == 'phone': part(m, M, 0, 0.004, 0, 0.072, 0.008, 0.15, '#18191b', r=0.003)
        elif kind == 'pen': part(m, M, 0, 0.005, 0, 0.01, 0.01, 0.145, rr.choice(['#1d2a55', '#202020', '#a02020']))
        else:                  # 筆電（打開的，螢幕是暗的）
            part(m, M, 0, 0.008, 0.02, 0.31, 0.016, 0.215, '#bfc2c5', r=0.004); part(m, M, 0, 0.11, -0.095, 0.31, 0.21, 0.008, '#bfc2c5', rx=-0.3)
            part(m, M, 0, 0.11, -0.09, 0.29, 0.19, 0.003, '#15181c', rx=-0.3)


# ================= 牆上的東西 =================
def wall_clock(c, side, a, yc, r=0.17):
    """掛鐘：黑色的圓框（車床）＋鐘面（印刷，圓形）；跟著那一面牆淡出"""
    m = c.wg(side, 'trim', c.M['vc'], cm=True)
    bm = L.lathe([(0.0, 0.0), (r, 0.0), (r + 0.012, 0.018), (r + 0.004, 0.045), (r - 0.02, 0.05), (r - 0.026, 0.036), (0.0, 0.036)], seg=24)
    rotm = {'N': Matrix.Rotation(PI / 2, 4, 'X'), 'S': Matrix.Rotation(-PI / 2, 4, 'X'), 'W': Matrix.Rotation(PI / 2, 4, 'Y'), 'E': Matrix.Rotation(-PI / 2, 4, 'Y')}[side]
    f0 = mark(m); m.add_bm(bm, Matrix.Translation(g2b(*wall_pt(c, side, a, yc, 0.0))) @ rotm); bm.free(); m.paint(newf(m, f0), '#2b2b2b')
    pm = c.wg(side, 'print', c.M['print']); x0, y0, x1, y1 = REG['CLOCK']; uc, vc = (x0 + x1) / 2 / 1024, 1 - (y0 + y1) / 2 / 1024; ruv = 126 / 1024; rf = r - 0.022; R_ = RIGHT[side]
    ts = [2 * PI * k / 24 for k in range(24)]
    uvpoly(pm, [wall_pt(c, side, a + R_ * rf * math.cos(t), yc + rf * math.sin(t), 0.038) for t in ts], [(uc + ruv * math.cos(t), vc + ruv * math.sin(t)) for t in ts])


def flyer3d(c, side, a, y, key, ang, w=0.2, h=0.34, d=0.024, pin='#c83228'):
    """另外貼的一張傳單（離牆 d、在牆面上轉 ang）＋上面一顆圖釘；跟著那一面牆淡出"""
    pm = c.wg(side, 'print', c.M['print']); ca, sa = math.cos(ang), math.sin(ang); R_ = RIGHT[side]
    P = lambda u, v, dd: wall_pt(c, side, a + R_ * (u * ca - v * sa), y + u * sa + v * ca, dd)
    u0, v0, u1, v1 = uv(key)
    uvpoly(pm, [P(-w / 2, -h / 2, d), P(w / 2, -h / 2, d), P(w / 2, h / 2, d), P(-w / 2, h / 2, d)], [(u0, v0), (u1, v0), (u1, v1), (u0, v1)])
    tm = c.wg(side, 'trim', c.M['vc'], cm=True); f0 = mark(tm); tm.sphere(P(0, h / 2 - 0.03, d + 0.006), 0.009, seg=6, rings=4); tm.paint(newf(tm, f0), pin)


def extinguisher(c, x, z):
    """滅火器（放在牆邊地上；牆上有標示）：紅色鋼瓶、黑色握把、壓力錶、管子"""
    clathe(c.vc, [(0.0, 0.0), (0.072, 0.0), (0.078, 0.02), (0.078, 0.42), (0.058, 0.48), (0.024, 0.5), (0.0, 0.5)], x, 0.0, z, '#c8261e', seg=12)
    c.vc.cbox(x - 0.018, x + 0.018, 0.5, 0.56, z - 0.018, z + 0.018, '#2b2b2b'); c.vc.cbox(x - 0.07, x + 0.03, 0.56, 0.575, z - 0.016, z + 0.016, '#2b2b2b')
    ccyl(c.vc, (x + 0.025, 0.535, z - 0.01), (x + 0.025, 0.535, z + 0.03), 0.018, '#e8e8e4', seg=8)
    ccyl(c.vc, (x - 0.03, 0.53, z), (x - 0.09, 0.3, z + 0.02), 0.009, '#1a1a1a', seg=5, caps=False)


def bins(c, x0, x1, z0, z1, col, lid):
    """垃圾桶（有蓋子）"""
    c.vc.crbox(x0 + 0.01, x1 - 0.01, 0.0, 0.62, z0 + 0.01, z1 - 0.01, col, r=0.03, seg=1); c.vc.crbox(x0, x1, 0.62, 0.66, z0, z1, lid, r=0.015, seg=1)
    c.vc.cbox(x0 + 0.08, x1 - 0.08, 0.66, 0.67, (z0 + z1) / 2 - 0.05, (z0 + z1) / 2 + 0.05, '#2b2b2b')
    c.block(x0 - 0.03, x1 + 0.03, z0 - 0.03, z1 + 0.03, 'bin')


def drape(m, x0, x1, y0, y1, z, folds=5, depth=0.05):
    """有褶子的窗簾（S 牆：往室內是 −z）：一片布在 z 和 z−depth 之間來回"""
    n = folds * 2; xs = [x0 + (x1 - x0) * i / n for i in range(n + 1)]
    for i in range(n):
        za, zb = z - (depth if i % 2 else 0.0), z - (depth if (i + 1) % 2 else 0.0)
        m.quad([(xs[i + 1], y0, zb), (xs[i], y0, za), (xs[i], y1, za), (xs[i + 1], y1, zb)])


def carpet_sheen(mat):
    """方塊地毯一塊一塊看得出來（10-21 LAWWW-C：「方塊地毯在遊戲裡看不太出來」）：carpet_tiles 每一塊用貼圖的一個象限、一塊轉 90 度交錯；
    這裡讓四個象限各自亮一點、暗一點，每一格裡沿著毛的方向由暗到亮（毛倒向不同、反光不同，真的方塊地毯就是這樣看出一格一格），格子邊緣暗一點（接縫）"""
    import numpy as np
    n = next(n for n in mat.node_tree.nodes if n.type == 'TEX_IMAGE' and n.image and '_diff_' in n.image.name)
    src = n.image; w, h = src.size; px = np.empty(w * h * 4, np.float32); src.pixels.foreach_get(px); px = px.reshape(h, w, 4)
    hw, hh = w // 2, h // 2; xs, ys = np.arange(w), np.arange(h)
    base = np.where(ys[:, None] < hh, np.where(xs[None, :] < hw, 1.05, 0.94), np.where(xs[None, :] < hw, 0.97, 1.07))
    u = (xs % hw) / (hw - 1); v = (ys % hh) / (hh - 1)
    edge = np.minimum(np.minimum(u, 1 - u)[None, :] * hw, np.minimum(v, 1 - v)[:, None] * hh)   # 離格子邊緣幾個像素
    k = base * (0.92 + 0.14 * u[None, :]) * np.where(edge < 1.5, 0.8, 1.0)
    px[..., :3] *= k[..., None]
    im = bpy.data.images.new(src.name + '_tiles', w, h, alpha=False); im.pixels.foreach_set(np.clip(px, 0, 1).ravel()); n.image = im


def carpet_tiles(c, x0, x1, z0, z1, t=0.5, y=0.007):
    """方塊地毯（50 cm 一塊；毛的方向一塊橫一塊直＝每一塊的貼圖轉 90 度，方塊地毯常見的鋪法）＋四邊的鋁收邊條"""
    m = Mesh(f'{c.sid}_carpet', c.M['carpet']); bm = m.bm; uvl = bm.loops.layers.uv.verify()
    nx, nz = int(round((x1 - x0) / t)), int(round((z1 - z0) / t))
    for i in range(nx):
        for j in range(nz):
            a, b, p, q = x0 + i * t, x0 + (i + 1) * t, z0 + j * t, z0 + (j + 1) * t
            f = bm.faces.new([bm.verts.new(g2b(*pt)) for pt in ((a, y, q), (b, y, q), (b, y, p), (a, y, p))])
            u0, v0 = 0.5 * (i % 2), 0.5 * (j % 2); q4 = [(u0, v0), (u0 + 0.5, v0), (u0 + 0.5, v0 + 0.5), (u0, v0 + 0.5)]
            if (i + j) % 2: q4 = q4[1:] + q4[:1]
            for lp, q_ in zip(f.loops, q4): lp[uvl].uv = q_
    m.finish(c.root, uv=False)
    for (a, b, p, q) in ((x0 - 0.025, x1 + 0.025, z0 - 0.025, z0), (x0 - 0.025, x1 + 0.025, z1, z1 + 0.025), (x0 - 0.025, x0, z0, z1), (x1, x1 + 0.025, z0, z1)):
        c.vm.cbox(a, b, 0.0, 0.01, p, q, '#a9aeb2')


# ================= 主程式 =================
def build(rid):
    R = ROOMS[rid]; H = R['H']; K.H = H
    c = Room(rid, R); X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M; lec = c.lec; rr = random.Random(7 if lec else 9)
    fl = Mesh(f'{rid}_floorm', M['floor']); fl.box(X0, X1, -0.05, 0.0, Z0, Z1); fl.finish(c.root)
    ce = Mesh(f'{rid}_ceiling', M['ceil'], tile=1.2); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(c.root)   # 朝下
    if lec:   # 講台區：深色木地板（平的）＋鋁收邊條
        fz = Mesh(f'{rid}_frontfloor', M['front']); fz.box(X0, X0 + 2.3, 0.0, 0.006, Z0, Z1); fz.finish(c.root)
        c.vm.cbox(X0 + 2.3, X0 + 2.33, 0.0, 0.009, Z0 + 0.02, Z1 - 0.02, '#b8bcc0')
    else:     # 講台前的空地：方塊地毯（吉他社社課、活動的地方）
        carpet_tiles(c, X0 + 0.3, X0 + 2.8, -3.0, 3.0)
    wh = 1.0; trim_c = '#5a4a3e' if lec else '#b39470'
    # +z（S）：一排窗
    WX = R['wins']; wy0, wy1 = 1.3, 2.9
    c.wins = dict(side='S', wall='front', z=Z1, xs=WX, y=2.1, w=2.2, h=1.6, note='遊戲 room() 的窗：winWall＝front（+z），winXs 要寫 −x（room() 的 front 牆 x 是反的）；窗外的景用遊戲裡拍的照片')
    wl = c.wg('S', 'wall', M['wall']); wn = c.wg('S', 'wain', M['wain']); fr = c.wg('S', 'frame', M['vcm'], cm=True); gl = c.wg('S', 'glass', M['glass']); tr = c.wg('S', 'trim', M['vc'], cm=True)
    fab = c.wg('S', 'curtain', M['fabric'])
    QS = lambda xa, xb, y0, y1: [(xb, y0, Z1), (xa, y0, Z1), (xa, y1, Z1), (xb, y1, Z1)]
    xs = [X0] + [v for wx in WX for v in (wx - 1.1, wx + 1.1)] + [X1]
    for k in range(0, len(xs), 2): wl.quad(QS(xs[k], xs[k + 1], wh, H))
    wn.quad(QS(X0, X1, 0.0, wh))
    if lec: tr.cbox(X0, X1, wh - 0.02, wh + 0.03, Z1 - 0.015, Z1, trim_c)
    else: tr.cbox(X0, X1, 0.88, 0.98, Z1 - 0.025, Z1, trim_c)                                                          # 護牆條（椅子會被推來推去）
    for wi, wx in enumerate(WX):
        a, b = wx - 1.1, wx + 1.1; wl.quad(QS(a, b, wh, wy0)); wl.quad(QS(a, b, wy1, H))
        fr.cbox(a, b, wy0 - 0.03, wy0, Z1 - 0.3, Z1, '#d9d6cf')
        for (xa, xb) in ((a, a + 0.05), (b - 0.05, b), (wx - 0.025, wx + 0.025)): fr.cbox(xa, xb, wy0, wy1, Z1 - 0.08, Z1 - 0.03, '#a9aeb2')
        for (ya, yb) in ((wy0, wy0 + 0.05), (wy1 - 0.05, wy1)): fr.cbox(a, b, ya, yb, Z1 - 0.085, Z1 - 0.035, '#a9aeb2')
        gl.quad([(b, wy0, Z1 - 0.055), (a, wy0, Z1 - 0.055), (a, wy1, Z1 - 0.055), (b, wy1, Z1 - 0.055)])
        if lec:   # 202：落到窗台上緣的布窗簾（兩邊收起來；中間那扇的左邊拉了一半）、窗簾桿
            ccyl(fr, (a - 0.42, 3.13, Z1 - 0.2), (b + 0.42, 3.13, Z1 - 0.2), 0.013, '#3a3d40', seg=8)
            for xx in (a - 0.36, b + 0.36): fr.cbox(xx - 0.015, xx + 0.015, 3.09, 3.15, Z1 - 0.21, Z1, '#3a3d40')
            for (p0, p1) in ((a - 0.38, a + (0.95 if wi == 1 else 0.22)), (b - 0.22, b + 0.38)):
                drape(fab, p0, p1, 1.34, 3.11, Z1 - 0.2, folds=max(4, int((p1 - p0) / 0.12)))
        else:     # 多功能教室：捲簾拉到不同的高度（0＝收起來）
            fr.cbox(a + 0.05, b - 0.05, wy1 + 0.02, wy1 + 0.12, Z1 - 0.14, Z1 - 0.06, '#e6e2d8')
            drop = R['blinds'][wi]
            if drop > 0:
                yb = wy1 + 0.02 - drop * (wy1 + 0.02 - wy0); p0, p1 = a + 0.07, b - 0.07
                fab.quad([(p1, yb, Z1 - 0.1), (p0, yb, Z1 - 0.1), (p0, wy1 + 0.02, Z1 - 0.1), (p1, wy1 + 0.02, Z1 - 0.1)])
                fr.cbox(p0 - 0.01, p1 + 0.01, yb - 0.028, yb, Z1 - 0.115, Z1 - 0.085, '#c9ccce')
                ccyl(fr, (p1 - 0.08, yb, Z1 - 0.1), (p1 - 0.08, yb - 0.32, Z1 - 0.1), 0.003, '#e8e8e4', seg=4, caps=False)
    if lec:   # 窗台上的小盆栽（跟著窗台淡出）
        px_, pz_ = WX[2] - 0.6, Z1 - 0.17; clathe(tr, [(0.0, 0.0), (0.06, 0.0), (0.075, 0.11), (0.08, 0.12), (0.0, 0.12)], px_, wy0, pz_, '#b8694a', seg=10)
        for k in range(9):
            a_ = k * 2 * PI / 9 + 0.3; f0 = mark(tr)
            tr.ell((px_ + 0.045 * math.cos(a_), wy0 + 0.17 + 0.02 * (k % 3), pz_ + 0.045 * math.sin(a_)), 0.035, 0.06, 0.02, seg=6, rings=3, matrix=Matrix.Rotation(-a_, 4, 'Z') @ Matrix.Rotation(0.5, 4, 'X'))
            tr.paint(newf(tr, f0), '#4f8a3f', 0.85 + 0.05 * (k % 3))
        book(tr, Mloc(WX[0] + 0.7, wy0, Z1 - 0.2, PI / 2 + 0.2), 0.19, 0.03, 0.26, '#2f5d8a'); book(tr, Mloc(WX[0] + 0.72, wy0 + 0.03, Z1 - 0.2, PI / 2 + 0.05), 0.18, 0.02, 0.25, '#c99a2e')
    c.block(X0, X1, Z1 - 0.32, Z1, 'window_sill')
    # −z（N，走廊那一側）：後門（靠東）、門牌、安全門標示、時鐘（多功能教室）、吸音板（多功能教室）、開關、滅火器
    wl = c.wg('N', 'wall', M['wall']); wn = c.wg('N', 'wain', M['wain']); tr = c.wg('N', 'trim', M['vc'], cm=True); wd = c.wg('N', 'door', M['wood'])
    dx, dw = R['door_x'], 1.0; d0, d1 = dx - dw / 2 - 0.08, dx + dw / 2 + 0.08
    QN = lambda xa, xb, y0, y1: [(xa, y0, Z0), (xb, y0, Z0), (xb, y1, Z0), (xa, y1, Z0)]
    for (xa, xb) in ((X0, d0), (d1, X1)):
        wl.quad(QN(xa, xb, wh, H)); wn.quad(QN(xa, xb, 0.0, wh))
        if lec: tr.cbox(xa, xb, wh - 0.02, wh + 0.03, Z0, Z0 + 0.015, trim_c)
        else: tr.cbox(xa, xb, 0.88, 0.98, Z0, Z0 + 0.025, trim_c)
    wl.quad(QN(d0, d1, 2.2, H))
    for (xa, xb) in ((d0, d0 + 0.08), (d1 - 0.08, d1)): tr.cbox(xa, xb, 0.0, 2.2, Z0, Z0 + 0.06, '#5a5f63')
    tr.cbox(d0, d1, 2.12, 2.2, Z0, Z0 + 0.06, '#5a5f63')
    wd.rbox(dx - dw / 2 + 0.01, dx + dw / 2 - 0.01, 0.0, 2.11, Z0, Z0 + 0.04, r=0.004, seg=1)
    tr.cbox(dx - dw / 2 + 0.08, dx - dw / 2 + 0.18, 1.0, 1.04, Z0 + 0.04, Z0 + 0.09, '#c9ced2')   # 門把（跟著牆淡出）
    tr.cbox(dx - 0.2, dx + 0.2, 1.4, 1.85, Z0 + 0.04, Z0 + 0.045, '#2a2e33')
    tr.cbox(d0 - 0.65, d0 - 0.2, 1.7, 1.86, Z0, Z0 + 0.016, '#40464c'); pq(c, 'N', d0 - 0.64, d0 - 0.21, 1.71, 1.85, 'PLATE', inset=0.018)
    pq(c, 'N', dx - 0.3, dx + 0.3, 2.3, 2.52, 'EXIT', inset=0.016); c.wg('N', 'glow', M['fridge']).box(dx - 0.3, dx + 0.3, 2.28, 2.3, Z0, Z0 + 0.02)   # 燈條跟著牆淡出（10-20 截圖：原本飄在半空中）
    tr.crbox(d1 + 0.12, d1 + 0.22, 1.15, 1.29, Z0, Z0 + 0.012, '#f2f2ee', r=0.004, seg=1)                                 # 電燈開關
    for k in range(3): tr.cbox(d1 + 0.135 + k * 0.026, d1 + 0.153 + k * 0.026, 1.2, 1.24, Z0 + 0.012, Z0 + 0.02, '#d9d9d4')
    ex_x = d0 - 0.45; extinguisher(c, ex_x, Z0 + 0.11); pq(c, 'N', ex_x - 0.15, ex_x + 0.15, 1.08 if lec else 1.05, 1.19 if lec else 1.16, 'FIRE', inset=0.015)
    if not lec:
        wall_clock(c, 'N', -0.6, 2.8)
        for (xa, xb, col) in ((-5.3, -4.25, '#3e6f6c'), (-4.05, -3.0, '#4b5056'), (-2.8, -1.75, '#c99a3b')):   # 吸音板（布面）
            tr.crbox(xa, xb, 1.25, 2.3, Z0, Z0 + 0.045, col, r=0.012, seg=1)
    c.vc.crbox(dx - 0.6, dx + 0.6, 0.0, 0.01, Z0 + 0.08, Z0 + 0.88, '#3b3e42', r=0.004, seg=1)                          # 門口地墊
    # 西牆（前面）：黑板（202）／白板＋放下來的投影幕＋喇叭（多功能教室）、講桌、老師的位置
    wl = c.wg('W', 'wall', M['wall']); wn = c.wg('W', 'wain', M['wain']); tr = c.wg('W', 'trim', M['vc'], cm=True); bm = c.wg('W', 'board', M['board'])
    wl.quad([(X0, wh, Z1), (X0, wh, Z0), (X0, H, Z0), (X0, H, Z1)]); wn.quad([(X0, 0, Z1), (X0, 0, Z0), (X0, wh, Z0), (X0, wh, Z1)])
    if lec: tr.cbox(X0, X0 + 0.015, wh - 0.02, wh + 0.03, Z0, Z1, trim_c)
    bw = min(3.6, R['D'] / 2 - 0.9)
    tr.cbox(X0, X0 + 0.03, 0.95, 2.35, -bw, bw, '#b9bec2'); bm.quad([(X0 + 0.032, 1.0, bw - 0.05), (X0 + 0.032, 1.0, -bw + 0.05), (X0 + 0.032, 2.3, -bw + 0.05), (X0 + 0.032, 2.3, bw - 0.05)])
    pq(c, 'W', -bw + 0.2, -bw + 3.2, 1.05, 2.25, 'BOARD', inset=0.034); pq(c, 'W', bw - 3.2, bw - 0.2, 1.05, 2.25, 'BOARD', inset=0.034)
    tr.cbox(X0, X0 + 0.09, 0.93, 0.96, -bw + 0.1, bw - 0.1, '#9aa0a4')
    if lec:   # 粉筆、板擦（放在黑板的溝槽上：跟著牆淡出）
        for k, col in enumerate(('#f4f4ee', '#f4f4ee', '#f2e27a', '#f0a0a8', '#f4f4ee')):
            zz = -1.2 + k * 0.07 + (0.6 if k > 2 else 0.0); ccyl(tr, (X0 + 0.05, 0.968, zz), (X0 + 0.05, 0.968, zz + 0.07), 0.0055, col, seg=5)
        for zz in (-0.5, 1.6):
            tr.cbox(X0 + 0.02, X0 + 0.08, 0.96, 0.99, zz, zz + 0.13, '#3a4f6a'); tr.cbox(X0 + 0.02, X0 + 0.08, 0.99, 1.02, zz + 0.005, zz + 0.125, '#d8d4c8')
        wall_clock(c, 'W', 2.6, 2.78)
        tr.crbox(X0, X0 + 0.16, 2.9, 3.05, -1.7, 1.7, '#ece9e2', r=0.01, seg=1)                                          # 投影幕的盒子（收起來）
        tr.cbox(X0 + 0.1, X0 + 0.12, 2.6, 2.9, 0.0, 0.01, '#2b2b2b')
    else:     # 白板筆、板擦；投影幕放下來（白板露出兩邊）；兩支壁掛喇叭
        for k, col in enumerate(('#202020', '#1a3a8a', '#a02020')): tr.cbox(X0 + 0.03, X0 + 0.08, 0.96, 0.98, -0.6 + k * 0.14, -0.48 + k * 0.14, col)   # 白板筆（跟著牆淡出：10-20 截圖，牆藏起來時飄在半空中）
        tr.cbox(X0 + 0.02, X0 + 0.08, 0.96, 1.0, 2.3, 2.45, '#2b2b2b'); tr.cbox(X0 + 0.02, X0 + 0.08, 1.0, 1.02, 2.31, 2.44, '#6a6f74')
        tr.crbox(X0, X0 + 0.16, 2.92, 3.04, -1.75, 1.75, '#ece9e2', r=0.01, seg=1)
        sx0, sy0, sy1, sz = X0 + 0.15, 1.12, 2.92, 1.58
        tr.cbox(sx0, sx0 + 0.004, sy0, sy1, -sz, sz, '#f3f3ef')                                                          # 幕布（白）
        for (za, zb) in ((-sz, -sz + 0.05), (sz - 0.05, sz)): tr.cbox(sx0 + 0.004, sx0 + 0.006, sy0, sy1, za, zb, '#1c1c1c')   # 兩邊黑框
        tr.cbox(sx0 + 0.004, sx0 + 0.006, sy1 - 0.2, sy1, -sz, sz, '#1c1c1c'); tr.cbox(sx0 - 0.01, sx0 + 0.02, sy0 - 0.03, sy0, -sz, sz, '#3a3d40')
        tr.cbox(sx0 - 0.003, sx0 + 0.003, sy0 - 0.35, sy0 - 0.03, 0.0, 0.006, '#2b2b2b')
        for s_ in (-1, 1):
            Mw = Mloc(X0 + 0.17, 2.42, s_ * 4.02, PI / 2 + s_ * 0.35)
            part(tr, Mw, 0, 0.0, 0.0, 0.22, 0.34, 0.2, '#232323', r=0.012); part(tr, Mw, 0, 0.0, 0.101, 0.19, 0.3, 0.004, '#3a3a3a')
            tr.cbox(X0, X0 + 0.08, 2.38, 2.46, s_ * 4.02 - 0.03, s_ * 4.02 + 0.03, '#2b2b2b')
    # 天花板的投影機（鏡頭朝前面）
    px_ = X0 + 3.0; c.vc.crbox(px_ - 0.2, px_ + 0.2, H - 0.26, H - 0.14, -0.22, 0.22, '#e8e8e4', r=0.012, seg=1); c.vm.cbox(px_ - 0.02, px_ + 0.02, H - 0.14, H, -0.02, 0.02, '#9aa0a4')
    c.vm.cbox(px_ - 0.08, px_ + 0.08, H - 0.02, H, -0.08, 0.08, '#9aa0a4'); ccyl(c.vc, (px_ - 0.2, H - 0.2, 0.08), (px_ - 0.24, H - 0.2, 0.08), 0.045, '#2b2b2b', seg=10)
    c.fridgel.box(px_ - 0.205, px_ - 0.2, H - 0.24, H - 0.2, -0.12, -0.04)
    for k in range(4): c.vc.cbox(px_ + 0.2, px_ + 0.205, H - 0.24, H - 0.16, -0.16 + k * 0.05, -0.14 + k * 0.05, '#9a9a96')
    # 講桌
    lx = X0 + 1.4
    if lec:   # 202：木頭講桌、筆電、一疊講義、馬克杯、點名板、無線麥克風
        c.vc.crbox(lx - 0.28, lx + 0.28, 0.0, 1.05, -0.55, 0.55, '#6a5040', r=0.01, seg=1); c.wood.rbox(lx - 0.33, lx + 0.33, 1.05, 1.1, -0.6, 0.6, r=0.01, seg=2)
        ly = 1.1
        Mh = Mloc(lx + 0.05, ly, 0.38, PI / 2 + 0.1); part(c.vc, Mh, 0, 0.012, 0, 0.21, 0.024, 0.297, '#f7f6f1'); part(c.vc, Mloc(lx + 0.06, ly + 0.024, 0.39, PI / 2 - 0.08), 0, 0.003, 0, 0.21, 0.006, 0.297, '#fbfaf6')
        clathe(c.vc, [(0.0, 0.0), (0.04, 0.0), (0.042, 0.1), (0.038, 0.1), (0.0, 0.004)], lx + 0.18, ly, -0.45, '#f2efe8', seg=12)
        part(c.vc, Mloc(lx - 0.02, ly, -0.42, PI / 2 - 0.15), 0, 0.006, 0, 0.23, 0.012, 0.32, '#8a6a48'); part(c.vc, Mloc(lx - 0.02, ly + 0.012, -0.42, PI / 2 - 0.15), 0, 0.002, 0.02, 0.21, 0.004, 0.27, '#f7f6f1')
        ccyl(c.vc, (lx + 0.2, ly + 0.02, 0.15), (lx + 0.2, ly + 0.02, -0.07), 0.018, '#1f1f1f', seg=8)
        tote(c.vc, Mloc(lx + 0.05, 0.0, 0.7, PI / 2 + 0.2), '#c9b48f'); c.block(lx - 0.36, lx + 0.36, -0.63, 0.86, 'lectern')
    else:     # 多功能教室：有輪子的講桌（淺灰）、筆電、小混音器、無線麥克風
        c.vc.crbox(lx - 0.27, lx + 0.27, 0.12, 0.95, -0.5, 0.5, '#d2d3d0', r=0.012, seg=1); c.vc.crbox(lx - 0.3, lx + 0.3, 0.95, 0.98, -0.56, 0.56, '#efeee9', r=0.008, seg=1)
        c.vc.cbox(lx - 0.27, lx + 0.27, 0.5, 0.52, -0.5, 0.5, '#bdbebb')
        for sx in (-1, 1):
            for sz in (-1, 1): ccyl(c.vm, (lx + sx * 0.2, 0.12, sz * 0.42), (lx + sx * 0.2, 0.07, sz * 0.42), 0.012, '#2b2b2b', seg=6); ccyl(c.vc, (lx + sx * 0.2 - 0.03, 0.04, sz * 0.42), (lx + sx * 0.2 + 0.03, 0.04, sz * 0.42), 0.04, '#1c1c1c', seg=8)
        ly = 0.98
        c.vc.cbox(lx - 0.12, lx + 0.12, ly, ly + 0.05, 0.25, 0.47, '#2e3134')
        for k in range(6): ccyl(c.vc, (lx - 0.07 + (k % 3) * 0.07, ly + 0.05, 0.3 + (k // 3) * 0.1), (lx - 0.07 + (k % 3) * 0.07, ly + 0.07, 0.3 + (k // 3) * 0.1), 0.01, '#d9d9d4', seg=6)
        ccyl(c.vc, (lx + 0.18, ly + 0.02, -0.3), (lx + 0.18, ly + 0.02, -0.52), 0.018, '#1f1f1f', seg=8)
        c.block(lx - 0.36, lx + 0.36, -0.63, 0.63, 'lectern')
    c.vc.cbox(lx - 0.15, lx + 0.15, ly, ly + 0.03, -0.25, 0.25, '#2b2b2b'); c.vc.cbox(lx - 0.16, lx - 0.14, ly + 0.03, ly + 0.33, -0.24, 0.24, '#202225')
    uvquad(c.scr, [(lx - 0.162, ly + 0.05, -0.22), (lx - 0.162, ly + 0.05, 0.22), (lx - 0.162, ly + 0.31, 0.22), (lx - 0.162, ly + 0.31, -0.22)], uv('SLIDE'))   # 筆電螢幕朝老師（−x），在螢幕蓋的前面
    c.clerk = dict(x=round(X0 + 0.75, 3), z=0.0, yaw=round(PI / 2, 4), note='teacherSpot：老師站的位置（講桌後面、白板前，面向學生；clerk 欄位沿用店員的格式）')
    # 東牆（後面）：公告欄（傳單、圖釘）、使用須知、置物櫃（202：上面放書包、安全帽、書）或層架＋疊起來的椅子（多功能教室）
    wl = c.wg('E', 'wall', M['wall']); wn = c.wg('E', 'wain', M['wain']); tr = c.wg('E', 'trim', M['vc'], cm=True)
    wl.quad([(X1, wh, Z0), (X1, wh, Z1), (X1, H, Z1), (X1, H, Z0)]); wn.quad([(X1, 0, Z0), (X1, 0, Z1), (X1, wh, Z1), (X1, wh, Z0)])
    if lec: tr.cbox(X1 - 0.015, X1, wh - 0.02, wh + 0.03, Z0, Z1, trim_c)
    else: tr.cbox(X1 - 0.025, X1, 0.88, 0.98, Z0, Z1, trim_c)
    K.frame_board(c, 'E', 0.65, 2.15, 1.15, 2.15, '#6a4a30'); pq(c, 'E', 0.65, 2.15, 1.15, 2.15, 'NOTICE', inset=0.014)
    flyer3d(c, 'E', 0.82, 1.62, 'FLY1', 0.06, pin='#2a5ac8'); flyer3d(c, 'E', 1.95, 1.55, 'FLY2', -0.08); flyer3d(c, 'E', 1.38, 1.9, 'FLY3', 0.03, w=0.17, h=0.29, pin='#e0b020')
    K.frame_board(c, 'E', -1.6, -0.6, 1.3, 2.05, '#5a4a3e'); pq(c, 'E', -1.6, -0.6, 1.3, 2.05, 'RULES', inset=0.014)
    if R['back'] == 'lockers':   # 霖澤館 202：後面一排學生置物櫃（低的，上面放書包、安全帽、書）
        z0, z1 = Z1 - 0.32 - 2.2, Z1 - 0.4; bk = c.wg('E', 'trim', M['vc'], cm=True)   # 置物櫃跟著東牆淡出（上面的東西也一樣）
        bk.cbox(X1 - 0.45, X1, 0.0, 1.0, z0, z1, '#7d868f')
        n = int((z1 - z0) / 0.37)
        for k in range(n):
            a = z0 + k * (z1 - z0) / n
            for yy in (0.05, 0.52): bk.cbox(X1 - 0.455, X1 - 0.45, yy, yy + 0.43, a + 0.01, a + (z1 - z0) / n - 0.01, '#8e979f'); bk.cbox(X1 - 0.47, X1 - 0.455, yy + 0.3, yy + 0.36, a + 0.04, a + 0.06, '#2b2b2b')
        backpack_flat(bk, Mloc(X1 - 0.22, 1.0, z0 + 0.45, PI + 0.25), '#2c3e5c'); helmet(bk, X1 - 0.22, 1.0, z0 + 1.05, PI / 2 + 0.3, '#d9483a')
        book(bk, Mloc(X1 - 0.23, 1.0, z0 + 1.55, 0.1), 0.19, 0.035, 0.26, '#3f6a3a'); book(bk, Mloc(X1 - 0.22, 1.035, z0 + 1.56, -0.08), 0.18, 0.025, 0.25, '#8a2f3a')
        backpack(bk, Mloc(X1 - 0.2, 1.0, z1 - 0.3, -PI / 2 + 0.2, rx=0.12), '#5b6345')
        c.block(X1 - 0.48, X1, z0, z1, 'lockers')
    else:                         # 萬才館多功能教室：後面一個開放層架（譜架、音箱、延長線、別人放的書包）
        z0, z1 = Z1 - 0.32 - 2.0, Z1 - 0.4
        c.wood.box(X1 - 0.42, X1, 0.0, 0.05, z0, z1); c.wood.box(X1 - 0.42, X1, 0.95, 1.0, z0, z1); c.wood.box(X1 - 0.42, X1, 0.0, 1.0, z0, z0 + 0.03); c.wood.box(X1 - 0.42, X1, 0.0, 1.0, z1 - 0.03, z1)
        c.vc.crbox(X1 - 0.4, X1 - 0.06, 0.05, 0.5, z0 + 0.1, z0 + 0.55, '#2b2b2b', r=0.02, seg=1); c.vc.cbox(X1 - 0.39, X1 - 0.38, 0.12, 0.43, z0 + 0.15, z0 + 0.5, '#4a4a4a')   # 音箱
        for k in range(3): c.vm.cbox(X1 - 0.38, X1 - 0.08, 0.05 + k * 0.02, 0.07 + k * 0.02, z0 + 0.8 + k * 0.02, z0 + 1.4, '#2b2b2b')                               # 收起來的譜架
        c.vc.cbox(X1 - 0.35, X1 - 0.1, 1.0, 1.06, z1 - 0.7, z1 - 0.2, '#f4f4f1')                                                                                    # 延長線盒
        backpack(c.vc, Mloc(X1 - 0.22, 1.0, z0 + 0.5, -PI / 2 + 0.15, rx=0.1), '#6e2f35')
        for k in range(4): book(c.vc, Mloc(X1 - 0.22, 0.05 + k * 0.03, z0 + 1.65, 0.05 * (k % 2)), 0.24, 0.028, 0.31, ['#2f5d8a', '#c99a2e', '#4a4a52', '#3f6a3a'][k])   # 一疊樂譜夾
        c.block(X1 - 0.45, X1, z0, z1, 'shelf')
        for (zc, n_) in ((-1.66, 5), (-1.1, 4)):   # 牆邊疊起來的椅子（跟著東牆淡出；碰撞框照舊）
            for k in range(n_): shell_chair(c, X1 - 0.31 + k * 0.006, zc, -PI / 2, SHELL[(k + int(zc * 10)) % len(SHELL)], y0=k * 0.075, mv=tr, mm=c.wg('E', 'metal', M['vcm'], cm=True))
            c.block(X1 - 0.54, X1, zc - 0.25, zc + 0.25, 'chair_stack')
    if lec: K.ac_unit(c, X1, 2.65, -2.4, '-x', w=1.0, fade=True); K.ac_unit(c, X0, 2.65, Z1 - 1.2, '+x', w=1.0, fade=True)
    else:   # 多功能教室：天花板嵌入式冷氣（四面出風）
        for ax in (-0.6, 3.0):
            c.vc.crbox(ax - 0.42, ax + 0.42, H - 0.035, H, -0.42, 0.42, '#f1f1ee', r=0.01, seg=1); c.vc.cbox(ax - 0.2, ax + 0.2, H - 0.04, H - 0.035, -0.2, 0.2, '#dcdcd8')
            for (xa, xb, za, zb) in ((-0.34, 0.34, -0.36, -0.3), (-0.34, 0.34, 0.3, 0.36), (-0.36, -0.3, -0.34, 0.34), (0.3, 0.36, -0.34, 0.34)): c.vc.cbox(ax + xa, ax + xb, H - 0.04, H - 0.035, za, zb, '#7a7d80')
    bins(c, X1 - 0.45, X1 - 0.1, Z0 + 0.25, Z0 + 0.6, '#3f6fb0', '#34609c'); bins(c, X1 - 0.45, X1 - 0.1, Z0 + 0.68, Z0 + 1.03, '#8a8f94', '#6f7479')
    # 學生座位
    if lec:   # 202：每排兩張長桌（面向 −x）、一張 4 位，中間是走道；排和排之間 1.9 m（椅子後面走得過去）——座位、走近點和原本一樣
        for cx in R['rows']:
            for (z0, z1) in R['tables']:
                long_table(c, cx, z0, z1)
                for k in range(4):
                    x, z = cx + 0.55, z0 + (k + 0.5) * (z1 - z0) / 4; wood_chair(c, x, z, -PI / 2)
                    c.seat(x, z, -PI / 2, (cx, z), 'class', ap=(x + 0.45, z), label='坐下'); c.seats[-1]['uses'] = ['上課', '自習']   # 走近點在椅子後面 0.45 m（預設 0.6 m 離「坐下」按鈕的 0.7 m 太近：10-20 流程測試）
                    if rr.random() < 0.35: desk_stuff(c, cx + 0.03, 0.75, z, -PI / 2, rr)
        for (cx, zt, s_) in ((-1.5, -3.6, -1), (2.3, 3.6, 1)):   # 桌尾多一張沒有人坐的椅子：放書包、外套（不是座位）
            x, z = cx + 0.1, zt + s_ * 0.4; yaw = 0.0 if s_ < 0 else PI; wood_chair(c, x, z, yaw)
            bx, _, bz = lw(x, z, yaw)(0, 0, -0.08); backpack(c.vc, Mloc(bx, 0.455, bz, yaw, rx=-0.16), BAGC[0 if s_ < 0 else 3])
            if s_ > 0: jacket(c.vc, Mloc(x, 0.0, z, yaw), '#4a5d7a', top=0.85, zb=-0.222)
            obb_block(c, x, z, yaw, 0.24, 0.24, 'chair')
        for (cx, zz, col) in ((0.4, -1.08, BAGC[1]), (-3.4, 1.08, BAGC[6])):   # 桌尾地上靠著桌腳的書包（在長桌的碰撞框裡面：走路不會踢到）
            backpack(c.vc, Mloc(cx - 0.05, 0.0, zz, PI / 2, rx=-0.12), col)
    else:     # 多功能教室：單人課桌椅四排，每排兩組、一組 4 張（中間一條走道）；桌距 0.78 m、桌子之間留 0.22 m 的縫（一張一張分開，看得出是可以移動的單人桌）；
        # 兩端往中間轉一點、往前一點（圍著投影幕的弧）；每張桌子、椅子的位置、角度都差一點，椅子拉出來的距離不一樣。
        # 導航格（0.4 m；格子中心 z …−3.9、−3.5、−3.1…、−0.3、0.1、0.5…、3.3、3.7、4.1）：
        #   中間走道的 −0.3、0.1、0.5 三格要空著（每一排後面的走道從這裡接起來；原本長桌版也是）——北邊那一組碰撞框 < −0.3、南邊那一組 > 0.5；
        #   最外面的座位離牆不能太近：「坐下」的走近點候選（椅子兩側 0.55 m、後面 0.9 m…）不能落在沿牆那一條人物站不進去的格子（北 z < −3.7、南 z > 3.9），
        #   不然玩家在遠處按「坐下」會選到那一點、走過去卡住（10-20 reachability_all：WIP 版桌距 0.86、最外面的座位在 −3.48，選到 (3.04, −3.75) 卡住）。seatcheck() 會檢查。
        rb = random.Random(31)   # 桌邊掛的袋子另外一組亂數（不動到桌椅位置用的 rr）
        for rx0 in R['rows']:
            for g in (-1, 1):
                for k in range(4):
                    zc = -0.66 - k * 0.78 if g < 0 else 0.86 + k * 0.78
                    x = rx0 - 0.2 * (zc / 3.4) ** 2 + rr.uniform(-0.04, 0.04); zz = zc + rr.uniform(-0.02, 0.02); yaw = -PI / 2 - 0.055 * zc + rr.uniform(-0.04, 0.04)
                    single_desk(c, x, zz, yaw)
                    b = c.blocks[-1]; assert (b['z1'] < -0.3) if g < 0 else (b['z0'] > 0.5), ('多功能教室：桌子的碰撞框蓋到中間走道的格子', b)
                    fx, fz = math.sin(yaw), math.cos(yaw); back = 0.56 + rr.uniform(0.0, 0.08); cyaw = yaw + rr.uniform(-0.14, 0.14)
                    sx, sz = x - fx * back, zz - fz * back; shell_chair(c, sx, sz, cyaw, rr.choice(SHELL))
                    c.seat(sx, sz, cyaw, (x, zz), 'class', ap=(sx - math.sin(cyaw) * 0.45, sz - math.cos(cyaw) * 0.45), label='坐下'); c.seats[-1]['uses'] = ['上課', '社課']
                    if rr.random() < 0.35: desk_stuff(c, x, 0.74, zz, yaw, rr, laptop=True)
                    if k < 3 and rb.random() < 0.25:   # 掛在桌子側邊掛勾上的帆布袋：掛在朝同一組下一張桌子的那一邊（兩張桌子中間的縫；不在中間走道、牆邊那一側：走路不會穿過去；坐的人的腳、走近點也碰不到）
                        hx, _, hz = lw(x, zz, yaw)(g * 0.325, 0, 0.02)   # 桌子本地 +x ≈ 世界 +z（yaw ≈ −π/2）：北邊那一組（g −1）往北、南邊那一組往南
                        tote(c.vc, Mloc(hx, 0.19, hz, yaw + PI / 2 + rb.uniform(-0.08, 0.08)), rb.choice(['#d8cbb0', '#2b2f36', '#8a9a7a', '#c9a96e', '#7d3b46']))
        # 前面角落：疊起來的椅子、兩張沒有人坐的椅子（放書包、外套；不是座位）
        for k in range(5): shell_chair(c, X0 + 0.5, Z0 + 0.3 - k * 0.006, 0.0, SHELL[k % len(SHELL)], y0=k * 0.075)
        c.block(X0 + 0.25, X0 + 0.75, Z0, Z0 + 0.56, 'chair_stack')
        for (x, z, yaw, col, bag) in ((X0 + 1.2, Z0 + 0.35, 0.3, SHELL[0], 'back'), (X0 + 0.9, Z1 - 0.75, PI - 0.3, SHELL[3], 'tote')):
            shell_chair(c, x, z, yaw, col); T = lw(x, z, yaw); bx, _, bz = T(0, 0, -0.07)
            (backpack if bag == 'back' else tote)(c.vc, Mloc(bx, 0.46, bz, yaw, rx=-0.14), BAGC[2] if bag == 'back' else '#d8cbb0')
            if bag == 'tote': jacket(c.vc, Mloc(x, 0.0, z, yaw), '#55708f', seed=1)   # 牛仔外套（原本咖啡色的方板看起來像木板）
            obb_block(c, x, z, yaw, 0.24, 0.24, 'chair')
    # 燈
    # 202（INTERIOR-AAA-REVIEW-1028 v2，和 201 同一套）、多功能教室（MULTI-ROOM-V2-1030，LAWWW2-B 10-30：照 202 v2）：輕鋼架 0.6 m 格子＋T5 格柵燈具
    # （1.2×0.6，對齊格子；烘焙的面光源在同一個位置：lightbake/bake_flat_rooms.sh）。
    # 天花板上的東西（格子、燈具、格柵）名字含 WALL_ceil_、dir 朝下：鏡頭比天花板高時和牆一樣藏起來（201 的做法；不然從上面看是一張白色的網）
    # 多功能教室原本是貼在天花板上的兩排平板燈：格子線放在 0.3＋0.6k（房間置中），燈具 x ±1.5、±4.5、z ±2.4（燈具的邊剛好在格子線上）；嵌入式冷氣照舊
    if lec: GX0, GZ0, LXS, LZS = 0.2, 0.0, [X0 + 1.6 + k * 2.4 for k in range(5)], (-2.7, 2.7)
    else: GX0, GZ0, LXS, LZS = 0.3, 0.3, [-4.5, -1.5, 1.5, 4.5], (-2.4, 2.4)
    cg, cl, cv = CMesh(f'WALL_ceil_{rid}_grid', M['vc']), Mesh(f'WALL_ceil_{rid}_light', M['tube']), CMesh(f'WALL_ceil_{rid}_louvre', M['vcm'])
    for xg in [GX0 + 0.6 * k for k in range(-14, 14)]:
        if X0 + 0.05 < xg < X1 - 0.05: cg.cbox(xg - 0.012, xg + 0.012, H - 0.015, H - 0.001, Z0, Z1, '#e6e5e1')
    for zg in [GZ0 + 0.6 * k for k in range(-10, 11)]:
        if Z0 + 0.05 < zg < Z1 - 0.05: cg.cbox(X0, X1, H - 0.015, H - 0.001, zg - 0.012, zg + 0.012, '#e6e5e1')
    for x in LXS:
        for z in LZS:
            cg.cbox(x - 0.6, x + 0.6, H - 0.04, H - 0.002, z - 0.3, z + 0.3, '#ecebe7')                    # 燈具外殼（凸出天花板 4 cm）
            cl.box(x - 0.57, x + 0.57, H - 0.044, H - 0.04, z - 0.27, z + 0.27)                             # 發光面
            for oz in (-0.18, -0.09, 0.0, 0.09, 0.18): cv.cbox(x - 0.57, x + 0.57, H - 0.058, H - 0.044, z + oz - 0.004, z + oz + 0.004, '#d3d6d9')   # 不要用 dx、dz：build() 後面的門、出生點用 dx
            for ox in (-0.38, 0.0, 0.38): cv.cbox(x + ox - 0.004, x + ox + 0.004, H - 0.058, H - 0.044, z - 0.27, z + 0.27, '#d3d6d9')
    for m_ in (cg, cl, cv): m_.finish(c.root, props={'dir': [0, -1, 0]}, uv=False)
    c.look('board', round(X0 + 1.0, 3), round(bw - 0.6, 3), 0.9, '黑板' if lec else '白板', '', dev=('黑板' if lec else '白板') + '上的字由課堂或事件決定；遊戲裡顯示的字等 AA 寫')
    c.look('notice', round(X1 - 0.9, 3), 1.4, 0.9, '公告欄', '', dev='公告欄；遊戲裡顯示的字等 AA 寫')
    c.door = dict(x=dx, w=dw, z=Z0, note=f"−z 那一面靠東（後門）；從{'霖澤館 2F 迴廊的 202 門（linze_layout.js doors.c202，lv 1、x 3.0）' if rid == 'linze_202' else '萬才館 1F 大廳北牆的「多功能教室」門（wancai_layout.js doors.multi，lv 0、x 2.0）'}進來")
    c.spawn = dict(x=dx, z=round(Z0 + 1.45, 3), yaw=round(-PI / 2 + 0.4, 4), note='進門，大致面向講台（−x）')
    c.exits = [dict(x=dx, z=round(Z0 + 0.45, 3), r=0.7, label='離開教室', to=R['host'], spawn_note=f"回到{R['host']}、{R['door_id']} 的門前面（lv {R['host_lv']}）")]
    D = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}
    for k, ms in c.WG.items():
        for key, m in ms.items(): m.finish(c.root, props={'dir': D[k]}, uv=key in ('wall', 'wain', 'door', 'curtain'), merge=key not in ('print', 'screen', 'view'))
    for m in (c.vc, c.vm, c.tube, c.warm, c.fridgel, c.steel): m.finish(c.root, uv=False)
    c.wood.finish(c.root)
    if c.desk: c.desk.finish(c.root)
    for m in (c.prt, c.scr): m.finish(c.root, uv=False, merge=False)
    for m in c.extra.values(): m.finish(c.root, uv=False)
    L.merge_by_material(c.root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: '')
    out = os.path.join(OUTDIR, f'{rid}.glb'); st = L.export(out, gpu_instances=False)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    lay = dict(version=1, zone=rid, name=R['name'], type='教室', src=R['src'] + '；LINZE-WANCAI-FLOORS-1020；ART-ROOM-MULTI-1020／ART-ROOM-LIFE-1020',
               bounds=dict(x0=X0, x1=X1, z0=Z0, z1=Z1), h=H, cam_dist=4.4, door=c.door, spawn=c.spawn, exits=c.exits, windows=c.wins,
               counter=None, clerk=c.clerk, teacherSpot=dict(c.clerk), order=None, seats=c.seats, interact=c.inter, blocks=c.blocks, view=R.get('view', rid),
               host_door=dict(zone=R['host'], id=R['door_id'], lv=R['host_lv'], note='門的資料（linze_layout.js／wancai_layout.js 的 doors）：拿掉 closed、加 to，出生點用這裡的 spawn；上課、社課的流程由 LAWWW-C 改'))
    auto_ap(c, lay)
    prob = navcheck(c, lay) + seatcheck(lay); lay['navcheck'] = dict(cell=0.4, inset=0.25, problems=prob, ap=sum(1 for s in lay['seats'] if s.get('ap')))
    L.write_json(os.path.join(OUTDIR, f'{rid}.layout.json'), lay)
    L.write_json(out[:-4] + '.json', dict(st if isinstance(st, dict) else {}, tris_total=tris, layout=f'{rid}.layout.json', seats=len(c.seats)))
    print(json.dumps({'room': rid, 'tris': tris, 'seats': len(c.seats), 'ap': lay['navcheck']['ap'], 'problems': prob}, ensure_ascii=False))
    return prob


def seatcheck(lay, cell=0.4):
    """比 navcheck 嚴格的座位檢查（10-20 reachability_all 抓到的問題）：遊戲的 GAME.seatApproach 會在「座位指定的走近點 ap」和椅子前後左右的候選點
    （前 0.5、後 0.6、兩側 0.55、後 0.7、0.75、前 0.8、後 0.9）裡，挑一個站得住（半徑 0.3）、從玩家現在的位置路線最短的（ap 少算 1 m）。
    遊戲的找路先走「人物寬度過得去」的格子（clearMask：格子中心半徑 0.33 站得住），起點、終點那一格可以貼邊；找不到才退回貼邊的路（可能走到一半卡住）。
    所以：每個站得住的候選點，那一格要在 clearMask 連得到的範圍裡，或是緊鄰（上下左右；斜的要轉角那一格也過得去）一格連得到的——
    不然玩家在遠處按「坐下」（或 NPC 照玩家的位置選點）可能選到它，退回貼邊的路，走過去卡住。"""
    Bd = lay['bounds']; ox, oz = Bd['x0'], Bd['z0']; cols, rows = math.ceil((Bd['x1'] - ox) / cell), math.ceil((Bd['z1'] - oz) / cell)
    blk = [[False] * cols for _ in range(rows)]
    w2 = lambda cx, cz: (ox + (cx + 0.5) * cell, oz + (cz + 0.5) * cell)
    for r_ in range(rows):
        for c_ in range(cols):
            x, z = w2(c_, r_)
            if x < Bd['x0'] + 0.25 or x > Bd['x1'] - 0.25 or z < Bd['z0'] + 0.25 or z > Bd['z1'] - 0.25: blk[r_][c_] = True
    for b in lay['blocks']:   # 和遊戲 rooms_glb3d.js 一樣：blockRect(中心, max(寬, 0.4), max(深, 0.4))，格子中心在框裡就擋
        cx_, cz_ = (b['x0'] + b['x1']) / 2, (b['z0'] + b['z1']) / 2; hw, hd = max(b['x1'] - b['x0'], 0.4) / 2, max(b['z1'] - b['z0'], 0.4) / 2
        for r_ in range(rows):
            for c_ in range(cols):
                x, z = w2(c_, r_)
                if abs(x - cx_) <= hw and abs(z - cz_) <= hd: blk[r_][c_] = True
    cellof = lambda x, z: (math.floor((x - ox) / cell), math.floor((z - oz) / cell))
    def blocked(cx, cz): return not (0 <= cx < cols and 0 <= cz < rows) or blk[cz][cx]
    def free(x, z): return not blocked(*cellof(x, z))
    clear = lambda x, z, r: free(x, z) and free(x + r, z) and free(x - r, z) and free(x, z + r) and free(x, z - r)
    cm = {(c_, r_) for r_ in range(rows) for c_ in range(cols) if not blk[r_][c_] and clear(*w2(c_, r_), 0.33)}
    sp = lay['spawn']; s0 = cellof(sp['x'], sp['z']); seen = {s0}; q = [s0]
    while q:   # 起點那一格可以貼邊；之後只走 clearMask（斜著走：轉角的兩格至少一格在 clearMask、而且都沒擋）
        cx, cz = q.pop()
        for dx in (-1, 0, 1):
            for dz in (-1, 0, 1):
                n = (cx + dx, cz + dz)
                if (not dx and not dz) or n in seen or blocked(*n) or n not in cm: continue
                if dx and dz and (blocked(cx + dx, cz) or blocked(cx, cz + dz) or not ((cx + dx, cz) in cm or (cx, cz + dz) in cm)): continue
                seen.add(n); q.append(n)
    def ok(x, z):   # 終點那一格可以貼邊：它自己在範圍裡，或從範圍裡的一格走一步進去
        c0 = cellof(x, z)
        if c0 in seen: return True
        for dx in (-1, 0, 1):
            for dz in (-1, 0, 1):
                p = (c0[0] - dx, c0[1] - dz)
                if (not dx and not dz) or p not in seen: continue
                if dx and dz and (blocked(p[0] + dx, p[1]) or blocked(p[0], p[1] + dz) or not ((p[0] + dx, p[1]) in cm or (p[0], p[1] + dz) in cm)): continue
                return True
        return False
    P = []
    for s in lay['seats']:
        fx, fz = math.sin(s['yaw']), math.cos(s['yaw'])
        cand = ([('ap', s['ap'][0], s['ap'][1])] if s.get('ap') else []) + [(nm, s['x'] + dx, s['z'] + dz) for nm, dx, dz in (
            ('前0.5', fx * 0.5, fz * 0.5), ('後0.6', -fx * 0.6, -fz * 0.6), ('側0.55', fz * 0.55, -fx * 0.55), ('側0.55', -fz * 0.55, fx * 0.55),
            ('後0.7', -fx * 0.7, -fz * 0.7), ('後0.75', -fx * 0.75, -fz * 0.75), ('前0.8', fx * 0.8, fz * 0.8), ('後0.9', -fx * 0.9, -fz * 0.9))]
        for nm, x, z in cand:
            if clear(x, z, 0.3) and not ok(x, z): P.append(f'座位 ({s["x"]}, {s["z"]}) 的走近點候選 {nm} ({x:.2f}, {z:.2f}) 站得住、但走不過去（遊戲可能選到它、走到一半卡住）')
        if s.get('ap') and not (clear(*s['ap'], 0.3) and ok(*s['ap'])): P.append(f'座位 ({s["x"]}, {s["z"]}) 的 ap 站不住或走不到')
        if math.hypot(s['x'] - sp['x'], s['z'] - sp['z']) < 0.75: P.append(f'出生點離座位 ({s["x"]}, {s["z"]}) 不到 0.75 m（座位的互動範圍 0.7：一進門就出現「坐下」、貼著椅子）')
    return P


def pq(c, side, a0, a1, y0, y1, key, inset=0.015):
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; m = c.wg(side, 'print', c.M['print'])
    if side == 'N': z = Z0 + inset; pts = [(a0, y0, z), (a1, y0, z), (a1, y1, z), (a0, y1, z)]
    elif side == 'S': z = Z1 - inset; pts = [(a1, y0, z), (a0, y0, z), (a0, y1, z), (a1, y1, z)]
    elif side == 'W': x = X0 + inset; pts = [(x, y0, a1), (x, y0, a0), (x, y1, a0), (x, y1, a1)]
    else: x = X1 - inset; pts = [(x, y0, a0), (x, y0, a1), (x, y1, a1), (x, y1, a0)]
    uvquad(m, pts, uv(key))


if __name__ == '__main__':
    which = arg('--room', 'all'); ids = list(ROOMS) if which == 'all' else which.split(',')
    if len(ids) > 1:   # 每一間一個 Blender 行程（B.reset 以後共用的貼圖快取會失效，和 lane118_shops.py --shop all 一樣）
        import subprocess
        for rid in ids: subprocess.run([sys.executable, os.path.abspath(__file__), '--', '--room', rid, '--out-dir', os.path.relpath(OUTDIR, L.ROOT)], check=False)
    else:
        make_tex(ids[0], ROOMS[ids[0]]); p = build(ids[0]); print('FLAT_CLASSROOM', ids[0], 'OK' if not p else p)
