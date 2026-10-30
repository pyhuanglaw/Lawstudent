"""博思教學館的階梯教室桌椅（BOYA-LM-1030；LAWWW2-B 2026-10-30）：遊戲裡檢查 patch（patches/boya_lecture_furn_1030.patch）有沒有做到——
①正式模型載入後：光照貼圖接上、SEATPANS 在、備用的方塊桌椅（lecture_furniture）全部藏起來
②翻椅（Z3.seatFold）：132 個座位每個都分到椅面的頂點；沒有人坐＝掀起來；玩家坐下的那一張放下、其他照舊掀著；起身 0.5 秒後再掀回去
[捷徑] 讀檔直接進區域（GAME.applySave）、條件事件關閉；坐下用座位資料直接設定（不是走過去按互動）。手機橫向模擬（SwiftShader），不是 iPhone。
用法：python3 tools/blender/env_second/shots/boya_fold_check.py 工作樹 URL"""
import asyncio, json, sys
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL = sys.argv[2]
async def main():
    ok = True
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey('2025-10-15')")
        await L.load_state(pg, {'zone': 'boya', 'hour': 14.0, 'day': day, 'weather': 'sunny', 'flags': {'introDone': True}, 'pos': {'x': -11.0, 'z': 6.0, 'yaw': 0, 'lv': 0}}, quiet_events=True, quiet_phone=True)
        for i in range(60):
            if await pg.evaluate("GAME.G.zone==='boya'&&!!GAME.E.zone&&GAME.E.zone.formal"): break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(3000)
        st = await pg.evaluate("""(()=>{ const Z=GAME.E.zone, F=Z.seatFold, lec=Z.seats.filter(s=>s.kind==='lecture');
          return {formal:!!Z.formal, lm:!!(Z.formalInfo&&Z.formalInfo.lightmapped), pans:!!Z.group.getObjectByName('SEATPANS'),
            fallback:(Z.lectFurn||[]).map(g=>g.visible), fold:!!F, lecture:lec.length,
            grouped:F?lec.filter(s=>F.groups[Z.seats.indexOf(s)]>0).length:0, busy:F?lec.filter(s=>F.occupied(GAME.E,Z.seats.indexOf(s))).length:0,
            wrong:F?lec.filter(s=>{ const i=Z.seats.indexOf(s); return F.occupied(GAME.E,i)?F.ang[i]!==0:F.ang[i]<=1.5; }).length:-1}; })()""")
        print('①', json.dumps(st, ensure_ascii=False))
        c1 = st['formal'] and st['lm'] and st['pans'] and len(st['fallback']) == 2 and not any(st['fallback']) and st['fold'] and st['lecture'] == 132 and st['grouped'] == 132 and st['wrong'] == 0
        print('  ', 'PASS' if c1 else 'FAIL', '正式模型＋光照貼圖、備用方塊桌椅藏起來、132 張翻椅都分到頂點、沒有人坐的掀起來（有人坐的放下）'); ok &= c1
        if not st['fold']:   # 沒有翻椅（開發分支原樣、舊 GLB）：②③沒辦法測
            print('②③ FAIL 沒有翻椅（Z3.seatFold 沒接上）'); await b.close(); print('FAIL'); sys.exit(1)
        # 玩家坐下（[捷徑] 直接設定座位）→ 那一張放下、其他照舊；起身後掀回去
        k = await pg.evaluate("(()=>{ const Z=GAME.E.zone, s=Z.seats.find((q,i)=>q.kind==='lecture'&&q.room==='101'&&q.row>=2&&!Z.seatFold.occupied(GAME.E,i)); GAME.E.player.seat=s; return Z.seats.indexOf(s); })()")
        await pg.wait_for_timeout(1500)
        r = await pg.evaluate("(k=>{ const Z=GAME.E.zone, F=Z.seatFold, lec=Z.seats.map((s,i)=>i).filter(i=>Z.seats[i].kind==='lecture'); return {mine:F.ang[k], wrong:lec.filter(i=>i!==k&&(F.occupied(GAME.E,i)?F.ang[i]!==0:F.ang[i]<=1.5)).length}; })(%d)" % k)
        c2 = r['mine'] == 0 and r['wrong'] == 0
        print('②', json.dumps(r), 'PASS' if c2 else 'FAIL', '坐下的那一張放下、其他的照舊（沒人坐的掀著）'); ok &= c2
        await pg.evaluate("GAME.E.player.seat=null"); await pg.wait_for_timeout(2500)
        r2 = await pg.evaluate("(k=>{ const F=GAME.E.zone.seatFold; return F.occupied(GAME.E,k)?'still occupied':F.ang[k]; })(%d)" % k)
        c3 = isinstance(r2, (int, float)) and r2 > 1.5
        print('③', r2, 'PASS' if c3 else 'FAIL', '起身以後掀回去'); ok &= c3
        print('errs', errs[:5]); ok &= not errs
        await b.close()
    print('ALL PASS' if ok else 'FAIL'); sys.exit(0 if ok else 1)
asyncio.run(main())
