"""BB-C 10-28：POOL-AAFIX-1028＋AA_513 瀏覽器驗收（LAWWW-C 08:09 P2；開發分支 2fcbd7dc1 起，lwdev7＝6cd709cb8）。Node 版是 tests/pool_aafix_unit.js、tests/aa513_unit.js。
判斷都用玩家操作：走到人旁邊、按「和他說話」、點對話、選選項、開手機看訊息、看畫面下方的字幕。
底：使用者存檔 bbtest/p0an/user_day14.json（法律系 day 14）；改日期時間地點＝【前置】；認識、熟悉度、聯絡方式、旗標＝【捷徑】（輸出裡都標）。
條件事件預設關掉（bbplay.load：EVENTS.onEnter／tick、手機自動打開；和人說話的 onInteract 照舊）；承恩旁聽那一場是走到門口自動演的，走過去之前 bbplay.events_on() 還原。
時間：SwiftShader 每格遊戲時間最多 0.1 秒、GM.hourRate 1/150＝1–2 fps 時遊戲 1 分鐘要 25～75 秒；等時間的地方都只等幾分鐘（跳到前幾分鐘再站著等）。沒有用 ?turbo。

MODE（環境變數）：
  liqun  （A1）大一上第 10 週星期五 20:54 公館。【捷徑】認識詹立群（pool_16）、熟悉 25、沒有他的聯絡方式。和他說話 → 秘密 → 選「我也想學。」：
          「真的？那我寫一首給你。……你不能笑。」接「手機給我。錄好傳你。」（立群說）＋手機多「加了詹立群的聯絡方式。」；
          →【前置】同一份進度跳到下週五 20:56：21:00 以前沒有、站著等到 21:01：私訊「（錄音 0:30）」「民法第一條。你不能笑。」。
          對照（A1b）：重來一次、【捷徑】先有他的聯絡方式：只說「真的？…」、不說「手機給我。」、聯絡方式的日子不變。
  shuhao （A2）大一下第 9 週星期二 12:09 校園。【捷徑】認識楊書豪（pool_8）、熟悉 25、沒有聯絡方式。說話 → 順手的事選「那天我有事。」：
          「好。我自己去。」緊接「……手機給我。講完跟你說。」（書豪說）＋交換；→ 跳到那週六 20:56、等到 21:01：「講完了。超時半句。」
  chengen（A3）大一上第 6 週星期一 10:24 社科院圖書館：第一次和蘇承恩（pool_19）說話＝認識那一場 → 選「我也想旁聽別的系。」→ 記下快照；
          兩個選項各一次（同一個快照讀兩次）：跳到隔天星期二 14:03 校園、站到社科院正面的門（SL3.DOOR）8 m 外、打開條件事件、走過去 → 2D 旁聽
          （選「哪裡像？」／「（點頭）」）→ 演完 16:00 → 手機「朋友」→ 蘇承恩的人物頁有「陪他旁聽過一堂社工系的課」；
          第一個選項那一次再跳到下週二 14:03 走到門口：不再演。
  chenxi （A4）大一下第 5 週星期一（吉他社社課那天）18:46 萬才館。【捷徑】認識劉晏如（pool_5）熟悉 25、認識葉晨希（pool_11）。
          和晏如說話 → 選「我也怕蟑螂。」→ 跳到同一天 19:20 校園萬才館旁邊、和晨希說話：第一句「社辦那隻，我用衛生紙包起來丟了。」、第二句「……你和晏如站在走廊的樣子，很像在罰站。」
          → 跳到星期三 19:20 再說一次：沒有那兩句（照平常）。
  aa513  （B）大一上第 10 週星期五 18:33 公館（學姊×陳助教的圈子 c503_8_1 18:30～20:30 也在）：走到離學姊最近的店門口（HEARD.GG_DOORS）——
          窗邊字幕「（公館一間店的窗邊，以安和一個穿套裝的中年女人…）」出一次、出滿 6 秒沒有被圈子的字幕蓋掉（圈子的也沒有被它蓋掉）；
          走到另一間店門口：不再出（一學期一次）；→ 跳到大一下第 10 週星期五 18:33：第二句（「這次說話的是對面的人…」）；
          → 同一天 19:30 校園：看不到以安（她在公館和媽媽吃飯）。
          阿凱三則私訊（AA_513 1-1、1-2、1-4）：2026-11-27、2027-10-27、2028-12-15 各從使用者存檔重讀到 23:13 宿舍，【捷徑】認識子晴、有阿凱的聯絡方式：
          23:20 以前沒有、站著等到 23:21：p:kai 三則照順序、沒有回覆鍵；對照：不認識子晴（使用者存檔本來就認識的話記「做不了」）＝沒有。
每個 MODE 都查：沒有 JS 例外。「前置：…」FAIL＝情境沒成立（人不在、時段不對），不是遊戲的錯。
估計時間（沒有實測）：liqun 15～25 分、shuhao 12～20 分、chengen 25～40 分、chenxi 15～25 分、aa513 25～40 分。不要和別的瀏覽器測試同時跑。
用法：LW_TESTS=<工作樹>/tests MODE=liqun python3 pool_aafix_probe.py '<URL>/index.html' <輸出資料夾> [存檔.json]；SHA＝記錄用"""
import os, sys, json, asyncio, time, copy, math
sys.path.insert(0, os.environ.get('LW_TESTS', 'tests')); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import bbplay as B
from playwright.async_api import async_playwright
SP = '/tmp/claude-0/-home-user-Lawstudent/4f52e6f0-1e48-5c03-872f-171d129a03fd/scratchpad'
MODE = os.environ.get('MODE', 'liqun')
J = B.J
LQ, SH, SC, LY, CX = 'pool_16', 'pool_8', 'pool_19', 'pool_5', 'pool_11'

