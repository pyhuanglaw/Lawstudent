"""BB（帳號 A）2026-10-21：BB-TEST-US-LIFE-1021（docs/handoff/bb_checklists/BB_US_LIFE_1021.md US-A～US-J；AA_340 S1～S12、G1～G7；src/us_life3d.js）瀏覽器實玩。
框架照 aa356／aa360（[前置] 用使用者 9/25 存檔改日期、旗標、區域、站的位置 → 遊戲時間照走 → 台詞、日期卡、手機、旗標記下來 → 檢查）。
[前置] 旗標：EXCHANGE_ROUTE US、EXCH_RULE 1、US_DEPARTED／US_ARRIVED、US_ARRIVED_DAY＝2028-08-02、Y4_PATH bar、Y4_PATH_DAY＝2028-06-08；交往中再加 dating_heroine_05、US1 together；挽回中 US1 alone。
站的位置：床尾＝US3.SPAWN.us_apartment_bed、平台＝US_APARTMENT_LAYOUT.spawns.fromOutside（E.placeAt）。
之後都是玩家的操作：走到床邊按「睡覺」→ 選單；「快轉」→「到下一個有事的日子」；平台「去上課」；手機要回的照 asks 回；社區「去湖邊」。
「場景完成≠系統完成」：這支只看系統（時間、停點、事件、手機、課），場景的美術另外看。
不是 iPhone 實機：Playwright Chromium（SwiftShader）手機橫向模擬、?turbo。
US-G（2026-10-21 19:1x 加）：出發日出境大廳不能搭車回臺北、一小時後自動登機（AA_370 H2）。
用法：LW_TESTS=<開發分支>/tests SHA=<sha> python3 us_life_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>   （SCEN=id1,id2 只跑某幾個）"""
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
  const oc=ADV.cg; ADV.cg=function(id){ try{ window.__LOG.push({n:'CG',t:'CG:'+id, h:+GAME.G.hour.toFixed(2), d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} return oc.apply(this,arguments); };
  const ot=GAME.toast; GAME.toast=function(x){ try{ window.__LOG.push({n:'TOAST',t:'TOAST:'+x, h:+GAME.G.hour.toFixed(2), d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} return ot.apply(this,arguments); };
  if(GAME.caption){ const ocp=GAME.caption; GAME.caption=function(x){ try{ window.__LOG.push({n:'CAPTION',t:'CAPTION:'+x, h:+GAME.G.hour.toFixed(2), d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} return ocp.apply(this,arguments); }; } })()"""   # 2026-10-21 AA370：提示（亞洲超市公休）、字幕（208 的門關著）也記
DRAIN_ASKS = {}
async def drain(pg, cdp, pref=None, secs=120):
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s['choices']:
            # BB-B 21:1x：點之前先 scrollIntoView——橫向畫面、對話框還在時 #choices 只剩 206 px、超過的選項在框外（SQ08 便利商店六個選項的「不用了」點不到，cvs_menu4.py）
            # BB-B 10-23 19:4x：偏好開頭「1:」＝這一次 drain 只選一次（SQ39_SQ08：便利商店買完會再問一次，「小罐貓罐頭」每次都對得到，連買 36 罐、選單一路開到別的區域）
            w = [t[2:] if t.startswith('1:') else t for t in (pref or [])]
            c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; let e=null, k=-1; for(let i=0;i<w.length;i++){ e=bs.find(x=>x.textContent.trim().includes(w[i])); if(e){ k=i; break; } } e=e||bs.find(x=>/不|晚一點|之後/.test(x.textContent))||bs[bs.length-1]; try{ e.scrollIntoView({block:'nearest'}); }catch(_){} const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,30),bs.map(b=>b.textContent.trim().slice(0,20)),k]; })(%s)" % json.dumps(w))
            if pref is not None and c[4] >= 0 and pref[c[4]].startswith('1:'): pref = [x for i, x in enumerate(pref) if i != c[4]]
            await L.touch_tap(cdp, c[0], c[1]); say('   ▶', c[2], '（選項：%s）' % ' / '.join(c[3]))
            await pg.wait_for_timeout(900); continue
        if s['dlg']:
            if MID['n'] < 3 and MID['run'] and any(k in (s.get('dtext') or '') for k in MID['keys']):
                MID['n'] += 1; await MID['run'].shot(pg, 'mid_%s_%d' % (MID['id'], MID['n']))
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if await phone_open(pg):   # BB-B 10-23：手機自己打開時人物也是 busy，原本先等 busy＝手機永遠不收（US370_k23 卡在 09:02）
            # BB-B 10-25 07:5x：臺灣學期中的快轉（semff3d.js S.menu）停在要回的訊息＝自己打開手機、關掉就接著跳（D103）＝先照 ffloop 的 asks 回，再關（R37_ABS_* 原本直接關掉＝沒回就跳到 4/10）
            if DRAIN_ASKS and await pg.evaluate("PHONE.pending(GAME.G).length"): await answer(pg, cdp, DRAIN_ASKS)
            if await phone_open(pg): await close_phone(pg)
            continue
        if s['busy']: await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(1000); s = await L.state(pg)
        if not (s['dlg'] or s['choices'] or s['busy']): return True
    return False
async def phone_open(pg):
    return await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide')&&getComputedStyle(p).display!=='none'; })()")
async def close_phone(pg):
    await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b) b.click(); })()"); await pg.wait_for_timeout(500)
async def answer(pg, cdp, rules):
    """要回覆的訊息：打開手機 → 訊息 → 點那個對話串 → 點選項（照玩家）。rules：{ask id 前綴: 選項開頭}"""
    PEND = "(()=>PHONE.pending(GAME.G).map(m=>({id:m.ask.id, th:PHONE.th(m), text:m.text, opts:m.ask.opts.map(o=>o.t)})))()"
    QDUE = "(()=>{ const G=GAME.G, P=PHONE.rec(G), t=G.day*24+G.hour; return (P.q||[]).some(x=>x&&x.day!=null&&x.day*24+(+x.h||0)<=t+0.02); })()"
    pend = await pg.evaluate(PEND)
    for _ in range(8):   # BB-B 10-25 07:4x：臺灣學期中的快轉（semff3d.js）停在訊息的時間，訊息要等下一次手機規則（0.5 秒）才送到；原本馬上讀＝空的、沒回就再快轉（R37_ABS_*）
        if pend or not await pg.evaluate(QDUE): break
        await pg.wait_for_timeout(800); pend = await pg.evaluate(PEND)
    done = False
    for m in pend:
        want = next((v for k, v in rules.items() if k != '*' and m['id'].startswith(k)), None)
        if want is None and '*' in rules and m['opts']: want = m['opts'][0]   # BB-B 10-24 23:0x（AA-B：逐日劇本的邀約都沒回）：'*'＝其他要回的都選第一個
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
        rules.pop(next((kk for kk in rules if kk != '*' and m['id'].startswith(kk)), None), None); done = True   # BB-B 10-25 00:5x：'*' 選中的沒有前綴可以拿掉（原本 next() 沒預設值 → StopIteration，劇本 8/5 就中斷）
    if await phone_open(pg): await close_phone(pg)
    return done
async def set_h(pg, run, h, why):
    await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; if(GAME.updateHUD) GAME.updateHUD(); })(%s)" % h); run.setup('[捷徑] 時鐘撥到 %.2f（%s）' % (h, why)); await pg.wait_for_timeout(1500)
async def play_until(pg, cdp, run, h, sc, secs=420):
    """遊戲時間照走到 h；中間有對話照選項偏好、有要回的訊息照 rules、出遊「出發」"""
    t0 = time.time(); last = None; sn0 = None; lim = secs
    # BB-B 10-23 19:1x：負載 25 時遊戲時間每 420 秒只走 0.2～0.35 小時（FOOD51、ZR43、REB 都是「等不到」＝腳本 FAIL）。
    # 看了 90 秒以後照實際速度估還要多久，上限往後延（最多 2400 秒）；遊戲時間沒在走（卡住）就不延，照原本的上限判失敗
    while time.time() - t0 < lim:
        sn = await pg.evaluate(SNAP)
        if sn['h'] >= h: return True
        if sn0 is None: sn0 = (time.time(), sn['h'], sn.get('key'))
        el = time.time() - sn0[0]
        if el > 90 and sn.get('key') == sn0[2] and sn['h'] > sn0[1] + 0.01:
            need = (h - sn['h']) / ((sn['h'] - sn0[1]) / el)
            lim = max(lim, min(2400, (time.time() - t0) + need + 60))
        s = await L.state(pg)
        if sc.get('asks') and not s['dlg'] and not s['choices'] and await answer(pg, cdp, sc['asks']): continue   # BB-B 10-23：要回的訊息先回（手機自己打開＝busy，原本先 drain 就不回）
        if s['dlg'] or s['choices'] or s['busy']: await drain(pg, cdp, pref=sc.get('pref', []) + ['出發', '接起來'], secs=180); continue
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
    # BB-B 10-24 03:5x：eqflags 的旗標也要讀（zr43r2 的 ZR43_SEEN／GF／LATE 只寫 eqflags、沒寫 cflags＝讀到 {}，判 FAIL；遊戲的送機事件有演完、after 會記）
    a = {'flags': list(dict.fromkeys(list(sc.get('cflags', [])) + list(sc.get('eqflags', {}).keys()))), 'mem': sc.get('cmem', []), 'npcs': sc.get('cnpcs', []), 'once': sc.get('once', sc.get('want', []))}
    for _ in range(10):   # BB-B 10-23：黑幕淡出中（US370_lake 0.94，截圖已經沒有黑幕）＝等它淡完再看，最多 5 秒
        fo = await pg.evaluate("(()=>{ const f=document.getElementById('fade'); return f?+getComputedStyle(f).opacity:0; })()")
        if fo <= 0.05: break
        await pg.wait_for_timeout(500)
    o = await pg.evaluate(CHK % json.dumps(a)); txt = o['lines'] + o['msgTexts']; probs = []
    for w in sc.get('want', []):
        if not any(w in t for t in txt): probs.append('應該有「%s」，沒有' % w)
    for w in sc.get('wantMsg', []):
        if not any(w in t for t in o['msgTexts']): probs.append('手機應該有「%s」，沒有' % w)
    for w in sc.get('none', []):
        if any(w in t for t in txt): probs.append('不應該有「%s」，出現了' % w)
    for w in sc.get('noneMsg', []):
        if any(w == t for t in o['msgTexts']): probs.append('手機不應該有「%s」，出現了' % w)
    for pid, w in sc.get('replyHas', {}).items():   # sendchat 之後那個人回的（AA370 第 6 節第 3 題：學姊事務版「在圖書館。有事嗎？」）
        n0 = (sc.get('_sent') or {}).get(pid)
        rep = await pg.evaluate("((a)=>(GAME.G.msgs||[]).slice(a[1]).filter(m=>m.from===a[0]).map(m=>String(m.text||'')))(%s)" % json.dumps([pid, n0 if n0 is not None else 0]))
        say('   %s 回：%s' % (pid, json.dumps(rep[:4], ensure_ascii=False)))
        if n0 is None: probs.append('%s：沒有傳成訊息' % pid)
        elif not any(w in x for x in rep): probs.append('%s 回的沒有「%s」（%s）' % (pid, w, rep[:3]))
    for w, (k, hh, tol) in sc.get('msgAt', {}).items():   # 這一則訊息記在幾月幾日幾點（AA370 第 6 節第 5、8 題）
        at = await pg.evaluate("(w=>(GAME.G.msgs||[]).filter(m=>String(m.text||'')===w).map(m=>CALENDAR.dateOf(m.day).key+' '+(+m.h||0).toFixed(2)))(%s)" % json.dumps(w))
        say('   「%s」記在：%s' % (w[:14], at))
        if not at: probs.append('手機沒有「%s」' % w[:16])
        elif not any(a[:10] == k and abs(float(a[11:]) - hh) <= tol for a in at): probs.append('「%s」記在 %s（應該 %s %.2f）' % (w[:16], at, k, hh))
    for w, n in sc.get('countMsg', {}).items():   # 手機裡這一句剛好幾則（AA370 L4 雞蛋一則、L5 地址一次）
        c = sum(1 for t in o['msgTexts'] if t == w)
        if c != n: probs.append('手機「%s」有 %d 則（應該 %d 則）' % (w[:16], c, n))
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
    p = await pg.evaluate("(id=>{ const n=GAME.E.npcs.find(n=>n&&n.charId===id&&n.obj&&!n.hidden); return n?[n.obj.position.x,n.obj.position.z]:null; })(%s)" % json.dumps(who))   # BB-B 10-24 16:4x：不看 obj.visible（engine3d.js 鏡頭外的人物每一格設成 false）
    if not p: say('   ⚠ 這裡沒有 %s' % who); bad.append('找不到 %s（不在這個區域）' % who); return False
    if not await L.go_to(pg, cdp, run, p[0], p[1], 1.4, who, max_s=120): say('   ⚠ 走不到 %s' % who); bad.append('走不到 %s' % who); return False
    for k in range(25):   # BB-B 17:5x：互動鈕要等下一格（負載 25 時 3 秒以上）
        lab = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()")
        if '說話' in lab: break
        await pg.wait_for_timeout(800)
    say('   互動鈕：%s' % lab); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
    await drain(pg, cdp, pref=['聊', '說'], secs=150); return True
async def ff_bed(pg, cdp, run, want_key, want_h):
    """床 →「快轉」→「到下一個有事的日子」（真的操作），停下來的日期時間要是 want_key want_h（±0.75 小時）"""
    bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>(i.sleep||i.label==='睡覺')&&!i.hidden); return it?[it.x,it.z]:null; })()")
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
    for k in range(25):   # BB-B 10-23 16:5x：負載 25 時一格要 3 秒以上（0.3 fps），互動鈕下一格才出來；原本只等 3.2 秒就按（FOOD51_KX_*「按鈕「」」、什麼都沒買）＝等到 20 秒
        lab = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()")
        if lab: break
        await pg.wait_for_timeout(800)
    say('   互動：%s（按鈕「%s」）' % (it[2], lab)); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
    await drain(pg, cdp, pref=['「我陪妳走到捷運站。」', '進去', '離開'], secs=200); return True

USF = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'EXCHANGE_ROUTE': 'US', 'EXCH_RULE': 1, 'US_DEPARTED': True, 'US_ARRIVED': True, 'Y4_PATH': 'bar'}
USF_PRE = {k: v for k, v in USF.items() if k not in ('US_DEPARTED', 'US_ARRIVED')}   # 還沒出發（US-G）
USJS = "G.flags.US_ARRIVED_DAY=D('2028-08-02'); G.flags.Y4_PATH_DAY=D('2028-06-08');"
DATE = "G.flags.dating_heroine_05=true; G.flags.US1='together'; LV('heroine_05',70,60,60);"
ALONE = "G.flags.US1='alone'; LV('heroine_05',50,40,35);"
BED = "(()=>{ const s=US3.SPAWN.us_apartment_bed; GAME.E.placeAt?GAME.E.placeAt(GAME.E.player,s.x,s.z,0):GAME.E.player.obj.position.set(s.x,0,s.z); })();"
PLAT = "(()=>{ const s=US_APARTMENT_LAYOUT.spawns.fromOutside; GAME.E.placeAt?GAME.E.placeAt(GAME.E.player,s.x,s.z,0):GAME.E.player.obj.position.set(s.x,0,s.z); })();"
STOPS = []
async def go_home(pg, cdp, run):
    """BB-B 10-23：這一區沒有床（例：上完課停在美國校園）＝走到回公寓／回宿舍的出口按下去（照玩家）"""
    it = await pg.evaluate("(()=>{ const its=(GAME.E.interactables||[]).filter(i=>!i.hidden&&((i.exit&&/us_apartment|us_outside|dorm/.test(String(i.exit.to||'')))||/公寓|回宿舍|回家/.test(i.label||''))); const i=its[0]; return i?[i.x,i.z,i.label||'']:null; })()")
    if not it: return False
    if not await L.go_to(pg, cdp, run, it[0], it[1], 0.9, it[2], max_s=150): return False
    say('   回去：%s' % it[2]); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(3000); await drain(pg, cdp, secs=120); return True
BEDLIKE = ('睡', '快轉', '再撐', '在家休息')
async def bed_menu(pg, cdp, run, pref=None):
    """走到床邊、按「睡覺」，回傳床的選單（每個選項的字）"""
    bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>(i.sleep||i.label==='睡覺')&&!i.hidden); return it?[it.x,it.z,it.radius||1.8]:null; })()")
    for _ in range(2):   # 這一區沒有床＝先回去（最多兩段：校園 → 社區 → 公寓）
        if bed: break
        if not await go_home(pg, cdp, run): break
        bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>(i.sleep||i.label==='睡覺')&&!i.hidden); return it?[it.x,it.z]:null; })()")
    near = min(0.8, (bed[2] if bed and len(bed) > 2 else 1.8) * 0.7) if bed else 0.8   # BB-B 18:2x：日本宿舍的床半徑 0.6 m，停在 0.8 m 互動鈕不會出來
    if not bed: say('   ⚠ 這一區沒有床'); bad.append('走不到床'); return []
    if not await L.go_to(pg, cdp, run, bed[0], bed[1], near, '床'):
        # BB-B 10-23 19:4x：負載高時日本宿舍（jp_room）的小房間走不到床（B7_EVE_MISS）→【捷徑】直接放到床邊（半徑以內、站得住的格子），再試一次；還是不行才算問題
        ok = await pg.evaluate("(([x,z,r])=>{ const E=GAME.E, P=E.player; for(const d of [r*0.5,r*0.7,0.4]) for(let a=0;a<8;a++){ const px=x+Math.cos(a*Math.PI/4)*d, pz=z+Math.sin(a*Math.PI/4)*d; if(!E.nav||E.nav.free(px,pz)){ if(E.placeAt) E.placeAt(P,px,pz,0); else P.obj.position.set(px,0,pz); return [px,pz]; } } return null; })(%s)" % json.dumps([bed[0], bed[1], bed[2] if len(bed) > 2 else 1.0]))
        if run: run.setup('[捷徑] 走不到床：直接放到床邊 %s' % json.dumps(ok))
        if not ok: say('   ⚠ 走不到床'); bad.append('走不到床'); return []
        await pg.wait_for_timeout(2500)
    # BB-B 10-23 16:4x：畫面上已經有別的選項或對話（「出發：七夕」剛跳出來、床邊的包裹「拆／先不拆」）＝先演完再按床——原本照樣按互動鈕的位置，
    #   劇情中互動鈕不收觸控，手指落到疊在那裡的選項（QX27_LAST 按到「晚一點」、錯過七夕）；QX26_GO 按完床是一段對話、床的選單是空的就中斷
    taps = 0
    for k in range(40):
        s = await L.state(pg)
        if s['choices']:
            cs = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
            if any(w in c for c in cs for w in BEDLIKE): break
            say('   床邊先有別的選項：先選（%s）' % ' / '.join(x[:16] for x in cs)); await drain(pg, cdp, pref=pref or [], secs=150); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue   # 對話一句一句翻（床邊的那一段可能先說一句才出選單：只翻、不替它選）
        if taps >= 4: break
        await close_phone(pg); await pg.wait_for_timeout(600)
        s = await L.state(pg)
        if s['choices'] or s['dlg']: continue
        for _ in range(25):   # BB-B 18:1x：互動鈕要等下一格才出來（負載 25 時 3 秒以上；B7_MSGS 日本宿舍按了四次都是空的）
            if (await L.state(pg))['interact']: break
            await pg.wait_for_timeout(800)
        await L.tap(pg, cdp, '#interact'); taps += 1; await pg.wait_for_timeout(1500)
        for _ in range(40):   # BB-B 18:2x：日本宿舍的「睡覺」先切到據點（jp_hub），選單要再過幾格才出來（每秒不到 1 格時 15 秒都還沒有）＝按了以後等到選單或對話出現（最多約 60 秒）再看
            s_ = await L.state(pg)
            if s_['choices'] or s_['dlg']: break
            await pg.wait_for_timeout(1500)
    cs = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
    sn = await pg.evaluate(SNAP); say('   床的選單 %s %.2f：%s' % (sn['key'], sn['h'], ' / '.join(x[:22] for x in cs))); return cs
async def tap_start(pg, cdp, start):
    c = await pg.evaluate("(w=>{ const e=[...document.querySelectorAll('#choices button')].find(b=>b.textContent.trim().startsWith(w)); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim()]; })(%s)" % json.dumps(start))
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200); return c[2]
async def bedpick(pg, cdp, run, start, sc, want_only=None):
    cs = await bed_menu(pg, cdp, run, sc.get('pref'))
    if want_only is not None:
        got = [x for x in cs]
        if any(not any(x.startswith(w) for w in want_only) for x in got): bad.append('%s：床的選單應該只有 %s，實際 %s' % (sc['id'], want_only, got))
    t = await tap_start(pg, cdp, start)
    if not t: bad.append('%s：床的選單沒有「%s」（%s）' % (sc['id'], start, cs)); return False
    say('   ▶ 床：%s' % t[:24]); await drain(pg, cdp, pref=sc.get('pref', []), secs=240)
    if sc.get('asks'): await answer(pg, cdp, sc['asks']); await drain(pg, cdp, pref=sc.get('pref', []), secs=120)
    return True
async def ff_once(pg, cdp, run, sc):
    """床 →「快轉」→「到下一個有事的日子」；回傳停下來的 SNAP"""
    try:   # BB-B 10-23 15:5x：有出遊「該出發了」（OUT.due）＝先等「出發」跳出來，不開床（QX28_US 9:00 市集：一停下來就又開床快轉，錯過）；同一個最多等三次
        due = await pg.evaluate("(()=>{ const q=typeof OUT!=='undefined'&&OUT.due?OUT.due(GAME.G):null; return q?q.id:null; })()")
    except Exception: due = None
    if due:
        k = sc.setdefault('_duewait', {}); k[due] = k.get(due, 0) + 1
        if k[due] <= 3:
            say('   ⏩ %s 該出發了：先等「出發」跳出來（第 %d 次），不開床' % (due, k[due]))
            for _ in range(12):   # BB-B 16:4x：提醒是遊戲每 0.5 秒檢查一次才跳，drain 看到畫面空著就回來了（QX27_LAST 三次都沒等到）＝先等選項或對話出來（最多約 18 秒）
                s_ = await L.state(pg)
                if s_['choices'] or s_['dlg']: break
                await pg.wait_for_timeout(1500)
            await drain(pg, cdp, pref=sc.get('pref', []), secs=120)
            return await pg.evaluate(SNAP)
    cs = await bed_menu(pg, cdp, run, sc.get('pref'))
    # BB-B 10-23 15:5x：床邊已經寫「約好的時間」＝約就在眼前，玩家會睡到被叫醒或撐著等，不會再快轉（原本再按快轉就跳過約：QX26/27/28、B6_SEND_AIR_D）
    if cs and any('約好的時間' in c for c in cs) and any(c.startswith('快轉') for c in cs):
        nap = next((c for c in cs if c.startswith('睡一下') and '約好的時間' in c), None)
        safe = [c for c in cs if (c.startswith('小睡') or c.startswith('睡到')) and '約好的時間' not in c]   # 睡了不會超過約好的時間的（最長的那個）。BB-B 10-25 06:4x：「睡到明天早上（07:30）」也算（約在隔天 09:00 的 R35_QX 原本每次只撐 10 分鐘、撐 12 小時）
        if nap: t = await tap_start(pg, cdp, '睡一下'); say('   ▶ 床：%s（約好的時間到了會叫醒）' % nap[:30])
        elif safe: t = await tap_start(pg, cdp, safe[-1][:6]); say('   ▶ 床：%s（不超過約好的時間）' % safe[-1][:24])
        else: t = await tap_start(pg, cdp, '再撐一下'); say('   ▶ 床：再撐一下（約好的時間就快到了，不快轉）'); await pg.wait_for_timeout(6000)
        await pg.wait_for_timeout(2500); sn = await pg.evaluate(SNAP); STOPS.append((sc['id'], sn['key'], sn['h'])); say('   ⏩ 停在 %s %.2f %s（等約好的時間）' % (sn['key'], sn['h'], sn['zone']))
        await drain(pg, cdp, pref=sc.get('pref', []), secs=240)
        if sc.get('asks'): await answer(pg, cdp, sc['asks']); await drain(pg, cdp, pref=sc.get('pref', []), secs=120)
        return sn
    if cs and not any(c.startswith('快轉') for c in cs):   # BB-B 15:5x：隔天一早有課（「會錯過」）或在家裡的床（睡覺／在家休息／回宿舍）沒有快轉＝照玩家：睡到明天早上／睡覺（B6_IV1、B6_IV2_*）
        alt = next((c for c in cs if c.startswith('睡到明天早上')), None) or next((c for c in cs if c.startswith('睡覺')), None)
        if alt:
            await tap_start(pg, cdp, alt[:6]); say('   ▶ 床：%s（沒有快轉）' % alt[:24]); await pg.wait_for_timeout(2500)
            sn = await pg.evaluate(SNAP); STOPS.append((sc['id'], sn['key'], sn['h'])); say('   ⏩ 停在 %s %.2f %s（睡到早上）' % (sn['key'], sn['h'], sn['zone']))
            await drain(pg, cdp, pref=sc.get('pref', []), secs=240)
            if sc.get('asks'): await answer(pg, cdp, sc['asks']); await drain(pg, cdp, pref=sc.get('pref', []), secs=120)
            return sn
    if not await tap_start(pg, cdp, '快轉'): bad.append('%s：床的選單沒有「快轉」（%s）' % (sc['id'], cs)); return None
    t = await tap_start(pg, cdp, '到下一個有事的日子') or await tap_start(pg, cdp, '到下一個有事')   # BB-B 10-25 07:2x：臺灣學期中的快轉（semff3d.js）叫「到下一個有事的時候有劇情、要回的訊息、約好的事就停…」
    if not t: cs2 = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())"); bad.append('%s：快轉沒有「到下一個有事的日子」（%s）' % (sc['id'], cs2)); return None
    await pg.wait_for_timeout(2500); sn = await pg.evaluate(SNAP); STOPS.append((sc['id'], sn['key'], sn['h'])); say('   ⏩ 停在 %s %.2f %s' % (sn['key'], sn['h'], sn['zone']))
    try:   # BB-B 10-23 S3_LAKE：快轉停在出遊開始的那一刻，「出發」沒有跳出來、再快轉就錯過——停下來的時候記下該出發的出遊和畫面上的選項
        dg = await pg.evaluate("(()=>{ const G=GAME.G, q=typeof OUT!=='undefined'&&OUT.due?OUT.due(G):null, pl=(typeof OUT!=='undefined'?OUT.rec(G):[]).filter(x=>x.state==='planned').map(x=>x.id+'@'+CALENDAR.dateOf(x.day).key+' '+x.h); return {due:q?q.id:null, planned:pl.slice(0,6), choices:[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,14)), h:+G.hour.toFixed(3)}; })()")
        if dg.get('due') or dg.get('choices'): say('   ⏩ 停下來：%s' % json.dumps(dg, ensure_ascii=False)[:400])
    except Exception as e: say('   ⏩ 停下來（記錄失敗 %r）' % e)
    await drain(pg, cdp, pref=sc.get('pref', []), secs=240)
    if sc.get('asks'): await answer(pg, cdp, sc['asks']); await drain(pg, cdp, pref=sc.get('pref', []), secs=120)
    return sn
async def go_class(pg, cdp, run, sc):
    """平台「去上課：…」（從房間走到平台）"""
    ok = await use(pg, cdp, run, '^去上課'); return ok
async def ffloop(pg, cdp, run, sc, until_key, until_h, n=30):
    """一直快轉到 until；中間有「去上課」就去上課（玩家會去）"""
    global DRAIN_ASKS; DRAIN_ASKS = sc.get('asks') or {}   # drain 遇到手機自己打開時照這個回（見 drain）
    await pg.evaluate("(()=>{ if(typeof STORY!=='undefined'&&STORY.tick&&!STORY.__bbTick){ const t0=STORY.tick; STORY.tick=function(){ window.__ST=(window.__ST|0)+1; return t0.apply(this,arguments); }; STORY.__bbTick=1; } })()")   # 數 STORY.tick 跑了幾次（不改行為）
    for i in range(n):
        # BB-B 10-23 17:3x：停下來以後等遊戲的劇情檢查（STORY.tick，每 30 格一次）至少跑過一次再看——手機訊息、出遊提醒都在那裡發。
        #   負載 25 時 30 格要 100 秒以上，原本只等 3 秒就再快轉：QX28_US 8/25 17:00 停下來是為了她的訊息，訊息還沒發就又快轉到 9/4（真機 30 格不到 1 秒）
        st0 = await pg.evaluate("window.__ST|0")
        for _ in range(50):
            await pg.wait_for_timeout(3000)
            if (await pg.evaluate("window.__ST|0")) > st0: break
        await pg.wait_for_timeout(1500); await drain(pg, cdp, pref=sc.get('pref', []), secs=90)   # 醒來、停下來以後先站幾秒（玩家會看一下）：讓遊戲有機會開始那一刻的事件（r_us_life 第一次：04:30 一醒來就按床快轉，時差那一段沒機會演）
        sn = await pg.evaluate(SNAP)
        if (sn['key'], sn['h']) >= (until_key, until_h): return True
        cls = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.uslClass&&!i.hidden); return it?it.label:null; })()")
        if cls and sc.get('takeClass', True): say('   去上課：%s' % cls); await go_class(pg, cdp, run, sc); continue
        if not await ff_once(pg, cdp, run, sc): return False
    say('   ⚠ 快轉 %d 次還沒到 %s %.2f' % (n, until_key, until_h)); bad.append('%s：快轉 %d 次還沒到 %s %.2f' % (sc['id'], n, until_key, until_h)); return False
def check_stops(sc, want):
    """want：[(key,h)] 要依序出現在這一段的停點裡（±0.35 小時）"""
    got = [(k, h) for i, k, h in STOPS if i == sc['id']]; j = 0
    for k, h in got:
        if j < len(want) and k == want[j][0] and abs(h - want[j][1]) <= 0.35: j += 1
    if j < len(want): bad.append('%s：停點少了 %s %.2f（實際 %s）' % (sc['id'], want[j][0], want[j][1], ['%s %.2f' % x for x in got][:30]))
    say('   停點：%s' % ['%s %.2f' % x for x in got][:40])
SCENS = [
  # US-G 出發日（AA_370 H2，LAWWW 2026-10-21 19:06 要加；開發分支 3a4c01cf）：8/2 05:50 宿舍（沒交往＝挽回中）→ 遊戲時間照走、06:00 自動出發 → 出境大廳 13:00：
  #   沒有「搭車離開（回台北）」、有「登機：飛往美國」→ 不按登機、站著等 → 13:30 還在出境大廳、沒抵達 → 14:00（進來一小時）自動登機 →「飛往美國」字卡 → 抵達、US_ARRIVED
  dict(id='USG_depart', key='2028-08-02', h=5.83, zone='dorm', flags=dict(USF_PRE), js="G.flags.Y4_PATH_DAY=D('2028-06-08');",
       steps=[('until', 7.1, 600), ('airport',), ('until', 7.6, 600), ('notyet',), ('until', 8.4, 900)], pref=['出發'],   # AA370-US-FIX（d22748f5）：06:00 出發、07:00 到機場、08:00 自動登機、09:30 起飛、當地 16:30 落地
       want=['出發｜桃園機場第二航廈', 'CARD:飛往美國｜舊金山轉機到印第安納　約 19 小時', 'CARD:抵達｜美國印第安納　當地時間 16:30'], none=['25:00'], eqflags={'US_DEPARTED': True, 'US_ARRIVED': True}, wantZone='us_outside',
       cflags=['US_DEPARTED', 'US_AIRPORT_AT', 'US_ARRIVED', 'US_ARRIVED_DAY', 'US1']),
  # US-A 交往中：8/2 21:40 床尾 → 睡覺（04:30，只有這一個睡法）→ 時差旁白、05:10 學姊兩則（回「醒了。」）→ 一路快轉到 9/4 17:00 會所烤肉
  dict(id='USA_dating', key='2028-08-02', h=21.67, zone='us_apartment', flags=dict(USF), js=USJS + DATE + BED,
       steps=[('bedpick', '睡覺', ['睡覺', '再撐一下']), ('ffloop', '2028-09-04', 17.0)], asks={'sis0803': '醒了。'}, pref=['出發', '去', '「好。」'],
       stops=[('2028-08-04', 9.75), ('2028-08-05', 17.5), ('2028-08-14', 9.75), ('2028-08-21', 9.0), ('2028-09-04', 17.0)], gapmax=7,
       want=['醒了。'], cflags=['USL_JETLAG', 'US_LAKE_FIRST']),
  # US-B 挽回中：8/3 旁白多一句 C 棟窗戶、沒有學姊訊息；8/5 沒有邀約
  dict(id='USB_alone', key='2028-08-02', h=21.67, zone='us_apartment', flags=dict(USF), js=USJS + ALONE + BED,
       steps=[('bedpick', '睡覺', ['睡覺', '再撐一下']), ('ffloop', '2028-08-06', 9.0)], pref=['出發', '去'],
       want=['C 棟有一扇窗的燈也亮著'], noneMsg=['傍晚去湖邊走走。……走路十五分鐘。'], cflags=['USL_JETLAG']),
  # US-C 一鍵上課：9/11（一）09:30 平台 → 去上課：字卡、2D 教室、一句旁白；之後站在校園台階下
  dict(id='USC_class', key='2028-09-11', h=9.5, zone='us_apartment', flags=dict(USF, USL_JETLAG=True), js=USJS + DATE + PLAT,
       steps=[('use', '^去上課')], pref=['出發'], wantZone='us_campus', cflags=[]),
  # US-E 台灣的課務不出現：9/2 23:00 睡到 9/3、9/4 → 沒有選課結果、沒有開學提示
  dict(id='USE_notw', key='2028-09-02', h=23.0, zone='us_apartment', flags=dict(USF, USL_JETLAG=True), js=USJS + DATE + BED,
       steps=[('sleep',), ('set', 22.5, '9/3 白天'), ('sleep',)], pref=['睡到明天', '睡覺'],
       none=['選課結果', '開學了', '加退選'], cflags=[]),
  # US-I 不能約臺灣朋友：9/20 15:00 公寓，阿哲 FRIEND＋有聯絡方式 → 手機「人」阿哲那一列沒有「約」、寫「你人在美國。」
  dict(id='USI_noinvite', key='2028-09-20', h=15.0, zone='us_apartment', flags=dict(USF, USL_JETLAG=True), js=USJS + DATE + PLAT + "LV('zhe',60,50,50);",
       steps=[('phoneppl', 'zhe')], cflags=[]),
  # US-J 10/16 21:00 學姊「改過的報告拿了 A。」（交往中、US2＝there／missed：r2y4a3d.js；原本設 'keep' 不是遊戲用的值）；10/15 還沒有
  dict(id='USJ_report', key='2028-10-16', h=20.5, zone='us_apartment', flags=dict(USF, USL_JETLAG=True, US2='there'), js=USJS + DATE + PLAT,
       steps=[('until', 21.4)], wantMsg=['改過的報告拿了 A。'], cflags=['US2']),
  # US-F 萬聖節（AA_340 G4＋AA_345 I2；BB 2026-10-21 18:4x 補）：10/31 17:57 公寓 → 18:00 門鈴「（開門）」＝蘋果（沒去過亞洲超市三個不同的日子）；
  #   [捷徑] 跳到 18:59 → 19:00 第二次門鈴「（開門）」＝戴皇冠的小女孩、剩下的都給她
  dict(id='USF_apple', key='2028-10-31', h=17.95, zone='us_apartment', flags=dict(USF, USL_JETLAG=True), js=USJS + ALONE + PLAT,
       steps=[('until', 18.4), ('set', 18.98, '第二次門鈴前（19:00）'), ('until', 19.4)], pref=['（開門）'],
       want=['你把冰箱裡的蘋果給了他們。', '一個戴著皇冠的小女孩'], none=['小饅頭餅乾'], eqflags={'USL_HALLOWEEN': 'open', 'USL_HALLOWEEN2': 'open'}, cflags=['USL_HALLOWEEN', 'USL_HALLOWEEN2']),
  # 去過亞洲超市三個不同的日子（[前置] USL_ASIA_N＝3）＝小饅頭餅乾
  dict(id='USF_cookie', key='2028-10-31', h=17.95, zone='us_apartment', flags=dict(USF, USL_JETLAG=True, USL_ASIA_N=3), js=USJS + ALONE + PLAT,
       steps=[('until', 18.4)], pref=['（開門）'], want=['你把亞洲超市買的小饅頭餅乾給了他們。'], none=['冰箱裡的蘋果'], cflags=[]),
  # 交往中：門鈴照樣響；[捷徑] 跳到 20:27 → 20:30 學姊兩則
  dict(id='USF_dating', key='2028-10-31', h=17.95, zone='us_apartment', flags=dict(USF, USL_JETLAG=True), js=USJS + DATE + PLAT,
       steps=[('until', 18.4), ('set', 20.45, '20:30 學姊訊息前'), ('until', 20.7)], pref=['（開門）'],
       wantMsg=['我們這戶買了兩包糖。室友說不夠。', '……她說對了。七點半就發完了。'], cflags=[]),
  # US-D 時差：交往中可昕（dating_kexin）、10/16 22:00 睡覺 → 10/17 08:45「可昕的視訊：週年」（09:00）第一句「你那邊是早上吧。」
  dict(id='USD_kexin', key='2028-10-16', h=22.0, zone='us_apartment', flags=dict(USF, USL_JETLAG=True, dating_kexin=True), js=USJS + BED,
       steps=[('sleep',), ('until', 9.4)], pref=['接起來', '出發'], want=['你那邊是早上吧。'], cflags=[]),
  # 同上，但床挑「鬧鐘 08:30」那一項（d3df1cf3 的鬧鐘本身；BB 15:0x：第一項「睡到明天中午（12:00）（第一堂 13:00…）」沒照鬧鐘）
  dict(id='USD_kexin_alarm', key='2028-10-16', h=22.0, zone='us_apartment', flags=dict(USF, USL_JETLAG=True, dating_kexin=True), js=USJS + BED,
       steps=[('bedhas', '鬧鐘 08:30'), ('until', 9.4)], pref=['接起來', '出發'], want=['你那邊是早上吧。'], cflags=[]),
  # US-H 回台灣：12/15 22:00（交往中）睡覺 → 12/16 離開、舊金山一週 → 12/21 23:55「飛回臺灣」→ 抵達 05:40 → 入境大廳（不是黑底）
  dict(id='USH_home', key='2028-12-15', h=22.0, zone='us_apartment', flags=dict(USF, USL_JETLAG=True), js=USJS + DATE + BED,
       steps=[('sleep',), ('ffloop', '2028-12-23', 9.3)], pref=['出發', '去', '「好。」'], want=['飛回臺灣', '05:40', 'CG:cg_sf_bridge_fog_heroine05', '阿姨好。……上次的鳳梨酥，很好吃。', '（九點。廚房裡有粥的味道。你回來了。）'], none=['伯母好。……我是書瑀。'], msgAt={'📷（每個人手上的禮物，都很眼熟。）': ('2028-12-22', 21.5, 0.1)}, cflags=['US_TRIP_DONE', 'US1']),   # CG-APPROVED-MISSING-1021：交往中舊金山第二天出 BCG-48（霧裡的大橋，4df34170）
  # ===== AA370-US-FIX-1021（AA_370 第 5 節、LAWWW 20:23；開發分支 d22748f5 起）=====
  # K23 和可昕：10/18 當地 09:00 三則（視訊各自說；第一則 AA_378 改成「你的那條路，現在走到哪了？」，BB-B 10-23 跟上）→ 回「改天。」→「好。那週六晚上九點，你那邊早上九點。」→ 10/21 08:45「接起來：和可昕視訊」→ 視訊：「我要考律師。從現在開始準備。」
  dict(id='US370_k23', key='2028-10-18', h=8.5, zone='us_apartment', flags=dict(USF, USL_JETLAG=True, dating_kexin=True), js=USJS + ALONE + PLAT,
       steps=[('until', 9.3), ('ffloop', '2028-10-21', 9.6)], asks={'y4_kx23': '改天。'}, pref=['接起來', '「（照實說自己的選擇）」', '出發'],
       wantMsg=['你的那條路，現在走到哪了？不用現在說。', '週五晚上七點，你那邊是早上。我們視訊，各自說。', '好。那週六晚上九點，你那邊早上九點。'], want=['我要考律師。從現在開始準備。'], cflags=['KX23_CALL']),
  # 湖邊（交往中）：8/5 17:30「傍晚去湖邊走走。……走路十五分鐘。」→ 18:30 出發：湖邊 →「台灣這時候，天快亮了。」（不是吃宵夜）
  dict(id='US370_lake', key='2028-08-05', h=17.2, zone='us_apartment', flags=dict(USF, USL_JETLAG=True), js=USJS + DATE + PLAT,
       steps=[('until', 19.6, 900)], pref=['出發：湖邊', '出發'], wantMsg=['傍晚去湖邊走走。……走路十五分鐘。'], want=['台灣這時候，天快亮了。'], none=['台灣這時候，已經在吃宵夜了。'], cflags=['US_LAKE_FIRST']),
  # 雞蛋（交往中）：9/16 只有一則「今天的雞蛋，日期是對的。」（R3 那一份拿掉了）；沒交往：沒有
  dict(id='US370_egg', key='2028-09-16', h=11.6, zone='us_apartment', flags=dict(USF, USL_JETLAG=True), js=USJS + DATE + PLAT,
       steps=[('until', 13.0)], countMsg={'今天的雞蛋，日期是對的。': 1}, cflags=[]),
  dict(id='US370_eggAlone', key='2028-09-16', h=11.6, zone='us_apartment', flags=dict(USF, USL_JETLAG=True), js=USJS + ALONE + PLAT,
       steps=[('until', 13.0)], countMsg={'今天的雞蛋，日期是對的。': 0}, cflags=[]),
  # 地址（芷若熟、有聯絡方式）：8/10 當地 09:00 一次；到 8/21 還是一次（8/20 那一份拿掉了）
  dict(id='US370_addr', key='2028-08-10', h=8.6, zone='us_apartment', flags=dict(USF, USL_JETLAG=True), js=USJS + ALONE + PLAT + "LV('heroine_02',60,50,50); G.contacts=G.contacts||{}; G.contacts.heroine_02=D('2027-03-01');",
       steps=[('until', 9.4), ('ffloop', '2028-08-21', 10.0)], pref=['出發'], countMsg={'給我你在那邊的地址。英國寄到美國要多久，我想試試看。': 1}, cflags=[]),
  # 何俊朗：8/14 10:00 國際學生迎新（MET_LONG）→ 一路快轉 → 9/8 12:00 Legal Writing 下課：不再自我介紹
  dict(id='US370_long', key='2028-08-14', h=9.6, zone='us_apartment', flags=dict(USF, USL_JETLAG=True), js=USJS + ALONE + PLAT,
       steps=[('until', 11.0, 900), ('ffloop', '2028-09-08', 12.8)], pref=['出發：國際學生迎新', '出發：Legal Writing', '「亞洲超市九點關。」', '出發'],
       want=['香港來的。何俊朗。叫我 Long 就好。', '（Legal Writing 下課。第一次小考的成績剛發回來。）'], none=['我叫何俊朗。叫我 Long 就好。', 'B 棟的。又見面了。'], cflags=['MET_LONG']),
  # 大峽谷＋Q14（交往中、子晴朋友以上）：9/27 21:00 回「好。」→ 10/7 出發：秋假：大峽谷 → 10/14 18:00 回來 → 子晴 Q14 還能回（期限 10/15 12:00）
  dict(id='US370_q14', key='2028-09-27', h=20.6, zone='us_apartment', flags=dict(USF, USL_JETLAG=True), js=USJS + DATE + PLAT + "LV('heroine_04',60,50,50); G.contacts=G.contacts||{}; G.contacts.heroine_04=D('2026-10-01');",
       steps=[('until', 21.4), ('ffloop', '2028-10-15', 9.0)], asks={'y4_us_canyon': '好。', 'y4_q14': '我還是學生，不能給妳正式的法律意見。'}, pref=['出發：秋假：大峽谷', '出發'],
       eqflags={'US_CANYON': True, 'ZQ_CONTRACT': 'honest'}, wantMsg=['我們要跟一間發行商簽約。合約四十頁。'], cflags=['US_CANYON', 'ZQ_CONTRACT']),
  # 學姊在哪（沒交往）：11/11 芝加哥；12/2 20:30 小教堂前的台階、208 的門關著
  dict(id='US370_whereChi', key='2028-11-11', h=10.0, zone='us_apartment', flags=dict(USF, USL_JETLAG=True), js=USJS + ALONE + PLAT,
       steps=[('where', 'heroine_05', '芝加哥')], cflags=[]),
  dict(id='US370_where208', key='2028-12-02', h=20.4, zone='us_outside', flags=dict(USF, USL_JETLAG=True), js=USJS + ALONE,
       steps=[('where', 'heroine_05', '小教堂前的台階'), ('use', '^上樓（C 棟 208）')], want=['CAPTION:（208 的門關著。）'], cflags=[]),
  # AA370 第 6 節（LAWWW 21:04，bee56ca3）：8/3 05:10 學姊「醒了。」「我也還醒著。」→ 選第二個「……那就一起醒著。」
  dict(id='US370_awake', key='2028-08-02', h=21.67, zone='us_apartment', flags=dict(USF), js=USJS + DATE + BED,
       steps=[('bedpick', '睡覺', ['睡覺', '再撐一下']), ('until', 6.0)], asks={'sis0803': '我也還醒著。'}, wantMsg=['……那就一起醒著。'], noneMsg=['不知道。我只知道它們很準時。'], cflags=[]),
  # 學姊事務版（熟悉、沒交往），人在布魯明頓問「在幹嘛」→「在圖書館。有事嗎？」（不是貼圖）
  dict(id='US370_bizChat', key='2028-09-20', h=15.0, zone='us_apartment', flags=dict(USF, USL_JETLAG=True), js=USJS + "G.flags.US1='alone'; LV('heroine_05',25,10,10); G.contacts=G.contacts||{}; G.contacts.heroine_05=D('2026-02-01');" + PLAT,
       steps=[('sendchat', 'heroine_05', 'chat'), ('until', 17.0)], replyHas={'heroine_05': '在圖書館。有事嗎？'}, cflags=[]),
  # 可昕交往中、沒見過麵店團、不在群組：10/3 臺灣 22:00（當地 10:00）私訊「阿哲今年贏了。……」
  dict(id='US370_kxMoon', key='2028-10-03', h=9.3, zone='us_apartment', flags=dict(USF, USL_JETLAG=True, dating_kexin=True, KX_MET_NOODLE_TEAM=False), js=USJS + ALONE + PLAT + "if(G.phone&&G.phone.groups) delete G.phone.groups.noodle_team;",
       steps=[('until', 10.6)], wantMsg=['阿哲今年贏了。……你不在，我沒力氣講冷笑話。'], msgAt={'阿哲今年贏了。……你不在，我沒力氣講冷笑話。': ('2028-10-03', 10.0, 0.25)}, cflags=[]),
  # 亞洲超市：週日公休（10/15）；平日 21:00 以後關（10/17 21:30）——營業時間 AA_370 第 6 節第 2 題改成 10:00～21:00，開發分支還是 09:00（照現在的比，記下來）
  dict(id='US370_asiaSun', key='2028-10-15', h=14.0, zone='us_market', flags=dict(USF, USL_JETLAG=True), js=USJS + ALONE,
       steps=[('use', '^過馬路（對面的亞洲超市）')], want=['今天公休。下次開門：明天 10:00'], wantZone='us_market', cflags=[]),
  dict(id='US370_asiaNight', key='2028-10-17', h=21.5, zone='us_market', flags=dict(USF, USL_JETLAG=True), js=USJS + ALONE,
       steps=[('use', '^過馬路（對面的亞洲超市）')], want=['現在沒有開（今天 10:00–21:00）'], wantZone='us_market', cflags=[]),
  dict(id='US370_asiaMon', key='2028-10-16', h=9.5, zone='us_market', flags=dict(USF, USL_JETLAG=True), js=USJS + ALONE,   # 週一 09:30 還沒開（10:00 才開）
       steps=[('use', '^過馬路（對面的亞洲超市）')], want=['現在沒有開（今天 10:00–21:00）。下次開門：今天 10:00'], wantZone='us_market', cflags=[]),
]
async def bedhas(pg, cdp, run, sub, sc):
    """床的選單裡挑「字裡有 sub」的那一項（兩項都叫「睡到明天中午」的時候用：BB 15:0x USD_kexin）"""
    cs = await bed_menu(pg, cdp, run)
    c = await pg.evaluate("(w=>{ const e=[...document.querySelectorAll('#choices button')].find(b=>b.textContent.includes(w)); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim()]; })(%s)" % json.dumps(sub))
    if not c: bad.append('%s：床的選單沒有含「%s」的選項（%s）' % (sc['id'], sub, cs)); return False
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200); say('   ▶ 床：%s' % c[2][:48])
    await drain(pg, cdp, pref=sc.get('pref', []), secs=240); say('   睡醒：%s' % json.dumps(await pg.evaluate(SNAP), ensure_ascii=False)); return True
async def sleep_bed(pg, cdp, run):
    sn = await pg.evaluate(SNAP)
    if sn['h'] < 21: await set_h(pg, run, 22.0, '晚上才能睡整晚')
    bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>(i.sleep||i.label==='睡覺')&&!i.hidden); return it?[it.x,it.z]:null; })()")
    if not bed or not await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床'): say('   ⚠ 走不到床'); return False
    for k in range(4):
        await close_phone(pg); await pg.wait_for_timeout(800); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        if (await L.state(pg))['choices']: break
    await drain(pg, cdp, pref=['睡到明天早上', '睡到明天', '睡覺'], secs=240); say('   睡醒：%s' % json.dumps(await pg.evaluate(SNAP), ensure_ascii=False)); return True
async def main():
    run = L.Run('us_life', OUT); base = json.load(open(SAVE, encoding='utf-8'))
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
                    if st[0] == 'until': await play_until(pg, cdp, run, st[1], sc, *st[2:3])
                    elif st[0] == 'airport':   # US-G：出境大廳的互動點（不按，只看）
                        z = await pg.evaluate("GAME.G.zone"); labs = await pg.evaluate("(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>i.label||'')")
                        aat = await pg.evaluate("GAME.G.flags.US_AIRPORT_AT===undefined?null:GAME.G.flags.US_AIRPORT_AT"); sn = await pg.evaluate(SNAP)
                        say('   出境大廳 %s %s %.2f：互動點 %s｜US_AIRPORT_AT=%s' % (z, sn['key'], sn['h'], ' / '.join(labs), aat)); await run.shot(pg, 'airport_' + sc['id'])
                        if z != 'airport_dep': bad.append('%s：%.2f 應該在出境大廳（實際 %s）' % (sc['id'], sn['h'], z))
                        if any('搭車離開' in x for x in labs): bad.append('%s：出境大廳還有「搭車離開（回台北）」' % sc['id'])
                        if not any(x.startswith('登機：飛往美國') for x in labs): bad.append('%s：出境大廳沒有「登機：飛往美國」（%s）' % (sc['id'], labs))
                        if aat is None: bad.append('%s：沒記進出境大廳的時間 US_AIRPORT_AT' % sc['id'])
                    elif st[0] == 'notyet':   # US-G：還沒滿一小時＝人還在出境大廳、沒抵達
                        o = await pg.evaluate("({z:GAME.G.zone, arr:!!GAME.G.flags.US_ARRIVED, h:+GAME.G.hour.toFixed(2)})"); say('   不按登機、等著：%s' % json.dumps(o, ensure_ascii=False))
                        if o['z'] != 'airport_dep' or o['arr']: bad.append('%s：還沒滿一小時就離開出境大廳或抵達了（%s）' % (sc['id'], json.dumps(o, ensure_ascii=False)))
                    elif st[0] == 'set': await set_h(pg, run, st[1], st[2])
                    elif st[0] == 'sleep': await sleep_bed(pg, cdp, run)
                    elif st[0] == 'bedhas': await bedhas(pg, cdp, run, st[1], sc)
                    elif st[0] == 'talk': await talk(pg, cdp, run, st[1])
                    elif st[0] == 'ff': await ff_bed(pg, cdp, run, st[1], st[2])
                    elif st[0] == 'nomsg': await nomsg(pg, st[1], st[2])
                    elif st[0] == 'use': await use(pg, cdp, run, st[1])
                    elif st[0] == 'bedpick':   # 讀檔那一刻的事件（例：抵達那天的公寓、亞洲超市、打給媽媽）先演完再去床（r_us_life 第一次 USA：邊演邊按床，床的選單是空的）
                        await pg.wait_for_timeout(3000); await drain(pg, cdp, pref=sc.get('pref', []), secs=240)
                        await bedpick(pg, cdp, run, st[1], sc, st[2] if len(st) > 2 else None)
                    elif st[0] == 'ffloop': await ffloop(pg, cdp, run, sc, st[1], st[2])
                    elif st[0] == 'phoneppl':
                        r = await pg.evaluate("(id=>{ const b=document.getElementById('btnPhone'); if(b) b.click(); return 1; })(%s)" % json.dumps(st[1])); await pg.wait_for_timeout(1500)
                        await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"friends\"]')||document.querySelector('#phoneTabs button[data-ptab=\"ppl\"]')||[...document.querySelectorAll('#phoneTabs button')].find(x=>/朋友|人/.test(x.textContent)); if(b) b.click(); })()"); await pg.wait_for_timeout(1500)
                        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''"); await run.shot(pg, 'phone_ppl_' + sc['id'])
                        say('   手機「人」：%s' % txt[:400].replace('\n', '｜'))
                        if '你人在美國。' not in txt: bad.append('%s：手機「人」沒有「你人在美國。」' % sc['id'])
                        await close_phone(pg)
                    elif st[0] == 'sendchat':   # 主動傳訊息（手機 → 朋友 → 那個人的「訊息」→「傳訊息」→ 話題），記下送之前 G.msgs 的長度
                        pid, topic = st[1], st[2]
                        await pg.evaluate("(()=>{ const b=document.getElementById('btnPhone'); if(b) b.click(); })()"); await pg.wait_for_timeout(1200)
                        await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"friends\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(900)
                        ok1 = await pg.evaluate("(id=>{ const b=[...document.querySelectorAll('#phoneBody [data-msg]')].find(x=>x.dataset.msg===id); if(!b) return false; b.click(); return true; })(%s)" % json.dumps(pid)); await pg.wait_for_timeout(900)
                        ok2 = await pg.evaluate("(id=>{ const b=document.querySelector('#phoneBody [data-msgto=\"'+id+'\"]'); if(!b) return false; b.click(); return true; })(%s)" % json.dumps(pid)); await pg.wait_for_timeout(900)
                        tops = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-msgt]')].map(b=>b.dataset.msgt+'='+b.textContent.trim())")
                        n0 = await pg.evaluate("(GAME.G.msgs||[]).length")
                        ok3 = await pg.evaluate("(k=>{ const b=document.querySelector('#phoneBody [data-msgt=\"'+k+'\"]'); if(!b) return false; b.click(); return true; })(%s)" % json.dumps(pid + '|' + topic)); await pg.wait_for_timeout(900)
                        say('   傳給 %s（%s）：朋友頁「訊息」%s、「傳訊息」%s、話題 %s → %s' % (pid, topic, ok1, ok2, tops, ok3)); await close_phone(pg)
                        if ok3: sc.setdefault('_sent', {})[pid] = n0
                        else: bad.append('%s：傳不了訊息給 %s（%s）' % (sc['id'], pid, tops))
                    elif st[0] == 'where':   # AA370 M9：GAME.whereText(人)（手機朋友那一列、資料頁「現在大概在」用的同一個）
                        w = await pg.evaluate("(id=>{ try{ return GAME.whereText(id)||''; }catch(e){ return 'ERR '+e; } })(%s)" % json.dumps(st[1])); npc = await pg.evaluate("(id=>!!(GAME.npc&&GAME.npc[id]))(%s)" % json.dumps(st[1]))
                        sn = await pg.evaluate(SNAP); say('   %s 在哪（%s %.2f）：「%s」；3D 裡有她：%s' % (st[1], sn['key'], sn['h'], w, npc))
                        if st[2] not in w: bad.append('%s：%s %s %.2f 應該在「%s」（實際「%s」）' % (sc['id'], st[1], sn['key'], sn['h'], st[2], w))
                    elif st[0] == 'grp':
                        g = await pg.evaluate("((PHONE.rec(GAME.G).groups||{}).noodle_team||{}).name||null"); say('   群組名稱（17:00 以後）：%s' % g)
                        if g != st[1]: bad.append('%s：群組名稱「%s」（應該「%s」）' % (sc['id'], g, st[1]))
                await drain(pg, cdp, pref=sc.get('pref', []) + ['出發'], secs=120)
                if sc.get('stops'): check_stops(sc, sc['stops'])
                if sc.get('wantZone'):
                    z = await pg.evaluate("GAME.G.zone"); say('   最後在：%s' % z)
                    if z != sc['wantZone']: bad.append('%s：最後在 %s（應該 %s）' % (sc['id'], z, sc['wantZone']))
                await verify(pg, run, sc)
            except Exception as e:
                say('   例外：%r' % e); bad.append('%s 例外 %r' % (sc['id'], e)); await run.shot(pg, 'ev_err_' + sc['id'])
            say('   （%.0f 秒）' % (time.time() - t0))
        json.dump({'results': results, 'bad': bad, 'rep': rep, 'stops': STOPS}, open(os.path.join(OUT, 'us_life.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
        run.check('US-LIFE：美國交換一學期（系統）', not bad, json.dumps(bad[:10], ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
    run.finish()
asyncio.run(main())

