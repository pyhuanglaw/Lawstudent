"""BB（帳號 A）2026-10-21：BB-TEST-AA355-358-1021 的 AA_358 部分（「錯過的事不被說成發生過」）——從標題「從法律系開始」開新遊戲，
第二天下課**拒絕小安**（選最後一個），之後照「全部拒絕」的玩法一路玩到大一上第 6 週結束（2025-10-12）；每天第一次看到以安（同一個區域、空下來的時候）
就走過去和她說話（最多 6 次，玩家會做的）。記下遊戲裡每一句台詞（誰、哪一天），最後檢查：
  2-1 麵店阿哲：沒有「下午你跟小安去哪了」，改說「下午沒看到你，我還以為你先回宿舍了。」
  2-2 以安：沒有「不能賠十倍」；第一次說話是「民總的筆記我整理好了」或「報告我先寫了一半」那一類
  2-4 以安報告（ev_an_report_followup）有演的話：是「（小聲）……寫完了，先給你看。」那一版
  2-6 八句：出現的話要是新句（語彤「很少在這裡看到你」、柏翰「跟班上的芯慈」……），舊句一律不該出現
不瞬移、不改劇情狀態；手機模擬 844×390 觸控（Playwright，不是實機）、?turbo。框架照 qa_play.py（BB-C）。
用法：LW_TESTS=<開發分支>/tests python3 aa358_probe.py URL OUT"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
import screencheck as SC
from playwright.async_api import async_playwright
URL = sys.argv[1]; OUT = sys.argv[2]; MODE = os.environ.get('MODE', 'decline'); MAXH = float(os.environ.get('MAXH', '1.6')); END = os.environ.get('END', '2025-10-13')
PENDING = "(()=>{ const G=GAME.G; const a=(typeof PHONE!=='undefined'&&PHONE.pending)?PHONE.pending(G).map(m=>PHONE.th(m)):[]; const b=(G.invites||[]).filter(v=>v.state==='offered'||v.state==='changed').map(v=>{ const m=(G.msgs||[]).find(q=>q.iv===v.id); return m?PHONE.th(m):null; }).filter(Boolean); return a.concat(b); })()"
PREF = {'sleep': ['睡到明天早上', '睡覺', '睡', '出發', '直接去'],
        'nophone': ['出發', '直接去'],
        'decline': ['不去', '今天不行', '先不要', '不了', '下次', '不用了', '先走'],
        'ff': ['快轉', '到下一個有事的日子', '跳過', '出發', '直接去']}[MODE]
DECLINE_LAST = MODE == 'decline'
HOOK = r"""(()=>{ window.__bb={money:[],toasts:[],kx:[],lines:[]}; let lastLine=''; let lastMoney=null, lastToast='', lastKx='';
  const meta=()=>{ try{ const G=GAME.G; return {d:CALENDAR.dateOf(G.day).key, h:Math.round(G.hour*100)/100, z:G.zone}; }catch(e){ return {}; } };
  setInterval(()=>{ try{ if(typeof GAME==='undefined'||!GAME.G) return; const m=GAME.G.money; if(lastMoney!==null&&m!==lastMoney){ const t=document.getElementById('toast'); window.__bb.money.push(Object.assign({from:lastMoney,to:m,delta:m-lastMoney,toast:t&&!t.classList.contains('hide')?t.textContent:'',lastToast},meta())); } lastMoney=m; }catch(e){} },200);
  document.addEventListener('DOMContentLoaded',()=>{ const t=document.getElementById('toast'); if(t) new MutationObserver(()=>{ const x=t.textContent; if(x&&x!==lastToast){ lastToast=x; window.__bb.toasts.push(Object.assign({t:x},meta())); } }).observe(t,{childList:true,characterData:true,subtree:true});
    const d=document.getElementById('dlgText'); if(d) new MutationObserver(()=>{ try{ const nm=((document.getElementById('dlgName')||{}).textContent||'').trim(); const full=(GAME.D&&GAME.D.full)||''; if(full&&(nm+'|'+full)!==lastLine){ lastLine=nm+'|'+full; window.__bb.lines.push(Object.assign({who:nm,t:full},meta())); } if(!/可昕/.test(nm)||!full) return; const k=nm+'|'+full; if(k===lastKx) return; lastKx=k;
      setTimeout(()=>{ try{ const sl=(typeof ADV!=='undefined'&&ADV.slots)||{}; const pick=w=>{ const s=sl[w]; if(!s||s.charId!=='kexin') return null; const box=w==='left'?ADV.L:ADV.R; const im=box&&box.querySelector('img'); return {want:s.expression, outfit:s.outfit||'', shown:im?(im.src.split('/portraits/')[1]||im.src).replace(/\?.*$/,''):'', compact:!!s.compact}; };
        window.__bb.kx.push(Object.assign({t:full.slice(0,40), slot:pick('left')||pick('right')}, meta())); }catch(e){} },450); }catch(e){} }).observe(d,{childList:true,characterData:true,subtree:true}); });
})();"""
async def pick(pg, cdp):
    c = await pg.evaluate("((w,last)=>{ const bs=[...document.querySelectorAll('#choices button')].filter(b=>!b.disabled); if(!bs.length) return null; let e=null; for(const t of w){ e=bs.find(x=>x.textContent.trim().replace(/^「/,'').startsWith(t)); if(e) break; } e=e||(last?bs[bs.length-1]:bs[0]); e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,28),bs.map(x=>x.textContent.trim().slice(0,12))]; })(%s,%s)" % (json.dumps(PREF), 'true' if DECLINE_LAST else 'false'))
    if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900)
    return c
async def phone_open(pg):
    return await pg.evaluate("!document.getElementById('phone').classList.contains('hide')")
async def answer_phone(pg, cdp, th):
    if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"msg\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(700)
    c = await pg.evaluate("(t=>{ const e=[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===t); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(th))
    if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900)
    b = await pg.evaluate("(last=>{ const es=[...document.querySelectorAll('#phoneBody [data-ask], #phoneBody [data-ans]')]; if(!es.length) return null; const e=last?es[es.length-1]:es[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,20)]; })(%s)" % ('true' if DECLINE_LAST else 'false'))
    if b: await L.touch_tap(cdp, b[0], b[1]); await pg.wait_for_timeout(900)
    if await phone_open(pg): await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(700)
    return b and b[2]
async def main():
    run = L.Run('aa358_' + MODE, OUT); sc = SC.Checker(run, OUT); problems = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.add_init_script(HOOK)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        await L.tap(pg, cdp, '#btnNewLaw'); print('MODE', MODE, '：標題「從法律系開始」', flush=True)
        t0 = time.time(); last_key = None; last_sig = None; stuck_t = time.time(); stuck = 0; idle = 0; was_dlg = False; last_opts = None; months = set(); answered = 0; phone_closed = 0; talked_n = 0; talked_day = None; go_tried = None
        while time.time() - t0 < MAXH * 3600:
            if not await pg.evaluate("!!GAME.G&&GAME.running"): await pg.wait_for_timeout(800); continue
            g = await pg.evaluate("({stage:GAME.G.stage,key:CALENDAR.dateOf(GAME.G.day).key,h:+GAME.G.hour.toFixed(2),zone:GAME.G.zone,home:typeof HOME!=='undefined'&&HOME.at(GAME.G),e37:!!(GAME.G.events.done||{}).ev_y0_e37})")
            if g['key'] >= END: break
            if g['key'] != last_key:
                last_key = g['key']; print('  [%6.1f 分] %s' % ((time.time()-t0)/60, json.dumps(g, ensure_ascii=False)), flush=True)
                if g['key'][:7] not in months: months.add(g['key'][:7]); await run.shot(pg, 'month_' + g['key'])
            s = await L.state(pg)
            sig = (s['dtext'], s['choices'], g['zone'], g['h'], g['key'])
            if sig != last_sig: last_sig = sig; stuck_t = time.time()
            elif time.time() - stuck_t > 240:
                stuck += 1; problems.append('卡住超過 4 分鐘：%s %.2f %s 對話「%s」選項 %s' % (g['key'], g['h'], g['zone'], s['dtext'][:30], s['choices']))
                run.note(problems[-1]); await run.shot(pg, 'stuck_%d' % stuck); stuck_t = time.time()
                await L.close_panels(pg, cdp)
                if stuck > 4: break
            if s['dlg'] and not was_dlg: await sc.check(pg, '%s 對話 %s' % (last_key, s['dtext'][:12]))
            was_dlg = bool(s['dlg'])
            if s['dlg'] and await phone_open(pg):   # 手機自己打開、蓋在對話上：玩家會先處理手機（回要回的那一則，沒有就收起來）
                pend1 = [] if MODE == 'nophone' else await pg.evaluate(PENDING)
                if pend1: a = await answer_phone(pg, cdp, pend1[0]); answered += 1; print('   （手機蓋在對話上）回覆', pend1[0], a, flush=True)
                else: await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(700)
                continue
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(550); idle = 0; continue
            if MODE == 'nophone':
                if await phone_open(pg): phone_closed += 1; await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(700); continue
            else:
                pend = await pg.evaluate(PENDING)
                if pend and (s['choices'] or not s['busy'] or await phone_open(pg)):
                    a = await answer_phone(pg, cdp, pend[0]); answered += 1; print('   手機回覆', pend[0], a, flush=True); continue
            if s['choices']:
                opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,12)).join('|')")
                if opts != last_opts: last_opts = opts; await sc.check(pg, '%s 選項 %s' % (last_key, opts[:16]))
                c = await pick(pg, cdp)
                if c: print('   ▶', c[2], '／', c[3], flush=True)
                idle = 0; continue
            if s['busy']: await pg.wait_for_timeout(700); continue
            idle += 1
            if idle >= 3 and 7.5 <= g['h'] <= 16.5 and go_tried != (g['key'], int(g['h'])) and not g['home']:   # 白天空下來：手機「今天」有可以去的課就去上（第二天要上完課，下課才會遇到小安）
                go_tried = (g['key'], int(g['h']))
                await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
                b = await pg.evaluate("(()=>{ const e=document.querySelector('#phone [data-go]'); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.x+r.width/2,r.y+r.height/2,e.textContent.trim().slice(0,24)]; })()")
                if b: await L.touch_tap(cdp, b[0], b[1]); print('   📱 去上課：', g['key'], g['h'], b[2], flush=True); idle = 0; continue
                if await phone_open(pg): await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(600)
            if talked_n < 6 and talked_day != g['key'] and idle >= 2 and g['stage'] == 'law':   # 每天第一次看到以安就去找她說話（玩家會做的）
                an = await pg.evaluate("(()=>{ const P=GAME.E.player.obj.position; const n=GAME.E.npcs.find(n=>n&&n.obj&&n.obj.visible!==false&&!n.hidden&&(n.charId==='heroine_01'||n.id==='an')&&Math.hypot(n.obj.position.x-P.x,n.obj.position.z-P.z)<40); return n?[n.obj.position.x,n.obj.position.z]:null; })()")
                if an:
                    talked_day = g['key']
                    if await L.go_to(pg, cdp, run, an[0], an[1], 1.4, '以安', max_s=90):
                        lab = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()")
                        if '小安' in lab or '以安' in lab:
                            await L.tap(pg, cdp, '#interact'); talked_n += 1; print('   和以安說話（%d）：%s %s' % (talked_n, g['key'], lab), flush=True); idle = 0; continue
            if g['zone'] == 'dorm' and not g['home'] and ((MODE == 'sleep' and idle >= 2) or (g['stage'] == 'law' and idle >= 8)):   # 法律系不再自動跳：任何玩法空下來一陣子都會去睡（玩家會做的）
                bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
                if bed and await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床', max_s=90):
                    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200); idle = 0
                    c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const e=bs.find(x=>/^睡到明天早上|^睡覺|^睡/.test(x.textContent.trim())); if(!e) return null; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,20)]; })()")
                    if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200); print('   去睡：', c[2], flush=True)
                    continue
            if idle >= 40 and not g['home'] and g['zone'] == 'campus':   # 出遊演完人留在校園：走到校門口「回臺北的家」（玩家會做的）
                problems.append('演完留在校園、要自己走去校門口回家：%s %.2f' % (g['key'], g['h'])); print('   ' + problems[-1], flush=True)
                if await L.go_to(pg, cdp, run, -120.5, 2.4, 0.9, '回臺北的家', max_s=240): await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
                idle = 0; continue
            await pg.wait_for_timeout(700)
        await run.shot(pg, 'end'); sc.finish()
        g = await pg.evaluate("({stage:GAME.G.stage,key:CALENDAR.dateOf(GAME.G.day).key,h:GAME.G.hour,e37:!!(GAME.G.events.done||{}).ev_y0_e37,fb:GAME.walkFallbacks||0})")
        print('結束', json.dumps(g, ensure_ascii=False), '手機回覆', answered, '收起自動打開的手機', phone_closed, flush=True)
        print('問題：'); [print('   -', x) for x in problems]
        bb = await pg.evaluate("window.__bb||{}")
        for k in ('money', 'toasts', 'kx'): json.dump(bb.get(k, []), open(os.path.join(OUT, {'kx': 'kexin'}.get(k, k) + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
        al = [m for m in bb.get('money', []) if m['delta'] in (5000, 20000, 30000)]
        print('生活費入帳：'); [print('   ', m['d'], m['h'], '+%d' % m['delta'], '提示：', m['toast'] or m['lastToast']) for m in al]
        neg = [m for m in bb.get('money', []) if m['delta'] < 0 and (m['d'][5:7] in ('02', '06'))]
        print('2 月、6 月的扣款（重考班 2/14、衝刺班 6/8 不該扣）：'); [print('   ', m['d'], m['h'], m['delta'], m['toast'] or m['lastToast']) for m in neg]
        kx = bb.get('kx', []); fb = [x for x in kx if x.get('slot') and x['slot']['shown'] and not x['slot']['shown'].endswith('/' + str(x['slot']['want']) + '.webp')]
        print('可昕的句子：%d 句；有立繪 %d 句；要的表情和顯示的圖不一樣（退回別的圖）%d 句' % (len(kx), len([x for x in kx if x.get('slot') and x['slot']['shown']]), len(fb)))
        byday = {}
        for x in kx:
            if x.get('slot'): byday.setdefault(x['d'], set()).add(x['slot']['shown'].split('/')[-1])
        for d in sorted(byday): print('   ', d, sorted(byday[d]))
        for x in fb[:12]: print('    退回：', x['d'], x['t'], x['slot'])
        lines = bb.get('lines', []); T = [x['t'] for x in lines]
        json.dump(lines, open(os.path.join(OUT, 'lines.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
        has = lambda w: [x for x in lines if w in x['t']]
        print('台詞 %d 句；和以安說話 %d 次' % (len(lines), talked_n))
        for w in ('下午沒看到你', '下午你跟小安去哪了', '不能賠十倍', '民總的筆記我整理好了', '報告我先寫了一半', '寫完了，先給你看', '謝謝你那天陪我', '很少在這裡看到你', '圖書館那天之後就沒再看到你', '跟班上的芯慈', '我跟芯慈吵了半小時'):
            print('   「%s」：%s' % (w, json.dumps([(x['d'], x['who']) for x in has(w)][:4], ensure_ascii=False)))
        run.check('玩到大一上第 6 週結束（%s）' % END, g['key'] >= END, json.dumps(g, ensure_ascii=False))
        run.check('2-1 麵店阿哲沒問「下午你跟小安去哪了」', not has('下午你跟小安去哪了'), json.dumps(has('下午你跟小安去哪了')[:2], ensure_ascii=False))
        run.check('2-1 阿哲說「下午沒看到你，我還以為你先回宿舍了。」', bool(has('下午沒看到你')), '')
        run.check('2-2 以安沒說「不能賠十倍」', not has('不能賠十倍'), json.dumps(has('不能賠十倍')[:2], ensure_ascii=False))
        rep = has('謝謝你那天陪我') + has('寫完了，先給你看')
        run.check('2-4 以安報告那場（有演才算）沒有「謝謝你那天陪我」', not has('謝謝你那天陪我'), '演了：%s' % json.dumps([(x['d'], x['t'][:20]) for x in rep][:3], ensure_ascii=False))
        old = [w for w in ('圖書館那天之後就沒再看到你', '我跟芯慈吵了半小時', '規則照去年', '沛珊說不要變成比分數的地方', '今年頂樓的人少了兩個', '去年那一張旁邊', '上次你選的那本繪本', '你上次吃辣的那家') if has(w)]
        run.check('2-6 舊句沒有出現', not old, json.dumps(old, ensure_ascii=False))
        run.check('沒有卡住超過 4 分鐘', stuck == 0, str(stuck))
        run.check('沒有用到卡住保險', g['fb'] == 0, str(g['fb']))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
