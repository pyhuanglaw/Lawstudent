#!/usr/bin/env python3
"""CANON-1112（D158）：已經拿掉的舊序章、外校，在 GitHub 上任何檔都不留字。
這支工具掃追蹤中的文字檔，列出還有那些字的檔。字表用 \\u 跳脫寫，這個檔本身不出現那些字。
用法：python3 tools/handoff/canon_scan.py [--summary] [--latin] [--max N] [--paths docs src ...]
結束碼：0＝乾淨；1＝還有。"""
import subprocess, sys, re, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
T = lambda s: s.encode('ascii').decode('unicode_escape')
# 字表：舊序章的系名、入學方式、說法、外校的名字（遊戲內代稱和真實校名）、舊序章的人
TERMS = [T(x) for x in [r'\u54c1\u745c', r'\u9b4f\u6559\u6388', r'\u7d93\u6fdf\u7cfb', r'\u7d93\u6fdf\u5b78\u7cfb', r'\u91cd\u8003', r'\u4f11\u5b78', r'\u6728\u67f5', r'\u653f\u5927', r'\u524d\u50b3', r'\u653f\u6cbb\u5927\u5b78', r'\u7fe0\u5dba\u5341\u820d', r'\u6b63\u52f3', r'\u963f\u52f3', r'\u97cb\u7db8', r'\u5510\u777f', r'\u54c1\u59a4', r'\u5bb6\u8c6a', r'\u4f55\u4fca\u6717', r'\u4e88\u6a02']]
# 不算的：行政大樓；畢業後國考落榜可以再考（D118，使用者 11-12 選擇題：留著）
OK = [T(x) for x in [r'\u884c\u653f\u5927', r'\u570b\u8003[^\u3002\uff1b\n]{0,12}\u91cd\u8003', r'\u843d\u699c[^\u3002\uff1b\n]{0,8}\u91cd\u8003', r'\u91cd\u8003[^\u3002\uff1b\n]{0,6}(\u53f8\u6cd5\u5b98|\u5f8b\u5e2b|\u570b\u8003)', r'(\u53f8\u6cd5\u5b98|\u5f8b\u5e2b)[^\u3002\uff1b\n]{0,16}\u91cd\u8003']]
# 沛珊大二上那條線留著（使用者 11-12 選擇題 UA-LAWWW-1112-41）：同一行或同一個檔講的是她時，「那種入學方式」「離開學校」兩個詞不算
PS_LINE = re.compile('(?i)' + T(r'\u6c9b\u73ca') + r'|peishan|psresults')
PS_TERMS = [T(x) for x in [r'\u91cd\u8003', r'\u4f11\u5b78']]
PS_FILE = re.compile(r'(?i)peishan|psresults|aa720')
LATIN = re.compile(r'(?i)(?<![a-z])(econ|retake|nccu|muzha)(?![a-z]*ic)')   # 檔名、識別字：--latin 才算（改名要連程式一起改）
def scan(paths, latin=False):
    files = subprocess.run(['git', 'ls-files', '-z'] + paths, cwd=ROOT, capture_output=True).stdout.decode('utf-8', 'replace').split('\0')
    res = {}
    for f in files:
        if not f or f == 'tools/handoff/canon_scan.py':
            continue
        try:
            b = open(os.path.join(ROOT, f), 'rb').read()
        except Exception:
            continue
        if b'\0' in b[:4096]:
            continue
        s = b.decode('utf-8', 'replace')
        for o in OK:
            s = re.sub(o, lambda m: '#' * len(m.group(0)), s)
        if PS_FILE.search(f):
            for t in PS_TERMS:
                s = s.replace(t, '#' * len(t))
        elif any(t in s for t in PS_TERMS) and PS_LINE.search(s):
            L = s.split('\n')
            for k, l in enumerate(L):
                if PS_LINE.search(l):
                    for t in PS_TERMS:
                        l = l.replace(t, '#' * len(t))
                    L[k] = l
            s = '\n'.join(L)
        n = sum(s.count(t) for t in TERMS)
        if latin:
            n += len(LATIN.findall(s)) + len(LATIN.findall(f))
        if n:
            res[f] = n
    return res
def main():
    a = sys.argv[1:]
    paths = []
    if '--paths' in a:
        i = a.index('--paths'); paths = [x for x in a[i + 1:] if not x.startswith('--')]
    mx = int(a[a.index('--max') + 1]) if '--max' in a else 40
    res = scan(paths, '--latin' in a)
    by = {}
    for f, n in res.items():
        top = f.split('/')[0] if '/' in f else '(root)'
        d = by.setdefault(top, [0, 0]); d[0] += 1; d[1] += n
    for k in sorted(by):
        print('%-14s %5d 檔 %7d 處' % (k, by[k][0], by[k][1]))
    if '--summary' not in a:
        for f, n in sorted(res.items(), key=lambda x: -x[1])[:mx]:
            print('%6d  %s' % (n, f))
    print('結果：%s（%d 檔、%d 處）' % ('乾淨' if not res else '還有', len(res), sum(res.values())))
    return 1 if res else 0
if __name__ == '__main__':
    sys.exit(main())
