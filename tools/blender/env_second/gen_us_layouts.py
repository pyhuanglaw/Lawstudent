"""美國交換、桃園機場的配置（Blender 產生的 layout.json）→ 遊戲讀的 src/data/us_layouts.js（LAWWW2-C 2026-10-17，使用者「先做1，把美國場景接進遊戲」）。
  python3 tools/blender/env_second/gen_us_layouts.py [輸出，預設 src/data/us_layouts.js]
兩份來源都是 Blender 和遊戲共用的同一份（改 layout 要重新跑 *_layout_gen.py，再跑這支）：
  - assets/models/env/second_ai/us_community.layout.json（tools/blender/env_second/us_community_layout_gen.py）→ US_COMMUNITY_LAYOUT
  - assets/models/env/second_ai/airport_t2.layout.json（tools/blender/env_second/airport_layout_gen.py）→ AIRPORT_T2_LAYOUT
公寓室內是另一份手寫的 src/data/us_apartment_layout.js（US_APARTMENT_LAYOUT），不經過這支。"""
import json, os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'src', 'data', 'us_layouts.js')
SRC = [('US_COMMUNITY_LAYOUT', 'assets/models/env/second_ai/us_community.layout.json'),
       ('AIRPORT_T2_LAYOUT', 'assets/models/env/second_ai/airport_t2.layout.json')]
parts = ['/* ===== 美國交換（公寓社區戶外）、桃園機場第二航廈的配置：tools/blender/env_second/gen_us_layouts.py 產生，不要手改 =====\n'
         '   來源：' + '、'.join(p for _, p in SRC) + '（Blender 正式模型讀同一份）。\n'
         '   座標：區域座標 x 往東、z 往南、y 往上；單位公尺。遊戲端：src/us3d.js。 */']
for name, rel in SRC:
    d = json.load(open(os.path.join(ROOT, rel), encoding='utf-8'))
    parts.append('const %s=%s;' % (name, json.dumps(d, ensure_ascii=False, separators=(',', ':'))))
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w', encoding='utf-8').write('\n'.join(parts) + '\n')
print('wrote', OUT, os.path.getsize(OUT), 'bytes')
