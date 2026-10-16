"""新社科院外觀（campus_socsci.glb，LAWWW2 的 Blender 腳本 tools/blender/env_second/campus_socsci.py）的導航、鏡頭碰撞、門
→ src/data/socsci_layout.js（遊戲用的全域 SOCSCI_LAYOUT；zones3d.js 校園、soclib3d.js 的門、story／events 的位置讀這一份）。
LAWWW2 重新匯出 GLB（campus_socsci.json 跟著變）以後重跑：python3 tools/gen_socsci_layout.py"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
J = json.load(open(os.path.join(ROOT, 'assets/models/env/second_ai/campus_socsci.json'), encoding='utf-8'))
N = J['nav']
r2 = lambda v: round(v, 2)
rects = [[r2(r['x']), r2(r['z']), r2(r['w']), r2(r['d']), r['what']] for r in N['rects']]
circles = [[r2(c['x']), r2(c['z']), r2(c['r']), c['what']] for c in N['circles']]
cams = [[*map(r2, c['box']), c['what']] for c in N['cam']]
D = {d['what']: d for d in N['doors']}
lib = next(d for k, d in D.items() if '圖書館' in k); west = next(d for k, d in D.items() if '西面' in k); north = next(d for k, d in D.items() if '北面' in k)
out = {
    'rects': rects, 'circles': circles, 'cams': cams,
    # 圖書館的門（往 soclib 區域）：南牆 x 99.8–102.2；出來站在門前 1.7 m、面向南（中庭）
    'libDoor': {'x': r2(lib['x']), 'z': r2(lib['z']), 'r': 1.2}, 'libOut': {'x': r2(lib['x']), 'z': -67.6, 'yaw': 0},
    # 大樓的兩個門（室內還沒做：門口是告示；經濟系那一年「社會科學院」的說明、SK02 的系辦在西面主入口）
    'westDoor': {'x': r2(west['x']), 'z': r2(west['z'])}, 'northDoor': {'x': r2(north['x']), 'z': r2(north['z'])},
    'benches': [[r[0], r[1], r[2], r[3]] for r in rects if '長椅' in r[4]],
}
js = ('/* 自動產生：python3 tools/gen_socsci_layout.py（來源 assets/models/env/second_ai/campus_socsci.json；LAWWW2 的 campus_socsci.py 匯出時寫的）。不要手改。\n'
      '   新社科院外觀（ART-01，D56 社科院第②步）：圖書館 x 95–125、z −92～−70（玻璃牆朝西、朝北，入口在南邊的中庭）；大樓 x 95–125、z −58～−42（8 層清水混凝土，一樓西面、北面是柱廊）；中庭 z −70～−58。\n'
      '   rects＝[中心 x, 中心 z, 寬（x）, 深（z）, 說明]；circles＝[x, z, 半徑, 說明]；cams＝鏡頭碰撞 [x0, y0, z0, x1, y1, z1, 說明] */\n'
      'const SOCSCI_LAYOUT=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
open(os.path.join(ROOT, 'src/data/socsci_layout.js'), 'w', encoding='utf-8').write(js)
print('src/data/socsci_layout.js', len(rects), 'rects', len(circles), 'circles', len(cams), 'cams')
