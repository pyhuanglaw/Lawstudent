"""真實玩家流程：第二天下課以後——以安追上來、一起去 Café、坐下聊完（BUG-22，使用者 2026-10-16「以安把我叫入之後畫面卡住」）。
前半和 tests/flow_main_day12.py 相同（從標題開新遊戲、第一天宿舍、第二天上課、走出霖澤館），後半：
  走離霖澤館門口 → 以安追上來（meetAn）→ 選「去咖啡廳」→ 恢復控制、以安跟著 → 快速前往溫州街（[捷徑] 手機地點；路上走路的對話不測）→
  走到兩點半門口按「進入兩點半 Café」→ 坐下聊完（cafeScene）→ 恢復控制。每一段都要在時限內恢復控制（不能卡住）、不用卡住保險、沒有 JS 例外。
另外檢查：第二天的「今天的課」沒有 09:10 大一英文（遊戲 13:05 才開始）。
（原本的說明）真實玩家流程：第一、二天主線（2026-10-10 建立，使用者要求「正常速度的玩家完整流程測試」）。
不用 ?turbo、不讀檔、不改旗標——從標題畫面開新遊戲，全部用手機觸控操作：
  標題「開始新的一天」→ 宿舍開場對話與選項 → 走到書桌（點地移動）讀案例 → 走到床邊睡覺 →
  第二天霖澤館前（阿哲）→ 走到霖澤館門口進去 → 上課劇情自己走到座位（不能靠卡住保險）→ 回答 → 下課 →
  走到後門離開教室 → 回到校園、恢復控制 → 用選單存到欄位 1 → 重新整理頁面 → 標題「讀取」欄位 1 → 狀態一致、走得動。
移動用兩種真的操作：點地面（觸控點擊，走引擎的自動找路）、搖桿（觸控拖曳 #joy）。
SwiftShader 每秒 1–4 格、遊戲 dt 上限 0.1 秒，所以遊戲時間比真實時間慢很多；整個流程約 20–40 分鐘。
用法：python3 tests/flow_main_day12.py URL [輸出資料夾]"""
import asyncio, json, sys, time, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_day2_an'


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
    run = L.Run('flow_day2_an', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(L.legacy_url(URL))   # 舊開局（新遊戲預設是宿營，CAMP-L1）
        run.check('遊戲載入', await L.wait_loaded(pg))
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
        run.check('恢復控制以後搖桿走得動（畫面沒有卡住）', moved > 0.5, f'走了 {moved:.2f} m')
        # ---- [捷徑] 快速前往溫州街 → 走到兩點半門口 ----
        run.note('[前置／捷徑] 手機地點「溫州街」快速前往（路上的走路對話不在這個測試）')
        await pg.evaluate("void GAME.quickGo(['wenzhou','溫州街',{x:20,z:0,yaw:-Math.PI/2}])")
        s = await wait_story(pg, cdp, run, "GAME.G.zone==='wenzhou'", max_s=120)
        an_wz = await pg.evaluate("!!GAME.npc.an&&GAME.npc.an.beh==='follow'")
        run.check('到溫州街、以安跟著', s['zone'] == 'wenzhou' and an_wz)
        door = await L.find_it(pg, '進入兩點半')
        ok = bool(door) and await L.go_to(pg, cdp, run, door['x'], door['z'], door['r'] * 0.8, '兩點半門口', max_s=600)
        run.check('走到兩點半門口（點地面／搖桿）', ok)
        if ok:
            await pg.wait_for_timeout(800)
            run.check('門口出現「進入兩點半 Café」', await use_interact(pg, cdp, run, '進入兩點半'))
            t0 = time.time(); seated = False
            while time.time() - t0 < 300:
                s = await L.state(pg)
                if s['zone'] == 'cafe' and s['pose'] == 'sit' and s['dlg']: seated = True; break
                if s['dlg'] and s['zone'] == 'cafe': await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(1000)
            await run.shot(pg, 'cafe_seated')
            run.check('進 Café 以後兩個人走到窗邊坐下、開始聊（正常速度）', seated, json.dumps(s, ensure_ascii=False))
            s = await wait_story(pg, cdp, run, "!!GAME.G.flags.afternoonDone", max_s=900)
            fl = await pg.evaluate("({done:!!GAME.G.flags.afternoonDone, view:GAME.G.flags.cafeView||null, why:GAME.G.flags.whyLaw||null, contact:GAME.G.flags.AN_CONTACT_DAY2||null})")
            await run.shot(pg, 'cafe_done')
            run.check('Café 的對話演完（afternoonDone）、恢復控制', fl['done'] and not s['busy'] and not s['dlg'], json.dumps(fl) + ' ' + json.dumps(s, ensure_ascii=False))
            moved, pushes, s2 = await L.push_until(pg, cdp, 0, -40, 0.5)
            run.check('Café 之後搖桿走得動', moved > 0.5, f'走了 {moved:.2f} m')
        fb = await pg.evaluate("GAME.walkFallbacks||0")
        run.check('整段沒有用到「卡住後放到目的地」的保險', fb == 0, f'fallbacks={fb}')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
