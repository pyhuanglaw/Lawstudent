"""山嵐書店文具區（SIS-STATIONERY-1110，LAWWW2-B 2026-11-10）：在「已經烘過光照」的 shanlan.glb 上換掉文具區的小東西，不動其他東西。不需要 Blender：
  python3 glb_strip_merge.py <輸入.glb> <新增.glb> <輸出.glb> [--label <文字貼圖.png>] [--dry]
1. 拿掉：shl_vc／shl_vc_gloss／shl_print／shl_oak_rt 這幾個合併網格裡，「整塊落在文具區的範圍裡」的零件（連在一起的三角形算一塊；STRIP 的盒子＝遊戲座標）。
   以整塊判斷：書架頂上的黃金葛莖、桌子本身、層板、明信片都不會被切到一半。
2. 加上：<新增.glb>（stationery_add.py 用 Blender 做的）裡的網格，照材質名字接進原本同名材質的網格（同一個 draw call）；
   原本沒有的材質（shl_stat_label：分區牌、文具牌的字）另外加一個節點＋材質＋貼圖。
不動：地板、牆、天花板（光照貼圖、第二套 UV 照舊）、節點名字、extras、其他網格。三角形索引超過 65535 時改成 32 位元。"""
import json, struct, sys, os
import numpy as np

# 文具區的範圍（遊戲座標：x 東、y 上、z 南）：兩張文具桌的桌面上、東牆文具架 1.55 m 以下（最上面那層明信片留著）
STRIP = {
    'tables': [(4.48, 6.12, 0.815, 1.35, 6.90, 7.90), (4.48, 6.12, 0.815, 1.35, 5.10, 6.10)],   # x0,x1,y0,y1,z0,z1
    'wall': [(6.60, 6.99, 0.37, 1.55, 4.15, 8.55)],
}
NODES = ('shl_vc', 'shl_vcg', 'shl_print', 'shl_wood')
CT = {5126: np.float32, 5123: np.uint16, 5125: np.uint32, 5121: np.uint8}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}


def load(p):
    b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + n])
    off = 20 + n; bl = struct.unpack('<I', b[off:off + 4])[0]; return J, bytes(b[off + 8:off + 8 + bl])


def acc(J, BIN, i):
    a = J['accessors'][i]; bv = J['bufferViews'][a['bufferView']]; o = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    nc = NC[a['type']]; dt = CT[a['componentType']]; isz = np.dtype(dt).itemsize; st = bv.get('byteStride', 0) or nc * isz
    raw = np.frombuffer(BIN, np.uint8, (a['count'] - 1) * st + nc * isz, o)
    out = np.lib.stride_tricks.as_strided(raw, (a['count'], nc * isz), (st, 1)).copy().view(dt).reshape(a['count'], nc)
    if a.get('normalized'): out = out.astype(np.float32) / np.iinfo(dt).max
    return out


def comps(I, nv):
    """三角形 → 連在一起的塊（共用頂點）：回傳每個頂點的代表編號"""
    par = list(range(nv))
    def f(a):
        r = a
        while par[r] != r: r = par[r]
        while par[a] != r: par[a], a = r, par[a]
        return r
    for t in I.tolist():
        a = f(t[0])
        for v in t[1:]:
            b_ = f(v)
            if b_ != a: par[b_] = a
    return np.array([f(v) for v in range(nv)])


def strip_mask(P, I, boxes, merge_pos=True):
    """回傳要拿掉的三角形（bool）：整塊（位置合併後連在一起的三角形）都在某一個盒子裡"""
    nv = len(P)
    if merge_pos:   # 同一個位置的頂點當成同一點（rbox 一面一組頂點，不合併的話一個盒子會變六塊）
        q = np.round(P / 1e-4).astype(np.int64); _, inv = np.unique(q, axis=0, return_inverse=True); inv = inv.reshape(-1)
        I2 = inv[I]; root = comps(I2, inv.max() + 1); lab = root[I2[:, 0]]
    else:
        root = comps(I, nv); lab = root[I[:, 0]]
    T = P[I]; lo = T.min(1); hi = T.max(1); m = np.zeros(len(I), bool)
    order = np.argsort(lab); ls = lab[order]; cut = np.flatnonzero(np.diff(ls)) + 1
    for grp in np.split(order, cut):
        l = lo[grp].min(0); h = hi[grp].max(0)
        for (x0, x1, y0, y1, z0, z1) in boxes:
            if l[0] >= x0 and h[0] <= x1 and l[1] >= y0 and h[1] <= y1 and l[2] >= z0 and h[2] <= z1: m[grp] = True; break
    return m


