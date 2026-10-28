"""光照貼圖的後處理，不用重烘（LM-SEAM-1028，LAWWW2-C 2026-10-28）：
看不到、不分像素的面（bake_room.py 把它們的光照座標收成一點：面積 0），和夾在零件中間、烘成全黑的面（白天、晚上兩張都 < --thr），
改接到別的面的光。貼圖不動，只改 GLB 裡第二套 UV（TEXCOORD_1）；其他照原樣匯出（節點、名字、自訂屬性、場景的 extras.lightmap）。
為什麼：
  - 方塊拼的牆段在接縫是 T 形接頭（一邊有頂點、一邊沒有），畫的時候露出一點一點的縫，看到的就是這些面。
  - 烘成全黑的：門框上方一條條點狀黑線（男一舍門廳第一次正式烘焙；之前交的 201、202、霖澤館大廳、萬才館也有 60～470 m² 全黑的面）。
  - 收成「整個物件最大那一面中間的光」的（bake_room.py 原本的做法）：門洞、樓梯間開口的側面看得到，變成別處的亮度（男一舍門廳：樓梯間開口旁兩條暗的直條）。
怎麼接（從面的中心往外 2 mm 沿法線射一條線，先分三種）：
  0. 朝建築外面的（什麼都沒碰到：外牆的外側、地板朝外的切邊、貼在牆上朝牆外的背面）：不動。
     只在鏡頭跑到牆外、牆淡出的時候看得到；改了反而會變（霖澤館大廳地板朝外的切邊變黑、202 貼在牆上的背面和牆疊在一起露出一塊暗影）。
  1. 夾在中間的（碰到別的面的背面＝在別的方塊裡面，或 5 mm 內就碰到東西＝貼著別的面）：
     接到共用一條邊、看得到的那一面（最大的那一面）——光照座標投影到共用的那條邊上，往那一面裡面縮 1.5 個像素。接縫兩邊的光一樣，露縫也看不出來。
  2. 露在外面的：接附近（60 cm 內）朝同一個方向、看得到的面上最近那一點的光（可以是別的物件：整間共用一張光照貼圖）。
     不接鄰面：鄰面和它垂直（樓梯間開口的側面朝走廊，鄰面朝樓梯井，走廊的燈照不到）。
     附近沒有同方向的面：烘成全黑的不動（很深的縫本來就是暗的）；沒分像素的照 1 的做法。
  3. 都找不到：最近一個看得到的面中間的光。
用法：/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in 房間.glb --out 輸出.glb --lm 光照貼圖前綴（不含 _day.webp） [--thr 0.004] [--report 每個物件改了幾個面.json]
"""
import bpy, bmesh, sys, os, json
import numpy as np
from mathutils import Vector
from mathutils.kdtree import KDTree
from mathutils.bvhtree import BVHTree
from mathutils import geometry as G
from PIL import Image

A = sys.argv[sys.argv.index('--') + 1:]
def arg(k, d=None): return A[A.index(k) + 1] if k in A else d
IN, OUT, LMP = arg('--in'), arg('--out'), arg('--lm'); THR = float(arg('--thr', '0.004')); REPORT = arg('--report'); DEBUG = arg('--debug')

def load(p):
    a = np.asarray(Image.open(p).convert('RGB')).astype(np.float32) / 255
    return np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4).max(axis=2)
DAY, NIGHT = load(LMP + '_day.webp'), load(LMP + '_night.webp'); H, W = DAY.shape
def lmval(uv):
    """Blender 的 UV（v 往上）→ 圖的像素（第一列在上面，glTF 的 v＝1−v）"""
    x = min(W - 1, max(0, int(uv.x * W))); y = min(H - 1, max(0, int((1.0 - uv.y) * H)))
    return max(float(DAY[y, x]), float(NIGHT[y, x]))
def uvarea(f, uv):
    p = [l[uv].uv for l in f.loops]; a = 0.0
    for i in range(1, len(p) - 1): a += abs((p[i].x - p[0].x) * (p[i + 1].y - p[0].y) - (p[i + 1].x - p[0].x) * (p[i].y - p[0].y)) / 2
    return a
