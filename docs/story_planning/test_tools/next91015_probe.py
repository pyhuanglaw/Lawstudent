"""BB-B 10-30：下一版（開發分支 ca5f3381c 以後）使用者回報過的幾件——照玩家在畫面上看、按、截圖（LAWWW-B 08:08 第 2 項）。
MODE（環境變數）：
  phone   PHONE-UNIFY-1030（P0）：使用者 9/25 存檔。手機「朋友」每一個有行程、不在這一區的人：
          有「直接過去（約 N 分鐘）」，或寫「不能直接過去：原因」，不能只剩「帶我去」導航；按三個人的「直接過去」，真的到那個人在的地方、人在旁邊。
          「訊息」最上面一排聯絡人：七位女生在前；有聯絡方式的點得開、有「傳訊息」；見過、沒有聯絡方式的灰著寫原因；
          【捷徑】子晴見過＋有聯絡方式（不經過特定事件）→ 她那一格點得開、能傳。
  bball   BBALL-PRESENT-1030：大一上第 5 週週五 2025-10-03 17:45 晴天，籃球場 6～8 人打球、場邊 2～3 人，阿哲、明軒在；
          前一天週四同一時間球場沒有練球、集合點有「系籃練球（星期五 17:30）」，按了寫下一次的日期；
          10/3 改成下雨：球場沒有人，新體育館一樓走廊有系籃。
  rooms   ROOM-MAP-LABELS-1030：普通、博思、共同教學館、法律系館A／B 的小地圖、大地圖標出教室門號；今天要上課的那間金色「★ 門號」。
          字畫在 canvas 上，看截圖；另外讀 ROOMMAP.labels 對照。
  cafewin CAFE-WINDOW-LIVE-1030：兩點半 Café 往門口那一側的窗，白天 10:30、晚上 20:30 各拍四個方向；走出去再走進來同一個鏡頭再拍一次。
  noodle  NDL-PRESENT-1030：麵店日 9/30（二）17:55 從公館走進阿鳳麵店（【捷徑】加入麵店團、認識四位）＝第一次，麵店團成團事件先演（開口的人要在店裡，店員也算）；
          下一個麵店日 10/2（四）18:00 再走進去：長桌閒聊開口的人都真的坐在店裡；10/7（二）20:40 走進去：麵店團都走了（作息 20:30），不演閒聊（使用者 04:3x「出現麵店團的人對話 但根本沒有在遊戲內出現」）。
  cafe2   L118-CAFE2-STUDY-1030：慢讀咖啡（118 巷）桌位寫「坐下讀書」、吧檯高腳椅不算；坐下 → 「讀書」→ 讀完時間有走、讀書次數有加。
  invite  INVITE-MENU-1030／AA_535：手機「約」以安、學姊：第一層照分類（念書…／吃飯…／喝咖啡、喝茶…／散步…／運動…／出去玩…／算了），每一層最多 8 列；
          念書有總圖、慢讀咖啡、法圖；喝咖啡有兩點半 Café、一盞、慢讀；運動有羽球、晨跑；出去玩照地區分；灰掉的有小字原因。
  jacket  SK02-LINE-JACKET-1030：社科院正門領系外套選「（穿去法律系館A上課）」→ 身上真的穿著（JACKET_ECON 看得到）、截圖；回宿舍房間脫下掛椅背（JACKET_CHAIR）；
          下一次 201 的課（手機「直接去上課」）穿著、阿哲「你是經濟系派來的臥底嗎？」。【捷徑】SK02_DM_DAY（系辦私訊那天）。
  badclip BADCLIP-FOLLOW-1030：當面約以安「約她去…」→ 運動 → 羽球 →「現在一起過去」（她跟著走）→ 短片期間她在網子另一邊（北半場），不是跑到玩家面前。
  bigmap  BIGMAP-PEOPLE-1030（4da27563c）：VP＝portrait／desktop／landscape。打開大地圖「認識的人現在大概在」預設收起、不蓋地圖；
          自由的日子 👥 有黃點、有目標的日子沒有；按 👥 展開 → 關掉地圖再開照樣展開；再按收起 → 再開照樣收起。
          fc0c0ac69 起（LAWWW-B 10:42）：人名標籤不蓋地名（寬螢幕「總圖書館」看截圖）；HUD 目標最多兩行：長目標兩行看得完（沒被截）、
          和「今天的課」chip（#nextClass）、導引（#guide）不重疊、不超出畫面。
  bballrain BBALL-RAIN（LAWWW-B 09:43）：10/3（五）17:45 下雨，新體育館一樓走廊 (-3.6,12.6) 阿哲、明軒；兩種進法（直接讀檔在體育館／從校園走進去），
          各讀 GAME.npc.zhe（有沒有、位置、看不看得到）＋STORY.whereIs＋flags.companion，轉向東邊對著走廊拍。
  renart  RENAME-ART-1030（f75d60a4c）：玩家鏡頭走到校門石牌、晨思鐘、博思名牌、法律系館A 公布欄、201 後牆傳單、博思 203 海報前面拍（字看截圖）；
          另外拍社科院系所牌、溫州公園牌（外框變細以後的字）、ADV 背景 ntu_linze（外牆大字）。博思 203 平常關著（SK07 那一晚才開）：直接讀檔進去＝【前置】。
  libla   LIB-LAWN-1030（f75d60a4c，LAWWW-B 09:51）：從椰影大道走到總圖門口；白天 15:00、黃昏 17:50、晚上 20:00 同一個鏡頭（晚上看六盞路燈）；
          中軸南、北各坐一張「坐在總圖前的長椅上」→ 起身走得開；進出總圖兩次，草皮模型還在、石板廣場沒疊上來。
  lawlib  LAWLIB-LM-1030（6e3a95623，LAWWW-B 10:44，低優先）：法律學院圖書館光照烘焙。14:00、20:30 各拍一樓閱覽區、長桌往南看窗、櫃台入口、二樓書庫、二樓閱覽區
          （玩家鏡頭；站位＝【捷徑】placeAt）；每張算黑（亮度 <12）和死白（>248）的比例；人站在長桌燈下近拍；走出去回法律系館B 大廳再走進來兩次照樣。
  multiroom MULTI-ROOM-V2-1030（LAWWW-B 11:42，低優先）：法律系館B 多功能教室 v2。14:00、20:30 三個方向拍＋黑／死白比例＋光照貼圖；坐下、起身、走得開；
          找一堂在多功能教室的課（手機「直接去上課」）：同學坐好、老師站著；走出去回大廳再走進來兩次。
  rtnight  RT-NIGHT-1028（bbe0c9469）：晚上 20:30 宿舍房間、兩點半 Café、法律系館A 大廳各四個方向（門框、小東西不要比牆亮、不要像浮在畫面上：看截圖＋亮度）。
不是 iPhone：Playwright＋SwiftShader。用法：LW_TESTS=<工作樹>/tests MODE=<上面> python3 next91015_probe.py '<URL>/index.html' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, re, math, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import bbplay as P
from playwright.async_api import async_playwright
URL, OUT, SAVEF = sys.argv[1], sys.argv[2], sys.argv[3]
SAVE = json.load(open(SAVEF, encoding='utf-8'))
MODE = os.environ.get('MODE', 'phone'); VP = os.environ.get('VP', 'landscape')
J = lambda o: json.dumps(o, ensure_ascii=False)
PI = math.pi

FRIENDS = """(()=>[...document.querySelectorAll('#phoneBody .phrow')].map(r=>{ const t=(r.innerText||'').trim(); const fg=r.querySelector('[data-fgo]'), fd=r.querySelector('[data-find]');
  return {t:t.slice(0,140), name:t.split('\\n')[0], fgo:fg?fg.dataset.fgo:null, fgoT:fg?(fg.textContent||'').trim():null, find:fd?fd.dataset.find:null, why:/不能直接過去/.test(t), here:/就在這裡/.test(t), none:/現在沒有固定的行程/.test(t)}; }))()"""
CONTACTS = """(()=>{ const box=document.querySelector('#phoneBody .ctList'); if(!box) return null; return [...box.querySelectorAll('button')].map(b=>({t:(b.innerText||'').trim().replace(/\\n/g,'｜'), th:b.dataset.th||null, gray:b.disabled, noct:b.dataset.noct||null})); })()"""
WHERE = "(id=>{ const w=STORY.whereIs&&STORY.whereIs(GAME,id); return w?{zone:w.zone,label:w.label||null,away:!!w.away}:null; })"
NEAR = "(id=>{ const n=GAME.E.npcs.find(n=>n.charId===id&&!n.hidden); if(!n) return null; const P=GAME.E.player.obj.position; return {d:+Math.hypot(n.obj.position.x-P.x,n.obj.position.z-P.z).toFixed(1)}; })"


async def phone(pg, cdp, run):
    st, d = await P.base(pg, SAVE, '2025-09-25', 15.75, 'wenzhou'); await P.load(pg, cdp, st)
    run.setup('[前置] 使用者存檔（9/25 15:44 溫州街）照原樣讀進來')
    snap = await P.snapshot(pg)
    await P.phone_tab(pg, cdp, 'friends'); rows = await pg.evaluate(FRIENDS); await run.shot(pg, 'friends')
    run.note('朋友頁 %d 人：%s' % (len(rows), J(rows)))
    need = [r for r in rows if not r['none'] and not r['here']]
    nav_only = [r['name'] for r in need if r['find'] and not r['fgo'] and not r['why']]
    run.check('朋友頁：有行程、不在這一區的人都有「直接過去」或寫「不能直接過去：原因」，沒有只剩「帶我去」的', not nav_only, J(nav_only))
    run.check('朋友頁：「直接過去」的字寫得出要幾分鐘（約 N 分鐘）', all(re.search(r'約 \d+ 分鐘', r['fgoT']) for r in need if r['fgo']), J([r['fgoT'] for r in need if r['fgo']]))
    goes = [r for r in need if r['fgo']][:3]
    for k, r in enumerate(goes):
        await P.load(pg, cdp, snap); await P.phone_tab(pg, cdp, 'friends')
        w = await pg.evaluate(WHERE, r['fgo'])
        await L.tap(pg, cdp, '#phoneBody [data-fgo="%s"]' % r['fgo'])
        for _ in range(40):
            await pg.wait_for_timeout(1000)
            if not await pg.evaluate("!!GAME.E.player.busy") and await pg.evaluate("GAME.G.zone") != 'wenzhou': break
        await pg.wait_for_timeout(3000); await L.close_panels(pg, cdp)
        z = await pg.evaluate("GAME.G.zone"); nr = await pg.evaluate(NEAR, r['fgo'])
        goal = await pg.evaluate("(()=>({goal:((document.getElementById('goal')||{}).innerText||'').trim(), find:GAME.G.flags.findWho||null, dest:GAME.G.goalDest||null, guide:((document.getElementById('guideText')||{}).innerText||'').trim()}))()")
        await run.shot(pg, 'go_%d_%s' % (k, r['fgo']))
        follow = goal['find'] == r['fgo'] and '去找' in goal['goal']   # 05789d957：到了人還在 8 m 外＝自動接「帶我去」
        run.note('%s 到了以後：%s' % (r['name'], J(goal)))
        run.check('按「%s」的「%s」→ 到他在的地方（%s），人在附近；或人還在 8 m 外就自動接「帶我去」（目標「去找…」）' % (r['name'], r['fgoT'], w and (w.get('label') or w.get('zone'))),
                  bool(w) and z != 'wenzhou' and bool(nr) and (nr['d'] < 8 or follow), J({'zone': z, 'where': w, 'near': nr, 'goal': goal}))
    await P.load(pg, cdp, snap)
    await P.phone_tab(pg, cdp, 'msg'); ct = await pg.evaluate(CONTACTS); await run.shot(pg, 'contacts')
    run.note('訊息頁聯絡人：%s' % J(ct))
    run.check('訊息頁最上面有一排聯絡人（點名字打開對話）', bool(ct), J(ct))
    if ct:
        gray_nowhy = [c['t'] for c in ct if c['gray'] and '｜' not in c['t']]
        run.check('灰著的聯絡人都寫了原因', not gray_nowhy, J(gray_nowhy))
        live = [c for c in ct if c['th']][:3]
        for c in live:
            r = await P.phone_thread(pg, cdp, c['th'], open_folds=False)
            can = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-msgto]')].map(b=>({t:(b.textContent||'').trim(),dis:b.disabled}))")
            why = await pg.evaluate("(()=>{ const t=(document.getElementById('phoneBody')||{}).innerText||''; const m=t.match(/(傳不了|不能傳)[^\\n]*/); return m?m[0]:null; })()")
            run.check('點「%s」打開對話，有「傳訊息」（或寫傳不了的原因）' % c['t'].split('｜')[0], bool(can) and (not all(x['dis'] for x in can) or bool(why)), J({'btn': can, 'why': why}))
    # 子晴：見過＋有聯絡方式就能傳（不再等特定事件）
    zq = await P.prep(pg, cdp, run, """(()=>{ const G=GAME.G, id='heroine_04'; if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.meet(id,'campus'); G.contacts=G.contacts||{}; if(G.contacts[id]==null) G.contacts[id]=G.day; return {met:SOCIAL.has(id,'FIRST_MET'), contact:G.contacts[id], q6:!!(G.events&&G.events.done&&G.events.done.ev_ziqing_club)}; })()""", label='子晴見過、有聯絡方式（沒有演社團那幾件）')
    await P.phone_tab(pg, cdp, 'msg'); ct2 = await pg.evaluate(CONTACTS) or []
    c = next((x for x in ct2 if '子晴' in x['t']), None)
    run.check('子晴：見過＋有聯絡方式 → 聯絡人那一格點得開（不再要求特定事件）', bool(c) and bool(c['th']) and not c['gray'], J(c))
    if c and c['th']:
        await P.phone_thread(pg, cdp, c['th'], open_folds=False)
        can = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-msgto]')].map(b=>({t:(b.textContent||'').trim(),dis:b.disabled}))")
        await run.shot(pg, 'ziqing_thread')
        run.check('子晴的對話有「傳訊息」可以按', any(not x['dis'] for x in can), J(can))


async def bball(pg, cdp, run):
    mx = await pg.evaluate("(()=>Object.keys(CHARACTERS).find(k=>(CHARACTERS[k].name||'').indexOf('明軒')>=0))()")
    B = await pg.evaluate("(()=>typeof CROWD!=='undefined'&&CROWD.BBALL?CROWD.BBALL:null)()")
    run.note('明軒 id＝%s；球場 %s' % (mx, J(B)))
    c = (B or {}).get('c') or [-4, -114.5]
    COUNT = "([x,z,R])=>GAME.E.npcs.filter(n=>!n.hidden&&n.obj&&Math.hypot(n.obj.position.x-x,n.obj.position.z-z)<R).map(n=>({id:n.charId||null,name:n.name||null,d:+Math.hypot(n.obj.position.x-x,n.obj.position.z-z).toFixed(1)}))"
    for key, wd, wx, label in (('2025-10-03', '五', 'sunny', '練球日（晴）'), ('2025-10-02', '四', 'sunny', '不是練球日'), ('2025-10-03', '五', 'rain', '練球日（下雨）')):
        st, d = await P.base(pg, SAVE, key, 17.5, 'campus', pos={'x': c[0] + 6, 'z': c[1] + 9, 'yaw': PI, 'lv': 0, 'y': 0})
        st['weather'] = wx; await P.load(pg, cdp, st, quiet=False)
        await P.wait_play(pg, cdp, 17.75, max_s=300)
        await pg.evaluate("(([x,z])=>{ const C=GAME.E.cam; C.yaw=Math.atan2((GAME.E.player.obj.position.x-x),(GAME.E.player.obj.position.z-z)); C.pitch=0.35; C.manualT=1e9; })", c)
        await pg.wait_for_timeout(3000)
        ppl = await pg.evaluate(COUNT, [c[0], c[1], 14]); await run.shot(pg, 'court_%s_%s' % (key, wx))
        ids = [p['id'] for p in ppl]
        run.note('%s %s（週%s）17:45 球場 14 m 內：%s' % (label, key, wd, J(ppl)))
        if label == '練球日（晴）':
            run.check('練球日晴天 17:45：球場有人打球（6 人以上）', len(ppl) >= 6, str(len(ppl)))
            run.check('練球日：阿哲在球場', 'zhe' in ids, J(ids))
            run.check('練球日：明軒在球場', bool(mx) and mx in ids, J(ids))
        elif label == '不是練球日':
            hint = await pg.evaluate("(()=>(GAME.E.interactables||[]).filter(i=>/系籃練球/.test(i.label||'')).map(i=>({label:i.label,x:i.x,z:i.z})))()")
            run.check('不是練球日：球場沒有系籃練球的人（阿哲、明軒不在）', 'zhe' not in ids and (not mx or mx not in ids), J(ids))
            run.check('不是練球日：集合點有「系籃練球（星期五 17:30）」', any('星期五 17:30' in h['label'] for h in hint), J(hint))
            if hint:
                h = hint[0]; await pg.evaluate("(([x,z])=>{ const E=GAME.E; for(const R of [0.6,0.9,1.2]){ for(let i=0;i<16;i++){ const a=i*Math.PI/8,px=x+Math.sin(a)*R,pz=z+Math.cos(a)*R; if(E.canStand&&!E.canStand(px,pz,0.3,0)) continue; E.placeAt(E.player,px,pz,0); return; } } })", [h['x'], h['z']])
                await pg.wait_for_timeout(1500); n0 = await P.say_hook(pg)
                await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
                toast = await pg.evaluate("(document.getElementById('toast')||{}).textContent||''"); cap = await pg.evaluate("(document.getElementById('caption')||{}).textContent||''")
                said = await P.said(pg, n0); await run.shot(pg, 'court_hint')
                txt = ' '.join([toast, cap] + [t for _, t in said])
                run.check('按「系籃練球」提示：寫下一次的日期', bool(re.search(r'10\s*/\s*3|10 月 3|下一次|星期五', txt)), J({'toast': toast, 'cap': cap, 'said': said}))
                await L.close_panels(pg, cdp)
        else:
            run.check('練球日下雨：球場沒有系籃（阿哲、明軒不在球場）', 'zhe' not in ids and (not mx or mx not in ids), J(ids))
            st2, _ = await P.base(pg, SAVE, key, 17.75, 'gym'); st2['weather'] = 'rain'; await P.load(pg, cdp, st2, quiet=False); await pg.wait_for_timeout(5000)
            g = await pg.evaluate("(()=>GAME.E.npcs.filter(n=>!n.hidden).map(n=>n.charId||n.name||'?'))()"); await run.shot(pg, 'gym_rain')
            run.check('練球日下雨：新體育館有系籃的人（阿哲或明軒）', 'zhe' in g or (mx and mx in g), J(g))


ROOMZ = [('putong', '普通教學館'), ('boya', '博思教學館'), ('gongtong', '共同教學館'), ('linze', '法律系館A'), ('wancai', '法律系館B')]


async def rooms(pg, cdp, run):
    for zone, nm in ROOMZ:
        st, d = await P.base(pg, SAVE, '2025-09-25', 8.5, zone); await P.load(pg, cdp, st); await pg.wait_for_timeout(2500)
        lab = await pg.evaluate("(()=>{ try{ const G=GAME.G; return ROOMMAP.labels(G,G.zone,GAME.E.player.lv|0).map(l=>({t:l.no||l.label||l.name||l.id||null,today:l.today||null})); }catch(e){ return 'err:'+e.message; } })()")
        run.note('%s 08:30 ROOMMAP.labels：%s' % (nm, J(lab)))
        await run.shot(pg, 'rooms_%s_hud' % zone)
        await pg.evaluate("(()=>{ const b=document.getElementById('minimap'); if(b) b.scrollIntoView(); })()")
        await L.tap(pg, cdp, '#minimap'); await pg.wait_for_timeout(1800)
        await run.shot(pg, 'rooms_%s_bigmap' % zone)
        await L.close_panels(pg, cdp)
        run.check('%s：地圖有教室門號（ROOMMAP.labels 不是空的；字看截圖）' % nm, isinstance(lab, list) and len(lab) > 0, J(lab)[:300])


async def cafewin(pg, cdp, run):
    for h, tag in ((10.5, 'day'), (20.5, 'night')):
        st, d = await P.base(pg, SAVE, '2025-09-26', h, 'cafe', pos={'x': 0, 'z': 0.5, 'yaw': 0, 'lv': 0, 'y': 0}); await P.load(pg, cdp, st); await pg.wait_for_timeout(5000)
        for k, yaw in enumerate((0, PI / 2, PI, -PI / 2)):
            await pg.evaluate("(y=>{ const C=GAME.E.cam; C.yaw=y; C.pitch=0.12; C.manualT=1e9; })", yaw); await pg.wait_for_timeout(2500)
            await run.shot(pg, 'cafe_%s_yaw%d' % (tag, k))
        live = await pg.evaluate("(()=>{ let n=0, names=[]; GAME.E.zone.group.traverse(o=>{ if(o.userData&&(o.userData.streetLive||o.userData.liveView||/street|window/i.test(o.name||''))){ n++; if(names.length<8) names.push(o.name||''); } }); return {n,names}; })()")
        run.note('%s Café 裡標成窗景的物件：%s' % (tag, J(live)))
    # 進兩次：走出去再走進來
    ex = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='wenzhou'); return it?[it.x,it.z,it.label]:null; })()")
    if ex:
        await L.go_to(pg, cdp, run, ex[0], ex[1], 0.9, ex[2], max_s=200); await L.tap(pg, cdp, '#interact')
        for _ in range(30):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("GAME.G.zone") == 'wenzhou': break
        await pg.wait_for_timeout(4000)
        dr = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='cafe'); return it?[it.x,it.z,it.label]:null; })()")
        if dr:
            await L.go_to(pg, cdp, run, dr[0], dr[1], 0.9, dr[2], max_s=200); await L.tap(pg, cdp, '#interact')
            for _ in range(30):
                await pg.wait_for_timeout(1000)
                if await pg.evaluate("GAME.G.zone") == 'cafe': break
            await pg.wait_for_timeout(5000)
            await pg.evaluate("(()=>{ const E=GAME.E; E.placeAt(E.player,0,0.5,0); const C=E.cam; C.yaw=Math.PI; C.pitch=0.12; C.manualT=1e9; })()"); await pg.wait_for_timeout(2500)
            await run.shot(pg, 'cafe_reentry_yaw0')
    run.check('Café：拍完（窗景要看截圖：白天、晚上、進兩次）', True, '')


TEAM = ['zhe', 'yu', 'classmate_bohan', 'classmate_xinci']
PRESENT = """(()=>GAME.E.npcs.filter(n=>n.obj&&!n.hidden).map(n=>({id:n.charId||null, name:n.name||null, nm:(n.charId&&typeof SOCIAL!=='undefined'&&SOCIAL.npcName)?SOCIAL.npcName(n.charId):null, sit:!!n.seat})))()"""
HIDDEN = """(()=>GAME.E.npcs.filter(n=>n.obj&&n.hidden).map(n=>({id:n.charId||null, name:n.name||null})))()"""   # 藏著的（模型還沒載完先藏，pool3d.js 2-1）   # 店員（阿姨）沒有 charId 也算在場


async def door_to(pg, cdp, run, to, label, max_s=200):
    it = await pg.evaluate("(to=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to===to); return it?[it.x,it.z,it.label]:null; })", to)
    if not it: run.note('%s：找不到往 %s 的門' % (label, to)); return False
    await L.go_to(pg, cdp, run, it[0], it[1], 0.9, it[2], max_s=max_s); await L.tap(pg, cdp, '#interact')
    for _ in range(40):
        await pg.wait_for_timeout(1000)
        if await pg.evaluate("GAME.G.zone") == to: return True
    return False


NDLDIAG = """(T=>{ const G=GAME.G, o={}; const f=(k,fn)=>{ try{ o[k]=fn(); }catch(e){ o[k]='err:'+e.message; } };
  f('h',()=>+(+G.hour).toFixed(2)); f('noodleDay',()=>STORY.noodleDay(G.day)); f('inGroup',()=>PHONE.inGroup(G,'noodle_team')); f('ndlTalkDay',()=>G.flags.ndlTalkDay===G.day);
  f('due',()=>STORY.ndlTalkDue(G)); f('dueIgnoreOther',()=>STORY.ndlTalkDue(G,false)); f('otherDue',()=>STORY.ndlOtherDue?STORY.ndlOtherDue(G):null);
  f('pick',()=>{ const p=STORY.ndlTalkPick(G); return p?{k:p.k,i:p.i,who:p.e&&p.e.who||null,first:p.e&&p.e.dialogue&&p.e.dialogue[0]&&String(p.e.dialogue[0].text||'').slice(0,30)}:null; });
  f('here',()=>T.map(id=>[id,STORY.ndlHere(G,id),STORY.knows?STORY.knows(id,G):null])); f('stage',()=>G.stage||'law'); f('abroad',()=>!!G.flags.abroad);
  f('evRunning',()=>!!(typeof EVENTS!=='undefined'&&EVENTS.running)); f('n',()=>(G.flags.ndlTalkN||null));
  f('ndlTalkDayRaw',()=>[G.flags.ndlTalkDay==null?null:G.flags.ndlTalkDay, G.day]); f('kind',()=>CALENDAR.kind(G.day)); f('term',()=>{ const t=CALENDAR.termOf(G.day); return t?{id:t.id, week:t.week, exam:!!t.exam}:null; }); return o; })"""   # BB-B 14:2x：LAWWW-B 要 10/21 的 ndlTalkDay 和當天 day；noodleDay 是 false 的時候看是不是考試週


NDLREAD = """(T=>{ const G=GAME.G, E=GAME.E, o={}; const f=(k,fn)=>{ try{ o[k]=fn(); }catch(e){ o[k]='err:'+e.message; } };   // LAWWW-B 13:14 要的讀數：麵店團為什麼沒生出來
  const P=x=>x==null||['string','number','boolean'].includes(typeof x);
  const flat=v=>{ if(P(v)) return v; const r={}; for(const k of Object.keys(v)){ const x=v[k]; if(P(x)) r[k]=x; else if(Array.isArray(x)) r[k]=x.length<=6&&x.every(P)?x:'[陣列 '+x.length+']'; else if(typeof x==='object') r[k]=Object.fromEntries(Object.entries(x).filter(([a,b])=>P(b)).slice(0,12)); } return r; };
  f('h',()=>+(+G.hour).toFixed(2)); f('zone',()=>G.zone);
  f('schedEnt',()=>T.map(id=>[id, flat(STORY.schedEnt(CHARACTERS[id],G))]));
  f('seats',()=>E.zone.seats.length);
  f('seated',()=>E.npcs.filter(n=>n.seat||n.seatTarget).map(n=>[n.id||n.charId||n.name||null,+(n.seat||n.seatTarget).x.toFixed(2),+(n.seat||n.seatTarget).z.toFixed(2),n.seat?'seat':'seatTarget']));
  f('npcKeys',()=>Object.keys(GAME.npc||{}));
  f('npcs',()=>E.npcs.map(n=>[n.id||n.charId||n.name||null,n.hidden?'hidden':'',n.seat?'seat':'']));
  return o; })"""
NDLR = bool(os.environ.get('NDLREAD'))
NDLX = bool(os.environ.get('NDLEXAM'))   # BB-B 14:3x：LAWWW-B 1e3ffbb0e（AA-B 回：考試週麵店團各自念書、不去麵店）
NDLX_CASES = (('1021x', '2025-10-21', 17.9, 'exam1'), ('1023x', '2025-10-23', 17.9, 'exam2'), ('1028', '2025-10-28', 17.9, True), ('0428', '2026-04-28', 17.9, 'zhe504'))
NDL_EXAM_AYI = '這禮拜考試齁？你們那桌都沒來。'
H504 = '考期中那兩個禮拜，阿姨的手包著。語彤一個人顧店。我去吃麵順便幫忙收碗，她說你坐著。'

async def noodle(pg, cdp, run):
    st, d = await P.base(pg, SAVE, '2025-09-30', 17.9, 'gongguan'); await P.load(pg, cdp, st, quiet=False)
    run.setup('[前置] 使用者存檔改到 %s（%s 第 %s 週）17:54 公館' % (d['key'], d['term'], d['week']))
    await P.prep(pg, cdp, run, """(T=>{ const G=GAME.G; PHONE.join(G,'noodle_team','麵店團'); for(const id of T.concat(['heroine_03','heroine_01'])){ if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.remember(id,'FIRST_MET',''); } G.flags.met_yu=true;
        return {inGroup:PHONE.inGroup(G,'noodle_team'), noodleDay:STORY.noodleDay(G.day)}; })(%s)""" % J(TEAM), quiet=False, label='加入麵店團、認識阿哲、Alison、柏翰、芯慈')
    snap = await P.snapshot(pg)
    for tag, key, hh, want in (('0930', '2025-09-30', 17.9, 'first'), ('1002', '2025-10-02', 17.9, 'yutong'), ('1007', '2025-10-07', 17.9, True), ('1009_2040', '2025-10-09', 20.6, False), ('1014', '2025-10-14', 17.9, True)) + ((('1016_early', '2025-10-16', 17.3, 'early'), ('1021_load', '2025-10-21', 18.0, 'load')) if NDLR and not NDLX else ()) + (NDLX_CASES if NDLX else ()):   # NDLREAD：17:20 從門口走進去等到 18:00、18:00 直接讀檔在店裡   # 10/14：dd8b216c0 以後再看一次沒有別的事件的麵店日   # 10/2 有語彤的事件（閒聊讓給它，一天一件）；10/7 才看長桌閒聊   # 9/30 第一次＝麵店團成團事件先演（ndlOtherDue），長桌閒聊看下一個麵店日
        if want == 'load':
            await P.jump(pg, cdp, run, key, hh, zone='noodle', pos=None, snap=None, quiet=False, note='直接讀檔在麵店裡（出生點）')
            n0 = await P.say_hook(pg); day = await pg.evaluate("GAME.G.day"); ok = True
        else:
            if tag != '0930': await P.jump(pg, cdp, run, key, hh, zone='gongguan', snap=None, quiet=False)   # 同一份進度（演過的事件留著）
            it = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='noodle'); return it?[it.x,it.z]:null; })()")
            if it: await P.place_near(pg, run, it[0], it[1], 5.0, what='阿鳳麵店門口')
            n0 = await P.say_hook(pg); day = await pg.evaluate("GAME.G.day")
            ok = await door_to(pg, cdp, run, 'noodle', tag)
        await pg.wait_for_timeout(1500); pres0 = await pg.evaluate(PRESENT); await run.shot(pg, 'noodle_%s_in' % tag)
        if NDLR:
            run.note('%s 讀數（進門／讀檔後 1.5 秒）：%s' % (tag, J(await pg.evaluate(NDLREAD, TEAM))))
            await pg.wait_for_timeout(20000); run.note('%s 讀數（再 20 秒）：%s' % (tag, J(await pg.evaluate(NDLREAD, TEAM))))
        rd = await pg.evaluate(NDLREAD, TEAM) if NDLR else None
        if want == 'early':
            t17 = time.time()
            while time.time() - t17 < 300 and await pg.evaluate("GAME.G.hour") < 17.62: await pg.wait_for_timeout(2000)   # 17:30 客人走進來的那一段：看 seatTarget
            run.note('%s 17:37（客人走進來）讀數：%s' % (tag, J(await pg.evaluate(NDLREAD, TEAM))))
            w = await P.wait_play(pg, cdp, 18.05, max_s=600, run=run, tag=tag); pres0 = await pg.evaluate(PRESENT)
            rd = await pg.evaluate(NDLREAD, TEAM); run.note('%s 17:20 進店站到 18:03（%s）讀數：%s' % (tag, w, J(rd))); await run.shot(pg, 'noodle_%s_1800' % tag)
            want = True
        if NDLR and rd and want is not False:   # 5f8b94515 以後：作息在麵店的麵店團都要有位子、生出來；客人只坐剩下的
            se = dict((a, b) for a, b in (rd.get('schedEnt') or []) if isinstance(rd.get('schedEnt'), list))
            need = [i for i in TEAM if isinstance(se.get(i), dict) and se[i].get('zone') == 'noodle']
            keys = set(rd.get('npcKeys') or []); miss = [i for i in need if i not in keys]
            cust = sum(1 for q in (rd.get('seated') or []) if not q[0])
            run.check('%s：作息在麵店的麵店團都生出來、有位子（客人只坐剩下的）' % tag, not miss, J({'need': need, 'missing': miss, 'customers': cust, 'seats': rd.get('seats'), 'seated': rd.get('seated')}))
        elif want == 'load': want = True
        diag = await pg.evaluate(NDLDIAG, TEAM); run.note('%s 進門後閒聊條件：%s' % (tag, J(diag)))
        talk_pres = None; t0 = time.time(); talked = False
        while time.time() - t0 < 60:
            s = await P.ts(pg)
            if s['dlg'] or s['ch']:
                if talk_pres is None: talk_pres = await pg.evaluate(PRESENT); await run.shot(pg, 'noodle_%s_talk' % tag)
                r = await P.dialog(pg, cdp, run, max_s=120, tag='noodle_%s' % tag); talked = True
            if await pg.evaluate("(d=>GAME.G.flags.ndlTalkDay===d)", day) and not (await P.ts(pg))['dlg']: break
            await pg.wait_for_timeout(1500)
        if want in (True, 'yutong') and not await pg.evaluate("(d=>GAME.G.flags.ndlTalkDay===d)", day):   # 那天另有麵店事件（ndlOtherDue，例：語彤在店裡）＝閒聊讓給它：像玩家一樣先去找她，再看閒聊
            d2 = await pg.evaluate(NDLDIAG, TEAM); run.note('%s 60 秒沒有閒聊，條件：%s' % (tag, J(d2)))
            if d2.get('otherDue') and await P.who(pg, 'heroine_03'):
                r3 = await P.talk_full(pg, cdp, run, 'heroine_03', '%s_yutong' % tag, max_s=240); run.note('%s 先找語彤：%s' % (tag, J(r3 and r3['lines'][:6])))
                t1 = time.time()
                while time.time() - t1 < 90:
                    s = await P.ts(pg)
                    if s['dlg'] or s['ch']:
                        if talk_pres is None: talk_pres = await pg.evaluate(PRESENT); await run.shot(pg, 'noodle_%s_talk' % tag)
                        await P.dialog(pg, cdp, run, max_s=120, tag='noodle_%s_after_yutong' % tag)
                    if await pg.evaluate("(d=>GAME.G.flags.ndlTalkDay===d)", day) and not (await P.ts(pg))['dlg']: break
                    await pg.wait_for_timeout(1500)
        if want == 'zhe504' and await P.who(pg, 'zhe'):   # 大一下第 10 週起第一個麵店日：找阿哲說話，聽到的那一句（heard_lines h504_zhe_hand）
            r5 = await P.talk_full(pg, cdp, run, 'zhe', '%s_zhe' % tag, max_s=240); run.note('%s 找阿哲：%s' % (tag, J(r5 and r5['lines'][:6])))
        lines = await P.said(pg, n0); ndl = await pg.evaluate("(d=>GAME.G.flags.ndlTalkDay===d)", day)
        pres = talk_pres or pres0; names = set()
        for q in pres: names |= {q['name'], q['nm']}
        team_here = sorted({q['id'] for q in pres0 if q['id'] in TEAM}); hid = await pg.evaluate(HIDDEN)
        run.note('%s 藏著的人：%s' % (tag, J(hid)))
        run.note('%s 進門：%s｜店裡的人 %s｜閒聊開始時店裡 %s｜說了 %s' % (tag, ok, J(pres0), J(talk_pres), J(lines)))
        speak = [l for l in lines if l[0] and l[0] not in ('祐廷', '你') and not l[0].startswith('（')]
        missing = sorted({l[0] for l in speak if l[0] not in names})
        if want == 'first':
            run.check('9/30（二）18:00 走進麵店：麵店團有人坐在店裡（3D）', ok and len(team_here) >= 1, J(team_here))
            run.check('9/30（二）：這一段開口的每一個人都在店裡（3D 有這個人，店員也算）', not missing, J({'missing': missing, 'names': sorted(x for x in names if x), 'lines': lines[:6]}))
        elif want == 'yutong':
            run.check('10/2（四）：語彤的麵店事件開口的人都在店裡', not missing, J({'missing': missing, 'lines': lines[:6]}))
        elif want in ('exam1', 'exam2'):
            dd = '%s/%s' % (key[5:7].lstrip('0'), key[8:10].lstrip('0')); ay = [l for l in lines if l[1] == NDL_EXAM_AYI]
            tm = await pg.evaluate("(()=>{ const t=CALENDAR.termOf(GAME.G.day); return t?{id:t.id, week:t.week, exam:!!t.exam}:null; })()")
            run.check('%s（考試週 %s）18:00 走進麵店：麵店團四位都不在（各自念書）' % (dd, J(tm)), ok and not team_here, J(team_here))
            run.check('%s：阿姨「%s」%s' % (dd, NDL_EXAM_AYI, '說一次（這個考試週第一次進門）' if want == 'exam1' else '不再說（同一週第二次進門）'),
                      len(ay) == (1 if want == 'exam1' else 0) and all(l[0] == '阿姨' for l in ay), J({'ayi': ay, 'lines': lines[:6]}))
            run.check('%s：沒有長桌閒聊' % dd, not ndl, J(lines[:6]))
        elif want == 'zhe504':
            run.check('大一下第 10 週麵店日（2026-04-28）找阿哲：「%s」' % H504[:16], any(l[1] == H504 for l in lines), J([l for l in lines if l[0] == '阿哲'][:6]))
        elif want:
            dd = '%s/%s' % (key[5:7].lstrip('0'), key[8:10].lstrip('0'))
            run.check('%s 18:00 走進麵店：麵店團有人坐在店裡（3D）' % dd, ok and len(team_here) >= 1, J(team_here))
            run.check('%s 18:00：長桌閒聊有演（有人沒生出來時，他說話的那則不演、換別則）' % dd, ndl, J({'lines': lines[:6], 'team3d': team_here}))
            run.check('%s 18:00：閒聊裡開口的每一個人都真的在店裡（3D 看得到這個人）' % dd, ndl and not missing, J({'missing': missing, 'names': sorted(x for x in names if x), 'hidden': hid}))
        else:
            run.check('10/9（四）20:40 走進麵店：麵店團四位都不在（作息 20:30 走）', ok and not team_here, J(team_here))
            run.check('10/9（四）20:40：沒有長桌閒聊（人不在就不演）', not ndl, J(lines[:6]))
        await run.shot(pg, 'noodle_%s_after' % tag)


async def cafe2(pg, cdp, run):
    st, d = await P.base(pg, SAVE, '2025-09-27', 14.0, 'l118_cafe2'); await P.load(pg, cdp, st); await pg.wait_for_timeout(3000)
    run.setup('[前置] 使用者存檔改到 %s 14:00 慢讀咖啡（118 巷）' % d['key'])
    r0 = await P.dialog(pg, cdp, run, picks=['不去了'], max_s=60, start_s=6, tag='cafe2_prompt')   # 使用者存檔 9/27 14:00 有「出發：去木柵大學找可昕」：玩家選不去了（BB-B 10-30：沒處理＝出遊走掉，時間到 18:03）
    its = await pg.evaluate("(()=>GAME.E.interactables.filter(i=>i.seat).map(i=>({x:+i.x.toFixed(2),z:+i.z.toFixed(2),label:i.label,study:!!i.study,lift:!!(i.seat&&i.seat.lift)})))()")
    run.note('慢讀的座位：%s' % J(its)); await run.shot(pg, 'cafe2_in')
    desk = [i for i in its if i['label'] == '坐下讀書']
    run.check('慢讀：至少兩個座位寫「坐下讀書」', len(desk) >= 2, J(its))
    run.check('慢讀：吧檯高腳椅不寫「坐下讀書」', all(i['label'] != '坐下讀書' for i in its if i['lift']), J([i for i in its if i['lift']]))
    if not desk: return
    pp = await pg.evaluate("(()=>{ const p=GAME.E.player.obj.position; return [p.x,p.z]; })()")
    free = await pg.evaluate("""(()=>{ const E=GAME.E; return E.interactables.filter(i=>i.seat&&i.label==='坐下讀書').filter(i=>!E.npcs.some(n=>(n.seat&&Math.hypot(n.seat.x-i.seat.x,n.seat.z-i.seat.z)<0.35)||(n.seatTarget&&Math.hypot(n.seatTarget.x-i.seat.x,n.seatTarget.z-i.seat.z)<0.4))&&!i.seat.taken).map(i=>({x:i.x,z:i.z})); })()""")
    run.note('沒人坐的讀書座位：%s' % J(free))   # cafe2diag：有三個座位客人佔著（nearestInteractable 照規則跳過），探針挑空的
    tg = sorted(free or desk, key=lambda i: math.hypot(i['x'] - pp[0], i['z'] - pp[1]))[0]
    ap = await pg.evaluate("(([x,z])=>{ const it=GAME.E.interactables.find(i=>i.seat&&Math.abs(i.x-x)<0.01&&Math.abs(i.z-z)<0.01); if(!it||!GAME.seatApproach) return null; const a=GAME.seatApproach(it.seat); return a?[a[0],a[1]]:null; })", [tg['x'], tg['z']])
    run.note('座位 %s 旁邊（GAME.seatApproach）：%s' % (J(tg), J(ap)))
    gx, gz = (ap[0], ap[1]) if ap else (tg['x'], tg['z'])   # 站到椅子旁邊（坐下時走過去的那一點），不是椅子正中間
    await L.go_to(pg, cdp, run, gx, gz, 0.35, '坐下讀書的座位旁邊', max_s=200, stop=lambda s: s['interact'].startswith('坐下讀書'))
    lab = (await P.ts(pg))['lab']; run.check('走到桌位旁：按鈕是「坐下讀書」', lab.startswith('坐下讀書'), lab)
    st0 = await pg.evaluate("(()=>({study:GAME.G.stats.study|0, h:+GAME.G.hour, day:GAME.G.day}))()")
    await L.tap(pg, cdp, '#interact'); menus = []; picked = []; t0 = time.time(); seated_shot = False
    while time.time() - t0 < 240:
        s = await P.ts(pg)
        if s['ch']:
            T = [o['t'] for o in s['ch']]; menus.append(T)
            if not seated_shot: await run.shot(pg, 'cafe2_seat_menu'); seated_shot = True
            k = next((i for i, o in enumerate(s['ch']) if o['t'].startswith('讀書') and not o['dim']), None)
            if k is None: k = next((i for i, o in enumerate(s['ch']) if '小時' in o['t'] and not o['dim']), None)
            now = await pg.evaluate("GAME.G.stats.study|0")
            if now > st0['study']: k = next((i for i, o in enumerate(s['ch']) if re.match(r'^(站起來|起身|離開|就這樣|算了)', o['t'])), None)
            if k is None: k = next((i for i, o in enumerate(s['ch']) if not o['dim']), 0)
            picked.append(s['ch'][k]['t']); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if s['busy'] or s['depth'] > 0: await pg.wait_for_timeout(600); continue
        if await pg.evaluate("GAME.G.stats.study|0") > st0['study']: break
        await pg.wait_for_timeout(1000)
    st1 = await pg.evaluate("(()=>({study:GAME.G.stats.study|0, h:+GAME.G.hour, day:GAME.G.day}))()"); await run.shot(pg, 'cafe2_after')
    run.note('選單 %s；選了 %s；前 %s 後 %s' % (J(menus), J(picked), J(st0), J(st1)))
    run.check('坐下以後選單有「讀書」（沒有變暗）', any(any(t.startswith('讀書') for t in m) for m in menus), J(menus[:2]))
    run.check('讀完：讀書次數加了、時間走了', st1['study'] > st0['study'] and (st1['day'] > st0['day'] or st1['h'] - st0['h'] >= 0.9), J([st0, st1]))


def lab_hint(o):
    t = o['t']; return t


CHOICES = """(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return null; return [...ch.querySelectorAll('button')].map(b=>{ const h=b.querySelector('.hint'); const all=(b.textContent||'').trim(), hint=h?(h.textContent||'').trim():''; return {t:hint?all.slice(0,all.length-hint.length).trim():all, hint, dim:b.classList.contains('dim')}; }); })()"""


async def wait_choices(pg, cdp, max_s=20):
    t0 = time.time()
    while time.time() - t0 < max_s:
        c = await pg.evaluate(CHOICES)
        if c: return c
        s = await P.ts(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        await pg.wait_for_timeout(600)
    return None


async def pick_text(pg, cdp, opts, t):
    k = next((i for i, o in enumerate(opts) if o['t'] == t), None)
    if k is None: k = next((i for i, o in enumerate(opts) if o['t'].startswith(t)), None)
    if k is None: return False
    await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1300); return True


async def invite(pg, cdp, run):
    st, d = await P.base(pg, SAVE, '2025-09-29', 12.3, 'campus'); await P.load(pg, cdp, st)
    run.setup('[前置] 使用者存檔改到 %s（%s 第 %s 週）12:18 校園' % (d['key'], d['term'], d['week']))
    await P.prep(pg, cdp, run, """(()=>{ const G=GAME.G, o={}; for(const id of ['heroine_01','heroine_05']){ if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.remember(id,'FIRST_MET',''); Object.assign(SOCIAL.rel(id),{fam:45,trust:30,comf:20,npcRom:35,rom:10}); G.contacts=G.contacts||{}; if(G.contacts[id]==null) G.contacts[id]=G.day-1; o[id]={stage:SOCIAL.stage(id),can:INV.canInvite(G,id)}; } return o; })()""",
                 label='以安、學姊：認識、有聯絡方式、熟（好朋友那一階）')
    snap = await P.snapshot(pg)
    for cid, nm in (('heroine_01', '以安'), ('heroine_05', '學姊')):
        await P.load(pg, cdp, snap); await P.phone_tab(pg, cdp, 'friends')
        sel = '#phoneBody [data-inv="%s"]' % cid
        if not await pg.evaluate("s=>!!document.querySelector(s)", sel):
            run.check('%s：手機「朋友」有「約」' % nm, False, ''); continue
        await L.tap(pg, cdp, sel); top = await wait_choices(pg, cdp); await run.shot(pg, 'inv_%s_top' % cid)
        run.note('%s 第一層：%s' % (nm, J(top)))
        tl = [o['t'] for o in (top or [])]
        run.check('%s：第一層照分類（念書…／吃飯…／喝咖啡、喝茶…／散步…／運動…）＋「算了」' % nm, bool(top) and all(c in tl for c in ('念書…', '吃飯…', '喝咖啡、喝茶…', '散步…', '運動…')) and tl[-1] == '算了', J(tl))
        run.check('%s：第一層不超過 8 列' % nm, bool(top) and len(top) <= 8, str(len(top or [])))
        dims = [o for o in (top or []) if o['dim']]
        run.check('%s：灰掉的分類有小字寫原因' % nm, all(o['hint'] for o in dims), J(dims))
        subs = {}
        for cat in [o['t'] for o in (top or []) if o['t'].endswith('…') and not o['dim']]:
            cur = await pg.evaluate(CHOICES)
            if not cur or not await pick_text(pg, cdp, cur, cat): run.note('%s：按不到 %s' % (nm, cat)); continue
            sub = await wait_choices(pg, cdp, 10) or []; subs[cat] = sub
            await run.shot(pg, 'inv_%s_%s' % (cid, len(subs)))
            if cat == '出去玩…':
                deep = {}
                for reg in [o['t'] for o in sub if o['t'].endswith('…') and not o['dim']][:3]:
                    cur = await pg.evaluate(CHOICES)
                    if not cur or not await pick_text(pg, cdp, cur, reg): continue
                    deep[reg] = [o['t'] for o in (await wait_choices(pg, cdp, 10) or [])]
                    cur = await pg.evaluate(CHOICES)
                    if cur: await pick_text(pg, cdp, cur, '返回')
                run.note('%s 出去玩的地區：%s' % (nm, J(deep)))
                run.check('%s：出去玩…第二層照地區分（有「…」的子分類），每一層最多 8 列' % nm, any(o['t'].endswith('…') for o in sub) and len(sub) <= 8 and all(len(v) <= 8 for v in deep.values()), J({'sub': [o['t'] for o in sub], 'deep': deep}))
            cur = await pg.evaluate(CHOICES)
            if cur and not await pick_text(pg, cdp, cur, '返回'): run.note('%s：%s 沒有「返回」' % (nm, cat))
            await wait_choices(pg, cdp, 8)
        run.note('%s 第二層：%s' % (nm, J({k: [(o['t'], o['dim'], o['hint'][:30]) for o in v] for k, v in subs.items()})))
        def has(cat, words): return all(any(w in o['t'] for o in subs.get(cat, [])) for w in words)
        if cid == 'heroine_01':
            run.check('以安：念書…有總圖、慢讀咖啡、法圖', has('念書…', ('總圖', '慢讀', '法')), J([o['t'] for o in subs.get('念書…', [])]))
            run.check('以安：喝咖啡、喝茶…有兩點半 Café、一盞、慢讀', has('喝咖啡、喝茶…', ('兩點半', '一盞', '慢讀')), J([o['t'] for o in subs.get('喝咖啡、喝茶…', [])]))
            run.check('以安：運動…有羽球、晨跑', has('運動…', ('羽球', '晨跑')), J([o['t'] for o in subs.get('運動…', [])]))
        run.check('%s：每一個第二層都不超過 8 列' % nm, all(len(v) <= 8 for v in subs.values()), J({k: len(v) for k, v in subs.items()}))
        live = [k for k, v in subs.items() if any(not o['dim'] and o['t'] != '返回' for o in v)]
        run.check('%s：至少三類約得到（不是只剩一兩個）' % nm, len(live) >= 3, J(live))
        cur = await pg.evaluate(CHOICES)
        if cur: await pick_text(pg, cdp, cur, '算了')
        await pg.wait_for_timeout(1500); await L.close_panels(pg, cdp)


JK = """(()=>{ const P=GAME.E.player, u=P.obj.userData; let on=null, n=0; if(u&&u.model) u.model.traverse(o=>{ if(o.name==='JACKET_ECON'){ n++; let v=o.visible, q=o.parent; while(v&&q){ v=q.visible; q=q.parent; } on=v; } });
  let chair=null; const z=GAME.E.zone; if(z){ chair=z.jacketChair==null?null:!!z.jacketChair; } return {zone:GAME.G.zone, on, n, uj:u?!!u.jacket:null, chair, state:STORY.jacketState?STORY.jacketState(GAME.G):null, flag:GAME.G.flags.ECON_JACKET||null}; })()"""


async def jacket(pg, cdp, run):
    d = await P.day_of(pg, {'from': '2025-09-29', 'wd': [1, 2, 3, 4, 5]})
    st, d = await P.base(pg, SAVE, d['key'], 15.2, 'campus'); await P.load(pg, cdp, st, quiet=False)
    run.setup('[前置] 使用者存檔改到 %s（%s 第 %s 週）15:12 校園' % (d['key'], d['term'], d['week']))
    await P.prep(pg, cdp, run, "(()=>{ const G=GAME.G; G.flags.SK02_DM_DAY=G.day-1; return {open:STORY.sk02Open(G)}; })()", quiet=False, label='系辦私訊那天（SK02_DM_DAY＝昨天）')
    await P.place_near(pg, run, 16, -85, 7.0, what='社科院大樓正門')
    n0 = await P.say_hook(pg)
    await L.go_to(pg, cdp, run, 16, -85, 1.2, '社科院正門', max_s=200, stop=lambda s: s['dlg'] or s['choices'] or s['busy'])   # BB-B 10-30 13:5x：事件 near r=3.5，走到半路就開演；沒給 stop 時 go_to 會自己點掉對話、選第一個（第一次跑選項 []）
    r = await P.dialog(pg, cdp, run, picks=['（穿去法律系館A上課）'], max_s=200, start_s=30, tag='sk02_jacket')
    lines = await P.said(pg, n0)
    run.check('社科院正門：領系外套的事件有演（「外套在這裡」）', any('外套' in l[1] for l in lines), J(lines[:8]))
    run.check('選項有「（穿去法律系館A上課）」並選了', '（穿去法律系館A上課）' in r['picked'], J(r['opts']))
    await pg.wait_for_timeout(4000); j1 = await pg.evaluate(JK)
    await pg.evaluate("(()=>{ const C=GAME.E.cam; C.distTarget=2.6; C.pitch=0.1; C.manualT=1e9; })()"); await pg.wait_for_timeout(2500); await run.shot(pg, 'jacket_on_campus')
    run.check('領完：身上穿著系外套（JACKET_ECON 看得到）', j1['on'] is True, J(j1))
    snap = await P.snapshot(pg)
    s2 = json.loads(json.dumps(snap)); s2['zone'] = 'dorm'; s2['pos'] = None; s2['hour'] = 21.0
    await P.load(pg, cdp, s2); await pg.wait_for_timeout(6000); j2 = await pg.evaluate(JK); await run.shot(pg, 'jacket_dorm_room')
    run.setup('[前置] 同一份進度到宿舍房間 21:00')
    run.check('回宿舍房間：身上脫下來、椅背掛著（JACKET_CHAIR）', j2['on'] is False and j2['chair'] is True, J(j2))
    nx = await pg.evaluate("""(()=>{ const G=GAME.G; for(let d=G.day+1; d<=G.day+8; d++){ const it=(CLS.dayItems(G,d)||[]).find(q=>q.room&&q.room.zone==='classroom'&&!q.exam); if(it) return {d, key:CALENDAR.dateOf(d).key, t0:it.t0, name:it.c&&it.c.name, cid:it.c&&it.c.id}; } return null; })()""")
    run.note('下一次 201 的課：%s' % J(nx))
    if not nx: run.check('七天內有 201 的課', False, ''); return
    await P.jump(pg, cdp, run, nx['key'], nx['t0'] - 0.75, zone='dorm', pos=None, snap=snap, quiet=False, note='上課前 45 分鐘在宿舍')
    j3 = await pg.evaluate(JK); run.note('出門前（宿舍）：%s' % J(j3))
    await P.phone_tab(pg, cdp, 'today')
    bt = await pg.evaluate("(()=>{ const e=document.querySelector('#phoneBody [data-go]'); return e?(e.textContent||'').trim():null; })()")
    n1 = await P.say_hook(pg)
    if bt: await L.tap(pg, cdp, '#phoneBody [data-go]')
    t0 = time.time(); shot = False; j4 = None
    while time.time() - t0 < 300:
        s = await P.ts(pg)
        z = await pg.evaluate("GAME.G.zone")
        if z == 'classroom' and not shot: await pg.wait_for_timeout(1500); j4 = await pg.evaluate(JK); await run.shot(pg, 'jacket_201'); shot = True
        if s['ch']:
            k, _ = P.pick_of(s['ch'], ['坐中間', '坐']); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(900); continue
        if s['dlg']:
            if '臥底' in s['txt']: await run.shot(pg, 'jacket_spy_line')
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if shot and await pg.evaluate("GAME.G.hour") > nx['t0'] + 0.3: break
        await pg.wait_for_timeout(1500)
    lines = await P.said(pg, n1); run.note('上課那一段：手機按鈕「%s」；%s' % (bt, J(lines[:12])))
    run.check('201 上課：身上穿著系外套', bool(j4) and j4['on'] is True, J(j4))
    run.check('201 上課前：阿哲「你是經濟系派來的臥底嗎？」', any('臥底' in l[1] for l in lines), J(lines[:12]))


async def badclip(pg, cdp, run):
    hit = None
    for key in ('2025-09-29', '2025-09-30', '2025-10-01', '2025-10-02', '2025-10-03'):
        for hh in (12.2, 15.2, 16.5):
            st, d = await P.base(pg, SAVE, key, hh, 'campus'); await P.load(pg, cdp, st)
            w = await pg.evaluate(WHERE, 'heroine_01')
            if w and not w['away'] and w['zone'] == 'campus':
                hit = (key, hh, w); break
        if hit: break
    run.note('以安在的地方：%s' % J(hit))
    if not hit: run.check('找到以安有空、在校園附近的時間', False, ''); return
    st, d = await P.base(pg, SAVE, hit[0], hit[1], hit[2]['zone']); await P.load(pg, cdp, st, quiet=False)
    await P.prep(pg, cdp, run, """(()=>{ const id='heroine_01'; if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.remember(id,'FIRST_MET',''); Object.assign(SOCIAL.rel(id),{fam:45,trust:30,comf:20,npcRom:35,rom:10}); return {stage:SOCIAL.stage(id), can:INV.canInvite(GAME.G,id)}; })()""", quiet=False, label='以安熟（好朋友那一階）')
    run.setup('[前置] %s %.2f 時 %s（以安在這一區）' % (hit[0], hit[1], hit[2]['zone']))
    pres = await P.wait_present(pg, 'heroine_01', 60)
    r = await P.talk_full(pg, cdp, run, 'heroine_01', 'badclip_invite', picks=['約她去', '運動', '新體育館', '去新體育館', '羽球', '現在一起過去'], max_s=400)
    run.note('約她：%s' % J(r and {'opts': r['opts'], 'picked': r['picked']}))
    picked = (r or {}).get('picked') or []
    run.check('當面約以安：選到「約她去…」→ 運動 → 羽球 →「現在一起過去」', any('約她去' in p for p in picked) and any('羽球' in p for p in picked) and any('現在一起過去' in p for p in picked), J(picked))
    fol = await P.who(pg, 'heroine_01'); run.note('約完以安：%s' % J(fol))
    run.check('約完：以安跟著走（beh follow）', bool(fol) and fol['beh'] == 'follow', J(fol))
    inn = await door_to(pg, cdp, run, 'gym', '走到新體育館', max_s=500)
    run.check('和以安一起走進新體育館', inn and await pg.evaluate("GAME.G.zone") == 'gym', await pg.evaluate("GAME.G.zone"))
    samples = []; t0 = time.time(); clip = False; shots = 0; idle0 = time.time(); walked = False
    while time.time() - t0 < 360:
        g = await pg.evaluate("""(()=>{ const E=GAME.E, P=E.player.obj.position, n=E.npcs.find(m=>m.charId==='heroine_01'&&!m.hidden); const c=!!E.zone&&!!E.scene.getObjectByName('badclip');
            return {zone:GAME.G.zone, clip:c, p:[+P.x.toFixed(2),+P.z.toFixed(2)], h:n?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2)]:null, beh:n?n.beh||null:null, frozen:n?!!n.frozen:null}; })()""")
        if g['clip']:
            clip = True; samples.append(g)
            if shots < 3 and len(samples) in (2, 6, 12): await run.shot(pg, 'badclip_%d' % len(samples)); shots += 1
            await pg.wait_for_timeout(500); continue
        if clip and not g['clip']: break
        s = await P.ts(pg)
        if s['ch']:
            k, _ = P.pick_of(s['ch'], ['現在一起過去', '好']); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(900); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); idle0 = time.time(); continue
        if not walked and time.time() - idle0 > 40:   # 進門 40 秒沒開始：像玩家一樣走到羽球場、按互動
            walked = True; await L.go_to(pg, cdp, run, 0.0, -7.5, 1.2, '羽球場邊', max_s=150)
            if (await P.ts(pg))['lab']: await L.tap(pg, cdp, '#interact')
        await pg.wait_for_timeout(1000)
    run.note('短片期間位置（%d 筆）：%s' % (len(samples), J(samples[:40])))
    run.check('跟著走到新體育館、羽球短片有演', clip, J(samples[:2]))
    ok = [x for x in samples if x['h'] and x['p']]
    bad = [x for x in ok if not (x['h'][1] < -11.2 < x['p'][1]) or math.hypot(x['h'][0] - x['p'][0], x['h'][1] - x['p'][1]) < 3]
    run.check('短片期間以安一直在網子另一邊（北半場，玩家在南半場，相距 3 m 以上），沒有跑到玩家面前', bool(ok) and not bad, J(bad[:5]))


BMST = """(()=>{ const bm=document.getElementById('bigmap'), pp=document.getElementById('bmPeople'), w=document.getElementById('bmWho');
  const vis=e=>!!e&&!!e.offsetParent&&!e.classList.contains('hide'); let cover=null;
  if(vis(pp)){ const a=pp.getBoundingClientRect(), c=(document.getElementById('bmCanvas')||document.querySelector('#bigmap canvas')); if(c){ const b=c.getBoundingClientRect(); const ix=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left)), iy=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)); cover=+((ix*iy)/(b.width*b.height||1)).toFixed(2); } }
  return {open:vis(bm), people:vis(pp), hot:!!w&&w.classList.contains('hot'), who:!!w&&vis(w), cover, goal:GAME.G.goal||null, dest:GAME.G.goalDest||null}; })()"""


async def open_bigmap(pg, cdp):
    if await pg.evaluate("(()=>{ const b=document.getElementById('btnBigMap'); return !!b&&!!b.offsetParent; })()"): await L.tap(pg, cdp, '#btnBigMap')
    else: await L.tap(pg, cdp, '#minimap')
    await pg.wait_for_timeout(1800); return await pg.evaluate(BMST)


async def close_bigmap(pg, cdp):
    if await pg.evaluate("(()=>{ const b=document.getElementById('bmClose'); return !!b&&!!b.offsetParent; })()"): await L.tap(pg, cdp, '#bmClose')
    else: await L.close_panels(pg, cdp)
    await pg.wait_for_timeout(900)

HUD = """(()=>{ const r=id=>{ const e=document.getElementById(id); if(!e||!e.offsetParent||e.classList.contains('hide')) return null; const b=e.getBoundingClientRect(); return {x:+b.left.toFixed(1),y:+b.top.toFixed(1),w:+b.width.toFixed(1),h:+b.height.toFixed(1),t:(e.innerText||'').trim().slice(0,160)}; };
  const g=document.getElementById('goal'), cs=g?getComputedStyle(g):null, lh=cs?parseFloat(cs.lineHeight)||15.6:15.6;
  const o={goal:r('goal'), next:r('nextClass'), guide:r('guide'), clock:r('clock'), vw:innerWidth, vh:innerHeight, clamp:cs?cs.webkitLineClamp||cs.getPropertyValue('-webkit-line-clamp'):null,
    lines:g?Math.round((g.clientHeight-(parseFloat(cs.paddingTop)||0)-(parseFloat(cs.paddingBottom)||0))/lh):null, cut:g?g.scrollHeight>g.clientHeight+1:null, full:GAME.G.goal||null};
  const hit=(a,b)=>a&&b&&a.x<b.x+b.w-0.5&&b.x<a.x+a.w-0.5&&a.y<b.y+b.h-0.5&&b.y<a.y+a.h-0.5;
  o.overlap=[['goal','next'],['goal','guide'],['next','guide'],['goal','clock']].filter(([a,b])=>hit(o[a],o[b])).map(x=>x.join('×'));
  o.off=['goal','next','guide'].filter(k=>o[k]&&(o[k].x<0||o[k].y<0||o[k].x+o[k].w>o.vw+0.5||o[k].y+o[k].h>o.vh+0.5)); return o; })()"""


async def hud_check(pg, cdp, run):
    for key, hh, zone, tag in (('2025-09-25', 8.5, 'dorm', 'class_am'), ('2025-09-25', 12.4, 'campus', 'class_pm'), ('2025-09-30', 9.6, 'campus', 'class_tue')):
        st, d = await P.base(pg, SAVE, key, hh, zone); await P.load(pg, cdp, st); await pg.wait_for_timeout(4000)
        h = await pg.evaluate(HUD); await run.shot(pg, 'hud_%s_%s' % (VP, tag)); run.note('%s HUD：%s' % (tag, J(h)))
        if not h['goal']: run.check('%s（%s）：看得到目標那一行' % (tag, VP), False, J(h)); continue
        run.check('%s（%s）：目標最多兩行（line-clamp 2），這一則兩行看得完、沒被截' % (tag, VP), (h['lines'] or 0) <= 2 and not h['cut'], J({k: h[k] for k in ('lines', 'cut', 'clamp', 'full')}))
        run.check('%s（%s）：目標、今天的課、導引互不重疊，也沒有超出畫面' % (tag, VP), not h['overlap'] and not h['off'], J({k: h[k] for k in ('goal', 'next', 'guide', 'overlap', 'off')}))


async def bigmap(pg, cdp, run):
    free = None
    for key in ('2025-09-27', '2025-09-28'):   # 週末：目標寫「自由」（或沒有 goalDest）的日子
        st, d = await P.base(pg, SAVE, key, 10.0, 'campus'); await P.load(pg, cdp, st)
        g = await pg.evaluate("(()=>({goal:GAME.G.goal||null, dest:GAME.G.goalDest||null}))()")
        if re.search('自由', g['goal'] or '') or not g['dest']: free = key; break
    run.note('自由日：%s' % free)
    for tag, key, hh in (('free', free or '2025-09-27', 10.0), ('class', '2025-09-25', 8.5)):
        st, d = await P.base(pg, SAVE, key, hh, 'campus'); await P.load(pg, cdp, st); await pg.wait_for_timeout(2000)
        a = await open_bigmap(pg, cdp); await run.shot(pg, 'bm_%s_%s_open' % (VP, tag)); run.note('%s 打開大地圖：%s' % (tag, J(a)))
        run.check('%s（%s）：大地圖打開時人物清單收起（不蓋地圖）' % (tag, VP), a['open'] and not a['people'], J(a))
        if tag == 'free': run.check('自由的日子：👥 有黃點（hot）', a['hot'], J(a))
        else: run.check('有目標的日子：👥 沒有黃點', not a['hot'], J(a))
        await L.tap(pg, cdp, '#bmWho'); await pg.wait_for_timeout(1200); b2 = await pg.evaluate(BMST); await run.shot(pg, 'bm_%s_%s_people' % (VP, tag))
        run.check('%s：按 👥 展開清單、黃點消失' % tag, b2['people'] and not b2['hot'], J(b2))
        await close_bigmap(pg, cdp); c2 = await open_bigmap(pg, cdp); await run.shot(pg, 'bm_%s_%s_reopen' % (VP, tag))
        run.check('%s：關掉地圖再開，清單照樣展開' % tag, c2['open'] and c2['people'], J(c2))
        await L.tap(pg, cdp, '#bmWho'); await pg.wait_for_timeout(1000); await close_bigmap(pg, cdp); d2 = await open_bigmap(pg, cdp)
        run.check('%s：收起來以後再開，照樣收起' % tag, d2['open'] and not d2['people'], J(d2))
        await close_bigmap(pg, cdp)
    # 人名標籤不蓋地名（fc0c0ac69）：總圖前面有人的時候開大地圖（字畫在 canvas 上，看截圖）
    st, d = await P.base(pg, SAVE, '2025-09-25', 12.4, 'campus'); await P.load(pg, cdp, st); await pg.wait_for_timeout(3000)
    a = await open_bigmap(pg, cdp)
    if not a['people']: await L.tap(pg, cdp, '#bmWho'); await pg.wait_for_timeout(1000); await L.tap(pg, cdp, '#bmWho'); await pg.wait_for_timeout(1000)
    await run.shot(pg, 'bm_%s_labels' % VP); await close_bigmap(pg, cdp)
    run.check('大地圖人名標籤（%s）：截圖拍到（「總圖書館」有沒有被人名蓋住看截圖）' % VP, a['open'], J(a))
    await hud_check(pg, cdp, run)


ZHE = """(()=>{ const n=(GAME.npc&&GAME.npc.zhe)||null, m=GAME.E.npcs.find(q=>q.charId==='zhe')||null, o=n||m; const P=GAME.E.player.obj.position;
  let w=null; try{ const x=STORY.whereIs(GAME,'zhe'); w=x?{zone:x.zone,label:x.label||null,away:!!x.away}:null; }catch(e){ w='err:'+e.message; }
  let vis=null; if(o&&o.obj){ vis=o.obj.visible; let q=o.obj.parent; while(vis&&q){ vis=q.visible; q=q.parent; } }
  return {npcZhe:!!n, inNpcs:!!m, pos:o&&o.obj?[+o.obj.position.x.toFixed(2),+o.obj.position.z.toFixed(2)]:null, hidden:o?!!o.hidden:null, visible:vis, beh:o?o.beh||null:null,
    whereIs:w, companion:GAME.G.flags.companion||null, afternoonDone:!!GAME.G.flags.afternoonDone, zone:GAME.G.zone, me:[+P.x.toFixed(2),+P.z.toFixed(2)],
    all:GAME.E.npcs.filter(q=>!q.hidden).map(q=>(q.charId||q.name||'?')+'@'+q.obj.position.x.toFixed(1)+','+q.obj.position.z.toFixed(1))}; })()"""


async def bballrain(pg, cdp, run):
    mx = await pg.evaluate("(()=>Object.keys(CHARACTERS).find(k=>(CHARACTERS[k].name||'').indexOf('明軒')>=0))()")
    for tag in ('direct', 'walk'):
        if tag == 'direct':
            st, d = await P.base(pg, SAVE, '2025-10-03', 17.75, 'gym'); st['weather'] = 'rain'; await P.load(pg, cdp, st, quiet=False); await pg.wait_for_timeout(6000)
            run.setup('[前置] 使用者存檔改到 2025-10-03（五）17:45 下雨，直接讀檔在新體育館')
        else:
            st, d = await P.base(pg, SAVE, '2025-10-03', 17.6, 'campus'); st['weather'] = 'rain'; await P.load(pg, cdp, st, quiet=False)
            run.setup('[前置] 使用者存檔改到 2025-10-03（五）17:36 下雨，校園')
            it = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='gym'); return it?[it.x,it.z]:null; })()")
            if it: await P.place_near(pg, run, it[0], it[1], 6.0, what='新體育館門口')
            ok = await door_to(pg, cdp, run, 'gym', '走進新體育館', max_s=200)
            run.check('下雨天從校園走進新體育館', ok, await pg.evaluate("GAME.G.zone"))
            await P.wait_play(pg, cdp, 17.75, max_s=200); await pg.wait_for_timeout(3000)
        z = await pg.evaluate(ZHE); run.note('%s：%s' % (tag, J(z)))
        await pg.evaluate("(()=>{ const E=GAME.E; for(const R of [3,4,5]){ for(let i=0;i<16;i++){ const a=i*Math.PI/8, px=-3.6-R+Math.cos(a)*0.5, pz=12.6+Math.sin(a)*0.5; if(E.canStand&&!E.canStand(px,pz,0.3,0)) continue; E.placeAt(E.player,px,pz,0); const C=E.cam; C.yaw=-Math.PI/2; C.pitch=0.2; C.manualT=1e9; return; } } })()")
        await pg.wait_for_timeout(3000); await run.shot(pg, 'rain_gym_%s_east' % tag)
        z2 = await pg.evaluate(ZHE)
        near = await pg.evaluate("(([x,z])=>GAME.E.npcs.filter(n=>!n.hidden&&n.obj&&Math.hypot(n.obj.position.x-x,n.obj.position.z-z)<6).map(n=>n.charId||n.name||'?'))", [-3.6, 12.6])
        run.check('%s：下雨 17:45 體育館一樓走廊 (-3.6,12.6) 附近有阿哲（GAME.npc.zhe 在、看得到）' % tag, z2['inNpcs'] and z2['visible'] is True and 'zhe' in near, J({'zhe': z2, 'near': near}))
        run.check('%s：明軒也在走廊' % tag, bool(mx) and mx in near, J(near))


RENART = [('gongguan', 'PLATE_FACE_GATE_OUT', None, '校門石牌（公館那一面）'), ('campus', 'PLATE_FACE_BELL', None, '晨思鐘石碑'), ('campus', 'PLATE_FACE_BOYA', None, '博思名牌'),
          ('linze', None, 'linze_notice', '法律系館A 一樓公布欄'), ('classroom', None, 'cls201_print', '201 後牆傳單'), ('boya_203', None, 'boya_203_print', '博思 203 門邊海報'),
          ('campus', 'PLATE_FACE_SOC', None, '社科院系所牌'), ('wenzhou', 'PLATE_FACE_PARK', None, '溫州公園牌')]
FINDOBJ = """(([nm,tex])=>{ let hit=null; if(nm==='PLATE_FACE_SOC'||nm==='PLATE_FACE_PARK'){ const want=nm==='PLATE_FACE_SOC'?/SOC|SOCSCI|DEPT/i:/PARK|WZ_?PARK|WENZHOU/i; GAME.E.scene.traverse(o=>{ if(!hit&&/^PLATE_FACE/.test(o.name||'')&&want.test(o.name)) hit=o; }); if(!hit){ const names=[]; GAME.E.scene.traverse(o=>{ if(/^PLATE_FACE/.test(o.name||'')) names.push(o.name); }); return {missing:true,plates:names.slice(0,40)}; } }
  GAME.E.scene.traverse(o=>{ if(hit) return; if(nm&&o.name===nm) hit=o; else if(tex&&o.isMesh){ const ms=Array.isArray(o.material)?o.material:[o.material]; for(const m of ms){ const t=m&&m.map; if(t&&((t.name||'').indexOf(tex)>=0||((t.image&&t.image.src)||'').indexOf(tex)>=0||(m.name||'').indexOf(tex)>=0)){ hit=o; break; } } } });
  if(!hit) return null; const v=new THREE.Vector3(); hit.getWorldPosition(v); return {name:hit.name, x:+v.x.toFixed(2), y:+v.y.toFixed(2), z:+v.z.toFixed(2)}; })"""


async def renart(pg, cdp, run):
    zones = await pg.evaluate("Object.keys(Z3.ZONES)")
    for zone, nm, tex, label in RENART:
        z = zone if zone in zones else None
        if not z:
            alt = [k for k in zones if k.startswith(zone.split('_')[0])]; run.note('%s：沒有區域 %s（相近：%s）' % (label, zone, J(alt))); continue
        st, d = await P.base(pg, SAVE, '2025-09-26', 10.5, z); await P.load(pg, cdp, st); await pg.wait_for_timeout(8000)
        o = None
        for _ in range(10):
            o = await pg.evaluate(FINDOBJ, [nm, tex])
            if o: break
            await pg.wait_for_timeout(2000)
        run.note('%s：%s' % (label, J(o)))
        if o and o.get('missing'): run.note('%s：沒有對得上的 PLATE_FACE 節點；場景裡的牌子：%s' % (label, J(o['plates']))); o = None
        if not o: run.check('%s：場景裡找得到（%s）' % (label, nm or tex), False, ''); continue
        p = await pg.evaluate("""(([x,z])=>{ const E=GAME.E; for(const R of [2.2,3,4,5,6]){ for(let i=0;i<24;i++){ const a=i*Math.PI/12, px=x+Math.sin(a)*R, pz=z+Math.cos(a)*R; if(E.canStand&&!E.canStand(px,pz,0.3,0)) continue;
            if(E.losR&&!E.losR(px,pz,x,z,0.05)) continue; E.placeAt(E.player,px,pz,0); const C=E.cam; C.yaw=Math.atan2(px-x,pz-z); C.pitch=0.08; C.distTarget=2.4; C.manualT=1e9; return {x:+px.toFixed(2),z:+pz.toFixed(2),R}; } } return null; })""", [o['x'], o['z']])
        await pg.wait_for_timeout(3500); await run.shot(pg, 'renart_%s' % (nm or tex))
        run.check('%s：站到前面拍到（字看截圖）' % label, bool(p), J(p))
    # ADV 背景 ntu_linze（BG-16 重拍）：用 ADV 自己換背景，截圖看外牆大字
    st, d = await P.base(pg, SAVE, '2025-09-26', 10.5, 'campus'); await P.load(pg, cdp, st); await pg.wait_for_timeout(3000)
    r = await pg.evaluate("(async()=>{ try{ ADV.begin({background:'ntu_linze'}); await new Promise(r=>setTimeout(r,2500)); const el=document.querySelector('#adv,#advBg,.adv-bg'); return {ok:true, bg:el?getComputedStyle(el).backgroundImage.slice(0,120):null}; }catch(e){ return {ok:false, e:e.message}; } })()")
    await pg.wait_for_timeout(2500); await run.shot(pg, 'renart_bg_ntu_linze')
    run.check('ADV 背景 ntu_linze 叫得出來（外牆大字看截圖）', bool(r and r.get('ok')), J(r))
    await pg.evaluate("(()=>{ try{ ADV.end(); }catch(e){} })()")


LAWN = """(()=>{ let glb=null, plates=0; GAME.E.scene.traverse(o=>{ if(o.name==='campus_lib_lawn_glb'){ let v=o.visible, q=o.parent; while(v&&q){ v=q.visible; q=q.parent; } glb=v; } });
  let plaza=null; GAME.E.scene.traverse(o=>{ if(o.isMesh&&Math.abs(o.position.x-78.5)<0.01&&Math.abs(o.position.z)<0.01&&Math.abs(o.position.y-0.016)<0.002){ let v=o.visible, q=o.parent; while(v&&q){ v=q.visible; q=q.parent; } plaza=v; } });
  const seats=(GAME.E.interactables||[]).filter(i=>/總圖前的長椅/.test(i.label||'')).map(i=>({x:+i.x.toFixed(2),z:+i.z.toFixed(2)})); return {zone:GAME.G.zone, glb, plaza, seats, me:[+GAME.E.player.obj.position.x.toFixed(2),+GAME.E.player.obj.position.z.toFixed(2)]}; })()"""


async def libla(pg, cdp, run):
    st, d = await P.base(pg, SAVE, '2025-09-26', 15.0, 'campus', pos={'x': 58, 'z': 0.5, 'yaw': -PI / 2, 'lv': 0, 'y': 0}); await P.load(pg, cdp, st); await pg.wait_for_timeout(8000)
    run.setup('[前置] 使用者存檔改到 2025-09-26（五）15:00，站在椰影大道 (58,0.5)')
    a = await pg.evaluate(LAWN); run.note('草皮：%s' % J(a))
    run.check('總圖前草皮正式模型載入、看得到（campus_lib_lawn_glb）', a['glb'] is True, J(a))
    run.check('中軸兩邊有六張「坐在總圖前的長椅上」', len(a['seats']) == 6, J(a['seats']))
    run.check('草皮載入以後石板廣場藏起來（沒有疊在草皮上）', a['plaza'] is False, J(a))
    ok = await L.go_to(pg, cdp, run, 79.5, 0.0, 1.0, '總圖門口', max_s=240)
    me = await pg.evaluate("[GAME.E.player.obj.position.x, GAME.E.player.obj.position.z]")
    run.check('從椰影大道照玩家走到總圖門口（中軸）', math.hypot(me[0] - 79.5, me[1]) < 2.0, J(me)); await run.shot(pg, 'lawn_at_door')
    snap = await P.snapshot(pg)
    for hh, tag in ((15.0, 'day'), (17.83, 'dusk'), (20.0, 'night')):
        await P.jump(pg, cdp, run, '2025-09-26', hh, pos={'x': 66, 'z': 0.5, 'yaw': -PI / 2, 'lv': 0, 'y': 0}, snap=snap)
        await pg.wait_for_timeout(6000)
        await pg.evaluate("(()=>{ const C=GAME.E.cam; C.yaw=-Math.PI/2; C.pitch=0.16; C.distTarget=6; C.manualT=1e9; })()"); await pg.wait_for_timeout(3000)
        await run.shot(pg, 'lawn_%s' % tag)
        if tag == 'night':
            await pg.evaluate("(()=>{ const C=GAME.E.cam; C.pitch=0.5; C.distTarget=14; })()"); await pg.wait_for_timeout(2500); await run.shot(pg, 'lawn_night_high')
    await P.jump(pg, cdp, run, '2025-09-26', 15.2, pos={'x': 70, 'z': 0.5, 'yaw': -PI / 2, 'lv': 0, 'y': 0}, snap=snap); await pg.wait_for_timeout(5000)
    seats = (await pg.evaluate(LAWN))['seats']
    pick = [sorted([q for q in seats if q['z'] < 0], key=lambda q: q['x'])[:1], sorted([q for q in seats if q['z'] > 0], key=lambda q: -q['x'])[:1]]
    for q in [x[0] for x in pick if x]:
        await L.go_to(pg, cdp, run, q['x'], q['z'] - (0.7 if q['z'] > 0 else -0.7), 0.6, '長椅 (%.1f,%.1f) 前面' % (q['x'], q['z']), max_s=150, stop=lambda s: '總圖前的長椅' in s['interact'])
        lab = (await P.ts(pg))['lab']
        await L.tap(pg, cdp, '#interact'); sat = None; t0 = time.time(); did = False
        while time.time() - t0 < 90:
            s2 = await P.ts(pg)
            if sat is None and await pg.evaluate("!!(GAME.E.player.seat||GAME.E.player.pose==='sit')"): sat = True; await run.shot(pg, 'lawn_bench_%d' % int(q['x'] * 10))
            if s2['ch']:
                T = [o['t'] for o in s2['ch']]
                k = next((i for i, t in enumerate(T) if t.startswith('坐一下')), None) if not did else None
                if k is None: k = next((i for i, t in enumerate(T) if re.match(r'^(站起來|起身|離開|就這樣|算了|不坐了)', t)), len(T) - 1)
                if T[k].startswith('坐一下'): did = True
                await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
            if s2['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
            if s2['busy'] or s2['depth'] > 0: await pg.wait_for_timeout(600); continue
            if did and not await pg.evaluate("!!(GAME.E.player.seat||GAME.E.player.pose==='sit')"): break
            if did and s2['lab'] and re.match(r'^(站起來|起身)', s2['lab']): await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500); continue
            await pg.wait_for_timeout(800)
        p0 = await pg.evaluate("[GAME.E.player.obj.position.x, GAME.E.player.obj.position.z]")
        await L.go_to(pg, cdp, run, q['x'], 0.0, 0.8, '起身走回中軸', max_s=90)
        p1 = await pg.evaluate("[GAME.E.player.obj.position.x, GAME.E.player.obj.position.z]")
        run.check('長椅 (%.1f,%.1f)：按鈕「%s」、坐得下、起身以後走得回中軸（沒卡住）' % (q['x'], q['z'], lab), '總圖前的長椅' in lab and bool(sat) and abs(p1[1]) < 1.5, J({'sat': sat, 'from': p0, 'to': p1}))
    for k in (1, 2):
        ok1 = await door_to(pg, cdp, run, 'library_hall', '進總圖（第 %d 次）' % k, max_s=200); await pg.wait_for_timeout(4000)
        ok2 = await door_to(pg, cdp, run, 'campus', '出總圖（第 %d 次）' % k, max_s=200); await pg.wait_for_timeout(8000)
        a = await pg.evaluate(LAWN); await run.shot(pg, 'lawn_reenter_%d' % k)
        run.check('進出總圖第 %d 次：進得去、出得來，草皮模型還在、長椅六張' % k, ok1 and ok2 and a['zone'] == 'campus' and a['glb'] is True and a['plaza'] is False and len(a['seats']) == 6, J({'in': ok1, 'out': ok2, 'lawn': a}))


LLSPOTS = [('1f_read', -0.2, 0.0, 0, -0.2, -2.0, '一樓閱覽區（長桌之間）'), ('1f_south', -0.2, 3.4, 0, -0.2, 8.0, '長閱覽桌旁邊往南看窗'),
           ('counter', 3.2, 6.2, 0, 4.8, 5.3, '櫃台、入口'), ('2f_stacks', -1.6, -3.6, 1, -2.4, -6.0, '二樓書庫'), ('2f_read', 2.4, 4.2, 1, 2.4, 5.8, '二樓閱覽區')]


def lum_stats(path):
    try:
        from PIL import Image
        im = Image.open(path).convert('L'); im = im.resize((im.width // 4, im.height // 4)); px = list(im.getdata()); n = len(px)
        return {'dark': round(sum(1 for v in px if v < 12) / n, 3), 'white': round(sum(1 for v in px if v > 248) / n, 3), 'mean': round(sum(px) / n, 1)}
    except Exception as e:
        return {'err': str(e)}


async def ll_shot(pg, run, tag, x, z, lv, tx, tz, dist=3.2):
    p = await pg.evaluate("""(([x,z,lv,tx,tz,dist])=>{ const E=GAME.E; for(const R of [0,0.4,0.8,1.2]){ for(let i=0;i<12;i++){ const a=i*Math.PI/6, px=x+Math.sin(a)*R, pz=z+Math.cos(a)*R; if(E.canStand&&!E.canStand(px,pz,0.3,lv)) continue;
        E.placeAt(E.player,px,pz,lv); const C=E.cam; C.yaw=Math.atan2(px-tx,pz-tz); C.pitch=0.14; C.distTarget=dist; C.manualT=1e9; return {x:+px.toFixed(2),z:+pz.toFixed(2),lv}; } } return null; })""", [x, z, lv, tx, tz, dist])
    await pg.wait_for_timeout(3500)
    f = await run.shot(pg, tag)
    path = f if isinstance(f, str) and os.path.exists(f) else None
    if not path:
        cand = sorted([q for q in os.listdir(OUT) if tag in q], key=lambda q: os.path.getmtime(os.path.join(OUT, q)))
        path = os.path.join(OUT, cand[-1]) if cand else None
    st = lum_stats(path) if path else {'err': 'no file'}
    return p, st


async def lawlib(pg, cdp, run):
    rows = []
    for hh, tg in ((14.0, 'day'), (20.5, 'night')):
        st, d = await P.base(pg, SAVE, '2025-09-26', hh, 'lawlib'); await P.load(pg, cdp, st); await pg.wait_for_timeout(9000)
        lm = await pg.evaluate("(()=>{ let n=0, m=0; GAME.E.scene.traverse(o=>{ if(o.isMesh){ const ms=Array.isArray(o.material)?o.material:[o.material]; for(const q of ms){ if(q&&q.lightMap){ n++; } } m++; } }); return {lightmapped:n, meshes:m, zone:GAME.G.zone}; })()")
        run.note('%s：光照貼圖 %s' % (tg, J(lm)))
        run.check('%s：法律學院圖書館有接到光照貼圖（lightMap 的材質 > 0）' % tg, lm['lightmapped'] > 0, J(lm))
        for key, x, z, lv, tx, tz, label in LLSPOTS:
            p, stt = await ll_shot(pg, run, 'lawlib_%s_%s' % (tg, key), x, z, lv, tx, tz)
            rows.append((tg, key, label, p, stt)); run.note('%s %s：站 %s；亮度 %s' % (tg, label, J(p), J(stt)))
        p, stt = await ll_shot(pg, run, 'lawlib_%s_person_lamp' % tg, -0.2, -0.9, 0, -0.2, -2.0, dist=2.0)
        rows.append((tg, 'person', '人站在長桌燈下（近拍）', p, stt))
    bad = [(r[0], r[2], r[4]) for r in rows if r[4].get('dark', 0) > 0.25 or r[4].get('white', 0) > 0.15]
    run.check('每張：黑（亮度 <12）不超過 25%、死白（>248）不超過 15%（細節看截圖）', not bad and all('err' not in r[4] for r in rows), J(bad or [(r[0], r[1], r[4]) for r in rows if 'err' in r[4]]))
    run.check('五個鏡頭白天、晚上都站得到（二樓 lv1）', all(r[3] for r in rows), J([(r[0], r[1]) for r in rows if not r[3]]))
    for k in (1, 2):
        ok1 = await door_to(pg, cdp, run, 'wancai', '回法律系館B 大廳（第 %d 次）' % k, max_s=150); await pg.wait_for_timeout(4000)
        ok2 = await door_to(pg, cdp, run, 'lawlib', '再走進法律學院圖書館（第 %d 次）' % k, max_s=150); await pg.wait_for_timeout(8000)
        lm = await pg.evaluate("(()=>{ let n=0; GAME.E.scene.traverse(o=>{ if(o.isMesh){ const ms=Array.isArray(o.material)?o.material:[o.material]; for(const q of ms) if(q&&q.lightMap) n++; } }); return {n, zone:GAME.G.zone}; })()")
        p, stt = await ll_shot(pg, run, 'lawlib_reenter_%d' % k, -0.2, 0.0, 0, -0.2, -2.0)
        run.check('進出第 %d 次：出得去、進得來，光照貼圖照樣接上、亮度正常' % k, ok1 and ok2 and lm['zone'] == 'lawlib' and lm['n'] > 0 and stt.get('dark', 1) <= 0.25 and stt.get('white', 1) <= 0.15, J({'out': ok1, 'in': ok2, 'lm': lm, 'lum': stt}))


async def cafe2diag(pg, cdp, run):   # BB-B 10-30：n15_cafe2／2b 站到「坐下讀書」旁邊，按鈕不出來——分清楚是遊戲還是探針
    st, d = await P.base(pg, SAVE, '2025-09-27', 14.0, 'l118_cafe2'); await P.load(pg, cdp, st); await pg.wait_for_timeout(3000)
    await P.dialog(pg, cdp, run, picks=['不去了'], max_s=60, start_s=6, tag='diag_prompt')
    rows = await pg.evaluate("""(()=>{ const E=GAME.E, out=[]; const its=E.interactables.filter(i=>i.seat&&i.label==='坐下讀書');
      for(const it of its){ const a=GAME.seatApproach?GAME.seatApproach(it.seat):null; if(!a) continue; E.placeAt(E.player,a[0],a[1],0); E.player.tapPref=null;
        const occ=E.npcs.filter(n=>n.seat&&Math.hypot(n.seat.x-it.seat.x,n.seat.z-it.seat.z)<0.35).map(n=>({who:n.charId||n.name||'?', at:[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2)], dSeat:+Math.hypot(n.obj.position.x-it.seat.x,n.obj.position.z-it.seat.z).toFixed(2), beh:n.beh||null, pose:n.pose||null, hidden:!!n.hidden, seatTarget:n.seatTarget?[n.seatTarget.x,n.seatTarget.z]:null}));   /* LAWWW-B 11:45：看起來空、遊戲算有人坐的那張——誰佔著、人在哪 */
        const near=E.nearestInteractable(); const P=E.player.obj.position;
        out.push({seat:[it.x,it.z], ap:[+a[0].toFixed(2),+a[1].toFixed(2)], d:+Math.hypot(it.x-P.x,it.z-P.z).toFixed(2), r:it.radius, lv:it.lv, plv:E.player.lv|0, levels:!!E.levels, hidden:!!it.hidden, taken:!!it.seat.taken, occ,
          near:near?{label:near.label,x:near.x,z:near.z}:null, busy:!!E.player.busy, dActive:!!(GAME.D&&GAME.D.active)}); }
      return out; })()""")
    await pg.wait_for_timeout(1500)
    ui = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return {hide:b?b.classList.contains('hide'):null, label:((document.getElementById('interactLabel')||{}).textContent||''), busy:!!GAME.E.player.busy}; })()")
    await run.shot(pg, 'cafe2diag')
    run.note('每個「坐下讀書」旁邊：%s；畫面按鈕 %s' % (J(rows), J(ui)))
    run.check('站到每個「坐下讀書」的 seatApproach：遊戲判定最近的互動就是那個座位（nearestInteractable）', bool(rows) and all(r['near'] and r['near']['label'] == '坐下讀書' for r in rows), J(rows))


LMCOUNT = "(()=>{ let n=0; GAME.E.scene.traverse(o=>{ if(o.isMesh){ const ms=Array.isArray(o.material)?o.material:[o.material]; for(const q of ms) if(q&&q.lightMap) n++; } }); return {n, zone:GAME.G.zone}; })()"


async def yaw_shots(pg, run, tag, yaws=(0, PI / 2, PI, -PI / 2), pitch=0.14, dist=3.6):
    out = []
    for k, y in enumerate(yaws):
        await pg.evaluate("(([y,p,d])=>{ const C=GAME.E.cam; C.yaw=y; C.pitch=p; C.distTarget=d; C.manualT=1e9; })", [y, pitch, dist]); await pg.wait_for_timeout(2500)
        f = await run.shot(pg, '%s_y%d' % (tag, k)); out.append(lum_stats(f))
    return out


async def multiroom(pg, cdp, run):
    for hh, tg in ((14.0, 'day'), (20.5, 'night')):
        st, d = await P.base(pg, SAVE, '2025-09-27', hh, 'wancai_multi'); await P.load(pg, cdp, st); await pg.wait_for_timeout(9000)
        lm = await pg.evaluate(LMCOUNT); ls = await yaw_shots(pg, run, 'multi_%s' % tg, yaws=(0, PI / 2, PI))
        run.note('%s：光照 %s；亮度 %s' % (tg, J(lm), J(ls)))
        run.check('%s：多功能教室接到光照貼圖、黑不超過 25%%、死白不超過 15%%' % tg, lm['n'] > 0 and all(x.get('dark', 1) <= 0.25 and x.get('white', 1) <= 0.15 for x in ls), J({'lm': lm, 'lum': ls}))
    # 坐下、起身
    seats = await pg.evaluate("""(()=>{ const E=GAME.E; return E.interactables.filter(i=>i.seat&&!E.npcs.some(n=>n.seat&&Math.hypot(n.seat.x-i.seat.x,n.seat.z-i.seat.z)<0.35)).map(i=>{ const a=GAME.seatApproach?GAME.seatApproach(i.seat):null; return {x:i.x,z:i.z,label:i.label,ap:a?[a[0],a[1]]:null}; }); })()""")
    run.note('空座位：%d 個，前三個 %s' % (len(seats), J(seats[:3])))
    if seats and seats[0]['ap']:
        q = seats[0]; await L.go_to(pg, cdp, run, q['ap'][0], q['ap'][1], 0.35, '座位旁邊', max_s=150, stop=lambda s: s['interact'] == q['label'])
        lab = (await P.ts(pg))['lab']; await L.tap(pg, cdp, '#interact'); sat = False; t0 = time.time()
        while time.time() - t0 < 60:
            s = await P.ts(pg)
            if not sat and await pg.evaluate("!!(GAME.E.player.seat||GAME.E.player.pose==='sit')"): sat = True; await run.shot(pg, 'multi_sit')
            if s['ch']:
                k = next((i for i, o in enumerate(s['ch']) if re.match(r'^(起身|站起來|就這樣|算了)', o['t'])), len(s['ch']) - 1)
                await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1500); continue
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
            if sat and not await pg.evaluate("!!(GAME.E.player.seat||GAME.E.player.pose==='sit')") and not s['busy']: break
            await pg.wait_for_timeout(800)
        p0 = await pg.evaluate("[GAME.E.player.obj.position.x, GAME.E.player.obj.position.z]")
        sp = await pg.evaluate("(()=>{ const s=GAME.E.zone.spawn||{x:0,z:0}; return [s.x,s.z]; })()")
        await L.go_to(pg, cdp, run, sp[0], sp[1], 0.9, '起身走回門口', max_s=90)
        p1 = await pg.evaluate("[GAME.E.player.obj.position.x, GAME.E.player.obj.position.z]")
        run.check('多功能教室：按「%s」坐得下、起身走得開（沒卡住）' % lab, bool(lab) and sat and math.hypot(p1[0] - p0[0], p1[1] - p0[1]) > 0.8, J({'sat': sat, 'from': p0, 'to': p1}))
    # 上課：找一堂在多功能教室的課
    it = await pg.evaluate("""(()=>{ const G=GAME.G; for(let d=G.day; d<=G.day+40; d++){ const q=(CLS.dayItems(G,d)||[]).find(x=>x.room&&(x.room.zone==='wancai_multi'||x.room.via==='wancai_multi'||x.room.door==='multi')&&!x.exam); if(q) return {d, key:CALENDAR.dateOf(d).key, t0:q.t0, name:q.c&&q.c.name, k:q.key}; } return null; })()""")
    run.note('多功能教室的課：%s' % J(it))
    if it:
        await P.jump(pg, cdp, run, it['key'], it['t0'] - 0.5, zone='wancai', pos=None, quiet=False, note='上課前 30 分鐘在法律系館B 大廳')
        await P.phone_tab(pg, cdp, 'today')
        bt = await pg.evaluate("(k=>{ const e=[...document.querySelectorAll('#phoneBody [data-go]')].find(b=>b.dataset.go===k); return e?(e.textContent||'').trim():null; })", it['k'])
        if bt: await L.tap(pg, cdp, '#phoneBody [data-go="%s"]' % it['k'])
        t0 = time.time(); shot = None
        while time.time() - t0 < 300:
            s = await P.ts(pg)
            if s['ch']: k, _ = P.pick_of(s['ch'], ['坐']); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(900); continue
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
            if await pg.evaluate("GAME.G.zone") == 'wancai_multi' and await pg.evaluate("GAME.G.hour") >= it['t0'] + 0.05: break
            await pg.wait_for_timeout(1500)
        await pg.wait_for_timeout(3000)
        cl = await pg.evaluate("(()=>{ const E=GAME.E; const v=E.npcs.filter(n=>n.obj&&!n.hidden); return {zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2), n:v.length, sit:v.filter(n=>n.seat||n.pose==='sit').length, stand:v.filter(n=>!(n.seat||n.pose==='sit')).map(n=>n.name||n.charId||'?')}; })()")
        await yaw_shots(pg, run, 'multi_class', yaws=(0, PI))
        run.note('上課（%s）：手機按鈕「%s」；教室裡 %s' % (it['name'], bt, J(cl)))
        run.check('多功能教室上課：同學坐好（坐著的 ≥ 3）、站著的只有老師等少數人（≤ 2）', cl['zone'] == 'wancai_multi' and cl['sit'] >= 3 and len(cl['stand']) <= 2, J(cl))
    for k in (1, 2):
        ok1 = await door_to(pg, cdp, run, 'wancai', '回法律系館B 大廳（第 %d 次）' % k, max_s=150); await pg.wait_for_timeout(4000)
        ok2 = await door_to(pg, cdp, run, 'wancai_multi', '再走進多功能教室（第 %d 次）' % k, max_s=150); await pg.wait_for_timeout(8000)
        lm = await pg.evaluate(LMCOUNT); ls = await yaw_shots(pg, run, 'multi_reenter_%d' % k, yaws=(0,))
        run.check('進出第 %d 次：出得去、進得來，光照貼圖照樣接上' % k, ok1 and ok2 and lm['zone'] == 'wancai_multi' and lm['n'] > 0, J({'out': ok1, 'in': ok2, 'lm': lm, 'lum': ls}))


async def rtnight(pg, cdp, run):
    for zone, pos, label in (('dorm', None, '宿舍房間'), ('cafe', {'x': 0, 'z': 0.5, 'yaw': 0, 'lv': 0, 'y': 0}, '兩點半 Café'), ('linze', {'x': 0, 'z': -1, 'yaw': PI, 'lv': 0, 'y': 0}, '法律系館A 大廳')):
        st, d = await P.base(pg, SAVE, '2025-09-26', 20.5, zone, pos=pos); await P.load(pg, cdp, st); await pg.wait_for_timeout(9000)
        lm = await pg.evaluate(LMCOUNT); ls = await yaw_shots(pg, run, 'rtnight_%s' % zone)
        run.note('%s 20:30：光照 %s；亮度 %s' % (label, J(lm), J(ls)))
        run.check('%s 晚上：四個方向拍到（門框、小東西看截圖）；死白不超過 15%%' % label, len(ls) == 4 and all(x.get('white', 1) <= 0.15 for x in ls), J(ls))


# ---------- boya：博思教學館室內 v2（BOYA-LM-1030，a63eb8072；LAWWW-B 14:12）----------
# 鏡頭照 LAWWW2-B tools/blender/env_second/shots/boya_lm_shots.py（101 最後一排往講台、講台往座位、座位近看）；102 在東邊，x 鏡像
BOYA_CAMS = [('back', (-8.0, 3.7, -8.4), (-12.4, 1.0, 6.5)), ('stage', (-8.6, 1.75, 8.3), (-12.0, 1.4, -5.0)), ('seats', (-12.2, 2.35, 0.2), (-13.8, 0.85, 3.4))]
BOYA_CHK = """(()=>{ const E=GAME.E, Z=E.zone, F=Z&&Z.seatFold, S=(Z&&Z.seats)||[]; const lec=S.map((s,i)=>i).filter(i=>S[i].kind==='lecture'); let lm=0; E.scene.traverse(o=>{ if(o.isMesh){ const ms=Array.isArray(o.material)?o.material:[o.material]; for(const q of ms) if(q&&q.lightMap) lm++; } });
  return {zone:GAME.G.zone, formal:!!(Z&&Z.formal), lmInfo:!!(Z&&Z.formalInfo&&Z.formalInfo.lightmapped), lm, pans:!!(Z&&Z.group&&Z.group.getObjectByName('SEATPANS')), fallback:((Z&&Z.lectFurn)||[]).map(g=>g.visible), fold:!!F, lecture:lec.length,
    emptyDown:F?lec.filter(i=>!F.occupied(E,i)&&F.ang[i]<=1.5).length:-1, busyUp:F?lec.filter(i=>F.occupied(E,i)&&F.ang[i]!==0).length:-1, busy:F?lec.filter(i=>F.occupied(E,i)).length:-1}; })()"""


def band_stats(path, y0=0.0, y1=0.3):
    try:
        from PIL import Image
        im = Image.open(path).convert('RGB'); w, h = im.size
        im = im.crop((0, int(h * y0), w, int(h * y1))); im = im.resize((max(1, im.width // 4), max(1, im.height // 4))); px = list(im.getdata()); n = len(px)
        r, g, b = (sum(q[k] for q in px) / n for k in range(3)); lum = [0.299 * q[0] + 0.587 * q[1] + 0.114 * q[2] for q in px]
        return {'mean': round(sum(lum) / n, 1), 'dark': round(sum(1 for v in lum if v < 12) / n, 3), 'white': round(sum(1 for v in lum if v > 248) / n, 3), 'rgb': [round(r), round(g), round(b)], 'warm': round((r - b) / max(1.0, (r + g + b) / 3), 2)}
    except Exception as e:
        return {'err': str(e)}


async def shot_path(run, pg, tag):
    f = await run.shot(pg, tag)
    if isinstance(f, str) and os.path.exists(f): return f
    cand = sorted([q for q in os.listdir(OUT) if tag in q], key=lambda q: os.path.getmtime(os.path.join(OUT, q)))
    return os.path.join(OUT, cand[-1]) if cand else None


async def boya_wait_formal(pg, s=40):
    for _ in range(s * 2):
        if await pg.evaluate("GAME.G.zone==='boya'&&!!GAME.E.zone&&!!GAME.E.zone.formal"): break
        await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(3000)
    return await pg.evaluate(BOYA_CHK)


async def boya_fixed(pg, run, tg):
    rows = []
    await pg.evaluate("(()=>{ GAME.E.player.obj.visible=false; })()")
    for room, sx in (('101', 1), ('102', -1)):
        for key, e, lk in BOYA_CAMS:
            pos = [e[0] * sx, e[1], e[2]]; look = [lk[0] * sx, lk[1], lk[2]]
            await pg.evaluate("((p,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); })(%s,%s)" % (J(pos), J(look)))
            await pg.wait_for_timeout(3500); f = await shot_path(run, pg, 'boya_%s_%s_%s' % (tg, room, key))
            whole = lum_stats(f) if f else {'err': 'no file'}; top = band_stats(f, 0.0, 0.3) if f else {'err': 'no file'}
            rows.append((room, key, whole, top)); run.note('%s %s %s：整張 %s；上面三成（天花板） %s' % (tg, room, key, J(whole), J(top)))
    return rows


async def boya(pg, cdp, run):
    # ① 14:00、20:30：直接讀檔在博思一樓大廳（[前置]），正式模型＋光照、固定鏡頭（藏玩家；NPC 照常）
    allrows = []
    for hh, tg in ((14.0, '1400'), (20.5, '2030')):
        st, d = await P.base(pg, SAVE, '2025-10-15', hh, 'boya', pos={'x': 0.0, 'z': 6.8, 'yaw': PI, 'lv': 0}); await P.load(pg, cdp, st)
        run.setup('[前置] 使用者存檔改到 %s %s 博思一樓大廳' % (d['key'], tg))
        ck = await boya_wait_formal(pg); run.note('%s 進來以後：%s' % (tg, J(ck)))
        run.check('%s：正式模型＋光照貼圖、SEATPANS 在、備用方塊桌椅（lectFurn）全部藏起來、132 張翻椅' % tg,
                  ck['formal'] and ck['lm'] > 0 and ck['pans'] and len(ck['fallback']) == 2 and not any(ck['fallback']) and ck['fold'] and ck['lecture'] == 132, J(ck))
        run.check('%s：沒人坐的椅面掀起來、有人坐的放下' % tg, ck['emptyDown'] == 0 and ck['busyUp'] == 0, J({k: ck[k] for k in ('emptyDown', 'busyUp', 'busy')}))
        if hh == 14.0:   # ② 坐下、起身（照玩家：走到座位旁邊、按「坐下」）
            q = await pg.evaluate("""(()=>{ const E=GAME.E, Z=E.zone, F=Z.seatFold; const i=Z.seats.findIndex((s,k)=>s.kind==='lecture'&&s.room==='101'&&(s.row|0)>=2&&!(F&&F.occupied(E,k))&&!E.npcs.some(n=>n.seat===s||n.seatTarget===s));
                if(i<0) return null; const s=Z.seats[i], a=GAME.seatApproach?GAME.seatApproach(s):null; return {i, x:s.x, z:s.z, row:s.row, ap:a?[a[0],a[1]]:null}; })()""")
            run.note('101 挑的空位：%s' % J(q))
            if q and q['ap']:
                await L.go_to(pg, cdp, run, q['ap'][0], q['ap'][1], 0.4, '101 座位旁邊', max_s=240, stop=lambda s: bool(s.get('interact')) and '坐' in s['interact'])
                lab = (await P.ts(pg))['lab']; await L.tap(pg, cdp, '#interact'); sat = None; t0 = time.time()
                while time.time() - t0 < 40:
                    s = await P.ts(pg)
                    if await pg.evaluate("!!GAME.E.player.seat"): break
                    if s['ch']: k, _ = P.pick_of(s['ch'], ['坐']); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
                    if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
                    await pg.wait_for_timeout(700)
                await pg.wait_for_timeout(1500)
                sat = await pg.evaluate("""(k=>{ const E=GAME.E, Z=E.zone, F=Z.seatFold; const me=Z.seats.indexOf(E.player.seat); const lec=Z.seats.map((s,i)=>i).filter(i=>Z.seats[i].kind==='lecture');
                    return {seated:!!E.player.seat, me, want:k, mine:me>=0?F.ang[me]:null, wrong:lec.filter(i=>i!==me&&(F.occupied(E,i)?F.ang[i]!==0:F.ang[i]<=1.5)).length}; })(%d)""" % q['i'])
                await pg.evaluate("(()=>{ const C=GAME.E.cam; C.distTarget=2.4; C.pitch=0.25; C.manualT=1e9; })()"); await pg.wait_for_timeout(2500); await run.shot(pg, 'boya_101_sit')
                run.check('101 坐下（按「%s」）：那一張椅面放下（ang 0）、其他照舊' % lab, sat['seated'] and sat['mine'] == 0 and sat['wrong'] == 0, J(sat))
                how = None; t0 = time.time()
                while time.time() - t0 < 40 and await pg.evaluate("!!GAME.E.player.seat"):
                    s = await P.ts(pg)
                    if s['ch']:
                        k = next((i for i, o in enumerate(s['ch']) if re.match(r'^(起身|站起來|離開|算了|不了)', o['t'])), None)
                        if k is None: k = len(s['ch']) - 1
                        how = '選項「%s」' % s['ch'][k]['t']; await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1500); continue
                    if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
                    if s['lab'] and re.search(r'起身|站起來|離開', s['lab']): how = '按鈕「%s」' % s['lab']; await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500); continue
                    await L.joystick(pg, cdp, 0, -60, 700); how = how or '搖桿往前推'; await pg.wait_for_timeout(800)
                await pg.wait_for_timeout(2500)
                up = await pg.evaluate("(k=>{ const E=GAME.E, F=E.zone.seatFold; return {seated:!!E.player.seat, occupied:F.occupied(E,k), ang:F.ang[k]}; })(%d)" % (sat['me'] if sat['me'] is not None and sat['me'] >= 0 else q['i']))
                await run.shot(pg, 'boya_101_stand')
                run.check('101 起身（%s）：椅面掀回去（ang > 1.5）' % how, not up['seated'] and not up['occupied'] and isinstance(up['ang'], (int, float)) and up['ang'] > 1.5, J(up))
        rows = await boya_fixed(pg, run, tg); allrows += [(tg,) + r for r in rows]
    bad = [(r[0], r[1], r[2], r[3]) for r in allrows if r[3].get('dark', 1) > 0.25 or r[3].get('white', 1) > 0.15]
    run.check('固定鏡頭 12 張：黑（<12）不超過 25%、死白（>248）不超過 15%（細節看截圖）', len(allrows) == 12 and not bad, J(bad))
    dim = [(r[0], r[1], r[2], r[4]) for r in allrows if r[2] != 'seats' and (r[4].get('mean', 0) < 35 or r[4].get('dark', 1) > 0.3)]
    run.check('天花板（往講台、往座位那兩張的上面三成）沒有整片暗（平均 ≥ 35、黑 ≤ 30%；偏不偏咖啡色看 warm 和截圖）', not dim, J(dim or [(r[0], r[1], r[2], r[4].get('mean'), r[4].get('warm')) for r in allrows if r[2] != 'seats']))
    # ③ 進出兩次（從大廳門口出去回校園、再走進來）
    st, d = await P.base(pg, SAVE, '2025-10-15', 14.5, 'boya', pos={'x': 0.0, 'z': 6.8, 'yaw': PI, 'lv': 0}); await P.load(pg, cdp, st); await boya_wait_formal(pg)
    for k in (1, 2):
        ok1 = await door_to(pg, cdp, run, 'campus', '從博思大廳出去（第 %d 次）' % k, max_s=150); await pg.wait_for_timeout(4000)
        ok2 = await door_to(pg, cdp, run, 'boya', '再走進博思（第 %d 次）' % k, max_s=150); ck = await boya_wait_formal(pg)
        await pg.evaluate("(()=>{ const C=GAME.E.cam; C.yaw=0; C.pitch=0.14; C.distTarget=3.6; C.manualT=1e9; })()"); await pg.wait_for_timeout(2500); f = await shot_path(run, pg, 'boya_reenter_%d' % k)
        run.check('進出第 %d 次：出得去、進得來，正式模型＋光照照樣接上、方塊桌椅照樣藏著' % k, ok1 and ok2 and ck['zone'] == 'boya' and ck['formal'] and ck['lm'] > 0 and not any(ck['fallback']), J({'out': ok1, 'in': ok2, 'ck': ck, 'lum': lum_stats(f) if f else None}))


CLASSJS = """(()=>{ const E=GAME.E, Z=E.zone, F=Z&&Z.seatFold; const v=E.npcs.filter(n=>n.obj&&!n.hidden&&n.obj.visible!==false);
  return {zone:GAME.G.zone, key:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(2), n:v.length, sit:v.filter(n=>n.seat||n.pose==='sit').length,
    stand:v.filter(n=>!(n.seat||n.pose==='sit')).map(n=>[n.charId||n.name||'?', n.pose||'', +n.obj.position.x.toFixed(1), +n.obj.position.z.toFixed(1)]),
    named:v.filter(n=>n.charId).map(n=>[n.charId, !!(n.seat||n.pose==='sit')]), player:{seat:!!E.player.seat, x:+E.player.obj.position.x.toFixed(1), z:+E.player.obj.position.z.toFixed(1)},
    fold:F?{busy:Z.seats.filter((s,i)=>s.kind==='lecture'&&F.occupied(E,i)).length, busyUp:Z.seats.filter((s,i)=>s.kind==='lecture'&&F.occupied(E,i)&&F.ang[i]!==0).length}:null,
    fallback:((Z&&Z.lectFurn)||[]).map(g=>g.visible), formal:!!(Z&&Z.formal)}; })()"""


async def drain_free(pg, cdp, secs=360):
    t0 = time.time(); idle = 0
    while time.time() - t0 < secs:   # 開局：點對話、選第一個，到可以自由走動（連續 6 次沒有對話、選單、忙）
        s = await L.state(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); idle = 0; await pg.wait_for_timeout(500); continue
        if s['choices']: await L.tap(pg, cdp, '#choices button'); idle = 0; await pg.wait_for_timeout(900); continue
        if s['busy']: idle = 0; await pg.wait_for_timeout(700); continue
        idle += 1
        if idle >= 6 and await pg.evaluate("!!(GAME.G&&GAME.running)"): break
        await pg.wait_for_timeout(800)


async def boyaecon(pg, cdp, run):
    # 經濟系第一堂經原（博思 101，2024-09-09）：標題「從經濟系大一開始」（?y0）→ 照事件接事件的流程站著、點對話（選第一個），走到 9/9 那一堂
    u = URL + ('&' if '?' in URL else '?') + 'y0' + ('&nofastecon' if os.environ.get('BOYA_FULL') else '')
    await pg.goto(u); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()"); await pg.goto(u); await L.wait_loaded(pg); await pg.wait_for_timeout(1500); await P.init(pg)
    vis = await pg.evaluate("(()=>{ const b=document.getElementById('btnNewEcon'); return b?{t:b.textContent.trim(),vis:!!b.offsetParent}:null; })()")
    run.check('前置：標題有「從經濟系大一開始」（網址 ?y0）', bool(vis) and vis['vis'], J(vis))
    await L.tap(pg, cdp, '#btnNewEcon'); await pg.wait_for_timeout(2000)
    it = await pg.evaluate("(()=>{ const d=STORY.dayOfKey('2024-09-09'); const it=ECONFF.clsItem(GAME.G,d,'econ_principles_y0'); return it?{d, key:it.key, t0:it.t0, t1:it.t1, zone:it.room&&it.room.zone, room:it.room&&(it.room.room||it.room.id||it.room.name)||null, name:it.c&&it.c.name}:null; })()")
    run.note('9/9 那一堂：%s' % J(it))
    run.check('前置：9/9 經濟學原理在博思 101', bool(it) and it['zone'] == 'boya' and '101' in str(it.get('room')), J(it))
    if not it: return
    if os.environ.get('BOYA_FULL'):   # BB-B 16:0x：預設的「事件接事件」（ECONFF.short）把 cls 那幾步都 cut 掉，9/9 經原不演、不會進博思；?nofastecon 舊流程才會上那一堂
        await drain_free(pg, cdp)
        await P.jump(pg, cdp, run, '2024-09-09', it['t0'] - 0.5, zone='campus', pos=None, quiet=False, note='?nofastecon 舊流程：同一份進度跳到 9/9 上課前 30 分鐘')
        await P.phone_tab(pg, cdp, 'today')
        bt = await pg.evaluate("(k=>{ const e=[...document.querySelectorAll('#phoneBody [data-go]')].find(b=>b.dataset.go===k); return e?(e.textContent||'').trim():null; })", it['key'])
        run.note('手機「今天」那一堂的按鈕：%s' % bt)
        if bt: await L.tap(pg, cdp, '#phoneBody [data-go="%s"]' % it['key'])
    n0 = await P.say_hook(pg); t0 = time.time(); cap = None; cap2 = None; seen_boya = None; done = False
    while time.time() - t0 < 2400:
        c = await pg.evaluate("(k=>({zone:GAME.G.zone, day:GAME.G.day, h:+GAME.G.hour, done:!!(CLS.rec(GAME.G).done||{})[k]}))", it['key'])
        if c['done']: done = True
        s = await P.ts(pg)
        if c['zone'] == 'boya' and c['day'] == it['d']:
            if seen_boya is None: seen_boya = time.time()
            if cap is None and time.time() - seen_boya > 5:
                cap = await pg.evaluate(CLASSJS); await run.shot(pg, 'econ_class_a'); run.note('上課中（進教室 5 秒）：%s' % J(cap))
            elif cap is not None and cap2 is None and time.time() - seen_boya > 40:
                cap2 = await pg.evaluate(CLASSJS)
                await pg.evaluate("(()=>{ const C=GAME.E.cam; C.yaw=0; C.pitch=0.3; C.distTarget=5; C.manualT=1e9; })()"); await pg.wait_for_timeout(1500); await run.shot(pg, 'econ_class_b'); run.note('上課中（40 秒）：%s' % J(cap2))
        if done and not s['dlg'] and not s['ch'] and cap is not None: break
        if s['ch']: k, _ = P.pick_of(s['ch'], []); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        await L.phone_away(pg, cdp)   # 手機收起來（同 bbplay.wait_play）
        await pg.wait_for_timeout(1200)
    lines = await P.said(pg, n0)
    cls_lines = [l for l in lines if l[0] and ('魏' in l[0] or '教授' in l[0] or '老師' in l[0])]
    run.note('從開局到 9/9 下課，說的話最後 20 句：%s' % J(lines[-20:]))
    run.check('照玩家流程走到 9/9 經原，而且這一堂上完（CLS done）', done and cap is not None, J({'done': done, 'cap': bool(cap), 'secs': round(time.time() - t0)}))
    if cap:
        cc = cap2 or cap
        run.check('經原上課：在博思（正式模型、方塊桌椅藏著）', cc['zone'] == 'boya' and cc['formal'] and not any(cc['fallback']), J({k: cc[k] for k in ('zone', 'formal', 'fallback')}))
        run.check('經原上課：同學坐好（坐著 ≥ 3），站著的只有老師等少數（≤ 2）', cc['sit'] >= 3 and len(cc['stand']) <= 2, J({'sit': cc['sit'], 'stand': cc['stand'], 'named': cc['named']}))
        run.check('經原上課：有人坐的椅面都放下（busyUp＝0）', bool(cc['fold']) and cc['fold']['busyUp'] == 0, J(cc['fold']))
    run.check('經原上課：魏教授的課堂內容有演（說話的人是魏教授／老師）', bool(cls_lines), J(cls_lines[:4]))

async def boyab4(pg, cdp, run):
    # 法律系 B4 演講（大一下第 11 週週四 19:00 博思 101，ACTIVITIES B4）：預設流程裡看得到博思 101 的地方（LAWWW-B 16:04）。手機「今天」按去聽
    d = await pg.evaluate("(()=>{ const T=CALENDAR.TERMS.find(t=>t.id==='Y1S2'); const a=STORY.dayOfKey(T.start); let d=a+10*7; while(CALENDAR.dateOf(d).wd!==4) d++; return CALENDAR.dateOf(d).key; })()")
    st, dd = await P.base(pg, SAVE, d, 18.3, 'campus'); await P.load(pg, cdp, st, quiet=False)
    run.setup('[前置] 使用者存檔改到 %s（%s 第 %s 週）18:18 校園' % (dd['key'], dd['term'], dd['week']))
    it = await pg.evaluate("(()=>{ const q=(CLS.dayItems(GAME.G)||[]).find(x=>x.room&&x.room.zone==='boya'); return q?{key:q.key, t0:q.t0, t1:q.t1, room:q.room.room||null, name:(q.c&&q.c.name)||q.title||null}:null; })()")
    run.note('那一天博思的項目：%s' % J(it))
    run.check('前置：%s 手機「今天」有博思 101 的演講' % d, bool(it) and str(it.get('room')) == '101', J(it))
    if not it: return
    await P.phone_tab(pg, cdp, 'today')
    bt = await pg.evaluate("(k=>{ const e=[...document.querySelectorAll('#phoneBody [data-go]')].find(b=>b.dataset.go===k); return e?(e.textContent||'').trim():null; })", it['key'])
    run.note('手機按鈕：%s' % bt)
    if bt: await L.tap(pg, cdp, '#phoneBody [data-go="%s"]' % it['key'])
    n0 = await P.say_hook(pg); t0 = time.time(); cap = None; cap2 = None; seen = None
    while time.time() - t0 < 1500:
        c = await pg.evaluate("(()=>({zone:GAME.G.zone, h:+GAME.G.hour}))()")
        s = await P.ts(pg)
        if c['zone'] == 'boya':
            if seen is None: seen = time.time()
            if cap is None and time.time() - seen > 6:
                cap = await pg.evaluate(CLASSJS); await run.shot(pg, 'b4_a'); run.note('演講（進博思 6 秒）：%s' % J(cap))
            elif cap is not None and cap2 is None and time.time() - seen > 45:
                cap2 = await pg.evaluate(CLASSJS); await pg.evaluate("(()=>{ const C=GAME.E.cam; C.yaw=0; C.pitch=0.3; C.distTarget=5; C.manualT=1e9; })()"); await pg.wait_for_timeout(1500); await run.shot(pg, 'b4_b'); run.note('演講（45 秒）：%s' % J(cap2))
        if cap2 is not None and c['h'] > it['t1'] - 0.05 and not s['dlg']: break
        if s['ch']: k, _ = P.pick_of(s['ch'], ['坐', '聽']); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if c['h'] > it['t1'] + 0.5: break
        await pg.wait_for_timeout(1200)
    lines = await P.said(pg, n0); run.note('說的話（前 14 句）：%s' % J(lines[:14]))
    cc = cap2 or cap
    run.check('B4 演講：進了博思 101（正式模型、方塊桌椅藏著）', bool(cc) and cc['zone'] == 'boya' and cc['formal'] and not any(cc['fallback']), J(cc and {k: cc[k] for k in ('zone', 'formal', 'fallback')}))
    if cc:
        run.check('B4 演講：聽眾坐好（坐著 ≥ 5），站著的只有講者等少數（≤ 3）', cc['sit'] >= 5 and len(cc['stand']) <= 3, J({'sit': cc['sit'], 'stand': cc['stand'], 'player': cc['player']}))
        run.check('B4 演講：有人坐的椅面都放下（busyUp＝0）', bool(cc['fold']) and cc['fold']['busyUp'] == 0, J(cc['fold']))
    run.check('B4 演講：有演講內容（說了話）', len(lines) >= 3, J(lines[:6]))

async def main():
    run = L.Run('next91015_' + MODE + ('' if VP == 'landscape' else '_' + VP), OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        if VP == 'desktop':
            b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=L.ARGS)
            ctx = await b.new_context(viewport={'width': 1366, 'height': 768}, device_scale_factor=1, has_touch=True)
            pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        else:
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=(VP != 'portrait'))
        pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()"); await P.init(pg)
        await {'phone': phone, 'bball': bball, 'rooms': rooms, 'cafewin': cafewin, 'noodle': noodle, 'cafe2': cafe2, 'invite': invite, 'jacket': jacket, 'badclip': badclip, 'bigmap': bigmap, 'bballrain': bballrain, 'renart': renart, 'libla': libla, 'lawlib': lawlib, 'cafe2diag': cafe2diag, 'multiroom': multiroom, 'rtnight': rtnight, 'boya': boya, 'boyaecon': boyaecon, 'boyab4': boyab4}[MODE](pg, cdp, run)
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE)
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
