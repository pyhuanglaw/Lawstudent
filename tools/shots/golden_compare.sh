#!/usr/bin/env bash
# 黃昏調色的對照：同一地點、同一時間、同一鏡頭，原版（?grade=off）與 golden 各拍一張，左右並排。
# golden 是預設（使用者 2026-10-18 選「預設就開」，X32／GRADE-GOLDEN-DEFAULT；D64 2026-10-14 那時還沒設成預設）。
# 四種環境：白天（12:00）、黃昏（17:30）、夜間（20:00）——溫州街巷口同一個鏡頭；室內（兩點半 Café，17:30）；另外加校園傅鐘的黃昏。
# golden 只換 17:00–18:00 那一段的光線（engine3d.js 的 KEY_GOLDEN），白天、夜間兩張應該一樣——拍出來確認這件事，不是漏拍。
# 用法：bash tools/shots/golden_compare.sh <遊戲網址，不含參數> [輸出資料夾，預設 docs/art-rebuild/screenshots/golden_compare]
set -e
U=$1; O=${2:-docs/art-rebuild/screenshots/golden_compare}
mkdir -p "$O"
python3 - "$O" <<'EOF'
import json, sys
O = sys.argv[1]
LANE = {"cam": {"pos": [50.0, 1.6, -0.6], "look": [20.0, 4.5, 0.0]}, "hidePlayer": True, "hideNPCs": True}
BASE = [
    ("day", {"zone": "wenzhou", "hour": 12.0, "pos": {"x": 46, "z": -2.5, "yaw": -1.5708}}, LANE),
    ("dusk", {"zone": "wenzhou", "hour": 17.5, "pos": {"x": 46, "z": -2.5, "yaw": -1.5708}}, LANE),
    ("night", {"zone": "wenzhou", "hour": 20.0, "pos": {"x": 46, "z": -2.5, "yaw": -1.5708}}, LANE),
    ("indoor", {"zone": "cafe", "hour": 17.5}, {}),
    ("campus_dusk", {"zone": "campus", "hour": 17.5, "pos": {"x": -38, "z": 10, "yaw": 0}}, {"cam": {"pos": [-38, 1.7, 16], "look": [-38, 6, -20]}, "hidePlayer": True}),
]
for tag in ("orig", "golden"):
    shots = []
    for name, st, extra in BASE:
        s = {"out": f"{O}/{name}_{tag}.png", "w": 1280, "h": 720, "state": st, "wait": 5000}
        s.update(extra)
        shots.append(s)
    json.dump(shots, open(f"{O}/{tag}.json", "w"), ensure_ascii=False, indent=1)
EOF
python3 tools/shots/scene_shot.py "$U?grade=off" "$O/orig.json"
python3 tools/shots/scene_shot.py "$U?grade=golden" "$O/golden.json"
for n in day dusk night indoor campus_dusk; do
  python3 tools/shots/compare.py "$O/cmp_$n.jpg" 540 "原版（golden 關掉）=$O/${n}_orig.png" "golden（預設）=$O/${n}_golden.png"   # 標籤不能有「=」（compare.py 用第一個 = 分開標籤和檔名）
done
python3 - "$O" <<'EOF'
import sys
from PIL import Image, ImageChops
O = sys.argv[1]
for n in ("day", "dusk", "night", "indoor", "campus_dusk"):
    a = Image.open(f"{O}/{n}_orig.png").convert("RGB"); b = Image.open(f"{O}/{n}_golden.png").convert("RGB")
    d = ImageChops.difference(a, b).convert("L"); px = list(d.getdata()); diff = sum(1 for v in px if v > 12) / len(px)
    print(f"{n}: 有差別的像素 {diff*100:.1f}%")
EOF
