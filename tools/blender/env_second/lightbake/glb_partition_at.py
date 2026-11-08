"""隔間牆的零件跟主牆一起淡出（11-08 LAWWW2-B；BB-B 光照第二級雲端判 P2：總圖 B1 自習室 A 區那面長牆下三分之一一條深藍黑的帶子）。不需要 Blender：
  python3 tools/blender/env_second/lightbake/glb_partition_at.py <glb> [輸出 glb，預設覆蓋] [--dry]
為什麼：
  - 遊戲的 fadeWalls 對隔間牆（extras.partition）是「鏡頭和玩家在牆的兩邊才淡出」，每個 WALL_ 網格用自己的外框中心判斷。
  - 同一面牆的護牆板、踢腳、收邊、海報，中心比主牆偏幾公分（B1 的 P2：牆 z −2.40、木護牆板 −2.47）。
    玩家站在兩個平面中間（B1 入口 (−20.5, −2.4) 就是），只有護牆板淡出、牆不淡出。
  - 烘焙時牆被護牆板蓋住的那一段照不到光（黑的，這是對的）；護牆板一淡出，就露出那一段黑的。
做法：每個隔間牆網格，找同一個 dir、外框把它包住（各邊放寬 6 cm、沿 dir 15 cm 內）的隔間牆裡面積最大的那一個（主牆）。
  比它大 1.5 倍以上，就在它的 extras 寫 at＝主牆的淡出判斷點（主牆自己有 at、或剛被寫了 at，就用那個；沒有就用外框中心；GLB 座標）。面積大的先處理。
  at 不四捨五入、主牆自己不寫（照舊用外框中心），零件的判斷就和主牆一模一樣。遊戲（zones3d.js attachRoomGLB）已經認 extras.at（118 巷店門外的鄰居店面卡用過），不用改程式。
只改節點的 extras.at，不動幾何、材質、第二套 UV、光照貼圖。"""
import json, struct, sys
import numpy as np


