"""BB（帳號 A）2026-10-21：QA-REPRO-1020 還沒驗的「BB 待驗」（USER_WANTS X65、X72、X74、X80、X67、X77），開發分支最新版。
X64（體育館樓梯）用 x64_probe.py 重跑；X68、X78、X81 BB-C 已驗 FIXED（BB_218），X66、X70、X71、X75、X76 在 CANDIDATE_9103 A 線 BB ✔。
每一項：[前置] 讀使用者 9/25 存檔（要改日期、區域、旗標的寫明）→ 照玩家操作（手機、搖桿、點地面、點互動）→ 截圖 → 判斷。
  X65 手機「地點」有「118 巷」、沒去過也有（一開始就知道）→ 按「前往」→ 到 118 巷
  X72 跑步：搖桿推到底（>0.92＝跑）在椰林大道跑 → 用遊戲時間算速度（應該約 6.2 m/s；原本 4.8）；推一半＝走（約 1.8）
  X74 霖澤館 3F／4F：大廳搭電梯到 3F → 長條桌的椅子坐下 → 樓梯上 4F → 坐下（野餐桌、討論區）
  X80 迎新：法律系開局（沒有宿營）8/28 手機「活動」有「法律系迎新」8/31 09:30–12:00 傅鐘前；9/22 看一週內沒有；8/31 09:30 走到集合點參加＝演迎新
  X67 吃東西：阿鳳麵店第一次點＝第一次的旁白；筆記本「吃過的」有這間；點第 5 次＝阿姨那一句＋選單「老樣子」→「好啦。不用講。」
  X77 小地圖：「北」白字白框；目的地在小地圖外＝邊上往外指的箭頭（[捷徑] 設目的地，截圖看）
Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests python3 xsweep_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>（ONLY=X65,X72 只跑某幾項）"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
ONLY = os.environ.get('ONLY', '').split(',') if os.environ.get('ONLY') else None
SNAP = """(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day), P=GAME.E.player; return {key:d.key, wd:d.wd%7, h:+G.hour.toFixed(2), zone:G.zone, x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2), lv:P.lv|0, money:G.money|0, seat:!!P.seat}; })()"""
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[]; const o=ADV.log; ADV.log=function(n,t){ try{ window.__LOG.push({n:n||'',t:String(t)}); }catch(e){} return o.apply(this,arguments); };
  const tc=GAME.toast; if(tc&&!tc.__bb){ const f=function(t){ try{ window.__LOG.push({n:'TOAST',t:'TOAST:'+t}); }catch(e){} return tc.apply(this,arguments); }; f.__bb=1; GAME.toast=f; } })()"""
res = {}; bad = []
def say(*a): print(' '.join(str(x) for x in a), flush=True)


def verdict(item, ok, why):
    res[item] = {'ok': ok, 'why': why}; say('[%s] %s %s' % ('PASS' if ok else 'FAIL', item, why))
    if not ok: bad.append('%s：%s' % (item, why))


async def drain(pg, cdp, pref=(), secs=120, log=None):
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s['choices']:
            c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; let e=null; for(const t of w){ e=bs.find(x=>x.textContent.trim().includes(t)); if(e) break; } e=e||bs.find(x=>/不|晚一點|之後|先不/.test(x.textContent))||bs[bs.length-1]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim(),bs.map(b=>b.textContent.trim())]; })(%s)" % json.dumps(list(pref)))
            await L.touch_tap(cdp, c[0], c[1]); say('   ▶', c[2], '（選項：%s）' % ' / '.join(c[3]))
            if log is not None: log.append({'choice': c[3], 'pick': c[2]})
            await pg.wait_for_timeout(900); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if s['busy']: await pg.wait_for_timeout(600); continue
        if await phone_open(pg): await close_phone(pg); continue
        await pg.wait_for_timeout(1000); s = await L.state(pg)
        if not (s['dlg'] or s['choices'] or s['busy']): return True
    return False


