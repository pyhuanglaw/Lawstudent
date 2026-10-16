# -*- coding: utf-8 -*-
"""BB_128 2-8、5-1（D13 淡水，md 表格）→ D13.json（和 D01.json 同一個格式）。只做格式轉換，台詞一字不改。BB-B 2026-10-16。"""
import re, json, glob, os, sys
HERE=os.path.dirname(os.path.abspath(__file__))
md=open(glob.glob(os.path.join(HERE,'..','..','BB_128_*.md'))[0],encoding='utf-8').read().split('\n')
NAME={'林芷若':'heroine_02','高子晴':'heroine_04','溫書瑀':'heroine_05','郭沛珊':'classmate_peishan','杜可昕':'kexin','沈以安':'heroine_01','陳語彤':'heroine_03'}
PT={'飲料攤':'D13.drink','河邊欄杆':'D13.rail','長椅':'D13.bench','拍照位置':'D13.photo'}
LIKE={'喜歡':'like','普通':'normal','不太喜歡':'dislike'}
TIER={'都可':'any','低':'low','中':'mid','高':'high','交往':'dating'}
def lines_of(text, who):
    out=[]; pos=0
    for m in re.finditer(r'「(.*?)」|（([^（）]*)）', text):
        if m.group(1) is not None: out.append({'who':who,'text':m.group(1)})
        else:
            t=m.group(2)
            if t.startswith('記 ') or t.startswith('C') or '`' in t: out.append({'who':'note','text':t})
            else: out.append({'who':'narr','text':t})
    return out
def sets_of(cell, who):
    cell=cell.strip()
    if '→ 選項：' in cell:
        head, opts = cell.split('→ 選項：',1)
        st={'tier':'any','lines':lines_of(head,who),'choice':[]}
        for o in opts.split('／'):
            if '→' not in o: continue
            a,b=o.split('→',1)
            st['choice'].append({'t':a.strip(),'reply':lines_of(b,who)})
        return [st]
    out=[]
    for part in cell.split('／'):
        m=re.match(r'\s*〔(.*?)〕(.*)',part)
        tier,body=(TIER.get(m.group(1),m.group(1)),m.group(2)) if m else ('any',part)
        L=lines_of(body,who)
        if not L and body.strip(): L=[{'who':'narr','text':body.strip()}]
        out.append({'tier':tier,'lines':L})
    return out
def cat_key(c):
    if c.startswith('第一次'):
        return 'firstHigh' if ('第 6 階' in c or '交往' in c) else 'first'
    return {'普通':'normal','記得上次':'remember','交往':'dating','普通（交往）':'normal','分開以後':'afterBreakup'}.get(c, 'extra:'+c)
res={'loc':'D13','points':{v:k for k,v in PT.items()},'likes':{},'dislikeLine':{},'lines':{},'source':'BB_128 2-8、5-1（md 轉換）'}
who=None; sec=None
for ln in md:
    m=re.match(r'####\s*(\S+?)（(.*)）\s*$',ln)
    if m and m.group(1) in NAME:
        who=NAME[m.group(1)]; res['lines'][who]={'arrive':{},'closing':{},'hotspots':{}}; res['likes'][who]={}
        likes=re.search(r'飲料攤[^；）]*',m.group(2)).group(0)
        for kv in likes.split('、'):
            kv=kv.strip()
            for nm,pid in PT.items():
                if kv.startswith(nm):
                    rest=kv[len(nm):].strip()
                    res['likes'][who][pid]=LIKE.get(rest.split('（')[0].strip(),rest)
        sec=None; continue
    if ln.startswith('## ') or ln.startswith('### '):
        if not ln.startswith('### 2-8') and not ln.startswith('### 5-1'): who=None
        continue
    if who is None: continue
    m=re.match(r'\*\*(\S+?)\*\*（`(D13\.\w+)`',ln)
    if m: sec=m.group(2); res['lines'][who]['hotspots'][sec]={}; continue
    if not ln.startswith('|') or '---' in ln: continue
    cells=[c.strip() for c in ln.strip().strip('|').split('|')]
    if cells[0] in ('段落','類別'): continue
    if len(cells)==3 and cells[0] in ('抵達','收尾'):
        tgt=res['lines'][who]['arrive' if cells[0]=='抵達' else 'closing']; k=cat_key(cells[1]); s=sets_of(cells[2],who)
    elif len(cells)==3 and cells[0] in PT:
        hs=res['lines'][who]['hotspots'].setdefault(PT[cells[0]],{})
        if cells[1] in ('記得上次／交往','記得上次／分開以後'):
            sep='／交往：' if '交往' in cells[1] else '／分開以後：'
            a,b=cells[2].split(sep,1)
            hs['remember']=sets_of(a,who)[0]; hs.setdefault('dating' if '交往' in cells[1] else 'afterBreakup',[]).extend(sets_of(b,who)); continue
        if cells[1]=='普通（交往）':
            hs.setdefault('normal',[]).extend(sets_of(cells[2],who)); hs.setdefault('dating',[]).extend(sets_of(cells[2],who)); continue
        txt=cells[2]
        if '　合照' in txt:
            txt,extra=txt.split('　合照',1); hs.setdefault('extra:合照',[]).extend(sets_of(extra,who))
        tgt=hs; k=cat_key(cells[1]); s=sets_of(txt,who)
    elif len(cells)==2 and sec:
        tgt=res['lines'][who]['hotspots'][sec]; k=cat_key(cells[0]); s=sets_of(cells[1],who)
    else: continue
    if k in ('normal','dating') or k.startswith('extra'): tgt.setdefault(k,[]).extend(s)
    else: tgt[k]=s[0] if len(s)==1 else s
for w in NAME.values():
    if w not in res['lines']: print('缺',w)
    else:
        hs=res['lines'][w]['hotspots']
        print(w, {p:sorted(hs[p].keys()) for p in hs}, res['likes'][w])
DIS={'heroine_04':{'D13.bench':'坐著？欸不是，才剛到。'},'heroine_05':{'D13.drink':'我有帶保溫瓶。……好，買一杯。重點是，不要甜的。'},'classmate_peishan':{'D13.photo':'我不太會拍照。……不是叫你不要拍，是手不知道放哪裡。'}}
for w,d in DIS.items(): res['dislikeLine'][w]=d
res['_note']='kexin 的 normal＝交往中的版本（她開場是女友），afterBreakup＝分開以後；heroine_03（語彤）第一次單獨來淡水是她的心願事件（AA_127），這裡沒有 first；extra:合照＝第 6 階以上或交往才有的合照句；who:note＝給開發的註記（不顯示）。'
json.dump(res,open(os.path.join(HERE,'D13.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
