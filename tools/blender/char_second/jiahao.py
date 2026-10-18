"""宋家豪（econ_jiahao）Blender 人物製作（LAWWW2-C 2026-10-17，ART-CH-JIAHAO；角色模型 D59：BB 驗收；照 BB_131 通過的標準圖 art_reference/jiahao.webp）。
參考圖：台大經濟系二年級（學長）、20 歲、170 cm；灰色棒球帽、帽子下露出的黑色短髮、笑得很開；黑色圓領短袖 T＋螢光黃綠背心（敞開、沒有袖子：迎新工作人員）
＋藍色直筒牛仔褲＋白色球鞋；手上拿著資料夾、菜單（之後另外做）。
做法：同韋綸（weilun.py：Sakurada 樣本、敞開外套＋T 恤的生產線），不同的地方：
  臉（jiahao_face：笑起來眼睛彎、臉圓一點、膚色一般）、頭髮（jiahao_hair：黑色短髮＋**棒球帽做在 VRM 裡**（綁頭骨），不用遊戲端的配件）、
  衣服（jiahao_clothes：敞開的上衣——身片＝螢光背心、短袖＝黑色 T 恤的袖子，裡面 tee_full 是黑色 T 恤；牛仔褲、白球鞋）、身高 170。
用法：/opt/blenv/bin/python tools/blender/char_second/jiahao.py -- <輸出.vrm 或 -> [--blend 工作檔] [--from-blend 工作檔] [--stages stage0,face,clothes,hair] [--render 前綴] [--views ...]
之後：VRM_BASE=Sakurada_Fumiriya VRM_MALE=1 python3 tools/blender/char_second/vrm_finish2.py <輸出.vrm> <遊戲用.vrm> 宋家豪 [虹膜色]"""
import sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
CHAR_LIB = os.environ.get('CHAR_LIB') or next((p for p in (os.path.join(HERE, '..', 'char'), '/home/user/char_wt/tools/blender/char') if os.path.exists(os.path.join(p, 'common.py'))), None)
sys.path.insert(0, HERE); sys.path.insert(1, CHAR_LIB)
import common as C
import numpy as np, bpy

BASE = 'Sakurada_Fumiriya'
HEAD_SCALE = 0.99    # 樣本本來就約 8 頭身（身高 1.89 m、頭 0.235 m）；只收一點（參考圖 178 cm、約 7.7 頭身）
NECK_SLIM = 1.0      # 男生：脖子不收
HEIGHT = 1.70


def stage0(m):
    """拿掉樣本的頭髮（頭髮物件＋身體網格上的後髮）、衣服（上衣、項鍊、褲子、鞋）；上衣留一份當外套的權重來源；頭稍微縮小"""
    arm = m['arm']
    hair_bones = [b.name for b in arm.data.bones if 'HairJoint' in b.name or b.name.startswith('J_Sec_Hair')]
    if m['hair']: bpy.data.objects.remove(m['hair'], do_unlink=True); m['hair'] = None
    print('  removed hair bones', C.remove_bones(arm, hair_bones))
    m['wsrc_top'] = C.extract_by_material(m['body'], ['Tops'], 'WSRC_Tops', 'J_Sec_')
    print('  weight source (VRoid tops) faces', len(m['wsrc_top'].data.polygons))
    print('  removed clothes/back-hair faces', C.delete_by_material(m['body'], ['Tops', 'AccessoryNeck', 'Bottoms', 'Shoes', 'HairBack']))
    sec_bones = [b.name for b in arm.data.bones if b.name.startswith('J_Sec_')]
    for o in (m['body'], m['face']):
        for n in sec_bones:
            if n in o.vertex_groups: o.vertex_groups.remove(o.vertex_groups[n])
    print('  removed secondary bones', C.remove_bones(arm, sec_bones))
    C.prune_springs(arm)
    import heroine_05 as H05      # 透明的皮膚（原本衣服蓋住的地方）補成皮膚色：T 恤圓領、敞開的外套裡面看得到脖子根部
    H05.fill_hidden_skin(m['body'], 'Body_00_SKIN', 'J01_Body_filled')
    if HEAD_SCALE != 1.0:
        H = C.scale_head(arm, [m['face'], m['body']], HEAD_SCALE)
        print('  head scaled', HEAD_SCALE, 'about', np.round(H, 3))
    print('  landmarks', {k: round(v, 3) for k, v in C.landmarks(arm).items()})


STAGES = {'stage0': stage0}
import importlib
def stage_fn(name):
    if name not in STAGES: STAGES[name] = importlib.import_module('jiahao_' + name).apply
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
    if bpy.data.objects.get('Clothes_J01') is not None: m['clothes'] = bpy.data.objects['Clothes_J01']
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
