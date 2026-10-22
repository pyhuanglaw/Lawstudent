"""男生宿舍交誼廳的貼圖（ART-DORM-LOUNGE-1021，LAWWW2 2026-10-22）：全部本作程式畫（PIL），文字虛構，不寫真實宿舍名稱。
- dorm_lounge_atlas.png（1024×1024）：公告欄的四張公告、牆上的時鐘、飲水機旁的「請自備杯子」、三個回收桶的標籤、沙發區的地毯
  （同一張圖、同一個材質：交誼廳的小東西只多一個 draw call）。各區的像素範圍寫在 REGIONS，Blender 腳本照這個貼 UV。
- dorm_vend_panel.png（1024×1024）：兩台自動販賣機亮著的展示窗（左半：藍白那台；右半：紅色那台）。
  遊戲的文字：「茶、咖啡、運動飲料，一罐 25 元。最上面一排的奶茶已經賣完了」——兩台的最上面一排都是奶茶，亮紅色「售完」。
字形：系統字型文泉驛正黑（WenQuanYi Zen Hei，GPL-2.0＋字型嵌入例外）畫成點陣圖，不附字型檔。
用法：python3 tools/blender/env_second/dorm_lounge_tex.py（輸出到 textures/gen/）"""
import json, math, os, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__)); GEN = os.path.join(HERE, 'textures', 'gen')
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
rnd = random.Random(1021)
def f(sz): return ImageFont.truetype(FONT, sz)

# 圖集各區（x0, y0, x1, y1；像素，左上原點）
REGIONS = {
    'rules':   (0, 0, 340, 480),      # 交誼廳使用規則
    'club':    (342, 0, 682, 480),    # 宿委會招募
    'laundry': (684, 0, 1024, 480),   # 洗衣間時間
    'lost':    (0, 482, 340, 800),    # 失物招領
    'clock':   (342, 482, 598, 738),  # 時鐘
    'cups':    (600, 482, 1024, 590), # 請自備杯子
    'bin0':    (600, 594, 1024, 662), # 一般垃圾
    'bin1':    (600, 666, 1024, 734), # 紙類
    'bin2':    (600, 738, 1024, 806), # 寶特瓶・鐵鋁罐
    'rug':     (0, 810, 1024, 1024),  # 地毯（深灰藍、淺色滾邊）
}


def paper(d, box, col=(246, 243, 234), tape=True):
    x0, y0, x1, y1 = box
    d.rectangle(box, fill=col)
    for _ in range(int((x1 - x0) * (y1 - y0) / 220)):           # 紙的纖維、一點髒
        x, y = rnd.randint(x0, x1 - 1), rnd.randint(y0, y1 - 1); c = rnd.randint(-10, 4)
        d.point((x, y), fill=tuple(max(0, min(255, v + c)) for v in col))
    if tape:                                                    # 四個角的透明膠帶（淡黃）
        for (cx, cy) in ((x0 + 18, y0 + 10), (x1 - 18, y0 + 10)):
            d.rectangle((cx - 22, cy - 7, cx + 22, cy + 7), fill=(238, 228, 190))


def text_c(d, cx, y, s, sz, col=(30, 30, 30)):
    w = d.textlength(s, font=f(sz)); d.text((cx - w / 2, y), s, font=f(sz), fill=col)


