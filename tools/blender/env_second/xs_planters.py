"""新生南路校園那一側的人行道花台（X246，XS-PLANTERS-1110；LAWWW2 帳號 A 2026-11-10）→ assets/models/env/second_ai/xs_planters.glb（＋.json）。
使用者 11-05 08:0x「台大新生南路側門改成我的照片的樣子」（USER_WANTS X246：人行道花台、紅磚、廣場…；照片有著作權疑慮不進 repo）。
D141 已經過三版：只補照片裡明顯、遊戲完全沒有的花台（LAWWW 11-10 12:38 同意）。D136 像但不照抄：
  沿校園圍牆內側（人行道靠牆那一邊）一段一段的矮花台：花崗石框（高 0.45、厚 0.18）、裡面的土、修剪過的杜鵑花籬（照溫州公園 wz_park.py 的做法：
  不透明葉子貼圖的實心圓頂長條＋表面一層葉片卡；SEASON_AZALEA_on＝3 月開花，遊戲 Z3.wzParkSeason 照月份切換）。
  側門洞前後各留 1 m、每段之間留 1.2 m（人可以從縫走到牆邊）。新生南路區域座標（x 往東＝校園，z 往南）：
  /opt/blenv/bin/python tools/blender/env_second/xs_planters.py [-- --out <glb>] [--layout <xinsheng_layout.js>]
花台的範圍（遊戲擋導航用）寫進 root 的 extras.planters：[[x0, z0, x1, z1], …]，xinsheng3d.js 照它擋。"""
import json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy   # noqa: E402
from cafe_layout import bush   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/xs_planters.glb'))
GEN = os.path.join(HERE, 'textures', 'gen')
LAYF = os.path.abspath(arg('--layout', os.path.join(L.ROOT, 'src/data/xinsheng_layout.js')))   # 開發分支的配置（--layout：配置在別的 checkout）
LAY = json.loads(subprocess.check_output(['node', '-e', "global.window=global; eval(require('fs').readFileSync(process.argv[1],'utf8').replace(/^const /m,'global.')); process.stdout.write(JSON.stringify(XINSHENG_LAYOUT))", LAYF]))

B.reset(texres=512)
R, CW = LAY['road'], LAY['campusWall']
WALL_IN = CW['x'] - 0.2            # 圍牆朝人行道那一面（牆厚 0.4）
X0, X1 = WALL_IN - 1.75, WALL_IN - 0.05   # 花台外框：寬 1.7 m，離牆 5 cm
H, T, SOIL = 0.45, 0.18, 0.38
G0, G1 = CW['gateGap'][0] - 1.0, CW['gateGap'][1] + 1.0
SEG, GAP = 7.0, 1.2
segs = []
z = R['z0'] + 2.0
while z + 2.0 < R['z1'] - 2.0:
    z1 = min(z + SEG, R['z1'] - 2.0)
    if z1 > G0 and z < G1:          # 側門洞前後：切開
        if G0 - z >= 2.0: segs.append((z, G0))
        z = G1; continue
    if z1 - z >= 2.0: segs.append((z, z1))
    z = z1 + GAP
root = B.group('xs_planters', props={'kind': 'xs_planters', 'planters': [[round(X0, 3), round(a, 3), round(X1, 3), round(b, 3)] for a, b in segs],
                                     'note': 'X246 新生南路人行道花台；extras.planters＝[x0,z0,x1,z1]（新生南路區域座標），xinsheng3d.js 照它擋導航'})

def img_mat(name, fn, clip=False, rough=0.8):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; Lk = nt.links; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn)); Lk.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if clip:
        r = N.new('ShaderNodeMath'); r.operation = 'ROUND'; Lk.new(tx.outputs['Alpha'], r.inputs[0]); Lk.new(r.outputs[0], bs.inputs['Alpha'])
        try: m.surface_render_method = 'DITHERED'
        except Exception: pass
        m.use_backface_culling = False
    m['tile'] = 1.0; return m

M = {'granite': L.pbr('xs_planter_granite', 'granite_tile_03', tile=1.0, target='#a39e95', maps=('diff', 'nor'), normal=0.5, res=512, rough_value=0.7),
     'soil': L.flat('xs_planter_soil', '#4a3b2c', rough=0.95),
     'leaf': img_mat('xs_azalea_leaf', 'azalea_leaves.png', clip=True, rough=0.7),
     'flower': img_mat('xs_azalea_flower', 'azalea_flower.png', clip=True, rough=0.7)}
