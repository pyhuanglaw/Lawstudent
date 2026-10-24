"""普通教學館、共同教學館教室的窗外景（#61 ART-ECON-3D-GAP-1021：經濟系那一年在普通上課，教室的窗是一片灰白——layout 的 photo 是 null，用的是程序化的景）。
在遊戲的校園拍實際畫面，存成 assets/models/env/views/<名稱>_<day|night>.webp（和 boya_views.py、tools/shots/window_views.py 同樣的規格：
1024×512、水平視角 90°（垂直 53.13°）、白天 11:00、晚上 20:30、藏起路人與玩家；拍的是遊戲畫面，不是照片）。
名稱的 south／north＝室內配置的 S／N 牆（src/data/*_layout.js 的 windows[].wall），不一定是校園上的方向（共同轉了 180°）。
  普通 34×16，校園 (−38, −58.5)、不轉向（zones3d.js：ckPlace(putongB,-38,-58.5,0)）：室內 (x, z)＝校園 (−38+x, −58.5+z)。
    S 牆＝校園 z −50.5（正門，往南看門前的路）；N 牆＝校園 z −66.5（往北看博雅的南面，隔 7.5 m）。
  共同 24×14，校園 (2, 33)、轉 180°（ckPlace(gongtong,2,33,Math.PI)）：室內 (x, z)＝校園 (2−x, 33−z)。
    S 牆＝校園 z 26（正面、拱廊，往北看椰林大道那一側）；N 牆＝校園 z 40（背面，往南）。
  共同 3F 考場（gongtong_3f.py，自己的座標）：+z 那一排窗當成正面（校園朝北）三樓的高度（地板 7.8 m＋窗中心 2.1 m）。
鏡頭放在外牆外 0.8 m、窗中心的高度、水平往外看（稍微往下）。LAWWW2-B 2026-10-24。
寬照片（WIDE，普通、共同的教室窗）：2048×512、垂直 53.13°、水平約 127°（tan 半角＝2）——教室的窗是 7～14 m 的長窗，斜著看時視線會跑出 90° 照片的左右邊，
  W3.windowMat 把超出的地方夾在邊緣那一欄，變成一條條橫紋；遊戲端（teach3d.js）看配置的 photoWide 把 sxy 設成 (0.5, 1)，照片就涵蓋 ±2 倍景深。
  3F 考場（gongtong_3f）的窗小、分開，照舊 1024×512、90°（zones3d.js room() 沒有 sxy）。
用法：python3 tools/blender/env_second/shots/teach_views.py <URL> [名稱...]"""
import json, os, subprocess, sys, tempfile
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
URL = sys.argv[1]; ONLY = set(sys.argv[2:])
FOV = 53.13
VIEWS = {
    # 普通一樓：南面 103、104（室內 x ±6～±15.6、高 0.9–2.8）；北面 101、102（同樣的 x）
    'putong_south': ('campus', [-38, -47.4], [-27.2, 1.85, -49.7], [-27.2, 1.9, 0]),
    'putong_north': ('campus', [-27, -70], [-27.2, 1.85, -67.3], [-27.2, 1.6, -120]),
    # 普通二樓：南面（室內 x −3.6～3.6，樓梯前的大廳、高 5.1–7.0）；北面 201、202
    'putong_2f_south': ('campus', [-38, -47.4], [-38.0, 6.05, -49.7], [-38, 4.5, 0]),
    'putong_2f_north': ('campus', [-27, -70], [-27.2, 6.05, -67.3], [-27.2, 4.5, -120]),
    # 共同一樓：S 牆（102，室內 x −11.4～−4 → 校園 x 6～13.4）；N 牆（101，室內 x 4.6～11 → 校園 x −9～−2.6）
    'gongtong_south': ('campus', [2, 20.6], [9.7, 1.85, 25.2], [9.7, 1.9, -30]),
    'gongtong_north': ('campus', [-6, 43], [-5.8, 1.85, 40.8], [-5.8, 1.6, 90]),
    # 共同二樓：S 牆（室內 x −11.4～3 → 校園 x −1～13.4）；N 牆同一樓
    'gongtong_2f_south': ('campus', [2, 20.6], [6.2, 6.05, 25.2], [6.2, 4.5, -30]),
    'gongtong_2f_north': ('campus', [-6, 43], [-5.8, 6.05, 40.8], [-5.8, 4.5, 90]),
    # 共同 3F 考場
    'gongtong_3f': ('campus', [2, 20.6], [6.2, 9.9, 25.2], [6.2, 6.5, -30]),
}
WIDE = {k for k in VIEWS if k != 'gongtong_3f'}
TIMES = {'day': 11.0, 'night': 20.5}
tmp = tempfile.mkdtemp(prefix='teachviews_')
shots = []
for k, (zone, ppos, pos, look) in VIEWS.items():
    if ONLY and k not in ONLY: continue
    for t, h in TIMES.items():
        shots.append({'out': os.path.join(tmp, f'{k}_{t}.png'), 'w': 2048 if k in WIDE else 1024, 'h': 512, 'hideNPCs': True, 'hidePlayer': True,
                      'state': {'zone': zone, 'hour': h, 'pos': {'x': ppos[0], 'z': ppos[1], 'yaw': 0}}, 'cam': {'pos': pos, 'look': look},
                      'js': "GAME.E.camera.fov=%s; GAME.E.camera.updateProjectionMatrix();" % FOV, 'wait': 5000})
spec = os.path.join(tmp, 'shots.json'); json.dump(shots, open(spec, 'w'), indent=1)
subprocess.run([sys.executable, os.path.join(HERE, 'fast_shots.py'), URL, spec], check=True)
os.makedirs(os.path.join(ROOT, 'assets/models/env/views'), exist_ok=True)
for s in shots:
    name = os.path.basename(s['out'])[:-4]
    out = os.path.join(ROOT, 'assets/models/env/views', f'{name}.webp')
    Image.open(s['out']).convert('RGB').save(out, 'WEBP', quality=80, method=6)
    print('wrote', os.path.relpath(out, ROOT), os.path.getsize(out), 'bytes', flush=True)