# 【捷徑】認識＋熟悉度（FAMILIAR＝fam 20 以上）；contact: 'drop'＝拿掉聯絡方式、'add'＝加上、None＝不動
PREP_PEOPLE = """([ids,fam,contact])=>{ const G=GAME.G, out={};
  for(const id of ids){ if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.meet(id,G.zone); const r=SOCIAL.rel(id); r.fam=Math.max(r.fam||0,fam); r.trust=Math.max(r.trust||0,3);
    if(contact==='drop'&&G.contacts) delete G.contacts[id]; if(contact==='add') INV.addContact(G,id);
    out[id]={stage:SOCIAL.stage(id),contact:!!INV.hasContact(G,id),secret:SOCIAL.has(id,'SHARED_SECRET')}; }
  out.canOpen=POOL.canOpen?POOL.canOpen(G):null; return out; }"""


def has_line(lines, t, who=None):
    return any(l[1] == t and (who is None or who in l[0]) for l in lines)


def idx(lines, t):
    return next((i for i, l in enumerate(lines) if l[1] == t), -1)


async def contact_day(pg, cid):
    return await pg.evaluate("id=>(GAME.G.contacts||{})[id]==null?null:GAME.G.contacts[id]", cid)


# ---------------- A1 立群 ----------------
async def mode_liqun(pg, cdp, run, save):
    st, d = await B.base(pg, save, ['Y1S1', 10, 5], 20.9, 'gongguan')
    await B.load(pg, cdp, st)
    run.setup('[前置] 使用者存檔 day 14 → %s（大一上第 10 週星期五）20:54 公館' % d['key'])
    pr = await B.prep(pg, cdp, run, PREP_PEOPLE, [[LQ], 25, 'drop'], label='認識詹立群、熟悉 25、拿掉他的聯絡方式')
    w = await B.wait_present(pg, LQ)
    run.check('前置：詹立群在公館（二手唱片行的騎樓 55.6,20.5）、沒有藏著、還沒說過秘密、沒有他的聯絡方式', bool(w and not w['hidden']) and not pr[LQ]['secret'] and not pr[LQ]['contact'], J({'who': w, 'pr': pr}))
    if not w: return
    await B.place_near(pg, run, w['x'], w['z'], 7, what='詹立群')
    c0 = await contact_day(pg, LQ)
    r = await B.talk_to(pg, cdp, run, LQ, 'A1 立群', picks=['「我也想學。」'])
    run.check('A1 和立群說話：秘密「其實……我背法條是配節奏的。」、三個選項有「我也想學。」', bool(r) and has_line(r['lines'], '其實……我背法條是配節奏的。') and any(any(o.startswith('「我也想學。」') for o in os) for os in r['opts']), J(r and {'opts': r['opts'], 'lines': r['lines'][:6]}))
    lines = r['lines'] if r else []
    i1, i2 = idx(lines, '真的？那我寫一首給你。……你不能笑。'), idx(lines, '手機給我。錄好傳你。')
    run.check('A1 選「我也想學。」：「真的？那我寫一首給你。……你不能笑。」緊接「手機給我。錄好傳你。」（立群說）', i1 >= 0 and i2 == i1 + 1 and '立群' in lines[i2][0], J(lines[max(0, i1 - 1):i1 + 3] if i1 >= 0 else lines[-6:]))
    await run.shot(pg, 'A1_after_talk')
    t = await B.phone_thread(pg, cdp, 'p:' + LQ)
    lst = t['list']
    run.check('A1 手機：多「加了詹立群的聯絡方式。」（訊息列表或他的對話）', '加了詹立群的聯絡方式' in (t['text'] + lst), J({'thread': t['ok'], 'text': t['text'][-200:], 'list': lst[:300]}))
    await run.shot(pg, 'A1_phone'); await B.phone_close(pg, cdp)
    d0 = (await B.clock(pg))['day']
    # 一週後 21:00
    d1 = await B.jump(pg, cdp, run, ['Y1S1', 11, 5], 20.93, note='秘密那一天 +7（下週五）')
    run.check('前置：跳到的是秘密那一天的一週後', d1['d'] == d0 + 7, '%s → %s' % (d0, d1['d']))
    t = await B.phone_thread(pg, cdp, 'p:' + LQ); early = '民法第一條。你不能笑。' in t['text']; await B.phone_close(pg, cdp)
    ok = await B.wait_hour(pg, cdp, 21.02, max_s=420)
    t = await B.phone_thread(pg, cdp, 'p:' + LQ)
    run.check('A1 一週後：20:56 還沒有；21:01 私訊「（錄音 0:30）」「民法第一條。你不能笑。」', ok and not early and '（錄音 0:30）' in t['text'] and '民法第一條。你不能笑。' in t['text'], J({'等到': ok, 'early': early, 'text': t['text'][-300:]}))
    await run.shot(pg, 'A1_song'); await B.phone_close(pg, cdp)
    # A1b 對照：已經有聯絡方式
    st, d = await B.base(pg, save, ['Y1S1', 10, 5], 20.9, 'gongguan')
    await B.load(pg, cdp, st)
    pr = await B.prep(pg, cdp, run, PREP_PEOPLE, [[LQ], 25, 'add'], label='（對照 A1b）重讀、認識詹立群、熟悉 25、先加他的聯絡方式')
    c0 = await contact_day(pg, LQ)
    w = await B.wait_present(pg, LQ)
    if w: await B.place_near(pg, run, w['x'], w['z'], 7, what='詹立群')
    r = await B.talk_to(pg, cdp, run, LQ, 'A1b 立群（已有聯絡方式）', picks=['「我也想學。」']) if w else None
    lines = r['lines'] if r else []
    run.check('A1b 已經有他的聯絡方式：說「真的？…你不能笑。」、不說「手機給我。錄好傳你。」、聯絡方式的日子不變', has_line(lines, '真的？那我寫一首給你。……你不能笑。') and not has_line(lines, '手機給我。錄好傳你。') and await contact_day(pg, LQ) == c0, J({'c0': c0, 'c1': await contact_day(pg, LQ), 'lines': lines[-5:]}))


