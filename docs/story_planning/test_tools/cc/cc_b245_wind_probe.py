"""CC（帳號 A）11-02 BB_245 第二批 #7：BUG-WIND-1018「坐一下」的旁白「風從椰影大道那頭吹過來。」不管坐哪裡都會出現（瀏覽器探針）。
LAWWW 驗法（docs/handoff/BB245_LAWWW_REPLY_1102.md 第一節）：探針：室內和其他區域「坐一下」多次都不出椰影大道那一句。
修正：4b3e8b31c（game3d.js seatMenu「坐一下」：這一句只在 G.zone==='campus' 且不是室內；其他地方只從另外兩句抽）；對照＝4b3e8b31c^（預期 FAIL）。
  （修正當時字是「椰林大道」，D115 換名以後是「椰影大道」：比對用 startswith「風從」，兩個版本都抓得到。）
不是 iPhone：Playwright 手機橫向模擬（844×390，SwiftShader）。不用 ?turbo。點 #interact、選項用 CDP 觸控；選項文字 startswith。
記錄：#caption 的 MutationObserver（common.CAP_HOOK）＝玩家實際看到的旁白（遊戲內部 caption() 沒有經過 GAME.caption，所以掛在畫面元素上）。
旁白三選一靠 Math.random：每個地方第 1 次【捷徑】在按「坐一下」到旁白出現之間把 Math.random 固定成 0（修正前＝一定抽到椰影大道那一句；
  修正後室內／其他區域只剩兩句、抽到「遠處有人在笑。」），之後 RUNS 次照遊戲自己的亂數。
地方（PLACES，預設 campus,wenzhou,cafe,library_hall）：每個地方【前置／捷徑】讀檔到區域裡 → 找最近的一般座位（有 seat、沒有 park 特殊互動、GAME.freeSeat 是它自己）
  → 再讀檔站到座位前面（GAME.seatApproach）→ 等 #interact → 點 → 選「坐一下」→ 收旁白 → 選「起身」（如果還在座位選單）。
  campus＝對照（校園戶外：固定亂數那一次應該出現那一句，證明掛勾抓得到）；wenzhou＝其他戶外區域；cafe、library_hall＝室內。
判定：campus 那一次固定亂數＝startswith「風從」（只當掛勾的對照）；其他地方每一次的旁白都不是 startswith「風從」，而且每一次都有收到旁白。
用法：LW_TESTS=<工作樹>/tests [SHA=<sha>] [PLACES=...] [RUNS=2] [DAY=7 WEEKDAY=2] python3 cc_b245_wind_probe.py '<URL>/index.html' <輸出資料夾>
exit 0＝ALL PASS；1＝有 FAIL。"""
import os, sys, asyncio, math, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cc_b245_common as C
from cc_b245_common import L, J, check, info
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?'); DAY = int(os.environ.get('DAY', '7')); WD = int(os.environ.get('WEEKDAY', '2'))
RUNS = int(os.environ.get('RUNS', '2'))
PLACES = [x.strip() for x in os.environ.get('PLACES', 'campus,wenzhou,cafe,library_hall').split(',') if x.strip()]
START = {'campus': ('campus', 16.0, -60.0, 0.0, 0), 'wenzhou': ('wenzhou', 16.0, 26.0, 2.0, 0), 'cafe': ('cafe', 16.0, 0.0, 4.6, 0),
         'library_hall': ('library_hall', 16.0, -2.0, 3.6, 0)}
WIND = '風從'

PICK_JS = """(()=>{ const E=GAME.E, P=E.player, o=P.obj.position, lv=P.lv|0; const c=E.interactables.filter(it=>it.seat&&!it.hidden&&!it.park&&it.shop!=='teahouse'&&((it.seat.lv|0)===lv)&&(!GAME.freeSeat||GAME.freeSeat(it.seat)===it.seat))
  .sort((a,b)=>Math.hypot(a.seat.x-o.x,a.seat.z-o.z)-Math.hypot(b.seat.x-o.x,b.seat.z-o.z));
  const it=c[0]; if(!it) return null; const ap=GAME.seatApproach?GAME.seatApproach(it.seat):[it.seat.x,it.seat.z];
  return {label:it.label, seat:{x:it.seat.x,z:it.seat.z,yaw:it.seat.yaw||0,lv:it.seat.lv|0}, ap:[+ap[0].toFixed(3),+ap[1].toFixed(3)], n:c.length, indoor:!!E.indoor, zone:GAME.G.zone}; })()"""
