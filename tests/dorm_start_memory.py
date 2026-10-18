"""BUG-IOS-RELOAD 第 ③ 點的調查：在宿舍開局時，顯示記憶體裡的貼圖數為什麼和校園一樣多（LAWWW-B 量到 269 張）。
[前置] 讀檔直接到宿舍房間（不經過校園），記下 renderer.info.memory、場景最上層的物件、場景裡屬於校園模型的網格數；
再換到校園、回到宿舍（GAME.enter）各記一次。這是量測（印出數字＋檢查），不是玩家流程。
檢查：宿舍開局時場景裡沒有校園區域的群組；來回兩次，第二次回宿舍的貼圖數不比第一次回宿舍多 10% 以上（第一次去校園後校園的共用貼圖留在快取是故意的）。
用法：python3 tests/dorm_start_memory.py URL [輸出資料夾]"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/dorm_start_memory'
PROBE = """(()=>{ const E=GAME.E, r=E.renderer, m=r.info.memory; const top=E.scene.children.map(o=>o.name||o.type);
  let meshes=0; const per=new Map(); E.scene.traverse(o=>{ if(o.isMesh){ meshes++; let p=o; while(p&&p.parent!==E.scene) p=p.parent; if(p) per.set(p,(per.get(p)||0)+1); } });
  const zg=E.zone&&E.zone.group, npcs=new Set((E.npcs||[]).map(n=>n.obj)); if(E.player) npcs.add(E.player.obj);
  const big=[...per].filter(([o,n])=>o!==zg&&!npcs.has(o)&&n>50).map(([o,n])=>(o.name||o.type)+':'+n); const campus=big.length;
  const cached=Object.keys(ASSETS.cache||{}).length;
  return {zone:GAME.G.zone, tex:m.textures, geo:m.geometries, meshes, otherZoneMeshes:campus, bigOther:big, top:top.slice(0,30), topN:top.length, cachedAssets:cached, zoneGroupInScene:E.scene.children.includes(E.zone.group)}; })()"""


async def main():
    run = L.Run('dorm_start_memory', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        title = await pg.evaluate(PROBE.replace('E.zone.group', '(E.zone&&E.zone.group)')) if await pg.evaluate("!!(GAME.E&&GAME.E.zone)") else None
        run.note(f'標題畫面：{json.dumps(title, ensure_ascii=False)}')
        run.setup('讀檔：宿舍房間 22:00（不經過校園）')
        await L.load_state(pg, {'zone': 'dorm', 'hour': 22.0, 'day': 3, 'weekday': 5, 'weather': 'sunny', 'flags': {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True}}, quiet_events=True)
        await pg.wait_for_timeout(6000)
        d1 = await pg.evaluate(PROBE); run.note(f'宿舍（開局）：{json.dumps(d1, ensure_ascii=False)}'); await run.shot(pg, 'dorm_start')
        run.setup('換到校園（GAME.enter）')
        await pg.evaluate("void GAME.enter('campus')"); await pg.wait_for_timeout(8000)
        c1 = await pg.evaluate(PROBE); run.note(f'校園：{json.dumps(c1, ensure_ascii=False)}')
        await pg.evaluate("void GAME.enter('dorm')"); await pg.wait_for_timeout(6000)
        d2 = await pg.evaluate(PROBE); run.note(f'回到宿舍：{json.dumps(d2, ensure_ascii=False)}')
        run.setup('再來回一次（校園 → 宿舍）')
        await pg.evaluate("void GAME.enter('campus')"); await pg.wait_for_timeout(8000)
        await pg.evaluate("void GAME.enter('dorm')"); await pg.wait_for_timeout(6000)
        d3 = await pg.evaluate(PROBE); run.note(f'第二次回到宿舍：{json.dumps(d3, ensure_ascii=False)}')
        run.check('宿舍開局：除了區域群組、人物以外，場景最上層沒有網格超過 50 個的群組（沒有校園的模型留著）', d1['zoneGroupInScene'] and d1['otherZoneMeshes'] == 0, json.dumps(d1, ensure_ascii=False))
        run.check('宿舍開局的貼圖數比校園少（宿舍不該載校園的貼圖）', d1['tex'] < c1['tex'], f"宿舍 {d1['tex']}、校園 {c1['tex']}")
        # 第一次去過校園以後，校園正式模型共用的貼圖會留在快取（ASSETS、套件，故意的，下次進校園不用重傳）；所以比「第二次回宿舍」和「第一次回宿舍」：來回不能越積越多
        # （2026-10-17 59facb8b 修掉夜間材質清單只進不出以後：開局 130→76、回宿舍 127→101，原本「比開局多 10%」改成這樣比）
        run.check('第二次回到宿舍：貼圖數不比第一次回宿舍多 10% 以上（換區域有釋放、沒有越積越多）', d3['tex'] <= d2['tex'] * 1.1 + 2, f"開局 {d1['tex']} → 回宿舍 {d2['tex']} → 再回宿舍 {d3['tex']}")
        run.check('沒有 JS 錯誤', not errs, '; '.join(errs[:5]))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
