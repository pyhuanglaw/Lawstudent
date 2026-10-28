#!/usr/bin/env python3
"""交接制度效能改善（使用者 2026-10-17 P0）的回歸測試：
  一、兩起真實事故：
    ① roles 假通過：交接檔正文提到「全部待辦」被當成段落標題，讀到 0 行還報 OK（帳號 B 交班時發生）
    ② covered_by 誤判：「covered_by＝沒有登記」被當成已涵蓋，BB 14 筆交付漏登（LAWWW-B 的批次登記腳本）
  二、四職位已核對水位線（watermarks.json）：只核對水位線以後的新 commit；每一個都要有結構化分類（不靠關鍵字）；
     歷史改寫、SHA 不見、分岔要 fail closed；只有全部分類完才能前進水位線
  三、交付當下登記（outbox_<職位>.json）、永久 WIP 索引（wip.json）不能無故消失、劇情匯入白名單
  四、用帳號 B 交班的真實資料跑一次（有 git 時）
  python3 tests/handoff_incremental_unit.py"""
import io, json, os, shutil, subprocess, sys, tempfile
from contextlib import redirect_stdout

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'handoff'))
import check_handoff as H
import incremental as I

fails = 0


def expect(name, cond, out=''):
    global fails
    print(('PASS ' if cond else 'FAIL ') + name)
    if not cond:
        fails += 1
        if out:
            print('    ' + str(out)[:1500].replace('\n', '\n    '))


# ---------- ① roles 假通過 ----------
# 帳號 B 交班時 BB 交接檔的樣子：交班紀錄的條列「- 交接要寫全部待辦（使用者 00:2x）」排在真正的段落前面。
# 舊版 todo_section 找到這一行（條列、含「全部待辦」）就當段落開頭，下一個同層條列就結束 → 0 行 → 0 個 ID → OK。
FAKE = '''# BB 交接紀錄
## 交班（BB-B，2026-10-17）
- 交接要寫全部待辦（使用者 00:2x：「代辦事項全部都要交接」）
- 已推 a9868928
## 其他
- BB_181 口氣審（WIP）
'''
start, sec, problems = I.todo_check(FAKE)
expect('① 正文提到「全部待辦」不是段落標題 → 找不到段落、報異常（不能假通過）', start is None and problems, (start, sec, problems))
REAL = FAKE + '''## 全部待辦（BB-C）
- BB_181 口氣審：AB-65
- ART-BB-READY-1017 已通過的圖
'''
start, sec, problems = I.todo_check(REAL)
expect('① 真的「## 全部待辦」標題：找到、有內容、沒有異常', start is not None and len([l for l in sec if l.strip()]) == 2 and not problems, (start, sec, problems))
EMPTY = FAKE + '## 全部待辦\n\n## 下一節\n- x\n'
start, sec, problems = I.todo_check(EMPTY)
expect('① 段落存在但是空的（0 項）→ 報異常', problems and any('0' in p for p in problems), problems)
NOID = FAKE + '## 全部待辦\n- 還要再想想\n'
start, sec, problems = I.todo_check(NOID)
expect('① 段落有內容但一個任務 ID 都沒有、也沒標【表外】→ 報異常', problems, problems)
BULLET = '# x\n- **全部待辦**（D93）：\n  - AB-65 口氣審\n  - V1-AA194-L\n- 其他\n'
start, sec, problems = I.todo_check(BULLET)
expect('① 條列形式「- **全部待辦**：」底下的子項算段落', start is not None and len(sec) == 2 and not problems, (start, sec, problems))
# 舊版行為（證明測試抓得到原本的 bug）：todo_section 對 FAKE 回傳 0 行
s0, l0 = H.todo_section_legacy(FAKE)
expect('① 舊版 todo_section 對事故資料回傳「找到、0 行」（原本的 bug，保留給對照）', s0 is not None and not [l for l in l0 if l.strip()], (s0, l0))

