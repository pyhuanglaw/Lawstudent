"""溫州街招牌貼圖集（ART-WZ0／WZ2，LAWWW2-B 2026-10-16）。
來源：使用者生成、BB-B 逐字核對通過的招牌設計圖（docs/story_planning/signs_approved/，BB-B 分支；複製在 textures/signs_src/）。
每張圖是灰底上的一塊橫招牌（有的還有一塊直立招牌）：
  ①自動切出招牌（和灰底的色差＋飽和度 → 連通區域）；
  ②橫招牌比例不夠長（生成工具只做得到約 5:1，遊戲裡的板面約 7:1）：照 BB-B 的要求「延長底板、字不要拉長」——
    找字左右兩側沒有字的底板區段（每一欄的亮度變化很小），把那兩段各拉寬一半的差額，字維持在中間；
  ③全部排進一張 2048×2048 的貼圖集，寫出每一塊的 UV、長寬比、晚上亮不亮（燈箱）。
輸出：textures/gen/wz_signs_atlas.jpg、wz_signs_atlas.json（wz_shopkit.py 讀）。
用法：python3 tools/blender/env_second/sign_atlas.py"""
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, 'textures', 'signs_src'); GEN = os.path.join(HERE, 'textures', 'gen')
# 鍵：(來源檔, 哪一塊 'h' 橫／'v' 直／'lantern'／'plaque'／'decal'，目標長寬比（橫招牌）或 None，晚上亮不亮)
T = 6.8          # 一般店面：板面寬 6.5 m 左右，高約 0.95 m
T5 = 5.6         # B5 騎樓兩間：寬 5.2 m
SIGNS = {
    'ade_print_h': ('ade_print', 'h', T, True), 'ade_print_v': ('ade_print', 'v', None, True),
    'azhong_fruit_h': ('azhong_fruit', 'h', T, True),
    'banshu_h': ('banshu', 'h', T, False),
    'laundry_h': ('laundry', 'h', 6.0, True),
    'lin_noodle_h': ('lin_noodle', 'h', T, True), 'lin_noodle_v': ('lin_noodle', 'v', None, True),
    'riri_mart_h': ('riri_mart', 'h', 5.9, True),          # 原本就 5.9:1，不拉（24H 在最右邊，拉了會變形）
    'summer_ice_h': ('summer_ice', 'h', T5, False), 'summer_ice_v': ('summer_ice', 'v', None, False),
    'xiangkou_books_h': ('xiangkou_books', 'h', T, False), 'xiangkou_books_v': ('xiangkou_books', 'v', None, False),
    'xiangkou_tea_h': ('xiangkou_tea', 'h', T5, True),
    'xiangzi_teishoku_h': ('xiangzi_teishoku', 'h', T, False), 'xiangzi_teishoku_v': ('xiangzi_teishoku', 'v', None, False),
    'xiaoshubao_decal': ('xiaoshubao', 'decal', None, False), 'xiaoshubao_v': ('xiaoshubao', 'v', None, False),
    'yizhan_lantern': ('yizhan_lantern', 'lantern', None, True), 'yizhan_plaque': ('yizhan_lantern', 'plaque', None, False),
}
# 公館（--set gongguan → gg_signs_atlas.*）：BB-B 補好比例的 _fit 版（6.50×0.64 m 橫、0.74×2.60 m 直），整張用、不切不拉（BB-B 00:08 通過 S1～S4，00:1x、00:2x 再通過兩家）
GG = {'riri_mart_h': ('riri_mart', 'h', 5.9, True),
      'gg_laundry_h': ('laundry', 'h', 10.16, True)}   # 自助洗衣沿用溫州街那張（BB-B：同一家連鎖），延長底板到公館的 10.16:1
for _n, _lit in (('afeng', False), ('jiulu', False), ('yaoju', True), ('lunzhuan', False), ('yingyin', True), ('ririteishoku', False)):
    GG[f'gg_{_n}_h'] = (f'gg_{_n}_h_fit', 'full_h', None, _lit); GG[f'gg_{_n}_v'] = (f'gg_{_n}_v_fit', 'full_v', None, _lit)
# 第二批（BB-B bc9e0f58，2026-10-17 01:3x 全部通過）：一樓橫招牌 9 家、二樓大招牌 5 塊＋屋頂看板（實際高度 m）、樓上住戶的直立招牌 8 塊
# 晚上亮不亮：燈箱（壓克力、白底發光）亮；木板、鐵板、黑鐵框酒紅底不亮；二手唱片＝霓虹（'neon'：只有字和霓虹線條亮，BB-B 要求做遮罩）
for _n, _lit in (('qingye', False), ('luwei', True), ('kafei', False), ('shuiguo', True), ('changpian', 'neon'), ('wenju', True), ('brunch', True), ('douhua', False)):
    GG[f'gg_{_n}_h'] = (f'gg_{_n}_h_fit', 'full_h', None, _lit)
