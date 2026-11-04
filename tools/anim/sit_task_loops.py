#!/usr/bin/env python3
"""坐著的人做事的循環動作（NPC-ANIM-LOOPS-1104，LAWWW2-C 2026-11-04；LAWWW-C 派工）：
打字、打字＋觸控板、寫字、滑手機、翻書頁、喝飲料（杯子配件另外一顆）、吃飯——七個片段，做在和 ual_sit_clips.glb 一模一樣的骨架上
（Quaternius UAL 的骨架：名字、父子、靜止姿勢都照抄），遊戲用同一條重定向（character3d.js 的 C.UAL_BONE → VRM）就能套。

做法（不用 Blender；numpy）：
  1. 坐姿的身體照 UAL 的 Sitting_Idle_Loop（呼吸、身體微微前後）：每個片段 5 秒＝坐姿循環 1.667 秒的 3 圈，頭尾接得起來。
  2. 手臂：兩段式 IK（肩→肘→腕），手腕照每個動作的軌跡走（角色座標：+z 前、+x 左手邊、y 上；桌面、手機、嘴巴的位置寫在 TASK 裡）；
     肘往外、往下（pole）。手的方向：照坐姿的手轉一個角度（手心朝下、朝自己…）。
  3. 頭：在坐姿的頭上加低頭／抬頭（看鍵盤、看手機、喝的時候抬頭）；胸口往前傾一點。
  4. 手指：握筆、握杯、拿手機、敲鍵盤：每一節照手的橫軸彎。
  5. 輸出和 ual_sit_clips.glb 一樣的格式：只有骨架節點＋旋轉軌道（normalized SHORT、精簡關鍵影格、整段和靜止姿勢一樣的軌道不存）。

用法：
  python3 tools/anim/sit_task_loops.py --src assets/models/char/ual_sit_clips.glb [--out assets/models/char/ual_sit_tasks.glb] [--json 片段說明.json]
"""
import argparse, json, math, struct, sys
import numpy as np

FPS, LOOP = 30, 5.0

# ---------------------------------------------------------------- GLB 讀寫
def load_glb(path):
    d = open(path, 'rb').read(); n = struct.unpack('<I', d[12:16])[0]; J = json.loads(d[20:20 + n]); bo = 20 + n + 8
    return J, d, bo


def acc(J, d, bo, i):
    a = J['accessors'][i]; bv = J['bufferViews'][a['bufferView']]
    dt = {5126: np.float32, 5122: np.int16, 5123: np.uint16, 5120: np.int8, 5121: np.uint8}[a['componentType']]; nc = {'SCALAR': 1, 'VEC3': 3, 'VEC4': 4}[a['type']]
    x = np.frombuffer(d, dt, count=nc * a['count'], offset=bo + bv.get('byteOffset', 0) + a.get('byteOffset', 0)).reshape(a['count'], nc).astype(float)
    if a.get('normalized'): x = np.maximum(x / {5122: 32767.0, 5120: 127.0, 5123: 65535.0, 5121: 255.0}[a['componentType']], -1.0)
    return x


# ---------------------------------------------------------------- 四元數（x, y, z, w）
def qmul(a, b):
    ax, ay, az, aw = a; bx, by, bz, bw = b
    return np.array([aw * bx + ax * bw + ay * bz - az * by, aw * by - ax * bz + ay * bw + az * bx, aw * bz + ax * by - ay * bx + az * bw, aw * bw - ax * bx - ay * by - az * bz])
def qinv(q): return np.array([-q[0], -q[1], -q[2], q[3]]) / np.dot(q, q)
def qnorm(q): return q / np.linalg.norm(q)
def qaxis(axis, ang):
    a = np.asarray(axis, float); a = a / (np.linalg.norm(a) or 1.0); s = math.sin(ang / 2); return np.array([a[0] * s, a[1] * s, a[2] * s, math.cos(ang / 2)])
def qrot(q, v):
    p = np.array([v[0], v[1], v[2], 0.0]); return qmul(qmul(q, p), qinv(q))[:3]
def qbetween(u, v):
    u = u / np.linalg.norm(u); v = v / np.linalg.norm(v); c = np.dot(u, v)
    if c < -0.99999:
        ax = np.cross(u, [1, 0, 0]); ax = ax if np.linalg.norm(ax) > 1e-6 else np.cross(u, [0, 1, 0]); return qaxis(ax, math.pi)
    ax = np.cross(u, v); return qnorm(np.array([ax[0], ax[1], ax[2], 1.0 + c]))
