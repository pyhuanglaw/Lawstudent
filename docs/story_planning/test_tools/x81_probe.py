"""BB：X81（法律系開局 8/30 載可昕上山、床邊選單被蓋掉）＋第二批「大二下～大四每學期真的有事件可玩」瀏覽器驗收（AA_314 事件包一；1C 群戲、1B-19）。
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
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[]; const o=ADV.log; ADV.log=function(n,t){ try{ window.__LOG.push({n:n||'',t:String(t), h:+GAME.G.hour.toFixed(2), d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} return o.apply(this,arguments); }; })()"""
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

ST = """(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day); return {day:G.day, key:d.key, h:+G.hour.toFixed(2), zone:G.zone, busy:!!GAME.E.player.busy, depth:(GAME.D&&GAME.D.busyDepth)||0, who:(GAME.D&&GAME.D.busyWho)||null, active:!!(GAME.D&&GAME.D.active), stack:(GAME.D&&GAME.D.chooseStack&&GAME.D.chooseStack.length)||0, e37:OUT.get(G,'y0_e37')?OUT.get(G,'y0_e37').state:null, e37done:!!(G.events&&G.events.done&&G.events.done.ev_y0_e37), law:!!G.flags.E37_LAW, stuck:(()=>{ try{ return JSON.parse(localStorage.getItem('fatiao3d_stuck')||'null'); }catch(e){ return 'err'; } })()}; })()"""
async def reply_kx(pg, cdp):
    pend = await pg.evaluate("(()=>PHONE.pending(GAME.G).filter(m=>/載我上山/.test(m.text)).map(m=>({id:m.ask.id, th:PHONE.th(m), opts:m.ask.opts.map(o=>o.t)})))()")
    if not pend: return False
    m = pend[0]; k = next((i for i, t in enumerate(m['opts']) if t.startswith('好。兩點。')), None)
    if k is None: bad.append('可昕那一則沒有「好。兩點。」：%s' % m['opts']); return False
    if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"msg\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(700)
    c = await pg.evaluate("(th=>{ const e=[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===th); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(m['th']))
    if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900)
    c = await pg.evaluate("(a=>{ const e=[...document.querySelectorAll('#phoneBody [data-ask]')].find(b=>b.dataset.ask===a); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim()]; })(%s)" % json.dumps('%s|%d' % (m['id'], k)))
    if not c: bad.append('手機介面找不到「好。兩點。」按鈕'); return False
    await L.touch_tap(cdp, c[0], c[1]); say('   手機回覆可昕：「%s」' % c[2]); await pg.wait_for_timeout(1500); await close_phone(pg); return True
async def bed_menu(pg, cdp, run):
    bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
    if not bed or not await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床'): say('   ⚠ 走不到床'); return False
    for k in range(4):
        await close_phone(pg); await pg.wait_for_timeout(800); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        s = await L.state(pg)
        if s['choices']: return True
    return False
