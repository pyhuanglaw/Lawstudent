"""BB：QA-PLAYTHROUGH-1018（v9.10.1 發布條件，使用者 10-18 07:1x 同意）——經濟系路線從新遊戲玩到 8/30 第一次去政大（E37）以後，照「真實玩家」的四種玩法：
  MODE=sleep    天天直接睡覺：一空下來，在宿舍就走去床邊睡、在家就選「睡覺」
  MODE=nophone  完全不開手機：不打開手機、不回任何訊息（自動打開的手機直接收起來）
  MODE=decline  所有邀約都拒絕／不回：手機要回的選最後一個（不去／今天不行），選項裡有拒絕的就選拒絕
  MODE=ff       一直快轉：選項裡有「快轉」「到下一個有事的日子」「跳過」就選
不瞬移、不改劇情狀態；開局按標題「從經濟系前傳開始」。手機模擬 844×390 觸控（Playwright，不是實機）。
記錄：卡住超過 4 分鐘（重現：日期、時間、區域、畫面）、JS 例外、畫面檢查（screencheck）、每月一張截圖、遊戲裡的台詞（dlg hook）。
2026-10-21 BB（帳號 A）加：玩到 9/1（看法律系的生活費）；頁面裡記①每一次錢的變動（日期、時間、多少、當時的提示字）②所有提示（#toast）③可昕每一句的立繪：
  要的表情（ADV.slots）和實際顯示的圖（img src）——AA363-S2-ECON-MONEY-1021（經濟系 10/31 搬回家後每月 5,000、重考班／衝刺班不扣錢、9/1 法律系 30,000）、
  KX-EXPR-1018／X62（可昕表情跟著句子換）。結束時寫 money.json、toasts.json、kexin.json 並印摘要。
用法：MODE=sleep LW_TESTS=<LAWWW>/tests python3 qa_play.py URL OUT"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
import screencheck as SC
from playwright.async_api import async_playwright
URL = sys.argv[1]; OUT = sys.argv[2]; MODE = os.environ.get('MODE', 'sleep'); MAXH = float(os.environ.get('MAXH', '1.9'))
PENDING = "(()=>{ const G=GAME.G; const a=(typeof PHONE!=='undefined'&&PHONE.pending)?PHONE.pending(G).map(m=>PHONE.th(m)):[]; const b=(G.invites||[]).filter(v=>v.state==='offered'||v.state==='changed').map(v=>{ const m=(G.msgs||[]).find(q=>q.iv===v.id); return m?PHONE.th(m):null; }).filter(Boolean); return a.concat(b); })()"
PREF = {'sleep': ['睡到明天早上', '睡覺', '睡', '出發', '直接去'],
        'nophone': ['出發', '直接去'],
        'decline': ['不去', '今天不行', '先不要', '不了', '下次', '不用了', '先走'],   # 2026-10-21：床的「照樣跳過會錯過的課？」是系統確認不是邀約，pick() 一律選「照樣跳過」（原本 decline 在 9/1 一直選「先不要」繞圈）
        'ff': ['快轉', '到下一個有事的日子', '跳過', '出發', '直接去']}[MODE]
DECLINE_LAST = MODE == 'decline'
SNAP_BEFORE = ['2024-11-01', '2024-12-01', '2025-02-14', '2025-06-08', '2025-09-01']   # 匯款、重考班、衝刺班、法律系的前一刻：存「跨過這一天之前最後看到的狀態」（事件接事件會跳日子，不能等剛好那一天）
HOOK = r"""(()=>{ window.__bb={money:[],toasts:[],kx:[]}; let lastMoney=null, lastToast='', lastKx='';
  const meta=()=>{ try{ const G=GAME.G; return {d:CALENDAR.dateOf(G.day).key, h:Math.round(G.hour*100)/100, z:G.zone}; }catch(e){ return {}; } };
  setInterval(()=>{ try{ if(typeof GAME==='undefined'||!GAME.G) return; const m=GAME.G.money; if(lastMoney!==null&&m!==lastMoney){ const t=document.getElementById('toast'); window.__bb.money.push(Object.assign({from:lastMoney,to:m,delta:m-lastMoney,toast:t&&!t.classList.contains('hide')?t.textContent:'',lastToast},meta())); } lastMoney=m; }catch(e){} },200);
  document.addEventListener('DOMContentLoaded',()=>{ const t=document.getElementById('toast'); let lastVis=false; if(t) new MutationObserver(()=>{ const x=t.textContent, vis=!t.classList.contains('hide'); if(x&&vis&&(x!==lastToast||!lastVis)){ lastToast=x; const rec=Object.assign({t:x},meta()); window.__bb.toasts.push(rec);
      setTimeout(()=>{ try{ const r=t.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2; const pe=t.style.pointerEvents; t.style.pointerEvents='auto'; const top=document.elementFromPoint(cx,cy); t.style.pointerEvents=pe; rec.rect=[r.left|0,r.top|0,r.width|0,r.height|0]; rec.inView=r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight; rec.onTop=!!top&&(top===t||t.contains(top)); rec.topEl=top?String(top.id||top.className||top.tagName).slice(0,30):''; rec.hidden=t.classList.contains('hide'); }catch(e){} },600); } if(x) lastToast=x; lastVis=vis; }).observe(t,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['class']});
    const d=document.getElementById('dlgText'); if(d) new MutationObserver(()=>{ try{ const nm=((document.getElementById('dlgName')||{}).textContent||'').trim(); const full=(GAME.D&&GAME.D.full)||''; if(!/可昕/.test(nm)||!full) return; const k=nm+'|'+full; if(k===lastKx) return; lastKx=k;
      setTimeout(()=>{ try{ const sl=(typeof ADV!=='undefined'&&ADV.slots)||{}; const pick=w=>{ const s=sl[w]; if(!s||s.charId!=='kexin') return null; const box=w==='left'?ADV.L:ADV.R; const im=box&&box.querySelector('img'); return {want:s.expression, outfit:s.outfit||'', shown:im?(im.src.split('/portraits/')[1]||im.src).replace(/\?.*$/,''):'', compact:!!s.compact}; };
        const rec=Object.assign({t:full.slice(0,40), slot:pick('left')||pick('right')}, meta()); window.__bb.kx.push(rec);
        setTimeout(()=>{ try{ const p2=pick('left')||pick('right'); rec.shown2=p2?p2.shown:''; }catch(e){} },1500); }catch(e){} },450); }catch(e){} }).observe(d,{childList:true,characterData:true,subtree:true}); });
})();"""
async def pick(pg, cdp):
    c = await pg.evaluate("((w,last)=>{ const bs=[...document.querySelectorAll('#choices button')].filter(b=>!b.disabled); if(!bs.length) return null; let e=bs.find(x=>/^照樣跳過/.test(x.textContent.trim()))||null; if(!e) for(const t of w){ e=bs.find(x=>x.textContent.trim().replace(/^「/,'').startsWith(t)); if(e) break; } e=e||(last?bs[bs.length-1]:bs[0]); e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,28),bs.map(x=>x.textContent.trim().slice(0,12))]; })(%s,%s)" % (json.dumps(PREF), 'true' if DECLINE_LAST else 'false'))
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
    run = L.Run('qa_play_' + MODE, OUT); sc = SC.Checker(run, OUT); problems = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.add_init_script(HOOK)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        await L.tap(pg, cdp, '#btnNew'); print('MODE', MODE, '：標題「從經濟系前傳開始」', flush=True)
        t0 = time.time(); last_key = None; last_sig = None; stuck_t = time.time(); stuck = 0; idle = 0; was_dlg = False; last_opts = None; months = set(); answered = 0; phone_closed = 0; snapped = set(); pre = {}
        while time.time() - t0 < MAXH * 3600:
            if not await pg.evaluate("!!GAME.G&&GAME.running"): await pg.wait_for_timeout(800); continue
            g = await pg.evaluate("({stage:GAME.G.stage,key:CALENDAR.dateOf(GAME.G.day).key,h:+GAME.G.hour.toFixed(2),zone:GAME.G.zone,home:typeof HOME!=='undefined'&&HOME.at(GAME.G),e37:!!(GAME.G.events.done||{}).ev_y0_e37})")
            if g['key'] >= '2025-09-02': break   # 2026-10-21：多玩到 9/1（法律系的生活費 30,000），原本 E37 演完就停
            if g['key'] != last_key:
                last_key = g['key']; print('  [%6.1f 分] %s' % ((time.time()-t0)/60, json.dumps(g, ensure_ascii=False)), flush=True)
                if g['key'][:7] not in months: months.add(g['key'][:7]); await run.shot(pg, 'month_' + g['key'])
                snap = None
                for T in SNAP_BEFORE:   # 2026-10-21：跨過 T 之前最後一個狀態（GAME.snapshot）寫成 snap_before_T.json，直向補拍「生活費」提示字從這裡讀檔
                    if T in snapped: continue
                    if g['key'] < T:
                        if snap is None:
                            try: snap = await pg.evaluate("JSON.stringify(GAME.snapshot())")
                            except Exception as e: print('   存狀態失敗', T, e, flush=True); snap = ''
                        if snap: pre[T] = (g['key'], snap)
                    elif T in pre:
                        snapped.add(T); open(os.path.join(OUT, 'snap_before_%s.json' % T), 'w', encoding='utf-8').write(pre[T][1]); print('   存狀態 snap_before_%s.json（%s 的狀態）' % (T, pre[T][0]), flush=True)
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
                if not pend and not s['choices'] and await phone_open(pg):   # 2026-10-21：事件接事件停在新訊息上（AA_300 第 6 節：手機自己打開、按鈕寫「跳過」）、沒有要回的＝按「跳過」（玩家會做的；原本 sleep／decline 不收，9/12 21:00 在床邊空轉）
                    lab = await pg.evaluate("((document.getElementById('btnPhoneClose')||{}).textContent||'').trim()")
                    phone_closed += 1; await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(700); print('   手機沒有要回的：按「%s」' % lab, flush=True); continue
            if s['choices']:
                opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,12)).join('|')")
                if opts != last_opts: last_opts = opts; await sc.check(pg, '%s 選項 %s' % (last_key, opts[:16]))
                c = await pick(pg, cdp)
                if c: print('   ▶', c[2], '／', c[3], flush=True)
                idle = 0; continue
            if s['busy']: await pg.wait_for_timeout(700); continue
            idle += 1
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
        tb = [x for x in bb.get('toasts', []) if 'rect' in x and (not x.get('inView') or not x.get('onTop'))]
        print('提示字被擋或超出畫面：%d／%d' % (len(tb), len(bb.get('toasts', [])))); [print('   ', x['d'], x['h'], x['t'][:30], x.get('rect'), '最上層：', x.get('topEl')) for x in tb[:10]]
        kx = bb.get('kx', []); fb = [x for x in kx if x.get('slot') and x['slot']['shown'] and not (x.get('shown2') or x['slot']['shown']).endswith('/' + str(x['slot']['want']) + '.webp')]   # 2026-10-21：看 1.5 秒後的圖（0.45 秒時常常還是上一句的圖）
        print('可昕的句子：%d 句；有立繪 %d 句；要的表情和顯示的圖不一樣（退回別的圖）%d 句' % (len(kx), len([x for x in kx if x.get('slot') and x['slot']['shown']]), len(fb)))
        byday = {}
        for x in kx:
            if x.get('slot'): byday.setdefault(x['d'], set()).add(x['slot']['shown'].split('/')[-1])
        for d in sorted(byday): print('   ', d, sorted(byday[d]))
        for x in fb[:12]: print('    退回：', x['d'], x['t'], x['slot'])
        run.check('玩到 8/30 第一次去政大（E37 演完）', g['e37'], json.dumps(g, ensure_ascii=False))
        run.check('沒有卡住超過 4 分鐘', stuck == 0, str(stuck))
        run.check('沒有用到卡住保險', g['fb'] == 0, str(g['fb']))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
