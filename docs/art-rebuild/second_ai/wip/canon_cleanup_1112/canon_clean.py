#!/usr/bin/env python3
"""D158：把檔裡舊序章、外校的字換成代號。字表從 tools/handoff/canon_scan.py 拿（這支本身不寫那些字）。
用法（在 repo 根目錄）：python3 docs/art-rebuild/second_ai/wip/canon_cleanup_1112/canon_clean.py <路徑…>（只改 git 追蹤中的文字檔）"""
import sys, re, os, subprocess
sys.path.insert(0, 'tools/handoff'); import canon_scan as C
T = C.TERMS
# 依字表的順序對代號：0,1 系名；2,3 入學方式；4,5,7 外校；6 說法；8 外校宿舍；9.. 人
CODE = {0: '舊序章', 1: '舊序章', 2: '舊序章', 3: '舊序章', 4: '外校', 5: '外校', 6: '舊序章', 7: '外校', 8: '外校宿舍',
        9: '舊序章人物甲', 10: '舊序章人物甲', 11: '舊序章人物乙', 12: '舊序章人物丙', 13: '舊序章人物丁', 14: '舊序章人物戊', 15: '舊序章人物己', 16: '外校室友'}
PRE = [(T[4] + '大學', '外校'), (T[0] + '那一年', '舊序章那一段'), (T[0] + '那年', '舊序章那一段'), (T[0] + '那群', '舊序章那群人'), (T[0] + '的', '舊序章的')]
EXTRA = [('\u54c1\u745c', '舊序章人物丁'), ('\u9b4f\u6559\u6388', '舊序章的教授')]   # 掃描工具字表沒有的兩個寫法（丁的另一種寫法、舊序章那位教授的稱呼）
order = sorted(range(len(T)), key=lambda i: -len(T[i]))
def clean(s):
    keep = []
    def stash(m): keep.append(m.group(0)); return '\x00%d\x00' % (len(keep) - 1)
    for o in C.OK: s = re.sub(o, stash, s)
    for a, b in PRE: s = s.replace(a, b)
    for i in order: s = s.replace(T[i], CODE[i])
    for a, b in EXTRA: s = s.replace(a, b)
    s = re.sub('(舊序章){2,}', '舊序章', s); s = re.sub('(外校){2,}', '外校', s)
    return re.sub('\x00(\\d+)\x00', lambda m: keep[int(m.group(1))], s)
files = subprocess.run(['git', 'ls-files', '-z'] + sys.argv[1:], capture_output=True).stdout.decode('utf-8', 'replace').split('\0')
n = 0
for f in files:
    if not f or not os.path.isfile(f): continue
    b = open(f, 'rb').read()
    if b'\0' in b[:4096]: continue
    try: s = b.decode('utf-8')
    except Exception: continue
    t = clean(s)
    if t != s: open(f, 'w', encoding='utf-8', newline='').write(t); n += 1
print('改了', n, '個檔')
