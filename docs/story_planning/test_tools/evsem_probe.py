"""BB：第二批「大二下～大四每學期真的有事件可玩」瀏覽器驗收（AA_314 事件包一；1C 群戲、1B-19）。
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
TW = {'EXCHANGE_ROUTE': 'TW'}
AN_FAM = "LV('heroine_01',25,10,10);"
GRP = "PHONE.join(G,'noodle_team','麵店團');"
ATT3 = "G.acts=G.acts||{}; G.acts.att=G.acts.att||{}; for(const k of ['2028-09-21','2028-09-28','2028-10-05']) G.acts.att['public_law_group@'+D(k)]=1;"
SCENS = [
  # 大四上 1B-19（AA_323）：萬才館走廊／群組一則／不在群組
  dict(id='Y4S1_1B19_here', key='2028-10-19', h=21.3, zone='wancai', flags=TW, js=AN_FAM + GRP + ATT3, steps=[('until', 21.75)], pref=['什麼時候考'],
       want=['我決定了。考台大法研所，商法組。', '明年二月。還有四個月。'], speakers=['以安'], cflags=['AN_CHOICE'], eqflags={'AN_CHOICE': 'here'}, cmem=[('heroine_01', 'AN_CHOICE_TOLD')], eqmem={'heroine_01/AN_CHOICE_TOLD': '第一批知道'}, cnpcs=['heroine_01']),
  dict(id='Y4S1_1B19_group', key='2028-10-19', h=21.3, zone='dorm', flags=TW, js=AN_FAM + GRP + ATT3, steps=[('until', 22.1)],
       wantMsg=['我決定了。考台大法研所，商法組。'], none=['公司法、證交法、保險法。'], cflags=['AN_CHOICE'], eqflags={'AN_CHOICE': 'group'}, cmem=[('heroine_01', 'AN_CHOICE_TOLD')], eqmem={'heroine_01/AN_CHOICE_TOLD': '聽說'}),
  dict(id='Y4S1_1B19_nogroup', key='2028-10-19', h=21.3, zone='dorm', flags=TW, js=AN_FAM + "PHONE.rec(G).groups && delete PHONE.rec(G).groups.noodle_team;", steps=[('until', 22.1)],
       none=['我決定了。考台大法研所，商法組。'], cflags=['AN_CHOICE'], cmem=[('heroine_01', 'AN_CHOICE_TOLD')], eqmem={'heroine_01/AN_CHOICE_TOLD': None}),
  # 大四下 1C-06（AA_324）：最後一學期的開學第一頓
  dict(id='Y4S2_1C06_go', key='2029-02-22', h=16.8, zone='dorm', flags=TW, js=GRP + "LV('zhe',45,30,10); LV('yu',45,30,10);", steps=[('until', 17.2), ('grp', '最後一學期'), ('until', 20.5)],
       wantMsg=['開學第一頓。七點，長桌。'], want=['改回來啦。很難過耶。', '群組名字是誰改的。'], cflags=['LAST_TERM_DINNER', 'LAST_TERM_RENAMED']),
  dict(id='Y4S2_1C06_nogroup', key='2029-02-22', h=16.8, zone='dorm', flags=TW, js="PHONE.rec(G).groups && delete PHONE.rec(G).groups.noodle_team;", steps=[('until', 19.6)],
       none=['開學第一頓。七點，長桌。', '改回來啦。很難過耶。'], cflags=['LAST_TERM_DINNER', 'LAST_TERM_RENAMED'], eqflags={'LAST_TERM_RENAMED': '(undefined)'}),
  # 大三下 1C-04：冠軍賽前一晚，阿哲「你在宿舍嗎。」
  dict(id='Y3S2_1C04_down', key='2028-04-28', h=20.8, zone='dorm', flags=TW, js=GRP + "LV('zhe',45,30,10);", steps=[('until', 21.2), ('set', 22.95, '等 23:00 的阿哲私訊'), ('until', 23.6)], asks={'y3_zhe4': '（下樓）'}, pref=['嗯。我在'],
       wantMsg=['明天晚上七點，冠軍賽。來喊。', '你在宿舍嗎。'], want=['有事。我很緊張。'], speakers=['阿哲'], cflags=['ZHE4_REPLY', 'ZHE4_ASKED'], eqflags={'ZHE4_REPLY': 'down'}, cmem=[('zhe', 'ZHE_SAID_IT')], eqmem={'zhe/ZHE_SAID_IT': '(空)'}),
  dict(id='Y3S2_1C04_notfriend', key='2028-04-28', h=20.8, zone='dorm', flags=TW, js=GRP + "LV('zhe',10,5,5);", steps=[('until', 21.2), ('set', 22.95, '等 23:00'), ('until', 23.4)],
       wantMsg=['明天晚上七點，冠軍賽。來喊。'], none=['你在宿舍嗎。', '有事。我很緊張。'], cflags=['ZHE4_ASKED'], eqflags={'ZHE4_ASKED': '(undefined)'}, cmem=[('zhe', 'ZHE_SAID_IT')], eqmem={'zhe/ZHE_SAID_IT': None}),
  # 大三上 1C-02：中秋＝以安的生日
  dict(id='Y3S1_1C02_go', key='2027-09-14', h=20.8, zone='dorm', flags=TW, js=GRP + AN_FAM + "LV('zhe',45,30,10);", steps=[('until', 21.2), ('sleep',), ('set', 17.5, '隔天傍晚，等 18:00 出發'), ('until', 20.0)], pref=['幫她擋風'],
       wantMsg=['明天中秋，河濱，六點。'], want=['上一次生日碰到中秋，我十歲。', '（吹熄了）……謝謝。風是你擋的，願望是我的。'], noneMsg=['謝謝。柚子也可以。'], speakers=['以安']),
  dict(id='Y3S1_1C02_nogroup', key='2027-09-14', h=20.8, zone='dorm', flags=TW, js=AN_FAM + "PHONE.rec(G).groups && delete PHONE.rec(G).groups.noodle_team;", steps=[('until', 21.3)],
       none=['明天中秋，河濱，六點。']),
  # 大二下 1C-01：春假（三選一）
  dict(id='Y2S2_1C01_noodle', key='2027-03-30', h=20.8, zone='dorm', flags={}, js=GRP + "for(const id of ['zhe','yu','heroine_01','heroine_03','classmate_bohan','classmate_xinci']) LV(id,45,30,10);", steps=[('until', 21.3)], pref=['跟麵店團出去'],
       wantMsg=['語彤說行程她排', '……田野課的。我想自己去看一次。'], cflags=['SPRING_Y2'], eqflags={'SPRING_Y2': 'noodle'}),
  dict(id='Y2S2_1C01_nogroup', key='2027-03-30', h=20.8, zone='dorm', flags={'dating_kexin': False}, js="PHONE.rec(G).groups && delete PHONE.rec(G).groups.noodle_team;", steps=[('until', 21.4)],
       none=['語彤說行程她排', '跟麵店團出去'], cflags=['SPRING_Y2'], eqflags={'SPRING_Y2': '(undefined)'}),
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
    run = L.Run('evsem', OUT); base = json.load(open(SAVE, encoding='utf-8'))
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
                    elif st[0] == 'grp':
                        g = await pg.evaluate("((PHONE.rec(GAME.G).groups||{}).noodle_team||{}).name||null"); say('   群組名稱（17:00 以後）：%s' % g)
                        if g != st[1]: bad.append('%s：群組名稱「%s」（應該「%s」）' % (sc['id'], g, st[1]))
                await drain(pg, cdp, pref=sc.get('pref', []) + ['出發'], secs=120)
                await verify(pg, run, sc)
            except Exception as e:
                say('   例外：%r' % e); bad.append('%s 例外 %r' % (sc['id'], e)); await run.shot(pg, 'ev_err_' + sc['id'])
            say('   （%.0f 秒）' % (time.time() - t0))
        json.dump({'results': results, 'bad': bad, 'rep': rep}, open(os.path.join(OUT, 'evsem.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
        run.check('第二批事件：參加／沒參加／旗標／記憶', not bad, json.dumps(bad[:10], ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
    run.finish()
asyncio.run(main())
