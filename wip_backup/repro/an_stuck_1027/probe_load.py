# 讀使用者 10-27 的存檔（day14 麵店 17:33，以安吃完），看以安的狀態、會不會一直跟著、跟她說話有沒有約的選項。
# 用法：python3 probe_load.py <base url> <輸出前綴>
import asyncio, json, sys, os, time
sys.path.insert(0, '/tmp/claude-0/-home-user-Lawstudent/742ba598-1396-5e88-b31e-f2cb9e414c34/scratchpad/wt_anstuck/tests')
from playwright.async_api import async_playwright
import playlib as L

BASE = sys.argv[1]; OUT = sys.argv[2]
SAVE = json.load(open('/tmp/claude-0/-home-user-Lawstudent/742ba598-1396-5e88-b31e-f2cb9e414c34/scratchpad/save_day14/save.json'))

AN_JS = """(()=>{ const E=GAME.E, P=E.player.obj.position; const L=E.npcs.filter(m=>m.charId==='heroine_01'||m.id==='an');
  return {keys:Object.keys(GAME.npc), n:L.map(n=>({id:n.id,charId:n.charId,beh:n.beh,sched:!!n.sched,leaving:!!n.leaving,seat:!!n.seat,pose:n.pose,frozen:!!n.frozen,until:n.until,x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2),d:+Math.hypot(n.obj.position.x-P.x,n.obj.position.z-P.z).toFixed(2),talk:n.talkLabel})),
    ent:(()=>{ try{ const e=STORY.schedEnt(CHARACTERS.heroine_01,GAME.G); return e&&{zone:e.zone,act:e.act,from:e.from,to:e.to,inv:e.invite&&e.invite.id}; }catch(e){ return 'ERR '+e.message; } })(),
    inv:(GAME.G.invites||[]).filter(v=>v.who==='heroine_01').map(v=>v.id+':'+v.state), hour:+GAME.G.hour.toFixed(3), zone:GAME.G.zone, busy:GAME.D.busyDepth, comp:GAME.G.flags.companion,
    canInv:typeof INV!=='undefined'?INV.canInvite(GAME.G,'heroine_01'):null, reach:STORY.reachable?STORY.reachable('heroine_01',GAME.G):null, stage:SOCIAL.stage('heroine_01'), why:INV.whyNot?INV.whyNot(GAME.G,'heroine_01'):null }; })()"""


async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p)
        logs = []
        pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:300]) if m.type in ('warning', 'error') else None)
        await pg.goto(BASE + '/index.html?turbo', timeout=120000)
        ok = await L.wait_loaded(pg, 240); print('loaded', ok, flush=True)
        await L.no_phone_auto(pg)
        await pg.evaluate("(async(s)=>{ document.getElementById('titleScreen').classList.add('hide'); const r=document.getElementById('rotate'); if(r) r.classList.remove('want'); await GAME.applySave(s); })(%s)" % json.dumps(SAVE))
        await pg.wait_for_timeout(3000)
        print('after load', json.dumps(await pg.evaluate(AN_JS), ensure_ascii=False), flush=True)
        print('state', json.dumps(await L.state(pg), ensure_ascii=False), flush=True)
        await pg.screenshot(path=OUT + '_0load.png')
        # 等一下（遊戲時間走一點），看她會不會離開／跟著
        for k in range(6):
            await pg.wait_for_timeout(2500)
            print('t', k, json.dumps(await pg.evaluate(AN_JS), ensure_ascii=False), flush=True)
        # 玩家往門口走（推搖桿往後）
        s0 = await L.state(pg)
        await L.joystick(pg, cdp, 0, 60, 2500)
        await pg.wait_for_timeout(1500)
        print('after walk', json.dumps(await L.state(pg), ensure_ascii=False), json.dumps(await pg.evaluate(AN_JS), ensure_ascii=False), flush=True)
        await pg.screenshot(path=OUT + '_1walk.png')
        print('errs', errs[:5]); print('logs', logs[-15:])
        await b.close()

asyncio.run(main())
