"""體態第二階段：玩家的「結實」形狀（GYM-FIT-1107，LAWWW2-B 2026-11-07；使用者 11-07「健身器材我還是不能用 應該要讓騎腳踏車變快 肌肉線條更明顯」，LAWWW-B P1 派工）。
第一階段（FIT-3D-BODY-1027，LAWWW2-C）只有姿勢（挺胸、肩膀往後）；這裡改身體形狀：在玩家 VRM 的身體＋衣服（同一副骨架的網格，含系外套 JACKET_ECON）加一個 morph target「fit」，
遊戲照體能四階開 0／0.4／0.7／1（fit3d.js 設 u.fitBody、character3d.js 套上）。
為什麼不用骨頭縮放：上臂非等比縮放以後，手肘一彎，前臂會被拉長、變形（子骨頭繼承了父骨頭的縮放＋旋轉＝剪切）；掛在骨頭上的配件也跟著變大。
做法（純 numpy 改 glTF，不用 Blender）：每個頂點照它綁的骨頭（權重加總），沿那根骨頭的軸往外撐：位移＝α·輪廓(t)·（頂點到骨頭軸的距離向量）——
  ＝和離軸的距離成比例，所以衣服（離軸比較遠）撐得比皮膚多一點，裡外的順序不會反過來（不會穿模）；手掌、腳掌、頭、頭髮不動；骨頭長度不變（動作、腳步貼合、坐姿不受影響）。
  輪廓 t（沿骨頭 0＝頭端、1＝尾端）：上臂＝二頭肌（t 0.55）＋三角肌（t 0.08）兩個隆起；前臂＝靠手肘那一段；大腿＝中段；小腿＝小腿肚（後面多）；
  肩膀骨（鎖骨）＝斜方肌、三角肌；胸口＝胸肌（前面多）、背闊肌（兩側）；腰（spine）＝微收。
用法：python3 tools/anim/fit_body_morph.py <輸入.vrm> <輸出.vrm> [--k 1.0]（k＝整體強度，四階的 1）
"""
import argparse, json, struct
import numpy as np

ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('dst'); ap.add_argument('--k', type=float, default=1.0)
A = ap.parse_args()
NAME = 'fit'
raw = open(A.src, 'rb').read(); jl = struct.unpack('<I', raw[12:16])[0]; J = json.loads(raw[20:20 + jl])
blen = struct.unpack('<I', raw[20 + jl:24 + jl])[0]; BIN = bytearray(raw[28 + jl:28 + jl + blen])
CT = {5126: np.float32, 5123: np.uint16, 5121: np.uint8, 5125: np.uint32}; NC = {'SCALAR': 1, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def read(i):
    a = J['accessors'][i]; v = J['bufferViews'][a['bufferView']]; n = NC[a['type']]; dt = CT[a['componentType']]
    off = v.get('byteOffset', 0) + a.get('byteOffset', 0); st = v.get('byteStride')
    if st and st != n * np.dtype(dt).itemsize:
        rows = [np.frombuffer(bytes(BIN[off + k * st: off + k * st + n * np.dtype(dt).itemsize]), dtype=dt) for k in range(a['count'])]; x = np.array(rows)
    else:
        x = np.frombuffer(bytes(BIN[off:off + a['count'] * n * np.dtype(dt).itemsize]), dtype=dt).reshape(a['count'], n)
    if a.get('normalized') and dt != np.float32: x = x.astype(np.float64) / np.iinfo(dt).max
    return x


def sstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)


