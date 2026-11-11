"""118 巷九間店的室內印刷品貼圖集（LANE118-SHOPS-1020；lane118_shops.py 用）→ textures/gen/l118_<id>_print.png、l118_screens.png。
每間店一張 1024×1024（一個材質）：
  MENU  (0, 0)–(1024, 384)     菜單板（店名＋品名＋價錢，照 AA_280 第 1 節）
  NAME  (0, 384)–(1024, 576)   店裡的店名牌（櫃台後面的牆）
  P1    (0, 576)–(512, 1024)   直的海報（每間店自己的：今日推薦、手寫公告…）
  HOURS (512, 576)–(1024, 800) 營業時間（照 AA_280）
  P2    (512, 800)–(1024, 1024) 小的告示（每間店自己的）
l118_screens.png（發光材質）：電視的午間新聞畫面（家常菜）、收銀機螢幕、點餐螢幕；不放真實電視台、品牌（D77）。
店名、菜單全部虛構（AA_280）；字型 文泉驛正黑。用法：/opt/blenv/bin/python tools/blender/env_second/lane118_shops_tex.py（lane118_shops.py 找不到貼圖時也會自己呼叫）"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, 'textures', 'gen')
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
REG = {'MENU': (0, 0, 1024, 384), 'NAME': (0, 384, 1024, 576), 'P1': (0, 576, 512, 1024), 'HOURS': (512, 576, 1024, 800), 'P2': (512, 800, 1024, 1024)}
SCR = {'tv': (0, 0, 512, 288), 'pos': (512, 0, 768, 160), 'order': (768, 0, 1024, 192)}


def F(n): return ImageFont.truetype(CJK, n)


def uv(reg, key):
    """區域 → (u0, v0, u1, v1)（glTF／Blender UV：v 往上，圖片第 0 列在上面）"""
    x0, y0, x1, y1 = reg[key]; W = H = 1024   # 兩張貼圖集都是 1024×1024
    return (x0 / W, 1 - y1 / H, x1 / W, 1 - y0 / H)


def ctext(d, cx, y, t, f, fill):
    w = d.textlength(t, font=f); d.text((cx - w / 2, y), t, font=f, fill=fill)


# 每間店：菜單（AA_280 第 1 節，字串照抄）、營業時間、配色、店裡的告示
SHOPS = {
    # L118-SHOPS-REDO-1111（X338）：店名、品名、價錢照使用者的文字規格；營業時間照 AA_280 第 1 節（11-11 定稿）
    'dian': dict(name='118牛排', sub='夜市鐵板牛排', menu=[('鐵板牛排', 190), ('雪花牛排', 230), ('雞排', 180), ('豬排', 170), ('雙拼', 280)], hours='11:30～14:00、17:00～21:30；週二休',
                 bg='#c4201a', fg='#ffd21e', ac='#ffd21e', p1=('招牌', ['鐵板牛排　190', '雞排　180']), ph=['steak', 'steak_chicken'], p2='濃湯・紅茶 自取'),
    'self': dict(name='水上便當', sub='雞腿、雞排便當', menu=[('炸雞腿飯', 145), ('雞排飯', 135), ('滷雞腿飯', 130), ('排骨飯', 125), ('雙拼', 165)], hours='10:30～14:00、16:30～19:30；週日休',
                 bg='#f7c41a', fg='#4a2414', ac='#c8201a', p1=('招牌', ['炸雞腿飯　145', '雞排飯　135']), ph=['bento_leg', 'bento_cutlet'], p2='內用・外帶'),
    # L118-SHOPS-REDO-1111（X338，使用者 11-11）：tea 這一格改成辛亥韓食（韓式鍋物、鐵板烤肉；品名、價錢照使用者的規格）。營業時間照 AA_280 第 1 節
    'tea': dict(name='辛亥韓食', sub='韓式鍋物・鐵板烤肉', menu=[('泡菜鍋', 190), ('海鮮豆腐鍋', 210), ('鐵板豬肉', 200), ('鐵板牛肉', 230), ('石鍋拌飯', 180)], hours='11:00～14:00、17:00～20:30；每天',
                bg='#7a1418', fg='#ffffff', ac='#e8c890', p1=('招牌', ['泡菜鍋　190', '石鍋拌飯　180']), ph=['stew', 'bibimbap'], p2='小菜可以續'),
    'home': dict(name='巷口家常菜', sub='家常菜', menu=[('排骨飯', 95), ('雞腿便當', 110), ('番茄炒蛋（單點）', 70)], hours='11:00～14:00、17:00～20:00；週一休',
                 bg='#8c3b2a', fg='#f4ead8', ac='#f2c230', p1=('本店', ['排骨現炸', '便當可外帶', '湯免費自取']), p2='電話訂便當請早'),
    'cafe2': dict(name='慢讀咖啡', sub='咖啡', menu=[('美式咖啡', 70), ('拿鐵', 95), ('今日蛋糕', 90)], hours='09:00～18:00；週二休',
                  bg='#3b2a1e', fg='#f4ead8', ac='#c9a24a', p1=('慢讀', ['書可以自由取閱', '看完請放回書架', '窗邊有插座']), p2='低消一杯飲料'),
    'pasta': dict(name='Pasta 118', sub='義大利麵', menu=[('白醬雞肉麵', 130), ('番茄海鮮麵', 150), ('青醬培根麵', 140)], hours='11:30～14:00、17:00～21:00；週三休',
                  bg='#f4f1ea', fg='#8c3b47', ac='#2f5d50', p1=('TODAY', ['今日濃湯：南瓜', '加麵 +30', '吧檯座位歡迎一位']), p2='麵的軟硬可以說'),
    'korea': dict(name='清州刀削麵', sub='刀削麵館', menu=[('牛肉刀削麵', 190), ('番茄刀削麵', 150), ('木須炒刀削麵', 170), ('炸醬刀削麵', 140)], hours='11:00～14:00、17:00～20:00；週日休',
                  bg='#fbfaf5', fg='#c8201a', ac='#c8201a', menu_paper=True, p1=('招牌', ['牛肉刀削麵　190', '番茄刀削麵　150']), ph=['noodle_beef', 'noodle_tomato'], p2='現削現煮'),
    'omu': dict(name='蛋包飯研究所', sub='蛋包飯', menu=[('咖哩蛋包飯', 120), ('番茄醬蛋包飯', 110)], hours='11:30～14:30、17:00～20:30；週一休',
                bg='#f2c230', fg='#5c3a21', ac='#e0a030', p1=('今日實驗', ['半熟：蛋汁會流下來', '全熟：比較好帶走', '醬汁可以加量']), p2='研究員招募中（打工）'),
    'noodle2': dict(name='六張犁麵舖', sub='麵店', menu=[('牛肉麵', 150), ('乾麵＋滷蛋', 75), ('餛飩湯', 50)], hours='11:00～14:00、17:00～20:00；週日休',
                    bg='#f4ead8', fg='#9c2f2a', ac='#9c2f2a', p1=('小菜', ['小菜自己拿', '一盤三十', '辣油在桌上']), p2='大碗加二十'),
}


def hexrgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def wood_bg(w, h, base, seed):
    """菜單板的木紋底（程式畫的：深淺條紋＋雜訊）"""
    rr = random.Random(seed); im = Image.new('RGB', (w, h), base); d = ImageDraw.Draw(im); b = hexrgb(base)
    for y in range(0, h, 3):
        k = 0.9 + 0.12 * ((y * 7 + rr.randint(0, 9)) % 17) / 17
        d.line([(0, y), (w, y)], fill=tuple(min(255, int(c * k)) for c in b), width=3)
    return im.filter(ImageFilter.GaussianBlur(1.2))


def paper(w, h, col='#f6f1e4', seed=1):
    rr = random.Random(seed); im = Image.new('RGB', (w, h), col); px = im.load(); b = hexrgb(col)
    for _ in range(w * h // 40):
        x, y = rr.randrange(w), rr.randrange(h); k = rr.uniform(0.94, 1.0); px[x, y] = tuple(int(c * k) for c in b)
    return im


def shop_atlas(sid, S):
    im = Image.new('RGB', (1024, 1024), '#808080'); bg, fg, ac = hexrgb(S['bg']), hexrgb(S['fg']), hexrgb(S['ac'])
    # MENU：上面一條店名，下面品名……價錢（一行一道）
    x0, y0, x1, y1 = REG['MENU']; m = wood_bg(x1 - x0, y1 - y0, S['bg'] if sum(bg) < 500 else '#3a2a1e', sum(ord(ch) for ch in sid) % 999)
    d = ImageDraw.Draw(m); light = S['fg'] if sum(bg) < 500 else '#f4ead8'
    if S.get('menu_paper'): m = paper(x1 - x0, y1 - y0, '#fbf9f2', seed=5); d = ImageDraw.Draw(m); light = S['fg']   # 白底、店的字色（清州刀削麵：參考圖牆上的白底紅字菜單）
    d.rectangle([10, 10, m.width - 11, m.height - 11], outline=hexrgb(S['ac']), width=6)
    ctext(d, m.width / 2, 22, S['name'] + ' 菜單', F(56), hexrgb(light))
    n = len(S['menu']); fh = 64 if n <= 3 else 52; y = 110
    if n >= 4:   # 四樣以上：分兩欄（L118-SHOPS-REDO-1111：新店的菜單四、五樣，一欄排不下）
        fh = 46; rows = (n + 1) // 2; cw = (m.width - 100) // 2
        for i, (nm, pr) in enumerate(S['menu']):
            cx0 = 50 + (i // rows) * (cw + 20); yy = 104 + (i % rows) * (fh + 36); t = str(pr); w = d.textlength(t, font=F(fh)); f_ = F(fh if len(nm) <= 6 else int(fh * 6.3 / len(nm)))
            d.text((cx0, yy + (fh - f_.size) // 2), nm, font=f_, fill=hexrgb(light)); d.text((cx0 + cw - w, yy), t, font=F(fh), fill=hexrgb(S['ac']))
            x = cx0 + d.textlength(nm, font=f_) + 14
            while x < cx0 + cw - w - 16: d.ellipse([x, yy + fh * 0.62, x + 5, yy + fh * 0.62 + 5], fill=hexrgb(light)); x += 20
    for (nm, pr) in (S['menu'] if n < 4 else []):
        d.text((70, y), nm, font=F(fh), fill=hexrgb(light)); t = str(pr); w = d.textlength(t, font=F(fh)); d.text((m.width - 70 - w, y), t, font=F(fh), fill=hexrgb(S['ac']))
        x = 70 + d.textlength(nm, font=F(fh)) + 18
        while x < m.width - 90 - w: d.ellipse([x, y + fh * 0.62, x + 6, y + fh * 0.62 + 6], fill=hexrgb(light)); x += 22
        y += fh + 26
    im.paste(m, (x0, y0))
    # NAME：店名牌（店的顏色、字色）
    x0, y0, x1, y1 = REG['NAME']; nmim = Image.new('RGB', (x1 - x0, y1 - y0), bg); d = ImageDraw.Draw(nmim)
    d.rectangle([0, 0, nmim.width - 1, 14], fill=ac); d.rectangle([0, nmim.height - 15, nmim.width - 1, nmim.height - 1], fill=ac)
    ctext(d, nmim.width / 2, 34, S['name'], F(104 if len(S['name']) <= 5 else 88), fg)
    im.paste(nmim, (x0, y0))
    # P1：直的海報（米白紙、店色標題、三行）
    x0, y0, x1, y1 = REG['P1']; p = paper(x1 - x0, y1 - y0, seed=hash(sid + 'p1') % 999); d = ImageDraw.Draw(p)
    t, lines = S['p1']; d.rectangle([0, 0, p.width - 1, 96], fill=bg if sum(bg) < 650 else ac)
    ctext(d, p.width / 2, 18, t, F(60), fg if sum(bg) < 650 else (255, 255, 255))
    yy = 140
    if S.get('ph'):   # 有餐點圖的海報（l118_food_tex.py：程式畫的，不是照片）：兩張圖，各一行品名和價錢
        import l118_food_tex as _FD
        for k, (kind, ln) in enumerate(zip(S['ph'], lines)):
            y0_ = 108 + k * 168; ph = _FD.dish(kind, 300, 124); p.paste(ph, ((p.width - 300) // 2, y0_)); ctext(d, p.width / 2, y0_ + 128, ln, F(30), (60, 50, 40))
        lines = []
    for ln in lines: ctext(d, p.width / 2, yy, ln, F(40 if len(ln) <= 9 else 32), (60, 50, 40)); yy += 86
    d.rectangle([4, 4, p.width - 5, p.height - 5], outline=(190, 180, 160), width=3)
    im.paste(p, (x0, y0))
    # HOURS：營業時間（白紙黑字）
    x0, y0, x1, y1 = REG['HOURS']; h = paper(x1 - x0, y1 - y0, '#ffffff', seed=7); d = ImageDraw.Draw(h)
    ctext(d, h.width / 2, 20, '營業時間', F(48), (40, 40, 40)); hrs = S['hours'].split('；')
    yy = 92
    for ln in hrs: ctext(d, h.width / 2, yy, ln, F(34 if len(ln) <= 14 else 28), (60, 60, 60)); yy += 52
    d.rectangle([3, 3, h.width - 4, h.height - 4], outline=bg if sum(bg) < 650 else ac, width=5)
    im.paste(h, (x0, y0))
    # P2：小告示（手寫感：黃色便利貼）
    x0, y0, x1, y1 = REG['P2']; q = paper(x1 - x0, y1 - y0, '#f7e08a', seed=11); d = ImageDraw.Draw(q)
    t = S['p2']; f = F(44 if len(t) <= 9 else 34); ctext(d, q.width / 2, q.height / 2 - 28, t, f, (70, 50, 30))
    im.paste(q, (x0, y0))
    im.save(os.path.join(GEN, f'l118_{sid}_print.png'))


def screens():
    im = Image.new('RGB', (1024, 1024), '#101418'); d = ImageDraw.Draw(im)
    # 電視：午間新聞（虛構：沒有電視台標誌）——主播台的藍色背景、下面一條跑馬燈
    x0, y0, x1, y1 = SCR['tv']; d.rectangle([x0, y0, x1, y1], fill=(34, 74, 128))
    for k in range(6): d.rectangle([x0 + 20 + k * 80, y0 + 30, x0 + 70 + k * 80, y0 + 170], fill=(46, 96, 158))
    d.ellipse([x0 + 200, y0 + 70, x0 + 280, y0 + 150], fill=(236, 206, 180)); d.rectangle([x0 + 175, y0 + 140, x0 + 305, y0 + 240], fill=(40, 44, 60))
    d.ellipse([x0 + 196, y0 + 58, x0 + 284, y0 + 112], fill=(40, 30, 26))
    d.rectangle([x0, y1 - 60, x1, y1 - 30], fill=(200, 40, 40)); d.text((x0 + 12, y1 - 58), '午間新聞', font=F(24), fill=(255, 255, 255))
    d.rectangle([x0, y1 - 30, x1, y1], fill=(240, 240, 240)); d.text((x0 + 12, y1 - 29), '今天午後山區有短暫陣雨　出門記得帶傘', font=F(22), fill=(30, 30, 30))
    # 收銀機螢幕：綠字
    x0, y0, x1, y1 = SCR['pos']; d.rectangle([x0, y0, x1, y1], fill=(16, 40, 30)); d.text((x0 + 14, y0 + 20), '小計', font=F(30), fill=(120, 230, 160)); d.text((x0 + 120, y0 + 76), '0', font=F(52), fill=(120, 230, 160))
    # 點餐螢幕（茶飲店）：白底品項格
    x0, y0, x1, y1 = SCR['order']; d.rectangle([x0, y0, x1, y1], fill=(236, 240, 238))
    for i in range(3):
        for j in range(2): d.rectangle([x0 + 10 + i * 82, y0 + 14 + j * 86, x0 + 84 + i * 82, y0 + 90 + j * 86], fill=(47, 125, 91) if (i + j) % 2 else (200, 220, 210))
    im.save(os.path.join(GEN, 'l118_screens.png'))


def all_tex():
    os.makedirs(GEN, exist_ok=True)
    for sid, S in SHOPS.items(): shop_atlas(sid, S)
    screens()


if __name__ == '__main__':
    all_tex(); print('ok', GEN)
