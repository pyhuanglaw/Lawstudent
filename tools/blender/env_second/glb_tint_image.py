"""把 GLB 裡的一張顏色貼圖重新校正到另一個平均顏色（D112：深色木地板 → 淺色）：只換那一張圖，網格、材質、其他貼圖不動。
LAWWW2-C 2026-11-05（BB-C 11-05 01:39Z）：CC 的同弦店內（assets/models/env/second_ai/bb_support/tongxian.glb）木地板 laminate_floor_02 校正到 #c49c70（L* 67），
比遊戲裡其他淺色木地板深（溫州街店內 #cdb594 L* 75、總圖人字拼 #dcc39c L* 80），BB 看起來是「中間偏深的咖啡色」→ 改成 #d6bc96。
做法和 tools/blender/b3lib.py 的 img_adj(target＝) 一樣：Poly Haven 原圖（sRGB 值）每個像素乘上 目標色／原圖平均，紋路的明暗保留，平均＝目標色；
縮到 GLB 裡那張的大小、存 webp，名字的色碼跟著換（…_s1_g1_c49c70 → …_s1_g1_d6bc96）。沒有 --src 就拿 GLB 裡那張重新校正。
  python3 tools/blender/env_second/glb_tint_image.py 輸入.glb 輸出.glb 圖名 '#d6bc96' [--src Poly Haven 原圖.jpg] [--q 82]
不需要 Blender（numpy、Pillow）。"""
import io, re, sys
import numpy as np
from PIL import Image
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from glb_floor_hole import load, write   # noqa: E402


def lstar(rgb):
    c = np.asarray(rgb, float) / 255.0; c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92); Y = float(c @ [0.2126, 0.7152, 0.0722])
    return 116 * Y ** (1 / 3) - 16 if Y > 0.008856 else 903.3 * Y


def main():
    a = sys.argv[1:]; opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
    src, dst, name, target = a[0], a[1], a[2], a[3].lower()
    J, BIN = load(src)
    im = next((i for i in J['images'] if i.get('name') == name), None); assert im is not None, '找不到圖 ' + name
    bv = J['bufferViews'][im['bufferView']]; o = bv.get('byteOffset', 0)
    old = Image.open(io.BytesIO(bytes(BIN[o:o + bv['byteLength']]))).convert('RGB'); w, h = old.size
    base = Image.open(opt('--src')).convert('RGB') if opt('--src') else old
    px = np.asarray(base, np.float32) / 255.0; m = px.reshape(-1, 3).mean(0)
    t = np.array([int(target.lstrip('#')[i:i + 2], 16) / 255 for i in (0, 2, 4)], np.float32)
    px = np.clip(px * (t / np.maximum(m, 1e-3)), 0, 1)
    out = Image.fromarray((px * 255 + 0.5).astype(np.uint8))
    if out.size != (w, h): out = out.resize((w, h), Image.LANCZOS)
    buf = io.BytesIO(); out.save(buf, 'WEBP', quality=int(opt('--q', 82)), method=6); data = buf.getvalue()
    chk = np.asarray(Image.open(io.BytesIO(data)).convert('RGB'), np.float32).reshape(-1, 3).mean(0)
    while len(BIN) % 4: BIN.append(0)
    J['bufferViews'].append({'buffer': 0, 'byteOffset': len(BIN), 'byteLength': len(data)}); BIN += data
    im['bufferView'] = len(J['bufferViews']) - 1; im['mimeType'] = 'image/webp'
    new = re.sub(r'_[0-9a-f]{6}(?=(_|$))', '_' + target.lstrip('#'), name, count=1) if re.search(r'_[0-9a-f]{6}(?=(_|$))', name) else name + '_' + target.lstrip('#')
    im['name'] = new
    n = write(J, BIN, dst)
    om = np.asarray(old, np.float32).reshape(-1, 3).mean(0)
    print('wrote', dst, n, 'bytes；', name, '→', new, '；平均', om.round(1), '(L* %.1f)' % lstar(om), '→', chk.round(1), '(L* %.1f)' % lstar(chk), '目標', (t * 255).round(1), '；webp', bv['byteLength'], '→', len(data), 'bytes')


if __name__ == '__main__':
    main()
