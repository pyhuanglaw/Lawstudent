#!/usr/bin/env python3
"""頭髮「泡麵感」(b)：頭髮貼圖去掉每一束重複的細線（HAIR-NOODLE-1104 (b)，LAWWW2-B 2026-11-07；LAWWW-B 09:04 排在 (B) 之後）。
起因：使用者 11-04「人物的頭髮真的太像泡麵了」。(a) 法線 0.6 已經烘進六個 VRM（tools/hair_normals.py）；CC 的遊戲內四種做法裡，
  法線＋貼圖柔化最平順，但貼圖那時候只是整張模糊試方向（BB_259 第 3 項：要重畫）。
VRoid 的頭髮貼圖怎麼用：每一束頭髮的 UV 都是整張（或一條）貼圖——寬度方向＝橫跨一束、高度方向＝沿著一束往下。
  所以貼圖裡的每一條細黑線，每一束都有一份，整頭就是一根一根的麵。
這裡的做法（只動頭髮的底色貼圖；_MainTex 和 _ShadeTexture 是同一張，一起改）：
  - strip（一整張都是髮束的貼圖，例如 Hair_00_HAIR_01）：只沿寬度方向（x）模糊。細線、每一束邊緣的深色線變成一條平順的寬帶；
    沿著髮束往下的明暗（髮根暗、髮尾亮、VRoid 畫在同一個高度的高光帶）照留——每一束的高光帶在同一個高度，合起來還是整頭一圈。
    留一點點原本的層次（中頻 DETAIL），不要變成塑膠。
  - card（後髮片 HairBack：一張有透明度的頭髮輪廓）：只在不透明的範圍裡沿 x 模糊（用透明度加權，邊緣不會滲黑），透明度不動。
  - 其他頭髮貼圖（瀏海那種一塊一塊的 UV 排版 HAIR_02、03）不動：橫向模糊會把不同的 UV 島混在一起。
  - 解析度照原本：結果是平順的，放大只多吃記憶體（手機貼圖上限見 assets3d.js texCap）。
  - 不加高光、不加 matcap：之前 no_hair_shine 刻意拿掉頭髮的亮片（VRoid 的 emission 高光、matcap 亮邊），這裡不加回去。
遊戲不用改程式。用法：python3 tools/hair_texture.py --in <a.vrm> --out <b.vrm> [--sigma 0.045] [--detail 0.15] [--card-sigma 0.012]
  （同一個檔重跑會疊加：檔案的 asset.extras.hairTexture 記了參數，重跑前會擋下來）
"""
import os, sys, json, argparse
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vroid_build as VB


def blur_x(a, sigma):
    """沿 x（寬度）方向的高斯模糊，邊界照鏡像。a：H×W×C float"""
    if sigma <= 0: return a.copy()
    r = int(np.ceil(sigma * 3)); x = np.arange(-r, r + 1); k = np.exp(-0.5 * (x / sigma) ** 2); k /= k.sum()
    p = np.pad(a, ((0, 0), (r, r), (0, 0)), mode='reflect'); out = np.zeros_like(a)
    for i, w in enumerate(k): out += w * p[:, i:i + a.shape[1], :]
    return out


def blur_y(a, sigma):
    return np.transpose(blur_x(np.transpose(a, (1, 0, 2)), sigma), (1, 0, 2))


def strip(img, sigma=0.045, detail=0.15):
    """整張髮束貼圖：寬度方向抹平，留 detail 倍的中頻層次；高度方向只輕輕 1 px"""
    a = np.asarray(img.convert('RGBA'), dtype=np.float64) / 255.0; W = a.shape[1]; rgb = a[..., :3]
    base = blur_x(rgb, sigma * W); mid = blur_x(rgb, 0.008 * W)
    out = blur_y(base + detail * (mid - base), 1.0)
    a[..., :3] = np.clip(out, 0, 1)
    return Image.fromarray((a * 255 + 0.5).astype(np.uint8), 'RGBA').convert(img.mode)


