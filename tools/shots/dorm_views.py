"""男生宿舍（宿舍走廊，D44）的「窗外的景」：在遊戲裡的校園拍實際畫面，存成 assets/models/env/dorm_view_<景>_<day|night>.webp（1024×512）。
src/dorm3d.js 的 viewOf() 讀這些檔案（載不到就用程序化畫的）：
  road：從宿舍門口往北拍（門廳的玻璃門、交誼廳的窗：門口的路、對面的系館與樹）
  side：從宿舍東端往東拍（走廊兩端的窗、樓梯平台的窗）
白天 11:00、晚上 20:30；藏起路人與玩家。拍的是遊戲畫面（Playwright＋SwiftShader），不是照片。
用法（先開 http server）：python3 tools/shots/dorm_views.py http://127.0.0.1:8765/index.html"""
import json, os, subprocess, sys, tempfile
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
VIEWS = {'road': ([20, 2.2, 57.5], [20, 3.2, 20]), 'side': ([40, 5.0, 64], [85, 4.0, 64])}
TIMES = {'day': 11.0, 'night': 20.5}

tmp = tempfile.mkdtemp(prefix='dormviews_')
shots = []
for k, (pos, look) in VIEWS.items():
    for t, h in TIMES.items():
        shots.append({'out': os.path.join(tmp, f'{k}_{t}.png'), 'w': 1024, 'h': 512, 'hideNPCs': True, 'hidePlayer': True,
                      'state': {'zone': 'campus', 'hour': h, 'pos': {'x': 20, 'z': 54, 'yaw': 0}}, 'cam': {'pos': pos, 'look': look}, 'wait': 5000})
spec = os.path.join(tmp, 'shots.json'); json.dump(shots, open(spec, 'w'), indent=1)
subprocess.run([sys.executable, os.path.join(ROOT, 'tools/blender/env_second/shots/fast_shots.py'), URL, spec], check=True)
for s in shots:
    name = os.path.basename(s['out'])[:-4]
    out = os.path.join(ROOT, 'assets/models/env', f'dorm_view_{name}.webp')
    Image.open(s['out']).convert('RGB').save(out, 'WEBP', quality=80, method=6)
    print('wrote', os.path.relpath(out, ROOT), os.path.getsize(out), 'bytes')
