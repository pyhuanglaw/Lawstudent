"""CC（帳號 A）11-02：#15「儲存空間不足」瀏覽器探針（BUG-SAVE-QUOTA-1102，開發分支 781bd3039 起；受測 888d14c38）。
修改前基準：781bd3039 的上一個 commit（autosave 寫不進去＝安靜失敗；欄位／快速存檔失敗一律「存檔失敗（瀏覽器儲存不可用）」；沒有刪除鈕；habits 不修剪）。
Node 證據：docs/story_planning/test_tools/cc/m5_save_size.js、m5b_quota_recheck.js。
讀碼看到的規則（888d14c38 src/game3d.js）：
  write(key,obj)：setItem 丟 QuotaExceededError（name／code 22／1014）＝GM.saveErr 'quota'，其他例外＝'other'，沒有 localStorage＝'nostore'，成功＝null。
  GM.SAVE_FULL_TEXT＝「儲存空間不足，這次沒有存進去。到選單 → 存檔，刪掉不用的欄位或備份，或先「匯出存檔檔案」留一份。」
  autosave：失敗＝toast「自動存檔：」＋SAVE_FULL_TEXT（quota）或「自動存檔失敗（瀏覽器儲存不可用）」，6 秒；GM.autoFailAt＝Date.now()（實際時間），
            5 分鐘內再失敗不再跳；存成功 autoFailAt＝0。自然的觸發：主迴圈每 45 秒（performance.now()-GM.lastAuto>45000，選單開著＝E.paused 不跑）、
            換區域（enter 結尾，含讀檔）、回標題、分頁切到背景。
  saveSlot(i)：有舊的先寫 fatiao3d_backup；toast「已存到欄位 i」或 GM.saveFailText()（quota＝SAVE_FULL_TEXT）。quickSave 同（💾 → 快速存檔）。
  renderSlots：自動存檔、快速存檔兩列只有「讀取」；欄位 1–3 有「存檔」「讀取」「刪除」；備份列有「讀取」「刪除」。
  delSave：confirm('刪除「<名稱>」？刪掉就讀不回來了。')，取消＝不刪。
  讀檔 migrate → EVENTS.habitTrim：place:／seat:／table:／meal: 鍵超過 HABIT_MAX(300) 個刪最久沒用的；HABIT_KEEP（seat:boya:study、meal:noodle、meal:xiaofu:fri）
            和其他種類（invite:、retake:、kai_supper…）不刪。
不是 iPhone：Playwright 手機橫向模擬（暫時設定檔，localStorage 一開始是空的；只碰這個暫時設定檔的 localStorage）。URL 用 '<URL>/index.html?turbo'。

CASES（逗號隔開，每個 case 開新的瀏覽器；預設 estimate,fill_auto,fill_slot,fill_quick,delete_then_save,big_old）：
  estimate   【前置】最小存檔（2026-10-03（六）10:00 宿舍，大二上；SAVE=<json> 可以改用一份真的存檔）讀進來（讀檔本身會自動存檔一次）
             → 記 navigator.storage.estimate()、localStorage 每個鍵的字元數、GAME.snapshot() JSON 字元數。只記不判定。
  fill_auto  【前置】同上讀檔 →【前置】刪掉 fatiao3d_auto（不然同大小的覆蓋可能剛好寫得進去）→【前置】用 cc_fill_* 塞滿 localStorage 到 QuotaExceededError
             （塊越切越小到 FILL_MIN 字元；再試寫一份存檔大小的字串要失敗＝前置成立）→ 等主迴圈的自然自動存檔（45 秒一次；等 AUTO_WAIT 秒還沒有才用
             【捷徑】GAME.autosave()）→ toast「自動存檔：儲存空間不足…」（橫向截圖）、GM.saveErr 'quota' → 之後 5 分鐘內的自動存檔（照樣等自然的）都不再跳
             → REAL5=1（預設）：照實際時間等過 5 分鐘（程式用 Date.now()，不用 page.clock：page.clock 會連 requestAnimationFrame 一起停）；
               5 分鐘前切直向，過 5 分鐘後第一次自動存檔要再跳一次（直向截圖）。REAL5=0：第二次以後【捷徑】把 GAME.autoFailAt 撥回 301 秒前。
  fill_slot  【前置】讀檔 → 選單「存檔」頁（選單開著遊戲暫停，主迴圈的自動存檔不會插進來）→【前置】塞滿 → 按「欄位 1」的「存檔」→ toast＝SAVE_FULL_TEXT
             （不是「存檔失敗（瀏覽器儲存不可用）」）、GM.saveErr 'quota'、欄位 1 還是空的；橫向按一次截圖、切直向再按一次截圖。
  fill_quick 【前置】讀檔 →【前置】塞滿 → 右上 💾 →「快速存檔」→ toast＝SAVE_FULL_TEXT；橫向、直向各按一次截圖（遊戲沒暫停：自動存檔的 toast 可能一起出現，全部記）。
  delete_then_save 【前置】讀檔 → 💾「快速存檔」、選單欄位 1、欄位 2「存檔」（塞之前，照玩家按）→【前置】塞滿 → 先存一次欄位 1（記結果：覆蓋同大小可能寫得進去，
             但 fatiao3d_backup 那一份應該寫不進去）→ 存檔頁 DOM：自動存檔、快速存檔兩列沒有「刪除」，欄位有（直向＋橫向截圖）→ 欄位 2「刪除」：
             confirm 先按取消（記 confirm 文字；欄位 2 還在）→ 再按確定（欄位 2 不見、toast「已刪除「欄位 2」」）→ 再存欄位 1：toast「已存到欄位 1」、
             saveErr null、fatiao3d_backup 寫進去了（空出來的空間真的被用到）。
  big_old    【前置】讀檔後拿 GAME.snapshot() 加 1000 個習慣鍵（seat:<區>:@x,z 700 個、place:<區>:with:anonN 300 個，每個 days 60 筆）＋保留鍵
             seat:boya:study、meal:noodle、meal:xiaofu:fri（last 最舊：沒保護就會先被刪）＋其他種類 invite:kexin、retake:play、kai_supper，寫進 fatiao3d_slot_3
             → 選單「存檔」→ 欄位 3「讀取」（照玩家按）→ 沒有 JS 例外、讀進來 → 讀檔的換區域本身會自動存檔（沒有就等 45 秒，再沒有才【捷徑】GAME.autosave()）
             → fatiao3d_auto 的 habits 鍵數 ≤306、可刪的那幾類 ≤300、保留鍵和其他種類都在、fatiao3d_auto 比 slot_3 小。
  每個 case 最後清掉 cc_fill_*（finally 也清）。
修改前（781bd3039^）預期 FAIL：fill_auto 的 toast（安靜失敗）與 saveErr；fill_slot／fill_quick 的 toast 文字（會是「存檔失敗（瀏覽器儲存不可用）」）；
  delete_then_save 的刪除鈕／confirm（沒有刪除功能）；big_old 的鍵數 ≤306（沒有 habitTrim）。修改前 GM.saveErr 是 undefined（記成「(沒有 GM.saveErr)」）。
不確定、要實跑確認：
  1. Windows 上 Chromium 的 localStorage 上限（一般 5M 字元／10 MB）；塞的演算法自己適應，只要最後丟的是 QuotaExceededError。
  2. toast 用 #toast 的 MutationObserver 抓（遊戲內部呼叫的是區域函式 toast，不是 GAME.toast，包 GAME.toast 抓不到）；同一句重複顯示也會記（沒有去重）。
  3. 選單「存檔」頁的按鈕照 #saveSlots .item 裡 <b> 的名稱（「自動存檔」「快速存檔（右上 💾）」「欄位 1」…）＋按鈕文字（存檔／讀取／刪除）找；改字就要改這裡。
  4. 主迴圈 45 秒自動存檔在 SwiftShader 低幀率下照實際時間跑（performance.now）；選單、手機開著（E.paused）不跑。
  5. 自動存檔被跳過（劇情中 D.busyDepth>0）不會更新 GAME.lastAuto＝探針看不到那一次嘗試；用 quiet_events 讀檔降低機率。
  6. 塞滿以後遊戲別的地方（設定、手機）寫 localStorage 也可能失敗：JS 例外照記。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=fill_auto,...] python3 cc_quota15_probe.py '<URL>/index.html?turbo' <輸出資料夾>
其他環境變數：SAVE（一份存檔 JSON 的路徑，給 estimate／fill_* 當底）、FILL_MIN（256）、AUTO_WAIT（每次等自然自動存檔的秒數，100）、REAL5（1）、AUTO5_MAX（480）。"""
import os, sys, json, asyncio, time, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
CASES = [c.strip() for c in os.environ.get('CASES', 'estimate,fill_auto,fill_slot,fill_quick,delete_then_save,big_old').split(',') if c.strip()]
LAND = {'width': 844, 'height': 390}; PORT = {'width': 390, 'height': 844}
FULL0 = '儲存空間不足，這次沒有存進去。到選單 → 存檔，刪掉不用的欄位或備份，或先「匯出存檔檔案」留一份。'   # 頁面有 GAME.SAVE_FULL_TEXT 就用頁面的
OLDFAIL = '存檔失敗（瀏覽器儲存不可用）'
AUTO_PRE = '自動存檔'
DAYKEY = '2026-10-03'   # 大二上、星期六（沒有課）
FILL = 'cc_fill_'
KEEP = ['seat:boya:study', 'meal:noodle', 'meal:xiaofu:fri']; OTHER = ['invite:kexin', 'retake:play', 'kai_supper']
DLG = {'mode': 'accept', 'log': []}   # confirm 怎麼回：accept／dismiss（每一次都記文字）


