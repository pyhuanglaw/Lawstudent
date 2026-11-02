"""CC（帳號 A）11-02：BUG-06 LATE15 瀏覽器探針——跳過時間的「會錯過」警告：已經遲到超過 15 分鐘的課（照樣記缺席）不再警告。
修正：4d0170d4c（src/classes3d.js S.skipTo 的 passed 加 `&&!(h0>it.t0+WIN1)`；WIN1=0.25、LATE_END=0.5）。
對照（修正前）：4d0170d4c^＝dc36b401e。預期：修正後 a PASS、c PASS；修正前 a FAIL（10:00 小睡跳出「會錯過 09:10 國文」那一種）。
不是 iPhone：Playwright 手機橫向模擬（844×390，SwiftShader）。不用 ?turbo。

情境：法律系第 DAY 天（預設 7＝週二，同 tests/flow_playtest_fixes 情境 C；09:10 國文、13:20 通識），人在宿舍房間。
  先【前置／捷徑】load_state 到 08:00 讀 CLS.dayItems(G)（只讀）找「早上那一堂」：t0 在 08:00～11:00、t1−LATE_END ≤ 12（等到中午會經過它的「記缺席」線）。
  每個子情境：
  【前置／捷徑】load_state（quiet_events）到 t0+offset 前 1 分鐘、宿舍 (0,1)；
  照玩家：CDP 觸控點 #btnPhone →「今天」分頁（#phoneTabs data-ptab=today）；
  【前置／捷徑】手機開著（遊戲暫停）時把 G.hour 校準成 t0+offset（讀檔到開手機之間時鐘會走；量 1.5 秒內有沒有在走、印出來）；
  照玩家：點「跳過時間」裡文字 startswith「等到中午」的按鈕（data-skip，走 CLS.skipTo 的玩家入口）。
  記錄：包一層 CLS.skipTo（只記錄、不改行為）抓按下去那一刻的 h0（G.hour）、目標、回傳值；#choices 有沒有 startswith「照樣跳過」的按鈕。
  a  offset=+16 分（h0>t0+15 分）：不出現「照樣跳過」；跳過後那一堂 CLS.status==='missed'（照樣記缺席）
     （修正前會出警告：照玩家選「照樣跳過」繼續，再看缺席）
  b  offset=+15 分整（h0==t0+WIN1）：照 b1b 程式 `!(h0>it.t0+WIN1)` 正好 15 分仍會警告——記錄實際行為（check 照程式預期）；選「先不要」
  c  offset=+10 分：要警告（按鈕 hint 裡有那一堂的時間）；選「先不要」→ 時間沒有跳（和按之前差 < 3 分鐘）
用法：LW_TESTS=<工作樹>/tests [SHA=<sha>] [SUBS=a,b,c] [DAY=7 WEEKDAY=2] python3 cc_late15_probe.py '<URL>/index.html' <輸出資料夾>
exit 0＝ALL PASS；1＝有 FAIL。"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?')
SUBS = [c.strip() for c in os.environ.get('SUBS', 'a,b,c').split(',') if c.strip()]
DAY = int(os.environ.get('DAY', '7')); WEEKDAY = int(os.environ.get('WEEKDAY', '2'))
OFFS = {'a': 16, 'b': 15, 'c': 10}   # 分鐘
J = lambda o: json.dumps(o, ensure_ascii=False)
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True,
              'fundsV2': 1, 'allowanceMonth': 9}
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def info(s): print('INFO ' + s, flush=True)


def setup(s): print('  [前置／捷徑] ' + s, flush=True)


def hm(h):
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


def st_at(h):
    return {'zone': 'dorm', 'hour': h, 'day': DAY, 'weekday': WEEKDAY, 'weather': 'clear', 'pos': {'x': 0, 'z': 1.0, 'yaw': 3.14}, 'flags': BASE_FLAGS, 'energy': 40}


HOOK_JS = """(()=>{ if(CLS.__ccw) return 'already'; const o=CLS.skipTo; CLS.skipTo=async function(GM,h1,op){ const r0={h0:GM.G.hour, h1:h1, op:op||null, done:false}; window.__cc_sk=r0;
  try{ const r=await o.apply(this,arguments); r0.ret=r; return r; } finally { r0.done=true; r0.hEnd=GM.G.hour; } }; CLS.__ccw=1; return 'ok'; })()"""

ITEMS_JS = """(()=>{ const G=GAME.G; return CLS.dayItems(G).map(it=>({key:it.key, name:it.c&&it.c.name, t0:it.t0, t1:it.t1, status:CLS.status(G,it), story:!!(CLS.storyClass&&CLS.storyClass(G,it))})); })()"""


async def choices(pg): return await pg.evaluate("(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return []; return [...ch.querySelectorAll('button')].map(b=>(b.textContent||'').trim()); })()")


async def tap_choice(pg, cdp, prefix):
    c = await pg.evaluate("(p=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>(x.textContent||'').trim().startsWith(p)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % J(prefix))
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1]); return True


async def sub(pg, cdp, k, it, rec):
    off = OFFS[k]; h_exact_js = '(%r+%d/60)' % (it['t0'], off)
    h_exact = await pg.evaluate(h_exact_js)
    print('---- %s：offset +%d 分（目標 h0=%r＝%s；t0+WIN1=%r） ----' % (k, off, h_exact, hm(h_exact), it['t0'] + 0.25), flush=True)
    setup('load_state（quiet_events）第 %d 天 %s 宿舍' % (DAY, hm(h_exact - 1 / 60)))
    await L.load_state(pg, st_at(h_exact - 1 / 60), quiet_events=True)
    await pg.wait_for_timeout(3000)
    await pg.evaluate(HOOK_JS); await pg.evaluate("window.__cc_sk=null")
    s = await L.state(pg)
    if s['dlg'] or s['choices']: info('讀檔後畫面上有對話／選項：' + J(s))
    ok1 = await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1500)
    ok2 = await L.tap(pg, cdp, '#phoneTabs button[data-ptab="today"]'); await pg.wait_for_timeout(1200)
    ha = await pg.evaluate("GAME.G.hour"); await pg.wait_for_timeout(1500); hb = await pg.evaluate("GAME.G.hour")
    info('%s 手機開著 1.5 秒：G.hour %r → %r（%s）' % (k, ha, hb, '時鐘停著' if ha == hb else '時鐘在走'))
    setup('手機開著時校準 G.hour=%s（%r）' % (h_exact_js, h_exact))
    await pg.evaluate("GAME.G.hour=%s" % h_exact_js)
    btns = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-skip]')].map(b=>[(b.textContent||'').trim(), b.dataset.skip])")
    hit = [b for b in btns if b[0].startswith('等到中午')]
    check('%s 照玩家打開手機「今天」、有「等到中午」按鈕' % k, ok1 and ok2 and bool(hit), J(btns))
    if not hit: return
    await L.tap(pg, cdp, '#phoneBody [data-skip="%s"]' % hit[0][1])
    warn = []; sk = None
    for _ in range(40):
        await pg.wait_for_timeout(400)
        ch = await choices(pg); sk = await pg.evaluate("window.__cc_sk")
        if any(c.startswith('照樣跳過') for c in ch): warn = ch; break
        if sk and sk.get('done'): break
    h0 = sk and sk['h0']
    r = {'off': off, 'h_exact': h_exact, 'h0': h0, 'h0_minus_t0_min': (h0 - it['t0']) * 60 if h0 is not None else None, 'warn': warn, 'sk': sk}
    info('%s 按下去那一刻 h0=%r（%s；h0−t0=%.4f 分；h0>t0+WIN1=%s）；警告選單=%s' % (k, h0, hm(h0) if h0 is not None else '--', r['h0_minus_t0_min'] or 0,
         (h0 is not None and h0 > it['t0'] + 0.25), J(warn)))
    await pg.screenshot(path=os.path.join(OUT, 'late15_%s.png' % k))
    item_hint = hm(it['t0'])
    if k == 'a':
        check('a h0−t0 > 15 分（前置成立）', h0 is not None and h0 > it['t0'] + 0.25, 'h0−t0=%.3f 分' % (r['h0_minus_t0_min'] or -1))
        check('a 遲到超過 15 分鐘的 %s %s：跳過時不出現「照樣跳過」警告' % (item_hint, it['name']), not warn, J(warn))
        if warn:
            await tap_choice(pg, cdp, '照樣跳過')
            info('a 出了警告：照玩家選「照樣跳過」繼續，看缺席')
        for _ in range(60):
            sk = await pg.evaluate("window.__cc_sk")
            if sk and sk.get('done'): break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(1500)
        stt = await pg.evaluate("(k=>{ const G=GAME.G; const it=CLS.dayItems(G).find(q=>q.key===k); return {status:it?CLS.status(G,it):null, hour:+G.hour.toFixed(3)}; })(%s)" % J(it['key']))
        r['after'] = stt; r['sk'] = sk
        check('a 跳過後時間有前進（目標 12:00 或中途停點）', stt['hour'] > h0 + 0.25, '回傳=%s 跳到 %s' % (sk and sk.get('ret'), hm(stt['hour'])))
        check('a 那一堂照樣記缺席（CLS.status==="missed"）', stt['status'] == 'missed', J(stt))
    else:
        if k == 'b':
            exact = h0 is not None and abs(h0 - (it['t0'] + 0.25)) < 1e-9
            check('b 前置：h0 正好等於 t0+WIN1（浮點相同）', exact, 'h0=%r t0+WIN1=%r' % (h0, it['t0'] + 0.25))
            check('b 邊界正好 15 分：照 b1b 程式 !(h0>t0+WIN1) 仍會警告（記錄實際行為）', bool(warn), J(warn))
        else:
            check('c h0−t0 < 15 分（前置成立）', h0 is not None and h0 < it['t0'] + 0.25, 'h0−t0=%.3f 分' % (r['h0_minus_t0_min'] or -1))
            check('c 未滿 15 分（+10 分）：要警告「照樣跳過」，且列出 %s 那一堂' % item_hint, bool(warn) and any(c.startswith('照樣跳過') and item_hint in c for c in warn), J(warn))
        if warn:
            await tap_choice(pg, cdp, '先不要'); await pg.wait_for_timeout(1500)
            h2 = await pg.evaluate("GAME.G.hour"); r['after_no'] = h2
            check('%s 選「先不要」：時間沒有跳（差 < 3 分鐘）' % k, abs(h2 - h0) < 0.05, 'h0=%s → %s' % (hm(h0), hm(h2)))
    rec[k] = r
    await L.close_panels(pg, cdp)


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('cc_late15_probe  SHA=%s  URL=%s  SUBS=%s' % (SHA, URL, ','.join(SUBS)), flush=True)
    rec = {'sha': SHA}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        check('遊戲載入', await L.wait_loaded(pg))
        setup('load_state（quiet_events）第 %d 天 08:00 宿舍：只讀 CLS.dayItems 找早上那一堂' % DAY)
        await L.load_state(pg, st_at(8.0), quiet_events=True)
        await pg.wait_for_timeout(2500)
        items = await pg.evaluate(ITEMS_JS); rec['items'] = items
        info('當天的課：' + J([(hm(x['t0']), hm(x['t1']), x['name'], x['status'], x['story']) for x in items]))
        cand = [x for x in items if not x['story'] and 8.0 <= x['t0'] <= 11.0 and x['t1'] - 0.5 <= 12.0]
        check('前置：有一堂早上的課（t0 08:00～11:00、t1−0.5 ≤ 12:00）', bool(cand), J(cand))
        if cand:
            it = cand[0]
            info('用這一堂：%s %s–%s（t0=%r、t1=%r、t1−LATE_END=%r）' % (it['name'], hm(it['t0']), hm(it['t1']), it['t0'], it['t1'], it['t1'] - 0.5))
            for k in SUBS:
                try:
                    await sub(pg, cdp, k, it, rec)
                except Exception as e:
                    check('%s 執行' % k, False, '例外：%r' % e)
        rec['errors'] = errs
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'late15.json'), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not FAILS else 'FAILED %d' % len(FAILS), flush=True)
    return 1 if FAILS else 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
