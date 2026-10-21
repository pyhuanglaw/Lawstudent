"""BB（帳號 A）2026-10-21：AA369-HOL-FIX-1021（開發分支 8202e9b0 起；AA_369 第 6 節 BB 測試）瀏覽器驗收。框架照 us_life_probe.py。
  H1＋H4 2027 香港行（VA10）：7/20 麵店團群組以安「我那幾天在京都。你們去，拍照給我。」、排行程的兩句是柏翰；回「我也去。」→ 8/25～8/28 香港 → 交往中的以安 8/27 私訊京都車站；
          出國那幾天同行的人（阿哲、小語、柏翰）不傳訊息給你。
  H2 2028 白色情人節（台灣路線、和以安交往、2/14 沒送過）：沒有「我在臺中」、沒有說出「理由欄」。
  H5 2028 暑假以安在日本（3/25～8/5）：主動傳「在幹嘛」不回「在台中」；阿凱暑假不說「宜蘭」。
  M2 大二下期末飯（芷若）：「九月二號出發。……行李還沒開始收。」「八月底回台中。店裡的班已經交給學妹了。」
[前置] 使用者 9/25 存檔改日期、旗標、關係；[捷徑] 香港那一段從 7/20 跳到 8/24 22:00（同一個頁面，報名狀態留著）。之後都是玩家的操作（手機介面、床、出發）。
不是 iPhone 實機：Playwright Chromium（SwiftShader）手機橫向模擬、?turbo。
用法：LW_TESTS=<開發分支>/tests SHA=<sha> python3 aa369_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>（SCEN=id1,id2 只跑某幾個）"""
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
    msgs = await pg.evaluate("(GAME.G.msgs||[]).map((m,i)=>({i, d:CALENDAR.dateOf(m.day).key, h:+(+m.h||0).toFixed(2), from:m.from||m.who||'', text:String(m.text||''), th:PHONE.th(m), opts:m.ask?m.ask.opts.map(o=>o.t):null}))")
    for t, who in sc.get('msgFrom', []):
        got = [m['from'] for m in msgs if m['text'] == t]
        say('   「%s」是誰傳的：%s' % (t[:14], got))
        if got and any(g != who for g in got): bad.append('%s：「%s」應該是 %s 傳的（實際 %s）' % (sc['id'], t[:14], who, got))
    nm = sc.get('noMsgFrom')
    if nm:
        x = [m for m in msgs if m['from'] in nm['from'] and nm['d0'] <= m['d'] <= nm['d1']]
        say('   %s～%s 同行的人傳的訊息：%s' % (nm['d0'], nm['d1'], json.dumps([(m['d'], m['from'], m['text'][:16]) for m in x], ensure_ascii=False)))
        if x: bad.append('%s：出國那幾天同行的人還傳訊息（%d 則，例：%s「%s」）' % (sc['id'], len(x), x[0]['from'], x[0]['text'][:16]))
    for rp in sc.get('replies', []):
        pid, nope, want = rp[:3]; dk = rp[3] if len(rp) > 3 else None
        mine = [r for r in SENT if r['sc'] == sc['id'] and r['pid'] == pid]
        for j, r in enumerate(mine):
            if dk and not r['at'].startswith(dk): continue
            n1 = mine[j + 1]['n0'] if j + 1 < len(mine) else len(msgs)   # 只看到下一次傳給同一個人以前
            rep = [m['text'] for m in msgs[r['n0']:n1] if m['from'] == pid and m['th'] == 'p:' + pid][:6]
            say('   %s 回（%s 傳的）：%s' % (pid, r['at'], json.dumps(rep, ensure_ascii=False)))
            if not rep: bad.append('%s：%s 沒有回' % (sc['id'], pid))
            for t in rep:
                if any(n in t for n in nope): bad.append('%s：%s 回「%s」（不該有 %s）' % (sc['id'], pid, t[:20], nope))
            if want and rep and not any(any(w in t for w in want) for t in rep): bad.append('%s：%s 的回覆沒有 %s（%s）' % (sc['id'], pid, want, rep))
    for t, dk, h0, h1 in sc.get('msgAt', []):   # 這一則在那一天的 h0～h1 之間收到
        got = [(m['d'], m['h']) for m in msgs if m['text'] == t]
        say('   「%s」收到：%s' % (t[:16], got))
        if not any(d == dk and h0 <= h <= h1 for d, h in got): bad.append('%s：「%s」應該 %s %.2f～%.2f 收到（實際 %s）' % (sc['id'], t[:16], dk, h0, h1, got))
    for t in sc.get('onceMsg', []):
        n = sum(1 for m in msgs if m['text'] == t)
        if n != 1: bad.append('%s：「%s」收到 %d 次（應該一次）' % (sc['id'], t[:16], n))
    for th, d0, d1, texts in sc.get('noneBetween', []):
        x = [(m['d'], m['h'], m['text']) for m in msgs if m['th'] == th and d0 <= m['d'] <= d1 and any(m['text'] == t for t in texts)]
        if x: bad.append('%s：%s～%s %s 不應該有 %s' % (sc['id'], d0, d1, th, json.dumps(x[:3], ensure_ascii=False)))
    if sc.get('dumpTh'):
        th, d0, d1 = sc['dumpTh']
        say('   %s %s～%s：' % (th, d0, d1)); [say('     %s %05.2f %s%s' % (m['d'], m['h'], m['text'][:40], '　［' + '／'.join(m['opts']) + '］' if m['opts'] else '')) for m in msgs if m['th'] == th and d0 <= m['d'] <= d1]
    for oid, dk, h in sc.get('outing', []):
        o = await pg.evaluate("(id=>{ const q=OUT.get(GAME.G,id); return q?{d:CALENDAR.dateOf(q.day).key,h:q.h,title:q.title,place:q.place,state:q.state}:null; })(%s)" % json.dumps(oid))
        say('   行程 %s：%s' % (oid, json.dumps(o, ensure_ascii=False)))
        if not o or o['d'] != dk or abs(o['h'] - h) > 0.01: bad.append('%s：行程 %s 應該 %s %.2f（實際 %s）' % (sc['id'], oid, dk, h, json.dumps(o, ensure_ascii=False)))
    for oid in sc.get('noOuting', []):
        o = await pg.evaluate("(id=>{ const q=OUT.get(GAME.G,id); return q?{d:CALENDAR.dateOf(q.day).key,h:q.h,title:q.title}:null; })(%s)" % json.dumps(oid))
        if o: bad.append('%s：不應該有行程 %s（%s）' % (sc['id'], oid, json.dumps(o, ensure_ascii=False)))
