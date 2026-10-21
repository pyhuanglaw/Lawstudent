"""BB（帳號 A）2026-10-21：8/30 早上在法律系宿舍選「睡到傍晚（不設鬧鐘）」會不會錯過 14:00 載可昕（E37）。
起因：aa300 ff（94eba942）8/29 晚上的床邊選單「睡到明天下午 14:00」後面有提醒「但約好的時間：臺北的家樓下 14:00」，8/30 早上的「睡到傍晚 18:00」沒有提醒。
照玩家：標題「從法律系開始」新遊戲 → 對話點過去、選項照偏好（晚上睡到早上、出發）→ 8/30 07:30 以後走到床邊 → 看選單（記下每一個選項的字）→ 選「睡到傍晚」
→ 記下醒來的時間、有沒有被叫醒、E37 有沒有演、可昕的訊息。Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests python3 oversleep_probe.py '<URL>/index.html?turbo' <輸出資料夾>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
SNAP = """(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day); return {key:d.key, h:+(+G.hour).toFixed(2), zone:G.zone, stage:G.stage, e37:!!((G.events&&G.events.done)||{}).ev_y0_e37, home:!!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G))}; })()"""
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[]; const k=()=>{ try{ const G=GAME.G; return CALENDAR.dateOf(G.day).key+' '+(+G.hour).toFixed(2); }catch(e){ return ''; } };
  const o=ADV.log; ADV.log=function(n,t){ try{ window.__LOG.push(k()+' '+(n?n+'：':'')+t); }catch(e){} return o.apply(this,arguments); };
  if(GAME.titleCard&&!GAME.titleCard.__bb){ const tc=GAME.titleCard; const f=function(t,s){ try{ window.__LOG.push(k()+' CARD:'+t+(s?'｜'+s:'')); }catch(e){} return tc.apply(this,arguments); }; f.__bb=1; GAME.titleCard=f; } })()"""
def say(*a): print(' '.join(str(x) for x in a), flush=True)


async def choose(pg, cdp, pref):
    cs = await pg.evaluate("[...document.querySelectorAll('#choices button')].filter(b=>!b.disabled).map(b=>b.textContent.trim())")
    t = next((c for w in pref for c in cs if c.startswith(w)), None) or (cs[0] if cs else None)
    if not t: return None
    c = await pg.evaluate("(t=>{ const e=[...document.querySelectorAll('#choices button')].find(b=>b.textContent.trim()===t); e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(t))
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900); say('   ▶ %s ／ %s' % (t[:34], [x[:14] for x in cs])); return t


async def main():
    run = L.Run('oversleep', OUT); res = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.tap(pg, cdp, '#btnNewLaw'); run.setup('標題「從法律系開始」（新遊戲）')
        for k in range(60):
            if await pg.evaluate("!!(GAME.G&&GAME.running)"): break
            await pg.wait_for_timeout(1000)
        await pg.evaluate(HOOK)
        t0 = time.time(); idle = 0; last = None
        while time.time() - t0 < 2400:
            sn = await pg.evaluate(SNAP)
            if sn['key'] != last: last = sn['key']; say('  [%5.1f 分] %s' % ((time.time() - t0) / 60, json.dumps(sn, ensure_ascii=False)))
            if sn['key'] >= '2025-08-30' and sn['h'] >= 7.4 and not sn['e37']:
                s = await L.state(pg)
                if not (s['dlg'] or s['choices'] or s['busy']): break
            s = await L.state(pg)
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); idle = 0; continue
            if s['choices']: await choose(pg, cdp, ['睡到明天早上', '出發', '好', '「好']); idle = 0; continue
            if await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide'); })()"):
                pend = await pg.evaluate("(typeof PHONE!=='undefined'&&PHONE.pending)?PHONE.pending(GAME.G).map(m=>({id:m.ask.id, th:PHONE.th(m), opts:m.ask.opts.map(o=>o.t)})):[]")
                if pend:   # 要回的：點那個對話、選第一個（答應）
                    m = pend[0]
                    await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"msg\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(600)
                    await pg.evaluate("(th=>{ const e=[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===th); if(e) e.click(); })(%s)" % json.dumps(m['th'])); await pg.wait_for_timeout(600)
                    await pg.evaluate("(a=>{ const e=[...document.querySelectorAll('#phoneBody [data-ask]')].find(b=>b.dataset.ask===a); if(e) e.click(); })(%s)" % json.dumps('%s|0' % m['id'])); await pg.wait_for_timeout(900)
                    say('   手機回覆 %s：%s' % (m['id'], m['opts'][:1]))
                await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(700); continue
            if s['busy']: await pg.wait_for_timeout(700); continue
            idle += 1
            if idle >= 3 and not sn['home'] and (sn['h'] >= 21 or sn['h'] < 7):   # 晚上空下來：去床邊睡（玩家會做的）
                bed = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
                if bed and await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床', max_s=90): await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
                idle = 0; continue
            await pg.wait_for_timeout(1500)
        sn = await pg.evaluate(SNAP); say('   到了：%s' % json.dumps(sn, ensure_ascii=False)); res['start'] = sn
        if sn['key'] != '2025-08-30' or sn['e37']:
            run.check('到得了 8/30 早上（E37 前）', False, json.dumps(sn, ensure_ascii=False)); await b.close(); run.finish(); return
        bed = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
        ok = bool(bed) and await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床', max_s=120)
        if ok: await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1800)
        cs = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())"); res['menu'] = cs
        await run.shot(pg, 'bed_menu_0830'); say('   8/30 %.2f 床邊選單：%s' % (sn['h'], cs))
        t = next((c for c in cs if c.startswith('睡到傍晚')), None)
        if not t: run.check('8/30 早上床邊有「睡到傍晚」', False, json.dumps(cs, ensure_ascii=False)); await b.close(); run.finish(); return
        warn = '約' in t
        await choose(pg, cdp, ['睡到傍晚'])
        t1 = time.time(); woke = None
        while time.time() - t1 < 900:
            s = await L.state(pg); sn2 = await pg.evaluate(SNAP)
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
            if s['choices']:
                cs2 = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
                if woke is None: woke = {'at': sn2, 'choices': cs2}; await run.shot(pg, 'woke_choices'); say('   醒來（或被叫）時：%s 選項 %s' % (json.dumps(sn2, ensure_ascii=False), cs2))
                await choose(pg, cdp, ['出發', '好']); continue
            if s['busy']: await pg.wait_for_timeout(700); continue
            if sn2['e37'] or sn2['h'] >= 18.5: break
            await pg.wait_for_timeout(1500)
        end = await pg.evaluate(SNAP); log = await pg.evaluate("window.__LOG||[]")
        kx = await pg.evaluate("(GAME.G.msgs||[]).filter(m=>m.from==='kexin'&&CALENDAR.dateOf(m.day).key==='2025-08-30').map(m=>m.text)")
        res.update({'warn_in_option': warn, 'woke': woke, 'end': end, 'kexin_0830': kx, 'log_tail': log[-12:]})
        json.dump(res, open(os.path.join(OUT, 'oversleep.json'), 'w'), ensure_ascii=False, indent=1)
        say('   結束：%s；可昕 8/30 的訊息：%s' % (json.dumps(end, ensure_ascii=False), kx)); say('   台詞（最後 12）：%s' % json.dumps(log[-12:], ensure_ascii=False))
        run.check('8/30 早上選「睡到傍晚」：要嘛選項有約好的提醒、要嘛 14:00 前叫醒去載可昕（E37 有演）', warn or end['e37'], json.dumps({'option': t, 'e37': end['e37'], 'end': end}, ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    run.finish()
asyncio.run(main())