def uvc(f, uv): return sum((l[uv].uv for l in f.loops), Vector((0, 0))) / len(f.loops)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath(IN))
st = {'objects': 0, 'collapsed': 0, 'black': 0, 'outward_keep': 0, 'enclosed_edge': 0, 'same_dir': 0, 'dark_keep': 0, 'exposed_edge': 0, 'nearest': 0}
REP = {}; DBG = []   # --report：物件 → {收成一點／全黑 × 怎麼接的: [面數, 面積 m²]}；--debug：每一個改了的面（開發時查用）
def rep(o, kind, how, f, mw, src=None):
    r = REP.setdefault(o.name, {}).setdefault(kind + '/' + how, [0, 0.0]); r[0] += 1
    a = sum(((mw @ f.verts[i].co - mw @ f.verts[0].co).cross(mw @ f.verts[i + 1].co - mw @ f.verts[0].co)).length / 2 for i in range(1, len(f.verts) - 1)); r[1] += a
    if DEBUG: c = mw @ f.calc_center_median(); DBG.append({'obj': o.name, 'kind': kind, 'how': how, 'c': [round(v, 3) for v in c], 'area': round(a, 4), 'src': src})
inset = 1.5 / W

# 整個場景（世界座標）的 BVH：分辨「朝建築外面」「夾在中間」「露在外面」
_V, _P = [], []
for o in [o for o in bpy.data.objects if o.type == 'MESH']:
    mw = o.matrix_world; b0 = len(_V)
    _V.extend(mw @ v.co for v in o.data.vertices); _P.extend([b0 + i for i in p.vertices] for p in o.data.polygons)
BVH = BVHTree.FromPolygons(_V, _P)
def probe(c, n):
    hit = BVH.ray_cast(c + n * 0.002, n, 50.0)
    if hit[0] is None: return 'out'   # 什麼都沒碰到：朝建築外面
    return 'in' if (hit[3] < 0.005 or hit[1].dot(n) > 0.0) else 'open'   # 5 mm 內就碰到東西（貼著別的面），或碰到的是背面（在別的方塊裡面）

# ---- 第一輪：每個有光照貼圖的網格，分出要改的面；看得到的面記下來（世界座標的三角形＋光照座標）給第二輪找「附近同方向」用 ----
OBJ = []; REC = []   # REC：(世界座標的頂點[], 光照座標[], 世界法線, 中心)
for o in [o for o in bpy.data.objects if o.type == 'MESH' and len(o.data.uv_layers) >= 2]:
    me = o.data; lmname = me.uv_layers[1].name
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)   # glTF 照 UV 拆開的頂點接回去（才找得到共用的邊）；每個面角的 UV 照舊
    uv = bm.loops.layers.uv[lmname]; bm.faces.ensure_lookup_table(); bm.normal_update()
    mw = o.matrix_world; mn = mw.to_3x3().inverted().transposed()
    bad = {}
    for f in bm.faces:
        if uvarea(f, uv) < 1e-12: bad[f.index] = 'collapsed'; st['collapsed'] += 1
        elif lmval(uvc(f, uv)) < THR: bad[f.index] = 'black'; st['black'] += 1
        else: REC.append(([mw @ l.vert.co for l in f.loops], [l[uv].uv.copy() for l in f.loops], (mn @ f.normal).normalized(), mw @ f.calc_center_median(), o.name))
    OBJ.append((o, bm, uv, bad, mw, mn))
KD = KDTree(max(1, len(REC)))
for i, r in enumerate(REC): KD.insert(r[3], i)
KD.balance()
def uv_on(rec, p):
    """p（世界座標）投到那一面上最近的一點，回傳那一點的光照座標（三角形重心座標內插）"""
    vs, us = rec[0], [Vector((u.x, u.y, 0.0)) for u in rec[1]]; best = None
    for i in range(1, len(vs) - 1):
        q = G.closest_point_on_tri(p, vs[0], vs[i], vs[i + 1]); d = (q - p).length
        if best is None or d < best[0]: best = (d, q, i)
    d, q, i = best; r = G.barycentric_transform(q, vs[0], vs[i], vs[i + 1], us[0], us[i], us[i + 1]); return Vector((r.x, r.y))
def fdist(rec, p):
    vs = rec[0]; return min((G.closest_point_on_tri(p, vs[0], vs[i], vs[i + 1]) - p).length for i in range(1, len(vs) - 1))