# ---------------- A2 書豪 ----------------
async def mode_shuhao(pg, cdp, run, save):
    st, d = await B.base(pg, save, ['Y1S2', 9, 2], 12.15, 'campus')
    await B.load(pg, cdp, st)
    run.setup('[前置] 使用者存檔 day 14 → %s（大一下第 9 週星期二）12:09 校園' % d['key'])
    pr = await B.prep(pg, cdp, run, PREP_PEOPLE, [[SH], 25, 'drop'], label='認識楊書豪、熟悉 25、拿掉他的聯絡方式')
    q = await pg.evaluate("POOL.qState?POOL.qState(GAME.G,'PQ_YSH'):null")
    w = await B.wait_present(pg, SH)
    run.check('前置：楊書豪在校園（椰林大道 12～13）、順手的事還沒開過、還開得了（同時最多兩則）', bool(w and not w['hidden']) and not q and pr.get('canOpen') is not False, J({'who': w, 'q': q, 'pr': pr}))
    if not w: return
    await B.place_near(pg, run, w['x'], w['z'], 7, what='楊書豪')
    r = await B.talk_to(pg, cdp, run, SH, 'A2 書豪', picks=['「那天我有事。」'])
    lines = r['lines'] if r else []
    run.check('A2 順手的事：「這週六辯論社的社內賽…」、選項「我去。」「那天我有事。」', has_line(lines, '這週六辯論社的社內賽，二辯感冒了。社長叫我上。') and any(any(o.startswith('「那天我有事。」') for o in os) for os in (r['opts'] if r else [])), J(r and r['opts']))
    i1, i2 = idx(lines, '好。我自己去。'), idx(lines, '……手機給我。講完跟你說。')
    run.check('A2 選「那天我有事。」：「好。我自己去。」緊接「……手機給我。講完跟你說。」（書豪說）', i1 >= 0 and i2 == i1 + 1 and '書豪' in lines[i2][0], J(lines[-6:]))
    t = await B.phone_thread(pg, cdp, 'p:' + SH)
    run.check('A2 手機：多「加了楊書豪的聯絡方式。」', '加了楊書豪的聯絡方式' in (t['text'] + t['list']), J({'text': t['text'][-200:], 'list': t['list'][:300]}))
    await run.shot(pg, 'A2_phone'); await B.phone_close(pg, cdp)
    d1 = await B.jump(pg, cdp, run, ['Y1S2', 9, 6], 20.93, zone='dorm', pos=None, note='那週六晚上（宿舍）')
    t = await B.phone_thread(pg, cdp, 'p:' + SH); early = '講完了。超時半句。' in t['text']; await B.phone_close(pg, cdp)
    ok = await B.wait_hour(pg, cdp, 21.02, max_s=420)
    t = await B.phone_thread(pg, cdp, 'p:' + SH)
    run.check('A2 那週六：20:56 還沒有；21:01 私訊「講完了。超時半句。」', ok and not early and '講完了。超時半句。' in t['text'], J({'等到': ok, 'early': early, 'text': t['text'][-300:]}))
    await run.shot(pg, 'A2_sat'); await B.phone_close(pg, cdp)


