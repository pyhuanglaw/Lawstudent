#!/usr/bin/env python3
"""台詞比對（D100e，AA 用）：程式裡顯示給玩家的中文字串，和企劃稿逐字比對，找出「抄的時候抄錯」的句子。

做法：
- 企劃稿：企劃線某個 ref（預設 origin/claude/magical-albattani-bk7b4n）的 docs/story_planning/ 最上層 md＋ladder/date_system 的 json，
  抽出「」裡的字、程式碼區塊裡「人物：句子」的句子、json 的字串。
- 程式：src/*.js、src/data/*.js 的字串常值（含中文、去掉標點後至少 4 個字）。
- 每個程式字串：稿裡有一模一樣的 → 對；沒有、但有很像的（相似度 ≥ --ratio，預設 0.8）→ 列為「可能抄錯」，附最像的那句和出處；
  都沒有 → 只算數量（舊內容、系統字、程式自己的提示都在這裡），加 --orphans 才列出來。
- 只讀不寫；不改遊戲。

用法：python3 tools/story/check_lines.py [--ref 企劃線ref] [--files src/story3d.js,...] [--ratio 0.8] [--orphans] [--out 報告.md]"""
import argparse, difflib, json, os, re, subprocess, sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SP = 'docs/story_planning/'
CJK = re.compile(r'[㐀-鿿]')
PUNCT = re.compile(r'[\s，。、？！?!：:；;「」『』（）()…—\-～~．.,"\'“”‘’《》〈〉【】\[\]/｜|＊*_`#>]+')


def git(*a):
    return subprocess.run(['git', *a], cwd=ROOT, capture_output=True, text=True, check=True).stdout


def norm(s):
    return PUNCT.sub('', s.replace('{name}', '祐廷'))   # 程式用 {name} 代玩家的名字


def doc_sentences(ref):
    """{正規化句子: (原句, 出處)}"""
    out = {}
    names = git('ls-tree', '-r', '--name-only', ref, SP).split('\n')
    for n in names:
        rel = n[len(SP):]
        top_md = n.endswith('.md') and '/' not in rel
        data_json = n.endswith('.json') and rel.split('/')[0] in ('ladder', 'date_system', 'free_trip', 'exam_official', 'exam_ai', 'exam_y4', 'syllabus')
        if not (top_md or data_json):
            continue
        try:
            txt = git('show', f'{ref}:{n}')
        except subprocess.CalledProcessError:
            continue
        found = []
        if top_md:
            found += re.findall(r'「([^「」\n]{2,200})」', txt)
            for blk in re.findall(r'```[^\n]*\n(.*?)```', txt, re.S):
                for ln in blk.split('\n'):
                    m = re.match(r'\s*(?:〔[^〕]*〕\s*)*([^：:\s]{1,8})[：:]\s*(.+)$', ln)
                    if m:
                        found.append(m.group(2))
            for ln in txt.split('\n'):
                m = re.match(r'\s*>\s*(?:〔[^〕]*〕\s*)*([^：:\s]{1,8})[：:]\s*(.+)$', ln)
                if m:
                    found.append(m.group(2))
        else:
            try:
                def walk(o):
                    if isinstance(o, str):
                        found.append(o)
                    elif isinstance(o, list):
                        for x in o: walk(x)
                    elif isinstance(o, dict):
                        for x in o.values(): walk(x)
                walk(json.loads(txt))
            except ValueError:
                pass
        for s in found:
            s = s.strip()
            k = norm(s)
            if len(k) >= 4 and CJK.search(k) and k not in out:
                out[k] = (s, rel)
    return out


STR = re.compile(r"'((?:[^'\\\n]|\\.)*)'|\"((?:[^\"\\\n]|\\.)*)\"|`((?:[^`\\]|\\.)*)`")


