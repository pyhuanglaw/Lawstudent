"""高子晴（heroine_04）的衣服：沿用沈以安的 h01_clothes（p00_clothes.run：BodyMap 對到沈以安的比例、做完再轉回來），款式照參考圖 06：
淺麻灰 oversize 連帽上衣（交疊的淺 V 領、長袖羅紋袖口、下擺羅紋蓋過短褲褲頭、放下來的帽子＋兩條帽繩）、深色牛仔短褲（大腿中段）、白球鞋。
帽子與帽繩是這個檔案自己做的網格（h01_clothes 只有身片、袖子、褲子、鞋）。吉他袋是 props3d.js。"""
import math
import numpy as np
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import common as C
import p00_clothes as PC

STYLE = dict(KNIT_RGB=np.array([168, 172, 177]) / 255.0, TROUSER_RGB=np.array([50, 52, 58]) / 255.0,
             LEATHER_RGB=np.array([238, 236, 230]) / 255.0, SOLE_RGB=np.array([228, 226, 220]) / 255.0, GOLD_RGB=np.array([238, 236, 230]) / 255.0,
             SHOE_STYLE='sneaker', NECK_STYLE='V', HEM_OVER_PANTS=True, SLIM=False, TOP_TEX='jersey', TROUSER_TEX='denim',
             SLEEVE_LEN=1.0, SLEEVE_K=0.95, CUFF_EASE=0.010, EASE_K=0.95, DROP_X=0.105, TOP_FIT=0.15, HEM_LOOSE=False,
             PANTS_ELLIPSE=(0.074, 0.082), PANTS_DROP=False, PANTS_HEM_UP=0.62)
# 高度寫在高子晴身上（Vita 樣本：身高 1.678，遊戲裡 169 cm；胯骨 0.943、脊椎骨頭 1.036、脖子 1.392）：
# 短褲褲頭在腰（藏在連帽上衣裡面）、上衣下擺在胯骨下面 3.5 cm（羅紋 5 cm）、淺 V 領最低點在脖子根部下 7.5 cm
STYLE_M = dict(PANTS_TOP=1.036, PANTS_BAND=1.001, KNIT_HEM=0.908, KNIT_HEM_TOP=0.958, V_BOTTOM=1.317, BACK_NECK_Z=1.402)
SIDE_NECK_M = (0.058, 1.405)
HOOD_RGB = None     # 帽子用上衣同一張貼圖（同一個材質）


def _surface_bvh(obj):
    mw = np.array(obj.matrix_world); P = C.co(obj) @ mw[:3, :3].T + mw[:3, 3]
    return BVHTree.FromPolygons(P.tolist(), [list(p.vertices) for p in obj.data.polygons])


