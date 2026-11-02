"""共同教學館、大一女舍外觀和參考資料比對（ART-PHOTO-CMP-1021，LAWWW2-B 2026-11-01）：校園固定鏡頭 → <輸出資料夾>/ext.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/photo_cmp_shots.py <輸出資料夾> → fast_shots.py <URL> <輸出資料夾>/ext.json
11:00、藏玩家、路人。共同：正面、東北、西北、門廊、木造走廊、舟山路（南面）、空拍；女舍：舟山路、東北、A 棟門口、天橋底下、空拍。"""
import json, os, sys
OUT = sys.argv[1]
V = [  # (名稱, 鏡頭, 看的點)
 ('gt_front',   (6, 3.2, 13),   (2, 6, 33)),
 ('gt_ne',      (22, 4.5, 17),  (2, 6, 33)),
 ('gt_nw',      (-20, 3.2, 21), (-6, 5, 33)),
 ('gt_porch',   (3.5, 1.8, 17.5), (2, 5.5, 26)),
 ('gt_corridor',(-12.5, 1.7, 26), (-12.5, 2.4, 36)),
 ('gt_south',   (12, 2.2, 45.5), (0, 7, 36)),
 ('gt_aerial',  (34, 42, 4),    (2, 0, 33)),
 ('fd_street',  (-93, 3.4, 48), (-93, 6, 68)),
 ('fd_ne',      (-58, 9, 44),   (-93, 6, 66)),
 ('fd_entr_a',  (-104, 1.8, 54.5), (-108, 2.2, 61)),
 ('fd_bridge',  (-93, 1.7, 59), (-93, 4.8, 67)),
 ('fd_aerial',  (-60, 46, 28),  (-93, 0, 66)),
]
L = []
for n, e, lk in V:
    L.append({'out': os.path.join(OUT, n + '_1100.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
              'state': {'zone': 'campus', 'hour': 11.0, 'pos': {'x': 2, 'z': 16, 'yaw': 0}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 5000,
              'post': "(()=>{ const r=GAME.E.renderer.info.render; const names=new Set(); GAME.E.zone.group.traverse(o=>{ if(/campus_(gongtong|freshman)_glb/.test(o.name||'')) names.add(o.name); }); return {calls:r.calls,tris:r.triangles,glb:[...names]}; })()"})
json.dump(L, open(os.path.join(OUT, 'ext.json'), 'w'), ensure_ascii=False, indent=1); print(len(L))
