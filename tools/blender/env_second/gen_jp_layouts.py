"""日本宿舍的配置：assets/models/env/second_ai/jp_*.layout.json（jp_dorm.py 匯出）→ src/data/jp_dorm_layouts.js（遊戲讀；navcheck 不放進去）。
用法（repo 根目錄）：python3 tools/blender/env_second/gen_jp_layouts.py [輸出的 repo 根目錄]"""
import json, os, sys, glob
ROOT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
SRC = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'assets', 'models', 'env', 'second_ai'))
out = {}
for f in sorted(glob.glob(os.path.join(SRC, 'jp_*.layout.json'))):
    lay = json.load(open(f, encoding='utf-8')); lay.pop('navcheck', None); out[lay['zone']] = lay
js = ('/* 自動產生（tools/blender/env_second/gen_jp_layouts.py，來源 assets/models/env/second_ai/jp_*.layout.json；LAWWW2-C jp_dorm.py）——不要手改 */\n'
      'const JP_DORM_LAYOUTS=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
p = os.path.join(ROOT, 'src', 'data', 'jp_dorm_layouts.js'); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, 'w', encoding='utf-8').write(js)
print('寫入', os.path.relpath(p, ROOT), len(out), '區：', ' '.join(out))
