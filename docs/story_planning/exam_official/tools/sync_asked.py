# -*- coding: utf-8 -*-
"""把課堂提問（syllabus 每週的 `ask: {qid}`）同步成題目的 `askedIn`。作者：BB（2026-10-14）。

用法：python3 sync_asked.py          # 照 syllabus/*.json 寫入 exam_official/*.json 的 askedIn
      python3 sync_asked.py --check  # 只檢查，不寫（兩邊不一致就失敗）

- 唯一的來源是 syllabus（`_src/<學期>.py` 的 `ask='<qid>'`，`build.py` 產生 JSON）；題目檔的 `askedIn` 只由這支工具寫，不要手改。
- `askedIn` = {"term": 學期, "course": 課程 id, "week": 第幾週}：這一題在那門課那一週的課堂上問過（AA_126 1-5 A、AA_130 §3：期末考先抽課堂題）。
- 只動 `askedIn` 這一個欄位；題幹、選項、答案、考點、解析一字不動。重新跑 convert_answer_only.py 以後要再跑這支。
"""
import json, os, sys, glob, collections

here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
syl = os.path.join(root, '..', 'syllabus')

asks, err = {}, []
for f in sorted(glob.glob(os.path.join(syl, '*.json'))):
    d = json.load(open(f, encoding='utf-8'))
    for c in d['courses']:
        for w in c['syllabus']:
            qids = ([w['ask']['qid']] if w.get('ask') else []) + ([w['obs']['disc']['qid']] if (w.get('obs') or {}).get('disc') else [])   # 課堂提問＋討論課題目（obs.disc，2026-10-15）
            for qid in qids:
                if qid in asks: err.append(f"{qid} 在兩個地方問：{asks[qid]} 和 {d['term']} {c['id']} 第 {w['w']} 週")
                asks[qid] = {'term': d['term'], 'course': c['id'], 'week': w['w']}

found, changed, per = set(), [], collections.Counter()
total = collections.Counter()
for f in sorted(glob.glob(os.path.join(root, '*.json'))):
    if f.endswith('course_bank_map.json'):
        continue
    d = json.load(open(f, encoding='utf-8'))
    dirty = False
    for i, q in enumerate(d['questions']):
        total[(q['term'], q['course'])] += 1
        want = asks.get(q['id'])
        if want:
            found.add(q['id']); per[(q['term'], q['course'])] += 1
            if want['term'] != q['term'] or want['course'] != q['course']:
                err.append(f"{q['id']}：題目是 {q['term']} {q['course']}，卻排在 {want['term']} {want['course']}")
            if want['week'] < int(q['scopeWeek']):
                err.append(f"{q['id']}：第 {want['week']} 週問，範圍卻到第 {q['scopeWeek']} 週")
        if q.get('askedIn') != want:
            changed.append(f"{os.path.basename(f)}:{q['id']} {q.get('askedIn')} → {want}")
            nq = {}
            for k, v in q.items():
                if k == 'askedIn':
                    continue
                nq[k] = v
                if k == 'scopeWeek' and want:
                    nq['askedIn'] = want
            d['questions'][i] = nq; dirty = True
    if dirty and '--check' not in sys.argv:
        with open(f, 'w', encoding='utf-8') as fh:
            json.dump(d, fh, ensure_ascii=False, indent=1)
for qid in sorted(set(asks) - found):
    err.append(f'{qid}：syllabus 有課堂提問，題庫裡找不到')

print(f'== 課堂提問：{len(asks)} 題')
for k in sorted(per):
    print(f'  {k[0]} {k[1]:14s} 課堂 {per[k]} 題／這門課共 {total[k]} 題')
if changed:
    print(('== 不一致（--check 不寫）：' if '--check' in sys.argv else '== 更新：') + str(len(changed)))
    for x in changed[:20]: print('  ' + x)
    if len(changed) > 20: print(f'  ……另外 {len(changed) - 20} 筆')
print(f'== 錯誤：{len(err)}')
for x in err: print('  ! ' + x)
sys.exit(1 if err or (changed and '--check' in sys.argv) else 0)
