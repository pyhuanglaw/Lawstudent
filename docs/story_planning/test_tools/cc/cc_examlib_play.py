"""CC-C（帳號 C）11-04：EXAMLIB T-a、T-b（期末考前的圖書館，EXAM-LIB-CROWD-1104；BB-C 17:29；規格 BB_260 第 2 節、AA_669 第 2、4-1 節）——瀏覽器、照玩家操作走。
  期望值照 AA_669／BB_260（不照遊戲現在的輸出，CC_50 第 41 條）。判定歸 BB。Windows＋GPU／SwiftShader ≠ iPhone。
  CASES=ta：第 14 週平日 10:30 進總圖大廳（library_hall），【前置／捷徑】讀檔到大廳；之後玩家自己走（L.go_to：點地面、走不動推搖桿）上二樓、走向一個讀書的位子。
      要對：一進門的旁白（第一次進這一間，T-d 那五句之一）→「（繞了一圈，空的位子上都有人放了東西。）」→ 選項「再繞一圈」「去別間」「回宿舍讀」（沒設朋友＝不該有「招手」）；
      選「再繞一圈」＝時間 +20 分鐘，之後「（靠走道的那個人剛好在收書包。）」→ 坐下，或「（還是沒有。）」→ 再出選項時沒有「再繞一圈」（只能一次）。
      「14:00 以前大約一半的機會」是很多天的比例，一次只看得到一種：在 Node（cc_examlib_walk.js）算比例。
  CASES=tb：第 14 週平日的前一晚 19:00 在宿舍。【前置／捷徑】柏翰設成朋友（FRIEND）、有聯絡方式（同 cc_social_smoke_probe 的 SETUP_JS）。
      玩家用手機：朋友 → 柏翰「訊息」→「傳訊息」→「明天幫我占位子」：回「可以。我七點二十到。3F 靠窗第二排，左邊那個給你。」
      A 組：【捷徑】讀檔到隔天 09:00 的總圖 3F（閱覽室 library；跳過睡覺）→ 柏翰旁邊那一位顯示「有人了」→ 玩家走進讀書區＝直接走過去坐下（不跳找不到位子）→ 柏翰「（小聲）你的位子旁邊有插座，我順便看了。」
      B 組：同一個私訊，【捷徑】讀檔到隔天 12:05（人不去）→ 收到「十二點零一分。位子收了。」；關係值（fam／trust／comf／rom）和私訊前一樣。
  CASES=t42（EXAMLIB_42_reserve，BB-C 18:2x；36d2172dd D42-RESERVE-1104：答應 4-2 的那天，那一間先保留兩個連著的空位）：阿哲前一晚 21:00 私訊（AA_669 4-2 表：「明天你先到的話 幫我占一個」「我九點半到 應該」），
      玩家用手機回「好。」（訊息 → 阿哲 → 「好。」）；【前置／捷徑】阿哲設成朋友、有聯絡方式；隔天用同一份存檔跳時間（跳過睡覺）。四組：
      A    隔天 09:30 進總圖 B1（library_b1）→ 直接走到保留的那一對、坐下 →「（你把一本講義放在旁邊的位子上。）」→ 10:40 阿哲走進來坐下：「（他喘著氣坐下。）」「（小聲）……鬧鐘沒響。謝啦。」
      F    同 A，但問的那一天換成明天是期末週的那一天（【捷徑】EXLIB.ask42Day 指定日子），進 B1 以後其他讀書的位子全部標成有人（【捷徑】seat.taken）＝一樣放得了講義
      none 沒去：隔天 12:30 在宿舍 → 收到「沒位子 我回宿舍讀」、關係值不變
      late 11:00 才到 B1 → 不放講義、收到「沒位子 我回宿舍讀」、關係值不變
      每一組都記保留的那一對（ZS.pair42）有沒有老位子（seat.old）。
  用法：LW_TESTS=<wt>/tests [CASES=ta,tb,t42] [T42=A,F,none,late] [DAY=2025-12-01] python3 cc_examlib_play.py <url> <out>"""
import os, sys, json, asyncio, time, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
CASES = [c.strip() for c in (os.environ.get('CASES') or 'ta,tb').split(',') if c.strip()]
DAYKEY = os.environ.get('DAY') or '2025-12-02'   # Y1S1 第 14 週週二（前一晚＝週一也在第 14 週：「明天幫我占位子」只在這一段出；11-04 雲端第一輪用 12-01，前一晚 11-30 是第 13 週＝探針的 bug）
R = L.Run('examlib_play', OUT)
X = {'say': '（繞了一圈，空的位子上都有人放了東西。）', 'again': '再繞一圈', 'other': '去別間', 'dorm': '回宿舍讀', 'lucky': '（靠走道的那個人剛好在收書包。）', 'none': '（還是沒有。）',
     'atmos': ['（每一張桌子都有人。有人把外套掛在椅背上，人不在。）', '（桌角貼著「離座請勿超過三十分鐘」。整排空位上都放著一本書。）', '（飲水機前面排了三個人，每個人手上都拿著水壺。）',
               '（有人趴在講義上睡著了，手上還握著螢光筆。）', '（翻書的聲音此起彼落，沒有人講話。）', '（閉館前十分鐘的廣播響了，一個起來的人都沒有。）'],
     'bohan_yes': '可以。我七點二十到。3F 靠窗第二排，左邊那個給你。', 'bohan_at': '（小聲）你的位子旁邊有插座，我順便看了。', 'bohan_miss': '十二點零一分。位子收了。', 'held': '有人了'}
