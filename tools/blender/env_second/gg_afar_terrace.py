"""公館 afar café 門口騎樓的戶外小桌（ZQ-C504-LAPTOP-1101 方案 A；LAWWW2-C 2026-11-13，LAWWW-C 11-13 21:2x 選 A）→ assets/models/env/second_ai/gg_afar_terrace.glb（＋.json）。
子晴 c504_4_3（2026 暑假，heroine_circle.js）在「公館騎樓的咖啡店」(12, 20.6)：旁白是咖啡店桌邊、筆電開著、旁邊一杯冰美式——afar 門口原本沒有座位。
做法：afar（G07，世界 x 6.5～14.5、玻璃在 z 22）大窗前一組戶外摺疊桌＋兩張椅子（Poly Haven outdoor_table_chair_set_01，CC0 掃描模型，D160），
沿著玻璃擺（桌子靠窗、椅子在桌子東西兩邊面對面），騎樓照樣留 2 m 走得通；桌上靠西邊那張椅子一杯冰美式（透明塑膠杯、咖啡、冰塊、吸管）。
座位、導航阻擋在 zones3d.js（座位位置照這支寫進 .json 的 seats）。
座標：公館區域（x 往東、z 往南，y 朝上），GLB 原點＝區域原點。
  /opt/blenv/bin/python tools/blender/env_second/gg_afar_terrace.py [-- --out <glb>]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B   # noqa: E402
import cc0_aakit   # noqa: E402
import bpy   # noqa: E402
from mathutils import Vector   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/gg_afar_terrace.glb'))

CX, CZ = 12.3, 21.45      # 整組的中心（玻璃 z 22 往外 0.55；c504_4_3 的作息點 (12, 20.6) 離西邊那張椅子 1 m 內）
YAW = math.pi / 2         # 整組轉 90°：兩張椅子沿著玻璃（東西向），桌子在中間
def g2b(x, y, z): return Vector((x, -z, y))


def cup(kit_mats, root, x, z, y0):
    """冰美式：透明塑膠杯（上寬下窄）、咖啡、冰塊、綠吸管、杯蓋"""
    import bmesh
    def cyl(name, mat, r0, r1, h, y, seg=20, cap_top=True):
        me = bpy.data.meshes.new(name); bm = bmesh.new()
        ring = lambda r, yy: [bm.verts.new(g2b(x + r * math.cos(2 * math.pi * k / seg), yy, z + r * math.sin(2 * math.pi * k / seg))) for k in range(seg)]
        a, b = ring(r0, y), ring(r1, y + h)
        for k in range(seg): bm.faces.new((a[k], a[(k + 1) % seg], b[(k + 1) % seg], b[k]))
        bm.faces.new(list(reversed(a)))
        if cap_top: bm.faces.new(b)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
        o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o); o.parent = root; o.data.materials.append(mat)
        for p in o.data.polygons: p.use_smooth = True
        return o
    cyl('gat_cup', kit_mats['cup'], 0.032, 0.045, 0.15, y0, cap_top=False)
    cyl('gat_coffee', kit_mats['coffee'], 0.03, 0.041, 0.115, y0 + 0.004)
    cyl('gat_lid', kit_mats['cup'], 0.047, 0.044, 0.012, y0 + 0.15)
    for k, (dx, dz, dy) in enumerate(((0.012, 0.008, 0.1), (-0.014, 0.01, 0.092), (0.002, -0.015, 0.105))):   # 冰塊（浮在上面三顆）
        me = bpy.data.meshes.new(f'gat_ice{k}'); o = bpy.data.objects.new(f'gat_ice{k}', me); bpy.context.scene.collection.objects.link(o); o.parent = root
        import bmesh as _b; bm = _b.new(); _b.ops.create_cube(bm, size=0.018); bm.to_mesh(me); bm.free()
        o.location = g2b(x + dx, y0 + dy, z + dz); o.rotation_euler = (0.3 * k, 0.5, 0.7 * k); o.data.materials.append(kit_mats['ice'])
    s = cyl('gat_straw', kit_mats['straw'], 0.0035, 0.0035, 0.21, y0 + 0.02, seg=8)
    s.rotation_mode = 'XYZ'


def build():
    B.reset(texres=512)
    root = B.group('gg_afar_terrace', props={'kind': 'gg_afar_terrace', 'note': 'ZQ-C504-LAPTOP-1101：afar café 門口騎樓戶外小桌（Poly Haven outdoor_table_chair_set_01）；座位、導航在 zones3d.js'})
    K0 = cc0_aakit.Kit(L, B, root, g2b, prefix='gat_')
    o = K0.ph_put('outdoor_table_chair_set_01', CX, 0.0, CZ, YAW, 1.0, share=False)
    # 杯子材質（透明塑膠、咖啡、冰、吸管）
    mats = {
        'cup': L.flat('gat_cup_plastic', '#e8eef0', rough=0.15, alpha=0.35),
        'coffee': L.flat('gat_coffee', '#3a2416', rough=0.3),
        'ice': L.flat('gat_ice', '#d9e6ea', rough=0.1),
        'straw': L.flat('gat_straw', '#2f7a4a', rough=0.4),
    }
    # 桌面高度、各件中心：從 Poly Haven 原型的三件（table、chair_01、chair_02）量（原型 join 成一個網格前的原檔再讀一次）
    import cc0_fetch
    bpy.ops.import_scene.gltf(filepath=cc0_fetch.ph_model('outdoor_table_chair_set_01'))
    parts = {}
    for ob in [x for x in bpy.context.selected_objects if x.type == 'MESH']:
        bb = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
        parts[ob.name.split('_')[-1] if 'chair' in ob.name else 'table'] = ([min(v[i] for v in bb) for i in range(3)], [max(v[i] for v in bb) for i in range(3)])
    for ob in list(bpy.context.selected_objects): bpy.data.objects.remove(ob)
    allmn = [min(p[0][i] for p in parts.values()) for i in range(3)]; allmx = [max(p[1][i] for p in parts.values()) for i in range(3)]
    c0 = ((allmn[0] + allmx[0]) / 2, (allmn[1] + allmx[1]) / 2)
    def to_game(bx, by):   # 原型（Blender，置中）→ 轉 YAW → 遊戲座標
        x_, y_ = bx - c0[0], by - c0[1]; xr, yr = x_ * math.cos(YAW) - y_ * math.sin(YAW), x_ * math.sin(YAW) + y_ * math.cos(YAW)
        return CX + xr, CZ - yr
    info_parts = {}
    for k, (mn, mx) in parts.items():
        gx, gz = to_game((mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2)
        corners = [to_game(a, b) for a in (mn[0], mx[0]) for b in (mn[1], mx[1])]
        info_parts[k] = {'x': round(gx, 3), 'z': round(gz, 3), 'top': round(mx[2], 3),
                         'rect': [round(min(c[0] for c in corners), 3), round(min(c[1] for c in corners), 3), round(max(c[0] for c in corners), 3), round(max(c[1] for c in corners), 3)]}
    tb = info_parts['table']
    seats = []
    for k in ('01', '02'):
        ch = info_parts[k]; yaw = math.atan2(tb['x'] - ch['x'], tb['z'] - ch['z'])   # 面向桌子（遊戲 yaw：0＝朝 +z）
        seats.append({'x': ch['x'], 'z': ch['z'], 'yaw': round(yaw, 4), 'chair': k})
    west = min(seats, key=lambda s: s['x'])
    cx_, cz_ = tb['x'] + (west['x'] - tb['x']) * 0.45, tb['z'] - 0.12   # 杯子：桌面靠西邊那張椅子、靠騎樓那一側
    cup(mats, root, cx_, cz_, tb['top'])
    K0.cleanup()
    info = L.export(OUT, gpu_instances=False)
    info.update({'note': 'ZQ-C504-LAPTOP-1101 afar 門口騎樓戶外小桌', 'center': [CX, CZ], 'parts': info_parts, 'seats': seats, 'cup': [round(cx_, 3), round(cz_, 3)],
                 'cc0': sorted(set(K0.used)) + [('Poly Haven', 'outdoor_table_chair_set_01')]})
    L.write_json(OUT[:-4] + '.json', info)
    return info


if __name__ == '__main__':
    print(build())
