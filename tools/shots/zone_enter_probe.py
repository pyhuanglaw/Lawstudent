"""換區域卡頓的量測（PERF-ZONE-ENTER-1018，使用者 2026-10-18 X14「電腦換畫面卡一兩秒（溫州街、咖啡廳）」；LAWWW2 2026-10-21）。
從公館進溫州街、從溫州街進咖啡廳，各「第一次進」（冷：模型、貼圖、shader 都還沒有）、「第二次進」（熱）一次；每一次記：
  ・GAME.enter() 從呼叫到結束（淡出 → 建區域 → 第一格 → 淡入）的時間，其中 E.loadZone（同步建區域，含合併 z.mergeMs）多久；
  ・之後 30 秒每一格的間隔（requestAnimationFrame 的時間差）：最長的 12 格是第幾秒、那一格新編譯了幾個 shader（renderer.info.programs）；
  ・正式模型（ASSETS.loadOne）每個從開始載入到載好的時間點；
  ・shader 程式、貼圖、幾何的數量變化。
SwiftShader 的時間不是電腦、手機真正的時間（全部用 CPU 模擬，慢很多），只拿來看「卡在哪一段、和誰一起發生」。
用法（先開 http server；一次只跑這一支，別的瀏覽器工作會讓時間不準）：python3 tools/shots/zone_enter_probe.py <URL（不含參數）> <輸出.json>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]

HOOK = """(()=>{ if(window.__zp) return; const P=window.__zp={frames:[],loads:[],marks:[]}; const E=GAME.E, R=E.renderer;
  const lo=ASSETS.loadOne; ASSETS.loadOne=function(k,...a){ const t0=performance.now(), rec={k,t0,t1:null,cached:!!(ASSETS.cache&&ASSETS.cache[k])}; P.loads.push(rec); const p=lo.call(this,k,...a); Promise.resolve(p).then(()=>{ rec.t1=performance.now(); },()=>{ rec.t1=-1; }); return p; };
  const lz=E.loadZone; E.loadZone=function(...a){ const t0=performance.now(); const z=lz.apply(this,a); P.marks.push({what:'loadZone',t0,ms:performance.now()-t0,merge:z&&z.mergeMs||0,merged:z&&z.mergedCount||0}); return z; };
  let last=performance.now(); const tick=()=>{ const t=performance.now(); P.frames.push([t,t-last,R.info.programs?R.info.programs.length:0]); last=t; requestAnimationFrame(tick); }; requestAnimationFrame(tick); })()"""

async def phase(pg, zone, label, rec_s=30):
    t0 = await pg.evaluate("performance.now()")
    info0 = await pg.evaluate("(()=>{ const i=GAME.E.renderer.info; return {prog:i.programs?i.programs.length:0,tex:i.memory.textures,geo:i.memory.geometries}; })()")
    ms = await pg.evaluate("(async()=>{ const t=performance.now(); await GAME.enter('%s'); return performance.now()-t; })()" % zone)
    await pg.wait_for_timeout(rec_s * 1000)
    r = await pg.evaluate("""((t0)=>{ const P=window.__zp, i=GAME.E.renderer.info; const fr=P.frames.filter(f=>f[0]>=t0); let prev=null; const rows=fr.map(f=>{ const d=prev==null?0:f[2]-prev; prev=f[2]; return {t:+((f[0]-t0)/1000).toFixed(2),ms:Math.round(f[1]),newProg:d}; });
      const top=rows.slice().sort((a,b)=>b.ms-a.ms).slice(0,12); const mk=P.marks.filter(m=>m.t0>=t0).map(m=>({what:m.what,ms:Math.round(m.ms),merge:Math.round(m.merge),merged:m.merged}));
      const lds=P.loads.filter(l=>l.t0>=t0).map(l=>({k:l.k,cached:l.cached,start:+((l.t0-t0)/1000).toFixed(2),done:l.t1==null?null:(l.t1<0?'失敗':+((l.t1-t0)/1000).toFixed(2))}));
      const med=(a=>{ const s=a.slice().sort((x,y)=>x-y); return s.length?s[Math.floor(s.length/2)]:0; })(rows.slice(-60).map(r=>r.ms));
      const lp=GAME.E.lastPrewarm&&GAME.E.lastPrewarm.ms!=null?GAME.E.lastPrewarm:null; if(GAME.E.lastPrewarm) GAME.E.lastPrewarm=null;
      return {frames:rows.length,steadyMs:med,over100:rows.filter(r=>r.ms>100).length,over250:rows.filter(r=>r.ms>250).length,top,rows,marks:mk,loads:lds,progEnd:i.programs?i.programs.length:0,tex:i.memory.textures,geo:i.memory.geometries,zone:GAME.E.zone&&GAME.E.zone.def&&GAME.E.zone.def.id,prewarm:lp}; })(%s)""" % json.dumps(t0))
    r.update({'label': label, 'enterMs': round(ms), 'progStart': info0['prog'], 'texStart': info0['tex'], 'geoStart': info0['geo']})
    # 玩家看得到的部分：淡入（GAME.enter 結束前 0.5 秒）開始以後 10 秒內，最長的一格、超過 100 ms 的格子加起來多久（黑畫面時的卡不算：玩家只看到黑畫面多停一下）
    fin = r['enterMs'] / 1000.0; vis = [x for x in r['rows'] if fin - 0.55 <= x['t'] <= fin + 10]
    r['visibleMaxMs'] = max([x['ms'] for x in vis] or [0]); r['visibleStallMs'] = sum(x['ms'] for x in vis if x['ms'] > 100); r['blackMs'] = round(max(0.0, fin - 0.5) * 1000)
    del r['rows']
    print(json.dumps({k: r[k] for k in ('label', 'zone', 'enterMs', 'blackMs', 'visibleMaxMs', 'visibleStallMs', 'marks', 'prewarm', 'progStart', 'progEnd', 'texStart', 'tex', 'steadyMs', 'over100', 'over250')}, ensure_ascii=False), flush=True)
    print('  最長的幾格：' + json.dumps(r['top'][:8], ensure_ascii=False), flush=True)
    print('  正式模型：' + json.dumps(r['loads'], ensure_ascii=False)[:1500], flush=True)
    return r

async def main():
    run = L.Run('zone_enter_probe', os.path.dirname(os.path.abspath(OUT)) or '.'); res = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, {'zone': 'gongguan', 'hour': 15.0, 'weather': 'clear', 'pos': None}, quiet_events=True)
        run.setup('[前置] 讀檔到公館 15:00（quiet_events）；等 25 秒讓公館的模型都接上')
        await pg.wait_for_timeout(25000); await pg.evaluate(HOOK)
        res.append(await phase(pg, 'wenzhou', '公館 → 溫州街（第一次）'))
        res.append(await phase(pg, 'cafe', '溫州街 → 咖啡廳（第一次）'))
        res.append(await phase(pg, 'wenzhou', '咖啡廳 → 溫州街（第二次）'))
        res.append(await phase(pg, 'cafe', '溫州街 → 咖啡廳（第二次）'))
        json.dump(res, open(OUT, 'w'), ensure_ascii=False, indent=1)
        run.check('四次換區域都到了', [r['zone'] for r in res] == ['wenzhou', 'cafe', 'wenzhou', 'cafe'], json.dumps([r['zone'] for r in res]))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()
sys.exit(asyncio.run(main()))
