"""v9.9 新功能的冒煙測試（發布前的安全檢查；和 tests/smoke_release.py 一起跑）。
只確認新做進來的地方玩得下去、沒有 JS 例外，不測劇情細節（劇情在單元測試）：
  1. 溫州街三家新店（wz_brunch 半熟、wz_print 阿德影印輸出、wz_teahouse 一盞）、新體育館（gym 一樓、gym_b1 健身中心與游泳池）：
     進得去、正式模型接上、搖桿走得動、有離開的互動點。
  2. 捷運自由出行（DL-06）：在公館站入口選一個景點出發 → 到了有選單 → 選「回去」→ 回到公館或宿舍，G.trip 清掉。
  3. 週末回臺北的家（home3d.js；v9.9 加了寒假模式，法律系不受影響）：週五 19:00 回家 → 家裡的選單有「回宿舍」→ 回到宿舍。
  4. 全程沒有 JS 例外。
[前置／捷徑]：用遊戲自己的讀檔（GAME.applySave）把玩家放到那個地方；出行、回家直接呼叫 TRIP.go／HOME.go（和點互動點同一個函式）；用 ?turbo。
用法：python3 tests/smoke_v99.py URL [輸出資料夾]"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/smoke_v99'
TURBO = URL + ('&' if '?' in URL else '?') + 'turbo'
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
SAT = 20   # 法律系第 20 天＝週六（半熟、一盞都開）

CLICK_JS = """(want=>{ const bs=[...document.querySelectorAll('#choices button')]; const b=bs.find(x=>x.textContent.includes(want)); if(!b) return bs.map(x=>x.textContent.trim().slice(0,24)); b.click(); return true; })"""


async def choices(pg, max_s=60):
    for _ in range(int(max_s * 2)):
        t = await pg.evaluate("[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>b.textContent.trim())")
        if t: return t
        # 對話：點一下往下
        await pg.evaluate("(()=>{ const d=document.getElementById('dlg'); if(d&&!d.classList.contains('hide')) d.click(); })()")
        await pg.wait_for_timeout(500)
    return []


async def main():
    run = L.Run('smoke_v99', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(TURBO); run.check('遊戲載入', await L.wait_loaded(pg))
        # 1. 新的區域
        for zone, pos in [('wz_brunch', None), ('wz_print', None), ('wz_teahouse', None), ('gym', {'x': 0, 'z': 17.6, 'yaw': 3.14}), ('gym_b1', {'x': 18, 'z': 6.0, 'yaw': 3.14})]:
            st = {'zone': zone, 'day': SAT, 'hour': 10.5, 'flags': FLAGS}
            if pos: st['pos'] = pos
            run.setup(f'讀檔到 {zone}（第 {SAT} 天 10:30）')
            await L.load_state(pg, st, quiet_events=True)
            formal = await pg.evaluate("(async()=>{ for(let i=0;i<160;i++){ const z=GAME.E.zone; if(z&&z.formal) return true; await new Promise(r=>setTimeout(r,250)); } return !!(GAME.E.zone&&GAME.E.zone.formal); })()")
            s0 = await L.state(pg)
            await L.joystick(pg, cdp, 0, -60, 900)
            s1 = await L.state(pg)
            moved = abs(s1['x'] - s0['x']) + abs(s1['z'] - s0['z'])
            exits = await pg.evaluate("GAME.E.interactables.filter(i=>i.exit).length")
            run.check(f'{zone}：進得去、正式模型接上、搖桿走得動、有離開的互動點', s0['zone'] == zone and formal and moved > 0.2 and exits >= 1,
                      json.dumps({'zone': s0['zone'], 'formal': formal, 'moved': round(moved, 2), 'exits': exits}))
            await run.shot(pg, zone)
        # 星期幾：讀檔不會照日曆重算 weekday，要自己給（第 20 天不是週六）
        sat = await pg.evaluate("(()=>{ for(let d=10;d<60;d++){ const w=CALENDAR.dateOf(d).wd; if(w===6&&!CALENDAR.holiday(d)&&!CALENDAR.holiday(d-1)) return d; } return 18; })()")
        # 2. 捷運自由出行
        run.setup(f'讀檔到公館站入口（第 {sat} 天週六 13:00），直接呼叫 TRIP.go 第一個能去的景點')
        await L.load_state(pg, {'zone': 'gongguan', 'day': sat, 'weekday': 6, 'hour': 13, 'flags': FLAGS, 'money': 3000, 'pos': {'x': -35.6, 'z': 13, 'yaw': 0}}, quiet_events=True)
        spot = await pg.evaluate("(()=>{ const s=TRIP.list().find(x=>TRIP.check(GAME.G,x).ok); if(!s) return 'NONE:'+TRIP.list().slice(0,3).map(x=>(x.id||x.name)+'='+TRIP.check(GAME.G,x).why).join(' / '); void TRIP.go(GAME,s); return s.id||s.name; })()")
        ch = await choices(pg)
        trip = await pg.evaluate("GAME.G.trip&&GAME.G.trip.spot")
        run.check('出行：有能去的景點、出發後到了有選單', bool(spot) and not str(spot).startswith('NONE') and bool(trip) and len(ch) > 0, json.dumps({'spot': spot, 'trip': trip, 'choices': ch[:6]}, ensure_ascii=False))
        await run.shot(pg, 'trip')
        r = await pg.evaluate(CLICK_JS + "('回去')")
        for _ in range(8):
            ch = await choices(pg, 20)
            if not ch: break
            await pg.evaluate("(()=>{ const b=document.querySelector('#choices button'); if(b) b.click(); })()")
            await pg.wait_for_timeout(800)
        await pg.wait_for_timeout(3000)
        s = await L.state(pg); trip2 = await pg.evaluate("!!GAME.G.trip")
        run.check('出行：選「回去」→ 回到公館或宿舍、G.trip 清掉', r is True and not trip2 and s['zone'] in ('gongguan', 'dorm', 'dorm_hall'), json.dumps({'click': r, 'zone': s['zone'], 'trip': trip2}, ensure_ascii=False))
        # 3. 週末回家
        run.setup(f'讀檔到宿舍房間（第 {sat - 1} 天週五 19:00），直接呼叫 HOME.go')
        await L.load_state(pg, {'zone': 'dorm', 'day': sat - 1, 'weekday': 5, 'hour': 19, 'flags': FLAGS, 'pos': {'x': 0, 'z': 1.5, 'yaw': 3.14}}, quiet_events=True)
        await pg.evaluate("void HOME.go(GAME)")
        ch = await choices(pg)
        at_home = await pg.evaluate("HOME.at(GAME.G)&&!(GAME.G.home&&GAME.G.home.winter)")
        run.check('回家：在家、家裡的選單有「回宿舍」、不是寒假模式', at_home and any('回宿舍' in c for c in ch), json.dumps(ch, ensure_ascii=False))
        await run.shot(pg, 'home')
        r = await pg.evaluate(CLICK_JS + "('回宿舍')")
        for _ in range(60):
            if not await pg.evaluate("HOME.at(GAME.G)"): break
            await pg.evaluate("(()=>{ const d=document.getElementById('dlg'); if(d&&!d.classList.contains('hide')) d.click(); })()")
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(2500)
        s = await L.state(pg)
        run.check('回家：選「回宿舍」→ 回到宿舍房間', r is True and not await pg.evaluate("HOME.at(GAME.G)") and s['zone'] == 'dorm', json.dumps({'click': r, 'zone': s['zone']}))
        run.check('全程沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    return run.finish()

if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
