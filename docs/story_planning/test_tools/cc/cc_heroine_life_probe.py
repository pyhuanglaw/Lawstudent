"""CC-C 11-12：HEROINE-LIFE-1028「女主角有自己的生活」實玩驗收（BB-C 05:54；AA_806 626416d2e 對過稿；USER_WANTS X122★）。判定歸 BB，這支只抄字、截圖、數數。
期望（照程式本身 src/feed3d.js、src/hcircle3d.js 檔頭的規格，不是 CC 自己訂的）：
  動態＝有聯絡方式的人貼自己的事，時間到了才出、保留七天、女主角每人連續七天最多兩則；私訊（dms）＝她講自己的事；圈子＝她照作息和自己的朋友同框，走到 5 m 內聽到那一列的句子。
PARTS：
  FEED   三個學期（TERMS，預設 Y1S1、Y2S2、Y4S1）：【前置／捷徑】讀使用者存檔（法律系），七位（DATE.HEROINES：五女主＋沛珊＋可昕）給聯絡方式、熟悉 70／信任 55／自在 50（很熟），
         FEED 從那學期第 1 週開始算，一天一天把遊戲日子往前推到第 WEEK 週（每天 23:00 叫 FEED.tick＝照遊戲自己「睡過、跳時間照原本時間補」的做法）＝【捷徑：跳日子】；
         記每一位這學期出了幾則動態、抄每一則（照片＋一句）；到第 WEEK 週那天打開手機「動態」頁截圖、抄畫面上的字；「訊息」頁也截一張。
  ANW    以安大一上第 4、10、15 週那天各看一次動態裡她的（同上，跑大一上時順便記）：前後是不是不同的則。
  DM     同 FEED 跑的學期：她主動傳的私訊（FEED 的 dms，時間到了用 PHONE.at 傳）每一則抄她的句子，記是誰、哪一天。
  CIRCLE 以安、語彤、學姊各一次：在大一上第 3～14 週的平日 08:00～21:30 每半小時問 HCIRCLE.rowsIn，找第一個「她和同伴同框（不是一個人、不是地點旁白）」的時間地點
         → 讀檔過去 → 她在不在、同伴在不在她 3.2 m 內 → 照玩家走到她 4 m 內 → 抄字幕（那一列的句子）→ 截圖。
CC_02 清單 2026-11-12：1✓（動態出現條件照 FEED：聯絡方式、熟悉／信任／自在階段、時間到；圈子照 HCIRCLE.rowsIn） 2✓（女主角名單、學期週次、圈子的列全從遊戲讀；找不到列出原因） 3✓（圈子照時間順序找第一個成立的列） 4✓（手機頁籤照 data-ptab 點、點前確認手機開了） 5✓（走到她旁邊用站得住的點、go_to 分段） 6✓（進區域等 6 秒人生出來、字幕等 15 秒） 7✓ 8n/a（不判台詞好壞；期望出處＝feed3d.js／hcircle3d.js 檔頭） 9✓（截圖不藏玩家：要看她和同伴） 10✓（條件事件關掉、不走劇情選單） 11✓ 12✓（記真的翻到的日子、真的打開的頁籤、人的距離） 13✓（每一步記是捷徑還是照玩家）
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=<名字> [PARTS=FEED,ANW,DM,CIRCLE TERMS=Y1S1,Y2S2,Y4S1 WEEK=10] python3 cc_heroine_life_probe.py <url> <out>"""
import os, sys, json, asyncio, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'; SHA = os.environ.get('SHA') or ''
FIX = os.environ.get('FIX') or 'tests/fixtures/user_save_day51_1110.json'
PARTS = (os.environ.get('PARTS') or 'FEED,ANW,DM,CIRCLE').split(',')
TERMS = (os.environ.get('TERMS') or 'Y1S1,Y2S2,Y4S1').split(',')
WEEK = int(os.environ.get('WEEK') or '10')
R = L.Run('heroine_life_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)

DAYOF = r"""((a)=>{ for(let d=0; d<2600; d++){ const T=CALENDAR.termOf(d); if(T&&T.id===a.term&&T.week===a.week&&CALENDAR.dateOf(d).wd===(a.wd||3)) return {day:d, key:CALENDAR.dateOf(d).key}; } return null; })"""
APPLY = r"""(async(s)=>{ document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; await GAME.applySave(s); })"""
PREP = r"""((a)=>{ const G=GAME.G, H=(typeof DATE!=='undefined'&&DATE.HEROINES)||['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
  G.contacts=G.contacts||{}; for(const id of H){ if(G.contacts[id]==null) G.contacts[id]=a.d0-30; const r=SOCIAL.rel(id); r.fam=Math.max(r.fam,70); r.trust=Math.max(r.trust,55); r.comf=Math.max(r.comf,50); }
  const F=G.flags||(G.flags={}); delete F.FEED; const R=FEED.rec(G); R.start=a.d0; return {heroines:H, levels:H.map(id=>[id,SOCIAL.friendLevel(id)])}; })"""
STEP = r"""((a)=>{ const G=GAME.G, H=(typeof DATE!=='undefined'&&DATE.HEROINES)||[]; const out={snap:{}}; const m0=(G.msgs||[]).length;
  for(let d=a.d0; d<=a.d1; d++){ G.day=d; G.weekday=CALENDAR.dateOf(d).wd%7; G.hour=23; try{ FEED.tick(G); }catch(e){ out.err=String(e).slice(0,200); break; }
    if(a.snaps&&a.snaps[d]){ out.snap[a.snaps[d]]=FEED.visible(G).filter(i=>i.who==='heroine_01').map(i=>{ const p=FEED.post(i.id,G)||{}; return {id:i.id, day:CALENDAR.dateOf(i.day).key, pic:FEED.txt(p.pic,i.v), say:FEED.txt(p.say,i.v)}; }); } }
  const R=FEED.rec(G), posted=Object.keys(R.done).filter(k=>R.done[k]==='p'), by={}; for(const id of H) by[id]=[];
  for(const pid of posted){ const p=FEED.post(pid,G); if(p&&by[p.who]) by[p.who].push({id:pid, pic:FEED.txt(p.pic,'no'), say:FEED.txt(p.say,'no')}); }
  const blocked={}; for(const k in R.done) if(String(R.done[k]).startsWith('x:')) blocked[R.done[k]]=(blocked[R.done[k]]||0)+1;
  const dms=Object.keys(R.dm).map(id=>{ const x=FEED.dmOf(id); const q=x&&x.q; return {id, st:R.dm[id], who:q&&q.who, lines:q?(q.lines||[]).map(l=>typeof l==='string'?l:(l&&(l.t||l.text))||J(l)):[]}; });
  return Object.assign(out,{posted:posted.length, by, blocked, dms, msgsAdded:(G.msgs||[]).length-m0}); })""".replace('J(l)', 'JSON.stringify(l)')
VIS = r"""(()=>{ const G=GAME.G; return FEED.visible(G).map(i=>{ const p=FEED.post(i.id,G)||{}; return {id:i.id, who:i.who, name:FEED.name(G,i.who), day:CALENDAR.dateOf(i.day).key, h:i.h, pic:FEED.txt(p.pic,i.v), say:FEED.txt(p.say,i.v)}; }); })()"""
PHONE_TXT = "(()=>{ const p=document.getElementById('phone')||document.querySelector('.phone'); return p?(p.innerText||'').replace(/\\s+/g,' ').slice(0,3000):''; })()"
FIND_CIRCLE = r"""((a)=>{ const G=GAME.G, d0=G.day, h0=G.hour, wd0=G.weekday;
  try{ for(let d=0; d<2600; d++){ const T=CALENDAR.termOf(d); if(!T||T.id!==a.term||T.week<a.w0||T.week>a.w1) continue; const wd=CALENDAR.dateOf(d).wd; if(wd>=6) continue;
      for(let h=8; h<=21.5; h+=0.5){ G.day=d; G.weekday=wd%7; G.hour=h+0.1; let rows=[]; try{ rows=HCIRCLE.rowsIn(G); }catch(e){ continue; }
        const r=rows.find(r=>r.who===a.who&&!r.alone&&!r.spot&&(r.with||r.comp||r.withLabel)); if(r){ const e=HCIRCLE.heroEnt(r,G);
          return {day:d, key:CALENDAR.dateOf(d).key, wd, h:h+0.1, row:r.id, zone:e&&e.zone, with:r.with||r.comp||null, lines:(r.lines||[]).map(l=>(l.label?l.label+'：':'')+l.t)}; } } } }
  finally{ G.day=d0; G.hour=h0; G.weekday=wd0; } return null; })"""
CAPHOOK = r"""(()=>{ if(!window.__ccCapW){ const c0=GAME.caption; GAME.caption=function(w,t){ try{ (window.__ccCap=window.__ccCap||[]).push({w:String(w||''),t:String(t)}); }catch(e){} return c0.apply(this,arguments); }; window.__ccCapW=true; } window.__ccCap=[]; return true; })()"""
NPCPOS = r"""((ids)=>{ const out={}; for(const id of ids){ const n=(EVENTS.npcOf?EVENTS.npcOf(id):null)||(GAME.E.npcs||[]).find(q=>q&&q.charId===id); out[id]=n&&n.obj?{x:+n.obj.position.x.toFixed(2), z:+n.obj.position.z.toFixed(2), lv:n.lv|0, vis:n.obj.visible!==false&&!n.hidden, pose:n.pose||null}:null; } return out; })"""


async def load(pg, cdp, sv0, day, hour, zone):
    sv = json.loads(json.dumps(sv0)); sv['day'] = day; sv['hour'] = hour; sv['zone'] = zone; sv.pop('pos', None); sv['weather'] = 'clear'
    sv['weekday'] = (await pg.evaluate("((d)=>CALENDAR.dateOf(d).wd)", day)) % 7
    await pg.evaluate(APPLY, sv); await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)
    return await D.st(pg)


