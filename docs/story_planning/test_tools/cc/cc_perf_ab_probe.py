"""CC-B（帳號 B）11-09：PERF-AB-1108（BB-B 18:49；LAWWW2-B 789ed786c perf_ab_probe.js，原檔照抄在 perf_ab_probe_lawww2_789ed786c.js）。效能判定＝LAWWW2。
每個點：【前置／捷徑】讀檔（load_zone，條件事件、手機關）到那一區 14:00 晴；1f＝讀檔的出生點（門口往裡看、鏡頭照遊戲預設）；
2f＝讀檔把玩家放到 2F（lv1，2F 座位旁）。站好等 4 秒，整段跑 LAWWW2 的腳本（約 60 秒：①一次關一樣各 5 秒 ②站 20 秒記 >100 ms 的幀）。
用法：LW_TESTS=<wt>/tests [PTS=xs_shanlan:1f,...] python3 cc_perf_ab_probe.py <url（?perf）> <out>"""
import os, sys, json, asyncio, re
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests')); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
PTS = [p.split(':') for p in (os.environ.get('PTS') or 'xs_shanlan:1f,xs_shanlan:2f,xs_dakou:1f,xs_dakou:2f,xs_haopai:1f,xs_tongxian:1f').split(',') if p]
JS = open(os.path.join(HERE, 'perf_ab_probe_lawww2_789ed786c.js'), encoding='utf-8').read()
JS = re.sub(r'^/\*.*?\*/\s*', '', JS, flags=re.S).strip().rstrip(';')
DAY = os.environ.get('DAY') or '2025-10-18'
R = L.Run('perf_ab', OUT); D.setup(R, OUT)
INFO = """(()=>{ const E=GAME.E; let rnd=''; try{ const gl=E.renderer.getContext(); const x=gl.getExtension('WEBGL_debug_renderer_info'); rnd=x?gl.getParameter(x.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER); }catch(e){}
  const P=E.player.obj.position; return {zone:E.zone&&E.zone.id, lv:E.player.lv|0, pos:[+P.x.toFixed(2),+P.z.toFixed(2)], yaw:+E.cam.yaw.toFixed(2), hour:+(+GAME.G.hour).toFixed(2), weather:E.weather||GAME.G.weather, q:(E.q&&E.q.level)||null, dpr:devicePixelRatio, pr:E.renderer.getPixelRatio(), renderer:rnd}; })()"""
async def main():
    res = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        for zone, fl in PTS:
            tag = '[%s %s]' % (zone, fl); rec = {'zone': zone, 'floor': fl}
            try:
                R.setup('%s 【前置／捷徑】讀檔到 %s %s 14:00（條件事件、手機關）' % (tag, zone, DAY))
                await D.load_zone(pg, cdp, zone, DAY, 14.0, wait=9000)
                if fl == '2f':
                    p2 = await pg.evaluate("(()=>{ const q=GAME.E.interactables.find(i=>i.seat&&((i.seat.lv|0)>=1||(i.lv|0)>=1)); return q?{x:q.x,z:q.z}:null; })()")
                    R.setup('%s 【前置／捷徑】讀檔把玩家放到 2F（lv1，2F 座位旁 %s）' % (tag, json.dumps(p2)))
                    if not p2: R.check('%s 找得到 2F 座位' % tag, False, ''); continue
                    await D.load_zone(pg, cdp, zone, DAY, 14.0, x=p2['x'], z=p2['z'] + 0.6, yaw=0.0, lv=1, wait=9000)
                await pg.evaluate("w=>{ try{ GAME.G.weather=w; GAME.E.setWeather&&GAME.E.setWeather(w); }catch(e){} }", 'sunny')
                await pg.wait_for_timeout(4000)
                rec['info'] = await pg.evaluate(INFO); print('%s INFO %s' % (tag, json.dumps(rec['info'], ensure_ascii=False)), flush=True)
                await pg.screenshot(path=os.path.join(OUT, 'ab_%s_%s.png' % (zone, fl)))
                if fl == '2f' and rec['info']['lv'] < 1: R.check('%s 玩家在 2F（lv1）' % tag, False, json.dumps(rec['info']))
                out = await pg.evaluate(JS); rec['out'] = out
                print('%s TABLE1 calls=%s programs=%s' % (tag, out.get('calls'), out.get('programs')), flush=True)
                for r in out.get('rows', []): print('%s   %-16s n=%-5s fps %-6s worst %s ms' % (tag, r['cond'], r['n'], r['fps'], r['worst']), flush=True)
                print('%s TABLE2 卡頓 >100 ms：%d 個' % (tag, len(out.get('hitches', []))), flush=True)
                for h in out.get('hitches', []): print('%s   %s' % (tag, json.dumps(h, ensure_ascii=False)), flush=True)
                R.check('%s 量完（%s 列、info.zone=%s）' % (tag, len(out.get('rows', [])), rec['info']['zone']), rec['info']['zone'] == zone and len(out.get('rows', [])) >= 8, '')
            except Exception as ex:
                rec['err'] = repr(ex)[:300]; R.check('%s 沒有例外' % tag, False, rec['err'])
            res.append(rec)
        R.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    json.dump(res, open(os.path.join(OUT, 'perf_ab.json'), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
