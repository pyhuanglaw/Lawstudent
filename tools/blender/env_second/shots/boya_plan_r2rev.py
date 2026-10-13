"""博雅平面：現在（LAWWW 開發分支）和「R2 修正版」（PROPOSAL；外觀 34×18 不變、101 挑高大講堂、102／103 雙胞胎、一樓自習區）——同一個比例尺。
只是示意：配置、導航、入座、鏡頭由 LAWWW 決定與實作；官方平面圖（教務處 PDF 最後一頁）這個沙盒打不開，還沒有核對。
用法：python3 tools/blender/env_second/shots/boya_plan_r2rev.py <有 src/data/boya_layout.js 的根目錄> <輸出 png>"""
import json, math, random, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
ROOT, OUT = sys.argv[1], sys.argv[2]
L = json.loads(subprocess.check_output(['node', '-e', "const fs=require('fs');const s=fs.readFileSync(process.argv[1],'utf8');const m=s.match(/=\\s*(\\{[\\s\\S]*\\})\\s*;?\\s*$/m);console.log(JSON.stringify(eval('('+m[1]+')')))", ROOT + '/src/data/boya_layout.js']).decode())
S, PAD = 24, 70
W, D = L['W'], L['D']
FF = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
FONT, FONTB, FONTS = ImageFont.truetype(FF, 15), ImageFont.truetype(FF, 19), ImageFont.truetype(FF, 12)
C = dict(wall='#3b3b3b', seat='#b5562f', desk='#6b5a48', crowd='#2f6db5', table='#c8a46e', chair='#7b5a3a', sofa='#4b5868', stair='#9a9a9a', text='#222222', aisle='#e8e0cf', stage='#d9d2c0', note='#7a2a2a', round='#d6b98a', void='#dfe6ee', door='#1d8a3a')


class Plan:
    def __init__(self, title, w, d):
        self.im = Image.new('RGB', (int(w * S) + 2 * PAD, int(d * S) + 2 * PAD + 40), 'white'); self.dr = ImageDraw.Draw(self.im)
        self.dr.text((PAD, 12), title, fill=C['text'], font=FONTB)
        self.ox, self.oz = PAD + w * S / 2, PAD + 40 + d * S / 2
        self.rect(-w / 2, -d / 2, w / 2, d / 2, outline=C['wall'], width=4)
        x0, y0 = PAD, self.im.size[1] - 22
        self.dr.line([(x0, y0), (x0 + 5 * S, y0)], fill='black', width=3); self.dr.text((x0 + 5 * S + 6, y0 - 9), '5 m', fill='black', font=FONTS)
        self.dr.text((self.im.size[0] - PAD - 40, 14), '↑ 北（醉月湖）', fill=C['text'], font=FONTS)

    def P(self, x, z): return (self.ox + x * S, self.oz + z * S)

    def rect(self, x0, z0, x1, z1, fill=None, outline=None, width=1):
        self.dr.rectangle([self.P(min(x0, x1), min(z0, z1)), self.P(max(x0, x1), max(z0, z1))], fill=fill, outline=outline, width=width)

    def line(self, x0, z0, x1, z1, fill=C['wall'], width=3): self.dr.line([self.P(x0, z0), self.P(x1, z1)], fill=fill, width=width)

    def circle(self, x, z, r, fill, outline=None):
        cx, cy = self.P(x, z); self.dr.ellipse([cx - r * S, cy - r * S, cx + r * S, cy + r * S], fill=fill, outline=outline)

    def text(self, x, z, s, fill=C['text'], font=None, anchor='mm'): self.dr.text(self.P(x, z), s, fill=fill, font=font or FONT, anchor=anchor)

    def door(self, x, z0, z1=None, horiz=False):   # 門：綠色粗線
        if horiz: self.line(x, z0, z1, z0, fill=C['door'], width=6)
        else: self.line(x, z0, x, z1, fill=C['door'], width=6)

    def wall_with_gaps(self, w):
        horiz = abs(w['z1'] - w['z0']) < 1e-6; a0, a1 = (min(w['x0'], w['x1']), max(w['x0'], w['x1'])) if horiz else (min(w['z0'], w['z1']), max(w['z0'], w['z1']))
        a = a0
        for g0, g1 in sorted([sorted(g) for g in w['gaps']]):
            if g0 > a: self.line(*(a, w['z0'], g0, w['z0']) if horiz else (w['x0'], a, w['x0'], g0))
            a = max(a, g1)
        if a < a1: self.line(*(a, w['z0'], a1, w['z0']) if horiz else (w['x0'], a, w['x0'], a1))


