"""舊序章人物己（Long）背包上的奶茶杯鑰匙圈（US-LONG-3D-1110；企劃 AA_80 5-2、AA_145 3-5：「背包上掛一個小小的奶茶杯鑰匙圈」）→ GLB。LAWWW2；Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/char_second/keychain_milktea.py [-- --out assets/models/char/second_ai/keychain_milktea.glb]
一個 4 cm 高的珍珠奶茶杯：下面一圈黑色珍珠、奶茶色杯身、上緣一圈透白、圓頂杯蓋、粗吸管（斜插）；杯蓋頂上的小環接兩節短鍊子、銀色鑰匙環。
座標（three.js 模型座標）：原點＝鑰匙環最上面（扣在背包拉鍊頭上的那一點）、整個往 −y 垂下；杯子正面（有吸管那側）朝 +z（背包外面）。
接法：props3d.js 的 DEF.keychain_milktea（掛 upperChest，位置照 backpack() 的前袋拉鍊；見 wip/us_long_3d_1110 的 patch）。"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'env_second'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/char/second_ai/keychain_milktea.glb')
B.reset(texres=256)
M = {'metal': L.flat('kc_metal', '#c9cbcf', rough=0.30, metal=0.45),
     'tea': L.flat('kc_tea', '#c89c72', rough=0.35),
     'pearl': L.flat('kc_pearl', '#2b1c16', rough=0.25),
     'clear': L.flat('kc_clear', '#eef0ee', rough=0.20),
     'lid': L.flat('kc_lid', '#f6f4ef', rough=0.30),
     'straw': L.flat('kc_straw', '#e7748c', rough=0.40)}
root = B.group('keychain_milktea', props={'kind': 'prop_keychain', 'owner': 'us_long', 'top': 'origin', 'hang': '-y'})
me = {k: Mesh('kc_' + k, v) for k, v in M.items()}


def ring(mesh, c, R, r, axis='z', seg=18, sides=6):
    """細圓環（遊戲座標中心 c、環半徑 R、線半徑 r）；axis＝環面的法線（遊戲座標軸）"""
    bm = bmesh.new()
    for i in range(seg):
        a = 2 * math.pi * i / seg
        for k in range(sides):
            b = 2 * math.pi * k / sides; rr = R + r * math.cos(b)
            p = (rr * math.cos(a), rr * math.sin(a), r * math.sin(b))          # 環在 xy 平面（法線 z）
            if axis == 'x': p = (p[2], p[1], p[0])
            bm.verts.new(g2b(c[0] + p[0], c[1] + p[1], c[2] + p[2]))
    bm.verts.ensure_lookup_table(); V = bm.verts
    for i in range(seg):
        for k in range(sides):
            a0, a1 = i * sides + k, i * sides + (k + 1) % sides; b0, b1 = ((i + 1) % seg) * sides + k, ((i + 1) % seg) * sides + (k + 1) % sides
            bm.faces.new((V[a0], V[a1], V[b1], V[b0]))
    mesh.add_bm(bm); bm.free()


# 鑰匙環（直徑 2 cm，環面朝 z：貼著背包表面）＋兩節短鍊（交錯方向）＋杯蓋頂上的小環
ring(me['metal'], (0, -0.010, 0), 0.0095, 0.0009, 'z', 24, 6)
ring(me['metal'], (0, -0.0225, 0), 0.0038, 0.0007, 'x', 12, 5)
ring(me['metal'], (0, -0.0285, 0), 0.0038, 0.0007, 'z', 12, 5)
ring(me['metal'], (0, -0.0345, 0), 0.0032, 0.0008, 'x', 12, 5)
# 杯子：杯蓋頂端在 y＝−0.038；杯身 4.2 cm（底半徑 1.05 cm、口半徑 1.35 cm），由下往上：珍珠段、奶茶段、上緣透白段
TOP = -0.038; H = 0.042; BOT = TOP - 0.008 - H
def rad(y): return 0.0105 + (0.0135 - 0.0105) * (y - BOT) / H
def band(mesh, y0, y1, k=1.0):
    bm = L.lathe([(rad(y0) * k, y0), (rad(y1) * k, y1)], 20)
    mesh.add_bm(bm, Matrix.Identity(4)); bm.free()
bm = L.lathe([(0.0, BOT), (rad(BOT), BOT), (rad(BOT + 0.010), BOT + 0.010)], 20); me['tea'].add_bm(bm); bm.free()   # 杯底（從外面看是奶茶色，珍珠點在上面）
band(me['tea'], BOT + 0.010, BOT + 0.034)
band(me['clear'], BOT + 0.034, BOT + H)
# 珍珠：杯底一圈半埋在杯壁裡的黑色小球（外面看得到一顆一顆的）
for row, yy in enumerate((BOT + 0.0035, BOT + 0.0085)):
    n = 11
    for i in range(n):
        a = 2 * math.pi * (i + 0.5 * row) / n; rr = rad(yy) - 0.0006
        me['pearl'].sphere((rr * math.cos(a), yy, rr * math.sin(a)), 0.0026, 6, 4)
# 杯緣（一圈小凸邊）＋圓頂杯蓋＋頂上一個小凸起（接鍊子的環）
ytop = BOT + H
bm = L.lathe([(rad(ytop) + 0.0008, ytop - 0.0010), (rad(ytop) + 0.0010, ytop + 0.0005), (0.0128, ytop + 0.0012), (0.0110, ytop + 0.0040), (0.0072, ytop + 0.0068), (0.0030, ytop + 0.0080), (0.0, ytop + 0.0082)], 20)
me['lid'].add_bm(bm); bm.free()
me['lid'].cyl((0, ytop + 0.0078, 0), (0, TOP + 0.0004, 0), 0.0018, 8)
# 粗吸管：從杯蓋偏前插進去、往上斜出 1.8 cm（朝 +z 外側、略往右）
sa = (0.0030, ytop + 0.0050, 0.0040); d = Vector((0.18, 1.0, 0.30)).normalized(); sb = tuple(sa[i] + d[i] * 0.019 for i in range(3))
me['straw'].cyl(sa, sb, 0.0021, 10)
me['straw'].cyl((sa[0], sa[1] - 0.006, sa[2]), sa, 0.0021, 10)   # 杯蓋裡面一小段（從斜的角度看得到插進去）
obs = []
for k, mm in me.items():
    ob = mm.finish(root, uv=False, smooth=False)
    if ob is not None: L.smooth_mesh(ob, angle=1.0); obs.append(ob)
tris = {ob.name: sum(len(p.vertices) - 2 for p in ob.data.polygons) for ob in obs}
print('keychain tris', tris, 'total', sum(tris.values()), 'length %.3f m' % -BOT)
st = L.export(OUT, gpu_instances=False)
L.write_json(OUT.replace('.glb', '.json'), {'glb': os.path.relpath(OUT, L.ROOT), 'tris': tris, 'bytes': st['bytes'], 'length': round(-BOT, 4), 'cup_h': H,
                                            'origin': '鑰匙環最上面（扣在拉鍊頭上）；往 −y 垂下、吸管那面朝 +z（three.js 模型座標）'})
