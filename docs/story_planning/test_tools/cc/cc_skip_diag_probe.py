"""CC-C 11-14：SKIP_DIAG_0918（BB-C 17:16：CANON_NEWGAME_B2_r2 9/18 起床選單選「翹這堂課」，13:11 人還是在教室、民法總則記上過＝疑似 GAME P1）。判定歸 LAWWW／BB。
做法（兩輪：SKIP＝「翹這堂課」、UP＝「先起床再說」對照）：
  【前置】最小存檔（cc_seedplay；過了開場）讀到 2025-09-17 22:50 宿舍、條件事件照開 → 照玩家走到床（interactable sleep）按 → 床的選單選「睡到明天中午」
  → 9/18 12:00 醒來的選單選那一個 → 之後每 10 秒記 zone、位置、遊戲時間、今天每一堂的狀態（CLS.dayItems＋status）、今天 OUT 排程、EVENTS.running、選單、對話、toast，截圖，一直到 13:30（遊戲時間）。
  中途跳出來的選單：不選上課那一類（直接去上課／去上課／進教室），其他選第一個；對話照字點。全部照實記。
CC-B 11-14：EVE 參數（前一晚的日期）、加 FAIL_SETUP 檢查隔天 CLS.goList 不是空的（r2：seedplay 的 9/18 是主線第 2 天劇情課）。
CC_02 清單 2026-11-14：1✓（9/18 民法總則 13:20，照 B2_r2 的實況；前一晚睡到中午＝照玩家） 2✓（床用 interactable sleep、課用 CLS.dayItems 讀） 3n/a（一張床） 4✓（按之前確認選單在） 5✓（走到床用 go_to） 6✓（每 10 秒取樣到 13:30，最多 600 秒） 7✓（lint、node 驗 JS） 8n/a（只記） 9✓（每次取樣截圖） 10✓（對話照字點、選單不點上課類） 11✓（SHA 40 碼、ENV 沒有「|」） 12✓（FAIL_SETUP 檢查：真的醒在 9/18 12 點、真的出現翹課那個選單） 13n/a（只走到床）
用法：LW_TESTS=<wt>/tests SHA=<sha> [CASES=SKIP,UP] python3 cc_skip_diag_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import bbplay as P
import cc_seedplay as SP
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
CASES = [c for c in (os.environ.get('CASES') or 'SKIP,UP').split(',') if c]
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('skip_diag', OUT); SP.setup(R, OUT)
PICK = {'SKIP': '翹這堂課', 'UP': '先起床再說'}
import datetime as _dt
EVE = os.environ.get('EVE') or '2025-09-17'   # CC-B 11-14（BB-B 12:20）：前一晚的日期；cc_seedplay 存檔的 9/18 是主線第 2 天（民總劇情課、goList 空、不出起床選單）＝要換日子時用 EVE=2025-09-24
WAKE = (_dt.date.fromisoformat(EVE) + _dt.timedelta(days=1)).isoformat()
CLASSY = ('直接去上課', '去上課', '進教室', '還是去')   # 翹課確認框〔還是去／翹〕（classes3d.js CLS.skipClass）
SNAP = r"""(()=>{ const G=GAME.G, E=GAME.E, P=E.player, o=P.obj.position; let items=[]; try{ items=CLS.dayItems(G).map(it=>({key:it.key, name:it.c&&it.c.name, t0:it.t0, st:CLS.status?CLS.status(G,it):null})); }catch(e){ items='ERR '+e.message; }
  let outs=[]; try{ outs=(OUT.rec(G)||[]).filter(q=>q&&q.day===G.day).map(q=>({id:q.id,ev:q.ev,h:q.h,state:q.state,place:q.place})); }catch(e){}
  const ch=[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>(b.textContent||'').trim().slice(0,30));
  const dl=document.getElementById('dlg'), ts=document.getElementById('toast');
  return {key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(3), zone:G.zone, pos:[+o.x.toFixed(2),+o.z.toFixed(2),P.lv|0], busy:!!P.busy, depth:(GAME.D&&GAME.D.busyDepth)|0,
    running:(typeof EVENTS!=='undefined'&&EVENTS.running)||null, items, outs, choices:ch, dlg:(dl&&!dl.classList.contains('hide'))?((document.getElementById('dlgText')||{}).textContent||'').trim().slice(0,40):'',
    toast:(ts&&ts.offsetParent)?(ts.textContent||'').trim().slice(0,50):'', goingTo:(CLS.going&&typeof CLS.going==='function')?CLS.going(G):null}; })()"""


async def to_bed(pg, cdp, tag):
    it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?{x:it.x,z:it.z,lv:it.lv|0,label:it.label||''}:null; })()")
    if not it: return False
    await L.go_to(pg, cdp, R, it['x'], it['z'], 0.8, '%s 床' % tag, max_s=120, lv=it['lv'], stop=lambda s: s['dlg'] or s['choices'])
    for _ in range(6):
        s = await P.ts(pg)
        if s['ch']: return True
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    return bool((await P.ts(pg))['ch'])


async def pick(pg, cdp, prefix):
    s = await P.ts(pg); o = [x['t'] for x in s['ch']]
    i = next((n for n, t in enumerate(o) if t.startswith(prefix)), None)
    if i is None: return None, o
    await pg.screenshot(path=os.path.join(OUT, 'menu_%s.png' % prefix[:4]))
    await P.tap_choice(pg, cdp, i); await pg.wait_for_timeout(1200)
    return o[i], o


async def one(pg, cdp, tag):
    d, seed = await SP.fresh(pg, cdp, tag, EVE, 22 + 50 / 60, 'dorm', {}, {})
    pre = await pg.evaluate("(()=>{ const G=GAME.G, k={day:G.day,hour:G.hour,weekday:G.weekday}; G.day=G.day+1; G.weekday=CALENDAR.dateOf(G.day).wd%7; G.hour=8; const o={mainDay:STORY.mainDay?STORY.mainDay(G):null, items:CLS.dayItems(G).map(it=>({n:it.c.name,story:CLS.storyClass?CLS.storyClass(G,it):null})), goList:CLS.goList(G).map(it=>it.c.name)}; Object.assign(G,k); return o; })()")
    if not R.check('FAIL_SETUP 檢查：[%s] %s 有起床選單會列的課（CLS.goList 不是空的；不是主線第 2 天的劇情課）' % (tag, WAKE), bool(pre.get('goList')), J(pre)): return {'case': tag, 'skip': 'golist'}
    ok = await to_bed(pg, cdp, tag)
    if not R.check('FAIL_SETUP 檢查：[%s] %s 晚上床的選單出來' % (tag, EVE), ok, ''): return {'case': tag, 'skip': 'bed'}
    got, opts = await pick(pg, cdp, '睡到明天中午')
    if got is None: got, opts = await pick(pg, cdp, '睡覺')   # 11-14 BB-C（BB_379 027fc1a3b4 TEST_BUG）：v9.10.26 床的選單是「睡覺／明天早上醒來」（標題＋說明連在一起），沒有「睡到明天中午」
    R.note('[%s] %s 床的選單 %s → %s' % (tag, EVE, J(opts), got))
    if not R.check('FAIL_SETUP 檢查：[%s] 床的選單點到「睡覺」那一項' % tag, got is not None, J(opts)): return {'case': tag, 'skip': 'sleep_pick'}
    # 等醒來的選單（9/18 12:00）
    wake = None; t0 = time.time()
    while time.time() - t0 < 180:
        s = await P.ts(pg)
        if s['ch'] and any(x['t'].startswith('翹這堂課') or x['t'].startswith('先起床') for x in s['ch']): wake = s; break
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(800)
    sn0 = await pg.evaluate(SNAP)
    if not R.check('FAIL_SETUP 檢查：[%s] %s 醒來、有「翹這堂課／先起床再說」選單' % (tag, WAKE), bool(wake) and sn0['key'] == WAKE, J({'snap': sn0, 'wake': wake and [x['t'] for x in wake['ch']]})): return {'case': tag, 'skip': 'wake', 'snap': sn0}
    R.note('[%s] 醒來 %s；選單 %s' % (tag, J(sn0), J([x['t'] for x in wake['ch']])))
    got, opts = await pick(pg, cdp, PICK[tag]); R.note('[%s] 選了「%s」' % (tag, got))
    if tag == 'SKIP':
        for _ in range(8):   # 翹課會先說兩句、再出確認框〔還是去／翹〕
            s = await P.ts(pg)
            if s['ch']:
                g2, o2 = await pick(pg, cdp, '翹'); R.note('[%s] 確認框 %s → %s' % (tag, J(o2), g2)); break
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
            await pg.wait_for_timeout(600)
    rows = []; t0 = time.time(); n = 0
    while time.time() - t0 < 600:
        sn = await pg.evaluate(SNAP); n += 1; rows.append(sn)
        await pg.screenshot(path=os.path.join(OUT, '%s_%02d.png' % (tag, n)))
        R.note('[%s] #%d %s %.3f %s %s；課 %s；OUT %s；事件 %s；選單 %s；對話「%s」；toast「%s」' % (tag, n, sn['key'], sn['h'], sn['zone'], J(sn['pos']), J(sn['items']), J(sn['outs']), sn['running'], J(sn['choices']), sn['dlg'], sn['toast']))
        if sn['h'] >= 13.5 or sn['key'] != WAKE: break
        if sn['choices']:
            i = next((k for k, t in enumerate(sn['choices']) if not any(t.startswith(c) for c in CLASSY)), None)
            if i is not None: await P.tap_choice(pg, cdp, i); await pg.wait_for_timeout(800)
        elif sn['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600)
        await pg.wait_for_timeout(10000)
    att = next((it for it in (rows[-1]['items'] if rows and isinstance(rows[-1]['items'], list) else []) if 'civ_general' in (it.get('key') or '')), None)
    first_cls = next((r for r in rows if r['zone'] == 'classroom'), None)
    R.note('[%s] 結束：民法總則 %s；第一次在 classroom＝%s' % (tag, J(att), J(first_cls and {'h': first_cls['h'], 'running': first_cls['running']})))
    if tag == 'SKIP': R.check('[SKIP] 選了「翹這堂課」以後沒有被帶進教室', first_cls is None, J(first_cls))
    return {'case': tag, 'wake': sn0, 'picked': got, 'rows': rows}


async def main():
    print('CC SKIP_DIAG_0918：SHA %s；CASES %s；Playwright ≠ iPhone' % (SHA or '?', CASES), flush=True)
    res = {'sha': SHA, 'cases': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(1)
        for c in CASES:
            try: res['cases'].append(await one(pg, cdp, c))
            except Exception as e:
                R.check('[%s] 沒有中斷' % c, False, repr(e)[:300]); await pg.screenshot(path=os.path.join(OUT, 'crash_%s.png' % c))
            open(os.path.join(OUT, 'skip_diag.json'), 'w', encoding='utf-8').write(J(res))
            await pg.goto(URL); await L.wait_loaded(pg, 600)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'skip_diag.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
