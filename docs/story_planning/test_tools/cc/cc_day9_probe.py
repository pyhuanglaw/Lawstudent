"""CC（帳號 A）11-02：N6 補項——使用者第 9 天存檔（tests/repro_1020/user_save_day9.json）在瀏覽器裡讀進來、照真實玩家走一段、自動存檔、再讀一次。
受測：開發分支 d75871437。方法：瀏覽器實玩，不用 turbo（URL '<URL>/index.html'；有 turbo 會記一筆注意）。
不是 iPhone：Playwright 手機模擬（橫向 844×390 開瀏覽器；重要畫面用 shoot_both 另外切成直向 390×844 再截一張，切完切回橫向）。

存檔（唯讀）：預設 <LW_TESTS>/repro_1020/user_save_day9.json（遊戲工作樹裡的檔；環境變數 SAVE 可以換）。
  **存檔內容不寫進任何輸出檔**：transcript 只記摘要（日期、時間、區域、旗標數量、關係數、事件完成數、訊息數、位置），由頁面裡同一段 SUM_JS 算（檔案、讀檔後的 GAME.G、localStorage 自動存檔用同一套）。
  讀檔前看過的存檔摘要（d75871437 的那一份）：2025-09-25 前後（day 9）15:44、溫州街、兩點半 Café 門口（51,0）；裡面有 _stuck（10-19 的卡住紀錄，選單匯入時 parseImport 會拿掉）。

讀檔方式（LOAD，預設 menu）：
  menu ＝玩家的路：標題畫面「讀取」（#btnLoadMenu）→ 選單「存檔」頁 →「匯入」（#btnImport）→ 選檔（#importFile，Playwright set_input_files＝玩家在檔案選擇器選那個 .json；
         遊戲的 onchange 用 FileReader 把文字放進 #importText）→「匯入」（#btnImportGo：parseImport → 舊的自動存檔備份到 fatiao3d_backup → 寫進 fatiao3d_auto → loadFrom）。
  api  ＝【前置】playlib L.load_state（GAME.defaults＋存檔 → GAME.applySave；quiet_phone，條件事件照常）。不經過 parseImport（_stuck 由探針先拿掉）。

CASES（逗號隔開；預設 main。只有一個 case，分段記錄）：
  main  1. 開遊戲 → localStorage 清空 → 讀檔（LOAD）→ 讀檔後第一個畫面（shoot_both）＋摘要；check 讀得進來（title 收掉、day／zone 對）、摘要和檔案一致。
        2. 手機「今天」頁（#btnPhone → data-ptab="today"）：記文字（前 800 字）、shoot_both，收起來。
        3. 照玩家走到下一個地點：TARGET（預設 cafe）＝這一區 exit.to＝TARGET 的出入口（點地面／搖桿，playlib go_to）→ 按互動鍵進去（換區域＝遊戲自動存檔一次）。
           途中跳出來的對話照玩家點（選項：婉拒那一類、再沒有就第一個；bbplay pick_of）、手機自己打開就收起來。
           走不到（這一區沒有那個出入口）＝改 TARGET 以外最近的出入口，記一筆。
        4. 一次互動：進去以後這一區有可以說話的有名字的人（E.npcs 有 talk、不是路人）＝走過去「和〈他〉說話」點完（bbplay talk_full）；沒有＝站著等到下一個劇情停點
           （wait_play，等 WAIT_H 遊戲小時，預設 1.0；途中的對話照玩家點）。不另外上課（第 9 天 15:44 以後當天沒有課；要測上課換 TARGET／時間另寫）。
        5. 自動存檔：走出去回到原本那一區（換區域＝autosave）→ 讀 localStorage fatiao3d_auto 的摘要 A（savedAt 有沒有更新）、和當下 GAME.G 比。
        6. 再讀一次自動存檔：重新整理頁面 → 標題「繼續」（#btnContinue，讀 fatiao3d_auto）→ 摘要 B；和重新整理以後、按繼續以前的 fatiao3d_auto（A2；重新整理時遊戲可能又存一次）比。
        整段記：JS 例外（pageerror）、console error 前 20 筆、位置／時間／frame 有沒有在動（卡住）、GAME.walkFallbacks。
check（客觀記錄，判定由 BB 做）：
  讀得進來（沒有「讀取失敗」、title 收掉、day 9）；沒有 JS 例外；沒有卡住（走路時位置有動、遊戲時間有走、frame 有增加、busy 沒有一直卡著）；
  讀檔後 vs 檔案：day、zone、stage、money、關係數（rel、social.rel）、事件完成數（events.done 的鍵數、events.count）相同，hour 差 < HOUR_TOL（預設 0.5）、
    旗標鍵沒有少（少了哪幾個只列鍵名；舊存檔的遷移可能刪 met_ 之類的旗標＝列出來給 BB 判）；
  自動存檔 A vs 當下 GAME.G：同上（hour 差 < HOUR_TOL）；重讀 B vs A2：同上，加位置差 < POS_TOL（預設 1.5 m）。
不確定處：
  - 「讀檔前後一致」比的是讀檔那一刻；讀進來以後條件事件會照常跑（不 quiet），如果讀檔後馬上有事件演完，事件完成數可能 +1——摘要是讀完 1.5 秒內拿的，仍可能被搶先，會記在 note。
  - 選單匯入走 loadFrom，標題畫面時會先等人物下載（waitChars）；SwiftShader 下可能要一兩分鐘（LOAD_WAIT，預設 240 秒）。
  - 重新整理時遊戲的 visibilitychange／pagehide 可能再自動存檔一次，所以 B 比的是 A2（重新整理以後讀到的那一份），A 和 A2 不同會記 note、不算 FAIL。
  - TARGET=cafe 的出入口在存檔位置旁邊（幾公尺）；「下一個有事的地點」探針不知道，只照 TARGET 走；手機「今天」頁的文字可以給 BB 判斷下一件事在哪。
環境變數：CASES、LOAD（menu／api）、SAVE、TARGET（cafe）、TALK（1：有人就說話）、WAIT_H（1.0）、HOUR_TOL（0.5）、POS_TOL（1.5）、LOAD_WAIT（240）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=main] python3 cc_day9_probe.py '<URL>/index.html' <輸出資料夾>"""
import os, sys, json, asyncio, math, time, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
CASES = [c.strip() for c in os.environ.get('CASES', 'main').split(',') if c.strip()]
LOAD = os.environ.get('LOAD', 'menu')
SAVE = os.environ.get('SAVE') or os.path.join(os.environ['LW_TESTS'], 'repro_1020', 'user_save_day9.json')
TARGET = os.environ.get('TARGET', 'cafe')
TALK = os.environ.get('TALK', '1') == '1'
WAIT_H = float(os.environ.get('WAIT_H', '1.0'))
HOUR_TOL = float(os.environ.get('HOUR_TOL', '0.5'))
POS_TOL = float(os.environ.get('POS_TOL', '1.5'))
LOAD_WAIT = int(os.environ.get('LOAD_WAIT', '240'))
LAND = {'width': 844, 'height': 390}; PORT = {'width': 390, 'height': 844}


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


