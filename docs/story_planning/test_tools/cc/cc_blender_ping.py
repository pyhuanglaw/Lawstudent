"""CC（帳號 A）11-10：BLENDER-ON-PC-1110（X331，LAWWW 21:58）PC runner kind blender 自檢。
在使用者電腦的 Blender 背景跑：印 Blender 版本、CPU 執行緒、裝置；做一個方塊存 .blend、匯出 GLB；結果寫 <out>/blender_ping.json。
用法（runner）：kind blender，XARGS=--out {out}；手動：blender -b --python-exit-code 1 --python cc_blender_ping.py -- --out <資料夾>"""
import sys, os, json, time
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
out = argv[argv.index('--out') + 1] if '--out' in argv else os.getcwd()
os.makedirs(out, exist_ok=True)
t0 = time.time()
import bpy
info = {'version': bpy.app.version_string, 'binary': bpy.app.binary_path, 'background': bpy.app.background,
        'threads_env': os.environ.get('CC_BLENDER_THREADS'), 'device_env': os.environ.get('CC_BLENDER_DEVICE'),
        'render_threads_mode': bpy.context.scene.render.threads_mode, 'render_threads': bpy.context.scene.render.threads}
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.mesh.primitive_cube_add(size=1.0)
blend = os.path.join(out, 'blender_ping.blend'); glb = os.path.join(out, 'blender_ping.glb')
bpy.ops.wm.save_as_mainfile(filepath=blend)
bpy.ops.export_scene.gltf(filepath=glb, export_format='GLB')
info.update({'blend_bytes': os.path.getsize(blend), 'glb_bytes': os.path.getsize(glb), 'seconds': round(time.time() - t0, 2)})
json.dump(info, open(os.path.join(out, 'blender_ping.json'), 'w'), indent=1)
print('BLENDER PING OK', json.dumps(info))
