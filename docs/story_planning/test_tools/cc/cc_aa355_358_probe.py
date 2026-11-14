"""CC-C 11-14：BB-TEST-AA355-358-1021（BB_462 220f577bc1「第二層派 CC」；對 main 6106fae2d2）。每一項都是「有走到／沒走到」對照，只記字、旗標、截圖，判定歸 BB。Playwright ≠ iPhone。
PARTS（逗號分隔，預設 NOODLE,CAFE,JP,SPORTS）：
  NOODLE（AA_358 2-1，story3d.js noodleScene 阿哲那一場）：
    A   【前置／捷徑】最小存檔讀到 2025-09-02（mainDay 2，週二）15:45 Café、旗標＝小安追上來選「去咖啡廳」那一刻（metAn、plan cafe、companion an）→ 遊戲自己的 STORY.onEnter 演 cafeScene（選項都選第 1 個＝cafeView A）
        →【前置】同一份進度跳到 18:00 公館 → 照玩家進燒臘店、坐阿哲旁邊（不是他那一張）→ 點餐 → 阿哲要問「所以下午你跟小安去哪了？…」、有「沒有啊，剛好同路。」那組選項
    B1  【前置／捷徑】2025-09-02 18:00 公館、旗標＝選「今天有點累，改天。」那一刻（metAn、anSkipped、afternoonDone）→ 同上進店 → 要「下午沒看到你，我還以為你先回宿舍了。」、沒有那句問話和那組選項
    B2  【前置】2025-09-04（mainDay 4，週四）17:55 公館、沒遇到小安（metAn／anSkipped／afternoonDone 都沒有）→ 遊戲的 S.tick 自己記 anMissed → 同上
    阿哲傍晚在燒臘店照作息（週二、四 18:00～19:30，characters.js zhe）。收三路的對話全文、F.plan／anSkipped／anMissed／zheNoodleDone。
  CAFE（AA_358 2-2／2-4）：NOCAFE（拒絕咖啡廳：沒有 cafeView）、A（cafeView A：G.choices.cafeView＝F.cafeView＝'A'）兩路各兩步——
    ① 2-2 talkAn 的 anAfter 那一句：2025-09-03 起找小安在場的時段（STORY.schedEnt 掃，不在圖書館的那一個）→ 照玩家走過去說話 → NOCAFE 不能有「那天」「賠十倍」；A 要有「不能賠十倍」
    ② 2-4 ev_an_report_followup（events.js，location library、trigger interact）：【捷徑】ev_an_report_split 記成演過、拿掉 REPORT_PARTNER 記憶（新局在 meetAn 一定記，照程式新局走不到）
       → 小安在總圖的時段照玩家說話 → NOCAFE 要「（小聲）你先看。哪裡不通直接講。」＋選項「「妳寫得出來的。」」「「改天請妳喝咖啡。」」、不能有「那天」「賠十倍」；A 要「不能讓人因為一個手誤賠十倍」那句
  JP（AA_355 4c，jp3d.js dinnerPhone）：2028-06-09（五）20:45 日本房間 jp_room，日本路線、已出發沒回程（EXCHANGE_ROUTE JP、JP_DEPARTED＝3/25）、認識以安、FRIEND 以上（fam 45 trust 30）
    CTRL（沒交往過、沒有 romance 那一筆）→ 21:00 後手機要收到 jp_g7_dinner_ask（「週六晚上有空嗎。」）；EX／PAUSED／FAC（romance.heroine_01.status＝ex／paused／friend_after_catch）→ 不能收到
    「訂同一班飛機」：jp3d.js 只有註解、找不到對應的程式，只記 G.flags 裡含 FLIGHT／SAME 的鍵，交 BB。
  SPORTS（AA_355 6，classes3d.js dayLabel、calendar.js MARK）：Y2 2026-11-20（五）08:00 宿舍 → 手機「今天」那行要有「全校運動會」、今天有課（CLS.dayItems）、一鍵「到下一堂課」上得了（出席有記）；
    對照 Y1 2025-11-21（五）08:00 → 那行是「運動會（停課）」、今天沒課。基底存檔照 cc_study_play_probe 的 FIX（使用者存檔）。
CC-B 11-14：NATURAL（AA358_24_natural，BB_462：A 去咖啡廳／B 拒絕／C 沒遇到，不用 split 記憶捷徑；只有 A 走到 Café 那段用【前置】跳過去）；SPORTS 一鍵前先關手機；CAFE ② 讀書區第一次點頭後再說一次；JP_CTRL 的 romance 'none' 算沒有；CAFE 補 SOCIAL.meet 捷徑、① 改找劇情的 an（椰影大道 18:30）。
CC_02 清單 2026-11-14：1✓（日期照 BB_462 與 src：mainDay 用 STORY.mainDay 驗；阿哲的時段照 characters.js；小安的時段用 STORY.schedEnt 掃；6/9 21:00 照 jp3d.js） 2✓（字、旗標、座位、互動點都從遊戲讀：eat==='noodle'、GAME.npc.zhe、PHONE.sent、CLS） 3✓（座位挑離阿哲最近、不是他坐的那張、2.5 m 內） 4✓（按之前確認互動鍵的字；選項照字比對） 5✓（走路用 go_to／use_exit 到站得住的點） 6✓（每句對話等 650 ms；手機等遊戲時間過 21:06；上課最多等 6 分鐘） 7✓（lint、canon） 8✓（只記不判；對話用 MutationObserver＋GAME.say 兩份） 9✓（每一路、每一步截圖） 10✓（每一路先演完插進來的劇情再往下；B2 讓遊戲自己的 tick 記 anMissed） 11✓（佇列 probe、SHA 40 碼） 12✓（FAIL_SETUP：每一路先驗日期、區域、旗標真的成立，阿哲在場、小安在場才往下） 13✓（走路途中有對話就先點完）
用法：LW_TESTS=<wt>/tests SHA=<sha> [PARTS=NOODLE,CAFE,JP,SPORTS] [ROUTES=A,B1,B2] [FIX=tests/fixtures/user_save_day51b_1110.json] python3 cc_aa355_358_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import bbplay as P
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
PARTS = [c for c in (os.environ.get('PARTS') or 'NOODLE,CAFE,JP,SPORTS').split(',') if c]
ROUTES = [c for c in (os.environ.get('ROUTES') or '').split(',') if c]
TESTS = os.environ.get('LW_TESTS') or 'tests'
FIX = os.environ.get('FIX') or 'tests/fixtures/user_save_day51b_1110.json'
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('aa355_358', OUT); D.setup(R, OUT)
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'classAnswer': 'good', 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True,
         'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True, 'MET_ZHE': True, 'fundsV2': 1, 'KX_DEC3_MIGRATED': True,
         'dating_kexin': False, 'DORM_FOUR': True, 'MET_KAI': True}   # 同 cc_bb403_probe：metAn／afternoonDone／zheNoodleDone 不給（照各路設）
ASK_ZHE = '所以下午你跟小安去哪了？'
NO_SEE = '下午沒看到你，我還以為你先回宿舍了。'
FLAGS_JS = r"""(()=>{ const G=GAME.G, F=G.flags||{}; let rp=null, met=null; try{ rp=SOCIAL.has('heroine_01','REPORT_PARTNER'); met=SOCIAL.stage('heroine_01'); }catch(e){}
  const R=(F.romance&&F.romance.heroine_01)||null;
  return {key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(2), zone:G.zone, mainDay:STORY.mainDay?STORY.mainDay(G):null, metAn:!!F.metAn, met_an:!!F.met_an, anSkipped:!!F.anSkipped, anMissed:!!F.anMissed,
    afternoonDone:!!F.afternoonDone, plan:F.plan||null, companion:F.companion||null, cafeView:F.cafeView||null, choicesCafeView:(G.choices&&G.choices.cafeView)||null, zheNoodleDone:!!F.zheNoodleDone, anAfter:!!F.anAfter,
    reportPartner:rp, anStage:met, split:!!(G.events&&G.events.done&&G.events.done.ev_an_report_split), followup:!!(G.events&&G.events.done&&G.events.done.ev_an_report_followup),
    route:F.EXCHANGE_ROUTE||null, jpDep:F.JP_DEPARTED==null?null:F.JP_DEPARTED, jpRet:F.JP_RETURNED==null?null:F.JP_RETURNED, rom:R, dinner:F.AN_JP_DINNER_ASK||null, treat:!!F.AN_TREAT_OWED,
    flightKeys:Object.keys(F).filter(k=>/FLIGHT|SAME/i.test(k))}; })()"""
DLGLOG_JS = r"""(()=>{ if(window.__ccDlg) return 'already'; window.__ccDlg=[]; let last='';
  const rec=()=>{ try{ const D=GAME.D||{}, d=document.getElementById('dlg'); if(!d||d.classList.contains('hide')) return; const t=String(D.full||(document.getElementById('dlgText')||{}).textContent||'').trim(); const w=((document.getElementById('dlgName')||{}).textContent||'').trim();
    const k=w+'｜'+t; if(t&&k!==last){ last=k; window.__ccDlg.push({h:+(+GAME.G.hour).toFixed(3), zone:GAME.G.zone, who:w, t}); } }catch(e){} };
  for(const id of ['dlgText','dlg','dlgName']){ const el=document.getElementById(id); if(el) new MutationObserver(rec).observe(el,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['class']}); }
  return 'on'; })()"""
SEAT_JS = r"""(()=>{ const E=GAME.E, z=GAME.npc&&GAME.npc.zhe; const its=E.interactables.filter(i=>i&&i.eat==='noodle'&&!i.hidden); if(!its.length) return {n:0, zhe:null};
  const zp=z&&z.obj?z.obj.position:null; const d=i=>zp?Math.hypot(i.x-zp.x,i.z-zp.z):99;
  const free=its.filter(i=>d(i)>0.35).sort((a,b)=>d(a)-d(b)); const it=free[0]||null;   /* 11-14 BB403 REFUSE：挑到阿哲自己那一張（d 0）＝互動鍵變「和阿哲打招呼」——排除他那張 */
  return {n:its.length, zhe:zp?[+zp.x.toFixed(2),+zp.z.toFixed(2)]:null, zheSeat:!!(z&&z.seat), it:it?{x:+it.x.toFixed(2),z:+it.z.toFixed(2),r:it.radius||1,lv:it.lv|0,label:it.label||''}:null, dZhe:it?+d(it).toFixed(2):null}; })()"""
AN_SCAN = r"""((a)=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday,zone:G.zone}; const C=CHARACTERS.heroine_01; let out=null;
  try{ for(let d=a.d0; d<a.d0+a.days&&!out; d++){ for(let h=a.h0; h<a.h1; h+=0.5){ G.day=d; G.weekday=CALENDAR.dateOf(d).wd%7; G.hour=h; let e=null; try{ e=STORY.schedEnt(C,G); }catch(x){}
      if(e&&e.zone&&(a.zone?e.zone===a.zone:(a.not.indexOf(e.zone)<0&&a.ok.indexOf(e.zone)>=0))){ out={day:d, key:CALENDAR.dateOf(d).key, h, zone:e.zone, act:e.act||null}; break; } } } }
  finally{ Object.assign(G,keep); } return out; })"""


def fix_path(rel):
    for base in (os.path.dirname(TESTS), '.'):
        p = os.path.join(base, rel)
        if os.path.exists(p): return p
    return rel


async def mini(pg, key, h, zone, flags):
    """最小存檔（同 cc_bb403_probe：MAIN_D1＝2025-09-01）"""
    d1 = await P.day_of(pg, '2025-09-01'); d = await P.day_of(pg, key)
    s = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'outings': [], 'flags': dict(BASEF, MAIN_D1=d1['d'], **flags)}
    s.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=None, weather='clear', stage='law', money=30000)
    return s


async def dlg_mark(pg):
    await pg.evaluate(DLGLOG_JS)
    return await pg.evaluate("(window.__ccDlg||[]).length")


async def dlg_since(pg, n0):
    return await pg.evaluate("(n=>(window.__ccDlg||[]).slice(n))", n0)


async def play(pg, cdp, tag, alt=0, start_s=60, max_s=300, prefer=()):
    """等對話開始 → 一句一句點（每一句截圖，最多 40 張）→ 選項照 prefer（開頭符合）否則第 alt 個 → 結束"""
    n0 = await P.say_hook(pg); m0 = await dlg_mark(pg); t0 = time.time(); seen = []; opts = []; picked = []; k = 0; started = False; idle = None
    while time.time() - t0 < start_s + max_s:
        s = await P.ts(pg)
        if s['txt'] and (not seen or seen[-1] != [s['name'], s['txt']]):
            seen.append([s['name'], s['txt']])
            if len(seen) <= 40: await pg.wait_for_timeout(300); k += 1; await pg.screenshot(path=os.path.join(OUT, '%s_%02d.png' % (tag, k)))
        if s['ch']:
            started = True; idle = None; o = [x['t'] for x in s['ch']]; opts.append(o)
            ok_ = [n for n, t in enumerate(o) if not any(w in t for w in ('不點', '先不吃', '算了', '不用了', '要水', '離開'))] or list(range(len(o)))   # 點餐那種選單不選「不點／要水」（CC_02 乙10）
            i = next((n for n, t in enumerate(o) for p in prefer if t.startswith(p)), ok_[min(alt, len(ok_) - 1)])
            picked.append(o[i]); k += 1; await pg.screenshot(path=os.path.join(OUT, '%s_%02d_choice.png' % (tag, k)))
            await P.tap_choice(pg, cdp, i); await pg.wait_for_timeout(900); continue
        if s['dlg']: started = True; idle = None; await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if s['depth'] > 0: started = True; idle = None; await pg.wait_for_timeout(500); continue
        if s['busy']: idle = None; await pg.wait_for_timeout(500); continue
        if s['phone']: await L.phone_away(pg, cdp)
        if started:
            idle = idle or time.time()
            if time.time() - idle > 4: break
        elif time.time() - t0 > start_s: break
        await pg.wait_for_timeout(600)
    said = await P.said(pg, n0); obs = await dlg_since(pg, m0)
    r = {'started': started, 'lines': P.clean(seen), 'said': said, 'obs': obs, 'opts': opts, 'picked': picked}
    R.note('[%s] 對話：選項 %s；選了 %s；GAME.say %s' % (tag, J(opts), J(picked), J(said)))
    return r


def text_of(r):
    return ' '.join(t for _, t in (r.get('said') or [])) + ' ' + ' '.join(x.get('t', '') for x in (r.get('obs') or [])) + ' ' + ' '.join(sum(r.get('opts') or [], []))


async def noodle(pg, cdp, tag):
    """公館 → 照玩家進燒臘店 → 阿哲旁邊（不是他那一張）的座位 → 按 → 點餐（第一樣）→ play"""
    s = await D.st(pg)
    if s['zone'] != 'noodle':
        s = await D.use_exit(pg, cdp, tag + ' 進店', '進入公館燒臘', 'noodle')
    if not R.check('FAIL_SETUP 檢查：[%s] 照玩家進了燒臘店' % tag, bool(s) and s['zone'] == 'noodle', J(s)): return None
    await pg.wait_for_timeout(2500); st = await pg.evaluate(SEAT_JS); R.note('[%s] 座位／阿哲 %s' % (tag, J(st)))
    await pg.screenshot(path=os.path.join(OUT, '%s_noodle_in.png' % tag))
    if not R.check('FAIL_SETUP 檢查：[%s] 阿哲在店裡、坐著、旁邊 2.5 m 內有另一張座位' % tag, bool(st.get('zhe')) and st.get('zheSeat') and st.get('it') and st['dZhe'] < 2.5, J(st)): return None
    it = st['it']; tgt = await D.standable_near(pg, it['x'], it['z'], it['r'] * 0.6, it['lv'])
    await L.go_to(pg, cdp, R, (tgt or it)['x'], (tgt or it)['z'], 0.3, '[%s] 阿哲旁邊的座位' % tag, max_s=60, lv=it['lv'])
    q = await D.settle(pg)
    if not R.check('FAIL_SETUP 檢查：[%s] 互動鍵是座位「%s」（不是和阿哲打招呼）' % (tag, it['label']), q['interact'].startswith(it['label'][:2]) if it['label'] else bool(q['interact']), J(q)): return None
    await L.tap(pg, cdp, '#interact')
    return await play(pg, cdp, tag + '_noodle', 0, start_s=20)


async def part_noodle(pg, cdp):
    out = {}
    for rt in (ROUTES or ['A', 'B1', 'B2']):
        tag = 'NOODLE_' + rt; res = {'route': rt}
        if rt == 'A':
            s = await mini(pg, '2025-09-02', 15.75, 'cafe', {'metAn': True, 'met_an': True, 'AN_NAME_TOLD': True, 'plan': 'cafe', 'companion': 'an'})
            await P.init(pg); await dlg_mark(pg); await P.load(pg, cdp, s, True); await P.events_on(pg)
            R.setup('[%s]【前置／捷徑】最小存檔讀到 2025-09-02 15:45 Café，旗標＝選「去咖啡廳」那一刻（metAn、plan cafe、companion an）；STORY.onEnter 自己演 cafeScene' % tag)
            f0 = await pg.evaluate(FLAGS_JS); res['f0'] = f0
            if not R.check('FAIL_SETUP 檢查：[%s] mainDay 2、在 Café、plan cafe、companion an' % tag, f0['mainDay'] == 2 and f0['zone'] == 'cafe' and f0['plan'] == 'cafe', J(f0)): out[rt] = res; continue
            res['cafe'] = await play(pg, cdp, tag + '_cafe', 0, start_s=30)
            f1 = await pg.evaluate(FLAGS_JS); res['f1'] = f1
            if not R.check('FAIL_SETUP 檢查：[%s] cafeScene 演了（cafeView A、afternoonDone、companion 放開）' % tag, f1['cafeView'] == 'A' and f1['afternoonDone'] and not f1['companion'], J(f1)): out[rt] = res; continue
            await P.jump(pg, cdp, R, '2025-09-02', 18.0, 'gongguan', None, True, note='[%s] Café 之後、傍晚到公館' % tag); await P.events_on(pg)
        elif rt == 'B1':
            s = await mini(pg, '2025-09-02', 18.0, 'gongguan', {'metAn': True, 'met_an': True, 'AN_NAME_TOLD': True, 'anSkipped': True, 'afternoonDone': True})
            await P.init(pg); await dlg_mark(pg); await P.load(pg, cdp, s, True); await P.events_on(pg)
            R.setup('[%s]【前置／捷徑】最小存檔讀到 2025-09-02 18:00 公館，旗標＝選「今天有點累，改天。」那一刻（story3d.js meetAn：anSkipped、afternoonDone）' % tag)
        else:
            s = await mini(pg, '2025-09-04', 17.92, 'gongguan', {})
            await P.init(pg); await dlg_mark(pg); await P.load(pg, cdp, s, True); await P.events_on(pg)
            R.setup('[%s]【前置】最小存檔讀到 2025-09-04（週四）17:55 公館，沒遇到小安（metAn／anSkipped／afternoonDone 都沒有）；等遊戲的 S.tick 記 anMissed' % tag)
            for _ in range(30):
                if (await pg.evaluate(FLAGS_JS))['anMissed']: break
                await pg.wait_for_timeout(1000)
        fb = await pg.evaluate(FLAGS_JS); res['fb'] = fb
        want = {'A': fb['plan'] == 'cafe' and not fb['anSkipped'] and not fb['anMissed'], 'B1': fb['anSkipped'] and not fb['plan'], 'B2': fb['anMissed'] and not fb['plan'] and not fb['metAn']}[rt]
        if not R.check('FAIL_SETUP 檢查：[%s] 進店前旗標成立（%s）、阿哲那一場還沒演' % (tag, {'A': 'plan cafe', 'B1': 'anSkipped', 'B2': 'anMissed'}[rt]), want and not fb['zheNoodleDone'], J(fb)): out[rt] = res; continue
        c = await P.clock(pg)
        if c['h'] < 18.0: await P.wait_play(pg, cdp, 18.02, max_s=240, run=R, tag=tag + ' 等到 18:00（阿哲 18:00 起在店裡）')
        nd = await noodle(pg, cdp, tag); res['noodle'] = nd; res['f9'] = await pg.evaluate(FLAGS_JS)
        if nd:
            txt = text_of(nd); has_ask = ASK_ZHE in txt; has_opt = any('剛好同路' in o for o in sum(nd['opts'], [])); has_no = NO_SEE in txt
            R.note('[%s] 阿哲那一場：問下午去哪=%s、那組選項=%s、「下午沒看到你」=%s；之後 %s' % (tag, has_ask, has_opt, has_no, J(res['f9'])))
            R.check('[%s] 阿哲那一場演了（zheNoodleDone）' % tag, res['f9']['zheNoodleDone'], J(res['f9']))
            if rt == 'A': R.check('[%s] 有跟小安走：阿哲照原句問「%s」、有那組選項，沒有「下午沒看到你」' % (tag, ASK_ZHE), has_ask and has_opt and not has_no, J([has_ask, has_opt, has_no]))
            else: R.check('[%s] 沒跟小安走：阿哲說「%s」，沒有問下午去哪、沒有那組選項' % (tag, NO_SEE), has_no and not has_ask and not has_opt, J([has_no, has_ask, has_opt]))
        out[rt] = res
        open(os.path.join(OUT, 'aa355_358.json'), 'w', encoding='utf-8').write(J({'sha': SHA, 'NOODLE': out}))
        await pg.goto(URL); await L.wait_loaded(pg, 600)
    return out


async def an_slot(pg, key, zone=None):
    d = await P.day_of(pg, key)
    return await pg.evaluate(AN_SCAN, {'d0': d['d'], 'days': 21, 'h0': 9.0, 'h1': 21.0, 'zone': zone, 'not': ['library', 'library_hall', 'noodle'], 'ok': ['campus', 'classroom', 'linze', 'wancai', 'cafe', 'gongguan']})


async def talk_an(pg, cdp, tag, cid='heroine_01'):
    w = await P.wait_present(pg, cid, 25)
    if not R.check('FAIL_SETUP 檢查：[%s] 小安在場、看得到' % tag, bool(w) and not w.get('hidden'), J(w)): return None
    n0 = await P.say_hook(pg); m0 = await dlg_mark(pg)
    r = await P.talk_to(pg, cdp, R, cid, '[%s] 和小安說話（%s）' % (tag, cid), picks=('「妳寫得出來', '「妳寫得出來的。」'))
    said = await P.said(pg, n0); obs = await dlg_since(pg, m0)
    await pg.screenshot(path=os.path.join(OUT, '%s_after.png' % tag))
    R.note('[%s] 小安：GAME.say %s；observer %s；talk_to %s' % (tag, J(said), J([[x['who'], x['t']] for x in obs]), J(r)[:600]))
    return {'said': said, 'obs': obs, 'r': r, 'opts': (r or {}).get('opts') or [] if isinstance(r, dict) else []}


async def part_cafe(pg, cdp):
    out = {}
    for rt in (ROUTES or ['NOCAFE', 'A']):
        tag = 'CAFE_' + rt; res = {'route': rt}
        base = {'metAn': True, 'met_an': True, 'AN_NAME_TOLD': True, 'afternoonDone': True}
        base.update({'anSkipped': True} if rt == 'NOCAFE' else {'plan': 'cafe', 'cafeView': 'A', 'cafeHelp': True})
        s0 = await mini(pg, '2025-09-03', 9.0, 'dorm', base)
        if rt == 'A': s0['choices'] = {'cafeView': 'A'}
        await P.init(pg); await P.load(pg, cdp, s0, True)
        # CC-B 11-14（AA358_22_24_cafe 第一次跑 TEST_SETUP）：最小存檔只設旗標、沒走 meetAn——meetAn 會 SOCIAL.meet('heroine_01','campus')（story3d.js 3777 起），少了它作息裡的以安是「沒見過的女主角」，說話只有「她低頭在忙自己的事」
        mt = await pg.evaluate("(()=>{ try{ SOCIAL.meet('heroine_01','campus'); }catch(e){ return 'ERR '+e.message; } return {has:SOCIAL.has('heroine_01','FIRST_MET'), stage:SOCIAL.stage('heroine_01')}; })()")
        R.setup('[%s]【捷徑】補 meetAn 會做的 SOCIAL.meet(heroine_01, campus)：%s' % (tag, J(mt)))
        # ① anAfter 只在 talkAn（劇情的 an）裡（story3d.js 3864）；作息的 heroine_01 走 talkCharacter、不會說這句。劇情的 an：afternoonDone 以後 18:00～20:30 在椰影大道散步（story3d.js 294）
        sl = {'key': '2025-09-03', 'h': 18.5, 'zone': 'campus'}; res['slot1'] = sl; R.note('[%s] ① 劇情的小安（an）：%s 18:30 椰影大道散步' % (tag, sl['key']))
        await P.jump(pg, cdp, R, sl['key'], sl['h'], sl['zone'], None, True, note='[%s] ① 2-2 talkAn anAfter（第一次在下午那段之後跟她說話）' % tag); await P.events_on(pg)
        f0 = await pg.evaluate(FLAGS_JS); res['f0'] = f0
        if not R.check('FAIL_SETUP 檢查：[%s] ① afternoonDone、anAfter 還沒說過、cafeView=%s' % (tag, 'A' if rt == 'A' else '無'), f0['afternoonDone'] and not f0['anAfter'] and ((f0['cafeView'] == 'A' and f0['choicesCafeView'] == 'A') if rt == 'A' else (not f0['cafeView'] and not f0['choicesCafeView'])), J(f0)): out[rt] = res; continue
        t1 = await talk_an(pg, cdp, tag + '_22', 'an'); res['t22'] = t1
        if t1:
            tx = text_of(t1); f1 = await pg.evaluate(FLAGS_JS); res['f1'] = f1
            R.check('[%s] ① 那一句演了（anAfter 記上）' % tag, f1['anAfter'], J(f1))
            if rt == 'A': R.check('[%s] ① cafeView A：她提「不能賠十倍」' % tag, '賠十倍' in tx, tx[:300])
            else: R.check('[%s] ① 沒去咖啡廳：她不提「那天」、不說「賠十倍」' % tag, '賠十倍' not in tx and '那天' not in tx, tx[:300])
        # ② 2-4 ev_an_report_followup
        r2 = await pg.evaluate("""(()=>{ const G=GAME.G; G.events=G.events||{done:{},last:{},count:0}; G.events.done=G.events.done||{}; G.events.done.ev_an_report_split=G.day;
          const M=G.social&&G.social.mem&&G.social.mem.heroine_01; const n0=M?M.length:0; if(M) G.social.mem.heroine_01=M.filter(m=>m.tag!=='REPORT_PARTNER');
          return {split:G.events.done.ev_an_report_split, memBefore:n0, memAfter:(G.social.mem.heroine_01||[]).length, has:SOCIAL.has('heroine_01','REPORT_PARTNER')}; })()""")
        R.setup('[%s] ②【捷徑】ev_an_report_split 記成演過、拿掉 REPORT_PARTNER 記憶（新局在 meetAn 一定記＝照程式走不到這一場）：%s' % (tag, J(r2)))
        cur = await P.clock(pg); sl2 = await an_slot(pg, cur['key'], 'library'); res['slot2'] = sl2; R.note('[%s] ② 小安在總圖的時段 %s' % (tag, J(sl2)))
        if not R.check('FAIL_SETUP 檢查：[%s] ② 掃得到小安在總圖的時段' % tag, bool(sl2), ''): out[rt] = res; continue
        await P.jump(pg, cdp, R, sl2['key'], sl2['h'], 'library', None, True, note='[%s] ② 2-4 小安在總圖' % tag); await P.events_on(pg)
        f2 = await pg.evaluate(FLAGS_JS); res['f2'] = f2
        if not R.check('FAIL_SETUP 檢查：[%s] ② 在總圖、ev_an_report_split 演過、沒有 REPORT_PARTNER、followup 還沒演' % tag, f2['zone'] == 'library' and f2['split'] and not f2['reportPartner'] and not f2['followup'], J(f2)): out[rt] = res; continue
        t2 = await talk_an(pg, cdp, tag + '_24'); res['t24'] = t2; f3 = await pg.evaluate(FLAGS_JS); res['f3'] = f3
        if t2 and not f3['followup'] and '點了一下頭' in text_of(t2):   # CC-B 11-14：讀書區今天第一次遇到＝只點頭（D127 ③、libquiet3d.js LIBQ.gate），照設計；再說一次才輪到事件
            R.note('[%s] ② 第一次只點頭（D127 讀書區，照設計）→ 再找她說一次' % tag); res['t24_nod'] = t2
            t2 = await talk_an(pg, cdp, tag + '_24b'); res['t24'] = t2; f3 = await pg.evaluate(FLAGS_JS); res['f3'] = f3
        if t2:
            tx = text_of(t2); ops = sum(t2.get('opts') or [], []) if t2.get('opts') else []
            R.check('[%s] ② ev_an_report_followup 演了' % tag, f3['followup'], J(f3))
            if rt == 'A': R.check('[%s] ② cafeView A：有「不能讓人因為一個手誤賠十倍」' % tag, '一個手誤賠十倍' in tx, tx[:400])
            else:
                R.check('[%s] ② 沒去咖啡廳：有「（小聲）你先看。哪裡不通直接講。」' % tag, '你先看。哪裡不通直接講。' in tx, tx[:400])
                R.check('[%s] ② 沒去咖啡廳：不提「那天」、不說「賠十倍」' % tag, '那天' not in tx and '賠十倍' not in tx, tx[:400])
                R.note('[%s] ② 選項 %s（要「「妳寫得出來的。」」「「改天請妳喝咖啡。」」）' % (tag, J(ops)))
                R.check('[%s] ② 沒去咖啡廳：選項是「妳寫得出來的。」／「改天請妳喝咖啡。」' % tag, any('妳寫得出來的。' in o for o in ops) and any('改天請妳喝咖啡' in o for o in ops), J(ops))
        out[rt] = res
        open(os.path.join(OUT, 'aa355_358_cafe.json'), 'w', encoding='utf-8').write(J({'sha': SHA, 'CAFE': out}))
        await pg.goto(URL); await L.wait_loaded(pg, 600)
    return out


async def part_jp(pg, cdp):
    out = {}
    for rt in (ROUTES or ['CTRL', 'EX', 'PAUSED', 'FAC']):
        tag = 'JP_' + rt; res = {'route': rt}
        dep = await P.day_of(pg, '2028-03-25')
        fl = {'EXCHANGE_ROUTE': 'JP', 'JP_DEPARTED': dep['d'], 'AN_JP_DEPARTED': dep['d'], 'met_an': True, 'metAn': True, 'AN_NAME_TOLD': True, 'afternoonDone': True, 'dating_heroine_01': False}
        st = {'EX': 'ex', 'PAUSED': 'paused', 'FAC': 'friend_after_catch'}.get(rt)
        if st: fl['romance'] = {'heroine_01': {'status': st}}
        s = await mini(pg, '2028-06-09', 20.75, 'jp_room', fl)
        await P.init(pg); await P.load(pg, cdp, s, True)
        m = await pg.evaluate("""(()=>{ try{ SOCIAL.meet('heroine_01',GAME.G.zone); SOCIAL.adjust('heroine_01',{fam:45,trust:32,comf:30,seen:20,talked:20}); }catch(e){ return 'ERR '+e.message; } return SOCIAL.stage('heroine_01'); })()""")
        R.setup('[%s]【前置／捷徑】最小存檔讀到 2028-06-09 20:45 jp_room：日本路線已出發（EXCHANGE_ROUTE JP、JP_DEPARTED 3/25）、認識以安、【捷徑】關係加到 %s%s' % (tag, m, ('、romance.heroine_01.status=' + st) if st else '、沒有 romance 那一筆'))
        f0 = await pg.evaluate(FLAGS_JS); ij = await pg.evaluate("(()=>{ try{ return {inJapan:JP.inJapan(GAME.G), sent:PHONE.sent(GAME.G,'jp_g7_dinner_ask')}; }catch(e){ return 'ERR '+e.message; } })()")
        res['f0'] = f0; res['jp0'] = ij
        # CC-B 11-14（AA355_4c_jp 第一次跑）：遊戲讀檔會自己補一筆 status 'none'、history 空的 romance＝沒交往過，不是有 romance
        if not R.check('FAIL_SETUP 檢查：[%s] 人在日本（JP.inJapan）、FRIEND 以上、還沒收到那則、romance=%s' % (tag, st or '無'), isinstance(ij, dict) and ij['inJapan'] and not ij['sent'] and m in ('FRIEND', 'CLOSE_FRIEND', 'POSSIBLE_ROMANTIC_INTEREST', 'ROMANTIC_TENSION') and ((f0['rom'] or {}).get('status') == st if st else (not f0['rom'] or (f0['rom'].get('status') in (None, 'none') and not f0['rom'].get('history')))), J([f0, ij, m])): out[rt] = res; continue
        t0 = time.time()
        while time.time() - t0 < 300:
            h = await pg.evaluate("+GAME.G.hour")
            if h >= 21.1: break
            s2 = await D.st(pg)
            if s2['choices']: await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); if(b[0]) b[0].click(); })()")
            elif s2['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(1500)
        await pg.wait_for_timeout(3000)
        h = await pg.evaluate("+GAME.G.hour")
        if not R.check('FAIL_SETUP 檢查：[%s] 遊戲時間過了 21:06（現在 %.2f）' % (tag, h), h >= 21.1, ''): out[rt] = res; continue
        got = await pg.evaluate("""(()=>{ const G=GAME.G; const ms=(G.msgs||[]).filter(m=>m.th==='p:heroine_01').map(m=>({text:String(m.text||''), h:m.h, day:m.day, ask:m.ask?(m.ask.id||null):null}));
          return {sent:PHONE.sent(G,'jp_g7_dinner_ask'), msgs:ms.slice(-6)}; })()""")
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000); await pg.screenshot(path=os.path.join(OUT, '%s_phone.png' % tag)); await L.close_panels(pg, cdp)
        res['got'] = got; res['f1'] = await pg.evaluate(FLAGS_JS)
        R.note('[%s] 21:06 以後：PHONE.sent jp_g7_dinner_ask=%s；以安那一串最後幾則 %s；FLIGHT／SAME 旗標 %s' % (tag, got['sent'], J(got['msgs']), J(res['f1']['flightKeys'])))
        has = got['sent'] or any('週六晚上有空嗎' in x['text'] for x in got['msgs'])
        if rt == 'CTRL': R.check('[%s] 對照（FRIEND 以上、關係正常）：收到 jp_g7_dinner_ask「週六晚上有空嗎。」' % tag, has, J(got))
        else: R.check('[%s] %s：不能收到 jp_g7_dinner_ask' % (tag, st), not has, J(got))
        out[rt] = res
        open(os.path.join(OUT, 'aa355_358_jp.json'), 'w', encoding='utf-8').write(J({'sha': SHA, 'JP': out}))
        await pg.goto(URL); await L.wait_loaded(pg, 600)
    return out


APPLY = r"""(async(s)=>{ document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; await GAME.applySave(s); return {day:GAME.G.day, zone:GAME.G.zone}; })"""
CLS_JS = r"""(()=>{ const G=GAME.G; let lab=null, line=null, its=[], rec=null; try{ lab=CLS.dayLabel(G); }catch(e){ lab='ERR '+e.message; } try{ line=CLS.todayLine(G); }catch(e){ line='ERR '+e.message; }
  try{ its=(CLS.dayItems(G)||[]).map(it=>({key:it.key||null, t0:it.t0, name:(it.c&&it.c.name)||''})); }catch(e){ its='ERR '+e.message; }
  try{ const r=CLS.rec(G); rec={done:Object.keys(r.done||{}).length, attend:JSON.parse(JSON.stringify(r.attend||{}))}; }catch(e){ rec='ERR '+e.message; }
  return {key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(2), zone:G.zone, label:lab, todayLine:line, items:its, hol:CALENDAR.holiday(G.day)||null, mark:CALENDAR.mark?CALENDAR.mark(G.day):null, rec}; })()"""


async def lib_talks(pg, cdp, tag, n=3):
    """總圖找以安：最多說 n 次（讀書區第一次只點頭；anMissed 的第一次是自我介紹）；followup 演了就停"""
    talks = []
    for k in range(n):
        t = await talk_an(pg, cdp, '%s_t%d' % (tag, k + 1)); f = await pg.evaluate(FLAGS_JS)
        talks.append({'t': t, 'f': f})
        if not t or f['followup']: break
    return talks


async def part_natural(pg, cdp):
    """BB_462「條件改好以後的重跑規格」AA358_24_natural：不用 split／記憶捷徑，照第二天的玩法自然記 REPORT_PARTNER（或不記）"""
    out = {}
    for rt in (ROUTES or ['A', 'B', 'C']):
        tag = 'NAT_' + rt; res = {'route': rt}
        if rt in ('A', 'B'):
            s = await mini(pg, '2025-09-02', 15.4, 'campus', {})
            await P.init(pg); await dlg_mark(pg); await P.load(pg, cdp, s, True); await P.events_on(pg)
            R.setup('[%s]【前置】最小存檔讀到 2025-09-02（mainDay 2）15:24 校園（classDone＝上過民法總則）；等遊戲的 S.tick 演 meetAn（小安追上來）' % tag)
            f0 = await pg.evaluate(FLAGS_JS); res['f0'] = f0
            if not R.check('FAIL_SETUP 檢查：[%s] mainDay 2、在校園、還沒認識小安（met_an；電腦快，metAn 可能已經記上＝她正在追上來）、沒有 REPORT_PARTNER' % tag, f0['mainDay'] == 2 and f0['zone'] == 'campus' and not f0['met_an'] and not f0['reportPartner'], J(f0)): out[rt] = res; continue
            m = await play(pg, cdp, tag + '_meet', 0, start_s=60, prefer=(('好啊，去咖啡廳',) if rt == 'A' else ('今天有點累',)))
            f1 = await pg.evaluate(FLAGS_JS); res['meet'] = m; res['f1'] = f1
            R.note('[%s] meetAn 之後 %s' % (tag, J(f1)))
            if not R.check('FAIL_SETUP 檢查：[%s] meetAn 演了、遊戲自己記了 REPORT_PARTNER（%s）' % (tag, '選去咖啡廳' if rt == 'A' else '選今天有點累'), f1['metAn'] and f1['reportPartner'] and ((f1['plan'] == 'cafe') if rt == 'A' else f1['anSkipped']), J(f1)): out[rt] = res; continue
            if rt == 'A':
                await P.jump(pg, cdp, R, '2025-09-02', 15.75, 'cafe', None, True, note='[%s] 跟小安走到溫州街的 Café（只省走路）' % tag); await P.events_on(pg)
                res['cafe'] = await play(pg, cdp, tag + '_cafe', 0, start_s=30)
                f2 = await pg.evaluate(FLAGS_JS); res['f2'] = f2
                if not R.check('FAIL_SETUP 檢查：[%s] cafeScene 演了（cafeView A）' % tag, f2['cafeView'] == 'A' and f2['afternoonDone'], J(f2)): out[rt] = res; continue
        else:
            s = await mini(pg, '2025-09-03', 8.5, 'dorm', {})
            await P.init(pg); await dlg_mark(pg); await P.load(pg, cdp, s, True); await P.events_on(pg)
            R.setup('[%s]【前置】最小存檔讀到 2025-09-03（mainDay 3）08:30 宿舍，第二天沒遇到小安；等 S.tick 記 anMissed' % tag)
            for _ in range(20):
                if (await pg.evaluate(FLAGS_JS))['anMissed']: break
                await pg.wait_for_timeout(1000)
            f1 = await pg.evaluate(FLAGS_JS); res['f1'] = f1
            if not R.check('FAIL_SETUP 檢查：[%s] anMissed、沒有 REPORT_PARTNER、split 沒演' % tag, f1['anMissed'] and not f1['reportPartner'] and not f1['split'], J(f1)): out[rt] = res; continue
        cur = await P.clock(pg); key = cur['key'] if cur['key'] > '2025-09-02' else '2025-09-03'
        sl = await an_slot(pg, key, 'library'); res['slot'] = sl; R.note('[%s] 小安在總圖的時段 %s' % (tag, J(sl)))
        if not R.check('FAIL_SETUP 檢查：[%s] 掃得到小安在總圖的時段' % tag, bool(sl), ''): out[rt] = res; continue
        await P.jump(pg, cdp, R, sl['key'], sl['h'], 'library', None, True, note='[%s] 小安在總圖' % tag); await P.events_on(pg)
        f3 = await pg.evaluate(FLAGS_JS); res['f3'] = f3
        if not R.check('FAIL_SETUP 檢查：[%s] 在總圖、followup 還沒演、REPORT_PARTNER=%s' % (tag, rt != 'C'), f3['zone'] == 'library' and not f3['followup'] and bool(f3['reportPartner']) == (rt != 'C'), J(f3)): out[rt] = res; continue
        talks = await lib_talks(pg, cdp, tag, 3); res['talks'] = talks
        f4 = talks[-1]['f'] if talks else await pg.evaluate(FLAGS_JS); res['f4'] = f4
        tx = ' '.join(text_of(x['t']) for x in talks if x['t']); ops = sum([sum(x['t'].get('opts') or [], []) for x in talks if x['t']], [])
        R.note('[%s] 總圖說了 %d 次；全文 %s；選項 %s；REPORT_PARTNER=%s cafeView=%s followup=%s' % (tag, len(talks), tx[:600], J(ops), f4['reportPartner'], f4['cafeView'], f4['followup']))
        if rt == 'C':
            R.check('[%s] 沒當報告搭檔：followup 不演（evDone 沒有）' % tag, not f4['followup'], J(f4))
        else:
            R.check('[%s] 有報告搭檔：followup 演了（進 evDone）' % tag, f4['followup'], J(f4))
            if rt == 'A': R.check('[%s] cafeView A：有「不能讓人因為一個手誤賠十倍」' % tag, '一個手誤賠十倍' in tx, tx[:400])
            else:
                R.check('[%s] 拒絕咖啡廳：有「（小聲）你先看。哪裡不通直接講。」、不提「那天」「賠十倍」' % tag, '你先看。哪裡不通直接講。' in tx and '那天' not in tx and '賠十倍' not in tx, tx[:400])
                R.check('[%s] 拒絕咖啡廳：選項是「妳寫得出來的。」／「改天請妳喝咖啡。」' % tag, any('妳寫得出來的。' in o for o in ops) and any('改天請妳喝咖啡' in o for o in ops), J(ops))
        out[rt] = res
        open(os.path.join(OUT, 'aa358_natural.json'), 'w', encoding='utf-8').write(J({'sha': SHA, 'NATURAL': out}))
        await pg.goto(URL); await L.wait_loaded(pg, 600)
    return out


async def onetap_cls(pg, cdp):
    await L.close_panels(pg, cdp); await pg.wait_for_timeout(500)   # CC-B 11-14（AA355_6_sports 第一次跑：goPop 是空的）：前一步讀手機首頁字、手機還開著，點 #btnGo 點到手機上；先關面板
    await L.tap(pg, cdp, '#btnGo'); await pg.wait_for_timeout(900)
    dg = await pg.evaluate("""(()=>{ const b=document.getElementById('btnGo'), pop=document.getElementById('goPop'); if(!b) return {btn:null}; const r=b.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2, top=document.elementFromPoint(cx,cy);
      const vis=e=>{ for(let x=e;x&&x!==document.body;x=x.parentElement){ const cs=getComputedStyle(x); if(cs.display==='none'||cs.visibility==='hidden') return false; } return true; };
      return {rect:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)], btnVisible:vis(b), top:top?(top.id||top.className||top.tagName):null, topIsBtn:!!top&&(top===b||b.contains(top)), popHide:pop?pop.classList.contains('hide'):null, popN:pop?pop.children.length:null, bound:!!b._bound, busy:!!(GAME.busy||GAME.D&&GAME.D.active)}; })()""")
    R.note('一鍵按鈕診斷：%s' % J(dg))
    if dg.get('popN') == 0:   # CC-B 11-14（AA355_6_sports r2：關了手機一樣是空的）：點了沒打開——記下按鈕位置上蓋著什麼，再【捷徑】用 ONETAP.openPop 打開（之後點「到下一堂課」照玩家點）
        R.setup('【捷徑】點 #btnGo 沒打開一鍵選單（按鈕位置最上面是 %s），改呼叫 ONETAP.openPop(GAME)' % dg.get('top'))
        await pg.evaluate("(()=>{ try{ ONETAP.openPop(GAME); }catch(e){} })()"); await pg.wait_for_timeout(700)
    ok = await pg.evaluate("""(()=>{ const pop=document.getElementById('goPop'); if(!pop) return 'no-pop'; const e=pop.querySelector('[data-gok="cls"]'); if(!e) return 'none: '+(pop.textContent||'').slice(0,200);
      const t=(e.textContent||'').trim(); if(e.classList.contains('dim')){ e.click(); return 'dim: '+t; } e.click(); return 'ok: '+t; })()""")
    if ok.startswith('ok'): await pg.wait_for_timeout(700); ok += '｜確定=%s' % await L.tap(pg, cdp, '#goCfYes'); await pg.wait_for_timeout(1500)   # onetap3d.js 防誤觸確認框
    return ok


async def part_sports(pg, cdp):
    out = {}
    sv0 = json.load(open(fix_path(FIX), encoding='utf-8')); sv0 = sv0.get('G', sv0)
    for rt in (ROUTES or ['Y2', 'Y1']):
        tag = 'SPORTS_' + rt; key = '2026-11-20' if rt == 'Y2' else '2025-11-21'; res = {'route': rt, 'key': key}
        sv = json.loads(json.dumps(sv0)); d = await P.day_of(pg, key); ry2 = await P.day_of(pg, '2026-09-06')
        sv.update({'day': d['d'], 'weekday': d['wd'], 'hour': 8.0, 'zone': 'dorm', 'weather': 'clear'}); sv.pop('pos', None)
        if rt == 'Y2': sv.setdefault('flags', {}).setdefault('ROOM_Y2', ry2['d'])
        await pg.evaluate(APPLY, sv); await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)
        R.setup('[%s]【前置】使用者存檔（%s）讀到 %s 08:00 宿舍%s' % (tag, FIX, key, '（ROOM_Y2＝2026-09-06，不補演搬房間）' if rt == 'Y2' else ''))
        c0 = await pg.evaluate(CLS_JS); res['c0'] = c0; R.note('[%s] 課表：%s' % (tag, J(c0)))
        if not R.check('FAIL_SETUP 檢查：[%s] 日期是 %s' % (tag, key), c0['key'] == key, J(c0)): out[rt] = res; continue
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200); await L.tap(pg, cdp, '#phoneTabs button[data-ptab="today"]'); await pg.wait_for_timeout(1000)   # 手機「今天」頁（classes3d.js todayHTML 第一行＝dayLabel）
        ph = await pg.evaluate("(()=>(document.getElementById('phoneBody')||{}).innerText||'')()"); await pg.screenshot(path=os.path.join(OUT, '%s_phone.png' % tag)); await L.close_panels(pg, cdp)
        res['phone'] = ph[:1200]; R.note('[%s] 手機首頁字：%s' % (tag, J(ph[:500])))
        if rt == 'Y2':
            R.check('[%s] 手機「今天」那一行有「全校運動會」（CLS.dayLabel %s）' % (tag, c0['label']), '全校運動會' in (c0['label'] or '') and '全校運動會' in ph, J([c0['label'], ph[:200]]))
            R.check('[%s] 照常上課：今天有課（CLS.dayItems）、不是假日' % tag, isinstance(c0['items'], list) and len(c0['items']) > 0 and not c0['hol'], J(c0['items']))
            if isinstance(c0['items'], list) and c0['items']:
                ok = await onetap_cls(pg, cdp); R.note('[%s] 一鍵「到下一堂課」：%s' % (tag, ok))
                t0 = time.time()
                while time.time() - t0 < 360:
                    s = await D.st(pg)
                    if s['choices']: await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); if(b[0]) b[0].click(); })()"); await pg.wait_for_timeout(700); continue
                    if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
                    c1 = await pg.evaluate(CLS_JS)
                    if isinstance(c1['rec'], dict) and isinstance(c0['rec'], dict) and c1['rec']['done'] > c0['rec']['done']: break
                    await pg.wait_for_timeout(1500)
                c1 = await pg.evaluate(CLS_JS); res['c1'] = c1; await pg.screenshot(path=os.path.join(OUT, '%s_after_class.png' % tag))
                R.note('[%s] 上課以後：%s' % (tag, J(c1)))
                R.check('[%s] 上得了課（CLS.rec done 多了）' % tag, isinstance(c1['rec'], dict) and isinstance(c0['rec'], dict) and c1['rec']['done'] > c0['rec']['done'], J([c0['rec'], c1['rec']]))
        else:
            R.check('[%s] 對照：那一行是「運動會（停課）」' % tag, '運動會（停課）' in (c0['label'] or '') and '運動會（停課）' in ph, J([c0['label'], ph[:200]]))
            R.check('[%s] 對照：停課＝今天沒有課' % tag, isinstance(c0['items'], list) and len(c0['items']) == 0, J(c0['items']))
        out[rt] = res
        open(os.path.join(OUT, 'aa355_358_sports.json'), 'w', encoding='utf-8').write(J({'sha': SHA, 'SPORTS': out}))
    return out


async def main():
    print('CC BB-TEST-AA355-358：SHA %s；PARTS %s；ROUTES %s；Playwright ≠ iPhone' % (SHA or '?', PARTS, ROUTES or '全部'), flush=True)
    res = {'sha': SHA}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(1)
        for part, fn in (('NOODLE', part_noodle), ('CAFE', part_cafe), ('NATURAL', part_natural), ('JP', part_jp), ('SPORTS', part_sports)):
            if part not in PARTS: continue
            try: res[part] = await fn(pg, cdp)
            except Exception as e:
                R.check('[%s] 沒有中斷' % part, False, repr(e)[:300]); await pg.screenshot(path=os.path.join(OUT, 'crash_%s.png' % part))
            open(os.path.join(OUT, 'aa355_358_all.json'), 'w', encoding='utf-8').write(J(res))
            await pg.goto(URL); await L.wait_loaded(pg, 600)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
