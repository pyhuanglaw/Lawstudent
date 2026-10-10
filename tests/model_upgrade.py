"""人物模型晚到時原地換上正式模型（2026-10-10 線上實玩回報「人物又變得非常醜」的永久回歸測試）。
原因：手機網速慢，VRM 預載逾時 → 主角、NPC 用程序化備用人物建立，而且模型下載完也不會換回來（v9.3）。
這個測試在遊戲裡模擬「建立人物的當下模型還沒到」（CHAR.useModels=false 建立，之後打開），檢查：
  1. 主角：程序化備用人物 → 幾秒內自動換成 VRM（char.yuting），位置不變、站得住、搖桿推得動
  2. NPC（沈以安）：程序化 → VRM（char.heroine_01），位置、朝向不變，GAME.npc 指到新的模型
  3. NPC 借用路人底模（主要角色的模型還沒到）→ 自己的模型到了就換掉
  4. 沒有 JS 例外
在 v9.3（0ef3a73，沒有 upgradeModels）會失敗：1、2 一直是程序化。
用法：python3 tests/model_upgrade.py URL [輸出資料夾]"""
import asyncio, json, sys, time, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/model_upgrade'


async def wait_driver(pg, js, want, s=20):
    t0 = time.time()
    while time.time() - t0 < s:
        d = await pg.evaluate(js)
        if d == want: return d
        await pg.wait_for_timeout(500)
    return await pg.evaluate(js)


async def main():
    run = L.Run('model_upgrade', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀檔：溫州街 11:00（第 3 天）')
        await L.load_state(pg, {'zone': 'wenzhou', 'hour': 11.0, 'day': 3, 'weekday': 1, 'weather': 'sunny', 'pos': {'x': -10, 'z': 0, 'yaw': 0},
                                'flags': {'introDone': True, 'campusIntro': True, 'classDone': True}}, quiet_events=True)
        await pg.wait_for_timeout(3000)
        has_up = await pg.evaluate("typeof GAME.upgradeModels==='function'")
        # 1. 主角：模擬開機時模型還沒到 → 程序化備用人物
        before = await pg.evaluate("""(()=>{ const E=GAME.E, old=E.player.obj; CHAR.useModels=false; const fake=CHAR.build(old.userData.buildSpec||Object.assign({},P3.CAST.hero_m,{model:'char.yuting',height:1.75})); CHAR.useModels=true;
            fake.position.copy(old.position); fake.rotation.copy(old.rotation); E.scene.add(fake); E.scene.remove(old); CHAR.release(old); E.player.obj=fake; GAME.heroDriver=fake.userData.driver;
            return {driver:fake.userData.driver, x:fake.position.x, z:fake.position.z}; })()""")
        run.check('[前置] 主角先變成程序化備用人物', before['driver'] == 'proc', json.dumps(before))
        await run.shot(pg, 'hero_placeholder')
        d = await wait_driver(pg, "GAME.E.player.obj.userData.driver", 'vrm')
        after = await pg.evaluate("(()=>{ const o=GAME.E.player.obj; return {driver:o.userData.driver, key:o.userData.key||null, x:o.position.x, z:o.position.z, inScene:!!o.parent, hero:GAME.heroDriver}; })()")
        await run.shot(pg, 'hero_upgraded')
        run.check('主角：模型到了自動換成 VRM（char.yuting）', has_up and after['driver'] == 'vrm' and after['key'] == 'char.yuting' and after['inScene'] and after['hero'] == 'vrm', json.dumps(after))
        run.check('主角：換模型後位置不變', math.hypot(after['x'] - before['x'], after['z'] - before['z']) < 0.01, json.dumps([before, after]))
        moved, pushes, s1 = await L.push_until(pg, cdp, 0, -40, 0.5)
        run.check('主角：換模型後搖桿推得動（0.5 m 以上）、站得住', moved >= 0.5 and s1['stand'], f'{moved:.2f} m／{pushes} 次 ' + json.dumps(s1, ensure_ascii=False))
        # 2. NPC 沈以安：程序化 → VRM
        n0 = await pg.evaluate("""(()=>{ const P=GAME.E.player.obj.position; if(GAME.npc.heroine_01) GAME.removeNPC('heroine_01'); CHAR.useModels=false; const n=GAME.spawnCharacter('heroine_01',P.x+2,P.z+1,{yaw:1.2}); CHAR.useModels=true;
            return {driver:n.obj.userData.driver, x:n.obj.position.x, z:n.obj.position.z, ry:n.obj.rotation.y}; })()""")
        run.check('[前置] 沈以安先用程序化備用人物', n0['driver'] == 'proc', json.dumps(n0))
        d = await wait_driver(pg, "GAME.npc.heroine_01&&GAME.npc.heroine_01.obj.userData.driver", 'vrm')
        n1 = await pg.evaluate("(()=>{ const n=GAME.npc.heroine_01, o=n.obj; return {driver:o.userData.driver, key:o.userData.key||null, x:o.position.x, z:o.position.z, ry:o.rotation.y, inScene:!!o.parent, inNpcs:GAME.E.npcs.includes(n)}; })()")
        await run.shot(pg, 'npc_upgraded')
        run.check('沈以安：自動換成自己的 VRM（char.heroine_01），位置、朝向不變', n1['driver'] == 'vrm' and n1['key'] == 'char.heroine_01' and n1['inScene'] and n1['inNpcs'] and math.hypot(n1['x'] - n0['x'], n1['z'] - n0['z']) < 0.01 and abs(n1['ry'] - n0['ry']) < 0.01, json.dumps([n0, n1]))
        # 3. 主要角色暫時借用路人底模（自己的模型還沒到）→ 自己的模型到了就換掉
        n2 = await pg.evaluate("""(()=>{ const P=GAME.E.player.obj.position; GAME.removeNPC('heroine_01'); const saved=ASSETS.cache['char.heroine_01']; delete ASSETS.cache['char.heroine_01'];
            const n=GAME.spawnCharacter('heroine_01',P.x+2,P.z-1,{yaw:0}); ASSETS.cache['char.heroine_01']=saved; return {driver:n.obj.userData.driver, key:n.obj.userData.key||null}; })()""")
        run.check('[前置] 沈以安借用路人底模', n2['driver'] == 'vrm' and n2['key'] != 'char.heroine_01', json.dumps(n2))
        d = await wait_driver(pg, "GAME.npc.heroine_01&&GAME.npc.heroine_01.obj.userData.key", 'char.heroine_01')
        run.check('沈以安：自己的模型到了就換掉路人底模', d == 'char.heroine_01', str(d))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
