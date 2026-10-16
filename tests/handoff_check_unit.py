#!/usr/bin/env python3
"""tools/handoff/check_handoff.py 的基本測試（D82）：每一項檢查在有問題的資料上報異常、在正常資料上通過；
快照不見或壞掉要回 2（REMEDIAL_FULL_AUDIT）；工具不改任務表。
  python3 tests/handoff_check_unit.py"""
import copy, hashlib, io, json, os, shutil, subprocess, sys, tempfile
from contextlib import redirect_stdout

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'tools', 'handoff'))
import check_handoff as H

ST = ['待開工', '進行中', '等待其他AI／素材', '已實作待整合', '已整合待測試', '已驗收', '暫停', '取消／被取代']
F = {'term': 'Y1S1', 'week': 1, 'earliest': 'Y1S1W01', 'mainline': True, 'blocks': False, 'prereq': False, 'parallel': True, 'confirmed': True}


def task(i, st='待開工', **k):
    t = {'id': i, 'title': i + ' 的標題', 'area': i.split('-')[0], 'owner': 'LAWWW', 'status': st, 'next': '下一步', 'priority': 'P1', 'first': dict(F)}
    t.update(k)
    return t


BASE = {'version': 1, 'statuses': ST, 'meta': {'stageOrder': ['P0', 'Y0', 'Y1S1', 'Y1S2', 'Y2', 'Y3', 'Y4', 'META']},
        'tasks': [task('BUG-01', '進行中', priority='P0'),
                  task('V2-A1'),
                  task('V2-A2', '已驗收', evidence='flow_x.py PASS（abc1234）'),
                  task('V2-A3', '取消／被取代', reason='過時', replacedBy='V2-A1'),
                  task('V0-A1', '暫停', pausedReason='等場景', resumeWhen='AA-B 給清單', first=dict(F, term='Y0S1', week=None, earliest='經濟系開學'))]}
SNAP = {'version': 1, 'taken': '2026-10-16T0100Z', 'role': 'LAWWW', 'account': 'A', 'open': ['BUG-01', 'V2-A1', 'V0-A1'],
        'status': {'BUG-01': '進行中', 'V2-A1': '待開工', 'V2-A2': '已整合待測試', 'V2-A3': '待開工', 'V0-A1': '暫停'}}
DELIV = {'version': 1, 'pattern': '交付', 'scannedThrough': {}, 'ignored': [],
         'deliveries': [{'id': 'DLV-1', 'from': 'LAWWW2-B', 'branch': 'x', 'sha': 'abc1234', 'what': '模型', 'task': 'V2-A1', 'msg': 'ACK', 'integration': '未整合'}]}
MD = '# 總表\n| BUG-01 | … |\n| V2-A1～A3 | … |\nV0-A1、V0-*\n'

fails = 0


def setup(tasks=None, snap=SNAP, deliv=DELIV, md=MD, snapname='2026-10-16T0100Z_A_LAWWW.json'):
    d = tempfile.mkdtemp(prefix='hc_')
    os.makedirs(os.path.join(d, 'docs/handoff/snapshots'))
    w = lambda p, o: open(os.path.join(d, p), 'w', encoding='utf-8').write(o if isinstance(o, str) else json.dumps(o, ensure_ascii=False))
    w('docs/handoff/tasks.json', tasks if tasks is not None else BASE)
    if deliv is not None:
        w('docs/handoff/deliveries.json', deliv)
    if snap is not None:
        w(f'docs/handoff/snapshots/{snapname}', snap)
    if md is not None:
        w('docs/HANDOFF_GAP_MATRIX.md', md)
    return d


def run(d, *extra):
    buf = io.StringIO()
    with redirect_stdout(buf):
        code = H.main(['--root', d, 'check', '--no-git', *extra] if 'git' not in extra else ['--root', d, 'check'])
    return code, buf.getvalue()


def expect(name, cond, out=''):
    global fails
    print(('PASS ' if cond else 'FAIL ') + name)
    if not cond:
        fails += 1
        print('  ' + out.replace('\n', '\n  ')[:1500])


def mod(fn):
    t = copy.deepcopy(BASE)
    fn(t['tasks'])
    return t


# 正常資料：只有「沒檢查」的 git 掃描（--no-git）→ 1；不是假的 OK
d = setup()
code, out = run(d)
expect('正常資料沒有異常（--no-git 時誠實回 1、標「沒有檢查」）', code == 1 and '[異常' not in out and '[沒有檢查]' in out, out)
shutil.rmtree(d)

