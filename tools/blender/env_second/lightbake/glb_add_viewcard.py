"""烘完以後在 GLB 加一張窗景卡（bake_gg_new.sh 的 CARD）：不開 Blender，直接改 GLB 的 JSON＋BIN。
bake_gg_new.sh 一直呼叫這支，但開發分支上沒有這個檔（SHOP-CC0-HELP-1113 幫手 g4 2026-11-13 重烘洋洋時發現，照原本 yangyang_interior.glb 裡那張卡的格式補寫）：
  一個四邊形網格（遊戲座標 x0～x1、y0～y1、z 固定），法線朝 +z、雙面（和原本那張卡一樣）；材質＝那張照片（顏色＋微弱自發光 0.12，晚上遊戲會調暗）；
  節點名字 --name、extras {dir:[0,0,-1], windowView:true}（跟著前牆淡出），掛在場景的第一個根節點底下。
用法：python3 glb_add_viewcard.py <in.glb> <out.glb> --name WALL_front_VIEW_yy_window_view --mat yy_window_view --img <照片.webp> --x0 -8 --x1 8 --y0 -1 --y1 5.5 --z 8.0"""
import json, struct, sys


def arg(a, k, d=None): return a[a.index(k) + 1] if k in a else d


def main():
    a = sys.argv[1:]; src, dst = a[0], a[1]
    name, mat, img = arg(a, '--name'), arg(a, '--mat'), arg(a, '--img')
    x0, x1, y0, y1, z = (float(arg(a, k)) for k in ('--x0', '--x1', '--y0', '--y1', '--z'))
    b = open(src, 'rb').read(); jl = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + jl]); rest = b[20 + jl:]
    bl = struct.unpack('<I', rest[0:4])[0]; BIN = bytearray(rest[8:8 + bl])
    if any(n.get('name') == name for n in J['nodes']): print('已經有', name); open(dst, 'wb').write(b); return
    def add(data, target=None):
        while len(BIN) % 4: BIN.append(0)
        off = len(BIN); BIN.extend(data); bv = {'buffer': 0, 'byteOffset': off, 'byteLength': len(data)}
        if target: bv['target'] = target
        J['bufferViews'].append(bv); return len(J['bufferViews']) - 1
    P = [(x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z)]
    UV = [(0.0, 1.0), (1.0, 1.0), (1.0, 0.0), (0.0, 0.0)]   # 和原本 yangyang_interior.glb 那張卡一樣：u 從 x0 到 x1、v 由上往下
    pv = add(b''.join(struct.pack('<3f', *p) for p in P), 34962); nv = add(struct.pack('<3f', 0, 0, 1) * 4, 34962)
    uv = add(b''.join(struct.pack('<2f', *t) for t in UV), 34962); iv = add(struct.pack('<6H', 0, 1, 2, 0, 2, 3), 34963)
    A = J['accessors']; base = len(A)
    A += [{'bufferView': pv, 'componentType': 5126, 'count': 4, 'type': 'VEC3', 'min': [min(x0, x1), y0, z], 'max': [max(x0, x1), y1, z]},
          {'bufferView': nv, 'componentType': 5126, 'count': 4, 'type': 'VEC3'},
          {'bufferView': uv, 'componentType': 5126, 'count': 4, 'type': 'VEC2'},
          {'bufferView': iv, 'componentType': 5123, 'count': 6, 'type': 'SCALAR'}]
    data = open(img, 'rb').read(); webp = img.lower().endswith('.webp')
    J.setdefault('images', []).append({'bufferView': add(data), 'mimeType': 'image/webp' if webp else 'image/jpeg', 'name': mat})
    if not J.get('samplers'): J['samplers'] = [{}]
    tex = {'sampler': 0, 'extensions': {'EXT_texture_webp': {'source': len(J['images']) - 1}}} if webp else {'sampler': 0, 'source': len(J['images']) - 1}
    if webp:
        for k in ('extensionsUsed',): J.setdefault(k, []); 'EXT_texture_webp' in J[k] or J[k].append('EXT_texture_webp')
    J.setdefault('textures', []).append(tex); ti = len(J['textures']) - 1
    J.setdefault('materials', []).append({'name': mat, 'doubleSided': True, 'emissiveFactor': [0.12, 0.12, 0.12], 'emissiveTexture': {'index': ti},
                                          'pbrMetallicRoughness': {'baseColorTexture': {'index': ti}, 'metallicFactor': 0, 'roughnessFactor': 0.9}})
    J['meshes'].append({'name': name, 'primitives': [{'attributes': {'POSITION': base, 'NORMAL': base + 1, 'TEXCOORD_0': base + 2}, 'indices': base + 3, 'material': len(J['materials']) - 1}]})
    J['nodes'].append({'name': name, 'mesh': len(J['meshes']) - 1, 'extras': {'dir': [0, 0, -1], 'windowView': True}})
    root = J['scenes'][J.get('scene', 0)]['nodes'][0]; J['nodes'][root].setdefault('children', []).append(len(J['nodes']) - 1)
    while len(BIN) % 4: BIN.append(0)
    J['buffers'][0]['byteLength'] = len(BIN)
    js = json.dumps(J, ensure_ascii=False, separators=(',', ':')).encode('utf-8'); js += b' ' * ((4 - len(js) % 4) % 4)
    out = struct.pack('<4sII', b'glTF', 2, 12 + 8 + len(js) + 8 + len(BIN)) + struct.pack('<I', len(js)) + b'JSON' + js + struct.pack('<I', len(BIN)) + b'BIN\x00' + bytes(BIN)
    open(dst, 'wb').write(out); print('窗景卡', name, '→', dst)


if __name__ == '__main__':
    main()
