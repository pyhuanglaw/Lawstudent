"""把 GLB 裡一個網格節點，照三角形中心的位置切成兩個節點（LAWWW2-B 2026-11-09；#204 美國公寓 WALL_bath_n_door：一個節點裡兩片開著的門板，各貼不同的牆）。不需要 Blender：
  python3 tools/blender/env_second/lightbake/glb_split_node.py <in.glb> <out.glb> --node <節點名字> --axis x|y|z --cut <值> --name <新節點名字>
  - 三角形中心（節點自己的座標）在 cut 以下的留在原本的節點，以上的搬到新節點（名字 --name）。
  - 新節點：同一個父節點、同樣的變換、同樣的材質、extras 照抄（之後再跑 glb_partition_at.py，規則 B 會把每一片門板改成跟它貼著的牆）。
  - 兩個節點都換成自己的網格，頂點只留用得到的（POSITION、NORMAL、TEXCOORD_0、TEXCOORD_1… 全部照抄、重新編號），
    POSITION 的 min／max 照新的頂點算：glb_partition_at.py、遊戲（attachRoomGLB 的淡出判斷點）看外框，外框要是那一片門板自己的。
  - 第二套 UV（光照）照抄，光照貼圖不用重烘。原本的網格不再被用到（資料留在 BIN 裡，不影響遊戲）。
安全檢查（不合就停）：節點的網格只有這個節點用、有索引、沒有 morph／skin、切完兩邊都有三角形。"""
import json, struct, sys
import numpy as np


def opt(k, d=None):
    return sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d


CT = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8, 5122: np.int16, 5120: np.int8}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}


def main():
    src, dst = sys.argv[1], sys.argv[2]
    name, axis, cut, newname = opt('--node'), 'xyz'.index(opt('--axis', 'x')), float(opt('--cut')), opt('--name')
    b = open(src, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + n]); rest = b[20 + n:]
    bl = struct.unpack('<I', rest[:4])[0]; B = bytearray(rest[8:8 + bl])
    idx = [i for i, nd in enumerate(J['nodes']) if nd.get('name') == name]
    if len(idx) != 1: sys.exit('要剛好一個節點叫 %s（%d）' % (name, len(idx)))
    ni = idx[0]; nd = J['nodes'][ni]
    if any(x.get('mesh') == nd['mesh'] for j, x in enumerate(J['nodes']) if j != ni): sys.exit('網格被別的節點用')
    if any(x.get('name') == newname for x in J['nodes']): sys.exit('已經有節點叫 %s' % newname)
    me = J['meshes'][nd['mesh']]

    def read(ai):
        a = J['accessors'][ai]; v = J['bufferViews'][a['bufferView']]; k = NC[a['type']]; dt = CT[a['componentType']]
        st = v.get('byteStride'); isz = np.dtype(dt).itemsize
        if st and st != k * isz: sys.exit('interleaved 不處理')
        return np.frombuffer(bytes(B), dt, a['count'] * k, v.get('byteOffset', 0) + a.get('byteOffset', 0)).reshape(a['count'], k).copy()

    def append(arr, ctype, atype, target, minmax=False, normalized=False):
        nonlocal B
        pad = (4 - len(B) % 4) % 4; B += b'\0' * pad; off = len(B); data = np.ascontiguousarray(arr).tobytes(); B += data
        J['bufferViews'].append({'buffer': 0, 'byteOffset': off, 'byteLength': len(data), 'target': target})
        acc = {'bufferView': len(J['bufferViews']) - 1, 'componentType': ctype, 'count': int(arr.shape[0]), 'type': atype}
        if normalized: acc['normalized'] = True
        if minmax: acc['min'] = [float(x) for x in arr.min(0)]; acc['max'] = [float(x) for x in arr.max(0)]
        J['accessors'].append(acc); return len(J['accessors']) - 1

    parts = {0: [], 1: []}
    for pr in me['primitives']:
        if 'indices' not in pr or pr.get('targets') or 'JOINTS_0' in pr['attributes']: sys.exit('沒有索引或有 morph／skin，不處理')
        P = read(pr['attributes']['POSITION']).astype(float); I = read(pr['indices']).reshape(-1, 3)
        side = (P[I].mean(1)[:, axis] >= cut).astype(int)
        for s in (0, 1):
            T = I[side == s]
            if not len(T): continue
            used = np.unique(T); remap = np.full(len(P), -1, np.int64); remap[used] = np.arange(len(used))
            prn = {k: v for k, v in pr.items() if k not in ('attributes', 'indices')}; prn['attributes'] = {}
            for an, ai in pr['attributes'].items():
                a0 = J['accessors'][ai]
                prn['attributes'][an] = append(read(ai)[used], a0['componentType'], a0['type'], 34962, 'min' in a0 or an == 'POSITION', bool(a0.get('normalized')))
            big = len(used) >= 65536
            prn['indices'] = append(remap[T].reshape(-1).astype(np.uint32 if big else np.uint16).reshape(-1, 1), 5125 if big else 5123, 'SCALAR', 34963)
            parts[s].append((prn, len(T)))
    if not parts[0] or not parts[1]: sys.exit('切完有一邊沒有三角形（cut 不對）')
    J['meshes'].append({'name': me.get('name', name) + '_a', 'primitives': [p for p, _ in parts[0]]}); nd['mesh'] = len(J['meshes']) - 1
    J['meshes'].append({'name': newname, 'primitives': [p for p, _ in parts[1]]})
    nn = {k: v for k, v in nd.items() if k not in ('mesh', 'children', 'name')}; nn['name'] = newname; nn['mesh'] = len(J['meshes']) - 1
    if 'extras' in nn: nn['extras'] = json.loads(json.dumps(nn['extras']))
    J['nodes'].append(nn); new_i = len(J['nodes']) - 1
    par = [i for i, x in enumerate(J['nodes']) if ni in x.get('children', [])]
    if par: ch = J['nodes'][par[0]]['children']; ch.insert(ch.index(ni) + 1, new_i)
    else:
        for sc in J['scenes']:
            if ni in sc['nodes']: sc['nodes'].insert(sc['nodes'].index(ni) + 1, new_i)
    J['buffers'][0]['byteLength'] = len(B)
    js = json.dumps(J, ensure_ascii=False, separators=(',', ':')).encode('utf-8'); js += b' ' * ((4 - len(js) % 4) % 4)
    bn = bytes(B) + b'\0' * ((4 - len(B) % 4) % 4)
    open(dst, 'wb').write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bn)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(bn), 0x004E4942) + bn)
    print('%s：%s 切成兩個節點（%s %s %.3f）：留下 %d 個三角形、%s %d 個三角形 → %s' % (src, name, 'xyz'[axis], '<', cut, sum(t for _, t in parts[0]), newname, sum(t for _, t in parts[1]), dst))


if __name__ == '__main__':
    main()