async def phone_open(pg):
    return await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide')&&getComputedStyle(p).display!=='none'; })()")


async def close_phone(pg):
    await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b) b.click(); })()"); await pg.wait_for_timeout(500)


async def phone_tab(pg, cdp, tab):
    """打開手機、點分頁（照玩家：點按鈕）；回傳分頁內容文字"""
    if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    c = await pg.evaluate("(t=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"'+t+'\"]'); if(!b) return null; const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(tab))
    if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200)
    return await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")


async def tap_sel(pg, cdp, sel):
    c = await pg.evaluate("(s=>{ const e=document.querySelector(s); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(sel))
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1]); return True


async def load(pg, cdp, run, base, why, key=None, h=None, zone=None, flags=None, unset=(), js=None):
    st = json.loads(json.dumps(base)); G = st.get('G', st)
    if key: d = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(key)); G.update({'day': d, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    if h is not None: G['hour'] = h
    if zone: G.update({'zone': zone, 'pos': None})
    for k in unset: G['flags'].pop(k, None)
    G['flags'].update(flags or {})
    await L.load_state(pg, G); await pg.wait_for_timeout(5000)
    await pg.evaluate(HOOK); await pg.evaluate('window.__LOG=[]')
    if js: await pg.evaluate("(()=>{ const G=GAME.G; %s })()" % js)
    run.setup('[前置] %s：讀使用者 9/25 存檔%s%s%s%s%s' % (why, '，日期改 %s' % key if key else '', '，時間 %.2f' % h if h is not None else '', '，區域 %s' % zone if zone else '',
                                                  '，旗標 %s' % json.dumps(flags, ensure_ascii=False) if flags else '', '，拿掉 %s' % ','.join(unset) if unset else ''))
    await drain(pg, cdp, secs=60)
    say('   讀檔後：%s' % json.dumps(await pg.evaluate(SNAP), ensure_ascii=False))


async def walk_to(pg, cdp, run, x, z, near, label, lv=None):
    ok = await L.go_to(pg, cdp, run, x, z, near, label, max_s=240, lv=lv)
    if not ok: say('   ⚠ 走不到 %s' % label)
    return ok


async def use(pg, cdp, run, pred_js, why, near=0.9):
    """走到最近、符合條件的互動點，按互動鍵（真的操作）；回傳 [x,z,label] 或 None"""
    it = await pg.evaluate("(()=>{ const P=GAME.E.player.obj.position; const its=(GAME.E.interactables||[]).filter(i=>!i.hidden&&(%s)); its.sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z)); const i=its[0]; return i?[i.x,i.z,i.label||'',i.lv|0]:null; })()" % pred_js)
    if not it: say('   ⚠ 找不到互動點（%s）' % why); return None
    if not await walk_to(pg, cdp, run, it[0], it[1], near, it[2], lv=it[3]): return None
    for k in range(5):
        lab = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()")
        if lab: break
        await pg.wait_for_timeout(800)
    say('   互動：%s（按鈕「%s」）' % (it[2], lab)); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1800)
    return it


async def lines(pg):
    return await pg.evaluate("(window.__LOG||[]).map(x=>(x.n?x.n+'：':'')+x.t)")


# ---------------------------------------------------------------- X65
async def x65(pg, cdp, run, base):
    await load(pg, cdp, run, base, 'X65')
    txt = await phone_tab(pg, cdp, 'places'); await run.shot(pg, 'x65_places')
    row = [l for l in txt.split('\n') if '118' in l]; idx = txt.find('118 巷'); after = txt[idx:idx + 30].replace('\n', '｜') if idx >= 0 else ''
    say('   手機「地點」118 巷那一列：%s' % after)
    btn = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#phoneBody [data-place]')].find(x=>x.dataset.place==='lane118|118 巷'); return b?b.textContent.trim():null; })()")
    if idx < 0: verdict('X65', False, '手機「地點」沒有「118 巷」'); await close_phone(pg); return
    if '還沒去過' in after or not btn: verdict('X65', False, '「118 巷」在清單上但不能直接去（%s；按鈕 %s）' % (after, btn)); await close_phone(pg); return
    await tap_sel(pg, cdp, '#phoneBody [data-place="lane118|118 巷"]'); await pg.wait_for_timeout(2500); await drain(pg, cdp, secs=90)
    for k in range(20):
        if (await pg.evaluate("GAME.G.zone")) == 'lane118' and not (await L.state(pg))['busy']: break
        await pg.wait_for_timeout(1500)
    sn = await pg.evaluate(SNAP); await pg.wait_for_timeout(2500); await run.shot(pg, 'x65_arrive')
    verdict('X65', sn['zone'] == 'lane118', '手機「地點」118 巷（%s，按鈕「%s」）→ 按了以後在 %s %.2f' % (after, btn, sn['zone'], sn['h']))


# ---------------------------------------------------------------- X72
async def hold_joy(pg, cdp, dx, dy, secs):
    """按住搖桿 secs 秒（真的觸控），每秒記一次位置、遊戲時間、姿勢；回傳樣本"""
    jx, jy = await L.center_of(pg, '#joy'); S = []
    rd = "(()=>{ const P=GAME.E.player; return {x:P.obj.position.x, z:P.obj.position.z, h:GAME.G.hour, pose:P.pose||'', run:!!(GAME.E.input&&GAME.E.input.joy&&GAME.E.input.joy.run)}; })()"
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': jx, 'y': jy}]})
    t0 = time.time(); nxt = 0
    while time.time() - t0 < secs:
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': jx + dx, 'y': jy + dy}]})
        if time.time() - t0 >= nxt: S.append(await pg.evaluate(rd)); nxt += 1.0
        await pg.wait_for_timeout(80)
    S.append(await pg.evaluate(rd))
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []}); await pg.wait_for_timeout(800)
    return S