def qslerp(a, b, t):
    d = np.dot(a, b)
    if d < 0: b = -b; d = -d
    if d > 0.9995: return qnorm(a + (b - a) * t)
    th = math.acos(min(1.0, d)); s = math.sin(th); return a * math.sin((1 - t) * th) / s + b * math.sin(t * th) / s


# ---------------------------------------------------------------- 骨架
class Skel:
    def __init__(self, J):
        self.nodes = J['nodes']; self.n = len(self.nodes); self.name = [nd.get('name') for nd in self.nodes]; self.idx = {nm: i for i, nm in enumerate(self.name)}
        self.par = [-1] * self.n
        for i, nd in enumerate(self.nodes):
            for c in nd.get('children', []): self.par[c] = i
        self.t = [np.array(nd.get('translation', [0, 0, 0]), float) for nd in self.nodes]
        self.r = [np.array(nd.get('rotation', [0, 0, 0, 1]), float) for nd in self.nodes]
        self.order = []; seen = set()
        def visit(i):
            if i in seen: return
            if self.par[i] >= 0: visit(self.par[i])
            seen.add(i); self.order.append(i)
        for i in range(self.n): visit(i)

    def fk(self, rot):
        """rot：每個節點的區域旋轉 → (世界旋轉, 世界位置)；節點沒有縮放（UAL 的骨架都是 1）"""
        wr = [None] * self.n; wp = [None] * self.n
        for i in self.order:
            p = self.par[i]
            if p < 0: wr[i] = rot[i]; wp[i] = self.t[i].copy()
            else: wr[i] = qmul(wr[p], rot[i]); wp[i] = wp[p] + qrot(wr[p], self.t[i])
        return wr, wp


def sample_clip(J, d, bo, sk, name, times):
    """片段在 times 的區域旋轉（沒有軌道的節點＝靜止姿勢）；片段比 times 短就循環"""
    an = next(a for a in J['animations'] if a['name'] == name)
    tr = {}
    for ch in an['channels']:
        if ch['target']['path'] != 'rotation': continue
        s = an['samplers'][ch['sampler']]; tr[ch['target']['node']] = (acc(J, d, bo, s['input'])[:, 0], acc(J, d, bo, s['output']))
    L = max(t[-1] for t, _ in tr.values())
    out = []
    for tt in times:
        tt = tt % L; rot = [r.copy() for r in sk.r]
        for i, (t, v) in tr.items():
            k = int(np.searchsorted(t, tt, side='right')) - 1
            if k < 0: rot[i] = qnorm(v[0]); continue
            if k >= len(t) - 1: rot[i] = qnorm(v[-1]); continue
            a = (tt - t[k]) / max(1e-9, t[k + 1] - t[k]); rot[i] = qslerp(qnorm(v[k]), qnorm(v[k + 1]), a)
        out.append(rot)
    return out, L


# ---------------------------------------------------------------- 姿勢工具
def set_world_rot(sk, rot, wr, i, want):
    """把節點 i 的世界旋轉設成 want（改區域旋轉；子節點的世界值之後重新 FK）"""
    p = sk.par[i]; rot[i] = qnorm(qmul(qinv(wr[p]), want)) if p >= 0 else want


def two_bone(sk, rot, side, target, pole, hand_q=None):
    """兩段式 IK：side 'l'／'r'；target＝手腕的世界位置；pole＝手肘要往的方向（世界）；hand_q＝手的世界旋轉（None：照原本的相對方向）"""
    ua, la, ha = sk.idx['upperarm_' + side], sk.idx['lowerarm_' + side], sk.idx['hand_' + side]
    wr, wp = sk.fk(rot)
    S, E, W = wp[ua], wp[la], wp[ha]
    l1, l2 = np.linalg.norm(E - S), np.linalg.norm(W - E)
    T = np.asarray(target, float); dv = T - S; dist = np.linalg.norm(dv)
    dist = min(max(dist, abs(l1 - l2) + 1e-3), l1 + l2 - 1e-3); dn = dv / np.linalg.norm(dv); T = S + dn * dist
    ca = (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist); sa = math.sqrt(max(0.0, 1 - ca * ca))
    pv = np.asarray(pole, float); pv = pv - dn * np.dot(pv, dn); pv = pv / (np.linalg.norm(pv) or 1.0)
    En = S + dn * (l1 * ca) + pv * (l1 * sa)
    set_world_rot(sk, rot, wr, ua, qmul(qbetween(E - S, En - S), wr[ua]))
    wr, wp = sk.fk(rot)
    set_world_rot(sk, rot, wr, la, qmul(qbetween(wp[ha] - wp[la], T - wp[la]), wr[la]))
    wr, wp = sk.fk(rot)
    if hand_q is not None: set_world_rot(sk, rot, wr, ha, hand_q)
    return rot


