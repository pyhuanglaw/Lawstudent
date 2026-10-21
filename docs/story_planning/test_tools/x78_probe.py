"""BB：X78 法律系的課搬教室（萬才館多功能教室、霖澤館 202）＋第二批「大二下～大四每學期真的有事件可玩」瀏覽器驗收（AA_314 事件包一；1C 群戲、1B-19）。
每個情境：[前置] 用使用者 9/25 存檔改日期／旗標（讀檔用遊戲自己的 applySave）→ 遊戲時間照走（必要時 [捷徑] 把時鐘撥到觸發前幾分鐘）→
台詞（ADV.log 全部記下來）、手機訊息、要回覆的訊息用手機介面點 → 出遊用「出發」選單 → 檢查台詞、旗標、記憶；沒參加的版本檢查「沒有」。
不是 iPhone 實機：Playwright Chromium（SwiftShader）手機橫向模擬、?turbo。"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = os.environ.get('SCEN', '').split(',') if os.environ.get('SCEN') else None
SNAP = """(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day); return {key:d.key, h:+G.hour.toFixed(2), zone:G.zone, hud:(document.getElementById('clockT')||{}).textContent||''}; })()"""
bad = []; rep = []; results = []
def say(*a):
    s = ' '.join(str(x) for x in a); print(s, flush=True); rep.append(s)
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[]; const s0=GAME.say; GAME.say=function(w,t){ try{ window.__LOG.push({n:(w&&w.name)||'',t:String(t),h:+GAME.G.hour.toFixed(2),d:CALENDAR.dateOf(GAME.G.day).key,src:'say'}); }catch(e){} return s0.apply(this,arguments); }; const o=ADV.log; ADV.log=function(n,t){ try{ window.__LOG.push({n:n||'',t:String(t), h:+GAME.G.hour.toFixed(2), d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} return o.apply(this,arguments); }; })()"""
async def drain(pg, cdp, pref=None, secs=120):
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s['choices']:
            c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; let e=null; for(const t of w){ e=bs.find(x=>x.textContent.trim().includes(t)); if(e) break; } e=e||bs.find(x=>/不|晚一點|之後/.test(x.textContent))||bs[bs.length-1]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,30),bs.map(b=>b.textContent.trim().slice(0,20))]; })(%s)" % json.dumps(pref or []))
            await L.touch_tap(cdp, c[0], c[1]); say('   ▶', c[2], '（選項：%s）' % ' / '.join(c[3]))
            await pg.wait_for_timeout(900); continue
        if s['dlg']:
            if MID['n'] < 3 and MID['run'] and any(k in (s.get('dtext') or '') for k in MID['keys']):
                MID['n'] += 1; await MID['run'].shot(pg, 'mid_%s_%d' % (MID['id'], MID['n']))
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if s['busy']: await pg.wait_for_timeout(600); continue
        if await phone_open(pg): await close_phone(pg); continue
        await pg.wait_for_timeout(1000); s = await L.state(pg)
        if not (s['dlg'] or s['choices'] or s['busy']): return True
    return False
async def phone_open(pg):
    return await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide')&&getComputedStyle(p).display!=='none'; })()")
async def close_phone(pg):
    await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b) b.click(); })()"); await pg.wait_for_timeout(500)
async def answer(pg, cdp, rules):
    """要回覆的訊息：打開手機 → 訊息 → 點那個對話串 → 點選項（照玩家）。rules：{ask id 前綴: 選項開頭}"""
    pend = await pg.evaluate("(()=>PHONE.pending(GAME.G).map(m=>({id:m.ask.id, th:PHONE.th(m), text:m.text, opts:m.ask.opts.map(o=>o.t)})))()")
    done = False
    for m in pend:
        want = next((v for k, v in rules.items() if m['id'].startswith(k)), None)
        if want is None: continue
        k = next((i for i, t in enumerate(m['opts']) if t.startswith(want)), None)
        if k is None: say('   手機：%s 沒有「%s」選項（%s）' % (m['id'], want, m['opts'])); bad.append('%s 沒有選項「%s」' % (m['id'], want)); rules.pop(next(kk for kk in rules if m['id'].startswith(kk))); continue
        if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
        await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"msg\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(700)
        c = await pg.evaluate("(th=>{ const e=[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===th); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(m['th']))
        if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900)
        c = await pg.evaluate("(a=>{ const e=[...document.querySelectorAll('#phoneBody [data-ask]')].find(b=>b.dataset.ask===a); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim()]; })(%s)" % json.dumps('%s|%d' % (m['id'], k)))
        if not c: say('   手機：找不到 %s 的按鈕' % m['id']); bad.append('手機介面找不到 %s「%s」的按鈕' % (m['id'], want)); continue
        await L.touch_tap(cdp, c[0], c[1]); say('   手機回覆 %s：「%s」（訊息「%s」）' % (m['id'], c[2], m['text'][:20])); await pg.wait_for_timeout(1200)
        rules.pop(next(kk for kk in rules if m['id'].startswith(kk)), None); done = True
    if await phone_open(pg): await close_phone(pg)
    return done
