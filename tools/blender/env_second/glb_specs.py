"""GLB 規格（驗收用，D38 第 12.8 節的⑥）：檔案大小、三角形數（含 instancing 的實際畫出數）、網格／primitive（≈ draw call）、材質、貼圖尺寸與格式。
用法：python3 tools/blender/env_second/glb_specs.py assets/models/env/second_ai/*.glb [--md]"""
import io, json, struct, sys
from PIL import Image


def specs(path):
    b = open(path, 'rb').read(); L = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + L]); bin0 = 20 + L + 8
    acc = j['accessors']
    def tri(prim):
        if 'indices' in prim: return acc[prim['indices']]['count'] // 3
        return acc[prim['attributes']['POSITION']]['count'] // 3
    mesh_tris = [sum(tri(p) for p in m['primitives']) for m in j['meshes']]
    drawn = 0; prims_drawn = 0; inst_nodes = 0
    for n in j['nodes']:
        if 'mesh' not in n: continue
        k = 1; ext = n.get('extensions', {}).get('EXT_mesh_gpu_instancing')
        if ext: k = acc[ext['attributes']['TRANSLATION']]['count'] if 'TRANSLATION' in ext['attributes'] else 1; inst_nodes += 1
        drawn += mesh_tris[n['mesh']] * k; prims_drawn += len(j['meshes'][n['mesh']]['primitives'])
    imgs = []
    for im in j.get('images', []):
        bv = j['bufferViews'][im['bufferView']]; data = b[bin0 + bv.get('byteOffset', 0):bin0 + bv.get('byteOffset', 0) + bv['byteLength']]
        w, h = Image.open(io.BytesIO(data)).size; imgs.append((im.get('name', ''), w, h, im.get('mimeType', ''), len(data)))
    sizes = {}
    for (_, w, h, mt, _) in imgs: sizes[f'{w}×{h}'] = sizes.get(f'{w}×{h}', 0) + 1
    return {'file': path, 'bytes': len(b), 'MB': round(len(b) / 1048576, 2), 'tris_unique': sum(mesh_tris), 'tris_drawn': drawn,
            'meshes': len(j['meshes']), 'draw_calls_approx': prims_drawn, 'instanced_nodes': inst_nodes, 'materials': len(j.get('materials', [])),
            'textures': len(imgs), 'texture_sizes': sizes, 'texture_KB': round(sum(i[4] for i in imgs) / 1024), 'formats': sorted({i[3] for i in imgs}),
            'extensions': j.get('extensionsUsed', [])}


if __name__ == '__main__':
    md = '--md' in sys.argv
    for p in [a for a in sys.argv[1:] if not a.startswith('--')]:
        s = specs(p)
        if md:
            print(f"| `{s['file']}` | {s['MB']} MB | {s['tris_unique']:,}（畫出 {s['tris_drawn']:,}） | {s['meshes']} 個網格、約 {s['draw_calls_approx']} 次 draw call（{s['instanced_nodes']} 組 instancing） | {s['materials']} | {s['textures']} 張（{', '.join(f'{k}×{v}' for k, v in s['texture_sizes'].items())}；{s['texture_KB']} KB；{'/'.join(s['formats'])}） |")
        else: print(json.dumps(s, ensure_ascii=False))
