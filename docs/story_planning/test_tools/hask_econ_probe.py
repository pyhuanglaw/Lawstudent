"""BB-B 10-30（v9.10.14 最後候選 b38b112a8；AA_529 第 1 點，HASK.block 遇 stage econ 回 'econ'；LAWWW-B 04:14 加的一項）：經濟系那一年可昕不主動約。
照玩家：標題按「從經濟系大一開始」（btnNewEcon，網址 ?y0 才出現，開發中）→ 點對話、選第一個，到可以自由走動；
【捷徑】可昕熟、好感高（熟 70、信任 55、自在 50、她的戀愛 60、祐廷 40；認識、有聯絡方式）＝法律系那幾年她會主動約的程度；
【前置】同一份進度跳到 2024-09-04 起每個週三（週末校外是週三晚上傳）到 10/16 為止，每天 12:06 開始站著等到 12:40（HASK 每天 12:00 以後第一次決定今天傳不傳、傳哪一則），
看 G.flags.HASK 有沒有排可昕的邀約（排了、還沒傳也算）、手機有沒有她 hask_ 開頭的邀約訊息、HASK.block 那一天回什麼。
修正前（007000868）跑同一套＝她會排邀約（照預期 FAIL，證明這個測試抓得到）。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。用法：LW_TESTS=<工作樹>/tests python3 hask_econ_probe.py '<URL>/index.html?y0' <輸出資料夾>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import bbplay as P
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
KX = 'kexin'
READ = """(id=>{ const G=GAME.G, R=G.flags.HASK||{}, d=G.day; const sent=(R.sent||[]).filter(x=>x&&x.id===id).map(x=>({sid:x.sid,k:x.k,v:x.v,day:CALENDAR.dateOf(x.day).key,state:x.state,place:x.place||x.loc||null}));
  const msgs=(G.msgs||[]).filter(m=>m&&m.from===id&&m.ask&&String(m.ask.id||'').indexOf('hask_')===0).map(m=>({t:m.text,d:CALENDAR.dateOf(m.day).key}));
  let block=null; try{ block=HASK.block(G,id,d); }catch(e){ block='err:'+e.message; }
  return {key:CALENDAR.dateOf(d).key, h:+(+G.hour).toFixed(2), stage:G.stage||null, block, plan:R.plan==null?null:CALENDAR.dateOf(R.plan).key, sent, msgs}; })"""


async def main():
    run = L.Run('hask_econ', OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        dl = []; pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()"); await pg.goto(URL); await L.wait_loaded(pg); await pg.wait_for_timeout(1500)
        await P.init(pg)
        vis = await pg.evaluate("(()=>{ const b=document.getElementById('btnNewEcon'); return b?{t:b.textContent.trim(),vis:!!b.offsetParent}:null; })()")
        run.check('前置：標題有「從經濟系大一開始」（網址 ?y0）', bool(vis) and vis['vis'], J(vis))
        await L.tap(pg, cdp, '#btnNewEcon'); await pg.wait_for_timeout(2000)
        t0 = time.time(); idle = 0
        while time.time() - t0 < 360:   # 開局：點對話、選第一個，到可以自由走動（連續 6 次沒有對話、選單、忙）
            s = await L.state(pg)
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); idle = 0; await pg.wait_for_timeout(500); continue
            if s['choices']: await L.tap(pg, cdp, '#choices button'); idle = 0; await pg.wait_for_timeout(900); continue
            if s['busy']: idle = 0; await pg.wait_for_timeout(700); continue
            idle += 1
            if idle >= 6 and await pg.evaluate("!!(GAME.G&&GAME.running)"): break
            await pg.wait_for_timeout(800)
        st = await pg.evaluate("(()=>({stage:GAME.G.stage, key:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(2), zone:GAME.G.zone}))()")
        run.check('前置：經濟系開局（stage econ）', st['stage'] == 'econ', J(st))
        r0 = await P.prep(pg, cdp, run, """(id=>{ const G=GAME.G; const r=SOCIAL.rel(id); Object.assign(r,{fam:70,trust:55,comf:50,npcRom:60,rom:40}); if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.meet(id,'econ'); G.contacts=G.contacts||{}; if(G.contacts[id]==null) G.contacts[id]=G.day-1;
            G.flags.dating_kexin=false; return {stage:SOCIAL.stage?SOCIAL.stage(id):null, contact:G.contacts[id]}; })(%s)""" % J(KX), label='可昕熟、好感高（法律系那幾年她會主動約的程度）、認識、有聯絡方式')
        days = await pg.evaluate("""(()=>{ const o=[]; const a=STORY.dayOfKey('2024-09-04'), b=STORY.dayOfKey('2024-10-16'); for(let d=Math.max(a,GAME.G.day+1);d<=b;d++){ if(CALENDAR.dateOf(d).wd%7===3) o.push(CALENDAR.dateOf(d).key); } return o; })()""")
        run.note('要看的週三：%s' % J(days))
        rows = []
        for key in days:
            await P.jump(pg, cdp, run, key, 12.1, pos='keep', note='同一份進度跳到那個週三 12:06')
            ok = await P.wait_play(pg, cdp, 12.67, max_s=300)
            r = await pg.evaluate(READ + "(%s)" % J(KX)); r['waited'] = ok; rows.append(r); run.note('%s：%s' % (key, J(r)))
        await run.shot(pg, 'hask_last')
        allsent = {x['sid']: x for r in rows for x in r['sent']}; allmsgs = [m for r in rows for m in r['msgs']]
        run.check('AA_529 第 1 點：經濟系那一年（%s～%s 的週三）可昕沒有排任何主動約的邀約' % (days[0] if days else '?', days[-1] if days else '?'), bool(rows) and not allsent, J(list(allsent.values())))
        run.check('AA_529 第 1 點：手機沒有她 hask_ 的邀約訊息（貓空、碧潭那種）', bool(rows) and not allmsgs, J(allmsgs))
        run.check('AA_529 第 1 點：每一天 HASK.block 都是 econ', bool(rows) and all(r['block'] == 'econ' for r in rows), J([(r['key'], r['block']) for r in rows]))
        run.check('前置：每一天都有等到 12:40（HASK 那一天決定過）', bool(rows) and all(r['waited'] for r in rows), J([(r['key'], r['waited'], r['plan']) for r in rows]))
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'))
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
