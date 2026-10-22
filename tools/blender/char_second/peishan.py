"""郭沛珊（classmate_peishan）Blender 人物製作（LAWWW2-B 2026-10-15；角色模型 D59；照 BB 通過（ART_APPROVED，BB_116 第 13 節）的參考圖
story-planning 分支 docs/story_planning/art_reference/classmate_peishan.webp；規格 BB_109 第 2 節）。
起因：使用者 2026-10-15 試玩 v9.7 回報第 26 項「郭沛珊為什麼跟 NPC 穿一樣醜的紅色衣服」——她現在用路人底模，這裡做她自己的 VRM。
參考圖：163 cm、法律系一年級；黑色低而鬆的馬尾＋側分瀏海＋臉旁鬆散的碎髮；細的深色圓框眼鏡（一直戴著，另外的配件 glasses_peishan.py）；
酒紅色素 T（短袖、圓領）＋深藍長裙（高腰、裙擺到小腿下段）＋黑色帆布鞋（白鞋底）；黑色硬殼筆記本（道具，之後另外做）。
做法和吳芯慈（classmate_xinci.py）相同：VRoid CC0 樣本 Darkness Shibu 的身體、臉、骨架（裙子不用裙擺彈簧骨）；臉 peishan_face、頭髮 peishan_hair、衣服 peishan_clothes。
用法：/opt/blenv/bin/python tools/blender/char_second/peishan.py -- <輸出.vrm 或 -> [--blend 工作檔.blend] [--stages stage0,face,clothes,hair] [--from-blend …] [--render 預覽圖前綴] [--views …]
之後：VRM_BASE=Darkness_Shibu python3 tools/blender/char_second/vrm_finish2.py <輸出.vrm> <遊戲用.vrm> 郭沛珊 [虹膜色]
第二十九版起（使用者 10-22 11:5x「臉啊頭髮啊 醜死了」）vrm_finish2 要多帶 VRM_REST='{"Fcl_EYE_Close": 0.06}'（基本形的眼型，和 peishan_face.REST 一致），
再跑 peishan_skirt_bones.py（第二十八版的裙子輔助骨頭）；完整指令見 docs/art-rebuild/second_ai/char_review/peishan_v29/README.md"""
import sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
CHAR_LIB = os.environ.get('CHAR_LIB') or next((p for p in (os.path.join(HERE, '..', 'char'), '/home/user/char_wt/tools/blender/char') if os.path.exists(os.path.join(p, 'common.py'))), None)
sys.path.insert(0, HERE); sys.path.insert(1, CHAR_LIB)
import common as C
import numpy as np, bpy

BASE = 'Darkness_Shibu'
HEAD_SCALE = 0.91    # 頭縮小（約 7.3 頭身；163 cm，和芯慈同一個樣本、同一個比例）
NECK_SLIM = 0.95
KEEP_SEC = ('Bust',)     # 留下的次要骨頭：胸（第九版拿掉裙擺彈簧骨：坐下時裙子炸開；裙子改綁腰臀＋大腿，見 x_xinci_clothes.skirt_weights）


def bare_legs(obj, pat='Body_00_SKIN', name='S01_Body_skin', r=40):
    """Darkness Shibu 的身體貼圖在腿上畫了黑色褲襪（參考圖的芯慈是光腳穿樂福鞋）：暗的像素換成周圍皮膚的顏色
    （和 heroine_05.fill_hidden_skin 同一個做法：只取像皮膚的像素做正規化模糊）；褲襪邊緣的灰色過渡照暗的程度混合"""
    import h01_face as F
    for slot in obj.material_slots:
        mt = slot.material
        if not mt or pat not in mt.name: continue
        e = mt.vrm_addon_extension.mtoon1; src = e.pbr_metallic_roughness.base_color_texture.index.source
        if src is None: continue
        a = F.img_array(src); rgb = a[..., :3]; op = a[..., 3] > 0.5
        R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        lum = 0.30 * R + 0.59 * G + 0.11 * B
        skin = op & (R > 0.55) & (R > G + 0.03) & (G > B) & (R - B < 0.45)
        keep = skin.astype(float)
        fill = F.blur(rgb * keep[..., None], r) / np.maximum(F.blur(keep, r), 1e-4)[..., None]
        w = np.clip(F.blur(keep, r) * 8, 0, 1)[..., None]; med = np.median(rgb[skin], axis=0)
        fill = fill * w + med * (1 - w)
        t = (np.clip((0.62 - lum) / 0.20, 0, 1) * op)[..., None]
        out = a.copy(); out[..., :3] = rgb * (1 - t) + fill * t
        im = C.image_from_array(name, out.astype(np.float32)); F.set_tex(mt, im)
        print('  bare legs: %d dark px → skin (median %s)' % (int((t[..., 0] > 0.5).sum()), np.round(med, 3)))


