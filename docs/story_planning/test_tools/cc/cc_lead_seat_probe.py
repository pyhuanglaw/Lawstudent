"""CC-B（帳號 B）11-08：總圖一起念書，「直接坐她留的位子」會不會開演（BB-B 03:43；SIS A1/A3 探針順手發現）。判定＝BB。
【前置】使用者 11-07 的 day46 存檔，時間改 13:00 宿舍；照玩家點手機「朋友」→ WHO（預設以安）的「約」→ 念書 → 總圖 → 今天第一個時間。
到約的時間【前置】照手機「直接過去」（GM.quickGo force）→ 她說完帶路的話、走到二樓坐好（INV lead.ph＝wait）以後：
  a  點她留的那張椅子（lead.me，tap_ground＝玩家點椅子）→ 選單選「讀書」（再有時間選單選第一個）→ 等 15 秒看有沒有開演
  b  同上，選「坐一下」
  c  對照：走到她旁邊 1.2 m 內（invites3d.js leadTick 的 nearHer）→ 應該開演
每條記：選單選項、坐下後玩家（座位）和她（她的座位）的距離、有沒有開演（lead.ph 變 sit／有她說的話）、開演前等了幾秒、walkFallbacks。
用法：LW_TESTS=<wt>/tests SAVE46=… [WHO=heroine_01] [MODES=a,b,c] python3 cc_lead_seat_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
R = L.Run('lead_seat', OUT); D.setup(R, OUT)
SAVE46 = os.environ['SAVE46']; WHO = os.environ.get('WHO') or 'heroine_01'
MODES = [m for m in (os.environ.get('MODES') or 'a,b,c').split(',') if m]
WRAP = """(()=>{ if(GAME._ccQW) return; window.__says=[]; const f=GAME.say; GAME.say=function(who,text){ try{ window.__says.push({who:who?(typeof who==='string'?who:(who.name||'')):'', t:String(text), h:+(+GAME.G.hour).toFixed(2)}); }catch(e){} return f.apply(this,arguments); }; GAME._ccQW=true; })()"""
LEAD = "(id=>{ const v=(GAME.G.invites||[]).filter(q=>q.who===id).slice(-1)[0]; if(!v) return null; return JSON.parse(JSON.stringify({id:v.id, state:v.state, place:v.place, h:v.h, lead:v.lead||null, opened:v.opened||0})); })"
POS = "(id=>{ const P=GAME.E.player, n=GAME.npc&&GAME.npc[id]; const f=o=>o?[+o.x.toFixed(2),+o.z.toFixed(2)]:null; return {p:f(P.obj.position), plv:P.lv|0, pseat:P.seat?[P.seat.x,P.seat.z,P.seat.lv|0]:null, n:n&&n.obj?f(n.obj.position):null, nlv:n?n.lv|0:null, nseat:n&&n.seat?[n.seat.x,n.seat.z]:null, busy:!!P.busy, dlg:!!(GAME.D&&GAME.D.active), h:+(+GAME.G.hour).toFixed(3)}; })"


async def choices(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent!==null).map(b=>({t:b.innerText.trim(), dim:b.classList.contains('dim')||b.disabled}))")


async def tap_choice(pg, cdp, k):
    c = await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent!==null)[i]; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })", k)
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900)


async def drive(pg, cdp, prefs, max_s=200, idle_end=6):
    out = []; t0 = time.time(); quiet = None
    while time.time() - t0 < max_s:
        s = await L.state(pg)
        if s['choices']:
            quiet = None; bs = await choices(pg); k = None
            for w in prefs:
                k = next((i for i, b in enumerate(bs) if w in b['t'] and not b['dim']), None)
                if k is not None: break
            if k is None: k = next((i for i, b in enumerate(bs) if not b['dim'] and not any(x in b['t'] for x in ('算了', '返回', '取消'))), 0)
            out.append([b['t'] for b in bs] + ['→ ' + bs[k]['t']]); await tap_choice(pg, cdp, k); continue
        if s['dlg']:
            quiet = None; await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if quiet is None: quiet = time.time()
        if time.time() - quiet > idle_end: break
        await pg.wait_for_timeout(400)
    return out


async def run_mode(pg, cdp, mode, rec):
    tag = '[%s]' % mode
    sv = json.load(open(SAVE46, encoding='utf-8')); sv['hour'] = 13.0; sv['zone'] = 'dorm'; sv['pos'] = None; sv.setdefault('home', {})['at'] = False
    R.setup('%s 【前置】day46 存檔（day %s）13:00 宿舍' % (tag, sv.get('day')))
    await L.load_state(pg, sv, quiet_phone=True); await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp); await pg.evaluate(WRAP)
    await pg.evaluate("GAME.openPhone('friends')"); await pg.wait_for_timeout(1500)
    ok = await pg.evaluate("(id=>{ const b=document.querySelector('[data-inv=\"'+id+'\"]'); if(!b) return false; b.scrollIntoView({block:'center'}); return true; })", WHO)
    if not R.check('%s 手機「朋友」有 %s 的「約」' % (tag, WHO), ok, ''): return
    await L.tap(pg, cdp, '[data-inv="%s"]' % WHO); await pg.wait_for_timeout(1200)
    c0 = await drive(pg, cdp, ['念書…', '總圖', '今天'])
    iv = await pg.evaluate(LEAD, WHO); R.note('%s 約：選項 %s；結果 %s' % (tag, J(c0), J(iv)))
    if not R.check('%s 約成總圖' % tag, bool(iv and iv['state'] == 'accepted' and iv['place'] == 'library'), J(iv)): return
    await pg.evaluate("GAME.closePhone&&GAME.closePhone()")
    await pg.evaluate("(h=>{ GAME.G.hour=Math.max(GAME.G.hour,h-0.1); })", iv['h'])
    tgt = await pg.evaluate("(id=>{ const v=(GAME.G.invites||[]).filter(q=>q.who===id&&q.state==='accepted').slice(-1)[0]; return INV.goTarget(GAME.G,v); })", WHO)
    R.setup('%s 【前置】時間撥到約的前 6 分鐘，照手機「直接過去」GM.quickGo(%s, force)' % (tag, J(tgt)))
    wf0 = await pg.evaluate("GAME.walkFallbacks||0")
    await pg.evaluate("(t=>{ void GAME.quickGo([t.zone,t.name,t.spawn||null],{force:true}); })", tgt); await pg.wait_for_timeout(8000)
    c1 = await drive(pg, cdp, [], max_s=120, idle_end=5)
    ld = None
    for _ in range(40):
        ld = await pg.evaluate(LEAD, WHO)
        if ld and ld.get('lead') and ld['lead'].get('me'): break
        await pg.wait_for_timeout(1000)
    R.note('%s 到了：選項 %s；帶路 %s；說的話 %s' % (tag, J(c1), J(ld), J(await pg.evaluate("window.__says||[]"))))
    if not R.check('%s 她帶路（lead 有 me、her）' % tag, bool(ld and ld.get('lead') and ld['lead'].get('me')), J(ld)): return
    me, her = ld['lead']['me'], ld['lead']['her']
    await L.go_to(pg, cdp, R, (me['x'] + her['x']) / 2, me['z'] + 1.6, 1.0, '%s 跟她上二樓（停在兩張座位前面 1.6 m，不進她的 2 m）' % tag, max_s=240, lv=me.get('lv', 0))
    for _ in range(90):
        ld = await pg.evaluate(LEAD, WHO)
        if not ld or not ld.get('lead') or ld['lead'].get('ph') != 'go': break
        await pg.wait_for_timeout(1000)
    p0 = await pg.evaluate(POS, WHO); R.note('%s 她坐好了？帶路 %s；位置 %s；me↔her 座位距離 %.2f m' % (tag, J(ld and ld.get('lead')), J(p0), math.hypot(me['x'] - her['x'], me['z'] - her['z'])))
    await pg.evaluate("window.__says=[]")
    r = {'me': me, 'her': her, 'before': p0}
    if mode in ('a', 'b'):
        tp = None
        for _ in range(4):
            tp = await L.tap_ground(pg, cdp, me['x'], me['z'], lv=me.get('lv', 0))
            if tp: break
            await L.turn_camera_to(pg, cdp, me['x'], me['z']); await pg.wait_for_timeout(400)
        menu = None
        for _ in range(40):
            await pg.wait_for_timeout(500)
            if (await L.state(pg))['choices']: menu = await choices(pg); break
        p1 = await pg.evaluate(POS, WHO)
        R.note('%s 點她留的椅子（tap %s）：選單 %s；位置 %s' % (tag, J(tp), J(menu), J(p1)))
        await R.shot(pg, 'menu_' + mode)
        r['menu'] = menu; r['after_tap'] = p1
        want = '讀書' if mode == 'a' else '坐一下'
        if menu:
            k = next((i for i, b in enumerate(menu) if b['t'].startswith(want)), None)
            if k is None: R.check('%s 選單有「%s」' % (tag, want), False, J(menu)); return
            await tap_choice(pg, cdp, k)
            sub = await choices(pg)
            if sub: r['sub'] = sub; R.note('%s 第二層選單 %s → 選第一個' % (tag, J(sub))); await tap_choice(pg, cdp, 0)
    else:
        await L.go_to(pg, cdp, R, her['x'], her['z'], 1.2, '%s 走到她旁邊 1.2 m' % tag, max_s=120, lv=her.get('lv', 0))
    t0 = time.time(); started = None; trail = []
    while time.time() - t0 < 25:
        ld = await pg.evaluate(LEAD, WHO); ps = await pg.evaluate(POS, WHO); says = await pg.evaluate("window.__says||[]")
        trail.append({'t': round(time.time() - t0, 1), 'ph': (ld or {}).get('lead', {}) and (ld['lead'] or {}).get('ph'), 'opened': (ld or {}).get('opened'), 'dlg': ps['dlg'], 'pseat': ps['pseat'], 'h': ps['h'], 'nsay': len(says)})
        if started is None and (((ld or {}).get('lead') or {}).get('ph') == 'sit' or ((ld or {}).get('opened')) or any(x['who'] for x in says)): started = round(time.time() - t0, 1); await R.shot(pg, 'start_' + mode)
        if started is not None and time.time() - t0 > started + 3: break
        await pg.wait_for_timeout(1000)
    ps = await pg.evaluate(POS, WHO)
    dist = math.hypot(ps['pseat'][0] - her['x'], ps['pseat'][1] - her['z']) if ps['pseat'] else (math.hypot(ps['p'][0] - her['x'], ps['p'][1] - her['z']) if ps['p'] else None)
    R.note('%s 15～25 秒內：%s；玩家（座位）離她的位子 %s m；最後 %s' % (tag, J(trail), None if dist is None else round(dist, 2), J(ps)))
    rest = await drive(pg, cdp, [], max_s=200, idle_end=8)
    says = await pg.evaluate("window.__says||[]")
    R.note('%s 之後：選項 %s；說的話 %s' % (tag, J(rest), J(says[:12])))
    wf = (await pg.evaluate("GAME.walkFallbacks||0")) - wf0
    R.check('%s 開演了（lead.ph sit／opened／她說話），在 %s 秒' % (tag, started), started is not None, J(trail[-3:]))
    R.check('%s walkFallbacks 0' % tag, wf == 0, str(wf))
    r.update({'started': started, 'trail': trail, 'dist': dist, 'says': says, 'wf': wf})
    rec[mode] = r


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 總圖一起念書：直接坐她留的位子；worktree %s；WHO=%s；MODES=%s；Playwright ≠ iPhone' % (real or '?', WHO, MODES), flush=True)
    rec = {'sha': real, 'who': WHO}
    async with async_playwright() as p:
        for mode in MODES:
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            try:
                await cc_det.install(pg, 20261108); await pg.goto(URL)
                if not R.check('[%s] 遊戲載入' % mode, await L.wait_loaded(pg), ''): continue
                await pg.evaluate("localStorage.clear()")
                await run_mode(pg, cdp, mode, rec)
                R.check('[%s] 沒有 JS 例外' % mode, not errs, J(errs[:3]))
            except Exception as ex: R.check('[%s] 探針沒有例外' % mode, False, repr(ex)[:300])
            finally: await b.close()
    json.dump(rec, open(os.path.join(OUT, 'lead_seat.json'), 'w'), ensure_ascii=False, indent=1, default=str)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
