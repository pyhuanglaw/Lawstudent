"""CC（帳號 A）11-10：X199 小安新路線台詞（AA_738；LAWWW 14:38 ①、BB 14:4x：台詞、目標字和 AA_738 一字不差；走錯到公館要有看得到的提醒；豆花那段演完；全程 walkFallbacks 0）。
真實玩家流程（不用 ?turbo、不讀檔、不改旗標）：前半照 tests/flow_day2_an.py（從標題開新遊戲 → 第一天宿舍 → 第二天上課 → 走出霖澤館 → 小安追上來 → 選「去咖啡廳」）。
後半（不用手機快速前往，全部點地面走）：
  (a) 選完以後小安說「走吧。從新生南路那個側門出去，過馬路就是。」
  (b) 故意走錯：走到校門 → 進公館 → 字幕「公館這邊人真的很多。……溫州街不是這邊啦，要從新生南路那個側門過去。」、目標「往新生南路側門（跟小安一起）」，截圖（畫面上看得到）
      → 回校園
  (c) 走到側門前 (−95, −135) 半徑 10 m 內 → 豆花兩句（溫州街有一家豆花，週末排隊要二十分鐘。／報告寫完我請你——如果你等一下有幫到忙的話。）演完
  → 側門出去到新生南路 → 字幕「溫州街就在對面。過了馬路，往巷子裡走。」→ 往溫州街 → 走到 2:30 AM → 進去坐下聊完（afternoonDone）
字幕用頁面裡每 150 ms 讀一次 #caption／對話框文字記下來（只讀，不改遊戲）。小安每一區都要跟著。整段 walkFallbacks＝0、沒有 JS 例外。
Playwright 手機模擬（844×390）≠ iPhone。用法：LW_TESTS=<wt>/tests python3 cc_x199_an_route_probe.py <url> <out>"""
import asyncio, json, sys, time, math, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests')
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/cc_x199_an_route'
LOGJS = r"""(()=>{ if(window.__CCLOG) return; window.__CCLOG=[]; window.__CCCAP=[]; const c0=GAME.caption; GAME.caption=function(w,t,ms){ try{ window.__CCCAP.push({w:String(w||''),t:String(t||''),ms:ms||0,z:GAME.G&&GAME.G.zone,h:GAME.G&&+(+GAME.G.hour).toFixed(3),rt:Date.now()}); }catch(e){} return c0.apply(this,arguments); };   /* r2：GAME.caption 原文（只記不改；PC r1 第二句豆花沒出現在畫面紀錄）*/ let lc='', ld='', lg=''; setInterval(()=>{ const c=document.getElementById('caption'), g=document.getElementById('goal');
  const ct=c&&!c.classList.contains('hide')&&getComputedStyle(c).opacity>0.05?(c.innerText||'').trim():''; const dl=document.getElementById('dlg'); const dt=dl&&!dl.classList.contains('hide')?(dl.innerText||'').trim():'';
  const gt=g?(g.textContent||'').trim():''; const z=(typeof GAME!=='undefined'&&GAME.G)?GAME.G.zone:'';
  if(ct&&ct!==lc) window.__CCLOG.push({t:'cap',z,s:ct}); lc=ct; if(dt&&dt!==ld) window.__CCLOG.push({t:'dlg',z,s:dt}); ld=dt; if(gt&&gt!==lg) window.__CCLOG.push({t:'goal',z,s:gt}); lg=gt; },150); })()"""
EXITS = "(()=>(GAME.E.interactables||[]).filter(i=>i.exit).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||1.2,lv:i.lv|0,to:i.exit.to})))()"
ANF = "(()=>({zone:GAME.G.zone, an:!!GAME.npc.an, beh:GAME.npc.an?GAME.npc.an.beh:null, comp:GAME.G.flags.companion||null, fb:GAME.walkFallbacks||0, wk:Object.assign({},GAME.G.flags.walkCk||{})}))()"
async def use_interact(pg, cdp, run, label):
    s = await L.state(pg)
    if not s['interact'].startswith(label):
        run.note(f'互動按鈕是「{s["interact"]}」，不是「{label}」'); return False
    await L.tap(pg, cdp, '#interact'); return True


async def wait_control(pg, cdp, run, pick=0, max_steps=120, extra=None):
    return await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['dlg'] and not q['choices'] and not q['busy'] and (extra is None or extra(q)), max_steps=max_steps, pick=pick)


