"""BB-B 2026-10-23：LAWWW-B 08:09 派的兩件美術（開發分支 b32ee2c4 起）——遊戲內截圖，BB 看圖判定。
  FLOOR_3F    ART-NO-DARK-WOOD-1023：總圖 3F 閱覽區（library）的地板是淺色（使用者 D112：整個遊戲不要深色木地板）；家具桌面不變；入口、座位照常
  FLOOR_2F    同上：總圖大廳二樓自習區（library_hall 第 1 層）
  FLOOR2_*    第二批（29e074e0c）九個室內（wz_teishoku、us_apartment、us_shared、wz_teahouse、jp_room、l118_cafe2、bookstore、wancai_sema、wz_brunch）＋掃描多標出的 gym_arena、linze_202
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
  # 第二次（08:3x）：第一次從門口拍，紅紙太小看不出字 → 站在「看菜單」那一點（-1.3, -0.3）面向左牆（菜單 x -3.17、高 2.07），鏡頭壓低拉近；再按「看菜單」
  dict(id='LIN_MENU2', zone='wz_lin', pos={'x': -1.3, 'z': -0.3, 'yaw': -math.pi / 2, 'lv': 0}, cams=[(0, 0.10, 2.4), (0.35, 0.10, 2.2), (-0.35, 0.10, 2.2), (0, 0.05, 1.6)], tap='看菜單'),
  # 第三次（09:4x）：ART-NO-DARK-WOOD-1023 第二批（開發分支 29e074e0c；LAWWW2-B 6fbe2830）九個室內＋BB-B 掃描多標出的兩處（新體 3F 球場地板 lum 141、霖澤館 202 前段 lum 98）
  #   站在區域預設的出生點（pos 空＝遊戲自己放），鏡頭壓低看地板：四個方向＋俯看一張
] + [dict(id='FLOOR2_' + z, zone=z, pos=None, cams=[(0, 0.55, 5.0), (math.pi / 2, 0.55, 5.0), (math.pi, 0.55, 5.0), (-math.pi / 2, 0.55, 5.0), (0, 1.05, 4.0)])
     for z in ['wz_teishoku', 'us_apartment', 'us_shared', 'wz_teahouse', 'jp_room', 'l118_cafe2', 'bookstore', 'wancai_sema', 'wz_brunch', 'gym_arena', 'linze_202']] + [
  # 第四次（10:2x）：gym_arena 出生點在入口通道（地毯），球場地板沒入鏡——站到球場中間（gym_layout.js court (0,-2)）
  dict(id='FLOOR3_gym_court', zone='gym_arena', pos={'x': 0, 'z': -2, 'yaw': math.pi, 'lv': 0}, cams=[(0, 0.45, 6.0), (math.pi / 2, 0.45, 6.0), (math.pi, 0.45, 6.0), (0, 1.1, 5.0)])]
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
                if sc.get('cams'):
                    for k, (dy, pt, ds) in enumerate(sc['cams']):
                        await pg.evaluate("(([y,p,d])=>{ const c=GAME.E.cam; c.yaw=y; c.pitch=p; c.distTarget=d; c.manualT=60; })(%s)" % json.dumps([y0 + dy, pt, ds])); await pg.wait_for_timeout(3000)
                        await run.shot(pg, '%s_cam%d' % (sc['id'], k))
                    if sc.get('tap'):
                        ok = await pg.evaluate("(w=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })(%s)" % json.dumps(sc['tap']))
                        say('   互動鈕：%s' % ok)
                        if sc['tap'] in ok:
                            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500); await run.shot(pg, '%s_tap' % sc['id'])
                            st2 = await L.state(pg); say('   按下去以後：%s' % json.dumps({k: st2.get(k) for k in ('dlg', 'dtext', 'choices')}, ensure_ascii=False)[:400])
                    continue
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
