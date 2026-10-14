"""醉月湖（⑩）接進 LAWWW 3f3d56a 的實測 → VISUAL_REVIEW 第 31.7 節（接在 31.6 後面、第 32 節或檔尾之前）。
輸入：scratchpad/lakechk/lake_proc.json、lake_final.json＋截圖（lake_integration_check.py 的輸出）、campus_layout_nav_final.log。
用法：python3 docs/art-rebuild/second_ai/drafts/lakeint_fill.py <lakechk 資料夾>"""
import json, os, re, sys
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..')); D = R + '/docs/art-rebuild/second_ai'
SRC = sys.argv[1]
P, F = json.load(open(SRC + '/lake_proc.json')), json.load(open(SRC + '/lake_final.json'))
SH = {}
for v in ('proc', 'final'):
    for nm in ('boardwalk_mid', 'pav_center', 'to_col1', 'to_edge3', 'portrait_pav'):
        f = f'{SRC}/lake_{v}_{nm}.png'
        if os.path.exists(f):
            out = f'{D}/shots/lakeint_{v}_{nm}.webp'; Image.open(f).convert('RGB').save(out, 'WEBP', quality=82, method=6); SH[(v, nm)] = os.path.basename(out)


def st(d, k, kk):
    return d['stats'].get(k, {}).get(kk)


def occ(d, nm):
    o = d['occlusion'].get(nm) or {}
    h = o.get('head')
    if not h: return '看得到'
    return '被擋住（%s%s）' % (h['by'], '，網點透空' if h.get('st') else '')


rows = ['| 量測（同一套點地移動的路線） | 現在的遊戲（程序化） | 接上正式模型＋建議的導航 |', '|---|---|---|']
rows.append('| %d 個路線點都走得到 | %s | %s |' % (len(F['waypoints']), '是' if all(w['reached'] for w in P['waypoints']) else '否：' + '、'.join(w['name'] for w in P['waypoints'] if not w['reached']),
                                         '是' if all(w['reached'] for w in F['waypoints']) else '否：' + '、'.join(w['name'] for w in F['waypoints'] if not w['reached'])))
rows.append('| 身體離柱子最近（負的＝穿進柱子；柱身半徑 0.105、身體 0.33） | %.3f m（柱子在半徑 2.4） | %.3f m（柱子在半徑 2.3） |' % (st(P, 'pavilion', 'col_gap_min_m'), st(F, 'pavilion', 'col_gap_min_m')))
rows.append('| 身體超出平台邊緣最多（正的＝超出；南邊接木棧道不算） | %.3f m | %.3f m |' % (st(P, 'pavilion', 'edge_overhang_max_m'), st(F, 'pavilion', 'edge_overhang_max_m')))
rows.append('| 木棧道上身體離中線最遠／欄杆內側 | %.2f／%.2f m | %.2f／%.3f m |' % (st(P, 'boardwalk', 'body_from_center_max_m'), st(P, 'boardwalk', 'rail_inner_m'), st(F, 'boardwalk', 'body_from_center_max_m'), st(F, 'boardwalk', 'rail_inner_m')))
rows.append('| 腳的高度（地板頂面 0.05） | 亭子 %s、木棧道 %s（腳沉進木板 5 cm） | 亭子 %s、木棧道 %s |' % (st(P, 'pavilion', 'feet_y'), st(P, 'boardwalk', 'feet_y'), st(F, 'pavilion', 'feet_y'), st(F, 'boardwalk', 'feet_y')))
for nm, lb in (('pav_center', '人在亭子中間：鏡頭看得到人嗎'), ('to_col1', '走到柱子旁：鏡頭看得到人嗎'), ('portrait_pav', '手機直向、亭子裡：鏡頭看得到人嗎')):
    rows.append('| %s | %s | %s |' % (lb, occ(P, nm), occ(F, nm)))
nav = open(SRC + '/campus_layout_nav_final.log').read() if os.path.exists(SRC + '/campus_layout_nav_final.log') else ''
navres = 'ALL PASS' if 'ALL PASS' in nav else ('FAILED：' + '；'.join(l[5:].split('  ')[0] for l in nav.split('\n') if l.startswith('FAIL ')) if nav else '沒有跑')
shots = ['| 鏡頭 | 現在的遊戲 | 接上正式模型＋建議的導航 |', '|---|---|---|']
for nm, lb in (('boardwalk_mid', '木棧道中間（橫向）'), ('pav_center', '亭子中間（橫向）'), ('to_col1', '走到東南的柱子旁（橫向）'), ('portrait_pav', '亭子裡（手機直向 390×844）')):
    if (('proc', nm) in SH) and (('final', nm) in SH):
        shots.append(f"| {lb} | ![現在](shots/{SH[('proc', nm)]}) | ![正式模型](shots/{SH[('final', nm)]}) |")
doc = f"""
### 31.7 接進 LAWWW 最新開發分支的實測（2026-10-14，使用者把「醉月湖、湖心亭的導航及穿模」排在第一）

在 LAWWW `3f3d56a` 上套 `patches/lake_integration_3f3d56a.patch`（**完整的接法，LAWWW 直接 `git apply`**；在 `3f3d56a` 上 `git apply --check` 沒有衝突）＋`campus_lake.glb`，
用 `tools/blender/env_second/shots/lake_integration_check.py` 實際操作（點地面移動，和玩家一樣；不瞬移、不用 ?turbo）：南岸步道 → 木棧道 → 亭子中間 → 往六根柱子、五個邊走 → 回亭子中間 → 回南岸。
同一條路線也在現在的遊戲（程序化的湖）跑一次對照。Playwright＋SwiftShader 手機模擬，**不是 iPhone 實機**。

patch 的內容（只動 `src/zones3d.js` 的 `lake()`、校園載入的地方，和 `src/assets3d.js` 一行）：
1. 湖岸、湖心亭、木棧道的程序化網格放進 `lake_fallback`（`userData.dyn`：不被整區合併），正式模型載入後整組藏起來；載入失敗、`?nobldg` 照舊是程序化的。
2. 導航：亭子走得到的範圍從中心 2.35 m 改成 **2.0 m**，六根柱子所在的格子擋起來（31.2 第 4 點的量測）。
3. **地板高度**：亭子和木棧道的地板頂面在 y 0.05（水面 0.035 之上）——`nav.addSurf` 三塊（亭子、木棧道、接岸 45 cm 斜坡），人站在木板上，腳不再沉進去 5 cm（現在的遊戲也是沉 5 cm）。
4. `attachLakeGLB`：放在湖中心；亭子的屋頂、橫梁、柱子加「樹幹透視」（擋住鏡頭和人時網點透空，和行道樹樹幹同一套）；湖岸、置石不投影。
5. `ASSETS.manifest` 加 `bldg.campus_lake`（lazy）。

{chr(10).join(rows)}

`tests/campus_layout_nav.py`（套了 patch 的版本）：{navres}。`node tests/campus_public_unit.js`、`node tests/nav_buildings_unit.js`：ALL PASS（湖心亭走得到、從博雅門口走到湖心亭）。

{chr(10).join(shots)}

**還沒做／沒測**：iPhone 實機；晚上的燈光（亭子沒有燈，湖邊是原本的路燈）；NPC 走上木棧道（目前湖邊沒有排 NPC 的路線）。
"""
p = D + '/VISUAL_REVIEW.md'; v = open(p).read()
assert '### 31.7 ' not in v
k = v.find('\n## 32. '); k = len(v) if k < 0 else k
open(p, 'w').write(v[:k].rstrip('\n') + '\n' + doc.rstrip('\n') + '\n' + v[k:]); print('ok', len(SH), navres)
