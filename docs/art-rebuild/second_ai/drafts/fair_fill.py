"""VISUAL_REVIEW 第 28 節（社團博覽會的攤位）。
用法：python3 docs/art-rebuild/second_ai/drafts/fair_fill.py <配置圖 plan.png> <plan.json> <Blender 渲染資料夾> <遊戲原型截圖資料夾（g_*.png）>"""
import json, os, subprocess, sys
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..')); D = R + '/docs/art-rebuild/second_ai'
PLAN, PJ, BR, GM = sys.argv[1:5]


def webp(src, dst, w=None, q=84):
    im = Image.open(src).convert('RGB')
    if w and im.size[0] > w: im = im.resize((w, round(im.size[1] * w / im.size[0])), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=q, method=6)


webp(PLAN, f'{D}/shots/fair_plan.webp', 1400, q=90)
info = json.load(open(R + '/assets/models/env/second_ai/club_fair.json', encoding='utf8')); M = info['modules']
spec = json.loads(subprocess.check_output(['python3', R + '/tools/blender/env_second/glb_specs.py', R + '/assets/models/env/second_ai/club_fair.glb']).decode().strip().splitlines()[-1])
plan = json.load(open(PJ, encoding='utf8'))
WHAT = {'hiking': '山的背板、登山背包、登山杖', 'lawclub': '天平的背板、一疊書、金色天平', 'info': '攤位地圖的背板、社團地圖看板（互動點在這一攤前面）', 'guitar': '吉他的背板、吉他（琴架）、小音箱',
        'debate': '正方／反方的背板、講台', 'basketball': '籃球的背板、球袋、籃球', 'bg1': '相機腳架、照片（藍色帆布）', 'bg2': '桌遊盒', 'bg3': '手作'}
rows = []
for b in plan['booths']:
    m = M['booth_' + b['id']]
    rows.append(f"| {m['name']} | `booth_{b['id']}` | ({b['x']}, {b['z']}) | π | {WHAT[b['id']]}；{m['tris']} 個三角形 |")
V = {'plan': '![](shots/fair_plan.webp)\n', 'booths': '\n'.join(rows),
     'spec': f"規格：GLB **{spec['bytes'] / 1e6:.2f} MB**（貼圖 {', '.join(f'{k}×{v}' for k, v in spec['texture_sizes'].items())}，WebP 共 {spec['texture_KB']} KB）、網格 {spec['meshes']}（＝draw call，九個攤位都畫的時候）、材質 {spec['materials']}、三角形合計 {spec['tris_unique']:,}（一攤 690–1,060）。"}
gm = []
GL = {'avenue': '從大道北側往東南看：九頂帳篷沿南側草地排開（大王椰子在前面，走路空間空著）', 'front': '玩家站在服務台前面（互動點）看到的樣子', 'east': '從東邊（長椅 x=0 附近）往西看：系籃、背景攤、長椅',
      'aerial': '從上面看：帳篷的位置、長椅、路燈、走路空間', 'mobile': '手機直向 390×844（跟隨鏡頭，有 HUD；站在互動點前面）'}
for n in GL:
    p = f'{GM}/g_{n}.png'
    if os.path.exists(p): webp(p, f'{D}/shots/fair_game_{n}.webp', None if n == 'mobile' else 1100); gm.append(f'**{GL[n]}**\n\n![](shots/fair_game_{n}.webp)\n')
bl = []
LB = {'fair_row': '九個攤位（從大道往南看）', 'fair_clubs': '五個社團＋服務台（近一點）', 'fair_close': '近看：桌巾、易拉展、傳單、報名表、吉他、登山背包', 'fair_back': '從後面看（背板的背面、椅子、音箱）'}
for n in LB:
    p = f'{BR}/{n}.png'
    if os.path.exists(p): webp(p, f'{D}/blender_renders/{n}.webp', 1100); bl.append(f'**{LB[n]}**\n\n![](blender_renders/{n}.webp)\n')
webp(R + '/tools/blender/env_second/textures/gen/club_fair_atlas.png', f'{D}/blender_renders/fair_atlas.webp', 1400, q=88)
bl.append('**貼圖集（2048×1024，程式畫）**：左邊垂簾、中間桌巾與易拉展、右邊背板、最右邊純色小格\n\n![](blender_renders/fair_atlas.webp)\n')
V['game'] = '\n'.join(gm) or '（沒有）'; V['blender'] = '\n'.join(bl)
tpl = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fair_review.md'), encoding='utf8').read()
for k, v in V.items(): tpl = tpl.replace('@@' + k + '@@', str(v))
assert '@@' not in tpl
vr = D + '/VISUAL_REVIEW.md'; s = open(vr, encoding='utf8').read()
assert '## 28. 社團博覽會' not in s, '第 28 節已經在了（先 git checkout 再跑）'
open(vr, 'w', encoding='utf8').write(s.rstrip('\n') + '\n' + tpl)
print('ok', len(gm), len(bl))
