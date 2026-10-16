import subprocess, json, sys, collections
def g(*a): return subprocess.run(['git','-c','core.quotepath=false']+list(a),capture_output=True,text=True).stdout
refs=[r.strip() for r in g('branch','-r').splitlines() if 'HEAD' not in r]
durable=[r for r in refs if 'second-ai-env-art-wip-' not in r]
DEV='origin/claude/modest-rubin-2lyp7g'
# 每個 durable 分支歷史裡出現過的 (path, blob) 集合：只看 WIP 動過的路徑，用 git log --raw 收集
res={}
for w in sys.argv[1:]:
    W='origin/claude/second-ai-env-art-wip-'+w
    fork=g('merge-base',W,DEV).strip()
    files=[l for l in g('diff','--name-status',fork,W).splitlines() if l]
    items=[]
    for l in files:
        st,*ps=l.split('\t'); p=ps[-1]
        blob=g('rev-parse',f'{W}:{p}').strip() if st[0]!='D' else None
        tips={}
        for d in durable:
            b=g('rev-parse','-q','--verify',f'{d}:{p}').strip()
            tips[d.split('/')[-1]]=b
        same_tip=[k for k,v in tips.items() if v and v==blob]
        items.append(dict(st=st,path=p,blob=blob,same_tip=same_tip))
    res[w]=dict(head=g('rev-parse',W).strip(),fork=fork,date=g('log','-1','--format=%ci',W).strip(),items=items)
# 歷史：把 durable 分支所有 commit 動過這些路徑的 blob 收起來
paths=sorted({it['path'] for r in res.values() for it in r['items'] if it['blob'] and not it['same_tip']})
hist=collections.defaultdict(set)
if paths:
    chunk=200
    for i in range(0,len(paths),chunk):
        out=g('log','--format=','--raw','--no-abbrev','--no-renames',*durable,'--',*paths[i:i+chunk])
        for l in out.splitlines():
            if l.startswith(':'):
                meta,p=l.split('\t',1); f=meta.split(); hist[p].add(f[3])
for w,r in res.items():
    for it in r['items']:
        it['in_history']=bool(it['blob'] and it['blob'] in hist.get(it['path'],()))
json.dump(res,open(sys.argv[0].replace('audit.py','audit.json'),'w'),ensure_ascii=False,indent=0)
for w,r in res.items():
    c=collections.Counter()
    for it in r['items']:
        if it['st'][0]=='D': c['deleted_in_wip']+=1
        elif it['same_tip']: c['same_as_some_tip']+=1
        elif it['in_history']: c['in_durable_history_only']+=1
        else: c['NOT_IN_ANY_DURABLE']+=1
    print(w, r['head'][:8], r['date'][:16], 'fork', r['fork'][:8], 'files', len(r['items']), dict(c))
