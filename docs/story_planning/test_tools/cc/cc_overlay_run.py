"""CC-B（帳號 B）11-07：在「開發版本＋換掉幾個檔」上跑另一支探針／測試（LAWWW2-B 11:26：SLIM 要「同一個開發分支，只換 wenzhou_street.glb」）。
runner 只能照一個 SHA 開工作樹，所以這支自己做：
  ① 在 runner 給的工作樹（LW_TESTS/..，＝佇列那一行的 SHA）旁邊另外開一個暫存工作樹（git worktree add --detach，同一個 SHA）——不動 runner 的工作樹，別的項目不受影響
  ② OVERLAY_SHA 的 OVERLAY_FILES（逗號分隔）checkout 進暫存工作樹（本機沒有那個 commit 就先 git fetch origin <sha>）
  ③ 在暫存工作樹開 http.server（找空的 port），url 換成它
  ④ 用 runpy 在同一個程序裡跑 RUN（cc 探針資料夾裡的檔名，或 tests/…；PC 的 gpu_wrap 的 GPU 設定照樣生效），sys.argv＝[RUN, url(+URL_SUFFIX), out]（RUN_ARGS=url 時只給 url）
  ⑤ 收掉 server、移除暫存工作樹
用法（佇列）：probe 類，ENV：RUN=perf_cold_probe.py;OVERLAY_SHA=a898ff47e;OVERLAY_FILES=assets/models/env/second_ai/wenzhou_street.glb;（RUN 自己的 ENV 照寫）"""
import os, sys, subprocess, socket, time, runpy, tempfile, shutil, json

URL, OUT = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
WT = os.path.abspath(os.path.join(os.environ['LW_TESTS'], '..'))
RUN = os.environ['RUN']; OSHA = os.environ['OVERLAY_SHA']; FILES = [f for f in os.environ.get('OVERLAY_FILES', '').split(',') if f]
SUFFIX = os.environ.get('URL_SUFFIX', '')


def git(*a, cwd=WT, check=True):
    r = subprocess.run(['git'] + list(a), cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if check and r.returncode != 0: raise RuntimeError('git %s: %s' % (' '.join(a), r.stdout.strip()[-300:]))
    return r.stdout.strip()


def free_port():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p


head = git('rev-parse', 'HEAD')
tmp = tempfile.mkdtemp(prefix='cc_overlay_'); wt2 = os.path.join(tmp, 'wt')
print('[overlay] 受測版本 %s ＋ %s 的 %s；暫存工作樹 %s' % (head[:9], OSHA[:9], FILES, wt2), flush=True)
srv = None; rc = 0
try:
    git('worktree', 'add', '--detach', wt2, head)
    if git('cat-file', '-t', OSHA, check=False) != 'commit':
        print('[overlay] 本機沒有 %s，git fetch origin %s' % (OSHA, OSHA), flush=True)
        git('fetch', '-q', 'origin', OSHA, check=False)
        if git('cat-file', '-t', OSHA, check=False) != 'commit': git('fetch', '-q', 'origin', '+refs/heads/claude/*:refs/remotes/origin/claude/*')
    for f in FILES:
        git('checkout', OSHA, '--', f, cwd=wt2)
        a = git('rev-parse', '%s:%s' % (head, f), check=False); b = git('rev-parse', '%s:%s' % (OSHA, f))
        print('[overlay] 換檔 %s：%s → %s（%d bytes）' % (f, a[:9], b[:9], os.path.getsize(os.path.join(wt2, f))), flush=True)
    port = free_port()
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '--bind', '127.0.0.1', '--directory', wt2], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)
    page = URL.split('://', 1)[-1].split('/', 1)[-1] if '/' in URL.split('://', 1)[-1] else 'index.html'
    url2 = 'http://127.0.0.1:%d/%s%s' % (port, page, SUFFIX)
    os.environ['LW_TESTS'] = os.path.join(wt2, 'tests'); os.environ['SHA'] = head + '+' + OSHA[:9]
    script = RUN if os.path.isabs(RUN) else (os.path.join(wt2, RUN) if RUN.startswith('tests/') else os.path.join(HERE, RUN))
    argv = [script, url2] if os.environ.get('RUN_ARGS') == 'url' else [script, url2, OUT]
    print('[overlay] 跑 %s %s' % (os.path.relpath(script, HERE) if script.startswith(HERE) else RUN, ' '.join(argv[1:])), flush=True)
    json.dump({'head': head, 'overlay': OSHA, 'files': FILES, 'url': url2}, open(os.path.join(OUT, 'overlay.json'), 'w') if os.path.isdir(OUT) or os.makedirs(OUT, exist_ok=True) is None else None)
    sys.argv = argv; sys.path.insert(0, os.environ['LW_TESTS'])
    try: runpy.run_path(script, run_name='__main__')
    except SystemExit as e: rc = e.code if isinstance(e.code, int) else (0 if e.code is None else 1)
finally:
    if srv: srv.terminate()
    try: git('worktree', 'remove', '--force', wt2, check=False)
    except Exception: pass
    shutil.rmtree(tmp, ignore_errors=True)
sys.exit(rc)
