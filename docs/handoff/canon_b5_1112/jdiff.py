import json,subprocess,sys
d=json.load(open('docs/handoff/story_import_allow.json'))
T='6dbfe10d7e'
def show(sha,p):
    r=subprocess.run(['git','show',f'{sha}:{p}'],capture_output=True,text=True)
    return r.stdout if r.returncode==0 else None
def leaves(x,p,o):
    if isinstance(x,dict):
        for k,v in x.items(): leaves(v,p+'/'+str(k),o)
    elif isinstance(x,list):
        for i,v in enumerate(x): leaves(v,p+'/'+str(i),o)
    else: o[p]=x
only=sys.argv[1:]
for e in d['files']:
    p=e['path']
    if not p.endswith('.json'): continue
    if only and not any(s in p for s in only): continue
    a=show(e['sha'],p); b=show(T,p)
    if a is None or b is None or a==b: continue
    try:
        A={};B={}; leaves(json.loads(a),'',A); leaves(json.loads(b),'',B)
    except Exception as ex:
        print('ERR',p,ex); continue
    diff=[k for k in set(A)|set(B) if A.get(k)!=B.get(k) and not k.startswith('/_meta')]
    print(f'## {p} ({e["sha"]}) {len(diff)} cells')
    for k in sorted(diff)[:int(__import__("os").environ.get("N","6"))]:
        print('  ',k,'|',str(A.get(k))[:80],'=>',str(B.get(k))[:80])
