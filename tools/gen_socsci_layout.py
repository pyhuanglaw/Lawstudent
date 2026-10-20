"""新社科院外觀（campus_socsci.glb，LAWWW2 的 Blender 腳本 tools/blender/env_second/campus_socsci.py）的導航、鏡頭碰撞、門
→ src/data/socsci_layout.js（遊戲用的全域 SOCSCI_LAYOUT；zones3d.js 校園、soclib3d.js 的門、story／events 的位置讀這一份）。
LAWWW2 重新匯出 GLB（campus_socsci.json 跟著變）以後重跑：python3 tools/gen_socsci_layout.py

位置（X75，使用者 2026-10-20：「社科院位置其實不是在法律系出去左手邊 應該是朝西南 你實際查社科院位置」；臺大官方交通資訊：
  從辛亥路與復興南路口的校門進來左邊第一棟是霖澤館，社科院在它西側、靠辛亥路）：LAWWW2 的 GLB 照舊是原本的世界座標
  （x 95–125、z −92～−42：萬才館東南邊，從法律系出來是左手邊），遊戲接上時整個模型繞 y 轉 180° 再平移（SOCSCI_LAYOUT.place）：
  (x, z) → (PX − x, PZ − z)＝霖澤館西南、小椰林道西邊、博雅／普通東邊（x −13～17、z −93～−43）。
  轉 180° 以後和真實一樣是大樓在北（靠辛亥路）、圖書館在南；大樓正門（匾額）朝東、對著小椰林道；中庭朝小椰林道打開。
  這裡的導航、鏡頭碰撞、門、長椅全部換到新的位置；面向（yaw）加 π。"""
import json, math, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
J = json.load(open(os.path.join(ROOT, 'assets/models/env/second_ai/campus_socsci.json'), encoding='utf-8'))
N = J['nav']
r2 = lambda v: round(v, 2) + 0.0   # + 0.0：不要寫出 -0.0
PX, PZ = 112.0, -135.0
T = lambda x, z: (r2(PX - x), r2(PZ - z))
yawT = lambda y: math.atan2(math.sin(y + math.pi), math.cos(y + math.pi))   # 面向加 π（−π～π；不四捨五入：π 要是真的 π）
DIR = str.maketrans('東西南北', '西東北南')   # 說明裡的方位跟著轉 180°（模型的「西南角」＝遊戲裡的東北角）
rects = [[*T(r['x'], r['z']), r2(r['w']), r2(r['d']), r['what'].translate(DIR)] for r in N['rects']]   # 轉 180°：寬、深不變
circles = [[*T(c['x'], c['z']), r2(c['r']), c['what'].translate(DIR)] for c in N['circles']]
cams = []
for c in N['cam']:
    x0, y0, z0, x1, y1, z1 = c['box']
    cams.append([r2(PX - x1), r2(y0), r2(PZ - z1), r2(PX - x0), r2(y1), r2(PZ - z0), c['what'].translate(DIR)])
D = {d['what']: d for d in N['doors']}
lib = next(d for k, d in D.items() if '圖書館' in k); west = next(d for k, d in D.items() if '西面' in k); north = next(d for k, d in D.items() if '北面' in k)
lx, lz = T(lib['x'], lib['z']); ox, oz = T(lib['x'], -67.6); mx, mz = T(west['x'], west['z']); cx, cz = T(north['x'], north['z'])
out = {
    # 模型怎麼放：root.rotation.y＝ry、root.position＝(x, 0, z)（模型的世界座標 (x, z) → (PX − x, PZ − z)）
    'place': {'x': PX, 'z': PZ, 'ry': math.pi},
    'rects': rects, 'circles': circles, 'cams': cams,
    # 圖書館的門（往 soclib 區域）：圖書館北牆（中庭那一面）；出來站在門前 1.7 m、面向北（中庭）
    'libDoor': {'x': lx, 'z': lz, 'r': 1.2}, 'libOut': {'x': ox, 'z': oz, 'yaw': yawT(0)},
    # 大樓的兩個門（室內還沒做）：正門（「社會科學院」匾額）在大樓東面、朝小椰林道——經濟系那一年「社會科學院」的說明、SK02 的系辦在這裡；
    # 中庭門在大樓南面（模型裡原本的西面主入口、北面入口）
    'mainDoor': {'x': mx, 'z': mz}, 'courtDoor': {'x': cx, 'z': cz},
    # 長椅 [x, z, 寬, 深, 坐下面向 yaw]：朝中庭坐（模型裡沿 x 的兩張面向 +z、沿 z 的兩張面向 −x，轉 180° 以後各加 π）
    'benches': [[r[0], r[1], r[2], r[3], yawT(0 if r[2] > r[3] else -math.pi / 2)] for r in rects if '長椅' in r[4]],
}
js = ('/* 自動產生：python3 tools/gen_socsci_layout.py（來源 assets/models/env/second_ai/campus_socsci.json；LAWWW2 的 campus_socsci.py 匯出時寫的）。不要手改。\n'
      '   新社科院外觀（ART-01，D56 社科院第②步）；X75（2026-10-20）搬到霖澤館西南、轉 180°（模型的 (x, z) → (112 − x, −135 − z)，place）：\n'
      '   大樓 x −13～17、z −93～−77（8 層清水混凝土；正門在東面、朝小椰林道，南面有中庭門；一樓東面、南面是柱廊）；中庭 z −77～−65（朝小椰林道打開）；\n'
      '   圖書館 x −13～17、z −65～−43（玻璃牆朝東、朝南，入口在北牆、面向中庭）。\n'
      '   rects＝[中心 x, 中心 z, 寬（x）, 深（z）, 說明]；circles＝[x, z, 半徑, 說明]；cams＝鏡頭碰撞 [x0, y0, z0, x1, y1, z1, 說明] */\n'
      'const SOCSCI_LAYOUT=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
open(os.path.join(ROOT, 'src/data/socsci_layout.js'), 'w', encoding='utf-8').write(js)
print('src/data/socsci_layout.js', len(rects), 'rects', len(circles), 'circles', len(cams), 'cams')
