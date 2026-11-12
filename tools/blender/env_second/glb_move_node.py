"""把 GLB 裡名字含某字串的節點平移（只改 JSON 區塊；二進位不動）。用法：python3 glb_move_node.py in.glb out.glb 名字片段 dx dy dz"""
import json, struct, sys
src, dst, key, dx, dy, dz = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]), float(sys.argv[5]), float(sys.argv[6])
b = open(src, 'rb').read(); magic, ver, total = struct.unpack('<4sII', b[:12]); assert magic == b'glTF'
jl, jt = struct.unpack('<II', b[12:20]); assert jt == 0x4E4F534A; J = json.loads(b[20:20 + jl]); rest = b[20 + jl:]
hit = []
for n in J['nodes']:
    if key in n.get('name', ''):
        assert 'matrix' not in n; t = n.get('translation', [0, 0, 0]); n['translation'] = [t[0] + dx, t[1] + dy, t[2] + dz]; hit.append(n['name'])
js = json.dumps(J, ensure_ascii=False, separators=(',', ':')).encode('utf-8'); js += b' ' * ((4 - len(js) % 4) % 4)
out = struct.pack('<4sII', b'glTF', ver, 12 + 8 + len(js) + len(rest)) + struct.pack('<II', len(js), 0x4E4F534A) + js + rest
open(dst, 'wb').write(out); print('moved', hit)
