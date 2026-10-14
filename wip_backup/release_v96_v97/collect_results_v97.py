"""從 q/Q.txt＋q/lawww2_results_v97.txt 整理 v9.7 的回歸結果，寫成發布紀錄的一段。用法：python3 collect_results_v97.py > v97_results.txt
v9.7 候選 1～4 遊戲程式相同（候選 2～4 只改測試：flow_classes、playlib 的 go_to／讀檔、flow_typhoon）；候選 5 以後加在 RCS。"""
import re, os
S='/tmp/claude-0/-home-user-Lawstudent/a98cd672-cd93-5881-9adc-d5e86cb59d66/scratchpad'
RCS={'5adef66':'候選 1','06f2b64':'候選 2','8ac75f6':'候選 3','6ad0923':'候選 4','37a5db2':'候選 5','7c5d4c2':'候選 6'}
PAT=r'(\S+) rc=(\d+) \((\d+)s\) @(\w+) ?(.*)'
mine={}
for line in open(S+'/q/Q.txt',encoding='utf8',errors='replace'):
    m=re.match(PAT,line.strip())
    if not m: continue
    name,rc,sec,sha,rest=m.groups()
    if name.startswith(('diag_','setff')) or sha not in RCS: continue
    mine[re.sub(r'_v97b?$','',name)]=(int(rc),int(sec),sha,rest)
lp=S+'/q/lawww2_results_v97.txt'; theirs={}
if os.path.exists(lp):
    for l in open(lp,encoding='utf8'):
        m=re.match(PAT,l.strip())
        if m and not l.startswith('#'):
            name,rc,sec,sha,rest=m.groups(); theirs[re.sub(r'_v97b?$','',name)]=(int(rc),int(sec),sha,rest)
def show(d):
    for n,v in sorted(d.items(), key=lambda kv:(kv[1][0]!=0, kv[0])):
        tag=RCS.get(v[2],v[2])
        print(f'- `{n}`：' + (f'ALL PASS（{tag} `{v[2]}`，{v[1]} 秒）' if v[0]==0 else f'**失敗** rc={v[0]}（{tag} `{v[2]}`）{v[3][:200]}'))
print('**LAWWW 的機器上跑的**（候選 1～4 遊戲程式相同；候選 5 只多了 Café 店員的兩處：engine3d.js nearestInteractable、story3d.js 店員；同一項跑過好幾次的以最後一次為準）：')
show({n:v for n,v in mine.items()})
if theirs:
    print('\n**LAWWW2 的機器上跑的**（乾淨 worktree，從 `wip_backup` 的 bundle 取出候選；它回報的結果）：')
    show(theirs)
bad=[n for n,v in list(mine.items())+list(theirs.items()) if v[0]!=0]
import sys; print(('\n# 失敗：'+'、'.join(bad)) if bad else '\n# 沒有失敗', file=sys.stderr)
