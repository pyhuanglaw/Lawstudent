"""經濟系驗收（AA_269 第 6 節第 5～10 點）：10/19 退宿以後住臺北的家，一路玩到 8/29 搬進法律系宿舍（真實玩家流程；手機模擬 844×390 觸控，不是實機）。
做法：像玩家一樣過日子——
  - 對話點過去；家裡的選單：有「出發」就出發（出遊、約好的見面），沒有就「快轉」→「到下一個有事的日子」（D99，d9668fab）；
  - 手機有要回的訊息（有選項的）或邀約：打開手機、進那個對話、按第一個選項（答應）；
  - 其他選項照下面的偏好選，沒有就選第一個。
起點：SEG_FROM=<存檔檔>（上一段 flow_v0_to1017 存到欄位 1 的，標題「讀取」）；沒有的話 [前置／捷徑] 用遊戲自己的讀檔放到 2024-10-19 晚上在家（退宿後、和可昕交往中、宿營演過）。
檢查：玩到法律系（stage law）、沒有卡住超過 4 分鐘、沒有卡住保險、沒有 JS 例外；列出 AA_269 第 6～10 點的事件和旗標實際有沒有發生、在哪一天。
網址可以加 ?lowres（只看劇情與日期走不走得下去）。
用法：python3 tests/flow_v0_home.py URL [輸出資料夾]"""
import asyncio, json, sys, time, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.dirname(__file__))
import playlib as L
import screencheck as SC   # 看畫面的自動檢查（使用者 2026-10-17 23:3x）

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_v0_home'
SEG_FROM = os.environ.get('SEG_FROM')
PREFER = ['出發', '快轉', '到下一個有事的日子', '直接去', '好', '答應']
WATCH = ['ev_y0_e12', 'ev_y0_e14', 'ev_y0_e18', 'ev_y0_e18a', 'ev_y0_fight', 'ev_y0_fight_h', 'ev_y0_cram', 'ev_y0_cram_h', 'ev_y0_e22b', 'ev_y0_e20', 'ev_y0_e21', 'ev_y0_e21o',
         'ev_y0_e23', 'ev_y0_e27', 'ev_y0_e28', 'ev_y0_e24c', 'ev_y0_r1', 'ev_y0_r2', 'ev_y0_r3', 'ev_y0_r4', 'ev_y0_r5', 'ev_y0_r6', 'ev_y0_r7', 'ev_y0_rs', 'ev_y0_e18b', 'ev_y0_e34',
         'ev_y0_cram_class', 'ev_y0_e27b', 'ev_y0_e35h', 'ev_y0_exam1h', 'ev_y0_exam1', 'ev_y0_exam2', 'ev_y0_kh_bus_h', 'ev_y0_kh_bus', 'ev_y0_kh_home_h', 'ev_y0_kh_home',
         'ev_y0_e36', 'ev_y0_e36h', 'ev_y0_e36r', 'ev_y0_e36rh', 'ev_y0_e37']
FLAGS = ['CRAM_FREE_KNOWN', 'E22B_TOLD', 'BIKE_LOOKED_UP', 'RETAKE_TOGETHER', 'E24C_REASON', 'E18A_DOUHUA', 'KX_THINK_LEAVE', 'CRAM_ASKED_TOGETHER', 'E35_PLAN', 'MATH_100', 'KH_GO', 'SCORE_REPLY', 'KH_MADEUP', 'E36_RESULT', 'E36_PACT', 'PLAYED_Y0', 'dating_kexin']
PENDING = "(()=>{ const G=GAME.G; const a=(typeof PHONE!=='undefined'&&PHONE.pending)?PHONE.pending(G).map(m=>PHONE.th(m)):[]; const b=(G.invites||[]).filter(v=>v.state==='offered'||v.state==='changed').map(v=>{ const m=(G.msgs||[]).find(q=>q.iv===v.id); return m?PHONE.th(m):null; }).filter(Boolean); return a.concat(b); })()"


async def pick_choice(pg, cdp):
    c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; if(!bs.length) return null; let e=null; for(const t of w){ e=bs.find(x=>x.textContent.trim().startsWith(t)); if(e) break; } e=e||bs[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,30),bs.map(x=>x.textContent.trim().slice(0,12))]; })(%s)" % json.dumps(PREFER))
    if c: await L.touch_tap(cdp, c[0], c[1])
    return c


