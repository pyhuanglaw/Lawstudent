"""CC-C 11-12：AA 重匯內容抽演（任務 #63；BB-C「重匯抽演照你選的場次寫，可以」）。結果給 BB 判字和演出，Playwright（PC GPU）≠ iPhone。
兩種（PARTS）：
  EV＝事件：EVS 每一場【前置／捷徑】讀檔到那一場 location 的第一個區域、time 的開頭（條件事件關掉；日子 DAY）→ 認識參與的人 →【捷徑】EVENTS.run(那一場)（不等觸發條件）→
      每一句記說話的人、字、表情、地點字幕、底（advBg 是不是深色底／3D）、當下 3D 裡有哪些人，截圖；演完記 events.done。
      預設：AA_839 ev_sis_w1、ev_sis_family_dinner、ev_grad_debate；AA_840 ev_sis_video、ev_sis_video_gf、ev_us_canyon。
      （「……你聽到了。」在 ev_sis_prof_xu_door，那一場已作廢（retired：BB_207／AA_261，W7 推甄取消），不演，結果裡寫明。）
  ARC＝女主角故事線（AA_712，src/arcs3d.js）：ARCS 每一個人【捷徑】她站到祐廷面前 → 取她的第 BEAT 拍（HEROINE_ARCS，ARCS.resolve）→ ARCS.run（遊戲聊天時演的同一支）→
      每一句、選單（選第 1 個）、她的回話記下來，截圖。預設 heroine_01、heroine_05、heroine_03 第 1 拍。
CC-B 11-14：出發鍵認「現在出發…」。
CC_02 清單 2026-11-12：1✓（日子照事件的 term／time 給的區間） 2✓（事件、拍子從遊戲資料讀：STORY_EVENTS、HEROINE_ARCS） 3✓（每一場重新讀檔） 4✓（選單選第 1 個、全部記） 5n/a（抽演：直接演，不走路觸發） 6✓（一句一句點） 7✓ 8n/a（不判，字給 BB） 9n/a（不藏人：要看誰在場） 10✓（條件事件關掉） 11✓ 12✓（每一場同樣欄位） 13✓（讀檔、直接演、她站好都是捷徑，標）
  GIFT＝節日送禮（AA_732～734，src/gifthol3d.js GIFTH）：GIFTS 每一組（誰@節日那天）【前置／捷徑】讀檔到 campus 那天 15:00、她站到祐廷前面、包包【捷徑】放兩樣（她 love 的一樣＋ok 的一樣）→
      照玩家走到她旁邊按互動 → 選「送她禮物…」→ 選 love 那一樣 → 一句一句記（open 句、item 句、herGive 回禮）→ 截圖。預設學姊、以安聖誕、語彤情人節。
  DATE＝學姊約會（AA_837／838，src/date3d.js）：DATES 每一個地點【前置／捷徑】讀檔到宿舍 DATE_DAY（週六）08:00、和學姊熟（met、關係高）→【捷徑】DATE.book（約會選單選完以後呼叫的同一支）排那一天 →
      照玩家：時間到等「出發」（DATE.prompt）按下去 → 約會場景一句一句點（每個互動點的選項選第 1 個）→ 記每句、底圖、地點字幕、錢前後、回到哪。預設 D01、D02、D04。
  SUPPER＝203 泡麵宵夜（AA_851，src/tz_invite_supper3d.js）：【前置／捷徑】讀檔到宿舍 SUPPER_DAY 21:45、物品放一袋東南大聯泡麵 → 先記遊戲自己的條件 TZIS.due（泡麵、21 點後、203、室友都在）成不成立 →【捷徑】EVENTS.run 那一場 → 每句截圖 → 泡麵有沒有用掉一袋。
用法：LW_TESTS=<wt>/tests SHA=<sha> [PARTS=EV,ARC,GIFT,DATE,SUPPER] [DATES=D01,D02,D04] [DATE_WHO=heroine_05] [DATE_DAY=2025-10-18] [GIFTS=heroine_05@2025-12-24+…] [EVS=ev_a,ev_b] [EVDAY=ev_a@2028-10-05@19+…] [ARCS=heroine_01,heroine_05] [BEAT=1] python3 cc_aa_scenes_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]
PARTS = set((os.environ.get('PARTS') or 'EV,ARC,GIFT').split(','))
SUPPER_DAY = os.environ.get('SUPPER_DAY') or '2025-10-15'   # 週三晚上（室友照作息在房間）
SUPPER_H = float(os.environ.get('SUPPER_H') or 22.75)   # 11-12 r2：週三阿哲 22:00、柏翰 22:30 回來、23:30 上床（story3d.js r203Plan）→ 22:45 三個人都在
DATES = [x for x in (os.environ.get('DATES') or 'D01,D02,D04').split(',') if x]; DATE_WHO = os.environ.get('DATE_WHO') or 'heroine_05'; DATE_DAY = os.environ.get('DATE_DAY') or '2025-10-18'
GIFTS = [x.split('@') for x in (os.environ.get('GIFTS') or 'heroine_05@2025-12-24+heroine_01@2025-12-24+heroine_03@2026-02-14').split('+') if '@' in x]   # 誰@哪一天（節日）
EVS = [x for x in (os.environ.get('EVS') or 'ev_sis_w1,ev_sis_family_dinner,ev_grad_debate,ev_sis_video,ev_sis_video_gf,ev_us_canyon').split(',') if x]
EVDAY = {}
for seg in (os.environ.get('EVDAY') or '').split('+'):
    if seg.count('@') == 2: e, d, h = seg.split('@'); EVDAY[e] = (d, float(h))
ARCS = [x for x in (os.environ.get('ARCS') or 'heroine_01,heroine_05,heroine_03').split(',') if x]
BEAT = int(os.environ.get('BEAT') or 1)
R = L.Run('aa_scenes', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
EVINFO = r"""(id=>{ const e=(typeof STORY_EVENTS!=='undefined'?STORY_EVENTS:[]).find(x=>x&&x.id===id); if(!e) return null; const loc=Array.isArray(e.location)?e.location:(e.location?[e.location]:[]);
  let day=null; try{ if(e.date) day=CALENDAR.dateOf(STORY.dayOfKey(e.date)).key; else if(e.term&&e.term.length){ const R=CALENDAR.termDays(e.term[0]); if(R) day=CALENDAR.dateOf(R.from+7*Math.max(0,((e.weeks&&e.weeks[0])||1)-1)).key; } else if(e.from) day=String(e.from).slice(0,10); }catch(x){}
  return {id, title:e.title||'', retired:e.retired||null, loc, time:e.time||null, day, participants:e.participants||[], trigger:e.trigger||null, background:e.background||null, n:(e.dialogue||[]).length}; })"""
STEP = r"""(()=>{ const d=document.getElementById('dlg'); const bg=document.getElementById('advBg'); const cs=bg?getComputedStyle(bg):null;
  return {dlg:!!(d&&d.offsetParent), t:(document.getElementById('dlgText')||{}).textContent||'', who:(document.getElementById('dlgName')||{}).textContent||'',
    choices:[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()), running:typeof EVENTS!=='undefined'&&!!EVENTS.running,
    cap:(document.getElementById('caption')||document.getElementById('sceneCap')||{}).textContent||'', bg:cs?{op:cs.opacity, img:cs.backgroundImage.slice(0,80), color:cs.backgroundColor}:null,
    people:(GAME.E.npcs||[]).filter(n=>n&&n.obj&&n.obj.visible!==false&&n.charId).map(n=>n.charId).slice(0,10), zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2)}; })()"""


async def drive(pg, cdp, tag, prefix, done_js):
    lines = []; menus = []
    for j in range(300):
        st = await pg.evaluate(STEP)
        if st['choices']:
            menus.append(st['choices']); lines.append({'k': '▶', 'pick': st['choices'][0], 'menu': st['choices']})
            await pg.screenshot(path=os.path.join(OUT, '%s_menu_%02d.png' % (prefix, len(menus))))
            await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); if(b[0]) b[0].click(); })()"); await pg.wait_for_timeout(900); continue
        if st['dlg']:
            if not lines or lines[-1].get('t') != st['t'] or lines[-1].get('who') != st['who']:
                lines.append({'who': st['who'], 't': st['t'], 'cap': st['cap'], 'bg': st['bg'], 'people': st['people'], 'zone': st['zone'], 'h': st['h']})
                await pg.screenshot(path=os.path.join(OUT, '%s_%02d.png' % (prefix, len(lines))))
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(550); continue
        if await pg.evaluate(done_js): break
        await pg.wait_for_timeout(500)
    R.note('%s 共 %d 句、%d 個選單：%s' % (tag, len([x for x in lines if 'who' in x]), len(menus), J([(x.get('who', '▶') + '｜' + (x.get('t') or x.get('pick') or '')) for x in lines])))
    R.note('%s 每句的底／地點字幕／在場的人：%s' % (tag, J([{k: x.get(k) for k in ('cap', 'bg', 'people', 'zone')} for x in lines if 'who' in x][:6])))
    return lines


async def part_ev(pg, cdp, res):
    R.note('「……你聽到了。」在 ev_sis_prof_xu_door：已作廢（retired：BB_207 第 1 節＋AA_261 第 1 節，W7 推甄取消），照規則不演')
    for ev in EVS:
        tag = '[EV %s]' % ev
        await pg.goto(URL); await L.wait_loaded(pg)
        info = await pg.evaluate(EVINFO, ev)
        if not R.check('%s 遊戲裡有這一場' % tag, bool(info), ''): continue
        if info.get('retired'): R.note('%s 已作廢：%s——不演' % (tag, info['retired'])); continue
        day, h = EVDAY.get(ev, (info.get('day') or '2026-10-14', (info.get('time') or [19])[0]))
        zone = next((z for z in info['loc'] if z and z != 'any'), 'dorm')   # 11-14 BB-C（BB_379 027fc1a3b4 TEST_BUG）：location 'any'＝哪裡都可以演，不是區域 id——用宿舍
        s = await D.load_zone(pg, cdp, zone, day, float(h), wait=6000)
        await pg.evaluate("(a=>{ const G=GAME.G; G.flags=G.flags||{}; for(const id of a.P){ G.flags['met_'+id]=true; try{ SOCIAL.meet(id,G.zone); }catch(e){}  if(!G.contacts) G.contacts={}; if(G.contacts[id]==null) G.contacts[id]=2; if(a.gf) G.flags['dating_'+id]=true; } })", {'P': info['participants'], 'gf': ev.endswith('_gf')})   # _gf 那一場＝交往中的版本
        R.setup('%s 【前置／捷徑】讀檔到 %s %s %.2f（location 第一個、條件事件關掉）、認識參與的人 → 【捷徑】EVENTS.run（不等觸發條件）：%s' % (tag, zone, day, float(h), J({k: info[k] for k in ('title', 'trigger', 'background', 'participants', 'n')})))
        await pg.evaluate("(id=>{ const e=STORY_EVENTS.find(x=>x.id===id); window.__evDone=false; EVENTS.run(e).then(()=>{ window.__evDone=true; }).catch(x=>{ window.__evDone='ERR '+String(x).slice(0,100); }); })", ev)
        await pg.wait_for_timeout(1200)
        lines = await drive(pg, cdp, tag, 'ev_%s' % ev, "window.__evDone!==false&&!(typeof EVENTS!=='undefined'&&EVENTS.running)")
        done = await pg.evaluate("(id=>({done:(GAME.G.events&&GAME.G.events.done||{})[id]|0, r:window.__evDone, zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2)}))", ev)
        R.note('%s 演完：%s' % (tag, J(done)))
        R.check('%s 演得完（有台詞、記成演過）' % tag, len(lines) > 0 and done['done'] >= 1, J(done))
        res.setdefault('ev', {})[ev] = {'info': info, 'lines': lines, 'done': done, 'zone': zone, 'day': day}


async def part_arc(pg, cdp, res):
    for who in ARCS:
        tag = '[ARC %s 第 %d 拍]' % (who, BEAT)
        await pg.goto(URL); await L.wait_loaded(pg)
        await D.load_zone(pg, cdp, 'campus', '2025-10-14', 15.0, wait=6000)
        b = await pg.evaluate("(a=>{ const T=HEROINE_ARCS.people[a.who]; if(!T) return null; const b=T.beats.find(x=>x.n===a.n); if(!b) return null; const G=GAME.G; G.flags['met_'+a.who]=true; try{ SOCIAL.meet(a.who,G.zone); }catch(e){}  if(!G.contacts) G.contacts={}; if(G.contacts[a.who]==null) G.contacts[a.who]=2;\
            const P=GAME.E.player.obj, yaw=P.rotation.y; if(GAME.npc&&GAME.npc[a.who]&&GAME.removeNPC) GAME.removeNPC(a.who); const n=GAME.spawnCharacter(a.who,P.position.x+Math.sin(yaw)*1.4,P.position.z+Math.cos(yaw)*1.4,{yaw:yaw+Math.PI,pose:'idle'}); if(n) n.frozen=true;\
            const r=ARCS.resolve(G,a.who,b); window.__arcDone=false; ARCS.run(GAME,{name:(CHARACTERS[a.who]||{}).name,obj:n&&n.obj,charId:a.who},a.who,r).then(()=>{ window.__arcDone=true; }).catch(x=>{ window.__arcDone='ERR '+String(x).slice(0,100); });\
            return {n:b.n, need:b.need, topic:b.topic||null, lines:b.lines, ask:b.ask, opts:(b.opts||[]).map(o=>o.t), spawned:!!n}; })", {'who': who, 'n': BEAT})
        R.setup('%s 【前置／捷徑】讀檔到 campus 2025-10-14 15:00、她站到祐廷前面 1.4 m → 【捷徑】ARCS.run（聊天時演的同一支）；稿：%s' % (tag, J(b)))
        if not R.check('%s 資料裡有這一拍' % tag, bool(b), ''): continue
        await pg.wait_for_timeout(1000)
        lines = await drive(pg, cdp, tag, 'arc_%s_%d' % (who, BEAT), "window.__arcDone!==false")
        r = await pg.evaluate("window.__arcDone")
        R.check('%s 演得完' % tag, r is True and len(lines) > 0, J(r))
        res.setdefault('arc', {})[who] = {'beat': b, 'lines': lines, 'r': r}


GIFT_PREP = r"""(a=>{ const G=GAME.G, X=GIFT_HOLIDAY; G.flags=G.flags||{}; G.flags['met_'+a.who]=true; if(a.who==='heroine_03') G.flags.YT_MET_JOB=true;   /* CC-B 11-14：語彤要在一盞認識（YT_MET_JOB）才算見過，不然 SOCIAL.stage 一直 STRANGER、GIFTH.canGet false（AA_SCENES_GIFT_r2 TEST_BUG）*/ try{ SOCIAL.meet(a.who,G.zone); }catch(e){}  if(!G.contacts) G.contacts={}; if(G.contacts[a.who]==null) G.contacts[a.who]=2;
  const ids=Object.keys(X.items); const love=ids.find(g=>(X.items[g].love||[]).includes(a.who)&&!X.items[g].made&&!(X.items[g].only&&!X.items[g].only.includes(a.who)));
  const ok=ids.find(g=>!(X.items[g].love||[]).includes(a.who)&&!(X.items[g].no||[]).includes(a.who)&&!X.items[g].made&&!X.items[g].only);
  try{ GIFTH.bag(G); }catch(e){}   /* 先讀一次，讓遊戲把 G.flags.GIFTH 建好（gifthol3d.js 的 F(G)）*/
  const raw=G.flags.GIFTH&&Array.isArray(G.flags.GIFTH.bag)?G.flags.GIFTH:null;
  if(raw){ raw.bag.push({id:love,shop:X.items[love].shop||'x'}); if(ok) raw.bag.push({id:ok,shop:X.items[ok].shop||'x'}); }
  const P=GAME.E.player.obj, yaw=P.rotation.y; if(GAME.npc&&GAME.npc[a.who]&&GAME.removeNPC) GAME.removeNPC(a.who); const n=GAME.spawnCharacter(a.who,P.position.x+Math.sin(yaw)*1.4,P.position.z+Math.cos(yaw)*1.4,{yaw:yaw+Math.PI,pose:'idle'}); if(n) n.frozen=true;
  return {love, loveName:love&&X.items[love].name, ok, okName:ok&&X.items[ok].name, bagFound:!!raw, state:GIFTH.state(G,a.who), hol:GIFTH.holOf(a.who,G.day), npc:n?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2)]:null}; })"""


async def part_gift(pg, cdp, res):
    for who, day in GIFTS:
        tag = '[GIFT %s %s]' % (who, day)
        await pg.goto(URL); await L.wait_loaded(pg)
        await D.load_zone(pg, cdp, 'campus', day, 15.0, wait=6000)
        await pg.evaluate("(()=>{ try{ GIFTH.bag(GAME.G); }catch(e){} })()")
        g = await pg.evaluate(GIFT_PREP, {'who': who})
        if who == 'heroine_03': R.setup('%s 【前置／捷徑】flags.YT_MET_JOB＝true（語彤在一盞認識才算見過）' % tag)
        R.setup('%s 【前置／捷徑】讀檔到 campus %s 15:00、她站到前面、包包放她 love 的「%s」＋ok 的「%s」：%s' % (tag, day, g.get('loveName'), g.get('okName'), J(g)))
        if not R.check('%s 今天是她的節日、包包有東西（GIFTH.state）' % tag, bool(g.get('state')) and bool((g.get('state') or {}).get('items')), J(g)): continue
        await L.go_to(pg, cdp, R, g['npc'][0], g['npc'][1], 1.1, who, max_s=30)
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
        lines = []; picked = []
        for j in range(120):
            st = await pg.evaluate(STEP)
            if st['choices']:
                i = next((n for n, t in enumerate(st['choices']) if t.startswith('送她禮物')), None)
                if i is None: i = next((n for n, t in enumerate(st['choices']) if g.get('loveName') and g['loveName'] in t), None)
                if i is None: i = next((n for n, t in enumerate(st['choices']) if any(w in t for w in ('算了', '再見', '沒事'))), 0) if picked else 0
                picked.append([st['choices'], st['choices'][i]]); await pg.screenshot(path=os.path.join(OUT, 'gift_%s_menu_%02d.png' % (who, len(picked))))
                await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % i); await pg.wait_for_timeout(900); continue
            if st['dlg']:
                if not lines or lines[-1]['t'] != st['t']:
                    lines.append({'who': st['who'], 't': st['t']}); await pg.screenshot(path=os.path.join(OUT, 'gift_%s_%02d.png' % (who, len(lines))))
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(550); continue
            if j > 4 and not await pg.evaluate("!!(GAME.E.player&&GAME.E.player.busy)"): break
            await pg.wait_for_timeout(500)
        after = await pg.evaluate("(w=>({state:GIFTH.state(GAME.G,w)}))", who)
        R.note('%s 選單一路 %s' % (tag, J(picked)))
        R.note('%s 句子：%s' % (tag, J([x['who'] + '｜' + x['t'] for x in lines])))
        R.note('%s 送完 GIFTH.state %s（null＝這個節日送過了）' % (tag, J(after)))
        R.check('%s 送得出去（有她的反應）' % tag, len(lines) >= 2, '')
        res.setdefault('gift', {})[who + '@' + day] = {'prep': g, 'picked': picked, 'lines': lines, 'after': after}


DATE_PREP = r"""(a=>{ const G=GAME.G; G.flags=G.flags||{}; G.flags['met_'+a.who]=true; try{ SOCIAL.meet(a.who,G.zone); }catch(e){}  if(!G.contacts) G.contacts={}; if(G.contacts[a.who]==null) G.contacts[a.who]=2;
  try{ if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(a.who,{fam:60,trust:50,comf:50,aff:30}); }catch(e){}
  const r=DATE.book(G,{who:a.who,locs:[a.loc],day:G.day,depart:+(a.depart||10),by:'player'});   /* CC-B 11-14（AA_SCENES_DATE_r2 TEST_BUG）：6106fae2d2 的 DATE.book 要 depart（遊戲的選單一定會給），沒給＝depart null、OUT.h NaN、永遠不跳出發 */ const q=(G.outings||[]).find(x=>x&&x.dateTrip===r.trip)||null;
  return {book:r.ok?{trip:r.trip, depart:r.depart, back:r.back, kind:r.kind, transport:r.transport, fare:r.fare}:r, out:q?{id:q.id, h:q.h, travelH:q.travelH, title:q.title}:null, money:G.money|0}; })"""


async def part_date(pg, cdp, res):
    for loc in DATES:
        tag = '[DATE %s %s]' % (DATE_WHO, loc)
        await pg.goto(URL); await L.wait_loaded(pg)
        await D.load_zone(pg, cdp, 'dorm', DATE_DAY, 8.0, wait=5000)
        b = await pg.evaluate(DATE_PREP, {'who': DATE_WHO, 'loc': loc})
        R.setup('%s 【前置／捷徑】讀檔到宿舍 %s 08:00、和她熟 →【捷徑】DATE.book（10:00 出發）：%s' % (tag, DATE_DAY, J(b)))
        if not R.check('%s 排得進約會（DATE.book ok）' % tag, bool(b.get('out')), J(b)): continue
        h0 = b['out']['h'] - (b['out']['travelH'] or 0) - 0.2
        await pg.evaluate("(h=>{ GAME.G.hour=h; })", h0); await pg.wait_for_timeout(500)
        R.setup('%s 【捷徑】時間撥到 %.2f（出發前 12 分鐘）' % (tag, h0))
        lines = []; picked = []; got = False; t0 = time.time()
        while time.time() - t0 < 400:
            st = await pg.evaluate(STEP)
            if st['choices']:
                i = next((n for n, t in enumerate(st['choices']) if t.startswith('出發') or t.startswith('現在出發')), None)   # CC-B 11-14（AA_SCENES_DATE_r3）：main 的按鈕是「現在出發〈地點〉　捷運 約 25 分鐘」
                if i is not None: got = True
                else: i = 0
                picked.append([st['choices'], st['choices'][i]]); await pg.screenshot(path=os.path.join(OUT, 'date_%s_menu_%02d.png' % (loc, len(picked))))
                await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % i); await pg.wait_for_timeout(900); continue
            hot = await pg.evaluate("(()=>{ const H=[...document.querySelectorAll('.dlHot')].filter(b=>b.offsetParent!==null&&!b.disabled), E=[...document.querySelectorAll('.dlEnd')].filter(b=>b.offsetParent!==null); return {h:H.map(b=>String(b.getAttribute('aria-label')||'').split('　')[0]), e:E.map(b=>(b.textContent||'').trim())}; })()")
            if not st['choices'] and not st['dlg'] and (hot['h'] or hot['e']):   # CC-B 11-14：約會互動點是 2D 熱點圖層（DATELAYER）——點兩個熱點，再點「就這樣回去／差不多了」
                nhot = sum(1 for p_ in picked if p_[0] == 'DL')
                if hot['h'] and nhot < 2:
                    picked.append(['DL', hot['h'][0]]); await pg.screenshot(path=os.path.join(OUT, 'date_%s_layer_%02d.png' % (loc, nhot + 1)))
                    c_ = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('.dlHot')].filter(b=>b.offsetParent!==null&&!b.disabled)[0]; const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
                else:
                    picked.append(['DL', (hot['e'] or ['?'])[0]])
                    c_ = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('.dlEnd')].filter(b=>b.offsetParent!==null)[0]; if(!b) return null; const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
                if c_: await L.touch_tap(cdp, c_[0], c_[1])
                await pg.wait_for_timeout(1200); continue
            if st['dlg']:
                if not lines or lines[-1]['t'] != st['t']:
                    lines.append({'who': st['who'], 't': st['t'], 'cap': st['cap'], 'bg': st['bg']}); await pg.screenshot(path=os.path.join(OUT, 'date_%s_%02d.png' % (loc, len(lines))))
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(550); continue
            if got and lines and time.time() - t0 > 20:
                await pg.wait_for_timeout(2000); st2 = await pg.evaluate(STEP)
                if not st2['dlg'] and not st2['choices']: break
            await pg.wait_for_timeout(600)
        af = await pg.evaluate("(()=>({zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2), money:GAME.G.money|0, trips:(GAME.G.trips||[]).slice(-1).map(t=>({status:t.status, spots:t.spots}))}))()")
        R.note('%s 選單一路 %s' % (tag, J([p_[1] for p_ in picked])))
        R.note('%s 句子（說話的人｜字｜字幕｜底）：%s' % (tag, J([(x['who'], x['t'], x['cap'], (x['bg'] or {}).get('img')) for x in lines])))
        R.note('%s 演完：%s（出發前錢 %s）' % (tag, J(af), b.get('money')))
        R.check('%s 時間到跳「出發」、約會演得完' % tag, got and len(lines) > 2, J([got, len(lines)]))
        res.setdefault('date', {})[loc] = {'book': b, 'picked': picked, 'lines': lines, 'after': af}


SUPPER_PREP = r"""(a=>{ const G=GAME.G; G.flags=G.flags||{}; const O=G.flags.GG3_OWN=G.flags.GG3_OWN||{}; const d=TZ_INVITE_SUPPER.supper; (O[d.shop]=O[d.shop]||{})[d.item]=a.packs;
  const due=TZIS.due(G,GAME,a.term), ev=STORY_EVENTS.find(e=>e.id===TZIS.evId(a.term)); let allIn=null; try{ allIn=DORM203.allIn(G,TZIS.MATES,G.day,G.hour); }catch(e){ allIn=String(e).slice(0,60); }
  return {due, allIn, packs:TZIS.packs(G), era:DORM203.era?DORM203.era(G):null, ev:!!ev, mates:TZIS.MATES.map(id=>!!(GAME.npc&&GAME.npc[id]))}; })"""


async def part_supper(pg, cdp, res):
    for term, day in (('Y1S1', SUPPER_DAY),):
        tag = '[SUPPER %s %s]' % (term, day)
        await pg.goto(URL); await L.wait_loaded(pg)
        fl = await pg.evaluate("(()=>Object.assign({}, GAME.defaults('祐廷').flags||{}, {DORM_FOUR:true}))()")   # 四人房（DORM_FOUR）：203 室友作息只在這個旗標下（story3d.js r203On）；load_state 會整個蓋掉 flags，所以先拿預設的再加
        sh = SUPPER_H
        if day == 'auto':   # 11-14 BB-C（BB_379 DORM203_NOODLE TEST_BUG）：10/15 22:45 柏翰不在——照遊戲自己的 DORM203.allIn(G,TZIS.MATES,day,hour) 掃 Y1S1 第 2～15 週、21:00～23:45 每 15 分鐘，找三個室友都在的第一格
            await L.load_state(pg, {'zone': 'dorm', 'hour': 22.0, 'day': await pg.evaluate("(k=>STORY.dayOfKey(k))", '2025-09-10'), 'weather': 'clear', 'flags': fl}, quiet_events=True); await pg.wait_for_timeout(4000)
            sc = await pg.evaluate("""(()=>{ const G=GAME.G, R=CALENDAR.termDays('Y1S1'), M=(TZIS&&TZIS.MATES)||['zhe','classmate_bohan','kai']; G.flags.DORM_FOUR=true; const keep={day:G.day,hour:G.hour,weekday:G.weekday};
              try{ for(let d=R.from+7; d<(R.to||R.from+110); d++){ const wd=CALENDAR.dateOf(d).wd%7; for(let h=21; h<23.99; h+=0.25){ G.day=d; G.hour=h; G.weekday=wd; let ok=false; try{ ok=DORM203.allIn(G,M,d,h); }catch(e){} if(ok) return {key:CALENDAR.dateOf(d).key, h, mates:M}; } } return null; } finally { Object.assign(G,keep); } })()""")
            R.note('%s 掃三個室友都在 203 的時段（DORM203.allIn）：%s' % (tag, J(sc)))
            if not R.check('FAIL_SETUP 檢查：%s Y1S1 找得到三個室友都在 203、21～24 點的時段' % tag, bool(sc), ''): return
            day = sc['key']; sh = sc['h'] + 0.1; tag = '[SUPPER %s %s]' % (term, day)
        dd = await pg.evaluate("(k=>STORY.dayOfKey(k))", day)
        await L.load_state(pg, {'zone': 'dorm', 'hour': sh, 'day': dd, 'weather': 'clear', 'flags': fl}, quiet_events=True)
        await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp)
        pr = await pg.evaluate(SUPPER_PREP, {'term': term, 'packs': 1})
        R.setup('%s 【前置／捷徑】讀檔到宿舍 203 %s %.2f、四人房 DORM_FOUR、物品放一袋東南大聯泡麵（五包裝）：遊戲自己的條件 TZIS.due=%s（室友都在 %s、學期內 %s、室友在場景 %s）' % (tag, day, sh, pr['due'], pr['allIn'], pr['era'], pr['mates']))
        R.check('%s 條件成立（TZIS.due：泡麵、21 點後、203、室友都在）' % tag, pr['due'] is True, J(pr))
        await pg.evaluate("(t=>{ window.__evDone=false; EVENTS.run(STORY_EVENTS.find(e=>e.id===TZIS.evId(t))).then(()=>{ window.__evDone=true; }).catch(x=>{ window.__evDone='ERR '+String(x).slice(0,100); }); })", term)
        R.setup('%s 【捷徑】EVENTS.run 那一場（不等自動觸發）' % tag)
        await pg.wait_for_timeout(1200)
        lines = await drive(pg, cdp, tag, 'supper_%s' % term, "window.__evDone!==false&&!(typeof EVENTS!=='undefined'&&EVENTS.running)")
        af = await pg.evaluate("(()=>({packs:TZIS.packs(GAME.G), r:window.__evDone}))()")
        R.note('%s 演完：泡麵剩 %s（應該從 1 變 0）；%s' % (tag, af['packs'], J(af)))
        R.check('%s 演得完、泡麵用掉一袋' % tag, len(lines) > 0 and af['packs'] == 0, J(af))
        res.setdefault('supper', {})[term] = {'prep': pr, 'lines': lines, 'after': af}


async def main():
    print('CC AA 重匯抽演：SHA %s；PARTS %s；EVS %s；ARCS %s 第 %d 拍' % (SHA or '?', sorted(PARTS), EVS, ARCS, BEAT), flush=True)
    res = {'sha': SHA}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        if 'EV' in PARTS:
            try: await part_ev(pg, cdp, res)
            except Exception as e: R.check('[EV] 沒有探針例外', False, str(e)[:200])
        if 'ARC' in PARTS:
            try: await part_arc(pg, cdp, res)
            except Exception as e: R.check('[ARC] 沒有探針例外', False, str(e)[:200])
        if 'SUPPER' in PARTS:
            try: await part_supper(pg, cdp, res)
            except Exception as e: R.check('[SUPPER] 沒有探針例外', False, str(e)[:200])
        if 'DATE' in PARTS:
            try: await part_date(pg, cdp, res)
            except Exception as e: R.check('[DATE] 沒有探針例外', False, str(e)[:200])
        if 'GIFT' in PARTS:
            try: await part_gift(pg, cdp, res)
            except Exception as e: R.check('[GIFT] 沒有探針例外', False, str(e)[:200])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'aa_scenes.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
