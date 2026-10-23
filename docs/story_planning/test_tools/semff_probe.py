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
  第 49 項（開發分支 fff3f8998，DEC-SLOTS-1018「每個時段一件主要的事」；tests/dl03_slots_unit.js 5b）SL49_*：只在 SCEN 指名時跑——
    SL49_NOTES   週六 14:00 書桌整理筆記（下午 1 件）→ 再試「讀書」變灰「這個下午已經排滿了（1／1）」、按下去只提示；手機「今天」最上面「今天的時間」下午 ●
    SL49_JUMP    週六 14:00 書桌讀 1 小時 → 下午用完跳到 18:00（「下午的時間用完了」）；晚上讀 1 小時 → 不跳、再試變灰「這個晚上已經排滿了（1／1）」
    SL49_CLASS   平日上午一堂沒有劇情的課（【捷徑】CLS.goClass＝「直接去下一堂」）上完：上午 ●；下課選單「在附近讀書」照時段
    SL49_OUT     週六 17:00 出門的校外約會（【前置】DATE.book 小安淡水）回來：晚上 ●
    SL49_EXAM    考試週週六：三格各多一個金色、說明寫只能自習；整理筆記兩次（2／2）後讀書變灰；【讀資料】自由出行只有 1 次
    SL49_EAT     週六 12:30 阿鳳麵店點餐：格子不變
    SL49_MEET    【前置】約好 15:00 和小安在兩點半見面、14:33「直接過去」：見面以後格子不變
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
    """走到床邊、按互動鍵，回傳床的選單。
    BB-B 10-23 19:0x：照 us_life_probe 的 bed_menu 改——床的互動半徑可能只有 0.6 m（停在半徑的 0.7 倍）、互動鈕下一格才出來（負載 25 時一格 3 秒以上，等到 20 秒）、
    按下去以後選單也要等（最多 60 秒）；原本 4 次 × 1.5 秒（FF46_WINTER 負載高時沒等到選單就讀了＝腳本 FAIL）"""
    bed = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>(i.sleep||i.label==='睡覺')&&!i.hidden); return it?[it.x,it.z,it.label||'',it.radius||1.4]:null; })()")
    if not bed: say('   ⚠ 這一區沒有床'); return []
    if not await L.go_to(pg, cdp, run, bed[0], bed[1], min(0.8, bed[3] * 0.7), '床', max_s=300): say('   ⚠ 走不到床'); return []
    for _ in range(4):
        if await phone_open(pg): await close_phone(pg, cdp)
        for k in range(25):
            if (await L.state(pg)).get('interact'): break
            await pg.wait_for_timeout(800)
        await L.tap(pg, cdp, '#interact')
        got = False
        for k in range(40):
            await pg.wait_for_timeout(1500)
            if (await L.state(pg))['choices']: got = True; break
        if got: break
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
        cs2 = await choices(pg)
        for k in range(40):   # 快轉的子選單也要等下一格（負載高時 800 ms 讀到的還是床的選單或空的）
            if cs2 and cs2 != cs: break
            await pg.wait_for_timeout(1500); cs2 = await choices(pg)
        res['ffMenu'] = cs2; await run.shot(pg, '%s_ffmenu' % sid)
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
            run.check('%s：提示「大一英文（上）快開始了，先去上課。」' % sid, any('大一英文' in t and '快開始了，先去上課。' in t for t in toasts), J(toasts))
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