# ---------- ② covered_by 誤判 ----------
DIDS = {'DL-BB-7b9cd06a', 'DLV-1016-21'}
TIDS = {'AB-65', 'ART-SHOP1'}
bad = I.classify_problems({'sha': 'd9388b2a', 'kind': 'covered', 'coveredBy': '沒有登記'}, DIDS, TIDS)
expect('② kind=covered、coveredBy「沒有登記」→ 異常（不是交付 ID）', bad, bad)
bad = I.classify_problems({'sha': 'd9388b2a', 'why': 'covered_by=沒有登記'}, DIDS, TIDS)
expect('② 只有自由文字 why（沒有 kind）→ 異常：未分類', bad, bad)
bad = I.classify_problems({'sha': 'd9388b2a', 'kind': 'covered', 'coveredBy': 'DL-BB-7b9cd06a'}, DIDS, TIDS)
expect('② coveredBy 是存在的交付 ID → 沒問題', not bad, bad)
bad = I.classify_problems({'sha': 'x', 'kind': 'wip', 'task': 'NOPE-1'}, DIDS, TIDS)
expect('② kind=wip 的任務不在總表 → 異常', bad, bad)
bad = I.classify_problems({'sha': 'x', 'kind': 'not_delivery', 'reason': ''}, DIDS, TIDS)
expect('② kind=not_delivery 沒寫理由 → 異常', bad, bad)
bad = I.classify_problems({'sha': 'x', 'kind': '已涵蓋'}, DIDS, TIDS)
expect('② kind 不是列舉值 → 異常', bad, bad)


# ---------- 二、水位線（用臨時 git repo） ----------
def git(d, *a):
    return subprocess.run(['git', *a], cwd=d, capture_output=True, text=True, check=True).stdout.strip()


def repo():
    d = tempfile.mkdtemp(prefix='wm_')
    git(d, 'init', '-q', '-b', 'main')
    git(d, 'config', 'user.email', 't@t'); git(d, 'config', 'user.name', 't')
    os.makedirs(os.path.join(d, 'docs/handoff'))
    return d


def commit(d, f, msg):
    p = os.path.join(d, f)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'a').write(msg + '\n')
    git(d, 'add', f); git(d, 'commit', '-qm', msg)
    return git(d, 'rev-parse', 'HEAD')


def write(d, name, obj):
    open(os.path.join(d, 'docs/handoff', name), 'w', encoding='utf-8').write(json.dumps(obj, ensure_ascii=False, indent=1))


