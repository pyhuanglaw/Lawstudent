"""路人底模產生器（LAWWW2；LAWWW 2026-10-14 09:53Z：使用者「可不可以不要說 NPC 都只是從一張臉、只是換衣服」）。
現在的路人只有 4 個底模（src/character3d.js 的 AMB：npc_f1／f2／m1／m2），只換頭髮、上衣、下身的顏色。這裡做更多路人底模：
每個人不同的 VRoid 樣本（身體、臉的 shape key）、臉的參數（p00_face：眼睛大小與角度、眉毛、臉寬、下巴）、髮型（npc_hair_m／npc_hair_f：
長度、分線、蓬度、顏色）、衣服（p00_clothes.run：款式、布料、顏色）、身高（manifest 的 height）。避開主要角色的辨識特徵（髮型＋顏色＋衣服的組合）。
做法照 LAWWW 的人物生產線（tools/blender/char）＋杜可昕、明軒的模組；用法：
  NPC=<名字> /opt/blenv/bin/python tools/blender/char_second/npc.py -- <輸出.vrm 或 -> [--blend 工作檔] [--from-blend 工作檔] [--stages stage0,face,clothes,hair] [--render 前綴] [--views ...]
之後：VRM_BASE=<樣本> [VRM_MALE=1] NPC_SMALL=1 python3 tools/blender/char_second/vrm_finish2.py <輸出.vrm> <遊戲用.vrm> 路人 [虹膜色]"""
import sys, os, json
HERE = os.path.dirname(os.path.abspath(__file__))
CHAR_LIB = os.environ.get('CHAR_LIB') or next((p for p in (os.path.join(HERE, '..', 'char'), '/home/user/char_wt/tools/blender/char') if os.path.exists(os.path.join(p, 'common.py'))), None)
sys.path.insert(0, HERE); sys.path.insert(1, CHAR_LIB)
import common as C
import numpy as np, bpy

def rgb(*c): return np.array(c, float) / 255.0

# 各樣本的衣服高度（人物空間；照已經做過的人物量過的數字：祐廷／柏翰＝HairSample_Male、阿哲／明軒＝Sakurada Fumiriya、
# 杜可昕＝Victoria Rubin、沈以安／芯慈＝HairSample_Female／Darkness Shibu）
HT = dict(
    HairSample_Male=dict(M=dict(PANTS_TOP=1.060, PANTS_BAND=1.020, KNIT_HEM=0.930, KNIT_HEM_TOP=0.945, CREW_FRONT_Z=1.452, BACK_NECK_Z=1.478, V_BOTTOM=1.400), side=(0.066, 1.492)),
    Sakurada_Fumiriya=dict(M=dict(PANTS_TOP=1.200, PANTS_BAND=1.160, KNIT_HEM=1.060, KNIT_HEM_TOP=1.075, CREW_FRONT_Z=1.578, BACK_NECK_Z=1.615, V_BOTTOM=1.540), side=(0.066, 1.631)),
    Victoria_Rubin=dict(M=dict(PANTS_TOP=1.083, PANTS_BAND=1.046, KNIT_HEM=0.960, KNIT_HEM_TOP=0.975, CREW_FRONT_Z=1.395, BACK_NECK_Z=1.430, V_BOTTOM=1.360), side=(0.058, 1.436)),
    HairSample_Female=dict(M=dict(PANTS_TOP=1.100, PANTS_BAND=1.031, KNIT_HEM=0.990, KNIT_HEM_TOP=1.005, CREW_FRONT_Z=1.345, BACK_NECK_Z=1.388, V_BOTTOM=1.300), side=(0.071, 1.402)),
    Darkness_Shibu=dict(M=dict(PANTS_TOP=1.050, PANTS_BAND=1.022, KNIT_HEM=0.985, KNIT_HEM_TOP=1.005, CREW_FRONT_Z=1.330, BACK_NECK_Z=1.380, V_BOTTOM=1.290), side=(0.078, 1.392)),   # 沛珊、品妤量過的
)

def style(top, pants, shoe, sole, tex='jersey', neck='crew', sleeve=0.46, sleeve_k=0.85, ease=0.9, pants_ell=(0.064, 0.074), drop=False, ptex='twill', shoe_style='sneaker', hem_loose=True, top_fit=0.0):
    return dict(KNIT_RGB=top, TROUSER_RGB=pants, BELT_RGB=None, LEATHER_RGB=shoe, SOLE_RGB=sole, GOLD_RGB=shoe, SHOE_STYLE=shoe_style, NECK_STYLE=neck,
                HEM_OVER_PANTS=True, SLIM=False, TOP_TEX=tex, TROUSER_TEX=ptex, SLEEVE_LEN=sleeve, SLEEVE_K=sleeve_k, CUFF_EASE=0.022 if sleeve < 0.8 else 0.010,
                EASE_K=ease, DROP_X=0.115, TOP_FIT=top_fit, HEM_LOOSE=hem_loose, PANTS_ELLIPSE=pants_ell, PANTS_DROP=drop, PANTS_HEM_UP=0.0)

def outer_style(outer, bottom, shoe, sole, tex='knit', sleeve_k=0.70, ease=0.70, pants_ell=(0.066, 0.076), drop=False, ptex='twill', shoe_style='sneaker'):
    """日劇穿搭（npc_layered）：外套或上衣的參數；bottom＝褲子或裙子的顏色"""
    return dict(KNIT_RGB=outer, TROUSER_RGB=bottom, BELT_RGB=None, LEATHER_RGB=shoe, SOLE_RGB=sole, GOLD_RGB=shoe, SHOE_STYLE=shoe_style, NECK_STYLE='crew',
                HEM_OVER_PANTS=True, SLIM=False, TOP_TEX=tex, TROUSER_TEX=ptex, SLEEVE_LEN=1.0, SLEEVE_K=sleeve_k, CUFF_EASE=0.010, EASE_K=ease,
                DROP_X=0.110, TOP_FIT=0.4, HEM_LOOSE=False, PANTS_ELLIPSE=pants_ell, PANTS_DROP=drop, PANTS_HEM_UP=0.0)