# ---------------------------------------------------------------- 第 49 項（fff3f8998）：每個時段一件主要的事（DEC-SLOTS-1018；tests/dl03_slots_unit.js 5b）
HOOK49 = """(()=>{ if(window.__SLH) return; window.__SLH=1; window.__LOG=window.__LOG||[];
  const t=()=>({key:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3)});
  const push=(n,x)=>{ try{ window.__LOG.push(Object.assign({n:n,t:String(x)},t())); }catch(e){} };
  const ot=GAME.toast; GAME.toast=function(x){ push('TOAST',x); return ot.apply(this,arguments); };
  if(GAME.caption){ const oc=GAME.caption; GAME.caption=function(a,b){ push('CAPTION',(a||'')+'｜'+(b||'')); return oc.apply(this,arguments); }; }
  if(GAME.titleCard){ const tc=GAME.titleCard; GAME.titleCard=function(a,b){ push('CARD',a+'｜'+(b||'')); return tc.apply(this,arguments); }; }
  const ol=ADV.log; ADV.log=function(n,x){ push(n||'',x); return ol.apply(this,arguments); };
  /* 畫面上的字幕框（#caption）也記：classes3d.js 的 skipTo 叫的是遊戲內部的 GM.caption，不一定經過 GAME.caption（BB-B 14:0x：SL49_JUMP 跳到 18:00 卻沒記到「下午的時間用完了」）*/
  const ce=document.getElementById('caption'); if(ce&&window.MutationObserver){ let last=''; new MutationObserver(()=>{ const s=(ce.innerText||'').trim(); if(s&&s!==last){ last=s; push('CAPTION','DOM｜'+s); } }).observe(ce,{childList:true,subtree:true,characterData:true}); } })()"""
SLOTQ = "(()=>{ const G=GAME.G, R=CLS.slotRec(G); return {used:Object.assign({},R.used), exam:CLS.examWeek(G), key:CALENDAR.dateOf(G.day).key, h:+G.hour.toFixed(3), zone:G.zone}; })()"
CHQ = "[...document.querySelectorAll('#choices button')].map(b=>({t:b.textContent.trim(), dim:b.classList.contains('dim')}))"

async def today_slots(pg, cdp):
    """手機「今天」最上面「今天的時間」那一格（字＋HTML，看金色）"""
    if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"today\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(1200)
    r = await pg.evaluate("(()=>{ const b=document.getElementById('phoneBody'); const it=b?[...b.querySelectorAll('.item')].find(x=>/今天的時間/.test(x.innerText)):null; const all=b?[...b.querySelectorAll('.item')]:[]; return it?{text:it.innerText, html:it.innerHTML, first:all.length>1&&(all[1]===it), idx:all.indexOf(it)}:null; })()")
    return r

async def wait_idle(pg, cdp, secs=240, pref=None):
    """對話點掉、手機關掉；遇到選項：pref 有的照 pref 選，沒有就停下來回傳選項"""
    t0 = time.time(); calm = 0
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if await phone_open(pg): await close_phone(pg, cdp); calm = 0; continue
        if s['choices']:
            cs = await choices(pg); w = next((x for x in (pref or []) for c in cs if c.startswith(x)), None)
            if w is None: return cs
            await pick(pg, cdp, w); calm = 0; continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); calm = 0; continue
        if s['busy']: await pg.wait_for_timeout(800); calm = 0; continue
        calm += 1
        if calm >= 3: return []
        await pg.wait_for_timeout(1000)
    return None

SUBJ49 = ['憲法', '刑法總則', '民法總則', '經濟學原理', '整理這週的筆記']   # 讀書：選多久以後的「讀哪一科」

async def desk_menu(pg, cdp, run):
    d = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.deskStudy&&!i.hidden); return it?[it.x,it.z,it.label||'']:null; })()")
    if not d: say('   ⚠ 這一區沒有書桌'); return []
    if not await L.go_to(pg, cdp, run, d[0], d[1], 0.8, '書桌', max_s=300): say('   ⚠ 走不到書桌'); return []
    for _ in range(4):
        if await phone_open(pg): await close_phone(pg, cdp)
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
        if (await L.state(pg))['choices']: break
    cs = await pg.evaluate(CHQ); sn = await pg.evaluate(SLOTQ)
    say('   書桌 %s %.2f：%s' % (sn['key'], sn['h'], ' / '.join(('［灰］' if c['dim'] else '') + c['t'][:30] for c in cs))); return cs

def toasts_of(log): return [x['t'] for x in log if x['n'] in ('TOAST', 'CAPTION')]

