"""BB：QA-REPRO-1020 驗收（LAWWW 765ac675）：X70 女主角、X76 星期、X71 Café 客人。用使用者 9/25 週四 15:44 溫州街的存檔（v9.10.2 存的，星期記成週五）。
照玩家：標題「讀取」→ 看右上角、手機今天 → 走進 Café（14–18）→ 手機跳到晚上 → Café（18–22、學姊週四在）→ 試坐客人的椅子 →
[捷徑] 23:54 在 Café 等過午夜 → 回宿舍睡 → 9/26 週五早上手機「直接去上課」→ 教室裡找以安、走過去說話 → 總圖 → 中午 Café（11–14）。"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SNAP = """(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day), d2=CALENDAR.dateOf(G.day+Math.floor(G.hour/24)); return {day:G.day, real:d.key, realWd:d.wd%7, shown:d2.key, shownWd:d2.wd%7, h:+G.hour.toFixed(2), weekday:G.weekday, hud:(document.getElementById('clockT')||{}).textContent||'', zone:G.zone}; })()"""
PEOPLE = """(()=>{ const E=GAME.E; return E.npcs.filter(n=>n&&n.obj).map(n=>({id:n.charId||n.id||'', name:n.name||'', extra:!!n.isExtra, clerk:!!n.clerk, staff:n.staff||'', seat:!!n.seat, x:+n.obj.position.x.toFixed(1), z:+n.obj.position.z.toFixed(1), lv:n.lv|0, vis:n.obj.visible!==false&&!n.hidden})); })()"""
WD = '日一二三四五六'
bad = []; rep = []
def say(*a):
    s = ' '.join(str(x) for x in a); print(s, flush=True); rep.append(s)
async def drain(pg, cdp, pref=None, secs=120, log=None):
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s['choices']:
            c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; let e=null; for(const t of w){ e=bs.find(x=>x.textContent.trim().startsWith(t)); if(e) break; } e=e||bs.find(x=>/不|晚一點|之後/.test(x.textContent))||bs[bs.length-1]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,30)]; })(%s)" % json.dumps(pref or []))
            await L.touch_tap(cdp, c[0], c[1]); print('   ▶', c[2], flush=True)
            if log is not None: log.append('▶' + c[2])
            await pg.wait_for_timeout(900); continue
        if s['dlg']:
            if log is not None: log.append(s['dtext'])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if s['busy']: await pg.wait_for_timeout(600); continue
        if await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide')&&getComputedStyle(p).display!=='none'; })()"):
            await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b) b.click(); })()"); await pg.wait_for_timeout(500); continue
        await pg.wait_for_timeout(1000); s = await L.state(pg)
        if not (s['dlg'] or s['choices'] or s['busy']): return True
    return False
async def phone(pg, cdp, tab):
    if not await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide')&&getComputedStyle(p).display!=='none'; })()"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(t=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"'+t+'\"]'); if(b) b.click(); })(%s)" % json.dumps(tab)); await pg.wait_for_timeout(700)
    return await pg.evaluate("(()=>{ const b=document.querySelector('#phoneBody'); return {head:(b.innerText||'').split('\\n').filter(x=>x.trim()).slice(0,2).join(' ｜ '), on:[...b.querySelectorAll('.tth.on')].map(x=>x.textContent)}; })()")
async def close_phone(pg):
    await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b) b.click(); })()"); await pg.wait_for_timeout(500)
async def click_in_phone(pg, cdp, js_find, what):
    c = await pg.evaluate("(()=>{ const e=(%s); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.closest('.item')||e).textContent.trim().slice(0,40)]; })()" % js_find)
    if not c: say('   手機找不到', what); return False
    await L.touch_tap(cdp, c[0], c[1]); say('   手機：', c[2]); await pg.wait_for_timeout(1800); return True
async def go_place(pg, cdp, name):
    await phone(pg, cdp, 'places')
    ok = await click_in_phone(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>(b.closest('.item')||b).textContent.includes(%s))" % json.dumps(name), '地點 ' + name)
    if not ok: await close_phone(pg)
    await drain(pg, cdp, pref=['前往', '走過去', '去', '好', '確定', '出發'], secs=90); return ok
async def check_date(pg, cdp, run, tag):
    sn = await pg.evaluate(SNAP); ph = await phone(pg, cdp, 'today'); wk = await phone(pg, cdp, 'week'); await close_phone(pg)
    hd = sn['hud'].split(' ')
    exp_hud = '%d/%d 週%s' % (int(sn['shown'][5:7]), int(sn['shown'][8:10]), WD[sn['shownWd']])
    ok = ' '.join(hd[:2]) == exp_hud and sn['weekday'] == sn['realWd']
    say('[日期] %s：真正 %s（週%s）%.2f｜右上角「%s」｜手機今天「%s」｜課表亮「%s」｜G.weekday=%d' % (tag, sn['real'], WD[sn['realWd']], sn['h'], sn['hud'], ph['head'][:22], ''.join(wk['on'][:1]), sn['weekday']))
    if not ok: bad.append('X76 %s：右上角「%s」應該是「%s」（G.weekday=%d）' % (tag, sn['hud'], exp_hud, sn['weekday']))
    if sn['h'] < 24:
        md = ph['head'].split(' ')[0]; real = '%d/%d' % (int(sn['real'][5:7]), int(sn['real'][8:10]))
        if md != real: bad.append('X76 %s：手機今天「%s」不是 %s' % (tag, ph['head'][:16], real))
    await run.shot(pg, 'date_' + tag); return sn
async def cafe_count(pg, run, tag):
    ps = await pg.evaluate(PEOPLE); sn = await pg.evaluate(SNAP)
    clerk = [p for p in ps if p['clerk'] or p['staff'] == 'cafe']; zr = [p for p in ps if p['id'] == 'heroine_02']
    cust = [p for p in ps if p not in clerk and p not in zr]
    say('[Café] %s %.2f：客人 %d（%s）｜芷若 %d｜店員 %d' % (tag, sn['h'], len(cust), '、'.join((p['name'] or ('路人' if p['extra'] else p['id'])) for p in cust), len(zr), len(clerk)))
    await run.shot(pg, 'cafe_' + tag); return cust, ps
async def try_sit_customer_chair(pg, cdp, run):
    info = await pg.evaluate("""(()=>{ const E=GAME.E; const occ=E.npcs.filter(n=>n.seat&&n.obj); const out=[]; for(const n of occ){ const it=E.interactables.find(i=>i.seat&&Math.hypot(i.seat.x-n.seat.x,i.seat.z-n.seat.z)<0.3); out.push({who:n.name||(n.isExtra?'路人':n.charId), sx:n.seat.x, sz:n.seat.z, it:it?{x:it.x,z:it.z,label:it.label,hidden:!!it.hidden,disabled:!!it.disabled}:null}); } return out; })()""")
    say('   客人坐的位子與互動點：', json.dumps(info, ensure_ascii=False)[:500])
    tgt = next((q for q in info if q['it']), None)
    if not tgt: say('   客人的位子都沒有「坐下」互動點'); return True
    await L.go_to(pg, cdp, run, tgt['it']['x'], tgt['it']['z'], 0.6, '客人坐的椅子')
    lab = (await L.state(pg))['interact']; say('   走到 %s 坐的椅子旁，互動按鈕「%s」' % (tgt['who'], lab))
    sat = False
    if lab and '坐' in lab:
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500); sat = (await L.state(pg))['pose'] == 'sit'
        say('   按下去以後 pose=%s' % (await L.state(pg))['pose']); await run.shot(pg, 'cafe_sit_try')
        if sat: bad.append('X71 玩家坐上了 %s 坐的椅子' % tgt['who']); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    return not sat
async def enter_cafe(pg, cdp, run):
    if (await pg.evaluate("GAME.G.zone")) != 'wenzhou': await go_place(pg, cdp, '溫州街')
    ex = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='cafe'); return it?[it.x,it.z,it.radius||1.2]:null; })()")
    if ex and await L.go_to(pg, cdp, run, ex[0], ex[1], ex[2] * 0.7, 'Café 門口'):
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(6000)
    await drain(pg, cdp, secs=60); await pg.wait_for_timeout(12000)
    return (await pg.evaluate("GAME.G.zone")) == 'cafe'
async def leave_cafe(pg, cdp, run):
    ex = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='wenzhou'); return it?[it.x,it.z,it.radius||1.2]:null; })()")
    if ex and await L.go_to(pg, cdp, run, ex[0], ex[1], ex[2] * 0.7, 'Café 出口'):
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(5000)
    await drain(pg, cdp, secs=60)
async def skip_to(pg, cdp, t):
    await phone(pg, cdp, 'today')
    ok = await click_in_phone(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-skip]')].find(b=>Math.abs(+b.dataset.skip-%s)<0.11)" % t, '跳到 %s' % t)
    if not ok: await close_phone(pg)
    await drain(pg, cdp, secs=90); return ok
WHERE = "(ids=>{ const o={}; for(const id of ids){ try{ o[id]=STORY.whereIs(GAME,id); }catch(e){ o[id]=String(e); } } return o; })(['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05'])"
async def walk_exit(pg, cdp, run, to, label_hint=''):
    ex = await pg.evaluate("(t=>{ const its=GAME.E.interactables.filter(i=>i.exit&&i.exit.to===t); const P=GAME.E.player.obj.position; its.sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z)); const it=its[0]; return it?{x:it.x,z:it.z,r:it.radius||1.2,lv:it.lv|0,label:it.label}:null; })(%s)" % json.dumps(to))
    if not ex: say('   這一區沒有往 %s 的出口' % to); return False
    ok = await L.go_to(pg, cdp, run, ex['x'], ex['z'], ex['r'] * 0.7, ex['label'], lv=ex['lv'], max_s=400)
    if not ok: return False
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(5000); await drain(pg, cdp, secs=60)
    return (await pg.evaluate("GAME.G.zone")) == to
async def main():
    run = L.Run('lunch118', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await pg.evaluate("(s=>localStorage.setItem('fatiao3d_slot_1',s))(%s)" % json.dumps(open(SAVE, encoding='utf-8').read()))
        await pg.reload(); await L.wait_loaded(pg)
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        await L.touch_tap(cdp, c[0], c[1]); run.setup('標題「讀取」使用者 9/25 存檔'); await pg.wait_for_timeout(5000)
        await drain(pg, cdp, secs=60)
        await go_place(pg, cdp, '宿舍')
        bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
        if bed and await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床'):
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
        await drain(pg, cdp, pref=['睡到明天早上', '睡覺'], secs=150)
        await phone(pg, cdp, 'today')
        await click_in_phone(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-go]')].filter(b=>!/缺席/.test(b.textContent))[0]", '直接去上課')
        await drain(pg, cdp, pref=['還是去', '自己找位子'], secs=200)
        ps = await pg.evaluate(PEOPLE); an = next((p for p in ps if p['id'] == 'heroine_01'), None)
        if an:
            await L.go_to(pg, cdp, run, an['x'], an['z'] + 0.9, 1.3, '以安旁邊', lv=an['lv'])
            if (await L.state(pg))['interact']: await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2000); await drain(pg, cdp, pref=['就這樣'], secs=120)
        say('   認識以安：', json.dumps(await pg.evaluate("({met_an:!!GAME.G.flags.met_an, first:SOCIAL.has('heroine_01','FIRST_MET')})")))
        # 上課（坐下等下課）
        seat = await pg.evaluate("(()=>{ const P=GAME.E.player.obj.position; const its=GAME.E.interactables.filter(i=>i.seat||/上課|進入.*教室|101/.test(i.label||'')); its.sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z)); const it=its[0]; return it?{x:it.x,z:it.z,label:it.label}:null; })()")
        say('   找座位／教室門：', json.dumps(seat, ensure_ascii=False))
        if seat and await L.go_to(pg, cdp, run, seat['x'], seat['z'], 0.6, seat['label'] or '座位'):
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2000)
        t0 = time.time()
        while time.time() - t0 < 600:
            await drain(pg, cdp, pref=['坐', '還是去'], secs=60)
            sn = await pg.evaluate(SNAP)
            if sn['h'] >= 12.15: break
            if not (await L.state(pg))['busy'] and (await L.state(pg))['pose'] != 'sit':
                await skip_to(pg, cdp, 12)
            await pg.wait_for_timeout(2000)
        sn = await pg.evaluate(SNAP); say('   下課 %s %.2f' % (sn['zone'], sn['h']))
        # 走到 118 巷（照玩家：出教學館 → 校園後門）
        if sn['zone'] != 'campus': await walk_exit(pg, cdp, run, 'campus')
        ok = await walk_exit(pg, cdp, run, 'lane118')
        sn = await pg.evaluate(SNAP); say('   到 118 巷：%s %s %.2f' % (ok, sn['zone'], sn['h']))
        await run.shot(pg, 'lane118_arrive')
        LL = await pg.evaluate("L118_SHOP_LAYOUTS.omu")
        reg = await pg.evaluate("(()=>GAME.E.npcs.filter(n=>!n.isExtra&&n.obj).map(n=>({id:n.charId||n.id,name:n.name,x:+n.obj.position.x.toFixed(1),z:+n.obj.position.z.toFixed(1)})))()")
        say('   巷子裡有名字的人：', json.dumps(reg, ensure_ascii=False))
        it = await L.find_it(pg, '進' + LL['name'])
        if it and await L.go_to(pg, cdp, run, it['x'], it['z'], 0.8, '蛋包飯門口'):
            lab = (await L.state(pg))['interact']; say('   門口按鈕「%s」' % lab); await run.shot(pg, 'omu_door')
            await L.tap(pg, cdp, '#interact')
            for _ in range(40):
                if await pg.evaluate("GAME.G.zone==='l118_omu'&&!GAME.E.player.busy"): break
                await pg.wait_for_timeout(1000)
            await drain(pg, cdp, secs=30); await pg.wait_for_timeout(4000)
            inside = await pg.evaluate("(()=>GAME.E.npcs.filter(n=>!n.isExtra&&n.obj).map(n=>({id:n.charId||n.id,name:n.name,pose:n.pose,seat:!!n.seat,x:+n.obj.position.x.toFixed(1),z:+n.obj.position.z.toFixed(1)})))()")
            say('[118] 店裡有名字的人：', json.dumps(inside, ensure_ascii=False)); await run.shot(pg, 'omu_inside')
            if not any(q['id'] == 'heroine_01' for q in inside): bad.append('以安在門口等，進店以後沒有跟進來')
            elif not any(q['id'] == 'heroine_01' and (q['seat'] or q['pose'] == 'sit') for q in inside): bad.append('以安跟進來了但沒有坐下：' + json.dumps(inside, ensure_ascii=False))
            order = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>/^點餐/.test(i.label||'')); return it?{x:it.x,z:it.z,label:it.label}:null; })()")
            if order and await L.go_to(pg, cdp, run, order['x'], order['z'], 0.5, '櫃台'):
                h0 = await pg.evaluate("ADV.history.length"); m0 = await pg.evaluate("GAME.G.money")
                await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200); await drain(pg, cdp, secs=120)
                hist = await pg.evaluate("(n=>ADV.history.slice(n).map(q=>(q.name||'')+'：'+q.text))(%d)" % h0); m1 = await pg.evaluate("GAME.G.money")
                say('[118] 點餐：', json.dumps(hist, ensure_ascii=False), m0, '→', m1); await run.shot(pg, 'omu_after_order')
                if not any('幾位' in x for x in hist): bad.append('一起吃：招呼不是「幾位？裡面有位子。」')
                if not any(('以安' in x.split('：')[0] or '小安' in x.split('：')[0]) for x in hist): bad.append('一起吃：吃完沒有以安的那一句')
        else: bad.append('走不到蛋包飯研究所門口')
        json.dump({'report': rep, 'bad': bad}, open(os.path.join(OUT, 'lunch118.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
        run.check('118 巷和熟人一起吃飯', not bad, json.dumps(bad[:6], ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
