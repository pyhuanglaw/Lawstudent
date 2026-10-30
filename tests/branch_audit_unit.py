# 定期唯讀稽核 GitHub 分支（BRANCH-AUDIT-1028；tools/handoff/branch_audit.py）——用暫存的 git repo 演一次，不碰真的 repo、不用網路。
#   使用者 2026-10-28 01:4x：「保留目前四個崗位正在使用的分支、保留尚未整合完成的 WIP 分支、將確認已完成、完全併入主線的舊分支列入清理候選」
#   1  崗位在用（duty.json state on）、RULE_SOURCE：保留，就算整條已經在 main
#   2  WIP 沒整合完（wip.json state WIP）：保留；wip.json 已整合的 WIP 分支照內容判斷
#   3  清理候選：整條是 main 的祖先；挑著合（cherry-pick）進 main；壓成一個 commit 合（squash）進 main
#   4  保留｜main 沒有的內容：有 main 沒有的 commit；後來 main 又改過同一個檔（內容不一樣）＝保守留著；在崗位分支裡的寫出來
#   5  只讀：稽核前後所有分支的 SHA 一樣；--write 只改 branch_audit.json 和 BRANCH_INVENTORY.md 那一節（表的其他部分不動、跑兩次不會重複）
#   6  淺層 clone：不給清單（結束碼 2）
#   7  --due：沒有紀錄、超過 24 小時＝該做了；剛做過＝不用
# 修改前：沒有 tools/handoff/branch_audit.py——FAIL。用法：python3 tests/branch_audit_unit.py
import datetime, importlib.util, json, os, subprocess, sys, tempfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
fails = 0
def check(name, ok, info=''):
    global fails
    print(('PASS ' if ok else 'FAIL ') + name + (('　' + str(info)) if info else ''))
    if not ok:
        fails += 1

P = os.path.join(ROOT, 'tools/handoff/branch_audit.py')
check('0. 有 tools/handoff/branch_audit.py', os.path.exists(P))
if not os.path.exists(P):
    print('FAILED %d' % fails); sys.exit(1)
spec = importlib.util.spec_from_file_location('branch_audit', P); BA = importlib.util.module_from_spec(spec); spec.loader.exec_module(BA)