async def phone_shots(pg, cdp, tag, nm):
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    got = {}
    for tab in ('feed', 'msg'):
        sel = '[data-ptab="%s"]' % tab
        if await pg.evaluate("(s=>{ const b=document.querySelector(s); return !!(b&&b.offsetParent!==null); })", sel):
            await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1000)
            await D.shot(pg, 'hl_%s_%s' % (nm, tab), judge_black=False); got[tab] = await pg.evaluate(PHONE_TXT)
        else: got[tab] = None
    R.check('%s 打開手機看得到「動態」頁籤' % tag, got.get('feed') is not None, J({k: (v or '')[:80] for k, v in got.items()}))
    R.note('%s 手機「動態」頁畫面上的字：%s' % (tag, (got.get('feed') or '')[:1500]))
    await L.close_panels(pg, cdp)
    return got


async def part_feed(pg, cdp, sv0, res):
    for term in TERMS:
        tag = '[FEED %s]' % term
        w1 = await pg.evaluate(DAYOF, {'term': term, 'week': 1, 'wd': 1}); wt = await pg.evaluate(DAYOF, {'term': term, 'week': WEEK, 'wd': 3})
        if not R.check('%s 找得到這學期第 1 週、第 %d 週的日子' % (tag, WEEK), bool(w1 and wt), J([w1, wt])): continue
        snaps = {}
        if term == 'Y1S1' and 'ANW' in PARTS:
            for wk in (4, 10, 15):
                x = await pg.evaluate(DAYOF, {'term': term, 'week': wk, 'wd': 3})
                if x: snaps[str(x['day'])] = 'week%d' % wk
        d_end = max([wt['day']] + [int(k) for k in snaps])
        s = await load(pg, cdp, sv0, w1['day'], 9.0, 'dorm')
        R.setup('%s 【前置／捷徑】讀使用者存檔，改到 %s（第 1 週）宿舍；七位給聯絡方式、熟悉 70／信任 55／自在 50（很熟）；條件事件關掉' % (tag, w1['key']))
        pp = await pg.evaluate(PREP, {'d0': w1['day']})
        R.note('%s 七位的階段 %s' % (tag, J(pp['levels'])))
        R.setup('%s 【捷徑：跳日子】從 %s 到 %s 每天 23:00 叫一次 FEED.tick（遊戲「睡過、跳時間照原本時間補」的同一套）' % (tag, w1['key'], d_end))
        st = await pg.evaluate(STEP, {'d0': w1['day'], 'd1': d_end, 'snaps': snaps})
        res.setdefault('feed', {})[term] = st
        if st.get('err'): R.check('%s FEED.tick 沒有例外' % tag, False, st['err'])
        cnt = {k: len(v) for k, v in st['by'].items()}
        R.check('%s ① 七位這學期（到第 %d 週）每人至少一則「她自己的事」的動態' % (tag, WEEK if term != 'Y1S1' else 15), all(v >= 1 for v in cnt.values()), J({'count': cnt, 'blocked': st['blocked']}))
        for who, lst in st['by'].items():
            R.note('%s %s 的動態 %d 則（抄給 BB）：%s' % (tag, who, len(lst), J([[x['id'], x['pic'], x['say']] for x in lst])))
        if 'DM' in PARTS:
            dms = [x for x in st['dms'] if x['st'] not in (None, False, 0)]
            R.check('%s ④ 她們主動傳的私訊至少一則（講她自己的事，內容 BB 判）' % tag, bool(dms), J(st['dms'][:10]))
            R.note('%s 私訊全部（id、狀態、誰、句子）：%s' % (tag, J(st['dms'])))
        if term == 'Y1S1' and 'ANW' in PARTS:
            sn = st.get('snap', {}); ids = {k: [x['id'] for x in v] for k, v in sn.items()}
            R.check('[ANW] ③ 以安大一上第 4／10／15 週那天動態裡她的那幾則都看得到、而且不是同一則重複', len(sn) == 3 and len({tuple(v) for v in ids.values()}) == 3, J(ids))
            R.note('[ANW] 以安三個時間點的動態（抄給 BB）：%s' % J(sn))
        # 第 WEEK 週那天：畫面
        await pg.evaluate("((d)=>{ const G=GAME.G; G.day=d; G.weekday=CALENDAR.dateOf(d).wd%7; G.hour=20; FEED.tick(G); })", wt['day'])
        vis = await pg.evaluate(VIS); res['feed'][term]['visible_week'] = vis
        R.note('%s 第 %d 週 %s 那天手機動態（七天內）%d 則：%s' % (tag, WEEK, wt['key'], len(vis), J([[v['name'], v['day'], v['pic'], v['say']] for v in vis])))
        await phone_shots(pg, cdp, tag, term)


