"""室內正式模型（room GLB）的鏡頭遮擋盤點（LAWWW2 2026-10-22）——不需要瀏覽器、不需要 Blender（Python＋numpy 讀 GLB）。
跟隨鏡頭照 engine3d.js 的 followCam 算（camDist、俯角 0.38、頭高 1.45 m；有 --camwalls 時照它的拉近、抬高規則），
在每個站得住的點（0.5 m 一格；配置的範圍扣掉 blocks）和每個座位、8 個方向，從鏡頭往人身上 12 個點（站著：0.5／0.9／1.3／1.65 m；
坐著：0.95／1.15／1.35 m；左右各 0.18 m）拉線，看有幾條被「不會淡出」的網格擋住：
  - WALL_* 會淡出（Z3.attachRoomGLB），不算；
  - 單面材質從背面看不到（天花板只朝下），不算；
  - --seethru 列的材質當作網點透空（engine3d.js 樹幹透視），不算。
擋住 --thr（預設 0.3）以上算「擋住」，依擋最多的網格（節點名字／材質）統計，坐著被擋的另外列出。
用法（repo 根目錄）：
  python3 tools/blender/env_second/room_cam_audit.py <glb> <wz_shops 的 key 或 118 巷的 layout.json> \
      [--dist 4.0] [--pitch 0.38] [--thr 0.3] [--seethru 材質,材質] [--camwalls '[[x,z,寬,深],…]']
例：python3 tools/blender/env_second/room_cam_audit.py assets/models/env/second_ai/wz_teahouse_interior.glb teahouse
注意：
  - 站得住是用配置的範圍和 blocks 估的（人半徑 0.33），不是遊戲的導航格；一盞茶屋的範圍是 z −5～9.6（openFront）。
  - 鏡頭牆比天花板高 2 m（和 wzShop 的 camWalls 一樣）。
  - 這是找問題的工具，數字不是驗收標準；看到可疑的，要到遊戲裡拍同一個位置確認。
"""
import json, struct, sys, math, subprocess
import numpy as np

