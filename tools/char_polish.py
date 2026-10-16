#!/usr/bin/env python3
"""人物精修（LAWWW2-B 2026-10-16；使用者 05:1x～05:2x「現有 3D 美術品質修復」）。

在 tools/vroid_build.py 建好的模型上，再做「局部」修正——不換模型、不改 vroid_build.py 本身的建置步驟：
  build = vroid_build.BUILDS[key]() → 這裡的 POLISH[key] → 存檔。

每一項修正都對著遊戲內截圖的具體問題（docs/art-rebuild/second_ai/POLISH.md 有修正前後的同鏡頭比較）：
  neck_shadow：脖子和臉一樣亮（臉像貼紙浮在脖子上）→ 下巴下面的脖子畫上柔和的陰影（和參考圖一樣的「下巴投影」）。
  under_chin：下巴底面（朝下的面）也壓暗，和脖子的陰影接起來。
  hair_tone：頭髮接近純黑、ACES 一壓就是一整塊沒有形狀的黑 → 改成參考圖的深棕黑、保留髮束明暗。

用法：python3 tools/char_polish.py vroid_yuting [--out <資料夾>]   （不給 --out 就覆蓋 assets/models/char/<key>.vrm）
"""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vroid_build as VB


def _prims(v, mesh_prefix, mat_pat):
    mats = v.j['materials']
    for m in v.j['meshes']:
        if not m['name'].startswith(mesh_prefix): continue
        for p in m['primitives']:
            if mat_pat in mats[p['material']]['name']: yield p


def _tex_of(v, p):
    return v.image_of_tex(v.vrm_mat(p['material'])['textureProperties']['_MainTex'])


def raster_weight(v, prims, size, fn):
    """把每個三角形畫到貼圖空間（UV），逐像素內插頂點的 位置／法向，呼叫 fn(P, N) 得到 0..1 的權重；同一個像素取最大值。"""
    W, H = size; out = np.zeros((H, W), np.float32)
    for p in prims:
        A = p['attributes']; P = v.acc(A['POSITION']).astype(np.float64); N = v.acc(A['NORMAL']).astype(np.float64)
        UV = v.acc(A['TEXCOORD_0']).astype(np.float64); T = v.acc(p['indices']).astype(np.int64).reshape(-1, 3)
        wv = fn(P, N)                                         # 先在頂點上算，挑出有權重的三角形
        for t in T[(wv[T] > 0).any(1)]:
            uv = UV[t] * [W, H]; x0, y0 = np.floor(uv.min(0)).astype(int); x1, y1 = np.ceil(uv.max(0)).astype(int)
            x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, W - 1), min(y1, H - 1)
            if x1 < x0 or y1 < y0: continue
            gx, gy = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
            (ax, ay), (bx, by), (cx, cy) = uv; d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
            if abs(d) < 1e-12: continue
            l0 = ((by - cy) * (gx - cx) + (cx - bx) * (gy - cy)) / d; l1 = ((cy - ay) * (gx - cx) + (ax - cx) * (gy - cy)) / d; l2 = 1 - l0 - l1
            ins = (l0 >= -0.02) & (l1 >= -0.02) & (l2 >= -0.02)
            if not ins.any(): continue
            L = np.stack([l0[ins], l1[ins], l2[ins]], 1)
            w = fn(L @ P[t], L @ N[t])
            yy, xx = (gy[ins] - 0.5).astype(int), (gx[ins] - 0.5).astype(int)
            out[yy, xx] = np.maximum(out[yy, xx], w)
    return out


def darken(v, ii, w, tint):
    """貼圖 ii 的 RGB 依權重 w 乘上 tint（陰影色：偏暖、偏紅的暗色，不是灰色）"""
    img = v.get_image(ii); a = np.asarray(img).astype(np.float64) / 255
    from scipy.ndimage import gaussian_filter
    w = gaussian_filter(w, 1.2)                               # 三角形邊界不要留下硬邊
    m = 1 - w[..., None] * (1 - np.array(tint)[None, None, :])
    a[..., :3] *= m
    v.set_image(ii, Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), 'RGBA'))


