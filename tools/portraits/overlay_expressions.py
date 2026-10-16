"""把九格表情的頭疊到全身立繪（同一個角度）上 → assets/portraits/<id>/<outfit>/<expression>.webp。
LAWWW2-B 2026-10-16：BB-B 交付芷若九個表情（docs/story_planning/date_system/art/heroine_02_expr9.webp，3×3，BB 已驗收），
請疊到 campus 姿勢①（assets/portraits/heroine_02/campus/neutral.webp）身上；接不起來的不放、要說明。

做法（不重畫、不換臉：頭、頭髮、眼鏡、表情全部是使用者那張圖的原圖，只縮放、平移、微轉）：
1. 每一格去掉灰底（底色固定，用和底色的距離做柔和的去背）。
2. 對齊：用每一格的「眼睛＋眼鏡」那一塊，在全身圖的頭部附近找最像的位置（縮放 × 小角度 × 平移，正規化互相關），每一格各自找。
3. 疊上去：頭與頭髮整個換掉；下巴以下（脖子、領口）漸漸淡出，保留全身圖原本的脖子與衣服；全身圖舊的頭髮在新頭的範圍裡擦掉，避免兩層頭髮。
4. 每一格輸出對照圖（原本／疊好／差異），由人判斷接不接得起來。
用法：python3 tools/portraits/overlay_expressions.py [--id heroine_02|heroine_04|heroine_05] [--only smile,laugh] [--sheet <九格圖>] [--body <全身圖>] [--out <資料夾>]（預設輸出到 scratch，確認後再加 --write 寫進 assets/portraits/<id>/campus）
2026-10-16 起也做子晴（heroine_04）、學姊（heroine_05）：BB-B 交付 d69dd5f6，設定在 CFG。
"""
import argparse, os, sys
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
from skimage.feature import match_template

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ART = os.path.join(ROOT, 'docs/story_planning/date_system/art')
NAMES = ['smile', 'laugh', 'surprised', 'embarrassed', 'annoyed', 'sad', 'serious', 'tired', 'thinking']
# 每個人：九格表情圖、格子大小（寬、高）、全身立繪、格子裡「眼睛＋鼻子」的範圍、全身圖頭部附近的搜尋範圍、縮放範圍、下巴以下淡出的兩條線（格子座標）、不用的格子
# （BB-B 驗收：芷若、學姊的 thinking 那格手托下巴，不用；子晴九格都用）
CFG = {
    'heroine_02': dict(sheet='heroine_02_expr9.webp', cell=(418, 418), body='assets/portraits/heroine_02/campus/neutral.webp',
                       eye=(150, 120, 350, 255), search=(200, 40, 420, 230), scales=(0.44, 0.66), fade=(285, 330), skip=()),
    'heroine_01': dict(sheet='heroine_01_expr9.webp', cell=(437, 400), body='assets/portraits/heroine_01/campus/neutral.webp',
                       eye=(140, 150, 290, 240), search=(180, 20, 440, 240), scales=(0.22, 0.55), fade=(300, 335), skip=(), anchor=(110, 5, 330, 120)),
    'heroine_03': dict(sheet='heroine_03_expr9.webp', cell=(410, 426), body='assets/portraits/heroine_03/campus/neutral.webp',
                       eye=(140, 160, 295, 250), search=(180, 20, 440, 240), scales=(0.22, 0.55), fade=(305, 340), skip=(), anchor=(110, 5, 330, 130)),
    'classmate_peishan': dict(sheet='classmate_peishan_expr9.webp', cell=(437, 400), body='assets/portraits/classmate_peishan/campus/neutral.webp',
                       eye=(160, 150, 330, 235), search=(180, 20, 440, 240), scales=(0.22, 0.55), fade=(290, 325), skip=(), anchor=(120, 5, 350, 120)),
    'kexin': dict(sheet='kexin_expr9.webp', cell=(437, 400), body='assets/portraits/kexin/campus/neutral.webp',
                       eye=(165, 120, 310, 200), search=(180, 20, 440, 240), scales=(0.22, 0.55), fade=(255, 290), skip=(), anchor=(130, 5, 350, 100)),
    'heroine_04': dict(sheet='heroine_04_expr9.webp', cell=(512, 341), body='assets/portraits/heroine_04/campus/neutral.webp',
                       eye=(215, 115, 360, 205), search=(200, 20, 420, 230), scales=(0.22, 0.50), fade=(252, 282), skip=(),
                       anchor=(180, 5, 440, 110)),
    'heroine_05': dict(sheet='heroine_05_expr9.webp', cell=(437, 400), body='assets/portraits/heroine_05/campus/neutral.webp',
                       eye=(215, 140, 360, 240), search=(200, 20, 440, 230), scales=(0.22, 0.50), fade=(300, 335), skip=('thinking',),
                       anchor=(140, 5, 400, 150), face=(282, 212, 80, 82, 16)),
}
# anchor（子晴、學姊）：只用「眼睛最像」的那一格對到全身圖，其他格用頭頂＋耳朵（不隨表情變）對到那一格——閉眼、低頭的格子用眼睛對會跑掉（學姊 embarrassed 差 15 px）
# keep（學姊）：格子座標 x < 160、y > 215 是垂下來的馬尾 → 保留全身圖自己的馬尾（表情圖的馬尾在那裡淡出、全身圖那裡不擦），接在髮圈的位置
CW = CH = 418


