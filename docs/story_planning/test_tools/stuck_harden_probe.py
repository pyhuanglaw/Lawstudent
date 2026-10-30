"""BB-C 10-27：5q 卡住防護（STUCK-HARDEN-1027，開發分支 33d24f9db）的 ②③ 和「讀檔」——瀏覽器驗收（① 麵店連按「和以安說話」在 an_stuck_probe.py）。
修改前的版本可以對照：33d24f9db 的上一個 commit＝7f7fd7964（LAWWW-C 的 say_cover_unit.js 也拿它當修改前）。不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。

MODE（環境變數）：
  aunt  ：萬才館研討室 B 阿姨諮詢（Y2B.auntConsult；2027-05-22 週六 09:00 以後，人在研討室 B＝CLOSED2.tick 自動開始）。
          【前置】使用者存檔（法律系 day 14）改到 2027-05-22 09:05、萬才館 2F 研討室 B 門口（lawclub、ROOM_Y2 照日子；語彤、柏翰 FRIEND＋FIRST_MET＝console 寫，同 tests/rooms_ab3_people_unit.js 的 aunt()）；
          之後照玩家：觸控走到門口、按「進入 研討室 B」→ 進房間以後 CLOSED2.tick 決定開演。ENTRY=load：門找不到時【捷徑】GAME.enter('wancai_semb')。
  carrel：研究小間那一句（LUPS：進 library_carrels、有預約 carrelDay＝今天、今天還沒說過 CARREL_QUIET → 「（小間裡只聽得到自己翻書的聲音。）」）。
          【前置】day 14 14:00、總圖大廳 2F 研究小間門口外、flags.carrelDay＝今天、carrelUntil 17:00（預約本身是大四才能做的事，這裡直接寫）；之後觸控走到門口、按「研究小間」。
  reload：阿姨諮詢演到第 3 句（OVERLAP 不注入）時【捷徑】GAME.applySave 使用者原本的存檔（遊戲裡劇情中途選單「讀取」會擋——「劇情還在進行」——只有卡住（stale）以後或回標題才讀得了，兩條路最後都是 applySave）。
          檢查新的那一局：鎖 0 層、不忙、選單打得開、走得動、舊的那一段沒有接著在新的一局演（照玩家：對話框還在就點）；
          再讀一次「阿姨諮詢到期」的狀態：諮詢要能重新開始（CLOSED2 的 busy 沒有一直卡著）。

「兩段同時開演」怎麼做（OVERLAP，環境變數，aunt／carrel 用）：
  原本的毛病：決定開演到真的開演之間（Promise.resolve().then(...)＝下一個 microtask）沒有先 sceneBegin，同一格接著跑的 EVENTS.tick（自動事件）、按下去的「說話」
  看到玩家空著就另外開一段；GM.say 只留一個等點擊的 resolve，先開始的那一段永遠等不到＝停在說話的畫面。玩家的觸控事件插不進 microtask 的空檔，
  真的會插進來的是「同一格、同步跑、會先看玩家忙不忙」的那種——這支在決定開演的那一刻（CLOSED2.tick 回 true／STORY.populate('library_carrels') 回來）
  【捷徑】同步呼叫一段測試用的劇情（sceneBegin＋say「（BB 測試：同一格開演的另一段。）」＋sceneEnd），模擬那種自動事件：
    inject（預設）：照自動事件的規矩，玩家忙（busy 或鎖 >0）就不開＝新版應該不會開（決定開演那一刻已經鎖住）、舊版會開。
    force         ：不管忙不忙都開（模擬沒有先看忙不忙的那種路）＝驗 game3d.js 的 say 保底：舊的那一句先收起來、這一段演完放回去、點了接著演。
    none          ：不注入（只看正常演出）。
修改前（7f7fd7964）預期：inject、force 都會注入 → 正式劇情的第一句把測試那一句的 resolve 蓋掉 → 正式劇情演完以後鎖停在 1 層、沒有對話框、不能動＝「沒有卡住」FAIL、「測試那一段有演完」FAIL。
修改後（33d24f9db 以後）預期：inject＝沒有注入（決定開演那一刻 busy）、正式劇情照演、ALL PASS；force＝測試那一句被蓋、正式劇情演完放回去、點了收掉、ALL PASS。
reload 不是用來分新舊版的（舊版的 finally 本來就沒有 sceneEnd）：它檢查新版加的「中途讀了別的檔不動新的那一局」沒有副作用，另外看讀檔後阿姨諮詢還能不能再開始。

用法：LW_TESTS=<工作樹>/tests MODE=aunt OVERLAP=inject python3 stuck_harden_probe.py '<URL>/index.html[?lowres]' <輸出資料夾> [存檔.json]
  預設不用 ?turbo（turbo 會把 GM.sleep 壓到 120 ms，時間差和真機不同）；SHA＝記錄用。"""
