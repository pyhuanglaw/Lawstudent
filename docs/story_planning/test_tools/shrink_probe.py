"""BB-B 10-30（NOODLE-TEAM-SHRINK-1030；AA_542 麵店團縮小成背景，使用者 X144；開發分支 9597ffa34；LAWWW-B 15:48 P1）：照 AA_542 第 8、9 節在瀏覽器玩。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。【前置】使用者 9/25 存檔改日子、時間、區域；【捷徑】另外標。
MODE=a：
  A 民總下課阿哲約吃麵 → 選「好。」→ 18:30 出遊「第一次併桌」（七句）→ 21:00 群組「法一吃飯」＋阿哲兩則「吃飯用」「誰要吃什麼就喊」
  C 玩家看得到的地方沒有「麵店團」（手機訊息、群組名、手機「訊息」「朋友」兩頁、說過的話、找人那一行）
  D 麵店日：大一上到大二下每個上課週剛好兩天、至少一天二／四；考試週、國定假日沒有；讀兩次一樣；四人作息 18:00 在麵店＝麵店日
  E2 舊存檔（【前置】使用者存檔加一個舊版的「麵店團」群組＋舊的兩則規矩）讀進來：名字換成當學年的、規矩換新句；大二下讀進來＝「法二吃飯」、不補發改名
MODE=b：
  B 選「今天不行。」→ 阿哲「好啊，下次。」→ 21:00 群組照樣建 → 下一個麵店日在麵店遇到阿哲才演「第一次併桌」
  P 之後三週的麵店日不去麵店：17:30 沒有揪人、沒有「你最近都沒來」
  E1 大二上開學那天 12:00 改名「法二吃飯」＋系統旁白
  F1 大二下春假：第 7 週沒去、第 10 週第一個麵店日才去＝「期中考完」那句；第 7 週去＝「春假回來以後」那句
  F2 舊開局（沒有 DORM_FOUR）大二 312：第一天和阿哲說話 z1、第二天 z2＝「這間窗戶看得到樹。我之前那間只看得到對面的冷氣。」
用法：LW_TESTS=<工作樹>/tests MODE=a|b python3 shrink_probe.py <URL>/index.html <輸出資料夾> <使用者存檔>"""
import os, sys, json, asyncio, time, re
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import bbplay as P
from playwright.async_api import async_playwright
URL, OUT, SAVEF = sys.argv[1], sys.argv[2], sys.argv[3]
SAVE = json.load(open(SAVEF, encoding='utf-8'))
MODE = os.environ.get('MODE', 'a')
J = lambda o: json.dumps(o, ensure_ascii=False)
OLD = '麵店團'
FIRST_TABLE = ['（阿哲把兩張桌子併起來。）', '你們？法律系的？', '一年級。阿姨，我們之後會常來。', '常來是多常？', '（想了一下）想吃麵的時候。', '那就是常來。', '（對你）這家便宜，又近。之後想吃麵就來，遇到就一起坐。']
RULES = ['吃飯用', '誰要吃什麼就喊']
FRIENDS = ['zhe', 'yu', 'classmate_bohan', 'classmate_xinci']
GRP = """(()=>{ const G=GAME.G, g=(PHONE.rec(G).groups||{}).noodle_team; return {joined:!!g, name:g?g.name:null, gday:g?CALENDAR.dateOf(g.day).key:null, tableDay:G.flags.noodleTableDay==null?null:CALENDAR.dateOf(G.flags.noodleTableDay).key,
  msgs:(G.msgs||[]).filter(m=>m&&m.th==='g:noodle_team').map(m=>({d:CALENDAR.dateOf(m.day).key, h:m.h, from:m.from||null, text:m.text, tag:m.tag||null}))}; })()"""
SCAN = """(w=>{ const G=GAME.G, out=[]; for(const m of (G.msgs||[])) if(m&&typeof m.text==='string'&&m.text.includes(w)) out.push(['msg',CALENDAR.dateOf(m.day).key,m.th,m.text]);
  for(const [k,g] of Object.entries(PHONE.rec(G).groups||{})) if(g&&String(g.name||'').includes(w)) out.push(['group',k,g.name]);
  return out; })"""
