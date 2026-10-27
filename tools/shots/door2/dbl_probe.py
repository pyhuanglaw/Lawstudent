"""開門：連按兩下只推一次、推門期間搖桿推不動（BB-C 10-27 第 2 點）。[前置] 讀檔放到公館舊路書房門口；真的用 CDP 觸控按互動鍵、按搖桿。
用法：python3 dbl_probe.py 工作樹 URL 輸出"""
import asyncio, json, sys
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[2], sys.argv[3]
INST = """(()=>{ const R=window.__dd={calls:0,promises:[],zoneT:[],pos:[]}; const o=DOOR.open; DOOR.open=function(){ R.calls++; const p=o.apply(this,arguments); if(p&&!R.promises.includes(p)) R.promises.push(p); return p; };
  const oe=GAME.enter; let z=GAME.G.zone; const f=()=>{ if(GAME.G.zone!==z){ R.zoneT.push(GAME.G.zone); z=GAME.G.zone; } const P=GAME.E.player; R.pos.push([+P.obj.position.x.toFixed(3),+P.obj.position.z.toFixed(3),!!P.busy,GAME.G.zone]); if(R.pos.length>4000) R.pos.shift(); requestAnimationFrame(f); }; requestAnimationFrame(f); return true; })()"""
async def main():
    run = L.Run('door_dbl', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey('2025-10-15')")
        run.setup('[前置] 讀檔：公館 14:00 晴天')
        await L.load_state(pg, {'zone': 'gongguan', 'hour': 14.0, 'day': day, 'weather': 'sunny', 'flags': {'introDone': True}, 'pos': None}, quiet_events=True)
        await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp)
        it = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(q=>q.exit&&q.exit.to==='bookstore'); return i?{x:i.x,z:i.z}:null; })()")
        run.check('找得到「進入舊路書房」', bool(it), str(it))
        await pg.evaluate("(([x,z])=>{ const P=GAME.E.player; P.obj.position.x=x; P.obj.position.z=z-1.0; P.path=null; })(%s)" % json.dumps([it['x'], it['z']]))
        run.setup('[捷徑] 玩家放到書店門口前 1 m')
        await pg.wait_for_timeout(2500); await pg.evaluate(INST)
        s = await L.state(pg); run.check('互動鍵是「進入舊路書房」', s['interact'].startswith('進入舊路書房'), json.dumps(s, ensure_ascii=False))
        # 連按兩下（150 ms），接著按住搖桿往旁邊推 1 秒
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(150); await L.tap(pg, cdp, '#interact')
        p0 = await pg.evaluate("[GAME.E.player.obj.position.x,GAME.E.player.obj.position.z]")
        try:
            await L.joystick(pg, cdp, 60, 0, 400)
        except Exception as e:
            run.note('joy_hold 不能用：%s' % e)
        for _ in range(60):
            if (await L.state(pg))['zone'] == 'bookstore': break
            await pg.wait_for_timeout(300)
        await pg.wait_for_timeout(2000)
        R = await pg.evaluate("(()=>{ const R=window.__dd; return {calls:R.calls, promises:R.promises.length, zones:R.zoneT, busyFrames:R.pos.filter(q=>q[2]).length}; })()")
        run.note(json.dumps(R, ensure_ascii=False))
        run.check('連按兩下：只推一次門（第二次回傳同一個 Promise）、只換一次區域', R['promises'] <= 1 and R['zones'] == ['bookstore'], json.dumps(R, ensure_ascii=False))
        mv = await pg.evaluate("(p0=>{ const pts=window.__dd.pos.filter(q=>q[2]&&q[3]==='gongguan'); if(!pts.length) return null; let m=0; for(const q of pts) m=Math.max(m,Math.hypot(q[0]-pts[0][0],q[1]-pts[0][1])); return m; })(%s)" % json.dumps(p0))
        run.check('推門期間（busy）推搖桿走不動（移動 < 5 cm）', mv is not None and mv < 0.05, str(mv))
        s = await L.state(pg); run.check('到書店（書店進門的選單照舊出來）', s['zone'] == 'bookstore' and (not s['busy'] or s['choices'] > 0), json.dumps(s, ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
