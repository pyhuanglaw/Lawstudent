"""真實玩家流程：第一、二天主線（2026-10-10 建立，使用者要求「正常速度的玩家完整流程測試」）。
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
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_main_day12'


async def use_interact(pg, cdp, run, label):
    s = await L.state(pg)
    if not s['interact'].startswith(label):
        run.note(f'互動按鈕是「{s["interact"]}」，不是「{label}」'); return False
    await L.tap(pg, cdp, '#interact'); return True


# 第二天的民總不能翹（classes3d.js S.goDay2，AA_294 第 1 節）：12:30～15:12 還沒上課（classDone）、玩家空下來 1.5 秒＝「走路到霖澤館。」直接帶進 201。
# 沙盒每秒不到 1 格時，從霖澤館前走到 201 常常超過這個時間（TEST-DAY12-SPEED-1023）——劇情照設計接手，不是走不到。
# 接手以後：走路、上樓梯、按「進入 201」那幾項標「未驗」（不算通過，也不算失敗），照舊檢查上課有沒有照常開始；檢查標準不變。
TAKEN = lambda q: q['zone'] == 'classroom'
UNVERIFIED = []
# 真實時間的上限照幀率放大（TEST-DAY12-SPEED-1023）：原本的 420 秒走路、300 秒等劇情、playlib 60 秒沒進展，都是照每秒 1～4 格訂的。
# 2026-10-23 負載 25 時每秒 0.3～0.4 格：走上二樓 468 秒 199 格還在樓梯上；被帶進 201 以後走到座位超過 300 秒。
# 開頭量一次幀率，SLOW＝1.5／每秒格數（1～6 倍）；判定的標準不變，只是給慢的機器夠的時間（劇情一接手 go_to 就提早回來：stop=TAKEN）
SLOW = 1.0
def S_(sec): return int(sec * SLOW)


async def measure_slow(pg, run):
    global SLOW
    f0 = await pg.evaluate("GAME.E.frame|0"); t0 = time.time(); await pg.wait_for_timeout(10000)
    fps = ((await pg.evaluate("GAME.E.frame|0")) - f0) / max(0.1, time.time() - t0)
    SLOW = max(SLOW, min(6.0, max(1.0, 1.5 / max(fps, 0.05))))   # 量兩次（標題畫面、進宿舍以後）取比較慢的那一次
    run.note(f'幀率 {fps:.2f} 格／秒 → 真實時間上限放大 {SLOW:.1f} 倍（走路 {S_(420)} 秒、等劇情 {S_(300)} 秒）')


async def taken_over(pg, run, where):
    """走路途中被劇情帶進 201 了嗎？是的話記下時間與在哪一段、回傳 True"""
    s = await L.state(pg)
    if not TAKEN(s): return False
    fl = await pg.evaluate("({h:+GAME.G.hour.toFixed(2), classDone:!!GAME.G.flags.classDone, classNow:!!GAME.G.flags.classNow, day:GAME.G.day})")
    run.note(f'【劇情接手】{where}途中被帶進 201（{fl}）：沙盒太慢，classes3d.js S.goDay2 照設計接手')
    run.check('劇情接手的時間合理（第二天、12:30～15:12、還沒上過課）', fl['day'] == 2 and 12.5 <= fl['h'] < 15.2 and not fl['classDone'], json.dumps(fl, ensure_ascii=False))
    return True


def unverified(name):
    UNVERIFIED.append(name); print(f'[未驗] {name}（劇情接手，這一次沒有走到）', flush=True)


async def wait_control(pg, cdp, run, pick=0, max_steps=120, extra=None):
    cond = lambda q: not q['dlg'] and not q['choices'] and not q['busy'] and (extra is None or extra(q))
    s = None
    for _ in range(max(1, round(SLOW))):   # 沙盒很慢時：playlib 的 advance_dialogs 60 秒沒進展就回來，多等幾輪（快的機器只跑一輪，和原本一樣）
        s = await L.advance_dialogs(pg, cdp, run, until=cond, max_steps=max_steps, pick=pick)
        if cond(s): break
    return s


async def wait_story(pg, cdp, run, js_done, pick=0, max_s=None):
    """等劇情場景真的演完：js_done（遊戲自己的劇情旗標）為真、而且恢復控制（沒有對話、選項、忙碌）。
    只看「恢復控制」會在換場景的空檔（標題卡、載入區域，場景還沒 sceneBegin）提早成立——
    2026-10-10 發布前測試：第一天宿舍、第二天霖澤館前都在劇情開始前就檢查了目標（截圖：阿哲才剛說「祐廷！」）"""
    t0 = time.time()
    max_s = max_s or S_(300)
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
    run = L.Run('flow_main_day12', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(L.legacy_url(URL))   # 舊開局（新遊戲預設是宿營，CAMP-L1）
        run.check('遊戲載入', await L.wait_loaded(pg))
        await measure_slow(pg, run)
        await pg.evaluate("localStorage.clear()")   # 乾淨的玩家（沒有舊存檔）
        await run.shot(pg, 'title')
        run.check('標題畫面有「開始新的一天」', await L.tap(pg, cdp, '#btnNew'))
        # ---- 第一天：宿舍 ----
        s = await wait_story(pg, cdp, run, "!!GAME.G.flags.introDone")   # 宿舍開場（introDorm）演完
        await measure_slow(pg, run)   # 遊戲畫面的幀率（標題畫面通常比較快）
        g = await goal(pg); await run.shot(pg, 'day1_dorm')
        run.check('第一天宿舍開場結束、恢復控制、目標是讀案例或睡覺', s['zone'] == 'dorm' and not s['busy'] and '睡覺' in g, f'goal={g} ' + json.dumps(s, ensure_ascii=False))
        desk = await L.find_it(pg, '坐在書桌前')
        run.check('宿舍有「坐在書桌前」', bool(desk), str(desk))
        ok = bool(desk) and await L.go_to(pg, cdp, run, desk['x'], desk['z'], desk['r'] * 0.8, '書桌', max_s=S_(420))
        run.check('走到書桌（點地面／搖桿）', ok)   # 走不到也要算失敗（原本走不到時整段跳過、沒有 FAIL）
        if ok:
            await pg.wait_for_timeout(800)
            run.check('書桌旁出現「坐在書桌前」', await use_interact(pg, cdp, run, '坐在書桌前'))
            s = await wait_control(pg, cdp, run, pick=0)
            rc = await pg.evaluate("GAME.G.flags.readCase||null")
            run.check('坐下讀完案例（選「認真讀完」）、恢復控制', rc == 'full' and not s['busy'], f'readCase={rc}')
        bed = await L.find_it(pg, '睡覺')
        ok = bool(bed) and await L.go_to(pg, cdp, run, bed['x'], bed['z'], bed['r'] * 0.8, '床', max_s=S_(420))
        run.check('走到床邊（點地面／搖桿）', ok)
        if ok:
            await pg.wait_for_timeout(800)
            run.check('床邊出現「睡覺」', await use_interact(pg, cdp, run, '睡覺'))
            s = await wait_story(pg, cdp, run, "GAME.G.zone==='campus'&&!!GAME.G.flags.campusIntro")   # 第二天霖澤館前（campusMorning：阿哲）演完
        # ---- 第二天：霖澤館前 ----
        g = await goal(pg); day = await pg.evaluate("GAME.G.day"); h2 = await pg.evaluate("+GAME.G.hour.toFixed(2)")
        run.note(f'第二天開場時間 {h2:.2f}（13:05＝13.08；12:30 以後空下來 1.5 秒劇情就會帶進 201）')
        await run.shot(pg, 'day2_campus')
        run.check('睡覺後到第二天 13:05 霖澤館前、阿哲對話結束、目標是進霖澤館上課', day == 2 and s['zone'] == 'campus' and '法律系館A' in g and not s['busy'], f'day={day} goal={g} ' + json.dumps(s, ensure_ascii=False))
        door = await L.find_it(pg, '進入法律系館A')
        ok = bool(door) and await L.go_to(pg, cdp, run, door['x'], door['z'], door['r'] * 0.8, '法律系館A門口', max_s=S_(420), stop=TAKEN)
        took = await taken_over(pg, run, '走到法律系館A門口')   # 找門以前就被帶走也算（門不在場景裡、door＝None；BB-B 10-23 v3 負載 25 時就是這樣）
        if took:
            for n in ('走到法律系館A門口（點地面／搖桿）', '門口出現「進入法律系館A」', '進到霖澤館大廳、目標是上二樓到 201 教室', '走樓梯上二樓、走到 201 教室門口（點地面／搖桿）', '門口出現「進入 201 階梯教室」'): unverified(n)
        else: run.check('走到法律系館A門口（點地面／搖桿）', ok)
        if ok:
            if not took:   # 劇情在門口就接手了：直接看上課有沒有照常開始
                await pg.wait_for_timeout(800)
                run.check('門口出現「進入法律系館A」', await use_interact(pg, cdp, run, '進入法律系館A'))
                # v9.4 起霖澤館是真的大樓：201 階梯教室在二樓（劇情：「民法總則在二樓的 201 階梯教室」、目標「上二樓，到 201 教室上課」），
                # 玩家自己走樓梯上去、按「進入 201 階梯教室」，上課劇情才開始（2026-10-11 修正：這個測試寫於 v9.3，一進霖澤館就直接到教室，v9.4 之後一直在這裡失敗）
                s = await wait_story(pg, cdp, run, "GAME.G.zone==='linze'||GAME.G.zone==='classroom'")
                for _ in range(20):   # 劇情進到大廳 0.7 秒後才出提示、換目標
                    g = await goal(pg)
                    if '201' in g: break
                    await pg.wait_for_timeout(500)
                took = await taken_over(pg, run, '進霖澤館大廳')
                if took:
                    for n in ('進到霖澤館大廳、目標是上二樓到 201 教室', '走樓梯上二樓、走到 201 教室門口（點地面／搖桿）', '門口出現「進入 201 階梯教室」'): unverified(n)
                else:
                    run.check('進到霖澤館大廳、目標是上二樓到 201 教室', s['zone'] == 'linze' and '201' in g, f'goal={g}')
                    c201 = await L.find_it(pg, '進入 201')
                    ok = bool(c201) and await L.go_to(pg, cdp, run, c201['x'], c201['z'] + 0.3, 0.9, '201 教室門口（二樓）', lv=1, max_s=S_(420), stop=TAKEN)
                    took = await taken_over(pg, run, '走樓梯上二樓到 201')
                    if took:
                        for n in ('走樓梯上二樓、走到 201 教室門口（點地面／搖桿）', '門口出現「進入 201 階梯教室」'): unverified(n)
                    else: run.check('走樓梯上二樓、走到 201 教室門口（點地面／搖桿）', ok)
                if ok and not took:
                    await pg.wait_for_timeout(800)
                    run.check('門口出現「進入 201 階梯教室」', await use_interact(pg, cdp, run, '進入 201'))
            t0 = time.time(); reached = False
            while time.time() - t0 < S_(300):
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
            ok = bool(ex) and await L.go_to(pg, cdp, run, ex['x'], ex['z'], ex['r'] * 0.7, '教室後門', max_s=S_(420))
            run.check('下課後走到教室後門（點地面／轉鏡頭／搖桿）', ok)
            if ok:
                await pg.wait_for_timeout(800)
                run.check('後門出現「離開教室」', await use_interact(pg, cdp, run, '離開教室'))
                s = await wait_story(pg, cdp, run, "GAME.G.zone==='linze'")   # v9.4：離開教室回到霖澤館二樓的走廊
                run.check('離開教室 → 法律系館A二樓（第 1 層）', s['zone'] == 'linze' and s.get('lv') == 1, json.dumps(s, ensure_ascii=False))
                ex2 = await L.find_it(pg, '走出法律系館A')
                ok = bool(ex2) and await L.go_to(pg, cdp, run, ex2['x'] - 0.3, ex2['z'], 0.9, '霖澤館大廳出口（走樓梯下一樓）', lv=0, max_s=S_(420))
                run.check('走樓梯下一樓、走到「走出法律系館A」', ok)
                if ok:
                    await pg.wait_for_timeout(800)
                    run.check('出口出現「走出法律系館A」', await use_interact(pg, cdp, run, '走出法律系館A'))
                s = await wait_story(pg, cdp, run, "GAME.G.zone==='campus'")   # 走出霖澤館、回到校園
                g = await goal(pg); await run.shot(pg, 'after_class_campus')
                run.check('走出法律系館A、回到校園、恢復控制', s['zone'] == 'campus' and not s['busy'] and s['stand'], f'goal={g} ' + json.dumps(s, ensure_ascii=False))
        # ---- 存檔 → 重新整理 → 讀檔 ----
        before = await pg.evaluate("(()=>{ const G=GAME.G; return {day:G.day, zone:G.zone, hour:+G.hour.toFixed(2), classDone:!!G.flags.classDone, readCase:G.flags.readCase||null}; })()")
        await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1200)
        await L.tap(pg, cdp, '.tabs button[data-tab="save"]'); await pg.wait_for_timeout(1200)
        saved = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='存檔'); return b.length; })()")
        if saved >= 2:
            c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='存檔')[0]; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
            await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
        slot1 = await pg.evaluate("localStorage.getItem('fatiao3d_slot_1')")
        run.check('用選單存到欄位 1', bool(slot1))
        await pg.reload()
        run.check('重新整理後載入', await L.wait_loaded(pg))
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b.find(x=>x.closest('.item')&&x.closest('.item').textContent.includes('欄位 1'))||b[1]||b[0]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1])
        s = await wait_control(pg, cdp, run, max_steps=40)
        after = await pg.evaluate("(()=>{ const G=GAME.G; return {day:G.day, zone:G.zone, hour:+G.hour.toFixed(2), classDone:!!G.flags.classDone, readCase:G.flags.readCase||null}; })()")
        run.check('標題「讀取」欄位 1：天數、地點、上課與讀案例的進度一樣', after['day'] == before['day'] and after['zone'] == before['zone'] and after['classDone'] == before['classDone'] and after['readCase'] == before['readCase'], f'{before} → {after}')
        moved, pushes, s2 = await L.push_until(pg, cdp, 0, -40, 0.5)   # 推到走了 0.5 m（最多 4 次）：距離隨幀率變，見 playlib.push_until
        run.check('讀檔後搖桿走得動', moved > 0.5, json.dumps(s2, ensure_ascii=False) + f' 推了 {pushes} 次、走了 {moved:.2f} m')
        await run.shot(pg, 'after_load')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        if UNVERIFIED: print(f'[未驗] 共 {len(UNVERIFIED)} 項（劇情接手；要在負載低、每秒 1 格以上時重跑才驗得到）：' + '、'.join(UNVERIFIED), flush=True)
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
