"""CC-C（帳號 C）11-04：GG_int 美術組（BB-C 13:07；D133 左中右逐區對參考圖）——公館五間室內：青木茶室 aoki、頁間書屋 bookstore、afar、Daybreak、日和便利店 cvs。
  做法照 cc_cafe230_shot_probe.py：【前置／捷徑】讀檔到店裡的出生點（條件事件關閉）→ 等正式模型掛上（場景 mesh 數 4 秒不再變）→ 隱藏 HUD、玩家，固定鏡頭（E.cinematic）拍 8 個角度：
    door_in（門口往裡）、counter（店員／櫃台前 2.4 m）、window（窗邊往外）、back_front（後牆看店面）、left_wall、right_wall（從門口往裡看的左／右）、
    ref_east（從東端往西：臨街窗在左＝青木、afar、Daybreak、日和參考圖的方向）、ref_west（從西端往東：臨街窗在右＝頁間書屋參考圖的方向）
  角度從各店的配置算（*_LAYOUT 的 w、d、front.door、front.windows；Z3.SHOP_IN[店].clerk）；房間中心在原點、x 往東、z 往南（店面在 +z）。
  再顯示 HUD、玩家，拍一張玩家視角（出生點）。每個時段：14:00＋營業中的晚上（19:30／20:30／18:30 第一個開著的；晚上不開的店改拍早上 09:00）。也記 renderer.info（calls、tris）、鏡頭座標。
  參考圖：docs/story_planning/ref_images/shops/gongguan_{tea,book,afar,daybreak,cvs}_int.webp（企劃線）。日和便利店照 D132 不由 BB 驗，交 LAWWW2。
  這支只截圖、不判美術（BB 判）；Playwright（PC GPU／雲端 SwiftShader），不是手機實機。
用法：LW_TESTS=<wt>/tests [SHOPS=aoki,bookstore,afar,daybreak,cvs] [HOURS=14,auto] python3 cc_gg_int_art_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
FAILS = []
SHOPS = [s.strip() for s in (os.environ.get('SHOPS') or 'aoki,bookstore,afar,daybreak,cvs').split(',') if s.strip()]
HOURS = [h.strip() for h in (os.environ.get('HOURS') or '14,auto').split(',') if h.strip()]
LAYV = {'aoki': 'AOKI_LAYOUT', 'bookstore': 'YEJIAN_LAYOUT', 'afar': 'AFAR_LAYOUT', 'daybreak': 'DAYBREAK_LAYOUT', 'cvs': 'CVS_LAYOUT'}
NAME = {'aoki': '青木茶室', 'bookstore': '頁間書屋', 'afar': 'afar café', 'daybreak': 'Daybreak', 'cvs': '日和便利店'}
DAY, WD = 7, 2   # 2025-09-23（二），同 cc_gg_int_probe.py

AIM = """(async(e,l)=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=false;
  E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; return {calls:ri.calls,tris:ri.triangles}; })"""
HUD = """(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
MESHN = "(()=>{ let n=0; const z=GAME.E.zone; if(z&&z.group) z.group.traverse(o=>{ if(o.isMesh) n++; }); return n; })()"
# 配置 → 8 個角度（鏡頭位置, 看的點）。配置是 const 全域（classic script），page.evaluate 用名字讀得到
VIEWS_JS = r"""(([zone,lv])=>{ let L=null; try{ L=eval(lv); }catch(e){} if(L&&zone==='cvs'&&L.shop) L=L.shop; if(!L||!L.w||!L.d) return {err:'沒有配置 '+lv};
  const w=L.w, d=L.d, fr=L.front||{}, dx=(fr.door&&fr.door.x)||0, win=(fr.windows||[])[0];
  const SI=(typeof Z3!=='undefined'&&Z3.SHOP_IN&&Z3.SHOP_IN[zone])||{}, ck=SI.clerk||L.clerk||null;
  const V=[]; const add=(n,e,l)=>V.push([n,e.map(v=>+v.toFixed(2)),l.map(v=>+v.toFixed(2))]);
  add('door_in',[dx,1.6,d/2-0.5],[dx*0.4,1.2,-d/2]);
  if(ck){ let ux=-ck.x, uz=-ck.z; const n=Math.hypot(ux,uz)||1; ux/=n; uz/=n; add('counter',[ck.x+ux*2.4,1.55,ck.z+uz*2.4],[ck.x,1.15,ck.z]); }
  if(win){ const mx=(win[0]+win[1])/2; add('window',[mx,1.5,Math.max(-d/2+0.6,d/2-2.2)],[mx,1.2,d/2+3]); }
  add('back_front',[0,1.7,-d/2+0.45],[0,1.2,d/2]);
  add('left_wall',[w/4,1.6,0.3],[-w/2,1.25,0.3]);
  add('right_wall',[-w/4,1.6,0.3],[w/2,1.25,0.3]);
  add('ref_east',[w/2-0.35,2.0,-0.6],[-w/2,1.0,0.4]);
  add('ref_west',[-w/2+0.35,2.0,-0.6],[w/2,1.0,0.4]);
  return {w,d,h:L.h,door:dx,win:win||null,clerk:ck,spawn:L.spawn||SI.spawn||null,views:V}; })"""


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def tag_of(h): return '%02d%02d' % (int(h), int(round((h % 1) * 60)))


async def pick_hours(pg, zone):
    out = []
    for h in HOURS:
        if h != 'auto':
            out.append(float(h)); continue
        for c in (19.5, 20.5, 18.5, 9.0, 10.0):
            ok = await pg.evaluate("(([z,h,d])=>{ try{ return typeof PLACES==='undefined'||!PLACES.isOpen?true:!!PLACES.isOpen(z,h,d); }catch(e){ return true; } })(%s)" % J([zone, c, DAY]))
            if ok: out.append(c); break
    return out


async def shoot_zone(pg, cdp, zone):
    lay = await pg.evaluate(VIEWS_JS + '(%s)' % J([zone, LAYV.get(zone, '')]))
    print('== %s（%s）配置：%s' % (zone, NAME.get(zone, zone), J({k: lay.get(k) for k in ('w', 'd', 'h', 'door', 'win', 'clerk', 'spawn', 'err')})), flush=True)
    if not check('[%s] 有配置、算得出角度' % zone, not lay.get('err') and bool(lay.get('views')), J(lay.get('err'))): return {}
    sp = lay.get('spawn') or {'x': lay['door'], 'z': lay['d'] / 2 - 0.6, 'yaw': 3.1416}
    res = {'layout': {k: lay.get(k) for k in ('w', 'd', 'h', 'door', 'win', 'clerk', 'spawn')}, 'hours': {}}
    for h in await pick_hours(pg, zone):
        tag = tag_of(h)
        print('  [前置／捷徑] 讀檔：%s 出生點 (%s, %s)、2025-09-23（二）%s、條件事件關閉' % (zone, sp['x'], sp['z'], tag), flush=True)
        await L.load_state(pg, {'zone': zone, 'hour': h, 'day': DAY, 'weekday': WD, 'weather': 'clear', 'pos': {'x': sp['x'], 'z': sp['z'], 'yaw': sp.get('yaw', 3.1416), 'lv': 0}}, quiet_events=True)
        await pg.wait_for_timeout(2000)
        zin = await pg.evaluate("GAME.G.zone===%s" % J(zone))
        if not check('[%s %s] 讀檔進到區域' % (zone, tag), zin, await pg.evaluate("GAME.G.zone")): continue
        n0 = await pg.evaluate(MESHN); last = n0; stable = 0; t0 = time.time()
        while time.time() - t0 < 90:
            await pg.wait_for_timeout(1000); n = await pg.evaluate(MESHN)
            if n != last: last = n; stable = 0
            else: stable += 1
            if stable >= 4: break
        mats = await pg.evaluate("(()=>{ const z=GAME.E.zone; const s=new Set(); z.group.traverse(o=>{ if(o.isMesh&&o.material&&o.material.name) s.add(o.material.name); }); return [...s]; })()")
        print('  [%s %s] 場景 mesh %d → %d（%.0f 秒穩定）；材質 %d 種：%s' % (zone, tag, n0, last, time.time() - t0, len(mats), J(mats[:30])), flush=True)
        await L.close_panels(pg, cdp)
        await pg.evaluate(HUD + '(false)')
        hv = {}
        for name, e, l in lay['views']:
            ri = await pg.evaluate(AIM + '(%s,%s)' % (J(e), J(l)))
            await pg.wait_for_timeout(600)
            await pg.screenshot(path=os.path.join(OUT, '%s_%s_%s.png' % (zone, tag, name)))
            hv[name] = dict(ri, cam=e, look=l)
            print('  [%s %s] %s：鏡頭 %s → %s、calls %s、tris %s' % (zone, tag, name, e, l, ri['calls'], ri['tris']), flush=True)
        await pg.evaluate("(()=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=true; E.endCinematic&&E.endCinematic(); })()")
        await pg.evaluate(HUD + '(true)')
        await pg.wait_for_timeout(4000)
        cam = await pg.evaluate("(()=>{ const E=GAME.E, c=E.camera.position, p=E.player.obj.position; return {mode:E.cam.mode, cam:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], player:[+p.x.toFixed(2),+p.z.toFixed(2)]}; })()")
        await pg.screenshot(path=os.path.join(OUT, '%s_%s_game.png' % (zone, tag)))
        print('  [%s %s] 玩家視角：%s' % (zone, tag, J(cam)), flush=True)
        hv['game'] = cam
        res['hours'][tag] = hv
    return res


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CC GG_int 美術組 %s；SHA=%s；Playwright，不是手機實機' % (','.join(SHOPS), os.environ.get('SHA', '?')), flush=True)
    allr = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if not ok:
            await b.close(); print('FAILED 1: 遊戲載入', flush=True); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        for z in SHOPS:
            try: allr[z] = await shoot_zone(pg, cdp, z)
            except Exception as e: check('[%s] 探針沒有例外' % z, False, repr(e)[:300])
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(allr, open(os.path.join(OUT, 'gg_int_art.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
