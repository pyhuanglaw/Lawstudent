"""便利商店的商品（LAWWW2，2026-10-14；使用者：「便利商店店面裡面的東西看起來就是一堆模板複製貼上超假的」）。
原本的商品是隨機顏色、隨機大小的方塊和圓柱（頂點色），看不出是什麼。這一版：
- 每一種商品有自己的包裝（虛構的品牌與品名，不仿真實品牌；字型文泉驛正黑）：畫在一張 2048×2048 的貼圖集（每格 128×128），全部商品共用一個材質（一次 draw call）。
- 每一種商品有自己的形狀：杯麵（上寬下窄、蓋子）、袋麵五包裝、洋芋片（鼓起來的袋子）、餅乾盒、糖果、麵包袋、寶特瓶（瓶身、瓶肩、瓶蓋、標籤）、鋁罐、紙盒、面紙、洗髮精、文具卡。
- 陳列照便利商店的樣子：同一種商品並排 2～4 個（飲料櫃 3～5 個）、同一區放同一類、每一組下面一張價格標籤；偶爾缺一個（賣掉了）。
用法：cvs_interior.py 匯入這個模組：G = Goods(mesh_name)；G.shelf(…)／G.cooler(…)；G.finish(root)。座標＝遊戲座標（x 東、y 上、z 南）。"""
import math, os, random
import bpy, bmesh
from mathutils import Vector
from PIL import Image, ImageDraw, ImageFont

FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
CELL, N = 128, 16                       # 2048×2048：16×16 格
g2b = lambda x, y, z: Vector((x, -z, y))

# ---------------- 商品目錄（虛構）：cat＝分類、shape＝形狀、w／h／d＝寬（沿貨架）／高／深（公尺）、bg／fg／accent＝包裝顏色、brand／name＝包裝上的字、price＝價格標籤
P = []
def prod(cat, shape, w, h, d, bg, fg, accent, brand, name, price, deco='band'):
    P.append(dict(cat=cat, shape=shape, w=w, h=h, d=d, bg=bg, fg=fg, accent=accent, brand=brand, name=name, price=price, deco=deco, cell=len(P)))

for b, n, bg, fg, ac, pr in (('一碗香', '紅燒牛肉', '#b8231c', '#fff4d6', '#f2c230', 39), ('好麵道', '豚骨拉麵', '#f4efe4', '#b8231c', '#1d1d1f', 45), ('辣到你', '麻辣鍋', '#7a1410', '#ffd34d', '#e8481c', 42),
                             ('阿嬤家', '古早炸醬', '#5a3a1e', '#f6e2b3', '#d99a2b', 35), ('海之味', '海鮮湯麵', '#1f5fa8', '#ffffff', '#7cc4e8', 39), ('蔥香', '蔥油拌麵', '#3c7d3a', '#ffffff', '#c8e06a', 35)):
    prod('cupnoodle', 'cup', 0.11, 0.105, 0.11, bg, fg, ac, b, n, pr)
for b, n, bg, fg, ac, pr in (('古早味', '肉燥麵', '#d8432f', '#ffffff', '#f2c230', 69), ('素食坊', '香菇麵', '#6b8f3a', '#ffffff', '#f4efe4', 65), ('沙茶王', '沙茶拌麵', '#e2771f', '#3b1e0e', '#fff1c9', 79)):
    prod('bagnoodle', 'box', 0.22, 0.1, 0.13, bg, fg, ac, b, n, pr, deco='window')
for b, n, bg, fg, ac, pr in (('脆薯', '原味', '#f2c230', '#b8231c', '#ffffff', 35), ('脆薯', '海苔', '#3c8d3a', '#ffffff', '#1d1d1f', 35), ('脆薯', '烤肉', '#b8231c', '#ffe9a8', '#5a2a10', 35),
                             ('玉米脆', '起司', '#f08a24', '#ffffff', '#7a2a10', 30), ('鮮蝦條', '原味', '#e85d6a', '#ffffff', '#ffd34d', 25), ('辣條', '香辣', '#c21f1f', '#ffe34d', '#1d1d1f', 20)):
    prod('chips', 'bag', 0.16, 0.22, 0.07, bg, fg, ac, b, n, pr, deco='circle')
for b, n, bg, fg, ac, pr in (('奶油夾心', '餅乾', '#f6ecd4', '#1f4fa0', '#e8b84a', 45), ('可可棒', '巧克力', '#5a3220', '#f6e2b3', '#d99a2b', 39), ('蘇打餅', '鹹味', '#ffffff', '#2f7a3a', '#c8e06a', 32),
                             ('蛋捲', '原味', '#e8b84a', '#7a2a10', '#fff4d6', 55), ('鳳梨酥', '土鳳梨', '#f2d24d', '#9a2a1a', '#3c7d3a', 60), ('小熊餅', '草莓', '#f4b6c8', '#7a2a4a', '#ffffff', 29)):
    prod('cookie', 'box', 0.12, 0.17, 0.05, bg, fg, ac, b, n, pr, deco='stripe')
for b, n, bg, fg, ac, pr in (('水果軟糖', '綜合', '#f48fb1', '#ffffff', '#7a1f4a', 25), ('薄荷糖', '涼', '#2fb5a8', '#ffffff', '#0e4f4a', 30), ('喉糖', '枇杷', '#3c7d3a', '#fff4d6', '#c8a03a', 35), ('牛奶糖', '香濃', '#f6ecd4', '#5a3220', '#d99a2b', 25)):
    prod('candy', 'box', 0.07, 0.11, 0.03, bg, fg, ac, b, n, pr, deco='circle')
for b, n, bg, fg, ac, pr in (('麵包坊', '菠蘿', '#f6ecd4', '#9a5a1a', '#e8b84a', 30), ('麵包坊', '紅豆', '#f6ecd4', '#7a1f2a', '#c8505a', 30), ('早安', '厚片吐司', '#ffffff', '#1f4fa0', '#f2c230', 45)):
    prod('bread', 'bag', 0.15, 0.09, 0.11, bg, fg, ac, b, n, pr, deco='window')
for b, n, bg, fg, ac, pr, liq in (('青山', '綠茶', '#2f7a3a', '#ffffff', '#c8e06a', 25, '#b8c860'), ('高山', '烏龍茶', '#7a4a1a', '#f6e2b3', '#d99a2b', 25, '#a86a20'), ('古早', '冬瓜茶', '#c8501f', '#fff4d6', '#f2c230', 20, '#8a4a18'),
                                  ('清泉', '純水', '#2f7ed8', '#ffffff', '#c9e2f2', 20, '#e8f2f8'), ('動能', '運動飲料', '#1f4fa0', '#ffffff', '#5bb6c9', 25, '#cfe8f4'), ('蜂蜜', '檸檬', '#f2c230', '#5a3a10', '#ffffff', 29, '#e8c84a'),
                                  ('午後', '奶茶', '#e8d5b0', '#5a3220', '#b8231c', 30, '#d8b890'), ('黑豆', '黑豆茶', '#1d1d1f', '#e8b84a', '#7a4a1a', 25, '#4a3020')):
    prod('drink', 'bottle', 0.07, 0.235, 0.07, bg, fg, ac, b, n, pr); P[-1]['liquid'] = liq
