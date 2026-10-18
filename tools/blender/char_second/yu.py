"""小語（李語晴，yu）Blender 人物製作（LAWWW2，角色模型 D59；照 BB 通過的參考圖 story-planning 分支 docs/story_planning/art_reference/yu.webp）。
參考圖：台大法律系一年級、163 cm、19 歲；三個社團（系學會、辯論社、吉他社）、精力旺盛。棕色中長捲髮（蓬鬆、到胸口、旁分瀏海、右邊一支金色長方形髮夾）；
淡黃／白／灰藍拼色的寬版風衣外套（有帽子、敞開）＋白 T（紮進裙子）＋酒紅色過膝百褶裙（腰帶）＋白色帆布鞋；黑色斜背包＋三個吊飾（天秤、麥克風、吉他）、髮夾是配件（之後另外做）。
做法照 LAWWW 的人物生產線＋杜可昕、芯慈的模組：
  基底：VRoid CC0 樣本 Sendagaya Shibu 的身體、臉（全部表情 shape key）、骨架（陳語彤也用這個樣本：臉的參數、捲髮、衣服都不一樣）。
  原本的頭髮、上衣、褲子、鞋、胸部以外的次要骨頭拿掉。
LAWWW 的模組放在 tools/blender/char/（這個工作階段的分支還沒有：預設讀 /home/user/char_wt/tools/blender/char，或用環境變數 CHAR_LIB 指定）。
用法：/opt/blenv/bin/python tools/blender/char_second/yu.py -- <輸出.vrm 或 -（不匯出）> [--blend 工作檔.blend] [--stages stage0,face,clothes,hair] [--render 預覽圖前綴] [--views face_front,body_front]
  反覆調整衣服或頭髮時：先存一份做到臉的工作檔（--stages stage0,face --blend y_face.blend），之後 --from-blend y_face.blend --stages clothes,hair 只重做後面的階段
之後：python3 tools/blender/char_second/vrm_finish2.py <輸出.vrm> <遊戲用.vrm> 小語 [虹膜色]（VRM_BASE=Sendagaya_Shibu）"""
import sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
CHAR_LIB = os.environ.get('CHAR_LIB') or next((p for p in (os.path.join(HERE, '..', 'char'), '/home/user/char_wt/tools/blender/char') if os.path.exists(os.path.join(p, 'common.py'))), None)
sys.path.insert(0, HERE); sys.path.insert(1, CHAR_LIB)
import common as C
import numpy as np, bpy

BASE = 'Sendagaya_Shibu'
HEAD_SCALE = 0.92    # 頭縮小（約 7.2 頭身；163 cm）
NECK_SLIM = 0.95
KEEP_SEC = ('Bust',)


def stage0(m):
    """拿掉樣本的頭髮（頭髮物件＋身體網格上的後髮）、上衣、鞋、胸部以外的次要骨頭；看得到的皮膚補色；頭縮小、脖子收一點"""
    arm = m['arm']
    hair_bones = [b.name for b in arm.data.bones if 'HairJoint' in b.name or b.name.startswith('J_Sec_Hair')]
    if m['hair']: bpy.data.objects.remove(m['hair'], do_unlink=True); m['hair'] = None
    print('  removed hair bones', C.remove_bones(arm, hair_bones))
    m['wsrc_top'] = C.extract_by_material(m['body'], ['Tops'], 'WSRC_Tops', 'J_Sec_')   # 原本的上衣：外套、T 恤的權重來源（衣服階段用完就刪）
    print('  weight source (VRoid tops) faces', len(m['wsrc_top'].data.polygons))
    print('  removed clothes/shoes/back-hair faces', C.delete_by_material(m['body'], ['Tops', 'AccessoryNeck', 'Bottoms', 'Shoes', 'HairBack']))
    sec_bones = [b.name for b in arm.data.bones if b.name.startswith('J_Sec_') and not any(k in b.name for k in KEEP_SEC)]
    for o in (m['body'], m['face']):
        for n in sec_bones:
            if n in o.vertex_groups: o.vertex_groups.remove(o.vertex_groups[n])
    print('  removed secondary bones', C.remove_bones(arm, sec_bones), sec_bones[:6])
    C.prune_springs(arm)
    import heroine_05 as H05      # 透明的皮膚（原本衣服蓋住的地方）補成皮膚色：襯衫開第一顆扣子的 V 字領口看得到
    H05.fill_hidden_skin(m['body'], 'Body_00_SKIN', 'Y01_Body_filled')
    from classmate_xinci import bare_legs      # 第二版：樣本的身體貼圖在小腿、腳畫了黑色長襪（第一版腿是黑的）；參考圖是光腳穿帆布鞋
    bare_legs(m['body'], name='Y01_Body_skin')
    H = C.scale_head(arm, [m['face'], m['body']], HEAD_SCALE)
    nk = C.bone_head(arm, 'J_Bip_C_Neck')
    w = np.clip(C.vgroup_weights(m['body'], {'J_Bip_C_Neck'}), 0, 1)
    C.warp(m['body'], lambda P, B: np.column_stack([nk[0] + (P[:, 0] - nk[0]) * (1 - (1 - NECK_SLIM) * w), nk[1] + (P[:, 1] - nk[1]) * (1 - (1 - NECK_SLIM) * w), P[:, 2]]))
    print('  head scaled', HEAD_SCALE, 'about', np.round(H, 3), 'landmarks', {k: round(v, 3) for k, v in C.landmarks(arm).items()})


STAGES = {'stage0': stage0}
import importlib
def stage_fn(name):
    if name not in STAGES: STAGES[name] = importlib.import_module('yu_' + name).apply
    return STAGES[name]


def from_blend(path):
    """存好的工作檔（--blend）：照 C.import_vrm 的規則找回骨架、臉、身體、頭髮，加上權重來源與衣服"""
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
    cl = [bpy.data.objects.get(n) for n in ('Clothes_Y01', 'Clothes_Y01_Jacket')]
    if any(cl): m['clothes'] = [o for o in cl if o is not None]      # 頭髮避開襯衫身片＋外套（領子、門襟這種雙面薄片不算）
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
    if m.get('wsrc_top') is not None:      # 權重來源不匯出
        bpy.data.objects.remove(m['wsrc_top'], do_unlink=True); m['wsrc_top'] = None
    if '--render' in opt:
        kw = {'views': tuple(opt['--views'].split(','))} if '--views' in opt else {}
        lm = C.landmarks(m['arm'])
        print('renders', C.render_views(opt['--render'], head_z=lm['head'] + 0.08, height=1.70, **kw))
    if out != '-': print('exported', C.export_vrm(os.path.abspath(out)))


if __name__ == '__main__':
    main()
