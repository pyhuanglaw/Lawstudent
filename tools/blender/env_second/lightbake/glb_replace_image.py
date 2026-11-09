"""把 GLB 裡某一張內嵌圖（照 images[].name）換成另一個檔，其他位元組照搬（LAWWW2-B 2026-11-09；好拍洞洞板調亮：光照貼圖和板子顏色無關，換圖不用重烘）。不需要 Blender。
  python3 tools/blender/env_second/lightbake/glb_replace_image.py <in.glb> <out.glb> --name <圖名> --file <新圖檔> [--from-glb <另一個 GLB>]
  --file：新的圖檔（WebP／PNG／JPEG，mimeType 照副檔名）。--from-glb：從另一個 GLB 取同名的圖（例：glb_split_tile.py 用別的倍數產生的檔）。
只換那一張圖的 bufferView 內容，後面的 bufferView 位移照順序調整；accessor、材質、節點、其他圖都不動。"""
import json, struct, sys


def opt(k, d=None):
    return sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d


def load(p):
    b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + n]); rest = b[20 + n:]
    bl = struct.unpack('<I', rest[:4])[0]; return J, bytearray(rest[8:8 + bl])


def main():
    src, dst = sys.argv[1], sys.argv[2]; name = opt('--name')
    J, B = load(src)
    idx = [i for i, im in enumerate(J['images']) if im.get('name') == name]
    if len(idx) != 1: sys.exit('要剛好一張圖叫 %s（%d）' % (name, len(idx)))
    im = J['images'][idx[0]]
    if opt('--from-glb'):
        J2, B2 = load(opt('--from-glb')); i2 = [x for x in J2['images'] if x.get('name') == name]
        if len(i2) != 1: sys.exit('--from-glb 裡要剛好一張圖叫 %s' % name)
        v2 = J2['bufferViews'][i2[0]['bufferView']]; data = bytes(B2[v2.get('byteOffset', 0):v2.get('byteOffset', 0) + v2['byteLength']]); mime = i2[0].get('mimeType', im.get('mimeType'))
    else:
        f = opt('--file'); data = open(f, 'rb').read(); mime = {'webp': 'image/webp', 'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg'}[f.rsplit('.', 1)[-1].lower()]
    bvi = im['bufferView']; bv = J['bufferViews'][bvi]; off = bv.get('byteOffset', 0); old = bv['byteLength']
    users = [i for i, x in enumerate(J['images']) if x.get('bufferView') == bvi] + [i for i, a in enumerate(J.get('accessors', [])) if a.get('bufferView') == bvi]
    if len(users) != 1: sys.exit('那張圖的 bufferView 被共用，不處理')
    pad_new = (4 - len(data) % 4) % 4; newlen = len(data) + pad_new
    # 原本這一段（含對齊用的空白）佔到下一個 bufferView 開始的地方；新的長度換掉、後面整體位移
    later = sorted([v.get('byteOffset', 0) for v in J['bufferViews'] if v.get('byteOffset', 0) > off])
    end = later[0] if later else len(B); shift = (off + newlen) - end
    B = B[:off] + data + b'\0' * pad_new + B[end:]
    bv['byteLength'] = len(data)
    for v in J['bufferViews']:
        if v is not bv and v.get('byteOffset', 0) >= end: v['byteOffset'] = v.get('byteOffset', 0) + shift
    im['mimeType'] = mime; J['buffers'][0]['byteLength'] = len(B)
    js = json.dumps(J, ensure_ascii=False, separators=(',', ':')).encode('utf-8'); js += b' ' * ((4 - len(js) % 4) % 4)
    bn = bytes(B) + b'\0' * ((4 - len(B) % 4) % 4)
    open(dst, 'wb').write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bn)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(bn), 0x004E4942) + bn)
    print('%s：圖 %s %d → %d B（後面的 bufferView 位移 %+d）→ %s' % (src, name, old, len(data), shift, dst))


if __name__ == '__main__':
    main()
