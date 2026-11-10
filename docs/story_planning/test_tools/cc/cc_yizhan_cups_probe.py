"""CC X289 一盞杯子浮空（YIZHAN-FLOAT-CUPS-1110；LAWWW2 08:20 請求、BB 08:21 排序）——診斷探針，不判 PASS／FAIL 劇情。
使用者截圖：11/8（六）18:28 一盞，左邊和室兩個外帶紙杯浮在半空、旁邊有跪坐的客人、那裡沒有桌子。
【前置／捷徑】讀使用者存檔（遊戲 repo tests/fixtures/user_save_day47_1110.json，FIX= 可換 day51），日子改 2025-11-08、時間改 18:28（HOUR=18.4667）、區域改 wz_teahouse（出生點）。
然後什麼都不做，等 SEATACT 跑過（WAIT 秒，預設 12），記：
  ① LAWWW2 給的那段 JS 的原樣結果（props／seatact／probes／npcs）
  ② 每一個 InstancedMesh 的每一個 instance 的世界座標（cup／item_／hand_／tset_／rset_／S_／L_），它正下方 0.6 m 內有沒有別的網格（不是人物、不是 instance）＝「浮空」候選
  ③ SEATACT.state() 每一組的座位、桌子 probe（r.tb）
截圖：遊戲畫面一張；用另外一台相機（不動遊戲鏡頭）render：整間由上往下一張、每個浮空候選「旁邊 2.2 m 眼睛高度看過去」＋「正上方 3 m 往下」各一張（最多 4 個）。
Playwright／SwiftShader ≠ iPhone。用法：LW_TESTS=<wt>/tests [FIX=tests/fixtures/user_save_day51_1110.json] [WAIT=12] python3 cc_yizhan_cups_probe.py <url> <out>"""
import os, sys, json, asyncio, base64
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
FIX = os.environ.get('FIX') or 'tests/fixtures/user_save_day47_1110.json'
ZONE = os.environ.get('ZONE') or 'wz_teahouse'; DAYKEY = os.environ.get('DAYKEY') or '2025-11-08'
HOUR = float(os.environ.get('HOUR') or (18 + 28 / 60)); WAIT = float(os.environ.get('WAIT') or 12)
R = L.Run('yizhan_cups', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)

# ① LAWWW2 08:20 給的原樣（&gt; 等已還原）
LAWWW2_JS = r"""(()=>{const E=GAME.E,o=[];E.scene.traverse(m=>{if(!m.isMesh&&!m.isInstancedMesh)return;const n=m.name||'';if(!/cup|item_|hand_/.test(n))return;const w=new THREE.Vector3();m.getWorldPosition(w);let p=m,c=[];while(p&&c.length<6){c.push(p.name||p.type);p=p.parent;}o.push({n,vis:m.visible,count:m.count,x:+w.x.toFixed(2),y:+w.y.toFixed(2),z:+w.z.toFixed(2),chain:c.join('<')});});const S=typeof SEATACT!=='undefined'?SEATACT.state():null;const probes=(E.seats||[]).map(st=>({x:st.x,z:st.z,yaw:+(st.yaw||0).toFixed(2),kind:st.kind||'',seatH:st.seatH,lift:st.lift,probe:SEATACT&&SEATACT.probe?SEATACT.probe(E,st):null}));const npcs=E.npcs.filter(n=>n.seat).map(n=>({id:n.id||n.name,pose:n.pose,x:+n.obj.position.x.toFixed(2),y:+n.obj.position.y.toFixed(2),z:+n.obj.position.z.toFixed(2),seat:[n.seat.x,n.seat.z,n.seat.kind||'']}));return JSON.stringify({props:o,seatact:S,probes,npcs});})()"""

