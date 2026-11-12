"""CC-C 11-12：HELP-GUIDE-1110（使用者 X268「遊戲中應該要有說明」；LAWWW-C 08:30 交排，結果給 BB 判）。Playwright（PC GPU）≠ iPhone。
PARTS（逗號分隔，預設全部）：
  HELP  選單「說明」分頁：橫向、直向各一組，從頂捲到底每一屏截一張；記節數、每一節有沒有字被切（scrollWidth＞clientWidth）、最後有沒有「Seed-san by VirtualCast, Inc.」那一行。
        直向：遊戲本來會蓋「請轉成橫向」，這裡把它拿掉看排版（照實記）。
  NEW   真的開新遊戲（標題「從法律系開始」）→ 對話照第一個選項一路按（最多 NEW_MIN 分鐘）→ 記到「可以自由活動」那一則（free）出現了沒、出現前有沒有別的提示。
  FLOW  【前置／捷徑】讀檔 FIX（預設 day36_1105）＋把 flags.HINT_SEEN 設成 {}（＝這份存檔一則都還沒看過；HINTS.rec 只在「沒有這一欄」時才把基本幾種記成看過）→
        照玩：開手機（真的按手機鍵）、用掉一個時段【捷徑 CLS.slotUse，＝讀書／上課那些活動記時段的同一個函式】、快上課【捷徑 CLS.skipTo＝手機「跳過時間」同一個函式，跳到下一堂課前 36 分鐘】、
        花錢【捷徑 GAME.money(-60)，＝買東西扣錢的同一個函式】、存檔（真的按選單→存檔→欄位）；約人、去過三個地方、有人約你這些看存檔狀態的自己出。
        一次只做一件、等上一則出完 40 秒以後才做下一件（遊戲兩則之間至少隔 45 秒）。每一則出現時截圖，記實際顯示幾秒（#toast 那一行從出現到被換掉或收起來；LAWWW：會被下一個通知換掉）。
        最後把自動存檔讀回來再等 50 秒：看過的不能再出。
  SET   同 FLOW 的讀檔 → 4 秒內到選單「設定」把「提示」關掉（真的點）→ 開手機、存檔、等 60 秒：一則都不能出、HINT_SEEN 不能記 → 打開 → 60 秒內還沒看過的要出。結束時設定改回打開。
  OLD   讀 OLD_FIX（預設 day51_1110，沒有 HINT_SEEN 的舊存檔，已經玩了一陣子）→ 開手機、存檔、等 100 秒：基本幾種都不能出；最多考試、沒錢各一次。
  DLG   同 FLOW 的讀檔 → 馬上開一段對話【捷徑 GAME.say，遊戲自己的對話框】停 15 秒：對話中不能出 → 按掉 → 15 秒內 free 要出。
CC_02 清單 2026-11-12：1✓（讀檔時間＝存檔原本的；快上課用遊戲的跳過時間） 2✓（提示字從 HELP_TEXT.hints 讀，對照用字不寫死） 3✓（一次做一件、等 45 秒間隔） 4✓（按鈕照 id：#btnPhone、#btnMenu、data-tab、#setHints；存檔欄位按鈕照字找） 5n/a（不走路） 6✓（讀檔後等 FIRST_MS 4 秒、tick 每 30 格） 7✓ 8✓（門檻是 LAWWW 給的：每種一次、不重複、關掉不出、舊存檔不連跳、劇情中不出；顯示秒數只記不判） 9n/a（截圖要看提示條，不藏東西） 10✓（條件事件關掉，免得劇情把提示擋住） 11✓ 12✓（每一則記種類、遊戲時間、真實時間、顯示秒數、截圖檔名） 13✓（捷徑都標【捷徑】寫是哪個遊戲函式；r3：NEW 收起自動打開的手機、FLOW 做一件等那一則出來再做下一件、顯示秒數記被誰換掉；r2：FLOW 從 7:30 開始〔r1 9:05 已在上課沒有快上課可跳〕、NEW 15 分鐘〔r1 6 分鐘還在宿營〕）
用法：LW_TESTS=<wt>/tests SHA=<sha> [PARTS=HELP,NEW,FLOW,SET,OLD,DLG] [FIX=tests/fixtures/user_save_day36_1105.json] [OLD_FIX=…day51_1110.json] [NEW_MIN=15] [FLOW_MIN=14] [FLOW_H=7.5] python3 cc_help_guide_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]
PARTS = [x for x in (os.environ.get('PARTS') or 'HELP,NEW,FLOW,SET,OLD,DLG').split(',') if x]
TESTS = os.environ.get('LW_TESTS') or 'tests'
FIX = os.environ.get('FIX') or 'tests/fixtures/user_save_day36_1105.json'
OLD_FIX = os.environ.get('OLD_FIX') or 'tests/fixtures/user_save_day51_1110.json'
NEW_MIN = float(os.environ.get('NEW_MIN') or '15'); FLOW_MIN = float(os.environ.get('FLOW_MIN') or '14')   # HELP_GUIDE_a r1：開局 6 分鐘還在宿營那一晚（按了 173 次）→ 15
FLOW_H = float(os.environ.get('FLOW_H') or '7.5')
R = L.Run('help_guide', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
TARGET = ['free', 'slot', 'cls', 'phone', 'invite', 'travel', 'buy', 'save']
BASIC = ['free', 'slot', 'cls', 'phone', 'invite', 'invited', 'travel', 'buy', 'save']


def fix_path(rel):
    for base in (os.path.dirname(TESTS), '.'):
        p = os.path.join(base, rel)
        if os.path.exists(p): return p
    return rel


APPLY = r"""(async(s)=>{ document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; await GAME.applySave(s); return {day:GAME.G.day, hour:GAME.G.hour, zone:GAME.G.zone, seen:JSON.stringify((GAME.G.flags||{}).HINT_SEEN||null)}; })"""
# 提示紀錄：包 GAME.toast（記誰叫的、哪一種）＋每 100 ms 看 #toast 那一行（算實際顯示多久）
HOOK = r"""(()=>{ const H=(typeof HELP_TEXT!=='undefined'&&HELP_TEXT.hints)||{}; const byTxt={}; for(const k in H) byTxt[H[k]]=k; window.__hk={log:[], seg:[], byTxt};
  if(!window.__hkW){ const t0=GAME.toast; GAME.toast=function(t,ms){ try{ const k=window.__hk.byTxt[String(t)]; window.__hk.log.push({t:performance.now(), k:k||null, txt:String(t).slice(0,60), day:GAME.G&&GAME.G.day, h:GAME.G&&+(+GAME.G.hour).toFixed(2), ms:ms||null}); }catch(e){} return t0.apply(this,arguments); }; window.__hkW=true;
    let cur=null; setInterval(()=>{ const el=document.getElementById('toast'); const vis=el&&!el.classList.contains('hide')&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).opacity!=='0'; const tx=vis?(el.textContent||''):''; const now=performance.now();
      if(!cur||cur.tx!==tx){ if(cur&&cur.tx) window.__hk.seg.push({tx:cur.tx.slice(0,60), k:window.__hk.byTxt[cur.tx]||null, s:+((now-cur.t)/1000).toFixed(1), next:tx.slice(0,40)}); cur={tx, t:now}; } },100); }
  return Object.keys(H); })()"""
STATE = r"""(()=>{ const G=GAME.G; return {log:window.__hk?window.__hk.log.filter(x=>x.k):[], seg:window.__hk?window.__hk.seg.filter(x=>x.k):[], pend:(typeof HINTS!=='undefined'&&HINTS._pending)?HINTS._pending():[],
  seen:JSON.stringify((G&&G.flags&&G.flags.HINT_SEEN)||null), now:performance.now(), day:G&&G.day, h:G&&+(+G.hour).toFixed(2), busy:(typeof HINTS!=='undefined')?HINTS.busy(GAME):null, on:(typeof HINTS!=='undefined')?HINTS.on(GAME):null}; })()"""
NEXTCLS = r"""(()=>{ const G=GAME.G; if(typeof CLS==='undefined'||!CLS.next) return null; const it=CLS.next(G); return it?{day:it.day, t0:it.t0, name:(it.c&&(it.c.name||it.c.id))||null, gday:G.day, h:+(+G.hour).toFixed(2)}:null; })()"""


async def load_fix(pg, cdp, path, seen_empty, hour=None):
    sv = json.load(open(fix_path(path), encoding='utf-8'))
    if hour is not None: sv['hour'] = hour; sv.pop('pos', None)   # HELP_GUIDE_b r1：day36 存檔 9:05 已經在上課＝沒有「快上課」可以跳 → FLOW 從 FLOW_H（預設 7.5）開始
    if seen_empty:
        sv.setdefault('flags', {})['HINT_SEEN'] = {}
    else:
        (sv.get('flags') or {}).pop('HINT_SEEN', None)
    r = await pg.evaluate(APPLY, sv)
    await pg.evaluate(HOOK)
    return r


async def st(pg):
    return await pg.evaluate(STATE)


async def snap(pg, name):
    try:
        await pg.screenshot(path=os.path.join(OUT, name + '.png'))
    except Exception as e:
        R.note('截圖 %s 失敗 %r' % (name, e))
    return name + '.png'


async def watch(pg, sec, tag, shots=True, seen_log=None):
    """等 sec 秒；每 0.3 秒看有沒有新的一則，新的就截圖。回傳這段時間新出的提示。"""
    seen_log = seen_log if seen_log is not None else []
    t_end = time.time() + sec; n0 = len((await st(pg))['log']); new = []
    while time.time() < t_end:
        s = await st(pg)
        for e in s['log'][n0:]:
            e['shot'] = await snap(pg, 'hint_%s_%02d_%s' % (tag, len(seen_log) + len(new) + 1, e['k'])) if shots else None
            new.append(e)
        n0 = len(s['log'])
        await pg.wait_for_timeout(300)
    seen_log.extend(new)
    return new


async def close_ui(pg, cdp):
    await pg.evaluate("(()=>{ for(const id of ['btnPhoneClose','btnClose']){ const b=document.getElementById(id); if(b&&b.offsetParent) b.click(); } })()")
    await pg.wait_for_timeout(500)


async def open_menu_tab(pg, cdp, tab):
    await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(600)
    await pg.click('#menu button[data-tab="%s"]' % tab); await pg.wait_for_timeout(500)


async def do_save(pg, cdp):
    await open_menu_tab(pg, cdp, 'save')
    txt = await pg.evaluate("""(()=>{ const bs=[...document.querySelectorAll('#saveSlots button')]; const b=bs.find(x=>/存/.test(x.textContent||'')&&!/讀|刪|匯/.test(x.textContent||'')); if(!b) return 'NONE: '+bs.map(x=>x.textContent).join('/'); b.click(); return b.textContent; })()""")
    await pg.wait_for_timeout(800); await close_ui(pg, cdp)
    return txt


async def do_phone(pg, cdp, tag):
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(2500)
    await snap(pg, 'phone_open_%s' % tag)
    await close_ui(pg, cdp)


def part_help_check(info, tag):
    R.check('[HELP %s] 說明頁有字（節數 %s）' % (tag, info['n']), info['n'] >= 12, J(info['titles']))
    R.check('[HELP %s] 沒有字被切（每一節 scrollWidth ≤ clientWidth）' % tag, not info['cut'], J(info['cut']))
    R.check('[HELP %s] 最後有 Seed-san by VirtualCast, Inc. 那一行' % tag, info['seed'], '')


HELPINFO = r"""(()=>{ const box=document.getElementById('helpBox'); if(!box) return null; const its=[...box.querySelectorAll('.item')];
  let sc=box; while(sc&&sc!==document.body&&!(sc.scrollHeight>sc.clientHeight+4&&/auto|scroll/.test(getComputedStyle(sc).overflowY))) sc=sc.parentElement; if(sc===document.body) sc=null; if(sc) sc.setAttribute('data-ccscroll','1');
  return {n:its.length-(its.some(i=>i.dataset.help==='licences')?1:0), titles:its.map(i=>(i.querySelector('b')||{}).textContent||''), cut:its.filter(i=>i.scrollWidth>i.clientWidth+1).map(i=>(i.querySelector('b')||{}).textContent||''),
    seed:/Seed-san by VirtualCast, Inc\./.test(box.textContent||''), scroller:sc?(sc.id||sc.className||sc.tagName):null, sh:sc?sc.scrollHeight:null, ch:sc?sc.clientHeight:null}; })()"""


async def part_help(pg, cdp, res):
    out = {}
    for tag, vp in (('land', None), ('port', {'width': 390, 'height': 844})):
        if vp: await pg.set_viewport_size(vp); await pg.wait_for_timeout(1500)
        await pg.evaluate("(()=>{ const r=document.getElementById('rotate'); if(r) r.classList.remove('want'); })()")
        await open_menu_tab(pg, cdp, 'help')
        info = await pg.evaluate(HELPINFO)
        if not R.check('[HELP %s] 找得到說明頁 #helpBox' % tag, bool(info), ''): continue
        shots = []
        if info['sh']:
            y = 0; i = 0
            while True:
                await pg.evaluate("(y=>{ const s=document.querySelector('[data-ccscroll]'); if(s) s.scrollTop=y; })(%d)" % y); await pg.wait_for_timeout(300)
                i += 1; shots.append(await snap(pg, 'help_%s_%02d' % (tag, i)))
                if y + info['ch'] >= info['sh'] or i >= 20: break
                y += max(100, info['ch'] - 40)
        else:
            shots.append(await snap(pg, 'help_%s_01' % tag))
        info['shots'] = shots; out[tag] = info
        R.note('[HELP %s] %s' % (tag, J(info)))
        part_help_check(info, tag)
        await close_ui(pg, cdp)
    await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(1500)
    res['HELP'] = out


async def part_new(pg, cdp, res):
    await pg.goto(URL); await L.wait_loaded(pg)
    await pg.evaluate(HOOK)
    R.setup('[NEW] 標題畫面按「從法律系開始」（真的開新遊戲），對話照第一個選項一路按，最多 %.0f 分鐘' % NEW_MIN)
    await pg.click('#btnNewLaw')
    t_end = time.time() + NEW_MIN * 60; got = None; steps = 0; phone_closed = 0
    while time.time() < t_end:
        s = await st(pg)
        ks = [e['k'] for e in s['log']]
        if 'free' in ks: got = s; break
        # HELP_GUIDE_new2：宿營那一晚有要回的訊息，遊戲自動打開手機（D103）→ 玩家看完會收起來；探針沒收＝卡在 day −18 22:40
        if await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); return !!(b&&b.offsetParent); })()"):
            await pg.evaluate("(()=>{ document.getElementById('btnPhoneClose').click(); })()"); phone_closed += 1; await pg.wait_for_timeout(800)
        await L.advance_dialogs(pg, cdp, R, lambda q: not q['dlg'] and not q['choices'], max_steps=15)
        steps += 1; await pg.wait_for_timeout(1500)
    s = await st(pg); ks = [e['k'] for e in s['log']]
    await snap(pg, 'new_end')
    R.note('[NEW] 按了 %d 次（收起自動打開的手機 %d 次）；出過的提示 %s；遊戲時間 day %s %s；HINT_SEEN %s' % (steps, phone_closed, ks, s['day'], s['h'], s['seen']))
    R.check('[NEW] 開新遊戲到可以自由活動，「free」那一則出來（%.0f 分鐘內）' % NEW_MIN, 'free' in ks, J(s['log'][:5]))
    R.check('[NEW] free 之前沒有別的提示先出', not ks or ks[0] == 'free', J(ks))
    res['NEW'] = {'steps': steps, 'log': s['log'], 'seg': s['seg'], 'seen': s['seen']}


async def part_flow(pg, cdp, res):
    await pg.goto(URL); await L.wait_loaded(pg)
    r = await load_fix(pg, cdp, FIX, True, FLOW_H)
    R.setup('[FLOW] 【前置／捷徑】讀檔 %s 改到 %.1f（day %s %s %s）＋HINT_SEEN 設成 {}＝一則都還沒看過' % (FIX, FLOW_H, r['day'], r['hour'], r['zone']))
    log = []; done = {}; t0 = time.time(); last_shown = time.time(); waiting = None; waited_at = 0
    order = ['phone', 'slot', 'cls', 'buy', 'save']
    while time.time() - t0 < FLOW_MIN * 60:
        new = await watch(pg, 2, 'flow', seen_log=log)
        if new: last_shown = time.time()
        s = await st(pg); ks = {e['k'] for e in s['log']}
        if all(k in ks for k in TARGET): break
        if time.time() - last_shown < 40 or s['pend']: continue
        if waiting and waiting not in ks and time.time() - waited_at < 70: continue   # HELP_GUIDE_b2：做完快上課馬上又去花錢，buy 排在前面先出、等到 cls 的時候課已經開始了
        waiting = None
        nxt = next((k for k in order if k not in ks and done.get(k, 0) < (3 if k == 'cls' else 1)), None)
        if not nxt: continue
        waiting = nxt; waited_at = time.time()
        done[nxt] = done.get(nxt, 0) + 1
        if nxt == 'phone':
            R.note('[FLOW] 開手機（真的按 #btnPhone）'); await do_phone(pg, cdp, 'flow')
        elif nxt == 'slot':
            u = await pg.evaluate("(()=>{ const G=GAME.G; const p=G.hour<12?'am':(G.hour<18?'pm':'ev'); CLS.slotUse(G,[p]); return {p, used:JSON.stringify(CLS.slotRec(G).used)}; })()")
            R.note('[FLOW] 用掉一個時段【捷徑 CLS.slotUse】%s' % J(u))
        elif nxt == 'cls':
            nc = await pg.evaluate(NEXTCLS)
            if nc and nc['day'] == nc['gday'] and nc['t0'] - 0.6 > nc['h']:
                ok = await pg.evaluate("(h=>CLS.skipTo(GAME,h).then(x=>x,e=>String(e)))(%s)" % (nc['t0'] - 0.6))
                R.note('[FLOW] 快上課【捷徑 CLS.skipTo 到 %.2f】下一堂 %s → %s' % (nc['t0'] - 0.6, J(nc), ok))
            else:
                R.note('[FLOW] 今天沒有還沒開始的課可以跳（%s）' % J(nc))
        elif nxt == 'buy':
            await pg.evaluate("GAME.money(-60)"); R.note('[FLOW] 花錢【捷徑 GAME.money(-60)】')
        elif nxt == 'save':
            t = await do_save(pg, cdp); R.note('[FLOW] 存檔（真的按選單→存檔→「%s」）' % t)
    s = await st(pg)
    cnt = {}
    for e in s['log']: cnt[e['k']] = cnt.get(e['k'], 0) + 1
    dur = {}
    for g in s['seg']: dur.setdefault(g['k'], []).append(g['s'])
    for k in TARGET:
        R.check('[FLOW] 「%s」出現一次（%s 次；顯示 %s 秒）' % (k, cnt.get(k, 0), dur.get(k)), cnt.get(k, 0) == 1, J([e for e in s['log'] if e['k'] == k]))
    extra = {k: v for k, v in cnt.items() if k not in TARGET}
    R.note('[FLOW] 其他也出的：%s；全部順序 %s；每一則實際顯示秒數 %s' % (J(extra), J([(e['k'], e['day'], e['h']) for e in s['log']]), J(dur)))
    R.check('[FLOW] 沒有一種出兩次', all(v <= 1 for v in cnt.values()), J(cnt))
    # 讀回自動存檔：看過的不再出
    await pg.evaluate("GAME.autosave&&GAME.autosave(true)")
    sv = await pg.evaluate("GAME.readSave('fatiao3d_auto')")
    n_before = len(s['log'])
    await pg.evaluate(APPLY, sv); await pg.evaluate(HOOK)
    R.setup('[FLOW] 讀回剛剛的自動存檔（HINT_SEEN %s）再等 50 秒' % (sv.get('flags', {}).get('HINT_SEEN')))
    again = await watch(pg, 50, 'flow_reload', seen_log=[])
    R.check('[FLOW] 讀回來以後看過的不再出', not [e for e in again if e['k'] in cnt], J(again))
    res['FLOW'] = {'log': s['log'], 'seg': s['seg'], 'seen': s['seen'], 'count': cnt, 'dur': dur, 'reload': again, 'n_before': n_before}


async def set_hints(pg, cdp, on):
    await open_menu_tab(pg, cdp, 'settings')
    cur = await pg.evaluate("document.getElementById('setHints').checked")
    if cur != on: await pg.click('#setHints')
    await pg.wait_for_timeout(400)
    v = await pg.evaluate("({checked:document.getElementById('setHints').checked, S:GAME.S&&GAME.S.hints, label:(document.getElementById('setHintsLabel')||{}).textContent})")
    await close_ui(pg, cdp)
    return v


async def part_set(pg, cdp, res):
    await pg.goto(URL); await L.wait_loaded(pg)
    r = await load_fix(pg, cdp, FIX, True)
    R.setup('[SET] 【前置／捷徑】讀檔 %s＋HINT_SEEN {}（day %s %s）' % (FIX, r['day'], r['hour']))
    v = await set_hints(pg, cdp, False)
    R.note('[SET] 設定「提示」關掉（真的點）：%s' % J(v))
    await do_phone(pg, cdp, 'set_off'); t = await do_save(pg, cdp)
    off = await watch(pg, 60, 'set_off', seen_log=[])
    s = await st(pg)
    R.check('[SET] 關掉的時候一則都不出（開手機、存檔、等 60 秒）', not off, J(off))
    R.check('[SET] 關掉的時候 HINT_SEEN 不記（%s）' % s['seen'], s['seen'] in ('{}', 'null'), s['seen'])
    v2 = await set_hints(pg, cdp, True)
    R.note('[SET] 打開：%s' % J(v2))
    on = await watch(pg, 60, 'set_on', seen_log=[])
    R.check('[SET] 打開以後 60 秒內還沒看過的會出', bool(on), J(on))
    res['SET'] = {'off': off, 'on': on, 'seen_off': s['seen'], 'save_btn': t, 'v_off': v, 'v_on': v2}


async def part_old(pg, cdp, res):
    await pg.goto(URL); await L.wait_loaded(pg)
    r = await load_fix(pg, cdp, OLD_FIX, False)
    R.setup('[OLD] 讀舊存檔 %s（沒有 HINT_SEEN；day %s %s）' % (OLD_FIX, r['day'], r['hour']))
    await pg.wait_for_timeout(6000)
    await do_phone(pg, cdp, 'old'); await do_save(pg, cdp)
    got = await watch(pg, 100, 'old', seen_log=[])
    s = await st(pg)
    bad = [e['k'] for e in got if e['k'] in BASIC]; other = [e['k'] for e in got if e['k'] not in BASIC]
    R.check('[OLD] 舊存檔不會一口氣跳一串：基本幾種一則都不出', not bad, J(got))
    R.check('[OLD] 別的最多考試、沒錢各一次（%s）' % other, all(k in ('exam', 'money') for k in other) and len(other) == len(set(other)), J(other))
    R.note('[OLD] 讀進來以後 HINT_SEEN %s' % s['seen'])
    res['OLD'] = {'got': got, 'seen': s['seen']}


async def part_dlg(pg, cdp, res):
    await pg.goto(URL); await L.wait_loaded(pg)
    await load_fix(pg, cdp, FIX, True)
    R.setup('[DLG] 【前置／捷徑】讀檔 %s＋HINT_SEEN {} → 馬上開一段對話【捷徑 GAME.say】' % FIX)
    await pg.evaluate("(()=>{ window.__ccSay=GAME.say('','（CC 測試：這段對話開著 15 秒，看提示會不會在對話中出來）'); })()")
    await pg.wait_for_timeout(500)
    s0 = await st(pg)
    during = await watch(pg, 15, 'dlg_during', seen_log=[])
    await snap(pg, 'dlg_during')
    R.check('[DLG] 對話中不出提示（busy=%s）' % s0['busy'], not during, J(during))
    await L.advance_dialogs(pg, cdp, R, lambda q: not q['dlg'] and not q['choices'], max_steps=5)
    after = await watch(pg, 15, 'dlg_after', seen_log=[])
    R.check('[DLG] 對話結束 15 秒內 free 出來', any(e['k'] == 'free' for e in after), J(after))
    res['DLG'] = {'during': during, 'after': after, 'busy': s0['busy']}


async def main():
    print('CC HELP-GUIDE：SHA %s；PARTS %s；Playwright ≠ iPhone' % (SHA or '?', PARTS), flush=True)
    res = {'sha': SHA, 'parts': PARTS}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        for name, fn in (('HELP', None), ('NEW', part_new), ('FLOW', part_flow), ('SET', part_set), ('OLD', part_old), ('DLG', part_dlg)):
            if name not in PARTS: continue
            try:
                if name == 'HELP':
                    await load_fix(pg, cdp, FIX, False); await pg.wait_for_timeout(4000)
                    await part_help(pg, cdp, res)
                else:
                    await fn(pg, cdp, res)
            except Exception as e:
                R.check('[%s] 沒有中斷' % name, False, repr(e)[:300])
                await snap(pg, 'crash_%s' % name)
        try:
            await set_hints(pg, cdp, True)
        except Exception:
            pass
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'help_guide.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
