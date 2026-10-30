"""BB-B 10-25（RELEASE-91010-TEST 第二輪，LAWWW-B 11:0x）：經濟系路線 fps（PERF-PATROL-ECON-1025 ①②③⑤⑥），兩個版本各自用自己的程式量，同一份地點清單、同一支量測腳本。
包一層 LAWWW2 的 tools/blender/env_second/shots/perf_route.py（每個版本開一次瀏覽器；每個方向量 4 次、每次 5 秒；HUD 藏起來、劇情事件關掉、路人照時段）。
地點清單：perf_route_econ_list.json（博雅大廳白天／晚上往北往南、博雅 101 階梯教室、普通、校門、椰林大道、公館店面；經濟系那一年 day -351）。
博雅二樓：perf_route 只放 x、z，不放樓層，這一支量不到（另外用遊戲截圖看）。
SCEN＝<名稱>=<port>:<工作樹資料夾名>,...（工作樹在 scratchpad 底下）；畫面 844x390（橫向）。SwiftShader 只能比相對值，不是手機實機。同一台機器上同時只跑這一個瀏覽器工作。
用法（runner.sh 線）：perf_econ perf_route_run.py old=8832:lw33,new=8833:lw35［,list=perf_route_singleside_list.json］"""
import os, sys, json, subprocess
OUT = sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
SP = '/tmp/claude-0/-home-user-Lawstudent/773c49b9-ad25-576f-b588-101fb9f8321d/scratchpad'
items = [x.split('=', 1) for x in os.environ.get('SCEN', '').split(',') if '=' in x]
LIST = os.path.join(HERE, dict(items).get('list', 'perf_route_econ_list.json'))   # BB-B 15:5x：SCEN 裡寫 list=<檔名> 換地點清單（預設經濟系那一份）
items = [x for x in items if x[0] != 'list']
script = None
for name, rest in items:   # 用最新那一份工作樹的量測腳本（兩個版本同一支腳本）
    cand = os.path.join(SP, rest.split(':', 1)[1], 'tools/blender/env_second/shots/perf_route.py')
    if os.path.exists(cand): script = cand
if not script: print('FAIL 找不到 perf_route.py'); sys.exit(1)
print('量測腳本：', script, '；地點清單：', LIST, flush=True)
bad = 0; R = {}
for name, rest in items:
    port, wt = rest.split(':', 1)
    out = os.path.join(OUT, name); os.makedirs(out, exist_ok=True)
    sha = subprocess.run(['git', '-C', os.path.join(SP, wt), 'rev-parse', '--short=9', 'HEAD'], capture_output=True, text=True).stdout.strip()
    print('== %s（%s %s）844x390' % (name, wt, sha), flush=True)
    r = subprocess.run([sys.executable, script, 'http://127.0.0.1:%s/index.html' % port, LIST, out, '844x390', '--samples=4'], capture_output=True, text=True, timeout=5400)
    print(r.stdout.strip(), flush=True)
    if r.returncode != 0: bad += 1; print('FAIL rc=%d %s' % (r.returncode, r.stderr.strip()[-400:]), flush=True)
    p = os.path.join(out, 'perf_route.json')
    R[name] = {(x['name'], x['view']): x for x in json.load(open(p))} if os.path.exists(p) else {}
# 對照表：每個地點、每個方向，平均 fps、三角形、draw call
names = [n for n, _ in items]
keys = sorted({k for n in names for k in R[n]}, key=lambda k: (json.load(open(LIST)).index(next(p for p in json.load(open(LIST)) if p['name'] == k[0])), k[1]))
lines = ['| 地點 | 方向 | ' + ' | '.join('%s fps（三角形／draw call）' % n for n in names) + (' | 變化 |' if len(names) == 2 else ' |'), '|' + '---|' * (len(names) + 2 + (1 if len(names) == 2 else 0))]
for k in keys:
    cells = []
    for n in names:
        x = R[n].get(k); cells.append('%.2f（%s／%s）' % (x['avg'], format(x['tris'], ','), x['calls']) if x else '沒量到')
    ch = ''
    if len(names) == 2 and all(R[n].get(k) for n in names):
        a, b = R[names[0]][k]['avg'], R[names[1]][k]['avg']; ch = ' %+.0f%% |' % ((b - a) / a * 100 if a else 0)
    elif len(names) == 2: ch = ' — |'
    lines.append('| %s | %d | %s |%s' % (k[0], k[1], ' | '.join(cells), ch))
open(os.path.join(OUT, 'compare.md'), 'w').write('\n'.join(lines) + '\n')
print('\n'.join(lines), flush=True)
miss = [k for k in keys if not all(R[n].get(k) for n in names)]
if miss: print('FAIL 有地點沒量到：%s' % miss)
print('PASS 量完' if not bad and not miss else 'FAIL %d 次沒量完' % bad)
