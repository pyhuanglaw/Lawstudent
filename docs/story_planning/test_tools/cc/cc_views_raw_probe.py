"""CC 窗景原始拍攝（WINVIEW cvs 重拍，LAWWW 10:12／10:15：PC 沒有 PIL／numpy，shop_views_layers.py 在 import 就會死）——兩段做法的第一段：
PC（GPU）只拍：照遊戲 worktree 的 tools/shots/shop_views_layers.py 的 VIEWS／TIMES／FOV／WAIT_ASSETS／LAYERS（原文讀出來 exec 那一段，不 import PIL），
組同樣的 shots.json，跑 tools/blender/env_second/shots/fast_shots.py，把 post 回傳的三張（far／nb／nw）base64 直接寫成 PNG、景深寫 json——全部放在 <out>（runner 推 cc-local）。
第二段（雲端，有 PIL）：用 shop_views_layers 的 matte() 把 nb／nw 去背成 <名稱>_near_<day|night>.webp、far 存 <名稱>_<day|night>.webp、景深併進 json。
Playwright＋GPU 截圖（D131），不是照片。用法：LW_TESTS=<wt>/tests NAMES=cvs python3 cc_views_raw_probe.py <url> <out>"""
import os, sys, json, base64, subprocess, tempfile
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
WT = os.path.abspath(os.path.join(os.environ.get('LW_TESTS') or 'tests', '..'))
NAMES = [n for n in (os.environ.get('NAMES') or 'cvs').split(',') if n]
src = open(os.path.join(WT, 'tools', 'shots', 'shop_views_layers.py'), encoding='utf-8').read()
seg = src[src.index('FOV = '):src.index('\ndef png(')]          # 只要設定那一段（VIEWS、FADE、TIMES、WAIT_ASSETS、LAYERS），不跑後面的 PIL
ns = {}; exec(seg, ns)
VIEWS, TIMES, FOV, WAIT_ASSETS, LAYERS = ns['VIEWS'], ns['TIMES'], ns['FOV'], ns['WAIT_ASSETS'], ns['LAYERS']
print('CC 窗景原始拍攝：worktree %s；%s；Playwright＋GPU ≠ iPhone' % (os.popen('git -C "%s" rev-parse --short HEAD' % WT).read().strip(), NAMES), flush=True)
tmp = tempfile.mkdtemp(prefix='ccviews_'); shots = []
for k in NAMES:
    if k not in VIEWS: print('FAIL 沒有這個窗景名稱 %s（有 %s）' % (k, list(VIEWS))); continue
    zone, ppos, pos, look, D, *top = VIEWS[k]
    print('  %s：區域 %s、玩家 %s、鏡頭 %s → %s、D %s、TOP %s' % (k, zone, ppos, pos, look, D, top[0] if top else 99), flush=True)
    for t, h in TIMES.items():
        shots.append({'out': os.path.join(tmp, f'{k}_{t}.png'), 'w': 1024, 'h': 512, 'hideNPCs': True, 'hidePlayer': True,
                      'state': {'zone': zone, 'hour': h, 'pos': {'x': ppos[0], 'z': ppos[1], 'yaw': 0}}, 'cam': {'pos': pos, 'look': look},
                      'js': "(async()=>{ %s GAME.E.camera.fov=%s; GAME.E.camera.updateProjectionMatrix(); })()" % (WAIT_ASSETS, FOV), 'wait': 5000, 'post': LAYERS % (D, top[0] if top else 99)})
spec = os.path.join(tmp, 'shots.json'); json.dump(shots, open(spec, 'w'), indent=1)
r = subprocess.run([sys.executable, os.path.join(WT, 'tools/blender/env_second/shots/fast_shots.py'), URL, spec], capture_output=True, text=True, timeout=1500)
depth = {}; fails = []
for line in r.stdout.splitlines():
    if line.startswith('shotfail'): print(line[:300]); fails.append(line[:120]); continue
    if not line.startswith('post '): continue
    _, out, js = line.split(' ', 2); d = json.loads(js); name = os.path.basename(out)[:-4]
    imgs = d.pop('imgs')
    for kk in ('far', 'nb', 'nw'): open(os.path.join(OUT, f'{name}_{kk}.png'), 'wb').write(base64.b64decode(imgs[kk].split(',', 1)[1]))
    depth[name] = d; print('PASS 拍到 %s %s' % (name, json.dumps(d, ensure_ascii=False)), flush=True)
json.dump(depth, open(os.path.join(OUT, 'views_depth.json'), 'w'), indent=1, ensure_ascii=False)
for f in os.listdir(tmp):
    if f.endswith('.png'):   # fast_shots 的一般截圖（有 HUD 藏起來的那張）也留著對照
        os.replace(os.path.join(tmp, f), os.path.join(OUT, 'plain_' + f))
ok = len(depth) == len(shots) and not fails
if not ok: print('stderr：', r.stderr[-1500:])
print('ALL PASS' if ok else 'FAILED %d: 拍到 %d／%d %s' % (len(shots) - len(depth) or 1, len(depth), len(shots), '；'.join(fails)), flush=True)
sys.exit(0 if ok else 1)