def curl_fingers(sk, rot, side, amount, thumb=None, spread=0.0):
    """手指彎：amount＝{finger: 弧度}（三節一起，第一節 0.8 倍）；thumb＝(往掌心, 彎)"""
    wr, wp = sk.fk(rot)
    i0, p0 = sk.idx['index_01_' + side], sk.idx['pinky_01_' + side]
    lat = wp[i0] - wp[p0]; lat /= np.linalg.norm(lat)                     # 小指 → 食指
    for f in ('index', 'middle', 'ring', 'pinky'):
        a = amount.get(f, amount.get('all', 0.0)) if isinstance(amount, dict) else amount
        for k, s in ((1, 0.8), (2, 1.0), (3, 0.9)):
            j = sk.idx['%s_0%d_%s' % (f, k, side)]; wr, wp = sk.fk(rot)
            ax = lat if side == 'l' else -lat                                  # 往掌心彎（左右手的橫軸方向相反）
            set_world_rot(sk, rot, wr, j, qmul(qaxis(ax, a * s), wr[j]))
    if thumb is not None:
        wr, wp = sk.fk(rot)
        j = sk.idx['thumb_01_' + side]; fwd = wp[sk.idx['middle_01_' + side]] - wp[sk.idx['hand_' + side]]; fwd /= np.linalg.norm(fwd)
        set_world_rot(sk, rot, wr, j, qmul(qaxis(fwd if side == 'l' else -fwd, thumb[0]), wr[j]))
        for k in (2, 3):
            wr, wp = sk.fk(rot); j = sk.idx['thumb_0%d_%s' % (k, side)]
            set_world_rot(sk, rot, wr, j, qmul(qaxis(lat if side == 'l' else -lat, thumb[1]), wr[j]))
    return rot


def add_local(sk, rot, name, axis, ang):
    """在某節點的世界旋轉前面加一個角色座標系的旋轉（例：頭低下＝繞 +x 轉）"""
    i = sk.idx[name]; wr, wp = sk.fk(rot); set_world_rot(sk, rot, wr, i, qmul(qaxis(axis, ang), wr[i])); return rot


def smooth(x): x = min(1.0, max(0.0, x)); return x * x * (3 - 2 * x)
def pulse(t, t0, t1, ramp=0.35):
    """t0～t1 之間是 1、前後 ramp 秒平滑過渡（喝一口、翻一頁）"""
    if t < t0 - ramp or t > t1 + ramp: return 0.0
    if t < t0: return smooth((t - (t0 - ramp)) / ramp)
    if t > t1: return smooth(1 - (t - t1) / ramp)
    return 1.0


