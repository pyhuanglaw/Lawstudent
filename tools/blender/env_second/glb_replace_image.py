"""GLB 後處理：換掉嵌在 GLB 裡的一張貼圖（幾何、UV、材質、節點都不動）。SIGN-RECTIFY-1110（LAWWW2 帳號 A 11-10）：招牌圖集重新拉正以後，只換圖。
用法：python3 tools/blender/env_second/glb_replace_image.py <in.glb> <out.glb> <圖的名字包含的字> <新圖.jpg|png> [webp 品質，預設 82]
圖的格式照 GLB 裡原本的（image/webp → 轉 WebP；image/jpeg、image/png 照轉）；大小要和原本一樣（不一樣就停，UV 是照比例的但 mipmap、記憶體會變）。"""
import io, json, struct, sys
from PIL import Image


def main(src, dst, key, newf, q=82):
    d = open(src, 'rb').read(); assert d[:4] == b'glTF'
    jl = struct.unpack('<I', d[12:16])[0]; J = json.loads(d[20:20 + jl]); bo = 20 + jl; bl = struct.unpack('<I', d[bo:bo + 4])[0]; BIN = bytearray(d[bo + 8:bo + 8 + bl])
    hits = [i for i, im in enumerate(J.get('images', [])) if key in (im.get('name') or '')]
    assert len(hits) == 1, ('images matching', key, [J['images'][i].get('name') for i in hits], 'all', [im.get('name') for im in J.get('images', [])][:40])
    im = J['images'][hits[0]]; bv = J['bufferViews'][im['bufferView']]; o = bv.get('byteOffset', 0); n = bv['byteLength']
    old = Image.open(io.BytesIO(bytes(BIN[o:o + n]))); new = Image.open(newf).convert(old.mode if old.mode in ('RGB', 'RGBA') else 'RGB')
    assert new.size == old.size, ('size', old.size, new.size)
    buf = io.BytesIO(); fmt = {'image/webp': 'WEBP', 'image/jpeg': 'JPEG', 'image/png': 'PNG'}[im['mimeType']]; new.save(buf, fmt, **({'quality': int(q)} if fmt != 'PNG' else {})); nb = buf.getvalue()
    pad = (4 - len(nb) % 4) % 4; nb2 = nb + b'\0' * pad; old_end = o + n; old_pad_end = old_end + (4 - old_end % 4) % 4
    # 這個 bufferView 後面的全部往後（或往前）移
    nxt = min([v.get('byteOffset', 0) for v in J['bufferViews'] if v.get('byteOffset', 0) >= old_end] + [len(BIN)])
    delta = (o + len(nb2)) - nxt
    BIN[o:nxt] = nb2
    for v in J['bufferViews']:
        if v is not bv and v.get('byteOffset', 0) >= old_end: v['byteOffset'] = v.get('byteOffset', 0) + delta
    bv['byteLength'] = len(nb); J['buffers'][0]['byteLength'] = len(BIN)
    js = json.dumps(J, ensure_ascii=False, separators=(',', ':')).encode('utf-8'); js += b' ' * ((4 - len(js) % 4) % 4)
    while len(BIN) % 4: BIN += b'\0'
    out = b'glTF' + struct.pack('<II', 2, 12 + 8 + len(js) + 8 + len(BIN)) + struct.pack('<I', len(js)) + b'JSON' + js + struct.pack('<I', len(BIN)) + b'BIN\0' + bytes(BIN)
    open(dst, 'wb').write(out); print(json.dumps({'image': im.get('name'), 'size': old.size, 'old_bytes': n, 'new_bytes': len(nb), 'glb_bytes': [len(d), len(out)]}, ensure_ascii=False))


if __name__ == '__main__':
    main(*sys.argv[1:6])
