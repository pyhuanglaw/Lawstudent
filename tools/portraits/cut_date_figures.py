"""約會人物圖去背（校外約會系統，BB_128 2-3、BB_132 §1c；BB-B 2026-10-16 01:58Z 規格）→ assets/date/<character_id>/<pose>.webp＋assets/date/anchors.json。
LAWWW2-B 2026-10-16。來源：企劃線 docs/story_planning/date_system/art/*_date_*.webp（使用者生成、BB 驗收的原圖；不重畫、不換臉）。

規格（BB-B）：
- 每個姿勢單獨一張透明 webp，**原解析度不縮放**；裁到人物外框：頭頂留 4%、左右留 2%、腳底貼齊下緣（坐姿：最低點貼齊下緣）。
- 女主角：H1 站姿、H3 扶欄杆（或回頭背影）、H4 坐姿；祐廷：Y1、Y2、Y3。頭像四格 head_neutral／head_smile／head_thinking／head_embarrassed 另外切（不貼回身體）。
- anchors.json（像素，以該張圖左上為原點）：footX、footY（腳底中心）、h（頭頂到腳底）；H3／Y2 加 handY、rail；H4／Y3 加 seatY。
- 沛珊、可昕的 H3 是回頭的背影（不是扶欄杆）：rail:false。子晴、祐廷、以安、語彤的②手掌在腰兩側（只疊矮牆或低欄杆）：rail:true＋note。
- 語彤用企劃線補過胸口小字的版本（repo 裡的）。
handY、seatY 是從輪廓推算的近似值（handY＝手臂張開最寬那一列；seatY＝見 seat_y()），BB-B 依各地點的 *_coords.json 檢查，偏差就重標。

用法：python3 tools/portraits/cut_date_figures.py --src <放原圖的資料夾> [--out assets/date] [--only heroine_01,player] [--sheet <對照圖.png> --base <底圖.webp>]
"""
import argparse, json, os
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# 各張的裁切範圍（原圖像素，左、上、右、下）：照原圖目視標的格子（比旁邊的姿勢寬一點沒關係：只留最大的一塊）
H4ROW = lambda y0: y0
SRC = {
    'classmate_peishan': ('classmate_peishan_date_casual.webp', {
        'H1': (0, 0, 378, 1000), 'H3': (372, 0, 655, 1000), 'H4': (628, 170, 1000, 1000),
        'head_neutral': (1008, 92, 1256, 476), 'head_smile': (1258, 92, 1512, 476), 'head_thinking': (1008, 478, 1256, 866), 'head_embarrassed': (1258, 478, 1512, 866)},
        {'H3': {'rail': False, 'note': '回頭的背影，不是扶欄杆（疊欄杆時改用 H1）'}}),
    'heroine_01': ('heroine_01_date_knit.webp', {
        'H1': (0, 0, 378, 1000), 'H3': (366, 0, 662, 1000), 'H4': (646, 140, 1000, 1000),
        'head_neutral': (1008, 158, 1256, 497), 'head_smile': (1258, 158, 1532, 497), 'head_thinking': (1008, 527, 1256, 902), 'head_embarrassed': (1258, 527, 1532, 902)},
        {'H3': {'rail': True, 'note': '手掌在腰兩側：只疊矮牆或比較低的欄杆'}}),
    'heroine_02': ('heroine_02_date_warm.webp', {
        'H1': (0, 0, 352, 1000), 'H3': (300, 0, 770, 1000), 'H4': (595, 110, 1122, 1000),
        'head_neutral': (0, 998, 279, 1388), 'head_smile': (279, 998, 556, 1388), 'head_thinking': (556, 998, 846, 1388), 'head_embarrassed': (846, 998, 1122, 1388)},
        {'H3': {'rail': True}}),
    'heroine_03': ('heroine_03_date_tee.webp', {
        'H1': (100, 0, 450, 780), 'H3': (470, 0, 840, 780), 'H4': (880, 100, 1240, 780),
        'head_neutral': (16, 786, 324, 1172), 'head_smile': (336, 786, 644, 1172), 'head_thinking': (652, 786, 962, 1172), 'head_embarrassed': (972, 786, 1296, 1172)},
        {'H3': {'rail': True, 'note': '手掌在腰兩側：只疊矮牆或比較低的欄杆'}}),
    'heroine_04': ('heroine_04_date_hoodie.webp', {
        'H1': (0, 0, 335, 1000), 'H3': (290, 0, 752, 1000), 'H4': (590, 100, 1122, 1000),
        'head_neutral': (0, 998, 277, 1388), 'head_smile': (277, 998, 552, 1388), 'head_thinking': (552, 998, 846, 1388), 'head_embarrassed': (846, 998, 1122, 1388)},
        {'H3': {'rail': True, 'note': '手掌在腰兩側：只疊矮牆或比較低的欄杆'}}),
    'heroine_05': ('heroine_05_date_shirt.webp', {
        'H1': (30, 0, 385, 975), 'H3': (378, 0, 765, 970), 'H4': (735, 160, 1122, 975),
        'head_neutral': (0, 978, 277, 1392), 'head_smile': (277, 978, 556, 1392), 'head_thinking': (556, 978, 832, 1392), 'head_embarrassed': (832, 978, 1122, 1392)},
        {'H3': {'rail': True}}),
    'kexin': ('kexin_date_denim.webp', {
        'H1': (0, 0, 360, 1000), 'H3': (340, 0, 625, 1000), 'H4': (598, 150, 985, 1000),
        'head_neutral': (958, 88, 1242, 482), 'head_smile': (1244, 88, 1532, 482), 'head_thinking': (958, 488, 1242, 872), 'head_embarrassed': (1244, 488, 1532, 872)},
        {'H3': {'rail': False, 'note': '回頭的背影，不是扶欄杆（疊欄杆時改用 H1）'}}),
    'player': ('player_date_casual.webp', {
        'Y1': (30, 0, 430, 1065), 'Y2': (470, 0, 925, 1055), 'Y3': (875, 170, 1445, 1010)},
        {'Y2': {'rail': True, 'note': '手掌在腰兩側：只疊矮牆或比較低的欄杆'}}),
}
TOP, SIDE = 0.04, 0.02
# 坐高 seatY：自動估計（seat_y()）在膝蓋抬高、側坐、往後坐的姿勢會錯（子晴量到膝蓋、祐廷量到肩膀）→ 目視校正（±20 px，該張圖的像素；BB-B 依各地點 *_coords.json 再核）
SEAT_FIX = {'classmate_peishan': 540, 'heroine_01': 565, 'heroine_02': 565, 'heroine_03': 395, 'heroine_04': 520, 'heroine_05': 480, 'kexin': 515, 'player': 535}


