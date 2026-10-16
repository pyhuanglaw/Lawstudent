"""對話立繪（ADV）：從 BB 驗收過的標準圖切出正面全身、去背（LAWWW2-B 2026-10-16；BB_131 第 3 節，使用者 P0「對話立繪全部換成 10/14 確認的人物圖」）。
**不重畫、不重新生成**：只裁切標準圖上那一個正面全身、去背、放進同樣大小的透明畫布（同構圖、同頭部位置：頭頂留 4%，全身高佔畫布 94%）。
去背：rembg（MIT；模型在 ~/.rembg，不放進 repo）。插畫風的人用 isnet-anime；半寫實的五位女主角、可昕用 u2net（isnet-anime 會把她們整個判成背景）。
只留最大的一塊（裁切範圍裡旁邊人物的手、字、細節格的邊被切掉）；邊緣半透明的像素去掉背景色（不然淺色背景會留一圈白邊）。
來源（都要是 BB 驗收過的版本，見 BB_116 第 10～13 節、BB_131 第 1 節）：
  五位女主角：docs/art-rebuild/references/heroine_sheets/heroine_0X_sheet.webp（使用者 2026-10-16 提供的 06 標準圖單人大圖）
  其他人：企劃線 docs/story_planning/art_reference/<id>.webp（--ref 指定資料夾）
  芷若平常（campus）：企劃線 date_system/art/heroine_02_date_warm.webp 姿勢①（--date 指定資料夾；BB-B 驗收時指定）；圍裙版放 cafe
用法：python3 tools/portraits/cut_reference_portraits.py --ref <art_reference 資料夾> --out <輸出資料夾> [--only id,id]
輸出：<out>/<遊戲 id>/campus/neutral.webp（600×1000，透明）＋ <out>/_contact.png（全部並排，給 BB 對照）"""
import argparse, os
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HS = os.path.join(ROOT, 'docs/art-rebuild/references/heroine_sheets')
# 遊戲 id → (來源, 正面全身的裁切範圍 x0,y0,x1,y1（原圖像素，含一點邊）)
SRC = {
    'heroine_01': ('H:heroine_01_sheet.webp', (322, 0, 480, 532)),
    'heroine_02': ('D:heroine_02_date_warm.webp', (60, 20, 362, 992)),          # BB-B 驗收（BB_131 第 5 節）：芷若平常用約會圖 heroine_02_date_warm 的姿勢①（左邊站姿）
    'heroine_02@cafe': ('H:heroine_02_sheet.webp', (322, 0, 480, 538)),         # 圍裙版＝Café 當班（heroine_02/cafe/neutral）
    'heroine_03': ('H:heroine_03_sheet.webp', (320, 0, 462, 532)),
    'heroine_04': ('H:heroine_04_sheet.webp', (320, 0, 472, 532)),
    'heroine_05': ('H:heroine_05_sheet.webp', (320, 0, 462, 532)),
    'heroine_05@campus_v2': ('D:heroine_05_date_shirt.webp', (30, 0, 385, 975)),   # 試疊用（BB-B 2026-10-16 建議：學姊對話立繪比照芷若換成約會圖姿勢①，表情頭才對得上；BB-B 驗收前不寫進 assets）
    'kexin': ('R:kexin.webp', (358, 120, 544, 636)),
    'classmate_peishan': ('R:classmate_peishan.webp', (405, 80, 600, 695)),
    'zhe': ('R:zhe.webp', (572, 8, 800, 714)),
    'yu': ('R:yu.webp', (472, 12, 702, 682)),
    'classmate_bohan': ('R:classmate_bohan.webp', (680, 4, 902, 708)),
    'classmate_xinci': ('R:classmate_xinci.webp', (10, 375, 172, 882)),
    'classmate_mingxuan': ('R:classmate_mingxuan.webp', (6, 372, 184, 898)),
    'classmate_youchen': ('R:classmate_youchen.webp', (24, 528, 292, 1168)),
    'kai': ('R:kai.webp', (88, 598, 312, 1312)),
    'npc_fangyt': ('R:npc_fangyt.webp', (22, 368, 182, 810)),
    'npc_huangxh': ('R:npc_huangxh.webp', (18, 372, 172, 810)),
    'prof_zhou': ('R:prof_zhou.webp', (28, 452, 342, 1262)),
    'prof_lin': ('R:prof_lin.webp', (10, 276, 162, 788)),
    'prof_huang': ('R:prof_huang.webp', (33, 393, 322, 1133)),
    # 經濟系大一、政大的予樂（BB_131 第 1 節也列了，遊戲 id 由 LAWWW-B 決定；先用檔名）
    'weilun': ('R:weilun.webp', (52, 460, 308, 1084)),
    'pinyu': ('R:pinyu.webp', (10, 323, 172, 768)),
    'xun': ('R:xun.webp', (52, 503, 302, 1142)),
    'tangrui': ('R:tangrui.webp', (10, 348, 180, 814)),
    'jiahao': ('R:jiahao.webp', (48, 548, 302, 1208)),
    'yule': ('R:yule.webp', (18, 368, 180, 810)),
}
CW, CH, TOP, FILL = 600, 1000, 0.04, 0.94
MATTING = {'heroine_05@campus_v2'}                                 # 學姊約會圖：白襯衫和灰底只差 7，一般去背會在髮絲邊留一圈淺灰；alpha matting（pymatting）髮絲乾淨、衣領完整
PATCH_HOLES = {'heroine_05@campus_v2'}                                     # 學姊約會圖姿勢①：衣領的白色被挖掉
HOLES = {'pinyu'}                                                   # BB-B 2026-10-16 D59 退件：曾品妤耳朵高度的白邊、兩腿中間的灰底


