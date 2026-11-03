"""CC（帳號 A）11-03：BUG-EAT-AFTER-CLASS-SCENE-1103 瀏覽器探針（BB 2026-11-03）。
使用者原話：「上課完去吃飯居然扣錢和吃飽，場景都是教室」。
修正：07e766f95（src/classes3d.js S.lunchBreak：MEALS 加 bg／bgNight；淡出 → 扣錢 → 過 40 分鐘 → ADV.begin({background:OUT.bg(那家店)}) → 地點字幕（店名）
     → 淡入 → 旁白一句 → ADV.end；阿鳳麵店 noodle_table、便利商店白天 cvs_table_day、18:00 以後 cvs_table_night；小松／學活還沒圖＝'dark'）。
     Node 測試：tests/eat_after_class_unit.js。目標 f5cd65cdf（07e766f95 是它的祖先）。
對照（修改前）：07e766f95^。預期：修正版 ALL PASS；修改前「開了 ADV、背景是那家店、店名字幕、看得到店的圖」會 FAIL（只淡出淡入、人在教室）。

判斷讀遊戲狀態：包一層記錄 ADV.begin（background）、ADV.setBg、ADV.end、GAME.caption、GAME.say、GAME.choose、GAME.money、GAME.enter（只記不改）；
  吃飯那一句旁白出現時讀 ADV.active、#adv 的背景圖（玩家看得到的那一張）、G.zone、G.hour、G.money；吃完讀 ADV 關了沒、時間、錢、之後去哪。
  遊戲沒有「飽足度」欄位（grep src：沒有 hunger／satiety／飽足 的狀態）：只記 G.energy 給人看，不判斷。
CASES（每個一個新瀏覽器；直向 390×844，ORIENT=land 改橫向）：
  noodle     【前置／捷徑】最小存檔 2025-11-10（一）08:55 在法律系館A 201（classroom）；那天 09:10 憲法（上）、15:30 體育（中間夠吃飯）。
             【捷徑】CLS.goClass(GAME, 憲法（上）)＝手機「今天」的直接去上課（坐中間的位子）；之後整堂課照玩家點（CDP 觸控）→ 下課選單點「先去吃飯」開頭的
             → 吃飯選單點「阿鳳麵店」開頭的 → 讀 ADV 背景 noodle_table、店名字幕、扣 70 元、過 40 分鐘 → 吃完去下一堂（體育）
  cvs_day    同上，吃飯選單點「便利商店」開頭的 → cvs_table_day、扣 75 元
  cvs_night  【捷徑】遊戲的課表只有上午／下午一／下午二三個時段（src/data/courses.js blocks，最晚 17:20 下課），玩家走不到「18:00 以後的下課選單」；
             所以讀到 2025-11-10 19:00 在 201，直接叫 CLS.lunchBreak(GAME)（＝下課選單「先去吃飯」那一條的同一個函式），吃飯選單照玩家點「便利商店」
             → cvs_table_night、扣 75 元、過 40 分鐘（吃完不接下一堂：lunchBreak 本身不出發）
不是 iPhone：Playwright 手機模擬（is_mobile、觸控；SwiftShader 1～4 fps）。URL 不加 ?turbo（有的話拿掉）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=noodle,cvs_day,cvs_night] python3 cc_eat_after_class_probe.py '<URL>/index.html' <輸出資料夾>
每項一行 PASS／FAIL，最後 ALL PASS 或 FAILED n；exit 0／1。"""
import os, sys, json, asyncio, time, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
URL = URL.replace('?turbo&', '?').replace('&turbo', '').replace('?turbo', '')
SHA = os.environ.get('SHA', '?')
LAND = os.environ.get('ORIENT', 'port') == 'land'
CASES = [c.strip() for c in os.environ.get('CASES', 'noodle,cvs_day,cvs_night').split(',') if c.strip()]
J = lambda o: json.dumps(o, ensure_ascii=False, default=str)
FAILS = []
DAY_KEY = '2025-11-10'
SPEC = {'noodle': dict(meal='阿鳳麵店', price=70, bg='noodle_table', h=8 + 55 / 60, viaClass=True),
        'cvs_day': dict(meal='便利商店', price=75, bg='cvs_table_day', h=8 + 55 / 60, viaClass=True),
        'cvs_night': dict(meal='便利商店', price=75, bg='cvs_table_night', h=19.0, viaClass=False)}


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def setup(s): print('  [前置／捷徑] ' + s, flush=True)
def note(s): print('  ' + s, flush=True)


BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore', 'classroom')


async def state_at(pg, key, h, zone):
    d = await P.day_of(pg, key)
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'flags': dict(BASEF)}
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=None, weather='clear', stage='law', money=30000)
    st['visited'] = {z: True for z in VISITED}
    st['courses'] = {'done': {}, 'attend': {}, 'prep': {}, 'electives': {}, 'note': {}, 'disc': {}, 'ask': {}, 'late': {}, 'abs': {}, 'exam': {}, 'grades': {}}
    return st, d


HOOK = r"""(()=>{ if(window.__EA) return 'again'; const W=window.__EA={log:[]};
  const t=()=>{ let h=null,d=null,z=null,m=null; try{ h=+(+GAME.G.hour).toFixed(4); d=GAME.G.day; z=GAME.G.zone; m=GAME.G.money; }catch(e){} return {ms:Math.round(performance.now()),h,d,z,m}; };
  const push=(k,x)=>{ W.log.push(Object.assign({k},x||{},t())); if(W.log.length>3000) W.log.splice(0,1000); };
  const bgOf=b=>b&&typeof b==='object'?{image:b.image||null,night:!!b.night}:(b==null?null:String(b));
  const wrap=(o,fn,k,arg)=>{ if(!o) return false; const f0=o[fn]; if(typeof f0!=='function') return false; o[fn]=function(){ let a={}; try{ a=arg?arg.apply(null,arguments):{}; }catch(e){} push(k,a); return f0.apply(this,arguments); }; return true; };
  const A=typeof ADV!=='undefined'?ADV:null;
  return {advBegin:wrap(A,'begin','adv.begin',o=>({bg:bgOf(o&&o.background)})),advSetBg:wrap(A,'setBg','adv.setBg',b=>({bg:bgOf(b)})),advEnd:wrap(A,'end','adv.end'),
    caption:wrap(GAME,'caption','caption',(w,s)=>({n:String(w||''),t:String(s==null?'':s)})),say:wrap(GAME,'say','say',(w,s)=>({n:(w&&w.name)||(typeof w==='string'?w:''),t:String(s==null?'':s)})),
    choose:wrap(GAME,'choose','choose',o=>({t:(o||[]).filter(x=>x&&!x.hidden).map(x=>x.t||x.text||'')})),money:wrap(GAME,'money','money',v=>({v:+v})),
    enter:wrap(GAME,'enter','enter',z=>({to:String(z)})),lunch:wrap(CLS,'lunchBreak','lunchBreak'),goClass:wrap(CLS,'goClass','goClass',(GM,it)=>({c:it&&it.c&&it.c.name}))}; })()"""
ADVST = r"""(()=>{ const A=typeof ADV!=='undefined'?ADV:null, el=document.getElementById('adv'); const G=GAME.G;
  const imgs=[]; if(el){ for(const e of [el,...el.querySelectorAll('*')]){ const bi=getComputedStyle(e).backgroundImage; if(bi&&bi!=='none') imgs.push(bi.slice(0,200)); } }
  const vis=!!el&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&+getComputedStyle(el).opacity>0.05;
  return {active:!!(A&&A.active),domVis:vis,body:document.body.classList.contains('adv-on'),imgs,zone:G.zone,ezone:GAME.E.zone&&GAME.E.zone.id||null,h:+(+G.hour).toFixed(4),money:G.money,energy:G.energy}; })()"""
CLASSIT = """(k=>{ const G=GAME.G; const its=CLS.dayItems(G,G.day).filter(i=>!i.exam); return its.map(i=>({key:i.key,c:i.c.name,id:i.c.id,t0:i.t0,t1:i.t1,zone:i.room&&i.room.zone,room:i.room&&i.room.name,door:!!(i.room&&i.room.door)})); })()"""


def pick(opts, prefs):
    for pf in prefs:
        for i, o in enumerate(opts):
            if not o['dim'] and o['t'].startswith(pf): return i
    for i, o in enumerate(opts):
        if not o['dim']: return i
    return 0


