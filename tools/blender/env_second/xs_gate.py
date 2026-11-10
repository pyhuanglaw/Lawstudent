"""新生南路側門的正式門柱、鐵門、校園圍牆（X246，XS-GATE-FORMAL-1110；LAWWW2 帳號 A 2026-11-10）→ assets/models/env/second_ai/xs_gate.glb（＋.json）。
使用者 11-05 08:0x「台大新生南路側門改成我的照片的樣子」（USER_WANTS X246；照片有著作權疑慮，沒進 repo）；
配置 sideGate.note：「門柱寫『首都帝大』、鐵柵門開著、門柱上一盞燈」。LAWWW 11-10 13:39 派：門柱、鐵門、圍牆的正式模型（D38 近景），
導航、門洞、候車亭位置不動；draw call 盡量不加（共用磚、石材材質）。D136 像但不照抄：
  - 圍牆：花崗石勒腳＋紅磚矮牆＋石材壓頂，上面一排鑄鐵欄杆（看得到牆裡面的校園），每 5.4 m 一根紅磚牆墩、石材柱帽；
    街那一面平的（人行道花台靠牆，xs_planters.py 的 WALL_IN＝牆中心 −0.2 m），牆墩只往上長、不往人行道凸。
  - 門柱：花崗石柱礎＋紅磚柱身＋石材腰帶、三層出挑的柱帽，頂上一盞鑄鐵燈籠（和校門 campus_gate.py 同一套語彙，尺寸小一號）；北邊門柱面向馬路掛直式石牌「首都帝大」。
  - 鐵門：兩扇，白天開著，往校內打開、和圍牆垂直（和校門一樣），不擋門洞。
  - 範圍：近景 z −68～68（套件那兩段牆、兩根門柱），加上遠景兩頭（北到 z −178；南到路口前 z 72.4 轉角往東到 x 150）——
    遠景的套件牆也換掉，接頭才不會一邊磚牆一邊色塊。
座標：新生南路區域（x 往東＝校園，z 往南，y 朝上），GLB 原點＝區域原點。導航不讀這個模型（照舊是 xinsheng3d.js 套件那幾個 blockRect）。
  /opt/blenv/bin/python tools/blender/env_second/xs_gate.py [-- --out <glb>] [--layout <xinsheng_layout.js>]"""
import json, math, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, bpy, g2b   # noqa: E402
from cafe_layout import uv01   # noqa: E402
import archkit as K   # noqa: E402
from PIL import Image, ImageDraw   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/xs_gate.glb'))
LAYF = os.path.abspath(arg('--layout', os.path.join(L.ROOT, 'src/data/xinsheng_layout.js')))
LAY = json.loads(subprocess.check_output(['node', '-e', "global.window=global; eval(require('fs').readFileSync(process.argv[1],'utf8').replace(/^const /m,'global.')); process.stdout.write(JSON.stringify(XINSHENG_LAYOUT))", LAYF]))
GEN = os.path.join(HERE, 'textures', 'gen'); os.makedirs(GEN, exist_ok=True)

CW, SG = LAY['campusWall'], LAY['sideGate']
X = CW['x']                                   # 牆中心 18.4
T = 0.2                                       # 半個牆厚：街那一面 x−0.2（花台靠這一面）、校內那一面 x+0.2
FAR = dict(zN=-178.0, zc=72.4, xE=150.0)      # xinsheng3d.js S.FAR：北到 zN；南端路口前 zc＝armS[0]−1.6 轉角往東到 x 150（和套件的遠景牆一樣）
PIER = 5.4                                    # 牆墩間距
GP = [CW['gateGap'][0], CW['gateGap'][1]]     # 兩根門柱的中心 z（6.8、13.2）
PS = 0.9                                      # 門柱柱身寬
BRICK, STONE, IRON = '#9e5a44', '#c9bfae', '#22252a'
Y_PL, Y_BR, Y_CP, Y_RL = 0.35, 0.95, 1.07, 1.95   # 勒腳頂、磚牆頂、壓頂頂、欄杆頂
Y_PI = 2.05                                   # 牆墩柱身頂（再加 0.15 柱帽）
PH = 3.0                                      # 門柱柱身頂

