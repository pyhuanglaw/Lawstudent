# Chrome cpuprofile：每個函式的 self 時間、含子呼叫的總時間（照 url:行 合併）
import json, sys, collections
p = json.load(open(sys.argv[1])); nodes = {n['id']: n for n in p['nodes']}
# 每個 sample 的時間差
dt = p['timeDeltas']; samples = p['samples']; total_us = sum(dt)
selft = collections.Counter(); 
for s, d in zip(samples, dt[1:] + [0]): selft[s] += d
parent = {}
for n in p['nodes']:
    for c in n.get('children', []): parent[c] = n['id']
def key(n):
    cf = n['callFrame']; u = cf['url'].split('/')[-1]; return '%s %s:%d' % (cf['functionName'] or '(anon)', u, cf['lineNumber'] + 1)
selfk = collections.Counter(); inclk = collections.Counter()
for nid, t in selft.items():
    selfk[key(nodes[nid])] += t
    seen = set(); x = nid
    while x is not None:
        k = key(nodes[x])
        if k not in seen: inclk[k] += t; seen.add(k)
        x = parent.get(x)
print('總時間 %.1f s' % (total_us / 1e6))
print('--- self 前 25'); [print('%7.1f ms  %5.1f%%  %s' % (t / 1e3, 100 * t / total_us, k)) for k, t in selfk.most_common(25)]
print('--- 含子呼叫 前 30'); [print('%7.1f ms  %5.1f%%  %s' % (t / 1e3, 100 * t / total_us, k)) for k, t in inclk.most_common(30)]
