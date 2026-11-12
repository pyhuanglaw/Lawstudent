"""CC 校園定點截圖（11-10 LAWWW dcc9276f8：X283 CAMPUS-FLOOR-STRIP-1110 路緣長條、X285 AVENUE-FAR-SIGNS-1110 遠景看板；改前 e73888074c／改後 dcc9276f8 同一支）。
【前置／捷徑】讀使用者存檔（FIX，預設遊戲 repo tests/fixtures/user_save_day51b_1110.json），區域、時間改成 VIEW 指定的、玩家擺到那一點；條件事件關掉；
鏡頭：遊戲鏡頭直接擺 yaw／距離（和使用者截圖同一個角度，不是玩家流程）＋（有給 look 的）另一台相機 render 看遠處。只截圖、記鏡頭與畫面，判斷給 BB。
VIEWS（+ 分隔；佇列 ENV 裡不能用分號）：name:zone:x:z:hour:camYawRad:dist[:lx:ly:lz:fov[:ch]]——lx/ly/lz 有給＝另一台相機從玩家位置高 ch m（預設 1.6＝頭；BB-C 08:44 聯通店員側面要「腰的高度」＝1.0）看那一點、fov 度。
CC_02 清單 2026-11-12：1✓（時間＝VIEW 指定） 2✓（位置、相機照 VIEW；人物位置從遊戲讀） 3✓（每個 VIEW 各讀一次檔） 4n/a（不按按鈕） 5n/a（不走路，讀檔放位置） 6✓（讀檔後等素材） 7✓ 8n/a（不判，圖給 BB） 9✓（另一台相機只藏玩家自己） 10✓（條件事件關掉） 11✓ 12✓（記鏡頭、玩家位置、區域、時間） 13✓（【前置／捷徑】寫在檔頭；BB-C 08:44 加相機高度 ch）
Playwright／SwiftShader ≠ iPhone。用法：LW_TESTS=<wt>/tests TAG=old|new VIEWS=... python3 cc_campus_view_shot_probe.py <url> <out>"""
import os, sys, json, asyncio, base64
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
FIX = os.environ.get('FIX') or 'tests/fixtures/user_save_day51b_1110.json'; TAG = os.environ.get('TAG') or 'x'
VIEWS = [v.split(':') for v in (os.environ.get('VIEWS') or 'curb:campus:29.9:-54.4:18.4:0.82:6').replace(';', '+').split('+') if v]   # 11-10：PC 佇列的 ENV 用 ; 分欄，多個 VIEW 要用 + 分（r1 只跑到第一個）
R = L.Run('campus_view_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
CAM = "(()=>{ const C=GAME.E.cam, c=GAME.E.camera.position, P=GAME.E.player.obj.position; return {yaw:+C.yaw.toFixed(3), dist:+C.dist.toFixed(2), cam:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], player:[+P.x.toFixed(2),+P.y.toFixed(2),+P.z.toFixed(2)], zone:GAME.G.zone, hour:+GAME.G.hour.toFixed(2)}; })()"
SNAP_JS = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov, c.width/c.height, 0.1, 2000);
  cam.position.set(a.from[0],a.from[1],a.from[2]); cam.lookAt(a.at[0],a.at[1],a.at[2]); cam.updateMatrixWorld(true);
  const pv=E.player.obj.visible; E.player.obj.visible=false; try{ r.render(E.scene,cam); } finally { E.player.obj.visible=pv; } return c.toDataURL('image/png'); })"""   # 11-10 r2：另一台相機在玩家頭的位置＝會拍到自己的頭（XSPLANT north／gate），拍的時候藏玩家
CLOSE = "(()=>{ const d=document.querySelector('#dlg'); return !!(d && d.offsetParent!==null && getComputedStyle(d).display!=='none'); })()"


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 校園定點截圖：worktree %s；TAG %s；Playwright ≠ iPhone' % (real or '?', TAG), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        sv0 = await pg.evaluate("fetch(%s).then(r=>r.ok?r.json():null)" % J(FIX))
        if not R.check('讀得到存檔 %s' % FIX, bool(sv0), ''): await b.close(); return
        res = {}
        for v in VIEWS:
            name, zone, x, z, hour, yaw, dist = v[0], v[1], float(v[2]), float(v[3]), float(v[4]), float(v[5]), float(v[6])
            sv = json.loads(json.dumps(sv0)); sv['zone'] = zone; sv['hour'] = hour; sv['weather'] = 'clear'; sv['pos'] = {'x': x, 'z': z, 'yaw': 0.0, 'lv': 0}
            R.setup('【前置／捷徑】讀使用者存檔 %s（day %s），改 %s %.2f 時、站 (%s, %s)；鏡頭直接擺 yaw %s rad、距離 %s' % (FIX, sv0.get('day'), zone, hour, x, z, yaw, dist))
            await pg.evaluate("(async(s)=>{ document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; await GAME.applySave(s); })", sv)
            await pg.wait_for_timeout(9000); await L.close_panels(pg, cdp)
            for _ in range(10):
                if not await pg.evaluate(CLOSE): break
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700)
            await pg.evaluate("a=>{ const C=GAME.E.cam; C.yaw=a[0]; C.distTarget=a[1]; C.dist=a[1]; C.manualT=60; }", [yaw, dist]); await pg.wait_for_timeout(4000)
            s = await pg.evaluate(CAM); R.note('%s：%s' % (name, J(s))); res[name] = s
            R.check('%s 在 %s、玩家在 (%s, %s) 0.6 m 內' % (name, zone, x, z), s['zone'] == zone and abs(s['player'][0] - x) < 0.6 and abs(s['player'][2] - z) < 0.6, J(s))
            await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(400)
            await pg.screenshot(path=os.path.join(OUT, 'cv_%s_%s.png' % (TAG, name)))
            if len(v) >= 11:
                lx, ly, lz, fov = float(v[7]), float(v[8]), float(v[9]), float(v[10])
                ch = float(v[11]) if len(v) >= 12 else 1.6
                url = await pg.evaluate(SNAP_JS, {'from': [s['player'][0], s['player'][1] + ch, s['player'][2]], 'at': [lx, ly, lz], 'fov': fov})
                open(os.path.join(OUT, 'cv_%s_%s_far.png' % (TAG, name)), 'wb').write(base64.b64decode(url.split(',', 1)[1]))
                R.note('%s 另一台相機：玩家位置高 %s m → (%s, %s, %s) fov %s' % (name, ch, lx, ly, lz, fov))
            await pg.evaluate(D.HUD + '(true)')
        json.dump(res, open(os.path.join(OUT, 'campus_view_%s.json' % TAG), 'w'), ensure_ascii=False, indent=1)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
