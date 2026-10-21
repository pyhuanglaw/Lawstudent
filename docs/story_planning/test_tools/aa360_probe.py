"""BB（帳號 A）2026-10-21：BB-TEST-AA360-1021（開發分支 2bce84da 起；清單 docs/handoff/bb_checklists/BB_AA360_1021.md）瀏覽器驗收。
框架照 evsem_probe.py（BB-C）：[前置] 用使用者 9/25 存檔改日期／旗標（GAME.applySave）→ 遊戲時間照走 → 台詞（ADV.log）、CG（ADV.cg）全部記下來 → 檢查。
這一版做：①子晴 Q12 三種 ZQ_Q10（nameless／cat／both）都是《九點以後》＋爸爸那一幕＋CG ②日本路線 5/20 的電話「他打了五次……」
⑥芷若 Z7 家裡那一版（時差那幾句）⑦子晴 Q4 錯過版（第 9 週第一次說話多一句、第二次沒有；第 9 週週六公館不演 Q4）。
③學姊寒假快轉停在 1/31 21:00、1/26 沒有學姊私訊 ⑤2/2「考完了」→ 2/3 回「好。」→ 2/4 文具店「二月四日　買計畫本。」。
④1/25 路過總圖（走進總圖、上二樓坐下讀書一小時、走出大門）要走樓梯和座位，下一版加。
不是 iPhone 實機：Playwright Chromium（SwiftShader）手機橫向模擬、?turbo。
用法：LW_TESTS=<開發分支>/tests SHA=<sha> python3 aa360_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>   （SCEN=id1,id2 只跑某幾個）"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = os.environ.get('SCEN', '').split(',') if os.environ.get('SCEN') else None
SNAP = """(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day); return {key:d.key, h:+G.hour.toFixed(2), zone:G.zone, hud:(document.getElementById('clockT')||{}).textContent||''}; })()"""
bad = []; rep = []; results = []
def say(*a):
    s = ' '.join(str(x) for x in a); print(s, flush=True); rep.append(s)
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[]; const o=ADV.log; ADV.log=function(n,t){ try{ window.__LOG.push({n:n||'',t:String(t), h:+GAME.G.hour.toFixed(2), d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} return o.apply(this,arguments); };
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
    if sc['key'].startswith('TERMDAY:'):
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
    say('   台詞（%d 句，最後 10）：%s' % (len(o['lines']), json.dumps(o['lines'][-10:], ensure_ascii=False)))
    say('   說話的人：%s｜手機最後 6：%s' % (o['speakers'], json.dumps(o['msgTexts'][-6:], ensure_ascii=False)))
    say('   旗標 %s｜記憶 %s｜群組 %s｜人物 %s｜玩家 %s %s' % (json.dumps(o['flags'], ensure_ascii=False), json.dumps(o['mem'], ensure_ascii=False), json.dumps(o['grp'], ensure_ascii=False), json.dumps(o['npcs'], ensure_ascii=False), o['zone'], o['pl']))
    await run.shot(pg, 'ev_' + sc['id'])
    st = 'PASS' if not probs else 'FAIL'; say('[%s] %s %s' % (st, sc['id'], '；'.join(probs)))
    results.append({'id': sc['id'], 'ok': not probs, 'probs': probs, 'o': {k: o[k] for k in ('flags', 'mem', 'grp', 'npcs', 'speakers', 'zone')}, 'lines': o['lines'], 'msgs': o['msgTexts'][-12:]})
    if probs: bad.extend('%s：%s' % (sc['id'], p) for p in probs)
TW = {'EXCHANGE_ROUTE': 'TW'}
AN_FAM = "LV('heroine_01',25,10,10);"
GRP = "PHONE.join(G,'noodle_team','麵店團');"
ATT3 = "G.acts=G.acts||{}; G.acts.att=G.acts.att||{}; for(const k of ['2028-09-21','2028-09-28','2028-10-05']) G.acts.att['public_law_group@'+D(k)]=1;"
async def talk(pg, cdp, run, who):
    """走到那個人旁邊、按「和○○說話」（真的操作），演完"""
    p = await pg.evaluate("(id=>{ const n=GAME.E.npcs.find(n=>n&&n.charId===id&&n.obj&&n.obj.visible!==false&&!n.hidden); return n?[n.obj.position.x,n.obj.position.z]:null; })(%s)" % json.dumps(who))
    if not p: say('   ⚠ 這裡沒有 %s' % who); bad.append('找不到 %s（不在這個區域）' % who); return False
    if not await L.go_to(pg, cdp, run, p[0], p[1], 1.4, who, max_s=120): say('   ⚠ 走不到 %s' % who); bad.append('走不到 %s' % who); return False
    for k in range(4):
        lab = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()")
        if '說話' in lab: break
        await pg.wait_for_timeout(800)
    say('   互動鈕：%s' % lab); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
    await drain(pg, cdp, pref=['聊', '說'], secs=150); return True
async def ff_bed(pg, cdp, run, want_key, want_h):
    """床 →「快轉」→「到下一個有事的日子」（真的操作），停下來的日期時間要是 want_key want_h（±0.75 小時）"""
    bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
    if not bed or not await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床'): say('   ⚠ 走不到床'); bad.append('快轉：走不到床'); return False
    for k in range(4):
        await close_phone(pg); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        if (await L.state(pg))['choices']: break
    for k in range(6):
        cs = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
        t = next((c for c in cs if c.startswith('到下一個有事的日子')), None) or next((c for c in cs if c.startswith('快轉')), None)
        if not t: break
        c = await pg.evaluate("(t=>{ const e=[...document.querySelectorAll('#choices button')].find(b=>b.textContent.trim()===t); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(t))
        await L.touch_tap(cdp, c[0], c[1]); say('   ▶ 床：%s' % t[:20]); await pg.wait_for_timeout(1500)
        if t.startswith('到下一個有事的日子'): break
    await drain(pg, cdp, pref=['睡到明天早上'], secs=300)
    sn = await pg.evaluate(SNAP); say('   快轉停在 %s %.2f %s' % (sn['key'], sn['h'], sn['zone']))
    if sn['key'] != want_key or abs(sn['h'] - want_h) > 0.75: bad.append('快轉停在 %s %.2f（應該 %s %.2f）' % (sn['key'], sn['h'], want_key, want_h))
    return True
async def nomsg(pg, who, key):
    """那一天不應該有 who 的私訊"""
    m = await pg.evaluate("(([w,k])=>{ const d=STORY.dayOfKey(k); return (GAME.G.msgs||[]).filter(m=>m.from===w&&m.day===d).map(m=>m.text); })(%s)" % json.dumps([who, key]))
    say('   %s 的 %s 私訊：%s' % (key, who, json.dumps(m, ensure_ascii=False)))
    if m: bad.append('%s 不應該有 %s 的私訊，有 %d 則：%s' % (key, who, len(m), m[0][:20]))
SIS = "LV('heroine_05',50,40,35); PHONE.join(G,'family_law','法律系家族');"
SISF = {'EXCHANGE_ROUTE': 'TW', 'SIS_W1': True, 'SIS_STUDY': True}
TW = {'EXCHANGE_ROUTE': 'TW'}
ZQ = "LV('heroine_04',40,32,30);"
Q12_WANT = ['一個小孩每天晚上等一個人回家', '謝謝：爸爸', '最後一關，我打過了。', 'CG:cg_final_stage_heroine04']
SCENS = [
  # ① 子晴 Q12：5/19 20:30 宿舍 → 21:00 私訊 → 睡覺 → 5/20 13:45 出發；三種 ZQ_Q10 都應該是《九點以後》（AA_360 第 1 節）
  *[dict(id='Q12_' + q, key='2028-05-19', h=20.5, zone='dorm', flags=dict(TW, ZQ_Q10=q), js=ZQ, steps=[('until', 21.3), ('sleep',), ('set', 13.6, '5/20 早上到中午沒有事，撥到出遊前'), ('until', 16.6)],
         pref=['出發', '去'], want=Q12_WANT, wantMsg=['明天兩點，資工系館一樓。一百個人'], cflags=['ZQ_Q12', 'ZQ_Q12_SEEN', 'ZQ_Q10'], eqflags={'ZQ_Q12': 'nine', 'ZQ_Q12_SEEN': 'came'}) for q in ('nameless', 'cat', 'both')],
  # ② 日本路線：5/20 晚上（台灣 21:00＝日本 22:00）電話「他打了五次……」
  dict(id='Q12_JP_call', key='2028-05-20', h=21.8, zone='jp_room', flags={'EXCHANGE_ROUTE': 'JP', 'ZQ_Q10': 'cat'}, js=ZQ, steps=[('until', 22.8)],
       pref=['接起來', '接'], want=['他打了五次。第五次過了。'], none=['下一個做完，你來測。'], cflags=['ZQ_Q12', 'ZQ_Q12_SEEN'], eqflags={'ZQ_Q12': 'nine'}),
  # ⑥ 芷若 Z7（ev_zhiruo_applied）家裡那一版：12/11 15:00 進 Café，選「妳那時候說的家裡……」
  dict(id='Z7_family', key='2026-12-11', h=15.0, zone='cafe', flags=dict(TW, Z4_PICK='family'),
       js="LV('heroine_02',40,32,30); SOCIAL.remember('heroine_02','SHARED_SECRET',''); G.events=G.events||{}; G.events.done=G.events.done||{}; G.events.done.ev_zhiruo_secret=true;",
       steps=[('until', 15.6)], pref=['「妳那時候說的家裡'], want=['你那時候說家裡比較重要。', '我那個時間沒課。'], cflags=['Z4_PICK']),
  # ⑦ 子晴 Q4 錯過版：大一下第 9 週週一 12:00 校園；有 ARGUED_ABOUT_CAREER、沒有 CONTEST_DAY → 第一次說話多一句、第二次沒有
  dict(id='Q4_missed_talk', key='TERMDAY:Y1S2:9:1', h=12.0, zone='campus', flags=dict(TW),
       js="LV('heroine_04',30,25,25); SOCIAL.remember('heroine_04','ARGUED_ABOUT_CAREER','');", steps=[('talk', 'heroine_04'), ('talk', 'heroine_04')],
       want=['上禮拜六那個比賽，我沒去。'], once=['上禮拜六那個比賽，我沒去。'], cflags=['CONTEST_HEARD']),
  # ⑦ 第 9 週週六 15:30 公館：Q4（weeks:[8]）不演
  dict(id='Q4_week9_sat', key='TERMDAY:Y1S2:9:6', h=15.5, zone='gongguan', flags=dict(TW),
       js="LV('heroine_04',30,25,25); SOCIAL.remember('heroine_04','ARGUED_ABOUT_CAREER','');", steps=[('until', 16.4)],
       none=['我在這裡喝第三罐咖啡。', '今天是那個比賽。']),
  # ③ 學姊快轉：1/21 10:00 宿舍，SIS_W1、SIS_STUDY、學姊朋友以上、在家族群組 → 床的快轉直接停在 1/31 21:00；1/26 沒有學姊私訊（AA_360 2-1）
  dict(id='SIS_ff_0131', key='2026-01-21', h=10.0, zone='dorm', flags=SISF, js=SIS, steps=[('ff', '2026-01-31', 21.0), ('nomsg', 'heroine_05', '2026-01-26')]),
  # ⑤ 2/2 17:30「考完了」→ 2/3 21:00 回「好。」→ 2/4 14:00 文具店 → 第一頁「二月四日　買計畫本。」＋三個反應選項
  dict(id='SIS_planner', key='2026-02-02', h=17.0, zone='dorm', flags=SISF, js=SIS,
       steps=[('until', 17.8), ('sleep',), ('set', 20.9, '2/3 白天沒有學姊的事'), ('until', 21.4), ('sleep',), ('set', 13.6, '2/4 早上到中午沒有事，撥到出遊前'), ('until', 15.4)],
       asks={'sisg_exam_done': '去吃。', 'sisg_planner_ask': '好。'}, pref=['出發'], want=['二月四日　買計畫本。'], wantMsg=['考完了', '我想去買一本新的計畫本'],
       cflags=['SIS_NEW_PLANNER', 'SISG_PLANNER_GO'], eqflags={'SIS_NEW_PLANNER': True}),
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
    run = L.Run('aa360', OUT); base = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True); cdp_g[0] = cdp
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        sha = os.environ.get('SHA', '?')
        for sc in SCENS:
            if SCEN and sc['id'] not in SCEN: continue
            say('== %s（%s）' % (sc['id'], sha)); t0 = time.time()
            MID.update({'n': 0, 'run': run, 'keys': [w[:8] for w in sc.get('want', [])], 'id': sc['id']})
            try:
                await load_at(pg, base, sc, run)
                for st in sc['steps']:
                    if st[0] == 'until': await play_until(pg, cdp, run, st[1], sc)
                    elif st[0] == 'set': await set_h(pg, run, st[1], st[2])
                    elif st[0] == 'sleep': await sleep_bed(pg, cdp, run)
                    elif st[0] == 'talk': await talk(pg, cdp, run, st[1])
                    elif st[0] == 'ff': await ff_bed(pg, cdp, run, st[1], st[2])
                    elif st[0] == 'nomsg': await nomsg(pg, st[1], st[2])
                    elif st[0] == 'grp':
                        g = await pg.evaluate("((PHONE.rec(GAME.G).groups||{}).noodle_team||{}).name||null"); say('   群組名稱（17:00 以後）：%s' % g)
                        if g != st[1]: bad.append('%s：群組名稱「%s」（應該「%s」）' % (sc['id'], g, st[1]))
                await drain(pg, cdp, pref=sc.get('pref', []) + ['出發'], secs=120)
                await verify(pg, run, sc)
            except Exception as e:
                say('   例外：%r' % e); bad.append('%s 例外 %r' % (sc['id'], e)); await run.shot(pg, 'ev_err_' + sc['id'])
            say('   （%.0f 秒）' % (time.time() - t0))
        json.dump({'results': results, 'bad': bad, 'rep': rep}, open(os.path.join(OUT, 'aa360.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
        run.check('AA_360：Q12 三種＋日本電話、Z7 家裡版、Q4 錯過版', not bad, json.dumps(bad[:10], ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
    run.finish()
asyncio.run(main())

