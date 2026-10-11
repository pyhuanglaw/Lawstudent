"""臺大總圖書館（椰林大道東端盡頭，正面朝西）的正式外觀 → 一個 GLB（校園世界座標）。第二 AI 工作階段（環境美術）製作：
  /opt/blenv/bin/python tools/blender/env_second/campus_library.py [-- --out assets/models/env/second_ai/campus_library.glb]
（2026-10-11 起程式在 campus_hall.py：行政大樓等 CK.hall 的校舍共用同一套；這裡＝campus_hall.build(SETS['library'])，輸出和改之前逐位元組相同。）

取代 src/zones3d.js campus 區塊的 CK.hall 總圖的外觀（LAWWW 2026-10-10 23:26Z 分派）：位置、尺寸、朝向、樓層、開間、
拱廊柱子、門廊、塔樓都照套件（campuskit3d.js hall()；改那邊要一起改這裡）。導航阻擋、鏡頭碰撞、門口互動點都在遊戲程式裡（套件），不變。

台大校舍的語彙（ART_DIRECTION、D23／D25）：褐色面磚外牆、石材收邊（勒腳、樓層腰帶、簷口、拱窗窗框與窗台）、一樓連續拱廊、
中央入口門廊＋山牆、中央塔樓、四坡屋頂。和套件不同的地方（品質）：
  - 窗是牆上真的開出的拱形窗洞：石材窗框外凸 6 cm、窗玻璃內凹 30 cm（看得到窗洞內側），窗台外凸；套件是貼在牆面上的薄片。
  - 拱廊與門廊的拱有拱腹（拱的內側面），拱圈石材收邊；簷口是三段線腳；屋簷底下有簷底板。
  - 面磚（exterior_wall_cladding_02）、切石（sandstone_blocks_08）、屋瓦（grey_roof_tiles）、花崗石（granite_tile_03）、木門（dark_wood）都是 Poly Haven CC0 PBR。
效能（LAWWW 的條件：同一個鏡頭的三角形不能比套件多）：套件 34,503 個三角形（投影 4,612）。這裡不用 instancing：
全部合成每個材質一個網格（draw call 少）；窗框、窗台、窗洞內側用另一個材質（ck_trim_win），遊戲端不投影。
招牌「總圖書館」：PLATE_FACE_LIB（遊戲用 canvas 畫字：石材底色、深褐色襯線字，晚上不發光）。
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from campus_hall import SETS, build   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
build(SETS['library'], ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else None)
