"""把已經切好的立繪（cut_reference_portraits.py 的輸出）頭頂補完整：原本的裁切範圍上緣切到頭髮（頭頂是平的），
這裡用往上延伸的裁切範圍重新去背，但**照原本那一張的縮放與位置**貼回去，只換掉頭頂那一段（身體一個像素都不動）。
LAWWW2-B 2026-10-16：BB-B 驗收芷若表情時要求「neutral 的頭頂被裁平，從 date_warm 原圖重切（同構圖、只改頭頂）」——
同構圖很重要：8 張表情是疊在這張 neutral 的身體上，縮放、位置一變，切換表情時人會跳。
用法：python3 tools/portraits/recut_top.py <原圖> <x0,y0,x1,y1 原本的裁切> <新的 y0> <現在的 neutral.webp> <輸出> [--model isnet-anime] [--rows 140]
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

CW, CH, FILL, TOP = 600, 1000, 0.94, 0.04      # 和 cut_reference_portraits.py 相同


def cut(im, box, model):
    from rembg import new_session, remove
    crop = im.crop(box); rgba = np.array(remove(crop, session=new_session(model))).astype(np.float32); al = rgba[..., 3] / 255.0
    c0 = np.array(crop).astype(np.float32); bd = np.concatenate([c0[:3].reshape(-1, 3), c0[-3:].reshape(-1, 3), c0[:, :3].reshape(-1, 3), c0[:, -3:].reshape(-1, 3)]); bgc = np.median(bd, 0)
    lab, n = ndimage.label(al > 0.25)
    if n > 1:
        sizes = ndimage.sum(np.ones_like(al), lab, range(1, n + 1)); keep = ndimage.binary_dilation(lab == (1 + int(np.argmax(sizes))), iterations=2); al = al * keep
    a3 = np.clip(al, 1e-3, 1)[..., None]; fg = np.clip((c0 - (1 - a3) * bgc) / a3, 0, 255); edge = ((al > 0.02) & (al < 0.98))[..., None]
    rgba[..., :3] = np.where(edge, fg, c0); al = np.where(al < 0.06, 0, al); rgba[..., 3] = al * 255
    return rgba


def main():
    src, box, ny0, cur, out = sys.argv[1], tuple(map(int, sys.argv[2].split(','))), int(sys.argv[3]), sys.argv[4], sys.argv[5]
    model = sys.argv[sys.argv.index('--model') + 1] if '--model' in sys.argv else 'isnet-anime'
    rows = int(sys.argv[sys.argv.index('--rows') + 1]) if '--rows' in sys.argv else 140
    im = Image.open(src).convert('RGB'); x0, y0, x1, y1 = box; dy = y0 - ny0
    old = cut(im, box, model); new = cut(im, (x0, ny0, x1, y1), model)
    ys, xs = np.nonzero(old[..., 3] > 0.05 * 255); fy0, fy1, fx0, fx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1   # 原本那一張的人物範圍（裁切座標）
    s = CH * FILL / (fy1 - fy0); fw = max(1, round((fx1 - fx0) * s)); fh = round((fy1 - fy0) * s)
    if fw > CW * 0.98: s = CW * 0.98 / (fx1 - fx0); fw, fh = round((fx1 - fx0) * s), round((fy1 - fy0) * s)
    px, py = (CW - fw) // 2, round(CH * TOP)
    sx, sy = fw / (fx1 - fx0), fh / (fy1 - fy0)                    # resize 的實際比例
    # 新的去背結果（往上多 dy 列）照原本的轉換貼到畫布：canvas X = (x − fx0)·sx + px；canvas Y = (y_old − fy0)·sy + py，y_old = y_new − dy
    N = Image.fromarray(new.astype(np.uint8), 'RGBA'); ox = fx0; oy = fy0 + dy
    Wn = round(N.width * sx); Hn = round(N.height * sy)
    big = N.resize((Wn, Hn), Image.LANCZOS)
    can = Image.new('RGBA', (CW, CH), (0, 0, 0, 0)); can.paste(big, (round(px - ox * sx), round(py - oy * sy)), big)
    curI = Image.open(cur).convert('RGBA'); A = np.asarray(curI).astype(float); Bn = np.asarray(can).astype(float)
    # 檢查：頭頂以下（rows 以下）新貼的和現在的 neutral 應該幾乎一樣（同一個轉換）
    diff = np.abs(A[rows + 40:] - Bn[rows + 40:]).mean(); print('對齊檢查（頭頂以下的平均差，0～255）：%.2f' % diff)
    w = np.clip((rows - np.arange(CH)) / 20.0, 0, 1)[:, None, None]     # 第 rows−20 列以上全用新的、rows 以下全用舊的
    outA = Bn * w + A * (1 - w)
    Image.fromarray(outA.clip(0, 255).astype(np.uint8), 'RGBA').save(out, quality=92, method=6)
    ys2 = np.nonzero(outA[..., 3] > 12)[0]; print('頭頂：原本第 %d 列 → 現在第 %d 列' % (np.nonzero(A[..., 3] > 12)[0].min(), ys2.min()))


if __name__ == '__main__':
    main()