NDLDAYS = """(ids=>{ const T=CALENDAR.TERMS.filter(t=>ids.includes(t.id)), out=[];
  for(const t of T){ const a=STORY.dayOfKey(t.start), b=a+t.weeks*7-1; const wk={};
    for(let d=a; d<=b; d++){ const tt=CALENDAR.termOf(d); if(!tt||tt.id!==t.id) continue; const k=tt.week; const w=wk[k]||(wk[k]={week:k, exam:!!tt.exam, term:0, days:[], wds:[]});
      if(CALENDAR.kind(d)==='term'&&CALENDAR.dateOf(d).wd>=1&&CALENDAR.dateOf(d).wd<=5) w.term++;
      if(STORY.noodleDay(d)){ w.days.push(CALENDAR.dateOf(d).key); w.wds.push(CALENDAR.dateOf(d).wd); } }
    out.push({id:t.id, weeks:Object.values(wk)}); }
  return out; })"""
SCHED2 = """(([ids,keys])=>{ const G=GAME.G, d0=G.day, h0=G.hour, w0=G.weekday, out=[]; try{ for(const key of keys){ const d=STORY.dayOfKey(key); G.day=d; G.hour=18; G.weekday=CALENDAR.dateOf(d).wd%7;
    out.push({key, ndl:STORY.noodleDay(d), at:ids.map(id=>{ let e=null; try{ e=STORY.schedEnt(CHARACTERS[id],G); }catch(x){ return 'ERR '+x.message; } return e?(e.zone+(e.zone==='noodle'?'':'／'+(e.act||'')+(e.note?'〔'+String(e.note).slice(0,24)+'〕':''))):null; }).map(z=>z&&z.startsWith('noodle')?'noodle':z)}); } } finally { G.day=d0; G.hour=h0; G.weekday=w0; } return out; })"""
SCHED = """(([ids,keys])=>{ const G=GAME.G, out=[]; for(const key of keys){ const d=STORY.dayOfKey(key); const g=Object.assign(Object.create(Object.getPrototypeOf(G)),G,{day:d,hour:18,weekday:CALENDAR.dateOf(d).wd});
    const at=ids.map(id=>{ let e=null; try{ e=STORY.schedEnt(CHARACTERS[id],g); }catch(x){ e={err:x.message}; } return e&&e.zone==='noodle'; });
    out.push({key, ndl:STORY.noodleDay(d), at}); } return out; })"""


async def door_to(pg, cdp, run, to, label, max_s=200):
    it = await pg.evaluate("(to=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to===to); return it?[it.x,it.z,it.label]:null; })", to)
    if not it: run.note('%s：找不到往 %s 的門' % (label, to)); return False
    await L.go_to(pg, cdp, run, it[0], it[1], 0.9, it[2], max_s=max_s, stop=lambda s: s['dlg'] or s['choices']); await L.tap(pg, cdp, '#interact')
    for _ in range(40):
        await pg.wait_for_timeout(1000)
        if await pg.evaluate("GAME.G.zone") == to: return True
    return False


async def drain(pg, cdp, picks=(), secs=180, seen=None):
    """對話點過去、選項照 picks（照順序找含那幾個字的），沒有就第一個；回傳看到的選項"""
    t0 = time.time(); opts = seen if seen is not None else []; quiet = 0
    while time.time() - t0 < secs:
        s = await P.ts(pg)
        if s['ch']:
            opts.append([o['t'] for o in s['ch']])
            k = next((i for p in picks for i, o in enumerate(s['ch']) if p in o['t']), 0)
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); quiet = 0; continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(550); quiet = 0; continue
        if s['busy']: await pg.wait_for_timeout(700); quiet = 0; continue
        quiet += 1
        if quiet >= 4: break
        await pg.wait_for_timeout(800)
    return opts


