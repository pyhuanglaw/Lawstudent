"""博雅一樓平面比較圖（同一個比例尺）：左＝LAWWW 開發分支現在的配置（src/data/boya_layout.js）；右＝LAWWW2 的提案 R2（外觀 34×18 不變）。
提案只是示意（PROPOSAL）：配置、導航、互動由 LAWWW 決定與實作；數字的根據寫在 docs/art-rebuild/second_ai/boya_review.md。
用法：python3 tools/blender/env_second/shots/boya_plan_diagram.py <有 src/data/boya_layout.js 的根目錄> <輸出 png>"""
import json, math, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
ROOT, OUT = sys.argv[1], sys.argv[2]
L = json.loads(subprocess.check_output(['node', '-e', "const fs=require('fs');const s=fs.readFileSync(process.argv[1],'utf8');const m=s.match(/=\\s*(\\{[\\s\\S]*\\})\\s*;?\\s*$/m);console.log(JSON.stringify(eval('('+m[1]+')')))", ROOT + '/src/data/boya_layout.js']).decode())
S = 24          # 每公尺像素
PAD = 70
W, D = L['W'], L['D']
FONT = None
for f in ('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc', '/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc'):
    try: FONT = ImageFont.truetype(f, 15); FONTB = ImageFont.truetype(f, 19); FONTS = ImageFont.truetype(f, 12); break
    except Exception: pass
if FONT is None: FONT = FONTB = FONTS = ImageFont.load_default()
C = dict(wall='#3b3b3b', seat='#b5562f', desk='#6b5a48', crowd='#2f6db5', table='#c8a46e', chair='#7b5a3a', sofa='#4b5868', stair='#9a9a9a', text='#222222', aisle='#e8e0cf', stage='#d9d2c0', note='#7a2a2a', round='#d6b98a')


class Plan:
    def __init__(self, title, w, d):
        self.w, self.d = w, d
        self.im = Image.new('RGB', (int(w * S) + 2 * PAD, int(d * S) + 2 * PAD + 40), 'white'); self.dr = ImageDraw.Draw(self.im)
        self.dr.text((PAD, 12), title, fill=C['text'], font=FONTB)
        self.ox, self.oz = PAD + w * S / 2, PAD + 40 + d * S / 2
        self.rect(-w / 2, -d / 2, w / 2, d / 2, outline=C['wall'], width=4)
        # 比例尺 5 m、北
        x0, y0 = PAD, self.im.size[1] - 22
        self.dr.line([(x0, y0), (x0 + 5 * S, y0)], fill='black', width=3); self.dr.text((x0 + 5 * S + 6, y0 - 9), '5 m', fill='black', font=FONTS)
        self.dr.text((self.im.size[0] - PAD - 40, 14), '↑ 北（醉月湖）', fill=C['text'], font=FONTS)

    def P(self, x, z): return (self.ox + x * S, self.oz + z * S)

    def rect(self, x0, z0, x1, z1, fill=None, outline=None, width=1):
        a, b = self.P(min(x0, x1), min(z0, z1)), self.P(max(x0, x1), max(z0, z1)); self.dr.rectangle([a, b], fill=fill, outline=outline, width=width)

    def line(self, x0, z0, x1, z1, fill=C['wall'], width=3): self.dr.line([self.P(x0, z0), self.P(x1, z1)], fill=fill, width=width)

    def circle(self, x, z, r, fill, outline=None):
        cx, cy = self.P(x, z); self.dr.ellipse([cx - r * S, cy - r * S, cx + r * S, cy + r * S], fill=fill, outline=outline)

    def text(self, x, z, s, fill=C['text'], font=None, anchor='mm'): self.dr.text(self.P(x, z), s, fill=fill, font=font or FONT, anchor=anchor)

    def wall_with_gaps(self, w):
        horiz = abs(w['z1'] - w['z0']) < 1e-6; a0, a1 = (min(w['x0'], w['x1']), max(w['x0'], w['x1'])) if horiz else (min(w['z0'], w['z1']), max(w['z0'], w['z1']))
        a = a0
        for g0, g1 in sorted([sorted(g) for g in w['gaps']]):
            if g0 > a: self.line(*(a, w['z0'], g0, w['z0']) if horiz else (w['x0'], a, w['x0'], g0))
            a = max(a, g1)
        if a < a1: self.line(*(a, w['z0'], a1, w['z0']) if horiz else (w['x0'], a, w['x0'], a1))