def atlas():
    im = Image.new('RGB', (1024, 1024), (200, 196, 186)); d = ImageDraw.Draw(im)
    # 1. 交誼廳使用規則（白紙、藍色標題、條列）
    x0, y0, x1, y1 = REGIONS['rules']; paper(d, (x0 + 4, y0 + 4, x1 - 4, y1 - 4))
    d.rectangle((x0 + 18, y0 + 30, x1 - 18, y0 + 92), fill=(46, 92, 150)); text_c(d, (x0 + x1) / 2, y0 + 40, '交誼廳使用規則', 38, (255, 255, 255))
    for k, s in enumerate(('一、開放時間 07:00～23:00', '二、電視用完請關，小聲一點', '三、吃完的東西請帶走', '四、垃圾請分類（三個桶）', '五、桌椅用完請歸位', '六、23:00 以後請回寢室')):
        d.text((x0 + 24, y0 + 116 + k * 44), s, font=f(21), fill=(36, 36, 40))
    text_c(d, (x0 + x1) / 2, y1 - 52, '宿舍輔導室', 22, (90, 90, 96))
    # 2. 宿委會招募（黃色紙、手寫感的大字、一個茶杯的圖）
    x0, y0, x1, y1 = REGIONS['club']; paper(d, (x0 + 4, y0 + 4, x1 - 4, y1 - 4), (250, 222, 120))
    text_c(d, (x0 + x1) / 2, y0 + 30, '宿委會', 50, (170, 50, 40)); text_c(d, (x0 + x1) / 2, y0 + 112, '招募幹部！', 42, (60, 40, 30))
    cx, cy = (x0 + x1) / 2, y0 + 262                            # 茶杯（簡單線條）＋熱氣
    d.rounded_rectangle((cx - 70, cy - 40, cx + 50, cy + 50), 18, outline=(80, 50, 30), width=6)
    d.arc((cx + 30, cy - 20, cx + 90, cy + 34), -90, 90, fill=(80, 50, 30), width=6)
    for k in range(3): d.arc((cx - 52 + k * 30, cy - 82, cx - 26 + k * 30, cy - 50), 200, 340, fill=(120, 90, 60), width=4)
    for k, s in enumerate(('期初茶會：10/1 晚上 7 點', '地點：交誼廳', '有點心，歡迎大一新生')):
        text_c(d, (x0 + x1) / 2, y0 + 340 + k * 38, s, 22, (60, 40, 30))
    # 3. 洗衣間（淺藍紙）
    x0, y0, x1, y1 = REGIONS['laundry']; paper(d, (x0 + 4, y0 + 4, x1 - 4, y1 - 4), (214, 232, 242))
    text_c(d, (x0 + x1) / 2, y0 + 34, '洗衣間', 52, (30, 70, 120))
    for k, s in enumerate(('開放時間', '07:00～23:00', '', '洗好請盡快拿走', '不要把衣服放過夜', '', '投幣式', '洗衣 20 元・烘衣 10 元')):
        text_c(d, (x0 + x1) / 2, y0 + 120 + k * 40, s, 26 if k < 2 else 23, (30, 40, 60))
    # 4. 失物招領（白紙、紅框）
    x0, y0, x1, y1 = REGIONS['lost']; paper(d, (x0 + 4, y0 + 4, x1 - 4, y1 - 4))
    d.rectangle((x0 + 14, y0 + 24, x1 - 14, y1 - 14), outline=(190, 50, 40), width=5)
    text_c(d, (x0 + x1) / 2, y0 + 40, '失物招領', 46, (190, 50, 40))
    for k, s in enumerate(('藍色折疊傘一把', '學生證套（沒有證件）', '鑰匙一串（三支）', '請到舍監室窗口認領')):
        text_c(d, (x0 + x1) / 2, y0 + 120 + k * 42, s, 23, (40, 40, 40))
    # 5. 時鐘（白色錶面、黑色刻度與數字；指針另外做幾何）
    x0, y0, x1, y1 = REGIONS['clock']; cx, cy, r = (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2 - 2
    d.rectangle((x0, y0, x1, y1), fill=(235, 235, 232)); d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(250, 250, 248))
    for k in range(60):
        a = k / 60 * 2 * math.pi; l = 16 if k % 5 == 0 else 7; w = 4 if k % 5 == 0 else 2
        d.line((cx + math.sin(a) * (r - 6), cy - math.cos(a) * (r - 6), cx + math.sin(a) * (r - 6 - l), cy - math.cos(a) * (r - 6 - l)), fill=(30, 30, 30), width=w)
    for k in range(1, 13):
        a = k / 12 * 2 * math.pi; s = str(k); sz = 26
        w = d.textlength(s, font=f(sz)); d.text((cx + math.sin(a) * (r - 42) - w / 2, cy - math.cos(a) * (r - 42) - sz * 0.62), s, font=f(sz), fill=(30, 30, 30))
    # 6. 請自備杯子（白紙、黑字、紅色底線）
    x0, y0, x1, y1 = REGIONS['cups']; paper(d, (x0 + 4, y0 + 4, x1 - 4, y1 - 4), tape=False)
    text_c(d, (x0 + x1) / 2, y0 + 22, '請自備杯子', 50, (30, 30, 30)); d.line((x0 + 90, y1 - 18, x1 - 90, y1 - 18), fill=(200, 40, 40), width=5)
    # 7. 回收桶標籤（灰／綠／藍底白字）
    for k, (s, col) in enumerate((('一般垃圾', (96, 98, 102)), ('紙類', (46, 128, 70)), ('寶特瓶・鐵鋁罐', (40, 96, 168)))):
        x0, y0, x1, y1 = REGIONS[f'bin{k}']; d.rectangle((x0, y0, x1, y1), fill=col); text_c(d, (x0 + x1) / 2, y0 + 12, s, 42, (255, 255, 255))
    # 8. 地毯：深灰藍＋淺灰滾邊＋細的織紋
    x0, y0, x1, y1 = REGIONS['rug']; d.rectangle((x0, y0, x1, y1), fill=(68, 76, 88))
    for y in range(y0, y1, 2):
        for x in range(x0, x1, 3):
            if rnd.random() < 0.35: d.point((x, y), fill=(58 + rnd.randint(0, 10), 66 + rnd.randint(0, 10), 78 + rnd.randint(0, 10)))
    d.rectangle((x0 + 10, y0 + 10, x1 - 10, y1 - 10), outline=(176, 172, 160), width=10)
    d.rectangle((x0 + 30, y0 + 30, x1 - 30, y1 - 30), outline=(120, 124, 128), width=3)
    im.save(os.path.join(GEN, 'dorm_lounge_atlas.png'))
    json.dump({k: [v[0] / 1024, 1 - v[3] / 1024, v[2] / 1024, 1 - v[1] / 1024] for k, v in REGIONS.items()},
              open(os.path.join(GEN, 'dorm_lounge_atlas.json'), 'w'), indent=0)   # UV（u0, v0, u1, v1；左下原點）