import os, sys, json, asyncio, time, copy
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
SAVEF = sys.argv[3] if len(sys.argv) > 3 else '/tmp/claude-0/-home-user-Lawstudent/4f52e6f0-1e48-5c03-872f-171d129a03fd/scratchpad/bbtest/p0an/user_day14.json'
MODE = os.environ.get('MODE', 'aunt'); OVERLAP = os.environ.get('OVERLAP', 'inject' if MODE != 'reload' else 'none'); ENTRY = os.environ.get('ENTRY', 'walk')
SAVE = json.load(open(SAVEF, encoding='utf-8')); SAVE = SAVE.get('G', SAVE)
INJ = '（BB 測試：同一格開演的另一段。）'
AUNT0 = '（萬才館的諮詢室。門開了，進來的是阿鳳阿姨，後面跟著語彤。）'
AUNT_DAY = '2027-05-22'

# 頁面內的紀錄：對話框每換一句記一筆（誰、哪一句、鎖幾層、誰蓋的）；注入測試那一段
REC = """(()=>{ window.__bbLog=[]; window.__bbInj=null; window.__bbInjDone=null; window.__bbFired=null; window.__bbCover=[]; window.__bbOverlap=%s;
  let last=''; setInterval(()=>{ try{ const D=GAME.D, b=document.getElementById('dlg'), vis=b&&!b.classList.contains('hide');
    const k=vis?((document.getElementById('dlgName').textContent||'')+'｜'+(D.full||'')):''; if(k&&k!==last) window.__bbLog.push({t:Math.round(performance.now()),k:k.slice(0,90),depth:D.busyDepth|0,cover:D.coverWho||null}); last=k;
    if(D.coverWho&&window.__bbCover.indexOf(D.coverWho)<0) window.__bbCover.push(D.coverWho); }catch(e){} },50);
  window.__bbInject=function(src){ const P=GAME.E.player, D=GAME.D, st={src,busy:!!P.busy,depth:D.busyDepth|0,dlg:!!D.active,t:Math.round(performance.now())};
    if(window.__bbOverlap==='none'||(window.__bbOverlap!=='force'&&(P.busy||(D.busyDepth|0)>0))){ st.injected=false; window.__bbInj=st; return; }
    st.injected=true; window.__bbInj=st; GAME.sceneBegin(); Promise.resolve(GAME.say(null,%s)).then(()=>{ window.__bbInjDone=Math.round(performance.now()); GAME.sceneEnd(); }); };
  return true; })()""" % (json.dumps(OVERLAP), json.dumps(INJ))
HOOK_AUNT = """(()=>{ if(typeof CLOSED2==='undefined'||!CLOSED2.tick) return false; const t0=CLOSED2.tick;
  CLOSED2.tick=function(GM){ const r=t0.apply(this,arguments); if(r&&!window.__bbFired){ window.__bbFired={t:Math.round(performance.now()),busy:!!GAME.E.player.busy,depth:GAME.D.busyDepth|0}; window.__bbInject('CLOSED2.tick（阿姨諮詢決定開演）'); } return r; }; return true; })()"""
