"""CC-B 11-10：WAKE-STALE-1110（df4674cb2）起床選單只在醒來的那一區、醒來 30 分鐘遊戲時間以內出。真的點選操作；Playwright 手機模擬（橫向 844×390、CDP 觸控）≠ iPhone。
使用者 11-10：「我都移動到圖書館 顯示要不要去某堂課 居然還有再睡一下的選項?還可以起床?」
程式：src/classes3d.js——S.queueWake 記 {day,t,zone,h}；S.wakeFresh(G,w)＝同一天、同一區、hr(G)-w.h<=0.5；oneTick 要玩家空下來 1.5 秒、醒來 2.5 秒（WAKE_GRACE）以後才出。
起床一定是真的在房間的床「睡到明天…」睡醒的（不叫 CLS.wakeMenu／CLS.queueWake；只包一層記錄）。
  a  2025-10-07 23:00 在房間（dorm）【前置／捷徑：最小存檔】→ 床「睡到明天」→ 一醒來馬上走：走出房間 → 宿舍走廊、樓梯 → 離開宿舍 → 校園用手機「地點」→ 總圖「前往」（真的點手機；WALK_LIB=1 改成走到總圖門口，SwiftShader 要半小時以上）→ 總圖（library_hall）站 15 秒。
     PASS＝離開房間以後沒有出起床選單（新版）；EXPECT=old（舊版 df4674cb2^ 對照）：要在離開房間以後出（證明測得到）
  b  同樣睡醒，站在房間不動 20 秒。PASS＝起床選單出了（記原文）
  c  同樣睡醒，走到宿舍走廊（dorm_hall）站到醒來 30 分鐘遊戲時間以後，再走回房間站 20 秒。PASS＝回房間以後沒出；在走廊出了＝FAIL（別的區域）
  d  同樣睡醒，在房間坐到書桌前（不是「空下來」）坐過 30 分鐘遊戲時間，再起來站 20 秒。PASS（新版）＝沒出（30 分鐘那一條）；EXPECT=old 要出
  記：GAME.choose 包一層（只記、照樣呼叫）——每個選單的選項原文、區域、時間；CLS.queueWake 包一層記醒來的區域、時間。
用法：LW_TESTS=<wt>/tests [CASES=a,b,c,d] [EXPECT=old] [WALK_LIB=1] python3 cc_wake_stale_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
CASES = [c for c in (os.environ.get('CASES') or 'a,b,c,d').split(',') if c]
OLD = os.environ.get('EXPECT') == 'old'
J = lambda o: json.dumps(o, ensure_ascii=False, default=str)
FAILS = []
def check(n, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + n + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(n)
    return ok
def setup(s): print('  【前置／捷徑】' + s, flush=True)
def note(s): print('  ' + s, flush=True)
class Run:
    def note(self, s): note(s)
RUN = Run()

BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore', 'classroom', 'dorm', 'dorm_hall')

def mkstate(d, h, zone, money=30000, flags=None):
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'flags': dict(BASEF, **(flags or {}))}
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=None, weather='clear', stage='law', money=money)
    st['visited'] = {z: True for z in VISITED}
    st['courses'] = {'done': {}, 'attend': {}, 'prep': {}, 'electives': {}, 'note': {}, 'disc': {}, 'ask': {}, 'late': {}, 'abs': {}, 'exam': {}, 'grades': {}}
    return st

HOOK = r"""(()=>{ if(window.__WK) return 'again'; const W=window.__WK={choose:[],qw:[]};
  const t=()=>{ const G=GAME.G, P=GAME.E&&GAME.E.player, o=P&&P.obj&&P.obj.position; return {h:+(+G.hour).toFixed(3),d:G.day,z:G.zone,x:o?+o.x.toFixed(1):null,zz:o?+o.z.toFixed(1):null,wall:Date.now()}; };
  const wrap=(o,fn,f)=>{ const f0=o&&o[fn]; if(typeof f0!=='function') return false; o[fn]=function(){ try{ f.apply(null,arguments); }catch(e){} return f0.apply(this,arguments); }; return true; };
  return {choose:wrap(GAME,'choose',o=>W.choose.push(Object.assign({t:(o||[]).filter(x=>x&&!x.hidden).map(x=>x.t||x.text||'')},t()))),
          queueWake:wrap(CLS,'queueWake',()=>W.qw.push(t()))}; })()"""
def is_wake(opts):
    return bool(opts) and (opts[0].startswith(('直接去上課', '直接去考場')) or any('再睡一下' in o for o in opts))
async def W(pg): return await pg.evaluate("window.__WK")
async def wakes(pg, n0=0): return [c for c in (await W(pg))['choose'][n0:] if is_wake(c['t'])]

async def handle(pg, cdp, s):
    """畫面上有對話／選單就像玩家一樣處理一步：起床選單點「先起床…」（不要被帶去上課）、其他選單點最後一個（多半是不要／之後再說）"""
    if s['ch']:
        await pg.wait_for_timeout(300); s = await P.ts(pg)
        if not s['ch']: return True
        txt = [o['t'] for o in s['ch']]
        k = next((j for j, o in enumerate(txt) if o.startswith('先起床') or o == '起床'), len(txt) - 1)
        note('選單 %s → %s' % (J(txt), txt[k])); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); return True
    if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); return True
    if s.get('phone'): await L.phone_away(pg, cdp, tries=2); return True
    return False

FRAME = "GAME.E.frame|0"
async def stand(pg, cdp, secs, tag, frames=60, max_s=300, until=None):
    """站著不動：至少 secs 秒（真實時間）而且遊戲至少跑了 frames 格（SwiftShader 又和別的瀏覽器搶 CPU 時只有 0.3–1 fps，
    20 秒可能只跑 10 格、S.tick 根本沒機會連續空下來 3 次）；最多 max_s 秒。出現對話、選單照 handle 處理；until() 為真就提早結束"""
    t0 = time.time(); f0 = await pg.evaluate(FRAME)
    while time.time() - t0 < max_s:
        if time.time() - t0 >= secs and await pg.evaluate(FRAME) - f0 >= frames: break
        if until and await until(): break
        s = await P.ts(pg)
        if not await handle(pg, cdp, s): await pg.wait_for_timeout(500)
    f1 = await pg.evaluate(FRAME); note('%s：站了 %.0f 秒、%d 格（%.3f 時）' % (tag, time.time() - t0, f1 - f0, await pg.evaluate("GAME.G.hour")))

async def walk(pg, cdp, x, z, near, label, lv=None, max_s=300):
    """L.go_to（點地面為主）；途中有對話／選單就停下來 handle，再繼續"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        ok = await L.go_to(pg, cdp, RUN, x, z, near, label, max_s=max(30, max_s - (time.time() - t0)), lv=lv, stop=lambda q: q['dlg'] or q['choices'])
        s = await P.ts(pg)
        if s['dlg'] or s['ch']:
            await handle(pg, cdp, s); continue
        return ok
    return False

