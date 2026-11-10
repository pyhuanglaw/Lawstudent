"""健身中心器材會動的零件（GYM-FIT-PROPS-1103 第二包；LAWWW2 帳號 A，2026-11-10）。不用 Blender，只用 numpy 改 GLB。
用法（gym_b1.glb 每次從 gym_b1.py／bake_gym.sh 重新產生以後，跑一次；bake_gym.sh b1 最後會自動跑）：
  python3 tools/blender/env_second/gym_moving_parts.py [--dst <要拆的 gym_b1.glb>] [--src <沒拆過的 gym_b1.glb>] [--out <零件 GLB>]
做的事：
  1. 從 gym_b1.glb 的器材原型網格（EXT_mesh_gpu_instancing：gymb1_gym_bike_*、gymb1_gym_rower_*）找出會動的零件的三角形：
       飛輪：兩支曲柄（金屬）、兩個踏板（橡膠）——曲柄軸本身不動、留著；
       划船機：座椅（皮）＋座椅下的滑車（金屬）、掛在前面的拉把（橡膠）。
  2. 那些三角形在 gym_b1.glb 裡改成退化三角形（三個索引一樣＝不畫；緩衝區大小不變、不用重烘，器材本來就是 --nolm）。
  3. 同樣的三角形（位置、法線、頂點色一樣，材質名字一樣）寫成 assets/models/env/second_ai/gym_moving_parts.glb：
       gym_bike_crank    原點＝曲柄軸 (0, 0.36, −0.02)，兩支曲柄照原本的角度（+x 那支在 0.9+π，見下面 CRANK0）；遊戲繞 +x 轉
       gym_bike_pedal_L  +x 那一個踏板，原點＝曲柄末端（原本的角度）；遊戲每一格放到曲柄末端、保持水平
       gym_bike_pedal_R  −x 那一個
       gym_rower_seat    座椅＋滑車，原點＝器材原點（不動的時候在原位）；遊戲沿 z 滑
       gym_rower_handle  拉把，原點＝拉把中心；有人在划的時候藏起來（手上的拉把是 gym_hand_props.glb）
     遊戲（src/gym3d.js gymMoving）把材質換成 gym_b1.glb 裡同名的材質（gymb1_metal、gymb1_vc），看起來和原本一模一樣。
選三角形的範圍照 BB-B 的 tools/blender/env_second/bb_support/gym_b1_props.py 的 bike()、rower()（器材自己的座標：+z 正面、y 上、原點底面中心）。"""
import json, math, os, struct, sys
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
ARGS = sys.argv[1:]
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
DST = os.path.join(ROOT, arg('--dst', 'assets/models/env/second_ai/gym_b1.glb'))
SRC = arg('--src', DST)
OUT = os.path.join(ROOT, arg('--out', 'assets/models/env/second_ai/gym_moving_parts.glb'))

AXLE = (0.0, 0.36, -0.02); CRANK = 0.17; CRANK0 = 0.9 + math.pi   # +x 那支曲柄原本的角度（y＝cos、z＝sin；gym_b1_props.py：sx=+1 的 phase π）
HANDLE = (0.0, 0.46, 0.53)


def read_glb(path):
    b = open(path, 'rb').read()
    jl = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + jl])
    bl = struct.unpack('<I', b[20 + jl:24 + jl])[0]; BIN = bytearray(b[28 + jl:28 + jl + bl])
    return J, BIN

CT = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}; NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}
def view(J, BIN, i):
    a = J['accessors'][i]; v = J['bufferViews'][a['bufferView']]; n = NC[a['type']]; dt = CT[a['componentType']]
    st = v.get('byteStride'); assert not st or st == n * np.dtype(dt).itemsize, '不支援交錯的緩衝區'
    off = v.get('byteOffset', 0) + a.get('byteOffset', 0)
    return np.frombuffer(BIN, dtype=dt, count=a['count'] * n, offset=off).reshape(-1, n), off, dt


J, BIN = read_glb(SRC)
if (J.get('asset', {}).get('extras') or {}).get('gymMovingStripped') and SRC == DST:
    sys.exit('gym_b1.glb 已經拆過（asset.extras.gymMovingStripped）：先重新產生 gym_b1.glb，或用 --src 指定沒拆過的檔')
mesh_of = {}
for n in J['nodes']:
    if n.get('mesh') is not None and 'EXT_mesh_gpu_instancing' in (n.get('extensions') or {}):
        mesh_of[J['meshes'][n['mesh']]['name']] = n['mesh']

