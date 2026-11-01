"""D115 改名美術字（RENAME-ART-1030）：牌子、公告的近拍鏡頭清單 → rename_close_<標籤>.json（fast_shots.py 用）。LAWWW2-B 2026-10-30。
用法：python3 tools/blender/env_second/shots/rename_art_close.py <輸出資料夾> <標籤> [只拍：檔名關鍵字,…] → 再跑 fast_shots.py <URL> <JSON>
位置是從 GLB 量的（牌子網格的世界座標）：
  校門石牌 PLATE_FACE_GATE_OUT（校門自己的座標 z 2.16、高 2.13～2.61）→ 公館 placeGate(0,−46,0)：(0, 2.37, −43.84)，朝 +z（公館那一側）
  晨思鐘 PLATE_FACE_BELL (−38, 0.35～0.69, 13.3)，朝 −z（北，對著大道）
  博思教學館 PLATE_FACE_BOYA (−40.4～−35.6, 3.62～3.78, −71.59)，入口雨遮前緣，朝 +z（南）
  法律系館A 一樓公布欄 L0_WALL_Efacade_lz_notice（x 7.74、y 1～2、z 0.2～2.2），朝 −x
  201 後牆公告欄 WALL_S_print（z 8.54），軟木板 x −4.65～−2.55
  博思 203 門邊海報 WALL_N_print（z −3.15），海報 x 0.7～1.3、y 1.2～2.08
  ntu_linze 背景（BG-16，2026-10-16 的鏡頭，原檔 bg_ig.json）：外牆館名改成法律系館A 以後重拍"""
import json, os, sys
OUT, TAG = sys.argv[1], sys.argv[2]
V = [('gate', 'gongguan', 14.0, (0, -36), (0.0, 2.0, -39.6), (0.0, 2.37, -43.84)),
     ('bell', 'campus', 14.0, (-38, 8), (-38.0, 1.15, 10.6), (-38.0, 0.55, 13.3)),
     ('boya', 'campus', 14.0, (-38, -62), (-38.0, 2.3, -67.3), (-38.0, 3.6, -71.6)),   # 普通教學館的北牆在 z≈−65.5：鏡頭放在兩棟中間
     ('linze_notice', 'linze', 14.0, (5.0, 1.2), (5.5, 1.55, 1.2), (7.74, 1.5, 1.2)),
     ('cls201', 'classroom', 14.0, (-1.2, 6.0), (-3.6, 3.0, 6.9), (-3.6, 3.0, 8.54)),
     ('boya203', 'boya_203', 19.0, (1.0, 0.6), (1.0, 1.65, -1.3), (1.0, 1.64, -3.15)),
     # 第二輪：字太小的三個再拉近（博思名牌是雨遮前緣 16 cm 高的一條：鏡頭放在同一個高度平視；公布欄、傳單只拍改了字的那幾張）
     ('boya2', 'campus', 14.0, (-38, -62), (-38.0, 3.7, -69.0), (-38.0, 3.7, -71.59)),
     ('linze_notice2', 'linze', 14.0, (5.0, 1.2), (7.05, 1.62, 0.95), (7.74, 1.62, 0.95)),     # 法學講座（z 0.51～0.78）、社團博覽會（z 0.82～1.26）
     ('cls201_2', 'classroom', 14.0, (-1.2, 6.0), (-4.2, 2.92, 7.9), (-4.2, 2.92, 8.54))]      # FLY0 法律服務社（x −4.45）、FLY2 民法讀書會（x −3.95）
L = [{'out': os.path.join(OUT, f'{TAG}_close_{n}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
      'state': {'zone': z, 'hour': h, 'pos': {'x': p[0], 'z': p[1], 'yaw': 0}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 3500}
     for n, z, h, p, e, lk in V]
LZ = [('a', 17.3, (28.0, 1.6, -84.0), (34.0, 9.0, -103.0)),     # 10-16 原本的鏡頭
      ('b', 17.3, (34.0, 1.6, -87.0), (34.0, 8.6, -103.0)),     # 正對穿堂（避開左邊的樹、右邊的路燈）
      ('c', 17.3, (40.0, 1.6, -86.0), (32.0, 8.0, -103.0)),     # 10-16 的備用鏡頭（右前方斜看）
      ('d', 16.6, (34.0, 1.6, -87.0), (34.0, 8.6, -103.0)),     # 同 b、早一點（字比較亮）
      ('e', 16.6, (36.5, 1.6, -87.5), (35.5, 8.6, -103.0)),     # d 往右 2.5 m：左上角少一點樹（10-23 加的霖澤館大樟樹在 (24.5, −94.5)）
      ('f', 16.3, (36.5, 1.6, -87.5), (35.5, 8.6, -103.0))]
for k, h, e, lk in LZ:
    L.append({'out': os.path.join(OUT, f'{TAG}_ntu_linze_{k}.png'), 'w': 1920, 'h': 1080, 'hidePlayer': True, 'hideNPCs': True,
              'state': {'zone': 'campus', 'hour': h, 'pos': {'x': e[0] + 2, 'z': e[2] - 2, 'yaw': 0}}, 'cam': {'pos': list(e), 'look': list(lk)},
              'js': "(async()=>{ await new Promise(r=>setTimeout(r,9000)); return 'ok'; })()", 'wait': 3000})
if len(sys.argv) > 3: L = [s for s in L if any(k in s['out'] for k in sys.argv[3].split(','))]   # 只拍檔名含這些字的
p = os.path.join(OUT, f'rename_close_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
