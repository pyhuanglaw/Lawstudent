"""CC v2（2026-11-02，BB 13:37 P0）：tests/flow_main_day12.py 的副本，只改第二天那一段——
  阿哲那一場一定要演（台詞＋campusIntro）、恢復控制以後不再點對話（快的 GPU 上舊測試會把整堂課點完）、
  記錄恢復控制到 goDay2 帶進 201 的真實秒數、在教室存檔（先關掉自動打開的手機）。上課本身由 R2 flow_class_real 驗證。
原說明：真實玩家流程：第一、二天主線（2026-10-10 建立，使用者要求「正常速度的玩家完整流程測試」）。
不用 ?turbo、不讀檔、不改旗標——從標題畫面開新遊戲，全部用手機觸控操作：
  標題「開始新的一天」→ 宿舍開場對話與選項 → 走到書桌（點地移動）讀案例 → 走到床邊睡覺 →
  第二天霖澤館前（阿哲）→ 走到霖澤館門口進去 → 上課劇情自己走到座位（不能靠卡住保險）→ 回答 → 下課 →
  走到後門離開教室 → 回到校園、恢復控制 → 用選單存到欄位 1 → 重新整理頁面 → 標題「讀取」欄位 1 → 狀態一致、走得動。
移動用兩種真的操作：點地面（觸控點擊，走引擎的自動找路）、搖桿（觸控拖曳 #joy）。
SwiftShader 每秒 1–4 格、遊戲 dt 上限 0.1 秒，所以遊戲時間比真實時間慢很多；整個流程約 20–40 分鐘。
用法：python3 tests/flow_main_day12.py URL [輸出資料夾]"""
import asyncio, json, sys, time, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').environ.get('LW_TESTS') or __import__('os').path.join(__import__('os').path.dirname(__file__), '..', '..', '..', '..', 'tests'))
import playlib as L
SAY_HOOK = "(()=>{ if(window.__SAYH) return; window.__SAYH=1; window.__SAY=[]; const s0=GAME.say; GAME.say=function(w,t){ try{ window.__SAY.push({n:((w&&(w.name||''))+'|'+(w&&(w.id||w.charId||''))+'|'+(typeof w==='string'?w:'')),t:String(t==null?'':t),h:+(+GAME.G.hour).toFixed(2)}); }catch(e){} return s0.apply(this,arguments); }; if(GAME.caption){ const c0=GAME.caption; GAME.caption=function(n,t){ try{ window.__SAY.push({n:'caption',t:String(t==null?'':t),h:+(+GAME.G.hour).toFixed(2),rt:performance.now()}); }catch(e){} return c0.apply(this,arguments); }; } })()"

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
            # ---- v2（CC，BB 13:37）：第二天照新流程——阿哲那一場一定要演；恢復控制以後不再點對話；記錄到被帶進 201 的真實秒數 ----
            await pg.evaluate(SAY_HOOK)
            t_sleep = time.time(); ctrl_t = None; s = None
            while time.time() - t_sleep < S_(900):
                st = await L.state(pg); fl = await pg.evaluate("({ci:!!GAME.G.flags.campusIntro, day:GAME.G.day, z:GAME.G.zone})")
                if fl['ci'] and fl['z'] == 'campus' and not st['busy'] and not st['dlg'] and not st['choices']:
                    s2 = await L.state(pg)   # 旗標和狀態是兩次讀取：再確認一次（同 wait_story）
                    if not s2['busy'] and not s2['dlg'] and not s2['choices']: s = s2; ctrl_t = time.time(); break
                if fl['z'] == 'classroom': s = st; break   # 已經被帶走了（不應該在恢復控制之前）
                if st['dlg'] or st['choices']:
                    await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['dlg'] and not q['choices'], max_steps=3, pick=0)   # 一次只點幾下，每輪都重看旗標
                else:
                    await pg.wait_for_timeout(300)
            said = await pg.evaluate("window.__SAY||[]")
            zhe = [x for x in said if '阿哲' in (x.get('n') or '') or 'zhe' in (x.get('n') or '')]
            run.check('第二天阿哲那一場真的有演（campusIntro 成立、有阿哲的台詞）', bool(zhe) and await pg.evaluate("!!GAME.G.flags.campusIntro"), json.dumps({'zhe': [x['t'][:30] for x in zhe[:6]], 'n_said': len(said)}, ensure_ascii=False))
            g = await goal(pg); day = await pg.evaluate("GAME.G.day"); h2 = await pg.evaluate("+GAME.G.hour.toFixed(2)")
            await run.shot(pg, 'day2_campus_ctrl')
            run.check('阿哲那一場演完、在霖澤館前恢復控制（第二天、還沒上課）', ctrl_t is not None and day == 2 and s and s['zone'] == 'campus' and not await pg.evaluate("!!GAME.G.flags.classDone"), f'day={day} h={h2} goal={g} ' + json.dumps(s, ensure_ascii=False))
            # 恢復控制以後：不點對話、不動，量 goDay2 多久把人帶進 201（BB 13:37 第 4 點：體驗參考，不算 PASS／FAIL）
            took_s = None; t1 = time.time()
            while ctrl_t and time.time() - t1 < S_(300):   # 8c99c2d02（UX-DAY2-AUTOPULL）起：等到 13:15＋空下來 8 秒才帶走；舊版 1.5 秒
                if (await pg.evaluate("GAME.G.zone")) == 'classroom': took_s = round(time.time() - ctrl_t, 2); break
                await pg.wait_for_timeout(100)
            fr = await pg.evaluate("GAME.E.frame|0")
            run.note(f'【體驗參考】從霖澤館前恢復控制到被帶進 201：{took_s} 秒真實時間（遊戲 {h2:.2f} 恢復控制；幀數計數 {fr}）')
            caps = [x for x in (await pg.evaluate("window.__SAY||[]")) if x.get('n') == 'caption' and '快上課了' in (x.get('t') or '')]
            took_h = await pg.evaluate("+GAME.G.hour.toFixed(2)")
            run.note(f'【體驗參考】帶進 201 時遊戲時間 {took_h}；「快上課了」字幕：{json.dumps([[c["h"], c["t"][:30]] for c in caps], ensure_ascii=False)}')
            print(json.dumps({'cc_takeover_real_s': took_s, 'ctrl_hour': h2, 'took_hour': took_h, 'caption': [c['t'] for c in caps]}, ensure_ascii=False), flush=True)
            if took_s is None:
                run.note(f'{S_(300)} 秒內沒有被帶進 201：照原測試自己走過去（點地面）')
                door = await L.find_it(pg, '進入法律系館A')
                ok = bool(door) and await L.go_to(pg, cdp, run, door['x'], door['z'], door['r'] * 0.8, '法律系館A門口', max_s=S_(420), stop=TAKEN)
                if ok and not TAKEN(await L.state(pg)):
                    await pg.wait_for_timeout(800); await use_interact(pg, cdp, run, '進入法律系館A')
                t2 = time.time()
                while time.time() - t2 < S_(600) and (await pg.evaluate("GAME.G.zone")) != 'classroom':
                    st = await L.state(pg)
                    if st['zone'] == 'linze' and not st['busy'] and not st['dlg']:
                        c201 = await L.find_it(pg, '進入 201')
                        if c201 and await L.go_to(pg, cdp, run, c201['x'], c201['z'] + 0.3, 0.9, '201 教室門口（二樓）', lv=1, max_s=S_(420), stop=TAKEN):
                            if not TAKEN(await L.state(pg)): await pg.wait_for_timeout(800); await use_interact(pg, cdp, run, '進入 201')
                    elif st['dlg'] or st['choices']:
                        await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['dlg'] and not q['choices'], max_steps=3, pick=0)
                    await pg.wait_for_timeout(500)
            fl = await pg.evaluate("({z:GAME.G.zone, h:+GAME.G.hour.toFixed(2), classDone:!!GAME.G.flags.classDone, classNow:!!GAME.G.flags.classNow, day:GAME.G.day})")
            await run.shot(pg, 'day2_in_201')
            run.check('進到 201、這堂課還沒被跳過（第二天 12:30～15:12、classDone 還沒成立）', fl['z'] == 'classroom' and fl['day'] == 2 and 12.5 <= fl['h'] < 15.2 and not fl['classDone'], json.dumps(fl, ensure_ascii=False))
            run.check('沒有用到「卡住後放到目的地」的保險（walkFallbacks＝0）', (await pg.evaluate("GAME.walkFallbacks|0")) == 0, str(await pg.evaluate("GAME.walkFallbacks|0")))
            # 上課本身由 R2 flow_class_real 驗證（BB 13:37）：這裡不點對話。等上課劇情放手（或 S_(300) 秒）再存檔
            t3 = time.time()
            while time.time() - t3 < S_(300):
                st = await L.state(pg)
                if not st['busy'] and not st['dlg'] and not st['choices']: break
                if st['dlg'] or st['choices']:
                    await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['dlg'] and not q['choices'], max_steps=3, pick=0)
                else: await pg.wait_for_timeout(500)
            shut = await L.close_panels(pg, cdp)
            if shut: run.note(f'存檔前關掉：{shut}（D103 有要回的訊息會自動打開手機、遊戲暫停）')
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
