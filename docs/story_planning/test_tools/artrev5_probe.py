"""BB（帳號 A）2026-10-21：體育館 1F 白霧是什麼（artrev4：不管鏡頭怎麼移、玩家站哪裡，都在螢幕同一個位置——左邊、搖桿上方；射線只打到地板）。
  ① 白霧那一點上面疊了哪些網頁元素（document.elementsFromPoint）：id、class、透明度、背景。
  ② 把遊戲畫布藏起來拍一張（白霧還在＝網頁元素；不在＝WebGL 畫的）。
  ③ WebGL 的話：依序藏起區域群組（E.zone.group）、玩家、場景其他子物件，各拍一張，看白霧跟著誰消失；列出場景最上層的子物件。
  ④ 換別的室內區域（宿舍、總圖大廳）同一個鏡頭距離拍一張，看是不是到處都有。
[捷徑] GAME.enter、設時間、搬玩家、暫時藏物件（只為了比對）。不是 iPhone：只看畫面。
用法：LW_TESTS=<開發分支>/tests python3 artrev5_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
STACK = """(([x,y])=>{ return document.elementsFromPoint(x,y).slice(0,8).map(e=>{ const c=getComputedStyle(e); return {tag:e.tagName, id:e.id, cls:String(e.className&&e.className.baseVal===undefined?e.className:''), op:c.opacity, bg:(c.backgroundImage!=='none'?c.backgroundImage:c.backgroundColor).slice(0,90), vis:c.visibility, disp:c.display, z:c.zIndex}; }); })"""
TOP = """(()=>{ return GAME.E.scene.children.map((o,i)=>({i, n:o.name||'(無名)', t:o.type, vis:o.visible, kids:o.children.length})); })()"""


async def enter(pg, z, h):
    await pg.evaluate("(async(z,h)=>{ GAME.G.hour=h; GAME.E.hour=h; await GAME.enter(z); })(%s,%s)" % (json.dumps(z), h))
    await pg.wait_for_timeout(15000); await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; })(%s)" % h); await pg.wait_for_timeout(5000)


async def closephone(pg):
    await pg.evaluate("(()=>{ try{ if(typeof PHONE!=='undefined'&&PHONE.pending) for(const k of (PHONE.pending()||[])){ try{ PHONE.answer&&PHONE.answer(k,0); }catch(e){} } }catch(e){} const b=document.getElementById('btnPhoneClose'); if(b&&b.offsetParent) b.click(); })()")
    await pg.wait_for_timeout(800)


async def main():
    run = L.Run('artrev5', OUT); base = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base)); await pg.wait_for_timeout(6000); run.setup('讀 9/25 存檔')
        await enter(pg, 'gym', 20.5); run.setup('[捷徑] gym 20:30')
        await pg.evaluate("(()=>{ const P=GAME.E.player; P.obj.position.set(0,P.obj.position.y,0); const C=GAME.E.cam; C.yaw=Math.PI*2; C.distTarget=5.2; C.pitch=0.22; C.manualT=600; })()")
        await pg.wait_for_timeout(3000); await closephone(pg); await run.shot(pg, 'gym_base')
        for pt in ((95, 120), (110, 180), (90, 240)):
            print('   網頁元素', pt, json.dumps(await pg.evaluate(STACK + "(%s)" % json.dumps(list(pt))), ensure_ascii=False), flush=True)
        await pg.evaluate("(()=>{ const c=document.querySelector('canvas'); c.dataset.v=c.style.visibility; c.style.visibility='hidden'; })()")
        await pg.wait_for_timeout(1200); await run.shot(pg, 'gym_canvas_hidden')
        await pg.evaluate("(()=>{ const c=document.querySelector('canvas'); c.style.visibility=c.dataset.v||''; })()")
        await pg.wait_for_timeout(1200)
        top = await pg.evaluate(TOP); print('   場景最上層', json.dumps(top, ensure_ascii=False), flush=True)
        await pg.evaluate("GAME.E.zone.group.visible=false"); await pg.wait_for_timeout(1500); await run.shot(pg, 'gym_zone_hidden')
        await pg.evaluate("GAME.E.zone.group.visible=true"); await pg.wait_for_timeout(800)
        await pg.evaluate("GAME.E.player.obj.visible=false"); await pg.wait_for_timeout(1500); await run.shot(pg, 'gym_player_hidden')
        await pg.evaluate("GAME.E.player.obj.visible=true"); await pg.wait_for_timeout(800)
        for t in top:
            if t['n'] == (await pg.evaluate("GAME.E.zone.group.name||'(無名)'")) or not t['vis']: continue
            await pg.evaluate("(i=>{ GAME.E.scene.children[i].visible=false; })(%d)" % t['i']); await pg.wait_for_timeout(1200)
            await run.shot(pg, 'gym_hide_%d_%s' % (t['i'], t['n'][:16])); await pg.evaluate("(i=>{ GAME.E.scene.children[i].visible=true; })(%d)" % t['i'])
        for z, h in (('dorm', 20.5), ('library_hall', 20.5)):
            await enter(pg, z, h); run.setup('[捷徑] %s %.1f' % (z, h))
            await pg.evaluate("(()=>{ const C=GAME.E.cam; C.distTarget=5.2; C.pitch=0.22; C.manualT=600; })()")
            await pg.wait_for_timeout(3000); await closephone(pg); await run.shot(pg, '%s_same_cam' % z)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    run.finish()
asyncio.run(main())