# 每一句台詞都從 GAME.say 收（不靠畫面上的字：打字效果在 SwiftShader 很慢、讀檔過程中的旁白來不及看到——11-04 雲端第二、三輪）
SAYHOOK = r"""(()=>{ if(window.__ccSayOn) return true; window.__ccSay=[]; const s0=GAME.say; GAME.say=function(who,t){ try{ window.__ccSay.push({who:who&&(who.name||who.charId)||(typeof who==='string'?who:null), t:String(t), h:+(+GAME.G.hour).toFixed(3), zone:GAME.G.zone}); }catch(e){} return s0.apply(this,arguments); }; window.__ccSayOn=true; return true; })()"""
SAYS = "(n=>(window.__ccSay||[]).slice(n))"
SETUP_JS = r"""(c=>{ const G=GAME.G, F=G.flags||(G.flags={}), id=c.id, so=G.social||(G.social={});
  SOCIAL.meet(id,G.zone); F['met_'+id]=true; const R=SOCIAL.rel(id); for(const k in c.rel) R[k]=c.rel[k];
  G.contacts=G.contacts||{}; G.contacts[id]=G.day-30; so.fm120=true;
  return {stage:SOCIAL.stage(id), rel:Object.assign({},SOCIAL.rel(id)), contact:G.contacts[id]!=null}; })"""
FRIEND = {'fam': 45, 'trust': 30, 'comf': 25, 'rom': 0, 'npcRom': 0}
UI = r"""(()=>{ const t=(document.getElementById('dlgText')||{}).textContent||'', ch=document.getElementById('choices'); const open=!!ch&&!ch.classList.contains('hide');
  const opts=open?[...ch.querySelectorAll('button,.choice,[data-k]')].map(b=>(b.innerText||b.textContent||'').trim().split('\n')[0].trim()).filter(Boolean):[];   /* 按鈕第二行是提示（「時間 +20 分鐘」）：只比第一行 */
  const D=GAME.D||{}; return {dlg:!!D.active, text:t, opts, hour:+(+GAME.G.hour).toFixed(3), zone:GAME.G.zone, seat:!!GAME.E.player.seat, busy:!!GAME.E.player.busy}; })()"""
HOLD = r"""(()=>{ const Z=EXLIB._zs&&EXLIB._zs(), E=GAME.E, G=GAME.G, hs=Z&&Z.holdSeat; const own=hs?E.interactables.find(i=>i.seat===hs):null;
  return {hold:(G.exlib||{}).hold||null, holdSeat:hs?{x:+hs.x.toFixed(2), z:+hs.z.toFixed(2), lv:hs.lv|0, taken:hs.taken||null, exHeld:!!hs.exHeld}:null, holdIt:Z&&Z.holdIt?Z.holdIt.label:null, seatIt:own?own.label:null,
    autoSitDue:EXLIB.autoSitDue?EXLIB.autoSitDue(GAME):null, inStudy:EXLIB.inStudy(GAME), seat:!!E.player.seat, busy:!!E.player.busy}; })()"""
DIAG = r"""(()=>{ const E=GAME.E, P=E.player, o=P.obj.position, G=GAME.G, R=G.exlib||{}; let st={}; try{ st={inStudy:EXLIB.inStudy(GAME), here:EXLIB.here(GAME), atmosDue:EXLIB.atmosDue(GAME), fullDue:EXLIB.fullDue(GAME), studyAt:typeof LIBQ!=='undefined'&&LIBQ.studyAt?LIBQ.studyAt(G.zone,P.lv|0,o.x,o.z):'-', held:(EXLIB.awaySeats?EXLIB.awaySeats(GAME).length:'-')}; }catch(e){ st={err:String(e).slice(0,120)}; }
  return Object.assign({zone:G.zone, lv:P.lv|0, x:+o.x.toFixed(2), z:+o.z.toFixed(2), hour:+(+G.hour).toFixed(2), busy:!!P.busy, seat:!!P.seat, prompt:R.prompt||null, atm:R.atm||null}, st); })()"""
SEATS2F = r"""(lv=>{ const E=GAME.E, z=E.zone, out=[]; (z.seats||[]).forEach((st,i)=>{ if((st.lv|0)!==lv) return; const it=E.interactables.find(q=>q.seat===st); if(!it) return;
  const ap=GAME.seatApproach?GAME.seatApproach(st):null; out.push({i, x:+st.x.toFixed(2), z:+st.z.toFixed(2), lv:st.lv|0, label:it.label||'', held:!!st.exHeld, ax:ap?ap[0]:st.x, az:ap?ap[1]:st.z}); }); return out; })"""


async def pick(pg, cdp, text):
    ok = await pg.evaluate("(t=>{ const ch=document.getElementById('choices'); if(!ch) return false; const b=[...ch.querySelectorAll('button,.choice,[data-k]')].find(x=>(x.innerText||x.textContent||'').trim().split('\\n')[0].trim()===t); if(!b) return false; b.setAttribute('data-ccpick','1'); return true; })", text)
    if not ok: return False
    await L.tap(pg, cdp, '[data-ccpick="1"]'); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ const b=document.querySelector('[data-ccpick]'); if(b) b.removeAttribute('data-ccpick'); })()")
    return True


