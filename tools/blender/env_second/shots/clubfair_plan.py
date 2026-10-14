"""社團博覽會攤位的配置提案（平面示意圖，PROPOSAL）：照遊戲校園的實際座標（LAWWW 開發分支 zones3d.js 的椰林大道南側）畫，
不是遊戲截圖。北在上（遊戲的 −z）、1 m＝SCALE 像素。
用法：python3 tools/blender/env_second/shots/clubfair_plan.py <輸出.png> [--json 輸出.json]"""
import json, math, sys
from PIL import Image, ImageDraw, ImageFont
OUT = sys.argv[1]
JS = sys.argv[sys.argv.index('--json') + 1] if '--json' in sys.argv else None
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
X0, X1, Z0, Z1, SCALE = -33.0, 19.0, 3.0, 29.0, 28
W, H = int((X1 - X0) * SCALE), int((Z1 - Z0) * SCALE) + 150
f = lambda s: ImageFont.truetype(FONT, s)
P = lambda x, z: ((x - X0) * SCALE, (z - Z0) * SCALE)

# ---- 提案：攤位（中心 x、z、寬、深；面向北＝遊戲裡轉 π，前面是大道）----
TENT = 3.0; ZC = 15.1
BOOTHS = [
    ('hiking', '登山社', -21.3, '#4f7d4a'), ('lawclub', '法服', -17.8, '#2f4a7a'), ('info', '服務台（集合點）', -13.5, '#8a8a8a'),
    ('guitar', '吉他社', -9.7, '#c77a2e'), ('debate', '辯論社', -5.9, '#a83a3a'),
    ('basketball', '系籃／系學會', 3.4, '#d0642a'), ('bg1', '背景攤', 7.2, '#9fb3c8'), ('bg2', '背景攤', 11.0, '#c9b28a'), ('bg3', '背景攤', 14.8, '#9fc0a8'),
]

im = Image.new('RGB', (W, H), (255, 255, 255)); d = ImageDraw.Draw(im)


def rect(x0, z0, x1, z1, fill=None, outline=None, width=1):
    a, b = P(x0, z0), P(x1, z1); d.rectangle([a, b], fill=fill, outline=outline, width=width)


def circ(x, z, r, fill=None, outline=None, width=1):
    cx, cy = P(x, z); d.ellipse([cx - r * SCALE, cy - r * SCALE, cx + r * SCALE, cy + r * SCALE], fill=fill, outline=outline, width=width)


# 地面：草地、柏油路（z −6～6）、石磚人行道（z 6～8）、傅鐘廣場（x −52～−24、z 11～23）
rect(X0, Z0, X1, Z1, fill=(214, 228, 196))
rect(X0, Z0, X1, 6, fill=(172, 172, 170)); rect(X0, 6, X1, 8, fill=(226, 218, 200))
d.line([P(X0, 3.6), P(X1, 3.6)], fill=(250, 250, 250), width=2)
rect(-52, 11, -24, 23, fill=(230, 222, 204), outline=(170, 160, 140))
d.text(P(-31.6, 21.4), '傅鐘廣場', font=f(22), fill=(110, 100, 80))
circ(-38, 16.5, 1.3, fill=(160, 150, 130))
# 走路空間（LAWWW：z 8～13 不能擋）
rect(X0, 8, X1, 13, outline=(70, 140, 220), width=3)
d.text(P(X0 + 0.4, 8.2), '走路空間 z 8～13（不擋）', font=f(20), fill=(40, 100, 190))
# 共同教學館的前緣（z 26）
rect(-10, 26, 14, 29, fill=(205, 196, 180), outline=(150, 140, 125)); d.text(P(-1.5, 26.6), '共同教學館', font=f(20), fill=(90, 80, 70))
for (x, z) in ((-6, 24), (12, 24)): rect(x - 2.3, z - 0.8, x + 2.3, z + 0.8, fill=(190, 190, 190), outline=(120, 120, 120))
d.text(P(-8.2, 24.9), '車架', font=f(16), fill=(90, 90, 90))
# 大王椰子 z 9.5（每 7.5 m）、路燈 z 11（每 22 m）、長椅 z 13（每 25 m）、大樹牆 z 17.5–18.5
for k in range(25):
    x = -110 + 7.5 * k
    if X0 < x < X1: circ(x, 9.5, 0.45, fill=(120, 110, 90)); circ(x, 9.5, 1.6, outline=(80, 140, 70), width=2)
for k in range(9):
    x = -105 + 22 * k
    if X0 < x < X1: circ(x, 11, 0.25, fill=(60, 60, 60))
for x in (-25, 0):
    rect(x - 0.7, 12.65, x + 0.7, 13.35, fill=(150, 110, 70)); d.text(P(x - 0.8, 13.5), '長椅', font=f(16), fill=(110, 80, 50))
