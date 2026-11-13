"""BB-B 2026-11-08：UX-WEEKEND-ASK-EXPIRE-1108（LAWWW-B c1f89f8e0，AA-B 11-08 09:19）瀏覽器驗收。
可昕（交往中）週五 19:30「週末來外校大學？我當導遊。」／下週五「這週末呢？導遊還在。」——那個週日 24:00 收起來：
沒回＝跟沒回一樣、不出字；之後讀檔不會自己打開手機；記 KX_TOUR_NO 'expired'，下週五照樣有第二則；
過期超過一週才發現（舊存檔）＝第二則也不傳。
  O（舊存檔）：使用者 day38 存檔，【前置】把 kx_tour_ask 改成沒回（ans 拿掉、KX_TOUR_YES 拿掉）→ 讀檔（只關條件事件，手機自動打開照常）
       → 手機不自己打開可昕那一串、沒有回覆鍵、KX_TOUR_NO／NO2＝expired → 【前置】跳到下週五 19:00 站到 19:40：沒有「這週末呢？」
  F（新的一輪）：同一份存檔【前置】拿掉 kx_tour 那兩則和旗標、改到第一則那個週五 19:00（宿舍）→ 站到 19:30：收到第一則、有兩個回覆鍵 → 不回、關手機
       →【前置】同一份進度跳到週日 23:40，站著等過 24:00：回覆鍵不見、KX_TOUR_NO＝expired → 讀檔（週一 07:30）：手機不自己打開
       →【前置】跳到下週五 19:00 站到 19:30：收到「這週末呢？導遊還在。」、有回覆鍵 → 不回 →【前置】跳到那個週日 23:40 等過 24:00：收起來、KX_TOUR_NO2＝expired
       →【前置】再下週五 19:00 站到 19:40：沒有第三則
不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。
用法：LW_TESTS=<測試樹>/tests [MODE=O,F] python3 pt1108h_kx_tour_expire_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, copy, json, os, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import bbplay as P

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
MODES = os.environ.get('MODE', 'O,F').split(',')
J = lambda o: json.dumps(o, ensure_ascii=False)
T1, T2 = '週末來外校大學？我當導遊。', '這週末呢？導遊還在。'
OPT_YES = '好，週六下午過去。'
TAGS = ('kx_tour_ask', 'kx_tour_ask2')

KX = """(()=>{ const G=GAME.G, F=G.flags||{}, R=PHONE.rec(G); const T=['kx_tour_ask','kx_tour_ask2'];
  const ms=(G.msgs||[]).filter(m=>T.includes(m.tag)).map(m=>({tag:m.tag,day:m.day,h:m.h,ans:m.ans==null?null:m.ans,until:m.ask&&m.ask.until,open:PHONE.askOpen(G,m)}));
  const q=(R.q||[]).filter(x=>T.includes(x.tag)).map(x=>({tag:x.tag,day:x.day,h:x.h}));
  const ph=document.getElementById('phone'); const open=!!ph&&!ph.classList.contains('hide');
  const d=CALENDAR.dateOf(G.day);
  return {day:G.day,h:+(+G.hour).toFixed(2),key:d.key,wd:d.wd%7,NO:F.KX_TOUR_NO||null,NO2:F.KX_TOUR_NO2||null,YES:F.KX_TOUR_YES||null,ms,q,
    phone:open, phoneText:open?((document.getElementById('phoneBody')||{}).innerText||'').slice(0,160):'', pendKx:PHONE.pending(G).filter(m=>T.includes(m.tag)).length}; })()"""


async def load_keep_auto(pg, st):
    """讀檔：只關條件事件（這支只測手機），要回覆的訊息自動打開手機照常（要測它）"""
    js = ("(async(st)=>{ const s=GAME.defaults(st.name||'祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); "
          "const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(" + J(st) + ")")
    await pg.evaluate(js)


async def kx(pg):
    return await pg.evaluate(KX)


async def day_info(pg, d):
    return await pg.evaluate("d=>{ const x=CALENDAR.dateOf(d); return {d, key:x.key, wd:x.wd===7?0:x.wd}; }", d)   # CALENDAR 週日＝7，G.weekday 週日＝0（同 bbplay DAY_JS）


async def jump_day(pg, run, d, hour, note):
    s = await pg.evaluate("()=>GAME.snapshot()")
    i = await day_info(pg, d)
    s = copy.deepcopy(s); s.update(day=d, weekday=i['wd'], hour=hour)
    await load_keep_auto(pg, s); await pg.wait_for_timeout(6000)
    run.setup('[前置] 同一份進度跳到 %s（週%s）%.2f 時（%s）' % (i['key'], '日一二三四五六'[i['wd']], hour, note))
    return i


async def stand_until(pg, cdp, run, day, h, max_s=900, tag=''):
    """站著等到 (day, h)；途中手機自己打開：記下來（第幾秒、那時候的畫面文字），收起來繼续等。回傳 (到了沒, 打開紀錄)"""
    t0, opened = time.time(), []
    while time.time() - t0 < max_s:
        k = await kx(pg)
        if k['phone']:
            opened.append({'t': round(time.time() - t0), 'day': k['day'], 'h': k['h'], 'text': k['phoneText']})
            await L.close_panels(pg, cdp); await pg.wait_for_timeout(800)
        if k['day'] > day or (k['day'] == day and k['h'] >= h): return True, opened
        await pg.wait_for_timeout(1500)
    run.note('%s：%d 秒內沒等到 day %s %.2f' % (tag, max_s, day, h))
    return False, opened


async def thread_btns(pg, cdp):
    t = await P.phone_thread(pg, cdp, 'p:kexin')
    await L.close_panels(pg, cdp); await pg.wait_for_timeout(600)
    return t


async def mode_O(pg, cdp, run, s0):
    s = copy.deepcopy(s0); s = s.get('G', s)
    for m in s.get('msgs') or []:
        if m.get('tag') == 'kx_tour_ask': m['ans'] = None; m.get('ask', {}).pop('until', None)
    for k in ('KX_TOUR_YES', 'KX_TOUR_NO', 'KX_TOUR_NO2'): s.setdefault('flags', {}).pop(k, None)
    s.update(hour=13.0, zone='dorm', pos=None); s['invites'] = [v for v in s.get('invites', []) if v.get('state') != 'going']
    run.setup('[前置][O] 使用者存檔 day38（%s）：kx_tour_ask 改成沒回、拿掉 KX_TOUR_YES；13:00 宿舍；讀檔只關條件事件（手機自動打開照常）' % s.get('day'))
    await load_keep_auto(pg, s); await pg.wait_for_timeout(9000)
    k = await kx(pg); print('[O] 讀檔後', J(k), flush=True)
    run.check('[O] 讀檔後手機沒有自己打開到可昕這一則', not (k['phone'] and (T1 in k['phoneText'])), J(k))
    run.check('[O] 舊的那一則（沒有 until）照週五＋3 天算已過期：不能回、不算待回覆', all(not m['open'] for m in k['ms'] if m['tag'] == 'kx_tour_ask') and k['pendKx'] == 0, J(k['ms']))
    run.check('[O] 記 KX_TOUR_NO＝expired、KX_TOUR_NO2＝expired（過期超過一週才發現）', k['NO'] == 'expired' and k['NO2'] == 'expired', J([k['NO'], k['NO2']]))
    t = await thread_btns(pg, cdp)
    run.check('[O] 可昕那一串：看得到「%s」、沒有回覆鍵' % T1, t['ok'] and T1 in t['text'] and not any(a['t'].startswith(OPT_YES) for a in t['asks']), J({'ok': t['ok'], 'asks': t['asks'], 'tail': t['text'][-200:]}))
    await run.shot(pg, 'O_thread')
    nf = await pg.evaluate("()=>{ let d=GAME.G.day+1; while(CALENDAR.dateOf(d).wd!==5) d++; return d; }")
    await jump_day(pg, run, nf, 19.0, 'O：下一個週五')
    ok, op = await stand_until(pg, cdp, run, nf, 19.67, tag='[O] 週五 19:40')
    k = await kx(pg); print('[O] 下週五 19:40', J(k), op, flush=True)
    run.check('[O] 下週五 19:40 沒有「%s」（不在佇列、沒送）' % T2, ok and not any(m['tag'] == 'kx_tour_ask2' for m in k['ms']) and not k['q'], J([k, op]))


async def mode_F(pg, cdp, run, s0):
    s = copy.deepcopy(s0); s = s.get('G', s)
    s.update(hour=13.0, zone='dorm', pos=None)
    await load_keep_auto(pg, s); await pg.wait_for_timeout(4000)
    # 第一則那個週五：Y1S1 第 (week1Start?2:3) 週週五（story3d.js kx_tour_ask）——用原本的存檔算，不動它
    fri = await pg.evaluate("()=>{ const wk=STORY.week1Start(GAME.G)?2:3; for(let d=GAME.G.day-120; d<GAME.G.day+30; d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&t.week===wk&&CALENDAR.dateOf(d).wd===5) return {d,wk}; } return null; }")
    run.check('[F] 找到第一則那個週五', bool(fri), J(fri))
    if not fri: return
    s2 = copy.deepcopy(s0); s2 = s2.get('G', s2)
    s2['msgs'] = [m for m in (s2.get('msgs') or []) if m.get('tag') not in TAGS]
    for k in ('KX_TOUR_YES', 'KX_TOUR_NO', 'KX_TOUR_NO2'): s2.setdefault('flags', {}).pop(k, None)
    s2['invites'] = [v for v in s2.get('invites', []) if v.get('state') != 'going']
    i = await day_info(pg, fri['d'])
    s2.update(day=fri['d'], weekday=i['wd'], hour=19.0, zone='dorm', pos=None)
    await load_keep_auto(pg, s2); await pg.wait_for_timeout(5000)
    pre = await kx(pg)
    run.setup('[前置][F] 使用者存檔 day38 拿掉 kx_tour 那兩則和 KX_TOUR_* 旗標，改到 %s（Y1S1 第 %s 週週五）19:00 宿舍；讀檔後 %s' % (i['key'], fri['wk'], J({k: pre[k] for k in ('NO', 'NO2', 'YES', 'q', 'ms')})))
    ok, op = await stand_until(pg, cdp, run, fri['d'], 19.55, tag='[F] 週五 19:30')
    k = await kx(pg); print('[F] 週五 19:33', J(k), op, flush=True)
    m1 = next((m for m in k['ms'] if m['tag'] == 'kx_tour_ask'), None)
    run.check('[F] 週五 19:30 收到「%s」、期限＝那個週日 24:00（until %s）、可以回' % (T1, (fri['d'] + 3) * 24), bool(m1) and m1['until'] == (fri['d'] + 3) * 24 and m1['open'], J(m1))
    run.note('[F] 第一則到的時候手機自己打開的紀錄（照常的行為，只記不判）：%s' % J(op))
    t = await thread_btns(pg, cdp)
    run.check('[F] 可昕那一串有兩個回覆鍵', sum(1 for a in t['asks'] if a['t'].startswith(OPT_YES) or a['t'].startswith('這週末不行')) == 2, J(t['asks']))
    k = await kx(pg)
    run.check('[F] 不回也關得掉手機（不是一定要回的那種）', not k['phone'], J(k['phone']))
    # 週日 23:40 → 等過 24:00
    await jump_day(pg, run, fri['d'] + 2, 23.67, 'F：那個週日，不回')
    k = await kx(pg); print('[F] 週日 23:40', J(k), flush=True)
    run.check('[F] 週日 23:40 還可以回（期限還沒到）', any(m['tag'] == 'kx_tour_ask' and m['open'] for m in k['ms']), J(k['ms']))
    await L.close_panels(pg, cdp)
    ok, op = await stand_until(pg, cdp, run, fri['d'] + 3, 0.1, max_s=900, tag='[F] 等過週日 24:00')
    if not ok:
        await jump_day(pg, run, fri['d'] + 3, 0.5, 'F：等不到 24:00，【捷徑】改到週一 00:30')
        await pg.wait_for_timeout(4000)
    k = await kx(pg); print('[F] 過了週日 24:00', J(k), op, flush=True)
    run.check('[F] 過了週日 24:00：第一則收起來（不能回、不算待回覆）、KX_TOUR_NO＝expired、NO2 沒記', all(not m['open'] for m in k['ms'] if m['tag'] == 'kx_tour_ask') and k['pendKx'] == 0 and k['NO'] == 'expired' and not k['NO2'], J(k))
    run.check('[F] 過了 24:00 手機沒有自己打開到可昕那一則', not any(T1 in o['text'] for o in op if o['day'] >= fri['d'] + 3), J(op))
    t = await thread_btns(pg, cdp)
    run.check('[F] 可昕那一串：第一則還在、這一則的回覆鍵不見了', T1 in t['text'] and not any(a['t'].startswith(OPT_YES) or a['t'].startswith('這週末不行') for a in t['asks']), J({'asks': t['asks'], 'tail': t['text'][-160:]}))
    await run.shot(pg, 'F_after_sun1')
    # 讀檔（週一 07:30）：手機不自己打開
    await jump_day(pg, run, fri['d'] + 3, 7.5, 'F：讀檔看手機會不會自己打開')
    await pg.wait_for_timeout(5000)
    k = await kx(pg)
    run.check('[F] 週一 07:30 讀檔：手機沒有自己打開到可昕這一則', not (k['phone'] and T1 in k['phoneText']), J(k))
    await L.close_panels(pg, cdp)
    # 下週五：第二則
    await jump_day(pg, run, fri['d'] + 7, 19.0, 'F：下週五')
    ok, op = await stand_until(pg, cdp, run, fri['d'] + 7, 19.55, tag='[F] 下週五 19:30')
    k = await kx(pg); print('[F] 下週五 19:33', J(k), op, flush=True)
    m2 = next((m for m in k['ms'] if m['tag'] == 'kx_tour_ask2'), None)
    run.check('[F] 下週五 19:30 收到「%s」（沒回的也照樣問）、期限＝那個週日 24:00、可以回' % T2, bool(m2) and m2['until'] == (fri['d'] + 10) * 24 and m2['open'], J(m2))
    t = await thread_btns(pg, cdp)
    run.check('[F] 第二則有回覆鍵', any(a['t'].startswith(OPT_YES) for a in t['asks']), J(t['asks']))
    await jump_day(pg, run, fri['d'] + 9, 23.67, 'F：第二則那個週日，不回')
    await L.close_panels(pg, cdp)
    ok, op = await stand_until(pg, cdp, run, fri['d'] + 10, 0.1, max_s=900, tag='[F] 等過第二個週日 24:00')
    if not ok:
        await jump_day(pg, run, fri['d'] + 10, 0.5, 'F：等不到 24:00，【捷徑】改到週一 00:30')
        await pg.wait_for_timeout(4000)
    k = await kx(pg); print('[F] 過了第二個週日', J(k), op, flush=True)
    run.check('[F] 第二則也收起來、KX_TOUR_NO2＝expired', all(not m['open'] for m in k['ms']) and k['pendKx'] == 0 and k['NO2'] == 'expired', J(k))
    await jump_day(pg, run, fri['d'] + 14, 19.0, 'F：再下週五')
    ok, op = await stand_until(pg, cdp, run, fri['d'] + 14, 19.67, tag='[F] 再下週五 19:40')
    k = await kx(pg)
    run.check('[F] 再下週五沒有第三則（兩則都在、沒有新的、佇列空）', len(k['ms']) == 2 and not k['q'], J(k))


async def main():
    run = L.Run('pt1108h_kx_tour_expire', OUT)
    s0 = json.load(open(os.path.join(SAVES, os.environ.get('SAVE', 'fatiao3d_save_day38.json')), encoding='utf-8'))
    async with async_playwright() as p:
        for mode in MODES:
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            await pg.goto(URL); run.check('[%s] 遊戲載入' % mode, await L.wait_loaded(pg))
            await P.init(pg)
            try:
                await (mode_O if mode == 'O' else mode_F)(pg, cdp, run, s0)
            except Exception as e:
                run.check('[%s] 探針沒有中途出錯' % mode, False, repr(e)[:300])
            run.check('[%s] 沒有 JS 例外' % mode, not errs, J(errs[:5]))
            await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