class Out:
    def __init__(s): s.bin = bytearray(); s.bvs = []; s.accs = []
    def view(s, data, target=None):
        while len(s.bin) % 4: s.bin += b'\0'
        o = len(s.bin); s.bin += data; bv = {'buffer': 0, 'byteOffset': o, 'byteLength': len(data)}
        if target: bv['target'] = target
        s.bvs.append(bv); return len(s.bvs) - 1
    def add_acc(s, arr, kind, target=None, minmax=False):
        arr = np.ascontiguousarray(arr); ct = {np.float32: 5126, np.uint16: 5123, np.uint32: 5125}[arr.dtype.type]
        a = {'bufferView': s.view(arr.tobytes(), target), 'componentType': ct, 'count': len(arr), 'type': kind}
        if minmax: a['min'] = arr.min(0).tolist(); a['max'] = arr.max(0).tolist()
        s.accs.append(a); return len(s.accs) - 1


def main():
    A = [a for a in sys.argv[1:] if not a.startswith('--')]
    src, add, dst = A[0], A[1], A[2]; dry = '--dry' in sys.argv
    lab_png = sys.argv[sys.argv.index('--label') + 1] if '--label' in sys.argv else None
    J, BIN = load(src); JA, BA = load(add) if add != '-' else ({'nodes': [], 'meshes': [], 'materials': []}, b'')
    out = Out(); old2new_acc = {}
    # 先照原檔的 accessor 複製一份（之後要改的那幾個網格另外寫新的 accessor，舊的不再被引用就丟掉）
    name2node = {n.get('name'): i for i, n in enumerate(J['nodes'])}
    touched = {}   # 材質名 → (節點, primitive)
    for nm in NODES:
        ni = name2node[nm]; nd = J['nodes'][ni]; assert 'translation' not in nd and 'rotation' not in nd and 'scale' not in nd and 'matrix' not in nd, nm
        pr = J['meshes'][nd['mesh']]['primitives']; assert len(pr) == 1, nm
        touched[J['materials'][pr[0]['material']]['name']] = (ni, pr[0])
    boxes = STRIP['tables'] + STRIP['wall']
    # 新增的網格：照材質名字分組
    addp = {}
    for nd in JA['nodes']:
        if 'mesh' not in nd: continue
        assert not any(k in nd for k in ('translation', 'rotation', 'scale', 'matrix')), nd.get('name')   # stationery_add.py 會先套用變換
        for p in JA['meshes'][nd['mesh']]['primitives']:
            mn = JA['materials'][p['material']]['name']; addp.setdefault(mn, []).append(p)
    report = []
    newacc = {}   # (node) → 新的 attributes／indices accessor（寫在後面）
    for mn, (ni, p) in touched.items():
        attrs = {k: acc(J, BIN, v) for k, v in p['attributes'].items()}; I = acc(J, BIN, p['indices']).reshape(-1, 3).astype(np.int64)
        P = attrs['POSITION']; m = strip_mask(P, I, STRIP['tables'] if mn == 'shl_oak_rt' else boxes)   # 木頭：只拿桌面上的（明信片小立架），層板、背板、桌子留著
        keepI = I[~m]; used = np.unique(keepI); remap = -np.ones(len(P), np.int64); remap[used] = np.arange(len(used))
        A2 = {k: v[used] for k, v in attrs.items()}; I2 = remap[keepI]
        nadd_v = nadd_t = 0
        for q in addp.get(mn, []):
            QA = {k: acc(JA, BA, v) for k, v in q['attributes'].items()}; QI = acc(JA, BA, q['indices']).reshape(-1, 3).astype(np.int64)
            base = len(A2['POSITION'])
            for k in A2:
                if k == 'COLOR_0':
                    c = QA.get('COLOR_0'); assert c is not None, f'{mn} 新增的網格沒有頂點色'
                    A2[k] = np.vstack([A2[k], c[:, :A2[k].shape[1]].astype(np.float32)])
                else:
                    assert k in QA, f'{mn} 新增的網格缺 {k}'; A2[k] = np.vstack([A2[k], QA[k].astype(np.float32)])
            I2 = np.vstack([I2, QI + base]); nadd_v += len(QA['POSITION']); nadd_t += len(QI)
        report.append((J['nodes'][ni]['name'], mn, int(m.sum()), len(I), nadd_t, len(I2), len(A2['POSITION'])))
        newacc[ni] = (A2, I2)
    for r in report: print('%-10s %-14s 拿掉 %5d／%5d 個三角形，加 %5d → %5d 個三角形、%5d 個頂點' % r)
    extra_mats = [mn for mn in addp if mn not in touched]
    print('另外加的材質：', extra_mats)
    if dry: return
    # ---- 重寫：沒動到的 accessor 原樣搬（照 bufferView 分組，保留 byteStride）
    # 標出哪些 accessor 還被引用
    ref = set()
    def mark(x):
        if x is not None: ref.add(x)
    for mi, me in enumerate(J['meshes']):
        for p in me['primitives']:
            for k, v in p['attributes'].items(): mark(v)
            mark(p.get('indices'))
            for t in p.get('targets', []):
                for v in t.values(): mark(v)
    for nm in NODES:
        p = J['meshes'][J['nodes'][name2node[nm]]['mesh']]['primitives'][0]
        for v in p['attributes'].values(): ref.discard(v)
        ref.discard(p['indices'])
    for s_ in J.get('skins', []): mark(s_.get('inverseBindMatrices'))
    for an in J.get('animations', []):
        for sm in an['samplers']: mark(sm['input']); mark(sm['output'])
    # bufferView 原樣搬（被留下的 accessor 用到的、圖片用到的）
    bv_keep = sorted({J['accessors'][i]['bufferView'] for i in ref} | {im['bufferView'] for im in J.get('images', []) if 'bufferView' in im})
    bvmap = {}
    for bvi in bv_keep:
        bv = J['bufferViews'][bvi]; o = bv.get('byteOffset', 0); nb = out.view(BIN[o:o + bv['byteLength']], bv.get('target'))
        if 'byteStride' in bv: out.bvs[nb]['byteStride'] = bv['byteStride']
        bvmap[bvi] = nb
    accmap = {}
    for i in sorted(ref):
        a = dict(J['accessors'][i]); a['bufferView'] = bvmap[a['bufferView']]; out.accs.append(a); accmap[i] = len(out.accs) - 1
    for me in J['meshes']:
        for p in me['primitives']:
            p['attributes'] = {k: accmap.get(v, v) for k, v in p['attributes'].items()}
            if 'indices' in p: p['indices'] = accmap.get(p['indices'], p['indices'])
            for t in p.get('targets', []):
                for k in t: t[k] = accmap[t[k]]
    for im in J.get('images', []):
        if 'bufferView' in im: im['bufferView'] = bvmap[im['bufferView']]
    for s_ in J.get('skins', []):
        if 'inverseBindMatrices' in s_: s_['inverseBindMatrices'] = accmap[s_['inverseBindMatrices']]
    for an in J.get('animations', []):
        for sm in an['samplers']: sm['input'] = accmap[sm['input']]; sm['output'] = accmap[sm['output']]
    # 改過的四個網格
    for ni, (A2, I2) in newacc.items():
        p = J['meshes'][J['nodes'][ni]['mesh']]['primitives'][0]
        for k in list(p['attributes']):
            v = A2[k].astype(np.float32); p['attributes'][k] = out.add_acc(v, 'VEC%d' % v.shape[1], 34962, minmax=(k == 'POSITION'))
        it = np.uint16 if len(A2['POSITION']) < 65535 else np.uint32
        p['indices'] = out.add_acc(I2.reshape(-1).astype(it), 'SCALAR', 34963)
    # 另外加的材質（分區牌、文具牌）：一個節點、一個網格、一個材質、一張貼圖
    for mn in extra_mats:
        assert mn == 'shl_stat_label' and lab_png, mn
        prims = addp[mn]; Pp, Nn, Uu, Ii = [], [], [], []; base = 0
        for q in prims:
            QA = {k: acc(JA, BA, v) for k, v in q['attributes'].items()}; QI = acc(JA, BA, q['indices']).reshape(-1).astype(np.int64)
            Pp.append(QA['POSITION']); Nn.append(QA['NORMAL']); Uu.append(QA['TEXCOORD_0']); Ii.append(QI + base); base += len(QA['POSITION'])
        Pp, Nn, Uu, Ii = (np.vstack(Pp).astype(np.float32), np.vstack(Nn).astype(np.float32), np.vstack(Uu).astype(np.float32), np.concatenate(Ii))
        png = open(lab_png, 'rb').read(); ibv = out.view(png)
        J['images'].append({'bufferView': ibv, 'mimeType': 'image/png', 'name': 'shl_stat_label'})
        smp = J['textures'][0].get('sampler')
        tex = {'source': len(J['images']) - 1}
        if smp is not None: tex['sampler'] = smp
        J['textures'].append(tex)
        J['materials'].append({'name': 'shl_stat_label', 'doubleSided': False, 'extras': {'tile': 1.0},
                               'pbrMetallicRoughness': {'baseColorTexture': {'index': len(J['textures']) - 1}, 'metallicFactor': 0, 'roughnessFactor': 0.72}})
        prim = {'attributes': {'POSITION': out.add_acc(Pp, 'VEC3', 34962, True), 'NORMAL': out.add_acc(Nn, 'VEC3', 34962), 'TEXCOORD_0': out.add_acc(Uu, 'VEC2', 34962)},
                'indices': out.add_acc(Ii.astype(np.uint16), 'SCALAR', 34963), 'material': len(J['materials']) - 1}
        J['meshes'].append({'name': 'shl_stat_label', 'primitives': [prim]})
        J['nodes'].append({'name': 'shl_stat_label', 'mesh': len(J['meshes']) - 1})
        J['scenes'][J.get('scene', 0)]['nodes'].append(len(J['nodes']) - 1)
    J['bufferViews'] = out.bvs; J['accessors'] = out.accs
    while len(out.bin) % 4: out.bin += b'\0'
    J['buffers'] = [{'byteLength': len(out.bin)}]
    js = json.dumps(J, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    while len(js) % 4: js += b' '
    glb = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(out.bin)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(out.bin), 0x004E4942) + bytes(out.bin)
    open(dst, 'wb').write(glb); print('wrote', dst, len(glb), 'bytes')


if __name__ == '__main__':
    main()
