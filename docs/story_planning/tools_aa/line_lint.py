#!/usr/bin/env python3
# AA 台詞檢查（00_台詞寫作規則.md 第 12 節）。只讀、不改檔。
# 規則從 00_台詞寫作規則.md 第 11 節的 ```lint 區塊讀（規則和工具同一個來源）；讀不到才用下面備用的同一套。
# 用法：python3 line_lint.py [--changed <git ref>] [--fail] <檔案或資料夾>...  （.md 只看「」台詞與（）旁白；.js／.json 看字串）
# 被抓到不一定是錯：學姊、可昕直說是個性；AA 判斷。
import os, re, sys
from collections import Counter

RULES = [
    ('4-1 不是X是Y', r'不是[^，。？！「」]{1,14}[，,。…]+(?:而)?是'),
    ('4-1 不是X而是Y', r'不是[^。？！「」]{1,20}而是'),
    ('4-2 單句碎片', r'^(?:[^，。？！]{1,6}。){3,}$'),
    ('4-4 精確數字', r'(?<![第0-9])(?:[1-9][0-9]|[二三四五六七八九]十[一二三四五六七八九])(?:分鐘|秒|次|天|個小時)'),
    ('4-7 假想敵', r'(?:你不要誤會|別誤會|我不是那種|我不是在)'),
    ('4-8 三連', r'很[^，。、]{1,4}、很[^，。、]{1,4}、很[^，。、]{1,4}'),
    ('4-9 破折號', r'——[^——]*——'),
    ('4-10 限定詞堆疊', r'(?:應該|可能|大概|或許|也許)[^。]{0,8}(?:應該|可能|大概|或許|也許)'),
    ('4-11 意義拔高', r'(?:意義很大|很有意義|轉捩點|改變了我|我的人生|最重要的人)'),
    ('4-13 客服腔', r'(?:好問題|希望(?:這|這樣)?對你有幫助|你真的很棒|辛苦你了，)'),
    ('4-14 套話收尾', r'(?:總之|總而言之|讓我們|一起加油吧|隨著[^，。]{1,10}，)'),
    ('0-3 模板句', r'(?:你是第一個|我記住了|騙你的|我是說|開玩笑的|這是我的規則|不要跟別人(?:講|說)|你不要講出去|你先不要跟別人說|謝謝你沒有|大家都只問|這是我第一次|我第一次覺得|後來才發現|我原本以為|因為你，我開始|也是一種回答|你不用那個表情)'),
]
RULES_DOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '00_台詞寫作規則.md')

def load_rules():
    try:
        t = open(RULES_DOC, encoding='utf-8').read()
        m = re.search(r'```lint\n(.*?)```', t, re.S)
        rules = []
        for ln in m.group(1).splitlines():
            parts = [x.strip() for x in ln.split(' | ', 2)]
            if len(parts) == 3 and parts[2]:
                rules.append((parts[0] + ' ' + parts[1], parts[2]))
        if rules:
            return rules, '00_台詞寫作規則.md'
    except Exception:
        pass
    return RULES, '備用規則（讀不到 00_台詞寫作規則.md）'

NOD = re.compile(r'(?:點了點頭|點了一下頭|笑了一下|笑了笑)')

def strip_notes(text, path):
    # 註解、note 欄位不是玩家看得到的字，先拿掉（換成同樣多的換行，行號不變）
    keep = lambda m: '\n' * m.group(0).count('\n')
    if path.endswith('.js'):
        text = re.sub(r'/\*.*?\*/', keep, text, flags=re.S)
        text = re.sub(r'(?<![:"\'])//[^\n]*', '', text)
    if path.endswith(('.js', '.json')):
        text = re.sub(r'"(?:note|notes|_note|src|source|why)"\s*:\s*"(?:[^"\\]|\\.)*"', '"note":""', text)
    return text

CJK = re.compile(r'[\u4e00-\u9fff]')

def lines_of(text, path=''):
    if path.endswith(('.js', '.json')):
        # 程式和資料檔：玩家看到的字在字串裡（text:'…'、"reply": "…"），一個字串當一句
        for m in re.finditer(r"'((?:[^'\\\n]|\\.){2,300})'|\"((?:[^\"\\\n]|\\.){2,300})\"", text):
            v = m.group(1) or m.group(2) or ''
            if len(CJK.findall(v)) >= 3:
                yield 'str', v.replace('\\n', ' '), m.start()
        return
    for m in re.finditer(r'「([^「」]{2,200})」', text):
        yield 'line', m.group(1), m.start()
    for m in re.finditer(r'（([^（）「」]{6,200})）', text):
        yield 'narr', m.group(1), m.start()

def scan(path):
    try:
        text = strip_notes(open(path, encoding='utf-8', errors='ignore').read(), path)
    except Exception:
        return [], 0, 0
    hits, n, nod = [], 0, 0
    for kind, s, pos in lines_of(text, path):
        n += 1
        if NOD.search(s):
            nod += 1
        for name, pat in RULES:
            if re.search(pat, s):
                ln = text.count('\n', 0, pos) + 1
                hits.append((name, ln, s[:60]))
    return hits, n, nod

def changed_files(ref):
    import subprocess
    out = subprocess.run(['git', 'diff', '--name-only', ref, '--'], capture_output=True, text=True).stdout.split()
    out += subprocess.run(['git', 'ls-files', '--others', '--exclude-standard'], capture_output=True, text=True).stdout.split()
    return [f for f in out if f.endswith(('.md', '.json', '.js')) and os.path.exists(f)]

def main(argv):
    global RULES
    fail = '--fail' in argv
    argv = [a for a in argv if a != '--fail']
    ref = None
    if '--changed' in argv:
        i = argv.index('--changed'); ref = argv[i + 1]; argv = argv[:i] + argv[i + 2:]
    RULES, src = load_rules()
    files = []
    if ref:
        files = changed_files(ref)
    for a in argv or ([] if ref else ['.']):
        if os.path.isdir(a):
            for r, _, fs in os.walk(a):
                if '/.git' in r:
                    continue
                files += [os.path.join(r, f) for f in fs if f.endswith(('.md', '.json', '.js'))]
        else:
            files.append(a)
    tot = Counter(); allN = allNod = 0
    for f in sorted(set(files)):
        if os.path.basename(f) == '00_台詞寫作規則.md':
            continue   # 規則本身的例子不算
        hits, n, nod = scan(f)
        allN += n; allNod += nod
        for name, ln, s in hits:
            tot[name] += 1
            print(f'{f}:{ln}｜{name}｜{s}')
    print('---')
    print(f'規則來源：{src}（{len(RULES)} 條）；檔案 {len(set(files))} 個')
    print(f'句子 {allN}；「點頭／笑了一下」{allNod} 句（{(allNod / allN * 100 if allN else 0):.1f}%）')
    for k, v in tot.most_common():
        print(f'{k}：{v}')
    if fail and sum(tot.values()):
        sys.exit(1)

if __name__ == '__main__':
    main(sys.argv[1:])
