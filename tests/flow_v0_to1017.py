"""經濟系驗收（AA_269 第 6 節第 1～4 點）：從標題「新遊戲」不跳日期，一路玩到 2024-10-17 晚上（真實玩家流程，第 3 級；手機模擬 844×390 觸控，不是實機）。
做法：像玩家一樣過日子——
  - 對話點過去；選項照下面的偏好選（起床選單選「直接去上課」、出遊選「出發」、其他選第一個）；
  - 空下來、21:00 以前：打開手機「今天」，按最後一個「跳過時間」（遇到課、約好的時間、劇情會自己停）；
  - 21:00 以後、或跳不過去：用手機「地點」快速前往宿舍（照樣花遊戲時間），走到床邊「睡覺」（快速前往不能用時才一路走回去）。
走路一律點地面／搖桿（playlib.go_to），不瞬移；不改旗標、不撥時間。網址不用 ?turbo（真實速度；SwiftShader 很慢，整支要好幾個小時）。
檢查（10/17 晚上）：每一天都過到（沒有跳日）、宿營旗標（ECON_CAMP_OPEN、E15_BUS）、10/17 一天（dating_kexin、KX_DATING_SINCE、E26_DAY、KX_CAR）、
11 月不排 E15、沒有卡住保險（walkFallbacks）、黑幕沒有擋住對話、沒有 JS 例外。中途卡住超過 4 分鐘會截圖、記下狀態後停止（判失敗）。
分段跑（2026-10-17：整支 SwiftShader 下約每遊戲日 9 分鐘、整段 7 小時，背景工作的上限是 2 小時，一次都沒跑完）：
  SEG_TO=2024-09-10  過完這一天（隔天早上空下來）就用選單存到欄位 1，把存檔寫到 SEG_SAVE 的檔案，這一段結束；
  SEG_FROM=<檔案>    從上一段的存檔開始（寫進欄位 1，標題「讀取」欄位 1——和玩家讀檔一樣）。
  每一段檢查：那一段每一天都過到、沒有卡住保險、黑幕沒有擋住對話、沒有 JS 例外；最後一段（到 10/17）再檢查宿營、交往、11 月不排 E15。
  網址可以加 ?lowres 讓 SwiftShader 快一點（只看劇情與日期走不走得下去；畫面驗收另外拍，TESTING.md 第 26 行）。
用法：python3 tests/flow_v0_to1017.py URL [輸出資料夾]（環境變數 SEG_FROM、SEG_TO、SEG_SAVE 見上）"""
import asyncio, json, sys, time, os, datetime
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L
import screencheck as SC   # 看畫面的自動檢查（使用者 2026-10-17 23:3x）

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_v0_to1017'
PREFER = ['直接去上課', '直接去考場', '出發', '先不要', '先睡。明天再拆。', '睡到明天早上', '睡覺']   # 「照樣跳過會錯過：…」→「先不要」（不翹課）
END_JS = "(()=>{ const G=GAME.G, d=STORY.dayOfKey('2024-10-17'); return G.day>d||(G.day===d&&G.hour>=22.6); })()"
SEG_FROM, SEG_TO, SEG_SAVE = os.environ.get('SEG_FROM'), os.environ.get('SEG_TO'), os.environ.get('SEG_SAVE')
if SEG_TO and SEG_TO >= '2024-10-17': SEG_TO = None   # 最後一段照原本的終點

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
    run = L.Run('flow_v0_to1017', OUT); sc = SC.Checker(run, OUT); day_check = None; was_dlg = False; last_opts = None
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()")
        if SEG_FROM:   # 上一段的存檔 → 欄位 1 → 標題「讀取」（[前置] 只是把上一段玩到的存檔放回去）
            await pg.evaluate("(s=>localStorage.setItem('fatiao3d_slot_1',s))(%s)" % json.dumps(open(SEG_FROM, encoding='utf-8').read()))
            await pg.reload(); await L.wait_loaded(pg)
            await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
            c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b.find(x=>x.closest('.item')&&x.closest('.item').textContent.includes('欄位 1'))||b[1]||b[0]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
            if c: await L.touch_tap(cdp, c[0], c[1])
            for _ in range(240):
                if await pg.evaluate("!!GAME.G&&GAME.running&&GAME.G.stage==='econ'"): break
                await pg.wait_for_timeout(500)
            run.check('[前置] 讀取上一段的存檔（欄位 1）', await pg.evaluate("!!GAME.G&&GAME.G.stage==='econ'"), await pg.evaluate("GAME.G?CALENDAR.dateOf(GAME.G.day).key:null"))
            await pg.evaluate("localStorage.removeItem('fatiao3d_slot_1')")   # 讀完就清掉：段尾存檔要寫新的一份（2026-10-17：欄位 1 還留著上一段的存檔，段尾沒存成也照樣拿舊檔交給下一段）
        else:
            await L.tap(pg, cdp, '#btnNew')
        seg_saved = False; first_key = None; seg_try = 0
        days, last_key, stuck_t, last_sig, fade_block, recover = [], None, time.time(), None, 0, 0
        fade_run = 0
        t_start = time.time(); skip_fail_day = None; free_since = None
        while time.time() - t_start < 6 * 3600:
            if await pg.evaluate("!!GAME.G&&GAME.running"):
                if await pg.evaluate(END_JS): break
                key = await pg.evaluate("CALENDAR.dateOf(GAME.G.day).key")
                if first_key is None: first_key = key
                if SEG_TO and key > SEG_TO:   # 這一段過完了：隔天空下來就存檔
                    st0 = await L.state(pg)
                    if not st0['dlg'] and not st0['choices'] and not st0['busy']:
                        await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1200)
                        await L.tap(pg, cdp, '.tabs button[data-tab="save"]'); await pg.wait_for_timeout(1200)
                        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='存檔')[0]; if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
                        if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
                        slot = await pg.evaluate("(k=>{ const s=localStorage.getItem(k); try{ return s&&JSON.parse(s).day===GAME.G.day?s:null; }catch(e){ return null; } })('fatiao3d_slot_1')")   # 存檔的日子要是今天（不是舊的）
                        if not slot:   # 選單存檔沒成功（例：起床選單剛好跳出來蓋住）：等一下再試，試三次
                            seg_try += 1
                            if seg_try < 3:
                                await pg.keyboard.press('Escape'); await pg.wait_for_timeout(2000); continue
                            slot = await pg.evaluate("(k=>{ const s=localStorage.getItem(k); try{ return s&&JSON.parse(s).day===GAME.G.day?s:null; }catch(e){ return null; } })('fatiao3d_auto')")   # 退一步：遊戲自己的自動存檔（標題「繼續」讀的那一份）
                            if slot: run.note('選單存檔三次沒成功，改用自動存檔接下一段')
                        if slot and SEG_SAVE: open(SEG_SAVE, 'w', encoding='utf-8').write(slot)
                        seg_saved = bool(slot); break
                if key != last_key:
                    last_key = key; days.append(key)
                    info = await pg.evaluate("({h:+GAME.G.hour.toFixed(2),zone:GAME.G.zone,stage:GAME.G.stage})")
                    print(f'  [{(time.time()-t_start)/60:6.1f} 分] {key} {json.dumps(info, ensure_ascii=False)}', flush=True)
                    if key.endswith('-01') or key in ('2024-09-02', '2024-10-15', '2024-10-16', '2024-10-17'): await run.shot(pg, 'day_' + key)
                    day_check = key
            s = await L.state(pg)
            sig = (s['dtext'], s['choices'], s['zone'], round(s['x'], 1), round(s['z'], 1), s['hour'])
            if sig != last_sig: last_sig = sig; stuck_t = time.time()
            elif time.time() - stuck_t > 240:
                run.note('超過 4 分鐘沒有進展：' + json.dumps(s, ensure_ascii=False)); await run.shot(pg, 'stuck_%d' % recover)
                recover += 1
                if recover > 3: break
                shut = await L.close_panels(pg, cdp); run.note('  關掉的面板：' + json.dumps(shut)); stuck_t = time.time(); continue
            if s['choices'] and s.get('paused'):
                shut = await L.close_panels(pg, cdp)
                if shut: print('   關掉蓋住選項的面板', shut, flush=True); continue
            if s['choices']:
                free_since = None
                opts_now = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,12)).join('|')")
                if opts_now != last_opts: last_opts = opts_now; await sc.check(pg, '%s 選項 %s' % (last_key, opts_now[:16]))
                c = await pick_choice(pg, cdp)
                if c: print('   ▶', c[2], '／', c[3], flush=True)
                await pg.wait_for_timeout(900); continue
            if s['dlg'] and not was_dlg: await sc.check(pg, '%s 對話 %s' % (last_key, s['dtext'][:12]))
            was_dlg = bool(s['dlg'])
            if s['dlg']:
                free_since = None
                if await pg.evaluate("(()=>{ const f=document.getElementById('fade'); return !!f&&getComputedStyle(f).opacity>0.5&&getComputedStyle(f).pointerEvents!=='none'; })()"):
                    fade_run += 1
                    if fade_run == 3: fade_block += 1; run.note('黑幕蓋住對話（連續 3 次點不到）：' + s['dtext'][:40]); await run.shot(pg, 'fade_block_%d' % fade_block)   # 轉場一瞬間重疊不算；連續三次點不到才算擋住
                else: fade_run = 0
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
            if s['busy'] or await pg.evaluate("!!document.querySelector('#fade.on')"):
                free_since = None; await pg.wait_for_timeout(800); continue
            # 空下來先等幾秒：起床選單、下課選單在玩家空下來約 4 秒以後才出（真人也會先看一下畫面）
            if free_since is None: free_since = time.time()
            if time.time() - free_since < 7:
                await pg.wait_for_timeout(800); continue
            free_since = None
            if day_check: await sc.check(pg, '%s 空下來 %s' % (day_check, s['zone'])); day_check = None
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
        sc.finish()
        st = await pg.evaluate("""(()=>{ const G=GAME.G, F=G.flags; return {key:CALENDAR.dateOf(G.day).key, h:+G.hour.toFixed(2), stage:G.stage, zone:G.zone,
          camp:!!F.ECON_CAMP_OPEN, bus:F.E15_BUS||null, dk:!!F.dating_kexin, since:F.KX_DATING_SINCE||null, e26:F.E26_DAY||null, car:F.KX_CAR||null,
          e15:(G.outings||[]).filter(q=>q.id==='y0_e15').length, fb:GAME.walkFallbacks||0}; })()""")
        print('結束', json.dumps(st, ensure_ascii=False), flush=True)
        d0 = datetime.date.fromisoformat(first_key if (SEG_FROM and first_key) else '2024-09-01'); d1 = datetime.date.fromisoformat(SEG_TO or '2024-10-17')
        if d0 < datetime.date(2024, 9, 1): d0 = datetime.date(2024, 9, 1)
        want = []; d = d0
        while d <= d1: want.append(d.isoformat()); d += datetime.timedelta(days=1)
        miss = [k for k in want if k not in days]
        if SEG_TO:
            run.check(f'這一段玩到 {SEG_TO} 過完、隔天存檔（欄位 1）', seg_saved, json.dumps(st, ensure_ascii=False))
        else:
            run.check('一路玩到 10/17 晚上（沒有中途卡住停下）', await pg.evaluate(END_JS), json.dumps(st, ensure_ascii=False))
        run.check(f'{want[0] if want else d0}～{d1} 每一天都過到（沒有跳日）', not miss, json.dumps(miss[:10]))
        run.check('宿營：ECON_CAMP_OPEN、遊覽車回答 E15_BUS', st['camp'] and st['bus'] in ('nosleep', 'watching'), json.dumps(st, ensure_ascii=False))
        if not SEG_TO:
            run.check('10/17：交往（dating_kexin、KX_DATING_SINCE、E26_DAY）、車上的回答 KX_CAR', st['dk'] and bool(st['since']) and bool(st['e26']) and bool(st['car']), json.dumps(st, ensure_ascii=False))
            run.check('11 月不排 E15', st['e15'] == 0)
        run.check('沒有用到卡住保險', st['fb'] == 0, str(st['fb']))
        run.check('黑幕沒有擋住對話', fade_block == 0, str(fade_block))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
