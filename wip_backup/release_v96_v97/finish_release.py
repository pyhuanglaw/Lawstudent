"""發布後：把 v9.6 寫進 docs/RELEASES.md、CLAUDE.md（開發分支）。用法：python3 finish_release.py REPO MAIN_SHA 'YYYY-MM-DD HH:MM:SS' PAGES_N RESULTS_FILE [候選名稱，預設「候選 12」]"""
import sys, re, datetime
repo, sha, dt, pn, resf = sys.argv[1:6]; RC = sys.argv[6] if len(sys.argv) > 6 else '候選 15'
S='/tmp/claude-0/-home-user-Lawstudent/a98cd672-cd93-5881-9adc-d5e86cb59d66/scratchpad'
entry=open(S+'/rel_v96_entry.md',encoding='utf8').read()
res=open(resf,encoding='utf8').read().strip()
entry=entry.replace('{DEPLOY_TIME}',dt).replace('{MAIN_SHA}',sha).replace('{PAGES_N}',pn).replace('{RESULTS}',res).replace('{PTF_RESULT}','這一項排在發布前必跑的後面，發布時還沒跑完；結果補在 docs/ART_REBUILD_PROGRESS.md 的交接。')
entry=re.sub(r'<!--.*?-->','',entry,flags=re.S).rstrip()+'\n\n'
p=repo+'/docs/RELEASES.md'; s=open(p,encoding='utf8').read()
row='| v9.5 | `a4f2760`（就是測試過的候選本身） | 2026-10-13 16:54:06 | `dfd2618` |'
assert s.count(row)==1
s=s.replace(row,row+'\n| v9.6 | `%s`（就是測試過的%s 本身） | %s | `a4f2760` |' % (sha, RC, dt))
t=datetime.datetime.strptime(dt,'%Y-%m-%d %H:%M:%S')+datetime.timedelta(hours=3); tw=t+datetime.timedelta(hours=8)
s=re.sub(r'\*\*下一次正式發布最早：[^*]*\*\*','**下一次正式發布最早：%s UTC（台灣 %s）**' % (t.strftime('%Y-%m-%d %H:%M:%S'), tw.strftime('%m-%d %H:%M:%S')),s,count=1)
s=s.replace('C=$(git commit-tree dfd2618^{tree} -p origin/main -m "緊急回復到 v9.4.2（dfd2618）")','C=$(git commit-tree a4f2760^{tree} -p origin/main -m "緊急回復到 v9.5（a4f2760）")')
i=s.index('## v9.5（')
s=s[:i]+entry+s[i:]
open(p,'w',encoding='utf8').write(s)
p=repo+'/CLAUDE.md'; c=open(p,encoding='utf8').read()
old=re.search(r'- 目前版本：\*\*v9\.5 已部署在 `main`[^\n]*',c).group(0)
new=('- 目前版本：**v9.6 已部署在 `main`（%s UTC，`%s`＝測試過的%s 本身；教學館室內、社科院圖書館、課表與每日上課、手機、快速前往、使用者 10-13 試玩回報的修正；'
     '共同教學館、大一女舍的 Blender 外觀先不放；上一個穩定版 v9.5 `a4f2760`）**，發布紀錄與回復方法在 `docs/RELEASES.md`；之後的開發在開發分支（2026-10-10 起是 `claude/confident-ritchie-8rwh7t`，'
     '由舊分支 `claude/friendly-brahmagupta-6bbkzc` 快轉接續，歷史相同；**每個工作階段以系統指定的分支為準**），驗證完才合併到 `main`（D32；使用者 2026-10-10 授權：測試通過的成熟成果可以自行發布，兩次發布至少相隔三小時，見 RELEASES.md）。標題畫面最下面有版本字樣。詳見下方「目前狀態」。') % (dt, sha, RC)
c=c.replace(old,new); open(p,'w',encoding='utf8').write(c)
print('ok', sha, dt, 'next', t)
