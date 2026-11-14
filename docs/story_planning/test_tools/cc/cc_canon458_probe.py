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
  ANNIV_Y2  BB_466 ④ 第二年週年（2028；前一週 21:00 她私訊、地點她選＝shop → 那天 18:30 出遊照演）
  ANNIV_A／ANNIV_C  #3 週年（在一起 2026-05-20 → 2027-05-13 21:00 邀約選「後門那家湯餃」→ 5/19 準備發票 → 5/20 18:30 出遊；卡片第 1／第 3 個選項）
  WELCOME_Y2  #13 大二迎新小隊輔（9/4 21:00 g:law_class → 9/6 14:00 社科院旁的草地；第 3 題三個短版）——書店那句（第 4 次起 rot）另外排
  SPRING_Y2／SPRING_Y4  #4 春假女宿接人（@4af46fd8f6；選單選「春假：和可昕…」→ 她那句 → 4/3 07:40 出遊、地點字幕）
  FEED_Y1／FEED_Y4  #7 可昕動態（交往中；2025-09-14 21:00 kx1、2029-06-03 21:00 kx3h「畢業了。」→ 手機「動態」頁）
  ENC_DATING／ENC_FRIEND／ENC_ACQ  #8 淡水偶遇（交往中，Y1S1 第 6／8／9 週週日 16:00）／#14 朋友層偶遇（FRIEND，西門町第 6／8／9 週週六 18:00；認識＝遇不到）：捷運公館站入口 → 景點 → 散步 → 偶遇（60%）
  DATE_PS／DATE_ZR  #9 約會收尾（【捷徑】DATE.book D01 15:00 → 出發 → 選「差不多了」→ 收尾；芷若同一地點隔週再去一次＝AA_904 remember）
  BAR_FACE  #5 國考讀書會當面（Y4_PATH bar、交往中；2/23 起 OUT 排的讀書小組照順序演三場：開學那場、平日大口二樓 3D、週六法律系館）
  DRIFT_D1～DRIFT_D4  #1 AA_876 慢慢分開（交往中；【捷徑】直接設 KX_DRIFT 那一段 → 手機快速前往法律系館；D3 選第 2 個、D4 選「好。」→ 河濱）。D1c（隨機 0.35）、#2 D5 長椅另外排
  D5_FACE／D5_CALL／D6_SOUP  #2 D5 長椅（【捷徑】r5 pending＋讀檔到大二下期末最後一科考完 → 換區域 → 她當面約 → 隔天 19:00 長椅／不去＝21:00 電話）、D6 分開後第 61 天後門湯餃（【捷徑】KX_ENDED drift＋r6 ready）
  DRIFT_D1C  #1 D1c（【捷徑】Math.random＝mulberry32 固定種子 SEED 起；Y2S1 第 5 週起每天 10:00 進法律系館，中了就停、沒中的那幾天確認沒亂跳；最多 8 天）
  NIGHT_MSG  #11 可昕深夜訊息（交往中；2026-10-14、10-15 23:20 宿舍手機傳「在幹嘛」→ 她回的那一句；兩晚看輪流）
用法：LW_TESTS=<wt>/tests SHA=<sha> [CASES=GIRAFFE_A,GIRAFFE_B,XMAS_MET_A,…] python3 cc_canon458_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import bbplay as P
import cc_seedplay as SP
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
CASES = [c for c in (os.environ.get('CASES') or 'GIRAFFE_A,GIRAFFE_B').split(',') if c]
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('canon458', OUT); SP.setup(R, OUT); D.setup(R, OUT)
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
    fl = {'KX_XMAS': {'2': 'went'}, 'KX_XMAS3_CARD': True} if prev else {}   # BB-C 11-14：有卡片那版＝墊 KX_XMAS3_CARD（遊戲 r2y3a3d.js 在 12/24 那則訊息時也會照 KX_XMAS[2]==='went' 設）
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
    # BB-C 11-14：AA 改了有卡片那段的開場三列——PREV（大二聖誕去了＝KX_XMAS3_CARD）開場要有 XMAS_CARD_LINE；沒墊的那幾版不該有
    card = os.environ.get('XMAS_CARD_LINE') or '（去年的卡片說，今年換你決定去哪。可是地點是她昨天先講的。）'
    allt = [x[1] for x in (r['a'].get('lines') or []) + (r['b'].get('lines') or [])] + [x[1] for x in (r['a'].get('said') or []) + (r['b'].get('said') or [])]
    has = any(card.strip('（）') in x for x in allt)
    if not abroad: R.check('[%s] 開場%s「%s」' % (tag, '有' if prev else '沒有', card), has == prev, J(allt[:6]))
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