# ---------------------------------------------------------------- 存檔（cc_makeup_probe 的 state_at，複製）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')


async def state_at(pg, key, h, zone, flags=None):
    d = await P.day_of(pg, key)
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}}
    F = st['flags'] = dict(BASEF)
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    F.update(flags or {})
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=None, weather='clear', stage='law', money=30000)
    st['visited'] = {z: True for z in VISITED}
    return st, d


async def load_base(pg, cdp, run, tag):
    sp = os.environ.get('SAVE')
    if sp:
        with open(sp, encoding='utf-8') as f: sv = json.load(f)
        st = sv.get('G', sv); st.pop('_stuck', None); st.pop('_busy', None)
        run.setup('[前置] %s：讀使用者給的存檔 %s（day %s %s %s）' % (tag, sp, st.get('day'), st.get('hour'), st.get('zone')))
    else:
        st, d = await state_at(pg, DAYKEY, 10.0, 'dorm')
        run.setup('[前置] %s：最小存檔 %s（%s）10:00 宿舍，quiet_events（關條件事件、手機自動打開：自動存檔在劇情中會被跳過）' % (tag, d['key'], d['term']))
    await L.load_state(pg, st, quiet_events=True, quiet_phone=True)
    await pg.wait_for_timeout(6000); await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
    await pg.evaluate(WATCH)