def speeds(S):
    """相鄰兩個樣本的速度（公尺／遊戲秒；遊戲秒＝小時差 × 150 × 3600 / 3600，hourRate 1/150）"""
    out = []
    for a, b in zip(S, S[1:]):
        gs = (b['h'] - a['h']) * 150.0
        if gs > 0.05: out.append(round(math.hypot(b['x'] - a['x'], b['z'] - a['z']) / gs, 2))
    return out


async def x72(pg, cdp, run, base):
    await load(pg, cdp, run, base, 'X72')
    await phone_tab(pg, cdp, 'places')
    if not await tap_sel(pg, cdp, '#phoneBody [data-place="campus|椰林大道・傅鐘"]'): verdict('X72', False, '手機「地點」沒有「椰林大道・傅鐘」可以去'); await close_phone(pg); return
    await pg.wait_for_timeout(3000); await drain(pg, cdp, secs=90)
    for k in range(20):
        if (await pg.evaluate("GAME.G.zone")) == 'campus' and not (await L.state(pg))['busy']: break
        await pg.wait_for_timeout(1500)
    await walk_to(pg, cdp, run, -38, 0.5, 0.8, '椰林大道中間')
    spd0 = await pg.evaluate("JSON.stringify(GAME.E.SPD)"); say('   E.SPD=%s' % spd0)
    out = {}
    for nm, dx, dy in (('run_right', 70, 0), ('run_left', -70, 0), ('walk_right', 25, 0)):
        S = await hold_joy(pg, cdp, dx, dy, 6.0); v = speeds(S); out[nm] = {'v': v, 'pose': [s['pose'] for s in S], 'run': [s['run'] for s in S]}
        say('   %s：每秒速度 %s｜姿勢 %s｜run %s' % (nm, v, out[nm]['pose'], out[nm]['run']))
        if nm == 'run_right': await run.shot(pg, 'x72_running')
    def mid(v): v = sorted(v[1:] or v); return v[len(v) // 2] if v else 0
    r = max(mid(out['run_right']['v']), mid(out['run_left']['v'])); w = mid(out['walk_right']['v'])
    json.dump(out, open(os.path.join(OUT, 'x72.json'), 'w'), ensure_ascii=False, indent=1)
    verdict('X72', 5.7 <= r <= 6.7 and 1.5 <= w <= 2.1, '搖桿推到底：中位數 %.2f m/s（應該約 6.2，原本 4.8）；推一半：%.2f m/s（走路 1.8）；E.SPD %s' % (r, w, spd0))


# ---------------------------------------------------------------- X74
async def sit_somewhere(pg, cdp, run, tag):
    """找最近的空椅子（seat 互動點）走過去按「坐下」；回傳 (坐下了沒, 標籤, 椅子總數)"""
    info = await pg.evaluate("(()=>{ const its=(GAME.E.interactables||[]).filter(i=>i.seat&&!i.hidden); return {n:its.length, labels:[...new Set(its.map(i=>i.label))], study:its.filter(i=>i.study).length}; })()")
    say('   %s 椅子：%s' % (tag, json.dumps(info, ensure_ascii=False)))
    free = "i.seat&&!GAME.E.npcs.some(q=>q&&q.seat&&Math.hypot(q.seat.x-i.seat.x,q.seat.z-i.seat.z)<0.35)"
    it = await use(pg, cdp, run, free, '%s 的空椅子' % tag, near=0.7)
    await pg.wait_for_timeout(2500); await drain(pg, cdp, pref=['坐', '讀書'], secs=60)
    s = await pg.evaluate(SNAP); await run.shot(pg, 'x74_%s_seated' % tag)
    return s['seat'], (it or [None, None, ''])[2], info


async def x74(pg, cdp, run, base):
    await load(pg, cdp, run, base, 'X74（9/25 週四中午、霖澤館一樓大廳）', h=12.3, zone='linze')
    ok3 = ok4 = False; why = []
    it = await use(pg, cdp, run, "/電梯/.test(i.label||'')&&(i.lv|0)===0", '霖澤館 1F 的電梯')
    if it:
        await pg.wait_for_timeout(1500)
        cs = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())"); say('   電梯選單：%s' % cs)
        await drain(pg, cdp, pref=['3F'], secs=90)
    for k in range(20):
        if (await pg.evaluate("GAME.G.zone")) == 'linze_3f' and not (await L.state(pg))['busy']: break
        await pg.wait_for_timeout(1500)
    z = await pg.evaluate("GAME.G.zone"); why.append('電梯到 %s' % z)
    if z == 'linze_3f':
        await pg.wait_for_timeout(6000); await run.shot(pg, 'x74_3f_arrive')
        seated, lab, info = await sit_somewhere(pg, cdp, run, '3f'); ok3 = seated and info['n'] > 0; why.append('3F 椅子 %d 張（%s），坐下=%s' % (info['n'], '／'.join(info['labels']), seated))
        await pg.evaluate("(()=>{ if(GAME.E.player.seat&&GAME.standUp) GAME.standUp(GAME.E.player); })()")
        if seated:   # 站起來：照玩家按互動鍵（起身）
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500); await drain(pg, cdp, pref=['起身', '站起來'], secs=30)
        it = await use(pg, cdp, run, "i.exit&&i.exit.to==='linze_4f'", '3F 往 4F 的樓梯')
        await drain(pg, cdp, secs=60)
        for k in range(20):
            if (await pg.evaluate("GAME.G.zone")) == 'linze_4f' and not (await L.state(pg))['busy']: break
            await pg.wait_for_timeout(1500)
        z = await pg.evaluate("GAME.G.zone"); why.append('樓梯到 %s' % z)
        if z == 'linze_4f':
            await pg.wait_for_timeout(6000); await run.shot(pg, 'x74_4f_arrive')
            seated, lab, info = await sit_somewhere(pg, cdp, run, '4f'); ok4 = seated and info['n'] > 0; why.append('4F 椅子 %d 張（%s），坐下=%s' % (info['n'], '／'.join(info['labels']), seated))
    verdict('X74', ok3 and ok4, '；'.join(why))


