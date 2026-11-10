#!/usr/bin/env python3
"""從 Quaternius「Universal Animation Library」（UAL1）和「Universal Animation Library 2」（UAL2）抽出坐著的人要用的動作片段（NPC-AMBIENT-ANIM-1104）。
授權：兩個包都是 CC0 1.0（https://quaternius.com/packs/universalanimationlibrary.html ；LICENSES.md 有記）。

輸出一個很小的 GLB：只有骨架節點（名字、靜止姿勢的位置／旋轉／縮放、父子關係），沒有網格、蒙皮、材質、貼圖；
每個片段只留骨頭的旋轉（位移、縮放的軌道全部丟掉：遊戲的坐姿高度照舊由 character3d.js 決定，不吃片段的骨盆位移）。
  - 旋轉存成 normalized SHORT（glTF 2.0 允許動畫的旋轉這樣存；three.js GLTFLoader 會換回浮點數）＝浮點數的一半大
  - 關鍵影格精簡：中間的影格如果用前後兩格內插（slerp）就差不到 --tol 弧度，就拿掉
  - 整段都和靜止姿勢一樣的軌道不存（遊戲那邊沒有軌道＝靜止姿勢）
  - 兩個檔的骨架要一模一樣（名字、父子、靜止姿勢）；不一樣就停下來，不合併

用法（來源是外部下載的檔：用 python3 -I，腳本不要放在下載的資料夾裡）：
  python3 -I tools/anim/extract_ual.py --ual1 <UAL1.glb> --ual2 <UAL2.glb> [--out assets/models/char/ual_sit_clips.glb] [--tol 0.0015] [--list]
  --list：只列出兩個檔裡所有片段的名字和長度（挑片段用）
要換片段：改下面的 CLIPS（來源、名字）重跑。遊戲用到的名字在 src/character3d.js 的 C.SIT_AMB。
"""
import argparse, json, math, os, struct, sys

# （來源, 片段名稱）：坐著的循環、坐著聊天、坐下／站起來，加上幾個只取上半身或頭的（喝東西、看看四周、點頭、講手機、吃東西）
CLIPS = [
    ('ual1', 'Sitting_Idle_Loop'), ('ual1', 'Sitting_Idle02_Loop'), ('ual1', 'Sitting_Idle03_Loop'),
    ('ual1', 'Sitting_Talking_Loop'), ('ual1', 'Sitting_Nodding_Loop'),
    ('ual1', 'Sitting_Enter'), ('ual1', 'Sitting_Exit'),
    ('ual1', 'Drink'), ('ual1', 'Idle_LookAround_Loop'),
    ('ual2', 'Yes'), ('ual2', 'Consume'), ('ual2', 'Idle_TalkingPhone_Loop'),
]

GLB_MAGIC = 0x46546C67
CH_JSON = 0x4E4F534A
CH_BIN = 0x004E4942
COMP = {5120: ('b', 1), 5121: ('B', 1), 5122: ('h', 2), 5123: ('H', 2), 5125: ('I', 4), 5126: ('f', 4)}
NCOMP = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def load_glb(path):
    with open(path, 'rb') as f:
        d = f.read()
    magic, ver, ln = struct.unpack('<III', d[:12])
    if magic != GLB_MAGIC or ver != 2:
        sys.exit('不是 glTF 2.0 GLB：' + path)
    off, js, bn = 12, None, b''
    while off < ln:
        cl, ct = struct.unpack('<II', d[off:off + 8])
        c = d[off + 8:off + 8 + cl]
        if ct == CH_JSON:
            js = json.loads(c.decode('utf-8'))
        elif ct == CH_BIN:
            bn = c
        off += 8 + cl
    if js is None:
        sys.exit('GLB 沒有 JSON：' + path)
    return js, bn


def read_accessor(js, bn, i):
    a = js['accessors'][i]
    bv = js['bufferViews'][a['bufferView']]
    fmt, sz = COMP[a['componentType']]
    n = NCOMP[a['type']]
    stride = bv.get('byteStride') or sz * n
    base = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    out = []
    for k in range(a['count']):
        o = base + k * stride
        v = list(struct.unpack('<' + fmt * n, bn[o:o + sz * n]))
        if a.get('normalized'):
            lim = {5120: 127.0, 5121: 255.0, 5122: 32767.0, 5123: 65535.0}[a['componentType']]
            v = [max(x / lim, -1.0) for x in v]
        out.append(v if n > 1 else v[0])
    return out