# 路人（男女各幾個；第一批 4 個，之後加）：base＝樣本、head＝頭縮放、face＝p00_face 參數（男生以 PF.MALE 為底、女生以 FEMALE 為底）、
# hair＝npc_hair_m／f 的 P、clothes＝style(...)、height＝遊戲裡的身高、iris＝虹膜色
VARIANTS = {
    'nm1': dict(sex='m', base='HairSample_Male', head=0.93, height=1.70, iris='#3a2a20',
                face=dict(EYE_SX=1.02, EYE_SZ=0.76, EYE_TILT=0.01, BROW_ARCH=0.55, BROW_K=1.45, FACE_NARROW=0.975, JAW_OUT=0.0040, CHIN_WIDEN=0.58, MOUTH_K=1.42),
                hair=dict(seed=20261211, part=-12.0, col=(0.20, 0.16, 0.13), tip=(0.012, 0.012, 0.004, 0.012, 0.010, 0.006, 0.0, -0.010, -0.006, -0.004), nape=0.015, vol=0.8, curl=(8, 20)),
                clothes=style(rgb(46, 58, 92), rgb(176, 160, 128), rgb(238, 238, 234), rgb(226, 224, 218))),   # 深藍 T＋卡其褲＋白球鞋
    'nm2': dict(sex='m', base='Sakurada_Fumiriya', head=0.97, height=1.80, iris='#2a2420',
                face=dict(EYE_TILT=0.05, EYE_SX=1.06, EYE_SZ=0.66, BROW_K=1.70, BROW_ARCH=0.20, FACE_NARROW=0.950, CHIN_WIDEN=0.50, JAW_OUT=0.0052, MOUTH_K=1.36),
                hair=dict(seed=20261212, part=0.0, col=(0.12, 0.11, 0.11), tip=(-0.012, -0.010, -0.014, 0.0, -0.004, -0.010, -0.016, -0.026, -0.024, -0.020), nape=0.035, vol=1.0, curl=(2, 10)),   # 第二版：蓬度 1.15 → 1.0（頭頂一根根往上刺）
                clothes=style(rgb(150, 150, 148), rgb(40, 40, 44), rgb(52, 52, 56), rgb(228, 226, 220), tex='knit', sleeve=1.0, sleeve_k=0.82, ease=0.85)),   # 灰針織衫＋黑長褲＋深色球鞋
    'nf1': dict(sex='f', base='Victoria_Rubin', head=0.92, height=1.62, iris='#4a3020',
                face=dict(EYE_SX=1.00, EYE_SZ=0.74, EYE_TILT=0.04, BROW_ARCH=0.70, BROW_K=1.2, MOUTH_K=1.30, FACE_NARROW=0.965, CHIN_WIDEN=0.58, CHEEK_TINT_K=1.1),
                hair=dict(seed=20261111, part=-10.0, col=(0.36, 0.24, 0.16), tip=(-0.100, -0.110, -0.060, 0.0, -0.040, -0.090, -0.120, -0.130, -0.140, -0.140), n_main=44, n_outer=28),
                clothes=style(rgb(170, 200, 170), rgb(232, 228, 220), rgb(196, 168, 132), rgb(120, 96, 76), shoe_style='loafer', pants_ell=(0.074, 0.084), drop=True)),   # 淺綠 T＋白寬褲＋淺棕樂福鞋
    'nf2': dict(sex='f', base='HairSample_Female', head=0.92, height=1.58, iris='#2c2018',
                face=dict(EYE_SX=1.08, EYE_SZ=0.62, EYE_TILT=-0.01, BROW_ARCH=0.35, BROW_K=1.3, FACE_NARROW=0.985, CHIN_WIDEN=0.66, MOUTH_K=1.25, CHEEK_TINT_K=0.8),
                hair=dict(seed=20261112, part=0.0, col=(0.11, 0.085, 0.075), tip=(0.0, -0.005, 0.010, 0.030, 0.020, 0.0, -0.020, -0.030, -0.035, -0.040), n_main=40, n_outer=24),
                clothes=style(rgb(240, 238, 232), rgb(70, 86, 120), rgb(30, 30, 34), rgb(234, 232, 226), tex='linen', neck='V', ptex='denim')),   # 白色 V 領上衣＋深藍牛仔褲＋黑球鞋
    'nm3': dict(sex='m', base='HairSample_Male', head=0.93, height=1.76, iris='#3a2818',
                face=dict(EYE_SX=1.10, EYE_SZ=0.70, EYE_TILT=-0.01, BROW_ARCH=0.40, BROW_K=1.50, FACE_NARROW=0.960, CHIN_WIDEN=0.62, JAW_OUT=0.0046, MOUTH_K=1.40),
                hair=dict(seed=20261213, part=20.0, col=(0.38, 0.27, 0.18), tip=(-0.006, 0.0, 0.0, 0.004, 0.0, -0.006, -0.012, -0.020, -0.016, -0.012), nape=0.022, vol=0.95, curl=(16, 30)),
                clothes=style(rgb(156, 123, 90), rgb(180, 180, 176), rgb(238, 238, 234), rgb(226, 224, 218), tex='knit', sleeve=1.0, sleeve_k=0.82, ease=0.85)),   # 淺棕側分＋駝色針織衫＋淺灰長褲＋白球鞋（第二版：磚紅在遊戲裡太紅，使用者 2026-10-17 不要鮮紅色上衣）
    'nm4': dict(sex='m', base='Sakurada_Fumiriya', head=0.97, height=1.73, iris='#241c18',
                face=dict(EYE_SX=1.04, EYE_SZ=0.72, EYE_TILT=0.02, BROW_ARCH=0.60, BROW_K=1.55, FACE_NARROW=0.985, CHIN_WIDEN=0.66, JAW_OUT=0.0044, MOUTH_K=1.50),
                hair=dict(seed=20261214, part=4.0, col=(0.10, 0.09, 0.09), tip=(0.020, 0.020, 0.014, 0.018, 0.016, 0.012, 0.006, 0.0, 0.004, 0.006), nape=0.006, vol=0.6, curl=(10, 24)),
                clothes=style(rgb(236, 236, 232), rgb(98, 104, 74), rgb(120, 120, 120), rgb(226, 224, 218), pants_ell=(0.068, 0.078))),   # 很短的黑髮＋白 T＋橄欖綠長褲＋灰球鞋
    'nf3': dict(sex='f', base='Victoria_Rubin', head=0.92, height=1.66, iris='#3a3028',
                face=dict(EYE_SX=1.08, EYE_SZ=0.66, EYE_TILT=0.02, BROW_ARCH=0.45, BROW_K=1.35, MOUTH_K=1.35, FACE_NARROW=0.955, CHIN_WIDEN=0.56),
                hair=dict(seed=20261113, part=-16.0, col=(0.42, 0.36, 0.30), tip=(-0.180, -0.190, -0.120, -0.020, -0.090, -0.170, -0.210, -0.230, -0.240, -0.240), n_main=44, n_outer=28),
                clothes=style(rgb(60, 64, 96), rgb(156, 176, 200), rgb(238, 238, 234), rgb(226, 224, 218), tex='knit', sleeve=1.0, sleeve_k=0.80, ptex='denim')),   # 灰棕長髮＋深藍針織衫＋淺色牛仔褲＋白球鞋
    'nf4': dict(sex='f', base='HairSample_Female', head=0.92, height=1.60, iris='#4a2a1c',
                face=dict(EYE_SX=1.02, EYE_SZ=0.78, EYE_TILT=0.02, BROW_ARCH=0.65, BROW_K=1.2, FACE_NARROW=0.990, CHIN_WIDEN=0.64, MOUTH_K=1.20, CHEEK_TINT_K=1.4),
                hair=dict(seed=20261114, part=12.0, col=(0.40, 0.20, 0.14), tip=(-0.080, -0.090, -0.050, 0.010, -0.030, -0.070, -0.100, -0.110, -0.115, -0.120), n_main=44, n_outer=28),
                clothes=style(rgb(92, 94, 98), rgb(210, 196, 170), rgb(238, 238, 234), rgb(226, 224, 218), pants_ell=(0.074, 0.084), drop=True)),   # 紅棕及肩髮＋炭灰 T＋米色寬褲＋白球鞋（第二版：珊瑚色在遊戲裡偏紅，使用者 2026-10-17 不要鮮紅色上衣）
    # ---- 第二批（2026-10-17 使用者：「長得很像的路人真的太多了，很誇張，你不能只有這幾種」）----
    # 每個人換樣本、臉型、髮長髮色分線、身高、穿搭的組合；避開主要角色的辨識組合；不用鮮紅色上衣（使用者同一天：「臺大不要再有這麼鮮艷紅色的衣服上衣的女生」）
    'nf5': dict(sex='f', base='Darkness_Shibu', head=0.92, height=1.63, iris='#2a1e18',
                face=dict(EYE_SX=1.00, EYE_SZ=0.60, EYE_TILT=0.05, BROW_ARCH=0.30, BROW_K=1.35, FACE_NARROW=0.950, CHIN_WIDEN=0.52, MOUTH_K=1.15, CHEEK_TINT_K=0.7),
                hair=dict(seed=20261115, part=0.0, col=(0.085, 0.07, 0.065), tip=(-0.200, -0.210, -0.200, -0.180, -0.200, -0.220, -0.240, -0.250, -0.260, -0.260), n_main=44, n_outer=28),
                clothes=style(rgb(44, 52, 78), rgb(214, 202, 182), rgb(40, 34, 30), rgb(40, 34, 30), tex='knit', neck='V', sleeve=1.0, sleeve_k=0.80, ease=0.85, shoe_style='loafer', pants_ell=(0.074, 0.084), drop=True)),   # 中分黑長直髮＋深藍 V 領針織衫＋米色寬褲＋黑樂福鞋
    'nf6': dict(sex='f', base='HairSample_Female', head=0.92, height=1.56, iris='#3a2618',
                face=dict(EYE_SX=1.10, EYE_SZ=0.80, EYE_TILT=-0.01, BROW_ARCH=0.60, BROW_K=1.15, FACE_NARROW=1.000, CHIN_WIDEN=0.70, MOUTH_K=1.30, CHEEK_TINT_K=1.3),
                hair=dict(seed=20261116, part=-24.0, col=(0.30, 0.20, 0.14), tip=(0.030, 0.026, 0.030, 0.040, 0.034, 0.024, 0.016, 0.010, 0.008, 0.008), n_main=38, n_outer=22),
                clothes=style(rgb(236, 230, 214), rgb(34, 34, 38), rgb(238, 238, 234), rgb(226, 224, 218), pants_ell=(0.074, 0.084), drop=True)),   # 側分棕色短鮑伯＋米白 T＋黑寬褲＋白球鞋（個子小）
    'nf7': dict(sex='f', base='Victoria_Rubin', head=0.92, height=1.68, iris='#4a3a2c',
                face=dict(EYE_SX=1.02, EYE_SZ=0.64, EYE_TILT=0.03, BROW_ARCH=0.50, BROW_K=1.25, FACE_NARROW=0.955, CHIN_WIDEN=0.54, MOUTH_K=1.40, CHEEK_TINT_K=0.9),
                hair=dict(seed=20261117, part=18.0, col=(0.30, 0.26, 0.22), tip=(-0.070, -0.080, -0.060, -0.030, -0.050, -0.080, -0.100, -0.110, -0.110, -0.110), n_main=42, n_outer=26),
                clothes=style(rgb(176, 198, 222), rgb(52, 62, 92), rgb(238, 238, 234), rgb(226, 224, 218), tex='linen', sleeve=1.0, sleeve_k=0.85, ease=0.9, ptex='denim')),   # 灰棕及肩側分＋淺藍長袖襯衫布＋深色牛仔褲＋白球鞋（高）
    'nf8': dict(sex='f', base='Darkness_Shibu', head=0.92, height=1.59, iris='#2c2018',
                face=dict(EYE_SX=1.06, EYE_SZ=0.72, EYE_TILT=0.00, BROW_ARCH=0.45, BROW_K=1.40, FACE_NARROW=0.985, CHIN_WIDEN=0.62, MOUTH_K=1.25, CHEEK_TINT_K=1.0),
                hair=dict(seed=20261118, part=-8.0, col=(0.13, 0.10, 0.085), tip=(-0.040, -0.050, -0.030, 0.000, -0.020, -0.050, -0.070, -0.080, -0.080, -0.080), n_main=40, n_outer=24),
                clothes=style(rgb(150, 146, 108), rgb(170, 172, 174), rgb(130, 130, 128), rgb(226, 224, 218), sleeve=0.46, pants_ell=(0.066, 0.076))),   # 黑色過肩短髮＋橄欖色 T＋淺灰長褲＋灰球鞋
    'nm5': dict(sex='m', base='HairSample_Male', head=0.93, height=1.68, iris='#2a2018',
                face=dict(EYE_SX=1.08, EYE_SZ=0.62, EYE_TILT=0.03, BROW_ARCH=0.30, BROW_K=1.60, FACE_NARROW=0.990, CHIN_WIDEN=0.68, JAW_OUT=0.0050, MOUTH_K=1.35),
                hair=dict(seed=20261215, part=-6.0, col=(0.09, 0.085, 0.085), tip=(-0.016, -0.014, -0.010, 0.000, -0.006, -0.012, -0.018, -0.024, -0.022, -0.020), nape=0.030, vol=1.05, curl=(4, 12)),
                clothes=style(rgb(58, 58, 62), rgb(56, 70, 100), rgb(30, 30, 34), rgb(228, 226, 220), ptex='denim')),   # 黑髮蓋眉＋炭灰 T＋深藍牛仔褲＋黑球鞋（矮、臉圓一點）
    'nm6': dict(sex='m', base='Sakurada_Fumiriya', head=0.97, height=1.82, iris='#3a2a1e',
                face=dict(EYE_SX=1.00, EYE_SZ=0.70, EYE_TILT=0.00, BROW_ARCH=0.45, BROW_K=1.45, FACE_NARROW=0.945, CHIN_WIDEN=0.48, JAW_OUT=0.0056, MOUTH_K=1.30),
                hair=dict(seed=20261216, part=22.0, col=(0.30, 0.22, 0.16), tip=(-0.004, 0.0, 0.004, 0.010, 0.006, 0.000, -0.008, -0.016, -0.014, -0.012), nape=0.020, vol=0.85, curl=(12, 26)),
                clothes=style(rgb(214, 204, 182), rgb(40, 46, 66), rgb(110, 78, 52), rgb(60, 44, 32), tex='linen', sleeve=1.0, sleeve_k=0.85, ease=0.92, shoe_style='loafer')),   # 棕色側分＋米色長袖襯衫布＋深藍長褲＋棕色皮鞋（高瘦）
    'nm7': dict(sex='m', base='HairSample_Male', head=0.93, height=1.75, iris='#241c16', skin=(0.92, 0.82, 0.72),
                face=dict(EYE_SX=1.04, EYE_SZ=0.66, EYE_TILT=-0.02, BROW_ARCH=0.20, BROW_K=1.75, FACE_NARROW=0.975, CHIN_WIDEN=0.66, JAW_OUT=0.0058, MOUTH_K=1.45),
                hair=dict(seed=20261217, part=0.0, col=(0.07, 0.065, 0.065), tip=(0.034, 0.034, 0.030, 0.030, 0.028, 0.024, 0.018, 0.014, 0.016, 0.018), nape=0.004, vol=0.45, curl=(6, 14)),
                clothes=style(rgb(30, 30, 32), rgb(104, 110, 84), rgb(236, 236, 232), rgb(226, 224, 218), pants_ell=(0.068, 0.078))),   # 曬黑、很短的平頭＋黑 T＋橄欖色長褲＋白球鞋（運動型）
    'nm8': dict(sex='m', base='Sakurada_Fumiriya', head=0.97, height=1.71, iris='#3a2c20',
                face=dict(EYE_SX=1.08, EYE_SZ=0.74, EYE_TILT=0.04, BROW_ARCH=0.65, BROW_K=1.35, FACE_NARROW=0.980, CHIN_WIDEN=0.60, JAW_OUT=0.0042, MOUTH_K=1.40),
                hair=dict(seed=20261218, part=-14.0, col=(0.22, 0.16, 0.12), tip=(-0.020, -0.018, -0.012, -0.004, -0.010, -0.018, -0.028, -0.036, -0.032, -0.028), nape=0.040, vol=1.1, curl=(20, 34)),
                clothes=style(rgb(150, 176, 196), rgb(176, 160, 128), rgb(238, 238, 234), rgb(226, 224, 218))),   # 深棕微捲側分＋淺藍 T＋卡其褲＋白球鞋
    # ---- 第三、四批：日劇穿搭（2026-10-17 使用者：「路人數量要再加倍喔 而且請參考日劇穿搭」）----
    # 低彩度：大地色、深藍、灰、白、橄欖綠、駝色；疊穿（敞開的開襟衫、當外套穿的襯衫＋T 恤）、A 字長裙／中長裙、寬褲、樂福鞋或白球鞋
    'nf9': dict(sex='f', base='HairSample_Female', head=0.92, height=1.61, iris='#3a2a1e',
                face=dict(EYE_SX=1.04, EYE_SZ=0.70, EYE_TILT=0.03, BROW_ARCH=0.55, BROW_K=1.2, FACE_NARROW=0.970, CHIN_WIDEN=0.58, MOUTH_K=1.30, CHEEK_TINT_K=1.0),
                hair=dict(seed=20261119, part=-14.0, col=(0.24, 0.17, 0.12), tip=(-0.180, -0.190, -0.150, -0.060, -0.130, -0.190, -0.220, -0.240, -0.250, -0.250), n_main=44, n_outer=28),
                layered=dict(style=outer_style(rgb(206, 190, 162), rgb(46, 52, 74), rgb(110, 76, 50), rgb(60, 42, 30), tex='knit', shoe_style='loafer'),
                             outer=dict(open=31, buttons=6), inner=dict(rgb=rgb(242, 240, 234)), skirt=dict(len='long'))),   # 米色開襟衫＋白 T＋深藍長裙＋棕樂福鞋
    'nf10': dict(sex='f', base='Victoria_Rubin', head=0.92, height=1.65, iris='#2e2420',
                 face=dict(EYE_SX=1.06, EYE_SZ=0.62, EYE_TILT=0.04, BROW_ARCH=0.40, BROW_K=1.3, FACE_NARROW=0.950, CHIN_WIDEN=0.52, MOUTH_K=1.20, CHEEK_TINT_K=0.8),
                 hair=dict(seed=20261120, part=0.0, col=(0.10, 0.08, 0.07), tip=(-0.090, -0.100, -0.080, -0.040, -0.070, -0.100, -0.120, -0.130, -0.130, -0.130), n_main=42, n_outer=26),
                 layered=dict(style=outer_style(rgb(186, 186, 184), rgb(34, 34, 38), rgb(238, 238, 234), rgb(226, 224, 218), tex='knit', sleeve_k=0.80, ease=0.85),
                              skirt=dict(len='long'))),   # 中分黑髮及肩＋淺灰針織衫＋黑長裙＋白球鞋
    'nf11': dict(sex='f', base='Darkness_Shibu', head=0.92, height=1.57, iris='#2c2018',
                 face=dict(EYE_SX=1.10, EYE_SZ=0.76, EYE_TILT=0.00, BROW_ARCH=0.60, BROW_K=1.2, FACE_NARROW=0.995, CHIN_WIDEN=0.66, MOUTH_K=1.25, CHEEK_TINT_K=1.2),
                 hair=dict(seed=20261121, part=-20.0, col=(0.11, 0.09, 0.08), tip=(0.020, 0.016, 0.020, 0.030, 0.024, 0.016, 0.008, 0.004, 0.004, 0.004), n_main=38, n_outer=22),
                 layered=dict(style=outer_style(rgb(42, 50, 76), rgb(218, 208, 188), rgb(238, 238, 234), rgb(226, 224, 218), tex='knit', pants_ell=(0.074, 0.084), drop=True),
                              outer=dict(open=31, buttons=6), inner=dict(rgb=rgb(196, 214, 230)))),   # 黑色短鮑伯＋深藍開襟衫＋淺藍 T＋米色寬褲＋白球鞋
    'nf12': dict(sex='f', base='HairSample_Female', head=0.92, height=1.63, iris='#2a2018',
                 face=dict(EYE_SX=1.00, EYE_SZ=0.64, EYE_TILT=0.05, BROW_ARCH=0.35, BROW_K=1.35, FACE_NARROW=0.960, CHIN_WIDEN=0.56, MOUTH_K=1.25, CHEEK_TINT_K=0.9),
                 hair=dict(seed=20261122, part=0.0, col=(0.085, 0.07, 0.065), tip=(-0.230, -0.240, -0.200, -0.120, -0.180, -0.240, -0.270, -0.290, -0.300, -0.300), n_main=46, n_outer=30),
                 layered=dict(style=outer_style(rgb(240, 238, 230), rgb(120, 118, 86), rgb(238, 238, 234), rgb(226, 224, 218), tex='linen', sleeve_k=0.80, ease=0.80),
                              skirt=dict(len='midi'))),   # 中分黑長直髮＋白色長袖襯衫布＋橄欖色中長裙＋白球鞋
    'nf13': dict(sex='f', base='Victoria_Rubin', head=0.92, height=1.60, iris='#4a3424',
                 face=dict(EYE_SX=1.08, EYE_SZ=0.72, EYE_TILT=0.01, BROW_ARCH=0.65, BROW_K=1.15, FACE_NARROW=0.980, CHIN_WIDEN=0.62, MOUTH_K=1.35, CHEEK_TINT_K=1.2),
                 hair=dict(seed=20261123, part=14.0, col=(0.34, 0.24, 0.16), tip=(-0.050, -0.060, -0.040, -0.010, -0.030, -0.060, -0.080, -0.090, -0.090, -0.090), n_main=42, n_outer=26),
                 layered=dict(style=outer_style(rgb(176, 138, 98), rgb(150, 172, 198), rgb(238, 238, 234), rgb(226, 224, 218), tex='knit', ptex='denim', pants_ell=(0.074, 0.084), drop=True),
                              outer=dict(open=31, buttons=5), inner=dict(rgb=rgb(242, 240, 234)))),   # 棕色及肩＋駝色開襟衫＋白 T＋淺色寬牛仔褲＋白球鞋
    'nf14': dict(sex='f', base='Darkness_Shibu', head=0.92, height=1.62, iris='#3a2a20',
                 face=dict(EYE_SX=1.02, EYE_SZ=0.66, EYE_TILT=0.03, BROW_ARCH=0.50, BROW_K=1.3, FACE_NARROW=0.965, CHIN_WIDEN=0.58, MOUTH_K=1.30, CHEEK_TINT_K=1.0),
                 hair=dict(seed=20261124, part=-6.0, col=(0.20, 0.14, 0.10), tip=(0.010, 0.006, 0.012, 0.024, 0.016, 0.006, -0.004, -0.010, -0.010, -0.010), n_main=38, n_outer=22),
                 layered=dict(style=outer_style(rgb(150, 164, 140), rgb(232, 226, 210), rgb(110, 76, 50), rgb(60, 42, 30), tex='knit', sleeve_k=0.80, ease=0.85, shoe_style='loafer'),
                              skirt=dict(len='long'))),   # 深棕短鮑伯＋鼠尾草綠針織衫＋米白長裙＋棕樂福鞋
    'nf15': dict(sex='f', base='HairSample_Female', head=0.92, height=1.66, iris='#30241c',
                 face=dict(EYE_SX=1.02, EYE_SZ=0.66, EYE_TILT=0.02, BROW_ARCH=0.45, BROW_K=1.3, FACE_NARROW=0.955, CHIN_WIDEN=0.55, MOUTH_K=1.35, CHEEK_TINT_K=0.9),
                 hair=dict(seed=20261125, part=10.0, col=(0.16, 0.12, 0.10), tip=(-0.110, -0.120, -0.090, -0.040, -0.080, -0.120, -0.150, -0.160, -0.160, -0.160), n_main=42, n_outer=26),
                 layered=dict(style=outer_style(rgb(150, 170, 196), rgb(36, 36, 40), rgb(238, 238, 234), rgb(226, 224, 218), tex='linen', ease=0.80, pants_ell=(0.074, 0.084), drop=True),
                              outer=dict(open=26, buttons=6), inner=dict(rgb=rgb(242, 240, 234)))),   # 過肩深棕髮＋淺藍襯衫敞開當外套＋白 T＋黑寬褲＋白球鞋
    'nf16': dict(sex='f', base='Victoria_Rubin', head=0.92, height=1.63, iris='#2a2018',
                 face=dict(EYE_SX=1.00, EYE_SZ=0.62, EYE_TILT=0.04, BROW_ARCH=0.35, BROW_K=1.35, FACE_NARROW=0.950, CHIN_WIDEN=0.54, MOUTH_K=1.20, CHEEK_TINT_K=0.8),
                 hair=dict(seed=20261126, part=-4.0, col=(0.09, 0.075, 0.07), tip=(-0.200, -0.210, -0.170, -0.080, -0.150, -0.210, -0.240, -0.260, -0.270, -0.270), n_main=44, n_outer=28),
                 layered=dict(style=outer_style(rgb(40, 46, 70), rgb(150, 150, 152), rgb(36, 32, 30), rgb(36, 32, 30), tex='knit', sleeve_k=0.80, ease=0.85, shoe_style='loafer'),
                              skirt=dict(len='midi'))),   # 黑長髮＋深藍針織衫＋灰色中長裙＋黑樂福鞋
    'nm9': dict(sex='m', base='HairSample_Male', head=0.93, height=1.72, iris='#2e2218',
                face=dict(EYE_SX=1.04, EYE_SZ=0.70, EYE_TILT=0.02, BROW_ARCH=0.50, BROW_K=1.50, FACE_NARROW=0.970, CHIN_WIDEN=0.60, JAW_OUT=0.0046, MOUTH_K=1.40),
                hair=dict(seed=20261219, part=-16.0, col=(0.16, 0.12, 0.10), tip=(-0.010, -0.008, -0.004, 0.004, 0.000, -0.008, -0.014, -0.020, -0.018, -0.016), nape=0.024, vol=0.9, curl=(10, 22)),
                layered=dict(style=outer_style(rgb(170, 192, 214), rgb(196, 180, 148), rgb(238, 238, 234), rgb(226, 224, 218), tex='linen', ease=0.80),
                             outer=dict(open=24, buttons=6), inner=dict(rgb=rgb(242, 240, 234)))),   # 淺藍襯衫敞開＋白 T＋卡其褲＋白球鞋
    'nm10': dict(sex='m', base='Sakurada_Fumiriya', head=0.97, height=1.78, iris='#2a2018',
                 face=dict(EYE_SX=1.02, EYE_SZ=0.64, EYE_TILT=0.03, BROW_ARCH=0.30, BROW_K=1.60, FACE_NARROW=0.955, CHIN_WIDEN=0.52, JAW_OUT=0.0054, MOUTH_K=1.35),
                 hair=dict(seed=20261320, part=0.0, col=(0.10, 0.09, 0.09), tip=(-0.022, -0.020, -0.016, -0.006, -0.012, -0.020, -0.026, -0.026, -0.026, -0.026), nape=0.032, vol=0.95, curl=(4, 12)),   # 頭髮第二版：髮尾不超過 −0.026、後頸 ≤0.032（第一版耳後、後腦岔出一撮長髮，遊戲裡變成黑色翅膀）
                 layered=dict(style=outer_style(rgb(42, 50, 76), rgb(176, 176, 174), rgb(36, 32, 30), rgb(36, 32, 30), tex='knit', shoe_style='loafer'),
                              outer=dict(open=28, buttons=5), inner=dict(rgb=rgb(242, 240, 234)))),   # 中分黑髮＋深藍開襟衫＋白 T＋淺灰長褲＋黑樂福鞋
    'nm11': dict(sex='m', base='HairSample_Male', head=0.93, height=1.74, iris='#3a2a1e',
                 face=dict(EYE_SX=1.06, EYE_SZ=0.68, EYE_TILT=0.00, BROW_ARCH=0.40, BROW_K=1.55, FACE_NARROW=0.980, CHIN_WIDEN=0.64, JAW_OUT=0.0050, MOUTH_K=1.40),
                 hair=dict(seed=20261221, part=10.0, col=(0.26, 0.19, 0.14), tip=(0.006, 0.008, 0.008, 0.012, 0.010, 0.004, -0.002, -0.008, -0.006, -0.004), nape=0.018, vol=0.8, curl=(8, 18)),
                 layered=dict(style=outer_style(rgb(214, 204, 186), rgb(44, 50, 70), rgb(110, 76, 50), rgb(60, 42, 30), tex='knit', sleeve_k=0.82, ease=0.88, pants_ell=(0.070, 0.080), drop=True, shoe_style='loafer'))),   # 棕色短髮＋燕麥色針織衫＋深藍寬西裝褲＋棕樂福鞋
    'nm12': dict(sex='m', base='Sakurada_Fumiriya', head=0.97, height=1.75, iris='#2e2420',
                 face=dict(EYE_SX=1.06, EYE_SZ=0.72, EYE_TILT=0.03, BROW_ARCH=0.55, BROW_K=1.45, FACE_NARROW=0.970, CHIN_WIDEN=0.58, JAW_OUT=0.0046, MOUTH_K=1.40),
                 hair=dict(seed=20261322, part=-20.0, col=(0.13, 0.11, 0.10), tip=(-0.014, -0.012, -0.008, 0.000, -0.004, -0.012, -0.020, -0.026, -0.026, -0.022), nape=0.030, vol=1.0, curl=(14, 28)),   # 頭髮第二版：髮尾不超過 −0.026、後頸 ≤0.032（第一版耳後、後腦岔出一撮長髮，遊戲裡變成黑色翅膀）
                 layered=dict(style=outer_style(rgb(112, 116, 86), rgb(34, 34, 38), rgb(238, 238, 234), rgb(226, 224, 218), tex='linen', ease=0.82),
                              outer=dict(open=24, buttons=6), inner=dict(rgb=rgb(150, 150, 152)))),   # 橄欖色襯衫敞開＋灰 T＋黑長褲＋白球鞋
    'nm13': dict(sex='m', base='HairSample_Male', head=0.93, height=1.70, iris='#2a2018',
                 face=dict(EYE_SX=1.08, EYE_SZ=0.66, EYE_TILT=0.01, BROW_ARCH=0.35, BROW_K=1.60, FACE_NARROW=0.985, CHIN_WIDEN=0.66, JAW_OUT=0.0052, MOUTH_K=1.45),
                 hair=dict(seed=20261223, part=6.0, col=(0.08, 0.075, 0.075), tip=(0.016, 0.016, 0.014, 0.016, 0.014, 0.010, 0.004, 0.000, 0.002, 0.004), nape=0.010, vol=0.7, curl=(6, 14)),
                 layered=dict(style=outer_style(rgb(240, 240, 236), rgb(46, 54, 78), rgb(238, 238, 234), rgb(226, 224, 218), tex='linen', sleeve_k=0.78, ease=0.80))),   # 黑色短髮＋白色長袖襯衫布＋深藍卡其褲＋白球鞋
    'nm14': dict(sex='m', base='Sakurada_Fumiriya', head=0.97, height=1.80, iris='#3a2c22',
                 face=dict(EYE_SX=1.00, EYE_SZ=0.70, EYE_TILT=-0.01, BROW_ARCH=0.45, BROW_K=1.50, FACE_NARROW=0.950, CHIN_WIDEN=0.50, JAW_OUT=0.0056, MOUTH_K=1.30),
                 hair=dict(seed=20261324, part=16.0, col=(0.20, 0.15, 0.11), tip=(-0.026, -0.026, -0.020, -0.008, -0.016, -0.026, -0.026, -0.026, -0.026, -0.026), nape=0.032, vol=1.0, curl=(16, 30)),   # 頭髮第二版：髮尾不超過 −0.026、後頸 ≤0.032（第一版耳後、後腦岔出一撮長髮，遊戲裡變成黑色翅膀）
                 layered=dict(style=outer_style(rgb(130, 130, 130), rgb(206, 192, 164), rgb(30, 30, 34), rgb(228, 226, 220), tex='knit', pants_ell=(0.070, 0.080), drop=True),
                              outer=dict(open=28, buttons=5), inner=dict(rgb=rgb(32, 32, 34)))),   # 深棕微捲＋灰色開襟衫＋黑 T＋米色寬褲＋黑球鞋
    'nm15': dict(sex='m', base='HairSample_Male', head=0.93, height=1.77, iris='#30241a',
                 face=dict(EYE_SX=1.02, EYE_SZ=0.72, EYE_TILT=0.04, BROW_ARCH=0.60, BROW_K=1.45, FACE_NARROW=0.965, CHIN_WIDEN=0.58, JAW_OUT=0.0044, MOUTH_K=1.35),
                 hair=dict(seed=20261325, part=-8.0, col=(0.30, 0.22, 0.16), tip=(-0.018, -0.016, -0.010, -0.002, -0.008, -0.016, -0.024, -0.026, -0.026, -0.026), nape=0.032, vol=0.95, curl=(10, 24)),   # 頭髮第二版：髮尾不超過 −0.026、後頸 ≤0.032（第一版耳後、後腦岔出一撮長髮，遊戲裡變成黑色翅膀）
                 layered=dict(style=outer_style(rgb(92, 70, 54), rgb(150, 172, 198), rgb(238, 238, 234), rgb(226, 224, 218), tex='knit', sleeve_k=0.82, ease=0.88, ptex='denim'))),   # 淺棕髮＋深咖啡針織衫＋淺色牛仔褲＋白球鞋
    'nm16': dict(sex='m', base='Sakurada_Fumiriya', head=0.97, height=1.73, iris='#2a2220',
                 face=dict(EYE_SX=1.08, EYE_SZ=0.70, EYE_TILT=0.02, BROW_ARCH=0.50, BROW_K=1.50, FACE_NARROW=0.980, CHIN_WIDEN=0.62, JAW_OUT=0.0046, MOUTH_K=1.45),   # 第三版：臉的參數和 nm20 相同（前兩版 h01_face.slit_fit 嘴縫分類失敗）；髮型、穿搭、身高不同
                 hair=dict(seed=20261226, part=4.0, col=(0.09, 0.085, 0.085), tip=(0.026, 0.026, 0.022, 0.024, 0.022, 0.018, 0.012, 0.008, 0.010, 0.012), nape=0.006, vol=0.55, curl=(8, 18)),
                 layered=dict(style=outer_style(rgb(96, 118, 150), rgb(190, 174, 140), rgb(110, 76, 50), rgb(60, 42, 30), tex='linen', ease=0.82, shoe_style='loafer'),
                              outer=dict(open=24, buttons=6), inner=dict(rgb=rgb(242, 240, 234)))),   # 很短的黑髮＋丹寧藍襯衫敞開＋白 T＋卡其褲＋棕樂福鞋
    # ---- 第五批（2026-10-17 使用者：「男生女生各20種」）：一樣照日劇穿搭 ----
    'nf17': dict(sex='f', base='Darkness_Shibu', head=0.92, height=1.64, iris='#3a2c22',
                 face=dict(EYE_SX=1.04, EYE_SZ=0.64, EYE_TILT=0.04, BROW_ARCH=0.40, BROW_K=1.3, FACE_NARROW=0.955, CHIN_WIDEN=0.54, MOUTH_K=1.25, CHEEK_TINT_K=0.9),
                 hair=dict(seed=20261127, part=-12.0, col=(0.22, 0.16, 0.12), tip=(-0.140, -0.150, -0.120, -0.050, -0.100, -0.150, -0.180, -0.190, -0.200, -0.200), n_main=44, n_outer=28),
                 layered=dict(style=outer_style(rgb(236, 232, 222), rgb(70, 60, 50), rgb(110, 76, 50), rgb(60, 42, 30), tex='knit', shoe_style='loafer'),
                              outer=dict(open=31, buttons=6), inner=dict(rgb=rgb(56, 58, 66)), skirt=dict(len='midi'))),   # 深棕長髮＋米白開襟衫＋深灰 T＋深咖啡中長裙＋棕樂福鞋
    'nf18': dict(sex='f', base='HairSample_Female', head=0.92, height=1.58, iris='#2e2218',
                 face=dict(EYE_SX=1.08, EYE_SZ=0.74, EYE_TILT=0.02, BROW_ARCH=0.60, BROW_K=1.2, FACE_NARROW=0.990, CHIN_WIDEN=0.64, MOUTH_K=1.30, CHEEK_TINT_K=1.2),
                 hair=dict(seed=20261128, part=20.0, col=(0.12, 0.095, 0.08), tip=(-0.020, -0.030, -0.010, 0.016, -0.004, -0.030, -0.050, -0.060, -0.060, -0.060), n_main=40, n_outer=24),
                 layered=dict(style=outer_style(rgb(232, 224, 204), rgb(86, 92, 110), rgb(238, 238, 234), rgb(226, 224, 218), tex='jersey', sleeve_k=0.80, ease=0.85, ptex='denim', pants_ell=(0.074, 0.084), drop=True))),   # 黑色過肩側分＋奶油色長袖 T＋深色寬牛仔褲＋白球鞋
    'nf19': dict(sex='f', base='Victoria_Rubin', head=0.92, height=1.67, iris='#3a3028',
                 face=dict(EYE_SX=1.02, EYE_SZ=0.68, EYE_TILT=0.03, BROW_ARCH=0.50, BROW_K=1.25, FACE_NARROW=0.960, CHIN_WIDEN=0.56, MOUTH_K=1.35, CHEEK_TINT_K=1.0),
                 hair=dict(seed=20261129, part=0.0, col=(0.38, 0.32, 0.26), tip=(-0.160, -0.170, -0.140, -0.060, -0.120, -0.170, -0.200, -0.210, -0.220, -0.220), n_main=44, n_outer=28),
                 layered=dict(style=outer_style(rgb(118, 120, 92), rgb(236, 232, 222), rgb(238, 238, 234), rgb(226, 224, 218), tex='knit'),
                              outer=dict(open=31, buttons=6), inner=dict(rgb=rgb(242, 240, 234)), skirt=dict(len='long'))),   # 灰棕長髮＋橄欖色開襟衫＋白 T＋米白長裙＋白球鞋
    'nf20': dict(sex='f', base='Darkness_Shibu', head=0.92, height=1.60, iris='#2a2018',
                 face=dict(EYE_SX=1.06, EYE_SZ=0.70, EYE_TILT=0.01, BROW_ARCH=0.55, BROW_K=1.25, FACE_NARROW=0.975, CHIN_WIDEN=0.60, MOUTH_K=1.25, CHEEK_TINT_K=1.1),
                 hair=dict(seed=20261130, part=8.0, col=(0.09, 0.075, 0.07), tip=(-0.060, -0.070, -0.050, -0.010, -0.040, -0.070, -0.090, -0.100, -0.100, -0.100), n_main=42, n_outer=26),
                 layered=dict(style=outer_style(rgb(216, 204, 180), rgb(52, 58, 80), rgb(36, 32, 30), rgb(36, 32, 30), tex='linen', sleeve_k=0.80, ease=0.80, shoe_style='loafer'),
                              skirt=dict(len='knee'))),   # 黑色及肩＋燕麥色襯衫布上衣＋深藍及膝裙＋黑樂福鞋（灰藍讓給沛珊）
    'nm17': dict(sex='m', base='HairSample_Male', head=0.93, height=1.69, iris='#2c2018',
                 face=dict(EYE_SX=1.06, EYE_SZ=0.74, EYE_TILT=0.03, BROW_ARCH=0.55, BROW_K=1.45, FACE_NARROW=0.990, CHIN_WIDEN=0.66, JAW_OUT=0.0044, MOUTH_K=1.40),
                 hair=dict(seed=20261227, part=-10.0, col=(0.11, 0.10, 0.10), tip=(-0.026, -0.022, -0.016, -0.006, -0.012, -0.022, -0.030, -0.036, -0.034, -0.030), nape=0.036, vol=1.1, curl=(6, 16)),
                 layered=dict(style=outer_style(rgb(96, 100, 108), rgb(40, 40, 44), rgb(238, 238, 234), rgb(226, 224, 218), tex='jersey', sleeve_k=0.82, ease=0.90))),   # 黑髮蓋耳＋灰色長袖 T＋黑長褲＋白球鞋
    'nm18': dict(sex='m', base='Sakurada_Fumiriya', head=0.97, height=1.76, iris='#3a2a20',
                 face=dict(EYE_SX=1.04, EYE_SZ=0.68, EYE_TILT=0.01, BROW_ARCH=0.40, BROW_K=1.55, FACE_NARROW=0.960, CHIN_WIDEN=0.56, JAW_OUT=0.0050, MOUTH_K=1.35),
                 hair=dict(seed=20261228, part=18.0, col=(0.24, 0.18, 0.13), tip=(-0.006, -0.004, 0.000, 0.008, 0.004, -0.002, -0.010, -0.018, -0.016, -0.012), nape=0.020, vol=0.85, curl=(12, 26)),
                 layered=dict(style=outer_style(rgb(176, 150, 112), rgb(242, 240, 234), rgb(110, 76, 50), rgb(60, 42, 30), tex='knit', shoe_style='loafer'),
                              outer=dict(open=28, buttons=5), inner=dict(rgb=rgb(44, 50, 74)))),   # 棕色側分＋駝色開襟衫＋深藍 T＋白長褲＋棕樂福鞋
    'nm19': dict(sex='m', base='HairSample_Male', head=0.93, height=1.80, iris='#2a2018', skin=(0.94, 0.86, 0.78),
                 face=dict(EYE_SX=1.02, EYE_SZ=0.64, EYE_TILT=-0.01, BROW_ARCH=0.30, BROW_K=1.65, FACE_NARROW=0.965, CHIN_WIDEN=0.60, JAW_OUT=0.0056, MOUTH_K=1.40),
                 hair=dict(seed=20261229, part=0.0, col=(0.09, 0.085, 0.085), tip=(0.010, 0.010, 0.008, 0.012, 0.010, 0.006, 0.000, -0.006, -0.004, -0.002), nape=0.012, vol=0.7, curl=(6, 14)),
                 layered=dict(style=outer_style(rgb(60, 72, 60), rgb(170, 170, 168), rgb(30, 30, 34), rgb(228, 226, 220), tex='linen', ease=0.82),
                              outer=dict(open=24, buttons=6), inner=dict(rgb=rgb(242, 240, 234)))),   # 高、膚色深一點＋深綠襯衫敞開＋白 T＋淺灰長褲＋黑球鞋
    'nm20': dict(sex='m', base='Sakurada_Fumiriya', head=0.97, height=1.72, iris='#30241c',
                 face=dict(EYE_SX=1.08, EYE_SZ=0.70, EYE_TILT=0.02, BROW_ARCH=0.50, BROW_K=1.50, FACE_NARROW=0.980, CHIN_WIDEN=0.62, JAW_OUT=0.0046, MOUTH_K=1.45),
                 hair=dict(seed=20261330, part=-4.0, col=(0.18, 0.14, 0.11), tip=(-0.026, -0.026, -0.026, -0.016, -0.026, -0.026, -0.026, -0.026, -0.026, -0.026), nape=0.032, vol=1.05, curl=(18, 32)),   # 頭髮第二版：髮尾不超過 −0.026、後頸 ≤0.032（第一版耳後、後腦岔出一撮長髮，遊戲裡變成黑色翅膀）
                 layered=dict(style=outer_style(rgb(232, 228, 216), rgb(64, 66, 54), rgb(238, 238, 234), rgb(226, 224, 218), tex='knit', sleeve_k=0.82, ease=0.90, pants_ell=(0.070, 0.080), drop=True))),   # 深棕微捲中長髮＋米白針織衫＋深橄欖寬褲＋白球鞋
    # 魏教授（prof_wei；AA_159 的 look：五十多歲、灰黑短髮、白襯衫＋深藍毛衣背心、袖子捲到手肘、不戴眼鏡；只在講台上遠景，AA-C：用現有教授底模改裝、不必精做）
    # 臉：眼睛小一點、上眼皮重（年紀）、眉毛平、下顎寬一點；皮膚暗一點點；頭髮灰黑、短、整齊側分；衣服 wei_clothes（背心＋白袖子＋白色內層）
    # 第三版（BB-C BB_201 第 4 節：「看起來像國中生」）：頭小一點（0.95 → 0.91）、上身寬厚（torso 1.08）、稍微駝（stoop 1.8 cm）、
    # 頭髮灰白多一點（0.33 → 0.50）、前額髮際線往後（recede 9°）、眉毛灰、臉寬、嘴角低一點；遠景看得出年紀，臉不精修
    # 第五版（BB-C BB_201 第 8 節：「頭髮全白的年輕人／燙過的短髮」）：男性短髮——兩側、後腦剪短，露耳朵、後頸；頭頂短、側分；灰黑夾雜（頭頂深灰黑、兩鬢灰白）；肩膀再寬、脖子粗、一點肚子
    'pwei': dict(sex='m', base='HairSample_Male', head=0.91, height=1.72, iris='#2a221c', skin=(0.93, 0.86, 0.80), eye_close=0.22, torso=1.12, stoop=0.018, neck=1.10, belly=0.016,
                 face=dict(EYE_SX=1.06, EYE_SZ=0.60, EYE_TILT=-0.010, BROW_ARCH=0.25, BROW_K=1.55, BROW_COL=(0.34, 0.32, 0.30), FACE_NARROW=1.01, CHIN_WIDEN=0.72, JAW_OUT=0.0070, D_CHIN=0.004, MOUTH_K=1.40, MOUTH_DOWN=0.0012),
                 hair=dict(seed=20261231, part=-22.0, col=(0.20, 0.19, 0.19), temple_col=(0.62, 0.61, 0.60), recede=9.0, tip=(0.078, 0.070, 0.050, 0.044, 0.042, 0.040, 0.040, 0.026, 0.024, 0.022), side_taper=0.65, nape=0.003, vol=0.42, curl=(24, 38)),   # 第四版：前面的髮尾停在髮際線上、往旁邊梳（第三版瀏海還垂在額頭上，看起來年輕）   # 第二版：短、整齊、側分往兩邊梳開、露出額頭和耳朵（第一版瀏海蓋到眉毛、蓬：像年輕人）；灰一點
                 clothes=None, clothes_mod='wei_clothes'),
}
FEMALE_FACE = dict(D_CHIN=0.006, BROW_DROP=0.0042, EYE_SX=1.05, EYE_SZ=0.68, EYE_TILT=0.0, EYE_IN=0.0027, EYE_LIFT=0.0004, CHEEK_TINT_K=1.0,
                   CHIN_WIDEN=0.60, JAW_OUT=0.0036, MOUTH_K=1.40, FACE_NARROW=0.975, IRIS_FRAC=0.52,
                   EYELINE_K=1.0, WING=0.0018, LASH_N=26, LASH_L=0.88, BROW_K=1.30, BROW_ARCH=0.55, BROW_SCALE_Z=1.25, BROW_COL=(0.17, 0.12, 0.10), BROW_A=0.9,
                   LIP_OUT=(0.84, 0.54, 0.54), LIP_IN=(0.72, 0.39, 0.42), LIP_HI=(0.93, 0.70, 0.68), LIP_A=0.85)   # 杜可昕的參數當底，各路人再改

