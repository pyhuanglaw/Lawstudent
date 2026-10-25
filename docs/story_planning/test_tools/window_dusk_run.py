"""BB-B 10-25（ART-HALL-WINDOW-DUSK-1025）：window_dusk_bb.py 兩個版本各跑一次（各自的程式），再對照。
用法（runner.sh 線）：wdusk window_dusk_run.py old=8836:lw37,new=8837:lw38
輸出：<OUT>/<名稱>/readings.json、截圖；<OUT>/compare.md（每個場景、季節、時刻：舊／新窗的亮度、新版夜景比例、屋外亮度；換夜景 19.19→19.21 的跳動）"""
import os, sys, json, subprocess
OUT = sys.argv[2]; HERE = os.path.dirname(os.path.abspath(__file__))
SP = '/tmp/claude-0/-home-user-Lawstudent/773c49b9-ad25-576f-b588-101fb9f8321d/scratchpad'
items = [x.split('=', 1) for x in os.environ.get('SCEN', '').split(';')[0].split(',') if '=' in x]
OPT = dict(x.split('=', 1) for x in (os.environ.get('SCEN', '').split(';') + [''])[1].split(',') if '=' in x)   # SCEN 第二段（; 後面）：seasons=summer,where=out（季節、內外用 + 分隔）
XENV = dict(os.environ, WD_SEASONS=OPT.get('seasons', '').replace('+', ','), WD_WHERE=OPT.get('where', '').replace('+', ','))
bad = 0; R = {}
for name, rest in items:
    port, wt = rest.split(':', 1); out = os.path.join(OUT, name); os.makedirs(out, exist_ok=True)
    sha = subprocess.run(['git', '-C', os.path.join(SP, wt), 'rev-parse', '--short=9', 'HEAD'], capture_output=True, text=True).stdout.strip()
    print('== %s（%s %s）' % (name, wt, sha), flush=True)
    r = subprocess.run([sys.executable, os.path.join(HERE, 'window_dusk_bb.py'), 'http://127.0.0.1:%s/index.html' % port, out], capture_output=True, text=True, timeout=5400, env=XENV)
    print(r.stdout.strip()[-6000:], flush=True)
    if r.returncode != 0 or 'PASS 量完' not in r.stdout: bad += 1; print('FAIL rc=%d %s' % (r.returncode, r.stderr.strip()[-600:]), flush=True)
    p = os.path.join(out, 'readings.json'); R[name] = json.load(open(p)) if os.path.exists(p) else []
names = [n for n, _ in items]
def get(n, season, scene, where, tag):
    return next((x for x in R[n] if (x['season'], x['scene'], x['where'], x['tag']) == (season, scene, where, tag)), None)
f3 = lambda v: '—' if v is None else '%.3f' % v
L = []
for season in ['winter', 'summer']:
    for scene in ['linze', 'wancai', 'library']:
        tags = [x['tag'] for x in R[names[-1]] if x['season'] == season and x['scene'] == scene and x['where'] == 'in']
        if not tags: continue
        L += ['', '### %s %s' % ({'winter': '冬天 2025-12-10', 'summer': '夏天 2026-06-20'}[season], scene), '',
              '| 取樣 | 時鐘 | 光線 | 屋外 Y | ' + ' | '.join('%s 窗 Y（tint／夜景比例）' % n for n in names) + ' |', '|---|---|---|---|' + '---|' * len(names)]
        for tag in tags:
            rows = [get(n, season, scene, 'in', tag) for n in names]; o = get(names[-1], season, scene, 'out', tag)
            r0 = next(x for x in rows if x)
            hm = '%d:%02d' % (int(r0['clock']), round(r0['clock'] % 1 * 60) % 60)
            cells = ['%s（%s）' % (f3(x['Y']), ','.join('%s/%s' % (json.loads(k)['tint'], json.loads(k)['xf']) for k in x['kinds'])) if x else '沒量到' for x in rows]
            L.append('| %s | %s | %.2f | %s | %s |' % (tag, hm, r0['lightH'], f3(o['Y']) if o else '', ' | '.join(cells)))
        for n in names:   # 換夜景那一刻：19.19 → 19.21 的變化，和 19.15 → 19.19、19.21 → 19.25 比
            a, b, c, d = [get(n, season, scene, 'in', t) for t in ('L19.15', 'L19.19', 'L19.21', 'L19.25')]
            if all(x and x['Y'] is not None for x in (a, b, c, d)):
                L.append('- %s：19.15→19.19 %+.4f、**19.19→19.21 %+.4f**、19.21→19.25 %+.4f' % (n, b['Y'] - a['Y'], c['Y'] - b['Y'], d['Y'] - c['Y']))
open(os.path.join(OUT, 'compare.md'), 'w').write('\n'.join(L) + '\n'); print('\n'.join(L), flush=True)
print('PASS 量完' if not bad else 'FAIL %d 個版本沒量完' % bad)
