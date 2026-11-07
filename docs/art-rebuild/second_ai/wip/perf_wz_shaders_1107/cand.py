import json, sys, collections, itertools
sys.path.insert(0, sys.argv[1].rsplit('/',1)[0]); 
exec(open(sys.argv[1].rsplit('/',1)[0]+'/progs.py').read().split("J = json.load")[0])
MINE = {'wenzhou_street_glb','wz_park_glb','wz_props_glb','wz_jphouse_glb','wz_cat_glb','cafe_exterior_glb'}
MODEL_FIELDS = {'B.doubleSided':'單面／雙面','A.alphaTest':'alphaTest（MASK）','A.vertexColors':'頂點色有無','A.vertexAlphas':'頂點色 VEC4→VEC3','emissiveMapUv':'自發光貼圖','B.flipSided':'透明雙面的背面那一輪','mapUv':'底色貼圖','normalMapUv':'法線貼圖','metalnessMapUv':'金屬度貼圖','roughnessMapUv':'粗糙度貼圖','A.normalMapTangentSpace':'法線貼圖'}
for part in ('day','night'):
    X = json.load(open(sys.argv[2]))[part]
    progs = {p['id']: parse(p['key']) for p in X['programs']}
    users = collections.defaultdict(collections.Counter)
    for m in X['mats']:
        if m['prog'] is not None: users[m['prog']][(m['glb'] or '?') + ':' + (m['mat'] or m['type'])] += 1
    print('=====', part, len(progs), 'programs；有人用的', len(users), '；沒人用的（之前編的、深度、天空…）', len(progs) - len(users))
    cnt = collections.Counter()
    for pid,u in users.items():
        gl = {k.split(':')[0] for k in u}
        cnt['只有我的模型' if gl <= MINE else ('有人物' if 'human' in gl else '有其他（? 套件、遊戲做的）')] += 1
    print('  ', dict(cnt))
    for pid in sorted(users):
        gl = {k.split(':')[0] for k in users[pid]}
        if not gl <= MINE: continue
        nb = []
        for q in progs:
            if q == pid or q not in users: continue
            diff = [k for k in progs[pid] if progs[pid][k] != progs[q][k]]
            if len(diff) == 1: nb.append((diff[0], progs[pid][diff[0]], progs[q][diff[0]], q, sorted(users[q])[:2]))
        print('  #%d %s %s' % (pid, progs[pid]['shader'], dict(users[pid])))
        for d in nb: print('       → 改 %s（%s → %s）可以併進 #%d %s' % (MODEL_FIELDS.get(d[0], d[0]), d[1], d[2], d[3], d[4]))