# ---------------------------------------------------------------- 頁面裡（只讀；塞／清只動 cc_fill_*）
WATCH = r"""(()=>{ if(window.__CCQ) return 'again'; window.__CCQ=1; window.__TO=[]; window.__AU=[];
  const te=document.getElementById('toast'); if(te) new MutationObserver(()=>{ window.__TO.push({t:(te.textContent||'').trim(),ms:Math.round(performance.now()),now:Date.now()}); }).observe(te,{childList:true,characterData:true,subtree:true});
  let la=GAME.lastAuto; setInterval(()=>{ if(GAME.lastAuto!==la){ la=GAME.lastAuto; window.__AU.push({ms:Math.round(performance.now()),now:Date.now(),err:('saveErr' in GAME)?GAME.saveErr:'(沒有 GM.saveErr)',failAt:GAME.autoFailAt||0,autoLen:(localStorage.getItem('fatiao3d_auto')||'').length}); } },200);
  return 'ok'; })()"""
LS = r"""(()=>{ let chars=0, fill=0, nf=0; const per={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i), v=localStorage.getItem(k)||''; const c=k.length+v.length; chars+=c;
  if(k.indexOf('cc_fill_')===0){ fill+=c; nf++; } else per[k]=c; } return {chars,fill,nfill:nf,per}; })()"""
ESTIMATE = "(async()=>{ try{ if(!navigator.storage||!navigator.storage.estimate) return '(沒有 navigator.storage.estimate)'; const e=await navigator.storage.estimate(); return {usage:e.usage,quota:e.quota,details:e.usageDetails||null}; }catch(e){ return 'ERR '+e.message; } })()"
SNAPLEN = "(()=>{ try{ return JSON.stringify(GAME.snapshot()).length; }catch(e){ return -1; } })()"
FILLJS = r"""(([pre,minc])=>{ let i=0; while(localStorage.getItem(pre+i)!==null) i++; let size=1<<21, n=0, total=0, err=null;
  while(size>=minc){ try{ localStorage.setItem(pre+i,'x'.repeat(size)); i++; n++; total+=size; }
    catch(e){ err={name:e.name,code:e.code,msg:String(e.message||'').slice(0,160)}; if(!(e.name==='QuotaExceededError'||e.code===22||e.code===1014)) break; size=Math.floor(size/2); } }
  return {n,total,err,stopAt:size}; })"""
CANWRITE = "(n=>{ try{ localStorage.setItem('cc_fill_probe','x'.repeat(n)); localStorage.removeItem('cc_fill_probe'); return true; }catch(e){ return e.name; } })"
CLEAN = "(()=>{ const ks=[]; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k&&k.indexOf('cc_fill_')===0) ks.push(k); } ks.forEach(k=>localStorage.removeItem(k)); return ks.length; })()"
GSTATE = "(()=>({saveErr:('saveErr' in GAME)?GAME.saveErr:'(沒有 GM.saveErr)',autoFailAt:GAME.autoFailAt||0,full:GAME.SAVE_FULL_TEXT||null,now:Date.now(),"\
         "keys:['fatiao3d_auto','fatiao3d_quick','fatiao3d_slot_1','fatiao3d_slot_2','fatiao3d_slot_3','fatiao3d_backup'].reduce((o,k)=>{ o[k]=(localStorage.getItem(k)||'').length; return o; },{})}))()"
SLOTS = r"""(()=>{ const out=[]; for(const id of ['saveSlots','saveBackups']){ const box=document.getElementById(id); if(!box) continue;
  for(const it of box.querySelectorAll('.item')){ const b=it.querySelector('b'); out.push({box:id,label:b?(b.textContent||'').trim():'',empty:!!it.querySelector('.muted')&&/（空）/.test(it.textContent||''),btns:[...it.querySelectorAll('button')].map(x=>(x.textContent||'').trim())}); } }
  return out; })()"""
BTN = "(([lab,txt])=>{ for(const it of document.querySelectorAll('#saveSlots .item, #saveBackups .item')){ const b=it.querySelector('b'); if(!b||(b.textContent||'').trim()!==lab) continue; const x=[...it.querySelectorAll('button')].find(e=>(e.textContent||'').trim()===txt); if(!x) return null;"\
      " x.scrollIntoView({block:'center'}); const r=x.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; } return null; })"


async def now_ms(pg): return await pg.evaluate("Math.round(performance.now())")
async def toasts_since(pg, ms0): return await pg.evaluate("ms=>(window.__TO||[]).filter(x=>x.ms>=ms)", ms0)
async def au_n(pg): return await pg.evaluate("(window.__AU||[]).length")
async def au_rows(pg, n0=0): return await pg.evaluate("n=>(window.__AU||[]).slice(n)", n0)


async def wait_toast(pg, ms0, pred, max_s=10):
    t0 = time.time(); T = []
    while time.time() - t0 < max_s:
        T = await toasts_since(pg, ms0)
        if any(pred(x['t']) for x in T): break
        await pg.wait_for_timeout(300)
    return T


async def full_text(pg):
    return (await pg.evaluate("GAME.SAVE_FULL_TEXT||null")) or FULL0


async def fill(pg, run, tag):
    snap = await pg.evaluate(SNAPLEN)
    r = await pg.evaluate(FILLJS, [FILL, ENVI('FILL_MIN', 256)])
    cw = await pg.evaluate(CANWRITE, max(1000, snap))
    ls = await pg.evaluate(LS)
    run.setup('[前置] %s：用 cc_fill_* 塞滿 localStorage：%s；之後試寫一份存檔大小（%d 字元）的字串＝%s；localStorage 共 %d 字元（cc_fill %d）'
              % (tag, J(r), snap, cw, ls['chars'], ls['fill']))
    run.check('%s：前置成立（塞到 QuotaExceededError、一份存檔大小寫不進去）' % tag, bool(r['err']) and r['err']['name'] == 'QuotaExceededError' and cw is not True, J({'fill': r, 'canWrite': cw}))
    return {'fill': r, 'canWrite': cw, 'snapLen': snap, 'ls': ls}


