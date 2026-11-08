"""淡出以後露出烘焙陰影的地方（11-08 LAWWW2-B；BB-B 隔間牆雲端判：總圖 B1 自習室 A 牆腳深藍黑帶、霖澤 5F 研究室左牆深褐斜帶）。不需要 Blender：
  python3 tools/blender/env_second/lightbake/lm_fade_reveal_check.py <glb> <白天光照 webp> [--samples 400] [--gap 0.3] [--json out.json]
原理：
  - 烘焙時，緊貼在一個面前面的東西（護牆板、開著的門板、櫃子）會擋光，被擋住的那一塊烘出來是暗的。只要擋光的東西一直在，那一塊本來就看不到。
  - 遊戲的 fadeWalls 會把 WALL_ 網格淡出、藏起來。擋光的是 WALL_ 網格、被擋的面（接收面）卻還顯示的時候，就露出那一塊暗的。
  - 兩個例子：B1 的木護牆板和它後面的牆各自用自己的外框中心判斷（同一面牆，判斷點差幾公分）；
    5F 研究室開著的門板屬於 P1 那面牆，卻貼在 P2 牆前 15 cm——鏡頭在走廊、P1 淡出時門板跟著不見，P2 上門板的影子露出來。
做法（照 three.js GLTFLoader＋zones3d.js attachRoomGLB 的規則算每個網格的淡出參數）：
  1. WALL_ 網格：dir＝自己的 extras.dir，沒有就往上層找；判斷點＝extras.at（GLB 座標），沒有就用外框中心；partition＝自己的 extras.partition。
     多個 primitive 的節點：three.js 把節點變成 Group，底下的網格叫 mesh 的名字、userData 是 mesh 的 extras（節點的 partition、at 拿不到），照實模擬。
     其他網格一直顯示。
  2. 在房間的外框裡隨機取 N 組鏡頭／玩家位置，照 fadeWalls 算每個 WALL_ 網格顯示或藏起來。
  3. 接收面＝有第二套 UV 的三角形。在面上取點，沿法線往外打一條線，gap 公尺內碰到 WALL_ 網格＝被它擋住。
  4. 有「接收面顯示、而且朝著鏡頭，擋住它的網格卻藏起來」的組合，而且被擋那一塊在光照貼圖上比同一個網格沒被擋的地方暗（< 0.75 倍），就列出來。
輸出：每一對（接收面網格、擋住它的網格）：被擋的面積、會露出來的鏡頭組合比例、亮度（被擋／沒被擋）。"""
import json, struct, sys, re
import numpy as np
from PIL import Image


def q2m(q):
    x, y, z, w = q
    return np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                     [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                     [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])


def opt(name, d):
    return type(d)(sys.argv[sys.argv.index(name) + 1]) if name in sys.argv else d


def load(p):
    b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + n]); bin_ = b[20 + n + 8:]
    def acc(i):
        a = J['accessors'][i]; v = J['bufferViews'][a['bufferView']]; k = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]
        dt = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}[a['componentType']]; off = v.get('byteOffset', 0) + a.get('byteOffset', 0)
        st = v.get('byteStride'); isz = np.dtype(dt).itemsize
        if st and st != k * isz:
            raw = np.frombuffer(bin_, dtype=np.uint8, count=st * a['count'], offset=off).reshape(a['count'], st)[:, :k * isz]; return np.frombuffer(raw.tobytes(), dtype=dt).reshape(-1, k)
        return np.frombuffer(bin_, dtype=dt, count=a['count'] * k, offset=off).reshape(-1, k)
    return J, acc


