import json, sys, collections, itertools
P = ['precision','outputColorSpace','envMapMode','envMapPMREM','envMapMaxLod','envMapSize','mapUv','alphaMapUv','lightMapUv','aoMapUv','bumpMapUv','normalMapUv','displacementMapUv','emissiveMapUv','metalnessMapUv','roughnessMapUv','anisotropyMapUv','clearcoatMapUv','clearcoatNormalMapUv','clearcoatRoughnessMapUv','diffuseRoughnessMapUv','iridescenceMapUv','iridescenceThicknessMapUv','sheenColorMapUv','sheenRoughnessMapUv','specularMapUv','specularColorMapUv','specularIntensityMapUv','transmissionMapUv','thicknessMapUv','combine','fogExp2','sizeAttenuation','morphTargetsCount','numSunLights','numDirLights','numPointLights','numSpotLights','numSpotLightMaps','numHemiLights','numRectAreaLights','numSunLightShadows','numDirLightShadows','numPointLightShadows','numSpotLightShadows','numSpotLightShadowsWithMaps','numLightProbes','shadowMapType','toneMapping','numClippingPlanes','numClipIntersection','depthPacking']
A = {0:'instancing',1:'instancingColor',2:'instancingMorph',3:'matcap',4:'envMap',5:'normalMapObjectSpace',6:'normalMapTangentSpace',7:'clearcoat',8:'iridescence',9:'alphaTest',10:'vertexColors',11:'vertexAlphas',12:'vertexUv1s',13:'vertexUv2s',14:'vertexUv3s',15:'vertexTangents',16:'anisotropy',17:'alphaHash',18:'batching',19:'dispersion',20:'batchingColor',21:'gradientMap',22:'packedNormalMap',23:'vertexNormals',24:'retroreflection',25:'diffuseRoughness'}
B = {0:'fog',1:'useFog',2:'flatShading',3:'logDepth',4:'reversedDepth',5:'skinning',6:'morphTargets',7:'morphNormals',8:'morphColors',9:'premultipliedAlpha',10:'shadowMapEnabled',11:'doubleSided',12:'flipSided',13:'useDepthPacking',14:'dithering',15:'transmission',16:'sheen',17:'opaque',18:'pointsUvs',19:'decodeVideo',20:'decodeVideoEmissive',21:'alphaToCoverage',22:'lightProbeGrids',23:'hasPosition'}
def parse(k):
    f = k.split(',')
    i = next(i for i, x in enumerate(f) if x in ('highp', 'mediump', 'lowp'))
    head = f[:i]; par = f[i:i + len(P)]; ma, mb = int(f[i + len(P)]), int(f[i + len(P) + 1]); cs = f[i + len(P) + 2]; cust = ','.join(f[i + len(P) + 3:])
    d = {'shader': head[0] if head else '', 'defines': ','.join(head[1:])}
    d.update({P[j]: par[j] for j in range(len(P))})
    for b, n in A.items(): d['A.' + n] = bool(ma >> b & 1)
    for b, n in B.items(): d['B.' + n] = bool(mb >> b & 1)
    d['custom'] = cust[:60]
    return d
J = json.load(open(sys.argv[1])); part = sys.argv[2] if len(sys.argv) > 2 else 'day'; X = J[part]
progs = {p['id']: dict(parse(p['key']), _used=p['used']) for p in X['programs']}
users = collections.defaultdict(collections.Counter)
for m in X['mats']:
    if m['prog'] is not None: users[m['prog']][(m['glb'] or '?') + ':' + (m['mat'] or m['type'])] += 1
byshader = collections.Counter(p['shader'] for p in progs.values())
print(part, 'programs', len(progs), dict(byshader))
glbcnt = collections.Counter()
for pid, u in users.items():
    for g in {k.split(':')[0] for k in u}: glbcnt[g] += 1
print('programs touched per glb:', dict(glbcnt.most_common()))
# 只差一個欄位的 program 組
ids = sorted(progs); pairs = collections.defaultdict(list)
for a, b in itertools.combinations(ids, 2):
    pa, pb = progs[a], progs[b]
    diff = [k for k in pa if not k.startswith('_') and pa[k] != pb[k]]
    if len(diff) == 1: pairs[diff[0]].append((a, b))
for k, v in sorted(pairs.items(), key=lambda kv: -len(kv[1])):
    print('\n== 只差', k, len(v), '組')
    for a, b in v[:14]:
        fa = lambda pid: progs[pid]['shader'] + '#' + str(pid) + '(' + ','.join(list(dict(users[pid]).keys())[:3]) + ('…' if len(users[pid]) > 3 else '') + ')'
        print('  ', progs[a][k], fa(a), '|', progs[b][k], fa(b))
