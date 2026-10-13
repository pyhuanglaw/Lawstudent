"""VISUAL_REVIEW 第 20 節（共同教學館）、第 21 節（大一女舍）＋新社科院規劃文件第 8 節（現況截圖）。
用法：python3 docs/art-rebuild/second_ai/drafts/gtfd_fill.py <遊戲截圖資料夾> <共同 Blender 渲染> <大一女舍 Blender 渲染>
遊戲截圖資料夾裡：after.log（有 GLB；本機接線）、before.log（共同的修改前＝套件）、before2.log（大一女舍的修改前＋共同的手機直向修改前）"""
import json, os, re, sys
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..')); D = R + '/docs/art-rebuild/second_ai'
G, BG, BF = sys.argv[1:4]


def webp(src, dst, w=None, q=84):
    im = Image.open(src).convert('RGB')
    if w and im.size[0] > w: im = im.resize((w, round(im.size[1] * w / im.size[0])), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=q, method=6)


def posts(path):
    out = {}
    if not os.path.exists(path): return out
    for line in open(path, encoding='utf8'):
        m = re.match(r'post (\S+) (\{.*\})$', line.strip())
        if m: out[os.path.basename(m.group(1))[:-4]] = json.loads(m.group(2))
    return out


def errs(path):
    return [l.strip()[:200] for l in open(path, encoding='utf8') if l.startswith('shot') and 'errors: []' not in l] if os.path.exists(path) else []


PA, PB, PB2 = posts(G + '/after.log'), posts(G + '/before.log'), posts(G + '/before2.log')
PA.update(posts(G + '/after_fd.log'))      # 大一女舍第二版（面磚調亮、粉刷換平整漆面）重拍的那 7 張
PBall = dict(PB); PBall.update(PB2)          # b_mobile：before2 那一次（原本的 zones3d，大樹牆沒拿掉）
E = errs(G + '/after.log') + errs(G + '/before.log') + errs(G + '/before2.log') + errs(G + '/after_fd.log')
os.makedirs(D + '/shots', exist_ok=True); os.makedirs(D + '/blender_renders', exist_ok=True)


def pair(pre, names):
    for n in names:
        for t, p in (('a', 'after'), ('b', 'before')):
            src = f'{G}/{t}_{n}.png'
            if os.path.exists(src): webp(src, f'{D}/shots/{pre}_{p}_{n}.webp', w=1100 if 'mobile' not in n else None)


def perf(names, label):
    rows = []
    for n in names:
        a, b = PA.get('a_' + n), PBall.get('b_' + n)
        if not a or not b: continue
        rows.append(f"| {label[n]} | {b['calls']}／{b['tris']:,} | {a['calls']}／{a['tris']:,} | ×{a['calls'] / b['calls']:.2f}／×{a['tris'] / b['tris']:.2f} |")
    return '\n'.join(rows)


def spec(path):
    import subprocess
    return json.loads(subprocess.check_output(['python3', R + '/tools/blender/env_second/glb_specs.py', path]).decode().strip().splitlines()[-1])


# ---------------- 共同教學館 ----------------
GTN = ['front_axis', 'front_ne', 'front_nw', 'porch', 'arcade', 'corridor', 'south', 'aerial', 'ne_1730', 'axis_2000', 'follow', 'mobile']
GTL = {'front_axis': '從椰林大道往南看正門（11:00）', 'front_ne': '東北邊（11:00）', 'front_nw': '西北邊：西翼山牆、行政大樓（11:00）', 'porch': '門廊近看（11:00）',
       'arcade': '一樓拱廊裡（11:00）', 'corridor': '西側：兩棟中間的木造走廊（11:00）', 'south': '舟山路那一側（南面：退縮的露台、開放走廊）（11:00）', 'aerial': '空拍（11:00）',
       'ne_1730': '東北邊 17:30', 'axis_2000': '從椰林大道往南看正門 20:00', 'follow': '跟隨鏡頭：玩家在正門前（11:00）', 'mobile': '手機直向 390×844：正門前'}
pair('gongtong', GTN)
for n in ('front', 'front_ne', 'front_nw', 'south', 'aerial', 'corridor', 'gable', 'porch', 'arcade', 'palms', 'loggia'):
    if os.path.exists(f'{BG}/gt_{n}.png'): webp(f'{BG}/gt_{n}.png', f'{D}/blender_renders/gongtong_{n}.webp', w=1100)
sg = spec(R + '/assets/models/env/second_ai/campus_gongtong.glb')
gt_shots = '\n'.join(f"| {GTL[n]} | ![](shots/gongtong_before_{n}.webp) | ![](shots/gongtong_after_{n}.webp) |" for n in GTN if os.path.exists(f'{D}/shots/gongtong_after_{n}.webp'))
gt_blender = '\n'.join(f"![](blender_renders/gongtong_{n}.webp)" for n in ('front', 'porch', 'gable', 'arcade', 'front_nw', 'corridor', 'palms', 'south', 'loggia', 'front_ne', 'aerial') if os.path.exists(f'{D}/blender_renders/gongtong_{n}.webp'))