def card(img, sigma=0.012, detail=0.25):
    """有透明度的髮片：不透明的範圍裡沿 x 模糊（透明度加權），透明度不動"""
    a = np.asarray(img.convert('RGBA'), dtype=np.float64) / 255.0; W = a.shape[1]; al = a[..., 3:4]; rgb = a[..., :3]
    def wb(s):
        num = blur_x(rgb * al, s * W); den = blur_x(al, s * W)
        return np.where(den > 1e-4, num / np.maximum(den, 1e-4), rgb)
    base = wb(sigma); mid = wb(0.003)
    out = base + detail * (mid - base)
    a[..., :3] = np.where(al > 0, np.clip(out, 0, 1), rgb)
    return Image.fromarray((a * 255 + 0.5).astype(np.uint8), 'RGBA').convert(img.mode)


def hair_images(v):
    """頭髮材質（名字有 HAIR）用的底色貼圖 → [(image index, 材質名, 模式)]；同一張圖只回一次"""
    j = v.j; mp = {m['name']: m for m in j['extensions']['VRM']['materialProperties']}; seen = {}; out = []
    for m in j['materials']:
        nm = m.get('name', '')
        if 'HAIR' not in nm.upper(): continue
        ti = (m.get('pbrMetallicRoughness') or {}).get('baseColorTexture', {}).get('index')
        tp = (mp.get(nm) or {}).get('textureProperties', {})
        if ti is None: continue
        ii = j['textures'][ti]['source']
        if ii in seen: continue
        mode = 'card' if 'HairBack' in nm else ('strip' if (nm.endswith('_HAIR') or nm.endswith('_HAIR_01')) and 'HairCard' not in nm else 'skip')
        if tp.get('_ShadeTexture') not in (None, tp.get('_MainTex')): mode = 'skip'   # 陰影貼圖是另一張：沒處理過的情況，不動
        seen[ii] = 1; out.append((ii, nm, mode))
    return out


def orig_mode(v, ii):
    import io
    return Image.open(io.BytesIO(v.views[v.j['images'][ii]['bufferView']])).mode


def apply(v, sigma, detail, card_sigma):
    ex = v.j['asset'].setdefault('extras', {})
    assert 'hairTexture' not in ex, '這個 VRM 的頭髮貼圖已經處理過（asset.extras.hairTexture），請從沒處理過的檔開始'
    done = []
    for ii, nm, mode in hair_images(v):
        if mode == 'skip': done.append({'image': ii, 'mat': nm, 'mode': 'skip'}); continue
        im = v.get_image(ii); new = strip(im, sigma, detail) if mode == 'strip' else card(im, card_sigma)
        if orig_mode(v, ii) == 'RGB': new = new.convert('RGB')   # 原本沒有透明度的照舊存 RGB
        fmt = 'JPEG' if v.j['images'][ii].get('mimeType') == 'image/jpeg' else 'PNG'   # 照原本的格式存（以安、語彤、子晴、學姊的髮束貼圖原本是 JPEG）
        v.set_image(ii, new, fmt); done.append({'image': ii, 'mat': nm, 'mode': mode, 'size': list(im.size), 'fmt': fmt})
    ex['hairTexture'] = {'sigma': sigma, 'detail': detail, 'cardSigma': card_sigma, 'by': 'tools/hair_texture.py (HAIR-NOODLE-1104 (b))'}
    return done


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--in', dest='inp', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--sigma', type=float, default=0.045); ap.add_argument('--detail', type=float, default=0.15); ap.add_argument('--card-sigma', type=float, default=0.012)
    ap.add_argument('--dump', help='把改前改後的頭髮貼圖存到這個資料夾（看用）')
    a = ap.parse_args()
    v = VB.VRM(a.inp); before = {ii: v.get_image(ii) for ii, _, m in hair_images(v) if m != 'skip'} if a.dump else {}
    res = apply(v, a.sigma, a.detail, a.card_sigma); print(json.dumps(res, ensure_ascii=False))
    if a.dump:
        os.makedirs(a.dump, exist_ok=True); tag = os.path.splitext(os.path.basename(a.inp))[0]
        for ii, im in before.items():
            im.save(os.path.join(a.dump, '%s_%d_before.png' % (tag, ii))); v.get_image(ii).save(os.path.join(a.dump, '%s_%d_after.png' % (tag, ii)))
    n = v.save(a.out); print('saved', a.out, round(n / 1e6, 2), 'MB')
