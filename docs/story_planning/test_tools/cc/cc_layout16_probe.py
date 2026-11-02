"""CC（帳號 A）11-02：K2 考試版面修正（開發分支 e3a9289ef 以後）的瀏覽器探針。
受測：e3a9289ef「考試版面：橫向坐著考試題目移到左欄、ADV 選項扣左右 safe-area、想起課本再選前題目再出現（CC K2）」以後。
修改前基準：e3a9289ef 的父 commit（e27dd033e）。Node 字串檢查：tests/exam_land_seat_unit.js、tests/books_unit.js 6c。
估算來源：docs/story_planning/CC/CC_K2_exam_overflow.md、docs/story_planning/test_tools/cc/k2_exam_overflow.js（題目清單）。
不是 iPhone：Playwright 手機模擬（is_mobile、觸控；使用者 Windows 電腦用 GPU，tools/cc_local/gpu_wrap.py），URL 用 '<URL>/index.html?turbo'。

讀碼看到的規則（e3a9289ef）：
  classes3d.js S.runExam：GM.say(null,'i／5　'+q.q) → GM.choose(選項（A）…)。題目來自 S.drawExam：R.exam['學期:課:final'].qs 已經有 5 個題庫裡找得到的 id＝照那 5 題、照那個順序。
  game3d.js renderChoose：選單出現時，上一句（題目）若 1.5 秒內剛點掉＝keep：#dlg 加 .static 留在下方、選單墊高；下一幀量到選單放不下（scrollHeight>clientHeight+4）：
    修改後：不是 ADV（body 沒有 .adv-on）、innerWidth>600、innerWidth−選單寬−42≥260 ＝ #dlg 加 .side（靠左、寬＝100%−選單寬−42−左右 safe-area），題目不收；其他照舊收（.hide）。
    選完（done）：#choices .hide、#dlg 拿掉 static、side 並收起；下一次 renderChoose 一開始也拿掉 side。
    修改前：放不下一律收（.hide）——座位上（非 ADV）沒有「紀錄」，選的時候看不到題目。
  adv3d.js：.adv-on #choices 寬＝min(400, 100%−max(14,safe-left)−max(14,safe-right))；橫向 4 個以上選項（兩欄 grid）寬＝100%−max(14,safe-left)−max(14,safe-right)（上限 860）。
    修改前：兩欄 grid 寬 100%−28，left＝max(14,safe-left) → 瀏海機（左右 47）右緣 47+816＝863 > 844（估計超出畫面 19 px）。
  「想起課本」（S.runExam recall）：有那一科的教科書（G.flags.books[CLS.bookTitle(c)]）、期末／補考、第一次選錯、選項 >2：拿掉選錯的那一個 →
    say（你想起課本上那一段。旁邊還有你自己畫的線。）→ 修改後多一句 say('i／5　'+q.q) → 再 choose。修改前：第二次選單時 keep 留的是旁白那一句，看不到題目。

CASES（逗號隔開；每一趟開一個新的瀏覽器；預設 seat_exam,adv_safe,recall2）：
  seat_exam  QS（預設 Y4LSO_08,BBAI_NEG_03,Y4TAX_06）× SEAT_ORIENTS（預設 land,port）。每一趟：
             【前置】最小存檔：那門課那一學期（Y4S1 勞動社會法、財稅法；Y3S2 票據法），R.exam['學期:課:final'].qs＝[指定題, 同一份題庫的另外 4 題]（第 1 題＝指定題），
                     選修的 choice 群組選那門課；日期＝CLS.examDay（期末考那一天），時間＝那一節開始前 6 分鐘、宿舍；條件事件關掉（quiet_events）。
             EXAM_ROUTE＝goclass（預設）：照玩家按手機「今天」那一堂的出發鈕（CLS.goClass；按鈕不在＝【捷徑】直接呼叫 CLS.goClass(forced)，遊戲帶進考場的同一條路）
                     → 座位選單選第一個座位 → 坐下 → 上課＝考試（非 ADV）。GO_MAX 秒內沒有出現第 1 題＝退回 direct（記下來）。
             EXAM_ROUTE＝direct：【捷徑】讀檔到那間教室，GAME.sceneBegin()＋CLS.runExam(GAME,it)（同一個 say／choose，沒有坐下）。
             量：題目那一句打完字（點之前）#dlg 的位置＝基準；點掉 → 選項出現、版面穩定（連兩次量一樣）→ 量 #dlg、#dlgText、#choices、每個按鈕的 boundingClientRect、class、
                 #dlgText 上 5 個點的 elementFromPoint 是不是 #dlg 裡面；截圖 → 按正解 → 量 #choices 收起、#dlg 沒有 side；下一題那一句打完字時 #dlg 的位置＝回到基準。
             check（橫向）：題目可見（#dlg 沒有 .hide、看得到、文字含題幹）；題目在左欄（#dlg 右緣 ≤ #choices 左緣）；選項不覆蓋題目（矩形不相交、取樣點最上層是 #dlg）；
                 選項（#choices 與每個按鈕）在 viewport 內；選完 #choices 收起、#dlg 沒有 side；下一句 #dlg 的位置和基準一樣（±2 px）。
             check（直向）：題目可見、選項不覆蓋題目、選項在 viewport 內（直向不該有 side；只記）。
  adv_safe   ADV_QS（預設 Y4LSO_08,BBAI_NEG_03）、橫向。【前置】同 seat_exam 的存檔、讀檔到那間教室；【捷徑】GAME.sceneBegin({adv:true})＋CLS.runExam
             （＝classes3d.js attend 門口上課 door:true 的開法：ADV.begin({background:'blur',right:true})）。
             safe-area 模擬（ADV_SAFE＝左,右,下，預設 47,47,21）：先試 CDP Emulation.setSafeAreaInsetsOverride（Chromium 新版才有）；量探針元素 padding:env(...) 對上＝用它。
             不行＝退回把頁面所有 <style> 文字裡的 env(safe-area-inset-X) 換成 px（index.html、adv3d.js 注入的那一份；renderChoose 執行時寫的 inline style 裡的 env() 換不到＝0，報告寫明）。
             量：選項出現、版面穩定 → #choices 的 computed display／grid-template-columns／left／width、每個按鈕右緣、左緣。
             check：每個按鈕右緣 ≤ innerWidth（844）；右緣 ≤ innerWidth−safe 右（797）；左緣 ≥ safe 左（47）；#choices 是兩欄 grid（只記）。
             ADV_NOSAFE=1 另跑一趟 safe-area 0 的對照（只記）。
  recall2    RECALL_Q（預設 Y4LSO_08）× RECALL_ORIENTS（預設 land,port）。【前置】同 seat_exam，另外 G.flags.books[CLS.bookTitle(c)]＝true（有那一科的教科書）；
             路線照 EXAM_ROUTE（同 seat_exam）。第 1 題故意按錯（【捷徑】讀題庫正解，只讀）→ 旁白「（你想起課本上那一段。…）」→ 第二次選單出現、版面穩定 →
             截圖＋DOM：#dlg 看不看得到、#dlgText 文字、#choices 選項、版面矩形。
             check：旁白之後下一句 say 是「1／5　題幹」（transcript）；第二次選單出現時畫面上看得到的 #dlgText 含題幹；第二次選單少一個選項、沒有選錯的那一個。

每一趟都記：window.innerWidth／innerHeight、visualViewport、探針元素的 env(safe-area-inset-*) 計算值、#dlg／#choices 的 computed left／width／transform。
check 只客觀記錄（不判定企劃）。

修改前（e27dd033e）預期 FAIL：
  seat_exam 橫向：Y4LSO_08、BBAI_NEG_03「題目可見」FAIL（#dlg 被加 .hide）；「在左欄」「不相交」因為題目不見，照實記 FAIL（不是 N/A）。
               Y4TAX_06：K2 估算差 1 px（208 vs 上限 205+4＝209），修改前可能留得住＝可能 PASS；結果照實記。直向三題修改前後都應該 PASS。
  adv_safe：模擬 safe-area 47 時「右緣 ≤ 844」「右緣 ≤ 797」FAIL（估計右緣 863）。對照（safe 0）右緣 830，修改前後都 PASS。
  recall2：「旁白之後是題目那一句」FAIL；「第二次選單看得到題幹」FAIL（留的是旁白那一句，或被收掉）。
不確定處：
  ・字寬：沙盒／Windows 的字型（Noto Sans TC 載不到時的 fallback）和 iPhone 的 PingFang TC 不同，題幹、選項幾行不保證和 K2 估算一樣；門檻很敏感（K2 3.3 節）。
  ・keep 要在點掉題目 1.5 秒內出選單：turbo＋低幀率時理論上可能超過 1.5 秒＝不 keep（#dlg 直接收）。transcript 會記 keep 與否（#dlg 有沒有 .static）。
  ・goclass 路線：L202（法律系館A 202）／WMULTI 的座位選單、坐下流程沒有實測過；走不通退回 direct（沒有坐下，版面只看 ADV 與否，照讀碼一樣）。
  ・Emulation.setSafeAreaInsetsOverride 是實驗性 CDP 指令，Chromium 版本不夠新會失敗＝退回 CSS 改寫；兩種模擬都不是 iPhone 真的瀏海。
  ・recall2 直向：修改後題目那一句也是 keep（不 side），放得下就留、放不下照舊收——直向估計放得下。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=seat_exam,...] python3 cc_layout16_probe.py '<URL>/index.html?turbo' <輸出資料夾>
等待上限（秒）：GO_MAX（goclass 到第 1 題，300）、Q_MAX（題目出現，120）、STABLE_MAX（版面穩定，10）。"""
import os, sys, json, asyncio, time, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
LST = lambda k, d: [c.strip() for c in os.environ.get(k, d).split(',') if c.strip()]
CASES = LST('CASES', 'seat_exam,adv_safe,recall2')
QS = LST('QS', 'Y4LSO_08,BBAI_NEG_03,Y4TAX_06')
SEAT_ORIENTS = LST('SEAT_ORIENTS', 'land,port')
ADV_QS = LST('ADV_QS', 'Y4LSO_08,BBAI_NEG_03')
ADV_SAFE = [int(x) for x in LST('ADV_SAFE', '47,47,21')]   # 左、右、下
RECALL_Q = os.environ.get('RECALL_Q', 'Y4LSO_08')
RECALL_ORIENTS = LST('RECALL_ORIENTS', 'land,port')
ROUTE = os.environ.get('EXAM_ROUTE', 'goclass')
R1 = '（你想起課本上那一段。旁邊還有你自己畫的線。）'
TOL = 2.0

