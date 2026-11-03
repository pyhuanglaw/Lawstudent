"""校園配置（依台大平面圖重排後）導航檢查：實際載入遊戲的校園區域，查詢導航格與 A* 路徑。
檢查：主要地點都站得住、彼此走得到（從霖澤館前出發）；醉月湖水面不能走、木棧道與湖心亭可以走（方案 A：湖在 (-36,-112)，普通、博雅在文學院後面）；
新的長椅座位前面站得住；舊存檔若站在新建築裡，讀檔後會被移到可走、而且走得到霖澤館前的地方。
用法：python3 tests/campus_layout_nav.py [URL]   （預設 http://127.0.0.1:8765/index.html）"""
import asyncio, json, sys
from playwright.async_api import async_playwright

URL = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html') + '?turbo'
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True}
START = (34, -98)    # 霖澤館前（校園預設出生點）
# 名稱, x, z：每一個都要站得住，而且從霖澤館前有路走得到
PLACES = [('法律系館A穿堂（v9.4 D36 起可以走，高 0.9 m；舊版這三個在「不能走」清單）', 34, -110), ('霖澤館正面台階', 34, -101.6), ('霖澤館背面的後台階', 34, -122.5), ('校門內', -112, 0), ('校門北側通道（走出校門的互動點）', -125.5, 5.27), ('校門南側通道（走出校門的互動點）', -125.5, -5.27), ('校門北側通道正中間', -124, 5.27), ('校門南側通道正中間', -124, -5.27), ('椰影大道中段', -38, -4), ('傅鐘廣場', -44, 14), ('晨思鐘旁長椅前', -30, 19.6), ('行政大樓前（柱廊外）', -38, 23.2),
          ('文學院門前', -38, -23.5), ('校史館門前', -77, -19), ('總圖門口', 80.5, 0), ('椰影小徑', 30, -40), ('醉月湖南岸步道', -36, -97),
          ('映月湖木棧道（湖面上）', -39, -107), ('湖心亭', -39, -111.4), ('映月湖畔長椅（步道這側）', -47, -98.8), ('普通教學館正門（方案 A）', -38, -49.4), ('博思教學館正門（方案 A）', -38, -72.8), ('宿舍門口', 20, 54), ('共同教學館正門（2026-10-13，行政大樓東邊）', 2, 22.8), ('大一女舍 A 棟門口（2026-10-13）', -108, 59.2), ('大一女舍 B 棟門口', -78, 57.2), ('大一女舍天橋下', -93, 67), ('大一女舍門口長椅前', -93, 55.6), ('萬才館弧形量體前（LAW-RELAYOUT-1102：萬才館中心搬到 (94,-96)、照官方地圖轉 42°，以下萬才館的點都照這個轉換）', 75.84, -88.53), ('萬才館一樓入口（陽台下）', 90.68, -83.65), ('萬才館大樓梯中段（一階一階，平台與陽台在第 1 層）', 81.21, -83.29), ('萬才館西側（往小湖的走道）', 68, -96), ('兩棟系館之間：小湖旁的走道（LAW-RELAYOUT-1102；舊的「矮籬前」(58,-117) 現在是國青大樓）', 68.5, -90),
          ('社科院前', 90, -60), ('社團攤位前', -18, 13.3), ('晨思鐘石碑前', -38, 12.6),
          ('大道北側新系館前（第十八批）', 6, -16.2), ('椰影小徑東側系館前', 57, -21), ('南側系館前', 2, 22), ('南側東邊系館前', 45, 22), ('宿舍區西側大樓前', -34, 57), ('路人路線點（北側系館後面）', 8, -40), ('大一女舍天橋前（第二十批的舟山路西段南側系館前；2026-10-13 換成大一女舍）', -92, 57.5)]