HOOK_CARREL = """(()=>{ if(!STORY.populate) return false; const p0=STORY.populate;
  STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments); if(zoneId==='library_carrels'&&!window.__bbFired){ const G=GM&&GM.G; window.__bbFired={t:Math.round(performance.now()),busy:!!GAME.E.player.busy,depth:GAME.D.busyDepth|0,quietToday:!!(G&&G.flags.CARREL_QUIET===(G.day|0))}; window.__bbInject('STORY.populate（研究小間決定演那一句）'); } return r; }; return true; })()"""
DBG = """(()=>{ const D=GAME.D, E=GAME.E, P=E.player, ch=document.getElementById('choices'), it=document.getElementById('interact'), f=document.getElementById('fade');
  return {depth:D.busyDepth|0, who:(D.busyWho||[]).slice(-3), dlg:!!D.active, txt:(document.getElementById('dlgName').textContent||'')+'｜'+(document.getElementById('dlgText').textContent||'').slice(0,40),
    ch:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(b=>b.textContent.slice(0,20)):[], busy:!!P.busy, zone:GAME.G.zone, hour:+GAME.G.hour.toFixed(3), day:GAME.G.day,
    it:(it&&!it.classList.contains('hide'))?(document.getElementById('interactLabel').textContent||''):'', fade:!!(f&&f.classList.contains('on')), path:!!(P.path&&P.path.length), stale:!!D.stale,
    adv:typeof ADV!=='undefined'&&!!ADV.active, x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2), lv:P.lv|0 }; })()"""
VIS = """(()=>{ const t=document.getElementById('title3'), a=document.getElementById('letterT'), b=document.getElementById('letterB'), cs=e=>e?getComputedStyle(e):null;
  const tv=!!t&&cs(t).display!=='none'&&cs(t).visibility!=='hidden'&&+cs(t).opacity>0.05&&(t.textContent||'').trim().length>0;
  return {adv:typeof ADV!=='undefined'&&!!ADV.active, title:tv, titleTxt:t?(t.textContent||'').trim().slice(0,30):'', letter:Math.max(a?a.getBoundingClientRect().height:0,b?b.getBoundingClientRect().height:0),
    depth:GAME.D.busyDepth|0, running:(typeof EVENTS!=='undefined'&&EVENTS.running)||null, busy:!!GAME.E.player.busy}; })()"""
REL = """(()=>{ const LV=(id,f,t,c)=>{ const r=SOCIAL.rel(id); r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); }; LV('heroine_03',45,30,0); LV('classmate_bohan',45,30,0); return STORY.knows('heroine_03',GAME.G); })()"""


async def base_state(pg, key, hour, zone):
    """使用者存檔改日子（ROOM_Yn 照日子補，同 us_life_probe.load_at）"""
    st = copy.deepcopy(SAVE); st.pop('_stuck', None)
    d = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(key)) if key else st['day']
    st.update({'day': d, 'hour': hour, 'zone': zone, 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    for k, kk in (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03')):
        dd = await pg.evaluate("STORY.dayOfKey('%s')" % kk)
        if dd <= d: st['flags'][k] = dd
    return st, d


async def door_and_walk(pg, cdp, run, to, lv):
    it = await pg.evaluate("(to=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to===to); return it?[it.x,it.z,it.label,it.lv==null?null:it.lv]:null; })(%s)" % json.dumps(to))
    run.note('門（%s）：%s' % (to, it))
    if not it: return False
    await pg.evaluate("(([x,z,lv])=>{ GAME.E.placeAt(GAME.E.player,x,z+1.6,lv); })(%s)" % json.dumps([it[0], it[1], lv]))
    run.setup('[前置] 站在「%s」門口外 1.6 m（第 %d 層）' % (it[2], lv)); await pg.wait_for_timeout(2500)
    await L.go_to(pg, cdp, run, it[0], it[1], 0.9, it[2], max_s=150, lv=lv)
    for _ in range(20):
        s = await pg.evaluate(DBG)
        if s['it'] and (it[2] in s['it'] or '研討室' in s['it'] or '研究小間' in s['it']): break
        await pg.wait_for_timeout(300)
    run.note('互動按鈕：%s' % s['it']); await L.tap(pg, cdp, '#interact'); return True


async def drive(pg, cdp, run, secs, stop_tap=None):
    """像玩家一樣點對話、選選項，直到鎖 0 層、空下來 8 秒；12 秒以上「鎖著、沒有對話、沒有選項、沒在淡入淡出、沒在走」＝卡住"""
    t0 = time.time(); idle = None; free = None; last = None; taps = 0
    while time.time() - t0 < secs:
        s = await pg.evaluate(DBG); k = json.dumps(s, ensure_ascii=False)
        if k != last: last = k; run.note(k)
        if s['ch']:
            c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const e=bs.find(x=>!/算了|就這樣|不用了/.test(x.textContent))||bs[bs.length-1]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.slice(0,20)]; })()")
            await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(700); idle = free = None; continue
        if s['dlg']:
            if stop_tap and stop_tap(taps): return 'paused', s
            await L.tap(pg, cdp, '#dlg'); taps += 1; await pg.wait_for_timeout(550); idle = free = None; continue
        if s['depth'] > 0 or s['busy']:
            free = None
            if s['fade'] or s['path']: idle = None
            else:
                idle = idle or time.time()
                if time.time() - idle > 12: await run.shot(pg, 'stuck'); return 'stuck', s
        else:
            idle = None; free = free or time.time()
            if time.time() - free > 8: return 'free', s
        await pg.wait_for_timeout(450)
    return 'timeout', s


