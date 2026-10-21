"""BB（帳號 A）2026-10-21：UX-GROUP-NOTICE-1018（LAWWW 20:11：答應活動時提示「排進行程…時間到會跳出『出發』」；使用者「河濱烤肉有看到通知但不知道怎麼去」）
＋BB218-P3 ②（手機開著時提示條在下面、不蓋分頁列——這裡是真的提示，不是 GAME.toast 叫出來的）。
[前置] 使用者 9/25 存檔改到 2025-10-01（三）20:50 宿舍。之後照玩家：等 21:00 阿哲「週六中秋烤肉。河濱，下午三點。」→ 手機 → 那個對話 → 按「去。」
→ 看提示（字、位置、有沒有蓋住手機分頁）→ 收起手機 → 每天晚上去床邊睡 → 10/4 14:45 左右跳出「出發」→ 出發 → 中秋烤肉。
不是 iPhone 實機：Playwright Chromium（SwiftShader）手機橫向模擬、?turbo。
用法：LW_TESTS=<開發分支>/tests python3 groupnotice_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = os.environ.get('SCEN', '').split(',') if os.environ.get('SCEN') else None
SNAP = """(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day); return {key:d.key, h:+G.hour.toFixed(2), zone:G.zone, hud:(document.getElementById('clockT')||{}).textContent||''}; })()"""
bad = []; rep = []; results = []
def say(*a):
    s = ' '.join(str(x) for x in a); print(s, flush=True); rep.append(s)
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[]; if(GAME.titleCard&&!GAME.titleCard.__bb){ const tc=GAME.titleCard; const f=function(t,s){ try{ window.__LOG.push({n:'CARD',t:'CARD:'+t+(s?'｜'+s:''), h:+GAME.G.hour.toFixed(2), d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} return tc.apply(this,arguments); }; f.__bb=1; GAME.titleCard=f; } const o=ADV.log; ADV.log=function(n,t){ try{ window.__LOG.push({n:n||'',t:String(t), h:+GAME.G.hour.toFixed(2), d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} return o.apply(this,arguments); };
  const oc=ADV.cg; ADV.cg=function(id){ try{ window.__LOG.push({n:'CG',t:'CG:'+id, h:+GAME.G.hour.toFixed(2), d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} return oc.apply(this,arguments); }; })()"""
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
        want = next((v for k, v in rules.items() if k != '*' and m['id'].startswith(k)), None)
        if want is None and '*' in rules: want = next((w for w in rules['*'] if any(o.startswith(w) for o in m['opts'])), None)   # 不知道 ask id：照選項的字回
        if want is None: continue
        k = next((i for i, t in enumerate(m['opts']) if t.startswith(want)), None)
        if k is None: say('   手機：%s 沒有「%s」選項（%s）' % (m['id'], want, m['opts'])); bad.append('%s 沒有選項「%s」' % (m['id'], want)); rules.pop(next((kk for kk in rules if kk != '*' and m['id'].startswith(kk)), None), None); continue
        if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
        await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"msg\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(700)
        c = await pg.evaluate("(th=>{ const e=[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===th); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(m['th']))
        if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900)
        c = await pg.evaluate("(a=>{ const e=[...document.querySelectorAll('#phoneBody [data-ask]')].find(b=>b.dataset.ask===a); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim()]; })(%s)" % json.dumps('%s|%d' % (m['id'], k)))
        if not c: say('   手機：找不到 %s 的按鈕' % m['id']); bad.append('手機介面找不到 %s「%s」的按鈕' % (m['id'], want)); continue
        await L.touch_tap(cdp, c[0], c[1]); say('   手機回覆 %s：「%s」（訊息「%s」）' % (m['id'], c[2], m['text'][:20])); await pg.wait_for_timeout(1200)
        rules.pop(next((kk for kk in rules if kk != '*' and m['id'].startswith(kk)), None), None); done = True
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
    if sc['key'].startswith('TERMEND:'):
        w = await pg.evaluate("TERMEND.windowOf(%s)" % json.dumps(sc['key'].split(':')[1])); d = w['from']
        sc['key'] = await pg.evaluate("CALENDAR.dateOf(%d).key" % d); sc['_te_to'] = await pg.evaluate("CALENDAR.dateOf(%d).key" % w['to'])
    elif sc['key'].startswith('TERMDAY:'):
        _, tid, wk, wd = sc['key'].split(':'); d = await pg.evaluate("STORY.termDay(%s,%s,%s)" % (json.dumps(tid), wk, wd))
        sc['key'] = await pg.evaluate("CALENDAR.dateOf(%d).key" % d)
    else: d = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(sc['key']))
    G.update({'day': d, 'hour': sc['h'], 'zone': sc.get('zone', 'dorm'), 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    fl = {}
    for k, key in (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03')):
        dd = await pg.evaluate("STORY.dayOfKey('%s')" % key)
        if dd <= d: fl[k] = dd
    if 'ROOM_Y4' in fl: fl.update({'ROOM_Y4_ITEMS': [], 'BOX_KEPT_Y4': None})
    fl.update(sc.get('flags', {})); G['flags'].update(fl)
    for k, v in sc.get('gset', {}).items(): G[k] = (d if v == '$DAY' else v) if not isinstance(v, dict) else {kk: (d if vv == '$DAY' else vv) for kk, vv in v.items()}
    await L.load_state(pg, G); await pg.wait_for_timeout(5000)
    await pg.evaluate(HOOK); await pg.evaluate('window.__LOG=[]; window.__M0=GAME.G.money')
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
  o.money=(GAME.G.money|0)-(window.__M0|0); o.fade=(()=>{ const f=document.getElementById('fade'); return f?getComputedStyle(f).opacity:'?'; })(); return o; })(%s)"""
async def verify(pg, run, sc):
    a = {'flags': sc.get('cflags', []), 'mem': sc.get('cmem', []), 'npcs': sc.get('cnpcs', []), 'once': sc.get('once', sc.get('want', []))}
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
    if 'dmoney' in sc and o['money'] != sc['dmoney']: probs.append('錢變了 %+d（應該 %+d）' % (o['money'], sc['dmoney']))
    for seq in sc.get('seq', []):   # 這幾句要連著出現（中間不夾別句）
        L0 = o['lines']; ok = any(L0[i:i + len(seq)] == seq for i in range(len(L0)))
        if not ok: probs.append('沒有連著出現：%s' % ' → '.join(s[:12] for s in seq))
    ctx = sc.get('ctx')   # 補的句子前後各兩句一起列出來（看接得順不順）
    if ctx:
        L0 = o['lines']; i = next((k for k, t in enumerate(L0) if ctx in t), None)
        say('   前後文：%s' % (json.dumps(L0[max(0, i - 2):i + 4], ensure_ascii=False) if i is not None else '（沒有出現）'))
    say('   台詞（%d 句，最後 10）：%s' % (len(o['lines']), json.dumps(o['lines'][-10:], ensure_ascii=False)))
    say('   說話的人：%s｜手機最後 6：%s' % (o['speakers'], json.dumps(o['msgTexts'][-6:], ensure_ascii=False)))
    say('   旗標 %s｜記憶 %s｜群組 %s｜人物 %s｜玩家 %s %s' % (json.dumps(o['flags'], ensure_ascii=False), json.dumps(o['mem'], ensure_ascii=False), json.dumps(o['grp'], ensure_ascii=False), json.dumps(o['npcs'], ensure_ascii=False), o['zone'], o['pl']))
    await run.shot(pg, 'ev_' + sc['id'])
    st = 'PASS' if not probs else 'FAIL'; say('[%s] %s %s' % (st, sc['id'], '；'.join(probs)))
    results.append({'id': sc['id'], 'ok': not probs, 'probs': probs, 'o': {k: o[k] for k in ('flags', 'mem', 'grp', 'npcs', 'speakers', 'zone', 'money')}, 'lines': o['lines'], 'msgs': o['msgTexts'][-12:]})
    if probs: bad.extend('%s：%s' % (sc['id'], p) for p in probs)

GRP = "PHONE.join(G,'noodle_team','麵店團');"
SENT = []
async def jump(pg, run, key, h):
    await pg.evaluate("(([k,h])=>{ const G=GAME.G; G.day=STORY.dayOfKey(k); G.hour=h; G.weekday=CALENDAR.dateOf(G.day).wd%%7; GAME.E.hour=h; if(GAME.updateHUD) GAME.updateHUD(); })(%s)" % json.dumps([key, h]))
    run.setup('[捷徑] 跳到 %s %.2f（同一個頁面）' % (key, h)); await pg.wait_for_timeout(2500)
async def untilkd(pg, cdp, run, key, h, sc, secs=2400):
    """照玩家一路過日子到 key h：有對話、選項就處理（出發），有要回的照 asks，晚上去床邊睡，白天讓時間走"""
    t0 = time.time()
    while time.time() - t0 < secs:
        sn = await pg.evaluate(SNAP)
        if (sn['key'], sn['h']) >= (key, h): return True
        s = await L.state(pg)
        if s['dlg'] or s['choices'] or s['busy']: await drain(pg, cdp, pref=sc.get('pref', []) + ['出發', '接起來'], secs=240); continue
        if sc.get('asks') and await answer(pg, cdp, sc['asks']): continue
        if await phone_open(pg): await close_phone(pg)
        if sn['h'] >= 22.5 or (sn['key'] < key and sn['h'] >= 21.0): await sleep_bed(pg, cdp, run); continue
        await pg.wait_for_timeout(2500)
    say('   ⚠ 等不到 %s %.2f（現在 %s）' % (key, h, json.dumps(await pg.evaluate(SNAP), ensure_ascii=False))); bad.append('%s：等不到 %s %.2f' % (sc['id'], key, h)); return False
async def tap_js(pg, cdp, js):
    c = await pg.evaluate("(()=>{ const e=(%s); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.textContent||'').trim()]; })()" % js)
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1000); return c[2]
async def sendmsg(pg, cdp, run, sc, pid, topic, sub=None):
    """主動傳訊息（照玩家：手機 →「人」→ 那個人的「訊息」→「傳訊息」→ 話題）；記下送之前 G.msgs 的長度，之後看回覆"""
    if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    await tap_js(pg, cdp, "document.querySelector('#phoneTabs button[data-ptab=\"friends\"]')")
    ok = await tap_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-msg]')].find(b=>b.dataset.msg===%s)" % json.dumps(pid))
    if not ok: say('   ⚠ 手機「人」沒有 %s 的「訊息」按鈕' % pid); bad.append('%s：手機「人」沒有 %s 的「訊息」' % (sc['id'], pid)); await close_phone(pg); return
    head = await pg.evaluate("((document.querySelector('#phoneBody .thHead')||{}).innerText||'').replace(/\\n/g,'｜')")
    if not await tap_js(pg, cdp, "document.querySelector('#phoneBody [data-msgto=%s]')" % json.dumps(pid)):
        say('   ⚠ %s 沒有「傳訊息」（%s）' % (pid, head)); bad.append('%s：%s 沒有「傳訊息」（%s）' % (sc['id'], pid, head)); await close_phone(pg); return
    tops = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-msgt]')].map(b=>b.dataset.msgt+'='+b.textContent.trim())")
    n0 = await pg.evaluate("(GAME.G.msgs||[]).length")
    if not await tap_js(pg, cdp, "document.querySelector('#phoneBody [data-msgt=%s]')" % json.dumps(pid + '|' + topic)):
        say('   ⚠ %s 沒有話題 %s（%s）' % (pid, topic, tops)); bad.append('%s：%s 沒有話題 %s（%s）' % (sc['id'], pid, topic, tops)); await close_phone(pg); return
    if sub: await tap_js(pg, cdp, "document.querySelector('#phoneBody [data-msgt=%s]')" % json.dumps(pid + '|share|' + sub))
    sn = await pg.evaluate(SNAP); SENT.append({'sc': sc['id'], 'pid': pid, 'n0': n0, 'at': '%s %.2f' % (sn['key'], sn['h'])})
    say('   傳給 %s（%s）：話題 %s；對話串標題「%s」' % (pid, topic, tops, head)); await close_phone(pg)
async def extra_checks(pg, sc):
    msgs = await pg.evaluate("(GAME.G.msgs||[]).map((m,i)=>({i, d:CALENDAR.dateOf(m.day).key, from:m.from||'', text:String(m.text||''), th:PHONE.th(m)}))")
    for t, who in sc.get('msgFrom', []):
        got = [m['from'] for m in msgs if m['text'] == t]
        say('   「%s」是誰傳的：%s' % (t[:14], got))
        if got and any(g != who for g in got): bad.append('%s：「%s」應該是 %s 傳的（實際 %s）' % (sc['id'], t[:14], who, got))
    nm = sc.get('noMsgFrom')
    if nm:
        x = [m for m in msgs if m['from'] in nm['from'] and nm['d0'] <= m['d'] <= nm['d1']]
        say('   %s～%s 同行的人傳的訊息：%s' % (nm['d0'], nm['d1'], json.dumps([(m['d'], m['from'], m['text'][:16]) for m in x], ensure_ascii=False)))
        if x: bad.append('%s：出國那幾天同行的人還傳訊息（%d 則，例：%s「%s」）' % (sc['id'], len(x), x[0]['from'], x[0]['text'][:16]))
    for pid, nope, want in sc.get('replies', []):
        for r in [r for r in SENT if r['sc'] == sc['id'] and r['pid'] == pid]:
            rep = [m['text'] for m in msgs[r['n0']:] if m['from'] == pid][:4]
            say('   %s 回（%s 傳的）：%s' % (pid, r['at'], json.dumps(rep, ensure_ascii=False)))
            if not rep: bad.append('%s：%s 沒有回' % (sc['id'], pid))
            for t in rep:
                if any(n in t for n in nope): bad.append('%s：%s 回「%s」（不該有 %s）' % (sc['id'], pid, t[:20], nope))
            if want and rep and not any(any(w in t for w in want) for t in rep): bad.append('%s：%s 的回覆沒有 %s（%s）' % (sc['id'], pid, want, rep))
async def sleep_bed(pg, cdp, run):
    sn = await pg.evaluate(SNAP)
    if sn['h'] < 21: await set_h(pg, run, 22.0, '晚上才能睡整晚')
    bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
    if not bed or not await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床'): say('   ⚠ 走不到床'); return False
    for k in range(4):
        await close_phone(pg); await pg.wait_for_timeout(800); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        if (await L.state(pg))['choices']: break
    await drain(pg, cdp, pref=['睡到明天早上', '睡到明天', '睡覺'], secs=240); say('   睡醒：%s' % json.dumps(await pg.evaluate(SNAP), ensure_ascii=False)); return True

TOASTHOOK = """(()=>{ if(window.__TH) return; window.__TH=1; window.__TOASTS=[]; const ot=GAME.toast; GAME.toast=function(t,ms){ try{ window.__TOASTS.push({t:String(t), ms:ms||0, d:CALENDAR.dateOf(GAME.G.day).key, h:+GAME.G.hour.toFixed(2), phone:(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide'); })()}); }catch(e){} return ot.apply(this,arguments); }; })()"""
RECT = """(()=>{ const r=e=>{ if(!e) return null; const b=e.getBoundingClientRect(); return [Math.round(b.left),Math.round(b.top),Math.round(b.width),Math.round(b.height)]; };
  const t=document.getElementById('toast'), tabs=document.getElementById('phoneTabs'); const tr=r(t), tb=r(tabs); const over=(a,b)=>!!a&&!!b&&a[2]>0&&b[2]>0&&a[0]<b[0]+b[2]&&b[0]<a[0]+a[2]&&a[1]<b[1]+b[3]&&b[1]<a[1]+a[3];
  const tabsHit=tabs?[...tabs.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>{ const q=b.getBoundingClientRect(); const e=document.elementFromPoint(q.left+q.width/2,q.top+q.height/2); return e===b||b.contains(e); }):[];
  return {toast:tr, toastVis:!!t&&!t.classList.contains('hide'), toastText:t?t.textContent:'', tabs:tb, overlap:over(tr,tb), tabsClickable:tabsHit, vh:innerHeight}; })()"""


async def main():
    run = L.Run('groupnotice', OUT); base = json.load(open(SAVE, encoding='utf-8')); MID['run'] = run
    sc = dict(id='GN_bbq', key='TERMDAY:Y1S1:5:3', h=20.8, zone='dorm', flags={}, js='', pref=['出發', '直接去上課', '直接去下一堂', '坐中間的位子', '老位子'])   # 上課照玩家：直接去、坐中間（2026-10-21 第一輪選了「自己找位子」沒有走去坐，時間停在 10/2 上課）
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True); cdp_g[0] = cdp
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await load_at(pg, base, sc, run); await pg.evaluate(TOASTHOOK)
        plan0 = await pg.evaluate("(GAME.G.flags||{})._planHint|0"); say('   讀檔時 _planHint=%s（0＝第一次，提示是長的那一句）' % plan0)
        sat = await pg.evaluate("(()=>{ const d=CALENDAR.dateOf(STORY.termDay('Y1S1',5,6)); return {key:d.key, md:d.m+'/'+d.d+'（'+'日一二三四五六'[d.wd%7]+'）'}; })()"); say('   第 5 週：週三 %s、週六 %s' % (sc['key'], sat['key']))
        # 等阿哲的訊息（不自動回）
        t0 = time.time(); got = None
        while time.time() - t0 < 600:
            pend = await pg.evaluate("(()=>PHONE.pending(GAME.G).map(m=>({id:m.ask.id, th:PHONE.th(m), text:m.text, opts:m.ask.opts.map(o=>o.t)})))()")
            got = next((m for m in pend if '中秋烤肉' in m['text']), None)
            if got: break
            s = await L.state(pg)
            if s['dlg'] or s['choices'] or s['busy']: await drain(pg, cdp, pref=['出發'], secs=60); continue
            await pg.wait_for_timeout(2000)
        say('   阿哲的訊息：%s' % json.dumps(got, ensure_ascii=False))
        if not got: bad.append('10/1 21:00 沒收到阿哲的中秋烤肉訊息')
        else:
            await pg.wait_for_timeout(2500)   # 手機要不要自己打開（站著不動 1.5 秒，D103）
            if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
            await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"msg\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(800)
            await tap_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===%s)" % json.dumps(got['th']))
            k = next((i for i, t in enumerate(got['opts']) if t.startswith('去')), 0)
            t = await tap_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-ask]')].find(b=>b.dataset.ask===%s)" % json.dumps('%s|%d' % (got['id'], k)))
            say('   按了「%s」' % t); await pg.wait_for_timeout(700)
            r = await pg.evaluate(RECT); await run.shot(pg, 'answered_phone_open'); say('   提示（手機開著）：%s' % json.dumps(r, ensure_ascii=False))
            if not r['toastVis'] or '排進行程' not in (r['toastText'] or ''): bad.append('答應以後沒看到「排進行程」的提示（%s）' % r['toastText'])
            if r['toastVis'] and (r['overlap'] or not all(r['tabsClickable']) or r['toast'][1] < r['vh'] / 2): bad.append('BB218-P3 ②：手機開著時提示條蓋住分頁列或不在下面（%s）' % json.dumps(r))
            yes = await pg.evaluate("!!(GAME.G.flags||{}).BBQ_YES"); say('   按完：BBQ_YES=%s' % yes)
            if not yes: bad.append('按了「去。」但 BBQ_YES 沒有設（答案沒記到）')
            await close_phone(pg); await pg.wait_for_timeout(600); r2 = await pg.evaluate(RECT); await run.shot(pg, 'answered_phone_closed'); say('   收起手機以後：%s' % json.dumps(r2, ensure_ascii=False))
            # 收起手機以後最多再等 15 秒（遊戲每 0.5 秒的 S.tick 才排行程、才跳提示；手機開著的時候劇情的 tick 可能停著）
            t1 = time.time(); seen = None
            while time.time() - t1 < 15:
                T = await pg.evaluate("window.__TOASTS||[]"); pt = [x for x in T if '排進行程' in x['t']]
                if pt: seen = round(time.time() - t1, 1); break
                await pg.wait_for_timeout(500)
            say('   收起手機以後 %s 秒看到「排進行程」' % seen)
            if seen is not None: r3 = await pg.evaluate(RECT); await run.shot(pg, 'plan_toast_after_close'); say('   那時候的提示：%s' % json.dumps(r3, ensure_ascii=False))
        T = await pg.evaluate("window.__TOASTS||[]"); pt = [x for x in T if '排進行程' in x['t']]
        say('   排進行程的提示：%s' % json.dumps(pt, ensure_ascii=False))
        want = sat['md'] + ' 15:00　中秋烤肉'
        if not pt: bad.append('沒有「排進行程」的提示')
        elif not any(want in x['t'] for x in pt): bad.append('提示的日子、時間、活動不對：%s（應該有「%s」）' % (pt[0]['t'], want))
        elif plan0 == 0 and not any('時間到會跳出「出發」' in x['t'] for x in pt): bad.append('第一次答應，提示沒說「時間到會跳出『出發』」：%s' % pt[0]['t'])
        plan = await pg.evaluate("(()=>{ const o=typeof OUT!=='undefined'&&OUT.get?OUT.get(GAME.G,'bbq'):null; return o?{day:CALENDAR.dateOf(o.day).key,h:o.h,place:o.place,title:o.title}:null; })()"); say('   行程：%s' % json.dumps(plan, ensure_ascii=False))
        # 手機「今天」看得到嗎（10/1 看的是今天，烤肉在 10/4——提示說「手機的『今天』也看得到」：當天才看）；照玩家過三天
        # ONLY_TOAST=1：只看答應以後的提示（不過三天、不出發）
        ok = False if os.environ.get('ONLY_TOAST') else await untilkd(pg, cdp, run, sat['key'], 14.5, sc, secs=2400)
        if ok:
            await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
            await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"today\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(800)
            today = await pg.evaluate("((document.getElementById('phoneBody')||{}).innerText||'').replace(/\\n/g,'｜')"); await run.shot(pg, 'today_1004'); await close_phone(pg)
            say('   %s 手機「今天」：%s' % (sat['key'], today[:300]))
            if '烤肉' not in today and '河濱' not in today: bad.append('%s 手機「今天」沒有中秋烤肉（%s）' % (sat['key'], today[:120]))
        # 等「出發」、出發、演完
        if not os.environ.get('ONLY_TOAST'): await play_until(pg, cdp, run, 18.5, sc, secs=900)
        lines = await pg.evaluate("(window.__LOG||[]).map(x=>x.d+' '+x.h+' '+(x.n?x.n+'：':'')+x.t)")
        bbq = [l for l in lines if '中秋節前的河濱' in l]; say('   烤肉那一場：%s' % json.dumps(bbq[:2], ensure_ascii=False))
        done = await pg.evaluate("!!((GAME.G.events||{}).done||{}).ev_mid_autumn_bbq")
        if not done and not os.environ.get('ONLY_TOAST'): bad.append('%s 中秋烤肉沒有演（出發沒跳出來或沒出發）' % sat['key'])
        if errs: bad.append('JS 例外 %s' % json.dumps(errs[:2], ensure_ascii=False)[:200])
        T = await pg.evaluate("window.__TOASTS||[]")
        json.dump({'toasts': T, 'plan': plan, 'bad': bad, 'rep': rep, 'lines': lines[-60:]}, open(os.path.join(OUT, 'groupnotice.json'), 'w'), ensure_ascii=False, indent=1)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass
    print('問題：'); [print('   -', x) for x in bad]
    run.check('UX-GROUP-NOTICE：答應中秋烤肉 → 提示「排進行程…時間到會跳出出發」→ 10/4 出發、烤肉有演；手機開著時提示不蓋分頁（BB218-P3 ②）', not bad, json.dumps(bad[:6], ensure_ascii=False))
    run.finish()
asyncio.run(main())
