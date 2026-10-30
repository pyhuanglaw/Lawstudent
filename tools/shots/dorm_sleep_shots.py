"""宿舍睡覺的畫面（DORM-SLEEP-1030）截圖：梯子前、爬到一半、躺在床上、熄燈、早上在床上醒來、爬下來。
用法：python3 tools/shots/dorm_sleep_shots.py <網址（不要 ?turbo：turbo 的走路、爬梯子是瞬間的）> <輸出資料夾> [標籤]
[前置] 讀檔到 203（大一上第 2 週週一 22:30，introDone），關掉條件事件與 S.tick（quiet_events）；等正式模型（dorm_room4.glb）載好。
[捷徑] 床的選單直接選第一項（睡到明天早上），不點畫面；每一張要拍的時候把劇情流程停在那一格（包住 GAME.sleep），等 SwiftShader 畫幾格再拍，拍完放行。
這是畫面驗收的截圖，不是玩家流程測試（流程由 tests/dorm_sleep_scene_unit.js 檢查）。"""
import asyncio, json, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
TAG = sys.argv[3] if len(sys.argv) > 3 else 'dorm_sleep'
os.makedirs(OUT, exist_ok=True)
# 要停的那幾格（照順序，每一格只停一次）：名字、判斷式（在頁面裡跑；P＝玩家、S＝STORY、sc＝sleep_scene）
HOLDS = [
    ('1_ladder', "S._bedBusy&&P.pose==='idle'&&Math.hypot(P.obj.position.x-sc.approach[0],P.obj.position.z-sc.approach[1])<0.4&&!S._bed"),
    ('2_climb', "P.pose==='climb'&&S._bed&&!S._bed.waking&&Math.abs(P.obj.position.y-sc.steps[2][1])<0.02"),
    ('3_lie', "P.pose==='lie'&&S._bedBusy&&(S._dark||0)===0&&!(S._bed&&S._bed.waking)&&!document.getElementById('fade').classList.contains('on')"),
    ('4_dark', "P.pose==='lie'&&(S._dark||0)>=1&&!!P.obj.userData.eyesShut"),
    ('5_wake', "P.pose==='lie'&&S._bed&&S._bed.waking&&!P.obj.userData.eyesShut"),
    ('6_down', "P.pose==='climb'&&S._bed&&S._bed.waking&&Math.abs(P.obj.position.y-sc.steps[1][1])<0.02"),
]
HOOK = """((holds)=>{ const S=STORY, orig=GAME.sleep; window.__holds=holds.map(h=>({name:h[0],f:new Function('P','S','sc','return ('+h[1]+');'),done:false})); window.__held=null;
  GAME.sleep=async function(ms){ await orig(ms); const P=GAME.E.player, sc=S.sleepSceneOf(GAME)||(S._bed&&S._bed.sc); if(!sc) return; const H=window.__holds; for(let i=0;i<H.length;i++){ const h=H[i]; if(h.done) continue; let ok=false; try{ ok=h.f(P,S,sc); }catch(e){} if(ok){ for(let j=0;j<i;j++) if(!H[j].done){ H[j].done=true; H[j].skipped=true; } h.done=true; window.__held=h.name; await new Promise(r=>{ window.__release=r; }); window.__held=null; break; } } };   /* 照順序；後面的先成立＝前面的算錯過 */
  const ch=GAME.choose; GAME.choose=async function(opts){ GAME.choose=ch; window.__menu=opts.map(o=>o.t); return 0; }; })"""
STATE = """(()=>{ const P=GAME.E.player, o=P.obj.position, c=GAME.E.camera.position; return {pose:P.pose,x:+o.x.toFixed(3),y:+o.y.toFixed(3),z:+o.z.toFixed(3),yaw:+P.obj.rotation.y.toFixed(3),dark:STORY._dark||0,toneK:GAME.E.toneK,cam:GAME.E.cam.mode,
  camPos:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)],day:GAME.G.day,hour:+GAME.G.hour.toFixed(2),busy:P.busy,lm:typeof GAME.E.zone.lightsOff==='function'}; })()"""


async def main():
    out = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg)
        day = await pg.evaluate("STORY.dayOfKey('2025-09-22')"); wd = await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % day)
        await pg.evaluate("(()=>{ STORY.tick=()=>{}; })()")
        await L.load_state(pg, {'zone': 'dorm', 'stage': 'law', 'hour': 22.5, 'day': day, 'weekday': wd, 'pos': {'x': 0, 'z': 2.0, 'yaw': 3.1416},
                                'flags': {'introDone': True, 'afternoonDone': True, 'classDone': True, 'metAn': True, 'zheInvite': True, 'zheNoodleDone': True}}, quiet_events=True)
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.dormRoot)") and i > 6: break
        await pg.wait_for_timeout(3000)
        await pg.evaluate(HOOK + "(%s)" % json.dumps(HOLDS))
        await pg.evaluate("void STORY.interact({sleep:true},GAME)")
        seen = set()
        for i in range(900):
            held = await pg.evaluate("window.__held")
            if held and held not in seen:
                seen.add(held)
                await pg.wait_for_timeout(9000 if held in ('1_ladder', '2_climb', '6_down') else 5000)   # SwiftShader 1～4 fps：等鏡頭轉過去、畫幾格
                st = await pg.evaluate(STATE); fn = os.path.join(OUT, '%s_%s.png' % (TAG, held)); await pg.screenshot(path=fn)
                out[held] = st; print(held, json.dumps(st, ensure_ascii=False), flush=True)
                await pg.evaluate("window.__release&&window.__release()")
            if await pg.evaluate("window.__holds.every(h=>h.done)&&!window.__held"): break
            if i % 60 == 59: print('…', json.dumps(await pg.evaluate(STATE), ensure_ascii=False), flush=True)
            await pg.wait_for_timeout(500)
        out['skipped'] = await pg.evaluate("window.__holds.filter(h=>h.skipped||!h.done).map(h=>h.name)"); print('skipped', out['skipped'], flush=True)
        for i in range(120):
            if await pg.evaluate("!GAME.E.player.busy&&!STORY._bed&&!STORY._sleeping"): break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(4000)
        st = await pg.evaluate(STATE); fn = os.path.join(OUT, '%s_7_standing.png' % TAG); await pg.screenshot(path=fn); out['7_standing'] = st; print('7_standing', json.dumps(st, ensure_ascii=False), flush=True)
        out['menu'] = await pg.evaluate("window.__menu"); out['errors'] = errs
        print('menu', out['menu'], 'errors', errs, flush=True)
        await b.close()
    json.dump(out, open(os.path.join(OUT, TAG + '.json'), 'w'), ensure_ascii=False, indent=1)

asyncio.run(main())