async def c_anniv2(pg, cdp, tag):
    """BB_466 ④（BB-C 01:27）第二年週年（story3d.js 1856～1866：n＝2）：交往中、在一起 2026-05-20、第一年演過（KX_ANNIV[1]）→ STORY.kxAnnivAt(G,2)＝週年那天；
       前一週 21:00 她私訊「下禮拜X週年。這次我選地方。」（kx_anniv_ask2，不用回、地點自動 shop）→ OUT kx_anniv2 那天 18:30 →【前置】跳那天 18:00 → 等「出發」→ 照演（卡片選第 1 個）"""
    cd = (await P.day_of(pg, '2026-05-20'))['d']
    d, seed = await SP.fresh(pg, cdp, tag, '2028-05-01', 12.0, 'dorm', {'kexin': 'DATING'}, {'confessed': {'kexin': cd}, 'KX_ANNIV': {'1': 'done'}})
    at = await pg.evaluate("(()=>{ const A=STORY.kxAnnivAt?STORY.kxAnnivAt(GAME.G,2):null; return A?{day:A.day, key:CALENDAR.dateOf(A.day).key, early:!!A.early}:null; })()")
    R.note('[%s] 墊完 %s；第二年週年 %s' % (tag, J(seed), J(at)))
    if not R.check('FAIL_SETUP 檢查：[%s] 交往中、算得出第二年週年（2028-05-20 前後）' % tag, seed['kexin']['dating'] and bool(at) and at['key'].startswith('2028-05'), J(at)): return {'case': tag, 'skip': 'setup'}
    ask_key = await pg.evaluate("(d=>CALENDAR.dateOf(d-7).key)", at['day'])
    await SP.jump(pg, cdp, tag, ask_key, 20 + 50 / 60, 'dorm', None)
    await SP.wait_h(pg, cdp, 21.1, tag); await pg.wait_for_timeout(3000)
    t = await SP.thread(pg, cdp, tag + '_ask', 'p:kexin')
    q = await pg.evaluate("(()=>{ const q=OUT.get(GAME.G,'kx_anniv2'); return {place:GAME.G.flags.KX_ANNIV_PLACE_2||null, out:q?{day:CALENDAR.dateOf(q.day).key,h:q.h,place:q.place,title:q.title,state:q.state}:null}; })()")
    R.note('[%s] 前一週 %s 21:00 私訊 %s；KX_ANNIV_PLACE_2＝%s；OUT kx_anniv2＝%s' % (tag, ask_key, J(t)[:400], q['place'], J(q['out'])))
    R.check('[%s] 前一週 21:00 她私訊「…週年。這次我選地方。」' % tag, '這次我選地方' in J(t), J(t)[:300])
    if not R.check('FAIL_SETUP 檢查：[%s] 第二年週年出遊排上了（%s 18:30）' % (tag, at['key']), bool(q['out']) and q['out']['day'] == at['key'], J(q)): return {'case': tag, 'ask': t, 'q': q}
    await SP.jump(pg, cdp, tag, at['key'], 18.0, 'dorm', None)
    r = await SP.go_out(pg, cdp, tag + '_day', 0)
    fl = await pg.evaluate("(()=>({KX_ANNIV:GAME.G.flags.KX_ANNIV||null, K7_GIFT:GAME.G.flags.K7_GIFT||null}))()"); R.note('[%s] 之後 %s' % (tag, J(fl)))
    R.check('[%s] 第二年週年演完（KX_ANNIV[2] 有記）' % tag, bool(fl['KX_ANNIV']) and ('2' in fl['KX_ANNIV'] or 2 in fl['KX_ANNIV']), J(fl))
    SP.d158(tag, t, r)
    return {'case': tag, 'ask': t, 'q': q, 'r': r, 'after': fl}


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


SPRING = {'SPRING_Y2': ('2027-03-30', 21.25, 21.6, 'kx_trip_y2s2', '2027-04-03'), 'SPRING_Y4': ('2029-03-25', 20.85, 21.1, 'y4_spring_kx', '2029-04-03')}


