# 從某個函式（名字:行）往下的呼叫樹，含子呼叫時間（合併同一個 callFrame）
import json, sys, collections
p = json.load(open(sys.argv[1])); root_key = sys.argv[2]; depth = int(sys.argv[3]) if len(sys.argv) > 3 else 3; minms = float(sys.argv[4]) if len(sys.argv) > 4 else 20
nodes = {n['id']: n for n in p['nodes']}; dt = p['timeDeltas']
selft = collections.Counter()
for s, d in zip(p['samples'], dt[1:] + [0]): selft[s] += d
def key(n): cf = n['callFrame']; return '%s %s:%d' % (cf['functionName'] or '(anon)', cf['url'].split('/')[-1].split('?')[0], cf['lineNumber'] + 1)
incl = {}
def tot(nid):
    if nid in incl: return incl[nid]
    t = selft[nid] + sum(tot(c) for c in nodes[nid].get('children', [])); incl[nid] = t; return t
sys.setrecursionlimit(100000)
for nid in nodes: tot(nid)
starts = [nid for nid, n in nodes.items() if key(n) == root_key]
# 把 starts 底下合併成樹（以 key 路徑合併）
def merge(nids, d, prefix):
    if d > depth: return
    agg = collections.defaultdict(list)
    for nid in nids:
        for c in nodes[nid].get('children', []): agg[key(nodes[c])].append(c)
    items = sorted(((sum(incl[c] for c in cs), k, cs) for k, cs in agg.items()), reverse=True)
    for t, k, cs in items:
        if t / 1e3 < minms: continue
        print('%s%7.1f ms  %s' % (prefix, t / 1e3, k)); merge(cs, d + 1, prefix + '   ')
print('%7.1f ms  %s（%d 個節點）' % (sum(incl[s] for s in starts) / 1e3, root_key, len(starts))); merge(starts, 1, '   ')
