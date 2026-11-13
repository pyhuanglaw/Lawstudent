"""目標導航、大地圖、入口名牌、開放時間（2026-10-11 使用者實機回報：第二天不知道溫州街在哪、入口不明顯、要能點小地圖看整張地圖、總圖沒寫幾點開）。
[前置／捷徑] 用讀檔把玩家放在第二天下午霖澤館前（舊存檔格式：只有目標文字、沒有 goalDest），換區域用 GAME.enter、用瞬移看入口名牌（這些是前置，不是在測走路）。
檢查：舊存檔推算出目的地；校園指向「往新生南路（側門）」、公館指向「回到校園」（沒有「往溫州街」）、新生南路指向「往溫州街」、溫州街指向 Café 的門；
（WZ-ENTRY-XINSHENG-1103，使用者 X199：溫州街只從新生南路進出——原本校園指「走出校門」、公館指「往溫州街」。2026-11-10 只改期待、沒跑，要 CC 在 PC 跑）
有路線、導航條；點小地圖打開大地圖、關掉後遊戲繼續；
新生南路側門的入口名牌是金色（原本是校門）；總圖 07:12 按入口寫開放時間與幾點開；直向畫面點小地圖也打得開；沒有 JS 錯誤。
用法：python3 tests/guide_flow.py http://127.0.0.1:8765/index.html?turbo [輸出資料夾]"""
import asyncio, sys, json
sys.path.insert(0, '/home/user/Lawstudent/tests')
from playwright.async_api import async_playwright
import playlib as L
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html?turbo'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/guide_flow'
async def wait_zone(pg, z, ms=30000):
    """BUG-LIB-DOOR-LABEL-1110（11-13 LAWWW-C 查：TEST_BUG）：GAME.enter 換區域還沒跑完（第一次進溫州街要等模型最多 12 秒）時，下一個 GAME.enter 會被直接丟掉（game3d.js enter：if(entering) return）——
    原本 07:12 那一段其實還在溫州街、(84.5,0) 是溫州街地圖外的空地，互動鍵藏著、讀到 index.html 的預設字「互動」。每次 enter 以後等到 G.zone 對了而且不在換區域中。"""
    try:
        await pg.wait_for_function("GAME.G.zone===%r&&!(GAME.isEntering&&GAME.isEntering())" % z, timeout=ms)
    except Exception:
        print('[診斷] 等不到進入 %s：zone=%s entering=%s' % (z, await pg.evaluate("GAME.G.zone"), await pg.evaluate("!!(GAME.isEntering&&GAME.isEntering())")))


async def wait_tgt(pg, cond="!!(window.GUIDE&&GUIDE._st&&GUIDE._st.tgt)", ms=60000):
    """等 GUIDE 的 tick 算出目標再判（BB 17:07：讀檔後只等 4 秒，雲端很慢時 tgt 還是 null；判定標準不變，只是等夠）"""
    try:
        await pg.wait_for_function(cond, timeout=ms)
    except Exception:
        pass


