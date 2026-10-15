"""v9.7 發布後：寫進 docs/RELEASES.md、CLAUDE.md（開發分支）。
用法：python3 finish_release_v97.py REPO MAIN_SHA 'YYYY-MM-DD HH:MM:SS' PAGES_N RESULTS_FILE 候選名稱 [LATER_RC 說明（候選 5 以後），沒有就給空字串]"""
import sys, re, datetime
repo, sha, dt, pn, resf, RC = sys.argv[1:7]; LATER = sys.argv[7] if len(sys.argv) > 7 else ''
S='/tmp/claude-0/-home-user-Lawstudent/a98cd672-cd93-5881-9adc-d5e86cb59d66/scratchpad'
PREV='e88bda5'
entry=open(S+'/rel_v97_entry.md',encoding='utf8').read()
res=open(resf,encoding='utf8').read().strip()
entry=(entry.replace('{DEPLOY_TIME}',dt).replace('{MAIN_SHA}',sha).replace('{PREV_SHA}',PREV).replace('{PAGES_N}',pn)
       .replace('{RESULTS}',res).replace('{LATER_RC}',LATER))
assert '{' not in entry.replace('{{','') or print([l for l in entry.split('\n') if '{' in l])
entry=re.sub(r'<!--.*?-->','',entry,flags=re.S).rstrip()+'\n\n'
p=repo+'/docs/RELEASES.md'; s=open(p,encoding='utf8').read()
row='| v9.6 | `e88bda5`（就是測試過的候選 15 本身） | 2026-10-14 07:46:55 | `a4f2760` |'
assert s.count(row)==1
s=s.replace(row,row+'\n| v9.7 | `%s`（就是測試過的%s 本身） | %s | `%s` |' % (sha, RC, dt, PREV))
t=datetime.datetime.strptime(dt,'%Y-%m-%d %H:%M:%S')+datetime.timedelta(hours=3); tw=t+datetime.timedelta(hours=8)
s,n=re.subn(r'\*\*下一次正式發布最早：[^\n]*',
          '**下一次正式發布最早：%s UTC（台灣 %s）**（三小時規則；緊急回復不受限制）。v9.7 照 D71 不受三小時限制（v9.6 之後 %s 發布）；v9.7 之後的版本照舊相隔三小時。'
          % (t.strftime('%Y-%m-%d %H:%M:%S'), tw.strftime('%m-%d %H:%M:%S'), dt[11:16]), s, count=1)
assert n==1
old_rb='C=$(git commit-tree a4f2760^{tree} -p origin/main -m "緊急回復到 v9.5（a4f2760）")'
assert s.count(old_rb)==1
s=s.replace(old_rb,'C=$(git commit-tree e88bda5^{tree} -p origin/main -m "緊急回復到 v9.6（e88bda5）")')
i=s.index('## v9.6（')
s=s[:i]+entry+s[i:]
open(p,'w',encoding='utf8').write(s)
p=repo+'/CLAUDE.md'; c=open(p,encoding='utf8').read()
old=re.search(r'- 目前版本：\*\*v9\.6 已部署在 `main`[^\n]*',c).group(0)
new=('- 目前版本：**v9.7 已部署在 `main`（%s UTC，`%s`＝測試過的%s 本身；CG 劇情版：大一上 v1 劇情（手機群組、迎新、中秋、颱風假、聖誕、跨年、期末、可昕的遠距線）、事件 CG、每週課堂內容（法律審查通過的週）、睡覺第二版、社團、騎腳踏車；'
     '共同教學館、大一女舍的 Blender 外觀與可昕的 3D 人物還沒放；上一個穩定版 v9.6 `e88bda5`）**，發布紀錄與回復方法在 `docs/RELEASES.md`；之後的開發在開發分支（2026-10-10 起是 `claude/confident-ritchie-8rwh7t`，'
     '由舊分支 `claude/friendly-brahmagupta-6bbkzc` 快轉接續，歷史相同；**每個工作階段以系統指定的分支為準**），驗證完才合併到 `main`（D32；使用者 2026-10-10 授權：測試通過的成熟成果可以自行發布，兩次發布至少相隔三小時，見 RELEASES.md；v9.7 是 D71 的例外）。標題畫面最下面有版本字樣。詳見下方「目前狀態」。') % (dt, sha, RC)
c=c.replace(old,new); open(p,'w',encoding='utf8').write(c)
print('ok', sha, dt, 'next', t)
