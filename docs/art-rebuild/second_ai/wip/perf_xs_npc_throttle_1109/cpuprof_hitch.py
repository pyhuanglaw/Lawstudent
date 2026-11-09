# 卡頓那幾幀：cpuprofile 裡該時段（at_ms 前 ms 毫秒到 at_ms）各函式的 self 時間＋最長的呼叫路徑
import json, sys, collections
p = json.load(open(sys.argv[1])); H = json.load(open(sys.argv[2]))
hs = H if isinstance(H, list) else (H.get('frames') or H).get('hitches', [])
nodes = {n['id']: n for n in p['nodes']}; parent = {}
for n in p['nodes']:
    for c in n.get('children', []): parent[c] = n['id']
def key(n): cf = n['callFrame']; return '%s %s:%d' % (cf['functionName'] or '(anon)', cf['url'].split('/')[-1].split('?')[0], cf['lineNumber'] + 1)
t = 0; ts = []
for d in p['timeDeltas']: t += d; ts.append(t)
t0 = ts[0]
for h in hs:
    end = h.get('at_ms', h.get('at_s', 0) * 1000); dur = h.get('ms', 100)
    lo, hi = (end - dur) * 1000, end * 1000
    selfc = collections.Counter(); inc = collections.Counter()
    for i, (s, tt) in enumerate(zip(p['samples'], ts)):
        rel = tt - t0
        if lo - 20000 <= rel <= hi + 20000:
            d = p['timeDeltas'][i + 1] if i + 1 < len(p['timeDeltas']) else 0
            selfc[key(nodes[s])] += d; x = s; seen = set()
            while x is not None:
                k = key(nodes[x]); 
                if k not in seen: inc[k] += d; seen.add(k)
                x = parent.get(x)
    print('== 卡頓 at %.0f ms、%s ms：self 前 6' % (end, dur), [(k, round(v / 1e3, 1)) for k, v in selfc.most_common(6)])
    print('   含子呼叫：', [(k, round(v / 1e3, 1)) for k, v in inc.most_common(14) if not k.startswith('(root')][:12])
