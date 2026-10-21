"""BB（帳號 A）2026-10-21：AA_356「懸著的承諾：你欠我一次的下文」瀏覽器實玩（AA_356 第 4 節最後一行：「BB：照四條路線各跑一次，看補的那一兩句接得自然不自然」）。
框架照 aa360_probe.py（[前置] 用使用者 9/25 存檔改日期／旗標 → 遊戲時間照走 → 台詞、手機、旗標、錢記下來 → 檢查；前後各一句一起列出來看接得順不順）。
  1-1 寒假第一天（2026-01-05）可昕視訊一起打開成績：第 16 週書桌照片「你欠我一次」有收到 → 「三、二、一——」前面多「你欠我的那一次，用這個還。」；沒收到 → 沒有。
  1-2 大三開學 2027-09-10 17:30 校園，阿哲當隊長：MX_3ON3＝missed → 「他都知道」之後三行、錢 −75、MX_3ON3＝repaid；有去的 → 沒有。
  1-3 畢業後 2029-07-07 15:00 可昕「老地方」（K26）：KX_GRAD＝mine（典禮沒去）→ 第一句之後合照兩行、KX_GRAD_PHOTO＝k26；典禮有去 → 沒有。
  1-4 K26 沒去 → 手機兩則「重新排的第一天。你沒來。」「……我自己吃了兩份。」、沒有「你欠我一次」。
  2  總圖逾期「我明天拿來。」→ 隔天以後第一次進總圖：還書旁白、錢 −40、book_overdue 清掉；同一天進去 → 沒有。
不是 iPhone 實機：Playwright Chromium（SwiftShader）手機橫向模擬、?turbo。1-3、1-4 從臺北的家（畢業後退宿）出發：家裡的選單照玩家點。
用法：LW_TESTS=<開發分支>/tests SHA=<sha> python3 aa356_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>   （SCEN=id1,id2 只跑某幾個）"""
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
async def use(pg, cdp, run, pat):
    """走到最近、名字符合 pat 的互動點，按下去（真的操作），演完"""
    it = await pg.evaluate("(p=>{ const R=new RegExp(p), P=GAME.E.player.obj.position; const its=(GAME.E.interactables||[]).filter(i=>!i.hidden&&R.test(i.label||'')); its.sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z)); const i=its[0]; return i?[i.x,i.z,i.label]:null; })(%s)" % json.dumps(pat))
    if not it: say('   ⚠ 找不到互動點 /%s/' % pat); bad.append('找不到互動點 /%s/' % pat); return False
    if not await L.go_to(pg, cdp, run, it[0], it[1], 0.9, it[2], max_s=150): say('   ⚠ 走不到 %s' % it[2]); bad.append('走不到 %s' % it[2]); return False
    for k in range(4):
        lab = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()")
        if lab: break
        await pg.wait_for_timeout(800)
    say('   互動：%s（按鈕「%s」）' % (it[2], lab)); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
    await drain(pg, cdp, pref=['「我陪妳走到捷運站。」', '進去', '離開'], secs=200); return True
KX_PHOTO = "(PHONE.rec(G).cut=PHONE.rec(G).cut||[]).push('kx_video_photo');"   # [前置] 第 16 週那一晚收到過書桌照片（PHONE.sent 為真，不另外送訊息）
ZHE = "LV('zhe',40,30,30); LV('classmate_mingxuan',30,20,20);"
POST = {'dating_kexin': True, 'EXCHANGE_ROUTE': 'TW'}
GOHOME = "G.flags.MOVED_OUT=D('2029-06-28'); R2Y4B.k26Plan(G); setTimeout(()=>{ HOME.go(GAME).catch(e=>console.warn('HOME.go',e)); },300);"   # 6/28 退宿以後、K26 約好（遊戲自己的 k26Plan）→ 回臺北的家（HOME.go）
async def near(pg, cdp, run, who, r=3.5):
    """走到那個人附近（不按說話；靠近就演的 auto 事件，例 ev_zhe_captain near r 6）"""
    p = await pg.evaluate("(id=>{ const n=GAME.E.npcs.find(n=>n&&n.charId===id&&n.obj&&n.obj.visible!==false&&!n.hidden); return n?[n.obj.position.x,n.obj.position.z]:null; })(%s)" % json.dumps(who))
    if not p: say('   ⚠ 這裡沒有 %s（%s）' % (who, json.dumps(await pg.evaluate(SNAP), ensure_ascii=False))); bad.append('找不到 %s（不在這個區域）' % who); return False
    ok = await L.go_to(pg, cdp, run, p[0], p[1], r, who, max_s=150); say('   走到 %s 附近：%s' % (who, ok))
    await pg.wait_for_timeout(3000); await drain(pg, cdp, pref=['「恭喜，隊長。」'], secs=200); return ok