# ---------------------------------------------------------------- 存檔（cc_makeup_probe 的 state_at，複製）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')


async def state_at(pg, key, h, zone, flags=None, pos=None):
    d = await P.day_of(pg, key)
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}}
    F = st['flags'] = dict(BASEF)
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    F.update(flags or {})
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=pos, weather='clear', stage='law', money=30000)
    st['visited'] = {z: True for z in VISITED}
    st['courses'] = {'done': {}, 'attend': {}, 'prep': {}, 'electives': {}, 'note': {}, 'disc': {}, 'ask': {}, 'late': {}, 'abs': {}, 'exam': {}, 'grades': {}}
    return st, d


async def load(pg, cdp, st):
    try: await L.load_state(pg, st, quiet_events=True, quiet_phone=True)
    except TypeError: await L.load_state(pg, st, quiet_events=True)   # 舊版 playlib 沒有 quiet_phone
    await pg.wait_for_timeout(3000)
    try: await L.phone_away(pg, cdp, tries=2)
    except Exception: pass


# 題目資料（只讀）：那一題的課、學期、題庫裡同一份範圍的另外 4 題、正解是第幾個選項、課本書名、教室
QINFO = r"""(qid=>{ try{ const q=EXAM_BANK.questions.find(x=>x.id===qid); if(!q) return {err:'EXAM_BANK 沒有 '+qid};
  const c=CLS.byId(q.course); if(!c) return {err:'COURSES 沒有 '+q.course};
  const p=CLS.examPool(q.course,q.term,'final'), all=p.cls.concat(p.bank,p.ai); const inPool=all.some(x=>x.id===qid);
  const others=all.filter(x=>x.id!==qid).slice(0,4).map(x=>x.id);
  const keys=q.type==='tf'||!q.options?['對','錯']:Object.keys(q.options); const opts=q.type==='tf'||!q.options?['對','錯']:keys.map(k=>'（'+k+'）'+q.options[k]);
  const room=(COURSES.rooms||{})[c.room]||{};
  return {id:qid,course:q.course,name:c.name,term:q.term,q:String(q.q),opts,answer:q.answer,right:keys.findIndex(k=>String(k)===String(q.answer)),inPool,poolN:all.length,others,
    choice:c.choice||null,book:CLS.bookTitle?CLS.bookTitle(c):null,room:{id:c.room,zone:room.zone||null,name:room.name||null,door:!!room.door},slots:c.slots}; }catch(e){ return {err:String(e.message)}; } })"""