BLOCKED = [('校門門房（2026-10-18 起在正中間）', -123.7, 0), ('校門燈柱（北內側）', -124, 2.45), ('校門燈柱（南外側）', -124, -8.1), ('映月湖水面（中央）', -30, -113), ('映月湖水面（東側）', -24, -112), ('映月湖水面（西側）', -48, -113), ('普通教學館建築內', -38, -58.5), ('博思教學館建築內', -38, -83), ('總圖建築內', 100, 0),
           ('行政大樓建築內', -38, 33), ('文學院建築內', -38, -34), ('校史館建築內', -77, -29), ('晨思鐘本體', -38, 16.5), ('晨思鐘台基角', -36, 14.6), ('晨思鐘石碑', -38, 13.4), ('新系館（大道北側）內', 7, -30), ('新系館（椰影小徑東）內', 57, -36), ('新系館（大道南側）內', 2, 35), ('新系館（南側東邊）內', 45, 35), ('宿舍區西側大樓內', -34, 70), ('宿舍區東側大樓內', 74, 70), ('萬才館弧形量體內', 77.98, -90.91), ('萬才館弧形量體內（靠建築）', 80.06, -93.22), ('萬才館樓梯頂端平台（第 0 層走不到）', 85.23, -87.75), ('萬才館正面往前凸出的量體內', 96.3, -79.13), ('國青大樓內（LAW-RELAYOUT-1102）', 65, -119), ('研三舍內（LAW-RELAYOUT-1102）', 63, -108), ('萬才館後面（建築背面到圍牆；LAW-RELAYOUT-1102 第二輪轉 42°）', 104.8, -109.5), ('法學院後面（建築背面到圍牆）', 58, -121.5), ('大一女舍 A 棟建築內（2026-10-13 e59c1ad 取代第二十批的舟山路西段南側系館；舊清單的 (-92,68) 現在是 A、B 棟之間的天橋下，可以走）', -108, 68), ('大一女舍 B 棟建築內', -78, 66)]
OLD_SAVES = [('舊存檔：站在舊的校門開口正中間（現在是門房）', -124, 0), ('舊存檔：站在新行政大樓位置', -38, 33), ('舊存檔：站在新總圖中央', 100, 0), ('舊存檔：站在映月湖中央（方案 A 之前的位置，現在是普通、博思之間）', -26, -68), ('舊存檔：站在現在普通教學館的位置（以前是湖面）', -30, -60), ('舊存檔：站在法律系館A舊門廊（現在是墊高的穿堂）', 34, -104), ('舊存檔：站在萬才館第十九批的平台（第二十四批起在弧形量體裡）', 80, -101), ('舊存檔：站在萬才館最早的門口（第二十四批起是樓梯頂端平台）', 88.5, -98), ('舊存檔：站在法學院後面的窄縫（現在不能走）', 58, -122.5), ('舊存檔：站在萬才館舊的一樓出來的位置（LAW-RELAYOUT-1102 起在萬才館裡）', 93.8, -98.4), ('舊存檔：站在萬才館舊的大樓梯中段（現在在萬才館裡）', 87, -94), ('舊存檔：站在萬才館舊的西側（現在是研三舍）', 63, -108), ('舊存檔：站在萬才館舊的大樓梯頂端平台（第 1 層；LAW-RELAYOUT-1102 第二輪起第 1 層的平台在 (84.7,-87.2)）', 87, -99.6, 1), ('舊存檔：站在萬才館舊的弧形陽台（第 1 層）', 93.8, -100.6, 1)]

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
            if await pg.evaluate("!!(typeof GAME!=='undefined'&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide')&&(typeof GAME==='undefined'||!GAME.charsAllP||!!GAME.charsAll))"): break
            await pg.wait_for_timeout(500)
        async def load_at(x, z, lv=0):
            st = {'zone': 'campus', 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': x, 'z': z, 'yaw': 0, 'lv': lv, 'y': 3.63 if lv else 0}, 'flags': FLAGS}
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
        for name, x, z, *lv in OLD_SAVES:
            await load_at(x, z, *lv)
            # 不只要站得住，還要走得到霖澤館前（不能被移到新建築後面的封閉小空地）
            r = await pg.evaluate("(s=>{ const E=GAME.E, o=E.player.obj.position; const lv=E.player.lv|0; const p=E.pathTo?E.pathTo(o.x,o.z,lv,s[0],s[1],0):E.nav.path(o.x,o.z,s[0],s[1]); return {x:+o.x.toFixed(2),z:+o.z.toFixed(2),lv,stand:E.canStand?E.canStand(o.x,o.z,0.3):E.nav.free(o.x,o.z),reach:!!(p&&p.length)}; })(%s)" % json.dumps(START))
            check(f'{name} → 讀檔後移到可走、走得到的地方', r['stand'] and r['reach'], json.dumps(r))
        check('沒有 JS 例外', not errs, str(errs[:3]))
        await b.close()
    print('ALL PASS' if not fails else 'FAILED: ' + ', '.join(fails))
    sys.exit(1 if fails else 0)

asyncio.run(main())
