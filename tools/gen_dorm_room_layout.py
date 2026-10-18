"""宿舍四人房的配置：assets/models/env/second_ai/dorm_room4.layout.json → src/data/dorm_room_layout.js（DORM_ROOM）。
LAWWW2 換了 dorm_room4.glb 和 layout 以後跑一次：python3 tools/gen_dorm_room_layout.py"""
import json, os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src='assets/models/env/second_ai/dorm_room4.layout.json'
d=json.load(open(os.path.join(ROOT,src)))
js=('/* 宿舍房間（台大四人房：上舖床、下面書桌；使用者 2026-10-17 01:0x 給照片、01:3x「宿舍ok」）的配置。\n'
    '   自動產生，不要手改：照 '+src+'（LAWWW2-B 的 Blender 腳本輸出，和 dorm_room4.glb 同一份）重新產生：python3 tools/gen_dorm_room_layout.py\n'
    '   zones3d.js 的 dorm 區域（導航、座位、睡覺、牆上的東西）、story3d.js（室友坐哪裡）都讀這一份。*/\n'
    'const DORM_ROOM='+json.dumps(d,ensure_ascii=False,separators=(',',':'))+';\n')
open(os.path.join(ROOT,'src/data/dorm_room_layout.js'),'w').write(js)
print('ok',len(js))
