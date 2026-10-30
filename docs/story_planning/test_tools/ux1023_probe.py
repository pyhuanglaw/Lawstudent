"""BB-B 2026-10-23：LAWWW-B 11:18 清單 BB_SIS_B6_1023.md 第 35、36 項（開發分支 8282335af）——使用者直接要的兩項。
  EARLY_GO     第 35 項 校外約會提早出發（UX-INV-GO-1023）：15:00 出發的約會，14:00 以後在 3D 地圖上跳出「手機｜提醒：15:00，你約了…去…。」＋「現在出發」／「到時間再說」；
               選「現在出發」＝轉場、到的時候是約好的時間（出發時間＋車程）、約會照常演
  EARLY_LATER  同上選「到時間再說」＝不再問，15:00 照舊問「出發／改時間／今天不去了」
  MAP_<zone>   第 36 項 手機「地點」的地圖（UX-PHONE-MAP-1023）：手機直向 390×844，在校園、公館、溫州街、宿舍各開一次——
               地圖在最上面、紅點在你所在的地方、圖釘的字有沒有疊、圖釘手指點不點得到（透明圓的大小、和旁邊的圖釘重不重疊）、
               點圖釘＝變藍＋下面列出地點（霖澤館＝霖澤館前、大廳、201 教室）、再點一次收起來、沒去過的灰色沒有按鈕、按「前往」照常快速前往
  MAP_US       美國：沒有地圖只有清單
  MAP2_<zone>  第 36 項重測（LAWWW-B 0024f456b：整張圖都能點＝選最近的圖釘、太近的合成一個、紅圈＝你在這裡）：
               紅圈在對的圖釘、字不疊不蓋圖釘不出界、字級、圖釘間距；PLACEMAP.pick 算每個圖釘幾 px 內都選對、點地名選到誰；
               校園真的點每個圖釘旁邊 15 px（8 個方向）＋地名；公館五個地點、博雅・普通、溫州街＋兩點半；灰色；前往（校園→公館的店、宿舍→總圖）
【前置／捷徑】讀使用者 9/25 存檔（quiet_events）改日期、地點；約會用 DATE.book 直接訂（訂約會的介面另外測過），時鐘放在 13:57 讓它照走。
不是 iPhone 實機：Playwright Chromium（SwiftShader）手機模擬、?turbo；觸控用 CDP。
用法：LW_TESTS=<開發分支>/tests SHA=<sha> [SCEN=EARLY_GO,MAP_campus,...] python3 ux1023_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = [s for s in os.environ.get('SCEN', '').split(',') if s] or None
def say(*a): print(' '.join(str(x) for x in a), flush=True)
def J(x, n=600): return json.dumps(x, ensure_ascii=False, default=str)[:n]
TWF = {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1}
USF = {'EXCHANGE_ROUTE': 'US', 'EXCH_RULE': 1, 'US_DEPARTED': True, 'US_ARRIVED': True, 'US_RETURNED': None, 'Y4_PATH': 'other'}

async def page(p, landscape=True):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=landscape)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    return b, pg, cdp, errs

async def load_at(pg, base, key, h, zone, flags=None, js=None, run=None, label=''):
    st = json.loads(json.dumps(base)); G = st.get('G', st)
    d = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(key))
    G.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    G['flags'].update(flags or {})
    await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(5000)
    r = None
    if js: r = await pg.evaluate("(()=>{ const G=GAME.G, D=k=>STORY.dayOfKey(k); %s })()" % js)
    if run: run.setup('[前置] %s：使用者存檔改到 %s %.2f %s（quiet_events）；旗標 %s；console：%s → %s' % (label, key, h, zone, J(flags or {}, 200), (js or '')[:200], J(r, 300)))
    return r

async def choices(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")

async def pick(pg, cdp, start):
    c = await pg.evaluate("(w=>{ const e=[...document.querySelectorAll('#choices button')].find(b=>b.textContent.trim().startsWith(w)); if(!e) return null; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim()]; })(%s)" % json.dumps(start))
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200); return c[2]

SNAP = "(()=>({key:CALENDAR.dateOf(GAME.G.day).key, h:+GAME.G.hour.toFixed(3), zone:GAME.G.zone, dlg:!!(GAME.D&&GAME.D.active)}))()"
CHHOOK = """(()=>{ if(window.__CHH) return; window.__CHH=1; window.__CH=[]; window.__SAY=[];
  const t=()=>({key:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3)});
  const oc=ADV.log; ADV.log=function(n,x){ try{ window.__SAY.push(Object.assign({n:n||'',t:String(x)},t())); }catch(e){} return oc.apply(this,arguments); };
  if(typeof DATE!=='undefined'&&DATE.scene&&!DATE.scene.__bb){ const s0=DATE.scene; const f=async function(GM,q){ try{ window.__DSC=Object.assign({qday:q&&q.day,qh:q&&q.h},t()); }catch(e){} return s0.apply(this,arguments); }; f.__bb=1; DATE.scene=f; }
  const ot=GAME.toast; GAME.toast=function(x){ try{ window.__SAY.push(Object.assign({n:'TOAST',t:'TOAST:'+x},t())); }catch(e){} return ot.apply(this,arguments); }; })()"""

# ---------------------------------------------------------------- 第 35 項
BOOK = """G.flags.metAn=true; G.flags.met_an=true; SOCIAL.remember('heroine_01','FIRST_MET',''); G.contacts=G.contacts||{}; if(G.contacts.heroine_01==null) G.contacts.heroine_01=D('2025-09-03');   /* 第一次跑：存檔還不認識小安，提醒寫「不認識的女生」＝前置沒設好 */
  { const r=SOCIAL.rel('heroine_01'); r.fam=Math.max(r.fam|0,45); r.trust=Math.max(r.trust|0,30); r.comf=Math.max(r.comf|0,25); }
  const t=DATE.book(G,{who:'heroine_01',locs:['D13'],transport:'mrt',day:G.day,depart:15}); const q=OUT.get(G,'date_'+t.trip);
  return {trip:t.trip, depart:t.depart, status:t.status, q:q?{id:q.id,day:CALENDAR.dateOf(q.day).key,h:q.h,state:q.state,place:q.place,travel:q.travel}:null, loc:(DATE.loc&&DATE.loc('D13')||{}).name||null};"""

async def early(p, run, base, sid, later):
    b, pg, cdp, errs = await page(p)
    res = {}
    try:
        r = await load_at(pg, base, '2025-10-11', 13.95, 'dorm', flags=dict(TWF), js=BOOK, run=run, label=sid + '（2025-10-11（六）13:57 宿舍；DATE.book 小安、D13、15:00 出發）')
        res['book'] = r; say('   訂好：%s' % J(r))
        await pg.evaluate(CHHOOK)
        if not r or not r.get('q'): run.check('%s：訂得到約會（OUT date_*）' % sid, False, J(r)); return
        # 時間照走到提醒出現（14:00 以後，最多 9 分鐘）
        t0 = time.time(); seen = None; asked = []
        while time.time() - t0 < 540:
            cs = await choices(pg)
            if cs:
                asked.append(cs)
                if any(c.startswith('現在出發') for c in cs): seen = cs; break
                say('   其他選項：%s' % cs); await pick(pg, cdp, cs[-1])
            s = await L.state(pg)
            if s['dlg'] and not cs: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(1500)
        sn = await pg.evaluate(SNAP); said = await pg.evaluate("window.__SAY||[]")
        msg = [x for x in said if '提醒：15:00' in x['t']]
        res['prompt'] = {'choices': seen, 'at': sn, 'msg': msg[:2]}; say('   提醒：%s' % J(res['prompt']))
        await run.shot(pg, '%s_prompt' % sid)
        run.check('%s：14:00 以後跳出「提醒：15:00，你約了…」＋「現在出發」／「到時間再說」' % sid, bool(seen) and len(seen) == 2 and seen[0].startswith('現在出發') and seen[1].startswith('到時間再說') and bool(msg) and not any('不認識' in m['t'] for m in msg), J(res['prompt']))
        if not seen: return
        if not later:
            await pick(pg, cdp, '現在出發')
            t1 = time.time(); n = 0
            while time.time() - t1 < 420:   # 約會照常演：對話照點、選項選第一個
                cs = await choices(pg)
                if cs: n += 1; say('   約會選項：%s' % cs); await pick(pg, cdp, cs[0]); continue
                s = await L.state(pg)
                if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
                tr = await pg.evaluate("(id=>{ const t=(GAME.G.trips||[]).find(t=>t.trip===id); return t?{status:t.status,departed:!!t.departed}:null; })(%s)" % json.dumps(r['trip']))
                if tr and tr['status'] not in ('booked', 'going') and not s['busy']: break
                await pg.wait_for_timeout(1500)
            dsc = await pg.evaluate("window.__DSC||null"); tr = await pg.evaluate("(id=>{ const t=(GAME.G.trips||[]).find(t=>t.trip===id); return t?{status:t.status,departed:!!t.departed}:null; })(%s)" % json.dumps(r['trip']))
            said = await pg.evaluate("(window.__SAY||[]).map(x=>(x.n||'')+'｜'+x.t+'｜'+x.key+' '+x.h)")
            res['go'] = {'scene': dsc, 'trip': tr, 'end': await pg.evaluate(SNAP), 'said': said[-12:]}
            say('   出發以後：%s' % J(res['go'], 1200)); await run.shot(pg, '%s_after' % sid)
            ok_t = bool(dsc) and abs((dsc['h'] if dsc['key'] == r['q']['day'] else -99) - r['q']['h']) < 0.05
            run.check('%s：選「現在出發」＝轉場、到的時候是約好的時間（%s %.2f）' % (sid, r['q']['day'], r['q']['h']), ok_t, J({'scene': dsc, 'q': r['q']}))
            run.check('%s：約會照常演（有她的台詞、行程不再是 booked）' % sid, bool(tr) and tr['status'] != 'booked' and any('小安' in x or '以安' in x for x in said), J(res['go'], 900))
        else:
            await pick(pg, cdp, '到時間再說')
            t1 = time.time(); again = 0; at15 = None
            while time.time() - t1 < 900:
                cs = await choices(pg)
                if cs:
                    if any(c.startswith('現在出發') for c in cs): again += 1; await pick(pg, cdp, '到時間再說'); continue
                    at15 = {'choices': cs, 'at': await pg.evaluate(SNAP)}; break
                s = await L.state(pg)
                if s['dlg']: await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(1500)
            res['later'] = {'again': again, 'at15': at15}; say('   到時間再說以後：%s' % J(res['later']))
            await run.shot(pg, '%s_at15' % sid)
            run.check('%s：選「到時間再說」＝不再問「現在出發」' % sid, again == 0, J(res['later']))
            ok = bool(at15) and at15['at']['h'] >= 14.7 and any(c.startswith('出發') for c in at15['choices']) and any('今天不去' in c for c in at15['choices'])
            run.check('%s：出發時間到照舊問「出發／改時間／今天不去了」' % sid, ok, J(res['later']))
        run.check('%s：沒有 JS 例外' % sid, not errs, J(errs[:3]))
    except Exception as e:
        say('   例外：%r' % e); run.check('%s：跑完' % sid, False, repr(e)[:300])
    finally:
        json.dump(res, open(os.path.join(OUT, '%s.json' % sid), 'w'), ensure_ascii=False, indent=1, default=str)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass

# ---------------------------------------------------------------- 第 36 項
MAPQ = """(()=>{ const body=document.getElementById('phoneBody'); const svg=body&&body.querySelector('svg[aria-label="地點地圖"]'); if(!svg) return {svg:false, text:body?body.innerText.slice(0,300):''};
  const R=e=>{ const r=e.getBoundingClientRect(); return [+r.left.toFixed(1),+r.top.toFixed(1),+r.width.toFixed(1),+r.height.toFixed(1)]; };
  const pins=[...svg.querySelectorAll('[data-pmap]')].map(g=>{ const cs=g.querySelectorAll('circle'); return {id:g.dataset.pmap, name:(g.querySelector('text')||{}).textContent, hit:R(cs[0]), dot:R(cs[1]), fill:cs[1].getAttribute('fill'), text:R(g.querySelector('text'))}; });
  const areaText=[...svg.querySelectorAll(':scope > text')].map(t=>({t:t.textContent, r:R(t)}));
  const red=[...svg.querySelectorAll('circle')].some(c=>c.getAttribute('fill')==='#e07a6a');
  const sr=R(svg);
  return {svg:true, svgRect:sr, pins, areaText, red, list:(()=>{ const I=[...body.querySelectorAll('.item')], k=I.findIndex(x=>x.querySelector('svg')); return k<0?[]:I.slice(k+1,k+2).map(x=>x.innerText.slice(0,300)); })(), buttons:[...body.querySelectorAll('[data-place]')].length}; })()"""

def overlaps(rects):
    out = []
    for i in range(len(rects)):
        for j in range(i + 1, len(rects)):
            (a, ra), (b, rb) = rects[i], rects[j]
            ox = min(ra[0] + ra[2], rb[0] + rb[2]) - max(ra[0], rb[0]); oy = min(ra[1] + ra[3], rb[1] + rb[3]) - max(ra[1], rb[1])
            if ox > 0.5 and oy > 0.5: out.append([a, b, round(ox, 1), round(oy, 1)])
    return out

async def open_places(pg, cdp):
    if not await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide')&&getComputedStyle(p).display!=='none'; })()"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    c = await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"places\"]'); if(!b) return null; const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
    if c: await L.touch_tap(cdp, c[0], c[1])
    else: await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"places\"]'); if(b) b.click(); })()")
    await pg.wait_for_timeout(1500)

async def tap_pin(pg, cdp, pid):
    c = await pg.evaluate("(id=>{ const g=document.querySelector('#phoneBody [data-pmap=\"'+id+'\"]'); if(!g) return null; g.scrollIntoView({block:'center'}); const r=g.querySelector('circle').getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(pid))
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500); return True

MAPZ = {'gray': ('2025-10-08', 14.0, 'campus', "if(G.visited){ delete G.visited.lane118; delete G.visited.soclib; } return {visited:Object.keys(G.visited||{})};"),
        # 118 巷、社科圖在 PLACES.known0（一開始就知道，X65），刪了也不會灰 → gray2 改刪不在 known0 的：阿鳳麵店、舊路書房、兩點半 Café（圖釘因為同一顆裡有 known0 的地方，照樣不灰；灰的是清單那一行）
        'gray2': ('2025-10-08', 14.0, 'campus', "if(G.visited){ delete G.visited.noodle; delete G.visited.bookstore; delete G.visited.cafe; } return {visited:Object.keys(G.visited||{}), known0:Object.keys(PLACES.known0||{})};"),   # 【前置】118 巷、社科圖改成沒去過（使用者存檔每個地方都去過，灰色圖釘測不到）
        'campus': ('2025-10-08', 14.0, 'campus', None), 'gongguan': ('2025-10-08', 14.0, 'gongguan', None), 'wenzhou': ('2025-10-08', 14.0, 'wenzhou', None), 'dorm': ('2025-10-08', 14.0, 'dorm', None)}

async def map_zone(p, run, base, sid, zone):
    b, pg, cdp, errs = await page(p, landscape=False)
    res = {}
    try:
        key, h, z, js = MAPZ[zone]
        await load_at(pg, base, key, h, z, flags=dict(TWF), js=js, run=run, label=sid + '（直向 390×844；%s %s）' % (key, z))
        await open_places(pg, cdp); await pg.evaluate("(()=>{ const b=document.getElementById('phoneBody'); if(b) b.scrollTop=0; })()"); await pg.wait_for_timeout(500)
        await run.shot(pg, '%s_map' % sid)
        m = await pg.evaluate(MAPQ); res['map'] = m
        run.check('%s：手機「地點」最上面有地圖' % sid, bool(m.get('svg')), J(m, 300))
        if not m.get('svg'): return
        run.check('%s：紅點（你在這裡）' % sid, bool(m['red']), '')
        T = [(p_['name'], p_['text']) for p_ in m['pins']] + [(a['t'], a['r']) for a in m['areaText'] if a['t']]
        ov = overlaps(T); res['textOverlap'] = ov
        run.check('%s：圖上的字不疊（%d 個字）' % (sid, len(T)), not ov, J(ov))
        D = [(p_['name'] + '（點）', p_['dot']) for p_ in m['pins']]
        ov2 = overlaps([(a, r) for a, r in T] + D); ov2 = [o for o in ov2 if not (o[0].replace('（點）', '') == o[1].replace('（點）', ''))]; res['textDotOverlap'] = ov2
        run.check('%s：字不蓋到別的圖釘' % sid, not [o for o in ov2 if '（點）' in o[0] + o[1]], J(ov2))
        hits = [(p_['id'], p_['hit']) for p_ in m['pins']]; mn = min(min(r[2], r[3]) for _, r in hits)
        hov = []
        for i in range(len(hits)):
            for j in range(i + 1, len(hits)):
                (a, ra), (bb, rb) = hits[i], hits[j]
                ca = (ra[0] + ra[2] / 2, ra[1] + ra[3] / 2); cb = (rb[0] + rb[2] / 2, rb[1] + rb[3] / 2); d = math.hypot(ca[0] - cb[0], ca[1] - cb[1])
                if d < (ra[2] + rb[2]) / 2 - 0.5: hov.append([a, bb, round(d, 1), round((ra[2] + rb[2]) / 2, 1)])
        res['hit'] = {'min': mn, 'overlap': hov}
        say('   圖釘可點範圍最小 %.1f px（地圖寬 %.0f px）；互相重疊：%s' % (mn, m['svgRect'][2], J(hov)))
        run.check('%s：圖釘手指點得到（每顆可點範圍 ≥ 30 px；記錄重疊的）' % sid, mn >= 30, J(res['hit']))
        # 點霖澤館 → 變藍＋列出三個地點；再點一次收起來
        if await tap_pin(pg, cdp, 'linze'):
            m2 = await pg.evaluate(MAPQ); await run.shot(pg, '%s_pin_linze' % sid); res['linze'] = m2
            pin = next((x for x in m2['pins'] if x['id'] == 'linze'), {}); lst = ' '.join(m2.get('list') or [])
            run.check('%s：點霖澤館＝圖釘變藍、下面列出霖澤館前／大廳／201 教室' % sid, pin.get('fill') == '#7fc4c9' and all(w in lst for w in ['台大校園（霖澤館前）', '霖澤館（大廳）', '霖澤館 201 教室']), J({'fill': pin.get('fill'), 'list': m2.get('list')}))
            await tap_pin(pg, cdp, 'linze'); m3 = await pg.evaluate(MAPQ); lst3 = ' '.join(m3.get('list') or [])
            run.check('%s：再點一次收起來' % sid, '霖澤館 201 教室' not in lst3, J(m3.get('list')))
        # 沒去過的（灰色、沒有按鈕）
        gray = [x for x in m['pins'] if x['fill'] == '#4b4a46']; res['gray'] = [x['id'] for x in gray]
        if gray:
            await tap_pin(pg, cdp, gray[0]['id']); m4 = await pg.evaluate(MAPQ); await run.shot(pg, '%s_pin_%s' % (sid, gray[0]['id']))
            lst4 = ' '.join(m4.get('list') or [])
            run.check('%s：沒去過的（%s）灰色、列出來寫「還沒去過」、沒有前往按鈕' % (sid, gray[0]['id']), '還沒去過' in lst4 and m4.get('buttons', 0) == m['buttons'], J({'list': m4.get('list'), 'btn': [m['buttons'], m4.get('buttons')]}))
            await tap_pin(pg, cdp, gray[0]['id'])
        else: say('   這個存檔每個地方都去過（沒有灰色圖釘）')
        # 前往（校園：總圖）
        if zone == 'campus':
            await tap_pin(pg, cdp, 'library')
            c = await pg.evaluate("(()=>{ const items=[...document.querySelectorAll('#phoneBody .item')]; const it=items.find(x=>/總圖書館（大廳）/.test(x.innerText)&&x.querySelector('[data-place]')&&!x.querySelector('svg')); const btn=it&&it.querySelector('[data-place]'); if(!btn) return null; btn.scrollIntoView({block:'center'}); const r=btn.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,btn.textContent.trim(),btn.dataset.place,+r.width.toFixed(0),+r.height.toFixed(0)]; })()")
            res['go'] = c; say('   總圖的按鈕：%s' % J(c))
            if c:
                await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
                t0 = time.time(); z2 = None
                while time.time() - t0 < 90:
                    cs = await choices(pg)
                    if cs: say('   選項：%s' % cs); await pick(pg, cdp, cs[0])
                    z2 = await pg.evaluate("GAME.G.zone")
                    if z2 == 'library_hall': break
                    await pg.wait_for_timeout(1500)
                await pg.wait_for_timeout(3000); await run.shot(pg, '%s_go_library' % sid)
                run.check('%s：圖釘下面按「前往」＝照常快速前往（到總圖大廳）' % sid, z2 == 'library_hall', J({'zone': z2, 'btn': c}))
            else: run.check('%s：總圖圖釘下面有「前往」' % sid, False, '')
        run.check('%s：沒有 JS 例外' % sid, not errs, J(errs[:3]))
    except Exception as e:
        say('   例外：%r' % e); run.check('%s：跑完' % sid, False, repr(e)[:300])
    finally:
        json.dump(res, open(os.path.join(OUT, '%s.json' % sid), 'w'), ensure_ascii=False, indent=1, default=str)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass

async def map_us(p, run, base, sid):
    b, pg, cdp, errs = await page(p, landscape=False)
    try:
        await load_at(pg, base, '2028-09-20', 14.0, 'us_apartment', flags=dict(USF), js="G.flags.US_ARRIVED_DAY=D('2028-08-02'); G.flags.Y4_PATH_DAY=D('2028-06-08');", run=run, label=sid + '（直向；美國路線、人在美國公寓）')
        await open_places(pg, cdp); await run.shot(pg, '%s_places' % sid)
        m = await pg.evaluate(MAPQ); say('   美國：%s' % J(m, 300))
        run.check('%s：美國沒有地圖、只有清單' % sid, not m.get('svg') and bool(m.get('text')), J(m, 300))
        run.check('%s：沒有 JS 例外' % sid, not errs, J(errs[:3]))
    finally:
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


# ---------------------------------------------------------------- 第 36 項重測（0024f456b：整張圖都能點、合併圖釘、紅圈）
MAPQ2 = """(()=>{ const body=document.getElementById('phoneBody'); const svg=body&&body.querySelector('svg[aria-label="地點地圖"]'); if(!svg) return {svg:false, text:body?body.innerText.slice(0,300):''};
  const R=e=>{ const r=e.getBoundingClientRect(); return [+r.left.toFixed(1),+r.top.toFixed(1),+r.width.toFixed(1),+r.height.toFixed(1)]; };
  const sr=svg.getBoundingClientRect(), VB=(svg.getAttribute('viewBox')||'').split(/\\s+/).map(Number), kx=sr.width/VB[2], ky=sr.height/VB[3];
  const pins=[...svg.querySelectorAll('[data-pmap]')].map(g=>{ const c=g.querySelector('circle'), t=g.querySelector('text'); const ux=+c.getAttribute('cx'), uy=+c.getAttribute('cy');
    return {id:g.dataset.pmap, name:t?t.textContent:'', ux, uy, px:+(sr.left+(ux-VB[0])*kx).toFixed(1), py:+(sr.top+(uy-VB[1])*ky).toFixed(1), dot:R(c), fill:c.getAttribute('fill'), tfill:t?t.getAttribute('fill'):null, text:t?R(t):null, fs:t?+t.getAttribute('font-size'):0}; });
  const rings=[...svg.querySelectorAll('circle')].filter(c=>c.getAttribute('stroke')==='#e07a6a').map(c=>({ux:+c.getAttribute('cx'), uy:+c.getAttribute('cy')}));
  const ringPin=rings.map(rg=>(pins.find(p=>p.ux===rg.ux&&p.uy===rg.uy)||{}).id||null);
  const areaText=[...svg.querySelectorAll(':scope > text')].map(t=>({t:t.textContent, r:R(t)}));
  const I=[...body.querySelectorAll('.item')], ki=I.findIndex(x=>x.querySelector('svg'));
  const P=GAME.E&&GAME.E.player;
  return {svg:true, svgRect:R(svg), vb:VB, kx:+kx.toFixed(4), ky:+ky.toFixed(4), pins, rings, ringPin, areaText, sel:(pins.find(p=>p.fill==='#7fc4c9')||{}).id||null,
    list:ki<0?[]:I.slice(ki+1,ki+2).map(x=>x.innerText.slice(0,400)), buttons:[...body.querySelectorAll('[data-place]')].length,
    here:{zone:GAME.G.zone, x:P?+P.obj.position.x.toFixed(1):null, z:P?+P.obj.position.z.toFixed(1):null},
    PINS:(typeof PLACEMAP!=='undefined'?PLACEMAP.PINS.map(p=>({id:p.id,cx:p.cx,cz:p.cz})):[])}; })()"""
SELQ = """(()=>{ const s=document.querySelector('#phoneBody svg[aria-label="地點地圖"]'); if(!s) return 'NOSVG'; const g=[...s.querySelectorAll('[data-pmap]')].find(g=>g.querySelector('circle').getAttribute('fill')==='#7fc4c9'); return g?g.dataset.pmap:null; })()"""
# 每個圖釘：手指偏多少 px 以內（16 個方向）都選到它（用遊戲自己的 PLACEMAP.pick 算，不點）；點地名的中心、四個角選到誰
SAFEQ = """(()=>{ const svg=document.querySelector('#phoneBody svg[aria-label="地點地圖"]'); const sr=svg.getBoundingClientRect(), VB=svg.getAttribute('viewBox').split(/\\s+/).map(Number), kx=sr.width/VB[2], ky=sr.height/VB[3]; const ids=svg.dataset.pmapsvg.split(',');
  const U=(cx,cy)=>[VB[0]+(cx-sr.left)/kx, VB[1]+(cy-sr.top)/ky];
  return [...svg.querySelectorAll('[data-pmap]')].map(g=>{ const c=g.querySelector('circle'), t=g.querySelector('text'); const ux=+c.getAttribute('cx'), uy=+c.getAttribute('cy');
    let safe=0, bad=null; for(let r=1;r<=45&&!bad;r++){ for(let a=0;a<16;a++){ const th=a*Math.PI/8; const got=PLACEMAP.pick(ux+r*Math.cos(th)/kx, uy+r*Math.sin(th)/ky, ids); if(got!==g.dataset.pmap){ bad={px:r,deg:a*22.5,got}; break; } } if(!bad) safe=r; }
    const tr=t.getBoundingClientRect(); const lab=PLACEMAP.pick(...U(tr.left+tr.width/2,tr.top+tr.height/2),ids);
    const corners=[[tr.left+1,tr.top+1],[tr.right-1,tr.top+1],[tr.left+1,tr.bottom-1],[tr.right-1,tr.bottom-1]].map(([a,b])=>PLACEMAP.pick(...U(a,b),ids));
    return {id:g.dataset.pmap, safe, bad, lab, labCorners:corners}; }); })()"""
EXPECT_HERE = {'gongguan': 'gongguan', 'wenzhou': 'wenzhou', 'dorm': 'dorm'}
OFFS = [(15, 0), (-15, 0), (0, 15), (0, -15), (11, 11), (-11, 11), (11, -11), (-11, -11)]   # 15 px（斜角 11,11≈15.6）

async def sel_now(pg): return await pg.evaluate(SELQ)

async def tap_xy(pg, cdp, x, y):
    await L.touch_tap(cdp, x, y); await pg.wait_for_timeout(900); return await sel_now(pg)

async def pin_xy(pg, pid):
    m = await pg.evaluate(MAPQ2); q = next((x for x in m['pins'] if x['id'] == pid), None)
    return (q['px'], q['py'], q) if q else (None, None, None)

async def select_pin(pg, cdp, pid):
    """點圖釘中心讓它選中（已經選中就不動）"""
    if await sel_now(pg) == pid: return True
    x, y, _ = await pin_xy(pg, pid)
    if x is None: return False
    return await tap_xy(pg, cdp, x, y) == pid

async def map2_zone(p, run, base, sid, zone):
    b, pg, cdp, errs = await page(p, landscape=False)
    res = {}
    try:
        key, h, z, js = MAPZ[zone]
        await load_at(pg, base, key, h, z, flags=dict(TWF), js=js, run=run, label=sid + '（直向 390×844；%s %s）' % (key, z))
        await open_places(pg, cdp); await pg.evaluate("(()=>{ const b=document.getElementById('phoneBody'); if(b) b.scrollTop=0; })()"); await pg.wait_for_timeout(600)
        await run.shot(pg, '%s_map' % sid)
        m = await pg.evaluate(MAPQ2); res['map'] = m
        run.check('%s：手機「地點」最上面有地圖' % sid, bool(m.get('svg')), J(m, 300))
        if not m.get('svg'): return
        say('   地圖 %s px、每單位 %.3f px；圖釘 %d 個：%s' % (m['svgRect'], m['kx'], len(m['pins']), [x['name'] for x in m['pins']]))
        # 你在這裡＝紅圈在對的圖釘
        if zone in EXPECT_HERE: exp = EXPECT_HERE[zone]
        else:
            hx, hz = m['here']['x'], m['here']['z']
            exp = min((q for q in m['PINS'] if q.get('cx') is not None), key=lambda q: math.hypot(q['cx'] - hx, q['cz'] - hz))['id'] if hx is not None else None
        res['ring'] = {'ringPin': m['ringPin'], 'expect': exp, 'here': m['here']}
        run.check('%s：你在這裡＝紅圈在「%s」（人在 %s）' % (sid, exp, J(m['here'])), m['ringPin'] == [exp], J(res['ring']))
        if os.environ.get('F74'):   # LAWWW-B f7402a045：人所在的單一地點圖釘＝可以前往的橘色（不再是「現在不能去」的灰）；圖例拿掉「還沒去過」
            rp = next((q for q in m['pins'] if q['id'] == exp), {})
            run.check('%s：紅圈那一顆（%s）是橘色 #e9b96a，不是「現在不能去」的灰' % (sid, exp), rp.get('fill') == '#e9b96a', J({'fill': rp.get('fill')}))
            leg = await pg.evaluate("(()=>{ const s=document.querySelector('#phoneBody svg[aria-label=\"地點地圖\"]'); const it=s&&s.closest('.item'); const m=it&&it.querySelector('.muted'); return m?m.innerText:''; })()")
            res['legend'] = leg
            run.check('%s：圖例沒有「還沒去過」' % sid, bool(leg) and '還沒去過' not in leg, J(leg))
        # 字：不疊、不蓋到別的圖釘、不超出地圖；字的大小
        T = [(q['name'], q['text']) for q in m['pins'] if q['text']] + [(a['t'], a['r']) for a in m['areaText'] if a['t']]
        ov = overlaps(T); res['textOverlap'] = ov
        run.check('%s：圖上的字不疊（%d 個字）' % (sid, len(T)), not ov, J(ov))
        D = [(q['name'] + '（點）', q['dot']) for q in m['pins']]
        ov2 = [o for o in overlaps(T + D) if '（點）' in o[0] + o[1] and o[0].replace('（點）', '') != o[1].replace('（點）', '')]; res['textDot'] = ov2
        run.check('%s：字不蓋到別的圖釘' % sid, not ov2, J(ov2))
        sr = m['svgRect']; outside = [n for n, r in T if r[0] < sr[0] - 0.5 or r[1] < sr[1] - 0.5 or r[0] + r[2] > sr[0] + sr[2] + 0.5 or r[1] + r[3] > sr[1] + sr[3] + 0.5]
        run.check('%s：字都在地圖裡（沒有被切掉）' % sid, not outside, J(outside))
        fpx = round(min(q['fs'] for q in m['pins']) * m['kx'], 1); res['fontPx'] = fpx
        say('   地名字級 %.1f px（font-size %s 單位）' % (fpx, sorted({q['fs'] for q in m['pins']})))
        run.check('%s：地名字級 ≥ 10.5 px（量到 %.1f px）' % (sid, fpx), fpx >= 10.5, '')
        # 圖釘間距（手機上的 px）
        dd = []
        for i in range(len(m['pins'])):
            for j in range(i + 1, len(m['pins'])):
                a, c = m['pins'][i], m['pins'][j]; dd.append((round(math.hypot(a['px'] - c['px'], a['py'] - c['py']), 1), a['id'], c['id']))
        dd.sort(); res['minDist'] = dd[:4]
        say('   最近的幾對圖釘（px）：%s' % J(dd[:4]))
        run.check('%s：相鄰圖釘中心相隔 ≥ 40 px（最近一對 %.1f px：%s／%s）' % (sid, dd[0][0], dd[0][1], dd[0][2]), dd[0][0] >= 40, J(dd[:4]))
        # 用遊戲的 PLACEMAP.pick 量：手指偏多少 px 都還選得到；點地名選到誰
        sf = await pg.evaluate(SAFEQ); res['safe'] = sf
        say('   每個圖釘偏多少 px 內都選對：%s' % J([[x['id'], x['safe'], (x['bad'] or {}).get('got')] for x in sf], 900))
        low = [[x['id'], x['safe'], x['bad']] for x in sf if x['safe'] < 18]
        run.check('%s：每個圖釘四周 18 px 內（16 個方向）點下去都選到它（算的，PLACEMAP.pick）' % sid, not low, J(low))
        badlab = [[x['id'], x['lab'], x['labCorners']] for x in sf if x['lab'] != x['id']]
        run.check('%s：點地名（字的中間）選到那個地方（算的）' % sid, not badlab, J(badlab))
        cornerbad = [[x['id'], x['labCorners']] for x in sf if any(c != x['id'] for c in x['labCorners'])]
        res['labCornerBad'] = cornerbad
        if cornerbad: say('   地名的角落點下去會選到別的（記錄，不判定）：%s' % J(cornerbad, 600))
        ids = [q['id'] for q in m['pins']]
        if zone == 'campus':
            # 真的點：每個圖釘旁邊 15 px（上下左右、四個斜角）＋地名中間
            wrong, n = [], 0
            for (dx, dy) in OFFS + [('lab', 'lab')]:
                for pid in ids:
                    if await sel_now(pg) == pid:   # 已經選中再點會收起來：先點中心收起
                        x0, y0, _ = await pin_xy(pg, pid); await tap_xy(pg, cdp, x0, y0)
                    x0, y0, q = await pin_xy(pg, pid)
                    if dx == 'lab': tx, ty = q['text'][0] + q['text'][2] / 2, q['text'][1] + q['text'][3] / 2
                    else: tx, ty = x0 + dx, y0 + dy
                    if not (sr[0] + 1 < tx < sr[0] + sr[2] - 1 and sr[1] + 1 < ty < sr[1] + sr[3] - 1): continue
                    got = await tap_xy(pg, cdp, tx, ty); n += 1
                    if got != pid: wrong.append([pid, dx, dy, got])
            res['taps'] = {'n': n, 'wrong': wrong}
            say('   真的點了 %d 次；選錯：%s' % (n, J(wrong, 900)))
            run.check('%s：真的點每個圖釘旁邊 15 px（8 個方向）和地名，都選到那個圖釘（%d 次）' % (sid, n), n > 0 and not wrong, J(wrong, 900))
            if await sel_now(pg):
                s0 = await sel_now(pg); x0, y0, _ = await pin_xy(pg, s0); await tap_xy(pg, cdp, x0, y0)
            # 空白的地方（離所有圖釘都遠）＝不選
            got = await tap_xy(pg, cdp, sr[0] + 0.06 * sr[2], sr[1] + 0.92 * sr[3]); res['blank'] = got
            run.check('%s：點地圖空白的角落（離圖釘很遠）＝不選任何地方' % sid, got is None, J(got))
            # 霖澤館：三個地點、再點收起來
            await select_pin(pg, cdp, 'linze'); m2 = await pg.evaluate(MAPQ2); await run.shot(pg, '%s_pin_linze' % sid); lst = ' '.join(m2.get('list') or [])
            run.check('%s：點霖澤館＝變藍、列出霖澤館前／大廳／201 教室' % sid, m2['sel'] == 'linze' and all(w in lst for w in ['台大校園（霖澤館前）', '霖澤館（大廳）', '霖澤館 201 教室']), J(m2.get('list')))
            x0, y0, _ = await pin_xy(pg, 'linze'); got = await tap_xy(pg, cdp, x0 + 8, y0 - 6); m3 = await pg.evaluate(MAPQ2)
            run.check('%s：再點一次（旁邊一點）收起來' % sid, got is None and '霖澤館 201 教室' not in ' '.join(m3.get('list') or []), J({'sel': got, 'list': m3.get('list')}))
            # 博雅・普通
            await select_pin(pg, cdp, 'boya'); m4 = await pg.evaluate(MAPQ2); lst = ' '.join(m4.get('list') or []); await run.shot(pg, '%s_pin_boya' % sid)
            run.check('%s：點「博雅・普通」＝列出博雅教學館、普通教學館' % sid, all(w in lst for w in ['博雅教學館', '普通教學館']), J(m4.get('list')))
        # 公館：五個地點
        if 'gongguan' in ids:
            await select_pin(pg, cdp, 'gongguan'); m5 = await pg.evaluate(MAPQ2); lst = ' '.join(m5.get('list') or []); await run.shot(pg, '%s_pin_gongguan' % sid)
            res['gongguanList'] = m5.get('list')
            five = ['公館商圈', '捷運公館站', '阿鳳麵店', '舊路書房', '日日便利']
            run.check('%s：點「公館」＝列出五個地點（%s）' % (sid, '、'.join(five)), all(w in lst for w in five), J(m5.get('list')))
            if zone == 'gongguan':
                run.check('%s：人在公館商圈＝那一行寫「你在這裡」、沒有前往按鈕' % sid, '你在這裡' in lst, J(m5.get('list')))
                if os.environ.get('GG2'):   # LAWWW-B cce997abd：公館兩個落點照距離算——人在商圈時捷運站「約 N 分鐘」可以前往；站在捷運站旁邊才算「你在這裡」
                    rows = await pg.evaluate("[...document.querySelectorAll('#phoneBody .phrow')].map(r=>({t:r.innerText.replace(/\\n/g,' '), btn:(r.querySelector('[data-place]')||{}).textContent||null}))")
                    mrt = next((r for r in rows if '捷運公館站' in r['t']), None); shop = next((r for r in rows if '公館商圈' in r['t']), None); res['gg2'] = {'mrt': mrt, 'shop': shop}
                    run.check('%s：人在公館商圈＝捷運公館站寫「約 N 分鐘」、有「前往」' % sid, bool(mrt) and '你在這裡' not in mrt['t'] and '約' in mrt['t'] and (mrt['btn'] or '').strip() == '前往', J(res['gg2']))
                    p0 = await pg.evaluate("(()=>{ const o=GAME.E.player.obj.position; return [+o.x.toFixed(1),+o.z.toFixed(1)]; })()")
                    c = await pg.evaluate("(()=>{ const r=[...document.querySelectorAll('#phoneBody .phrow')].find(x=>x.innerText.includes('捷運公館站')); const b=r&&r.querySelector('[data-place]'); if(!b) return null; b.scrollIntoView({block:'center'}); const q=b.getBoundingClientRect(); return [q.left+q.width/2,q.top+q.height/2]; })()")
                    if c:
                        await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
                        t0 = time.time()
                        while time.time() - t0 < 60:
                            cs = await choices(pg)
                            if cs: say('   選項：%s' % cs); await pick(pg, cdp, cs[0])
                            s_ = await L.state(pg)
                            if not s_['dlg'] and not cs and not s_.get('busy'): break
                            await pg.wait_for_timeout(1500)
                        await pg.wait_for_timeout(3000)
                        p1 = await pg.evaluate("(()=>{ const o=GAME.E.player.obj.position; return [GAME.G.zone,+o.x.toFixed(1),+o.z.toFixed(1)]; })()"); await run.shot(pg, '%s_go_mrt' % sid)
                        moved = math.hypot(p1[1] - p0[0], p1[2] - p0[1])
                        run.check('%s：按捷運公館站「前往」＝人移到捷運站那一頭（從 %s 到 %s，%.0f m）' % (sid, p0, p1, moved), p1[0] == 'gongguan' and moved > 15, J({'p0': p0, 'p1': p1}))
                        await open_places(pg, cdp); await pg.evaluate("(()=>{ const b=document.getElementById('phoneBody'); if(b) b.scrollTop=0; })()"); await pg.wait_for_timeout(600)
                        await select_pin(pg, cdp, 'gongguan'); await run.shot(pg, '%s_pin_gongguan_at_mrt' % sid)
                        rows = await pg.evaluate("[...document.querySelectorAll('#phoneBody .phrow')].map(r=>({t:r.innerText.replace(/\\n/g,' '), btn:(r.querySelector('[data-place]')||{}).textContent||null}))")
                        mrt = next((r for r in rows if '捷運公館站' in r['t']), None); shop = next((r for r in rows if '公館商圈' in r['t']), None); res['gg2b'] = {'mrt': mrt, 'shop': shop}
                        run.check('%s：站在捷運站旁邊＝捷運公館站「你在這裡」、公館商圈可以前往' % sid, bool(mrt) and '你在這裡' in mrt['t'] and bool(shop) and (shop['btn'] or '').strip() == '前往', J(res['gg2b']))
                    else: run.check('%s：捷運公館站有「前往」按鈕' % sid, False, J(rows))
        if zone == 'wenzhou' and 'wenzhou' in ids:
            await select_pin(pg, cdp, 'wenzhou'); m6 = await pg.evaluate(MAPQ2); lst = ' '.join(m6.get('list') or []); await run.shot(pg, '%s_pin_wenzhou' % sid)
            run.check('%s：點「溫州街」＝列出溫州街、兩點半 Café' % sid, all(w in lst for w in ['溫州街', '兩點半']), J(m6.get('list')))
        # 沒去過的（灰色、地名也灰、列出來寫「還沒去過」、沒有前往按鈕）
        m = await pg.evaluate(MAPQ2)
        gray = [q for q in m['pins'] if q['fill'] == '#4b4a46']; res['gray'] = [[q['id'], q['tfill']] for q in gray]
        say('   灰色圖釘：%s' % J(res['gray']))
        if zone == 'gray':
            run.check('%s：沒去過的 118 巷、社科圖是灰色圖釘' % sid, {'lane118', 'soclib'} <= {q['id'] for q in gray}, J(res['gray']))
        if zone == 'gray2':
            res['grayPins'] = [q['id'] for q in gray]
            say('   （記錄）灰色圖釘：%s——每一顆圖釘都有一開始就知道的地方，圖釘不會灰' % J(res['grayPins']))
            for pid, wants in (('gongguan', ['阿鳳麵店', '舊路書房']), ('wenzhou', ['兩點半'])):
                await select_pin(pg, cdp, pid); await run.shot(pg, '%s_pin_%s' % (sid, pid))
                rows = await pg.evaluate("[...document.querySelectorAll('#phoneBody .phrow')].map(r=>({t:r.innerText.replace(/\\n/g,' '), btn:(r.querySelector('[data-place]')||{}).textContent||null}))")
                for w in wants:
                    r_ = next((r for r in rows if w in r['t']), None)
                    run.check('%s：點「%s」＝沒去過的「%s」那一行寫「還沒去過」、沒有前往按鈕' % (sid, pid, w), bool(r_) and '還沒去過' in r_['t'] and not r_['btn'], J(r_))
                others = [r for r in rows if not any(w in r['t'] for w in wants) and r['btn']]
                run.check('%s：同一顆圖釘裡去過的地方照舊可以前往（%d 個）' % (sid, len(others)), len(others) >= 1, J(rows, 400))
            gray = []
        for q in gray:
            if m['sel']: x0, y0, _ = await pin_xy(pg, m['sel']); await tap_xy(pg, cdp, x0, y0)
            btn0 = (await pg.evaluate(MAPQ2))['buttons']
            await select_pin(pg, cdp, q['id']); m7 = await pg.evaluate(MAPQ2); await run.shot(pg, '%s_pin_%s' % (sid, q['id'])); lst = ' '.join(m7.get('list') or [])
            run.check('%s：點灰色的「%s」＝列出來寫「還沒去過」、沒有前往按鈕' % (sid, q['name']), m7['sel'] == q['id'] and '還沒去過' in lst and m7['buttons'] == btn0, J({'list': m7.get('list'), 'btn': [btn0, m7['buttons']]}))
            m = m7
        # 前往：校園 → 公館的店；宿舍 → 總圖
        go = {'campus': ('gongguan', ['舊路書房', '阿鳳麵店', '日日便利']), 'dorm': ('library', ['總圖書館（大廳）'])}.get(zone)
        if go:
            pid, wants = go
            if (await sel_now(pg)) not in (None, pid): s0 = await sel_now(pg); x0, y0, _ = await pin_xy(pg, s0); await tap_xy(pg, cdp, x0, y0)
            await select_pin(pg, cdp, pid)
            c = await pg.evaluate("(ws=>{ const rows=[...document.querySelectorAll('#phoneBody .phrow')]; for(const w of ws){ const r=rows.find(x=>x.innerText.includes(w)); const btn=r&&r.querySelector('[data-place]'); if(btn&&/前往/.test(btn.textContent)){ btn.scrollIntoView({block:'center'}); const q=btn.getBoundingClientRect(); return [q.left+q.width/2,q.top+q.height/2,w,btn.dataset.place,+q.width.toFixed(0),+q.height.toFixed(0)]; } } return null; })(%s)" % json.dumps(wants))
            res['go'] = c; say('   前往按鈕：%s' % J(c))
            if c:
                target = c[3].split('|')[0]
                await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
                t0 = time.time(); z2 = None
                while time.time() - t0 < 120:
                    cs = await choices(pg)
                    if cs: say('   選項：%s' % cs); await pick(pg, cdp, cs[0])
                    z2 = await pg.evaluate("GAME.G.zone")
                    if z2 == target: break
                    await pg.wait_for_timeout(1500)
                await pg.wait_for_timeout(3000); await run.shot(pg, '%s_go_%s' % (sid, target))
                run.check('%s：點「%s」圖釘、按「%s」的前往＝到了（%s）' % (sid, pid, c[2], target), z2 == target, J({'zone': z2, 'btn': c}))
            else: run.check('%s：「%s」下面有可以按的「前往」' % (sid, pid), False, J(m.get('list')))
        run.check('%s：沒有 JS 例外' % sid, not errs, J(errs[:3]))
    except Exception as e:
        say('   例外：%r' % e); run.check('%s：跑完' % sid, False, repr(e)[:300])
    finally:
        json.dump(res, open(os.path.join(OUT, '%s.json' % sid), 'w'), ensure_ascii=False, indent=1, default=str)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass

ORDER = ['EARLY_GO', 'EARLY_LATER', 'MAP_campus', 'MAP_gongguan', 'MAP_wenzhou', 'MAP_dorm', 'MAP_US', 'MAP_gray',
         'MAP2_campus', 'MAP2_gongguan', 'MAP2_wenzhou', 'MAP2_dorm', 'MAP2_gray', 'MAP2_gray2', 'MAP2_US']
async def main():
    run = L.Run('ux1023', OUT); base = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s（%s）' % (sid, os.environ.get('SHA', '?'))); t0 = time.time()
            if sid == 'EARLY_GO': await early(p, run, base, sid, False)
            elif sid == 'EARLY_LATER': await early(p, run, base, sid, True)
            elif sid in ('MAP_US', 'MAP2_US'): await map_us(p, run, base, sid)
            elif sid.startswith('MAP2_'): await map2_zone(p, run, base, sid, sid[5:])
            else: await map_zone(p, run, base, sid, sid[4:])
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
    run.finish()
asyncio.run(main())