def shift_to(ref, cimg, box, margin=40):
    """cimg 的 box 那一塊在 ref 裡的位置（只平移）：回傳 d，cimg 的點 p 對應 ref 的 p+d"""
    R = gray(ref); T = gray(cimg.crop(box)); x0, y0 = max(0, box[0] - margin), max(0, box[1] - margin)
    S = R[y0:min(R.shape[0], box[3] + margin), x0:min(R.shape[1], box[2] + margin)]
    res = match_template(S, T); k = np.unravel_index(np.argmax(res), res.shape)
    return np.array([x0 + k[1] - box[0], y0 + k[0] - box[1]], float), float(res[k])


def cell(sheet, i):
    r, c = divmod(i, 3); return sheet.crop((c * CW, r * CH, c * CW + CW, r * CH + CH))


def key_alpha(rgb, bg):
    """灰底去背：和底色的距離 < 10 全透明、> 34 不透明，中間線性"""
    a = np.asarray(rgb).astype(float); d = np.sqrt(((a - bg) ** 2).sum(axis=2))
    return np.clip((d - 10) / 24, 0, 1)


def gray(im): return np.asarray(im.convert('L')).astype(float) / 255


def find(body, cimg, eye_box, search_box, scales, angles):
    """cimg 的 eye_box（格子座標）縮放旋轉後在 body 的 search_box 裡找最像的地方；回傳 (score, s, ang, tx, ty)：格子座標 (x,y) → body 座標 s·R(ang)·(x,y)+(tx,ty)"""
    B = gray(body.convert('RGB').crop(search_box)); best = None
    for ang in angles:
        rc = cimg.rotate(ang, resample=Image.BICUBIC, center=((eye_box[0] + eye_box[2]) / 2, (eye_box[1] + eye_box[3]) / 2))
        patch = rc.crop(eye_box)
        for s in scales:
            w, h = max(8, round(patch.width * s)), max(8, round(patch.height * s))
            if w >= B.shape[1] or h >= B.shape[0]: continue
            T = gray(patch.resize((w, h), Image.LANCZOS))
            res = match_template(B, T); k = np.unravel_index(np.argmax(res), res.shape); sc = res[k]
            if best is None or sc > best[0]:
                best = (sc, s, ang, search_box[0] + k[1], search_box[1] + k[0], w, h)
    sc, s, ang, px, py, w, h = best
    # patch 左上角在 body 的 (px,py)；patch 中心＝旋轉中心 → body 座標
    cx, cy = (eye_box[0] + eye_box[2]) / 2, (eye_box[1] + eye_box[3]) / 2
    return dict(score=float(sc), s=s, ang=ang, cbx=px + w / 2, cby=py + h / 2, ccx=cx, ccy=cy)


