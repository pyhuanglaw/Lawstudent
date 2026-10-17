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
             SLEEVE_LEN=0.40, SLEEVE_K=0.72, CUFF_EASE=0.014, EASE_K=0.65, DROP_X=0.105, TOP_FIT=0.45, HEM_LOOSE=True,
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


def apply(m):
    P5.STYLE, P5.STYLE_M, P5.SIDE_NECK_M = STYLE, STYLE_M, SIDE_NECK_M
    obj = P5.apply(m)
    print('  polo placket: faces removed below the chest', trim_placket(STYLE_M['V_BOTTOM'] - PLACKET_LEN))
    return obj
