"""BB-C 10-28：NPC 站位的畫面＋照常觸發（LAWWW-C 07:55，開發分支 60805aa78＝LAWWW2 4e0b212f8 的站位）。
  MODE=copier：總圖一樓影印機 (11.4,2.6)；大一下第 7 週星期一 12:12，以安 (10.35,2.35)、芯慈 (10.35,2.95) 站在影印機前（兩個人都認識才演 ev_xc_copy）
  MODE=elev  ：霖澤館一樓電梯；大二上第 6 週星期一 15:15，宥辰 (3.2,-4.1)（原本 (4.6,-4.3) 擋在叫車鈕前）；ev_yc_elev_ask 照常觸發
做法（不是 iPhone：Playwright 手機橫向模擬、SwiftShader）：
  【前置】使用者存檔（day 14）改日期、時間、區域；關掉條件事件；【捷徑】用遊戲的 API 補前置（認識、聯絡方式、歌的私訊排程），存成快照再讀
  ① 人有沒有在那個位置、朝哪裡（朝 +x＝看著機器／電梯）、身體離家具的阻擋多遠；拍三張（入口、中距離、近看）
  ② 玩家觸控走到服務台、電梯叫車鈕：按鈕是不是「服務台」「搭電梯」；按電梯叫得出電梯面板
  ③ 打開條件事件（還原原本的 EVENTS.onEnter／tick），走開再走回來：劇情照常演、演完走得動
用法：LW_TESTS=<工作樹>/tests MODE=copier python3 spot_shot_probe.py '<URL>/index.html' <輸出資料夾> [存檔.json]；SHA＝記錄用"""
import os, sys, json, asyncio, time, copy, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; MODE = os.environ.get('MODE', 'copier')
SAVEF = sys.argv[3] if len(sys.argv) > 3 else '/tmp/claude-0/-home-user-Lawstudent/4f52e6f0-1e48-5c03-872f-171d129a03fd/scratchpad/bbtest/p0an/user_day14.json'
SAVE = json.load(open(SAVEF, encoding='utf-8')); SAVE = SAVE.get('G', SAVE)
J = lambda o: json.dumps(o, ensure_ascii=False)
CFG = {
  'copier': dict(term='Y1S2', wk=7, wd=1, hour=12.2, zone='library_hall', ev='ev_xc_copy',
                 who=[('heroine_01', '以安', 10.35, 2.35), ('classmate_xinci', '芯慈', 10.35, 2.95)],
                 views=[(0, 6.6, None), (7.2, 1.2, 0.9), (9.0, 1.4, 0.6)], look=(10.35, 2.65),
                 targets=[('服務台', 7.8, 3.25, 1.0), ('搭電梯', 10.4, -3.6, 0.8)], away=(3.0, 1.0),
                 prep="""()=>{ const G=GAME.G; for(const id of ['heroine_01','classmate_xinci']) if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.meet(id,'campus');
                   return {due:!!SUP497.copyDue(G), anMet:!!STORY.knows('heroine_01',G), xcMet:SOCIAL.has('classmate_xinci','FIRST_MET')}; }"""),
  'elev': dict(term='Y2S1', wk=6, wd=1, hour=15.25, zone='linze', ev='ev_yc_elev_ask',
               who=[('classmate_youchen', '宥辰', 3.2, -4.1)],
               views=[(6.6, 4.0, None), (5.6, 0.2, 0.9), (5.2, -2.4, 0.6)], look=(3.6, -4.0),
               targets=[('搭電梯', 4.6, -3.9, 0.7)], away=(6.0, 2.5),
               prep="""()=>{ const G=GAME.G, id='classmate_youchen', r=SOCIAL.rel(id); r.fam=Math.max(r.fam||0,30); r.trust=Math.max(r.trust||0,10); if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.meet(id,'linze');
                   INV.addContact(G,id); SUP497.songs(G); return {due:!!SUP497.elevAskDue(G), stage:SOCIAL.stage(id), contact:!!INV.hasContact(G,id), song5:!!PHONE.sent(G,'yc_song_5'), q:SUP497.qState(G), sideq:(typeof SIDEQ!=='undefined'&&SIDEQ.openIds)?SIDEQ.openIds(G):null}; }"""),
}[MODE]
DAY_FIND = """([term,wk,wd])=>{ for(let d=-400; d<2600; d++){ const t=CALENDAR.termOf(d); if(!t||t.id!==term||t.week!==wk) continue; const dt=CALENDAR.dateOf(d); if((dt.wd%7)!==(wd%7)) continue; if(CALENDAR.holiday&&CALENDAR.holiday(d)) continue; return {d, wd:dt.wd===7?0:dt.wd, key:dt.key}; } return null; }"""
NPCS = """(ids)=>{ const E=GAME.E, P=E.player.obj.position; return ids.map(id=>{ const n=E.npcs.find(m=>m.charId===id||m.id===id); if(!n) return {id, here:false};
  const p=n.obj.position; return {id, here:true, x:+p.x.toFixed(2), z:+p.z.toFixed(2), lv:n.lv|0, ry:+(n.obj.rotation.y).toFixed(2), beh:n.beh||null, pose:n.pose||null, hidden:!!n.hidden, leaving:!!n.leaving, label:n.label||null,
    stand:E.canStand(p.x,p.z,0.25,n.lv|0), dMe:+Math.hypot(p.x-P.x,p.z-P.z).toFixed(2)}; }); }"""
