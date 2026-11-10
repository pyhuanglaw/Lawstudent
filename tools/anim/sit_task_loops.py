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
import argparse, json, math, os, struct, sys
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


# ---------------------------------------------------------------- 遊戲裡人物真正的骨架（VRoid VRM 0.x）
UAL2VRM = {'pelvis': 'J_Bip_C_Hips', 'spine_01': 'J_Bip_C_Spine', 'spine_02': 'J_Bip_C_Chest', 'spine_03': 'J_Bip_C_UpperChest', 'neck_01': 'J_Bip_C_Neck', 'Head': 'J_Bip_C_Head'}
for _s, _S in (('l', 'L'), ('r', 'R')):
    UAL2VRM.update({'clavicle_' + _s: 'J_Bip_%s_Shoulder' % _S, 'upperarm_' + _s: 'J_Bip_%s_UpperArm' % _S, 'lowerarm_' + _s: 'J_Bip_%s_LowerArm' % _S, 'hand_' + _s: 'J_Bip_%s_Hand' % _S})
    for _f, _F in (('thumb', 'Thumb'), ('index', 'Index'), ('middle', 'Middle'), ('ring', 'Ring'), ('pinky', 'Little')):
        for _k in (1, 2, 3): UAL2VRM['%s_0%d_%s' % (_f, _k, _s)] = 'J_Bip_%s_%s%d' % (_S, _F, _k)
        UAL2VRM['%s_04_leaf_%s' % (_f, _s)] = 'J_Bip_%s_%s3_end' % (_S, _F)
LEAF = lambda nm: nm.endswith('_leaf_l') or nm.endswith('_leaf_r')


class VSkel:
    """VRoid 人物的上半身骨架，換成 UAL 的名字和座標（+z 前、+x 左手邊）、縮到遊戲裡的身高 H：
    遊戲照「不含頭髮的模型高度＋0.03」縮放（character3d.js），坐下時整個人往下 sit_drop(V)（SIT-HEIGHT-1104：照每個模型的大腿根、大腿厚度，C.SIT_FIT）。VRoid 的骨頭靜止時沒有旋轉。
    這個骨架上算出來的世界旋轉差＝遊戲套到這個人物身上的旋轉（ambClip：D＝世界旋轉 × 靜止世界旋轉的反）"""
    def __init__(self, vrm, H):
        self.vrm = vrm
        d = open(vrm, 'rb').read(); n = struct.unpack('<I', d[12:16])[0]; J = json.loads(d[20:20 + n])
        par = {}
        for i, nd in enumerate(J['nodes']):
            for c in nd.get('children', []): par[c] = i
        byname = {nd.get('name'): i for i, nd in enumerate(J['nodes'])}
        def wpos(i):
            p = np.zeros(3)
            while i is not None: p = p + np.array(J['nodes'][i].get('translation', [0, 0, 0]), float); i = par.get(i)
            return p
        ymin, ymax = 1e9, -1e9
        for me in J['meshes']:
            if 'hair' in me.get('name', '').lower(): continue
            for pr in me['primitives']:
                a = J['accessors'][pr['attributes']['POSITION']]; ymin = min(ymin, a['min'][1]); ymax = max(ymax, a['max'][1])
        self.mh = ymax - ymin + 0.03; self.H = H; self.s = H / self.mh
        conv = lambda p: np.array([-p[0], p[1] - ymin, -p[2]]) * self.s          # VRM 0.x（−z 前、+x 右手邊）→ UAL 的方向；腳底在 y=0
        names = [u for u, v in UAL2VRM.items() if v in byname]
        P = {u: conv(wpos(byname[UAL2VRM[u]])) for u in names}
        vpar = {}
        for u in names:                                                          # 父節點＝最近的、也在這份表裡的祖先
            i = par.get(byname[UAL2VRM[u]]); pu = None
            while i is not None:
                cand = [k for k in names if byname[UAL2VRM[k]] == i]
                if cand: pu = cand[0]; break
                i = par.get(i)
            vpar[u] = pu
        self.name = names; self.n = len(names); self.idx = {u: i for i, u in enumerate(names)}
        self.par = [self.idx[vpar[u]] if vpar[u] else -1 for u in names]
        self.t = [P[u] - (P[vpar[u]] if vpar[u] else 0) for u in names]
        self.r = [np.array([0.0, 0.0, 0.0, 1.0]) for u in names]
        self.order = []; seen = set()
        def visit(i):
            if i in seen: return
            if self.par[i] >= 0: visit(self.par[i])
            seen.add(i); self.order.append(i)
        for i in range(self.n): visit(i)
        self.HL = float(np.linalg.norm(P['middle_01_r'] - P['hand_r']))                       # 手腕到中指根
        hd = P['Head']; eye = (conv(wpos(byname['J_Adj_L_FaceEye'])) + conv(wpos(byname['J_Adj_R_FaceEye']))) / 2 if 'J_Adj_L_FaceEye' in byname else hd + np.array([0, 0.064, 0.03]) * self.s
        self.eyes = tuple(eye - hd + np.array([0.0, 0.0, 0.015 * self.s]))                    # 眼球中心再往前一點
        self.mouth = tuple(self._mouth(J, d, 20 + n + 8, byname, conv, hd, eye))
        self.wr0 = None

    def _mouth(self, J, d, bo, byname, conv, hd, eye):
        """嘴：臉的網格（綁定姿勢）在正中線、眼睛下面 3～7 cm 那一段最前面的點"""
        best = None
        for me in J['meshes']:
            if 'face' not in me.get('name', '').lower(): continue
            for pr in me['primitives']:
                a = J['accessors'][pr['attributes']['POSITION']]; bv = J['bufferViews'][a['bufferView']]
                v = np.frombuffer(d, np.float32, count=3 * a['count'], offset=bo + bv.get('byteOffset', 0) + a.get('byteOffset', 0)).reshape(-1, 3)
                q = np.array([conv(p) for p in v[::3]])
                m = (np.abs(q[:, 0]) < 0.008 * self.s) & (q[:, 1] < eye[1] - 0.03 * self.s) & (q[:, 1] > eye[1] - 0.075 * self.s)
                if m.any():
                    c = q[m][np.argmax(q[m][:, 2])]
                    if best is None or c[2] > best[2]: best = c
        if best is None: return np.array([0.0, eye[1] - hd[1] - 0.05 * self.s, 0.08 * self.s])
        return best - hd + np.array([0.0, 0.0, 0.004])

    def fk(self, rot):
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


