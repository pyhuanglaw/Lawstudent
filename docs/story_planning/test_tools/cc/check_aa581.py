#!/usr/bin/env python3
"""AA_581（期中考殘留台詞逐句改稿）對 src 逐句比對。可重跑。
用法：python3 check_aa581.py [--wt <worktree>] [--doc <AA_581.md>] [--out report.md]
預設：wt＝scratchpad/wt_n1102；doc＝同資料夾 AA_581.md（git show 454218182:docs/story_planning/AA_581_*.md）。
比對單位：src/**/*.js 裡每個 JS 字串字面值（'…' "…" `…`，跳脫已還原）；比對是「字面值包含這一句」（子字串，逐字、全半形、標點、空白都算）。
"""
import os, re, sys, argparse, difflib, collections

HERE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
ap.add_argument('--wt', default=os.path.join(os.path.dirname(HERE), 'wt_n1102'))
ap.add_argument('--doc', default=os.path.join(HERE, 'AA_581.md'))
ap.add_argument('--out', default=os.path.join(HERE, 'report.md'))
A = ap.parse_args()
SRC = os.path.join(A.wt, 'src')

# ---------- JS 字串字面值抽取 ----------
ESC = {'n': '\n', 't': '\t', 'r': '\r', 'b': '\b', 'f': '\f', 'v': '\v', '0': '\0'}

def unescape(s):
    out, i = [], 0
    while i < len(s):
        c = s[i]
        if c != '\\':
            out.append(c); i += 1; continue
        n = s[i + 1] if i + 1 < len(s) else ''
        if n == 'u':
            if s[i + 2:i + 3] == '{':
                j = s.index('}', i); out.append(chr(int(s[i + 3:j], 16))); i = j + 1
            else:
                cp = int(s[i + 2:i + 6], 16); i += 6
                if 0xD800 <= cp < 0xDC00 and s[i:i + 2] == '\\u':
                    lo = int(s[i + 2:i + 6], 16); cp = 0x10000 + ((cp - 0xD800) << 10) + (lo - 0xDC00); i += 6
                out.append(chr(cp))
        elif n == 'x':
            out.append(chr(int(s[i + 2:i + 4], 16))); i += 4
        elif n == '\n':
            i += 2
        else:
            out.append(ESC.get(n, n)); i += 2
    return ''.join(out)

