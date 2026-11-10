"""游泳池裡游泳的人（ART-GYM-POOL-SWIMMERS-1103；使用者 11-03「游泳池完全沒人？」X169 的後半；LAWWW2 帳號 A 2026-11-10）。
正式人物生產線（D144：VRM 外掛、VRoid CC0 樣本照 tools/blender/setup_env.sh 裝好就做，不用再問）：
  身體、臉沿用路人產生器 npc.py 的 stage0（拿掉衣服、補滿皮膚）＋face（捏臉）；不做頭髮——戴泳帽。
  泳衣、泳帽、泳鏡帶子都是「從身體網格取出那一圈、沿法線往外撐幾毫米」的貼身殼：頂點、權重跟身體一樣，動的時候不會穿模。
    男：及膝泳褲（jammer，大腿中段到腰）；女：連身泳衣（大腿根到胸口上緣＋兩條肩帶）；泳帽＝頭頂到眉毛上面、往後腦往下包；
    泳鏡：兩片鏡片（扁的橢球）＋鼻樑＋繞後腦的帶子，綁頭骨。
  水裡看得到的主要是頭、肩膀、手臂：泳帽、泳鏡、膚色、肩帶要對；腳在水裡（遊戲的水面會蓋過）。
用法（repo 根目錄；先跑 bash tools/blender/setup_env.sh）：
  SWIM=sm1 /opt/blenv/bin/python tools/blender/char_second/swimmer.py -- <輸出.vrm 或 -> [--render 前綴] [--blend 工作檔]
  之後：VRM_BASE=<樣本> [VRM_MALE=1] NPC_SMALL=1 python3 tools/blender/char_second/vrm_finish2.py <輸出.vrm> assets/models/char/vroid_swim_<id>.vrm 泳客
人物：四個（身體、臉照路人 nm4、nm7、nf2、nf3——不同的 VRoid 樣本、膚色；臉、身材不是主要角色）。泳衣、泳帽的顏色是常見的泳池裝（沒有品牌）。"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
SWIMS = {
    'sm1': dict(npc='nm4', suit='jammer', suit_rgb=(28, 40, 68), stripe_rgb=(200, 210, 222), cap_rgb=(24, 25, 28), lens_rgb=(40, 70, 120), strap_rgb=(30, 30, 34)),
    'sm2': dict(npc='nm7', suit='jammer', suit_rgb=(22, 22, 25), stripe_rgb=(180, 40, 36), cap_rgb=(186, 34, 38), lens_rgb=(30, 30, 34), strap_rgb=(30, 30, 34)),
    'sf1': dict(npc='nf2', suit='onepiece', suit_rgb=(30, 56, 104), stripe_rgb=(230, 232, 236), cap_rgb=(236, 236, 232), lens_rgb=(120, 70, 150), strap_rgb=(236, 236, 232)),
    'sf2': dict(npc='nf3', suit='onepiece', suit_rgb=(24, 24, 30), stripe_rgb=(60, 120, 200), cap_rgb=(56, 118, 200), lens_rgb=(40, 90, 150), strap_rgb=(30, 30, 34)),
}
SID = os.environ.get('SWIM', 'sm1'); SW = SWIMS[SID]
os.environ['NPC'] = SW['npc']          # npc.py 在 import 時讀 NPC：身體、臉的參數
sys.path.insert(0, HERE)
import npc as N                        # noqa: E402（也載入 tools/blender/char/common.py＝N.C）
C = N.C
import numpy as np, bpy, bmesh        # noqa: E402
from mathutils import Vector          # noqa: E402

TAG = 'SWIM_' + SID.upper()


def solid(name, rgb, stripe=None, n=64):
    """純色貼圖（泳衣兩側一條細邊：stripe）"""
    a = np.ones((n, n, 4)); a[..., :3] = np.array(rgb, float) / 255.0
    if stripe is not None: a[:, n // 2 - 2:n // 2 + 2, :3] = np.array(stripe, float) / 255.0
    return C.image_from_array(name, a)


TEMPLATE = ['M00_001_01_Body_00_SKIN']   # 身體的 MToon 材質（樣本不同、名字不同：swimwear() 開頭照那個人的身體換）
def mat(name, rgb, stripe=None):
    return C.mtoon_from(TEMPLATE[0], TAG + '_' + name, base_img=solid(TAG + '_' + name, rgb, stripe), outline=0.0)


def shell(src, keep, name, offset, material, clamp=None, skin_only=False):
    """src 的網格裡 keep(P) 圍出來的面複製一份、沿法線往外撐 offset（m）；權重、骨架跟 src 一樣。
    clamp(P)＝給的話：有任何一個頂點在範圍裡的面都留下，範圍外的頂點推回邊界（clamp 回傳新位置）——邊緣是一條平順的線，
    不是一格一格的鋸齒（第一版只留「頂點全在範圍裡」的面：泳帽邊緣一階一階、帶子太窄整圈沒有面）"""
    me = src.data.copy(); ob = src.copy(); ob.data = me; ob.name = name
    for c in src.users_collection: c.objects.link(ob)
    if me.shape_keys: ob.shape_key_clear()
    # 網格物件本身轉了 180°（VRM 匯入：網格的 +y＝世界的 −y＝人物前面）：範圍一律在世界座標判斷（骨頭位置、地標都是世界座標），推回邊界以後再換回網格座標
    MW = np.array(ob.matrix_world); R, Tt = MW[:3, :3], MW[:3, 3]; Ri = np.linalg.inv(R)
    to_w = lambda Q: Q @ R.T + Tt; to_l = lambda W: (W - Tt) @ Ri.T
    P = to_w(np.array([v.co[:] for v in me.vertices]).reshape(-1, 3)); k = keep(P)
    okm = {i for i, m in enumerate(me.materials) if m and 'SKIN' in m.name} if skin_only else None   # 臉的網格：只取皮膚（眉毛、睫毛、眼白、嘴巴內部不要）
    bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
    ok_mat = (lambda f: f.material_index in okm) if okm is not None else (lambda f: True)
    test = (lambda f: ok_mat(f) and any(k[v.index] for v in f.verts)) if clamp else (lambda f: ok_mat(f) and all(k[v.index] for v in f.verts))
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if not test(f)], context='FACES_ONLY')
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    if clamp:
        Q = to_w(np.array([v.co[:] for v in bm.verts]).reshape(-1, 3))
        if len(Q):
            kk = keep(Q); Q2 = to_l(clamp(Q))
            for v, inside, q in zip(bm.verts, kk, Q2):
                if not inside: v.co = Vector(q)
    bm.normal_update()
    for v in bm.verts: v.co += v.normal * offset
    bm.to_mesh(me); bm.free()
    me.materials.clear(); me.materials.append(material)
    for p in me.polygons: p.material_index = 0
    return ob


def eye_box(face, sgn):
    """眼白（EyeWhite）的頂點：一邊（sgn＝+1 左、−1 右）的範圍＝鏡片的位置、大小（VRoid 的眼睛骨頭在眼球轉動中心，比臉的表面深 6 cm）"""
    me = face.data; mi = [i for i, m in enumerate(me.materials) if m and 'EyeWhite' in m.name]
    vs = sorted({v for p in me.polygons if p.material_index in mi for v in p.vertices})
    MW = np.array(face.matrix_world); P = np.array([me.vertices[i].co[:] for i in vs]) @ MW[:3, :3].T + MW[:3, 3]   # 世界座標（網格轉了 180°）
    P = P[np.sign(P[:, 0]) == sgn]
    return P.min(0), P.max(0)


def bare_legs(body, z_top, z_skin0, z_skin1):
    """樣本身體的貼圖畫了襪子、褲襪（Darkness Shibu 黑褲襪、Victoria Rubin 白過膝襪、男生的黑襪）：游泳不穿——
    泳衣以下（z < z_top）的面在貼圖上的範圍，填成軀幹皮膚的顏色（z_skin0～z_skin1 那一段身體的貼圖中位數）"""
    from PIL import Image, ImageDraw
    me = body.data; uv = me.uv_layers.active.data; MW = np.array(body.matrix_world)
    P = np.array([v.co[:] for v in me.vertices]) @ MW[:3, :3].T + MW[:3, 3]
    mt = next(m for m in me.materials if m and 'SKIN' in m.name); src = mt.vrm_addon_extension.mtoon1.pbr_metallic_roughness.base_color_texture.index.source
    W, H = src.size; px = np.array(src.pixels[:], np.float32).reshape(H, W, 4)   # 第 0 列在下面
    def polys(pred):
        out = []
        for p in me.polygons:
            z = P[list(p.vertices), 2]
            if pred(z): out.append([(uv[li].uv[0] * W, (1 - uv[li].uv[1]) * H) for li in p.loop_indices])
        return out
    mask = Image.new('L', (W, H), 0); d = ImageDraw.Draw(mask)
    for q in polys(lambda z: (z.min() > z_skin0) & (z.max() < z_skin1)): d.polygon(q, fill=255)
    m = np.array(mask)[::-1] > 0
    skin = np.median(px[m][:, :3], axis=0) if m.any() else np.array([0.93, 0.80, 0.72])
    mask2 = Image.new('L', (W, H), 0); d2 = ImageDraw.Draw(mask2)
    legs = polys(lambda z: z.max() < z_top)
    for q in legs: d2.polygon(q, fill=255)
    m2 = np.array(mask2)[::-1] > 0
    px[m2, :3] = skin; src.pixels.foreach_set(px.reshape(-1)); src.update(); src.pack()
    print('  bare legs: faces', len(legs), 'skin', np.round(skin, 3))


def swimwear(m):
    arm, body, face = m['arm'], m['body'], m['face']
    TEMPLATE[0] = next(mt.name for mt in body.data.materials if mt and 'SKIN' in mt.name)
    lm = C.landmarks(arm); hip, knee, upper, neck, sh = lm['hip'], lm['knee'], lm['upper'], lm['neck'], lm['sh_x']
    hd = C.bone_head(arm, 'J_Bip_C_Head'); eyeL = C.bone_head(arm, 'J_Adj_L_FaceEye'); eyeR = C.bone_head(arm, 'J_Adj_R_FaceEye')
    ez = (eyeL[2] + eyeR[2]) / 2; ey = (eyeL[1] + eyeR[1]) / 2
    suit = mat('suit', SW['suit_rgb'])   # 純色：第一版側邊條紋放在貼圖中間，身體的 UV 中間是正面，條紋變成褲子正面一塊灰
    bare_legs(body, (knee + 0.17) if SW['suit'] == 'jammer' else (hip - 0.07), lm['spine'], lm['chest'])
    if SW['suit'] == 'jammer':   # 及膝泳褲：大腿中段到腰（肚臍下面）
        z0, z1 = knee + 0.16, hip + 0.06
        keep = lambda P: (P[:, 2] > z0) & (P[:, 2] < z1)
        s = shell(body, keep, 'Clothes_' + TAG, 0.0045, suit, clamp=lambda P: np.column_stack([P[:, 0], P[:, 1], np.clip(P[:, 2], z0, z1)]))
    else:                        # 連身泳衣：大腿根（腿口斜一點、外側高）到胸口上緣，兩條肩帶；手臂（T 字）不包
        zl, zu = hip - 0.075, upper + 0.015
        def keep(P):
            ax = np.abs(P[:, 0]); leg = zl + 0.06 * np.clip((ax - 0.03) / 0.07, 0, 1)
            torso = (P[:, 2] > leg) & (P[:, 2] < zu) & (ax < sh + 0.005)
            strap = (P[:, 2] >= zu - 0.01) & (P[:, 2] < neck - 0.012) & (ax > 0.05) & (ax < 0.082)
            return torso | strap
        def clamp(P):   # 腿口、胸口上緣推回邊界（第一版只留整個在範圍裡的面：腿口一格一格，像裙擺）
            ax = np.abs(P[:, 0]); leg = zl + 0.06 * np.clip((ax - 0.03) / 0.07, 0, 1); z = np.maximum(P[:, 2], leg)
            strap = (ax > 0.05) & (ax < 0.082); z = np.where(strap, z, np.minimum(z, zu))
            return np.column_stack([P[:, 0], P[:, 1], z])
        s = shell(body, keep, 'Clothes_' + TAG, 0.0035, suit, clamp=clamp)
    # 泳帽：額頭中間開始，越往後腦越低，蓋住耳朵上緣，後面包到髮際線（頭頂、後腦在 Body、額頭在 Face：兩片同一個厚度，合併時接起來）
    cap = mat('cap', SW['cap_rgb'])
    def cut(P):
        t = np.clip((P[:, 1] - (ey - 0.03)) / 0.11, 0, 1); return (ez + 0.034) - 0.085 * t * t * (3 - 2 * t)   # 前緣在眉毛上面一點（第一版 +0.045 太高，像西瓜皮）
    EAR = 0.079   # 耳朵在臉的網格最外側（|x| > 0.079）：帽子、帶子不包耳朵（第一版耳朵被包成兩團黑的）
    keep_cap = lambda P: (P[:, 2] > cut(P)) & ~((np.abs(P[:, 0]) > EAR) & (P[:, 2] < ez + 0.03))
    clamp_cap = lambda P: np.column_stack([P[:, 0], P[:, 1], np.maximum(P[:, 2], cut(P))])
    c1 = shell(body, keep_cap, 'Cap_' + TAG + '_b', 0.006, cap, clamp_cap); c2 = shell(face, keep_cap, 'Cap_' + TAG + '_f', 0.006, cap, clamp_cap, skin_only=True)
    # 泳鏡：鏡片照眼白的範圍（眼睛表面前面 7 mm）、鼻樑、兩邊接到帶子；帶子＝鏡片高度繞後腦一圈（帽子外面）
    lens, strap = mat('lens', SW['lens_rgb']), mat('strap', SW['strap_rgb'])
    boxes = [eye_box(face, 1), eye_box(face, -1)]
    gz = np.mean([(b[0][2] + b[1][2]) / 2 for b in boxes]); fy = min(b[0][1] for b in boxes)   # 鏡片中心高度、眼睛最前面
    def keep_strap(P): return (np.abs(P[:, 2] - gz) < 0.007) & (P[:, 1] > fy + 0.035) & (np.abs(P[:, 0]) < EAR)
    def clamp_strap(P): return np.column_stack([P[:, 0], P[:, 1], np.clip(P[:, 2], gz - 0.007, gz + 0.007)])
    c3 = shell(face, keep_strap, 'Strap_' + TAG + '_f', 0.0095, strap, clamp_strap, skin_only=True); c4 = shell(body, keep_strap, 'Strap_' + TAG + '_b', 0.0095, strap, clamp_strap)   # 眼睛高度的頭側、後腦在 Face 網格（第一版只取 Body：0 個面）
    me = bpy.data.meshes.new('Goggles_' + TAG); bm = bmesh.new()
    for lo, hi in boxes:
        cx, cz = (lo[0] + hi[0]) / 2, (lo[2] + hi[2]) / 2; rx, rz = (hi[0] - lo[0]) / 2 + 0.004, (hi[2] - lo[2]) / 2 + 0.004
        r = bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=8, radius=1.0)
        for v in r['verts']: v.co = Vector((cx + v.co.x * rx, lo[1] - 0.007 + v.co.y * 0.007, cz + v.co.z * rz))
        so = 1 if cx > 0 else -1; xo = cx + so * (rx + 0.006)   # 鏡片外側往後接到帶子
        r = bmesh.ops.create_cube(bm, size=1.0)
        for v in r['verts']: v.co = Vector((xo + v.co.x * 0.008, (lo[1] + fy + 0.04) / 2 + v.co.y * (fy + 0.04 - lo[1] + 0.01), gz + v.co.z * 0.008))
    xl = min(b[0][0] for b in boxes if (b[0][0] + b[1][0]) > 0); xr = max(b[1][0] for b in boxes if (b[0][0] + b[1][0]) < 0)
    r = bmesh.ops.create_cube(bm, size=1.0)   # 鼻樑
    for v in r['verts']: v.co = Vector(((xl + xr) / 2 + v.co.x * max(0.006, xl - xr), fy - 0.006 + v.co.y * 0.004, gz + 0.004 + v.co.z * 0.004))
    bm.to_mesh(me); bm.free(); g = bpy.data.objects.new('Goggles_' + TAG, me)
    for col in body.users_collection: col.objects.link(g)
    me.materials.append(lens); C.bind(g, arm, {'J_Bip_C_Head': 1.0})
    # 帽子兩片、帶子、鏡片合成一個網格（少一次 draw call）
    bpy.ops.object.select_all(action='DESELECT')
    for o in (c1, c2, c3, c4, g):
        if len(o.data.polygons): o.select_set(True)
        else: bpy.data.objects.remove(o, do_unlink=True)
    bpy.context.view_layer.objects.active = c1; bpy.ops.object.join(); c1.name = 'Cap_' + TAG
    bm = bmesh.new(); bm.from_mesh(c1.data); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0015); bm.to_mesh(c1.data); bm.free()   # 額頭（Face）和頭頂（Body）兩片的接縫焊起來
    print('  swimwear', SW['suit'], 'suit verts', len(s.data.vertices), 'cap+goggles verts', len(c1.data.vertices))
    m['clothes'] = s; m['cap'] = c1


def main():
    a = C.args(); out = a[0]
    opt = {a[i]: a[i + 1] for i in range(1, len(a) - 1) if a[i].startswith('--')}
    C.setup()
    m = C.import_vrm(os.path.join(C.SRC, N.VAR['base'] + '.vrm'))
    for s in ('stage0', 'face'):
        print('[stage]', s); N.STAGES[s](m)
    print('[stage] swimwear'); swimwear(m)
    if m.get('wsrc_top') is not None: bpy.data.objects.remove(m['wsrc_top'], do_unlink=True); m['wsrc_top'] = None
    if '--blend' in opt:
        bpy.ops.file.pack_all(); bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(opt['--blend']), compress=True); print('saved blend', opt['--blend'])
    if '--render' in opt:
        lm = C.landmarks(m['arm']); kw = {'views': tuple(opt['--views'].split(','))} if '--views' in opt else {}
        print('renders', C.render_views(opt['--render'], head_z=lm['head'] + 0.08, height=lm['head'] + 0.20, **kw))
    if out != '-': print('exported', C.export_vrm(os.path.abspath(out)))


if __name__ == '__main__':
    main()