def scene(glb, NS=400, seed=7):
    """讀 GLB，照 three.js＋attachRoomGLB 的規則算每個網格（每個 primitive 一個）：P（世界座標頂點）、I、U（第二套 UV 或 None）、wall（WALL_ 的淡出參數＋vis：NS 組鏡頭／玩家下顯示或藏）。lm_fill_covered.py 也用。"""
    J, acc = load(glb)
    par = {}
    for i, nd in enumerate(J['nodes']):
        for c in nd.get('children', []): par[c] = i
    def local(i):
        nd = J['nodes'][i]; T = np.eye(4)
        if 'matrix' in nd: return np.array(nd['matrix']).reshape(4, 4).T
        T[:3, :3] = q2m(nd.get('rotation', [0, 0, 0, 1])) @ np.diag(nd.get('scale', [1, 1, 1])); T[:3, 3] = nd.get('translation', [0, 0, 0]); return T
    def world(i):
        M = np.eye(4)
        while i is not None: M = local(i) @ M; i = par.get(i)
        return M
    def anc_dir(i):
        while i is not None:
            d = (J['nodes'][i].get('extras') or {}).get('dir')
            if isinstance(d, list) and len(d) == 3: return np.array(d, float)
            i = par.get(i)
        return None
    # 1. 網格（照 three.js 的規則）
    objs = []
    for i, nd in enumerate(J['nodes']):
        if nd.get('mesh') is None or 'extensions' in nd: continue   # GPU instancing 的不算（家具，不是牆）
        md = J['meshes'][nd['mesh']]; prs = md['primitives']; M = world(i)
        multi = len(prs) > 1
        name = (md.get('name') or 'mesh_%d' % nd['mesh']) if multi else nd.get('name', '')
        ex = (md.get('extras') or {}) if multi else (nd.get('extras') or {})
        for pi, pr in enumerate(prs):
            P = acc(pr['attributes']['POSITION']).astype(float) @ M[:3, :3].T + M[:3, 3]
            I = acc(pr['indices']).reshape(-1, 3) if pr.get('indices') is not None else np.arange(len(P)).reshape(-1, 3)
            U = acc(pr['attributes']['TEXCOORD_1']).astype(float) if 'TEXCOORD_1' in pr['attributes'] else None
            objs.append({'node': i, 'name': name, 'nodename': nd.get('name', ''), 'ex': ex, 'P': P, 'I': I, 'U': U, 'multi': multi})
    # 同一個節點多個 primitive 的網格，three.js 是各自一個 Mesh，外框各自算
    walls = []
    for o in objs:
        if not re.search('WALL_', o['name']): o['wall'] = None; continue
        d = o['ex'].get('dir'); d = np.array(d, float) if isinstance(d, list) and len(d) == 3 else (anc_dir(par.get(o['node'])) if o['multi'] else anc_dir(o['node']))
        if d is None: d = np.array([0, 0, 1.0])
        at = o['ex'].get('at'); c = np.array(at, float) if isinstance(at, list) and len(at) == 3 else (o['P'].min(0) + o['P'].max(0)) / 2
        o['wall'] = {'dir': d, 'c': c, 'part': bool(o['ex'].get('partition'))}; walls.append(o)
    allP = np.concatenate([o['P'] for o in objs]); lo, hi = allP.min(0), allP.max(0)
    # 2. 鏡頭／玩家位置 → 每個 WALL_ 網格顯示或藏
    rng = np.random.default_rng(seed)
    cam = np.c_[rng.uniform(lo[0], hi[0], NS), rng.uniform(1.2, 4.0, NS), rng.uniform(lo[2], hi[2], NS)]
    pp = np.c_[rng.uniform(lo[0], hi[0], NS), np.zeros(NS), rng.uniform(lo[2], hi[2], NS)]
    for o in walls:
        w = o['wall']; f = (cam - w['c']) @ w['dir'] > 0
        if w['part']: f = f == ((pp - w['c']) @ w['dir'] > 0)
        w['vis'] = f
    return {'objs': objs, 'walls': walls, 'cam': cam, 'pp': pp, 'lo': lo, 'hi': hi, 'rng': rng}


