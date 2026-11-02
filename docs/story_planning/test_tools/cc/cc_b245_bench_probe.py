"""CC（帳號 A）11-02 BB_245 第二批 #5：BUG-BENCH-OCC-1018 椰影大道長椅會坐到有人的位子（瀏覽器探針）。
LAWWW 驗法（docs/handoff/BB245_LAWWW_REPLY_1102.md 第一節）：探針：校園長椅讀書的路人帶 seat、玩家不會被分到那個位子（修正在 story3d.js seat:st）。
修正：4b3e8b31c（story3d.js 校園白天坐在 E.zone.seats[1,4,7,10] 讀書的路人 E.addNPC 加 seat:st；game3d.js freeSeat 看 n.seat）；對照＝4b3e8b31c^（預期 FAIL）。
不是 iPhone：Playwright 手機橫向模擬（844×390，SwiftShader）。不用 ?turbo。點 #interact 用 CDP 觸控。
情境：【前置／捷徑】load_state（quiet_events）校園第 DAY 天 10:00（白天＝story3d.js 會放長椅讀書的路人）。
  讀遊戲狀態：E.npcs 裡 isExtra、frozen、idlePose 'read' 的路人＝長椅讀書的人；每個人的 n.seat、位置。
  a 每個讀書的路人都有 seat，seat 的位置就是他坐的位置（差 < 0.05 m）
  b 每個讀書的路人旁邊那張長椅的互動點（E.interactables 有 seat、座位離他 < 0.4 m）：GAME.freeSeat(那個座位) 回 null（坐滿）或離所有讀書路人 ≥ 0.4 m 的位子
  c 照玩家：【前置／捷徑】再讀一次檔，人站在第一張有人讀書的長椅前面（GAME.seatApproach 的位置）→ 等 #interact 出現 → 手指點 →
    坐下了：玩家的位置離所有讀書的路人 ≥ 0.4 m（不壓在人身上）；長椅坐滿：toast 開頭「長椅坐滿了」也算 PASS → 截圖 → 選「起身」
  E.nearestInteractable 修正後也會跳過有人的座位（只記，INFO）。
用法：LW_TESTS=<工作樹>/tests [SHA=<sha>] [DAY=7 WEEKDAY=2] python3 cc_b245_bench_probe.py '<URL>/index.html' <輸出資料夾>
exit 0＝ALL PASS；1＝有 FAIL。"""
import os, sys, asyncio, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cc_b245_common as C
from cc_b245_common import L, J, check, info
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?'); DAY = int(os.environ.get('DAY', '7')); WD = int(os.environ.get('WEEKDAY', '2'))

READERS_JS = """(()=>{ const E=GAME.E; const R=E.npcs.filter(n=>n.isExtra&&n.frozen&&(n.idlePose==='read'||n.pose==='read'));
  return R.map(n=>{ const o=n.obj.position; const s=n.seat; let bench=null, bd=1e9;
    for(const it of E.interactables){ if(!it.seat||it.hidden) continue; const d=Math.hypot(it.seat.x-o.x,it.seat.z-o.z); if(d<bd){ bd=d; bench=it; } }
    let fs=null; if(bench&&bd<0.4&&GAME.freeSeat){ const q=GAME.freeSeat(bench.seat); fs=q?{x:+q.x.toFixed(3),z:+q.z.toFixed(3)}:null; }
    return {x:+o.x.toFixed(3), z:+o.z.toFixed(3), seat:s?{x:s.x,z:s.z,yaw:s.yaw||0}:null, bench:bench&&bd<0.4?{label:bench.label,x:bench.seat.x,z:bench.seat.z,yaw:bench.seat.yaw||0,d:+bd.toFixed(3)}:null,
      free:fs, hasFreeFn:!!GAME.freeSeat}; }); })()"""


