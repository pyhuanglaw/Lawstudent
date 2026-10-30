"""真實玩家流程：博思⇄普通二樓空橋（使用者 2026-10-15 試玩回報第 18 項「博思和普通教學館的空橋居然是一扇門」）。不用 ?turbo。
[前置／捷徑] 讀檔到普通教學館二樓走廊（空橋通道口前）。之後全部用觸控點地面、互動按鈕：
A. 從二樓走廊走進往空橋的通道、穿過北牆門洞、走到空橋中間（高度在 4.2～4.8 之間，人在橋面上）、走到博思那一端的門口：出現「進博思教學館」。
B. 按下去：換到博思教學館、落在二樓的空橋通道裡（站得住）。
C. 在博思走到南牆的玻璃門：出現「走上空橋（往普通教學館）」；按下去：落在空橋博思那一端（普通教學館區域、二樓），再自己走過整條空橋回到普通二樓走廊。
   2026-10-20 使用者：「博思走到普通的連通道還是有一個很醜的門」「連通道可以走 只是要經過一個門 跟現實不符」「走到普通之後被擋住無法到一樓或二樓其他地方」：
   C0. 博思二樓走廊往南看：通道裡沒有門板，看得到整條空橋（從走廊往南 4 m 以內沒有不透明的東西擋住）；
   C2. 落在空橋上時鏡頭看得到人物（鏡頭到人物頭部沒有不透明的東西擋住：原本空橋天花板、屋頂、門廳天花板從上面看是一整片灰）；
D. 走回普通二樓以後：走到二樓東邊的走廊、走樓梯下到一樓大廳。
每一段截圖（橫向；空橋中間另外拍一張直向）。劇情自動走路的卡住次數（GAME.walkFallbacks）要是 0。Playwright 手機模擬＋SwiftShader，不是 iPhone 實機。
用法：python3 tests/flow_skybridge.py URL [輸出資料夾]"""
import asyncio, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_skybridge'
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
BX = -3.2

SEE = """((pt,dir,far)=>{ const E=GAME.E; E.scene.updateMatrixWorld(true); const rc=new THREE.Raycaster(); let o, d, len;
  if(pt){ o=new THREE.Vector3(pt[0],pt[1],pt[2]); d=new THREE.Vector3(dir[0],dir[1],dir[2]).normalize(); len=far; }
  else { const P=E.player.obj.position; o=E.camera.position.clone(); const h=new THREE.Vector3(P.x,P.y+1.5,P.z); d=h.clone().sub(o); len=d.length()-0.3; d.normalize(); }
  rc.set(o,d); rc.far=len; const shown=x=>{ while(x){ if(!x.visible) return false; x=x.parent; } return true; };
  const hit=rc.intersectObjects(E.scene.children,true).find(h=>{ const m=h.object.material; if(!h.object.isMesh||!shown(h.object)) return false; let q=h.object; while(q){ if(q===E.player.obj) return false; q=q.parent; }
    if(!m||m.visible===false||(m.transparent&&m.opacity<0.6)) return false; return true; });
  return hit?{d:+hit.distance.toFixed(2),name:hit.object.name||'',mat:(hit.object.material&&hit.object.material.name)||''}:null; })"""


