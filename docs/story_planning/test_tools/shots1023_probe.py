"""BB-B 2026-10-23：LAWWW-B 08:09 派的兩件美術（開發分支 b32ee2c4 起）——遊戲內截圖，BB 看圖判定。
  FLOOR_3F    ART-NO-DARK-WOOD-1023：總圖 3F 閱覽區（library）的地板是淺色（使用者 D112：整個遊戲不要深色木地板）；家具桌面不變；入口、座位照常
  FLOOR_2F    同上：總圖大廳二樓自習區（library_hall 第 1 層）
  LIN_MENU    ART-WZ-LIN-MENU-1022：林家乾麵（wz_lin）左牆六張紅紙菜單有「貢丸湯 30」
[前置] 最小存檔直接站在那一區（2027-10-05 週二 14:00；不走過去），鏡頭轉四個方向各拍一張＋拉近一張；看得到的互動點（座位、出口）列出來。
判定照截圖（BB 看）：這支只負責拍、列互動點，沒有自動 PASS／FAIL。
不是 iPhone 實機：Playwright Chromium（SwiftShader）手機橫向模擬、?turbo。
用法：LW_TESTS=<開發分支>/tests SHA=<sha> [SCEN=FLOOR_3F,...] python3 shots1023_probe.py '<URL>/index.html?turbo' <輸出資料夾> [<存檔.json>]"""
import os, sys, json, asyncio, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
SCEN = [s for s in os.environ.get('SCEN', '').split(',') if s] or None
def say(*a): print(' '.join(str(x) for x in a), flush=True)
SC = [
  dict(id='FLOOR_3F', zone='library', pos={'x': 0, 'z': 7, 'yaw': math.pi, 'lv': 0}),
  dict(id='FLOOR_2F', zone='library_hall', pos={'x': 10.8, 'z': -6.0, 'yaw': -math.pi / 2, 'lv': 1}),
  dict(id='LIN_MENU', zone='wz_lin', pos={'x': 1.0, 'z': 3.05, 'yaw': math.pi, 'lv': 0}),
]
async def main():
    run = L.Run('shots1023', OUT); sha = os.environ.get('SHA', '?')
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        for sc in SC:
            if SCEN and sc['id'] not in SCEN: continue
            say('== %s（%s）' % (sc['id'], sha))
            d = await pg.evaluate("STORY.dayOfKey('2027-10-05')")
            F = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1}
            st = {'v': 2, 'stage': 'law', 'name': '祐廷', 'day': d, 'hour': 14.0, 'energy': 100, 'money': 20000, 'zone': sc['zone'], 'pos': sc['pos'], 'weather': 'clear', 'flags': F,
                  'events': {'done': {}, 'last': {}, 'count': 0}, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)}
            try:
                await L.load_state(pg, st, quiet_events=True); await pg.wait_for_timeout(6000)
                run.setup('[前置] %s：最小存檔 2027-10-05 14:00 直接站在 %s %s' % (sc['id'], sc['zone'], json.dumps(sc['pos'])))
                info = await pg.evaluate("(()=>({zone:GAME.G.zone, lv:(GAME.E.player&&GAME.E.player.lv)||0, its:(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>i.label||'').filter(Boolean).slice(0,40)}))()")
                say('   在 %s 第 %s 層；互動點：%s' % (info['zone'], info['lv'], ' / '.join(dict.fromkeys(info['its']))))
                y0 = await pg.evaluate("GAME.E.cam.yaw")
                for k in range(4):
                    await pg.evaluate("(y=>{ GAME.E.cam.yaw=y; GAME.E.cam.manualT=60; })(%f)" % (y0 + k * math.pi / 2)); await pg.wait_for_timeout(2500)
                    await run.shot(pg, '%s_yaw%d' % (sc['id'], k * 90))
                await pg.evaluate("(()=>{ const c=GAME.E.cam; c.distTarget=2.2; c.manualT=60; })()"); await pg.wait_for_timeout(2500)
                await run.shot(pg, '%s_near' % sc['id'])
                await pg.evaluate("(y=>{ GAME.E.cam.yaw=y+Math.PI/2; GAME.E.cam.manualT=60; })(%f)" % y0); await pg.wait_for_timeout(2500); await run.shot(pg, '%s_near90' % sc['id'])
                await pg.evaluate("(y=>{ GAME.E.cam.yaw=y-Math.PI/2; GAME.E.cam.manualT=60; })(%f)" % y0); await pg.wait_for_timeout(2500); await run.shot(pg, '%s_near270' % sc['id'])
            except Exception as e:
                say('   例外：%r' % e); run.check('%s：拍完' % sc['id'], False, repr(e)[:300])
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
    run.finish()
asyncio.run(main())
