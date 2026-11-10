"""CC X307 總圖 B1 下沉中庭（LIB-B1-COURT-ART-1110；LAWWW 10df264ed，改前 e73888074）——BB 08:35：判 ART（D120）要截圖＋走得進出＋近一點的地面。
從 lawww_b1court_shot_probe（LAWWW-B）複製改的：
 ① 截圖（【前置／捷徑】讀檔放到那一點、條件事件關掉；鏡頭直接擺 yaw）：白天 14:30、晚上 20:00 × 樓梯口往下看（88,−40）／中庭底往北看樓梯（98,−33）／中庭底往南看 B1 門（98,−37）
    ＋地面近照（中庭中間 (98,−36)，鏡頭距離 1.6、往下看）：D112 地板不能是深色木頭——同時用射線讀腳下那塊網格的名字、材質名、顏色貼圖平均色
 ② 真的走（白天）：【前置／捷徑】讀檔放在地面樓梯口 (88,−40) → L.go_to 走下樓梯到 B1 門前 (98,−32.2) → 互動鍵「進 B1」→ 按 → library_b1
    → 在 B1 裡找往中庭／校園的出口 → 走過去按 → 回到校園、站在中庭（y≈−4.2）→ 走上樓梯回到地面 (88,−42)；全程 GAME.walkFallbacks 不能增加（要 0）
Playwright／SwiftShader ≠ iPhone。用法：LW_TESTS=<wt>/tests TAG=old|new python3 cc_b1court_art_probe.py <url> <out>"""
import os, sys, json, asyncio, math, base64
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cc_d141_lib as DL
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'; WALK = os.environ.get('WALK', '1') == '1'
BF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheInvite': True, 'zheNoodleDone': True}
VIEWS = [('top_mouth', {'x': 88, 'z': -40}, 1.5708, None), ('top_mouth_in', {'x': 88, 'z': -40}, -1.5708, 7.0), ('bottom_door_far', {'x': 98, 'z': -38}, 3.1416, 6.0), ('bottom_north', {'x': 98, 'z': -33}, 3.1416, None), ('bottom_south', {'x': 98, 'z': -37}, 0.0, None), ('floor_close', {'x': 98, 'z': -36}, 0.6, 1.6)]
J = lambda o: json.dumps(o, ensure_ascii=False)
ST = "(()=>{ const P=GAME.E.player.obj.position, ib=document.getElementById('interact'); return {zone:GAME.G.zone, x:+P.x.toFixed(2), y:+P.y.toFixed(2), z:+P.z.toFixed(2), lv:GAME.E.player.lv|0, fb:GAME.walkFallbacks|0, interact:ib&&ib.offsetParent!==null?(ib.textContent||'').trim():''}; })()"
FLOOR = r"""(()=>{ const E=GAME.E, P=E.player.obj.position, rc=new THREE.Raycaster(new THREE.Vector3(P.x+0.6,P.y+1.5,P.z+0.6), new THREE.Vector3(0,-1,0)); rc.far=3;
  const isP=o=>{ for(let q=o;q;q=q.parent) if(q===E.player.obj) return true; return false; }; const vis=o=>{ for(let q=o;q;q=q.parent) if(!q.visible) return false; return true; };
  const ms=[]; E.scene.traverse(o=>{ if(o.isMesh&&!o.isSkinnedMesh&&vis(o)&&!isP(o)) ms.push(o); }); const all=rc.intersectObjects(ms,false); const info=all.slice(0,5).map(x=>{ const mm=[].concat(x.object.material)[(x.face&&x.face.materialIndex)||0]; return {mesh:x.object.name||'(無名)',parent:x.object.parent&&x.object.parent.name||'',mat:mm&&mm.name||'',type:mm&&mm.type,map:!!(mm&&mm.map),colorWrite:mm?mm.colorWrite:null,opacity:mm?mm.opacity:null,y:+x.point.y.toFixed(3)}; });
  /* 11-10 r1：第一個打到的是沒有貼圖、白色、沒名字的網格（看不見的地板／碰撞面）→ 跳過沒有 map 又 colorWrite false 或 opacity<0.05 的；再優先取有 map 的 */
  const ok=all.filter(x=>{ const mm=[].concat(x.object.material)[(x.face&&x.face.materialIndex)||0]; return mm&&mm.colorWrite!==false&&!(mm.transparent&&mm.opacity<0.05)&&mm.visible!==false; });
  const h=ok.find(x=>{ const mm=[].concat(x.object.material)[(x.face&&x.face.materialIndex)||0]; return mm&&mm.map; })||ok[0]; if(!h) return {hits:info};
  const m=[].concat(h.object.material)[(h.face&&h.face.materialIndex)||0]; let avg=null; const img=m&&m.map&&m.map.image;
  if(img&&img.width){ try{ const c=document.createElement('canvas'); c.width=32; c.height=32; const x=c.getContext('2d'); x.drawImage(img,0,0,32,32); const d=x.getImageData(0,0,32,32).data; let r=0,g=0,b=0; for(let i=0;i<d.length;i+=4){ r+=d[i]; g+=d[i+1]; b+=d[i+2]; } const n=d.length/4; avg=[r/n|0,g/n|0,b/n|0]; }catch(e){ avg='err'; } }
  return {hits:info, mesh:h.object.name||'(無名)', parent:h.object.parent&&h.object.parent.name||'', mat:m&&m.name||'', color:m&&m.color?'#'+m.color.getHexString():null, mapAvg:avg, y:+h.point.y.toFixed(2)}; })()"""