# ---------------- A3 承恩 ----------------
AUDIT = ['（社科院三樓的大教室。你和承恩坐在最後一排，前面都是社工系的學生。）', '（台上的老師在講個案紀錄：「寫下他說的話。你覺得他是什麼人，先不要寫。」）', '（承恩在筆記上寫了一行字，推過來：「跟證人筆錄有點像。」）']
AUDIT_R = {'（在下面寫：「哪裡像？」）': '（他想了一下，寫：「都要照他說的寫。……可是這邊的人，寫完會再回去看他。」）', '（點頭）': '（他把那一行劃掉，重寫了一次，寫得比較工整。）'}
AUDIT_OUT = ['（下課。走出社科院的時候，他才開口。）', '下週我還會來。你不用陪我。……今天，謝謝。']
DEED_SC = '陪他旁聽過一堂社工系的課'


async def door_walk(pg, cdp, run, tag):
    door = await pg.evaluate("(typeof SL3!=='undefined'&&SL3.DOOR)?{x:SL3.DOOR.x,z:SL3.DOOR.z}:null")
    if not door: run.check('前置：有 SL3.DOOR（社科院正面的門）', False); return None
    await B.place_near(pg, run, door['x'], door['z'], 8, what='社科院正面的門 %s' % J(door))
    await B.events_on(pg); run.setup('[捷徑] 打開條件事件（還原遊戲原本的 EVENTS.onEnter／tick）')
    on = lambda s: bool(s.get('dlg') or s.get('choices'))
    await L.go_to(pg, cdp, run, door['x'], door['z'], 1.2, '%s：社科院的門' % tag, max_s=240, stop=on)
    t0 = time.time()
    while time.time() - t0 < 30:
        s = await B.ts(pg)
        if s['dlg'] or s['ch'] or s['running']: break
        await pg.wait_for_timeout(1000)
    return door


