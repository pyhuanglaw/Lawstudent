"""系籃練球用的戶外半場（LAWWW 2026-10-13 22:01Z 分派②；位置是 PROPOSAL，要使用者確認）→ GLB。
  /opt/blenv/bin/python tools/blender/env_second/bball_court.py [-- --out 輸出.glb]
尺寸照 FIBA：半場 15 m 寬×14 m 深、三分線半徑 6.75 m（兩邊直線離邊線 0.9 m）、禁區 4.9×5.8 m、罰球圈半徑 1.8 m、籃框中心離底線 1.575 m、籃框高 3.05 m、籃板 1.8×1.05 m（下緣 2.9 m、板面離底線 1.2 m）。
原點＝場地（含四周 1 m）的中心；籃框在 −z 那一端，+z 是中線；地面 y=0（場地鋪面高 2 cm）。
網格（一個材質 bball_court）：court（鋪面＋場線：場線是網格、不是貼圖，遠看不會糊）、hoop（籃架、籃板、籃框、籃網）、bench（場邊長椅×2＋一顆籃球、水壺）。"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, g2b, bpy   # noqa: E402
from pmesh import PM, T, Ry, Rx, Rz, frame, prism, box, lathe, bar, to_blender   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/bball_court.glb'
GEN = os.path.join(HERE, 'textures', 'gen')
ATLAS, ATLAS_ORM = os.path.join(GEN, 'bball_atlas.png'), os.path.join(GEN, 'bball_orm.png')
N = 512
SW = {   # 純色（sRGB）、粗糙度、金屬度
    'court_blue': ((46, 104, 156), 0.75), 'key_blue': ((36, 84, 130), 0.75), 'margin_green': ((60, 122, 88), 0.8), 'line_white': ((236, 236, 230), 0.7),
    'steel_blue': ((40, 70, 120), 0.45), 'pad_blue': ((34, 62, 112), 0.85), 'board_white': ((236, 238, 240), 0.35), 'board_red': ((196, 52, 44), 0.45),
    'rim_orange': ((214, 92, 36), 0.4), 'net_white': ((236, 236, 232), 0.9), 'alu': ((186, 190, 196), 0.4), 'concrete': ((150, 148, 142), 0.9),
    'ball': ((210, 104, 42), 0.75), 'bottle': ((70, 150, 200), 0.3), 'bench_wood': ((150, 108, 70), 0.6),
}
METAL = {'steel_blue': 0.35, 'alu': 0.45, 'rim_orange': 0.3}
CELL = 64
REG = {}
for i, k in enumerate(SW):
    REG[k] = ((i % 8) * CELL, (i // 8) * CELL, (i % 8) * CELL + CELL, (i // 8) * CELL + CELL)


def make_textures():
    img = Image.new('RGB', (N, N), (128, 128, 128)); d = ImageDraw.Draw(img)
    rng = np.random.default_rng(3)
    for k, (c, _) in SW.items():
        x0, y0, x1, y1 = REG[k]; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=c)
    a = np.asarray(img, np.float32) + rng.normal(0, 3.0, (N, N, 1)).astype(np.float32)   # 壓克力鋪面的細顆粒
    os.makedirs(GEN, exist_ok=True); Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(ATLAS)
    orm = np.zeros((N // 4, N // 4, 3), np.uint8); orm[..., 0] = 255
    for k, (c, rough) in SW.items():
        x0, y0, x1, y1 = [v // 4 for v in REG[k]]; orm[y0:y1, x0:x1, 1] = int(rough * 255); orm[y0:y1, x0:x1, 2] = int(METAL.get(k, 0.0) * 255)
    Image.fromarray(orm).save(ATLAS_ORM)


def sw(name):
    x0, y0, x1, y1 = REG[name]; ins = CELL * 0.3
    def f(*a):
        if len(a) == 1: a = (a[0][0] + a[0][1] * 0.37, a[0][2])
        s, t = (a[0] * 7.3) % 1.0, (a[-1] * 5.1) % 1.0
        return ((x0 + ins + s * (CELL - 2 * ins)) / N, 1 - (y0 + ins + (1 - t) * (CELL - 2 * ins)) / N)
    return f


HW, HD = 7.5, 7.0          # 半場：x ±7.5、z −7（底線）～+7（中線）
MAR = 1.0                  # 四周 1 m
SURF = 0.02                # 鋪面高
LY = SURF + 0.004          # 場線高（比鋪面高 4 mm，遠看不會閃）
LW = 0.05                  # 場線寬
BASKET_Z = -HD + 1.575     # 籃框中心
BOARD_Z = -HD + 1.2        # 籃板板面


def strip(pm, p0, p1, w=LW, y=LY):
    """一條直的場線（p0→p1，在地面上）"""
    p0, p1 = np.array(p0, float), np.array(p1, float); d = p1 - p0; L_ = np.linalg.norm(d); d /= L_; n = np.array((-d[1], d[0])) * w / 2
    pts = [(p0[0] + n[0], y, p0[1] + n[1]), (p1[0] + n[0], y, p1[1] + n[1]), (p1[0] - n[0], y, p1[1] - n[1]), (p0[0] - n[0], y, p0[1] - n[1])]
    pm.poly(pts, sw('line_white'), (0, 1, 0))


def arc(pm, cx, cz, r, a0, a1, seg, w=LW, y=LY):
    """圓弧場線：角度 a0→a1（弧度，0＝+x、π/2＝+z）"""
    for k in range(seg):
        t0, t1 = a0 + (a1 - a0) * k / seg, a0 + (a1 - a0) * (k + 1) / seg
        pts = [(cx + (r - w / 2) * math.cos(t0), y, cz + (r - w / 2) * math.sin(t0)), (cx + (r + w / 2) * math.cos(t0), y, cz + (r + w / 2) * math.sin(t0)),
               (cx + (r + w / 2) * math.cos(t1), y, cz + (r + w / 2) * math.sin(t1)), (cx + (r - w / 2) * math.cos(t1), y, cz + (r - w / 2) * math.sin(t1))]
        pm.poly(pts, sw('line_white'), (0, 1, 0))


def court():
    pm = PM()
    X0, X1, Z0, Z1 = -HW - MAR, HW + MAR, -HD - MAR, HD + MAR
    # 鋪面：外圍綠、場內藍、禁區深藍（分成不重疊的幾塊，同一個高度）
    box(pm, X0, X1, 0.0, SURF, Z0, Z1, {'*': sw('concrete')}, faces='fkrl')   # 側面（2 cm 的邊）
    def rect(x0, x1, z0, z1, name, y=SURF): pm.poly([(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)], sw(name), (0, 1, 0))
    rect(X0, X1, Z0, -HD, 'margin_green'); rect(X0, X1, HD, Z1, 'margin_green'); rect(X0, -HW, -HD, HD, 'margin_green'); rect(HW, X1, -HD, HD, 'margin_green')
    rect(-HW, -2.45, -HD, HD, 'court_blue'); rect(2.45, HW, -HD, HD, 'court_blue'); rect(-2.45, 2.45, -1.2, HD, 'court_blue'); rect(-2.45, 2.45, -HD, -1.2, 'key_blue')
    # 場線
    strip(pm, (-HW, -HD), (HW, -HD)); strip(pm, (-HW, HD), (HW, HD))          # 底線、中線
    strip(pm, (-HW, -HD), (-HW, HD)); strip(pm, (HW, -HD), (HW, HD))          # 邊線
    strip(pm, (-2.45, -HD), (-2.45, -1.2)); strip(pm, (2.45, -HD), (2.45, -1.2)); strip(pm, (-2.45, -1.2), (2.45, -1.2))   # 禁區、罰球線
    arc(pm, 0, -1.2, 1.8, 0, 2 * math.pi, 28)                                  # 罰球圈
    arc(pm, 0, HD, 1.8, math.pi, 2 * math.pi, 14)                              # 中圈（這一半）
    zc = BASKET_Z + math.sqrt(6.75 ** 2 - 6.6 ** 2)                            # 三分線：直線到 zc、圓弧
    strip(pm, (-6.6, -HD), (-6.6, zc)); strip(pm, (6.6, -HD), (6.6, zc))
    a = math.atan2(zc - BASKET_Z, 6.6); arc(pm, 0, BASKET_Z, 6.75, a, math.pi - a, 36)
    arc(pm, 0, BASKET_Z, 1.25, 0, math.pi, 10)                                 # 無衝撞區
    return pm


def hoop():
    pm = PM()
    pz = -HD - 0.85   # 籃架柱在底線後面 0.85 m
    box(pm, -0.09, 0.09, 0.0, 3.35, pz - 0.09, pz + 0.09, {'*': sw('steel_blue')}, faces='tfkrl')
    box(pm, -0.16, 0.16, 0.0, 2.0, pz - 0.16, pz + 0.16, {'*': sw('pad_blue')}, faces='tfkrl')      # 柱子下面的防護墊
    box(pm, -0.3, 0.3, 0.0, 0.03, pz - 0.3, pz + 0.3, {'*': sw('steel_blue')}, faces='tfkrl')       # 底座
    bar(pm, (0, 3.3, pz), (0, 3.3, BOARD_Z - 0.12), 0.1, 0.1, sw('steel_blue'))                      # 伸出去的臂
    bar(pm, (0, 2.6, pz + 0.05), (0, 3.25, BOARD_Z - 0.6), 0.06, 0.06, sw('steel_blue'))             # 斜撐
    box(pm, -0.5, 0.5, 2.95, 3.85, BOARD_Z - 0.12, BOARD_Z - 0.05, {'*': sw('steel_blue')}, faces='fkrl')   # 籃板後面的框
    # 籃板：白底、紅框、紅色的小方框（兩面）
    by0, by1 = 2.9, 3.95
    box(pm, -0.9, 0.9, by0, by1, BOARD_Z - 0.04, BOARD_Z, {'k': sw('board_white'), 'f': sw('board_white'), '*': sw('board_red')}, faces='tbfkrl')
    def frame_rect(x0, x1, y0, y1, w, z):
        for (a0, a1, b0, b1) in ((x0, x1, y0, y0 + w), (x0, x1, y1 - w, y1), (x0, x0 + w, y0, y1), (x1 - w, x1, y0, y1)):
            pm.poly([(a0, b0, z), (a1, b0, z), (a1, b1, z), (a0, b1, z)], sw('board_red'), (0, 0, 1))
    frame_rect(-0.9, 0.9, by0, by1, 0.05, BOARD_Z + 0.002); frame_rect(-0.295, 0.295, 3.05, 3.5, 0.05, BOARD_Z + 0.003)
    # 籃框（圓環）＋固定片
    R, r, seg, side = 0.2275, 0.01, 18, 5
    rim = PM(); ring = []
    for i in range(seg + 1):
        a = 2 * math.pi * i / seg; c = np.array((R * math.cos(a), 0.0, R * math.sin(a))); n = np.array((math.cos(a), 0.0, math.sin(a)))
        ring.append([rim.vid(c + r * (math.cos(2 * math.pi * j / side) * n + math.sin(2 * math.pi * j / side) * np.array((0, 1.0, 0)))) for j in range(side + 1)])
    for i in range(seg):
        for j in range(side):
            q = [ring[i][j], ring[i + 1][j], ring[i + 1][j + 1], ring[i][j + 1]]; m = sum(rim.v[k] for k in q) / 4
            rc = np.array((R * math.cos(2 * math.pi * (i + 0.5) / seg), 0, R * math.sin(2 * math.pi * (i + 0.5) / seg)))
            rim.face(q, [sw('rim_orange')(rim.v[k]) for k in q], m - rc)
    pm.add(rim, T(0, 3.05, BASKET_Z))
    box(pm, -0.09, 0.09, 2.98, 3.06, BOARD_Z, BASKET_Z - R + 0.01, {'*': sw('rim_orange')}, faces='tbkrl')
    # 籃網：12 條往下收的白線
    for k in range(12):
        a = 2 * math.pi * k / 12; b = a + 2 * math.pi / 12 * 1.5
        bar(pm, (R * math.cos(a), 3.04, BASKET_Z + R * math.sin(a)), (0.14 * math.cos(b), 2.64, BASKET_Z + 0.14 * math.sin(b)), 0.008, 0.008, sw('net_white'))
        bar(pm, (R * math.cos(a), 3.04, BASKET_Z + R * math.sin(a)), (0.14 * math.cos(a - 2 * math.pi / 12 * 1.5), 2.64, BASKET_Z + 0.14 * math.sin(a - 2 * math.pi / 12 * 1.5)), 0.008, 0.008, sw('net_white'))
    return pm


def bench(pm, x, z, yaw):
    b = PM()
    box(b, -1.0, 1.0, 0.42, 0.46, -0.18, 0.18, {'*': sw('bench_wood')}, faces='tbfkrl')
    for sx in (-0.85, 0.85):
        box(b, sx - 0.03, sx + 0.03, 0.0, 0.42, -0.15, -0.11, {'*': sw('alu')}, faces='fkrl'); box(b, sx - 0.03, sx + 0.03, 0.0, 0.42, 0.11, 0.15, {'*': sw('alu')}, faces='fkrl')
        box(b, sx - 0.03, sx + 0.03, 0.0, 0.03, -0.18, 0.18, {'*': sw('alu')}, faces='tfkrl')
    pm.add(b, T(x, 0, z) @ Ry(yaw))


def ball(pm, c, r=0.12, n=10, rings=6):
    s = PM(); verts = []
    for j in range(rings + 1):
        th = math.pi * j / rings; verts.append([s.vid((c[0] + r * math.sin(th) * math.cos(2 * math.pi * k / n), c[1] + r * math.cos(th), c[2] + r * math.sin(th) * math.sin(2 * math.pi * k / n))) for k in range(n + 1)])
    for j in range(rings):
        for k in range(n):
            q = [verts[j][k], verts[j][k + 1], verts[j + 1][k + 1], verts[j + 1][k]]
            if j == 0: q = [verts[0][k], verts[1][k + 1], verts[1][k]]
            elif j == rings - 1: q = [verts[j][k], verts[j][k + 1], verts[j + 1][k]]
            s.face(q, [sw('ball')(s.v[i]) for i in q], sum(s.v[i] for i in q) / len(q) - np.array(c))
    pm.add(s)


def benches():
    pm = PM()
    bx = HW + 0.55
    for z in (-2.2, 2.8): bench(pm, bx, z, -math.pi / 2)   # 面向場內（−x）
    ball(pm, (bx + 0.05, 0.12, 0.3))
    lathe(pm, [(0.035, 0, 0.035, 0.2, sw('bottle'), 'out'), (0.035, 0.2, 0.018, 0.235, sw('bottle'), 'out')], 8, caps=[(0.018, 0.235, sw('bottle'), 'up')], M=T(bx - 0.05, 0.46, -1.6))
    return pm


def build():
    make_textures()
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=512)
    root = B.group('bball_court', props={'kind': 'bball_court'})
    mat = bpy.data.materials.new('bball_court'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS); tx.image.pack(); nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
    to = nt.nodes.new('ShaderNodeTexImage'); to.image = bpy.data.images.load(ATLAS_ORM); to.image.colorspace_settings.name = 'Non-Color'; to.image.pack()
    sp = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(to.outputs['Color'], sp.inputs['Color'])
    nt.links.new(sp.outputs['Green'], bsdf.inputs['Roughness']); nt.links.new(sp.outputs['Blue'], bsdf.inputs['Metallic'])
    mods = {}
    for name, fn in (('court', court), ('hoop', hoop), ('bench', benches)):
        pm = fn(); to_blender(pm, name, mat, root, B, g2b, bpy); mn, mx = pm.bbox(); mods[name] = {'tris': pm.tris(), 'min': mn, 'max': mx}
    info = L.export(out, gpu_instances=False)
    info['modules'] = mods
    info['origin'] = '場地（含四周 1 m）的中心、地面 y=0；籃框在 −z 那一端（籃框中心 (0, 3.05, %.3f)）、+z 是中線（z=+7）；三個網格的原點相同，放的時候用同一個矩陣' % BASKET_Z
    info['size'] = {'slab': [2 * (HW + MAR), SURF, 2 * (HD + MAR)], 'court': [2 * HW, 2 * HD], 'hoop_pole_z': -HD - 0.85}
    info['nav'] = '場地可以走（鋪面 2 cm）；擋：籃架柱子 0.32×0.32（含防護墊）在 (0, %.2f)、兩張長椅 2.0×0.36 在 x=%.2f、z=−2.2／2.8' % (-HD - 0.85, HW + 0.55)
    L.write_json(out[:-4] + '.json', info)
    print(json.dumps({k: v['tris'] for k, v in mods.items()}))


if __name__ == '__main__':
    build()