TOP_JS = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(50, c.width/c.height, 0.1, 400);
  cam.position.set(a[0],a[1],a[2]+0.01); cam.up.set(0,0,-1); cam.lookAt(a[0],-4.2,a[2]); cam.updateMatrixWorld(true); r.render(E.scene,cam); return c.toDataURL('image/png'); })"""
# 白霧量化：畫面下半部（玩家腳下以下）的平均亮度、標準差（白霧＝很亮、對比很低）
HAZE = r"""(()=>{ const c=GAME.E.renderer.domElement; GAME.E.renderer.render(GAME.E.scene,GAME.E.camera); const w=96,h=54, cv=document.createElement('canvas'); cv.width=w; cv.height=h; const x=cv.getContext('2d'); x.drawImage(c,0,0,w,h);
  const d=x.getImageData(0,Math.floor(h*0.62),w,h-Math.floor(h*0.62)).data; let s=0,s2=0,n=0; for(let i=0;i<d.length;i+=4){ const l=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]; s+=l; s2+=l*l; n++; } const m=s/n; return {mean:+m.toFixed(1), std:+Math.sqrt(Math.max(0,s2/n-m*m)).toFixed(1)}; })()"""
HUD = "(on=>{ const ids=['hud','minimap','joy','interact','btnPhone','menuBtn','topbar','goalbar']; for(const i of ids){ const e=document.getElementById(i); if(e) e.style.visibility=on?'':'hidden'; } })"


async def main():
    run = L.Run('cc_b1court_art_' + TAG, OUT)
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC X307 B1 中庭：worktree %s；TAG %s；Playwright ≠ iPhone' % (real or '?', TAG), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not run.check('遊戲載入', await L.wait_loaded(pg)): await b.close(); return run.finish()
        for hour, tag in ((14.5, 'day'), (20.0, 'night')):
            for name, pos, yaw, dist in VIEWS:
                run.setup('【前置／捷徑】讀檔：9/26 %s 校園 %s；鏡頭直接擺 yaw %s%s' % (hour, pos, yaw, ('、距離 %s' % dist) if dist else ''))
                await L.load_state(pg, {'zone': 'campus', 'hour': hour, 'day': 10, 'weekday': 5, 'weather': 'sunny', 'pos': dict(pos, yaw=yaw), 'flags': BF}, quiet_events=True)
                await pg.wait_for_timeout(7000)
                await pg.evaluate("a=>{ const C=GAME.E.cam; C.yaw=a[0]; if(a[1]){ C.distTarget=a[1]; C.dist=a[1]; } C.manualT=30; }", [yaw, dist]); await pg.wait_for_timeout(3000)
                s = await pg.evaluate(ST); want = 0 if name.startswith('top_mouth') else -4.2
                run.check('%s %s：站的高度 %s' % (tag, name, want), abs(s['y'] - want) < 0.05, J(s))
                if name == 'floor_close':
                    f = await pg.evaluate(FLOOR); run.note('%s 地面（腳邊射線）：%s' % (tag, J(f)))
                    if f and f.get('mapAvg') and f['mapAvg'] != 'err':
                        r_, g_, b_ = f['mapAvg']; lum = 0.299 * r_ + 0.587 * g_ + 0.114 * b_; woodish = r_ > b_ + 25 and r_ > g_ and lum < 110
                        run.check('%s 地面不是深色木頭（D112；貼圖平均色 %s、亮度 %.0f；名字有 wood／木 也算）' % (tag, f['mapAvg'], lum), not woodish and not any(k in (f['mat'] + f['mesh']).lower() for k in ('wood', '木')), J(f))
                if 'bottom' in name:
                    hz = await pg.evaluate(HAZE); run.note('%s %s 畫面下半部亮度 %s（白霧＝平均很高、標準差很低）' % (tag, name, J(hz)))
                    if os.environ.get('EXPECT') == 'fixed': run.check('%s %s 沒有白霧（下半部平均亮度 < 110；11-10 實測：有白霧 白天 156／晚上 128，沒有白霧 白天 78～87／晚上 25～42）' % (tag, name), hz['mean'] < 110, J(hz))   # r4 以前的門檻（<200 或 std>12）太鬆，白霧也判 PASS
                await pg.evaluate(DL.HUD + '(false)'); await pg.wait_for_timeout(300)
                await run.shot(pg, '%s_%s' % (tag, name))
                if name == 'bottom_north':   # 中庭正上方俯視（另一台相機），和使用者的平面圖並排用
                    u = await pg.evaluate(TOP_JS, [98, 14, -36]); open(os.path.join(OUT, 'court_top_%s.png' % tag), 'wb').write(base64.b64decode(u.split(',', 1)[1]))
                await pg.evaluate(DL.HUD + '(true)')
        if WALK:
            run.setup('【前置／捷徑】讀檔：9/26 14:30 校園地面樓梯口 (88,−40)；之後全程真的走、真的按')
            await L.load_state(pg, {'zone': 'campus', 'hour': 14.5, 'day': 10, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': 88, 'z': -40, 'yaw': 1.5708}, 'flags': BF}, quiet_events=True)
            await pg.wait_for_timeout(7000); s0 = await pg.evaluate(ST); fb0 = s0['fb']; run.note('起點：%s' % J(s0))
            ok = await L.go_to(pg, cdp, run, 98, -32.2, 0.5, '走下樓梯到 B1 門前 (98, −32.2)', max_s=300)
            await pg.wait_for_timeout(1500); s = await pg.evaluate(ST)
            run.check('走下樓梯到 B1 門前（y≈−4.2、沒有被放到目的地）', bool(ok) and abs(s['y'] + 4.2) < 0.1 and s['fb'] == fb0, J(s))
            run.check('門前有「進 B1」', '進 B1' in s['interact'], J(s))
            await run.shot(pg, 'walk_1_door')
            if s['interact']:
                await L.tap(pg, cdp, '#interact')
                for _ in range(60):
                    if await pg.evaluate("GAME.G.zone") == 'library_b1': break
                    await pg.wait_for_timeout(500)
            await pg.wait_for_timeout(4000); s = await pg.evaluate(ST)
            run.check('按了走進 B1（library_b1）', s['zone'] == 'library_b1', J(s)); await run.shot(pg, 'walk_2_b1')
            if s['zone'] == 'library_b1':
                ex = await pg.evaluate("(()=>(GAME.E.interactables||[]).filter(i=>i.to==='campus'||/中庭|出去|校園|上樓|離開/.test(i.label||'')).map(i=>({label:i.label,to:i.to||null,x:+i.x.toFixed(2),z:+i.z.toFixed(2),lv:i.lv|0})))()")
                run.note('B1 往外的出口：%s' % J(ex))
                ex.sort(key=lambda q: 0 if q['label'].startswith('走出去') else 1)   # 11-10 r1：先挑到「中庭」（不是出口）＝TEST_BUG；出口是「走出去（總圖北側的中庭）」
                if run.check('B1 找得到往中庭的出口', bool(ex), ''):
                    e = ex[0]; ok = await L.go_to(pg, cdp, run, e['x'], e['z'], 0.6, '走到 B1 出口「%s」' % e['label'], max_s=240, lv=e['lv'])
                    await pg.wait_for_timeout(1200); s = await pg.evaluate(ST); run.note('出口前：%s' % J(s))
                    if s['interact']:
                        await L.tap(pg, cdp, '#interact')
                        for _ in range(60):
                            if await pg.evaluate("GAME.G.zone") == 'campus': break
                            await pg.wait_for_timeout(500)
                    await pg.wait_for_timeout(5000); s = await pg.evaluate(ST)
                    run.check('出得來：回到校園、站在中庭（y≈−4.2）', s['zone'] == 'campus' and abs(s['y'] + 4.2) < 0.15, J(s)); await run.shot(pg, 'walk_3_back')
                    if s['zone'] == 'campus':
                        ok = await L.go_to(pg, cdp, run, 88, -42, 0.6, '走上樓梯回到地面 (88, −42)', max_s=300)
                        await pg.wait_for_timeout(1200); s = await pg.evaluate(ST)
                        run.check('走上樓梯回到地面（y≈0）', bool(ok) and abs(s['y']) < 0.1, J(s)); await run.shot(pg, 'walk_4_up')
            s = await pg.evaluate(ST); run.check('全程 walkFallbacks 沒有增加（%s → %s）' % (fb0, s['fb']), s['fb'] == fb0, J(s))
        run.check('沒有 JS 錯誤', not errs, J(errs[:3]))
        await b.close()
    return run.finish()


sys.exit(asyncio.run(main()))