# 1 任務消失
d = setup(mod(lambda T: T.pop(1)))
code, out = run(d)
expect('1 上次快照有、現在不見了 → 異常 1', '[異常 1] V2-A1' in out, out)
shutil.rmtree(d)

# 2 缺負責人／下一步、ID 重複
d = setup(mod(lambda T: (T[1].update(owner=''), T[0].update(next=''), T.append(task('V2-A1')))))
code, out = run(d)
expect('2 缺 owner、缺 next、ID 重複', all(s in out for s in ('V2-A1：缺 owner', 'BUG-01：缺 next', 'V2-A1：ID 重複')), out)
shutil.rmtree(d)

# 3 非法狀態
d = setup(mod(lambda T: T[1].update(status='完成')))
code, out = run(d)
expect('3 非法狀態「完成」', '[異常 3] V2-A1' in out, out)
shutil.rmtree(d)

# 4 已驗收沒證據
d = setup(mod(lambda T: T[2].pop('evidence')))
code, out = run(d)
expect('4 已驗收沒有 evidence', '[異常 4] V2-A2' in out, out)
shutil.rmtree(d)

# 5 取消沒原因／替代 ID 不存在／NONE 沒有授權；暫停沒恢復條件
d = setup(mod(lambda T: (T[3].pop('reason'), T[3].update(replacedBy='V9-ZZ'), T[4].pop('resumeWhen'))))
code, out = run(d)
expect('5 取消缺 reason、替代 ID 不存在、暫停缺 resumeWhen',
       all(s in out for s in ('V2-A3：取消但沒有 reason', 'replacedBy V9-ZZ 不在任務表', 'V0-A1：暫停但沒有 resumeWhen')), out)
shutil.rmtree(d)
d = setup(mod(lambda T: T[3].update(replacedBy='NONE')))
code, out = run(d)
expect('5 replacedBy NONE 要有 authorizedBy', 'authorizedBy' in out and '[異常 5]' in out, out)
shutil.rmtree(d)

# 6 交付對不到任務
dv = copy.deepcopy(DELIV)
dv['deliveries'][0]['task'] = 'ART-99'
d = setup(deliv=dv)
code, out = run(d)
expect('6 交付登記到不存在的任務', '[異常 6] 交付 DLV-1：任務 ART-99' in out, out)
shutil.rmtree(d)
d = setup(deliv=None)
code, out = run(d)
expect('6 deliveries.json 不存在 → 異常（不能當成沒交付）', '[異常 6]' in out and code == 1, out)
shutil.rmtree(d)

# 7 未 ACK／待整合的交付，任務卻是已驗收
dv = copy.deepcopy(DELIV)
dv['deliveries'][0].update(task='V2-A2', msg='DELIVERED', integration='已整合待測試')
d = setup(deliv=dv)
code, out = run(d)
expect('7 未 ACK、待測試的交付不算完成', out.count('[異常 7]') == 2, out)
shutil.rmtree(d)

# 8 首次出現時間
d = setup(mod(lambda T: (T[1]['first'].update(term='大一'), T[0]['first'].pop('mainline'))))
code, out = run(d)
expect('8 first.term 不合法、缺 mainline', 'first.term「大一」' in out and 'BUG-01：first.mainline' in out, out)
shutil.rmtree(d)

# 9 閱讀版提到、任務表沒有；區間展開；V0-* 一整組
d = setup(md=MD + '| V2-A9 |\n| SYS-02～04 |\n| V2-B-* |\n')
code, out = run(d)
expect('9 MD 有、JSON 沒有（含區間展開、一整組）',
       all(s in out for s in ('V2-A9：', 'SYS-02：', 'SYS-03：', 'SYS-04：', 'V2-B-*：')) and 'V2-A2：docs' not in out and 'V2-A1：docs' not in out, out)
shutil.rmtree(d)

# 快照不見、壞掉 → 2
d = setup(snap=None)
code, out = run(d)
expect('快照不存在 → 結束碼 2、REMEDIAL_FULL_AUDIT', code == 2 and 'REMEDIAL_FULL_AUDIT' in out, out)
shutil.rmtree(d)
d = setup(snap='{"version":1, "taken": ')
code, out = run(d)
expect('最新快照 JSON 壞掉 → 2', code == 2 and 'REMEDIAL_FULL_AUDIT' in out, out)
shutil.rmtree(d)
bad = dict(SNAP)
bad.pop('open')
d = setup(snap=bad)
code, out = run(d)
expect('快照缺欄位 → 2', code == 2, out)
shutil.rmtree(d)
d = setup(snap=dict(SNAP, role='AA'))
code, out = run(d)
expect('只有別的職位的快照 → 2（不能拿別人的快照充數）', code == 2, out)
shutil.rmtree(d)