d = repo()
c1 = commit(d, 'a.md', 'BB 舊工作一')
c2 = commit(d, 'a.md', 'BB 舊工作二')
git(d, 'branch', 'bb')
TASKS = {'tasks': [{'id': 'AB-65', 'status': '進行中'}, {'id': 'ART-SHOP1', 'status': '已實作待整合'}]}
write(d, 'tasks.json', TASKS)
DV = {'deliveries': [{'id': 'DL-BB-1', 'sha': c2[:8], 'task': 'AB-65'}], 'ignored': []}
write(d, 'deliveries.json', DV)
WM = {'version': 1, 'roles': {'BB': {'branch': 'bb', 'sha': c2, 'at': '2026-10-17T03:14Z', 'by': 'LAWWW-B', 'open': []}}}
write(d, 'watermarks.json', WM)
DUTY = {'roles': {'BB': {'branch': 'bb'}}}
r = I.scan(d, WM, DV, TASKS, DUTY, remote=False)
expect('二 分支停在水位線 → 0 個新 commit、沒有異常', r['BB']['new'] == 0 and not r['BB']['problems'], r)
git(d, 'checkout', '-q', 'bb')
c3 = commit(d, 'b.md', 'BB_181 口氣審 WIP')
c4 = commit(d, 'b.md', '修錯字')   # 沒有任何交付關鍵字：舊版關鍵字掃描會放過
r = I.scan(d, WM, DV, TASKS, DUTY, remote=False)
expect('二 水位線之後 2 個 commit 都沒分類 → 兩個都報（不靠關鍵字）', r['BB']['new'] == 2 and len(r['BB']['unclassified']) == 2, r)
expect('二 只掃水位線以後（不重掃舊的 c1、c2）', r['BB']['scanned'] == 2, r)
ok, msg = I.advance(d, WM, r, 'BB', 'LAWWW-C', remote=False, dry=True)
expect('二 還有沒分類的 → 水位線不能前進', not ok, msg)
DV['ignored'] = [{'sha': c4[:8], 'kind': 'not_delivery', 'reason': '錯字'}]
OB = {'role': 'BB', 'entries': [{'task': 'AB-65', 'branch': 'bb', 'sha': c3[:8], 'files': ['b.md'], 'state': 'WIP', 'remaining': '後半', 'next': '審完交 AA', 'noDirectIntegrate': True, 'receiver': 'AA', 'ack': 'SENT'}]}
r = I.scan(d, WM, DV, TASKS, DUTY, remote=False, outboxes={'BB': OB})
expect('三 outbox 登記的 WIP＋ignored 的 not_delivery → 全部分類', not r['BB']['unclassified'] and not r['BB']['problems'], r)
ok, msg = I.advance(d, WM, r, 'BB', 'LAWWW-C', remote=False, dry=True)
expect('二 全部分類、沒有異常 → 可以前進到分支最新', ok and WM['roles']['BB']['sha'] == c2, msg)   # dry：不改
ok, msg = I.advance(d, WM, r, 'BB', 'LAWWW-C', remote=False)
expect('二 前進後水位線＝c4、舊的寫進 history', ok and WM['roles']['BB']['sha'] == c4 and WM['roles']['BB']['history'][-1]['sha'] == c2, WM)
# outbox 欄位缺、狀態不合法
bad = I.outbox_problems({'role': 'BB', 'entries': [{'task': 'AB-65', 'sha': c3[:8], 'state': '做完了'}]}, TASKS)
expect('三 outbox 狀態不是 WIP／已交付／已整合／已測試／已驗收、缺欄位 → 異常', bad and any('state' in b for b in bad) and any('files' in b for b in bad), bad)
# outbox 的 task 寫「ID（說明）」、或說明文字但同一個 commit 有交付登記對到總表任務 → 不算異常；開頭不是總表的 ID、也沒有交付登記 → 異常
OBX = lambda t, sha: {'role': 'LAWWW2', 'entries': [{'task': t, 'branch': 'l2', 'sha': sha, 'files': ['a.md'], 'state': '已交付', 'next': '整合', 'noDirectIntegrate': False, 'receiver': 'LAWWW', 'ack': 'SENT'}]}
expect('三 outbox task「AB-65（說明）」「AB-65 第二版」→ 開頭是總表的 ID，不算異常', not I.outbox_problems(OBX('AB-65（B08）', c3[:8]), TASKS) and not I.outbox_problems(OBX('AB-65 第二版', c3[:8]), TASKS))
bad = I.outbox_problems(OBX('AB-650（說明）', c3[:8]), TASKS) + I.outbox_problems(OBX('AB-65X', c3[:8]), TASKS)
expect('三 outbox task 開頭不是總表的 ID（AB-650、AB-65X）→ 異常（不做包含判斷）', len(bad) == 2, bad)
DVX = {'deliveries': [{'id': 'DL-X', 'task': 'AB-65', 'sha': c3[:9]}], 'ignored': []}
expect('三 outbox task 是說明文字，同一個 commit 有交付登記對到總表任務 → 不算異常', not I.outbox_problems(OBX('貓趴在圓椅上（hold）', c3[:8]), TASKS, DVX))
DVY = {'deliveries': [{'id': 'DL-Y', 'task': 'NOPE-1', 'sha': c3[:9]}], 'ignored': []}
expect('三 交付登記的任務也不在總表 → 照樣異常', I.outbox_problems(OBX('貓趴在圓椅上（hold）', c3[:8]), TASKS, DVY))
# 歷史改寫：水位線的 commit 不在分支上
git(d, 'checkout', '-q', '-b', 'rewritten', c1)
commit(d, 'c.md', '改寫後')
DUTY2 = {'roles': {'BB': {'branch': 'rewritten'}}}
r = I.scan(d, WM, DV, TASKS, DUTY2, remote=False)
expect('二 水位線不是分支的祖先（歷史改寫／分岔）→ fail closed', r['BB']['problems'] and any('祖先' in p for p in r['BB']['problems']), r)
ok, msg = I.advance(d, WM, r, 'BB', 'LAWWW-C', remote=False, dry=True)
expect('二 分岔時水位線不能前進', not ok, msg)
WM3 = {'version': 1, 'roles': {'BB': {'branch': 'bb', 'sha': 'deadbeef' * 5}}}
r = I.scan(d, WM3, DV, TASKS, DUTY, remote=False)
expect('二 水位線的 SHA 不存在 → 異常', r['BB']['problems'], r)
r = I.scan(d, {'version': 1, 'roles': {}}, DV, TASKS, DUTY, remote=False)
expect('二 職位沒有水位線 → 異常（要先建立基準）', r['BB']['problems'], r)
# 未結項目：水位線記的 open 不能無故消失
WM['roles']['BB']['open'] = ['AB-65', 'GONE-1']
r = I.scan(d, WM, DV, TASKS, DUTY, remote=False, outboxes={'BB': OB})
expect('二 水位線記的未結項目 GONE-1 不在總表 → 異常（舊漏項不能被水位線藏起來）', any('GONE-1' in p for p in r['BB']['problems']), r)
# 中文檔名（2026-10-17 真實案例：AA_158、BB_00 的 commit 照路徑分類不到，因為 diff-tree 把中文轉成跳脫字元）
cz = commit(d, 'docs/story_planning/AA_158_交換路線狀態機.md', '中文檔名')
expect('三 中文檔名：commit_files 回傳原本的中文路徑（不是 \\345… 跳脫）', I.commit_files(d, cz) == ['docs/story_planning/AA_158_交換路線狀態機.md'], I.commit_files(d, cz))
expect('三 中文檔名的 commit 照 outbox 路徑分類得到', I.path_owner(I.commit_files(d, cz), 'AA', {'entries': [{'task': 'US-RESCHED-1017', 'files': ['docs/story_planning/AA_158_交換路線狀態機.md']}]}) == 'outbox 路徑：US-RESCHED-1017')
shutil.rmtree(d)