EXAMDAY = r"""(([cid,term])=>{ try{ const c=CLS.byId(cid); const d=CLS.examDay(GAME.G,c,term,'final'); if(!d) return null; const b=COURSES.blocks[d.block]||{};
  return {day:d.day,key:CALENDAR.dateOf(d.day).key,block:d.block,t0:b.t0,t1:b.t1,makeup:!!d.makeup}; }catch(e){ return {err:String(e.message)}; } })"""
DRAWCHK = r"""(([cid,term])=>{ try{ const d=CLS.drawExam(GAME.G,cid,term,'final'); return d.ok?d.qs.map(q=>q.id):{n:d.n}; }catch(e){ return {err:String(e.message)}; } })"""
GOITEM = r"""(cid=>{ try{ const it=CLS.goList(GAME.G).find(it=>it.c.id===cid&&it.exam); window.__IT=it||null; return it?{key:it.key,exam:it.exam,t0:it.t0,room:it.room&&it.room.name,status:CLS.status(GAME.G,it)}:null; }catch(e){ return {err:String(e.message)}; } })"""
GOFORCED = "(()=>{ if(!window.__IT) return false; void CLS.goClass(GAME,window.__IT,{forced:true}); return true; })()"
DIRECT = r"""(([cid,term,adv])=>{ const c=CLS.byId(cid), G=GAME.G, t=CALENDAR.termOf(G.day);
  const it={c,exam:'final',term,key:G.day+':'+cid+':probe',room:COURSES.rooms[c.room]||{},week:t&&t.week,t0:G.hour,t1:G.hour+1.5,day:G.day};
  window.__DIRECT_DONE=null; (async()=>{ GAME.sceneBegin(adv?{adv:true}:undefined); try{ window.__DIRECT_DONE=await CLS.runExam(GAME,it); }catch(e){ window.__DIRECT_DONE={err:String(e.message)}; } finally { GAME.sceneEnd(); } })();
  return true; })"""

