"""118 巷九間店：從街上隔著玻璃看進去，淺店內後牆那一面的圖 → textures/gen/l118_peek_atlas.jpg／.json（wz_shopkit.py 的 shallow_interior 在 --set lane118 時讀）。
L118-STREET-FIX-1111（BB_341 第 1 項：「玻璃後面是一排紅色方塊……和新室內對不上」；LAWWW 的子代理代 LAWWW2，2026-11-11）。
原本：九間店的淺店內用舊店型的那一套（麵店＝後牆一排紅紙菜單、自助餐＝白板上一排紅條），和 11-11 換過的新室內（l118_<id>.glb）沒有關係。
現在：直接把新室內的 GLB 拿來算——鏡頭站在街上（店面玻璃外 CAMD 公尺、眼睛高 1.5 m、店的正中間），往店裡看；
  畫面剛好框住「玻璃後面 DI＝2.6 m 的那一面」（淺店內的後牆，寬＝室內的寬、高 2.7 m），鏡頭的近裁切面也在那裡——比 2.6 m 近的（店的前牆、最前面那幾桌）不畫，
  那一段由 wz_shopkit 用立體的桌椅補（照這間店的桌椅樣子）；2.6 m 以後的整間店（桌椅、櫃台、廚房、牆上的東西）都在這張圖上。
  所以從街上正面看，圖上的東西就在新室內真正的位置；室內的 x＝店面的本地 x（lane118_neighbors.py 同一個對法）。
  室內重做（LAWWW2 的第 3 版）以後重跑這一支＋wz_street.py --set lane118 就會跟著換。
光：室內自己的日光燈（GLOW_ 材質）＋天花板下每 2.4 m 一盞面光源＋一點環境光；Standard、不加對比。圖存成正常亮度，wz_shopkit 貼的時候材質是 unlit，
  亮度在這裡乘 DIM（和淺店內頂點色的後牆 0.68×bright 同一個量級：從亮的街上看進店裡，裡面比外面暗）。
json：{<id>: {uv:[u0,v0,u1,v1], m:寬（公尺）, h:高（公尺）, floor／wall／ceil:'#色碼'（圖的下緣、兩側、上緣的平均色，乘 DIM 以前；淺店內的地板、側牆、天花板用，和圖接得起來）}}
用法（repo 根目錄）：/opt/blenv/bin/python tools/blender/env_second/l118_peek_tex.py [-- --shop omu,self] [--samples 48] [--cache 資料夾（留著每間的原圖，只重排版時加 --pack）]"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GEN = os.path.join(HERE, 'textures', 'gen'); ENV = os.path.join(ROOT, 'assets', 'models', 'env', 'second_ai')
A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return A[A.index(n) + 1] if n in A else d
IDS = ['dian', 'self', 'tea', 'home', 'cafe2', 'pasta', 'korea', 'omu', 'noodle2']
DI, CARD_H, CAMD, EYE, PXM, EDGE = 2.6, 2.7, 4.0, 1.5, 96, 0.06   # DI、CARD_H 和 wz_shopkit.py 一樣（DI；ih＝GH−0.9）；PXM＝每公尺幾個像素
DIM = 0.6
AW, AH = 2048, 1024
CACHE = arg('--cache') or os.path.join(GEN, '_l118_peek_raw')
WARM = {'home', 'pasta', 'omu', 'noodle2', 'tea'}


def render(only):
    import bpy
    from mathutils import Vector
    g2b = lambda x, y, z: Vector((x, -z, y))
    for sid in IDS:
        if only and sid not in only: continue
        lj = json.load(open(os.path.join(ENV, f'l118_{sid}.layout.json'), encoding='utf-8')); b = lj['bounds']; H = lj.get('h', 3.2)
        bpy.ops.wm.read_factory_settings(use_empty=True)
        bpy.ops.import_scene.gltf(filepath=os.path.join(ENV, f'l118_{sid}.glb'))
        for ob in list(bpy.data.objects):   # 門外的照片、兩側的鄰居店面卡不進來（在鏡頭後面，但會被光打到、反光進店裡）
            if ob.type == 'MESH' and ob.name.endswith('_view'): bpy.data.objects.remove(ob, do_unlink=True)
        sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = int(arg('--samples', 48)); sc.cycles.max_bounces = 5
        try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
        except Exception: pass
        x0, x1 = b['x0'] + EDGE, b['x1'] - EDGE; wc = x1 - x0; cx = (x0 + x1) / 2; dc = CAMD + DI
        sc.render.resolution_x, sc.render.resolution_y = round(wc * PXM), round(CARD_H * PXM); sc.render.resolution_percentage = 100
        sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'; sc.view_settings.exposure = 0.0
        sc.render.image_settings.file_format = 'PNG'
        w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (0.9, 0.9, 0.92, 1.0); bg.inputs['Strength'].default_value = 0.25
        warm = sid in WARM; col = (1.0, 0.9, 0.76) if warm else (0.98, 0.99, 1.0)
        nx = max(1, round((b['x1'] - b['x0']) / 2.4)); nz = max(2, round((b['z1'] - b['z0']) / 2.4))
        for i in range(nx):
            for j in range(nz):
                ld = bpy.data.lights.new('l', 'AREA'); ld.shape = 'RECTANGLE'; ld.size = 1.2; ld.size_y = 0.3; ld.energy = 34.0; ld.color = col
                lo = bpy.data.objects.new('l', ld); sc.collection.objects.link(lo)
                lo.location = g2b(b['x0'] + (i + 0.5) * (b['x1'] - b['x0']) / nx, H - 0.12, b['z0'] + (j + 0.5) * (b['z1'] - b['z0']) / nz)   # 面光源預設朝下（−Z）
        cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
        cam.data.type = 'PERSP'; cam.data.sensor_fit = 'HORIZONTAL'; cam.data.sensor_width = 36.0; cam.data.lens = 36.0 * dc / wc
        cam.location = g2b(cx, EYE, b['z1'] + CAMD); cam.rotation_euler = g2b(0.0, 0.0, -1.0).to_track_quat('-Z', 'Y').to_euler()
        cam.data.shift_x = 0.0; cam.data.shift_y = (CARD_H / 2 - EYE) / wc; cam.data.clip_start = dc - 0.01; cam.data.clip_end = 60.0
        os.makedirs(CACHE, exist_ok=True); sc.render.filepath = os.path.join(CACHE, f'{sid}.png'); bpy.ops.render.render(write_still=True)
        print(json.dumps({'shop': sid, 'w_m': round(wc, 2), 'px': [sc.render.resolution_x, sc.render.resolution_y]}), flush=True)


def pack():
    from PIL import Image
    import numpy as np
    hx = lambda c: '#%02x%02x%02x' % tuple(int(round(v)) for v in c)
    atlas = Image.new('RGB', (AW, AH), (20, 20, 20)); out = {}; x = y = 0; rowh = round(CARD_H * PXM); PAD = 4
    for sid in IDS:
        im = Image.open(os.path.join(CACHE, f'{sid}.png')).convert('RGB'); w, h = im.size
        if x + w > AW: x = 0; y += rowh + PAD
        assert y + h <= AH, '貼圖集放不下'
        a = np.asarray(im).astype(np.float32)
        out[sid] = dict(uv=[round((x + 0.5) / AW, 5), round(1 - (y + h - 0.5) / AH, 5), round((x + w - 0.5) / AW, 5), round(1 - (y + 0.5) / AH, 5)], m=round(w / PXM, 3), h=CARD_H,
                        floor=hx(a[int(h * 0.94):, int(w * 0.1):int(w * 0.9)].mean((0, 1))), wall=hx(np.concatenate([a[int(h * 0.25):int(h * 0.7), :int(w * 0.03)], a[int(h * 0.25):int(h * 0.7), int(w * 0.97):]], 1).mean((0, 1))),
                        ceil=hx(a[:int(h * 0.04), int(w * 0.1):int(w * 0.9)].mean((0, 1))))
        atlas.paste(Image.fromarray(np.clip(a * DIM, 0, 255).astype(np.uint8)), (x, y)); x += w + PAD
    atlas.save(os.path.join(GEN, 'l118_peek_atlas.jpg'), quality=86)
    json.dump(out, open(os.path.join(GEN, 'l118_peek_atlas.json'), 'w'), indent=1)
    print('atlas', os.path.getsize(os.path.join(GEN, 'l118_peek_atlas.jpg')), json.dumps(out))


if __name__ == '__main__':
    if '--pack' not in A: render(set(arg('--shop', '').split(',')) - {''})
    pack()
