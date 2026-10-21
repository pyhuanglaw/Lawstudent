import json,collections,re,sys,os,glob
os.chdir('/home/user/Lawstudent/docs/story_planning/date_system/lines')
locs=sorted(os.path.basename(f)[:-5] for f in glob.glob('D[0-9][0-9].json'))
seen=collections.defaultdict(list); rem=[]
def walk(o,path):
    if isinstance(o,dict):
        if 'who' in o and 'text' in o: yield path,o['who'],o['text']; return
        for k,v in o.items(): yield from walk(v,path+'/'+k)
    elif isinstance(o,list):
        for i,v in enumerate(o): yield from walk(v,path)
for L in locs:
    d=json.load(open(L+'.json',encoding='utf-8'))
    for who,blk in d['lines'].items():
        for path,w,t in walk(blk,''):
            if w in ('narr','note'): continue
            if len(re.sub(r'[……。，！？、\s]','',t))>=5: seen[(who,t)].append(L)
        for pid,h in (blk.get('hotspots') or {}).items():
            r=h.get('remember'); f=h.get('first') or {}
            ch=f.get('choice') if isinstance(f,dict) else None
            if r and ch:
                rs=r if isinstance(r,list) else [r]
                rt=' '.join(x['text'] for st in rs for x in (st.get('lines',[]) if isinstance(st,dict) else []))
                if re.search(r'上次你說|你上次說|上次你選|你說要|你說過|上次你問|你上次問|上次你答',rt): rem.append((L,who,pid,rt))
dup=[(k,sorted(set(v))) for k,v in seen.items() if len(set(v))>1]
print('locations',len(locs),'dups',len(dup),'remember-choice',len(rem))
if '-v' in sys.argv:
    for (who,t),v in sorted(dup,key=lambda x:-len(x[1])): print('D',who,v,t)
    for x in rem: print('R',*x)