def main():
    glb, webp = [a for a in sys.argv[1:] if not a.startswith('--')][:2]
    NS = opt('--samples', 400); GAP = opt('--gap', 0.3); out_json = opt('--json', '')
    img = np.asarray(Image.open(webp).convert('RGB'), dtype=np.float32).mean(axis=2) / 255.0; H, W = img.shape
    SC = scene(glb, NS); objs, walls, cam, rng = SC['objs'], SC['walls'], SC['cam'], SC['rng']
    # 3. 接收面：有第二套 UV 的三角形，靠近某個 WALL_ 網格的
    wtri = []   # (牆網格編號, 三角形 3×3)
    for k, o in enumerate(walls):
        T = o['P'][o['I']]; A = np.linalg.norm(np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]), axis=1) / 2
        for t in np.where(A > 1e-7)[0]: wtri.append((k, T[t]))
    WT = np.array([t for _, t in wtri]); WK = np.array([k for k, _ in wtri])
    wbb = np.array([[o['P'].min(0) - GAP, o['P'].max(0) + GAP] for o in walls])
    res = {}
    for ri, o in enumerate(objs):
        if o['U'] is None: continue
        T = o['P'][o['I']]; UV = o['U'][o['I']]; N = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]); A = np.linalg.norm(N, axis=1) / 2; N = N / np.maximum(2 * A[:, None], 1e-12)
        tmn, tmx = T.min(1), T.max(1)
        rvis = o['wall']['vis'] if o['wall'] else np.ones(NS, bool)
        for t in np.where(A > 5e-4)[0]:
            near = np.where(np.all(tmx[t] >= wbb[:, 0], axis=1) & np.all(tmn[t] <= wbb[:, 1], axis=1))[0]
            near = [k for k in near if walls[k] is not o]
            if not near: continue
            m = np.isin(WK, near); tris = WT[m]; tk = WK[m]
            ns = int(min(600, max(20, A[t] / 0.0016)))   # 約 4 cm 一點
            r = rng.random((ns, 2)); f = r.sum(1) > 1; r[f] = 1 - r[f]; bw = np.c_[1 - r.sum(1), r]
            pts = bw @ T[t] + N[t] * 1e-3; uv = bw @ UV[t]
            lm = img[np.clip((uv[:, 1] * H).astype(int), 0, H - 1), np.clip((uv[:, 0] * W).astype(int), 0, W - 1)]
            # 沿法線打線（Möller–Trumbore）：每一點最近的 WALL_ 三角形
            e1 = tris[:, 1] - tris[:, 0]; e2 = tris[:, 2] - tris[:, 0]; d = N[t]
            pv = np.cross(d, e2); det = np.einsum('ij,ij->i', e1, pv); ok = np.abs(det) > 1e-12; inv = np.where(ok, 1 / np.where(ok, det, 1), 0)
            tv = pts[:, None, :] - tris[None, :, 0]; u = np.einsum('kij,ij->ki', tv, pv) * inv
            qv = np.cross(tv, e1[None]); v = np.einsum('j,kij->ki', d, qv) * inv; dist = np.einsum('ij,kij->ki', e2, qv) * inv
            hit = ok[None] & (u >= 0) & (v >= 0) & (u + v <= 1) & (dist > 0) & (dist <= GAP)
            dd = np.where(hit, dist, np.inf); j = dd.argmin(1); hitany = np.isfinite(dd[np.arange(ns), j])
            # 這個三角形朝著鏡頭的組合
            facing = (cam - T[t].mean(0)) @ N[t] > 0
            key = o['name']
            R = res.setdefault(key, {'free': [], 'occ': {}})
            R['free'].append(lm[~hitany])
            for kk in np.unique(tk[j[hitany]]):
                sel = hitany & (tk[j] == kk)
                expo = rvis & facing & ~walls[kk]['wall']['vis']
                E = R['occ'].setdefault(walls[kk]['name'], {'lm': [], 'area': 0.0, 'expo': np.zeros(NS, bool)})
                E['lm'].append(lm[sel]); E['area'] += A[t] * sel.mean(); E['expo'] |= expo
    rows = []
    for key, R in res.items():
        free = np.concatenate(R['free']) if R['free'] else np.array([])
        fm = float(np.median(free)) if len(free) else float('nan')
        for occ, E in R['occ'].items():
            v = np.concatenate(E['lm']); om = float(v.mean())
            rows.append({'recv': key, 'occ': occ, 'area': round(E['area'], 3), 'expo': round(float(E['expo'].mean()), 3), 'occ_lm': round(om, 3), 'free_lm': round(fm, 3), 'ratio': round(om / fm, 2) if fm > 0 else None})
    rt = lambda r: 1.0 if r['ratio'] is None else r['ratio']   # 亮度比 0（全黑）不能當成「沒有」
    rows.sort(key=lambda r: -(r['area'] * r['expo'] * (1 - min(1, rt(r)))))
    bad = [r for r in rows if r['expo'] > 0 and r['area'] >= 0.01 and rt(r) < 0.75]
    print(f'{glb}：WALL_ 網格 {len(walls)} 個（隔間 {sum(o["wall"]["part"] for o in walls)}）、有第二套 UV 的網格 {sum(o["U"] is not None for o in objs)} 個；{NS} 組鏡頭／玩家')
    for r in bad: print(f'  露出：{r["recv"]} 被 {r["occ"]} 擋住 {r["area"]:.2f} m²，{r["expo"] * 100:.0f}% 的組合會露出來；亮度 {r["occ_lm"]:.2f}／沒擋住 {r["free_lm"]:.2f}（{r["ratio"]}）')
    print(f'  要修 {len(bad)} 對' if bad else '  沒有會露出來的暗塊')
    if out_json: json.dump({'glb': glb, 'bad': bad, 'all': rows}, open(out_json, 'w'), ensure_ascii=False, indent=1)
    return bad


if __name__ == '__main__':
    main()
