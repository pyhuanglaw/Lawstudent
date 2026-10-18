"""唐睿（econ_tangrui）Blender 人物製作（LAWWW2-C 2026-10-17，ART-CH-TANGRUI；角色模型 D59：BB 驗收；照 BB_131 通過的標準圖 art_reference/tangrui.webp）。
參考圖：台大經濟系一年級、19 歲、177 cm；黑色蓬鬆捲髮（一圈一圈、蓋到眉毛、耳朵上面）、很愛笑（大笑、誇張的驚訝）；
藍色短袖 POLO 衫（反摺領、胸前短門襟兩顆扣子、沒有紮、胸口口袋插著便利貼）＋白色直筒長褲＋灰色球鞋。
做法照柏翰（bohan.py：VRoid 樣本 HairSample_Male、p05_clothes 的襯衫身片＋領子＋門襟＋扣子）——同一條生產線，和柏翰、祐廷不同的地方：
  臉（tangrui_face：開朗——眼睛大一點、略彎，嘴寬、唇色自然）、頭髮（tangrui_hair：蓬鬆的黑色捲髮）、
  衣服（tangrui_clothes：短袖 POLO 衫不紮、門襟只到胸口、白長褲、灰球鞋）、身高 177、沒有眼鏡。
  和祐廷同一個樣本（柏翰也是）：臉的差別靠參數＋髮型。
用法：/opt/blenv/bin/python tools/blender/char_second/tangrui.py -- <輸出.vrm 或 -> [--blend 工作檔] [--from-blend 工作檔] [--stages stage0,face,clothes,hair] [--render 前綴] [--views ...]
之後：VRM_BASE=HairSample_Male VRM_MALE=1 python3 tools/blender/char_second/vrm_finish2.py <輸出.vrm> <遊戲用.vrm> 唐睿 [虹膜色]"""
import sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
CHAR_LIB = os.environ.get('CHAR_LIB') or next((p for p in (os.path.join(HERE, '..', 'char'), '/home/user/char_wt/tools/blender/char') if os.path.exists(os.path.join(p, 'common.py'))), None)
sys.path.insert(0, HERE); sys.path.insert(1, CHAR_LIB)
import common as C
import numpy as np, bpy

BASE = 'HairSample_Male'
HEAD_SCALE = 0.92    # 頭縮小（和祐廷一樣：約 7.5 頭身）
NECK_SLIM = 0.97
HEIGHT = 1.77


def stage0(m):
    """拿掉樣本的頭髮、衣服（連帽上衣、褲子、鞋）、次要骨頭（帽子、抽繩、衣襬）；上衣留一份當襯衫的權重來源；頭縮小、脖子收一點（照祐廷 player.py）"""
    arm = m['arm']
    hair_bones = [b.name for b in arm.data.bones if 'HairJoint' in b.name or b.name.startswith('J_Sec_Hair')]
    if m['hair']: bpy.data.objects.remove(m['hair'], do_unlink=True); m['hair'] = None
    print('  removed hair bones', C.remove_bones(arm, hair_bones))
    m['wsrc_top'] = C.extract_by_material(m['body'], ['Tops'], 'WSRC_Tops', 'J_Sec_')
    print('  weight source (VRoid tops) faces', len(m['wsrc_top'].data.polygons))
    print('  removed clothes faces', C.delete_by_material(m['body'], ['Tops', 'Bottoms', 'Shoes']))
    sec_bones = [b.name for b in arm.data.bones if b.name.startswith('J_Sec_')]
    for o in (m['body'], m['face']):
        for n in sec_bones:
            if n in o.vertex_groups: o.vertex_groups.remove(o.vertex_groups[n])
    print('  removed secondary bones', C.remove_bones(arm, sec_bones))
    C.prune_springs(arm)
    import heroine_05 as H05      # 透明的皮膚（原本衣服蓋住的地方）補成皮膚色：襯衫的 V 字開口看得到胸口
    H05.fill_hidden_skin(m['body'], 'Body_00_SKIN', 'T01_Body_filled')
    H = C.scale_head(arm, [m['face'], m['body']], HEAD_SCALE)
    nk = C.bone_head(arm, 'J_Bip_C_Neck')
    w = np.clip(C.vgroup_weights(m['body'], {'J_Bip_C_Neck'}), 0, 1)
    C.warp(m['body'], lambda P, B: np.column_stack([nk[0] + (P[:, 0] - nk[0]) * (1 - (1 - NECK_SLIM) * w), nk[1] + (P[:, 1] - nk[1]) * (1 - (1 - NECK_SLIM) * w), P[:, 2]]))
    print('  head scaled', HEAD_SCALE, 'about', np.round(H, 3))
    print('  landmarks', {k: round(v, 3) for k, v in C.landmarks(arm).items()})


STAGES = {'stage0': stage0}
import importlib
def stage_fn(name):
    if name not in STAGES: STAGES[name] = importlib.import_module('tangrui_' + name).apply
    return STAGES[name]


def from_blend(path):
    """存好的工作檔（--blend）：找回骨架、臉、身體、頭髮、權重來源與衣服"""
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(path))
    m = {'arm': None, 'face': None, 'body': None, 'hair': None}
    for o in bpy.data.objects:
        if o.type == 'ARMATURE': m['arm'] = o
        elif o.type == 'MESH':
            n = o.name.lower()
            if n.startswith('face'): m['face'] = o
            elif n.startswith('body'): m['body'] = o
            elif n.startswith('hair'): m['hair'] = o
    m['wsrc_top'] = bpy.data.objects.get('WSRC_Tops')
    if bpy.data.objects.get('Clothes_H01') is not None: m['clothes'] = bpy.data.objects['Clothes_H01']
    return m


def main():
    a = C.args(); out = a[0]
    opt = {a[i]: a[i + 1] for i in range(1, len(a) - 1) if a[i].startswith('--')}
    stages = [s for s in opt.get('--stages', 'stage0').split(',') if s]
    C.setup()
    m = from_blend(opt['--from-blend']) if '--from-blend' in opt else C.import_vrm(os.path.join(C.SRC, BASE + '.vrm'))
    for s in stages:
        print('[stage]', s); stage_fn(s)(m)
    if '--blend' in opt:
        os.makedirs(os.path.dirname(os.path.abspath(opt['--blend'])), exist_ok=True)
        bpy.ops.file.pack_all(); bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(opt['--blend']), compress=True); print('saved blend', opt['--blend'])
    if m.get('wsrc_top') is not None: bpy.data.objects.remove(m['wsrc_top'], do_unlink=True); m['wsrc_top'] = None   # 權重來源不匯出
    if '--render' in opt:
        lm = C.landmarks(m['arm'])
        kw = {'views': tuple(opt['--views'].split(','))} if '--views' in opt else {}
        print('renders', C.render_views(opt['--render'], head_z=lm['head'] + 0.07, height=lm['head'] + 0.20, **kw))
    if out != '-': print('exported', C.export_vrm(os.path.abspath(out)))


if __name__ == '__main__':
    main()