async def read_until(pg, cdp, max_s=40, want_opts=True):
    """點對話框把台詞一句一句點完，收集台詞；遇到選項就停（回傳台詞和選項）"""
    lines = []; t0 = time.time(); last = None
    while time.time() - t0 < max_s:
        u = await pg.evaluate(UI)
        if u['opts'] and want_opts: return lines, u
        if u['dlg'] and u['text']:
            # 打字效果：字不再變了才記、才點（11-04 雲端第二輪記到打到一半的字＝探針的 bug）
            t1 = time.time()
            while time.time() - t1 < 8:
                await pg.wait_for_timeout(350); u2 = await pg.evaluate(UI)
                if not u2['dlg'] or u2['text'] == u['text']: break
                u = u2
            if u['text'] != last: lines.append(u['text']); last = u['text']
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if lines and not u['dlg']: return lines, u
        await pg.wait_for_timeout(250)
    return lines, await pg.evaluate(UI)


async def says_since(pg, n):
    return [x['t'] for x in await pg.evaluate(SAYS, n)]


async def case_ta(pg, cdp):
    await pg.evaluate(SAYHOOK); n0 = await pg.evaluate("(window.__ccSay||[]).length")
    R.setup('讀檔：總圖大廳（library_hall）、%s（第 14 週週一）10:30、晴；條件事件照開' % DAYKEY)
    await L.load_state(pg, {'zone': 'library_hall', 'hour': 10.5, 'day': await pg.evaluate("STORY.dayOfKey(%s)" % J(DAYKEY)), 'weather': 'clear'})
    lines0, _u0 = await read_until(pg, cdp, 15)   # 讀檔一進來就在讀書區：一進門的旁白這時候就出（11-04 雲端第一輪先 close_panels 把它點掉了＝探針的 bug）
    R.note('[T-a] 讀檔進來時的台詞：%s' % J(lines0))
    await L.close_panels(pg, cdp)
    on = await pg.evaluate("(()=>({on:EXLIB.on(GAME.G), fill:+EXLIB.fill(GAME.G,'library_hall').toFixed(2), full:EXLIB.fullH(GAME.G,'library_hall'), term:CALENDAR.termOf(GAME.G.day)}))()")
    R.check('[T-a] 這一天在「期末考前的圖書館」那一段、10:30 已經全滿的時間', on['on'] and on['full'] <= 10.5, J(on))
    seats = await pg.evaluate(SEATS2F + '(1)')
    study = [s for s in seats if s['held'] or '讀書' in s['label'] or '坐' in s['label']]
    R.note('[T-a] 二樓的座位 %d 個；「有人了」%d 個' % (len(seats), sum(1 for s in seats if s['held'])))
    if not R.check('[T-a] 二樓有讀書的座位', bool(study), J(seats[:3])): return
    tgt = sorted(study, key=lambda s: -s['held'])[0]
    h0 = (await pg.evaluate(UI))['hour']
    # 停止條件看「對話框開著／有選項」（#dlgText 關掉以後字還在：11-04 雲端第一輪 stop 一開始就成立＝探針的 bug）；每停一次收台詞、再走，直到出現選項
    lines = list(lines0); u = {'opts': []}
    for k in range(5):
        ok = await L.go_to(pg, cdp, R, tgt['ax'], tgt['az'], 0.6, '二樓讀書區的座位旁邊', lv=1, stop=lambda s: bool(s.get('dlg')) or bool(s.get('choices')))
        dg = await pg.evaluate(DIAG)
        R.note('[T-a] 走（第 %d 次，go_to=%s）：%s' % (k + 1, ok, J(dg)))
        ln, u = await read_until(pg, cdp)
        lines += ln
        if u['opts']: break
        if ok and not ln and math.hypot(dg['x'] - tgt['ax'], dg['z'] - tgt['az']) < 1.0: break
    lines = await says_since(pg, n0)   # GAME.say 收到的（完整句子，含讀檔一進來那一句）
    R.note('[T-a] 走上二樓：台詞 %s；選項 %s' % (J(lines), J(u['opts'])))
    at = [l for l in lines if l in X['atmos']]
    R.check('[T-a]（T-d）第一次進這一間的旁白是那五句之一（10:30 不是閉館前）', len(at) == 1 and at[0] in X['atmos'][:5], J(lines))
    R.check('[T-a] 找不到位子的提示「%s」' % X['say'], X['say'] in lines, J(lines))
    R.check('[T-a] 三個選項「再繞一圈」「去別間」「回宿舍讀」，沒有朋友＝沒有「招手」', u['opts'][:3] == [X['again'], X['other'], X['dorm']] and len(u['opts']) == 3, J(u['opts']))
    await R.shot(pg, 'ta_prompt')
    if X['again'] not in u['opts']: return
    h1 = u['hour']; n1 = await pg.evaluate("(window.__ccSay||[]).length"); await pick(pg, cdp, X['again'])
    _l2, u2 = await read_until(pg, cdp); await pg.wait_for_timeout(1500); _l2b, u2b = await read_until(pg, cdp, 8); u2 = u2b if u2b['opts'] else u2
    lines2 = await says_since(pg, n1)
    dh = round((u2['hour'] - h1) * 60)
    R.note('[T-a] 再繞一圈以後：台詞 %s；選項 %s；時間 %s → %s（%+d 分）' % (J(lines2), J(u2['opts']), h1, u2['hour'], dh))
    R.check('[T-a] 再繞一圈＝時間 +20 分鐘', 19 <= dh <= 21, '%+d 分' % dh)
    if X['lucky'] in lines2:
        await pg.wait_for_timeout(2500); st = await pg.evaluate(UI)
        R.check('[T-a] 有人收東西走了 → 坐下', st['seat'], J(st))
    elif X['none'] in lines2:
        R.check('[T-a] 還是沒有 → 再出選項時沒有「再繞一圈」（只能一次）', bool(u2['opts']) and X['again'] not in u2['opts'], J(u2['opts']))
        if X['dorm'] in u2['opts']: R.note('[T-a] 不選，按「去別間」看看'); await pick(pg, cdp, X['other']); l3, u3 = await read_until(pg, cdp, 10); R.note('[T-a] 去別間的選項：%s' % J(u3['opts'])); await R.shot(pg, 'ta_other')
    else:
        R.check('[T-a] 再繞一圈之後是「%s」或「%s」' % (X['lucky'], X['none']), False, J(lines2))
    await R.shot(pg, 'ta_after')