for b, n, bg, fg, ac, pr in (('晨光', '黑咖啡', '#1d1d1f', '#e8b84a', '#7a4a1a', 25), ('晨光', '拿鐵', '#e8d5b0', '#5a3220', '#7a4a1a', 25), ('氣泡', '檸檬汽水', '#3fa34d', '#ffffff', '#f2e04a', 20),
                             ('氣泡', '葡萄汽水', '#6a2f8a', '#ffffff', '#c89ae8', 20), ('沙士', '經典', '#5a1a1a', '#f6e2b3', '#c8501f', 20)):
    prod('can', 'can', 0.066, 0.123, 0.066, bg, fg, ac, b, n, pr, deco='band')
for b, n, bg, fg, ac, pr in (('牧場', '鮮乳', '#ffffff', '#1f4fa0', '#7cc4e8', 35), ('田園', '豆漿', '#f6ecd4', '#5a3a10', '#c8a03a', 25), ('牧場', '巧克力乳', '#5a3220', '#ffffff', '#e8b84a', 30), ('古早味', '紅茶', '#b8231c', '#fff4d6', '#f2c230', 20)):
    prod('carton', 'box', 0.062, 0.13, 0.045, bg, fg, ac, b, n, pr, deco='stripe')
for b, n, bg, fg, ac, pr in (('柔膚', '抽取面紙', '#ffffff', '#2f7ed8', '#f4b6c8', 39), ('清淨', '濕紙巾', '#2fb5a8', '#ffffff', '#ffffff', 35), ('親親', '口罩', '#ffffff', '#1f4fa0', '#7cc4e8', 59)):
    prod('daily', 'box', 0.2, 0.11, 0.12, bg, fg, ac, b, n, pr, deco='stripe')
for b, n, bg, fg, ac, pr in (('沐光', '洗髮精', '#f4b6c8', '#7a1f4a', '#ffffff', 99), ('沐光', '沐浴乳', '#c9e2f2', '#1f4fa0', '#ffffff', 99), ('潔白', '牙膏', '#ffffff', '#d8432f', '#2f7ed8', 59)):
    prod('daily2', 'box', 0.08, 0.2, 0.05, bg, fg, ac, b, n, pr, deco='circle')
for b, n, bg, fg, ac, pr in (('文青', '原子筆', '#ffffff', '#1d1d1f', '#2f7ed8', 15), ('文青', '筆記本', '#3c6a8a', '#ffffff', '#f2c230', 30), ('貼貼', '便利貼', '#f2e04a', '#1d1d1f', '#f08a24', 25), ('長效', '電池', '#1d1d1f', '#f2c230', '#d8432f', 49)):
    prod('stationery', 'box', 0.09, 0.19, 0.02, bg, fg, ac, b, n, pr, deco='window')
for b, n, bg, fg, ac, pr in (('', '', '#f4f1ea', '#6a6a6a', '#b8b8b8', 0), ('', '', '#e8e8e8', '#2a2a2a', '#d8432f', 0), ('', '', '#d9d4c8', '#3a3a3a', '#2f7ed8', 0), ('', '', '#f4f1ea', '#2a2a2a', '#3c7d3a', 0)):
    prod('smoke', 'box', 0.056, 0.088, 0.022, bg, fg, ac, b, n, pr, deco='band')     # 香菸櫃：只有色帶、沒有字（不畫品牌）
# 2026-10-23 LAWWW2-B（公館、118 巷店面玻璃後面的淺店內；使用者：「公館店面外觀也一樣醜」）：藥局、唱片行、文具畫材行的商品，加在最後面（便利商店的格子位置不變）
for b, n, bg, fg, ac, pr in (('安康', '感冒熱飲', '#ffffff', '#1f6f78', '#e8a33a', 120), ('舒暢', '胃腸錠', '#2f7a3a', '#ffffff', '#c8e06a', 150), ('百泰', '止痛錠', '#d8432f', '#ffffff', '#ffffff', 99),
                             ('晴朗', '鼻炎膠囊', '#2f7ed8', '#ffffff', '#c9e2f2', 180), ('仁心', '綜合維他命', '#f2c230', '#5a3a10', '#d8432f', 350), ('仁心', '葉黃素', '#f08a24', '#ffffff', '#3c7d3a', 450),
                             ('清明', '眼藥水', '#c9e2f2', '#1f4fa0', '#2f7ed8', 90), ('安康', '喉片', '#3c7d3a', '#fff4d6', '#c8a03a', 80)):
    prod('med', 'box', 0.075 if pr < 100 else 0.1, 0.12 if pr < 300 else 0.15, 0.06, bg, fg, ac, b, n, pr, deco='stripe')
for b, n, bg, fg, ac, pr in (('百泰', '痠痛貼布', '#ffffff', '#d8432f', '#f2c230', 199), ('潤膚', '乳液', '#f4b6c8', '#7a1f4a', '#ffffff', 250), ('安康', '酒精', '#ffffff', '#2f7ed8', '#7cc4e8', 65)):
    prod('med2', 'box', 0.15 if n == '痠痛貼布' else 0.07, 0.11 if n == '痠痛貼布' else 0.2, 0.05, bg, fg, ac, b, n, pr, deco='band')
for b, n, bg, fg, ac in (('午後雷陣雨', '首張專輯', '#2f4a6a', '#f6e2b3', '#e8a33a'), ('溫州街', '黑膠', '#e8d5b0', '#5a3220', '#b8231c'), ('夜行', 'NIGHT BUS', '#1d1d1f', '#f2c230', '#2f7ed8'),
                         ('藍色時刻', 'LIVE', '#5bb6c9', '#1d1d1f', '#ffffff'), ('老鄧', '經典金曲', '#b8231c', '#fff4d6', '#f2c230'), ('海邊的人', '二手', '#f4efe4', '#1f6f78', '#e85d6a'),
                         ('爵士之夜', 'JAZZ', '#3a2418', '#e8b84a', '#c8501f'), ('白日夢', 'EP', '#c89ae8', '#ffffff', '#6a2f8a')):
    prod('record', 'box', 0.31, 0.31, 0.006, bg, fg, ac, b, n, 0, deco='record')
for b, n, bg, fg, ac, pr in (('彩繪', '色鉛筆 24 色', '#2f7ed8', '#ffffff', '#f2c230', 280), ('彩繪', '水彩 12 色', '#ffffff', '#d8432f', '#2f7ed8', 220), ('文青', '素描本', '#1d1d1f', '#ffffff', '#c8a03a', 120),
                             ('文青', '筆記本 A5', '#e8d5b0', '#5a3220', '#7a4a1a', 45), ('貼貼', '紙膠帶', '#f4b6c8', '#7a1f4a', '#5bb6c9', 60), ('彩繪', '畫筆組', '#3c7d3a', '#ffffff', '#e8b84a', 150)):
    prod('art', 'box', 0.19 if '色' in n else (0.21 if n in ('素描本', '筆記本 A5') else 0.1), 0.12 if '色' in n else (0.28 if n == '素描本' else (0.21 if n == '筆記本 A5' else 0.16)), 0.03, bg, fg, ac, b, n, pr, deco='band')