# 摘要（只讀；同一段給檔案物件、GAME.G、localStorage 的自動存檔用）。flagKeys 只有鍵名（比對「旗標沒有少」用），不記值
SUM_JS = r"""(s=>{ if(!s||typeof s!=='object') return null; const g=s.G&&typeof s.G==='object'&&s.day==null?s.G:s; const K=o=>(o&&typeof o==='object')?Object.keys(o).length:0;
  let key=null; try{ key=CALENDAR.dateOf(g.day).key; }catch(e){}
  const ev=g.events||{}, so=g.social||{}, p=g.pos||null;
  return {day:g.day,key,hour:typeof g.hour==='number'?+g.hour.toFixed(3):g.hour,zone:g.zone,stage:g.stage||'law',money:g.money,
    nflags:K(g.flags),flagKeys:Object.keys(g.flags||{}).sort(),nrel:K(g.rel),nsocialRel:K(so.rel),nmem:K(so.mem),evDone:K(ev.done),evCount:ev.count==null?null:ev.count,
    nmsgs:Array.isArray(g.msgs)?g.msgs.length:null,ncontacts:K(g.contacts),homeAt:!!(g.home&&g.home.at),pos:p?{x:+(+p.x).toFixed(2),z:+(+p.z).toFixed(2),lv:p.lv|0}:null,
    savedAt:g.savedAt||null,hasStuck:!!s._stuck}; })"""
