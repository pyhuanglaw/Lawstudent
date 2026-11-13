"""CC-C 11-14：BB_458 CANON-NO-ECON-1112 瀏覽器驗收（B～D 節，給 BB 判）。這一支先做 LAWWW 觸發表到之前就確定的：
  GIRAFFE_A／GIRAFFE_B  #6 長頸鹿鑰匙圈（src/data/events.js ev_kx_souvenir：trigger enter、linze／campus、Y1S2 第 1 週（carryTo 2）、
                        KX_Y1S1_END==='taipei'、KX_LINE_OK ACQUAINTANCE）→ 兩個選項各一輪（_A「為什麼我的最短？」、_B「謝謝。」）；記 KX_SOUVENIR、GIRAFFE_KEYCHAIN。
【前置】最小存檔（同 cc_vacgap_probe：GAME.defaults＋過了開場的旗標）讀到大一下第 1 週週一 10:00 宿舍；
【捷徑】可昕 FAMILIAR（SOCIAL.meet＋數值）、聯絡人、KX_MET、KX_Y1S1_END='taipei'（＝大一上期末那一場選「臺北。」），墊完 GAME.snapshot() 再讀一次、條件事件照開；
之後照玩家：手機「地點」→ 校園 → 快速前往（進區域＝onEnter）→ 演出來的每一句截圖、選項照 CASE。每一段最後跑 D158 字表（tools/cc_local/canon_codes.hits）。
CC_02 清單 2026-11-14：1✓（日子用 STORY.termDay('Y1S2',1,1) 在遊戲裡算；旗標照 events.js prereq） 2✓（事件 id、旗標從程式讀；地點按鈕用手機頁 data-place） 3n/a（一件） 4✓（點前 reveal 展開地區、按鈕在才點） 5✓（快速前往，不走路） 6✓（到了等事件開演最多 120 秒） 7✓（lint、node 驗 JS） 8n/a（字對不對歸 BB） 9✓（遊戲畫面原樣截圖） 10✓（別的對話照字點完並記下來） 11✓（SHA 40 碼、ENV 沒有「|」） 12✓（FAIL_SETUP 檢查：讀到 Y1S2 第 1 週、墊完可昕 ≥ ACQUAINTANCE、KX_Y1S1_END、真的到了校園） 13n/a（不走路）
  XMAS_MET_A／XMAS_MET_B／XMAS_PREV／XMAS_ABROAD  #17 大三聖誕（@d999d036d8 當面版；BB 改定：當面版＋人在國外的視訊版）：12/24 21:00 兩則 → 「好。」→ 12/25 21:00 法律系館A（國外＝視訊）
  GRAD_KEY／GRAD_NOKEY  #15 6/2 畢業典禮（交往中；有／沒有長頸鹿鑰匙圈）：一路照演到 PG.done.grad，記 ADV.cg（不能有 cg_two_graduations）
  ORAL  #16 國考口試（【捷徑】畢業後篇＋JUDGE_PASS_2030，2031-01-11 09:50）：記「你為什麼念法律？」那一段，祐廷不提以前的系（D158 字表掃）
  ANNIV_A／ANNIV_C  #3 週年（在一起 2026-05-20 → 2027-05-13 21:00 邀約選「後門那家湯餃」→ 5/19 準備發票 → 5/20 18:30 出遊；卡片第 1／第 3 個選項）
  WELCOME_Y2  #13 大二迎新小隊輔（9/4 21:00 g:law_class → 9/6 14:00 社科院旁的草地；第 3 題三個短版）——書店那句（第 4 次起 rot）另外排
  NIGHT_MSG  #11 可昕深夜訊息（交往中；2026-10-14、10-15 23:20 宿舍手機傳「在幹嘛」→ 她回的那一句；兩晚看輪流）
用法：LW_TESTS=<wt>/tests SHA=<sha> [CASES=GIRAFFE_A,GIRAFFE_B,XMAS_MET_A,…] python3 cc_canon458_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import bbplay as P
import cc_seedplay as SP
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
CASES = [c for c in (os.environ.get('CASES') or 'GIRAFFE_A,GIRAFFE_B').split(',') if c]
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('canon458', OUT); SP.setup(R, OUT)
DONE_JS = "(ids=>{ const D=(GAME.G.events&&GAME.G.events.done)||{}, F=GAME.G.flags||{}; const o={}; for(const k of ids) o[k]=(k in D)?D[k]:(k in F?F[k]:null); return o; })"


async def c_giraffe(pg, cdp, tag, alt):
    d, seed = await SP.fresh(pg, cdp, tag, ['Y1S2', 1, 1], 10.0, 'dorm', {'kexin': 'FAMILIAR'}, {'KX_Y1S1_END': 'taipei'})
    seed['lineOk'] = await pg.evaluate("(()=>typeof KX_LINE_OK==='function'?KX_LINE_OK(GAME.G,'ACQUAINTANCE'):null)()")
    R.note('[%s] 墊完 %s' % (tag, J(seed)))
    if not R.check('FAIL_SETUP 檢查：[%s] Y1S2 第 1 週、可昕 ≥ ACQUAINTANCE（KX_LINE_OK）、KX_Y1S1_END taipei' % tag,
                   d['term'] == 'Y1S2' and d['week'] == 1 and seed.get('lineOk') is not False and seed['flags'].get('KX_Y1S1_END') == 'taipei', J({'d': d, 'seed': seed})): return {'case': tag, 'skip': 'setup'}
    ok = await SP.travel(pg, cdp, tag, 'campus')
    r = await SP.play(pg, cdp, tag, alt=alt, start_s=120)
    z = (await P.clock(pg))['zone']
    R.check('FAIL_SETUP 檢查：[%s] 手機快速前往到了校園' % tag, ok and z in ('campus', 'linze'), J({'tapped': ok, 'zone': z}))
    st = await pg.evaluate(DONE_JS, ['ev_kx_souvenir', 'KX_SOUVENIR', 'GIRAFFE_KEYCHAIN'])
    R.note('[%s] 之後 %s' % (tag, J(st)))
    R.check('[%s] ev_kx_souvenir 演了、GIRAFFE_KEYCHAIN 設了' % tag, bool(st.get('ev_kx_souvenir')) and st.get('GIRAFFE_KEYCHAIN') is True, J(st))
    SP.d158(tag, r)
    return {'case': tag, 'day': d, 'seed': seed, 'r': r, 'after': st}


ABROAD_ON = "(()=>{ if(!window.__abKeep){ window.__abKeep=STORY.abroad; STORY.abroad=()=>true; } return true; })()"
ABROAD_OFF = "(()=>{ if(window.__abKeep){ STORY.abroad=window.__abKeep; window.__abKeep=null; } return true; })()"


async def c_xmas(pg, cdp, tag):
    """#17 大三聖誕（r2y3a3d.js S.xmasPhone @d999d036d8；tests/r2y3a_events_unit.js 第 21 節）：交往中 12/24 20:45 宿舍 → 21:00 後兩則 → 按「好。」
       → MET＝當面版（OUT y3_kx_xmas＝ev_kexin_xmas_y3_met 12/25 21:00 法律系館A）→ 跳 12/25 20:30 → 等「出發」→ 每句截圖（選項 MET_A 第 1 個「一直都在。」、MET_B 第 2 個）；
       PREV＝大二聖誕去過（KX_XMAS {2:'went'}）開頭多三列；ABROAD＝【捷徑】STORY.abroad 改成 true（人在國外那一年）→ 照舊視訊版"""
    prev = tag == 'XMAS_PREV'; abroad = tag == 'XMAS_ABROAD'; alt = 1 if tag == 'XMAS_MET_B' else 0
    fl = {'KX_XMAS': {'2': 'went'}} if prev else {}
    d, seed = await SP.fresh(pg, cdp, tag, '2027-12-24', 20.75, 'dorm', {'kexin': 'DATING'}, fl)
    R.note('[%s] 墊完 %s' % (tag, J(seed)))
    if abroad:
        await pg.evaluate(ABROAD_ON); R.setup('[%s]【捷徑】STORY.abroad 改成永遠 true（祐廷那年人在國外；不讀交換路線存檔）' % tag)
    if not R.check('FAIL_SETUP 檢查：[%s] 和可昕交往中' % tag, seed['kexin']['dating'], J(seed)): return {'case': tag, 'skip': 'setup'}
    await SP.wait_h(pg, cdp, 21.1, tag); await pg.wait_for_timeout(3000)
    t = await SP.thread(pg, cdp, tag + '_1224', 'p:kexin')
    lab = await SP.answer(pg, cdp, tag + '_1224', 'p:kexin', 0, '好')
    q = await pg.evaluate("(()=>{ const q=OUT.get(GAME.G,'y3_kx_xmas'); return q?{day:CALENDAR.dateOf(q.day).key,h:q.h,ev:q.ev,place:q.place,state:q.state,late:q.late}:null; })()")
    R.note('[%s] 按「%s」以後 OUT y3_kx_xmas＝%s' % (tag, lab, J(q)))
    want = 'ev_kexin_xmas_y3' if abroad else 'ev_kexin_xmas_y3_met'
    if not R.check('FAIL_SETUP 檢查：[%s] 12/25 21:00 那一趟排上了（%s）' % (tag, want), bool(q) and q['day'] == '2027-12-25', J(q)):
        if abroad: await pg.evaluate(ABROAD_OFF)
        return {'case': tag, 'ask': t, 'reply': lab}
    R.note('[%s] 排的是 %s（%s版）' % (tag, q['ev'], '視訊' if abroad else '當面'))
    await SP.jump(pg, cdp, tag, '2027-12-25', 20.5, 'dorm', None)
    if abroad: await pg.evaluate(ABROAD_ON)
    r = await SP.go_out(pg, cdp, tag + '_1225', alt)
    fl2 = await pg.evaluate("(()=>({KX_XMAS:GAME.G.flags.KX_XMAS||null, zone:GAME.G.zone}))()"); R.note('[%s] 之後 %s' % (tag, J(fl2)))
    if abroad: await pg.evaluate(ABROAD_OFF)
    SP.d158(tag, t, r)
    return {'case': tag, 'ask': t, 'reply': lab, 'out': q, 'r': r, 'after': fl2}


CG_HOOK = "(()=>{ if(window.__cgH) return 'again'; window.__cgH=1; window.__cgs=[]; if(typeof ADV!=='undefined'&&ADV.cg){ const c0=ADV.cg; ADV.cg=function(id){ try{ window.__cgs.push(String(id)); }catch(e){} return c0.apply(this,arguments); }; } return 'ok'; })()"
PG_JS = "(()=>{ const G=GAME.G, F=G.flags||{}, r=(typeof PG!=='undefined'&&PG.rec)?PG.rec(G):{done:{}}; return {key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(2), zone:G.zone, GRADUATED:F.GRADUATED||null, done:Object.keys(r.done||{}).filter(k=>/grad|j3_|jb2_|family/.test(k)).map(k=>k+':'+r.done[k]), cgs:(window.__cgs||[]).slice(-20), pgOn:!!(typeof PG!=='undefined'&&PG.on&&PG.on(G))}; })()"


async def play_until(pg, cdp, tag, stop_js, max_rounds=8, alt=0):
    """一段一段演（每段 play），到 stop_js 為真或沒有新的對話為止"""
    rs = []
    for n in range(max_rounds):
        if await pg.evaluate(stop_js): break
        r = await SP.play(pg, cdp, '%s_%d' % (tag, n + 1), alt, start_s=90); rs.append(r)
        if not r['started']: break
    return rs


async def c_grad(pg, cdp, tag):
    """#15 6/2 畢業典禮（postgrad3d.js gradScene、partnerBeat；tests/graduation_unit.js 51～54、115～121）：交往中、GRAD_KEY＝GIRAFFE_KEYCHAIN（key 版）、GRAD_NOKEY＝沒有。
       2029-06-02 07:50 校園讀檔、條件事件照開 → 家人那一段（ev_grad_family）→ 晨思鐘大合照 → 可昕那一拍，一路照演、每句截圖；記 ADV.cg（不能有 cg_two_graduations）、PG.done.grad"""
    key = tag == 'GRAD_KEY'
    d, seed = await SP.fresh(pg, cdp, tag, '2029-06-02', 7 + 50 / 60, 'campus', {'kexin': 'DATING'}, {'GIRAFFE_KEYCHAIN': True} if key else {})
    await pg.evaluate(CG_HOOK); R.note('[%s] 墊完 %s；%s' % (tag, J(seed), J(await pg.evaluate(PG_JS))))
    rs = await play_until(pg, cdp, tag, "(()=>{ const r=(typeof PG!=='undefined'&&PG.rec)?PG.rec(GAME.G):{done:{}}; return !!(r.done&&r.done.grad); })()", 10)
    st = await pg.evaluate(PG_JS); R.note('[%s] 之後 %s' % (tag, J(st)))
    R.check('FAIL_SETUP 檢查：[%s] 畢業典禮那一步演了（PG.done.grad）' % tag, any(x.startswith('grad:') for x in st['done']), J(st))
    R.check('[%s] 沒有 cg_two_graduations' % tag, 'cg_two_graduations' not in st['cgs'], J(st['cgs']))
    allsaid = [t for r in rs for _, t in r['said']]
    R.note('[%s] 可昕那一拍附近：%s' % (tag, J([t for t in allsaid if '畢業' in t or '鑰匙' in t or '脖子' in t or '領子' in t or '學士帽' in t])))
    SP.d158(tag, *rs)
    return {'case': tag, 'seed': seed, 'rs': rs, 'pg': st}


async def c_oral(pg, cdp, tag):
    """#16 國考口試第一題（postgrad3d.js oralScene，PG 步驟 j3_2030 at 2031-01-11 10:00、cond JUDGE_PASS_2030 且 JUDGE_YEAR 沒有）：
       【捷徑】畢業後篇（GRADUATED＝2029-06-02、PG.done.grad）、JUDGE_PASS_2030；2031-01-11 10:00 以前的其他 PG 步驟記成 cc_skip（只留 j3_2030）→ 09:50 宿舍讀檔 → 照演"""
    d, seed = await SP.fresh(pg, cdp, tag, '2031-01-11', 9 + 50 / 60, 'dorm', {}, {'JUDGE_PASS_2030': True, 'BAR_SIT_2030': True, 'GRAD_DONE': True})
    sk = await P.prep(pg, cdp, R, """(()=>{ const G=GAME.G, F=G.flags; F.GRADUATED=STORY.dayOfKey('2029-06-02'); const r=PG.rec(G); r.done=r.done||{}; r.done.grad=F.GRADUATED; const now=G.day*24+G.hour, sk=[];
      for(const s of (PG.STEPS||[])){ if(!s||s.id==='j3_2030'||r.done[s.id]) continue; let at=null; try{ at=typeof s.at==='function'?s.at(G):s.at; }catch(e){} if(at!=null&&at<=now+0.25){ r.done[s.id]='cc_skip'; sk.push(s.id); } }
      return {skipped:sk.length, sample:sk.slice(0,12), on:!!(PG.on&&PG.on(G)), j3:!!(PG.byId&&PG.byId('j3_2030'))}; })()""", None, True, '[%s] 畢業後篇、JUDGE_PASS_2030；10:00 以前別的 PG 步驟記成 cc_skip' % tag)
    await P.events_on(pg)
    if not R.check('FAIL_SETUP 檢查：[%s] 畢業後篇開著、有 j3_2030 這一步' % tag, sk.get('on') and sk.get('j3'), J(sk)): return {'case': tag, 'skip': 'setup'}
    rs = await play_until(pg, cdp, tag, "(()=>{ const r=PG.rec(GAME.G); return !!(r.done&&r.done.j3_2030); })()", 6)
    st = await pg.evaluate(PG_JS); R.note('[%s] 之後 %s' % (tag, J(st)))
    R.check('FAIL_SETUP 檢查：[%s] 口試那一步演了（PG.done.j3_2030）' % tag, any(x.startswith('j3_2030:') for x in st['done']), J(st))
    allsaid = [t for r in rs for _, t in r['said']]
    R.note('[%s] 「為什麼念法律」那一段：%s' % (tag, J([t for i, t in enumerate(allsaid) if '法律' in t or (i and '法律' in allsaid[i - 1])])))
    SP.d158(tag, *rs)
    return {'case': tag, 'seed': seed, 'skip': sk, 'rs': rs, 'pg': st}


async def send_chat(pg, cdp, tag, pid, topic='chat'):
    """手機訊息 → 那一串 → 「傳訊息」(data-msgto) → 話題 (data-msgt="pid|topic")"""
    t = await P.phone_thread(pg, cdp, 'p:' + pid, open_folds=False)
    ok1 = await L.tap(pg, cdp, '#phoneBody [data-msgto="%s"]' % pid); await pg.wait_for_timeout(900)
    tops = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-msgt]')].map(b=>({k:b.dataset.msgt,t:(b.textContent||'').trim()}))")
    await pg.screenshot(path=os.path.join(OUT, '%s_topics.png' % tag))
    ok2 = await L.tap(pg, cdp, '#phoneBody [data-msgt="%s|%s"]' % (pid, topic)); await pg.wait_for_timeout(1500)
    toast = await pg.evaluate("(()=>{ const e=document.getElementById('toast'); return (e&&e.offsetParent)?(e.textContent||'').trim():''; })()")
    await pg.screenshot(path=os.path.join(OUT, '%s_sent.png' % tag))
    R.note('[%s] 傳訊息：串=%s 傳訊息鍵=%s 話題 %s 按「%s」=%s toast「%s」' % (tag, t['ok'], ok1, J(tops), topic, ok2, toast))
    await L.close_panels(pg, cdp)
    return {'thread': t['ok'], 'msgto': ok1, 'topics': tops, 'sent': ok2, 'toast': toast}


async def c_night(pg, cdp, tag):
    """#11 可昕深夜訊息（msg_pool.js 358「深夜」版、msg3d.js sitOk 深夜＝23～05、tier L＝交往中）：學期中、非考試週的平日 23:20 宿舍 → 手機傳「在幹嘛」→ 等她回（最多 40 遊戲分鐘）→ 那一串截圖；連兩晚（看輪流）"""
    out = []
    for i, day in enumerate(('2026-10-14', '2026-10-15')):
        if i == 0: d, seed = await SP.fresh(pg, cdp, tag, day, 23 + 20 / 60, 'dorm', {'kexin': 'DATING'}); R.note('[%s] 墊完 %s' % (tag, J(seed)))
        else: await SP.jump(pg, cdp, tag, day, 23 + 20 / 60, 'dorm', None)
        ex = await pg.evaluate("(()=>{ const t=CALENDAR.termOf(GAME.G.day); return {term:t&&t.id, week:t&&t.week, exam:!!(t&&t.exam), tier:(MSG.tierOf?MSG.tierOf(GAME.G,'kexin'):null)}; })()")
        R.check('FAIL_SETUP 檢查：[%s %s] 學期中、不是考試週' % (tag, day), bool(ex['term']) and not ex['exam'], J(ex))
        sc = await send_chat(pg, cdp, '%s_%s' % (tag, day[5:]), 'kexin')
        await SP.wait_h(pg, cdp, 23 + 20 / 60 + 0.66, '%s_%s' % (tag, day[5:]), max_s=400); await pg.wait_for_timeout(2500)
        t = await SP.thread(pg, cdp, '%s_%s_reply' % (tag, day[5:]), 'p:kexin')
        out.append(dict(day=day, ex=ex, send=sc, msgs=t['msgs'][-4:]))
    SP.d158(tag, *[{'msgs': o['msgs']} for o in out])
    return {'case': tag, 'nights': out}


