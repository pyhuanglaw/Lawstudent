"""BB（帳號 A）2026-10-21：BUG-GYM-LIGHT-LOAD-1021 重拍（LAWWW2 e920fa7e：球場地板粗糙度 0.32→0.6 → 開發分支 6a47ff46；LAWWW 17:17 請求）。
同 artrev2 01／09、artrev4 01／07 的角度：讀 9/25 存檔 → GAME.enter('gym') → 玩家搬到 1F 中間 (0,0) → 鏡頭照進場的 yaw 鎖住 → 拍。
  ① 20:30 ② 13:00 ③ 直接讀檔進體育館（存檔的 zone 改成 gym、不先經過別區）20:30，進場鏡頭不動拍一張、鎖 yaw 再拍一張。
每張量「白色光柱」那一塊（畫面左邊、搖桿上方）和右邊對稱那一塊的平均亮度差（L−R）；和修之前的 artrev4 01、07 同一個量法比。
[捷徑] GAME.enter、設時間、搬玩家、讀檔改 zone。不是 iPhone：Playwright 手機橫向 844×390、?turbo。
用法：LW_TESTS=<開發分支>/tests python3 gym_reshoot_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json> [修之前的截圖資料夾]"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
from PIL import Image, ImageStat
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
OLD = sys.argv[4] if len(sys.argv) > 4 else ''
BOX_L, BOX_R = (90, 150, 250, 250), (594, 150, 754, 250)   # 844×390：光柱（左、搖桿上方、避開 HUD）／右邊對稱（避開小地圖）


def lum(p, box):
    return ImageStat.Stat(Image.open(p).convert('L').crop(box)).mean[0]


def diff(p):
    return round(lum(p, BOX_L) - lum(p, BOX_R), 1)


async def enter(pg, z, h):
    await pg.evaluate("(async(z,h)=>{ GAME.G.hour=h; GAME.E.hour=h; await GAME.enter(z); })(%s,%s)" % (json.dumps(z), h))
    await pg.wait_for_timeout(15000); await sethour(pg, h)


async def sethour(pg, h):
    await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; })(%s)" % h); await pg.wait_for_timeout(5000)


async def closephone(pg):
    await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b&&b.offsetParent) b.click(); })()"); await pg.wait_for_timeout(600)


async def put(pg, x, z):
    return await pg.evaluate("(([x,z])=>{ const P=GAME.E.player; P.path=null; P.target=null; P.obj.position.set(x,P.obj.position.y,z); try{ GAME.E.unstick&&GAME.E.unstick(P,8); }catch(e){} return [+P.obj.position.x.toFixed(2),+P.obj.position.z.toFixed(2)]; })(%s)" % json.dumps([x, z]))


async def lock_and_shot(pg, run, tag):
    y0 = await pg.evaluate("GAME.E.cam.yaw")
    await pg.evaluate("(y=>{ const C=GAME.E.cam; C.yaw=y; C.manualT=60; })(%s)" % json.dumps(y0))
    await pg.wait_for_timeout(2500); await closephone(pg); return await run.shot(pg, tag)


async def main():
    run = L.Run('gym_reshoot', OUT); base = json.load(open(SAVE, encoding='utf-8')); res = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base)); await pg.wait_for_timeout(6000); run.setup('讀 9/25 存檔')
        for h, tag in ((20.5, 'gym_20_like_artrev2'), (13.0, 'gym_13_like_artrev2')):
            await enter(pg, 'gym', h); run.setup('[捷徑] gym %.1f（讀檔後直接 GAME.enter，和 artrev2 同順序）' % h)
            at = await put(pg, 0, 0); await closephone(pg); run.setup('[捷徑] 玩家搬到 1F 中間 %s' % at)
            res.append((tag, await lock_and_shot(pg, run, tag)))
        await b.close()
        b, ctx, pg, cdp, errs2 = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        G = dict(base.get('G', base)); G.update({'zone': 'gym', 'hour': 20.5, 'pos': {'x': 0, 'z': 0, 'yaw': 0}})
        await L.load_state(pg, G); run.setup('[前置] 存檔的 zone 改成 gym、20:30、(0,0)：直接讀檔進體育館（不先經過別區）')
        await pg.wait_for_timeout(20000); await closephone(pg)
        z = await pg.evaluate("GAME.G.zone"); run.check('③ 讀檔後就在體育館', z == 'gym', z)
        res.append(('gym_20_direct_load_entry', await run.shot(pg, 'gym_20_direct_load_entry')))
        at = await put(pg, 0, 0); res.append(('gym_20_direct_load_locked', await lock_and_shot(pg, run, 'gym_20_direct_load_locked')))
        errs = errs + errs2
        for tag, path in res:
            d = diff(path); old = os.path.join(OLD, {'gym_20_like_artrev2': '07_gym_20_like_artrev2.png', 'gym_13_like_artrev2': '01_gym_13_like_artrev2.png'}.get(tag, '')) if OLD else ''
            od = diff(old) if old and os.path.isfile(old) else None
            print('   %s：光柱那一塊比右邊亮 %+.1f（修之前 artrev4 同角度 %s）' % (tag, d, '%+.1f' % od if od is not None else '—'), flush=True)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    run.finish()
asyncio.run(main())
