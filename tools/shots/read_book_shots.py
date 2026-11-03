"""坐著讀書手上有書（READ-POSE-BOOK-1103）的畫面驗收截圖：兩點半 Café 的座位、總圖三樓閱覽室的長桌，每個空位都坐一個讀書的路人（pose 'read'），固定鏡頭拍。
用法：python3 tools/shots/read_book_shots.py <網址> <輸出資料夾> <標籤> [--off]
  --off：CHAR.readIK=false（不放書、手照 READ_VRM＝修改前的樣子），拍「修改前」用。
[前置／捷徑] 讀檔到 Café（15:00）、總圖三樓（10:00），關掉條件事件；空的座位直接生成讀書的路人（和 story3d.js 的 Café 客人同一個寫法）；鏡頭用 E.cinematic 固定。
這是畫面驗收的截圖，不是玩家流程測試（手和書的位置由 tests/read_book_unit.js 檢查）。"""
import asyncio, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright
URL, OUT, TAG = sys.argv[1], sys.argv[2], sys.argv[3]
OFF = '--off' in sys.argv
os.makedirs(OUT, exist_ok=True)
FILL = """(()=>{ const E=GAME.E, seats=E.zone.seats||[]; let k=0; const used=s=>E.npcs.some(n=>n.seat&&Math.hypot(n.seat.x-s.x,n.seat.z-s.z)<0.3);
  for(let i=0;i<seats.length;i++){ const s=seats[i]; if(used(s)) continue; const o=CHAR.build(STORY.extraSpec(300+i)); o.position.set(s.x,s.y||0,s.z); o.rotation.y=s.yaw;
    E.addNPC({obj:o,name:'',beh:'idle',pose:'read',idlePose:'read',frozen:true,isExtra:true,seat:{x:s.x,z:s.z,yaw:s.yaw,lv:s.lv|0,y:s.y}}); k++; }
  for(const n of E.npcs) if(n.seat){ n.pose='read'; n.idlePose='read'; }
  return {seats:seats.map(s=>[+s.x.toFixed(2),+s.z.toFixed(2),+(s.yaw||0).toFixed(2),+(s.y||0).toFixed(2)]),added:k}; })()"""
READY = "(()=>{ const E=GAME.E; const r=E.npcs.filter(n=>n.pose==='read'); return {n:r.length, vrm:r.filter(n=>n.obj.userData.driver==='vrm').length, book:r.filter(n=>{ const b=n.obj.userData.readBook; return b&&b.visible&&b.userData.ready; }).length, hidden:r.filter(n=>n.obj.userData.degradedHidden).length}; })()"
VIEWS = {
    'cafe': [('cafe_a', None), ('cafe_b', None)],
    'library': [('lib_a', None), ('lib_b', None)],
}


async def shoot(pg, zone, hour, pos, views):
    await L.load_state(pg, {'zone': zone, 'hour': hour, 'pos': pos}, quiet_events=True)
    for i in range(80):
        await pg.wait_for_timeout(500)
        if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.formal)") and i > 6: break
    if OFF: await pg.evaluate("CHAR.readIK=false")
    info = await pg.evaluate(FILL); print(zone, json.dumps(info), flush=True)
    for i in range(120):
        await pg.wait_for_timeout(1000)
        r = await pg.evaluate(READY)
        if r['vrm'] == r['n'] and r['hidden'] == 0 and (OFF or r['book'] == r['n']) and i > 4: break
    print(zone, 'ready', r, flush=True)
    await pg.evaluate("GAME.E.player.obj.visible=false")   # 玩家不擋鏡頭
    for name, v in views:
        if isinstance(v, dict):   # {"seat":座位序號,"d":距離,"h":鏡頭高度,"a":偏離正面的角度（弧度）,"ly":注視高度}：鏡頭放在那個座位的人前面
            await pg.evaluate("""(v=>{ const E=GAME.E, s=(E.zone.seats||[])[v.seat]; const y=(s.y||0), yaw=(s.yaw||0)+(v.a||0), d=v.d||1.4;
              E.cinematic(new THREE.Vector3(s.x+Math.sin(yaw)*d, y+(v.h||1.25), s.z+Math.cos(yaw)*d), new THREE.Vector3(s.x+Math.sin(s.yaw||0)*0.25, y+(v.ly||0.75), s.z+Math.cos(s.yaw||0)*0.25)); })(%s)""" % json.dumps(v))
        else:
            cpos, look = v
            await pg.evaluate("((p,l)=>{ GAME.E.cinematic(new THREE.Vector3(p[0],p[1],p[2]),new THREE.Vector3(l[0],l[1],l[2])); })(%s,%s)" % (json.dumps(cpos), json.dumps(look)))
        await pg.wait_for_timeout(7000)
        fn = os.path.join(OUT, '%s_%s.png' % (TAG, name)); await pg.screenshot(path=fn, timeout=180000); print('shot', fn, flush=True)


async def main():
    cfg = json.loads(os.environ.get('VIEWS', '{}'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg)
        await pg.evaluate("(()=>{ STORY.tick=()=>{}; })()")
        for zone, hour, pos in (('cafe', 15.0, {'x': 0, 'z': 5.0, 'yaw': 0}), ('library', 10.0, {'x': 0, 'z': 4.0, 'yaw': 0})):
            if cfg and zone not in cfg: continue
            await shoot(pg, zone, hour, pos, [(n, v if isinstance(v, dict) else tuple(v)) for n, v in cfg.get(zone, {}).items()])
        print('errors', errs[:5])
        await b.close()

asyncio.run(main())
