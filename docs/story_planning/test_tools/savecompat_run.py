"""BB-B 10-25（RELEASE-91010-TEST）：只跑 release_suite.sh 的兩項舊存檔相容（save_compat_v7.py：v7 的存檔、正式版 v9.10.9 的存檔 → 候選讀得回來）。
runner.sh 線：savecompat savecompat_run.py <v7 port>,<正式版 port>（工作樹＝runner 的 base，乾淨 checkout）。"""
import os, sys, subprocess
URL = sys.argv[1].split('?')[0]; OUT = sys.argv[2]; W = os.path.dirname(os.environ['LW_TESTS'].rstrip('/'))
p7, pl = (os.environ.get('SCEN', '8812,8827') + ',').split(',')[:2]
sha = subprocess.run(['git', '-C', W, 'rev-parse', 'HEAD'], capture_output=True, text=True).stdout.strip()
dirty = subprocess.run(['git', '-C', W, 'status', '--porcelain'], capture_output=True, text=True).stdout.strip()
print('工作樹 %s @ %s；改過的檔案：%s' % (W, sha, dirty or '（沒有）'), flush=True)
os.makedirs(OUT, exist_ok=True); bad = 0
for name, port in [('save_compat_v7', p7), ('save_compat_live', pl)]:
    r = subprocess.run([sys.executable, 'tests/save_compat_v7.py', 'http://127.0.0.1:%s/index.html' % port, URL], cwd=W, capture_output=True, text=True, timeout=3600)
    out = (r.stdout or '') + (r.stderr or ''); open(os.path.join(OUT, name + '.log'), 'w', encoding='utf8').write(out)
    tail = [l for l in out.splitlines() if l.strip()][-3:]
    print('%s %s rc=%d｜%s' % ('PASS' if r.returncode == 0 else 'FAIL', name, r.returncode, ' / '.join(tail)[:300]), flush=True); bad += r.returncode != 0
sys.exit(1 if bad else 0)