def neck_shadow(v, depth=0.075, strength=0.42, tint=(0.80, 0.62, 0.58), lift=0.012):
    """脖子：下巴下緣以下 depth 公尺內由深到淺（曲線 (1−t)^1.6），下巴以上（被臉蓋住的部分）全強度。"""
    fm = VB.face_marks(v); cy = fm['chin_y'] + lift
    def fn(P, N):
        t = np.clip((cy - P[:, 1]) / depth, 0, 1)
        near = (np.abs(P[:, 0]) < 0.11) & (P[:, 1] > cy - depth - 0.01) & (P[:, 1] < cy + 0.08)
        return np.where(near, strength * (1 - t) ** 1.6, 0.0)
    prims = list(_prims(v, 'Body', 'SKIN')); ii = _tex_of(v, prims[0]); size = v.get_image(ii).size
    w = raster_weight(v, prims, size, fn); darken(v, ii, w, tint)
    return float(w.max()), int((w > 0.02).sum()), round(cy, 4)


def under_chin(v, strength=0.35, tint=(0.82, 0.66, 0.62), band=0.014):
    """臉的網格最下面那一圈（下巴底面，接脖子的地方）：和脖子的陰影接起來。
    只看高度（下巴最低點往上 band 公尺內），不用法向——VRoid 的臉法向被調過，下巴正面的法向也朝下，用法向會把整個下巴前面塗暗（第一版的錯）。"""
    fm = VB.face_marks(v); cy = fm['chin_y']
    def fn(P, N):
        return strength * np.clip((cy + band - P[:, 1]) / band, 0, 1) ** 1.2
    prims = list(_prims(v, 'Face', 'Face_00_SKIN')); ii = _tex_of(v, prims[0]); size = v.get_image(ii).size
    w = raster_weight(v, prims, size, fn); darken(v, ii, w, tint)
    return float(w.max()), int((w > 0.02).sum())


