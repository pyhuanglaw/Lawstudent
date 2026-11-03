# -*- coding: utf-8 -*-
"""CC（帳號 A）11-03：SOLO=1 單獨跑、blender 等待不擋後面、Blender 一律 CPU 的單元測試（不碰 git、不開瀏覽器）。
在修改前的 runner（746f7e1af^）上，「blender 不擋後面」那一項會 FAIL；在 9fc958082^ 上，SOLO 那兩項會 FAIL。"""
import os, sys, tempfile, threading, time
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import run_queue as R
fails = []
def check(msg, ok, extra=""):
    print(('PASS ' if ok else 'FAIL ') + msg + (('  ' + str(extra)) if extra else ''), flush=True)
    if not ok: fails.append(msg)
class A: pass

def make(rows, parallel=3):
    tf = tempfile.NamedTemporaryFile('w', delete=False, suffix='.py'); tf.write('v1'); tf.close(); R.SELF_FILE = tf.name
    a = A(); a.repo = a.work = tempfile.mkdtemp(); a.branch_local = 'x'; a.queue = None; a.headless = True; a.no_push = True; a.parallel = parallel; a.only = ''
    class FR(R.Runner):
        def banner(s): pass
        def setup(s): pass
        def start_commit(s): pass
        def refresh(s): pass
        def read_queue(s): return [R.Item(r) for r in rows]
        def is_done(s, it, sha): return it.id in s.done_pre
        def run_item(s, it):
            with s.lk:
                s.events.append(('start', it.id, sorted(s.live))); s.live.add(it.id)
            time.sleep(s.dur.get(it.id, 0.3))
            with s.lk:
                s.live.discard(it.id); s.events.append(('end', it.id))
    r = FR(a); r.lk = threading.Lock(); r.live = set(); r.events = []; r.dur = {}; r.done_pre = set()
    R.mem_used_pct = lambda: 10
    return r

def started_with(r, iid):
    for e in r.events:
        if e[0] == 'start' and e[1] == iid: return e[2]
    return None

# 1. blender 在等時，後面的一般項目照樣開始
r = make([['LONG', 'a', 'py', 's', 'u', '9', ''], ['BL', 'a', 'blender', 's', 'u', '1', ''], ['P1', 'a', 'py', 's', 'u', '1', '']])
r.dur = {'LONG': 1.5}
t = threading.Thread(target=r.main, daemon=True); t.start(); t.join(20)
s = [e[1] for e in r.events if e[0] == 'start']
check('blender 等待時，排在後面的 P1 先開始（不擋佇列）', s.index('P1') < s.index('BL'), s)
check('blender 開始時沒有別的項目在跑（獨佔）', started_with(r, 'BL') == [], started_with(r, 'BL'))

# 2. SOLO：輪到它就不開新的；它跑的時候也不開別的
r = make([['A1', 'a', 'py', 's', 'u', '1', ''], ['SO', 'a', 'py', 's', 'u', '1', 'SOLO=1'], ['B1', 'a', 'py', 's', 'u', '1', '']])
t = threading.Thread(target=r.main, daemon=True); t.start(); t.join(20)
check('SOLO 開始時沒有別的項目在跑', started_with(r, 'SO') == [], started_with(r, 'SO'))
check('SOLO 跑的時候 B1 沒有開始（B1 在 SOLO 結束後才開始）', started_with(r, 'B1') == [], started_with(r, 'B1'))

# 3. 已經跑完的 SOLO 不擋佇列
r = make([['A1', 'a', 'py', 's', 'u', '1', ''], ['SO', 'a', 'py', 's', 'u', '1', 'SOLO=1'], ['B1', 'a', 'py', 's', 'u', '1', '']])
r.done_pre = {'SO'}; r.dur = {'A1': 1.0}
t = threading.Thread(target=r.main, daemon=True); t.start(); t.join(20)
check('已完成的 SOLO 跳過，B1 和 A1 同時跑', started_with(r, 'B1') == ['A1'], started_with(r, 'B1'))