CLEAR = """([x,z,lv])=>{ const E=GAME.E; let best=9; for(let k=0;k<16;k++){ const a=k*Math.PI/8; for(let r=0.05;r<=1.5;r+=0.05){ if(!E.canStand(x+Math.cos(a)*r,z+Math.sin(a)*r,0.05,lv)){ if(r<best) best=r; break; } } } return +best.toFixed(2); }"""
ST = """(()=>{ const D=GAME.D, E=GAME.E, P=E.player.obj.position, ch=document.getElementById('choices'), it=document.getElementById('interact');
  return {running:(typeof EVENTS!=='undefined'?EVENTS.running:null)||null, depth:D.busyDepth|0, dlg:!!D.active, txt:((document.getElementById('dlgName').textContent||'')+'｜'+(D.full||'')).slice(0,70),
    ch:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(b=>b.textContent.slice(0,24)):[], busy:!!E.player.busy, zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2),
    me:[+P.x.toFixed(2),+P.z.toFixed(2),E.player.lv|0], it:(it&&!it.classList.contains('hide'))?(document.getElementById('interactLabel').textContent||''):''}; })()"""


async def settle(pg, cdp):
    await pg.wait_for_timeout(6000); await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)


async def main():
    run = L.Run('spot_' + MODE, OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        await pg.evaluate("window.__EVO={a:EVENTS.onEnter,b:EVENTS.tick}")
        d = await pg.evaluate(DAY_FIND, [CFG['term'], CFG['wk'], CFG['wd']])
        st = copy.deepcopy(SAVE); st.pop('_stuck', None); st.pop('_busy', None)
        st.update(day=d['d'], weekday=d['wd'], hour=CFG['hour'], zone=CFG['zone'], pos=None)
        st['invites'] = [v for v in st.get('invites', []) if v.get('state') != 'going']
        await L.load_state(pg, st, quiet_events=True, quiet_phone=True); await settle(pg, cdp)
        run.setup('[前置] 使用者存檔（day 14）改到 %s（%s 第 %d 週星期%d）%.2f 時 %s；關掉條件事件' % (d['key'], CFG['term'], CFG['wk'], CFG['wd'], CFG['hour'], CFG['zone']))
        pr = await pg.evaluate(CFG['prep']); run.setup('[捷徑] 用遊戲的 API 補前置：%s' % J(pr))
        snap = await pg.evaluate("()=>GAME.snapshot()")
        await L.load_state(pg, snap, quiet_events=True, quiet_phone=True); await settle(pg, cdp)
        pr2 = await pg.evaluate(CFG['prep'])
        run.check('前置：劇情條件成立（due）', bool(pr2.get('due')), J(pr2))
        ids = [w[0] for w in CFG['who']]
        npcs = None
        for _ in range(40):
            npcs = await pg.evaluate(NPCS, ids)
            if all(n['here'] for n in npcs): break
            await pg.wait_for_timeout(500)
        run.note('NPC：%s' % J(npcs))
        for (cid, nm, x, z), n in zip(CFG['who'], npcs):
            if not n['here']: run.check('①%s 在場' % nm, False, J(n)); continue
            dd = math.hypot(n['x'] - x, n['z'] - z)
            run.check('①%s 站在 (%.2f,%.2f)（差 %.2f m）' % (nm, x, z, dd), dd < 0.35, J(n))
            face = abs(((n['ry'] - math.pi / 2) + math.pi) % (2 * math.pi) - math.pi)
            run.check('①%s 朝 +x（看著機器／電梯；rotation.y≈1.57，差 %.2f rad）' % (nm, face), face < 0.6, J(n))
            cl = await pg.evaluate(CLEAR, [n['x'], n['z'], n['lv']])
            run.check('①%s 身體離家具的阻擋 %.2f m（> 0.25＝不穿模）' % (nm, cl), cl > 0.25, str(cl))
        # 三張：入口、中距離、近看（玩家觸控走過去，鏡頭轉向她們）
        for k, (vx, vz, near) in enumerate(CFG['views']):
            if near is not None:
                ok = await L.go_to(pg, cdp, run, vx, vz, near, '看站位 %d' % k, max_s=240)
                if not ok: run.note('看站位 %d 沒走到（%s）' % (k, J(await pg.evaluate(ST))))
            await L.turn_camera_to(pg, cdp, CFG['look'][0], CFG['look'][1]); await pg.wait_for_timeout(1500)
            await run.shot(pg, 'view%d' % k)
        # ② 互動點
        for lab, tx, tz, near in CFG['targets']:
            ok = await L.go_to(pg, cdp, run, tx, tz, near, lab, max_s=300)
            s = await pg.evaluate(ST)
            run.check('②觸控走到「%s」，按鈕是「%s」' % (lab, lab), ok and lab in s['it'], J(s))
            if lab == '搭電梯' and lab in s['it']:
                await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
                pan = await pg.evaluate("(()=>{ const ps=[...document.querySelectorAll('.panel,#elevPanel,[id*=elev],[class*=elev]')].filter(e=>e.offsetParent&&e.getBoundingClientRect().width>40); const ch=document.getElementById('choices'); return {panels:ps.map(e=>e.id||e.className).slice(0,4), ch:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(b=>b.textContent.slice(0,16)):[], busy:!!GAME.E.player.busy}; })()")
                run.note('按電梯以後：%s' % J(pan)); await run.shot(pg, 'elev_panel')
                run.check('②按得到電梯（出現樓層按鈕／選項）', bool(pan['panels'] or pan['ch']), J(pan))
                await L.close_panels(pg, cdp); await pg.wait_for_timeout(800)
                for _ in range(6):
                    s = await pg.evaluate(ST)
                    if not s['ch'] and not s['dlg']: break
                    if s['ch']: await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const b=bs.find(x=>/取消|算了|不用|關閉|離開/.test(x.textContent))||bs[bs.length-1]; if(b) b.click(); })()")
                    elif s['dlg']: await L.tap(pg, cdp, '#dlg')
                    await pg.wait_for_timeout(800)
        # ③ 打開條件事件，走開再走回來
        await pg.evaluate("(()=>{ EVENTS.onEnter=window.__EVO.a; EVENTS.tick=window.__EVO.b; })()")
        run.setup('[捷徑] 還原條件事件（EVENTS.onEnter／tick），走開再走回來')
        ev_on = lambda s: bool(s.get('dlg') or s.get('choices'))
        await L.go_to(pg, cdp, run, CFG['away'][0], CFG['away'][1], 0.9, '走開', max_s=240, stop=ev_on)   # 還站在觸發範圍裡（電梯叫車鈕離宥辰 1.4 m）：一還原就可能開演，要停下來看
        lx, lz = CFG['who'][0][2], CFG['who'][0][3]
        if not ev_on(await L.state(pg)):
            await L.go_to(pg, cdp, run, lx - 1.2, lz, 0.6, '走回來', max_s=240, stop=ev_on)
        seen = None; lines = []; t0 = time.time()
        while time.time() - t0 < 240:
            s = await pg.evaluate(ST)
            if s['running'] and not seen: seen = s['running']
            if s['ch']:
                run.note('選項：%s' % J(s['ch']))
                await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const b=bs.find(x=>!x.classList.contains('dim'))||bs[0]; if(b) b.click(); })()"); await pg.wait_for_timeout(800); continue
            if s['dlg']:
                if not lines or lines[-1] != s['txt']: lines.append(s['txt'])
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
            if seen and not s['running'] and not s['busy'] and not s['depth']: break
            if not seen and time.time() - t0 > 60: break
            await pg.wait_for_timeout(500)
        done = await pg.evaluate("id=>!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done[id])", CFG['ev'])
        run.note('劇情：%s；句子：%s' % (seen, J(lines[:14])))
        run.check('③%s 照常觸發、演完' % CFG['ev'], seen == CFG['ev'] and done, J({'seen': seen, 'done': done}))
        await run.shot(pg, 'after_event')
        a = await pg.evaluate(NPCS, ids); run.note('演完以後 NPC：%s' % J(a))
        moved, n, sx = await L.push_until(pg, cdp, 0, -60, 0.3, max_pushes=3, ms=1200)
        if moved < 0.3: moved, n, sx = await L.push_until(pg, cdp, 0, 60, 0.3, max_pushes=2, ms=1200)
        run.check('③演完推搖桿走得動', moved >= 0.3, '%.2f m' % moved)
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE)
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
