#!/usr/bin/env python3
"""CANON-1112（D158）：已經拿掉的舊序章、外校，在 GitHub 上任何檔都不留字。
這支工具掃追蹤中的文字檔，列出還有那些字的檔。字表用 \\u 跳脫寫，這個檔本身不出現那些字。
用法：python3 tools/handoff/canon_scan.py [--summary] [--latin] [--max N] [--no-premise] [--paths docs src ...]
結束碼：0＝乾淨；1＝還有。
另外印「前提警告」（不擋、不算進結束碼；AA-C／BB-C 11-12 21:1x 建議，AA_916）：src 裡可昕（kexin）的台詞出現「你們學校／山上／下山／我們那邊／你們系」——
沒有禁字、但前提還是外校的句子，給人看。"""
import subprocess, sys, re, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
T = lambda s: s.encode('ascii').decode('unicode_escape')
# 字表：舊序章的系名、入學方式、說法、外校的名字（遊戲內代稱和真實校名）、舊序章的人
TERMS = [T(x) for x in [r'\u54c1\u745c', r'\u9b4f\u6559\u6388', r'\u7d93\u6fdf\u7cfb', r'\u7d93\u6fdf\u5b78\u7cfb', r'\u91cd\u8003', r'\u4f11\u5b78', r'\u6728\u67f5', r'\u653f\u5927', r'\u524d\u50b3', r'\u653f\u6cbb\u5927\u5b78', r'\u7fe0\u5dba\u5341\u820d', r'\u6b63\u52f3', r'\u963f\u52f3', r'\u97cb\u7db8', r'\u5510\u777f', r'\u54c1\u59a4', r'\u5bb6\u8c6a', r'\u4e88\u6a02']]
# 不算的：行政大樓；畢業後國考落榜可以再考（D118，使用者 11-12 選擇題：留著）
OK = [T(x) for x in [r'\u884c\u653f\u5927', r'\u7814\u7a76\u6240[^\u3002\uff1b\n]{0,8}\u4f11\u5b78', r'\u91cd\u8003\u91ab\u79d1', r'\u570b\u8003[^\u3002\uff1b\n]{0,12}\u91cd\u8003', r'\u843d\u699c[^\u3002\uff1b\n]{0,8}\u91cd\u8003', r'\u91cd\u8003[^\u3002\uff1b\n]{0,6}(\u53f8\u6cd5\u5b98|\u5f8b\u5e2b|\u570b\u8003)', r'(\u53f8\u6cd5\u5b98|\u5f8b\u5e2b)[^\u3002\uff1b\n]{0,16}\u91cd\u8003']]
# CANON-NO-ECON-1112 第四批（AA_897 第 1 節，AA-C 定稿）：沛珊自己大二離開學校、重考那條線（使用者「沛珊的留著」）裡沒有寫她名字的那幾句；「以前傳（訊息）」是誤判（字表裡的「前傳」）
OK += [T(x) for x in [r'\u5927\u4e8c\u4e0b\u5728\u5bb6\u91cd\u8003', r'\u8b1d\u8b1d\u4f60\u5728\u6211\u91cd\u8003\u90a3\u5e74\u966a\u6211', r'\u4f11\u5b78\u91cd\u8003\uff08\u5927\u4e8c\u4e0a\u002012/17\u0020\u4ee5\u5f8c\u6d88\u5931\uff09', r'\u91cd\u8003\u7684\u90a3\u4e00\u4efd\u3001\u4e0b\u5b78\u671f\u6703\u4f11\u5b78', r'\u5979\u5728\u570b\u5916\u3001\u4f11\u5b78\u3001\u56de\u8001\u5bb6', r'\u4ee5\u524d\u50b3']]
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
PREMISE = re.compile('你們學校|山上|下山|山下|後山|我們那邊|你們系|外校|首都帝大的|你們的球場')   # AA_940 建議（11-13）：heroine_asks、invites 可昕那格是前提層沒抓到才漏，加「外校」「後山／山下」「首都帝大的」「你們的球場」
KX = re.compile('kexin|' + T(r'\u53ef\u6615'))
def premise(paths):
    files = subprocess.run(['git', 'ls-files', '-z'] + (paths or ['src']), cwd=ROOT, capture_output=True).stdout.decode('utf-8', 'replace').split('\0')
    out = []
    for f in files:
        if not f.startswith('src/') or not f.endswith('.js'):
            continue
        try:
            L = open(os.path.join(ROOT, f), encoding='utf-8', errors='replace').read().split('\n')
        except Exception:
            continue
        cm = False   # 前提警告只看台詞，不看註解（CANON ③ 11-13：註解改成代號「外校」以後，前提警告多出 24 筆註解雜訊）
        for k, l0 in enumerate(L):
            l, s, i = '', l0, 0
            while i < len(s):
                if cm:
                    j = s.find('*/', i)
                    if j < 0: i = len(s); break
                    cm = False; i = j + 2; continue
                j1, j2 = s.find('/*', i), s.find('//', i)
                j1 = j1 if j1 >= 0 else len(s); j2 = j2 if j2 >= 0 else len(s)
                if j2 < j1 and not (j2 > 0 and s[j2 - 1] == ':'):   # 「https://」不當註解
                    l += s[i:j2]; i = len(s); break
                l += s[i:j1]
                if j1 < len(s): cm = True; i = j1 + 2
                else: i = len(s)
            for m in PREMISE.finditer(l):
                w = l[max(0, m.start() - 90):m.start()]
                if KX.search(w):
                    out.append('%s:%d  …%s…' % (f, k + 1, l[max(0, m.start() - 30):m.end() + 20].replace('\n', ' ')))
    return out
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
    if '--no-premise' not in a:
        pw = premise(paths)
        if pw:
            print('前提警告（不擋；可昕的台詞前提可能還是外校，給 AA 看）：%d 處' % len(pw))
            for x in pw[:mx]:
                print('  ' + x)
    print('結果：%s（%d 檔、%d 處）' % ('乾淨' if not res else '還有', len(res), sum(res.values())))
    return 1 if res else 0
if __name__ == '__main__':
    sys.exit(main())