SCENS = [
  # H1＋H4：2027 香港行（VA10）
  dict(id='H1_va10', key='2027-07-20', h=20.8, zone='dorm', flags={'EXCHANGE_ROUTE': 'TW'}, js=GRP + "LV('heroine_01',70,60,60); G.flags.dating_heroine_01=true;",
       steps=[('until', 21.4), ('jump', '2027-08-24', 22.0), ('sleep',), ('untilkd', '2027-08-28', 22.5)], asks={'*': ['我也去。']}, pref=['出發', '去'],
       wantMsg=['我那幾天在京都。你們去，拍照給我。', '行程我來排？', '……好。我只排第一天。', '📷（京都車站的月台）', '明天回去。……香港好玩嗎？'],
       noneMsg=['可以。行程我來排？'], none=['……下次只有我們兩個的時候，我再排。'],
       msgFrom=[('行程我來排？', 'classmate_bohan'), ('……好。我只排第一天。', 'classmate_bohan'), ('我那幾天在京都。你們去，拍照給我。', 'heroine_01')],
       noMsgFrom={'from': ['zhe', 'yu', 'classmate_bohan'], 'd0': '2027-08-25', 'd1': '2027-08-27'}, cflags=['dating_heroine_01']),
  # H2：2028 白色情人節（台灣路線、和以安交往、2/14 沒送過）
  dict(id='H2_whiteday', key='2028-03-13', h=20.8, zone='dorm', flags={'EXCHANGE_ROUTE': 'TW'}, js="LV('heroine_01',70,60,60); G.flags.dating_heroine_01=true;",
       steps=[('until', 21.4), ('sleep',), ('untilkd', '2028-03-14', 19.6)], pref=['出發', '去'],
       wantMsg=['明天傍晚六點，公館。'], want=['二月十四號那天，我在讀書。……你也沒說什麼。', '所以這個不是回禮。……是我自己想送的。'], none=['我在臺中', '理由欄我寫了'], cflags=['AN_VDAY_GIFT']),
  # H5：2028 暑假以安在日本（3/25～8/5）；阿凱
  dict(id='H5_summer', key='2028-07-15', h=14.0, zone='dorm', flags={'EXCHANGE_ROUTE': 'TW'}, js="LV('heroine_01',45,35,35); LV('kai',45,35,35);",
       steps=[('sendmsg', 'heroine_01', 'chat'), ('sendmsg', 'kai', 'chat'), ('until', 23.7), ('sleep',), ('until', 12.0)],
       replies=[('heroine_01', ['台中'], ['日本']), ('kai', ['宜蘭'], [])], cflags=[]),
  # M2：大二下期末飯（芷若）
  dict(id='M2_termend', key='TERMEND:Y2S2', h=19.5, zone='dorm', flags={}, js="LV('heroine_02',45,35,35); G.termend=G.termend||{}; G.termend.contact=G.termend.contact||{}; G.termend.contact.Y2S2={heroine_02:{pts:9,k:{}}};",
       steps=[('until', 21.0), ('untilkd', 'TE_TO', 22.0)], asks={'*': ['好', '可以', '「好', '走', '']}, pref=['出發', '去', '好'],
       want=['九月二號出發。……行李還沒開始收。', '八月底回台中。店裡的班已經交給學妹了。'], none=['九月三號出發', '暑假在台中，店裡的班先排給學妹'], cflags=[]),
]
# ---- AA_369 第 8 節（73ce13de；LAWWW 21:04 第 5 項「跑寒暑假的時候一起看」）。opt＝只在 SCEN 指定時跑。條件、日期照子代理對程式（BB 21:3x）----
ZR_SHIFT = ['下班了。今天放的是一部老片的原聲帶。', '有個客人點了你都點的那杯。……我差點以為是你。', '📷（Café 打烊後的吧台）', '店裡很安靜。……我有點不習慣。', '今天店裡放的歌，你應該會喜歡。……回來放給你聽。', '你回來那天我早班。下班去找你。']
YT_SHOP = ['今天店裡很忙', '阿姨問你什麼時候回來', '📷（一碗加蛋的乾麵）', '不是你的 是客人的', '今天店裡來了一個修鞋的阿伯', '他講了四十分鐘', '阿姨說你不在 店裡的蛋用得比較少', '收店了', '好累', '今天下雨 沒什麼客人', '📷（麵店的鍋子）', '今天也有開']
YT_CLOSE = ['店休第一天，我睡到十點。……阿姨說我很難得。', '店休。阿姨叫我去迪化街買年貨。人好多。', '今天在家幫阿姨包餃子。我包的都站不起來。']
AN_OLD = ['明天見。……我是說，明天有空的話。', '明天下午三點，總圖門口。', '時差調不過來的話，四點也可以。', '📷（高鐵窗外的田）', '回台中了。8 號回去。']
SIGN = "G.flags.VAC_%s_APP=true; VAC.signup(G,'%s','yes');"
SCENS += [
  # 1 小語在營隊（2026-07-06～07-18）／對照 7/25 在家
  dict(id='S8_yu', opt=True, key='2026-07-10', h=14.8, zone='dorm', js="LV('yu',45,35,35); INV.addContact(G,'yu'); { const R=MSG.rec(G); (R.rot||(R.rot={}))['say:chat']=0; }",
       steps=[('until', 15.0), ('sendmsg', 'yu', 'chat'), ('until', 15.25), ('jump', '2026-07-25', 14.9), ('until', 15.0), ('sendmsg', 'yu', 'chat'), ('until', 15.25)],
       replies=[('yu', ['在家耍廢'], ['在營隊', '小朋友好吵', '我好累'], '2026-07-10'), ('yu', ['在營隊', '小朋友好吵'], ['在家耍廢'], '2026-07-25')], cflags=[]),
  # 1 方奕廷在山上（07-06～07-19）：7/20 15:00 才回
  dict(id='S8_fy', opt=True, key='2027-07-10', h=14.8, zone='dorm', js="LV('npc_fangyt',45,35,35); INV.addContact(G,'npc_fangyt'); { const R=MSG.rec(G); (R.rot||(R.rot={}))['say:chat']=0; }",
       steps=[('until', 15.0), ('sendmsg', 'npc_fangyt', 'chat'), ('until', 15.5), ('noreply', 'npc_fangyt'), ('jump', '2027-07-19', 22.0), ('wait', 8), ('noreply', 'npc_fangyt'), ('jump', '2027-07-20', 14.9), ('until', 15.25)],
       replies=[('npc_fangyt', ['在宿舍，剛洗完衣服。', '在吃飯。'], ['下山了，剛看到。'], '2027-07-10')],
       msgAt=[('下山了，剛看到。', '2027-07-20', 15.0, 15.2), ('這是山上的苔。', '2027-07-20', 15.0, 15.2)], cflags=[]),
  # 2 以安：交往中、玩家去首爾（C08@Y1 真的出發、回來）→ 7/25 15:00 一則；7/24 晚上沒有舊的約
  dict(id='S8_an_d', opt=True, key='2026-07-13', h=6.6, zone='dorm', js="LV('heroine_01',70,60,60); G.flags.dating_heroine_01=true; " + SIGN % ('C08', 'C08@Y1'),
       steps=[('untilkd', '2026-07-25', 15.3)], pref=['出發'],
       msgAt=[('你回來了。我今天回台中，八號回臺北。……到時候再約。', '2026-07-25', 15.0, 15.1)], noneBetween=[('p:heroine_01', '2026-07-24', '2026-07-25', AN_OLD)],
       noOuting=['vac_C08@Y1_re_heroine_01'], dumpTh=('p:heroine_01', '2026-07-13', '2026-07-25'), cflags=['dating_heroine_01']),
  # 2 以安：沒交往（熟）→ 7/25 15:00 高鐵照片兩則、沒有交往版那一句
  dict(id='S8_an_f', opt=True, key='2026-07-25', h=14.8, zone='dorm', js="LV('heroine_01',25,15,15);",
       steps=[('until', 15.3)], msgAt=[('📷（高鐵窗外的田）', '2026-07-25', 15.0, 15.1), ('回台中了。8 號回去。', '2026-07-25', 15.0, 15.1)],
       noneMsg=['你回來了。我今天回台中，八號回臺北。……到時候再約。'], cflags=[]),
  # 3a 語彤：交往中、玩家去東京（C11@Y3：2028-01-17～01-30）→ 店休三句各一次、店休那幾天沒有店裡的話、1/29 乾麵照片、1/30 留一碗
  dict(id='S8_yt28', opt=True, key='2028-01-17', h=6.6, zone='dorm', js="LV('heroine_03',70,60,60); G.flags.dating_heroine_03=true; " + SIGN % ('C11', 'C11@Y3'),
       steps=[('untilkd', '2028-01-30', 18.6)], pref=['出發'],
       msgAt=[(YT_CLOSE[0], '2028-01-19', 22.45, 22.55), (YT_CLOSE[1], '2028-01-20', 22.95, 23.05), (YT_CLOSE[2], '2028-01-21', 22.45, 22.55), ('📷（一碗加蛋的乾麵）', '2028-01-29', 22.45, 22.55), ('阿姨說幫你留一碗', '2028-01-30', 14.95, 15.05)],
       onceMsg=YT_CLOSE, noneBetween=[('p:heroine_03', '2028-01-19', '2028-01-28', YT_SHOP)], dumpTh=('p:heroine_03', '2028-01-17', '2028-01-30'), cflags=['dating_heroine_03']),
  # 3b 語彤 2027 對照（C11@Y2：沒有店休那三句；1/23 鍋子照片；1/30「店休。阿姨說等開店，第一碗留給你。」、沒有「阿姨說幫你留一碗」）
  dict(id='S8_yt27', opt=True, key='2027-01-17', h=6.6, zone='dorm', js="LV('heroine_03',70,60,60); G.flags.dating_heroine_03=true; " + SIGN % ('C11', 'C11@Y2'),
       steps=[('untilkd', '2027-01-30', 18.6)], pref=['出發'],
       msgAt=[('📷（麵店的鍋子）', '2027-01-23', 22.45, 22.55), ('店休。阿姨說等開店，第一碗留給你。', '2027-01-30', 14.95, 15.05)],
       noneMsg=YT_CLOSE + ['阿姨說幫你留一碗'], dumpTh=('p:heroine_03', '2027-01-17', '2027-01-30'), cflags=['dating_heroine_03']),
  # 4a 芷若：交往中、玩家去首爾（C08@Y2：2027-07-13～07-24）→ 出國那幾天沒有 Café 上班的句子；7/24 21:00「……這次是當客人。來嗎？」、7/25 15:00 行程
  dict(id='S8_zr', opt=True, key='2027-07-13', h=6.6, zone='dorm', js="LV('heroine_02',70,60,60); G.flags.dating_heroine_02=true; " + SIGN % ('C08', 'C08@Y2'),
       steps=[('untilkd', '2027-07-24', 21.3)], pref=['出發'],
       msgAt=[('回來了喔？明天下午我在 Café。……這次是當客人。來嗎？', '2027-07-24', 20.95, 21.05)], noneMsg=['明天我九點下班。', '……你來的話，我晚一點關燈。'],
       noneBetween=[('p:heroine_02', '2027-07-13', '2027-07-24', ZR_SHIFT)], outing=[('vac_C08@Y2_re_heroine_02', '2027-07-25', 15.0)], dumpTh=('p:heroine_02', '2027-07-13', '2027-07-24'), cflags=['dating_heroine_02']),
]
async def sleep_bed(pg, cdp, run):
    sn = await pg.evaluate(SNAP)
    if sn['h'] < 21: await set_h(pg, run, 22.0, '晚上才能睡整晚')
    bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
    if not bed or not await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床'): say('   ⚠ 走不到床'); return False
    for k in range(4):
        await close_phone(pg); await pg.wait_for_timeout(800); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        if (await L.state(pg))['choices']: break
    await drain(pg, cdp, pref=['睡到明天早上', '睡到明天', '睡覺'], secs=240); say('   睡醒：%s' % json.dumps(await pg.evaluate(SNAP), ensure_ascii=False)); return True