async def use_exit(pg, cdp, to, label, max_s=120):
    """站在出口前按 #interact，等到進了 to 區域、人能動"""
    z0 = await pg.evaluate("GAME.G.zone"); t0 = time.time(); taps = 0
    while time.time() - t0 < max_s:
        if await pg.evaluate("z=>GAME.G.zone===z&&!GAME.E.player.busy", to): note('進了 %s（按 %d 次）' % (to, taps)); return True
        s = await P.ts(pg)
        if s['dlg'] or s['ch']: await handle(pg, cdp, s); continue
        if await pg.evaluate("GAME.G.zone") == z0 and taps < 6:
            btn = await pg.evaluate("(()=>{ const e=document.getElementById('interact'); return e&&!e.classList.contains('hide')?e.textContent.trim():''; })()")
            note('%s：互動鈕「%s」' % (label, btn)); await L.tap(pg, cdp, '#interact'); taps += 1
            await pg.wait_for_timeout(2500); continue
        await pg.wait_for_timeout(700)
    return False

DIAG = """(()=>{ const G=GAME.G, E=GAME.E, P=E.player, pd=CLS.pending?CLS.pending():{}; let gl=null; try{ gl=CLS.goList(G).map(i=>i.c.name+' '+CLS.status(G,i)); }catch(e){ gl='err'; }
  return {h:+(+G.hour).toFixed(3),z:G.zone,wake:pd.wake?{d:pd.wake.day,z:pd.wake.zone,h:pd.wake.h,age:Date.now()-pd.wake.t}:null,paused:!!E.paused,busy:!!P.busy,seat:!!P.seat,dlg:!!(GAME.D&&GAME.D.active),
    path:!!(P.path&&P.path.length),title:!!GAME.titleIdle,canGo:CLS.canGo?CLS.canGo(GAME):null,goList:gl,fps:E.frame|0}; })()"""
