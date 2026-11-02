"""爬宿舍上舖梯子的手勢截圖（CLIMB-POSE-1102；使用者 11-02「走上床手為什麼要往上抬高阿 好像殭屍」）。
用法：python3 tools/dev_scratch/climb_pose_shot.py <網址（不要 ?turbo）> <輸出資料夾> <標籤> [--old <舊的 character3d.js>]
  --old：用 Playwright 把 src/character3d.js 換成指定的檔（改前＝git show 776314ce0:src/character3d.js），其他檔照舊——改前改後同一個流程、同一個鏡頭。
[前置] 讀檔到 203（大一上第 2 週週一 22:30，introDone），關掉條件事件與 S.tick；等正式模型（dorm_room4.glb）、祐廷的 VRM 載好。
[捷徑] 床的選單直接選第一項（睡到明天早上），不點畫面；爬到第 1、3、5 階的時候把劇情流程停在那一格（包住 GAME.sleep），
       停住的時候人物動畫照跑（走路片段、換手）；每一階拍三張：遊戲的爬梯子鏡頭（S.climbCam）、側面（人物左邊）、斜後方。
       側面、斜後方的鏡頭是截圖工具用 GAME.cine 放的（遊戲裡沒有這兩個鏡頭），拍完放行，下一階遊戲自己換回 climbCam。
這是畫面驗收的截圖，不是玩家流程測試（流程由 tests/dorm_sleep_scene_unit.js、手的角度由 tests/climb_pose_unit.js 檢查）。"""
import asyncio, json, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright
URL, OUT, TAG = sys.argv[1], sys.argv[2], sys.argv[3]
OLD = sys.argv[sys.argv.index('--old') + 1] if '--old' in sys.argv else None
os.makedirs(OUT, exist_ok=True)
HOLDS = [('step1', "P.pose==='climb'&&S._bed&&!S._bed.waking&&Math.abs(P.obj.position.y-sc.steps[0][1])<0.02"),
         ('step3', "P.pose==='climb'&&S._bed&&!S._bed.waking&&Math.abs(P.obj.position.y-sc.steps[2][1])<0.02"),
         ('step5', "P.pose==='climb'&&S._bed&&!S._bed.waking&&Math.abs(P.obj.position.y-sc.steps[sc.steps.length-1][1])<0.02")]
HOOK = """((holds)=>{ const S=STORY, orig=GAME.sleep; window.__holds=holds.map(h=>({name:h[0],f:new Function('P','S','sc','return ('+h[1]+');'),done:false})); window.__held=null;
  GAME.sleep=async function(ms){ await orig(ms); const P=GAME.E.player, sc=S.sleepSceneOf(GAME)||(S._bed&&S._bed.sc); if(!sc) return; const H=window.__holds; for(let i=0;i<H.length;i++){ const h=H[i]; if(h.done) continue; let ok=false; try{ ok=h.f(P,S,sc); }catch(e){} if(ok){ for(let j=0;j<i;j++) if(!H[j].done){ H[j].done=true; H[j].skipped=true; } h.done=true; window.__held=h.name; await new Promise(r=>{ window.__release=r; }); window.__held=null; break; } } };
  const ch=GAME.choose; GAME.choose=async function(opts){ GAME.choose=ch; return 0; }; })"""
# 手、手肘、肩膀在人物座標（x 往左、y 往上、z 往前）；hi＝新版的換手進度（改前沒有）
STATE = """(()=>{ const P=GAME.E.player, h=P.obj, u=h.userData, o=h.position, c=GAME.E.camera.position; const R=n=>u.vrm&&u.vrm.humanoid.getRawBoneNode(n);
  const Lc=n=>{ const b=R(n); if(!b) return null; const v=h.worldToLocal(b.getWorldPosition(new THREE.Vector3())); return [+v.x.toFixed(3),+v.y.toFixed(3),+v.z.toFixed(3)]; };
  return {pose:P.pose,x:+o.x.toFixed(3),y:+o.y.toFixed(3),z:+o.z.toFixed(3),yaw:+h.rotation.y.toFixed(3),driver:u.driver,cam:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)],
    hi:u.climbHi||null,lHand:Lc('leftHand'),rHand:Lc('rightHand'),lElbow:Lc('leftLowerArm'),rElbow:Lc('rightLowerArm'),lShoulder:Lc('leftUpperArm'),rShoulder:Lc('rightUpperArm')}; })()"""