def build_hood(m, clothes, mat_key='Knit', cords=True, scale=1.0, shade=(0.90, 0.90, 0.92)):
    """放下來的帽子：脖子後面一圈粗的帽緣（從左肩頸到右肩頸）＋垂在背上的帽身（圓角三角形，貼著上衣背面外 1 cm）＋兩條帽繩
    mat_key：用哪一個衣服材質的貼圖（名字裡有這個字）；cords：前面兩條帽繩（敞開的外套不要）；scale：帽緣、帽身的大小（高子晴＝1；男生樣本約 1.1）"""
    arm = m['arm']
    N = C.bone_head(arm, 'J_Bip_C_Neck'); U = C.bone_head(arm, 'J_Bip_C_UpperChest')
    bvh = _surface_bvh(clothes)
    V, F, UV, W = [], [], [], []      # W：每個頂點綁脖子的比例（其餘綁上胸）

    def on_back(x, z, off):
        h = bvh.ray_cast(Vector((x, 0.5, z)), Vector((0, -1, 0)), 1.0)[0]
        return (float(h[1]) if h is not None else N[1] + 0.06) + off

    rx, ry = 0.086 * scale, 0.080 * scale; c0 = np.array([N[0], N[1] + 0.012 * scale, N[2] + 0.004])     # 第二版：帽緣高一點、寬一點（第一版在背上只是一條細線，看不出是帽子）
    def rim(th):   # 帽緣中心線（th：0＝正後方，±＝兩側）
        return c0 + np.array([math.sin(th) * rx, math.cos(th) * ry, 0.014 * math.cos(th)])

    # 1. 帽緣：粗 1.3 cm 的管子，-105°～105°
    nu, nr, tr = 28, 8, 0.019
    ths = np.radians(np.linspace(-105, 105, nu + 1))
    base = len(V)
    for i, th in enumerate(ths):
        p = rim(th); t = _u(rim(th + 0.01) - rim(th - 0.01)); up = np.array([0, 0, 1.0]); s = _u(np.cross(t, up)); n2 = _u(np.cross(s, t))
        for j in range(nr):
            a = 2 * math.pi * j / nr
            V.append(p + (s * math.cos(a) + n2 * math.sin(a)) * tr); UV.append((0.02 + 0.96 * i / nu, 0.80 + 0.18 * j / nr)); W.append(0.45)
    for i in range(nu):
        for j in range(nr):
            a0 = base + i * nr + j; a1 = base + i * nr + (j + 1) % nr; b0 = a0 + nr; b1 = a1 + nr
            F.append((a0, b0, b1, a1))
    # 2. 帽身：從帽緣後半圈（-75°～75°）往下垂 21 cm、越往下越窄，貼著背後
    nu2, nv2 = 16, 9
    base = len(V)
    for j in range(nv2 + 1):
        v = j / nv2
        for i in range(nu2 + 1):
            u = -1 + 2 * i / nu2
            th = math.radians(75 * u)
            top = rim(th)
            wscale = (1 - 0.55 * v ** 1.4) * math.sqrt(max(0.0, 1 - (u * v ** 2) ** 2 * 0.0))
            x = top[0] * wscale; z = top[2] - 0.215 * scale * v - 0.012 * (1 - math.cos(math.pi * u)) * v
            puff = 0.016 * math.sin(math.pi * min(1.0, v * 1.1)) * (1 - u * u) + 0.010 * (1 - v)     # 帽身中間鼓起來（布料疊在一起的厚度）
            y = max(on_back(x, z, 0.012 + puff), top[1] + tr * 0.4 * (1 - v)) if v > 0.05 else top[1] + tr * 0.8
            V.append(np.array([x, y, z])); UV.append((0.1 + 0.8 * (u + 1) / 2, 0.70 * (1 - v))); W.append(0.25 * (1 - v))
    for j in range(nv2):
        for i in range(nu2):
            a0 = base + j * (nu2 + 1) + i; a1 = a0 + 1; b0 = a0 + nu2 + 1; b1 = b0 + 1
            F.append((a0, a1, b1, b0))
    # 3. 帽繩：領口兩側往下 17 cm 的細繩（寬 6 mm 的雙面帶子，前面）
    base = len(V)
    for sg in ((1, -1) if cords else ()):
        x0 = sg * 0.030; z0 = N[2] - 0.020
        h = bvh.ray_cast(Vector((x0, -0.5, z0 - 0.05)), Vector((0, 1, 0)), 1.0)[0]
        yf = (float(h[1]) if h is not None else N[1] - 0.08) - 0.006
        b = len(V)
        for k in range(9):
            t = k / 8; z = z0 - 0.17 * t
            h = bvh.ray_cast(Vector((x0 + sg * 0.004 * t, -0.5, z)), Vector((0, 1, 0)), 1.0)[0]
            y = (float(h[1]) if h is not None else yf) - 0.005
            for dx in (-0.003, 0.003):
                V.append(np.array([x0 + sg * 0.004 * t + dx, y, z])); UV.append((0.5, 0.86)); W.append(0.0)
        for k in range(8):
            a0 = b + 2 * k; F.append((a0, a0 + 1, a0 + 3, a0 + 2)); F.append((a0, a0 + 2, a0 + 3, a0 + 1))
    me = bpy.data.meshes.new('Clothes_Hood'); me.from_pydata([tuple(p) for p in V], [], F); me.validate(clean_customdata=False); me.update()
    uvl = me.uv_layers.new(name='UVMap'); li = np.zeros(len(me.loops), int); me.loops.foreach_get('vertex_index', li)
    uvl.data.foreach_set('uv', np.array(UV)[li].reshape(-1).astype(np.float32))
    me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    obj = bpy.data.objects.new('Clothes_Hood', me)
    (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
    knit = next(mt for mt in clothes.data.materials if mt and mat_key in mt.name)
    img = knit.vrm_addon_extension.mtoon1.pbr_metallic_roughness.base_color_texture.index.source
    # 第三版：帽子用同一張布料貼圖、顏色暗 8%（第二版和上衣同一個材質：遊戲光線下帽身和背後分不出來，看不出有帽子）
    mat = C.mtoon_from(knit.name, 'P04_Hood_CLOTH', base_img=img, double_sided=True)
    try: mat.vrm_addon_extension.mtoon1.pbr_metallic_roughness.base_color_factor = (*shade, 1.0)
    except Exception as ex: print('  hood factor', ex)
    me.materials.append(mat)
    W = np.array(W)
    C.bind(obj, arm, {'J_Bip_C_Neck': W, 'J_Bip_C_UpperChest': 1 - W})
    print('  hood: verts %d faces %d' % (len(V), len(F)))
    return obj


def _u(v):
    v = np.asarray(v, float); return v / max(float(np.linalg.norm(v)), 1e-9)


def apply(m):
    obj = PC.run(m, STYLE, STYLE_M, SIDE_NECK_M)
    build_hood(m, obj)
    return obj
