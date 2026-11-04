"""CC-C（帳號 C）11-04：SITAMB ⑧ 對照（BB-C 17:10 P1）——博思 101 的替身（遠處座位的低成本坐姿人物）頭上有深色方塊，是不是 2acb34afd（NPC-AMBIENT-ANIM-1104）帶進來的。
  拍三組，同一個鏡頭、同一個時間（day 7＝2025-09-23 國文上課中 09:30；主迴圈暫停、時刻固定、手動畫一幀）：
    d3828（含 2acb）原樣、d3828?nositamb、e2ff17c40（2acb34afd 的第一個父 commit，沒有 2acb）原樣。
  鏡頭照「替身群組」所有替身的位置範圍算（三個 SHA 的座位一樣，算出來的鏡頭也一樣；每張都印出來核對）：
    side＝側面低角度（同 SITAMB 的 boya_feet）、back＝最後一排後上方往講台、front＝講台那一端往後排。
  另外記：替身用的是哪一種模型（seated_figures.glb 的 InstancedMesh；每種外型的名稱、個數、三角形、材質）、桌上小物（desk_props.glb 的 desk:<組>）；
    再拍一張 back_nodesk＝【捷徑】把 desk:* 藏起來（診斷用，不是遊戲畫面）：方塊不見了＝方塊是桌上小物。
  只截圖、記數字，不判（BB 判：三張都有＝本來就有、不擋；只有含 2acb 的有＝擋）。SwiftShader 看有沒有方塊，不看顏色。
  檔名有 cc_sitamb_probe（V20R 雲端備援的等待條件看這個名字）。
用法：LW_TESTS=<wt>/tests TAG=<名稱> [NEAR=1＝玩家移到替身中間，換成近處版本] python3 cc_sitamb_probe_d8.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
TAG = os.environ.get('TAG') or 'run'
J = lambda o: json.dumps(o, ensure_ascii=False)
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


HUD = """(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
MESHN = "(()=>{ let n=0; const z=GAME.E.zone; if(z&&z.group) z.group.traverse(o=>{ if(o.isMesh) n++; }); return n; })()"
FIG = r"""(()=>{ const z=GAME.E.zone; if(!z||!z.group) return null; const gs=[]; GAME.E.scene.traverse(o=>{ if(/^seated_figures:/.test(o.name||'')) gs.push(o); });
  const M=new THREE.Matrix4(), V=new THREE.Vector3();
  const groups=gs.map(g=>{ g.updateMatrixWorld(true); const b=new THREE.Box3(), ims=[];
    for(const im of g.children){ if(!im.isInstancedMesh) continue; for(let i=0;i<im.count;i++){ im.getMatrixAt(i,M); V.setFromMatrixPosition(M).applyMatrix4(g.matrixWorld); b.expandByPoint(V); }
      const m=im.material, geo=im.geometry, tris=geo?Math.round((geo.index?geo.index.count:geo.attributes.position.count)/3):0;
      ims.push({name:im.name, count:im.count, visible:im.visible, tris, mat:m?{name:m.name||'', color:m.color?'#'+m.color.getHexString():null, map:!!m.map, transparent:!!m.transparent}:null}); }
    let par=[]; for(let p=g.parent;p&&par.length<3;p=p.parent) par.push(p.name||p.type);
    return {name:g.name, parents:par, box:b.isEmpty()?null:{min:b.min.toArray().map(v=>+v.toFixed(2)), max:b.max.toArray().map(v=>+v.toFixed(2))}, ims}; });
  return {groups, fig:(typeof CLS!=='undefined'&&CLS.figState)?CLS.figState():null, npcs:GAME.E.npcs.filter(n=>n.seat).length, sitamb:typeof CHAR!=='undefined'&&!!CHAR.sitAmbFidget, nositamb:/nositamb/.test(location.search)}; })()"""
AIM = """(([e,l,h,seed])=>{ const E=GAME.E, G=GAME.G, cam=E.camera; E.paused=true; window.__ccSeed&&window.__ccSeed(seed); G.hour=h; E.hour=h; if(E.applyTime) E.applyTime(h); E.time=100; E._shT=0;
  E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l));
  for(let i=0;i<3;i++){ E.update(1/60); cam.position.set(...e); E.cam.look=new THREE.Vector3(...l); cam.lookAt(E.cam.look); cam.updateMatrixWorld(); }
  E._shT=0; E.render(); const ri=E.renderer.info.render; return {calls:ri.calls, tris:ri.triangles}; })"""
DESK = """(on=>{ let n=0; GAME.E.scene.traverse(o=>{ if(o.isInstancedMesh&&/^desk:/.test(o.name||'')){ if(on){ if(o.userData.__ccDesk){ o.visible=true; o.userData.__ccDesk=false; n++; } } else if(o.visible){ o.visible=false; o.userData.__ccDesk=true; n++; } } }); return n; })"""


async def main():
    os.makedirs(OUT, exist_ok=True)
    seed = 1104
    print('CC SITAMB ⑧ 替身對照：%s；%s；SwiftShader／Windows＋GPU ≠ iPhone（看有沒有方塊，不看顏色）' % (TAG, URL), flush=True)
    meta = {'tag': TAG, 'url': URL}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, seed)
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if not ok:
            await b.close(); print('FAILED 1: 遊戲載入', flush=True); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        await pg.set_viewport_size({'width': 1280, 'height': 720}); await pg.wait_for_timeout(800)
        print('  [前置／捷徑] 讀檔：博思 101（boya）、day 7（2025-09-23 週二，國文 09:10～12:10）09:30、晴、條件事件關閉', flush=True)
        await L.load_state(pg, {'zone': 'boya', 'hour': 9.5, 'day': 7, 'weekday': 2, 'weather': 'clear'}, quiet_events=True)
        t1 = time.time(); last = -1; st = 0; fg = None
        while time.time() - t1 < 150:
            await pg.wait_for_timeout(1000)
            if not await pg.evaluate("GAME.G.zone==='boya'"): continue
            n = await pg.evaluate(MESHN); fg = await pg.evaluate(FIG)
            ready = bool(fg and fg['groups'] and all(g['box'] for g in fg['groups']))
            st = st + 1 if (n == last and ready) else 0; last = n
            if st >= 5: break
        await L.close_panels(pg, cdp)
        meta['fig'] = fg
        if not check('讀到博思 101、替身放好了', bool(fg and fg['groups'] and fg['groups'][0]['box']), J(fg and fg.get('fig'))):
            await b.close(); json.dump(meta, open(os.path.join(OUT, 'd8_%s.json' % TAG), 'w', encoding='utf-8'), ensure_ascii=False, indent=1); sys.exit(1)
        for g in fg['groups']:
            print('  替身群組 %s（放在 %s）：範圍 %s～%s' % (g['name'], ' < '.join(g['parents']), g['box']['min'], g['box']['max']), flush=True)
            for im in g['ims']: print('    %s ×%d（%s）%d 面、材質 %s' % (im['name'], im['count'], '顯示' if im['visible'] else '不顯示', im['tris'], J(im['mat'])), flush=True)
        print('  完整人物坐著 %d 人；CHAR.sitAmbFidget %s；網址 nositamb＝%s；figState %s' % (fg['npcs'], fg['sitamb'], fg['nositamb'], J(fg['fig'])), flush=True)
        mn = [min(g['box']['min'][i] for g in fg['groups']) for i in range(3)]; mx = [max(g['box']['max'][i] for g in fg['groups']) for i in range(3)]
        cx, cz = (mn[0] + mx[0]) / 2, (mn[2] + mx[2]) / 2
        cams = [('side', [round(mn[0] - 1.2, 2), round(mn[1] + 0.7, 2), round(cz, 2)], [round(cx, 2), round(mn[1] + 0.9, 2), round(cz, 2)], '側面低角度（同 boya_feet）'),
                ('back', [round(cx, 2), round(mx[1] + 3.0, 2), round(mx[2] + 2.0, 2)], [round(cx, 2), round(mn[1] + 0.8, 2), round(cz, 2)], '+z 那一端的上方往另一端'),
                ('front', [round(cx, 2), round(mx[1] + 3.0, 2), round(mn[2] - 2.0, 2)], [round(cx, 2), round(mn[1] + 0.8, 2), round(cz, 2)], '−z 那一端的上方往另一端')]
        meta['box'] = {'min': mn, 'max': mx}
        if os.environ.get('NEAR') == '1':   # 【捷徑】玩家移到替身範圍中間（7 m 內＝替身換成近處的 LOD0；figTick 每 0.5 秒照玩家位置換），看方塊是不是遠處版本（_lod1）才有
            await pg.evaluate("(([x,z])=>{ const o=GAME.E.player.obj; o.position.x=x; o.position.z=z; GAME.E.paused=false; })(%s)" % J([cx, cz]))
            await pg.wait_for_timeout(3000); fg2 = await pg.evaluate(FIG); meta['fig_near'] = fg2
            print('  【捷徑】玩家移到 (%.2f, %.2f)：顯示中的替身 %s' % (cx, cz, J([[im['name'], im['count']] for g in fg2['groups'] for im in g['ims'] if im['count']])), flush=True)
        await pg.evaluate("GAME.E.player.obj.visible=false"); await pg.evaluate(HUD + '(false)')
        meta['shots'] = {}
        for k, (name, e, l, note) in enumerate(cams):
            ri = await pg.evaluate(AIM + '(%s)' % J([e, l, 9.5, seed + k]))
            fn = 'd8_%s_%s.jpg' % (TAG, name)
            await pg.screenshot(path=os.path.join(OUT, fn), type='jpeg', quality=90)
            meta['shots'][fn] = dict(ri, cam=e, look=l, note=note)
            print('  %s：鏡頭 %s → %s、calls %s、tris %s｜%s' % (fn, e, l, ri['calls'], ri['tris'], note), flush=True)
        nd = await pg.evaluate(DESK + '(false)')
        for name, e, l, note in cams[1:2]:
            ri = await pg.evaluate(AIM + '(%s)' % J([e, l, 9.5, seed + 1]))
            fn = 'd8_%s_%s_nodesk.jpg' % (TAG, name)
            await pg.screenshot(path=os.path.join(OUT, fn), type='jpeg', quality=90)
            meta['shots'][fn] = dict(ri, cam=e, look=l, note='【捷徑】藏起桌上小物 desk:*（%d 個 InstancedMesh）——診斷用，不是遊戲畫面' % nd)
            print('  %s：【捷徑】藏起 desk:* %d 個、calls %s、tris %s' % (fn, nd, ri['calls'], ri['tris']), flush=True)
        await pg.evaluate(DESK + '(true)')
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(meta, open(os.path.join(OUT, 'd8_%s.json' % TAG), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