# ---------------------------------------------------------------- 七個動作（角色座標：+z 前、+x 左手邊、y 上；坐姿骨盆 y≈0.92、桌面 y≈1.15、桌子前緣 z≈0.25）
DESK_Y = 1.15
def task_pose(sk, rot, base_wp, kind, t):
    """在坐姿上改：回傳改好的區域旋轉。t＝秒（0～LOOP）"""
    w = 2 * math.pi / LOOP
    head_pitch, lean = 0.0, 0.0
    if kind in ('type', 'typepad'):
        lean, head_pitch = 0.1, 0.32
        for side, sx in (('l', 1), ('r', -1)):
            ph = 0.0 if side == 'l' else 1.7
            tap = 0.012 * max(0.0, math.sin(t * 9.3 + ph)) + 0.006 * max(0.0, math.sin(t * 13.1 + ph * 2))
            x, z = sx * 0.13 + 0.01 * math.sin(t * 1.3 + ph), 0.4 + 0.012 * math.sin(t * 0.9 + ph)
            if kind == 'typepad' and side == 'r':                              # 右手每 5 秒去觸控板一次（鍵盤下面、偏右）
                k = pulse(t, 1.6, 3.4, 0.45); x += -0.07 * k; z += -0.07 * k
                tap *= (1 - k); x += k * 0.012 * math.sin(t * 2.3)
            two_bone(sk, rot, side, (x, DESK_Y + 0.045 + tap, z), (sx * 0.38, -0.8, -0.45))   # 肘靠近身體、往下往後
            wr, wp = sk.fk(rot); hq = wr[sk.idx['hand_' + side]]
            rot = add_local(sk, rot, 'hand_' + side, (0, 0, 1), sx * -0.15)
            curl_fingers(sk, rot, side, {'all': 0.45 + 0.25 * min(1.0, tap * 60)}, thumb=(0.3, 0.2))
    elif kind == 'write':
        lean, head_pitch = 0.16, 0.42
        sx = -1                                                                # 右手寫字
        u = t * 1.6; px = -0.08 + 0.025 * math.sin(u * 2.7) + 0.035 * ((u % 3.0) / 3.0); pz = 0.38 + 0.01 * math.sin(u * 3.9)
        lift = 0.01 * max(0.0, math.sin(u * 0.9))
        two_bone(sk, rot, 'r', (px, DESK_Y + 0.05 + lift, pz), (-0.45, -0.8, -0.35))
        curl_fingers(sk, rot, 'r', {'index': 0.55, 'middle': 0.7, 'ring': 1.0, 'pinky': 1.1}, thumb=(0.6, 0.35))
        two_bone(sk, rot, 'l', (0.16, DESK_Y + 0.03, 0.36), (0.45, -0.8, -0.3))   # 左手壓著紙
        rot = add_local(sk, rot, 'hand_l', (0, 0, 1), 0.25)
        curl_fingers(sk, rot, 'l', {'all': 0.15}, thumb=(0.2, 0.1))
    elif kind == 'phone':
        lean, head_pitch = 0.08, 0.55
        sc = 0.006 * math.sin(t * 6.0) * max(0.0, math.sin(t * 0.8))          # 大拇指滑（手機本身微微動）
        for side, sx in (('l', 1), ('r', -1)):
            two_bone(sk, rot, side, (sx * 0.045, 1.17 + sc * 0.5, 0.26), (sx * 0.5, -0.8, -0.3))
            rot = add_local(sk, rot, 'hand_' + side, (1, 0, 0), -0.9)              # 手心朝上、往自己
            rot = add_local(sk, rot, 'hand_' + side, (0, 0, 1), sx * 0.5)
            curl_fingers(sk, rot, side, {'all': 0.75}, thumb=(0.4 + (0.25 * math.sin(t * 6.0) if side == 'r' else 0.0), 0.2))
    elif kind == 'page':
        lean, head_pitch = 0.1, 0.45
        k = pulse(t, 2.0, 2.6, 0.45)                                           # 右手翻一頁：從書的右邊翻到左邊
        for side, sx in (('l', 1), ('r', -1)):
            x, y, z = sx * 0.12, DESK_Y + 0.04, 0.36
            if side == 'r': x += 0.17 * k; y += 0.09 * math.sin(k * math.pi); z += 0.02 * k
            two_bone(sk, rot, side, (x, y, z), (sx * 0.4, -0.8, -0.35))
            rot = add_local(sk, rot, 'hand_' + side, (0, 0, 1), sx * -0.25 + (0.0 if side == 'l' else -0.6 * math.sin(k * math.pi)))
            curl_fingers(sk, rot, side, {'all': 0.2}, thumb=(0.3, 0.2))
    elif kind == 'drink':
        k = pulse(t, 1.7, 2.9, 0.6)                                            # 喝一口：拿起來、到嘴邊、放回去
        lean, head_pitch = 0.04, 0.15 - 0.3 * k
        mouth = base_wp[sk.idx['Head']] + np.array([0.0, -0.06, 0.13])
        cup = np.array([-0.17, DESK_Y + 0.09, 0.36])
        p = cup + (mouth + np.array([-0.03, -0.05, 0.0]) - cup) * k
        two_bone(sk, rot, 'r', p, (-0.6, -0.75, -0.2))
        rot = add_local(sk, rot, 'hand_r', (0, 0, 1), -1.1)                        # 虎口朝上握杯
        rot = add_local(sk, rot, 'hand_r', (1, 0, 0), -0.5 * k)                    # 喝的時候杯口往嘴邊傾
        curl_fingers(sk, rot, 'r', {'all': 0.85}, thumb=(0.7, 0.3))
        two_bone(sk, rot, 'l', (0.16, DESK_Y + 0.03, 0.33), (0.45, -0.8, -0.3))
        curl_fingers(sk, rot, 'l', {'all': 0.2}, thumb=(0.2, 0.1))
    elif kind == 'eat':
        u = t % (LOOP / 2)                                                     # 兩口：夾、送到嘴邊、放下
        k = pulse(u, 1.0, 1.35, 0.55)
        lean, head_pitch = 0.2 - 0.06 * k, 0.4 - 0.1 * k
        mouth = base_wp[sk.idx['Head']] + np.array([0.0, -0.08, 0.14])
        bowl = np.array([-0.06, DESK_Y + 0.12, 0.33])
        p = bowl + (mouth + np.array([-0.04, -0.06, 0.02]) - bowl) * k
        two_bone(sk, rot, 'r', p, (-0.6, -0.75, -0.2))
        rot = add_local(sk, rot, 'hand_r', (0, 0, 1), -0.7)
        curl_fingers(sk, rot, 'r', {'index': 0.35, 'middle': 0.6, 'ring': 0.9, 'pinky': 1.0}, thumb=(0.6, 0.3))
        two_bone(sk, rot, 'l', (0.1, DESK_Y + 0.1, 0.33), (0.5, -0.8, -0.3))    # 左手扶著碗
        rot = add_local(sk, rot, 'hand_l', (0, 0, 1), 0.9)
        curl_fingers(sk, rot, 'l', {'all': 0.45}, thumb=(0.4, 0.2))
    if lean: rot = add_local(sk, rot, 'spine_03', (1, 0, 0), lean * 0.5); rot = add_local(sk, rot, 'spine_02', (1, 0, 0), lean * 0.5)
    if head_pitch: rot = add_local(sk, rot, 'neck_01', (1, 0, 0), head_pitch * 0.4); rot = add_local(sk, rot, 'Head', (1, 0, 0), head_pitch * 0.6)
    return rot


