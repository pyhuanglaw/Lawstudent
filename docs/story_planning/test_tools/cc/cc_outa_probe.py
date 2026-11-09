"""CC-B（帳號 B）11-09：BUG-OUT-ALARM-SKIP-1109 回歸（BB-B 20:11，LAWWW-B 87f52f2f3：出遊預設都停在出發前 10 分鐘）。判定＝BB。
MODE（每一種開一個新瀏覽器）：
  movie  ：【前置／捷徑】宿舍 2025-10-18 15:00、旗標 AA614_MOVIE＝那天（＝群組答「好。」）→ 遊戲排出 aa614_movie（19:30，程式沒寫 alarm）→ 按手機「等到晚上（20:00）」
  morning：【前置／捷徑】宿舍 2025-10-19（日）06:30，用程式裡 sideq3d.js:294 同一組參數直接 OUT.plan 排 sq18_park（08:30 溫州街小公園，沒寫 alarm；
           正常是接了 SQ18「二十杯飲料」以後才排）→ 按手機跳過時間裡會越過 08:30 的那一個
  walk   ：同 movie 的前置但讀到 18:50，不按跳過時間，站著等到出發（對照：出發選單只出現一次）
每一次停下來（有對話／選單）都記：幾點、caption、toast、選單、q.state；選單有「出發」「現在出發」就選它（照玩家），有「到時間再說」以外的照第一個。
最後記：q.state 前後、出遊演了沒（events.done[ev]）、手機最後 8 則訊息。
用法：LW_TESTS=<wt>/tests MODE=movie|morning|walk python3 cc_outa_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests')); sys.path.insert(0, HERE)
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
MODE = os.environ.get('MODE') or 'movie'
R = L.Run('outa_' + MODE, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
CONF = {'movie': ('2025-10-18', 15.0, 'aa614_movie', 'ev_aa614_movie'), 'walk': ('2025-10-18', 18.83, 'aa614_movie', 'ev_aa614_movie'), 'morning': ('2025-10-19', 6.5, None, 'ev_sq18_park'), 'date': ('2025-10-19', 6.5, None, None)}
DAY, H0, QID, EV = CONF[MODE]
STATE = """(a=>{ const G=GAME.G; const tx=id=>{ const e=document.getElementById(id); return e?e.textContent.trim().slice(0,90):''; }; const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,a[0]):null;
  return {d:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(3), zone:G.zone, caption:tx('caption')||tx('cap'), toast:tx('toast'), dlg:tx('dlgText')||tx('dlg'),
    choices:[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,30)), q:q?{state:q.state,h:q.h,alarm:q.alarm===undefined?'(沒寫)':q.alarm}:null, played:a[1]?!!(G.events&&G.events.done&&G.events.done[a[1]]):(q?q.state==='done':false)}; })"""
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        d = await pg.evaluate("k=>STORY.dayOfKey(k)", DAY)
        qid = QID or ('sq18_park_%d' % d)
        flags = {'AA614_MOVIE': d} if MODE in ('movie', 'walk') else {}
        R.setup('【前置／捷徑】讀檔到宿舍 %s %s；旗標 %s' % (DAY, H0, J(flags)))
        await L.load_state(pg, {'zone': 'dorm', 'day': d, 'hour': H0, 'pos': None, 'flags': flags}, quiet_events=True, quiet_phone=True)
        await pg.wait_for_timeout(5000)
        if MODE == 'morning':
            R.setup('【捷徑】OUT.plan 照 sideq3d.js:294 的參數排 %s（08:30，不寫 alarm）' % qid)
            R.note('OUT.plan → %s' % await pg.evaluate("d=>OUT.plan(GAME.G,{id:'sq18_park_'+d,ev:'ev_sq18_park',day:d,h:8.5,late:0.5,place:'溫州街・小公園',title:'週日早上：二十杯飲料送到小公園',travel:'走路 約 10 分鐘',travelH:1/6})", d))
        if MODE == 'date':   # 校外約會（dateTrip）：【捷徑】DATE.book 直接約（和 social smoke 當面約出來的那一筆一樣：沈以安、D01 華山、10:00 出發）
            bk = await pg.evaluate("d=>{ const r=DATE.book(GAME.G,{who:'heroine_01',day:d,depart:10,locs:['D01']}); return r&&r.ok===false?r:{ok:true,trip:(GAME.G.trips||[]).slice(-1)[0]}; }", d)
            R.setup('【捷徑】DATE.book（沈以安、D01、10:00 出發）→ %s' % J(bk)); qid = 'date_' + ((bk.get('trip') or {}).get('trip') or '')
        await pg.wait_for_timeout(2000)
        s0 = await pg.evaluate(STATE, [qid, EV]); R.note('開始：%s' % J(s0))
        if MODE == 'walk': R.note('（walk：讀檔當下還沒排出遊是正常的；改在出發選單那一刻檢查）q=%s' % J(s0.get('q')))
        else: R.check('有排出出遊 %s' % qid, bool(s0.get('q')), J(s0))
        stops, prompts, hist = [], 0, []
        if MODE in ('movie', 'morning', 'date'):
            await L.close_panels(pg, cdp)
            await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
            await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=today]'); if(b) b.click(); })()"); await pg.wait_for_timeout(800)
            opts = await pg.evaluate("(()=>[...document.querySelectorAll('#phoneBody [data-skip]')].map(b=>b.textContent.trim().slice(0,30)))()"); R.note('跳過時間：%s' % J(opts))
            want = 20.0 if MODE == 'movie' else (9.0 if MODE == 'morning' else 10.5)
            import re
            def hh(t):
                m = re.search(r'(\d{1,2}):(\d{2})', t); return int(m.group(1)) + int(m.group(2)) / 60 if m else 99
            cand = [i for i, t in enumerate(opts) if hh(t) >= want]
            pick = cand[0] if cand else len(opts) - 1
            c = await pg.evaluate("i=>{ const e=[...document.querySelectorAll('#phoneBody [data-skip]')][i]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim()]; }", pick)
            if c: await L.touch_tap(cdp, c[0], c[1]); R.note('按「%s」' % c[2])
            await pg.wait_for_timeout(2500)
        t0 = time.time(); last_dlg = None
        while time.time() - t0 < float(os.environ.get('MAXS') or 420):
            st = await pg.evaluate(STATE, [qid, EV])
            if st['choices'] or st['dlg']:
                key = (st['h'], tuple(st['choices']), st['dlg'][:20])
                if key != last_dlg:
                    hist.append(st); last_dlg = key
                    if any(x in ' '.join(st['choices']) for x in ('出發', '現在出發')): prompts += 1; stops.append(st); R.note('停下（出發選單）：%s' % J(st))
                if st['choices']:
                    i = next((k for k, t in enumerate(st['choices']) if t.startswith('出發') or t.startswith('現在出發')), 0)
                    await pg.evaluate("i=>{ const b=[...document.querySelectorAll('#choices button')][i]; if(b) b.click(); }", i)
                else: await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(700); continue
            if st['played'] or (st.get('q') or {}).get('state') in ('done', 'missed'):
                hist.append(st); break
            await L.close_panels(pg, cdp); await pg.wait_for_timeout(2000)
        fin = await pg.evaluate(STATE, [qid, EV]); hist.append(fin)
        msgs = await pg.evaluate("(()=>(GAME.G.msgs||[]).slice(-8).map(m=>({from:m.from||null,text:String(m.text||'').slice(0,60),day:m.day,h:m.h,tag:m.tag||null})))()")
        R.note('最後：%s' % J(fin)); R.note('手機最後 8 則：%s' % J(msgs)); R.note('出發選單出現 %d 次；停下的時間 %s' % (prompts, J([x['h'] for x in stops])))
        await pg.screenshot(path=os.path.join(OUT, 'outa_%s_final.png' % MODE))
        R.check('停在出發前（出發選單至少 1 次）', prompts >= 1, J([x['h'] for x in stops]))
        if MODE == 'walk': R.check('有排出出遊 %s（出發選單那一刻）' % qid, any(x.get('q') for x in stops), J([x.get('q') for x in stops]))
        if MODE in ('walk', 'date'): R.check('出發選單（鬧鐘）只出現 1 次、只停一次', prompts == 1, str(prompts))
        R.check('出遊演了（events.done）', fin['played'], J(fin))
        R.check('q.state 是 done、不是 missed', (fin.get('q') or {}).get('state') == 'done', J(fin.get('q')))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        json.dump({'s0': s0, 'hist': hist, 'final': fin, 'msgs': msgs, 'prompts': prompts}, open(os.path.join(OUT, 'outa_%s.json' % MODE), 'w'), ensure_ascii=False, indent=1)
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