# ---------------------------------------------------------------- X80
async def x80(pg, cdp, run, base):
    ck = await pg.evaluate("(st=>{ const G=st.G||st; return {camp:!!(G.flags&&G.flags.CAMP_Y1), econ:typeof STORY!=='undefined'&&STORY.isEcon?STORY.isEcon(G):null}; })(%s)" % json.dumps(base))
    say('   存檔：宿營 CAMP_Y1=%s、經濟系路線=%s' % (ck['camp'], ck['econ']))
    unset = ('CAMP_Y1',) if ck['camp'] else ()
    await load(pg, cdp, run, base, 'X80 法律系開局、開學前（8/28 10:00 宿舍）', key='2025-08-28', h=10.0, zone='dorm', unset=unset)
    txt = await phone_tab(pg, cdp, 'events'); await run.shot(pg, 'x80_events_0828'); await close_phone(pg)
    i = txt.find('法律系迎新'); row = txt[i:i + 40].replace('\n', '｜') if i >= 0 else ''
    say('   8/28 手機「活動」：%s' % txt[:300].replace('\n', '｜'))
    ok1 = i >= 0 and '8/31' in row and '09:30' in row and '傅鐘' in row
    await load(pg, cdp, run, base, 'X80 9/22（週一）一週內', key='2025-09-22', h=10.0, zone='dorm', unset=unset)
    txt2 = await phone_tab(pg, cdp, 'events'); await run.shot(pg, 'x80_events_0922'); await close_phone(pg)
    say('   9/22 手機「活動」：%s' % txt2[:300].replace('\n', '｜'))
    ok2 = '法律系迎新' not in txt2
    await load(pg, cdp, run, base, 'X80 8/31 09:20 椰林大道', key='2025-08-31', h=9.33, zone='campus', unset=unset,
               js="const s={x:-38,z:6}; GAME.E.placeAt?GAME.E.placeAt(GAME.E.player,s.x,s.z,0):GAME.E.player.obj.position.set(s.x,0,s.z);")
    sp = await pg.evaluate("(()=>{ const i=(GAME.E.interactables||[]).find(i=>/迎新集合點/.test(i.label||'')); return i?[i.x,i.z,i.label,!!i.hidden]:null; })()"); say('   迎新集合點：%s' % sp)
    ok3 = False; ln = []
    if sp:
        h = (await pg.evaluate(SNAP))['h']
        if h < 9.5:
            await walk_to(pg, cdp, run, sp[0], sp[1], 1.0, '迎新集合點')
            t0 = time.time()
            while (await pg.evaluate(SNAP))['h'] < 9.52 and time.time() - t0 < 600: await pg.wait_for_timeout(3000)
        it = await use(pg, cdp, run, "/迎新集合點/.test(i.label||'')", '迎新集合點', near=0.9)
        await drain(pg, cdp, pref=['參加', '「我叫'], secs=300)
        ln = await lines(pg); ok3 = any('法律系的迎新' in x for x in ln)
        await run.shot(pg, 'x80_after')
        say('   台詞（前 8）：%s' % json.dumps(ln[:8], ensure_ascii=False))
    verdict('X80', ok1 and ok2 and ok3, '8/28 手機「活動」%s；9/22 一週內%s「法律系迎新」；8/31 走到集合點參加＝%s' % ('有「%s」' % row if i >= 0 else '沒有迎新', '沒有' if ok2 else '還有', '演了迎新' if ok3 else '沒演（台詞 %d 句）' % len(ln)))


