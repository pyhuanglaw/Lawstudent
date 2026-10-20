"""BB：X66 補驗（e81175ab 以後）：晚上 20:30／中午 12:15 在店裡看玻璃門外，和巷子本身比亮度；家常菜 (-2.6,-2.94) 椅子。
[前置] L.load_state 到店門外（營業中的日子），照玩家進店；鏡頭轉向店門（離開的互動點）截圖，量門那一塊的平均亮度。巷子本身：同時間門外人行道截圖的平均亮度。"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
from PIL import Image, ImageStat
URL, OUT = sys.argv[1], sys.argv[2]
BASE = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True, 'fundsV2': 1, 'L118_FIRST_SENT': True}
res = {}
def lum(f, box=None):
    im = Image.open(f).convert('L'); W, H = im.size
    if box: im = im.crop((int(box[0]*W), int(box[1]*H), int(box[2]*W), int(box[3]*H)))
    return round(ImageStat.Stat(im).mean[0], 1)
async def drain(pg, cdp, secs=40):
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s['choices']: await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; bs[0].click(); })()"); await pg.wait_for_timeout(600); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
        if s['busy']: await pg.wait_for_timeout(500); continue
        return
async def main():
    run = L.Run('x66b', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        d0 = await pg.evaluate("STORY.dayOfKey('2025-09-08')")
        for sid in ['tea', 'korea', 'home']:
            for hour in [20.5, 12.25]:
                LL = await pg.evaluate("L118_SHOP_LAYOUTS[%s]" % json.dumps(sid)); nm = LL['name']; so = LL['street']['spawn_out']
                pick = await pg.evaluate("(a=>{ for(let k=0;k<7;k++){ const day=a[1]+k, wd=CALENDAR.dateOf(day).wd%%7; if(L118.isOpen(a[0],{hour:a[2],day,weekday:wd})) return {day,wd,key:CALENDAR.dateOf(day).key}; } return null; })(%s)" % json.dumps([sid, d0, hour]))
                tag = '%s_%02d' % (sid, int(hour))
                if not pick: res[tag] = 'closed at this hour all week'; print(' ', tag, '這個時間整週都沒開', flush=True); continue
                await L.load_state(pg, {'zone': 'lane118', 'hour': hour, 'day': pick['day'], 'weekday': pick['wd'], 'weather': 'sunny', 'stage': 'law', 'money': 3000, 'flags': BASE, 'pos': {'x': so['x'], 'z': so['z'], 'yaw': so['yaw']}})
                await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp); run.setup('[前置] %s %.2f %s 門外' % (pick['key'], hour, nm))
                fo = os.path.join(OUT, tag + '_lane.png'); await pg.screenshot(path=fo)
                it = await L.find_it(pg, '進' + nm)
                if not (it and await L.go_to(pg, cdp, run, it['x'], it['z'], 0.8, '門口')): res[tag] = 'door not reached'; continue
                await L.tap(pg, cdp, '#interact')
                for _ in range(40):
                    if await pg.evaluate("GAME.G.zone===%s&&!GAME.E.player.busy&&!!(GAME.E.zone&&GAME.E.zone.formal)" % json.dumps(LL['zone'])): break
                    await pg.wait_for_timeout(1000)
                await drain(pg, cdp); await pg.wait_for_timeout(2500)
                ex = await L.find_it(pg, '離開' + nm)
                if ex: await pg.evaluate("(a=>{ const E=GAME.E, P=E.player.obj.position; E.cam.yaw=Math.atan2(P.x-a[0],P.z-a[1]); })(%s)" % json.dumps([ex['x'], ex['z']]))
                await pg.wait_for_timeout(2500)
                fi = os.path.join(OUT, tag + '_inside_door.png'); await pg.screenshot(path=fi)
                res[tag] = {'day': pick['key'], 'lane_mean': lum(fo, (0.0, 0.25, 1.0, 1.0)), 'inside_mean': lum(fi, (0.0, 0.25, 1.0, 1.0)), 'door_top_mean': lum(fi, (0.3, 0.0, 0.62, 0.45))}
                print(' ', tag, json.dumps(res[tag], ensure_ascii=False), flush=True)
                if sid == 'home' and hour == 12.25:
                    for (px, pz) in [(-2.6, -2.94)]:
                        await pg.evaluate("void 0"); seats = await pg.evaluate("GAME.E.interactables.filter(i=>i.seat&&Math.hypot(i.x-(%s),i.z-(%s))<0.3).map(i=>({x:i.x,z:i.z}))" % (px, pz))
                        labs = []
                        for dx, dz in [(0, 0), (0.25, 0), (-0.25, 0), (0, 0.25), (0, -0.25)]:
                            if not seats: break
                            await pg.evaluate("(a=>{ GAME.E.player.obj.position.set(a[0],0,a[1]); })(%s)" % json.dumps([seats[0]['x'] + dx, seats[0]['z'] + dz])); await pg.wait_for_timeout(1200)
                            labs.append(((dx, dz), (await L.state(pg))['interact']))
                        ok = await L.go_to(pg, cdp, run, seats[0]['x'], seats[0]['z'], 0.6, '椅子') if seats else False
                        lab = (await L.state(pg))['interact']; sat = False
                        if lab.startswith('坐'):
                            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(4000); await drain(pg, cdp); sat = (await L.state(pg))['pose'] == 'sit'
                        res['home_chair'] = {'labels_around': labs, 'walk_label': lab, 'sat': sat}; print('  家常菜椅子', json.dumps(res['home_chair'], ensure_ascii=False), flush=True)
                        await run.shot(pg, 'home_chair')
                        run.check('家常菜 (-2.6,-2.94) 椅子：「坐下」、坐得下去', sat, json.dumps(res['home_chair'], ensure_ascii=False))
        json.dump(res, open(os.path.join(OUT, 'x66b.json'), 'w'), ensure_ascii=False, indent=1)
        for sid in ['tea', 'korea', 'home']:
            n, dd = res.get(sid + '_20'), res.get(sid + '_12')
            if isinstance(n, dict) and isinstance(dd, dict):
                run.check('%s：晚上門那一塊比中午暗（晚 %.1f／午 %.1f）' % (sid, n['door_top_mean'], dd['door_top_mean']), n['door_top_mean'] < dd['door_top_mean'] * 0.7)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
