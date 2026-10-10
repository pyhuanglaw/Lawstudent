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


async def wait_control(pg, cdp, run, pick=0, max_steps=120, extra=None):
    return await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['dlg'] and not q['choices'] and not q['busy'] and (extra is None or extra(q)), max_steps=max_steps, pick=pick)


async def wait_story(pg, cdp, run, js_done, pick=0, max_s=300):
    """等劇情場景真的演完：js_done（遊戲自己的劇情旗標）為真、而且恢復控制（沒有對話、選項、忙碌）。
    只看「恢復控制」會在換場景的空檔（標題卡、載入區域，場景還沒 sceneBegin）提早成立——
    2026-10-10 發布前測試：第一天宿舍、第二天霖澤館前都在劇情開始前就檢查了目標（截圖：阿哲才剛說「祐廷！」）"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await wait_control(pg, cdp, run, pick=pick)
        if not s['busy'] and not s['dlg'] and not s['choices'] and await pg.evaluate(js_done): return s
        await pg.wait_for_timeout(800)
    return await L.state(pg)


async def goal(pg): return await pg.evaluate("(document.getElementById('goal')||{}).textContent||''")


async def main():
    run = L.Run('flow_main_day12', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
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
        run.check('睡覺後到第二天 13:05 霖澤館前、阿哲對話結束、目標是進霖澤館上課', day == 2 and s['zone'] == 'campus' and '霖澤館' in g and not s['busy'], f'day={day} goal={g} ' + json.dumps(s, ensure_ascii=False))
        door = await L.find_it(pg, '進入霖澤館')
        ok = bool(door) and await L.go_to(pg, cdp, run, door['x'], door['z'], door['r'] * 0.8, '霖澤館門口')
        run.check('走到霖澤館門口（點地面／搖桿）', ok)
        if ok:
            await pg.wait_for_timeout(800)
            run.check('門口出現「進入霖澤館」', await use_interact(pg, cdp, run, '進入霖澤館'))
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
            run.check('上完課（classDone）、恢復控制、目標是走出霖澤館', fl['done'] and not s['busy'] and '走出' in g, f"{fl} goal={g}")
            ex = await L.find_it(pg, '離開教室')
            ok = bool(ex) and await L.go_to(pg, cdp, run, ex['x'], ex['z'], ex['r'] * 0.7, '教室後門')
            run.check('下課後走到教室後門（點地面／轉鏡頭／搖桿）', ok)
            if ok:
                await pg.wait_for_timeout(800)
                run.check('後門出現「離開教室」', await use_interact(pg, cdp, run, '離開教室'))
                s = await wait_story(pg, cdp, run, "GAME.G.zone==='campus'")   # 走出霖澤館、回到校園
                g = await goal(pg); await run.shot(pg, 'after_class_campus')
                run.check('走出霖澤館、回到校園、恢復控制', s['zone'] == 'campus' and not s['busy'] and s['stand'], f'goal={g} ' + json.dumps(s, ensure_ascii=False))
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
        p0 = (s['x'], s['z']); await L.joystick(pg, cdp, 0, -40, 1500); s2 = await L.state(pg)
        run.check('讀檔後搖桿走得動', math.hypot(s2['x'] - p0[0], s2['z'] - p0[1]) > 0.5, json.dumps(s2, ensure_ascii=False))
        await run.shot(pg, 'after_load')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