async def set_h(pg, run, h, why):
    await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; if(GAME.updateHUD) GAME.updateHUD(); })(%s)" % h); run.setup('[捷徑] 時鐘撥到 %.2f（%s）' % (h, why)); await pg.wait_for_timeout(1500)
async def play_until(pg, cdp, run, h, sc, secs=420):
    """遊戲時間照走到 h；中間有對話照選項偏好、有要回的訊息照 rules、出遊「出發」"""
    t0 = time.time(); last = None
    while time.time() - t0 < secs:
        sn = await pg.evaluate(SNAP)
        if sn['h'] >= h: return True
        s = await L.state(pg)
        if s['dlg'] or s['choices'] or s['busy']: await drain(pg, cdp, pref=sc.get('pref', []) + ['出發', '接起來'], secs=180); continue
        if sc.get('asks') and await answer(pg, cdp, sc['asks']): continue
        if await phone_open(pg): await close_phone(pg)
        if last and sn['h'] == last['h'] and time.time() - t0 > 30: pass
        last = sn; await pg.wait_for_timeout(2500)
    say('   ⚠ 等不到 %.2f（現在 %s）' % (h, json.dumps(await pg.evaluate(SNAP), ensure_ascii=False))); return False
async def load_at(pg, base, sc, run):
    st = json.loads(json.dumps(base)); G = st.get('G', st)
    d = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(sc['key']))
    G.update({'day': d, 'hour': sc['h'], 'zone': sc.get('zone', 'dorm'), 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    fl = {}
    for k, key in (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03')):
        dd = await pg.evaluate("STORY.dayOfKey('%s')" % key)
        if dd <= d: fl[k] = dd
    if 'ROOM_Y4' in fl: fl.update({'ROOM_Y4_ITEMS': [], 'BOX_KEPT_Y4': None})
    fl.update(sc.get('flags', {})); G['flags'].update(fl)
    await L.load_state(pg, G); await pg.wait_for_timeout(5000)
    await pg.evaluate(HOOK); await pg.evaluate('window.__LOG=[]')
    if sc.get('js'): await pg.evaluate("(()=>{ const G=GAME.G, D=k=>STORY.dayOfKey(k), LV=(id,f,t,c)=>{ const r=SOCIAL.rel(id); r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); }; %s })()" % sc['js'])
    run.setup('[前置] %s：使用者 9/25 存檔改到 %s %.2f %s；旗標 %s；console：%s' % (sc['id'], sc['key'], sc['h'], sc.get('zone', 'dorm'), json.dumps(sc.get('flags', {}), ensure_ascii=False), sc.get('js', '')))
    await drain(pg, cdp_g[0], secs=60)   # 讀檔後的補演（照實記）
cdp_g = [None]
MID = {'n': 0, 'run': None, 'keys': [], 'id': ''}
CHK = """(a=>{ const G=GAME.G, F=G.flags, LOG=window.__LOG||[]; const msgs=(G.msgs||[]).map(m=>({th:PHONE.th(m), from:m.from||'', text:m.text, tag:m.tag||'', d:m.day})); const o={};
  o.lines=LOG.map(x=>x.t); o.speakers=[...new Set(LOG.map(x=>x.n).filter(Boolean))]; o.msgTexts=msgs.map(m=>m.text);
  o.flags={}; for(const k of a.flags) o.flags[k]=F[k]===undefined?'(undefined)':F[k];
  o.mem={}; for(const [id,t] of a.mem){ const M=(G.social&&G.social.mem&&G.social.mem[id])||[]; o.mem[id+'/'+t]=M.filter(m=>m.tag===t).map(m=>m.note||'(空)'); }
  o.grp=(PHONE.rec(G).groups||{}).noodle_team||null; o.npcs=GAME.E.npcs.filter(n=>n&&n.obj&&n.charId&&a.npcs.includes(n.charId)).map(n=>({id:n.charId,x:+n.obj.position.x.toFixed(1),z:+n.obj.position.z.toFixed(1),vis:n.obj.visible!==false&&!n.hidden}));
  o.pl={x:+GAME.E.player.obj.position.x.toFixed(1),z:+GAME.E.player.obj.position.z.toFixed(1)}; o.zone=G.zone; o.dup={}; const seen={}; let prev=null; for(const x of LOG){ if(prev&&prev.t===x.t&&prev.n===x.n){ prev=null; continue; } seen[x.t]=(seen[x.t]||0)+1; prev=x; }   /* 同一句 events3d 和 GM.say 各記一次（相鄰），不算重演 */ for(const t of a.once) o.dup[t]=seen[t]||0;
  o.fade=(()=>{ const f=document.getElementById('fade'); return f?getComputedStyle(f).opacity:'?'; })(); return o; })(%s)"""
async def verify(pg, run, sc):
    a = {'flags': sc.get('cflags', []), 'mem': sc.get('cmem', []), 'npcs': sc.get('cnpcs', []), 'once': sc.get('want', [])}
    o = await pg.evaluate(CHK % json.dumps(a)); txt = o['lines'] + o['msgTexts']; probs = []
    for w in sc.get('want', []):
        if not any(w in t for t in txt): probs.append('應該有「%s」，沒有' % w)
    for w in sc.get('wantMsg', []):
        if not any(w in t for t in o['msgTexts']): probs.append('手機應該有「%s」，沒有' % w)
    for w in sc.get('none', []):
        if any(w in t for t in txt): probs.append('不應該有「%s」，出現了' % w)
    for w in sc.get('noneMsg', []):
        if any(w == t for t in o['msgTexts']): probs.append('手機不應該有「%s」，出現了' % w)
    for k, v in sc.get('eqflags', {}).items():
        if o['flags'].get(k) != v: probs.append('旗標 %s=%s（應該 %s）' % (k, json.dumps(o['flags'].get(k), ensure_ascii=False), json.dumps(v, ensure_ascii=False)))
    for key, want in sc.get('eqmem', {}).items():
        got = o['mem'].get(key, [])
        if want is None and got: probs.append('沒參加卻有記憶 %s %s' % (key, got))
        if want is not None and want not in got: probs.append('記憶 %s 應該有「%s」，實際 %s' % (key, want, got))
    for t, n in o['dup'].items():
        if n > 1: probs.append('「%s」演了 %d 次' % (t[:20], n))
    if sc.get('speakers'):
        for sp in sc['speakers']:
            if not any(sp in x for x in o['speakers']): probs.append('說話的人沒有「%s」（實際：%s）' % (sp, o['speakers']))
    if sc.get('grpname') and (o['grp'] or {}).get('name') != sc['grpname']: probs.append('群組名稱「%s」（應該「%s」）' % ((o['grp'] or {}).get('name'), sc['grpname']))
    if str(o['fade']) not in ('0', '?'): probs.append('黑幕 opacity=%s 還蓋著' % o['fade'])
    say('   台詞（%d 句，最後 10）：%s' % (len(o['lines']), json.dumps(o['lines'][-10:], ensure_ascii=False)))
    say('   說話的人：%s｜手機最後 6：%s' % (o['speakers'], json.dumps(o['msgTexts'][-6:], ensure_ascii=False)))
    say('   旗標 %s｜記憶 %s｜群組 %s｜人物 %s｜玩家 %s %s' % (json.dumps(o['flags'], ensure_ascii=False), json.dumps(o['mem'], ensure_ascii=False), json.dumps(o['grp'], ensure_ascii=False), json.dumps(o['npcs'], ensure_ascii=False), o['zone'], o['pl']))
    await run.shot(pg, 'ev_' + sc['id'])
    st = 'PASS' if not probs else 'FAIL'; say('[%s] %s %s' % (st, sc['id'], '；'.join(probs)))
    results.append({'id': sc['id'], 'ok': not probs, 'probs': probs, 'o': {k: o[k] for k in ('flags', 'mem', 'grp', 'npcs', 'speakers', 'zone')}, 'lines': o['lines'], 'msgs': o['msgTexts'][-12:]})
    if probs: bad.extend('%s：%s' % (sc['id'], p) for p in probs)

FIND = """((cid,from)=>{ const G=GAME.G, d0=STORY.dayOfKey(from); for(let d=d0; d<d0+60; d++){ const its=CLS.dayItems(G,d).filter(it=>it.c.id===cid&&!it.exam); if(its.length) return {day:d, key:CALENDAR.dateOf(d).key, t0:its[0].t0, room:its[0].room.zone, name:its[0].c.name, k:its[0].key}; } return null; })"""
async def attend(pg, cdp, run, cid, label, want_zone, want_line, expect_line):
    sn = await pg.evaluate(SNAP)
    c = await pg.evaluate("(cid=>{ const it=CLS.dayItems(GAME.G).find(q=>q.c.id===cid&&!q.exam); return it?{key:it.key, t0:it.t0, zone:it.room.zone, name:it.c.name}:null; })(%s)" % json.dumps(cid))
    say('   %s 今天的課：%s（現在 %s）' % (label, json.dumps(c, ensure_ascii=False), json.dumps(sn, ensure_ascii=False)))
    if not c: bad.append('%s：今天沒有 %s' % (label, cid)); return
    if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"today\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(800)
    bt = await pg.evaluate("(k=>{ const e=[...document.querySelectorAll('#phoneBody [data-go]')].find(b=>b.dataset.go===k); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.closest('.item')||e).textContent.trim().slice(0,60)]; })(%s)" % json.dumps(c['key']))
    if not bt: bad.append('%s：手機今天沒有「直接去上課」' % label); await close_phone(pg); return
    say('   手機：%s' % bt[2]); await L.touch_tap(cdp, bt[0], bt[1]); await pg.wait_for_timeout(4000)
    t0 = time.time(); shot = False; seen = False
    while time.time() - t0 < 400:
        s = await L.state(pg)
        z = await pg.evaluate("GAME.G.zone")
        if z == want_zone and not shot: await pg.wait_for_timeout(1500); await run.shot(pg, 'x78_%s_in' % label); shot = True
        if s['dlg'] and want_line[:8] in (s.get('dtext') or ''): seen = True; await run.shot(pg, 'x78_%s_line' % label)
        if s['choices'] or s['dlg'] or s['busy']: await drain(pg, cdp, pref=['坐中間的位子', '坐'], secs=200); continue
        hh = await pg.evaluate('GAME.G.hour')
        if shot and hh > c['t0'] + 0.3: break
        await pg.wait_for_timeout(2000)
    lines = await pg.evaluate("(window.__LOG||[]).map(x=>x.t)")
    hit = any(want_line in x for x in lines); st = await pg.evaluate(SNAP)
    fl = await pg.evaluate("GAME.G.flags['ROOM_FIRST_'+%s]===true" % json.dumps(want_zone))
    say('[X78] %s：上課區域 %s（應該 %s）｜旁白「%s」出現：%s（應該 %s）｜ROOM_FIRST=%s｜台詞 %d 句，前 5：%s｜現在 %s' % (label, z, want_zone, want_line[:14], hit, expect_line, fl, len(lines), json.dumps(lines[:5], ensure_ascii=False), json.dumps(st, ensure_ascii=False)))
    if z != want_zone and not shot: bad.append('%s：沒有進 %s（現在 %s）' % (label, want_zone, z))
    if hit != expect_line: bad.append('%s：第一次上課旁白出現＝%s（應該 %s）' % (label, hit, expect_line))
    if expect_line and not fl: bad.append('%s：ROOM_FIRST 旗標沒記' % label)
CASES = [
  ('property', '2026-09-01', 'wancai_multi', '（萬才館一樓的多功能教室。椅子是可以移動的那種，大家坐得比在 201 鬆。）', 'Y2S1_物權'),
  ('securities', '2027-09-01', 'linze_202', '（二樓的 202 是平面教室。長桌一排一排，沒有階梯。坐後面也看得到黑板。）', 'Y3S1_證交法'),
]
async def main():
    run = L.Run('x78', OUT); base = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True); cdp_g[0] = cdp
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        for cid, frm, zone, line, label in CASES:
            say('== %s' % label)
            await load_at(pg, base, {'id': label, 'key': frm, 'h': 9.0, 'zone': 'dorm', 'flags': {'EXCHANGE_ROUTE': 'TW'}}, run)
            f = await pg.evaluate(FIND + "(%s,%s)" % (json.dumps(cid), json.dumps(frm)))
            say('   第一堂：%s' % json.dumps(f, ensure_ascii=False))
            if not f: bad.append('%s：找不到這門課' % label); continue
            if f['room'] != zone: bad.append('%s：課表上的教室是 %s（應該 %s）' % (label, f['room'], zone))
            # 第一次：那一天上課前 20 分鐘在宿舍
            await load_at(pg, base, {'id': label + '_1', 'key': f['key'], 'h': round(f['t0'] - 0.4, 2), 'zone': 'dorm', 'flags': {'EXCHANGE_ROUTE': 'TW'}}, run)
            await attend(pg, cdp, run, cid, label + '_第1次', zone, line, True)
            # 第二次：同一個存檔狀態接著過到下一週（[捷徑] 存目前的 G、改日期）
            g2 = await pg.evaluate("GAME.snapshot()")
            g2['day'] = f['day'] + 7; g2['hour'] = round(f['t0'] - 0.4, 2); g2['zone'] = 'dorm'; g2['pos'] = None
            g2['weekday'] = await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % g2['day'])
            await L.load_state(pg, g2); await pg.wait_for_timeout(5000); await pg.evaluate("window.__LOG=[]"); await drain(pg, cdp, secs=60)
            run.setup('[前置] %s：同一局（已上過第 1 次）改到下一週同一堂課前 24 分鐘' % label)
            await attend(pg, cdp, run, cid, label + '_第2次', zone, line, False)
        json.dump({'bad': bad, 'rep': rep}, open(os.path.join(OUT, 'x78.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
        run.check('X78 法律系的課在新教室上、第一次一句旁白', not bad, json.dumps(bad[:10], ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
    run.finish()
asyncio.run(main())
