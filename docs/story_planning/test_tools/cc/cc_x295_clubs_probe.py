"""CC（帳號 A）11-10：X295「社課入社單」探針 B（AA_737 lateJoin；LAWWW 08:45 3f6dba142 → 08:49 第二版 8c050804c，改前 10df264ed）。
程式（8c050804c）讀到的：
  src/data/activities.js LATE_JOIN：clubs＝club_guitar、club_debate、club_hiking、dept_basketball；term Y1S1、weeks [5,6]；
    narr「（社課快結束的時候，社長拿著一疊入社單走過來。）」→ 社長「要不要填一張？填了就算社員，下禮拜開始點名。」→ 選項「填／先不要」→
    填＝「好，名字寫這裡。社費下次再收。」（系籃：說的人「系籃隊長」、「好，名字寫這裡。隊費下次再收。」）；先不要＝「沒關係，下禮拜還可以來。」、第 6 週 no6「好，那有空再來玩。」。
    旗標 CLUB_<id>（填）、CLUB_LATE_<id>＝問過的那一週。第二版：lateDeclined 只在第 5、6 週內；第 7 週以後照 AA_485 3-4 一去就入社＋門口那一句。
  src/classes3d.js attendActivity：lateJoinDue 在參加以前判斷；轉暗快轉到 t1、旁白之後 S.lateJoinAsk（「社課結束時」問）；填了以後跑 CLUBFAIR.DOOR_AFTER（判斷誰在場時 G.hour 暫時設 t1−1 分鐘）。
  src/aa613_3d.js S.doorAfter：只有 dept_basketball、旗標 AA613_BALL_GO 不是 null、阿哲作息（STORY.schedEnt）在同一區＝阿哲「我就說吧。」。
    AA613_BALL_GO 原本由第一次練球前一天 21:00 阿哲私訊（ask id aa613_ball_zhe）選「好，我去看看。」設定（值＝第一次練球那天的 day）。
  src/clubfair3d.js doorLine：第 7 週以後沒入社的第一次社課，開頭演 CLUB_FAIR.DOOR_LINE「（你在門口填了表。）」（系籃換 DOOR_SAY_BY 學長兩句）。
  地點：吉他社＝wancai 一樓「多功能教室」門口（門口參加，CLS.roomDoor；週一、三 19:00–21:00）；辯論社＝boya 2F 博思 201 座位（坐下選「參加：辯論社社課」；週二 19:00–21:00）；
    系籃＝campus 集合點「系籃練球」(3.3,−112.7)（週五 17:30–19:00）；下雨＝gym 集合點 (−5.1,13.8)（ACTIVITIES.rainy：17:30 的天氣定整場）。
【前置／捷徑】（R.setup 印出）：GAME.defaults（法律系）＋讀檔擺日期（大一上第 W 週那個社課的那一天，ACTIVITIES.on 為真的第一天）、時間（開始後 2～3 分鐘）、天氣（clear／rain）、
  區域；人站的起點（離目標 6～14 m、同一層，第二次讀同一份存檔）；條件事件關閉（quiet_events）；zhe_yes 設旗標 AA613_BALL_GO（見上）；
  later 的第 6、7 週＝把同一局的 GAME.snapshot() 改日期再讀（旗標、出席紀錄照留）。
之後照玩家：L.go_to 走過去 → 看互動鍵 → 按 #interact → 讀對話框（#dlgName＋GAME.D.sayText）、點 #dlg、點畫面上的選項按鈕。沒有 ?turbo、沒有瞬移。
CASES（逗號隔開，預設全部）：guitar,debate,bball_sun,bball_rain,zhe_yes,zhe_no,later
  guitar／debate／bball_sun／bball_rain：第 5 週，入社單出現在社課結束時（G.hour ≥ t1−0.05）→ 選「填」→ 回那一句、CLUB_<id>＝true；開頭沒有門口那一句；系籃說的人「系籃隊長」；
    bball_rain：在 gym、旁白是走廊那句；bball_sun：在 campus、沒有走廊那句。四段都不能出現「我就說吧。」（沒設 AA613_BALL_GO）。
  zhe_yes：系籃晴天＋AA613_BALL_GO → 填 → 回那一句之後「我就說吧。」；zhe_no：系籃晴天、沒有 AA613_BALL_GO → 填 → 不能有「我就說吧。」。
  later（LATER_CLUB，預設 club_guitar）：第 5 週「先不要」→ no；第 6 週再問一次 → 「先不要」→ no6；第 7 週一去開頭就有門口那一句、沒有入社單、CLUB_<id>＝true。
截圖：入社單選單出現時（*_menu.png）、「系籃隊長」出現時（*_captain.png）、到達互動點時、結束時。對話框實際文字全部印出（LINE／CAP）。
改前（10df264ed）沒有 LATE_JOIN：預期 FAIL；改後 PASS。Playwright 手機橫向模擬（SwiftShader），不是 iPhone。
用法：LW_TESTS=<wt>/tests TAG=new|old [CASES=…] [LATER_CLUB=club_debate] python3 cc_x295_clubs_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
CASES = [c.strip() for c in (os.environ.get('CASES') or 'guitar,debate,bball_sun,bball_rain,zhe_yes,zhe_no,later').split(',') if c.strip()]
LATER_CLUB = os.environ.get('LATER_CLUB') or 'club_guitar'
R = L.Run('x295_clubs_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)

# 台詞（照 8c050804c 的 src/data/activities.js LATE_JOIN、src/aa613_3d.js、src/data/club_fair.js 一字照抄）
NARR = '（社課快結束的時候，社長拿著一疊入社單走過來。）'
ASK = '要不要填一張？填了就算社員，下禮拜開始點名。'
YES = '好，名字寫這裡。社費下次再收。'
YES_BB = '好，名字寫這裡。隊費下次再收。'
NO = '沒關係，下禮拜還可以來。'
NO6 = '好，那有空再來玩。'
TOLD = '我就說吧。'
DOOR_LINE = '（你在門口填了表。）'
DOOR_SAY_BB = ['新來的？大一？', '名字寫這裡。之後每週五，有空就來。']
RAIN_NARR = '（今天在體育館走廊練運球。球聲在走廊裡很大聲。）'
CAPTAIN = '系籃隊長'

CLUB = {   # 活動 id、區域、時間、怎麼找互動點
    'club_guitar': {'zone': 'wancai', 't0': 19.0, 't1': 21.0, 'hour': 19.05, 'kind': 'door', 'join': '參加：吉他社社課'},
    'club_debate': {'zone': 'boya', 't0': 19.0, 't1': 21.0, 'hour': 19.05, 'kind': 'seat', 'join': '參加：辯論社社課', 'start': (-8.0, 1.0, 1)},
    'dept_basketball': {'zone': 'campus', 't0': 17.5, 't1': 19.0, 'hour': 17.55, 'kind': 'spot', 'join': '去練球：系籃練球'},
}

ST = r"""(()=>{ const E=GAME.E, P=E.player, o=P.obj.position, D=GAME.D; const ch=document.getElementById('choices'), it=document.getElementById('interact'), cp=document.getElementById('caption');
  const btxt=b=>{ const c=b.cloneNode(true); c.querySelectorAll('.hint').forEach(h=>h.remove()); return (c.textContent||'').trim(); };
  const choices=(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(btxt):[];
  return {zone:GAME.G.zone, x:+o.x.toFixed(2), z:+o.z.toFixed(2), lv:P.lv|0, busy:!!P.busy, path:P.path?P.path.length:0, dlg:!!(D&&D.active),
    name:((document.getElementById('dlgName')||{}).textContent||'').trim(), text:(D&&D.active&&D.sayText!=null)?String(D.sayText):((document.getElementById('dlgText')||{}).textContent||''),
    choices, cap:(cp&&!cp.classList.contains('hide'))?(cp.innerText||'').trim():'', interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim().slice(0,30):'',
    hour:+(+GAME.G.hour).toFixed(3), day:GAME.G.day, weather:GAME.G.weather, paused:!!E.paused, fb:GAME.walkFallbacks||0,
    phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())}; })()"""

DAY_JS = r"""((q)=>{ const a=ACTIVITIES.list.find(x=>x.id===q.aid); const r=CALENDAR.termDays('Y1S1'); if(!a||!r) return {err:'no act/term', a:!!a};
  for(let d=r.from; d<=r.to; d++){ const t=CALENDAR.termOf(d), k=CALENDAR.dateOf(d); if(t&&t.id==='Y1S1'&&t.week===q.w&&ACTIVITIES.on(a,d,GAME.G)) return {day:d, key:k.key, wd:k.wd, week:t.week}; }
  return {err:'這一週沒有'}; })"""

FLAGS = "JSON.parse(JSON.stringify(GAME.defaults().flags))"

TARGET_JS = r"""((q)=>{ const E=GAME.E, I=E.interactables||[];
  if(q.kind==='spot'){ const it=I.find(i=>i.actSpot===q.aid&&!!i.rainSpot===!!q.rain&&!i.hidden); return it?{x:it.x,z:it.z,lv:it.lv|0,r:it.radius||1.2,label:it.label}:null; }
  if(q.kind==='door'){ const it=I.find(i=>/多功能教室/.test(i.label||'')&&i.onInteract&&!i.hidden&&(i.lv|0)===0); return it?{x:it.x,z:it.z,lv:it.lv|0,r:it.radius||1.5,label:it.label}:null; }
  if(q.kind==='seat'){ const P=E.player.obj.position; const ss=I.filter(i=>i.seat&&!i.hidden&&i.seat.room==='201'&&(i.lv|0)===1); if(!ss.length) return null;
    ss.sort((a,b)=>Math.hypot(a.x-q.sx,a.z-q.sz)-Math.hypot(b.x-q.sx,b.z-q.sz)); const it=ss[0]; return {x:it.x,z:it.z,lv:1,r:it.radius||0.8,label:it.label,n:ss.length}; }
  return null; })"""

START_JS = r"""((q)=>{ const E=GAME.E; for(const r of [10,9,11,8,12,7,13,6,14]) for(let a=0;a<360;a+=15){ const x=q.x+r*Math.sin(a*Math.PI/180), z=q.z+r*Math.cos(a*Math.PI/180);
    if(E.canStand(x,z,0.4,q.lv)&&E.canStand(x+0.5,z,0.3,q.lv)&&E.canStand(x,z+0.5,0.3,q.lv)&&E.canStand(x-0.5,z,0.3,q.lv)&&E.canStand(x,z-0.5,0.3,q.lv)) return {x:+x.toFixed(2),z:+z.toFixed(2),lv:q.lv,r}; } return null; })"""

INFO_JS = r"""((aid)=>{ const G=GAME.G, a=ACTIVITIES.list.find(x=>x.id===aid), F=G.flags||{}; const z=(typeof STORY!=='undefined'&&STORY.schedEnt&&typeof CHARACTERS!=='undefined'&&CHARACTERS.zhe)?STORY.schedEnt(CHARACTERS.zhe,G):null;
  return {CLUB:F['CLUB_'+aid]===undefined?null:F['CLUB_'+aid], CLUB_LATE:F['CLUB_LATE_'+aid]===undefined?null:F['CLUB_LATE_'+aid], BALL_GO:F.AA613_BALL_GO===undefined?null:F.AA613_BALL_GO,
    attended:!!(a&&ACTIVITIES.attended(G,aid,G.day)), hasLate:!!ACTIVITIES.LATE_JOIN, due:ACTIVITIES.lateJoinDue?!!ACTIVITIES.lateJoinDue(G,a):null, declined:ACTIVITIES.lateDeclined?!!ACTIVITIES.lateDeclined(G,a):null,
    place:ACTIVITIES.placeOf?ACTIVITIES.placeOf(a,G).zone:null, zheZone:z?z.zone:null, zheLabel:z?(z.label||z.act||null):null, zheName:typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName('zhe'):null}; })"""


async def st(pg):
    return await pg.evaluate(ST)


async def tap_choice(pg, cdp, idx):
    c = await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent!==null); const e=b[i]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % idx)
    if c: await L.touch_tap(cdp, c[0], c[1])
    return bool(c)


async def load_week(pg, cdp, tag, aid, week, weather, extra_flags=None, snap=None):
    """[前置] 讀檔到那一週那個社課的那一天、開始後幾分鐘、區域入口；回傳 (day 資訊)"""
    c = CLUB[aid]; zone = 'gym' if weather == 'rain' and aid == 'dept_basketball' else c['zone']
    dd = await pg.evaluate(DAY_JS + '(%s)' % J({'aid': aid, 'w': week}))
    if not R.check('%s 大一上第 %d 週有 %s（ACTIVITIES.on）' % (tag, week, aid), 'day' in dd, J(dd)): return None
    if snap is None:
        flags = await pg.evaluate(FLAGS)
        flags.update(extra_flags or {})
        s = {'stage': 'law', 'zone': zone, 'day': dd['day'], 'weekday': dd['wd'], 'hour': c['hour'], 'weather': weather, 'pos': None, 'flags': flags}
        R.setup('%s GAME.defaults（法律系）＋讀檔：%s（day %s、星期 %s、第 %d 週）%s、天氣 %s、區域 %s 入口；條件事件關閉%s' % (
            tag, dd['key'], dd['day'], dd['wd'], week, c['hour'], weather, zone, ('；旗標 ' + J(extra_flags)) if extra_flags else ''))
    else:
        s = snap; s.update({'zone': zone, 'day': dd['day'], 'weekday': dd['wd'], 'hour': c['hour'], 'weather': weather, 'pos': None})
        R.setup('%s 同一局的 GAME.snapshot() 改日期再讀：%s（day %s、第 %d 週）%s、天氣 %s、區域 %s 入口（旗標、出席紀錄照留）' % (tag, dd['key'], dd['day'], week, c['hour'], weather, zone))
    await L.load_state(pg, s, quiet_events=True)
    await D.wait_zone(pg, cdp, zone, 60); await pg.wait_for_timeout(3000); await L.close_panels(pg, cdp)
    return dd


async def place_start(pg, cdp, tag, aid, rain):
    """找互動點；離太遠或不同層＝[前置] 同一份存檔再讀一次，人站到離目標 6～14 m 的地方"""
    c = CLUB[aid]; zone = 'gym' if rain else c['zone']
    q = {'kind': c['kind'], 'aid': aid, 'rain': rain, 'sx': -8.9, 'sz': -3.2}
    tg = await pg.evaluate(TARGET_JS + '(%s)' % J(q))
    if not R.check('%s 區域 %s 裡找到互動點' % (tag, zone), bool(tg), J(tg)): return None
    s = await st(pg)
    far = math.hypot(tg['x'] - s['x'], tg['z'] - s['z'])
    if s['lv'] != tg['lv'] or far > 30 or far < 4:
        if c.get('start') and not rain:
            sx, sz, slv = c['start']; ok = await pg.evaluate("GAME.E.canStand(%s,%s,0.4,%s)" % (sx, sz, slv))
            pt = {'x': sx, 'z': sz, 'lv': slv} if ok else await pg.evaluate(START_JS + '(%s)' % J(tg))
        else:
            pt = await pg.evaluate(START_JS + '(%s)' % J(tg))
        if not R.check('%s 目標附近有站得住的起點' % tag, bool(pt), J(tg)): return None
        snap = json.loads(await pg.evaluate("JSON.stringify(GAME.snapshot())"))
        snap['pos'] = {'x': pt['x'], 'z': pt['z'], 'yaw': 0, 'lv': pt['lv']}
        R.setup('%s 同一份存檔再讀一次，人站到 (%s, %s, lv %s)（離互動點 %.1f m；原本入口離 %.1f m、lv %s）' % (tag, pt['x'], pt['z'], pt['lv'], math.hypot(tg['x'] - pt['x'], tg['z'] - pt['z']), far, s['lv']))
        await L.load_state(pg, snap, quiet_events=True)
        await D.wait_zone(pg, cdp, zone, 60); await pg.wait_for_timeout(3000); await L.close_panels(pg, cdp)
        tg = await pg.evaluate(TARGET_JS + '(%s)' % J(q))
    R.note('%s 互動點：%s' % (tag, J(tg)))
    return tg


async def play_session(pg, cdp, tag, aid, rain, picks):
    """走過去、按、選參加、把對話一句一句點完；picks＝入社單出現時依序選什麼（'填'／'先不要'）。回傳紀錄"""
    c = CLUB[aid]; zone = 'gym' if rain else c['zone']
    tg = await place_start(pg, cdp, tag, aid, rain)
    if not tg: return None
    s = await st(pg)
    R.check('%s 開始時在 %s（天氣 %s）' % (tag, zone, s['weather']), s['zone'] == zone, J({k: s[k] for k in ('zone', 'x', 'z', 'lv', 'hour', 'weather')}))
    near = 0.5 if c['kind'] == 'seat' else max(0.4, tg['r'] * 0.5)
    await L.go_to(pg, cdp, R, tg['x'], tg['z'], near, '%s 走到互動點' % tag, max_s=360, lv=tg['lv'])
    s = await D.settle(pg)
    for _ in range(10):
        if s['interact']: break
        await pg.wait_for_timeout(500); s = await st(pg)
    want = tg['label'] if c['kind'] != 'seat' else None
    ok_btn = bool(s['interact']) and (want is None or s['interact'].startswith(want[:6]))
    R.check('%s 走到那裡，互動鍵出現（%s）' % (tag, s['interact'] or '沒有'), ok_btn, J({k: s[k] for k in ('x', 'z', 'lv', 'interact', 'hour')}))
    await D.shot(pg, '%s_%s_at' % (TAG, tag))
    if not ok_btn: return None
    await L.tap(pg, cdp, '#interact')
    log = {'lines': [], 'caps': [], 'menus': [], 'join': None, 'captain_shot': False}
    last_line = None; last_cap = None; t0 = time.time(); idle = None; joined = False; pi = 0
    while time.time() - t0 < 420:
        s = await st(pg)
        if s['phone'] or (s['paused'] and not s['dlg'] and not s['choices']):
            await L.close_panels(pg, cdp); await L.phone_away(pg, cdp)
        if s['cap'] and s['cap'] != last_cap:
            last_cap = s['cap']; log['caps'].append({'cap': s['cap'], 'hour': s['hour']}); print('  CAP %.2f %s' % (s['hour'], s['cap']), flush=True)
        if s['dlg'] and s['text']:
            key = (s['name'], s['text'])
            if key != last_line:
                last_line = key; log['lines'].append({'name': s['name'], 'text': s['text'], 'hour': s['hour'], 'zone': s['zone']})
                print('  LINE %.2f [%s] %s' % (s['hour'], s['name'] or '旁白', s['text']), flush=True)
                if s['name'] == CAPTAIN and not log['captain_shot']:
                    await pg.wait_for_timeout(900); await D.shot(pg, '%s_%s_captain' % (TAG, tag)); log['captain_shot'] = True
        if s['choices']:
            ch = s['choices']; print('  CHOICES %.2f %s' % (s['hour'], J(ch)), flush=True)
            if sorted(ch) == sorted(['填', '先不要']):
                pick = picks[pi] if pi < len(picks) else '填'; pi += 1
                prev = log['lines'][-1] if log['lines'] else None
                log['menus'].append({'hour': s['hour'], 'prev': prev, 'pick': pick, 'n_lines': len(log['lines'])})
                await D.shot(pg, '%s_%s_menu%d' % (TAG, tag, len(log['menus'])))
                await tap_choice(pg, cdp, ch.index(pick))
            else:
                j = next((i for i, t in enumerate(ch) if t.startswith(c['join'])), None)
                if j is not None and not joined:
                    log['join'] = {'choices': ch, 'hour': s['hour']}; joined = True; await tap_choice(pg, cdp, j)
                else:
                    R.note('%s 其他選項 %s → 選第 1 個' % (tag, J(ch))); await tap_choice(pg, cdp, 0)
            idle = None; await pg.wait_for_timeout(900); continue
        if s['dlg']:
            await L.tap(pg, cdp, '#dlg'); idle = None; await pg.wait_for_timeout(700); continue
        inf = await pg.evaluate(INFO_JS + '(%s)' % J(aid))
        if inf['attended'] and not s['busy']:
            if idle is None: idle = time.time()
            if any('社課結束了' in x['cap'] for x in log['caps']) and time.time() - idle > 3: break
            if time.time() - idle > 12: break
        elif not joined and time.time() - t0 > 40:
            R.note('%s 按下去 40 秒還沒有參加的選項' % tag); break
        await pg.wait_for_timeout(600)
    await D.shot(pg, '%s_%s_end' % (TAG, tag), judge_black=False)
    log['info'] = await pg.evaluate(INFO_JS + '(%s)' % J(aid)); log['end'] = await st(pg)
    R.note('%s 結束：%s' % (tag, J(log['info'])))
    R.check('%s 選單有「%s」並參加了' % (tag, c['join']), bool(log['join']), J(log['join']))
    R.check('%s 沒有用到自動走路的備援（walkFallbacks＝0）' % tag, log['end']['fb'] == 0, str(log['end']['fb']))
    return log


def idx(log, text, name=None, start=0):
    for i, l in enumerate(log['lines'][start:], start):
        if l['text'].strip() == text and (name is None or l['name'] == name): return i
    return -1


def has_text(log, text):
    return any(text in l['text'] for l in log['lines']) or any(text in c['cap'] for c in log['caps'])


def judge_join(tag, aid, log, pick='填', week=5):
    """入社單：社課結束時出現、台詞、選了以後的回話"""
    c = CLUB[aid]; bb = aid == 'dept_basketball'; who = CAPTAIN if bb else '社長'
    m = log['menus']
    if not R.check('%s 第 %d 週社課結束時出現入社單選項「填／先不要」' % (tag, week), len(m) == 1, J(m)): return
    m = m[0]
    R.check('%s 入社單是在社課結束時（G.hour %.2f ≥ t1 %.2f−0.05）' % (tag, m['hour'], c['t1']), m['hour'] >= c['t1'] - 0.05, J(m))
    i_n = idx(log, NARR); i_a = idx(log, ASK)
    R.check('%s 旁白「%s」' % (tag, NARR), i_n >= 0, '')
    R.check('%s 「%s」說「%s」（說的人名字照實記：%s）' % (tag, who, ASK, log['lines'][i_a]['name'] if i_a >= 0 else '—'), i_a >= 0 and log['lines'][i_a]['name'] == who, J(log['lines'][i_a] if i_a >= 0 else None))
    R.check('%s 順序：旁白 → 問 → 選項' % tag, 0 <= i_n < i_a < m['n_lines'] + 1 and m['prev'] and m['prev']['text'].strip() == ASK, J(m['prev']))
    if bb:
        R.check('%s 顯示「系籃隊長」（有截圖）' % tag, log['captain_shot'], '')
    if pick == '填':
        yes = YES_BB if bb else YES
        i_y = idx(log, yes, start=max(i_a, 0))
        R.check('%s 選「填」→ %s「%s」' % (tag, who, yes), i_y >= 0 and log['lines'][i_y]['name'] == who, J(log['lines'][i_y] if i_y >= 0 else log['lines'][-3:]))
        R.check('%s 選「填」以後 CLUB_%s＝true' % (tag, aid), log['info']['CLUB'] is True, J(log['info']))
    else:
        no = NO6 if week == 6 else NO
        i_o = idx(log, no, start=max(i_a, 0))
        R.check('%s 選「先不要」→ %s「%s」' % (tag, who, no), i_o >= 0 and log['lines'][i_o]['name'] == who, J(log['lines'][i_o] if i_o >= 0 else log['lines'][-3:]))
        R.check('%s 選「先不要」以後沒有入社（CLUB_%s 不是 true）' % (tag, aid), log['info']['CLUB'] is not True, J(log['info']))
        R.check('%s CLUB_LATE_%s＝%d（問過的那一週）' % (tag, aid, week), log['info']['CLUB_LATE'] == week, J(log['info']))
    R.check('%s 第 %d 週開頭沒有門口填表那句（%s）' % (tag, week, DOOR_SAY_BB[0] if bb else DOOR_LINE), not has_text(log, DOOR_SAY_BB[0] if bb else DOOR_LINE), '')
    R.check('%s 社課結束了（字幕「社課結束了。」）' % tag, any('社課結束了' in x['cap'] for x in log['caps']), J(log['caps'][-3:]))


async def case_club(pg, cdp, tag, aid, rain=False, flags=None, picks=('填',)):
    dd = await load_week(pg, cdp, tag, aid, 5, 'rain' if rain else 'clear', flags)
    if not dd: return None
    log = await play_session(pg, cdp, tag, aid, rain, list(picks))
    if not log: R.check('%s 跑完一場社課' % tag, False, ''); return None
    judge_join(tag, aid, log, picks[0], 5)
    return log


async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p)
        await pg.goto(URL); ok = await L.wait_loaded(pg)
        R.check('遊戲載入', ok, URL); await L.no_phone_auto(pg)
        R.note('TAG=%s CASES=%s；版本有 LATE_JOIN＝%s' % (TAG, CASES, await pg.evaluate("!!(typeof ACTIVITIES!=='undefined'&&ACTIVITIES.LATE_JOIN)")))
        for case in CASES:
            print('== %s' % case, flush=True); e0 = len(errs)
            try:
                if case == 'guitar':
                    lg = await case_club(pg, cdp, 'guitar', 'club_guitar')
                    if lg: R.check('guitar 沒有「我就說吧。」', not has_text(lg, TOLD), '')
                elif case == 'debate':
                    lg = await case_club(pg, cdp, 'debate', 'club_debate')
                    if lg: R.check('debate 沒有「我就說吧。」', not has_text(lg, TOLD), '')
                elif case in ('bball_sun', 'bball_rain'):
                    rain = case == 'bball_rain'
                    lg = await case_club(pg, cdp, case, 'dept_basketball', rain=rain)
                    if lg:
                        R.check('%s 參加的地點是 %s（ACTIVITIES.placeOf＝%s）' % (case, 'gym' if rain else 'campus', lg['info']['place']), lg['info']['place'] == ('gym' if rain else 'campus') and lg['end']['zone'] == ('gym' if rain else 'campus'), J(lg['info']))
                        if rain: R.check('%s 旁白是走廊那句「%s」' % (case, RAIN_NARR), has_text(lg, RAIN_NARR), '')
                        else: R.check('%s 晴天沒有走廊那句' % case, not has_text(lg, RAIN_NARR), '')
                        R.check('%s 沒有「我就說吧。」（沒設 AA613_BALL_GO）' % case, not has_text(lg, TOLD), '')
                elif case in ('zhe_yes', 'zhe_no'):
                    yes = case == 'zhe_yes'
                    fl = None
                    if yes:
                        d1 = await pg.evaluate(DAY_JS + '(%s)' % J({'aid': 'dept_basketball', 'w': 5}))
                        fl = {'AA613_BALL_GO': d1.get('day')}
                        R.setup('zhe_yes 旗標 AA613_BALL_GO＝%s（src/aa613_3d.js 2-3：第一次練球前一天 21:00 阿哲私訊 aa613_ball_zhe 選「好，我去看看。」設定，值＝第一次練球那天）' % d1.get('day'))
                    else:
                        R.setup('zhe_no 不設 AA613_BALL_GO（＝沒對阿哲說過「好，我去看看。」；GAME.defaults 的旗標沒有這個 key）')
                    lg = await case_club(pg, cdp, case, 'dept_basketball', flags=fl)
                    if lg:
                        R.note('%s 阿哲作息（結束時）：%s／%s、名字 %s' % (case, lg['info']['zheZone'], lg['info']['zheLabel'], lg['info']['zheName']))
                        if yes:
                            i_y = idx(lg, YES_BB); i_t = idx(lg, TOLD)
                            R.check('zhe_yes 選「填」以後接阿哲「我就說吧。」（說的人 %s）' % (lg['lines'][i_t]['name'] if i_t >= 0 else '—'), i_t >= 0 and i_t > i_y >= 0 and lg['lines'][i_t]['name'] != CAPTAIN, J(lg['lines'][i_t] if i_t >= 0 else lg['lines'][-4:]))
                            R.check('zhe_yes「我就說吧。」只出現一次', sum(1 for l in lg['lines'] if l['text'].strip() == TOLD) == 1, '')
                        else:
                            R.check('zhe_no 沒說過「好，我去看看」→ 不能出現「我就說吧。」', not has_text(lg, TOLD), J([l for l in lg['lines'] if TOLD in l['text']]))
                elif case == 'later':
                    aid = LATER_CLUB; bb = aid == 'dept_basketball'
                    dd = await load_week(pg, cdp, 'later_w5', aid, 5, 'clear')
                    lg5 = await play_session(pg, cdp, 'later_w5', aid, False, ['先不要']) if dd else None
                    if lg5: judge_join('later_w5', aid, lg5, '先不要', 5)
                    else: R.check('later_w5 跑完', False, '')
                    snap = json.loads(await pg.evaluate("JSON.stringify(GAME.snapshot())"))
                    dd = await load_week(pg, cdp, 'later_w6', aid, 6, 'clear', snap=snap)
                    lg6 = await play_session(pg, cdp, 'later_w6', aid, False, ['先不要']) if dd else None
                    if lg6: judge_join('later_w6', aid, lg6, '先不要', 6)
                    else: R.check('later_w6 跑完', False, '')
                    snap = json.loads(await pg.evaluate("JSON.stringify(GAME.snapshot())"))
                    dd = await load_week(pg, cdp, 'later_w7', aid, 7, 'clear', snap=snap)
                    if dd:
                        pre = await pg.evaluate(INFO_JS + '(%s)' % J(aid)); R.note('later_w7 參加前：%s' % J(pre))
                    lg7 = await play_session(pg, cdp, 'later_w7', aid, False, ['填']) if dd else None
                    if lg7:
                        R.check('later_w7 沒有入社單（第 7 週不再問）', not lg7['menus'], J(lg7['menus']))
                        if bb:
                            i1 = idx(lg7, DOOR_SAY_BB[0], '學長'); i2 = idx(lg7, DOOR_SAY_BB[1], '學長')
                            R.check('later_w7 開頭學長兩句「%s」「%s」' % tuple(DOOR_SAY_BB), 0 <= i1 < i2, J(lg7['lines'][:6]))
                        else:
                            i1 = idx(lg7, DOOR_LINE)
                            R.check('later_w7 開頭門口那句「%s」（旁白）' % DOOR_LINE, i1 >= 0 and not lg7['lines'][i1]['name'], J(lg7['lines'][:6]))
                            R.check('later_w7 門口那句在社課開始時（G.hour < t1）', i1 >= 0 and lg7['lines'][i1]['hour'] < CLUB[aid]['t1'] - 0.05, J(lg7['lines'][i1] if i1 >= 0 else None))
                        R.check('later_w7 一去就入社（CLUB_%s＝true）' % aid, lg7['info']['CLUB'] is True, J(lg7['info']))
                        R.check('later_w7 沒有「我就說吧。」', not has_text(lg7, TOLD), '')
                    else: R.check('later_w7 跑完', False, '')
                else:
                    R.note('不認得的 case：' + case)
            except Exception as ex:
                import traceback; traceback.print_exc(); R.check('%s 沒有探針例外' % case, False, repr(ex))
                try: await D.shot(pg, '%s_%s_exc' % (TAG, case), judge_black=False)
                except Exception: pass
            ne = errs[e0:]
            R.check('%s 沒有 JS 例外' % case, not ne, J(ne[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), ' | '.join(R.fails)), flush=True)
    return 1 if R.fails else 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
