"""社團博覽會（大一 2025-09-06、大二 2026-09-12）：椰林大道兩邊 36 頂帳篷＋舞台（CLUBFAIR-REAL-1027，AA_485 第 3 節；LAWWW2-C 2026-10-27）→ GLB。
  /opt/blenv/bin/python tools/blender/env_second/club_fair_expo.py [-- --out assets/models/env/second_ai/club_fair_expo.glb]

配置讀 src/data/club_fair_expo_layout.js（遊戲讀同一份：導航阻擋、互動點的 front）。帳篷沿用 club_fair.py 的做法（折疊帳篷、四邊垂簾印社名、背板、桌巾、
折疊椅、傳單、報名表、易拉展；同一張貼圖集），只是：
  - 36 攤＋舞台的字放進一張 2048×2048 的貼圖集（club_fair_expo_atlas.png；字是 WenQuanYi Zen Hei，只畫進貼圖）；
  - 全部照配置的世界座標烘進**一個網格、一個材質**（club_fair_expo_all：一個 draw call，約 3 萬三角形）；遊戲把整組放在 (0,0,0)。
  - 舞台：台面（黑色裙布）、前面兩邊的台階、後面的鋁桁架＋大背板（印「社團博覽會」）、兩邊的喇叭架、麥克風架。
招牌只寫社團類型的名稱（D77：不用真實社團的標誌、名稱）。校慶、經濟系那一年的社博照舊用 club_fair.glb（九頂）。"""
import json, math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, g2b, bpy   # noqa: E402
from pmesh import PM, T, Ry, Rx, box, bar, to_blender   # noqa: E402
import club_fair as CF   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/club_fair_expo.glb'
LAY = json.loads(subprocess.check_output(['node', '-e', "const fs=require('fs');const t=fs.readFileSync('src/data/club_fair_expo_layout.js','utf8');"
                                          "process.stdout.write(JSON.stringify(JSON.parse(t.slice(t.lastIndexOf('const CLUB_FAIR_EXPO=')+21).trim().replace(/;\\s*$/,''))))"], cwd=L.ROOT))

# ---------------- 攤位（招牌、桌巾、標語、顏色）----------------
SLOGAN = {'join': '新生招募中・第一次社課免費', 'look': '新生招募中', 'info': '社團地圖・活動資訊', 'bg': '歡迎來看看'}
PALETTE = ['#3f6e45', '#2b4576', '#c4702a', '#a3333a', '#5b86b8', '#b8945a', '#6aa07c', '#7a4f8c', '#2f7f86', '#c4503a', '#4a5a8c', '#8c6a2a',
           '#3b7a5a', '#9a3f6a', '#d08a2a', '#466e9a', '#6b8c3a', '#a0522d', '#2d6a8a', '#8a3a3a']
SPECIAL = {   # 原本 club_fair.py 的六攤：顏色、桌巾字、標語照舊（motif、背板的圖照 id 畫）
    'hiking': ('登山社', '一起去爬山', '#3f6e45', '#2f4f6a'), 'lawclub': ('法服', '讀書會・法律服務', '#2b4576', '#c9a54e'),
    'info': ('服務台', '社團地圖・活動資訊', '#5a6c80', '#d8a33a'), 'guitar': ('吉他社', '新生招募中・歡迎試彈', '#c4702a', '#3b2a22'),
    'debate': ('辯論社', '來辯一場', '#a3333a', '#1f2f4a'), 'basketball': ('系學會', '系籃新血招募', '#d0622a', '#1c1c1e')}
BOOTHS = []
for i, t in enumerate(LAY['tents']):
    bid = t['id']
    if bid in SPECIAL:
        cloth, slogan, c1, c2 = SPECIAL[bid]
    else:
        cloth = t['label'][:6]; slogan = SLOGAN[t['kind']]; c1 = PALETTE[i % len(PALETTE)]; c2 = '#f2efe6' if i % 3 else '#1f2630'
    canopy = 'blue' if i % 5 == 2 else 'white'
    BOOTHS.append((bid, t['label'], cloth, slogan, c1, c2, canopy))
