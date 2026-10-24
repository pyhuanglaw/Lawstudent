"""BB-B 10-24（#155）：經濟系那年暑假，照玩家在臺北的家一直按「快轉 → 到下一個有事的日子」，看 7/22、7/27、7/31、8/10 那幾場會不會被跳過。
為什麼要瀏覽器：Node 掃描（vac_sweep，BB_303 第 7、8 節）看到這四天的 stops 是空的——HOME.breakNext／y0FixedNext 都不停在這幾天。
遊戲的快轉（HOME.breakJump，o.ff）每跳一小時看一次 S.mustEvs（trigger:'home' 的事件「新出現」就停），照理會停；Node 不真的演事件，所以排在這裡確認。
另外看 8/13 放榜（ev_y0_e36rh）演完以後，20:30 家人群組（vf_y0_0813）有沒有發。
[前置／捷徑] 讀檔到 2025-07-21（一）21:20 在臺北的家（經濟系、休學後住家裡；e37_probe 的同一組旗標，去掉放榜以後才有的 E36_RESULT 與 e36 系列）；
7/21 以前的事件記成演過（e30、a3、e26、e02、考前一晚 e35h、考場 exam1h、對答案 exam2、7/13 發票、7/19 姊姊回來）。
兩種存檔（PROF=kx,single；預設兩種都跑）：kx＝和可昕交往中、考前一晚選「睡一整天」（E35_PLAN sleep：7/19～7/23 不在高雄）；single＝沒交往。
之後照玩家：對話點過去；家裡的選單有「快轉」就快轉、再選「到下一個有事的日子」；7/27 的「去學校走一走／在家」選「（在家）」（不出門，留在家裡的選單）；
其他選項選第一個；不開手機（要回的訊息不回）；手機自己打開（D103）就關掉、不回。跑到 2025-08-14 12:00 為止。
Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests python3 econsum_probe.py '<URL>/index.html?turbo' <輸出資料夾> [不用的第三個參數]"""
import os, sys, json, asyncio, re
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL = sys.argv[1]; OUT = sys.argv[2]
PROFS = [p for p in (os.environ.get('PROF') or (os.environ.get('SCEN') if os.environ.get('SCEN') in ('kx', 'single', 'kx,single') else '') or 'kx,single').split(',') if p]   # runner 只傳 SCEN：SCEN＝single 就只跑沒交往
DONE0 = ['ev_y0_e30', 'ev_y0_a3', 'ev_y0_e26', 'ev_y0_e02', 'ev_y0_e35h', 'ev_y0_exam1h', 'ev_y0_exam2', 'ev_vf_y0_0713', 'ev_vf_y0_0719_sis']
WATCH = ['ev_vf_y0_0722', 'ev_y0_kh_home_h', 'ev_vf_y0_0726_sis', 'ev_vf_y0_0727', 'ev_vf_y0_0731', 'ev_vf_y0_0808', 'ev_vf_y0_0810', 'ev_vf_y0_0810_sum', 'ev_y0_e36h', 'ev_y0_e36rh', 'ev_y0_e36']
TX = {'0722': '禮拜五出成績。', '0727': '（成績出來了。分數夠不夠，要等八月十三號。）', '0731': '（你去拿信。最上面一封是分科測驗的成績單，和網路上看到的一樣。）',
      '0810': '我在看政大的宿舍照片。……還沒放榜，先看。', '0813': ['（照片：電腦螢幕上的榜單，你的名字用紅筆圈起來）', '看到了。', '……好。法律好。', '恭喜']}
SNAP = ("(()=>{ const G=GAME.G, dn=(G.events&&G.events.done)||{}; return {key:CALENDAR.dateOf(G.day).key,h:+G.hour.toFixed(2),stage:G.stage,zone:G.zone,"
        "home:typeof HOME!=='undefined'&&HOME.at?!!HOME.at(G):null,done:Object.keys(dn),res:!!(G.flags&&G.flags.E36_RESULT),"
        "sent0813:typeof PHONE!=='undefined'&&PHONE.sent?!!PHONE.sent(G,'vf_y0_0813'):null}; })()")
HOOK = ("(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[]; const o=ADV.log; ADV.log=function(n,t){ try{ window.__LOG.push({n:n||'',t:String(t),h:+GAME.G.hour.toFixed(2),d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} return o.apply(this,arguments); }; })()")   # 對話紀錄（us_life_probe 的 HOOK 只留 ADV.log）
MSGS = "(()=>{ const G=GAME.G; return (G.msgs||[]).filter(m=>m&&m.day!=null&&CALENDAR.dateOf(m.day).key==='2025-08-13').map(m=>({th:m.th,from:m.from,tag:m.tag||null,text:m.text,h:m.h})); })()"   # 8/13 那一天手機裡所有的訊息（群組的每一則不一定都帶 tag）


