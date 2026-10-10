"""兩點半 Café 室內（遊戲 cafe 區域）→ GLB。第二 AI 工作階段（環境美術）製作；Blender 5.2.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/cafe_interior.py [-- --out assets/models/env/second_ai/cafe_interior.glb]

座標＝遊戲 cafe 區域的座標（room() 14×12×3.4 m，門在 z=+6）。配置與零件在 cafe_layout.py（外觀從街上看到的店內也用同一套）。
故事與存檔用到的位置照遊戲（雙人桌、吧檯、點餐、出口），只換畫面：導航、座位、互動點在 src/zones3d.js 的 cafe 區塊。

遊戲整合（照 201 教室，zones3d.js 的 attachRoomGLB）：
- 名字含 WALL_ 的網格是會淡出的牆（自訂屬性 dir＝往室內的法線）：前牆（店面，從裡面看）、後牆（吧檯層架、黑板菜單、書牆）、
  左牆（掛畫、牆上層板）、右牆（兩扇窗，窗外的景是 room() 的窗景平面）。
- 天花板材質名稱含 ceiling（attachRoomGLB 會讓它自發光）。黑板菜單 WALL_back_MENU_FACE 的字由遊戲 canvas 畫（自訂屬性 menu）。
"""
import math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
import cafe_layout as CL   # noqa: E402
from lib2 import B, Mesh, g2b, bpy   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/cafe_interior.glb'))
TEXRES = int(arg('--texres', '512'))

random.seed(231)
B.reset(texres=TEXRES)
root = B.group('cafe_interior', props={'kind': 'cafe_interior', 'w': CL.RW, 'd': CL.RD, 'h': CL.RH})
mat = CL.materials()
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0]}

# 前牆：店面（和外觀同一套零件，從裡面看；店面座標 z=0 ＝ 室內 z=+6）＋店面上緣到天花板的灰泥牆
front = CL.grp('FRONT', root, z=CL.RD / 2)
CL.storefront(mat, front, inside=True)
fb = Mesh('front_plaster', mat['plaster']); fb.box(-CL.RW / 2, CL.RW / 2, CL.HEAD, CL.RH, -0.16, -0.04); fb.finish(front)
for ob in list(front.children):
    if ob.type == 'MESH': ob.name = 'WALL_front_' + ob.name; ob['dir'] = DIRS['front']

# 店內（後、左、右牆＋地板、天花板、家具、燈、植物）
walls = {}
res = CL.interior(mat, root, lite=False, walls=walls)
menu = res['menu']; menu.name = 'WALL_back_MENU_FACE'
CL.uv01(menu.finish(root, props={'dir': DIRS['back'], 'menu': ['今日手沖', '衣索比亞　耶加雪菲', '瓜地馬拉　安提瓜', '拿鐵　120　・　檸檬塔　90']}))
CL.finish_walls(walls, root, DIRS)
for (x, y, z) in res['glows']: CL.glow(root, 'pendant', x, y, z, color='rgba(255,200,130,1)', size=1.2, day=0.45, night=0.45)

# 合併同材質的零件：牆面依「哪一面牆」分開合併（每面牆各自淡出，自訂屬性 dir 保留）；黑板菜單單獨（遊戲換 canvas 貼圖）
L.merge_by_material(root, keep=lambda ob: 'MENU_FACE' in ob.name,
                    key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
info = L.export(OUT, gpu_instances=True)
L.write_json(OUT[:-4] + '.json', info)
