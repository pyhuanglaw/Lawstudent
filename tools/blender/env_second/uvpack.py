"""自己算的 UV 島打包（背景模式的 bpy.ops.uv.pack_islands／smart_project 打包效率只有 1–8%：減面後的頭髮是很多細長的三角形）。
做法：UV 相同、邊相連的面＝一個島 → 每個島用主軸轉正（包圍盒最小）→ 照高度排序、架子式（shelf）擺放 → 二分搜尋最大的縮放倍數 → 寫回 UV。
島和島之間留 margin（UV 單位）。保留各個島之間的相對大小（smart_project 已經照 3D 大小定好）。"""
import math
import bmesh


def islands(bm, uvl, eps=1e-6):
    parent = list(range(len(bm.faces)))

    def find(a):
        while parent[a] != a: parent[a] = parent[parent[a]]; a = parent[a]
        return a
    bm.faces.ensure_lookup_table()
    for e in bm.edges:
        lf = e.link_faces
        if len(lf) != 2: continue
        f0, f1 = lf
        ok = True
        for v in e.verts:
            u0 = next(l[uvl].uv for l in f0.loops if l.vert == v); u1 = next(l[uvl].uv for l in f1.loops if l.vert == v)
            if (u0 - u1).length > eps: ok = False; break
        if ok: parent[find(f0.index)] = find(f1.index)
    groups = {}
    for f in bm.faces: groups.setdefault(find(f.index), []).append(f)
    return list(groups.values())


def pack(me, margin=0.004, rect=(0.0, 0.0, 1.0, 1.0), weight=None):
    """rect＝(x0, y0, 寬, 高)：打包到貼圖的這一塊（例如 LOD0 用上面四分之三、LOD1 用下面四分之一）。
    weight(faces)→倍數：這個島放大幾倍再排（例如坐姿替身的頭 ×2、桌子底下的腿 ×0.7：看得到的地方分到比較多貼圖）；不給＝照原本的大小"""
    RX, RY, RW, RH = rect
    bm = bmesh.new(); bm.from_mesh(me); uvl = bm.loops.layers.uv.active
    isl = islands(bm, uvl); boxes = []
    for faces in isl:
        pts = [l[uvl].uv.copy() for f in faces for l in f.loops]
        cx = sum(p.x for p in pts) / len(pts); cy = sum(p.y for p in pts) / len(pts)
        sxx = sum((p.x - cx) ** 2 for p in pts); syy = sum((p.y - cy) ** 2 for p in pts); sxy = sum((p.x - cx) * (p.y - cy) for p in pts)
        ang = 0.5 * math.atan2(2 * sxy, sxx - syy)   # 主軸
        c, s = math.cos(-ang), math.sin(-ang)
        g = weight(faces) if weight else 1.0
        rot = [(((p.x - cx) * c - (p.y - cy) * s) * g, ((p.x - cx) * s + (p.y - cy) * c) * g) for p in pts]
        x0 = min(r[0] for r in rot); x1 = max(r[0] for r in rot); y0 = min(r[1] for r in rot); y1 = max(r[1] for r in rot)
        w, h = x1 - x0, y1 - y0
        if w < h: rot = [(-r[1], r[0]) for r in rot]; x0, x1, y0, y1 = -y1, -y0, x0, x1; w, h = h, w   # 長邊放橫的
        boxes.append(dict(faces=faces, w=w, h=h, x0=x0, y0=y0, rotpts=rot))
    order = sorted(range(len(boxes)), key=lambda i: -boxes[i]['h'])

    def place(k):
        x = y = rowh = 0.0; pos = {}
        for i in order:
            b = boxes[i]; w, h = b['w'] * k + margin, b['h'] * k + margin
            if x + w > RW: x = 0.0; y += rowh; rowh = 0.0
            if w > RW: return None
            pos[i] = (x, y); x += w; rowh = max(rowh, h)
        return pos if y + rowh <= RH else None
    lo, hi = 0.0, 1e6
    for _ in range(60):
        mid = (lo + hi) / 2
        if place(mid) is not None: lo = mid
        else: hi = mid
    k = lo; pos = place(k)
    for i, b in enumerate(boxes):
        px, py = pos[i]; j = 0
        for f in b['faces']:
            for l in f.loops:
                rx, ry = b['rotpts'][j]; j += 1
                l[uvl].uv = (RX + px + margin / 2 + (rx - b['x0']) * k, RY + py + margin / 2 + (ry - b['y0']) * k)
    bm.to_mesh(me); bm.free()
    area = 0.0
    uv = me.uv_layers.active
    for p in me.polygons:
        q = [uv.data[li].uv for li in p.loop_indices]
        for t in range(1, len(q) - 1):
            (a0, b0), (a1, b1), (a2, b2) = q[0], q[t], q[t + 1]; area += abs((a1 - a0) * (b2 - b0) - (a2 - a0) * (b1 - b0)) / 2
    return len(boxes), area
