"""唐睿（econ_tangrui）的衣服（參考圖 tangrui.webp 正面／側面／背面）：藍色短袖 POLO 衫（反摺領、胸前短門襟兩顆扣子、短袖到上臂中段、下擺沒有紮、蓋過褲頭）
＋白色直筒長褲＋灰色球鞋（白鞋底）。胸口口袋＋便利貼第一版沒做。
LAWWW2-C 2026-10-17 第一版：沿用柏翰 bohan_clothes 的做法（LAWWW 給溫書瑀做的 p05_clothes：襯衫身片＋領子＋門襟＋扣子＋袖口；
高度照柏翰在 HairSample_Male 樣本量的數字），改：短袖（SLEEVE_LEN）、下擺不紮（HEM_OVER_PANTS）、顏色、沒有皮帶；
POLO 衫的門襟只到胸口：p05 的門襟從 V 字最低點一路做到褲頭（p05_clothes 是 LAWWW 的檔案，不改），所以做完以後把門襟網格
低於 V 字最低點 12.5 cm 的面剪掉（剩兩顆扣子）。袖口那圈 4 cm 的布（p05 原本是捲起來的袖口）在短袖上就是 POLO 衫袖子的羅紋。"""
import numpy as np
import bpy, bmesh
import p05_clothes as P5

BLUE = np.array([112, 150, 204]) / 255.0          # 參考圖 POLO 衫 #7096cc（受光面）
STYLE = dict(KNIT_RGB=BLUE, TROUSER_RGB=np.array([236, 234, 228]) / 255.0, BELT_RGB=None,
             LEATHER_RGB=np.array([150, 152, 156]) / 255.0, SOLE_RGB=np.array([232, 230, 224]) / 255.0, GOLD_RGB=np.array([232, 230, 224]) / 255.0,
             SHOE_STYLE='sneaker', NECK_STYLE='V', HEM_OVER_PANTS=True, SLIM=False, TOP_TEX='jersey', TROUSER_TEX='twill',
             SLEEVE_LEN=0.40, SLEEVE_K=0.62, CUFF_EASE=0.008, EASE_K=0.16, DROP_X=0.090, TOP_FIT=1.0, HEM_LOOSE=True, SHOULDER_SAG=0.020, SLEEVE_IN=0.035, NECK_CALM=1.0,   # 第十二版（BB_201 第 9 節：polo 太鼓，「照沛珊的做法降低離身體的距離；polo 是貼身針織，袖口一圈羅紋」）：寬鬆量 0.45 → 0.16、合身 0.8 → 1、袖子細、袖口貼手臂   # 第七版（BB_201：像膨膨的連帽上衣）：沛珊的做法——肩膀下沉、袖子往內、貼身
            
             PANTS_ELLIPSE=(0.060, 0.068), PANTS_DROP=False, PANTS_HEM_UP=0.0, PANTS_FOLLOW=True)   # 第四版：袖子細一點、褲管跟著腿走（第三版白長褲往下張開像喇叭褲）
# 高度（HairSample_Male 樣本，柏翰量過：胯 0.964、脊椎 1.149、脖子 1.456）：褲頭照柏翰；POLO 衫下擺在胯骨上面一點（不紮、蓋過褲頭 11 cm）；V 字最低點比柏翰的襯衫低 1 cm
STYLE_M = dict(PANTS_TOP=1.115, PANTS_BAND=1.078, KNIT_HEM=1.005, KNIT_HEM_TOP=1.022, V_BOTTOM=1.424, BACK_NECK_Z=1.482)   # 第四版：V 字淺一點（第三版 1.402 遊戲裡像敞開的襯衫；POLO 衫的開口短）、下擺的邊窄一點
SIDE_NECK_M = (0.066, 1.492)
PLACKET_LEN = 0.105


def trim_placket(z_cut):
    """POLO 衫：門襟、扣子只留 V 字最低點以下 PLACKET_LEN"""
    ob = bpy.data.objects.get('Clothes_Placket')
    if ob is None: return 0
    me = ob.data; bm = bmesh.new(); bm.from_mesh(me); Mw = ob.matrix_world
    dead = [f for f in bm.faces if (Mw @ f.calc_center_median()).z < z_cut]
    bmesh.ops.delete(bm, geom=dead, context='FACES')
    loose = [v for v in bm.verts if not v.link_faces]; bmesh.ops.delete(bm, geom=loose, context='VERTS')
    bm.to_mesh(me); bm.free(); me.update()
    return len(dead)