def chair(p, x, z, yaw, col=C['chair']):
    # 椅子＝0.46 m 方塊，靠背在背後（yaw 是人面向的方向：0＝+z）
    p.rect(x - 0.23, z - 0.23, x + 0.23, z + 0.23, fill=col)
    bx, bz = x - math.sin(yaw) * 0.2, z - math.cos(yaw) * 0.2
    p.circle(bx, bz, 0.07, '#3a2a1a')


# ---------------- 現在的配置 ----------------
A = Plan(f'現在（LAWWW 開發分支 93b93b5）：博雅一樓 {W:g}×{D:g} m——101 是 {len([r for r in L["rooms"] if r["id"] == "101"][0]["seats"])} 席', W, D)
for w in L['walls']:
    if w['lv'] == 0: A.wall_with_gaps(w)
st = L['stair']; A.rect(st['well']['x0'], st['well']['z0'], st['well']['x1'], st['well']['z1'], fill=C['stair']); A.text((st['well']['x0'] + st['well']['x1']) / 2, (st['well']['z0'] + st['well']['z1']) / 2, '樓梯', font=FONTS)
for r in L['rooms']:
    if r['lv'] != 0: continue
    if r['kind'] == 'closed': A.rect(r['x0'], r['z0'], r['x1'], r['z1'], fill='#eeeeee'); A.text((r['x0'] + r['x1']) / 2, (r['z0'] + r['z1']) / 2, r['id'] + '（關）', font=FONTS); continue
    if r['kind'] == 'lecture':
        A.rect(r['x0'] + 0.1, r['stageEdge'], r['x1'] - 0.1, r['z1'] - 0.1, fill=C['stage'])
        for q in r['rowsData']:
            A.rect(r['seatX0'], q['deskZ'] - r['deskD'] / 2, r['seatX1'], q['deskZ'] + r['deskD'] / 2, fill=C['desk'])
        for s in r['seats']: chair(A, s['x'], s['z'], s['yaw'], C['seat'])
        A.text((r['x0'] + r['x1']) / 2, r['z1'] - 1.2, f"{r['id']}　{len(r['seats'])} 席", font=FONTB)
for g in L['groups']:
    for t in g.get('tables', []):
        A.rect(t['x'] - t['w'] / 2, t['z'] - t['d'] / 2, t['x'] + t['w'] / 2, t['z'] + t['d'] / 2, fill=C['table'])
        for s in t['seats']: chair(A, s['x'], s['z'], s['yaw'])
    for so in g.get('sofas', []):
        c, sn = math.cos(so['ry']), math.sin(so['ry']); hw, hd = so['len'] / 2, 0.4
        pts = [(so['x'] + ox * c + oz * sn, so['z'] - ox * sn + oz * c) for ox, oz in ((-hw, -hd), (hw, -hd), (hw, hd), (-hw, hd))]
        A.dr.polygon([A.P(*p) for p in pts], fill=C['sofa'])
for b in L['benches']:
    if b['lv'] == 0: A.rect(b['x'] - 0.3, b['z'] - 0.75, b['x'] + 0.3, b['z'] + 0.75, fill=C['sofa'])
e = L['entrance']; A.rect(e['a0'], D / 2 - 0.15, e['a1'], D / 2 + 0.15, fill='white'); A.text(0, D / 2 + 0.9, '入口', font=FONTS)
A.text(-3.6, 1.6, '自習小桌 6', fill=C['note'], font=FONTS); A.text(3.9, 2.6, '討論桌 2', fill=C['note'], font=FONTS); A.text(-3.4, -3.4, '沙發', fill=C['note'], font=FONTS)