async def mode_chengen(pg, cdp, run, save):
    st, d = await B.base(pg, save, ['Y1S1', 6, 1], 10.4, 'soclib')
    await B.load(pg, cdp, st)
    run.setup('[前置] 使用者存檔 day 14 → %s（大一上第 6 週星期一）10:24 社科院圖書館' % d['key'])
    met = await pg.evaluate("id=>SOCIAL.has(id,'FIRST_MET')", SC)
    w = await B.wait_present(pg, SC)
    run.check('前置：蘇承恩在社科院圖書館、還不認識（第一次說話＝認識那一場）', bool(w and not w['hidden']) and not met, J({'who': w, 'met': met}))
    if not w: return
    await B.place_near(pg, run, w['x'], w['z'], 6, what='蘇承恩')
    r = await B.talk_to(pg, cdp, run, SC, 'A3 認識承恩', picks=['「我也想旁聽別的系。」'])
    lines = r['lines'] if r else []
    run.check('A3 認識那一場：「我叫蘇承恩。…」、兩個選項、選「我也想旁聽別的系。」→「……那你可以先來這一堂。週二下午，老師人很好，不會趕人。」',
              has_line(lines, '我叫蘇承恩。我在看社工系有什麼課可以旁聽。……嗯，對，法律系的跑來旁聽社工。') and has_line(lines, '……那你可以先來這一堂。週二下午，老師人很好，不會趕人。'), J(lines[-5:]))
    S0 = await B.snapshot(pg)
    for k, (opt, resp) in enumerate(AUDIT_R.items()):
        await B.jump(pg, cdp, run, ['Y1S1', 6, 2], 14.05, zone='campus', pos=None, snap=S0, note='認識那一場之後的快照（第 %d 次讀）' % (k + 1))
        n0 = await B.cap_n(pg)
        door = await door_walk(pg, cdp, run, 'A3-%d' % (k + 1))
        if not door: return
        s = await B.ts(pg)
        run.check('A3-%d 走到社科院正面的門：自己開始演（ev_pool_sce_audit）' % (k + 1), s['running'] == 'ev_pool_sce_audit', J(s))
        await run.shot(pg, 'A3_%d_start' % (k + 1))
        r = await B.dialog(pg, cdp, run, picks=[opt], max_s=300, tag='A3-%d 旁聽' % (k + 1), shots=True)
        lines = r['lines']; other = [v for o, v in AUDIT_R.items() if o != opt][0]
        seq = [idx(lines, t) for t in AUDIT + [resp] + AUDIT_OUT]
        run.check('A3-%d 2D 照稿：教室三句 → 選項（「哪裡像？」「（點頭）」）→ 選 %s → 那一句（另一支不出）→ 下課兩句（承恩說）' % (k + 1, opt),
                  all(i >= 0 for i in seq) and seq == sorted(seq) and not has_line(lines, other) and any(set(os) >= set(AUDIT_R) for os in r['opts']) and '承恩' in lines[seq[-1]][0], J({'seq': seq, 'opts': r['opts'], 'lines': lines}))
        c = await B.clock(pg)
        run.check('A3-%d 演完是 16:00' % (k + 1), abs(c['h'] - 16) < 0.08, J(c))
        pg_txt = await B.person_page(pg, cdp, SC)
        await run.shot(pg, 'A3_%d_person' % (k + 1))
        run.check('A3-%d 手機「朋友」→ 蘇承恩的人物頁多一行「%s」' % (k + 1, DEED_SC), bool(pg_txt) and DEED_SC in pg_txt, J((pg_txt or '(朋友清單裡沒有他)')[:400]))
        await B.phone_close(pg, cdp)
        if k == 0:
            dk = await pg.evaluate("id=>POOL.deeds?POOL.deeds(GAME.G,id):null", SC)
            run.note('（狀態讀取，只當線索）POOL.deeds：%s；選單的 #tab-people（舊人物頁，會列 POOL.deedsHTML）有沒有頁籤按鈕：%s' % (J(dk), await pg.evaluate("!!document.querySelector('#menu .tabs [data-tab=\"people\"]')")))
            await B.jump(pg, cdp, run, ['Y1S1', 7, 2], 14.05, zone='campus', pos=None, note='同一份存檔下週二')
            await door_walk(pg, cdp, run, 'A3 下週')
            s = await B.ts(pg)
            run.check('A3 同一份存檔下週二走到門口：不再演', s['running'] != 'ev_pool_sce_audit' and not s['dlg'], J(s))
            await B.dialog(pg, cdp, run, max_s=120, start_s=3)