# 記錄（只記不改）：GAME.say／choose
HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[];
  const push=o=>{ try{ o.h=+(+GAME.G.hour).toFixed(3); o.ms=Math.round(performance.now()); window.__PL.push(o); }catch(e){} };
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>(x.t||x.text)||'')}); return c0.apply(this,arguments); };
  return 'ok'; })()"""
PL = "(n=>(window.__PL||[]).slice(n))"

# 版面量測（只讀）
LAYOUT = r"""(()=>{ const $=id=>document.getElementById(id);
  const R=e=>{ if(!e) return null; const b=e.getBoundingClientRect(); return {l:+b.left.toFixed(1),t:+b.top.toFixed(1),r:+b.right.toFixed(1),b:+b.bottom.toFixed(1),w:+b.width.toFixed(1),h:+b.height.toFixed(1)}; };
  const vis=e=>{ if(!e) return false; const cs=getComputedStyle(e), b=e.getBoundingClientRect(); return cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>0.05&&b.width>0&&b.height>0&&!e.classList.contains('hide'); };
  let pr=document.getElementById('__safeProbe'); if(!pr){ pr=document.createElement('div'); pr.id='__safeProbe'; pr.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right);padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)'; document.body.appendChild(pr); }
  const pc=getComputedStyle(pr); const safe={l:parseFloat(pc.paddingLeft)||0,r:parseFloat(pc.paddingRight)||0,t:parseFloat(pc.paddingTop)||0,b:parseFloat(pc.paddingBottom)||0};
  const dlg=$('dlg'), tx=$('dlgText'), ch=$('choices'); const dcs=getComputedStyle(dlg), ccs=getComputedStyle(ch);
  const samp=[]; const tr=tx.getBoundingClientRect(); const peDlg=getComputedStyle(dlg).pointerEvents; const peSt=document.createElement('style'); peSt.textContent='#dlg,#dlg *,#choices,#choices *{pointer-events:auto!important}'; document.head.appendChild(peSt); /* #dlg 是 pointer-events:none 時 elementFromPoint 會穿過去（雲端 12:0x：取樣點落在畫布 #c）——量的時候暫時打開，量完移除 */ if(vis(dlg)&&tr.width>0&&tr.height>0){ for(const [fx,fy] of [[.1,.3],[.5,.3],[.9,.3],[.3,.8],[.7,.8]]){ const x=tr.left+tr.width*fx, y=tr.top+tr.height*fy; const e=document.elementFromPoint(x,y); samp.push({x:+x.toFixed(1),y:+y.toFixed(1),inDlg:!!(e&&dlg.contains(e)),inCh:!!(e&&ch.contains(e)),el:e?(e.id||e.tagName):null}); } } peSt.remove();
  const vv=window.visualViewport?{w:visualViewport.width,h:visualViewport.height,ox:visualViewport.offsetLeft,oy:visualViewport.offsetTop}:null;
  return {W:innerWidth,H:innerHeight,vv,safe,adv:document.body.classList.contains('adv-on'),spriteLeft:document.body.classList.contains('spriteLeft'),
    dlg:{rect:R(dlg),cls:[...dlg.classList],vis:vis(dlg),text:(tx.textContent||''),next:($('dlgNext')||{style:{}}).style.visibility||'',left:dcs.left,width:dcs.width,transform:dcs.transform,opacity:dcs.opacity,textRect:R(tx),samples:samp,peDlg},
    ch:{rect:R(ch),cls:[...ch.classList],vis:vis(ch),display:ccs.display,grid:ccs.gridTemplateColumns,left:ccs.left,right:ccs.right,width:ccs.width,styleBottom:ch.style.bottom,styleMax:ch.style.maxHeight,
      scrollH:ch.scrollHeight,clientH:ch.clientHeight,scrollTop:ch.scrollTop,btns:[...ch.querySelectorAll('button')].map(b=>({t:(b.textContent||'').trim(),rect:R(b)}))},
    advTop:vis($('advTop'))}; })()"""
SIG = lambda m: J([m['W'], m['H'], m['dlg']['rect'], m['dlg']['cls'], m['ch']['rect'], m['ch']['cls'], [b['rect'] for b in m['ch']['btns']]])


def inter(a, b):
    if not a or not b: return False
    return min(a['r'], b['r']) - max(a['l'], b['l']) > 0.5 and min(a['b'], b['b']) - max(a['t'], b['t']) > 0.5


def inside(r, W, H):
    return bool(r) and r['l'] >= -0.5 and r['t'] >= -0.5 and r['r'] <= W + 0.5 and r['b'] <= H + 0.5


def short(m):
    """transcript 用的精簡版"""
    return {'W': m['W'], 'H': m['H'], 'safe': m['safe'], 'adv': m['adv'], 'dlg': {k: m['dlg'][k] for k in ('rect', 'cls', 'vis', 'left', 'width', 'transform')},
            'dlgText': m['dlg']['text'][:160], 'samples': m['dlg']['samples'],
            'ch': {k: m['ch'][k] for k in ('rect', 'cls', 'vis', 'display', 'grid', 'left', 'width', 'scrollH', 'clientH')}, 'btns': m['ch']['btns']}


async def stable_layout(pg, need_ch=True):
    """選單出現後等版面穩定（renderChoose 的下一幀會改 #dlg）：連兩次量到一樣、至少 1.2 秒"""
    t0 = time.time(); last = None; m = None
    while time.time() - t0 < ENVI('STABLE_MAX', 10):
        await pg.wait_for_timeout(400); m = await pg.evaluate(LAYOUT)
        if need_ch and not m['ch']['vis']: last = None; continue
        s = SIG(m)
        if s == last and time.time() - t0 > 1.2: return m, True
        last = s
    return m, False


async def pl_len(pg):
    return await pg.evaluate("(window.__PL||[]).length")