# ---------------- 提案 R2（外觀 34×18 不變）----------------
B = Plan('提案 R2（PROPOSAL，外觀 34×18 不變）：101＝360 席＋旁邊 16 張小桌', W, D)
# 101：東半邊 x -4.1..16.9；講台在西端（靠大廳、門在講台那一端），座位往東一排比一排高
X0, X1, Z0, Z1 = -4.1, 16.9, -D / 2 + 0.1, D / 2 - 0.1
B.line(X0, Z0, X0, -7.6); B.line(X0, -6.4, X0, 6.4); B.line(X0, 7.6, X0, Z1)
B.rect(X0 + 0.1, Z0, 0.4, Z1, fill=C['stage']); B.text(-1.9, 0, '講台區', font=FONTS)
B.rect(-3.6, -0.6, -3.0, 0.6, fill=C['desk'])   # 講桌
seat_w, rows, pitch = 0.52, 15, 1.0
blocks = [(-7.5, 6), (-3.18, 12), (4.26, 6)]   # 每一區的起點 z、座位數（側走道 1.3、中間走道 1.2；座位寬 0.52）
import random
random.seed(7)
for r in range(rows):
    x = 0.4 + r * pitch + 0.55
    for z0, n in blocks:
        B.rect(x - 0.62, z0, x - 0.42, z0 + n * seat_w, fill=C['desk'])      # 連續桌板（每一區一條）
        for i in range(n):
            z = z0 + (i + 0.5) * seat_w
            occ = random.random() < (0.35 + 0.035 * r)                  # 前面空、後面滿（真實的坐法）
            B.rect(x - 0.2, z - 0.22, x + 0.2, z + 0.22, fill=C['crowd'] if occ else C['seat'])
# 走道（台階）
for za, zb in ((Z0, -7.5), (-4.38, -3.18), (3.06, 4.26), (7.38, Z1)):
    B.rect(0.4, za, 15.4, zb, fill=C['aisle'])
B.text(8.0, -D / 2 + 0.75, '台階走道（走得上去）', font=FONTS); B.text(8.0, D / 2 - 0.75, '15 排 × 24 席＝360；藍＝坐著的聽眾（替身，不是 360 個人物）', font=FONTS)
B.rect(15.4, Z0, X1, Z1, fill='#efe9dc'); B.text(16.1, 0, '後', font=FONTS)
B.rect(6.2, -0.55, 9.8, 0.55, fill='white'); B.text(8.0, 0, '博雅 101', font=FONTB)
# 大廳（西側大廳）：x -16.9..-4.1；入口在南牆西段（西南入口）
B.rect(-16.9, -8.9, -13.1, -0.7, fill=C['stair']); B.text(-15.0, -4.8, '樓梯', font=FONTS)
B.rect(-12.3, D / 2 - 0.15, -8.7, D / 2 + 0.15, fill='white'); B.text(-10.5, D / 2 + 0.9, '入口（西南）', font=FONTS)
for xc in (-12.0, -10.0, -8.0, -6.0):
    for zc in (-5.0, -2.2, 0.6, 3.4):
        B.rect(xc - 0.45, zc - 0.3, xc + 0.45, zc + 0.3, fill=C['table'])
        chair(B, xc, zc - 0.65, 0.0); chair(B, xc, zc + 0.65, math.pi)
B.text(-9.0, -6.9, '101 旁桌椅區：16 張雙人小桌（32 席）', fill=C['note'], font=FONTS)
for (xc, zc) in ((-15.2, 2.2), (-15.2, 5.6), (-6.4, 6.9)):
    B.circle(xc, zc, 0.5, C['round'])
    for k in range(4):
        a = k * math.pi / 2 + math.pi / 4; chair(B, xc + math.sin(a) * 0.85, zc + math.cos(a) * 0.85, a + math.pi)
B.text(-15.2, 7.6, '圓桌', fill=C['note'], font=FONTS)
B.rect(-12.4, -8.7, -7.6, -7.9, fill=C['sofa']); B.text(-10.0, -7.55, '沙發', fill=C['note'], font=FONTS)
B.text(-10.5, 6.3, '大廳', font=FONTB)

# ---------------- 拼起來 ----------------
im = Image.new('RGB', (A.im.size[0], A.im.size[1] + B.im.size[1] + 10), 'white')
im.paste(A.im, (0, 0)); im.paste(B.im, (0, A.im.size[1] + 10))
dr = ImageDraw.Draw(im); dr.text((PAD, im.size[1] - 4), '', fill='black')
im.save(OUT)
print('wrote', OUT, im.size)
