"""室內窗戶「窗外的景」：在遊戲裡的戶外區域拍實際畫面（2026-10-11 使用者實機回報「窗景都很假」——原本是 canvas 畫的方塊大樓＋綠色圓點）。
存成 assets/models/env/views/<名稱>_<day|night>.webp（1024×512、水平視角 90°、垂直約 53°；白天 11:00、晚上 20:30；藏起路人與玩家）。
讀的地方：src/world3d.js 的 W3.viewPhoto(名稱, 夜晚)；房間的窗（zones3d.js room() 的 view 選項）用 W3.windowMat 做視差（照片當成玻璃後面「景深」公尺的景）；
霖澤館、萬才館大廳玻璃外的大平面直接貼照片（building3d.js、wancai3d.js）。
鏡頭位置：窗戶在戶外區域的對應位置（窗中心高度、外牆外側一點點）往外看、水平。拍的是遊戲畫面（Playwright＋SwiftShader），不是照片。
用法（先開 http server）：python3 tools/shots/window_views.py http://127.0.0.1:8765/index.html [名稱...]
店家（cafe、cvs、noodle、bookstore）的窗景由第二個 AI 拍（tools/shots/shop_views.py，同樣的檔名規則）。"""
import json, os, subprocess, sys, tempfile
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
ONLY = set(sys.argv[2:])
FOV = 53.13   # 垂直視角：2:1 畫面的水平視角剛好 90°（W3.windowMat 的視差用這個比例）
# 名稱: (區域, 玩家站的位置（不入鏡，只是讓區域載入那一帶）, 鏡頭位置, 看的點)
VIEWS = {
    # 霖澤館外觀 40×18（校園 x 14–54、z −121 到 −103）：鏡頭一律放在外牆外面（大廳在建築裡面，對應位置還在外殼內）
    # 一樓大廳東面玻璃：從東牆外往東看法學院廣場、萬才館
    'linze_east': ('campus', [56, -108], [55.0, 2.1, -112.0], [90, 2.6, -112.0]),
    # 一樓大廳南面玻璃：從正面外往南看法學院前的路、樹
    'linze_south': ('campus', [30, -98], [30.0, 2.3, -101.6], [30, 2.8, -60]),
    # 萬才館 30×20（x 73–103、z −122 到 −102）一樓大廳：南面玻璃（陽台下往南）、東面玻璃（東牆外往東）
    'wancai_south': ('campus', [88, -84], [88.0, 2.6, -85.0], [88, 2.4, -40]),   # 大台階前的廣場往南（陽台下、側翼旁邊都會拍到自己的柱廊、雨遮）
    'wancai_east': ('campus', [106, -108], [104.0, 2.2, -112.0], [140, 2.6, -112.0]),
    # 霖澤館 201（二樓）：從正面二樓的高度往南看
    'linze_201': ('campus', [30, -98], [30.0, 6.6, -101.6], [30, 4.6, -60]),
    # 總圖 3F 閱覽區：總圖正面（x≈83–87 有門廊）前面、三樓高度、偏北一點避開門廊和塔，往西看椰林大道
    'library_3f': ('campus', [80, 4], [80.5, 13.0, 3.5], [20, 6.0, 0.0]),
    # 宿舍房間（男一舍 36×14，x 2–38、z 61–75，正面朝北、門廊在中間）：二樓高度、門廊旁邊往北看舟山路與校園
    'dorm_room': ('campus', [12, 56], [12.0, 5.3, 60.4], [12, 3.8, 20]),
    # 經濟系那一年的 412（ART-V0-DORM；AA_168 第 5 節：同一個房間模型、故事上是另一棟、外觀不另外做；AA_145：窗景不同）：四樓高度（每層約 3.3 m）、往東偏一點，看得到舟山路和校園的屋頂（LAWWW2-C 2026-10-17）
    'dorm_room412': ('campus', [24, 56], [24.0, 11.9, 60.4], [30, 8.0, 20]),
    # 法律系大二～大四的房間（AA_208 第 7、8 節：同一棟男一舍、同一個房間模型，房號和窗外不同；LAWWW2-C 2026-10-17）。
    # 男一舍 36×14（x 2–38、z 61–75），正面朝北對著舟山路（203、412 的窗景）；這三間朝宿舍的背面（「另一邊」）：背面 23 m 外是一排樟樹（z 99：x −6、6.6、20.5、33.5），再後面是校外的公寓。
    # 房間的窗用視差只露出照片中間一小塊（水平約 ±11°、垂直約 +1.5° 到 −7.7°，上半被捲簾蓋住），所以每間對準一棵樹、依樓層算俯角：
    # 大二 312（三樓 8.4 m）：「窗外看得到另一邊的樹」——對 x 20.5 那棵，看到樹冠和樹幹
    'dorm_room312': ('campus', [20, 78], [20.0, 8.4, 75.6], [20.0, 2.6, 110]),
    # 大三 507（五樓 14.6 m）：「窗外是樹梢和遠一點的屋頂」——對 x 6.6 那棵，看到樹冠的上半（後面的公寓比五樓高，看到的是牆面不是屋頂）
    'dorm_room507': ('campus', [8, 78], [8.0, 14.6, 75.6], [8, 9.2, 100]),
    # 大四 409（四樓 11.5 m）：「介於中間」——對 x 33.5 那棵
    'dorm_room409': ('campus', [33, 78], [33.0, 11.5, 75.6], [33.0, 3.6, 104]),
    # （作廢：AA_183 的 112／218／105，393eda85 交過；AA_208 改成 312／507／409。照片檔等 LAWWW-C 換成新的三張以後再刪）
    # 法律學院圖書館（萬才館一樓西南角進去、自己有兩層；src/data/lawlib_layout.js）：第二個 AI 2026-10-13 拍。萬才館 30×20（x 73–103、z −122 到 −102）的西半邊。
    # 南面的窗（一樓、樓梯、二樓共用一張）：弧形量體前面往南看法學院前的廣場與樹林（高度取一、二樓中間）
    'lawlib_south': ('campus', [80, -96], [77.0, 3.0, -95.0], [77, 2.6, -55]),
    # 北面的窗（一樓討論室、影印室；二樓高窗）：萬才館背面往北（隔壁的建築、圍牆外的街景）
    'lawlib_north': ('campus', [80, -96], [78.0, 3.5, -122.6], [78, 3.0, -170]),
    # 西面的窗（只有二樓高窗）：西牆外、二樓高窗的高度往西（兩館中間後方的國青中心、霖澤館）
    'lawlib_west': ('campus', [80, -96], [72.4, 6.9, -110.0], [30, 5.0, -110]),
    # 社科院圖書館（辜先生紀念圖書館一樓，src/data/soclib_layout.js；D56 社科院第①步）：室內 30×22 m。
    # X75（2026-10-20）社科院搬到霖澤館西南、整組轉 180°（src/data/socsci_layout.js：圖書館 x −13～17、z −65～−43）：室內的「西面」「北面」玻璃＝校園上圖書館朝東、朝南的玻璃。
    # 室內西面（校園上朝東的玻璃 x=17）：玻璃外往東看小椰林道的椰子樹、黑森林
    'soclib_west': ('campus', [19, -54], [17.6, 2.6, -54.0], [57, 2.6, -54.0]),
    # 室內北面（校園上朝南的玻璃 z=−43）：玻璃外往南看隔壁的系館、椰林大道那一側
    'soclib_north': ('campus', [2, -38], [2.0, 2.6, -42.4], [2, 2.6, 0]),
}
TIMES = {'day': 11.0, 'night': 20.5}

