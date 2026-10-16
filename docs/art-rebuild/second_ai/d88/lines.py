import json, subprocess, collections
def g(*a): return subprocess.run(['git','-c','core.quotepath=false']+list(a),capture_output=True,text=True,errors='replace').stdout
D='/tmp/claude-0/-home-user-Lawstudent/62ca4225-4c3d-5d85-9e8d-40846d4f390f/scratchpad/d88/'
res=json.load(open(D+'audit.json'))
TIPS=['origin/claude/modest-rubin-2lyp7g','origin/claude/funny-albattani-iawshm','origin/claude/second-ai-env-art','origin/main','origin/claude/confident-ritchie-8rwh7t']
BIN=('.glb','.webp','.png','.jpg','.jpeg','.bundle','.vrm','.blend','.bin','.zip')
out={}
for w,r in res.items():
    W='origin/claude/second-ai-env-art-wip-'+w
    for it in r['items']:
        if it['st'][0]=='D' or it['same_tip'] or it['in_history']: continue
        p=it['path']
        if p.lower().endswith(BIN): out.setdefault(p,{})[w]=['binary',it['blob'][:8]]; continue
        diff=g('diff','-U0',r['fork'],W,'--',p)
        added=[l[1:].strip() for l in diff.splitlines() if l.startswith('+') and not l.startswith('+++') and len(l[1:].strip())>3]
        if not added: out.setdefault(p,{})[w]=['no_added',0,0,[]]; continue
        pool=set()
        for t in TIPS: pool.update(l.strip() for l in g('show',f'{t}:{p}').splitlines())
        miss=[a for a in added if a not in pool]
        out.setdefault(p,{})[w]=['text',len(added),len(miss),miss[:4]]
json.dump(out,open(D+'lines.json','w'),ensure_ascii=False,indent=0)
for p,d in sorted(out.items()):
    for w,v in d.items():
        if v[0]=='text': print(f"TEXT {'MISS' if v[2] else 'OK  '} {p} [{w}] added={v[1]} missing={v[2]}" + (f" e.g. {[m[:70] for m in v[3]]}" if v[2] else ''))
        elif v[0]=='binary': print(f'BIN  {p} [{w}] {v[1]}')
        else: print(f'NOADD {p} [{w}]')
