"""BB-B 2026-11-08：UX-MINIMAP-GUIDE-DOOR-1108（LAWWW-B 9ceff6edf）瀏覽器抽查——開著指路走到法律系館A門口附近，小地圖上那個門口的出入口方塊（#7fc4c9）
有沒有畫在金色目的地點（#ffc85a）上面。
做法：同一個伺服器跑兩次。MODE=old 用伺服器上的 src/game3d.js（舊順序）；MODE=new 用 Playwright 把 src/game3d.js 換成 NEW_GAME3D 指的檔（9ceff6edf 那一版）。
讀小地圖 canvas 在「法律系館A門口那個出入口」位置的像素（照 drawMinimap 同一套座標換算，含鏡頭旋轉），看是青色還是金色；另外截小地圖放大圖。
[前置] 讀使用者存檔 day46，【捷徑】讀檔到校園法律系館A門口附近（週二 10:20）、GAME.setGoal 指到法律系館A（和劇情給目標同一個函式）。不走路：這支只看畫的先後。
不是 iPhone：Playwright 手機直向模擬（SwiftShader）。
用法：LW_TESTS=<測試樹>/tests MODE=old|new NEW_GAME3D=<9ceff6edf 的 game3d.js> python3 pt1108k_minimap_door_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, copy, json, os, sys
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import bbplay as P
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
MODE = os.environ.get('MODE', 'new')
NEW = os.environ.get('NEW_GAME3D')
J = lambda x, n=900: json.dumps(x, ensure_ascii=False)[:n]

PROBE = r"""(()=>{ const E=GAME.E, nav=E.nav, mm=document.getElementById('minimap'); if(!mm||!nav) return {err:'no minimap'};
  const it=E.interactables.find(i=>i.exit&&i.exit.to==='linze'); if(!it) return {err:'no linze exit'};
  const P=E.player.obj.position, scale=E.indoor?4.5:2.2, [cx,cz]=nav.toCell(P.x,P.z), [nx,nz]=nav.toCell(it.x,it.z);
  const u=(nx-cx)*scale, v=(nz-cz)*scale, y=E.cam.yaw, c=Math.cos(y), s=Math.sin(y);
  const px=mm.width/2+u*c-v*s, py=mm.height/2+u*s+v*c;
  const st=GUIDE._st, tg=st.tgt?{x:st.tgt.x,z:st.tgt.z}:null; let gx=null,gy=null;
  if(tg){ const gu=((tg.x-nav.ox)/nav.cell-cx-0.5)*scale, gv=((tg.z-nav.oz)/nav.cell-cz-0.5)*scale; gx=mm.width/2+gu*c-gv*s; gy=mm.height/2+gu*s+gv*c; }
  const ctx=mm.getContext('2d'); const d=ctx.getImageData(Math.round(px)-1,Math.round(py)-1,3,3).data; const px9=[]; for(let i=0;i<9;i++) px9.push([d[i*4],d[i*4+1],d[i*4+2]]);
  const near=(p,q)=>Math.abs(p[0]-q[0])+Math.abs(p[1]-q[1])+Math.abs(p[2]-q[2])<40;
  return {door:{x:it.x,z:it.z,label:it.label}, px:+px.toFixed(1), py:+py.toFixed(1), gold:tg?{x:tg.x,z:tg.z,gx:+gx.toFixed(1),gy:+gy.toFixed(1)}:null,
    center:px9[4], cyan:px9.filter(p=>near(p,[127,196,201])).length, goldN:px9.filter(p=>near(p,[255,200,90])).length, player:{x:+P.x.toFixed(2),z:+P.z.toFixed(2)}, zone:GAME.G.zone, guideOn:!(GAME.S&&GAME.S.guide===false), goal:GAME.G.goal}; })()"""


async def main():
    run = L.Run('pt1108k_minimap_door_' + MODE, OUT)
    raw = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    G0 = raw.get('G', raw)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=False)
        if MODE == 'new':
            body = open(NEW, encoding='utf-8').read()
            await pg.route('**/src/game3d.js', lambda r: r.fulfill(status=200, content_type='application/javascript; charset=utf-8', body=body))
            run.setup('[前置] src/game3d.js 換成 %s（%d 字）' % (NEW, len(body)))
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        await P.init(pg)
        s = copy.deepcopy(G0); s['invites'] = [v for v in s.get('invites', []) if v.get('state') != 'going']; s.setdefault('home', {})['at'] = False
        s.update(zone='campus', pos={'x': 31.0, 'z': -101.0, 'yaw': 0}, weekday=2, hour=10.3)
        await P.load(pg, cdp, s, quiet=True); await P.init(pg)
        run.setup('【捷徑】day46 存檔讀到校園 (31,−101) 法律系館A門口附近，週二 10:20')
        await pg.evaluate("GAME.setGoal('去法律系館A',{zone:'linze',name:'法律系館A'})")
        run.setup('【捷徑】GAME.setGoal 指到法律系館A（zone linze）')
        await pg.wait_for_timeout(6000)
        r = None
        for i in range(3):
            r = await pg.evaluate(PROBE)
            run.note('第 %d 次讀小地圖：%s' % (i + 1, J(r)))
            if r and not r.get('err') and r.get('gold'): break
            await pg.wait_for_timeout(3000)
        ok = r and not r.get('err')
        run.check('找得到法律系館A門口的出入口、指路有目的地', ok and r.get('gold') is not None, J(r))
        if ok and r.get('gold'):
            same = abs(r['gold']['gx'] - r['px']) < 3 and abs(r['gold']['gy'] - r['py']) < 3
            run.check('金色目的地點和門口方塊在小地圖上是同一個位置（會互相蓋到）', same, J({'door': [r['px'], r['py']], 'gold': [r['gold']['gx'], r['gold']['gy']]}))
            if MODE == 'new':
                run.check('[new] 門口方塊在上面：方塊中心 3×3 像素有青色（#7fc4c9）', r['cyan'] >= 1, J(r))
            else:
                run.note('[old] 門口方塊中心 3×3：青色 %d 個、金色 %d 個（舊順序預期被金色蓋住）' % (r['cyan'], r['goldN']))
        el = await pg.query_selector('#minimap')
        if el:
            path = os.path.join(OUT, 'minimap_%s.png' % MODE)
            os.makedirs(OUT, exist_ok=True); await el.screenshot(path=path); run.note('截圖 %s' % path)
        run.check('沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
