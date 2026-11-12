# -*- coding: utf-8 -*-
"""CC（帳號 A）：CC 測試佇列 runner 的 Python 版（行為照 run_queue_main.ps1，再加 node／blender／webkit kind 與並行）。
舊的 run_queue.ps1（main → stable → proven）原封不動，當退回層。

用法（Windows，使用者電腦）：
  py -3 "%USERPROFILE%\\Documents\\Lawstudent\\tools\\cc_local\\run_queue.py" --parallel 2
其他平台（雲端驗證）：
  python3 tools/cc_local/run_queue.py --repo /home/user/Lawstudent --no-push --branch-local cc-local-test \\
          --queue <測試佇列> --work <放結果 worktree 的資料夾>

參數：
  --repo <路徑>        repo（Windows 預設 %USERPROFILE%\\Documents\\Lawstudent；其他平台必填）
  --work <路徑>        結果 worktree（預設 repo 旁邊的 Lawstudent_cclocal）；每一項的 wt_cc_<id> 開在它的上一層
  --only id1,id2       只跑這幾項
  --parallel N         同時跑幾項（預設 2）；blender 項目獨佔
  --once               跑完佇列一輪就結束（預設就是這樣，和舊版相同）
  --no-push            只 commit 在本機分支，不 push
  --queue <檔>         改讀這個佇列檔（預設 <work>/tools/cc_local/queue.txt，每跑完一項重讀）
  --branch-local <名>  結果分支（預設 claude/cc-local）
  --headless           不開視窗（預設：Windows 或有 DISPLAY 時，probe／game／webkit 開看得到的視窗，CC_HEADLESS=0；
                       每一項傳 CC_SLOT＝並行槽位、CC_ITEM＝項目 ID，gpu_wrap 讓兩個視窗並排、標題寫「CC 測試中，請勿點選」）

佇列格式：ID | SHA | KIND | script | url | timeout分鐘 | ENV(k=v;k=v)，# 開頭跳過。
  SHA：commit；head＝origin/claude/confident-ritchie-8rwh7t；lawww2＝origin/claude/second-ai-env-art
  KIND：gpu／py／game／probe（同舊版）、
        webkit＝probe，但 CC_BROWSER=webkit（gpu_wrap.py 改開 webkit）、
        node＝node <wt>/<script> [XARGS]（cwd＝wt；CC_NODE 或 PATH 上的 node）、
        blender＝<blender> -b --python-exit-code 1 --python <wt>/<script> -- [XARGS]（CC_BLENDER；獨佔）。
          CC_BLENDER 若指到 python（檔名以 python 開頭），改成「python <script> -- [XARGS]」（bpy 模組模式）。
  ENV：k=v 只傳給這一項的子程序（不改 runner 自己的環境，並行時不互相干擾）；
       XARGS（{url} {url2} {out}）、SHA2（第二個 worktree＋伺服器＝{url2}）、RERUN（強制重跑記號）同舊版。
"""
import argparse, atexit, glob, hashlib, json, os, platform, queue, re, shutil, socket, subprocess, sys, threading, time
from collections import OrderedDict, deque
from datetime import datetime

DEV_BRANCH = 'claude/modest-rubin-2lyp7g'   # CC-B 11-09（BB-B 19:14）：值班 LAWWW 的開發分支；config.txt 的 DEV_BRANCH= 每一輪蓋過（換班時改 config，不用改程式）
CC_BRANCH = 'claude/cc-testing'
LAWWW2_BRANCH = 'claude/second-ai-env-art'
IS_WIN = os.name == 'nt'
PNG_CAP = 25 * 1024 * 1024
try:   # CC-C 11-04：只給雲端端到端驗證用（把上限壓小，才測得到「前一段放第二個 commit」）；沒設＝照舊
    if os.environ.get('CC_ITEM_CAP_MB'): PNG_CAP = int(float(os.environ['CC_ITEM_CAP_MB']) * 1024 * 1024)
except ValueError:
    pass
KINDS = ('gpu', 'py', 'game', 'probe', 'webkit', 'node', 'blender')

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

_print_lock = threading.Lock()
GIT_LOCK = threading.RLock()       # 所有 git 寫入（worktree add/remove、merge、add、commit、push）排隊
PORT_LOCK = threading.Lock()
_reserved_ports = set()


STORY_BRANCH = 'claude/story-planning'
RESTART_EXIT = 75     # BB 2026-11-02 20:08：runner 自己有新版 → 跑完手上的項目、push 完，用 75 結束；run_forever.ps1 收到 75 立刻重跑新版
SELF_FILE = os.path.abspath(__file__)
LONG_MIN = 120       # 逾時 ≥120 分鐘＝長項目（BB 20:23 規則 B）
REFRESH_SEC = int(os.environ.get('CC_REFRESH_SEC', '300'))   # 沒有項目結束時，多久重讀一次佇列
BIG_CAP = 50 * 1024 * 1024   # 結果檔（PNG 以外）超過這個大小就不推，只在 notes.txt 記路徑和大小



def trace_roles(paths):
    """每一段 trace 的角色：fail（FAIL 那一段）／prev（FAIL 的前一段）／next（FAIL 的後一段）／other。順序照 trace_push_order。"""
    import re as _re
    def cno(f):
        m = _re.search(r'_c(\d+)(?:_FAIL)?\.zip$', os.path.basename(f))
        return int(m.group(1)) if m else None
    fails = {cno(f) for f in paths if '_FAIL' in os.path.basename(f) and cno(f) is not None}
    out = []
    for f in trace_push_order(paths):
        b, n = os.path.basename(f), cno(f)
        r = 'fail' if '_FAIL' in b else ('prev' if n is not None and (n + 1) in fails else ('next' if n is not None and (n - 1) in fails else 'other'))
        out.append((f, r))
    return out


