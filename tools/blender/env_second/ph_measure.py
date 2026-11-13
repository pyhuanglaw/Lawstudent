"""量 Poly Haven 模型的原始尺寸和面數（挑模型前先量：名字看起來對的不一定是對的，例 binder_notebook 其實是平放打開的筆記本 58×20×2.5 cm）。
用法（repo 根目錄）：/opt/blenv/bin/python tools/blender/env_second/ph_measure.py -- cardboard_box_01 book_encyclopedia_set_01 ...
找模型：curl -s https://api.polyhaven.com/assets?t=models | python3 -c "import json,sys; print([k for k in json.load(sys.stdin) if 'box' in k])" """
import bpy, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))
import cc0_fetch   # noqa: E402
for aid in sys.argv[sys.argv.index('--') + 1:]:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=cc0_fetch.ph_model(aid))
    ms = [o for o in bpy.data.objects if o.type == 'MESH']; vs = [o.matrix_world @ v.co for o in ms for v in o.data.vertices]
    tris = 0
    for o in ms: o.data.calc_loop_triangles(); tris += len(o.data.loop_triangles)
    mn = [min(v[i] for v in vs) for i in range(3)]; mx = [max(v[i] for v in vs) for i in range(3)]
    print('PH', aid, '尺寸 x/y/z（m，z＝高）', [round(mx[i] - mn[i], 3) for i in range(3)], '面', tris, '網格', len(ms))