def two_bone(sk, rot, side, target, pole):
    """兩段式 IK（肩→肘→腕）：side 'l'／'r'；target＝手腕的世界位置；pole＝手肘要往的方向（世界）。
    上臂、前臂照「真的手肘」轉：手肘只繞鉸鏈彎（T 字時左手 −y、右手 +y：往前彎），上臂自己的扭轉照鉸鏈要朝哪裡決定；
    手腕先擺直（手和前臂同一個方向），手的方向之後 orient_hand 再設（翻手心的轉，大部分給前臂）"""
    ua, la, ha = sk.idx['upperarm_' + side], sk.idx['lowerarm_' + side], sk.idx['hand_' + side]
    R0, P0 = rest_world(sk)
    u0 = P0[la] - P0[ua]; l1 = np.linalg.norm(u0); u0 = u0 / l1
    v0 = P0[ha] - P0[la]; l2 = np.linalg.norm(v0); v0 = v0 / l2
    h0 = np.array([0.0, -1.0, 0.0]) if side == 'l' else np.array([0.0, 1.0, 0.0])
    wr, wp = sk.fk(rot)
    S = wp[ua]; T = np.asarray(target, float); dv = T - S; dist = np.linalg.norm(dv)
    dist = min(max(dist, abs(l1 - l2) + 1e-3), l1 + l2 - 1e-3); dn = dv / np.linalg.norm(dv); T = S + dn * dist
    ca = (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist); sa = math.sqrt(max(0.0, 1 - ca * ca))
    pv = np.asarray(pole, float); pv = pv - dn * np.dot(pv, dn); pv = pv / (np.linalg.norm(pv) or 1.0)
    En = S + dn * (l1 * ca) + pv * (l1 * sa)
    u = (En - S) / l1; v = (T - En) / np.linalg.norm(T - En)
    h = np.cross(u, v)
    if np.linalg.norm(h) < 1e-6: h = np.cross(u, pv)
    h = h / np.linalg.norm(h)
    Du = mat2q(basis(u, h) @ basis(u0, h0).T); Dl = mat2q(basis(v, h) @ basis(v0, h0).T)
    set_world_rot(sk, rot, wr, ua, qmul(Du, R0[ua])); wr, wp = sk.fk(rot)
    set_world_rot(sk, rot, wr, la, qmul(Dl, R0[la])); wr, wp = sk.fk(rot)
    set_world_rot(sk, rot, wr, ha, qmul(Dl, R0[ha]))
    return rot


def rest_world(sk):
    """靜止姿勢的 (世界旋轉, 世界位置)：存在骨架物件上（不要用 id() 當 key：舊骨架被回收以後新骨架會拿到同一個 id）"""
    if getattr(sk, '_rw', None) is None: sk._rw = sk.fk(sk.r)
    return sk._rw


def basis(f, n):
    """正交的三軸（直的三行）：f、n（扣掉 f 的分量）、f×n"""
    f = np.asarray(f, float); f = f / np.linalg.norm(f); n = np.asarray(n, float); n = n - f * np.dot(n, f); n = n / np.linalg.norm(n)
    return np.column_stack([f, n, np.cross(f, n)])


def mat2q(M):
    t = M[0, 0] + M[1, 1] + M[2, 2]
    if t > 0:
        s = math.sqrt(t + 1.0) * 2; q = [(M[2, 1] - M[1, 2]) / s, (M[0, 2] - M[2, 0]) / s, (M[1, 0] - M[0, 1]) / s, 0.25 * s]
    elif M[0, 0] > M[1, 1] and M[0, 0] > M[2, 2]:
        s = math.sqrt(1.0 + M[0, 0] - M[1, 1] - M[2, 2]) * 2; q = [0.25 * s, (M[0, 1] + M[1, 0]) / s, (M[0, 2] + M[2, 0]) / s, (M[2, 1] - M[1, 2]) / s]
    elif M[1, 1] > M[2, 2]:
        s = math.sqrt(1.0 + M[1, 1] - M[0, 0] - M[2, 2]) * 2; q = [(M[0, 1] + M[1, 0]) / s, 0.25 * s, (M[1, 2] + M[2, 1]) / s, (M[0, 2] - M[2, 0]) / s]
    else:
        s = math.sqrt(1.0 + M[2, 2] - M[0, 0] - M[1, 1]) * 2; q = [(M[0, 2] + M[2, 0]) / s, (M[1, 2] + M[2, 1]) / s, 0.25 * s, (M[1, 0] - M[0, 1]) / s]
    return qnorm(np.array(q))


def hand_axes(wp, sk, side):
    """手的方向（世界）：f＝手腕→中指根、n＝手心朝的方向、b＝f×n（往 b 轉＝手指往手心彎）"""
    h = wp[sk.idx['hand_' + side]]; f = wp[sk.idx['middle_01_' + side]] - h; f = f / np.linalg.norm(f)
    lat = wp[sk.idx['index_01_' + side]] - wp[sk.idx['pinky_01_' + side]]
    n = np.cross(f, lat) * (1 if side == 'l' else -1); n = n / np.linalg.norm(n)
    return f, n, np.cross(f, n)


def rest_hand(sk, side):
    c = sk.__dict__.setdefault('_rh', {})
    if side not in c:
        wr, wp = sk.fk(sk.r); f, n, b = hand_axes(wp, sk, side); c[side] = (basis(f, n), wr[sk.idx['hand_' + side]])
    return c[side]


def orient_hand(sk, rot, side, f, n, share=0.65):
    """手的方向設成 f（手指朝）、n（手心朝）。繞前臂的轉（手心翻上翻下）六成給前臂、四成給手腕——VRoid 沒有扭轉骨，全部放在手腕會扭成麻花"""
    B0, H0 = rest_hand(sk, side)
    Hd = qnorm(qmul(mat2q(basis(f, n) @ B0.T), H0))
    la, ha = sk.idx['lowerarm_' + side], sk.idx['hand_' + side]
    wr, wp = sk.fk(rot)
    dq = qmul(Hd, qinv(wr[ha]))
    if dq[3] < 0: dq = -dq
    a = wp[ha] - wp[la]; a = a / np.linalg.norm(a); p = np.dot(dq[:3], a) * a; tw = np.array([p[0], p[1], p[2], dq[3]])
    if share > 0 and np.linalg.norm(tw) > 1e-8:
        set_world_rot(sk, rot, wr, la, qmul(qslerp(np.array([0.0, 0.0, 0.0, 1.0]), qnorm(tw), share), wr[la])); wr, wp = sk.fk(rot)
    set_world_rot(sk, rot, wr, ha, Hd)
    return rot


def wrist_at(P, f, n, off):
    """off＝手上那一點相對手腕（沿 f、沿 n、沿 b，公尺）：P 要在那一點時，手腕在哪裡"""
    return np.asarray(P, float) - basis(f, n) @ np.asarray(off, float)


PALM = (0.075, 0.02, 0.0)            # 手掌中間（手心那一面）相對手腕（set_body 照人物的手換）
WRIST_LIM = {'flex': (-50.0, 60.0), 'uln': (-20.0, 30.0)}   # 手腕：往手背 50°～往手心 60°；往拇指那邊 20°～往小指那邊 30°