# 工具不改任務表
d = setup(mod(lambda T: T.pop(1)))
h0 = hashlib.sha256(open(os.path.join(d, 'docs/handoff/tasks.json'), 'rb').read()).hexdigest()
run(d)
h1 = hashlib.sha256(open(os.path.join(d, 'docs/handoff/tasks.json'), 'rb').read()).hexdigest()
expect('check 不改 tasks.json（有異常也一樣）', h0 == h1)
shutil.rmtree(d)

# snapshot 指令 → 下一次 check 用最新的那份
d = setup()
subprocess.run(['git', 'init', '-q', d])
buf = io.StringIO()
with redirect_stdout(buf):
    H.main(['--root', d, 'snapshot', '--role', 'LAWWW', '--account', 'B'])
snaps = sorted(os.listdir(os.path.join(d, 'docs/handoff/snapshots')))
s = json.load(open(os.path.join(d, 'docs/handoff/snapshots', snaps[-1])))
expect('snapshot 寫出未結 ID 與全部狀態', len(snaps) == 2 and set(s['open']) == {'BUG-01', 'V2-A1', 'V0-A1'} and len(s['status']) == 5, buf.getvalue())
code, out = run(d)
expect('check 用最新的快照（B 的）', '_B_LAWWW' in out or '（B／LAWWW' in out, out)
shutil.rmtree(d)

# 6 交付分支掃描（真的 git）：scannedThrough 以後的「交付」commit 沒登記 → 異常；登記後 → OK
d = setup()
g = lambda *a: subprocess.run(['git', '-C', d, *a], capture_output=True, text=True, check=True).stdout.strip()
g('init', '-q'); g('config', 'user.email', 't@t'); g('config', 'user.name', 't')
g('add', '-A'); g('commit', '-qm', '起點')
base = g('rev-parse', '--short=8', 'HEAD')
open(os.path.join(d, 'a.txt'), 'w').write('1')
g('add', 'a.txt'); g('commit', '-qm', '公館腳踏車行交付（READY）')
open(os.path.join(d, 'b.txt'), 'w').write('1')
g('add', 'b.txt'); g('commit', '-qm', 'WIP 不是交付的東西')   # 也含「交付」二字 → 要登記或放 ignored
br = g('branch', '--show-current')
dv = copy.deepcopy(DELIV)
dv['scannedThrough'] = {br: base}
open(os.path.join(d, 'docs/handoff/deliveries.json'), 'w').write(json.dumps(dv, ensure_ascii=False))
code, out = run(d, 'git')
expect('6 掃描：沒登記的交付 commit 兩個', out.count('[異常 6]') == 2, out)
shas = g('log', '--format=%h', f'{base}..HEAD').split()
dv['deliveries'].append({'id': 'DLV-2', 'from': 'LAWWW2-B', 'branch': br, 'sha': shas[1], 'what': '車行', 'task': 'V2-A1', 'msg': 'ACK', 'integration': '未整合'})
dv['ignored'].append({'sha': shas[0], 'why': 'WIP'})
open(os.path.join(d, 'docs/handoff/deliveries.json'), 'w').write(json.dumps(dv, ensure_ascii=False))
code, out = run(d, 'git')
expect('6 掃描：登記、ignored 之後 OK（結束碼 0）', code == 0 and '結果：OK' in out, out)
dv['scannedThrough'] = {br: 'deadbeef'}
open(os.path.join(d, 'docs/handoff/deliveries.json'), 'w').write(json.dumps(dv, ensure_ascii=False))
code, out = run(d, 'git')
expect('6 掃描：commit 找不到 → 「沒有檢查」、不報 OK', code == 1 and '[沒有檢查]' in out, out)
shutil.rmtree(d)

# queue：P0 先、再照學期（Y0 在 Y1 前）
d = setup()
buf = io.StringIO()
with redirect_stdout(buf):
    H.main(['--root', d, 'queue'])
q = buf.getvalue()
expect('queue：P0 在最前、暫停的放等待區', q.index('BUG-01') < q.index('V2-A1') and q.index('等待中') < q.index('V0-A1'), q)
shutil.rmtree(d)

print(f'\n{"全部通過" if not fails else f"{fails} 項失敗"}')
sys.exit(1 if fails else 0)