async def home(pg, cdp, run, picks, secs=400):
    """臺北的家的選單：照 picks 的順序點（每個是選項開頭；一個點完才找下一個），中間的對話、手機照玩家處理"""
    t0 = time.time(); picks = list(picks)
    while picks and time.time() - t0 < secs:
        s = await L.state(pg)
        if s['choices']:
            cs = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
            t = next((c for c in cs if c.startswith(picks[0])), None)
            if t:
                c = await pg.evaluate("(t=>{ const e=[...document.querySelectorAll('#choices button')].find(b=>b.textContent.trim()===t); e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(t))
                await L.touch_tap(cdp, c[0], c[1]); say('   ▶ 家：%s（選單：%s）' % (t[:24], ' / '.join(x[:10] for x in cs))); picks.pop(0); await pg.wait_for_timeout(1500); continue
            say('   家的選單沒有「%s」：%s' % (picks[0], ' / '.join(x[:12] for x in cs))); bad.append('家的選單沒有「%s」' % picks[0]); return False
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if await phone_open(pg): await close_phone(pg); continue
        await pg.wait_for_timeout(1200)
    await drain(pg, cdp, pref=['出發'], secs=60); return not picks
SCENS = [
  # 1-1：1/4 22:00 宿舍、和可昕交往、約好一起打開成績（KX_GRADES_PACT_SET）→ 睡 → 1/5 早上「先看／等五號一起看」選等 → 21:00 視訊「接起來」
  dict(id='A1_owed', key='2026-01-04', h=22.0, zone='dorm', flags=dict(TW, dating_kexin=True, KX_GRADES_PACT_SET=True), js=KX_PHOTO,
       steps=[('sleep',), ('set', 20.8, '1/5 白天沒有可昕的事，撥到視訊前'), ('until', 21.6)], pref=['等五號一起看。', '接起來'],
       want=['你欠我的那一次，用這個還。', '三、二、一——'], seq=[['你欠我的那一次，用這個還。', '三、二、一——']], ctx='你欠我的那一次', cflags=['KX_GRADES_PACT']),
  dict(id='A1_kept', key='2026-01-04', h=22.0, zone='dorm', flags=dict(TW, dating_kexin=True, KX_GRADES_PACT_SET=True),
       steps=[('sleep',), ('set', 20.8, '1/5 白天沒有可昕的事，撥到視訊前'), ('until', 21.6)], pref=['等五號一起看。', '接起來'],
       want=['三、二、一——'], none=['你欠我的那一次，用這個還。'], ctx='三、二、一'),
  # 1-2：2027-09-10 17:20 校園，三對三沒去（MX_3ON3＝missed）、和阿哲熟 → 走到阿哲旁邊（靠近就演）
  dict(id='A2_owed', key='2027-09-10', h=17.4, zone='campus', flags=dict(TW, MX_3ON3='missed'), js=ZHE, steps=[('near', 'zhe')], pref=['「恭喜，隊長。」'],
       want=['對了。三對三那次，你欠的。', '好。清了。'], seq=[['……對。過了。（對祐廷）你看，他都知道。', '對了。三對三那次，你欠的。']], ctx='三對三那次',
       cflags=['MX_3ON3'], eqflags={'MX_3ON3': 'repaid'}, dmoney=-75),
  dict(id='A2_went', key='2027-09-10', h=17.4, zone='campus', flags=dict(TW, MX_3ON3='went'), js=ZHE, steps=[('near', 'zhe')], pref=['「恭喜，隊長。」'],
       want=['……對。過了。（對祐廷）你看，他都知道。'], none=['對了。三對三那次，你欠的。', '好。清了。'], ctx='他都知道', cflags=['MX_3ON3'], eqflags={'MX_3ON3': 'went'}),
  # 1-3：2029-07-07 14:25 臺北的家（6/28 退宿以後），交往中、K26 已約好（R2Y4B.k26Plan）、典禮沒去（KX_GRAD＝mine）→ 家的選單「出發：和可昕…」
  dict(id='A3_photo', key='2029-07-07', h=14.42, zone='campus', flags=dict(POST, KX_GRAD='mine'), js=GOHOME,
       steps=[('home', ['出發'])], pref=['出發'], want=['（她把手機交給隔壁桌的人：「不好意思，幫我們拍一張。」）', '典禮那天欠的合照。'],
       seq=[['（她把手機交給隔壁桌的人：「不好意思，幫我們拍一張。」）', '典禮那天欠的合照。']], ctx='幫我們拍一張', cflags=['KX_GRAD', 'KX_GRAD_PHOTO', 'KX_K26'], eqflags={'KX_GRAD_PHOTO': 'k26', 'KX_K26': 'went'}),
  dict(id='A3_came', key='2029-07-07', h=14.42, zone='campus', flags=dict(POST, KX_GRAD='came'), js=GOHOME,
       steps=[('home', ['出發'])], pref=['出發'], none=['典禮那天欠的合照。'], cflags=['KX_GRAD', 'KX_GRAD_PHOTO', 'KX_K26'], eqflags={'KX_K26': 'went'}),
  # 1-4：同上但不出發：家的選單「睡覺」→ 隔天早上；手機要有兩則新訊息、沒有「你欠我一次」
  dict(id='A4_missed', key='2029-07-07', h=14.42, zone='campus', flags=dict(POST, KX_GRAD='mine'), js=GOHOME,
       steps=[('home', ['睡覺'])], pref=['睡覺'], wantMsg=['重新排的第一天。你沒來。', '……我自己吃了兩份。'], noneMsg=['重新排的第一天。你欠我一次。'], none=['典禮那天欠的合照。'],
       cflags=['KX_K26'], eqflags={'KX_K26': 'missed'}),
  # 2：逾期還沒還（book_overdue，昨天說「我明天拿來。」）→ 10/1 14:00 校園總圖門口 → 走進總圖 → 還書旁白、−40、旗標清掉
  dict(id='B_return', key='2025-10-01', h=14.0, zone='campus', flags=dict(TW, book_overdue=True), js="G.flags.book_overdue_day=G.day-1;", steps=[('use', '進入總圖')],
       want=['（你把那本《民法總則》還了。多拖一天，罰款變成四十元。）'], cflags=['book_overdue'], eqflags={'book_overdue': False}, dmoney=-40),
  dict(id='B_sameday', key='2025-10-01', h=14.0, zone='campus', flags=dict(TW, book_overdue=True), js="G.flags.book_overdue_day=G.day;", steps=[('use', '進入總圖')],
       none=['（你把那本《民法總則》還了。多拖一天，罰款變成四十元。）'], cflags=['book_overdue'], eqflags={'book_overdue': True}),
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
    run = L.Run('aa356', OUT); base = json.load(open(SAVE, encoding='utf-8'))
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
                    elif st[0] == 'use': await use(pg, cdp, run, st[1])
                    elif st[0] == 'near': await near(pg, cdp, run, st[1])
                    elif st[0] == 'home': await home(pg, cdp, run, st[1])
                    elif st[0] == 'grp':
                        g = await pg.evaluate("((PHONE.rec(GAME.G).groups||{}).noodle_team||{}).name||null"); say('   群組名稱（17:00 以後）：%s' % g)
                        if g != st[1]: bad.append('%s：群組名稱「%s」（應該「%s」）' % (sc['id'], g, st[1]))
                await drain(pg, cdp, pref=sc.get('pref', []) + ['出發'], secs=120)
                await verify(pg, run, sc)
            except Exception as e:
                say('   例外：%r' % e); bad.append('%s 例外 %r' % (sc['id'], e)); await run.shot(pg, 'ev_err_' + sc['id'])
            say('   （%.0f 秒）' % (time.time() - t0))
        json.dump({'results': results, 'bad': bad, 'rep': rep}, open(os.path.join(OUT, 'aa356.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
        run.check('AA_356：四句「你欠我」的下文＋總圖還書（有欠的有、沒欠的沒有）', not bad, json.dumps(bad[:10], ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
    run.finish()
asyncio.run(main())

