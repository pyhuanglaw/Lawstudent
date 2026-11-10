"""烘焙搬到使用者 PC 的第一張對照工作單（BAKE-PC-1102；BB 11-02 P1：「先用小場景做對照：雲端 CPU 和 PC Cycles GPU 各烘一次，比亮度和時間，一致才採用」，BB_229 第 1 條）。
小場景＝宿舍四人房（DORM-LOFT-SCALE-1102 的新房間 4.2×7 m），和 bake_dorm_room4.sh 同一組燈、天空、外殼、隱藏規則，只是貼圖小、取樣少。
輸入：同資料夾的 dorm_room4_bakein.glb（dorm_room4.py --bakeblock 匯出、已 commit；PC 不用先跑建模）。

CC runner（tools/cc_local/run_queue.py）的 KIND=blender 會這樣跑：
  blender -b --python-exit-code 1 --python <worktree>/tools/blender/env_second/lightbake/pc_ref/pc_bake_dorm_ref.py -- --out {out} [--res 512] [--samples 256]
  環境變數 CC_BLENDER_DEVICE＝HIP（PC 的 RX 6600M）→ GPU；CPU 或沒設 → CPU（bake_room.py 開頭那一段）。
雲端參考：/opt/blenv/bin/python tools/blender/env_second/lightbake/pc_ref/pc_bake_dorm_ref.py -- --out <資料夾>
輸出（--out 資料夾）：d.glb、d_day.png、d_night.png、d_dark.png、d.json（device、blender 版本、bake_seconds…）、stats.json（三張的平均亮度、總秒數）。
比較：python3 tools/blender/env_second/lightbake/pc_ref/compare_bakes.py <雲端資料夾> <PC 資料夾>
"""
import os, sys, json, time, runpy

A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(k, d=None): return A[A.index(k) + 1] if k in A else d
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(arg('--out', os.path.join(HERE, 'out')))
RES = arg('--res', '512'); SAMPLES = arg('--samples', '256')
os.makedirs(OUT, exist_ok=True)

# 和 bake_dorm_room4.sh 同一組（11-02 房間 4.2 m 寬：燈條 x ±1.685、z −2.4725／0.1175、高 1.64；洗手間的燈在洗手間中間）
LED = '0.03,0.8,1.0,0.88,0.72'
LIGHTS = '0,0,-1.7,-1.7,2.95,1,1,35,0.4,0.4;0,0,0.7,0.7,2.95,1,1,35,0.4,0.4;1.325,1.325,2.6,2.6,2.95,1,1,10,0.22,0.22'
for X in ('1.685', '-1.685'):
    LIGHTS += ';%s,%s,-2.4725,-2.4725,1.64,1,1,9,%s;%s,%s,0.1175,0.1175,1.64,1,1,9,%s' % (X, X, LED, X, X, LED)
ARGS = ['--in', os.path.join(HERE, 'dorm_room4_bakein.glb'), '--out', os.path.join(OUT, 'd.glb'), '--lm', os.path.join(OUT, 'd'),
        '--res', RES, '--samples', SAMPLES,
        '--hide', 'glass|^Y203_|^Y412_|^Y312_|^Y507_|^Y409_|^Y205_|^NAMETAG_|^ROOMMATE_|^JACKET_',
        '--nolm', 'tubes|fixtures|dorm_led|dorm_items|dorm_metal|chrome|black|_rod|mirror|shower|sign|bath_outer|BAKEONLY',
        '--sun', '180,55,0', '--sky', '3.0', '--lights', LIGHTS, '--daylights', '0.7', '--smooth', '2', '--shell', 'N', '--drop', 'BAKEONLY',
        '--dark', '--darksky', '0.045', '--darkpoints', '0.4,2.2,-8.5,450,1.0,0.75,0.45']

T0 = time.time()
sys.argv = [sys.argv[0], '--'] + ARGS
runpy.run_path(os.path.join(HERE, '..', 'bake_room.py'), run_name='__main__')
total = round(time.time() - T0, 1)

# 三張光照貼圖的平均亮度（Blender 讀 PNG：0～1 線性存的值，bake_room.py 存的是 (光/π)/scale）
import bpy
import numpy as np
st = {'res': int(RES), 'samples': int(SAMPLES), 'total_seconds': total, 'images': {}}
try: st.update({k: v for k, v in json.load(open(os.path.join(OUT, 'd.json'), encoding='utf-8')).items() if k in ('device', 'blender', 'bake_seconds')})
except Exception as e: st['json_error'] = str(e)
for k in ('day', 'night', 'dark'):
    p = os.path.join(OUT, 'd_%s.png' % k)
    if not os.path.exists(p): st['images'][k] = None; continue
    im = bpy.data.images.load(p); px = np.array(im.pixels[:], dtype=np.float32).reshape(-1, 4)
    used = px[:, 3] > 0.5 if px[:, 3].min() < 0.5 else np.ones(len(px), bool)
    lum = px[used, :3] @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    st['images'][k] = {'mean': round(float(lum.mean()), 5), 'p50': round(float(np.percentile(lum, 50)), 5), 'p95': round(float(np.percentile(lum, 95)), 5), 'pixels': int(used.sum())}
json.dump(st, open(os.path.join(OUT, 'stats.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('PCBAKE', json.dumps(st, ensure_ascii=False), flush=True)
