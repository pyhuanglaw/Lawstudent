"""BB-B 10-30（v9.10.14 候選 92e9bca92；LAWWW-B 02:22 第 6 項）：AA_523 學姊第十六批——大四下交往中，週三書桌夜（3/28 研究單位回信）、書桌夜不擋她主動約（第 10 節）。照玩家：手機收訊息、用手機回、時間到了按「出發」、點對話、選選項。
MODE（環境變數）：
  desk  【前置】使用者存檔 → 2029-02-26（一）20:50 宿舍（409）；【捷徑】和學姊交往中（ROM.start、第 6 階、認識、聯絡方式）→ 等到 21:05 收「每週三晚上，研究室。」，手機回「好。」；
        【捷徑】SIS_DESK_NIGHTS＝3（之前去過三次，這一次是 again 那一段）→ 同一份進度跳到 3/28（三）20:40 宿舍，等出遊「研究室」21:00 照時間出發 →
        研究單位的回信（1-3）：「研究單位那邊，下午回信了。」「七月二號報到。……口試完一個多月。」，選「妳想去嗎？」＝「想。那邊在做的事，我的論文寫了一半。」，會合「論文還是要先寫完。」，記 SIS16_JOB_A＝desk；
        第 10 節：那一週排著書桌夜，HASK.storyOut（她那一週已經有劇情出遊＝不主動約）不算它
不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。用法：LW_TESTS=<工作樹>/tests MODE=desk python3 aa523_probe.py '<URL>/index.html' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import bbplay as P
from playwright.async_api import async_playwright
URL, OUT, SAVEF = sys.argv[1], sys.argv[2], sys.argv[3]
SAVE = json.load(open(SAVEF, encoding='utf-8'))
MODE = os.environ.get('MODE', 'desk')
J = lambda o: json.dumps(o, ensure_ascii=False)
SIS = 'heroine_05'
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
MSGS = "(th=>(GAME.G.msgs||[]).filter(m=>PHONE.th(m)===th).map(m=>({t:m.text,d:CALENDAR.dateOf(m.day).key})))"


async def main():
    run = L.Run('aa523_' + MODE, OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        await P.init(pg)
        d = await P.day_of(pg, '2029-02-26'); fl = {}
        for k, kk in ROOMS: fl[k] = (await P.day_of(pg, kk))['d']
        fl.update({'ROOM_Y4_ITEMS': [], 'BOX_KEPT_Y4': None, 'ROOM_Y3_ITEMS': [], 'ROOM_Y3_DISCARD': None})
        st, d = await P.base(pg, SAVE, '2029-02-26', 20.83, 'dorm', flags=fl); await P.load(pg, cdp, st)
        run.setup('[前置] 使用者存檔 → 2029-02-26（一）20:50 宿舍；%s' % J(fl))
        pre = await P.prep(pg, cdp, run, """(id=>{ const G=GAME.G; for(const k in G.flags) if(k.indexOf('dating_')===0) G.flags[k]=false; if(G.flags.romance) for(const k in G.flags.romance) if(k!==id) delete G.flags.romance[k];
            const r=SOCIAL.rel(id); Object.assign(r,{fam:Math.max(r.fam||0,70),trust:Math.max(r.trust||0,55),comf:Math.max(r.comf||0,50),npcRom:Math.max(r.npcRom||0,70),rom:Math.max(r.rom||0,60)});
            if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.meet(id,'lawlib'); G.contacts=G.contacts||{}; if(G.contacts[id]==null) G.contacts[id]=G.day-400;
            try{ ROM.start(G,id); }catch(e){} G.flags['dating_'+id]=true; if(G.flags.SIS_DATING_D==null) G.flags.SIS_DATING_D=STORY.dayOfKey('2028-12-24');
            return {partners:ROM.partners?ROM.partners(G):null, route:typeof R3!=='undefined'&&R3.route?R3.route(G):null, job:G.flags.SIS16_JOB_A==null?null:G.flags.SIS16_JOB_A}; })(%s)""" % J(SIS), label='只和學姊交往中（2028-12-24 起）、認識、聯絡方式')
        ok = await P.wait_hour(pg, cdp, 21.08, max_s=600)
        m = await pg.evaluate(MSGS + "('p:%s')" % SIS); t = [x['t'] for x in m if x['d'] == '2029-02-26']
        run.note('2/26 21:05：%s；p:%s 這一天 %s' % (ok, SIS, J(t)))
        run.check('前置：2/26 21:00 學姊「每週三晚上，研究室。」', '每週三晚上，研究室。' in t, J(t))
        body = await P.phone_answer(pg, cdp, 'p:%s' % SIS, '好。'); await P.phone_close(pg, cdp)
        run.check('前置：手機回「好。」', body is not None, J(body and body[-200:]))
        sn = await P.snapshot(pg)
        sn['flags']['SIS_DESK_NIGHTS'] = 3
        run.setup('【捷徑】SIS_DESK_NIGHTS＝3（之前三個週三都去了：這一次是 again 那一段）')
        dd = await P.jump(pg, cdp, run, '2029-03-28', 20.67, zone='dorm', pos=None, snap=sn, note='同一份進度')
        planned = await pg.evaluate("(()=>(GAME.G.outings||[]).filter(q=>q&&q.ev==='ev_sis_y4_desks').map(q=>({id:q.id,d:CALENDAR.dateOf(q.day).key,h:q.h,state:q.state})))()")
        run.note('排好的書桌夜：%s' % J(planned))
        await P.events_on(pg); n0s = await P.say_hook(pg)
        t0 = time.time(); seen = []; picked = []; opts = []
        while time.time() - t0 < 900:
            s = await P.ts(pg)
            if s['txt'] and (not seen or seen[-1] != [s['name'], s['txt']]): seen.append([s['name'], s['txt']])
            if s['ch']:
                opts.append([o['t'] for o in s['ch']])
                k, pk = P.pick_of(s['ch'], ['出發', '「妳想去嗎？」', '妳想去嗎'], decline=False); picked.append(s['ch'][k]['t'])
                await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
            if s['phone']: await L.phone_away(pg, cdp); continue
            if (any('論文還是要先寫完' in x[1] for x in seen) or await pg.evaluate("(([n,s])=>(window.__SAY||[]).slice(n).some(x=>x.t.indexOf(s)>=0))", [n0s, '論文還是要先寫完'])) and not s['busy']: break
            if s['h'] >= 23.9 or s['day'] > dd['d']: break
            await pg.wait_for_timeout(1500)
        lines = [x[1] for x in P.clean(seen)] + [t for _, t in await P.said(pg, n0s)]
        f = await pg.evaluate("(()=>({job:GAME.G.flags.SIS16_JOB_A==null?null:GAME.G.flags.SIS16_JOB_A, n:GAME.G.flags.SIS_DESK_NIGHTS|0, done:!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_sis16_job)}))()")
        run.note('3/28：選項 %s；選了 %s；台詞 %s；%s；%s' % (J(opts), J(picked), J(lines), J(f), J(await P.clock(pg))))
        await run.shot(pg, 'desk328')
        for w in ('研究單位那邊，下午回信了。', '七月二號報到。……口試完一個多月。', '想。那邊在做的事，我的論文寫了一半。', '論文還是要先寫完。'):
            run.check('1-3 有「%s」' % w, w in lines, J(lines))
        run.check('1-3 選項三個（恭喜／妳想去嗎／走過去看那封信）', any(set(o) >= {'「恭喜。」', '「妳想去嗎？」'} for o in opts), J(opts))
        run.check('1-3 記 SIS16_JOB_A＝desk', f['job'] == 'desk', J(f))
        run.check('第 6 節：輪流旁白那一句沒有出（這一晚換成回信）', not any(w in lines for w in ('（十一點。她的螢幕上還是第四章。你的筆記寫到第三頁。）', '（她把頭髮夾起來，又放下來。）')), J(lines))
        hk = await pg.evaluate("""(id=>{ const G=GAME.G, d=STORY.dayOfKey('2029-03-28'), wd=CALENDAR.dateOf(d).wd%%7, w=d-((wd+6)%%7);
            const q=(G.outings||[]).filter(x=>x&&x.ev==='ev_sis_y4_desks'&&x.day>=w&&x.day<w+7); return {deskThatWeek:q.length, storyOut:typeof HASK!=='undefined'&&HASK.storyOut?HASK.storyOut(G,id,w):null, skip:typeof HASK!=='undefined'&&HASK.OUT_SKIP?[...HASK.OUT_SKIP]:null}; })(%s)""" % J(SIS))
        run.note('第 10 節：%s' % J(hk))
        run.check('第 10 節：3/28 那一週排著書桌夜，它不算她那一週的劇情出遊（HASK.storyOut＝false）', hk['deskThatWeek'] >= 1 and hk['storyOut'] is False and 'ev_sis_y4_desks' in (hk['skip'] or []), J(hk))
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE)
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
