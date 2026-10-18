"""BB：BUG-DATE-0831-1018（使用者：9/1 早上畫面寫 8/31，上完憲法變 9/1）。
[前置] 讀使用者自己的存檔（企劃線 6fbe1f15 qa_saves「經濟系到法律系開學_day-18.json」，8/29 22:42 宿舍），放進欄位 1、標題「讀取」。
之後照玩家，PATH 決定空下來時做什麼：
  bedff  宿舍床的選單：選「快轉」→「到下一個有事的…」（沒有就選第一個睡覺）
  goal   一空下來就按手機「今天」的第一個「前往／去上課」按鈕；沒有就去床睡覺
每一步（每次空下來、每張換日字卡）記：真正的日期（G.day）、右上角 #clockT 的字、換日字卡的字、手機「今天」頁最上面那行。到 9/1 上完第一堂課（或 9/1 12:30）停。"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL = sys.argv[1]; OUT = sys.argv[2]; SAVE = sys.argv[3]; PATH = os.environ.get('PATH_MODE', 'bedff')
SNAP = "(()=>{ const G=GAME.G; return {real:CALENDAR.dateOf(G.day).key, h:+G.hour.toFixed(2), wd:G.weekday, hud:(document.getElementById('clockT')||{}).textContent||'', zone:G.zone}; })()"
async def today_head(pg, cdp):
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"today\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(700)
    t = await pg.evaluate("((document.querySelector('#phoneBody')||{}).innerText||'').split('\\n').filter(x=>x.trim()).slice(0,2).join(' ｜ ')")
    return t
async def main():
    run = L.Run('date0831_' + PATH, OUT); log = []; bad = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await pg.evaluate("(s=>localStorage.setItem('fatiao3d_slot_1',s))(%s)" % json.dumps(open(SAVE, encoding='utf-8').read()))
        await pg.reload(); await L.wait_loaded(pg)
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b.find(x=>x.closest('.item')&&x.closest('.item').textContent.includes('欄位 1'))||b[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        await L.touch_tap(cdp, c[0], c[1]); run.setup('讀使用者的存檔 day-18（8/29 22:42 宿舍），PATH=' + PATH); await pg.wait_for_timeout(4000)
        await pg.evaluate("(()=>{ if(GAME.titleCard&&!GAME.titleCard.__bb){ const o=GAME.titleCard; const f=function(t,s,ms){ (window.__cards=window.__cards||[]).push({t:String(t),s:String(s||''),real:CALENDAR.dateOf(GAME.G.day).key,h:+GAME.G.hour.toFixed(2),hud:(document.getElementById('clockT')||{}).textContent}); return o.apply(this,arguments); }; f.__bb=1; GAME.titleCard=f; } })()")
        def check(sn, where):
            m, d = int(sn['real'][5:7]), int(sn['real'][8:10]); hd = sn['hud'].split(' ')[0]
            exp = '%d/%d' % (m, d) if sn['h'] < 24 else None
            if exp and hd != exp: bad.append('%s：真正 %s %.2f，右上角「%s」' % (where, sn['real'], sn['h'], sn['hud']))
        t0 = time.time(); last_free = None
        while time.time() - t0 < 1500:
            for cd in await pg.evaluate("(()=>{ const a=window.__cards||[]; window.__cards=[]; return a; })()"):
                log.append(('字卡', cd)); print('  【字卡】', json.dumps(cd, ensure_ascii=False), flush=True)
                if '/' in cd['t']:
                    md = cd['t'].split('（')[0].split(' ')[0]; real = '%d/%d' % (int(cd['real'][5:7]), int(cd['real'][8:10]))
                    if md != real and cd['h'] < 24: bad.append('字卡寫「%s」，真正 %s %.2f' % (cd['t'], cd['real'], cd['h']))
            sn = await pg.evaluate(SNAP)
            if sn['real'] >= '2025-09-01' and (sn['h'] >= 12.3 or sn['zone'] in ('classroom', 'linze')) and not (await L.state(pg))['dlg']:
                if sn['h'] >= 12.3: break
            s = await L.state(pg)
            if s['dlg']:
                if not await pg.evaluate("(()=>{ const e=document.getElementById('title3'); return !!e&&e.style.opacity==='1'; })()"): check(sn, '對話中「%s」' % s['dtext'][:14]); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
            if s['choices']:
                pref = ['快轉', '到下一個有事', '睡到明天早上', '睡覺', '直接去上課'] if PATH == 'bedff' else ['直接去上課', '睡到明天早上', '睡覺']
                c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; let e=null; for(const t of w){ e=bs.find(x=>x.textContent.trim().startsWith(t)); if(e) break; } e=e||bs[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,26),bs.map(x=>x.textContent.trim().slice(0,10))]; })(%s)" % json.dumps(pref))
                await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1000); print('   ▶', c[2], c[3], json.dumps(sn, ensure_ascii=False), flush=True); log.append(('選', c[2], sn)); continue
            if s['busy'] or await pg.evaluate("(()=>{ const e=document.getElementById('title3'); return !!e&&e.style.opacity==='1'; })()"): await pg.wait_for_timeout(600); continue
            key = (sn['real'], int(sn['h']))
            if key == last_free: await pg.wait_for_timeout(800)
            last_free = key
            th = await today_head(pg, cdp); sn2 = await pg.evaluate(SNAP)
            print('  [空下來] %s ｜手機今天：%s' % (json.dumps(sn2, ensure_ascii=False), th), flush=True); log.append(('空', sn2, th)); check(sn2, '空下來')
            md = th.split(' ')[0]; real = '%d/%d' % (int(sn2['real'][5:7]), int(sn2['real'][8:10]))
            if '/' in md and md != real and sn2['h'] < 24: bad.append('手機今天寫「%s」，真正 %s %.2f' % (th[:20], sn2['real'], sn2['h']))
            await run.shot(pg, 'free_%s_%02d' % (sn2['real'], int(sn2['h'])))
            if PATH == 'goal':
                g = await pg.evaluate("(()=>{ const e=[...document.querySelectorAll('#phoneBody [data-go]')].filter(b=>!/缺席/.test(b.textContent))[0]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,24)]; })()")
                if g: print('   手機前往', g[2], flush=True); await L.touch_tap(cdp, g[0], g[1]); await pg.wait_for_timeout(1800); continue
            await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(600)
            bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
            if bed and await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床', max_s=120):
                await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200); continue
            await pg.wait_for_timeout(1000)
        print('不一致：'); [print('   -', x) for x in bad]
        run.check('9/1 上完第一堂課以前，右上角、換日字卡、手機「今天」的日期都和真正的日期一樣', not bad, json.dumps(bad[:8], ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
