"""LAWWW2-B 2026-11-07 延伸（HAIR-NOODLE-1104）：同一個人、同一個鏡頭，連拍幾種頭髮改法（HAIRFIX，在瀏覽器裡改，遊戲檔、VRM 都不動）。
  原檔：CC-C 的 docs/story_planning/test_tools/cc/cc_hair_compare_probe.py（cc-testing cc8c8ae6b；11-04 寫好、一直沒排進 PC 佇列）。改了：
  - HAIRFIX＝逗號分隔的做法，預設 0,n0.6,tex,n0.6+tex：
      0：原樣；
      nK：頭髮法線往膠囊狀的頭部外形混合 K（0～1；頭頂下 11.5 cm 以上是球面、以下是垂直軸）＝ tools/hair_normals.py 同一個算法；
      tex：頭髮貼圖的細線柔化（原圖 25%＋模糊 1.4 px 的 75%）；
      n0.6+tex：兩個一起。
  - 每個人只放一次，同一個位置連拍每一種做法（同一個鏡頭、同一個光）；檔名、總覽多一段做法：hair_<id>_<角度>_<光>_<做法>.png、hair_overview_<光>_<做法>.png。
  - 預設 WHO＝祐廷＋五位女主角、ENVS＝校園白天（campus@11）；要室內晚上加 ENVS=campus@11,linze@20。
以下是 CC-C 原本的說明。
CC-C（帳號 C）11-04：頭髮對照（使用者 13:2x 對 CC-C：「人物的頭髮真的太像泡麵了」；BB-C 13:17 排；3D 頭髮 LAWWW2 做、角色美術照 D100a／D128 由 LAWWW 驗）。
  規格（LAWWW2-C 13:19 為主＋BB-C 13:17）：誰＝祐廷（玩家）、以安、芷若、語彤、子晴、學姊、可昕、阿凱、沛珊（「小語」CHARACTERS 找不到 id，等 LAWWW2-C）；
  角度＝近拍 0.9 m、鏡頭在頭部高度：正面、斜前 45°、側面 90°、背面；另外每人一張遊戲平常的跟隨鏡頭距離（背後 4 m）；
  光線＝校園白天戶外 11:00（椰林大道）、室內晚上 20:00（法律系館A 大廳）；檔名 hair_<角色 id>_<角度>_<光>.png，佇列 ID HAIR_1104（local_out/HAIR_1104/）；藏 HUD。
  做法：【前置／捷徑】讀檔到校園（條件事件關閉）→ 用遊戲自己的 GAME.spawnCharacter(id) 把角色放到大道上（站著、不動，只為了拍頭髮，不是遊戲劇情放的）→ 等 VRM 載好（driver＝vrm）→
    固定鏡頭（E.cinematic）拍；主角用玩家自己的模型。室內：從校園用 GAME.enter('linze') 進法律系館A，再放一次。
  拼圖：每個環境一張總覽（列＝人、欄＝f／q／b × game／close），在瀏覽器裡拼（PC 沒有 PIL）：hair_overview_<環境>.png。LAWWW2 改之前、之後用同一支、同一個參數對照。
  只截圖、不判美術；Playwright（PC GPU／雲端 SwiftShader），不是手機實機。
用法：LW_TESTS=<wt>/tests [WHO=heroine_01,...,player] [ENVS=campus,linze] python3 cc_hair_compare_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math, base64
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
FAILS = []
WHO = [w.strip() for w in (os.environ.get('WHO') or 'player,heroine_01,heroine_02,heroine_03,heroine_04,heroine_05').split(',') if w.strip()]   # LAWWW2-C 13:19＋BB-C 13:17（「小語」在 CHARACTERS 找不到 id，等 LAWWW2-C 說）
ENVS = [e.strip() for e in (os.environ.get('ENVS') or 'campus@11').split(',') if e.strip()]
FIXES = [f.strip() for f in (os.environ.get('HAIRFIX') or '0,n0.6,tex,n0.6+tex').split(',') if f.strip()]   # LAWWW2-B：連拍的頭髮改法   # LAWWW2-C：校園白天戶外 11:00、室內晚上（法律系館A 大廳）20:00
LABEL = {'heroine_01': '沈以安', 'heroine_02': '林芷若', 'heroine_03': '陳語彤', 'heroine_04': '高子晴', 'heroine_05': '溫書瑀', 'player': '祐廷', 'kexin': '杜可昕', 'kai': '阿凱', 'classmate_peishan': '沛珊'}
SHOTS = [('front', 0.0), ('q45', math.pi / 4), ('side', math.pi / 2), ('back', math.pi)]   # 近拍：0.9 m、鏡頭在頭部高度（LAWWW2-C 13:19 四個角度）
CLOSE_D = 0.9
GAME_SHOT = ('follow', math.pi, 4.0, 0.9)   # 每人一張遊戲平常的跟隨鏡頭距離（背後 4 m、頭上 0.9 m）
CAMPUS_AT = (-60.0, 0.0)   # 椰林大道（z＝0；校門 x −124、總圖 x 100），tests/campus_glb_integration.py 的座標
FAIL_LOAD = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


HUD = """(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
# 放一個人（或拿玩家）：站在 (x,z)、面向 yaw、不動；回傳頭部位置與 driver
PLACE_JS = r"""(async([id,x,z,yaw])=>{ const E=GAME.E; let o=null, n=null, made=false;
  if(id==='player'){ o=E.player.obj; o.visible=true; o.position.set(x,o.position.y||0,z); o.rotation.y=yaw; }
  else { const had=!!(GAME.npc&&GAME.npc[id]); n=GAME.spawnCharacter(id,x,z,{}); if(!n) return {err:'spawnCharacter 回傳 null'}; made=!had; o=n.obj; n.frozen=true; n.beh='idle'; n.path=null; o.position.set(x,0,z); o.rotation.y=yaw; o.visible=true; window.__ccHairN=n; }
  for(let i=0;i<240;i++){ const d=o.userData&&o.userData.driver; if(d==='vrm') break; await new Promise(r=>setTimeout(r,250)); }
  await new Promise(r=>setTimeout(r,800));
  const V=THREE.Vector3; let head=null; try{ const v=o.userData.vrm, H=v&&v.humanoid; const b=H&&((H.getRawBoneNode&&H.getRawBoneNode('head'))||H.getNormalizedBoneNode('head')); if(b) head=b.getWorldPosition(new V()); }catch(e){}
  if(!head){ const bb=new THREE.Box3().setFromObject(o); head=new V(x,bb.max.y-0.12,z); }
  return {id, driver:o.userData&&o.userData.driver||null, model:(o.userData&&o.userData.model)||null, made, head:[+head.x.toFixed(3),+head.y.toFixed(3),+head.z.toFixed(3)], pos:[+o.position.x.toFixed(2),+o.position.z.toFixed(2)]}; })"""
# LAWWW2-B：頭髮改法（只改放好的那個人的子樹；原本的法線、貼圖記在 userData，換下一種做法前先還原）
APPLY_JS = r"""(([id,fix])=>{ const E=GAME.E, V=THREE.Vector3; const o=id==='player'?E.player.obj:(window.__ccHairN&&window.__ccHairN.obj); if(!o) return {err:'找不到人'};
  const k=(/n([0-9.]+)/.exec(fix)||[])[1]!=null?+(/n([0-9.]+)/.exec(fix)[1]):0, tex=/tex/.test(fix), out={fix,k,tex,meshes:0,verts:0,texs:0,skip:[]};
  const hairMat=m=>m&&/HAIR/i.test(m.name||''); const mats=m=>Array.isArray(m.material)?m.material:[m.material];
  o.traverse(m=>{ if(!m.isMesh||!mats(m).some(hairMat)) return; const g=m.geometry, N=g&&g.attributes.normal, P=g&&g.attributes.position; if(!N||!P) return;
    if(!g.userData.__n0) g.userData.__n0=N.array.slice(0); const n0=g.userData.__n0; N.array.set(n0);
    if(k>0){ const sk=m.skeleton; let hi=-1; if(sk){ hi=sk.bones.findIndex(b=>/J_Bip_C_Head$/.test(b.name)); if(hi<0) hi=sk.bones.findIndex(b=>/(^|_)head$/i.test(b.name)); }
      if(hi<0){ out.skip.push(m.name+'：找不到頭骨'); }
      else { const hb=new V().setFromMatrixPosition(new THREE.Matrix4().copy(sk.boneInverses[hi]).invert()).applyMatrix4(m.bindMatrixInverse);
        let top=-1e9; for(let i=0;i<P.count;i++){ const x=P.getX(i)-hb.x, z=P.getZ(i)-hb.z; if(x*x+z*z<0.0225) top=Math.max(top,P.getY(i)); }
        if(top<-1e8) out.skip.push(m.name+'：頭頂附近沒有頭髮');
        else { const S=new V(hb.x,top-0.115,hb.z), p=new V(), d=new V(), n=new V();
          for(let i=0;i<P.count;i++){ p.fromBufferAttribute(P,i); const cy=Math.min(S.y,Math.max(p.y,S.y-0.8)); d.set(p.x-S.x,p.y-cy,p.z-S.z); const L=d.length(); if(L<1e-6) continue; d.multiplyScalar(1/L);
            n.set(n0[3*i],n0[3*i+1],n0[3*i+2]).multiplyScalar(1-k).addScaledVector(d,k); const ln=n.length(); if(ln<1e-6) continue; n.multiplyScalar(1/ln); N.setXYZ(i,n.x,n.y,n.z); }
          out.meshes++; out.verts+=P.count; } } }
    N.needsUpdate=true;
    for(const mt of mats(m)){ if(!hairMat(mt)) continue; const U=mt.uniforms||{}; const cur=mt.map||(U.map&&U.map.value);
      if(mt.userData.__map0===undefined) mt.userData.__map0=cur||null; const m0=mt.userData.__map0; let use=m0;
      if(tex&&m0&&m0.image&&m0.image.width){ if(!m0.userData.__soft){ const im=m0.image, c=document.createElement('canvas'); c.width=im.width; c.height=im.height; const x=c.getContext('2d');
          x.drawImage(im,0,0); x.globalAlpha=0.75; x.filter='blur(1.4px)'; x.drawImage(im,0,0); const t=new THREE.CanvasTexture(c);
          for(const key of ['flipY','colorSpace','wrapS','wrapT','magFilter','minFilter','anisotropy','offset','repeat','channel']) if(m0[key]!==undefined){ if(m0[key]&&m0[key].clone) t[key]=m0[key].clone(); else t[key]=m0[key]; }
          t.needsUpdate=true; m0.userData.__soft=t; } use=m0.userData.__soft; out.texs++; }
      if('map' in mt) mt.map=use; if(U.map) U.map.value=use; if(U.shadeMultiplyTexture&&(U.shadeMultiplyTexture.value===m0||U.shadeMultiplyTexture.value===m0.userData.__soft)) U.shadeMultiplyTexture.value=use; mt.needsUpdate=true; } });
  return out; })"""
UNPLACE_JS = r"""(([id,made])=>{ const E=GAME.E; if(id==='player'){ return true; } const n=window.__ccHairN; if(n&&made){ try{ E.removeNPC(n); }catch(e){} if(GAME.npc) delete GAME.npc[id]; } else if(n){ n.frozen=false; } window.__ccHairN=null; return true; })"""
AIM = """(async(e,l,hidePlayer)=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=!hidePlayer;
  E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const f0=E.frame; for(let i=0;i<240&&E.frame<f0+5;i++) await new Promise(r=>setTimeout(r,200)); return true; })"""
# 瀏覽器裡拼總覽：imgs＝[[列標籤, [b64...]]]、欄標籤
MONTAGE_JS = r"""(async([rows,cols,tw,th])=>{ const lw=110, hh=28; const c=new OffscreenCanvas(lw+cols.length*tw, hh+rows.length*th), x=c.getContext('2d');
  x.fillStyle='#202124'; x.fillRect(0,0,c.width,c.height); x.fillStyle='#fff'; x.font='16px sans-serif';
  cols.forEach((t,i)=>x.fillText(t,lw+i*tw+6,20));
  for(let r=0;r<rows.length;r++){ const [lab,imgs]=rows[r]; x.fillStyle='#fff'; x.fillText(lab,6,hh+r*th+th/2);
    for(let i=0;i<imgs.length;i++){ if(!imgs[i]) continue; const bm=await createImageBitmap(await (await fetch('data:image/png;base64,'+imgs[i])).blob()); x.drawImage(bm,lw+i*tw,hh+r*th,tw,th); } }
  const blob=await c.convertToBlob({type:'image/png'}); const buf=new Uint8Array(await blob.arrayBuffer()); let s=''; for(let i=0;i<buf.length;i+=32768) s+=String.fromCharCode.apply(null,buf.subarray(i,i+32768)); return btoa(s); })"""


async def wait_zone(pg, z, t=60):
    for _ in range(int(t * 4)):
        if await pg.evaluate("GAME.G.zone===%s&&!(GAME.isEntering&&GAME.isEntering())" % J(z)): return True
        await pg.wait_for_timeout(250)
    return False


async def stable_meshes(pg, t=60):
    js = "(()=>{ let n=0; const z=GAME.E.zone; if(z&&z.group) z.group.traverse(o=>{ if(o.isMesh) n++; }); return n; })()"
    last = -1; st = 0; t0 = time.time()
    while time.time() - t0 < t:
        await pg.wait_for_timeout(1000); n = await pg.evaluate(js)
        if n == last: st += 1
        else: st = 0; last = n
        if st >= 4: return n
    return last


async def shoot_env(pg, cdp, envh):
    env, _, hh = envh.partition('@'); hour = float(hh or 14); light = '%s%02d' % (env, int(hour))
    print('== %s（%02d:00）' % (env, int(hour)), flush=True)
    if env == 'campus':
        print('  [前置／捷徑] 讀檔：校園椰林大道 (%s, %s)、2025-09-23（二）%02d:00、晴、條件事件關閉' % (CAMPUS_AT[0], CAMPUS_AT[1], int(hour)), flush=True)
        await L.load_state(pg, {'zone': 'campus', 'hour': hour, 'day': 7, 'weekday': 2, 'weather': 'clear', 'pos': {'x': CAMPUS_AT[0], 'z': CAMPUS_AT[1] + 6, 'yaw': 0, 'lv': 0}}, quiet_events=True)
        ok = await wait_zone(pg, 'campus'); at = CAMPUS_AT
    else:
        print('  [前置／捷徑] 讀檔：校園 %02d:00 → GAME.enter(%s)（遊戲自己的換區域，出生點）' % (int(hour), env), flush=True)
        await L.load_state(pg, {'zone': 'campus', 'hour': hour, 'day': 7, 'weekday': 2, 'weather': 'clear', 'pos': {'x': CAMPUS_AT[0], 'z': CAMPUS_AT[1] + 6, 'yaw': 0, 'lv': 0}}, quiet_events=True)
        await wait_zone(pg, 'campus'); await pg.evaluate("void GAME.enter(%s)" % J(env))
        ok = await wait_zone(pg, env)
        p = await pg.evaluate("(()=>{ const p=GAME.E.player.obj.position; return [p.x,p.z]; })()")
        at = (p[0], p[1] - 1.5)   # 出生點往裡 1.5 m
    if not check('[%s] 進到區域' % env, ok, await pg.evaluate("GAME.G.zone")): return []
    n = await stable_meshes(pg); await L.close_panels(pg, cdp)
    print('  [%s] 場景 mesh %s；人物站在 (%.2f, %.2f)' % (env, n, at[0], at[1]), flush=True)
    await pg.evaluate(HUD + '(false)')
    rows = {}
    for who in WHO:
        yaw = 0.0   # 面向 +z
        pl = await pg.evaluate(PLACE_JS + '(%s)' % J([who, at[0], at[1], yaw]))
        print('  [%s] %s（%s）：%s' % (env, who, LABEL.get(who, who), J(pl)), flush=True)
        if pl.get('err') or not check('[%s] %s 是 VRM（driver vrm）' % (env, who), pl.get('driver') == 'vrm', J(pl)):
            for fix in FIXES: rows.setdefault(fix, []).append([LABEL.get(who, who) + '（沒載）', [None] * (len(SHOTS) + 1)])
            FAIL_LOAD.append(who)
            await pg.evaluate(UNPLACE_JS + '(%s)' % J([who, pl.get('made', False)])); continue
        hx, hy, hz = pl['head']
        plan = [(an, rot, CLOSE_D, 0.0) for an, rot in SHOTS] + [GAME_SHOT]
        for fix in FIXES:   # LAWWW2-B：同一個人、同一個位置，連拍每一種頭髮改法
            ap = await pg.evaluate(APPLY_JS + '(%s)' % J([who, fix])); print('  [%s] %s 做法 %s：%s' % (env, who, fix, J(ap)), flush=True)
            if fix != '0': check('[%s] %s 做法 %s 有改到' % (env, who, fix), not ap.get('err') and (ap.get('meshes', 0) > 0 or ap.get('texs', 0) > 0), J(ap))
            await pg.wait_for_timeout(300); imgs = []
            for an, rot, dist, up in plan:
                a = yaw + rot; e = [hx + math.sin(a) * dist, hy + up, hz + math.cos(a) * dist]; l = [hx, hy - (0.15 if an == 'follow' else 0.02), hz]
                await pg.evaluate(AIM + '(%s,%s,%s)' % (J([round(v, 3) for v in e]), J(l), 'false' if who == 'player' else 'true'))
                await pg.wait_for_timeout(400)
                fn = os.path.join(OUT, 'hair_%s_%s_%s_%s.png' % (who, an, light, fix.replace('+', '_')))   # 角色 id＋角度＋光（LAWWW2-C）＋做法（LAWWW2-B）
                png = await pg.screenshot(path=fn); imgs.append(base64.b64encode(png).decode())
            rows.setdefault(fix, []).append([LABEL.get(who, who), imgs])
        await pg.evaluate(APPLY_JS + '(%s)' % J([who, '0']))   # 還原（下一個人可能共用同一份幾何）
        await pg.evaluate(UNPLACE_JS + '(%s)' % J([who, pl.get('made', False)]))
    await pg.evaluate("(()=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=true; E.endCinematic&&E.endCinematic(); })()")
    await pg.evaluate(HUD + '(true)')
    cols = [an for an, _ in SHOTS] + [GAME_SHOT[0]]
    for fix, rr in rows.items():
        tag = fix.replace('+', '_')
        try:
            b64 = await pg.evaluate(MONTAGE_JS + '(%s)' % J([rr, cols, 281, 130]))
            with open(os.path.join(OUT, 'hair_overview_%s_%s.png' % (light, tag)), 'wb') as fh: fh.write(base64.b64decode(b64))
            print('  [%s] 總覽 hair_overview_%s_%s.png（%d 人 × %d 張）' % (env, light, tag, len(rr), len(cols)), flush=True)
        except Exception as e:
            check('[%s] 總覽拼得出來（%s）' % (env, fix), False, repr(e)[:200])
    return [r[0] for r in rows.get(FIXES[0], [])]


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CC 頭髮對照 %s；%s；做法 %s；SHA=%s；Playwright，不是手機實機' % (','.join(WHO), ','.join(ENVS), ','.join(FIXES), os.environ.get('SHA', '?')), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if not ok:
            await b.close(); print('FAILED 1: 遊戲載入', flush=True); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        for env in ENVS:
            try: await shoot_env(pg, cdp, env)
            except Exception as e: check('[%s] 探針沒有例外' % env, False, repr(e)[:300])
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
