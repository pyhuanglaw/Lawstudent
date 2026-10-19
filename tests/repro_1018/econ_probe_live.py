"""一般速度（不用 turbo）從存檔接著演，選項照偏好挑（PREFER 環境變數，逗號分隔的關鍵字；沒有就選第一個），卡住 90 秒就截圖、印鎖住的人。
   用法：OUT=<資料夾> PREFER=開車 python3 probe_live.py <網址> <存檔.json> <目標事件> [最多秒數]"""
import asyncio, json, os, sys, time
sys.path.insert(0, 'tests')
from playwright.async_api import async_playwright
import playlib as L
URL, SNAP, target = sys.argv[1], sys.argv[2], sys.argv[3]
MAXS = float(sys.argv[4]) if len(sys.argv) > 4 else 1800
PREFER = [w for w in os.environ.get('PREFER', '').split(',') if w]
OUT = os.environ.get('OUT', '.')
LOCK = """(()=>{ const E=GAME.E,D=GAME.D||{},G=GAME.G; const hud=document.getElementById('hud'); return {d:G.day,h:+G.hour.toFixed(2),z:G.zone,done:Object.keys((G.flags.ECONFF||{}).done||{}).join(','),ev:Object.keys(G.events.done||{}).join(','),
  depth:D.busyDepth,busy:!!E.player.busy,who:(D.busyWho||[]).slice(),ff:!!(typeof ECONFF!=='undefined'&&ECONFF.busy),dact:!!D.active,evr:typeof EVENTS!=='undefined'?EVENTS.running:null,adv:typeof ADV!=='undefined'&&!!ADV.active,
  seat:!!E.player.seat,paused:!!E.paused,path:!!(E.player.path&&E.player.path.length),cam:E.cam.mode,hud:hud?hud.className:null,stale:D.stale,
  phone:!document.getElementById('phone').classList.contains('hide'),fade:document.getElementById('fade').className}; })()"""
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p)
        await pg.goto(URL); await L.wait_loaded(pg)
        st = json.load(open(SNAP))
        await pg.evaluate("(async(st)=>{ document.getElementById('titleScreen').classList.add('hide'); const r=document.getElementById('rotate'); if(r) r.classList.remove('want'); await GAME.applySave(st); })(" + json.dumps(st) + ")")
        await pg.evaluate("window.__T=[]; const o=ADV.log; ADV.log=function(n,t){ try{ window.__T.push([GAME.G.day,+GAME.G.hour.toFixed(2),n||'',t]); }catch(e){} return o.apply(this,arguments); }")
        t0 = time.time(); lastk = None; tk = time.time()
        while time.time() - t0 < MAXS:
            s = await L.state(pg); lk = await pg.evaluate(LOCK)
            k = json.dumps([lk['d'], lk['h'], lk['z'], lk['done'], lk['depth'], lk['ff'], lk['dact'], lk['evr'], s['dlg'], s['choices'], s.get('dtext')], ensure_ascii=False)
            if k != lastk:
                lastk = k; tk = time.time()
                print(f"[{time.time()-t0:5.0f}s] {lk['d']} {lk['h']} {lk['z']} steps={lk['done'][-30:]} depth={lk['depth']} ff={lk['ff']} dlg={s['dlg']} ch={s['choices']} evr={lk['evr']} adv={lk['adv']} who={lk['who']} t={(s.get('dtext') or '')[:30]}", flush=True)
            elif time.time() - tk > 90:
                print('STUCK 90s', json.dumps(lk, ensure_ascii=False), json.dumps(s, ensure_ascii=False), flush=True)
                await pg.screenshot(path=os.path.join(OUT, 'stuck.png')); break
            if target in lk['ev'].split(','): print('REACHED', target); break
            if lk['phone']: await L.close_panels(pg, cdp); await pg.wait_for_timeout(600); continue
            if s['choices']:
                texts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
                pick = 0
                for i, tx in enumerate(texts):
                    if any(w in tx for w in PREFER): pick = i; break
                print('  choose', pick, texts, flush=True)
                c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); const e=b[i]||b[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % pick)
                await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900); continue
            if s['dlg']:
                c = await pg.evaluate("(()=>{ const e=document.getElementById('dlg'); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
                await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(700); continue
            await pg.wait_for_timeout(1000)
        open(os.path.join(OUT, 'transcript_live.json'), 'w').write(await pg.evaluate('JSON.stringify(window.__T||[])'))
        print('errs', errs[:5]); print('final', json.dumps(await pg.evaluate(LOCK), ensure_ascii=False)); await b.close()
asyncio.run(main())
