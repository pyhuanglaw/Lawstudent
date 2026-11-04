"""CC-C 11-04（BB-C 18:01：電腦停機，v9.10.20 剩下的功能測試改在雲端跑）：照 queue.txt 的格式，在雲端一支一支跑指定的項目。
  - 只跑命令列給的 ID（照給的順序）；SHA → worktree／port 由 --map 給（例：d3828=/path/wt_d382:8792,e9b3b=/path/wt_e9b3:8798）。
  - kind game：cd <worktree>；python3 <script> <XARGS（{url}、{url2}、{out} 換掉）>；kind probe：python3 <cc-testing 的探針> <url> <out>，env 加 LW_TESTS=<worktree>/tests。
  - 每一項開跑前等別的瀏覽器測試停下來（同 v20r_cloud_backup.sh），開跑、結束記負載；log 在 <out>/<ID>/run.log，總表 <out>/summary.txt。
  - 雲端是 SwiftShader 無頭：功能測試算數，GPU 才量得準的（fps、顏色）不採信。
用法：python3 tools/cc_local/cloud_chain.py --out <dir> --map <sha=wt:port,...> ID1 ID2 ...  [--queue tools/cc_local/queue.txt] [--tmult 3]"""
import argparse, os, re, subprocess, sys, time
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
ap = argparse.ArgumentParser(); ap.add_argument('--out', required=True); ap.add_argument('--map', required=True); ap.add_argument('--queue', default=os.path.join(HERE, 'queue.txt'))
ap.add_argument('--tmult', type=float, default=3.0, help='雲端比電腦慢：逾時＝佇列的分鐘×這個倍數'); ap.add_argument('ids', nargs='+'); a = ap.parse_args()
M = {}
for kv in a.map.split(','):
    k, v = kv.split('='); wt, port = v.rsplit(':', 1); M[k] = (wt, int(port))
Q = {}
for line in open(a.queue, encoding='utf-8'):
    if line.startswith('#') or '|' not in line: continue
    p = [x.strip() for x in line.split('|')]
    if len(p) >= 6: Q[p[0]] = p
os.makedirs(a.out, exist_ok=True)
SUM = os.path.join(a.out, 'summary.txt')
OTHERS = re.compile(r'cc_sitamb_probe|random_play_sim|cc_ptboya_probe|cc_dorm_loft_probe|cc_examlib_play|tests/(reachability_all|zone_transitions|p0_movement|save_compat_v7|touch_flow_wenzhou|flow_)')


def others():
    try:
        out = subprocess.run(['ps', '-eo', 'pid,args'], stdout=subprocess.PIPE, text=True).stdout
    except Exception: return []
    me = str(os.getpid()); return [l.strip()[:80] for l in out.splitlines()[1:] if OTHERS.search(l) and 'cloud_chain' not in l and not l.strip().startswith(me + ' ')]


def load(): return open('/proc/loadavg').read().split()[:3]


def log(s):
    print(s, flush=True)
    with open(SUM, 'a', encoding='utf-8') as fh: fh.write(s + '\n')


for iid in a.ids:
    if iid not in Q: log('=== %s：佇列裡沒有這一項（略過）' % iid); continue
    _id, sha, kind, script, url, tmin = Q[iid][:6]; envs = Q[iid][6] if len(Q[iid]) > 6 else ''
    key = next((k for k in M if sha.startswith(k)), None)
    if not key: log('=== %s：SHA %s 沒有對應的 worktree（--map）（略過）' % (iid, sha)); continue
    wt, port = M[key]; U = 'http://127.0.0.1:%d/%s' % (port, url)
    env = dict(os.environ); xargs = None
    for kv in [x for x in envs.split(';') if '=' in x]:
        k, v = kv.split('=', 1); k = k.strip()
        if k == 'XARGS': xargs = v.strip()
        elif k == 'SHA2': pass
        else: env[k] = v
    env['SHA'] = sha[:9]; env['LW_TESTS'] = os.path.join(wt, 'tests')
    od = os.path.join(a.out, iid); os.makedirs(od, exist_ok=True)
    if kind == 'game':
        args = (xargs or '{url}').replace('{url}', U).replace('{out}', od).split()
        cmd = [sys.executable, os.path.join(wt, script)] + args; cwd = wt
    else:
        cmd = [sys.executable, os.path.join(REPO, script), U, od]; cwd = REPO
    w = 0
    while others() and w < 1800: time.sleep(20); w += 20
    t0 = time.time(); log('=== %s start %s waited %ds load=%s others=%s' % (iid, time.strftime('%H:%M:%S', time.gmtime()), w, load(), others()[:2]))
    lim = int(float(tmin) * 60 * a.tmult)
    with open(os.path.join(od, 'run.log'), 'w', encoding='utf-8') as fo:
        try:
            p = subprocess.run(cmd, cwd=cwd, env=env, stdout=fo, stderr=subprocess.STDOUT, timeout=lim); rc = p.returncode
        except subprocess.TimeoutExpired:
            rc = 'timeout %d s' % lim
    last = ''
    try:
        L = [l.strip() for l in open(os.path.join(od, 'run.log'), encoding='utf-8', errors='replace') if re.match(r'^(ALL PASS|FAILED|RESULT|PASS \d|FAIL)', l.strip())]
        last = L[-1][:180] if L else ''
    except Exception: pass
    log('=== %s end %s exit=%s %ds load=%s last: %s' % (iid, time.strftime('%H:%M:%S', time.gmtime()), rc, int(time.time() - t0), load(), last))
log('=== ALL DONE %s' % time.strftime('%H:%M:%S', time.gmtime()))
