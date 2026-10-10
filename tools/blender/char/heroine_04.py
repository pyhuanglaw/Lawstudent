"""高子晴（heroine_04）Blender 人物製作（v9.4 人物生產線第五位，陳語彤 heroine_03.py 之後）。
基底：VRoid CC0 樣本 Vita 的身體、臉（含全部表情 shape key）、骨架；原本的頭髮（含身體網格上的後髮）、上衣、鞋、次要骨頭（胸部以外）拿掉。
臉、衣服沿用沈以安的模組（h01_face、h01_clothes），用 p00_face.run／p00_clothes.run 先對到沈以安的比例、做完再轉回來；頭髮是新的短鮑伯 p04_hair。
吉他袋、背帶仍是 src/props3d.js（C.MODEL_PROPS）。
用法：/opt/blenv/bin/python tools/blender/char/heroine_04.py -- <輸出.vrm> [--blend 工作檔.blend] [--stages stage0,face,clothes,hair] [--render 預覽圖前綴]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as C
import numpy as np, bpy

HEAD_SCALE = 0.91    # 頭縮小（參考圖 06 的高子晴是 169 cm、腿長、運動感）
NECK_SLIM = 0.95


def clean_texture(obj, pat, name, mask_fn, grow=6, r=36):
    """材質（名稱含 pat）的底色貼圖：mask_fn(rgb) 為真的像素（往外擴 grow px）換成周圍皮膚的模糊值（正規化模糊；離皮膚太遠的用皮膚中位數）。
    Vita 樣本的皮膚貼圖畫了科幻花紋（臉頰、肩膀、胸口）、緊身褲與手套的顏色（腿、手），高子晴穿短褲、連帽外套，會露出來。"""
    import h01_face as F
    for slot in obj.material_slots:
        mt = slot.material
        if not mt or pat not in mt.name: continue
        e = mt.vrm_addon_extension.mtoon1; src = e.pbr_metallic_roughness.base_color_texture.index.source
        if src is None: continue
        a = F.img_array(src); rgb = a[..., :3]
        mask = mask_fn(rgb).astype(float)
        mask = F.blur(mask, grow) > 0.02
        keep = (~mask).astype(float)
        fill = F.blur(rgb * keep[..., None], r) / np.maximum(F.blur(keep, r), 1e-4)[..., None]
        w = np.clip(F.blur(keep, r) * 8, 0, 1)[..., None]
        med = np.median(rgb[~mask], axis=0)
        fill = fill * w + med * (1 - w)
        out = a.copy(); out[..., :3] = np.where(mask[..., None], fill, rgb); out[..., 3] = 1
        im = C.image_from_array(name, out.astype(np.float32)); F.set_tex(mt, im)
        print('  %s: cleaned %d px (skin median %s)' % (name, int(mask.sum()), np.round(med, 3)))


def not_skin(rgb):
    """皮膚一定是 R > G > B（暖色）；科幻花紋的青綠、藍紫，緊身褲、手套的深色都不是"""
    R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return (G > R + 0.02) | (B > R + 0.02) | ((R - B) < 0.10) | ((R - G) < 0.04) | (R < 0.45)


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
    clean_texture(m['face'], 'Face_00_SKIN', 'P04_Face_clean', not_skin, grow=6)     # 臉頰的科幻花紋（含淡綠光暈與描邊殘影）
    clean_texture(m['body'], 'Body_00_SKIN', 'P04_Body_clean', not_skin, grow=4)     # 肩膀、胸口的花紋，腿上的緊身褲、手上的手套
    H = C.scale_head(arm, [m['face'], m['body']], HEAD_SCALE)
    nk = C.bone_head(arm, 'J_Bip_C_Neck')
    w = np.clip(C.vgroup_weights(m['body'], {'J_Bip_C_Neck'}), 0, 1)
    C.warp(m['body'], lambda P, B: np.column_stack([nk[0] + (P[:, 0] - nk[0]) * (1 - (1 - NECK_SLIM) * w), nk[1] + (P[:, 1] - nk[1]) * (1 - (1 - NECK_SLIM) * w), P[:, 2]]))
    print('  head scaled', HEAD_SCALE, 'about', np.round(H, 3), 'landmarks', {k: round(v, 3) for k, v in C.landmarks(arm).items()})


STAGES = {'stage0': stage0}
import importlib
def stage_fn(name):
    if name not in STAGES: STAGES[name] = importlib.import_module('p04_' + name).apply
    return STAGES[name]


def main():
    a = C.args(); out = a[0]
    opt = {a[i]: a[i + 1] for i in range(1, len(a) - 1) if a[i].startswith('--')}
    stages = opt.get('--stages', 'stage0').split(',')
    C.setup(); m = C.import_vrm(os.path.join(C.SRC, 'Vita.vrm'))
    for s in stages:
        print('[stage]', s); stage_fn(s)(m)
    if '--blend' in opt:      # 只跑到臉的工作檔保留權重來源（之後從這裡重做衣服）
        os.makedirs(os.path.dirname(os.path.abspath(opt['--blend'])), exist_ok=True)
        bpy.ops.file.pack_all(); bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(opt['--blend']), compress=True); print('saved blend', opt['--blend'])
    if m.get('wsrc_top') is not None: bpy.data.objects.remove(m['wsrc_top'], do_unlink=True); m['wsrc_top'] = None   # 權重來源不匯出
    if '--render' in opt: print('renders', C.render_views(opt['--render'], head_z=1.54, height=1.68))
    print('exported', C.export_vrm(os.path.abspath(out)))


if __name__ == '__main__':
    main()
