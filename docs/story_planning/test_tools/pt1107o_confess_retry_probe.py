"""BB-B 2026-11-07：AA_723 告白第一次失敗、再約幾次還能告白（AA723-CONFESS-PS-1107；src/confess723_3d.js）瀏覽器驗收。
程式的接法：CF723 包住 DATE.confessOffer（正式約會的結尾）、INV.meetOpen 和 STORY.PRE_TALK（見面、當面說話先說 normal）、DATE.confessDecide（第二次一定 yes）。
  A 失敗以後隔天當面說話：她先說 normal（一次）；再說一次話不重複
  B 失敗以後、約會不到 2 次或沒過 14 天：約會結尾什麼都沒有（沒有 ready、沒有告白選項）
  C 失敗以後約滿 2 次、過了 14 天：約會結尾她說 ready → 選項「（告訴她）／（今天先不說）」→ 先不說＝沒事；下一次約會結尾不再說 ready、直接再問
    → 告訴她＝second → 照原本告白那一場，這一次一定答應（交往中）
[前置／捷徑] 讀使用者存檔 day46；【捷徑】寫 G.flags.CONF_FAIL（失敗那天、當時的正式約會次數）、DATE.log 的次數；
【捷徑】約會結尾那一段直接叫 DATE.confessOffer(GAME,{who})（正式約會演完以後就是叫這一個，約會本身已經驗過）；A 的人用 GAME.spawnCharacter 放在旁邊（她不一定在那一區）。
用法：LW_TESTS=<測試樹>/tests python3 pt1107o_confess_retry_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pt1107e_arcs_probe.py'))
pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
import playlib as L
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
WHO = os.environ.get('WHO', 'heroine_01')
J = lambda x, n=600: json.dumps(x, ensure_ascii=False)[:n]
HOOK = """(()=>{ if(window.__H) return; window.__H=1; window.__S=[]; const s0=GAME.say; GAME.say=function(w,t){ try{ window.__S.push(String(t||'')); }catch(e){} return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ try{ window.__S.push('［選項］'+(o||[]).map(x=>x.t).join('／')); }catch(e){} return c0.apply(this,arguments); }; })()"""
N = "(window.__S||[]).length"
SINCE = "(n=>(window.__S||[]).slice(n))"
LINES = "(id=>AA723.confess.lines[id])(%s)" % json.dumps(WHO)
ST = """(id=>{ const G=GAME.G, c=(G.flags.CONF_FAIL||{})[id]||null, R=(G.flags.romance||{})[id]||null; return {day:G.day, cf:c, dates:DATE.log(G,id).count|0, dating:!!G.flags['dating_'+id], rom:R&&R.status||null}; })(%s)""" % json.dumps(WHO)


async def drive(pg, cdp, picks, max_s=120):
    """點對話；有選項就照 picks 依序選（字串開頭），picks 用完選第一個。回傳選過的選項"""
    t0 = time.time(); idle = 0; chosen = []; picks = list(picks)
    while time.time() - t0 < max_s:
        if await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await L.phone_away(pg, cdp); continue
        q = await L.state(pg)
        if q['choices']:
            o = await pe.opts(pg); texts = [x['t'] for x in o]
            want = picks.pop(0) if picks else None
            pick = next((t for t in texts if want and t.startswith(want)), texts[0])
            chosen.append(pick); await pe.choose(pg, cdp, pick, True); idle = 0; continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); idle = 0; continue
        if q['busy']: await pg.wait_for_timeout(500); continue
        idle += 1
        if idle >= 4: break
        await pg.wait_for_timeout(700)
    return chosen


async def load(pg, cdp, run, base, label, cf_days_ago, cf_dates_ago, dates_extra):
    s = json.loads(json.dumps(base)); s['hour'] = 12.0; s['zone'] = 'campus'; s['pos'] = None; s['invites'] = []
    f = dict(s.get('flags') or {}); f.pop('CONF_FAIL', None)
    for k in [k for k in f if k.startswith('dating_')]: f[k] = False
    rm = dict(f.get('romance') or {})
    for k, v in list(rm.items()): rm[k] = dict(v or {}, status='none', knows=[])
    f['romance'] = rm; s['flags'] = f
    await L.load_state(pg, s, quiet_phone=True); await pg.wait_for_timeout(4000); await pg.evaluate(HOOK); await drive(pg, cdp, [], 40)
    r = await pg.evaluate("""(([id,a,b,x])=>{ const G=GAME.G, Lg=DATE.log(G,id); Lg.count=(Lg.count|0)+x; const R=CF723.rec(G);
      R[id]={day:G.day-a, cnt:Math.max(0,(Lg.count|0)-b)}; return {day:G.day, cf:R[id], dates:Lg.count}; })(%s)""" % json.dumps([WHO, cf_days_ago, cf_dates_ago, dates_extra]))
    run.setup('[前置] %s：讀使用者存檔 day46，12:00 校園、清掉交往；【捷徑】CONF_FAIL.%s＝%s（%d 天前失敗；之後約了 %d 次），DATE.log 次數 %d' % (label, WHO, J(r['cf']), cf_days_ago, cf_dates_ago, r['dates']))
    return r


async def main():
    run = L.Run('pt1107o_confess_retry', OUT)
    base = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()")
        # ---- A：隔天當面說話先說 normal ----
        await load(pg, cdp, run, base, 'A', 1, 0, 0)
        Lx = await pg.evaluate(LINES)
        sp = await pg.evaluate("""(id=>{ const P=GAME.E.player.obj.position; let n=GAME.npc&&GAME.npc[id]; if(!n) n=GAME.spawnCharacter(id,P.x+1.2,P.z,{}); return n?{x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2),spawned:true}:null; })(%s)""" % json.dumps(WHO))
        run.setup('【捷徑】A：%s 放在玩家旁邊 %s' % (WHO, J(sp)))
        async def talk(tag):
            n0 = await pg.evaluate(N)
            pos = await pg.evaluate("(id=>{ const n=GAME.npc[id]; return n?[n.obj.position.x,n.obj.position.z]:null; })(%s)" % json.dumps(WHO))
            if pos: await L.go_to(pg, cdp, run, pos[0], pos[1], 1.0, 'talk ' + tag, max_s=120)
            lab = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()")
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
            await drive(pg, cdp, [], 120)
            return lab, await pg.evaluate(SINCE + "(%d)" % n0)
        lab1, s1 = await talk('1')
        print('[A1]', lab1, J(s1, 1500))
        norm = Lx['normal']; k = next((i for i, t in enumerate(s1) if t == norm[0]), None)
        run.check('A 失敗隔天當面說話（按鈕「%s」）：她先說 normal（%d 句、照順序）' % (lab1, len(norm)), k is not None and s1[k:k + len(norm)] == norm and k <= 1, J(s1[:6]))
        lab2, s2 = await talk('2')
        print('[A2]', lab2, J(s2, 800))
        run.check('A 再說一次話：normal 不重複', not any(t in norm for t in s2), J(s2[:4]))
        st = await pg.evaluate(ST); run.check('A CONF_FAIL 記 normal', bool(st['cf'] and st['cf'].get('normal')), J(st))
        # ---- B：約會不到 2 次（或沒過 14 天）＝結尾什麼都沒有 ----
        for label, days, dn in (('B1 過了 15 天、只約 1 次', 15, 1), ('B2 約了 2 次、只過 10 天', 10, 2)):
            await load(pg, cdp, run, base, label, days, dn, 2)
            n0 = await pg.evaluate(N)
            await pg.evaluate("(id=>{ window.__co=null; GAME.sceneBegin(); DATE.confessOffer(GAME,{who:id}).then(r=>{ window.__co=String(r); }).catch(e=>{ window.__co='ERR '+e; }).finally(()=>GAME.sceneEnd()); })(%s)" % json.dumps(WHO))
            run.setup('【捷徑】%s：直接叫 DATE.confessOffer（正式約會結尾那一段）' % label)
            await drive(pg, cdp, [], 30); sB = await pg.evaluate(SINCE + "(%d)" % n0); co = await pg.evaluate("window.__co")
            run.check('%s：約會結尾沒有 ready、沒有告白選項（回傳 %s）' % (label, co), not sB and co in ('false', 'null'), J(sB))
        # ---- C：約滿 2 次、過了 14 天 ----
        await load(pg, cdp, run, base, 'C', 15, 2, 2)
        n0 = await pg.evaluate(N)
        await pg.evaluate("(id=>{ window.__co=null; GAME.sceneBegin(); DATE.confessOffer(GAME,{who:id}).then(r=>{ window.__co=String(r); }).catch(e=>{ window.__co='ERR '+e; }).finally(()=>GAME.sceneEnd()); })(%s)" % json.dumps(WHO))
        run.setup('【捷徑】C：直接叫 DATE.confessOffer；第一次選「（今天先不說）」')
        ch = await drive(pg, cdp, ['（今天先不說）'], 60); sC1 = await pg.evaluate(SINCE + "(%d)" % n0); co1 = await pg.evaluate("window.__co")
        print('[C1]', J(ch), J(sC1, 1200), co1)
        ready = Lx['ready']
        run.check('C 第 2 次約會結尾、過了 14 天：她說 ready（%d 句）→ 選項「（告訴她）／（今天先不說）」' % len(ready),
                  sC1[:len(ready)] == ready and any(t.startswith('［選項］（告訴她）／（今天先不說）') for t in sC1), J(sC1))
        run.check('C 先不說：結束、沒有 second、還沒交往', co1 == 'false' and not any(t in Lx['second'] for t in sC1) and not (await pg.evaluate(ST))['dating'], J([co1, await pg.evaluate(ST)]))
        await run.shot(pg, 'C1_after')
        n0 = await pg.evaluate(N)
        await pg.evaluate("(id=>{ window.__co=null; GAME.sceneBegin(); DATE.confessOffer(GAME,{who:id}).then(r=>{ window.__co=String(r); }).catch(e=>{ window.__co='ERR '+e; }).finally(()=>GAME.sceneEnd()); })(%s)" % json.dumps(WHO))
        run.setup('【捷徑】C：下一次約會結尾再叫一次；選「（告訴她）」')
        ch2 = await drive(pg, cdp, ['（告訴她）'], 240); sC2 = await pg.evaluate(SINCE + "(%d)" % n0); co2 = await pg.evaluate("window.__co")
        print('[C2]', J(ch2), J(sC2, 2500), co2)
        st2 = await pg.evaluate(ST)
        sec = Lx['second']; k2 = next((i for i, t in enumerate(sC2) if t == sec[0]), None)
        run.check('C 下一次約會結尾：不再說 ready、直接問', not any(t in ready for t in sC2) and bool(sC2) and sC2[0].startswith('［選項］（告訴她）'), J(sC2[:3]))
        run.check('C 告訴她：她說 second（%d 句、照順序）' % len(sec), k2 is not None and sC2[k2:k2 + len(sec)] == sec, J(sC2[:10]))
        run.check('C 第二次一定答應：交往中（dating_%s）、CONF_FAIL.done' % WHO, st2['dating'] and bool(st2['cf'] and st2['cf'].get('done')), J(st2))
        await run.shot(pg, 'C2_after')
        run.check('沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
