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
import argparse, glob, hashlib, json, os, platform, queue, re, shutil, socket, subprocess, sys, threading, time
from collections import OrderedDict, deque
from datetime import datetime

DEV_BRANCH = 'claude/confident-ritchie-8rwh7t'
CC_BRANCH = 'claude/cc-testing'
LAWWW2_BRANCH = 'claude/second-ai-env-art'
IS_WIN = os.name == 'nt'
PNG_CAP = 25 * 1024 * 1024
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


RESTART_EXIT = 75     # BB 2026-11-02 20:08：runner 自己有新版 → 跑完手上的項目、push 完，用 75 結束；run_forever.ps1 收到 75 立刻重跑新版
SELF_FILE = os.path.abspath(__file__)


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


def log(msg):
    with _print_lock:
        print('[%s] %s' % (datetime.now().strftime('%H:%M:%S'), msg), flush=True)


def gray(msg):
    with _print_lock:
        for line in msg.rstrip().splitlines():
            print('    ' + line, flush=True)


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
            print('git not found'); sys.exit(1)
        if not os.path.exists(os.path.join(self.repo, '.git')):
            print('Repo not found: %s' % self.repo); sys.exit(1)
        _, em = git('-C', self.repo, 'config', 'user.email', capture=True)
        _, nm = git('-C', self.repo, 'config', 'user.name', capture=True)
        if not em.strip() or not nm.strip():
            print('git user.name / user.email is not set, so results cannot be committed. Set them once, then rerun:')
            print('  git config --global user.name "Your Name"')
            print('  git config --global user.email "you@example.com"')
            sys.exit(1)
        log('git fetch')
        git('-C', self.repo, 'fetch', 'origin', CC_BRANCH, DEV_BRANCH)
        self.fetch_lawww2(quiet=False)
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
            print('git checkout/merge failed in %s - fix it and rerun' % self.work); sys.exit(1)
        self.update_heads()
        log('dev head = %s   lawww2 head = %s' % (self.head, self.lawww2 or '(not fetched)'))
        os.makedirs(self.out_root, exist_ok=True)

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
            self.update_heads()

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
            rc, out = git('-C', self.repo, 'worktree', 'add', '--detach', path, sha, quiet=True)
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
            return [self.py, wrap, os.path.join(wt, it.script)] + (xa or [url]), wt
        if k in ('probe', 'webkit'):
            env['LW_TESTS'] = os.path.join(wt, 'tests')
            env['SHA'] = it.rsha
            if k == 'webkit':
                env['CC_BROWSER'] = 'webkit'
            return [self.py, wrap, os.path.join(self.work, it.script), url, out], self.work
        if k == 'node':
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
            if blender_is_python(self.blender):
                return [self.blender, script, '--'] + xa, wt
            return [self.blender, '-b', '--python-exit-code', '1', '--python', script, '--'] + xa, wt
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
            cmd, cwd = self.build_cmd(it, wt, od, url, url2, env)
            with open(os.path.join(od, 'run.log'), 'wb') as fo, open(os.path.join(od, 'err.log'), 'wb') as fe:
                p = subprocess.Popen(cmd, cwd=cwd, env=env, stdout=fo, stderr=fe, stdin=subprocess.DEVNULL, **popen_flags())
                try:
                    p.wait(it.tmin * 60)
                except subprocess.TimeoutExpired:
                    kill_tree(p)
                    meta['error'] = 'timeout %d min' % it.tmin
            meta['exit'] = p.returncode
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
        meta['end'] = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
        meta['seconds'] = int(round(time.time() - t0))
        with open(os.path.join(od, 'meta.json'), 'w', encoding='utf-8') as fh:
            json.dump(meta, fh, ensure_ascii=False, indent=2)
        lines = self.summary_lines(it, meta, od)
        self.commit(it, meta, od, lines)
        log('==== END   %s  exit=%s  %ss  %s ====' % (it.id, meta['exit'], meta['seconds'], meta['error'] or ''))
        return meta

    @staticmethod
    def tail(path, n):
        if not os.path.exists(path):
            return []
        with open(path, encoding='utf-8', errors='replace') as fh:
            return [x.rstrip('\r\n') for x in fh.readlines()[-n:]]

    def summary_lines(self, it, meta, od):
        tail = ' / '.join(self.tail(os.path.join(od, 'run.log'), 3))
        lines = ['%s  sha=%s  exit=%s  %ss  %s  %s' % (it.id, meta['sha'], '' if meta['exit'] is None else meta['exit'],
                                                      meta['seconds'], meta['error'] or '', tail)]
        el = os.path.join(od, 'err.log')
        if os.path.exists(el) and os.path.getsize(el) > 0:
            lines.append('    err.log (last 5): ' + ' | '.join(self.tail(el, 5)))
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
            add = [f for f in files if not f.lower().endswith('.png')]
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
            # 先把索引清空（不動檔案）：舊 runner 中斷時可能留下已 git add 但沒 commit 的檔（BB 20:21：R8_y4s2rt／02_mk12），不能被這一筆帶進去
            git('-C', self.work, 'reset', '-q', quiet=True)
            for i in range(0, len(add), 50):
                git('-C', self.work, 'add', '--', *add[i:i + 50], quiet=True)
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
            if self.a.no_push:
                return
            for w in (0, 2, 4, 8, 16):
                if w:
                    time.sleep(w)
                rc, _ = git('-C', self.work, 'push', '-u', 'origin', self.branch)
                if rc == 0:
                    return
            log('push failed for %s (results stay in %s, rerun later)' % (it.id, self.work))

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

    def start_commit(self):
        """啟動時推一次 console.log（設定那幾行、run_forever 第幾輪、runner 雜湊）"""
        with GIT_LOCK:
            cf = self.write_console()
            if not cf:
                return
            git('-C', self.work, 'reset', '-q', quiet=True)
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
        log('run_forever round: %s   runner sha256: %s' % (os.environ.get('CC_RF_ROUND') or '- (not started by run_forever)', self.self_hash[:10]))
        self.banner()
        self.setup()
        self.start_commit()
        items = self.read_queue()
        log('queue: ' + ', '.join(it.id for it in items))
        attempted = set()
        running = {}            # id -> (thread, item)
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

        while True:
            if need_refresh:
                self.refresh()
                items = self.read_queue()
                need_refresh = False
                if not self.restart_pending and file_hash(SELF_FILE) != self.self_hash:
                    self.restart_pending = True
                    log('run_queue.py has a new version - finishing the %d running item(s), then restarting (exit %d)' % (len(running), RESTART_EXIT))
            if self.restart_pending:
                if not running:
                    break
                fin = done_q.get()
                running.pop(fin, None)
                continue
            blender_running = any(r[1].kind == 'blender' for r in running.values())
            while len(running) < self.a.parallel and not blender_running:
                pick = None
                for cand in items:
                    if cand.id in running:
                        continue
                    cs = self.resolve(cand.sha)
                    key = '%s@%s#%s' % (cand.id, cs, cand.rerun)   # 鍵含 RERUN 記號（舊版漏了 RERUN）
                    if key in attempted:
                        continue
                    if self.is_done(cand, cs):
                        attempted.add(key)
                        skipped_n += 1
                        log('skip %s (already done on %s)' % (cand.id, cs))
                        continue
                    pick = cand
                    break
                if pick is None:
                    break
                if pick.kind == 'blender' and running:
                    # 等其他項目都結束再獨佔
                    log('blender item %s waits until the %d running item(s) finish' % (pick.id, len(running)))
                    break
                pick.rsha = self.resolve(pick.sha)
                used = set(r[1].slot for r in running.values())
                pick.slot = min(i for i in range(self.a.parallel + 1) if i not in used)
                if pick.kind not in KINDS:
                    log('unknown kind %s for %s - will be recorded as error' % (pick.kind, pick.id))
                attempted.add('%s@%s#%s' % (pick.id, pick.rsha, pick.rerun))
                ran_n += 1
                th = threading.Thread(target=worker, args=(pick,), daemon=True)
                running[pick.id] = (th, pick)
                th.start()
                if pick.kind == 'blender':
                    blender_running = True
            if not running:
                break
            fin = done_q.get()
            running.pop(fin, None)
            need_refresh = True
            while True:                      # 同時結束的一起收
                try:
                    running.pop(done_q.get_nowait(), None)
                except queue.Empty:
                    break

        print('')
        print('===== SUMMARY =====')
        print('ran %d item(s), skipped %d already done' % (ran_n, skipped_n))
        if ran_n == 0:
            print('Nothing new in the queue this round.')
        for line in self.summary:
            print(line)
        print('Results: %s  (%s)' % (self.out_root, 'not pushed: --no-push' if self.a.no_push else 'pushed to origin/' + self.branch))
        if self.restart_pending:
            print('run_queue.py was updated - exit %d so run_forever.ps1 restarts the new version now' % RESTART_EXIT)
            return RESTART_EXIT
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
    a = ap.parse_args(argv)
    if not a.repo:
        ap.error('--repo is required on this platform')
    if a.parallel < 1:
        a.parallel = 1
    return a


if __name__ == '__main__':
    sys.exit(Runner(parse_args(sys.argv[1:])).main())
