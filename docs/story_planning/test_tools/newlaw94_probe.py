"""BB（帳號 A）2026-10-21：從標題「從法律系開始」新遊戲玩到 9/4（四）21:05，一次看三件：
  BUG-HOME-FAMGROUP-NEGIDX-1021（LAWWW 21:04）：9/4 20:00 手機「家人」群組媽媽問一句（原本整則沒發，console 一直出 HOME.phoneRules 警告）
  AA372 第 2 項：9/4 21:00 家族群組 Kevin 不再自我介紹，第一句「家族群組開好了。學弟，這次不用臥底了。」；沒有「歡迎學弟」「你的家族學長」
  AA372 第 4 項（觀察，AA_372 第 6 節還沒做完）：9/4 民總下課、追出來：對話框名字是「前排的女生」、按鈕「和她說話」，不出現「前排的小安」「和小安說話」
照玩家：對話點過去、選項照偏好（9/3 案例「認真讀完」、上課選答得好的那一個、跟她一起走去溫州街）、要回的訊息照第一個、晚上去床邊睡、
9/3 主線第一天走到書桌讀案例、9/4 起床選單「直接去上課」、下課走出教室和霖澤館。Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests python3 newlaw94_probe.py '<URL>/index.html?turbo' <輸出資料夾>"""
import os, sys, json, asyncio, time, re
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
bad = []; results = []
def say(*a): print(' '.join(str(x) for x in a), flush=True)
SNAP = """(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day); return {key:d.key, h:+(+G.hour).toFixed(2), zone:G.zone, readCase:G.flags.readCase||null, main:(typeof STORY!=='undefined'&&STORY.mainDay)?STORY.mainDay(G):null}; })()"""
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[]; const k=()=>{ try{ const G=GAME.G; return CALENDAR.dateOf(G.day).key+' '+(+G.hour).toFixed(2); }catch(e){ return ''; } };
  const o=ADV.log; ADV.log=function(n,t){ try{ window.__LOG.push(k()+' '+(n?n+'：':'')+t); }catch(e){} return o.apply(this,arguments); };
  if(GAME.caption){ const c=GAME.caption; GAME.caption=function(a,b){ try{ window.__LOG.push(k()+' CAPTION:'+[a,b].filter(x=>typeof x==='string').join('｜').replace(/<[^>]+>/g,'｜')); }catch(e){} return c.apply(this,arguments); }; }
  const ot=GAME.toast; GAME.toast=function(t){ try{ window.__LOG.push(k()+' TOAST:'+t); }catch(e){} return ot.apply(this,arguments); };
  setInterval(()=>{ try{ const n=((document.getElementById('dlgName')||{}).textContent||'').trim(), t=((document.getElementById('dlgText')||{}).textContent||'').trim().slice(0,24), b=document.getElementById('interact');
    const lab=b&&!b.classList.contains('hide')?b.textContent.trim():''; const key=n+'|'+t+'|'+lab; if(key!==window.__last){ window.__last=key; (window.__NM=window.__NM||[]).push(k()+' NAME:'+n+'｜'+t+'｜BTN:'+lab); } }catch(e){} },300); })()"""


def chk(ok, what, detail=''):
    say('[%s] %s %s' % ('PASS' if ok else 'FAIL', what, detail)); results.append({'ok': ok, 'what': what, 'detail': detail})
    if not ok: bad.append('%s %s' % (what, detail))


async def tap_js(pg, cdp, js):
    c = await pg.evaluate("(()=>{ const e=(%s); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.textContent||'').trim()||'(空)']; })()" % js)
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(800); return c[2]


async def choose(pg, cdp, pref):
    cs = await pg.evaluate("[...document.querySelectorAll('#choices button')].filter(b=>!b.disabled).map(b=>b.textContent.trim())")
    t = next((c for w in pref for c in cs if c.startswith(w)), None) or next((c for c in cs if not c.startswith(('翹這堂課', '不去了', '先不要', '再撐一下', '算了', '晚一點'))), None) or (cs[0] if cs else None)
    if not t: return None
    await tap_js(pg, cdp, "[...document.querySelectorAll('#choices button')].find(b=>b.textContent.trim()===%s)" % json.dumps(t)); say('   ▶ %s ／ %s' % (t[:30], [c[:12] for c in cs])); return t


PREF = ['睡到明天早上', '認真讀完', '直接去上課', '「網頁標價比較像要約之引誘', '跟她一起走去溫州街', '出發', '好', '「好']


async def main():
    os.makedirs(OUT, exist_ok=True); run = L.Run('newlaw94', OUT); cons = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('console', lambda m: cons.append(m.text) if m.type in ('warning', 'error') else None)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.tap(pg, cdp, '#btnNewLaw'); run.setup('標題「從法律系開始」新遊戲（不改狀態）')
        for k in range(60):
            if await pg.evaluate("!!(GAME.G&&GAME.running)"): break
            await pg.wait_for_timeout(1000)
        await pg.evaluate(HOOK)
        d94 = await pg.evaluate("STORY.dayOfKey('2025-09-04')"); t0 = time.time(); last = None; idle = 0; out_steps = 0
        while time.time() - t0 < 5400:
            sn = await pg.evaluate(SNAP)
            if sn['key'] != last: last = sn['key']; say('  [%5.1f 分] %s' % ((time.time() - t0) / 60, json.dumps(sn, ensure_ascii=False)))
            if sn['key'] == '2025-09-04' and sn['h'] >= 21.08: break
            if sn['key'] > '2025-09-04': break
            s = await L.state(pg)
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(380); idle = 0; continue
            if s['choices']: await choose(pg, cdp, PREF); await pg.wait_for_timeout(500); idle = 0; continue
            if await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide'); })()"):
                pend = await pg.evaluate("(typeof PHONE!=='undefined'&&PHONE.pending)?PHONE.pending(GAME.G).map(m=>({id:m.ask.id, th:PHONE.th(m)})):[]")
                if pend:
                    m = pend[0]; await tap_js(pg, cdp, "document.querySelector('#phoneTabs button[data-ptab=\"msg\"]')")
                    await tap_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===%s)" % json.dumps(m['th']))
                    await tap_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-ask]')].find(b=>b.dataset.ask===%s)" % json.dumps('%s|0' % m['id']))
                await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(600); idle = 0; continue
            if s['busy']: await pg.wait_for_timeout(600); continue
            lab = (s.get('interact') or '')
            # 9/4 下課：和她說話（看對話框的名字）
            if sn['key'] == '2025-09-04' and lab.startswith('和') and ('她' in lab or '小安' in lab or '以安' in lab) and not await pg.evaluate("!!window.__talkedAn"):
                await pg.evaluate("window.__talkedAn=1"); say('   互動鈕「%s」→ 按' % lab); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1000); continue
            idle += 1
            if idle < 3: await pg.wait_for_timeout(900); continue
            idle = 0
            # 主線第一天：書桌讀案例
            if sn['main'] == 1 and not sn['readCase'] and sn['zone'] == 'dorm':
                desk = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>!i.hidden&&/書桌/.test(i.label||'')); return it?[it.x,it.z,it.label]:null; })()")
                if desk and await L.go_to(pg, cdp, run, desk[0], desk[1], 0.8, desk[2], max_s=60): await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200); continue
            # 9/4 下課以後：走出教室、霖澤館，離門口 6 m 以上（她追出來）
            if sn['key'] == '2025-09-04' and 15.0 <= sn['h'] < 19 and out_steps < 8:
                ex = await pg.evaluate("(()=>{ const its=(GAME.E.interactables||[]).filter(i=>!i.hidden&&(i.exit||/離開|出去|走出/.test(i.label||''))); return its.map(i=>[i.x,i.z,i.label,i.exit&&i.exit.to]); })()")
                if sn['zone'] in ('classroom', 'linze') and ex:
                    e0 = next((e for e in ex if e[3] in ('linze', 'campus')), ex[0]); out_steps += 1
                    if await L.go_to(pg, cdp, run, e0[0], e0[1], 0.8, e0[2], max_s=60): await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
                    continue
                if sn['zone'] == 'campus' and not await pg.evaluate("!!(GAME.G.flags.metAn||GAME.G.flags.met_an)"):
                    out_steps += 1; await L.go_to(pg, cdp, run, 30, -99.0, 1.0, '霖澤館前 8 m', max_s=60); await pg.wait_for_timeout(3000); continue
            # 晚上：21:10 以後才去睡（等 20:00、21:00 的訊息）
            if sn['h'] >= 21.15 or sn['h'] < 5 or (sn['key'] < '2025-09-04' and sn['h'] >= 21.0):
                bed = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
                if bed and await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床', max_s=90): await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
                continue
            await pg.wait_for_timeout(1500)
        sn = await pg.evaluate(SNAP); say('   停在：%s' % json.dumps(sn, ensure_ascii=False))
        msgs = await pg.evaluate("(GAME.G.msgs||[]).filter(m=>CALENDAR.dateOf(m.day).key==='2025-09-04').map(m=>({th:PHONE.th(m), from:m.from||'', h:+(+m.h||0).toFixed(2), text:String(m.text||'')}))")
        lg = await pg.evaluate("window.__LOG||[]"); nm = await pg.evaluate("window.__NM||[]"); await run.shot(pg, 'end_0904')
        json.dump({'msgs': msgs, 'lines': lg, 'names': nm, 'console': cons[-50:]}, open(os.path.join(OUT, 'newlaw94.json'), 'w'), ensure_ascii=False, indent=0)
        home = [m for m in msgs if m['th'] in ('g:home', 'g:family') or (m['from'] in ('mom', 'home_mom') and m['th'].startswith('g:'))]
        fam = [m for m in msgs if m['th'] == 'g:family_law']
        say('   9/4 家人群組：%s' % json.dumps(home, ensure_ascii=False)); say('   9/4 家族群組：%s' % json.dumps(fam, ensure_ascii=False))
        warn = [c for c in cons if 'phoneRules' in c]; say('   console 的 phoneRules 警告：%d 則 %s' % (len(warn), warn[:2]))
        chk(any(19.9 <= m['h'] <= 20.6 for m in home), 'BUG-HOME-FAMGROUP：9/4 20:00「家人」群組媽媽問一句', json.dumps(home[:3], ensure_ascii=False))
        chk(not warn, 'BUG-HOME-FAMGROUP：console 沒有 HOME.phoneRules 警告', json.dumps(warn[:2], ensure_ascii=False))
        kv = [m for m in fam if m['from'] == 'kevin' or 'Kevin' in m['from']]
        chk(bool(fam) and fam[0]['text'] == '家族群組開好了。學弟，這次不用臥底了。', 'AA372 第 2 項：9/4 21:00 家族群組第一句是 Kevin「家族群組開好了。學弟，這次不用臥底了。」', json.dumps(fam[:2], ensure_ascii=False))
        chk(not any(w in m['text'] for m in fam for w in ('歡迎學弟', '你的家族學長')), 'AA372 第 2 項：9/4 沒有「歡迎學弟」「你的家族學長」')
        an = [x for x in nm if '2025-09-04' in x and ('前排' in x or '小安' in x or '以安' in x or '和她說話' in x)]
        say('   9/4 以安的名字／按鈕（觀察）：%s' % json.dumps(an[:12], ensure_ascii=False))
        caps = [l for l in lg if 'CAPTION' in l and ('前排' in l or '小安' in l or '等一下' in l)]; say('   字幕：%s' % json.dumps(caps[:6], ensure_ascii=False))
        chk(not any('前排的小安' in x or '和小安說話' in x for x in an + caps), 'AA372 第 4 項（觀察）：9/4 沒有「前排的小安」「和小安說話」', json.dumps(an[:4], ensure_ascii=False))
        chk(not errs, '沒有 JS 例外', json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    run.finish()
asyncio.run(main())
