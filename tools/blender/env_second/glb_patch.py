#!/usr/bin/env python3
"""GLB 小修（LAWWW2-B 2026-10-30，D115 改名）：不重新匯出模型、不重烘光照，只改其中一小塊。
  · 換一張貼圖：--image 名稱=新的.png（照原圖的大小、格式重新壓成 WebP／PNG；其他 bufferView 原封不動、只重排位移）
  · 改節點的自訂屬性（遊戲照 extras 畫字的牌子：PLATE_FACE_*）：--extras 節點名稱前綴:鍵=值（前綴相同的節點全改）
用法：python3 tools/blender/env_second/glb_patch.py --in a.glb --out a.glb [--image cls201_print=new.png] [--extras PLATE_FACE_GATE:text=首都帝國大學]
只支援沒有 EXT_meshopt_compression／KHR_draco 的 GLB（遇到會停下來）。"""
import argparse, io, json, struct, sys
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument('--in', dest='inp', required=True); ap.add_argument('--out', required=True)
ap.add_argument('--image', action='append', default=[]); ap.add_argument('--extras', action='append', default=[])
ap.add_argument('--quality', type=int, default=90)
a = ap.parse_args()

b = open(a.inp, 'rb').read()
assert b[:4] == b'glTF'
L = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + L])
o = 20 + L; BL = struct.unpack('<I', b[o:o + 4])[0]; assert b[o + 4:o + 8] == b'BIN\0'; BIN = b[o + 8:o + 8 + BL]
bad = {'EXT_meshopt_compression', 'KHR_draco_mesh_compression'} & set(j.get('extensionsUsed', []))
assert not bad, f'不支援：{bad}'
views = [BIN[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']] for v in j['bufferViews']]
changed = []
for spec in a.image:
    name, path = spec.split('=', 1)
    hit = [i for i, im in enumerate(j['images']) if im.get('name') == name]
    assert hit, f'找不到貼圖 {name}'
    for ii in hit:
        im = j['images'][ii]; old = Image.open(io.BytesIO(views[im['bufferView']])); new = Image.open(path)
        if new.size != old.size: new = new.resize(old.size, Image.LANCZOS)
        mode = 'RGBA' if old.mode in ('RGBA', 'LA') else 'RGB'; new = new.convert(mode)
        bio = io.BytesIO(); fmt = (im.get('mimeType') or 'image/webp').split('/')[1].upper()
        if fmt == 'WEBP': new.save(bio, 'WEBP', quality=a.quality, method=6)
        elif fmt in ('JPEG', 'JPG'): new.save(bio, 'JPEG', quality=a.quality)
        else: new.save(bio, 'PNG', optimize=True)
        views[im['bufferView']] = bio.getvalue(); changed.append(f'image {name} {old.size} {fmt} {len(bio.getvalue())} B')
for spec in a.extras:
    pre, kv = spec.split(':', 1); k, v = kv.split('=', 1); n = 0
    for nd in j['nodes']:
        if nd.get('name', '').startswith(pre):
            nd.setdefault('extras', {})[k] = v; n += 1
    assert n, f'找不到節點 {pre}'
    changed.append(f'extras {pre}*.{k}={v}（{n} 個節點）')
# 重排 BIN（每個 bufferView 4 位元組對齊；順序照原本）
chunks, off = [], 0
for i, v in enumerate(j['bufferViews']):
    pad = (-off) % 4
    if pad: chunks.append(b'\0' * pad); off += pad
    v['byteOffset'] = off; v['byteLength'] = len(views[i]); chunks.append(views[i]); off += len(views[i])
nb = b''.join(chunks); nb += b'\0' * ((-len(nb)) % 4); j['buffers'][0]['byteLength'] = len(nb)
js = json.dumps(j, ensure_ascii=False, separators=(',', ':')).encode('utf-8'); js += b' ' * ((-len(js)) % 4)
out = b'glTF' + struct.pack('<II', 2, 12 + 8 + len(js) + 8 + len(nb)) + struct.pack('<I', len(js)) + b'JSON' + js + struct.pack('<I', len(nb)) + b'BIN\0' + nb
open(a.out, 'wb').write(out)
print('\n'.join(changed)); print(f'{a.inp} → {a.out}：{len(b)} → {len(out)} B')