# ---------------------------------------------------------------- X67
async def order_noodle(pg, cdp, run, pick, log):
    it = await use(pg, cdp, run, "i.eat==='noodle'", '阿鳳麵店點餐')
    if not it: return None
    cs = []
    for k in range(10):
        s = await L.state(pg)
        if s['choices']:
            cs = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
            if any(c.startswith('乾麵') for c in cs): break
            await drain(pg, cdp, pref=[], secs=5); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        await pg.wait_for_timeout(800)
    say('   選單：%s' % cs)
    c = await pg.evaluate("(w=>{ const e=[...document.querySelectorAll('#choices button')].find(b=>b.textContent.trim().startsWith(w)); if(!e) return null; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim()]; })(%s)" % json.dumps(pick))
    if not c: return cs
    await L.touch_tap(cdp, c[0], c[1]); say('   ▶ 點：%s' % c[2]); await pg.wait_for_timeout(1200)
    await drain(pg, cdp, pref=['不用了', '自己吃'], secs=120, log=log)
    return cs


async def x67(pg, cdp, run, base):
    await load(pg, cdp, run, base, 'X67（9/25 週四 12:00 阿鳳麵店；舊存檔沒有 G.eat＝從空的開始）', h=12.0, zone='noodle', js="delete G.eat; G.money=Math.max(G.money|0,2000);")
    log = []; menus = []
    for n, pick in enumerate(['乾麵', '餛飩湯', '乾麵', '乾麵'], 1):
        await pg.evaluate('window.__LOG=[]'); m = await order_noodle(pg, cdp, run, pick, log); menus.append(m); ln = await lines(pg)
        say('   第 %d 次：%s' % (n, json.dumps(ln[:6], ensure_ascii=False)))
        if n == 1:
            first = any('牆上的菜單只有六樣' in x for x in ln); await run.shot(pg, 'x67_first')
    eat = await pg.evaluate("JSON.stringify(GAME.G.eat||null)"); say('   G.eat：%s' % eat[:300])
    await pg.evaluate('window.__LOG=[]'); m5 = await order_noodle(pg, cdp, run, '老樣子', log); ln5 = await lines(pg); await run.shot(pg, 'x67_fifth')
    say('   第 5 次：選單 %s｜台詞 %s' % (m5, json.dumps(ln5[:6], ensure_ascii=False)))
    l5 = any('你坐，我知道你要什麼。' in x for x in ln5); same = any('好啦。不用講。' in x for x in ln5); has_same = bool(m5) and any(x.startswith('老樣子') for x in m5)
    # 筆記本「吃過的」（照玩家：選單 → 筆記本）
    note = await pg.evaluate("(()=>{ const t=typeof EAT!=='undefined'&&EAT.notesHTML?EAT.notesHTML(GAME.G,d=>String(d)):''; const div=document.createElement('div'); div.innerHTML=t; return div.innerText; })()")
    say('   筆記本「吃過的」（EAT.notesHTML 的字）：%s' % note[:200].replace('\n', '｜'))
    okn = '阿鳳麵店' in note
    verdict('X67', first and l5 and has_same and same and okn, '第一次的旁白=%s；第 5 次阿姨那一句=%s、選單有「老樣子」=%s、選了回「好啦。不用講。」=%s；筆記本吃過的有阿鳳麵店=%s' % (first, l5, has_same, same, okn))