async def dm_bohan(pg, cdp, tag):
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    await L.tap(pg, cdp, '#phoneTabs [data-ptab="friends"]'); await pg.wait_for_timeout(1200)
    if not R.check('%s 手機朋友頁柏翰那一行有「訊息」' % tag, await L.tap(pg, cdp, '#phoneBody [data-msg="classmate_bohan"]'), ((await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''"))[:200])): return None
    await pg.wait_for_timeout(1200)
    if not R.check('%s 有「傳訊息」' % tag, await L.tap(pg, cdp, '#phoneBody [data-msgto="classmate_bohan"]'), ''): return None
    await pg.wait_for_timeout(1000)
    topics = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-msgt]')].map(b=>({k:b.dataset.msgt, t:(b.innerText||'').trim()}))")
    R.note('%s 話題：%s' % (tag, J(topics)))
    tp = [t for t in topics if '明天幫我占位子' in t['t']]
    if not R.check('%s 有「明天幫我占位子」這個話題（18:00～23:00、FRIEND 以上）' % tag, bool(tp), J(topics)): return None
    m0 = await pg.evaluate("(GAME.G.msgs||[]).length")
    await L.tap(pg, cdp, '#phoneBody [data-msgt="%s"]' % tp[0]['k']); await pg.wait_for_timeout(2500)
    new = await pg.evaluate("(n=>(GAME.G.msgs||[]).slice(n).map(m=>({th:m.th, from:m.from||m.who||null, text:m.text})))", m0)
    R.note('%s 傳出去以後的訊息：%s' % (tag, J(new)))
    await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(800); await L.close_panels(pg, cdp)
    return new


GOES = r"""(k=>{ const G=GAME.G, d0=STORY.dayOfKey(k); for(let d=d0;d<d0+14;d++){ const wd=CALENDAR.dateOf(d).wd; if(wd<2||wd>5) continue; if(!EXLIB.on(G,d-1,19)||!EXLIB.on(G,d,9)) continue;
  if(EXLIB.goes(G,'classmate_bohan',d)) return {day:d, key:CALENDAR.dateOf(d).key, wd}; } return null; })"""


async def case_tb(pg, cdp, group):
    # 柏翰隔天要「去」圖書館的那一天（隔天作息裡有讀書、早上不是上課考試；11-04 雲端第一輪 12-02 他回「明天我考兩科」＝那天他不去，挑錯日子＝探針的 bug）
    await L.load_state(pg, {'zone': 'dorm', 'hour': 19.0, 'day': await pg.evaluate("STORY.dayOfKey(%s)-1" % J(DAYKEY)), 'weather': 'clear'}, quiet_phone=True)
    await pg.wait_for_timeout(3000)
    tgt = await pg.evaluate(GOES, DAYKEY)
    if not R.check('[T-b%s] 第 14～15 週找得到柏翰隔天會去圖書館的那一天（EXLIB.goes）' % group, bool(tgt), J(tgt)): return
    d0 = tgt['day'] - 1
    R.setup('讀檔：宿舍、%s 的前一天 19:00；柏翰設成朋友、有聯絡方式（SETUP_JS）' % tgt['key'])
    await L.load_state(pg, {'zone': 'dorm', 'hour': 19.0, 'day': d0, 'weather': 'clear'}, quiet_phone=True)
    await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
    r0 = await pg.evaluate(SETUP_JS, {'id': 'classmate_bohan', 'rel': FRIEND})
    R.note('[T-b%s] 柏翰：%s' % (group, J(r0)))
    new = await dm_bohan(pg, cdp, '[T-b%s]' % group)
    if new is None: return
    # 他的回覆照遊戲排的時間才送到（19:01 傳、約 19:35 回；遊戲時間要往前走才到——11-04 雲端第四輪站著等 122 秒，時鐘停在 19:01）：答應那一則在隔天讀檔以後看（check_yes）
    QJS = "(()=>{ try{ const P=PHONE.rec(GAME.G); return {now:[GAME.G.day,+(+GAME.G.hour).toFixed(3)], q:(P.q||[]).filter(q=>/^exlib41/.test(q.tag||'')).map(q=>({day:q.day,h:+(+q.h).toFixed(3),tag:q.tag,n:q.items.length,t0:(q.items[0]||{}).text})), sent:PHONE.sent?PHONE.sent(GAME.G,'exlib41_'+(GAME.G.day|0)):null}; }catch(e){ return {err:String(e)}; } })()"
    R.note('[T-b%s] 傳完以後手機排好的回覆（PHONE.rec(G).q）：%s' % (group, J(await pg.evaluate(QJS))))
    async def check_yes():
        # 讀檔以後第一次 PHONE.tick 才把前一晚排好的回覆補進去（11-04 雲端第六輪讀檔後馬上看＝還在佇列裡）：最多等 15 秒
        t1 = time.time(); got = []
        while time.time() - t1 < 15:
            got = await pg.evaluate("(GAME.G.msgs||[]).filter(m=>m.th==='p:classmate_bohan').slice(-5).map(m=>({day:m.day, h:m.h, from:m.from||m.who||null, text:m.text}))")
            if any(m['text'] == X['bohan_yes'] for m in got): break
            await pg.wait_for_timeout(1000)
        R.note('[T-b%s] 隔天讀檔以後手機排好的回覆：%s' % (group, J(await pg.evaluate(QJS))))
        R.check('[T-b%s] 前一晚柏翰答應「%s」（隔天讀檔以後看私訊）' % (group, X['bohan_yes']), any(m['text'] == X['bohan_yes'] for m in got), J(got))
    hold = await pg.evaluate("(()=>{ const R=GAME.G.exlib||{}; return R.hold||null; })()")
    R.note('[T-b%s] G.exlib.hold＝%s' % (group, J(hold)))
    rel0 = await pg.evaluate("Object.assign({},SOCIAL.rel('classmate_bohan'))")
    snap = await pg.evaluate("JSON.stringify(GAME.snapshot())")
    if group == 'A':
        R.setup('[T-bA] 讀檔（同一份存檔）跳到隔天 09:00、總圖 3F 閱覽區（library）——跳過睡覺')
        await pg.evaluate("(s=>{ const G=JSON.parse(s); G.day=G.day+1; G.hour=9; G.zone='library'; delete G.pos; window.__ccSnap=G; })", snap)
        await pg.evaluate("(async()=>{ await GAME.applySave(window.__ccSnap); })()"); await pg.wait_for_timeout(7000); await L.close_panels(pg, cdp)
        await check_yes()
        await pg.evaluate(SAYHOOK); nA = await pg.evaluate("(window.__ccSay||[]).length")
        lines, u = await read_until(pg, cdp, 15)   # 讀檔一進來（一進門的旁白）
        bo = await pg.evaluate("(()=>{ const n=GAME.npc&&GAME.npc.classmate_bohan; if(!n) return null; const p=n.obj.position; return {x:+p.x.toFixed(2), z:+p.z.toFixed(2), seat:!!n.seat}; })()")
        hd = await pg.evaluate(HOLD)
        R.note('[T-bA] 柏翰 %s；占的位子 %s' % (J(bo), J(hd)))
        R.check('[T-bA] 柏翰在 3F、坐著', bool(bo) and bo['seat'], J(bo))
        hs = hd.get('holdSeat')
        dd = math.hypot(hs['x'] - bo['x'], hs['z'] - bo['z']) if (hs and bo) else None
        R.check('[T-bA] 柏翰旁邊留了一個位子（taken＝exlib41、路人不坐；離柏翰 %s m）' % (round(dd, 2) if dd is not None else '?'), bool(hs) and dd is not None and dd < 2.6 and hs.get('taken') == 'exlib41', J(hd))
        R.note('[T-bA] 那個位子的按鈕：座位本身「%s」；另外一個「%s」（BB_260 寫「顯示有人了」，照實記，BB 判）' % (hd.get('seatIt'), hd.get('holdIt')))
        # 玩家走進讀書區＝直接走過去坐下（autoSitDue）：先等 15 秒看會不會自己坐過去
        t1 = time.time(); st = await pg.evaluate(UI)
        while time.time() - t1 < 15 and not st['seat']:
            ln, u = await read_until(pg, cdp, 3); lines += ln; st = await pg.evaluate(UI)
        if not st['seat'] and hs:
            R.note('[T-bA] 15 秒沒有自己坐過去（%s）→ 走到那個位子旁邊' % J(await pg.evaluate(HOLD)))
            ok = await L.go_to(pg, cdp, R, hs['x'], hs['z'] + 0.6, 1.0, '柏翰占的位子', lv=hs['lv'], stop=lambda s: bool(s.get('dlg')) or bool(s.get('choices')))
            it = (await pg.evaluate(L.STATE_JS))['interact'] if hasattr(L, 'STATE_JS') else ''
            R.note('[T-bA] 走到那個位子旁邊：互動鈕「%s」' % it)
            if '占的位子' in it: await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
            for _ in range(6):
                ln, u = await read_until(pg, cdp, 5); lines += ln; st = await pg.evaluate(UI)
                if st['seat'] and any(X['bohan_at'] == l for l in lines): break
        await pg.wait_for_timeout(1500); ln, u = await read_until(pg, cdp, 8); st = await pg.evaluate(UI)
        lines = await says_since(pg, nA); R.note('[T-bA] 最後的狀態 %s' % J(await pg.evaluate(HOLD)))
        R.note('[T-bA] 走進讀書區以後：台詞 %s；選項 %s；%s' % (J(lines), J(u['opts']), J(st)))
        R.check('[T-bA] 沒有跳「找不到位子」（有人占了位子的那一天）', X['say'] not in lines, J(lines))
        hf = await pg.evaluate(HOLD); H2 = hf.get('hold') or {}
        # 判定看遊戲自己記的（hold.arrived＋sitH＝坐到占的位子的時間）：之後座位選單的按鈕可能被探針點到「起身」（11-04 雲端第五輪）
        R.check('[T-bA] 玩家直接坐下（坐到柏翰占的位子：hold.arrived、sitH）', bool(H2.get('arrived')) and H2.get('sitH') is not None, J({'hold': H2, 'seat_now': st['seat']}))
        R.check('[T-bA] 柏翰說「%s」' % X['bohan_at'], X['bohan_at'] in lines, J(lines))
        await R.shot(pg, 'tbA_sat')
    else:
        R.setup('[T-bB] 讀檔（同一份存檔）跳到隔天 12:05、宿舍（人不去）')
        await pg.evaluate("(s=>{ const G=JSON.parse(s); G.day=G.day+1; G.hour=12+5/60; G.zone='dorm'; delete G.pos; window.__ccSnap=G; })", snap)
        await pg.evaluate("(async()=>{ await GAME.applySave(window.__ccSnap); })()"); await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp)
        got = await pg.evaluate("(GAME.G.msgs||[]).filter(m=>m.th==='p:classmate_bohan').slice(-4).map(m=>({day:m.day, h:m.h, text:m.text}))")
        R.note('[T-bB] 柏翰的私訊最後幾則：%s' % J(got)); await check_yes()
        R.check('[T-bB] 12:00 還沒到：收到「%s」' % X['bohan_miss'], any(m['text'] == X['bohan_miss'] for m in got), J(got))
        rel1 = await pg.evaluate("Object.assign({},SOCIAL.rel('classmate_bohan'))")
        R.check('[T-bB] 關係值不變（fam／trust／comf／rom）', all(abs((rel1.get(k) or 0) - (rel0.get(k) or 0)) < 1e-6 for k in ('fam', 'trust', 'comf', 'rom')), J({'前': rel0, '後': rel1}))


X42 = {'ask': ['明天你先到的話 幫我占一個', '我九點半到 應該'], 'place': '（你把一本講義放在旁邊的位子上。）', 'arrive': ['（他喘著氣坐下。）', '（小聲）……鬧鐘沒響。謝啦。'], 'miss': '沒位子 我回宿舍讀', 'at': 10 + 40 / 60}   # AA_669 4-2 表、BB_260 T-c
D42 = r"""(()=>{ const G=GAME.G, R=G.exlib||{}, Z=EXLIB._zs&&EXLIB._zs(), E=GAME.E, P=Z&&Z.pair42, ps=E.player.seat;
  return {d42:R.d42?Object.assign({},R.d42):null, pair:P?P.map(q=>({x:+q.x.toFixed(2),z:+q.z.toFixed(2),lv:q.lv|0,taken:q.taken||null,old:!!q.old})):null, zone:G.zone, seat:!!ps, seatAt:ps&&ps.x!=null?{x:+ps.x.toFixed(2),z:+ps.z.toFixed(2)}:null,
    hour:+(+G.hour).toFixed(3), auto:EXLIB.auto42Due?EXLIB.auto42Due(GAME):null, inStudy:EXLIB.inStudy?EXLIB.inStudy(GAME):null, busy:!!E.player.busy}; })()"""
ASKDAY = r"""(grp=>{ const G=GAME.G, t=CALENDAR.termOf(G.day), tid=t&&t.id; let d0=EXLIB.ask42Day(G,tid,'zhe'), why='EXLIB.ask42Day（遊戲自己挑的日子）';
  if(grp==='F'){ d0=null; const r=CALENDAR.termDays(tid); for(let d=r.from;d<=r.to;d++){ const t1=CALENDAR.termOf(d+1); if(!t1||t1.id!==tid||!(t1.exam==='final'||(CALENDAR.termOf(d+8)||{}).exam==='final')) continue;
      const Gd=Object.assign({},G,{day:d,hour:21}); const P=EXLIB.inCast(Gd,'zhe'); let ok=false; try{ ok=!!P&&!!P.ask&&EXLIB.ask42Ok(Gd,'zhe',P); }catch(e){ ok=false; } if(ok){ d0=d; break; } }
    why='明天是期末週（或前一週）、ask42Ok 成立的第一天【捷徑：EXLIB.ask42Day 指定這一天】'; }
  return {term:tid, d0, key:d0!=null?CALENDAR.dateOf(d0).key:null, next:d0!=null?CALENDAR.dateOf(d0+1).key:null, nextWk:d0!=null?(CALENDAR.termOf(d0+1)||{}).week:null, nextExam:d0!=null?(CALENDAR.termOf(d0+1)||{}).exam||null:null, why}; })"""
FILLB1 = r"""(()=>{ const E=GAME.E, Z=EXLIB._zs&&EXLIB._zs(), P=(Z&&Z.pair42)||[]; let n=0, tot=0; for(const it of E.interactables){ const q=it&&it.seat; if(!q) continue; if(!(EXLIB.studySeat&&EXLIB.studySeat(GAME.G.zone,q))) continue; tot++;
    if(P.includes(q)||q.taken||(EXLIB.occupied&&EXLIB.occupied(E,q))) continue; q.taken='cc_full'; n++; } return {filled:n, studySeats:tot, fill:+(EXLIB.fill?EXLIB.fill(GAME.G,GAME.G.zone):0).toFixed(2)}; })()"""


async def answer_ui(pg, cdp, tag, who, k=0):
    """手機：訊息 → 那個人的對話 → 問句的選項（data-ask="<id>|k"）"""
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    await L.tap(pg, cdp, '#phoneTabs [data-ptab="msg"]'); await pg.wait_for_timeout(1200)
    ok1 = await L.tap(pg, cdp, '#phoneBody [data-th="p:%s"]' % who); await pg.wait_for_timeout(1200)
    sel = '#phoneBody [data-ask="%s|%d"]' % (tag, k)
    ok2 = await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1500)
    body = (await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''"))[-200:]
    await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(800); await L.close_panels(pg, cdp)
    return ok1, ok2, body


async def case_t42(pg, cdp, group):
    tag0 = '[4-2 %s]' % group
    base = await pg.evaluate("STORY.dayOfKey(%s)" % J(DAYKEY))
    await L.load_state(pg, {'zone': 'dorm', 'hour': 20.9, 'day': base, 'weather': 'clear'}, quiet_phone=True)
    await pg.wait_for_timeout(2500)
    ad = await pg.evaluate(ASKDAY, group)
    if not R.check('%s 這學期阿哲 4-2 問的那一天（%s）' % (tag0, ad['why']), ad['d0'] is not None, J(ad)): return
    R.setup('%s 讀檔：宿舍、%s（問的那一天）21:00；阿哲設成朋友、有聯絡方式（SETUP_JS）' % (tag0, ad['key']))
    await L.load_state(pg, {'zone': 'dorm', 'hour': 21.0, 'day': ad['d0'], 'weather': 'clear'}, quiet_phone=True)
    await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp)
    r0 = await pg.evaluate(SETUP_JS, {'id': 'zhe', 'rel': FRIEND}); R.note('%s 阿哲：%s' % (tag0, J(r0)))
    if group == 'F': await pg.evaluate("(d=>{ const f=EXLIB.ask42Day; EXLIB.__ccAsk=f; EXLIB.ask42Day=(G,t,id)=>id==='zhe'?d:f(G,t,id); })", ad['d0'])
    tag = 'exlib42_%d_zhe' % ad['d0']; got = []
    for i in range(30):
        got = await pg.evaluate("(t=>(GAME.G.msgs||[]).filter(m=>m.tag===t||(m.ask&&m.ask.id===t)).map(m=>({day:m.day,h:m.h,from:m.from||m.who||null,text:m.text,ask:m.ask?m.ask.opts.map(o=>o.t):null})))", tag)
        if got: break
        if i == 10: R.note('%s 10 秒還沒收到 → 讓遊戲時間往前 6 分鐘（GAME.advance）' % tag0); await pg.evaluate("(async()=>{ await GAME.advance(0.1); })()")
        await pg.wait_for_timeout(1000)
    R.note('%s 收到的私訊：%s' % (tag0, J(got)))
    R.check('%s 21:00 阿哲私訊（逐字 AA_669 4-2 表）：%s，選項「好。」' % (tag0, '／'.join(X42['ask'])), [m['text'] for m in got] == X42['ask'] and bool(got) and (got[-1]['ask'] or [None])[0] == '好。', J(got))
    if not got: return
    ok1, ok2, body = await answer_ui(pg, cdp, tag, 'zhe', 0)
    d = await pg.evaluate(D42)
    if not ok2:
        R.note('%s 手機上點不到「好。」（對話 %s、按鈕 %s；畫面 %s）→【捷徑】PHONE.answer' % (tag0, ok1, ok2, J(body))); await pg.evaluate("(t=>PHONE.answer(GAME.G,t,0))", tag); d = await pg.evaluate(D42)
    R.check('%s 回「好。」以後 G.exlib.d42.ok' % tag0, bool(d['d42']) and d['d42'].get('ok'), J(d['d42']))
    rel0 = await pg.evaluate("Object.assign({},SOCIAL.rel('zhe'))")
    snap = await pg.evaluate("JSON.stringify(GAME.snapshot())")
    await pg.evaluate(SAYHOOK)
    if group in ('A', 'F', 'late'):
        hh = 9.5 if group != 'late' else 11.0
        R.setup('%s 讀檔（同一份存檔）跳到隔天 %02d:%02d、總圖 B1（library_b1）——跳過睡覺' % (tag0, int(hh), int(round(hh % 1 * 60))))
        await pg.evaluate("(([s,h])=>{ const G=JSON.parse(s); G.day=G.day+1; G.hour=h; G.zone='library_b1'; delete G.pos; window.__ccSnap=G; })", [snap, hh])
        n0 = await pg.evaluate("(window.__ccSay||[]).length")
        await pg.evaluate("(async()=>{ await GAME.applySave(window.__ccSnap); })()")
        for _ in range(40):
            if await pg.evaluate("GAME.G.zone==='library_b1'&&!!(EXLIB._zs&&EXLIB._zs())"): break
            await pg.wait_for_timeout(250)
        if group == 'F':
            fb = await pg.evaluate(FILLB1); R.setup('%s 【捷徑】B1 其他讀書的位子全部標成有人：%s' % (tag0, J(fb)))
        d = await pg.evaluate(D42)
        R.note('%s 進 B1：%s' % (tag0, J(d)))
        if group != 'late':
            R.check('%s 進 B1 時保留了兩個連著的空位（ZS.pair42，taken＝exlib42）' % tag0, bool(d['pair']) and len(d['pair']) == 2 and all(q['taken'] == 'exlib42' for q in d['pair']) and math.hypot(d['pair'][0]['x'] - d['pair'][1]['x'], d['pair'][0]['z'] - d['pair'][1]['z']) < 1.3, J(d['pair']))
            R.check('%s 保留的那一對不是老位子（seat.old）' % tag0, bool(d['pair']) and not any(q['old'] for q in d['pair']), J(d['pair']))
            pair0 = d['pair'] or []
        lines = []
        t1 = time.time(); st = await pg.evaluate(D42)
        while time.time() - t1 < 40 and not st['seat']:
            ln, u = await read_until(pg, cdp, 4)
            lines += ln
            if u['opts']:
                op = next((o for o in u['opts'] if o.startswith('讀')), u['opts'][0]); R.note('%s 座位選單 %s → 按「%s」' % (tag0, J(u['opts']), op)); await pick(pg, cdp, op)
            st = await pg.evaluate(D42)
        await pg.wait_for_timeout(1500); ln, u = await read_until(pg, cdp, 6); lines += ln
        if u['opts']:
            op = next((o for o in u['opts'] if o.startswith('讀')), u['opts'][0]); R.note('%s 座位選單 %s → 按「%s」' % (tag0, J(u['opts']), op)); await pick(pg, cdp, op); ln, u = await read_until(pg, cdp, 6); lines += ln
        said = await says_since(pg, n0); st = await pg.evaluate(D42)
        R.note('%s 進來以後：台詞 %s；%s' % (tag0, J(said), J(st)))
        if group == 'late':
            R.check('%s 11:00 才到：不放講義（沒有「%s」）、d42.placed 是 false' % (tag0, X42['place']), X42['place'] not in said and not (st['d42'] or {}).get('placed'), J(st['d42']))
        else:
            in_pair = bool(st['seatAt']) and any(math.hypot(q['x'] - st['seatAt']['x'], q['z'] - st['seatAt']['z']) < 0.3 for q in pair0)
            R.check('%s 玩家直接坐到保留的那一對其中一個' % tag0, st['seat'] and in_pair, J({'seatAt': st['seatAt'], 'pair': pair0}))
            R.check('%s 坐下時「%s」（d42.placed）' % (tag0, X42['place']), X42['place'] in said and bool((st['d42'] or {}).get('placed')), J({'said': said, 'd42': st['d42']}))
            await R.shot(pg, 't42%s_placed' % group)
            # 10:40 阿哲走進來：【捷徑】遊戲時間往前（GAME.advance，每次 15 分鐘、空下來的時候）
            n1 = await pg.evaluate("(window.__ccSay||[]).length"); t2 = time.time(); arr = []
            while time.time() - t2 < 150:
                s2 = await pg.evaluate(D42)
                if s2['hour'] < X42['at'] + 0.25 and not s2['busy']: await pg.evaluate("(async()=>{ await GAME.advance(0.25); })()")
                ln, u = await read_until(pg, cdp, 3)
                if u['opts']: await pick(pg, cdp, next((o for o in u['opts'] if o.startswith('讀')), u['opts'][0]))
                arr = await says_since(pg, n1)
                if X42['arrive'][-1] in arr: break
                await pg.wait_for_timeout(800)
            zp = await pg.evaluate("(()=>{ const n=GAME.npc&&GAME.npc.zhe; if(!n) return null; const p=n.obj.position; return {x:+p.x.toFixed(2), z:+p.z.toFixed(2), seat:!!n.seat, hour:+(+GAME.G.hour).toFixed(2)}; })()")
            dd = (await pg.evaluate(D42))['d42'] or {}
            R.note('%s 10:40 前後：台詞 %s；阿哲 %s；d42 %s' % (tag0, J(arr), J(zp), J(dd)))
            R.check('%s 阿哲照時間（10:40）走進來坐下、說「%s」' % (tag0, '／'.join(X42['arrive'])), all(t in arr for t in X42['arrive']) and bool(zp) and zp['seat'], J({'said': arr, 'zhe': zp}))
            if zp and dd.get('seat'): R.check('%s 阿哲坐的是放講義的那一個' % tag0, math.hypot(zp['x'] - dd['seat'][0], zp['z'] - dd['seat'][1]) < 0.5, J({'zhe': zp, 'seat': dd['seat']}))
            await R.shot(pg, 't42%s_arrived' % group)
    else:
        R.setup('%s 讀檔（同一份存檔）跳到隔天 12:30、宿舍（人不去）' % tag0)
        await pg.evaluate("(s=>{ const G=JSON.parse(s); G.day=G.day+1; G.hour=12.5; G.zone='dorm'; delete G.pos; window.__ccSnap=G; })", snap)
        await pg.evaluate("(async()=>{ await GAME.applySave(window.__ccSnap); })()"); await pg.wait_for_timeout(7000); await L.close_panels(pg, cdp)
    if group in ('none', 'late'):
        t3 = time.time(); got = []
        while time.time() - t3 < 15:
            got = await pg.evaluate("(GAME.G.msgs||[]).filter(m=>m.th==='p:zhe').slice(-4).map(m=>({day:m.day, h:m.h, text:m.text, tag:m.tag||null}))")
            if any(m['text'] == X42['miss'] for m in got): break
            await pg.wait_for_timeout(1000)
        R.check('%s 收到「%s」（10:40 那一則）' % (tag0, X42['miss']), any(m['text'] == X42['miss'] for m in got), J(got))
        rel1 = await pg.evaluate("Object.assign({},SOCIAL.rel('zhe'))")
        R.check('%s 關係值不變（fam／trust／comf／rom）' % tag0, all(abs((rel1.get(k) or 0) - (rel0.get(k) or 0)) < 1e-6 for k in ('fam', 'trust', 'comf', 'rom')), J({'前': rel0, '後': rel1}))
    if group == 'F': await pg.evaluate("(()=>{ if(EXLIB.__ccAsk){ EXLIB.ask42Day=EXLIB.__ccAsk; delete EXLIB.__ccAsk; } })()")


async def main():
    print('CC EXAMLIB T-a／T-b（瀏覽器、玩家操作）：DAY=%s；SHA=%s；Windows＋GPU／SwiftShader ≠ iPhone' % (DAYKEY, os.environ.get('SHA', '?')), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, int(os.environ.get('CC_SEED') or 20261104))
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        if not R.check('這一版有 EXLIB（期末考前的圖書館）', await pg.evaluate("typeof EXLIB!=='undefined'")): await b.close(); sys.exit(1)
        if 'ta' in CASES: await case_ta(pg, cdp)
        if 'tb' in CASES:
            await case_tb(pg, cdp, 'A'); await case_tb(pg, cdp, 'B')
        if 't42' in CASES:
            for g in [x.strip() for x in (os.environ.get('T42') or 'A,F,none,late').split(',') if x.strip()]: await case_t42(pg, cdp, g)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