# ② 每個 instance 的世界座標＋正下方有沒有東西
INST_JS = r"""(()=>{ const E=GAME.E, out=[], rc=new THREE.Raycaster(), M=new THREE.Matrix4(), P=new THREE.Vector3(), Q=new THREE.Quaternion(), Sc=new THREE.Vector3();
  const visUp=o=>{ for(let q=o;q;q=q.parent) if(!q.visible) return false; return true; };
  const isChar=o=>{ for(let q=o;q;q=q.parent){ if(q.isSkinnedMesh||(q.userData&&(q.userData.vrm||q.userData.isChar))) return true; } return false; };
  const solids=[]; E.scene.traverse(o=>{ if(o.isMesh&&!o.isInstancedMesh&&!o.isSkinnedMesh&&visUp(o)&&!isChar(o)) solids.push(o); });
  const RX=/cup|item_|hand_|tset_|rset_|^S_|^L_|desk|prop/i;
  E.scene.traverse(m=>{ if(!m.isInstancedMesh||!RX.test(m.name||'')) return; m.updateMatrixWorld(true);
    let ch=[], p=m; while(p&&ch.length<5){ ch.push(p.name||p.type); p=p.parent; }
    for(let i=0;i<m.count;i++){ m.getMatrixAt(i,M); M.premultiply(m.matrixWorld); M.decompose(P,Q,Sc); if(Sc.x<1e-4) continue;
      rc.set(new THREE.Vector3(P.x,P.y+0.02,P.z), new THREE.Vector3(0,-1,0)); rc.far=0.6; const h=rc.intersectObjects(solids,false)[0];
      const below=h?{d:+h.distance.toFixed(3),y:+h.point.y.toFixed(3),mesh:h.object.name||'(無名)',parent:h.object.parent&&h.object.parent.name||''}:null;
      out.push({mesh:m.name, i, vis:visUp(m), x:+P.x.toFixed(2), y:+P.y.toFixed(3), z:+P.z.toFixed(2), below, float:!below||below.d>0.06, chain:ch.join('<')}); } });
  const nav=E.nav; let fl=null; if(nav){ let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9; for(let r=0;r<nav.rows;r++) for(let c=0;c<nav.cols;c++){ if(nav.b[nav.idx(c,r)]) continue; const [x,z]=nav.toWorld(c,r); x0=Math.min(x0,x); x1=Math.max(x1,x); z0=Math.min(z0,z); z1=Math.max(z1,z); } fl=[x0,x1,z0,z1]; }
  const st=typeof SEATACT!=='undefined'?SEATACT.state():null;
  return {inst:out, bbox:fl, zone:GAME.G.zone, hour:+GAME.G.hour.toFixed(2), day:GAME.G.day, weekday:GAME.G.weekday, seatactN:st&&st.n, player:[+E.player.obj.position.x.toFixed(2),+E.player.obj.position.z.toFixed(2)]}; })()"""