# ---------------- A4 晨希 ----------------
ROACH = ['社辦那隻，我用衛生紙包起來丟了。', '……你和晏如站在走廊的樣子，很像在罰站。']


async def mode_chenxi(pg, cdp, run, save):
    st, d = await B.base(pg, save, ['Y1S2', 5, 1], 18.77, 'wancai', pos={'x': 0, 'z': 4.5, 'yaw': 3.14159, 'lv': 0, 'y': 0})
    await B.load(pg, cdp, st)
    run.setup('[前置] 使用者存檔 day 14 → %s（大一下第 5 週星期一）18:46 萬才館一樓' % d['key'])
    pr = await B.prep(pg, cdp, run, PREP_PEOPLE, [[LY, CX], 25, None], label='認識劉晏如、葉晨希，熟悉 25')
    club = await pg.evaluate("(()=>{ const a=ACTIVITIES.list.find(x=>x.id==='club_guitar'); return !!(a&&ACTIVITIES.on(a,GAME.G.day,GAME.G)); })()")
    q = await pg.evaluate("POOL.qState?POOL.qState(GAME.G,'PQ_LYR'):null")
    w = await B.wait_present(pg, LY, max_s=60)
    run.check('前置：那天有吉他社社課、劉晏如在萬才館一樓走廊（18:45～19:00）、順手的事還沒開過', club and bool(w and not w['hidden']) and not q, J({'club': club, 'who': w, 'q': q, 'pr': pr}))
    if not w: return
    r = await B.talk_to(pg, cdp, run, LY, 'A4 晏如', picks=['「我也怕蟑螂。」'], max_s=300)
    lines = r['lines'] if r else []
    run.check('A4 晏如：「學弟。……社辦裡面有一隻。」→ 選「我也怕蟑螂。」→「……那我們兩個一起在走廊站。」＋晨希進去的旁白',
              has_line(lines, '學弟。……社辦裡面有一隻。') and has_line(lines, '……那我們兩個一起在走廊站。') and has_line(lines, '（你們在走廊站了二十分鐘。最後是晨希來，直接開門走進去，出來的時候說：「沒有了。」）'), J(lines[-6:]))
    await B.jump(pg, cdp, run, ['Y1S2', 5, 1], 19.33, zone='campus', pos=None, note='同一天 19:20 校園（晨希在萬才館旁邊 19～21）')
    w = await B.wait_present(pg, CX, max_s=60)
    run.check('前置：葉晨希在萬才館旁邊', bool(w and not w['hidden']), J(w))
    if not w: return
    await B.place_near(pg, run, w['x'], w['z'], 7, what='葉晨希')
    r = await B.talk_to(pg, cdp, run, CX, 'A4 晨希（下一次）', picks=())
    lines = r['lines'] if r else []
    run.check('A4 下一次和晨希說話：第一句「%s」、第二句「%s」（晨希說）' % tuple(ROACH), len(lines) >= 2 and lines[0][1] == ROACH[0] and lines[1][1] == ROACH[1] and '晨希' in lines[0][0], J(lines[:4]))
    await B.jump(pg, cdp, run, ['Y1S2', 5, 3], 19.33, zone='campus', pos=None, note='星期三 19:20')
    w = await B.wait_present(pg, CX, max_s=60)
    if w: await B.place_near(pg, run, w['x'], w['z'], 7, what='葉晨希')
    r = await B.talk_to(pg, cdp, run, CX, 'A4 晨希（再下一次）', picks=()) if w else None
    lines = r['lines'] if r else []
    run.check('A4 再下一次：照平常（沒有那兩句）', bool(r) and not has_line(lines, ROACH[0]), J(lines[:4]))


# ---------------- B AA_513 ----------------
MOM = ['（公館一間店的窗邊，以安和一個穿套裝的中年女人面對面坐著。以安在說話，對面的人一直點頭，手上拿著以安的手帳。）',
       '（公館一間店的窗邊，以安和那個穿套裝的女人面對面坐著。這次說話的是對面的人，以安一直在點頭。）']
KAI = [('2026-11-27', ['所以子晴學姊不去實驗室了', '她說要做自己的東西', '我覺得她做得到']),
       ('2027-10-27', ['所以我的毯子沒了', '子晴學姊說借', '她在系館已經睡一個月了']),
       ('2028-12-15', ['所以子晴學姊把公園那隻貓帶回家了', '她說是同事', '貓是同事'])]
