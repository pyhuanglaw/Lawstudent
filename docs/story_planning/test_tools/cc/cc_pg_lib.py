"""CC（帳號 A）11-12：合成「畢業後」存檔的共用函式（BB 02:54 轉 LAWWW 的 GOCLASS 規格第 6 點；之後其他探針 import）。
做法照 tests/aa510_511_feed_unit.js 第 311 行附近的 Y4F、tests/y5_delay_unit.js 的 grad()：
  stage 'law'；flags.GRADUATED＝2029-06-02 那一天；GRAD_DONE；MOVED_OUT＝2029-06-28 那一天；HOME_AFTER 'home'；Y4_PATH 'other'；ROOM_Y2／ROOM_Y3／ROOM_Y4；
  flags.PG={done:{grad:1}}（＝PG.rec(G).done.grad）；G.day 由參數指定（例：2030-02-10）；zone 預設 'gongguan'（退宿了，不能在宿舍）。
讀檔後檢查 PG.on(GAME.G) 是 true；不是就把 PG.on 有沒有、G.flags.PG、G.zone 記下來。log 一律標【捷徑：合成畢業後存檔】。
日期換天數：CALENDAR.dayOf（有的話）→ 沒有就 STORY.dayOfKey（CALENDAR 目前沒有 dayOf，6f9961fa6 查過）。
用法（探針裡）：
    import cc_pg_lib as PGL
    r = await PGL.load_pg(pg, cdp, run, '2030-02-10', hour=12.0)   # r['on'] 是 PG.on(GAME.G) 的結果
獨立自檢：LW_TESTS=<wt>/tests python3 cc_pg_lib.py <url> <out>"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests')
import playlib as L

J = lambda o: json.dumps(o, ensure_ascii=False, default=str)
TAG = '【捷徑：合成畢業後存檔】'
DAYOF_JS = r"""(k=>{ let d=null; try{ if(typeof CALENDAR!=='undefined'&&typeof CALENDAR.dayOf==='function') d=CALENDAR.dayOf(k); }catch(e){}
  if(d==null&&typeof STORY!=='undefined'&&STORY.dayOfKey) d=STORY.dayOfKey(k); if(d==null) return null; const c=CALENDAR.dateOf(d); return {d, wd:c.wd===7?0:c.wd, key:c.key}; })"""
PGCHK_JS = r"""(()=>{ const G=GAME.G; let on=null, err=null; try{ on=(typeof PG!=='undefined'&&PG.on)?!!PG.on(G):'沒有 PG.on'; }catch(e){ err=String(e&&e.message||e); }
  let term=null; try{ term=STORY.termAt?STORY.termAt(G.day):null; }catch(e){}
  return {on, err, hasPG:typeof PG!=='undefined', hasOn:typeof PG!=='undefined'&&typeof PG.on==='function', flagsPG:JSON.parse(JSON.stringify((G.flags||{}).PG||null)), zone:G.zone, day:G.day,
    date:(()=>{ try{ return CALENDAR.dateOf(G.day).key; }catch(e){ return null; } })(), hour:+(+G.hour).toFixed(3), stage:G.stage, term,
    grad:(G.flags||{}).GRADUATED, movedOut:(G.flags||{}).MOVED_OUT, epi:!!(G.flags||{}).EPILOGUE_DONE}; })()"""


async def day_of(pg, key):
    return await pg.evaluate(DAYOF_JS, key)


async def make_pg_state(pg, day_key='2030-02-10', hour=12.0, zone='gongguan', flags=None, pos=None):
    """回傳 (存檔 dict, 說明)。flags 以 GAME.defaults() 的為底，再蓋上畢業後那幾個，最後蓋上參數 flags"""
    d = await day_of(pg, day_key); g = await day_of(pg, '2029-06-02'); m = await day_of(pg, '2029-06-28')
    if not (d and g and m): raise RuntimeError('日期換不出天數：%s %s %s' % (J(d), J(g), J(m)))
    F = await pg.evaluate("JSON.parse(JSON.stringify(GAME.defaults('祐廷').flags))")
    F.update({'GRADUATED': g['d'], 'GRAD_DONE': True, 'MOVED_OUT': m['d'], 'HOME_AFTER': 'home', 'Y4_PATH': 'other',
              'ROOM_Y2': True, 'ROOM_Y3': True, 'ROOM_Y4': True, 'PG': {'done': {'grad': 1}}})
    F.update(flags or {})
    st = {'name': '祐廷', 'stage': 'law', 'zone': zone, 'day': d['d'], 'weekday': d['wd'], 'hour': hour, 'weather': 'clear', 'flags': F}
    if pos: st['pos'] = pos
    why = '%s %s（第 %d 天）%.2f 時 %s；GRADUATED=%d（2029-06-02）、MOVED_OUT=%d（2029-06-28）、HOME_AFTER home、Y4_PATH other、ROOM_Y2..4、PG.done.grad' % (
        TAG, d['key'], d['d'], hour, zone, g['d'], m['d'])
    return st, why


async def load_pg(pg, cdp, run, day_key='2030-02-10', hour=12.0, zone='gongguan', flags=None, quiet_events=True, wait_ms=6000):
    """合成畢業後存檔 → 用遊戲自己的讀檔（L.load_state＝GAME.applySave）讀進來 → 檢查 PG.on。回傳檢查結果 dict（多一個 'state'）"""
    st, why = await make_pg_state(pg, day_key, hour, zone, flags)
    run.setup(why + ('（條件事件關著）' if quiet_events else '（條件事件開著，只關手機自動打開）'))
    await L.load_state(pg, st, quiet_events=quiet_events, quiet_phone=True)
    await pg.wait_for_timeout(wait_ms)
    try: await L.close_panels(pg, cdp)
    except Exception: pass
    r = await pg.evaluate(PGCHK_JS)
    if r.get('on') is True: run.note('%s 讀檔後 PG.on(GAME.G)=true（%s %s %.2f 時）' % (TAG, r['date'], r['zone'], r['hour']))
    else: run.note('%s 讀檔後 PG.on 不是 true：PG.on=%s（有 PG：%s、有 PG.on：%s、錯誤 %s）；G.flags.PG=%s；G.zone=%s' % (TAG, r.get('on'), r['hasPG'], r['hasOn'], r['err'], J(r['flagsPG']), r['zone']))
    r['state'] = st
    return r


async def _selftest(url, out):
    from playwright.async_api import async_playwright
    R = L.Run('pglib', out)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        try:
            await pg.goto(url); R.check('遊戲載入', await L.wait_loaded(pg))
            r = await load_pg(pg, cdp, R, os.environ.get('PGDAY') or '2030-02-10')
            R.check('合成畢業後存檔：PG.on(GAME.G) 是 true', r.get('on') is True, J({k: v for k, v in r.items() if k != 'state'}))
            await pg.screenshot(path=os.path.join(out, 'pglib_loaded.png'))
            R.check('沒有 JS 例外', not errs, J(errs[:3]))
        finally:
            await b.close()
    return R.finish()


if __name__ == '__main__':
    os.makedirs(sys.argv[2], exist_ok=True)
    sys.exit(asyncio.run(_selftest(sys.argv[1], sys.argv[2])))