def edge_proj(f, bad, uv):
    """共用一條邊、看得到的那一面（最大的）：光照座標投影到那條邊上，往那一面裡面縮 1.5 個像素"""
    best = None
    for e in f.edges:
        for g in e.link_faces:
            if g is f or g.index in bad: continue
            if best is None or g.calc_area() > best[0].calc_area(): best = (g, e)
    if not best: return None
    g, e = best; v1, v2 = e.verts; lg = {l.vert: l[uv].uv.copy() for l in g.loops}; u1, u2 = lg[v1], lg[v2]; cg = uvc(g, uv)
    d = v2.co - v1.co; L2 = d.length_squared; out = []
    for l in f.loops:
        t = 0.0 if L2 < 1e-12 else max(0.0, min(1.0, (l.vert.co - v1.co).dot(d) / L2))
        p = u1.lerp(u2, t); q = cg - p
        out.append(p + (q.normalized() * inset if q.length > 2 * inset else q * 0.5))
    return out

# ---- 第二輪：改光照座標 ----
for (o, bm, uv, bad, mw, mn) in OBJ:
    if not bad: bm.free(); continue
    new = {}
    for fi in bad:
        f = bm.faces[fi]; cw = mw @ f.calc_center_median(); nw_ = (mn @ f.normal); nw_ = nw_.normalized() if nw_.length > 1e-9 else nw_
        where = 'in' if nw_.length < 0.5 else probe(cw, nw_)
        if where == 'out': st['outward_keep'] += 1; rep(o, bad[fi], 'outward_keep', f, mw); continue
        if where == 'in':
            out = edge_proj(f, bad, uv)
            if out: new[fi] = out; st['enclosed_edge'] += 1; rep(o, bad[fi], 'enclosed_edge', f, mw); continue
        else:
            cand = [REC[i_] for (co_, i_, d_) in KD.find_range(cw, 4.0) if REC[i_][2].dot(nw_) > 0.8]   # 中心 4 m 內（大的面中心離得遠），再照真的距離（到那一面最近的點）挑
            cand = [(fdist(r, cw), r) for r in cand]; cand = [t for t in cand if t[0] < 0.6]
            if cand:
                rec = min(cand, key=lambda t: t[0])[1]; new[fi] = [uv_on(rec, mw @ l.vert.co) for l in f.loops]; st['same_dir'] += 1
                rep(o, bad[fi], 'same_dir', f, mw, {'obj': rec[4], 'c': [round(v, 3) for v in rec[3]], 'val': round(lmval(sum(rec[1], Vector((0, 0))) / len(rec[1])), 4)}); continue
            if bad[fi] == 'black': st['dark_keep'] += 1; rep(o, bad[fi], 'dark_keep', f, mw); continue
            out = edge_proj(f, bad, uv)
            if out: new[fi] = out; st['exposed_edge'] += 1; rep(o, bad[fi], 'exposed_edge', f, mw); continue
        if len(REC):
            co_, i_, d_ = KD.find(cw); c = sum(REC[i_][1], Vector((0, 0))) / len(REC[i_][1])
            new[fi] = [c.copy() for _ in f.loops]; st['nearest'] += 1; rep(o, bad[fi], 'nearest', f, mw)
    for fi, out in new.items():   # 全部算完才寫（先寫的不影響後面算的）
        for l, p in zip(bm.faces[fi].loops, out): l[uv].uv = p
    bm.to_mesh(o.data); bm.free(); st['objects'] += 1
print(json.dumps({'lm_fix_hidden': st}, ensure_ascii=False), flush=True)
if DEBUG: json.dump(DBG, open(DEBUG, 'w', encoding='utf-8'), ensure_ascii=False)
if REPORT: json.dump({k: {h: [n, round(a, 3)] for h, (n, a) in v.items()} for k, v in REP.items()}, open(REPORT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
bpy.ops.export_scene.gltf(filepath=os.path.abspath(OUT), export_format='GLB', export_texcoords=True, export_normals=True, export_extras=True,
                          export_yup=True, export_image_format='AUTO', export_lights=False, export_cameras=False)
print('exported', OUT, flush=True)
