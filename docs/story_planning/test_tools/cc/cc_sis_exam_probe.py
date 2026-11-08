"""CC-B（帳號 B）11-08：學姊 SIS-1「考前最後一晚」決定拍（heroine_05 故事線第 6 拍，key exam，before 2026-01-31）。BB-B 01:48 派；判定＝BB。
MODES＝A（2026-01-27 演到）、B（2026-02-03 演到），每一種重新讀一次存檔：
【前置】day46 存檔 → 跳到那一天 13:00 宿舍。【捷徑】①學姊關係改成好朋友（第 4 階）、信任低：fam 65、trust 50、comf 45、npcRom 10、rom 0（第 4 階的「信任高」要 ≥ 60）
②故事線 BEATS.heroine_05.k＝6、last＝null（第 6 拍的前一刻）③清掉 DECIDE.heroine_05.exam。改前改後都記。
約她：照玩家點手機「朋友」→ 她的「約」→ 喝咖啡 → 第一個能選的地點 → 今天第一個時間；她不答應就【捷徑】INV.accept 同一個地點、半小時後。
到約的時間【前置】照手機「直接過去」（GM.quickGo force）→ 見面 → 第 6 拍演出來 → 選「學姊，休息五分鐘。我去買無糖綠茶。」（support）→ 確認。
看：第 6 拍的台詞、選項、G.flags.DECIDE.heroine_05.exam、DECIDE_SAY；A＝alone（trust 低的 support）、不是 late、DECIDE_SAY 有「謝謝你的綠茶。」「最後一晚，我想一個人。……考完請你吃飯。」；
A 另外【捷徑】日子 +3（她三天沒見到你）跑 DECIDE.tick → 手機收到那兩句。B＝alone、late:true、DECIDE_SAY 沒有她的。0 例外。
用法：LW_TESTS=<wt>/tests SAVE46=… [MODES=A,B] python3 cc_sis_exam_probe.py <url> <out>"""
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
R = L.Run('sis_exam', OUT); D.setup(R, OUT)
SAVE46 = os.environ['SAVE46']; SIS = 'heroine_05'
MODES = [m for m in (os.environ.get('MODES') or 'A,B').split(',') if m]
DATES = {'A': os.environ.get('DATE_A') or '2026-01-27', 'B': '2026-02-03'}
WRAP = """(()=>{ if(GAME._ccQW) return; window.__says=[]; const f=GAME.say, c=GAME.caption;
  GAME.say=function(who,text){ try{ window.__says.push({k:'say', who:who?(typeof who==='string'?who:(who.name||'')):'', t:String(text), h:+(+GAME.G.hour).toFixed(2), zone:GAME.G.zone}); }catch(e){} return f.apply(this,arguments); };
  if(c) GAME.caption=function(who,text){ try{ window.__says.push({k:'cap', who:who||'', t:String(text), h:+(+GAME.G.hour).toFixed(2), zone:GAME.G.zone}); }catch(e){} return c.apply(this,arguments); };
  GAME._ccQW=true; })()"""
STATE = """(id=>{ const G=GAME.G, F=G.flags||{}; const r=SOCIAL.rel(id); return {day:G.day, date:(CALENDAR.dateOf(G.day)||{}).key||null, h:+(+G.hour).toFixed(2), zone:G.zone,
  rel:{fam:r.fam,trust:r.trust,comf:r.comf,npcRom:r.npcRom,rom:r.rom}, stage:DATE.stageNum(id), trustHi:DECIDE.trustHi(G,id),
  beats:JSON.parse(JSON.stringify((F.BEATS||{})[id]||null)), decide:JSON.parse(JSON.stringify((F.DECIDE||{})[id]||null)),
  says:JSON.parse(JSON.stringify((F.DECIDE_SAY||[]).filter(x=>x.who===id))) }; })"""


