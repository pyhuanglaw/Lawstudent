"""GHA-BROWSER（BB_257 T7，CC-C 11-05）：在 GitHub Actions 的機器上跑一項（matrix 的一格）。
  照 PC 佇列的 KIND（同 tools/cc_local/cloud_chain.py）：
    game  ＝cd <遊戲 worktree>；python3 <SCRIPT> <XARGS（{url}、{out} 換掉；沒寫＝{url}）>
    probe ＝python3 <cc-testing>/<SCRIPT> <url> <out>/out；env LW_TESTS=<worktree>/tests、SHA
    node  ＝cd <遊戲 worktree>；node <SCRIPT> <XARGS>（SCRIPT 在 cc-testing 有就用 cc-testing 的；env LW_ROOT=<worktree>、CC_REPO=<cc-testing>）
  遊戲用 python3 -m http.server 在 <worktree> 開（port 8800）；逾時＝TIMEOUT_MIN×TMULT（預設 3：和雲端一樣是 SwiftShader）。
  結果寫到 <out>：run.log、meta.json（ID、SHA、指令、exit、秒數、最後一行、標記「GitHub Actions（ubuntu、SwiftShader、無 GPU）」、run 網址）、
    out/ 底下的 json／txt／log 原樣，png 轉成 jpg（品質 70、寬度最多 1280）。
用法：python3 run_item.py --item '<matrix 的 json>' --cc <cc-testing> --wt <worktree> --out <dir>"""
import argparse, json, os, re, shlex, socket, subprocess, sys, time

ap = argparse.ArgumentParser(); ap.add_argument('--item', required=True); ap.add_argument('--cc', required=True); ap.add_argument('--wt', required=True); ap.add_argument('--out', required=True)
ap.add_argument('--tmult', type=float, default=float(os.environ.get('TMULT') or 3)); a = ap.parse_args()
it = json.loads(a.item); CC = os.path.abspath(a.cc); WT = os.path.abspath(a.wt); OUT = os.path.abspath(a.out); os.makedirs(OUT, exist_ok=True)
LABEL = 'GitHub Actions（ubuntu、SwiftShader、無 GPU）'
env = dict(os.environ); env.update({'PYTHONUTF8': '1', 'PYTHONIOENCODING': 'utf-8', 'CC_HEADLESS': '1', 'CC_GHA': '1'})
for kv in [x for x in (it.get('env') or '').split(';') if '=' in x]:
    k, v = kv.split('=', 1); env[k.strip()] = v
PORT = 8800
srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT), '--bind', '127.0.0.1'], cwd=WT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
for _ in range(60):
    try:
        with socket.create_connection(('127.0.0.1', PORT), timeout=1): break
    except OSError: time.sleep(0.5)
url = 'http://127.0.0.1:%d/%s' % (PORT, it.get('url') or 'index.html')
xargs = env.pop('XARGS', '{url}')
sub = lambda s: s.replace('{url}', url).replace('{out}', OUT)
kind = it['kind']
if kind == 'game':
    cmd = [sys.executable, it['script']] + [sub(x) for x in shlex.split(xargs)]; cwd = WT
elif kind == 'probe':
    os.makedirs(os.path.join(OUT, 'out'), exist_ok=True)
    env['LW_TESTS'] = os.path.join(WT, 'tests'); env['SHA'] = it['sha']
    cmd = [sys.executable, os.path.join(CC, it['script']), url, os.path.join(OUT, 'out')]; cwd = CC
elif kind == 'node':
    sp = os.path.join(CC, it['script']) if os.path.exists(os.path.join(CC, it['script'])) else os.path.join(WT, it['script'])
    env['LW_ROOT'] = WT; env['CC_REPO'] = CC; env['SHA'] = it['sha']
    cmd = ['node', sp] + [sub(x) for x in shlex.split(xargs)] if xargs != '{url}' else ['node', sp]; cwd = WT
else:
    sys.exit('unknown kind %r' % kind)
lim = int(it.get('tmin') or 30) * 60 * a.tmult
t0 = time.time(); to = False
with open(os.path.join(OUT, 'run.log'), 'wb') as fo:
    p = subprocess.Popen(cmd, cwd=cwd, env=env, stdout=fo, stderr=subprocess.STDOUT)
    try: p.wait(lim)
    except subprocess.TimeoutExpired:
        to = True; p.kill(); p.wait()
secs = round(time.time() - t0)
srv.terminate()
txt = open(os.path.join(OUT, 'run.log'), encoding='utf-8', errors='replace').read().splitlines()
last = next((l for l in reversed(txt) if re.match(r'^(ALL PASS|FAILED|RESULT|PASS [0-9]|FAIL)', l)), (txt[-1] if txt else ''))
# 截圖壓成 jpg（git 裡不放大 png）
try:
    from PIL import Image
    for dp, dn, fn in os.walk(OUT):
        for f in fn:
            if f.lower().endswith('.png'):
                pth = os.path.join(dp, f)
                try:
                    im = Image.open(pth).convert('RGB')
                    if im.width > 1280: im = im.resize((1280, round(im.height * 1280 / im.width)))
                    im.save(pth[:-4] + '.jpg', quality=70); os.remove(pth)
                except Exception: pass
except ImportError:
    pass
meta = {'id': it['id'], 'sha': it['sha'], 'kind': kind, 'script': it['script'], 'env': it.get('env'), 'line_hash': it.get('line_hash'), 'cmd': ' '.join(cmd),
        'exit': p.returncode, 'timeout': to, 'seconds': secs, 'result': ('TIMEOUT ' if to else '') + last[:300], 'where': LABEL,
        'run': '%s/%s/actions/runs/%s' % (os.environ.get('GITHUB_SERVER_URL', ''), os.environ.get('GITHUB_REPOSITORY', ''), os.environ.get('GITHUB_RUN_ID', '')),
        'finished': time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime()) + 'Z'}
json.dump(meta, open(os.path.join(OUT, 'meta.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('%s：exit %s%s、%d 秒；%s（%s）' % (it['id'], p.returncode, '（逾時）' if to else '', secs, last[:200], LABEL))
sys.exit(0)   # 結果寫在 meta.json；job 本身不算失敗（collect 要照常推）
