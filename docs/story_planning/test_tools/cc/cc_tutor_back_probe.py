"""CC-C 11-12：家教回「不了」以後，下一個學期開學明軒那一串多一個可回的選項「我現在可以接家教了。」（SHOP-JOBS 第六輪 AA_828 §9 第 2 點；src/jobs3d.js S.tutorBack；LAWWW-C 11:34、BB-C 11:35，結果給 BB 判）。Playwright（PC GPU）≠ iPhone。
做法：
  ①【前置／捷徑】讀檔到宿舍、大一下開學第一天 11:55（條件事件關掉）；旗標：接了家教（JOB_TUTOR、tutorFromDay＝大一上，開始學期＝大一上）、明軒是聯絡人 → 12:05 讓遊戲自己的手機檢查跑一次（JOBS.phone 排進手機佇列＋PHONE.tick 送出，和每次時間走的時候同一套；BB-C 12:27：r1 只呼叫 JOBS.phone、沒 tick＝那一則還在佇列裡，明軒那一串是空的＝探針問題）→
     照玩家：打開手機 →「訊息」→ 明軒那一串 → 截圖 → 按第二個選項（稿的 termOpts[1]＝不了）→ 截圖；記 TUTOR_TERM_Y1S2。
  ②【捷徑】日子直接跳到下一個學期（大二上）開學第一天 12:30（不讀檔、同一個存檔往後）→ 手機檢查跑一次 → 記 JOBS.tutorBackDue、選項掛在哪一則（第幾則、哪一句、ask id）→
     照玩家：打開手機 →「訊息」→ 明軒那一串 → 截圖（剛打開看得到選項嗎：按鈕在不在對話框的可視範圍、要不要往回捲、有沒有被蓋到）→ 看不到就捲到它再截一張 →
     按「我現在可以接家教了。」→ 截圖 → 記明軒回的那句、TUTOR_RE_ANS／TUTOR_STOP／TUTOR_TERM_Y2S1 → 再跑一次手機檢查 → 記有沒有排下一堂家教（G.outings 裡 tutor 的那幾筆）。
11-12 r4：打開那一串每一步截圖（主畫面、手機、訊息、那一串），點不到把列表倒出來（BB-C 14:31）。
11-12 r3：PHONE.tick 第二個參數要是函式（r2 傳 true → notify is not a function，BB-C 13:30）；打開那一串前先關手機。
CC_02 清單 2026-11-13：1✓（日子從遊戲讀：CALENDAR.termDays 大一下、大二上開學日） 2✓（明軒那一串、選項從畫面的 data-th／data-ask 找） 3✓（同一個存檔往後，不重讀） 4✓（選項照字找「我現在可以接家教了。」） 5n/a（手機操作，不走路） 6✓（每一步等 1～1.6 秒） 7✓ 8n/a（不判，給 BB） 9n/a（手機截圖不藏東西） 10✓（條件事件關掉） 11✓ 12✓（兩次打開手機同樣欄位） 13✓（讀檔、旗標、跳日子標【捷徑】）
三種起點（CASES，BB-C 11:51 照 AA_828 §10，同一支）：NO＝①按「不了」（上面這條）；EXPIRE＝開學那一則完全不回、讓它過期（第 4 題：一樣要出選項）；
  SKIP3＝開學那一則回「來」，然後【捷徑】記成連續三週沒去先停（G.flags.TUTOR_STOP＝大一下開學後第 30 天；第 6 題：不算回「不了」，下學期明軒要先問一次＝tutor_re_Y2S1，不是直接掛選項）。
  三種都記：選項／再問那一則是不是明軒那一串「最新一則」（第 5 題）。每一種重新讀檔。
用法：LW_TESTS=<wt>/tests SHA=<sha> [CASES=NO,EXPIRE,SKIP3] python3 cc_tutor_back_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]
R = L.Run('tutor_back', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
MX = 'p:classmate_mingxuan'
CASES = [c for c in (os.environ.get('CASES') or 'NO,EXPIRE,SKIP3').split(',') if c]
TERMS = r"""(()=>{ const a=CALENDAR.termDays('Y1S1'), b=CALENDAR.termDays('Y1S2'), c=CALENDAR.termDays('Y2S1'); const k=d=>CALENDAR.dateOf(d).key; return {y1s1:a, y1s2:b, y2s1:c, k1:k(b.from), k2:k(c.from)}; })()"""
PREP = r"""(a=>{ const G=GAME.G, F=G.flags; F.JOB_TUTOR=true; F.tutorFromDay=a.from; if(!G.contacts) G.contacts={}; if(G.contacts.classmate_mingxuan==null) G.contacts.classmate_mingxuan=2;
  G.hour=12.05; let n=null; try{ JOBS.phone(G); n=PHONE.tick?PHONE.tick(G,()=>{}):null; }catch(e){ return 'ERR '+String(e).slice(0,120); } return {start:JOBS.tutorStartTerm?JOBS.tutorStartTerm(G):null, delivered:n, queued:(PHONE.rec(G).q||[]).length}; })"""
MSGS = r"""(th=>{ const G=GAME.G; const L=(G.msgs||[]).filter(m=>m&&PHONE.th(m)===th); return L.map((m,i)=>({i, from:m.from||null, text:String(m.text||''), day:m.day, h:m.h, tag:m.tag||null, ask:m.ask?{id:m.ask.id, opts:(m.ask.opts||[]).map(o=>o.t), until:m.ask.until, open:PHONE.askOpen(G,m)}:null, ans:m.ans==null?null:m.ans})); })"""
VIEW = r"""(()=>{ const pb=document.getElementById('phoneBody'); if(!pb) return {open:false}; const sc=[pb,...pb.querySelectorAll('*')].find(e=>e.scrollHeight>e.clientHeight+4&&/(auto|scroll)/.test(getComputedStyle(e).overflowY))||pb; const R=sc.getBoundingClientRect();
  const btn=[...pb.querySelectorAll('[data-ask]')].map(b=>{ const r=b.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2, top=document.elementFromPoint(cx,cy);
    return {v:b.dataset.ask, t:(b.innerText||'').trim(), dis:!!b.disabled, rect:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)], inView:r.top>=R.top-1&&r.bottom<=R.bottom+1&&r.height>0, onTop:!!top&&(top===b||b.contains(top)), coveredBy:top&&top!==b&&!b.contains(top)?(top.id||top.className||top.tagName):null}; });
  return {open:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()), scrollTop:Math.round(sc.scrollTop), scrollHeight:sc.scrollHeight, clientHeight:sc.clientHeight, atBottom:sc.scrollTop+sc.clientHeight>=sc.scrollHeight-4, box:[Math.round(R.top),Math.round(R.bottom)], asks:btn,
    text:(pb.innerText||'').replace(/\s+/g,' ').slice(-400)}; })()"""
TUT = r"""(()=>{ const G=GAME.G, F=G.flags; const O=(typeof OUT!=='undefined'&&OUT.rec)?OUT.rec(G).filter(q=>q&&/tutor/i.test(String(q.id||'')+String(q.ev||''))).map(q=>({id:q.id, ev:q.ev, day:q.day, key:CALENDAR.dateOf(q.day).key, h:q.h, state:q.state})):[];
  const k={}; for(const x of Object.keys(F)) if(/^TUTOR|^tutor|^JOB_TUTOR/.test(x)) k[x]=F[x]; return {flags:k, due:JOBS.tutorBackDue?JOBS.tutorBackDue(G):null, outings:O, key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(2)}; })()"""


async def open_thread(pg, cdp, tag='th'):
    """照玩家：主畫面 → 手機 → 訊息 → 明軒那一串；每一步截圖（BB-C 14:31），點不到就把聊天列表倒出來"""
    global _TH_N
    _TH_N += 1; pre = 'tutor_open_%02d_%s' % (_TH_N, tag)
    await close_phone(pg, cdp)   # 11-12 r3：上一次留著同一串的畫面，列表不在 → 點不到；先關掉再照玩家打開
    # 11-13 BB-C（r5 ② FAIL＝探針）：9/7 12:30 宿舍正在演對話（「312。阿哲的籃球…」），手機點不開＝先照玩家把對話點完、選單選第一個不是離開類的，等 busy=false 再開手機
    said = []
    for _ in range(80):
        q = await pg.evaluate("(()=>{ const d=document.getElementById('dlg'); const ch=[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()); return {dlg:!!(d&&d.offsetParent), t:d?(d.innerText||'').trim().slice(0,60):'', ch, busy:!!(GAME.E.player&&GAME.E.player.busy)}; })()")
        if q['ch']:
            i = next((n for n, t in enumerate(q['ch']) if not any(w in t for w in ('算了', '離開', '不用', '先不要'))), 0); said.append('▶' + q['ch'][i])
            await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % i); await pg.wait_for_timeout(700); continue
        if q['dlg']: said.append(q['t']); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if not q['busy']: break
        await pg.wait_for_timeout(400)
    if said: R.note('%s 開手機前先把正在演的對話點完：%s' % (tag, J(said[:12])))
    busy = await pg.evaluate("!!(GAME.E.player&&GAME.E.player.busy)")
    R.check('FAIL_SETUP 檢查：%s 開手機前沒有對話、busy=false' % tag, not busy, J(said[-3:]))
    await pg.screenshot(path=os.path.join(OUT, pre + '_1_main.png'))
    if not await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
    await pg.screenshot(path=os.path.join(OUT, pre + '_2_phone.png'))
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="msg"]'); await pg.wait_for_timeout(1000)
    await pg.screenshot(path=os.path.join(OUT, pre + '_3_msg.png'))
    sel = '#phoneBody .chatList [data-th=%s]' % J(MX)
    await pg.evaluate("(s=>{ const e=document.querySelector(s); if(e) e.scrollIntoView({block:'center'}); })", sel); await pg.wait_for_timeout(300)
    ok = await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1300)
    await pg.screenshot(path=os.path.join(OUT, pre + '_4_thread.png'))
    if not ok:
        dump = await pg.evaluate(r"""(()=>{ const b=document.getElementById('phoneBody'); const tabs=[...document.querySelectorAll('#phoneTabs button')].map(x=>[x.dataset.ptab,x.className]);
          return {open:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()), tabs, chatList:!!(b&&b.querySelector('.chatList')), th:[...(b?b.querySelectorAll('[data-th]'):[])].map(x=>[x.dataset.th,(x.textContent||'').trim().slice(0,30),x.offsetParent?1:0]),
            body:b?(b.innerText||'').replace(/\s+/g,' ').slice(0,300):null}; })()""")
        R.note('打開明軒那一串點不到：畫面 %s' % J(dump))
    return ok


_TH_N = 0


async def close_phone(pg, cdp):
    for _ in range(3):
        if not await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): return
        await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(800)


async def one(pg, cdp, T, case, res):
    tag = '[%s]' % case
    await pg.goto(URL); await L.wait_loaded(pg)
    await D.load_zone(pg, cdp, 'dorm', T['k1'], 11.9, wait=5000)
    pr = await pg.evaluate(PREP, {'from': T['y1s1']['from'] + 40})
    R.setup('%s ①【前置／捷徑】讀檔到宿舍 %s（大一下開學第一天）11:54；旗標 JOB_TUTOR、tutorFromDay＝大一上第 40 天；12:05 跑一次 JOBS.phone → %s' % (tag, T['k1'], J(pr)))
    m1 = await pg.evaluate(MSGS, MX); R.note('%s ① 明軒那一串：%s' % (tag, J(m1)))
    if not R.check('%s ① 開學那一則（tutor_term_Y1S2）有來' % tag, any(m['ask'] and m['ask']['id'] == 'tutor_term_Y1S2' for m in m1), J(m1)): return
    if case in ('NO', 'SKIP3'):
        ok = await open_thread(pg, cdp); v = await pg.evaluate(VIEW); await pg.screenshot(path=os.path.join(OUT, 'tutor_%s_1_term_ask.png' % case))
        asks = [a for a in v.get('asks', []) if not a['dis']]
        R.note('%s ① 打開明軒那一串（點到 %s）：選項 %s' % (tag, ok, J(asks)))
        if not R.check('%s ① 看得到兩個選項' % tag, len(asks) >= 2, J(v.get('asks'))): return
        k = 1 if case == 'NO' else 0
        R.note('%s ① 按「%s」' % (tag, asks[k]['t']))
        await L.tap(pg, cdp, '#phoneBody [data-ask=%s]' % J(asks[k]['v'])); await pg.wait_for_timeout(1600)
        await pg.screenshot(path=os.path.join(OUT, 'tutor_%s_2_answered.png' % case))
        await close_phone(pg, cdp)
    else:
        R.note('%s ① 開學那一則不回（讓它過期）' % tag)
    if case == 'SKIP3':
        await pg.evaluate("(a=>{ GAME.G.flags.TUTOR_STOP=a; })", T['y1s2']['from'] + 30)
        R.setup('%s ①b【捷徑】記成連續三週沒去先停：G.flags.TUTOR_STOP＝大一下開學後第 30 天（沒有 TUTOR_RE_NO）' % tag)
    t1 = await pg.evaluate(TUT); R.note('%s ① 之後旗標：%s' % (tag, J(t1['flags'])))
    await pg.evaluate("(a=>{ const G=GAME.G; G.day=a.d; G.weekday=CALENDAR.dateOf(a.d).wd%7; G.hour=12.5; try{ JOBS.phone(G); PHONE.tick(G,()=>{}); JOBS.phone(G); PHONE.tick(G,()=>{}); }catch(e){} })", {'d': T['y2s1']['from']})
    await pg.wait_for_timeout(1500)
    R.setup('%s ②【捷徑】日子直接跳到 %s（大二上開學第一天）12:30、跑一次 JOBS.phone' % (tag, T['k2']))
    t2 = await pg.evaluate(TUT); m2 = await pg.evaluate(MSGS, MX)
    hang = [m for m in m2 if m['ask'] and str(m['ask']['id']).startswith('tutor_back_')]
    reask = [m for m in m2 if m['ask'] and str(m['ask']['id']).startswith('tutor_re_')]
    last = len(m2) - 1
    R.note('%s ② tutorBackDue=%s；旗標 %s；明軒那一串（%d 則）：%s' % (tag, t2['due'], J(t2['flags']), len(m2), J(m2)))
    R.note('%s ② 「接家教」選項掛在：%s；再問那一則：%s' % (tag, J([{'第幾則': m['i'] + 1, '共幾則': len(m2), 'text': m['text'], 'ask': m['ask']} for m in hang]), J([{'第幾則': m['i'] + 1, 'text': m['text'], 'ask': m['ask']} for m in reask])))
    rec = {'t1': t1, 't2': t2, 'msgs': m2}
    res[case] = rec
    if case == 'SKIP3':
        R.check('%s ② 不直接掛「我現在可以接家教了。」（不算回不了）' % tag, not any(any('我現在可以接家教了' in o for o in m['ask']['opts']) for m in hang), J(hang))
        R.check('%s ② 明軒先問一次（tutor_re_Y2S1）、而且是最新一則' % tag, any(m['ask']['id'] == 'tutor_re_Y2S1' and m['i'] == last for m in reask), J(reask))
        ok = await open_thread(pg, cdp); v2 = await pg.evaluate(VIEW); await pg.screenshot(path=os.path.join(OUT, 'tutor_%s_3_reask_open.png' % case))
        R.note('%s ② 打開明軒那一串：%s' % (tag, J(v2))); rec['view'] = v2
        await close_phone(pg, cdp); return
    R.check('%s ② 明軒那一串多一個「我現在可以接家教了。」的選項' % tag, any(any('我現在可以接家教了' in o for o in m['ask']['opts']) for m in hang), J(hang))
    R.check('%s ② 選項掛在最新一則底下（第 5 題）' % tag, any(m['i'] == last for m in hang), J([[m['i'] + 1, len(m2)] for m in hang]))
    ok = await open_thread(pg, cdp); v2 = await pg.evaluate(VIEW); await pg.screenshot(path=os.path.join(OUT, 'tutor_%s_3_back_open.png' % case))
    R.note('%s ② 剛打開明軒那一串（點到 %s）：捲動 %s/%s（看得到 %s、在最下面 %s）；選項 %s' % (tag, ok, v2.get('scrollTop'), v2.get('scrollHeight'), v2.get('clientHeight'), v2.get('atBottom'), J(v2.get('asks'))))
    want = next((a for a in v2.get('asks', []) if '我現在可以接家教了' in a['t']), None); rec['view'] = v2
    R.check('%s ② 剛打開就看得到選項（在可視範圍、沒被蓋到、按得到）' % tag, bool(want) and want['inView'] and want['onTop'] and not want['dis'], J(want))
    if want and not (want['inView'] and want['onTop']):
        await pg.evaluate("(v=>{ const b=document.querySelector('#phoneBody [data-ask=\"'+v+'\"]'); if(b) b.scrollIntoView({block:'center'}); })", want['v']); await pg.wait_for_timeout(800)
        v3 = await pg.evaluate(VIEW); await pg.screenshot(path=os.path.join(OUT, 'tutor_%s_4_back_scrolled.png' % case))
        R.note('%s ② 要捲過去才看得到：捲到 %s；選項 %s' % (tag, v3.get('scrollTop'), J(v3.get('asks')))); want = next((a for a in v3.get('asks', []) if '我現在可以接家教了' in a['t']), want)
    if want:
        await L.tap(pg, cdp, '#phoneBody [data-ask=%s]' % J(want['v'])); await pg.wait_for_timeout(1600)
        await pg.screenshot(path=os.path.join(OUT, 'tutor_%s_5_back_answered.png' % case))
        m3 = await pg.evaluate(MSGS, MX); t3 = await pg.evaluate(TUT)
        R.note('%s ② 回了以後明軒那一串最後三則：%s；旗標 %s' % (tag, J(m3[-3:]), J(t3['flags'])))
        await close_phone(pg, cdp)
        await pg.evaluate("(()=>{ try{ JOBS.phone(GAME.G); PHONE.tick(GAME.G,true); }catch(e){} })()"); await pg.wait_for_timeout(800)
        t4 = await pg.evaluate(TUT)
        R.note('%s ② 再跑一次手機檢查：旗標 %s；家教出遊 %s' % (tag, J(t4['flags']), J(t4['outings'])))
        R.check('%s ② 回了以後接回來（TUTOR_STOP 清掉或這學期記 go）' % tag, t4['flags'].get('TUTOR_STOP') is None or t4['flags'].get('TUTOR_TERM_Y2S1') == 'go', J(t4['flags']))
        R.check('%s ② 排了下一堂（G.outings 有還沒上的家教）' % tag, any(o['state'] == 'planned' for o in t4['outings']), J(t4['outings']))
        rec['after'] = {'msgs': m3[-3:], 'tut': t4}


async def main():
    print('CC 家教回不了以後再接：SHA %s；CASES %s' % (SHA or '?', CASES), flush=True)
    res = {'sha': SHA}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=False)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        T = await pg.evaluate(TERMS); res['terms'] = T
        for c in CASES:
            try: await one(pg, cdp, T, c, res)
            except Exception as e: R.check('[%s] 沒有探針例外' % c, False, str(e)[:200])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'tutor_back.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