bump = lambda t, c, w: np.exp(-((t - c) / w) ** 2)
# 每根骨頭：尾端（下一根骨頭）、強度、輪廓、方向加權（front＝胸肌往前、back＝小腿肚往後）
SEG = {
    'UpperArm': ('LowerArm', 0.30, lambda t: 0.30 + 0.70 * bump(t, 0.55, 0.22) + 0.55 * bump(t, 0.06, 0.12), None),
    'LowerArm': ('Hand', 0.15, lambda t: 0.25 + 0.75 * bump(t, 0.22, 0.25), None),
    'Shoulder': ('UpperArm', 0.22, lambda t: 0.4 + 0.6 * bump(t, 0.75, 0.3), None),
    'UpperLeg': ('LowerLeg', 0.10, lambda t: 0.35 + 0.65 * bump(t, 0.40, 0.30), None),
    'LowerLeg': ('Foot', 0.12, lambda t: 0.15 + 0.85 * bump(t, 0.28, 0.20), 'back'),
}
SPINE = {   # 軀幹：沿脊椎的垂直軸往外（水平方向）
    'UpperChest': ('Neck', 0.11, lambda t: 0.5 + 0.5 * bump(t, 0.35, 0.35), 'chest'),
    'Chest': ('UpperChest', 0.07, lambda t: 0.4 + 0.6 * bump(t, 0.8, 0.4), 'chest'),
    'Spine': ('Chest', -0.035, lambda t: 1.0 - 0.6 * t, None),   # 腰微收
}
names = [n.get('name', '') for n in J['nodes']]
out_meshes = 0; stats = {}
for ni, nd in enumerate(J['nodes']):
    if nd.get('mesh') is None or nd.get('skin') is None: continue
    mi = nd['mesh']; mesh = J['meshes'][mi]
    if any(k in (mesh.get('name', '') + names[ni]) for k in ('Face', 'Hair')): continue   # 臉（表情 morph）、頭髮不動
    skin = J['skins'][nd['skin']]; jn = [names[j] for j in skin['joints']]
    ibm = read(skin['inverseBindMatrices']).reshape(-1, 4, 4).transpose(0, 2, 1)   # column-major → 一般矩陣
    head = np.array([np.linalg.inv(m)[:3, 3] for m in ibm])                       # 骨頭頭端（網格空間）
    jix = {n: i for i, n in enumerate(jn)}
    def jp(n): return head[jix[n]] if n in jix else None
    # 前方：腳掌 → 腳趾
    ft, toe = jp('J_Bip_L_Foot'), jp('J_Bip_L_ToeBase')
    fwd = (toe - ft) if (ft is not None and toe is not None) else np.array([0, 0, -1.0]); fwd = fwd - np.array([0, fwd[1], 0]); fwd /= np.linalg.norm(fwd)
    cache = {}; tgt_by_pos = {}
    for p in mesh['primitives']:
        pa = p['attributes']['POSITION']
        if pa in cache: continue
        P = read(pa).astype(np.float64); Jt = read(p['attributes']['JOINTS_0']).astype(int); W = read(p['attributes']['WEIGHTS_0']).astype(np.float64)
        D = np.zeros_like(P)
        for side in ('L', 'R'):
            for b, (tail, alpha, prof, emph) in SEG.items():
                nm, tn = 'J_Bip_%s_%s' % (side, b), 'J_Bip_%s_%s' % (side, tail)
                if nm not in jix or tn not in jix: continue
                a_, b_ = jp(nm), jp(tn); d = b_ - a_; L = np.linalg.norm(d); d /= L
                w = (W * (Jt == jix[nm])).sum(1); m = w > 1e-4
                if not m.any(): continue
                v = P[m]; t = np.clip(((v - a_) @ d) / L, 0, 1); r = v - (a_ + np.outer(t * L, d))
                f = alpha * prof(t)
                if emph == 'back':
                    rn = r / np.maximum(np.linalg.norm(r, axis=1, keepdims=True), 1e-6); f = f * (0.35 + 0.65 * np.clip(-(rn @ fwd), 0, 1) + 0.15)
                D[m] += (w[m] * f)[:, None] * r
        for b, (tail, alpha, prof, emph) in SPINE.items():
            nm, tn = 'J_Bip_C_%s' % b, 'J_Bip_C_%s' % tail
            if nm not in jix or tn not in jix: continue
            a_, b_ = jp(nm), jp(tn); d = b_ - a_; L = np.linalg.norm(d); d /= L
            w = (W * (Jt == jix[nm])).sum(1); m = w > 1e-4
            if not m.any(): continue
            v = P[m]; t = np.clip(((v - a_) @ d) / L, 0, 1); r = v - (a_ + np.outer(t * L, d))
            f = alpha * prof(t)
            if emph == 'chest':
                rn = r / np.maximum(np.linalg.norm(r, axis=1, keepdims=True), 1e-6); fr = rn @ fwd; lat = np.abs(rn[:, 0])
                f = f * (0.35 + 0.75 * np.clip(fr, 0, 1) + 0.35 * lat)
            D[m] += (w[m] * f)[:, None] * r
        D *= A.k
        cache[pa] = D
        stats[mesh.get('name', str(mi))] = dict(verts=int(len(P)), moved=int((np.linalg.norm(D, axis=1) > 1e-5).sum()), max_mm=round(float(np.linalg.norm(D, axis=1).max()) * 1000, 1))
    if not any(np.abs(D).max() > 1e-6 for D in cache.values()): continue
    # 寫 morph target（每個 primitive 都要有；共用 POSITION 的共用同一份）
    acc_of = {}
    for pa, D in cache.items():
        d32 = D.astype(np.float32)
        while len(BIN) % 4: BIN.append(0)
        off = len(BIN); BIN.extend(d32.tobytes()); J['bufferViews'].append({'buffer': 0, 'byteOffset': off, 'byteLength': d32.nbytes})
        J['accessors'].append({'bufferView': len(J['bufferViews']) - 1, 'componentType': 5126, 'count': len(d32), 'type': 'VEC3', 'min': d32.min(0).tolist(), 'max': d32.max(0).tolist()})
        acc_of[pa] = len(J['accessors']) - 1
    names_t = (mesh.get('extras') or {}).get('targetNames', [])
    assert NAME not in names_t, '已經有 fit（輸入要用原本的 VRM）'
    for p in mesh['primitives']:
        p.setdefault('targets', []).append({'POSITION': acc_of[p['attributes']['POSITION']]})
    mesh['extras'] = dict(mesh.get('extras') or {}, targetNames=names_t + [NAME]); mesh['weights'] = (mesh.get('weights') or [0] * len(names_t)) + [0]
    out_meshes += 1
J['buffers'][0]['byteLength'] = len(BIN)
while len(BIN) % 4: BIN.append(0)
js = json.dumps(J, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
while len(js) % 4: js += b' '
open(A.dst, 'wb').write(b''.join([b'glTF', struct.pack('<II', 2, 12 + 8 + len(js) + 8 + len(BIN)), struct.pack('<I', len(js)), b'JSON', js, struct.pack('<I', len(BIN)), b'BIN\x00', bytes(BIN)]))
print(json.dumps({'meshes_with_fit': out_meshes, 'stats': stats, 'k': A.k, 'out': A.dst}, ensure_ascii=False))