def code_strings(files):
    """[(檔, 行, 原字串)]；註解不算"""
    out = []
    for f in files:
        txt = open(os.path.join(ROOT, f), encoding='utf-8').read()
        txt_nc = re.sub(r'/\*.*?\*/', lambda m: re.sub(r'[^\n]', ' ', m.group(0)), txt, flags=re.S)
        for i, ln in enumerate(txt_nc.split('\n'), 1):
            ln = re.sub(r'(^|[^:\\])//.*$', r'\1', ln)
            for m in STR.finditer(ln):
                s = next(g for g in m.groups() if g is not None)
                if '${' in s:
                    s = re.sub(r'\$\{[^}]*\}', '', s)
                k = norm(s)
                if len(k) >= 4 and CJK.search(k):
                    out.append((f, i, s))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ref', default='origin/claude/magical-albattani-bk7b4n')
    ap.add_argument('--files', default='')
    ap.add_argument('--ratio', type=float, default=0.8)
    ap.add_argument('--orphans', action='store_true')
    ap.add_argument('--out', default='')
    a = ap.parse_args()
    files = [x for x in a.files.split(',') if x] or sorted(
        [os.path.join('src', f) for f in os.listdir(os.path.join(ROOT, 'src')) if f.endswith('.js')] +
        [os.path.join('src/data', f) for f in os.listdir(os.path.join(ROOT, 'src/data')) if f.endswith('.js')])
    docs = doc_sentences(a.ref)
    idx = defaultdict(set)
    keys = list(docs)
    for j, k in enumerate(keys):
        for b in {k[i:i + 2] for i in range(len(k) - 1)}:
            idx[b].add(j)
    ok = near = orphan = 0
    near_rows, orphan_rows = [], []
    for f, ln, s in code_strings(files):
        s2 = re.sub(r'^\s*[^：:「」\s]{1,6}[：:]\s*', '', s)   # 「老師：……」這種前面接人名的
        k = norm(s2)
        if k in docs or norm(s) in docs:
            ok += 1
            continue
        if len(k) < 6:   # 太短的字串（地點、按鈕、句子片段）只算數量
            orphan += 1
            continue
        grams = {k[i:i + 2] for i in range(len(k) - 1)}
        cnt = defaultdict(int)
        for b in grams:
            for j in idx.get(b, ()):
                cnt[j] += 1
        best, br, frag = None, 0.0, False
        for j, _ in sorted(cnt.items(), key=lambda x: -x[1])[:25]:
            if k in keys[j] or (len(keys[j]) >= 6 and keys[j] in k):   # 程式把一句拆開或接起來：算對
                frag = True
                break
            r = difflib.SequenceMatcher(None, k, keys[j]).ratio()
            if r > br:
                best, br = j, r
        if frag:
            ok += 1
            continue
        if best is not None and br >= a.ratio:
            near += 1
            near_rows.append((br, f, ln, s, docs[keys[best]][0], docs[keys[best]][1]))
        else:
            orphan += 1
            if a.orphans:
                orphan_rows.append((f, ln, s))
    L = [f'# 台詞比對報告（企劃 {a.ref}；{len(files)} 個程式檔；稿裡 {len(docs)} 句）', '',
         f'- 一模一樣（含拆開、接起來的）：{ok}', f'- 可能抄錯（相似度 ≥ {a.ratio}）：{near}', f'- 稿裡找不到：{orphan}', '',
         '## 可能抄錯', '', '| 相似度 | 程式 | 程式裡的字 | 稿裡最像的 | 出處 |', '|---|---|---|---|---|']
    for r, f, ln, s, d, src in sorted(near_rows, key=lambda x: (x[1], x[2])):
        L.append(f'| {r:.2f} | `{f}:{ln}` | {s.replace("|", "｜")} | {d.replace("|", "｜")} | `{src}` |')
    if a.orphans:
        L += ['', '## 稿裡找不到', '']
        L += [f'- `{f}:{ln}` {s}' for f, ln, s in orphan_rows]
    rep = '\n'.join(L) + '\n'
    if a.out:
        open(a.out, 'w', encoding='utf-8').write(rep)
        print(f'寫到 {a.out}：一模一樣 {ok}、可能抄錯 {near}、找不到 {orphan}')
    else:
        sys.stdout.write(rep)


if __name__ == '__main__':
    main()