async def clean(pg, run, tag):
    n = await pg.evaluate(CLEAN); left = (await pg.evaluate(LS))['nfill']
    run.note('%s：清掉 cc_fill_* %d 個，剩 %d 個' % (tag, n, left)); return left


async def tap_xy(pg, cdp, js, arg):
    c = await pg.evaluate(js, arg)
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200); return True


async def open_save_tab(pg, cdp):
    if await pg.evaluate("document.getElementById('menu').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1200)
    await L.tap(pg, cdp, '#menu .tabs button[data-tab="save"]'); await pg.wait_for_timeout(1000)
    return await pg.evaluate(SLOTS)


async def close_menu(pg, cdp):
    if not await pg.evaluate("document.getElementById('menu').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnClose'); await pg.wait_for_timeout(1000)


async def slot_btn(pg, cdp, run, lab, txt):
    ok = await tap_xy(pg, cdp, BTN, [lab, txt])
    run.note('按「%s」的「%s」：%s' % (lab, txt, '按了' if ok else '找不到這個按鈕')); return ok


async def quick_save(pg, cdp, run):
    await L.tap(pg, cdp, '#btnQuick'); await pg.wait_for_timeout(800)
    ok = await L.tap(pg, cdp, '#btnQuickSave'); await pg.wait_for_timeout(1200)
    run.note('💾 →「快速存檔」：%s' % ('按了' if ok else '找不到按鈕')); return ok


async def shoot_both(pg, run, tag):
    a = await run.shot(pg, tag + '_land')
    await pg.set_viewport_size(PORT); await pg.wait_for_timeout(2000)
    b = await run.shot(pg, tag + '_port')
    await pg.set_viewport_size(LAND); await pg.wait_for_timeout(2000)
    return [a, b]


def dump(tag, **kw):
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, 'transcript_%s.json' % tag), 'w', encoding='utf-8') as f: json.dump(kw, f, ensure_ascii=False, indent=1)


async def wait_auto(pg, n0, max_s):
    t0 = time.time()
    while time.time() - t0 < max_s:
        if await au_n(pg) > n0: return (await au_rows(pg, n0))[0]
        await pg.wait_for_timeout(500)
    return None


async def auto_attempt(pg, run, tag, max_s, allow_short=True):
    """等下一次自動存檔（主迴圈 45 秒一次）；等不到才【捷徑】GAME.autosave()。回傳 (那一次的紀錄, 開始等的 ms, 是不是捷徑)"""
    n0 = await au_n(pg); ms0 = await now_ms(pg)
    a = await wait_auto(pg, n0, max_s); short = False
    if not a and allow_short:
        run.setup('【捷徑】%s：%d 秒內沒有自然的自動存檔 → GAME.autosave()' % (tag, max_s))
        await pg.evaluate("void GAME.autosave()"); short = True
        a = await wait_auto(pg, n0, 5)
    return a, ms0, short


# ---------------------------------------------------------------- CASES
async def case_estimate(pg, cdp, run):
    tag = 'estimate'; await load_base(pg, cdp, run, tag)
    a, ms0, short = await auto_attempt(pg, run, tag, ENVI('AUTO_WAIT', 100))
    est = await pg.evaluate(ESTIMATE); ls = await pg.evaluate(LS); snap = await pg.evaluate(SNAPLEN); g = await pg.evaluate(GSTATE)
    run.note('%s：estimate %s' % (tag, J(est)))
    run.note('%s：localStorage 共 %d 字元；各鍵 %s；GAME.snapshot() %d 字元；自動存檔 %s' % (tag, ls['chars'], J(ls['per']), snap, J(a)))
    run.check('%s：讀到 fatiao3d_auto（讀檔後自動存檔寫進去了）' % tag, (ls['per'].get('fatiao3d_auto') or 0) > 0, J(g['keys']))
    await run.shot(pg, tag + '_after_load')
    dump(tag, estimate=est, ls=ls, snapLen=snap, auto=a, g=g)