PREP_KAI = """(meetZq)=>{ const G=GAME.G; G.flags.EXCHANGE_ROUTE='TW'; const k0=STORY.knows?!!STORY.knows('heroine_04',G):SOCIAL.has('heroine_04','FIRST_MET');
  if(meetZq&&!SOCIAL.has('heroine_04','FIRST_MET')) SOCIAL.meet('heroine_04','campus'); INV.addContact(G,'kai');
  return {knewZq:k0, knowsZq:STORY.knows?!!STORY.knows('heroine_04',G):null, kai:!!INV.hasContact(G,'kai')}; }"""


async def door_visit(pg, cdp, run, tag, prefer=None, wait_s=14):
    """走到公館南側店門口（HEARD.GG_DOORS，z 21 的互動點前 1.5 m）；回傳 (門的 x, 這段時間的字幕)"""
    D = await pg.evaluate("HEARD.GG_DOORS")
    sis = await B.who(pg, 'heroine_05')
    xs = sorted(D['x'], key=lambda x: abs(x - (prefer if prefer is not None else (sis['x'] if sis else 0))))
    x = xs[0]
    n0 = await B.cap_n(pg)   # 站過去那一下（1.5 秒）如果已經在別間店門口 5 m 內，字幕也要記到
    await B.place_near(pg, run, x, 18.5, 9, what='店門口 (%.1f,%d)' % (x, D['z']))
    await L.go_to(pg, cdp, run, x, D['z'] - 1.5, 0.6, '%s：店門口 x=%.1f' % (tag, x), max_s=240)
    await pg.wait_for_timeout(wait_s * 1000)
    caps = await B.captions(pg, n0)
    return x, caps, sis