for _n, _h, _lit in (('wenli', 2.45, True), ('huoguo', 2.45, True), ('boardgame', 2.45, True), ('dental', 2.45, True), ('english', 2.45, True)):
    GG[f'gg_{_n}_2f'] = (f'gg_{_n}_2f_fit', 'full_2f', _h, _lit)
GG['gg_rent_roof'] = ('gg_rent_roof_fit', 'full_2f', 2.4, False)   # 屋頂看板：白色鐵板，不是燈箱
for _n in ('meifa', 'zhongyi', 'minsu', 'math', 'massage', 'gym', 'billiard', 'piano'):
    GG[f'gg_{_n}_v'] = (f'gg_{_n}_v_fit', 'full_v', None, True)
# 公館的貼圖集 2048×4096（36 塊；2048×2048 只放得下一樓橫招牌）：一樓橫招牌 140 px 高（0.64 m，每公尺 219 px）、直立 138 px 寬（0.74 m，14 塊排成一列）、二樓／屋頂每公尺 100 px
GG_OPT = dict(size=(2048, 4096), hf=140, vf=138, hh=140, pxm=100, emit=True)
HH = 156      # 橫招牌在貼圖集裡的高度（px）：6.5 m 寬的板面約 1060 px（每公尺 160 px）
VW = 72       # 直立招牌的寬度


def boxes(a):
    bg = np.concatenate([a[:, :8], a[:, -8:]], 1).mean(1, keepdims=True)
    m = (np.abs(a - bg).max(2) > 18) | ((a.max(2) - a.min(2)) > 22)
    m = ndimage.binary_closing(m, iterations=4); m = ndimage.binary_fill_holes(m); m = ndimage.binary_opening(m, iterations=2)
    lab, n = ndimage.label(m)
    out = [(s[1].start, s[0].start, s[1].stop, s[0].stop) for s in ndimage.find_objects(lab) if (s[1].stop - s[1].start) * (s[0].stop - s[0].start) > 4000]
    return sorted(out, key=lambda b: -(b[2] - b[0]) * (b[3] - b[1]))


def crop(im, b, inset=2): return im.crop((b[0] + inset, b[1] + inset, b[2] - inset, b[3] - inset))


