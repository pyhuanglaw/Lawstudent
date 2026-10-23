"""BB-B 2026-10-23：LAWWW-B 11:18 清單 BB_SIS_B6_1023.md 第 35、36 項（開發分支 8282335af）——使用者直接要的兩項。
  EARLY_GO     第 35 項 校外約會提早出發（UX-INV-GO-1023）：15:00 出發的約會，14:00 以後在 3D 地圖上跳出「手機｜提醒：15:00，你約了…去…。」＋「現在出發」／「到時間再說」；
               選「現在出發」＝轉場、到的時候是約好的時間（出發時間＋車程）、約會照常演
  EARLY_LATER  同上選「到時間再說」＝不再問，15:00 照舊問「出發／改時間／今天不去了」
  MAP_<zone>   第 36 項 手機「地點」的地圖（UX-PHONE-MAP-1023）：手機直向 390×844，在校園、公館、溫州街、宿舍各開一次——
               地圖在最上面、紅點在你所在的地方、圖釘的字有沒有疊、圖釘手指點不點得到（透明圓的大小、和旁邊的圖釘重不重疊）、
               點圖釘＝變藍＋下面列出地點（霖澤館＝霖澤館前、大廳、201 教室）、再點一次收起來、沒去過的灰色沒有按鈕、按「前往」照常快速前往
  MAP_US       美國：沒有地圖只有清單
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
  return {svg:true, svgRect:sr, pins, areaText, red, list:[...body.querySelectorAll('.item')].slice(1,3).map(x=>x.innerText.slice(0,300)), buttons:[...body.querySelectorAll('[data-place]')].length}; })()"""

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

MAPZ = {'campus': ('2025-10-08', 14.0, 'campus', None), 'gongguan': ('2025-10-08', 14.0, 'gongguan', None), 'wenzhou': ('2025-10-08', 14.0, 'wenzhou', None), 'dorm': ('2025-10-08', 14.0, 'dorm', None)}

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

ORDER = ['EARLY_GO', 'EARLY_LATER', 'MAP_campus', 'MAP_gongguan', 'MAP_wenzhou', 'MAP_dorm', 'MAP_US']
async def main():
    run = L.Run('ux1023', OUT); base = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s（%s）' % (sid, os.environ.get('SHA', '?'))); t0 = time.time()
            if sid == 'EARLY_GO': await early(p, run, base, sid, False)
            elif sid == 'EARLY_LATER': await early(p, run, base, sid, True)
            elif sid == 'MAP_US': await map_us(p, run, base, sid)
            else: await map_zone(p, run, base, sid, sid[4:])
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
    run.finish()
asyncio.run(main())