async def diag(pg, tag): d = await pg.evaluate(DIAG); note('%s：狀態 %s' % (tag, J(d))); return d

async def wait_free(pg, cdp, tag, max_s=90):
    """等到人能動（不在淡出淡入、不忙、沒有對話）：醒來的動畫在 SwiftShader 很慢"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if s['dlg'] or s['ch']: return s
        if not s['busy'] and not await pg.evaluate("!!GAME.E.paused"): return s
        await pg.wait_for_timeout(500)
    return None

async def phone_go(pg, cdp, zone, tag, max_s=180):
    """手機「地點」頁點那一區的「前往」（地區收起來的話先點地區展開）；等到進了那一區、人能動"""
    # 11-10 r2：WAKE r1 剛到校園時畫面上有「提示」和停車 toast，按 📱 沒打開手機（截圖 wake_a_phone.png 手機根本沒開）→ 等提示消失、確認手機真的開了再點分頁
    opened = False
    for k in range(5):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1500)
        if await pg.evaluate("(()=>{ const e=document.getElementById('phone'); return !!e&&!e.classList.contains('hide'); })()"): opened = True; break
        note('%s：手機沒打開（第 %d 次），等 3 秒再按' % (tag, k + 1)); await pg.wait_for_timeout(3000)
    if not opened:
        await pg.screenshot(path=os.path.join(OUT, 'wake_%s_phone.png' % tag)); return False
    await L.tap(pg, cdp, '#phoneTabs [data-ptab="places"]'); await pg.wait_for_timeout(1500)
    sel = '#phoneBody [data-place^="%s|"]' % zone
    if not await pg.evaluate("s=>!!document.querySelector(s)", sel):
        areas = await pg.evaluate("(()=>[...document.querySelectorAll('#phoneBody [data-parea]')].map(b=>b.dataset.parea))()")
        for a in areas:
            await L.tap(pg, cdp, '#phoneBody [data-parea="%s"]' % a); await pg.wait_for_timeout(1200)
            if await pg.evaluate("s=>!!document.querySelector(s)", sel): note('%s：手機地點：展開地區 %s' % (tag, a)); break
    row = await pg.evaluate("s=>{ const b=document.querySelector(s); if(!b) return null; const r=b.closest('.item')||b.parentElement; return (r.textContent||'').trim().slice(0,80); }", sel)
    note('%s：手機地點那一列：%s' % (tag, row))
    if not row: note('%s：手機上有的地點：%s' % (tag, J(await pg.evaluate("(()=>[...document.querySelectorAll('#phoneBody [data-place]')].map(b=>b.dataset.place).slice(0,40))()"))))
    if not row: await pg.screenshot(path=os.path.join(OUT, 'wake_%s_phone.png' % tag)); return False
    await L.tap(pg, cdp, sel)
    t0 = time.time()
    while time.time() - t0 < max_s:
        if await pg.evaluate("z=>GAME.G.zone===z&&!GAME.E.player.busy", zone): note('%s：到了 %s（%.3f 時）' % (tag, zone, await pg.evaluate("GAME.G.hour"))); return True
        s = await P.ts(pg)
        if s['dlg'] or s['ch']: await handle(pg, cdp, s); continue
        await pg.wait_for_timeout(700)
    return False

EXIT_JS = "(to=>{ const it=(GAME.E.interactables||[]).find(i=>!i.hidden&&i.exit&&i.exit.to===to); return it?[it.x,it.z,it.lv|0,it.label||'']:null; })"

async def bed(pg, cdp, prefixes, tag):
    """走到床邊按互動 → 床的選單照 prefixes 選（第一個符合的）。回傳 (選項, 選了哪個)（同 cc_y4s2final_probe.py）"""
    it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z,it.lv|0]:null; })()")
    if not it: note('%s：這一區找不到床' % tag); return [], None
    await L.phone_away(pg, cdp, tries=1)
    await L.go_to(pg, cdp, RUN, it[0], it[1], 0.8, '床', max_s=150, lv=it[2], stop=lambda s: s['dlg'] or s['choices'])
    ops = []
    for _ in range(4):
        s = await P.ts(pg)
        if s['ch']: break
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1600)
    for _ in range(10):
        s = await P.ts(pg)
        if s['ch']: ops = [o['t'] for o in s['ch']]; break
        await pg.wait_for_timeout(600)
    k = next((i for p in prefixes for i, o in enumerate(ops) if o.startswith(p)), None)
    note('%s：床的選單 %s → %s' % (tag, J(ops), ops[k] if k is not None else '（沒有符合的，不選）'))
    if k is not None: await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(2000)
    return ops, (ops[k] if k is not None else None)

async def sleep_wake(pg, cdp, case):
    """10-07 23:00 房間 → 床「睡到明天」→ 等到真的醒來（CLS.queueWake 被遊戲叫、G.day+1）。回傳醒來紀錄"""
    d = await P.day_of(pg, '2025-10-07'); dk = {'d': d['d'], 'wd': d['wd']}
    setup('%s：最小存檔 2025-10-07（day %d 週%d）23:00 在房間 dorm（條件事件照常，只關要回覆訊息自動打開手機）' % (case, d['d'], d['wd']))
    await L.load_state(pg, mkstate(dk, 23.0, 'dorm'), quiet_phone=True); await pg.wait_for_timeout(5000)
    try: await L.phone_away(pg, cdp, tries=2)
    except Exception: pass
    hk = await pg.evaluate(HOOK); check('%s：記錄鉤子都掛上' % case, isinstance(hk, dict) and hk.get('choose') and hk.get('queueWake'), J(hk))
    nxt = await pg.evaluate("d=>CLS.dayItems(GAME.G,d).map(i=>(i.exam?'[考]':'')+i.c.name+' '+(+i.t0).toFixed(2)+' '+(i.room&&i.room.zone))", d['d'] + 1)
    note('%s：隔天的課 %s' % (case, J(nxt)))
    ops, pick = await bed(pg, cdp, ('睡到明天',), case)
    if not check('%s：床的選單有「睡到明天…」並點了' % case, bool(pick), J(ops)): return None
    t0 = time.time()
    while time.time() - t0 < 300:
        w = await W(pg)
        if w['qw'] and await pg.evaluate("d=>GAME.G.day===d", d['d'] + 1): break
        s = await P.ts(pg)
        if s['ch']: await handle(pg, cdp, s); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(250)
    w = await W(pg)
    if not check('%s：睡醒了（遊戲自己叫 CLS.queueWake；%s）' % (case, J(w['qw'])), bool(w['qw'])): return None
    q = w['qw'][-1]; note('%s：醒來 day %d %s %.3f 時（%s,%s）' % (case, q['d'], q['z'], q['h'], q['x'], q['zz']))
    await pg.screenshot(path=os.path.join(OUT, 'wake_%s_woke.png' % case))
    return q

async def leave_room(pg, cdp, case):
    ex = await pg.evaluate(EXIT_JS, 'dorm_hall')
    if not check('%s：房間有往 dorm_hall 的出口（%s）' % (case, J(ex)), bool(ex)): return False
    await walk(pg, cdp, ex[0], ex[1], 0.9, ex[3] or '走出房間', lv=ex[2], max_s=120)
    return check('%s：走出房間進了 dorm_hall' % case, await use_exit(pg, cdp, 'dorm_hall', '走出房間'))

async def case_a(pg, cdp):
    q = await sleep_wake(pg, cdp, 'a')
    if not q: return
    n0 = len((await W(pg))['choose'])
    if not await leave_room(pg, cdp, 'a'): return
    inroom = [c for c in await wakes(pg, n0) if c['z'] == 'dorm']
    if inroom:
        check('a：離開房間以前起床選單沒先出（不然測不到「別的區域」）', False, J(inroom)); return
    nleft = len((await W(pg))['choose']); await diag(pg, 'a 進了走廊')
    ex = await pg.evaluate(EXIT_JS, 'campus')
    if not check('a：宿舍走廊有往校園的出口（%s）' % J(ex), bool(ex)): return
    if await walk(pg, cdp, ex[0], ex[1], 0.9, ex[3] or '離開宿舍', lv=ex[2], max_s=int(os.environ.get('HALL_WALK_S') or 600)):
        if not check('a：離開宿舍到校園', await use_exit(pg, cdp, 'campus', '離開宿舍')): return
    else:
        # 宿舍走廊二樓 → 樓梯 → 一樓門口：CPU 被別的瀏覽器測試搶走時 0.3 fps、10 分鐘走不到 → 改用手機「地點」直接去總圖（照樣是離開房間以後到別的區域）
        note('a：走廊走不到「離開宿舍」（%s），改從走廊用手機「地點」直接去總圖' % J(await pg.evaluate("(()=>{ const o=GAME.E.player.obj.position; return [+o.x.toFixed(1),+o.z.toFixed(1),GAME.E.player.lv|0,GAME.G.zone]; })()")))
        if not check('a：手機「地點」→ 總圖「前往」進了 library_hall（從宿舍走廊）', await phone_go(pg, cdp, 'library_hall', 'a')): return
    if await pg.evaluate("GAME.G.zone") == 'library_hall': pass
    elif os.environ.get('WALK_LIB'):
        ex = await pg.evaluate(EXIT_JS, 'library_hall')
        if not check('a：校園有總圖的門（%s）' % J(ex), bool(ex)): return
        await walk(pg, cdp, ex[0], ex[1], 2.5, ex[3] or '總圖', lv=ex[2], max_s=1200)
        hr = await pg.evaluate("GAME.G.hour")
        if hr < 8.0:
            note('a：%.2f 時，總圖 08:00 才開，在門口等' % hr)
            t0 = time.time()
            while time.time() - t0 < 600 and await pg.evaluate("GAME.G.hour") < 8.02:
                s = await P.ts(pg)
                if not await handle(pg, cdp, s): await pg.wait_for_timeout(1000)
        if not check('a：走進了總圖 library_hall', await use_exit(pg, cdp, 'library_hall', '進入總圖書館')): return
    else:
        # 校園走到總圖門口約 85 m：SwiftShader 0.5 fps 要走半小時以上 → 用手機「地點」→ 總圖「前往」（玩家也這樣去；真的點手機，不叫 GAME.quickGo）
        if not check('a：手機「地點」→ 總圖「前往」進了 library_hall', await phone_go(pg, cdp, 'library_hall', 'a')): return
    note('a：在 library_hall 站 15 秒（%.3f 時）' % await pg.evaluate("GAME.G.hour"))
    await stand(pg, cdp, 15, 'a 總圖')
    await pg.screenshot(path=os.path.join(OUT, 'wake_a_library%s.png' % ('_old' if OLD else '')))
    await diag(pg, 'a 總圖站完')
    allw = await wakes(pg, n0)
    note('a：離開房間以後的起床選單 %s' % J([[c['z'], c['h'], c['t']] for c in allw]))
    if OLD: check('a（舊版對照）：離開房間以後還是出了起床選單（證明測得到；出在 %s）' % J([[c['z'], c['h']] for c in allw]), bool(allw), J(allw))
    else: check('a：離開房間以後沒有出起床選單（醒來 %s %.3f；到總圖 %.3f）' % (q['z'], q['h'], await pg.evaluate("GAME.G.hour")), not allw, J(allw))

async def case_b(pg, cdp):
    q = await sleep_wake(pg, cdp, 'b')
    if not q: return
    n0 = len((await W(pg))['choose'])
    await diag(pg, 'b 醒來'); await wait_free(pg, cdp, 'b'); await diag(pg, 'b 能動了')
    note('b：在房間站 20 秒（而且至少 60 格）')
    async def seen():
        if (await P.ts(pg))['ch'] and not os.path.exists(os.path.join(OUT, 'wake_b_menu.png')):
            await pg.wait_for_timeout(500); await pg.screenshot(path=os.path.join(OUT, 'wake_b_menu.png'))
        return bool(await wakes(pg, n0))
    await stand(pg, cdp, 20, 'b', until=seen)
    await stand(pg, cdp, 3, 'b 收尾', frames=4)
    await diag(pg, 'b 結束')
    ws = await wakes(pg, n0)
    for c in ws: note('b：起床選單 %s %.3f 時（醒來後 %.1f 秒）：%s' % (c['z'], c['h'], (c['wall'] - q['wall']) / 1000, J(c['t'])))
    check('b：站在房間，起床選單出了', bool(ws) and ws[0]['z'] == 'dorm', J(ws))

async def case_c(pg, cdp):
    q = await sleep_wake(pg, cdp, 'c')
    if not q: return
    n0 = len((await W(pg))['choose'])
    if not await leave_room(pg, cdp, 'c'): return
    note('c：在 dorm_hall 站到 %.3f 時以後（醒來 %.3f＋0.5）' % (q['h'] + 0.55, q['h']))
    t0 = time.time()
    while time.time() - t0 < 900 and await pg.evaluate("GAME.G.hour") < q['h'] + 0.55:
        s = await P.ts(pg)
        if not await handle(pg, cdp, s): await pg.wait_for_timeout(1000)
    hr = await pg.evaluate("GAME.G.hour"); note('c：%.3f 時（站了 %.0f 秒）' % (hr, time.time() - t0))
    check('c：遊戲時間過了醒來 30 分鐘', hr > q['h'] + 0.5, '%.3f' % hr)
    inhall = [c for c in await wakes(pg, n0) if c['z'] != 'dorm']
    if OLD: note('c（舊版）：走廊的起床選單 %s' % J(inhall))
    else: check('c：在 dorm_hall（別的區域）沒有出起床選單', not inhall, J(inhall))
    n1 = len((await W(pg))['choose'])
    ex = await pg.evaluate(EXIT_JS, 'dorm')
    if not check('c：走廊有回房間的門（%s）' % J(ex), bool(ex)): return
    await walk(pg, cdp, ex[0], ex[1], 0.9, ex[3] or '回房間', lv=ex[2], max_s=240)
    if not check('c：回到房間 dorm', await use_exit(pg, cdp, 'dorm', '回房間')): return
    await diag(pg, 'c 回到房間')
    await stand(pg, cdp, 20, 'c 回房間')
    back = await wakes(pg, n1)
    note('c：回房間以後的起床選單 %s' % J([[c['z'], c['h'], c['t']] for c in back]))
    if OLD: note('c（舊版）：回房間以後 %s' % J(back))
    else: check('c：回房間（醒來超過 30 分鐘）沒有出起床選單', not back, J(back))

async def case_d(pg, cdp):
    q = await sleep_wake(pg, cdp, 'd')
    if not q: return
    n0 = len((await W(pg))['choose'])
    desk = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>!i.hidden&&i.seat); return it?[it.x,it.z,it.lv|0,it.label||'']:null; })()")
    if not check('d：房間有書桌座位（%s）' % J(desk), bool(desk)): return
    ok = await L.go_to(pg, cdp, RUN, desk[0], desk[1], 0.8, desk[3] or '書桌', max_s=60, lv=desk[2], stop=lambda s: s['dlg'] or s['choices'])
    early = await wakes(pg, n0)
    if early: check('d：坐下以前起床選單沒先出（不然測不到 30 分鐘）', False, J(early)); return
    for _ in range(4):
        if await pg.evaluate("!!GAME.E.player.seat"): break
        s = await P.ts(pg)
        if s['dlg'] or s['ch']: await handle(pg, cdp, s); continue
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2000)
    if not check('d：坐在書桌前（player.seat）', await pg.evaluate("!!GAME.E.player.seat")): return
    note('d：坐著等到 %.3f 時以後' % (q['h'] + 0.55))
    t0 = time.time()
    while time.time() - t0 < 900 and await pg.evaluate("GAME.G.hour") < q['h'] + 0.55:
        s = await P.ts(pg)
        if s['dlg'] or s['ch']: await handle(pg, cdp, s); continue
        await pg.wait_for_timeout(1000)
    hr = await pg.evaluate("GAME.G.hour"); check('d：坐著過了醒來 30 分鐘（%.3f 時）' % hr, hr > q['h'] + 0.5)
    still = await pg.evaluate("!!GAME.E.player.seat")
    note('d：還坐著 %s；起來（按互動鈕）' % still)
    for _ in range(4):
        if not await pg.evaluate("!!GAME.E.player.seat"): break
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2000)
    n1 = len((await W(pg))['choose'])
    await stand(pg, cdp, 20, 'd 起來以後')
    ws = await wakes(pg, n0)
    note('d：起床選單 %s' % J([[c['z'], c['h'], c['t']] for c in ws]))
    if OLD: check('d（舊版對照）：坐過 30 分鐘起來，舊版還是出了起床選單', bool(ws), J(ws))
    else: check('d：坐過 30 分鐘起來，沒有出起床選單（30 分鐘那一條）', not ws, J(ws))

async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ['LW_TESTS'], '..')).read().strip()
    print('CC-B 起床選單只在醒來的地方（WAKE-STALE-1110）：worktree %s；%s；Playwright ≠ iPhone' % (real or '?', '舊版對照 EXPECT=old' if OLD else '新版'), flush=True)
    async with async_playwright() as p:
        for c in CASES:
            print('===== %s =====' % c, flush=True)
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
            try:
                await pg.goto(URL); check('%s：遊戲載入' % c, await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()"); await P.init(pg)
                await {'a': case_a, 'b': case_b, 'c': case_c, 'd': case_d}[c](pg, cdp)
                ch = (await W(pg) or {}).get('choose', []) if await pg.evaluate("!!window.__WK") else []
                note('%s：全部選單 %s' % (c, J([[x['z'], x['h'], x['t']] for x in ch])))
                with open(os.path.join(OUT, 'wake_%s%s.json' % (c, '_old' if OLD else '')), 'w') as f: f.write(J(await pg.evaluate("window.__WK||null")))
                check('%s：沒有 JS 例外' % c, not errs, J(errs[:3]))
            except Exception as e:
                import traceback; traceback.print_exc(); check('%s：沒有例外' % c, False, repr(e)[:200])
            finally:
                await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