async def main():
    run = L.Run('aa369', OUT); base = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        sha = os.environ.get('SHA', '?')
        for sc in SCENS:
            if SCEN and sc['id'] not in SCEN: continue
            if not SCEN and sc.get('opt'): continue
            say('== %s（%s）' % (sc['id'], sha)); t0 = time.time()
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True); cdp_g[0] = cdp
            MID.update({'n': 0, 'run': run, 'keys': [w[:8] for w in sc.get('want', [])], 'id': sc['id']})
            try:
                await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
                await load_at(pg, base, sc, run)
                for st in sc['steps']:
                    if st[0] == 'until': await play_until(pg, cdp, run, st[1], sc, *st[2:3])
                    elif st[0] == 'sleep': await sleep_bed(pg, cdp, run)
                    elif st[0] == 'jump': await jump(pg, run, st[1], st[2])
                    elif st[0] == 'untilkd': await untilkd(pg, cdp, run, sc.get('_te_to') if st[1] == 'TE_TO' else st[1], st[2], sc)
                    elif st[0] == 'sendmsg': await sendmsg(pg, cdp, run, sc, st[1], st[2], *st[3:4])
                    elif st[0] == 'wait': await pg.wait_for_timeout(int(st[1] * 1000))
                    elif st[0] == 'noreply':   # 最後一次傳給他以後，他還沒有回（例：方奕廷在山上）
                        r = [r for r in SENT if r['sc'] == sc['id'] and r['pid'] == st[1]][-1:]
                        if r:
                            got = await pg.evaluate("(([n0,pid])=>(GAME.G.msgs||[]).slice(n0).filter(m=>PHONE.th(m)==='p:'+pid&&(m.from||m.who)===pid).map(m=>CALENDAR.dateOf(m.day).key+' '+m.h+' '+m.text))(%s)" % json.dumps([r[0]['n0'], st[1]]))
                            sn = await pg.evaluate(SNAP); say('   %s %.2f：%s 還沒回？%s' % (sn['key'], sn['h'], st[1], json.dumps(got, ensure_ascii=False)))
                            if got: bad.append('%s：%s %.2f %s 已經回了（應該 7/20 15:00 才回）：%s' % (sc['id'], sn['key'], sn['h'], st[1], json.dumps(got, ensure_ascii=False)[:120]))
                await drain(pg, cdp, pref=sc.get('pref', []) + ['出發'], secs=120)
                await extra_checks(pg, sc)
                await verify(pg, run, sc)
            except Exception as e:
                say('   例外：%r' % e); bad.append('%s 例外 %r' % (sc['id'], e))
                try: await run.shot(pg, 'ev_err_' + sc['id'])
                except Exception: pass
            if errs: bad.append('%s：JS 例外 %s' % (sc['id'], json.dumps(errs[:2], ensure_ascii=False)[:200]))
            say('   （%.0f 秒）' % (time.time() - t0))
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
        json.dump({'results': results, 'bad': bad, 'rep': rep, 'sent': SENT}, open(os.path.join(OUT, 'aa369.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
        ran = [r['id'] for r in results]
        run.check('AA369-HOL-FIX：%s' % '、'.join(ran or ['（沒有跑完的情境）']), not bad and bool(ran), json.dumps(bad[:10], ensure_ascii=False))
    run.finish()
asyncio.run(main())
