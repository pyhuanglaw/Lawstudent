"""CC（帳號 A）11-11：沛珊台詞離線掃描（PS_BATCH ③a／③c 重掃用；雲端 Python，不用瀏覽器）。
用法：python3 cc_ps_text_scan.py <git ref> [輸出 .md]
做法（和 CC_PS_BATCH2_文字檢查.md 第一輪相同）：
- 只看 src/**/*.js 裡「不在註解裡的字串」（'…'、"…"、`…` 的字面部分）。
- 和沛珊有關＝字串前 400 字內最近的 who／speaker 是 classmate_peishan，或字串前 200 字內出現 classmate_peishan，或字串本身有「沛珊」。
- 排除 key 是 source／note／why／doc 的字串（說明，不上畫面）。
③a：有「早餐店／蛋餅／圍裙／榜單」的；③c：who／speaker＝classmate_peishan、key 是 text／say／t／reply／line 且超過 60 字的。
"""
import re, subprocess, sys

REF = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else None
KW = ('早餐店', '蛋餅', '圍裙', '榜單')
SKIPKEY = {'source', 'note', 'why', 'doc'}
SAYKEY = {'text', 'say', 't', 'reply', 'line'}
PS = 'classmate_peishan'


def files():
    out = subprocess.run(['git', 'ls-tree', '-r', '--name-only', REF, 'src'], capture_output=True, text=True, check=True).stdout.split()
    return [f for f in out if f.endswith('.js')]


def strings(src):
    """回傳 [(起點, 終點, 內容)]，跳過 // 與 /* */ 註解。regex 字面不特別處理（夠用）。"""
    i, n, res = 0, len(src), []
    while i < n:
        c = src[i]
        if c == '/' and i + 1 < n and src[i + 1] == '/':
            j = src.find('\n', i); i = n if j < 0 else j; continue
        if c == '/' and i + 1 < n and src[i + 1] == '*':
            j = src.find('*/', i + 2); i = n if j < 0 else j + 2; continue
        if c == '/':   # regex 字面（前一個非空白字元是運算子、括號、逗號……或行首）：跳到結尾的 /（[] 裡的 / 不算）
            k = i - 1
            while k >= 0 and src[k] in ' \t': k -= 1
            prev = src[k] if k >= 0 else '\n'
            if prev in '(,=:[!&|?{};+-*%<>~^\n' or src[max(0, k - 5):k + 1].endswith('return'):
                j, cls = i + 1, False
                while j < n and src[j] != '\n':
                    if src[j] == '\\': j += 2; continue
                    if src[j] == '[': cls = True
                    elif src[j] == ']': cls = False
                    elif src[j] == '/' and not cls: break
                    j += 1
                if j < n and src[j] == '/': i = j + 1; continue
        if c in '\'"`':
            q, j, buf = c, i + 1, []
            while j < n and src[j] != q:
                if src[j] == '\\' and j + 1 < n: buf.append(src[j:j + 2]); j += 2; continue
                if q != '`' and src[j] == '\n': break
                buf.append(src[j]); j += 1
            s = ''.join(buf)
            try:
                import warnings; warnings.simplefilter('ignore'); s = s.encode('utf-8').decode('unicode_escape').encode('latin-1').decode('utf-8')
            except Exception: pass
            res.append((i, j, s)); i = j + 1; continue
        i += 1
    return res


def keyof(src, st):
    m = re.search(r'["\']?([A-Za-z_$][\w$]*)["\']?\s*:\s*$', src[max(0, st - 60):st])
    return m.group(1) if m else None


WHO = re.compile(r'["\']?(?:who|speaker)["\']?\s*:\s*["\']([\w$]+)["\']')


def who_before(src, st):
    ms = list(WHO.finditer(src[max(0, st - 400):st]))
    return ms[-1].group(1) if ms else None


rows_a, rows_c = [], []
for f in files():
    src = subprocess.run(['git', 'show', '%s:%s' % (REF, f)], capture_output=True, text=True).stdout
    for st, en, s in strings(src):
        k = keyof(src, st)
        if k in SKIPKEY: continue
        w = who_before(src, st)
        near = PS in src[max(0, st - 200):st]
        rel = w == PS or near or '沛珊' in s
        if not rel: continue
        line = src.count('\n', 0, st) + 1
        if any(x in s for x in KW): rows_a.append((f, line, k, w, s))
        if w == PS and k in SAYKEY and len(s) > 60: rows_c.append((f, line, k, w, len(s), s))

md = ['# 沛珊台詞離線掃描（%s）' % REF, '', '## ③a 早餐店／蛋餅／圍裙／榜單（%d 筆）' % len(rows_a), '', '| 檔案 | 行 | key | 說話的人 | 字串 |', '|---|---|---|---|---|']
md += ['| %s | %d | %s | %s | %s |' % (f, l, k, w, s.replace('|', '｜').replace('\n', ' ')) for f, l, k, w, s in rows_a]
md += ['', '## ③c 超過 60 字（%d 筆）' % len(rows_c), '']
if rows_c:
    md += ['| 檔案 | 行 | key | 字數 | 字串 |', '|---|---|---|---|---|'] + ['| %s | %d | %s | %d | %s |' % (f, l, k, n, s) for f, l, k, w, n, s in rows_c]
txt = '\n'.join(md) + '\n'
if OUT: open(OUT, 'w', encoding='utf-8').write(txt)
print(txt)
