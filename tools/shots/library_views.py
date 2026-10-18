"""總圖大廳的「窗外的景」：在遊戲裡的校園拍實際畫面，存成 assets/models/env/library_view_<景>_<day|night>.webp（1024×512）。
src/library3d.js 的 viewOf() 讀這些檔案（載不到就用程序化畫的）：
  avenue：從總圖門口往西拍椰林大道（大廳正面的玻璃帷幕）
  lawn：從總圖南側往南拍草地與系館（側窗、大樓梯平台後面的大窗）
白天 11:00、晚上 20:30；藏起路人與玩家。1024×1024（ART-LIB-VIEW-1018 起；之前是 1024×512）。拍的是遊戲畫面（Playwright＋SwiftShader），不是照片。
用法（先開 http server）：python3 tools/shots/library_views.py http://127.0.0.1:8765/index.html"""
import json, os, subprocess, sys, tempfile
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
# ART-LIB-VIEW-1018（LAWWW2-C 2026-10-18，使用者「總圖窗景很假」）：照片給 library3d.js 的 parallaxViews（W3.windowMat 視差）用——
# 視線高度、正對窗外、水平和垂直都是 90°（1024×1024；遊戲端 sxy＝(1, 0.5)：景在 depth 公尺遠、寬 2×depth、高 2×depth）。
# 試做 2:1（垂直 53°）：正面 9.6 m 高的玻璃往上看超出照片，上緣被拉長成一條條。
# avenue：總圖門口外（門廊柱子後面）往西的椰林大道；lawn：總圖紅磚側翼和中庭草地（舊版從 7 m 高往南拍方盒系館）。
VIEWS = {'avenue': ([77, 2.0, 0], [30, 2.0, 0]), 'lawn': ([100, 2.3, 14.5], [100, 2.3, 60])}
FOV_JS = "(()=>{ const c=GAME.E.camera; c.fov=90; c.updateProjectionMatrix(); return c.fov; })()"
TIMES = {'day': 11.0, 'night': 20.5}

tmp = tempfile.mkdtemp(prefix='libviews_')
shots = []
for k, (pos, look) in VIEWS.items():
    for t, h in TIMES.items():
        shots.append({'out': os.path.join(tmp, f'{k}_{t}.png'), 'w': 1024, 'h': 1024, 'hideNPCs': True, 'hidePlayer': True,
                      'state': {'zone': 'campus', 'hour': h, 'pos': {'x': 82, 'z': 0, 'yaw': 1.5708}}, 'cam': {'pos': pos, 'look': look}, 'wait': 7000, 'js': FOV_JS})
spec = os.path.join(tmp, 'shots.json'); json.dump(shots, open(spec, 'w'), indent=1)
subprocess.run([sys.executable, os.path.join(ROOT, 'tools/blender/env_second/shots/fast_shots.py'), URL, spec], check=True)
for s in shots:
    name = os.path.basename(s['out'])[:-4]
    out = os.path.join(ROOT, 'assets/models/env', f'library_view_{name}.webp')
    Image.open(s['out']).convert('RGB').save(out, 'WEBP', quality=80, method=6)
    print('wrote', os.path.relpath(out, ROOT), os.path.getsize(out), 'bytes')