async def case_fill_auto(pg, cdp, run):
    tag = 'fill_auto'; await load_base(pg, cdp, run, tag); full = await full_text(pg); want = AUTO_PRE + '：' + full
    g0 = await pg.evaluate(GSTATE)
    await pg.evaluate("localStorage.removeItem('fatiao3d_auto')")
    run.setup('[前置] %s：刪掉 fatiao3d_auto（原本 %d 字元；不刪的話同大小的覆蓋可能剛好寫得進去）' % (tag, g0['keys']['fatiao3d_auto']))
    fi = await fill(pg, run, tag); shots = {}; att = []
    try:
        # 第一次
        a1, ms1, s1 = await auto_attempt(pg, run, tag, ENVI('AUTO_WAIT', 100))
        T1 = await wait_toast(pg, a1['ms'] - 500 if a1 else ms1, lambda t: t.startswith(AUTO_PRE), 6)
        if any(t['t'].startswith(AUTO_PRE) for t in T1): shots['first_land'] = await run.shot(pg, tag + '_toast1_land')
        else: shots['first_none'] = await run.shot(pg, tag + '_after1_land')
        g1 = await pg.evaluate(GSTATE)
        run.note('%s：第一次自動存檔 %s（捷徑 %s）；toast %s；狀態 %s' % (tag, J(a1), s1, J([t['t'] for t in T1]), J(g1)))
        att.append({'n': 1, 'au': a1, 'short': s1, 'toasts': T1, 'g': g1})
        run.check('%s：第一次自動存檔失敗＝GM.saveErr \'quota\'（修改前預期 FAIL：沒有 saveErr）' % tag, bool(a1) and a1['err'] == 'quota', J(a1))
        run.check('%s：toast「自動存檔：儲存空間不足…」（全文＝「自動存檔：」＋SAVE_FULL_TEXT）（修改前預期 FAIL：安靜失敗）' % tag, any(t['t'] == want for t in T1), J([t['t'] for t in T1]))
        run.check('%s：fatiao3d_auto 沒有被寫進去（空間不足）' % tag, g1['keys']['fatiao3d_auto'] == 0, J(g1['keys']))
        fail_at = g1['autoFailAt'] or (a1 and a1['now']) or g1['now']
        # 5 分鐘內
        within, after = [], None; real5 = ENVI('REAL5', 1) == 1; t_end = time.time() + ENVI('AUTO5_MAX', 480); n = 1; ported = False
        while time.time() < t_end:
            if not real5 and n >= 2 and not ported:
                await pg.evaluate("t=>{ GAME.autoFailAt=t; }", (await pg.evaluate("Date.now()")) - 301000)
                run.setup('【捷徑】%s：REAL5=0 → GAME.autoFailAt 撥回 301 秒前（等於過了 5 分鐘）' % tag)
                await pg.set_viewport_size(PORT); await pg.wait_for_timeout(1500); ported = True
            nowj = await pg.evaluate("Date.now()")
            if real5 and not ported and nowj - fail_at > 300000 - 55000:
                await pg.set_viewport_size(PORT); await pg.wait_for_timeout(1500); ported = True
                run.note('%s：快到 5 分鐘（%.0f 秒），切直向等下一次' % (tag, (nowj - fail_at) / 1000))
            a, ms0, s = await auto_attempt(pg, run, tag, 70, allow_short=False)
            if not a: continue
            n += 1
            T = await wait_toast(pg, a['ms'] - 500, lambda t: t.startswith(AUTO_PRE), 5)
            Ta = [t for t in T if t['t'].startswith(AUTO_PRE)]
            el = (a['now'] - fail_at) / 1000.0
            rec = {'n': n, 'au': a, 'elapsed_s': round(el, 1), 'toasts': T, 'saveErr': a['err']}
            att.append(rec); run.note('%s：第 %d 次自動存檔，距離第一次跳 %.1f 秒，toast %s，saveErr %s' % (tag, n, el, J([t['t'] for t in T]), a['err']))
            if el < 300 and (a['failAt'] or 0) == fail_at:
                within.append(rec)
                if len(within) == 1: shots['within_land' if not ported else 'within_port'] = await run.shot(pg, tag + '_within5_%d' % n)
            else:
                after = rec
                shots['after5'] = await run.shot(pg, tag + '_toast_after5_' + ('port' if ported else 'land'))
                break
        await pg.set_viewport_size(LAND); await pg.wait_for_timeout(1500)
        run.check('%s：5 分鐘內有再自動存檔（至少一次，給下一條檢查用）' % tag, bool(within), J([r['elapsed_s'] for r in within]))
        run.check('%s：5 分鐘內的自動存檔不再跳 toast' % tag, bool(within) and all(not any(t['t'].startswith(AUTO_PRE) for t in r['toasts']) for r in within),
                  J([[r['elapsed_s'], [t['t'] for t in r['toasts']]] for r in within]))
        run.check('%s：過了 5 分鐘（%s）第一次自動存檔再跳一次（直向截圖）' % (tag, '實際時間' if real5 else '【捷徑】撥 autoFailAt'),
                  bool(after) and any(t['t'] == want for t in after['toasts']), J(after))
    finally:
        left = await clean(pg, run, tag)
    run.check('%s：cc_fill_* 清乾淨' % tag, left == 0, str(left))
    dump(tag, fill=fi, attempts=att, toasts=await toasts_since(pg, 0), shots=shots, before=g0)


async def case_fill_slot(pg, cdp, run):
    tag = 'fill_slot'; await load_base(pg, cdp, run, tag); full = await full_text(pg); shots = {}; res = []
    s0 = await open_save_tab(pg, cdp); run.note('%s：存檔頁 %s' % (tag, J(s0)))
    fi = await fill(pg, run, tag)
    try:
        for vp, nm in ((LAND, 'land'), (PORT, 'port')):
            await pg.set_viewport_size(vp); await pg.wait_for_timeout(1500)
            ms0 = await now_ms(pg); ok = await slot_btn(pg, cdp, run, '欄位 1', '存檔')
            T = await wait_toast(pg, ms0, lambda t: t == full or t == OLDFAIL or t.startswith('已存到'), 8)
            shots[nm] = await run.shot(pg, '%s_toast_%s' % (tag, nm)); g = await pg.evaluate(GSTATE)
            run.note('%s（%s）：toast %s；狀態 %s' % (tag, nm, J([t['t'] for t in T]), J(g)))
            res.append({'vp': nm, 'tapped': ok, 'toasts': T, 'g': g})
            run.check('%s（%s）：toast＝SAVE_FULL_TEXT（修改前預期 FAIL：「%s」）' % (tag, nm, OLDFAIL), any(t['t'] == full for t in T), J([t['t'] for t in T]))
            run.check('%s（%s）：沒有出現「%s」' % (tag, nm, OLDFAIL), not any(t['t'] == OLDFAIL for t in T), J([t['t'] for t in T]))
            run.check('%s（%s）：GM.saveErr＝\'quota\'、欄位 1 還是空的' % (tag, nm), g['saveErr'] == 'quota' and g['keys']['fatiao3d_slot_1'] == 0, J(g))
        await pg.set_viewport_size(LAND); await pg.wait_for_timeout(1000)
    finally:
        left = await clean(pg, run, tag)
    run.check('%s：cc_fill_* 清乾淨' % tag, left == 0, str(left))
    dump(tag, fill=fi, results=res, slots_before=s0, shots=shots)


