"""VISUAL_REVIEW 第 30 節（⑪總圖 3F 閱覽區）、第 31 節（⑩醉月湖）：規格、遊戲內原型（修改前｜修改後）、Blender 渲染 → 接在 VISUAL_REVIEW.md 最後。
圖：scratchpad 的 PNG → WebP（shots/、blender_renders/）。
用法：python3 docs/art-rebuild/second_ai/drafts/lib3f_lake_fill.py <scratchpad>"""
import json, os, sys
from PIL import Image
SP = sys.argv[1]
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..')); D = R + '/docs/art-rebuild/second_ai'

def webp(src, dst, q=82):
    Image.open(src).convert('RGB').save(dst, 'WEBP', quality=q, method=6); return os.path.basename(dst)

def shots_table(gdir, tag, labels):
    rows = ['| 鏡頭 | 修改前（程序化） | 修改後（Blender 正式模型） |', '|---|---|---|']
    for key, lab in labels:
        b, a = f'{gdir}/before_{key}.png', f'{gdir}/after_{key}.png'
        if not (os.path.exists(b) and os.path.exists(a)): rows.append(f'| {lab} | （沒有拍到） | （沒有拍到） |'); continue
        nb = webp(b, f'{D}/shots/{tag}_before_{key}.webp'); na = webp(a, f'{D}/shots/{tag}_after_{key}.webp')
        rows.append(f'| {lab} | ![修改前](shots/{nb}) | ![修改後](shots/{na}) |')
    return '\n'.join(rows)

def renders(rdir, prefix, tag, labels):
    out = []
    for key, lab in labels:
        p = f'{rdir}/{prefix}_{key}.png'
        if not os.path.exists(p): continue
        n = webp(p, f'{D}/blender_renders/{tag}_{key}.webp'); out.append(f'**{lab}**\n\n![](blender_renders/{n})\n')
    return '\n'.join(out)

def spec(js, extra=''):
    i = json.load(open(js))
    s = f"規格：GLB **{i['bytes'] / 1e6:.2f} MB**、網格 {i['objects']}（不重複 {i['unique_meshes']}）、材質 {i['materials']}、三角形 {i.get('tris_drawn', i['tris']):,}"
    return s + extra + '。'

# ---- 第 30 節：⑪ ----
L3 = json.load(open(R + '/assets/models/env/second_ai/library_3f.json'))
doc = open(D + '/drafts/lib3f_review.md').read()
doc = doc.replace('@@SPEC@@', spec(R + '/assets/models/env/second_ai/library_3f.json',
                                  f"（靜態 {L3['tris_static']:,}＋書 {L3['book_tris_drawn']:,}：{L3['book_modules']} 個書模組、{L3['book_instances']} 個 instance）；座位 {L3['seats']} 張（和 z.seats 一樣）"))
doc = doc.replace('@@SHOTS@@', shots_table(SP + '/lib3f/g', 'lib3f', [('entrance_1300', '從樓梯間的門口往裡看（13:00）'), ('tables_1300', '長桌與西牆書架（13:00）'),
    ('windows_1300', '後牆的窗與窗下矮書櫃（13:00）'), ('westshelf_1300', '西牆整面書架（13:00）'), ('lamp_1300', '桌燈、插座（13:00）'), ('door_1300', '樓梯間的門（13:00）'),
    ('entrance_2050', '晚上 20:30'), ('tables_2050', '晚上 20:30'), ('windows_2050', '晚上 20:30'), ('mobile_1300', '手機直向 390×844（跟隨鏡頭、有 HUD）')]))
doc = doc.replace('@@RENDERS@@', renders(SP + '/lib3f', 'l3', 'lib3f', [('entrance', '從門口往裡看'), ('tables', '長桌、檯燈、椅子、西牆書架'), ('windows', '後牆的窗、窗下矮書櫃'),
    ('westshelf', '西牆書架（參考書、期刊合訂本）'), ('lamp', '檯燈近看'), ('door', '樓梯間的門、出口標示燈、時鐘')]))
# ---- 第 31 節：⑩ ----
doc2 = open(D + '/drafts/lake_review.md').read()
LK = json.load(open(R + '/assets/models/env/second_ai/campus_lake.json'))
doc2 = doc2.replace('@@SPEC@@', spec(R + '/assets/models/env/second_ai/campus_lake.json', '（' + '、'.join(f'{k} {v:,}' for k, v in LK['tris_by_object'].items()) + '）'))
doc2 = doc2.replace('@@SHOTS@@', shots_table(SP + '/lake/g', 'lake', [('aerial_1300', '從上面看（13:00）'), ('pavilion_1300', '從南岸步道看湖心亭（13:00）'),
    ('boardwalk_1300', '站在木棧道起點（13:00）'), ('shore_1300', '從東岸看湖岸與置石（13:00）'), ('roof_1300', '在亭子裡往上看（13:00）'), ('pavilion_1775', '傍晚 17:45'),
    ('mobile_1300', '手機直向 390×844（站在木棧道上）')]))
doc2 = doc2.replace('@@RENDERS@@', renders(SP + '/lake', 'lk', 'lake', [('overview', '整體'), ('pavilion', '湖心亭'), ('boardwalk', '木棧道'), ('rim', '湖岸與置石'), ('roof', '亭子的天花、橫梁、雀替')]))
assert '@@' not in doc and '@@' not in doc2
p = D + '/VISUAL_REVIEW.md'; v = open(p).read()
assert '## 30. 總圖書館 3F' not in v and '## 31. 醉月湖' not in v
open(p, 'w').write(v.rstrip('\n') + '\n' + doc.rstrip('\n') + '\n' + doc2)
print('ok')