def wrist_meas(f, n, a, side):
    """前臂方向 a 在手的座標裡：屈（往手心＝正）、尺偏（往小指那邊＝正），度"""
    B = basis(f, n); ah = B.T @ np.asarray(a, float)
    flex = math.degrees(math.atan2(-ah[1], ah[0])); dv = math.degrees(math.atan2(-ah[2], ah[0]))
    return flex, (dv if side == 'l' else -dv), B, ah


def wrist_limit(f, n, a, side):
    """手腕超過範圍：整隻手轉回範圍的邊上（前臂不動）"""
    flex, uln, B, ah = wrist_meas(f, n, a, side)
    fl2 = min(max(flex, WRIST_LIM['flex'][0]), WRIST_LIM['flex'][1]); ul2 = min(max(uln, WRIST_LIM['uln'][0]), WRIST_LIM['uln'][1])
    if abs(fl2 - flex) < 0.5 and abs(ul2 - uln) < 0.5: return f, n, False
    dv2 = ul2 if side == 'l' else -ul2
    ah2 = np.array([1.0, -math.tan(math.radians(fl2)), -math.tan(math.radians(dv2))]); ah2 /= np.linalg.norm(ah2)
    Q = qbetween(B @ ah2, np.asarray(a, float))
    return qrot(Q, B[:, 0]), qrot(Q, B[:, 1]), True


def place_hand(sk, rot, side, P, f, n, pole, off=None, share=0.65):
    """手上 off 那一點（預設手掌中間）放到 P、手的方向 f／n；pole＝手肘往哪裡。手腕彎超過範圍就把手轉回來、再算一次手臂（最多三次）"""
    off = PALM if off is None else off; f = np.asarray(f, float); n = np.asarray(n, float)
    for _ in range(3):
        two_bone(sk, rot, side, wrist_at(P, f, n, off), pole)
        wr, wp = sk.fk(rot); a = wp[sk.idx['hand_' + side]] - wp[sk.idx['lowerarm_' + side]]; a = a / np.linalg.norm(a)
        f, n, changed = wrist_limit(f, n, a, side)
        if not changed: break
    return orient_hand(sk, rot, side, f, n, share)


def curl_fingers(sk, rot, side, amount, thumb=None):
    """手指往手心彎：amount＝{finger: 弧度}（'all'＝其他沒寫的；三節 0.8、1.0、0.9 倍）；thumb＝(往掌心轉, 彎)"""
    wr, wp = sk.fk(rot); hf, hn, hb = hand_axes(wp, sk, side)
    for f in ('index', 'middle', 'ring', 'pinky'):
        a = amount.get(f, amount.get('all', 0.0)) if isinstance(amount, dict) else amount
        for k, s in ((1, 0.8), (2, 1.0), (3, 0.9)):
            j = sk.idx['%s_0%d_%s' % (f, k, side)]; wr, wp = sk.fk(rot)
            set_world_rot(sk, rot, wr, j, qmul(qaxis(hb, a * s), wr[j]))
    if thumb is not None:
        wr, wp = sk.fk(rot)
        j = sk.idx['thumb_01_' + side]
        set_world_rot(sk, rot, wr, j, qmul(qaxis(hf if side == 'l' else -hf, thumb[0]), wr[j]))       # 往掌心轉（對掌）
        for k in (2, 3):
            wr, wp = sk.fk(rot); j = sk.idx['thumb_0%d_%s' % (k, side)]; c = sk.idx['thumb_0%d_%s' % (k + 1, side)] if k < 3 else sk.idx['thumb_04_leaf_' + side]
            palm_c = wp[sk.idx['hand_' + side]] + hf * PALM[0] + hn * PALM[1]
            ax = np.cross(wp[c] - wp[j], palm_c - wp[j])
            if np.linalg.norm(ax) > 1e-9: set_world_rot(sk, rot, wr, j, qmul(qaxis(ax, thumb[1]), wr[j]))   # 往手掌中間彎
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
def cyc(t, k, ph=0.0):
    """5 秒裡剛好 k 圈的 sin（頭尾接得起來）"""
    return math.sin(2 * math.pi * k * t / LOOP + ph)
def head_point(sk, rot, off):
    """頭上的一點（靜止姿勢時相對 Head 骨頭的位移，角色座標）→ 現在的世界位置"""
    wr, wp = sk.fk(rot); i = sk.idx['Head']; R0 = sk.fk(sk.r)[0][i]
    return wp[i] + qrot(qmul(wr[i], qinv(R0)), off)
def lerp(a, b, k): return np.asarray(a, float) + (np.asarray(b, float) - np.asarray(a, float)) * k
def rot_about(axis, ang, v): return qrot(qaxis(axis, ang), np.asarray(v, float))


# ---------------------------------------------------------------- 七個動作
# 角色座標：+z 前、+x 左手邊、y 上；坐姿骨盆 y≈0.92。桌面 y＝DESK_Y、桌子前緣 z＝EDGE（坐的人正前方）。
# 桌上的東西照 desk_props.glb（SEATACT 的 tset_／rset_：原點＝坐的人正前方的桌緣）：打開的筆電 item_laptop_open 中心離桌緣 0.112、底座深 0.212、厚 0.02；
# 攤開的筆記本 0.37×0.26、攤開的書 0.31×0.22；杯子 item_cup 直徑 0.094、高 0.123（喝飲料的杯子配件一樣大）。
DESK_Y, EDGE = 1.15, 0.25
MOUTH, EYES = (0.0, -0.012, 0.105), (0.0, 0.06, 0.09)     # 靜止姿勢時相對 Head 骨頭
CUP_R, CUP_H, CUP_GRIP = 0.047, 0.123, 0.062                # 杯子半徑、高、握的高度（＝desk_props 的 item_cup）
CUP_HAND = (0.072, 0.075, 0.0)                              # 杯子中心線（握的高度那一點）相對手腕：沿 f、沿 n（手心＋杯子半徑＋縫）、沿 b
PHONE_HAND = (0.085, 0.034, 0.0)                            # 手機中心相對手腕（手心上面、手機厚 0.8 cm）
PEN_HAND = (0.165, 0.045, -0.012)                           # 筆尖相對手腕（三指握筆）
REF = {'desk_h': 0.75, 'edge': 0.30, 'seat_h': 0.45}         # 參考的桌子：總圖自習桌（library3d.js studyTable：桌深 1.0、座位離桌心 0.8 → 桌緣離座位 0.30）
PAPER_Y = 0.0044                                            # 攤開的筆記本紙面離桌面（desk_props nb_top_y(0.08)＝4.1 mm＋0.3 mm）：寫字的筆尖碰到紙、不壓進去（LAWWW-C 11-04 21:42Z「壓進紙約 4～5 mm」）
# 碗（SEATACT S_meal 的 item_bowl_noodle：桌緣往裡 0.16、左右置中；desk_props item_bowl 口徑 16 cm、高 7.5 cm、湯面 0.058）
BOWL = {'z': 0.16, 'food': 0.062, 'wall_r': 0.0664, 'wall_y': 0.040}
# 右手的筷子（hand_chopsticks，NPC-ANIM-LOOPS-1104 補件）：兩支 23 cm，夾在虎口、上面那支（拇指那邊）和下面那支尖端靠在一起；
# 形狀寫在女生手（參考身材）的座標裡（f 手指、n 手心、b 拇指那邊；相對手腕、公尺）：虎口＝握筆的同一點，虎口後面露出 7.5 cm，往筷子尖的方向比握筆平一點（和手指差 28°）
CHOP = {'L': 0.23, 'back': 0.075, 'ax': (0.88, 0.30, -0.37), 'web': (0.55, 0.05, 0.35), 'sep_web': 0.009, 'sep_tip': 0.0015, 'w0': 0.0035, 'w1': 0.002}
C_ = np.diag([-1.0, 1.0, -1.0])                              # UAL 的方向 ↔ VRM 0.x（模型檔）：繞 y 轉半圈


