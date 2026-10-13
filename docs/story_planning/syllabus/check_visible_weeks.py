"""企劃用的檢查工具（AA，2026-10-13）：哪些課堂週，玩家在遊戲裡看不到。

照開發分支 src/data/calendar.js（LAWWW）的放假規則推算：國定假日、週六提前到週五、週日延到週一、春節補假、兒童節與清明。
實際放假以人事行政總處公告為準（需查證）；遊戲照 calendar.js。

用法（在 docs/story_planning 底下）：python3 syllabus/check_visible_weeks.py
印出：B、C 類或特殊週落在看不到的週（要移）；以及每門課看不到的週數。
大一上第 1～2 週快速帶過，也算看不到；兩格的課，兩格都放假才算看不到（AA_110 5-6）。
不會改任何檔案。
"""
import datetime as dt, glob, json, os
D = dt.timedelta(days=1)
TERMS = {'Y0S1': '2024-09-02', 'Y0S2': '2025-02-17', 'Y1S1': '2025-09-01', 'Y1S2': '2026-02-23', 'Y2S1': '2026-09-07',
         'Y2S2': '2027-02-22', 'Y3S1': '2027-09-06', 'Y3S2': '2028-02-14', 'Y4S1': '2028-09-04', 'Y4S2': '2029-02-19'}
LUNAR = {2024: ('2024-02-10', '2024-06-10', '2024-09-17', '2024-04-04'), 2025: ('2025-01-29', '2025-05-31', '2025-10-06', '2025-04-04'),
         2026: ('2026-02-17', '2026-06-19', '2026-09-25', '2026-04-05'), 2027: ('2027-02-06', '2027-06-09', '2027-09-15', '2027-04-05'),
         2028: ('2028-01-26', '2028-05-28', '2028-10-03', '2028-04-04'), 2029: ('2029-02-13', '2029-06-16', '2029-09-22', '2029-04-04')}
P = dt.date.fromisoformat
_cache = {}


def holidays(y):
    if y in _cache:
        return _cache[y]
    H = {}

    def add(d, n):
        H.setdefault(d, n)

    def off(d):
        return d.isoweekday() >= 6 or d in H
    for m, dd, n in [(1, 1, '開國紀念日'), (2, 28, '和平紀念日'), (5, 1, '勞動節'), (9, 28, '教師節'), (10, 10, '國慶日'), (10, 25, '臺灣光復節'), (12, 25, '行憲紀念日')]:
        add(dt.date(y, m, dd), n)
    spring = []
    if y in LUNAR:
        cny, dragon, moon, qm = map(P, LUNAR[y])
        spring = [(cny - 2 * D, '除夕前一日'), (cny - D, '除夕'), (cny, '春節'), (cny + D, '春節'), (cny + 2 * D, '春節')]
        for d, n in spring:
            add(d, n)
        kid = dt.date(y, 4, 4)
        if kid == qm:
            add(kid + D if kid.isoweekday() == 4 else kid - D, '兒童節')
            add(qm, '民族掃墓節')
        else:
            add(kid, '兒童節')
            add(qm, '民族掃墓節')
        add(dragon, '端午節')
        add(moon, '中秋節')
    sdays = [d for d, _ in spring]
    for d in sorted(H):
        if d in sdays or '補假' in H[d]:
            continue
        if d.isoweekday() == 6:
            s = d - D
            while s in H:
                s -= D
            add(s, H[d] + '（補假）')
        elif d.isoweekday() == 7:
            s = d + D
            while off(s):
                s += D
            add(s, H[d] + '（補假）')
    if spring:
        last = spring[-1][0]
        for d, _ in spring:
            if d.isoweekday() >= 6:
                s = last + D
                while off(s):
                    s += D
                add(s, '春節（補假）')
                last = s
    _cache[y] = H
    return H


def holiday(d):
    return holidays(d.year).get(d) or holidays(d.year + 1).get(d)


def date_of(term, week, wd):
    return P(TERMS[term]) + dt.timedelta(days=(week - 1) * 7 + (wd - 1))


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    problems, counts = [], []
    for f in sorted(glob.glob(os.path.join(here, '*.json'))):
        d = json.load(open(f, encoding='utf-8'))
        cs = d['courses']
        items = cs.items() if isinstance(cs, dict) else [(c.get('id'), c) for c in cs]
        for k, c in items:
            t = c.get('term', d.get('term'))
            if t not in TERMS:
                continue
            specials = {sp['w'] for sp in c.get('special', []) if isinstance(sp, dict) and 'w' in sp}
            hidden = []
            for s in c['syllabus']:
                w = s['w']
                if t == 'Y1S1' and w <= 2:
                    hidden.append((w, '快速帶過', s.get('tpl')))
                    continue
                hol = [holiday(date_of(t, w, sl['wd'])) for sl in c['slots']]
                if all(hol):
                    hidden.append((w, '／'.join(hol), s.get('tpl')))
            for w, why, tpl in hidden:
                if tpl in ('B', 'C') or w in specials:
                    problems.append(f'{t} {k} 第{w}週 {tpl}{"（特殊）" if w in specials else ""} ← {why}')
            if hidden:
                counts.append(f'{t} {k}：' + '、'.join(f'第{w}週（{why}）' for w, why, _ in hidden))
    print('== B、C 或特殊週落在看不到的週（要移）==')
    print('\n'.join(problems) or '（沒有）')
    print('\n== 每門課看不到的週 ==')
    print('\n'.join(counts))


if __name__ == '__main__':
    main()