async def drive(pg, cdp, tag, prefs, max_s=300, idle_end=8, shots=0):
    out = {'lines': [], 'choices': [], 'picked': []}; t0 = time.time(); quiet = None; ns = 0
    while time.time() - t0 < max_s:
        s = await L.state(pg)
        if s['choices']:
            quiet = None; bs = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>({t:b.innerText.trim(), dim:b.classList.contains('dim')||b.disabled||/dim/.test(b.className)}))")
            note = await pg.evaluate("(()=>{ const e=document.querySelector('#choiceNote,.choiceNote,#choices .note'); return e&&e.offsetParent?e.innerText.trim():null; })()")
            out['choices'].append({'opts': [b['t'] for b in bs], 'note': note})
            k = None
            for w in prefs:
                k = next((i for i, b in enumerate(bs) if w in b['t'] and not b['dim']), None)
                if k is not None: break
            if k is None: k = next((i for i, b in enumerate(bs) if not b['dim'] and not any(x in b['t'] for x in ('就這樣', '算了', '不約', '取消', '回上一層', '再想想'))), 0)
            if shots and ns < shots: ns += 1; await R.shot(pg, '%s_choice%d' % (tag.strip('[]').replace(' ', '_'), ns))
            c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button')[i]; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })", k)
            await L.touch_tap(cdp, c[0], c[1]); out['picked'].append(bs[k]['t']); await pg.wait_for_timeout(900); continue
        if s['dlg']:
            quiet = None
            for _ in range(40):
                if not await pg.evaluate("!!(GAME.D&&GAME.D.typing)"): break
                await pg.wait_for_timeout(250)
            dd = await pg.evaluate("(()=>{ const D=GAME.D, w=D&&D.who; return {who:w?(typeof w==='string'?w:(w.name||'')):'', t:(D&&D.full)||''}; })()")
            if dd['t'] and (not out['lines'] or out['lines'][-1] != [dd['who'], dd['t']]):
                out['lines'].append([dd['who'], dd['t']])
                if os.environ.get('BGSHOTS'):   # BB-B 04:17（LAWWW-B 4c0880fbe）：樓梯間那段換深色底——每句記 ADV 的底，三個時刻截圖
                    bg = await pg.evaluate("(()=>{ try{ const A=ADV; return {bgMode:A.bgMode!=null?A.bgMode:null, bg:A.bg!=null?String(A.bg).slice(0,40):null, active:!!A.active, cls:(document.getElementById('advBg')||document.querySelector('.advBg')||{}).className||null}; }catch(e){ return {err:String(e)}; } })()")
                    out.setdefault('bg', []).append([dd['t'][:24], bg])
                    t = dd['t']
                    if t.startswith('（她起身，用下巴比了一下樓梯間'): await R.shot(pg, 'bg1_open2')
                    elif t.startswith('（樓梯間的門一關上'): await R.shot(pg, 'bg2_stair')
                    elif out.get('_closed') and not out.get('_bg3'): out['_bg3'] = 1; await R.shot(pg, 'bg3_back')
                    if t.startswith('（她把筆撿起來'): out['_closed'] = 1
                if dd['t'].startswith('（樓梯間的門一關上'): await R.shot(pg, 'stairwell'); out.setdefault('stair_pos', await pg.evaluate("(()=>{ const P=GAME.E.player; return {zone:GAME.G.zone, lv:P.lv|0, x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2), seat:P.seat?[P.seat.x,P.seat.z]:null}; })()"))
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if quiet is None: quiet = time.time()
        if time.time() - quiet > idle_end: break
        await pg.wait_for_timeout(400)
    R.note('%s 對話 %d 句：%s；選項 %s → %s' % (tag, len(out['lines']), J(out['lines']), J(out['choices']), J(out['picked'])))
    return out


TEA = ['謝謝你的綠茶。', '最後一晚，我想一個人。……考完請你吃飯。']
MSGS = "(id=>(GAME.G.msgs||[]).filter(m=>m.th==='p:'+id||m.from===id).map(m=>({text:m.text, day:m.day, h:m.h, tag:m.tag||null})))"


