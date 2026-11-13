"""CC-C 11-14：BB_403 W1～W3（BB-TEST-AA355-358-1021：可以錯過的事不被說成發生過）。判定歸 BB；這支只照玩家走、記字、截圖。
  W1 開學第二天（STORY.mainDay＝2）下課後走出霖澤館（B3.CAMPUS_DOOR）6 m 以外 → 小安追上來（story3d.js meetAn：分組＋LINE＋「Café／總圖／不去」）
     FOLLOW：選第 1 個（Café，F.plan cafe）→ 手機「地點」快速前往 Café（同行的小安照 spawnCompanion 跟來）→ cafeScene（選項都選第 1 個＝cafeView A）
              → 手機快速前往公館 → 照玩家按「進入公館燒臘」→ 走到阿哲旁邊的座位（eat==='noodle'）按 → 點餐 → 阿哲那一場：要有「下午去哪」＋兩個選項
     REFUSE：選第 3 個（不去，anSkipped）→【前置】同一份進度跳到同一天 18:00 公館 → 進燒臘店坐阿哲旁邊 → 要是「下午沒看到你，我還以為你先回宿舍了。」、沒有那組選項
  W2 隔天（mainDay 3）12:30 起在校園／教室／總圖找小安說話（talkAn 的 anAfter 那一句）：FOLLOW 要「不能賠十倍」那句一類（cafeView A）；REFUSE 要第一週版「民總的筆記我整理好了…」
  W3 ev_an_report_followup：只記 prereq 每一條（afternoonDone、ev_an_report_split、REPORT_PARTNER 記憶）和 G.events.done——新局在 meetAn 一定記 REPORT_PARTNER，照程式這一場新局走不到，交 BB 看
【前置】最小存檔（同 cc_vacgap_probe；但 metAn／afternoonDone 拿掉、MAIN_D1＝2025-09-01）讀到 2025-09-02 15:25 校園霖澤館門口、classDone＝true classAnswer＝good（＝民法總則上完、答得好；條件事件照開）。
CC_02 清單 2026-11-14：1✓（mainDay 2 用 STORY.mainDay 驗；門口座標讀 B3.CAMPUS_DOOR；15:25 過了 15.3 的觸發時間） 2✓（事件、旗標、互動點從程式讀：eat==='noodle'、heroine_01／zhe） 3✓（座位挑離阿哲最近、2.5 m 以內那張） 4✓（按之前確認互動鍵的字） 5✓（走到門口 6 m 外、店門、座位都用站得住的點＋go_to／use_exit） 6✓（meetAn、cafeScene 等開演最多 90 秒） 7✓（lint、node 驗 JS） 8n/a（判定歸 BB） 9✓（遊戲畫面原樣截圖） 10✓（中途對話照字點完並記下來） 11✓（SHA 40 碼、ENV 沒有「|」） 12✓（FAIL_SETUP 檢查：mainDay 2、小安追上來、選了該選的、到了 Café／燒臘店、阿哲在旁邊） 13✓（走路用 go_to 分段、進門用 use_exit）
用法：LW_TESTS=<wt>/tests SHA=<sha> [CASES=FOLLOW,REFUSE] python3 cc_bb403_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import bbplay as P
import cc_d141_lib as D
import cc_phone
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
CASES = [c for c in (os.environ.get('CASES') or 'FOLLOW,REFUSE').split(',') if c]
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('bb403', OUT); D.setup(R, OUT)
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'classAnswer': 'good', 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True,
         'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True, 'MET_ZHE': True, 'fundsV2': 1, 'KX_DEC3_MIGRATED': True,
         'dating_kexin': False, 'DORM_FOUR': True, 'MET_KAI': True}   # metAn／met_an／afternoonDone／zheNoodleDone 不給（要照玩家演）
FLAGS_JS = r"""(()=>{ const G=GAME.G, F=G.flags||{}; let rp=null; try{ rp=SOCIAL.has('heroine_01','REPORT_PARTNER'); }catch(e){}
  return {key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(2), zone:G.zone, mainDay:STORY.mainDay?STORY.mainDay(G):null, metAn:!!F.metAn, anSkipped:!!F.anSkipped, anMissed:!!F.anMissed,
    afternoonDone:!!F.afternoonDone, plan:F.plan||null, companion:F.companion||null, cafeView:F.cafeView||null, zheNoodleDone:!!F.zheNoodleDone, anAfter:!!F.anAfter, reportPartner:rp,
    split:!!(G.events&&G.events.done&&G.events.done.ev_an_report_split), followup:!!(G.events&&G.events.done&&G.events.done.ev_an_report_followup)}; })()"""
AWAY_JS = r"""(()=>{ const E=GAME.E, DR=(typeof B3!=='undefined'&&B3.CAMPUS_DOOR)||{x:34,z:-100}, P=E.player.obj.position; let best=null;
  for(let r=7;r<=10;r+=0.5) for(let a=0;a<360;a+=15){ const x=DR.x+r*Math.cos(a*Math.PI/180), z=DR.z+r*Math.sin(a*Math.PI/180); if(!E.canStand(x,z,0.35,0)) continue; const d=Math.hypot(x-P.x,z-P.z); if(!best||d<best.d) best={x:+x.toFixed(2),z:+z.toFixed(2),d:+d.toFixed(2)}; }
  return {door:DR, to:best}; })()"""
SEAT_JS = r"""(()=>{ const E=GAME.E, z=GAME.npc&&GAME.npc.zhe; const its=E.interactables.filter(i=>i&&i.eat==='noodle'&&!i.hidden); if(!its.length) return {n:0};
  const zp=z&&z.obj?z.obj.position:null; its.sort((a,b)=>zp?Math.hypot(a.x-zp.x,a.z-zp.z)-Math.hypot(b.x-zp.x,b.z-zp.z):0);
  const it=its[0]; return {n:its.length, zhe:zp?[+zp.x.toFixed(2),+zp.z.toFixed(2)]:null, zheSeat:!!(z&&z.seat), it:{x:+it.x.toFixed(2),z:+it.z.toFixed(2),r:it.radius||1,lv:it.lv|0,label:it.label||''}, dZhe:zp?+Math.hypot(it.x-zp.x,it.z-zp.z).toFixed(2):null}; })()"""


async def flags(pg):
    return await pg.evaluate(FLAGS_JS)


async def play(pg, cdp, tag, alt=0, start_s=90, max_s=300):
    """等對話開始 → 每一句截圖 → 選項第 alt 個 → 到結束（同 cc_vacgap_probe.play）"""
    n0 = await P.say_hook(pg); t0 = time.time(); seen = []; opts = []; picked = []; k = 0; started = False; idle = None
    while time.time() - t0 < start_s + max_s:
        s = await P.ts(pg)
        if s['txt'] and (not seen or seen[-1] != [s['name'], s['txt']]):
            seen.append([s['name'], s['txt']])
            if len(seen) <= 50: await pg.wait_for_timeout(350); k += 1; await pg.screenshot(path=os.path.join(OUT, '%s_%02d.png' % (tag, k)))
        if s['ch']:
            started = True; idle = None; o = s['ch']; opts.append([x['t'] for x in o]); i = min(alt, len(o) - 1)
            picked.append(o[i]['t']); k += 1; await pg.screenshot(path=os.path.join(OUT, '%s_%02d_choice.png' % (tag, k)))
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
    said = await P.said(pg, n0)
    r = {'started': started, 'lines': P.clean(seen), 'said': said, 'opts': opts, 'picked': picked}
    R.note('[%s] 對話：選項 %s；選了 %s；GAME.say %s' % (tag, J(opts), J(picked), J(said)))
    return r


async def travel(pg, cdp, tag, zone):
    await P.phone_tab(pg, cdp, 'places'); await cc_phone.reveal(pg, cdp, zone)
    c = await pg.evaluate("(z=>{ const e=[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(z+'|')||b.dataset.place===z); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })", zone)
    await pg.screenshot(path=os.path.join(OUT, '%s_places_%s.png' % (tag, zone)))
    if not c: await L.close_panels(pg, cdp); R.note('[%s] 手機「地點」沒有 %s' % (tag, zone)); return False
    await L.touch_tap(cdp, c[0], c[1])
    for _ in range(120):
        await pg.wait_for_timeout(500); q = await D.st(pg)
        if q['zone'] == zone or q['dlg'] or q['choices']: break
    return True


async def noodle(pg, cdp, tag):
    """公館 → 進燒臘店 → 阿哲旁邊的座位 → 按 → play"""
    s = await D.st(pg)
    if s['zone'] != 'noodle':
        s = await D.use_exit(pg, cdp, tag + ' 進店', '進入公館燒臘', 'noodle')
    if not R.check('FAIL_SETUP 檢查：[%s] 照玩家進了燒臘店' % tag, bool(s) and s['zone'] == 'noodle', J(s)): return None
    await pg.wait_for_timeout(2500); st = await pg.evaluate(SEAT_JS); R.note('[%s] 座位／阿哲 %s' % (tag, J(st)))
    await pg.screenshot(path=os.path.join(OUT, '%s_noodle_in.png' % tag))
    if not R.check('FAIL_SETUP 檢查：[%s] 阿哲在店裡、旁邊 2.5 m 內有座位' % tag, bool(st.get('zhe')) and st.get('dZhe') is not None and st['dZhe'] < 2.5, J(st)): return None
    it = st['it']; tgt = await D.standable_near(pg, it['x'], it['z'], it['r'] * 0.6, it['lv'])
    await L.go_to(pg, cdp, R, (tgt or it)['x'], (tgt or it)['z'], 0.3, '[%s] 阿哲旁邊的座位' % tag, max_s=60, lv=it['lv'])
    q = await D.settle(pg)
    if not R.check('FAIL_SETUP 檢查：[%s] 互動鍵是那張座位「%s」' % (tag, it['label']), q['interact'].startswith(it['label'][:2]) if it['label'] else bool(q['interact']), J(q)): return None
    await L.tap(pg, cdp, '#interact')
    return await play(pg, cdp, tag + '_noodle', 0, start_s=20)


async def find_an(pg, cdp, tag):
    for z in ('campus', 'classroom', 'library', 'linze'):
        await P.jump(pg, cdp, R, (await P.clock(pg))['key'], (await P.clock(pg))['h'], z, None, True, note='找小安：%s' % z); await P.events_on(pg)
        w = await P.wait_present(pg, 'heroine_01', 20)
        R.note('[%s] %s 的小安：%s' % (tag, z, J(w)))
        if w and not w['hidden']: return z
    return None


async def case(pg, cdp, tag):
    refuse = tag == 'REFUSE'; out = {'case': tag}
    d1 = await P.day_of(pg, '2025-09-01'); d = await P.day_of(pg, '2025-09-02')
    s = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'outings': [], 'flags': dict(BASEF, MAIN_D1=d1['d'])}
    s.update(day=d['d'], weekday=d['wd'], hour=15 + 25 / 60, zone='campus', pos=None, weather='clear', stage='law', money=30000)
    await P.init(pg); await P.load(pg, cdp, s, True)
    door = await pg.evaluate("(()=>{ const DR=(typeof B3!=='undefined'&&B3.CAMPUS_DOOR)||{x:34,z:-100}; return DR; })()")
    s['pos'] = {'x': door['x'], 'z': door['z'], 'yaw': door.get('yaw', 0), 'lv': 0}
    await P.load(pg, cdp, s, True); await P.events_on(pg)
    R.setup('[%s] 最小存檔讀到 2025-09-02 15:25 校園霖澤館門口 %s（MAIN_D1＝9/1、classDone good；條件事件照開）' % (tag, J(door)))
    f0 = await flags(pg); out['f0'] = f0
    if not R.check('FAIL_SETUP 檢查：[%s] mainDay 2、還沒遇到小安' % tag, f0['mainDay'] == 2 and not f0['metAn'] and not f0['afternoonDone'], J(f0)): return out
    aw = await pg.evaluate(AWAY_JS); R.note('[%s] 門口 %s；走到 %s' % (tag, J(aw['door']), J(aw['to'])))
    if aw['to']: await L.go_to(pg, cdp, R, aw['to']['x'], aw['to']['z'], 0.6, '[%s] 走出霖澤館 7 m 外' % tag, max_s=60, lv=0)
    meet = await play(pg, cdp, tag + '_W1_meet', 2 if refuse else 0, start_s=60); out['meet'] = meet
    f1 = await flags(pg); out['f1'] = f1; R.note('[%s] 小安那一段之後 %s' % (tag, J(f1)))
    if not R.check('FAIL_SETUP 檢查：[%s] 小安追上來（metAn）、選了%s' % (tag, '不去' if refuse else 'Café'), f1['metAn'] and (f1['anSkipped'] if refuse else f1['plan'] == 'cafe'), J(f1)): return out
    if not refuse:
        await travel(pg, cdp, tag + '_cafe', 'cafe')
        cafe = await play(pg, cdp, tag + '_cafe', 0, start_s=90); out['cafe'] = cafe
        f2 = await flags(pg); out['f2'] = f2; R.note('[%s] Café 之後 %s' % (tag, J(f2)))
        R.check('FAIL_SETUP 檢查：[%s] Café 那一場演了、cafeView A' % tag, f2['cafeView'] == 'A' and f2['afternoonDone'], J(f2))
        await travel(pg, cdp, tag + '_gg', 'gongguan')
        c = await P.clock(pg)
        if c['h'] < 17.9: await P.wait_play(pg, cdp, 18.0, max_s=240, run=R, tag=tag + ' 等到傍晚')
    else:
        await P.jump(pg, cdp, R, '2025-09-02', 18.0, 'gongguan', None, True, note='[%s] 拒絕小安以後、傍晚到公館' % tag); await P.events_on(pg)
    nd = await noodle(pg, cdp, tag + '_W1'); out['noodle'] = nd
    if nd:
        txt = ' '.join(t for _, t in nd['said']) + ' ' + ' '.join(sum(nd['opts'], []))
        R.note('[%s] W1 阿哲那一場：有「下午沒看到你」=%s；選項 %s' % (tag, '下午沒看到你' in txt, J(nd['opts'])))
    f3 = await flags(pg); out['f3'] = f3
    # W2 隔天找小安說話
    await P.jump(pg, cdp, R, '2025-09-03', 12.5, 'campus', None, True, note='[%s] W2 隔天 12:30' % tag); await P.events_on(pg)
    z = await find_an(pg, cdp, tag)
    if R.check('FAIL_SETUP 檢查：[%s] W2 隔天找得到小安' % tag, bool(z), str(z)):
        n0 = await P.say_hook(pg); r2 = await P.talk_to(pg, cdp, R, 'heroine_01', '[%s] W2 和小安說話' % tag); said = await P.said(pg, n0)
        await pg.screenshot(path=os.path.join(OUT, '%s_W2_after.png' % tag)); out['w2'] = {'zone': z, 'r': r2, 'said': said}
        R.note('[%s] W2 小安說：%s' % (tag, J(said)))
    out['w3'] = await flags(pg)
    R.note('[%s] W3 ev_an_report_followup prereq：afternoonDone=%s、ev_an_report_split=%s、REPORT_PARTNER=%s（notMemory 要 false 才演）、followup 演過=%s' % (tag, out['w3']['afternoonDone'], out['w3']['split'], out['w3']['reportPartner'], out['w3']['followup']))
    return out


async def main():
    print('CC BB_403 W1～W3：SHA %s；CASES %s；Playwright ≠ iPhone' % (SHA or '?', CASES), flush=True)
    res = {'sha': SHA, 'cases': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(1)
        for c in CASES:
            try: res['cases'].append(await case(pg, cdp, c))
            except Exception as e:
                R.check('[%s] 沒有中斷' % c, False, repr(e)[:300]); await pg.screenshot(path=os.path.join(OUT, 'crash_%s.png' % c))
            open(os.path.join(OUT, 'bb403.json'), 'w', encoding='utf-8').write(J(res))
            await pg.goto(URL); await L.wait_loaded(pg, 600)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'bb403.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