# ---------------------------------------------------------------- X77
async def x77(pg, cdp, run, base):
    await load(pg, cdp, run, base, 'X77（9/25 15:44 校園霖澤館前）', zone='campus',
               js="const s={x:34,z:-98}; GAME.E.placeAt?GAME.E.placeAt(GAME.E.player,s.x,s.z,0):GAME.E.player.obj.position.set(s.x,0,s.z);")
    mm = await pg.evaluate("(()=>{ const m=document.getElementById('minimap'); if(!m) return null; const r=m.getBoundingClientRect(); return [r.left,r.top,r.width,r.height]; })()"); say('   小地圖位置：%s' % mm)
    for k, yaw in enumerate([0.0, math.pi / 2, math.pi]):
        await pg.evaluate("(y=>{ const C=GAME.E.cam; C.yaw=y; C.manualT=60; })(%s)" % yaw); await pg.wait_for_timeout(2500)
        if mm: await pg.screenshot(path=os.path.join(OUT, 'x77_mm_yaw%d.png' % k), clip={'x': mm[0] - 4, 'y': mm[1] - 4, 'width': mm[2] + 8, 'height': mm[3] + 8})
    # 北的字：在小地圖畫布上找「北」那一圈的位置，讀中心附近的顏色（白＝修好；黃＝原本）
    col = await pg.evaluate("""(()=>{ const c=document.querySelector('#minimap canvas')||document.getElementById('minimap'); if(!c||!c.getContext) return null; const x=c.getContext('2d'); const W=c.width,H=c.height, cy=GAME.E.cam.yaw, nr=Math.min(W,H)/2-9;
      const px=Math.round(W/2+Math.sin(cy)*nr), py=Math.round(H/2-Math.cos(cy)*nr); const d=x.getImageData(px-6,py-6,13,13).data; let w=0,y=0; for(let i=0;i<d.length;i+=4){ const r=d[i],g=d[i+1],b=d[i+2]; if(r>220&&g>220&&b>220) w++; else if(r>200&&g>150&&b<120) y++; } return {px,py,white:w,yellow:y}; })()""")
    say('   「北」附近像素：%s' % col)
    # [捷徑] 目的地設在宿舍（在校園另一頭、小地圖外）→ 小地圖邊上應該是往外指的箭頭
    await pg.evaluate("(()=>{ if(GAME.setGoal) GAME.setGoal('回宿舍',{zone:'dorm'}); else GAME.G.goalDest={zone:'dorm'}; })()"); run.setup('[捷徑] 目的地設成宿舍（GAME.setGoal）')
    await pg.wait_for_timeout(4000)
    if mm: await pg.screenshot(path=os.path.join(OUT, 'x77_mm_target.png'), clip={'x': mm[0] - 4, 'y': mm[1] - 4, 'width': mm[2] + 8, 'height': mm[3] + 8})
    await run.shot(pg, 'x77_full_target')
    ok = bool(col) and col['white'] > 6 and col['yellow'] < 4
    verdict('X77', ok, '小地圖「北」：白色像素 %s、黃色像素 %s（白字白框＝修好）；目的地在小地圖外的箭頭看截圖 x77_mm_target.png' % ((col or {}).get('white'), (col or {}).get('yellow')))


ITEMS = [('X65', x65), ('X72', x72), ('X74', x74), ('X80', x80), ('X67', x67), ('X77', x77)]


async def main():
    run = L.Run('xsweep', OUT); base = json.load(open(SAVE, encoding='utf-8')); allerrs = []
    async with async_playwright() as p:
        for name, fn in ITEMS:
            if ONLY and name not in ONLY: continue
            say('== %s' % name); t0 = time.time()
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            try:
                await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
                await asyncio.wait_for(fn(pg, cdp, run, base), 1500)
            except asyncio.TimeoutError:
                verdict(name, False, '超過 25 分鐘沒做完（卡住）'); await run.shot(pg, 'timeout_' + name)
            except Exception as e:
                verdict(name, False, '例外 %r' % e)
                try: await run.shot(pg, 'err_' + name)
                except Exception: pass
            allerrs += errs; say('   （%.0f 秒）' % (time.time() - t0))
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
        for k, v in res.items(): run.check('%s：%s' % (k, v['why'][:160]), v['ok'], '')
        run.check('沒有 JS 例外', not allerrs, json.dumps(allerrs[:3], ensure_ascii=False))
        json.dump({'res': res, 'bad': bad}, open(os.path.join(OUT, 'xsweep.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