def literals(text):
    """回傳 [(起始行號, 原始字面, 還原後字串)]；跳過 // 與 /* */ 註解（regex 字面值以簡單規則略過）。"""
    res, i, L, line = [], 0, len(text), 1
    prev_sig = ''
    while i < L:
        c = text[i]
        if c == '\n':
            line += 1; i += 1; continue
        if c == '/' and i + 1 < L and text[i + 1] == '/':
            j = text.find('\n', i); i = L if j < 0 else j; continue
        if c == '/' and i + 1 < L and text[i + 1] == '*':
            j = text.find('*/', i + 2); j = L if j < 0 else j + 2
            line += text.count('\n', i, j); i = j; continue
        if c == '/' and prev_sig in ('', '(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '<', '>', '~', '^'):
            # regex 字面值
            j = i + 1; cls = False
            while j < L and text[j] != '\n':
                if text[j] == '\\': j += 2; continue
                if text[j] == '[': cls = True
                elif text[j] == ']': cls = False
                elif text[j] == '/' and not cls: break
                j += 1
            if j < L and text[j] == '/':
                i = j + 1; prev_sig = 'r'; continue
        if c in '\'"`':
            j, start = i + 1, line
            while j < L and text[j] != c:
                if text[j] == '\\': j += 2; continue
                if text[j] == '\n':
                    if c != '`': break
                j += 1
            raw = text[i + 1:j]
            try: dec = unescape(raw)
            except Exception: dec = raw
            res.append((start, raw, dec))
            line += text.count('\n', i, j); i = j + 1; prev_sig = 's'; continue
        if not c.isspace(): prev_sig = c
        i += 1
    return res

FILES = {}       # relpath -> text
LITS = {}        # relpath -> [(line, raw, dec)]
BYBASE = collections.defaultdict(list)
for root, _, fs in os.walk(SRC):
    for f in fs:
        if not f.endswith('.js'): continue
        p = os.path.join(root, f); rel = os.path.relpath(p, A.wt)
        t = open(p, encoding='utf-8').read()
        FILES[rel] = t; LITS[rel] = literals(t); BYBASE[f].append(rel)

# ---------- 單行 JSON 檔：字串的 JSON 路徑 ----------
import json
JSONF = {'src/data/ladder.js': 3, 'src/data/date_lines.js': 3, 'src/data/syllabus.js': 5}
JPATHS = {}   # rel -> [(path, str)]
for rel, lno in JSONF.items():
    if rel not in FILES: continue
    L = FILES[rel].split('\n')[lno - 1]; o = json.loads(L[L.index('{'):L.rindex('}') + 1])
    acc = []
    def walk(x, pth):
        if isinstance(x, str): acc.append((pth, x))
        elif isinstance(x, dict):
            for k, v in x.items():
                acc.append((pth + '.' + k + '#key', k)); walk(v, pth + '.' + k)
        elif isinstance(x, list):
            for i, v in enumerate(x): walk(v, pth + '.' + str(i) + (('=' + v['id']) if isinstance(v, dict) and isinstance(v.get('id'), str) else ''))
    walk(o, ''); JPATHS[rel] = acc

def jpaths(rel, needle):
    return [p for p, s in JPATHS.get(rel, []) if needle in s]

def norm_path(t):
    return [x for x in re.split(r'[.\[\]\s]+', t) if x]

def path_ok(found, want):
    """稿件寫的路徑片段（依序）是否都出現在找到的路徑裡"""
    f = [x for x in found.replace('#key', '').split('.') if x]; i = 0
    for seg in want:
        while i < len(f) and seg not in f[i].split('='): i += 1
        if i == len(f): return False
        i += 1
    return True

def occ(needle, files=None):
    """needle 在字串字面值裡出現的位置 [(rel, line, 該字面值)]（同一字面值出現多次各算一次）"""
    out = []
    for rel in (files or LITS):
        for ln, raw, dec in LITS[rel]:
            k = dec.find(needle)
            while k >= 0:
                out.append((rel, ln + dec.count('\n', 0, k), dec)); k = dec.find(needle, k + 1)
    return out

def occ_raw(needle, files=None):
    """原始檔文字（含註解）裡的位置"""
    out = []
    for rel in (files or FILES):
        t = FILES[rel]; k = t.find(needle)
        while k >= 0:
            out.append((rel, t.count('\n', 0, k) + 1)); k = t.find(needle, k + 1)
    return out

def residue(old, new, files):
    """old 在 files 字面值裡出現、且不是 new 的一部分的位置"""
    out = []
    for rel in files:
        for ln, raw, dec in LITS[rel]:
            cover = set()
            if new and old in new:
                k = dec.find(new)
                while k >= 0:
                    off = new.find(old)
                    while off >= 0:
                        cover.add(k + off); off = new.find(old, off + 1)
                    k = dec.find(new, k + 1)
            k = dec.find(old)
            while k >= 0:
                if k not in cover: out.append((rel, ln + dec.count('\n', 0, k), dec))
                k = dec.find(old, k + 1)
    return out

def best_near(s, files):
    """在 files 的字面值裡找最像 s 的一段（視窗比對）"""
    best = (0, None)
    n = len(s)
    for rel in files:
        for ln, raw, dec in LITS[rel]:
            if not dec or len(dec) < n * 0.4: continue
            if len(dec) <= n * 1.6:
                cands = [dec]
            else:
                if not (set(s) & set(dec)): continue
                cands = [dec[k:k + n + 4] for k in range(0, len(dec) - n + 1, max(1, n // 4))]
            for cnd in cands:
                sm = difflib.SequenceMatcher(None, s, cnd, autojunk=False)
                if sm.real_quick_ratio() <= best[0] or sm.quick_ratio() <= best[0]: continue
                r = sm.ratio()
                if r > best[0]: best = (r, (rel, ln, cnd, dec))
    return best

def cdiff(a, b):
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False); o = []
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == 'equal': o.append(a[i1:i2])
        elif op == 'delete': o.append('[-' + a[i1:i2] + '-]')
        elif op == 'insert': o.append('{+' + b[j1:j2] + '+}')
        else: o.append('[-' + a[i1:i2] + '-]{+' + b[j1:j2] + '+}')
    return ''.join(o)

# ---------- 解析稿件表格 ----------
rows = []
cur_files = []
for ln, line in enumerate(open(A.doc, encoding='utf-8'), 1):
    line = line.rstrip('\n')
    if not line.startswith('| '): continue
    cells = [c.strip() for c in line.strip().strip('|').split(' | ')]
    if len(cells) != 6 or not re.fullmatch(r'\d+|保\d+|連\d+', cells[0]): continue
    rid, loc, who, old, new, note = cells
    fs = []
    for b, num in re.findall(r'([A-Za-z0-9_]+\.js):(\d+)', loc):
        fs += BYBASE.get(b, [])
    if fs: cur_files = fs
    elif not loc.startswith('同上'): cur_files = []
    rows.append(dict(id=rid, loc=loc, who=who, old=old, new=new, note=note, files=list(cur_files), docline=ln))

# 第 3、70～73 列、連1、連9：改成欄是說明，人工規則
MANUAL = {
    '3': dict(kind='code', checks=[("'期末前'+CN(n)+'天。'", 'src/aa555_3d.js')], old_raw=["'期中前'+CN(n)+'天。'"]),
    '70': dict(kind='lit', new=['明天晚上滷味，來不來？', '晚上滷味，來不來？'], old=None),
    '71': dict(kind='lit', new=['明天晚上麵店，七點，來不來？', '晚上麵店，七點，來不來？'], old=None),
    '72': dict(kind='lit', new=['考完了 今天麵店，七點，長桌', '刑總考完了 今天麵店，七點，長桌'], old=None),
    '73': dict(kind='lit', new=['明天平安夜。……這週末要視訊嗎？還是你還在考試？', '好啊！考試加油。……聖誕快樂。', '這週末要視訊嗎？還是你要考試？'], old=None),
    '連1': dict(kind='code', checks=[("TD('Y1S1',13,1)", 'src/aa555_3d.js'), ('S.bhCountDay', 'src/aa555_3d.js')], old_raw=["()=>TD('Y1S1',5,1)"]),
    '連9': dict(kind='na'),
}

def fmtpos(lst, lim=6):
    s = '、'.join(f'{r}:{l}' for r, l, *_ in lst[:lim])
    return s + (f'…（共 {len(lst)}）' if len(lst) > lim else '')

R = []   # 結果
for r in rows:
    rid, new, old, fs = r['id'], r['new'], r['old'], r['files']
    res = dict(row=r, status=None, pos=[], detail='', dup='', resid=[], resid_glob=[])
    if rid in MANUAL:
        m = MANUAL[rid]
        if m['kind'] == 'na':
            res['status'] = '不適用'; res['detail'] = '改的是 AA_578 文件字，不在 src'
        elif m['kind'] == 'code':
            miss = [c for c, f in m['checks'] if c not in FILES.get(f, '')]
            res['status'] = '人工規則：一致' if not miss else '人工規則：找不到'
            res['detail'] = '程式碼檢查：' + '；'.join(f'`{c}` {"有" if c not in miss else "沒有"}（{fmtpos(occ_raw(c))}）' for c, f in m['checks'])
            for o in m.get('old_raw', []):
                res['resid'] += [(a, b, '') for a, b in occ_raw(o)]
        else:
            parts = []; ok = True
            for s in m['new']:
                p = occ(s); parts.append(f'「{s}」→ {fmtpos(p) or "找不到"}')
                ok = ok and bool(p)
            res['status'] = '人工規則：一致' if ok else '人工規則：找不到'
            res['detail'] = '；'.join(parts)
        R.append(res); continue
    scope = fs or list(LITS)
    p = occ(new, scope)
    pall = occ(new)
    if p:
        res['status'] = '完全一致'; res['pos'] = pall
    elif pall:
        res['status'] = '完全一致（不在位置欄的檔案）'; res['pos'] = pall
    else:
        # 再試：拿掉「」、前後空白
        alt = new.strip('「」') if new.startswith('「') else None
        pa = occ(alt) if alt else []
        raw = occ_raw(new)
        if pa:
            res['status'] = '相近（只差「」）'; res['pos'] = pa
            res['detail'] = f'src 是不含「」的「{alt}」'
        elif raw and '註解' in r['loc']:
            res['status'] = '完全一致（註解）'; res['pos'] = [(a, b, '') for a, b in raw]
        elif raw:
            res['status'] = '只在註解／原始碼'; res['pos'] = [(a, b, '') for a, b in raw]
        else:
            sc, hit = best_near(new, scope)
            if hit and sc >= 0.6:
                rel, ln, cnd, dec = hit
                res['status'] = '相近但不一致'; res['pos'] = [(rel, ln, dec)]
                res['detail'] = f'相似度 {sc:.2f}；diff（稿→src）：{cdiff(new, cnd)}'
            else:
                res['status'] = '找不到'
                if hit: res['detail'] = f'最像的（{sc:.2f}）{hit[0]}:{hit[1]}「{hit[2][:60]}」'
    # JSON 路徑核對
    jf = [f for f in fs if f in JSONF]
    if jf and res['status'].startswith('完全一致'):
        bt = re.findall(r'`([^`]+)`', r['loc']); m = re.match(r'[A-Za-z0-9_.]+:\d+\s+(Y\dS\d)\s', r['loc'])
        term = m.group(1) if m else None
        if term == 'Y1S1': term = 'characters'   # ladder.js：大一上在 characters，其他學期在 byTerm.<學期>
        want = (([term] if term else []) + norm_path(bt[0])) if bt else []
        ps = [p for f in jf for p in jpaths(f, new)]
        res['jpaths'] = ps
        if want:
            okp = [p for p in ps if path_ok(p, want)]
            res['detail'] += ('JSON 路徑符合：' + '、'.join(okp)) if okp else ('**JSON 路徑不符**：稿 `' + bt[0] + '`，src 在 ' + '、'.join(ps))
            if not okp: res['status'] = '字一致但 JSON 路徑不符'
    # 重複
    files_hit = sorted({a for a, *_ in res['pos']})
    if len(res['pos']) >= 2 and res['status'].startswith('完全一致'):
        res['dup'] = f'{len(res["pos"])} 處／{len(files_hit)} 檔'
    # 原句殘留（保n 原句＝改成，略過）
    if old != new and not rid.startswith('連'):
        res['resid'] = residue(old, new, scope)
        if len(old) >= 8:
            res['resid_glob'] = [x for x in residue(old, new, list(LITS)) if x[0] not in scope]
    elif rid.startswith('連') and old != new and not old.startswith('`'):
        res['resid'] = residue(old, new, scope)
    R.append(res)

# 重複的判斷
ALLNEW = [x['row']['new'] for x in R]
def resid_judge(rel, ln, lit, old):
    if any(old in n and n in lit and n != old for n in ALLNEW): return '是另一列「改成」的一部分（誤判，不算殘留）'
    t = FILES[rel]
    ps = jpaths(rel, old) if rel in JSONF else []
    if ps:
        y0 = all(re.search(r'_y0', q) for q in ps)
        return 'JSON 路徑：' + '、'.join(ps) + ('（_y0＝舊序章的系那一年的非法律課，照常有期中考，保留合理；d118_fix.json 的 note 也寫了「syllabus 期中週黑板和舊序章的系那一年同字」）' if y0 else '')
    if lit and re.search(r'[\'"]' + re.escape(lit) + r'[\'"]\s*:', t):
        ctx = 'NOTE_RENAMED_N9（舊存檔記憶備註→新顯示值的對照表）' if 'NOTE_RENAMED_N9' in t.split('\n')[ln - 1] else '物件'
        return f'{ctx}的鍵：舊存檔的原備註字，必須保留，合理'
    return '要人工看'

def dup_judge(res):
    r = res['row']; pos = res['pos']; fh = sorted({a for a, *_ in pos})
    n = len(r['new'])
    if r['id'] in ('32', '33'): return '合理：稿件第 32、33 列就是同一句的兩份（events.js SMALLTALK＋sup497_lines.js）'
    if n <= 6: return '短句，多處出現是別的台詞共用同字（不視為重複）'
    if set(fh) == {'src/social3d.js', 'src/data/events.js'}:
        return '合理：events.js 是新存檔寫入的記憶備註，social3d.js NOTE_RENAMED_N9 是舊存檔備註的顯示值（同步副本，連2～連4 本來就是同一字）'
    if len(fh) == 1 and len(pos) >= 2:
        return '同一檔多次：' + ('JSON 單行檔（多個欄位同字）' if fh[0].endswith(('ladder.js', 'syllabus.js', 'date_lines.js')) else '要人工看是否為多版本分支')
    return '跨檔：要人工看是同步副本還是重複'

# ---------- 報告 ----------
cnt = collections.Counter(x['status'] for x in R)
out = []
w = out.append
w('# AA_581 稿件 × src 逐句比對報告\n')
w(f'- 稿件：`{A.doc}`（企劃線 454218182）\n- 程式：`{A.wt}`（{os.popen("git -C " + A.wt + " rev-parse --short HEAD").read().strip()}）\n- 腳本：`{os.path.abspath(__file__)}`\n')
w(f'- 比對方式：src/**/*.js 的 JS 字串字面值（跳脫還原：\\uXXXX、\\n、\\\' 等）是否「包含」稿件「改成」欄的整句（逐字）。第 3、70～73 列、連1、連9 的「改成」是說明，用人工規則檢查。\n')
w(f'- 總列數：{len(R)}（改 {sum(1 for x in R if x["row"]["id"].isdigit())}、保留 {sum(1 for x in R if x["row"]["id"].startswith("保"))}、連動 {sum(1 for x in R if x["row"]["id"].startswith("連"))}）\n')
w('## 統計\n')
for k, v in cnt.most_common(): w(f'- {k}：{v}')
w('')

w('## 1. 不一致／找不到\n')
bad = [x for x in R if not x['status'].startswith('完全一致') and x['status'] not in ('人工規則：一致', '不適用')]
if not bad: w('（無）')
for x in bad:
    r = x['row']
    w(f'- **{r["id"]}**（{r["loc"]}）{x["status"]}：改成「{r["new"]}」 → {fmtpos(x["pos"]) or "—"}；{x["detail"]}')
w('')

w('## 2. 同一句在 src 出現兩次以上\n')
dups = [x for x in R if x['dup']]
if not dups: w('（無）')
for x in dups:
    r = x['row']
    w(f'- **{r["id"]}**「{r["new"]}」{x["dup"]}：{fmtpos(x["pos"], 10)}。判斷：{dup_judge(x)}' + (('；JSON 路徑：' + '、'.join(x['jpaths'])) if x.get('jpaths') else ''))
w('')

w('## 3. 原句（被改掉的舊句）在 src 殘留\n')
w('### 3a. 位置欄指定的檔案\n')
rs = [x for x in R if x['resid']]
if not rs: w('（無）')
for x in rs:
    r = x['row']
    seen = set()
    for rel, ln, lit in x['resid']:
        if (rel, ln, lit) in seen: continue
        seen.add((rel, ln, lit))
        w(f'- **{r["id"]}** 原句「{r["old"]}」仍在 {rel}:{ln}' + (f'（字面值「{lit[:60]}」）' if lit else '') + f'。判斷：{resid_judge(rel, ln, lit, r["old"])}')
w('\n### 3b. 其他檔案（原句 ≥8 字才查，避免短句誤判）\n')
rg = [x for x in R if x['resid_glob']]
if not rg: w('（無）')
for x in rg:
    r = x['row']
    w(f'- **{r["id"]}** 原句「{r["old"]}」在別的檔：{fmtpos(x["resid_glob"], 10)}')
w('')

w('## 4. 逐列結果\n')
w('| # | 狀態 | 位置（稿） | 改成 | src 位置 | 備註 |')
w('|---|---|---|---|---|---|')
for x in R:
    r = x['row']
    esc = lambda s: s.replace('|', '\\|').replace('\n', '\\n')
    w(f'| {r["id"]} | {x["status"]} | {esc(r["loc"][:40])} | {esc(r["new"][:60])} | {esc(fmtpos(x["pos"], 4))} | {esc(x["detail"][:160])}{"；重複 " + x["dup"] if x["dup"] else ""}{"；原句殘留 " + str(len(x["resid"])) if x["resid"] else ""} |')
open(A.out, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print(f'rows={len(R)}', dict(cnt))
print('report ->', A.out)
