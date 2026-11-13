"""CC-C 11-14：BB_458 CANON-NO-ECON-1112 瀏覽器驗收（B～D 節，給 BB 判）。這一支先做 LAWWW 觸發表到之前就確定的：
  GIRAFFE_A／GIRAFFE_B  #6 長頸鹿鑰匙圈（src/data/events.js ev_kx_souvenir：trigger enter、linze／campus、Y1S2 第 1 週（carryTo 2）、
                        KX_Y1S1_END==='taipei'、KX_LINE_OK ACQUAINTANCE）→ 兩個選項各一輪（_A「為什麼我的最短？」、_B「謝謝。」）；記 KX_SOUVENIR、GIRAFFE_KEYCHAIN。
【前置】最小存檔（同 cc_vacgap_probe：GAME.defaults＋過了開場的旗標）讀到大一下第 1 週週一 10:00 宿舍；
【捷徑】可昕 FAMILIAR（SOCIAL.meet＋數值）、聯絡人、KX_MET、KX_Y1S1_END='taipei'（＝大一上期末那一場選「臺北。」），墊完 GAME.snapshot() 再讀一次、條件事件照開；
之後照玩家：手機「地點」→ 校園 → 快速前往（進區域＝onEnter）→ 演出來的每一句截圖、選項照 CASE。每一段最後跑 D158 字表（tools/cc_local/canon_codes.hits）。
CC_02 清單 2026-11-14：1✓（日子用 STORY.termDay('Y1S2',1,1) 在遊戲裡算；旗標照 events.js prereq） 2✓（事件 id、旗標從程式讀；地點按鈕用手機頁 data-place） 3n/a（一件） 4✓（點前 reveal 展開地區、按鈕在才點） 5✓（快速前往，不走路） 6✓（到了等事件開演最多 120 秒） 7✓（lint、node 驗 JS） 8n/a（字對不對歸 BB） 9✓（遊戲畫面原樣截圖） 10✓（別的對話照字點完並記下來） 11✓（SHA 40 碼、ENV 沒有「|」） 12✓（FAIL_SETUP 檢查：讀到 Y1S2 第 1 週、墊完可昕 ≥ ACQUAINTANCE、KX_Y1S1_END、真的到了校園） 13n/a（不走路）
  XMAS_MET_A／XMAS_MET_B／XMAS_PREV／XMAS_ABROAD  #17 大三聖誕（@d999d036d8 當面版；BB 改定：當面版＋人在國外的視訊版）：12/24 21:00 兩則 → 「好。」→ 12/25 21:00 法律系館A（國外＝視訊）
用法：LW_TESTS=<wt>/tests SHA=<sha> [CASES=GIRAFFE_A,GIRAFFE_B,XMAS_MET_A,…] python3 cc_canon458_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import bbplay as P
import cc_seedplay as SP
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
CASES = [c for c in (os.environ.get('CASES') or 'GIRAFFE_A,GIRAFFE_B').split(',') if c]
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('canon458', OUT); SP.setup(R, OUT)
DONE_JS = "(ids=>{ const D=(GAME.G.events&&GAME.G.events.done)||{}, F=GAME.G.flags||{}; const o={}; for(const k of ids) o[k]=(k in D)?D[k]:(k in F?F[k]:null); return o; })"


async def c_giraffe(pg, cdp, tag, alt):
    d, seed = await SP.fresh(pg, cdp, tag, ['Y1S2', 1, 1], 10.0, 'dorm', {'kexin': 'FAMILIAR'}, {'KX_Y1S1_END': 'taipei'})
    seed['lineOk'] = await pg.evaluate("(()=>typeof KX_LINE_OK==='function'?KX_LINE_OK(GAME.G,'ACQUAINTANCE'):null)()")
    R.note('[%s] 墊完 %s' % (tag, J(seed)))
    if not R.check('FAIL_SETUP 檢查：[%s] Y1S2 第 1 週、可昕 ≥ ACQUAINTANCE（KX_LINE_OK）、KX_Y1S1_END taipei' % tag,
                   d['term'] == 'Y1S2' and d['week'] == 1 and seed.get('lineOk') is not False and seed['flags'].get('KX_Y1S1_END') == 'taipei', J({'d': d, 'seed': seed})): return {'case': tag, 'skip': 'setup'}
    ok = await SP.travel(pg, cdp, tag, 'campus')
    r = await SP.play(pg, cdp, tag, alt=alt, start_s=120)
    z = (await P.clock(pg))['zone']
    R.check('FAIL_SETUP 檢查：[%s] 手機快速前往到了校園' % tag, ok and z in ('campus', 'linze'), J({'tapped': ok, 'zone': z}))
    st = await pg.evaluate(DONE_JS, ['ev_kx_souvenir', 'KX_SOUVENIR', 'GIRAFFE_KEYCHAIN'])
    R.note('[%s] 之後 %s' % (tag, J(st)))
    R.check('[%s] ev_kx_souvenir 演了、GIRAFFE_KEYCHAIN 設了' % tag, bool(st.get('ev_kx_souvenir')) and st.get('GIRAFFE_KEYCHAIN') is True, J(st))
    SP.d158(tag, r)
    return {'case': tag, 'day': d, 'seed': seed, 'r': r, 'after': st}


ABROAD_ON = "(()=>{ if(!window.__abKeep){ window.__abKeep=STORY.abroad; STORY.abroad=()=>true; } return true; })()"
ABROAD_OFF = "(()=>{ if(window.__abKeep){ STORY.abroad=window.__abKeep; window.__abKeep=null; } return true; })()"


async def c_xmas(pg, cdp, tag):
    """#17 大三聖誕（r2y3a3d.js S.xmasPhone @d999d036d8；tests/r2y3a_events_unit.js 第 21 節）：交往中 12/24 20:45 宿舍 → 21:00 後兩則 → 按「好。」
       → MET＝當面版（OUT y3_kx_xmas＝ev_kexin_xmas_y3_met 12/25 21:00 法律系館A）→ 跳 12/25 20:30 → 等「出發」→ 每句截圖（選項 MET_A 第 1 個「一直都在。」、MET_B 第 2 個）；
       PREV＝大二聖誕去過（KX_XMAS {2:'went'}）開頭多三列；ABROAD＝【捷徑】STORY.abroad 改成 true（人在國外那一年）→ 照舊視訊版"""
    prev = tag == 'XMAS_PREV'; abroad = tag == 'XMAS_ABROAD'; alt = 1 if tag == 'XMAS_MET_B' else 0
    fl = {'KX_XMAS': {'2': 'went'}} if prev else {}
    d, seed = await SP.fresh(pg, cdp, tag, '2027-12-24', 20.75, 'dorm', {'kexin': 'DATING'}, fl)
    R.note('[%s] 墊完 %s' % (tag, J(seed)))
    if abroad:
        await pg.evaluate(ABROAD_ON); R.setup('[%s]【捷徑】STORY.abroad 改成永遠 true（祐廷那年人在國外；不讀交換路線存檔）' % tag)
    if not R.check('FAIL_SETUP 檢查：[%s] 和可昕交往中' % tag, seed['kexin']['dating'], J(seed)): return {'case': tag, 'skip': 'setup'}
    await SP.wait_h(pg, cdp, 21.1, tag); await pg.wait_for_timeout(3000)
    t = await SP.thread(pg, cdp, tag + '_1224', 'p:kexin')
    lab = await SP.answer(pg, cdp, tag + '_1224', 'p:kexin', 0, '好')
    q = await pg.evaluate("(()=>{ const q=OUT.get(GAME.G,'y3_kx_xmas'); return q?{day:CALENDAR.dateOf(q.day).key,h:q.h,ev:q.ev,place:q.place,state:q.state,late:q.late}:null; })()")
    R.note('[%s] 按「%s」以後 OUT y3_kx_xmas＝%s' % (tag, lab, J(q)))
    want = 'ev_kexin_xmas_y3' if abroad else 'ev_kexin_xmas_y3_met'
    if not R.check('FAIL_SETUP 檢查：[%s] 12/25 21:00 那一趟排上了（%s）' % (tag, want), bool(q) and q['day'] == '2027-12-25', J(q)):
        if abroad: await pg.evaluate(ABROAD_OFF)
        return {'case': tag, 'ask': t, 'reply': lab}
    R.note('[%s] 排的是 %s（%s版）' % (tag, q['ev'], '視訊' if abroad else '當面'))
    await SP.jump(pg, cdp, tag, '2027-12-25', 20.5, 'dorm', None)
    if abroad: await pg.evaluate(ABROAD_ON)
    r = await SP.go_out(pg, cdp, tag + '_1225', alt)
    fl2 = await pg.evaluate("(()=>({KX_XMAS:GAME.G.flags.KX_XMAS||null, zone:GAME.G.zone}))()"); R.note('[%s] 之後 %s' % (tag, J(fl2)))
    if abroad: await pg.evaluate(ABROAD_OFF)
    SP.d158(tag, t, r)
    return {'case': tag, 'ask': t, 'reply': lab, 'out': q, 'r': r, 'after': fl2}


async def one(pg, cdp, c):
    if c in ('XMAS_MET_A', 'XMAS_MET_B', 'XMAS_PREV', 'XMAS_ABROAD'): return await c_xmas(pg, cdp, c)
    if c in ('GIRAFFE_A', 'GIRAFFE_B'): return await c_giraffe(pg, cdp, c, 0 if c.endswith('A') else 1)
    R.check('[%s] 認得這個 CASE' % c, False, ''); return {'case': c, 'skip': 'unknown'}


async def main():
    print('CC CANON BB_458：SHA %s；CASES %s；Playwright ≠ iPhone' % (SHA or '?', CASES), flush=True)
    res = {'sha': SHA, 'cases': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(1)
        for c in CASES:
            await P.init(pg)
            try: res['cases'].append(await one(pg, cdp, c))
            except Exception as e:
                R.check('[%s] 沒有中斷' % c, False, repr(e)[:300]); await pg.screenshot(path=os.path.join(OUT, 'crash_%s.png' % c))
            open(os.path.join(OUT, 'canon458.json'), 'w', encoding='utf-8').write(J(res))
            await pg.goto(URL); await L.wait_loaded(pg, 600)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'canon458.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
