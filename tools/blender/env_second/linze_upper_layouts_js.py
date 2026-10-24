"""src/data/linze_upper_layouts.js 從霖澤館樓上各層的配置檔產生（不要手改那個檔案）：
  python3 tools/blender/env_second/linze_upper_layouts_js.py [repo 根目錄]
讀 assets/models/env/second_ai/linze_<3f|4f|5f>.layout.json（linze_upper.py 輸出），拿掉遊戲不讀的 navcheck，照原本的格式寫一行 JSON。LAWWW2-B 2026-10-23（5F 加進來時補的產生程式）"""
import json, os, sys
ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
FLOORS = ('3f', '4f', '5f')
d = {}
for f in FLOORS:
    a = json.load(open(os.path.join(ROOT, f'assets/models/env/second_ai/linze_{f}.layout.json'), encoding='utf-8')); a.pop('navcheck', None); d[f] = a
hdr = '/* 霖澤館 3F、4F、5F 的配置（LAWWW2-C 臨時接線；從 assets/models/env/second_ai/linze_<3f|4f|5f>.layout.json 產生，不要手改）*/'
open(os.path.join(ROOT, 'src/data/linze_upper_layouts.js'), 'w', encoding='utf-8').write(hdr + '\nconst LINZE_UPPER_LAYOUTS=' + json.dumps(d, ensure_ascii=False) + ';\n')
print('wrote src/data/linze_upper_layouts.js', ', '.join(FLOORS))
