"""Blender 人物的頭髮加彈簧骨（後處理，2026-10-10）：讀人物的 Blender 工作檔（`assets/blender/<人物>_work_v*.blend`，已經有臉、衣服、頭髮），
把頭髮網格的下段（耳朵以下）依方位角分成幾條鏈、每條 2 節骨頭；頂點權重從頭骨漸變到鏈上（耳朵以上維持綁在頭骨）；
註冊成 VRM 彈簧骨（碰撞體用樣本原本的頭、脖子、上胸、上臂）；匯出 VRM（之後照舊用 vrm_finish.py 整理）。
原因：林芷若、陳語彤、高子晴的 Blender 版頭髮整束綁在頭骨上，走路、轉身時完全不會動（起床報告列的已知問題；沈以安、溫書瑀的馬尾本來就有）。
臉前面（方位角 ±60° 以內）不加鏈：瀏海、臉旁的頭髮擺起來會掃到臉。
用法：/opt/blenv/bin/python tools/blender/char/hair_springs.py -- <工作檔.blend> <輸出.vrm> <人物 id> [--save 新工作檔.blend]"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import bpy
import common as C

HEAD = 'J_Bip_C_Head'
# z0：鏈從哪個高度開始（相對頭骨的關節，負的＝往下）；az：鏈的方位角（0＝正前方、+90＝人物左邊、180＝正後方）
CFG = {
    'heroine_02': dict(z0=-0.028, az=[-160, -125, -90, 90, 125, 160], stiff=0.85, grav=0.25, drag=0.55, hit=0.012),   # 林芷若：及肩微捲
    'heroine_03': dict(z0=-0.030, az=[-160, -125, -90, 90, 125, 160], stiff=0.85, grav=0.25, drag=0.55, hit=0.012),   # 陳語彤：及肩直髮
    'heroine_04': dict(z0=-0.008, az=[-150, -105, 105, 150], stiff=1.10, grav=0.15, drag=0.65, hit=0.010),              # 高子晴：到下巴的鮑伯（鏈從耳垂高度開始；擺得少）
}
# 碰撞體只用上臂：頭、脖子、上胸的碰撞球比實際的頭和脖子大，耳朵以下的頭髮（尤其後頸那幾束）站著時就在球裡面，
# 一跑起來就被推開 3～4 cm（tools/dev_scratch/spring_sim/hair_sway.js 量到；拿掉後 0.7～1.5 cm、停下就回原位）
COLLIDE = {'J_Bip_L_UpperArm', 'J_Bip_R_UpperArm'}


def sstep(a, b, x):
    t = np.clip((np.asarray(x, float) - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)


def azimuth(P, c):
    return np.degrees(np.arctan2(P[:, 0] - c[0], -(P[:, 1] - c[1])))


def apply_springs(cid):
    """在現在打開的場景上加頭髮的彈簧骨（人物的建置腳本也直接叫這個：heroine_02.py 的 springs 階段，LAWWW2-B 10-24——
    10-22 芷若第九版頭髮用 p02_hair.py 重做以後沒有再跑這一步，彈簧骨整個不見，LAWWW-B 10-24 05:53 發現）"""
    cfg = CFG[cid]
    arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
    hair = next(o for o in bpy.data.objects if o.type == 'MESH' and o.name.startswith('Hair'))
    sec = C.ext(arm).secondary_animation
    if any(g.comment.startswith('Hair_Chain') for g in sec.bone_groups): raise SystemExit('already has hair chains')
    Hj = C.bone_head(arm, HEAD); z0 = Hj[2] + cfg['z0']
    Mw = np.array(hair.matrix_world); P = C.co(hair) @ Mw[:3, :3].T + Mw[:3, 3]
    az = azimuth(P, Hj)
    chains = []
    for A in cfg['az']:
        d = np.abs(((az - A) + 180) % 360 - 180)
        band = (d < 14) & (P[:, 2] < z0 + 0.01)
        if band.sum() < 20: print('  chain az %d: too few verts, skip' % A); continue
        Pb = P[band]; ztip = float(np.percentile(Pb[:, 2], 2))
        if z0 - ztip < 0.03: print('  chain az %d: hair too short below z0 (%.3f), skip' % (A, z0 - ztip)); continue
        top = Pb[np.abs(Pb[:, 2] - z0) < 0.012]; top = top if len(top) else Pb
        r_top = np.median(np.linalg.norm((top - Hj)[:, :2], axis=1)) - 0.010            # 骨頭在頭髮裡面 1 cm
        lowp = Pb[Pb[:, 2] < ztip + 0.012]; r_low = np.median(np.linalg.norm((lowp - Hj)[:, :2], axis=1)) - 0.008
        u = np.array([math.sin(math.radians(A)), -math.cos(math.radians(A)), 0.0])
        pts = np.array([Hj + u * r_top * 1.0 + np.array([0, 0, z0 - Hj[2]]),
                        Hj + u * (r_top + r_low) / 2 + np.array([0, 0, (z0 + ztip) / 2 - Hj[2]]),
                        Hj + u * r_low + np.array([0, 0, ztip - Hj[2]])])
        names = C.add_bone_chain(arm, 'J_Sec_Hair_Chain%d_' % len(chains), pts, HEAD)
        chains.append(dict(A=A, names=names, z_top=z0, z_tip=ztip))
        print('  chain az %4d: %d verts, z %.3f..%.3f, r %.3f..%.3f' % (A, int(band.sum()), z0, ztip, r_top, r_low))
    if not chains: raise SystemExit('no chains')
    # 權重：方位角在相鄰兩條鏈之間內插（臉前面、超出最外側鏈的地方漸漸回到頭骨），沿著鏈的高度在頭骨→第 1 節→第 2 節之間漸變
    As = np.array([c['A'] for c in chains], float); order = np.argsort(As); chains = [chains[i] for i in order]; As = As[order]
    n = len(P); W = {HEAD: np.zeros(n)}
    for c in chains:
        for nm in c['names']: W[nm] = np.zeros(n)
    s = sstep(z0 + 0.015, z0 - 0.015, P[:, 2])                  # 耳朵以上 0，往下漸漸交給鏈
    wa = np.zeros((n, len(chains)))
    for k in range(len(chains)):                                 # 每條鏈的方位權重：帳篷函數，寬度到相鄰的鏈
        Ak = As[k]; left = As[k - 1] if k > 0 else Ak - 40; right = As[k + 1] if k < len(chains) - 1 else Ak + 40
        if k == 0 and len(chains) > 1 and As[-1] - 360 > Ak - 70: left = As[-1] - 360
        if k == len(chains) - 1 and len(chains) > 1 and As[0] + 360 < Ak + 70: right = As[0] + 360
        d = ((az - Ak) + 180) % 360 - 180
        wk = np.where(d < 0, 1 + d / max(1e-3, Ak - left), 1 - d / max(1e-3, right - Ak))
        wa[:, k] = np.clip(wk, 0, 1)
    tot = wa.sum(1); facing = np.abs(((az + 180) % 360) - 180) < 60      # 臉前面：不給鏈
    wa = np.where(tot[:, None] > 1e-6, wa / np.maximum(tot, 1e-6)[:, None], 0) * np.clip(tot, 0, 1)[:, None]
    wa[facing] = 0
    for k, c in enumerate(chains):
        t = np.clip((c['z_top'] - P[:, 2]) / max(1e-3, c['z_top'] - c['z_tip']), 0, 1)
        b = sstep(0.0, 0.5, t) + sstep(0.5, 1.0, t)               # 0 → 1（第 1 節）→ 2（第 2 節）
        i0 = np.minimum(np.floor(b).astype(int), 1); f = b - i0
        w1 = np.where(i0 == 0, f, 1 - f); w2 = np.where(i0 == 0, 0, f); wh = np.where(i0 == 0, 1 - f, 0)
        m = s * wa[:, k]
        W[c['names'][0]] += m * w1; W[c['names'][1]] += m * w2; W[HEAD] += m * wh
    W[HEAD] += 1 - s * wa.sum(1)
    tot = sum(W.values()); tot[tot < 1e-6] = 1
    for g in list(hair.vertex_groups): hair.vertex_groups.remove(g)
    for nm, w in W.items():
        w = w / tot; idx = np.nonzero(w > 1e-4)[0]
        if not len(idx): continue
        g = hair.vertex_groups.new(name=nm)
        for i in idx: g.add([int(i)], float(w[i]), 'REPLACE')
    for k, c in enumerate(chains):
        C.add_spring_group(arm, 'Hair_Chain%d' % k, [c['names'][0]], stiffness=cfg['stiff'], gravity=cfg['grav'], drag=cfg['drag'],
                           hit_radius=cfg['hit'], colliders=COLLIDE)
    moved = int((s * wa.sum(1) > 0.05).sum())
    print('  hair springs: %d chains, %d of %d hair verts follow a chain' % (len(chains), moved, n))
    return dict(chains=len(chains), moved=moved, verts=n)


def main():
    a = sys.argv[sys.argv.index('--') + 1:]
    opt = {}
    if '--save' in a: i = a.index('--save'); opt['save'] = a[i + 1]; a = a[:i] + a[i + 2:]
    src, out, cid = a[:3]
    import addon_utils; addon_utils.enable('io_scene_vrm', default_set=True)
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(src))
    apply_springs(cid)
    if 'save' in opt:
        bpy.ops.file.pack_all(); bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(opt['save']), compress=True); print('saved', opt['save'])
    print('exported', C.export_vrm(os.path.abspath(out)))


if __name__ == '__main__':
    main()