def bottle(d, x, y, w, h, col, cap, label, can=False):
    """一瓶（寶特瓶：瓶身＋肩＋瓶蓋）或一罐（鐵罐）。(x, y)＝左上"""
    if can:
        d.rounded_rectangle((x, y + h * 0.25, x + w, y + h), 4, fill=col)
        d.rectangle((x + 2, y + h * 0.25, x + w - 2, y + h * 0.31), fill=(205, 205, 205))
        d.rectangle((x + 3, y + h * 0.55, x + w - 3, y + h * 0.75), fill=label)
    else:
        d.rounded_rectangle((x, y + h * 0.3, x + w, y + h), 5, fill=col)
        d.polygon([(x, y + h * 0.32), (x + w * 0.3, y + h * 0.12), (x + w * 0.7, y + h * 0.12), (x + w, y + h * 0.32)], fill=col)
        d.rectangle((x + w * 0.32, y, x + w * 0.68, y + h * 0.13), fill=cap)
        d.rectangle((x + 2, y + h * 0.5, x + w - 2, y + h * 0.72), fill=label)
    d.line((x + w * 0.22, y + h * 0.35, x + w * 0.22, y + h * 0.92), fill=(255, 255, 255), width=2)   # 反光


def vend_panel():
    W, H = 1024, 1024; im = Image.new('RGB', (W, H)); d = ImageDraw.Draw(im)
    themes = ((0, (226, 236, 244), (40, 96, 168)), (512, (246, 230, 228), (176, 42, 38)))
    # 每台 6 欄×5 排；最上面一排是奶茶（售完）
    rows = [('milktea', (214, 186, 150), (240, 240, 236), (120, 72, 44), False),
            ('greentea', (150, 196, 120), (40, 110, 60), (230, 240, 220), False),
            ('blacktea', (176, 92, 54), (180, 40, 30), (240, 222, 200), False),
            ('coffee', (60, 44, 38), (60, 44, 38), (214, 178, 120), True),
            ('sports', (120, 180, 230), (30, 80, 170), (240, 248, 255), False)]
    for (ox, bg, acc) in themes:
        d.rectangle((ox, 0, ox + 511, H - 1), fill=bg)
        d.rectangle((ox, 0, ox + 511, 54), fill=acc); text_c(d, ox + 256, 6, '冷 飲' if ox == 0 else '冷熱飲料', 36, (255, 255, 255))
        rh = (H - 70) / 5
        for j, (nm, col, cap, lab, can) in enumerate(rows if ox == 0 else rows[:3] + [rows[4], rows[3]]):
            y = 64 + j * rh
            d.rectangle((ox + 10, y + rh - 52, ox + 501, y + rh - 46), fill=(170, 172, 176))                  # 層板
            for i in range(6):
                x = ox + 22 + i * 81; bw, bh = (46, rh - 108) if not can else (48, rh - 130)
                bottle(d, x + (64 - bw) / 2, y + rh - 54 - bh, bw, bh, col, cap, lab, can)
                d.rectangle((x + 4, y + rh - 42, x + 60, y + rh - 18), fill=(250, 250, 250))                   # 價錢牌
                text_c(d, x + 32, y + rh - 42, '25', 20, (30, 30, 30))
                lamp = (230, 40, 30) if j == 0 else (70, 200, 90)                                             # 按鈕燈：售完紅、可以買綠
                d.rounded_rectangle((x + 10, y + rh - 14, x + 54, y + rh - 2), 4, fill=lamp)
                if j == 0: text_c(d, x + 32, y + rh - 16, '售完', 13, (255, 255, 255))
    im = im.filter(ImageFilter.GaussianBlur(0.6))
    im.save(os.path.join(GEN, 'dorm_vend_panel.png'))


if __name__ == '__main__':
    atlas(); vend_panel()
    print('ok', os.path.join(GEN, 'dorm_lounge_atlas.png'), os.path.join(GEN, 'dorm_vend_panel.png'))
