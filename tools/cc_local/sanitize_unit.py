# -*- coding: utf-8 -*-
"""CC（帳號 A）TEST-TRACE-1104：推送前清理（run_queue.Sanitizer、cc_trace.san）的單元測試（BB 05:15 缺口 2）。
用法：python3 tools/cc_local/sanitize_unit.py [要掃描的資料夾 ...]
  → 每項 PASS／FAIL，最後 ALL PASS／FAILED n。給了資料夾就再掃一遍裡面的文字檔和 zip（只讀，不改），列出還留著的本機資訊。
不開瀏覽器、不碰 git。
"""
import io, json, os, sys, tempfile, zipfile
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import run_queue as R
import cc_trace as T

fails = []


def check(ok, msg, extra=''):
    print(('PASS ' if ok else 'FAIL ') + msg + (('  ' + str(extra)) if extra else ''), flush=True)
    if not ok:
        fails.append(msg)


UUID = 'd06332e2-ec70-5e42-a15c-5a4b27dbdb56'
CASES = [
    # (名稱, 原文, 清完不能出現的字, 清完應該出現的字)
    ('雲端 scratchpad（/tmp 開頭）', '/tmp/claude-0/-home-user-Lawstudent/%s/scratchpad/trace_sys/q/out' % UUID,
     ['claude-0', UUID, '-home-user'], '<SCRATCH>/trace_sys'),
    ('雲端 scratchpad（已換成 <TMP>）', '[gpu_wrap] 跑 <TMP>/claude-0/-home-user-Lawstudent/%s/scratchpad/trace' % UUID,
     ['claude-0', UUID, '-home-user'], '<SCRATCH>/trace'),
    ('雲端 scratchpad 底下的 worktree', 'cwd=/tmp/claude-0/-home-user-Lawstudent/%s/scratchpad/wt_l2/tests' % UUID,
     ['wt_l2', UUID], '<WT>/tests'),
    ('runner 的 worktree', 'open <WTROOT>/wt_cc_NOODLE_exit/index.html', ['wt_cc_NOODLE_exit'], '<WT>/index.html'),
    ('編碼過的目錄名 -home-<user>-…', 'projects/-home-alice-Lawstudent/x.jsonl', ['alice'], '<HOMEDIR>/x.jsonl'),
    ('編碼過的 Windows 目錄名 C--Users-…', r'C--Users-Bob-Documents-Lawstudent\log', ['Bob'], '<HOMEDIR>'),
    ('Windows 反斜線', r'File "C:\Users\MSI\Documents\Lawstudent_cclocal\tools\x.py", line 3', ['MSI'], r'C:\Users\<USER>\Documents'),
    ('Windows 正斜線（大小寫不分）', 'c:/users/Msi/AppData/Local/ms-playwright/chromium', ['Msi'], 'c:/users/<USER>/AppData'),
    ('file:// URL', 'page close url=file:///C:/Users/MSI/Documents/Lawstudent/out/page.html', ['MSI'], 'file:///C:/Users/<USER>/Documents'),
    ('URL 編碼的路徑', 'trace=file%3Fpath%3DC%3A%5CUsers%5CMSI%5Ctrace.zip', ['MSI'], '%5CUsers%5C<USER>'),
    ('JSON 跳脫過的 \\\\Users\\\\', json.dumps({'url': 'C:\\Users\\MSI\\Documents\\a.png'}), ['MSI'], 'Users\\\\<USER>'),
    ('Linux 家目錄', 'at /home/carol/proj/test.py:3', ['carol'], '/home/<USER>/proj'),
    ('Cookie／Token', 'Cookie: sid=abc123; token=XYZ987 Authorization: Bearer', ['abc123', 'XYZ987'], '<REDACTED>'),
    ('一般文字不動', 'FAIL B 文字是「錯的預期」  實際 按過了：祐廷  zone=gongguan', [], 'FAIL B 文字是「錯的預期」  實際 按過了：祐廷  zone=gongguan'),
]