def sh(cwd, *a):
    r = subprocess.run(list(a), cwd=cwd, capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(' '.join(a) + ': ' + r.stderr)
    return r.stdout.strip()

tmp = tempfile.mkdtemp(prefix='branch_audit_')
bare, w = os.path.join(tmp, 'origin.git'), os.path.join(tmp, 'work')
sh(tmp, 'git', 'init', '-q', '--bare', '-b', 'main', bare)
sh(tmp, 'git', 'clone', '-q', bare, w)
for k, v in [('user.email', 't@t'), ('user.name', 't'), ('commit.gpgsign', 'false')]:
    sh(w, 'git', 'config', k, v)
def put(path, text):
    p = os.path.join(w, path); os.makedirs(os.path.dirname(p) or w, exist_ok=True)
    with open(p, 'w', encoding='utf8') as f: f.write(text)
def commit(msg, **files):
    for p, t in files.items(): put(p.replace('__', '/').replace('/md', '.md').replace('/txt', '.txt'), t)
    sh(w, 'git', 'add', '-A'); sh(w, 'git', 'commit', '-q', '-m', msg)
    return sh(w, 'git', 'rev-parse', 'HEAD')
def br(name, base='main'):
    sh(w, 'git', 'checkout', '-q', '-B', name, base)

commit('init', a__txt='a\n', docs__handoff__BRANCH_INVENTORY__md='# 盤點\n\n> 說明\n\n| 分支 | 最後 commit |\n|---|---|\n| `main` | x |\n')
br('old-merged'); commit('old work', b__txt='b\n')
br('main'); sh(w, 'git', 'merge', '-q', '--no-ff', '-m', 'merge old', 'old-merged')
br('picked'); pk = commit('picked work', c__txt='c\n')
br('main'); sh(w, 'git', 'cherry-pick', pk)
br('squashed'); commit('s1', d__txt='d1\n'); commit('s2', d__txt='d2\n', e__txt='e\n')
br('main'); sh(w, 'git', 'merge', '-q', '--squash', 'squashed'); sh(w, 'git', 'commit', '-q', '-m', 'squash')
br('unmerged'); commit('new stuff', f__txt='f\n')
br('superseded'); commit('v1 of g', g__txt='g1\n')
br('main'); commit('cherry v1 then v2', g__txt='g2\n')
br('active'); commit('active work', h__txt='h\n')
br('active-merged', 'main')   # 崗位在用、整條在 main
br('wipb'); commit('wip work', i__txt='i\n')
br('wip-done', 'main')        # WIP 已整合（照內容判斷）
br('inside', 'active~1') if False else None
br('in-active', 'main'); commit('planning doc', p__txt='p\n')
br('active'); sh(w, 'git', 'merge', '-q', '--no-ff', '-m', 'take planning', 'in-active')
br('main')
duty = {'ruleSource': {'branch': 'active'}, 'roles': {'LAWWW': {'account': 'C', 'branch': 'active', 'state': 'on'}, 'AA': {'account': 'C', 'branch': 'active-merged', 'state': 'on'},
        'BB': {'account': 'B', 'branch': 'old-merged', 'state': 'off'}}, 'history': [{'account': 'B', 'roles': {'BB': {'branch': 'old-merged'}}}]}
wip = {'items': [{'id': 'WIP-1', 'branch': 'wipb（wip_backup/x.bundle）', 'state': 'WIP'}, {'id': 'WIP-2', 'branch': 'wip-done', 'state': '已整合'}]}
put('docs/handoff/duty.json', json.dumps(duty, ensure_ascii=False)); put('docs/handoff/wip.json', json.dumps(wip, ensure_ascii=False))
commit('records')
for b in ['main', 'old-merged', 'picked', 'squashed', 'unmerged', 'superseded', 'active', 'active-merged', 'wipb', 'wip-done', 'in-active']:
    sh(w, 'git', 'push', '-q', 'origin', f'{b}:{b}')
sh(w, 'git', 'fetch', '-q', 'origin')
before = sh(w, 'git', 'for-each-ref', '--format=%(refname) %(objectname)', 'refs/remotes/origin')

res = BA.audit(w, fetch=True)
K = {r['branch']: r['kind'] for r in res['branches']}
check('1. 崗位在用、RULE_SOURCE：保留（整條在 main 的 active-merged 也保留）', K.get('active') == '保留｜崗位在用' and K.get('active-merged') == '保留｜崗位在用', K)
check('2. WIP 沒整合完（wip.json WIP，分支名後面接括號也認得）：保留', K.get('wipb') == '保留｜WIP 沒整合完', K.get('wipb'))
check('2. WIP 已整合：照內容判斷（整條在 main＝清理候選）', K.get('wip-done') == '清理候選', K.get('wip-done'))
check('3. 清理候選：整條是 main 的祖先（休班帳號交班過的也算，寫誰的）', K.get('old-merged') == '清理候選' and 'BB-B（交班過）' in next(r['who'] for r in res['branches'] if r['branch'] == 'old-merged'), K.get('old-merged'))
check('3. 清理候選：挑著合進 main（cherry-pick）', K.get('picked') == '清理候選', K.get('picked'))
check('3. 清理候選：壓成一個 commit 合進 main（squash）', K.get('squashed') == '清理候選', K.get('squashed'))
check('3. 清理候選都有還原指令（git push origin <SHA>:refs/heads/<分支>）', all(r.get('restore', '').startswith('git push origin ') and r['restore'].endswith(':refs/heads/' + r['branch']) for r in res['branches'] if r['kind'] == '清理候選'))
check('4. 有 main 沒有的 commit：保留', K.get('unmerged') == '保留｜main 沒有的內容', K.get('unmerged'))
check('4. 後來 main 又改過同一個檔（內容不一樣）：保守留著', K.get('superseded') == '保留｜main 沒有的內容', K.get('superseded'))
ins = next(r for r in res['branches'] if r['branch'] == 'in-active')
check('4. 內容在崗位分支裡（還沒到 main）：保留，並寫出在哪一條', ins['kind'] == '保留｜main 沒有的內容' and ins.get('inside') == ['active'], ins)
check('4. main 本身：保留｜主線', K.get('main') == '保留｜主線')
after = sh(w, 'git', 'for-each-ref', '--format=%(refname) %(objectname)', 'refs/remotes/origin')
check('5. 只讀：稽核前後遠端分支的 SHA 一樣', before == after)
inv = os.path.join(w, 'docs/handoff/BRANCH_INVENTORY.md')
BA.write(w, res); s1 = open(inv, encoding='utf8').read(); BA.write(w, res); s2 = open(inv, encoding='utf8').read()
check('5. --write：BRANCH_INVENTORY.md 加一節、原本的表還在、跑兩次不會重複', s1 == s2 and s1.count(BA.BEGIN) == 1 and '| `main` | x |' in s1 and '清理候選' in s1 and s1.index(BA.BEGIN) < s1.index('| 分支 | 最後 commit |'))
st = json.load(open(os.path.join(w, BA.STATE), encoding='utf8'))
check('5. --write：branch_audit.json 有時間、各類數量', st.get('at') == res['at'] and st['counts'].get('清理候選') == 4, st.get('counts'))
check('5. git status 只多 branch_audit.json、改 BRANCH_INVENTORY.md', sorted(l.split(None, 1)[1] for l in sh(w, 'git', 'status', '--porcelain').splitlines()) == ['docs/handoff/BRANCH_INVENTORY.md', 'docs/handoff/branch_audit.json'], sh(w, 'git', 'status', '--porcelain'))

sh_dir = os.path.join(tmp, 'shallow')
sh(tmp, 'git', 'clone', '-q', '--depth', '1', '--no-single-branch', 'file://' + bare, sh_dir)
rc = BA.main(['--root', sh_dir, '--no-fetch'])
check('6. 淺層 clone：不給清單、結束碼 2', rc == 2, rc)

now = datetime.datetime.now(datetime.timezone.utc)
d0, m0 = BA.due(os.path.join(tmp, 'nothing'))
d1, _ = BA.due(w, now=now)
d2, m2 = BA.due(w, now=now + datetime.timedelta(hours=25))
check('7. --due：沒有紀錄＝該做了；剛做過＝不用；25 小時後＝該做了', d0 and not d1 and d2, [m0, m2])
print('FAILED %d' % fails if fails else 'ALL PASS'); sys.exit(1 if fails else 0)
