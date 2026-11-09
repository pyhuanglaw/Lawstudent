"""單面網格「正面朝錯邊」離線掃描（LAWWW2-B 2026-11-09；BB-B 16:45：好拍洞洞板面朝向反了、遊戲裡被背面剔除，請掃其他間）。不用跑遊戲。
  /opt/blenv/bin/python tools/blender/env_second/lightbake/backface_scan.py -- <glb>... [--min 0.05] [--json 輸出.json]
每個「單面材質」（glTF doubleSided false → 遊戲只畫正面）的網格，面積加權算：
  貼著東西：從每個面上的取樣點（每 0.05 m² 一點，最多 64 點）沿法線（正面）射 5 cm，打到別的網格、而且那個面朝回來（法線相反）＝正面貼著牆。
            玩家從正面那一側到不了，看到的是背面，被剔除＝看不到。一片「板」整片都這樣就是裝反了（好拍洞洞板 100%）。
  朝室內：法線水平分量指向室內中心（地板網格的外框中心）的比例。只當參考：轉向店門的東西（好拍的球拍轉 30～40° 朝門）會被算成背對中心。
列出：板狀（flat ≥ 0.8：面積加權的平均法線長度，1＝整片同一個方向；盒子、圓柱接近 0）、前後 3 mm 內沒有反方向的雙胞胎（正反兩片拼成的雙面卡不算）、
  貼著東西 ≥ 50%、面積 ≥ --min（預設 0.05 m²）。
遊戲裡被背面剔除＝看不到；但 Cycles 烘焙兩面都擋光，所以這種東西也會讓看得到的牆變暗（好拍 11-08）。"""
import bpy, sys, re, json, math, random
rng = random.Random(0)
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import bmesh
A = sys.argv[sys.argv.index('--') + 1:]
def arg(k, d=None): return A[A.index(k) + 1] if k in A else d
MIN = float(arg('--min', 0.05)); OUT = arg('--json')
files = [a for i, a in enumerate(A) if a.endswith('.glb') and (i == 0 or A[i - 1] not in ('--json',))]
report = {}
for f in files:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=f)
    dg = bpy.context.evaluated_depsgraph_get()
    meshes = [o for o in bpy.data.objects if o.type == 'MESH' and len(o.data.polygons)]
    # 全部網格的 BVH（世界座標）；每個三角形記是哪個物件的
    bm = bmesh.new(); owner = []
    for oi, o in enumerate(meshes):
        t = bmesh.new(); t.from_mesh(o.data); t.transform(o.matrix_world); bmesh.ops.triangulate(t, faces=t.faces[:])
        me = bpy.data.meshes.new('tmp'); t.to_mesh(me); t.free(); bm.from_mesh(me); owner += [oi] * len(me.polygons); bpy.data.meshes.remove(me)
    bm.faces.ensure_lookup_table(); tree = BVHTree.FromBMesh(bm)
    floors = [o for o in meshes if re.search(r'floor', o.name, re.I)] or meshes
    pts = [o.matrix_world @ Vector(c) for o in floors for c in o.bound_box]
    cx = (min(p.x for p in pts) + max(p.x for p in pts)) / 2; cy = (min(p.y for p in pts) + max(p.y for p in pts)) / 2
    rows = []
    for oi, o in enumerate(meshes):
        mats = [s.material for s in o.material_slots if s.material]
        if not mats or not all(getattr(m, 'use_backface_culling', False) for m in mats): continue   # 有雙面材質就跳過（匯入器：doubleSided false → use_backface_culling True）
        mw = o.matrix_world; nm = mw.to_3x3().inverted().transposed()
        tot = blk = tow = horiz = twin = 0.0; nsum = Vector((0, 0, 0))
        vs = o.data.vertices
        for p in o.data.polygons:
            a = p.area * abs(mw.to_3x3().determinant()) ** (2 / 3)
            if a < 1e-8: continue
            c = mw @ p.center; n = (nm @ p.normal).normalized(); tot += a; nsum += n * a
            # 大的面（天花板只有兩個三角形）只射中心會失真：照面積取樣，每 0.05 m² 一點，最多 64 點，每點分到一樣的面積
            k = max(1, min(64, int(a / 0.05))); pv = [mw @ vs[i].co for i in p.vertices]
            for _ in range(k):
                if k == 1: q = c
                else:   # 多邊形扇形三角化，照面積隨機挑一塊、再隨機重心
                    w = [((pv[t] - pv[0]).cross(pv[t + 1] - pv[0])).length for t in range(1, len(pv) - 1)]; r_ = rng.random() * sum(w); t = 1
                    while t < len(w) and r_ > w[t - 1]: r_ -= w[t - 1]; t += 1
                    u_, v_ = rng.random(), rng.random()
                    if u_ + v_ > 1: u_, v_ = 1 - u_, 1 - v_
                    q = pv[0] + (pv[t] - pv[0]) * u_ + (pv[t + 1] - pv[0]) * v_
                hit = tree.ray_cast(q + n * 0.001, n, 0.05)
                if hit[0] is not None and owner[hit[2]] != oi and hit[1].dot(n) < -0.5: blk += a / k   # 正面 5 cm 內有一個面朝回來（例：牆的內面）＝這一點的正面貼著牆
                tw = tree.ray_cast(q + n * 0.003, -n, 0.006)   # 前後 3 mm 內有一片反方向的（正反兩片拼成雙面卡）
                if tw[0] is not None and owner[tw[2]] != oi and tw[1].dot(n) < -0.9: twin += a / k
            h = Vector((n.x, n.y, 0))
            if h.length > 0.7:
                horiz += a
                if h.dot(Vector((cx - c.x, cy - c.y, 0))) > 0: tow += a
        if tot < MIN: continue
        flat = nsum.length / tot   # 1＝整片同一個方向（板子）
        rows.append({'name': o.name, 'mat': [m.name for m in mats], 'area': round(tot, 2), 'flat': round(flat, 2),
                     'against': round(blk / tot, 2), 'toward': round(tow / horiz, 2) if horiz > 1e-6 else None, 'twin': round(twin / tot, 2)})
    # 只看「板」（flat ≥ 0.8：盒子、圓柱這種封閉的形狀本來就有朝各方向的面）；有反方向雙胞胎的（正反兩片拼成雙面）不算
    bad = [r for r in rows if r['flat'] >= 0.8 and r['twin'] < 0.5 and r['against'] >= 0.5]
    bad.sort(key=lambda r: -r['area'])
    report[f] = bad
    print('==', f, '單面網格', len(rows), '個；可疑', len(bad), flush=True)
    for r in bad: print('   %-40s %7.2f m²  貼著東西 %3d%%  朝室內 %s  %s' % (r['name'], r['area'], 100 * r['against'], '—' if r['toward'] is None else '%d%%' % (100 * r['toward']), ','.join(r['mat'])), flush=True)
if OUT: json.dump(report, open(OUT, 'w'), ensure_ascii=False, indent=1)