def chop_geom_h(HL):
    """手的座標裡兩支筷子：([(尾端, 尖端)]×2, 兩個尖端的中點, 拇指方向)"""
    a = np.array(CHOP['ax'], float); a /= np.linalg.norm(a)
    web = np.array(CHOP['web'], float) * HL
    bp = np.array([0.0, 0.0, 1.0]) - a * a[2]; bp /= np.linalg.norm(bp)
    tip = web + a * (CHOP['L'] - CHOP['back']); sticks = []
    for sg in (1.0, -1.0):                                   # 上面那支（拇指那邊）、下面那支
        t_ = tip + sg * CHOP['sep_tip'] * bp; w_ = web + sg * CHOP['sep_web'] * bp
        d = (t_ - w_) / np.linalg.norm(t_ - w_); sticks.append((t_ - d * CHOP['L'], t_))
    return sticks, tip, bp


_REF_F = []
def ref_female():
    if not _REF_F: _REF_F.append(VSkel(*BODIES['F']))
    return _REF_F[0]


def chop_bone():
    """筷子在右手骨頭的座標（模型檔的方向、單位；GLB 的頂點照這個）：女生骨架靜止時（骨頭都沒有旋轉）換算。回傳 ([(尾, 尖)]×2, 尖端中點)"""
    VF = ref_female(); wr, wp = VF.fk(VF.r); f, n, b = hand_axes(wp, VF, 'r'); B0 = basis(f, n)
    sticks, tip, _ = chop_geom_h(VF.HL); cv = lambda x: C_ @ (B0 @ x) / VF.s
    return [(cv(p0), cv(p1)) for p0, p1 in sticks], cv(tip)


def hand_rest(V):
    wr, wp = V.fk(V.r); f, n, b = hand_axes(wp, V, 'r'); return basis(f, n)


def prop_on(V, off_F):
    """女生的手座標裡的一點 off_F（配件照它做）掛在 V 的右手以後，在 V 的手座標裡是哪裡（女生＝原樣）"""
    VF = ref_female(); xb = C_ @ (hand_rest(VF) @ np.asarray(off_F, float)) / VF.s     # 右手骨頭的座標（模型檔）
    return tuple(float(x) for x in hand_rest(V).T @ (C_ @ xb * V.s))


def chop_on(V):
    """同一副筷子（同一個 GLB）掛在 V 的右手：遊戲照人物縮放（V.s），男生的手座標裡尖端在哪裡、筷子朝哪裡（女生＝照設計）"""
    sb, tb = chop_bone(); wr, wp = V.fk(V.r); f, n, b = hand_axes(wp, V, 'r'); B0 = basis(f, n)
    h = lambda xb: B0.T @ (C_ @ xb * V.s)
    s0 = [(h(p0), h(p1)) for p0, p1 in sb]; ax = sum((p1 - p0) for p0, p1 in s0); ax = ax / np.linalg.norm(ax)
    return h(tb), ax


def chop_hand(d, u_h, up=(0.2, 1.0, -0.1)):
    """筷子（手的座標裡朝 u_h）要朝世界的 d、拇指那邊盡量朝 up：回傳手的 f、n"""
    u_h = np.asarray(u_h, float); u_h = u_h / np.linalg.norm(u_h)
    c2 = np.array([0.0, 0.0, 1.0]) - u_h * u_h[2]; c2 /= np.linalg.norm(c2); Ch = np.column_stack([u_h, c2, np.cross(u_h, c2)])
    d = np.asarray(d, float); d = d / np.linalg.norm(d); up = np.asarray(up, float); w2 = up - d * np.dot(up, d); w2 /= np.linalg.norm(w2)
    Bm = np.column_stack([d, w2, np.cross(d, w2)]) @ Ch.T
    return Bm[:, 0], Bm[:, 1]


def _dir(yaw, pitch, fwd):
    """方向：yaw 度從 fwd（+1＝往前 +z、−1＝往後 −z）往左（+x）轉、pitch 度往上"""
    y, p = math.radians(yaw), math.radians(pitch); return (math.sin(y) * math.cos(p), math.sin(p), fwd * math.cos(y) * math.cos(p))


def _up(d, roll):
    """拇指那邊：和 d 垂直、最朝上的方向再繞 d 轉 roll 度"""
    d = np.asarray(d, float); pp = np.array([0.0, 1.0, 0.0]) - d * d[1]; pp /= np.linalg.norm(pp); return tuple(rot_about(d, math.radians(roll), pp))


# 吃飯的筷子方向、拇指、手肘（照兩種身材在遊戲的骨架上找的：筷子朝的方向和要的一樣、手腕彎在範圍裡、手和手指不碰到碗和桌面；tools/anim 的搜尋見 README）
#   碗裡：筷子往左前下插進碗（女生的桌子在胸口：筷子平一點 20°、手肘低；男生 38°）；嘴邊：筷子從右前方往左、往上一點送進嘴（往左 70°、往上 23°），手肘往外
EAT = {'F': {'db': _dir(40, -20, 1), 'rb': -40, 'pb': (-0.9, -0.4, 0.2), 'dm': _dir(70, 23, -1), 'rm': 0, 'pm': (-0.8, -0.6, 0.0)},
       'M': {'db': _dir(40, -38, 1), 'rb': -60, 'pb': (-0.9, -0.4, 0.2), 'dm': _dir(70, 23, -1), 'rm': 0, 'pm': (-0.8, -0.6, 0.0)},
       'F2': {'db': _dir(40, -20, 1), 'rb': -40, 'pb': (-0.9, -0.4, 0.2), 'dm': _dir(70, 23, -1), 'rm': 0, 'pm': (-0.8, -0.6, 0.0)},
       'M2': {'db': _dir(50, -38, 1), 'rb': -60, 'pb': (-0.9, -0.4, 0.2), 'dm': _dir(70, 23, -1), 'rm': 20, 'pm': (-0.9, -0.4, 0.2)}}
