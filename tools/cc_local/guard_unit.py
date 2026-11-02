# -*- coding: utf-8 -*-
"""CC（帳號 A）：config.txt 並行數、記憶體保護、殘留瀏覽器清理 的單元測試（BB 22:09）。不碰 git、不開瀏覽器。"""
import os, sys, tempfile, threading, time, shutil, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import run_queue as R
fails = []
def check(ok, msg, extra=''):
    print(('PASS ' if ok else 'FAIL ') + msg + (('  ' + str(extra)) if extra else ''), flush=True)
    if not ok: fails.append(msg)
class A: pass

def make(items, work, mem=None, parallel=2, dur=0.3):
    tf = tempfile.NamedTemporaryFile('w', delete=False, suffix='.py'); tf.write('v1'); tf.close(); R.SELF_FILE = tf.name
    a = A(); a.repo = work; a.work = work; a.branch_local = 'x'; a.queue = None; a.headless = True; a.no_push = True; a.parallel = parallel; a.only = ''
    class FR(R.Runner):
        def banner(s): pass
        def setup(s): pass
        def start_commit(s): pass
        def refresh(s): pass
        def read_queue(s): return [R.Item([i, 'abc', 'py', 's.py', 'u', '1', '']) for i in items]
        def is_done(s, it, sha): return False
        def run_item(s, it):
            with s.lk: s.live += 1; s.maxlive = max(s.maxlive, s.live); s.started.append(it.id)
            time.sleep(dur)
            with s.lk: s.live -= 1
    r = FR(a); r.lk = threading.Lock(); r.live = 0; r.maxlive = 0; r.started = []
    R.mem_used_pct = (lambda: mem) if mem is not None else ORIG_MEM
    return r

ORIG_MEM = R.mem_used_pct
w = tempfile.mkdtemp(); os.makedirs(os.path.join(w, 'tools', 'cc_local'))
cfg = os.path.join(w, 'tools', 'cc_local', 'config.txt')

# 1. config.txt PARALLEL=3 → 同時跑 3 項
open(cfg, 'w').write('# 註解\nPARALLEL=3\n')
r = make(['a', 'b', 'c', 'd', 'e', 'f'], w, mem=50); r.main()
check(r.maxlive == 3 and r.a.parallel == 3, '1 config.txt PARALLEL=3：同時 3 項', r.maxlive)
# 2. 沒有 config.txt → 照 --parallel 2
os.remove(cfg); r = make(['a', 'b', 'c', 'd'], w, mem=50); r.main()
check(r.maxlive == 2, '2 沒有 config.txt：照命令列 2', r.maxlive)
# 3. 怪值：PARALLEL=9 → 上限 4；PARALLEL=x → 不變
open(cfg, 'w').write('PARALLEL=9\n'); r = make(['a'], w, mem=50); r.apply_config(); check(r.a.parallel == 4, '3 PARALLEL=9 夾到 4', r.a.parallel)
open(cfg, 'w').write('PARALLEL=x\n'); r = make(['a'], w, mem=50); r.apply_config(); check(r.a.parallel == 2, '3 PARALLEL=x 不變', r.a.parallel)
# 4. 記憶體 90%：手上有項目就不開新的（一次只跑 1 項），但不會卡死（全部都跑完）
open(cfg, 'w').write('PARALLEL=3\n'); r = make(['a', 'b', 'c'], w, mem=90); rc = r.main()
check(r.maxlive == 1 and sorted(r.started) == ['a', 'b', 'c'] and rc == 0, '4 記憶體 90%：一次只開 1 項、全部照樣跑完', (r.maxlive, r.started))
# 5. 記憶體讀不到（None）：照常
r = make(['a', 'b', 'c'], w, mem=None); R.mem_used_pct = lambda: None; r.main()
check(r.maxlive == 3, '5 記憶體讀不到：照 PARALLEL 跑', r.maxlive)
R.mem_used_pct = ORIG_MEM
check(isinstance(R.mem_used_pct(), int), '5 這台機器讀得到記憶體 %', R.mem_used_pct())

# 6. 殘留瀏覽器：只殺 ms-playwright 路徑底下的
d = tempfile.mkdtemp()
pw = os.path.join(d, 'ms-playwright', 'chromium-1', 'chrome-linux'); os.makedirs(pw)
other = os.path.join(d, 'google', 'chrome'); os.makedirs(other)
shutil.copy('/bin/sleep', os.path.join(pw, 'chrome')); shutil.copy('/bin/sleep', os.path.join(other, 'chrome'))
p1 = subprocess.Popen([os.path.join(pw, 'chrome'), '60']); p2 = subprocess.Popen([os.path.join(other, 'chrome'), '60'])
time.sleep(0.3)
found = R.kill_leftover_browsers(); time.sleep(0.3)
check(p1.poll() is not None, '6 ms-playwright 底下的「chrome」被結束', found)
check(p2.poll() is None, '6 其他路徑的 chrome（模擬使用者的 Chrome）沒有動')
check(all('ms-playwright' in x[1] for x in found), '6 清單裡只有 ms-playwright 路徑', found)
p2.kill()
print('ALL PASS' if not fails else 'FAILED %d' % len(fails)); sys.exit(1 if fails else 0)
