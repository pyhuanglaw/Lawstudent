"""室內進場卡頓的量測（PERF-ZONE-ENTER-1018 第三輪；LAWWW-B 10-30 派工：經濟系那一年最常進的室內；LAWWW2-B 2026-10-30）。
照 tools/shots/zone_enter_probe.py（第一輪）的量法，路線可以自己給：每一站記
  ・GAME.enter() 從呼叫到結束的時間、黑畫面多久（blackMs）、淡入以後 10 秒內最長的一格（visibleMaxMs）、比平常多出來的時間（visibleExcessMs）；
  ・淡入以後 10 秒內新編了幾個 shader（visibleNewProg）、哪幾格（top）；正式模型什麼時候載好（loads）；E.lastPrewarm（黑畫面時編了多少、等了多久）。
SwiftShader 的時間不是電腦、手機真正的時間（全部用 CPU 模擬，慢很多），只拿來比前後、看「卡在哪一段」。
用法（先開 http server；一次只跑這一支）：python3 tools/shots/interior_enter_probe.py <URL（不含參數）> <輸出.json> [--desktop] [--route 區域,區域,…] [--start 區域] [--rec 秒]"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
def _arg(k, d=None): return sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
ROUTE = _arg('--route', 'wenzhou,cafe,wenzhou,noodle,campus,soclib,campus,boya,campus,dorm,campus,soclib,campus,boya,gongguan,noodle,wenzhou,cafe').split(',')
START = _arg('--start', 'gongguan'); REC = int(_arg('--rec', '20'))
KEEP_ANON = '--keep-anon' in sys.argv   # 量測用：路人底模池換區域時不輪換（已經載好的就照用），看路人 VRM 下載、換上佔多少
DESKTOP = '--desktop' in sys.argv       # 電腦（1280×720、滑鼠、一般 UA）：不縮貼圖（ASSETS.texCap 空）、會預先載下一個區域（使用者回報的是電腦）

HOOK = """(()=>{ if(window.__zp) return; const P=window.__zp={frames:[],loads:[],marks:[]}; const E=GAME.E, R=E.renderer;
  const lo=ASSETS.loadOne; ASSETS.loadOne=function(k,...a){ const t0=performance.now(), rec={k,t0,t1:null,cached:!!(ASSETS.cache&&ASSETS.cache[k])}; P.loads.push(rec); const p=lo.call(this,k,...a); Promise.resolve(p).then(()=>{ rec.t1=performance.now(); },()=>{ rec.t1=-1; }); return p; };
  const lz=E.loadZone; E.loadZone=function(...a){ const t0=performance.now(); const z=lz.apply(this,a); P.marks.push({what:'loadZone',t0,ms:performance.now()-t0,merge:z&&z.mergeMs||0,merged:z&&z.mergedCount||0}); return z; };
  let last=performance.now(); const tick=()=>{ const t=performance.now(); P.frames.push([t,t-last,R.info.programs?R.info.programs.length:0]); last=t; requestAnimationFrame(tick); }; requestAnimationFrame(tick); })()"""

async def phase(pg, zone, label, rec_s=None):
    rec_s = rec_s or REC
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
    # 一格的時間是「上一格結束 → 這一格結束」：開始時間在淡入以前的（黑畫面時開始的長格）不算看得到。SwiftShader 每一格本來就慢（steadyMs），所以另外算「比平常多出來的」
    fin = r['enterMs'] / 1000.0; vis = [x for x in r['rows'] if x['t'] - x['ms'] / 1000.0 >= fin - 0.55 and x['t'] <= fin + 10]
    r['visibleMaxMs'] = max([x['ms'] for x in vis] or [0]); r['visibleStallMs'] = sum(x['ms'] for x in vis if x['ms'] > 100)
    r['visibleExcessMs'] = round(sum(max(0, x['ms'] - 2 * r['steadyMs']) for x in vis)); r['blackMs'] = round(max(0.0, fin - 0.5) * 1000)
    r['visibleNewProg'] = sum(x['newProg'] for x in vis)
    r['rows'] = [[x['t'], x['ms'], x['newProg']] for x in r['rows']]
    print(json.dumps({k: r[k] for k in ('label', 'zone', 'enterMs', 'blackMs', 'visibleMaxMs', 'visibleStallMs', 'visibleExcessMs', 'visibleNewProg', 'marks', 'prewarm', 'progStart', 'progEnd', 'texStart', 'tex', 'steadyMs', 'over100', 'over250')}, ensure_ascii=False), flush=True)
    print('  最長的幾格：' + json.dumps(r['top'][:8], ensure_ascii=False), flush=True)
    print('  正式模型：' + json.dumps(r['loads'], ensure_ascii=False)[:1500], flush=True)
    return r

async def main():
    run = L.Run('interior_enter_probe', os.path.dirname(os.path.abspath(OUT)) or '.'); res = []
    async with async_playwright() as p:
        if DESKTOP:
            b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=L.ARGS)
            ctx = await b.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1)
            pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            run.setup('[環境] 電腦模擬：1280×720、沒有觸控、一般 UA（不縮貼圖、會預先載下一個區域）')
        else:
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, {'zone': START, 'hour': 15.0, 'weather': 'clear', 'pos': None}, quiet_events=True)
        run.setup('[前置] 讀檔到 %s 15:00（quiet_events）；等 25 秒讓模型都接上' % START)
        if KEEP_ANON:
            await pg.evaluate("""(()=>{ const P=CHAR.anonPool, orig=P.refresh; P.refresh=function(z,l){ if(this.cur&&this.cur.length&&this.cur.every(k=>ASSETS.has(k))){ this.pick={}; this.uses={}; return this.cur; } return orig.call(this,z,l); }; })()""")
            run.setup('[量測用] 路人底模池不輪換（--keep-anon）')
        await pg.wait_for_timeout(25000); await pg.evaluate(HOOK)
        seen = {}; prev = START
        for z in ROUTE:
            seen[z] = seen.get(z, 0) + 1
            res.append(await phase(pg, z, '%s → %s（第 %d 次）' % (prev, z, seen[z]))); prev = z
            json.dump(res, open(OUT, 'w'), ensure_ascii=False, indent=1)
        run.check('每一站都到了', [r['zone'] for r in res] == ROUTE, json.dumps([r['zone'] for r in res]))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()
sys.exit(asyncio.run(main()))