PROMO = len(P)                          # 端架的促銷牌、價格標籤用後面幾格
CATS = {}
for p in P: CATS.setdefault(p['cat'], []).append(p)


def _font(sz): return ImageFont.truetype(FONT, max(8, int(sz)))


def face_aspect(p):
    """正面（玩家看到的那一張包裝）的實際長寬比：盒子、袋子＝寬／高；圓柱＝半圈的弧長／包裝高度（每半圈貼一張）"""
    s, w, h = p['shape'], p['w'], p['h']
    if s == 'cup': return math.pi * (w / 2 * 0.9) / h
    if s == 'can': return math.pi * (w / 2) / (h - 0.018)
    if s == 'bottle': return math.pi * (w / 2) / (h * BOTTLE_LABEL[1] / 0.235 - h * BOTTLE_LABEL[0] / 0.235)
    return w / h


BOTTLE_LABEL = (0.05, 0.15)             # 寶特瓶標籤的上下（瓶高 0.235 時的位置；原本 0.09～0.16 太窄）
FRONT = {}                              # 格子 → 正面在格子裡的像素範圍（照長寬比，不再拉長或壓扁字）


def _fit(asp, W=CELL, H=112, pad=2):
    """在 W×H 裡放一個長寬比 asp 的最大矩形（置中）"""
    W2, H2 = W - 2 * pad, H - 2 * pad
    if W2 / H2 > asp: w, h = H2 * asp, H2
    else: w, h = W2, W2 / asp
    return (W - w) / 2, (H - h) / 2, (W + w) / 2, (H + h) / 2


def _art(d, cat, p, X0, Y0, X1, Y1):
    """依分類的小插圖（畫在 (X0,Y0)–(X1,Y1)），讓包裝不再只是一個色塊"""
    w, h = X1 - X0, Y1 - Y0; cx, cy = (X0 + X1) / 2, (Y0 + Y1) / 2; ac, fg = p['accent'], p['fg']
    r = min(w, h) / 2
    if cat in ('cupnoodle', 'bagnoodle'):                      # 一碗麵：碗、麵條、蔥花、熱氣
        d.chord([cx - r, cy - r * 0.9, cx + r, cy + r * 0.9], 0, 180, fill=ac)
        for k in range(4): d.arc([cx - r * 0.8 + k * r * 0.12, cy - r * 0.5, cx + r * 0.8 - k * r * 0.12, cy + r * 0.3], 200, 340, fill='#f4dc9a', width=max(1, int(r * 0.09)))
        for k in range(3): d.ellipse([cx - r * 0.5 + k * r * 0.45, cy - r * 0.15, cx - r * 0.38 + k * r * 0.45, cy - r * 0.03], fill='#4f9a3a')
        for k in (-1, 0, 1): d.arc([cx + k * r * 0.35 - r * 0.12, cy - r * 1.1, cx + k * r * 0.35 + r * 0.12, cy - r * 0.45], 100, 260, fill=fg, width=max(1, int(r * 0.06)))
    elif cat == 'chips':                                       # 一堆洋芋片
        for k, (ox, oy) in enumerate(((-0.45, 0.25), (0.4, 0.3), (0.0, 0.1), (-0.25, -0.2), (0.3, -0.15), (0.0, -0.45))):
            x, y = cx + ox * r, cy + oy * r
            d.ellipse([x - r * 0.42, y - r * 0.26, x + r * 0.42, y + r * 0.26], fill='#f2cf5a', outline='#c8962a', width=max(1, int(r * 0.05)))
        d.ellipse([cx - r * 0.95, cy - r * 0.95, cx - r * 0.45, cy - r * 0.45], fill=ac)
    elif cat == 'cookie':
        for k, (ox, oy) in enumerate(((-0.4, 0.15), (0.35, 0.2), (0.0, -0.25))):
            x, y = cx + ox * r, cy + oy * r
            d.ellipse([x - r * 0.42, y - r * 0.42, x + r * 0.42, y + r * 0.42], fill='#d9a35a', outline='#9a6a2a', width=max(1, int(r * 0.05)))
            for j in range(3): d.ellipse([x - r * 0.2 + j * r * 0.16, y - r * 0.08, x - r * 0.12 + j * r * 0.16, y], fill='#5a3220')
    elif cat == 'candy':                                       # 包裝紙的糖果
        for k, ox in enumerate((-0.45, 0.45)):
            x, y = cx + ox * r, cy + (0.2 if k else -0.2) * r
            d.polygon([(x - r * 0.55, y - r * 0.2), (x - r * 0.3, y), (x - r * 0.55, y + r * 0.2)], fill=ac)
            d.polygon([(x + r * 0.55, y - r * 0.2), (x + r * 0.3, y), (x + r * 0.55, y + r * 0.2)], fill=ac)
            d.ellipse([x - r * 0.32, y - r * 0.25, x + r * 0.32, y + r * 0.25], fill=fg)
    elif cat == 'bread':                                       # 麵包
        d.ellipse([cx - r * 0.95, cy - r * 0.55, cx + r * 0.95, cy + r * 0.6], fill='#d9a35a')
        d.ellipse([cx - r * 0.85, cy - r * 0.62, cx + r * 0.85, cy + r * 0.2], fill='#e8b86a')
        for k in range(3): d.line([cx - r * 0.5 + k * r * 0.4, cy - r * 0.45, cx - r * 0.3 + k * r * 0.4, cy - r * 0.05], fill='#b07a3a', width=max(1, int(r * 0.07)))
    elif cat == 'drink':                                       # 茶葉、水滴、檸檬
        liq = p.get('liquid', ac)
        if p['name'] in ('純水', '運動飲料'):
            d.polygon([(cx, cy - r), (cx - r * 0.6, cy + r * 0.2), (cx + r * 0.6, cy + r * 0.2)], fill=ac); d.ellipse([cx - r * 0.6, cy - r * 0.3, cx + r * 0.6, cy + r * 0.9], fill=ac)
        elif p['name'] == '檸檬':
            d.ellipse([cx - r * 0.9, cy - r * 0.6, cx + r * 0.9, cy + r * 0.6], fill='#f6e04a', outline='#c8a020', width=max(1, int(r * 0.08)))
        else:
            for k in (-1, 1): d.ellipse([cx + k * r * 0.35 - r * 0.32, cy - r * 0.8, cx + k * r * 0.35 + r * 0.32, cy + r * 0.5], fill=ac)
            d.line([cx, cy - r * 0.2, cx, cy + r], fill=fg, width=max(1, int(r * 0.08)))
    elif cat == 'can':                                         # 氣泡或咖啡豆
        if '咖啡' in p['name'] or p['name'] == '拿鐵':
            for k in (-1, 1): d.ellipse([cx + k * r * 0.4 - r * 0.35, cy - r * 0.5, cx + k * r * 0.4 + r * 0.35, cy + r * 0.5], fill='#5a3220'); d.line([cx + k * r * 0.4, cy - r * 0.4, cx + k * r * 0.4, cy + r * 0.4], fill='#2a1608', width=max(1, int(r * 0.06)))
        else:
            for k, (ox, oy, rr) in enumerate(((-0.4, 0.3, 0.3), (0.3, -0.1, 0.4), (-0.1, -0.6, 0.2), (0.5, 0.55, 0.18))):
                d.ellipse([cx + ox * r - rr * r, cy + oy * r - rr * r, cx + ox * r + rr * r, cy + oy * r + rr * r], outline=ac, width=max(1, int(r * 0.08)))
    elif cat == 'carton':
        d.ellipse([cx - r * 0.7, cy - r * 0.7, cx + r * 0.7, cy + r * 0.7], fill=ac)
    elif cat in ('daily', 'daily2'):
        if p['name'] == '口罩':
            d.rounded_rectangle([cx - r * 0.8, cy - r * 0.45, cx + r * 0.8, cy + r * 0.45], radius=r * 0.2, fill='#ffffff', outline=ac, width=max(1, int(r * 0.08)))
            for k in (-1, 1): d.line([cx - r * 0.6, cy + k * r * 0.12, cx + r * 0.6, cy + k * r * 0.12], fill=ac, width=1)
        else:
            d.ellipse([cx - r * 0.6, cy - r * 0.6, cx + r * 0.6, cy + r * 0.6], fill=ac); d.ellipse([cx - r * 0.3, cy - r * 0.35, cx + r * 0.05, cy - r * 0.05], fill='#ffffff')
    elif cat == 'stationery':                                  # 吊卡：上面的掛孔＋透明窗裡的商品
        d.rounded_rectangle([cx - w * 0.38, Y0, cx + w * 0.38, Y1], radius=4, fill='#e8eef2')
        if p['name'] == '原子筆':
            for k in (-1, 0, 1): d.line([cx + k * w * 0.18, Y0 + h * 0.1, cx + k * w * 0.18, Y1 - h * 0.08], fill=(ac if k else '#d8432f'), width=max(2, int(w * 0.08)))
        else: d.rectangle([cx - w * 0.28, Y0 + h * 0.12, cx + w * 0.28, Y1 - h * 0.1], fill=ac)
    elif cat in ('med', 'med2'):                               # 藥盒：綠十字或膠囊
        if p['name'] in ('痠痛貼布', '乳液', '酒精'): d.rounded_rectangle([cx - r * 0.8, cy - r * 0.5, cx + r * 0.8, cy + r * 0.5], radius=r * 0.2, fill=ac)
        elif '維他命' in p['name'] or p['name'] == '葉黃素':
            for k in (-1, 1): d.ellipse([cx + k * r * 0.45 - r * 0.32, cy - r * 0.32, cx + k * r * 0.45 + r * 0.32, cy + r * 0.32], fill=ac)
        else:
            d.rounded_rectangle([cx - r * 0.75, cy - r * 0.3, cx + r * 0.75, cy + r * 0.3], radius=r * 0.3, fill='#ffffff', outline=ac, width=max(1, int(r * 0.08)))
            d.rounded_rectangle([cx, cy - r * 0.3, cx + r * 0.75, cy + r * 0.3], radius=r * 0.3, fill=ac)
    elif cat == 'art' and p['name'] in ('素描本', '筆記本 A5'):    # 本子：封面上幾條橫線
        for k in range(4): d.line([X0 + w * 0.15, Y0 + h * (0.2 + k * 0.18), X1 - w * 0.15, Y0 + h * (0.2 + k * 0.18)], fill=ac, width=max(1, int(h * 0.04)))
    elif cat == 'art':                                         # 色鉛筆、水彩：一排顏色
        cols = ['#d8432f', '#f08a24', '#f2c230', '#3c8d3a', '#2f7ed8', '#6a2f8a']
        for k, c in enumerate(cols): d.rectangle([X0 + w * k / len(cols), cy - h * 0.25, X0 + w * (k + 1) / len(cols) - 1, cy + h * 0.25], fill=c)
    else:
        d.rectangle([X0, cy - h * 0.1, X1, cy + h * 0.1], fill=ac)