san = R.Sanitizer([('/nonexistent/repo/path', '<REPO>')])
for name, src, bad, want in CASES:
    for who, fn in (('run_queue', lambda x: san.text(x)), ('run_queue zip 模式', lambda x: san.text(x, word=False)), ('cc_trace', T.san)):
        out = fn(src)
        ok = not any(b in out for b in bad) and want in out
        check(ok, '%s：%s' % (who, name), out if not ok else '')
    check(not san.hits(san.text(src)), 'run_queue：%s 清完再掃沒有命中' % name, san.hits(san.text(src)))

# 已經清過的不會再被改（冪等）
for name, src, bad, want in CASES:
    once = san.text(src)
    check(san.text(once) == once, '冪等：%s' % name)

# zip：trace 的 entry（trace.trace／trace.network）
tmp = tempfile.mkdtemp(prefix='san_unit_')
zp = os.path.join(tmp, 't.zip')
trace_line = json.dumps({'type': 'console', 'text': 'x', 'location': {'url': 'file:///C:/Users/MSI/Documents/Lawstudent/index.html'}})
net_line = json.dumps({'type': 'resource-snapshot', 'snapshot': {'request': {'url': 'http://127.0.0.1:8800/index.html',
                       'headers': [{'name': 'Cookie', 'value': 'sid=SECRET1'}, {'name': 'Authorization', 'value': 'Bearer SECRET2'}]},
                       'note': '/tmp/claude-0/-home-user-Lawstudent/%s/scratchpad/trace_sys/x' % UUID}})
with zipfile.ZipFile(zp, 'w') as z:
    z.writestr('trace.trace', trace_line + '\n')
    z.writestr('trace.network', net_line + '\n')
    z.writestr('resources/abc.jpeg', b'\xff\xd8\xff\x00binary')
n, left = san.zipfile(zp)
with zipfile.ZipFile(zp) as z:
    tt = z.read('trace.trace').decode(); tn = z.read('trace.network').decode(); jb = z.read('resources/abc.jpeg')
check(n == 2, 'zip：改寫了 2 個文字 entry', n)
check('MSI' not in tt and 'Users/<USER>' in tt, 'zip：trace.trace 的 file:// 路徑', tt)
check('SECRET1' not in tn and 'SECRET2' not in tn and tn.count('<REDACTED>') == 2, 'zip：trace.network 的 Cookie／Authorization 標頭', tn)
check(UUID not in tn and '<SCRATCH>' in tn, 'zip：trace.network 的 scratchpad 路徑', tn)
check(jb == b'\xff\xd8\xff\x00binary', 'zip：二進位 entry 原樣保留')
check(not left, 'zip：清完再掃沒有命中', left)
try:
    json.loads(tt); json.loads(tn)
    check(True, 'zip：改寫後每行還是合法 JSON')
except Exception as e:
    check(False, 'zip：改寫後每行還是合法 JSON', e)

# 掃描資料夾（只讀）
for d in sys.argv[1:]:
    hits = []
    nfile = 0
    for dp, _, fs in os.walk(d):
        for f in fs:
            fp = os.path.join(dp, f)
            nfile += 1
            if f.lower().endswith('.zip'):
                with zipfile.ZipFile(fp) as z:
                    for e in z.namelist():
                        try:
                            s = z.read(e).decode('utf-8')
                        except UnicodeDecodeError:
                            continue
                        h = san.hits(s) + [b for b in ('/tmp/claude', '/root/', '/home/user', UUID) if b in s]
                        if h:
                            hits.append('%s!%s: %s' % (f, e, sorted(set(h))))
            else:
                try:
                    s = open(fp, encoding='utf-8').read()
                except (UnicodeDecodeError, OSError):
                    continue
                h = san.hits(s) + [b for b in ('/tmp/claude', '/root/', '/home/user', UUID) if b in s]
                if h:
                    hits.append('%s: %s' % (os.path.relpath(fp, d), sorted(set(h))))
    check(not hits, '掃描 %s（%d 個檔）沒有本機資訊' % (d, nfile), hits[:10])

print('ALL PASS' if not fails else 'FAILED %d' % len(fails), flush=True)
sys.exit(1 if fails else 0)
