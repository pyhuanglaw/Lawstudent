"""CC-C 11-13：GLB_EVICT（LAWWW-C 15:38，BUG-IOS-RELOAD：iPhone 記憶體不足被踢回標題）。3a37ba48ab 起「離開區域以後放掉最近三區沒用到的建築模型」，?glbevict 才開。
這支照玩家用手機「地點」快速前往一區一區走（ROUTE，預設 campus,gongguan,tingzhou,wenzhou,lane118,campus,dorm），整條走 ROUNDS 輪（預設 2）。
【前置／捷徑】一開始讀檔進宿舍（DAY HOUR，條件事件關掉）。每次換區域以後（到了、能走動、等 SETTLE 秒）記：
  renderer.info.memory 貼圖數、幾何數、programs；performance.memory.usedJSHeapSize；ASSETS.lastEvict；GM.lastZoneWait；按下去到能走動的秒數；
  每區截一張（遊戲畫面，看黑貼圖、方塊備用模型、少東西）。結果 tour.json＋run.log 每一格一行。開不開 ?glbevict 由佇列的網址欄決定（兩趟比）。
CC_02 清單 2026-11-13：1✓（讀檔進宿舍白天、條件事件關；快速前往照玩家） 2✓（地點按鈕從手機頁 data-place 找） 3n/a（路線固定） 4✓（點前 reveal 展開地區、按鈕在才點） 5✓（快速前往，不走路） 6✓（到了等能走動再等 SETTLE 秒才量） 7✓（lint、node 驗 JS） 8n/a（只記數字，判定歸 BB） 9✓（截遊戲畫面原樣） 10✓（中途有對話先點完） 11✓（SHA 40 碼、ENV 沒有「|」） 12✓（FAIL_SETUP 檢查：每一站真的到了那一區） 13n/a（不走路）
用法：LW_TESTS=<wt>/tests SHA=<sha> [ROUTE=campus,gongguan,… ROUNDS=2 DAY=2025-10-22 HOUR=14 SETTLE=4] python3 cc_zone_tour_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE); sys.path.insert(0, os.path.dirname(HERE))
import playlib as L
import cc_d141_lib as D
import cc_phone
import bbplay as P
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
ROUTE = [z for z in (os.environ.get('ROUTE') or 'campus,gongguan,tingzhou,wenzhou,lane118,campus,dorm').split(',') if z]
ROUNDS = int(os.environ.get('ROUNDS') or 2); DAY = os.environ.get('DAY') or '2025-10-22'; HOUR = float(os.environ.get('HOUR') or 14)
SETTLE = float(os.environ.get('SETTLE') or 4)
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('zone_tour', OUT); D.setup(R, OUT)
MET = r"""(()=>{ const E=GAME.E, i=E.renderer.info, pm=performance.memory; let ev=null; try{ ev=(typeof ASSETS!=='undefined'&&ASSETS.lastEvict)?JSON.parse(JSON.stringify(ASSETS.lastEvict)):null; }catch(e){ ev='ERR'; }
  let lzw=null; try{ lzw=(typeof GM!=='undefined'&&GM.lastZoneWait!==undefined)?GM.lastZoneWait:(GAME.lastZoneWait??null); }catch(e){}
  return {zone:GAME.G.zone, tex:i.memory.textures, geom:i.memory.geometries, programs:i.programs?i.programs.length:null, heapMB:pm?+(pm.usedJSHeapSize/1048576).toFixed(1):null, lastEvict:ev, lastZoneWait:lzw, evictOn:/[?&]glbevict/.test(location.search)}; })()"""


async def drain(pg, cdp):
    for _ in range(40):
        q = await D.st(pg)
        if q['choices']: await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); if(b[0]) b[0].click(); })()"); await pg.wait_for_timeout(700); continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        break
    await L.close_panels(pg, cdp)


async def go(pg, cdp, zone):
    await drain(pg, cdp)
    await P.phone_tab(pg, cdp, 'places'); await cc_phone.reveal(pg, cdp, zone)
    c = await pg.evaluate("(z=>{ const e=[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(z+'|')||b.dataset.place===z); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })", zone)
    if not c: await L.close_panels(pg, cdp); return None
    t0 = time.time(); await L.touch_tap(cdp, c[0], c[1])
    for _ in range(240):
        await pg.wait_for_timeout(250)
        q = await D.st(pg)
        if q['zone'] == zone and q.get('stand') and not q.get('busy'): break
        if q['dlg'] or q['choices']: await drain(pg, cdp)
    return round(time.time() - t0, 2)


async def main():
    print('CC 區域巡迴（GLB_EVICT）：SHA %s；%s；ROUTE %s×%d；Playwright ≠ iPhone' % (SHA or '?', URL, ROUTE, ROUNDS), flush=True)
    rows = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(1)
        await P.init(pg)
        await D.load_zone(pg, cdp, 'dorm', DAY, HOUR, wait=8000)
        R.setup('【前置／捷徑】讀檔進宿舍 %s %.1f（條件事件關掉）' % (DAY, HOUR))
        await pg.wait_for_timeout(int(SETTLE * 1000))
        m0 = await pg.evaluate(MET); rows.append(dict(m0, round=0, step=0, secs=None)); R.note('起點 %s' % J(m0))
        for rd in range(1, ROUNDS + 1):
            for k, z in enumerate(ROUTE, 1):
                secs = await go(pg, cdp, z)
                if secs is not None: await pg.wait_for_timeout(int(SETTLE * 1000))
                m = await pg.evaluate(MET)
                ok = m['zone'] == z
                R.check('FAIL_SETUP 檢查：第 %d 輪第 %d 站到了 %s' % (rd, k, z), ok, J({'zone': m['zone'], 'secs': secs}))
                await pg.screenshot(path=os.path.join(OUT, 'tour_r%d_%02d_%s.png' % (rd, k, z)))
                rows.append(dict(m, round=rd, step=k, want=z, secs=secs))
                R.note('第 %d 輪 %02d %s：按下去到能走動 %s 秒；貼圖 %s、幾何 %s、程式 %s、heap %s MB；lastZoneWait %s；lastEvict %s' % (rd, k, z, secs, m['tex'], m['geom'], m['programs'], m['heapMB'], J(m['lastZoneWait']), J(m['lastEvict'])))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'tour.json'), 'w', encoding='utf-8').write(J({'sha': SHA, 'url': URL, 'rows': rows}))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
