"""阿哲（zhe）的臉：沿用 h01_face（p00_face.run：等比例對到沈以安的臉、做完轉回來）＋男生的參數，再把皮膚調成小麥色。
參考圖 zhe.webp：笑起來眼睛彎、直的濃眉、鼻樑直、下顎線清楚、膚色偏小麥色（臉頰取樣約 #d09772，比祐廷深）。
小麥色：臉、身體皮膚材質的 MToon 底色係數（lit）與陰影色一起乘上 TAN（不改貼圖：五官、腮紅、陰影的明暗照舊）。"""
import p00_face as PF

ZHE = dict(PF.MALE)
ZHE.update(EYE_TILT=0.02,                                   # 眼型照祐廷（第一版 EYE_SZ 0.78、EYE_SX 1.04 想做圓一點：遊戲裡看起來像國中生）
           MOUTH_K=1.38, LIP_A=0.50,                        # 嘴窄一點、唇色淡一點（第一版 1.50：一條又寬又深的嘴，像擦了口紅）
           BROW_K=1.65, BROW_ARCH=0.30, BROW_COL=(0.16, 0.11, 0.08), BROW_SCALE_Z=1.50,   # 直的濃眉、深棕（髮色是棕色）
           JAW_OUT=0.0052, CHIN_WIDEN=0.60,                 # 下顎線清楚、下巴寬一點（運動型）
           LIP_OUT=(0.76, 0.50, 0.44), LIP_IN=(0.66, 0.40, 0.36), LIP_HI=(0.84, 0.62, 0.56))   # 唇色配小麥色皮膚
TAN = (0.86, 0.70, 0.56)          # 參考圖臉頰 #d09772／脖子 #dea377；VRoid 男性樣本的皮膚約 #fbe2d4（第一版 0.90／0.77／0.64：遊戲裡只是偏桃色）
SHADE_TAN = (0.92, 0.80, 0.70)   # 陰影色本來偏粉紅（0.94, 0.63, 0.72），乘太多會變紅褐色


def tan_skin(objs, factor=TAN, shade=SHADE_TAN):
    n = 0
    for o in objs:
        for slot in o.material_slots:
            mt = slot.material
            if not mt or not mt.name.endswith('_SKIN') or not getattr(mt, 'vrm_addon_extension', None): continue
            e1 = mt.vrm_addon_extension.mtoon1
            bc = tuple(e1.pbr_metallic_roughness.base_color_factor)
            e1.pbr_metallic_roughness.base_color_factor = (bc[0] * factor[0], bc[1] * factor[1], bc[2] * factor[2], bc[3])
            mtn = e1.extensions.vrmc_materials_mtoon; sc = tuple(mtn.shade_color_factor)
            mtn.shade_color_factor = (sc[0] * shade[0], sc[1] * shade[1], sc[2] * shade[2])
            print('  tan skin: %s base %s → %s, shade %s → %s' % (mt.name, tuple(round(v, 3) for v in bc[:3]), tuple(round(v, 3) for v in e1.pbr_metallic_roughness.base_color_factor[:3]),
                                                                  tuple(round(v, 3) for v in sc), tuple(round(v, 3) for v in mtn.shade_color_factor)))
            n += 1
    return n


def apply(m):
    PF.run(m, ZHE, {'Fcl_EYE_Close': 0.0})       # 男性樣本沒有 Fcl_EYE_Natural；眼型不烘（vrm_finish 用 MALE_EYES）
    print('  tan skin materials', tan_skin([m['face'], m['body']]))