LIVE_JS = "(()=>{ const s=GAME.G; const P=GAME.E.player.obj.position; const o=(" + SUM_JS + ")(s); if(o) o.pos={x:+P.x.toFixed(2),z:+P.z.toFixed(2),lv:GAME.E.player.lv|0}; return o; })()"
AUTO_JS = "(()=>{ let t=null; try{ t=((k)=>{ try{ const v=(GAME.readSave?GAME.readSave(k):(GAME.readSave?GAME.readSave(k):JSON.parse(localStorage.getItem(k)||'null'))); return v==null?null:JSON.stringify(v); }catch(e){ return null; } })('fatiao3d_auto'); }catch(e){ return {err:String(e)}; } if(!t) return null; let o=null; try{ o=JSON.parse(t); }catch(e){ return {err:'parse'}; } return (" + SUM_JS + ")(o); })()"
LS_KEYS = "(()=>{ const o={}; try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(/^fatiao3d_/.test(k)) o[k]=(localStorage.getItem(k)||'').length; } }catch(e){} return o; })()"
TITLE_UP = "(()=>!document.getElementById('titleScreen').classList.contains('hide'))()"
EXIT_JS = "(to=>{ const L=(GAME.E.interactables||[]).filter(i=>i.exit&&!i.hidden&&!(i.lv|0)); const P=GAME.E.player.obj.position; const d=i=>Math.hypot(i.x-P.x,i.z-P.z);" \
          " const it=to?L.find(i=>i.exit.to===to):L.sort((a,b)=>d(a)-d(b))[0]; return it?{x:it.x,z:it.z,r:it.radius||1.5,label:it.label||'',to:it.exit.to,lv:it.lv|0,d:+d(it).toFixed(2)}:null; })"
EXITS_JS = "(()=>(GAME.E.interactables||[]).filter(i=>i.exit&&!i.hidden).map(i=>({to:i.exit.to,label:i.label||'',x:+(+i.x).toFixed(1),z:+(+i.z).toFixed(1),lv:i.lv|0})))()"
NAMED_JS = "(()=>{ const P=GAME.E.player.obj.position; return (GAME.E.npcs||[]).filter(n=>n&&!n.isExtra&&n.obj&&!n.hidden&&(n.talk||n.talkLabel)).map(n=>({id:n.charId||n.id||'',name:n.name||'',d:+Math.hypot(n.obj.position.x-P.x,n.obj.position.z-P.z).toFixed(2)})).sort((a,b)=>a.d-b.d); })()"
LIVEN = "(()=>({frame:GAME.E.frame|0,day:GAME.G.day,h:+(+GAME.G.hour).toFixed(3),busy:!!GAME.E.player.busy,depth:(GAME.D&&GAME.D.busyDepth)|0,paused:!!GAME.E.paused,x:+GAME.E.player.obj.position.x.toFixed(2),z:+GAME.E.player.obj.position.z.toFixed(2),zone:GAME.G.zone,fb:GAME.walkFallbacks||0,toast:((document.getElementById('toast')||{}).textContent||'').trim().slice(0,80)}))()"