def stage0(m):
    """拿掉樣本的頭髮（頭髮物件＋身體網格上的後髮）、連身裙、鞋、胸部與裙擺以外的次要骨頭；頭縮小、脖子收一點"""
    arm = m['arm']
    hair_bones = [b.name for b in arm.data.bones if 'HairJoint' in b.name or b.name.startswith('J_Sec_Hair')]
    if m['hair']: bpy.data.objects.remove(m['hair'], do_unlink=True); m['hair'] = None
    print('  removed hair bones', C.remove_bones(arm, hair_bones))
    # 原本的連身裙：上半身＝開襟衫的權重來源（p00_clothes 用完就刪）；裙擺部分＝新裙子的權重來源（另外留一份，衣服階段用完刪）
    m['wsrc_top'] = C.extract_by_material(m['body'], ['Tops'], 'WSRC_Tops', 'J_Sec_')
    m['wsrc_skirt'] = C.extract_by_material(m['body'], ['Tops'], 'WSRC_Skirt')
    print('  weight source (dress) faces', len(m['wsrc_top'].data.polygons))
    print('  removed dress/shoes/back-hair faces', C.delete_by_material(m['body'], ['Tops', 'Shoes', 'HairBack']))
    sec_bones = [b.name for b in arm.data.bones if b.name.startswith('J_Sec_') and not any(k in b.name for k in KEEP_SEC)]
    for o in (m['body'], m['face']):
        for n in sec_bones:
            if n in o.vertex_groups: o.vertex_groups.remove(o.vertex_groups[n])
    print('  removed secondary bones', C.remove_bones(arm, sec_bones), sec_bones[:6])
    C.prune_springs(arm)
    import heroine_05 as H05      # 透明的皮膚（原本衣服蓋住的地方）補成皮膚色：開襟衫的 V 領口、白 T 的圓領附近看得到
    H05.fill_hidden_skin(m['body'], 'Body_00_SKIN', 'S01_Body_filled')
    bare_legs(m['body'])
    H = C.scale_head(arm, [m['face'], m['body']], HEAD_SCALE)
    nk = C.bone_head(arm, 'J_Bip_C_Neck')
    w = np.clip(C.vgroup_weights(m['body'], {'J_Bip_C_Neck'}), 0, 1)
    C.warp(m['body'], lambda P, B: np.column_stack([nk[0] + (P[:, 0] - nk[0]) * (1 - (1 - NECK_SLIM) * w), nk[1] + (P[:, 1] - nk[1]) * (1 - (1 - NECK_SLIM) * w), P[:, 2]]))
    print('  head scaled', HEAD_SCALE, 'about', np.round(H, 3), 'landmarks', {k: round(v, 3) for k, v in C.landmarks(arm).items()})


STAGES = {'stage0': stage0}
import importlib
def stage_fn(name):
    if name not in STAGES: STAGES[name] = importlib.import_module('peishan_' + name).apply
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
    m['wsrc_top'] = bpy.data.objects.get('WSRC_Tops'); m['wsrc_skirt'] = bpy.data.objects.get('WSRC_Skirt')
    if bpy.data.objects.get('Clothes_S01') is not None: m['clothes'] = bpy.data.objects['Clothes_S01']
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
    for k in ('wsrc_top', 'wsrc_skirt'):      # 權重來源不匯出
        if m.get(k) is not None: bpy.data.objects.remove(m[k], do_unlink=True); m[k] = None
    if '--render' in opt:
        kw = {'views': tuple(opt['--views'].split(','))} if '--views' in opt else {}
        print('renders', C.render_views(opt['--render'], head_z=1.50, height=1.62, **kw))
    if out != '-': print('exported', C.export_vrm(os.path.abspath(out)))


if __name__ == '__main__':
    main()
