"""沈以安（heroine_01）Blender 人物製作（v9.4 Blender 人物示範，2026-10-10 使用者指示）。
基底：VRoid CC0 樣本 HairSample_Female 的身體、臉（含全部表情 shape key）、骨架；原本的頭髮、衣服、裙子／袖子骨頭拿掉。
在 Blender 裡做：頭身比（頭縮小）、臉的立體結構、新的髮型網格、新的衣服網格；匯出 VRM 0.x 之後用 vrm_finish.py 做遊戲用的整理（表情裁減、貼圖大小）。
用法：/opt/blenv/bin/python tools/blender/char/heroine_01.py -- <輸出.vrm> [--blend 工作檔.blend] [--stages stage0,face,hair,clothes] [--render 預覽圖前綴]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as C
import numpy as np, bpy

HEAD_SCALE = 0.90    # 頭縮小：6.8 → 約 7.4 頭身（規範 7～8；參考圖 01 約 8）
NECK_SLIM = 0.94     # 頭變小之後脖子看起來粗：脖子水平方向收一點


def stage0(m):
    """拿掉樣本的頭髮、衣服、裙子／袖子骨頭；頭縮小、脖子收細"""
    arm = m['arm']
    hair_bones = [b.name for b in arm.data.bones if 'HairJoint' in b.name or b.name.startswith('J_Sec_Hair')]
    if m['hair']: bpy.data.objects.remove(m['hair'], do_unlink=True); m['hair'] = None
    print('  removed hair bones', C.remove_bones(arm, hair_bones))
    m['wsrc_top'] = C.extract_by_material(m['body'], ['Tops'], 'WSRC_Tops', 'J_Sec_')   # 原本的上衣（拿掉袖子、裙擺的次要骨頭部分）：新毛衣的權重來源（衣服階段用完就刪；第二版，手放下時肩膀不翹）
    print('  weight source (VRoid tops) faces', len(m['wsrc_top'].data.polygons))
    print('  removed clothes faces', C.delete_by_material(m['body'], ['Tops', 'Shoes']))
    sec_bones = [b.name for b in arm.data.bones if b.name.startswith('J_Sec_') and ('Skirt' in b.name or 'Sleeve' in b.name)]
    for o in (m['body'], m['face']):
        for n in sec_bones:
            if n in o.vertex_groups: o.vertex_groups.remove(o.vertex_groups[n])
    print('  removed skirt/sleeve bones', C.remove_bones(arm, sec_bones))
    C.prune_springs(arm)
    H = C.scale_head(arm, [m['face'], m['body']], HEAD_SCALE)
    # 脖子：綁在 Neck 的頂點水平方向往脖子中心收（Neck 權重越高收越多）
    nk = C.bone_head(arm, 'J_Bip_C_Neck')
    for o in (m['body'],):
        w = np.clip(C.vgroup_weights(o, {'J_Bip_C_Neck'}), 0, 1)
        C.warp(o, lambda P, B: np.column_stack([nk[0] + (P[:, 0] - nk[0]) * (1 - (1 - NECK_SLIM) * w), nk[1] + (P[:, 1] - nk[1]) * (1 - (1 - NECK_SLIM) * w), P[:, 2]]))
    print('  head scaled', HEAD_SCALE, 'about', np.round(H, 3))


STAGES = {'stage0': stage0}
# 各部位的模組（tools/blender/char/h01_<部位>.py，提供 apply(m)）：--stages 有指定才載入（一個模組改到一半不會影響其他模組的執行）
import importlib
def stage_fn(name):
    if name not in STAGES: STAGES[name] = importlib.import_module('h01_' + name).apply
    return STAGES[name]


def main():
    a = C.args(); out = a[0]
    opt = {a[i]: a[i + 1] for i in range(1, len(a) - 1) if a[i].startswith('--')}
    stages = opt.get('--stages', 'stage0').split(',')
    C.setup(); m = C.import_vrm(os.path.join(C.SRC, 'HairSample_Female.vrm'))
    for s in stages:
        print('[stage]', s); stage_fn(s)(m)
    if '--blend' in opt:
        os.makedirs(os.path.dirname(os.path.abspath(opt['--blend'])), exist_ok=True)
        bpy.ops.file.pack_all(); bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(opt['--blend']), compress=True); print('saved blend', opt['--blend'])
    if '--render' in opt: print('renders', C.render_views(opt['--render']))
    print('exported', C.export_vrm(os.path.abspath(out)))


if __name__ == '__main__':
    main()