def plan_trace_commits(sized, acc0, cap, tmax):
    """BB-C 11-04 TT_V15b：上限不放寬（每個 commit ≤ cap）。FAIL 那一段放第一個 commit（和截圖、結果一起）；
    FAIL 的前一段放得進第一個就放，放不進就自己一個第二個 commit；後一段、其他：哪個 commit 還塞得下就放，都塞不下不推。一項最多兩個 commit。
    sized＝[(路徑, 角色, 大小)]；回傳 (第一個 commit 的, 第二個 commit 的, 不推的 [(路徑, 原因)])"""
    first, second, skip = [], [], []
    a1, a2 = acc0, 0
    for f, role, sz in sized:
        if sz > tmax:
            skip.append((f, 'over %d MB' % (tmax // 1048576))); continue
        if a1 + sz <= cap:
            first.append(f); a1 += sz; continue
        if role in ('prev', 'next', 'other', 'fail') and a2 + sz <= cap:
            second.append(f); a2 += sz; continue
        skip.append((f, 'item over %.0f MB with screenshots (two commits full)' % (cap / 1048576.0)))
    return first, second, skip


def trace_push_order(paths):
    """分段 trace 推上去的順序（BB-C 11-04 TT_V15b）：FAIL 那一段 ＞ FAIL 的前一段 ＞ 後一段 ＞ 其他（照檔名）。
    檔名像 trace_<ID>_<ctx>_c005_FAIL.zip；沒有 cNNN 的照舊排在後面。"""
    import re as _re
    def cno(f):
        m = _re.search(r'_c(\d+)(?:_FAIL)?\.zip$', os.path.basename(f))
        return int(m.group(1)) if m else None
    fails = {cno(f) for f in paths if '_FAIL' in os.path.basename(f) and cno(f) is not None}
    def key(f):
        b, n = os.path.basename(f), cno(f)
        if '_FAIL' in b: return (0, f)
        if n is not None and (n + 1) in fails: return (1, f)
        if n is not None and (n - 1) in fails: return (2, f)
        return (3, f)
    return sorted(paths, key=key)

def blender_threads():
    """Blender 用幾個 CPU 執行緒：全部核心減 2（留給系統和瀏覽器），至少 1；CC_BLENDER_THREADS 可以覆寫"""
    try:
        return max(1, int(os.environ.get('CC_BLENDER_THREADS') or (os.cpu_count() or 4) - 2))
    except ValueError:
        return max(1, (os.cpu_count() or 4) - 2)


def is_solo(it):
    """ENV 有 SOLO=1：這一項要單獨跑（不和別的項目同時跑）"""
    return str(getattr(it, 'envd', {}).get('SOLO', '')).strip() == '1'


def file_hash(path):
    try:
        with open(path, 'rb') as fh:
            return hashlib.sha256(fh.read()).hexdigest()
    except OSError:
        return ''


class ConsoleTee(object):
    """BB 2026-11-02 20:20（使用者：「除了截圖，沒有更方便可以複製他說了什麼的方式嗎」）：
    runner 印到畫面的每一行同時留一份（最後 2000 行），跟著每一項的結果 commit 推到
    local_out/_console/console.log，雲端不用截圖也看得到 PC 的畫面輸出。"""
    ANSI = re.compile(r'\x1b\[[0-9;]*[A-Za-z]')

    def __init__(self, stream, buf, lock):
        self.s, self.buf, self.lk, self.part = stream, buf, lock, ''

    def write(self, t):
        try:
            self.s.write(t)
        except Exception:
            pass
        with self.lk:
            self.part += self.ANSI.sub('', str(t))
            while '\n' in self.part:
                line, self.part = self.part.split('\n', 1)
                self.buf.append(line.rstrip('\r'))
        return len(t)

    def flush(self):
        try:
            self.s.flush()
        except Exception:
            pass

    def __getattr__(self, k):
        return getattr(self.s, k)


CONSOLE_BUF = deque(maxlen=2000)
CONSOLE_LOCK = threading.Lock()


def install_console_tee():
    if not isinstance(sys.stdout, ConsoleTee):
        sys.stdout = ConsoleTee(sys.stdout, CONSOLE_BUF, CONSOLE_LOCK)
    if not isinstance(sys.stderr, ConsoleTee):
        sys.stderr = ConsoleTee(sys.stderr, CONSOLE_BUF, CONSOLE_LOCK)


LOCK_STALE_SEC = 600   # BB 21:06：當機留下的 git lock，超過 10 分鐘沒更新、而且沒有 git 在跑，才刪


def git_running():
    """有沒有其他 git 程序在跑（Windows：tasklist 找 git.exe；其他：pgrep -x git）。查不到時當作「有」，不刪。"""
    try:
        if IS_WIN:
            r = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq git.exe', '/NH'], stdout=subprocess.PIPE,
                               stderr=subprocess.STDOUT, text=True, errors='replace', timeout=30)
            return 'git.exe' in (r.stdout or '').lower()
        r = subprocess.run(['pgrep', '-x', 'git'], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, timeout=30)
        return r.returncode == 0
    except Exception:
        return True


def clear_stale_git_locks(gitdir, now=None, running=None):
    """刪掉 gitdir 底下（不含 objects）過期的 *.lock；回傳刪掉的路徑。只在 runner 啟動的 setup 呼叫。"""
    now = time.time() if now is None else now
    found = []
    for dp, dns, fs in os.walk(gitdir):
        dns[:] = [d for d in dns if d != 'objects']
        for f in fs:
            if f.endswith('.lock'):
                found.append(os.path.join(dp, f))
    old = [f for f in found if now - os.path.getmtime(f) > LOCK_STALE_SEC]
    if not old:
        return []
    if (git_running() if running is None else running):
        log('stale git lock(s) found but a git process is running - not removed: %s' % ', '.join(old))
        return []
    gone = []
    for f in old:
        try:
            age = int((now - os.path.getmtime(f)) // 60)
            os.remove(f)
            gone.append(f)
            log('removed stale git lock (%d min old, left by a crash?): %s' % (age, f))
        except OSError as e:
            log('could not remove stale git lock %s: %r' % (f, e))
    return gone


MEM_LIMIT = 85         # BB 22:09：系統記憶體已用 ≥85% 就先不開新項目（手上沒有項目時照開，免得卡死）
BROWSER_DIR_PAT = os.environ.get('CC_BROWSER_DIR_PAT', 'ms-playwright')   # 只清這個路徑底下的瀏覽器（Playwright 下載的）；使用者自己的 Chrome 不在這裡


def mem_used_pct():
    """系統記憶體已用 %（Windows：GlobalMemoryStatusEx；Linux：/proc/meminfo）；讀不到回 None"""
    try:
        if IS_WIN:
            import ctypes

            class MS(ctypes.Structure):
                _fields_ = [('dwLength', ctypes.c_ulong), ('dwMemoryLoad', ctypes.c_ulong),
                            ('ullTotalPhys', ctypes.c_ulonglong), ('ullAvailPhys', ctypes.c_ulonglong),
                            ('ullTotalPageFile', ctypes.c_ulonglong), ('ullAvailPageFile', ctypes.c_ulonglong),
                            ('ullTotalVirtual', ctypes.c_ulonglong), ('ullAvailVirtual', ctypes.c_ulonglong),
                            ('ullAvailExtendedVirtual', ctypes.c_ulonglong)]
            m = MS(); m.dwLength = ctypes.sizeof(MS)
            ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(m))
            return int(m.dwMemoryLoad)
        d = {}
        with open('/proc/meminfo') as fh:
            for line in fh:
                k, v = line.split(':', 1); d[k] = int(v.split()[0])
        return int(round(100 * (1 - d['MemAvailable'] / float(d['MemTotal']))))
    except Exception:
        return None


def leftover_browsers():
    """BROWSER_DIR_PAT 路徑底下正在跑的瀏覽器程序 [(pid, 路徑)]"""
    out = []
    if IS_WIN:
        ps = ("Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -like '*\\%s\\*' } | "
              "ForEach-Object { '{0}|{1}' -f $_.ProcessId, $_.ExecutablePath }") % BROWSER_DIR_PAT
        try:
            r = subprocess.run(['powershell', '-NoProfile', '-Command', ps], stdout=subprocess.PIPE,
                               stderr=subprocess.DEVNULL, text=True, errors='replace', timeout=60)
            for line in (r.stdout or '').splitlines():
                if '|' in line:
                    pid, path = line.split('|', 1)
                    if pid.strip().isdigit():
                        out.append((int(pid), path.strip()))
        except Exception:
            pass
        return out
    for d in os.listdir('/proc'):
        if not d.isdigit():
            continue
        try:
            exe = os.readlink('/proc/%s/exe' % d)
        except OSError:
            continue
        if ('/%s/' % BROWSER_DIR_PAT) in exe:
            out.append((int(d), exe))
    return out


def kill_leftover_browsers():
    """runner 啟動時（還沒有任何項目）：結束 Playwright 下載路徑底下的殘留瀏覽器（上次 Ctrl+C／當機留下的）"""
    found = leftover_browsers()
    for pid, path in found:
        try:
            if IS_WIN:
                subprocess.run(['taskkill', '/F', '/T', '/PID', str(pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=30)
            else:
                os.kill(pid, 9)
            log('killed leftover test browser pid %d: %s' % (pid, path))
        except Exception as e:
            log('could not kill leftover browser pid %d: %r' % (pid, e))
    return found


_CPU_PREV = [None]


def cpu_pct():
    """整台 CPU 使用率 %（psutil → Windows PowerShell → Linux /proc/stat）；讀不到回 None。只讀數字"""
    try:
        import psutil
        return int(round(psutil.cpu_percent(interval=0.5)))
    except Exception:
        pass
    try:
        if IS_WIN:
            r = subprocess.run(['powershell', '-NoProfile', '-Command',
                                '(Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average'],
                               stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, errors='replace', timeout=60)
            v = (r.stdout or '').strip().splitlines()
            return int(round(float(v[-1]))) if v else None
        def snap():
            with open('/proc/stat') as fh:
                f = [int(x) for x in fh.readline().split()[1:]]
            return sum(f), f[3] + (f[4] if len(f) > 4 else 0)
        t1, i1 = snap(); time.sleep(0.5); t2, i2 = snap()
        return int(round(100 * (1 - (i2 - i1) / float(max(1, t2 - t1)))))
    except Exception:
        return None


def mem_gb():
    """(已用 GB, 總共 GB)；讀不到回 (None, None)"""
    try:
        if IS_WIN:
            import ctypes

            class MS(ctypes.Structure):
                _fields_ = [('dwLength', ctypes.c_ulong), ('dwMemoryLoad', ctypes.c_ulong),
                            ('ullTotalPhys', ctypes.c_ulonglong), ('ullAvailPhys', ctypes.c_ulonglong),
                            ('ullTotalPageFile', ctypes.c_ulonglong), ('ullAvailPageFile', ctypes.c_ulonglong),
                            ('ullTotalVirtual', ctypes.c_ulonglong), ('ullAvailVirtual', ctypes.c_ulonglong),
                            ('ullAvailExtendedVirtual', ctypes.c_ulonglong)]
            m = MS(); m.dwLength = ctypes.sizeof(MS)
            ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(m))
            return round((m.ullTotalPhys - m.ullAvailPhys) / 2.0 ** 30, 1), round(m.ullTotalPhys / 2.0 ** 30, 1)
        d = {}
        with open('/proc/meminfo') as fh:
            for line in fh:
                k, v = line.split(':', 1); d[k] = int(v.split()[0])
        return round((d['MemTotal'] - d['MemAvailable']) / 2.0 ** 20, 1), round(d['MemTotal'] / 2.0 ** 20, 1)
    except Exception:
        return None, None


def res_snapshot():
    """BB 22:11：只記數字。chrome_testing＝ms-playwright 路徑底下的程序數"""
    u, t = mem_gb()
    return {'cpu': cpu_pct(), 'mem': mem_used_pct(), 'used_gb': u, 'total_gb': t, 'chrome_testing': len(leftover_browsers())}


def res_line(r):
    return '[res] cpu=%s%% mem=%s%% (%s/%s GB) chrome_testing=%s' % (r['cpu'], r['mem'], r['used_gb'], r['total_gb'], r['chrome_testing'])


def read_config(path):
    """tools/cc_local/config.txt：k=v 一行一個（# 註解）；回傳 dict"""
    d = {}
    try:
        with open(path, encoding='utf-8-sig') as fh:
            for line in fh:
                line = line.split('#', 1)[0].strip()
                if '=' in line:
                    k, v = line.split('=', 1); d[k.strip().upper()] = v.strip()
    except OSError:
        pass
    return d


# CC-C 11-04 16:4x：runner 自己的輸出交給一條專門的執行緒印到畫面（_emit）。
#   電腦 23:48 以後停住、沒再推結果：最可能是 Windows 主控台的「快速編輯」——使用者用滑鼠選畫面上的字要複製時，
#   主控台在選取狀態，程式一印字就整個卡住；以前 log() 拿著 _print_lock 印，三條工作執行緒全部卡在這把鎖，測試跑完也 commit 不了。
#   改成：先記進 CONSOLE_BUF（跟著結果推上去的 local_out/_console/console.log，畫面卡住也照樣更新），再丟進佇列由 console-writer 印；
#   畫面卡住只卡那一條執行緒，測試、commit、push 照跑，畫面放開以後補印。結束前 log_flush 最多等 5 秒（atexit）。
_LOGQ = queue.Queue()
_LOG_THREAD = []


def _raw_out():
    o = sys.stdout
    return o.s if isinstance(o, ConsoleTee) else o


def _log_writer():
    while True:
        t = _LOGQ.get()
        try:
            o = _raw_out()
            o.write(t)
            o.flush()
        except Exception:
            pass
        finally:
            _LOGQ.task_done()


def _emit(text):
    if isinstance(sys.stdout, ConsoleTee):
        with CONSOLE_LOCK:
            for line in text.rstrip('\n').split('\n'):
                CONSOLE_BUF.append(ConsoleTee.ANSI.sub('', line).rstrip('\r'))
    with _print_lock:
        if not _LOG_THREAD:
            th = threading.Thread(target=_log_writer, name='console-writer', daemon=True)
            th.start()
            _LOG_THREAD.append(th)
    _LOGQ.put(text)


def log_flush(timeout=5.0):
    """佇列裡還沒印的印完（最多等 timeout 秒：畫面卡在選取狀態時不等下去）"""
    t0 = time.time()
    while _LOGQ.unfinished_tasks and time.time() - t0 < timeout:
        time.sleep(0.05)
    return _LOGQ.unfinished_tasks == 0


atexit.register(log_flush)


def log(msg):
    _emit('[%s] %s\n' % (datetime.now().strftime('%H:%M:%S'), msg))


def gray(msg):
    lines = msg.rstrip().splitlines()
    if lines:
        _emit(''.join('    %s\n' % line for line in lines))


def console_quickedit_off():
    """Windows 主控台（conhost）的「快速編輯模式」：滑鼠在視窗裡點一下就進入選取，選取的時候程式一印字就停住，按 Esc／Enter 才放開。
    runner 啟動時把這個視窗的快速編輯關掉（只改這個主控台視窗，關掉視窗就恢復；Windows Terminal 沒有這個問題，關不關都一樣）。
    之後要複製畫面上的字：視窗標題列按右鍵 → 編輯 → 標記，選好按 Enter（標記的時候一樣會暫停印字，複製完一定要按 Enter／Esc）。回傳狀態字串給 log"""
    if not IS_WIN:
        return None
    try:
        import ctypes
        from ctypes import wintypes
        k = ctypes.windll.kernel32
        k.CreateFileW.restype = wintypes.HANDLE
        k.CreateFileW.argtypes = [wintypes.LPCWSTR, wintypes.DWORD, wintypes.DWORD, ctypes.c_void_p, wintypes.DWORD, wintypes.DWORD, wintypes.HANDLE]
        k.GetConsoleMode.argtypes = [wintypes.HANDLE, ctypes.POINTER(wintypes.DWORD)]
        k.SetConsoleMode.argtypes = [wintypes.HANDLE, wintypes.DWORD]
        k.CloseHandle.argtypes = [wintypes.HANDLE]
        h = k.CreateFileW('CONIN$', 0x80000000 | 0x40000000, 1 | 2, None, 3, 0, None)   # GENERIC_READ|WRITE、FILE_SHARE_READ|WRITE、OPEN_EXISTING
        if not h or h == wintypes.HANDLE(-1).value:
            return 'no console window'
        try:
            m = wintypes.DWORD()
            if not k.GetConsoleMode(h, ctypes.byref(m)):
                return 'GetConsoleMode failed'
            if not (m.value & 0x0040):
                return 'already off (mode 0x%x)' % m.value
            new = (m.value & ~0x0040) | 0x0080   # 拿掉 ENABLE_QUICK_EDIT_MODE；ENABLE_EXTENDED_FLAGS 要一起設才生效
            return ('off (mode 0x%x -> 0x%x)' % (m.value, new)) if k.SetConsoleMode(h, new) else 'SetConsoleMode failed'
        finally:
            k.CloseHandle(h)
    except Exception as e:
        return 'error %r' % (e,)


def keep_awake():
    """runner 在跑的時候不讓 Windows 睡眠、也不讓螢幕熄（新式待命的筆電螢幕一熄就進待命）：SetThreadExecutionState(ES_CONTINUOUS|ES_SYSTEM_REQUIRED|ES_DISPLAY_REQUIRED)，
    跟著呼叫的執行緒（主執行緒，runner 結束就自動取消；run_forever 兩輪之間等 5 分鐘時不擋）。回傳狀態字串給 log"""
    if not IS_WIN:
        return None
    try:
        import ctypes
        from ctypes import wintypes
        f = ctypes.windll.kernel32.SetThreadExecutionState
        f.argtypes = [wintypes.DWORD]
        f.restype = wintypes.DWORD
        flags = 0x80000000 | 0x00000001 | 0x00000002   # ES_CONTINUOUS｜ES_SYSTEM_REQUIRED｜ES_DISPLAY_REQUIRED（CC-C 11-05：新式待命 S0 的筆電螢幕一熄就進待命、斷網、程式暫停——11-04 00:17～11:07 鎖定以後就是這樣；SYSTEM_REQUIRED 擋不住，要連螢幕一起保持亮著）
        f(flags)
        prev = f(flags)   # 第二次回傳的「之前的狀態」＝第一次設的；0＝失敗
        return 'on' if prev == flags else 'SetThreadExecutionState returned 0x%x' % (prev or 0)
    except Exception as e:
        return 'error %r' % (e,)


GIT = shutil.which('git')
PROGRESS = re.compile(r':\s+\d+% \(\d+/\d+\)')


def git(*args, quiet=False, capture=False):
    """跑 git；回傳 (exit, 輸出)。quiet＝不印；git 的 stderr 進度訊息照樣當一般訊息印（不算錯）。"""
    r = subprocess.run([GIT] + list(args), stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                       text=True, encoding='utf-8', errors='replace')
    out = r.stdout or ''
    if not quiet and not capture and out.strip():
        # 進度列（Updating files:  37% (…)）只留最後一行，不洗版
        keep = [x for x in out.splitlines() if not (PROGRESS.search(x) and 'done' not in x)]
        if keep:
            gray('\n'.join(keep))
    return r.returncode, out


def tool_version(cmd, timeout=60):
    try:
        r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
                           encoding='utf-8', errors='replace', timeout=timeout)
        lines = [x for x in (r.stdout or '').splitlines() if x.strip()]
        if r.returncode != 0:
            return 'not usable (exit %s): %s' % (r.returncode, lines[-1].strip() if lines else '')
        return lines[0].strip() if lines else '(no output)'
    except Exception as e:
        return 'not found (%s)' % e


def find_node():
    n = os.environ.get('CC_NODE')
    if n:
        return n
    return shutil.which('node')


def find_blender():
    b = os.environ.get('CC_BLENDER')
    if b:
        return b
    if IS_WIN:
        d = r'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe'
        if os.path.exists(d):
            return d
        found = sorted(glob.glob(r'C:\Program Files\Blender Foundation\Blender *\blender.exe'))
        if found:
            return found[-1]
    return shutil.which('blender')


def blender_is_python(b):
    return os.path.basename(b).lower().startswith('python')


def free_port(start):
    with PORT_LOCK:
        for p in range(start, start + 200):
            if p in _reserved_ports:
                continue
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            try:
                s.bind(('127.0.0.1', p))
            except OSError:
                continue
            finally:
                s.close()
            _reserved_ports.add(p)
            return p
    raise RuntimeError('no free port')


def release_port(p):
    with PORT_LOCK:
        _reserved_ports.discard(p)


def wait_port(port, secs=15):
    t0 = time.time()
    while time.time() - t0 < secs:
        try:
            with socket.create_connection(('127.0.0.1', port), timeout=1):
                return True
        except OSError:
            time.sleep(0.3)
    return False


def popen_flags():
    if IS_WIN:
        return {'creationflags': subprocess.CREATE_NEW_PROCESS_GROUP | getattr(subprocess, 'CREATE_NO_WINDOW', 0)}
    return {'start_new_session': True}


def kill_tree(p):
    if p is None or p.poll() is not None:
        return
    try:
        if IS_WIN:
            subprocess.run(['taskkill', '/PID', str(p.pid), '/T', '/F'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            os.killpg(p.pid, 9)
    except Exception:
        try:
            p.kill()
        except Exception:
            pass
    try:
        p.wait(10)
    except Exception:
        pass


def parse_env(s):
    """ENV 欄：k=v;k=v → OrderedDict（值保留原樣，不 trim，和舊版 Set-Item 相同；RERUN／SHA2／XARGS 另外 trim）"""
    d = OrderedDict()
    for kv in (s or '').split(';'):
        m = re.match(r'^\s*([^=]+)=(.*)$', kv)
        if m:
            d[m.group(1).strip()] = m.group(2)
    return d


# ================= 失敗自動追蹤（CC_AUTORETRY／CC_TRACE；TEST-TRACE-1104、BB_256）=================
# 預設關：佇列 ENV 寫 CC_AUTORETRY=1、或 runner 加 --autoretry 才開。關的時候下面的程式一行都不會執行。
# 出錯一律只寫一行警告、退回舊行為（不讓 runner 當掉）。
AR_KEEP = ('meta.json', 'running.json', 'notes.txt', 'attempt1', 'attempt2', 'report.json', 'report.md')
ENV_PATTERNS = [
    (r'PAGE CRASH', '頁面 renderer 當掉（gpu_wrap 診斷 PAGE CRASH）'),
    (r'TargetClosedError|Target page, context or browser has been closed|Target closed|Browser has been closed|Browser closed', '瀏覽器／頁面被關掉（Target closed）'),
    (r"BrowserType\.launch|Executable doesn't exist|Failed to launch|Host system is missing dependencies", 'playwright 啟動瀏覽器失敗'),
    (r'out of memory|MemoryError|Cannot allocate memory|ENOMEM|OOM', '記憶體不足'),
    (r"GPU process isn't usable|GPU process exited unexpectedly|Failed to create WebGL|Could not create a WebGL context|Error creating WebGL context|GPU initialization failed", 'GPU 初始化失敗'),
]
TB_PATTERNS = [
    (r'playwright\._impl\._errors\.TimeoutError|playwright\.\w+\.TimeoutError|TimeoutError: [A-Za-z.]+: Timeout \d+ms exceeded', 'playwright 等待逾時（TimeoutError）'),
    (r'\bKeyError\b', 'KeyError'), (r'\bNameError\b', 'NameError'), (r'\bAttributeError\b', 'AttributeError'),
    (r'\bTypeError\b', 'TypeError'), (r'\bIndexError\b', 'IndexError'), (r'\bSyntaxError\b', 'SyntaxError'),
    (r'\bModuleNotFoundError\b|\bImportError\b', 'ImportError'), (r'\bZeroDivisionError\b', 'ZeroDivisionError'),
]
TEXT_EXT = ('.log', '.json', '.jsonl', '.txt', '.md')


def ar_env_flag(env, key, default=''):
    return str(env.get(key, os.environ.get(key, default)) or '').strip()


def read_text(path, limit=4 * 1024 * 1024):
    try:
        with open(path, 'rb') as fh:
            return fh.read(limit).decode('utf-8', 'replace')
    except OSError:
        return ''


def read_jsonl(path):
    out = []
    for line in read_text(path).splitlines():
        try:
            out.append(json.loads(line))
        except Exception:
            pass
    return out


def git_blob(path):
    if not path or not os.path.exists(path):
        return None
    try:
        r = subprocess.run([GIT, 'hash-object', path], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, timeout=30)
        return r.stdout.strip() or None
    except Exception:
        return None


def input_hash(envd, xargs):
    """存檔／種子／輸入＝佇列這一項的 ENV（不含 RERUN、CASES、CC_AUTORETRY 這些只管 runner 的鍵）＋XARGS；CASES 另外列"""
    keep = {k: v for k, v in envd.items() if k not in ('RERUN', 'CASES', 'CC_AUTORETRY', 'CC_TRACE', 'CC_TRACE_DIR')}
    s = json.dumps([sorted(keep.items()), xargs], ensure_ascii=False)
    return hashlib.sha256(s.encode('utf-8')).hexdigest()[:16]


# 不靠「知道本機路徑」也能認出來的本機資訊（BB 05:15 缺口 2）：雲端 scratchpad／worktree、編碼過的家目錄名、Windows／mac／Linux 的使用者資料夾。
# 規則順序有關係：先整段換 scratchpad，再換編碼目錄名，最後換使用者資料夾的名字。名字字元不含 <>，所以換過的 <USER> 不會再被比對。
_SEP = r'(?:\\\\|\\|/|%5[Cc]|%2[Ff])'
GENERIC_RULES = [
    (re.compile(r'(?:<TMP>|/tmp)/claude-\d+/[^/\\\s"\'<>]+/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/scratchpad(?:/wt_[^/\\\s"\'<>]+)?'),
     lambda m: '<WT>' if '/wt_' in m.group(0) else '<SCRATCH>'),
    (re.compile(r'claude-\d+/[^/\\\s"\'<>]+/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/scratchpad'), lambda m: '<SCRATCH>'),
    (re.compile(r'<WTROOT>[/\\]+wt_cc_[^/\\\s"\'<>]+'), lambda m: '<WT>'),
    (re.compile(r'(?<![A-Za-z0-9])-(?:home|Users|root)-[^/\\\s"\'<>]+'), lambda m: '<HOMEDIR>'),
    (re.compile(r'(?<![A-Za-z0-9])[A-Za-z]--Users-[^/\\\s"\'<>]+'), lambda m: '<HOMEDIR>'),
    (re.compile(r'(?i)((?:[A-Za-z]:)?)(' + _SEP + r')(Users|home)(' + _SEP + r')(?!<USER>)([^/\\\s"\'<>%]+)'),
     lambda m: m.group(1) + m.group(2) + m.group(3) + m.group(4) + '<USER>'),
]
GENERIC_LEFT = re.compile(r'claude-\d+/[^/\s]+/[0-9a-f-]{36}/scratchpad|-home-(?!<)|(?i:(?:\\|/)(?:Users|home)(?:\\\\|\\|/)(?!<USER>)[^/\\\s"\'<>%]+)')


def canon_rewrite(paths):
    """D158（LAWWW-C 11-12 14:31 同意 (a)）：要推的文字檔，舊序章、外校的字換成代號（tools/cc_local/canon_codes.py）。出錯只寫一行警告、照舊推。"""
    try:
        import canon_codes
    except Exception as e:
        log('canon_codes 載入失敗（照舊推）：%r' % e); return 0
    n = 0
    for p in paths:
        try:
            if not p.lower().endswith(TEXT_EXT) and not p.lower().endswith('.md'): continue
            with open(p, 'rb') as fh: raw = fh.read()
            s = raw.decode('utf-8')
            t, k = canon_codes.to_codes(s)
            if k:
                with open(p, 'wb') as fh: fh.write(t.encode('utf-8'))
                n += k
        except Exception:
            continue
    if n: log('D158：推送前把 %d 處舊序章／外校的字換成代號' % n)
    return n


def scrub_generic(s):
    for rx, fn in GENERIC_RULES:
        s = rx.sub(fn, s)
    return s


class Sanitizer(object):
    """把本機絕對路徑、使用者名稱、Cookie／Token 換掉（推上 GitHub 之前）"""
    SECRET = re.compile(r'(?i)\b(authorization|cookie|set-cookie|x-api-key|api[_-]?key|access[_-]?token|token|password)(\s*[:=]\s*)([^\s,;&"\']+)')
    HDR = re.compile(r'(?i)("name"\s*:\s*"(?:cookie|set-cookie|authorization|proxy-authorization|x-api-key)"\s*,\s*"value"\s*:\s*")[^"]*')

    def __init__(self, paths):
        pairs = []
        for p, tok in paths:
            if p and len(p) >= 4:
                for v in {p, p.replace('\\', '/'), p.replace('\\', '\\\\'), p.replace('/', '\\')}:
                    pairs.append((v, tok))
        pairs.sort(key=lambda x: -len(x[0]))
        self.pairs = pairs
        try:
            import getpass
            u = getpass.getuser()
        except Exception:
            u = ''
        self.user = u
        self.user_word = re.compile(r'(?i)(?<![A-Za-z0-9])%s(?![A-Za-z0-9])' % re.escape(u)) if len(u) >= 3 else None
        self.user_path = re.compile(r'(?i)([\\/]+)%s(?=[\\/"\'\s]|$)' % re.escape(u)) if len(u) >= 3 else None

    def text(self, s, word=True):
        for p, tok in self.pairs:
            if p in s:
                s = s.replace(p, tok)
        s = scrub_generic(s)
        if self.user_path is not None:
            s = self.user_path.sub(lambda m: m.group(1) + '<USER>', s)
        if word and self.user_word is not None:
            s = self.user_word.sub('<USER>', s)
        s = self.HDR.sub(lambda m: m.group(1) + '<REDACTED>', s)
        return self.SECRET.sub(lambda m: m.group(1) + m.group(2) + '<REDACTED>', s)

    def hits(self, s):
        h = [tok for p, tok in self.pairs if p in s]
        mg = GENERIC_LEFT.search(s)
        if mg:
            h.append('generic:' + mg.group(0)[:40])
        if self.user_path is not None and self.user_path.search(s):
            h.append('<USER>')
        if self.SECRET.search(s) and '<REDACTED>' not in self.SECRET.search(s).group(3):
            h.append('secret')
        return sorted(set(h))

    def file(self, path):
        try:
            with open(path, 'rb') as fh:
                raw = fh.read()
            s = raw.decode('utf-8')
        except Exception:
            return False
        t = self.text(s)
        if t != s:
            with open(path, 'wb') as fh:
                fh.write(t.encode('utf-8'))
            return True
        return False

    def zipfile(self, path):
        """trace.zip：文字的 entry（.trace／.network／.stacks／json、html、css、js）改寫；回傳 (改了幾個 entry, 掃描後還留著的命中)"""
        import zipfile
        tmp = path + '.san'
        changed = 0
        left = []
        with zipfile.ZipFile(path) as zi, zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zo:
            for info in zi.infolist():
                data = zi.read(info.filename)
                try:
                    s = data.decode('utf-8')
                    t = self.text(s, word=False)        # trace 裡只換路徑形式的使用者名稱，不動一般文字（免得弄壞 JSON 鍵）
                    if t != s:
                        changed += 1
                        data = t.encode('utf-8')
                    hh = self.hits(t)
                    if hh:
                        left.append('%s:%s' % (info.filename, ','.join(hh)))
                except UnicodeDecodeError:
                    pass
                zo.writestr(info, data)
        os.replace(tmp, path)
        return changed, left


HEAVY_EXT = ('.glb', '.gltf', '.bin', '.wrl', '.vrm', '.woff', '.woff2', '.ttf', '.otf', '.ktx2', '.mp3', '.ogg', '.wav', '.mp4', '.webm', '.hdr', '.exr')


def slim_zip(path, max_bytes, body_max=512 * 1024):
    """trace.zip 變小（遊戲 trace 會把 GLB／貼圖／字型的下載內容整包存進去，一份 27～63 MB）：
    1. resources/ 底下的模型、字型、音效（HEAVY_EXT）和超過 body_max 的回應內容拿掉（Trace Viewer 的 Network 分頁看不到那些內容，時間軸、DOM snapshot、畫面不受影響）。
    2. 還是超過 max_bytes：畫面截圖（screencast）平均抽掉一部分，trace.trace 裡對應的 screencast-frame 行一起拿掉。
    回傳 dict（前後大小、拿掉幾個、抽幀間隔）。"""
    import zipfile
    st = {'before': os.path.getsize(path), 'dropped_bodies': 0, 'dropped_bytes': 0, 'frame_step': 1, 'frames': 0}
    with zipfile.ZipFile(path) as zi:
        infos = zi.infolist()
        keep = []
        for i in infos:
            n = i.filename
            if n.startswith('resources/') and (n.lower().endswith(HEAVY_EXT) or i.file_size > body_max):
                st['dropped_bodies'] += 1; st['dropped_bytes'] += i.file_size
                continue
            keep.append(i)
        frames = [i for i in keep if i.filename.startswith('screencast/')]
        st['frames'] = len(frames)
        other = sum(i.compress_size for i in keep if not i.filename.startswith('screencast/'))
        fb = sum(i.compress_size for i in frames)
        step = 1
        if other + fb > max_bytes and fb > 0:
            room = max(max_bytes - other, max_bytes // 4)
            step = max(1, -(-fb // max(1, room)))
        st['frame_step'] = step
        drop_frames = set(i.filename for k, i in enumerate(frames) if step > 1 and k % step)
        if st['dropped_bodies'] == 0 and not drop_frames:
            st['after'] = st['before']
            return st
        tmp = path + '.slim'
        with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zo:
            for i in keep:
                if i.filename in drop_frames:
                    continue
                data = zi.read(i.filename)
                if drop_frames and i.filename.endswith('.trace'):
                    out = []
                    for line in data.decode('utf-8', 'replace').splitlines():
                        if '"screencast-frame"' in line:
                            m = re.search(r'"file"\s*:\s*"([^"]+)"', line)
                            if m and m.group(1) in drop_frames:
                                continue
                        out.append(line)
                    data = ('\n'.join(out) + '\n').encode('utf-8')
                zo.writestr(i, data)
    os.replace(tmp, path)
    st['after'] = os.path.getsize(path)
    st['frames_kept'] = st['frames'] - len(drop_frames)
    return st


def classify(a1, a2, same, notes):
    """回傳 (分類, 細項, 依據[])。a1／a2：attempt dict（a2 可能 None）"""
    basis = []

    def env_hits(a):
        txt = '\n'.join(x for x in (a['err'] + '\n' + a['run']).splitlines() if not x.startswith('[cc_trace'))   # 追蹤工具自己的警告不算證據
        out = []
        for pat, why in ENV_PATTERNS:
            m = re.search(pat, txt)
            if m:
                ln = txt[max(0, txt.rfind('\n', 0, m.start()) + 1): txt.find('\n', m.end()) if txt.find('\n', m.end()) >= 0 else len(txt)]
                out.append('%s：「%s」' % (why, ln.strip()[:200]))
        for e in a['events']:
            if e.get('kind') == 'crash' or (e.get('kind') == 'browser_disconnected' and e.get('expected') is False):
                out.append('events.jsonl：%s（rel %.1fs）' % (e['kind'], e.get('rel') or 0))
        return out

    def fail_before_env(a):
        """有沒有 FAIL 行比第一次 crash／斷線更早（events.jsonl 的時間）"""
        tc = [e.get('t') for e in a['events'] if e.get('kind') == 'crash' or (e.get('kind') == 'browser_disconnected' and e.get('expected') is False)]
        tf = [e.get('t') for e in a['events'] if e.get('kind') == 'fail_line']
        if tc:
            return bool(tf) and min(tf) < min(tc)
        return bool(a['fails'])   # 沒有時間資訊（第一次沒開 trace）：有 FAIL 行就當作先 FAIL

    def game_errors(a):
        ev = [e for e in a['events'] if e.get('kind') == 'pageerror' and '__playwright_evaluation_script__' not in (e.get('stack') or '')]
        if ev or a['events']:
            return ev     # 有 events.jsonl（開了 trace）：以它為準；gpu_wrap 的診斷行是同一批，不重複算
        return [{'kind': 'pageerror(gpu_wrap)', 'message': x} for x in re.findall(r'\] pageerror (.*)', a['err'])]

    def ltes(a):
        out = []
        for st in a['states']:
            for pg in st.get('pages', []):
                s = pg.get('state') or {}
                v = s.get('lastTalkError') or ((s.get('snapshot') or {}).get('lastTalkError') if isinstance(s.get('snapshot'), dict) else None)
                if v:
                    out.append(v)
        return out

    def tb_hits(a):
        if 'Traceback (most recent call last)' not in a['err']:
            return []
        tb = a['err'][a['err'].rfind('Traceback (most recent call last)'):]
        out = []
        for pat, why in TB_PATTERNS:
            if re.search(pat, tb):
                out.append(why)
        return out, tb

    def tb_detail(tb):
        lines = [x for x in tb.splitlines() if x.strip()]
        frames = [x.strip() for x in lines if x.strip().startswith('File ')]
        exc = [x.strip() for x in lines if re.match(r'^[A-Za-z_][\w.]*(Error|Exception|Exit)\b', x.strip())]
        last = exc[-1] if exc else (lines[-1].strip() if lines else '')
        sel = re.search(r'waiting for (?:locator\()?["\']([^"\']+)["\']', tb) or re.search(r'wait_for_selector\(\s*["\']([^"\']+)', tb)
        probe_frames = [f for f in frames if 'site-packages' not in f and 'dist-packages' not in f and 'playwright' not in f and 'gpu_wrap' not in f and 'runpy' not in f and 'cc_trace' not in f]
        return last[:300], (sel.group(1) if sel else None), (probe_frames[-1][:300] if probe_frames else None)

    # --- runner 自己的例外（沒跑到探針）
    if a1.get('runner_error'):
        e = a1['runner_error']
        if re.search(r'worktree add|no free port|server|node not found|blender not found', e):
            return 'ENVIRONMENT', 'runner', ['runner 例外（沒跑到探針）：%s' % e[:300]]
        if re.search(r'SCRIPT_FROM|unknown kind', e):
            return 'TEST_BUG', 'queue', ['佇列設定錯誤：%s' % e[:300]]
        return 'UNKNOWN', 'runner', ['runner 例外，分不出原因：%s' % e[:300]]
    # --- 重跑通過
    if a2 is not None and a2['exit'] == 0 and not a2['timeout']:
        if same['all']:
            return 'FLAKY', '首次失敗、重跑通過', ['第一次 %s，重跑 exit 0；兩次的遊戲 SHA、腳本 blob、輸入雜湊都相同（見 conditions）' %
                                             ('逾時' if a1['timeout'] else 'exit %s' % a1['exit'])] + notes
        return 'UNKNOWN', '重跑通過但條件不同', ['重跑 exit 0，但兩次條件不同：%s，不能判 FLAKY' % '、'.join(same['diff'])] + notes
    last = a2 if a2 is not None else a1
    # --- 逾時（兩次都逾時、或沒重跑）
    if last['timeout']:
        eh = env_hits(a1) + (env_hits(a2) if a2 else [])
        if eh:
            return 'TIMEOUT', 'ENVIRONMENT', ['逾時被 runner 中止；另有環境訊號：' + '；'.join(eh[:4])] + notes
        return 'TIMEOUT', 'UNKNOWN', ['逾時被 runner 中止（%s）；沒有環境訊號、沒有 traceback 可以判斷——只憑逾時不判 GAME_BUG' % last['error']] + notes
    # --- 都 FAIL：以有 trace 的那一次為主，第一次的 log 也看
    eh = env_hits(last)
    if eh and not fail_before_env(last):
        return 'ENVIRONMENT', 'browser', eh[:5] + ['在 crash／斷線之前沒有探針的 FAIL 行'] + notes
    ge = game_errors(last)
    lt = ltes(last)
    tbr = tb_hits(last)
    tbh, tb = (tbr if tbr else ([], ''))
    if last['fails'] and (ge or lt):
        b = ['探針斷言 FAIL %d 行（第一行：%s）' % (len(last['fails']), last['fails'][0]['name'][:120])]
        if ge:
            g = ge[0]
            b.append('遊戲頁面 pageerror %d 筆，第一筆：%s %s' % (len(ge), g.get('name') or '', (g.get('message') or '')[:200]))
            if g.get('stack'):
                b.append('stack 第一行：%s' % (g['stack'].strip().splitlines()[1:2] or [''])[0].strip()[:200])
        if lt:
            b.append('GAME.lastTalkError：%s' % json.dumps(lt[0], ensure_ascii=False)[:200])
        if tbh:
            b.append('另有探針 traceback（%s），要一起看' % '、'.join(tbh))
        if eh:
            b.append('另有環境訊號（但在 FAIL 之後）：' + '；'.join(eh[:2]))
        return 'GAME_BUG', '初判', b + notes
    if tbh and not ge:
        lastl, sel, frame = tb_detail(tb)
        b = ['探針 Python traceback：%s' % lastl, '原因類型：%s' % '、'.join(tbh)]
        if frame:
            b.append('探針出錯的位置：%s' % frame)
        if sel:
            b.append('等待的 selector：%s' % sel)
            dom = last.get('dom_check', {}).get(sel)
            if dom is not None:
                b.append('trace 的 DOM snapshot 裡%s這個 selector（%s）' % ('有' if dom else '沒有', '只檢查 #id 形式'))
        b.append('遊戲頁面沒有 pageerror')
        return 'TEST_BUG', '初判', b + notes
    if eh:
        return 'UNKNOWN', 'env-after-fail', ['有環境訊號，但探針在那之前已經 FAIL：' + '；'.join(eh[:3])] + notes
    srcs = {f.get('src') for f in last['fails']} if last['fails'] else set()
    if last['fails'] and srcs == {'game'}:   # 斷言比對的值是從遊戲狀態讀出來的（探針的 check 標 [src=game]）＝遊戲回報的值和預期不同
        f0 = last['fails'][0]
        return 'GAME_BUG', 'assert-game', ['探針斷言 FAIL %d 行，比對的值是從遊戲狀態讀出來的（[src=game]）；第一行：%s' % (len(last['fails']), f0['name'][:120]),
                                          '遊戲回報／預期：%s' % (f0.get('info') or '')[:240],
                                          '兩次%s' % ('一致' if (a2 and [f['name'] for f in a1['fails']] == [f['name'] for f in a2['fails']]) else '的 FAIL 行不同或只跑一次')] + notes
    if last['fails'] and srcs == {'probe'}:   # 斷言比的是探針自己的兩個常數（[src=probe]）＝探針寫錯
        f0 = last['fails'][0]
        return 'TEST_BUG', 'assert-probe', ['探針斷言 FAIL %d 行，比對的是探針自己的常數（[src=probe]），和遊戲無關；第一行：%s' % (len(last['fails']), f0['name'][:120]),
                                           '探針的值：%s' % (f0.get('info') or '')[:240]] + notes
    if last['fails']:
        return 'UNKNOWN', 'assert', ['探針斷言 FAIL %d 行（%s），兩次%s；沒有 JS 例外、沒有 traceback、沒有環境訊號——要看預期／實際判斷是遊戲還是探針' %
                                     (len(last['fails']), last['fails'][0]['name'][:120], '一致' if (a2 and [f['name'] for f in a1['fails']] == [f['name'] for f in a2['fails']]) else '的 FAIL 行不同或只跑一次')] + notes
    if ge:
        return 'UNKNOWN', 'jserror-no-assert', ['有遊戲 pageerror 但探針沒有 FAIL 斷言（exit %s）：%s' % (last['exit'], (ge[0].get('message') or '')[:200])] + notes
    return 'UNKNOWN', '', ['exit %s，沒有 FAIL 行、traceback、JS 例外或環境訊號可以判斷' % last['exit']] + notes


class Item(object):
    def __init__(self, f):
        self.id, self.sha, self.kind, self.script, self.url = f[0], f[1], f[2], f[3], f[4]
        self.tmin = int(f[5])
        self.env = f[6] if len(f) > 6 else ''
        self.envd = parse_env(self.env)
        self.rerun = self.envd.get('RERUN', '').strip()


class Runner(object):
    def __init__(self, a):
        self.a = a
        self.repo = os.path.abspath(a.repo)
        self.work = os.path.abspath(a.work) if a.work else os.path.join(os.path.dirname(self.repo), 'Lawstudent_cclocal')
        self.wtroot = os.path.dirname(self.work)
        self.branch = a.branch_local
        self.queue_file = os.path.abspath(a.queue) if a.queue else None
        self.out_root = os.path.join(self.work, 'docs', 'story_planning', 'CC', 'local_out')
        self.summary = []
        self.self_hash = file_hash(SELF_FILE)    # 啟動時自己的雜湊；每次合併 cc-testing 以後比對
        self.restart_pending = False
        self.head = ''
        self.lawww2 = ''
        self.py = sys.executable
        self.node = find_node()
        self.blender = find_blender()
        # 有視窗：Windows 預設有；其他平台要有 DISPLAY（雲端用 xvfb-run）；--headless 一律無視窗
        self.headed = not a.headless and (IS_WIN or bool(os.environ.get('DISPLAY')))

    # ---------- 版本／環境 ----------
    def banner(self):
        log('python : %s (%s)' % (self.py, sys.version.split()[0]))
        try:
            import playwright  # noqa: F401
            try:
                from importlib.metadata import version as _pv
                pwv = _pv('playwright')
            except Exception:
                pwv = '?'
            log('         playwright %s OK' % pwv)   # BB 19:26：第一行要印 python 路徑＋playwright 版本（確認是裝了 webkit 的那一支 python）
        except ImportError:
            log('No usable playwright in this Python. Fix: python -m pip install playwright==1.63.0 ; python -m playwright install chromium')
            sys.exit(1)
        log('git    : %s' % (tool_version([GIT, '--version']) if GIT else 'not found'))
        log('node   : %s' % ((self.node + '  ' + tool_version([self.node, '--version'])) if self.node else 'not found (node items will fail; set CC_NODE)'))
        if not self.blender:
            log('blender: not found (blender items will fail; set CC_BLENDER)')
        elif blender_is_python(self.blender):
            log('blender: python mode %s  bpy %s' % (self.blender, tool_version([self.blender, '-c', 'import bpy; print(bpy.app.version_string)'])))
        else:
            log('blender: %s  %s' % (self.blender, tool_version([self.blender, '-b', '--version'], timeout=120)))
        log('repo   : %s' % self.repo)
        log('work   : %s  (branch %s, %s)' % (self.work, self.branch, 'no push' if self.a.no_push else 'push to origin'))
        log('parallel: %d  (blender items run alone)' % self.a.parallel)
        log('browser: %s' % ('visible windows side by side (probe/game/webkit; queue ENV CC_HEADLESS wins) - please do not click them' if self.headed
                             else 'headless (no window)'))

    # ---------- 1. 結果分支的 worktree ----------
    def setup(self):
        if not GIT:
            _emit('git not found\n'); sys.exit(1)
        if not os.path.exists(os.path.join(self.repo, '.git')):
            _emit('Repo not found: %s\n' % self.repo); sys.exit(1)
        _, em = git('-C', self.repo, 'config', 'user.email', capture=True)
        _, nm = git('-C', self.repo, 'config', 'user.name', capture=True)
        if not em.strip() or not nm.strip():
            _emit('git user.name / user.email is not set, so results cannot be committed. Set them once, then rerun:' + '\n')
            _emit('  git config --global user.name "Your Name"' + '\n')
            _emit('  git config --global user.email "you@example.com"' + '\n')
            sys.exit(1)
        clear_stale_git_locks(os.path.join(self.repo, '.git'))   # 當機留下的 index.lock 等（工作樹的在 .git/worktrees/ 底下）
        log('git fetch')
        git('-C', self.repo, 'fetch', 'origin', CC_BRANCH, DEV_BRANCH)
        git('-C', self.repo, 'fetch', 'origin', 'main', quiet=True)   # LIVE19（11-03 21:15）：main 的合併 commit（e1603907e）只在 main 上，沒抓 main＝invalid reference
        self.fetch_lawww2(quiet=False)
        git('-C', self.repo, 'fetch', 'origin', STORY_BRANCH, quiet=True)   # 有些單元測試會 git show 企劃分支的 commit（N1：v1_inv_wording、heroine_circle3d）
        rc, _ = git('-C', self.repo, 'fetch', 'origin', self.branch, quiet=True)
        has_remote_local = rc == 0
        if not os.path.exists(self.work):
            git('-C', self.repo, 'worktree', 'prune')
            git('-C', self.repo, 'worktree', 'add', '--detach', self.work, 'origin/' + CC_BRANCH)
        # 本機已有結果分支（上一輪沒 push 成功、或 --no-push）：沿用它再合併遠端，不丟掉本機的結果 commit。
        # 合併失敗才退回舊版的做法（以遠端為底重建）。
        rc_l, _ = git('-C', self.work, 'rev-parse', '--verify', '--quiet', 'refs/heads/' + self.branch, quiet=True)
        rc = 1
        if rc_l == 0:
            rc, _ = git('-C', self.work, 'checkout', self.branch)
            if rc == 0 and has_remote_local:
                rc, _ = git('-C', self.work, 'merge', '--no-edit', 'origin/' + self.branch)
            if rc == 0:
                rc, _ = git('-C', self.work, 'merge', '--no-edit', 'origin/' + CC_BRANCH)
            if rc != 0:
                log('local %s could not be merged - rebuilding it from origin (old behaviour)' % self.branch)
                git('-C', self.work, 'merge', '--abort', quiet=True)
        if rc != 0 and has_remote_local:
            git('-C', self.work, 'checkout', '-B', self.branch, 'origin/' + self.branch)
            rc, _ = git('-C', self.work, 'merge', '--no-edit', 'origin/' + CC_BRANCH)
        elif rc != 0:
            rc, _ = git('-C', self.work, 'checkout', '-B', self.branch, 'origin/' + CC_BRANCH)
        if rc != 0:
            _emit('git checkout/merge failed in %s - fix it and rerun\n' % self.work); sys.exit(1)
        self.update_heads()
        log('dev head = %s   lawww2 head = %s' % (self.head, self.lawww2 or '(not fetched)'))
        os.makedirs(self.out_root, exist_ok=True)
        self.canon_purge_once()
        self.startup_flush()

    def fetch_lawww2(self, quiet=True):
        rc, out = git('-C', self.repo, 'fetch', 'origin', LAWWW2_BRANCH, quiet=True)
        if rc != 0:
            log('fetch %s failed (continuing): %s' % (LAWWW2_BRANCH, out.strip().splitlines()[-1] if out.strip() else rc))
        elif not quiet and out.strip():
            gray(out)

    def update_heads(self):
        rc, h = git('-C', self.repo, 'rev-parse', '--short', 'origin/' + DEV_BRANCH, capture=True)
        if rc == 0 and h.strip():
            self.head = h.strip()
        rc, h = git('-C', self.repo, 'rev-parse', '--short', 'origin/' + LAWWW2_BRANCH, capture=True)
        if rc == 0 and h.strip():
            self.lawww2 = h.strip()

    def refresh(self):
        """每跑完一項：重新 fetch cc-testing 並合併，讓晚上 push 的佇列修改在下一項生效"""
        with GIT_LOCK:
            git('-C', self.repo, 'fetch', 'origin', CC_BRANCH, DEV_BRANCH, quiet=True)
            self.fetch_lawww2()
            rc, _ = git('-C', self.work, 'merge', '--no-edit', 'origin/' + CC_BRANCH, quiet=True)
            if rc != 0:
                log('merge of cc-testing failed - keep the current queue')
                git('-C', self.work, 'merge', '--abort', quiet=True)
            self.canon_purge_once()
            self.sync_results_branch('refresh')
            self.update_heads()

    def canon_purge_once(self):
        """D158／CANON-NO-ECON-1112（LAWWW-C 11-12 14:31 同意 (b)）：tools/cc_local/canon_purge_go.txt 在（LAWWW、BB 看過演練數字才放）、
        local_out/CANON_PURGED.txt 還沒有＝跑一次 canon_purge.py（一般 commit，不改寫歷史；下一筆結果照常推）。出錯只寫一行、照舊跑佇列。"""
        try:
            go = os.path.join(self.work, 'tools', 'cc_local', 'canon_purge_go.txt')
            mk = os.path.join(self.out_root, 'CANON_PURGED.txt')
            if not os.path.exists(go) or os.path.exists(mk):
                return
            log('D158：一次清 cc-local 舊結果裡舊序章、外校的字（canon_purge.py）')
            r = subprocess.run([sys.executable, os.path.join(self.work, 'tools', 'cc_local', 'canon_purge.py'), self.work, '--apply', '--commit'],
                               capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=3600)
            for ln in (r.stdout or '').strip().splitlines()[-4:]:
                log('  ' + ln)
            if r.returncode != 0:
                log('  canon_purge 結束碼 %d：%s' % (r.returncode, (r.stderr or '').strip()[-300:]))
        except Exception as e:
            log('canon_purge 沒跑成（照舊跑佇列）：%r' % e)

    def startup_flush(self):
        """啟動時（BB-C 15:18）：
        ① 工作樹裡 local_out 底下「已追蹤、被改過、沒 commit」的舊結果（例：帳號 A 的 02_mk12、R8_y4s2rt，每次啟動都被列出來）→ commit。
           不還原：那可能是重跑留下的唯一一份。沒追蹤的檔案不動。
        ② 本機結果分支比遠端新（上一輪 push 失敗留下的）→ 先合併遠端再推，不等下一項。"""
        if self.a.no_push:
            return
        lo = 'docs/story_planning/CC/local_out'
        with GIT_LOCK:
            rc, st = git('-C', self.work, 'status', '--porcelain', '--untracked-files=no', '--', lo, capture=True)
            if rc == 0 and st.strip():
                n = len([x for x in st.splitlines() if x.strip()])
                git('-C', self.work, 'add', '-u', '--', lo, quiet=True)
                rcd, _ = git('-C', self.work, 'diff', '--cached', '--quiet', quiet=True)
                if rcd != 0:
                    rcc, out = git('-C', self.work, 'commit', '-q', '-m', 'CC-local: 啟動時補 commit 上一輪留下沒 commit 的結果（%d 個檔）' % n, quiet=True)
                    log('startup: committed %d leftover result file(s)%s' % (n, '' if rcc == 0 else ' - FAILED: ' + out.strip()[-200:]))
            rc, ahead = git('-C', self.work, 'rev-list', '--count', 'origin/%s..HEAD' % self.branch, capture=True)
            if rc == 0 and ahead.strip().isdigit() and int(ahead.strip()) > 0:
                log('startup: %s local result commit(s) not on origin yet - merge origin and push now' % ahead.strip())
                self.sync_results_branch('startup')
                rcp, _ = git('-C', self.work, 'push', '-u', 'origin', self.branch)
                if rcp != 0:
                    log('startup push failed - the next item will retry')

    def sync_results_branch(self, why):
        """結果分支（cc-local）也合併遠端：別人（雲端的 CC）推了 cc-local，這一輪後面每一項都會推不上去
        （11-04 22:32～23:1x：只有開新一輪時才合併，push 失敗只原地重推 5 次）。要在 GIT_LOCK 裡呼叫。回傳是否合併成功"""
        if self.a.no_push:
            return True
        rcf, _ = git('-C', self.repo, 'fetch', 'origin', self.branch, quiet=True)
        if rcf != 0:
            return False
        rc, _ = git('-C', self.work, 'merge', '--no-edit', 'origin/' + self.branch, quiet=True)
        if rc != 0:
            log('merge of origin/%s failed (%s) - results stay local, next push retries' % (self.branch, why))
            git('-C', self.work, 'merge', '--abort', quiet=True)
            return False
        return True

    # ---------- 2. 佇列 ----------
    def read_queue(self):
        q = self.queue_file or os.path.join(self.work, 'tools', 'cc_local', 'queue.txt')
        items = []
        with open(q, encoding='utf-8-sig') as fh:
            for line in fh:
                t = line.strip()
                if not t or t.startswith('#'):
                    continue
                f = [x.strip() for x in t.split('|')]
                try:
                    items.append(Item(f))
                except (IndexError, ValueError) as e:
                    log('bad queue line (skipped): %s  (%s)' % (t[:80], e))
        if self.a.only:
            sel = [s.strip() for s in self.a.only.split(',')]
            items = [it for it in items if it.id in sel]
        return items

    def resolve(self, sha):
        if sha == 'head':
            return self.head
        if sha == 'lawww2':
            return self.lawww2
        return sha

    def is_done(self, it, sha):
        pmf = os.path.join(self.out_root, it.id, 'meta.json')
        if not os.path.exists(pmf):
            return False
        try:
            with open(pmf, encoding='utf-8-sig') as fh:   # 舊版 PowerShell 寫的有 BOM
                pm = json.load(fh)
            pr = str(pm.get('rerun') or '')
            return pm.get('sha') == sha and pr == it.rerun   # BB 19:46：同一個 Id@sha#RERUN 有 meta 就跳過，不管 exit／error（逾時要重跑＝換 RERUN 記號）
        except Exception:
            log('meta.json of %s unreadable - rerun' % it.id)
            return False

    # ---------- 3. 跑一項 ----------
    def wt_add(self, path, sha):
        # 2026-11-02 PC 實跑：舊 PowerShell runner 被 Ctrl+C 中斷時留下 wt_cc_R8_rr2 資料夾（不是登記中的 worktree，
        # worktree remove 刪不掉）→ 新 runner「already exists」直接記 error。改成：remove → prune → 整個資料夾刪掉
        # → 還刪不掉（Windows 檔案被占用）就換一個新名字，回傳實際用的路徑。
        with GIT_LOCK:
            if os.path.exists(path):
                git('-C', self.repo, 'worktree', 'remove', '--force', path, quiet=True)
                git('-C', self.repo, 'worktree', 'prune', quiet=True)
                if os.path.exists(path):
                    shutil.rmtree(path, ignore_errors=True)
                if os.path.exists(path):
                    alt = '%s_%d' % (path, int(time.time()))
                    log('leftover %s cannot be removed - using %s' % (path, alt))
                    path = alt
            # core.autocrlf=false：受測檔案保持 LF，和雲端、Pages 一樣（Windows 預設會轉 CRLF，N1 有一批「從原始碼抽函式」的單元測試因此 FAIL，BB 21:3x）
            rc, out = git('-c', 'core.autocrlf=false', '-c', 'core.eol=lf', '-C', self.repo, 'worktree', 'add', '--detach', path, sha, quiet=True)
            if rc != 0 and 'invalid reference' in out:   # 不在任何抓下來的分支上（main、PR 分支、別的帳號的開發分支…）：先抓 main，再直接用 SHA 抓一次（GitHub 只接受完整 40 碼 SHA），再試
                log('worktree add %s: invalid reference - fetching main and the commit itself' % sha)
                git('-C', self.repo, 'fetch', 'origin', 'main', quiet=True)
                git('-C', self.repo, 'fetch', 'origin', sha, quiet=True)
                rc, out = git('-c', 'core.autocrlf=false', '-c', 'core.eol=lf', '-C', self.repo, 'worktree', 'add', '--detach', path, sha, quiet=True)
                if rc != 0 and 'invalid reference' in out:   # BB-C 11-04：短 SHA 用 fetch 抓不到——抓全部 claude/* 分支（RULE_SOURCE 換班會變，不寫死分支名），再試
                    log('worktree add %s: still invalid - fetching all refs/heads/claude/*' % sha)
                    git('-C', self.repo, 'fetch', 'origin', '+refs/heads/claude/*:refs/remotes/origin/claude/*', quiet=True)
                    rc, out = git('-c', 'core.autocrlf=false', '-c', 'core.eol=lf', '-C', self.repo, 'worktree', 'add', '--detach', path, sha, quiet=True)
        if rc != 0:
            raise RuntimeError('worktree add %s failed: %s' % (sha, out.strip()[-200:]))
        return path

    def wt_remove(self, path):
        with GIT_LOCK:
            git('-C', self.repo, 'worktree', 'remove', '--force', path, quiet=True)

    def start_server(self, cwd, start):
        port = free_port(start)
        srv = subprocess.Popen([self.py, '-m', 'http.server', str(port), '--bind', '127.0.0.1'], cwd=cwd,
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, **popen_flags())
        if not wait_port(port):
            time.sleep(1)
        return srv, port

    def script_from(self, it, env, base):
        """ENV 有 SCRIPT_FROM（story／lawww2／cc／分支名）：從那個分支把腳本（加上 SCRIPT_FILES 列的檔，逗號分隔；文字、二進位都可以）
        原樣放到 base 底下同一個相對路徑，回傳腳本的完整路徑；沒寫 SCRIPT_FROM 回傳 None。讀不到就報錯，不默默跑舊檔。
        BB 13:30：AA／BB 的 Blender 腳本在企劃分支（blender：base＝工作樹，lib2 用工作樹那一份）；BB 14:40：BB 的探針也在企劃分支（probe：base＝runner 的暫存資料夾）"""
        sf = env.get('SCRIPT_FROM', '').strip()
        if not sf: return None
        ref = {'story': STORY_BRANCH, 'lawww2': LAWWW2_BRANCH, 'cc': CC_BRANCH}.get(sf, sf)
        rev = ref if re.fullmatch(r'[0-9a-f]{7,40}', ref) else 'origin/' + ref   # BB 21:11：也可以直接寫 commit SHA（例：拿 d2b962a3f 的 tests/deploy_check.py 去測別的版本）
        for rel in [it.script] + [x.strip() for x in env.get('SCRIPT_FILES', '').split(',') if x.strip()]:
            pr = subprocess.run([GIT, '-C', self.repo, 'show', '%s:%s' % (rev, rel.replace(os.sep, '/'))],
                                stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
            if pr.returncode != 0:
                raise RuntimeError('SCRIPT_FROM %s: cannot read %s' % (ref, rel))
            dst = os.path.join(base, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            with open(dst, 'wb') as fh:
                fh.write(pr.stdout)
        return os.path.join(base, it.script)

    def build_cmd(self, it, wt, od, url, url2, env):
        wrap = os.path.join(self.work, 'tools', 'cc_local', 'gpu_wrap.py')
        out = os.path.join(od, 'out')
        xa = []
        if 'XARGS' in it.envd:
            xa = [x.replace('{url}', url).replace('{url2}', url2).replace('{out}', out)
                  for x in it.envd['XARGS'].strip().split()]
        k = it.kind
        if k == 'gpu':
            return [self.py, os.path.join(self.work, it.script), url, os.path.join(od, 'gpu.txt')], self.work
        if k == 'py':
            return [self.py, os.path.join(self.work, it.script), url, od], self.work
        if k == 'game':
            sp = self.script_from(it, env, os.path.join(self.wtroot, '_script_from', it.id)) or os.path.join(wt, it.script)   # SCRIPT_FROM：用別的版本的測試腳本測這個版本（cwd 照舊是受測的工作樹）
            return [self.py, wrap, sp] + (xa or [url]), wt
        if k in ('probe', 'webkit'):
            env['LW_TESTS'] = os.path.join(wt, 'tests')
            env['SHA'] = it.rsha
            if k == 'webkit':
                env['CC_BROWSER'] = 'webkit'
            sp = self.script_from(it, env, os.path.join(self.wtroot, '_script_from', it.id)) or os.path.join(self.work, it.script)
            return [self.py, wrap, sp, url, out], self.work
        # 受測程式自己叫的 git（單元測試 git show 企劃稿）也照 LF：PC 的 repo 設了 core.autocrlf=true，N1 lf2 有一批「讀稿 0 句、行尾帶 \\r」的 FAIL（CC 2026-11-03）
        env['GIT_CONFIG_COUNT'] = '2'
        env['GIT_CONFIG_KEY_0'] = 'core.autocrlf'
        env['GIT_CONFIG_VALUE_0'] = 'false'
        env['GIT_CONFIG_KEY_1'] = 'core.eol'
        env['GIT_CONFIG_VALUE_1'] = 'lf'
        if k == 'node':
            # BB 22:37：單元測試會 execSync('python3 …')；Windows 沒有 python3 這個指令 → PATH 前面放一個 python3.cmd 指到 runner 自己的 python（不改測試）
            if IS_WIN:
                shim = os.path.join(self.wtroot, 'cc_shims')
                try:
                    os.makedirs(shim, exist_ok=True)
                    with open(os.path.join(shim, 'python3.cmd'), 'w', encoding='ascii', errors='replace') as fh:
                        fh.write('@"%s" %%*\r\n' % self.py)
                    env['PATH'] = shim + os.pathsep + env.get('PATH', os.environ.get('PATH', ''))
                except OSError as e:
                    log('python3 shim not created: %r' % (e,))
            if not self.node:
                raise RuntimeError('node not found (set CC_NODE)')
            os.makedirs(out, exist_ok=True)
            sp = os.path.join(wt, it.script)
            if not os.path.exists(sp):   # N1_node：總管腳本（tools/cc_local/node_units.js）在 cc-testing（Work），受測版本裡沒有；cwd 照樣是 wt
                sp = os.path.join(self.work, it.script)
            return [self.node, sp] + xa, wt
        if k == 'blender':
            if not self.blender:
                raise RuntimeError('blender not found (set CC_BLENDER)')
            os.makedirs(out, exist_ok=True)
            script = os.path.join(wt, it.script)
            script = self.script_from(it, env, wt) or script
            if blender_is_python(self.blender):
                return [self.blender, script, '--'] + xa, wt
            return [self.blender, '-b', '-t', env.get('CC_BLENDER_THREADS', str(blender_threads())), '--python-exit-code', '1', '--python', script, '--'] + xa, wt
        raise RuntimeError('unknown kind %s' % k)

    def run_item(self, it):
        sha = it.rsha
        od = os.path.join(self.out_root, it.id)
        os.makedirs(od, exist_ok=True)
        meta = OrderedDict([('rerun', it.rerun), ('id', it.id), ('sha', sha), ('kind', it.kind), ('script', it.script),
                            ('env', it.env), ('machine', os.environ.get('COMPUTERNAME') or platform.node()),
                            ('start', datetime.now().strftime('%Y-%m-%dT%H:%M:%S')), ('end', None), ('seconds', None),
                            ('exit', None), ('error', None),
                            ('runner', self.self_hash[:10]), ('rf_round', os.environ.get('CC_RF_ROUND'))])   # 哪一版 runner、run_forever 第幾輪（None＝不是經 run_forever 啟動）
        t0 = time.time()
        wt = os.path.join(self.wtroot, 'wt_cc_' + it.id)
        wt2 = None
        srv = srv2 = p = None
        ports = []
        log('==== START %s  (%s @ %s) ====' % (it.id, it.kind, sha))
        ar_on = self.autoretry_on(it)
        if ar_on:
            try:
                self.ar_clean(od)
            except Exception as e:
                log('WARNING autoretry clean failed for %s: %r' % (it.id, e))
        running_f = os.path.join(od, 'running.json')   # BB 11-03：被打斷的項目要記下來（中斷時間、跑到哪）；正常結束會刪掉
        try:
            with open(running_f, 'w', encoding='utf-8') as fh:
                json.dump({'id': it.id, 'sha': sha, 'start': meta['start'], 'rf_round': os.environ.get('CC_RF_ROUND'), 'runner': self.self_hash[:10]}, fh, ensure_ascii=False)
        except OSError:
            pass
        peak = {'cpu': None, 'mem': None, 'used_gb': None, 'chrome_testing': None}
        stop_res = threading.Event()

        def sample(tag=None):
            r = res_snapshot()
            for k in peak:
                if r.get(k) is not None and (peak[k] is None or r[k] > peak[k]):
                    peak[k] = r[k]
            if tag:
                log('%s  %s %s' % (res_line(r), tag, it.id))

        def sampler():                      # 這一項期間每 30 秒取一次，記最高值（meta.json 的 res_peak）
            while not stop_res.wait(30):
                try:
                    sample()
                except Exception:
                    pass
        try:
            sample('START')
        except Exception:
            pass
        th_res = threading.Thread(target=sampler, daemon=True)
        th_res.start()
        try:
            wt = self.wt_add(wt, sha)
            srv, port = self.start_server(wt, 8800)
            ports.append(port)
            url = 'http://127.0.0.1:%d/%s' % (port, it.url)
            meta['url'] = url
            url2 = ''
            sha2 = it.envd.get('SHA2', '').strip()
            if sha2:
                wt2 = wt + '_2'
                wt2 = self.wt_add(wt2, sha2)
                srv2, port2 = self.start_server(wt2, port + 1)
                ports.append(port2)
                url2 = 'http://127.0.0.1:%d/%s' % (port2, it.url)
                meta['url2'] = url2
                meta['sha2'] = sha2
            env = dict(os.environ)
            env['PYTHONUTF8'] = '1'
            env['PYTHONIOENCODING'] = 'utf-8'
            env['CC_GPU'] = os.environ.get('CC_GPU', '1' if IS_WIN else '0')   # 舊版固定 1（Windows）；非 Windows 預設 0＝不加 d3d11
            env['CC_SLOT'] = str(it.slot)          # 並行槽位：gpu_wrap 讓有視窗的瀏覽器並排
            env['CC_ITEM'] = it.id
            if it.kind in ('probe', 'game', 'webkit') and self.headed and 'CC_HEADLESS' not in os.environ:
                env['CC_HEADLESS'] = '0'           # 預設有視窗，讓使用者看得到遊戲畫面（佇列 ENV 有寫 CC_HEADLESS 的照佇列）
            for kk, vv in it.envd.items():
                env[kk] = vv
            if getattr(self, 'force_headless', False) and it.kind in ('probe', 'game', 'webkit'):
                if env.get('CC_HEADLESS') != '1':
                    meta['headless_forced'] = True   # config.txt HEADLESS=1：蓋過佇列的 CC_HEADLESS=0
                env['CC_HEADLESS'] = '1'
            if it.kind == 'blender':
                # 使用者 11-03 13:3x 選「改成只用 CPU」：PC 上的 Blender 一律 CPU，不用 HIP（佇列寫 HIP 也改回 CPU，記在 meta）；留兩個核心給系統
                if env.get('CC_BLENDER_DEVICE', 'CPU').upper() != 'CPU':
                    meta['device_forced'] = '%s -> CPU' % env.get('CC_BLENDER_DEVICE')
                env['CC_BLENDER_DEVICE'] = 'CPU'
                env.setdefault('CC_BLENDER_THREADS', str(blender_threads()))
                meta['blender_threads'] = env['CC_BLENDER_THREADS']
            cmd, cwd = self.build_cmd(it, wt, od, url, url2, env)
            if ar_on:
                it._t_proc = time.time()
            with open(os.path.join(od, 'run.log'), 'wb') as fo, open(os.path.join(od, 'err.log'), 'wb') as fe:
                p = subprocess.Popen(cmd, cwd=cwd, env=env, stdout=fo, stderr=fe, stdin=subprocess.DEVNULL, **popen_flags())
                deadline = time.time() + it.tmin * 60; next_chk = time.time() + 120
                while True:   # CC-B 11-09（BB-B 20:41：要能遠端停掉跑到一半的項目）：每 2 分鐘看一次 cc-testing 上的 config.txt，CANCEL= 有這一項的 ID 就停掉
                    try:
                        p.wait(max(1, min(30, deadline - time.time())))
                        break
                    except subprocess.TimeoutExpired:
                        if time.time() >= deadline:
                            kill_tree(p)
                            meta['error'] = 'timeout %d min' % it.tmin
                            break
                        if time.time() >= next_chk:
                            next_chk = time.time() + 120
                            if it.id in self.remote_cancel_ids():
                                log('config.txt CANCEL: stopping %s (still running)' % it.id)
                                kill_tree(p)
                                meta['error'] = 'cancelled (config.txt CANCEL)'
                                break
            meta['exit'] = p.returncode
            if ar_on:
                try:
                    self.ar_retry(it, meta, od, wt, url, url2, env, cmd)
                except Exception as e:      # 新功能出錯：退回舊行為（第一次的結果照記）
                    log('WARNING autoretry failed for %s (old behaviour kept): %r' % (it.id, e))
        except Exception as e:
            meta['error'] = str(e)
            log('ERROR %s : %s' % (it.id, e))
        finally:
            if p is not None and p.poll() is None:
                kill_tree(p)
            for s in (srv, srv2):
                kill_tree(s)
            for pt in ports:
                release_port(pt)
            time.sleep(1)
            if wt2:
                self.wt_remove(wt2)
            self.wt_remove(wt)
        stop_res.set()
        try:
            sample('END')
        except Exception:
            pass
        meta['res_peak'] = peak
        try:   # CC-B 11-09（BB-B）：記這一項的 SHA 在不在值班 LAWWW 的開發分支上，BB 核 SHA 時對得上
            meta['dev_branch'] = DEV_BRANCH
            rc_, _ = git('-C', self.repo, 'merge-base', '--is-ancestor', sha, 'origin/' + DEV_BRANCH, quiet=True)
            meta['sha_on_dev_branch'] = (rc_ == 0)
        except Exception as e:
            meta['dev_branch_err'] = repr(e)[:120]
        try:   # BB-B 11-08 12:34：gpu_wrap 印的 WebGL renderer 寫進 meta.json（AMD＝GPU；SwiftShader＝不能判美術）
            with open(os.path.join(od, 'run.log'), 'rb') as fr:
                rr = sorted(set(l.split(b'WEBGL_RENDERER:', 1)[1].strip().decode('utf-8', 'replace') for l in fr if b'WEBGL_RENDERER:' in l))
            if rr:
                meta['webgl_renderer'] = rr if len(rr) > 1 else rr[0]
        except Exception:
            pass
        try:
            os.remove(running_f)
        except OSError:
            pass
        meta['end'] = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
        meta['seconds'] = int(round(time.time() - t0))
        if ar_on:
            try:
                self.ar_report(it, meta, od)
            except Exception as e:
                log('WARNING autoretry report failed for %s (old behaviour kept): %r' % (it.id, e))
        with open(os.path.join(od, 'meta.json'), 'w', encoding='utf-8') as fh:
            json.dump(meta, fh, ensure_ascii=False, indent=2)
        lines = self.summary_lines(it, meta, od)
        self.commit(it, meta, od, lines)
        log('==== END   %s  exit=%s  %ss  %s ====' % (it.id, meta['exit'], meta['seconds'], meta['error'] or ''))
        return meta

    # ---------- 失敗自動追蹤（CC_AUTORETRY） ----------
    def autoretry_on(self, it):
        try:
            return bool(getattr(self.a, 'autoretry', False)) or str(it.envd.get('CC_AUTORETRY', os.environ.get('CC_AUTORETRY', ''))).strip() == '1'
        except Exception:
            return False

    @staticmethod
    def script_of(it, cmd):
        want = it.script.replace('\\', '/')
        for x in cmd or []:
            if isinstance(x, str) and x.replace('\\', '/').endswith(want):
                return x
        return None

    def ar_clean(self, od):
        """開這一項之前：刪掉上一次（舊 RERUN）留下的 attempt1／attempt2／report"""
        for n in ('attempt1', 'attempt2'):
            shutil.rmtree(os.path.join(od, n), ignore_errors=True)
        for n in ('report.json', 'report.md', 'notes.txt'):
            try:
                os.remove(os.path.join(od, n))
            except OSError:
                pass

    def ar_cases(self, it, script, run_log, env):
        """有 CASES 的探針：第一次 run.log 照「== X」段落找出 FAIL 屬於哪些 CASE。回傳 (cases 字串或 None, 說明)"""
        src = read_text(script) if script else ''
        if not re.search(r"environ\.get\(\s*['\"]CASES['\"]", src):
            return None, '探針不支援 CASES 環境變數：整支重跑'
        valid = [c.strip() for c in str(env.get('CASES', '')).split(',') if c.strip()]
        if not valid:
            m = re.search(r"environ\.get\(\s*['\"]CASES['\"]\s*\)\s*or\s*['\"]([^'\"]+)['\"]", src)
            valid = [c.strip() for c in (m.group(1) if m else '').split(',') if c.strip()]
        if not valid:
            return None, '找不到這支探針的 CASES 清單：整支重跑'
        cur, failed, orphan = None, [], []
        for line in run_log.splitlines():
            m = re.match(r'^== (?:case )?([A-Za-z0-9_]+)', line)
            if m:
                cur = m.group(1) if m.group(1) in valid else '?' + m.group(1)
                continue
            if line.startswith('FAIL'):
                if cur is None or cur.startswith('?'):
                    orphan.append(line[:120])
                elif cur not in failed:
                    failed.append(cur)
        if orphan:
            return None, 'FAIL 行不在任何已知 CASE 段落裡（例：%s）：整支重跑' % orphan[0]
        if not failed:
            return None, '第一次沒有可以歸到 CASE 的 FAIL 行（exit≠0 但沒有 FAIL，或逾時）：整支重跑'
        if sorted(failed) == sorted(valid):
            return None, '所有 CASE（%s）都有 FAIL：整支重跑' % ','.join(valid)
        return ','.join(failed), '只重跑 FAIL 的 CASE %s（第一次跑了 %s；前置操作照探針原樣做）' % (','.join(failed), ','.join(valid))

    def ar_retry(self, it, meta, od, wt, url, url2, env, cmd1):
        """第一次跑完（還在 try 裡、worktree 和 server 都還在）：FAIL 就把第一次的輸出搬到 attempt1/，開 trace 重跑一次到 attempt2/"""
        ar = {'on': True, 'a1': {'exit': meta['exit'], 'error': meta['error'], 'timeout': bool(meta['error'] and str(meta['error']).startswith('timeout')),
                                 'blob': git_blob(self.script_of(it, cmd1)), 'input': input_hash({k: env.get(k) for k in it.envd}, it.envd.get('XARGS', '').strip()),
                                 'cases': str(env.get('CASES', '') or '(探針預設)'), 'seconds': int(round(time.time() - it._t_proc)) if hasattr(it, '_t_proc') else None},
              'a2': None, 'notes': [], 'script_path': self.script_of(it, cmd1)}
        it._ar = ar
        meta['attempt'] = 1
        a1 = ar['a1']
        if a1['exit'] == 0 and not a1['error']:
            meta['final'] = 'PASS'
            return
        if a1['timeout']:
            try:
                lim = float(ar_env_flag(it.envd, 'CC_RETRY_MAX_MIN', '20') or 20)
            except ValueError:
                lim = 20
            if ar_env_flag(it.envd, 'CC_RETRY_TIMEOUT') != '1' or it.tmin > lim:
                ar['notes'].append('逾時不重跑（預設；要重跑：ENV CC_RETRY_TIMEOUT=1，而且逾時 ≤ CC_RETRY_MAX_MIN=%g 分）' % lim)
                return
        a1dir = os.path.join(od, 'attempt1')
        os.makedirs(a1dir, exist_ok=True)
        for n in os.listdir(od):
            if n in AR_KEEP:
                continue
            try:
                shutil.move(os.path.join(od, n), os.path.join(a1dir, n))
            except Exception as e:
                ar['notes'].append('第一次的 %s 沒搬到 attempt1：%r' % (n, e))
        od2 = os.path.join(od, 'attempt2')
        tdir = os.path.join(od2, 'trace')
        os.makedirs(tdir, exist_ok=True)
        env2 = dict(env)
        env2['CC_TRACE'] = '1'
        env2['CC_TRACE_DIR'] = tdir
        cases, why = self.ar_cases(it, ar['script_path'], read_text(os.path.join(a1dir, 'run.log')), env)
        ar['scope'] = why
        if cases:
            env2['CASES'] = cases
        cmd2, cwd2 = self.build_cmd(it, wt, od2, url, url2, env2)
        a2 = {'exit': None, 'error': None, 'timeout': False, 'blob': git_blob(self.script_of(it, cmd2)),
              'input': input_hash({k: env2.get(k) for k in it.envd}, it.envd.get('XARGS', '').strip()), 'cases': cases or str(env.get('CASES', '') or '(探針預設)')}
        ar['a2'] = a2
        log('AUTORETRY %s: first run %s - rerun once with trace (%s)' % (it.id, ('timeout' if a1['timeout'] else 'exit %s' % a1['exit']), 'CASES=' + cases if cases else 'whole probe'))
        t2 = time.time()
        p2 = None
        try:
            with open(os.path.join(od2, 'run.log'), 'wb') as fo, open(os.path.join(od2, 'err.log'), 'wb') as fe:
                p2 = subprocess.Popen(cmd2, cwd=cwd2, env=env2, stdout=fo, stderr=fe, stdin=subprocess.DEVNULL, **popen_flags())
                try:
                    p2.wait(it.tmin * 60)
                except subprocess.TimeoutExpired:
                    kill_tree(p2)
                    a2['error'] = 'timeout %d min' % it.tmin
                    a2['timeout'] = True
            a2['exit'] = p2.returncode
        finally:
            if p2 is not None and p2.poll() is None:
                kill_tree(p2)
        a2['seconds'] = int(round(time.time() - t2))
        meta['attempt'] = 2
        meta['exit2'] = a2['exit']
        if a2['error']:
            meta['error2'] = a2['error']

    def ar_attempt(self, od, sub, rec):
        d = os.path.join(od, sub) if sub else od
        run = read_text(os.path.join(d, 'run.log'))
        fails = []
        for line in run.splitlines():
            if line.startswith('FAIL ') or line.startswith('FAILED'):
                if line.startswith('FAILED'):
                    continue
                body = line[5:]
                name, _, info = body.partition('  ')
                m_src = re.search(r'\[src=(game|probe)\]', body)   # BB-C 11-04（TEST-TRACE V2）：斷言的值從哪裡來——game＝從遊戲狀態讀出來的、probe＝探針自己的常數
                fails.append({'line': line[:300], 'name': name[:300], 'info': info.strip()[:300], 'src': m_src.group(1) if m_src else None})
        tdir = os.path.join(d, 'trace')
        states = []
        for f in sorted(glob.glob(os.path.join(tdir, 'state_*.json'))):
            try:
                with open(f, encoding='utf-8') as fh:
                    states.append(json.load(fh))
            except Exception:
                pass
        envj = {}
        try:
            with open(os.path.join(tdir, 'env.json'), encoding='utf-8') as fh:
                envj = json.load(fh)
        except Exception:
            pass
        a = dict(rec or {})
        a.update({'run': run, 'err': read_text(os.path.join(d, 'err.log')), 'fails': fails,
                  'events': read_jsonl(os.path.join(tdir, 'events.jsonl')), 'states': states, 'envj': envj, 'dir': d})
        return a

    def ar_dom_check(self, a, tb):
        """TEST_BUG 的佐證：等待的 #id selector 在 trace 的 DOM snapshot 裡有沒有出現"""
        out = {}
        try:
            import zipfile
            m = re.search(r'waiting for (?:locator\()?["\']([^"\']+)["\']', tb or '')
            if not m or not re.fullmatch(r'#[A-Za-z][\w-]*', m.group(1)):
                return out
            sel = m.group(1)
            needle = '"id":"%s"' % sel[1:]
            found = False
            for z in glob.glob(os.path.join(a['dir'], 'trace', '*.zip')):
                with zipfile.ZipFile(z) as zi:
                    for n in zi.namelist():
                        if n.endswith('.trace') and needle in zi.read(n).decode('utf-8', 'replace'):
                            found = True
            out[sel] = found
        except Exception as e:
            log('autoretry dom check skipped: %r' % (e,))
        return out

    def ar_report(self, it, meta, od):
        """（finally 之後、寫 meta.json 之前）分類、寫 report.json／report.md、清本機資訊；PASS 只加 attempt／final"""
        ar = getattr(it, '_ar', None)
        if ar is None:       # 沒跑到探針（runner 例外）
            ar = {'a1': {'exit': meta['exit'], 'error': meta['error'], 'timeout': False, 'runner_error': meta['error'], 'blob': None,
                         'input': input_hash(it.envd, it.envd.get('XARGS', '').strip()), 'cases': None}, 'a2': None, 'notes': [], 'scope': None}
            meta['attempt'] = 1
        if meta.get('final') == 'PASS':
            return
        two = ar['a2'] is not None
        a1 = self.ar_attempt(od, 'attempt1' if two else '', ar['a1'])
        a2 = self.ar_attempt(od, 'attempt2', ar['a2']) if two else None
        if a2 is not None:
            a2['dom_check'] = self.ar_dom_check(a2, a2['err'][a2['err'].rfind('Traceback'):] if 'Traceback' in a2['err'] else '')
        cond = {'game_sha': [meta['sha'], meta['sha'] if two else None],
                'script_blob': [a1.get('blob'), a2.get('blob') if a2 else None],
                'input_hash': [a1.get('input'), a2.get('input') if a2 else None],
                'cases': [a1.get('cases'), a2.get('cases') if a2 else None]}
        diff = []
        if two:
            if cond['script_blob'][0] != cond['script_blob'][1] or not cond['script_blob'][0]:
                diff.append('腳本 blob 不同或讀不到')
            if cond['input_hash'][0] != cond['input_hash'][1]:
                diff.append('輸入雜湊不同')
            c1, c2 = a1.get('cases') or '', a2.get('cases') or ''
            if c1 != c2 and not (ar.get('scope') or '').startswith('只重跑'):
                diff.append('CASES 不同（%s → %s）' % (c1, c2))
        same = {'all': two and not diff, 'diff': diff}
        notes = list(ar.get('notes') or [])
        try:
            cls, sub, basis = classify(a1, a2, same, notes)
        except Exception as e:
            cls, sub, basis = 'UNKNOWN', 'classify-error', ['分類程式出錯：%r' % (e,)]
        final = {'FLAKY': 'FLAKY'}.get(cls, 'TIMEOUT' if (a2 or a1)['timeout'] else ('ERROR' if a1.get('runner_error') else 'FAIL'))
        meta['final'] = final
        meta['class'] = cls if not sub else '%s/%s' % (cls, sub)
        meta['report'] = 'report.json'
        # 證據：PASS（重跑通過）不留 trace zip
        last = a2 if a2 is not None else a1
        if cls == 'FLAKY':
            for z in glob.glob(os.path.join(od, 'attempt2', 'trace', '*.zip')):
                try:
                    os.remove(z)
                except OSError:
                    pass
            notes.append('重跑 PASS：照規則刪掉 attempt2 的 trace.zip（events／state／env 保留）')
        san = Sanitizer([(self.work, '<REPO>'), (self.repo, '<REPO_MAIN>'), (self.wtroot, '<WTROOT>'),
                         (os.path.expanduser('~'), '<HOME>'), (__import__('tempfile').gettempdir(), '<TMP>')])
        try:
            max_mb = float(ar_env_flag(it.envd, 'CC_TRACE_MAX_MB', '20') or 20)
        except ValueError:
            max_mb = 20.0
        basis = [san.text(str(x)) for x in basis]     # 依據會帶 traceback 的檔案路徑：meta.json 和 report.md 也要清
        notes = [san.text(str(x)) for x in notes]
        meta['class_basis'] = basis[:3]
        scan = {'text_files_rewritten': [], 'zip_entries_rewritten': 0, 'left_hits': []}
        for sub_d in ('attempt1', 'attempt2'):
            for dp, _, fs in os.walk(os.path.join(od, sub_d)):
                for f in fs:
                    fp = os.path.join(dp, f)
                    if f.lower().endswith(TEXT_EXT):
                        if san.file(fp):
                            scan['text_files_rewritten'].append(os.path.relpath(fp, od).replace('\\', '/'))
                        hh = san.hits(read_text(fp))
                        if hh:
                            scan['left_hits'].append('%s:%s' % (os.path.relpath(fp, od), ','.join(hh)))
                    elif f.lower().endswith('.zip'):
                        try:
                            if ar_env_flag(it.envd, 'CC_TRACE_KEEP_BODIES') != '1':
                                scan.setdefault('slim', {})[os.path.relpath(fp, od).replace('\\', '/')] = slim_zip(fp, int(max_mb * 1024 * 1024))
                            n, left = san.zipfile(fp)
                            scan['zip_entries_rewritten'] += n
                            scan['left_hits'] += ['%s!%s' % (os.path.relpath(fp, od), x) for x in left]
                        except Exception as e:
                            scan['left_hits'].append('%s: zip not scanned %r' % (f, e))

        def rel(p):
            return os.path.relpath(p, od).replace('\\', '/')
        shots = sorted(rel(os.path.join(dp, f)) for dp, _, fs in os.walk(od) for f in fs if f.lower().endswith(('.png', '.jpg', '.webp')))
        # BB-C 11-04：report 的 traces 照 commit 時真正的推送計畫寫（第一個／第二個 commit、或 skipped_size），不是只看單檔大小
        zips = sorted(glob.glob(os.path.join(od, 'attempt2', 'trace', '*.zip')))
        pacc = 0
        for f in sorted(os.path.join(dp, fn) for dp, _, fs in os.walk(od) for fn in fs if fn.lower().endswith('.png')):
            sz = os.path.getsize(f)
            if pacc + sz <= PNG_CAP: pacc += sz
        t1, t2, tsk = plan_trace_commits([(z, r, os.path.getsize(z)) for z, r in trace_roles(zips)], pacc, PNG_CAP, max_mb * 1024 * 1024)
        role = dict(trace_roles(zips)); skipd = dict(tsk)
        traces = [{'path': rel(z), 'bytes': os.path.getsize(z), 'role': role.get(z), 'push': z in t1 or z in t2,
                   'commit': 1 if z in t1 else (2 if z in t2 else None), 'skipped': 'skipped_size' if z in skipd else None, 'why': skipd.get(z)} for z in zips]
        js = []
        for e in last['events']:
            if e.get('kind') in ('pageerror', 'console', 'requestfailed', 'crash') or (e.get('kind') == 'browser_disconnected' and e.get('expected') is False):
                js.append({k: e.get(k) for k in ('rel', 'kind', 'ctx', 'page', 'level', 'name', 'message', 'text', 'stack', 'url', 'failure') if e.get(k) is not None})
        js_wrap = re.findall(r'\[gpu_wrap [^\]]*\] (pageerror .*|PAGE CRASH.*|BROWSER DISCONNECTED.*)', a1['err'] + (a2['err'] if a2 else ''))
        url = meta.get('url', '')
        allrun = a1['run'] + (a2['run'] if a2 else '')
        setups = [x.strip()[:200] for x in allrun.splitlines() if '前置／捷徑' in x]
        state_view = []
        for st in last['states']:
            for pg in st.get('pages', []):
                state_view.append({'ctx_why': st.get('why'), 'page': pg.get('page'), 'state': pg.get('state'), 'error': pg.get('error'), 'closed': pg.get('closed')})
        rc_cc, cc_sha = git('-C', self.repo, 'rev-parse', '--short', 'origin/' + CC_BRANCH, capture=True)   # 腳本版本＝runner 合併進來的 cc-testing
        rep = OrderedDict([
            ('id', it.id), ('sha', meta['sha']), ('kind', it.kind), ('script', it.script), ('script_from', it.envd.get('SCRIPT_FROM') or None),
            ('script_blob', cond['script_blob']), ('cc_testing_sha', cc_sha.strip() if rc_cc == 0 else None), ('runner', self.self_hash[:10]),
            ('final', final), ('class', cls), ('class_sub', sub), ('basis', basis),
            ('conditions', OrderedDict([('same', same['all']), ('diff', diff), ('game_sha', cond['game_sha']), ('script_blob', cond['script_blob']),
                                        ('input_hash', cond['input_hash']), ('cases', cond['cases'])])),
            ('rerun_scope', ar.get('scope')),
            ('attempts', [OrderedDict([('n', i + 1), ('exit', a.get('exit')), ('error', a.get('error')), ('timeout', a.get('timeout')), ('seconds', a.get('seconds')),
                                       ('fails', a['fails'][:40]), ('dir', rel(a['dir']) if a['dir'] != od else '.'),
                                       ('run_tail', [x[:300] for x in a['run'].splitlines()[-8:]]), ('err_tail', [x[:300] for x in a['err'].splitlines()[-12:]])])
                          for i, a in enumerate([x for x in (a1, a2) if x is not None])]),
            ('js_errors', js[:40]), ('js_errors_gpu_wrap', [x[:300] for x in js_wrap[:20]]),
            ('state', state_view),
            ('env', OrderedDict([('browser', last['envj'].get('browser')), ('playwright', last['envj'].get('playwright')),
                                 ('gpu_renderer', last['envj'].get('gpu_renderer')), ('headless', last['envj'].get('headless')),
                                 ('os', last['envj'].get('os')), ('cc_gpu', last['envj'].get('cc_gpu')), ('slot', getattr(it, 'slot', None))])),
            ('shortcuts', OrderedDict([('turbo', 'turbo' in url), ('url', san.text(url)), ('setup_lines', len(setups)), ('setup_first', setups[:6]),
                                       ('load_save', sum(1 for x in setups if '讀檔' in x))])),
            ('screenshots', shots[:80]), ('traces', traces), ('sanitize', scan), ('notes', notes),
            ('show_trace', 'python -m playwright show-trace <trace.zip>（或拖到 https://trace.playwright.dev）'),
        ])
        rep = json.loads(san.text(json.dumps(rep, ensure_ascii=False)))
        with open(os.path.join(od, 'report.json'), 'w', encoding='utf-8') as fh:
            json.dump(rep, fh, ensure_ascii=False, indent=2)
        md = ['# %s：%s（%s）' % (it.id, final, meta['class']), '',
              '- SHA %s，腳本 %s（blob %s）' % (meta['sha'], it.script, ' / '.join(str(x) for x in cond['script_blob'])),
              '- 兩次條件相同：%s %s' % (same['all'], ('（' + '、'.join(diff) + '）') if diff else ''),
              '- 重跑範圍：%s' % (ar.get('scope') or '沒有重跑'), '', '## 判斷依據'] + ['- ' + b for b in basis] + ['', '## 每一次']
        for a in rep['attempts']:
            md.append('- 第 %s 次：exit %s %s，%s 秒，FAIL %d 行' % (a['n'], a['exit'], a['error'] or '', a['seconds'], len(a['fails'])))
            md += ['  - `%s`' % f['line'] for f in a['fails'][:10]]
        md += ['', '## JS／console 錯誤'] + ['- %s %s' % (e.get('kind'), (e.get('message') or e.get('text') or e.get('failure') or '')[:200]) for e in js[:15]]
        md += ['', '## 遊戲狀態'] + ['- ```%s```' % json.dumps(s.get('state'), ensure_ascii=False)[:600] for s in state_view[:3]]
        md += ['', '## 檔案'] + ['- trace `%s`（%d bytes%s）' % (t['path'], t['bytes'], '' if t['push'] else '，超過上限不推') for t in traces] + ['- 截圖 `%s`' % s for s in shots[:20]]
        md += ['', '- 捷徑：turbo=%s，[前置／捷徑] %d 行（讀檔 %d）' % (rep['shortcuts']['turbo'], len(setups), rep['shortcuts']['load_save'])]
        with open(os.path.join(od, 'report.md'), 'w', encoding='utf-8') as fh:
            fh.write(san.text('\n'.join(md)) + '\n')
        log('AUTORETRY %s: final %s  class %s' % (it.id, final, meta['class']))

    @staticmethod
    def tail(path, n):
        if not os.path.exists(path):
            return []
        with open(path, encoding='utf-8', errors='replace') as fh:
            return [x.rstrip('\r\n') for x in fh.readlines()[-n:]]

    def summary_lines(self, it, meta, od):
        rl = os.path.join(od, 'run.log')
        if not os.path.exists(rl) and os.path.exists(os.path.join(od, 'attempt2', 'run.log')):   # CC_AUTORETRY 重跑過：第一次的搬到 attempt1/
            rl = os.path.join(od, 'attempt2', 'run.log')
        tail = ' / '.join(self.tail(rl, 3))
        lines = ['%s  sha=%s  exit=%s  %ss  %s  %s' % (it.id, meta['sha'], '' if meta['exit'] is None else meta['exit'],
                                                      meta['seconds'], meta['error'] or '', tail)]
        el = os.path.join(od, 'err.log')
        if not os.path.exists(el) and os.path.exists(os.path.join(od, 'attempt2', 'err.log')):
            el = os.path.join(od, 'attempt2', 'err.log')
        if os.path.exists(el) and os.path.getsize(el) > 0:
            lines.append('    err.log (last 5): ' + ' | '.join(self.tail(el, 5)))
        if meta.get('final') and meta.get('final') != 'PASS':
            lines.append('    autoretry: final %s  class %s  exit2 %s' % (meta.get('final'), meta.get('class'), meta.get('exit2')))
        return lines

    # ---------- 5. commit＋push（一把鎖，序列化） ----------
    def commit(self, it, meta, od, lines):
        with GIT_LOCK:
            self.summary.extend(lines)
            sum_file = os.path.join(self.out_root, 'summary.md')
            with open(sum_file, 'a', encoding='utf-8') as fh:
                fh.write('- ' + datetime.now().strftime('%Y-%m-%dT%H:%M:%S') + '  ' + '\n  '.join(lines) + '\n')
            files = []
            for dp, _, fs in os.walk(od):
                for f in fs:
                    files.append(os.path.join(dp, f))
            pngs = sorted(f for f in files if f.lower().endswith('.png'))
            acc = 0
            skipped = 0
            add = []
            big = []
            traces = [f for f in files if f.lower().endswith('.zip') and (os.sep + 'attempt2' + os.sep + 'trace' + os.sep) in f]   # CC_AUTORETRY 的 trace（沒開時沒有這種檔）
            for f in files:
                if f.lower().endswith('.png') or f in traces:
                    continue
                if os.path.getsize(f) > BIG_CAP:   # BB 13:30：超過 50 MB 的不推，只記路徑和大小
                    big.append(f)
                else:
                    add.append(f)
            if big:
                nf = os.path.join(od, 'notes.txt')
                with open(nf, 'a', encoding='utf-8') as fh:
                    for f in big:
                        fh.write('not pushed (over 50 MB): %s  %d bytes\n' % (f, os.path.getsize(f)))
                if nf not in add:
                    add.append(nf)
            for f in pngs:
                sz = os.path.getsize(f)
                if acc + sz <= PNG_CAP:
                    acc += sz
                    add.append(f)
                else:
                    skipped += 1
            if skipped:
                nf = os.path.join(od, 'notes.txt')
                with open(nf, 'a', encoding='utf-8') as fh:
                    fh.write('screenshots not pushed (over 25 MB): %d\n' % skipped)
                if nf not in add:
                    add.append(nf)
            trace2 = []
            if traces:
                try:
                    tmax = float(it.envd.get('CC_TRACE_MAX_MB') or os.environ.get('CC_TRACE_MAX_MB') or 20) * 1024 * 1024
                except ValueError:
                    tmax = 20 * 1024 * 1024
                tnotes = []
                # 分段 trace：FAIL 那一段 ＞ FAIL 的前一段 ＞ 後一段 ＞ 其他（TT_V15 c005 被 c004 擠掉）；BB-C 11-04：上限不放寬，前一段放不進就推第二個 commit（一項最多兩個）
                sized = [(f, r, os.path.getsize(f)) for f, r in trace_roles(traces)]
                t1, t2, tskip = plan_trace_commits(sized, acc, PNG_CAP, tmax)
                add.extend(t1); trace2 = t2
                cap_mb = PNG_CAP / 1048576.0
                for f, why in tskip:
                    if '_FAIL' in os.path.basename(f):   # BB-C 11-04：FAIL 段自己就超過上限——trace 不推，但 report、run.log、狀態快照、notes 照推
                        tnotes.append('trace 太大沒推：FAIL 段 %.1f MB > 上限 %.0f MB（%s）' % (os.path.getsize(f) / 1048576.0, min(cap_mb, tmax / 1048576.0) if os.path.getsize(f) > tmax else cap_mb, os.path.relpath(f, od)))
                    else:
                        tnotes.append('trace not pushed (%s): %s  %d bytes' % (why, os.path.relpath(f, od), os.path.getsize(f)))
                for f in t2:
                    tnotes.append('trace in second commit (part 2): %s  %d bytes' % (os.path.relpath(f, od), os.path.getsize(f)))
                if tnotes:
                    nf = os.path.join(od, 'notes.txt')
                    with open(nf, 'a', encoding='utf-8') as fh:
                        fh.write('\n'.join(tnotes) + '\n')
                    if nf not in add:
                        add.append(nf)
            canon_rewrite([f for f in add if f not in traces] + [sum_file])   # D158／CANON-NO-ECON-1112：推上去以前，文字檔裡舊序章、外校的字換成代號
            # 先把索引清空（不動檔案）：舊 runner 中斷時可能留下已 git add 但沒 commit 的檔（BB 20:21：R8_y4s2rt／02_mk12），不能被這一筆帶進去
            git('-C', self.work, 'reset', '-q', quiet=True)
            forced = [f for f in add if f in traces]   # 只有 CC_AUTORETRY 的 trace.zip 用 -f（.gitignore 的 *.zip 會擋掉它，BB 05:15）
            normal = [f for f in add if f not in traces]
            for i in range(0, len(normal), 50):   # 其他檔照舊不加 -f：被 .gitignore 擋的（探針自己產生的 .zip、.pyc…）照舊不推，和改版前相同
                git('-C', self.work, 'add', '--', *normal[i:i + 50], quiet=True)
            for i in range(0, len(forced), 50):
                git('-C', self.work, 'add', '-f', '--', *forced[i:i + 50], quiet=True)
            git('-C', self.work, 'add', '--', sum_file, quiet=True)
            cf = self.write_console()
            if cf:
                git('-C', self.work, 'add', '--', cf, quiet=True)
            rc, out = git('-C', self.work, 'commit', '-q', '-m',
                          'CC-local: %s result (sha %s, exit %s, %ss)' % (it.id, meta['sha'], meta['exit'], meta['seconds']), quiet=True)
            if rc != 0:
                log('ERROR: git commit failed for %s (exit %s) - results are only on this PC in %s' % (it.id, rc, od))
                gray(out)
                self.summary.append('  !! commit failed for %s' % it.id)
            def _push(label):
                if self.a.no_push:
                    return True
                for w in (0, 2, 4, 8, 16):
                    if w:
                        time.sleep(w)
                        self.sync_results_branch('push retry')   # 被拒（fetch first）＝遠端有別人的 commit：先合併再推
                    rc, _ = git('-C', self.work, 'push', '-u', 'origin', self.branch)
                    if rc == 0:
                        return True
                log('push failed for %s%s (results stay in %s, rerun later)' % (it.id, label, self.work))
                return False
            ok1 = _push('')
            if trace2 and ok1:   # 第二個 commit：FAIL 的前一段（第一個放不進的），自己一個 ≤25 MB，分開推（一次推太大會被擋）
                for i in range(0, len(trace2), 50):
                    git('-C', self.work, 'add', '-f', '--', *trace2[i:i + 50], quiet=True)
                rc2, out2 = git('-C', self.work, 'commit', '-q', '-m',
                                'CC-local: %s result part 2 (trace %d file(s))' % (it.id, len(trace2)), quiet=True)
                if rc2 != 0:
                    log('ERROR: git commit (part 2) failed for %s (exit %s)' % (it.id, rc2))
                    gray(out2)
                else:
                    _push(' part 2')

    def remote_cancel_ids(self):
        """cc-testing 上最新的 config.txt 的 CANCEL=（逗號分隔的 ID）。讀不到就回空集合（不影響原本的流程）"""
        try:
            with GIT_LOCK:
                git('-C', self.repo, 'fetch', 'origin', CC_BRANCH, quiet=True)
                rc, out = git('-C', self.repo, 'show', 'FETCH_HEAD:tools/cc_local/config.txt', capture=True)
            if rc != 0: return set()
            for line in out.splitlines():
                line = line.strip()
                if line.startswith('CANCEL='):
                    return set(x.strip() for x in line[7:].split(',') if x.strip())
        except Exception as e:
            log('WARNING remote cancel check failed: %r' % e)
        return set()

    def apply_config(self):
        """每一輪讀 tools/cc_local/config.txt（從 cc-testing 合併來的）：PARALLEL=n（1～4）。改了就記一行"""
        cfg = read_config(os.path.join(self.work, 'tools', 'cc_local', 'config.txt'))
        v = cfg.get('PARALLEL', '')
        if v.isdigit():
            n = max(1, min(4, int(v)))
            if n != self.a.parallel:
                log('config.txt: PARALLEL %d -> %d' % (self.a.parallel, n))
                self.a.parallel = n
        # HEADLESS=1（使用者 11-04 15:4x 去睡覺：「我要去睡覺你可以采用那種……比較快」）：每一項都不開視窗，連佇列寫 CC_HEADLESS=0 的也照這個；
        # 拿掉或 0＝原本的行為（有視窗讓使用者看）。gpu_wrap 量過：d3d11 無視窗 26.6 fps、有視窗 17.1 fps，無視窗照樣用 GPU
        db = cfg.get('DEV_BRANCH', '').strip()
        global DEV_BRANCH
        if db and re.match(r'^[A-Za-z0-9._/-]+$', db) and db != DEV_BRANCH:
            log('config.txt: DEV_BRANCH %s -> %s' % (DEV_BRANCH, db))
            DEV_BRANCH = db
        fh = cfg.get('HEADLESS', '').strip() == '1'
        if fh != getattr(self, 'force_headless', False):
            log('config.txt: HEADLESS %s -> %s（%s）' % (int(getattr(self, 'force_headless', False)), int(fh), '每一項都不開視窗' if fh else '照佇列和預設（有視窗）'))
            self.force_headless = fh

    def write_console(self):
        """把畫面輸出的最後 2000 行寫到 local_out/_console/console.log；回傳路徑（失敗回 None）"""
        try:
            d = os.path.join(self.out_root, '_console')
            os.makedirs(d, exist_ok=True)
            f = os.path.join(d, 'console.log')
            with CONSOLE_LOCK:
                lines = list(CONSOLE_BUF)
            with open(f, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write('\n'.join(lines) + '\n')
            return f
        except Exception as e:
            log('console.log not written: %r' % (e,))
            return None

    def record_interrupted(self):
        """啟動時：上一輪留下 running.json 的項目＝被打斷（重開、當機、Ctrl+C）。記到 local_out/_interrupted.jsonl，log 一行；
        連同 run.log 的最後幾行（跑到哪）。running.json 搬走，免得下次重複記。回傳筆數。"""
        n = 0
        rec_f = os.path.join(self.out_root, '_interrupted.jsonl')
        try:
            names = sorted(os.listdir(self.out_root))
        except OSError:
            return 0
        for name in names:
            rf = os.path.join(self.out_root, name, 'running.json')
            if not os.path.isfile(rf):
                continue
            try:
                with open(rf, encoding='utf-8') as fh:
                    info = json.load(fh)
            except Exception:
                info = {'id': name}
            last = [x[:200] for x in self.tail(os.path.join(self.out_root, name, 'run.log'), 5)]
            info.update({'noticed': datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
                         'last_log_change': datetime.fromtimestamp(os.path.getmtime(os.path.join(self.out_root, name, 'run.log'))).strftime('%Y-%m-%dT%H:%M:%S') if os.path.exists(os.path.join(self.out_root, name, 'run.log')) else None,
                         'last_lines': last})
            try:
                os.makedirs(self.out_root, exist_ok=True)
                with open(rec_f, 'a', encoding='utf-8') as fh:
                    fh.write(json.dumps(info, ensure_ascii=False) + '\n')
                os.replace(rf, rf + '.interrupted')
            except OSError:
                pass
            log('INTERRUPTED last round: %s (started %s, last log change %s) - it will run again from the start' % (info.get('id'), info.get('start'), info.get('last_log_change')))
            n += 1
        return n

    def start_commit(self):
        """啟動時推一次 console.log（設定那幾行、run_forever 第幾輪、runner 雜湊）"""
        with GIT_LOCK:
            cf = self.write_console()
            if not cf:
                return
            git('-C', self.work, 'reset', '-q', quiet=True)
            itf = os.path.join(self.out_root, '_interrupted.jsonl')
            if os.path.exists(itf):
                git('-C', self.work, 'add', '--', itf, quiet=True)
            git('-C', self.work, 'add', '--', cf, quiet=True)
            rc, _ = git('-C', self.work, 'commit', '-q', '-m', 'CC-local: runner start (rf_round %s, runner %s)' % (os.environ.get('CC_RF_ROUND') or '-', self.self_hash[:10]), quiet=True)
            if rc != 0 or self.a.no_push:
                return
            for w in (0, 2, 4, 8):
                if w:
                    time.sleep(w)
                if git('-C', self.work, 'push', '-u', 'origin', self.branch, quiet=True)[0] == 0:
                    return
            log('push of the start console.log failed (will go with the next result)')

    # ---------- 主迴圈 ----------
    def main(self):
        install_console_tee()
        qe, ka = console_quickedit_off(), keep_awake()
        if qe is not None or ka is not None:
            log('Windows console: QuickEdit %s; keep awake while running: %s' % (qe, ka))
        log('run_forever round: %s   runner sha256: %s' % (os.environ.get('CC_RF_ROUND') or '- (not started by run_forever)', self.self_hash[:10]))
        self.banner()
        self.setup()
        kill_leftover_browsers()
        self.record_interrupted()
        self.apply_config()
        log('memory used: %s%%  (new items wait while >= %d%%)' % (mem_used_pct(), MEM_LIMIT))
        self.start_commit()
        items = self.read_queue()
        log('queue: ' + ', '.join(it.id for it in items))
        attempted = set()
        running = {}            # id -> (thread, item)
        self._running = running
        STATUS_EVERY = float(os.environ.get('CC_STATUS_EVERY', '300'))
        stop_status = threading.Event()

        def status_loop():          # BB 11-03：使用者看到視窗不動以為測完、把它關掉 → 每 5 分鐘印一行「還沒測完，請不要關」
            while not stop_status.wait(STATUS_EVERY):
                try:
                    items_now = list(self._running.values())
                    if items_now:
                        parts = ['%s（已跑 %d 分／上限 %d 分）' % (r[1].id, int((time.time() - getattr(r[1], 't_start', time.time())) // 60), r[1].tmin) for r in items_now]
                        log('正在跑：' + '、'.join(parts) + '——還沒測完，請不要關 (tests still running - please do not close)')
                except Exception:
                    pass
        threading.Thread(target=status_loop, daemon=True).start()
        done_q = queue.Queue()
        ran_n = skipped_n = 0
        need_refresh = False

        def worker(it):
            try:
                self.run_item(it)
            except Exception as e:      # 不讓一項的錯誤拖垮整晚
                log('ERROR %s (runner) : %r' % (it.id, e))
            finally:
                done_q.put(it.id)

        blender_wait_logged = set()
        while True:
            if need_refresh:
                self.refresh()
                items = self.read_queue()
                need_refresh = False
                if not self.restart_pending and file_hash(SELF_FILE) != self.self_hash:
                    self.restart_pending = True
                    log('run_queue.py has a new version - restart (exit %d) after the running item(s) finish; while long items (>=%d min) run, free slots still take short items' % (RESTART_EXIT, LONG_MIN))
            self.apply_config()
            long_running = any(r[1].tmin >= LONG_MIN for r in running.values())
            if self.restart_pending and not long_running:
                # 有新版、手上沒有長項目：不開新項目，跑完手上的就 exit 75
                if not running:
                    break
                fin = done_q.get()
                running.pop(fin, None)
                continue
            blender_running = any(r[1].kind == 'blender' or is_solo(r[1]) for r in running.values())   # 跑 SOLO 項目時也不開別的
            while len(running) < self.a.parallel and not blender_running:
                pick = None
                for cand in items:
                    if cand.id in running:
                        continue
                    if self.restart_pending and cand.tmin >= LONG_MIN:
                        continue   # BB 20:23 規則 B：有新版時，空格只開短項目，長項目等新版
                    cs = self.resolve(cand.sha)
                    key = '%s@%s#%s' % (cand.id, cs, cand.rerun)   # 鍵含 RERUN 記號（舊版漏了 RERUN）
                    if key in attempted:
                        continue
                    if is_solo(cand) and running and not self.is_done(cand, cs):
                        # BB 11:53：SOLO=1（例：touch_flow_wenzhou 要單獨跑才算數，#36）：不再開新項目，等手上的都跑完再單獨跑
                        if cand.id not in blender_wait_logged:
                            blender_wait_logged.add(cand.id)
                            log('solo item %s waits: no new items start until the %d running item(s) finish' % (cand.id, len(running)))
                        pick = 'SOLO_WAIT'
                        break
                    if cand.kind == 'blender' and running:
                        # BB 11:32（V18R）：要獨佔的 blender 項目等手上的跑完，但不擋後面的項目（舊版在這裡 break，FS112 跑 6 小時就整條佇列停住）
                        if cand.id not in blender_wait_logged:
                            blender_wait_logged.add(cand.id)
                            log('blender item %s waits until the %d running item(s) finish; other items go first' % (cand.id, len(running)))
                        continue
                    if self.is_done(cand, cs):
                        attempted.add(key)
                        skipped_n += 1
                        log('skip %s (already done on %s)' % (cand.id, cs))
                        continue
                    pick = cand
                    break
                if pick is None or pick == 'SOLO_WAIT':
                    break
                mp = mem_used_pct()
                if running and mp is not None and mp >= MEM_LIMIT:
                    log('memory %d%% >= %d%% - not starting %s until a running item finishes' % (mp, MEM_LIMIT, pick.id))
                    break
                if pick.kind == 'blender' and running:
                    # 等其他項目都結束再獨佔
                    log('blender item %s waits until the %d running item(s) finish' % (pick.id, len(running)))
                    break
                pick.rsha = self.resolve(pick.sha)
                log('memory %s%% before starting %s (%d running)' % (mp if mp is not None else '?', pick.id, len(running)))
                used = set(r[1].slot for r in running.values())
                pick.slot = min(i for i in range(self.a.parallel + 1) if i not in used)
                if pick.kind not in KINDS:
                    log('unknown kind %s for %s - will be recorded as error' % (pick.kind, pick.id))
                attempted.add('%s@%s#%s' % (pick.id, pick.rsha, pick.rerun))
                ran_n += 1
                th = threading.Thread(target=worker, args=(pick,), daemon=True)
                pick.t_start = time.time()
                running[pick.id] = (th, pick)
                th.start()
                if pick.kind == 'blender' or is_solo(pick):
                    blender_running = True
            if not running:
                break
            try:
                fin = done_q.get(timeout=REFRESH_SEC)
            except queue.Empty:
                need_refresh = True          # 長項目跑很久時也每 REFRESH_SEC 秒重讀佇列（BB 11:32：新排的 V18R 要能馬上開始）
                continue
            running.pop(fin, None)
            need_refresh = True
            blender_wait_logged.clear()
            while True:                      # 同時結束的一起收
                try:
                    running.pop(done_q.get_nowait(), None)
                except queue.Empty:
                    break

        stop_status.set()
        _emit('\n')
        _emit('===== SUMMARY =====' + '\n')
        _emit('ran %d item(s), skipped %d already done' % (ran_n, skipped_n) + '\n')
        if ran_n == 0:
            _emit('Nothing new in the queue this round.' + '\n')
        for line in self.summary:
            _emit(line + '\n')
        _emit('Results: %s  (%s)' % (self.out_root, 'not pushed: --no-push' if self.a.no_push else 'pushed to origin/' + self.branch) + '\n')
        if self.restart_pending:
            _emit('run_queue.py was updated - exit %d so run_forever.ps1 restarts the new version now' % RESTART_EXIT + '\n')
            log('正在換新版，馬上會自己重新開始——請不要關 (restarting with the new version - please do not close)')
            return RESTART_EXIT
        log('目前沒有測試在跑，可以關；不關的話 5 分鐘後會自己再檢查有沒有新的測試 (no test running now - safe to close)')
        return 0


def parse_args(argv):
    ap = argparse.ArgumentParser(description='CC test queue runner (Python)')
    default_repo = os.path.join(os.environ.get('USERPROFILE', ''), 'Documents', 'Lawstudent') if IS_WIN else None
    ap.add_argument('--repo', default=default_repo)
    ap.add_argument('--work', default=None)
    ap.add_argument('--only', default='')
    ap.add_argument('--parallel', type=int, default=2)
    ap.add_argument('--once', action='store_true', help='run the queue once and exit (this is also the default)')
    ap.add_argument('--no-push', action='store_true')
    ap.add_argument('--queue', default=None)
    ap.add_argument('--branch-local', default='claude/cc-local')
    ap.add_argument('--headless', action='store_true', help='no browser windows (default: visible windows on Windows / when DISPLAY is set)')
    ap.add_argument('--autoretry', action='store_true', help='CC_AUTORETRY for every item: a failed item reruns once with Playwright trace (see README)')
    a = ap.parse_args(argv)
    if not a.repo:
        ap.error('--repo is required on this platform')
    if a.parallel < 1:
        a.parallel = 1
    return a


if __name__ == '__main__':
    _rc = Runner(parse_args(sys.argv[1:])).main()
    log_flush()
    sys.exit(_rc)