# 另一台相機 render（不動遊戲鏡頭）：kind 'top' 正上方往下、'eye' 從 from 看 at
SNAP_JS = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement, W=c.width, H=c.height; const cam=new THREE.PerspectiveCamera(a.fov||55, W/H, 0.05, 200);
  cam.position.set(a.from[0],a.from[1],a.from[2]); if(a.up) cam.up.set(a.up[0],a.up[1],a.up[2]); cam.lookAt(a.at[0],a.at[1],a.at[2]); cam.updateMatrixWorld(true);
  const hid=[]; if(a.hideRoof){ E.scene.traverse(o=>{ if(o.isMesh&&o.visible){ o.geometry.computeBoundingBox&&!o.geometry.boundingBox&&o.geometry.computeBoundingBox(); const b=o.geometry.boundingBox; if(!b) return; const bb=b.clone().applyMatrix4(o.matrixWorld); if(bb.min.y>a.hideRoof){ o.visible=false; hid.push(o); } } }); }
  r.render(E.scene,cam); const url=c.toDataURL('image/png'); hid.forEach(o=>o.visible=true); return url; })"""


async def snap(pg, fn, **a):
    url = await pg.evaluate(SNAP_JS, a)
    open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(url.split(',', 1)[1])); R.note('截圖 %s：%s' % (fn, J(a)))


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC X289 一盞杯子浮空：worktree %s；Playwright ≠ iPhone' % (real or '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        sv = await pg.evaluate("fetch(%s).then(r=>r.ok?r.json():null)" % J(FIX))
        if not R.check('讀得到存檔 %s' % FIX, bool(sv), ''): await b.close(); return
        day = await pg.evaluate("(k=>{ if(typeof STORY!=='undefined'&&STORY.dayOfKey) return STORY.dayOfKey(k); for(let d=0;d<4000;d++){ try{ if(CALENDAR.dateOf(d).key===k) return d; }catch(e){} } return null; })", DAYKEY)
        R.setup('【前置／捷徑】讀使用者存檔 %s（原本 day %s %s @ %s），改成 %s（day %s）%.2f 時、區域 %s 出生點；條件事件關掉（只看擺設）' % (FIX, sv.get('day'), sv.get('zone'), sv.get('hour'), DAYKEY, day, HOUR, ZONE))
        sv['zone'] = ZONE; sv.pop('pos', None); sv['day'] = day; sv['hour'] = HOUR
        sv['weekday'] = (await pg.evaluate("((d)=>CALENDAR.dateOf(d).wd)", day)) % 7
        await pg.evaluate("(async(s)=>{ document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; await GAME.applySave(s); })", sv)
        await pg.wait_for_timeout(int(WAIT * 1000)); await L.close_panels(pg, cdp)
        s = await D.st(pg); R.note('讀檔後：%s' % J(s))
        R.check('在 %s、星期六' % ZONE, s.get('zone') == ZONE and (await pg.evaluate("GAME.G.weekday")) == 6, J(s))
        raw = await pg.evaluate(LAWWW2_JS); open(os.path.join(OUT, 'lawww2_js.json'), 'w').write(raw)
        lj = json.loads(raw); R.note('① LAWWW2 JS：props %d 個、seatact %s 組、座位 %d、坐著的 NPC %d' % (len(lj['props']), lj['seatact'] and lj['seatact'].get('n'), len(lj['probes']), len(lj['npcs'])))
        for q in lj['props']: R.note('  prop %s' % J(q))
        for q in lj['npcs']: R.note('  npc %s' % J(q))
        if lj['seatact']:
            for q in lj['seatact'].get('list', []): R.note('  seatact %s' % J(q))
        ins = await pg.evaluate(INST_JS); json.dump(ins, open(os.path.join(OUT, 'instances.json'), 'w'), ensure_ascii=False, indent=1)
        fl = [q for q in ins['inst'] if q['float'] and q['vis']]
        R.note('② instance %d 個，正下方 0.06 m 內沒有東西（浮空候選）%d 個' % (len(ins['inst']), len(fl)))
        for q in fl: R.note('  浮空候選 %s' % J(q))
        await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(400)
        await pg.screenshot(path=os.path.join(OUT, 'yz_game.png'))
        bb = ins['bbox']
        if bb:
            cx, cz = (bb[0] + bb[1]) / 2, (bb[2] + bb[3]) / 2; span = max(bb[1] - bb[0], bb[3] - bb[2])
            await snap(pg, 'yz_top_all.png', **{'from': [cx, span * 1.05 + 2, cz + 0.01], 'at': [cx, 0, cz], 'up': [0, 0, -1], 'hideRoof': 2.3})
        for k, q in enumerate(fl[:4]):
            await snap(pg, 'yz_float%d_top.png' % k, **{'from': [q['x'], q['y'] + 3, q['z'] + 0.01], 'at': [q['x'], q['y'], q['z']], 'up': [0, 0, -1], 'hideRoof': max(2.3, q['y'] + 1.2)})
            dx, dz = (cx - q['x'], cz - q['z']) if bb else (0, 1); d = (dx * dx + dz * dz) ** 0.5 or 1
            await snap(pg, 'yz_float%d_eye.png' % k, **{'from': [q['x'] + dx / d * 2.2, 1.45, q['z'] + dz / d * 2.2], 'at': [q['x'], q['y'], q['z']]})
        await pg.evaluate(D.HUD + '(true)')
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
