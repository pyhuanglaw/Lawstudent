"""校外約會台詞改完以後整批掃（AA 2026-11-11；BB_325、BB_326 的上限）：
  python3 docs/story_planning/tools_aa/date_scan.py <人物id> D01 D02 … [--old '保溫瓶|論文|研究室']
每個地點列：爸媽幾次（上限 2）、12 字以內的短格幾格（下限 4）、兩句一格的比例（BB_326：一半上下，太高會變固定節拍）、「今天」幾格、可能是舊設定的字（--old 自己給；不給＝沛珊那一組）。
最後列跨地點一模一樣的句子、整批的每格句數分布、「上次」開頭、收尾講「明天」幾處（整份稿三處以內）。讀 date_system/lines（含沒動的舊格）。"""
import re,collections,subprocess,sys
a=sys.argv[1:]; old='早餐店|蛋餅|好貴|問題|不用回答|課本|太貴'
if '--old' in a: i=a.index('--old'); old=a[i+1]; a=a[:i]+a[i+2:]
who=a[0]; locs=a[1:]
out=subprocess.run(['python3','docs/story_planning/tools_aa/date_rewrite.py','list',who]+locs,capture_output=True,text=True).stdout
loc=None; D=collections.defaultdict(list)
for l in out.split('\n'):
    m=re.match(r'=== (D\d+)',l)
    if m: loc=m.group(1); continue
    m=re.match(r'\s*(\d+) (\S+)｜(.*)',l)
    if m: D[loc].append((int(m.group(1)),m.group(2),m.group(3)))
strip=lambda t: re.sub(r'（[^）]*）','',t).strip()
nsent=lambda t: len([c for c in re.split(r'[。！？]',strip(t)) if c.strip()])
allv=collections.defaultdict(list); tot=collections.Counter(); up=0; tom=0
for k,v in D.items():
    hers=[(i,key,t) for i,key,t in v if not t.startswith('「') and strip(t)]
    par=[(i,t) for i,key,t in hers if re.search('我爸|我媽|爸媽',t)]
    sh=[i for i,key,t in hers if len(strip(t))<=12]
    two=sum(1 for i,key,t in hers if nsent(t)==2)
    oldh=[(i,t) for i,key,t in v if re.search(old,t)]
    today=sum(1 for i,key,t in hers if '今天' in t)
    flag=' ←' if len(par)>2 or len(sh)<4 else ''
    print(k,'爸媽',len(par),'短格',len(sh),'兩句格',f'{round(100*two/max(1,len(hers)))}%','今天',today,flag)
    if len(par)>2:
        for i,t in par: print('    ',i,t)
    for i,t in oldh: print('    舊字？',i,t)
    for i,key,t in hers:
        tot[nsent(t)]+=1; up+=strip(t).startswith('上次'); tom+=('closing' in key and '明天' in t)
    for i,key,t in v: allv[t].append((k,i))
for t,w in allv.items():
    if len({x[0] for x in w})>1 and not t.startswith('「') and not t.startswith('（') and len(t)>5: print('重複',t,w)
n=sum(tot.values())
print('整批：',n,'格；每格句數',dict(sorted(tot.items())),'；兩句格',f'{round(100*tot[2]/max(1,n))}%','；「上次」開頭',up,'；收尾講明天',tom)
