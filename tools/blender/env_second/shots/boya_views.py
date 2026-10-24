"""博雅教學館的窗外景（LAWWW 佇列：博雅窗景／北面窗建議）：在遊戲的校園拍實際畫面，存成 assets/models/env/views/boya_*_<day|night>.webp
（和 tools/shots/window_views.py 同樣的規格：1024×512、水平視角 90°（垂直 53.13°）、白天 11:00、晚上 20:30、藏起路人與玩家；拍的是遊戲畫面，不是照片）。
博雅在校園 (−38, −83)、34×18、不轉向（zones3d.js：CK.modern、ckPlace(boyaB,-38,-83,0)）：南牆 z=−74（入口）、北牆 z=−92（醉月湖那一面；湖南岸步道 z=−97、湖心 (−36,−112)）。
室內座標＋(−38, −83)＝校園座標。鏡頭放在外牆外 0.8 m、窗中心的高度、水平往外看。
用法：python3 tools/blender/env_second/shots/boya_views.py <URL> [名稱...]"""
import json, os, subprocess, sys, tempfile
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
URL = sys.argv[1]; ONLY = set(sys.argv[2:])
FOV = 53.13
VIEWS = {
    # 一樓南面兩扇窗（入口兩旁，室內 x ±2.4～±5.4、高 0.9–3.4）：往南看入口前的路、普通教學館北面
    'boya_south': ('campus', [-38, -70], [-38.0, 2.1, -73.2], [-38, 2.4, -30]),
    # 二樓南面窗（室內 x −1.6～5.4、高 5.7–7.6）
    'boya_2f_south': ('campus', [-38, -70], [-36.0, 6.6, -73.2], [-36, 5.0, -30]),
    # 二樓北面窗（室內 x ±7.4～±15.6，201、202 教室）：往北看醉月湖
    'boya_2f_north': ('campus', [-38, -95], [-38.0, 6.6, -92.8], [-38, 4.0, -140]),
    # 建議的一樓北面窗（大廳北牆；現在沒有窗）：往北看湖南岸步道、湖、湖心亭
    'boya_north': ('campus', [-38, -95], [-38.0, 2.1, -92.8], [-38, 2.0, -140]),
    # 寬照片（_w：2048×512、垂直 53.13°、水平約 127°；LAWWW2-B 2026-10-24，做法同 teach_views.py）：博雅室內的長窗用（boya_layout_gen.py 的 photoWide → teach3d.js 把 sxy 設成 (0.5, 1)），
    # 90° 的照片斜著看會在左右邊拉出橫紋。上面三張 90° 的照舊留著：boya_2f_south 博雅 203（rooms_glb3d、zones3d.js room() 沒有 sxy）也在用。
    # 一樓南面兩扇窗只有 3 m 寬，照舊用 90° 的 boya_south（寬照片會拍到博雅自己的門廊，左右邊是黑色的直條）。
    'boya_2f_south_w': ('campus', [-38, -70], [-36.0, 6.6, -73.2], [-36, 5.0, -30]),
    'boya_2f_north_w': ('campus', [-38, -95], [-38.0, 6.6, -92.8], [-38, 4.0, -140]),
}
TIMES = {'day': 11.0, 'night': 20.5}
tmp = tempfile.mkdtemp(prefix='boyaviews_')
shots = []
for k, (zone, ppos, pos, look) in VIEWS.items():
    if ONLY and k not in ONLY: continue
    for t, h in TIMES.items():
        shots.append({'out': os.path.join(tmp, f'{k}_{t}.png'), 'w': 2048 if k.endswith('_w') else 1024, 'h': 512, 'hideNPCs': True, 'hidePlayer': True,
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
