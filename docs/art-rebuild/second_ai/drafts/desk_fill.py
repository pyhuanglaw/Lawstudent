"""VISUAL_REVIEW 第 27 節（桌上小物）＋第 24 節換成修正後的圖。
用法：python3 docs/art-rebuild/second_ai/drafts/desk_fill.py <桌上小物 Blender 渲染資料夾> <桌上小物遊戲截圖資料夾（g_*.png）> <替身 Blender 渲染資料夾（fig_*、lod1_*）> <替身遊戲截圖資料夾（g_*.png）>"""
import json, os, subprocess, sys
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..')); D = R + '/docs/art-rebuild/second_ai'
BR, GM, SBR, SGM = sys.argv[1:5]


def webp(src, dst, w=None, q=84):
    im = Image.open(src).convert('RGB')
    if w and im.size[0] > w: im = im.resize((w, round(im.size[1] * w / im.size[0])), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=q, method=6)


# ---- 第 24 節：同樣的檔名換成修正後的圖 ----
n24 = 0
for n in ('fig_front', 'fig_close', 'fig_side', 'fig_back', 'lod1_front', 'lod1_close'):
    p = f'{SBR}/{n}.png'
    if os.path.exists(p): webp(p, f'{D}/blender_renders/seated_{n}.webp', 1100); n24 += 1
for n in ('101', '101_side', 'lobby', 'mobile'):
    p = f'{SGM}/g_{n}.png'
    if os.path.exists(p): webp(p, f'{D}/shots/seated_game_{n}.webp', None if n == 'mobile' else 1100); n24 += 1

# ---- 第 27 節 ----
info = json.load(open(R + '/assets/models/env/second_ai/desk_props.json', encoding='utf8')); M = info['modules']
spec = json.loads(subprocess.check_output(['python3', R + '/tools/blender/env_second/glb_specs.py', R + '/assets/models/env/second_ai/desk_props.glb']).decode().strip().splitlines()[-1])
ITEMS = [('notebook_open', '攤開的 B5 筆記本（手寫筆記；兩頁往裝訂線彎）', '364×257 mm'), ('notebook_closed', '闔起的筆記本（藍）', '182×257×5.5 mm'), ('notebook_closed_b', '闔起的筆記本（綠）', '同上'),
         ('code_book', '六法（闔起，書背在左邊）', '155×215×55 mm'), ('code_open', '攤開的六法（刑法第 1–4、12–14 條）', '304×215 mm、每邊 2 cm 厚'), ('textbook', '教科書《刑法總則講義》', '170×240×28 mm'),
         ('laptop_open', '筆電（螢幕開 110°，投影片）', '304×212 mm'), ('laptop_closed', '筆電（闔起）', '304×212×20 mm'), ('phone_on', '手機（螢幕亮著）', '71.5×146.5×7.8 mm'), ('phone_off', '手機（螢幕暗）', '同上'),
         ('pen', '原子筆（平放）', '長 142 mm'), ('highlighter', '螢光筆（黃）', '長 122 mm'), ('highlighter_pink', '螢光筆（粉紅）', '同上'), ('pencil_case', '布筆袋（拉鍊）', '200×55×60 mm'),
         ('cup', '外帶紙杯（紙套、杯蓋）', 'Ø93×123 mm'), ('thermos_sage', '保溫瓶（灰綠）', 'Ø68×232 mm'), ('thermos_navy', '保溫瓶（深藍）', '同上')]
items = '\n'.join(f"| `item_{k}` | {t} | {sz} | {M['item_' + k]['tris']} |" for k, t, sz in ITEMS)
NAME = {'notebook_open': '攤開的筆記本', 'notebook_closed': '闔起的筆記本', 'book_closed': '書', 'book_open': '攤開的六法', 'laptop': '筆電', 'phone': '手機', 'pen': '筆', 'highlighter': '螢光筆',
        'pencil_case': '筆袋', 'cup': '紙杯', 'thermos': '保溫瓶'}
ORIG = {'lset': '講堂座位', 'hold': '講堂座位（手上）', 'tset': '自習雙人桌', 'rset': '圓桌'}
NOTE = {'lset_write': '（配抄筆記：筆在右手）', 'lset_phone': '（配滑手機：手機在兩手中間）', 'hold_phone': '（配滑手機）', 'hold_pen': '（配抄筆記）', 'tset_away': '（人走開一下）', 'lset_book': '（教科書＋筆記本疊著）'}
sets = []
for k, v in M.items():
    if k.startswith('item_') or k.endswith('_lod1'): continue
    lod1 = M.get(k + '_lod1', {}).get('tris', '—')
    sets.append(f"| `{k}` | {ORIG[k.split('_')[0]]} | {'、'.join(NAME[i] for i in v['items'])}{NOTE.get(k, '')} | {v['tris']}／{lod1} |")