CLIPS = [('Sit_Type_Loop', 'type', '打字（雙手在桌上的鍵盤：手指輪流敲）'), ('Sit_TypePad_Loop', 'typepad', '打字＋觸控板（右手每 5 秒去觸控板一次）'),
         ('Sit_Write_Loop', 'write', '寫字（右手寫、左手壓紙）'), ('Sit_Phone_Loop', 'phone', '滑手機（雙手拿在胸前、右手拇指滑）'),
         ('Sit_Page_Loop', 'page', '看書、翻頁（書攤在桌上，右手每 5 秒翻一頁）'), ('Sit_Drink_Loop', 'drink', '喝飲料（右手握杯，每 5 秒喝一口；杯子配件掛 hand_r）'),
         ('Sit_Eat_Loop', 'eat', '吃飯（右手筷子／湯匙從碗送到嘴邊，每 2.5 秒一口；左手扶碗）')]
ARM = ['clavicle', 'upperarm', 'lowerarm', 'hand', 'index', 'middle', 'ring', 'pinky', 'thumb']


def build(src, only=None):
    J, d, bo = load_glb(src); sk = Skel(J)
    times = [k / FPS for k in range(int(LOOP * FPS) + 1)]
    base, base_len = sample_clip(J, d, bo, sk, 'Sitting_Idle_Loop', times)
    assert abs(LOOP / base_len - round(LOOP / base_len)) < 0.02, ('LOOP 要是坐姿循環的整數倍', LOOP, base_len)
    clips = []
    for name, kind, desc in CLIPS:
        if only and kind not in only: continue
        frames = []
        for fi, tt in enumerate(times):
            rot = [q.copy() for q in base[fi]]
            _, bwp = sk.fk(rot)
            rot = task_pose(sk, rot, bwp, kind, tt)
            frames.append(rot)
        frames[-1] = [q.copy() for q in frames[0]]                              # 頭尾一樣（循環）
        clips.append((name, kind, desc, frames))
    return J, d, bo, sk, times, clips