async def c_spring(pg, cdp, tag):
    """#4 春假女宿接人（@4af46fd8f6：AA 定「嗯。七點四十，宿舍樓下。」、出遊地點女生宿舍樓下）：交往中；大二 2027-03-30 21:30／大四 2029-03-25 21:00 她私訊
       → 三選一選單自己跳 → 選「春假：和可昕…」→ 記她回的那句、OUT 地點 →【前置】跳 4/3 07:00 → 等「出發」→ 每句截圖＋地點字幕（#caption）。看字和地點一致"""
    day, h0, h1, oid, d0 = SPRING[tag]
    d, seed = await SP.fresh(pg, cdp, tag, day, h0, 'dorm', {'kexin': 'DATING'})
    R.note('[%s] 墊完 %s' % (tag, J(seed)))
    await SP.wait_h(pg, cdp, h1, tag)
    pick = await SP.play(pg, cdp, tag + '_pick', 0, prefer=('春假：和可昕', '和可昕'), start_s=90)
    t = await SP.thread(pg, cdp, tag + '_kx', 'p:kexin')
    q = await pg.evaluate("(id=>{ const q=OUT.get(GAME.G,id); return q?{day:CALENDAR.dateOf(q.day).key,h:q.h,place:q.place,title:q.title,state:q.state}:null; })", oid)
    R.note('[%s] 選了 %s；她回 %s；OUT %s＝%s' % (tag, J(pick['picked']), J([m['text'] for m in t['msgs'][-3:]]), oid, J(q)))
    if not R.check('FAIL_SETUP 檢查：[%s] %s 07:40 的出遊排上了' % (tag, d0), bool(q) and q['day'] == d0, J(q)): return {'case': tag, 'pick': pick, 'kx': t}
    await SP.jump(pg, cdp, tag, d0, 7.0, 'dorm', None)
    c0 = await P.cap_n(pg)
    r = await SP.go_out(pg, cdp, tag + '_trip', 0)
    caps = [c[0] for c in P.cap_spans(await P.captions(pg, c0))]
    R.note('[%s] 出遊途中的地點字幕：%s' % (tag, J(caps)))
    SP.d158(tag, pick, t, r)
    return {'case': tag, 'pick': pick, 'kx': t, 'out': q, 'r': r, 'captions': caps}


FEED = {'FEED_Y1': ('2025-09-14', 20 + 50 / 60, 21.2, 'kx1'), 'FEED_Y4': ('2029-06-03', 20 + 50 / 60, 21.2, 'kx3h')}
FEED_JS = "(()=>{ const F=GAME.G.flags.FEED||null; let items=null; try{ items=(F&&(F.items||F.list||F.seen))?JSON.parse(JSON.stringify(F.items||F.list||F.seen)).slice(-6):null; }catch(e){} return {start:F&&F.start!=null?CALENDAR.dateOf(F.start).key:null, items}; })()"


async def c_feed(pg, cdp, tag):
    """#7 可昕動態（feed3d.js；資料 feed_y1s1.js～feed_pg.js）：交往中（新局沒交往＝不出）、有聯絡方式；讀檔在那一則時間之前（FEED.start 起才出）→ 等過了那一則 → 手機「動態」頁籤截圖、記全文、回應鍵"""
    day, h0, h1, fid = FEED[tag]
    d, seed = await SP.fresh(pg, cdp, tag, day, h0, 'dorm', {'kexin': 'DATING'})
    R.note('[%s] 墊完 %s；要看的那一則 %s' % (tag, J(seed), fid))
    await SP.wait_h(pg, cdp, h1, tag); await pg.wait_for_timeout(3000)
    txt = await P.phone_tab(pg, cdp, 'feed'); await pg.wait_for_timeout(800)
    await pg.screenshot(path=os.path.join(OUT, '%s_feed.png' % tag))
    btns = await pg.evaluate("[...document.querySelectorAll('#phoneBody button')].map(b=>(b.textContent||'').trim()).filter(t=>t).slice(0,20)")
    fs = await pg.evaluate(FEED_JS)
    R.note('[%s] 動態頁：%s；按鈕 %s；FEED %s' % (tag, J(txt[:800]), J(btns), J(fs)))
    R.check('FAIL_SETUP 檢查：[%s] 手機有「動態」頁、打得開' % tag, bool(txt), '')
    await L.close_panels(pg, cdp)
    SP.d158(tag, {'msgs': [{'text': txt}]})
    return {'case': tag, 'feed': txt, 'buttons': btns, 'state': fs}


ENC = {'ENC_DATING': ('DATING', '淡水', 7, 16.0), 'ENC_FRIEND': ('FRIEND', '西門町', 6, 18.0), 'ENC_ACQ': ('ACQUAINTANCE', '西門町', 6, 18.0)}
MRT_JS = "(()=>{ const i=GAME.E.interactables.find(i=>i.mrt&&!i.hidden); return i?{x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||2,lv:i.lv|0,label:i.label}:null; })()"


