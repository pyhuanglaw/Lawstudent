"""CC-C 11-04：run_queue.py 的畫面輸出不擋工作執行緒（_emit／console-writer）。
  模擬 Windows 主控台在選取狀態（快速編輯）：畫面的 write 一直卡住 →
  ① 三條執行緒各 log 50 行，全部在 2 秒內回來（以前拿著 _print_lock 印，會全部卡住）；
  ② CONSOLE_BUF（推上去的 console.log）照樣有這 150 行；
  ③ log_flush(timeout) 在畫面卡住時照 timeout 回來（False），不會讓 runner 結束不了；
  ④ 畫面放開以後 150 行都印出來，同一條執行緒的順序不變；
  ⑤ gray() 多行、空字串不出錯。
用法：python3 tools/cc_local/console_unit.py"""
import os, sys, threading, time, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('rq', os.path.join(HERE, 'run_queue.py'))
rq = importlib.util.module_from_spec(spec); spec.loader.exec_module(rq)
FAILS = []


REAL = sys.stdout


def check(name, ok, info=''):   # 直接寫真的 stdout：sys.stdout 換成卡住的假畫面了
    REAL.write(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else '') + '\n'); REAL.flush()
    if not ok: FAILS.append(name)


class Stuck(object):
    def __init__(self):
        self.gate = threading.Event(); self.out = []
    def write(self, t):
        self.gate.wait(); self.out.append(t); return len(t)
    def flush(self):
        pass


real = REAL
stuck = Stuck()
sys.stdout = rq.ConsoleTee(stuck, rq.CONSOLE_BUF, rq.CONSOLE_LOCK)
try:
    n0 = len(rq.CONSOLE_BUF)
    t0 = time.time()
    def worker(k):
        for i in range(50): rq.log('w%d line %02d' % (k, i))
    ths = [threading.Thread(target=worker, args=(k,)) for k in range(3)]
    for t in ths: t.start()
    for t in ths: t.join(5)
    dt = time.time() - t0
    alive = [t for t in ths if t.is_alive()]
    check('① 畫面卡住時 3×50 行 log 都馬上回來', not alive and dt < 2, '%.2f 秒、還卡著 %d 條' % (dt, len(alive)))
    buf = [l for l in list(rq.CONSOLE_BUF)[n0:] if ' line ' in l]
    check('② console.log 的緩衝照樣有 150 行', len(buf) == 150, '%d 行' % len(buf))
    t1 = time.time(); ok = rq.log_flush(0.5); dt2 = time.time() - t1
    check('③ 畫面卡住時 log_flush(0.5) 照時間回來、回 False', (not ok) and dt2 < 1.5, 'ok=%s %.2f 秒' % (ok, dt2))
    stuck.gate.set()
    ok2 = rq.log_flush(5)
    lines = ''.join(stuck.out).splitlines()
    got = [l for l in lines if ' line ' in l]
    order = all([int(l.split()[-1]) for l in got if (' w%d ' % k) in l] == list(range(50)) for k in range(3))
    check('④ 放開以後 150 行都印出來、同一條執行緒順序不變', ok2 and len(got) == 150 and order, 'flush=%s %d 行 順序=%s' % (ok2, len(got), order))
    rq.gray('a\nb\n'); rq.gray(''); rq.gray('   \n'); rq.log_flush(2)
    tail = ''.join(stuck.out)
    check('⑤ gray 多行、空字串', '    a\n    b\n' in tail, repr(tail[-40:]))
finally:
    sys.stdout = real
print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)))
sys.exit(1 if FAILS else 0)
