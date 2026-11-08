"""CC-B（帳號 B）11-08：AA593-SIS-1B（LAWWW-B 2cfe053a1、35793d382；AA_593 第 11 節）學姊手機改字，瀏覽器抽看。判定＝BB。
MODES（逗號分隔；每一種重開瀏覽器）：
  r1     一試沒過 2029-09-07：【前置】畢業後最小存檔（pgdate_probe base_state）＋BAR_REG、BAR_SIT_2029、BAR_STAGE_2029 'none'，學姊 FRIEND 以上、沒分手，
         讀在 14:50 → 站著等到 15:25 → 手機 p:heroine_05：15:10 祐廷「沒上。」→ 15:20 她「很厲害了啊。」「考完就先放鬆一下。」、沒有回覆鍵
  hlib   學姊主動約（非交往）總圖：【前置】day46 存檔、學期中平日 11:50，學姊熟（第 4 階）；12:06 以後站著等 HASK.plan；
         沒排到「明天五點以後，我在總圖三樓。」＝【捷徑】在 HASK.rec(G).sent 塞一筆（library、pre、alt 0、送出時間＝現在），讓 HASK.phone 照常送出
         → 手機那一則一字不差、有回覆鍵 → 照玩家按「答應」→ G.invites 有那一筆 accepted
  htea   交往中版一盞「週六下午有空嗎？想去一盞。」：同上（dating_heroine_05、ROM.start），【捷徑】塞 teahouse、dat
  flake  第二次放鴿子：【捷徑】DATE.cancel 記一次（5 天前）→ 照玩家手機約學姊「出去玩」→ 第一個能選的 → 到出發那天【前置】撥到出發前 → 跳出來的選單按「今天不去了」→ 她「第二次了。」「我不喜歡這樣。」
  jx     礁溪（非交往 friend）：【捷徑】ENC.meet(GAME, D24 學姊那一列, ENC.tier) → 第一句「學弟。……我們一家來的。」→ 旁白媽媽點頭 → Alison 轉頭；結尾沒有「坐下來一起泡吧。阿公說人多比較好。」
  jxd    同上交往中版（對照）
  jp     日本路線 2028-06-26：【前置】day46 存檔改到 2028-06-26 19:50、EXCHANGE_ROUTE JP、met_sis、學姊熟 → 等到 20:30 → 手機那一串「七月排滿了。八月二號出發。」、最後一則三個回覆鍵（字照 MSG_REPLIES）→ 點第一個 → 她接著回
  pg2030 畢業後每月一格 2030-01（交往中）：【前置】畢業後最小存檔＋學姊交往 →【捷徑：問排程】PGDATE.sixMonth 2029-09、2030-01 →【前置】讀到 2030-01 那一格的前一小時 → 照玩家「出發」→ 她那一句
用法：LW_TESTS=<wt>/tests SAVE46=… [MODES=…] python3 cc_aa593_sis_probe.py '<url>/index.html' <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
R = L.Run('aa593', OUT); D.setup(R, OUT)
SAVE46 = os.environ.get('SAVE46')
SIS = 'heroine_05'
MODES = [m for m in (os.environ.get('MODES') or 'r1,hlib,htea,flake,jx,jxd,jp,pg2030').split(',') if m]
HOOK = """(()=>{ if(window.__ccQ) return; window.__ccQ=1; window.__says=[]; const iv=setInterval(()=>{ if(typeof GAME==='undefined'||!GAME.say||GAME.say.__cc) return; const o=GAME.say;
  const w=function(who,t){ try{ const L=window.__says, e={who:who?(typeof who==='string'?who:(who.name||'')):'', t:String(t||''), h:+(+GAME.G.hour).toFixed(2), d:GAME.G.day}, p=L[L.length-1]; if(!(p&&p.t===e.t&&p.who===e.who&&p.h===e.h)) L.push(e); }catch(_){} return o.apply(this,arguments); }; w.__cc=1; GAME.say=w; },50); })()"""
THREAD = "(th=>(GAME.G.msgs||[]).filter(m=>PHONE.th(m)===th).map(m=>({d:CALENDAR.dateOf(m.day).key, h:+(+m.h||0).toFixed(2), from:m.from||m.who||'', text:String(m.text||''), ask:m.ask?{id:m.ask.id, opts:(m.ask.opts||[]).map(o=>o.t), must:!!m.ask.must}:null, ans:m.ans!=null?m.ans:null, tag:m.tag||null})))"


def base_pg(dk, key, h, extra=None):
    F = {'KX_DEC3_MIGRATED': True, 'GRADUATED': dk['2029-06-02'], 'GRAD_DONE': True, 'PG': {'done': {'grad': 1}},
         'MOVED_OUT': dk['2029-06-28'], 'HOME_AFTER': 'home', 'Y4_PATH': 'other', 'PACKED_Y4': dk['2029-06-01']}
    F.update(extra or {})
    return {'v': 2, 'stage': 'law', 'name': '祐廷', 'day': dk[key], 'hour': h, 'energy': 100, 'money': 22000, 'zone': 'campus',
            'pos': {'x': -34, 'z': 12.5, 'yaw': 3.14159, 'lv': 0}, 'weather': 'clear', 'flags': F,
            'events': {'done': {'ev_grad_family': 1, 'ev_grad_lunch': 1, 'ev_grad_envelope': 1, 'ev_move_out_y4': 1}, 'last': {}, 'count': 0}}


async def dks(pg, keys):
    return await pg.evaluate("(ks=>{ const o={}; for(const k of ks) o[k]=STORY.dayOfKey(k); return o; })", keys)


async def load46(pg, cdp, tag, key, h, zone='dorm', flags=None):
    sv = json.load(open(SAVE46, encoding='utf-8')); d = await pg.evaluate("STORY.dayOfKey('%s')" % key)
    sv['weekday'] = ((sv.get('weekday', 0) + (d - sv['day'])) % 7 + 7) % 7; sv['day'] = d; sv['hour'] = h; sv['zone'] = zone; sv['pos'] = None
    sv.setdefault('home', {})['at'] = False; sv.setdefault('flags', {}).update(flags or {})
    R.setup('%s 【前置】day46 存檔改到 %s %.2f %s；旗標 %s' % (tag, key, h, zone, J(flags or {})))
    await L.load_state(pg, sv, quiet_phone=True); await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp); await pg.evaluate(HOOK)
    return d


async def sis_rel(pg, tag, dating=False):
    R.setup('%s 【捷徑】學姊 FIRST_MET、rel fam 65 trust 50 comf 45%s' % (tag, '、ROM.start（交往）' if dating else ''))
    return await pg.evaluate("(dt=>{ const id='heroine_05'; SOCIAL.remember(id,'FIRST_MET',''); Object.assign(SOCIAL.rel(id),{fam:65,trust:50,comf:45,npcRom:dt?60:10,rom:dt?40:0}); const F=GAME.G.flags; F.met_sis=true; if(!GAME.G.contacts) GAME.G.contacts={}; if(typeof INV!=='undefined'&&INV.addContact) INV.addContact(GAME.G,id); if(dt){ try{ ROM.start(GAME.G,id); }catch(e){ F['dating_'+id]=true; } } return {stage:DATE.stageNum(id), dating:!!F['dating_'+id]}; })", dating)


async def stand_until(pg, cdp, day, h, max_s=900, skip=True, stop_on_choice=False):
    t0 = time.time()
    while time.time() - t0 < max_s:
        c = await pg.evaluate("({d:GAME.G.day, h:+GAME.G.hour})")
        if c['d'] > day or (c['d'] == day and c['h'] >= h): return True
        s = await L.state(pg)
        if s['choices'] and stop_on_choice: return True   # 選單跳出來（例：出發選單）交給呼叫的人選
        if s['choices']: await L.tap(pg, cdp, '#choices button'); await pg.wait_for_timeout(700); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        await L.close_panels(pg, cdp); await pg.wait_for_timeout(1500)
    return False


async def open_thread(pg, cdp, th, shot):
    await pg.evaluate("(th=>{ GAME.openPhone('msg', th); })", th); await pg.wait_for_timeout(1500)
    await pg.evaluate("(()=>{ const b=document.getElementById('phoneBody'); if(b) b.scrollTop=b.scrollHeight; })()"); await pg.wait_for_timeout(500)
    await R.shot(pg, shot)
    return await pg.evaluate("(()=>{ const b=document.getElementById('phoneBody'); return {text:(b&&b.innerText||'').slice(-900), asks:[...document.querySelectorAll('#phoneBody [data-ask],#phoneBody [data-ans]')].map(x=>x.textContent.trim())}; })()")


async def tap_sel_text(pg, cdp, sel, want):
    c = await pg.evaluate("(([s,w])=>{ const b=[...document.querySelectorAll(s)].find(x=>x.textContent.trim().startsWith(w)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,b.textContent.trim()]; })", [sel, want])
    if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
    return c


async def drive(pg, cdp, prefs, max_s=240, idle_end=8):
    out = []; t0 = time.time(); quiet = None
    while time.time() - t0 < max_s:
        s = await L.state(pg)
        if s['choices']:
            quiet = None; bs = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>({t:b.innerText.trim(), dim:b.classList.contains('dim')||b.disabled}))")
            k = None
            for w in prefs:
                k = next((i for i, b in enumerate(bs) if w in b['t'] and not b['dim']), None)
                if k is not None: break
            if k is None: k = next((i for i, b in enumerate(bs) if not b['dim'] and not any(x in b['t'] for x in ('算了', '返回', '取消'))), 0)
            out.append([b['t'] for b in bs] + ['→ ' + bs[k]['t']])
            c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button')[i]; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })", k)
            await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900); continue
        if s['dlg']: quiet = None; await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if quiet is None: quiet = time.time()
        if time.time() - quiet > idle_end: break
        await pg.wait_for_timeout(400)
    return out


async def m_r1(pg, cdp, tag, rec):
    dk = await dks(pg, ['2029-06-01', '2029-06-02', '2029-06-28', '2029-09-07'])
    st = base_pg(dk, '2029-09-07', 14 + 50 / 60, {'BAR_REG': True, 'BAR_SIT_2029': True, 'BAR_STAGE_2029': 'none', 'Y4_PATH': 'bar'})
    R.setup('%s 【前置】畢業後最小存檔 2029-09-07 14:50＋BAR_REG、BAR_SIT_2029、BAR_STAGE_2029 none、Y4_PATH bar' % tag)
    await L.load_state(pg, st); await pg.wait_for_timeout(4000); await pg.evaluate(HOOK)
    await sis_rel(pg, tag)
    ok = await stand_until(pg, cdp, dk['2029-09-07'], 15 + 25 / 60, max_s=1200)
    th = await pg.evaluate(THREAD, 'p:' + SIS); now = await pg.evaluate("({d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(2)})")
    ui = await open_thread(pg, cdp, 'p:' + SIS, 'r1_thread')
    R.note('%s 等到 15:25＝%s（現在 %s）；學姊那一串：%s；畫面 %s' % (tag, ok, J(now), J(th[-6:]), J(ui)))
    t = [x for x in th if x['d'] == '2029-09-07']
    R.check('%s 15:10 祐廷「沒上。」→ 15:20 她「很厲害了啊。」「考完就先放鬆一下。」' % tag, [(x['from'], x['text']) for x in t[-3:]] == [('player', '沒上。'), (SIS, '很厲害了啊。'), (SIS, '考完就先放鬆一下。')], J(t))
    R.check('%s 這一串沒有回覆鍵' % tag, not any(x['ask'] for x in t) and not ui['asks'], J([ui['asks'], [x['ask'] for x in t]]))
    rec['r1'] = {'thread': th, 'ui': ui, 'now': now}


async def m_hask(pg, cdp, tag, rec, dating):
    key = os.environ.get('HASK_DAY') or '2026-10-14'
    d = await load46(pg, cdp, tag, key, 11 + 50 / 60, 'dorm')
    st = await sis_rel(pg, tag, dating); R.note('%s 學姊：%s' % (tag, J(st)))
    want = '週六下午有空嗎？想去一盞。' if dating else '明天五點以後，我在總圖三樓。'
    await stand_until(pg, cdp, d, 12.2, max_s=600)
    sent = await pg.evaluate("(()=>JSON.parse(JSON.stringify((HASK.rec(GAME.G).sent||[]).filter(x=>x.id==='heroine_05'))))()")
    R.note('%s 12:06 以後 HASK 排的：%s' % (tag, J(sent)))
    lineOf = await pg.evaluate("(()=>(HASK.rec(GAME.G).sent||[]).filter(x=>x.id==='heroine_05').map(x=>HASK.lineOf(x)))()")
    if want in lineOf:   # CC-B 09:4x：HASK 排在隔天晚上送（run47 hlib：send 393 天 22:30，探針站著等不到）→ 送出時間撥到現在
        R.setup('%s 【捷徑】HASK 已排這一句、送出時間在之後：send 改成現在，讓 HASK.phone 照常送' % tag)
        await pg.evaluate("(w=>{ const G=GAME.G; for(const x of (HASK.rec(G).sent||[])) if(x.id==='heroine_05'&&x.state==='planned'&&HASK.lineOf(x)===w) x.send={day:G.day,h:+(G.hour%24+0.05).toFixed(2)}; })", want)
    if want not in lineOf:
        R.setup('%s 【捷徑】HASK 沒排到這一句：塞一筆（%s）、送出時間＝現在，讓 HASK.phone 照常送' % (tag, 'teahouse dat' if dating else 'library pre alt 0'))
        await pg.evaluate("""(dt=>{ const G=GAME.G, R=HASK.rec(G); R.seq=(R.seq|0)+1; const wd=G.weekday; let day=G.day+1; if(dt){ day=G.day+((6-wd+7)%7||7); }
          R.sent.push({sid:R.seq,id:'heroine_05',k:'d',vk:dt?'dat':'pre',day,h:dt?14:17.5,place:dt?'teahouse':'library',here:false,send:{day:G.day,h:+(G.hour%24+0.05).toFixed(2)},state:'planned'}); })""", dating)
    t0 = time.time()
    while time.time() - t0 < 300:
        th = await pg.evaluate(THREAD, 'p:' + SIS)
        if any(x['text'] == want for x in th): break
        await stand_until(pg, cdp, d, (await pg.evaluate("+GAME.G.hour")) + 0.2, max_s=60)
    th = await pg.evaluate(THREAD, 'p:' + SIS); ui = await open_thread(pg, cdp, 'p:' + SIS, 'hask_%s' % ('tea' if dating else 'lib'))
    m = [x for x in th if x['text'] == want]
    R.note('%s 學姊那一串（最後 4 則）：%s；畫面回覆鍵 %s' % (tag, J(th[-4:]), J(ui['asks'])))
    R.check('%s 手機「%s」一字不差' % (tag, want), bool(m), J(th[-3:]))
    R.check('%s 有回覆鍵（答應／改天／不了）' % tag, any('答應' in a for a in ui['asks']), J(ui['asks']))
    iv0 = await pg.evaluate("(GAME.G.invites||[]).length")
    c = await tap_sel_text(pg, cdp, '#phoneBody [data-ans],#phoneBody [data-ask]', '答應')
    await pg.wait_for_timeout(1500); await drive(pg, cdp, [], max_s=60, idle_end=4)
    ivs = await pg.evaluate("(()=>JSON.parse(JSON.stringify((GAME.G.invites||[]).filter(v=>v.who==='heroine_05').slice(-2).map(v=>({id:v.id,state:v.state,place:v.place,day:CALENDAR.dateOf(v.day).key,h:v.h,by:v.by})))))()")
    R.note('%s 按「答應」：%s；約好的 %s' % (tag, J(c), J(ivs)))
    R.check('%s 按「答應」排進約好的（accepted）' % tag, any(v['state'] == 'accepted' for v in ivs), J(ivs))
    rec['hask_' + ('tea' if dating else 'lib')] = {'thread': th[-6:], 'ui': ui, 'invites': ivs}


async def m_flake(pg, cdp, tag, rec):
    d = await load46(pg, cdp, tag, '2026-10-14', 13.0, 'dorm')
    st = await sis_rel(pg, tag, True); R.note('%s 學姊：%s' % (tag, J(st)))
    R.setup('%s 【捷徑】DATE.cancel 記第一次沒去（5 天前）' % tag)
    await pg.evaluate("(()=>{ DATE.cancel(GAME.G,'heroine_05',GAME.G.day-5); })()")
    await pg.evaluate("GAME.openPhone('friends')"); await pg.wait_for_timeout(1500)
    await L.tap(pg, cdp, '[data-inv="heroine_05"]'); await pg.wait_for_timeout(1200)
    c = await drive(pg, cdp, ['出去玩'], max_s=240, idle_end=6)
    trips = await pg.evaluate("(()=>JSON.parse(JSON.stringify((GAME.G.outings||[]).filter(q=>q.dateTrip).slice(-1))))()")
    R.note('%s 約「出去玩」：選項 %s；排的 %s' % (tag, J(c), J(trips)))
    if not R.check('%s 排到一次出去玩' % tag, bool(trips), ''): return
    q = trips[0]
    R.setup('%s 【前置】時間撥到出發前（%s %.2f 以前 0.3 小時）' % (tag, q.get('day'), q.get('h') or 0))
    await pg.evaluate("(q=>{ const G=GAME.G; const dd=q.day; G.weekday=(G.weekday+(dd-G.day)+7*10)%7; G.day=dd; G.hour=Math.max(8,(q.h||14)-(q.travelH||1)-0.3); })", q)
    await pg.evaluate("window.__says=[]")
    await stand_until(pg, cdp, q['day'], (q.get('h') or 14) - (q.get('travelH') or 0) - 0.02, max_s=900, stop_on_choice=True)   # CC-B 09:4x：等到出發時間（run47 flake：drive 20 秒沒事就結束，出發選單還沒跳）
    dep = (q.get('h') or 14) - (q.get('travelH') or 0)
    c2 = []
    for _ in range(6):   # CC-B 11:3x：先跳的是提醒（「現在出發／到時間再說」）→ 選「到時間再說」；出發時間到才是 DATE.prompt（出發／改時間／今天不去了）
        c = await drive(pg, cdp, ['今天不去了', '算了，今天不去了', '到時間再說'], max_s=300, idle_end=15); c2 += c
        if any(('今天不去了' in x[-1]) for x in c if x): break
        await stand_until(pg, cdp, q['day'], dep + 0.02, max_s=900, stop_on_choice=True)
    says = await pg.evaluate("window.__says||[]")
    R.note('%s 出發選單：%s；說的話 %s' % (tag, J(c2), J(says[-6:])))
    tx = [x['t'] for x in says]
    R.check('%s 第二次：她「第二次了。」「我不喜歡這樣。」' % tag, '第二次了。' in tx and '我不喜歡這樣。' in tx, J(tx[-4:]))
    rec['flake'] = {'trip': q, 'choices': c2, 'says': says[-8:]}


async def m_jx(pg, cdp, tag, rec, dating):
    await load46(pg, cdp, tag, '2027-09-19', 11.0, 'dorm')
    st = await sis_rel(pg, tag, dating); R.note('%s 學姊：%s' % (tag, J(st)))
    R.setup('%s 【捷徑】ENC.meet(GAME, D24 學姊那一列, ENC.tier)（礁溪泡腳池那一場；不走出遊流程）' % tag)
    await pg.evaluate("window.__says=[]")
    await pg.evaluate("(()=>{ const row=ENC.rows('D24').find(r=>r.who==='heroine_05'); void ENC.meet(GAME,row,ENC.tier(GAME.G,'heroine_05')); })()")
    await pg.wait_for_timeout(1500)
    c = await drive(pg, cdp, [], max_s=240, idle_end=8)
    says = await pg.evaluate("window.__says||[]"); tx = [x['t'] for x in says]
    R.note('%s 說的話：%s；選項 %s' % (tag, J([[x['who'], x['t']] for x in says]), J(c)))
    if not dating:
        R.check('%s 第一句「學弟。……我們一家來的。」→「（學姊的媽媽點了一下頭。）」→ Alison 轉頭' % tag, tx[:3] == ['學弟。……我們一家來的。', '（學姊的媽媽點了一下頭。）', '（那個背對你的女生轉過頭來。是 Alison。）'], J(tx[:3]))
        R.check('%s 結尾沒有「坐下來一起泡吧。阿公說人多比較好。」' % tag, not any('坐下來一起泡吧' in t for t in tx), '')
    else:
        R.check('%s 交往中版第一句「你怎麼在這裡？」' % tag, bool(tx) and tx[0] == '你怎麼在這裡？', J(tx[:2]))
    rec['jx' + ('d' if dating else '')] = {'says': says}


async def m_jp(pg, cdp, tag, rec):
    d = await load46(pg, cdp, tag, '2028-06-26', 19 + 50 / 60, 'dorm', {'EXCHANGE_ROUTE': 'JP', 'met_sis': True})
    st = await sis_rel(pg, tag); R.note('%s 學姊：%s；SISJP.ok %s' % (tag, J(st), await pg.evaluate("(()=>{ try{ return SISJP.ok(GAME.G); }catch(e){ return String(e); } })()")))
    await stand_until(pg, cdp, d, 21.6, max_s=1200)   # CC-B 09:5x：臺灣 20:00＝人在日本的遊戲時鐘 21:00（SISJP twH，+1）；run47 等到 20:30 太早
    th = await pg.evaluate(THREAD, 'p:' + SIS); t = [x for x in th if x['d'] == '2028-06-26']
    ui = await open_thread(pg, cdp, 'p:' + SIS, 'jp_thread')
    exp = await pg.evaluate("(()=>{ try{ const L=(typeof MSG_REPLIES!=='undefined'?MSG_REPLIES:null); const s=JSON.stringify(L||{}); const i=s.indexOf('七月排滿了。八月二號出發。'); return s.slice(Math.max(0,i-200),i+900); }catch(e){ return String(e); } })()")
    R.note('%s 6/26 那一串：%s；畫面 %s；MSG_REPLIES 附近：%s' % (tag, J(t), J(ui), exp[:700]))
    R.check('%s 「七月排滿了。八月二號出發。」' % tag, any(x['text'] == '七月排滿了。八月二號出發。' for x in t), J(t))
    last = t[-1] if t else None
    R.check('%s 最後一則三個回覆鍵' % tag, bool(last and last['ask'] and len(last['ask']['opts']) == 3) and len(ui['asks']) >= 3, J([last, ui['asks']]))
    if ui['asks']:
        n0 = len(th); c = await tap_sel_text(pg, cdp, '#phoneBody [data-ask]', ui['asks'][0])
        await stand_until(pg, cdp, d, (await pg.evaluate("+GAME.G.hour")) + 0.3, max_s=300)
        th2 = await pg.evaluate(THREAD, 'p:' + SIS)
        R.note('%s 點第一個「%s」以後：%s' % (tag, ui['asks'][0], J(th2[n0 - 1:])))
        R.check('%s 點第一個以後她接著回' % tag, any(x['from'] == SIS for x in th2[n0:]), J(th2[n0 - 1:]))
        rec['jp'] = {'thread': t, 'ui': ui, 'after': th2[n0 - 1:]}


async def m_pg2030(pg, cdp, tag, rec):
    dk = await dks(pg, ['2029-06-01', '2029-06-02', '2029-06-28', '2029-12-20'])
    st = base_pg(dk, '2029-12-20', 12.0)
    R.setup('%s 【前置】畢業後最小存檔 2029-12-20 12:00' % tag)
    await L.load_state(pg, st); await pg.wait_for_timeout(4000); await pg.evaluate(HOOK)
    await sis_rel(pg, tag, True)
    sch = await pg.evaluate("""(()=>{ const G=GAME.G, S=PGDATE, busy=S.busyDays(G,G.day,STORY.dayOfKey(S.TO)+1), o={}; for(const ym of ['2029-09','2029-12','2030-01','2030-02']){ const M=S.sixMonth(G,ym,busy); const s=M['heroine_05']; o[ym]=s?{d:CALENDAR.dateOf(s.day).key,day:s.day,h:s.h,place:s.place||null}:null; } return o; })()""")
    R.note('%s 【捷徑：問排程】PGDATE.sixMonth 學姊：%s' % (tag, J(sch)))
    R.check('%s 2029-09 那一格沒有了' % tag, sch.get('2029-09') is None, J(sch.get('2029-09')))
    s = sch.get('2030-01')
    if not R.check('%s 2030-01 有一格' % tag, bool(s), ''): return
    R.setup('%s 【前置】讀到那一格前一小時（%s %.2f）' % (tag, s['d'], s['h'] - 1))
    st2 = base_pg(dict(dk, **{s['d']: s['day']}), s['d'], max(8, s['h'] - 1))
    await L.load_state(pg, st2); await pg.wait_for_timeout(4000); await pg.evaluate(HOOK); await sis_rel(pg, tag, True)
    await pg.evaluate("window.__says=[]")
    await stand_until(pg, cdp, s['day'], s['h'] - 0.6, max_s=900)   # CC-B 09:5x：站到那一格前 36 分（run47 pg2030：drive 60 秒沒事就結束，時間還沒到）
    c = await drive(pg, cdp, ['出發', '接起來', '好'], max_s=900, idle_end=120)
    says = await pg.evaluate("window.__says||[]"); tx = [x['t'] for x in says]
    R.note('%s 選項 %s；說的話 %s' % (tag, J(c), J([[x['who'], x['t']] for x in says])))
    R.check('%s 「元旦放假，我睡到九點。醒來的時候，還以為遲到了。」' % tag, '元旦放假，我睡到九點。醒來的時候，還以為遲到了。' in tx, J(tx[-5:]))
    rec['pg2030'] = {'sched': sch, 'says': says}


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC AA593-SIS-1B：worktree %s；MODES=%s；Playwright ≠ iPhone' % (real or '?', MODES), flush=True)
    rec = {'sha': real}
    async with async_playwright() as p:
        for mode in MODES:
            tag = '[%s]' % mode
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            try:
                await cc_det.install(pg, 20261108); await pg.goto(URL)
                if not R.check('%s 遊戲載入' % tag, await L.wait_loaded(pg), ''): continue
                await pg.evaluate("localStorage.clear()")
                if mode == 'r1': await m_r1(pg, cdp, tag, rec)
                elif mode == 'hlib': await m_hask(pg, cdp, tag, rec, False)
                elif mode == 'htea': await m_hask(pg, cdp, tag, rec, True)
                elif mode == 'flake': await m_flake(pg, cdp, tag, rec)
                elif mode == 'jx': await m_jx(pg, cdp, tag, rec, False)
                elif mode == 'jxd': await m_jx(pg, cdp, tag, rec, True)
                elif mode == 'jp': await m_jp(pg, cdp, tag, rec)
                elif mode == 'pg2030': await m_pg2030(pg, cdp, tag, rec)
                R.check('%s 沒有 JS 例外' % tag, not errs, J(errs[:3]))
            except Exception as ex: R.check('%s 探針沒有例外' % tag, False, repr(ex)[:300])
            finally: await b.close()
    json.dump(rec, open(os.path.join(OUT, 'aa593.json'), 'w'), ensure_ascii=False, indent=1, default=str)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