def skeleton(js):
    """骨架節點（沒有網格的節點）：名字 → (index, 父節點名字, TRS)"""
    par = {}
    for i, nd in enumerate(js['nodes']):
        for c in nd.get('children', []):
            par[c] = i
    sk = {}
    for i, nd in enumerate(js['nodes']):
        if 'mesh' in nd:
            continue
        p = par.get(i)
        sk[nd['name']] = dict(i=i, parent=js['nodes'][p]['name'] if p is not None else None,
                              t=nd.get('translation', [0, 0, 0]), r=nd.get('rotation', [0, 0, 0, 1]), s=nd.get('scale', [1, 1, 1]))
    return sk


def same_skeleton(a, b, eps=1e-5):
    if set(a) != set(b):
        return 'skeleton names differ: ' + str(sorted(set(a) ^ set(b)))
    for n in a:
        x, y = a[n], b[n]
        if x['parent'] != y['parent']:
            return 'parent differs: ' + n
        for k in ('t', 'r', 's'):
            if any(abs(p - q) > eps for p, q in zip(x[k], y[k])):
                return 'rest %s differs: %s %s %s' % (k, n, x[k], y[k])
    return None


def qdot(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]


def qnorm(q):
    l = math.sqrt(qdot(q, q)) or 1.0
    return [c / l for c in q]


def qslerp(a, b, t):
    d = qdot(a, b)
    if d < 0:
        b = [-c for c in b]
        d = -d
    if d > 0.9995:
        return qnorm([a[k] + (b[k] - a[k]) * t for k in range(4)])
    th = math.acos(min(1.0, d))
    s = math.sin(th)
    wa, wb = math.sin((1 - t) * th) / s, math.sin(t * th) / s
    return [a[k] * wa + b[k] * wb for k in range(4)]


def qang(a, b):
    return 2 * math.acos(min(1.0, abs(qdot(a, b))))