CHOP_DB, CHOP_DM = EAT['F']['db'], EAT['F']['dm']           # set_body 照那一種身材換
CHOP_UPB, CHOP_UPM = _up(CHOP_DB, EAT['F']['rb']), _up(CHOP_DM, EAT['F']['rm'])   # 拇指那邊盡量朝哪裡（碗裡、嘴邊）
CHOP_POLEB, CHOP_POLEM = EAT['F']['pb'], EAT['F']['pm']     # 手肘往哪裡（碗裡、嘴邊）
CHOP_TIP, CHOP_AXH = (0.172, 0.05, -0.034), (0.88, 0.30, -0.37)   # set_body 照那一種身材換（chop_on）


def body_of(V):
    """V 是 BODIES 的哪一種（照 VRM 檔、身高）"""
    return next((k for k, (p, h) in BODIES.items() if os.path.normpath(p) == os.path.normpath(V.vrm) and abs(h - V.H) < 1e-6), 'F')


def set_body(V):
    """換成某一種身材（VSkel）：桌子在那個骨架座標裡的位置、手上各點照那雙手的長度"""
    global DESK_Y, EDGE, MOUTH, EYES, PALM, CUP_HAND, PHONE_HAND, PEN_HAND, CHOP_TIP, CHOP_AXH, CHOP_DB, CHOP_DM, CHOP_UPB, CHOP_UPM, CHOP_POLEB, CHOP_POLEM
    HL = V.HL
    DESK_Y = REF['desk_h'] + sit_drop(V)                       # 遊戲坐下＝整個人往下 sit_drop（character3d.js C.sitDropOf）：站著的座標裡桌子就高這麼多
    EDGE = REF['edge']
    MOUTH, EYES = V.mouth, V.eyes
    PALM = (0.6 * HL, 0.17 * HL, 0.0)
    # 手上配件的定位點：配件（hand_props.glb）照女生的手做、掛在右手骨頭上，遊戲照人物縮放——男生（縮放 0.907、手長 1.02 倍）手上的配件比照他的手算的近手腕約 9%。
    # 所以每一種身材都用「那個配件真的掛上去以後」的位置擺手（女生＝設計值；prop_on）：杯子握的那一點、手機中心、筆尖、筷子尖（LAWWW-C 21:42Z 筆尖壓進紙也和這個有關）
    HF = ref_female().HL
    CUP_HAND = prop_on(V, (0.6 * HF, 0.17 * HF + CUP_R + 0.003, 0.0))
    PHONE_HAND = prop_on(V, (0.68 * HF, 0.17 * HF + 0.004, 0.0))
    PEN_HAND = prop_on(V, (1.35 * HF, 0.37 * HF, -0.1 * HF))
    CHOP_TIP, CHOP_AXH = chop_on(V)
    bk = body_of(V); E = EAT.get(bk, EAT[bk[0]])
    CHOP_DB, CHOP_DM, CHOP_POLEB, CHOP_POLEM = E['db'], E['dm'], E['pb'], E['pm']; CHOP_UPB, CHOP_UPM = _up(E['db'], E['rb']), _up(E['dm'], E['rm'])


