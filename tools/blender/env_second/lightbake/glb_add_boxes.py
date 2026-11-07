"""在 GLB 裡加幾個方塊（只在光照烘焙時擋光、反光的「窗外的景」；bake_room.py 的 --nolm、--drop 都要放 BAKEONLY，不分光照貼圖、輸出前刪掉）。
LAWWW2（帳號 A）2026-11-02，日本宿舍房間 jp_room 光照烘焙加的（bake_jp_room.sh）。不需要 Blender：
  python3 tools/blender/env_second/lightbake/glb_add_boxes.py 輸入.glb 輸出.glb '名字,x0,x1,y0,y1,z0,z1,#rrggbb;…'
座標＝遊戲座標（GLB 的 y 往上）。名字前面自動加 BAKEONLY_；材質也叫 BAKEONLY_<名字>（不發光、粗糙度 0.95、顏色照 sRGB 換成線性）。
為什麼：烘焙時窗外只有天空，接近地平線那一圈最亮的天光從窗戶平平地照進來，落在房間最裡面（門口）的地上，門口反而比窗前亮
  （宿舍四人房 10-30 用 dorm_room4.py --bakeblock 在模型裡加對面的樓；jp_room 用部署中的 GLB blob 當輸入、不重做模型，所以另外加在 GLB 上）。"""
import json, struct, sys
import numpy as np


def srgb2lin(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]


def box_geo(x0, x1, y0, y1, z0, z1):
    P, N, I = [], [], []
    faces = [((1, 0, 0), [(x1, y0, z0), (x1, y1, z0), (x1, y1, z1), (x1, y0, z1)]), ((-1, 0, 0), [(x0, y0, z1), (x0, y1, z1), (x0, y1, z0), (x0, y0, z0)]),
             ((0, 1, 0), [(x0, y1, z0), (x0, y1, z1), (x1, y1, z1), (x1, y1, z0)]), ((0, -1, 0), [(x0, y0, z1), (x0, y0, z0), (x1, y0, z0), (x1, y0, z1)]),
             ((0, 0, 1), [(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]), ((0, 0, -1), [(x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0)])]
    for n, q in faces:
        b = len(P); P += q; N += [n] * 4; I += [b, b + 1, b + 2, b, b + 2, b + 3]
    return np.array(P, np.float32), np.array(N, np.float32), np.array(I, np.uint32)


def main():
    src, dst, spec = sys.argv[1], sys.argv[2], sys.argv[3]
    b = open(src, 'rb').read()
    n = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + n])
    off = 20 + n; bl = struct.unpack('<I', b[off:off + 4])[0]; BIN = bytearray(b[off + 8:off + 8 + bl])
    assert len(J['buffers']) == 1, '只處理一個 buffer 的 GLB'
    J.setdefault('materials', []); J.setdefault('meshes', []); J.setdefault('accessors', []); J.setdefault('bufferViews', [])
    scene = J['scenes'][J.get('scene', 0)]
    for t in [t for t in spec.split(';') if t.strip()]:
        f = t.split(','); name = 'BAKEONLY_' + f[0]; x0, x1, y0, y1, z0, z1 = map(float, f[1:7]); col = srgb2lin(f[7])
        P, N, I = box_geo(min(x0, x1), max(x0, x1), min(y0, y1), max(y0, y1), min(z0, z1), max(z0, z1))
        acc = []
        for arr, typ, target in ((P, 'VEC3', 34962), (N, 'VEC3', 34962), (I, 'SCALAR', 34963)):
            while len(BIN) % 4: BIN.append(0)
            o = len(BIN); BIN += arr.tobytes()
            J['bufferViews'].append({'buffer': 0, 'byteOffset': o, 'byteLength': arr.nbytes, 'target': target})
            a = {'bufferView': len(J['bufferViews']) - 1, 'componentType': 5125 if arr.dtype == np.uint32 else 5126, 'count': len(arr), 'type': typ}
            if arr is P: a['min'] = P.min(0).tolist(); a['max'] = P.max(0).tolist()
            J['accessors'].append(a); acc.append(len(J['accessors']) - 1)
        J['materials'].append({'name': name, 'pbrMetallicRoughness': {'baseColorFactor': col + [1.0], 'metallicFactor': 0.0, 'roughnessFactor': 0.95}})
        J['meshes'].append({'name': name, 'primitives': [{'attributes': {'POSITION': acc[0], 'NORMAL': acc[1]}, 'indices': acc[2], 'material': len(J['materials']) - 1}]})
        J['nodes'].append({'name': name, 'mesh': len(J['meshes']) - 1}); scene['nodes'].append(len(J['nodes']) - 1)
        print('box', name, (x0, x1, y0, y1, z0, z1), f[7])
    while len(BIN) % 4: BIN.append(0)
    J['buffers'][0]['byteLength'] = len(BIN)
    js = json.dumps(J, ensure_ascii=False, separators=(',', ':')).encode('utf8')
    while len(js) % 4: js += b' '
    out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(BIN)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(BIN), 0x004E4942) + bytes(BIN)
    open(dst, 'wb').write(out); print('wrote', dst, len(out))


if __name__ == '__main__':
    main()
