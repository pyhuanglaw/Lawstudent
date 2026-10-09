"""校園配置（依台大平面圖重排後）導航檢查：實際載入遊戲的校園區域，查詢導航格與 A* 路徑。
檢查：主要地點都站得住、彼此走得到（從霖澤館前出發）；醉月湖水面不能走、木棧道與湖心亭可以走；
新的長椅座位前面站得住；舊存檔若站在新建築裡，讀檔後會被移到可走、而且走得到霖澤館前的地方。
用法：python3 tests/campus_layout_nav.py [URL]   （預設 http://127.0.0.1:8765/index.html）"""
import asyncio, json, sys
from playwright.async_api import async_playwright

URL = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html') + '?turbo'
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True}
START = (34, -98)    # 霖澤館前（校園預設出生點）
# 名稱, x, z：每一個都要站得住，而且從霖澤館前有路走得到
PLACES = [('校門內', -112, 0), ('校門口（走出校門的互動點）', -126, 0), ('校門開口正中間', -124, 0), ('椰林大道中段', -38, -4), ('傅鐘廣場', -44, 14), ('傅鐘旁長椅前', -30, 19.6), ('行政大樓前（柱廊外）', -38, 23.2),
          ('文學院門前', -38, -23.5), ('校史館門前', -77, -19), ('總圖門口', 80.5, 0), ('小椰林道', 30, -40), ('醉月湖南岸步道', -30, -51),
          ('醉月湖木棧道（湖面上）', -33, -61), ('湖心亭', -33, -65.4), ('醉月湖畔長椅（步道這側）', -41, -52.8), ('宿舍門口', 20, 54), ('萬才館門口', 88, -98),
          ('社科院前', 90, -60), ('社團攤位前', -18, 13.3), ('傅鐘石碑前', -38, 12.6),
          ('大道北側新系館前（第二十批）', 6, -16.2), ('小椰林道東側系館前', 57, -21), ('南側系館前', 2, 22), ('南側東邊系館前', 45, 22), ('宿舍區西側大樓前', -34, 57), ('路人路線點（北側系館後面）', 8, -40)]
BLOCKED = [('醉月湖水面（中央）', -24, -67), ('醉月湖水面（東側）', -18, -66), ('醉月湖水面（西側）', -42, -67), ('總圖建築內', 100, 0),
           ('行政大樓建築內', -38, 33), ('文學院建築內', -38, -34), ('校史館建築內', -77, -29), ('傅鐘本體', -38, 16.5), ('傅鐘台基角', -36, 14.6), ('傅鐘石碑', -38, 13.4), ('新系館（大道北側）內', 7, -30), ('新系館（小椰林道東）內', 57, -36), ('新系館（大道南側）內', 2, 35), ('新系館（南側東邊）內', 45, 35), ('宿舍區西側大樓內', -34, 70), ('宿舍區東側大樓內', 74, 70), ('校門門柱（北）', -124, 4.9), ('校門門柱（南）', -124, -4.9), ('校門門房', -120.6, 7.6)]
OLD_SAVES = [('舊存檔：站在新行政大樓位置', -38, 33), ('舊存檔：站在新總圖中央', 100, 0), ('舊存檔：站在醉月湖中央', -26, -68)]

async def main():
    fails = []
    def check(name, ok, info=''):
        print(('PASS ' if ok else 'FAIL ') + name + ('  ' + info if info else ''))
        if not ok: fails.append(name)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 640, 'height': 480}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        for i in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        async def load_at(x, z):
            st = {'zone': 'campus', 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': x, 'z': z, 'yaw': 0}, 'flags': FLAGS}
            await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(%s)" % json.dumps(st))
            await pg.wait_for_timeout(800)
        await load_at(*START)
        for name, x, z in PLACES:
            r = await pg.evaluate("""(a=>{ const E=GAME.E, n=E.nav; const stand=E.canStand?E.canStand(a.x,a.z,0.3):n.free(a.x,a.z); const path=n.path(a.sx,a.sz,a.x,a.z); let end=null; if(path&&path.length) end=path[path.length-1];
                return {stand, ok:!!(path&&path.length), len:path?path.length:0, end:end&&[+end[0].toFixed(1),+end[1].toFixed(1)]}; })(%s)""" % json.dumps({'x': x, 'z': z, 'sx': START[0], 'sz': START[1]}))
            reach = r['ok'] and r['end'] and abs(r['end'][0] - x) < 1.2 and abs(r['end'][1] - z) < 1.2
            check(f'{name} 站得住且走得到', r['stand'] and reach, json.dumps(r, ensure_ascii=False))
        for name, x, z in BLOCKED:
            r = await pg.evaluate("(a=>GAME.E.nav.free(a.x,a.z))(%s)" % json.dumps({'x': x, 'z': z}))
            check(f'{name} 不能走', not r)
        for name, x, z in OLD_SAVES:
            await load_at(x, z)
            # 不只要站得住，還要走得到霖澤館前（不能被移到新建築後面的封閉小空地）
            r = await pg.evaluate("(s=>{ const E=GAME.E, o=E.player.obj.position; const p=E.nav.path(o.x,o.z,s[0],s[1]); return {x:+o.x.toFixed(2),z:+o.z.toFixed(2),stand:E.canStand?E.canStand(o.x,o.z,0.3):E.nav.free(o.x,o.z),reach:!!(p&&p.length)}; })(%s)" % json.dumps(START))
            check(f'{name} → 讀檔後移到可走、走得到的地方', r['stand'] and r['reach'], json.dumps(r))
        check('沒有 JS 例外', not errs, str(errs[:3]))
        await b.close()
    print('ALL PASS' if not fails else 'FAILED: ' + ', '.join(fails))
    sys.exit(1 if fails else 0)

asyncio.run(main())
