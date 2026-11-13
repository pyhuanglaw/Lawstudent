"""CC-C 11-14：HEROINE_LIFE（HEROINE-LIFE-1028，BB-C 03:31 派，BB_463；低優先，這次發布以後用當時開發分支最新版）。只記、截圖；判定歸 BB。Playwright ≠ iPhone。
A 圈子五場（大一上第 6 週；資料 src/data/heroine_circle.js）：每場【前置／捷徑】最小存檔（cc_seedplay.fresh，她 FAMILIAR）讀到那一天、那個時間、那一區 →
   等 3 秒 → 找她（bbplay.who）→ 走到離她約 10 m 拍遠景 → 走到她旁邊 1.5 m 站 8 秒、記聽到的（GAME.say、字幕）→ 對 heard 那一格（c503_4_2、c503_5_1、c503_6_1、c503_7_1、c503_8_1）
     A1 以安＋Alison  週一 18:20 校園（2025-10-06）   A2 芷若＋小婷  週五 19:30 Café（2025-10-10）   A3 語彤＋筱涵  週二 12:30 校園（2025-10-07）
     A4 子晴＋社團     週一 19:30 系館B（2025-10-06）   A5 學姊＋陳助教 週五 19:00 公館（2025-10-10）
   她不在那一區（照作息不在）＝FAIL_SETUP（記 STORY.presence）；c503_5_1 不是 always（70% 配對），沒同框照實記。
B 動態三則（src/data/feed_y1s1.js、src/feed3d.js FEED.visible）：每則兩種存檔——關係到了（_HAS）、關係不到（_NO）：時間前 6 分鐘讀檔 → 過那個時間 → 手機「動態」截圖、記 FEED.visible 的 id
     an6 2025-12-27 15:30 以安 朋友（不到＝有點熟）  kx6 2025-12-03 23:30 可昕 認識（不到＝還不認識）  ps4 2025-12-27 02:40 沛珊 認識（不到＝還不認識）
C 私訊：BB 說從 FULL 的 transcript 抽，不在這支。
CC_02 清單 2026-11-14：1✓（日期照大一上第 6 週對週幾；時間照 BB_463；她的關係照表） 2✓（人用 charId、句子照 heroine_circle.js 的 heard、動態照 FEED.visible 的 id） 3n/a（BB 指定五場三則） 4✓（打開手機動態頁前確認按鈕在） 5✓（L.go_to 照玩家走） 6✓（站 8 秒聽、過時間等遊戲時間真的過） 7✓（lint） 8✓（只記） 9✓（遠景、近景、手機各截圖） 10✓（別的對話照字點完並記） 11✓（ENV 沒有「|」「;」） 12✓（FAIL_SETUP 檢查：她真的在那一區、動態那一刻時間真的過了） 13✓（走不到記最後位置）
用法：LW_TESTS=<wt>/tests SHA=<sha> [CASES=A1,…,B_an6_HAS,…] python3 cc_heroine_life463_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import bbplay as P
import cc_seedplay as SP
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('heroine_life463', OUT); SP.setup(R, OUT)
CIRCLES = {'A1': ('c503_4_2', 'heroine_01', '2025-10-06', 18 + 20 / 60, 'campus'), 'A2': ('c503_5_1', 'heroine_02', '2025-10-10', 19.5, 'cafe'),
           'A3': ('c503_6_1', 'heroine_03', '2025-10-07', 12.5, 'campus'), 'A4': ('c503_7_1', 'heroine_04', '2025-10-06', 19.5, 'wancai'),
           'A5': ('c503_8_1', 'heroine_05', '2025-10-10', 19.0, 'gongguan')}
FEEDS = {'an6': ('heroine_01', '2025-12-27', 15.5, 'FRIEND', 'FAMILIAR'), 'kx6': ('kexin', '2025-12-03', 23.5, 'ACQUAINTANCE', None), 'ps4': ('classmate_peishan', '2025-12-27', 2 + 40 / 60, 'ACQUAINTANCE', None)}
CASES = [c for c in (os.environ.get('CASES') or 'A1,A2,A3,A4,A5,B_an6_HAS,B_an6_NO,B_kx6_HAS,B_kx6_NO,B_ps4_HAS,B_ps4_NO').split(',') if c]
ROW_JS = "(id=>{ const r=(HCIRCLE_DATA.ROWS||[]).find(x=>x.id===id); return r?{who:r.who,with:r.with,always:!!r.always,days:r.days,from:r.from,to:r.to,zone:r.zone,heard:r.heard}:null; })"


async def circle(pg, cdp, case):
    rid, who, day, h, zone = CIRCLES[case]; tag = '[%s %s]' % (case, rid)
    d, seed = await SP.fresh(pg, cdp, tag, day, h - 0.05, zone, {who: 'FAMILIAR'})
    row = await pg.evaluate(ROW_JS, rid); R.note('%s 表上那一列：%s' % (tag, J(row)))
    await SP.wait_h(pg, cdp, h, tag); await pg.wait_for_timeout(3000)
    pr = await pg.evaluate("(w=>STORY.presence(w,GAME.G))", who); w = await P.who(pg, who)
    if not R.check('FAIL_SETUP 檢查：%s 她在 %s（這一區找得到她）' % (tag, zone), bool(w), J({'presence': pr, 'npc': w})): return {'case': case, 'skip': 'absent', 'presence': pr}
    me = await pg.evaluate("(()=>{ const p=GAME.E.player.obj.position; return [p.x,p.z]; })()")
    dx, dz = me[0] - w['x'], me[1] - w['z']; m = math.hypot(dx, dz) or 1
    fx, fz = w['x'] + dx / m * 10, w['z'] + dz / m * 10
    await L.go_to(pg, cdp, R, fx, fz, 2.0, '%s 離她約 10 m' % tag, max_s=90); await pg.wait_for_timeout(1200)
    await pg.screenshot(path=os.path.join(OUT, 'hl_%s_far.png' % case))
    n0 = await P.say_hook(pg); c0 = len(await P.captions(pg))
    w = await P.who(pg, who) or w
    await L.go_to(pg, cdp, R, w['x'], w['z'], 1.5, '%s 走到她旁邊' % tag, max_s=90)
    t0 = time.time(); shots = 0
    while time.time() - t0 < 8:
        s = await P.ts(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if shots < 2: shots += 1; await pg.screenshot(path=os.path.join(OUT, 'hl_%s_near_%d.png' % (case, shots)))
        await pg.wait_for_timeout(1500)
    said = await P.said(pg, n0); caps = (await P.captions(pg))[c0:]
    heard = (row or {}).get('heard') or ''
    parts = [x.split('：', 1)[-1] for x in heard.split('／') if x]
    got = ' '.join([str(x[1]) for x in said] + [json.dumps(c, ensure_ascii=False) for c in caps])
    hit = [p_ for p_ in parts if p_ and p_[:8] in got]
    R.note('%s 走近聽到：GAME.say %s；字幕 %s' % (tag, J(said[:8]), J(caps[:8])))
    R.check('%s 走近聽到 heard 那一格（對到 %d／%d 句）%s' % (tag, len(hit), len(parts), '' if (row or {}).get('always') else '（這一列不是 always，70% 配對，沒同框照實記）'), bool(hit), J({'heard': heard, 'said': said[:6]}))
    return {'case': case, 'row': row, 'presence': pr, 'said': said, 'caps': caps, 'hit': hit}


async def feed(pg, cdp, case):
    _, pid, which = case.split('_'); who, day, h, has, no = FEEDS[pid]; tag = '[%s]' % case
    rel = {who: has} if which == 'HAS' else ({who: no} if no else {})
    d, seed = await SP.fresh(pg, cdp, tag, day, h - 0.1, 'dorm', rel)
    R.note('%s 墊 %s（%s）' % (tag, J(rel) if rel else '不認識', '關係到了' if which == 'HAS' else '關係不到'))
    ok = await SP.wait_h(pg, cdp, h + 0.05, tag); await pg.wait_for_timeout(2500)
    vis = await pg.evaluate("(()=>{ try{ return FEED.visible(GAME.G).map(i=>i.id||i.pid||i.post||JSON.stringify(i).slice(0,40)); }catch(e){ return 'ERR '+e.message; } })()")
    await P.phone_tab(pg, cdp, 'feed'); await pg.wait_for_timeout(800); await pg.screenshot(path=os.path.join(OUT, 'hl_%s_feed.png' % case))
    txt = await pg.evaluate("(()=>((document.getElementById('phoneBody')||{}).innerText||'').replace(/\\s+/g,' ').slice(0,600))()")
    await L.close_panels(pg, cdp)
    has_it = isinstance(vis, list) and any(pid in str(v) for v in vis)
    R.note('%s FEED.visible %s；動態頁 %s' % (tag, J(vis), txt[:300]))
    R.check('%s 動態 %s %s' % (tag, pid, '要有' if which == 'HAS' else '不能有'), has_it == (which == 'HAS'), J(vis))
    return {'case': case, 'visible': vis, 'text': txt, 'has': has_it}


async def main():
    print('CC HEROINE_LIFE：SHA %s；CASES %s；Playwright ≠ iPhone' % (SHA or '?', CASES), flush=True)
    out = {'sha': SHA, 'cases': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(1)
        for c in CASES:
            try: out['cases'].append(await (circle(pg, cdp, c) if c in CIRCLES else feed(pg, cdp, c)))
            except Exception as e:
                R.check('[%s] 沒有中斷' % c, False, repr(e)[:300]); await pg.screenshot(path=os.path.join(OUT, 'crash_%s.png' % c))
            open(os.path.join(OUT, 'heroine_life463.json'), 'w', encoding='utf-8').write(J(out))
            await pg.goto(URL); await L.wait_loaded(pg, 600)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