# ---------- 三、照路徑分類（outbox 登記的檔案、自己的交接檔） ----------
OB2 = {'role': 'LAWWW2', 'entries': [{'task': 'ART-CH-WEILUN', 'files': ['tools/blender/char_second/weilun.py', 'assets/models/char/']}]}
expect('三 只改 outbox 登記的檔案（資料夾 / 也算）→ 歸到那個任務', I.path_owner(['tools/blender/char_second/weilun.py', 'assets/models/char/x.vrm'], 'LAWWW2', OB2) == 'outbox 路徑：ART-CH-WEILUN')
expect('三 只改自己的交接檔 → 進度紀錄', I.path_owner(['docs/art-rebuild/second_ai/HANDOFF.md'], 'LAWWW2', OB2) == 'outbox 路徑：進度紀錄')
expect('三 有一個檔不在 outbox 也不是交接檔 → 不分類（要人看）', I.path_owner(['tools/blender/char_second/weilun.py', 'src/story3d.js'], 'LAWWW2', OB2) is None)
expect('三 別的職位的交接檔不算', I.path_owner(['docs/story_planning/AA_交接紀錄.md'], 'LAWWW2', OB2) is None)
expect('三 AA 的 commit 合併進 BB 分支：照 AA 的 outbox 分類（any_owner）', I.any_owner(['docs/story_planning/AA_158.md'], 'BB', {'AA': {'entries': [{'task': 'US-RESCHED-1017', 'files': ['docs/story_planning/AA_158.md']}]}, 'BB': {'entries': []}}) == 'outbox 路徑：US-RESCHED-1017')
expect('三 沒有改任何檔（空 commit）→ 不分類', I.path_owner([], 'LAWWW2', OB2) is None)

