"""從 q/Q.txt 整理 v9.6 的回歸結果，寫成發布紀錄的一段。用法：python3 collect_results.py > results.txt
LAST＝候選 13、14（發布的是候選 14；兩者遊戲程式相同）；FINAL＝候選 9～12（遊戲程式相同；和候選 13 只差座位的「坐下」範圍——5 棟新建築 29 個座位——和測試用的 E.simWalk）；
EARLIER＝候選 4～8（和候選 9～12 只差 src/assets3d.js 的兩行：共同教學館、大一女舍的正式外觀）"""
import re
S='/tmp/claude-0/-home-user-Lawstudent/a98cd672-cd93-5881-9adc-d5e86cb59d66/scratchpad'
LAST={'ba435d5':'候選 13','4ba8c8b':'候選 14'}   # 候選 14＝候選 13＋只改 tests/flow_classes.py（遊戲程式相同）
FINAL={'781e292':'候選 9','2f138a5':'候選 10','f87f71b':'候選 11','a9c2b69':'候選 12'}
EARLIER={'1c62e0a':'候選 4','709eb53':'候選 5','83ff81b':'候選 6','e2c4f10':'候選 7','6c2d6e9':'候選 8'}
last={}; fin={}; ear={}
for line in open(S+'/q/Q.txt',encoding='utf8',errors='replace'):
    m=re.match(r'(\S+) rc=(\d+) \((\d+)s\) @(\w+) ?(.*)',line.strip())
    if not m: continue
    name,rc,sec,sha,rest=m.groups()
    if name.startswith(('diag_','setff')): continue   # 診斷腳本、切換版本，不是測試
    if sha in LAST: last[name]=(int(rc),int(sec),sha,rest)
    elif sha in FINAL: fin[name]=(int(rc),int(sec),sha,rest)
    elif sha in EARLIER: ear[name]=(int(rc),int(sec),sha,rest)
print('**發布的版本（候選 14；遊戲程式和候選 13 相同，只差 flow_classes 測試）上跑的**（最後一次的結果為準）：')
for n,v in sorted(last.items(), key=lambda kv:(kv[1][0]!=0, kv[0])):
    tag=LAST[v[2]]
    if v[0]==0: print(f'- `{n}`：ALL PASS（{tag} `{v[2]}`，{v[1]} 秒）')
    else: print(f'- `{n}`：**失敗** rc={v[0]}（{tag} `{v[2]}`）{v[3][:200]}')
fin={n:v for n,v in fin.items() if n not in last}
print('\n**只在候選 9～12 上跑的**（遊戲程式和候選 13 只差座位的「坐下」範圍——5 棟新建築：法圖、社科院圖書館、共同、博雅、普通——和測試用的 E.simWalk；這些測試不經過那些座位）：')
for n,v in sorted(fin.items(), key=lambda kv:(kv[1][0]!=0, kv[0])):
    tag=FINAL[v[2]]
    if v[0]==0: print(f'- `{n}`：ALL PASS（{tag} `{v[2]}`，{v[1]} 秒）')
    else: print(f'- `{n}`：**失敗** rc={v[0]}（{tag} `{v[2]}`）{v[3][:200]}')
rest=[(n,v) for n,v in ear.items() if n not in fin and n not in last]
if rest:
    print('\n**只在候選 4～8 上跑過的**（和最後的候選只差共同教學館、大一女舍的外觀兩行）：')
    for n,v in sorted(rest):
        tag=EARLIER[v[2]]
        if v[0]==0: print(f'- `{n}`：ALL PASS（{tag} `{v[2]}`，{v[1]} 秒）')
        else: print(f'- `{n}`：rc={v[0]}（{tag} `{v[2]}`）{v[3][:200]}')

# LAWWW2 的機器上跑的（它回報的結果，LAWWW 照它的訊息抄進 q/lawww2_results.txt，同一個格式：名稱 rc=N (秒s) @SHA 說明）
import os
lp=S+'/q/lawww2_results.txt'
if os.path.exists(lp):
    rows=[re.match(r'(\S+) rc=(\d+) \((\d+)s\) @(\w+) ?(.*)',l.strip()) for l in open(lp,encoding='utf8') if l.strip() and not l.startswith('#')]
    rows=[m.groups() for m in rows if m]
    if rows:
        print('\n**LAWWW2 的機器上跑的**（乾淨 worktree，從 `wip_backup` 的 bundle 取出候選；它回報的結果）：')
        for name,rc,sec,sha,rest in rows:
            tag=LAST.get(sha) or FINAL.get(sha) or sha
            print(f'- `{name}`：' + (f'ALL PASS（{tag} `{sha}`，{sec} 秒）' if rc=='0' else f'**失敗** rc={rc}（{tag} `{sha}`）{rest[:200]}'))
