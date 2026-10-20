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
async def main():
    run = L.Run('x76c', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await pg.evaluate("(s=>localStorage.setItem('fatiao3d_slot_1',s))(%s)" % json.dumps(open(SAVE, encoding='utf-8').read()))
        await pg.reload(); await L.wait_loaded(pg)
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        await L.touch_tap(cdp, c[0], c[1]); run.setup('標題「讀取」使用者 9/25 存檔（存檔記週五）'); await pg.wait_for_timeout(5000)
        await drain(pg, cdp, secs=60)
        await check_date(pg, cdp, run, 'T1_load')
        # 作息：週四 14:00 有課的同學在教室
        wq = await pg.evaluate("(()=>{ const G=GAME.G, h0=G.hour; G.hour=14; const out={}; for(const id of ['heroine_01','heroine_03','zhe','classmate_bohan','classmate_xinci']){ try{ out[id]=STORY.whereIs(GAME,id); }catch(e){ out[id]=String(e); } } G.hour=h0; return {wd:CALENDAR.dateOf(G.day).wd, weekday:G.weekday, where:out}; })()")
        say('[X76] 週四 14:00 作息（STORY.whereIs，只查不改）：%s' % json.dumps(wq, ensure_ascii=False))
        # 過午夜
        await pg.evaluate("(()=>{ GAME.G.hour=23.92; GAME.E.hour=23.92; })()"); run.setup('[捷徑] 23:55 熬夜')
        for i in range(90):
            if (await pg.evaluate(SNAP))['h'] >= 24.05: break
            await close_phone(pg); await pg.wait_for_timeout(1000)
        await drain(pg, cdp, secs=30); await check_date(pg, cdp, run, 'T2_after_midnight')
        # 跨午夜的出遊：00:15 出發、走 20 分鐘
        r = await pg.evaluate("(()=>{ const G=GAME.G; const ok=OUT.plan(G,{id:'bb_x76c',ev:'ev_kai_sunday_supper',day:G.day,h:G.hour+0.25,late:0.5,place:'宿舍旁的滷味攤',title:'宵夜（BB 測試）',travel:'走過去約 20 分鐘',travelH:0.34}); return {ok, wd:G.weekday, real:CALENDAR.dateOf(G.day).wd%7}; })()")
        run.setup('[捷徑] 過了午夜排一個出遊（宵夜，走 20 分鐘）：%s' % json.dumps(r))
        for i in range(60):
            s = await L.state(pg)
            if s['choices']: break
            await pg.wait_for_timeout(1000)
        await drain(pg, cdp, pref=['出發'], secs=300)
        await check_date(pg, cdp, run, 'T3_after_outing_cross_midnight')
        # 睡覺
        await go_place(pg, cdp, '宿舍')
        bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
        if bed and await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床'):
            for k in range(4):
                await close_phone(pg); await pg.wait_for_timeout(800); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
                if (await L.state(pg))['choices']: break
        await drain(pg, cdp, pref=['睡到明天早上', '睡到明天', '睡覺'], secs=150)
        await check_date(pg, cdp, run, 'T4_next_morning')
        # 存檔 → 重新整理 → 讀檔
        await pg.evaluate("(()=>{ if(GAME.saveSlot) GAME.saveSlot(2); else if(GAME.save) GAME.save(2); })()")
        await pg.evaluate("(()=>{ const t=[...document.querySelectorAll('button')].find(b=>/存檔/.test(b.textContent)&&b.offsetParent&&!/讀取/.test(b.textContent)); if(t) t.click(); })()"); await pg.wait_for_timeout(900)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='存檔'); const e=b.find(x=>x.closest('.item')&&x.closest('.item').textContent.includes('欄位 2')); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500); await drain(pg, cdp, pref=['覆蓋', '確定', '存'], secs=20)
        before = await pg.evaluate(SNAP); say('   存檔前：', json.dumps(before, ensure_ascii=False))
        await pg.reload(); await L.wait_loaded(pg)
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b.find(x=>x.closest('.item')&&x.closest('.item').textContent.includes('欄位 2')); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(5000); await drain(pg, cdp, secs=40)
        else: bad.append('找不到欄位 2 的讀取（存檔沒成功？）')
        await check_date(pg, cdp, run, 'T5_reload')
        json.dump({'report': rep, 'bad': bad}, open(os.path.join(OUT, 'x76c.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
        run.check('X76 讀檔、過午夜、跨日出遊、睡覺、存讀檔：右上角＝日曆、手機一致', not bad, json.dumps(bad[:8], ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
