"""美國交換（公寓社區、超市）、桃園機場的配置（Blender 產生的 layout.json）→ 遊戲讀的 src/data/us_layouts.js（LAWWW2-C 2026-10-17，使用者「先做1，把美國場景接進遊戲」）。
  python3 tools/blender/env_second/gen_us_layouts.py [輸出，預設 src/data/us_layouts.js]
兩份來源都是 Blender 和遊戲共用的同一份（改 layout 要重新跑 *_layout_gen.py，再跑這支）：
  - assets/models/env/second_ai/us_community.layout.json（tools/blender/env_second/us_community_layout_gen.py）→ US_COMMUNITY_LAYOUT
  - assets/models/env/second_ai/us_market.layout.json（tools/blender/env_second/us_market_layout_gen.py）→ US_MARKET_LAYOUT
  - assets/models/env/second_ai/airport_t2.layout.json（tools/blender/env_second/airport_layout_gen.py）→ AIRPORT_T2_LAYOUT
公寓室內是另一份手寫的 src/data/us_apartment_layout.js（US_APARTMENT_LAYOUT；Blender 讀它），這支照抄一份進來（遊戲只載 us_layouts.js）。"""
import json, os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'src', 'data', 'us_layouts.js')
SRC = [('US_COMMUNITY_LAYOUT', 'assets/models/env/second_ai/us_community.layout.json'),
       ('US_MARKET_LAYOUT', 'assets/models/env/second_ai/us_market.layout.json'),
       ('US_ASIAN_MARKET_LAYOUT', 'assets/models/env/second_ai/us_asian_market.layout.json'),   # 大超市對面的小亞洲超市（使用者 2026-10-17 23:0x；us_asian_market_layout_gen.py）
       ('AIRPORT_T2_LAYOUT', 'assets/models/env/second_ai/airport_t2.layout.json')]
parts = ['/* ===== 美國交換（公寓社區戶外）、桃園機場第二航廈的配置：tools/blender/env_second/gen_us_layouts.py 產生，不要手改 =====\n'
         '   來源：' + '、'.join(p for _, p in SRC) + '、src/data/us_apartment_layout.js（Blender 正式模型讀同一份）。\n'
         '   座標：區域座標 x 往東、z 往南、y 往上；單位公尺。遊戲端：src/us3d.js。 */']
for name, rel in SRC:
    d = json.load(open(os.path.join(ROOT, rel), encoding='utf-8'))
    parts.append('const %s=%s;' % (name, json.dumps(d, ensure_ascii=False, separators=(',', ':'))))
# 公寓室內：手寫的 src/data/us_apartment_layout.js（Blender 的 us_apartment.py 讀它）也併進來，遊戲只載這一個資料檔（index.html 少一行）
for fn, name in (('us_apartment_layout.js', 'US_APARTMENT_LAYOUT'), ('us_shared_layout.js', 'US_SHARED_LAYOUT')):   # 學姊她們的 C 棟合租戶也一樣（從單人戶轉出來的手寫配置）
    key = 'const %s=' % name; src = open(os.path.join(ROOT, 'src', 'data', fn), encoding='utf-8').read(); d = json.loads(src[src.rindex(key) + len(key):].rstrip().rstrip(';'))
    parts.append('const %s=%s;' % (name, json.dumps(d, ensure_ascii=False, separators=(',', ':'))))
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w', encoding='utf-8').write('\n'.join(parts) + '\n')
print('wrote', OUT, os.path.getsize(OUT), 'bytes')