# 只記不改（同 cc_fa11 的 HOOK）：GAME.say／choose／caption／toast／enter
HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[];
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at()); window.__PL.push(o); if(window.__PL.length>8000) window.__PL.splice(0,2000); }catch(e){} return o; };
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',n:'',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>((x.t||x.text)||'')+(x.hint?'〔'+x.hint+'〕':'')).join('｜')}); return c0.apply(this,arguments); };
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(n,t){ push({k:'cap',n:String(n||''),t:String(t==null?'':t)}); return p0.apply(this,arguments); }; }
  if(GAME.toast){ const o0=GAME.toast; GAME.toast=function(t){ push({k:'toast',n:'',t:String(t||'')}); return o0.apply(this,arguments); }; }
  if(GAME.enter){ const e0=GAME.enter; GAME.enter=function(z,sp){ push({k:'enter',n:'',t:String(z)}); return e0.apply(this,arguments); }; }
  if(typeof EVENTS!=='undefined'&&EVENTS.run){ const v0=EVENTS.run; EVENTS.run=function(ev){ push({k:'ev',n:'',t:String((ev&&ev.id)||'')}); return v0.apply(this,arguments); }; }
  return 'ok'; })()"""


def cmp_sum(a, b, pos=False):
    """兩份摘要比：回傳 (ok, 差異 dict)。hour 容許 HOUR_TOL；flagKeys 只看 a 有、b 沒有的（少了哪些）"""
    if not a or not b: return False, {'missing': [bool(a), bool(b)]}
    diff = {}
    for k in ('day', 'zone', 'stage', 'money', 'nrel', 'nsocialRel', 'evDone', 'evCount'):
        if a.get(k) != b.get(k): diff[k] = [a.get(k), b.get(k)]
    if a.get('hour') is None or b.get('hour') is None or abs(float(a['hour']) - float(b['hour'])) >= HOUR_TOL: diff['hour'] = [a.get('hour'), b.get('hour')]
    lost = sorted(set(a.get('flagKeys') or []) - set(b.get('flagKeys') or []))
    if lost: diff['flagsLost'] = lost
    if pos and a.get('pos') and b.get('pos'):
        dd = math.hypot(a['pos']['x'] - b['pos']['x'], a['pos']['z'] - b['pos']['z'])
        if dd >= POS_TOL or (a['pos'].get('lv', 0) != b['pos'].get('lv', 0)): diff['pos'] = [a['pos'], b['pos'], round(dd, 2)]
    return not diff, diff


def slim(s):
    """transcript 用：拿掉 flagKeys（只留數量）"""
    if not isinstance(s, dict): return s
    return {k: v for k, v in s.items() if k != 'flagKeys'}


async def shoot_both(pg, run, tag):
    await pg.wait_for_timeout(700)
    a = await run.shot(pg, tag + '_land')
    await pg.set_viewport_size(PORT); await pg.wait_for_timeout(2000)
    b = await run.shot(pg, tag + '_port')
    await pg.set_viewport_size(LAND); await pg.wait_for_timeout(2000)
    return [a, b]


async def handle_once(pg, cdp, picks=()):
    """畫面上有對話／選項／手機就照玩家處理一次；回傳做了什麼（None＝沒事）"""
    s = await P.ts(pg)
    if s['ch']:
        k, _ = P.pick_of(s['ch'], picks); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); return 'choice:' + s['ch'][k]['t']
    if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); return 'dlg'
    if s['phone']: await L.phone_away(pg, cdp); return 'phone'
    return None


async def play_until(pg, cdp, run, cond, max_s, tag, picks=()):
    """照玩家點對話、選選項、收手機，直到 cond(live) 成立；回傳 (成立與否, 點過的對話)"""
    t0 = time.time(); seen = []
    while time.time() - t0 < max_s:
        lv = await pg.evaluate(LIVEN)
        if cond(lv): break
        s = await P.ts(pg)
        if s['txt'] and (not seen or seen[-1] != [s['name'], s['txt']]): seen.append([s['name'], s['txt']])
        if not await handle_once(pg, cdp, picks): await pg.wait_for_timeout(800)
    ok = cond(await pg.evaluate(LIVEN))
    if seen: run.note('%s 途中點過的對話：%s' % (tag, J(P.clean(seen))[:1500]))
    return ok, P.clean(seen)


async def go_exit(pg, cdp, run, to, tag, res):
    """走到 exit.to＝to 的出入口（沒有就最近的），按互動鍵，等到換區域"""
    it = await pg.evaluate(EXIT_JS, to)
    if not it and to:
        run.note('%s：這一區沒有通往 %s 的出入口（出入口：%s），改最近的' % (tag, to, J(await pg.evaluate(EXITS_JS))))
        it = await pg.evaluate(EXIT_JS, None)
    if not it: run.note('%s：這一區沒有出入口' % tag); return None
    z0 = await pg.evaluate("GAME.G.zone"); key = it['label'][:6]
    p0 = await L.state(pg)
    arrived = await L.go_to(pg, cdp, run, it['x'], it['z'], max(0.5, min(1.2, it['r'] * 0.6)), '%s：%s' % (tag, it['label']), max_s=360, lv=it['lv'],
                            stop=lambda s, k=key: k in s['interact'])
    p1 = await L.state(pg)
    rec = {'exit': it, 'arrived': arrived, 'from': [p0['x'], p0['z']], 'to': [p1['x'], p1['z']], 'moved': round(math.hypot(p1['x'] - p0['x'], p1['z'] - p0['z']), 2),
           'interact': p1['interact']}
    for _ in range(4):
        s = await L.state(pg)
        if key in s['interact']: await L.tap(pg, cdp, '#interact'); rec['tapped'] = s['interact']; break
        if s['dlg'] or s['choices']: await handle_once(pg, cdp)
        await pg.wait_for_timeout(1000)
    ok, seen = await play_until(pg, cdp, run, lambda lv: lv['zone'] != z0 and not lv['busy'], 120, tag)
    await pg.wait_for_timeout(2500)
    rec['zone'] = await pg.evaluate("GAME.G.zone"); rec['entered'] = rec['zone'] != z0; rec['dialog'] = seen
    res.setdefault('moves', []).append(rec)
    run.note('%s：%s' % (tag, J(rec)))
    return rec


async def load_menu(pg, cdp, run, res):
    """玩家的路：標題「讀取」→ 存檔頁「匯入」→ 選檔 →「匯入」"""
    await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
    shown = await pg.evaluate("(()=>{ const t=document.getElementById('tab-save'); return {menu:!document.getElementById('menu').classList.contains('hide'),saveTab:!!t&&t.classList.contains('on')}; })()")
    res['menu_open'] = shown
    await L.tap(pg, cdp, '#btnImport'); await pg.wait_for_timeout(900)
    res['shots']['import_box'] = await run.shot(pg, 'import_box')
    await pg.set_input_files('#importFile', SAVE)
    filled = 0
    for _ in range(20):
        filled = await pg.evaluate("((document.getElementById('importText')||{}).value||'').length")
        if filled: break
        await pg.wait_for_timeout(300)
    run.note('匯入框：選檔以後 #importText 有 %d 個字（只記長度）' % filled)
    res['import_chars'] = filled
    await L.tap(pg, cdp, '#btnImportGo')
    t0 = time.time(); msg = ''
    while time.time() - t0 < LOAD_WAIT:
        msg = await pg.evaluate("((document.getElementById('importMsg')||{}).textContent||'').trim()")
        st = await pg.evaluate("(()=>({title:!document.getElementById('titleScreen').classList.contains('hide'),menu:!document.getElementById('menu').classList.contains('hide'),day:GAME.G&&GAME.G.day,zone:GAME.G&&GAME.G.zone,running:!!GAME.running}))()")
        if msg.startswith('匯入失敗'): break
        if not st['title'] and not st['menu'] and st['running'] and st['day'] is not None: break
        await pg.wait_for_timeout(1000)
    res['import_msg'] = msg
    run.setup('讀檔＝玩家的路：標題「讀取」→ 選單「存檔」→「匯入」→ 選檔（set_input_files %s）→「匯入」；匯入訊息「%s」（%.0f 秒）' % (os.path.basename(SAVE), msg, time.time() - t0))
    return not msg.startswith('匯入失敗')


async def case_main(p, run):
    res = {'case': 'main', 'load': LOAD, 'save_file': os.path.basename(SAVE), 'shots': {}}
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    cons = []
    pg.on('console', lambda m: cons.append(m.text[:300]) if m.type == 'error' and len(cons) < 200 else None)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    try:
        with open(SAVE, encoding='utf-8') as f: save = json.load(f)
        await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('main：遊戲載入', ok)
        await pg.evaluate("localStorage.clear()"); await pg.reload(); await L.wait_loaded(pg); await pg.wait_for_timeout(1500)
        await P.init(pg)
        fsum = await pg.evaluate(SUM_JS, save)
        res['file'] = slim(fsum)
        run.note('存檔檔案摘要（不含內容）：%s' % J(slim(fsum)))
        res['shots']['title'] = await run.shot(pg, 'title')
        # ---- 1. 讀檔 ----
        if LOAD == 'api':
            st = dict(save); st.pop('_stuck', None); st.pop('_busy', None)
            await L.load_state(pg, st, quiet_events=False, quiet_phone=True)
            run.setup('【前置】LOAD=api：L.load_state（GAME.defaults＋存檔 → GAME.applySave；quiet_phone，條件事件照常；_stuck 探針先拿掉）')
            loaded = True
        else:
            loaded = await load_menu(pg, cdp, run, res)
        await pg.wait_for_timeout(1500)
        await pg.evaluate(HOOK)
        lsum = await pg.evaluate(LIVE_JS)
        res['after_load'] = slim(lsum)
        run.note('讀檔後摘要：%s' % J(slim(lsum)))
        res['shots']['first'] = await shoot_both(pg, run, 'first_screen')
        title = await pg.evaluate(TITLE_UP)
        run.check('main：讀得進來（標題收掉、沒有「匯入失敗」、day＝檔案的 day）', loaded and not title and lsum and lsum['day'] == fsum['day'],
                  J({'loaded': loaded, 'title': title, 'msg': res.get('import_msg'), 'day': lsum and lsum['day'], 'zone': lsum and lsum['zone']}))
        okc, diff = cmp_sum(fsum, lsum)
        run.check('main：讀檔後 vs 檔案（日期、區域、關係數、事件完成數、旗標沒少；hour 差 < %.2f）' % HOUR_TOL, okc, J(diff))
        res['ls_after_load'] = await pg.evaluate(LS_KEYS)
        run.note('localStorage（鍵：長度）：%s' % J(res['ls_after_load']))
        # ---- 2. 手機「今天」----
        await L.phone_away(pg, cdp, tries=2)
        for _ in range(6):
            if not await handle_once(pg, cdp): break
        txt = await P.phone_tab(pg, cdp, 'today')
        res['phone_today'] = txt[:800]
        run.note('手機「今天」：%s' % J(txt[:800]))
        res['shots']['phone_today'] = await shoot_both(pg, run, 'phone_today')
        await L.close_panels(pg, cdp)
        run.check('main：手機「今天」頁有內容', bool(txt.strip()), J(txt[:120]))
        # ---- 3. 走到下一個地點 ----
        lv0 = await pg.evaluate(LIVEN); t0 = time.time()
        z_home = lv0['zone']
        mv = await go_exit(pg, cdp, run, TARGET, '走到 %s' % TARGET, res)
        lv1 = await pg.evaluate(LIVEN)
        res['live_walk'] = [lv0, lv1]
        run.check('main：走路時位置有動（沒有卡住）', bool(mv) and (mv['moved'] > 0.3 or mv['entered']), J(mv and {k: mv.get(k) for k in ('moved', 'arrived', 'entered', 'zone', 'interact')}))
        run.check('main：遊戲時間有走、frame 有增加', (lv1['day'] > lv0['day'] or lv1['h'] > lv0['h']) and lv1['frame'] > lv0['frame'],
                  J({'h': [lv0['h'], lv1['h']], 'frame': [lv0['frame'], lv1['frame']], 'sec': round(time.time() - t0)}))
        run.check('main：進到 %s（換區域）' % TARGET, bool(mv) and mv['entered'], J(mv and mv.get('zone')))
        res['shots']['target'] = await shoot_both(pg, run, 'target_zone')
        auto1 = await pg.evaluate(AUTO_JS); res['auto_after_enter'] = slim(auto1)
        run.note('換區域以後的自動存檔：%s' % J(slim(auto1)))
        # ---- 4. 一次互動 ----
        named = await pg.evaluate(NAMED_JS); res['named'] = named
        run.note('這一區可以說話的有名字的人：%s' % J(named))
        talked = None
        if TALK and named:
            talked = await P.talk_full(pg, cdp, run, named[0]['id'], '互動：和 %s 說話' % (named[0]['name'] or named[0]['id']), max_s=300)
            res['talk'] = {'who': named[0], 'r': talked and {k: talked.get(k) for k in ('lines', 'opts', 'picked', 'label')}}
            res['shots']['talk'] = await shoot_both(pg, run, 'after_talk')
        lvw0 = await pg.evaluate(LIVEN)
        hw = lvw0['h'] + (0.25 if talked else WAIT_H)
        waited = await P.wait_play(pg, cdp, hw, max_s=900, run=run, tag='等到 %s' % hm(hw))
        lvw1 = await pg.evaluate(LIVEN); res['live_wait'] = [lvw0, lvw1]
        run.check('main：一次互動（說到話）或等到下一個停點', bool(talked and talked.get('started')) or waited, J({'talk': bool(talked), 'waited': waited, 'h': [lvw0['h'], lvw1['h']]}))
        run.check('main：等待期間時間有走（沒有卡在對話或暫停）', (lvw1['day'] > lvw0['day'] or lvw1['h'] > lvw0['h']) and not lvw1['paused'], J({'h': [lvw0['h'], lvw1['h']], 'paused': lvw1['paused'], 'busy': lvw1['busy'], 'depth': lvw1['depth']}))
        # ---- 5. 自動存檔 ----
        mv2 = await go_exit(pg, cdp, run, z_home, '走回 %s' % z_home, res)
        await pg.wait_for_timeout(2000)
        for _ in range(6):
            if not await handle_once(pg, cdp): break
        autoA = await pg.evaluate(AUTO_JS); liveA = await pg.evaluate(LIVE_JS)
        res['autoA'] = slim(autoA); res['liveA'] = slim(liveA)
        res['shots']['back'] = await shoot_both(pg, run, 'back_home_zone')
        run.check('main：自動存檔有更新（savedAt 比讀檔後換區域那一次新）', bool(autoA) and bool(auto1) and (autoA.get('savedAt') or 0) > (auto1.get('savedAt') or 0),
                  J({'auto1': auto1 and auto1.get('savedAt'), 'autoA': autoA and autoA.get('savedAt'), 'zone': autoA and autoA.get('zone')}))
        okA, dA = cmp_sum(autoA, liveA)
        run.check('main：自動存檔 vs 當下 GAME.G 一致', okA, J(dA))
        # ---- 6. 重新整理 → 繼續 ----
        res['rows'] = await pg.evaluate("(window.__PL||[])")   # 重新整理以前的逐字稿（重新整理以後 hook 要重裝）
        await pg.reload(); await L.wait_loaded(pg); await pg.wait_for_timeout(1500)
        await P.init(pg)
        autoA2 = await pg.evaluate(AUTO_JS); res['autoA2'] = slim(autoA2)
        if autoA and autoA2 and autoA.get('savedAt') != autoA2.get('savedAt'): run.note('重新整理時遊戲又存了一次：A savedAt %s → A2 %s（B 和 A2 比）' % (autoA.get('savedAt'), autoA2.get('savedAt')))
        res['shots']['title2'] = await run.shot(pg, 'title_after_reload')
        await L.tap(pg, cdp, '#btnContinue')
        t1 = time.time()
        while time.time() - t1 < LOAD_WAIT:
            if not await pg.evaluate(TITLE_UP) and await pg.evaluate("!!(GAME.running&&GAME.G&&GAME.E&&GAME.E.player)"): break
            await pg.wait_for_timeout(1000)
        await pg.wait_for_timeout(1500)
        await pg.evaluate(HOOK)
        liveB = await pg.evaluate(LIVE_JS); res['liveB'] = slim(liveB)
        res['shots']['reloaded'] = await shoot_both(pg, run, 'reloaded_continue')
        okB, dB = cmp_sum(autoA2, liveB, pos=True)
        run.check('main：重讀自動存檔（重新整理 → 繼續）後一致（含位置差 < %.1f m）' % POS_TOL, okB, J(dB))
        okFB, dFB = cmp_sum(fsum, liveB)
        run.note('參考：重讀後 vs 原始檔案（玩過一段，時間、事件數可能不同）：%s' % J(dFB))
        # 重讀後還能動：推一下搖桿
        s0 = await L.state(pg)
        for _ in range(4):
            if not await handle_once(pg, cdp): break
        moved, n, s1 = await L.push_until(pg, cdp, 0, -40, 0.4, max_pushes=4)
        lvr = await pg.evaluate(LIVEN)
        run.check('main：重讀以後推搖桿走得動', moved >= 0.4, J({'moved': round(moved, 2), 'pushes': n, 'from': [s0['x'], s0['z']], 'to': [s1['x'], s1['z']], 'zone': s1['zone']}))
        res['walkFallbacks'] = lvr['fb']
        run.check('main：沒有 JS 例外', not errs, J(errs[:3]))
        res['console_errors'] = cons[:20]
        if cons: run.note('console error（前 5）：%s' % J(cons[:5]))
        res['rows_after_reload'] = await pg.evaluate("(window.__PL||[])")
    except Exception as e:
        run.check('main：跑完（沒有探針例外）', False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, 'main_exception')
        except Exception: pass
        res['errs'] = errs[:5]
    finally:
        with open(os.path.join(OUT, 'transcript_main.json'), 'w', encoding='utf-8') as f:
            json.dump(res, f, ensure_ascii=False, indent=1)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass
    return res


async def main():
    run = L.Run('day9_' + '+'.join(CASES), OUT); os.makedirs(OUT, exist_ok=True)
    print('==== N6 第 9 天存檔（SHA %s）URL %s LOAD %s ====' % (os.environ.get('SHA', '?'), URL, LOAD), flush=True)
    if 'turbo' in URL: run.note('注意：URL 有 turbo（這一項要實玩、不用 turbo）')
    if not os.path.exists(SAVE): run.check('存檔檔案存在', False, SAVE); sys.exit(run.finish())
    async with async_playwright() as p:
        for c in CASES:
            print('---- %s ----' % c, flush=True)
            if c == 'main': await case_main(p, run)
            else: run.note('不認得的 case：%s' % c)
    print('SHA', os.environ.get('SHA', '?'), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
