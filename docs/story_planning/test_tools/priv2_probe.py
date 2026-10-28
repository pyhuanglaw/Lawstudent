"""BB-C 10-28：v9.10.13 rc1 發布門檻 ④（LAWWW-C 10:09）——PRIV 第二版後補（eadb542e5）在瀏覽器照玩家操作。不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。
做法照 company_priv_probe.py：【前置】使用者存檔改日期時間地點；【捷徑】用遊戲的 API 補關係／階梯／知情狀態，存成快照再讀；判定用玩家操作（走過去、按說話、點對話）。對話用 50 ms 記錄（D.full），一句的也不漏。
  MODE=wait7：沒有期限的私密那一層（語彤 Y-L7 媽媽回診）——第 1 天（2025-10-07 週二 12:06 校園，c503_6_1 筱涵在旁邊）擋下來、記 PRIVWAIT；
              【前置】同一份進度跳到第 8 天（10-14 週二 12:06，筱涵還在旁邊）→ 照演，第一句旁白「（她跟旁邊的人說了一聲，走到你這邊。）」、階梯前進、PRIVWAIT 清掉
              （AA_503 第 14 節後補：等了 7 天還等不到她一個人＝第 8 天照演；②「從第一次被擋那天起算、不重算」——中間第 2 天再被擋一次，照第 1 天算）
  MODE=aunt ：第 5 點——語彤在麵店顧店、旁邊只有阿姨（hc_ayi）＝麵店的發現（MREL kind noodle）照演、不記等待；
              【捷徑】和以安、語彤都交往中（拿掉存檔原本和可昕的交往）、MREL.rec(G).pend.heroine_03＝{y:'heroine_01'}（語彤前一天發現有別人）＝同 company_priv_unit 第 9 段 setDisc
用法：LW_TESTS=<工作樹>/tests MODE=wait7 python3 priv2_probe.py '<URL>/index.html' <輸出資料夾> [存檔.json]；SHA＝記錄用"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import bbplay as P
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; MODE = os.environ.get('MODE', 'wait7')
SAVEF = sys.argv[3] if len(sys.argv) > 3 else '/tmp/claude-0/-home-user-Lawstudent/4f52e6f0-1e48-5c03-872f-171d129a03fd/scratchpad/bbtest/p0an/user_day14.json'
SAVE = json.load(open(SAVEF, encoding='utf-8'))
J = lambda o: json.dumps(o, ensure_ascii=False)
YT = 'heroine_03'
NARR = '（她跟旁邊的人說了一聲，走到你這邊。）'
DL = """(()=>{ if(window.__DL) return; window.__DL=[]; let last=''; setInterval(()=>{ try{ const D=GAME.D; const k=D&&D.active?String(D.full||''):''; if(k&&k!==last){ window.__DL.push(k); if(window.__DL.length>400) window.__DL.splice(0,200); } last=k; }catch(e){} },50); })()"""
PREP_LAD = """([id,ptr])=>{ const G=GAME.G, r=SOCIAL.rel(id); r.fam=Math.max(r.fam||0,30); if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.meet(id,G.zone);
  const D=STORY.ladData(G,id), k=D?D.key:id, so=G.social; so.ladder=so.ladder||{}; so.ladderDay=so.ladderDay||{}; so.ladder[k]=ptr; delete so.ladderDay[id]; delete so.ladderDay[k];
  if(G.flags.PRIVWAIT) for(const w in G.flags.PRIVWAIT) if(w.indexOf('|'+id)>=0) delete G.flags.PRIVWAIT[w];
  return {stage:SOCIAL.stage(id), key:k, ptr:so.ladder[k], step:D&&D.L.steps[ptr]?D.L.steps[ptr].id:null}; }"""
STATE = """(id)=>{ const G=GAME.G, D=STORY.ladData(G,id), k=D?D.key:id; return {day:G.day, h:+(+G.hour).toFixed(2), lad:(G.social.ladder||{})[k], wait:JSON.parse(JSON.stringify(G.flags.PRIVWAIT||{})),
  withNow:(typeof HCIRCLE!=='undefined'&&HCIRCLE.withNow)?HCIRCLE.withNow(GAME,id):null, held:(typeof PRIVTALK!=='undefined'?PRIVTALK.held.slice(-4):[]), narrated:(typeof PRIVTALK!=='undefined'&&PRIVTALK.narrated)?PRIVTALK.narrated.slice(-3):null}; }"""


# 【前置】站到她走路方向前面 ahead m（站得住的地方；她在走＝迎面走過來）。10-28 11:1x：rc2_priv2_wait7 三天都追不上（她和筱涵邊走邊聊，1 fps 追 15 輪始終差 6～9 m）
AHEAD = """([id,ahead])=>{ const E=GAME.E, P=E.player, n=__BBF.npc(id); if(!n||!n.obj) return null; const h=n.obj.position, lv=n.lv|0; let yaw=n.obj.rotation.y;
  if(n.path&&n.path.length){ const q=n.path[0]; if(q){ const dx=q[0]-h.x, dz=q[1]-h.z; if(Math.hypot(dx,dz)>0.2) yaw=Math.atan2(dx,dz); } }   /* engine3d.js：path＝[[x,z],…]，path[0]＝下一個點 */
  for(const da of [0,0.4,-0.4,0.8,-0.8,1.6,-1.6,3.14]){ const a=yaw+da, x=h.x+Math.sin(a)*ahead, z=h.z+Math.cos(a)*ahead; if(E.canStand&&!E.canStand(x,z,0.33,lv)) continue;
    E.placeAt(P,x,z,lv); P.path=null; P.obj.rotation.y=Math.atan2(h.x-x,h.z-z); return {x:+x.toFixed(2),z:+z.toFixed(2),hx:+h.x.toFixed(2),hz:+h.z.toFixed(2),da,beh:n.beh||null}; }
  return null; }"""


async def talk_ahead(pg, cdp, run, tag, picks=(), tries=8):
    for k in range(tries):
        p = await pg.evaluate(AHEAD, [YT, 1.2]); run.setup('[前置] %s 第 %d 次：站到語彤走路方向前面 1.2 m %s' % (tag, k + 1, J(p)))
        if not p: await pg.wait_for_timeout(3000); continue
        for _ in range(12):   # 最多 6 秒等按鈕變成「和她說話」
            g = await pg.evaluate("id=>__BBF.target(id)", YT)
            if g and g['ok']: break
            await pg.wait_for_timeout(500)
        if not (g and g['ok']): run.note('%s：按鈕是「%s」（要「%s」）、離她 %s m' % (tag, g and g['lab'], g and g['want'], g and g['d'])); continue
        await L.tap(pg, cdp, '#interact')   # 照玩家：按「和她說話」
        r = await P.dialog(pg, cdp, run, picks, max_s=120, tag=tag)
        if r['started']: r['label'] = g['want']; return r
        run.note('%s：按了沒有開始說話，再站一次' % tag)
    run.note('%s：%d 次都沒說到話' % (tag, tries)); return None


async def talk(pg, cdp, run, tag, picks=()):
    n0 = await pg.evaluate("window.__DL.length")
    if MODE == 'wait7':
        r = await talk_ahead(pg, cdp, run, tag, picks=picks)
        dl = await pg.evaluate("n=>window.__DL.slice(n)", n0)
        run.note('%s：50 ms 記錄的句子 %s' % (tag, J(dl[:10])))
        return r, dl
    h = await P.who(pg, YT)
    if h and h.get('x') is not None: await P.place_near(pg, run, h['x'], h['z'], R=6.0, what='語彤')   # 【前置】站到她 6 m 外（1 fps 從出生點走 40 m 她早就走開了）
    n0 = await pg.evaluate("window.__DL.length")
    r = await P.talk_to(pg, cdp, run, YT, tag, picks=picks)
    dl = await pg.evaluate("n=>window.__DL.slice(n)", n0)
    run.note('%s：50 ms 記錄的句子 %s' % (tag, J(dl[:10])))
    return r, dl


async def main():
    run = L.Run('priv2_' + MODE, OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        await P.init(pg)
        if MODE == 'wait7':
            st, d = await P.base(pg, SAVE, '2025-10-07', 12.1, 'campus')
            await P.load(pg, cdp, st, quiet=True); await pg.evaluate(DL)
            run.setup('[前置] 使用者存檔 → 2025-10-07（星期二）12:06 校園（c503_6_1 語彤×筱涵）；關掉條件事件')
            lad = await P.prep(pg, cdp, run, PREP_LAD, [YT, 6], label='語彤熟悉 ≥30、閒聊階梯指標＝6（Y-L7）、今天還沒走過、清掉她的 PRIVWAIT')
            await pg.evaluate(DL)
            run.check('前置：階梯下一層是 Y-L7', lad.get('step') == 'Y-L7', J(lad))
            s0 = await pg.evaluate(STATE, YT); run.note('第 1 天：%s' % J(s0))
            run.check('前置：第 1 天筱涵在她旁邊（withNow）', bool(s0['withNow']), J(s0))
            r1, dl1 = await talk(pg, cdp, run, 'day1')
            s1 = await pg.evaluate(STATE, YT); run.note('第 1 天說完：%s' % J(s1))
            w1 = [v for k, v in s1['wait'].items() if k.startswith('yt_mom_lad|')]
            run.check('第 1 天：Y-L7 沒出（「我媽每個月要回診一次」沒有）', not any('回診' in t for t in dl1), J(dl1))
            run.check('第 1 天：記等待（PRIVWAIT 記成第 1 天）、階梯不前進', w1 == [s1['day']] and s1['lad'] == 6, J(s1))
            d1 = s1['day']
            # 第 2 天再被擋一次：不重算
            await P.jump(pg, cdp, run, '2025-10-09', 12.1, 'campus', pos=None, note='第 3 天（週四，筱涵還在）')
            await pg.evaluate(DL)
            s2a = await pg.evaluate(STATE, YT)
            if s2a['withNow']:
                r2, dl2 = await talk(pg, cdp, run, 'day3')
                s2 = await pg.evaluate(STATE, YT); w2 = [v for k, v in s2['wait'].items() if k.startswith('yt_mom_lad|')]
                run.check('第 3 天又被擋：Y-L7 還是沒出、PRIVWAIT 還是第 1 天（不重算）', not any('回診' in t for t in dl2) and w2 == [d1] and s2['lad'] == 6, J(s2))
            else:
                run.note('第 3 天筱涵不在她旁邊（%s），這一步跳過' % J(s2a))
            await P.jump(pg, cdp, run, '2025-10-14', 12.1, 'campus', pos=None, note='第 8 天（週二，筱涵在旁邊）')
            await pg.evaluate(DL)
            s8a = await pg.evaluate(STATE, YT); run.note('第 8 天：%s' % J(s8a))
            run.check('前置：第 8 天筱涵還在她旁邊', bool(s8a['withNow']), J(s8a))
            r8, dl8 = await talk(pg, cdp, run, 'day8')
            s8 = await pg.evaluate(STATE, YT); w8 = [v for k, v in s8['wait'].items() if k.startswith('yt_mom_lad|')]
            run.check('第 8 天：第一句是旁白「%s」' % NARR, bool(dl8) and NARR in dl8[0], J(dl8[:3]))
            run.check('第 8 天：接著 Y-L7「我媽每個月要回診一次…」照演、階梯前進 6→7、等待清掉', any('回診' in t for t in dl8) and s8['lad'] == 7 and not w8, J(s8))
            await run.shot(pg, 'day8_end')
        elif MODE == 'aunt':
            d = await pg.evaluate("""(()=>{ const G=GAME.G; for(let w=2;w<=15;w++){ for(const wd of [1,2,3,4,5]){ const x=STORY.termDay('Y1S1',w,wd); if(x==null) continue; const g=Object.assign({},G,{day:x,hour:18.2,zone:'noodle',weekday:wd%7}); if(MREL.ytShift&&MREL.ytShift(g)) return {d:x, key:CALENDAR.dateOf(x).key, w, wd}; } } return null; })()""")
            run.note('語彤在麵店顧店的一天：%s' % J(d))
            run.check('前置：找得到語彤顧店的日子（MREL.ytShift）', bool(d), J(d))
            st, _ = await P.base(pg, SAVE, d['key'], 18.2, 'gongguan')
            await P.load(pg, cdp, st, quiet=True); await pg.evaluate(DL)
            run.setup('[前置] 使用者存檔 → %s 18:12 公館（語彤 18:00 起在麵店顧店）' % d['key'])
            pr = await P.prep(pg, cdp, run, """(()=>{ const G=GAME.G; G.flags.dating_kexin=false; if(G.flags.romance) delete G.flags.romance.kexin; G.flags.ROMANCE_HISTORY=(G.flags.ROMANCE_HISTORY||[]).filter(r=>r&&r.id!=='kexin');
                for(const id of ['heroine_03','heroine_01']){ const r=SOCIAL.rel(id); r.fam=Math.max(r.fam||0,65); r.trust=Math.max(r.trust||0,50); r.comf=Math.max(r.comf||0,45); if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.meet(id,'noodle'); try{ ROM.start(G,id); }catch(e){} }
                MREL.rec(G).pend.heroine_03={y:'heroine_01',day:G.day-1,h:0}; return {partners:ROM.partners(G), pend:MREL.rec(G).pend.heroine_03}; })()""", label='和以安、語彤都交往中；語彤前一天發現有別人（MREL pend）')
            await pg.evaluate(DL)
            door = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='noodle'); return it&&[it.x,it.z,it.label]; })()")
            run.note('麵店的門：%s' % J(door))
            await P.events_on(pg)
            await L.go_to(pg, cdp, run, door[0], door[1], 0.9, door[2] or '麵店的門', max_s=240)
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(6000)
            z = await pg.evaluate("GAME.G.zone"); run.check('走進麵店', z == 'noodle', str(z))
            s0 = await pg.evaluate(STATE, YT); run.note('麵店裡：%s' % J(s0))
            run.check('前置：語彤旁邊只有阿姨（withNow＝hc_ayi）', s0['withNow'] == ['hc_ayi'] or (s0['withNow'] and set(s0['withNow']) <= {'hc_ayi'}), J(s0['withNow']))
            r, dl = await talk(pg, cdp, run, 'noodle')
            s1 = await pg.evaluate(STATE, YT); pend = await pg.evaluate("(()=>{ const p=MREL.rec(GAME.G).pend; return p&&p.heroine_03||null; })()")
            run.note('說完：%s；pend %s' % (J(s1), J(pend)))
            w = [v for k, v in s1['wait'].items() if YT in k]
            run.check('只有阿姨在旁邊＝麵店的發現照演（pend 清掉、有說話）、不記等待', pend is None and bool(dl) and not w, J({'pend': pend, 'wait': s1['wait'], 'lines': dl[:4]}))
            await run.shot(pg, 'noodle_end')
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE)
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