def pocket_notes(m, clothes):
    """第七版（BB_201：「胸口口袋露出一疊便利貼，是他的識別物」）：左胸（人物的左邊）一個貼袋＋三張便利貼（黃、淡綠、粉紅）從袋口露出 1.5～2 cm。
    獨立物件、全部綁上胸骨（跟著胸口動）；位置用往衣服打的射線找表面"""
    import os, math
    import common as C
    import h01_clothes as K
    arm = m['arm']; dg = bpy.context.evaluated_depsgraph_get()
    uc = np.array(C.bone_head(arm, 'J_Bip_C_UpperChest')); nk = np.array(C.bone_head(arm, 'J_Bip_C_Neck'))
    zc = uc[2] + 0.25 * (nk[2] - uc[2]) - 0.035; xc = uc[0] + 0.075
    def hit(x, z):
        o = clothes.evaluated_get(dg); Mi = clothes.matrix_world.inverted()
        ok, loc, nrm, _ = o.ray_cast(Mi @ __import__('mathutils').Vector((x, -0.6, z)), (Mi.to_3x3() @ __import__('mathutils').Vector((0, 1, 0))).normalized())
        return (np.array(clothes.matrix_world @ loc), np.array((clothes.matrix_world.to_3x3() @ nrm).normalized())) if ok else (None, None)
    V, F, UV = [], [], []
    def quad(pts, uv):
        i = len(V); V.extend(pts); UV.extend(uv); F.append((i, i + 1, i + 2, i + 3))
    W, H, D = 0.050, 0.055, 0.003       # 半寬、高、離布面
    corners = []
    for (dx, dz) in ((-W, -H), (W, -H), (W, 0.0), (-W, 0.0)):
        p, n = hit(xc + dx, zc + dz)
        if p is None: p, n = np.array([xc + dx, -0.10, zc + dz]), np.array([0, -1.0, 0])
        corners.append(p + n * D)
    quad(corners, [(0.0, 0.0), (0.25, 0.0), (0.25, 0.25), (0.0, 0.25)])          # 口袋（和衣服同色，貼圖左下角）
    up = np.array([0, 0, 1.0]); cols = [(0.97, 0.88, 0.36), (0.72, 0.90, 0.62), (0.98, 0.70, 0.76)]
    for k, (ox, h) in enumerate(((-0.018, 0.019), (0.004, 0.016), (0.020, 0.021))):   # 三張便利貼：寬 7 cm 的方紙，露出 1.6～2.1 cm，左右錯開、一點點斜
        a, b_ = corners[3], corners[2]; mid = (a + b_) / 2 + (b_ - a) * (ox / (2 * W)); xdir = (b_ - a) / np.linalg.norm(b_ - a)
        tilt = (k - 1) * 0.06; xd = xdir * math.cos(tilt) + up * math.sin(tilt); ud = up * math.cos(tilt) - xdir * math.sin(tilt)
        base = mid - ud * 0.03 + np.array([0, -0.0015 * (k + 1), 0])
        u0 = 0.25 + 0.25 * k
        quad([base - xd * 0.035, base + xd * 0.035, base + xd * 0.035 + ud * (0.03 + h), base - xd * 0.035 + ud * (0.03 + h)], [(u0, 0.5), (u0 + 0.25, 0.5), (u0 + 0.25, 0.75), (u0, 0.75)])
    me = bpy.data.meshes.new('Pocket_T01'); me.from_pydata([tuple(p) for p in V], [], F); me.validate(clean_customdata=False); me.update()
    uvl = me.uv_layers.new(name='UVMap'); li = np.zeros(len(me.loops), int); me.loops.foreach_get('vertex_index', li)
    uvl.data.foreach_set('uv', np.array(UV)[li].reshape(-1).astype(np.float32))
    obj = bpy.data.objects.new('Pocket_T01', me)
    (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
    S = 64; img = np.ones((S, S, 4)); img[: S // 4, : S // 4, :3] = BLUE * 0.92            # 口袋：比衣服暗一點（縫線的陰影）
    for k, c in enumerate(cols): img[S // 2: 3 * S // 4, S // 4 * (k + 1): S // 4 * (k + 2), :3] = c
    img = img[::-1]                                                                          # 圖片的第 0 列在上，UV 的 v 往上
    im = C.image_from_array('T01_Pocket', img.astype(np.float32), os.path.join(K.WIP, 't01_pocket.png'))
    tm = next(mt.name for mt in bpy.data.materials if mt.name.endswith('_CLOTH') and 'Tops' in mt.name and not mt.name.startswith(('H01_', 'X01_', 'Z01_', 'W01_', 'T01_')))
    mat = C.mtoon_from(tm, 'T01_Pocket_CLOTH', base_img=im); me.materials.append(mat)
    C.bind(obj, arm, {'J_Bip_C_UpperChest': np.ones(len(V))})
    print('  polo pocket + sticky notes: verts %d at x %.3f z %.3f' % (len(V), xc, zc))
    return obj


def apply(m):
    P5.STYLE, P5.STYLE_M, P5.SIDE_NECK_M = STYLE, STYLE_M, SIDE_NECK_M
    P5.COLLAR_STAND = (0.030, 0.020)     # 第七版：領座高一點（POLO 衫的領子立起來一點，正面看得出是翻領，不像 V 領）
    obj = P5.apply(m)
    print('  polo placket: faces removed below the chest', trim_placket(STYLE_M['V_BOTTOM'] - PLACKET_LEN))
    pocket_notes(m, obj)
    print('  cuff rib rows', cuff_rib(obj))
    import x_xinci_clothes as XC, peishan_clothes as PS
    body = m['body']; ki = next(i for i, mt in enumerate(obj.data.materials) if mt and 'Knit' in mt.name)
    # 貼身以後，手放下來時胸口、肩膀的皮膚會從布裡穿出來（沛珊第十七～二十版）：同樣收進去（前面 V 字開口不動）
    # 第十三版：到 V 字上面 6 cm（第十二版到 V 字下面 3 cm：V 字兩側、領尖下面的胸口皮膚從布裡穿出來兩塊；V 字開口裡沒有布，射線打不到，不會動）
    print('  body pulled under the polo', XC.conform_under(body, obj, ki, STYLE_M['PANTS_TOP'] - 0.03, STYLE_M['V_BOTTOM'] + 0.06, inset=0.008, slack=0.005, max_move=0.015))
    print('  shoulders pulled under the polo', PS.pull_shoulders(body, obj, STYLE_M['V_BOTTOM'] - 0.04, STYLE_M['BACK_NECK_Z'] - 0.008, mat_idx=ki))
    # 第十四版：V 字兩側、領尖下面那兩塊是皮膚從「領子」穿出來（洋紅背景確認不是破洞）——身片收窄，領子跟著往內，領子底下的胸口皮膚沒有收
    # 第十六版：V 字兩側（離中線 4～5 cm）的皮膚 T 字姿勢時在身片裡面 5～12 mm，待機時從領尖和身片之間的縫看得到 → 那一段 1.2 cm 以內的都收到 6 mm 深
    print('  V sides pulled deeper', XC.conform_under(body, obj, ki, STYLE_M['V_BOTTOM'] - 0.01, STYLE_M['V_BOTTOM'] + 0.06, inset=0.006, slack=0.012, max_move=0.015))
    col = bpy.data.objects.get('Clothes_Collar')
    if col is not None: print('  body pulled under the collar', XC.conform_under(body, col, 0, STYLE_M['V_BOTTOM'] - 0.02, STYLE_M['V_BOTTOM'] + 0.05, inset=0.004, slack=0.003, max_move=0.015))
    return obj


def cuff_rib(obj):
    """第十二版（BB_201 第 9 節「袖口一圈羅紋」）：身片貼圖 v 0.80～0.94（袖口那一圈；下擺在 0.76～0.79、領子用中間）畫粗一點、深一點的羅紋——
    jersey 原本的羅紋 180 條、亮度只差 14%，遊戲裡看不出來。袖口用到 v 0.78～0.94，0.895 以上和 V 字的滾邊共用，不畫"""
    knit = next(mt for mt in obj.data.materials if mt and 'Knit' in mt.name)
    img = knit.vrm_addon_extension.mtoon1.pbr_metallic_roughness.base_color_texture.index.source
    W, H = img.size; a = np.empty(W * H * 4, np.float32); img.pixels.foreach_get(a); a = a.reshape(H, W, 4)   # 第 0 列在下面：v＝(列＋0.5)／高
    v = (np.arange(H) + 0.5) / H; u = (np.arange(W) + 0.5) / W
    band = (v > 0.80) & (v < 0.895)                       # 第十三版：0.94 → 0.895（V 字的滾邊在 0.90 以上，第十二版跟著變成粗條紋）
    rib = 0.80 + 0.20 * np.abs(np.cos(np.pi * ((u * 120) % 1.0 - 0.5))) ** 1.5
    a[band, :, :3] *= rib[None, :, None]
    img.pixels.foreach_set(a.reshape(-1)); img.update(); img.pack()
    return int(band.sum())
