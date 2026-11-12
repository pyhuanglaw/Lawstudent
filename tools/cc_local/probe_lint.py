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
  探針清單（CC_02 丁，使用者 2026-11-12 要求、強制）：指定檔名的 cc_*.py 探針（＝剛新寫或改過的那幾支），檔頭要有一行
       「CC_02 清單 YYYY-MM-DD：1✓ 2✓ 3n/a（原因） … 13✓」——1～13 每一點都要有 ✓ 或 n/a（原因）；少一點、n/a 沒寫原因＝FAIL。
       不給參數全掃時不查這一項（舊探針很多還沒有清單），只要一改、一指定就要補。
  已知錯誤（CC_02 乙，2026-11-13）：指定的探針另外查今天犯過的寫法（PHONE.tick 傳 true、Raycaster 沒設 camera、只設 met_ 旗標、選單預設按最後一個）；
       清單日期 2026-11-13 以後的探針一定要有 FAIL_SETUP 前置自檢。那一行寫 lint-ok：原因 可以放行。
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
    consts = {}   # 模組層的字串常數（XXX_JS = """..."""），之後「XXX_JS % 參數」也照樣檢查
    for st in getattr(tree, 'body', []):
        if isinstance(st, ast.Assign) and len(st.targets) == 1 and isinstance(st.targets[0], ast.Name) and isinstance(st.value, ast.Constant) and isinstance(st.value.value, str):
            consts[st.targets[0].id] = st.value.value
    for node in ast.walk(tree):
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Mod) and ((isinstance(node.left, ast.Constant) and isinstance(node.left.value, str)) or (isinstance(node.left, ast.Name) and node.left.id in consts)):
            fmt = node.left.value if isinstance(node.left, ast.Constant) else consts[node.left.id]
            n, named = count_ph(fmt)
            stray = PH.sub('', fmt.replace('%%', ''))
            if not named and '%' in stray:   # CC-C 11-04：JS 字串裡的 wd%7 被 Python 的 % 格式化吃掉（shops2、CVS24 兩次 ValueError stray %）——要寫成 %%
                k = stray.index('%')
                out.append('%s:%d：格式字串裡有不是佔位符的 %%（要寫成 %%%%）：…%s…' % (path, node.lineno, stray[max(0, k - 25):k + 10].replace('\n', ' ')))
                continue
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
    lines = src.splitlines()
    for i, ln in enumerate(lines, 1):   # BB-C 15:42 SAVE-LZ-1104：存檔第二步會改成預設壓縮，讀存檔要走 GAME.readSave
        if re.search(r"JSON\.parse\(\s*localStorage\.getItem\(\s*['\"]fatiao3d_", ln) and 'readSave' not in ln:
            out.append('%s:%d：直接 JSON.parse(localStorage.getItem(\'fatiao3d_…\'))：改成 (GAME.readSave?GAME.readSave(k):JSON.parse(localStorage.getItem(k)))（SAVE-LZ-1104 第二步會預設壓縮）' % (path, i))
    for node in ast.walk(tree):   # BB-C 15:18：GG_views_r2 電腦上起不來（子行程裡的 fast_shots.py 寫死雲端 chromium 路徑，gpu_wrap 只改同一個行程）
        if not isinstance(node, ast.Call):
            continue
        f = node.func
        line = lines[node.lineno - 1] if 0 < node.lineno <= len(lines) else ''
        if isinstance(f, ast.Attribute) and isinstance(f.value, ast.Name) and f.value.id == 'subprocess' and f.attr in ('run', 'Popen', 'call', 'check_call', 'check_output') and node.args:
            a0 = node.args[0]
            if isinstance(a0, ast.List) and a0.elts and isinstance(a0.elts[0], ast.Attribute) and getattr(a0.elts[0].value, 'id', '') == 'sys' and a0.elts[0].attr == 'executable':
                second = a0.elts[1] if len(a0.elts) > 1 else None
                sv = second.value if isinstance(second, ast.Constant) else (second.id if isinstance(second, ast.Name) else '')
                if str(sv) not in ('-m', '-c') and 'gpu_wrap' not in str(sv).lower() and 'gpu_wrap-ok' not in line:
                    out.append('%s:%d：子行程跑 Python 腳本沒有經過 gpu_wrap（電腦上拿不到 GPU、寫死的雲端 chromium 路徑會打不開）：改成 [sys.executable, <tools/cc_local/gpu_wrap.py>, 腳本, …]；不開瀏覽器的在那一行加 # gpu_wrap-ok' % (path, node.lineno))
        for kw in node.keywords or []:
            if kw.arg == 'executable_path' and isinstance(kw.value, ast.Constant) and isinstance(kw.value.value, str) and kw.value.value.startswith('/opt/pw-browsers') and 'os.path.exists' not in line:
                out.append('%s:%d：executable_path 寫死雲端的 %s：寫成「雲端才用」（os.path.exists 判斷），同一個行程 gpu_wrap 會拿掉，子行程不會' % (path, node.lineno, kw.value.value))
    try:
        import pyflakes  # noqa: F401
        r = subprocess.run([sys.executable, '-m', 'pyflakes', path], capture_output=True, text=True)
        for line in (r.stdout + r.stderr).splitlines():
            if 'undefined name' in line or 'syntax' in line.lower():
                out.append(line.strip())
    except ImportError:
        pass