def tri_data(mname):
    mi = mesh_of[mname]; p = J['meshes'][mi]['primitives'][0]; assert len(J['meshes'][mi]['primitives']) == 1
    A = {k: view(J, BIN, v)[0] for k, v in p['attributes'].items()}
    I, ioff, idt = view(J, BIN, p['indices']); T = I.reshape(-1, 3)
    return p, A, T, ioff, idt

def select(mname, fn):
    p, A, T, _, _ = tri_data(mname); P = A['POSITION']
    V = P[T]                                      # (三角形, 3, xyz)
    keep = np.array([fn(t) for t in V]) & (T[:, 0] != T[:, 1])
    return keep

def cen(t): return t.mean(0)
def in_box(t, x0, x1, y0, y1, z0, z1): return bool(np.all((t[:, 0] >= x0) & (t[:, 0] <= x1) & (t[:, 1] >= y0) & (t[:, 1] <= y1) & (t[:, 2] >= z0) & (t[:, 2] <= z1)))

# 飛輪：曲柄（金屬）、踏板（橡膠）＝|x| > 0.052（車架、前叉、飛輪、護蓋、曲柄軸的三角形中心都在 0.05 以內）、y 0.15～0.58、z < 0.18（前叉的下段在 z 0.2 以上）
crank_sel = lambda t: abs(cen(t)[0]) > 0.052 and 0.15 <= cen(t)[1] <= 0.58 and cen(t)[2] < 0.18
# 划船機：座椅＋滑車＝三個頂點都在座椅的盒子裡（滑軌的頂點在 z −1.10／0.65，不會整個在裡面）；拉把＝拉把的盒子
seat_sel = lambda t: in_box(t, -0.14, 0.14, 0.295, 0.41, -0.26, 0.06)
handle_sel = lambda t: in_box(t, -0.28, 0.28, 0.425, 0.495, 0.495, 0.565)

PARTS = [  # (零件, 原型網格, 選法, 再分左右)
    ('crank', 'gymb1_gym_bike_metal', crank_sel),
    ('pedal', 'gymb1_gym_bike_vc', crank_sel),
    ('seat_m', 'gymb1_gym_rower_metal', seat_sel),
    ('seat_v', 'gymb1_gym_rower_vc', seat_sel),
    ('handle', 'gymb1_gym_rower_vc', handle_sel),
]
pieces = {}   # 名字 → [(材質, P, N, C, T)]
report = {}
strip = {}    # 原型網格 → 要退化的三角形
for key, mname, fn in PARTS:
    p, A, T, _, _ = tri_data(mname); sel = select(mname, fn)
    if not sel.any(): sys.exit(f'{key}：{mname} 裡找不到三角形（gym_b1.glb 已經拆過？用 --src）')
    strip.setdefault(mname, np.zeros(len(T), bool)); strip[mname] |= sel
    mat = J['materials'][p['material']]
    def add(node, s):
        sub = T[s]; used, inv = np.unique(sub.reshape(-1), return_inverse=True)
        pieces.setdefault(node, []).append((mat, A['POSITION'][used].copy(), A['NORMAL'][used].copy(), A['COLOR_0'][used].copy(), inv.reshape(-1, 3).astype(np.uint16)))
        report[node] = report.get(node, 0) + int(s.sum())
    cx = A['POSITION'][T].mean(1)[:, 0]
    if key == 'crank': add('gym_bike_crank', sel)
    elif key == 'pedal': add('gym_bike_pedal_L', sel & (cx > 0)); add('gym_bike_pedal_R', sel & (cx < 0))
    elif key in ('seat_m', 'seat_v'): add('gym_rower_seat', sel)
    else: add('gym_rower_handle', sel)

# 原點：曲柄軸、曲柄末端（原本的角度）、拉把中心
def end(sx): a = CRANK0 + (0 if sx > 0 else math.pi); return (sx * 0.07, AXLE[1] + CRANK * math.cos(a), AXLE[2] + CRANK * math.sin(a))
ORIGIN = {'gym_bike_crank': AXLE, 'gym_bike_pedal_L': end(1), 'gym_bike_pedal_R': end(-1), 'gym_rower_seat': (0, 0, 0), 'gym_rower_handle': HANDLE}
# 檢查：踏板的中心真的在那一邊曲柄的末端附近（確定 CRANK0 的方向沒有弄反）
for nd, sx in (('gym_bike_pedal_L', 1), ('gym_bike_pedal_R', -1)):
    c = np.concatenate([q[1] for q in pieces[nd]]).mean(0); e = np.array(end(sx))
    d = math.hypot(c[1] - e[1], c[2] - e[2]); assert d < 0.06, f'{nd} 中心 {c.round(3)} 離曲柄末端 {e.round(3)} {d:.3f} m：角度不對'
    report[nd + '_center'] = [round(float(v), 3) for v in c]