async def case_fill_quick(pg, cdp, run):
    tag = 'fill_quick'; await load_base(pg, cdp, run, tag); full = await full_text(pg); shots = {}; res = []
    fi = await fill(pg, run, tag)
    try:
        for vp, nm in ((LAND, 'land'), (PORT, 'port')):
            await pg.set_viewport_size(vp); await pg.wait_for_timeout(1500); await L.close_panels(pg, cdp)
            ms0 = await now_ms(pg); ok = await quick_save(pg, cdp, run)
            T = await wait_toast(pg, ms0, lambda t: t == full or t == OLDFAIL or t.startswith('已快速存檔'), 9)
            shots[nm] = await run.shot(pg, '%s_toast_%s' % (tag, nm)); g = await pg.evaluate(GSTATE)
            run.note('%s（%s）：toast %s；狀態 %s' % (tag, nm, J([t['t'] for t in T]), J(g)))
            res.append({'vp': nm, 'tapped': ok, 'toasts': T, 'g': g})
            run.check('%s（%s）：toast＝SAVE_FULL_TEXT（修改前預期 FAIL：「%s」）' % (tag, nm, OLDFAIL), any(t['t'] == full for t in T), J([t['t'] for t in T]))
            run.check('%s（%s）：沒有出現「%s」' % (tag, nm, OLDFAIL), not any(t['t'] == OLDFAIL for t in T), J([t['t'] for t in T]))
            run.check('%s（%s）：快速存檔沒有寫進去（fatiao3d_quick 0 字元）' % (tag, nm), g['keys']['fatiao3d_quick'] == 0, J(g['keys']))
            run.note('%s（%s）：同時出現的自動存檔 toast（只記）%s' % (tag, nm, J([t['t'] for t in T if t['t'].startswith(AUTO_PRE)])))
        await pg.set_viewport_size(LAND); await pg.wait_for_timeout(1000)
    finally:
        left = await clean(pg, run, tag)
    run.check('%s：cc_fill_* 清乾淨' % tag, left == 0, str(left))
    dump(tag, fill=fi, results=res, shots=shots)


