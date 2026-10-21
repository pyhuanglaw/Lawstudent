"""BB（帳號 A）2026-10-21：BUG-EXAM-BOARD-1021（LAWWW 21:04）——大二上期末考 2026-12-21（一）08:30 走進霖澤館 201、還沒坐下，黑板就是「行政法：期末考／不可以翻書／鈴響請停筆」，
不是第一週的「憲法：基本權的限制」。
【前置】讀使用者 9/25 存檔，改到 2026-12-21 08:30 霖澤館一樓（大二的宿舍旗標照日期補）。之後照玩家：走到 201 的門、進去，不坐下。
只加記錄（不改遊戲）：黑板的字是 W3.canvasTex('chalk_'＋三行字) 畫的，包一層記下每一次的 key。另外截圖。Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests python3 examboard_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
def say(*a): print(' '.join(str(x) for x in a), flush=True)


async def main():
    run = L.Run('examboard', OUT); base = json.load(open(SAVE, encoding='utf-8')); G = base.get('G', base)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await pg.evaluate("(()=>{ if(window.__CH) return; window.__CH=[]; const o=W3.canvasTex; W3.canvasTex=function(k){ try{ if(String(k).startsWith('chalk_')) window.__CH.push({k:String(k).slice(6), zone:(GAME.G||{}).zone, t:Date.now()}); }catch(e){} return o.apply(this,arguments); }; })()")
        d = await pg.evaluate("STORY.dayOfKey('2026-12-21')"); F = G['flags']
        for k, key in (('ROOM_Y2', '2026-09-06'),): F[k] = await pg.evaluate("STORY.dayOfKey('%s')" % key)
        G.update({'day': d, 'hour': 8.5, 'zone': 'linze', 'pos': None, 'weekday': 1})
        await L.load_state(pg, G); await pg.wait_for_timeout(5000); run.setup('[前置] 使用者 9/25 存檔改到 2026-12-21（一）08:30 霖澤館一樓；ROOM_Y2 照日期補')
        items = await pg.evaluate("(()=>{ try{ return CLS.dayItems(GAME.G).map(x=>({c:x.c&&x.c.name, exam:x.exam||null, t0:x.t0, zone:x.room&&x.room.zone})); }catch(e){ return 'ERR '+e; } })()")
        want = await pg.evaluate("(()=>{ try{ return CLS.examBoard(GAME.G,'classroom'); }catch(e){ return 'ERR '+e; } })()")
        say('   12/21 的課：%s' % json.dumps(items, ensure_ascii=False)); say('   CLS.examBoard（201）：%s' % json.dumps(want, ensure_ascii=False))
        door = await pg.evaluate("(()=>{ const its=(GAME.E.interactables||[]).filter(i=>!i.hidden&&((i.exit&&i.exit.to==='classroom')||/201/.test(i.label||''))); return its.map(i=>[i.x,i.z,i.label,i.lv|0]); })()")
        say('   201 的門：%s' % door)
        if door:
            await L.go_to(pg, cdp, run, door[0][0], door[0][1], 0.8, door[0][2], max_s=150); await L.tap(pg, cdp, '#interact')
            for k in range(30):
                if await pg.evaluate("GAME.G.zone==='classroom'&&!GAME.E.player.busy"): break
                await pg.wait_for_timeout(700)
        await pg.wait_for_timeout(2500)
        st = await pg.evaluate("(()=>{ const P=GAME.E.player; return {zone:GAME.G.zone, seat:!!P.seat, h:+(+GAME.G.hour).toFixed(2)}; })()")
        ch = await pg.evaluate("window.__CH||[]"); await run.shot(pg, 'board_enter')
        # 鏡頭轉向黑板（只轉鏡頭）再截一張
        await pg.evaluate("(()=>{ const z=GAME.E.zone; const t=z&&z.teacherSpot; if(t){ const P=GAME.E.player.obj.position; GAME.E.cinematic(new THREE.Vector3(P.x,1.6,P.z), new THREE.Vector3(t.x,1.9,t.z-0.6)); GAME.E.snapCinematic(); } })()")
        await pg.wait_for_timeout(2500); await run.shot(pg, 'board_look'); await pg.evaluate("(()=>{ try{ GAME.E.endCinematic(); }catch(e){} })()")
        say('   進 201 以後：%s；黑板畫過：%s' % (json.dumps(st, ensure_ascii=False), json.dumps(ch, ensure_ascii=False)))
        last = [c for c in ch if c['zone'] == 'classroom'][-1:] or ch[-1:]
        k = last[0]['k'] if last else ''
        ok = st['zone'] == 'classroom' and not st['seat'] and k.startswith('行政法：期末考') and '不可以翻書' in k and '鈴響請停筆' in k and '憲法：基本權的限制' not in k
        run.check('12/21 08:30 進 201、還沒坐下：黑板「行政法：期末考／不可以翻書／鈴響請停筆」（不是「憲法：基本權的限制」）', ok, json.dumps({'board': k, 'state': st}, ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        json.dump({'items': items, 'want': want, 'chalk': ch, 'state': st}, open(os.path.join(OUT, 'examboard.json'), 'w'), ensure_ascii=False, indent=1)
        await b.close()
    run.finish()
asyncio.run(main())
