"""在 GLB 裡加一張「窗外的景」卡（照 afar 的 WALL_front_VIEW_afr_window_view：玻璃外 2.5 m 一片直立的面、雙面、底色＋自發光 0.12 同一張照片）。
LAWWW2-B 2026-11-07（LAWWW-B 15:35：洋洋鹹酥雞、轉角唱片的 GLB 都沒有窗外的景，從店裡看玻璃外面是空的，「烘的時候順便看要不要補一張（照 afar 的做法）」）。不需要 Blender：
  python3 tools/blender/env_second/lightbake/glb_add_viewcard.py 輸入.glb 輸出.glb --name WALL_front_VIEW_yy_window_view --mat yy_window_view \
      --img 白天照片.webp --x0 -8 --x1 8 --y0 -1 --y1 5.5 --z 8.0 [--dir 0,0,-1]
座標＝遊戲座標（GLB 的 y 往上）；卡在 z 那一個平面上，法線朝 +z（往外），u＝0 在 x0（和 afar 一樣：照片要左右鏡像過，從店裡看才是正的）。
節點掛在場景的根節點底下，extras {dir, windowView}：attachRoomGLB 照 dir 和前牆一起淡出；zones3d.js 的 ggAAattach 認名字有 VIEW 的網格、
GG_VIEW[區域].mat＝材質名字的，白天／晚上換 GG_VIEW 的照片（晚上不調暗）；這裡嵌進去的那一張是照片載入失敗時的備用。
不動原本的節點、網格、材質（只在後面加：一個節點、網格、材質、貼圖、圖片）；已經有同名的節點就停下來（不重複加）。"""
import json, struct, sys
import numpy as np


def opt(a, k, d=None):
    return a[a.index(k) + 1] if k in a else d


def main():
    a = sys.argv[1:]; src, dst = a[0], a[1]
    name, mat, img = opt(a, '--name'), opt(a, '--mat'), opt(a, '--img')
    x0, x1, y0, y1, z = (float(opt(a, k)) for k in ('--x0', '--x1', '--y0', '--y1', '--z'))
    d = [float(v) for v in opt(a, '--dir', '0,0,-1').split(',')]
    b = open(src, 'rb').read()
    n = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + n])
    off = 20 + n; bl = struct.unpack('<I', b[off:off + 4])[0]; BIN = bytearray(b[off + 8:off + 8 + bl])
    assert len(J['buffers']) == 1, '只處理一個 buffer 的 GLB'
    if any(nd.get('name') == name for nd in J['nodes']): sys.exit('已經有 ' + name + '，不重複加')
    for k in ('materials', 'meshes', 'accessors', 'bufferViews', 'textures', 'images', 'samplers'): J.setdefault(k, [])

    def view(data, target=None):
        while len(BIN) % 4: BIN.append(0)
        o = len(BIN); BIN.extend(data); v = {'buffer': 0, 'byteOffset': o, 'byteLength': len(data)}
        if target: v['target'] = target
        J['bufferViews'].append(v); return len(J['bufferViews']) - 1

    P = np.array([(x1, y1, z), (x0, y1, z), (x0, y0, z), (x1, y0, z)], np.float32)
    N = np.array([(0, 0, 1)] * 4, np.float32)
    U = np.array([(1, 0), (0, 0), (0, 1), (1, 1)], np.float32)
    I = np.array([0, 1, 2, 0, 2, 3], np.uint16)
    acc = []
    for arr, typ in ((P, 'VEC3'), (N, 'VEC3'), (U, 'VEC2'), (I, 'SCALAR')):
        v = view(arr.tobytes(), 34963 if arr is I else 34962)
        x = {'bufferView': v, 'componentType': 5123 if arr is I else 5126, 'count': len(arr), 'type': typ}
        if arr is P: x['min'] = P.min(0).tolist(); x['max'] = P.max(0).tolist()
        J['accessors'].append(x); acc.append(len(J['accessors']) - 1)
    data = open(img, 'rb').read(); webp = data[:4] == b'RIFF' and data[8:12] == b'WEBP'
    J['images'].append({'bufferView': view(data), 'mimeType': 'image/webp' if webp else 'image/jpeg', 'name': mat})
    smp = next((i for i, s in enumerate(J['samplers']) if s.get('magFilter') == 9729 and s.get('minFilter') == 9987 and 'wrapS' not in s and 'wrapT' not in s), None)
    if smp is None: J['samplers'].append({'magFilter': 9729, 'minFilter': 9987}); smp = len(J['samplers']) - 1
    tex = {'sampler': smp}
    if webp:
        tex['extensions'] = {'EXT_texture_webp': {'source': len(J['images']) - 1}}
        if 'EXT_texture_webp' not in J.get('extensionsUsed', []): J.setdefault('extensionsUsed', []).append('EXT_texture_webp')
    else: tex['source'] = len(J['images']) - 1
    J['textures'].append(tex); t = len(J['textures']) - 1
    J['materials'].append({'name': mat, 'doubleSided': True, 'emissiveFactor': [0.12, 0.12, 0.12], 'emissiveTexture': {'index': t},
                           'pbrMetallicRoughness': {'baseColorTexture': {'index': t}, 'metallicFactor': 0.0, 'roughnessFactor': 0.9}})
    J['meshes'].append({'name': name, 'primitives': [{'attributes': {'POSITION': acc[0], 'NORMAL': acc[1], 'TEXCOORD_0': acc[2]}, 'indices': acc[3], 'material': len(J['materials']) - 1}]})
    J['nodes'].append({'name': name, 'mesh': len(J['meshes']) - 1, 'extras': {'dir': d, 'windowView': True}})
    ni = len(J['nodes']) - 1; scene = J['scenes'][J.get('scene', 0)]
    roots = scene['nodes']
    if len(roots) == 1 and 'mesh' not in J['nodes'][roots[0]] and not any(k in J['nodes'][roots[0]] for k in ('translation', 'rotation', 'scale', 'matrix')):
        J['nodes'][roots[0]].setdefault('children', []).append(ni); where = J['nodes'][roots[0]].get('name')   # 根節點沒有變換：掛在它底下（和 afar 一樣）
    else:
        roots.append(ni); where = '場景'
    while len(BIN) % 4: BIN.append(0)
    J['buffers'][0]['byteLength'] = len(BIN)
    js = json.dumps(J, ensure_ascii=False, separators=(',', ':')).encode('utf8')
    while len(js) % 4: js += b' '
    out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(BIN)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(BIN), 0x004E4942) + bytes(BIN)
    open(dst, 'wb').write(out)
    print('窗景卡', name, '材質', mat, '掛在', where, (x0, x1, y0, y1, z), '照片', img, len(data), 'bytes →', dst, len(out))


if __name__ == '__main__':
    main()
