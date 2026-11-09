"""CC-B（帳號 B）11-09：大口 1F 小卡頓 CPU 紀錄（LAWWW2-B 11-08 20:43；判定＝LAWWW2）。PC GPU、SOLO。
【前置／捷徑】讀檔（load_zone，條件事件、手機關）到 ZONE（預設 xs_dakou）14:00 晴、1F 出生點；站 SETTLE 秒（預設 30）。
然後同時開：CDP Profiler（取樣 1 ms，存 cpu.cpuprofile）＋ CDP Tracing（devtools.timeline、disabled-by-default-devtools.timeline、v8.execute、disabled-by-default-v8.cpu_profiler，
存 trace.json.gz；DevTools Performance 面板可直接開）＋ 頁面裡 rAF 記每一幀間隔（>100 ms 的列出來，對 trace 的時間）。錄 SECS 秒（預設 20）。
用法：LW_TESTS=<wt>/tests [ZONE=xs_dakou] [SETTLE=30] [SECS=20] python3 cc_cpu_trace_probe.py <url（?perf）> <out>"""
import os, sys, json, asyncio, gzip
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests')); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
ZONE = os.environ.get('ZONE') or 'xs_dakou'; SETTLE = float(os.environ.get('SETTLE') or 30); SECS = float(os.environ.get('SECS') or 20)
R = L.Run('cpu_trace', OUT); D.setup(R, OUT)
CATS = 'devtools.timeline,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.frame,v8.execute,disabled-by-default-v8.cpu_profiler,v8,blink.user_timing'
FRAMES = """(ms)=>new Promise(r=>{ const out=[]; let last=performance.now(); const t0=last; const to=performance.timeOrigin; try{ performance.mark('cc_trace_start'); }catch(e){}
  function f(t){ const d=t-last; if(d>100){ out.push({at_ms:Math.round(t-t0), ms:Math.round(d), ts_us:Math.round((to+t)*1000), mark:'cc_hitch_'+Math.round(t-t0)}); try{ performance.mark('cc_hitch_'+Math.round(t-t0)+'_'+Math.round(d)+'ms'); }catch(e){} } last=t; if(t-t0<ms) requestAnimationFrame(f); else r({n_hitch:out.length, hitches:out, t0_us:Math.round((to+t0)*1000)}); } requestAnimationFrame(f); })"""
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        if os.environ.get('PREJS'): R.setup('【前置】載入後先執行 %s' % os.environ['PREJS']); R.note('PREJS → %s' % await pg.evaluate('(()=>{ ' + os.environ['PREJS'] + '; return true; })()'))   # 例：CHAR.presetSphere=false（PERF-XS-NPC-1108 (D) 改前對照）
        R.setup('【前置／捷徑】讀檔到 %s %s %s（條件事件、手機關），出生點' % (ZONE, os.environ.get('DAY') or '2025-10-18', os.environ.get('HOUR') or 14))
        await D.load_zone(pg, cdp, ZONE, os.environ.get('DAY') or '2025-10-18', float(os.environ.get('HOUR') or 14.0), wait=9000)
        await pg.evaluate("w=>{ try{ GAME.G.weather=w; GAME.E.setWeather&&GAME.E.setWeather(w); }catch(e){} }", 'sunny')
        info = await pg.evaluate("""(()=>{ const E=GAME.E; let rnd=''; try{ const gl=E.renderer.getContext(); const x=gl.getExtension('WEBGL_debug_renderer_info'); rnd=x?gl.getParameter(x.UNMASKED_RENDERER_WEBGL):''; }catch(e){}
          return {zone:E.zone&&E.zone.id, lv:E.player.lv|0, npc:(E.npcs||[]).length, q:(E.q&&E.q.level)||null, pr:E.renderer.getPixelRatio(), renderer:rnd}; })()""")
        R.note('INFO %s' % json.dumps(info, ensure_ascii=False)); R.check('在 %s' % ZONE, info['zone'] == ZONE, '')
        R.note('先站 %s 秒（暖機）' % SETTLE); await pg.wait_for_timeout(int(SETTLE * 1000))
        if os.environ.get('CPU_THROTTLE'): await cdp.send('Emulation.setCPUThrottlingRate', {'rate': float(os.environ['CPU_THROTTLE'])}); R.note('CPU 降速 %s 倍（手機模擬）' % os.environ['CPU_THROTTLE'])
        chunks = []; done = asyncio.get_event_loop().create_future()
        cdp.on('Tracing.dataCollected', lambda e: chunks.extend(e.get('value', [])))
        cdp.on('Tracing.tracingComplete', lambda e: (not done.done()) and done.set_result(1))
        await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', {'interval': 1000})
        await cdp.send('Tracing.start', {'categories': CATS, 'transferMode': 'ReportEvents'})
        await cdp.send('Profiler.start')
        fr = await pg.evaluate(FRAMES, int(SECS * 1000))
        prof = await cdp.send('Profiler.stop')
        await cdp.send('Tracing.end')
        try: await asyncio.wait_for(done, 120)
        except asyncio.TimeoutError: R.note('Tracing.tracingComplete 120 秒沒來')
        json.dump(prof['profile'], open(os.path.join(OUT, 'cpu.cpuprofile'), 'w'))
        with gzip.open(os.path.join(OUT, 'trace.json.gz'), 'wt', encoding='utf-8') as fh: json.dump({'traceEvents': chunks}, fh)
        json.dump({'info': info, 'frames': fr}, open(os.path.join(OUT, 'hitches.json'), 'w'), ensure_ascii=False, indent=1)
        R.note('卡頓 >100 ms：%d 個 %s' % (fr['n_hitch'], json.dumps(fr['hitches'][:20])))
        R.note('檔案：cpu.cpuprofile %d KB、trace.json.gz %d KB（事件 %d 個）' % (os.path.getsize(os.path.join(OUT, 'cpu.cpuprofile')) // 1024, os.path.getsize(os.path.join(OUT, 'trace.json.gz')) // 1024, len(chunks)))
        R.check('錄到 trace 事件', len(chunks) > 1000, str(len(chunks)))
        R.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
