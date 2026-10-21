"""BB（帳號 A）2026-10-21：BB-TEST-VAC-C16-C18-1021 瀏覽器驗收（LAWWW-C 13:4x 派；VAC-C16-C18-1021 b57717dd＋AA_242 第 12 節 32148711）。
SCEN=C16｜C17｜C18（一次跑一段；佇列依序跑）。
照玩家：手機全班群組的公告 → 點「（交申請表）」「（交履歷）」「（報名）」→ 時間到跳出「出發：…」按出發 → 演 → 錄取通知 →
  暑假：晚上按宿舍的床「睡到明天早上」、早上按床「小睡 1 小時」等出發提示、按「出發」；成績公布以後有「快轉」就用「到下一個有事的日子」；
  劇情選項選第一個；手機自己跳出來就按「跳過／收起來」。
每一站記：日期時間、出發提示（地點、時間、交通）、旁白／對話、ADV 背景（ADV.begin 收到的圖＋#advBg 實際顯示的圖）、日期卡、錢（C16 午餐、C17 津貼）、V.reg／V.work／旗標、手機訊息。
  C16：公告（第 10 週週一 12:00）→ 報名 → 隔天 20:00 寫申請表 → 第 14 週錄取（系辦＋媽媽一句）→ 6/21～7/2 十個上班日（四場：第一天、陪同晤談、整理卷宗、最後一天；其他六天日誌一句）、午餐每天 −100。
  C17：①沒有英檢：第 4 週公告後一句旁白、沒有報名選項、行事曆沒有報名鈕；②有英檢：報名「（交履歷）」→ 第 12 週週三 19:00 面試（事務所、捷運 30 分）→ 第 14 週錄取（媽媽「有錢可以領喔？」）
       → 6/21 起八週（第一週照天過，成績公布以後快轉）四場：第一天、第一次被改、跟開庭、最後一天；8/13 18:00 以後津貼 196×8×40＝62,720 一次入帳。
  C18（大一暑假）：第 6 週公告 → 「（報名）」→ 第 11 週週三 19:00 面試 → 第 13 週錄取（行前說明會日期）→ 第 15 週週三 12:20 說明會（第一次多三行：思穎）
       → 成績公布日快轉到 7/20 出發 → 7/21 法院、7/23 座談、7/27 最後一晚 → 7/28 回來；麵店團出發／回來那幾句；8/4 20:00 思穎的訊息。
[前置] 使用者 9/25 存檔改日期（同 holff：ROOM 旗標、麵店團、全班群組、熟人、沒交往、沒報名別的活動）；C17②的英檢成績＝G.vac.score 放一筆 C04（托福 84，2026-09-01）。
[捷徑] 學期中改 G.day／G.hour 跳到公告、出發提示、錄取公布前 1～5 分鐘；暑假開始前跳到 6/20 晚上（C16、C17）或成績公布日早上（C18）。Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：SCEN=C16 LW_TESTS=<開發分支>/tests python3 vac_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = os.environ.get('SCEN', 'C16')
rep = []; bad = []


def say(*a):
    s = ' '.join(str(x) for x in a); print(s, flush=True); rep.append(s)


SNAP = """(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day); return {day:G.day, key:d.key, wd:d.wd%7, h:+G.hour.toFixed(2), zone:G.zone, home:!!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)), money:G.money|0, term:(CALENDAR.termOf(G.day)||{}).id||null}; })()"""
HOOK = """(()=>{ if(window.__VH) return; window.__VH=1; window.__LOG=[]; window.__BG=[]; window.__TC=[]; window.__TOAST=[]; window.__WD=[];
  const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+GAME.G.hour.toFixed(2); }catch(e){ return ''; } };
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__LOG.push(((w&&w.name)?w.name+'：':'')+String(t)); }catch(e){} return s0.apply(this,arguments); };
  const b0=ADV.begin; ADV.begin=function(o){ try{ const bg=o&&o.background; window.__BG.push({at:at(), bg:typeof bg==='string'?bg:((bg&&bg.image)||JSON.stringify(bg))}); }catch(e){} return b0.apply(this,arguments); };
  if(GAME.titleCard){ const t0=GAME.titleCard; GAME.titleCard=function(a,b){ try{ window.__TC.push({at:at(), a:String(a), b:String(b||'')}); }catch(e){} return t0.apply(this,arguments); }; }
  if(GAME.toast){ const o0=GAME.toast; GAME.toast=function(t){ try{ window.__TOAST.push({at:at(), t:String(t)}); }catch(e){} return o0.apply(this,arguments); }; }
  if(GAME.caption){ const c0=GAME.caption; GAME.caption=function(a,b){ try{ window.__LOG.push('〔字幕〕'+String(a||'')+(a&&b?'｜':'')+String(b||'')); }catch(e){} return c0.apply(this,arguments); }; }
  const w0=VAC.workDone; VAC.workDone=function(G,I,q){ const m0=G.money; const r=w0.apply(this,arguments); try{ window.__WD.push({key:I.key, day:CALENDAR.dateOf(q.day).key, dm:(G.money|0)-(m0|0), via:arguments.length>3?'出發':'快轉'}); }catch(e){} return r; };
})()"""
ADVBG = """(()=>{ const a=document.getElementById('adv'), b=document.getElementById('advBg'); if(!a||a.classList.contains('hide')||getComputedStyle(a).display==='none') return null; return {cls:a.className, img:b?getComputedStyle(b).backgroundImage:''}; })()"""


async def phone_open(pg):
    return await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide')&&getComputedStyle(p).display!=='none'; })()")


async def close_phone(pg, cdp):
    if await phone_open(pg):
        lab = await pg.evaluate("((document.getElementById('btnPhoneClose')||{}).textContent||'').trim()")
        await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(800); return lab
    return None


async def opts(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>(b.innerText||b.textContent).trim().replace(/\\s+/g,' '))")


async def tap_opt(pg, cdp, i):
    c = await pg.evaluate("(i=>{ const e=document.querySelectorAll('#choices button')[i]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % i)
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900); return True


async def jump(pg, day, h, note):
    """[捷徑] 學期中直接改日期時間（不經過中間的日子）"""
    await pg.evaluate("(([d,h])=>{ const G=GAME.G; G.day=d; G.hour=h; GAME.E.hour=h; G.weekday=CALENDAR.dateOf(d).wd%7; if(GAME.updateHUD) GAME.updateHUD(); })(%s)" % json.dumps([day, h]))
    sn = await pg.evaluate(SNAP); say('   [捷徑] 跳到 %s（週%s）%.2f：%s' % (sn['key'], '日一二三四五六'[sn['wd']], sn['h'], note)); return sn


async def tday(pg, term, w, wd):
    return await pg.evaluate("STORY.termDay(%s,%d,%d)" % (json.dumps(term), w, wd))


async def dkey(pg, k):
    return await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(k))


async def msgs_tagged(pg, tag):
    return await pg.evaluate("(t=>(GAME.G.msgs||[]).filter(m=>m.tag===t).map(m=>({th:m.th,from:m.name||m.from||'',text:m.text,ask:m.ask?m.ask.opts.map(o=>o.t):null})))(%s)" % json.dumps(tag))


async def wait_js(pg, cdp, js, secs, close=True):
    t0 = time.time()
    while time.time() - t0 < secs:
        if await pg.evaluate(js): return True
        s = await L.state(pg)
        if s['dlg'] and not s['choices']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(1500)
    return False


async def tap_ask(pg, cdp, run, ask_id, shot):
    """像玩家：打開手機（自己打開了就直接用）→「訊息」→ 那個群組 → 點選項。回傳選項文字"""
    th = await pg.evaluate("(id=>{ const m=(GAME.G.msgs||[]).find(x=>x.ask&&x.ask.id===id); return m?m.th:null; })(%s)" % json.dumps(ask_id))
    if not th: return None
    if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="msg"]'); await pg.wait_for_timeout(900)
    if await pg.evaluate("!!document.querySelector('#phoneBody [data-thback]')"): await L.tap(pg, cdp, '#phoneBody [data-thback]'); await pg.wait_for_timeout(900)
    c = await pg.evaluate("(t=>{ const e=[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===t); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(th))
    if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200)
    b = await pg.evaluate("(id=>{ const e=[...document.querySelectorAll('#phoneBody [data-ask]')].find(x=>x.dataset.ask.startsWith(id+'|')); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim()]; })(%s)" % json.dumps(ask_id))
    await run.shot(pg, shot + '_before')
    if not b: return None
    await L.touch_tap(cdp, b[0], b[1]); await pg.wait_for_timeout(1500); await run.shot(pg, shot + '_after')
    await close_phone(pg, cdp); return b[2]


async def events_tab(pg, cdp, run, shot):
    """手機「活動」頁（假期行事曆）：回傳行事曆那幾列的字、報名鈕"""
    if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="events"]'); await pg.wait_for_timeout(1200)
    r = await pg.evaluate("(()=>{ const rows=[...document.querySelectorAll('#phoneBody .item.phrow')].map(e=>({t:e.innerText.replace(/\\s+/g,' ').trim().slice(0,160), vac:(e.querySelector('[data-vac]')||{dataset:{}}).dataset.vac||null})); return rows; })()")
    await run.shot(pg, shot); await close_phone(pg, cdp); return r


async def press_bed(pg, cdp, run):
    bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
    if not bed: return False
    await close_phone(pg, cdp)
    if not await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床'): return False
    for k in range(4):
        await close_phone(pg, cdp)
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        st = await L.state(pg)
        if st['choices'] or st['dlg'] or st['busy']: return True
    return False


class Stop:
    def __init__(s): s.list = []; s.cur = None
    def new(s, at, what): s.cur = {'at': at, 'what': what, 'lines': [], 'bg': [], 'shown': [], 'tc': [], 'opts': []}; s.list.append(s.cur); return s.cur


async def flush_logs(pg, st):
    lg = await pg.evaluate("({l:window.__LOG.splice(0), b:window.__BG.splice(0), t:window.__TC.splice(0)})")
    if st.cur is None: st.new('', '（開始）')
    st.cur['lines'] += lg['l']; st.cur['bg'] += lg['b']; st.cur['tc'] += lg['t']
    return lg


async def drive(pg, cdp, run, st, end_key, ff_ok, end_h=0.0, max_min=150, shots=None, until_js=None):
    """照玩家玩到 end_key end_h 以後（或 until_js 成立、畫面空下來）：出發提示按出發、床照時間選、劇情點過去選第一個、手機跳出來就按跳過"""
    t0 = time.time(); idle = 0; last_sig = None; same = 0; seen_bg = set()
    while time.time() - t0 < max_min * 60:
        sn = await pg.evaluate(SNAP)
        if (sn['key'], sn['h']) >= (end_key, end_h): return 'end'
        lab = None
        if await phone_open(pg):
            lab = await close_phone(pg, cdp); say('   📱 %s %.2f 手機自己打開，按「%s」' % (sn['key'], sn['h'], lab)); continue
        s = await L.state(pg)
        if until_js and not (s['dlg'] or s['choices'] or s['busy']) and await pg.evaluate(until_js):
            await pg.wait_for_timeout(4000); s2 = await L.state(pg)
            if not (s2['dlg'] or s2['choices'] or s2['busy']) and not await phone_open(pg): await flush_logs(pg, st); return 'until'
            continue
        sig = (sn['key'], sn['h'], s['dtext'], s['choices']) if (s['dlg'] or s['choices']) else None
        same = same + 1 if sig is not None and sig == last_sig else 0; last_sig = sig
        if same > 80: say('   ⚠ 卡住 %s' % json.dumps([sn, s], ensure_ascii=False)); bad.append('卡住 %s %.2f %s' % (sn['key'], sn['h'], s['dtext'])); await run.shot(pg, 'stuck_%s' % sn['key']); return 'stuck'
        if s['dlg'] or s['choices']:
            a = await pg.evaluate(ADVBG)
            if a and a['img'] not in seen_bg:
                seen_bg.add(a['img']); await flush_logs(pg, st); st.cur['shown'].append(a['img'][:120])
                if shots is not None: await run.shot(pg, 'bg_%s_%02d' % (sn['key'], len(seen_bg)))
        if s['choices']:
            o = await opts(pg); await flush_logs(pg, st)
            i = None
            if any(x.startswith('出發：') or x.startswith('接起來：') for x in o):
                i = next(k for k, x in enumerate(o) if x.startswith('出發：') or x.startswith('接起來：'))
                st.new('%s %.2f' % (sn['key'], sn['h']), '出發提示')
                say('   🚶 %s（週%s）%.2f 出發提示 %s' % (sn['key'], '日一二三四五六'[sn['wd']], sn['h'], json.dumps(o, ensure_ascii=False)))
                if shots is not None and len(shots) < 40: shots.append(sn['key']); await run.shot(pg, 'prompt_%s' % sn['key'])
            elif any(x.startswith('先起床') for x in o):
                i = next(k for k, x in enumerate(o) if x.startswith('先起床'))
            elif any(x.startswith('再撐一下') for x in o) or any(x.startswith('到下一個有事的日子') for x in o):
                due = await pg.evaluate("(()=>{ const G=GAME.G; const q=OUT.rec(G).filter(q=>q.state==='planned'&&q.day===G.day&&q.h>G.hour).sort((a,b)=>a.h-b.h)[0]; if(!q) return null; return {h:q.h, ws:q.h-OUT.trip(G,q).travelH-0.25, title:q.title}; })()")
                h = sn['h']; pick = None
                if any(x.startswith('到下一個有事的日子') for x in o) and not due: pick = '到下一個有事的日子'
                elif due and h < due['ws']:
                    for lab2, d in (('小睡 1 小時', 1), ('小睡 30 分鐘', 0.5), ('小睡 2 小時', 2)):
                        if h + d >= due['ws'] and h + d <= due['h'] + 0.4 and any(x.startswith(lab2) for x in o): pick = lab2; break
                    if pick is None and any(x.startswith('小睡 2 小時') for x in o) and h + 2 < due['ws']: pick = '小睡 2 小時'
                if pick is None and ff_ok and not due and any(x.startswith('快轉') for x in o): pick = '快轉'
                if pick is None and (h >= 17.5 or h < 5): pick = next((x for x in o if x.startswith('睡到明天早上')), None) or next((x for x in o if x.startswith('睡到明天')), None)
                if pick is None: pick = next((x for x in o if x.startswith('睡到傍晚')), None) or next((x for x in o if x.startswith('小睡 2 小時')), None) or next((x for x in o if x.startswith('睡')), None)
                if pick is None: pick = next((x for x in o if not x.startswith('再撐一下') and '存檔' not in x), o[0])
                i = next(k for k, x in enumerate(o) if x.startswith(pick[:6]))
                st.new('%s %.2f' % (sn['key'], sn['h']), '床／快轉：' + o[i][:24]); say('   🛏 %s（週%s）%.2f 選「%s」%s' % (sn['key'], '日一二三四五六'[sn['wd']], sn['h'], o[i][:30], '（今天還有：%s %.2f）' % (due['title'], due['h']) if due else ''))
            else:
                i = next((k for k, x in enumerate(o) if '存檔' not in x), 0)
                st.cur['opts'].append(o); say('   ▶ %s %.2f 選項 %s → 選第 %d 個' % (sn['key'], sn['h'], json.dumps([x[:24] for x in o], ensure_ascii=False), i + 1))
            await tap_opt(pg, cdp, i); idle = 0; continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); idle = 0; continue
        if s['busy']: await pg.wait_for_timeout(800); continue
        idle += 1
        if idle < 4: await pg.wait_for_timeout(2500); continue
        await flush_logs(pg, st)
        due = await pg.evaluate("(()=>{ const G=GAME.G, now=G.day*24+G.hour; return OUT.rec(G).some(q=>q.state==='planned'&&now>=q.day*24+q.h-OUT.trip(G,q).travelH-0.25&&now<=q.day*24+q.h+(q.late||0.75)); })()")
        if due and idle < 30: await pg.wait_for_timeout(2500); continue   # 出發提示在等 S.tick（SwiftShader 幾十秒）
        if not await press_bed(pg, cdp, run):
            say('   ⚠ 按不到床 %s' % json.dumps(sn, ensure_ascii=False)); bad.append('按不到床 %s %.2f %s' % (sn['key'], sn['h'], sn['zone'])); await run.shot(pg, 'nobed_%s' % sn['key']); return 'nobed'
        idle = 0
    return 'timeout'


def check_lines(run, name, got, want, ordered=True):
    miss = [w for w in want if w not in got]
    run.check(name, not miss, ('缺：' + json.dumps(miss, ensure_ascii=False) + '｜實際：' + json.dumps(got[:12], ensure_ascii=False))[:900] if miss else '')
    if miss: bad.append(name)
    return not miss


async def setup(pg, base, day, h, extra=None, vac=None):
    st = json.loads(json.dumps(base)); G = st.get('G', st)
    G.update({'day': day, 'hour': h, 'zone': 'dorm', 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % day), 'stage': 'law'})
    F = G['flags']
    for k, key in (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03')):
        dd = await dkey(pg, key)
        if dd <= day: F[k] = dd
    F.update({'dating_kexin': False}); F.update(extra or {})
    G.pop('home', None)
    if vac is not None: G['vac'] = vac
    await L.load_state(pg, G); await pg.wait_for_timeout(6000); await pg.evaluate(HOOK)
    await pg.evaluate("(()=>{ const G=GAME.G; PHONE.join(G,'law_class','法律系（全班）'); PHONE.join(G,'noodle_team','麵店團'); const LV=(id,f,t,c)=>{ const r=SOCIAL.rel(id); r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); }; for(const id of ['zhe','yu','heroine_03','classmate_bohan','classmate_xinci']) LV(id,45,30,10); LV('heroine_01',25,10,10); if(G.flags.romance) for(const k in G.flags.romance){ if(G.flags.romance[k]&&G.flags.romance[k].status==='dating') G.flags.romance[k].status='none'; } })()")
    await pg.evaluate("(()=>{ window.__LOG.length=0; window.__BG.length=0; window.__TC.length=0; window.__TOAST.length=0; })()")
    return await pg.evaluate(SNAP)


async def signup_flow(pg, cdp, run, key, term, wk, wantMsg, optText, gateNarr=None):
    """公告：第 wk 週週一 11:58 → 12:00 全班群組；點報名選項"""
    d = await tday(pg, term, wk, 1); await jump(pg, d, 11.97, '%s 公告前（第 %d 週週一）' % (key, wk))
    ok = await wait_js(pg, cdp, "(GAME.G.msgs||[]).some(m=>m.tag==='vac_ask_%s')" % key, 240)
    M = await msgs_tagged(pg, 'vac_ask_' + key); say('   公告：%s' % json.dumps(M, ensure_ascii=False))
    run.check('%s：第 %d 週週一 12:00 全班群組公告（逐字）' % (key, wk), ok and any(m['text'] == wantMsg and m['th'] == 'g:law_class' for m in M), json.dumps(M, ensure_ascii=False)[:600])
    if gateNarr is not None:
        run.check('%s：沒有英檢＝公告後一句旁白「%s」、沒有報名選項' % (key, gateNarr), any(m['th'] == 'sys' and m['text'] == gateNarr for m in M) and not any(m['ask'] for m in M), json.dumps(M, ensure_ascii=False)[:600])
        return M
    run.check('%s：公告有選項「%s」' % (key, optText), any(m['ask'] == [optText] for m in M), json.dumps(M, ensure_ascii=False)[:400])
    t = await tap_ask(pg, cdp, run, 'vac_ask_' + key, 'ask_' + key.replace('@', '_'))
    reg = await pg.evaluate("VAC.state(GAME.G,%s)" % json.dumps(key))
    run.check('%s：在手機群組點「%s」＝報名了' % (key, optText), t == optText and reg == 'yes', '%s／%s' % (t, reg))
    return M


async def outing_at(pg, cdp, run, st, qid, note, shots):
    """[捷徑] 跳到出發提示的時間（提示窗開始後 1～2 分鐘）→ 等提示 → 出發 → 演完"""
    q = await pg.evaluate("(id=>{ const G=GAME.G, q=OUT.get(G,id); if(!q) return null; return {day:q.day, h:q.h, ws:q.h-OUT.trip(G,q).travelH-0.25, title:q.title, place:q.place, travel:q.travel, state:q.state}; })(%s)" % json.dumps(qid))
    if not q: run.check('%s：排進行事曆（%s）' % (note, qid), False, '沒有'); bad.append(note + ' 沒排'); return None
    k = await pg.evaluate("CALENDAR.dateOf(%d).key" % q['day'])
    say('   行事曆：%s %s %.2f %s｜%s' % (qid, k, q['h'], q['title'], q['place']))
    await jump(pg, q['day'], q['ws'] + 0.03, note + '的出發提示時間')
    r = await drive(pg, cdp, run, st, k, False, end_h=23.95, max_min=30, shots=shots, until_js="(id=>{ const q=OUT.get(GAME.G,id); return !!q&&q.state!=='planned'&&!(typeof ADV!=='undefined'&&ADV.active); })(%s)" % json.dumps(qid))
    q2 = await pg.evaluate("(id=>{ const q=OUT.get(GAME.G,id); return q?q.state:null; })(%s)" % json.dumps(qid)); sn = await pg.evaluate(SNAP)
    say('   %s：%s（出遊 %s）→ %s %.2f' % (note, r, q2, sn['key'], sn['h'])); q['done'] = q2
    run.check('%s：出發提示出來、按出發、演完（%s %.2f）' % (note, k, q['h']), q2 == 'done', '%s／%s' % (r, q2))
    return q


async def main():
    run = L.Run('vac_' + SCEN, OUT); base = json.load(open(SAVE, encoding='utf-8')); stops = Stop(); shots = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        if SCEN == 'C16':
            K = 'C16@Y2'
            sn = await setup(pg, base, await tday(pg, 'Y2S2', 10, 1), 11.9); run.setup('[前置] 9/25 存檔改到大二下第 10 週週一 11:54 宿舍（麵店團、全班群組、沒交往、沒報名別的）')
            await signup_flow(pg, cdp, run, K, 'Y2S2', 10, '【暑期實習】法律扶助基金會台北分會，暑假兩週（80 小時），名額有限。第 12 週週五前交申請表。', '（交申請表）')
            plan = await pg.evaluate("(()=>OUT.rec(GAME.G).filter(q=>q.vac&&q.vac.key==='C16@Y2').map(q=>[q.id,CALENDAR.dateOf(q.day).key,q.h,q.title,q.place]))()")
            say('   排進行事曆：%s' % json.dumps(plan, ensure_ascii=False))
            run.check('C16：報名後排進「寫申請表」（隔天 20:00 宿舍書桌）＋十個上班日（9:00）', any(x[0] == 'vac_C16@Y2_pre0' and x[2] == 20 for x in plan) and len([x for x in plan if '_w' in x[0]]) == 10, json.dumps(plan, ensure_ascii=False)[:500])
            await outing_at(pg, cdp, run, stops, 'vac_C16@Y2_pre0', 'C16 寫申請表', shots)
            okA = await pg.evaluate("VAC.okI(GAME.G,VAC.inst('C16','Y2'),'APP')"); sn = await pg.evaluate(SNAP); toast = await pg.evaluate("window.__TOAST.map(t=>t.t)")
            run.check('C16：寫申請表＝出發以後兩小時（20:00→22:00）、申請表算數', okA and sn['h'] >= 21.9, '%s／%.2f／%s' % (okA, sn['h'], toast[-3:]))
            await jump(pg, await tday(pg, 'Y2S2', 14, 1), 11.97, 'C16 錄取公布前（第 14 週週一）')
            ok = await wait_js(pg, cdp, "(GAME.G.msgs||[]).some(m=>m.tag==='vac_sel_C16@Y2')", 240)
            M = await msgs_tagged(pg, 'vac_sel_C16@Y2'); say('   錄取：%s' % json.dumps(M, ensure_ascii=False))
            run.check('C16：第 14 週週一 12:00 錄取（系辦通知＋家人群組媽媽「兩個禮拜都要穿正式一點嗎」）', ok and any(m['text'] == '【通知】恭喜錄取法律扶助基金會台北分會暑期實習。' for m in M) and any(m['th'] == 'g:home' and m['text'] == '兩個禮拜都要穿正式一點嗎' for m in M), json.dumps(M, ensure_ascii=False)[:500])
            if await phone_open(pg): await run.shot(pg, 'select_C16_phone')
            await close_phone(pg, cdp)
            await jump(pg, await dkey(pg, '2027-06-20'), 21.0, '暑假：第一個上班日前一天（週日）晚上，宿舍')
            m0 = (await pg.evaluate(SNAP))['money']
            r = await drive(pg, cdp, run, stops, '2027-07-03', True, max_min=170, shots=shots)
            say('   照玩家玩到 7/3：%s' % r)
        elif SCEN == 'C17':
            K = 'C17@Y2'
            sn = await setup(pg, base, await tday(pg, 'Y2S2', 4, 1), 11.9); run.setup('[前置] ①沒有英檢：9/25 存檔改到大二下第 4 週週一 11:54 宿舍')
            await signup_flow(pg, cdp, run, K, 'Y2S2', 4, '【暑期實習】青嶺法律事務所，暑假 8 週，有實習津貼。需附英文檢定成績。第 9 週週五前交履歷。', None, gateNarr='（你翻了一下，你還沒有英文檢定的成績。）')
            rows = await events_tab(pg, cdp, run, 'events_C17_gate')
            r17 = [x for x in rows if '律所暑期實習' in x['t']]; say('   行事曆：%s' % json.dumps(rows, ensure_ascii=False))
            run.check('C17①：手機「活動」的假期行事曆有律所實習那一列、寫那句旁白、沒有報名鈕', bool(r17) and all(x['vac'] is None for x in r17) and any('還沒有英文檢定的成績' in x['t'] for x in r17), json.dumps(r17, ensure_ascii=False)[:400])
            await b.close()
            b, ctx, pg, cdp, errs2 = await L.launch(p, landscape=True); errs += errs2
            await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
            sco = {'score': {'C04@Y1': {'test': 'toefl', 'n': 84, 'day': await dkey(pg, '2026-09-01')}}}
            sn = await setup(pg, base, await tday(pg, 'Y2S2', 4, 1), 11.9, vac=sco); run.setup('[前置] ②有英檢：同上＋G.vac.score 一筆 C04（托福 84，2026-09-01 出成績）')
            await signup_flow(pg, cdp, run, K, 'Y2S2', 4, '【暑期實習】青嶺法律事務所，暑假 8 週，有實習津貼。需附英文檢定成績。第 9 週週五前交履歷。', '（交履歷）')
            q = await outing_at(pg, cdp, run, stops, 'vac_C17@Y2_pre0', 'C17 面試', shots)
            if q: run.check('C17②：面試排在第 12 週週三 19:00、地點青嶺法律事務所、捷運約 30 分鐘', q['day'] == await tday(pg, 'Y2S2', 12, 3) and q['h'] == 19 and q['place'] == '青嶺法律事務所' and q['travel'] == '捷運約 30 分鐘', json.dumps(q, ensure_ascii=False))
            okI = await pg.evaluate("VAC.okI(GAME.G,VAC.inst('C17','Y2'),'INT')"); run.check('C17②：面試去了＝算數（INT）', okI, str(okI))
            await jump(pg, await tday(pg, 'Y2S2', 14, 1), 11.97, 'C17 錄取公布前（第 14 週週一）')
            ok = await wait_js(pg, cdp, "(GAME.G.msgs||[]).some(m=>m.tag==='vac_sel_C17@Y2')", 240)
            M = await msgs_tagged(pg, 'vac_sel_C17@Y2'); say('   錄取：%s' % json.dumps(M, ensure_ascii=False))
            run.check('C17②：第 14 週週一 12:00 錄取（系辦通知＋媽媽「有錢可以領喔？」）', ok and any(m['text'] == '【通知】恭喜錄取青嶺法律事務所暑期實習。' for m in M) and any(m['th'] == 'g:home' and m['text'] == '有錢可以領喔？' for m in M), json.dumps(M, ensure_ascii=False)[:500])
            await close_phone(pg, cdp)
            await jump(pg, await dkey(pg, '2027-06-20'), 21.0, '暑假：第一個上班日前一天（週日）晚上，宿舍')
            m0 = (await pg.evaluate(SNAP))['money']
            r = await drive(pg, cdp, run, stops, '2027-08-14', True, max_min=240, shots=shots)
            say('   照玩家玩到 8/14：%s' % r)
        else:
            K = 'C18@Y1'
            sn = await setup(pg, base, await tday(pg, 'Y1S2', 6, 1), 11.9); run.setup('[前置] 9/25 存檔改到大一下第 6 週週一 11:54 宿舍')
            await signup_flow(pg, cdp, run, K, 'Y1S2', 6, '【見習團】法律與社會海外見習團（新加坡），暑假 9 天（寒假團 7 天），有獎學金名額。需面試，第 10 週（寒假團第 9 週）截止。', '（報名）')
            q = await outing_at(pg, cdp, run, stops, 'vac_C18@Y1_pre0', 'C18 面試', shots)
            if q: run.check('C18：面試排在第 11 週週三 19:00、霖澤館的研討室', q['day'] == await tday(pg, 'Y1S2', 11, 3) and q['h'] == 19 and q['place'] == '霖澤館的研討室', json.dumps(q, ensure_ascii=False))
            okI = await pg.evaluate("VAC.okI(GAME.G,VAC.inst('C18','Y1'),'INT')"); run.check('C18：面試去了＝算數（INT）', okI, str(okI))
            await jump(pg, await tday(pg, 'Y1S2', 13, 1), 11.97, 'C18 錄取公布前（第 13 週週一）')
            ok = await wait_js(pg, cdp, "(GAME.G.msgs||[]).some(m=>m.tag==='vac_sel_C18@Y1')", 240)
            M = await msgs_tagged(pg, 'vac_sel_C18@Y1'); say('   錄取：%s' % json.dumps(M, ensure_ascii=False))
            run.check('C18：第 13 週週一 12:00 錄取（通知寫行前說明會的日子＋媽媽兩句）', ok and any(m['text'].startswith('【通知】恭喜錄取法律與社會海外見習團（新加坡）。行前說明會：') for m in M), json.dumps(M, ensure_ascii=False)[:500])
            await close_phone(pg, cdp)
            q = await outing_at(pg, cdp, run, stops, 'vac_C18@Y1_brief', 'C18 行前說明會', shots)
            if q: run.check('C18：行前說明會排在第 15 週週三 12:20、系館的小教室', q['day'] == await tday(pg, 'Y1S2', 15, 3) and abs(q['h'] - (12 + 20 / 60)) < 0.01 and q['place'] == '系館的小教室', json.dumps(q, ensure_ascii=False))
            gd = await pg.evaluate("CALENDAR.gradeDay('Y1S2')")
            await jump(pg, gd, 8.5, '大一下成績公布日早上（之後照玩家快轉）')
            m0 = (await pg.evaluate(SNAP))['money']
            r = await drive(pg, cdp, run, stops, '2026-08-05', True, max_min=200, shots=shots)
            say('   照玩家玩到 8/5：%s' % r)
        await flush_logs(pg, stops)
        V = await pg.evaluate("(()=>{ const V=VAC.rec(GAME.G); return {reg:V.reg, work:Object.fromEntries(Object.entries(V.work||{}).map(([k,a])=>[k,a.map(d=>CALENDAR.dateOf(d).key)])), paid:V.paid||{}, ok:V.ok||{}, flags:{INTERN_LEGALAID:GAME.G.flags.INTERN_LEGALAID, INTERN_FIRM:GAME.G.flags.INTERN_FIRM, STUDYTOUR_SG:GAME.G.flags.STUDYTOUR_SG, BACK_FROM_C18:GAME.G.flags.BACK_FROM_C18}}; })()")
        WD = await pg.evaluate("window.__WD"); TO = await pg.evaluate("window.__TOAST"); sn = await pg.evaluate(SNAP)
        say('== VAC 狀態：%s' % json.dumps(V, ensure_ascii=False)[:1500]); say('== workDone：%s' % json.dumps(WD, ensure_ascii=False)[:1500]); say('== 提示字：%s' % json.dumps([t['at'] + ' ' + t['t'] for t in TO], ensure_ascii=False)[:1500])
        allL = [l for s in stops.list for l in s['lines']]; allBG = [x['bg'] for s in stops.list for x in s['bg']]; allTC = [x for s in stops.list for x in s['tc']]
        say('== ADV 背景：%s' % json.dumps(sorted(set(allBG)), ensure_ascii=False)); say('== 日期卡：%s' % json.dumps([x['a'] + '｜' + x['b'] for x in allTC], ensure_ascii=False)[:1500])
        urls = sorted(set(x for x in allBG if isinstance(x, str) and x.startswith('assets/')))
        hs = await pg.evaluate("(async us=>{ const o={}; for(const u of us){ try{ const r=await fetch(u,{method:'HEAD'}); o[u]=r.status; }catch(e){ o[u]='ERR'; } } return o; })(%s)" % json.dumps(urls))
        say('== 背景檔：%s' % json.dumps(hs, ensure_ascii=False))
        if SCEN == 'C16':
            check_lines(run, 'C16 第一天（6/21）：櫃台檔案櫃、韓律師「先簽這個。保密約定。」「在這裡聽到的事，就留在這裡。」', allL, ['（櫃台後面一整排檔案櫃。帶實習的韓律師三十出頭，桌上三個馬克杯，兩個是空的。）', '韓律師：先簽這個。保密約定。', '韓律師：在這裡聽到的事，就留在這裡。', '韓律師：卷宗在那邊，從最上面那疊開始。'])
            check_lines(run, 'C16 陪同晤談（6/24 14:00）：會議室、四頁筆記、韓律師兩句', allL, ['（會議室很小。當事人是一位中年的女士，手上一直捏著一張收據。）', '韓律師：他是實習生，在做筆記。妳慢慢講。', '（你把她說的每一個日期都寫下來。走出會議室，筆記寫了四頁。）', '韓律師：日期寫得很好。她講到一半停下來的時候，你不用抬頭。'])
            check_lines(run, 'C16 整理卷宗（6/29 15:00）：影印機卡紙、便利貼「OK」', allL, ['（影印機第三次卡紙。同期的實習生把手伸進去，拉出一張皺掉的紙。）', '實習生：這台每年都這樣吧。', '（隔天早上，那疊最上面貼了一張便利貼：「OK」。）'])
            check_lines(run, 'C16 最後一天（7/2 17:00）：「兩個禮拜，你最常看到的是什麼？」→「收據。」、鉛筆補的字', allL, ['韓律師：兩個禮拜，你最常看到的是什麼？', '韓律師：對。大家都把收據留得很好。……常常留錯張。', '（她把你的筆記還給你，旁邊有幾行她用鉛筆補的字。）'])
            dia = ['（影印、分類、再影印。中午在樓下的便當店吃。）', '（電話一直響。櫃台的姐姐把聽筒夾在肩膀上，繼續寫字。）', '（下午有人來問能不能申請。韓律師請他先填表，表格比他想的長。）', '（你學會怎麼用那台影印機。它只是需要先拍兩下。）', '（整理卷宗，把收據照日期排好。有幾張日期寫錯了。）', '（下班的時候，等候區還有兩個人在等。）']
            seen = [d for d in dia if d in allL]; order_ok = seen == [d for d in dia if d in seen]
            gone = [x for x in WD if x['key'] == K]; ff_days = [x['day'] for x in gone if x['via'] == '快轉']; go_days = [x['day'] for x in gone if x['via'] == '出發']
            say('   C16 日誌：看到 %d 句 %s；出發的上班日 %s；快轉記成去過的 %s' % (len(seen), json.dumps(seen, ensure_ascii=False), go_days, ff_days))
            nk_go = [d for d in go_days if d not in ('2027-06-21', '2027-06-24', '2027-06-29', '2027-07-02')]
            run.check('C16 沒有關鍵事件、按出發去的上班日：每天一句日誌、照順序（AA_242 12-2）；快轉跳過的另計', len(seen) >= len(nk_go) and order_ok and seen[:len(nk_go)] == dia[:len(nk_go)], '出發 %d 天、看到 %d 句、順序 %s｜%s' % (len(nk_go), len(seen), order_ok, json.dumps(seen, ensure_ascii=False)[:400]))
            w = V['work'].get(K, []); lunch = sum(x['dm'] for x in WD if x['key'] == K)
            run.check('C16：十個上班日都記成去過、參加過（done）、INTERN_LEGALAID', len(w) == 10 and V['reg'].get(K) == 'done' and V['flags']['INTERN_LEGALAID'] is True, '%d 天 %s／%s／%s' % (len(w), w, V['reg'].get(K), V['flags']['INTERN_LEGALAID']))
            run.check('C16：午餐每天 −100（十天 −1,000）', lunch == -1000, '%d（%s）' % (lunch, json.dumps(WD, ensure_ascii=False)[:300]))
            run.check('C16：四場的背景都是 legal_aid_office（正式圖，不是深色底）', 'assets/bg/legal_aid_office.webp' in allBG and hs.get('assets/bg/legal_aid_office.webp') == 200, json.dumps(sorted(set(allBG)), ensure_ascii=False)[:300])
        elif SCEN == 'C17':
            check_lines(run, 'C17 面試（第 12 週週三 19:00）：會議室看得到忠孝東路、「你為什麼想來事務所？」→ 第一個回答', allL, ['（會議室的窗戶看得到整條忠孝東路。對面坐著兩位律師。）', '律師：你為什麼想來事務所？', '律師：好。真的案子，很多時間是在等。'])
            check_lines(run, 'C17 第一天（6/21）：門禁卡、研究備忘錄、馮律師兩句', allL, ['（一張門禁卡、一個靠走道的位子、一台筆電，還有一份資料夾：研究備忘錄，週五交。）', '馮律師：題目不難，你先查。', '馮律師：查不到的地方寫「查不到」，不要猜。'])
            check_lines(run, 'C17 第一次被改（6/25 17:00）：紅字比黑字多 →「好，我重寫。」「週一給我。」', allL, ['（備忘錄發回來，紅字比黑字多。第一頁最上面寫著：「結論放第一段。」）', '馮律師：週一給我。'])
            check_lines(run, 'C17 跟開庭（7/14 11:00）：旁聽席第二排、電梯裡停了五秒', allL, ['（旁聽席第二排。馮律師在前面講話，比在辦公室慢很多。）', '（散庭以後，電梯裡。）', '馮律師：剛剛法官問到一半，停了五秒。你有注意到嗎？', '馮律師：對。那五秒不要講話。'])
            check_lines(run, 'C17 最後一天（8/13 17:00）：馮律師兩句', allL, ['馮律師：後來那幾份備忘錄，結論都放第一段了。', '馮律師：明年想再來，直接寄信給我。'])
            w = V['work'].get(K, []); pay = V['paid'].get(K)
            run.check('C17：四十個上班日都記成去過、參加過（done）、INTERN_FIRM', len(w) == 40 and V['reg'].get(K) == 'done' and V['flags']['INTERN_FIRM'] is True, '%d 天／%s／%s' % (len(w), V['reg'].get(K), V['flags']['INTERN_FIRM']))
            run.check('C17：8/13 18:00 以後津貼一次入帳 196×8×40＝62,720（提示字「實習津貼入帳：62720 元」）', pay == 62720 and any('實習津貼入帳：62720 元' in t['t'] for t in TO), '%s／%s' % (pay, [t['t'] for t in TO if '津貼' in t['t']]))
            run.check('C17：背景 law_firm_meeting、law_firm_office、court_gallery 都是正式圖', all(('assets/bg/%s.webp' % k) in allBG and hs.get('assets/bg/%s.webp' % k) == 200 for k in ('law_firm_meeting', 'law_firm_office', 'court_gallery')), json.dumps(sorted(set(allBG)), ensure_ascii=False)[:300])
            run.check('C17 跟開庭：日期卡寫「法院（旁聽席）」', any(x['b'] == '法院（旁聽席）' for x in allTC), json.dumps([x['a'] + '｜' + x['b'] for x in allTC], ensure_ascii=False)[:400])
        else:
            check_lines(run, 'C18 面試：帶隊老師「英文不用很好。去了敢問就好。」「你會問嗎？」→「會。」', allL, ['帶隊老師：英文不用很好。去了敢問就好。', '帶隊老師：你會問嗎？', '帶隊老師：好。到時候我會看。'])
            check_lines(run, 'C18 行前說明會（第一次）：三行＋思穎三行', allL, ['（系館的小教室。桌上一疊行程表，第一頁是新加坡的地圖。）', '帶隊老師：護照、轉接頭、一件薄外套。法院裡冷氣很強。', '帶隊老師：每個人選一天寫紀錄。不用寫得很好，寫你看到的。', '（坐你旁邊的人把名牌轉過來給你看：姚思穎，地理系。）', '思穎：我是團長。', '思穎：……其實是因為沒人要當。'])
            check_lines(run, 'C18 參訪法院（7/21 10:00）→「休庭。」', allL, ['（法庭比你想的小。法官、律師都講英文，講得很快。）', '思穎：……我只聽懂 adjourned。', '思穎：對，休庭。我就聽懂這個。'])
            check_lines(run, 'C18 座談（7/23 14:00）→「要，而且要坐前面。」', allL, ['（當地法律系的學生問你們：上課要不要點名？）', '（對面三個人一起笑了。）'])
            check_lines(run, 'C18 最後一晚（7/27 20:00）→「我寫法院那一段。」', allL, ['（旅館樓下的小吃中心，桌上一堆盤子。）', '思穎：回去以後，報告誰寫？', '思穎：好。那我寫吃的。'])
            run.check('C18：回來了（done）、STUDYTOUR_SG', V['reg'].get(K) == 'done' and V['flags']['STUDYTOUR_SG'] is True, '%s／%s' % (V['reg'].get(K), V['flags']['STUDYTOUR_SG']))
            run.check('C18：背景 classroom_small、intl_sg_court、intl_sg_campus、intl_sg_hawker 都是正式圖', all(('assets/bg/%s.webp' % k) in allBG and hs.get('assets/bg/%s.webp' % k) == 200 for k in ('classroom_small', 'intl_sg_court', 'intl_sg_campus', 'intl_sg_hawker')), json.dumps(sorted(set(allBG)), ensure_ascii=False)[:300])
            for tag, want in (('vac_dep_C18@Y1', ['新加坡很熱喔', '聽說口香糖不能帶']), ('vac_back_C18@Y1', ['伴手禮咧'])):
                M = await msgs_tagged(pg, tag); say('   %s：%s' % (tag, json.dumps(M, ensure_ascii=False)))
                run.check('C18：麵店團 %s %s' % ('出發那天' if 'dep' in tag else '回來那天', '／'.join(want)), all(any(m['text'] == x for m in M) for x in want), json.dumps(M, ensure_ascii=False)[:300])
            M = [m for m in await pg.evaluate("(GAME.G.msgs||[]).filter(m=>m.th==='p:npc_siying').map(m=>({tag:m.tag,text:m.text,ask:m.ask?m.ask.opts.map(o=>o.t):null}))")]
            say('   思穎的訊息：%s' % json.dumps(M, ensure_ascii=False))
            run.check('C18：回國一週後（8/4 20:00）思穎「報告我那段寫完了。三頁，都是吃的。」，兩個回覆', any(m['text'] == '報告我那段寫完了。三頁，都是吃的。' and m['ask'] == ['我的也寫完了。', '還沒。'] for m in M), json.dumps(M, ensure_ascii=False)[:300])
        json.dump({'stops': stops.list, 'V': V, 'WD': WD, 'toast': TO, 'bg_status': hs, 'bad': bad}, open(os.path.join(OUT, 'vac_%s.json' % SCEN), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    run.finish()
asyncio.run(main())