def crew_neckline(v, top='Tops', drop=0.026, rise=0.04, rib=0.011, rib_k=0.86, x_lim=0.2, y_lo=None, vdepth=0.0, vwidth=0.9, top_rib=True, col_pct=50):
    """圓領（祐廷：遊戲截圖裡連帽衫拿掉帽子後，領口留下兩片三角翻領＋兩根往外的尖刺，肩膀露出一塊有硬邊的皮膚）：
    ①圓領線＝繞脖子根部一圈，前面最低（Neck 骨頭以下 drop＝胸骨上緣的凹處）、往後升高 rise（一般圓領 T／毛衣的形狀）；
    ②上衣在圓領線以上的三角形刪掉，剩下超過的頂點壓到圓領線上（剪口平滑，不留鋸齒）；
    ③身體皮膚在圓領線以下（軀幹、肩膀）塗成上衣的顏色——上衣和身體之間的縫、上衣剪掉的地方看起來都是布；
      圓領線下面 rib 公尺塗深一點（rib_k），看起來是羅紋領口。只改貼圖和頂點，不加網格。
    vdepth＞0＝V 領：正前方再往下 vdepth、往兩側（|φ| < vwidth 弧度）線性收回圓領線（沈以安的 V 領針織）。
    top_rib＝False：不改上衣自己的貼圖（有條紋的針織：塗一圈單色會變成一條髒的帶子——以安第一次試的錯）；
    col_pct：補在皮膚上的「布」用上衣貼圖亮度的第幾百分位（有條紋的布用 80，不然比看起來的顏色暗）。"""
    Wf, _ = VB.node_world(v)
    yN = next(float(Wf(i)[1, 3]) for i, n in enumerate(v.j['nodes']) if n.get('name', '').endswith('_Neck'))
    skin = list(_prims(v, 'Body', 'SKIN'))
    B = np.concatenate([v.acc(p['attributes']['POSITION']).astype(np.float64) for p in skin])
    nk = B[(np.abs(B[:, 1] - yN - 0.03) < 0.006) & (np.abs(B[:, 0]) < 0.1)]   # 脖子的中心：在 Neck 骨頭上面 3 cm 量（骨頭那個高度已經連到肩膀）
    cx, cz = (nk[:, 0].min() + nk[:, 0].max()) / 2, (nk[:, 2].min() + nk[:, 2].max()) / 2
    if y_lo is None: y_lo = yN - 0.16
    def ring(P):                                              # 臉朝 −z：φ=0 是正前方
        phi = np.arctan2(P[:, 0] - cx, -(P[:, 2] - cz))
        return yN - drop + rise * (1 - np.cos(phi)) / 2 - vdepth * np.clip(1 - np.abs(phi) / vwidth, 0, 1)
    nkill = nfix = 0
    for p in _prims(v, 'Body', top):
        P = v.acc(p['attributes']['POSITION']).astype(np.float32).copy(); T = v.acc(p['indices']).astype(np.int64).reshape(-1, 3)
        zone = (np.abs(P[:, 0]) < x_lim) & (P[:, 1] > y_lo); r = ring(P); above = zone & (P[:, 1] > r)
        kill = above[T].all(1); T = T[~kill]; nkill += int(kill.sum())
        used = np.zeros(len(P), bool); used[np.unique(T)] = True; fix = used & above; P[fix, 1] = r[fix]; nfix += int(fix.sum())
        p['indices'] = v.add_acc(T.reshape(-1).astype(np.uint32), 5125, 'SCALAR', 34963)
        p['attributes'] = dict(p['attributes'], POSITION=v.add_acc(P, 5126, 'VEC3', 34962, True))
    # 上衣顏色＝上衣貼圖的中位色
    tp = next(_prims(v, 'Body', top)); ti = v.get_image(_tex_of(v, tp)); a = np.asarray(ti).astype(np.float64) / 255
    px = a[a[..., 3] > 0.5][:, :3]; lum = px @ [0.299, 0.587, 0.114]
    col = px[np.abs(lum - np.percentile(lum, col_pct)) < 0.03].mean(0)
    ii = _tex_of(v, skin[0]); img = v.get_image(ii); size = img.size
    def fab(P, N):
        r = ring(P); return np.where((np.abs(P[:, 0]) < x_lim) & (P[:, 1] > y_lo) & (P[:, 1] < r), 1.0, 0.0)
    def rb(P, N):
        r = ring(P); return np.where((np.abs(P[:, 0]) < x_lim) & (P[:, 1] < r) & (P[:, 1] > r - rib), 1.0, 0.0)
    wf = raster_weight(v, skin, size, fab); wr = raster_weight(v, skin, size, rb)
    from scipy.ndimage import gaussian_filter
    wf = gaussian_filter(wf, 0.8); wr = gaussian_filter(wr, 0.8)
    b = np.asarray(img).astype(np.float64) / 255
    fabric = col[None, None, :] * (1 - wr[..., None] * (1 - rib_k))
    b[..., :3] = b[..., :3] * (1 - wf[..., None]) + fabric * wf[..., None]
    v.set_image(ii, Image.fromarray((np.clip(b, 0, 1) * 255).astype(np.uint8), 'RGBA'))
    if not top_rib:
        return dict(neck_y=round(yN, 4), killed=nkill, clamped=nfix, fabric_px=int((wf > 0.5).sum()), color=[round(float(c), 3) for c in col])
    # 上衣自己的領口那一圈（圓領線往下 band 公尺）：原本是帽口翻領的貼圖（深一點的灰、中間有 V 形接縫）→ 統一成羅紋色，往下漸變回原本的布
    tops = list(_prims(v, 'Body', top)); ti_i = _tex_of(v, tops[0]); timg = v.get_image(ti_i)
    band = 0.028
    def tb(P, N):
        r = ring(P); d = r - P[:, 1]
        return np.where((np.abs(P[:, 0]) < x_lim) & (d > -0.01) & (d < band), np.clip(1.6 - 1.6 * d / band, 0, 1), 0.0)
    wt = gaussian_filter(raster_weight(v, tops, timg.size, tb), 1.0)
    c = np.asarray(timg).astype(np.float64) / 255
    rib_col = col * rib_k
    c[..., :3] = c[..., :3] * (1 - wt[..., None]) + rib_col[None, None, :] * wt[..., None]
    v.set_image(ti_i, Image.fromarray((np.clip(c, 0, 1) * 255).astype(np.uint8), 'RGBA'))
    return dict(rib_px=int((wt > 0.5).sum()), neck_y=round(yN, 4), center=(round(cx, 3), round(cz, 3)), killed=nkill, clamped=nfix, fabric_px=int((wf > 0.5).sum()), color=[round(c, 3) for c in col])