NAME = os.environ.get('NPC', 'nm1'); VAR = VARIANTS[NAME]; TAG = NAME.upper()


def stage0(m):
    arm = m['arm']; male = VAR['sex'] == 'm'
    hair_bones = [b.name for b in arm.data.bones if 'HairJoint' in b.name or b.name.startswith('J_Sec_Hair')]
    if m['hair']: bpy.data.objects.remove(m['hair'], do_unlink=True); m['hair'] = None
    print('  removed hair bones', C.remove_bones(arm, hair_bones))
    m['wsrc_top'] = C.extract_by_material(m['body'], ['Tops'], 'WSRC_Tops', 'J_Sec_')
    print('  removed clothes/shoes/back-hair faces', C.delete_by_material(m['body'], ['Tops', 'AccessoryNeck', 'Bottoms', 'Shoes', 'HairBack']))
    keep = () if male else ('Bust',)
    sec = [b.name for b in arm.data.bones if b.name.startswith('J_Sec_') and not any(k in b.name for k in keep)]
    for o in (m['body'], m['face']):
        for n in sec:
            if n in o.vertex_groups: o.vertex_groups.remove(o.vertex_groups[n])
    print('  removed secondary bones', C.remove_bones(arm, sec))
    C.prune_springs(arm)
    import heroine_05 as H05
    H05.fill_hidden_skin(m['body'], 'Body_00_SKIN', TAG + '_Body_filled')
    if VAR['head'] != 1.0: C.scale_head(arm, [m['face'], m['body']], VAR['head'])
    if VAR.get('torso') or VAR.get('stoop'):     # 魏教授：上身寬厚、稍微駝（身體和臉一起動，之後的衣服、頭髮照新的身體做）
        ch, nk = C.bone_head(arm, 'J_Bip_C_Chest'), C.bone_head(arm, 'J_Bip_C_Neck'); sp = C.bone_head(arm, 'J_Bip_C_Spine')
        tw, st = float(VAR.get('torso', 1.0)), float(VAR.get('stoop', 0.0)); nkk, bl = float(VAR.get('neck', 1.0)), float(VAR.get('belly', 0.0)); hd = C.bone_head(arm, 'J_Bip_C_Head')
        def sst(a, b, x): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
        def bulk(P, B=None):
            z = P[:, 2]; band = sst(sp[2], ch[2] + 0.05, z) * (1 - sst(nk[2] - 0.01, nk[2] + 0.04, z))   # 胸口到肩膀最寬，脖子以上不動
            arms = np.abs(P[:, 0] - ch[0]) > 0.17                                                       # T 字姿勢伸出去的手臂只跟著移、不放大
            k = np.where(arms, 1.0, 1 + (tw - 1) * band)
            x = ch[0] + (P[:, 0] - ch[0]) * k + np.where(arms, np.sign(P[:, 0] - ch[0]) * (tw - 1) * 0.17 * band, 0)
            y = ch[1] + (P[:, 1] - ch[1]) * np.where(arms, 1.0, 1 + 0.6 * (tw - 1) * band)
            y = y - st * sst(ch[2], nk[2] + 0.02, z)                                                     # 胸口以上往前（駝）；頭、臉跟著
            nb = sst(nk[2] - 0.02, nk[2] + 0.02, z) * (1 - sst(hd[2] - 0.03, hd[2] + 0.01, z)) * (~arms)   # 脖子粗一點
            x = nk[0] + (x - nk[0]) * (1 + (nkk - 1) * nb); y = nk[1] + (y - nk[1]) * (1 + (nkk - 1) * nb)
            front = np.clip(-(P[:, 1] - ch[1]) / 0.10, 0, 1)                                              # 肚子：肚臍附近往前（前面才推）
            y = y - bl * front * np.exp(-((z - (sp[2] + 0.02)) / 0.07) ** 2) * (~arms)
            return np.column_stack([x, y, z])
        for o in (m['body'], m['face']): C.warp_world(o, bulk)
        print('  torso x%.2f stoop %.3f' % (tw, st))
    if not male:
        nk = C.bone_head(arm, 'J_Bip_C_Neck'); w = np.clip(C.vgroup_weights(m['body'], {'J_Bip_C_Neck'}), 0, 1)
        C.warp(m['body'], lambda P, B: np.column_stack([nk[0] + (P[:, 0] - nk[0]) * (1 - 0.05 * w), nk[1] + (P[:, 1] - nk[1]) * (1 - 0.05 * w), P[:, 2]]))
    print('  %s (%s %s) landmarks' % (NAME, VAR['sex'], VAR['base']), {k: round(v, 3) for k, v in C.landmarks(arm).items()})


