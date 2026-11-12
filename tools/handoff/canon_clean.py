#!/usr/bin/env python3
"""D158：把檔裡舊序章、外校的字換成代號（給紀錄、文件、工具說明用；遊戲台詞不要用這支，等 AA 換字）。
字表和不算的寫法（國考再考、沛珊那條線、行政大樓）從 canon_scan.py 拿；對照表用 \\u 跳脫寫，這個檔本身不出現那些字。
用法（repo 根目錄）：python3 tools/handoff/canon_clean.py <路徑…> [--dry]　只改 git 追蹤中的文字檔。"""
import sys, re, os, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import canon_scan as C
T = C.T
MAP = [(T(a), T(b)) for a, b in [(r'\u6728\u67f5\u5927\u5b78', r'\u5916\u6821'), (r'\u653f\u6cbb\u5927\u5b78', r'\u5916\u6821'), (r'\u7d93\u6fdf\u5b78\u7cfb', r'\u820a\u5e8f\u7ae0\u7cfb\u6240'), (r'\u7d93\u6fdf\u7cfb\u90a3\u4e00\u5e74', r'\u820a\u5e8f\u7ae0\u90a3\u4e00\u6bb5'), (r'\u7d93\u6fdf\u7cfb\u90a3\u5e74', r'\u820a\u5e8f\u7ae0\u90a3\u4e00\u6bb5'), (r'\u7d93\u6fdf\u7cfb', r'\u820a\u5e8f\u7ae0'), (r'\u91cd\u8003', r'\u820a\u5e8f\u7ae0\u8003\u8a66'), (r'\u4f11\u5b78', r'\u820a\u5e8f\u7ae0\u96e2\u6821'), (r'\u6728\u67f5', r'\u5916\u6821'), (r'\u653f\u5927', r'\u5916\u6821'), (r'\u524d\u50b3', r'\u820a\u5e8f\u7ae0'), (r'\u7fe0\u5dba\u5341\u820d', r'\u5916\u6821\u5bbf\u820d'), (r'\u6b63\u52f3', r'\u820a\u5e8f\u7ae0\u4eba\u7269\u7532'), (r'\u963f\u52f3', r'\u820a\u5e8f\u7ae0\u4eba\u7269\u7532'), (r'\u97cb\u7db8', r'\u820a\u5e8f\u7ae0\u4eba\u7269\u4e59'), (r'\u5510\u777f', r'\u820a\u5e8f\u7ae0\u4eba\u7269\u4e19'), (r'\u54c1\u59a4', r'\u820a\u5e8f\u7ae0\u4eba\u7269\u4e01'), (r'\u54c1\u745c', r'\u820a\u5e8f\u7ae0\u4eba\u7269\u4e01'), (r'\u5bb6\u8c6a', r'\u820a\u5e8f\u7ae0\u4eba\u7269\u620a'), (r'\u4f55\u4fca\u6717', r'\u820a\u5e8f\u7ae0\u4eba\u7269\u5df1'), (r'\u4e88\u6a02', r'\u5916\u6821\u5ba4\u53cb'), (r'\u9b4f\u6559\u6388', r'\u820a\u5e8f\u7ae0\u7684\u6559\u6388')]]
def clean(s, f=''):
    keep = []
    def stash(m):
        keep.append(m.group(0)); return '\x00%d\x00' % (len(keep) - 1)
    for o in C.OK:
        s = re.sub(o, stash, s)
    ps_file = bool(C.PS_FILE.search(f))
    out = []
    for l in s.split('\n'):
        ps = ps_file or bool(C.PS_LINE.search(l))
        for a, b in MAP:
            if ps and a in C.PS_TERMS:
                continue
            l = l.replace(a, b)
        out.append(l)
    s = '\n'.join(out)
    for w in set(b for _, b in MAP):
        s = re.sub('(' + re.escape(w) + '){2,}', w, s)
    while '\x00' in s:   # 一段不算的寫法裡面可能包著另一段：還原到沒有記號為止
        s = re.sub('\x00(\\d+)\x00', lambda m: keep[int(m.group(1))], s)
    return s
def main():
    a = [x for x in sys.argv[1:] if not x.startswith('--')]
    dry = '--dry' in sys.argv
    files = subprocess.run(['git', 'ls-files', '-z'] + a, capture_output=True).stdout.decode('utf-8', 'replace').split('\0')
    n = 0
    for f in files:
        if not f or not os.path.isfile(f) or f.endswith('canon_scan.py') or f.endswith('canon_clean.py'):
            continue
        b = open(f, 'rb').read()
        if b'\0' in b[:4096]:
            continue
        try:
            s = b.decode('utf-8')
        except Exception:
            continue
        t = clean(s, f)
        if t != s:
            n += 1
            if not dry:
                open(f, 'w', encoding='utf-8', newline='').write(t)
    print(('會改' if dry else '改了'), n, '個檔')
if __name__ == '__main__':
    main()