def key_holes(c0, al, bgc, shoe=0.92):
    """把「接近背景色的中性淺色」連成一片的地方挖掉（不管遮罩怎麼說）；旁邊 3 px 重算半透明：
    中性的像素照亮度在「背景」和「附近最暗的人物顏色（褲子、頭髮）」之間的位置給 alpha（不然邊緣留一圈白、而且放大後鋸齒）；
    有顏色的（臉、手、暖色皮膚）不動。鞋子（最下面 8%）有白色的部分，不碰。"""
    d = np.abs(c0 - bgc).max(2); sat = c0.max(2) - c0.min(2); L = c0.mean(2); bL = float(bgc.mean()); H = c0.shape[0]
    bgl = (d < 22) & (sat < 14) & (al > 0.02)
    lab, n = ndimage.label(bgl); keep = np.zeros_like(bgl)
    ys = np.nonzero(al > 0.5)[0]; foot = ys.max() if len(ys) else H; top = ys.min() if len(ys) else 0
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        if sl is None: continue
        if int((lab[sl] == i).sum()) >= 6 and sl[0].start < top + shoe * (foot - top): keep |= lab == i
    # 頭的高度（上面 17%，到下巴、帽兜以上）：髮絲和脖子之間的背景被皮膚染成偏暖的淺色（飽和度 13～25），第一輪抓不到——只拿「碰到已挖掉的洞或外面」的那幾塊
    # （淺灰帽兜的亮面飽和度 ≤12，不算；不然帽兜的邊會被咬掉）
    head = np.zeros_like(bgl); head[top:top + int(0.17 * (foot - top))] = True
    warm = head & (L > 226) & (sat >= 13) & (sat < 26) & ~keep; out0 = keep | (al < 0.05)
    wl, _ = ndimage.label(warm); touch = np.unique(wl[ndimage.binary_dilation(out0, iterations=1) & warm]); touch = touch[touch > 0]
    keep = keep | np.isin(wl, touch)
    near = ndimage.binary_dilation(keep, iterations=3) & ~keep & (sat < 20)
    fgL = ndimage.minimum_filter(np.where(keep, 255.0, L), size=9)              # 附近最暗的人物顏色
    a = np.clip((bL - L) / np.maximum(bL - fgL, 30.0), 0, 1)
    out = np.where(keep, 0.0, al); out = np.where(near, np.minimum(out, a), out)
    # 最後：頭的高度、貼著透明區 2 px 以內、又亮又沒顏色的零星像素（髮絲間殘留的白點）也拿掉；皮膚飽和度 ≥25，不受影響
    # 脖子兩側（到 20%）的白點是被皮膚染成微暖的背景（R−B 8～26）；帽兜是中性灰（R−B < 8）、皮膚 R−B ≥ 30，都不受影響
    rb = c0[..., 0] - c0[..., 2]; neck = np.zeros_like(bgl); neck[top:top + int(0.20 * (foot - top))] = True
    edge = ndimage.binary_dilation(out < 0.1, iterations=2) & (out >= 0.1) & (L > 212) & ((head & (sat < 22)) | (neck & (rb >= 8) & (rb < 27) & (sat < 27)))
    out = np.where(edge, 0.0, out)
    zone = ndimage.binary_dilation(keep | edge, iterations=4)
    return np.where(zone, ndimage.gaussian_filter(out, 0.5), out)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--ref', required=True); ap.add_argument('--out', required=True); ap.add_argument('--only', default=''); ap.add_argument('--date', default='', help='企劃線 docs/story_planning/date_system/art 資料夾')
    a = ap.parse_args(); only = [s for s in a.only.split(',') if s]
    from rembg import new_session, remove
    sess = {m: new_session(m) for m in ('isnet-anime', 'u2net')}; tiles = []
    REAL = {'heroine_01', 'heroine_02@cafe', 'heroine_03', 'heroine_04', 'heroine_05', 'kexin'}
    for gid, (src, box) in SRC.items():
        if only and gid not in only: continue
        kind, fn = src.split(':', 1); path = os.path.join({'H': HS, 'D': a.date or a.ref}.get(kind, a.ref), fn)
        gdir, outfit = (gid.split('@') + ['campus'])[:2]
        im = Image.open(path).convert('RGB'); x0, y0, x1, y1 = box
        crop = im.crop((max(0, x0), max(0, y0), min(im.width, x1), min(im.height, y1)))
        kw = dict(alpha_matting=True, alpha_matting_foreground_threshold=240, alpha_matting_background_threshold=10, alpha_matting_erode_size=6) if gid in MATTING else {}
        rgba = np.array(remove(crop, session=sess['u2net' if gid in REAL else 'isnet-anime'], **kw)).astype(np.float32)
        al = rgba[..., 3] / 255.0
        c0 = np.array(crop).astype(np.float32); bd = np.concatenate([c0[:3].reshape(-1, 3), c0[-3:].reshape(-1, 3), c0[:, :3].reshape(-1, 3), c0[:, -3:].reshape(-1, 3)])
        bgc = np.median(bd, 0)
        if gid in REAL:                                               # u2net 的遮罩比人物寬 1～3 px：邊緣一圈裡顏色接近背景的像素拿掉（白邊）
            m = al > 0.5; band = m & ~ndimage.binary_erosion(m, iterations=4)
            near_bg = np.abs(c0 - bgc).max(2) < 26
            al = np.where(band & near_bg, 0.0, al); al = ndimage.gaussian_filter(al, 0.6) * (al > 0)
        if gid in HOLES:                                              # 人物裡面露出來的背景（兩腿中間、側邊髮絲和脖子之間）：遮罩把它當成人物，放在深色底上是一塊灰、一圈白邊
            al = key_holes(c0, al, bgc)
        lab, n = ndimage.label(al > 0.25)
        if n > 1:                                                     # 只留最大的一塊（旁邊人物、字、細節格的邊、浮在頭上的線）
            sizes = ndimage.sum(np.ones_like(al), lab, range(1, n + 1)); keep = ndimage.binary_dilation(lab == (1 + int(np.argmax(sizes))), iterations=2); al = al * keep
        if gid in PATCH_HOLES:                                             # 白色衣領被當成背景挖出一個洞（四周都是人物）：補回去（300～3000 px 的洞；手臂和身體中間更大的空隙不補）
            m = al > 0.5; hl, nh = ndimage.label(ndimage.binary_fill_holes(m) & ~m)
            for i, sl in enumerate(ndimage.find_objects(hl), 1):
                if sl is not None and 300 <= int((hl[sl] == i).sum()) <= 3000: al = np.where(ndimage.binary_dilation(hl == i, iterations=1), 1.0, al)
        # 去掉邊緣的背景色：背景色＝裁切範圍四邊的中位數；半透明的像素 c = a·f + (1−a)·bg → f = (c − (1−a)·bg)/a
        a3 = np.clip(al, 1e-3, 1)[..., None]
        fg = np.clip((c0 - (1 - a3) * bgc) / a3, 0, 255); edge = ((al > 0.02) & (al < 0.98))[..., None]
        rgba[..., :3] = np.where(edge, fg, c0)
        al = np.where(al < 0.06, 0, al); rgba[..., 3] = al * 255
        ys, xs = np.nonzero(al > 0.05); fy0, fy1, fx0, fx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        fig = Image.fromarray(rgba[fy0:fy1, fx0:fx1].astype(np.uint8), 'RGBA')
        s = CH * FILL / fig.height; fw, fh = max(1, round(fig.width * s)), round(fig.height * s)
        if fw > CW * 0.98: s = CW * 0.98 / fig.width; fw, fh = round(fig.width * s), round(fig.height * s)
        fig = fig.resize((fw, fh), Image.LANCZOS)
        can = Image.new('RGBA', (CW, CH), (0, 0, 0, 0)); can.paste(fig, ((CW - fw) // 2, round(CH * TOP)), fig)
        od = os.path.join(a.out, gdir, outfit); os.makedirs(od, exist_ok=True)
        can.save(os.path.join(od, 'neutral.webp'), quality=92, method=6)
        print(gid, 'source', fn, 'crop', box, 'figure px', fig.size, 'native height', fy1 - fy0, 'scale %.2f' % s)
        tiles.append((gid, can))
    # 對照表：每張放在灰底上（看得出去背的邊）
    cols = 9; tw, th = 200, 333; rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * tw, rows * (th + 18)), (200, 200, 200))
    from PIL import ImageDraw
    d = ImageDraw.Draw(sheet)
    for i, (gid, can) in enumerate(tiles):
        t = can.resize((tw, th), Image.LANCZOS); x, y = (i % cols) * tw, (i // cols) * (th + 18)
        bg = Image.new('RGB', (tw, th), (120, 140, 150) if i % 2 else (215, 215, 215)); bg.paste(t, (0, 0), t); sheet.paste(bg, (x, y + 18)); d.text((x + 3, y + 3), gid, fill=(0, 0, 0))
    sheet.save(os.path.join(a.out, '_contact.png'))


if __name__ == '__main__':
    main()
