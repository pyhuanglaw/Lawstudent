"""BB-B 2026-10-23：LAWWW-B 11:21 清單 BB_SIS_B6_1023.md 第 37 項——公館、118 巷店面立體化（ART-GG-FACADE-3D-1023、ART-L118-FACADE-3D-1023；整合 6b2827942）。
  使用者 10-23「外觀還是很2D」「公館店面外觀也一樣醜」。看：玻璃後面是立體的店內（不是一張平面圖）、騎樓下的店不發黑、沒有閃爍、穿模；走得進的店照舊走得進；FPS 和以前差不多。
  每一區 × 早上 08:30／中午 12:30／晚上 19:30：
    - 每一間店：【捷徑】把玩家放在店前面的街上（公館：店面 z=19 外面 z=16.5；118 巷：店門往街那一側 2.5 m），鏡頭從街這一側對著店面拍一張；
    - 量畫面：店面那一塊的平均亮度（騎樓下發黑＝很暗）、同一個位置隔 1 秒再拍一張比差異（閃爍）；
    - 真的走一段：從第一間走到第三間（點地面），中間每 15 秒一張；
    - 中午那一輪：走到「進入舊路書房」（公館）按下去，進得去、再出來。
  FPS：每一區每個時段在同一個位置量 8 秒（requestAnimationFrame 次數）。也記 renderer.info（draw call、三角形）。
  判定照截圖（BB 看）；腳本只記錄數字和自動檢查（亮度、閃爍、進店）。
  不是 iPhone 實機：Playwright Chromium（SwiftShader）手機橫向 844×390、?turbo。
用法：LW_TESTS=<開發分支>/tests SHA=<sha> [SCEN=gongguan,lane118] [HOURS=8.5,12.5,19.5] python3 facade_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
from PIL import Image, ImageChops, ImageStat
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = [s for s in os.environ.get('SCEN', '').split(',') if s] or ['gongguan', 'lane118']
HOURS = [float(h) for h in os.environ.get('HOURS', '8.5,12.5,19.5').split(',')]
def say(*a): print(' '.join(str(x) for x in a), flush=True)
def J(x, n=600): return json.dumps(x, ensure_ascii=False, default=str)[:n]

ANCH = """(zone=>{ const E=GAME.E, out=[];
  if(zone==='gongguan'){ E.scene.traverse(o=>{ if(o.userData&&o.userData.ggShop){ const p=new THREE.Vector3(); o.getWorldPosition(p); out.push({id:o.userData.ggShop, x:+p.x.toFixed(2), z:+p.z.toFixed(2)}); } });
    const seen={}; return out.filter(a=>seen[a.id]?false:(seen[a.id]=1)).sort((a,b)=>a.x-b.x).map(a=>Object.assign(a,{sx:a.x, sz:16.5, yaw:Math.PI})); }
  for(const it of (E.interactables||[])){ if(!(it.exit&&String(it.exit.to||'').startsWith('l118_'))) continue;
    let best=null; for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){ let ok=0; for(let k=1;k<=6;k++){ if(E.nav&&E.nav.free(it.x+dx*k*0.5,it.z+dz*k*0.5)) ok++; } if(!best||ok>best.ok) best={dx,dz,ok}; }
    const sx=it.x+best.dx*2.5, sz=it.z+best.dz*2.5; out.push({id:it.exit.to, label:it.label, x:+it.x.toFixed(2), z:+it.z.toFixed(2), sx:+sx.toFixed(2), sz:+sz.toFixed(2), yaw:Math.atan2(best.dx,best.dz)}); }
  return out.sort((a,b)=>a.x-b.x||a.z-b.z); })"""
PLACE = "(([x,z,yaw])=>{ const E=GAME.E, P=E.player; if(E.placeAt) E.placeAt(P,x,z); else P.obj.position.set(x,0,z); P.obj.rotation.y=yaw+Math.PI; const c=E.cam; c.yaw=yaw; c.manualT=60; if(c.distTarget<4) c.distTarget=4.5; })"   # E.placeAt 第 4 個參數是樓層（不是朝向）
FPS = """(ms=>new Promise(r=>{ let n=0; const t0=performance.now(); const f=()=>{ n++; if(performance.now()-t0<ms) requestAnimationFrame(f); else { const R=GAME.E.renderer; r({fps:+(n*1000/(performance.now()-t0)).toFixed(2), calls:R.info.render.calls, tris:R.info.render.triangles}); } }; requestAnimationFrame(f); }))"""

ART = os.environ.get('ART')   # 美術模式：藏 HUD 和主角、鏡頭拉遠壓低，整個店面入鏡；改前／改後同角度對照用（不量 FPS、不走路）
ART_IDS = {'gongguan': ['G02', 'G03', 'G04', 'G05', 'G06', 'G08', 'G12', 'G13']}   # 公館挑 LAWWW2 README 列的新店種（書房、便利商店、藥局、滷味、腳踏車行、麵店、唱片、文具）；118 巷全部
HIDEUI = """(on=>{ const cv=GAME.E.renderer.domElement; for(const e of document.body.children){ if(e===cv||e.contains(cv)) continue; e.style.visibility=on?'hidden':''; }
  if(cv.parentElement&&cv.parentElement!==document.body) for(const e of cv.parentElement.children){ if(e!==cv) e.style.visibility=on?'hidden':''; }
  GAME.E.player.obj.visible=!on; })"""
ACAM = "(([yaw,dist,pitch])=>{ const c=GAME.E.cam; c.yaw=yaw; c.distTarget=dist; c.dist=dist; c.pitch=pitch; c.manualT=60; })"

def lum_box(path, box=(0.2, 0.12, 0.8, 0.75)):
    im = Image.open(path).convert('L'); w, h = im.size
    c = im.crop((int(w * box[0]), int(h * box[1]), int(w * box[2]), int(h * box[3])))
    return round(ImageStat.Stat(c).mean[0], 1)

def diff(p1, p2):
    a = Image.open(p1).convert('L'); b = Image.open(p2).convert('L')
    d = ImageChops.difference(a, b); s = ImageStat.Stat(d)
    big = sum(1 for v in d.getdata() if v > 60) / (a.size[0] * a.size[1])
    return round(s.mean[0], 2), round(big, 4)

async def main():
    run = L.Run('facade', OUT); base = json.load(open(SAVE, encoding='utf-8')); res = {}
    async with async_playwright() as p:
        for zone in SCEN:
            for h in HOURS:
                tag = '%s_%02d%02d' % (zone, int(h), int(round((h % 1) * 60)))
                say('== %s（%s）' % (tag, os.environ.get('SHA', '?')))
                b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
                r = res.setdefault(tag, {})
                try:
                    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
                    st = json.loads(json.dumps(base)); G = st.get('G', st); d = await pg.evaluate("STORY.dayOfKey('2025-10-08')")
                    G.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'weather': 'clear', 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
                    await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(9000)
                    run.setup('[前置／捷徑] %s：使用者存檔改到 2025-10-08（三）%.2f %s、晴天；店前面的位置用 placeAt 放、鏡頭轉向店面' % (tag, h, zone))
                    info = await pg.evaluate("(()=>({zone:GAME.G.zone, glb:Object.keys(ASSETS.manifest).filter(k=>/gongguan_shops|lane118_street/.test(k)), loaded:(()=>{ let n=0; GAME.E.scene.traverse(o=>{ if(o.isMesh&&o.material&&/wz_in_/.test(String((o.material.name||'')))) n++; }); return n; })()}))()")
                    r['info'] = info; say('   %s' % J(info))
                    run.check('%s：在 %s、立體店內的網格（材質 wz_in_*）有載進來' % (tag, zone), info['zone'] == zone and info['loaded'] > 0, J(info))
                    A = await pg.evaluate(ANCH + "(%s)" % json.dumps(zone)); r['anchors'] = A; say('   店 %d 間：%s' % (len(A), J([a['id'] for a in A], 300)))
                    if ART:
                        sel = [a for a in A if a['id'] in ART_IDS[zone]] if zone in ART_IDS else A
                        for a in sel:
                            await pg.evaluate(PLACE + "(%s)" % json.dumps([a['sx'], a['sz'], a['yaw']]))
                            await pg.evaluate(ACAM + "(%s)" % json.dumps([a['yaw'], 7.0, 0.1])); await pg.evaluate(HIDEUI + "(true)"); await pg.wait_for_timeout(3500)
                            await run.shot(pg, 'art_%s_%s' % (tag, a['id']))
                            await pg.evaluate(ACAM + "(%s)" % json.dumps([a['yaw'] + 0.55, 5.0, 0.05])); await pg.wait_for_timeout(2500)
                            await run.shot(pg, 'art_%s_%s_side' % (tag, a['id']))
                            await pg.evaluate(HIDEUI + "(false)")
                        r['art'] = [a['id'] for a in sel]; say('   美術模式拍了：%s' % r['art'])
                        run.check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3]))
                        continue
                    if A:
                        await pg.evaluate(PLACE + "(%s)" % json.dumps([A[len(A) // 2]['sx'], A[len(A) // 2]['sz'], A[len(A) // 2]['yaw']])); await pg.wait_for_timeout(3000)
                        f = await pg.evaluate(FPS + "(8000)"); r['fps'] = f; say('   FPS（中間那間店前面 8 秒）：%s' % J(f))
                    dark, flick = [], []
                    for a in A:
                        await pg.evaluate(PLACE + "(%s)" % json.dumps([a['sx'], a['sz'], a['yaw']])); await pg.wait_for_timeout(2600)
                        p1 = await run.shot(pg, '%s_%s' % (tag, a['id'])); await pg.wait_for_timeout(1000)
                        p2 = os.path.join(OUT, '_%s_%s_b.png' % (tag, a['id'])); await pg.screenshot(path=p2)
                        lu = lum_box(p1); dm, big = diff(p1, p2); a.update({'lum': lu, 'diff': dm, 'big': big})
                        if lu < 45: dark.append([a['id'], lu])
                        if big > 0.02: flick.append([a['id'], dm, big])
                    say('   每間店（亮度／隔一秒差異）：%s' % J([[a['id'], a.get('lum'), a.get('diff'), a.get('big')] for a in A], 1500))
                    run.check('%s：店面那一塊不發黑（平均亮度 ≥ 45；記錄：%s）' % (tag, J(dark)), not dark, J(dark))
                    run.check('%s：同一個位置隔一秒，畫面沒有大片變化（閃爍；大差異像素 ≤ 2%%）' % tag, not flick, J(flick))
                    if len(A) >= 3:   # 真的走一段：第一間 → 第三間
                        await pg.evaluate(PLACE + "(%s)" % json.dumps([A[0]['sx'], A[0]['sz'], A[0]['yaw']])); await pg.wait_for_timeout(2000)
                        t0 = time.time(); k = 0
                        ok = await L.go_to(pg, cdp, run, A[2]['sx'], A[2]['sz'], 0.8, '第三間店前面', max_s=240)
                        await run.shot(pg, '%s_walk_end' % tag)
                        r['walk'] = {'ok': bool(ok), 's': round(time.time() - t0)}
                        run.check('%s：沿街走得過去（第一間 → 第三間，點地面）' % tag, bool(ok), J(r['walk']))
                    if zone == 'gongguan' and abs(h - 12.5) < 0.01:
                        it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.label==='進入舊路書房'); return it?[it.x,it.z]:null; })()")
                        ok = bool(it) and await L.go_to(pg, cdp, run, it[0], it[1], 1.2, '舊路書房門口', max_s=240)
                        lab = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()")
                        if ok and '舊路書房' in lab:
                            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(8000)
                        z2 = await pg.evaluate("GAME.G.zone"); await run.shot(pg, '%s_enter_bookstore' % tag)
                        r['enter'] = {'door': it, 'lab': lab, 'zone': z2}
                        run.check('%s：走得進的店照舊走得進（舊路書房）' % tag, z2 == 'bookstore', J(r['enter']))
                    run.check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3]))
                except Exception as e:
                    say('   例外：%r' % e); run.check('%s：跑完' % tag, False, repr(e)[:300])
                finally:
                    json.dump(res, open(os.path.join(OUT, 'facade.json'), 'w'), ensure_ascii=False, indent=1, default=str)
                    try: await asyncio.wait_for(b.close(), 30)
                    except Exception: pass
    run.finish()
asyncio.run(main())
