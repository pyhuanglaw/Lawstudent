"""觀念卡覆蓋檢查（D118-B2-1102；docs/handoff/D118_PLAN.md 第 1 節 ②-6、第 4 節 D118-B2）。只讀，不改任何檔。
列出：每一題對到哪一張卡；哪些題的答案（選項原文或對錯題的關鍵字）在那張卡顯示的內容裡找不到——
卡片顯示的內容＝AA 的 plain／example（還沒交就是空的）＋那一週的黑板三行＋教授那一句（src/study3d.js STUDY.view 的 fallback）。
題目的 core／explanation 不算（那是交卷後才顯示的解答）。BB 驗收 AA 的觀念卡時用：找不到的題目＝玩家沒辦法從遊戲內容學會。
用法：python3 tools/study/coverage.py [--list]   （--list：逐題列出）"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def read_js_value(rel, name):
    s = open(os.path.join(ROOT, rel), encoding='utf-8').read()
    m = re.search(r'^const ' + name + r'\s*=\s*', s, re.M)
    val, _ = json.JSONDecoder().raw_decode(s, m.end())
    return val


EB = read_js_value('src/data/exam_bank.js', 'EXAM_BANK')
SY = read_js_value('src/data/syllabus.js', 'SYLLABUS')
QB = read_js_value('src/data/legal_qbank.js', 'QBANK')
SU = read_js_value('src/data/study_units.js', 'STUDY_UNITS')
Q = {q['id']: q for q in EB['questions']}
for q in QB:
    Q.setdefault(q['id'], q)
norm = lambda t: re.sub(r'[\s　，。、；：「」（）()]', '', t or '')
rows, miss, nocard = [], [], []
card_of = {}
for u in SU['units']:
    sy = next((w for w in SY['courses'].get(u['course'], []) if w.get('w') == u['week']), None) if u.get('week') is not None else None
    text = norm(' '.join([u.get('plain', ''), u.get('example', ''), ' '.join((sy or {}).get('board') or []), (sy or {}).get('line', '')]))
    for qid in u['qids']:
        card_of[qid] = u['id']
        q = Q.get(qid)
        if not q:
            continue
        ans = q['answer'] if q.get('type') == 'tf' or not q.get('options') else q['options'].get(q['answer'], '')
        ok = q.get('type') != 'tf' and len(norm(ans)) >= 2 and norm(ans) in text
        rows.append((qid, u['id'], ok))
        if not ok:
            miss.append(qid)
for q in EB['questions']:
    cm = EB['courseMap'].get(q['course'], {})
    if cm.get('exam') == 'mc5' and q['id'] not in card_of:
        nocard.append(q['id'])
print(f'卡片 {len(SU["units"])} 張；題目 {len(rows)} 題；答案在卡片內容裡找得到 {len(rows) - len(miss)} 題、找不到 {len(miss)} 題（對錯題一律算找不到，要人工看）；沒有卡的題目 {len(nocard)} 題')
if '--list' in sys.argv:
    for qid, uid, ok in rows:
        print(('OK  ' if ok else '--  ') + qid + '\t' + uid)
if nocard:
    print('沒有卡的題目：' + ', '.join(nocard))
    sys.exit(1)