def hair_tone(v, color, keep_detail=1.0, shade=None):
    VB.recolor_mat(v, 'HAIR', color, strength=1.0, keep_detail=keep_detail)
    if shade is not None:
        for i, m in enumerate(v.j['materials']):
            if 'HAIR' in m['name']: v.vrm_mat(i)['vectorProperties']['_ShadeColor'] = list(VB.hexrgb(shade)) + [1]


def fill_minmax(v):
    """POSITION 類的 accessor 補上 min/max（glTF 規定；遊戲裡的版本有，重建的沒有）"""
    for m in v.j['meshes']:
        for p in m['primitives']:
            for tg in [p['attributes']] + p.get('targets', []):
                ai = tg.get('POSITION')
                if ai is None: continue
                a = v.j['accessors'][ai]
                if 'min' not in a:
                    x = v.acc(ai); a['min'] = [float(q) for q in x.min(0)]; a['max'] = [float(q) for q in x.max(0)]


def polish_yuting(v):
    """祐廷（參考圖 02_yuting_character_sheet：深棕黑蓬鬆短髮、燕麥灰圓領毛衣、炭灰寬直筒褲、白球鞋、黑後背包）。
    遊戲截圖（2026-10-16 修改前）：頭髮純黑一整塊、領口兩片翻領＋尖刺、脖子和臉一樣亮、上衣偏冷的淺灰（近白）、褲子在 ACES 下是發亮的黑。"""
    VB.recolor_mat(v, 'Tops', '#c2baae', strength=0.9, keep_detail=0.55)     # 淺燕麥灰（p3 試 #b3a898／0.8：偏土黃、肩膀上原本貼圖的明暗變成髒污 → 淺一點、明暗收一點）
    VB.recolor_mat(v, 'Bottoms', '#58575a', strength=0.9, keep_detail=0.55)  # 炭灰；keep_detail 低＝貼圖畫的反光皺褶變淡（霧面西裝褲料，不像亮面）
    VB.flare(v, 'Bottoms', amount=0.035, start=0.18, straight=True)          # 參考圖是寬直筒褲（原本 flare 0.03 的小喇叭、褲管細）
    print('  polish yuting: crew_neckline', crew_neckline(v))
    print('  polish yuting: neck_shadow', neck_shadow(v, strength=0.5))
    print('  polish yuting: under_chin', under_chin(v, strength=0.4))
    hair_tone(v, '#2b2320', keep_detail=1.0, shade='#4a3c36')


def polish_heroine_01(v):
    """沈以安（參考圖 heroine_01_sheet、06：深棕高馬尾、米白 V 領針織、藍灰寬褲）。
    遊戲截圖（2026-10-16 修改前）：V 領兩側留著連帽衫帽口的翻領殘片、脖子和臉一樣亮。"""
    print('  polish heroine_01: v_neckline', crew_neckline(v, drop=0.018, rise=0.036, vdepth=0.05, vwidth=0.85, col_pct=80, rib_k=0.94))
    print('  polish heroine_01: neck_shadow', neck_shadow(v, strength=0.45))
    print('  polish heroine_01: under_chin', under_chin(v, strength=0.38))


POLISH = {'vroid_yuting': polish_yuting, 'vroid_heroine_01': polish_heroine_01}


if __name__ == '__main__':
    args = sys.argv[1:]; out = VB.OUT
    if '--out' in args:
        i = args.index('--out'); out = os.path.abspath(args[i + 1]); del args[i:i + 2]
    os.makedirs(out, exist_ok=True)
    for k in args:
        v = VB.BUILDS[k](); POLISH[k](v); fill_minmax(v)
        n = v.save(os.path.join(out, k + '.vrm')); print(k, round(n / 1e6, 2), 'MB →', out)