def place(cimg_rgba, t, size):
    """格子（RGBA）照 t 轉到 body 座標（size＝body 尺寸）"""
    a = np.deg2rad(t['ang']); s = t['s']
    # PIL 的 rotate(ang) 是逆時針（影像座標 y 往下時是畫面上的逆時針）；先繞 (ccx,ccy) 轉、再縮放、再把 (ccx,ccy) 移到 (cbx,cby)
    # 反向映射：body (X,Y) → cell (x,y)：(x,y) = R(ang)^-1 … PIL 的 transform 用 AFFINE 係數 (a,b,c,d,e,f)：x = aX+bY+c
    ca, sa = np.cos(a), np.sin(a)
    # rotate(ang) 在影像座標（y 下）把點 p 繞中心 c 轉成 c + M(p-c)，M = [[cos, sin],[-sin, cos]]
    # body = cb + s·M·(p - cc) → p = cc + M^-1·(body - cb)/s，M^-1 = [[cos, -sin],[sin, cos]]
    A = np.array([[ca, -sa], [sa, ca]]) / s
    off = np.array([t['ccx'], t['ccy']]) - A @ np.array([t['cbx'], t['cby']])
    return cimg_rgba.transform(size, Image.AFFINE, (A[0, 0], A[0, 1], off[0], A[1, 0], A[1, 1], off[1]), resample=Image.BICUBIC)


