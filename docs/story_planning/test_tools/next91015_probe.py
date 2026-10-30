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
  noodle  NDL-PRESENT-1030：麵店日 9/30（二）17:55 從公館走進阿鳳麵店（【捷徑】加入麵店團、認識四位）：長桌閒聊開口的人都真的坐在店裡（3D 有這個人）；
          10/2（四）20:40 再走進去：麵店團都走了（作息 20:30），不演閒聊（使用者 04:3x「出現麵店團的人對話 但根本沒有在遊戲內出現」）。
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
PRESENT = """(()=>GAME.E.npcs.filter(n=>n.obj&&!n.hidden&&n.charId).map(n=>({id:n.charId, name:n.name||null, nm:(typeof SOCIAL!=='undefined'&&SOCIAL.npcName)?SOCIAL.npcName(n.charId):null, sit:!!n.seat})))()"""


async def door_to(pg, cdp, run, to, label, max_s=200):
    it = await pg.evaluate("(to=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to===to); return it?[it.x,it.z,it.label]:null; })", to)
    if not it: run.note('%s：找不到往 %s 的門' % (label, to)); return False
    await L.go_to(pg, cdp, run, it[0], it[1], 0.9, it[2], max_s=max_s); await L.tap(pg, cdp, '#interact')
    for _ in range(40):
        await pg.wait_for_timeout(1000)
        if await pg.evaluate("GAME.G.zone") == to: return True
    return False


async def noodle(pg, cdp, run):
    st, d = await P.base(pg, SAVE, '2025-09-30', 17.9, 'gongguan'); await P.load(pg, cdp, st, quiet=False)
    run.setup('[前置] 使用者存檔改到 %s（%s 第 %s 週）17:54 公館' % (d['key'], d['term'], d['week']))
    await P.prep(pg, cdp, run, """(T=>{ const G=GAME.G; PHONE.join(G,'noodle_team','麵店團'); for(const id of T.concat(['heroine_03','heroine_01'])){ if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.remember(id,'FIRST_MET',''); } G.flags.met_yu=true;
        return {inGroup:PHONE.inGroup(G,'noodle_team'), noodleDay:STORY.noodleDay(G.day)}; })(%s)""" % J(TEAM), quiet=False, label='加入麵店團、認識阿哲、Alison、柏翰、芯慈')
    snap = await P.snapshot(pg)
    for tag, key, hh, want in (('1800', '2025-09-30', 17.9, True), ('2040', '2025-10-02', 20.6, False)):
        if tag != '1800': await P.jump(pg, cdp, run, key, hh, zone='gongguan', snap=snap, quiet=False)
        it = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='noodle'); return it?[it.x,it.z]:null; })()")
        if it: await P.place_near(pg, run, it[0], it[1], 5.0, what='阿鳳麵店門口')
        n0 = await P.say_hook(pg); day = await pg.evaluate("GAME.G.day")
        ok = await door_to(pg, cdp, run, 'noodle', tag)
        await pg.wait_for_timeout(1500); pres0 = await pg.evaluate(PRESENT); await run.shot(pg, 'noodle_%s_in' % tag)
        talk_pres = None; t0 = time.time(); talked = False
        while time.time() - t0 < 60:
            s = await P.ts(pg)
            if s['dlg'] or s['ch']:
                if talk_pres is None: talk_pres = await pg.evaluate(PRESENT); await run.shot(pg, 'noodle_%s_talk' % tag)
                r = await P.dialog(pg, cdp, run, max_s=120, tag='noodle_%s' % tag); talked = True
            if await pg.evaluate("(d=>GAME.G.flags.ndlTalkDay===d)", day) and not (await P.ts(pg))['dlg']: break
            await pg.wait_for_timeout(1500)
        lines = await P.said(pg, n0); ndl = await pg.evaluate("(d=>GAME.G.flags.ndlTalkDay===d)", day)
        pres = talk_pres or pres0; names = set()
        for q in pres: names |= {q['name'], q['nm']}
        team_here = sorted({q['id'] for q in pres0 if q['id'] in TEAM})
        run.note('%s 進門：%s｜店裡的人 %s｜閒聊開始時店裡 %s｜說了 %s' % (tag, ok, J(pres0), J(talk_pres), J(lines)))
        if want:
            speak = [l for l in lines if l[0] and l[0] not in ('祐廷', '你') and not l[0].startswith('（')]
            missing = sorted({l[0] for l in speak if l[0] not in names})
            run.check('9/30（二）18:00 走進麵店：麵店團有人坐在店裡（3D）', ok and len(team_here) >= 1, J(team_here))
            run.check('9/30（二）18:00：長桌閒聊有演', ndl, J(lines[:6]))
            run.check('9/30（二）18:00：閒聊裡開口的每一個人都真的在店裡（3D 有這個人）', ndl and not missing, J({'missing': missing, 'names': sorted(x for x in names if x)}))
        else:
            run.check('10/2（四）20:40 走進麵店：麵店團四位都不在（作息 20:30 走）', ok and not team_here, J(team_here))
            run.check('10/2（四）20:40：沒有長桌閒聊（人不在就不演）', not ndl, J(lines[:6]))
        await run.shot(pg, 'noodle_%s_after' % tag)


async def cafe2(pg, cdp, run):
    st, d = await P.base(pg, SAVE, '2025-09-27', 14.0, 'l118_cafe2'); await P.load(pg, cdp, st); await pg.wait_for_timeout(3000)
    run.setup('[前置] 使用者存檔改到 %s 14:00 慢讀咖啡（118 巷）' % d['key'])
    its = await pg.evaluate("(()=>GAME.E.interactables.filter(i=>i.seat).map(i=>({x:+i.x.toFixed(2),z:+i.z.toFixed(2),label:i.label,study:!!i.study,lift:!!(i.seat&&i.seat.lift)})))()")
    run.note('慢讀的座位：%s' % J(its)); await run.shot(pg, 'cafe2_in')
    desk = [i for i in its if i['label'] == '坐下讀書']
    run.check('慢讀：至少兩個座位寫「坐下讀書」', len(desk) >= 2, J(its))
    run.check('慢讀：吧檯高腳椅不寫「坐下讀書」', all(i['label'] != '坐下讀書' for i in its if i['lift']), J([i for i in its if i['lift']]))
    if not desk: return
    pp = await pg.evaluate("(()=>{ const p=GAME.E.player.obj.position; return [p.x,p.z]; })()")
    tg = sorted(desk, key=lambda i: math.hypot(i['x'] - pp[0], i['z'] - pp[1]))[0]
    await L.go_to(pg, cdp, run, tg['x'], tg['z'], 0.6, '坐下讀書的座位', max_s=200, stop=lambda s: s['interact'].startswith('坐下讀書'))
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
        run.check('%s：第一層不超過 8 列' % nm, bool(top) and len(top) <= 8, len(top or []))
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
    await L.go_to(pg, cdp, run, 16, -85, 1.2, '社科院正門', max_s=200)
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
        await {'phone': phone, 'bball': bball, 'rooms': rooms, 'cafewin': cafewin, 'noodle': noodle, 'cafe2': cafe2, 'invite': invite, 'jacket': jacket, 'badclip': badclip, 'bigmap': bigmap, 'bballrain': bballrain, 'renart': renart, 'libla': libla}[MODE](pg, cdp, run)
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE)
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
