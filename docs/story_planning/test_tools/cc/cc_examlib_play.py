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
  用法：LW_TESTS=<wt>/tests [CASES=ta,tb] [DAY=2025-12-01] python3 cc_examlib_play.py <url> <out>"""
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
DAYKEY = os.environ.get('DAY') or '2025-12-01'   # Y1S1 第 14 週週一（cc_examlib_walk.js 照 CALENDAR.termOf 確認過）
R = L.Run('examlib_play', OUT)
X = {'say': '（繞了一圈，空的位子上都有人放了東西。）', 'again': '再繞一圈', 'other': '去別間', 'dorm': '回宿舍讀', 'lucky': '（靠走道的那個人剛好在收書包。）', 'none': '（還是沒有。）',
     'atmos': ['（每一張桌子都有人。有人把外套掛在椅背上，人不在。）', '（桌角貼著「離座請勿超過三十分鐘」。整排空位上都放著一本書。）', '（飲水機前面排了三個人，每個人手上都拿著水壺。）',
               '（有人趴在講義上睡著了，手上還握著螢光筆。）', '（翻書的聲音此起彼落，沒有人講話。）', '（閉館前十分鐘的廣播響了，一個起來的人都沒有。）'],
     'bohan_yes': '可以。我七點二十到。3F 靠窗第二排，左邊那個給你。', 'bohan_at': '（小聲）你的位子旁邊有插座，我順便看了。', 'bohan_miss': '十二點零一分。位子收了。', 'held': '有人了'}
SETUP_JS = r"""(c=>{ const G=GAME.G, F=G.flags||(G.flags={}), id=c.id, so=G.social||(G.social={});
  SOCIAL.meet(id,G.zone); F['met_'+id]=true; const R=SOCIAL.rel(id); for(const k in c.rel) R[k]=c.rel[k];
  G.contacts=G.contacts||{}; G.contacts[id]=G.day-30; so.fm120=true;
  return {stage:SOCIAL.stage(id), rel:Object.assign({},SOCIAL.rel(id)), contact:G.contacts[id]!=null}; })"""
FRIEND = {'fam': 45, 'trust': 30, 'comf': 25, 'rom': 0, 'npcRom': 0}
UI = r"""(()=>{ const t=(document.getElementById('dlgText')||{}).textContent||'', ch=document.getElementById('choices'); const open=!!ch&&!ch.classList.contains('hide');
  const opts=open?[...ch.querySelectorAll('button,.choice,[data-k]')].map(b=>(b.innerText||b.textContent||'').trim()).filter(Boolean):[];
  const D=GAME.D||{}; return {dlg:!!D.active, text:t, opts, hour:+(+GAME.G.hour).toFixed(3), zone:GAME.G.zone, seat:!!GAME.E.player.seat, busy:!!GAME.E.player.busy}; })()"""
SEATS2F = r"""(lv=>{ const E=GAME.E, z=E.zone, out=[]; (z.seats||[]).forEach((st,i)=>{ if((st.lv|0)!==lv) return; const it=E.interactables.find(q=>q.seat===st); if(!it) return;
  const ap=GAME.seatApproach?GAME.seatApproach(st):null; out.push({i, x:+st.x.toFixed(2), z:+st.z.toFixed(2), lv:st.lv|0, label:it.label||'', held:!!st.exHeld, ax:ap?ap[0]:st.x, az:ap?ap[1]:st.z}); }); return out; })"""


async def pick(pg, cdp, text):
    ok = await pg.evaluate("(t=>{ const ch=document.getElementById('choices'); if(!ch) return false; const b=[...ch.querySelectorAll('button,.choice,[data-k]')].find(x=>(x.innerText||x.textContent||'').trim()===t); if(!b) return false; b.setAttribute('data-ccpick','1'); return true; })", text)
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
            if u['text'] != last: lines.append(u['text']); last = u['text']
            await pg.wait_for_timeout(700); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if lines and not u['dlg']: return lines, u
        await pg.wait_for_timeout(500)
    return lines, await pg.evaluate(UI)


async def case_ta(pg, cdp):
    R.setup('讀檔：總圖大廳（library_hall）、%s（第 14 週週一）10:30、晴；條件事件照開' % DAYKEY)
    await L.load_state(pg, {'zone': 'library_hall', 'hour': 10.5, 'day': await pg.evaluate("STORY.dayOfKey(%s)" % J(DAYKEY)), 'weather': 'clear'})
    await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)
    on = await pg.evaluate("(()=>({on:EXLIB.on(GAME.G), fill:+EXLIB.fill(GAME.G,'library_hall').toFixed(2), full:EXLIB.fullH(GAME.G,'library_hall'), term:CALENDAR.termOf(GAME.G.day)}))()")
    R.check('[T-a] 這一天在「期末考前的圖書館」那一段、10:30 已經全滿的時間', on['on'] and on['full'] <= 10.5, J(on))
    seats = await pg.evaluate(SEATS2F + '(1)')
    study = [s for s in seats if s['held'] or '讀書' in s['label'] or '坐' in s['label']]
    R.note('[T-a] 二樓的座位 %d 個；「有人了」%d 個' % (len(seats), sum(1 for s in seats if s['held'])))
    if not R.check('[T-a] 二樓有讀書的座位', bool(study), J(seats[:3])): return
    tgt = sorted(study, key=lambda s: -s['held'])[0]
    h0 = (await pg.evaluate(UI))['hour']
    ok = await L.go_to(pg, cdp, R, tgt['ax'], tgt['az'], 0.6, '二樓讀書區的座位旁邊', lv=1, stop=lambda s: bool(s.get('dtext')) or bool(s.get('choices')))
    lines, u = await read_until(pg, cdp)
    R.note('[T-a] 走上二樓：台詞 %s；選項 %s' % (J(lines), J(u['opts'])))
    at = [l for l in lines if l in X['atmos']]
    R.check('[T-a]（T-d）第一次進這一間的旁白是那五句之一（10:30 不是閉館前）', len(at) == 1 and at[0] in X['atmos'][:5], J(lines))
    R.check('[T-a] 找不到位子的提示「%s」' % X['say'], X['say'] in lines, J(lines))
    R.check('[T-a] 三個選項「再繞一圈」「去別間」「回宿舍讀」，沒有朋友＝沒有「招手」', u['opts'][:3] == [X['again'], X['other'], X['dorm']] and len(u['opts']) == 3, J(u['opts']))
    await R.shot(pg, 'ta_prompt')
    if X['again'] not in u['opts']: return
    h1 = u['hour']; await pick(pg, cdp, X['again'])
    lines2, u2 = await read_until(pg, cdp)
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


async def case_tb(pg, cdp, group):
    d0 = await pg.evaluate("STORY.dayOfKey(%s)-1" % J(DAYKEY))
    R.setup('讀檔：宿舍、%s 的前一天 19:00；柏翰設成朋友、有聯絡方式（SETUP_JS）' % DAYKEY)
    await L.load_state(pg, {'zone': 'dorm', 'hour': 19.0, 'day': d0, 'weather': 'clear'}, quiet_phone=True)
    await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
    r0 = await pg.evaluate(SETUP_JS, {'id': 'classmate_bohan', 'rel': FRIEND})
    R.note('[T-b%s] 柏翰：%s' % (group, J(r0)))
    new = await dm_bohan(pg, cdp, '[T-b%s]' % group)
    if new is None: return
    R.check('[T-b%s] 柏翰答應「%s」' % (group, X['bohan_yes']), any(m['text'] == X['bohan_yes'] for m in new), J(new))
    hold = await pg.evaluate("(()=>{ const R=GAME.G.exlib||{}; return R.hold||null; })()")
    R.note('[T-b%s] G.exlib.hold＝%s' % (group, J(hold)))
    rel0 = await pg.evaluate("Object.assign({},SOCIAL.rel('classmate_bohan'))")
    snap = await pg.evaluate("JSON.stringify(GAME.snapshot())")
    if group == 'A':
        R.setup('[T-bA] 讀檔（同一份存檔）跳到隔天 09:00、總圖 3F 閱覽區（library）——跳過睡覺')
        await pg.evaluate("(s=>{ const G=JSON.parse(s); G.day=G.day+1; G.hour=9; G.zone='library'; delete G.pos; window.__ccSnap=G; })", snap)
        await pg.evaluate("(async()=>{ await GAME.applySave(window.__ccSnap); })()"); await pg.wait_for_timeout(7000); await L.close_panels(pg, cdp)
        seats = await pg.evaluate(SEATS2F + '(0)')
        held = [s for s in seats if s['label'] == X['held'] or s['held']]
        bo = await pg.evaluate("(()=>{ const n=GAME.npc&&GAME.npc.classmate_bohan; if(!n) return null; const p=n.obj.position; return {x:+p.x.toFixed(2), z:+p.z.toFixed(2), seat:!!n.seat}; })()")
        R.note('[T-bA] 柏翰 %s；「有人了」的位子 %s' % (J(bo), J(held[:4])))
        near = [s for s in held if bo and math.hypot(s['x'] - bo['x'], s['z'] - bo['z']) < 1.6]
        R.check('[T-bA] 柏翰在 3F、坐著', bool(bo) and bo['seat'], J(bo))
        R.check('[T-bA] 柏翰旁邊那一位顯示「有人了」', bool(near), J(held[:4]))
        tgt = near[0] if near else (held[0] if held else None)
        if not tgt: return
        ok = await L.go_to(pg, cdp, R, tgt['ax'], tgt['az'], 1.5, '柏翰旁邊的位子', lv=0, stop=lambda s: bool(s.get('dtext')) or bool(s.get('choices')))
        lines, u = await read_until(pg, cdp, 30, want_opts=True)
        await pg.wait_for_timeout(2000); st = await pg.evaluate(UI)
        R.note('[T-bA] 走進讀書區以後：台詞 %s；選項 %s；%s' % (J(lines), J(u['opts']), J(st)))
        R.check('[T-bA] 沒有跳「找不到位子」（有人占了位子的那一天）', X['say'] not in lines, J(lines))
        R.check('[T-bA] 玩家直接坐下', st['seat'], J(st))
        R.check('[T-bA] 柏翰說「%s」' % X['bohan_at'], X['bohan_at'] in lines, J(lines))
        await R.shot(pg, 'tbA_sat')
    else:
        R.setup('[T-bB] 讀檔（同一份存檔）跳到隔天 12:05、宿舍（人不去）')
        await pg.evaluate("(s=>{ const G=JSON.parse(s); G.day=G.day+1; G.hour=12+5/60; G.zone='dorm'; delete G.pos; window.__ccSnap=G; })", snap)
        await pg.evaluate("(async()=>{ await GAME.applySave(window.__ccSnap); })()"); await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp)
        got = await pg.evaluate("(GAME.G.msgs||[]).filter(m=>m.th==='p:classmate_bohan').slice(-4).map(m=>({day:m.day, h:m.h, text:m.text}))")
        R.note('[T-bB] 柏翰的私訊最後幾則：%s' % J(got))
        R.check('[T-bB] 12:00 還沒到：收到「%s」' % X['bohan_miss'], any(m['text'] == X['bohan_miss'] for m in got), J(got))
        rel1 = await pg.evaluate("Object.assign({},SOCIAL.rel('classmate_bohan'))")
        R.check('[T-bB] 關係值不變（fam／trust／comf／rom）', all(abs((rel1.get(k) or 0) - (rel0.get(k) or 0)) < 1e-6 for k in ('fam', 'trust', 'comf', 'rom')), J({'前': rel0, '後': rel1}))


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
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
