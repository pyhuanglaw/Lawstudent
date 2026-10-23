"""BB-B 2026-10-23：LAWWW-B 清單 BB_SIS_B6_1023.md 第 46 項——學期中的快轉（FF-SEMESTER-1023，開發分支 375e90903；單元測試 tests/semff_unit.js）。
  使用者 10-23「能不能有一個跳過整個禮拜的選項 自動會去上課之類的? 劇情強制撥放」。
  每個情境：真的走到宿舍的床、按「睡覺」→ 床的選單選「快轉」→ 三個選項（到下一個有事的時候／過一週／不用了）→ 選一個 → 等快轉跑完。
    FF46_WEEK    大一上第 5 週週日 10/5 22:00「過一週」：途中沒有劇情的課自動上（提示「你照常去上了 N 堂課」、手機課表的出席次數多 N）、
                 停在 10/9 大一英文（有課前事件）課前 20 分鐘、日期字卡寫課名、那堂沒有被自動上
    FF46_NEXT    10/19（日）22:00「到下一個有事的時候」：停在 10/20 第一科期中考前 1 小時（床的鬧鐘）、考試沒有被自動上
    FF46_MSG     11/2（日）22:00「過一週」；【前置】11/3 20:00 阿哲一則要回的訊息（console PHONE.at）：停在那一刻打開手機、看得到那則，關掉以後接著跳（不停在 11/3 20:00）
    FF46_MEET    10/14（二）17:00「到下一個有事的時候」；【前置】答應的當面約（阿哲 19:00 麵店，console 寫進 G.invites）：停在 18:30（約前 30 分鐘）
    FF46_NOW     10/9（四）08:55（09:10 大一英文前 20 分鐘以內，有課前事件）：不跳，提示「大一英文快開始了，先去上課。」，時間沒動
    FF46_WINTER  寒假 2026-01-20 22:00：床的「快轉」是原本的寒暑假快轉（到下一個有事的日子／過三天／過一週），沒有學期中的三個選項
  每個情境都看：不卡住（快轉在時限內跑完）、不跳回標題、沒有 JS 例外。
【前置／捷徑】讀使用者 9/25 存檔（quiet_events）改日期、時間、地點（宿舍）；FF46_MSG、FF46_MEET 用 console 製造訊息、約（存檔裡那幾天沒有）。
不是 iPhone 實機：Playwright Chromium（SwiftShader）手機橫向 844×390、?turbo；觸控用 CDP。
用法：LW_TESTS=<開發分支>/tests SHA=<sha> [SCEN=FF46_WEEK,...] python3 semff_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = [s for s in os.environ.get('SCEN', '').split(',') if s] or None
def say(*a): print(' '.join(str(x) for x in a), flush=True)
def J(x, n=600): return json.dumps(x, ensure_ascii=False, default=str)[:n]
TWF = {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1}

async def page(p, landscape=True):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=landscape)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    return b, pg, cdp, errs

async def load_at(pg, base, key, h, zone, flags=None, js=None, run=None, label=''):
    st = json.loads(json.dumps(base)); G = st.get('G', st)
    d = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(key))
    G.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    G['flags'].update(flags or {})
    await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(5000)
    r = None
    if js: r = await pg.evaluate("(()=>{ const G=GAME.G, D=k=>STORY.dayOfKey(k); %s })()" % js)
    if run: run.setup('[前置] %s：使用者存檔改到 %s %.2f %s（quiet_events）；旗標 %s；console：%s → %s' % (label, key, h, zone, J(flags or {}, 200), (js or '')[:240], J(r, 300)))
    return r

async def choices(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")

async def pick(pg, cdp, start):
    c = await pg.evaluate("(w=>{ const e=[...document.querySelectorAll('#choices button')].find(b=>b.textContent.trim().startsWith(w)); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim()]; })(%s)" % json.dumps(start))
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200); return c[2]

SNAP = "(()=>({key:CALENDAR.dateOf(GAME.G.day).key, h:+GAME.G.hour.toFixed(3), zone:GAME.G.zone, dlg:!!(GAME.D&&GAME.D.active), title:(()=>{ const t=document.getElementById('titleScreen'); return !!t&&!t.classList.contains('hide')&&getComputedStyle(t).display!=='none'; })()}))()"
# 快轉的每一段（SEMFF.jump 回傳）、床的快轉選單開始／結束（SEMFF.menu）、日期字卡、提示、台詞、手機被打開（GAME.phoneThread）都記下來
HOOK = """(()=>{ if(window.__FFH) return; window.__FFH=1; window.__LOG=[]; window.__JUMPS=[]; window.__MENU=[]; window.__PT=[];
  const t=()=>({key:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3)});
  const push=(n,x)=>{ try{ window.__LOG.push(Object.assign({n:n,t:String(x)},t())); }catch(e){} };
  if(GAME.titleCard){ const tc=GAME.titleCard; GAME.titleCard=function(a,b){ push('CARD',a+'｜'+(b||'')); return tc.apply(this,arguments); }; }
  const ot=GAME.toast; GAME.toast=function(x){ push('TOAST',x); return ot.apply(this,arguments); };
  const ol=ADV.log; ADV.log=function(n,x){ push(n||'',x); return ol.apply(this,arguments); };
  if(GAME.phoneThread){ const pt=GAME.phoneThread; GAME.phoneThread=function(th,o){ try{ window.__PT.push(Object.assign({th:th,skip:!!(o&&o.skip),pend:(typeof PHONE!=='undefined'&&PHONE.pending?PHONE.pending(GAME.G).map(m=>m.ask&&m.ask.id):[])},t())); }catch(e){} return pt.apply(this,arguments); }; }
  if(typeof SEMFF!=='undefined'){
    const Jf=SEMFF.jump; SEMFF.jump=async function(){ const r=await Jf.apply(this,arguments); try{ window.__JUMPS.push(Object.assign({why:r.why,stop:r.stop?{why:r.stop.why,t:r.stop.t}:null,auto:r.auto,msgs:r.msgs},t())); }catch(e){} return r; };
    const Mf=SEMFF.menu; SEMFF.menu=async function(){ window.__MENU.push(Object.assign({phase:'start'},t())); let r; try{ r=await Mf.apply(this,arguments); } finally { window.__MENU.push(Object.assign({phase:'end',r:(r&&typeof r==='object')?{why:r.why,stop:r.stop?{why:r.stop.why}:null,auto:r.auto}:r},t())); } return r; }; } })()"""
# 這幾天的課：哪幾堂記了 done、每一科出席次數
RECQ = """(([a,b])=>{ const G=GAME.G, R=CLS.rec(G), out=[]; for(let d=STORY.dayOfKey(a); d<=STORY.dayOfKey(b); d++) for(const it of CLS.dayItems(G,d)) out.push({key:it.key, c:it.c.id, name:it.c.name, d:CALENDAR.dateOf(d).key, t0:it.t0, t1:it.t1, exam:!!it.exam, done:!!R.done[it.key]});
  return {items:out, attend:Object.assign({},R.attend)}; })"""

async def phone_open(pg):
    return await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide')&&getComputedStyle(p).display!=='none'; })()")

async def close_phone(pg, cdp):
    c = await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(!b) return null; const r=b.getBoundingClientRect(); return r.width?[r.left+r.width/2,r.top+r.height/2]:null; })()")
    if c: await L.touch_tap(cdp, c[0], c[1])
    else: await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b) b.click(); })()")
    await pg.wait_for_timeout(900)

async def bed_menu(pg, cdp, run):
    """走到床邊、按互動鍵，回傳床的選單"""
    bed = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z,it.label||'']:null; })()")
    if not bed: say('   ⚠ 這一區沒有床'); return []
    if not await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床', max_s=300): say('   ⚠ 走不到床'); return []
    for _ in range(4):
        if await phone_open(pg): await close_phone(pg, cdp)
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        if (await L.state(pg))['choices']: break
    cs = await choices(pg); sn = await pg.evaluate(SNAP)
    say('   床的選單 %s %.2f：%s' % (sn['key'], sn['h'], ' / '.join(x[:24] for x in cs))); return cs

async def run_ff(pg, cdp, run, sid, res, secs=900):
    """快轉選單結束以前：手機被打開＝記下來、截圖、關掉（接著跳）；對話點掉；中途的選項選第一個；回傳 SEMFF.menu 結束時的紀錄"""
    t0 = time.time(); nphone = 0
    while time.time() - t0 < secs:
        m = await pg.evaluate("window.__MENU||[]")
        if any(x['phase'] == 'end' for x in m): break
        if await phone_open(pg):
            nphone += 1
            body = await pg.evaluate("(()=>{ const b=document.getElementById('phoneBody'); return b?b.innerText.slice(-600):''; })()"); sn = await pg.evaluate(SNAP)
            res.setdefault('phone', []).append({'at': sn, 'body': body}); say('   手機打開了（%s %.2f）：%s' % (sn['key'], sn['h'], body[-160:].replace('\n', ' ')))
            await run.shot(pg, '%s_phone%d' % (sid, nphone)); await close_phone(pg, cdp); continue
        s = await L.state(pg)
        if s['choices']:
            cs = await choices(pg); say('   途中選項：%s → 選第一個' % cs); res.setdefault('midChoices', []).append(cs); await pick(pg, cdp, cs[0]); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        await pg.wait_for_timeout(1500)
    else:
        return None
    await pg.wait_for_timeout(3000)
    for _ in range(40):   # 停下來以後（早上那一套、事件）：對話點掉；選項不選（留給判定）
        s = await L.state(pg)
        if await phone_open(pg): await close_phone(pg, cdp); continue
        if s['dlg'] and not s['choices']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        break
    return await pg.evaluate("({menu:window.__MENU, jumps:window.__JUMPS, pt:window.__PT, log:window.__LOG.slice(-40)})")

async def week_tab(pg, cdp):
    """手機「課表」那一頁的出席那一行"""
    if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"week\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(1200)
    t = await pg.evaluate("(()=>{ const b=document.getElementById('phoneBody'); const it=b?[...b.querySelectorAll('.item')].find(x=>/出席：/.test(x.innerText)):null; return it?it.innerText:''; })()")
    return t

SC = {
    'FF46_WEEK': dict(key='2025-10-05', h=22.0, opt='過一週', rng=('2025-10-06', '2025-10-12'), label='大一上第 5 週週日 22:00「過一週」'),
    'FF46_NEXT': dict(key='2025-10-19', h=22.0, opt='到下一個有事的時候', rng=('2025-10-20', '2025-10-24'), label='10/19（日）22:00「到下一個有事的時候」'),
    'FF46_MSG': dict(key='2025-11-02', h=22.0, opt='過一週', rng=('2025-11-03', '2025-11-09'), label='11/2（日）22:00「過一週」＋11/3 20:00 要回的訊息',
                     js="const d=D('2025-11-03'); PHONE.at(G,d,20,[{th:'p:zhe',from:'zhe',text:'（BB 測試）明天中午吃什麼？',ask:{id:'bb_semff_ask',opts:[{t:'都可以'}]}}],'bb_semff'); return PHONE.pending(G).map(m=>m.ask&&m.ask.id);"),
    'FF46_MEET': dict(key='2025-10-14', h=17.0, opt='到下一個有事的時候', rng=('2025-10-14', '2025-10-14'), label='10/14（二）17:00「到下一個有事的時候」＋答應阿哲 19:00 麵店',
                      js="G.invites=G.invites||[]; G.invites.push({id:'iv_bb_semff',who:'zhe',place:'noodle',zone:'noodle',day:G.day,h:19,state:'accepted',accepted:true,by:'player',label:'和阿哲約在麵店'}); return STORY.wakeAlarms?STORY.wakeAlarms(G,G.day).map(a=>[a.h,a.why]):null;"),
    'FF46_NOW': dict(key='2025-10-09', h=8 + 50 / 60, opt='過一週', rng=('2025-10-09', '2025-10-09'), label='10/9（四）08:50（09:10 大一英文前 20 分鐘以內）'),
    'FF46_WINTER': dict(key='2026-01-20', h=22.0, opt=None, rng=None, label='寒假 2026-01-20 22:00'),
}
ORDER = ['FF46_WEEK', 'FF46_NEXT', 'FF46_MSG', 'FF46_MEET', 'FF46_NOW', 'FF46_WINTER']
FFOPTS = ['到下一個有事的時候', '過一週', '不用了']

async def scenario(p, run, base, sid):
    sc = SC[sid]; b, pg, cdp, errs = await page(p)
    res = {}
    try:
        r0 = await load_at(pg, base, sc['key'], sc['h'], 'dorm', flags=dict(TWF), js=sc.get('js'), run=run, label='%s（%s）' % (sid, sc['label']))
        res['setup'] = r0
        await pg.evaluate(HOOK)
        pre = await pg.evaluate(RECQ + "(%s)" % json.dumps(list(sc['rng']))) if sc['rng'] else None
        if sc['rng']: res['pre'] = {'done': [x['key'] for x in pre['items'] if x['done']], 'attend': pre['attend']}
        cs = await bed_menu(pg, cdp, run); res['bed'] = cs
        ff = next((c for c in cs if c.startswith('快轉')), None)
        run.check('%s：床的選單有「快轉」' % sid, bool(ff), J(cs))
        if not ff: return
        await pick(pg, cdp, '快轉'); await pg.wait_for_timeout(800)
        cs2 = await choices(pg); res['ffMenu'] = cs2; await run.shot(pg, '%s_ffmenu' % sid)
        if sid == 'FF46_WINTER':
            run.check('%s：寒假床上的快轉＝原本的寒暑假快轉（有「過三天」，沒有學期中的「到下一個有事的時候」）' % sid,
                      any(c.startswith('過三天') for c in cs2) and not any(c.startswith('到下一個有事的時候') for c in cs2), J(cs2))
            on = await pg.evaluate("typeof SEMFF!=='undefined'?SEMFF.on(GAME.G):null"); res['semffOn'] = on
            run.check('%s：寒假 SEMFF.on＝false' % sid, on is False, J(on))
            last = cs2[-1] if cs2 else None
            if last: await pick(pg, cdp, last)
            sn = await pg.evaluate(SNAP); res['end'] = sn
            run.check('%s：不跳回標題' % sid, not sn['title'], J(sn))
            return
        run.check('%s：學期中三個選項（到下一個有事的時候／過一週／不用了）' % sid, len(cs2) == 3 and all(cs2[i].startswith(FFOPTS[i]) for i in range(3)), J(cs2))
        t_sel = await pick(pg, cdp, sc['opt']); say('   ▶ 快轉：%s' % (t_sel or '（找不到）'))
        out = await run_ff(pg, cdp, run, sid, res)
        sn = await pg.evaluate(SNAP); res['end'] = sn; await run.shot(pg, '%s_end' % sid)
        run.check('%s：不卡住（快轉在 15 分鐘內跑完）' % sid, out is not None, J(sn))
        if out is None: return
        res.update({k: out[k] for k in ('menu', 'jumps', 'pt')}); res['log'] = out['log']
        say('   每一段：%s' % J(out['jumps'], 900)); say('   字卡／提示：%s' % J([x['t'] for x in out['log'] if x['n'] in ('CARD', 'TOAST')], 900))
        run.check('%s：不跳回標題（停下來以後在 %s）' % (sid, sn['zone']), not sn['title'] and sn['zone'] == 'dorm', J(sn))
        jl = out['jumps'][-1] if out['jumps'] else None
        cards = [x for x in out['log'] if x['n'] == 'CARD']; toasts = [x['t'] for x in out['log'] if x['n'] == 'TOAST']
        auto = sum(int(j.get('auto') or 0) for j in out['jumps'])
        post = await pg.evaluate(RECQ + "(%s)" % json.dumps(list(sc['rng'])))
        newly = [x for x in post['items'] if x['done'] and x['key'] not in res['pre']['done']]
        res['newly'] = [x['key'] for x in newly]
        if sid == 'FF46_NOW':
            run.check('%s：課前 20 分鐘以內、那堂有劇情＝不跳（why now）' % sid, bool(jl) and jl['why'] == 'now' and '大一英文' in J(jl.get('stop')), J(jl))
            run.check('%s：提示「大一英文快開始了，先去上課。」' % sid, any('大一英文快開始了，先去上課。' in t for t in toasts), J(toasts))
            run.check('%s：時間沒有被跳過（還在 10/9、09:10 以前）' % sid, sn['key'] == '2025-10-09' and sn['h'] < 9 + 10 / 60, J(sn))
            return
        if auto:
            run.check('%s：提示「快轉的這幾天，你照常去上了 %d 堂課。」' % (sid, auto), any('快轉的這幾天，你照常去上了 %d 堂課。' % auto in t for t in toasts), J(toasts))
        run.check('%s：自動上的課＝新記 done 的課（%d 堂；記了 %d 堂）' % (sid, auto, len(newly)), len(newly) == auto, J([x['key'] for x in newly]))
        dA = {c: (post['attend'].get(c, 0) - res['pre']['attend'].get(c, 0)) for c in set(post['attend']) | set(res['pre']['attend'])}
        dA = {c: v for c, v in dA.items() if v}; res['attendDelta'] = dA
        run.check('%s：出席次數多的和自動上的一樣（%s）' % (sid, J(dA)), sum(dA.values()) == auto, J(dA))
        wk = await week_tab(pg, cdp); res['weekTab'] = wk; await run.shot(pg, '%s_week_tab' % sid)
        names = {x['c']: x['name'] for x in post['items']}
        okw = all(('%s %d' % (names.get(c, c), post['attend'].get(c, 0))) in wk for c in dA)
        run.check('%s：手機「課表」的出席次數照新的算（%s）' % (sid, wk[-160:].replace('\n', ' ')), bool(wk) and okw, J({'dA': dA, 'tab': wk[-300:]}))
        if await phone_open(pg): await close_phone(pg, cdp)
        eventful_done = [x for x in newly if x['exam'] or x['c'] == 'english_y1' and x['d'] == '2025-10-09']
        run.check('%s：有劇情的課、考試沒有被自動上' % sid, not eventful_done, J([x['key'] for x in eventful_done]))
        if sid == 'FF46_WEEK':
            en = next((x for x in post['items'] if x['c'] == 'english_y1' and x['d'] == '2025-10-09'), None); res['english'] = en
            exp_h = en['t0'] - 1 / 3 if en else None
            stopped = bool(jl) and jl['why'] == 'stop' and jl['key'] == '2025-10-09' and exp_h is not None and abs(jl['h'] - exp_h) < 0.02
            run.check('%s：停在 10/9 大一英文課前 20 分鐘（%s）、那堂沒有記上過' % (sid, J(jl)), stopped and '大一英文' in J(jl.get('stop')) and not en['done'], J({'jump': jl, 'en': en}))
            cd = cards[-1]['t'] if cards else ''
            run.check('%s：日期字卡「10/9（四）08:50｜大一英文…」（%s）' % (sid, cd), cd.startswith('10/9（四）08:50') and '大一英文' in cd, J([c['t'] for c in cards]))
        elif sid == 'FF46_NEXT':
            ex = next((x for x in post['items'] if x['exam'] and x['d'] == '2025-10-20'), None); res['exam'] = ex
            stopped = bool(jl) and ex is not None and jl['key'] == '2025-10-20' and abs(jl['h'] - (ex['t0'] - 1)) < 0.02
            run.check('%s：停在 10/20 第一科期中考（%s）前 1 小時、考試沒有記上過' % (sid, ex and ex['name']), stopped and not ex['done'], J({'jump': jl, 'exam': ex}))
            cd = cards[-1]['t'] if cards else ''
            run.check('%s：日期字卡寫 10/20 和停下來的原因（%s）' % (sid, cd), cd.startswith('10/20') and not cd.endswith('｜宿舍'), J([c['t'] for c in cards]))
        elif sid == 'FF46_MSG':
            ptm = [x for x in out['pt'] if x['skip'] and 'bb_semff_ask' in (x.get('pend') or [])]
            run.check('%s：11/3 20:00 停下來打開手機（跳過）、待回的是那一則' % sid, bool(ptm) and ptm[0]['key'] == '2025-11-03' and 20 <= ptm[0]['h'] < 20.5, J(out['pt']))
            ph = res.get('phone') or []
            run.check('%s：手機畫面看得到那則訊息' % sid, any('明天中午吃什麼' in x['body'] for x in ph), J([x['body'][-120:] for x in ph]))
            lastj = out['jumps'][-1] if out['jumps'] else {}
            run.check('%s：關掉以後接著跳（最後停在 11/3 20:30 以後：%s %.2f）' % (sid, lastj.get('key'), lastj.get('h') or 0), bool(lastj) and (lastj['key'] > '2025-11-03' or lastj['h'] > 20.5), J(out['jumps']))
        elif sid == 'FF46_MEET':
            run.check('%s：停在 10/14 18:30（約前 30 分鐘）' % sid, bool(jl) and jl['why'] == 'stop' and jl['key'] == '2025-10-14' and abs(jl['h'] - 18.5) < 0.02, J(jl))
        run.check('%s：沒有 JS 例外' % sid, not errs, J(errs[:3]))
    except Exception as e:
        say('   例外：%r' % e); run.check('%s：跑完' % sid, False, repr(e)[:300])
    finally:
        json.dump(res, open(os.path.join(OUT, '%s.json' % sid), 'w'), ensure_ascii=False, indent=1, default=str)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass

async def main():
    run = L.Run('semff', OUT); base = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s（%s）' % (sid, os.environ.get('SHA', '?'))); t0 = time.time()
            await scenario(p, run, base, sid)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
    run.finish()
asyncio.run(main())
