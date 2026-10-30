"""BB-B 10-24：讓 runner.sh 單獨重跑工作樹的一支測試（release_suite 裡 FAIL 的那支，安靜時再跑一次分清楚遊戲／腳本）。
佇列第三欄 SCEN＝測試名（工作樹 tests/<名>.py）或 test_tools 裡的腳本（tt:<檔名>）；URL 去掉 ?turbo 照 release_suite 的方式傳；第二個參數給截圖路徑。"""
import os, sys, subprocess
URL = sys.argv[1].split('?')[0]; OUT = sys.argv[2]; W = os.path.dirname(os.environ['LW_TESTS'].rstrip('/'))
name = os.environ.get('SCEN', '')
if '@' in name:   # 「<測試>@<scratchpad 裡的工作樹>:<port>」＝換一個工作樹（例如 main 的修改前對照）
    name, wp = name.split('@'); wt, port = wp.split(':')
    W = os.path.join(os.path.dirname(os.path.dirname(OUT.rstrip('/'))), wt); URL = 'http://127.0.0.1:%s/index.html' % port
path = name if name.startswith('/') else (os.path.join(os.path.dirname(os.path.abspath(__file__)), name[3:]) if name.startswith('tt:') else os.path.join(W, 'tests', name + '.py'))   # 「/絕對路徑」＝別的 commit 的測試檔（例如 LAWWW-B 改過的新版）
sha = subprocess.run(['git', '-C', W, 'rev-parse', '--short=9', 'HEAD'], capture_output=True, text=True).stdout.strip()
if name.startswith('zr:'):   # 「zr:<情境,情境>」＝用 zrlast_probe 跑這些情境（配 @工作樹:port 就能在別的工作樹跑，不用另開一條 runner）
    print('工作樹 %s @ %s；zrlast_probe SCEN=%s；%s' % (W, sha, name[3:], URL), flush=True); os.makedirs(OUT, exist_ok=True)
    r = subprocess.run(['python3', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'zrlast_probe.py'), URL + '?turbo', OUT, sys.argv[3] if len(sys.argv) > 3 else ''],
                       cwd='/tmp', env=dict(os.environ, LW_TESTS=os.path.join(W, 'tests'), SCEN=name[3:], SHA=sha))
    sys.exit(r.returncode)
print('工作樹 %s @ %s；跑 %s' % (W, sha, path), flush=True)
os.makedirs(OUT, exist_ok=True)
r = subprocess.run(['python3', path, URL, os.path.join(OUT, 'shot.png') if name.startswith('tt:') else OUT], cwd=W)   # 診斷腳本第二個參數＝截圖檔；正式測試＝輸出資料夾
sys.exit(r.returncode)
