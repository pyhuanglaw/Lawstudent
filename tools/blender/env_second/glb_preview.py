"""GLB 的快速預覽（Blender Workbench，幾秒一張）：照遊戲看得到的樣子——單面材質剔除背面、顏色用底色貼圖。
LAWWW2-C 2026-11-05（TONGXIAN-BB-1105）。以前的預覽（scratchpad 的 look.py）有兩個地方和遊戲不一樣，造成誤判：
  1. Workbench 預設不剔除背面：模型裡朝外的單面牆在預覽裡看得到、遊戲裡（three.js，doubleSided＝false 會剔除）看不到。
     同弦樓梯間 v1 的兩側腰牆、二樓西牆整面朝外，預覽一切正常，交件以後才發現。這裡照材質的 use_backface_culling（glTF 的 doubleSided）剔除。
  2. 「貼圖」顏色模式用的是材質裡「作用中」的那一個貼圖節點：glTF 匯入的材質有底色、發光兩張圖時，作用中的常常是發光那一張
     （同弦的便條紙、照片發光是黑的 → 預覽變成黑方塊）。這裡把底色那一張設成作用中。
  3. Workbench 的陰影會在三角形的邊上漏出細的亮線（像牆上有縫）：陰影關掉。
  4. Workbench 的「貼圖」模式不顯示頂點色：頂點色材質（tx_vc 之類：同弦書架上的書）畫成白的，看起來像一整塊白板子（BB-C 02:08 以為是模型的問題）。
     要看顏色用 eevee（第 6 個參數）：照材質畫，底色貼圖、頂點色、發光都有。
用法（座標＝遊戲座標：x 往東、y 往上、z 往南；水平視角是度）：
  /opt/blenv/bin/python tools/blender/env_second/glb_preview.py -- a.glb,b.glb 輸出資料夾 '名字:眼x:眼y:眼z:看x:看y:看z:水平視角[:藏的物件前綴|…];…' [寬 [高寬比 [studio|flat|eevee]]]
光線是 Workbench 的 STUDIO（不是遊戲的燈、不是烘焙），只用來看形狀、哪一面看得到、貼圖對不對；顏色、亮度以遊戲截圖為準。"""
import bpy, sys, math, os, mathutils
A = sys.argv[sys.argv.index('--') + 1:]
glbs = A[0].split(','); out = A[1]; views = [v for v in A[2].split(';') if v.strip()]
res = int(A[3]) if len(A) > 3 else 900; aspect = float(A[4]) if len(A) > 4 else 0.5625; LIGHT = (A[5] if len(A) > 5 else 'studio').upper()   # studio／flat（Workbench；flat＝不打光，只看底色）／eevee（照材質畫，頂點色、發光都有）
os.makedirs(out, exist_ok=True)


def G(p): return (p[0], -p[2], p[1])   # 遊戲座標 → Blender


def base_tex_active(mat):
    """把接到 Principled BSDF 底色（Base Color）的貼圖節點設成作用中（Workbench 的貼圖模式看這一個）"""
    nt = mat.node_tree if mat and mat.use_nodes else None
    if not nt: return
    bsdf = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if not bsdf or not bsdf.inputs['Base Color'].is_linked: return
    n = bsdf.inputs['Base Color'].links[0].from_node
    while n and n.type != 'TEX_IMAGE':   # 中間可能隔一個 Mix／頂點色乘法節點
        ins = [i for i in n.inputs if i.is_linked]
        n = ins[0].links[0].from_node if ins else None
    if n is not None: nt.nodes.active = n


def double_sided_copies():
    """Workbench 的剔除背面是全部一起的：雙面材質（glTF doubleSided，匯入成 use_backface_culling＝False）的面複製一份反過來，兩面都看得到"""
    import bmesh
    for o in [o for o in bpy.data.objects if o.type == 'MESH']:
        dbl = {i for i, s in enumerate(o.material_slots) if s.material and not s.material.use_backface_culling}
        if not dbl: continue
        if o.data.users > 1: o.data = o.data.copy()   # instancing 共用網格：各自複製（預覽用，不在乎多幾份）
        bm = bmesh.new(); bm.from_mesh(o.data)
        fs = [f for f in bm.faces if f.material_index in dbl]
        if fs:
            new = bmesh.ops.duplicate(bm, geom=fs)['geom']
            bmesh.ops.reverse_faces(bm, faces=[g for g in new if isinstance(g, bmesh.types.BMFace)])
        bm.to_mesh(o.data); bm.free()


for v in views:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene; sc.render.resolution_x = res; sc.render.resolution_y = int(res * aspect)
    if LIGHT == 'EEVEE':
        # EEVEE：照材質畫（底色貼圖、頂點色、發光、透明），單面材質照 use_backface_culling 剔除（glTF doubleSided）——和遊戲最像；
        # 光只有一個均勻的天空光（不是遊戲的燈），看形狀、顏色對不對用。640×360 約 12 秒
        sc.render.engine = 'BLENDER_EEVEE'
        try: sc.eevee.taa_render_samples = 16
        except Exception: pass
        w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = (0.92, 0.9, 0.87, 1); bg.inputs[1].default_value = 1.0
        for g in glbs: bpy.ops.import_scene.gltf(filepath=g)
        for m in bpy.data.materials:
            if m.use_backface_culling: m.use_backface_culling = True   # 匯入器照 doubleSided 設好了；EEVEE 算圖會照它剔除
    else:
        sc.render.engine = 'BLENDER_WORKBENCH'; sh = sc.display.shading
        sh.light = LIGHT; sh.color_type = 'TEXTURE'; sh.show_shadows = False; sh.show_cavity = True   # 陰影關掉：Workbench 的陰影（shadow volume）會在三角形的邊上漏出細的亮線，看起來像牆有縫
        sh.show_backface_culling = True   # Workbench 是全部一起剔除：雙面材質另外複製一份反過來（double_sided_copies）
        sc.world = bpy.data.worlds.new('w'); sh.background_type = 'WORLD'; sc.world.color = (0.05, 0.05, 0.06)
        for g in glbs: bpy.ops.import_scene.gltf(filepath=g)
        for m in bpy.data.materials: base_tex_active(m)
        double_sided_copies()
    f = v.split(':'); nm = f[0]; ex, ey, ez, lx, ly, lz, fov = map(float, f[1:8]); hide = f[8] if len(f) > 8 else ''
    for o in bpy.data.objects:
        if hide and any(o.name.startswith(h) for h in hide.split('|')): o.hide_render = True
    cam = bpy.data.cameras.new('c'); cam.sensor_fit = 'HORIZONTAL'; cam.angle = math.radians(fov); co = bpy.data.objects.new('c', cam); sc.collection.objects.link(co); sc.camera = co
    fr, to = (ex, ey, ez), (lx, ly, lz); co.location = G(fr); co.rotation_euler = (mathutils.Vector(G(to)) - mathutils.Vector(G(fr))).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.join(out, nm + '.png'); bpy.ops.render.render(write_still=True); print('OUT', sc.render.filepath)
