# -*- coding: utf-8 -*-
"""大四期末考題庫的共用檢查（AA_<課程>.json、BB_<課程>.json 一起檢查）。

用法：python3 check_y4.py          # 檢查
      python3 check_y4.py --sync   # 先照實際的題庫檔更新 course_bank_map.json 大四各課的 sources／題數／crossReviewed／status，再檢查
規則（AA_126 1-5 B、AA_130 3-2）：
  - author：AA／BB；status：Y4_SELF_REVIEWED（作者自審完，還不抽）→ Y4_CROSS_REVIEWED（對方交叉審通過，才抽）；
    Y4_CROSS_REVIEWED 的題目要有 crossReviewedBy，而且不是作者自己。
  - 四選一 A～D、選項不重複、答案在選項裡；basis（法條）不能空。
  - 課程是現行大四的課（course_bank_map.json），學期相符。
  - 題號不重複；題幹不重複（不分檔）。
  - 每門課（AA、BB 合併）的答案分布：最多和最少的差不超過 2；每個檔沒有連續三題同一個答案。
  - 不出現判決字號、大法官解釋、憲法法庭判決字號（AA_126 1-5 B：不捏造、不引用）。
  - course_bank_map 的大四：crossReviewed＝實際交叉審通過的題數；status＝ENABLED（≥5）或 WAITING_CROSS_REVIEW。
另外列出同一門課 AA、BB 引用同一條文的題目，給交叉審時判斷是不是重複考點（只提示，不算錯）。
"""
import glob, json, os, re, sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
MAP = os.path.join(ROOT, '..', 'exam_official', 'course_bank_map.json')
STATUSES = {'Y4_SELF_REVIEWED', 'Y4_CROSS_REVIEWED'}
CASE_NO = re.compile(r'(\d+\s*年度?\s*\S{0,4}字第?\s*\d+\s*號|台上字|臺上字|憲判字|釋字|大法官解釋|判例)')

def norm(s):
    return re.sub(r'[\s，。、；：「」（）()]', '', s)

def arts(basis):
    """'海商法 §6、§8、§9；民法 §767' → {('海商法','6'),...}（只用來找可能重複的考點）"""
    out = set()
    for part in re.split(r'[；;]', basis):
        m = re.match(r'\s*([^§\s]+)\s*(.*)', part)
        if not m: continue
        law = m.group(1)
        for n in re.findall(r'§\s*(\d+(?:-\d+)?)', m.group(2)):
            out.add((law, n))
    return out

def sync():
    cmap = json.load(open(MAP, encoding='utf-8'))
    files = defaultdict(list)
    for f in sorted(glob.glob(os.path.join(ROOT, '*.json'))):
        name = os.path.basename(f)
        if name.startswith('basis_'): continue
        d = json.load(open(f, encoding='utf-8'))
        files[d['course']].append((name, d['questions']))
    for e in cmap['courses']:
        if not e['term'].startswith('Y4') or e.get('exam') != 'mc5': continue
        fs = files.get(e['course'], [])
        e['sources'] = []
        for name, qs in fs:
            a = name.split('_', 1)[0]; other = 'BB' if a == 'AA' else 'AA'
            x = sum(1 for q in qs if q.get('status') == 'Y4_CROSS_REVIEWED')
            e['sources'].append(f'exam_y4/{name}（{a} 寫，{len(qs)} 題；{other} 交叉審通過 {x} 題）')
        e['selfReviewed'] = sum(len(qs) for _, qs in fs)
        e['crossReviewed'] = sum(1 for _, qs in fs for q in qs if q.get('status') == 'Y4_CROSS_REVIEWED')
        e['status'] = 'ENABLED' if e['crossReviewed'] >= 5 else 'WAITING_CROSS_REVIEW'
    open(MAP, 'w', encoding='utf-8').write(json.dumps(cmap, ensure_ascii=False, indent=1) + '\n')