async def case_delete_then_save(pg, cdp, run):
    tag = 'delete_then_save'; await load_base(pg, cdp, run, tag); full = await full_text(pg); shots = {}; log = {}
    await quick_save(pg, cdp, run)
    await open_save_tab(pg, cdp)
    for i in (1, 2):
        ms0 = await now_ms(pg); await slot_btn(pg, cdp, run, '欄位 %d' % i, '存檔')
        T = await wait_toast(pg, ms0, lambda t: t.startswith('已存到') or t == full or t == OLDFAIL, 6); log['save%d_pre' % i] = [t['t'] for t in T]
    g0 = await pg.evaluate(GSTATE); run.note('%s：塞之前 %s；toast %s' % (tag, J(g0), J(log)))
    run.check('%s：前置（塞之前欄位 1、2、快速存檔都存好了）' % tag, all(g0['keys'][k] > 0 for k in ('fatiao3d_slot_1', 'fatiao3d_slot_2', 'fatiao3d_quick')), J(g0['keys']))
    fi = await fill(pg, run, tag)
    try:
        ms0 = await now_ms(pg); await slot_btn(pg, cdp, run, '欄位 1', '存檔')
        T = await wait_toast(pg, ms0, lambda t: t.startswith('已存到') or t == full or t == OLDFAIL, 8); g1 = await pg.evaluate(GSTATE)
        log['save1_full'] = {'toasts': [t['t'] for t in T], 'g': g1}
        run.note('%s：塞滿後、刪除前存欄位 1：toast %s；狀態 %s（只記：同大小覆蓋可能寫得進去；fatiao3d_backup 應該寫不進去）' % (tag, J([t['t'] for t in T]), J(g1)))
        run.check('%s：刪除前 fatiao3d_backup 寫不進去（空間真的滿了）' % tag, g1['keys']['fatiao3d_backup'] == 0, J(g1['keys']))
        rows = await pg.evaluate(SLOTS); log['rows'] = rows
        shots['rows'] = await shoot_both(pg, run, tag + '_rows')
        await open_save_tab(pg, cdp)
        R = {r['label']: r for r in rows if r['box'] == 'saveSlots'}
        auto = next((r for k, r in R.items() if k.startswith('自動存檔')), None); quick = next((r for k, r in R.items() if k.startswith('快速存檔')), None)
        run.note('%s：存檔頁 %s' % (tag, J(rows)))
        run.check('%s：自動存檔、快速存檔兩列有「讀取」、沒有「刪除」' % tag, bool(auto) and bool(quick) and '讀取' in auto['btns'] and '讀取' in quick['btns'] and '刪除' not in auto['btns'] and '刪除' not in quick['btns'], J([auto, quick]))
        run.check('%s：欄位 1、欄位 2 有「刪除」（修改前預期 FAIL：沒有刪除鈕）' % tag, all(R.get(k) and '刪除' in R[k]['btns'] for k in ('欄位 1', '欄位 2')), J([R.get('欄位 1'), R.get('欄位 2')]))
        run.note('%s：備份列（只記）%s' % (tag, J([r for r in rows if r['box'] == 'saveBackups'])))
        # 刪欄位 2：先取消
        DLG['mode'] = 'dismiss'; nd = len(DLG['log'])
        await slot_btn(pg, cdp, run, '欄位 2', '刪除'); await pg.wait_for_timeout(800)
        gA = await pg.evaluate(GSTATE); dA = DLG['log'][nd:]
        run.note('%s：刪除欄位 2 → confirm %s → 按取消；欄位 2 %d 字元' % (tag, J(dA), gA['keys']['fatiao3d_slot_2']))
        run.check('%s：按「刪除」有 confirm（文字「刪除「欄位 2」？刪掉就讀不回來了。」）' % tag, bool(dA) and dA[0]['type'] == 'confirm' and dA[0]['msg'] == '刪除「欄位 2」？刪掉就讀不回來了。', J(dA))
        run.check('%s：confirm 按取消＝欄位 2 還在' % tag, gA['keys']['fatiao3d_slot_2'] > 0, J(gA['keys']))
        # 再按確定
        DLG['mode'] = 'accept'; nd = len(DLG['log']); ms0 = await now_ms(pg)
        await slot_btn(pg, cdp, run, '欄位 2', '刪除')
        T = await wait_toast(pg, ms0, lambda t: t.startswith('已刪除'), 6); gB = await pg.evaluate(GSTATE); dB = DLG['log'][nd:]
        shots['deleted'] = await run.shot(pg, tag + '_deleted_land')
        run.note('%s：再刪一次 → confirm %s → 確定；toast %s；狀態 %s' % (tag, J(dB), J([t['t'] for t in T]), J(gB)))
        run.check('%s：confirm 按確定＝欄位 2 刪掉、toast「已刪除「欄位 2」」' % tag, gB['keys']['fatiao3d_slot_2'] == 0 and any(t['t'] == '已刪除「欄位 2」' for t in T), J({'keys': gB['keys'], 'toasts': [t['t'] for t in T]}))
        # 再存欄位 1
        ms0 = await now_ms(pg); await slot_btn(pg, cdp, run, '欄位 1', '存檔')
        T = await wait_toast(pg, ms0, lambda t: t.startswith('已存到') or t == full or t == OLDFAIL, 8); gC = await pg.evaluate(GSTATE)
        shots['save_after'] = await shoot_both(pg, run, tag + '_save_after')
        run.note('%s：刪掉欄位 2 以後存欄位 1：toast %s；狀態 %s' % (tag, J([t['t'] for t in T]), J(gC)))
        run.check('%s：刪掉以後存欄位 1 成功（toast「已存到欄位 1」、saveErr null）' % tag, any(t['t'] == '已存到欄位 1' for t in T) and gC['saveErr'] is None, J({'toasts': [t['t'] for t in T], 'saveErr': gC['saveErr']}))
        run.check('%s：fatiao3d_backup（覆蓋前的欄位 1）這次寫進去了＝空出來的空間有用到' % tag, gC['keys']['fatiao3d_backup'] > 0, J(gC['keys']))
        log.update(afterCancel=gA, afterDelete=gB, afterSave=gC, dialogs=DLG['log'])
    finally:
        DLG['mode'] = 'accept'; left = await clean(pg, run, tag)
    run.check('%s：cc_fill_* 清乾淨' % tag, left == 0, str(left))
    dump(tag, fill=fi, log=log, before=g0, shots=shots)


BIGJS = r"""(([keep,other])=>{ const s=JSON.parse(JSON.stringify(GAME.snapshot())); const d=s.day|0, H=s.habits&&typeof s.habits==='object'?s.habits:(s.habits={}); const zs=['library','cafe','noodle','boya','dorm','linze','wancai','lawlib'];
  const days=last=>{ const a=[]; for(let i=59;i>=0;i--) a.push(last-i*3); return a; };
  for(let i=0;i<700;i++){ const k='seat:'+zs[i%zs.length]+':@'+(i%37)+','+Math.floor(i/37); const last=d-1-(i%400); H[k]={n:60,first:last-200,last,days:days(last)}; }
  for(let i=0;i<300;i++){ const k='place:'+zs[i%zs.length]+':with:anon'+i; const last=d-1-(i%400); H[k]={n:60,first:last-200,last,days:days(last)}; }
  for(const k of keep) H[k]={n:5,first:d-900,last:d-900,days:[d-904,d-903,d-902,d-901,d-900]};
  for(const k of other) H[k]={n:3,first:d-900,last:d-900,days:[d-902,d-901,d-900]};
  s.savedAt=Date.now()-86400000*3; const txt=JSON.stringify(s); localStorage.setItem('fatiao3d_slot_3',txt);
  const ks=Object.keys(H); return {len:txt.length,keys:ks.length,trim:ks.filter(k=>/^(place|seat|table|meal):/.test(k)&&!keep.includes(k)).length}; })"""
HAB = r"""(([key,keep,other])=>{ let H=null; if(key){ try{ const s=JSON.parse(localStorage.getItem(key)||'null'); H=s&&s.habits; }catch(e){ return 'ERR '+e.message; } } else H=GAME.G.habits;
  if(!H) return null; const ks=Object.keys(H); return {keys:ks.length,trim:ks.filter(k=>/^(place|seat|table|meal):/.test(k)&&!keep.includes(k)).length,keep:keep.filter(k=>k in H),other:other.filter(k=>k in H),
   len:key?(localStorage.getItem(key)||'').length:null,savedAt:key?(()=>{ try{ return JSON.parse(localStorage.getItem(key)).savedAt; }catch(e){ return null; } })():null}; })"""


