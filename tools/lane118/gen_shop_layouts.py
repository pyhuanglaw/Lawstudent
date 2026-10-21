#!/usr/bin/env python3
"""118 巷九間店的室內配置：assets/models/env/second_ai/l118_<id>.layout.json（LAWWW2 的 lane118_shops.py 匯出）→ src/data/l118_shop_layouts.js。
順序照 src/data/lane118_layout.js 的 shops；layout 的 navcheck（LAWWW2 匯出時的導航檢查結果）不放進遊戲。
LAWWW2 改了店內配置、重新匯出以後跑一次：python3 tools/lane118/gen_shop_layouts.py（--check：只比對，不一樣就結束碼 1）"""
import json, os, re, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'src', 'data', 'l118_shop_layouts.js')

def build():
    lay = open(os.path.join(ROOT, 'src', 'data', 'lane118_layout.js'), encoding='utf8').read()
    ids = []
    for i in re.findall(r'"id"\s*:\s*"([a-z0-9_]+)"', lay):   # lane118_layout.js 裡出現的順序；只留有室內配置的店
        if i not in ids and os.path.exists(os.path.join(ROOT, 'assets', 'models', 'env', 'second_ai', f'l118_{i}.layout.json')): ids.append(i)
    out = {}
    for i in ids:
        p = os.path.join(ROOT, 'assets', 'models', 'env', 'second_ai', f'l118_{i}.layout.json')
        d = json.load(open(p, encoding='utf8')); d.pop('navcheck', None); out[i] = d
    head = '/* 118 巷九間店的室內配置（LANE118-SHOPS-1020，LAWWW2-C）：tools/lane118/gen_shop_layouts.py 由 assets/models/env/second_ai/l118_<id>.layout.json 產生，不要手改 */\n'
    return head + 'const L118_SHOP_LAYOUTS=' + json.dumps(out, ensure_ascii=False) + ';\n', list(out)

if __name__ == '__main__':
    txt, ids = build()
    if '--check' in sys.argv:
        cur = open(OUT, encoding='utf8').read() if os.path.exists(OUT) else ''
        ok = cur == txt; print(('OK' if ok else '不一樣（重新跑 tools/lane118/gen_shop_layouts.py）'), ' '.join(ids)); sys.exit(0 if ok else 1)
    open(OUT, 'w', encoding='utf8').write(txt); print('寫入', os.path.relpath(OUT, ROOT), len(ids), '間：', ' '.join(ids))