FORCE_ON = "(()=>{ if(!window.__ccRnd0) window.__ccRnd0=Math.random; Math.random=()=>0; return true; })()"
FORCE_OFF = "(()=>{ if(window.__ccRnd0){ Math.random=window.__ccRnd0; } return true; })()"


async def sit_once(pg, cdp, place, k, force):
    lab = await C.tap_interact(pg, cdp)
    ch = await C.wait_choices(pg, 60)
    if not any(c.startswith('坐一下') for c in ch):
        info('%s #%d：點了「%s」，選項沒有「坐一下」：%s' % (place, k, lab, J(ch))); return None
    n0 = await pg.evaluate("(window.__ccCap||[]).length")
    if force: await pg.evaluate(FORCE_ON)
    try:
        await C.tap_choice(pg, cdp, '坐一下')
        cap = None
        for _ in range(40):
            await pg.wait_for_timeout(300)
            arr = await pg.evaluate("(window.__ccCap||[])")
            if len(arr) > n0: cap = arr[-1]; break
    finally:
        if force: await pg.evaluate(FORCE_OFF)
    st = await pg.evaluate("(()=>({zone:GAME.G.zone, indoor:!!GAME.E.indoor, pose:GAME.E.player.pose}))()")
    await pg.screenshot(path=os.path.join(OUT, 'wind_%s_%d.png' % (place, k)))
    ch = await C.wait_choices(pg, 6)
    if any(c.startswith('起身') for c in ch): await C.tap_choice(pg, cdp, '起身')
    await pg.wait_for_timeout(1500)
    info('%s #%d（%s）：旁白 %s；狀態 %s' % (place, k, '亂數固定 0' if force else '遊戲亂數', J(cap), J(st)))
    return {'cap': cap, 'st': st, 'force': force}


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('cc_b245_wind_probe  SHA=%s  URL=%s  PLACES=%s  RUNS=%d' % (SHA, URL, ','.join(PLACES), RUNS), flush=True)
    rec = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.set_default_timeout(180000)
        await pg.goto(URL)
        check('遊戲載入', await L.wait_loaded(pg))
        for place in PLACES:
            z, h, x, zz, lv = START[place]
            try:
                await C.load(pg, C.st(z, h, x, zz, 0, day=DAY, weekday=WD, lv=lv), '%s 第 %d 天 %s' % (z, DAY, h))
                pk = await pg.evaluate(PICK_JS)
                info('%s 找到的座位：%s' % (place, J(pk)))
                if not check('%s 前置：區域裡有一般座位（有 seat、沒人坐）' % place, bool(pk)): continue
                yaw = math.atan2(pk['seat']['x'] - pk['ap'][0], pk['seat']['z'] - pk['ap'][1])
                await C.load(pg, C.st(z, h, pk['ap'][0], pk['ap'][1], yaw, day=DAY, weekday=WD, lv=pk['seat']['lv']), '%s 站到座位「%s」前面 (%.2f, %.2f)' % (z, pk['label'], pk['ap'][0], pk['ap'][1]))
                await pg.evaluate(C.CAP_HOOK)
                rs = []
                for k in range(1 + RUNS):
                    r = await sit_once(pg, cdp, place, k, k == 0)
                    rs.append(r)
                rec[place] = {'seat': pk, 'runs': rs}
                got = [r for r in rs if r and r['cap']]
                check('%s：每一次「坐一下」都收到旁白（%d 次）' % (place, 1 + RUNS), len(got) == 1 + RUNS, J([r and r['cap'] for r in rs]))
                if place == 'campus':
                    f = rs[0]
                    check('campus（對照）：校園戶外、亂數固定 0 那一次是「風從…」那一句（掛勾抓得到）', bool(f and f['cap'] and f['cap']['t'].startswith(WIND)), J(f and f['cap']))
                else:
                    bad = [r['cap'] for r in got if r['cap']['t'].startswith(WIND)]
                    check('%s（%s）：「坐一下」%d 次都沒有出現「風從椰影大道那頭吹過來。」（含亂數固定 0 那一次）' % (place, '室內' if pk['indoor'] else '戶外', len(got)), not bad and bool(got), J(bad or [r['cap']['t'] for r in got]))
            except Exception as e:
                check('%s 執行' % place, False, '例外：%r' % e)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'wind.json'), 'w'), ensure_ascii=False, indent=1)
    return C.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
