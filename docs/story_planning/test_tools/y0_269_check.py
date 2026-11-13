"""BB-B 2026-10-31：QA-PLAYTHROUGH-1018 的 AA_269 第 6 節 15 點對照（讀 qa_play.py 的輸出，不開瀏覽器）。
讀 <OUT>/ev.json（事件演完的時間線）、fl.json（旗標變動）、say.json（台詞）、final_snap.json（玩到 9/2 的最後狀態）。
對照目前程式的短版（src/econff3d.js 的 S.KEEP：AA_300／AA_303，使用者 10-18 確認）：
  ①KEEP 裡的事件：有沒有演、哪一天（成對的「_h」＝在家／手機版，演一個就算）；
  ②AA_269 第 7 點停用的事件、和不在 KEEP 的舊序章的系事件：9/2 早上以後有沒有演（演了＝要查）；
  ③關鍵旗標的最後值和第一次設定的日期。
用法：LW=<工作樹> python3 y0_269_check.py <qa_play 輸出資料夾> [...]"""
import os, sys, json, re
LW = os.environ.get('LW', '')
src = open(os.path.join(LW, 'src/econff3d.js'), encoding='utf-8').read()
m = re.search(r"S\.KEEP=new Set\(\[(.*?)\]\);", src, re.S)
KEEP = re.findall(r"'(ev_y0_[a-z0-9_]+)'", m.group(1)) if m else []
STOPPED = ['ev_y0_e11', 'ev_y0_e13', 'ev_y0_e16a', 'ev_y0_e16b', 'ev_y0_e17', 'ev_y0_e17a', 'ev_y0_e19', 'ev_y0_e22', 'ev_y0_e24b', 'ev_y0_e24b2',
           'ev_y0_e25', 'ev_y0_a2', 'ev_y0_a1_note', 'ev_y0_t2', 'ev_y0_c2_badminton', 'ev_y0_c2_guitar', 'ev_y0_c2_hiking', 'ev_y0_xl1', 'ev_y0_xl2',
           'ev_y0_p1b2', 'ev_y0_t3', 'ev_y0_e28']   # AA_269 第 7 點（舊 E24c、T3 現場版另外看台詞）
FLAGS = ['ECON_CAMP_OPEN', 'E15_BUS', 'E01_MORNING', 'dating_kexin', 'KX_DATING_SINCE', 'E26_DAY', 'KX_CAR', 'Y0_MOVED_OUT', 'BIKE_LOOKED_UP',
         'CRAM_FREE_KNOWN', 'E22B_TOLD', 'E18A_DOUHUA', 'KX_THINK_LEAVE', 'RETAKE_TOGETHER', 'E24C_REASON', 'GIRAFFE_KEYCHAIN', 'PLAYED_Y0']
for out in sys.argv[1:]:
    J = lambda n, d: json.load(open(os.path.join(out, n), encoding='utf-8')) if os.path.exists(os.path.join(out, n)) else d
    ev, fl, say, snap = J('ev.json', []), J('fl.json', []), J('say.json', []), J('final_snap.json', {})
    print('=' * 70); print(out, '：事件 %d 筆、旗標 %d 筆、台詞 %d 句' % (len(ev), len(fl), len(say)))
    first = {}
    for e in ev:
        if e['id'] not in first: first[e['id']] = '%s %s' % (e.get('d'), e.get('h'))
    done = (snap.get('events') or {}).get('done') or {}
    print('\n①KEEP（%d 場）有沒有演：' % len(KEEP))
    for k in KEEP:
        pair = k[:-2] if k.endswith('_h') else k + '_h'
        print('  %-22s %s%s' % (k, first.get(k) or ('（最後狀態有）' if done.get(k) else '—'), '' if (k in first or done.get(k)) else ('　→ 成對的 %s 有演' % pair if (pair in first or done.get(pair)) else '')))
    print('\n②停用的（AA_269 第 7 點）有沒有演：')
    bad = [k for k in STOPPED if k in first or done.get(k)]
    print('  ' + ('、'.join('%s（%s）' % (k, first.get(k, '最後狀態有')) for k in bad) if bad else '都沒有演'))
    other = sorted({e['id'] for e in ev if e['id'].startswith('ev_y0_') and e['id'] not in KEEP and e['id'] not in STOPPED and (e.get('d') or '') >= '2024-09-02'})
    print('  不在 KEEP、9/2 以後演了的舊序章的系事件：' + ('、'.join('%s（%s）' % (k, first[k]) for k in other) if other else '沒有'))
    pre = sorted({e['id'] for e in ev if (e.get('d') or '') < '2024-09-02'})
    print('  9/2 以前演的事件：' + '、'.join('%s（%s）' % (k, first[k]) for k in pre))
    print('\n③旗標（第一次設定的日期 → 最後值）：')
    F = snap.get('flags') or {}
    for k in FLAGS:
        f1 = next((x for x in fl if x['k'] == k), None)
        print('  %-18s %s → %s' % (k, '%s %s' % (f1['d'], f1['h']) if f1 else '—', json.dumps(F.get(k), ensure_ascii=False)[:80]))
    print('\n其他演過的事件（非 ev_y0_）：' + '、'.join(sorted({e['id'] for e in ev if not e['id'].startswith('ev_y0_')}))[:1500])
