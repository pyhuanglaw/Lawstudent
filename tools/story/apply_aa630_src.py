#!/usr/bin/env python3
"""AA_630（語彤台詞改寫，白名單 bb4401fd3）＋AA_627（語彤舊設定清查，表 A）的手寫 src 檔一次改好（YT-REWRITE-1103）。
- AA_630 位置是 `src/…:行` 的列（第 3～7 節：動態、圈子表、節日、打烊後的那一桌、AA 決定 180 列）＋D-216（AA_359 兩天一夜的蛋餅，遊戲在 src/date3d.js）。
- AA_627 表 A（`src/…`，【改句】【換字】）：AA_630 沒有同一列（第 7 節的「Z-xxx（A-xxx）」、同檔同原句）的，照「建議改成」換（AA_630 開頭：「AA_627 表上標【改句】【換字】【刪】的其他列，照 AA_627 的建議做」）。
- 找法：原句在那個檔剛好一處＝換；好幾處＝挑離表上行號最近的那一處；找不到但「改成」已經在＝跳過（改過了）；都不是＝列出來人工看。
- 整段換、刪整則、（刪）、（不改）的列不自動做，列出來（手改；見 commit 說明）。
用法：python3 tools/story/apply_aa630_src.py [--apply]（不加＝空跑，只列分類）"""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as G
import aa630
ALLOW = G.load(ROOT)
R = aa630.load(ROOT, ALLOW, G)
P627 = 'docs/story_planning/AA_627_語彤舊設定清查.md'
A627 = G.approved_files(ALLOW, P627)
md627 = G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{A627[P627]}:{P627}'], text=True)) if A627 else ''
APPLY = '--apply' in sys.argv


def rows627(md):
    out = []
    for line in md.split('\n'):
        m = re.match(r'\|\s*(A-\d{3})\s*\|', line)
        if not m: continue
        c = aa630.cells(line)
        if len(c) < 6: continue
        path, q = c[1].strip('`').split(':', 1) if ':' in c[1] else (c[1].strip('`'), '0')
        tag = re.match(r'【([^】]+)】', c[5]); out.append({'no': c[0], 'file': path, 'at': q, 'who': c[2], 'orig': c[3], 'new': c[4], 'note': c[5], 'tag': tag.group(1) if tag else ''})
    return out


jobs, manual = [], []
seen627 = set()
for r in R['rows']:
    f = r['file']
    if f.endswith('AA_359_兩天一夜的約會_住宿那一段.md'): f = 'src/date3d.js'
    if not f.startswith('src/'): continue
    m = re.search(r'（(A-\d{3})）', r['no'])
    if m: seen627.add(m.group(1))
    jobs.append({'src': 'AA_630 ' + r['no'], 'file': f, 'at': r['at'], 'orig': r['orig'], 'new': r['new'], 'note': r['note']})
for r in rows627(md627):
    if not r['file'].startswith('src/'): continue
    if r['no'] in seen627 or r['no'] in ('A-263', 'A-264'): continue   # A-263：那一場在燒臘店（送小菜的是燒臘店的阿姨），不換
    if any(j['file'] == r['file'] and j['orig'] == r['orig'] for j in jobs): continue
    if r['tag'] not in ('改句', '換字'):
        if r['tag'] != 'AA 決定': manual.append(('AA_627 ' + r['no'], r['file'], r['at'], r['orig'], r['new'], '【' + r['tag'] + '】'))
        continue
    jobs.append({'src': 'AA_627 ' + r['no'], 'file': r['file'], 'at': r['at'], 'orig': r['orig'], 'new': r['new'], 'note': r['note']})

texts = {}
def T(f):
    if f not in texts:
        p = os.path.join(ROOT, f); texts[f] = open(p, encoding='utf8').read() if os.path.exists(p) else None
    return texts[f]


def strip(s):
    s = s.strip()
    if s.startswith('`') and s.endswith('`'): s = s[1:-1]
    return s


done, already, miss, covered = [], [], [], []
for j in jobs:
    new = strip(j['new']); orig = strip(j['orig'])
    if new.startswith('（不改）') or new == orig:
        continue
    if re.match(r'^（(刪|這一整段刪|照片：)', new) and not new.startswith('（照片：') or new.startswith('整段換成') or '見表下' in new:
        manual.append((j['src'], j['file'], j['at'], orig, new, '整段／刪')); continue
    t = T(j['file'])
    if t is None: manual.append((j['src'], j['file'], j['at'], orig, new, '檔案不存在')); continue
    n = t.count(orig)
    if n == 0 and j['src'].startswith('AA_630') and orig.startswith('「') and orig.endswith('」') and orig[1:-1] in t:   # D-216：表上寫的是稿裡的「」，遊戲裡沒有引號
        orig, new = orig[1:-1], new.strip('「」'); n = t.count(orig)
    if n == 0:
        if new in t: already.append(j['src'])
        elif j['src'].startswith('AA_627') and any(k['src'].startswith('AA_630') and k['file'] == j['file'] and (orig in k['orig'] or k['orig'] in orig) for k in jobs): covered.append(j['src'])
        else: miss.append((j['src'], j['file'], j['at'], orig, new, '找不到原句'))
        continue
    if n > 1:
        try: ln = int(re.match(r'\d+', j['at']).group(0))
        except Exception: ln = None
        idxs = [m.start() for m in re.finditer(re.escape(orig), t)]
        if ln is None: manual.append((j['src'], j['file'], j['at'], orig, new, f'原句 {n} 處')); continue
        lines_of = [t.count('\n', 0, i) + 1 for i in idxs]
        k = min(range(n), key=lambda i: abs(lines_of[i] - ln))
        i = idxs[k]; texts[j['file']] = t[:i] + new + t[i + len(orig):]
    else:
        texts[j['file']] = t.replace(orig, new, 1)
    done.append(j['src'])
print(f'工作 {len(jobs)} 列：換了 {len(done)}、已經是新句 {len(already)}、AA_630 同一句已經換掉 {len(covered)}、找不到 {len(miss)}、人工 {len(manual)}')
for x in miss: print('  找不到', x[0], x[1], x[2], '|', x[3][:50], '→', x[4][:50])
for x in manual: print('  人工', x[0], x[1], x[2], x[5], '|', x[3][:50], '→', x[4][:60])
if APPLY:
    for f, t in texts.items():
        if t is not None and t != open(os.path.join(ROOT, f), encoding='utf8').read():
            open(os.path.join(ROOT, f), 'w', encoding='utf8').write(t)
    print('寫入', sum(1 for f, t in texts.items() if t is not None))