# ---------- 三、WIP 索引不能無故消失 ----------
prev = {'items': [{'id': 'WIP-A', 'task': 'AB-65', 'state': 'WIP'}, {'id': 'WIP-B', 'task': 'ART-SHOP1', 'state': 'WIP'}]}
cur = {'items': [{'id': 'WIP-A', 'task': 'AB-65', 'state': 'WIP'}]}
bad = I.wip_diff(prev, cur)
expect('三 WIP-B 從索引消失、沒寫結案 → 異常', any('WIP-B' in b for b in bad), bad)
cur['items'].append({'id': 'WIP-B', 'task': 'ART-SHOP1', 'state': '已整合', 'closedBy': 'abc1234'})
expect('三 WIP-B 改成已整合並附證據 → 沒問題', not I.wip_diff(prev, cur), I.wip_diff(prev, cur))

# ---------- 三、劇情匯入白名單 ----------
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as G
ALLOW = {'files': [{'path': 'docs/story_planning/閒聊階梯_大一上_以安.md', 'sha': 'abc12345', 'status': 'approved', 'approvedBy': 'AA-B＋BB-B'}]}
ok, why = G.allowed('docs/story_planning/閒聊階梯_大一上_以安.md', 'abc12345', ALLOW)
expect('三 白名單裡、版本相同、已批准 → 可以匯入', ok, why)
ok, why = G.allowed('docs/story_planning/閒聊階梯_大一下_可昕.md', 'ffff0000', ALLOW)
expect('三 不在白名單（可昕 17 處未審）→ 拒絕', not ok, why)
ok, why = G.allowed('docs/story_planning/閒聊階梯_大一上_以安.md', 'ffff0000', ALLOW)
expect('三 白名單裡但來源版本不同 → 拒絕', not ok, why)
ALLOW['files'].append({'path': 'x.md', 'sha': '1', 'status': 'WIP'})
ok, why = G.allowed('x.md', '1', ALLOW)
expect('三 白名單標 WIP → 拒絕', not ok, why)
ok, why = G.allowed_glob('docs/story_planning/閒聊階梯_*.md', ALLOW)
expect('三 不能用萬用字元一次匯入整批', not ok, why)

# ---------- 四、帳號 B 交班的真實資料（有完整 git 時） ----------
if os.path.exists(os.path.join(ROOT, 'docs/handoff/watermarks.json')) and subprocess.run(['git', 'rev-parse', '--verify', '-q', 'origin/claude/elegant-brown-fcos7n'], cwd=ROOT, capture_output=True).returncode == 0:
    buf = io.StringIO()
    with redirect_stdout(buf):
        code = H.main(['--root', ROOT, 'incr'])
    out = buf.getvalue()
    expect('四 真實資料：incr 跑得完、每個職位都有水位線', 'BB' in out and 'AA' in out and 'LAWWW2' in out and '沒有水位線' not in out, out)
    real = json.load(open(os.path.join(ROOT, 'docs/handoff/wip.json'), encoding='utf-8'))
    ids = {x['id'] for x in real['items']}
    for must in ('WIP-AA-Y1S2-LADDER', 'WIP-AA-211', 'WIP-BB-181', 'WIP-DORM-ROOM4-0829'):
        expect(f'四 真實 WIP 索引有 {must}', must in ids, sorted(ids))
else:
    print('SKIP 四 真實資料（沒有 watermarks.json 或沒 fetch）')

# ---------- 五、只改使用者要求檔（user_asks_<職位>.json，HV-18）的 commit 照路徑分類 ----------
# INCR-CLEANUP-1021（2026-10-21）：REGISTRY 沒有 user_asks，只改它的 commit 每次都被列成「沒分類」（70 個裡占了 18 個的一大半）
for f in ('docs/handoff/user_asks_AA.json', 'docs/handoff/user_asks_LAWWW2.json', 'docs/handoff/outbox_BB.json', 'docs/handoff/duty_AA.json'):
    expect(f'五 登記檔照路徑分類：{f}', bool(I.REGISTRY.match(f)))
for f in ('docs/handoff/user_asks_AA.md', 'docs/handoff/tasks.json', 'src/user_asks_AA.json'):
    expect(f'五 不是登記檔：{f}', not I.REGISTRY.match(f))

print(f'\n{"全部通過" if not fails else f"{fails} 項失敗"}')
sys.exit(1 if fails else 0)
