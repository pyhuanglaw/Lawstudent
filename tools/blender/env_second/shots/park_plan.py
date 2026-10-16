"""溫州街小公園擴大版的配置圖（俯視，給 LAWWW-B 改導航、AA-B 對照 5-2）：讀 src/data/wz_park_layout.js（用 node 轉 JSON），
畫出主巷、A 側既有的店（A3、A4）、北巷、巷底 F1、公園的範圍、步道、每一樣東西、導航阻擋（紅框）、座位（藍點）、互動點（綠點）。
用法：python3 tools/blender/env_second/shots/park_plan.py <輸出.png>"""
import json, math, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
ROOT = __file__.rsplit('/tools/', 1)[0]
L = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./src/data/wz_park_layout.js')))"], cwd=ROOT))
S = 32; X0, X1, Z0, Z1 = 0.0, 42.0, -6.0, 33.0
W, H = int((X1 - X0) * S), int((Z1 - Z0) * S)
im = Image.new('RGB', (W, H), (236, 234, 228)); d = ImageDraw.Draw(im)
F = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 18); FB = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 24)
P = lambda x, z: ((x - X0) * S, (Z1 - z) * S)            # 北（+z）在上
def rect(x0, z0, x1, z1, **kw): a = P(x0, z1); b = P(x1, z0); d.rectangle([a[0], a[1], b[0], b[1]], **kw)
rect(0, -5, 42, 5, fill=(170, 170, 168)); d.text(P(1, 0.6), '主巷（溫州街）', fill=(40, 40, 40), font=FB)
rect(3.25, 4, 8.25, 21, fill=(170, 170, 168)); d.text(P(3.6, 14), '北巷', fill=(40, 40, 40), font=F)
for nm, x0, x1 in (('A2', -4, 3.1), ('A3 巷口書房', 8.4, 20), ('A4 林家乾麵', 32, 40)):
    rect(max(x0, 0), 5, x1, 17, fill=(196, 180, 160), outline=(120, 100, 80)); d.text(P(max(x0, 0) + 0.4, 12), nm, fill=(60, 40, 20), font=F)
rect(0, 21, 11.75, 31, fill=(196, 180, 160), outline=(120, 100, 80)); d.text(P(0.5, 26), 'F1（巷底）', fill=(60, 40, 20), font=F)
for x0, x1, z0, z1 in ((-4, 3.1, -17, -5), (4, 16, -17, -5), (16, 30, -17, -5), (30, 40, -17, -5)): rect(max(x0, 0), max(z0, Z0), x1, z1, fill=(196, 180, 160))
A = L['area']; fr = A['front']; bk = A['back']
rect(fr['x0'], fr['z0'], fr['x1'], fr['z1'], fill=(176, 206, 150)); rect(bk['x0'], bk['z0'], bk['x1'], bk['z1'], fill=(176, 206, 150))
rect(bk['x0'], bk['cut']['z0'], bk['cut']['x1'], bk['z1'], fill=(196, 180, 160))
for p in L['paths']:
    if 'ring' in p:
        c = P(*p['ring']); r = p['r'] * S; w = p['w'] * S; d.ellipse([c[0] - r - w / 2, c[1] - r - w / 2, c[0] + r + w / 2, c[1] + r + w / 2], fill=(214, 200, 176)); d.ellipse([c[0] - r + w / 2, c[1] - r + w / 2, c[0] + r - w / 2, c[1] + r - w / 2], fill=(176, 206, 150))
    else: d.line([P(*p['from']), P(*p['to'])], fill=(214, 200, 176), width=int(p['w'] * S))
for w_ in L['walls']:
    if 'x0' in w_: d.line([P(w_['x0'], w_['z']), P(w_['x1'], w_['z'])], fill=(110, 110, 110), width=6)
    else: d.line([P(w_['x'], w_['z0']), P(w_['x'], w_['z1'])], fill=(110, 110, 110), width=6)
COL = {'tree': (60, 120, 60), 'bench': (130, 90, 50), 'pavilion': (150, 70, 50), 'playground': (220, 140, 60), 'swings': (60, 110, 180), 'fitness': (80, 80, 160), 'tudigong': (200, 40, 40)}
for it in L['items']:
    k = it['kind']
    if k == 'azalea_hedge':
        for x0, z0, x1, z1 in it['segments']: d.line([P(x0, z0), P(x1, z1)], fill=(214, 90, 140), width=10)
        continue
    x, z = it['x'], it['z']; col = next((v for kk, v in COL.items() if k.startswith(kk)), (90, 90, 90))
    if 'w' in it and k != 'swings': rect(x - it['w'] / 2, z - it['d'] / 2, x + it['w'] / 2, z + it['d'] / 2, outline=col, width=3)
    elif k.startswith('tree'): r = (2.6 if 'bischofia' in k else 1.6) * S; c = P(x, z); d.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], outline=col, width=3)
    else: c = P(x, z); d.ellipse([c[0] - 6, c[1] - 6, c[0] + 6, c[1] + 6], fill=col)
    lab = {'notice_board': '公布欄', 'drinking_fountain': '直飲台', 'bike_rack': '腳踏車架', 'bench': '長椅', 'tree_camphor': '樟樹', 'tree_bischofia': '老茄苳＋圓椅', 'ring_bench': '',
           'pavilion': '涼亭（石桌、象棋）', 'playground': '遊戲場', 'swings': '鞦韆×2', 'fitness_waist': '健身', 'fitness_shoulder': '健身', 'fitness_leg': '健身',
           'tudigong_shrine': '土地公', 'tree_sweetgum': '楓香', 'park_lamp': '暖燈'}.get(k, k)
    if lab: d.text((P(x, z)[0] + 8, P(x, z)[1] - 10), lab, fill=(20, 20, 20), font=F)
for b in L['blocks']:
    if isinstance(b, dict): c = P(b['x'], b['z']); r = b['r'] * S; d.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], outline=(220, 30, 30), width=2)
    else: x, z, w, dd = b; rect(x - w / 2, z - dd / 2, x + w / 2, z + dd / 2, outline=(220, 30, 30), width=2)
for s_ in L['seats']: c = P(s_['x'], s_['z']); d.ellipse([c[0] - 5, c[1] - 5, c[0] + 5, c[1] + 5], fill=(30, 90, 220))
for s_ in L['interact']: c = P(s_['x'], s_['z']); d.ellipse([c[0] - 5, c[1] - 5, c[0] + 5, c[1] + 5], fill=(30, 170, 60))
d.text(P(A['entranceA']['x0'], 4.4), '入口 A', fill=(200, 30, 30), font=FB); d.text(P(5.5, 19.6), '入口 B', fill=(200, 30, 30), font=FB)
for gx in range(0, 43, 4): d.text((gx * S + 2, H - 22), str(gx), fill=(90, 90, 90), font=F)
for gz in range(-4, 33, 4): d.text((2, (Z1 - gz) * S - 10), str(gz), fill=(90, 90, 90), font=F)
d.text((10, 8), '溫州街小公園 擴大版（wz_park_layout.js v1）：北在上；紅框＝導航阻擋、藍點＝座位、綠點＝互動點、粉紅＝杜鵑花籬、灰粗線＝矮牆', fill=(0, 0, 0), font=F)
im.save(sys.argv[1]); print('saved', sys.argv[1], im.size)
