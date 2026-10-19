"""劇情鎖住沒有結束時可以脫困（BUG-BOWL-STUCK-1018，使用者 10-18：保齡球演完回宿舍卡住，busy=true、鏡頭停在過場、沒有對話）。
[前置／捷徑] 讀一個宿舍的存檔，直接呼叫 GAME.sceneBegin()＋過場鏡頭、不接 sceneEnd，做出和使用者除錯畫面一樣的狀態。
要通過：①10 秒內不放開（正常演出中的停頓不能被打斷）②超過 10 秒：除錯面板寫出是誰開的那一段、選單的「讀取」讀得進去、讀完能走
③有對話在演的時候不算卡住 ④卡住的紀錄留在瀏覽器（fatiao3d_stuck，讀檔以後還在，匯出存檔帶 _stuck）。舊版（沒有這個保底）：②的讀取會被「劇情還在進行」擋下來。"""
import asyncio, json, sys
sys.path.insert(0, 'tests')
from playwright.async_api import async_playwright
import playlib as L
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
async def main():
    fails = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p)
        await pg.goto(URL + ('&' if '?' in URL else '?') + 'mdbg'); await L.wait_loaded(pg)
        await L.load_state(pg, {'zone': 'dorm', 'hour': 21.8, 'day': 8, 'weekday': 5, 'weather': 'clear', 'pos': {'x': 0, 'z': 2.4, 'yaw': 3.142, 'lv': 0}}, quiet_events=True)
        await pg.wait_for_timeout(3000)
        await pg.evaluate("localStorage.setItem('fatiao3d_auto', JSON.stringify(GAME.snapshot()))")
        # ③ 對話在演：不算卡住
        await pg.evaluate("void (async()=>{ GAME.sceneBegin(); await GAME.say(null,'（測試：對話停在這裡。）'); GAME.sceneEnd(); })()")
        await pg.wait_for_timeout(12500)
        s3 = await pg.evaluate("({stale:GAME.D.stale,dlg:GAME.D.active})")
        print('③ 對話中 12.5 秒', s3)
        if s3['stale'] or not s3['dlg']: fails.append('③ 對話中被當成卡住')
        class Run:
            def note(self, t): pass
        await L.advance_dialogs(pg, cdp, Run(), lambda q: not q['dlg'], max_steps=4, step_wait=400)
        await pg.wait_for_timeout(800)
        # ① ② 做出卡住的狀態
        await pg.evaluate("""(()=>{ const E=GAME.E, p=E.player.obj.position; (function stuckHere(){ GAME.sceneBegin(); })(); E.cinematic(new THREE.Vector3(p.x-2,p.y+1.6,p.z+2), new THREE.Vector3(p.x,p.y+1.2,p.z)); })()""")
        await pg.wait_for_timeout(6000)
        s1 = await pg.evaluate("({stale:GAME.D.stale,busy:GAME.E.player.busy,depth:GAME.D.busyDepth,cam:GAME.E.cam.mode})")
        print('① 6 秒', s1)
        if s1['stale'] or not s1['busy']: fails.append('① 6 秒就放開了')
        await pg.wait_for_timeout(6500)
        s2 = await pg.evaluate("({stale:GAME.D.stale,busy:GAME.E.player.busy,dbg:document.getElementById('mdbg').textContent,hudR:getComputedStyle(document.getElementById('hudR')).opacity})")
        scene = [l for l in s2['dbg'].split('\n') if l.startswith('SCENE')]
        print('② 12.5 秒', {k: s2[k] for k in ('stale', 'busy', 'hudR')}, scene)
        if not s2['stale']: fails.append('② 超過 10 秒沒有標成卡住')
        if not scene or 'stuckHere' not in scene[0]: fails.append('② 除錯面板沒有寫出是誰開的那一段')
        # ④ 卡住的紀錄留在瀏覽器（讀檔也不會不見）、匯出存檔帶 _stuck：使用者上傳存檔就看得到是哪一段（BUG-MOVEOUT-STUCK-1018）
        sl = await pg.evaluate("(()=>{ try{ return JSON.parse(localStorage.getItem('fatiao3d_stuck')||'[]'); }catch(e){ return null; } })()")
        print('④ 卡住的紀錄', json.dumps(sl, ensure_ascii=False)[:300])
        if not sl or not any('stuckHere' in ' '.join(x.get('by') or []) and x.get('zone') == 'dorm' for x in sl): fails.append('④ 卡住的紀錄沒有留在瀏覽器（fatiao3d_stuck）')
        await pg.screenshot(path='shots/stale_lock_escape_stuck.png')
        await pg.click('#btnMenu'); await pg.wait_for_timeout(500)
        await pg.click("#menu .tabs button[data-tab='save']"); await pg.wait_for_timeout(500)
        await pg.click("#saveSlots button.btn.pri >> nth=0"); await pg.wait_for_timeout(6000)
        s4 = await pg.evaluate("({busy:GAME.E.player.busy,depth:GAME.D.busyDepth,stale:GAME.D.stale,cam:GAME.E.cam.mode,zone:GAME.G.zone})")
        print('② 讀檔以後', s4)
        if s4['busy'] or s4['depth'] or s4['cam'] != 'follow': fails.append('② 讀檔以後還鎖著')
        sl2 = await pg.evaluate("GAME.stuckLog?GAME.stuckLog():null")
        if not sl2 or not len(sl2): fails.append('④ 讀檔以後卡住的紀錄不見了（匯出存檔就帶不出去）')
        print('errs', errs[:5]); await b.close()
    print('FAIL ' + '；'.join(fails) if fails else 'PASS')
    sys.exit(1 if fails else 0)
asyncio.run(main())