def task_pose(sk, rot, kind, t):
    """在坐姿上改：先改身體（前傾、低頭），再擺手（手的位置照改過的肩膀算）。t＝秒（0～LOOP）"""
    head_pitch, lean = 0.0, 0.0
    k_sip = pulse(t, 1.7, 2.9, 0.6) if kind == 'drink' else 0.0
    u_eat = t % (LOOP / 2); k_eat = pulse(u_eat, 1.0, 1.35, 0.55) if kind == 'eat' else 0.0
    if kind in ('type', 'typepad'): lean, head_pitch = 0.07, 0.2 + 0.03 * cyc(t, 1, 0.8)      # 看螢幕（不是看鍵盤）：頭低一點就好
    elif kind == 'write': lean, head_pitch = 0.16, 0.42
    elif kind == 'phone': lean, head_pitch = 0.08, 0.5
    elif kind == 'page': lean, head_pitch = 0.1, 0.45
    elif kind == 'drink': lean, head_pitch = 0.04, 0.15 - 0.32 * k_sip
    elif kind == 'eat': lean, head_pitch = 0.14 - 0.04 * k_eat, 0.34 - 0.12 * k_eat   # SIT-HEIGHT-1104（BB-C 22:43「吃飯都彎很低，頭幾乎埋到碗上」）：坐高以後少彎一點（原本 0.2／0.4）
    if lean: rot = add_local(sk, rot, 'spine_03', (1, 0, 0), lean * 0.5); rot = add_local(sk, rot, 'spine_02', (1, 0, 0), lean * 0.5)
    if head_pitch: rot = add_local(sk, rot, 'neck_01', (1, 0, 0), head_pitch * 0.4); rot = add_local(sk, rot, 'Head', (1, 0, 0), head_pitch * 0.6)
    D = DESK_Y

    def rest_left(z=0.345, x=0.13):                                  # 左手平放在桌上（手心朝下、手指往前偏右）
        place_hand(sk, rot, 'l', (x, D + 0.005 + PALM[1], z), (-0.45, -0.1, 1.0), (-0.12, -1.0, 0.0), (0.45, -1.0, -0.3))
        curl_fingers(sk, rot, 'l', {'all': 0.28, 'index': 0.22}, thumb=(0.25, 0.15))

    if kind in ('type', 'typepad'):
        kp = pulse(t, 1.6, 3.4, 0.45) if kind == 'typepad' else 0.0
        for side, sx in (('l', 1.0), ('r', -1.0)):
            ph = 0.0 if side == 'l' else 1.9
            P = np.array([sx * 0.085 + 0.006 * cyc(t, 1, ph), D + 0.024 + PALM[1] + 0.0025 * cyc(t, 9, ph), EDGE + 0.083 + 0.005 * cyc(t, 2, ph)])   # 手掌在筆電的手腕墊上面
            f = np.array([-sx * 0.22, -0.1, 1.0]); n = np.array([-sx * 0.25, -1.0, 0.0])
            taps = {'index': (8, 0.3), 'middle': (7, 2.1), 'ring': (6, 4.0)} if side == 'l' else {'index': (9, 1.2), 'middle': (7, 3.3), 'ring': (5, 5.1)}
            curl = {fn: 0.42 + 0.3 * max(0.0, cyc(t, kk, pp + ph)) ** 6 for fn, (kk, pp) in taps.items()}; curl['pinky'] = 0.55
            if side == 'r' and kp > 0:                               # 右手去觸控板（筆電前緣中間）：手比較平、食指伸直、小小地畫圈
                P = lerp(P, (-0.04 + 0.012 * cyc(t, 3), D + 0.02 + PALM[1], EDGE + 0.0 + 0.008 * cyc(t, 2, 1.0)), kp)
                f = lerp(f, (0.38, -0.12, 1.0), kp); n = lerp(n, (0.12, -1.0, 0.0), kp)
                curl = {fn: c * (1 - kp) + {'index': 0.12, 'middle': 0.42, 'ring': 0.55, 'pinky': 0.65}[fn] * kp for fn, c in curl.items()}
            place_hand(sk, rot, side, P, f, n, (sx * 0.35, -1.0, -0.35))
            curl_fingers(sk, rot, side, curl, thumb=(0.3, 0.2))
    elif kind == 'write':
        if t < 4.2:                                                  # 一行七個字（每個字 0.6 秒：幾筆小筆畫、筆畫之間抬筆）往右寫；最後 0.8 秒回到行頭
            c = t / 0.6; cu = c - int(c)
            tip = np.array([-0.02 - 0.0135 * c - 0.004 * math.sin(2 * math.pi * cu * 3.0), D + PAPER_Y + 0.0035 * max(0.0, math.sin(2 * math.pi * cu * 3.0 + 1.2)) ** 2, EDGE + 0.15 + 0.004 * math.cos(2 * math.pi * cu * 2.0)])   # 筆尖在紙面上（不是桌面）
        else:
            k = smooth((t - 4.2) / 0.8); x0 = -0.02 - 0.0135 * 7
            tip = np.array([x0 + (-0.02 - x0) * k, D + PAPER_Y + 0.03 * math.sin(math.pi * k), EDGE + 0.154])
        place_hand(sk, rot, 'r', tip, (0.42, -0.2, 1.0), (0.62, -0.78, 0.1), (-0.5, -1.0, -0.2), off=PEN_HAND)
        curl_fingers(sk, rot, 'r', {'index': 0.5, 'middle': 0.68, 'ring': 1.05, 'pinky': 1.15}, thumb=(0.65, 0.3))
        place_hand(sk, rot, 'l', (0.12, D + 0.007 + PALM[1], EDGE + 0.12), (-0.5, -0.08, 1.0), (-0.15, -1.0, 0.0), (0.45, -1.0, -0.3))   # 左手壓著筆記本的左頁
        curl_fingers(sk, rot, 'l', {'all': 0.12}, thumb=(0.2, 0.1))
    elif kind == 'phone':
        eyes = head_point(sk, rot, EYES)
        Pp = np.array([-0.055, D + 0.1, EDGE + 0.03])                # 右手拿手機、在桌子前緣上面一點；螢幕朝眼睛
        s_ = eyes - Pp; s_ /= np.linalg.norm(s_)
        l_ = np.array([0.0, 0.35, 1.0]); l_ = l_ - s_ * np.dot(l_, s_); l_ /= np.linalg.norm(l_)   # 手機的長邊（往上那一頭）
        m_ = np.cross(l_, s_); m_ = m_ if m_[0] > 0 else -m_
        f = l_ * math.cos(0.45) + m_ * math.sin(0.45)                # 手機斜斜躺在手心：手指從手機左邊包過去
        swipe = max(0.0, cyc(t, 3, -1.2)) ** 3                       # 拇指往上滑（5 秒 3 次）
        place_hand(sk, rot, 'r', Pp + 0.004 * swipe * l_, f, s_, (-0.4, -1.0, -0.2), off=PHONE_HAND)
        curl_fingers(sk, rot, 'r', {'index': 0.78, 'middle': 0.9, 'ring': 1.0, 'pinky': 1.05}, thumb=(0.55, 0.12 + 0.45 * swipe))
        rest_left(z=EDGE + 0.08, x=0.12)
    elif kind == 'page':
        u = min(1.0, max(0.0, (t - 1.7) / 1.3)); bell = math.sin(math.pi * u) ** 2   # 1.7～3.0 秒：右手捏起右頁的角、翻到中間、放手、回來
        for side, sx in (('l', 1.0), ('r', -1.0)):
            P = np.array([sx * 0.105, D + 0.027 + PALM[1], EDGE + 0.085]); f = np.array([-sx * 0.32, -0.15, 1.0]); n = np.array([-sx * 0.15, -1.0, 0.0])
            curl = 0.2
            if side == 'r' and bell > 0:
                P = P + bell * np.array([0.095, 0.09, 0.01])
                roll = 1.35 * bell                                   # 手心從朝下翻到朝書溝（右手往外翻）
                f2 = f / np.linalg.norm(f); n = rot_about(f2, roll, n); f = rot_about(np.cross(f2, n), -0.25 * bell, f)
                curl = 0.2 + 0.25 * bell
            place_hand(sk, rot, side, P, f, n, (sx * 0.4, -1.0, -0.3))
            curl_fingers(sk, rot, side, {'all': curl}, thumb=(0.3 + (0.3 * bell if side == 'r' else 0.0), 0.2))
    elif kind == 'drink':
        mouth = head_point(sk, rot, MOUTH)
        tilt = 0.8 * k_sip ** 1.6                                    # 杯口往嘴邊傾
        ax_c = rot_about((1, 0, 0), -tilt, (0, 1, 0))
        C0 = np.array([-0.165, D, EDGE + 0.09])                      # 杯底（放在桌上的時候）
        e_c = rot_about((1, 0, 0), -tilt, (0, 0, 1))                 # 杯口平面裡往前（離開臉）的方向
        C1 = mouth + np.array([0.0, -0.006, 0.0]) + e_c * CUP_R + ax_c * 0.002 - ax_c * CUP_H   # 靠臉那一邊的杯緣貼著下唇（杯口中心在它前上方一個半徑）
        Cb = lerp(C0, C1, smooth(k_sip)) + np.array([0.0, 0.025, 0.0]) * math.sin(math.pi * k_sip)
        grip = Cb + ax_c * CUP_GRIP
        f = rot_about((1, 0, 0), -tilt, (0.25, 0.0, 1.0)); n = rot_about((1, 0, 0), -tilt, (1.0, 0.0, -0.25))   # 手心朝杯子（左邊）、虎口朝上
        place_hand(sk, rot, 'r', grip, f, n, lerp((-0.7, -0.8, -0.15), (-0.55, -1.0, 0.2), k_sip), off=CUP_HAND)
        curl_fingers(sk, rot, 'r', {'index': 0.62, 'middle': 0.68, 'ring': 0.74, 'pinky': 0.82}, thumb=(0.55, 0.25))
        rest_left()
    elif kind == 'eat':                                              # 照筷子尖擺手（同寫字照筆尖）：在碗裡夾麵 → 送到嘴邊，每 2.5 秒一口；左手扶著碗的左前側
        mouth = head_point(sk, rot, MOUTH)
        e = smooth(k_eat)
        Tb = np.array([0.004 * cyc(t, 4), D + BOWL['food'], EDGE + BOWL['z'] - 0.012 + 0.004 * cyc(t, 6)])   # 筷子尖在碗裡的麵上（碗心往人那邊 1.2 cm）
        Tm = mouth + np.array([-0.004, -0.008, 0.012])               # 筷子尖到下唇前面
        T_ = lerp(Tb, Tm, e) + np.array([0.0, 0.035, 0.0]) * math.sin(math.pi * e)   # 先往上夾起來、再往嘴邊
        f, n = chop_hand(lerp(CHOP_DB, CHOP_DM, e), CHOP_AXH, lerp(CHOP_UPB, CHOP_UPM, e))
        place_hand(sk, rot, 'r', T_, f, n, lerp(CHOP_POLEB, CHOP_POLEM, e), off=CHOP_TIP)
        curl_fingers(sk, rot, 'r', {'index': 0.35, 'middle': 0.55, 'ring': 0.95, 'pinky': 1.05}, thumb=(0.6, 0.3))
        rd = np.array([0.6, 0.0, -0.8])                              # 碗心 → 左手：碗的左前側（往左、往人那邊；S_meal 的盤子在左後方 x 0.2、z 0.13，碰不到）
        Pl = np.array([0.0, D + BOWL['wall_y'], EDGE + BOWL['z']]) + rd * (BOWL['wall_r'] + 0.003)
        place_hand(sk, rot, 'l', Pl, (0.8, 0.3, 0.6), -rd, (0.45, -1.0, -0.3))   # 手心貼著碗壁、手指往左前繞著碗
        curl_fingers(sk, rot, 'l', {'all': 0.3, 'index': 0.25}, thumb=(0.4, 0.25))
    return rot


