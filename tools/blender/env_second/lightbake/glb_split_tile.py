"""把貼圖集（atlas）裡的一塊拆成自己一張貼圖，給某個網格的材質用，可以順便把顏色調亮（LAWWW2-B 2026-11-09；好拍洞洞板 BB-B 選 (b)）。不需要 Blender。
  python3 tools/blender/env_second/lightbake/glb_split_tile.py <in.glb> <out.glb> --node <網格名字正規式> --tile u0,v0,u1,v1
         [--gain 線性倍數] [--dark 亮度門檻] [--name 新圖名字] [--quality 90]
  --tile：那一塊在貼圖上的範圍（UV，0～1，v 從上面算＝glTF 的 UV）。網格的 TEXCOORD_0 要全部落在這一塊裡面；
          換成新圖以後 UV 改成 (u−u0)/(u1−u0)、(v−v0)/(v1−v0)，鋪滿整張新圖。
  --gain：線性亮度乘這個倍數（sRGB → 線性 → 乘 → sRGB，超過 1 就截到 1）。只乘「亮度 ≥ --dark（線性，預設 0.05）」的像素：
          畫上去的暗色洞（好拍 #2e2924，線性亮度約 0.02）照舊是暗的。
為什麼：好拍右牆洞洞板翻正以後看得到了，但烤漆 #8c7f68 的反照率（線性亮度 0.19）只有旁邊灰泥牆（0.53）的 1/2.7，
  同樣的光照會比現在玩家看到的淺牆暗很多（BB-B：不要回到 11-08 之前那種深灰褐）。拆出來的好處：
  ① 不動原本的貼圖集（球拍、鐵網格照舊）；② 遠處的 mipmap 不會混到隔壁那一塊鐵網格的透空。
網格的材質必須只給這個網格用（先用 glb_flip_faces.py --opaque-copy 複製一份）；UV accessor 不能共用。新圖用 WebP（EXT_texture_webp，原檔已經用了）。"""
import json, struct, sys, re, io
import numpy as np
from PIL import Image


def opt(k, d=None):
    return sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d


def s2l(v): return np.where(v <= 0.04045, v / 12.92, ((v + 0.055) / 1.055) ** 2.4)
def l2s(v): return np.where(v <= 0.0031308, v * 12.92, 1.055 * np.power(np.maximum(v, 0), 1 / 2.4) - 0.055)


