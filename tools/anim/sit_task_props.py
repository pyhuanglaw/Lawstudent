#!/usr/bin/env python3
"""坐著做事的手上配件（NPC-ANIM-LOOPS-1104，LAWWW2-C 2026-11-04）：杯子、手機、筆——掛在人物的右手（PROPS 的 bone:'rightHand'＝VRoid 的 J_Bip_R_Hand）。
網格照 desk_props.py 的 item_cup／item_phone／item_pen（同一張貼圖集，和桌上的那一個一模一樣）；位置、方向照 sit_task_loops.py 的片段算：
  ①在女生 VRoid 骨架上播那個片段的第一格（喝飲料、滑手機、寫字），②那一格裡配件在世界的位置、方向（杯子中心線在手心前 CUP_HAND、手機躺在手心、筆尖在 PEN_HAND），
  ③換算成右手骨頭的座標（VRoid 的骨頭靜止時沒有旋轉：骨頭座標＝模型檔座標，x 人物右邊、y 上、z 後面；位置用模型檔的單位＝除以遊戲的縮放）。
GLB：根節點 hand_props 底下三個網格 hand_cup、hand_phone、hand_pen（各自已經擺好，掛上去不用再轉）。
另外檢查：配件和手在片段的每一格都是一起動的（相對位置不變），不然掛在骨頭上會滑。

用法（Blender 的 Python）：
  /opt/blenv/bin/python tools/anim/sit_task_props.py --src assets/models/char/ual_sit_clips.glb [--glb assets/models/char/second_ai/hand_props.glb]
"""
import json, math, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT, 'tools', 'blender', 'env_second'))
ARGV = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
def arg(k, dv): return ARGV[ARGV.index(k) + 1] if k in ARGV else dv
SRC = arg('--src', 'assets/models/char/ual_sit_clips.glb'); OUT = arg('--glb', 'assets/models/char/second_ai/hand_props.glb')
sys.argv = [sys.argv[0]]                                   # desk_props 讀 sys.argv 的 --out：不要讓它讀到這裡的參數
import sit_task_loops as T
import desk_props as DP
from lib2 import B, bpy
L = DP.L
os.chdir(ROOT)

J, d, bo = T.load_glb(SRC); sk = T.Skel(J)
times = [k / T.FPS for k in range(int(T.LOOP * T.FPS) + 1)]
base, _ = T.sample_clip(J, d, bo, sk, 'Sitting_Idle_Loop', times)
V = T.VSkel(T.BODIES['F'][0], T.BODIES['F'][1]); T.set_body(V)
C = np.diag([-1.0, 1.0, -1.0])                               # UAL 的方向 → VRM 0.x（模型檔）


def qmat(q):
    x, y, z, w = q
    return np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)], [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)], [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])


def frame_cols(y, z):
    """網格的方向：局部 y → y、局部 z → z（正交化），x＝y×z"""
    y = y / np.linalg.norm(y); z = z - y * np.dot(z, y); z = z / np.linalg.norm(z); return np.column_stack([np.cross(y, z), y, z])


def prop_world(kind, wv, pv):
    """這一格裡配件的世界位置、方向（VRoid 骨架、UAL 的方向、公尺）：回傳 (R, p)＝網格原點"""
    f, n, b = T.hand_axes(pv, V, 'r'); Bm = T.basis(f, n); wrist = pv[V.idx['hand_r']]
    if kind == 'drink':                                      # 杯子：中心線（握的高度）在手心前面；杯子的軸＝虎口那邊（右手的 b）
        grip = wrist + Bm @ np.array(T.CUP_HAND); ax = b
        return frame_cols(ax, f), grip - ax * T.CUP_GRIP
    if kind == 'phone':                                      # 手機：螢幕朝手心的方向（＝朝眼睛）、長邊照片段（手指從左邊包過去，和 f 差 0.45 弧度）
        cands = [f * math.cos(0.45) + b * math.sin(0.45), f * math.cos(0.45) - b * math.sin(0.45)]
        l_ = max(cands, key=lambda v: np.dot(v / np.linalg.norm(v), np.array([0.0, 0.35, 1.0]) / np.linalg.norm([0.0, 0.35, 1.0])))
        c = wrist + Bm @ np.array(T.PHONE_HAND)
        return frame_cols(n, l_), c - n * (DP.PH_H / 2)
    if kind == 'write':                                      # 筆：筆尖在 PEN_HAND，筆身往虎口（拇指和食指中間）；筆夾朝手背
        tip = wrist + Bm @ np.array(T.PEN_HAND); web = wrist + Bm @ (np.array([0.55, 0.05, 0.35]) * V.HL)
        ax = web - tip
        return frame_cols(ax, -n), tip
    raise KeyError(kind)