def face(m):
    import p00_face as PF
    if VAR['sex'] == 'm':
        f = dict(PF.MALE); f.update(VAR['face']); PF.run(m, f, {'Fcl_EYE_Close': VAR.get('eye_close', 0.0)})
        if VAR.get('skin'):
            import zhe_face as ZF
            print('  skin tone', ZF.tan_skin([m['face'], m['body']], VAR['skin'], tuple(0.5 + 0.5 * k for k in VAR['skin'])))
    else:
        f = dict(FEMALE_FACE); f.update(VAR['face']); PF.run(m, f, {'Fcl_EYE_Natural': 0.5, 'Fcl_EYE_Close': 0.2})


def clothes(m):
    import p00_clothes as PC
    # 每個路人用自己的暫存資料夾：h01_clothes 把衣服貼圖存成 WIP/clothes_*.png 再打包，同時建好幾個路人會互相覆蓋
    # （2026-10-14 第二批五個一起建：nm3 打包到寫到一半的 clothes_Trouser.png，VRM 匯出時讀不了）
    PC.K.WIP = os.path.join(PC.K.WIP, 'npc_' + TAG.lower()); os.makedirs(PC.K.WIP, exist_ok=True)
    if VAR.get('clothes_mod'):           # 款式比 p00_clothes 多的（魏教授：背心＋白袖子＋白色內層）用自己的模組
        import importlib
        m['clothes'] = importlib.import_module(VAR['clothes_mod']).apply(m); m['clothes'].name = 'Clothes_' + TAG
        return
    if VAR.get('layered'):               # 日劇穿搭：敞開的外套＋T 恤、A 字裙（npc_layered.py）
        import npc_layered as NL
        m['clothes'] = NL.run(m, TAG, HT[VAR['base']], VAR['layered']); m['clothes'].name = 'Clothes_' + TAG
        return
    ht = HT[VAR['base']]
    obj = PC.run(m, VAR['clothes'], ht['M'], ht['side'])
    obj.name = 'Clothes_' + TAG
    for mt in obj.data.materials:
        if mt and mt.name.startswith('H01_'): mt.name = TAG + '_' + mt.name[4:]
    for im in bpy.data.images:
        if im.name.startswith('H01_'): im.name = TAG + '_' + im.name[4:]
    m['clothes'] = obj