async def invite(pg, cdp, run, pick):
    """使用者存檔改到民總那一天、上課前 → 手機「今天」按「直接去上課」→ 下課阿哲約 → 選 pick"""
    info = await pg.evaluate("""(()=>{ const G=GAME.G; const d=STORY.termDay('Y1S1',STORY.week1Start&&STORY.week1Start(G)?2:4,4); const it=(CLS.dayItems(G,d)||[]).find(x=>x.c&&x.c.id==='civ_general'&&!x.exam);
        return {d, key:CALENDAR.dateOf(d).key, item:it?{key:it.key, t0:it.t0, t1:it.t1, name:it.c.name}:null, week1:!!(STORY.week1Start&&STORY.week1Start(G))}; })()""")
    run.note('阿哲約吃麵那一天（termDay Y1S1 第 %s 週週四）：%s' % (2 if info['week1'] else 4, J(info)))
    if not info['item']: run.check('前置：那一天有民總', False, J(info)); return None
    snap = await P.snapshot(pg); C = snap.get('courses') or {}; pre = '%d:' % info['d']; cut = []
    for k in ('done', 'attend', 'late', 'abs', 'note', 'disc', 'ask', 'prep'):   # 使用者 9/25 存檔那一天的課已經上過（「上過了」，沒有「直接去上課」、下課不會約）：那一天的上課紀錄拿掉
        for kk in [x for x in (C.get(k) or {}) if str(x).startswith(pre) or str(x).startswith('plan_skip_' + pre)]: C[k].pop(kk, None); cut.append(k + ':' + kk)
    run.setup('【前置】使用者存檔在 %s 那一天的課已經上過，拿掉那一天的上課紀錄：%s' % (info['key'], J(cut)))
    await P.jump(pg, cdp, run, info['key'], info['item']['t0'] - 0.5, zone='campus', pos=None, quiet=False, snap=snap, note='民總上課前 30 分鐘在校園')
    bt = None; tries = []
    for _ in range(4):   # 跳過去以後先有對話（事件開著）時手機打不開：先把對話點完、選項照 pick，再開手機「今天」找「直接去上課」
        await drain(pg, cdp, picks=[pick, '坐'], secs=60)
        txt = await P.phone_tab(pg, cdp, 'today')
        bt = await pg.evaluate("(k=>{ const e=[...document.querySelectorAll('#phoneBody [data-go]')].find(b=>b.dataset.go===k); return e?(e.textContent||'').trim():null; })", info['item']['key'])
        tries.append({'bt': bt, 'phone': not await pg.evaluate("document.getElementById('phone').classList.contains('hide')"), 'h': await pg.evaluate("+(+GAME.G.hour).toFixed(2)"), 'today': (txt or '')[:160]})
        if bt: break
        await L.phone_away(pg, cdp); await pg.wait_for_timeout(1500)
    if bt: await L.tap(pg, cdp, '#phoneBody [data-go="%s"]' % info['item']['key'])
    else: await L.phone_away(pg, cdp)
    run.note('手機「今天」：%s；找按鈕的過程：%s' % (bt, J(tries)))
    n0 = await P.say_hook(pg); seen = []; t0 = time.time()
    while time.time() - t0 < 900:
        await drain(pg, cdp, picks=[pick, '坐'], secs=30, seen=seen)
        if await pg.evaluate("!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_zhe_noodle_invite)") and not (await P.ts(pg))['dlg']: break
        if await pg.evaluate("GAME.G.hour") > info['item']['t1'] + 1.0: break
        await pg.wait_for_timeout(1500)
    lines = await P.said(pg, n0); st = await pg.evaluate("(()=>({inv:GAME.G.flags.ZHE_NOODLE_INV||null, invDay:GAME.G.flags.zheNoodleInvDay==null?null:CALENDAR.dateOf(GAME.G.flags.zheNoodleInvDay).key, h:+(+GAME.G.hour).toFixed(2), zone:GAME.G.zone}))()")
    zl = [l for l in lines if l[0] == '阿哲']
    run.note('下課以後：%s；阿哲說的：%s；看到的選項：%s' % (J(st), J(zl[:8]), J(seen[-4:])))
    run.check('民總下課阿哲約：「晚上吃麵？公館那家，阿鳳。」', any(l[1] == '晚上吃麵？公館那家，阿鳳。' for l in zl), J(zl[:8]))
    run.check('選項是「好。」／「今天不行。」', any('「好。」' in o and '「今天不行。」' in o for o in seen), J(seen[-4:]))
    return info, st, lines