# 側面（人物左邊＝+z 那一側，門口那一頭的空地）、斜後方（走道那一側、高一點）
CAMS = {'side': "(()=>{ const p=GAME.E.player.obj.position; GAME.cine('close',GAME.E.player.obj,null,{pos:new THREE.Vector3(p.x+0.1,p.y+1.25,3.15),look:new THREE.Vector3(p.x,p.y+1.2,p.z),snap:true}); })()",
        'back': "(()=>{ const p=GAME.E.player.obj.position; GAME.cine('close',GAME.E.player.obj,null,{pos:new THREE.Vector3(Math.min(0.3,p.x+1.35),p.y+1.65,p.z+0.95),look:new THREE.Vector3(p.x-0.15,p.y+1.25,p.z),snap:true}); })()"}


async def main():
    out = {'old': bool(OLD)}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        if OLD:
            body = open(OLD, encoding='utf8').read()
            await pg.route('**/src/character3d.js*', lambda r: r.fulfill(status=200, content_type='application/javascript; charset=utf-8', body=body))
        await pg.goto(URL); await L.wait_loaded(pg)
        day = await pg.evaluate("STORY.dayOfKey('2025-09-22')"); wd = await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % day)
        await pg.evaluate("(()=>{ STORY.tick=()=>{}; })()")
        await L.load_state(pg, {'zone': 'dorm', 'stage': 'law', 'hour': 22.5, 'day': day, 'weekday': wd, 'pos': {'x': 0, 'z': 2.0, 'yaw': 3.1416},
                                'flags': {'introDone': True, 'afternoonDone': True, 'classDone': True, 'metAn': True, 'zheInvite': True, 'zheNoodleDone': True}}, quiet_events=True)
        for i in range(90):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.dormRoot)&&GAME.E.player.obj.userData.driver==='vrm'") and i > 6: break
        await pg.wait_for_timeout(3000)
        await pg.evaluate(HOOK + "(%s)" % json.dumps(HOLDS))
        await pg.evaluate("void STORY.interact({sleep:true},GAME)")
        seen = set()
        for i in range(900):
            held = await pg.evaluate("window.__held")
            if held and held not in seen:
                seen.add(held); out[held] = {}
                await pg.wait_for_timeout(8000)   # SwiftShader 1～4 fps：等鏡頭轉過去、畫幾格
                for k, (view, js) in enumerate([('game', None), ('side', CAMS['side']), ('back', CAMS['back'])]):
                    if js:
                        await pg.evaluate(js); await pg.wait_for_timeout(5000)
                    st = await pg.evaluate(STATE); fn = os.path.join(OUT, '%s_%s_%s.png' % (TAG, held, view)); await pg.screenshot(path=fn)
                    out[held][view] = st; print(held, view, json.dumps(st, ensure_ascii=False), flush=True)
                await pg.evaluate("window.__release&&window.__release()")
            if await pg.evaluate("window.__holds.every(h=>h.done)&&!window.__held"): break
            await pg.wait_for_timeout(400)
        out['skipped'] = await pg.evaluate("window.__holds.filter(h=>h.skipped||!h.done).map(h=>h.name)")
        out['errors'] = errs; print('skipped', out['skipped'], 'errors', errs, flush=True)
        await b.close()
    json.dump(out, open(os.path.join(OUT, TAG + '.json'), 'w'), ensure_ascii=False, indent=1)

asyncio.run(main())
