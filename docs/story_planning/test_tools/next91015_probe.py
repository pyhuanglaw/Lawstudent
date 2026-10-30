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
不是 iPhone：Playwright＋SwiftShader。用法：LW_TESTS=<工作樹>/tests MODE=<上面> python3 next91015_probe.py '<URL>/index.html' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, re, math, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import bbplay as P
from playwright.async_api import async_playwright
URL, OUT, SAVEF = sys.argv[1], sys.argv[2], sys.argv[3]
SAVE = json.load(open(SAVEF, encoding='utf-8'))
MODE = os.environ.get('MODE', 'phone')
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
            await pg.evaluate("(()=>{ const E=GAME.E; E.placeAt(E.player,0,0.5,0); const C=E.cam; C.yaw=0; C.pitch=0.12; C.manualT=1e9; })()"); await pg.wait_for_timeout(2500)
            await run.shot(pg, 'cafe_reentry_yaw0')
    run.check('Café：拍完（窗景要看截圖：白天、晚上、進兩次）', True, '')


async def main():
    run = L.Run('next91015_' + MODE, OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()"); await P.init(pg)
        await {'phone': phone, 'bball': bball, 'rooms': rooms, 'cafewin': cafewin}[MODE](pg, cdp, run)
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE)
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