async def sleep_once(pg, cdp, tag):
    """照玩家一鍵「回去睡覺」（ONETAP.sleepPlan → #btnGo → 睡覺 → 確認），睡到隔天早上；回傳有沒有換日"""
    d0 = await pg.evaluate("GAME.G.day")
    for k in range(3):
        for _ in range(30):
            s = await L.state(pg)
            if s['choices']: await L.tap(pg, cdp, '#choices button'); await pg.wait_for_timeout(600); continue
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
            break
        await L.close_panels(pg, cdp)
        plan = await pg.evaluate("(()=>{ try{ const p=ONETAP.sleepPlan(GAME); return {ok:!!p.ok, why:p.why||null}; }catch(e){ return {ok:null, why:String(e)}; } })()")
        R.note('%s 一鍵「回去睡覺」第 %d 次：%s（%s）' % (tag, k + 1, J(plan), J(await pg.evaluate("({day:GAME.G.day,h:+(+GAME.G.hour).toFixed(2),zone:GAME.G.zone})"))))
        if plan.get('ok') and await L.tap(pg, cdp, '#btnGo'):
            await pg.wait_for_timeout(1000)
            if await L.tap(pg, cdp, '#goPop [data-gok="sleep"]'):
                await pg.wait_for_timeout(1500)
                if await pg.evaluate("(()=>{ const b=document.getElementById('goConfirm'); return !!b&&!b.classList.contains('hide'); })()"): await L.tap(pg, cdp, '#goCfYes')
                for _ in range(240):
                    if await pg.evaluate("(d=>GAME.G.day>d)", d0): return True
                    s = await L.state(pg)
                    if s['choices']: await L.tap(pg, cdp, '#choices button')
                    elif s['dlg']: await L.tap(pg, cdp, '#dlg')
                    await pg.wait_for_timeout(1000)
        await pg.wait_for_timeout(2000)
    return False


