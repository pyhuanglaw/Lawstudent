"""江明軒（classmate_mingxuan）Blender 人物製作（LAWWW2，角色模型 D59；照 BB 通過的參考圖 story-planning 分支 docs/story_planning/art_reference/classmate_mingxuan.webp）。
參考圖：台大法律系一年級、19 歲、178 cm；黑色、有層次、蓬鬆凌亂的中短髮（瀏海一撮一撮垂到眉毛、兩側蓋到耳朵上緣、後頸留長一點）；
深墨綠寬版圓領 T（短袖到手肘上面、沒有紮）＋中藍刷色寬直筒牛仔褲（褲腳堆在鞋上）＋白色厚底皮革球鞋；
深棕皮革郵差包（斜背）、後口袋的筆記本、左手的黑色手錶是配件（之後另外做）。
做法照 LAWWW 的人物生產線（tools/blender/char：common、h01_face、h01_clothes、vrm_finish）＋阿哲的模組：
  基底：VRoid β 版 CC0 樣本 Sakurada Fumiriya 的身體、臉（全部表情 shape key）、骨架（約 8 頭身、腿長；阿哲也用這個樣本——
  臉的參數、髮型、衣服都不一樣；祐廷、柏翰是 HairSample_Male）。原本的頭髮、衣服、鞋、項鍊拿掉。
  臉：h01_face（p00_face.run）＋明軒的參數（mingxuan_face）；頭髮：mingxuan_hair（從阿哲的 zhe_hair 改：黑色、瀏海和後頸長一點、兩側蓋到耳朵上緣）；
  衣服：mingxuan_clothes（p00_clothes.run：T 恤＋牛仔褲＋球鞋，換成這個檔案的 STYLE）。
LAWWW 的模組放在 tools/blender/char/（預設讀 /home/user/char_wt/tools/blender/char，或用環境變數 CHAR_LIB 指定）。
用法：/opt/blenv/bin/python tools/blender/char_second/mingxuan.py -- <輸出.vrm 或 -（不匯出）> [--blend 工作檔.blend] [--from-blend 工作檔] [--stages stage0,face,clothes,hair] [--render 預覽圖前綴] [--views face_front,body_front]
之後：VRM_BASE=Sakurada_Fumiriya VRM_MALE=1 python3 tools/blender/char_second/vrm_finish2.py <輸出.vrm> <遊戲用.vrm> 明軒 [虹膜色]"""
import sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
CHAR_LIB = os.environ.get('CHAR_LIB') or next((p for p in (os.path.join(HERE, '..', 'char'), '/home/user/char_wt/tools/blender/char') if os.path.exists(os.path.join(p, 'common.py'))), None)
sys.path.insert(0, HERE); sys.path.insert(1, CHAR_LIB)
import common as C
import numpy as np, bpy

BASE = 'Sakurada_Fumiriya'
HEAD_SCALE = 0.97    # 樣本本來就約 8 頭身（身高 1.89 m、頭 0.235 m）；參考圖 178 cm、臉小、約 7.8 頭身（阿哲 0.98）
NECK_SLIM = 1.0      # 男生：脖子不收
HEIGHT = 1.78


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
    import heroine_05 as H05      # 透明的皮膚（原本衣服蓋住的地方）補成皮膚色：T 恤圓領裡面看得到脖子根部
    H05.fill_hidden_skin(m['body'], 'Body_00_SKIN', 'M01_Body_filled')
    if HEAD_SCALE != 1.0:
        H = C.scale_head(arm, [m['face'], m['body']], HEAD_SCALE)
        print('  head scaled', HEAD_SCALE, 'about', np.round(H, 3))
    print('  landmarks', {k: round(v, 3) for k, v in C.landmarks(arm).items()})


STAGES = {'stage0': stage0}
import importlib
def stage_fn(name):
    if name not in STAGES: STAGES[name] = importlib.import_module('mingxuan_' + name).apply
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
    if bpy.data.objects.get('Clothes_M01') is not None: m['clothes'] = bpy.data.objects['Clothes_M01']
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
