"""台灣常見的速克達機車（兩款）→ 一個 GLB（機車自己的座標：車頭朝 +x、原點在兩輪中間的地面，和 TK.scooter 一樣）。
第二 AI 工作階段（環境美術）製作：
  /opt/blenv/bin/python tools/blender/env_second/scooter.py [-- --out assets/models/env/second_ai/scooter.glb]

兩款都是一般 125cc 速克達的比例（不仿特定品牌）：全長約 1.8 m、軸距 1.27 m、12 吋輪、座高 0.77 m、停在中柱上（直立）。
  scooter_a：現代款（車殼稜線比較直、LED 頭燈在龍頭罩上）
  scooter_b：復古款（圓弧車殼、圓頭燈、鍍鉻後照鏡與排氣管護片、後扶手）
每一款是一個網格（多個材質）：遊戲用 InstancedMesh 擺很多台（溫州街主巷 37 台左右），**車殼顏色每台不同**：
材質 scooter_paint 是白色，顏色用 instanceColor 乘上去（套件 TK.scooter 給的顏色）。
其他零件的顏色放在頂點色，只分兩個材質：scooter_parts（塑膠、橡膠、燈、車牌）、scooter_metal（金屬、鍍鉻）——
一款車 3 個 InstancedMesh（原本約 10 個），整條巷子的機車連陰影約 12 次 draw call。
"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from cafe_layout import combine   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/scooter.glb'))

B.reset(texres=256)
root = B.group('scooters', props={'kind': 'scooters'})
M = {
    'paint': L.flat('scooter_paint', '#ffffff', rough=0.32),
    'dark': L.flat('scooter_dark', '#2a2b2d', rough=0.55),
    'seat': L.flat('scooter_seat', '#1d1c1c', rough=0.5),
    'tire': L.flat('scooter_tire', '#191919', rough=0.85),
    'metal': L.flat('scooter_metal_flat', '#7d8186', rough=0.4, metal=0.45),
    'chrome': L.flat('scooter_chrome', '#c9ced2', rough=0.18, metal=0.6),
    'lamp': L.flat('scooter_lamp', '#e8edf0', rough=0.1),
    'tail': L.flat('scooter_tail', '#a1231b', rough=0.25),
    'amber': L.flat('scooter_amber', '#d98a1e', rough=0.3),
    'plate': L.flat('scooter_plate', '#f1f1ec', rough=0.5),
    'parts': L.vc_material('scooter_parts', rough=0.55),
    'metalvc': L.vc_material('scooter_metal', rough=0.3),
}
M['metalvc'].node_tree.nodes['Principled BSDF'].inputs['Metallic'].default_value = 0.45
VC = {'scooter_dark': '#2a2b2d', 'scooter_seat': '#1d1c1c', 'scooter_tire': '#191919', 'scooter_lamp': '#e8edf0', 'scooter_tail': '#a1231b', 'scooter_amber': '#d98a1e', 'scooter_plate': '#f1f1ec'}
VCM = {'scooter_metal_flat': '#7d8186', 'scooter_chrome': '#c9ced2'}


def bake_vc(parts):
    """零件的顏色寫進頂點色（Col），材質換成共用的 scooter_parts／scooter_metal；車殼也寫白色（合併時每個零件都要有 Col，不然會補成黑色）"""
    lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    for ob in [o for o in parts if o is not None]:
        nm = ob.data.materials[0].name; hx = VC.get(nm) or VCM.get(nm) or '#ffffff'
        col = [lin(int(hx[i:i + 2], 16) / 255) for i in (1, 3, 5)] + [1.0]
        at = ob.data.color_attributes.new('Col', 'FLOAT_COLOR', 'CORNER')
        for d in at.data: d.color = col
        if nm in VC: ob.data.materials[0] = M['parts']
        elif nm in VCM: ob.data.materials[0] = M['metalvc']


def sect(x, cy, hw, hh, p=2.6, n=8, ytop=None):
    """一個橫斷面（x 處）：超橢圓，中心高 cy、半寬 hw、半高 hh；p 越大越方"""
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n; c, s = math.cos(t), math.sin(t)
        z = hw * math.copysign(abs(c) ** (2 / p), c); y = cy + hh * math.copysign(abs(s) ** (2 / p), s)
        pts.append((x, y, z))
    return pts


def loft(m, rings, cap=True):
    """把一串斷面（每個 n 點）接成一個封閉的殼（平滑著色在 finish 之後設）"""
    bm = m.bm; vr = [[bm.verts.new(g2b(*p)) for p in r] for r in rings]; n = len(rings[0])
    for a, b in zip(vr, vr[1:]):
        for i in range(n):
            j = (i + 1) % n; bm.faces.new((a[i], a[j], b[j], b[i]))
    if cap:
        bm.faces.new(vr[0]); bm.faces.new(list(reversed(vr[-1])))
    return m


def wheel(parts, x, r=0.235, w=0.1, hub=0.11):
    t = Mesh('tire', M['tire']); prof = [(hub + 0.02, -w / 2), (r - 0.025, -w / 2), (r, 0.0), (r - 0.025, w / 2), (hub + 0.02, w / 2)]   # 效能版（2026-10-16）：胎面一圈圓弧（巷子裡 38 台）
    bm = L.lathe([(a, b) for a, b in prof], seg=14); t.add_bm(bm, Matrix.Translation(g2b(x, r, 0)) @ Matrix.Rotation(math.pi / 2, 4, 'X')); bm.free()   # 14 邊：效能第五輪的 10 邊在停車格近景看得出多邊形（平滑著色也救不了輪廓），每台 +64 三角形
    ob = t.finish(None, uv=False); L.smooth_mesh(ob, angle=0.9); parts.append(ob)
    rm = Mesh('rim', M['metal']); bm = L.lathe([(0.0, -w / 2 - 0.006), (hub + 0.025, -w / 2 - 0.006), (hub + 0.025, w / 2 + 0.006), (0.0, w / 2 + 0.006)], seg=8)   # 輪框的兩面露在輪胎外
    rm.add_bm(bm, Matrix.Translation(g2b(x, r, 0)) @ Matrix.Rotation(math.pi / 2, 4, 'X')); bm.free(); parts.append(rm.finish(None, uv=False))


def scooter(kind):
    parts = []; retro = kind == 'b'
    wheel(parts, 0.635); wheel(parts, -0.635)
    p = M['paint']
    # 後車身（側蓋＋車尾）：從踏板後面到車尾，越往後越窄、越高
    rb = Mesh('rear_body', p)
    st = [(-0.94, 0.66, 0.06, 0.08), (-0.88, 0.62, 0.12, 0.14), (-0.7, 0.57, 0.16, 0.2), (-0.4, 0.55, 0.17, 0.22), (-0.15, 0.53, 0.16, 0.21), (-0.04, 0.5, 0.14, 0.17)]
    loft(rb, [sect(x, cy, hw, hh, p=3.4 if not retro else 2.3) for (x, cy, hw, hh) in st]); ob = rb.finish(None, uv=False); L.smooth_mesh(ob, angle=1.0); parts.append(ob)
    # 座墊（黑色、略拱）
    se = Mesh('seat', M['seat'])
    loft(se, [sect(x, cy, hw, hh, p=2.8) for (x, cy, hw, hh) in [(-0.84, 0.77, 0.08, 0.025), (-0.74, 0.79, 0.14, 0.04), (-0.4, 0.8, 0.155, 0.045), (-0.1, 0.79, 0.15, 0.045), (0.06, 0.765, 0.12, 0.03)]])
    ob = se.finish(None, uv=False); L.smooth_mesh(ob, angle=1.0); parts.append(ob)
    # 踏板（深色）＋踏板下的車殼
    fl = Mesh('floor', M['dark']); fl.box(-0.06, 0.34, 0.28, 0.31, -0.17, 0.17); fl.box(-0.06, 0.34, 0.16, 0.28, -0.13, 0.13); parts.append(fl.finish(None, uv=False))
    # 前擋（leg shield）：踏板前緣往上到龍頭，略往後傾；正面是車殼色
    fr = Mesh('apron', p)
    st = [(0.31, 0.3, 0.2, 0.06), (0.35, 0.5, 0.19, 0.07), (0.39, 0.7, 0.17, 0.07), (0.42, 0.86, 0.14, 0.065), (0.44, 0.96, 0.1, 0.055)]
    rings = []
    for (x, y, hw, hd) in st:                                  # 這個殼沿著 y 往上接：斷面在 x–z 平面
        n = 8; ring = []
        for i in range(n):
            t = 2 * math.pi * i / n; c, s = math.cos(t), math.sin(t); e = 2 / (3.0 if not retro else 2.2)
            ring.append((x + hd * math.copysign(abs(s) ** e, s), y, hw * math.copysign(abs(c) ** e, c)))
        rings.append(ring)
    loft(fr, rings); ob = fr.finish(None, uv=False); L.smooth_mesh(ob, angle=1.0); parts.append(ob)
    # 前土除（前輪上方的擋泥板）＋前叉
    ff = Mesh('front_fender', p); arc = []
    for i in range(7):                                         # 斷面垂直於弧：徑向 × 車寬方向
        a = math.radians(-35 + i * 17.5); cx, cy = 0.635 + math.sin(a) * 0.3, 0.235 + math.cos(a) * 0.3; rx, ry = math.sin(a), math.cos(a); ring = []
        for k in range(8):
            t = 2 * math.pi * k / 8; c, s_ = math.cos(t), math.sin(t); e = 2 / 2.4
            dz = 0.07 * math.copysign(abs(c) ** e, c); dr = 0.018 * math.copysign(abs(s_) ** e, s_)
            ring.append((cx + rx * dr, cy + ry * dr, dz))
        arc.append(ring)
    loft(ff, arc); ob = ff.finish(None, uv=False); L.smooth_mesh(ob, angle=1.0); parts.append(ob)
    fk = Mesh('fork', M['metal'])
    for z in (-0.06, 0.06): fk.cyl((0.635, 0.235, z), (0.47, 0.82, z), 0.022, seg=6)
    parts.append(fk.finish(None, uv=False))
    # 龍頭：龍頭罩（車殼色）、把手（黑）、後照鏡（桿＋鏡）、儀表
    hb = Mesh('handle_cover', p)
    loft(hb, [sect(x, cy, hw, hh, p=2.6 if retro else 3.2) for (x, cy, hw, hh) in [(0.36, 1.0, 0.1, 0.05), (0.42, 1.01, 0.16, 0.06), (0.5, 0.99, 0.15, 0.05), (0.56, 0.96, 0.09, 0.035)]])
    ob = hb.finish(None, uv=False); L.smooth_mesh(ob, angle=1.0); parts.append(ob)
    gr = Mesh('grips', M['dark'])
    for s in (-1, 1): gr.cyl((0.44, 1.01, s * 0.16), (0.42, 1.02, s * 0.33), 0.018, seg=6); gr.cyl((0.42, 1.02, s * 0.3), (0.42, 1.02, s * 0.34), 0.022, seg=8)
    gr.box(0.4, 0.46, 1.04, 1.07, -0.07, 0.07)                                                  # 儀表
    parts.append(gr.finish(None, uv=False))
    mr = Mesh('mirrors', M['chrome'] if retro else M['dark'])
    for s in (-1, 1):
        mr.cyl((0.42, 1.03, s * 0.22), (0.39, 1.16, s * 0.27), 0.008, seg=4)
        if retro: mr.sphere((0.39, 1.19, s * 0.28), 0.05, seg=8, rings=5, sy=0.8)
        else: mr.box(0.37, 0.41, 1.15, 1.22, s * 0.28 - 0.065, s * 0.28 + 0.065)
    parts.append(mr.finish(None, uv=False))
    # 燈：頭燈（a＝龍頭罩上的長條 LED、b＝圓燈）、方向燈、尾燈、車牌
    lp = Mesh('headlamp', M['lamp'])
    if retro: lp.cyl((0.52, 0.98, 0), (0.56, 0.98, 0), 0.07, seg=8)
    else: lp.box(0.53, 0.565, 0.95, 0.99, -0.11, 0.11)
    parts.append(lp.finish(None, uv=False))
    am = Mesh('turn', M['amber'])
    for s in (-1, 1): am.box(0.4, 0.45, 0.62, 0.66, s * 0.17 - 0.03, s * 0.17 + 0.03); am.box(-0.9, -0.86, 0.66, 0.7, s * 0.09 - 0.025, s * 0.09 + 0.025)
    parts.append(am.finish(None, uv=False))
    tl = Mesh('taillamp', M['tail']); tl.box(-0.955, -0.93, 0.68, 0.73, -0.07, 0.07); parts.append(tl.finish(None, uv=False))
    pl = Mesh('plate', M['plate']); pl.box(-0.99, -0.975, 0.38, 0.49, -0.1, 0.1); parts.append(pl.finish(None, uv=False))
    # 後土除（黑）、引擎＋傳動箱（左邊，深灰金屬）、排氣管（右邊；b 有鍍鉻護片）、中柱
    rf = Mesh('rear_fender', M['dark']); rf.box(-0.98, -0.8, 0.36, 0.5, -0.08, 0.08); rf.box(-0.86, -0.5, 0.44, 0.5, -0.09, 0.09); parts.append(rf.finish(None, uv=False))
    en = Mesh('engine', M['metal'])                            # 傳動箱（左邊，從踏板後面到後輪軸，圓角）
    loft(en, [sect(x, cy, hw, hh, p=2.4, n=8) for (x, cy, hw, hh) in [(-0.7, 0.24, 0.03, 0.06), (-0.62, 0.25, 0.04, 0.1), (-0.3, 0.27, 0.045, 0.1), (-0.08, 0.26, 0.04, 0.09), (-0.02, 0.25, 0.025, 0.06)]])
    for v in en.bm.verts: v.co.y -= 0.12                       # 往左（遊戲 +z＝Blender −y）移到後輪左邊
    ob = en.finish(None, uv=False); L.smooth_mesh(ob, angle=1.0); parts.append(ob)
    ub = Mesh('underbody', M['dark']); ub.box(-0.45, -0.04, 0.2, 0.36, -0.1, 0.06); parts.append(ub.finish(None, uv=False))
    ex = Mesh('exhaust', M['dark']); ex.cyl((-0.25, 0.22, -0.16), (-0.95, 0.36, -0.17), 0.05, seg=8); parts.append(ex.finish(None, uv=False))
    if retro:
        ch = Mesh('chrome_parts', M['chrome']); ch.cyl((-0.4, 0.27, -0.215), (-0.8, 0.34, -0.22), 0.035, seg=8)
        for s in (-1, 1): ch.cyl((-0.75, 0.82, s * 0.15), (-0.98, 0.84, s * 0.12), 0.012, seg=5)          # 後扶手
        ch.cyl((-0.98, 0.84, -0.12), (-0.98, 0.84, 0.12), 0.012, seg=5); parts.append(ch.finish(None, uv=False))
    cs = Mesh('stand', M['metal'])
    for z in (-0.12, 0.12): cs.cyl((-0.15, 0.2, z), (-0.2, 0.0, z * 1.1), 0.015, seg=4)
    cs.cyl((-0.2, 0.01, -0.13), (-0.2, 0.01, 0.13), 0.015, seg=4); parts.append(cs.finish(None, uv=False))
    bake_vc(parts); me = combine(parts, f'scooter_{kind}'); ob = bpy.data.objects.new(f'scooter_{kind}', me); bpy.context.scene.collection.objects.link(ob); ob.parent = root
    ob.location = (0.0, 0.0 if kind == 'a' else 3.0, 0.0)                                   # 匯出時兩款分開放（遊戲照名稱取，不看位置）
    return ob


scooter('a'); scooter('b')
info = L.export(OUT, gpu_instances=False)
L.write_json(OUT[:-4] + '.json', info)
