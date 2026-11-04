"""CC（帳號 A）11-04：跑開發分支的 tests/qa_w1_shots.py，但截圖寫到 runner 的 out/（原本寫在 worktree 的 shots/qa_w1/，跑完就丟了）。
不改測試本身：讀原始碼、只把 OUT＝… 那一行換成 out 參數，其他照原樣執行（?turbo、GAME.enter、sitAt 都是那支測試原本的【前置／捷徑】）。
用法：LW_TESTS=<wt>/tests [CODES=A2,C2b] python3 cc_qa_w1_wrap.py <url> <out>"""
import os, re, sys
wt_tests = os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests')
src_path = os.path.join(wt_tests, 'qa_w1_shots.py')
url, out = sys.argv[1], sys.argv[2]
src = open(src_path, encoding='utf-8').read()
_line = "OUT = %r" % os.path.abspath(out)   # CC-C 11-04：替換值用函式——字串的話 re 會再處理一次反斜線，Windows 路徑 C:\\Users 變成 C:\Users → SyntaxError \U（WZ3_qa_w1 PC exit 1）
new, n = re.subn(r"^OUT = .*$", lambda m: _line, src, count=1, flags=re.M)
if n != 1:
    print('FAIL 找不到 qa_w1_shots.py 的 OUT＝ 那一行（測試改版了）'); sys.exit(1)
os.makedirs(out, exist_ok=True)
codes = [c for c in (os.environ.get('CODES') or '').split(',') if c.strip()]
sys.argv = [src_path, url] + codes
sys.path.insert(0, wt_tests)
g = {'__name__': '__main__', '__file__': src_path}
exec(compile(new, src_path, 'exec'), g)