async def c_anniv(pg, cdp, tag):
    """#3 週年（story3d.js 1844～1852、events.js ev_k7_gift_prep／ev_kexin_anniversary_y1；tests/kx_line_873_unit.js 65～77）：
       交往中、在一起那天 2026-05-20（confessed.kexin）→ 週年 2027-05-20（學期中）。2027-05-13 20:50 宿舍 → 21:00 後兩則＋三選一 → 按「後門那家湯餃」→ OUT kx_anniv1 5/20 18:30
       →【前置】跳 5/19 20:50 → 21:00 後「明天是週年。你準備的東西：」選發票（ticket）→【前置】跳 5/20 18:00 → 等「出發」→ 卡片三選項：ANNIV_A 第 1 個、ANNIV_C 第 3 個"""
    alt = 2 if tag == 'ANNIV_C' else 0
    cd = (await P.day_of(pg, '2026-05-20'))['d']
    d, seed = await SP.fresh(pg, cdp, tag, '2027-05-13', 20 + 50 / 60, 'dorm', {'kexin': 'DATING'}, {'confessed': {'kexin': cd}})
    at = await pg.evaluate("(()=>{ const A=STORY.kxAnnivAt?STORY.kxAnnivAt(GAME.G,1):null; return A?{day:CALENDAR.dateOf(A.day).key, early:!!A.early}:null; })()")
    R.note('[%s] 墊完 %s；週年 %s' % (tag, J(seed), J(at)))
    if not R.check('FAIL_SETUP 檢查：[%s] 交往中、算出來的週年是 2027-05-20' % tag, seed['kexin']['dating'] and bool(at) and at['day'] == '2027-05-20', J(at)): return {'case': tag, 'skip': 'setup'}
    await SP.wait_h(pg, cdp, 21.1, tag); await pg.wait_for_timeout(3000)
    t = await SP.thread(pg, cdp, tag + '_0513', 'p:kexin')
    lab = await SP.answer(pg, cdp, tag + '_0513', 'p:kexin', 1, '後門')
    q = await pg.evaluate("(()=>{ const q=OUT.get(GAME.G,'kx_anniv1'); return q?{day:CALENDAR.dateOf(q.day).key,h:q.h,place:q.place,title:q.title,travel:q.travel,state:q.state}:null; })()")
    R.note('[%s] 按「%s」以後 KX_ANNIV_PLACE=%s；OUT kx_anniv1＝%s' % (tag, lab, await pg.evaluate("GAME.G.flags.KX_ANNIV_PLACE||null"), J(q)))
    if not R.check('FAIL_SETUP 檢查：[%s] 5/20 18:30 的週年出遊排上了' % tag, bool(q) and q['day'] == '2027-05-20', J(q)): return {'case': tag, 'ask': t, 'reply': lab}
    await SP.jump(pg, cdp, tag, '2027-05-19', 20 + 50 / 60, 'dorm', None)
    await SP.wait_h(pg, cdp, 21.05, tag + '_0519')
    prep = await SP.play(pg, cdp, tag + '_0519_gift', 0, prefer=('發票', '（發票', '電影票'), start_s=90)
    gift = await pg.evaluate("GAME.G.flags.K7_GIFT||null"); R.note('[%s] 準備的東西 K7_GIFT=%s' % (tag, gift))
    await SP.jump(pg, cdp, tag, '2027-05-20', 18.0, 'dorm', None)
    r = await SP.go_out(pg, cdp, tag + '_0520', alt)
    fl = await pg.evaluate("(()=>({KX_ANNIV:GAME.G.flags.KX_ANNIV||null, K7_GIFT:GAME.G.flags.K7_GIFT||null}))()"); R.note('[%s] 之後 %s' % (tag, J(fl)))
    SP.d158(tag, t, prep, r)
    return {'case': tag, 'ask': t, 'reply': lab, 'out': q, 'prep': prep, 'r': r, 'after': fl}


