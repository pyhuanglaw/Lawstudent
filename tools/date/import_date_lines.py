"""校外約會預約系統的句子與交通偏好（DATE-S6；AA_128 4-1、4-3）→ src/data/date_lines.js。
**只匯入 docs/handoff/story_import_allow.json 逐檔列出、status approved 的版本**（不從分支最新讀）。句子一字不改，只從表格拆出來：
  - BB_128 3-7（BB 五位）、AA_127 第 8 節（以安、語彤）：答應、答應（和她交往中）、改時間、同一行程改到第三次、改交通；
  - BB_128 3-6「不分地點的句子」：取消、放鴿子兩欄（BB 五位）；AA_127 1-7、2-7：取消、30 天內第二次取消兩列（以安、語彤）；
  - date_prefs_bb.json＋date_prefs_aa.json 合併（why 欄不進遊戲）；
  - 各地點的台詞 date_system/lines/Dxx.json（白名單逐檔列的才讀；BB_128 2-9 的格式，原樣放進 DATE_LINES.loc）；BB 五位 3-6 的出發、差不多了、一個都沒做就走、合照還不行。
格子裡「／」分開的是輪流用的幾句；同一句裡有好幾個「」＝連發幾則訊息（例：「好。」「我跟阿姨說那天不顧店。」）。「」以外的說明不進遊戲。
用法：python3 tools/date/import_date_lines.py [--check 企劃線ref]"""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as G
ALLOW = G.load(ROOT)
SP = 'docs/story_planning/'
FILES = {'bb': SP + 'BB_128_校外單獨約會_心願地點與淡水示範規格.md', 'aa': SP + 'AA_127_以安語彤_心願約會與邀約變化.md',
         'pbb': SP + 'date_system/date_prefs_bb.json', 'paa': SP + 'date_system/date_prefs_aa.json'}
