import json,struct,sys,collections
R='/home/user/Lawstudent/'
F={'wenzhou_street':'assets/models/env/second_ai/wenzhou_street.glb','wz_park':'assets/models/env/second_ai/wz_park.glb','cafe_exterior':'assets/models/env/second_ai/cafe_exterior.glb','wz_scooter':'assets/models/env/second_ai/scooter.glb','wz_cat':'assets/models/env/second_ai/aa_support/wz_cat.glb','wz_props':'assets/models/env/second_ai/wz_props.glb','wz_jphouse':'assets/models/env/second_ai/wz_jphouse.glb'}
sigs=collections.defaultdict(lambda:collections.Counter()); per=collections.defaultdict(set)
for key,p in F.items():
    b=open(R+p,'rb').read(); n=struct.unpack('<I',b[12:16])[0]; j=json.loads(b[20:20+n])
    inst={nd['mesh'] for nd in j['nodes'] if 'mesh' in nd and 'EXT_mesh_gpu_instancing' in (nd.get('extensions') or {})}
    plain={nd['mesh'] for nd in j['nodes'] if 'mesh' in nd and 'EXT_mesh_gpu_instancing' not in (nd.get('extensions') or {})}
    for mi,m in enumerate(j['meshes']):
        for pr in m['primitives']:
            mt=j['materials'][pr['material']] if 'material' in pr else {}
            pb=mt.get('pbrMetallicRoughness',{}); ex=mt.get('extensions') or {}; at=pr['attributes']
            c=at.get('COLOR_0'); ct=j['accessors'][c]['type'] if c is not None else None
            s=('basic' if 'KHR_materials_unlit' in ex else ('phys' if set(ex)-{'KHR_texture_transform','KHR_materials_emissive_strength'} else 'std'),
               'map' if 'baseColorTexture' in pb else '-', 'mr' if 'metallicRoughnessTexture' in pb else '-', 'nor' if 'normalTexture' in mt else '-',
               'emi' if 'emissiveTexture' in mt else '-', 'ao' if 'occlusionTexture' in mt else '-', mt.get('alphaMode','OPAQUE')[:2], 'DS' if mt.get('doubleSided') else 'ss',
               ('vc3' if ct=='VEC3' else 'vc4') if ct else '-', 'tan' if 'TANGENT' in at else '-')
            for kind in (['inst'] if mi in inst else [])+(['mesh'] if mi in plain else []):
                sigs[s+(kind,)][key]+=1; per[s+(kind,)].add(mt.get('name',''))
print('distinct', len(sigs))
for s,c in sorted(sigs.items(), key=lambda kv:-sum(kv[1].values())):
    print(sum(c.values()), ' '.join(s), dict(c), sorted(per[s])[:6])
