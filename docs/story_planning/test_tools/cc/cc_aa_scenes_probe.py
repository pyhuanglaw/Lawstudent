"""CC-C 11-12：AA 重匯內容抽演（任務 #63；BB-C「重匯抽演照你選的場次寫，可以」）。結果給 BB 判字和演出，Playwright（PC GPU）≠ iPhone。
兩種（PARTS）：
  EV＝事件：EVS 每一場【前置／捷徑】讀檔到那一場 location 的第一個區域、time 的開頭（條件事件關掉；日子 DAY）→ 認識參與的人 →【捷徑】EVENTS.run(那一場)（不等觸發條件）→
      每一句記說話的人、字、表情、地點字幕、底（advBg 是不是深色底／3D）、當下 3D 裡有哪些人，截圖；演完記 events.done。
      預設：AA_839 ev_sis_w1、ev_sis_family_dinner、ev_grad_debate；AA_840 ev_sis_video、ev_sis_video_gf、ev_us_canyon。
      （「……你聽到了。」在 ev_sis_prof_xu_door，那一場已作廢（retired：BB_207／AA_261，W7 推甄取消），不演，結果裡寫明。）
  ARC＝女主角故事線（AA_712，src/arcs3d.js）：ARCS 每一個人【捷徑】她站到祐廷面前 → 取她的第 BEAT 拍（HEROINE_ARCS，ARCS.resolve）→ ARCS.run（遊戲聊天時演的同一支）→
      每一句、選單（選第 1 個）、她的回話記下來，截圖。預設 heroine_01、heroine_05、heroine_03 第 1 拍。
CC_02 清單 2026-11-12：1✓（日子照事件的 term／time 給的區間） 2✓（事件、拍子從遊戲資料讀：STORY_EVENTS、HEROINE_ARCS） 3✓（每一場重新讀檔） 4✓（選單選第 1 個、全部記） 5n/a（抽演：直接演，不走路觸發） 6✓（一句一句點） 7✓ 8n/a（不判，字給 BB） 9n/a（不藏人：要看誰在場） 10✓（條件事件關掉） 11✓ 12✓（每一場同樣欄位） 13✓（讀檔、直接演、她站好都是捷徑，標）
  GIFT＝節日送禮（AA_732～734，src/gifthol3d.js GIFTH）：GIFTS 每一組（誰@節日那天）【前置／捷徑】讀檔到 campus 那天 15:00、她站到祐廷前面、包包【捷徑】放兩樣（她 love 的一樣＋ok 的一樣）→
      照玩家走到她旁邊按互動 → 選「送她禮物…」→ 選 love 那一樣 → 一句一句記（open 句、item 句、herGive 回禮）→ 截圖。預設學姊、以安聖誕、語彤情人節。
用法：LW_TESTS=<wt>/tests SHA=<sha> [PARTS=EV,ARC,GIFT] [GIFTS=heroine_05@2025-12-24+…] [EVS=ev_a,ev_b] [EVDAY=ev_a@2028-10-05@19+…] [ARCS=heroine_01,heroine_05] [BEAT=1] python3 cc_aa_scenes_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]
PARTS = set((os.environ.get('PARTS') or 'EV,ARC,GIFT').split(','))
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
        zone = next((z for z in info['loc'] if z), 'campus')
        s = await D.load_zone(pg, cdp, zone, day, float(h), wait=6000)
        await pg.evaluate("(a=>{ const G=GAME.G; G.flags=G.flags||{}; for(const id of a.P){ G.flags['met_'+id]=true; if(!G.contacts) G.contacts={}; if(G.contacts[id]==null) G.contacts[id]=2; if(a.gf) G.flags['dating_'+id]=true; } })", {'P': info['participants'], 'gf': ev.endswith('_gf')})   # _gf 那一場＝交往中的版本
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
        b = await pg.evaluate("(a=>{ const T=HEROINE_ARCS.people[a.who]; if(!T) return null; const b=T.beats.find(x=>x.n===a.n); if(!b) return null; const G=GAME.G; G.flags['met_'+a.who]=true; if(!G.contacts) G.contacts={}; if(G.contacts[a.who]==null) G.contacts[a.who]=2;\
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


GIFT_PREP = r"""(a=>{ const G=GAME.G, X=GIFT_HOLIDAY; G.flags=G.flags||{}; G.flags['met_'+a.who]=true; if(!G.contacts) G.contacts={}; if(G.contacts[a.who]==null) G.contacts[a.who]=2;
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
        if 'GIFT' in PARTS:
            try: await part_gift(pg, cdp, res)
            except Exception as e: R.check('[GIFT] 沒有探針例外', False, str(e)[:200])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'aa_scenes.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
