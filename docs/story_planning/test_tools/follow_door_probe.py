"""BB-B 10-24（LAWWW-B 21:37 派工第 4 項 BUG-FOLLOW-DOOR-1024）：同行的人（beh＝follow）站得比門近時，門口的按鈕還是門；旁邊沒有門時照樣可以和她說話。
[前置／捷徑] 和 tests/flow_library_scene.py 同一個讀檔：第 2 天（星期四）15:40、和小安約好去總圖（plan=library、companion=an），站在校園總圖門廊前面 (82,0)。
【捷徑】把主角放到「進入總圖書館」門口正前方，把小安一直按在主角旁邊 0.3 m（比門近；每 0.25 秒放回一次，模擬她站在那裡不動），連讀 6 秒互動鈕的字；
之後兩個人一起移到旁邊沒有門的空地，一樣按住小安，讀互動鈕的字。flow_library_scene 的實際走路流程另外由 lwtest_run 跑。
Playwright 手機橫向模擬，不是 iPhone。
用法：LW_TESTS=<工作樹>/tests python3 follow_door_probe.py '<URL>/index.html?turbo' <輸出資料夾> [不用的第三個參數]"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL = sys.argv[1]; OUT = sys.argv[2]
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'plan': 'library', 'companion': 'an'}
PIN = """(([px,pz,ax,az])=>{ const E=GAME.E, P=E.player, n=GAME.npc&&GAME.npc.an; if(px!=null){ if(E.placeAt) E.placeAt(P,px,pz); else P.obj.position.set(px,P.obj.position.y,pz); P.path=null; P.target=null; }
  if(n&&n.obj){ n.obj.position.set(ax,n.obj.position.y,az); n.path=null; n.target=null; }
  const o=P.obj.position, b=document.getElementById('interact'), lb=(document.getElementById('interactLabel')||{}).textContent;
  const it=(E.interactables||[]).filter(i=>i.label).map(i=>({l:i.label,d:+Math.hypot(i.x-o.x,i.z-o.z).toFixed(2)})).sort((a,b)=>a.d-b.d)[0]||null;
  return {label:lb, hidden:b.classList.contains('hide'), beh:n&&n.beh, an:n?+Math.hypot(n.obj.position.x-o.x,n.obj.position.z-o.z).toFixed(2):null, door:it}; })(%s)"""


async def hold(pg, px, pz, ax, az, secs=6.0):
    seq = []; await pg.evaluate(PIN % json.dumps([px, pz, ax, az]))
    for i in range(int(secs / 0.25)):
        await pg.wait_for_timeout(250); seq.append(await pg.evaluate(PIN % json.dumps([None, None, ax, az])))
    return seq


async def main():
    os.makedirs(OUT, exist_ok=True); run = L.Run('follow_door_probe', OUT); res = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀檔：第 2 天（星期四）15:40、和小安約好去總圖（plan=library、companion=an）、校園總圖門廊前面 (82,0)（和 flow_library_scene 同一個）')
        await L.load_state(pg, {'zone': 'campus', 'hour': 15.67, 'day': 2, 'weekday': 4, 'weather': 'sunny', 'pos': {'x': 82, 'z': 0, 'yaw': 1.5708}, 'flags': FLAGS})
        await pg.wait_for_timeout(3000)
        an = await pg.evaluate("(()=>{ const n=GAME.npc&&GAME.npc.an; return n?{beh:n.beh}:null; })()")
        run.check('[前置] 小安跟在旁邊（follow）', bool(an) and an['beh'] == 'follow', json.dumps(an))
        door = await L.find_it(pg, '進入總圖書館'); run.check('[前置] 找得到「進入總圖書館」互動點', bool(door), json.dumps(door, ensure_ascii=False))
        if door:
            px, pz = door['x'] - 0.3, door['z']
            run.setup('【捷徑】主角放到門口正前方 (%.2f, %.2f)、小安按在主角旁邊 0.3 m（比門近），每 0.25 秒放回一次、讀 6 秒互動鈕' % (px, pz))
            seq = await hold(pg, px, pz, px + 0.2, pz + 0.22); res['door'] = seq; await run.shot(pg, 'door')
            near = [s for s in seq if s['an'] is not None and s['an'] < 0.5 and not s['hidden']]
            run.check('門口、小安在 0.5 m 內：按鈕都是「進入總圖書館」（不是和她說話）', bool(near) and all(s['label'].startswith('進入總圖書館') for s in near[2:] or near),
                      json.dumps([(s['label'], s['an']) for s in seq[-6:]], ensure_ascii=False))
            qx, qz = door['x'] - 14, door['z'] + 6
            run.setup('【捷徑】兩個人一起移到旁邊沒有門的空地 (%.2f, %.2f)，小安按在主角旁邊 0.5 m' % (qx, qz))
            seq2 = await hold(pg, qx, qz, qx + 0.35, qz + 0.35); res['open'] = seq2; await run.shot(pg, 'open')
            vis = [s for s in seq2 if not s['hidden']]
            run.check('旁邊沒有門：互動鈕是和小安說話', bool(vis) and ('說話' in vis[-1]['label'] or '小安' in vis[-1]['label'] or '以安' in vis[-1]['label']),
                      json.dumps([(s['label'], s['an'], s['door']) for s in seq2[-3:]], ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        with open(os.path.join(OUT, 'follow_door.json'), 'w') as f: json.dump(res, f, ensure_ascii=False, indent=1)
        await b.close()
    run.finish()
asyncio.run(main())