def extend(im, target):
    """把字（和圖示）左右兩側、外框以內的底板拉寬，讓長寬比到 target。只拉「字的範圍以外」：
    字和字之間的空隙也是沒有變化的欄，拉那裡會把一個詞拆開（第一版「阿德影Ｅ印」就是這樣）"""
    w, h = im.size; tw = int(round(target * h))
    if tw <= w: return im
    a = np.asarray(im.convert('L')).astype(np.float32); inner = a[int(h * 0.15):int(h * 0.85)]
    sd = ndimage.uniform_filter1d(inner.std(0), 5)
    lo, hi = int(w * 0.03), int(w * 0.97)                                           # 外框
    base = np.percentile(sd[lo:hi], 20); busy = sd > base * 1.8 + 4.0              # 有字、有圖的欄
    cols = np.where(busy[lo:hi])[0] + lo; c0, c1 = (cols.min(), cols.max()) if len(cols) else (w // 2, w // 2)
    gl = (lo, max(lo + 3, c0 - 4)); gr = (min(hi - 3, c1 + 4), hi)                 # 字左邊、右邊的空底板
    E = tw - w; el = E // 2; er = E - el
    pieces = [(0, gl[0], None), (gl[0], gl[1], gl[1] - gl[0] + el), (gl[1], gr[0], None), (gr[0], gr[1], gr[1] - gr[0] + er), (gr[1], w, None)]
    out = Image.new('RGB', (tw, h)); x = 0
    for (x0, x1, nw) in pieces:
        if x1 <= x0: continue
        p = im.crop((x0, 0, x1, h))
        if nw: p = p.resize((nw, h), Image.LANCZOS)
        out.paste(p, (x, 0)); x += p.size[0]
    return out


def neon_mask(im):
    """霓虹招牌晚上只有燈管亮：亮的暖白字、紅色霓虹線條、星星留著，黑底和固定夾是黑的"""
    a = np.asarray(im).astype(np.float32); lum = a.mean(2); sat = a.max(2) - a.min(2)
    m = (lum > 140) | ((sat > 90) & (a.max(2) > 140))
    m = ndimage.binary_dilation(m, iterations=1)
    return Image.fromarray((a * m[..., None]).astype(np.uint8))


def main(SIGNS=SIGNS, NAME='wz_signs_atlas', size=(2048, 2048), hf=170, vf=200, hh=None, pxm=100, emit=False):
    global HH
    if hh: HH = hh
    items = {}
    for key, (fn, part, target, lit) in SIGNS.items():
        im = Image.open(os.path.join(SRC, fn + '.webp')).convert('RGB')
        if part == 'full_h': items[key] = dict(img=im.resize((int(im.size[0] * hf / im.size[1]), hf), Image.LANCZOS), lit=lit, part='h'); continue
        if part == 'full_v': items[key] = dict(img=im.resize((vf, int(im.size[1] * vf / im.size[0])), Image.LANCZOS), lit=lit, part='v'); continue
        if part == 'full_2f': hp = int(round(target * pxm)); items[key] = dict(img=im.resize((int(im.size[0] * hp / im.size[1]), hp), Image.LANCZOS), lit=lit, part='2f'); continue
        a = np.asarray(im).astype(np.float32); bs = boxes(a)
        if part == 'h': b = max(bs, key=lambda b: (b[2] - b[0]) / (b[3] - b[1])); c = extend(crop(im, b), target); c = c.resize((int(c.size[0] * HH / c.size[1]), HH), Image.LANCZOS)
        elif part == 'decal':                                                       # 課輔班的窗貼：只取有顏色的字和書包那一塊（含一點玻璃）
            b = max(bs, key=lambda b: (b[2] - b[0]) / (b[3] - b[1])); c0 = crop(im, b, 6); ca = np.asarray(c0).astype(np.float32); sat = ca.max(2) - ca.min(2)
            ys, xs = np.where(ndimage.binary_opening(sat > 40, iterations=1)); pad = 18   # 綠色字的飽和度比較低：門檻 40（70 會切掉「兒童課輔」）
            c = c0.crop((max(0, xs.min() - pad), max(0, ys.min() - pad), min(c0.size[0], xs.max() + pad), min(c0.size[1], ys.max() + pad)))
            c = c.resize((int(c.size[0] * HH / c.size[1]), HH), Image.LANCZOS)
        elif part in ('v', 'plaque'):
            vs = [b for b in bs if (b[3] - b[1]) > (b[2] - b[0]) * 1.4]; b = min(vs, key=lambda b: (b[2] - b[0]) / (b[3] - b[1])) if part == 'plaque' else max(vs, key=lambda b: (b[3] - b[1]))
            if part == 'v' and fn == 'yizhan_lantern': continue
            c = crop(im, b); c = c.resize((VW, int(c.size[1] * VW / c.size[0])), Image.LANCZOS)
        else:                                                                         # 燈籠
            vs = sorted(bs, key=lambda b: -(b[2] - b[0])); b = vs[0]; c = crop(im, b, 1); c = c.resize((200, int(c.size[1] * 200 / c.size[0])), Image.LANCZOS)
        items[key] = dict(img=c, lit=lit, part=part)
    # 貼圖集（2048×2048）：貨架式排法——依高度由高到低，放進第一個高度夠、寬度也夠的列，不然開新列
    S, SH = size; atlas = Image.new('RGB', (S, SH), (200, 200, 200)); meta = {}; pad = 6; rows = []
    for k in sorted(items, key=lambda k: (-items[k]['img'].size[1], -items[k]['img'].size[0])):
        im = items[k]['img']; w, h = im.size
        row = next((r for r in rows if h <= r['h'] and r['x'] + w + pad <= S), None)
        if row is None:
            y = rows[-1]['y'] + rows[-1]['h'] + pad if rows else pad; row = dict(y=y, h=h, x=pad); rows.append(row)
        atlas.paste(im, (row['x'], row['y'])); meta[k] = (row['x'], row['y'], w, h); row['x'] += w + pad
    bottom = max(r['y'] + r['h'] for r in rows)   # 最下面一列的下緣（原本用迴圈變數 y 檢查，迴圈裡被覆蓋成最後一塊的 y：放不下時也會通過）
    out = {}
    for k, (x, y, w, h) in meta.items():
        out[k] = dict(uv=[(x + 1) / S, 1 - (y + h - 1) / SH, (x + w - 1) / S, 1 - (y + 1) / SH], aspect=round(w / h, 4), lit=bool(items[k]['lit']), part=items[k]['part'])
    assert bottom <= SH, ('貼圖集放不下', bottom)
    atlas.save(os.path.join(GEN, NAME + '.jpg'), quality=90 if SH <= 2048 else 86)
    if emit:   # 晚上發光的貼圖（emissiveTexture，同一個排法、一半解析度）：燈箱整塊、霓虹只有燈管，其他黑的
        em = Image.new('RGB', (S, SH), (0, 0, 0))
        for k, (x, y, w, h) in meta.items():
            lit = items[k]['lit']
            if lit == 'neon': em.paste(neon_mask(items[k]['img']), (x, y))
            elif lit: em.paste(items[k]['img'], (x, y))
        em.resize((S // 2, SH // 2), Image.LANCZOS).save(os.path.join(GEN, NAME + '_emit.jpg'), quality=85)
    json.dump(out, open(os.path.join(GEN, NAME + '.json'), 'w'), indent=1, ensure_ascii=False)
    print('saved atlas', len(out), 'items; used height', bottom, 'of', SH)


if __name__ == '__main__':
    import sys
    if '--set' in sys.argv and sys.argv[sys.argv.index('--set') + 1] == 'gongguan': main(GG, 'gg_signs_atlas', **GG_OPT)
    else: main()