# ---------------- 大一女舍 ----------------
FDN = ['fd_street', 'fd_ne', 'fd_entrance_a', 'fd_bridge', 'fd_follow', 'fd_street_2000', 'fd_mobile']
FDL = {'fd_street': '從舟山路看兩棟與天橋（11:00）', 'fd_ne': '東北邊（11:00）', 'fd_entrance_a': 'A 棟門口：傳達室小窗、信箱、男賓止步（11:00）', 'fd_bridge': '二樓天橋底下（11:00）',
       'fd_follow': '跟隨鏡頭：玩家在門口長椅旁（11:00）', 'fd_street_2000': '從舟山路看 20:00', 'fd_mobile': '手機直向 390×844：門口長椅旁'}
pair('freshman', FDN)
for n in ('front', 'ne', 'entrance_a', 'entrance_b', 'bridge', 'back', 'aerial'):
    if os.path.exists(f'{BF}/fd_{n}.png'): webp(f'{BF}/fd_{n}.png', f'{D}/blender_renders/freshman_{n}.webp', w=1100)
sf = spec(R + '/assets/models/env/second_ai/campus_freshman.glb')
fd_shots = '\n'.join(f"| {FDL[n]} | ![](shots/freshman_before_{n}.webp) | ![](shots/freshman_after_{n}.webp) |" for n in FDN if os.path.exists(f'{D}/shots/freshman_after_{n}.webp'))
fd_blender = '\n'.join(f"![](blender_renders/freshman_{n}.webp)" for n in ('front', 'entrance_a', 'entrance_b', 'bridge', 'ne', 'back', 'aerial') if os.path.exists(f'{D}/blender_renders/freshman_{n}.webp'))

# ---------------- 新社科院現況 ----------------
SOCN = ['soc_plaza', 'soc_front', 'law_aerial', 'linze_to_soc']
SOCL = {'soc_plaza': '法學院廣場西北邊往東看（萬才館、黑森林、社科院）', 'soc_front': '社科院正面（門前 7 根白色圓柱＝原型）', 'law_aerial': '空拍：霖澤館（左）、萬才館（中）、黑森林、社科院（右）',
        'linze_to_soc': '從霖澤館門口往東看社科院'}
pair('socsci_now', SOCN)

ERRTXT = '沒有 JavaScript 錯誤' if not E else '有錯誤：' + '；'.join(E[:3])
tpl = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gtfd_review.md'), encoding='utf8').read()
V = dict(gt_bytes=f"{sg['bytes'] / 1e6:.2f}", gt_tris=f"{sg['tris_unique']:,}", gt_calls=sg['draw_calls_approx'], gt_mats=sg['materials'], gt_tex=sg['texture_sizes'], gt_texkb=sg['texture_KB'],
         fd_bytes=f"{sf['bytes'] / 1e6:.2f}", fd_tris=f"{sf['tris_unique']:,}", fd_calls=sf['draw_calls_approx'], fd_mats=sf['materials'], fd_tex=sf['texture_sizes'], fd_texkb=sf['texture_KB'],
         gt_perf=perf(GTN, GTL), fd_perf=perf([n for n in FDN if n != 'fd_street_2000'], FDL), gt_shots=gt_shots, fd_shots=fd_shots, gt_blender=gt_blender, fd_blender=fd_blender, errtxt=ERRTXT)
doc = tpl
for k, v in V.items(): doc = doc.replace('@@' + k + '@@', str(v))
assert '@@' not in doc, re.findall(r'@@\w+@@', doc)
vr = D + '/VISUAL_REVIEW.md'; s = open(vr, encoding='utf8').read()
assert '## 20. 共同教學館' not in s, '第 20 節已經在了（先 git checkout 再跑）'
open(vr, 'w', encoding='utf8').write(s.rstrip('\n') + '\n' + doc)
soc_rows = '\n'.join(f"| {SOCL[n]} | ![](../shots/socsci_now_before_{n}.webp) | ![](../shots/socsci_now_after_{n}.webp) |" for n in SOCN if os.path.exists(f'{D}/shots/socsci_now_after_{n}.webp'))
sp = D + '/research/新社科院_參考資料與規劃.md'; t = open(sp, encoding='utf8').read()
t = t.replace('（遊戲畫面截圖：第 8 節，跑完補上）', '（遊戲畫面截圖：第 8 節）').replace('## 8. 遊戲畫面（現況）\n\n（截圖跑完補上）\n',
              '## 8. 遊戲畫面（現況，Playwright＋SwiftShader，11:00；不是 iPhone）\n\n左＝現在 LAWWW 開發分支的樣子（套件方盒＋白色圓柱）；右＝把我之前做的 ⑤ `campus_modern.glb` 接上（本機測試；**通用白色系館，不是新社科院，不沿用**），給使用者比較量體與位置。\n\n| 鏡頭 | 現在（套件） | ⑤ 通用系館（參考） |\n|---|---|---|\n' + soc_rows + '\n')
open(sp, 'w', encoding='utf8').write(t)
print('ok', len(PA), len(PB), len(PB2), E[:2])