def chair(p, x, z, yaw, col=C['chair']):
    p.rect(x - 0.23, z - 0.23, x + 0.23, z + 0.23, fill=col)
    p.circle(x - math.sin(yaw) * 0.2, z - math.cos(yaw) * 0.2, 0.07, '#3a2a1a')


def hall(p, x0, x1, stage, rows_z, face, seats_x, occ_rate, label, sub):
    """階梯教室：stage＝(z0,z1) 講台；rows_z＝每一排座位的 z；face＝+1（面向 +z）/-1；seats_x＝座位 x 列表"""
    p.rect(x0 + 0.1, stage[0], x1 - 0.1, stage[1], fill=C['stage'])
    rnd = random.Random(len(rows_z) * 31 + int(x0))
    for r, z in enumerate(rows_z):
        dz0, dz1 = (z + 0.30, z + 0.64) if face > 0 else (z - 0.64, z - 0.30)
        p.rect(seats_x[0] - 0.26, dz0, seats_x[-1] + 0.26, dz1, fill=C['desk'])
        for x in seats_x:
            p.rect(x - 0.22, z - 0.25, x + 0.22, z + 0.2, fill=C['crowd'] if rnd.random() < occ_rate(r) else C['seat'])
    zc = sum(stage) / 2; subs = sub.split('\n')
    p.text((x0 + x1) / 2, zc - 0.35 - 0.3 * (len(subs) - 1), label, font=FONTB)
    for i, t in enumerate(subs): p.text((x0 + x1) / 2, zc + 0.6 + 0.62 * i - 0.3 * (len(subs) - 1), t, font=FONTS)


def groups(A):
    for g in L['groups']:
        if g.get('lv', 0) != 0: continue
        for t in g.get('tables', []):
            if t.get('shape') == 'round': A.circle(t['x'], t['z'], t['r'], C['round'])
            else: A.rect(t['x'] - t['w'] / 2, t['z'] - t['d'] / 2, t['x'] + t['w'] / 2, t['z'] + t['d'] / 2, fill=C['table'])
            for st_ in t['seats']: chair(A, st_['x'], st_['z'], st_['yaw'])
        for so in g.get('sofas', []):
            c, sn = math.cos(so['ry']), math.sin(so['ry']); hw, hd = so['len'] / 2, 0.4
            A.dr.polygon([A.P(so['x'] + ox * c + oz * sn, so['z'] - ox * sn + oz * c) for ox, oz in ((-hw, -hd), (hw, -hd), (hw, hd), (-hw, hd))], fill=C['sofa'])
    for b in L['benches']:
        if b['lv'] == 0: A.rect(b['x'] - 0.3, b['z'] - 0.75, b['x'] + 0.3, b['z'] + 0.75, fill=C['sofa'])