tw = []; k = 0
for x in range(-108, 67, 6):   # zones3d.js 的大樹牆（南側、共同教學館有正式模型時的跳過範圍）
    jx = x + (math.fmod(x * 13, 5)) * 0.35
    skip = [[-116, -111], [-53, -23], [-22, -14], [-12, 16], [16, 24], [39, 51]]
    if any(a < jx < b for a, b in skip): continue
    k += 1; z = 17.5 + (math.fmod(k * 5, 3)) * 0.5
    if X0 < jx < X1: tw.append((jx, z)); circ(jx, z, 0.8, fill=(70, 110, 60))
# 提案的攤位
out = []
for i, (bid, name, x, col) in enumerate(BOOTHS):
    rgb = tuple(int(col[k:k + 2], 16) for k in (1, 3, 5))
    rect(x - TENT / 2, ZC - TENT / 2, x + TENT / 2, ZC + TENT / 2, fill=tuple(int(c * 0.35 + 255 * 0.65) for c in rgb), outline=rgb, width=3)
    rect(x - 0.9, ZC - 1.2, x + 0.9, ZC - 0.82, fill=rgb)   # 桌子在前面（北邊）
    fs = 17 if len(name) <= 4 else 13
    for li, ln in enumerate(name.replace('（', '\n（').split('\n')):
        tw_, th_ = d.textbbox((0, 0), ln, font=f(fs))[2:]; cx, cy = P(x, ZC + 0.2 + li * 0.62); d.text((cx - tw_ / 2, cy - th_ / 2), ln, font=f(fs), fill=(30, 30, 30))
    out.append({'id': bid, 'name': name, 'x': x, 'z': ZC, 'ry': round(math.pi, 4), 'w': TENT, 'd': TENT})
# 現在的東西（博覽會那兩天換掉或藏起來）：紅框、畫在攤位上面
rect(-18.9, 14.15, -17.1, 14.85, outline=(220, 30, 30), width=3); d.text(P(-20.6, 11.7), '現在：法服招生攤位 (-18, 14.5)', font=f(14), fill=(200, 30, 30))
rect(-14.8, 14.4, -12.2, 14.8, outline=(220, 30, 30), width=3); d.text(P(-15.6, 12.3), '現在：公告欄 (-13.5, 14.6)', font=f(14), fill=(200, 30, 30))
# 互動點（activities.js 的 club_expo_y1s1：(-13.5, 13.6)，不動）
circ(-13.5, 13.6, 0.35, fill=(230, 60, 160)); d.text(P(-12.9, 13.1), '互動點 (-13.5, 13.6)', font=f(14), fill=(200, 40, 140))
# 方位、比例尺、圖例
d.text((10, 10), '北 ↑（遊戲 -z）', font=f(20), fill=(255, 255, 255))
sx0, sy = P(X1 - 11, 5.0); d.line([(sx0, sy), (sx0 + 10 * SCALE, sy)], fill=(255, 255, 255), width=3); d.text((sx0, sy - 26), '10 m', font=f(18), fill=(255, 255, 255))
yy = (Z1 - Z0) * SCALE + 10
d.text((12, yy), '社團博覽會攤位（PROPOSAL，2026-10-13，LAWWW2）：3×3 m 的帳篷 9 頂沿大道南側的草地排開（中心 z 15.1、面向大道）；桌子在帳篷前緣，人站在 z 13 左右。', font=f(19), fill=(30, 30, 30))
d.text((12, yy + 30), '傅鐘廣場（x ≤ -24）、長椅前後（x -25、0 的 ±1.6 m）、走路空間 z 8～13 都留空；服務台在原本公告欄的位置（互動點不動），法服在原本招生攤位的位置。', font=f(19), fill=(30, 30, 30))
d.text((12, yy + 60), '帳篷後緣 z 16.6，大樹牆（深綠圓：樹幹的導航範圍）在 z 17.5 以後；紅框＝現在的東西（博覽會那兩天換掉或藏起來）。座標＝遊戲校園的世界座標（公尺）。', font=f(19), fill=(30, 30, 30))
d.text((12, yy + 90), '不是遊戲截圖：照 zones3d.js（LAWWW 開發分支）的座標畫的示意圖。', font=f(19), fill=(120, 120, 120))
im.save(OUT)
if JS: json.dump({'booths': out, 'tent': TENT, 'trees_nearby': [[round(x, 2), round(z, 2)] for x, z in tw], 'note': '中心座標、ry＝π（模型 +z 是攤位正面，轉 π 後面向北＝大道）'}, open(JS, 'w'), ensure_ascii=False, indent=1)
print('ok', OUT, len(out))
