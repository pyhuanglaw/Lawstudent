"""方案 A 的俯視圖：用 tools/layout/campus_nav_dump.js 輸出的兩份導航格（舊版、新版）畫出
① 改了哪裡（新擋住＝橘、新可以走＝綠；方案 A 的範圍框起來）② 玩家的路線（遊戲的找路，長度、走路／跑步時間）。
用法：python3 tools/layout/plan_a_map.py 舊版.json 新版.json 輸出資料夾"""
import json, sys, math
from PIL import Image, ImageDraw, ImageFont

OLD, NEW, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
a, b = json.load(open(OLD)), json.load(open(NEW))
C, R, c, x0, z0 = b['cols'], b['rows'], b['cell'], b['x0'], b['z0']
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
f14, f16, f20 = (ImageFont.truetype(FONT, s) for s in (14, 16, 20))
PX = 2   # 一格 0.5 m＝2 px（1 m＝4 px）
WALK, RUN = (b.get('speeds') or {}).get('walk', 1.8), (b.get('speeds') or {}).get('run', 4.8)


def base(view, title, extra=0):
    X0, X1, Z0, Z1 = view
    W, H = int((X1 - X0) / c * PX), int((Z1 - Z0) / c * PX)
    im = Image.new('RGB', (W, H + 70 + extra), (245, 242, 236)); d = ImageDraw.Draw(im)
    def P(x, z): return ((x - X0) / c * PX, (z - Z0) / c * PX + 40)
    for cz in range(R):
        z = z0 + cz * c
        if z < Z0 or z > Z1: continue
        for cx in range(C):
            x = x0 + cx * c
            if x < X0 or x > X1: continue
            i = cz * C + cx; ob, nb = a['blocked'][i], b['blocked'][i]
            col = (196, 214, 178) if not nb and not ob else (150, 150, 146) if nb and ob else (232, 140, 50) if nb else (120, 200, 120)
            px, pz = P(x, z); d.rectangle([px, pz, px + PX - 1, pz + PX - 1], fill=col)
    d.rectangle([0, 0, W, 38], fill=(245, 242, 236)); d.text((10, 8), title, font=f20, fill=(40, 40, 40))
    # 北（-z）朝上；比例尺
    d.text((W - 60, 46), '北 ↑', font=f16, fill=(40, 40, 40))
    sx, sy = 16, H + 30; d.line([sx, sy, sx + 20 / c * PX, sy], fill=(30, 30, 30), width=3); d.text((sx, sy - 22), '20 m', font=f14, fill=(30, 30, 30))
    return im, d, P


def label(d, P, x, z, t, col=(30, 30, 30), bg=(255, 255, 255)):
    px, pz = P(x, z); w = d.textlength(t, font=f14)
    d.rectangle([px - w / 2 - 3, pz - 9, px + w / 2 + 3, pz + 9], fill=bg, outline=(90, 90, 90)); d.text((px - w / 2, pz - 8), t, font=f14, fill=col)


# ---- 1. 改了哪裡 ----
view = (-130, 130, -132, 84)
im, d, P = base(view, '方案 A 改了哪裡（遊戲的導航格：灰＝建築／水面，橘＝新擋住，綠＝新可以走）')
x1, z1, x2, z2 = -62, -124, 5, -48.5
p1, p2 = P(x1, z1), P(x2, z2)
for k in range(0, int(p2[0] - p1[0]), 12): d.line([p1[0] + k, p1[1], p1[0] + k + 6, p1[1]], fill=(200, 30, 30), width=2); d.line([p1[0] + k, p2[1], p1[0] + k + 6, p2[1]], fill=(200, 30, 30), width=2)
for k in range(0, int(p2[1] - p1[1]), 12): d.line([p1[0], p1[1] + k, p1[0], p1[1] + k + 6], fill=(200, 30, 30), width=2); d.line([p2[0], p1[1] + k, p2[0], p1[1] + k + 6], fill=(200, 30, 30), width=2)
d.text((p1[0] + 4, p1[1] - 20), '方案 A 的範圍（約 67 × 75 m）', font=f14, fill=(200, 30, 30))
for t, x, z in b['landmarks']: label(d, P, x, z, t)
oldlake = [l for l in a['landmarks'] if l[0] == '醉月湖']
if oldlake: label(d, P, oldlake[0][1], oldlake[0][2], '原本的醉月湖（v9.5）', col=(30, 90, 160), bg=(225, 238, 250))
label(d, P, -93, 52, '大一女舍（另一項 D56，不屬於方案 A）', col=(150, 70, 0), bg=(253, 236, 214))
im.save(OUT + '/planA_impact.png'); print('wrote', OUT + '/planA_impact.png')

# ---- 2. 路線 ----
view = (-120, 45, -128, 64)
ok_routes = [r for r in b['routes'] if r['ok']]
im, d, P = base(view, '方案 A 的玩家路線（遊戲的找路：走路 %.1f m/s、跑步 %.1f m/s）' % (WALK, RUN), extra=22 * len(ok_routes) + 40)
cols = [(200, 40, 40), (30, 110, 200), (20, 140, 70), (150, 60, 170), (200, 120, 0), (0, 130, 140), (120, 80, 40), (230, 60, 150)]
legend = []
for k, r in enumerate([r for r in b['routes'] if r['ok']]):
    col = cols[k % len(cols)]
    pts = [P(x, z) for x, z in r['pts']]
    d.line(pts, fill=col, width=3)
    d.ellipse([pts[0][0] - 4, pts[0][1] - 4, pts[0][0] + 4, pts[0][1] + 4], fill=col)
    legend.append((col, '%s：%.0f m，走路 %d 秒、跑步 %d 秒' % (r['name'], r['len'], round(r['len'] / WALK), round(r['len'] / RUN))))
for t, x, z in b['landmarks']:
    if view[0] <= x <= view[1] and view[2] <= z <= view[3]: label(d, P, x, z, t)
ly = int((view[3] - view[2]) / c * PX) + 40 + 34
for col, t in legend:
    d.rectangle([12, ly + 4, 26, ly + 14], fill=col); d.text((32, ly), t, font=f14, fill=(30, 30, 30)); ly += 20
im.save(OUT + '/planA_routes.png'); print('wrote', OUT + '/planA_routes.png')
for r in a['routes']: print('舊版', r['name'], r['len'])
for r in b['routes']: print('新版', r['name'], r['len'] if r['ok'] else '走不到')