def reduce_keys(times, qs, tol):
    n = len(times)
    if n <= 2: return list(range(n))
    keep, i = [0], 0
    while i < n - 1:
        best, j = i + 1, i + 2
        while j < n:
            ok = all(2 * math.acos(min(1.0, abs(float(np.dot(qslerp(qs[i], qs[j], (times[k] - times[i]) / (times[j] - times[i])), qs[k]))))) <= tol for k in range(i + 1, j))
            if not ok: break
            best = j; j += 1
        keep.append(best); i = best
    return keep


def write_glb(out, J, sk, times, clips, tol=0.0015):
    nodes = [{k: v for k, v in nd.items()} for nd in J['nodes']]
    js = {'asset': {'version': '2.0', 'generator': 'tools/anim/sit_task_loops.py（NPC-ANIM-LOOPS-1104）'}, 'scene': 0, 'scenes': J['scenes'], 'nodes': nodes,
          'animations': [], 'accessors': [], 'bufferViews': [], 'buffers': []}
    bin_ = bytearray()
    def push(data, comp, typ, count, normalized=False, mn=None, mx=None):
        while len(bin_) % 4: bin_.append(0)
        off = len(bin_); bin_.extend(data)
        js['bufferViews'].append({'buffer': 0, 'byteOffset': off, 'byteLength': len(data)})
        a = {'bufferView': len(js['bufferViews']) - 1, 'componentType': comp, 'count': count, 'type': typ}
        if normalized: a['normalized'] = True
        if mn is not None: a['min'] = mn; a['max'] = mx
        js['accessors'].append(a); return len(js['accessors']) - 1
    for name, kind, desc, frames in clips:
        an = {'name': name, 'channels': [], 'samplers': [], 'extras': {'desc': desc, 'loop': LOOP}}
        for i in range(sk.n):
            if sk.par[i] < 0: continue
            qs = [qnorm(f[i]) for f in frames]
            for k in range(1, len(qs)):
                if np.dot(qs[k], qs[k - 1]) < 0: qs[k] = -qs[k]
            if max(2 * math.acos(min(1.0, abs(float(np.dot(q, qnorm(sk.r[i])))))) for q in qs) < tol: continue   # 整段都是靜止姿勢
            keep = reduce_keys(times, qs, tol)
            tt = [times[k] for k in keep]; qq = [qs[k] for k in keep]
            ti = push(struct.pack('<%df' % len(tt), *tt), 5126, 'SCALAR', len(tt), mn=[tt[0]], mx=[tt[-1]])
            vi = push(struct.pack('<%dh' % (4 * len(qq)), *[int(round(max(-1.0, min(1.0, c)) * 32767)) for q in qq for c in q]), 5122, 'VEC4', len(qq), normalized=True)
            an['samplers'].append({'input': ti, 'output': vi, 'interpolation': 'LINEAR'})
            an['channels'].append({'sampler': len(an['samplers']) - 1, 'target': {'node': i, 'path': 'rotation'}})
        js['animations'].append(an)
    while len(bin_) % 4: bin_.append(0)
    js['buffers'] = [{'byteLength': len(bin_)}]
    jb = json.dumps(js, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    while len(jb) % 4: jb += b' '
    total = 12 + 8 + len(jb) + 8 + len(bin_)
    with open(out, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, total)); f.write(struct.pack('<II', len(jb), 0x4E4F534A)); f.write(jb); f.write(struct.pack('<II', len(bin_), 0x004E4942)); f.write(bin_)
    return total


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--src', default='assets/models/char/ual_sit_clips.glb'); ap.add_argument('--out', default='assets/models/char/ual_sit_tasks.glb')
    ap.add_argument('--json'); ap.add_argument('--only', nargs='*'); ap.add_argument('--tol', type=float, default=0.0015)
    A = ap.parse_args()
    J, d, bo, sk, times, clips = build(A.src, A.only)
    n = write_glb(A.out, J, sk, times, clips, A.tol)
    info = {'out': A.out, 'bytes': n, 'fps': FPS, 'loop': LOOP, 'clips': [{'name': nm, 'kind': k, 'desc': ds} for nm, k, ds, _ in clips]}
    if A.json: json.dump(info, open(A.json, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(json.dumps(info, ensure_ascii=False))
