"""cam_pillar_probe.py 的結果：玩家看得到多少（BUG-CAM-PILLAR-LAWA-1031；LAWWW2-B 2026-10-31）。
有玩家、沒玩家兩張截圖在玩家外框（頭頂到腳、寬＝高的 0.4）裡比較，差超過 30 的像素算「看得到玩家」；
另外算一個「不遮擋的基準」：外框面積的幾成本來就該是玩家（人形大約佔外框的 45%）。印出看得到的像素數、佔外框的比例。
用法：python3 tools/blender/env_second/shots/cam_pillar_visible.py 輸出資料夾"""
import json, sys
from PIL import Image, ImageChops
D = sys.argv[1]
info = json.load(open(D + '/probe.json'))
for name, st in info.items():
    a = Image.open(f'{D}/{name}.png').convert('RGB'); b = Image.open(f'{D}/{name}_noplayer.png').convert('RGB')
    W, H = a.size; cx, ty, fy = st['box']; h = (fy - ty) * H; x0, x1 = int(cx * W - 0.2 * h), int(cx * W + 0.2 * h); y0, y1 = int(ty * H), int(fy * H)
    x0, y0 = max(0, x0), max(0, y0); x1, y1 = min(W, x1), min(H, y1)
    d = ImageChops.difference(a.crop((x0, y0, x1, y1)), b.crop((x0, y0, x1, y1))).convert('L')
    n = sum(1 for v in d.getdata() if v > 30); tot = max(1, (x1 - x0) * (y1 - y0))
    print(f"{name}: 鏡頭 {st['cam']} 距離 {st['dist']} m；玩家外框 {x1 - x0}×{y1 - y0} px，看得到 {n} px（{n / tot:.0%}）")