pc = info.get('placement_check')
V = {'items': items, 'sets': '\n'.join(sets),
     'spec': f"GLB **{spec['bytes'] / 1e6:.2f} MB**（貼圖 {spec['textures']} 張 {', '.join(f'{k}×{v}' for k, v in spec['texture_sizes'].items())}，WebP 共 {spec['texture_KB']} KB）、網格 {spec['meshes']}、材質 {spec['materials']}、三角形合計 {spec['tris_unique']:,}。"
             f"擺放檢查：{'通過' if pc == 'ok' else pc}。"}
bl = []
LB = {'items_items_top': '17 種單件（排在一張桌上）', 'items_items_close': '近看：筆記本的手寫、筆電螢幕、手機、筆、紙杯',
      'lec_back': '講堂三排（從後面看）：前兩排 LOD0、最後一排（最近鏡頭的那排）LOD1；筆電、手機螢幕會亮', 'lec_side': '側面：抄筆記的筆記本在手下、筆在右手；滑手機的手機在兩手中間',
      'lec_close': '從講台那一側近看：抄筆記、滑手機的人和桌上的東西', 'lec_lod1': 'LOD1（遠處用）：筆記本、筆電、書都只剩幾個面',
      'st_round': '圓桌（從上面看）：四個位子各一組（抄筆記、筆電、攤開的六法＋螢光筆、紙杯＋筆記本＋滑手機的人）', 'st_side': '自習雙人桌（側面）：抄筆記的人和對面用筆電的人',
      'st_tables': '自習雙人桌兩張＋圓桌'}
for n in LB:
    p = f'{BR}/{n}.png'
    if os.path.exists(p): webp(p, f'{D}/blender_renders/desk_{n}.webp', 1100); bl.append(f'**{LB[n]}**\n\n![](blender_renders/desk_{n}.webp)\n')
webp(R + '/tools/blender/env_second/textures/gen/desk_props_atlas.png', f'{D}/blender_renders/desk_atlas.webp', 1024, q=88)
bl.append('**貼圖集（1024×1024，程式畫）**：左上攤開的筆記本、左下攤開的六法、右上筆電螢幕與鍵盤面、手機、封面、書背、紙套、筆袋；最下面是純色小格\n\n![](blender_renders/desk_atlas.webp)\n')
gm = []
GL = {'101': '博雅 101 最後一排後面的平台：聽講（筆電）、抄筆記（筆記本＋筆）、滑手機（手機＋桌上的筆記本）、聽講（六法＋螢光筆＋紙杯）', '101_close': '同一排，從後面往下看（玩家在講堂後排看到的樣子）',
      'lobby': '博雅大廳：自習雙人桌兩張＋圓桌（新的桌椅、替身、桌上小物）；後面是原本的桌椅', 'lobby_close': '自習雙人桌近看：抄筆記（筆記本在手下、筆袋）、對面用筆電（保溫瓶、手機、紙杯）',
      'round': '圓桌：攤開的六法＋螢光筆、筆記本、筆電、紙杯', 'lobby_night': '晚上 20:30（螢幕的自發光）', 'mobile': '手機直向 390×844（跟隨鏡頭，有 HUD）'}
for n in GL:
    p = f'{GM}/g_{n}.png'
    if os.path.exists(p): webp(p, f'{D}/shots/desk_game_{n}.webp', None if n == 'mobile' else 1100); gm.append(f'**{GL[n]}**\n\n![](shots/desk_game_{n}.webp)\n')
V['blender'] = '\n'.join(bl); V['game'] = '\n'.join(gm) or '（沒有）'
tpl = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'desk_review.md'), encoding='utf8').read()
for k, v in V.items(): tpl = tpl.replace('@@' + k + '@@', str(v))
assert '@@' not in tpl
vr = D + '/VISUAL_REVIEW.md'; s = open(vr, encoding='utf8').read()
assert '## 27. 桌上小物' not in s, '第 27 節已經在了（先 git checkout 再跑）'
open(vr, 'w', encoding='utf8').write(s.rstrip('\n') + '\n' + tpl)
print('ok 24:', n24, '27:', len(bl), len(gm))
