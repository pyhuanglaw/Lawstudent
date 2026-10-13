"""CAMERA_WALLS.md 第 6 節：LAWWW 第一階段修正（068f671 鏡頭自動轉開、公告欄擋鏡頭；8234015 聽眾先坐好）之後，同一份案例重拍。
用法：python3 docs/art-rebuild/second_ai/drafts/camera_round2_fill.py <scratchpad/camcases> <scratchpad/seatprobe> <LAWWW commit>
資料夾：before、after（第一輪 dae1da3）、r2（第二輪：<id>＝鏡頭剛拖過、<id>_swing＝放開 3 秒）、door_before、door_after、r2door；seatprobe/before.json、after.json"""
import json, os, sys
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..')); D = R + '/docs/art-rebuild/second_ai'
CC, SPR, COMMIT = sys.argv[1:4]
os.makedirs(D + '/shots/cam1013', exist_ok=True)


def load(p):
    d = {}
    if not os.path.exists(p): return d
    for l in open(p, encoding='utf8'):
        if l.startswith('case '): r = json.loads(l[5:]); d[r['id']] = r
    return d


def st(r):
    if not r: return '—'
    return ('**牆後**' if r['behindWall'] else '牆前') + f"、{r['horizDist']:.2f}／{r['cam'][1] - r['head'][1]:+.2f}"


def webp(src, dst):
    im = Image.open(src).convert('RGB'); im = im.resize((640, round(im.size[1] * 640 / im.size[0])), Image.LANCZOS); im.save(dst, 'WEBP', quality=80, method=6)


rows, pics, stats = [], [], {'r2_behind': 0, 'r2s_behind': 0, 'n': 0, 'close_held': 0, 'close_swing': 0}
for grp, (b, a1, a2) in (('一般', ('before', 'after', 'r2')), ('門口', ('door_before', 'door_after', 'r2door'))):
    B, A1, A2 = load(f'{CC}/{b}/cases.log'), load(f'{CC}/{a1}/cases.log'), load(f'{CC}/{a2}/cases.log')
    for k in B:
        if k.endswith('_spawn') and grp == '門口': continue
        r0, r1, r2, r2s = B.get(k), A1.get(k), A2.get(k), A2.get(k + '_swing')
        if k.endswith('_spawn'): r2s = None
        if not k.endswith('_spawn'):
            stats['n'] += 1; stats['r2_behind'] += bool(r2 and r2['behindWall']); stats['r2s_behind'] += bool(r2s and r2s['behindWall'])
            stats['close_held'] += bool(r2 and r2['horizDist'] < 1.0); stats['close_swing'] += bool(r2s and r2s['horizDist'] < 1.0)
        note = ''
        if r1 and r1['horizDist'] < 1.0 and r2s and r2s['horizDist'] >= 1.5: note = '第一輪貼到頭頂上方 → 放開後轉開'
        elif r2s and r2s['horizDist'] < 1.0: note = '放開後還是很近'
        rows.append(f"| `{k}` | {grp} | {st(r0)} | {st(r1)} | {st(r2)} | {st(r2s)} | {note} |")
        if r1 and (r1['horizDist'] < 1.0 or k == 'putong_1F_2') or k.endswith('_spawn'):
            for tag, src in (('r2', f'{CC}/{a2}/{k}.png'), ('r2s', f'{CC}/{a2}/{k}_swing.png')):
                if os.path.exists(src): webp(src, f'{D}/shots/cam1013/{tag}_{k}.webp')
            r2s_img = f'![](shots/cam1013/r2s_{k}.webp)' if os.path.exists(f'{CC}/{a2}/{k}_swing.png') else '—'
            pics.append(f"| `{k}` | ![](shots/cam1013/before_{k}.webp) | ![](shots/cam1013/after_{k}.webp) | ![](shots/cam1013/r2_{k}.webp) | {r2s_img} |")
# 聽眾
sp, spf = {}, {}
for k in ('before', 'after'):
    p = f'{SPR}/{k}.json'
    if os.path.exists(p): j = json.load(open(p, encoding='utf8')); sp[k] = j['summary']; spf[k] = j.get('frames') or []
for k in ('before', 'after'):
    for t in ('t0', 't5'):
        src = f'{SPR}/{k}_{t}.png'
        if os.path.exists(src): webp(src, f'{D}/shots/cam1013/seat_{k}_{t}.webp')


