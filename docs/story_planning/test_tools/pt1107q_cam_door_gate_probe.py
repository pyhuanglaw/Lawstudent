"""BB-B 2026-11-07：LAWWW2-B 兩件鏡頭修正（LAWWW-B 已接進開發分支：dbbb2e5b4、cc696b2d6；測在 3cd6f2797）瀏覽器驗收。
  A CAM-LIBHALL-DOOR-1107：從校園走到總圖門口、按「進入總圖書館」→ 第一個畫面鏡頭在玻璃帷幕裡面（z < 8.95），不是隔著門框看人；
    再【捷徑】把鏡頭轉到人前面（回頭往門口看）拍一張。
  B CAM-GONGGUAN-GATE-1107：手機「地點」→「公館商圈」→ 第一個畫面鏡頭在校門那一側（比人更北、z 比人小）、看得到南邊的店；
    推搖桿往前（真的觸控）＝往店走（z 變大），不是撞校門。
直向（390×844）、橫向（844×390）各跑一次。修正前的畫面＝CC 試玩第 8 件截圖（cc-testing play1107_8a／8b）。
[前置／捷徑] 讀使用者存檔 day46，14:00 校園；站到總圖門口 3 m 內（placeNear）；回頭那一張的鏡頭角度是【捷徑】。
用法：LW_TESTS=<測試樹>/tests python3 pt1107q_cam_door_gate_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, math, os, sys
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import bbplay as P
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
J = lambda x, n=500: json.dumps(x, ensure_ascii=False)[:n]
CAM = """(()=>{ const E=GAME.E, c=E.camera.position, p=E.player.obj.position; return {zone:GAME.G.zone, cx:+c.x.toFixed(2), cy:+c.y.toFixed(2), cz:+c.z.toFixed(2),
  px:+p.x.toFixed(2), pz:+p.z.toFixed(2), yaw:+(E.cam&&E.cam.yaw||0).toFixed(2), dHead:+Math.hypot(c.x-p.x,c.y-(p.y+1.6),c.z-p.z).toFixed(2), busy:!!E.player.busy}; })()"""


async def zone_settle(pg, zone, max_s=60):
    for _ in range(max_s * 2):
        z = await pg.evaluate("GAME.G.zone")
        if z == zone: break
        await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(5000)
    return await pg.evaluate(CAM)


async def one(p, run, base, landscape):
    tag = 'L' if landscape else 'P'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=landscape)
    await pg.goto(URL); run.check('%s 遊戲載入' % tag, await L.wait_loaded(pg))
    await P.init(pg)
    s = json.loads(json.dumps(base)); s['hour'] = 14.0; s['zone'] = 'campus'; s['pos'] = None
    await P.load(pg, cdp, s); await P.init(pg)
    # ── A 總圖
    pl = await P.place_near(pg, run, 86.4, 0, R=3.0, what='總圖門口')
    lab = ''
    for _ in range(10):
        lab = await pg.evaluate("__BBF.lab()")
        if lab.startswith('進入總圖'): break
        await pg.wait_for_timeout(500)
    run.check('%s A 總圖門口出現「進入總圖書館」' % tag, lab.startswith('進入總圖'), J([lab, pl]))
    await L.tap(pg, cdp, '#interact')
    c1 = await zone_settle(pg, 'library_hall')
    await run.shot(pg, 'A_libhall_enter_' + tag)
    print('[A%s 進門]' % tag, J(c1))
    run.check('%s A 一進門鏡頭在玻璃帷幕裡面（z < 8.95）、不是頭頂特寫（離頭 > 1.5 m）' % tag, c1['zone'] == 'library_hall' and c1['cz'] < 8.95 and c1['dHead'] > 1.5, J(c1))
    await pg.evaluate("(()=>{ const E=GAME.E; E.cam.yaw=(E.cam.yaw||0)+Math.PI; })()")
    await pg.wait_for_timeout(3000)
    c2 = await pg.evaluate(CAM)
    await run.shot(pg, 'A_libhall_lookdoor_' + tag)
    print('[A%s 回頭]' % tag, J(c2))
    run.setup('【捷徑】%s A 鏡頭轉 180°（E.cam.yaw +π）＝回頭往門口看' % tag)
    # ── B 公館商圈
    await P.phone_tab(pg, cdp, 'places')
    ok = await L.tap(pg, cdp, '#phoneBody [data-place="gongguan|公館商圈"]')
    run.check('%s B 手機「地點」有「公館商圈」的「前往」' % tag, bool(ok))
    c3 = await zone_settle(pg, 'gongguan')
    await L.close_panels(pg, cdp)
    await pg.wait_for_timeout(1500)
    c3 = await pg.evaluate(CAM)
    await run.shot(pg, 'B_gongguan_arrive_' + tag)
    print('[B%s 到]' % tag, J(c3))
    run.check('%s B 落點 (0,-30)、鏡頭在校門那一側（鏡頭 z < 人 z − 2）' % tag, c3['zone'] == 'gongguan' and abs(c3['px']) < 1.5 and abs(c3['pz'] + 30) < 1.5 and c3['cz'] < c3['pz'] - 2, J(c3))
    moved, k, st = await L.push_until(pg, cdp, 0, -40, 2.5, max_pushes=5, ms=2000)
    c4 = await pg.evaluate(CAM)
    await run.shot(pg, 'B_gongguan_forward_' + tag)
    print('[B%s 往前]' % tag, J(c4), moved, k)
    run.check('%s B 推搖桿往前＝往南邊的店走（z 變大 ≥ 2 m）' % tag, c4['pz'] - c3['pz'] >= 2.0, J([c3['pz'], c4['pz'], round(moved, 2), k]))
    run.check('%s 沒有 JS 例外' % tag, not errs, J(errs[:5]))
    await b.close()


async def main():
    run = L.Run('pt1107q_cam_door_gate', OUT)
    base = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    async with async_playwright() as p:
        for landscape in (False, True):
            await one(p, run, base, landscape)
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
