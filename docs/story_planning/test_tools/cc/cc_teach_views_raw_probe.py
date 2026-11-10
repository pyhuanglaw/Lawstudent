"""CC 教學館窗景原始拍攝（PUTONG101-WINDOW-1102，LAWWW 11-10 10:4x：開發分支 3c6c91bdd 接 LAWWW2 a43da6a27，博思一樓帷幕改亮灰藍；改前＝parent 35b88d5ff）。
tools/blender/env_second/shots/teach_views.py 在 import 就要 PIL（存 webp），PC 沒有 PIL——照 cc_views_raw_probe.py 的兩段做法：
第一段（PC，GPU）：照遊戲 worktree 的 teach_views.py 的 FOV／VIEWS／WIDE／TIMES（原文讀出來只 exec 設定那一段，不 import PIL），組同樣的 shots.json
  （寬照片 2048×512、其他 1024×512；白天 11:00、晚上 20:30；藏路人、玩家；鏡頭 pos／look；fov 53.13；wait 5000），跑同一支 tools/blender/env_second/shots/fast_shots.py，
  原始 PNG 存到 <out>/<名稱>_<day|night>.png（runner 推 <out>）；另存 teach_views_spec.json（拍攝規格）、teach_views_shots.txt（fast_shots 每張的 info 那一行）。
第二段（雲端，有 PIL）＝本檔 --cloud：python3 cc_teach_views_raw_probe.py --cloud <out 資料夾> <遊戲 repo 根目錄>
  照 teach_views.py 最後那一段：Image.open(png).convert('RGB').save(<repo>/assets/models/env/views/<名稱>_<day|night>.webp, 'WEBP', quality=80, method=6)——輸出檔和原本的工具一樣。
Playwright＋GPU 截圖，不是照片；不是 iPhone。
用法：LW_TESTS=<wt>/tests NAMES=putong_north python3 cc_teach_views_raw_probe.py <url> <out>（NAMES 逗號分隔，空＝teach_views.py 全部 9 個）"""
import os, sys, json, subprocess, tempfile, shutil


def cloud(outdir, root):
    """第二段：PNG → webp（照 teach_views.py 的參數）。只有這裡 import PIL"""
    from PIL import Image
    dst = os.path.join(root, 'assets', 'models', 'env', 'views'); os.makedirs(dst, exist_ok=True); n = 0
    for f in sorted(os.listdir(outdir)):
        if not f.endswith('.png') or not (f.endswith('_day.png') or f.endswith('_night.png')): continue
        out = os.path.join(dst, f[:-4] + '.webp')
        Image.open(os.path.join(outdir, f)).convert('RGB').save(out, 'WEBP', quality=80, method=6); n += 1
        print('wrote', os.path.relpath(out, root), os.path.getsize(out), 'bytes', flush=True)
    print('ALL PASS' if n else 'FAILED 1: %s 裡沒有 <名稱>_day／_night.png' % outdir, flush=True)
    return 0 if n else 1


if len(sys.argv) >= 2 and sys.argv[1] == '--cloud':
    sys.exit(cloud(sys.argv[2], sys.argv[3]))

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
WT = os.path.abspath(os.path.join(os.environ.get('LW_TESTS') or 'tests', '..'))
TV = os.path.join(WT, 'tools', 'blender', 'env_second', 'shots', 'teach_views.py')
FS = os.path.join(WT, 'tools', 'blender', 'env_second', 'shots', 'fast_shots.py')
NAMES = [n for n in (os.environ.get('NAMES') or 'putong_north').split(',') if n]
print('CC 教學館窗景原始拍攝：worktree %s；%s；Playwright＋GPU ≠ iPhone' % (os.popen('git -C "%s" rev-parse --short HEAD' % WT).read().strip(), NAMES), flush=True)
if not os.path.exists(TV) or not os.path.exists(FS):
    print('FAIL 找不到 %s 或 %s（這一版沒有 teach_views？）' % (TV, FS)); print('FAILED 1: 沒有工具'); sys.exit(1)
src = open(TV, encoding='utf-8').read()
seg = src[src.index('FOV = '):src.index('\ntmp = tempfile')]   # 只要設定那一段（FOV、VIEWS、WIDE、TIMES），不跑後面的 PIL
ns = {}; exec(seg, ns)
FOV, VIEWS, WIDE, TIMES = ns['FOV'], ns['VIEWS'], ns['WIDE'], ns['TIMES']
if os.environ.get('NAMES') == '': NAMES = list(VIEWS)
tmp = tempfile.mkdtemp(prefix='ccteach_'); shots = []; fails = []
for k in NAMES:
    if k not in VIEWS: print('FAIL 沒有這個窗景名稱 %s（有 %s）' % (k, list(VIEWS))); fails.append(k); continue
    zone, ppos, pos, look = VIEWS[k]
    print('  %s：區域 %s、玩家 %s、鏡頭 %s → %s、%s' % (k, zone, ppos, pos, look, '寬 2048×512' if k in WIDE else '1024×512'), flush=True)
    for t, h in TIMES.items():   # 和 teach_views.py 同一組欄位
        shots.append({'out': os.path.join(tmp, f'{k}_{t}.png'), 'w': 2048 if k in WIDE else 1024, 'h': 512, 'hideNPCs': True, 'hidePlayer': True,
                      'state': {'zone': zone, 'hour': h, 'pos': {'x': ppos[0], 'z': ppos[1], 'yaw': 0}}, 'cam': {'pos': pos, 'look': look},
                      'js': "GAME.E.camera.fov=%s; GAME.E.camera.updateProjectionMatrix();" % FOV, 'wait': 5000})
spec = os.path.join(tmp, 'shots.json'); json.dump(shots, open(spec, 'w'), indent=1)
shutil.copy(spec, os.path.join(OUT, 'teach_views_spec.json'))
GW = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tools', 'cc_local', 'gpu_wrap.py'))   # PC：fast_shots 寫死雲端 chromium 路徑＋SwiftShader，經 gpu_wrap 換成本機 chromium＋GPU
cmd = [sys.executable, GW, FS, URL, spec] if os.path.exists(GW) else [sys.executable, FS, URL, spec]   # gpu_wrap-ok（沒有 gpu_wrap＝雲端，直接跑）
print('  執行：%s' % ' '.join(os.path.basename(c) for c in cmd[1:3]), flush=True)
r = subprocess.run(cmd, capture_output=True, text=True, timeout=1500)
lines = [ln for ln in r.stdout.splitlines() if ln.startswith('shot ')]
open(os.path.join(OUT, 'teach_views_shots.txt'), 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
got = 0
for s in shots:
    if os.path.exists(s['out']) and os.path.getsize(s['out']) > 1000:
        shutil.copy(s['out'], os.path.join(OUT, os.path.basename(s['out']))); got += 1
        info = next((ln for ln in lines if s['out'] in ln), '')
        print('PASS 拍到 %s %s' % (os.path.basename(s['out']), info.split(s['out'], 1)[-1].strip()[:300]), flush=True)
    else:
        print('FAIL 沒拍到 %s' % os.path.basename(s['out'])); fails.append(os.path.basename(s['out']))
ok = got == len(shots) and len(shots) > 0 and r.returncode == 0 and not fails
if not ok: print('returncode %s；stderr：%s' % (r.returncode, r.stderr[-1500:]))
print('ALL PASS' if ok else 'FAILED %d: 拍到 %d／%d %s' % (len(fails) or 1, got, len(shots), '；'.join(fails)), flush=True)
sys.exit(0 if ok else 1)