# ---------- 欄杆貼圖（本作 PIL：透明底、直條＋上下橫條＋頂上的尖頭；一張＝1.2 m 寬、欄杆的高）----------
RAIL_W = 1.2
def rail_png():
    p = os.path.join(GEN, 'xs_gate_rail.png'); W, H = 256, 192; im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im); c = (34, 37, 42, 255)
    n = 8
    for k in range(n):
        x = (k + 0.5) * W / n; d.rectangle([x - 2.5, 14, x + 2.5, H], fill=c); d.polygon([(x - 6, 16), (x + 6, 16), (x, 0)], fill=c)   # 直條＋尖頭
    for y in (24, H - 12): d.rectangle([0, y - 3, W, y + 3], fill=c)                                                             # 上下橫條
    for k in range(n):                                                                                                             # 橫條之間每兩根一個小圓環（像但不照抄）
        if k % 2: continue
        x = (k + 1.0) * W / n; d.ellipse([x - 9, H * 0.52 - 9, x + 9, H * 0.52 + 9], outline=c, width=3)
    im.save(p); return p

def img_mat(name, fn, rough=0.5):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; Lk = nt.links; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    bs.inputs['Metallic'].default_value = 0.3
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(fn); Lk.new(tx.outputs['Color'], bs.inputs['Base Color'])
    r = N.new('ShaderNodeMath'); r.operation = 'ROUND'; Lk.new(tx.outputs['Alpha'], r.inputs[0]); Lk.new(r.outputs[0], bs.inputs['Alpha'])
    try: m.surface_render_method = 'DITHERED'
    except Exception: pass
    m.use_backface_culling = False; return m