IDS = [b[0] for b in BOOTHS]
STANDEE = {'hiking', 'lawclub', 'guitar', 'debate', 'basketball', 'dance', 'chorus', 'photo', 'magic', 'coffee', 'film'}
PROPS = {'guitar': 'guitar', 'lawclub': 'lawclub', 'debate': 'debate', 'hiking': 'hiking', 'basketball': 'basketball', 'info': 'info',
         'photo': 'bg1', 'boardgame': 'bg2', 'bg_pottery': 'bg3', 'bg_callig': 'bg3', 'bg_astro': 'bg1', 'film': 'bg1'}

# ---------------- 貼圖集（2048×2048）----------------
NW = NH = 2048
REG = {}
for i, bid in enumerate(IDS):
    REG['val_' + bid] = (0, i * 38, 512, i * 38 + 38)                                                         # 垂簾 3.0×0.22 m（36×38＝1368）
    REG['cloth_' + bid] = (512 + (i % 2) * 256, (i // 2) * 98, 768 + (i % 2) * 256, (i // 2) * 98 + 98)          # 桌巾 1.85×0.70（18 列＝1764）
    REG['ban_' + bid] = (1024 + (i % 4) * 256, (i // 4) * 119, 1280 + (i % 4) * 256, (i // 4) * 119 + 119)       # 背板 2.8×1.3（9 列＝1071）
for i, bid in enumerate([b for b in IDS if b in STANDEE]):
    REG['std_' + bid] = ((i % 4) * 128, 1376 + (i // 4) * 220, (i % 4) * 128 + 128, 1376 + (i // 4) * 220 + 220)   # 易拉展 0.8×2.0（3 列＝660）
for name, (x0, y0, x1, y1) in CF.MISC.items():                                                                # 傳單、報名表、各社的小東西：搬到 (1024, 1080) 起
    REG[name] = (x0 + 512, y0 + 590, x1 + 512, y1 + 590)
REG['stage_ban'] = (1024, 1540, 2048, 1796)     # 舞台背板 8.4×2.1 m
REG['stage_skirt'] = (1024, 1796, 2048, 1860)   # 台面裙布 9×0.8 m（左右重複）
REG['speaker'] = (1536, 1860, 1600, 1988)       # 喇叭面網
SW = dict(CF.SW)
for bid, _, _, _, c1, c2, _ in BOOTHS:
    SW['c1_' + bid] = (CF.hex2rgb(c1), 0.85, 0.0); SW['c2_' + bid] = (CF.hex2rgb(c2), 0.85, 0.0)
SW.update({'stage_top': ((58, 52, 46), 0.7, 0.0), 'stage_black': ((24, 24, 26), 0.75, 0.0), 'truss': ((196, 200, 206), 0.35, 0.5)})
SWC = 32
for i, k in enumerate(SW):
    cx, cy = 512 + (i % 16) * SWC, 1768 + (i // 16) * SWC   # 桌巾下面那一塊（x 512–1024、y 1768–2048）
    if cy + SWC > NH: raise SystemExit('色塊放不下：' + str(len(SW)))
    REG['sw_' + k] = (cx, cy, cx + SWC, cy + SWC)
ATLAS, ATLAS_ORM = os.path.join(CF.GEN, 'club_fair_expo_atlas.png'), os.path.join(CF.GEN, 'club_fair_expo_orm.png')
# club_fair.py 的函式讀模組層的這些名字：換成這一份的
CF.BOOTHS, CF.IDS, CF.REG, CF.SW, CF.NW, CF.NH, CF.SWC = BOOTHS, IDS, REG, SW, NW, NH, SWC
CF.ORM_REG.update({'stage': 0.8, 'speaker': 0.85})


def paint_stage(P):
    s = P.sub('stage_ban'); w, h = s.size; d = ImageDraw.Draw(s)
    g = np.linspace(0, 1, w)[None, :, None]; a = np.array((40, 70, 120))[None, None] * (1 - g) + np.array((150, 60, 90))[None, None] * g
    s = Image.fromarray((a * np.ones((h, 1, 1))).astype(np.uint8)); d = ImageDraw.Draw(s); rng = np.random.default_rng(906)
    for k in range(26):   # 彩色的小方塊、圓（各社團的顏色）
        x, y, r = rng.uniform(0, w), rng.uniform(0, h), rng.uniform(0.03, 0.09) * h; c = CF.hex2rgb(PALETTE[k % len(PALETTE)])
        (d.ellipse if k % 2 else d.rectangle)([x - r, y - r, x + r, y + r], fill=tuple(min(255, int(v * 1.25)) for v in c))
    W_ = (250, 250, 248)
    P.ctext(d, w / 2, h * 0.4, '社團博覽會', h * 0.34, W_, maxw=w * 0.7)
    P.ctext(d, w / 2, h * 0.75, '新生社團聯展　10:00－16:00　舞台表演 10:30－15:30', h * 0.09, W_, bold=False, maxw=w * 0.8)
    P.put('stage_ban', CF.noise(s, 2.0, 907))
    s = P.sub('stage_skirt'); w, h = s.size; d = ImageDraw.Draw(s); d.rectangle([0, 0, w, h], fill=(24, 24, 26))
    for k in range(0, w, 6 * CF.SS): d.line([(k, 0), (k, h)], fill=(34, 34, 36), width=2)
    P.ctext(d, w / 2, h / 2, '社團博覽會', h * 0.42, (230, 230, 226), maxw=w * 0.4); P.put('stage_skirt', s)
    s = P.sub('speaker'); w, h = s.size; d = ImageDraw.Draw(s); d.rectangle([0, 0, w, h], fill=(20, 20, 22))
    for cy, r in ((h * 0.3, w * 0.36), (h * 0.72, w * 0.22)): d.ellipse([w / 2 - r, cy - r, w / 2 + r, cy + r], fill=(44, 44, 48)); d.ellipse([w / 2 - r * 0.3, cy - r * 0.3, w / 2 + r * 0.3, cy + r * 0.3], fill=(70, 70, 74))
    P.put('speaker', s)


def repaint_banner(P, i, bid, title, cloth, slogan, c1, c2):
    """原本六攤以外的背板：club_fair.py 的背景攤圖形會蓋到字（白色方塊、白字）——圖形只畫在左邊三成，字在右邊"""
    C1, C2 = CF.hex2rgb(c1), CF.hex2rgb(c2); W_ = (250, 250, 248)
    w, h = (REG['ban_' + bid][2] - REG['ban_' + bid][0]) * CF.SS, (REG['ban_' + bid][3] - REG['ban_' + bid][1]) * CF.SS
    g = np.linspace(0, 1, h)[:, None, None]; arr = np.array(C1)[None, None] * (1 - g * 0.35) + np.array((20, 24, 30))[None, None] * (g * 0.35)
    b = Image.fromarray((arr * np.ones((1, w, 1))).astype(np.uint8)); d = ImageDraw.Draw(b); rng = np.random.default_rng(170 + i)
    for k in range(6):
        x, y, s = rng.uniform(0.04, 0.3) * w, rng.uniform(0.15, 0.85) * h, rng.uniform(0.07, 0.15) * h
        col = (C2, tuple(min(255, int(v * 1.3)) for v in C1), tuple(int(v * 0.7) for v in C1))[k % 3]
        (d.ellipse if k % 2 else d.rectangle)([x - s, y - s, x + s, y + s], fill=col)
    P.ctext(d, w * 0.66, h * 0.4, cloth, h * 0.24, W_, maxw=w * 0.6)
    P.ctext(d, w * 0.66, h * 0.7, slogan, h * 0.1, W_, bold=False, maxw=w * 0.6)
    P.put('ban_' + bid, CF.noise(b, 2.5, 80 + i))


def make_textures():
    P = CF.Painter()
    for i, bk in enumerate(BOOTHS):
        CF.paint_booth(P, *bk[:6], bk[6], i)
        if bk[0] not in SPECIAL: repaint_banner(P, i, *bk[:6])
    CF.paint_misc(P); paint_stage(P)
    os.makedirs(CF.GEN, exist_ok=True)
    P.im.resize((NW, NH), Image.LANCZOS).save(ATLAS)
    O = 256; orm = np.zeros((O, O, 3), np.uint8); orm[..., 0] = 255; orm[..., 1] = int(0.8 * 255); fx, fy = O / NW, O / NH
    for name, (x0, y0, x1, y1) in REG.items():
        if name.startswith('sw_'): rough, metal = SW[name[3:]][1:]
        else: rough, metal = CF.ORM_REG.get(name.split('_')[0], 0.8), 0.0
        orm[int(y0 * fy):int(math.ceil(y1 * fy)), int(x0 * fx):int(math.ceil(x1 * fx)), 1] = int(rough * 255)
        orm[int(y0 * fy):int(math.ceil(y1 * fy)), int(x0 * fx):int(math.ceil(x1 * fx)), 2] = int(metal * 255)
    Image.fromarray(orm).save(ATLAS_ORM)


def expo_booth(bid, canopy, has_title):
    pm = PM()
    CF.frame_tent(pm, bid, canopy); CF.back_banner(pm, bid); CF.table(pm, bid, plain=not has_title)
    for x in (-0.45, 0.45): CF.chair(pm, x, CF.TBL_Z - 0.75, math.pi + (0.15 if x > 0 else -0.1))
    if 'std_' + bid in REG: CF.standee(pm, bid, -1.12, 1.05, -math.pi / 4)
    CF.table_items(pm, bid, not has_title)
    if bid in PROPS: CF.props(pm, PROPS[bid])
    return pm


def stage(S):
    pm = PM(); w, d, h = S['w'], S['d'], S['h']; x0, x1, z0, z1 = -w / 2, w / 2, -d / 2, d / 2
    ruv = CF.ruv; sw = CF.sw
    # 台面＋前面、兩側的裙布（印字）
    box(pm, x0, x1, h - 0.06, h, z0, z1, {'t': sw('stage_top'), '*': sw('stage_black')}, faces='tfkrl')
    for (a, b, n) in (((x0, z1), (x1, z1), (0, 0, 1)), ((x1, z0), (x0, z0), (0, 0, -1)), ((x1, z1), (x1, z0), (1, 0, 0)), ((x0, z0), (x0, z1), (-1, 0, 0))):
        pts = [(a[0], 0.0, a[1]), (b[0], 0.0, b[1]), (b[0], h - 0.06, b[1]), (a[0], h - 0.06, a[1])]; L_ = math.hypot(b[0] - a[0], b[1] - a[1])
        pm.poly(pts, (lambda p, a=a, L_=L_: ruv('stage_skirt', ((math.hypot(p[0] - a[0], p[2] - a[1]) / L_) * (L_ / 4.5)) % 1.0, p[1] / (h - 0.06))) if n[2] > 0 else sw('stage_black'), n)
    # 台階（前面兩邊各三階）
    for sx in (-1, 1):
        for k in range(3):
            hh = h * (k + 1) / 4; zz = z1 + 0.9 - k * 0.3
            box(pm, sx * (w / 2 - 1.3) - 0.5, sx * (w / 2 - 1.3) + 0.5, 0.0, hh, z1, zz, {'t': sw('stage_top'), '*': sw('stage_black')}, faces='tfrl')
    # 後面的桁架（兩根柱、上面的橫梁；方形斷面的格子桁架）＋背板
    bz = z0 + 0.25; top = h + 3.2
    for sx in (-1, 1):
        cx = sx * (w / 2 - 0.15)
        for ox in (-0.13, 0.13):
            for oz in (-0.13, 0.13): bar(pm, (cx + ox, 0.0, bz + oz), (cx + ox, top, bz + oz), 0.025, 0.025, sw('truss'))
        for k in range(14):
            y0_, y1_ = k * top / 14, (k + 1) * top / 14; bar(pm, (cx - 0.13, y0_, bz - 0.13), (cx + 0.13, y1_, bz - 0.13), 0.01, 0.01, sw('truss')); bar(pm, (cx - 0.13, y0_, bz + 0.13), (cx + 0.13, y1_, bz + 0.13), 0.01, 0.01, sw('truss'))
    for oy in (-0.13, 0.13):
        for oz in (-0.13, 0.13): bar(pm, (x0 + 0.15, top - 0.13 + oy, bz + oz), (x1 - 0.15, top - 0.13 + oy, bz + oz), 0.025, 0.025, sw('truss'))
    bx0, bx1, by0, by1 = x0 + 0.45, x1 - 0.45, h + 0.6, top - 0.35
    pts = [(bx0, by0, bz + 0.16), (bx1, by0, bz + 0.16), (bx1, by1, bz + 0.16), (bx0, by1, bz + 0.16)]
    pm.poly(pts, lambda p: ruv('stage_ban', (p[0] - bx0) / (bx1 - bx0), (p[1] - by0) / (by1 - by0)), (0, 0, 1)); pm.poly([(p[0], p[1], p[2] - 0.004) for p in pts], sw('stage_black'), (0, 0, -1))
    # 兩邊的喇叭（腳架上）、麥克風架
    for sx in (-1, 1):
        cx = sx * (w / 2 + 0.6); bar(pm, (cx, 0.0, z1 - 0.6), (cx, 1.7, z1 - 0.6), 0.03, 0.03, sw('tripod'))
        for k in range(3):
            a = 2 * math.pi * k / 3; bar(pm, (cx + 0.45 * math.cos(a), 0.0, z1 - 0.6 + 0.45 * math.sin(a)), (cx, 0.9, z1 - 0.6), 0.015, 0.015, sw('tripod'))
        box(pm, cx - 0.26, cx + 0.26, 1.7, 2.5, z1 - 0.86, z1 - 0.34, {'f': lambda p, cx=cx: ruv('speaker', (p[0] - cx + 0.26) / 0.52, (p[1] - 1.7) / 0.8), '*': sw('stage_black')}, faces='tbfkrl')
    bar(pm, (0.6, h, z1 - 0.8), (0.6, h + 1.45, z1 - 0.8), 0.012, 0.012, sw('tripod')); bar(pm, (0.6, h + 1.45, z1 - 0.8), (0.6, h + 1.5, z1 - 0.62), 0.018, 0.018, sw('black'))
    return pm


def build():
    make_textures()
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=2048)
    root = B.group('club_fair_expo', props={'kind': 'club_fair_expo', 'layout': LAY['version']})
    mat = bpy.data.materials.new('club_fair_expo'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
    mat.use_backface_culling = True
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS); tx.image.pack(); nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
    to = nt.nodes.new('ShaderNodeTexImage'); to.image = bpy.data.images.load(ATLAS_ORM); to.image.colorspace_settings.name = 'Non-Color'; to.image.pack()
    sp = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(to.outputs['Color'], sp.inputs['Color'])
    nt.links.new(sp.outputs['Green'], bsdf.inputs['Roughness']); nt.links.new(sp.outputs['Blue'], bsdf.inputs['Metallic'])
    allpm = PM(); per = {}
    for (bid, title, cloth, slogan, c1, c2, canopy), t in zip(BOOTHS, LAY['tents']):
        pm = expo_booth(bid, canopy, True); per[bid] = pm.tris(); allpm.add(pm, T(t['x'], 0, t['z']) @ Ry(t['ry']))
    S = LAY['stage']; sp_ = stage(S); allpm.add(sp_, T(S['x'], 0, S['z']) @ Ry(S['ry']))
    to_blender(allpm, 'club_fair_expo_all', mat, root, B, g2b, bpy)
    info = L.export(out, gpu_instances=False)
    info.update({'tents': len(BOOTHS), 'tris_per_tent': per, 'stage_tris': sp_.tris(), 'atlas': [os.path.relpath(p, L.ROOT) for p in (ATLAS, ATLAS_ORM)],
                 'origin': '世界座標（校園區域）：整組放在 (0,0,0)；位置照 src/data/club_fair_expo_layout.js', 'layout': LAY['version']})
    L.write_json(out[:-4] + '.json', info)
    print(json.dumps({'tents': len(BOOTHS), 'tris': info['tris'], 'stage': sp_.tris()}, ensure_ascii=False))


if __name__ == '__main__':
    build()
