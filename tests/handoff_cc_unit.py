#!/usr/bin/env python3
"""第五個職位 CC（BB 的測試執行助手；D119／HV-22，使用者 2026-11-02 03:5x 對 BB「請lawww新增這個角色 叫做CC 交班規則也要有」
「其他帳號的會用其他帳號的命名規則 CC-B CC-C CC-D」）：交接工具要和 LAWWW2／AA／BB 一樣認得 CC。
  一、職位清單（duty_state／incremental／check_handoff）都有 CC；工作階段名稱 CC、CC-B、CC-C、CC-D
  二、check：負責人 CC 是合法負責人、跨 AI 任務要有 xai
  三、roles／asks：CC 的交接檔、使用者要求檔還沒建＝照其他職位一樣報異常、不當掉；建好就通過
  四、incr：CC 水位線以後的 commit 照路徑／outbox 分類；水位線缺了 fail closed
  五、duty plan／register／handoff 吃 --role CC
  六、真實資料：duty.json、watermarks.json 有 CC
  python3 tests/handoff_cc_unit.py"""
import io, json, os, shutil, subprocess, sys, tempfile
from contextlib import redirect_stdout

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'handoff'))
import check_handoff as H
import duty_state as D
import incremental as I

fails = 0
CC_FILE = 'docs/story_planning/CC/CC_00_交接紀錄.md'


def expect(name, ok, info=''):
    global fails
    print(('PASS ' if ok else 'FAIL ') + name + (('　' + str(info)[-400:]) if info and not ok else ''))
    if not ok:
        fails += 1