def far_from_all(p, readers, lim=0.4):
    return all(math.hypot(p['x'] - r['x'], p['z'] - r['z']) >= lim for r in readers)


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('cc_b245_bench_probe  SHA=%s  URL=%s' % (SHA, URL), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.set_default_timeout(180000)
        await pg.goto(URL)
        check('遊戲載入', await L.wait_loaded(pg))
        await C.load(pg, C.st('campus', 10.0, -60.0, 0.0, 1.57, day=DAY, weekday=WD), '校園第 %d 天 10:00' % DAY)
        R = await pg.evaluate(READERS_JS)
        info('長椅讀書的路人：' + J(R))
        check('前置：校園白天有長椅讀書的路人（story3d.js seats[1,4,7,10]）', len(R) >= 1, str(len(R)))
        check('a 每個讀書的路人都有 seat，而且 seat 就是他坐的位置（< 0.05 m）', bool(R) and all(r['seat'] and math.hypot(r['seat']['x'] - r['x'], r['seat']['z'] - r['z']) < 0.05 for r in R),
              J([(r['x'], r['z'], r['seat']) for r in R]))
        withb = [r for r in R if r['bench']]
        check('前置：讀書的路人坐的位置有長椅互動點（< 0.4 m）', bool(withb), '%d/%d' % (len(withb), len(R)))
        bad = [r for r in withb if r['free'] is not None and not far_from_all(r['free'], R)]
        check('b GAME.freeSeat(有人讀書的那個長椅座位)＝null 或離所有讀書路人 ≥ 0.4 m 的位子', bool(withb) and not bad and all(r['hasFreeFn'] for r in withb),
              J([(r['bench'], r['free']) for r in withb]))
        if withb:
            r0 = withb[0]; bs = r0['bench']
            ap = await pg.evaluate("(s=>{ const a=GAME.seatApproach?GAME.seatApproach(s):null; return a?[+a[0].toFixed(3),+a[1].toFixed(3)]:null; })(%s)" % J({'x': bs['x'], 'z': bs['z'], 'yaw': bs['yaw'], 'label': bs['label']}))
            if not ap: ap = [bs['x'] + 0.9 * math.sin(bs['yaw']), bs['z'] + 0.9 * math.cos(bs['yaw'])]
            await C.load(pg, C.st('campus', 10.0, ap[0], ap[1], bs['yaw'] + math.pi, day=DAY, weekday=WD), '校園第 %d 天 10:00，站在有人讀書的長椅前面 (%.2f, %.2f)' % (DAY, ap[0], ap[1]))
            R2 = await pg.evaluate(READERS_JS)
            ni = await pg.evaluate("(()=>{ const it=GAME.E.nearestInteractable&&GAME.E.nearestInteractable(); return it?{label:it.label, seat:it.seat?{x:+it.seat.x.toFixed(3),z:+it.seat.z.toFixed(3)}:null}:null; })()")
            info('c 讀檔後讀書的路人：%s；E.nearestInteractable：%s' % (J([(q['x'], q['z']) for q in R2]), J(ni)))
            await pg.evaluate("(()=>{ window.__ccToast=[]; const el=document.getElementById('toast'); if(el) new MutationObserver(()=>{ const t=(el.textContent||'').trim(); if(t) window.__ccToast.push(t); }).observe(el,{childList:true,subtree:true,characterData:true}); })()")
            lab = await C.tap_interact(pg, cdp)
            info('c 點了 #interact：「%s」' % lab)
            if not lab:
                # 修正後 E.nearestInteractable 跳過有人的座位（n.seat）：站在有人的那個座位前面，#interact 不出現＝遊戲不讓玩家選那個位子
                check('c 照玩家：站在有人讀書的座位前面，#interact 不出現（E.nearestInteractable 跳過有人的座位），玩家沒有坐到人身上', ni is None or (ni.get('seat') and far_from_all(ni['seat'], R2)), J(ni))
                await pg.screenshot(path=os.path.join(OUT, 'bench_c_no_interact.png'))
            ch = []; sat = None
            for _ in range(100 if lab else 0):
                ch = await C.choices(pg)
                sat = await pg.evaluate("(()=>{ const P=GAME.E.player, o=P.obj.position; return {x:+o.x.toFixed(3), z:+o.z.toFixed(3), pose:P.pose, seat:P.seat?{x:+P.seat.x.toFixed(3),z:+P.seat.z.toFixed(3)}:null}; })()")
                toasts = await pg.evaluate("window.__ccToast||[]")
                if ch or any(t.startswith('長椅坐滿了') or t.startswith('有人坐了') for t in toasts): break
                await pg.wait_for_timeout(500)
            toasts = await pg.evaluate("window.__ccToast||[]")
            if not lab:
                check('沒有 JS 例外', not errs, J(errs[:3])); await b.close(); return C.finish()
            await pg.screenshot(path=os.path.join(OUT, 'bench_c_after_tap.png'))
            full = any(t.startswith('長椅坐滿了') or t.startswith('有人坐了') for t in toasts)
            info('c 結果：玩家 %s；選項 %s；toast %s' % (J(sat), J(ch), J(toasts)))
            check('c 前置：照玩家點長椅以後有結果（坐下的選單，或「長椅坐滿了」）', bool(ch) or full, J({'choices': ch, 'toast': toasts}))
            if ch:
                d = min(math.hypot(sat['x'] - q['x'], sat['z'] - q['z']) for q in R2) if R2 else 99
                check('c 照玩家坐長椅：玩家坐下的位置離所有讀書的路人 ≥ 0.4 m（不壓在人身上）', far_from_all(sat, R2), '最近 %.3f m；玩家 %s' % (d, J(sat)))
                if not await C.tap_choice(pg, cdp, '起身'): info('沒有「起身」：%s' % J(ch))
                await pg.wait_for_timeout(1500)
            else:
                check('c 照玩家坐長椅：長椅坐滿，沒有坐到人身上（toast 開頭「長椅坐滿了」）', full, J(toasts))
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    return C.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
