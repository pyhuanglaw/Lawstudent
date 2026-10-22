"""zone_enter_probe 的輸出（base.json、after.json）整理成表格。用法：python3 summarize.py base.json [after.json]"""
import json, sys

def fin(r):
    return r['enterMs'] / 1000.0

def rows(path):
    R = json.load(open(path, encoding='utf-8'))
    out = []
    for r in R:
        lz = [m for m in r.get('marks', []) if m['what'] == 'loadZone']
        f = fin(r)
        top = [{'t': x[0], 'ms': x[1], 'newProg': x[2]} for x in r['rows']] if r.get('rows') else r.get('top', [])   # 有每一格的紀錄就用全部的格子（舊的 base.json 只有最長的 12 格）
        # 黑畫面期間（0.48 秒淡出完 → 淡入開始）和看得到的期間（淡入開始以後）各自最長的格子
        # 一格＝上一格結束到這一格結束；開始時間在淡入以前的算黑畫面
        black = [x for x in top if x['t'] - x['ms'] / 1000.0 < f - 0.55]
        vis = [x for x in top if f - 0.55 <= x['t'] - x['ms'] / 1000.0 <= f + 10]   # 開始的時間在淡入以後 10 秒內（結束得晚也算：一格卡 13 秒就是看得到的卡）
        loads = r.get('loads', [])
        out.append({
            'label': r['label'], 'enterMs': r['enterMs'], 'blackMs': r.get('blackMs'),
            'visibleMaxMs': max([x['ms'] for x in vis] or [0]), 'visibleExcessMs': round(sum(max(0, x['ms'] - 2 * r['steadyMs']) for x in vis)),
            'loadZoneMs': lz[0]['ms'] if lz else None, 'mergeMs': lz[0]['merge'] if lz else None,
            'prog': '%d→%d' % (r['progStart'], r['progEnd']), 'tex': '%d→%d' % (r['texStart'], r['tex']),
            'over100': r['over100'], 'over250': r['over250'], 'steadyMs': r['steadyMs'],
            'prewarm': r.get('prewarm'),
            'topVisible': [(x['t'], x['ms'], x['newProg']) for x in sorted(vis, key=lambda x: -x['ms'])[:4]],
            'topBlack': [(x['t'], x['ms'], x['newProg']) for x in sorted(black, key=lambda x: -x['ms'])[:3]],
            'glb': [(l['k'].replace('bldg.', ''), l['cached'], l['start'], l['done']) for l in loads],
        })
    return out

for p in sys.argv[1:]:
    print('=====', p)
    for r in rows(p):
        print('-- %s' % r['label'])
        for k in ('enterMs', 'blackMs', 'visibleMaxMs', 'visibleExcessMs', 'loadZoneMs', 'mergeMs', 'prog', 'tex', 'over100', 'over250', 'steadyMs', 'prewarm'):
            print('   %-15s %s' % (k, r[k]))
        print('   最長（看得到）  ', r['topVisible'])
        print('   最長（黑畫面）  ', r['topBlack'])
        print('   正式模型        ', r['glb'][:14])
