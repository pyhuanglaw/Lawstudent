"""BB-B 10-25（RELEASE-91010-TEST，LAWWW-B 06:3x）：美國社區出口 (−39,0) 往西、往東的 fps，兩個版本各自用自己的程式＋自己的 us_community.glb 量。
包一層 LAWWW2 的 tools/blender/env_second/shots/perf_us_community_west.py（每個版本、每個畫面大小各開一次瀏覽器；往西、往東各量 5 次、每次 5 秒）。
SCEN＝<名稱>=<port>:<工作樹資料夾名>,...（工作樹在 scratchpad 底下）；畫面大小橫向 844x390、直向 390x844。
SwiftShader 只能比相對值，不是手機實機。同一台機器上同時只跑這一個瀏覽器工作。
用法（runner.sh 線）：perf_us perf_us_run.py old=8827:live_f10d270,new=8832:lw33"""
import os, sys, subprocess
OUT = sys.argv[2]
SP = '/tmp/claude-0/-home-user-Lawstudent/773c49b9-ad25-576f-b588-101fb9f8321d/scratchpad'
items = [x.split('=', 1) for x in os.environ.get('SCEN', '').split(',') if '=' in x]
script = None
for name, rest in items:   # 用最新那一份工作樹的量測腳本（兩個版本同一支腳本）
    cand = os.path.join(SP, rest.split(':', 1)[1], 'tools/blender/env_second/shots/perf_us_community_west.py')
    if os.path.exists(cand): script = cand
if not script: print('FAIL 找不到 perf_us_community_west.py'); sys.exit(1)
print('量測腳本：', script, flush=True)
bad = 0
for wh in ['844x390', '390x844']:
    for name, rest in items:
        port, wt = rest.split(':', 1)
        glb = os.path.join(SP, wt, 'assets/models/env/second_ai/us_community.glb')
        out = os.path.join(OUT, '%s_%s' % (name, wh)); os.makedirs(out, exist_ok=True)
        sha = subprocess.run(['git', '-C', os.path.join(SP, wt), 'rev-parse', '--short=9', 'HEAD'], capture_output=True, text=True).stdout.strip()
        print('== %s（%s %s）%s' % (name, wt, sha, wh), flush=True)
        r = subprocess.run([sys.executable, script, 'http://127.0.0.1:%s/index.html' % port, out, wh, '%s=%s' % (name, glb)], capture_output=True, text=True, timeout=1800)
        print(r.stdout.strip(), flush=True)
        if r.returncode != 0: bad += 1; print('FAIL rc=%d %s' % (r.returncode, r.stderr.strip()[-400:]), flush=True)
print('PASS 量完' if not bad else 'FAIL %d 次沒量完' % bad)