def local_of(kind, fi):
    rv = T.vroid_pose(sk, base[fi], V, kind, times[fi]); wv, pv = V.fk(rv)
    R, p = prop_world(kind, wv, pv)
    D = qmat(T.qnorm(wv[V.idx['hand_r']])); P = pv[V.idx['hand_r']]
    Rl = D.T @ R; pl = D.T @ (p - P)
    return C @ Rl @ C, C @ pl / V.s                          # 骨頭座標（模型檔的方向、單位）


info = {'body': 'F', 'vrm': T.BODIES['F'][0], 'height': V.H, 'scale': V.s, 'props': {}}
locs = {}
for name, kind in (('hand_cup', 'drink'), ('hand_phone', 'phone'), ('hand_pen', 'write')):
    R0, p0 = local_of(kind, 0)
    drift = 0.0
    for fi in range(0, len(times), 15):                     # 每 0.5 秒檢查一次：配件和手的相對位置不能變
        R1, p1 = local_of(kind, fi); drift = max(drift, float(np.linalg.norm(p1 - p0)), float(np.linalg.norm(R1 - R0)) * 0.05)
    locs[name] = (R0, p0)
    info['props'][name] = {'clip_kind': kind, 'pos': [round(float(x), 4) for x in p0], 'rot_matrix_cols': [[round(float(x), 4) for x in R0[:, k]] for k in range(3)], 'drift_m': round(drift, 4)}
    print(name, 'pos', np.round(p0, 4), 'drift %.4f m' % drift)

# ---------------------------------------------------------------- Blender：網格擺好、匯出
B.reset(texres=1024)
root = B.group('hand_props', props={'kind': 'hand_props'})
mat = bpy.data.materials.new('desk_props'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(DP.ATLAS); tx.image.pack(); nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
to = nt.nodes.new('ShaderNodeTexImage'); to.image = bpy.data.images.load(DP.ATLAS_ORM); to.image.colorspace_settings.name = 'Non-Color'; to.image.pack()
sp = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(to.outputs['Color'], sp.inputs['Color'])
nt.links.new(sp.outputs['Green'], bsdf.inputs['Roughness']); nt.links.new(sp.outputs['Blue'], bsdf.inputs['Metallic'])
te = nt.nodes.new('ShaderNodeTexImage'); te.image = bpy.data.images.load(DP.ATLAS_EMIT); te.image.pack()
nt.links.new(te.outputs['Color'], bsdf.inputs['Emission Color']); bsdf.inputs['Emission Strength'].default_value = DP.EMIT_STRENGTH
mods = {}
for name, fn in (('hand_cup', lambda: DP.item_cup()), ('hand_phone', lambda: DP.item_phone(on=True)), ('hand_pen', lambda: DP.item_pen())):
    R, p = locs[name]; M4 = np.eye(4); M4[:3, :3] = R; M4[:3, 3] = p
    pm = DP.PM().add(fn(), M4)
    DP.to_blender(pm, name, mat, root); mn, mx = pm.bbox(); mods[name] = {'tris': pm.tris(), 'min': mn, 'max': mx}
out = os.path.join(ROOT, OUT); os.makedirs(os.path.dirname(out), exist_ok=True)
res = L.export(out, gpu_instances=False)
res['modules'] = mods; res.update(info)
res['attach'] = ('三個網格都已經擺在右手骨頭（VRoid J_Bip_R_Hand；PROPS 的 bone:\'rightHand\'）的座標裡：x 人物右邊、y 上、z 後面，單位＝模型檔（遊戲縮放人物時配件跟著縮）。'
                 '掛法：boneGlb 那樣把節點 clone 到骨頭底下、位置 0、不轉；一次只開一個（喝飲料開 hand_cup、滑手機 hand_phone、寫字 hand_pen），其他時候藏起來。'
                 '照女生的手（vroid_npc_f1、身高 1.60）算；男生的手長 4% 左右，配件離手心差 2～3 mm，不另外做。')
L.write_json(out[:-4] + '.json', res)
print(json.dumps({k: v['tris'] for k, v in mods.items()}), res.get('bytes'))