async def mode_aa513(pg, cdp, run, save):
    st, d = await B.base(pg, save, ['Y1S1', 10, 5], 18.55, 'gongguan', flags={'EXCHANGE_ROUTE': 'TW'})
    await B.load(pg, cdp, st)
    run.setup('[前置] 使用者存檔 day 14 → %s（大一上第 10 週星期五）18:33 公館；EXCHANGE_ROUTE＝TW' % d['key'])
    pre = await pg.evaluate("({an:STORY.knows?!!STORY.knows('heroine_01',GAME.G):null, seen:GAME.G.flags.AN_MOM_SEEN||null, row:(typeof HCIRCLE!=='undefined'&&HCIRCLE.row)?!!HCIRCLE.on(HCIRCLE.row('c503_8_1'),GAME.G,'gongguan'):null})")
    sis = await B.wait_present(pg, 'heroine_05', max_s=40)
    run.check('前置：認識以安、這學期還沒看過；學姊×陳助教的圈子 c503_8_1 在（學姊在公館）', bool(pre['an']) and not pre['seen'] and bool(sis), J({'pre': pre, 'sis': sis}))
    x, caps, sis = await door_visit(pg, cdp, run, 'B 大一上')
    spans = B.cap_spans(caps)
    run.note('B 大一上 店門口 x=%.1f（學姊在 %s）字幕：%s' % (x, J(sis and [sis['x'], sis['z']]), J(spans)))
    await run.shot(pg, 'B_y1s1_door')
    mom = [s for s in spans if s[0].startswith('（公館一間店的窗邊')]
    run.check('B 大一上：走到店門口出窗邊字幕（第一句）一次', len(mom) == 1 and mom[0][0] == MOM[0], J(mom))
    if mom:
        m = mom[0]; dur = (m[2] - m[1]) if m[2] else None
        others = [s for s in spans if s is not m and not s[0].startswith('（公館一間店的窗邊')]
        cut_mom = m[2] is not None and dur < 5500 and any(o[1] == m[2] for o in others)
        cut_circle = any(o[2] is not None and o[2] == m[1] and (m[1] - o[1]) < 3000 for o in others)
        run.check('B 窗邊字幕出滿 6 秒、沒有被圈子的字幕蓋掉，也沒有蓋掉正在出的圈子字幕', (dur is None or dur >= 5500) and not cut_mom and not cut_circle, J({'dur_ms': dur, 'others': others}))
    x2, caps2, _ = await door_visit(pg, cdp, run, 'B 大一上 第二間', prefer=x + 30, wait_s=10)
    mom2 = [s for s in B.cap_spans(caps2) if s[0].startswith('（公館一間店的窗邊')]
    run.check('B 同一學期走到另一間店門口（x=%.1f）：不再出' % x2, not mom2, J(mom2))
    # 大一下
    await B.jump(pg, cdp, run, ['Y1S2', 10, 5], 18.55, zone='gongguan', pos=None)
    sis = await B.wait_present(pg, 'heroine_05', max_s=40)
    x, caps, sis = await door_visit(pg, cdp, run, 'B 大一下')
    spans = B.cap_spans(caps); mom = [s for s in spans if s[0].startswith('（公館一間店的窗邊')]
    run.note('B 大一下 店門口 x=%.1f 字幕：%s' % (x, J(spans)))
    await run.shot(pg, 'B_y1s2_door')
    run.check('B 大一下（大一上看過）：出第二句「這次說話的是對面的人…」', len(mom) == 1 and mom[0][0] == MOM[1], J(mom))
    await B.jump(pg, cdp, run, ['Y1S2', 10, 5], 19.5, zone='campus', pos=None, note='那天晚上的校園')
    await pg.wait_for_timeout(6000)
    an = await B.who(pg, 'heroine_01'); wh = await pg.evaluate("(()=>{ const w=STORY.whereIs&&STORY.whereIs(GAME,'heroine_01'); return w?{zone:w.zone||null,away:w.away||null,label:w.label||null}:null; })()")
    await run.shot(pg, 'B_y1s2_campus')
    run.check('B 大一下那天 19:30 校園看不到以安', not an or an['hidden'], J({'npc': an, 'whereIs': wh}))
    # 阿凱三則
    for k, (key, texts) in enumerate(KAI):
        for meet in ([False, True] if k == 0 else [True]):
            st, d = await B.base(pg, save, key, 23.22, 'dorm', flags={'EXCHANGE_ROUTE': 'TW'})
            await B.load(pg, cdp, st)
            pr = await B.prep(pg, cdp, run, PREP_KAI, meet, label='%s 23:13 宿舍：有阿凱的聯絡方式%s' % (key, '、認識子晴' if meet else '、不另外讓他認識子晴（對照）'))
            if not meet and pr.get('knowsZq'):
                run.note('B 阿凱對照（不認識子晴）做不了：使用者存檔本來就認識子晴'); continue
            t = await B.phone_thread(pg, cdp, 'p:kai'); early = any(x in t['text'] for x in texts); await B.phone_close(pg, cdp)
            ok = await B.wait_hour(pg, cdp, 23.36, max_s=480)
            t = await B.phone_thread(pg, cdp, 'p:kai')
            pos = [t['text'].find(x) for x in texts]
            if meet:
                run.check('B 阿凱 %s：23:13 還沒有；23:21 三則照順序「%s」、沒有回覆鍵' % (key, '／'.join(texts)), ok and not early and all(p >= 0 for p in pos) and pos == sorted(pos) and not t['asks'], J({'等到': ok, 'early': early, 'pos': pos, 'asks': t['asks'], 'text': t['text'][-300:]}))
                await run.shot(pg, 'B_kai_%d' % (k + 1))
            else:
                run.check('B 阿凱 %s 對照：不認識子晴＝沒有' % key, ok and not any(p >= 0 for p in pos), J({'等到': ok, 'pos': pos}))
            await B.phone_close(pg, cdp)


async def main():
    URL, OUT = sys.argv[1], sys.argv[2]
    SAVEF = sys.argv[3] if len(sys.argv) > 3 else SP + '/bbtest/p0an/user_day14.json'
    save = json.load(open(SAVEF, encoding='utf-8'))
    run = L.Run('pool_aafix_' + MODE, OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        run.note('helpers %s' % await B.init(pg))
        fn = {'liqun': mode_liqun, 'shuhao': mode_shuhao, 'chengen': mode_chengen, 'chenxi': mode_chenxi, 'aa513': mode_aa513}.get(MODE)
        if fn: await fn(pg, cdp, run, save)
        else: run.check('MODE 要是 liqun／shuhao／chengen／chenxi／aa513', False, MODE)
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE)
        await b.close()
    sys.exit(run.finish())


if __name__ == '__main__':
    asyncio.run(main())