# 日劇髮型（使用者 2026-10-17：「你可以參考日劇的男女主角的髮型嗎」）：參考日劇裡大學生、年輕上班族常見的髮型種類（不照任何真實演員）。
# 穿搭、髮色、長度照原本的 VARIANTS；這裡只改瀏海樣式、外翻、波浪（產生器的參數見 npc_hair_f.py、npc_hair_m.py 開頭）。
#   女：air 空氣瀏海（シースルーバング）、side 斜瀏海、center 中分沒有瀏海（センターパート）、heavy 厚瀏海；flip 外ハネ；wave ゆる巻き
#   男：center 中分（センターパート；前面的髮尾停在髮際線 tipfront）、heavy 蘑菇頭（マッシュ）、card 原本的一撮一撮（短髮、側分）＋wave 微捲燙
CENTER_M = (0.060, 0.045, 0.010); MASH_M = (-0.010, -0.010, -0.006)
JP_STYLE = {
    'nf1': dict(bang='side', wave=0.006), 'nf2': dict(bang='air', flip=0.028), 'nf3': dict(bang='air', wave=0.012), 'nf4': dict(bang='side', flip=0.020),
    'nf5': dict(bang='center', part=0.0), 'nf6': dict(bang='air', flip=0.030), 'nf7': dict(bang='side', flip=0.018), 'nf8': dict(bang='heavy'),
    'nf9': dict(bang='center', part=0.0, wave=0.012), 'nf10': dict(bang='center', part=0.0), 'nf11': dict(bang='side'), 'nf12': dict(bang='air'),
    'nf13': dict(bang='air', flip=0.022), 'nf14': dict(bang='heavy'), 'nf15': dict(bang='center', part=0.0, wave=0.010), 'nf16': dict(bang='air'),
    'nf17': dict(bang='side', wave=0.008), 'nf18': dict(bang='side', flip=0.024), 'nf19': dict(bang='center', part=0.0, wave=0.014), 'nf20': dict(bang='air', flip=0.020),
    'nm2': dict(bang='heavy', tipfront=MASH_M, vol=1.12), 'nm3': dict(wave=0.004), 'nm5': dict(bang='heavy', tipfront=MASH_M, vol=1.12),
    'nm8': dict(bang='center', tipfront=CENTER_M, part=0.0, wave=0.004), 'nm9': dict(bang='center', tipfront=CENTER_M, part=0.0),
    'nm10': dict(bang='center', tipfront=CENTER_M, part=0.0), 'nm11': dict(wave=0.004), 'nm12': dict(bang='heavy', tipfront=MASH_M, vol=1.12),
    'nm14': dict(bang='center', tipfront=CENTER_M, part=0.0, wave=0.005, vol=1.12), 'nm15': dict(wave=0.005), 'nm17': dict(bang='heavy', tipfront=MASH_M, vol=1.10),
    'nm18': dict(bang='center', tipfront=CENTER_M, part=0.0, wave=0.004), 'nm20': dict(wave=0.006),
    # 不變（短髮、側分、平頭：日劇裡也常見的清爽短髮）：nm1、nm4、nm6、nm7、nm13、nm16、nm19
}