# ---------------- A：現在 ----------------
def plan_now():
    A = Plan('現在（LAWWW 開發分支 4e2db1f：自習區第二版）：博雅一樓 34×18 m', W, D)
    for w in L['walls']:
        if w['lv'] == 0: A.wall_with_gaps(w)
    st = L['stair']; A.rect(st['well']['x0'], st['well']['z0'], st['well']['x1'], st['well']['z1'], fill=C['stair']); A.text((st['well']['x0'] + st['well']['x1']) / 2, (st['well']['z0'] + st['well']['z1']) / 2, '樓梯', font=FONTS)
    for r in L['rooms']:
        if r['lv'] != 0: continue
        if r['kind'] == 'closed': A.rect(r['x0'], r['z0'], r['x1'], r['z1'], fill='#eeeeee'); A.text((r['x0'] + r['x1']) / 2, (r['z0'] + r['z1']) / 2, r['id'] + '（關）', font=FONTS); continue
        if r['kind'] == 'lecture':
            A.rect(r['x0'] + 0.1, r['stageEdge'], r['x1'] - 0.1, r['z1'] - 0.1, fill=C['stage'])
            for q in r['rowsData']: A.rect(r['seatX0'], q['deskZ'] - r['deskD'] / 2, r['seatX1'], q['deskZ'] + r['deskD'] / 2, fill=C['desk'])
            for s in r['seats']: chair(A, s['x'], s['z'], s['yaw'], C['seat'])
            A.text((r['x0'] + r['x1']) / 2, r['z1'] - 1.2, f"{r['id']}　{len(r['seats'])} 席（排距 2.0 m）", font=FONTB)
    groups(A)
    e = L['entrance']; A.rect(e['a0'], D / 2 - 0.15, e['a1'], D / 2 + 0.15, fill='white'); A.text(0, D / 2 + 0.9, '入口', font=FONTS)
    return A


# ---------------- B：R2 修正版，一樓 ----------------
def plan_r2rev_1f():
    B = Plan('R2 修正版（PROPOSAL）一樓：外觀、入口、樓梯、101／102 的門都不動', W, D)
    # 牆：101｜大廳｜102/103
    B.line(-6.0, -8.9, -6.0, 5.4); B.line(-6.0, 6.6, -6.0, 8.9); B.door(-6.0, 5.4, 6.6)
    B.line(6.0, -8.9, 6.0, -8.4); B.line(6.0, -7.2, 6.0, 5.4); B.line(6.0, 6.6, 6.0, 8.9); B.door(6.0, 5.4, 6.6); B.door(6.0, -8.4, -7.2)
    B.line(6.0, 0.0, 16.9, 0.0)
    # 101：挑高、12 排×16 席、講台在南端、門在講台那一端（和現在一樣）
    sx = [-15.35 + 0.52 * k for k in range(16)]
    hall(B, -16.9, -6.0, (4.0, 8.9), [3.3 - r for r in range(12)], +1, sx, lambda r: 0.25 + 0.05 * r, '博雅 101（挑高到屋頂）', '12 排×16 席＝192\n排距 1.0 m、每排高 0.16 m（最後一排 1.92 m）')
    B.rect(-16.9, -8.9, -15.7, 4.0, fill=C['aisle']); B.rect(-7.2, -8.9, -6.0, 4.0, fill=C['aisle']); B.rect(-15.7, -8.9, -7.2, -8.1, fill=C['aisle'])
    B.text(-11.45, -8.5, '後走道', font=FONTS)
    # 102（東南）：講台在南、門不動；103（東北）：講台在北、門在北端（樓梯北邊的通道進去）
    sx2 = [7.55 + 0.52 * k for k in range(16)]
    hall(B, 6.0, 16.9, (6.0, 8.9), [5.3 - r for r in range(5)], +1, sx2, lambda r: 0.3 + 0.06 * r, '博雅 102', '5 排×16＝80 席')
    hall(B, 6.0, 16.9, (-8.9, -6.0), [-5.3 + r for r in range(5)], -1, sx2, lambda r: 0.3 + 0.06 * r, '博雅 103', '5 排×16＝80 席（和 102 背對背）')
    for z0, z1 in ((0.0, 0.9), (-0.9, 0.0)): B.rect(7.2, z0, 15.7, z1, fill=C['aisle'])
    for (z0, z1) in ((0.0, 6.0), (-6.0, 0.0)): B.rect(6.0, z0, 7.2, z1, fill=C['aisle']); B.rect(15.7, z0, 16.9, z1, fill=C['aisle'])
    # 樓梯（不動）
    st = L['stair']; B.rect(st['well']['x0'], st['well']['z0'], st['well']['x1'], st['well']['z1'], fill=C['stair']); B.text(3.9, -3.8, '樓梯', font=FONTS); B.text(2.9, -0.6, '↑上樓', font=FONTS)
    # 大廳的自習區：沿用 LAWWW 的第二版（開發分支 4e2db1f：12 張雙人小桌、2 張圓桌、窗邊沙發）——R2 修正版不動它
    groups(B)
    B.text(-2.4, 5.4, '桌椅區 12 張（24 席）', fill=C['note'], font=FONTS)
    B.text(3.6, 5.7, '圓桌 2 張（8 席）', fill=C['note'], font=FONTS)
    # 103 搬走之後空出來的西北角
    B.rect(-5.9, -8.8, -1.3, -5.3, outline=C['note'], width=2); B.text(-3.6, -7.9, '空出來', fill=C['note'], font=FONTS); B.text(-3.6, -7.1, '（原本的 103）', fill=C['note'], font=FONTS); B.text(-3.6, -6.3, '可放圓桌或沙發', fill=C['note'], font=FONTS)
    B.rect(-1.1, -8.85, 0.3, -8.6, fill='#333333'); B.rect(0.7, -8.85, 1.9, -8.6, fill='#8a6a3a'); B.text(0.4, -8.2, '講座資訊・公告欄', font=FONTS)
    B.text(3.5, -7.75, '→ 103 的門', fill=C['door'], font=FONTS)
    e = L['entrance']; B.rect(e['a0'], D / 2 - 0.15, e['a1'], D / 2 + 0.15, fill='white'); B.text(0, D / 2 + 0.9, '入口（不動）', font=FONTS)
    return B


