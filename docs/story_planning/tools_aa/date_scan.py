"""校外約會台詞改完以後整批掃（AA 2026-11-11；BB_325 的上限）：python3 docs/story_planning/tools_aa/date_scan.py <人物id> D01 D02 …
每個地點列：爸媽幾次（上限 2）、12 字以內的短格幾格（下限 4）、可能是舊設定的字、跨地點一模一樣的句子。讀 date_system/lines（含沒動的舊格）。"""
import re,collections,subprocess,sys
who=sys.argv[1]; locs=sys.argv[2:]
out=subprocess.run(['python3','docs/story_planning/tools_aa/date_rewrite.py','list',who]+locs,capture_output=True,text=True).stdout
loc=None; D=collections.defaultdict(list)
for l in out.split('\n'):
    m=re.match(r'=== (D\d+)',l)
    if m: loc=m.group(1); continue
    m=re.match(r'\s*(\d+) (\S+)｜(.*)',l)
    if m: D[loc].append((int(m.group(1)),m.group(2),m.group(3)))
allv=collections.defaultdict(list)
for k,v in D.items():
    par=[(i,t) for i,key,t in v if re.search('我爸|我媽|爸媽',t) and not t.startswith('「')]
    sh=[i for i,key,t in v if not t.startswith('「') and 0<len(re.sub(r'（[^）]*）','',t))<=12]
    old=[(i,t) for i,key,t in v if re.search('早餐店|蛋餅|好貴|問題|不用回答|課本|太貴',t)]
    flag=' ←' if len(par)>2 or len(sh)<4 else ''
    print(k,'爸媽',len(par),'短格',len(sh),flag)
    if len(par)>2:
        for i,t in par: print('    ',i,t)
    for i,t in old: print('    舊字？',i,t)
    for i,key,t in v: allv[t].append((k,i))
for t,w in allv.items():
    if len({x[0] for x in w})>1 and not t.startswith('「') and not t.startswith('（') and len(t)>5: print('重複',t,w)