def hair(m):
    import npc_hair_m as HM, npc_hair_f as HF
    mod = HM if VAR['sex'] == 'm' else HF
    mod.P.update(VAR['hair']); mod.P['name'] = TAG
    st = dict(JP_STYLE.get(NAME, {})) if not os.environ.get('NPC_NO_JP') else {}
    if 'tipfront' in st: tp = list(mod.P['tip']); tp[:3] = st.pop('tipfront'); mod.P['tip'] = tuple(tp)
    mod.P.update(st)
    if os.environ.get('NPC_HAIR'): mod.P.update(json.loads(os.environ['NPC_HAIR']))   # 試做：不改 VARIANTS，用環境變數蓋掉頭髮參數（JSON）
    mod.apply(m)


STAGES = dict(stage0=stage0, face=face, clothes=clothes, hair=hair)


def from_blend(path):
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
    cl = bpy.data.objects.get('Clothes_' + TAG)
    if cl is not None: m['clothes'] = cl
    return m


def main():
    a = C.args(); out = a[0]
    opt = {a[i]: a[i + 1] for i in range(1, len(a) - 1) if a[i].startswith('--')}
    stages = [s for s in opt.get('--stages', 'stage0').split(',') if s]
    C.setup()
    m = from_blend(opt['--from-blend']) if '--from-blend' in opt else C.import_vrm(os.path.join(C.SRC, VAR['base'] + '.vrm'))
    for s in stages:
        print('[stage]', s); STAGES[s](m)
    if '--blend' in opt:
        os.makedirs(os.path.dirname(os.path.abspath(opt['--blend'])), exist_ok=True)
        bpy.ops.file.pack_all(); bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(opt['--blend']), compress=True); print('saved blend', opt['--blend'])
    if m.get('wsrc_top') is not None: bpy.data.objects.remove(m['wsrc_top'], do_unlink=True); m['wsrc_top'] = None
    if '--render' in opt:
        lm = C.landmarks(m['arm']); kw = {'views': tuple(opt['--views'].split(','))} if '--views' in opt else {}
        print('renders', C.render_views(opt['--render'], head_z=lm['head'] + 0.08, height=lm['head'] + 0.20, **kw))
    if out != '-': print('exported', C.export_vrm(os.path.abspath(out)))


if __name__ == '__main__':
    main()