def cut(crop, sess, remove, head=False):
    # 頭像：isnet-anime＋alpha matting（u2net 會把頭髮、臉的一部分當背景：可昕 head_embarrassed 幾乎整張半透明）；身體照舊 u2net
    kw = dict(alpha_matting=True, alpha_matting_foreground_threshold=240, alpha_matting_background_threshold=10, alpha_matting_erode_size=6) if head else {}
    rgba = np.array(remove(crop, session=sess, **kw)).astype(np.float32); al = rgba[..., 3] / 255.0
    c0 = np.array(crop.convert('RGB')).astype(np.float32)
    bd = np.concatenate([c0[:3].reshape(-1, 3), c0[-3:].reshape(-1, 3), c0[:, :3].reshape(-1, 3), c0[:, -3:].reshape(-1, 3)]); bgc = np.median(bd, 0)
    m = al > 0.5; band = m & ~ndimage.binary_erosion(m, iterations=4); near_bg = np.abs(c0 - bgc).max(2) < 26          # u2net 的遮罩比人物寬 1～3 px：邊緣接近背景色的拿掉
    al = np.where(band & near_bg, 0.0, al); al = ndimage.gaussian_filter(al, 0.6) * (al > 0)
    if head:                                                                                            # AI 圖在頭髮外圍畫了一圈比灰底還亮的光暈：又亮又沒顏色、和外面連在一起的那一片當背景（只在上面 55%：下面的白襯衫、淺色毛衣不動）
        lum = c0.mean(2); sat = c0.max(2) - c0.min(2); lt = (lum > 140) & (sat < 30); lt[int(0.55 * lt.shape[0]):] = False; ext = al < 0.1
        lb, _n = ndimage.label(lt | ext); tch = np.unique(lb[ext]); al = np.where(lt & np.isin(lb, tch[tch > 0]), 0.0, al)
    lab, n = ndimage.label(al > 0.25)
    if n > 1:                                                                                           # 只留最大的一塊（旁邊姿勢伸過來的手、格子的邊）
        sz = ndimage.sum(np.ones_like(al), lab, range(1, n + 1)); al = al * ndimage.binary_dilation(lab == 1 + int(np.argmax(sz)), iterations=2)
    a3 = np.clip(al, 1e-3, 1)[..., None]; fg = np.clip((c0 - (1 - a3) * bgc) / a3, 0, 255); edge = ((al > 0.02) & (al < 0.98))[..., None]
    rgb = np.where(edge, fg, c0); al = np.where(al < 0.06, 0, al)
    return np.dstack([rgb, al * 255]).astype(np.uint8)