BOOK49 = """G.flags.metAn=true; G.flags.met_an=true; SOCIAL.remember('heroine_01','FIRST_MET',''); G.contacts=G.contacts||{}; if(G.contacts.heroine_01==null) G.contacts.heroine_01=D('2025-09-03');
  { const r=SOCIAL.rel('heroine_01'); r.fam=Math.max(r.fam|0,45); r.trust=Math.max(r.trust|0,30); r.comf=Math.max(r.comf|0,25); }
  const t=DATE.book(G,{who:'heroine_01',locs:['D13'],transport:'mrt',day:G.day,depart:17}); const q=OUT.get(G,'date_'+t.trip); return {trip:t.trip, status:t.status, q:q?{id:q.id,h:q.h,state:q.state,place:q.place}:null};"""
# BB-B 14:4x：afternoonDone＝第一天下午那一段走完（見過小安的人一定有；沒見過的第 3 天起自動補）。使用者 9/25 存檔跳到 10/08 沒經過換日，沒有它，小安（舊 id）不會照作息出現（story3d.js schedFor 的 legacyOk）
IV49 = """LV=(id,f,t,c)=>{ const r=SOCIAL.rel(id); r.fam=Math.max(r.fam|0,f); r.trust=Math.max(r.trust|0,t); r.comf=Math.max(r.comf|0,c); }; LV('heroine_01',45,30,20); G.flags.metAn=true; G.flags.met_an=true; G.flags.afternoonDone=true; G.contacts=G.contacts||{}; if(G.contacts.heroine_01==null) G.contacts.heroine_01=D('2025-09-03');
  G.invites=G.invites||[]; const P=INV.place('cafe')||{}; G.invites.push({id:'iv_bb49',who:'heroine_01',place:'cafe',zone:P.zone,day:G.day,h:15,state:'accepted',accepted:true,by:'player',label:'和小安約在'+(P.name||'')}); return CLS.slotRec(G).used;"""
EXAMDAY = """(()=>{ const G=GAME.G, d0=G.day; for(let d=STORY.dayOfKey('2025-10-18'); d<=STORY.dayOfKey('2025-11-02'); d++){ G.day=d; const w=CALENDAR.dateOf(d).wd; if(CLS.examWeek(G)&&(w===6)){ G.day=d0; return CALENDAR.dateOf(d).key; } } G.day=d0; return null; })()"""
# BB-B 13:4x：使用者課表上午的課是 9:10～12:10（三節），原本 t1<=12 一堂都找不到（SL49_CLASS classCand []）→ 放寬到 12:15
CLASSDAY = """(()=>{ const G=GAME.G, d0=G.day, h0=G.hour; const out=[]; for(let d=STORY.dayOfKey('2025-10-13'); d<=STORY.dayOfKey('2025-10-17'); d++){ G.day=d; for(const it of CLS.dayItems(G,d)){ G.hour=it.t0-0.5; const sc=CLS.storyClass&&CLS.storyClass(G,it); const ev=typeof SEMFF!=='undefined'?SEMFF.classEventful(G,it):null; if(it.t0<10&&it.t1<=12.25&&!it.exam&&!sc&&!ev) out.push({key:CALENDAR.dateOf(d).key, ik:it.key, c:it.c.name, t0:it.t0, t1:it.t1}); } } G.day=d0; G.hour=h0; return out; })()"""

