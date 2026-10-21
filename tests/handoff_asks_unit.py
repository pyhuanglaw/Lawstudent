# check_handoff.py asks 的 ask_check：AI 解讀沒問過使用者＝異常（HV-18）；使用者授權這個職位自己決定的（D109，delegatedBy）不算。
# 用法：python3 tests/handoff_asks_unit.py
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'handoff'))
import check_handoff as C
fails = 0
def expect(name, ok, info=''):
    global fails
    print(('PASS ' if ok else 'FAIL ') + name + (('　' + info) if info else ''))
    if not ok: fails += 1
rows = {'X96': '規則（永久）', 'X33': '已取消'}
have = {C.canon('T-1')}
RULE = {'id': 'UA-AA-1', 'at': '2026-10-21T16:1x', 'quote': '以後你劇情自己決定我最近不太會關注 你要自主開發', 'kind': '原話', 'status': '規則（永久）', 'wants': 'X96'}
def run(*asks):
    return C.ask_check('AA', {'asks': list(RULE and [RULE]) + list(asks)}, rows, have)
ai = lambda **k: dict({'id': 'UA-AA-2', 'at': '2026-10-20T20:xx', 'quote': '（AI解讀）交換延畢的人 2030 不再擋', 'kind': 'AI解讀', 'status': '暫停', 'task': 'T-1'}, **k)
expect('授權規則本身沒有異常', run() == [], str(run()))
b = run(ai())
expect('AI 解讀沒問過、沒有 delegatedBy → 異常', any('UA-AA-2' in x and 'confirmed' in x for x in b), str(b))
b = run(ai(confirmed=True))
expect('問過使用者（confirmed true）→ 沒有異常', not any('UA-AA-2' in x for x in b), str(b))
b = run(ai(delegatedBy='UA-AA-1'))
expect('delegatedBy 指向這個職位的使用者授權規則 → 沒有異常', not any('UA-AA-2' in x for x in b), str(b))
b = run(ai(delegatedBy='UA-AA-9'))
expect('delegatedBy 指向不存在的 id → 照樣異常', any('UA-AA-2' in x and 'delegatedBy' in x for x in b), str(b))
b = run(ai(delegatedBy='UA-AA-3'), dict(ai(), id='UA-AA-3'))
expect('delegatedBy 指向另一筆 AI 解讀 → 照樣異常', any(x.startswith('AA UA-AA-2') and 'delegatedBy' in x for x in b), str(b))
b = run(ai(delegatedBy='UA-AA-4'), {'id': 'UA-AA-4', 'at': 'x', 'quote': '不用逐場確認', 'kind': '選擇題答案', 'status': '已取消', 'wants': 'X33'})
expect('delegatedBy 指向的不是「規則（永久）」→ 照樣異常', any(x.startswith('AA UA-AA-2') and 'delegatedBy' in x for x in b), str(b))
b = run(ai(status='已取消', cancelReason='時限已過；之後的指示取代'))
expect('AI 解讀已取消、寫了 cancelReason → 沒有異常（不會照它做）', not any(x.startswith('AA UA-AA-2') for x in b), str(b))
b = run(ai(status='已取消'))
expect('AI 解讀已取消但沒寫 cancelReason → 照樣異常', any(x.startswith('AA UA-AA-2') and 'confirmed' in x for x in b), str(b))
print('ALL PASS' if not fails else f'FAILED {fails}')
sys.exit(1 if fails else 0)