def draw_record(im, p):
    """黑膠唱片封套：正方形的封面（抽象的圖、樂團名、專輯名），沒有價格"""
    x0c, y0c = (p['cell'] % N) * CELL, (p['cell'] // N) * CELL; d = ImageDraw.Draw(im); rr = random.Random(p['cell'] * 7)
    d.rectangle([x0c, y0c, x0c + CELL - 1, y0c + CELL - 1], fill=p['bg'])
    fx0, fy0, fx1, fy1 = FRONT[p['cell']]; x0, y0, S = x0c + fx0, y0c + fy0, fx1 - fx0
    cx, cy = x0 + S / 2 + rr.uniform(-12, 12), y0 + S / 2 + rr.uniform(-8, 12); ac = p['accent']
    style = p['cell'] % 4
    if style == 0:
        for k in range(5, 0, -1): d.ellipse([cx - k * 9, cy - k * 9, cx + k * 9, cy + k * 9], outline=ac if k % 2 else p['fg'], width=3)
    elif style == 1:
        for k in range(6): d.rectangle([x0 + 6 + k * 16, y0 + 20 + (k % 3) * 16, x0 + 18 + k * 16, y0 + S - 8], fill=ac if k % 2 else p['fg'])
    elif style == 2:
        d.polygon([(x0 + 8, y0 + S - 8), (cx, y0 + 16), (x0 + S - 8, y0 + S - 8)], fill=ac); d.ellipse([cx - 12, y0 + 28, cx + 12, y0 + 52], fill=p['fg'])
    else:
        d.ellipse([cx - 32, cy - 32, cx + 32, cy + 32], fill=ac); d.rectangle([x0, y0 + S * 0.7, x0 + S, y0 + S * 0.7 + 8], fill=p['fg'])
    f = _font(15)
    while d.textlength(p['brand'], font=f) > S - 10 and f.size > 9: f = _font(f.size - 1)
    d.text((x0 + 5, y0 + 3), p['brand'], fill=p['fg'], font=f)
    d.text((x0 + S - 5, y0 + S - 3), p['name'], fill=p['fg'], font=_font(11), anchor='rd')
    side = tuple(max(0, int(c * 0.7)) for c in Image.new('RGB', (1, 1), p['bg']).getpixel((0, 0)))
    d.rectangle([x0c, y0c + 112, x0c + CELL, y0c + CELL - 1], fill=side)


def draw_cell(im, p):
    if p['deco'] == 'record': return draw_record(im, p)
    """一格包裝：上面 112 px 是正面（照實際長寬比畫在中間，FRONT 記住範圍）；最下面 16 px 是側面的顏色"""
    x0, y0 = (p['cell'] % N) * CELL, (p['cell'] // N) * CELL
    d = ImageDraw.Draw(im)
    d.rectangle([x0, y0, x0 + CELL - 1, y0 + CELL - 1], fill=p['bg'])
    fx0, fy0, fx1, fy1 = _fit(face_aspect(p)); FRONT[p['cell']] = (fx0, fy0, fx1, fy1)
    X0, Y0, X1, Y1 = x0 + fx0, y0 + fy0, x0 + fx1, y0 + fy1; W, H = X1 - X0, Y1 - Y0
    deco, ac = p['deco'], p['accent']
    if deco == 'band': d.rectangle([X0, Y0 + H * 0.86, X1, Y0 + H * 0.94], fill=ac)
    elif deco == 'stripe':
        for k in range(2): d.rectangle([X0, Y0 + H * (0.88 + k * 0.06), X1, Y0 + H * (0.88 + k * 0.06) + 2], fill=ac)
    wide = W / H > 1.5                                         # 橫的包裝（袋麵、面紙）：字在左、圖在右
    if p['cat'] == 'smoke':
        d.rectangle([X0, Y0 + H * 0.12, X1, Y0 + H * 0.3], fill=ac); d.rectangle([X0, Y0 + H * 0.78, X1, Y0 + H * 0.86], fill=ac)
    elif wide:
        _art(d, p['cat'], p, X0 + W * 0.55, Y0 + H * 0.12, X1 - W * 0.04, Y1 - H * 0.12)
    else:
        _art(d, p['cat'], p, X0 + W * 0.1, Y0 + H * 0.46, X1 - W * 0.1, Y0 + H * 0.84)
    tw = W * (0.52 if wide else 0.9); tx = X0 + (W * 0.28 if wide else W / 2)
    if p['brand']:
        f = _font(min(26, H * (0.3 if wide else 0.18)))
        while d.textlength(p['brand'], font=f) > tw and f.size > 9: f = _font(f.size - 1)
        d.text((tx, Y0 + H * (0.32 if wide else 0.15)), p['brand'], fill=p['fg'], font=f, anchor='mm', stroke_width=1, stroke_fill=p['fg'])
    if p['name']:
        f = _font(min(20, H * (0.22 if wide else 0.13)))
        while d.textlength(p['name'], font=f) > tw * 0.95 and f.size > 8: f = _font(f.size - 1)
        d.text((tx, Y0 + H * (0.66 if wide else 0.34)), p['name'], fill=p['fg'], font=f, anchor='mm')
    side = tuple(max(0, int(c * 0.82)) for c in Image.new('RGB', (1, 1), p['bg']).getpixel((0, 0)))
    d.rectangle([x0, y0 + 112, x0 + CELL, y0 + CELL - 1], fill=side)


def draw_tag(im, k, price):
    x0, y0 = (k % N) * CELL, (k // N) * CELL; d = ImageDraw.Draw(im)
    d.rectangle([x0, y0, x0 + CELL - 1, y0 + CELL - 1], fill='#ffffff'); d.rectangle([x0, y0, x0 + CELL, y0 + 20], fill='#f2c230')
    d.text((x0 + CELL / 2, y0 + 70), f'${price}', fill='#d8432f', font=_font(48), anchor='mm', stroke_width=1, stroke_fill='#d8432f')


def draw_promo(im, k, text, bg, fg):
    x0, y0 = (k % N) * CELL, (k // N) * CELL; d = ImageDraw.Draw(im)
    d.rectangle([x0, y0, x0 + CELL - 1, y0 + CELL - 1], fill=bg)
    lines = text.split('\n'); f = _font(30)
    for i, t in enumerate(lines): d.text((x0 + CELL / 2, y0 + CELL / 2 + (i - (len(lines) - 1) / 2) * 38), t, fill=fg, font=f, anchor='mm', stroke_width=1, stroke_fill=fg)


PRICES = sorted({p['price'] for p in P if p['price']})
TAG0 = PROMO; PROMO_CELLS = TAG0 + len(PRICES)
PROMOS = [('第二件\n6 折', '#d8432f', '#ffffff'), ('新品\n上市', '#f2c230', '#b8231c'), ('買一送一', '#1f6f78', '#ffffff')]
SOLID0 = PROMO_CELLS + len(PROMOS)      # 純色（瓶蓋、液體、鋁罐的上下）
SOLIDS = ['#ffffff', '#1d1d1f', '#c9ccd0', '#2f7a3a', '#2f7ed8', '#d8432f', '#f2c230'] + sorted({p.get('liquid', '#ffffff') for p in P})
for _p in P: FRONT[_p['cell']] = _fit(face_aspect(_p))

# 牆上的海報（原本是純色方塊）：貼圖集下面幾列，一張海報佔好幾格。(標題, 副標, 底色, 字色, 強調色, 插圖)
POSTER_ROW0 = -(-(SOLID0 + len(SOLIDS)) // N)
BACK_POSTERS = [('現煮咖啡', '大杯美式 $45', '#3a2418', '#f6e2b3', '#d99a2b', 'coffee'), ('集點換好禮', '滿 $77 送 1 點', '#1f6f78', '#ffffff', '#f2c230', 'stamp'),
                ('早餐組合', '三明治＋鮮乳 $59', '#f4efe4', '#b8231c', '#e8a33a', 'breakfast'), ('霜淇淋', '北海道牛奶 $35', '#c9e2f2', '#1f4fa0', '#f4b6c8', 'icecream')]
LEFT_POSTERS = [('關東煮', '任選 3 樣 $50', '#b8231c', '#fff4d6', '#f2c230', 'oden'), ('代收繳費', '包裹取件・寄件', '#ffffff', '#1f6f78', '#e8a33a', 'parcel'),
                ('冰涼特調', '第二杯 半價', '#2f7ed8', '#ffffff', '#f2e04a', 'iced')]
POSTER_RECT = {}                        # ('back', i)／('left', i) → 像素範圍 (x0, y0, x1, y1)
for _i in range(4): POSTER_RECT[('back', _i)] = (_i * 4 * CELL, POSTER_ROW0 * CELL, (_i + 1) * 4 * CELL, (POSTER_ROW0 + 3) * CELL)
for _i in range(3): POSTER_RECT[('left', _i)] = (_i * 3 * CELL, (POSTER_ROW0 + 3) * CELL, (_i + 1) * 3 * CELL, (POSTER_ROW0 + 6) * CELL)
assert POSTER_ROW0 + 6 <= N, POSTER_ROW0


def draw_poster(im, rect, title, sub, bg, fg, ac, art):
    x0, y0, x1, y1 = rect; w, h = x1 - x0, y1 - y0; d = ImageDraw.Draw(im)
    d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=bg); d.rectangle([x0, y1 - h * 0.1, x1, y1], fill=ac)
    d.rectangle([x0 + 6, y0 + 6, x1 - 7, y1 - 7], outline=ac, width=4)
    f = _font(h * 0.17)
    while d.textlength(title, font=f) > w * 0.86: f = _font(f.size - 2)
    d.text((x0 + w / 2, y0 + h * 0.17), title, fill=fg, font=f, anchor='mm', stroke_width=2, stroke_fill=fg)
    cx, cy, r = x0 + w / 2, y0 + h * 0.56, h * 0.17; lw = max(3, int(r * 0.08))
    if art == 'coffee':
        d.polygon([(cx - r * 0.7, cy - r * 0.6), (cx + r * 0.7, cy - r * 0.6), (cx + r * 0.5, cy + r), (cx - r * 0.5, cy + r)], fill='#ffffff'); d.rectangle([cx - r * 0.78, cy - r * 0.8, cx + r * 0.78, cy - r * 0.6], fill=ac)
        d.rectangle([cx - r * 0.62, cy - r * 0.1, cx + r * 0.62, cy + r * 0.3], fill='#7a4a1a')
        for k in (-1, 0, 1): d.arc([cx + k * r * 0.35 - r * 0.15, cy - r * 1.5, cx + k * r * 0.35 + r * 0.15, cy - r * 0.9], 100, 260, fill=fg, width=lw)
    elif art == 'stamp':
        d.rounded_rectangle([cx - r * 1.6, cy - r * 0.9, cx + r * 1.6, cy + r * 0.9], radius=r * 0.2, fill='#ffffff')
        for j in range(2):
            for k in range(5): d.ellipse([cx - r * 1.35 + k * r * 0.58, cy - r * 0.6 + j * r * 0.65, cx - r * 0.95 + k * r * 0.58, cy - r * 0.2 + j * r * 0.65], fill=(ac if j * 5 + k < 7 else '#d8dcdf'))
    elif art == 'breakfast':
        d.polygon([(cx - r * 1.4, cy + r * 0.8), (cx - r * 0.1, cy + r * 0.8), (cx - r * 0.75, cy - r * 0.6)], fill='#f2d79a'); d.line([(cx - r * 1.3, cy + r * 0.55), (cx - r * 0.2, cy + r * 0.55)], fill='#4f9a3a', width=lw * 2)
        d.rectangle([cx + r * 0.2, cy - r * 0.6, cx + r * 0.9, cy + r * 0.85], fill='#ffffff', outline='#1f4fa0', width=lw); d.polygon([(cx + r * 0.2, cy - r * 0.6), (cx + r * 0.55, cy - r), (cx + r * 0.9, cy - r * 0.6)], fill='#1f4fa0')
    elif art == 'icecream':
        d.polygon([(cx - r * 0.45, cy), (cx + r * 0.45, cy), (cx, cy + r * 1.2)], fill='#d9a35a')
        for k, rr in enumerate((0.6, 0.48, 0.34)): d.ellipse([cx - r * rr, cy - r * (0.35 + k * 0.42) - r * 0.3, cx + r * rr, cy - r * (0.35 + k * 0.42) + r * 0.3], fill='#fffaf0', outline='#e8d8c0', width=2)
    elif art == 'oden':
        d.line([(cx, cy - r * 1.3), (cx, cy + r * 1.1)], fill='#c8a46a', width=lw)
        d.ellipse([cx - r * 0.45, cy - r * 1.2, cx + r * 0.45, cy - r * 0.4], fill='#f4f0e0'); d.polygon([(cx - r * 0.5, cy + r * 0.3), (cx + r * 0.5, cy + r * 0.3), (cx, cy - r * 0.45)], fill='#b98a4e')
        d.rounded_rectangle([cx - r * 0.42, cy + r * 0.35, cx + r * 0.42, cy + r * 0.95], radius=r * 0.15, fill='#e8d5b0')
    elif art == 'parcel':
        d.polygon([(cx - r, cy - r * 0.3), (cx, cy - r * 0.8), (cx + r, cy - r * 0.3), (cx, cy + r * 0.2)], fill='#e8c48a'); d.polygon([(cx - r, cy - r * 0.3), (cx, cy + r * 0.2), (cx, cy + r * 1.1), (cx - r, cy + r * 0.6)], fill='#c89a5a')
        d.polygon([(cx + r, cy - r * 0.3), (cx, cy + r * 0.2), (cx, cy + r * 1.1), (cx + r, cy + r * 0.6)], fill='#b0844a')
    elif art == 'iced':
        d.polygon([(cx - r * 0.6, cy - r * 0.9), (cx + r * 0.6, cy - r * 0.9), (cx + r * 0.45, cy + r), (cx - r * 0.45, cy + r)], fill='#f2e04a', outline='#ffffff', width=lw)
        for k, (ox, oy) in enumerate(((-0.2, -0.5), (0.2, -0.3), (-0.1, 0.0))): d.rectangle([cx + ox * r - r * 0.15, cy + oy * r - r * 0.15, cx + ox * r + r * 0.15, cy + oy * r + r * 0.15], outline='#ffffff', width=2)
        d.line([(cx + r * 0.2, cy - r * 1.4), (cx + r * 0.05, cy - r * 0.3)], fill='#d8432f', width=lw)
    f = _font(h * 0.1)
    while d.textlength(sub, font=f) > w * 0.86: f = _font(f.size - 2)
    d.text((x0 + w / 2, y0 + h * 0.8), sub, fill=fg, font=f, anchor='mm')


def make_atlas(path):
    im = Image.new('RGB', (CELL * N, CELL * N), '#ffffff')
    for p in P: draw_cell(im, p)
    for i, pr in enumerate(PRICES): draw_tag(im, TAG0 + i, pr)
    for i, (t, bg, fg) in enumerate(PROMOS): draw_promo(im, PROMO_CELLS + i, t, bg, fg)
    for i, a in enumerate(BACK_POSTERS): draw_poster(im, POSTER_RECT[('back', i)], *a)
    for i, a in enumerate(LEFT_POSTERS): draw_poster(im, POSTER_RECT[('left', i)], *a)
    d = ImageDraw.Draw(im)
    for i, c in enumerate(SOLIDS):
        k = SOLID0 + i; x0, y0 = (k % N) * CELL, (k // N) * CELL; d.rectangle([x0, y0, x0 + CELL - 1, y0 + CELL - 1], fill=c)
    im.save(path); return path


def cell_uv(k, part='front'):
    """格子 k 的 UV（Blender UV 原點在左下）：front＝上面 112 px；side＝最下面那條的中間一點"""
    u0, v_top = (k % N) / N, 1 - (k // N) / N; px = 1 / (N * CELL)
    if part == 'front':
        fx0, fy0, fx1, fy1 = FRONT.get(k, (1, 1, CELL - 1, 112))
        return (u0 + fx0 * px, v_top - fy1 * px, u0 + fx1 * px, v_top - fy0 * px)
    v = v_top - 120 / (N * CELL); u = u0 + 0.5 / N; return (u, v, u, v)


def solid_uv(col):
    i = SOLIDS.index(col) if col in SOLIDS else 0; return cell_uv(SOLID0 + i, 'mid')[:2] if False else ((SOLID0 + i) % N / N + 0.5 / N, 1 - ((SOLID0 + i) // N) / N - 0.5 / N)


class Goods:
    def __init__(self, name, mat):
        self.name, self.mat = name, mat; self.bm = bmesh.new(); self.uv = self.bm.loops.layers.uv.new('UVMap'); self.n = 0

    # ---- 基本形狀（遊戲座標）
    def _face(self, pts, uvs):
        vs = [self.bm.verts.new(g2b(*p)) for p in pts]; f = self.bm.faces.new(vs)
        for lp, uv in zip(f.loops, uvs): lp[self.uv].uv = uv
        return f

    def box(self, x0, x1, y0, y1, z0, z1, face, k, front=True):
        """front 那一面貼包裝（face＝'+z'／'-z'／'+x'／'-x'），其他面用側面的顏色"""
        fu = cell_uv(k, 'front') if front else cell_uv(k, 'side'); su = cell_uv(k, 'side')
        quads = {'+z': [(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], '-z': [(x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0)],
                 '+x': [(x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1)], '-x': [(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)],
                 '+y': [(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)], '-y': [(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)]}
        for key, q in quads.items():
            if key == face: self._face(q, [(fu[0], fu[1]), (fu[2], fu[1]), (fu[2], fu[3]), (fu[0], fu[3])])
            elif key != '-y': self._face(q, [(su[0], su[1])] * 4)
        self.n += 1

    # 正面往外的法線、沿正面由左往右的方向（和 box() 的四邊形同一個方向，字才是正的）
    FRAME = {'+z': ((0, 0, 1), (1, 0, 0)), '-z': ((0, 0, -1), (-1, 0, 0)), '+x': ((1, 0, 0), (0, 0, -1)), '-x': ((-1, 0, 0), (0, 0, 1))}

    def bag(self, x0, x1, y0, y1, z0, z1, face, k):
        """袋子（洋芋片、麵包）：正面是鼓起來的曲面（共用頂點＋平滑著色），左右圓、上下封口壓扁到袋緣；側面接到背面那一圈"""
        nrm, rgt = self.FRAME[face]; fu, su = cell_uv(k, 'front'), cell_uv(k, 'side')
        cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
        W = abs((x1 - x0) * rgt[0] + (z1 - z0) * rgt[2]); D = abs((x1 - x0) * nrm[0] + (z1 - z0) * nrm[2])
        back = (cx - nrm[0] * D / 2, cz - nrm[2] * D / 2)        # 背面的中心（貼著貨架）
        def P(u, y, off):                                         # u∈[0,1] 由左往右、off＝離背面往外
            return (back[0] + rgt[0] * (u - 0.5) * W + nrm[0] * off, y, back[1] + rgt[2] * (u - 0.5) * W + nrm[2] * off)
        US, VS, seal = (0.0, 0.15, 0.5, 0.85, 1.0), (0.0, 0.07, 0.35, 0.65, 0.93, 1.0), 0.07
        def off(u, v):
            sv = 0.0 if v <= seal or v >= 1 - seal else math.sin(math.pi * (v - seal) / (1 - 2 * seal)) ** 0.55
            return D * (0.3 + 0.7 * math.sin(math.pi * u) ** 0.5 * sv) if 0 < u < 1 else D * 0.3
        H = y1 - y0
        grid = [[self.bm.verts.new(g2b(*P(u, y0 + v * H, off(u, v)))) for u in US] for v in VS]
        for j in range(len(VS) - 1):
            for i in range(len(US) - 1):
                f = self.bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i])); f.smooth = True
                for lp, (uu, vv) in zip(f.loops, ((US[i], VS[j]), (US[i + 1], VS[j]), (US[i + 1], VS[j + 1]), (US[i], VS[j + 1]))):
                    lp[self.uv].uv = (fu[0] + (fu[2] - fu[0]) * uu, fu[1] + (fu[3] - fu[1]) * vv)
        # 側面：正面外圈 → 背面（封口那兩條很薄：上下緣的 off 是 0.3D，左右是 0.3D）
        ring = [grid[0][i] for i in range(len(US))] + [grid[j][-1] for j in range(1, len(VS))] + [grid[-1][i] for i in range(len(US) - 2, -1, -1)] + [grid[j][0] for j in range(len(VS) - 2, 0, -1)]
        bv = []
        for v in ring:
            co = v.co.copy(); bx, by, bz = co.x, co.z, -co.y          # Blender → 遊戲座標
            bx -= nrm[0] * D * 0.3; bz -= nrm[2] * D * 0.3; bv.append(self.bm.verts.new(g2b(bx, by, bz)))
        n = len(ring)
        for i in range(n):
            f = self.bm.faces.new((bv[i], bv[(i + 1) % n], ring[(i + 1) % n], ring[i]))
            for lp in f.loops: lp[self.uv].uv = (su[0], su[1])
        self.n += 1

    FACE_DEG = {'+z': 0.0, '+x': 90.0, '-z': 180.0, '-x': 270.0}

    def ring(self, cx, cz, y0, y1, r0, r1, seg, k, part='front', reps=2, uvpt=None, face='+z'):
        """側面（圓台）：一圈共用頂點、平滑著色；包裝每半圈一張，第一個頂點就在接縫上（看得到的那一半的左邊），正面看到一整張"""
        fu = cell_uv(k, 'front'); st = math.radians(self.FACE_DEG.get(face, 0.0) - 90.0)
        ang = [st + 2 * math.pi * i / seg for i in range(seg)]
        lo = [self.bm.verts.new(g2b(cx + r0 * math.sin(a), y0, cz + r0 * math.cos(a))) for a in ang]
        hi = [self.bm.verts.new(g2b(cx + r1 * math.sin(a), y1, cz + r1 * math.cos(a))) for a in ang]
        half = seg // 2
        for i in range(seg):
            j = (i + 1) % seg; f = self.bm.faces.new((lo[i], lo[j], hi[j], hi[i])); f.smooth = True
            if uvpt is not None:
                for lp in f.loops: lp[self.uv].uv = uvpt
                continue
            t0 = (i % half) / half; t1 = t0 + 1 / half
            ua, ub = fu[0] + (fu[2] - fu[0]) * t0, fu[0] + (fu[2] - fu[0]) * t1
            for lp, uv in zip(f.loops, ((ua, fu[1]), (ub, fu[1]), (ub, fu[3]), (ua, fu[3]))): lp[self.uv].uv = uv

    def disc(self, cx, cz, y, r, seg, uvpt, up=True):
        pts = [(cx + r * math.sin(2 * math.pi * i / seg), y, cz + r * math.cos(2 * math.pi * i / seg)) for i in range(seg)]
        if not up: pts = pts[::-1]
        self._face(pts, [uvpt] * seg)

    def cup(self, cx, cz, y, p, face='+z'):
        r1, r0, h = p['w'] / 2, p['w'] / 2 * 0.8, p['h']
        self.ring(cx, cz, y, y + h, r0, r1, 10, p['cell'], face=face); lid = cell_uv(p['cell'], 'side')
        self.disc(cx, cz, y + h, r1 + 0.003, 10, solid_uv('#ffffff')); self.n += 1

    def can(self, cx, cz, y, p, face='+z'):
        r, h = p['w'] / 2, p['h']
        self.ring(cx, cz, y + 0.008, y + h - 0.01, r, r, 10, p['cell'], face=face)
        self.ring(cx, cz, y, y + 0.008, r * 0.86, r, 10, p['cell'], uvpt=solid_uv('#c9ccd0'))
        self.ring(cx, cz, y + h - 0.01, y + h, r, r * 0.88, 10, p['cell'], uvpt=solid_uv('#c9ccd0'))
        self.disc(cx, cz, y + h, r * 0.88, 10, solid_uv('#c9ccd0')); self.n += 1

    def bottle(self, cx, cz, y, p, face='+z'):
        """寶特瓶：瓶身（液體顏色）、標籤（包裝）、瓶肩、瓶頸、瓶蓋"""
        r, h = p['w'] / 2, p['h']; liq = solid_uv(p.get('liquid', '#ffffff'))
        prof = [(0.0, r * 0.9, liq), (0.02, r, liq), (BOTTLE_LABEL[0], r, None), (BOTTLE_LABEL[1], r, liq), (0.18, r * 0.78, liq), (0.2, r * 0.42, liq), (0.212, r * 0.4, solid_uv('#ffffff'))]
        prof = [(y + t * h / 0.235, rr, u) for t, rr, u in prof]
        for (ya, ra, ua), (yb, rb, ub) in zip(prof, prof[1:]):
            if ua is None: self.ring(cx, cz, ya, yb, ra, rb, 8, p['cell'], face=face)
            else: self.ring(cx, cz, ya, yb, ra, rb, 8, p['cell'], uvpt=ua, face=face)
        cap = solid_uv(p['accent'] if p['accent'] in SOLIDS else ('#ffffff' if p['bg'] != '#ffffff' else '#2f7ed8'))
        self.ring(cx, cz, y + h * 0.9, y + h, r * 0.42, r * 0.42, 8, p['cell'], uvpt=cap); self.disc(cx, cz, y + h, r * 0.42, 8, cap); self.n += 1

    def tag(self, x0, x1, y0, y1, zf, face, price):
        """貨架前緣的價格標籤（白底紅字）"""
        if price not in PRICES: return
        fu = cell_uv(TAG0 + PRICES.index(price), 'front')
        if face == '+z': q = [(x0, y0, zf), (x1, y0, zf), (x1, y1, zf), (x0, y1, zf)]
        elif face == '-z': q = [(x1, y0, zf), (x0, y0, zf), (x0, y1, zf), (x1, y1, zf)]
        elif face == '+x': q = [(zf, y0, x1), (zf, y0, x0), (zf, y1, x0), (zf, y1, x1)]
        else: q = [(zf, y0, x0), (zf, y0, x1), (zf, y1, x1), (zf, y1, x0)]
        self._face(q, [(fu[0], fu[1]), (fu[2], fu[1]), (fu[2], fu[3]), (fu[0], fu[3])])

    def promo(self, x0, x1, y0, y1, zf, face, i):
        fu = cell_uv(PROMO_CELLS + i, 'front')
        q = [(x0, y0, zf), (x1, y0, zf), (x1, y1, zf), (x0, y1, zf)] if face == '+z' else [(x1, y0, zf), (x0, y0, zf), (x0, y1, zf), (x1, y1, zf)]
        self._face(q, [(fu[0], fu[1]), (fu[2], fu[1]), (fu[2], fu[3]), (fu[0], fu[3])])

    def poster(self, side, i, pts):
        """牆上的海報：pts＝左下、右下、右上、左上（從室內看）"""
        x0, y0, x1, y1 = POSTER_RECT[(side, i)]; T = N * CELL
        u0, u1, v0, v1 = (x0 + 2) / T, (x1 - 2) / T, 1 - (y1 - 2) / T, 1 - (y0 + 2) / T
        self._face(pts, [(u0, v0), (u1, v0), (u1, v1), (u0, v1)])

    # ---- 一個商品（a＝沿著貨架的起點、depth＝離背板往外的範圍）
    def one(self, p, a, y, front_d, face, axis):
        w, h, dd = p['w'], p['h'], min(p['d'], 0.3)
        if axis == 'x':
            x0, x1 = a, a + w; z1 = front_d if face == '+z' else front_d + dd; z0 = z1 - dd
            if face == '-z': z0, z1 = front_d, front_d + dd
            cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
        else:
            z0, z1 = a, a + w; x1 = front_d if face == '+x' else front_d + dd; x0 = x1 - dd
            if face == '-x': x0, x1 = front_d, front_d + dd
            cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
        s = p['shape']
        if s == 'cup': self.cup(cx, cz, y, p, face)
        elif s == 'can': self.can(cx, cz, y, p, face)
        elif s == 'bottle': self.bottle(cx, cz, y, p, face)
        elif s == 'bag': self.bag(x0, x1, y, y + h, z0, z1, face, p['cell'])
        else: self.box(x0, x1, y, y + h, z0, z1, face, p['cell'])

    def shelf(self, a0, a1, y, front_d, face, axis, cats, hmax, rng, rail_y=None, facings=(2, 4), tag_d=None):
        """一層貨架：從 cats 輪流挑商品，每種並排 facings 個；每一組下面一張價格標籤（rail_y＝價格條的高度）"""
        pool = [p for c in cats for p in CATS.get(c, []) if p['h'] <= hmax + 1e-6]
        if not pool: return
        a = a0 + 0.02; last = None
        while a < a1 - 0.05:
            cands = [p for p in pool if p is not last] or pool; p = rng.choice(cands); last = p
            n = rng.randint(*facings); gap = 0.006 if p['shape'] in ('box', 'bag') else 0.004
            if a + p['w'] > a1 - 0.02: break
            start = a
            # 矮的商品往上疊（真的便利商店麵包、面紙、杯麵會疊兩三層；2026-10-15 後牆層板上方空一大截）：瓶子、罐子不疊
            tiers = 1 if p['shape'] in ('bottle', 'can') else max(1, min(2, int((hmax + 0.01) // (p['h'] + 0.004))))
            if tiers > 1 and rng.random() < 0.25: tiers -= 1
            for i in range(n):
                if a + p['w'] > a1 - 0.02: break
                if rng.random() > 0.06:                                                # 偶爾缺一個（賣掉了）
                    for t in range(tiers if rng.random() > 0.15 else 1): self.one(p, a, y + t * (p['h'] + 0.003), front_d, face, axis)
                a += p['w'] + gap
            if rail_y is not None and p['price']:
                tf = tag_d if tag_d is not None else front_d + (0.008 if face in ('+z', '+x') else -0.008)
                self.tag(start, min(start + 0.07, a1 - 0.02), rail_y - 0.052, rail_y - 0.012, tf, face, p['price'])
            a += 0.018

    def finish(self, parent, mesh_name=None, props=None):
        if not self.bm.faces: self.bm.free(); return None
        self.bm.normal_update(); me = bpy.data.meshes.new(mesh_name or self.name); self.bm.to_mesh(me); self.bm.free()
        me.materials.append(self.mat); ob = bpy.data.objects.new(mesh_name or self.name, me); bpy.context.scene.collection.objects.link(ob)
        if parent is not None: ob.parent = parent
        for k, v in (props or {}).items(): ob[k] = v
        return ob


def atlas_material(name, path):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt = mt.node_tree; bsdf = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path); tx.image.pack(); tx.interpolation = 'Closest' if False else 'Linear'
    nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color']); bsdf.inputs['Roughness'].default_value = 0.45
    return mt