def main():
    src, dst = sys.argv[1], sys.argv[2]
    rx = re.compile(opt('--node')); u0, v0, u1, v1 = [float(t) for t in opt('--tile').split(',')]
    gain = float(opt('--gain', 1.0)); dark = float(opt('--dark', 0.05)); nm = opt('--name', 'tile'); q = int(opt('--quality', 90))
    b = open(src, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + n]); rest = b[20 + n:]
    bl = struct.unpack('<I', rest[:4])[0]; B = bytearray(rest[8:8 + bl])
    nodes = [nd for nd in J['nodes'] if 'mesh' in nd and rx.search(nd.get('name', ''))]
    if len(nodes) != 1: sys.exit('要剛好一個網格合 %s（%d）' % (rx.pattern, len(nodes)))
    me = J['meshes'][nodes[0]['mesh']]; mats = {pr['material'] for pr in me['primitives']}
    for mi, m2 in enumerate(J['meshes']):
        if m2 is me: continue
        for pr in m2['primitives']:
            if pr.get('material') in mats: sys.exit('材質 %s 也給別的網格用：先用 glb_flip_faces.py --opaque-copy 複製一份' % J['materials'][pr['material']]['name'])
    m = J['materials'][mats.pop()] if len(mats) == 1 else sys.exit('網格有好幾個材質')
    t0 = m['pbrMetallicRoughness']['baseColorTexture']; T = J['textures'][t0['index']]
    srci = T.get('source'); srci = srci if srci is not None else list(T['extensions'].values())[0]['source']
    I = J['images'][srci]; bv = J['bufferViews'][I['bufferView']]; o = bv.get('byteOffset', 0)
    im = Image.open(io.BytesIO(bytes(B[o:o + bv['byteLength']]))).convert('RGBA'); W, H = im.size
    box = (round(u0 * W), round(v0 * H), round(u1 * W), round(v1 * H)); tile = np.asarray(im.crop(box), float) / 255
    rgb = s2l(tile[..., :3]); lum = rgb @ [0.2126, 0.7152, 0.0722]; mask = lum >= dark
    before = float(lum[mask].mean())
    rgb[mask] = np.clip(rgb[mask] * gain, 0, 1); after = float((rgb @ [0.2126, 0.7152, 0.0722])[mask].mean())
    out = np.concatenate([l2s(rgb), tile[..., 3:]], -1)
    buf = io.BytesIO(); Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA').convert('RGB').save(buf, 'WEBP', quality=q, method=6); data = buf.getvalue()
    # 新圖接在 BIN 最後面
    pad = (4 - len(B) % 4) % 4; B += b'\0' * pad; off = len(B); B += data
    J['bufferViews'].append({'buffer': 0, 'byteOffset': off, 'byteLength': len(data)})
    J['images'].append({'name': nm, 'mimeType': 'image/webp', 'bufferView': len(J['bufferViews']) - 1})
    J['textures'].append({'sampler': T.get('sampler', 0), 'extensions': {'EXT_texture_webp': {'source': len(J['images']) - 1}}})
    m['pbrMetallicRoughness']['baseColorTexture'] = {'index': len(J['textures']) - 1}
    # UV 改成鋪滿新圖
    nuv = 0
    for pr in me['primitives']:
        ai = pr['attributes']['TEXCOORD_0']
        for m2 in J['meshes']:
            if m2 is not me and any(ai in p2['attributes'].values() for p2 in m2['primitives']): sys.exit('TEXCOORD_0 accessor 共用')
        a = J['accessors'][ai]; bv2 = J['bufferViews'][a['bufferView']]
        assert a['componentType'] == 5126 and bv2.get('byteStride', 8) == 8
        U = np.frombuffer(B, np.float32, a['count'] * 2, bv2.get('byteOffset', 0) + a.get('byteOffset', 0)).reshape(-1, 2)
        if U[:, 0].min() < u0 - 1e-4 or U[:, 0].max() > u1 + 1e-4 or U[:, 1].min() < v0 - 1e-4 or U[:, 1].max() > v1 + 1e-4: sys.exit('UV 超出 --tile：%s～%s' % (U.min(0), U.max(0)))
        U[:, 0] = (U[:, 0] - u0) / (u1 - u0); U[:, 1] = (U[:, 1] - v0) / (v1 - v0); nuv += len(U)
        a['min'] = [float(x) for x in U.min(0)] if 'min' in a else a.get('min'); a['max'] = [float(x) for x in U.max(0)] if 'max' in a else a.get('max')
        if a.get('min') is None: a.pop('min', None)
        if a.get('max') is None: a.pop('max', None)
    J['buffers'][0]['byteLength'] = len(B)
    js = json.dumps(J, ensure_ascii=False, separators=(',', ':')).encode('utf-8'); js += b' ' * ((4 - len(js) % 4) % 4)
    bn = bytes(B) + b'\0' * ((4 - len(B) % 4) % 4)
    open(dst, 'wb').write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bn)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(bn), 0x004E4942) + bn)
    print('%s：材質 %s 改用新圖 %s（%d×%d，%d B）；板面線性亮度 %.3f → %.3f（×%.2f，暗於 %.2f 的不動：%.0f%% 像素）；UV %d 個鋪滿' % (
        nodes[0]['name'], m['name'], nm, box[2] - box[0], box[3] - box[1], len(data), before, after, gain, dark, 100 * (1 - mask.mean()), nuv))


if __name__ == '__main__':
    main()
