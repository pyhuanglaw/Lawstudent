#!/usr/bin/env python3
"""更名驗收掃描（RENAME-1030，AA 第四階段用；只讀、不改檔）。

掃遊戲程式（預設開發分支的 src/），只看字串常數、跳過註解，列出：
  OLD   玩家可能看得到的字串裡還有舊名（docs/WORLD_NAMING.md 第 6 節）
  AA館  「法律系館A館」「法律系館B館」這種疊字（第 3-1 節禁止）
  SPOKE 台詞（speaker 是人物、或 say／lines 這類）用了正式名「法律系館A／B」（台詞要說 A館／B館）
  WROTE 旁白、字幕、地點（speaker:null、（…）開頭、scene／title／place／label／caption）只寫「A館／B館」

用法：
  python3 tools/rename/scan_game.py                       # 掃 origin/claude/modest-rubin-2lyp7g 的 src/
  python3 tools/rename/scan_game.py --ref <分支或 SHA>
  python3 tools/rename/scan_game.py --dir src             # 掃工作目錄
  python3 tools/rename/scan_game.py --summary             # 只印每個檔幾處
  python3 tools/rename/scan_game.py --propose > x.tsv     # 建議換字表（檔:行、判斷 spoken／written／unknown、原字串、建議）

判斷是啟發式的：搜尋結果是零不代表驗收成功（使用者 10-30），列出來的也要人看過。
內部識別碼（zone／event／人物 id、asset 路徑、旗標）看起來像 id 的字串不列。
"""
import os, re, subprocess, sys, argparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import world_names as W  # noqa: E402

ID_LIKE = re.compile(r'^[A-Za-z0-9_./:#?=&%-]*$')
NEW_FORMAL = re.compile(r'法律系館[AB](?!館)')
DOUBLE = re.compile(r'法律系館[AB]館')
SHORT = re.compile(r'(?<![系館])[AB]館')
SPOKEN_KEYS = {'say', 'lines', 'msg', 'reply', 'r', 'l', 'yes', 'no', 'notYet', 'ask', 'greet', 'talk', 't', 'face', 'phone', 'acc', 'first', 'firstAt', 'walk', 'plan', 'here'}
SKIP_KEYS = {'source', 'license', 'credit', 'src', 'note', 'notes', 'memo', 'comment', '_comment', 'ref', 'why_dev', 'dev'}   # 素材出處、授權、開發註記：玩家看不到，照 C 類
WRITTEN_KEYS = {'scene', 'title', 'place', 'label', 'caption', 'name', 'away', 'desc', 'loc', 'where', 'travel', 'hint', 'n', 'narr', 'card', 'memo', 'why'}


def files_from_ref(ref, root):
    out = subprocess.run(['git', '-c', 'core.quotepath=false', 'ls-tree', '-r', '--name-only', ref, '--', root],
                         capture_output=True, text=True, check=True).stdout.split('\n')
    for p in out:
        if p.endswith('.js'):
            yield p, subprocess.run(['git', 'show', f'{ref}:{p}'], capture_output=True, text=True, check=True).stdout


def files_from_dir(root):
    for d, _, fs in os.walk(root):
        for f in fs:
            if f.endswith('.js'):
                p = os.path.join(d, f)
                yield p, open(p, encoding='utf-8').read()


def literals(src):
    """回傳 (行號, 字串內容, 字串前面同一行的文字)；跳過 // 和 /* */ 註解。"""
    i, n, line = 0, len(src), 1
    while i < n:
        c = src[i]
        if c == '\n':
            line += 1; i += 1; continue
        if src.startswith('//', i):
            j = src.find('\n', i); i = n if j < 0 else j; continue
        if src.startswith('/*', i):
            j = src.find('*/', i + 2); j = n if j < 0 else j + 2
            line += src.count('\n', i, j); i = j; continue
        if c in '\'"`':
            q, j, buf = c, i + 1, []
            while j < n and src[j] != q:
                if src[j] == '\\' and j + 1 < n:
                    buf.append(src[j + 1]); j += 2; continue
                buf.append(src[j]); j += 1
            s = ''.join(buf)
            lo = max(0, i - 200)   # 只看前面 200 字（資料檔常常整個物件寫在同一行，整行往回找會很慢）
            ls = src.rfind('\n', lo, i) + 1
            yield line, s, src[max(ls, lo):i]
            line += s.count('\n'); i = j + 1; continue
        i += 1


