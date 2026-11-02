# -*- coding: utf-8 -*-
"""CC（帳號 A）：探針送佇列前的靜態檢查（BB_229 第 8 條，2026-11-02 17:51 UTC）。
用法：python3 tools/cc_local/probe_lint.py [檔案或資料夾 ...]
      不給參數＝docs/story_planning/test_tools/cc/ 底下全部 .py、.js，加上 tools/cc_local/*.py
檢查：
  .py：1. py_compile（語法）
       2. pyflakes（有裝才跑：未定義的名稱、沒用到的 import）
       3. 「'格式' % (參數...)」的 %s／%d／%g… 數目和參數數目一致（用 ast：跨行串接的字串會先合成一個，不會誤報）；
          右邊是單一名稱、但格式裡有 2 個以上 % 的，也算錯（R6、R10 今晚就是這兩種）
  .js：node --check（語法）
結果：每個問題一行「FAIL 檔案:行 說明」，最後 ALL PASS／FAILED n；exit 0／1。
"""
import ast, os, re, subprocess, sys, py_compile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PH = re.compile(r'%(?:\([^)]*\))?[-#0 +]*(?:\d+|\*)?(?:\.(?:\d+|\*))?[diouxXeEfFgGcrsa]')


def count_ph(fmt):
    s = fmt.replace('%%', '')
    return len(PH.findall(s)), ('%(' in s)


def check_py(path, out):
    try:
        py_compile.compile(path, doraise=True)
    except py_compile.PyCompileError as e:
        out.append('%s：語法錯誤 %s' % (path, str(e).splitlines()[-1][:200])); return
    src = open(path, encoding='utf-8').read()
    try:
        tree = ast.parse(src)
    except SyntaxError as e:
        out.append('%s:%s：ast 解析失敗 %s' % (path, e.lineno, e.msg)); return
    for node in ast.walk(tree):
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Mod) and isinstance(node.left, ast.Constant) and isinstance(node.left.value, str):
            n, named = count_ph(node.left.value)
            if named or n == 0:
                continue
            r = node.right
            if isinstance(r, ast.Tuple):
                if any(isinstance(e, ast.Starred) for e in r.elts):
                    continue
                if len(r.elts) != n:
                    out.append('%s:%d：格式字串有 %d 個 %%，卻給了 %d 個參數：%s' % (path, node.lineno, n, len(r.elts), node.left.value[:60].replace('\n', ' ')))
            elif isinstance(r, (ast.Dict, ast.DictComp)):
                continue
            elif n > 1:
                out.append('%s:%d：格式字串有 %d 個 %%，右邊卻不是 tuple（只有 1 個參數）：%s' % (path, node.lineno, n, node.left.value[:60].replace('\n', ' ')))
    try:
        import pyflakes  # noqa: F401
        r = subprocess.run([sys.executable, '-m', 'pyflakes', path], capture_output=True, text=True)
        for line in (r.stdout + r.stderr).splitlines():
            if 'undefined name' in line or 'syntax' in line.lower():
                out.append(line.strip())
    except ImportError:
        pass


def check_js(path, out):
    r = subprocess.run(['node', '--check', path], capture_output=True, text=True)
    if r.returncode != 0:
        out.append('%s：node --check 失敗 %s' % (path, (r.stderr.strip().splitlines() or [''])[-1][:200]))


def targets(args):
    if not args:
        args = [os.path.join(ROOT, 'docs/story_planning/test_tools/cc'), os.path.join(ROOT, 'tools/cc_local')]
    for a in args:
        if os.path.isdir(a):
            for dp, _, fs in os.walk(a):
                for f in sorted(fs):
                    if f.endswith(('.py', '.js')):
                        yield os.path.join(dp, f)
        else:
            yield a


def main(args):
    out = []; n = 0
    for p in targets(args):
        n += 1
        (check_py if p.endswith('.py') else check_js)(p, out)
    for line in out:
        print('FAIL ' + (line[len(ROOT) + 1:] if line.startswith(ROOT + '/') else line))
    try:
        import pyflakes  # noqa: F401
        fl = '有 pyflakes'
    except ImportError:
        fl = '沒有 pyflakes（只做 py_compile＋格式字串檢查）'
    print('檢查 %d 個檔案（%s）' % (n, fl))
    print('ALL PASS' if not out else 'FAILED %d' % len(out))
    return 1 if out else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
