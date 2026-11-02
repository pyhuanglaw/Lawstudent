"""宿舍床桌組 11-02 放大以後（DORM-LOFT-SCALE-1102；使用者「宿舍的床跟人的比例太奇怪了，床太小，階梯太小」），各年度雜物模型的位置換算。
dorm_y2_items.py、dorm_y3_items.py、dorm_wz_items.py 裡的座標是照 11-02 以前的床桌組寫死的（書桌 z −0.96～0.315、衣櫃 0.34～0.935、床欄 x ±1.95、床板 1.56／床欄頂 2.02…）；
匯出前呼叫 remap_scene(root)：每個頂點照它在哪一組、哪一區，換到新的床桌組（dorm_room4.py：每組 2.57 m、離牆 1.05、階梯 0.52、床板 1.66／1.70、床欄頂 2.12）上的同一個地方。
  - 書桌、層架、牆面、桌下、走道邊（床板以下、床欄以內或走道上）：沿牆方向照書桌起點挪（前面那兩組 +0.175、後面那兩組 0）；
  - 衣櫃（舊 w0～ust）：照衣櫃挪；階梯（舊 ust～ub）：照新階梯的寬度比例；
  - 床欄外面、床上（舊床板以上：y ≥ 1.40 而且離牆 ≥ 0.85，或 y ≥ 1.56）：沿牆照床的長度伸縮、離牆 +0.10、高度 +0.10。
  - 房間同時從 6 m 改成 4.2 m 寬：左右牆各往內 0.9 m，每個點離牆的距離不變（x＝±(2.0 − 離牆)）。
座標：遊戲 dorm 區域（x 右、y 上、z 往門）；Blender 是 (x, −z, y)。"""
import bpy
from mathutils import Vector

IX = 2.9                      # 舊的左右牆內面 |x|（房間 6 m 寬）
IX1 = 2.0                     # 新的（11-02 使用者「宿舍走道太大了」：房間 4.2 m 寬，走道 1.8 m）
VD0, VD1 = 0.95, 1.05         # 床桌組離牆（舊、新）
DY = 0.10                     # 床板、床欄加高
# 每組（舊、新）：ua、衣櫃起點 w0、階梯起點 ust、ub、書桌起點 k0
OLD = {'back': (-3.395, -2.05, -1.40, -1.0, -3.375), 'front': (-0.98, 0.34, 0.94, 1.39, -0.96)}
NEW = {'back': (-3.395, -1.945, -1.345, -0.825, -3.375), 'front': (-0.805, 0.645, 1.245, 1.765, -0.785)}


def remap(x, y, z):
    """一個點（遊戲座標）→ 新的位置"""
    side = 1 if x > 0 else -1; v = IX - abs(x)                     # 離牆距離
    unit = 'back' if z < -0.99 else ('front' if z <= 1.40 else None)
    if unit is None or v > 2.2: return x, y, z                     # 門口那一段、舊房間的中間：不動（新房間沒有這一區）
    ua0, w00, ust0, ub0, k00 = OLD[unit]; ua1, w01, ust1, ub1, k01 = NEW[unit]
    upper = y >= 1.56 or (y >= 1.40 and v >= VD0 - 0.10)          # 床上、床欄外面
    if upper and z <= ust0 + 0.05:
        z2 = ua1 + (z - ua0) * (ust1 - ua1) / (ust0 - ua0); v2 = v + (VD1 - VD0) if v >= VD0 - 0.10 else v; y2 = y + DY
    elif z < w00: z2, v2, y2 = z + (k01 - k00), v, y
    elif z < ust0: z2, v2, y2 = z + (w01 - w00), v, y
    else: z2, v2, y2 = ust1 + (z - ust0) * (ub1 - ust1) / (ub0 - ust0), v, y
    return side * (IX1 - v2), y2, z2


def remap_scene(root=None):
    """場景裡（或 root 底下）每個網格的每個頂點換到新的床桌組上；回傳換了幾個物件"""
    obs = [o for o in bpy.data.objects if o.type == 'MESH']
    if root is not None: obs = [o for o in obs if o == root or root in o.parent_recursive]
    n = 0
    for ob in obs:
        if ob.data.users > 1: ob.data = ob.data.copy()
        mw = ob.matrix_world; inv = mw.inverted()
        for vt in ob.data.vertices:
            w = mw @ vt.co; gx, gy, gz = w.x, w.z, -w.y
            nx, ny, nz = remap(gx, gy, gz)
            vt.co = inv @ Vector((nx, -nz, ny))
        ob.data.update(); n += 1
    return n
