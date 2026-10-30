import json,sys,glob,re,os
from datetime import date
NM={'heroine_01':'以安','heroine_02':'芷若','heroine_03':'語彤','heroine_04':'子晴','heroine_05':'學姊','classmate_peishan':'沛珊','kexin':'可昕'}
def sisrel(m,frm):
    return frm=='heroine_05' or ('學姊' in m) or ('書瑀' in m)
def ana(fn,verbose=False):
    d=json.load(open(fn)); out={}
    for pid,R in d['runs'].items():
        r=R[0]; days=r['days']; cnt={k:0 for k in NM}; sisdays=[]; lines=[]
        for x in days:
            hit=[]
            for m,f in zip(x['msgs'],x.get('mfrom',[''])*len(x['msgs']) if not x.get('mfrom') else x['mfrom']):
                if f in cnt: cnt[f]+=1
                if f=='heroine_05': hit.append('訊息 '+m)
                elif '學姊' in m.split('：',1)[-1] or '書瑀' in m: hit.append('提到 '+m)
            for e in x['evs']:
                if 'sis' in e: hit.append('事件 '+e)
            for o in x['outs']:
                if '學姊' in o or 'sis' in o: hit.append('出遊 '+o)
            own=[h for h in hit if not h.startswith('提到')]
            if own: sisdays.append(x['key'])
            if hit: lines.append((x['key'],x['wd'],hit))
        # gaps
        keys=[x['key'] for x in days]
        def dd(k): y,m,dd_=map(int,k.split('-')); return date(y,m,dd_)
        pts=[keys[0]]+sisdays+[keys[-1]]
        gaps=[]
        for a,b in zip(pts,pts[1:]):
            g=(dd(b)-dd(a)).days
            gaps.append((g,a,b))
        gaps.sort(reverse=True)
        out[pid]=dict(label=r['label'],errs=len(r['errs']),sisdays=len(sisdays),cnt=cnt,gaps=gaps[:5],lines=lines)
    return out
if __name__=='__main__':
    for fn in sys.argv[1:]:
        o=ana(fn)
        print('=====',os.path.basename(fn))
        for pid,v in o.items():
            print('--',pid,v['label'],'錯誤',v['errs'],'學姊有東西的天數',v['sisdays'])
            print('   各人私訊／群組則數',' '.join(f"{NM[k]}{n}" for k,n in v['cnt'].items()))
            print('   最長空白',[(g,a,b) for g,a,b in v['gaps'][:4]])