CORE = {'off': img_mat('xs_azalea_core', 'azalea_leaves.png', rough=0.75), 'on': img_mat('xs_azalea_core_fl', 'azalea_flower.png', rough=0.75)}
for m in CORE.values(): m['tile'] = 0.8
for k in ('granite', 'soil'): M[k].use_backface_culling = True   # 封閉的方塊：單面

gr, so = Mesh('xs_planter_frame', M['granite']), Mesh('xs_planter_soil', M['soil'])
for a, b in segs:
    gr.box(X0, X1, 0.0, H, a, a + T); gr.box(X0, X1, 0.0, H, b - T, b)                  # 兩端
    gr.box(X0, X0 + T, 0.0, H, a + T, b - T); gr.box(X1 - T, X1, 0.0, H, a + T, b - T)  # 兩側
    so.box(X0 + T, X1 - T, 0.0, SOIL, a + T, b - T)

# 修剪過的杜鵑花籬：圓頂長條（剖面照 wz_park.py 的 PROF，寬、高縮一點：花台裡 1.3 m 寬），沿 z 方向，中心在花台中線
PROF = [(-0.48, 0.0), (-0.55, 0.22), (-0.52, 0.42), (-0.36, 0.56), (0.0, 0.61), (0.36, 0.56), (0.52, 0.42), (0.55, 0.22), (0.48, 0.0)]
CX = (X0 + X1) / 2
def hedge_core(bm, za, zb, seed):
    rr = random.Random(seed); n = max(2, int((zb - za) / 0.45)); rings = []
    for i in range(n + 1):
        zc = za + (zb - za) * i / n; end = 0.85 if i in (0, n) else 1.0; ring = []
        for (d, y) in PROF:
            j = 1.0 + rr.uniform(-0.06, 0.06) if 0 < y < 0.61 else 1.0
            ring.append(bm.verts.new(g2b(CX + d * end * j, SOIL + y * (end if y > 0 else 1) * (1 + rr.uniform(-0.04, 0.04) if y > 0 else 1), zc)))
        rings.append(ring)
    for p, q in zip(rings, rings[1:]):
        for k in range(len(PROF) - 1): bm.faces.new((p[k], q[k], q[k + 1], p[k + 1]))
    bm.faces.new(list(reversed(rings[0]))); bm.faces.new(rings[-1])

random.seed(4611)
cards = {'off': Mesh('SEASON_AZALEA_off_xs_hedge', M['leaf']), 'on': Mesh('SEASON_AZALEA_on_xs_hedge', M['flower'])}
cores = {t: Mesh(f'SEASON_AZALEA_{t}_xs_core', CORE[t]) for t in CORE}
for si, (a, b) in enumerate(segs):
    za, zb = a + T + 0.35, b - T - 0.35
    for t in cores: hedge_core(cores[t].bm, za, zb, 90 + si)
    n = max(2, int((zb - za) / 0.5))
    for i in range(n + 1):
        zc = za + (zb - za) * i / n; st_ = random.getstate()
        for t, m in cards.items():
            random.setstate(st_)
            for dx in (-0.32, 0.32): bush(m, CX + dx, SOIL + 0.42, zc, 0.28, n=3, span=0.35, flat_y=0.8)   # 葉片卡小一點（0.36 時從花籬表面方方地凸出來）
gr.finish(root, uv=True); so.finish(root, uv=False)
for t in cards:
    grp = B.group(f'SEASON_AZALEA_{t}', root, {'season': 'azalea', 'state': t})
    o = cards[t].finish(None, uv=False); o.parent = grp
    oc = cores[t].finish(None, uv=True, smooth=True); oc.parent = grp
info = L.export(OUT, gpu_instances=False)
info.update({'segments': len(segs), 'planters': [[round(X0, 3), round(a, 3), round(X1, 3), round(b, 3)] for a, b in segs]})
L.write_json(OUT[:-4] + '.json', info)
print('OK', OUT, len(segs), 'segments', info.get('tris'))