def load_glb(p):
    b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n]); off = 20 + n
    bl = struct.unpack('<I', b[off:off + 4])[0]; bin_ = b[off + 8:off + 8 + bl]
    def acc(i):
        a = j['accessors'][i]; bv = j['bufferViews'][a['bufferView']]; o = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
        comp = {5126: ('<f4', 4), 5125: ('<u4', 4), 5123: ('<u2', 2), 5121: ('<u1', 1)}[a['componentType']]
        ncomp = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]; st = bv.get('byteStride', comp[1] * ncomp)
        if st == comp[1] * ncomp: return np.frombuffer(bin_, dtype=comp[0], count=a['count'] * ncomp, offset=o).reshape(a['count'], ncomp) if ncomp > 1 else np.frombuffer(bin_, dtype=comp[0], count=a['count'], offset=o)
        raw = np.frombuffer(bin_, dtype=np.uint8, count=st * a['count'], offset=o).reshape(a['count'], st)
        return raw[:, :comp[1] * ncomp].copy().view(comp[0]).reshape(a['count'], ncomp)
    def trs(nd):
        if 'matrix' in nd: return np.array(nd['matrix'], dtype=float).reshape(4, 4).T
        t = nd.get('translation', [0, 0, 0]); r = nd.get('rotation', [0, 0, 0, 1]); s = nd.get('scale', [1, 1, 1]); x, y, z, w = r
        R = np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)], [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)], [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
        M = np.eye(4); M[:3, :3] = R * np.array(s); M[:3, 3] = t; return M
    out = []
    def walk(i, P):
        nd = j['nodes'][i]; M = P @ trs(nd)
        if nd.get('mesh') is not None:
            for pr in j['meshes'][nd['mesh']]['primitives']:
                pos = acc(pr['attributes']['POSITION']).astype(float); idx = acc(pr['indices']).astype(np.int64).reshape(-1, 3) if 'indices' in pr else np.arange(len(pos)).reshape(-1, 3)
                pw = (np.c_[pos, np.ones(len(pos))] @ M.T)[:, :3]
                mt = j['materials'][pr['material']] if pr.get('material') is not None else {}
                out.append((nd.get('name', '?'), mt.get('name', '?'), pw[idx], bool(mt.get('doubleSided', False))))
        for c in nd.get('children', []): walk(c, M)
    for r in j['scenes'][j.get('scene', 0)]['nodes']: walk(r, np.eye(4))
    return out

def seg_hits(tris, a, b, eps=1e-9):
    """線段 a→b 和三角形（N,3,3）的交點參數 t（0..1），沒交到是 inf"""
    d = b - a; v0 = tris[:, 0]; e1 = tris[:, 1] - v0; e2 = tris[:, 2] - v0
    p = np.cross(d, e2); det = np.einsum('ij,ij->i', e1, p); ok = np.abs(det) > eps; inv = np.where(ok, 1.0 / np.where(ok, det, 1), 0)
    s = a - v0; u = np.einsum('ij,ij->i', s, p) * inv; q = np.cross(s, e1); v = np.einsum('j,ij->i', d, q) * inv; t = np.einsum('ij,ij->i', e2, q) * inv
    hit = ok & (u >= 0) & (v >= 0) & (u + v <= 1) & (t > 0) & (t < 1)
    return np.where(hit, t, np.inf)

def main():
    glb = sys.argv[1]; lay_arg = sys.argv[2]
    dist = float(sys.argv[sys.argv.index('--dist') + 1]) if '--dist' in sys.argv else 4.0
    pitch = float(sys.argv[sys.argv.index('--pitch') + 1]) if '--pitch' in sys.argv else 0.38
    if lay_arg.endswith('.json'): L = json.load(open(lay_arg))
    else: L = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./src/data/wz_shops_layout.js')))"]))[lay_arg]
    meshes = load_glb(glb)
    keep = [(n, m, t, ds) for n, m, t, ds in meshes if not n.startswith('WALL_')]
    tris = np.concatenate([t for _, _, t, _ in keep]); owner = np.concatenate([np.full(len(t), i) for i, (_, _, t, _) in enumerate(keep)])
    dbl = np.concatenate([np.full(len(t), ds) for _, _, t, ds in keep])
    nrm = np.cross(tris[:, 1] - tris[:, 0], tris[:, 2] - tris[:, 0])   # 三角形正面（逆時針）的法線
    if 'bounds' in L:   # 118 巷的店：bounds {x0,x1,z0,z1}、blocks [{x0,x1,z0,z1}]、cam_dist
        Bd = L['bounds']; W, D = Bd['x1'] - Bd['x0'], Bd['z1'] - Bd['z0']; CX, CZ = (Bd['x0'] + Bd['x1']) / 2, (Bd['z0'] + Bd['z1']) / 2
        blocks = [[(b['x0'] + b['x1']) / 2, (b['z0'] + b['z1']) / 2, b['x1'] - b['x0'], b['z1'] - b['z0']] for b in L.get('blocks', [])]
        if '--dist' not in sys.argv and L.get('cam_dist'): dist = float(L['cam_dist'])
    else: W, D = L['w'], L['d']; CX = CZ = 0.0; blocks = L.get('blocks', [])
    R = 0.33
    zoff = L.get('_zoff', 0.0)
    z0r, z1r = (-5.0, 9.6) if L.get('front', {}).get('openFront') else (CZ - D / 2, CZ + D / 2)
    def stand(x, z):
        if abs(x - CX) > W / 2 - R or z < z0r + R or z > z1r - R: return False
        for bx, bz, bw, bd in blocks:
            if abs(x - bx) < bw / 2 + R * 0.7 and abs(z - bz) < bd / 2 + R * 0.7: return False
        return True
    pts = [(x, z, 'grid') for x in np.arange(CX - W / 2 + 0.5, CX + W / 2 - 0.4, 0.5) for z in np.arange(z0r + 0.5, z1r - 0.4, 0.5) if stand(x, z)]
    pts += [(s['x'], s['z'], 'seat') for s in L.get('seats', []) if not s.get('npcOnly')]
    THR = float(sys.argv[sys.argv.index('--thr') + 1]) if '--thr' in sys.argv else 0.3
    SEE = set(sys.argv[sys.argv.index('--seethru') + 1].split(',')) if '--seethru' in sys.argv else set()
    CW = json.loads(sys.argv[sys.argv.index('--camwalls') + 1]) if '--camwalls' in sys.argv else []
    HH = L.get('h', 3.0) + 2.0   # 鏡頭牆比天花板高 2 m（鏡頭在天花板上方往下看時，越過隔間上緣的線也要擋）
    if SEE:
        see = np.array([keep[o][1] in SEE for o in range(len(keep))])[owner]
        tris_ = tris[~see]; owner_ = owner[~see]; dbl_ = dbl[~see]; nrm_ = nrm[~see]
    else: tris_, owner_, dbl_, nrm_ = tris, owner, dbl, nrm
    def box_hit(a, b):
        """線段 a→b 和鏡頭牆（軸對齊的盒子，高 HH）最近的交點距離（沒有就 inf）"""
        d = b - a; L_ = np.linalg.norm(d); u = d / L_; best = np.inf
        for bx, bz, bw, bd in CW:
            lo = np.array([bx - bw / 2, 0.0, bz - bd / 2]); hi = np.array([bx + bw / 2, HH, bz + bd / 2])
            with np.errstate(divide='ignore', invalid='ignore'):
                t1 = (lo - a) / u; t2 = (hi - a) / u
            tmin = np.nanmax(np.minimum(t1, t2)); tmax = np.nanmin(np.maximum(t1, t2))
            if tmax >= max(tmin, 0) and tmin <= L_ and tmin >= 0: best = min(best, tmin)
        return best
    def follow(head, yaw):
        cam = head + np.array([math.sin(yaw) * dist * math.cos(pitch), math.sin(pitch) * dist + 0.2, math.cos(yaw) * dist * math.cos(pitch)])
        if not CW: return cam
        hd = box_hit(head, cam)
        if not np.isfinite(hd): return cam
        u = (cam - head) / np.linalg.norm(cam - head); dd = hd - 0.35 if hd - 0.35 >= 0.7 else max(0.12, hd - 0.15)
        out = head + u * dd; out[1] += min(0.9, (1 - dd / dist) * 1.0)
        h3 = box_hit(head, out)
        if np.isfinite(h3): u2 = (out - head) / np.linalg.norm(out - head); out = head + u2 * max(0.12, h3 - 0.15)
        return out
    n = bad = 0; byobj = {}; ex = {}; seatbad = []
    for x, z, kind in pts:
        for k in range(8):
            yaw = k * math.pi / 4; fx, fz = math.sin(yaw), math.cos(yaw)
            head = np.array([x, 1.45, z])
            cam = follow(head, yaw)
            sx, sz = fz, -fx   # 和視線垂直的水平方向
            ys = (0.95, 1.15, 1.35) if kind == 'seat' else (0.5, 0.9, 1.3, 1.65)   # 坐著：上半身和頭（下半身被桌子、椅背擋住是正常的）
            body = [np.array([x + sx * o, y, z + sz * o]) for y in ys for o in (-0.18, 0.0, 0.18)]
            blk = {}; nb = 0
            for bp in body:
                t = seg_hits(tris_, cam, bp)
                facing = (nrm_ @ (bp - cam)) < 0                      # 從鏡頭看過去是正面
                t = np.where(dbl_ | facing, t, np.inf)                # 單面材質：背面看不到（天花板只朝下）
                i = int(np.argmin(t))
                if np.isfinite(t[i]) and t[i] < 0.97:
                    nb += 1; key = (keep[owner_[i]][0], keep[owner_[i]][1]); blk[key] = blk.get(key, 0) + 1
            n += 1; cov = nb / len(body)
            if cov >= THR:
                bad += 1; key = max(blk.items(), key=lambda kv: kv[1])[0]; byobj[key] = byobj.get(key, 0) + 1
                ex.setdefault(key, []).append((round(float(x), 2), round(float(z), 2), k, round(cov, 2), kind, [round(float(v), 2) for v in cam]))
                if kind == 'seat': seatbad.append((round(float(x), 2), round(float(z), 2), k, round(cov, 2), key[1]))
    print(json.dumps({'glb': glb.split('/')[-1], 'positions': len(pts), 'views': n, 'blocked': bad, 'pct': round(100 * bad / max(1, n), 1), 'thr': THR}, ensure_ascii=False))
    for key, c in sorted(byobj.items(), key=lambda kv: -kv[1])[:14]:
        e = ex[key]; seats = sum(1 for q in e if q[4] == 'seat')
        print(f'  {c:5d}  {key[0]} / {key[1]}  坐著 {seats}  例 {e[0]}')
    print('  坐著被擋（位置、方向 k×45°、遮住比例、材質）：', seatbad[:14], '…' if len(seatbad) > 14 else '')

main()