async def group_at_21(pg, cdp, run, tag, sys_text):
    ok = False; t0 = time.time()
    while time.time() - t0 < 3600 and not ok:   # b2：1500 秒還沒走到 21:05（SwiftShader 慢），群組那三格是在 21:00 以前查的；給到 60 分鐘，查的時候記遊戲時間
        ok = await P.wait_play(pg, cdp, 21.05, max_s=300, picks=['出發'], run=run, tag=tag)
    hh = await pg.evaluate("(()=>CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2))()")
    run.check('%s：前置——照玩家等到 21:05（現在 %s）' % (tag, hh), ok, hh)
    await pg.wait_for_timeout(3000); g = await pg.evaluate(GRP); run.note('%s 21:00 群組（%s）：%s' % (tag, hh, J(g)))
    texts = [m['text'] for m in g['msgs']]
    run.check('%s：21:00 群組建好，名字「法一吃飯」' % tag, g['joined'] and g['name'] == '法一吃飯', J({k: g[k] for k in ('joined', 'name', 'gday', 'tableDay')}))
    run.check('%s：系統訊息「%s」' % (tag, sys_text), sys_text in texts, J(texts[:6]))
    run.check('%s：阿哲兩則「吃飯用」「誰要吃什麼就喊」（照順序）' % tag, [m['text'] for m in g['msgs'] if m['from'] == 'zhe'][:2] == RULES, J(texts[:6]))
    return g


async def scan_old(pg, cdp, run, tag, lines):
    hits = await pg.evaluate(SCAN, OLD)
    t1 = await P.phone_tab(pg, cdp, 'msg'); t2 = await P.phone_tab(pg, cdp, 'friends'); await run.shot(pg, '%s_phone_friends' % tag)
    await P.phone_tab(pg, cdp, 'msg'); await run.shot(pg, '%s_phone_msg' % tag); await L.phone_away(pg, cdp)
    wt = await pg.evaluate("(ids=>ids.map(id=>{ try{ return [id, typeof GAME.whereText==='function'?GAME.whereText(id):(typeof STORY.whereText==='function'?STORY.whereText(id):null)]; }catch(e){ return [id,'err:'+e.message]; } }))", FRIENDS)
    said = [l for l in lines if OLD in l[1] or OLD in (l[0] or '')]
    run.note('%s 找人那一行：%s' % (tag, J(wt)))
    run.check('%s：玩家看得到的地方沒有「麵店團」（手機訊息、群組名、「訊息」「朋友」兩頁、說過的話、找人那一行）' % tag,
              not hits and OLD not in t1 and OLD not in t2 and not said and not any(OLD in str(x[1]) for x in wt),
              J({'data': hits[:4], 'msgTab': OLD in t1, 'friendsTab': OLD in t2, 'said': said[:3], 'where': [x for x in wt if OLD in str(x[1])]}))