async def can_move(pg, cdp):
    best = 0.0
    for dx, dy in ((0, -60), (0, 60), (60, 0), (-60, 0)):
        moved, _, _ = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=2, ms=1500)
        best = max(best, moved)
        if moved >= 0.3: break
    return best


async def main():
    run = L.Run('stuck_harden_%s_%s' % (MODE, OVERLAP), OUT); os.makedirs(OUT, exist_ok=True); sha = os.environ.get('SHA', '?')
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await pg.evaluate(REC)
        if MODE in ('aunt', 'reload'): ok = await pg.evaluate(HOOK_AUNT)
        else: ok = await pg.evaluate(HOOK_CARREL)
        run.check('裝得上紀錄（%s）' % ('CLOSED2.tick' if MODE != 'carrel' else 'STORY.populate'), ok)
        run.setup('[捷徑] 決定開演那一刻同步叫一段測試劇情：OVERLAP=%s（inject＝玩家忙就不開、force＝照開、none＝不注入）' % OVERLAP)
        # ---------- 前置 ----------
        if MODE in ('aunt', 'reload'):
            st, d = await base_state(pg, AUNT_DAY, 9.05, 'wancai'); st['flags'].update({'lawclub': True}); st['flags'].pop('LAWCLUB_SAT_LAST', None)
            (st.get('events') or {}).get('done', {}).pop('ev_yt_aunt_consult', None)
            await L.load_state(pg, st, quiet_phone=True); await pg.wait_for_timeout(5000)
            kn = await pg.evaluate(REL)
            run.setup('[前置] 使用者存檔改到 %s 09:05 萬才館（lawclub、ROOM_Y2）；console：語彤、柏翰 FRIEND＋FIRST_MET（同 rooms_ab3_people_unit.js 的 aunt()）' % AUNT_DAY)
            due = await pg.evaluate("({due:!!(Y2B.auntDue&&Y2B.auntDue(GAME.G)),shift:!!(STORY.fafuShiftable&&STORY.fafuShiftable(GAME.G)),ok:!!(CLOSED2.auntOk&&CLOSED2.auntOk(GAME)),open:typeof Z3!=='undefined'&&Z3.roomGlbOpen?!!Z3.roomGlbOpen('wancai_semb',GAME.G):null})")
            run.check('前置：阿姨諮詢到期（Y2B.auntDue、法服值班、研討室 B 開著）', due['due'] and due['ok'], json.dumps({'knows': kn, **due}))
            walked = ENTRY == 'walk' and await door_and_walk(pg, cdp, run, 'wancai_semb', 1)
            if not walked:
                run.setup('[捷徑] GAME.enter(\'wancai_semb\')（ENTRY=load 或門找不到）'); await pg.evaluate("void GAME.enter('wancai_semb')")
        else:
            st, d = await base_state(pg, None, 14.0, 'library_hall'); st['flags'].update({'carrelDay': d, 'carrelUntil': 17.0}); st['flags'].pop('CARREL_QUIET', None)
            await L.load_state(pg, st, quiet_phone=True); await pg.wait_for_timeout(5000)
            run.setup('[前置] 使用者存檔 day %d 14:00 總圖大廳；flags.carrelDay＝今天、carrelUntil 17:00（研究小間預約）' % d)
            walked = ENTRY == 'walk' and await door_and_walk(pg, cdp, run, 'library_carrels', 1)
            if not walked:
                run.setup('[捷徑] GAME.enter(\'library_carrels\')（ENTRY=load 或門找不到）'); await pg.evaluate("void GAME.enter('library_carrels')")
        # 等決定開演
        for _ in range(120):
            if await pg.evaluate("!!window.__bbFired"): break
            await pg.wait_for_timeout(250)
        fired = await pg.evaluate("window.__bbFired"); inj = await pg.evaluate("window.__bbInj")
        run.check('決定開演了（%s）' % ('CLOSED2.tick 回 true' if MODE != 'carrel' else '進研究小間、今天還沒說過'), bool(fired), json.dumps(fired, ensure_ascii=False))
        run.note('注入：%s' % json.dumps(inj, ensure_ascii=False))
        await run.shot(pg, 'fired')
        if MODE == 'reload':
            # ---------- 讀檔：演到第 3 句就讀別的檔 ----------
            res, s = await drive(pg, cdp, run, 180, stop_tap=lambda n: n >= 2)
            run.check('阿姨諮詢演到一半（第 3 句、對話框開著）', res == 'paused', json.dumps(s, ensure_ascii=False))
            other = copy.deepcopy(SAVE); other.pop('_stuck', None)
            run.setup('[捷徑] 劇情中途 GAME.applySave(使用者原本的存檔：day 14 麵店)——選單「讀取」在劇情中會擋，卡住（stale）或回標題以後讀檔走的也是 applySave')
            lg0 = await pg.evaluate("(typeof GAME.loadGen==='number')?GAME.loadGen:null")
            await L.load_state(pg, other, quiet_phone=True); await pg.wait_for_timeout(3000)
            a0 = await pg.evaluate(DBG); run.note('讀檔 3 秒後 %s' % json.dumps(a0, ensure_ascii=False))
            lg1 = await pg.evaluate("(typeof GAME.loadGen==='number')?GAME.loadGen:null")
            if lg0 is not None or lg1 is not None:   # LOAD-GEN-ABORT-1028（LAWWW-C c1e7a32d7）以後才有
                run.check('LOAD-GEN：讀檔前後 GAME.loadGen 加一（%s → %s）' % (lg0, lg1), lg0 is not None and lg1 is not None and lg1 >= lg0 + 1)
                run.check('LOAD-GEN：讀進來以後舊的對話框、選項收掉了（不用點）', not a0['dlg'] and not a0['ch'], json.dumps(a0, ensure_ascii=False))
                vis = await pg.evaluate(VIS)   # LOADGEN-LOCKS-1028（LAWWW-C 8de0993cd）第 3 點：2D、標題卡、黑邊、鎖
                run.note('讀檔後畫面：%s' % json.dumps(vis, ensure_ascii=False))
                run.check('LOADGEN-LOCKS：讀檔後 ADV.active＝false（2D 沒有蓋著）、標題卡和黑邊不見、busyDepth＝0', (not vis['adv']) and (not vis['title']) and vis['letter'] < 2 and vis['depth'] == 0, json.dumps(vis, ensure_ascii=False))
                await run.shot(pg, 'reload_after')
            else:
                run.note('這一版沒有 GAME.loadGen（LOAD-GEN-ABORT-1028 以前）')
            n0 = await pg.evaluate("window.__bbLog.length")
            res2, s2 = await drive(pg, cdp, run, 60)
            after = await pg.evaluate("window.__bbLog.slice(%d)" % n0)
            olds = [x for x in after if any(w in x['k'] for w in ('阿姨', '柏翰｜', '語彤｜', '租約', '諮詢'))]
            run.note('讀檔以後畫面上出現的句子：%s' % json.dumps(after, ensure_ascii=False))
            run.check('讀檔以後鎖 0 層、不忙（照玩家點掉還開著的對話框以後）', res2 == 'free' and s2['depth'] == 0 and not s2['busy'], json.dumps(s2, ensure_ascii=False))
            run.check('舊的那一段（阿姨諮詢）沒有在新的那一局接著演', not olds, json.dumps(olds, ensure_ascii=False))
            g = await pg.evaluate("({zone:GAME.G.zone, day:GAME.G.day, sat:GAME.G.flags.LAWCLUB_SAT_LAST==null?null:GAME.G.flags.LAWCLUB_SAT_LAST, aunt:!!(GAME.G.events.done||{}).ev_yt_aunt_consult})")
            run.check('新的那一局是讀進來的那一份（麵店、day 14、沒有記阿姨諮詢）', g['zone'] == 'noodle' and g['day'] == SAVE['day'] and not g['aunt'], json.dumps(g))
            await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1200)
            mo = await pg.evaluate("!document.getElementById('menu').classList.contains('hide')")
            run.check('選單打得開', mo)
            if mo: await L.tap(pg, cdp, '#btnClose'); await pg.wait_for_timeout(800)
            mv = await can_move(pg, cdp); run.check('推搖桿走得動（至少 0.3 m）', mv >= 0.3, '%.2f m' % mv)
            # 再讀一次阿姨諮詢到期的狀態：還能不能重新開始
            await pg.evaluate("(()=>{ window.__bbFired=null; window.__bbOverlap='none'; return true; })()")
            st2, _ = await base_state(pg, AUNT_DAY, 9.05, 'wancai'); st2['flags'].update({'lawclub': True}); st2['flags'].pop('LAWCLUB_SAT_LAST', None)
            (st2.get('events') or {}).get('done', {}).pop('ev_yt_aunt_consult', None)
            await L.load_state(pg, st2, quiet_phone=True); await pg.wait_for_timeout(4000); await pg.evaluate(REL)
            run.setup('[捷徑] 再讀一次「2027-05-22 09:05 萬才館、阿姨諮詢到期」→ GAME.enter(\'wancai_semb\')')
            await pg.evaluate("void GAME.enter('wancai_semb')")
            n1 = await pg.evaluate("window.__bbLog.length"); again = False; walked = False; asked = False
            for it_n in range(200):
                lg = await pg.evaluate("window.__bbLog.slice(%d).map(x=>x.k)" % n1)
                if any(AUNT0 in k for k in lg): again = True; break
                # 09:04 法服值班的出發提醒（outings S.prompt：出發／晚一點／這週請假）先跳出來＝照玩家選「出發」（BB-C 10-28 sh_reload：沒回答它，諮詢就一直等著）
                pk = await pg.evaluate("(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return null; const bs=[...ch.querySelectorAll('button')]; const b=bs.find(x=>/^出發/.test(x.textContent)); if(!b) return null; b.click(); return b.textContent; })()")
                if pk: run.note('[玩家操作] 值班提醒選「%s」' % pk[:30]); asked = True
                # 選「出發」＝被帶到萬才館一樓值班（不在研討室 B）：等換區域完、空下來以後照玩家走上二樓、進研討室 B，諮詢才會開始
                # （BB-C 10-28 sh_reload_r2／lg2：停在一樓大廳 (0,5)；lg2 只等 3 秒就看區域，那時還沒換過去）
                q = await pg.evaluate(DBG)
                if not walked and (asked or it_n >= 20) and q['zone'] != 'wancai_semb' and not q['busy'] and not q['dlg'] and not q['ch'] and not q['fade']:
                    walked = True; run.note('不在研討室 B（%s (%s,%s)）→ 照玩家走過去' % (q['zone'], q['x'], q['z']))
                    if not await door_and_walk(pg, cdp, run, 'wancai_semb', 1):
                        run.setup('[捷徑] 研討室 B 的門找不到：GAME.enter(\'wancai_semb\')'); await pg.evaluate("void GAME.enter('wancai_semb')")
                await pg.wait_for_timeout(500)
            run.check('讀檔以後阿姨諮詢還能重新開始（CLOSED2 的 busy 沒有一直卡著）', again, json.dumps(await pg.evaluate(DBG), ensure_ascii=False))
            if again: await drive(pg, cdp, run, 240)
        else:
            # ---------- 照玩家點完 ----------
            res, s = await drive(pg, cdp, run, 360)
            await run.shot(pg, 'end')
            log = await pg.evaluate("window.__bbLog"); cover = await pg.evaluate("window.__bbCover"); done_t = await pg.evaluate("window.__bbInjDone")
            run.note('對話紀錄：%s' % json.dumps(log, ensure_ascii=False)); run.note('蓋過的：%s' % json.dumps(cover, ensure_ascii=False))
            ks = [x['k'] for x in log]
            run.check('沒有卡在說話的畫面（照玩家點完以後鎖 0 層、不忙、沒有對話框）', res == 'free' and s['depth'] == 0 and not s['busy'] and not s['dlg'], json.dumps(s, ensure_ascii=False))
            if MODE == 'aunt':
                g = await pg.evaluate("({aunt:(GAME.G.events.done||{}).ev_yt_aunt_consult||0, sat:GAME.G.flags.LAWCLUB_SAT_LAST, day:GAME.G.day})")
                run.check('阿姨諮詢有演：第一句出現、演完記 ev_yt_aunt_consult、值班算一次', any(AUNT0 in k for k in ks) and g['aunt'] and g['sat'] == g['day'], json.dumps(g))
            else:
                q = await pg.evaluate("({quiet:LUPS.LINES.quiet, said:GAME.G.flags.CARREL_QUIET===(GAME.G.day|0)})")
                run.check('研究小間那一句有演（%s）、記 CARREL_QUIET＝今天' % q['quiet'], any(q['quiet'] in k for k in ks) and q['said'], json.dumps(q, ensure_ascii=False))
            if inj and inj.get('injected'):
                n_inj = sum(1 for k in ks if INJ in k)
                run.check('注入的那一段也演完了（測試那一句的 promise 有回來、sceneEnd）', bool(done_t), json.dumps({'injDone': done_t, 'shown': n_inj, 'cover': cover}, ensure_ascii=False))
                if cover:
                    # 正式劇情演的時候記到「有一句被蓋」（coverWho），正式劇情演完以後測試那一句再出現＝放回去了。
                    # 測試那一句第一次出現常常在同一格就被蓋掉，50 ms 一次的紀錄在 1 fps 的沙盒看不到（BB-C 10-28 sh_carrel_force：只記到「正式→測試」兩筆，第一筆就帶 cover）——不要求它出現兩次
                    off = next((i for i, x in enumerate(log) if INJ not in x['k'] and x.get('cover')), None)
                    back = off is not None and any(INJ in x['k'] for x in log[off + 1:])
                    run.check('被蓋的那一句演完以後放回去（正式劇情演的時候記到被蓋、演完以後測試那一句再出現）', back, json.dumps(ks, ensure_ascii=False)[:600])
            else:
                run.note('沒有注入（決定開演那一刻 busy %s、鎖 %s 層）' % (inj and inj.get('busy'), inj and inj.get('depth')))
                if OVERLAP == 'inject': run.check('inject：決定開演那一刻已經鎖住（新版預期；舊版會注入）', bool(inj) and inj.get('injected') is False and (inj.get('busy') or inj.get('depth', 0) > 0), json.dumps(inj, ensure_ascii=False))
            mv = await can_move(pg, cdp); run.check('推搖桿走得動（至少 0.3 m）', mv >= 0.3, '%.2f m' % mv)
        st_now = await pg.evaluate("({stale:!!GAME.D.stale, stuck:(()=>{ try{ return JSON.parse(localStorage.getItem('fatiao3d_stuck')||'[]').length; }catch(e){ return -1; } })()})")
        run.note('staleCheck：%s' % json.dumps(st_now))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        print('SHA', sha, 'MODE', MODE, 'OVERLAP', OVERLAP, 'ENTRY', ENTRY)
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