async def trip_loop(pg, cdp, tag, spot, walks=3, max_s=420):
    """捷運自由出行的選單迴圈：景點 → 散步 walks 次 → 偶遇照選（打招呼／第一個）→ 回去；每一句截圖、記選單"""
    n0 = await P.say_hook(pg); t0 = time.time(); seen = []; menus = []; k = 0; w = 0; back = False
    while time.time() - t0 < max_s:
        st = await P.ts(pg)
        if st['txt'] and (not seen or seen[-1] != [st['name'], st['txt']]):
            seen.append([st['name'], st['txt']])
            if len(seen) <= 60: await pg.wait_for_timeout(300); k += 1; await pg.screenshot(path=os.path.join(OUT, '%s_%02d.png' % (tag, k)))
        if st['ch']:
            o = [x['t'] for x in st['ch']]; menus.append(o)
            pick = next((i for i, t in enumerate(o) if t.startswith(spot)), None)
            if pick is None: pick = next((i for i, t in enumerate(o) if t.startswith('打招呼') or t.startswith('「嗨')), None)
            if pick is None and w < walks: pick = next((i for i, t in enumerate(o) if '走' in t and not t.startswith('回')), None); w += 1 if pick is not None else 0
            if pick is None: pick = next((i for i, t in enumerate(o) if t.startswith('回去') or t.startswith('回公館') or t.startswith('直接回宿舍')), None); back = back or pick is not None
            if pick is None: pick = 0
            k += 1; await pg.screenshot(path=os.path.join(OUT, '%s_%02d_menu.png' % (tag, k)))
            await P.tap_choice(pg, cdp, pick); await pg.wait_for_timeout(900); continue
        if st['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if st['busy'] or st['depth'] > 0: await pg.wait_for_timeout(500); continue
        if back and time.time() - t0 > 10: break
        if st['phone']: await L.phone_away(pg, cdp)
        await pg.wait_for_timeout(700)
        if not seen and not menus and time.time() - t0 > 40: break
    said = await P.said(pg, n0)
    R.note('[%s] 出行：散步 %d 次；選單 %s；GAME.say %s' % (tag, w, J(menus), J(said)))
    return {'lines': P.clean(seen), 'said': said, 'opts': menus, 'walks': w}


async def c_enc(pg, cdp, tag):
    """#8 淡水偶遇（交往中，D13 週日 16:30～19:00）／#14 朋友層偶遇（FRIEND，D04 西門町週六 18:30～21:00；認識＝遇不到）：
       公館「捷運公館站入口」照玩家走過去按 →「要去哪裡？」選景點 → 散步 → 60% 偶遇；沒遇到換下一週（最多三週）。記她那一段、選單（朋友層只有「打招呼／不打擾」）"""
    stage, spot, wd, h0 = ENC[tag]; out = []; met = False
    for n, wk in enumerate((6, 8, 9)):
        when = ['Y1S1', wk, wd]
        if n == 0: d, seed = await SP.fresh(pg, cdp, tag, when, h0, 'gongguan', {'kexin': stage}); R.note('[%s] 墊完 %s' % (tag, J(seed)))
        else: d = await SP.jump(pg, cdp, '%s 第 %d 週' % (tag, wk), when, h0, 'gongguan', None)
        mrt = await pg.evaluate(MRT_JS)
        if not R.check('FAIL_SETUP 檢查：[%s 第%d週] 公館有「捷運公館站入口」' % (tag, wk), bool(mrt), J(mrt)): break
        tgt = await D.standable_near(pg, mrt['x'], mrt['z'], mrt['r'] * 0.6, mrt['lv'])
        await L.go_to(pg, cdp, R, (tgt or mrt)['x'], (tgt or mrt)['z'], 0.4, '[%s] 捷運站入口' % tag, max_s=120, lv=mrt['lv'])
        q = await D.settle(pg)
        if not R.check('FAIL_SETUP 檢查：[%s 第%d週] 互動鍵是「捷運公館站入口」' % (tag, wk), q['interact'].startswith('捷運'), J(q)): break
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
        r = await trip_loop(pg, cdp, '%s_w%d' % (tag, wk), spot)
        txt = ' '.join(t for _, t in r['said']); hit = '嗨' in txt or any((nm or '').startswith('可昕') for nm, _ in r['said'])
        out.append(dict(week=wk, day=d, r=r, met=hit)); R.note('[%s 第%d週] 遇到可昕=%s' % (tag, wk, hit))
        if hit: met = True; break
    if tag == 'ENC_ACQ': R.check('[%s] 只是認識＝三週都沒遇到她' % tag, not met, J([o['met'] for o in out]))
    else: R.note('[%s] 三週內遇到=%s（60%% 擲骰，沒遇到不判 FAIL）' % (tag, met))
    if tag == 'ENC_DATING' and met:
        d0 = out[-1]['day']['key']; await SP.jump(pg, cdp, tag + ' 當晚', d0, 21.0, 'dorm', None); await SP.wait_h(pg, cdp, 21.3, tag + '_2110'); await pg.wait_for_timeout(2500)
        out.append({'phone': await SP.thread(pg, cdp, tag + '_2110', 'p:kexin')})
    SP.d158(tag, *[o.get('r') for o in out if o.get('r')])
    return {'case': tag, 'tries': out, 'met': met}


DATES = {'DATE_PS': ('classmate_peishan', 'D01', 1), 'DATE_ZR': ('heroine_02', 'D01', 2)}
BOOK_JS = "(a=>{ const G=GAME.G; const b=DATE.book(G,{who:a.who,locs:[a.loc],transport:'mrt',day:G.day,depart:a.dep}); const q=b&&b.trip!=null?OUT.get(G,'date_'+b.trip):null; return {ok:!!(b&&b.ok!==false&&b.trip!=null), why:b&&b.why||null, trip:b&&b.trip, q:q?{day:CALENDAR.dateOf(q.day).key,h:q.h,place:q.place,title:q.title}:null}; })"


async def c_date(pg, cdp, tag):
    """#9（BB 改定：AA_913 沛珊收尾＋AA_904 芷若再去一次 remember）：Y1S2 第 5 週週六 14:30 宿舍、她 CLOSE（約得了）→【捷徑】DATE.book 15:00 那一趟（同 tests/date_scene_unit.js）
       → 等「出發」→ 到了照演、選單選「差不多了」→ 收尾那幾句截圖。DATE_ZR 同一個地點隔週再去一次（看 remember 那一套）"""
    who, loc, times = DATES[tag]; out = []
    for n in range(times):
        when = ['Y1S2', 5 + n, 6]
        if n == 0: d, seed = await SP.fresh(pg, cdp, tag, when, 14.5, 'dorm', {who: 'CLOSE'}); R.note('[%s] 墊完 %s' % (tag, J(seed))); await pg.evaluate("(()=>{ GAME.G.money=Math.max(GAME.G.money|0,5000); })()")
        else: d = await SP.jump(pg, cdp, '%s 第 %d 次' % (tag, n + 1), when, 14.5, 'dorm', None)
        bk = await P.prep(pg, cdp, R, BOOK_JS, {'who': who, 'loc': loc, 'dep': 15}, True, '[%s 第%d次] DATE.book %s %s 15:00（同 date_scene_unit.js）' % (tag, n + 1, who, loc)); await P.events_on(pg)
        if not R.check('FAIL_SETUP 檢查：[%s 第%d次] 約會排上了' % (tag, n + 1), bk['ok'] and bool(bk['q']), J(bk)): break
        r = await SP.go_out(pg, cdp, '%s_%d' % (tag, n + 1), 0, verbs=('出發', '差不多了'))
        out.append({'n': n + 1, 'book': bk, 'r': r})
    SP.d158(tag, *[o['r'] for o in out])
    return {'case': tag, 'dates': out}


BAROUT_JS = "(()=>(OUT.rec(GAME.G)||[]).filter(q=>q&&/bar/.test(q.id||'')&&q.state==='planned').map(q=>({id:q.id,ev:q.ev,day:CALENDAR.dateOf(q.day).key,h:q.h,place:q.place,title:q.title})))()"


async def c_bar(pg, cdp, tag):
    """#5 國考讀書會當面那幾晚（律師讀書小組 r2y4b3d.js 667～745；tests/bar_group_3d_1112_unit.js 81～82、160～161）：Y4_PATH bar、和可昕交往中（只有可昕＝語彤不是朋友）
       2029-02-23 07:50 宿舍 → 08:00 後手機（可昕、群組）→ OUT 排的讀書小組那幾場，照順序跳到前 30 分鐘 → 等「出發」→ 每句截圖（開學那場、之後第一個平日大口二樓、週六法律系館）；最多三場"""
    d, seed = await SP.fresh(pg, cdp, tag, '2029-02-23', 7 + 50 / 60, 'dorm', {'kexin': 'DATING'}, {'Y4_PATH': 'bar'})
    R.note('[%s] 墊完 %s' % (tag, J(seed)))
    await SP.wait_h(pg, cdp, 8.2, tag); await pg.wait_for_timeout(3000)
    t = await SP.thread(pg, cdp, tag + '_0223', 'p:kexin')
    seen = set(); out = []
    for n in range(3):
        plans = await pg.evaluate(BAROUT_JS); R.note('[%s] 排著的讀書小組 %s' % (tag, J(plans)))
        nxt = next((q for q in sorted(plans, key=lambda q: (q['day'], q['h'])) if q['id'] not in seen), None)
        if not nxt:
            if n == 0: R.check('FAIL_SETUP 檢查：[%s] 2/23 以後有排讀書小組' % tag, False, J(plans))
            break
        seen.add(nxt['id'])
        await SP.jump(pg, cdp, '%s %s' % (tag, nxt['id']), nxt['day'], max(0, nxt['h'] - 0.5), 'dorm', None)
        r = await SP.go_out(pg, cdp, '%s_%d_%s' % (tag, n + 1, nxt['id']), 0)
        z = (await P.clock(pg))['zone']; out.append({'plan': nxt, 'r': r, 'zone_after': z})
        R.note('[%s] 第 %d 場 %s（%s %s）之後在 %s' % (tag, n + 1, nxt['ev'], nxt['day'], nxt['place'], z))
    SP.d158(tag, t, *[o['r'] for o in out])
    return {'case': tag, 'kx': t, 'sessions': out}


DRIFT = {'DRIFT_D1': ('2026-10-06', 8.85, "R.r1={area:'溫州街',day:G.day-1,st:'due'};", 0),
         'DRIFT_D2': ('2026-10-09', 12.85, "R.r2={st:'short',day:G.day-3};", 0),
         'DRIFT_D3': ('2027-03-15', 18.85, "F.KX_CRACK=3; R.th=Object.assign({},R.th||{},{2:1}); R.r3={st:'pending'};", 1),
         'DRIFT_D4': ('2027-03-15', 11.85, "F.KX_CRACK=5; R.th=Object.assign({},R.th||{},{2:1,4:1}); R.r4={st:'pending'};", 0)}


async def c_drift(pg, cdp, tag):
    """#1 AA_876 慢慢分開（kxdrift3d.js S.EVS；tests/kx_drift_876_unit.js 51～83）：只和可昕交往中；【捷徑】照觸發表直接設 KX_DRIFT（KXDRIFT.rec）那一段的狀態
       → 照玩家用手機「地點」走進法律系館（linze，trigger enter）→ 每句截圖。D1 昨天在溫州街沒說；D2 D1 後第 3 天；D3 大二下 19:00（選第 2 個＝「我看完這一頁就聽，給我五分鐘。」）；D4 選「好。」→ 18:00 公館河濱"""
    day, h0, setjs, alt = DRIFT[tag]
    d, seed = await SP.fresh(pg, cdp, tag, day, h0, 'dorm', {'kexin': 'DATING'})
    st = await P.prep(pg, cdp, R, "(()=>{ const G=GAME.G, F=G.flags, R=KXDRIFT.rec(G); " + setjs + " return {KX_CRACK:F.KX_CRACK, KX_DRIFT:JSON.parse(JSON.stringify(F.KX_DRIFT))}; })()", None, True, '[%s] KX_DRIFT 狀態（觸發表的直接設法）' % tag)
    await P.events_on(pg)
    R.note('[%s] 墊完 %s；%s' % (tag, J(seed), J(st)))
    ok = await SP.travel(pg, cdp, tag, 'linze')
    r = await SP.play(pg, cdp, tag + '_linze', alt, prefer=('好。',) if tag == 'DRIFT_D4' else (), start_s=90)
    z = (await P.clock(pg))['zone']
    R.check('FAIL_SETUP 檢查：[%s] 快速前往到了法律系館（linze）' % tag, ok and z == 'linze', z)
    out = {'case': tag, 'state': st, 'r': r}
    if tag == 'DRIFT_D4':
        q = await pg.evaluate("(()=>(OUT.rec(GAME.G)||[]).filter(q=>q&&/drift/.test(q.id||'')&&q.state==='planned').map(q=>({id:q.id,ev:q.ev,day:CALENDAR.dateOf(q.day).key,h:q.h,place:q.place})))()")
        R.note('[%s] 排著的 %s' % (tag, J(q))); out['out'] = q
        if q:
            await SP.jump(pg, cdp, tag + ' 河濱', q[0]['day'], max(0, q[0]['h'] - 0.5), 'linze', None)
            out['r4'] = await SP.go_out(pg, cdp, tag + '_river', 0)
    fl = await pg.evaluate("(()=>({KX_CRACK:GAME.G.flags.KX_CRACK, KX_DRIFT:JSON.parse(JSON.stringify(GAME.G.flags.KX_DRIFT||{}))}))()"); R.note('[%s] 之後 %s' % (tag, J(fl))); out['after'] = fl
    SP.d158(tag, r, out.get('r4'))
    return out


async def c_d5(pg, cdp, tag):
    """#2 D5 女宿長椅／21:00 電話（kxdrift3d.js ev_kx_drift_r5ask→r5→r5_call；tests/kx_drift_876_unit.js 87～100）：只和可昕交往中、【捷徑】KX_DRIFT.r5 pending
       →【捷徑】讀檔到大二下期末最後一科考完那天（KXDRIFT.examDay）宿舍 → 照玩家換一次區域（手機快速前往校園）→ 她當面「明天晚上七點，我宿舍樓下。」
       D5_FACE：隔天 18:30 等「出發」→ 長椅那一場（選第 1 個）；D5_CALL：隔天不去，20:15 起等 21:00 她打來「接起來」（選第 3 個）"""
    d, seed = await SP.fresh(pg, cdp, tag, '2027-06-01', 12.0, 'dorm', {'kexin': 'DATING'})
    ex = await P.prep(pg, cdp, R, "(()=>{ const G=GAME.G, R=KXDRIFT.rec(G); R.r5={st:'pending',at:G.day*24}; const e=KXDRIFT.examDay(G,'Y2S2'); return e?{day:e.day,key:CALENDAR.dateOf(e.day).key,h:e.h}:null; })()", None, True, '[%s] KX_DRIFT.r5 pending（觸發表的直接設法）' % tag)
    if not R.check('FAIL_SETUP 檢查：[%s] 算得出大二下期末最後一科（KXDRIFT.examDay）' % tag, bool(ex), J(ex)): return {'case': tag, 'skip': 'setup'}
    await SP.jump(pg, cdp, '%s 期末最後一科考完' % tag, ex['key'], max(ex['h'], 12) + 0.5, 'dorm', None)
    R.setup('[%s]【捷徑】讀檔到 %s 期末最後一科考完以後（%.2f）' % (tag, ex['key'], max(ex['h'], 12) + 0.5))
    ok = await SP.travel(pg, cdp, tag, 'campus')
    ask = await SP.play(pg, cdp, tag + '_ask', 0, start_s=90)
    q = await pg.evaluate("(()=>{ const q=OUT.get(GAME.G,'kx_drift_r5'); return q?{day:CALENDAR.dateOf(q.day).key,h:q.h,place:q.place,state:q.state}:null; })()")
    R.note('[%s] 換區域=%s；她說 %s；OUT kx_drift_r5＝%s' % (tag, ok, J(ask['said']), J(q)))
    if not R.check('FAIL_SETUP 檢查：[%s] 隔天 19:00 長椅那一趟排上了' % tag, bool(q) and q['h'] == 19, J(q)): return {'case': tag, 'ask': ask}
    out = {'case': tag, 'exam': ex, 'ask': ask, 'out': q}
    if tag == 'D5_FACE':
        await SP.jump(pg, cdp, tag + ' 隔天', q['day'], 18.5, 'dorm', None)
        out['r'] = await SP.go_out(pg, cdp, tag + '_bench', 0)
    else:
        await SP.jump(pg, cdp, tag + ' 隔天不去', q['day'], 20.25, 'dorm', None)
        out['r'] = await SP.go_out(pg, cdp, tag + '_call', 2, start_s=600, verbs=('接起來', '接'))
    fl = await pg.evaluate("(()=>({KX_ENDED:GAME.G.flags.KX_ENDED||null, KX_ENDED_ON:GAME.G.flags.KX_ENDED_ON||null, dating:GAME.G.flags.dating_kexin===true, r5:JSON.parse(JSON.stringify((GAME.G.flags.KX_DRIFT||{}).r5||null))}))()")
    R.note('[%s] 之後 %s' % (tag, J(fl))); out['after'] = fl
    SP.d158(tag, ask, out.get('r'))
    return out


async def c_d6(pg, cdp, tag):
    """#2 D6 分開後第 61 天後門湯餃（ev_kx_drift_r6；tests 101～106）：【捷徑】KX_ENDED drift（分開那天 2027-01-10）、不是交往中、KX_DRIFT.r6 ready；
       大二下開學日＋60 天（第 61 天）09:00 宿舍 → 照玩家走進法律系館（手機快速前往）→ 她約、字幕「學校後門・湯餃店」→ 每句截圖"""
    d0 = await P.day_of(pg, '2027-02-22'); dE = await P.day_of(pg, '2027-01-10')
    fd = await pg.evaluate("(()=>{ const r=CALENDAR.termDays('Y2S2'); return r?r.from:null; })()")
    day = (fd if fd is not None else d0['d']) + 60
    key = await pg.evaluate("(d=>CALENDAR.dateOf(d).key)", day)
    d, seed = await SP.fresh(pg, cdp, tag, key, 9.0, 'dorm', {'kexin': 'FRIEND'}, {'KX_ENDED': 'drift', 'KX_ENDED_ON': dE['d'], 'dating_kexin': False})
    st = await P.prep(pg, cdp, R, "(()=>{ const R=KXDRIFT.rec(GAME.G); R.r6={st:'ready'}; return JSON.parse(JSON.stringify(R.r6)); })()", None, True, '[%s] KX_DRIFT.r6 ready（觸發表：直接 ready 最快）' % tag)
    await P.events_on(pg)
    R.note('[%s] 第 61 天＝%s；墊完 %s；r6 %s' % (tag, key, J(seed), J(st)))
    c0 = await P.cap_n(pg)
    ok = await SP.travel(pg, cdp, tag, 'linze')
    r = await SP.play(pg, cdp, tag + '_r6', 0, start_s=90)
    caps = [c[0] for c in P.cap_spans(await P.captions(pg, c0))]
    R.note('[%s] 進法律系館=%s；地點字幕 %s' % (tag, ok, J(caps)))
    SP.d158(tag, r)
    return {'case': tag, 'day': key, 'r': r, 'captions': caps}


RNG_JS = """(seed=>{ if(!window.__rngKeep) window.__rngKeep=Math.random; let a=seed>>>0; window.__rngN=0; window.__rngLog=[];
  Math.random=function(){ a=(a+0x6D2B79F5)>>>0; let t=a; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); const v=((t^(t>>>14))>>>0)/4294967296; window.__rngN++; if(window.__rngLog.length<200) window.__rngLog.push(+v.toFixed(4)); return v; }; return 'mulberry32:'+seed; })"""


async def c_d1c(pg, cdp, tag):
    """#1 D1c（kxdrift3d.js ev_kx_drift_r1c：大二上起每學期一次、第 5～12 週、09:00～18:00 進 linze、random_weight 0.35）：只和可昕交往中
       【捷徑】Math.random 換成 mulberry32（SEED 固定、可重播）；Y2S1 第 5 週起每天 10:00 宿舍 → 照玩家手機快速前往法律系館 → 演了就記、截圖；沒演的那幾天也記（不能亂跳）；最多 8 天"""
    seed_n = int(os.environ.get('SEED') or 44); out = []; hit = False   # 44：第 1 天第一個亂數 0.836（不中）、第 2 天 0.037（中）——先留一輪沒中的
    for n in range(8):
        wk, wd = 5 + n // 5, 1 + n % 5
        when = ['Y2S1', wk, wd]
        if n == 0: d, seed = await SP.fresh(pg, cdp, tag, when, 10.0, 'dorm', {'kexin': 'DATING'}); R.note('[%s] 墊完 %s' % (tag, J(seed)))
        else: d = await SP.jump(pg, cdp, '%s 第%d週星期%d' % (tag, wk, wd), when, 10.0, 'dorm', None)
        rng = await pg.evaluate(RNG_JS, seed_n + n); R.setup('[%s]【捷徑】Math.random＝%s（可重播）' % (tag, rng))
        ok = await SP.travel(pg, cdp, '%s_d%d' % (tag, n + 1), 'linze')
        r = await SP.play(pg, cdp, '%s_d%d' % (tag, n + 1), 0, start_s=25)
        info = await pg.evaluate("(()=>({n:window.__rngN, log:(window.__rngLog||[]).slice(0,12), zone:GAME.G.zone, r1c:JSON.parse(JSON.stringify((GAME.G.flags.KX_DRIFT||{}).r1c||null)), done:!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_kx_drift_r1c), crack:GAME.G.flags.KX_CRACK}))()")
        await pg.evaluate("(()=>{ if(window.__rngKeep){ Math.random=window.__rngKeep; window.__rngKeep=null; } })()")
        out.append({'day': d['key'], 'travel': ok, 'r': r, 'rng': info, 'event': r['event']})
        R.note('[%s] %s：演了 %s；ev_kx_drift_r1c done=%s；亂數用了 %d 次 %s' % (tag, d['key'], r['event'], info['done'], info['n'], J(info['log'])))
        if info['done']: hit = True; break
        R.check('[%s] %s 沒中的那一天沒有亂跳別的分開戲' % (tag, d['key']), not (r['event'] or '').startswith('ev_kx_drift'), J(r['event']))
    R.check('FAIL_SETUP 檢查：[%s] 8 天內 D1c 有中（固定種子 %d 起）' % (tag, seed_n), hit, J([o['day'] for o in out]))
    SP.d158(tag, *[o['r'] for o in out])
    return {'case': tag, 'days': out, 'hit': hit}


async def one(pg, cdp, c):
    if c == 'DRIFT_D1C': return await c_d1c(pg, cdp, c)
    if c in ('D5_FACE', 'D5_CALL'): return await c_d5(pg, cdp, c)
    if c == 'D6_SOUP': return await c_d6(pg, cdp, c)
    if c in DRIFT: return await c_drift(pg, cdp, c)
    if c == 'BAR_FACE': return await c_bar(pg, cdp, c)
    if c in DATES: return await c_date(pg, cdp, c)
    if c in ENC: return await c_enc(pg, cdp, c)
    if c in FEED: return await c_feed(pg, cdp, c)
    if c in SPRING: return await c_spring(pg, cdp, c)
    if c == 'WELCOME_Y2': return await c_welcome(pg, cdp, c)
    if c in ('ANNIV_A', 'ANNIV_C'): return await c_anniv(pg, cdp, c)
    if c == 'ANNIV_Y2': return await c_anniv2(pg, cdp, c)
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