async def main():
    run = L.Run('probe_guide', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); assert await L.wait_loaded(pg)
        run.setup('讀檔：第二天 15:30 校園A館前，舊存檔格式（只有目標文字、沒有 goalDest）')
        await L.load_state(pg, {'day':2,'weekday':4,'hour':15.5,'zone':'campus','pos':{'x':34,'z':-96,'yaw':3.14},'goal':'和小安一起走到校門，往公館・溫州街','flags':{'introDone':True,'classDone':True,'afternoonDone':True,'metAn':True,'zheInvite':False}}, quiet_events=True)
        await pg.wait_for_timeout(4000); await wait_tgt(pg)
        st = await pg.evaluate("({dest:GAME.G.goalDest, tgt:GUIDE._st.tgt&&{x:GUIDE._st.tgt.x,z:GUIDE._st.tgt.z,text:GUIDE._st.tgt.text,via:GUIDE._st.tgt.via}, route:GUIDE._st.route&&GUIDE._st.route.length, bar:!document.getElementById('guide').classList.contains('hide'), txt:document.getElementById('guideText').textContent, arrow:document.getElementById('guideArrow').style.transform, markers:GUIDE._st.markers.length})")
        print(json.dumps(st, ensure_ascii=False))
        run.check('舊存檔推算出目的地＝兩點半 Café', bool(st['dest']) and st['dest'].get('zone') == 'cafe')
        run.check('校園裡指向「往新生南路（側門）」（X199：溫州街只從新生南路進出；原本「走出校門」）', bool(st['tgt']) and st['tgt']['text'] == '往新生南路（側門）', str(st['tgt']))
        run.check('有路線', (st['route'] or 0) > 2, str(st['route']))
        run.check('導航條顯示', st['bar'], st['txt'])
        await run.shot(pg, 'campus_bar_land')
        # 打開大地圖（點小地圖）
        await L.tap(pg, cdp, '#minimap'); await pg.wait_for_timeout(800)
        op = await pg.evaluate("!document.getElementById('bigmap').classList.contains('hide')")
        run.check('點小地圖打開大地圖', op); await run.shot(pg, 'bigmap_land')
        await L.tap(pg, cdp, '#bmOut'); await pg.wait_for_timeout(300); await L.tap(pg, cdp, '#bmOut'); await pg.wait_for_timeout(500); await run.shot(pg, 'bigmap_land_out')
        await L.tap(pg, cdp, '#bmClose'); await pg.wait_for_timeout(500)
        cl = await pg.evaluate("document.getElementById('bigmap').classList.contains('hide')&&!GAME.E.paused")
        run.check('關閉大地圖、遊戲繼續', cl)
        # 走到新生南路側門附近看金色入口標記（X199：原本看校門）
        run.setup('瞬移到新生南路側門內側 (-101.4,-134)，面向北')
        await pg.evaluate("GAME.E.placeAt(GAME.E.player,-101.4,-134,0); GAME.E.player.obj.rotation.y=Math.PI; GAME.E.cam.yaw=0")
        await pg.wait_for_timeout(2500); await run.shot(pg, 'gate_marker')
        mk = await pg.evaluate("GUIDE._st.markers.map(m=>({t:m.txt,s:m.sub,g:m.gold,v:m.spr.visible}))")
        print(json.dumps(mk, ensure_ascii=False))
        run.check('新生南路側門的入口標記是金色', any(m['t'].startswith('往新生南路') and m['g'] for m in mk))
        # 公館
        run.setup('進入公館（GAME.enter）')
        await pg.evaluate("void GAME.enter('gongguan',{x:-2.5,z:-29,yaw:0})"); await pg.wait_for_timeout(5000); await wait_zone(pg, 'gongguan'); await wait_tgt(pg, "GAME.G.zone==='gongguan'&&!!(GUIDE._st.tgt)")
        st = await pg.evaluate("({tgt:GUIDE._st.tgt&&GUIDE._st.tgt.text, txt:document.getElementById('guideText').textContent, mk:GUIDE._st.markers.map(m=>m.txt+'|'+m.sub+'|'+m.gold), wz:GAME.E.interactables.some(i=>i.exit&&i.exit.to==='wenzhou')})")
        print(json.dumps(st, ensure_ascii=False)); run.check('公館指向「回到校園」（去新生南路側門；X199 公館往溫州街的巷口拿掉，原本指「往溫州街」）', st['tgt'] == '回到校園' and not st['wz'], str(st['tgt']))
        await run.shot(pg, 'gongguan_bar')
        await pg.evaluate("GAME.E.placeAt(GAME.E.player,-60,14,0); GAME.E.player.obj.rotation.y=Math.PI/2; GAME.E.cam.yaw=-Math.PI/2"); await pg.wait_for_timeout(2500); await run.shot(pg, 'gongguan_marker')
        await L.tap(pg, cdp, '#minimap'); await pg.wait_for_timeout(800); await run.shot(pg, 'bigmap_gongguan'); await L.tap(pg, cdp, '#bmClose'); await pg.wait_for_timeout(300)
        # 新生南路（X199：溫州街只從這裡進出）
        await pg.evaluate("void GAME.enter('xinsheng')"); await pg.wait_for_timeout(5000); await wait_zone(pg, 'xinsheng'); await wait_tgt(pg, "GAME.G.zone==='xinsheng'&&!!(GUIDE._st.tgt)&&GUIDE._st.tgt.text==='往溫州街'")
        st = await pg.evaluate("({tgt:GUIDE._st.tgt&&GUIDE._st.tgt.text, txt:document.getElementById('guideText').textContent})")
        print(json.dumps(st, ensure_ascii=False)); run.check('新生南路指向「往溫州街」', st['tgt'] == '往溫州街', str(st['tgt']))
        await run.shot(pg, 'xinsheng_bar')
        # 溫州街（從新生南路進來的落點：西側橫巷北口）
        await pg.evaluate("void GAME.enter('wenzhou',{x:-33.4,z:-25.8,yaw:0})"); await pg.wait_for_timeout(5000); await wait_zone(pg, 'wenzhou'); await wait_tgt(pg, "GAME.G.zone==='wenzhou'&&!!(GUIDE._st.tgt)&&/2:30 AM|Café/.test(GUIDE._st.tgt.text||'')")
        st = await pg.evaluate("({tgt:GUIDE._st.tgt&&GUIDE._st.tgt.text, txt:document.getElementById('guideText').textContent})")
        print(json.dumps(st, ensure_ascii=False)); run.check('溫州街指向 Café 的門（店名 2:30 AM）', bool(st['tgt']) and ('2:30 AM' in st['tgt'] or 'Café' in st['tgt']), str(st['tgt']))
        await run.shot(pg, 'wenzhou_bar')
        # 總圖早上：閉館訊息寫開放時間
        run.setup('回校園總圖門口、時間 07:12')
        await pg.evaluate("void GAME.enter('campus',{x:82,z:0,yaw:-Math.PI/2})"); await pg.wait_for_timeout(5000); await wait_zone(pg, 'campus')
        await pg.evaluate("GAME.G.hour=7.2; GAME.E.hour=7.2; GAME.E.placeAt(GAME.E.player,84.5,0,0)"); await pg.wait_for_timeout(1500)
        await run.shot(pg, 'library_marker_closed')
        lab = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return b.classList.contains('hide')?'(藏著) '+b.textContent:b.textContent; })()")   # 藏著的按鈕也會讀到預設字「互動」：分開寫
        print('interact:', lab)
        # [診斷] BB 11-10 16:37：按鈕寫「互動」不是「進入總圖書館」——印出現在最近的是誰、附近 6 m 內有哪些互動點和人（Node 建校園只有總圖的門）
        print('[診斷] nearest:', await pg.evaluate("(()=>{ const E=GAME.E, P=E.player.obj.position, it=E.nearestInteractable(); const o=it?{label:it.label||null,x:it.x,z:it.z,npc:!!it.npc,exit:it.exit&&it.exit.to||null,keys:Object.keys(it).slice(0,12)}:null; const its=E.interactables.filter(i=>Math.hypot(i.x-P.x,i.z-P.z)<6).map(i=>({label:i.label||null,x:+(+i.x).toFixed(1),z:+(+i.z).toFixed(1),hidden:!!i.hidden})); const ns=E.npcs.filter(n=>Math.hypot(n.obj.position.x-P.x,n.obj.position.z-P.z)<4).map(n=>({name:n.name,talk:!!n.talk,label:n.talkLabel||null,yield:!!n.yieldIt})); return JSON.stringify({p:[+P.x.toFixed(2),+P.z.toFixed(2)],lv:E.player.lv,it:o,its,ns}); })()"))
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(600)
        # 閉館的字以前是 toast，v9.10.7 起是 #caption（b1story3d.js S.nightDoor；後面接 B1 側門的選單）：toast、對話框、caption 都讀（BB-B 10-24 回歸）
        toast = await pg.evaluate("['toast','dlgText','caption'].map(id=>((document.getElementById(id)||{}).textContent||'')).join(' ')")   # b1story3d.js S.nightDoor 用 GM.caption（#caption），後面接 B1 側門選單
        print('toast/dlg:', toast); run.check('閉館訊息寫開放時間與幾點開', '08:00' in toast and '開放時間' in toast, toast)
        await run.shot(pg, 'library_closed_toast')
        # 直向
        await ctx.close(); await b.close()
        b, ctx, pg, cdp, errs2 = await L.launch(p, landscape=False)
        await pg.goto(URL); assert await L.wait_loaded(pg)
        await L.load_state(pg, {'day':2,'weekday':4,'hour':15.5,'zone':'campus','pos':{'x':34,'z':-96,'yaw':3.14},'goal':'和小安一起走到校門，往公館・溫州街','flags':{'introDone':True,'classDone':True,'afternoonDone':True,'metAn':True,'guideTip':True}}, quiet_events=True)
        await pg.wait_for_timeout(4000); await wait_tgt(pg); await pg.evaluate("document.getElementById('rotate')&&document.getElementById('rotate').classList.remove('want')"); await pg.wait_for_timeout(500); await run.shot(pg, 'campus_bar_port')
        await L.tap(pg, cdp, '#minimap'); await pg.wait_for_timeout(800); await run.shot(pg, 'bigmap_port')
        run.check('直向：點小地圖打開大地圖', await pg.evaluate("!document.getElementById('bigmap').classList.contains('hide')"))
        bar = await pg.evaluate("(()=>{ const g=document.getElementById('guide').getBoundingClientRect(), h=document.getElementById('hudR').getBoundingClientRect(), m=document.getElementById('minimap').getBoundingClientRect(); const ov=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top; return {hudR:ov(g,h), minimap:ov(g,m)}; })()")
        run.check('直向：導航條不和體力列、小地圖重疊', not bar['hudR'] and not bar['minimap'], str(bar))
        errs += errs2
        await ctx.close(); await b.close()
    print('page errors:', errs[:5]); run.check('沒有 JS 錯誤', not errs, str(errs[:3]))
    return run.finish()
sys.exit(asyncio.run(main()))