async def case_big_old(pg, cdp, run, errs):
    tag = 'big_old'; await load_base(pg, cdp, run, tag)
    b = await pg.evaluate(BIGJS, [KEEP, OTHER])
    run.setup('[前置] %s：GAME.snapshot() 加 1000 個習慣鍵＋保留鍵 %s＋其他種類 %s，寫進 fatiao3d_slot_3：%s' % (tag, J(KEEP), J(OTHER), J(b)))
    a0 = await pg.evaluate(HAB, ['fatiao3d_auto', KEEP, OTHER]); n_err0 = len(errs)
    rows = await open_save_tab(pg, cdp); run.note('%s：存檔頁 %s' % (tag, J(rows)))
    shots = {'menu': await run.shot(pg, tag + '_menu_land')}
    n0 = await au_n(pg); ms0 = await now_ms(pg)
    ok = await slot_btn(pg, cdp, run, '欄位 3', '讀取')
    T = await wait_toast(pg, ms0, lambda t: t == '已讀取' or t.startswith('讀取失敗'), 60)
    await pg.wait_for_timeout(4000); await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
    gG = await pg.evaluate(HAB, [None, KEEP, OTHER])
    run.note('%s：讀檔 toast %s；讀進來 GAME.G.habits %s' % (tag, J([t['t'] for t in T]), J(gG)))
    run.check('%s：從選單欄位 3 讀進來（toast「已讀取」，沒有「讀取失敗」）' % tag, ok and any(t['t'] == '已讀取' for t in T), J([t['t'] for t in T]))
    a = await wait_auto(pg, n0, 3)
    if not a:
        a, _, short = await auto_attempt(pg, run, tag, ENVI('AUTO_WAIT', 100))
    else: short = False
    await pg.wait_for_timeout(800)
    h = await pg.evaluate(HAB, ['fatiao3d_auto', KEEP, OTHER])
    shots['after'] = await shoot_both(pg, run, tag + '_after_load')
    run.note('%s：自動存檔 %s（捷徑 %s）；fatiao3d_auto 之前 %s → 之後 %s' % (tag, J(a), short, J(a0), J(h)))
    run.check('%s：讀檔後沒有 JS 例外' % tag, len(errs) == n_err0, J(errs[n_err0:n_err0 + 3]))
    run.check('%s：讀檔後有自動存檔（fatiao3d_auto 是讀進來的那一份：savedAt 比讀檔晚）' % tag, bool(a) and bool(h) and (h.get('savedAt') or 0) > (a0 or {}).get('savedAt', 0), J({'au': a, 'before': a0, 'after': h}))
    run.check('%s：fatiao3d_auto 的 habits 鍵數 ≤306、可刪那幾類 ≤300（修改前預期 FAIL）' % tag, bool(h) and h['keys'] <= 306 and h['trim'] <= 300, J(h))
    run.check('%s：保留鍵 %s 都還在' % (tag, '、'.join(KEEP)), bool(h) and h['keep'] == KEEP, J(h and h['keep']))
    run.check('%s：其他種類 %s 都還在' % (tag, '、'.join(OTHER)), bool(h) and h['other'] == OTHER, J(h and h['other']))
    run.check('%s：fatiao3d_auto 比 slot_3 小（%s < %s）' % (tag, h and h['len'], b['len']), bool(h) and h['len'] < b['len'], '')
    dump(tag, built=b, auto_before=a0, game=gG, auto_after=h, au=a, toasts=T, shots=shots, rows=rows)


CASEFN = {'estimate': case_estimate, 'fill_auto': case_fill_auto, 'fill_slot': case_fill_slot, 'fill_quick': case_fill_quick, 'delete_then_save': case_delete_then_save}


async def on_dialog(dd):
    DLG['log'].append({'type': dd.type, 'msg': dd.message, 'answer': DLG['mode']})
    try:
        if DLG['mode'] == 'dismiss': await dd.dismiss()
        else: await dd.accept()
    except Exception: pass


async def main():
    run = L.Run('quota15_' + '+'.join(CASES), OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        for cs in CASES:
            if cs not in CASEFN and cs != 'big_old':
                run.check('CASE %s 認得' % cs, False, '可以用：' + ','.join(list(CASEFN) + ['big_old'])); continue
            print('==== CASE %s（SHA %s）====' % (cs, os.environ.get('SHA', '?')), flush=True)
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            DLG['mode'] = 'accept'; DLG['log'] = []
            pg.on('dialog', lambda dd: asyncio.ensure_future(on_dialog(dd)))
            try:
                await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % cs, ok)
                await pg.evaluate("localStorage.clear()")   # 只有這個暫時設定檔的 localStorage
                await P.init(pg)
                if cs == 'big_old': await case_big_old(pg, cdp, run, errs)
                else: await CASEFN[cs](pg, cdp, run)
            except Exception as e:
                run.check('%s：跑完（沒有探針例外）' % cs, False, repr(e)[:500]); traceback.print_exc()
                try: await run.shot(pg, cs + '_exception')
                except Exception: pass
                try: await pg.evaluate(CLEAN)
                except Exception: pass
            run.check('%s：沒有 JS 例外' % cs, not errs, J(errs[:3]))
            if DLG['log']: run.note('%s：對話框 %s' % (cs, J(DLG['log'])))
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
    print('SHA', os.environ.get('SHA', '?'), 'CASES', ','.join(CASES), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