async def one(p, case):
    sp = SPEC[case]; tag = case
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=LAND)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    rec = {'case': case, 'sha': SHA}; n = [0]

    async def shot(lab):
        n[0] += 1; fp = os.path.join(OUT, 'eat_%s_%02d_%s.png' % (case, n[0], lab))
        try: await pg.screenshot(path=fp)
        except Exception as e: note('截圖失敗 %r' % e)
        return fp
    try:
        await pg.goto(URL); ok = await L.wait_loaded(pg); check('%s：遊戲載入' % tag, ok)
        await pg.evaluate("localStorage.clear()"); await P.init(pg)
        st, d = await state_at(pg, DAY_KEY, sp['h'], 'classroom')
        await L.load_state(pg, st, quiet_phone=True); await pg.wait_for_timeout(4000)
        try: await L.phone_away(pg, cdp, tries=2)
        except Exception: pass
        hk = await pg.evaluate(HOOK); rec['hooks'] = hk
        setup('%s：最小存檔讀到 %s %.2f 法律系館A 201（classroom）；條件事件照常，只關「要回覆的訊息自動打開手機」' % (tag, d['key'], sp['h']))
        check('%s：記錄鉤子都掛上' % tag, isinstance(hk, dict) and all(hk.get(k) for k in ('advBegin', 'advEnd', 'caption', 'say', 'choose', 'money', 'lunch')), J(hk))
        its = await pg.evaluate(CLASSIT); rec['items'] = its
        m_before = None; h_before = None; nx = None
        if sp['viaClass']:
            first = next((i for i in its if i['zone'] == 'classroom' and not i['door']), None)
            nx = next((i for i in its if first and i['t0'] > first['t1']), None)
            check('%s：那天有 201 的課、下午還有下一堂（課表 %s）' % (tag, J([(i['c'], i['t0'], i['t1']) for i in its])), bool(first) and bool(nx))
            if not first or not nx: raise RuntimeError('no class pair')
            setup('%s：CLS.goClass(GAME, %s)＝手機「今天」直接去上課（之後整堂課照玩家點）' % (tag, first['c']))
            await pg.evaluate("(k=>{ const G=GAME.G; const it=CLS.dayItems(G,G.day).find(q=>q.key===k); if(it) void CLS.goClass(GAME,it,{}); })(%s)" % J(first['key']))
            # 上課：對話點下去、選單照玩家（座位選中間、課堂提問選第一個）；等到下課選單有「先去吃飯」
            t0 = time.time(); after = None; chose = []
            while time.time() - t0 < 1500:
                s = await P.ts(pg)
                if s['phone'] and not s['dlg'] and not s['ch']: await L.phone_away(pg, cdp, tries=2); continue
                if s['ch']:
                    await pg.wait_for_timeout(500); s = await P.ts(pg)
                    if not s['ch']: continue
                    if any(o['t'].startswith('先去吃飯') for o in s['ch']): after = s; break
                    k = pick(s['ch'], ('坐中間', '老位子', '坐在')); chose.append([[o['t'] for o in s['ch']], s['ch'][k]['t']])
                    note('%s：上課中的選單 %s → %s' % (tag, J([o['t'] for o in s['ch']]), s['ch'][k]['t']))
                    await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
                if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
                await pg.wait_for_timeout(700)
            rec['class_choices'] = chose; rec['after_menu'] = after and after['ch']
            done = await pg.evaluate("(k=>!!CLS.rec(GAME.G).done[k])(%s)" % J(first['key']))
            check('%s：照玩家上完那堂課（%s done）' % (tag, first['c']), done, J({'h': after and after['h']}))
            check('%s：下課選單出現、有「先去吃飯」開頭的選項（%s）' % (tag, J(after and [o['t'] for o in after['ch']])), bool(after))
            if not after: raise RuntimeError('no after menu')
            await shot('after_menu')
            k = next(i for i, o in enumerate(after['ch']) if o['t'].startswith('先去吃飯'))
            check('%s：「先去吃飯」沒有變暗' % tag, not after['ch'][k]['dim'], J(after['ch'][k]))
            m_before = await pg.evaluate("GAME.G.money"); h_before = await pg.evaluate("+GAME.G.hour")
            await P.tap_choice(pg, cdp, k); note('%s：點「%s」' % (tag, after['ch'][k]['t'])); await pg.wait_for_timeout(1500)
        else:
            setup('%s：課表沒有 18:00 以後的課（下課選單到不了晚上）→ 直接叫 CLS.lunchBreak(GAME)（下課選單「先去吃飯」的同一個函式）' % tag)
            m_before = await pg.evaluate("GAME.G.money"); h_before = await pg.evaluate("+GAME.G.hour")
            await pg.evaluate("(()=>{ void CLS.lunchBreak(GAME); })()"); await pg.wait_for_timeout(1500)
        # 吃飯選單
        t0 = time.time(); mm = None
        while time.time() - t0 < 60:
            s = await P.ts(pg)
            if s['ch'] and any(o['t'].startswith(sp['meal']) for o in s['ch']): mm = s; break
            if s['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(700)
        rec['meal_menu'] = mm and mm['ch']
        check('%s：吃飯選單有「%s」開頭的選項' % (tag, sp['meal']), bool(mm), J(mm and [o['t'] for o in mm['ch']]))
        if not mm: raise RuntimeError('no meal menu')
        await shot('meal_menu')
        k = next(i for i, o in enumerate(mm['ch']) if o['t'].startswith(sp['meal']))
        m_before = await pg.evaluate("GAME.G.money"); h_before = await pg.evaluate("+GAME.G.hour"); z_before = await pg.evaluate("GAME.G.zone")
        n0 = await pg.evaluate("window.__EA.log.length")
        await P.tap_choice(pg, cdp, k); note('%s：點「%s」' % (tag, mm['ch'][k]['t']))
        # 吃飯那一句旁白：等對話框出現（或逾時），讀 ADV 狀態、截圖
        t0 = time.time(); seen = None; line_adv = None
        while time.time() - t0 < 90:
            s = await P.ts(pg)
            if s['dlg'] and s['txt']:
                await pg.wait_for_timeout(800); line_adv = await pg.evaluate(ADVST); seen = s; await shot('meal_line'); break
            if not s['busy'] and s['depth'] == 0 and time.time() - t0 > 20: break
            await pg.wait_for_timeout(300)
        rec['meal_line'] = seen and seen['txt']; rec['meal_adv'] = line_adv
        if not seen: await shot('no_line')
        # 吃完：對話點掉；吃完以後（修正版）lunchBreak 回來、goClass 出發去下一堂：等區域換掉或空下來
        t0 = time.time(); post = None
        while time.time() - t0 < 300:
            s = await P.ts(pg)
            log = await pg.evaluate("(n=>window.__EA.log.slice(n))(%d)" % n0)
            ended = any(x['k'] == 'adv.end' for x in log) or not any(x['k'] == 'adv.begin' for x in log)
            if nx and ended and s['zone'] != z_before: post = s; break
            if s['ch']:
                post = s; note('%s：吃完以後的選單 %s（停在這裡，不再往下）' % (tag, J([o['t'] for o in s['ch']]))); break
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
            if not s['busy'] and s['depth'] == 0 and ended and time.time() - t0 > 6 and not nx: post = s; break
            await pg.wait_for_timeout(600)
        await pg.wait_for_timeout(1500); await shot('after_meal')
        log = await pg.evaluate("(n=>window.__EA.log.slice(n))(%d)" % n0); rec['log'] = log
        end_st = await pg.evaluate(ADVST); rec['end'] = end_st; rec['post'] = post
        begins = [x for x in log if x['k'] == 'adv.begin']; caps = [x for x in log if x['k'] == 'caption']; money = [x for x in log if x['k'] == 'money']
        b0 = begins[0] if begins else None
        note('%s：ADV.begin %s；字幕 %s；錢 %s；enter %s' % (tag, J([x['bg'] for x in begins]), J([x['t'] for x in caps]), J([x['v'] for x in money]), J([x['to'] for x in log if x['k'] == 'enter'])))
        img = (b0 or {}).get('bg') if b0 else None
        check('%s：吃飯那一段開了 ADV（ADV.begin，不是停在教室的 3D）' % tag, bool(b0), J([x['bg'] for x in begins]))
        check('%s：ADV 背景是那家店（background.image 含 %s）' % (tag, sp['bg']), isinstance(img, dict) and sp['bg'] in (img.get('image') or ''), J(img))
        check('%s：玩家看得到：吃飯那句旁白時 ADV 開著、#adv 的背景圖是 %s' % (tag, sp['bg']), bool(line_adv) and line_adv['active'] and any(sp['bg'] in u for u in line_adv['imgs']),
              J(line_adv and {'active': line_adv['active'], 'vis': line_adv['domVis'], 'imgs': line_adv['imgs'][:4]}))
        check('%s：地點字幕是店名（開頭「%s」）' % (tag, sp['meal']), any(x['t'].startswith(sp['meal']) for x in caps), J([x['t'] for x in caps]))
        says = [x['t'] for x in log if x['k'] == 'say']   # 對話框逐字出現：判斷用 GAME.say 的參數（畫面上的字只截圖）
        check('%s：旁白是那家店的那一句（GAME.say 開頭「%s」；對話框出現過）' % (tag, sp['meal']), bool(seen) and any(t.startswith(sp['meal']) for t in says[:3]), J({'say': says[:3], 'dlg': seen and seen['txt']}))
        meal_money = [x['v'] for x in money if x['v'] < 0]
        check('%s：扣 %d 元（GAME.money(-%d) 一次）' % (tag, sp['price'], sp['price']), meal_money[:1] == [-sp['price']], J({'money_calls': [x['v'] for x in money], 'before': m_before}))
        h_line = line_adv and line_adv['h']
        dmin = round((h_line - h_before) * 60, 1) if h_line is not None else None
        check('%s：吃飯過 40 分鐘（旁白時 %s → %s，%s 分）' % (tag, round(h_before, 3), h_line, dmin), dmin is not None and 38 <= dmin <= 46, J({'before': h_before, 'line': h_line}))
        check('%s：吃飯那一段 G.zone 還是原本的區域（沒有亂換區域；店是 2D 背景）' % tag, bool(line_adv) and line_adv['zone'] == z_before, J({'zone': line_adv and line_adv['zone'], 'before': z_before}))
        if case == 'cvs_night':
            check('%s：吃飯時是晚上（>= 18:00）' % tag, h_line is not None and h_line % 24 >= 18, J(h_line))
        else:
            check('%s：吃飯時是白天（< 18:00）' % tag, h_line is not None and h_line % 24 < 18, J(h_line))
        ends = [x for x in log if x['k'] == 'adv.end' and b0 and x['ms'] >= b0['ms']]
        ent = [x for x in log if x['k'] == 'enter']
        if nx:   # 吃完會接著去下一堂（下一堂的 ADV 不算）：吃飯的 ADV 要在出發（GAME.enter）以前關掉
            check('%s：吃完 ADV 關掉（吃飯的 ADV.begin 之後有 ADV.end，而且在出發去下一堂以前）' % tag, bool(ends) and (not ent or ends[0]['ms'] <= ent[0]['ms']),
                  J({'end_ms': [x['ms'] for x in ends[:2]], 'enter_ms': [x['ms'] for x in ent[:2]]}))
            check('%s：吃完接著去下一堂（%s %s）：GAME.enter 換了區域、到的時候還沒上課' % (tag, nx['c'], nx['t0']),
                  bool(ent) and end_st['zone'] != z_before and end_st['h'] < nx['t0'], J({'enter': [x['to'] for x in ent], 'zone': end_st['zone'], 'h': end_st['h'], 't0': nx['t0']}))
        else:
            check('%s：吃完 ADV 關掉（ADV.end、ADV.active false）' % tag, bool(ends) and not end_st['active'], J({'end_calls': len(ends), 'active': end_st['active']}))
            check('%s：吃完留在原本的位置（區域 %s 沒換、不卡：沒有對話、玩家不忙）' % (tag, z_before), end_st['zone'] == z_before and bool(post) and not post['busy'] and not post['dlg'], J({'zone': end_st['zone'], 'post': post and {k2: post[k2] for k2 in ('busy', 'dlg', 'depth', 'h')}}))
        note('%s：吃完 G.hour=%s money=%s energy=%s（遊戲沒有飽足度欄位）' % (tag, end_st['h'], end_st['money'], end_st['energy']))
    except Exception as e:
        check('%s：跑完（沒有探針例外）' % tag, False, repr(e)[:400]); traceback.print_exc()
        try: await shot('exception')
        except Exception: pass
    finally:
        check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3])); rec['errs'] = errs[:5]
        with open(os.path.join(OUT, 'eat_%s_record.json' % case), 'w', encoding='utf-8') as f: json.dump(rec, f, ensure_ascii=False, indent=1, default=str)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        for c in CASES:
            if c not in SPEC: check('CASE %s 認得' % c, False, '可以用：' + ','.join(SPEC)); continue
            print('==== CASE %s（SHA %s）====' % (c, SHA), flush=True)
            await one(p, c)
    print('SHA', SHA, 'CASES', ','.join(CASES), flush=True)
    print('ALL PASS' if not FAILS else 'FAILED %d' % len(FAILS), flush=True)
    sys.exit(1 if FAILS else 0)


if __name__ == '__main__':
    asyncio.run(main())