async def c_welcome(pg, cdp, tag):
    """#13 大二迎新小隊輔（events.js ev_y2_welcome；story3d.js 2085～2090：9/4（五）21:00 g:law_class 系學會那一則 → OUT y2_welcome 9/6（日）14:00 社科院旁的草地）
       第 3 題「為什麼念法律？」三個短版（AA_905）：每一題選第 1 個，記所有選項。whyLaw 照新局（沒有）"""
    d, seed = await SP.fresh(pg, cdp, tag, '2026-09-04', 20 + 50 / 60, 'dorm', {}, {}, [['law_class', '法律系']])
    await SP.wait_h(pg, cdp, 21.1, tag); await pg.wait_for_timeout(3000)
    t = await SP.thread(pg, cdp, tag + '_0904', 'g:law_class')
    q = await pg.evaluate("(()=>{ const q=OUT.get(GAME.G,'y2_welcome'); return q?{day:CALENDAR.dateOf(q.day).key,h:q.h,place:q.place,state:q.state}:null; })()")
    R.note('[%s] OUT y2_welcome＝%s；whyLaw=%s' % (tag, J(q), await pg.evaluate("GAME.G.flags.whyLaw??null")))
    if not R.check('FAIL_SETUP 檢查：[%s] 9/6 14:00 迎新排上了' % tag, bool(q) and q['day'] == '2026-09-06', J(q)): return {'case': tag, 'ask': t}
    await SP.jump(pg, cdp, tag, '2026-09-06', 13.5, 'dorm', None)
    r = await SP.go_out(pg, cdp, tag + '_0906', 0)
    allopts = r['a']['opts'] + r['b']['opts']
    R.note('[%s] 迎新的選項（照順序）：%s' % (tag, J(allopts)))
    R.check('[%s] 有一題剛好三個選項（第 3 題「為什麼念法律？」三個短版）' % tag, any(len(o) == 3 for o in allopts), J(allopts))
    SP.d158(tag, t, r)
    return {'case': tag, 'ask': t, 'out': q, 'r': r}


