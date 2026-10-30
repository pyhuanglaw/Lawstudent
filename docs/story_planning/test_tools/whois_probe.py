"""BB-B 10-30（CHAR-WHOIS-1030；AA_543 第 4 節＋5-1，使用者 X145「我甚至玩這麼久搞不清楚阿哲是誰」；開發分支 bcec62805；LAWWW-B 16:06 P1）：
手機 → 朋友 → 某人「資料」，「現在大概在」下面的「你們」那一段（· 開頭，一行一句）。照玩家點手機看畫面上的字，另外讀 WHOIS.lines 對照。
不是 iPhone：Playwright 手機直向模擬（SwiftShader）。
MODE=law（使用者 9/25 存檔＝舊開局；【捷徑】用旗標／記憶做出「經濟系開局到法律系」的那幾種狀態，經濟系一整年沒有真的玩過去）：
  W8 使用者存檔原樣：阿哲第一行「阿哲。法律系，跟你同班。」
  W1 大一上第 1 週：宿營同一小隊（FIRST_MET note camp）＋遊覽車坐旁邊＋203 四人房＋叫哥 → 全名那行、宿營＋遊覽車同一行、大一同住 203、打系籃、哥；沒有「大二」開頭、沒有「17 號」；Alison 個性沒有「其實很怕一個人」
  W2 大二上 12/19 以後：阿哲「大二上學期末，他和 Alison 在一起了。」；Alison 照怎麼知道的（麵店／電話／照片）三選一
  W4 法律系開局：阿勳「回到法律系以後，他傳訊息來：「是我，阿勳。」」，沒有「412，住了兩個月」
  W6 什麼都有（大三下）：一頁最多 8 行，「哥」和「在一起了」不被擠掉
  每一頁：直向畫面，這一段不壓到按鈕、字沒有被切掉（截圖）
MODE=econ（真的從標題「從經濟系大一開始」玩）：9/2 晚上韋綸、唐睿搬進 412 以後，朋友清單有他們兩個
用法：LW_TESTS=<工作樹>/tests MODE=law|econ python3 whois_probe.py <URL>/index.html <輸出資料夾> <使用者存檔>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import bbplay as P
from playwright.async_api import async_playwright
URL, OUT, SAVEF = sys.argv[1], sys.argv[2], sys.argv[3]
SAVE = json.load(open(SAVEF, encoding='utf-8'))
MODE = os.environ.get('MODE', 'law')
J = lambda o: json.dumps(o, ensure_ascii=False)
CAMP = """ G.social=G.social||{}; G.social.mem=G.social.mem||{}; const M=G.social.mem.zhe||(G.social.mem.zhe=[]); const fm=M.find(x=>x.tag==='FIRST_MET'); if(fm) fm.note='camp'; else M.push({tag:'FIRST_MET',note:'camp',day:G.day});
  F.CAMP_BUS='zhe'; F.DORM_FOUR=true; F.ZHE_CALLS_GE=true; """
LAYOUT = """(()=>{ const pb=document.getElementById('phoneBody'), w=pb&&pb.querySelector('.whois'); if(!w) return {whois:false};
  const r=w.getBoundingClientRect(), bs=[...pb.querySelectorAll('button')].map(b=>b.getBoundingClientRect()).filter(b=>b.width>0);
  const hit=bs.filter(b=>b.left<r.right&&b.right>r.left&&b.top<r.bottom&&b.bottom>r.top).length;
  const cut=[...w.querySelectorAll('*')].concat([w]).filter(e=>e.scrollWidth>e.clientWidth+1).length;
  return {whois:true, top:Math.round(r.top), bottom:Math.round(r.bottom), left:Math.round(r.left), right:Math.round(r.right), vw:innerWidth, overlapButtons:hit, cut, offscreenX:r.right>innerWidth+1||r.left<-1}; })()"""


async def person(pg, cdp, run, pid, tag):
    """手機 → 朋友 → 那個人的「資料」：讀「你們」那一段、個性那一行，截圖；回到朋友清單"""
    await P.phone_tab(pg, cdp, 'friends')
    has = await pg.evaluate("(id=>!!document.querySelector('#phoneBody [data-person=\"'+id+'\"]'))", pid)
    api = await pg.evaluate("(id=>{ try{ return WHOIS.lines(GAME.G,id); }catch(e){ return ['ERR '+e.message]; } })", pid)
    desc = await pg.evaluate("(id=>{ try{ const c=CHARACTERS[id]||{}; return WHOIS.desc(GAME.G,id,c.personality||''); }catch(e){ return 'ERR '+e.message; } })", pid)
    out = {'inList': has, 'api': api, 'ui': None, 'desc': desc, 'layout': None}
    if has:
        await L.tap(pg, cdp, '#phoneBody [data-person="%s"]' % pid); await pg.wait_for_timeout(900)
        out['ui'] = await pg.evaluate("(()=>{ const w=document.querySelector('#phoneBody .whois'); return w?w.innerText.split('\\n').map(s=>s.trim()).filter(Boolean):[]; })()")
        out['page'] = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")
        out['layout'] = await pg.evaluate(LAYOUT); await run.shot(pg, 'whois_%s_%s' % (tag, pid))
        await pg.evaluate("(()=>{ const b=document.querySelector('#phoneBody [data-personback]'); if(b) b.click(); })()"); await pg.wait_for_timeout(500)
    run.note('%s %s：清單裡 %s；畫面 %s；WHOIS.lines %s；版面 %s' % (tag, pid, has, J(out['ui']), J(api), J(out['layout'])))
    return out


def ln(o):   # 「· 」拿掉
    return [s[1:].strip() if s.startswith('·') else s for s in (o['ui'] if o['ui'] is not None else o['api'])]


def lay_ok(run, tag, o):
    L0 = o.get('layout') or {}
    run.check('%s：直向畫面「你們」這一段不壓到按鈕、字沒有被切掉、沒有超出畫面' % tag, bool(L0.get('whois')) and L0['overlapButtons'] == 0 and L0['cut'] == 0 and not L0['offscreenX'], J(L0))


async def state(pg, cdp, run, key, js, label):
    st, d = await P.base(pg, SAVE, key, 15.0, 'campus'); await P.load(pg, cdp, st)
    run.setup('[前置] 使用者存檔改到 %s（%s 第 %s 週）15:00 校園' % (d['key'], d['term'], d['week']))
    if js: await P.prep(pg, cdp, run, "(()=>{ const G=GAME.G, F=G.flags; %s return {DORM_FOUR:GAME.G.flags.DORM_FOUR||null, CAMP_BUS:GAME.G.flags.CAMP_BUS||null, YU_ZHE_TOLD:GAME.G.flags.YU_ZHE_TOLD||null}; })()" % js, label=label)
    await pg.wait_for_timeout(2500)


async def mode_law(pg, cdp, run):
    # W8 使用者存檔原樣（舊開局；不改日期、不改旗標）
    await P.load(pg, cdp, json.loads(json.dumps(SAVE.get('G', SAVE)))); await pg.wait_for_timeout(2500)
    run.note('使用者存檔原樣：%s' % J(await pg.evaluate("(()=>({key:CALENDAR.dateOf(GAME.G.day).key, h:GAME.G.hour, zone:GAME.G.zone, stage:GAME.G.stage}))()")))
    o = await person(pg, cdp, run, 'zhe', 'w8'); l = ln(o)
    run.check('使用者 9/25 存檔（舊開局）：阿哲第一行「阿哲。法律系，跟你同班。」（沒講過全名）', o['inList'] and bool(l) and l[0] == '阿哲。法律系，跟你同班。' and not any('張哲維' in s for s in l), J(l)); lay_ok(run, 'w8 阿哲', o)
    # W1 大一上第 1 週
    await state(pg, cdp, run, '2025-09-03', CAMP, '經濟系開局到法律系的樣子：阿哲宿營同一小隊（FIRST_MET note camp）、去程遊覽車坐旁邊（CAMP_BUS）、大一 203 四人房（DORM_FOUR）、叫哥（ZHE_CALLS_GE）')
    o = await person(pg, cdp, run, 'zhe', 'w1'); l = ln(o)
    want = ['張哲維，大家叫他阿哲。法律系，跟你同班。高雄人。', '宿營同一小隊，第一天就認識了。去程的遊覽車上，他坐你旁邊。', '大一同住 203。', '打系籃。', '知道你比大家大一歲以後，他都叫你「哥」。']
    miss = [w for w in want if w not in l]
    run.check('大一上第 1 週阿哲：全名那行、宿營＋遊覽車同一行、大一同住 203、打系籃、叫哥那行都在', o['inList'] and not miss, J({'missing': miss, 'lines': l}))
    run.check('大一上：沒有「大二」開頭的、沒有「17 號」', not any(s.startswith('大二') or '17 號' in s for s in l), J(l)); lay_ok(run, 'w1 阿哲', o)
    oy = await person(pg, cdp, run, 'yu', 'w1')
    run.check('大一上 Alison 個性沒有「其實很怕一個人」（WHOIS.desc＋畫面）', '其實很怕一個人' not in (oy.get('page') or '') + str(oy.get('desc')), J({'desc': oy.get('desc'), 'inList': oy['inList']}))
    # W2 大二上 12/19 以後：三種知道的方法
    yut = {'here': '大二上學期末，她和阿哲在一起了。是她在麵店親口跟你說的。', 'call': '大二上學期末，她和阿哲在一起了。她打電話跟你說的。', 'photo': '大二上學期末，她和阿哲在一起了。你是看到群組的照片才知道的。'}
    for k, t in yut.items():
        await state(pg, cdp, run, '2026-12-21', CAMP + " F.met_yu=true; F.YU_ZHE_TOLD=%s; F.ROOM_Y2=STORY.dayOfKey('2026-09-06');" % J(k), '同上＋大二住 312（ROOM_Y2）＋ Alison 和阿哲在一起、你知道的方法＝%s' % k)
        oz = await person(pg, cdp, run, 'zhe', 'w2_' + k); oy = await person(pg, cdp, run, 'yu', 'w2_' + k); lz, ly = ln(oz), ln(oy)
        run.check('大二上 12/19 以後（%s）阿哲：「大二上學期末，他和 Alison 在一起了。」' % k, '大二上學期末，他和 Alison 在一起了。' in lz, J(lz))
        if k == 'here': run.check('大二上阿哲：室友那一行是「室友：大一 203、大二 312。」，沒有大三搬走', '室友：大一 203、大二 312。' in lz, J(lz))
        others = [v for kk, v in yut.items() if kk != k]
        run.check('大二上 12/19 以後（%s）Alison：「%s」，另外兩句沒有' % (k, t), t in ly and not any(v in ly for v in others), J(ly))
        if k == 'here': lay_ok(run, 'w2 Alison', oy)
    # W4 法律系開局的阿勳
    await state(pg, cdp, run, '2025-10-20', " if(!SOCIAL.has('econ_zhengxun','FIRST_MET')&&SOCIAL.meet) SOCIAL.meet('econ_zhengxun','phone');", '阿勳傳過訊息、在朋友清單（法律系開局；沒有就 SOCIAL.meet）')
    o = await person(pg, cdp, run, 'econ_zhengxun', 'w4'); l = ln(o)
    run.check('法律系開局阿勳：「你經濟系那年的室友。回到法律系以後，他傳訊息來：「是我，阿勳。」」，沒有「412，住了兩個月」',
              any('他傳訊息來：「是我，阿勳。」' in s for s in l) and not any('住了兩個月' in s for s in l), J(l)); lay_ok(run, 'w4 阿勳', o)
    await state(pg, cdp, run, '2025-10-20', " F.PLAYED_Y0=true; F.MET_XUN=true; if(!SOCIAL.has('econ_zhengxun','FIRST_MET')&&SOCIAL.meet) SOCIAL.meet('econ_zhengxun','dorm');", '對照：玩過經濟系那一年（PLAYED_Y0）')
    o = await person(pg, cdp, run, 'econ_zhengxun', 'w4y0'); l = ln(o)
    run.check('對照：玩過經濟系那一年的阿勳是「你經濟系那年的室友，男宿 412，住了兩個月。」，沒有「是我，阿勳。」', '你經濟系那年的室友，男宿 412，住了兩個月。' in l and not any('是我，阿勳' in s for s in l), J(l))
    # W6 什麼都有：最多 8 行
    big = CAMP + (" F.ROOM_Y2=STORY.dayOfKey('2026-09-06'); F.ROOM_Y3=STORY.dayOfKey('2027-09-05'); F.noodleTableDay=STORY.dayOfKey('2025-09-25'); PHONE.join(G,'noodle_team','法一吃飯');"
                  " G.events=G.events||{}; G.events.done=G.events.done||{}; G.events.done.ev_zhe_game_y2=STORY.dayOfKey('2026-10-17'); F.ZHE3=true; F.CLUB_dept_basketball=true; F.ZHE2='study'; F.met_yu=true; F.YU_ZHE_TOLD='here'; F.FINAL_GAME_Y3='went';")
    await state(pg, cdp, run, '2028-06-10', big, '大三下、阿哲那一頁的條件全部成立（室友 203／312／大三搬走、哥、群組、17 號＋隊長、你也在系籃、陪念民法、和 Alison 在一起、冠軍賽在場邊）')
    o = await person(pg, cdp, run, 'zhe', 'w6'); l = ln(o)
    run.check('一頁最多 8 行', 0 < len(l) <= 8, J({'n': len(l), 'lines': l}))
    run.check('超過 8 行時「哥」和「在一起了」不被擠掉（全名、宿營也在）', '知道你比大家大一歲以後，他都叫你「哥」。' in l and '大二上學期末，他和 Alison 在一起了。' in l and l[0].startswith('張哲維') and any(s.startswith('宿營同一小隊') for s in l), J(l))
    run.check('合併的那幾行：室友一行（203、312、大三搬走）、系籃一行（17 號＋隊長）', any(s.startswith('室友：大一 203、大二 312。') and '大三起他搬去別間。' in s for s in l) and '打系籃，17 號。大三當上隊長。' in l, J(l))
    lay_ok(run, 'w6 阿哲（8 行）', o)
    oy = await person(pg, cdp, run, 'yu', 'w6')
    run.check('大三（YU_BKF 沒有）Alison 個性一樣沒有「其實很怕一個人」（只有一個人的早餐以後才寫）', '其實很怕一個人' not in (oy.get('page') or '') + str(oy.get('desc')), J(oy.get('desc')))
    await state(pg, cdp, run, '2027-03-10', " F.met_yu=true; F.YU_BKF=true;", '大二下 Alison 一個人吃早餐（YU_BKF）以後')
    oy = await person(pg, cdp, run, 'yu', 'bkf')
    run.check('對照：YU_BKF 以後個性那一行才有「其實很怕一個人」，「你們」有「大二下有一陣子，她一個人吃早餐。」', '其實很怕一個人' in str(oy.get('desc')) and '大二下有一陣子，她一個人吃早餐。' in ln(oy), J({'desc': oy.get('desc'), 'lines': ln(oy)}))


async def mode_econ(pg, cdp, run):
    u = URL + ('&' if '?' in URL else '?') + 'y0'
    await pg.goto(u); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()"); await pg.goto(u); await L.wait_loaded(pg); await pg.wait_for_timeout(1500); await P.init(pg)
    if await pg.evaluate("(()=>{ const r=document.getElementById('rotate'); return !!r&&r.classList.contains('want'); })()"):   # 直向：先點掉「請把手機轉成橫向（或直接點這裡繼續直向遊玩）」——第一次跑就是這一下被它吃掉，沒開局（n21_titledbg）
        await L.tap(pg, cdp, '#rotate'); await pg.wait_for_timeout(800)
    await L.tap(pg, cdp, '#btnNewEcon'); await pg.wait_for_timeout(2000)
    st0 = await pg.evaluate("(()=>({stage:GAME.G&&GAME.G.stage, key:GAME.G&&CALENDAR.dateOf(GAME.G.day).key, title:!document.getElementById('titleScreen').classList.contains('hide')}))()")
    run.check('前置：按「從經濟系大一開始」真的開局（stage econ、標題收起來）', st0['stage'] == 'econ' and not st0['title'], J(st0))
    if st0['stage'] != 'econ': return
    t0 = time.time(); moved = None; last = 0; trail = []
    while time.time() - t0 < 2700:   # 照玩家（同 next91015 boyaecon 走到 9/9 的那個迴圈）：點對話、選項用 P.pick_of（不選變暗的，婉拒那一類優先）、手機收起來
        s = await P.ts(pg)
        if s['ch']: k, _ = P.pick_of(s['ch'], []); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        await L.phone_away(pg, cdp)
        m = await pg.evaluate("(()=>{ const F=GAME.G.flags; return {mv:!!F.E412_MOVEIN, night:F.E01_NIGHT||null, boxes:!!F.E01_BOXES, key:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(2), zone:GAME.G.zone, stage:GAME.G.stage, paused:!!(GAME.E&&GAME.E.paused)}; })()")
        if m['mv']: moved = m; break
        if time.time() - last > 120:
            last = time.time(); trail.append(m); run.note('經濟系開局進度：%s' % J(m))
        await pg.wait_for_timeout(1200)
    if not moved:
        run.note('沒走到搬進 412：最後的狀態 %s；最後的畫面另存' % J(await P.ts(pg))); await run.shot(pg, 'econ_stuck')
    run.note('E412_MOVEIN：%s（%d 秒）' % (J(moved), time.time() - t0))
    run.check('前置：照玩家走到韋綸、唐睿搬進 412（E412_MOVEIN）', bool(moved), J(moved))
    if not moved: return
    idle = 0; t1 = time.time()
    while time.time() - t1 < 240 and idle < 6:   # 搬進來那一刻常常接著換日字卡（econ3：截圖全黑、朋友頁還沒畫出來）：先把對話、字卡等完
        s = await P.ts(pg)
        if s['ch']: k, _ = P.pick_of(s['ch'], []); await P.tap_choice(pg, cdp, k); idle = 0; await pg.wait_for_timeout(1000); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); idle = 0; await pg.wait_for_timeout(500); continue
        busy = await pg.evaluate("(()=>{ const t=document.getElementById('titleCard')||document.querySelector('.titlecard,.dateCard'); return !!(t&&!t.classList.contains('hide')&&t.offsetParent); })()")
        idle = 0 if busy else idle + 1
        await L.phone_away(pg, cdp); await pg.wait_for_timeout(1200)
    st1 = await pg.evaluate("(()=>({key:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(2), zone:GAME.G.zone, stage:GAME.G.stage, PLAYED_Y0:!!GAME.G.flags.PLAYED_Y0, met:['econ_weilun','econ_tangrui'].map(id=>[id,!!SOCIAL.has(id,'FIRST_MET'),!!GAME.G.flags['met_'+id]]), known:(GAME.knownIds?GAME.knownIds():[]).filter(x=>/^econ_/.test(x))}))()")
    run.note('等完字卡：%s' % J(st1))
    txt = ''
    for _ in range(5):
        txt = await P.phone_tab(pg, cdp, 'friends')
        if await pg.evaluate("!!document.querySelector('#phoneBody [data-person]')"): break
        await L.phone_away(pg, cdp); await pg.wait_for_timeout(2000)
    await run.shot(pg, 'econ_friends')
    ids = ['econ_zhengxun', 'econ_weilun', 'econ_tangrui', 'econ_pinyu']
    nm = await pg.evaluate("(ids=>ids.map(id=>[id,SOCIAL.displayName(id)]))", ids)
    run.note('朋友清單：%s' % txt[:400])
    run.check('經濟系開局搬進 412 以後，朋友清單有韋綸、唐睿（CHAR-WHOIS 第 5 項）', all(n in txt for i0, n in nm[1:3]), J({'names': nm, 'list': txt[:300]}))
    BAN = ['回到法律系以後', '你經濟系那年']
    W1 = {'econ_zhengxun': ['盧正勳，大家叫他阿勳。經濟系，跟你同班。', '男宿 412 的室友。'],
          'econ_weilun': ['邱韋綸。經濟系，跟你同班。口頭禪「走啦！」', '男宿 412 的室友，九月二號搬進來的。'],
          'econ_tangrui': ['唐睿。經濟系，跟你同班。', '男宿 412 的室友，九月二號搬進來的。'],
          'econ_pinyu': ['曾品妤。經濟系，跟你同班。']}
    FL = "(()=>{ const F=GAME.G.flags; return {key:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(2), stage:GAME.G.stage, camp:!!F.ECON_CAMP_DONE, moved:!!F.Y0_MOVED_OUT, e01:!!F.E01_DONE, zoula:!!(PHONE.inGroup&&PHONE.inGroup(GAME.G,'econ_friends')), kx:!!(STORY.knows&&STORY.knows('kexin',GAME.G))}; })()"
    API = "(ids=>ids.map(id=>WHOIS.lines(GAME.G,id)))"
    async def cp(tag, want, ui=True):
        fl = await pg.evaluate(FL); out = {}
        for pid, n in nm:
            if ui: o = await person(pg, cdp, run, pid, tag); l = ln(o) if o['inList'] else (o['api'] or [])
            else: o = None; l = (await pg.evaluate("(id=>WHOIS.lines(GAME.G,id))", pid)) or []
            out[pid] = l
            if ui and o['inList']: lay_ok(run, '%s %s' % (tag, pid), o)
            bad = [x for x in l if any(b in x for b in BAN)]
            run.check('%s（%s %.2f）%s：沒有「回到法律系以後」「你經濟系那年」' % (tag, fl['key'], fl['h'], n), not bad, J(l))
            ww = want(pid, fl)
            if ww is not None: run.check('%s（%s）%s：有 %s' % (tag, fl['key'], n, '／'.join(ww)), all(w in l for w in ww), J(l))
        return fl, out
    def want1(pid, fl):
        w = list(W1[pid])
        if pid == 'econ_zhengxun' and not fl['e01']: w = w[:1]
        if pid == 'econ_pinyu' and fl['kx']: w.append('可昕的室友。')
        return w
    fl1, o1 = await cp('econ_9月', want1)
    run.note('第一個檢查點：%s；%s' % (J(fl1), J(o1)))
    seen = {'camp': None, 'zoula': None}; t2 = time.time(); last2 = 0; hid = 0
    await L.close_panels(pg, cdp); await L.phone_away(pg, cdp); await pg.wait_for_timeout(1500)   # econ5：看完人物頁手機還開著，時間停在 9/13 19:33 四十分鐘
    while time.time() - t2 < 2400:   # 照玩家往下玩到 10/19 退宿（Y0_MOVED_OUT），途中宿營過了、進「走啦」群組各看一次（WHOIS.lines）
        s = await P.ts(pg)
        if time.time() - last2 > 120: last2 = time.time(); run.note('經濟系往下玩：%s；畫面 %s' % (J(await pg.evaluate(FL)), J({k: s[k] for k in ('dlg', 'txt', 'phone', 'busy', 'running')})))
        if s['ch']: k, _ = P.pick_of(s['ch'], []); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); continue
        if s['dlg'] and not s['txt']:   # 對話狀態開著、對話框沒顯示（手機裡的對話、被面板蓋住）：先把面板收起來
            hid += 1
            if s['phone'] or hid % 5 == 0: await L.close_panels(pg, cdp); await L.phone_away(pg, cdp)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        hid = 0
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        await L.phone_away(pg, cdp)
        fl = await pg.evaluate(FL)
        if fl['stage'] != 'econ' or fl['moved']: break
        if fl['camp'] and seen['camp'] is None:
            L2 = await pg.evaluate(API, ids); seen['camp'] = [fl['key'], L2]
            run.check('宿營過了（%s）：阿勳、韋綸有「經濟系宿營同一小隊。」' % fl['key'], all('經濟系宿營同一小隊。' in L2[k] for k in (0, 1)), J(L2))
        if fl['zoula'] and seen['zoula'] is None:
            L2 = await pg.evaluate(API, ids); seen['zoula'] = [fl['key'], L2]
            run.check('進「走啦」群組以後（%s）：韋綸「「走啦」群組是他建的。」、品妤「「走啦」群組裡也有她。」' % fl['key'], '「走啦」群組是他建的。' in L2[1] and '「走啦」群組裡也有她。' in L2[3], J(L2))
        await pg.wait_for_timeout(1200)
    fl2 = await pg.evaluate(FL); run.note('往下玩停在：%s；宿營那一點 %s；走啦那一點 %s' % (J(fl2), J(seen['camp'] and seen['camp'][0]), J(seen['zoula'] and seen['zoula'][0])))
    run.check('前置：照玩家玩到 10/19 退宿（Y0_MOVED_OUT）', fl2['moved'], J(fl2))
    if fl2['moved'] and fl2['stage'] == 'econ':
        await pg.wait_for_timeout(3000)
        def want2(pid, fl):
            return ['男宿 412 的室友，住了兩個月。'] if pid != 'econ_pinyu' else None
        fl3, o3 = await cp('econ_退宿後', want2)
        run.check('退宿以後三個室友都沒有「男宿 412 的室友。」「九月二號搬進來的」（換成住了兩個月那一行）', not any(x in ('男宿 412 的室友。', '男宿 412 的室友，九月二號搬進來的。') for pid in ids[:3] for x in o3[pid]), J({k: o3[k] for k in ids[:3]}))


async def main():
    run = L.Run('whois_' + MODE, OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=False)   # 直向
        pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()"); await P.init(pg)
        await {'law': mode_law, 'econ': mode_econ}[MODE](pg, cdp, run)
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE)
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