def srow(name, s, frames):
    if not s: return f'| {name} | 沒跑 | | | |'
    f = s.get('frames', {}); f0 = frames[0] if frames else None
    first = f"{f0['standing']} 人站著、{f0['seated']} 人坐著" if f0 else '—'
    return (f"| {name} | **{f.get('frames_with_standing', '—')}／{f.get('checked', '—')}**（最多 {f.get('max_standing', '—')} 人） | {first} | "
            f"{s['t1']['standing(>0.75)']}／{s['t1']['measured']} 站著 | {s['t5']['standing(>0.75)']}／{s['t5']['measured']} 站著 |")


txt = f"""
## 6. 第二輪：LAWWW 第一階段修正之後（`{COMMIT}`；同一份案例重拍）

LAWWW `068f671`：被隔間牆拉近到 1.5 m 以內、沒有在拖鏡頭時，鏡頭**自動轉開**（試 ±30／60／90°，每秒約 75°）、拉近時看的點往前移、貼牆抬高最多 0.9 m；公告欄加進鏡頭碰撞。`8234015`：座位上的人先套好坐姿再畫。
重拍方法（LAWWW 建議）：每個案例兩張——**剛拖過鏡頭**（`manualT=999`，不會自動轉，看抬高變少、往前看的效果）、**放開 3 秒**（`manualT=0`，等遊戲時間 3 秒）。工具：`cam_cases_shots.py --swing`。Playwright＋SwiftShader，**不是 iPhone**。

### 6.1 結果

| 項目 | 修改前（`babb8c8`） | 第一輪（`dae1da3`） | 第二輪：剛拖過鏡頭 | 第二輪：放開 3 秒 |
|---|---|---|---|---|
| 鏡頭在牆後（{stats['n']} 個案例：一般 24＋門口 12） | 21 | 0 | {stats['r2_behind']} | {stats['r2s_behind']} |
| 鏡頭水平離頭不到 1 m（貼到頭頂上方） | — | 10 | {stats['close_held']} | {stats['close_swing']} |

（「牆後」＝鏡頭和頭的連線穿過那一層的隔間牆；格式「牆前、水平距離／比頭高」，單位公尺。）

| 案例 | 組 | 修改前 | 第一輪 | 第二輪：剛拖過 | 第二輪：放開 3 秒 | 備註 |
|---|---|---|---|---|---|---|
""" + '\n'.join(rows) + """

### 6.2 截圖（第一輪貼到頭頂上方的 10 個案例、公告欄案例、剛進門）

| 案例 | 修改前 | 第一輪 | 第二輪：剛拖過 | 第二輪：放開 3 秒 |
|---|---|---|---|---|
""" + '\n'.join(pics) + f"""

### 6.3 聽眾剛出現時是不是坐好了（`8234015`；`boya_seat_probe2.py`）

[前置／捷徑] 讀檔進博雅大廳、鏡頭看著 101 的座位，加一場測試演講（16 人）；在 `E.render` 的開頭呼叫 `CLS.syncRooms`（＝遊戲的課堂、人流加人物的時間點：E.update 之後、畫面之前），然後每一個畫面都數畫出來的聽眾裡有幾個是站著的（臀部離座位地面 0.75 m 以上；模型還在載入的不算）。

| 版本 | 前 60 個畫面裡，畫出站著的聽眾的畫面數 | 第一個畫面 | 1 秒後 | 5 秒後 |
|---|---|---|---|---|
{srow('修改前（`dae1da3`）', sp.get('before'), spf.get('before'))}
{srow(f'修改後（`{COMMIT}`）', sp.get('after'), spf.get('after'))}

**結論**：修改前，聽眾在「E.update 之後、畫面之前」加進來的那一個畫面，16 個人**全部是站姿**（下一個畫面才坐下：手機 60 fps 是閃一下，低幀率的手機看得到）；修改後第一個畫面就坐好了。這個測試在修改前失敗、修改後通過。
（第一版的檢查報告寫「前十幾秒有一半是站姿」：那是讀了畫面外的人的骨架——畫面外不跑動畫——LAWWW 指出後改成只數畫面上畫出來的人。）

| 版本 | 出現後第一個畫面 | 5 秒 |
|---|---|---|
| 修改前 | ![](shots/cam1013/seat_before_t0.webp) | ![](shots/cam1013/seat_before_t5.webp) |
| 修改後 | ![](shots/cam1013/seat_after_t0.webp) | ![](shots/cam1013/seat_after_t5.webp) |
"""
p = D + '/CAMERA_WALLS.md'; s = open(p, encoding='utf8').read()
assert '## 6. 第二輪' not in s
open(p, 'w', encoding='utf8').write(s.rstrip('\n') + '\n' + txt)
print('ok', stats, {k: v.get('frames') for k, v in sp.items()})
