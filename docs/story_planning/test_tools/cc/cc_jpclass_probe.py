"""CC-C 11-13：JPCLASS_MSGS（LAWWW-C 04:07 ⑦；src/jpclass3d.js＋src/data/jpclass_lines.js）。日文班群組 g:jp_class 的四則，照玩家打開手機看、照玩家按回覆。判定歸 BB。
CASES（逗號分隔，預設 L2,KR,ASK_YES,ASK_NO,THANKS）：
  L2       2027-10-26 21:15 讀檔（宿舍）→【捷徑】PHONE.join 日文班（大二日文課才會加）→ 等遊戲時間過 21:30 → 打開手機「訊息」→ 日文班 → 截圖、記全文（jpc_vet_level2）
  KR       2027-12-07 同上（jpc_korean）
  ASK_YES  2028-04-18 20:45 讀檔 →【捷徑】PHONE.join＋JPCLASS.inJapan 改成 true（日本路線人在日本那段；探針不讀日本存檔）→ 過 21:00 → 打開那一串 → 按「好。」→ 記 CZ_VET_PHOTO、她的回覆
  ASK_NO   同上，按「這週沒空。」
  THANKS   2028-04-22 20:45 讀檔，旗標 CZ_VET_PHOTO=yes、JP.rec(G).done.cz_vet_photo＝那天（4/22 白天摘要演過）→ 過 21:00 → 看「牠好胖！」「謝謝！」
CC_02 清單 2026-11-13：1✓（條件照 LAWWW-C 04:07 與 tests/canon_batch4_1112_unit.js：群組、日本、CZ_VET_PHOTO、cz_vet_photo 都設；全部標【捷徑】） 2✓（群組 id、選項字從遊戲讀：#phoneBody [data-th]、[data-ask]） 3n/a（每一則只有一個目標） 4✓（點之前確認那一串、那個回覆鍵在畫面上） 5n/a（不走路） 6✓（讀檔後等遊戲時間真的過了排定時間，最多 120 秒） 7✓（lint、node 驗 JS） 8n/a（不判數字） 9✓（手機畫面原樣截圖） 10✓（中途有對話先點完） 11✓（SHA 40 碼、ENV 沒有「|」） 12✓（FAIL_SETUP 檢查：真的在群組裡、時間真的過了、那一串打得開） 13n/a（不走路）
用法：LW_TESTS=<wt>/tests SHA=<sha> [CASES=…] python3 cc_jpclass_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
CASES = [c for c in (os.environ.get('CASES') or 'L2,KR,ASK_YES,ASK_NO,THANKS').split(',') if c]
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('jpclass', OUT); D.setup(R, OUT)
TH = 'g:jp_class'
PLAN = {'L2': ('2027-10-26', 21.25, 21.5, None), 'KR': ('2027-12-07', 21.25, 21.5, None),   # 11-13 r1 KR／ASK x:cond＝讀檔等 8 秒時遊戲時間已過排定時間、還沒入群組就判了：改成提前 15 分鐘讀檔
        'ASK_YES': ('2028-04-18', 20.75, 21.0, '好。'), 'ASK_NO': ('2028-04-18', 20.75, 21.0, '這週沒空。'), 'THANKS': ('2028-04-22', 20.75, 21.0, None)}
MSGS = "(th=>(GAME.G.msgs||[]).filter(m=>m.th===th).map(m=>({name:m.name||m.who||'', text:String(m.text||''), h:m.h, ask:m.ask?(m.ask.opts||[]).map(o=>o.t||o.text||''):null})))"


async def drain(pg, cdp):
    for _ in range(60):
        q = await D.st(pg)
        if q['choices']: await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); if(b[0]) b[0].click(); })()"); await pg.wait_for_timeout(700); continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        break


async def open_thread(pg, cdp, tag):
    await L.close_panels(pg, cdp); await drain(pg, cdp)
    if not await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="msg"]'); await pg.wait_for_timeout(1000)
    await pg.screenshot(path=os.path.join(OUT, 'jp_%s_1_list.png' % tag))
    sel = '#phoneBody [data-th="%s"]' % TH
    await pg.evaluate("(s=>{ const e=document.querySelector(s); if(e) e.scrollIntoView({block:'center'}); })", sel); await pg.wait_for_timeout(300)
    ok = await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1300)
    await pg.screenshot(path=os.path.join(OUT, 'jp_%s_2_thread.png' % tag))
    return ok


async def one(pg, cdp, case):
    day, h0, due, reply = PLAN[case]; tag = case
    fl = {'CZ_VET_PHOTO': 'yes'} if case == 'THANKS' else {}
    await D.load_zone(pg, cdp, 'dorm', day, h0, wait=8000)
    R.setup('[%s]【前置／捷徑】讀檔到 %s %.2f 宿舍' % (tag, day, h0))
    await pg.evaluate("((a)=>{ const G=GAME.G; Object.assign(G.flags,a.fl); PHONE.join(G,'jp_class','日文班'); if(a.jp){ window.__jpKeep=window.__jpKeep||JPCLASS.inJapan; JPCLASS.inJapan=()=>true; } if(a.thanks){ JP.rec(G).done.cz_vet_photo=G.day; } })",
                      {'fl': fl, 'jp': case.startswith('ASK'), 'thanks': case == 'THANKS'})
    R.setup('[%s]【捷徑】PHONE.join 日文班%s%s' % (tag, '、JPCLASS.inJapan=true（日本路線人在日本）' if case.startswith('ASK') else '', '、CZ_VET_PHOTO=yes＋JP.rec.done.cz_vet_photo＝今天' if case == 'THANKS' else ''))
    inq = await pg.evaluate("(()=>JSON.stringify(GAME.G.phone||{}).indexOf('jp_class')>=0)()")
    if not R.check('FAIL_SETUP 檢查：[%s] 在日文班群組裡' % tag, bool(inq), ''): return {'case': case, 'skip': 'not in group'}
    t0 = time.time()
    while time.time() - t0 < 240:
        h = await pg.evaluate("+GAME.G.hour")
        if h >= due + 0.1: break
        await drain(pg, cdp); await pg.wait_for_timeout(1500)
    h = await pg.evaluate("+GAME.G.hour")
    if not R.check('FAIL_SETUP 檢查：[%s] 遊戲時間過了 %.2f（現在 %.2f）' % (tag, due, h), h >= due, ''): return {'case': case, 'skip': 'time'}
    await pg.wait_for_timeout(2000); await drain(pg, cdp)
    ok = await open_thread(pg, cdp, tag)
    msgs = await pg.evaluate(MSGS, TH); ef = await pg.evaluate("(GAME.G.flags.EF_PH||{})")
    R.note('[%s] 打開日文班=%s；這一串 %s；EF_PH %s' % (tag, ok, J(msgs), J({k: v for k, v in ef.items() if k.startswith('jpc_')})))
    R.check('FAIL_SETUP 檢查：[%s] 手機訊息裡日文班那一串打得開' % tag, bool(ok), '')
    out = {'case': case, 'msgs': msgs, 'ef': {k: v for k, v in ef.items() if k.startswith('jpc_')}}
    if reply:
        asks = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-ask]')].map(b=>(b.textContent||'').trim())")
        R.note('[%s] 回覆鍵 %s' % (tag, J(asks)))
        i = next((n for n, t in enumerate(asks) if t.startswith(reply)), None)
        if R.check('FAIL_SETUP 檢查：[%s] 有「%s」回覆鍵' % (tag, reply), i is not None, J(asks)):
            await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#phoneBody [data-ask]')]; if(b[i]) b[i].click(); })(%d)" % i); await pg.wait_for_timeout(2500)
            await pg.screenshot(path=os.path.join(OUT, 'jp_%s_3_after_reply.png' % tag))
            out['after'] = await pg.evaluate(MSGS, TH); out['CZ_VET_PHOTO'] = await pg.evaluate("GAME.G.flags.CZ_VET_PHOTO||null")
            R.note('[%s] 按「%s」以後：CZ_VET_PHOTO=%s；這一串 %s' % (tag, reply, out['CZ_VET_PHOTO'], J(out['after'][-4:])))
    if case.startswith('ASK'): await pg.evaluate("(()=>{ if(window.__jpKeep) JPCLASS.inJapan=window.__jpKeep; })()")
    return out


async def main():
    print('CC 日文班群組：SHA %s；CASES %s；Playwright ≠ iPhone' % (SHA or '?', CASES), flush=True)
    res = {'sha': SHA, 'cases': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(1)
        for c in CASES:
            try: res['cases'].append(await one(pg, cdp, c))
            except Exception as e:
                R.check('[%s] 沒有中斷' % c, False, repr(e)[:300]); await pg.screenshot(path=os.path.join(OUT, 'crash_%s.png' % c))
            await pg.goto(URL); await L.wait_loaded(pg, 600)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'jpclass.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