CLIPS = [('Sit_Type_Loop', 'type', '打字（雙手在桌上的鍵盤：手指輪流敲）'), ('Sit_TypePad_Loop', 'typepad', '打字＋觸控板（右手每 5 秒去觸控板一次）'),
         ('Sit_Write_Loop', 'write', '寫字（右手寫、左手壓紙）'), ('Sit_Phone_Loop', 'phone', '滑手機（雙手拿在胸前、右手拇指滑）'),
         ('Sit_Page_Loop', 'page', '看書、翻頁（書攤在桌上，右手每 5 秒翻一頁）'), ('Sit_Drink_Loop', 'drink', '喝飲料（右手握杯，每 5 秒喝一口；杯子配件掛 hand_r）'),
         ('Sit_Eat_Loop', 'eat', '吃飯（右手筷子／湯匙從碗送到嘴邊，每 2.5 秒一口；左手扶碗）')]
ARM = ['clavicle', 'upperarm', 'lowerarm', 'hand', 'index', 'middle', 'ring', 'pinky', 'thumb']


def vroid_pose(sk, base_rot, V, kind, t):
    """UAL 坐姿循環的一格（區域旋轉）→ VRoid 骨架（骨盆不轉，同遊戲）→ 擺手；回傳 VRoid 骨架的區域旋轉"""
    R0u = rest_world(sk)[0]; wu, _ = sk.fk(base_rot)
    Wv = [None] * V.n
    for i in V.order:
        nm = V.name[i]; j = sk.idx.get(nm)
        if nm == 'pelvis' or j is None or LEAF(nm): Wv[i] = Wv[V.par[i]] if V.par[i] >= 0 else np.array([0.0, 0.0, 0.0, 1.0])
        else: Wv[i] = qnorm(qmul(wu[j], qinv(R0u[j])))
    rv = [qnorm(qmul(qinv(Wv[V.par[i]]), Wv[i])) if V.par[i] >= 0 else Wv[i] for i in range(V.n)]
    return task_pose(V, rv, kind, t)


# 坐下往下移多少（SIT-HEIGHT-1104，和遊戲 character3d.js 的 C.sitDropOf 一樣）：tools/anim/sit_fit.json（tools/anim/sit_fit_survey.js 在遊戲骨架上量的）的 ul、B，
# 往下＝H×(ul−B)−(SIT_TOP−SIT_PRESS)＝大腿底部在座位地面上 0.465 m；表裡沒有的照舊 0.47×H/1.75。環境變數 SIT_DROP_OLD=1＝舊的（量改前的數字用）
SIT_TOP, SIT_PRESS = 0.47, 0.005
SIT_FIT = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sit_fit.json'), encoding='utf-8'))


def sit_drop(V):
    f = SIT_FIT.get(os.path.basename(V.vrm))
    if os.environ.get('SIT_DROP_OLD') or not f: return 0.47 * V.H / 1.75
    return round(V.H * (f['ul'] - f['B']) - (SIT_TOP - SIT_PRESS), 4)


BODIES = {'F': ('assets/models/char/vroid_npc_f1.vrm', 1.62), 'M': ('assets/models/char/vroid_npc_m1.vrm', 1.74),   # 女生、男生的 VRoid 底模＋遊戲裡的身高（char.npc_f1／npc_m1 的 height）
          'F2': ('assets/models/char/second_ai/bl_npc_nf10.vrm', 1.65), 'M2': ('assets/models/char/second_ai/bl_npc_nm11.vrm', 1.74)}
# F2、M2（LAWWW-C 11-04 21:42Z 補件 2）：手臂比較短的女生骨架（Victoria_Rubin 改的 nf1、3、7、10、13、16、19：手臂÷身高 0.251，F 是 0.262）、手臂比較長的男生骨架
#（HairSample_Male 改的 nm1、3、5…19、m2：0.266，M 是 0.244；肩膀也比同身高的 M 低 1.6 cm）。身高取那一組的中位數（nf10 1.65、nm11 1.74）


def edge_sfx(e):
    """桌緣離座位 e 公尺的那一組片段名字的尾巴：參考的 0.30＝''、其他＝_E<公分>（0.20＝_E20）"""
    return '' if abs(e - 0.30) < 1e-6 else '_E%02d' % int(round(e * 100))