def reduce_keys(times, qs, tol):
    """關鍵影格精簡（貪婪）：從保留的那一格往後找最遠的一格，中間每一格用兩端 slerp 內插都差不到 tol"""
    n = len(times)
    if n <= 2:
        return list(range(n))
    keep, i = [0], 0
    while i < n - 1:
        best, j = i + 1, i + 2
        while j < n:
            ok = True
            span = times[j] - times[i]
            for k in range(i + 1, j):
                a = (times[k] - times[i]) / span if span > 0 else 0
                if qang(qslerp(qs[i], qs[j], a), qs[k]) > tol:
                    ok = False
                    break
            if not ok:
                break
            best, j = j, j + 1
        keep.append(best)
        i = best
    return keep


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--ual1', required=True)
    ap.add_argument('--ual2', required=True)
    ap.add_argument('--out', default='assets/models/char/ual_sit_clips.glb')
    ap.add_argument('--tol', type=float, default=0.0015, help='關鍵影格精簡的容許誤差（弧度）')
    ap.add_argument('--list', action='store_true')
    o = ap.parse_args()
    src = {'ual1': load_glb(o.ual1), 'ual2': load_glb(o.ual2)}
    if o.list:
        for k, (js, bn) in src.items():
            for a in js.get('animations', []):
                mx = max(js['accessors'][a['samplers'][c['sampler']]['input']].get('max', [0])[0] for c in a['channels'])
                print(k, a['name'], round(mx, 2))
        return
    sk = skeleton(src['ual1'][0])
    err = same_skeleton(sk, skeleton(src['ual2'][0]))
    if err:
        sys.exit('UAL1 和 UAL2 的骨架不一樣，不能合併：' + err)
    js1 = src['ual1'][0]
    # 輸出的節點：從場景的根節點往下（網格節點不要），依深度優先排
    order = []
    def walk(i):
        nd = js1['nodes'][i]
        if 'mesh' in nd:
            return
        order.append(i)
        for c in nd.get('children', []):
            walk(c)
    for r in js1['scenes'][js1.get('scene', 0)]['nodes']:
        walk(r)
    remap = {old: new for new, old in enumerate(order)}
    nodes = []
    for old in order:
        nd = js1['nodes'][old]
        n2 = {'name': nd['name']}
        for k in ('translation', 'rotation', 'scale'):
            if k in nd:
                n2[k] = nd[k]
        ch = [remap[c] for c in nd.get('children', []) if c in remap]
        if ch:
            n2['children'] = ch
        nodes.append(n2)
    name2new = {nodes[i]['name']: i for i in range(len(nodes))}
    rest = {n: sk[n]['r'] for n in sk}

    blob = bytearray()
    views, accs = [], []
    time_cache = {}

    def add_view(data):
        while len(blob) % 4:
            blob.append(0)
        views.append({'buffer': 0, 'byteOffset': len(blob), 'byteLength': len(data)})
        blob.extend(data)
        return len(views) - 1

    def add_times(ts):
        data = struct.pack('<%df' % len(ts), *ts)
        if data in time_cache:
            return time_cache[data]
        accs.append({'bufferView': add_view(data), 'componentType': 5126, 'count': len(ts), 'type': 'SCALAR', 'min': [min(ts)], 'max': [max(ts)]})
        time_cache[data] = len(accs) - 1
        return len(accs) - 1

    def add_quats(qs):
        vals = []
        for q in qs:
            vals += [int(round(max(-1.0, min(1.0, c)) * 32767)) for c in q]
        data = struct.pack('<%dh' % len(vals), *vals)
        accs.append({'bufferView': add_view(data), 'componentType': 5122, 'normalized': True, 'count': len(qs), 'type': 'VEC4'})
        return len(accs) - 1

    anims, report = [], []
    for which, name in CLIPS:
        js, bn = src[which]
        a = next((x for x in js.get('animations', []) if x['name'] == name), None)
        if a is None:
            sys.exit('找不到片段 %s（%s）' % (name, which))
        chans, samps = [], []
        nk = nc = 0
        dur = 0.0
        for c in a['channels']:
            if c['target'].get('path') != 'rotation':
                continue
            tn = js['nodes'][c['target']['node']]['name']
            if tn not in name2new:
                continue
            sm = a['samplers'][c['sampler']]
            if sm.get('interpolation', 'LINEAR') != 'LINEAR':
                sys.exit('只處理 LINEAR 內插：%s %s' % (name, tn))
            ts = read_accessor(js, bn, sm['input'])
            qs = [qnorm(q) for q in read_accessor(js, bn, sm['output'])]
            dur = max(dur, ts[-1])
            for k in range(1, len(qs)):   # 正負號連續（內插不會繞遠路）
                if qdot(qs[k - 1], qs[k]) < 0:
                    qs[k] = [-x for x in qs[k]]
            r0 = rest[tn]
            if all(qang(q, r0) < o.tol for q in qs):
                continue   # 整段都是靜止姿勢
            keep = reduce_keys(ts, qs, o.tol)
            ti = add_times([ts[k] for k in keep])
            qi = add_quats([qs[k] for k in keep])
            samps.append({'input': ti, 'output': qi, 'interpolation': 'LINEAR'})
            chans.append({'sampler': len(samps) - 1, 'target': {'node': name2new[tn], 'path': 'rotation'}})
            nk += len(keep)
            nc += 1
        anims.append({'name': name, 'channels': chans, 'samplers': samps})
        report.append('%-24s %5.2fs 軌道 %2d、影格 %5d（%s）' % (name, dur, nc, nk, which))

    gl = {
        'asset': {'version': '2.0', 'generator': 'tools/anim/extract_ual.py',
                  'extras': {'source': 'Quaternius Universal Animation Library / Universal Animation Library 2 (CC0 1.0) https://quaternius.com/packs/universalanimationlibrary.html',
                             'clips': [n for _, n in CLIPS], 'tol': o.tol}},
        'scene': 0, 'scenes': [{'name': 'Scene', 'nodes': [0]}],
        'nodes': nodes, 'animations': anims, 'accessors': accs, 'bufferViews': views,
        'buffers': [{'byteLength': 0}],
    }
    while len(blob) % 4:
        blob.append(0)
    gl['buffers'][0]['byteLength'] = len(blob)
    jb = json.dumps(gl, separators=(',', ':'), ensure_ascii=False).encode('utf-8')
    while len(jb) % 4:
        jb += b' '
    total = 12 + 8 + len(jb) + 8 + len(blob)
    os.makedirs(os.path.dirname(os.path.abspath(o.out)), exist_ok=True)
    with open(o.out, 'wb') as f:
        f.write(struct.pack('<III', GLB_MAGIC, 2, total))
        f.write(struct.pack('<II', len(jb), CH_JSON))
        f.write(jb)
        f.write(struct.pack('<II', len(blob), CH_BIN))
        f.write(bytes(blob))
    print('\n'.join(report))
    print('節點 %d、片段 %d、%s：%.1f KB' % (len(nodes), len(anims), o.out, total / 1024))


if __name__ == '__main__':
    main()