async def one(pg, cdp, c):
    if c == 'WELCOME_Y2': return await c_welcome(pg, cdp, c)
    if c in ('ANNIV_A', 'ANNIV_C'): return await c_anniv(pg, cdp, c)
    if c == 'NIGHT_MSG': return await c_night(pg, cdp, c)
    if c in ('GRAD_KEY', 'GRAD_NOKEY'): return await c_grad(pg, cdp, c)
    if c == 'ORAL': return await c_oral(pg, cdp, c)
    if c in ('XMAS_MET_A', 'XMAS_MET_B', 'XMAS_PREV', 'XMAS_ABROAD'): return await c_xmas(pg, cdp, c)
    if c in ('GIRAFFE_A', 'GIRAFFE_B'): return await c_giraffe(pg, cdp, c, 0 if c.endswith('A') else 1)
    R.check('[%s] 認得這個 CASE' % c, False, ''); return {'case': c, 'skip': 'unknown'}


async def main():
    print('CC CANON BB_458：SHA %s；CASES %s；Playwright ≠ iPhone' % (SHA or '?', CASES), flush=True)
    res = {'sha': SHA, 'cases': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(1)
        for c in CASES:
            await P.init(pg)
            try: res['cases'].append(await one(pg, cdp, c))
            except Exception as e:
                R.check('[%s] 沒有中斷' % c, False, repr(e)[:300]); await pg.screenshot(path=os.path.join(OUT, 'crash_%s.png' % c))
            open(os.path.join(OUT, 'canon458.json'), 'w', encoding='utf-8').write(J(res))
            await pg.goto(URL); await L.wait_loaded(pg, 600)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'canon458.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