async def wait_until(pg, cdp, day, h, max_s=1500):
    """站著等（不改時間）到 day 那天 h 點；中途對話點掉、手機收掉"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        c = await pg.evaluate("({d:GAME.G.day, h:+GAME.G.hour})")
        if c['d'] > day or (c['d'] == day and c['h'] >= h): return True
        s = await L.state(pg)
        if s['choices']: await L.tap(pg, cdp, '#choices button'); await pg.wait_for_timeout(600); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        await L.close_panels(pg, cdp); await pg.wait_for_timeout(2000)
    return False


async def follow(pg, cdp, tag, rec):
    """A 演完以後照玩家過日子（睡覺、站著等，不改 day）：1/25 21:30 看一次、再睡到 due+3（她三天沒見到你）以後看一次；那兩句各只收到一次"""
    x = await pg.evaluate("(id=>JSON.parse(JSON.stringify((GAME.G.flags.DECIDE_SAY||[]).find(q=>q.who===id&&q.key==='exam')||null)))", SIS)
    R.note('%s FOLLOW 開始：DECIDE_SAY %s' % (tag, J(x)))
    if not x: return
    out = {}
    ok = await sleep_once(pg, cdp, tag + ' 第 1 晚')
    ok = await wait_until(pg, cdp, x['due'], 21.5) and ok
    m1 = await pg.evaluate(MSGS, SIS); c1 = {t: sum(1 for m in m1 if m['text'] == t) for t in TEA}
    R.note('%s %s 21:30（due 那天）：睡到了＝%s；那兩句次數 %s；學姊那一串最後 4 則 %s' % (tag, await pg.evaluate("CALENDAR.dateOf(GAME.G.day).key"), ok, J(c1), J(m1[-4:])))
    out['due_2130'] = {'ok': ok, 'count': c1}
    n = 0
    while await pg.evaluate("GAME.G.day") < x['due'] + 3 and n < 5:
        n += 1
        await wait_until(pg, cdp, await pg.evaluate("GAME.G.day"), 18.0)   # 17:30 以後才能直接睡
        if not await sleep_once(pg, cdp, tag + ' 第 %d 晚' % (n + 1)): break
    await wait_until(pg, cdp, x['due'] + 3, 12.0, max_s=900)
    m2 = await pg.evaluate(MSGS, SIS); c2 = {t: sum(1 for m in m2 if m['text'] == t) for t in TEA}
    st = await pg.evaluate("(id=>JSON.parse(JSON.stringify((GAME.G.flags.DECIDE_SAY||[]).find(q=>q.who===id&&q.key==='exam')||null)))", SIS)
    R.note('%s %s %.2f（due+3 以後）：那兩句次數 %s；DECIDE_SAY %s；學姊那一串最後 4 則 %s' % (tag, await pg.evaluate("CALENDAR.dateOf(GAME.G.day).key"), await pg.evaluate("+GAME.G.hour"), J(c2), J(st), J(m2[-4:])))
    await pg.evaluate("GAME.openPhone('msg')"); await pg.wait_for_timeout(1200); await R.shot(pg, 'sis_follow_phone')
    R.check('%s 三天沒見到你：手機學姊那一串收到那兩句、各只一次（照玩家睡覺、等時間）' % tag, all(c2[t] == 1 for t in TEA), J(c2))
    out['due3'] = {'count': c2, 'decide_say': st}
    rec['follow'] = out


async def run_mode(pg, cdp, mode, rec):
    tag = '[%s %s]' % (mode, DATES[mode])
    sv = json.load(open(SAVE46, encoding='utf-8'))
    d = await pg.evaluate("STORY.dayOfKey('%s')" % DATES[mode])
    sv['weekday'] = ((sv.get('weekday', 0) + (d - sv['day'])) % 7 + 7) % 7; sv['day'] = d; sv['hour'] = 13.0; sv['zone'] = 'dorm'; sv['pos'] = None
    sv.setdefault('home', {})['at'] = False
    R.setup('%s 【前置】day46 存檔改到 %s（day %s、weekday %s）13:00 宿舍' % (tag, DATES[mode], d, sv['weekday']))
    await L.load_state(pg, sv, quiet_phone=True); await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)
    await pg.evaluate(WRAP)
    s0 = await pg.evaluate(STATE, SIS); R.note('%s 改之前：%s' % (tag, J(s0)))
    R.setup('%s 【捷徑】學姊 rel → fam 65、trust 50、comf 45、npcRom 10、rom 0；BEATS.k＝6、last＝null；清 DECIDE.heroine_05.exam' % tag)
    await pg.evaluate("""(id=>{ const r=SOCIAL.rel(id); Object.assign(r,{fam:65,trust:50,comf:45,npcRom:10,rom:0}); const F=GAME.G.flags; const B=ARCS.rec(GAME.G,id); B.k=6; B.last=null; B.missed=(B.missed||[]).filter(n=>n!==6);
      if(F.DECIDE&&F.DECIDE[id]) delete F.DECIDE[id].exam; if(Array.isArray(F.DECIDE_SAY)) F.DECIDE_SAY=F.DECIDE_SAY.filter(x=>!(x.who===id&&x.key==='exam')); })""", SIS)
    s1 = await pg.evaluate(STATE, SIS); R.note('%s 改之後：%s' % (tag, J(s1)))
    R.check('%s 前置：第 4 階、信任低（trustHi false）' % tag, s1['stage'] >= 4 and not s1['trustHi'], J(s1))
    pk = await pg.evaluate("(id=>{ const b=ARCS.pick(GAME.G,id,{kind:'sit'}); return b?{n:b.n, lines:b.lines}:null; })", SIS)
    R.note('%s ARCS.pick(sit) 現在會給：%s' % (tag, J(pk)))
    # 約她（手機）
    await pg.evaluate("window.__says=[]")
    await pg.evaluate("GAME.openPhone('friends')"); await pg.wait_for_timeout(1500)
    ok = await pg.evaluate("(id=>{ const b=document.querySelector('[data-inv=\"'+id+'\"]'); if(!b) return false; b.scrollIntoView({block:'center'}); return true; })", SIS)
    inv = None
    if R.check('%s 手機「朋友」有學姊的「約」' % tag, ok, ''):
        await L.tap(pg, cdp, '[data-inv="%s"]' % SIS); await pg.wait_for_timeout(1200)
        a = await drive(pg, cdp, tag + ' 約', (os.environ.get('PREFS') or '喝咖啡,今天').split(','), max_s=200, idle_end=6)
        inv = await pg.evaluate("(id=>{ const v=(GAME.G.invites||[]).filter(q=>q.who===id&&q.day===GAME.G.day&&q.state==='accepted').slice(-1)[0]; return v?JSON.parse(JSON.stringify(v)):null; })", SIS)
        R.note('%s 約的結果：%s；說的話 %s' % (tag, J(inv), J(await pg.evaluate("window.__says||[]"))))
    if not inv:
        R.setup('%s 【捷徑】她沒答應／沒約成：INV.accept(heroine_05, cafe, 今天, 現在＋0.5)' % tag)
        inv = await pg.evaluate("(id=>{ const G=GAME.G; const v=INV.accept(G,id,'cafe',G.day,+(G.hour+0.5).toFixed(2)); return v?JSON.parse(JSON.stringify(v)):JSON.parse(JSON.stringify((G.invites||[]).slice(-1)[0]||null)); })", SIS)
        R.note('%s accept：%s' % (tag, J(inv)))
    await pg.evaluate("GAME.closePhone&&GAME.closePhone()")
    if not R.check('%s 有約好的見面' % tag, bool(inv and inv.get('place')), J(inv)): return
    await pg.evaluate("(h=>{ GAME.G.hour=Math.max(GAME.G.hour,h-0.1); })", inv['h'])
    tgt = await pg.evaluate("(id=>{ const v=(GAME.G.invites||[]).filter(q=>q.who===id&&q.state==='accepted').slice(-1)[0]; return INV.goTarget(GAME.G,v); })", SIS)
    R.setup('%s 【前置】時間撥到約的前 6 分鐘，照手機「直接過去」GM.quickGo(%s, force)' % (tag, J(tgt)))
    await pg.evaluate("window.__says=[]"); wf0 = await pg.evaluate("GAME.walkFallbacks||0")
    await pg.evaluate("(t=>{ void GAME.quickGo([t.zone,t.name,t.spawn||null],{force:true}); })", tgt)
    await pg.wait_for_timeout(8000)
    m = await drive(pg, cdp, tag + ' 見面', ['綠茶'], max_s=420, idle_end=15, shots=3)
    for k in range(3):   # 總圖：她帶路到二樓座位（INV lead）——照玩家跟上去、走到她指的那張、按「坐下」，再接著演
        ld = await pg.evaluate("(id=>{ const v=(GAME.G.invites||[]).filter(q=>q.who===id).slice(-1)[0]; return v&&v.lead?JSON.parse(JSON.stringify({ph:v.lead.ph, me:v.lead.me, her:v.lead.her, state:v.state})):null; })", SIS)
        if not ld or not ld.get('me'): break
        me = ld['me']; R.note('%s 她帶路（第 %d 次）：%s' % (tag, k + 1, J(ld)))
        her = ld.get('her') or me
        await L.go_to(pg, cdp, R, her['x'], her['z'], 2.0, '%s 跟她上二樓' % tag, max_s=240, lv=her.get('lv', 0))
        for _ in range(60):   # 等她坐好（lead.ph＝wait）；invites3d.js leadTick：她等你、你走到她（或她的位子）2 m 內＝開演
            ph = await pg.evaluate("(id=>{ const v=(GAME.G.invites||[]).filter(q=>q.who===id).slice(-1)[0]; return v&&v.lead?v.lead.ph:null; })", SIS)
            if ph != 'go': break
            await pg.wait_for_timeout(1000)
        R.note('%s 她的帶路階段：%s' % (tag, ph))
        await L.go_to(pg, cdp, R, her['x'], her['z'], 1.2, '%s 走到她旁邊（2 m 內）' % tag, max_s=120, lv=her.get('lv', 0))
        await pg.wait_for_timeout(2500); await R.shot(pg, 'beside_%d' % (k + 1))
        m['sat'] = await pg.evaluate("(()=>{ const P=GAME.E.player; return {lv:P.lv|0, x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2), seat:P.seat?[P.seat.x,P.seat.z]:null}; })()"); R.note('%s 走到她旁邊以後：%s' % (tag, J(m['sat'])))
        m2 = await drive(pg, cdp, tag + ' 坐下以後', ['綠茶'], max_s=420, idle_end=15, shots=3)
        for kk in ('lines', 'choices', 'picked'): m[kk] += m2[kk]
        if m2.get('stair_pos'): m['stair_pos'] = m2['stair_pos']
        if m2.get('bg'): m.setdefault('bg', []).extend(m2['bg'])
        if m2['lines'] or await pg.evaluate("!!GAME.E.player.seat"): break
    says = await pg.evaluate("window.__says||[]")
    s2 = await pg.evaluate(STATE, SIS); R.note('%s 見面以後：%s' % (tag, J(s2)))
    q = await pg.evaluate("(()=>{ const P=GAME.E.player; return {zone:GAME.G.zone, lv:P.lv|0, x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2), quiet:typeof LIBQ!=='undefined'&&LIBQ.studyAt?!!LIBQ.studyAt(GAME.G.zone,P.lv|0,P.obj.position.x,P.obj.position.z):null}; })()")
    R.note('%s 見面地點與 ctx.quiet（LIBQ.studyAt，見面結束時玩家的位置）：%s' % (tag, J(q)))
    R.note('%s 見面全部的話：%s' % (tag, J([[x['k'], x['who'], x['t']] for x in says])))
    if m.get('bg'): R.note('%s 每句的底（ADV.bgMode）：%s' % (tag, J(m['bg'])))
    await R.shot(pg, 'sis_%s_end' % mode)
    txt = [x['t'] for x in says]
    if os.environ.get('QM'):   # SIS1-QUIET-LIB-1108 修好以後（AA_720 quietMove）：總圖安靜區＝走到樓梯間演
        QM = await pg.evaluate("(()=>{ try{ return AA720P.QM(); }catch(e){ return null; } })()")
        R.note('%s quietMove 資料：%s；樓梯間那一刻 %s' % (tag, J(QM), J(m.get('stair_pos'))))
        wf = (await pg.evaluate("GAME.walkFallbacks||0")) - wf0
        endp = await pg.evaluate("(()=>{ const P=GAME.E.player; return {zone:GAME.G.zone, lv:P.lv|0, x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2), seat:P.seat?[P.seat.x,P.seat.z]:null, busy:!!P.busy}; })()")
        R.note('%s 演完：玩家 %s；walkFallbacks +%d' % (tag, J(endp), wf))
        if QM and os.environ.get('QM') == 'stair':
            seq = QM['open'] + [QM['replaceFirst']['to']] + QM['close']
            idx = [txt.index(t) if t in txt else -1 for t in seq]
            R.check('%s 樓梯間版：open 兩句 → 樓梯間那一句 → … → 結尾一句，照順序' % tag, all(i >= 0 for i in idx) and idx == sorted(idx), J(idx))
            R.check('%s 原稿第一句（筆摔在桌上）沒有出現' % tag, QM['replaceFirst']['from'] not in txt, '')
            a, z = (idx[2], idx[-1]) if all(i >= 0 for i in idx) else (0, -1)
            stair = [x for x in says[a:z + 1] if x['k'] == 'say']
            R.check('%s 樓梯間那幾句沒有（小聲）' % tag, bool(stair) and not any(x['t'].startswith('（小聲）') for x in stair), J([[x['who'], x['t']] for x in stair if x['t'].startswith('（小聲）')]))
            pre = [x for x in says[:idx[0]] if x['k'] == 'say' and x['who']] if idx[0] > 0 else []
            R.note('%s 樓梯間以前有名字的句子（看（小聲））：%s' % (tag, J([[x['who'], x['t']] for x in pre])))
            R.check('%s walkFallbacks 0、沒有卡住（busy false）' % tag, wf == 0 and not endp['busy'], J(endp))
        else:
            R.check('%s 不走樓梯間（沒有 quietMove 的句子）' % tag, not QM or not any(t in txt for t in QM['open'] + [QM['replaceFirst']['to']] + QM['close']), '')
    R.check('%s 第 6 拍演了（「我今天寫錯一題我上個月就會的。我很不爽我自己。」）' % tag, '我今天寫錯一題我上個月就會的。我很不爽我自己。' in txt, J(txt[:8]))
    R.check('%s 選到綠茶（support）' % tag, any('綠茶' in p for p in m['picked']), J(m['picked']))
    ex = (s2['decide'] or {}).get('exam')
    my = [x for x in s2['says'] if x.get('key') == 'exam']
    if mode == 'A':
        R.check('%s DECIDE.heroine_05.exam＝alone、不是 late、stance support' % tag, bool(ex) and ex.get('v') == 'alone' and not ex.get('late') and ex.get('stance') == 'support', J(ex))
        R.check('%s DECIDE_SAY 有「謝謝你的綠茶。」「最後一晚，我想一個人。……考完請你吃飯。」' % tag, any(x.get('say') == ['謝謝你的綠茶。', '最後一晚，我想一個人。……考完請你吃飯。'] for x in my), J(my))
        if my and os.environ.get('FOLLOW'): await follow(pg, cdp, tag, rec)
        elif my:
            R.setup('%s 【捷徑】日子 +3（她三天沒見到你）→ DECIDE.tick（手機規則同一支）' % tag)
            ph = await pg.evaluate("(id=>{ const G=GAME.G, x=(G.flags.DECIDE_SAY||[]).find(q=>q.who===id&&q.key==='exam'); G.day=x.due+3; G.weekday=(G.weekday+3)%7; const r=DECIDE.tick(G); return {r, msgs:JSON.parse(JSON.stringify((G.msgs||[]).filter(m=>m.th==='p:'+id||m.who===id||m.from===id).slice(-4))), x:JSON.parse(JSON.stringify(x))}; })", SIS)
            R.note('%s tick：%s' % (tag, J(ph)))
            R.check('%s 三天沒見到：手機收到那兩句' % tag, all(any(t == (mm.get('text') or '') for mm in ph['msgs']) for t in ['謝謝你的綠茶。', '最後一晚，我想一個人。……考完請你吃飯。']), J(ph['msgs']))
    else:
        R.check('%s DECIDE.heroine_05.exam＝alone、late:true' % tag, bool(ex) and ex.get('v') == 'alone' and ex.get('late') is True, J(ex))
        R.check('%s DECIDE_SAY 沒有她的 exam' % tag, not my, J(my))
    rec[mode] = {'before': s0, 'after_setup': s1, 'inv': inv, 'meet': m, 'says': says, 'end': s2}


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 學姊 SIS-1 考前最後一晚：worktree %s；MODES=%s；Playwright 手機模擬 ≠ iPhone' % (real or '?', MODES), flush=True)
    rec = {'sha': real}
    async with async_playwright() as p:
        for mode in MODES:
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            try:
                await cc_det.install(pg, 20261108)
                await pg.goto(URL); ok = await L.wait_loaded(pg)
                if not R.check('[%s] 遊戲載入' % mode, ok, ''): continue
                await pg.evaluate("localStorage.clear()")
                await run_mode(pg, cdp, mode, rec)
                R.check('[%s] 沒有 JS 例外' % mode, not errs, J(errs[:3]))
            except Exception as ex: R.check('[%s] 探針沒有例外' % mode, False, repr(ex)[:300])
            finally: await b.close()
    json.dump(rec, open(os.path.join(OUT, 'sis_exam.json'), 'w'), ensure_ascii=False, indent=1, default=str)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