def build():
    B.reset(texres=512)
    root = B.group('xs_gate', props={'kind': 'xs_gate', 'note': 'X246 新生南路側門正式門柱、鐵門、圍牆（xinsheng3d.js 用 attachWenzhouModel 接，標記 xsGate 的套件藏起來；導航照舊）'})
    M = {
        'wall': L.pbr('xg_brick', 'red_brick', tile=1.6, target=BRICK, sat=0.85, normal=0.8, maps=('diff', 'nor'), rough_value=0.88),
        'trim': L.pbr('xg_stone', 'sandstone_blocks_08', tile=3.0, sat=0.45, target=STONE, normal=0.6, maps=('diff', 'nor'), res=512, rough_value=0.8),
        'base': L.pbr('xg_base', 'granite_tile_03', tile=1.2, target='#8f8a82', maps=('diff',), res=256, rough_value=0.7),
        'misc': L.vc_material('xg_misc', rough=0.5),
        'lamp': L.flat('wz_lamp_lens', '#f3ead6', rough=0.4),
        'board': L.flat('ck_board', '#d8d0c0', rough=0.8),
    }
    accs = {}; VC = ('misc',); plates = []; glows = []
    kit = K.Kit(M, accs, 'xg_', place=(0.0, 0.0, 0.0), vc=VC)
    rail = Mesh('xg_rail', img_mat('xg_rail', rail_png()))

    # ---------- 一段圍牆：沿 z（x＝X 那一條）或沿 x（南端轉角往東那一條，z＝zc）----------
    def wall_run(axis, a, b, c, end_a=True, end_b=True):
        """axis 'z'：牆沿 z 從 a 到 b、牆中心 x＝c；axis 'x'：牆沿 x 從 a 到 b、牆中心 z＝c。end_*：那一端要不要封面（接門柱、轉角的那一端不封）"""
        def bx(m, u0, u1, y0, y1, h0, h1, skip=()):
            if axis == 'z': kit.box(m, c + h0, c + h1, y0, y1, u0, u1, skip=skip)
            else: kit.box(m, u0, u1, y0, y1, c + h0, c + h1, skip=skip)
        ends = lambda: (() if end_a else (('back',) if axis == 'z' else ('left',))) + (() if end_b else (('front',) if axis == 'z' else ('right',)))
        bx('base', a, b, 0.0, Y_PL, -T - 0.03, T + 0.03, skip=('bottom',) + ends())                    # 花崗石勒腳
        bx('wall', a, b, Y_PL, Y_BR, -T, T, skip=('bottom', 'top') + ends())                           # 紅磚矮牆
        bx('trim', a, b, Y_BR, Y_CP, -T - 0.04, T + 0.04, skip=('bottom',) + ends())                   # 石材壓頂
        n = max(1, round((b - a) / PIER)); step = (b - a) / n
        piers = [a + step * k for k in range(n + 1)]
        for k, u in enumerate(piers):                                                                   # 牆墩（兩端的牆墩收在段內）
            u0, u1 = max(a, u - 0.31), min(b, u + 0.31)
            bx('wall', u0, u1, Y_CP, Y_PI, -T + 0.01, T - 0.01, skip=('bottom',))
            for (s, t_, ov) in ((0.0, 0.08, 0.05), (0.08, 0.15, 0.02)):
                bx('trim', u0 - ov, u1 + ov, Y_PI + s, Y_PI + t_, -T - ov + 0.01, T + ov - 0.01, skip=('bottom',) if s > 0 else ())
        for k in range(len(piers) - 1):                                                                 # 牆墩之間的欄杆（一片貼圖卡，兩面看得到）
            u0, u1 = piers[k] + 0.31, piers[k + 1] - 0.31
            if u1 - u0 < 0.3: continue
            ua, ub = u0 / RAIL_W, u1 / RAIL_W
            if axis == 'z': pts = [(c, Y_CP, u0), (c, Y_CP, u1), (c, Y_RL, u1), (c, Y_RL, u0)]
            else: pts = [(u0, Y_CP, c), (u1, Y_CP, c), (u1, Y_RL, c), (u0, Y_RL, c)]
            f = rail.bm.faces.new([rail.bm.verts.new(g2b(*p)) for p in pts]); lay = rail.bm.loops.layers.uv.get('UVMap') or rail.bm.loops.layers.uv.new('UVMap')
            for lp, uv in zip(f.loops, [(ua, 0.0), (ub, 0.0), (ub, 1.0), (ua, 1.0)]): lp[lay].uv = uv

    G0, G1 = GP[0] - PS / 2, GP[1] + PS / 2
    wall_run('z', FAR['zN'], G0, X, end_b=False)                    # 北段（遠景接過來）到北邊門柱
    wall_run('z', G1, FAR['zc'] - T, X, end_a=False, end_b=False)   # 南邊門柱到南端轉角
    wall_run('x', X - T, FAR['xE'], FAR['zc'], end_a=False)         # 南端轉角往東

    # ---------- 門柱 ----------
    def post(z, plate_text=None):
        h = PS / 2; b = 0.5
        kit.box('base', X - b, X + b, 0.0, 0.5, z - b, z + b, skip=('bottom',))                                          # 柱礎
        kit.box('trim', X - h - 0.03, X + h + 0.03, 0.5, 0.62, z - h - 0.03, z + h + 0.03, skip=('bottom',))            # 收頭
        kit.box('wall', X - h, X + h, 0.62, PH, z - h, z + h, skip=('bottom', 'top'))                                     # 紅磚柱身
        kit.box('trim', X - h - 0.03, X + h + 0.03, 2.35, 2.47, z - h - 0.03, z + h + 0.03)                             # 腰帶
        for (s, t_, w) in ((0.0, 0.12, h + 0.06), (0.12, 0.27, h + 0.13), (0.27, 0.36, h + 0.06)):                       # 柱帽：三層出挑
            kit.box('trim', X - w, X + w, PH + s, PH + t_, z - w, z + w, skip=('bottom',) if s > 0 else ())
        yb = PH + 0.36
        kit.box('misc', X - 0.1, X + 0.1, yb, yb + 0.18, z - 0.1, z + 0.1, skip=('bottom',), col=IRON)                    # 燈座
        y0, y1, r = yb + 0.18, yb + 0.72, 0.17
        for (a, b2) in (((-r, -r), (r, -r)), ((r, -r), (r, r)), ((r, r), (-r, r)), ((-r, r), (-r, -r))):                # 燈籠：四面乳白玻璃＋鑄鐵框
            kit.face('lamp', [(X + a[0] * 0.9, y0 + 0.04, z + a[1] * 0.9), (X + b2[0] * 0.9, y0 + 0.04, z + b2[1] * 0.9), (X + b2[0] * 0.9, y1 - 0.04, z + b2[1] * 0.9), (X + a[0] * 0.9, y1 - 0.04, z + a[1] * 0.9)],
                     (a[0] + b2[0], 0, a[1] + b2[1]))
        for (cx, cz) in ((-r, -r), (r, -r), (r, r), (-r, r)):
            kit.box('misc', X + cx - 0.022, X + cx + 0.022, y0, y1, z + cz - 0.022, z + cz + 0.022, col=IRON)
        kit.box('misc', X - r - 0.03, X + r + 0.03, y0 - 0.03, y0 + 0.04, z - r - 0.03, z + r + 0.03, col=IRON)
        R = r + 0.08
        for (a, b2) in (((-R, -R), (R, -R)), ((R, -R), (R, R)), ((R, R), (-R, R)), ((-R, R), (-R, -R))):                # 燈籠的四坡頂
            kit.cface('misc', [(X + a[0], y1, z + a[1]), (X + b2[0], y1, z + b2[1]), (X, y1 + 0.22, z)], (a[0] + b2[0], 0.6, a[1] + b2[1]), IRON)
        glows.append((X, (y0 + y1) / 2, z))
        if plate_text:                                                                                                    # 面向馬路（−x）的直式石牌
            PF = K.Fr((X - h, 0, z), (0, 0, 1), (-1, 0, 0))
            kit.fbox('trim', PF, -0.22, 0.22, 0.95, 2.2, 0.0, 0.05, skip=('in',))
            m = Mesh('PLATE_FACE_XSGATE', M['board']); kit.face(m, [PF.p(-0.18, 1.0, 0.052), PF.p(0.18, 1.0, 0.052), PF.p(0.18, 2.15, 0.052), PF.p(-0.18, 2.15, 0.052)], PF.N)
            plates.append((m, {'text': plate_text, 'bg': '#e6e0d2', 'color': '#3a2f28'}))
    post(GP[0], '首都帝大'); post(GP[1])

    # ---------- 鐵門（白天開著：往校內打開、和圍牆垂直，貼著門洞兩邊）----------
    LEAF = (GP[1] - GP[0] - PS) / 2 - 0.05; HG = 2.1
    for (zh, s) in ((GP[0] + PS / 2 + 0.06, 1), (GP[1] - PS / 2 - 0.06, -1)):
        x0, x1 = X + T + 0.05, X + T + 0.05 + LEAF
        for y in (0.1, HG * 0.5, HG - 0.06): kit.box('misc', x0, x1, y, y + 0.06, zh - 0.025, zh + 0.025, col=IRON)
        n = 13
        for k in range(n + 1):
            x = x0 + (x1 - x0) * k / n; top = HG + (0.16 if k % 2 == 0 else 0.08)
            kit.box('misc', x - 0.016, x + 0.016, 0.06, top, zh - 0.016, zh + 0.016, skip=('bottom',), col=IRON)
            kit.cface('misc', [(x - 0.032, top, zh), (x + 0.032, top, zh), (x, top + 0.08, zh)], (0, 0, 1), IRON)
            kit.cface('misc', [(x + 0.032, top, zh), (x - 0.032, top, zh), (x, top + 0.08, zh)], (0, 0, -1), IRON)
        kit.box('misc', x0 - 0.04, x0 + 0.04, 0.0, HG + 0.1, zh - 0.04, zh + 0.04, skip=('bottom',), col=IRON)   # 鉸鏈那一根粗的

    # ---------- 完成 ----------
    K.finish(accs, root, VC)
    rail.finish(root, uv=False)
    for (m, props) in plates: uv01(m.finish(root, uv=True, props=props))
    for i, (x, y, z) in enumerate(glows):
        e = B.group(f'GLOW_xsgate_lamp_{i}', root, {'glow': '#ffe2a8', 'size': 1.3, 'day': 0.0, 'night': 0.9}); e.location = g2b(x, y, z)
    VCM = L.vc_material('wz_vc_xg', rough=0.55)
    L.vc_consolidate(root, {'xg_misc': VCM})
    L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name)
    info = L.export(OUT, gpu_instances=False)
    info.update({'note': 'X246 新生南路側門正式門柱、鐵門、圍牆（D136 像但不照抄）', 'posts': GP, 'wall_x': X, 'far': FAR})
    L.write_json(OUT[:-4] + '.json', info)
    return info


if __name__ == '__main__':
    print(build())