async def set_safe(pg, cdp, run, l, r, b, tag):
    """safe-area 模擬：CDP Emulation.setSafeAreaInsetsOverride → 量探針；不行就改寫 <style> 的 env()"""
    how = None; err = None
    try:
        await cdp.send('Emulation.setSafeAreaInsetsOverride', {'insets': {'top': 0, 'left': l, 'right': r, 'bottom': b}})
        await pg.wait_for_timeout(600); m = await pg.evaluate(LAYOUT)
        if abs(m['safe']['l'] - l) < 0.5 and abs(m['safe']['r'] - r) < 0.5: how = 'cdp'
        else: err = '探針量到 %s' % J(m['safe'])
    except Exception as e: err = repr(e)[:200]
    if not how:
        n = await pg.evaluate("""(([l,r,b])=>{ let n=0; for(const s of document.querySelectorAll('style')){ const t=s.textContent; if(!/env\\(safe-area-inset-/.test(t)) continue;
            s.textContent=t.replace(/env\\(safe-area-inset-left\\)/g,l+'px').replace(/env\\(safe-area-inset-right\\)/g,r+'px').replace(/env\\(safe-area-inset-bottom\\)/g,b+'px').replace(/env\\(safe-area-inset-top\\)/g,'0px'); n++; } return n; })""", [l, r, b])
        how = 'css-rewrite(%d 個 <style>)' % n
    run.setup('[前置] %s：safe-area 模擬 左 %d 右 %d 下 %d，方式＝%s%s' % (tag, l, r, b, how, ('；CDP 不行：' + err) if err and how != 'cdp' else ''))
    if how != 'cdp': run.note('%s：CSS 改寫模擬＝renderChoose 執行時寫的 inline style（bottom、max-height）裡的 env() 仍是 0；探針元素（env()）也量到 0，以注入值為準' % tag)
    return how


async def prepare(pg, cdp, run, tag, qid, route, books=False):
    """【前置】最小存檔＋R.exam 預先寫好 5 題（第 1 題＝qid）。route：goclass＝期末考那天、開始前 6 分鐘在宿舍；direct＝那天、在那間教室"""
    qi = await pg.evaluate(QINFO, qid)
    if qi.get('err'): run.check('%s：讀得到題目 %s' % (tag, qid), False, J(qi)); return None
    if not qi['inPool'] or len(qi['others']) < 4: run.check('%s：%s 在期末範圍、題庫 ≥5 題' % (tag, qid), False, J(qi)); return None
    term, cid = qi['term'], qi['course']
    base = (await P.day_of(pg, [term, 10, 2]))['key']
    st, d = await state_at(pg, base, 10.0, 'dorm')
    if qi['choice']: st['courses']['electives'][qi['choice']['group']] = cid
    await load(pg, cdp, st)
    ed = await pg.evaluate(EXAMDAY, [cid, term])
    if not ed or ed.get('err'):
        run.note('%s：CLS.examDay 沒有期末考日（%s）→ 用 %s 第 10 週週二' % (tag, J(ed), term)); ed = {'key': base, 't0': 13 + 20 / 60, 'block': '?'}
    qs = [qid] + qi['others']
    flags = {'examSeed': 777}
    if books and qi['book']: flags['books'] = {qi['book']: True}
    zone = 'dorm' if route == 'goclass' else (qi['room']['zone'] or 'linze')
    h = (ed['t0'] - 0.1) if route == 'goclass' else (ed['t0'] + 0.02)
    st, d = await state_at(pg, ed['key'], h, zone, flags)
    if qi['choice']: st['courses']['electives'][qi['choice']['group']] = cid
    st['courses']['exam']['%s:%s:final' % (term, cid)] = {'qs': qs}
    await load(pg, cdp, st)
    got = await pg.evaluate(DRAWCHK, [cid, term]); z = await pg.evaluate("GAME.G.zone")
    run.setup('[前置] %s：最小存檔 %s %.2f 時 %s（%s %s 期末考日 %s 第 %s 節）；R.exam[%s:%s:final].qs＝%s（第 1 題＝%s）；%s條件事件關掉'
              % (tag, ed['key'], h, z, qi['name'], term, ed['key'], ed.get('block'), term, cid, J(qs), qid, ('有教科書《%s》；' % qi['book']) if books else ''))
    run.check('%s：前置成立（CLS.drawExam 照預先寫好的 5 題、第 1 題＝%s）' % (tag, qid), isinstance(got, list) and got[:1] == [qid], J(got))
    if zone != z: run.note('%s：讀檔後區域是 %s（要的是 %s）' % (tag, z, zone))
    qi['examDay'] = ed; qi['qs'] = qs
    return qi


async def start_exam(pg, cdp, run, tag, qi, route, adv=False):
    """開始考試：goclass（手機「今天」出發鈕 → 座位 → 考試）或 direct（【捷徑】runExam）。回傳實際用的路線"""
    if route == 'goclass' and not adv:
        it = await pg.evaluate(GOITEM, qi['course'])
        run.note('%s：goList 那一堂 %s' % (tag, J(it)))
        if it and not it.get('err'):
            await P.phone_tab(pg, cdp, 'today'); sel = '#phoneBody [data-go="%s"]' % it['key']
            if await pg.evaluate("s=>!!document.querySelector(s)", sel):
                await L.tap(pg, cdp, sel); run.note('%s：手機「今天」按 %s 的出發鈕' % (tag, it['key'])); return 'goclass'
            try: await L.close_panels(pg, cdp)
            except Exception: pass
            await pg.evaluate(GOFORCED); run.setup('【捷徑】%s：手機「今天」沒有那一堂的按鈕 → 直接呼叫 CLS.goClass(GAME,it,{forced:true})（考試帶進考場的同一條路）' % tag); return 'goclass-forced'
        run.note('%s：goList 找不到那一堂考試 → 改 direct' % tag)
        st, d = await state_at(pg, qi['examDay']['key'], qi['examDay']['t0'] + 0.02, qi['room']['zone'] or 'linze', {'examSeed': 777, **({'books': {qi['book']: True}} if qi.get('_books') else {})})
        if qi['choice']: st['courses']['electives'][qi['choice']['group']] = qi['course']
        st['courses']['exam']['%s:%s:final' % (qi['term'], qi['course'])] = {'qs': qi['qs']}
        await load(pg, cdp, st)
    await pg.evaluate(DIRECT, [qi['course'], qi['term'], adv])
    run.setup('【捷徑】%s：在 %s 直接 GAME.sceneBegin(%s)＋CLS.runExam(GAME,it)（沒有走座位流程）' % (tag, await pg.evaluate("GAME.G.zone"), '{adv:true}' if adv else ''))
    return 'direct'


