"""BB-B 10-24（RELEASE-9109-TEST 補一項，LAWWW-B 17:22）：AA_449 經濟系那一年讀者那一輪（fac17bba3），在瀏覽器看兩個點。
① 2025-02-14 15:00 和可昕去以前的補習班（ev_y0_e27b，出遊）：旁白「（工作人員走進後面的辦公室。…）」不是「（她走進…）」；
   「輸的人請早餐。……我不會輸。」之後多三句：花店旁白、「（看了一眼）……我們情人節來問補習班。」「晚餐你請。」
② 2025-02-02 22:30 可昕的訊息（y0_e24b）：去過高雄（KH_TRIP_DONE）＝「到家了沒。」「我媽說我這三天胖了。……都是夜市害的。」；沒去＝「我媽說我寒假胖了。」
[前置／捷徑] 讀檔到經濟系那一年住臺北的家（econsum_probe／e37_probe 的同一組旗標）：①2/14 14:20、E27B_PLAN（1/31 高雄那一場答應過）＋ev_y0_e27 演過；②2/2 21:50，有／沒有 KH_TRIP_DONE。
之後照玩家：對話點過去；家裡的選單有「出發」就出發，沒有就「快轉 → 到下一個有事的日子」；手機自己打開就關掉、不回。
Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests python3 aa449_probe.py '<URL>/index.html?turbo' <輸出資料夾> [不用的第三個參數]"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL = sys.argv[1]; OUT = sys.argv[2]
HOOK = ("(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[]; const o=ADV.log; ADV.log=function(n,t){ try{ window.__LOG.push({n:n||'',t:String(t),h:+GAME.G.hour.toFixed(2),d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} return o.apply(this,arguments); }; "
        "if(!GAME.say.__bbs){ const s0=GAME.say; const f=function(w,t){ try{ if(!(typeof ADV!=='undefined'&&ADV.active)) window.__LOG.push({n:(w&&(w.name||w.charId))||'',t:String(t),h:+GAME.G.hour.toFixed(2),d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} return s0.apply(this,arguments); }; f.__bbs=1; GAME.say=f; } })()")
E27B_NEW = '（工作人員走進後面的辦公室。你們在櫃台前站了快十分鐘。）'; E27B_OLD = '（她走進後面的辦公室。'
E27B_END = ['（走回捷運站的路上，每一家花店門口都排著人。今天二月十四日。）', '（看了一眼）……我們情人節來問補習班。', '晚餐你請。']
KX_TRIP = ['到家了沒。', '我媽說我這三天胖了。……都是夜市害的。']; KX_HOME = '我媽說我寒假胖了。'
BASEF = {'ECON_CAMP_OPEN': True, 'E15_WENT': True, 'ECON_CAMP_DONE': True, 'E01_DONE': True, 'Y0_MOVED_OUT': True, 'dating_kexin': True, 'KX_DATING_SINCE': '2024-10-17',
         'KX_FIRST_MSG': True, 'fundsV2': 1, 'allowanceMonth': 2, 'Y0_STICKY': True}
SCENS = [
  dict(id='E27B_0214', key='2025-02-14', h=14.33, flags=dict(BASEF, E27B_PLAN=True, KH_TRIP_DONE=True, RETAKE_TOGETHER=True), done=['ev_y0_e30', 'ev_y0_a3', 'ev_y0_e26', 'ev_y0_e02', 'ev_y0_e27', 'ev_y0_kh3'], until=('2025-02-14', 17.0)),
  dict(id='KX0202_TRIP', key='2025-02-02', h=21.83, flags=dict(BASEF, KH_TRIP_DONE=True), done=['ev_y0_e30', 'ev_y0_a3', 'ev_y0_e26', 'ev_y0_e02', 'ev_y0_kh3'], until=('2025-02-02', 23.5)),
  dict(id='KX0202_HOME', key='2025-02-02', h=21.83, flags=dict(BASEF), done=['ev_y0_e30', 'ev_y0_a3', 'ev_y0_e26', 'ev_y0_e02'], until=('2025-02-02', 23.5)),
]
ONLY = [s for s in os.environ.get('SCEN', '').split(',') if s and s != '-']
SNAP = "(()=>{ const G=GAME.G; return {key:CALENDAR.dateOf(G.day).key,h:+G.hour.toFixed(2),stage:G.stage,zone:G.zone,home:typeof HOME!=='undefined'&&HOME.at?!!HOME.at(G):null}; })()"
MSGS = "(k=>(GAME.G.msgs||[]).filter(m=>m&&m.day!=null&&CALENDAR.dateOf(m.day).key===k&&String(m.th||'')==='p:kexin').map(m=>({h:m.h,from:m.from,text:m.text,tag:m.tag||null})))(%s)"


async def pick(pg, cdp, rx):
    c = await pg.evaluate("(r=>{ const bs=[...document.querySelectorAll('#choices button')]; const e=bs.find(b=>new RegExp(r).test(b.textContent)); if(!e) return null; e.scrollIntoView({block:'center'}); const x=e.getBoundingClientRect(); return [x.left+x.width/2,x.top+x.height/2,e.textContent.trim()]; })(%s)" % json.dumps(rx))
    if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200)
    return c and c[2]


async def one(p, run, sc):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    res = {'id': sc['id'], 'choices': []}
    try:
        await pg.goto(URL); run.check('%s：遊戲載入' % sc['id'], await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        d = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(sc['key'])); wd = await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)
        st = {'stage': 'econ', 'zone': 'campus', 'day': d, 'weekday': wd, 'hour': sc['h'], 'money': 12000, 'pos': {'x': -117, 'z': 0.5, 'yaw': 1.57}, 'home': {'at': True, 'base': True, 'day': d},
              'contacts': {k: d - 200 for k in ['kexin', 'econ_zhengxun', 'econ_weilun', 'econ_tangrui', 'econ_jiahao', 'econ_pinyu']},
              'flags': sc['flags'], 'events': {'done': {k: 1 for k in sc['done']}, 'last': {}, 'count': len(sc['done'])}}
        run.setup('[前置／捷徑] %s：讀檔到 %s %.2f 在臺北的家（經濟系、和可昕交往中）；旗標 %s；記成演過 %s' % (sc['id'], sc['key'], sc['h'], json.dumps(sc['flags'], ensure_ascii=False), sc['done']))
        await L.load_state(pg, st); await pg.wait_for_timeout(4000); await pg.evaluate(HOOK)
        uk, uh = sc['until']; idle = 0
        for i in range(400):
            s = await L.state(pg); g = await pg.evaluate(SNAP)
            if g['key'] > uk or (g['key'] == uk and g['h'] >= uh): break
            if await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide'); })()"):
                print('   📱 手機自己打開 %s %.2f → 關掉（不回）' % (g['key'], g['h'])); await L.close_panels(pg, cdp); await pg.wait_for_timeout(800); idle = 0; continue
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); idle = 0; continue
            if s['choices']:
                cs = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
                t = (await pick(pg, cdp, '^出發')) if any(c.startswith('出發') for c in cs) else (await pick(pg, cdp, '^到下一個有事') if any(c.startswith('到下一個有事') for c in cs) else (await pick(pg, cdp, '^快轉') if any(c.startswith('快轉') for c in cs) else await pick(pg, cdp, '.')))
                res['choices'].append('%s %.2f｜%s → %s' % (g['key'], g['h'], cs, t)); print('   ▶ %s %.2f %s（%s）' % (g['key'], g['h'], t, ' / '.join(cs)[:120])); idle = 0; continue
            idle += 1
            if idle > 150: run.check('%s：沒有卡住（%s %.2f）' % (sc['id'], g['key'], g['h']), False, json.dumps(g, ensure_ascii=False)); break
            await pg.wait_for_timeout(1200)
        res['log'] = await pg.evaluate("(window.__LOG||[]).map(x=>x.d+' '+x.h+'｜'+(x.n?x.n+'：':'')+x.t)")
        LG = res['log']; LN = '\n'.join(LG); res['end'] = await pg.evaluate(SNAP); await run.shot(pg, '%s_end' % sc['id'])
        if sc['id'] == 'E27B_0214':
            run.check('E27B：2/14 演了以前的補習班（ev_y0_e27b）', await pg.evaluate("!!((GAME.G.events||{}).done||{}).ev_y0_e27b"), json.dumps(res['choices'], ensure_ascii=False)[:300])
            run.check('E27B：旁白是「工作人員走進後面的辦公室」，沒有「她走進」', E27B_NEW in LN and E27B_OLD not in LN, json.dumps([x for x in LG if '辦公室' in x], ensure_ascii=False))
            i0 = next((i for i, x in enumerate(LG) if '我不會輸。' in x), None)
            tail = LG[i0 + 1:i0 + 6] if i0 is not None else []
            run.check('E27B：「……我不會輸。」之後接花店旁白、「……我們情人節來問補習班。」「晚餐你請。」（照順序）',
                      i0 is not None and all(any(e in x for x in tail) for e in E27B_END) and [next(j for j, x in enumerate(tail) if e in x) for e in E27B_END] == sorted([next(j for j, x in enumerate(tail) if e in x) for e in E27B_END]),
                      json.dumps(LG[i0 - 1:i0 + 6] if i0 is not None else LG[-8:], ensure_ascii=False))
        else:
            M = await pg.evaluate(MSGS % json.dumps('2025-02-02')); res['msgs'] = M; T = [m['text'] for m in M]
            if sc['id'] == 'KX0202_TRIP':
                run.check('2/2 22:30 去過高雄：可昕「到家了沒。」「我媽說我這三天胖了。……都是夜市害的。」，沒有「寒假胖了」', all(t in T for t in KX_TRIP) and KX_HOME not in T, json.dumps(M, ensure_ascii=False))
            else:
                run.check('2/2 22:30 沒去高雄：可昕「我媽說我寒假胖了。」，沒有去過高雄那兩句', KX_HOME in T and not any(t in T for t in KX_TRIP), json.dumps(M, ensure_ascii=False))
        run.check('%s：沒有 JS 例外' % sc['id'], not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e:
        run.check('%s：腳本沒有出錯' % sc['id'], False, repr(e)[:300])
    finally:
        with open(os.path.join(OUT, 'aa449_%s.json' % sc['id']), 'w') as f: json.dump(res, f, ensure_ascii=False, indent=1)
        await b.close()


async def main():
    os.makedirs(OUT, exist_ok=True); run = L.Run('aa449_probe', OUT)
    async with async_playwright() as p:
        for sc in SCENS:
            if ONLY and sc['id'] not in ONLY: continue
            await one(p, run, sc)
    run.finish()
asyncio.run(main())