SL = {
    'SL49_NOTES': dict(key='2025-10-11', h=14.0, zone='dorm', label='週六 14:00：書桌整理筆記（下午 1 件）後再試讀書＝變灰「這個下午已經排滿了（1／1）」'),
    'SL49_JUMP': dict(key='2025-10-11', h=14.0, zone='dorm', label='週六 14:00：書桌讀 1 小時（下午用完）→ 跳到 18:00；晚上讀 1 小時後再試＝變灰、不跳'),
    'SL49_CLASS': dict(key=None, h=None, zone='dorm', label='平日上午一堂課（沒有劇情）上完：上午 ●；下課選單「在附近讀書」照時段'),
    'SL49_OUT': dict(key='2025-10-11', h=16.6, zone='dorm', js=BOOK49, label='週六 17:00 出門的校外約會（小安、淡水金色水岸）回來：下午、晚上 ●'),
    'SL49_EXAM': dict(key=None, h=14.0, zone='dorm', label='考試週週六 14:00：手機「今天」三格各多一個金色；整理筆記兩次（2／2）後讀書變灰'),
    'SL49_EAT': dict(key='2025-10-11', h=12.5, zone='noodle', label='週六 12:30 阿鳳麵店點餐吃飯：下午的格子不變'),
    'SL49_MEET': dict(key='2025-10-08', h=14.55, zone='dorm', js=IV49, label='平日 14:33 約好 15:00 和小安在兩點半 Café 見面（直接過去）：見面後下午的格子不變'),
}
SL_ORDER = ['SL49_NOTES', 'SL49_JUMP', 'SL49_CLASS', 'SL49_OUT', 'SL49_EXAM', 'SL49_EAT', 'SL49_MEET']