def q2m(q):
    x, y, z, w = q
    return np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                     [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                     [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]; dry = '--dry' in sys.argv
    src = args[0]; dst = args[1] if len(args) > 1 else src
    b = open(src, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + n]); rest = b[20 + n:]
    par = {}
    for i, nd in enumerate(J['nodes']):
        for c in nd.get('children', []): par[c] = i
    def world(i):
        M = np.eye(4)
        while i is not None:
            nd = J['nodes'][i]; T = np.eye(4); T[:3, :3] = q2m(nd.get('rotation', [0, 0, 0, 1])) @ np.diag(nd.get('scale', [1, 1, 1])); T[:3, 3] = nd.get('translation', [0, 0, 0]); M = T @ M; i = par.get(i)
        return M
    walls = []
    for i, nd in enumerate(J['nodes']):
        ex = nd.get('extras') or {}
        if not ex.get('partition') or nd.get('mesh') is None or 'extensions' in nd: continue
        mn = np.full(3, 1e9); mx = np.full(3, -1e9); M = world(i)
        for pr in J['meshes'][nd['mesh']]['primitives']:
            a = J['accessors'][pr['attributes']['POSITION']]
            for cx in (a['min'][0], a['max'][0]):
                for cy in (a['min'][1], a['max'][1]):
                    for cz in (a['min'][2], a['max'][2]):
                        p = M[:3, :3] @ np.array([cx, cy, cz]) + M[:3, 3]; mn = np.minimum(mn, p); mx = np.maximum(mx, p)
        d = np.array(ex.get('dir', [0, 0, 1]), dtype=float); ax = int(np.argmax(np.abs(d)))
        ext = mx - mn; area = float(np.prod([ext[k] for k in range(3) if k != ax]))
        at = ex.get('at'); c = np.array(at, dtype=float) if isinstance(at, list) and len(at) == 3 else (mn + mx) / 2
        walls.append({'i': i, 'name': nd.get('name', ''), 'mn': mn, 'mx': mx, 'ax': ax, 'dir': tuple(np.round(d, 3)), 'area': area, 'c': c, 'has_at': at is not None})
    changed = []
    for w in sorted(walls, key=lambda x: -x['area']):   # 大的先處理：小零件找到的主牆如果自己也跟了更大的，用那一個的判斷點（不會一串指下去）
        if w['has_at']: continue
        c = (w['mn'] + w['mx']) / 2; best = None
        for o in walls:
            if o is w or o['dir'] != w['dir'] or o['area'] < w['area'] * 1.5: continue
            ok = all((o['mn'][k] - 0.06 <= c[k] <= o['mx'][k] + 0.06) if k != w['ax'] else abs(c[k] - (o['mn'][k] + o['mx'][k]) / 2) <= 0.15 for k in range(3))
            if ok and (best is None or o['area'] > best['area']): best = o
        if best is None: continue
        at = [float(v) for v in best['c']]   # 不四捨五入：和遊戲算主牆中心的方法一樣（float32 頂點範圍的中點），玩家剛好站在牆的中線上（B1 入口 z −2.4）時，零件和主牆的正負號才會一樣
        ex = J['nodes'][w['i']].setdefault('extras', {}); ex['at'] = at; w['c'] = np.array(at)
        changed.append((w['name'], best['name'], round(float(((w['mn'] + w['mx']) / 2)[w['ax']] - best['c'][w['ax']]), 3)))
    for a, bn, off in changed: print(f'  {a} → 跟 {bn} 一起淡出（原本中心沿 dir 差 {off:+.3f} m）')
    print(f'{src}：隔間牆 {len(walls)} 個，加 at {len(changed)} 個')
    # 規則 B（11-08 BB-B LM3_cloud：霖澤 5F 研究室左牆深褐斜帶）：開著的門板。門板屬於門洞那面牆（dir 是那面牆的），卻轉了 90° 貼在另一面牆前面（5F：WALL_P1_door 在 P2 西面前 15 cm）。
    #   門洞那面牆淡出時門板跟著不見，露出它烘在貼著的那面牆上的影子；貼著的那面牆淡出、門板還在時，露出門板朝牆那一面（烘成黑的）。
    #   → 門板的淡出改跟它貼著的那面牆：dir、at、partition 都照那面牆。判斷：WALL_ 網格最薄的方向不是自己 dir 的方向（轉過 90°）、厚度 ≤ 20 cm，
    #     前面 30 cm 內有一面和它平行的牆（那面牆 dir 的方向＝門板最薄的方向，面積 ≥ 1 m²，外框各邊放寬 6 cm 包住門板的中心）。門把（WALL_P1_doormetal）一樣。
    #   一個節點裡有兩片門板、各貼不同的牆（美國公寓 WALL_bath_n_door）：外框不薄，不會被選到，要在 Blender 拆成兩個節點（記在 README）。
    def anc_dir(i):
        while i is not None:
            d = (J['nodes'][i].get('extras') or {}).get('dir')
            if isinstance(d, list) and len(d) == 3: return [float(v) for v in d]
            i = par.get(i)
        return None
    allw = []
    for i, nd in enumerate(J['nodes']):
        if nd.get('mesh') is None or 'extensions' in nd or 'WALL_' not in nd.get('name', ''): continue
        mn = np.full(3, 1e9); mx = np.full(3, -1e9); M = world(i)
        for pr in J['meshes'][nd['mesh']]['primitives']:
            a = J['accessors'][pr['attributes']['POSITION']]
            for cx in (a['min'][0], a['max'][0]):
                for cy in (a['min'][1], a['max'][1]):
                    for cz in (a['min'][2], a['max'][2]):
                        p = M[:3, :3] @ np.array([cx, cy, cz]) + M[:3, 3]; mn = np.minimum(mn, p); mx = np.maximum(mx, p)
        ex = nd.get('extras') or {}; d = anc_dir(i) or [0.0, 0.0, 1.0]; ax = int(np.argmax(np.abs(d))); ext = mx - mn
        at = ex.get('at'); c = [float(v) for v in at] if isinstance(at, list) and len(at) == 3 else [float(v) for v in (mn + mx) / 2]
        allw.append({'i': i, 'name': nd.get('name', ''), 'mn': mn, 'mx': mx, 'ext': ext, 'ax': ax, 'dir': d, 'c': c, 'part': bool(ex.get('partition')),
                     'area': float(np.prod([ext[k] for k in range(3) if k != ax]))})
    leaves = []
    for w in allw:
        t = int(np.argmin(w['ext']))
        if t == w['ax'] or w['ext'][t] > 0.2 or t == 1: continue
        cc = (w['mn'] + w['mx']) / 2; best = None
        for o in allw:
            if o is w or o['ax'] != t or o['area'] < 1.0: continue
            gap = max(o['mn'][t] - w['mx'][t], w['mn'][t] - o['mx'][t], 0.0)
            if gap > 0.3 or not all(o['mn'][k] - 0.06 <= cc[k] <= o['mx'][k] + 0.06 for k in range(3) if k != t): continue
            if best is None or o['area'] > best['area']: best = o
        if best is None: continue
        ex = J['nodes'][w['i']].setdefault('extras', {}); old = (ex.get('dir'), ex.get('partition'))
        ex['dir'] = best['dir']; ex['at'] = best['c']
        if best['part']: ex['partition'] = 1
        else: ex.pop('partition', None)
        leaves.append((w['name'], best['name'], old))
    for a, bn, old in leaves: print(f'  開著的門板 {a}（原本 dir {old[0]}、partition {old[1]}）→ 跟它貼著的 {bn} 一起淡出')
    if leaves: print(f'  門板 {len(leaves)} 個')
    changed += leaves
    if dry or not changed: return
    js = json.dumps(J, ensure_ascii=False, separators=(',', ':')).encode('utf-8'); js += b' ' * ((4 - len(js) % 4) % 4)
    out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + len(rest)) + struct.pack('<II', len(js), 0x4E4F534A) + js + rest
    open(dst, 'wb').write(out)


if __name__ == '__main__':
    main()