async def choices(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,24))")
async def main():
    run = L.Run('x81', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True); cdp_g[0] = cdp
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()"); await pg.reload(); await L.wait_loaded(pg)
        await pg.evaluate(HOOK)
        ok = await L.tap(pg, cdp, '#btnNewLaw'); say('標題「從法律系開始」：%s' % ok)
        # 一：回顧 → 宿營 → 8/29 搬宿舍（點對話、選第一個選項；手機有可昕那一則就回）
        t0 = time.time(); replied = False; last = None
        while time.time() - t0 < 2400:
            s = await L.state(pg)
            if s['choices']:
                c = await choices(pg); pref = ['好', '去', '出發'] if any('出發' in x for x in c) else []
                await drain(pg, cdp, pref=pref or [c[0][:6]], secs=30); continue
            if s['dlg'] or s['busy']: await drain(pg, cdp, pref=[], secs=60); continue
            sn = await pg.evaluate(ST)
            if (sn['key'], int(sn['h'])) != last: say('   %.0fs %s %.2f %s depth=%d' % (time.time() - t0, sn['key'], sn['h'], sn['zone'], sn['depth'])); last = (sn['key'], int(sn['h']))
            if not replied and await reply_kx(pg, cdp): replied = True; continue
            if sn['key'] == '2025-08-29' and sn['h'] >= 21.5 and sn['zone'] == 'dorm' and not sn['busy'] and sn['depth'] == 0:
                await pg.wait_for_timeout(4000)
                if not replied and await reply_kx(pg, cdp): replied = True
                if replied: break
            if await phone_open(pg): await close_phone(pg)
            await pg.wait_for_timeout(2500)
        sn = await pg.evaluate(ST); say('[X81] 8/29 晚上：%s｜回覆可昕：%s' % (json.dumps(sn, ensure_ascii=False), replied)); await run.shot(pg, 'x81_0829_night')
        kx = await pg.evaluate("(G=>(G.msgs||[]).filter(m=>PHONE.th(m)==='p:kexin').map(m=>(m.from||'')+'：'+m.text))(GAME.G)"); say('   可昕對話串：%s' % json.dumps(kx[-5:], ensure_ascii=False))
        for w in ['我到你家了。阿姨留我住一晚，還煮了麵。', '明天下午兩點，你回家開車，載我上山。行李兩箱。', '嗯。不要遲到。']:
            if not any(w in x for x in kx): bad.append('X81 8/29：可昕對話串沒有「%s」' % w)
        if sn['e37'] is None: bad.append('X81 8/29：沒有排 8/30 載可昕的出遊')
        # 二：睡覺 → 鬧鐘叫醒 → 出發 → E37 → 回宿舍
        sn = await pg.evaluate(ST)
        if sn['h'] < 21: await set_h(pg, run, 22.0, '晚上才能睡整晚')
        if await bed_menu(pg, cdp, run):
            say('   床的選單：%s' % await choices(pg))
            await drain(pg, cdp, pref=['睡到明天早上', '睡到明天', '睡覺'], secs=20)
        t1 = time.time(); woke = None; departed = False
        while time.time() - t1 < 900:
            s = await L.state(pg); sn = await pg.evaluate(ST)
            if s['choices']:
                c = await choices(pg); say('   %s %.2f 選單：%s' % (sn['key'], sn['h'], c))
                if woke is None and sn['key'] == '2025-08-30': woke = sn['h']; await run.shot(pg, 'x81_0830_wake')
                if any('出發' in x for x in c): departed = True
                await drain(pg, cdp, pref=['出發', '起床', '好'], secs=30); continue
            if s['dlg'] or s['busy']: await drain(pg, cdp, pref=['出發'], secs=60); continue
            if sn['e37done'] and sn['zone'] == 'dorm' and sn['depth'] == 0: break
            if await phone_open(pg): await close_phone(pg)
            await pg.wait_for_timeout(2000)
        sn = await pg.evaluate(ST); say('[X81] 8/30 演完：%s｜醒來 %s｜按了出發 %s' % (json.dumps(sn, ensure_ascii=False), woke, departed)); await run.shot(pg, 'x81_0830_back')
        lines = await pg.evaluate("(window.__LOG||[]).filter(x=>x.d==='2025-08-30').map(x=>x.n+'：'+x.t)"); say('   8/30 台詞（%d，前 6／後 4）：%s ... %s' % (len(lines), json.dumps(lines[:6], ensure_ascii=False), json.dumps(lines[-4:], ensure_ascii=False)))
        if not sn['e37done']: bad.append('X81 8/30：E37 沒有演完')
        if woke is None or not (12.9 <= woke <= 13.6): bad.append('X81 8/30：鬧鐘叫醒時間 %s（預期約 13:00～13:30）' % woke)
        if not any('你把車開回家，再搭捷運回宿舍' in x for x in lines): bad.append('X81 8/30：沒有法律系版最後那句旁白')
        if sn['key'] != '2025-08-30' or not (18.5 <= sn['h'] <= 19.6): bad.append('X81 8/30：回到宿舍是 %s %.2f（預期 8/30 19:00 左右）' % (sn['key'], sn['h']))
        # 三：使用者卡住的那一刻——8/30 晚上在宿舍按床；床邊選單開著時，另一段劇情開自己的選單蓋上去（[捷徑] console 開一段）
        if await bed_menu(pg, cdp, run):
            c0 = await choices(pg); say('   床的選單（被蓋之前）：%s' % c0); await run.shot(pg, 'x81_bed_before_cover')
            await pg.evaluate("void (async()=>{ GAME.sceneBegin(); try{ window.__COV=await GAME.choose([{t:'（測試）蓋上去的選單 A'},{t:'（測試）蓋上去的選單 B'}]); } finally { GAME.sceneEnd(); } })()")
            run.setup('[捷徑] 床邊選單開著時，console 開一段有自己選單的劇情（sceneBegin＋choose＋sceneEnd）蓋上去')
            await pg.wait_for_timeout(1500); c1 = await choices(pg); say('   蓋上去以後畫面的選單：%s' % c1); await run.shot(pg, 'x81_cover')
            if not any('蓋上去的選單 A' in x for x in c1): bad.append('X81：蓋上去的選單沒出現 %s' % c1)
            await drain(pg, cdp, pref=['（測試）蓋上去的選單 A'], secs=5)
            await pg.wait_for_timeout(2000); c2 = await choices(pg); st2 = await pg.evaluate(ST); say('   選完蓋上去的那一段：畫面選單 %s｜%s' % (c2, json.dumps(st2, ensure_ascii=False))); await run.shot(pg, 'x81_bed_back')
            if c2 != c0: bad.append('X81：蓋上去那一段演完以後床的選單沒有回來（%s，原本 %s）' % (c2, c0))
            else:
                await drain(pg, cdp, pref=['睡到明天早上', '睡到明天', '睡覺'], secs=240)
            st3 = await pg.evaluate(ST); say('   睡覺以後：%s' % json.dumps(st3, ensure_ascii=False)); await run.shot(pg, 'x81_after_sleep')
            if st3['key'] != '2025-08-31': bad.append('X81：床邊選單選「睡到明天早上」以後沒有到 8/31（%s %.2f）' % (st3['key'], st3['h']))
            if st3['depth'] != 0 or st3['busy']: bad.append('X81：睡醒以後劇情鎖沒解開 depth=%d busy=%s' % (st3['depth'], st3['busy']))
            if st3['stuck']: say('   fatiao3d_stuck：%s' % json.dumps(st3['stuck'], ensure_ascii=False)[:400])
        else: bad.append('X81：8/30 晚上床的選單打不開')
        json.dump({'bad': bad, 'rep': rep}, open(os.path.join(OUT, 'x81.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
        run.check('X81 法律系開局 8/29～8/30＋床邊選單被蓋掉以後回來', not bad, json.dumps(bad[:10], ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
    run.finish()
asyncio.run(main())
