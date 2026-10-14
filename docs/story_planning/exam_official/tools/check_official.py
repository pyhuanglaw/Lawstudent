# -*- coding: utf-8 -*-
"""檢查正式題庫（大一～大三）。
用法：python3 check_official.py [QBANK 路徑]          # 檢查
      python3 check_official.py --sync [QBANK 路徑]   # 先照實際題數更新 course_bank_map.json 大一～大三各課的 confirmed／status，再檢查
"""
import json, glob, os, re, sys
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
m = json.load(open(os.path.join(root, 'course_bank_map.json'), encoding='utf-8'))
current = {c['course']: c for c in m['courses']}
deleted = set(m['deletedCourses'])
err, warn = [], []
count = {}
seen = {}
for f in sorted(glob.glob(os.path.join(root, '*.json'))):
    if f.endswith('course_bank_map.json'):
        continue
    d = json.load(open(f, encoding='utf-8'))
    for q in d['questions']:
        tag = f"{os.path.basename(f)}:{q['id']}"
        c = q['course']
        if c in deleted: err.append(f'{tag}：課程 {c} 已刪除')
        if c not in current: err.append(f'{tag}：課程 {c} 不在現行課表')
        elif current[c]['term'] != q['term']: err.append(f'{tag}：學期 {q["term"]} 和課表 {current[c]["term"]} 不同')
        if c in current and current[c]['term'].startswith('Y4'): err.append(f'{tag}：大四的題目不放這裡（放 exam_y4/）')
        if q.get('status') != 'USER_CONFIRMED': err.append(f'{tag}：狀態不是 USER_CONFIRMED')
        if q['type'] == 'mc':
            if sorted(q['options']) != ['A', 'B', 'C', 'D']: err.append(f'{tag}：不是四個選項 A～D')
            if q['answer'] not in q['options']: err.append(f'{tag}：答案不在選項裡')
            if len(set(q['options'].values())) != 4: err.append(f'{tag}：選項重複')
        elif q['type'] == 'tf':
            if q['answer'] not in ('對', '錯'): err.append(f'{tag}：是非題答案不是對／錯')
        else: err.append(f'{tag}：題型 {q["type"]}')
        key = (c, re.sub(r'\s', '', q['q']))
        if key in seen: err.append(f'{tag}：和 {seen[key]} 題幹相同（重複）')
        seen[key] = tag
        if not (1 <= int(q['scopeWeek']) <= 18): err.append(f'{tag}：scopeWeek 超出 1～18')
        for fl in q.get('flags', []): warn.append(f'{tag}：{fl}')
        # basis（法條）是 AA／BB 為了對週次標的，不是使用者給的；遊戲不能顯示。USER_CONFIRMED 的題目只能用 mapBasis（2026-10-14；BB 已改名，改成錯誤）
        if q.get('basis'): err.append(f'{tag}：USER_CONFIRMED 不能有 basis（AI 標的法條會被遊戲顯示），請改名 mapBasis')
        count[c] = count.get(c, 0) + 1
args = [a for a in sys.argv[1:] if a != '--sync']
qpath = args[0] if args else os.path.join(root, '..', '..', '..', 'src', 'data', 'legal_qbank.js')
if os.path.exists(qpath):
    src = open(qpath, encoding='utf-8').read()
    n = len(re.findall(r'"id":\s*"Q\d{3}"', src))
    count['crimpro'] = count.get('crimpro', 0) + n
else:
    warn.append(f'找不到 QBANK（{qpath}），刑訴的題數沒算')
if '--sync' in sys.argv:
    if not os.path.exists(qpath):
        sys.exit('找不到 QBANK，不能 --sync（刑訴的題數會算錯）')
    for e in m['courses']:
        if e['exam'] == 'mc5' and not e['term'].startswith('Y4'):
            e['confirmed'] = count.get(e['course'], 0)
            e['status'] = 'ENABLED' if e['confirmed'] >= 5 else 'INSUFFICIENT'
    open(os.path.join(root, 'course_bank_map.json'), 'w', encoding='utf-8').write(json.dumps(m, ensure_ascii=False, indent=1) + '\n')
    current = {c['course']: c for c in m['courses']}
for c, e in current.items():
    if e['exam'] != 'mc5' or c in ('',) or e['term'].startswith('Y4'):
        continue
    n = count.get(c, 0)
    want = 'ENABLED' if n >= 5 else 'INSUFFICIENT'
    if e['status'] != want or e['confirmed'] != n:
        err.append(f'course_bank_map：{c} 寫 {e["status"]}／{e["confirmed"]}，實際 {n} 題 → {want}')
print('== 題數（大一～大三）')
for c, e in current.items():
    if not e['term'].startswith('Y4'):
        print(f"  {e['term']} {c:14s} {count.get(c, 0):3d} 題  {e['status']}")
print(f'== 回報使用者的問題：{len(warn)}')
for w in warn: print('  - ' + w)
print(f'== 錯誤：{len(err)}')
for x in err: print('  ! ' + x)
sys.exit(1 if err else 0)