def frame(rgba, head=False):
    """裁到人物外框＋邊界：頭頂 4%、左右 2%、腳底（最低點）貼齊下緣；原解析度"""
    al = rgba[..., 3] > 12; ys, xs = np.nonzero(al); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    fig = rgba[y0:y1, x0:x1]; fh, fw = fig.shape[:2]
    H = int(round(fh / (1 - TOP))); W = int(round(fw / (1 - 2 * SIDE)))
    can = np.zeros((H, W, 4), np.uint8); oy = H - fh; ox = (W - fw) // 2
    can[oy:oy + fh, ox:ox + fw] = fig
    return can


def anchors(can, pose):
    al = can[..., 3] > 127; H, W = al.shape; ys, xs = np.nonzero(al); top = ys.min(); foot = ys.max()
    bot = al[max(0, foot - int(0.03 * (foot - top))):foot + 1]; bx = np.nonzero(bot.any(0))[0]
    a = {'w': int(W), 'hpx': int(H), 'footX': int(round(bx.mean())), 'footY': int(foot), 'h': int(foot - top)}
    if pose in ('H3', 'Y2'):                                  # 手掌的高度：身高 30%～62% 之間、輪廓最寬的那一列（兩手撐在兩側）
        r0, r1 = top + int(0.30 * (foot - top)), top + int(0.62 * (foot - top)); wid = [(int(np.ptp(np.nonzero(al[y])[0])) if al[y].any() else 0) for y in range(r0, r1)]
        a['handY'] = int(r0 + int(np.argmax(wid)))
    if pose in ('H4', 'Y3'):
        a['seatY'] = seat_y(al, top, foot)
    return a


def seat_y(al, top, foot):
    """坐姿的坐高（屁股坐的高度）近似：大腿是水平的——從上往下，找輪廓寬度第一次變成「肩寬的 1.6 倍以上」的那一列（大腿往前伸出去），
    再往下加大腿厚度的一半（約身高的 4%）。BB-B 檢查用。"""
    h = foot - top; wid = np.array([(int(np.ptp(np.nonzero(al[y])[0])) if al[y].any() else 0) for y in range(top, foot + 1)])
    sh = np.median(wid[int(0.18 * h):int(0.30 * h)]) if h > 10 else wid.max()
    for i in range(int(0.35 * h), int(0.85 * h)):
        if wid[i] > 1.6 * sh: return int(top + i + 0.04 * h)
    return int(top + 0.62 * h)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--src', required=True); ap.add_argument('--out', default=os.path.join(ROOT, 'assets/date')); ap.add_argument('--only', default='')
    ap.add_argument('--sheet'); ap.add_argument('--base')
    a = ap.parse_args(); only = [s for s in a.only.split(',') if s]
    from rembg import new_session, remove
    sess = new_session('u2net'); hsess = new_session('isnet-anime'); report = {}
    apath = os.path.join(a.out, 'anchors.json'); old = json.load(open(apath)) if os.path.exists(apath) else {}
    for cid, (fn, boxes, extra) in SRC.items():
        if only and cid not in only: continue
        im = Image.open(os.path.join(a.src, fn)).convert('RGB'); od = os.path.join(a.out, cid); os.makedirs(od, exist_ok=True); report[cid] = {'source': 'docs/story_planning/date_system/art/' + fn}
        for pose, box in boxes.items():
            hd = pose.startswith('head_'); can = frame(cut(im.crop(box), hsess if hd else sess, remove, head=hd), head=hd)
            Image.fromarray(can, 'RGBA').save(os.path.join(od, pose + '.webp'), quality=92, method=6, exact=False)
            an = anchors(can, pose) if not pose.startswith('head_') else {'w': int(can.shape[1]), 'hpx': int(can.shape[0])}
            an.update(extra.get(pose, {})); an['crop'] = list(box)
            if an.get('rail') is False: an.pop('handY', None)                                   # 回頭的背影：沒有扶欄杆的手
            if 'seatY' in an and cid in SEAT_FIX: an['seatY_auto'] = an['seatY']; an['seatY'] = SEAT_FIX[cid]; an['seatY_note'] = '目視校正 ±20 px'
            report[cid][pose] = an
            print(cid, pose, an, flush=True)
    old.update(report); json.dump(old, open(apath, 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