def main():
    global CW, CH
    ap = argparse.ArgumentParser(); ap.add_argument('--id', default='heroine_02', choices=sorted(CFG)); ap.add_argument('--only'); ap.add_argument('--out', default='/tmp/expr_out'); ap.add_argument('--write', action='store_true')
    ap.add_argument('--sheet', help='九格表情圖（預設 docs/story_planning/date_system/art/<設定的檔名>）'); ap.add_argument('--body', help='全身立繪（預設 assets 裡的 campus/neutral；試疊時指定別的）')
    ap.add_argument('--fade0', type=float); ap.add_argument('--fade1', type=float)
    a = ap.parse_args(); os.makedirs(a.out, exist_ok=True); cf = CFG[a.id]; CW, CH = cf['cell']
    a.fade0 = cf['fade'][0] if a.fade0 is None else a.fade0; a.fade1 = cf['fade'][1] if a.fade1 is None else a.fade1
    sheet = Image.open(a.sheet or os.path.join(ART, cf['sheet'])).convert('RGB'); body = Image.open(a.body or os.path.join(ROOT, cf['body'])).convert('RGBA')
    bg = np.asarray(sheet).astype(float)[4, 4]
    eye_box = cf['eye']                                    # 格子裡「眼睛＋（眼鏡）＋鼻子」那一塊（九格大致同位置；每格自己對齊）
    search = cf['search']                                  # 全身圖頭部附近
    names = [n for n in (a.only.split(',') if a.only else NAMES) if n not in cf['skip']]
    report = []

    def fit(c):
        t = find(body, c, eye_box, search, scales=np.linspace(cf['scales'][0], cf['scales'][1], 23), angles=[-8, -6, -4, -2, 0, 2, 4, 6, 8])
        # 細調：在最佳附近再細一點
        return find(body, c, eye_box, search, scales=np.linspace(t['s'] - 0.012, t['s'] + 0.012, 9), angles=np.linspace(t['ang'] - 1.5, t['ang'] + 1.5, 7))
    ref = None
    if cf.get('anchor'):
        fits = {nm: fit(cell(sheet, i)) for i, nm in enumerate(NAMES) if nm not in cf['skip']}
        rn = max(fits, key=lambda n: fits[n]['score']); ref = (cell(sheet, NAMES.index(rn)), fits[rn]); print('anchor cell', rn, round(fits[rn]['score'], 3), flush=True)
    for i, nm in enumerate(NAMES):
        if nm not in names: continue
        c = cell(sheet, i)
        if ref is None: t = fit(c)
        else:
            d, sc = shift_to(ref[0], c, cf['anchor']); t = dict(ref[1]); t['ccx'] -= d[0]; t['ccy'] -= d[1]; t['score'] = sc
        al = key_alpha(c, bg); bgl = bg
        if cf.get('anchor'):                                              # 灰底不是完全均勻：用「附近的背景色」重新去背、去邊（不然髮絲外緣留一圈灰，紅底上很明顯）
            from scipy import ndimage as _nd
            c0 = np.asarray(c).astype(float); m_bg = (al < 0.05).astype(float)
            num = np.dstack([_nd.gaussian_filter(c0[..., k] * m_bg, 18) for k in range(3)]); den = _nd.gaussian_filter(m_bg, 18)[..., None]
            bgl = np.where(den > 0.02, num / np.maximum(den, 1e-6), bg)
            al = np.clip((np.sqrt(((c0 - bgl) ** 2).sum(axis=2)) - 10) / 24, 0, 1)
        if cf.get('anchor'):                                              # 眼白和灰底顏色接近、被當成背景：四周都是人物的小洞（< 600 px）補回不透明（髮絲和脖子中間的大空隙不補）
            from scipy import ndimage as _nd
            m0 = al > 0.5; hl, _n = _nd.label(_nd.binary_fill_holes(m0) & ~m0)
            lumc = np.asarray(c.convert('L')).astype(float)
            for k, sl in enumerate(_nd.find_objects(hl), 1):
                if sl is None or int((hl[sl] == k).sum()) >= 600: continue
                hk = hl == k; ring = _nd.binary_dilation(hk, iterations=3) & ~hk & (al > 0.9)
                if ring.any() and lumc[ring].mean() > 100: al = np.where(_nd.binary_dilation(hk, iterations=1), 1.0, al)   # 眼白：周圍是皮膚、睫毛（亮）；髮絲之間的空隙周圍是頭髮（暗）→ 不補
        # 邊緣去灰：半透明的頭髮邊緣混到灰底的顏色 → 還原成頭髮本身的顏色 c = (obs − (1−α)·bg)/α
        cr = np.asarray(c).astype(float); m = (al > 0.02) & (al < 1)
        bgm = bgl[m] if np.ndim(bgl) == 3 else bg
        cr[m] = np.clip((cr[m] - (1 - al[m])[:, None] * bgm) / al[m][:, None], 0, 255)
        # 白點（BB-B 驗收時指出 laugh、serious、tired 左側髮絲外緣）：細髮絲邊緣還帶著淺灰底 → 透明交界 3 px 內、低彩度（灰白）又偏亮的像素拿掉
        # （膚色是暖色、彩度高，右邊的臉頰下巴不會被清到）；再只留最大的一塊（浮在外面的小點）
        from scipy import ndimage
        band = ndimage.binary_dilation(al < 0.1, iterations=4 if cf.get('anchor') else 3) & (al > 0)
        sat = cr.max(axis=2) - cr.min(axis=2); lum = cr @ np.array([0.299, 0.587, 0.114])
        al = np.where(band & (sat < 28) & (lum > 115), 0, al)
        if cf.get('anchor'):                                              # AI 圖在頭髮外面畫了一圈比灰底還亮的光暈（亮、沒有顏色）：和外面連在一起的那一片全部當背景（眼白被睫毛、皮膚包著，不會連到外面）
            lt = (lum > 140) & (sat < 30); ext = al < 0.1
            lb, _n = ndimage.label(lt | ext); touch = np.unique(lb[ext]); al = np.where(lt & np.isin(lb, touch[touch > 0]), 0, al)
        lab, n = ndimage.label(al > 0.2)
        if n > 1:
            sz = ndimage.sum(np.ones_like(al), lab, range(1, n + 1)); al = al * ndimage.binary_dilation(lab == 1 + int(np.argmax(sz)), iterations=1)
        ys = np.arange(CH)[:, None] * np.ones((1, CW)); xs = np.arange(CW)[None, :] * np.ones((CH, 1))
        fade = np.clip((a.fade1 - ys) / (a.fade1 - a.fade0), 0, 1)       # 下巴以下淡出
        kp = np.zeros((CH, CW))
        if cf.get('keep'):                                                 # 馬尾留全身圖的（格子座標，跟著這一格的位移）
            kx, ky, ks = cf['keep']; dd = (np.array([ref[1]['ccx'], ref[1]['ccy']]) - np.array([t['ccx'], t['ccy']])) if ref else np.zeros(2)   # 這一格相對 anchor 格的位移 d
            kp = np.clip((kx - dd[0] - xs) / ks, 0, 1) * np.clip((ys - (ky - dd[1])) / ks, 0, 1)
            fade = fade * (1 - kp)
        if cf.get('face'):                                                # 只換臉（眉毛到下巴的橢圓、柔邊）：頭髮、耳朵、下巴輪廓、馬尾都留全身圖的
            fx, fy, rx, ry, fs = cf['face']; dd = (np.array([ref[1]['ccx'], ref[1]['ccy']]) - np.array([t['ccx'], t['ccy']])) if ref else np.zeros(2)
            r = np.sqrt(((xs - (fx - dd[0])) / rx) ** 2 + ((ys - (fy - dd[1])) / ry) ** 2)
            fade = np.clip((1 - r) * min(rx, ry) / fs, 0, 1); kp = np.ones((CH, CW))
        head = np.dstack([cr.astype(np.uint8), (al * fade * 255).astype(np.uint8)])
        H = place(Image.fromarray(head, 'RGBA'), t, body.size)
        # 全身圖舊的頭（在新頭範圍裡、淡出線以上）擦掉：用新頭不淡出的輪廓（稍微放大）當範圍
        zone = np.dstack([np.zeros((CH, CW, 3), np.uint8), ((ys < a.fade0) * (1 - kp) * 255).astype(np.uint8)])
        Z = np.asarray(place(Image.fromarray(zone, 'RGBA'), t, body.size))[..., 3].astype(float) / 255
        Hn = np.asarray(H).astype(float) / 255
        B = np.asarray(body).astype(float) / 255
        Bal = np.where(Z > 0, B[..., 3] * (1 - Z), B[..., 3])      # 新頭範圍裡（淡出線以上）舊的頭、頭髮整個擦掉
        # 淡出帶（髮尾那一段）：全身圖原本髮尾外緣有一圈半透明的灰邊，新頭的位置稍微不同就會露出來 → 淡出帶裡半透明（< 0.85）的舊像素擦掉
        band = np.dstack([np.zeros((CH, CW, 3), np.uint8), (((ys >= a.fade0 - 10) & (ys < a.fade1 + 25) & (kp < 0.5)) * 255).astype(np.uint8)])
        Bd = np.asarray(place(Image.fromarray(band, 'RGBA'), t, body.size))[..., 3] > 127
        Bal = np.where(Bd & (Bal < 0.85), 0, Bal)
        # 淡出帶裡、全身圖原本透明的地方：表情圖的肩膀與衣服（比全身圖高）會淡淡透出一道弧線 → 那裡只留深色的頭髮
        lum = Hn[..., :3] @ np.array([0.299, 0.587, 0.114])
        Hn[..., 3] = np.where(Bd & (B[..., 3] < 0.5) & (lum > 0.42), 0, Hn[..., 3])
        # 合成（新頭在上）
        oa = Hn[..., 3] + Bal * (1 - Hn[..., 3])
        rgb = (Hn[..., :3] * Hn[..., 3:4] + B[..., :3] * (Bal * (1 - Hn[..., 3]))[..., None]) / np.maximum(oa, 1e-6)[..., None]
        out = Image.fromarray(np.dstack([rgb * 255, oa * 255]).clip(0, 255).astype(np.uint8), 'RGBA')
        out.save(os.path.join(a.out, nm + '.png'))
        # 對照：原本／疊好（頭部放大）
        box = (130, 0, 470, 330); sh = Image.new('RGB', (680 * 2 + 20, 660), (255, 255, 255))
        for k, im in enumerate((body, out)):
            bgw = Image.new('RGBA', im.size, (255, 255, 255, 255)); bgw.alpha_composite(im); sh.paste(bgw.crop(box).resize((680, 660)).convert('RGB'), (k * 700, 0))
        sh.save(os.path.join(a.out, 'cmp_' + nm + '.png'))
        report.append((nm, round(t['score'], 3), round(t['s'], 3), round(t['ang'], 2), round(t['cbx'], 1), round(t['cby'], 1)))
        print(report[-1], flush=True)
        if a.write:
            d = os.path.join(ROOT, 'assets/portraits', a.id, 'campus'); out.save(os.path.join(d, nm + '.webp'), quality=92, method=6)


if __name__ == '__main__':
    main()
