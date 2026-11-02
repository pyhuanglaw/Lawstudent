# -*- coding: utf-8 -*-
"""CC（帳號 A）：run_queue.py 自我更新（exit 75）的單元測試（BB 2026-11-02 20:08；BB_229 第 1 條：雲端先驗）。
用法：python3 tools/cc_local/restart_unit.py      → 每項 PASS／FAIL，最後 ALL PASS／FAILED n
不碰 git、不開瀏覽器：Runner 的 banner／setup／refresh／read_queue／is_done／run_item 都換成假的；
SELF_FILE 指到暫存檔，refresh 時改它的內容＝模擬「合併 cc-testing 以後 runner 有新版」。
"""
import os, sys, tempfile, threading, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import run_queue as R

fails = []
def check(ok, msg, extra=''):
    print(('PASS ' if ok else 'FAIL ') + msg + (('  ' + str(extra)) if extra else ''), flush=True)
    if not ok: fails.append(msg)


class A: pass


def make(items, change_after=None, parallel=2, dur=None):
    """change_after＝第幾次 refresh 時改 runner 檔（None＝不改）；dur＝每項跑幾秒（dict）"""
    tf = tempfile.NamedTemporaryFile('w', delete=False, suffix='.py'); tf.write('v1'); tf.close()
    R.SELF_FILE = tf.name
    a = A(); a.repo = tempfile.gettempdir(); a.work = None; a.branch_local = 'x'; a.queue = None
    a.headless = True; a.no_push = True; a.parallel = parallel; a.only = ''
    class FR(R.Runner):
        def banner(s): pass
        def setup(s): pass
        def start_commit(s): pass
        def read_queue(s): return [R.Item([i, 'abc', 'py', 's.py', 'u', '1', '']) for i in items]
        def is_done(s, it, sha): return False
        def refresh(s):
            s.nref = getattr(s, 'nref', 0) + 1
            if change_after is not None and s.nref == change_after:
                open(R.SELF_FILE, 'w').write('v2')
        def run_item(s, it):
            with s.lk: s.started.append(it.id); s.live += 1; s.maxlive = max(s.maxlive, s.live)
            time.sleep((dur or {}).get(it.id, 0.2))
            with s.lk: s.live -= 1; s.finished.append(it.id)   # 真的 run_item 在這裡已經 commit＋push
    r = FR(a); r.lk = threading.Lock(); r.started = []; r.finished = []; r.live = 0; r.maxlive = 0
    return r


# 1. 沒有新版：整個佇列跑完，回傳 0
r = make(['a', 'b', 'c'])
rc = r.main()
check(rc == 0, '1 沒有新版：回傳 0', rc)
check(sorted(r.finished) == ['a', 'b', 'c'], '1 沒有新版：三項都跑', r.finished)

# 2. 第一項跑完以後 runner 有新版（parallel 2：a、b 同時在跑；a 先完）→ 等 b 跑完、不開新項目，回傳 75
r = make(['a', 'b', 'c', 'd'], change_after=1, dur={'a': 0.2, 'b': 1.0})
t0 = time.time(); rc = r.main(); el = time.time() - t0
check(rc == R.RESTART_EXIT == 75, '2 有新版：回傳 75', rc)
check(sorted(r.started) == ['a', 'b'], '2 有新版：之後不開新項目（c、d 沒開始）', r.started)
check(sorted(r.finished) == ['a', 'b'], '2 有新版：手上的 b 有跑完才結束（不中斷、push 完）', r.finished)
check(el >= 0.95, '2 有新版：確實等了 b（約 1 秒）', round(el, 2))

# 3. 最後一項跑完時才發現新版 → 回傳 75（下一輪用新版）
r = make(['a'], change_after=1)
rc = r.main()
check(rc == 75, '3 最後一項後才有新版：回傳 75', rc)

# 4. 雜湊不變（refresh 有發生但內容一樣）→ 0
r = make(['a', 'b'], change_after=None, parallel=1)
rc = r.main()
check(rc == 0 and r.nref >= 1, '4 有 refresh 但檔案沒變：回傳 0', (rc, getattr(r, 'nref', 0)))

# 5. parallel 1：新版發生在第一項後 → 第二項不開始
r = make(['a', 'b'], change_after=1, parallel=1)
rc = r.main()
check(rc == 75 and r.started == ['a'], '5 parallel 1：第一項後有新版，第二項不開始', (rc, r.started))

# 6. 真正的檔案：模組的 SELF_FILE 預設是 run_queue.py 本身
import importlib; importlib.reload(R)
check(os.path.basename(R.SELF_FILE) == 'run_queue.py' and len(R.file_hash(R.SELF_FILE)) == 64, '6 SELF_FILE 預設是 run_queue.py、雜湊算得出來', R.SELF_FILE)

print('ALL PASS' if not fails else 'FAILED %d' % len(fails))
sys.exit(1 if fails else 0)