async def part_circle(pg, cdp, sv0, res):
    for who, nm in (('heroine_01', '以安'), ('heroine_03', '語彤'), ('heroine_05', '學姊')):
        tag = '[CIRCLE %s]' % nm
        f = await pg.evaluate(FIND_CIRCLE, {'term': 'Y1S1', 'w0': 3, 'w1': 14, 'who': who})
        res.setdefault('circle', {})[who] = {'find': f}
        if not R.check('%s 大一上第 3～14 週平日找得到她和同伴同框的時間地點（HCIRCLE.rowsIn）' % tag, bool(f and f.get('zone')), J(f)): continue
        s = await load(pg, cdp, sv0, f['day'], f['h'], f['zone'])
        R.setup('%s 【前置／捷徑】讀使用者存檔，改到 %s %.2f %s（圈子列 %s；條件事件關掉）' % (tag, f['key'], f['h'], f['zone'], f['row']))
        if not R.check('%s 讀到 %s' % (tag, f['zone']), s['zone'] == f['zone'], J(s)): continue
        await pg.evaluate(CAPHOOK)
        comp = f['with'] if isinstance(f['with'], list) else ([f['with']] if isinstance(f['with'], str) else [])
        pos = await pg.evaluate(NPCPOS, [who] + comp); res['circle'][who]['pos'] = pos
        h = pos.get(who)
        if not R.check('%s 她在、看得到' % tag, bool(h and h['vis']), J(pos)): continue
        near = {c: (round(math.hypot(p['x'] - h['x'], p['z'] - h['z']), 2) if p else None) for c, p in pos.items() if c != who}
        R.check('%s ② 同伴在她 3.2 m 內（不是一個人站著等玩家）' % tag, any(v is not None and v <= 3.2 for v in near.values()), J({'near': near, 'pos': pos}))
        tgt = None
        for rr in (3.0, 3.6, 2.4):
            for a in range(0, 360, 30):
                x, z = h['x'] + math.sin(math.radians(a)) * rr, h['z'] + math.cos(math.radians(a)) * rr
                if await pg.evaluate("(([x,z,lv])=>GAME.E.canStand(x,z,0.3,lv))", [x, z, h['lv']]): tgt = (x, z); break
            if tgt: break
        if tgt: await L.go_to(pg, cdp, R, tgt[0], tgt[1], 0.4, '%s 走到她 3 m 外' % tag, max_s=150, lv=h['lv'])
        caps = []
        for _ in range(30):
            caps = await pg.evaluate("window.__ccCap||[]")
            if caps: break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(3000); caps = await pg.evaluate("window.__ccCap||[]")
        await D.shot(pg, 'hl_circle_%s' % who, judge_black=False)
        res['circle'][who]['caps'] = caps
        R.check('%s 走到她旁邊聽到那一列的句子（字幕）' % tag, bool(caps), J({'expect': f['lines'], 'caps': caps}))
        R.note('%s 字幕全文（抄給 BB）：%s；稿上那一列 %s' % (tag, J(caps), J(f['lines'])))


async def main():
    print('CC HEROINE-LIFE-1028：TAG %s；SHA %s；PARTS %s；TERMS %s；Windows＋GPU ≠ iPhone' % (TAG, SHA or '?', ','.join(PARTS), ','.join(TERMS)), flush=True)
    res = {'tag': TAG, 'sha': SHA}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        sv0 = await pg.evaluate("fetch(%s).then(r=>r.ok?r.json():null)" % J(FIX))
        if not R.check('讀得到使用者存檔 %s' % FIX, bool(sv0), ''): await b.close(); sys.exit(1)
        if not R.check('這個版本有 FEED、HCIRCLE', await pg.evaluate("typeof FEED!=='undefined'&&typeof HCIRCLE!=='undefined'"), ''): await b.close(); sys.exit(1)
        for part, fn in (('FEED', part_feed), ('CIRCLE', part_circle)):
            if part not in PARTS: continue
            try: await fn(pg, cdp, sv0, res)
            except Exception as e: R.check('[%s] 沒有中斷' % part, False, repr(e)[:300])
            open(os.path.join(OUT, 'heroine_life_%s.json' % TAG), 'w', encoding='utf-8').write(J(res))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
