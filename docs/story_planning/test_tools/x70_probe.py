"""BB：X70 驗證（LAWWW 557c7486）。照 tests/flow_main_day12.py 的第一、二天真實流程；第二天下課後不走出霖澤館，改用手機「地點」去溫州街，第 3 天看以安、小語照作息、跟以安說話會不會自我介紹。
原本：第一、二天主線（2026-10-10 建立，使用者要求「正常速度的玩家完整流程測試」）。
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
    run = L.Run('x70', OUT)
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
        run.check('睡覺後到第二天 13:05 霖澤館前、阿哲對話結束、目標是進霖澤館上課', day == 2 and s['zone'] == 'campus' and '霖澤館' in g and not s['busy'], f'day={day} goal={g} ' + json.dumps(s, ensure_ascii=False))
        door = await L.find_it(pg, '進入霖澤館')
        ok = bool(door) and await L.go_to(pg, cdp, run, door['x'], door['z'], door['r'] * 0.8, '霖澤館門口')
        run.check('走到霖澤館門口（點地面／搖桿）', ok)
        if ok:
            await pg.wait_for_timeout(800)
            run.check('門口出現「進入霖澤館」', await use_interact(pg, cdp, run, '進入霖澤館'))
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
            run.check('上完課（classDone）、恢復控制、目標是走出霖澤館', fl['done'] and not s['busy'] and '走出' in g, f"{fl} goal={g}")
        # ---- X70：不走出霖澤館，用手機去溫州街 ----
        FL = "(()=>{ const F=GAME.G.flags; return {day:GAME.G.day, h:+GAME.G.hour.toFixed(2), zone:GAME.G.zone, metAn:!!F.met_an, metAn2:!!F.metAn, afternoonDone:!!F.afternoonDone, anMissed:!!F.anMissed, anAfter:!!F.anAfter, anSkipped:!!F.anSkipped, an:SOCIAL.has('heroine_01','FIRST_MET')}; })()"
        print('下課後', json.dumps(await pg.evaluate(FL), ensure_ascii=False), flush=True)
        async def phone_place(name):
            await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
            await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"places\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(800)
            c = await pg.evaluate("(n=>{ const e=[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.includes(n)||b.closest('.item').textContent.includes(n)); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.closest('.item').textContent.trim().slice(0,30)]; })(%s)" % json.dumps(name))
            if not c:
                run.note('手機「地點」沒有「%s」' % name); await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b) b.click(); })()"); return False
            await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500); print('   手機前往', c[2], flush=True)
            await wait_control(pg, cdp, run, pick=0, max_steps=80); return True
        ok = await phone_place('溫州街'); s = await L.state(pg)
        run.check('第二天下課後在霖澤館裡，用手機「地點」去溫州街', ok and s['zone'] == 'wenzhou', json.dumps(s, ensure_ascii=False)[:200])
        await run.shot(pg, 'day2_wenzhou')
        print('到溫州街', json.dumps(await pg.evaluate(FL), ensure_ascii=False), flush=True)
        # 回宿舍睡覺 → 第 3 天
        ok = await phone_place('宿舍'); bed = await L.find_it(pg, '睡覺')
        if bed and await L.go_to(pg, cdp, run, bed['x'], bed['z'], bed['r'] * 0.8, '床'):
            await pg.wait_for_timeout(800); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
        for _ in range(40):
            s = await L.state(pg)
            if s['choices']:
                c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const e=bs.find(x=>/^睡到明天早上|^睡覺/.test(x.textContent.trim()))||bs[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,24)]; })()")
                await L.touch_tap(cdp, c[0], c[1]); print('   ▶', c[2], flush=True); await pg.wait_for_timeout(1000); continue
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
            if s['busy']: await pg.wait_for_timeout(600); continue
            if (await pg.evaluate("GAME.G.day")) >= 3: break
            await pg.wait_for_timeout(800)
        st3 = await pg.evaluate(FL); print('第 3 天早上', json.dumps(st3, ensure_ascii=False), flush=True)
        run.check('第 3 天起開放（afternoonDone／anMissed）', st3['day'] >= 3 and st3['afternoonDone'] and st3['anMissed'], json.dumps(st3, ensure_ascii=False))
        where = await pg.evaluate("(()=>{ const o={}; for(const h of [10,13,16.5,17.5,20]){ const G=GAME.G, h0=G.hour; G.hour=h; try{ o[h]={an:STORY.whereIs(GAME,'heroine_01'), yu:STORY.whereIs(GAME,'heroine_03')}; }catch(e){ o[h]=String(e); } G.hour=h0; } return o; })()")
        print('照作息（STORY.whereIs，只查不改）', json.dumps(where, ensure_ascii=False), flush=True)
        # 等到傍晚 → 去 Café 找以安
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
        await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"today\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(800)
        c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#phoneBody [data-skip]')]; const e=bs.find(b=>+b.dataset.skip>=16&&+b.dataset.skip<=17.6)||bs.find(b=>/傍晚/.test(b.textContent)); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1]); print('   跳過時間', c[2], flush=True); await pg.wait_for_timeout(2000)
        else: await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b) b.click(); })()")
        await wait_control(pg, cdp, run, pick=0, max_steps=80)
        await phone_place('溫州街')
        ex = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='cafe'); return it?{x:it.x,z:it.z,r:it.radius||1.2}:null; })()")
        if ex and await L.go_to(pg, cdp, run, ex['x'], ex['z'], ex['r'] * 0.7, 'Café 門口'):
            await pg.wait_for_timeout(800); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(5000)
        await wait_control(pg, cdp, run, pick=0, max_steps=80)
        here = await pg.evaluate("(()=>({zone:GAME.G.zone, h:+GAME.G.hour.toFixed(2), npcs:GAME.E.npcs.filter(n=>!n.isExtra).map(n=>[n.charId||n.id,n.name,+n.obj.position.x.toFixed(1),+n.obj.position.z.toFixed(1)])}))()")
        print('Café', json.dumps(here, ensure_ascii=False), flush=True); await run.shot(pg, 'day3_cafe')
        an = await pg.evaluate("(()=>{ const n=GAME.E.npcs.find(n=>n.charId==='heroine_01'||n.id==='an'); return n?{x:n.obj.position.x,z:n.obj.position.z}:null; })()")
        run.check('第 3 天傍晚以安照作息在 Café', bool(an), json.dumps(here, ensure_ascii=False)[:300])
        lines = []
        if an:
            seat_free = await L.go_to(pg, cdp, run, an['x'], an['z'] + 1.0, 1.4, '以安旁邊')
            lab = (await L.state(pg))['interact']; print('   互動按鈕', lab, flush=True)
            if lab: await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
            for _ in range(60):
                s = await L.state(pg)
                if s['dlg']: lines.append(s['dtext']); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
                if s['choices']:
                    c = await pg.evaluate("(()=>{ const e=document.querySelector('#choices button'); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim()]; })()"); lines.append('▶' + c[2]); await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(800); continue
                if s['busy']: await pg.wait_for_timeout(500); continue
                break
            print('   以安說：', json.dumps(lines, ensure_ascii=False), flush=True)
            await run.shot(pg, 'day3_after_talk')
        run.check('第一次跟以安說話，她自我介紹（「我是小安」）', any('我是小安' in x for x in lines), json.dumps(lines[:6], ensure_ascii=False))
        run.check('沒有提到咖啡廳那段的回聲（沒去過的事）', not any('上次' in x and '咖啡' in x for x in lines))
        print('最後', json.dumps(await pg.evaluate(FL), ensure_ascii=False), flush=True)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
