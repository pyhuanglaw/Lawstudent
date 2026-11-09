"""CC-B（帳號 B）11-09：店門口（從街上看進去）。BB-B 18:37 溫州街五間白天重烘（#196，D120）。判定＝BB。
【前置／捷徑】讀檔（load_zone，條件事件、手機關）到 STREET（預設 wenzhou）HOUR（預設 14）→ 找街上「進那間店」的出口互動點（exit.to＝那間店的 zone）
→ 鏡頭放在出口外面 4.5 m、高 1.6 m（8 個方向裡，2／3／4.5 m 都站得住、離出口最遠的那一個＝街上），看出口 1.3 m 高 → 拍一張（藏 HUD 和玩家）。
用法：LW_TESTS=<wt>/tests SHOPS=wz_brunch,wz_teishoku,... [TAG=x] python3 cc_storefront_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests')); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHOPS = [s for s in (os.environ.get('SHOPS') or 'wz_brunch,wz_teishoku,wz_mokuyobi,wz_offbeat,wz_print').split(',') if s]
STREET = os.environ.get('STREET') or 'wenzhou'; HOUR = float(os.environ.get('HOUR') or 14); TAG = os.environ.get('TAG') or 'x'
R = L.Run('storefront_' + TAG, OUT); D.setup(R, OUT)
FIND = """(z=>{ const E=GAME.E; const it=E.interactables.find(i=>i.exit&&i.exit.to===z&&!i.hidden); if(!it) return null; const lv=it.lv|0; let best=null;
  for(let a=0;a<8;a++){ const dx=Math.sin(a*Math.PI/4), dz=Math.cos(a*Math.PI/4); if(![2,3,4.5].every(r=>E.canStand(it.x+dx*r,it.z+dz*r,0.3,lv))) continue; best=best||{dx,dz,a}; }
  if(!best) return {label:it.label,x:it.x,z:it.z,eye:null}; return {label:it.label, x:+it.x.toFixed(2), z:+it.z.toFixed(2), a:best.a, eye:[+(it.x+best.dx*4.5).toFixed(2),1.6,+(it.z+best.dz*4.5).toFixed(2)], look:[+it.x.toFixed(2),1.3,+it.z.toFixed(2)]}; })"""
async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 店門口：worktree %s；%s %s；TAG %s；Playwright ≠ iPhone' % (real or '?', STREET, HOUR, TAG), flush=True)
    res = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        R.setup('【前置／捷徑】讀檔到 %s 2025-10-18 %s（條件事件、手機關）' % (STREET, HOUR))
        await D.load_zone(pg, cdp, STREET, '2025-10-18', HOUR, wait=12000); await pg.wait_for_timeout(5000)
        for z in SHOPS:
            f = await pg.evaluate(FIND, z); R.note('%s 出口：%s' % (z, json.dumps(f, ensure_ascii=False)))
            if not R.check('%s 街上找得到進店的出口、外面站得住' % z, bool(f and f.get('eye')), ''): res.append({'zone': z, 'skip': f}); continue
            c = await D.user_shot(pg, cdp, 'front_%s_%s' % (z, TAG), {'eye': f['eye'], 'look': f['look'], 'lens': 18}, hide_player=True)
            res.append({'zone': z, 'find': f, 'cam': c})
        R.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    json.dump(res, open(os.path.join(OUT, 'storefront_%s.json' % TAG), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