def git(d, *a):
    r = subprocess.run(['git', '-C', d, *a], capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(f'git {a} 失敗：{r.stderr}')
    return r.stdout.strip()


def wfile(d, p, o):
    os.makedirs(os.path.dirname(os.path.join(d, p)), exist_ok=True)
    with open(os.path.join(d, p), 'w', encoding='utf-8') as f:
        f.write(o if isinstance(o, str) else json.dumps(o, ensure_ascii=False, indent=1))


def run(*argv):
    buf = io.StringIO()
    with redirect_stdout(buf):
        code = H.main(list(argv))
    return code, buf.getvalue()


def repo():
    d = tempfile.mkdtemp(prefix='hcc_')
    git(d, 'init', '-q', '-b', 'main')
    git(d, 'config', 'user.email', 't@example.com'); git(d, 'config', 'user.name', 't')
    return d


# ---------- 一、職位清單與命名 ----------
expect('一 duty_state.ROLES 有 CC（排在 BB 後面）', D.ROLES == ('LAWWW', 'LAWWW2', 'AA', 'BB', 'CC'), D.ROLES)
expect('一 incremental.ROLES 有 CC', I.ROLES == ['LAWWW', 'LAWWW2', 'AA', 'BB', 'CC'], I.ROLES)
expect('一 check_handoff.ASK_ROLES 有 CC', H.ASK_ROLES == ['LAWWW', 'LAWWW2', 'AA', 'BB', 'CC'], H.ASK_ROLES)
expect('一 負責人 OWNERS、跨 AI 任務 XAI_OWNERS 都有 CC', 'CC' in H.OWNERS and 'CC' in H.XAI_OWNERS and 'LAWWW' not in H.XAI_OWNERS)
expect('一 CC 交接檔的備用路徑（roles）＝CC_00_交接紀錄.md', H.ROLE_FILES.get('CC') == [CC_FILE], H.ROLE_FILES.get('CC'))
expect('一 CC 的交接檔算進度紀錄（incr 照路徑分類）', I.PROGRESS_FILES.get('CC') == [CC_FILE], I.PROGRESS_FILES.get('CC'))
names = [D.session_name('CC', a) for a in D.ACCOUNTS]
expect('一 工作階段名稱：帳號 A＝CC、B／C／D＝CC-B、CC-C、CC-D', names == ['CC', 'CC-B', 'CC-C', 'CC-D'], names)
expect('一 account_of：CC→A、CC-B→B、CC-D→D（帳號 D 也認得）', [D.account_of(x) for x in ('CC', 'CC-B', 'CC-C', 'CC-D', 'LAWWW-D')] == ['A', 'B', 'C', 'D', 'D'])
expect('一 「CC-B」「CC-D」是工作階段名稱、不是任務 ID（roles 不會當成總表沒有的任務）',
       all(H.NOT_ID.search(x) for x in ('CC-B', 'CC-C', 'CC-D', 'BB-D', 'LAWWW2-D')) and not H.NOT_ID.search('CC-TOOL-1102'))
expect('一 duty_CC.json、outbox_CC.json、user_asks_CC.json 是登記檔（只改它們的 commit 照路徑分類）',
       all(I.REGISTRY.match(f'docs/handoff/{x}_CC.json') for x in ('duty', 'outbox', 'user_asks')))
expect('一 使用者訊息提醒（hook）寫到 user_asks_<…|CC>.json', 'user_asks_<LAWWW|LAWWW2|AA|BB|CC>.json' in open(os.path.join(ROOT, 'tools/handoff/user_ask_reminder.py'), encoding='utf-8').read())

# ---------- 二、check：負責人 CC ----------
ST = ['待開工', '進行中', '等待其他AI／素材', '已實作待整合', '已整合待測試', '已驗收', '暫停', '取消／被取代']
F = {'term': 'META', 'week': 1, 'earliest': '—', 'mainline': False, 'blocks': False, 'prereq': False, 'parallel': True, 'confirmed': True}
d = tempfile.mkdtemp(prefix='hcc_chk_')
tk = lambda i, **k: dict({'id': i, 'title': i, 'owner': 'CC', 'status': '待開工', 'next': '跑 BB 派的測試', 'priority': 'P1', 'first': dict(F)}, **k)
wfile(d, 'docs/handoff/tasks.json', {'version': 1, 'statuses': ST, 'meta': {}, 'tasks': [
    tk('CC-T1'), tk('CC-T2', xai={'receiver': 'BB', 'branch': 'claude/cc-testing', 'spec': 'BB 分派', 'acceptance': '原始結果＋CC 初判', 'ack': 'ACK'})]})
wfile(d, 'docs/handoff/deliveries.json', {'version': 1, 'scannedThrough': {}, 'deliveries': [], 'ignored': []})
wfile(d, 'docs/HANDOFF_GAP_MATRIX.md', '# 測試\n')
wfile(d, 'docs/handoff/snapshots/2026-11-02T0400Z_A_LAWWW.json', {'version': 1, 'taken': '2026-11-02T0400Z', 'role': 'LAWWW', 'account': 'A', 'open': ['CC-T1', 'CC-T2'], 'status': {'CC-T1': '待開工', 'CC-T2': '待開工'}})
code, out = run('--root', d, 'check', '--no-git')
expect('二 負責人 CC 是合法的（不報「負責人不是…」）', '負責人「CC」' not in out, out)
expect('二 CC 的未結任務沒有 xai → 異常 10（跨 AI 任務要寫接收者、分支、規格、交付標準、ACK）', '[異常 10] CC-T1：跨 AI 任務（負責人 CC）沒有 xai' in out and 'CC-T2' not in out.split('[異常')[-1], out)
shutil.rmtree(d, ignore_errors=True)

# ---------- 三、roles／asks：CC 的檔案還沒建、建好以後 ----------
d = repo()
TASKS = {'version': 1, 'statuses': ST, 'meta': {}, 'tasks': [tk('ROLE-CC-1102', owner='LAWWW')]}
wfile(d, 'docs/handoff/tasks.json', TASKS)
wfile(d, 'docs/handoff/USER_WANTS.md', '# 使用者要過的東西\n## 1. 總表\n| 列 | 要什麼 | 狀態 | 負責人 |\n|---|---|---|---|\n| X152 | 新增職位 CC | 進行中 | LAWWW |\n')
DUTY = {'roles': {'LAWWW': {'account': 'A', 'branch': 'main'}, 'AA': {'account': 'A', 'branch': 'aa'},
                  'CC': {'account': 'A', 'branch': 'cc', 'progressFile': CC_FILE + '（cc）'}}}
wfile(d, 'docs/handoff/duty.json', DUTY)
git(d, 'add', '-A'); git(d, 'commit', '-qm', 'base')
base = git(d, 'rev-parse', 'HEAD')
for b in ('aa', 'cc'):
    git(d, 'update-ref', f'refs/remotes/origin/{b}', base)   # 模擬 fetch 過的遠端分支
code, out = run('--root', d, 'asks', '--role', 'CC')
expect('三 asks：CC 的 user_asks_CC.json 還沒建 → 異常（照其他職位的格式）、不當掉', code == 1 and 'CC：沒有 docs/handoff/user_asks_CC.json（職位分支 cc 和 RULE_SOURCE 都沒有）' in out, out)
code, out = run('--root', d, 'roles', '--role', 'CC')
expect('三 roles：CC 的交接檔還沒建 → 異常「交接檔讀不到」、不當掉（先找 CC 分支、再找企劃線＝AA 的分支）', code == 1 and 'CC：交接檔讀不到' in out and "'cc', 'aa'" in out, out)
code, out = run('--root', d, 'roles')
expect('三 roles 不給 --role：預設也核對 CC', 'CC：' in out, out)
code, out = run('--root', d, 'asks')
expect('三 asks 不給 --role：預設也讀 CC', 'CC：' in out, out)
git(d, 'checkout', '-q', '-b', 'cc')
wfile(d, CC_FILE, '# CC_00 交接紀錄\n\n## 全部待辦（D93）\n- ROLE-CC-1102：BB 派的測試\n- 【表外】還沒開任務的一項\n')
wfile(d, 'docs/handoff/user_asks_CC.json', {'role': 'CC', 'asks': [{'id': 'UA-CC-1102-01', 'at': '2026-11-02T03:5x', 'quote': '新增 CC 職位（使用者對 BB）', 'kind': '轉述', 'status': '進行中', 'wants': 'X152'}]})
git(d, 'add', '-A'); git(d, 'commit', '-qm', 'CC 交接檔')
git(d, 'update-ref', 'refs/remotes/origin/cc', git(d, 'rev-parse', 'HEAD'))
git(d, 'checkout', '-q', 'main')
code, out = run('--root', d, 'asks', '--role', 'CC')
expect('三 asks：CC 分支上的 user_asks_CC.json 讀得到、對得到 USER_WANTS → OK', code == 0 and '[資訊] CC：origin/cc 1 筆' in out, out)
code, out = run('--root', d, 'roles', '--role', 'CC')
expect('三 roles：CC 交接檔的全部待辦讀得到；ROLE-CC-1102 在總表、【表外】那一項報出來（和其他職位一樣）',
       code == 1 and f'origin/cc:{CC_FILE}' in out and 'ROLE-CC-1102 在交接檔、總表沒有' not in out and '表外（還沒補成任務）' in out, out)
shutil.rmtree(d, ignore_errors=True)

# ---------- 四、incr：CC 的水位線 ----------
d = repo()
wfile(d, 'shared.md', 'AA、BB 的舊 commit\n'); git(d, 'add', '-A'); git(d, 'commit', '-qm', '企劃線')
bp = git(d, 'rev-parse', 'HEAD')   # 分岔點（正式資料：企劃線 7340266599e7）
git(d, 'checkout', '-q', '-b', 'cc')
wfile(d, CC_FILE, '# CC_00\n'); git(d, 'add', '-A'); git(d, 'commit', '-qm', 'CC 交接檔')
wfile(d, 'docs/handoff/duty_CC.json', {'role': 'CC'}); git(d, 'add', '-A'); git(d, 'commit', '-qm', 'CC 值班登記')
wfile(d, 'docs/story_planning/test_tools/cc/probe.py', '# probe\n'); git(d, 'add', '-A'); git(d, 'commit', '-qm', 'CC probe')
probe = git(d, 'rev-parse', 'HEAD')
TASKS = {'tasks': [{'id': 'CC-PROBE-1102', 'status': '進行中'}]}
DV = {'deliveries': [], 'ignored': []}
WM = {'version': 1, 'roles': {'CC': {'branch': 'cc', 'sha': bp, 'at': '2026-11-02T03:53Z', 'by': 'LAWWW', 'open': []}}}
DUTY = {'roles': {'CC': {'branch': 'cc'}}}
r = I.scan(d, WM, DV, TASKS, DUTY, remote=False, roles=['CC'])['CC']
expect('四 CC 水位線（分岔點）以後 3 個 commit：交接檔、duty_CC.json 照路徑分類，probe 沒登記 → 未分類', r['new'] == 3 and r['classified'] == 2 and [u[0] for u in r['unclassified']] == [probe[:8]], r)
OB = {'role': 'CC', 'entries': [{'task': 'CC-PROBE-1102', 'branch': 'cc', 'sha': probe[:8], 'files': ['docs/story_planning/test_tools/cc/'], 'state': '已交付', 'next': 'BB 審', 'noDirectIntegrate': True, 'receiver': 'BB', 'ack': 'SENT'}]}
r = I.scan(d, WM, DV, TASKS, DUTY, remote=False, outboxes={'CC': OB}, roles=['CC'])['CC']
expect('四 outbox_CC 登記了 probe → 全部分類、可以前進', not r['unclassified'] and not r['problems'], r)
ok, msg = I.advance(d, WM, {'CC': r}, 'CC', 'LAWWW', remote=False, dry=True)
expect('四 CC 全部分類 → advance（dry）可以前進', ok, msg)
r = I.scan(d, {'version': 1, 'roles': {}}, DV, TASKS, DUTY, remote=False)
expect('四 預設掃描（不給 roles）包含 CC；CC 沒有水位線 → fail closed', 'CC' in r and any('沒有水位線' in p for p in r['CC']['problems']), r.get('CC'))
shutil.rmtree(d, ignore_errors=True)

# ---------- 五、duty 指令吃 --role CC ----------
d = repo()
duty = {'version': 1, 'ruleVersion': 'HV-22', 'ruleSource': {'branch': 'main', 'sha': 'x'}, 'onDuty': 'A', 'previous': None,
        'accountState': {'A': 'on', 'B': 'off', 'C': 'off', 'D': 'unused'}, 'history': [], 'anomalies': [], 'pending': None, 'seq': 1, 'chain': [],
        'roles': {r: {'account': 'A', 'session': f'session_A{r}', 'branch': 'main', 'state': 'on'} for r in D.ROLES}}
wfile(d, 'docs/handoff/duty.json', duty)
git(d, 'add', '-A'); git(d, 'commit', '-qm', 'duty')
code, out = run('--root', d, 'duty', 'plan', '--account', 'B', '--role', 'CC')
expect('五 duty plan --role CC：上一任 CC（帳號 A）、你的工作階段叫 CC-B', code == 0 and '上一任 CC（on）' in out and '你的工作階段叫 CC-B' in out, out)
code, out = run('--root', d, 'duty', 'handoff', '--account', 'A', '--role', 'CC')
reg = json.load(open(os.path.join(d, 'docs/handoff/duty_CC.json'), encoding='utf-8')) if code == 0 else {}
expect('五 duty handoff --role CC：只寫 CC 自己的 duty_CC.json（handed-off），不改 duty.json', code == 0 and reg.get('state') == 'handed-off' and json.load(open(os.path.join(d, 'docs/handoff/duty.json'), encoding='utf-8'))['roles']['CC']['state'] == 'on', out)
duty['roles']['CC']['state'] = 'handed-off'
wfile(d, 'docs/handoff/duty.json', duty)
code, out = run('--root', d, 'duty', 'register', '--account', 'C', '--role', 'CC', '--session', 'session_CCC', '--branch', 'cc-C')
reg = json.load(open(os.path.join(d, 'docs/handoff/duty_CC.json'), encoding='utf-8')) if code == 0 else {}
expect('五 duty register --role CC（上一任已交班）：登記 CC-C、寫 duty_CC.json', code == 0 and '登記：CC-C（帳號 C）接 CC' in out and reg.get('account') == 'C', out)
wfile(d, 'docs/handoff/tasks.json', {'version': 1, 'statuses': ST, 'meta': {}, 'tasks': [tk('CC-T1')]})
code, out = run('--root', d, 'snapshot', '--role', 'CC', '--account', 'C')
snaps = os.listdir(os.path.join(d, 'docs/handoff/snapshots'))
expect('五 snapshot --role CC：交班快照檔名 …_C_CC.json', code == 0 and any(f.endswith('_C_CC.json') for f in snaps), out)
code, out = run('--root', d, 'duty', 'verify', '--no-git')
expect('五 duty verify 逐職位也檢查 CC（值班帳號 A 自己的 CC 標成已交班 → 異常 2）', code == 1 and '[異常 2] CC：值班帳號自己的職位標成已交班' in out, out)
shutil.rmtree(d, ignore_errors=True)

# ---------- 六、真實資料（工作目錄的 duty.json、watermarks.json） ----------
dj = json.load(open(os.path.join(ROOT, 'docs/handoff/duty.json'), encoding='utf-8'))
cc = dj['roles'].get('CC') or {}
expect('六 duty.json 有 roles.CC：帳號 A、session_01TdESzxBpdGoPhdkPD2ENce、claude/cc-testing、交接檔 CC_00',
       cc.get('account') == 'A' and cc.get('session') == 'session_01TdESzxBpdGoPhdkPD2ENce' and cc.get('branch') == 'claude/cc-testing'
       and str(cc.get('progressFile', '')).startswith(CC_FILE) and cc.get('state') in D.ROLE_STATES, cc)
wm = json.load(open(os.path.join(ROOT, 'docs/handoff/watermarks.json'), encoding='utf-8'))
w = wm['roles'].get('CC') or {}
expect('六 watermarks.json 有 CC：claude/cc-testing、AA 已核對的水位線 b4893fd5（完整 SHA；不能用分岔點 7340266599e7，會讓 AA、BB 少核對）、open／history 是陣列',
       w.get('branch') == 'claude/cc-testing' and w.get('sha', '').startswith('b4893fd5') and len(w.get('sha', '')) == 40 and isinstance(w.get('open'), list) and isinstance(w.get('history'), list), w)
out = []
D.verify(type('A', (), {'root': ROOT, 'ref': None, 'no_git': True})(), d=dj, out=out)
expect('六 duty verify（--no-git）沒有 CC 的值班紀錄異常', not any('CC' in m for _, m in out), out)

print(f'\n{"全部通過" if not fails else f"{fails} 項失敗"}')
sys.exit(1 if fails else 0)