CHK_LINE = re.compile(r'CC_02 清單 (\d{4}-\d{2}-\d{2})：(.*)')
CHK_ITEM = re.compile(r'(?<![0-9])(1[0-3]|[1-9])(✓|n/a（[^）]+）)')


# CC_02 乙（使用者 2026-11-13：「探針自己寫錯 可以避免這個發生這麼多次嗎」）：今天已經犯過、機器擋得住的寫法。那一行寫「lint-ok：原因」可以放行。
KNOWN = [
    (re.compile(r"PHONE\.tick\(\s*G\s*,\s*true\s*\)"), 'PHONE.tick 第二個參數要傳函式（傳 true＝notify is not a function，TUTOR_BACK r2）'),
    (re.compile(r"len\(\s*\w+\[\s*'choices'\s*\]\s*\)\s*-\s*1"), '選單找不到要的選項就按最後一個＝按到「先不吃／算了」（燒臘、INVITE）；找不到要記下來、照字選，不要預設最後一個'),
]
def check_known(path, out):
    src = open(path, encoding='utf-8').read(); lines = src.splitlines()
    for i, ln in enumerate(lines, 1):
        if 'lint-ok' in ln: continue
        for rx, why in KNOWN:
            if rx.search(ln): out.append('%s:%d：%s' % (path, i, why))
    if 'new THREE.Raycaster(' in src and not re.search(r"\.camera\s*=|setFromCamera\(", src):
        out.append('%s：用了 THREE.Raycaster 卻沒設 camera（場景有 Sprite 時 null.matrixWorld 當掉，SUNNY_DOOR_walk r1）' % path)
    if re.search(r"flags\[\s*'met_'|'met_'\s*\+", src) and 'SOCIAL.meet(' not in src and 'lint-ok' not in src:
        out.append('%s：只設 met_ 旗標當作「認識她」——遊戲看的是 SOCIAL 的 FIRST_MET，要用 SOCIAL.meet（INVITE_TZ r1 跑出第一次見面）' % path)
    m = None
    for ln in lines[:80]:
        m = CHK_LINE.search(ln)
        if m: break
    if m and m.group(1) >= '2026-11-13' and 'FAIL_SETUP' not in src:
        out.append('%s：2026-11-13 起的新探針要有前置自檢——讀檔、捷徑做完先用遊戲自己的判斷確認（店有開、真的認識、找到的就是指定那個、鏡頭朝著要拍的東西），不成立就記「FAIL_SETUP」並停，不要跑完整支' % path)


def check_checklist(path, out):
    """CC_02 丁：新寫／修改的探針，檔頭要有一行逐條過的 13 點清單（使用者 2026-11-12：「你要自己寫規則讓以後不會再做這種事」）"""
    src = open(path, encoding='utf-8').read()
    m = None
    for ln in src.splitlines()[:80]:
        m = CHK_LINE.search(ln)
        if m: break
    if not m:
        out.append('%s：檔頭沒有「CC_02 清單 YYYY-MM-DD：1✓ 2✓ … 13✓」——改探針前要先逐條過 CC_02 丙的 13 點，寫進檔頭（CC_02 丁）' % path); return
    got = {int(a): b for a, b in CHK_ITEM.findall(m.group(2))}
    miss = [k for k in range(1, 14) if k not in got]
    if miss: out.append('%s：CC_02 清單少了第 %s 點（每一點都要寫 ✓ 或 n/a（原因））' % (path, '、'.join(map(str, miss))))


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
        if args and os.path.isfile(p) and p.endswith('.py') and os.path.basename(p).startswith('cc_') and 'test_tools' in os.path.abspath(p) and not os.path.basename(p).endswith('_lib.py'):
            check_checklist(p, out)   # CC_02 丁：指定的探針檔（剛改的）要有 13 點清單
            check_known(p, out)   # CC_02 乙：已經犯過的寫法（2026-11-13）
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
