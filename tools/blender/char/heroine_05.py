"""溫書瑀（heroine_05）Blender 人物製作（v9.4 人物生產線第六位，高子晴 heroine_04.py 之後）。
基底：VRoid CC0 樣本 Sendagaya Shino 的身體、臉（含全部表情 shape key）、骨架；原本的頭髮（含身體網格上的後髮）、上衣、頸飾、褲子、鞋、次要骨頭（胸部以外）拿掉。
臉、衣服沿用沈以安的模組（h01_face、h01_clothes），用 p00_face.run／p00_clothes.run 先對到沈以安的比例、做完再轉回來；頭髮是新的低馬尾＋中分長瀏海 p05_hair（馬尾有彈簧骨）；襯衫領子、門襟、反摺袖口是 p05_clothes 自己做的網格。
判決節錄資料夾仍是 src/props3d.js（C.MODEL_PROPS）。
用法：/opt/blenv/bin/python tools/blender/char/heroine_05.py -- <輸出.vrm> [--blend 工作檔.blend] [--stages stage0,face,clothes,hair] [--render 預覽圖前綴]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as C
import numpy as np, bpy

HEAD_SCALE = 0.90    # 頭縮小（參考圖 06 的溫書瑀是 172 cm、六人裡最高，成熟的大人比例）
NECK_SLIM = 0.95


def fill_hidden_skin(obj, pat, name, r=40):
    """VRoid 樣本的身體貼圖在原本衣服蓋住的地方（胸口、上背、上臂…）是透明的（alpha 0；網格還在，只是看不見）：
    襯衫開 V 領會看到一個洞、脖子下緣像一條鋸齒邊（2026-10-10 溫書瑀第一版）。透明的地方填上周圍皮膚的顏色（只取像皮膚的像素做正規化模糊，
    離皮膚太遠的用皮膚的中位數）、alpha 改成 1；新衣服蓋住的皮膚之後由衣服模組照常刪掉，只有 V 字開口裡的看得到。"""
    import h01_face as F
    for slot in obj.material_slots:
        mt = slot.material
        if not mt or pat not in mt.name: continue
        e = mt.vrm_addon_extension.mtoon1; src = e.pbr_metallic_roughness.base_color_texture.index.source
        if src is None: continue
        a = F.img_array(src); rgb = a[..., :3]; hole = a[..., 3] < 0.5
        R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        skin = (~hole) & (R > 0.55) & (R > G + 0.03) & (G > B) & (R - B < 0.45)
        keep = skin.astype(float)
        fill = F.blur(rgb * keep[..., None], r) / np.maximum(F.blur(keep, r), 1e-4)[..., None]
        w = np.clip(F.blur(keep, r) * 8, 0, 1)[..., None]
        med = np.median(rgb[skin], axis=0)
        fill = fill * w + med * (1 - w)
        out = a.copy(); out[..., :3] = np.where(hole[..., None], fill, rgb); out[..., 3] = 1
        im = C.image_from_array(name, out.astype(np.float32)); F.set_tex(mt, im)
        print('  %s: filled %d transparent px with skin (median %s)' % (name, int(hole.sum()), np.round(med, 3)))


def stage0(m):
    """拿掉樣本的頭髮（頭髮物件＋身體網格上的後髮）、上衣、鞋、胸部以外的次要骨頭；頭縮小、脖子收一點"""
    arm = m['arm']
    hair_bones = [b.name for b in arm.data.bones if 'HairJoint' in b.name or b.name.startswith('J_Sec_Hair')]
    if m['hair']: bpy.data.objects.remove(m['hair'], do_unlink=True); m['hair'] = None
    print('  removed hair bones', C.remove_bones(arm, hair_bones))
    m['wsrc_top'] = C.extract_by_material(m['body'], ['Tops'], 'WSRC_Tops', 'J_Sec_')   # 原本的上衣：新上衣的權重來源（衣服階段用完就刪）
    print('  weight source (VRoid tops) faces', len(m['wsrc_top'].data.polygons))
    print('  removed clothes/back-hair faces', C.delete_by_material(m['body'], ['Tops', 'AccessoryNeck', 'Bottoms', 'Shoes', 'HairBack']))
    keep = ('Bust',)
    sec_bones = [b.name for b in arm.data.bones if b.name.startswith('J_Sec_') and not any(k in b.name for k in keep)]
    for o in (m['body'], m['face']):
        for n in sec_bones:
            if n in o.vertex_groups: o.vertex_groups.remove(o.vertex_groups[n])
    print('  removed secondary bones', C.remove_bones(arm, sec_bones), sec_bones[:6])
    C.prune_springs(arm)
    fill_hidden_skin(m['body'], 'Body_00_SKIN', 'P05_Body_filled')
    H = C.scale_head(arm, [m['face'], m['body']], HEAD_SCALE)
    nk = C.bone_head(arm, 'J_Bip_C_Neck')
    w = np.clip(C.vgroup_weights(m['body'], {'J_Bip_C_Neck'}), 0, 1)
    C.warp(m['body'], lambda P, B: np.column_stack([nk[0] + (P[:, 0] - nk[0]) * (1 - (1 - NECK_SLIM) * w), nk[1] + (P[:, 1] - nk[1]) * (1 - (1 - NECK_SLIM) * w), P[:, 2]]))
    print('  head scaled', HEAD_SCALE, 'about', np.round(H, 3), 'landmarks', {k: round(v, 3) for k, v in C.landmarks(arm).items()})


STAGES = {'stage0': stage0}
import importlib
def stage_fn(name):
    if name not in STAGES: STAGES[name] = importlib.import_module('p05_' + name).apply
    return STAGES[name]


def main():
    a = C.args(); out = a[0]
    opt = {a[i]: a[i + 1] for i in range(1, len(a) - 1) if a[i].startswith('--')}
    stages = opt.get('--stages', 'stage0').split(',')
    C.setup(); m = C.import_vrm(os.path.join(C.SRC, 'Sendagaya_Shino.vrm'))
    for s in stages:
        print('[stage]', s); stage_fn(s)(m)
    if '--blend' in opt:      # 只跑到臉的工作檔保留權重來源（之後從這裡重做衣服）
        os.makedirs(os.path.dirname(os.path.abspath(opt['--blend'])), exist_ok=True)
        bpy.ops.file.pack_all(); bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(opt['--blend']), compress=True); print('saved blend', opt['--blend'])
    if m.get('wsrc_top') is not None: bpy.data.objects.remove(m['wsrc_top'], do_unlink=True); m['wsrc_top'] = None   # 權重來源不匯出
    if '--render' in opt: print('renders', C.render_views(opt['--render'], head_z=1.50, height=1.64))
    print('exported', C.export_vrm(os.path.abspath(out)))


if __name__ == '__main__':
    main()
