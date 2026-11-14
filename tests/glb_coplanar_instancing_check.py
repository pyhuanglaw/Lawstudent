"""tools/glb_coplanar.py 套用 EXT_mesh_gpu_instancing 的小測（SHOP-CC0-HELP-1113，第③群幫手 2026-11-14；LAWWW-C 01:43 同意）。不需要 Blender：
  python3 tests/glb_coplanar_instancing_check.py
以前工具只把 instancing 的原型放在節點的位置（多半是原點）比，兩個不同原型在原點互相比 → 假疊面（大口二樓四疊課本原型的底面都在 y=0）；
同一個原型的每一份也沒有展開 → 兩份真的疊在一起的（同一個位置放了兩次）抓不到。這支用程式產生一顆小 GLB 驗兩件事：
  1. 兩個原型（同一片 1×1 m 的地板方塊）各放一份、位置差 3 m → 一定會閃 0 m²（以前會算成 1 m²）。
  2. 第三個原型放兩份在同一個位置 → 一定會閃 1 m²（以前抓不到）。
  3. 沒有 instancing 的一般節點照舊：兩個節點放在同一個位置 → 一定會閃 1 m²。"""
import json, os, struct, subprocess, sys, tempfile
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
TOOL = os.path.join(ROOT, 'tools', 'glb_coplanar.py')


def build(path):
    """一顆 GLB：一片朝上的 1×1 m 方塊（兩個三角形）當網格；四個網格都用同一份頂點（不同 mesh 物件）"""
    V = np.array([[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], np.float32); I = np.array([0, 2, 1, 0, 3, 2], np.uint16)   # 法線朝 +y
    T1 = np.array([[0, 0, 0]], np.float32); T2 = np.array([[3, 0, 0]], np.float32); T3 = np.array([[6, 0, 0], [6, 0, 0]], np.float32)
    blobs = [V.tobytes(), I.tobytes() + b'\0\0', T1.tobytes(), T2.tobytes(), T3.tobytes()]
    off = 0; views = []
    for b in blobs: views.append({'buffer': 0, 'byteOffset': off, 'byteLength': len(b)}); off += len(b)
    acc = [{'bufferView': 0, 'componentType': 5126, 'count': 4, 'type': 'VEC3', 'min': [0, 0, 0], 'max': [1, 0, 1]},
           {'bufferView': 1, 'componentType': 5123, 'count': 6, 'type': 'SCALAR'},
           {'bufferView': 2, 'componentType': 5126, 'count': 1, 'type': 'VEC3'}, {'bufferView': 3, 'componentType': 5126, 'count': 1, 'type': 'VEC3'},
           {'bufferView': 4, 'componentType': 5126, 'count': 2, 'type': 'VEC3'}]
    prim = {'attributes': {'POSITION': 0}, 'indices': 1, 'material': 0}
    inst = lambda a: {'EXT_mesh_gpu_instancing': {'attributes': {'TRANSLATION': a}}}
    J = {'asset': {'version': '2.0'}, 'extensionsUsed': ['EXT_mesh_gpu_instancing'], 'materials': [{'name': 'm'}],
         'meshes': [{'name': n, 'primitives': [prim]} for n in ('protoA', 'protoB', 'protoC', 'plain')],
         'nodes': [{'name': 'A', 'mesh': 0, 'extensions': inst(2)}, {'name': 'B', 'mesh': 1, 'extensions': inst(3)}, {'name': 'C', 'mesh': 2, 'extensions': inst(4)},
                   {'name': 'P1', 'mesh': 3, 'translation': [10, 0, 0]}, {'name': 'P2', 'mesh': 3, 'translation': [10, 0, 0]}],
         'scenes': [{'nodes': [0, 1, 2, 3, 4]}], 'scene': 0, 'accessors': acc, 'bufferViews': views, 'buffers': [{'byteLength': off}]}
    js = json.dumps(J).encode(); js += b' ' * ((4 - len(js) % 4) % 4); bin_ = b''.join(blobs); bin_ += b'\0' * ((4 - len(bin_) % 4) % 4)
    open(path, 'wb').write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bin_)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(bin_), 0x004E4942) + bin_)


fails = 0
def check(ok, msg):
    global fails
    print(('PASS ' if ok else 'FAIL ') + msg); fails += 0 if ok else 1


with tempfile.TemporaryDirectory() as d:
    g = os.path.join(d, 'inst.glb'); build(g); out = os.path.join(d, 'r.json')
    subprocess.run([sys.executable, TOOL, g, '--json', out], capture_output=True, check=True)
    r = json.load(open(out)); r = r[0] if isinstance(r, list) else r   # --json 寫的是每個檔一份的清單
    pairs = [p for p in r['pairs'] if p['kind'] == 'always']
    def area(pred): return round(sum(p['area'] for p in pairs if pred(p)), 3)
    names = lambda p: json.dumps(p, ensure_ascii=False)   # 一對裡兩個物件的名字（A、B、C#0、C#1、P1、P2）
    ab = area(lambda p: ('A' in names(p) and 'B' in names(p)) and 'C' not in names(p))
    cc = area(lambda p: names(p).count('C#') >= 2)
    pp = area(lambda p: 'P1' in names(p) and 'P2' in names(p))
    check(ab == 0.0, '1 兩個不同原型（各一份、相距 3 m）不算疊面：%.3f m²（要 0）' % ab)
    check(abs(cc - 1.0) < 0.01, '2 同一個原型兩份放在同一個位置算疊面：%.3f m²（要 1）' % cc)
    check(abs(pp - 1.0) < 0.01, '3 一般節點（沒有 instancing）兩個放在同一個位置照舊算：%.3f m²（要 1）' % pp)
print('ALL PASS' if not fails else 'FAILED %d' % fails); sys.exit(1 if fails else 0)