async def sl49(p, run, base, sid):
    sc = SL[sid]; b, pg, cdp, errs = await page(p)
    res = {}
    try:
        key = sc['key']; h = sc['h']
        if sid in ('SL49_CLASS', 'SL49_EXAM'):   # 先讀一次存檔找日子（使用者的課表）
            await load_at(pg, base, '2025-10-12', 12.0, 'dorm', flags=dict(TWF))
            if sid == 'SL49_EXAM':
                key = await pg.evaluate(EXAMDAY); res['examDay'] = key
            else:
                cand = await pg.evaluate(CLASSDAY); res['classCand'] = cand
                if cand: key = cand[0]['key']; h = cand[0]['t0'] - 0.45; res['cls'] = cand[0]
            if not key: run.check('%s：找到要測的日子' % sid, False, J(res)); return
        await load_at(pg, base, key, h, sc['zone'], flags=dict(TWF), js=sc.get('js'), run=run, label='%s（%s）' % (sid, sc['label']))
        await pg.evaluate(HOOK49)
        s0 = await pg.evaluate(SLOTQ); res['s0'] = s0
        ts = await today_slots(pg, cdp); res['today0'] = ts; await run.shot(pg, '%s_today0' % sid)
        if sid in ('SL49_NOTES', 'SL49_EXAM'):
            run.check('%s：手機「今天」有「今天的時間」一格、排在日期下面第一格' % sid, bool(ts) and ts['idx'] == 1, J(ts, 300))
            run.check('%s：說明寫「每個時段一件主要的事」' % sid, bool(ts) and '每個時段一件主要的事' in ts['text'], J(ts and ts['text'][:200]))
        if await phone_open(pg): await close_phone(pg, cdp)
        if sid == 'SL49_NOTES':
            run.check('%s：一開始上午／下午／晚上各一格、都是 ○' % sid, bool(ts) and all(w in ts['text'] for w in ['上午 ○', '下午 ○', '晚上 ○']), J(ts and ts['text'][:120]))
            cs = await desk_menu(pg, cdp, run); res['desk1'] = cs
            run.check('%s：書桌：讀書、整理筆記都可以選（沒有變灰）' % sid, len(cs) >= 2 and not cs[0]['dim'] and not cs[1]['dim'], J(cs))
            await pick(pg, cdp, '整理今天的筆記'); await wait_idle(pg, cdp)
            s1 = await pg.evaluate(SLOTQ); res['s1'] = s1
            run.check('%s：整理筆記以後下午 1 件（used.pm＝1）、沒有被跳到 18:00（%.2f）' % (sid, s1['h']), s1['used'].get('pm') == 1 and s1['h'] < 16, J(s1))
            cs2 = await desk_menu(pg, cdp, run); res['desk2'] = cs2; await run.shot(pg, '%s_desk_gray' % sid)
            r0 = next((c for c in cs2 if c['t'].startswith('讀書')), None)
            run.check('%s：再試一次＝「讀書」變灰、寫「這個下午已經排滿了（1／1）」' % sid, bool(r0) and r0['dim'] and '這個下午已經排滿了（1／1）' in r0['t'], J(cs2))
            await pick(pg, cdp, '讀書'); await pg.wait_for_timeout(1500)
            lg = await pg.evaluate("window.__LOG"); res['toasts'] = toasts_of(lg)
            run.check('%s：按變灰的「讀書」＝提示「這個下午已經排滿了（1／1）」、不開始讀' % sid, any('這個下午已經排滿了（1／1）' in t for t in toasts_of(lg)), J(toasts_of(lg)))
            await wait_idle(pg, cdp, secs=30, pref=['起身'])
            ts2 = await today_slots(pg, cdp); res['today1'] = ts2; await run.shot(pg, '%s_today1' % sid)
            run.check('%s：手機「今天」下午變 ●' % sid, bool(ts2) and '下午 ●' in ts2['text'], J(ts2 and ts2['text'][:120]))
        elif sid == 'SL49_JUMP':
            cs = await desk_menu(pg, cdp, run); await pick(pg, cdp, '讀書'); await pg.wait_for_timeout(1200)
            ls = await pg.evaluate(CHQ); res['lengths'] = ls
            run.check('%s：讀多久的選單（讀 1 小時沒有變灰）' % sid, any(c['t'].startswith('讀 1 小時') and not c['dim'] for c in ls), J(ls))
            await pick(pg, cdp, '讀 1 小時'); await wait_idle(pg, cdp, secs=300, pref=SUBJ49)   # 選完多久以後還要選一科（BB-B 13:3x：第一次跑沒選科目＝沒開始讀）
            t0 = time.time(); s1 = None
            while time.time() - t0 < 180:
                s1 = await pg.evaluate(SLOTQ)
                if s1['h'] >= 17.9: break
                st = await L.state(pg)
                if st['dlg']: await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(2000)
            res['afterStudy'] = s1; lg = await pg.evaluate("window.__LOG"); res['toasts'] = toasts_of(lg)
            run.check('%s：下午讀完（下午用完）跳到 18:00（現在 %.2f）' % (sid, s1['h']), 17.95 <= s1['h'] <= 18.4 and s1['used'].get('pm') == 1, J(s1))
            run.check('%s：跳的時候寫「下午的時間用完了」' % sid, any('下午的時間用完了' in t for t in toasts_of(lg)), J(toasts_of(lg)[-8:]))
            await run.shot(pg, '%s_at18' % sid)
            cs = await desk_menu(pg, cdp, run); r0 = next((c for c in cs if c['t'].startswith('讀書')), None)
            run.check('%s：18:00 晚上還能讀（讀書沒有變灰）' % sid, bool(r0) and not r0['dim'], J(cs))
            await pick(pg, cdp, '讀書'); await pg.wait_for_timeout(1200); await pick(pg, cdp, '讀 1 小時'); await wait_idle(pg, cdp, secs=300, pref=SUBJ49)   # 選完多久以後還要選一科（BB-B 13:3x：第一次跑沒選科目＝沒開始讀）
            await pg.wait_for_timeout(8000); s2 = await pg.evaluate(SLOTQ); res['afterEve'] = s2
            run.check('%s：晚上讀完 1 件（used.ev＝1），晚上用完不跳（%.2f）' % (sid, s2['h']), s2['used'].get('ev') == 1 and s2['h'] < 20.5, J(s2))
            cs2 = await desk_menu(pg, cdp, run); r1 = next((c for c in cs2 if c['t'].startswith('讀書')), None); await run.shot(pg, '%s_eve_gray' % sid)
            run.check('%s：晚上再試＝「讀書」變灰、寫「這個晚上已經排滿了（1／1）」' % sid, bool(r1) and r1['dim'] and '這個晚上已經排滿了（1／1）' in r1['t'], J(cs2))
            await pick(pg, cdp, '起身'); await wait_idle(pg, cdp, secs=30)
            ts2 = await today_slots(pg, cdp); res['today1'] = ts2
            run.check('%s：手機「今天」下午 ●、晚上 ●' % sid, bool(ts2) and '下午 ●' in ts2['text'] and '晚上 ●' in ts2['text'], J(ts2 and ts2['text'][:120]))
        elif sid == 'SL49_CLASS':
            it = res['cls']; run.setup('[捷徑] %s：%s %s（%.2f～%.2f）用 CLS.goClass（＝下課選單「直接去下一堂」那一條，自動走到教室坐下）' % (sid, it['key'], it['c'], it['t0'], it['t1']))
            await pg.evaluate("(k=>{ const G=GAME.G; const it=CLS.dayItems(G,G.day).find(q=>q.key===k); if(it) void CLS.goClass(GAME,it,{}); })(%s)" % json.dumps(it['ik']))
            t0 = time.time(); done = False; after = None
            while time.time() - t0 < 900:
                done = await pg.evaluate("(k=>!!CLS.rec(GAME.G).done[k])(%s)" % json.dumps(it['ik']))
                s = await L.state(pg)
                if await phone_open(pg): await close_phone(pg, cdp); continue
                if s['choices']:
                    cs = await pg.evaluate(CHQ)
                    if done and any(c['t'].startswith('先自由活動') for c in cs): after = cs; break
                    await pick(pg, cdp, cs[0]['t']); continue
                if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
                if done and time.time() - t0 > 30:
                    await pg.wait_for_timeout(4000); s = await L.state(pg)
                    if not s['choices'] and not s['dlg']: break
                await pg.wait_for_timeout(1200)
            s1 = await pg.evaluate(SLOTQ); res['s1'] = s1; res['afterMenu'] = after; await run.shot(pg, '%s_after' % sid)
            run.check('%s：那堂課上完了（done）' % sid, done, J(s1))
            run.check('%s：上完一堂上午的課＝上午 ●（used.am＝1）' % sid, s1['used'].get('am') == 1, J(s1))
            if after:
                st = next((c for c in after if c['t'].startswith('在附近讀書')), None); res['studyOpt'] = st
                if st and s1['h'] < 12: run.check('%s：下課（%.2f、還在上午）「在附近讀書」變灰、寫上午已經排滿了' % (sid, s1['h']), st['dim'] and '上午已經排滿了' in st['t'], J(after))
                elif st: run.check('%s：下課已經是下午（%.2f）「在附近讀書」照下午算（沒有變灰）' % (sid, s1['h']), not st['dim'], J(after))
                else: say('   下課選單沒有「在附近讀書」（下一堂間隔不到 60 分鐘）：%s' % J(after))
                await pick(pg, cdp, '先自由活動'); await wait_idle(pg, cdp, secs=60)
            ts2 = await today_slots(pg, cdp); res['today1'] = ts2
            run.check('%s：手機「今天」上午 ●' % sid, bool(ts2) and '上午 ●' in ts2['text'], J(ts2 and ts2['text'][:120]))
        elif sid == 'SL49_OUT':
            t0 = time.time(); went = False
            while time.time() - t0 < 900:
                st = await L.state(pg)
                if await phone_open(pg): await close_phone(pg, cdp); continue
                if st['choices']:
                    cs = await choices(pg)
                    w = next((c for c in cs if c.startswith('現在出發') or c.startswith('出發')), None)
                    if w: await pick(pg, cdp, w); went = True; continue
                    if went: await pick(pg, cdp, cs[0]); continue
                    await pick(pg, cdp, cs[0]); continue
                if st['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
                tr = await pg.evaluate("(()=>{ const t=(GAME.G.flags.DATE_TRIPS||[]).slice(-1)[0]||(typeof DATE!=='undefined'&&DATE.trips?DATE.trips(GAME.G).slice(-1)[0]:null); const q=OUT.get(GAME.G,'date_T0002')||null; return {q:q?q.state:null, zone:GAME.G.zone, h:+GAME.G.hour.toFixed(2)}; })()")
                if went and tr['zone'] == 'dorm' and tr['h'] > 18.5: break
                await pg.wait_for_timeout(1500)
            await pg.wait_for_timeout(3000); s1 = await pg.evaluate(SLOTQ); res['s1'] = s1; await run.shot(pg, '%s_back' % sid)
            run.check('%s：出發了、回到宿舍（%s %.2f）' % (sid, s1['zone'], s1['h']), went and s1['h'] > 18.5, J(s1))
            run.check('%s：17:00 出門的校外約會回來＝晚上 ●（used.ev＝1）' % sid, s1['used'].get('ev') == 1, J(s1))
            ts2 = await today_slots(pg, cdp); res['today1'] = ts2
            run.check('%s：手機「今天」晚上 ●' % sid, bool(ts2) and '晚上 ●' in ts2['text'], J(ts2 and ts2['text'][:120]))
        elif sid == 'SL49_EXAM':
            run.check('%s：考試週（%s）' % (sid, key), s0['exam'], J(s0))
            gold = (ts or {}).get('html', '').count('color:#e9b96a')
            run.check('%s：三個時段各多一格金色（%d 個金色）、說明寫考試週只能自習' % (sid, gold), gold == 3 and '考試週：每個時段多一次（金色），只能拿來自習。' in (ts or {}).get('text', ''), J(ts and ts['text'][:200]))
            for k in range(2):
                await desk_menu(pg, cdp, run); await pick(pg, cdp, '整理今天的筆記'); await wait_idle(pg, cdp)
            s1 = await pg.evaluate(SLOTQ); res['s1'] = s1
            run.check('%s：整理筆記兩次＝下午 2 件（2／2）' % sid, s1['used'].get('pm') == 2, J(s1))
            cs = await desk_menu(pg, cdp, run); r0 = next((c for c in cs if c['t'].startswith('讀書')), None); await run.shot(pg, '%s_gray' % sid)
            run.check('%s：第三次＝「讀書」變灰「這個下午已經排滿了（2／2）」' % sid, bool(r0) and r0['dim'] and '這個下午已經排滿了（2／2）' in r0['t'], J(cs))
            await pick(pg, cdp, '起身'); await wait_idle(pg, cdp, secs=30)
            tr = await pg.evaluate("(()=>{ const G=GAME.G; const u=Object.assign({},CLS.slotRec(G).used); const G2=Object.assign({},G,{slots:{day:G.day,used:{am:0,pm:1,ev:0}}}); return {trip:CLS.slotPlan(G2,1,'trip').ok, study:CLS.slotPlan(G2,1,'study').ok}; })()")
            res['onlyStudy'] = tr
            run.check('%s：【讀資料】考試週下午用了 1 件：自由出行不行、自習還可以（金色那格只給自習）' % sid, tr['trip'] is False and tr['study'] is True, J(tr))
        elif sid == 'SL49_EAT':   # 阿鳳麵店的互動是「坐下吃麵」（原本只找「點」，找不到；BB-B 13:4x）
            it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>!i.hidden&&/點|吃麵/.test(i.label||'')); return it?[it.x,it.z,it.label]:null; })()"); res['counter'] = it
            ok = bool(it) and await L.go_to(pg, cdp, run, it[0], it[1], 1.0, it[2] if it else '櫃台', max_s=240)
            if ok:
                await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
                cs = await wait_idle(pg, cdp, secs=60)
                if cs: await pick(pg, cdp, cs[0]); await wait_idle(pg, cdp, secs=120, pref=['好', '謝謝'])
            s1 = await pg.evaluate(SLOTQ); res['s1'] = s1; lg = await pg.evaluate("window.__LOG"); res['said'] = [x['t'] for x in lg][-10:]
            run.check('%s：在麵店點了東西（%s）' % (sid, it and it[2]), ok and (s1['h'] > s0['h'] + 0.1 or any('吃' in x or '麵' in x for x in res['said'])), J({'s1': s1, 'said': res['said']}))
            run.check('%s：吃飯不算：下午的格子不變（used.pm＝%s）' % (sid, s1['used'].get('pm')), s1['used'].get('pm', 0) == s0['used'].get('pm', 0), J([s0, s1]))
        elif sid == 'SL49_MEET':
            t0 = time.time(); went = False; met = False; talks = 0
            while time.time() - t0 < 600:
                st = await L.state(pg)
                if await phone_open(pg): await close_phone(pg, cdp); continue
                if st['choices']:
                    cs = await choices(pg); w = next((c for c in cs if c.startswith('直接過去')), None)
                    if w: await pick(pg, cdp, w); went = True; res['goAt'] = await pg.evaluate('GAME.G.hour'); continue
                    await pick(pg, cdp, cs[0]); continue
                if st['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
                iv = await pg.evaluate("(()=>{ const iv=(GAME.G.invites||[]).find(x=>x.id==='iv_bb49'); return iv?iv.state:null; })()")
                if iv == 'done': met = True; res['metBy'] = 'talk' if talks else 'auto'; break
                if st.get('zone') == 'cafe' and 'arrive' not in res:
                    res['arrive'] = await pg.evaluate("(()=>{ const n=(GAME.E.npcs||[]).find(x=>x&&x.charId==='heroine_01'); return {h:+GAME.G.hour.toFixed(3), iv:((GAME.G.invites||[]).find(x=>x.id==='iv_bb49')||{}).state||null, an:!!n, anVis:!!(n&&n.obj&&n.obj.visible!==false&&!n.hidden), busy:!!(GAME.E.player&&GAME.E.player.busy)}; })()")
                    say('   到 Café：%s' % J(res['arrive'])); await pg.wait_for_timeout(8000); continue   # 先等 8 秒看會不會自己開始（INV.autoStart，使用者 10-21 23:2x：兩個都在場就直接開始）
                # 自己沒開始＝走過去和她說話（之後判定：要說話才開始＝不照 10-21 的設計；BB-B 13:5x：原本只等，到 15:30 她就走了）
                if went and st.get('zone') == 'cafe' and talks < 3:
                    pos = await pg.evaluate("(()=>{ const n=(GAME.E.npcs||[]).find(x=>x&&x.charId==='heroine_01'&&x.obj&&x.obj.visible!==false&&!x.hidden); return n?[n.obj.position.x,n.obj.position.z]:null; })()")
                    res.setdefault('anPos', []).append([round(await pg.evaluate('GAME.G.hour'), 3), pos])
                    if pos:
                        await L.go_to(pg, cdp, run, pos[0], pos[1], 1.1, '小安', max_s=90); lab = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()")
                        say('   互動鈕：「%s」' % lab); res.setdefault('labels', []).append(lab)
                        if '小安' in lab: talks += 1; await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200); continue   # talks 只算真的按了說話（BB-B 14:5x：sl49e 走過去、沒有按鈕、沒按，見面自己開始，卻記成 talk）
                await pg.wait_for_timeout(1500)
            await pg.wait_for_timeout(3000); s1 = await pg.evaluate(SLOTQ); res['s1'] = s1; await run.shot(pg, '%s_after' % sid)
            run.check('%s：直接過去、見面演完（invite done）' % sid, went and met, J({'s1': s1, 'goAt': res.get('goAt'), 'arrive': res.get('arrive'), 'anPos': res.get('anPos'), 'labels': res.get('labels')}))
            run.check('%s：到了就自己開始（不用找她說話；使用者 10-21 23:2x）' % sid, res.get('metBy') == 'auto', J({'metBy': res.get('metBy'), 'arrive': res.get('arrive')}))
            run.check('%s：約好的見面不算：下午的格子不變（used.pm＝%s）' % (sid, s1['used'].get('pm')), s1['used'].get('pm', 0) == s0['used'].get('pm', 0), J([s0, s1]))
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
        for sid in ORDER + SL_ORDER:
            if SCEN and sid not in SCEN: continue
            if not SCEN and sid in SL: continue   # 第 49 項只在指名（SCEN）時跑：fff3f8998 以後才有
            say('== %s（%s）' % (sid, os.environ.get('SHA', '?'))); t0 = time.time()
            if sid in SL: await sl49(p, run, base, sid)
            else: await scenario(p, run, base, sid)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
    run.finish()
asyncio.run(main())