async def main():
    run = L.Run('flow_skybridge', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg)
        run.setup('讀檔到普通教學館二樓走廊（空橋通道口前），9/19 週五 10:00')
        await L.load_state(pg, {'zone': 'putong', 'hour': 10.0, 'day': 3, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': BX, 'z': 0.2, 'yaw': 3.14, 'lv': 1, 'y': 4.2}, 'flags': FLAGS})
        await pg.wait_for_timeout(6000)
        s = await L.state(pg); run.check('A0. 在普通教學館二樓', s['zone'] == 'putong' and s['lv'] == 1, str(s))
        await run.shot(pg, 'A0_corridor')
        ok = await L.go_to(pg, cdp, run, BX, -11.7, 0.8, '空橋中間', lv=1)
        s = await L.state(pg); run.check('A1. 走到空橋中間（穿過通道和北牆門洞）', ok and s['z'] < -9 and s['lv'] == 1, str(s))
        run.check('A1. 人在橋面上：高度在 4.2～4.8 之間（緩坡）', 4.15 <= s['y'] <= 4.85, 'y=%s' % s['y'])
        await run.shot(pg, 'A1_mid_bridge')
        await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(2500); await run.shot(pg, 'A1_mid_bridge_portrait')
        await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(2500)
        ok = await L.go_to(pg, cdp, run, BX, -14.9, 0.5, '空橋博思那一端', lv=1)
        s = await L.state(pg); run.check('A2. 走到空橋另一端：出現「進博思教學館」', ok and '博思' in s['interact'], str(s))
        run.check('A2. 另一端比較高（4.8）', abs(s['y'] - 4.8) < 0.08, 'y=%s' % s['y'])
        await run.shot(pg, 'A2_bridge_end')
        await L.tap(pg, cdp, '#interact')
        for _ in range(90):
            await pg.wait_for_timeout(1000); s = await L.state(pg)
            if s['zone'] == 'boya': break
        await pg.wait_for_timeout(3000); s = await L.state(pg)
        run.check('B. 按「進博思教學館」：換到博思、二樓、站得住', s['zone'] == 'boya' and s['lv'] == 1 and s['stand'], str(s))
        await run.shot(pg, 'B_boya_2f')
        ok = await L.go_to(pg, cdp, run, BX, 5.6, 0.5, '博思二樓走廊、往空橋的通道口', lv=1)
        hit = await pg.evaluate(SEE + '([%s, 6.4, 5.6], [0, 0, 1], 4.0)' % BX)
        run.check('C0. 博思二樓往南看：通道裡沒有門板，4 m 以內沒有不透明的東西擋住（看得到空橋）', hit is None, str(hit))
        await pg.evaluate("GAME.E.cam.yaw=Math.PI"); await pg.wait_for_timeout(2500); await run.shot(pg, 'C0_boya_passage_open')
        ok = await L.go_to(pg, cdp, run, BX, 8.35, 0.4, '博思往空橋的門', lv=1)
        s = await L.state(pg); run.check('C1. 博思南牆的玻璃門：出現「走上空橋（往普通教學館）」', ok and '空橋' in s['interact'], str(s))
        await run.shot(pg, 'C1_boya_bridge_door')
        await L.tap(pg, cdp, '#interact')
        for _ in range(90):
            await pg.wait_for_timeout(1000); s = await L.state(pg)
            if s['zone'] == 'putong': break
        await pg.wait_for_timeout(3000); s = await L.state(pg)
        run.check('C2. 落在空橋博思那一端（普通教學館區域、二樓、站得住、高度約 4.8）', s['zone'] == 'putong' and s['lv'] == 1 and s['z'] < -13 and s['stand'] and abs(s['y'] - 4.78) < 0.1, str(s))
        await run.shot(pg, 'C2_bridge_from_boya')
        hit = await pg.evaluate(SEE + '(null)')
        run.check('C2. 落在空橋上時鏡頭看得到人物（鏡頭到人物頭部沒有不透明的東西擋住）', hit is None, str(hit))
        ok = await L.go_to(pg, cdp, run, BX, 0.2, 0.8, '普通二樓走廊', lv=1)
        s = await L.state(pg); run.check('C3. 自己走過整條空橋回到普通二樓走廊', ok and s['z'] > -1.5 and s['lv'] == 1 and abs(s['y'] - 4.2) < 0.05, str(s))
        await run.shot(pg, 'C3_back_corridor')
        ok = await L.go_to(pg, cdp, run, 8.0, -4.0, 0.8, '普通二樓東邊的走廊', lv=1)
        s = await L.state(pg); run.check('D1. 走到普通二樓東邊的走廊', ok and s['lv'] == 1 and s['x'] > 6.5, str(s))
        await run.shot(pg, 'D1_putong_2f_east')
        ok = await L.go_to(pg, cdp, run, 0.0, 4.0, 0.8, '普通一樓大廳', lv=0)
        s = await L.state(pg); run.check('D2. 走樓梯下到普通一樓大廳', ok and s['lv'] == 0 and abs(s['y']) < 0.05 and s['z'] > 2.5, str(s))
        await run.shot(pg, 'D2_putong_1f')
        run.check('劇情自動走路卡住次數 0', s['fallbacks'] == 0, str(s['fallbacks']))
        run.check('沒有 JS 例外', not errs, str(errs[:3]))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