async def wait_story(pg, cdp, run, js_done, pick=0, max_s=300):
    """等劇情場景真的演完：js_done（遊戲自己的劇情旗標）為真、而且恢復控制（沒有對話、選項、忙碌）。
    只看「恢復控制」會在換場景的空檔（標題卡、載入區域，場景還沒 sceneBegin）提早成立——
    2026-10-10 發布前測試：第一天宿舍、第二天霖澤館前都在劇情開始前就檢查了目標（截圖：阿哲才剛說「祐廷！」）"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await wait_control(pg, cdp, run, pick=pick)
        if not s['busy'] and not s['dlg'] and not s['choices'] and await pg.evaluate(js_done):
            # 旗標成立之後再讀一次狀態：上面的狀態和旗標是兩次讀取，中間劇情可能剛好開始
            # （2026-10-13 v9.5 回歸：狀態在「進到校園、劇情還沒開始」那一刻讀到，下一刻 campusIntro 才成立，
            #   截圖是阿哲正在說「祐廷！」——遊戲正常，是測試讀太早）
            s2 = await L.state(pg)
            if not s2['busy'] and not s2['dlg'] and not s2['choices']: return s2
        await pg.wait_for_timeout(800)
    return await L.state(pg)


async def goal(pg): return await pg.evaluate("(document.getElementById('goal')||{}).textContent||''")


async def main():
    run = L.Run('x199_an_route', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(L.legacy_url(URL))   # 舊開局（新遊戲預設是宿營，CAMP-L1）
        run.check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate(LOGJS)
        await pg.evaluate("localStorage.clear()")   # 乾淨的玩家（沒有舊存檔）
        await run.shot(pg, 'title')
        run.check('標題畫面有「開始新的一天」', await L.tap(pg, cdp, '#btnNew'))
        # ---- 第一天：宿舍 ----
        s = await wait_story(pg, cdp, run, "!!GAME.G.flags.introDone")   # 宿舍開場（introDorm）演完
        g = await goal(pg); await run.shot(pg, 'day1_dorm')
        run.check('第一天宿舍開場結束、恢復控制、目標是讀案例或睡覺', s['zone'] == 'dorm' and not s['busy'] and '睡覺' in g, f'goal={g} ' + json.dumps(s, ensure_ascii=False))
        desk = await L.find_it(pg, '坐在書桌前')
        run.check('宿舍有「坐在書桌前」', bool(desk), str(desk))
        ok = bool(desk) and await L.go_to(pg, cdp, run, desk['x'], desk['z'], desk['r'] * 0.8, '書桌')
        run.check('走到書桌（點地面／搖桿）', ok)   # 走不到也要算失敗（原本走不到時整段跳過、沒有 FAIL）
        if ok:
            await pg.wait_for_timeout(800)
            run.check('書桌旁出現「坐在書桌前」', await use_interact(pg, cdp, run, '坐在書桌前'))
            s = await wait_control(pg, cdp, run, pick=0)
            rc = await pg.evaluate("GAME.G.flags.readCase||null")
            run.check('坐下讀完案例（選「認真讀完」）、恢復控制', rc == 'full' and not s['busy'], f'readCase={rc}')
        bed = await L.find_it(pg, '睡覺')
        ok = bool(bed) and await L.go_to(pg, cdp, run, bed['x'], bed['z'], bed['r'] * 0.8, '床')
        run.check('走到床邊（點地面／搖桿）', ok)
        if ok:
            await pg.wait_for_timeout(800)
            run.check('床邊出現「睡覺」', await use_interact(pg, cdp, run, '睡覺'))
            s = await wait_story(pg, cdp, run, "GAME.G.zone==='campus'&&!!GAME.G.flags.campusIntro")   # 第二天霖澤館前（campusMorning：阿哲）演完
        # ---- 第二天：霖澤館前 ----
        g = await goal(pg); day = await pg.evaluate("GAME.G.day")
        await run.shot(pg, 'day2_campus')
        run.check('睡覺後到第二天 13:05 霖澤館前、阿哲對話結束、目標是進霖澤館上課', day == 2 and s['zone'] == 'campus' and '法律系館A' in g and not s['busy'], f'day={day} goal={g} ' + json.dumps(s, ensure_ascii=False))
        door = await L.find_it(pg, '進入法律系館A')
        ok = bool(door) and await L.go_to(pg, cdp, run, door['x'], door['z'], door['r'] * 0.8, '法律系館A門口')
        run.check('走到法律系館A門口（點地面／搖桿）', ok)
        if ok:
            await pg.wait_for_timeout(800)
            run.check('門口出現「進入法律系館A」', await use_interact(pg, cdp, run, '進入法律系館A'))
            # v9.4 起霖澤館是真的大樓：201 階梯教室在二樓（劇情：「民法總則在二樓的 201 階梯教室」、目標「上二樓，到 201 教室上課」），
            # 玩家自己走樓梯上去、按「進入 201 階梯教室」，上課劇情才開始（2026-10-11 修正：這個測試寫於 v9.3，一進霖澤館就直接到教室，v9.4 之後一直在這裡失敗）
            s = await wait_story(pg, cdp, run, "GAME.G.zone==='linze'")
            for _ in range(20):   # 劇情進到大廳 0.7 秒後才出提示、換目標
                g = await goal(pg)
                if '201' in g: break
                await pg.wait_for_timeout(500)
            run.check('進到霖澤館大廳、目標是上二樓到 201 教室', s['zone'] == 'linze' and '201' in g, f'goal={g}')
            c201 = await L.find_it(pg, '進入 201')
            ok = bool(c201) and await L.go_to(pg, cdp, run, c201['x'], c201['z'] + 0.3, 0.9, '201 教室門口（二樓）', lv=1)
            run.check('走樓梯上二樓、走到 201 教室門口（點地面／搖桿）', ok)
            if ok:
                await pg.wait_for_timeout(800)
                run.check('門口出現「進入 201 階梯教室」', await use_interact(pg, cdp, run, '進入 201'))
            t0 = time.time(); reached = False
            while time.time() - t0 < 300:
                s = await L.state(pg)
                if s['zone'] == 'classroom' and s['dlg'] and s['pose'] == 'sit': reached = True; break
                await pg.wait_for_timeout(1000)
            await run.shot(pg, 'class_seated')
            run.check('上課劇情自己走到座位坐下、教授開口（正常速度）', reached, json.dumps(s, ensure_ascii=False))
            run.check('沒有用到「卡住後放到目的地」的保險', s['fallbacks'] == 0, f"fallbacks={s['fallbacks']}")
            s = await wait_control(pg, cdp, run, pick=0, max_steps=200, extra=lambda q: q['hour'] >= 15.0)
            fl = await pg.evaluate("({done:!!GAME.G.flags.classDone, ans:GAME.G.flags.classAnswer||null})"); g = await goal(pg)
            run.check('上完課（classDone）、恢復控制、目標是走出法律系館A', fl['done'] and not s['busy'] and '走出' in g, f"{fl} goal={g}")
            ex = await L.find_it(pg, '離開教室')
            ok = bool(ex) and await L.go_to(pg, cdp, run, ex['x'], ex['z'], ex['r'] * 0.7, '教室後門')
            run.check('下課後走到教室後門（點地面／轉鏡頭／搖桿）', ok)
            if ok:
                await pg.wait_for_timeout(800)
                run.check('後門出現「離開教室」', await use_interact(pg, cdp, run, '離開教室'))
                s = await wait_story(pg, cdp, run, "GAME.G.zone==='linze'")   # v9.4：離開教室回到霖澤館二樓的走廊
                run.check('離開教室 → 法律系館A二樓（第 1 層）', s['zone'] == 'linze' and s.get('lv') == 1, json.dumps(s, ensure_ascii=False))
                ex2 = await L.find_it(pg, '走出法律系館A')
                ok = bool(ex2) and await L.go_to(pg, cdp, run, ex2['x'] - 0.3, ex2['z'], 0.9, '霖澤館大廳出口（走樓梯下一樓）', lv=0)
                run.check('走樓梯下一樓、走到「走出法律系館A」', ok)
                if ok:
                    await pg.wait_for_timeout(800)
                    run.check('出口出現「走出法律系館A」', await use_interact(pg, cdp, run, '走出法律系館A'))
                s = await wait_story(pg, cdp, run, "GAME.G.zone==='campus'")   # 走出霖澤館、回到校園
                g = await goal(pg); await run.shot(pg, 'after_class_campus')
                run.check('走出法律系館A、回到校園、恢復控制', s['zone'] == 'campus' and not s['busy'] and s['stand'], f'goal={g} ' + json.dumps(s, ensure_ascii=False))
        # ---- 第二天的課表：早上的英文不顯示沒去（BUG-22）----
        its = await pg.evaluate("JSON.stringify(CLS.dayItems(GAME.G).map(i=>[CLS.hhmm(i.t0),i.c.name,CLS.status(GAME.G,i)]))")
        run.check('第二天的課表沒有 13:05 以前的課（大一英文不顯示沒去）', '09:10' not in its, its)
        # ---- 走離霖澤館 → 以安追上來 ----
        DR = await pg.evaluate("(typeof B3!=='undefined'&&B3.CAMPUS_DOOR)||{x:34,z:-100}")
        s = await L.state(pg)
        await L.go_to(pg, cdp, run, s['x'] - 7, s['z'] + 2, 1.2, '離開法律系館A門口', max_s=300, stop=lambda q: q['busy'] or q['dlg'])
        t0 = time.time(); met = False
        while time.time() - t0 < 120:
            if await pg.evaluate("!!GAME.G.flags.metAn"): met = True; break
            await pg.wait_for_timeout(1000)
        run.check('走離法律系館A門口 6 m 以後，以安追上來（metAn）', met)
        texts = []
        t0 = time.time(); s = await L.state(pg)
        while time.time() - t0 < 300 and not s['choices']:
            if s['dtext'] and (not texts or texts[-1] != s['dtext']): texts.append(s['dtext'])
            if s['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(800); s = await L.state(pg)
        opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
        await run.shot(pg, 'an_choice')
        run.check('以安的邀約出現三個選項（咖啡廳／總圖／改天）', len(opts) == 3 and '咖啡廳' in opts[0], json.dumps(opts, ensure_ascii=False) + ' 台詞：' + json.dumps(texts[-4:], ensure_ascii=False))
        s = await wait_control(pg, cdp, run, pick=0)
        fl = await pg.evaluate("({plan:GAME.G.flags.plan||null, comp:GAME.G.flags.companion||null, an:!!GAME.npc.an, beh:GAME.npc.an?GAME.npc.an.beh:null})")
        await run.shot(pg, 'an_follow')
        run.check('選「去咖啡廳」以後恢復控制、以安跟著走', not s['busy'] and not s['dlg'] and fl['plan'] == 'cafe' and fl['comp'] == 'an' and fl['beh'] == 'follow', json.dumps(fl) + ' ' + json.dumps(s, ensure_ascii=False))
        moved, pushes, s2 = await L.push_until(pg, cdp, 0, -40, 0.5)
        # ================= CC X199 後半：照 AA_738 的新路線走（全部點地面） =================
        A_A = '走吧。從新生南路那個側門出去，過馬路就是。'
        A_B = '公館這邊人真的很多。……溫州街不是這邊啦，要從新生南路那個側門過去。'
        G_B = '往新生南路側門（跟小安一起）'
        A_X = '溫州街就在對面。過了馬路，往巷子裡走。'
        A_C = ['溫州街有一家豆花，週末排隊要二十分鐘。', '報告寫完我請你——如果你等一下有幫到忙的話。']
        log = lambda: pg.evaluate("window.__CCLOG||[]")
        has = lambda lg, s, t=None: any(s in q['s'] and (t is None or q['t'] == t) for q in lg)
        lg = await log()
        run.check('(a) 選「去咖啡廳」以後小安說「%s」' % A_A, has(lg, A_A), json.dumps([q for q in lg if q['t'] == 'dlg'][-4:], ensure_ascii=False))

        async def exit_to(to, tag):
            ex = [e for e in await pg.evaluate(EXITS) if e['to'] == to]
            if not run.check('%s 這一區有往 %s 的出口' % (tag, to), bool(ex), json.dumps(await pg.evaluate(EXITS), ensure_ascii=False)[:600]): return None
            e = ex[0]; z0 = (await L.state(pg))['zone']
            ok = await L.go_to(pg, cdp, run, e['x'], e['z'], min(0.9, e['r'] * 0.8), '%s 走到「%s」' % (tag, e['label']), max_s=900, lv=e['lv'])
            await pg.wait_for_timeout(800)
            run.check('%s 走到「%s」、按鈕出現' % (tag, e['label']), ok and await use_interact(pg, cdp, run, e['label']))
            t0 = time.time()
            while time.time() - t0 < 60:
                await pg.wait_for_timeout(500)
                if (await L.state(pg))['zone'] != z0: break
            await pg.wait_for_timeout(5000)   # 進區域以後的那一句（GM.sleep 1200 ＋字幕 3600）
            f = await pg.evaluate(ANF)
            run.check('%s 到了 %s、小安跟著' % (tag, to), f['zone'] == to and f['an'] and f['beh'] == 'follow' and f['comp'] == 'an', json.dumps(f, ensure_ascii=False))
            return f

        # (b) 故意走錯：校門 → 公館
        f = await exit_to('gongguan', '[b 走錯到公館]')
        if f:
            await pg.wait_for_timeout(1500); await run.shot(pg, 'b_gongguan_hint')
            lg = await log(); g = await goal(pg)
            run.check('(b) 公館：小安的字幕「%s」（畫面上 #caption 看得到）' % A_B, has(lg, A_B, 'cap'), json.dumps([q for q in lg if q['z'] == 'gongguan'], ensure_ascii=False))
            run.check('(b) 公館：目標字＝「%s」' % G_B, G_B in g, 'goal=' + g)
            await exit_to('campus', '[b 回校園]')
        # (c) 側門前豆花
        ok = await L.go_to(pg, cdp, run, -95, -133, 3.0, '[c] 走到新生南路側門前 (−95, −135)', max_s=900)
        t0 = time.time()
        while time.time() - t0 < 40:
            f = await pg.evaluate(ANF)
            if f['wk'].get('gate'): break
            await pg.wait_for_timeout(700)
        await pg.wait_for_timeout(2500); await run.shot(pg, 'c_gate_douhua1'); await pg.wait_for_timeout(4000); await run.shot(pg, 'c_gate_douhua2'); await pg.wait_for_timeout(8000)   # r2：兩句各拍一張、多等（第二句在第一句後 3.3 秒）
        lg = await log(); f = await pg.evaluate(ANF); cc = await pg.evaluate('window.__CCCAP||[]'); run.note('GAME.caption 原文（到這裡）：%s' % json.dumps(cc[-8:], ensure_ascii=False))
        run.check('(c) GAME.caption 有呼叫豆花兩句（不管畫面）', all(any(x in q['t'] for q in cc) for x in A_C), json.dumps([q['t'] for q in cc][-6:], ensure_ascii=False))
        run.check('(c) 側門前豆花兩句演完（walkCk.gate、兩句字幕都出現）', ok and f['wk'].get('gate') and all(has(lg, s, 'cap') for s in A_C), json.dumps({'wk': f['wk'], 'caps': [q['s'] for q in lg if q['t'] == 'cap'][-6:]}, ensure_ascii=False))
        # → 新生南路
        f = await exit_to('xinsheng', '[c 側門 → 新生南路]')
        if f:
            lg = await log(); await run.shot(pg, 'd_xinsheng_line')
            run.check('新生南路：小安的字幕「%s」' % A_X, has(lg, A_X, 'cap'), json.dumps([q for q in lg if q['z'] == 'xinsheng'], ensure_ascii=False))
            f = await exit_to('wenzhou', '[新生南路 → 溫州街]')
        if f and f['zone'] == 'wenzhou':
            door = await L.find_it(pg, '進入 2:30 AM')
            ok = bool(door) and await L.go_to(pg, cdp, run, door['x'], door['z'], door['r'] * 0.8, '2:30 AM 門口', max_s=600)
            run.check('走到 2:30 AM 門口', ok)
            if ok:
                await pg.wait_for_timeout(800)
                run.check('門口出現「進入 2:30 AM」', await use_interact(pg, cdp, run, '進入 2:30 AM'))
                s = await wait_story(pg, cdp, run, "!!GAME.G.flags.afternoonDone", max_s=900)
                fl = await pg.evaluate("({done:!!GAME.G.flags.afternoonDone})"); await run.shot(pg, 'e_cafe_done')
                run.check('Café 的對話演完（afternoonDone）、恢復控制', fl['done'] and not s['busy'] and not s['dlg'], json.dumps(s, ensure_ascii=False))
        lg = await log()
        json.dump({'screen': lg, 'caption_calls': await pg.evaluate('window.__CCCAP||[]')}, open(os.path.join(OUT, 'x199_an_route_log.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        run.note('字幕／對話／目標紀錄 %d 筆（x199_an_route_log.json）' % len(lg))
        fb = await pg.evaluate("GAME.walkFallbacks||0")
        run.check('整段 walkFallbacks＝0', fb == 0, f'fallbacks={fb}')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