async def mode_a(pg, cdp, run):
    st, d = await P.base(pg, SAVE, '2025-09-24', 12.0, 'campus'); await P.load(pg, cdp, st, quiet=False)
    run.setup('[前置] 使用者存檔改到 %s（%s 第 %s 週）12:00 校園' % (d['key'], d['term'], d['week']))
    pre = await pg.evaluate("(()=>({grp:!!(PHONE.rec(GAME.G).groups||{}).noodle_team, tableDay:GAME.G.flags.noodleTableDay, knowsZhe:STORY.knows?STORY.knows('zhe',GAME.G):null, classAnswer:GAME.G.flags.classAnswer, DORM_FOUR:GAME.G.flags.DORM_FOUR||null}))()")
    run.note('使用者存檔：%s' % J(pre))
    r = await invite(pg, cdp, run, '「好。」')
    if not r: return
    info, st1, l1 = r
    run.check('選「好。」：阿哲「六點半，店門口。」、ZHE_NOODLE_INV＝yes', st1['inv'] == 'yes' and any(l[1] == '六點半，店門口。' for l in l1), J(st1))
    PLANJS = "(()=>{ const q=(GAME.G.outings||[]).find(o=>o.id==='zhe_first_table'); return q?{h:q.h, place:q.place, title:q.title, state:q.state, now:+(+GAME.G.hour).toFixed(2)}:null; })()"
    plan = None; t0 = time.time()
    while time.time() - t0 < 180:   # 出遊是 S.tick 在下課那一場演完以後才排（story3d.js），先等它排好再查（n20_shrink_a2 下課當下就查＝太早）
        plan = await pg.evaluate(PLANJS)
        if plan: break
        await drain(pg, cdp, secs=8); await L.phone_away(pg, cdp); await pg.wait_for_timeout(1500)
    run.check('排好出遊：18:30 阿鳳麵店「第一次併桌」（下課以後排好）', bool(plan) and abs(plan['h'] - 18.5) < 0.01 and plan['place'] == '阿鳳麵店', J(plan))
    n0 = await P.say_hook(pg); t0 = time.time()
    while time.time() - t0 < 3000:   # 等到第一次併桌演完（或 20:30 還沒演）：SwiftShader 慢，15:10 → 18:30 要很久（a2 1500 秒不夠，七句在等 21:00 的時候才演）
        if await pg.evaluate("(()=>{ const D=GAME.G.events.done||{}; return !!D.ev_zhe_long_table_out||GAME.G.hour>=20.5; })()"): break
        await P.wait_play(pg, cdp, 24, max_s=60, picks=['出發'], run=None, tag='first_table')
    lines = await P.said(pg, n0); got = [l[1] for l in lines if l[1] in FIRST_TABLE]
    run.note('18:30 之後說的：%s' % J(lines[:14])); await run.shot(pg, 'a_after_table')
    run.check('18:30 出遊「第一次併桌」七句照順序', got == FIRST_TABLE, J({'got': got, 'n': len(got)}))
    run.check('「第一次併桌」演過（ev_zhe_long_table_out done）、哲 1 那場（ev_zhe_long_table）不再演', await pg.evaluate("(()=>{ const D=GAME.G.events.done||{}; return !!D.ev_zhe_long_table_out&&!D.ev_zhe_long_table; })()"), '')
    g = await group_at_21(pg, cdp, run, 'A 答應', '阿哲建立了群組「法一吃飯」，把你加了進來。')
    await scan_old(pg, cdp, run, 'A', lines)
    # D 麵店日（讀資料：每一天 STORY.noodleDay、四人 18:00 的作息）
    terms = ['Y1S1', 'Y1S2', 'Y2S1', 'Y2S2']
    nd1 = await pg.evaluate(NDLDAYS, terms); snap = await P.snapshot(pg); await P.load(pg, cdp, snap); nd2 = await pg.evaluate(NDLDAYS, terms)
    bad = []; allk = []
    for t in nd1:
        for w in t['weeks']:
            allk += w['days']
            if w['exam'] or w['term'] == 0:
                if w['days']: bad.append((t['id'], w['week'], 'exam/holiday', w['days']))
            elif w['term'] >= 5:
                if len(w['days']) != 2 or not any(x in (2, 4) for x in w['wds']): bad.append((t['id'], w['week'], 'count/24', w['days']))
            elif len(w['days']) > 2: bad.append((t['id'], w['week'], '>2', w['days']))
    run.note('麵店日（大一上第 1～6 週）：%s' % J([(w['week'], w['days']) for w in nd1[0]['weeks'][:6]]))
    short = [(t['id'], w['week'], w['term'], w['days']) for t in nd1 for w in t['weeks'] if not w['exam'] and 0 < w['term'] < 5]
    run.note('有放假的上課週（平日不到五天）：%s' % J(short))
    run.check('麵店日：上課週（五天都上課）剛好兩天、至少一天週二或週四；考試週、整週放假沒有', not bad, J(bad[:8]))
    hol = await pg.evaluate("(ks=>ks.filter(k=>CALENDAR.kind(STORY.dayOfKey(k))!=='term'))", allk)
    run.check('麵店日沒有落在國定假日（CALENDAR.kind 不是 term 的那幾天）', not hol, J(hol[:6]))
    run.check('同一份存檔讀兩次，挑到的麵店日一樣', nd1 == nd2, '')
    keys = [k for k in allk[:20]] + await pg.evaluate("(()=>{ const o=[]; const a=STORY.dayOfKey('2025-10-06'); for(let d=a; d<a+14; d++) if(CALENDAR.dateOf(d).wd>=1&&CALENDAR.dateOf(d).wd<=5) o.push(CALENDAR.dateOf(d).key); return o; })()")
    st0, d0 = await P.base(pg, SAVE, '2025-09-24', 12.0, 'campus'); await P.load(pg, cdp, st0)   # 用使用者存檔重新讀（a2 是在 A 跑完的狀態上算，Alison 那一格和 Node 不一樣）
    run.setup('[前置] 作息表：使用者存檔重新讀在 2025-09-24 12:00（不是 A 跑完的狀態）')
    sc = await pg.evaluate(SCHED2, [FRIENDS, keys])
    wrong = [x for x in sc if not x['ndl'] and any(z == 'noodle' for z in x['at'])]
    run.check('不是麵店日：四個人 18:00 都不在麵店', not wrong, J(wrong[:6]))
    run.check('麵店日：18:00 至少有一個人在麵店', all(any(z == 'noodle' for z in x['at']) for x in sc if x['ndl']), J([x for x in sc if x['ndl']][:4]))
    elsew = [x for x in sc if x['ndl'] and not all(z == 'noodle' for z in x['at'])]
    run.note('麵店日不在麵店的（特定作息蓋過麵店那一筆，AA_542 第 5 節「特定作息優先」）：%s' % J(elsew[:10], 2000))
    # E2 舊存檔
    for key, want in (('2025-10-01', '法一吃飯'), ('2027-03-10', '法二吃飯')):
        st, d = await P.base(pg, SAVE, key, 15.0, 'campus'); await P.load(pg, cdp, st)
        await P.prep(pg, cdp, run, """(()=>{ const G=GAME.G; PHONE.join(G,'noodle_team','麵店團'); PHONE.post(G,{th:'g:noodle_team',text:'阿哲建立了群組「麵店團」，把你加了進來。',tag:'noodle_team_new'});
            PHONE.post(G,{th:'g:noodle_team',from:'zhe',text:'以後週二週四 麵店長桌',tag:'noodle_team_rule'}); PHONE.post(G,{th:'g:noodle_team',from:'zhe',text:'有空就來 沒空不用講',tag:'noodle_team_rule'});
            PHONE.rec(G).groups.noodle_team.day=STORY.dayOfKey('2025-09-25'); G.flags.noodleTableDay=STORY.dayOfKey('2025-09-25'); return PHONE.rec(G).groups.noodle_team; })()""", label='舊版存檔：%s 有「麵店團」群組＋舊的兩則規矩（9/25 建）' % key)
        h0 = await pg.evaluate("GAME.G.day*24+GAME.G.hour"); t0 = time.time()
        while time.time() - t0 < 90:   # 等遊戲時間真的往前走（S.tick 跑過）再看：a2 讀進來 6 秒就查，2025-10-01 那一份還是「麵店團」；Node 直接呼叫 STORY.ndlGroupFix 兩份都會換
            if await pg.evaluate("GAME.G.day*24+GAME.G.hour") > h0 + 0.05: break
            await drain(pg, cdp, secs=6); await L.phone_away(pg, cdp); await pg.wait_for_timeout(1500)
        await pg.wait_for_timeout(3000); g = await pg.evaluate(GRP); texts = [m['text'] for m in g['msgs']]
        run.note('舊存檔 %s：讀進來以後遊戲時間 %.2f → %.2f' % (key, h0 % 24, (await pg.evaluate("GAME.G.hour"))))
        run.note('舊存檔 %s 讀進來：%s' % (key, J(g)))
        run.check('舊存檔 %s：群組名稱換成「%s」' % (key, want), g['name'] == want, J(g['name']))
        run.check('舊存檔 %s：舊的兩則規矩換新句、建立那則寫「法一吃飯」' % key, '吃飯用' in texts and '誰要吃什麼就喊' in texts and '以後週二週四 麵店長桌' not in texts and not any(OLD in t for t in texts),
                  J(texts[:6]))
        if want == '法二吃飯':
            run.check('舊存檔讀進來的時候已經過了大二開學：不補發改名旁白', not any('改成' in t for t in texts), J(texts))


