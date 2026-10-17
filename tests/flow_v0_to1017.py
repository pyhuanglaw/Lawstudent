"""經濟系驗收（AA_269 第 6 節第 1～4 點）：從標題「新遊戲」不跳日期，一路玩到 2024-10-17 晚上（真實玩家流程，第 3 級；手機模擬 844×390 觸控，不是實機）。
做法：像玩家一樣過日子——
  - 對話點過去；選項照下面的偏好選（起床選單選「直接去上課」、出遊選「出發」、其他選第一個）；
  - 空下來、21:00 以前：打開手機「今天」，按最後一個「跳過時間」（遇到課、約好的時間、劇情會自己停）；
  - 21:00 以後、或跳不過去：用手機「地點」快速前往宿舍（照樣花遊戲時間），走到床邊「睡覺」（快速前往不能用時才一路走回去）。
走路一律點地面／搖桿（playlib.go_to），不瞬移；不改旗標、不撥時間。網址不用 ?turbo（真實速度；SwiftShader 很慢，整支要好幾個小時）。
檢查（10/17 晚上）：每一天都過到（沒有跳日）、宿營旗標（ECON_CAMP_OPEN、E15_BUS）、10/17 一天（dating_kexin、KX_DATING_SINCE、E26_DAY、KX_CAR）、
11 月不排 E15、沒有卡住保險（walkFallbacks）、黑幕沒有擋住對話、沒有 JS 例外。中途卡住超過 4 分鐘會截圖、記下狀態後停止（判失敗）。
用法：python3 tests/flow_v0_to1017.py URL [輸出資料夾]"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_v0_to1017'
PREFER = ['直接去上課', '直接去考場', '出發', '先不要', '先睡。明天再拆。', '睡到明天早上', '睡覺']   # 「照樣跳過會錯過：…」→「先不要」（不翹課）
END_JS = "(()=>{ const G=GAME.G, d=STORY.dayOfKey('2024-10-17'); return G.day>d||(G.day===d&&G.hour>=22.6); })()"

# 下一步要去哪裡：寢室 ← 宿舍門廳 ← 校園 ← 其他區域
NEXT_HOP = """(()=>{ const G=GAME.G, E=GAME.E, z=G.zone, its=E.interactables||[];
  const pick=f=>{ const it=its.find(f); return it?{x:it.x,z:it.z,r:it.radius||1.5,label:it.label||'',lv:it.lv===undefined?null:it.lv}:null; };
  if(z==='dorm') return pick(i=>(i.label||'').startsWith('睡覺'));
  if(z==='dorm_hall') return pick(i=>i.exit&&i.exit.to==='dorm');
  if(z==='campus') return pick(i=>i.exit&&i.exit.to==='dorm_hall');
  return pick(i=>i.exit&&i.exit.to==='campus')||pick(i=>/^(走出|離開)/.test(i.label||'')); })()"""


async def pick_choice(pg, cdp):
    c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; if(!bs.length) return null; let e=null; for(const t of w){ e=bs.find(x=>x.textContent.trim().startsWith(t)); if(e) break; } e=e||bs[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,30),bs.map(b=>b.textContent.trim().slice(0,14))]; })(%s)" % json.dumps(PREFER))
    if c: await L.touch_tap(cdp, c[0], c[1])
    return c


async def skip_time(pg, cdp):
    """手機「今天」：有可以去的課就按「去上課」（真實玩家會去上課）；沒有就按最後一個「跳過時間」。回傳按了哪一個（沒有就 None）"""
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"today\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(700)
    g = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#phoneBody [data-go]')].filter(b=>!/缺席/.test(b.textContent)); if(!bs.length) return null; const e=bs[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,20)]; })()")
    if g:
        await L.touch_tap(cdp, g[0], g[1]); await pg.wait_for_timeout(1500)
        return '去上課：' + g[2]
    c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#phoneBody [data-skip]')]; if(!bs.length) return null; const e=bs[bs.length-1]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,20)]; })()")
    lab = c and c[2]
    if c:
        await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
    else:
        await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(800)
    return lab


async def quick_go(pg, cdp, key):
    """手機「地點」→ 那個地點的「前往」（快速前往，照樣花遊戲時間）。回傳按了沒有"""
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"places\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(800)
    c = await pg.evaluate("(k=>{ const e=[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place===k); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,k]; })(%s)" % json.dumps(key))
    if c:
        await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
        return c[2]
    await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(800)
    return None


async def main():
    run = L.Run('flow_v0_to1017', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()")
        await L.tap(pg, cdp, '#btnNew')
        days, last_key, stuck_t, last_sig, fade_block, recover = [], None, time.time(), None, 0, 0
        t_start = time.time(); skip_fail_day = None; free_since = None
        while time.time() - t_start < 6 * 3600:
            if await pg.evaluate("!!GAME.G&&GAME.running"):
                if await pg.evaluate(END_JS): break
                key = await pg.evaluate("CALENDAR.dateOf(GAME.G.day).key")
                if key != last_key:
                    last_key = key; days.append(key)
                    info = await pg.evaluate("({h:+GAME.G.hour.toFixed(2),zone:GAME.G.zone,stage:GAME.G.stage})")
                    print(f'  [{(time.time()-t_start)/60:6.1f} 分] {key} {json.dumps(info, ensure_ascii=False)}', flush=True)
                    if key.endswith('-01') or key in ('2024-09-02', '2024-10-15', '2024-10-16', '2024-10-17'): await run.shot(pg, 'day_' + key)
            s = await L.state(pg)
            sig = (s['dtext'], s['choices'], s['zone'], round(s['x'], 1), round(s['z'], 1), s['hour'])
            if sig != last_sig: last_sig = sig; stuck_t = time.time()
            elif time.time() - stuck_t > 240:
                run.note('超過 4 分鐘沒有進展：' + json.dumps(s, ensure_ascii=False)); await run.shot(pg, 'stuck_%d' % recover)
                recover += 1
                if recover > 3: break
                await pg.keyboard.press('Escape'); stuck_t = time.time(); continue
            if s['choices']:
                free_since = None
                c = await pick_choice(pg, cdp)
                if c: print('   ▶', c[2], '／', c[3], flush=True)
                await pg.wait_for_timeout(900); continue
            if s['dlg']:
                free_since = None
                if await pg.evaluate("(()=>{ const f=document.getElementById('fade'); return !!f&&getComputedStyle(f).opacity>0.5&&getComputedStyle(f).pointerEvents!=='none'; })()"): fade_block += 1
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
            if s['busy'] or await pg.evaluate("!!document.querySelector('#fade.on')"):
                free_since = None; await pg.wait_for_timeout(800); continue
            # 空下來先等幾秒：起床選單、下課選單在玩家空下來約 4 秒以後才出（真人也會先看一下畫面）
            if free_since is None: free_since = time.time()
            if time.time() - free_since < 7:
                await pg.wait_for_timeout(800); continue
            free_since = None
            # 空下來：白天跳過時間，晚上回去睡
            if s['hour'] < 21 and skip_fail_day != (last_key, int(s['hour'])):
                lab = await skip_time(pg, cdp)
                if lab: print('   跳過時間：', lab, flush=True); await pg.wait_for_timeout(1500); continue
                skip_fail_day = (last_key, int(s['hour']))
            if s['zone'] != 'dorm':   # 晚上回宿舍：手機「地點」的快速前往（照樣花時間；SwiftShader 下從校園另一頭走回來要半小時以上）
                lab = await quick_go(pg, cdp, 'dorm|宿舍')
                if lab: print('   快速前往：', lab, flush=True); await pg.wait_for_timeout(2500); continue
            hop = await pg.evaluate(NEXT_HOP)
            if not hop:
                await pg.wait_for_timeout(1500); continue
            ok = await L.go_to(pg, cdp, run, hop['x'], hop['z'], max(0.5, hop['r'] * 0.7), hop['label'], max_s=300, lv=hop['lv'],
                               stop=lambda st: st['dlg'] or st['choices'] > 0)
            s = await L.state(pg)
            if ok and not s['dlg'] and not s['choices'] and s['interact']:
                await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        await run.shot(pg, 'end')
        st = await pg.evaluate("""(()=>{ const G=GAME.G, F=G.flags; return {key:CALENDAR.dateOf(G.day).key, h:+G.hour.toFixed(2), stage:G.stage, zone:G.zone,
          camp:!!F.ECON_CAMP_OPEN, bus:F.E15_BUS||null, dk:!!F.dating_kexin, since:F.KX_DATING_SINCE||null, e26:F.E26_DAY||null, car:F.KX_CAR||null,
          e15:(G.outings||[]).filter(q=>q.id==='y0_e15').length, fb:GAME.walkFallbacks||0}; })()""")
        print('結束', json.dumps(st, ensure_ascii=False), flush=True)
        run.check('一路玩到 10/17 晚上（沒有中途卡住停下）', await pg.evaluate(END_JS), json.dumps(st, ensure_ascii=False))
        import datetime
        want = []; d = datetime.date(2024, 9, 1)
        while d <= datetime.date(2024, 10, 17): want.append(d.isoformat()); d += datetime.timedelta(days=1)
        miss = [k for k in want if k not in days]
        run.check('9/1～10/17 每一天都過到（沒有跳日）', not miss, json.dumps(miss[:10]))
        run.check('宿營：ECON_CAMP_OPEN、遊覽車回答 E15_BUS', st['camp'] and st['bus'] in ('nosleep', 'watching'), json.dumps(st, ensure_ascii=False))
        run.check('10/17：交往（dating_kexin、KX_DATING_SINCE、E26_DAY）、車上的回答 KX_CAR', st['dk'] and bool(st['since']) and bool(st['e26']) and bool(st['car']), json.dumps(st, ensure_ascii=False))
        run.check('11 月不排 E15', st['e15'] == 0)
        run.check('沒有用到卡住保險', st['fb'] == 0, str(st['fb']))
        run.check('黑幕沒有擋住對話', fade_block == 0, str(fade_block))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
