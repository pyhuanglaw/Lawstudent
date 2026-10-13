"""VISUAL_REVIEW 第 24 節（坐著的聽眾替身）。
用法：python3 docs/art-rebuild/second_ai/drafts/seated_fill.py <Blender 渲染資料夾（fig_*.png、lod1_*.png）> <遊戲原型截圖資料夾（g_*.png）>"""
import json, os, subprocess, sys
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..')); D = R + '/docs/art-rebuild/second_ai'
BR, GM = sys.argv[1:3]


def webp(src, dst, w=None, q=84):
    im = Image.open(src).convert('RGB')
    if w and im.size[0] > w: im = im.resize((w, round(im.size[1] * w / im.size[0])), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=q, method=6)


info = json.load(open(R + '/assets/models/env/second_ai/seated_figures.json', encoding='utf8'))
spec = json.loads(subprocess.check_output(['python3', R + '/tools/blender/env_second/glb_specs.py', R + '/assets/models/env/second_ai/seated_figures.glb']).decode().strip().splitlines()[-1])
bases = '、'.join(f"`{b}` 原模型 {v['high_tris']:,} → LOD0 {v['lod0_tris']:,}／LOD1 {v['lod1_tris']:,}" for b, v in info['bases'].items())
V = {'spec': f"GLB **{spec['bytes'] / 1e6:.2f} MB**（貼圖集 2048×1024 WebP {spec['texture_KB']} KB）、網格 {spec['meshes']}、材質 {spec['materials']}。三角形：{bases}。"}
bl = []
LB = {'fig_front': '4 排×6 人：24 種外型（每排一個底模：聽講、滑手機、抄筆記×兩種配色），LOD0', 'fig_close': '近看（LOD0）', 'fig_side': '側面：屁股在座墊、背貼椅背、腳踩地、手在大腿／胸前／桌上（LOD0）', 'fig_back': '從後面看（LOD0）',
      'lod1_front': '同一個鏡頭，LOD1（約 350 個三角形，遠處用）', 'lod1_close': '近看 LOD1（只用在遠處：近看的樣子）'}
for n in ('fig_front', 'fig_close', 'fig_side', 'fig_back', 'lod1_front', 'lod1_close'):
    p = f'{BR}/{n}.png'
    if os.path.exists(p): webp(p, f'{D}/blender_renders/seated_{n}.webp', 1100); bl.append(f'**{LB[n]}**\n\n![](blender_renders/seated_{n}.webp)\n')
gm = []
GL = {'101': '博雅 101 最後一排後面的平台：新的講堂椅一排，坐 4 個替身（聽講×2、抄筆記、滑手機），2 張空位收起', '101_side': '同一排，側面',
      'lobby': '博雅大廳：自習桌坐 3 個替身（抄筆記×2、滑手機）、圓桌 2 個（聽講、抄筆記）；後面是原本的桌椅', 'mobile': '手機直向 390×844（跟隨鏡頭，有 HUD）'}
for n in ('101', '101_side', 'lobby', 'mobile'):
    p = f'{GM}/g_{n}.png'
    if os.path.exists(p): webp(p, f'{D}/shots/seated_game_{n}.webp', None if n == 'mobile' else 1100); gm.append(f'**{GL[n]}**\n\n![](shots/seated_game_{n}.webp)\n')
V['blender'] = '\n'.join(bl) or '（沒有）'; V['game'] = '\n'.join(gm) or '（沒有）'
tpl = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'seated_review.md'), encoding='utf8').read()
for k, v in V.items(): tpl = tpl.replace('@@' + k + '@@', str(v))
assert '@@' not in tpl
vr = D + '/VISUAL_REVIEW.md'; s = open(vr, encoding='utf8').read()
assert '## 24. 坐著的聽眾替身' not in s, '第 24 節已經在了（先 git checkout 再跑）'
open(vr, 'w', encoding='utf8').write(s.rstrip('\n') + '\n' + tpl)
print('ok', len(bl), len(gm))