async def noodle_days_after(pg, start_key, n):
    return await pg.evaluate("(([k,n])=>{ const o=[]; let d=STORY.dayOfKey(k)+1; while(o.length<n&&d<STORY.dayOfKey(k)+120){ if(STORY.noodleDay(d)) o.push(CALENDAR.dateOf(d).key); d++; } return o; })", [start_key, n])


async def visit_noodle(pg, cdp, run, key, tag, hh=17.9):
    await P.jump(pg, cdp, run, key, hh, zone='gongguan', pos='keep', quiet=False)
    it = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='noodle'); return it?[it.x,it.z]:null; })()")
    if it: await P.place_near(pg, run, it[0], it[1], 5.0, what='阿鳳麵店門口')
    n0 = await P.say_hook(pg); ok = await door_to(pg, cdp, run, 'noodle', tag)
    await pg.wait_for_timeout(4000); await drain(pg, cdp, secs=90); await pg.wait_for_timeout(6000); await drain(pg, cdp, secs=60)
    lines = await P.said(pg, n0); await run.shot(pg, 'noodle_%s' % tag)
    return ok, lines


async def mode_b(pg, cdp, run):
    st, d = await P.base(pg, SAVE, '2025-09-24', 12.0, 'campus'); await P.load(pg, cdp, st, quiet=False)
    run.setup('[前置] 使用者存檔改到 %s（%s 第 %s 週）12:00 校園' % (d['key'], d['term'], d['week']))
    r = await invite(pg, cdp, run, '「今天不行。」')
    if not r: return
    info, st1, l1 = r
    run.check('選「今天不行。」：阿哲「好啊，下次。」、沒有排出遊', st1['inv'] == 'no' and any(l[1] == '好啊，下次。' for l in l1) and not await pg.evaluate("(GAME.G.outings||[]).some(o=>o.id==='zhe_first_table')"), J(st1))
    g = await group_at_21(pg, cdp, run, 'B 沒答應', '阿哲建立了群組「法一吃飯」，把你加了進來。')
    nds = await noodle_days_after(pg, info['key'], 8); run.note('之後的麵店日：%s' % J(nds))
    # P 之後三週的麵店日不去：17:20～17:45 站在宿舍，看 17:30 有沒有揪人
    pings = []
    for k in nds[:6]:
        await P.jump(pg, cdp, run, k, 17.3, zone='dorm', pos=None)
        await P.wait_play(pg, cdp, 17.75, max_s=300, run=run, tag='ping_%s' % k)
    gm = await pg.evaluate(GRP)
    rt = await pg.evaluate("(()=>(GAME.G.msgs||[]).filter(m=>m&&((m.tag&&/^rt_zhe_ndl/.test(m.tag))||/你最近都沒來|還好嗎/.test(m.text||''))).map(m=>[CALENDAR.dateOf(m.day).key,m.h,m.from,m.text,m.tag]))()")
    zt = [m for m in gm['msgs'] if m['from'] == 'zhe' and m['text'] not in RULES]
    run.note('六個麵店日沒去以後，群組：%s' % J(gm['msgs'][-8:]))
    run.check('之後六個麵店日沒去：阿哲沒有 17:30 揪人、沒有「你最近都沒來」', not rt and not [m for m in zt if m['h'] and 17.2 <= m['h'] <= 17.8], J({'rt': rt, 'zhe': zt[:6]}))
    # B 下一個麵店日在麵店遇到阿哲：第一次併桌
    ok, lines = await visit_noodle(pg, cdp, run, nds[0] if nds else info['key'], 'b_meet', hh=17.9)
    got = [l[1] for l in lines if l[1] in FIRST_TABLE]
    run.note('沒答應的玩家第一次走進麵店：%s' % J(lines[:12]))
    run.check('沒答應：之後在麵店遇到阿哲才演「第一次併桌」（七句照順序）', ok and got == FIRST_TABLE, J({'got': got, 'zhe': await P.who(pg, 'zhe')}))
    await scan_old(pg, cdp, run, 'B', l1 + lines)
    snapG = await P.snapshot(pg)
    # E1 大二上開學那天 12:00 改名
    y2 = await pg.evaluate("(()=>{ const T=CALENDAR.TERMS.find(t=>t.id==='Y2S1'); return T.start; })()")
    await P.jump(pg, cdp, run, y2, 11.8, zone='dorm', pos=None, snap=snapG, quiet=False, note='大二上開學那天 11:48')
    g0 = await pg.evaluate(GRP)
    await P.wait_play(pg, cdp, 12.1, max_s=300, run=run, tag='rename'); await pg.wait_for_timeout(3000); g1 = await pg.evaluate(GRP)
    nar = [m for m in g1['msgs'] if '改成' in (m['text'] or '')]
    run.note('大二上 %s 11:48 群組名 %s → 12:06 %s；旁白 %s' % (y2, g0['name'], g1['name'], J(nar)))
    run.check('大二上開學那天 12:00 群組改名「法二吃飯」', g0['name'] == '法一吃飯' and g1['name'] == '法二吃飯', J([g0['name'], g1['name']]))
    run.check('改名有一則系統旁白「（阿哲把群組名稱改成「法二吃飯」。）」、12:00', any(m['text'] == '（阿哲把群組名稱改成「法二吃飯」。）' and not m['from'] and abs((m['h'] or 0) - 12) < 0.1 for m in nar), J(nar))
    # F2 舊開局（沒有 DORM_FOUR）大二 312：第一天 z1、第二天 z2
    df = await pg.evaluate("!!GAME.G.flags.DORM_FOUR"); run.note('DORM_FOUR：%s（使用者存檔是舊開局）' % df)
    zl = []
    for k in range(2):
        day = await pg.evaluate("(([s,k])=>CALENDAR.dateOf(STORY.dayOfKey(s)+k).key)", [y2, k])
        await P.jump(pg, cdp, run, day, 22.3, zone='dorm', pos=None, quiet=False, note='大二上 312 房間 22:18（阿哲 22:00 回房間）')
        await pg.wait_for_timeout(5000); await drain(pg, cdp, secs=40)
        if await P.who(pg, 'zhe'):
            r2 = await P.talk_full(pg, cdp, run, 'zhe', 'r312_%d' % k, max_s=200); zl.append([l for l in (r2['lines'] if r2 else []) if l[0] == '阿哲'])
        else: zl.append(None)
    run.note('312 和阿哲說話：%s' % J(zl))
    z2 = '這間窗戶看得到樹。我之前那間只看得到對面的冷氣。'
    run.check('舊開局 312：第二天和阿哲說話是「%s」（不是「203 只看得到」）' % z2, not df and bool(zl[1]) and any(l[1] == z2 for l in zl[1]) and not any('203 只看得到' in l[1] for x in zl if x for l in x), J(zl))
    # F1 大二下春假：第 7～10 週
    wk = await pg.evaluate("""(()=>{ const T=CALENDAR.TERMS.find(t=>t.id==='Y2S2'); const a=STORY.dayOfKey(T.start), b=a+T.weeks*7-1, o={};
        for(let d=a; d<=b; d++){ const t=CALENDAR.termOf(d); if(!t||t.id!=='Y2S2'||t.week<7||t.week>10) continue; (o[t.week]||(o[t.week]=[])).push([CALENDAR.dateOf(d).key, STORY.noodleDay(d), !!t.exam]); }
        return o; })()""")
    run.note('大二下第 7～10 週：%s' % J(wk))
    w7 = [x[0] for x in wk.get('7', []) if x[1]]; w10 = [x[0] for x in wk.get('10', []) if x[1]]
    for days, tag, want in ((w10, 'spring_w10', '（期中考完，第一次在麵店遇到大家。春假去了哪裡，到現在還有人在講。）'), (w7, 'spring_w7', '（春假回來以後，第一次在麵店遇到大家。每個人都在講自己這幾天去了哪裡。）')):
        if not days: run.check('%s：那一週有麵店日' % tag, False, J(wk)); continue
        await P.load(pg, cdp, snapG)   # 同一份進度（群組已經在）：第 7 週沒去（直接跳到第 10 週）
        ok, lines = await visit_noodle(pg, cdp, run, days[0], tag, hh=18.0)
        run.note('%s %s 走進麵店：%s' % (tag, days[0], J(lines[:8])))
        run.check('大二下春假那則：%s（%s）' % ('第 7 週沒去、第 10 週第一個麵店日才去' if tag == 'spring_w10' else '第 7 週麵店日去', days[0]), ok and any(l[1] == want for l in lines), J(lines[:6]))


async def main():
    run = L.Run('shrink_' + MODE, OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()"); await P.init(pg)
        await {'a': mode_a, 'b': mode_b}[MODE](pg, cdp, run)
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE)
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
