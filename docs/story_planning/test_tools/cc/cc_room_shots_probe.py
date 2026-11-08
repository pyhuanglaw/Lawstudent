"""CC-B（帳號 B）11-07：通用的房間截圖（WANCAI-SEM-LM，LAWWW2-B 11:57：萬才研討室 A／B 光照；同一支在「改前」「改後」各跑一次，TAG 分）。
SHOTS 環境變數：分號分隔，每一筆「區域|日期|時|名字[|yaw|yaw_ceil]」，例：wancai_sema|2025-10-15|11|A_day;wancai_semb|2028-10-26|10|B_interview
每一筆：【前置／捷徑】讀檔進那個區域（條件事件關閉）→ 等正式模型、光照貼圖接好 → user_shot（新 CAM）從進門那一點（layout spawn，往房間裡退 0.2 m、高 1.6 m）
  往房間的另一面（窗）看，鏡頭 20 mm；印這一間的光照貼圖接在幾個材質上、用的是哪一張（看推甄那天有沒有換成 interview 那一套）。好不好看＝LAWWW2／BB 看圖。
用法：LW_TESTS=<wt>/tests TAG=before|after SHOTS=... python3 cc_room_shots_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
TAG = os.environ.get('TAG') or 'x'
R = L.Run('room_shots_' + TAG, OUT); D.setup(R, OUT)
import re as _re
SHOTS = [_re.split(r'[|,]', x) for x in _re.split(r'[;+]', os.environ.get('SHOTS') or '') if x.strip()]   # 佇列一行用 | 和 ; 當分隔：在佇列裡寫「區域,日期,時,名字+…」

GEO = r"""(z=>{ const L=(typeof ROOM_GLB_LAYOUTS!=='undefined'&&ROOM_GLB_LAYOUTS[z])||null; const E=GAME.E; const lm=new Set(); let n=0, nl=0;
  if(E.zone&&E.zone.group) E.zone.group.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(!m) continue; n++; if(m.lightMap){ nl++; lm.add(((m.lightMap.image&&(m.lightMap.image.currentSrc||m.lightMap.image.src))||m.lightMap.name||'?').split('/').pop()); } } });
  return {layout:L?{spawn:L.spawn, bounds:L.bounds, door:L.door}:null, mats:n, withLightMap:nl, maps:[...lm]}; })"""


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 房間截圖（%s）：SHA=%s（worktree 實際 %s）；%d 張；Playwright ≠ iPhone' % (TAG, os.environ.get('SHA', '?'), real or '?', len(SHOTS)), flush=True)
    rec = {'tag': TAG, 'sha': os.environ.get('SHA') or real, 'shots': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg)
        if R.check('遊戲載入', ok, ''):
            await pg.evaluate("localStorage.clear()")
            for row in SHOTS:
                zone, day, h, nm = row[:4]; view = row[4] if len(row) > 4 else ''   # 第 5 欄（選填）：yaw＝照 layout spawn 的朝向往裡面看；yaw_ceil＝同一點往上看天花板（LAWWW2-B 14:48 LAST2LM：205 的窗在 −z、臥室 C 的窗在東）
                tag = '[%s %s]' % (TAG, nm)
                try:
                    R.setup('%s 讀檔 %s %s %s（條件事件關閉）' % (tag, zone, day, h))
                    s = await D.load_zone(pg, cdp, zone, day, float(h), wait=9000)
                    if not R.check('%s 進得了 %s' % (tag, zone), s['zone'] == zone, J(s)): continue
                    await pg.wait_for_timeout(3000)
                    g = await pg.evaluate(GEO, zone)
                    L_ = g.get('layout') or {}; sp = L_.get('spawn') or {'x': s['x'], 'z': s['z']}; bd = L_.get('bounds') or {'z0': sp['z'] - 2, 'z1': sp['z'] + 4}
                    eye = [sp['x'] * 0.85, 1.6, max(bd['z0'] + 0.35, sp['z'] - 0.2)]; look = [0.0, 1.1, bd['z1']]
                    if view.startswith('yaw') and sp.get('yaw') is not None:
                        import math as _m
                        fx, fz = _m.sin(sp['yaw']), _m.cos(sp['yaw'])
                        eye = [sp['x'] - fx * 0.2, 1.6, sp['z'] - fz * 0.2]
                        look = [sp['x'] + fx * 4, 1.1, sp['z'] + fz * 4] if view == 'yaw' else [sp['x'] + fx * 1.2, 3.6, sp['z'] + fz * 1.2]
                    cam = await D.user_shot(pg, cdp, 'room_%s_%s' % (TAG, nm), {'eye': eye, 'look': look, 'lens': 20})
                    R.note('%s 光照貼圖：材質 %d 個、接了 lightMap %d 個，貼圖 %s' % (tag, g['mats'], g['withLightMap'], J(g['maps'])))
                    rec['shots'].append({'name': nm, 'zone': zone, 'day': day, 'h': h, 'cam': cam, 'lm': g})
                except Exception as ex: R.check('%s 探針沒有例外' % tag, False, repr(ex)[:300])
            R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'room_shots_%s.json' % TAG), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