def build(src, bodies=None, only=None, edges=(0.30,)):
    """每一種身材、每一個動作：①UAL 坐姿循環的世界旋轉差 D 套到 VRoid 骨架（骨盆不轉，同遊戲）②在 VRoid 骨架上擺手（桌子照參考位置）
    ③VRoid 的世界旋轉差寫回 UAL 骨架（W＝D × UAL 的靜止世界旋轉；沒對到的節點照坐姿循環）→ 遊戲換算回來就是 ②"""
    J, d, bo = load_glb(src); sk = Skel(J)
    times = [k / FPS for k in range(int(LOOP * FPS) + 1)]
    base, base_len = sample_clip(J, d, bo, sk, 'Sitting_Idle_Loop', times)
    assert abs(LOOP / base_len - round(LOOP / base_len)) < 0.02, ('LOOP 要是坐姿循環的整數倍', LOOP, base_len)
    R0u = sk.fk(sk.r)[0]
    clips = []
    for (bk, e) in [(b, e) for e in edges for b in (bodies or BODIES)]:
        REF['edge'] = e; sfx = edge_sfx(e)                                    # 桌緣比較近的桌子（Café、吃飯的店：桌緣 0.14～0.25）另外一組：名字多 _E20（CAFE-EDGE-1105）
        vrm, H = BODIES[bk]; V = VSkel(vrm, H); set_body(V)
        for name, kind, desc in CLIPS:
            if only and kind not in only: continue
            frames = []
            for fi, tt in enumerate(times):
                rv = vroid_pose(sk, base[fi], V, kind, tt)
                wv, _ = V.fk(rv)
                Wu = [None] * sk.n; out = [None] * sk.n
                for i in sk.order:
                    nm = sk.name[i]; p = sk.par[i]
                    if nm in V.idx and nm != 'pelvis' and not LEAF(nm): Wu[i] = qnorm(qmul(wv[V.idx[nm]], R0u[i]))
                    else: Wu[i] = qnorm(qmul(Wu[p], base[fi][i])) if p >= 0 else base[fi][i]
                    out[i] = qnorm(qmul(qinv(Wu[p]), Wu[i])) if p >= 0 else Wu[i]
                frames.append(out)
            frames[-1] = [q.copy() for q in frames[0]]                          # 頭尾一樣（循環）
            clips.append((name.replace('_Loop', '_%s%s_Loop' % (bk, sfx)), kind, desc + '（%s：%s，身高 %.2f m%s）' % ('女生' if bk[0] == 'F' else '男生', os.path.basename(vrm), H, '；桌緣 %.2f m' % e if sfx else ''), frames, bk + sfx))
    REF['edge'] = edges[0]
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
    for name, kind, desc, frames, bk in clips:
        an = {'name': name, 'channels': [], 'samplers': [], 'extras': {'desc': desc, 'loop': LOOP, 'kind': kind, 'body': bk, 'ref': dict(REF, edge=(int(bk.split('_E')[1]) / 100 if '_E' in bk else REF['edge']), height=BODIES[bk.split('_E')[0]][1])}}
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
    ap.add_argument('--json'); ap.add_argument('--only', nargs='*'); ap.add_argument('--bodies', nargs='*'); ap.add_argument('--tol', type=float, default=0.0015)
    ap.add_argument('--edges', default='0.30', help='參考桌緣（逗號分開）：0.30＝總圖自習桌；0.20＝Café、吃飯的店的近桌（片段名字 _E20），第二個以後只做 --near-bodies')
    ap.add_argument('--near-bodies', nargs='*', default=['F', 'M'])
    A = ap.parse_args()
    EDGES = [float(x) for x in A.edges.split(',')]
    J, d, bo, sk, times, clips = build(A.src, A.bodies, A.only, EDGES[:1])
    if len(EDGES) > 1:
        for e in EDGES[1:]: clips += build(A.src, A.near_bodies, A.only, (e,))[5]
    PAIRS = [(bk, EDGES[0]) for bk in (A.bodies or BODIES)] + [(bk, e) for e in EDGES[1:] for bk in A.near_bodies]
    n = write_glb(A.out, J, sk, times, clips, A.tol)
    expect = {}
    J2, d2, bo2 = load_glb(A.src); sk2 = Skel(J2); tt = [0.0, 1.0, 2.35]; bs, _ = sample_clip(J2, d2, bo2, sk2, 'Sitting_Idle_Loop', tt)
    chop = {}; hands0 = {}
    for bk0, e in PAIRS:
        REF['edge'] = e; bk = bk0 + edge_sfx(e)
        V = VSkel(*BODIES[bk0]); set_body(V); drop = sit_drop(V)
        sv = lambda p: [round(float(p[0]), 4), round(float(p[1] - drop), 4), round(float(p[2]), 4)]   # 坐下以後的人物座標
        for kind in ('type', 'drink', 'write', 'eat'):
            for k, t in enumerate(tt):
                rv = vroid_pose(sk2, bs[k], V, kind, t); wv, pv = V.fk(rv)
                expect['%s_%s_%.2f' % (bk, kind, t)] = {b: sv(pv[V.idx[b]]) for b in ('hand_r', 'hand_l', 'middle_01_r', 'Head')}
                if kind == 'eat':                                   # 筷子尖（掛在右手的 hand_chopsticks）、嘴
                    f, nn, b = hand_axes(pv, V, 'r'); tip = pv[V.idx['hand_r']] + basis(f, nn) @ np.array(CHOP_TIP); mo = head_point(V, rv, MOUTH)
                    chop.setdefault(bk, {})['%.2f' % t] = {'tip': sv(tip), 'mouth': sv(mo), 'tip_mouth': round(float(np.linalg.norm(tip - mo)), 4),
                                                           'bowl': [0.0, round(REF['desk_h'] + BOWL['food'], 4), round(REF['edge'] + BOWL['z'] - 0.012, 4)]}
        for kind in [k for _, k, _ in CLIPS]:                        # 每一種片段 0 秒的兩手手腕（遊戲 character3d.js C.SIT_TASK.HANDS 用）
            rv = vroid_pose(sk2, bs[0], V, kind, 0.0); wv, pv = V.fk(rv)
            hands0.setdefault(bk, {})[kind] = {'l': sv(pv[V.idx['hand_l']]), 'r': sv(pv[V.idx['hand_r']])}
    sip = {}
    for bk0, e in PAIRS:
        REF['edge'] = e; bk = bk0 + edge_sfx(e)
        V = VSkel(*BODIES[bk0]); set_body(V); rv = vroid_pose(sk2, bs[2], V, 'drink', 2.35); wv, pv = V.fk(rv)
        f, nn, b = hand_axes(pv, V, 'r'); grip = pv[V.idx['hand_r']] + basis(f, nn) @ np.array(CUP_HAND); rim = grip + b * (CUP_H - CUP_GRIP)
        mo = head_point(V, rv, MOUTH); tw = mo - rim; tw = tw - b * np.dot(tw, b); near = rim + tw / np.linalg.norm(tw) * CUP_R   # 杯緣靠嘴那一點
        sip[bk] = {'rim_center': round(float(np.linalg.norm(rim - mo)), 4), 'rim_near': round(float(np.linalg.norm(near - mo)), 4)}
    REF['edge'] = EDGES[0]
    info = {'out': A.out, 'bytes': n, 'fps': FPS, 'loop': LOOP, 'ref': REF, 'refs': {(edge_sfx(e) or 'base'): e for e in EDGES}, 'bodies': {k: {'vrm': v[0], 'height': v[1]} for k, v in BODIES.items()},
            'expect': {'note': '坐下以後的人物座標（x 左手邊、y 上、z 前；原點＝座位的地面）：手腕 hand、中指根 middle_01、頭；sip＝喝的那一下（2.35 秒）杯口中心離嘴幾公尺；'
                               'chop＝吃飯 0／1／2.35 秒筷子尖（hand_chopsticks 掛在右手）、嘴、碗裡夾麵的那一點；hands0＝每一種片段 0 秒的兩手手腕（character3d.js C.SIT_TASK.HANDS）；tests/sit_task_loops_unit.js 用',
                       'pos': expect, 'sip': sip, 'chop': chop, 'hands0': hands0},
            'clips': [{'name': nm, 'kind': k, 'body': bk, 'desc': ds} for nm, k, ds, _, bk in clips]}
    if A.json: json.dump(info, open(A.json, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(json.dumps(info, ensure_ascii=False))