async def pick(pg, cdp, rx):
    c = await pg.evaluate("(r=>{ const bs=[...document.querySelectorAll('#choices button')]; const e=bs.find(b=>new RegExp(r).test(b.textContent)); if(!e) return null; e.scrollIntoView({block:'center'}); const x=e.getBoundingClientRect(); return [x.left+x.width/2,x.top+x.height/2,e.textContent.trim()]; })(%s)" % json.dumps(rx))
    if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200)
    return c and c[2]


async def one(p, run, prof):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    res = {'prof': prof, 'stops': [], 'evday': {}, 'lines': [], 'choices': []}
    try:
        await pg.goto(URL); run.check('%s：遊戲載入' % prof, await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        d = await pg.evaluate("STORY.dayOfKey('2025-07-21')"); wd = await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)
        F = {'ECON_CAMP_OPEN': True, 'E15_WENT': True, 'ECON_CAMP_DONE': True, 'E01_DONE': True, 'Y0_MOVED_OUT': True, 'KX_FIRST_MSG': True, 'fundsV2': 1, 'allowanceMonth': 7, 'Y0_STICKY': True}
        if prof == 'kx': F.update({'dating_kexin': True, 'KX_DATING_SINCE': '2024-10-17', 'E35_PLAN': 'sleep', 'E35_MET': True})
        else: F.update({'dating_kexin': False})
        st = {'stage': 'econ', 'zone': 'campus', 'day': d, 'weekday': wd, 'hour': 21.33, 'money': 12000, 'pos': {'x': -117, 'z': 0.5, 'yaw': 1.57},
              'home': {'at': True, 'base': True, 'day': d},
              'contacts': {k: d - 300 for k in ['kexin', 'econ_zhengxun', 'econ_weilun', 'econ_tangrui', 'econ_jiahao', 'econ_pinyu']},
              'flags': F, 'events': {'done': {k: 1 for k in DONE0}, 'last': {}, 'count': len(DONE0)}}
        run.setup('[前置／捷徑] %s：讀檔到 2025-07-21（一）21:20 在臺北的家（經濟系、休學後住家裡）；旗標 %s；7/21 以前記成演過 %s' % (prof, json.dumps(F, ensure_ascii=False), DONE0))
        await L.load_state(pg, st); await pg.wait_for_timeout(4000); await pg.evaluate(HOOK)
        if prof != 'kx':   # BB-B 17:1x：只設 dating_kexin=false 不夠（預設存檔的 romance.kexin 還在＝照樣演交往中）；照 zrlast NOKX 整組清掉
            await pg.evaluate("(()=>{ const G=GAME.G; G.flags.dating_kexin=false; if(G.flags.romance) delete G.flags.romance.kexin; G.flags.ROMANCE_HISTORY=(G.flags.ROMANCE_HISTORY||[]).filter(r=>r&&r.id!=='kexin'); delete G.flags.DATED_1_kexin; delete G.flags.KX_DATING_SINCE; })()")
        g = await pg.evaluate(SNAP); print('%s 開始 %s %.2f stage=%s home=%s' % (prof, g['key'], g['h'], g['stage'], g['home']))
        run.check('%s：前置——在臺北的家（HOME.at）、經濟系' % prof, g['home'] is True and g['stage'] == 'econ', json.dumps(g, ensure_ascii=False)[:300])
        await run.shot(pg, '%s_a_0721' % prof)
        prev = set(g['done']); idle = 0
        for i in range(900):
            s = await L.state(pg); g = await pg.evaluate(SNAP)
            new = [x for x in g['done'] if x not in prev]
            for x in new: res['evday'][x] = '%s %.2f' % (g['key'], g['h']); print('   ✔ %s 演完（%s %.2f）' % (x, g['key'], g['h']))
            prev = set(g['done'])
            if g['key'] >= '2025-08-14' and g['h'] >= 12: break
            if g['key'] > '2025-08-14': break
            if s['dlg']:
                t = (s.get('dtext') or '').strip()
                if t: res['lines'].append('%s %.2f｜%s' % (g['key'], g['h'], t[:80]))
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); idle = 0; continue
            if await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide'); })()"):   # D103：重要訊息手機自己打開（蓋住家裡的選單）＝照玩家看一眼、不回、關掉
                body = await pg.evaluate("((document.getElementById('phoneBody')||{}).innerText||'').slice(0,160)")
                res.setdefault('phone', []).append('%s %.2f｜%s' % (g['key'], g['h'], body.replace('\n', '｜')))
                print('   📱 手機自己打開 %s %.2f：%s → 關掉（不回）' % (g['key'], g['h'], body.replace('\n', '｜')[:100]))
                await L.close_panels(pg, cdp); await pg.wait_for_timeout(800); idle = 0; continue
            if s['choices']:
                cs = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
                if any(c.startswith('到下一個有事') for c in cs):
                    res['stops'].append('%s %.2f' % (g['key'], g['h'])); print('   ⏩ 快轉選單 %s %.2f：%s' % (g['key'], g['h'], cs))
                    t = await pick(pg, cdp, '^到下一個有事')
                elif any(c.startswith('快轉') for c in cs):
                    res['stops'].append('%s %.2f' % (g['key'], g['h'])); print('   ⏩ 家裡的選單 %s %.2f：%s' % (g['key'], g['h'], cs))
                    t = await pick(pg, cdp, '^快轉')
                elif '（在家）' in cs:   # 7/27「去學校走一走／在家」：在家（不出門，留在家裡的選單）
                    t = await pick(pg, cdp, '^（在家）')
                else:
                    t = await pick(pg, cdp, '.')
                res['choices'].append('%s %.2f｜%s → %s' % (g['key'], g['h'], cs, t)); idle = 0; continue
            idle += 1
            if idle in (20, 60): await run.shot(pg, '%s_idle_%s_%d' % (prof, g['key'], idle)); print('   … 沒有對話也沒有選單 %s %.2f zone=%s home=%s' % (g['key'], g['h'], g['zone'], g['home']))
            if idle > 200: run.check('%s：沒有卡住（%s %.2f 停了 200 輪沒有選單）' % (prof, g['key'], g['h']), False, json.dumps(g, ensure_ascii=False)[:300]); break
            await pg.wait_for_timeout(1200)
        g = await pg.evaluate(SNAP); res['end'] = {k: g[k] for k in ('key', 'h', 'stage', 'zone', 'home', 'res', 'sent0813')}
        res['msgs0813'] = await pg.evaluate(MSGS); await run.shot(pg, '%s_z_end' % prof)
        print('%s 停過的地方：%s' % (prof, res['stops']))
        res['log'] = await pg.evaluate("(window.__LOG||[]).map(x=>x.d+' '+x.h+'｜'+(x.n?x.n+'：':'')+x.t)")
        E = res['evday']; LN = '\n'.join(res['log']) + '\n' + '\n'.join(res['lines'])
        def at(ev, day): return ev in E and E[ev].startswith(day)   # （events.done 出現的時間點會落後一站，只當參考）
        def said(txt, day): return any(x.startswith(day) and txt in x for x in res['log'])   # BB-B 17:1x：照對話紀錄的日期判定（d＝那一句演出時的遊戲日期）
        if prof == 'kx':
            run.check('kx：7/22 21:30 以後可昕視訊（ev_vf_y0_0722）在 7/22 演了（%s）' % E.get('ev_vf_y0_0722'), said(TX['0722'], '2025-07-22'), E.get('ev_vf_y0_0722'))
            run.check('kx：8/10 21:00 以後可昕視訊（ev_vf_y0_0810）在 8/10 演了（%s）' % E.get('ev_vf_y0_0810'), said(TX['0810'], '2025-08-10'), E.get('ev_vf_y0_0810'))
        else:
            run.check('single：7/22 沒有可昕視訊（沒交往）', TX['0722'] not in LN, E.get('ev_vf_y0_0722'))
            run.check('single：8/10 早上摘要池那一句（ev_vf_y0_0810_sum）在 8/10 演了（%s）' % E.get('ev_vf_y0_0810_sum'), 'ev_vf_y0_0810_sum' in E and any(x.startswith('2025-08-10') and '杜可昕' not in x for x in res['log']) and TX['0810'] not in LN, json.dumps([x for x in res['log'] if x.startswith('2025-08-1')], ensure_ascii=False)[:400])
        run.check('%s：7/27 10:00～14:00 醒來「成績出來了」（ev_vf_y0_0727）在 7/27 演了（%s）' % (prof, E.get('ev_vf_y0_0727')), said(TX['0727'], '2025-07-27'), E.get('ev_vf_y0_0727'))
        run.check('%s：7/31 10:00～14:00 成績單（ev_vf_y0_0731）在 7/31 演了（%s）' % (prof, E.get('ev_vf_y0_0731')), said(TX['0731'], '2025-07-31'), E.get('ev_vf_y0_0731'))
        run.check('%s：8/13 放榜（ev_y0_e36rh）在 8/13 演了（%s），E36_RESULT 記了' % (prof, E.get('ev_y0_e36rh')), said('（八月十三日，早上十點。榜單公布了。）', '2025-08-13') and g['res'], json.dumps({'e36rh': E.get('ev_y0_e36rh'), 'res': g['res']}))
        M = res['msgs0813']; MT = [m.get('text') for m in M]
        run.check('%s：8/13 20:30 家人群組（vf_y0_0813）在放榜以後發了，四則照稿' % prof, bool(g['sent0813']) and all(t in MT for t in TX['0813']), json.dumps(M, ensure_ascii=False)[:500])
        run.check('%s：沒有 JS 例外' % prof, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e:
        run.check('%s：腳本沒有出錯' % prof, False, repr(e)[:300])
    finally:
        with open(os.path.join(OUT, 'econsum_%s.json' % prof), 'w') as f: json.dump(res, f, ensure_ascii=False, indent=1)
        await b.close()


async def main():
    os.makedirs(OUT, exist_ok=True); run = L.Run('econsum_probe', OUT)
    async with async_playwright() as p:
        for prof in PROFS: await one(p, run, prof)
    run.finish()
asyncio.run(main())