# 4. Blender 一律 CPU、留核心給系統
check('blender_threads()＝核心數減 2、至少 1', R.blender_threads() == max(1, (os.cpu_count() or 4) - 2), R.blender_threads())
src = open(R.__file__, encoding='utf-8').read()
check("run_item 對 blender 強制 CC_BLENDER_DEVICE='CPU'", "env['CC_BLENDER_DEVICE'] = 'CPU'" in src)
check("blender 執行檔模式加 -t（執行緒數）", "'-b', '-t'," in src)

# 5. SCRIPT_FROM：從企劃分支取腳本放進工作樹（BB 13:30）
import subprocess
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
REL = '.claude/skills/blender-web-3d/assets/blender/export_glb.py'
r = make([['BLX', 'a', 'blender', REL, 'u', '1', 'SCRIPT_FROM=story']])
r.repo = REPO; r.blender = '/opt/blenv/bin/python'
wt = tempfile.mkdtemp(); od = tempfile.mkdtemp()
it = R.Item(['BLX', 'a', 'blender', REL, 'u', '1', 'SCRIPT_FROM=story'])
env = {'SCRIPT_FROM': 'story', 'CC_BLENDER_THREADS': '2'}
try:
    cmd, cwd = r.build_cmd(it, wt, od, 'u', None, env)
    want = subprocess.run(['git', '-C', REPO, 'show', 'origin/claude/story-planning:' + REL], capture_output=True, text=True).stdout
    got = open(os.path.join(wt, REL), encoding='utf-8').read()
    check('SCRIPT_FROM=story：工作樹裡的腳本和企劃分支上的一樣', got == want and len(got) > 0, len(got))
    check('SCRIPT_FROM：指令跑的是工作樹裡的那一份', os.path.join(wt, REL) in cmd, cmd[:3])
except Exception as e:
    check('SCRIPT_FROM=story：build_cmd 不出錯', False, repr(e))
it2 = R.Item(['BLY', 'a', 'blender', 'no/such/file.py', 'u', '1', 'SCRIPT_FROM=story'])
try:
    r.build_cmd(it2, wt, od, 'u', None, {'SCRIPT_FROM': 'story'}); check('SCRIPT_FROM：找不到檔案時報錯', False)
except RuntimeError as e:
    check('SCRIPT_FROM：找不到檔案時報錯（不默默跑舊檔）', 'cannot read' in str(e), str(e))

# 5b. SCRIPT_FROM 也用在 probe（BB 14:40：BB 的探針在企劃分支）
r.wtroot = tempfile.mkdtemp(); r.py = sys.executable; r.work = REPO
itp = R.Item(['PRB', 'a', 'probe', REL, 'u', '1', 'SCRIPT_FROM=story'])
itp.rsha = 'abc'
try:
    cmd, cwd = r.build_cmd(itp, wt, od, 'u', None, {'SCRIPT_FROM': 'story'})
    sp = os.path.join(r.wtroot, '_script_from', 'PRB', REL)
    check('SCRIPT_FROM（probe）：腳本放在 runner 暫存資料夾、指令跑那一份、內容和企劃分支一樣', sp in cmd and open(sp, encoding='utf-8').read() == want, cmd[:3])
except Exception as e:
    check('SCRIPT_FROM（probe）：build_cmd 不出錯', False, repr(e))

# 6. 超過 50 MB 的結果檔不推
check('BIG_CAP＝50 MB', R.BIG_CAP == 50 * 1024 * 1024, R.BIG_CAP)
check('結果收集時超過 BIG_CAP 的檔寫進 notes.txt、不加進 add', "not pushed (over 50 MB)" in src)

print('ALL PASS' if not fails else 'FAILED %d' % len(fails))
sys.exit(1 if fails else 0)
