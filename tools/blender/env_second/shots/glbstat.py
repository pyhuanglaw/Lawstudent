import json, struct, sys, collections
def load(p):
    b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; return json.loads(b[20:20 + n])
p = sys.argv[1]; J = load(p); acc = J['accessors']; mats = J.get('materials', [])
inst = collections.Counter(); 
for nd in J['nodes']:
    if 'mesh' in nd:
        k = nd.get('extensions', {}).get('EXT_mesh_gpu_instancing')
        inst[nd['mesh']] += acc[k['attributes']['TRANSLATION']]['count'] if k else 1
rows = []
for mi, m in enumerate(J['meshes']):
    for pr in m['primitives']:
        t = (acc[pr['indices']]['count'] if 'indices' in pr else acc[pr['attributes']['POSITION']]['count']) // 3
        rows.append((t * inst[mi], t, inst[mi], m.get('name', ''), mats[pr['material']]['name'] if 'material' in pr else '-'))
rows.sort(reverse=True); tot = sum(r[0] for r in rows)
print('primitives', len(rows), 'drawn tris', tot, 'materials', len(mats))
for r in rows[:int(sys.argv[2]) if len(sys.argv) > 2 else 40]: print('%7d = %6d x %3d  %-40s %s' % r)
bym = collections.Counter(); 
for r in rows: bym[r[4]] += 1
print('primitives per material (top):', bym.most_common(15))
