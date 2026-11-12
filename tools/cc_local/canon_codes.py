"""CANON-NO-ECON-1112（D158）：舊序章、外校的字換成代號（CC-C 11-12；LAWWW-C 14:31 同意做法 (a)(b)(c)）。
字表直接用 tools/handoff/canon_scan.py 的 TERMS／OK／PS_*（那支用 \\u 跳脫存，這支也不出現那些字）。
- to_codes(s)：OK 的寫法（行政大樓、國考落榜可以再考那一類）不動；沛珊大二上她自己那條線（同一行講她）「那種入學方式」「離開學校」不動；其他換代號。
- hits(s)：還剩幾處（和 canon_scan 同一套算法）。
run_queue.py 的 Sanitizer（推送前）和 canon_purge.py（一次清舊結果）都用這支。"""
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'handoff'))
import canon_scan as C   # noqa: E402

T = C.T
# 代號：系名、入學方式、離開學校、外校（校名、地名、宿舍）、舊序章的人（老師另外一個代號）
CODE = {T(r'\u7d93\u6fdf\u7cfb'): '舊序章系所', T(r'\u7d93\u6fdf\u5b78\u7cfb'): '舊序章系所',
        T(r'\u91cd\u8003'): '舊序章考試', T(r'\u4f11\u5b78'): '離校',
        T(r'\u6728\u67f5'): '外校', T(r'\u653f\u5927'): '外校', T(r'\u653f\u6cbb\u5927\u5b78'): '外校', T(r'\u7fe0\u5dba\u5341\u820d'): '外校宿舍',
        T(r'\u524d\u50b3'): '舊序章', T(r'\u9b4f\u6559\u6388'): '舊序章老師'}
for t in C.TERMS:
    CODE.setdefault(t, '舊序章同學')
_PAT = re.compile('|'.join(re.escape(t) for t in sorted(CODE, key=len, reverse=True)))
_PS_LINE = getattr(C, 'PS_LINE', None)
_PS_TERMS = set(getattr(C, 'PS_TERMS', []))


def _line(l):
    spans = [(m.start(), m.end()) for o in C.OK for m in re.finditer(o, l)]
    ps = bool(_PS_LINE is not None and _PS_LINE.search(l))
    n = [0]

    def rep(m):
        if any(a <= m.start() < b for a, b in spans): return m.group(0)
        if ps and m.group(0) in _PS_TERMS: return m.group(0)
        n[0] += 1; return CODE[m.group(0)]
    return _PAT.sub(rep, l), n[0]


def to_codes(s):
    """回傳 (換好的字串, 換了幾處)"""
    if not s or not _PAT.search(s): return s, 0
    out, tot = [], 0
    for l in s.split('\n'):
        l2, k = _line(l); out.append(l2); tot += k
    return '\n'.join(out), tot


def hits(s):
    return to_codes(s)[1]


LATIN = re.compile(r'(?i)(?<![a-z])(econ|nccu|muzha)')


def bad_name(name):
    """檔名、資料夾名帶那些字（含英文縮寫）"""
    return bool(LATIN.search(name)) or hits(name) > 0


if __name__ == '__main__':
    for f in sys.argv[1:]:
        print(hits(open(f, encoding='utf-8', errors='ignore').read()), f)
