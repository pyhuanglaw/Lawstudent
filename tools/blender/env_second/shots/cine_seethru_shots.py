"""#120 床欄透空（DORM-SLEEP-VISUAL-1030 後續；LAWWW2-B 2026-10-30）：固定運鏡指定透空中心 E.cam.seeThru 的前後對照。
cine_seethru_1030.patch 套進測試樹以後，在測試樹根目錄跑：python3 <這個檔> URL 輸出資料夾
  [前置／捷徑] 讀檔到宿舍 203 晚上 23:30；人放在上舖的床上（祐廷 L2 的床，dorm_room4.layout.json 的 sleep_scene.lie）；E.cinematic 換成睡覺的鏡頭（sleep_scene.cam）。
  人沒有躺下（躺的動畫是 LAWWW-B 那一半）：這裡只看床欄、床架在鏡頭和床中間那一段會不會網點透空。
  ① 沒給 E.cam.seeThru（和原本一樣）② 給 {床的中心, r 0.2, aspect 0.5}（橫的橢圓）③ 清掉（E.cam.seeThru=null）→ 恢復。
iPhone 橫向模擬，不是實機。"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.join(os.getcwd(), 'tests'))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8881/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/cine_seethru'
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True}
SET = """(()=>{ const S=DORM_ROOM.units.find(u=>u.id==='L2').sleep_scene, E=GAME.E, V=THREE.Vector3;
  const h=S.lie.head, f=S.lie.feet; E.cinematic(new V(...S.cam.eye), new V(...S.cam.look)); E.snapCinematic();
  E.player.obj.position.set((h[0]+f[0])/2, S.lie.mattress_top_y, (h[2]+f[2])/2);
  return {mode:E.cam.mode, center:[(h[0]+f[0])/2, S.lie.mattress_top_y+0.3, (h[2]+f[2])/2]}; })()"""
ST = "(()=>{ const s=GAME.E.seeThrough; return {R:+s.uSeeR.value.toFixed(1), A:s.uSeeA?s.uSeeA.value:null, P:s.uSeeP.value.toArray().map(v=>+v.toFixed(3))}; })()"


async def main():
    run = L.Run('cine_seethru', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀檔：宿舍 203、第 8 天 23:30；人放到上舖（L2）；E.cinematic 換成 sleep_scene.cam')
        await L.load_state(pg, {'zone': 'dorm', 'hour': 23.5, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': -1.55, 'z': 1.19, 'yaw': -1.5708}, 'flags': FLAGS}, quiet_events=True)
        await pg.wait_for_timeout(6000)
        r = await pg.evaluate(SET); c = r['center']; await pg.wait_for_timeout(1500)
        s = await pg.evaluate(ST); run.check('① 沒給 E.cam.seeThru：運鏡時不透空（和原本一樣）', s['R'] == 0, json.dumps(s)); await run.shot(pg, 'cine_off')
        await pg.evaluate("(c=>{ GAME.E.cam.seeThru={x:c[0],y:c[1],z:c[2],r:0.2,aspect:0.5}; })(%s)" % json.dumps(c)); await pg.wait_for_timeout(1500)
        s = await pg.evaluate(ST); run.check('② 給 E.cam.seeThru：透空打開（橫的橢圓 aspect 0.5）', s['R'] > 20 and s['A'] == 0.5, json.dumps(s)); await run.shot(pg, 'cine_on')
        await pg.evaluate("GAME.E.cam.seeThru=null"); await pg.wait_for_timeout(1200)
        s = await pg.evaluate(ST); run.check('③ 清掉 → 不透空', s['R'] == 0, json.dumps(s)); await run.shot(pg, 'cine_cleared')
        await pg.evaluate("GAME.E.endCinematic()"); await pg.wait_for_timeout(2500)
        s = await pg.evaluate(ST); run.check('④ 回到跟隨鏡頭：橢圓回到直立（aspect 2）', s['A'] == 2, json.dumps(s))
        run.check('沒有 JS 例外', not errs, '; '.join(map(str, errs[:5])))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