def main():
    if '--sync' in sys.argv: sync()
    cmap = json.load(open(MAP, encoding='utf-8'))
    y4 = {c['course']: c for c in cmap['courses'] if c['term'].startswith('Y4')}
    deleted = set(cmap['deletedCourses'])
    err, note = [], []
    ids, texts = {}, {}
    per_course = defaultdict(list)
    for f in sorted(glob.glob(os.path.join(ROOT, '*.json'))):
        name = os.path.basename(f)
        if name.startswith('basis_'): continue
        d = json.load(open(f, encoding='utf-8'))
        qs = d['questions']
        author_by_name = name.split('_', 1)[0]
        if author_by_name not in ('AA', 'BB'): err.append(f'{name}：檔名要是 AA_<課程>.json 或 BB_<課程>.json')
        for q in qs:
            t = f"{name}:{q.get('id')}"
            for k in ('id', 'course', 'term', 'scopeWeek', 'type', 'q', 'options', 'answer', 'basis', 'author', 'status'):
                if q.get(k) in (None, '', [], {}): err.append(f'{t}：缺 {k}')
            c = q.get('course')
            if c in deleted: err.append(f'{t}：課程 {c} 已刪除')
            if c not in y4: err.append(f'{t}：{c} 不是現行大四的課')
            elif y4[c]['term'] != q.get('term'): err.append(f'{t}：學期 {q.get("term")} 和課表 {y4[c]["term"]} 不同')
            if q.get('author') != author_by_name: err.append(f'{t}：author {q.get("author")} 和檔名不同')
            if q.get('type') != 'mc': err.append(f'{t}：大四只出四選一（type 要是 mc）')
            o = q.get('options') or {}
            if sorted(o) != ['A', 'B', 'C', 'D']: err.append(f'{t}：不是四個選項 A～D')
            if len({norm(v) for v in o.values()}) != len(o): err.append(f'{t}：選項重複')
            if any(not str(v).strip() for v in o.values()): err.append(f'{t}：有空白選項')
            if q.get('answer') not in o: err.append(f'{t}：答案不在選項裡')
            st = q.get('status')
            if st not in STATUSES: err.append(f'{t}：status {st} 不是 {"／".join(sorted(STATUSES))}')
            if st == 'Y4_CROSS_REVIEWED' and q.get('crossReviewedBy') in (None, '', q.get('author')):
                err.append(f'{t}：交叉審通過要寫 crossReviewedBy（而且不是作者自己）')
            if not (1 <= int(q.get('scopeWeek') or 0) <= 18): err.append(f'{t}：scopeWeek 超出 1～18')
            blob = ' '.join([q.get('q', ''), *map(str, o.values()), q.get('core', ''), q.get('explanation', '')])
            for m in CASE_NO.findall(blob): err.append(f'{t}：出現判決字號或解釋「{m}」（不得引用）')
            if q.get('id') in ids: err.append(f'{t}：題號和 {ids[q["id"]]} 重複')
            ids[q.get('id')] = t
            k = norm(q.get('q', ''))
            if k in texts: err.append(f'{t}：題幹和 {texts[k]} 相同')
            texts[k] = t
            per_course[c].append((name, q))
        seq = ''.join(q.get('answer', '?') for q in qs)
        if re.search(r'(.)\1\1', seq): err.append(f'{name}：連續三題同一個答案（{seq}）')
    print('== 大四各課（只有 Y4_CROSS_REVIEWED 會被抽）')
    for c, e in y4.items():
        if e.get('exam') != 'mc5':
            print(f"  {e['term']} {c:20s} 不考選擇題（{e.get('exam')}）"); continue
        items = per_course.get(c, [])
        by_a = Counter(q['author'] for _, q in items)
        cross = sum(1 for _, q in items if q.get('status') == 'Y4_CROSS_REVIEWED')
        want = 'ENABLED' if cross >= 5 else 'WAITING_CROSS_REVIEW'
        cnt = Counter(q.get('answer') for _, q in items)
        vals = [cnt.get(x, 0) for x in 'ABCD']
        if items and max(vals) - min(vals) > 2: err.append(f'{c}：合併以後答案分布 A{vals[0]} B{vals[1]} C{vals[2]} D{vals[3]}（差超過 2）')
        print(f"  {e['term']} {c:20s} AA {by_a.get('AA', 0):2d}、BB {by_a.get('BB', 0):2d}；答案 A{vals[0]} B{vals[1]} C{vals[2]} D{vals[3]}；交叉審通過 {cross:2d} → {want}")
        if e.get('status') != want or e.get('crossReviewed') != cross:
            err.append(f"course_bank_map：{c} 寫 {e.get('status')}／crossReviewed {e.get('crossReviewed')}，實際 {cross} → {want}")
        aa = [(n, q) for n, q in items if q['author'] == 'AA']; bb = [(n, q) for n, q in items if q['author'] == 'BB']
        for _, qa in aa:
            for _, qb in bb:
                both = arts(qa['basis']) & arts(qb['basis'])
                if both:
                    note.append(f"{c}：{qa['id']} 和 {qb['id']} 都考 " + '、'.join(f'{l}§{n}' for l, n in sorted(both)))
    print(f'== 交叉審參考：同一門課 AA、BB 引用同一條文（{len(note)} 組，可能是重複考點）')
    for x in note: print('  - ' + x)
    print(f'== 錯誤：{len(err)}')
    for x in err: print('  ! ' + x)
    sys.exit(1 if err else 0)

if __name__ == '__main__':
    main()