# ---- 寫 gym_moving_parts.glb ----
oj = {'asset': {'version': '2.0', 'generator': 'gym_moving_parts.py (LAWWW2)', 'extras': {'note': 'GYM-FIT-PROPS-1103 第二包：從 gym_b1.glb 搬出來的會動零件；材質在遊戲裡換成 gym_b1.glb 同名的材質'}},
      'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': [{'name': 'gym_moving_parts', 'children': []}], 'meshes': [], 'materials': [], 'accessors': [], 'bufferViews': [], 'buffers': []}
ob = bytearray(); mat_ix = {}
def put(arr, target=None):
    global ob
    while len(ob) % 4: ob += b'\0'
    off = len(ob); ob += arr.tobytes(); bv = {'buffer': 0, 'byteOffset': off, 'byteLength': arr.nbytes}
    if target: bv['target'] = target
    oj['bufferViews'].append(bv); return len(oj['bufferViews']) - 1
def accessor(arr, typ, ctype, target, mm=False):
    a = {'bufferView': put(arr, target), 'componentType': ctype, 'count': len(arr), 'type': typ}
    if mm: a['min'] = arr.min(0).tolist(); a['max'] = arr.max(0).tolist()
    oj['accessors'].append(a); return len(oj['accessors']) - 1
for nd in ('gym_bike_crank', 'gym_bike_pedal_L', 'gym_bike_pedal_R', 'gym_rower_seat', 'gym_rower_handle'):
    prims = []
    for mat, P, N, C, T in pieces[nd]:
        if mat['name'] not in mat_ix: oj['materials'].append(json.loads(json.dumps(mat))); mat_ix[mat['name']] = len(oj['materials']) - 1
        P = (P - np.array(ORIGIN[nd], np.float32)).astype(np.float32)
        prims.append({'attributes': {'POSITION': accessor(P, 'VEC3', 5126, 34962, True), 'NORMAL': accessor(N.astype(np.float32), 'VEC3', 5126, 34962),
                                     'COLOR_0': accessor(C.astype(np.float32), 'VEC3', 5126, 34962)},
                      'indices': accessor(T.reshape(-1), 'SCALAR', 5123, 34963), 'material': mat_ix[mat['name']]})
    oj['meshes'].append({'name': nd, 'primitives': prims})
    oj['nodes'].append({'name': nd, 'mesh': len(oj['meshes']) - 1, 'translation': [float(v) for v in ORIGIN[nd]]})
    oj['nodes'][0]['children'].append(len(oj['nodes']) - 1)
while len(ob) % 4: ob += b'\0'
oj['buffers'].append({'byteLength': len(ob)})

def write_glb(path, J_, BIN_):
    js = json.dumps(J_, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    while len(js) % 4: js += b' '
    BIN_ = bytes(BIN_)
    while len(BIN_) % 4: BIN_ += b'\0'
    total = 12 + 8 + len(js) + 8 + len(BIN_)
    with open(path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, total)); f.write(struct.pack('<II', len(js), 0x4E4F534A)); f.write(js)
        f.write(struct.pack('<II', len(BIN_), 0x004E4942)); f.write(BIN_)
write_glb(OUT, oj, ob)

# ---- gym_b1.glb：那些三角形改成退化三角形 ----
nstrip = 0
for mname, s in strip.items():
    p, A, T, ioff, idt = tri_data(mname)
    T2 = T.copy(); T2[s, 1] = T2[s, 0]; T2[s, 2] = T2[s, 0]; nstrip += int(s.sum())
    BIN[ioff:ioff + T2.nbytes] = T2.astype(idt).tobytes()
J.setdefault('asset', {}).setdefault('extras', {})['gymMovingStripped'] = {'tris': nstrip, 'by': 'tools/blender/env_second/gym_moving_parts.py'}
write_glb(DST, J, BIN)

info = {'kind': 'gym_moving_parts', 'tris': report, 'stripped_from_gym_b1': nstrip, 'axle': AXLE, 'crank': CRANK, 'crank0': CRANK0, 'handle': HANDLE,
        'note': '遊戲 src/gym3d.js gymMoving：曲柄繞 +x 轉（角度＝gymIK 的 g.ph − crank0）、踏板跟著曲柄末端、座椅照臀部的 z 滑、有人划船時藏拉把'}
json.dump(info, open(OUT[:-4] + '.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('OK', OUT, report, '退化', nstrip, '個三角形')
