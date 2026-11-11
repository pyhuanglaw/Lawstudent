"""烘焙搬到使用者 PC 的第二張工作單（BAKE-PC-1102-S2；BB 11-03 01:12 代轉：「BK1 亮度一致；再排大場景（3F 或展演廳），HIP 連跑兩次、只算第二次的時間；GPU 還是比較慢就改 PC 的 CPU 烘」）。
大場景＝總圖 3F 閱覽區第二版（library_3f_v2，約 670 m²、64 片燈板＋93 顆點光源），和 bake_library_3f_v2.sh 正式烘焙同一組燈、太陽、天空、外殼、--nolm、--keep-instances。
輸入：同資料夾的 library_3f_v2_bakein.glb（library_3f_v2.py --layout src/data/library_3f_layout.js 匯出、已 commit；PC 不用先跑建模、不需要系統 python）。
燈和點光源：照 ../library_3f_v2_lm.json（上一次正式烘焙 bake_library_3f_v2.sh 實際用的那一組，這裡寫死一份，正式腳本以後改燈不影響這張對照）。

CC runner（tools/cc_local/run_queue.py）的 KIND=blender 會這樣跑：
  blender -b --python-exit-code 1 --python <worktree>/tools/blender/env_second/lightbake/pc_ref/pc_bake_3f_ref.py -- --out {out} [--res 1024] [--samples 512]
  環境變數 CC_BLENDER_DEVICE＝HIP（PC 的 RX 6600M）→ GPU；CPU 或沒設 → CPU（bake_room.py 開頭那一段）。
輸出（--out 資料夾）：d.glb、d_day.png、d_night.png、d.json（device、blender 版本、bake_seconds…）、stats.json（兩張的平均亮度、總秒數）。
比較（同一台 PC、同一個 Blender 版本，UV 一樣，可以逐像素比）：
  python3 tools/blender/env_second/lightbake/pc_ref/compare_bakes.py <PC CPU 資料夾> <PC HIP 資料夾>
雲端只用小參數試跑過 driver 能不能跑完（雲端和 PC 的 Blender 版本不同，UV 排法不同，不能逐像素比：BK1 的教訓）。
"""
import os, sys, json, time, runpy

A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(k, d=None): return A[A.index(k) + 1] if k in A else d
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(arg('--out', os.path.join(HERE, 'out')))
RES = arg('--res', '1024'); SAMPLES = arg('--samples', '512')
os.makedirs(OUT, exist_ok=True)

# 上一次正式烘焙（tools/blender/env_second/lightbake/library_3f_v2_lm.json）用的燈：天花板 8×8 片燈板、人文庫中間一片＋四片小燈
LIGHTS = ('-12.300,11.700,-16.300,7.700,3.970,8,8,7,1.14,0.54,0.95,0.98,1.0;'
          '-0.010,0.010,-19.110,-19.090,3.970,1,1,16,1.9,0.95,0.95,0.98,1.0;'
          '3.108,3.128,-18.810,-18.790,3.970,1,1,5,0.54,0.54,0.95,0.98,1.0;'
          '1.221,1.241,-20.393,-20.373,3.970,1,1,5,0.54,0.54,0.95,0.98,1.0;'
          '-1.241,-1.221,-20.393,-20.373,3.970,1,1,5,0.54,0.54,0.95,0.98,1.0;'
          '-3.128,-3.108,-18.810,-18.790,3.970,1,1,5,0.54,0.54,0.95,0.98,1.0')
LMJ = os.path.join(HERE, '..', 'library_3f_v2_lm.json')
POINTS = json.load(open(LMJ, encoding='utf-8'))['points']   # 93 顆：燈板下 0.9 m 的補光、人文庫四顆、閱覽桌的桌燈
assert len(POINTS.split(';')) == 93, '點光源數量和上一次正式烘焙不一樣：%d' % len(POINTS.split(';'))
NOLM = '^L3_(light|vc|vcm|books|frame|glass)$|INST_|_root'
ARGS = ['--in', os.path.join(HERE, 'library_3f_v2_bakein.glb'), '--out', os.path.join(OUT, 'd.glb'), '--lm', os.path.join(OUT, 'd'),
        '--res', RES, '--samples', SAMPLES, '--hide', 'glass', '--nolm', NOLM, '--keep-instances',
        '--sun', '200,38,1.0', '--sky', '0.2', '--daywb', '0.86,0.9,0.98', '--lights', LIGHTS, '--points', POINTS,
        '--daylights', '1.0', '--smooth', '1', '--shell', 'W,E,S']

T0 = time.time()
sys.argv = [sys.argv[0], '--'] + ARGS
runpy.run_path(os.path.join(HERE, '..', 'bake_room.py'), run_name='__main__')
total = round(time.time() - T0, 1)

# 兩張光照貼圖的平均亮度（和 pc_bake_dorm_ref.py 同一種算法；3F 沒有熄燈那一張）
import bpy
import numpy as np
st = {'scene': 'library_3f_v2', 'res': int(RES), 'samples': int(SAMPLES), 'total_seconds': total, 'images': {}}
try: st.update({k: v for k, v in json.load(open(os.path.join(OUT, 'd.json'), encoding='utf-8')).items() if k in ('device', 'blender', 'bake_seconds')})
except Exception as e: st['json_error'] = str(e)
for k in ('day', 'night'):
    p = os.path.join(OUT, 'd_%s.png' % k)
    if not os.path.exists(p): st['images'][k] = None; continue
    im = bpy.data.images.load(p); px = np.array(im.pixels[:], dtype=np.float32).reshape(-1, 4)
    used = px[:, 3] > 0.5 if px[:, 3].min() < 0.5 else np.ones(len(px), bool)
    lum = px[used, :3] @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    st['images'][k] = {'mean': round(float(lum.mean()), 5), 'p50': round(float(np.percentile(lum, 50)), 5), 'p95': round(float(np.percentile(lum, 95)), 5), 'pixels': int(used.sum())}
json.dump(st, open(os.path.join(OUT, 'stats.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('PCBAKE', json.dumps(st, ensure_ascii=False), flush=True)
