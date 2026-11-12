import json,subprocess,sys,collections
A_SHA=sys.argv[1]; B_SHA=sys.argv[2]
def show(sha,p):
    r=subprocess.run(['git','show',f'{sha}:{p}'],capture_output=True,text=True)
    return r.stdout if r.returncode==0 else None
def leaves(x,p,o):
    if isinstance(x,dict):
        for k,v in x.items(): leaves(v,p+'/'+str(k),o)
    elif isinstance(x,list):
        for i,v in enumerate(x): leaves(v,p+'/'+str(i),o)
    else: o[p]=x
cnt=collections.Counter(); out=[]
for i in range(1,34):
    p=f'docs/story_planning/date_system/lines/D{i:02d}.json'
    a=json.loads(show(A_SHA,p)); b=json.loads(show(B_SHA,p))
    A={};B={}; leaves(a,'',A); leaves(b,'',B)
    for k in sorted(set(A)|set(B)):
        if A.get(k)!=B.get(k) and not k.startswith('/_meta'):
            who=k.split('/')[2] if k.startswith('/lines/') else '?'
            cnt[who]+=1
            out.append((f'D{i:02d}',k,A.get(k),B.get(k)))
print(cnt)
for o in out:
    if len(sys.argv)>3 and sys.argv[3] not in o[1]: continue
    print(o[0],o[1],'|',o[2],'=>',o[3])