async def wait_q1(pg, cdp, run, tag, qi, max_s):
    """推進到第 1 題那一句打完字（座位選單選第一個座位；其他對話點掉）。回傳 True＝第 1 題在畫面上、打完字"""
    want = '1／5　' + qi['q']; t0 = time.time()
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if s['dlg'] and s['txt'].startswith('1／5　'):
            m = await pg.evaluate(LAYOUT)
            if m['dlg']['next'] == 'visible' or m['dlg']['text'] == want: return True
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue   # 第一下：打完字
        if s['ch']:
            T = [o['t'] for o in s['ch']]
            k = next((i for i, t in enumerate(T) if not t.startswith('自己找位子') and not t.startswith('算了')), 0)
            run.note('%s：選單 %s → %s' % (tag, J([t[:24] for t in T]), T[k][:24])); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if s['phone'] and not s['dlg']:
            await L.phone_away(pg, cdp, tries=2); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(800)
    return False


async def finish_say(pg, cdp, prefix, max_s=90):   # 30→90：PC headed 幀率較低（R6_layout headed Y4TAX_06_port、雲端 lay_seat2 都在這裡逾時）
    """等某一句（開頭）出來並打完字"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if s['dlg'] and s['txt'].startswith(prefix):
            m = await pg.evaluate(LAYOUT)
            if m['dlg']['next'] == 'visible': return m
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
        if s['dlg'] and not s['txt'].startswith(prefix): await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        await pg.wait_for_timeout(400)
    return None


def dump(tag, **kw):
    kw.setdefault('sha', os.environ.get('SHA', '?')); kw['case'] = tag
    with open(os.path.join(OUT, 'transcript_%s.json' % tag), 'w', encoding='utf-8') as f: json.dump(kw, f, ensure_ascii=False, indent=1)


def layout_checks(run, tag, m, qtext, land, side_expected):
    W, H = m['W'], m['H']; d = m['dlg']; c = m['ch']; ok_vis = d['vis'] and qtext[:20] in d['text']
    run.check('%s：選項出現時題目仍可見（#dlg 沒有 .hide、看得到、文字含題幹）' % tag, ok_vis, J({'cls': d['cls'], 'vis': d['vis'], 'text': d['text'][:60]}))
    if land and side_expected:
        # game3d.js renderChoose：只有選項放不下（會捲動）才把題目移到左欄（side）；放得下時題目留在原位、選項在上面（R6_rr PC Y4TAX_06／recall2：static、不重疊）
        side = 'side' in d['cls']
        run.check('%s：題目在左欄（有 side 時 #dlg 右緣 ≤ #choices 左緣；沒有 side＝選項放得下，題目和選項不重疊）' % tag,
                  ok_vis and ((side and d['rect']['r'] <= c['rect']['l'] + 0.5) or (not side and not inter(d['rect'], c['rect']))), J({'dlg': d['rect'], 'ch': c['rect'], 'cls': d['cls']}))
    hit = [b['t'][:12] for b in c['btns'] if inter(d['rect'], b['rect'])]
    samp_ok = bool(d['samples']) and all(x['inDlg'] for x in d['samples'])
    run.check('%s：選項不覆蓋題目（#dlg 和 #choices／每個按鈕矩形不相交、題目上取樣點最上層是 #dlg）' % tag,
              ok_vis and not inter(d['rect'], c['rect']) and not hit and samp_ok, J({'dlg': d['rect'], 'ch': c['rect'], 'hitBtns': hit, 'samples': d['samples']}))
    out = [b['t'][:12] for b in c['btns'] if not inside(b['rect'], W, H)]
    run.check('%s：選項不超出 viewport（#choices 與每個按鈕在 %dx%d 內）' % (tag, W, H), inside(c['rect'], W, H) and not out,
              J({'ch': c['rect'], 'out': out, 'scroll': [c['scrollH'], c['clientH']]}))


# ---------------------------------------------------------------- seat_exam／recall2 共用的一趟
async def exam_pass(p, run, case, qid, orient, books=False):
    tag = '%s_%s_%s' % (case, qid, orient); land = orient == 'land'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    rec = {'qid': qid, 'orient': orient, 'route_req': ROUTE}
    try:
        await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % tag, ok)
        await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
        if ENVI('SEAT_SAFE', 0) and case == 'seat_exam': await set_safe(pg, cdp, run, ADV_SAFE[0], ADV_SAFE[1], ADV_SAFE[2], tag)
        qi = await prepare(pg, cdp, run, tag, qid, ROUTE, books)
        if not qi: return
        qi['_books'] = books; rec['q'] = {k: qi[k] for k in ('id', 'course', 'name', 'term', 'q', 'opts', 'answer', 'right', 'room', 'examDay', 'qs')}
        n0 = await pl_len(pg)
        route = await start_exam(pg, cdp, run, tag, qi, ROUTE); rec['route'] = route
        got = await wait_q1(pg, cdp, run, tag, qi, ENVI('GO_MAX', 300) if route.startswith('goclass') else ENVI('Q_MAX', 120))
        if not got and route.startswith('goclass'):
            s = await P.ts(pg); free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0
            run.note('%s：goclass %d 秒內沒有第 1 題（%s）' % (tag, ENVI('GO_MAX', 300), J({k: s[k] for k in ('dlg', 'txt', 'busy', 'depth', 'zone')})))
            rec['goclass_fail_shot'] = await run.shot(pg, tag + '_goclass_fail')
            if free:
                qi2 = await prepare(pg, cdp, run, tag + '_direct', qid, 'direct', books)
                if qi2: route = await start_exam(pg, cdp, run, tag, qi2, 'direct'); rec['route'] = 'direct(退回)'; got = await wait_q1(pg, cdp, run, tag, qi, ENVI('Q_MAX', 120))
        run.check('%s：第 1 題（%s）出現在畫面上' % (tag, qid), got)
        if not got: return
        base = await pg.evaluate(LAYOUT); rec['base'] = short(base); rec['shots'] = {'q_say': await run.shot(pg, tag + '_q1_say')}
        rec['seat'] = await pg.evaluate("(()=>{ const P=GAME.E.player; return {pose:P.pose||null,seat:!!(P.seat||P.sitting),zone:GAME.G.zone}; })()")
        await L.tap(pg, cdp, '#dlg')   # 點掉題目 → 選項出現
        m, stable = await stable_layout(pg); rec['choose'] = short(m); rec['stable'] = stable
        rec['keep'] = 'static' in m['dlg']['cls']
        rec['shots']['choices'] = await run.shot(pg, tag + '_q1_choices')
        run.note('%s：選項出現（穩定 %s）innerWidth %s innerHeight %s safe %s；#dlg cls %s rect %s；#choices rect %s'
                 % (tag, stable, m['W'], m['H'], J(m['safe']), J(m['dlg']['cls']), J(m['dlg']['rect']), J(m['ch']['rect'])))
        if not books:   # ------------- seat_exam
            layout_checks(run, tag, m, qi['q'], land, True)
            k = qi['right'] if 0 <= qi['right'] < len(m['ch']['btns']) else 0
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1500)
            a = await pg.evaluate(LAYOUT); rec['after'] = short(a)
            run.check('%s：選完 #choices 收起、#dlg 沒有 side' % tag, not a['ch']['vis'] and 'side' not in a['dlg']['cls'], J({'ch': a['ch']['cls'], 'dlg': a['dlg']['cls']}))
            nx = await finish_say(pg, cdp, '2／5　')
            if nx:
                rec['next'] = short(nx); rec['shots']['next_say'] = await run.shot(pg, tag + '_q2_say')
                br, nr = base['dlg']['rect'], nx['dlg']['rect']
                run.check('%s：下一題那一句 #dlg 回到原位（left、bottom 和第 1 題那一句一樣 ±%g px、沒有 side／static）' % (tag, TOL),
                          abs(br['l'] - nr['l']) <= TOL and abs(br['b'] - nr['b']) <= TOL and abs(br['w'] - nr['w']) <= TOL and 'side' not in nx['dlg']['cls'] and 'static' not in nx['dlg']['cls'],
                          J({'base': br, 'next': nr, 'cls': nx['dlg']['cls']}))
            else: run.check('%s：第 2 題那一句出現' % tag, False)
        else:           # ------------- recall2
            wrong = next((i for i in range(len(m['ch']['btns'])) if i != qi['right']), 0)
            picked = m['ch']['btns'][wrong]['t'] if m['ch']['btns'] else None
            run.setup('【捷徑】%s：讀題庫正解（第 %d 個，只讀）→ 故意按第 %d 個「%s」' % (tag, qi['right'] + 1, wrong + 1, (picked or '')[:20]))
            n1 = await pl_len(pg); await P.tap_choice(pg, cdp, wrong)
            t0 = time.time(); m2 = None; nch = 0
            while time.time() - t0 < ENVI('Q_MAX', 120):
                R = await pg.evaluate(PL, n1); chs = [x for x in R if x['k'] == 'choose']
                s = await P.ts(pg)
                if chs and s['ch']:
                    m2, st2 = await stable_layout(pg); break
                if s['dlg']:
                    mm = await pg.evaluate(LAYOUT)
                    if mm['dlg']['text'] == R1 and mm['dlg']['next'] == 'visible' and 'r1' not in rec.get('shots', {}): rec['shots']['r1'] = await run.shot(pg, tag + '_recall_line')
                    await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
                await pg.wait_for_timeout(500)
            R = await pg.evaluate(PL, n1); says = [x['t'] for x in R if x['k'] == 'say']; rec['says_between'] = says; rec['choose_rows'] = [x for x in R if x['k'] == 'choose']
            if not m2: run.check('%s：第二次選單出現' % tag, False, J(says)); return
            rec['choose2'] = short(m2); rec['shots']['choices2'] = await run.shot(pg, tag + '_recall_choices2')
            i = says.index(R1) if R1 in says else -1
            run.check('%s：旁白「（你想起課本上那一段。…）」之後下一句是「1／5　題幹」' % tag, i >= 0 and i + 1 < len(says) and says[i + 1] == '1／5　' + qi['q'], J(says))
            d2 = m2['dlg']; seen = d2['vis'] and qi['q'][:20] in d2['text']
            run.check('%s：第二次選單出現時畫面上看得到題幹（#dlg 看得到、#dlgText 含題幹）' % tag, seen, J({'cls': d2['cls'], 'vis': d2['vis'], 'text': d2['text'][:80]}))
            bt = [x['t'] for x in m2['ch']['btns']]
            run.check('%s：第二次選單少一個選項、沒有選錯的那一個' % tag, len(bt) == len(qi['opts']) - 1 and picked not in bt, J({'btns': bt, 'picked': picked}))
            if seen and land: layout_checks(run, tag + '_2nd', m2, qi['q'], land, True)
            run.note('%s：第二次選單畫面文字（#dlgText）＝%s；選項 %s' % (tag, J(d2['text'][:120]), J(bt)))
    except Exception as e:
        run.check('%s：跑完（沒有探針例外）' % tag, False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, tag + '_exception')
        except Exception: pass
    finally:
        rec['notes_errs'] = errs[:5]
        run.check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3]))
        try: rec['transcript'] = await pg.evaluate("(window.__PL||[]).slice(-60)")
        except Exception: pass
        dump(tag, **rec)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


# ---------------------------------------------------------------- adv_safe
async def adv_pass(p, run, qid, safe):
    l, r, bt = safe; tag = 'adv_safe_%s_%s' % (qid, 'safe%d' % l if l or r else 'nosafe')
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    rec = {'qid': qid, 'safe_req': safe}
    try:
        await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % tag, ok)
        await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
        qi = await prepare(pg, cdp, run, tag, qid, 'direct')
        if not qi: return
        rec['q'] = {k: qi[k] for k in ('id', 'course', 'term', 'q', 'opts', 'room')}
        rec['safe_how'] = await set_safe(pg, cdp, run, l, r, bt, tag) if (l or r or bt) else 'none'
        await start_exam(pg, cdp, run, tag, qi, 'direct', adv=True)
        got = await wait_q1(pg, cdp, run, tag, qi, ENVI('Q_MAX', 120))
        run.check('%s：第 1 題出現（ADV）' % tag, got)
        if not got: return
        rec['shots'] = {'q_say': await run.shot(pg, tag + '_q1_say')}
        await L.tap(pg, cdp, '#dlg')
        m, stable = await stable_layout(pg); rec['choose'] = short(m); rec['stable'] = stable
        rec['shots']['choices'] = await run.shot(pg, tag + '_q1_choices')
        W = m['W']; sl = l if rec['safe_how'] != 'cdp' else m['safe']['l']; sr = r if rec['safe_how'] != 'cdp' else m['safe']['r']
        btn = [{'t': x['t'][:14], 'l': x['rect']['l'], 'r': x['rect']['r']} for x in m['ch']['btns']]
        run.note('%s：ADV %s；innerWidth %s safe(探針) %s 模擬 左%s 右%s；#choices display %s grid %s left %s width %s rect %s；按鈕 %s'
                 % (tag, m['adv'], W, J(m['safe']), sl, sr, m['ch']['display'], m['ch']['grid'], m['ch']['left'], m['ch']['width'], J(m['ch']['rect']), J(btn)))
        run.check('%s：ADV 開著（body.adv-on）' % tag, m['adv'])
        run.check('%s：（只記）4 個以上選項＝兩欄 grid' % tag, True, J({'display': m['ch']['display'], 'grid': m['ch']['grid'], 'n': len(btn)}))
        mx = max([x['r'] for x in btn] or [0]); mn = min([x['l'] for x in btn] or [0])
        run.check('%s：每個按鈕右緣 ≤ innerWidth %s' % (tag, W), bool(btn) and mx <= W + 0.5, J({'maxRight': mx, 'chRect': m['ch']['rect']}))
        if sl or sr:
            run.check('%s：每個按鈕右緣 ≤ innerWidth − safe 右（%s）' % (tag, W - sr), bool(btn) and mx <= W - sr + 0.5, J({'maxRight': mx}))
            run.check('%s：每個按鈕左緣 ≥ safe 左（%s）' % (tag, sl), bool(btn) and mn >= sl - 0.5, J({'minLeft': mn}))
        run.check('%s：選項在 viewport 內（上下）' % tag, all(inside(x['rect'], W, m['H']) for x in m['ch']['btns']), J(m['ch']['rect']))
    except Exception as e:
        run.check('%s：跑完（沒有探針例外）' % tag, False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, tag + '_exception')
        except Exception: pass
    finally:
        run.check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3]))
        try: rec['transcript'] = await pg.evaluate("(window.__PL||[]).slice(-40)")
        except Exception: pass
        dump(tag, **rec)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


async def main():
    run = L.Run('layout16_' + '+'.join(CASES), OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        for cs in CASES:
            print('==== CASE %s（SHA %s，EXAM_ROUTE %s）====' % (cs, os.environ.get('SHA', '?'), ROUTE), flush=True)
            if cs == 'seat_exam':
                for q in QS:
                    for o in SEAT_ORIENTS: await exam_pass(p, run, 'seat_exam', q, o)
            elif cs == 'recall2':
                for o in RECALL_ORIENTS: await exam_pass(p, run, 'recall2', RECALL_Q, o, books=True)
            elif cs == 'adv_safe':
                for q in ADV_QS:
                    await adv_pass(p, run, q, ADV_SAFE)
                    if ENVI('ADV_NOSAFE', 0): await adv_pass(p, run, q, [0, 0, 0])
            else: run.check('CASE %s 認得' % cs, False, '可以用：seat_exam,adv_safe,recall2')
    print('SHA', os.environ.get('SHA', '?'), 'CASES', ','.join(CASES), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
