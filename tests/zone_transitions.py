"""場景切換（v9.3 第十九、二十批）：校園 ↔ 霖澤館教室、萬才館、總圖、宿舍，校園 ↔ 公館（校門兩個方向）。
每一組：在出發區域站到入口旁邊 → 最近的互動是這個入口 → 互動 → 換到目的區域；
目的區域：玩家站得住、附近走得到（室內一進來就在「離開」按鈕範圍裡是既有設計：只列成 INFO；公館那一側要不在「回到校園」的範圍裡）；
再從目的區域的出口出來：回到原區域、站在預期的位置（1.5 m 內）、站得住、沒有一出來就落在入口的互動範圍裡（不會又跳出進去的按鈕），
回到校園時還要走得到霖澤館前（不會被放在封閉的小空地）。
用法：python3 tests/zone_transitions.py [URL]   （預設 http://127.0.0.1:8765/index.html）"""
import asyncio, json, sys
from playwright.async_api import async_playwright

URL = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html') + '?turbo'
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
START = (34, -98)
# 名稱, 出發區域, 入口 label, 目的區域, 目的區域的出口 label, 回到出發區域時預期的位置
CASES = [('霖澤館（教室）', 'campus', '進入霖澤館', 'classroom', '離開教室', (34, -97.6)),
         ('萬才館', 'campus', '進入萬才館', 'wancai', '離開萬才館', (79.5, -92.2)),
         ('總圖', 'campus', '進入總圖書館', 'library', '離開圖書館', (80, 0)),
         ('宿舍', 'campus', '回宿舍', 'dorm', '離開宿舍', (20, 54)),
         ('校門 → 公館', 'campus', '走出校門', 'gongguan', '回到校園', (-119, 0))]


async def main():
    fails = []
    def check(name, ok, info=''):
        print(('PASS ' if ok else 'FAIL ') + name + ('  ' + info if info else ''), flush=True)
        if not ok: fails.append(name)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 640, 'height': 480}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        for i in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)

        async def load(zone, x, z):
            st = {'zone': zone, 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': x, 'z': z, 'yaw': 0}, 'flags': FLAGS}
            await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(%s)" % json.dumps(st))
            await pg.wait_for_timeout(1500)

        async def use(label):
            """站到 label 那個互動點旁邊最近的可站位置，確認最近的互動就是它，然後按互動（和按鈕一樣不等它做完：有些入口會先出一句旁白，要像玩家一樣點掉）；回傳最近互動的 label、站的位置、互動前區域"""
            return await pg.evaluate("""(async(lb)=>{ const E=GAME.E, P=E.player; const it=E.interactables.find(i=>i.label===lb); if(!it) return {err:'找不到 '+lb};
                const nf=E.nav.nearestFree(it.x,it.z,6)||[it.x,it.z]; P.obj.position.set(nf[0],0,nf[1]); P.path=null; P.target=null;
                const near=E.nearestInteractable(); GAME.updateInteract(); const z0=GAME.G.zone; GAME.doInteract(); return {near:near&&near.label, at:[+nf[0].toFixed(2),+nf[1].toFixed(2)], z0}; })(%s)""" % json.dumps(label))

        async def wait_zone(z0, z1):
            # 等換區域；中間出現對話（例如沒有課的日子進霖澤館會先有一句旁白）就像玩家一樣點下一句
            adv = 0
            for i in range(80):
                st = await pg.evaluate("(()=>{ if(GAME.D&&GAME.D.active){ GAME.dlgAdvance(); return {adv:1}; } return {adv:0, z:GAME.G.zone, busy:!!GAME.E.player.busy}; })()")
                adv += st['adv']
                if not st['adv'] and st['z'] == z1 and not st['busy']:
                    if adv: print('      （點掉了 %d 次對話）' % adv, flush=True)
                    # 換區域之後還有 0.5 秒的淡入（game3d.js 的 fade），淡入完之前遊戲不接受下一次換區域（真人玩家這時也按不到）
                    for k in range(20):
                        if not await pg.evaluate("document.getElementById('fade').classList.contains('on')"): break
                        await pg.wait_for_timeout(100)
                    await pg.wait_for_timeout(900)
                    return st['z']
                await pg.wait_for_timeout(250)
            return await pg.evaluate("GAME.G.zone")

        async def state(back_label=None):
            return await pg.evaluate("""(lb=>{ const E=GAME.E, o=E.player.obj.position; const stand=E.canStand?E.canStand(o.x,o.z,0.3):E.nav.free(o.x,o.z);
                let inR=null; if(lb){ const it=E.interactables.find(i=>i.label===lb); if(it) inR=Math.hypot(o.x-it.x,o.z-it.z)<(it.radius||1.5); }
                // 附近走得到：往四個方向 3 m 至少有一條路
                let walk=false; for(const [dx,dz] of [[3,0],[-3,0],[0,3],[0,-3]]){ const q=E.nav.nearestFree(o.x+dx,o.z+dz,1.5); if(q){ const pth=E.nav.path(o.x,o.z,q[0],q[1]); if(pth&&pth.length){ walk=true; break; } } }
                return {x:+o.x.toFixed(2), z:+o.z.toFixed(2), stand, inR, walk, zone:GAME.G.zone}; })(%s)""" % json.dumps(back_label))

        for name, src, enter, dst, leave, expect in CASES:
            if src == 'campus': await load(src, *START)
            else: await load(src, 0, -40)
            r = await use(enter)
            check(f'{name}：入口旁邊最近的互動是「{enter}」', r.get('near') == enter, json.dumps(r, ensure_ascii=False))
            z = await wait_zone(src, dst)
            check(f'{name}：互動後進到 {dst}', z == dst, z)
            s = await state(leave)
            check(f'{name}：進來後站得住、走得動', s['stand'] and s['walk'], json.dumps(s, ensure_ascii=False))
            if dst != 'gongguan':
                # 室內的出生點本來就在門口：一進來「離開」按鈕就會出現（既有設計，不是這次的改動）；只列出來，不算失敗
                print(f'INFO {name}：進來時{"已經" if s["inR"] else "不在"}「{leave}」的範圍裡', flush=True)
            else:
                check(f'{name}：進來後不在「{leave}」範圍裡（不會一出校門就又跳出回校園的按鈕）', not s['inR'], json.dumps(s, ensure_ascii=False))
            r = await use(leave)
            check(f'{name}：出口旁邊最近的互動是「{leave}」', r.get('near') == leave, json.dumps(r, ensure_ascii=False))
            z = await wait_zone(dst, src)
            check(f'{name}：出來回到 {src}', z == src, z)
            s = await state(enter)
            d = ((s['x'] - expect[0]) ** 2 + (s['z'] - expect[1]) ** 2) ** 0.5
            check(f'{name}：回來站在預期位置附近、站得住、走得動、不會又跳出「{enter}」', d < 1.5 and s['stand'] and s['walk'] and not s['inR'], json.dumps(s, ensure_ascii=False) + f' 距預期 {d:.2f} m')
            if src == 'campus':
                ok = await pg.evaluate("(s=>{ const E=GAME.E, o=E.player.obj.position; const p=E.nav.path(o.x,o.z,s[0],s[1]); return !!(p&&p.length); })(%s)" % json.dumps(START))
                check(f'{name}：回到校園後走得到霖澤館前', ok)
        check('沒有 JS 例外', not errs, str(errs[:3]))
        await b.close()
    print('ALL PASS' if not fails else 'FAILED: ' + ', '.join(fails))
    sys.exit(1 if fails else 0)

asyncio.run(main())