# ---------------- C：R2 修正版，二樓 ----------------
def plan_r2rev_2f():
    Cp = Plan('R2 修正版（PROPOSAL）二樓：101 上面挑空；201 搬到東南、202 不動；空橋不動', W, D)
    Cp.rect(-16.9, -8.9, -6.0, 8.9, fill=C['void']); Cp.text(-11.45, 0, '101 挑空（看下去是講堂）', font=FONTB)
    Cp.line(-6.0, -8.9, -6.0, 8.9)
    Cp.line(6.0, -8.9, 6.0, -0.4); Cp.line(6.0, 2.4, 6.0, 8.9); Cp.line(6.0, -0.4, 16.9, -0.4); Cp.line(6.0, 2.4, 16.9, 2.4)
    Cp.line(6.0, -0.4, 6.2, -0.4); Cp.door(15.0, -0.4, 16.2, horiz=True); Cp.door(15.0, 2.4, 16.2, horiz=True)
    Cp.rect(6.1, -8.8, 16.8, -0.5, fill='#f3efe6'); Cp.text(11.45, -4.6, '博雅 202（不動）', font=FONTB)
    Cp.rect(6.1, 2.5, 16.8, 8.8, fill='#f3efe6'); Cp.text(11.45, 5.3, '博雅 201（從西北搬來）', font=FONTB); Cp.text(11.45, 6.3, '取代關著的 204', font=FONTS)
    Cp.rect(-6.0, -0.4, 16.9, 2.4, fill=C['aisle']); Cp.text(5.4, 1.0, '二樓走廊（西端到 101 的牆為止；牆上可以開一扇看進 101 的窗）', font=FONTS)
    st = L['stair']; Cp.rect(st['well']['x0'], st['well']['z0'], st['well']['x1'], st['well']['z1'], fill=C['stair']); Cp.text(3.9, -3.8, '樓梯', font=FONTS)
    Cp.rect(-4.4, 6.6, -2.0, 8.9, fill='#eeeeee'); Cp.door(-3.8, 6.6, -2.6, horiz=True); Cp.text(-3.2, 7.75, '空橋', font=FONTS)
    Cp.text(-1.0, -5.0, '二樓大廳（不動）', font=FONT)
    return Cp


A, B, Cp = plan_now(), plan_r2rev_1f(), plan_r2rev_2f()
im = Image.new('RGB', (A.im.size[0], A.im.size[1] + B.im.size[1] + Cp.im.size[1] + 20), 'white')
im.paste(A.im, (0, 0)); im.paste(B.im, (0, A.im.size[1] + 10)); im.paste(Cp.im, (0, A.im.size[1] + B.im.size[1] + 20))
im.save(OUT)
print('wrote', OUT, im.size)