tmp = tempfile.mkdtemp(prefix='winviews_')
shots = []
for k, (zone, ppos, pos, look) in VIEWS.items():
    if ONLY and k not in ONLY: continue
    for t, h in TIMES.items():
        shots.append({'out': os.path.join(tmp, f'{k}_{t}.png'), 'w': 1024, 'h': 512, 'hideNPCs': True, 'hidePlayer': True,
                      'state': {'zone': zone, 'hour': h, 'pos': {'x': ppos[0], 'z': ppos[1], 'yaw': 0}}, 'cam': {'pos': pos, 'look': look},
                      'js': "GAME.E.camera.fov=%s; GAME.E.camera.updateProjectionMatrix();" % FOV, 'wait': 5000})
spec = os.path.join(tmp, 'shots.json'); json.dump(shots, open(spec, 'w'), indent=1)
subprocess.run([sys.executable, os.path.join(ROOT, 'tools/blender/env_second/shots/fast_shots.py'), URL, spec], check=True)
os.makedirs(os.path.join(ROOT, 'assets/models/env/views'), exist_ok=True)
for s in shots:
    name = os.path.basename(s['out'])[:-4]
    out = os.path.join(ROOT, 'assets/models/env/views', f'{name}.webp')
    Image.open(s['out']).convert('RGB').save(out, 'WEBP', quality=80, method=6)
    print('wrote', os.path.relpath(out, ROOT), os.path.getsize(out), 'bytes')