APPROVED = G.approved_files(ALLOW, SP)
for p in FILES.values():
    ok, why = G.allowed(p, APPROVED.get(p, ''), ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
if '--check' in sys.argv:
    ref = sys.argv[sys.argv.index('--check') + 1]
    for p in FILES.values():
        same = subprocess.run(['git', '-C', ROOT, 'diff', '--quiet', APPROVED[p], ref, '--', p]).returncode == 0
        print(('一樣：' if same else f'分支上的版本和白名單（{APPROVED[p]}）不同、不會匯入：') + p)
    sys.exit(0)
show = lambda p: subprocess.check_output(['git', '-C', ROOT, 'show', f'{APPROVED[p]}:{p}'], text=True)
NAME = {'芷若': 'heroine_02', '子晴': 'heroine_04', '學姊': 'heroine_05', '沛珊': 'classmate_peishan', '可昕': 'kexin', '以安': 'heroine_01', '語彤': 'heroine_03'}


def section(md, head):
    """從 head 那一行到下一個同級以上的標題"""
    i = md.index(head); lv = len(head) - len(head.lstrip('#'))
    m = re.search(r'\n#{1,%d} ' % lv, md[i + len(head):])
    return md[i:i + len(head) + (m.start() if m else len(md))]


def rows(sec):
    out = []
    for ln in sec.splitlines():
        if not ln.startswith('|') or set(ln.replace('|', '').strip()) <= set('-: '):
            continue
        out.append([c.strip() for c in ln.strip().strip('|').split('|')])
    return out


def alts(cell):
    """「／」分開的幾句（只在「」外面的／分）；每一句＝裡面所有「」的內容（一個以上＝連發）"""
    parts, depth, cur = [], 0, ''
    for ch in cell:
        if ch == '「': depth += 1
        elif ch == '」': depth -= 1
        if ch == '／' and depth == 0:
            parts.append(cur); cur = ''
        else:
            cur += ch
    parts.append(cur)
    res = []
    for p in parts:
        q = re.findall(r'「((?:[^「」]|「[^「」]*」)*)」', p)
        if q:
            res.append(q if len(q) > 1 else q[0])
    return res


L = {}
KEYS = ['accept', 'acceptDating', 'move', 'move3', 'transport']
for src, head in [('bb', '### 3-7. '), ('aa', '## 8. 預約系統的句子')]:
    md = show(FILES[src]); sec = section(md, next(l for l in md.splitlines() if l.startswith(head)))
    for r in rows(sec)[1:]:
        who = NAME.get(r[0])
        if not who:
            continue
        for k, c in zip(KEYS, r[1:6]):
            L.setdefault(who, {})[k] = alts(c)
# BB 五位：3-6 不分地點的句子，取消（第 4 欄）、放鴿子（第 5 欄）
md = show(FILES['bb']); sec = section(md, next(l for l in md.splitlines() if l.startswith('### 3-6. ')))
for r in rows(sec):
    who = NAME.get(r[0])
    if who and len(r) >= 7:
        L.setdefault(who, {})['cancel'] = alts(r[3]); L[who]['flaked'] = alts(r[4])
        for k, c in (('depart', r[1]), ('enough', r[2]), ('leaveEarly', r[5]), ('noPair', r[6])):   # 出發訊息、差不多了、一個都沒做就走、合照還不行（BB 五位；以安、語彤還沒有＝不說）
            a = alts(c)
            if a: L[who][k] = a
# 以安、語彤：1-7、2-7 的取消、30 天內第二次取消
md = show(FILES['aa'])
for head, who in [('### 1-7. ', 'heroine_01'), ('### 2-7. ', 'heroine_03')]:
    sec = section(md, next(l for l in md.splitlines() if l.startswith(head)))
    for r in rows(sec):
        if r[0].startswith('取消'): L.setdefault(who, {})['cancel'] = alts(r[1])
        elif r[0].startswith('30 天內第二次取消'): L.setdefault(who, {})['flaked'] = alts(r[1])
prefs = {}
for k in ('pbb', 'paa'):
    for who, m in json.loads(show(FILES[k])).items():
        if who.startswith('_'):
            continue
        prefs[who] = {loc: {'transport': v['transport']} for loc, v in m.items()}
# 各地點的台詞（lines/Dxx.json；白名單逐檔列的才讀）：互動點名稱、她喜不喜歡、不太喜歡時的一句、抵達／互動點／收尾的句子
LOC = {}
for p in sorted(APPROVED):
    m = re.match(r'docs/story_planning/date_system/lines/(D\d\d)\.json$', p)
    if not m:
        continue
    ok, why = G.allowed(p, APPROVED[p], ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    d = json.loads(show(p)); LOC[m.group(1)] = {k: d[k] for k in ('points', 'likes', 'dislikeLine', 'lines') if k in d}
    FILES['loc_' + m.group(1)] = p
bad = [(w, k) for w in NAME.values() for k in KEYS + ['cancel', 'flaked'] if not (L.get(w) or {}).get(k)]
if bad:
    sys.exit('拆不出來（表格格式變了？）：' + json.dumps(bad, ensure_ascii=False))
out = {'source': '白名單 ' + '＋'.join(f'{os.path.basename(p)}@{APPROVED[p]}' for p in FILES.values()), 'lines': L, 'prefs': prefs, 'loc': LOC}
dst = os.path.join(ROOT, 'src', 'data', 'date_lines.js')
with open(dst, 'w', encoding='utf8') as fo:
    fo.write('/* 校外約會預約系統的句子與交通偏好（DATE-S6；AA_128 4-1、4-3；BB_128 3-6、3-7、AA_127 1-7、2-7、第 8 節、date_prefs_*.json）。'
             '產生器：tools/date/import_date_lines.py（不要手改）。來源：' + out['source'] + ' */\n')
    fo.write("'use strict';\nconst DATE_LINES=" + json.dumps(out, ensure_ascii=False) + ';\n')
print('wrote', dst, {w: {k: len(v) for k, v in m.items()} for w, m in L.items()}, '偏好', {w: len(m) for w, m in prefs.items()}, '地點', sorted(LOC))