def context(pre):
    """從字串前面同一行的文字猜：spoken／written／unknown。"""
    k0 = re.findall(r'([A-Za-z_]\w*)\s*:\s*\[?\s*$', pre)
    if k0 and k0[-1] in SKIP_KEYS: return 'skip'
    m = re.findall(r'speaker\s*:\s*(null|\'[^\']*\'|"[^"]*")', pre)
    if m:
        sp = m[-1]
        return 'written' if sp in ('null', "'narr'", '"narr"', "'system'") else 'spoken'
    k = re.findall(r'([A-Za-z_]\w*)\s*:\s*\[?\s*$', pre)
    if k:
        if k[-1] in WRITTEN_KEYS: return 'written'
        if k[-1] in SPOKEN_KEYS: return 'spoken'
    return 'unknown'


def scan(items):
    res = []
    for path, src in items:
        for ln, s, pre in literals(src):
            if not s or ID_LIKE.match(s) or not re.search(r'[一-鿿]', s):
                continue
            ctx = context(pre)
            if ctx == 'skip': continue
            if ctx == 'unknown' and s.startswith('（'):
                ctx = 'written'
            for _, hit in W.find_old(s):
                res.append((path, ln, 'OLD', hit, s))
            if DOUBLE.search(s):
                res.append((path, ln, 'AA館', DOUBLE.search(s).group(0), s))
            if ctx == 'spoken' and NEW_FORMAL.search(s) and not s.startswith('（'):
                res.append((path, ln, 'SPOKE', NEW_FORMAL.search(s).group(0), s))
            if ctx == 'written' and SHORT.search(s) and not NEW_FORMAL.search(s):
                res.append((path, ln, 'WROTE', SHORT.search(s).group(0), s))
    return res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ref', default='origin/claude/modest-rubin-2lyp7g')
    ap.add_argument('--dir')
    ap.add_argument('--root', default='src')
    ap.add_argument('--summary', action='store_true')
    ap.add_argument('--propose', action='store_true', help='輸出建議換字表（TSV：檔:行、判斷、原字串、建議）；unknown 照台詞換，要人看')
    a = ap.parse_args()
    items = files_from_dir(a.dir) if a.dir else files_from_ref(a.ref, a.root)
    if a.propose:
        n = 0
        for path, src in items:
            for ln, st, pre in literals(src):
                if not st or ID_LIKE.match(st) or not W.find_old(st): continue
                ctx = context(pre)
                if ctx == 'skip': continue
                if ctx == 'unknown' and st.startswith('（'): ctx = 'written'
                new = W.written(st) if ctx == 'written' else W.spoken(st)
                print(f'{path}:{ln}\t{ctx}\t{st}\t{new}'.replace('\n', '⏎')); n += 1
        print(f'建議 {n} 處；unknown 照台詞（口語）換，旁白、地點、系統字要改成正式', file=sys.stderr)
        return
    res = scan(items)
    # 根目錄 index.html（HUD 預設字、說明頁、標題）：逐行看，HTML 註解不算
    if not a.dir:
        try:
            html = subprocess.run(['git', 'show', f'{a.ref}:index.html'], capture_output=True, text=True, check=True).stdout
            html = re.sub(r'<!--.*?-->', lambda m: '\n' * m.group(0).count('\n'), html, flags=re.S)
            for i, l in enumerate(html.split('\n'), 1):
                for _, hit in W.find_old(re.sub(r'<script[^>]*>.*', '', l)):
                    res.append(('index.html', i, 'OLD', hit, re.sub(r'<[^>]+>', ' ', l).strip()))
        except subprocess.CalledProcessError:
            pass
    from collections import Counter
    if a.summary:
        c = Counter((r[0], r[2]) for r in res)
        per = Counter(r[0] for r in res)
        for f, k in per.most_common():
            print(f'{k:5d}  {f}  ' + ' '.join(f'{t}:{c[(f, t)]}' for t in ('OLD', 'AA館', 'SPOKE', 'WROTE') if c[(f, t)]))
    else:
        for f, ln, t, hit, s in res:
            print(f'{f}:{ln}\t{t}\t{hit}\t{s[:80]}')
    kinds = Counter(r[2] for r in res)
    print(f'合計 {len(res)} 處（' + '、'.join(f'{k} {v}' for k, v in kinds.items()) + '）；零不代表驗收成功，要看畫面', file=sys.stderr)


if __name__ == '__main__':
    main()