async def answer_phone(pg, cdp, th):
    """手機 → 訊息 → 那個對話 → 第一個選項（答應）。回傳按了什麼"""
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"msg\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(700)
    c = await pg.evaluate("(t=>{ const e=[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===t); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(th))
    if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900)
    b = await pg.evaluate("(()=>{ const e=[...document.querySelectorAll('#phoneBody [data-ask], #phoneBody [data-ans$=\"|yes\"], #phoneBody [data-ans$=\"|c:ok\"]')].pop(); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,20)]; })()")
    if b: await L.touch_tap(cdp, b[0], b[1]); await pg.wait_for_timeout(900)
    if await pg.evaluate("!document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(700)
    return b and b[2]


async def main():
    run = L.Run('flow_v0_home', OUT); sc = SC.Checker(run, OUT); was_dlg = False; last_opts = None
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()")
        if SEG_FROM:
            await pg.evaluate("(s=>localStorage.setItem('fatiao3d_slot_1',s))(%s)" % json.dumps(open(SEG_FROM, encoding='utf-8').read()))
            await pg.reload(); await L.wait_loaded(pg)
            await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
            c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b.find(x=>x.closest('.item')&&x.closest('.item').textContent.includes('欄位 1'))||b[1]||b[0]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
            if c: await L.touch_tap(cdp, c[0], c[1])
            run.setup('讀取上一段的存檔（欄位 1）')
        else:
            d = await pg.evaluate("STORY.dayOfKey('2024-10-19')")
            st = {'stage': 'econ', 'zone': 'campus', 'day': d, 'weekday': 6, 'hour': 19, 'money': 12000, 'pos': {'x': -117, 'z': 0.5, 'yaw': 1.57},
                  'home': {'at': True, 'base': True, 'day': d},
                  'contacts': {k: d - 40 for k in ['kexin', 'econ_zhengxun', 'econ_weilun', 'econ_tangrui', 'econ_jiahao', 'econ_pinyu']},
                  'flags': {'ECON_CAMP_OPEN': True, 'E15_BUS': 'nosleep', 'E15_WENT': True, 'ECON_CAMP_DONE': True, 'E01_DONE': True, 'Y0_MOVED_OUT': True, 'dating_kexin': True, 'KX_DATING_SINCE': '2024-10-17',
                            'E26_DAY': d - 2, 'KX_CAR': 'only_me', 'KX_FIRST_MSG': True, 'fundsV2': 1, 'allowanceMonth': 10, 'Y0_STICKY': True},
                  'events': {'done': {'ev_y0_e30': 1, 'ev_y0_a3': 1, 'ev_y0_e26': 1, 'ev_y0_e02': 1}, 'last': {'ev_y0_e30': d - 2, 'ev_y0_a3': d, 'ev_y0_e26': d - 2}, 'count': 4}}
            run.setup('讀檔到 2024-10-19（六）19:00 在臺北的家（退宿後、和可昕交往中、宿營演過；聯絡人：可昕、經濟系五人）')
            await L.load_state(pg, st)
        t0 = time.time(); last_key = None; stuck_t = time.time(); last_sig = None; recover = 0; answered = 0; fade_block = 0; days = []
        fade_run = 0
        while time.time() - t0 < 1.9 * 3600:
            if not await pg.evaluate("!!GAME.G&&GAME.running"): await pg.wait_for_timeout(800); continue
            g = await pg.evaluate("({stage:GAME.G.stage,key:CALENDAR.dateOf(GAME.G.day).key,h:+GAME.G.hour.toFixed(2),zone:GAME.G.zone,home:HOME.at(GAME.G)})")
            if g['stage'] == 'law' and g['key'] >= '2025-08-29':
                st0 = await L.state(pg)
                if not st0['dlg'] and not st0['choices']: break
            if g['key'] != last_key:
                last_key = g['key']; days.append(g['key']); print(f'  [{(time.time()-t0)/60:6.1f} 分] {g["key"]} {json.dumps(g, ensure_ascii=False)}', flush=True)
                if g['key'].endswith('-01'): await run.shot(pg, 'day_' + g['key'])
            s = await L.state(pg)
            sig = (s['dtext'], s['choices'], s['zone'], s['hour'], g['key'])
            if sig != last_sig: last_sig = sig; stuck_t = time.time()
            elif time.time() - stuck_t > 240:
                run.note('超過 4 分鐘沒有進展：' + json.dumps(s, ensure_ascii=False)); await run.shot(pg, 'stuck_%d' % recover)
                recover += 1
                if recover > 3: break
                shut = await L.close_panels(pg, cdp); run.note('  關掉的面板：' + json.dumps(shut)); stuck_t = time.time(); continue
            if s['dlg'] and not was_dlg: await sc.check(pg, '%s 對話 %s' % (last_key, s['dtext'][:12]))
            was_dlg = bool(s['dlg'])
            if s['dlg']:
                if await pg.evaluate("(()=>{ const f=document.getElementById('fade'); return !!f&&getComputedStyle(f).opacity>0.5&&getComputedStyle(f).pointerEvents!=='none'; })()"):
                    fade_run += 1
                    if fade_run == 3: fade_block += 1; run.note('黑幕蓋住對話（連續 3 次點不到）：' + s['dtext'][:40]); await run.shot(pg, 'fade_block_%d' % fade_block)   # 轉場一瞬間重疊不算；連續三次點不到才算擋住
                else: fade_run = 0
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
            pend = await pg.evaluate(PENDING)
            if pend and (s['choices'] or not s['busy']):
                a = await answer_phone(pg, cdp, pend[0]); answered += 1
                print('   手機回覆：', pend[0], a, flush=True); await pg.wait_for_timeout(800); continue
            if s['choices'] and s.get('paused'):
                shut = await L.close_panels(pg, cdp)
                if shut: print('   關掉蓋住選項的面板', shut, flush=True); continue
            if not s['choices'] and not s['dlg'] and await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"):
                n = await L.phone_away(pg, cdp, tries=1)   # 跳日期途中收到訊息停下來（先停在列表、右上角「跳過」）、沒有要回的：像玩家一樣按「跳過」繼續（2026-10-19）
                if n: print('   手機：按「跳過／收起來」', flush=True); continue
            if s['choices']:
                opts_now = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,12)).join('|')")
                if opts_now != last_opts: last_opts = opts_now; await sc.check(pg, '%s 選項 %s' % (last_key, opts_now[:16]))
                c = await pick_choice(pg, cdp)
                if c: print('   ▶', c[2], '／', c[3], flush=True)
                await pg.wait_for_timeout(900); continue
            await pg.wait_for_timeout(800)
        await run.shot(pg, 'end')
        sc.finish()
        res = await pg.evaluate("((W,F)=>{ const G=GAME.G, L=G.events.last||{}, D=G.events.done||{}; const ev={}; for(const k of W) if(D[k]) ev[k]=L[k]!=null?CALENDAR.dateOf(L[k]).key:'done'; const fl={}; for(const k of F) fl[k]=G.flags[k]===undefined?null:G.flags[k]; return {key:CALENDAR.dateOf(G.day).key,h:+G.hour.toFixed(2),stage:G.stage,zone:G.zone,ev,fl,fb:GAME.walkFallbacks||0}; })(%s,%s)" % (json.dumps(WATCH), json.dumps(FLAGS)))
        print('結束', json.dumps(res, ensure_ascii=False), flush=True)
        for k in WATCH: print('   ', k, res['ev'].get(k, '— 沒有發生'), flush=True)
        print('   旗標', json.dumps(res['fl'], ensure_ascii=False), flush=True)
        run.check('玩到 8/29 進法律系（stage law）', res['stage'] == 'law' and res['key'] >= '2025-08-29', json.dumps({k: res[k] for k in ('key', 'h', 'stage', 'zone')}, ensure_ascii=False))
        run.check('二月那一場：E23、E27、E24c 都演過（AA_269 第 8 點）', all(k in res['ev'] for k in ('ev_y0_e23', 'ev_y0_e27', 'ev_y0_e24c')), json.dumps({k: res['ev'].get(k) for k in ('ev_y0_e23', 'ev_y0_e27', 'ev_y0_e24c')}))
        # E37（第一次一起去政大）照 AA_303 第 2 節改到「法律系 8/30」：8/29 轉進法律系的隔天才演，這支停在 8/29，所以不在這裡查（8/28 的私訊、8/30 的出遊由 tests/v0_e37_unit.js 查）
        run.check('考試、放榜（AA_272 第 4、10、11 節）：E35h、考場、對答案、7/25 成績公布（客運版或在家版）、8/13 早上旁白＋晚上電話', 'ev_y0_e35h' in res['ev'] and any(k in res['ev'] for k in ('ev_y0_exam1h', 'ev_y0_exam1')) and 'ev_y0_exam2' in res['ev'] and any(k in res['ev'] for k in ('ev_y0_kh_bus_h', 'ev_y0_kh_bus', 'ev_y0_kh_home_h', 'ev_y0_kh_home')) and any(k in res['ev'] for k in ('ev_y0_e36r', 'ev_y0_e36rh')) and any(k in res['ev'] for k in ('ev_y0_e36', 'ev_y0_e36h')), json.dumps({k: res['ev'].get(k) for k in WATCH[-15:]}, ensure_ascii=False))
        run.check('沒有用到卡住保險', res['fb'] == 0, str(res['fb']))
        run.check('黑幕沒有擋住對話', fade_block == 0, str(fade_block))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        print(f'   手機回覆 {answered} 次；過到的日子 {len(days)} 天', flush=True)
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
