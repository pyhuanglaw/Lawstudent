"""林芷若（heroine_02）Blender 人物製作（v9.4 人物生產線第三位，祐廷 player.py 之後）。
基底：VRoid CC0 樣本 Victoria Rubin 的身體、臉（含全部表情 shape key）、骨架；原本的頭髮（含身體網格上的後髮）、上衣、鞋、次要骨頭（胸部以外）拿掉。
臉、衣服沿用沈以安的模組（h01_face、h01_clothes），用 p00_face.run／p00_clothes.run 先對到沈以安的比例、做完再轉回來；頭髮是新的及肩微捲髮 p02_hair。
眼鏡、銀色小耳環、圍裙仍是 src/props3d.js（C.MODEL_PROPS）。
用法：/opt/blenv/bin/python tools/blender/char/heroine_02.py -- <輸出.vrm> [--blend 工作檔.blend] [--stages stage0,face,clothes,hair] [--render 預覽圖前綴]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as C
import numpy as np, bpy

HEAD_SCALE = 0.92    # 頭縮小（約 7.2 頭身；參考圖 06 的林芷若是 161 cm、比沈以安嬌小）
NECK_SLIM = 0.95


def stage0(m):
    """拿掉樣本的頭髮（頭髮物件＋身體網格上的後髮）、上衣、鞋、胸部以外的次要骨頭；頭縮小、脖子收一點"""
    arm = m['arm']
    hair_bones = [b.name for b in arm.data.bones if 'HairJoint' in b.name or b.name.startswith('J_Sec_Hair')]
    if m['hair']: bpy.data.objects.remove(m['hair'], do_unlink=True); m['hair'] = None
    print('  removed hair bones', C.remove_bones(arm, hair_bones))
    m['wsrc_top'] = C.extract_by_material(m['body'], ['Tops'], 'WSRC_Tops', 'J_Sec_')   # 原本的上衣：新上衣的權重來源（衣服階段用完就刪）
    print('  weight source (VRoid tops) faces', len(m['wsrc_top'].data.polygons))
    print('  removed clothes/back-hair faces', C.delete_by_material(m['body'], ['Tops', 'Shoes', 'HairBack']))
    keep = ('Bust',)
    sec_bones = [b.name for b in arm.data.bones if b.name.startswith('J_Sec_') and not any(k in b.name for k in keep)]
    for o in (m['body'], m['face']):
        for n in sec_bones:
            if n in o.vertex_groups: o.vertex_groups.remove(o.vertex_groups[n])
    print('  removed secondary bones', C.remove_bones(arm, sec_bones), sec_bones[:6])
    C.prune_springs(arm)
    H = C.scale_head(arm, [m['face'], m['body']], HEAD_SCALE)
    nk = C.bone_head(arm, 'J_Bip_C_Neck')
    w = np.clip(C.vgroup_weights(m['body'], {'J_Bip_C_Neck'}), 0, 1)
    C.warp(m['body'], lambda P, B: np.column_stack([nk[0] + (P[:, 0] - nk[0]) * (1 - (1 - NECK_SLIM) * w), nk[1] + (P[:, 1] - nk[1]) * (1 - (1 - NECK_SLIM) * w), P[:, 2]]))
    print('  head scaled', HEAD_SCALE, 'about', np.round(H, 3), 'landmarks', {k: round(v, 3) for k, v in C.landmarks(arm).items()})


STAGES = {'stage0': stage0}
import importlib
def stage_fn(name):
    if name not in STAGES: STAGES[name] = importlib.import_module('p02_' + name).apply
    return STAGES[name]


def main():
    a = C.args(); out = a[0]
    opt = {a[i]: a[i + 1] for i in range(1, len(a) - 1) if a[i].startswith('--')}
    stages = opt.get('--stages', 'stage0').split(',')
    C.setup(); m = C.import_vrm(os.path.join(C.SRC, 'Victoria_Rubin.vrm'))
    for s in stages:
        print('[stage]', s); stage_fn(s)(m)
    if '--blend' in opt:      # 只跑到臉的工作檔保留權重來源（之後從這裡重做衣服）
        os.makedirs(os.path.dirname(os.path.abspath(opt['--blend'])), exist_ok=True)
        bpy.ops.file.pack_all(); bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(opt['--blend']), compress=True); print('saved blend', opt['--blend'])
    if m.get('wsrc_top') is not None: bpy.data.objects.remove(m['wsrc_top'], do_unlink=True); m['wsrc_top'] = None   # 權重來源不匯出
    if '--render' in opt: print('renders', C.render_views(opt['--render'], head_z=1.54, height=1.70))
    print('exported', C.export_vrm(os.path.abspath(out)))


if __name__ == '__main__':
    main()
