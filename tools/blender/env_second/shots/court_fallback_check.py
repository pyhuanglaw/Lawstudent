"""系籃球場（bball_court.glb）、社團博覽會帳篷（club_fair.glb）接進遊戲後，簡單版的有沒有真的藏起來（LAWWW2 檢查 LAWWW 3f3d56a 的接法）。
疑點同上：fair_fallback 也沒有 userData.dyn，9 頂帳篷共用 P3.M 材質 → 整區合併搬走，fb.visible=false 藏不到 → 兩套帳篷疊在一起。
疑點：zones3d.js 的 court_fallback 群組沒有 userData.dyn，兩張長椅用同一個 P3.M 材質（有快取）→ 整區合併（P3.mergeStatic）會把它們搬到區域最外層，
正式模型載入後 fb.visible=false 藏不到它們 → 簡單的長椅方塊和正式模型的長椅疊在一起。
做法：讀檔到球場旁（[前置]），等正式模型接上，數「看得到、在長椅位置附近、顏色 #6b5038」的網格；拍一張球場邊的截圖。Playwright 手機模擬，不是 iPhone。
用法：python3 court_fallback_check.py <網址> <輸出資料夾>"""
import asyncio, json, os, sys
LAWWW = os.environ.get('LAWWW_WT', '/home/user/lawwwtip_wt')
sys.path.insert(0, os.path.join(LAWWW, 'tests'))
import playlib as PL   # noqa: E402
from playwright.async_api import async_playwright   # noqa: E402

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
PROBE = """(async()=>{ const E=GAME.E; for(let i=0;i<240;i++){ let ok=false; E.zone.group.traverse(o=>{ if(o.isMesh&&/court|bball|hoop|bench/i.test((o.material&&o.material.name)||'')&&!/fallback/.test(o.parent&&o.parent.name||'')) ok=true; }); if(ok) break; await new Promise(r=>setTimeout(r,250)); }
  const shown=m=>{ for(let p=m;p;p=p.parent) if(!p.visible) return false; return true; };
  const out={fb:null, benchBoxes:[], glbMeshes:0};
  const fb=E.zone.group.getObjectByName('court_fallback'); if(fb) out.fb={visible:fb.visible, children:fb.children.length, dyn:!!fb.userData.dyn};
  const box=new THREE.Box3(), v=new THREE.Vector3();
  E.zone.group.traverse(o=>{ if(!o.isMesh||!o.material||!o.material.color) return; if(!shown(o)) return;
    if(o.material.color.getHexString()==='6b5038'){ const g=o.geometry, pos=g.attributes.position; let n=0; o.updateMatrixWorld();
      for(let i=0;i<pos.count;i++){ v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld); if(Math.abs(v.x-4.05)<0.4&&((Math.abs(v.z+115.2)<1.2)||(Math.abs(v.z+110.2)<1.2))&&v.y<0.5) n++; }
      if(n) out.benchBoxes.push({name:o.name||'(merged)', merged:!!o.userData.merged, vertsNearBenches:n, parent:o.parent&&o.parent.name}); } });
  return out; })()"""


FAIR_DAY = """(()=>{ for(let d=0;d<120;d++){ if(CALENDAR.dateOf(d).key==='2025-09-30') return d; } return null; })()"""
FAIR_PROBE = """(async()=>{ const E=GAME.E; for(let i=0;i<240;i++){ if(E.zone.group.children.some(o=>/^booth_/.test(o.name))) break; await new Promise(r=>setTimeout(r,250)); }
  const shown=m=>{ for(let p=m;p;p=p.parent) if(!p.visible) return false; return true; }; const v=new THREE.Vector3(); const out={fb:null, glbBooths:E.zone.group.children.filter(o=>/^booth_/.test(o.name)).length, procRoofs:[]};
  const fb=E.zone.group.getObjectByName('fair_fallback'); if(fb) out.fb={visible:fb.visible, children:fb.children.length, dyn:!!fb.userData.dyn};
  E.zone.group.traverse(o=>{ if(!o.isMesh||!o.material||!o.material.color||!shown(o)) return; if(o.material.color.getHexString()!=='e8e4da') return; const pos=o.geometry.attributes.position; let n=0; o.updateMatrixWorld();
    for(let i=0;i<pos.count;i++){ v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld); if(Math.abs(v.z-15.1)<2.3&&v.y>2.0&&v.y<3.0) n++; } if(n) out.procRoofs.push({merged:!!o.userData.merged, verts:n, parent:o.parent&&o.parent.name}); });
  return out; })()"""


async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
        await pg.goto(URL); await PL.wait_loaded(pg)
        await PL.load_state(pg, {'zone': 'campus', 'hour': 15.0, 'pos': {'x': 0.5, 'z': -112.7, 'lv': 0, 'yaw': -1.5708}}, quiet_events=True)
        class _R:
            def note(self, t): print('note', t)
        await PL.advance_dialogs(pg, cdp, _R(), lambda st: not st['dlg'] and not st['choices'], max_steps=30)
        res = await pg.evaluate(PROBE)
        await pg.evaluate("(()=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(10.5,2.2,-108.5),new THREE.Vector3(4.0,0.4,-113.5)); E.camera.position.set(10.5,2.2,-108.5); E.cam.look=new THREE.Vector3(4.0,0.4,-113.5); E.camera.lookAt(E.cam.look); })()")
        await pg.wait_for_timeout(2500); await pg.screenshot(path=f'{OUT}/court_benches.png')
        # 社團博覽會那天（2025-09-30）：讀檔到椰林大道的攤位前（[前置]）
        fd = await pg.evaluate(FAIR_DAY); res['fair_day'] = fd
        if fd is not None:
            await PL.load_state(pg, {'zone': 'campus', 'day': fd, 'hour': 13.0, 'pos': {'x': -6, 'z': 9.5, 'lv': 0, 'yaw': 3.1416}}, quiet_events=True)
            await PL.advance_dialogs(pg, cdp, _R(), lambda st: not st['dlg'] and not st['choices'], max_steps=30)
            res['fair'] = await pg.evaluate(FAIR_PROBE)
            await pg.evaluate("(()=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(-3,4.2,5.0),new THREE.Vector3(-9,1.6,15.1)); E.camera.position.set(-3,4.2,5.0); E.cam.look=new THREE.Vector3(-9,1.6,15.1); E.camera.lookAt(E.cam.look); })()")
            await pg.wait_for_timeout(2500); await pg.screenshot(path=f'{OUT}/fair_booths.png')
        res['errors'] = errs[:3]
        print(json.dumps(res, ensure_ascii=False)); json.dump(res, open(f'{OUT}/court_fallback.json', 'w'), ensure_ascii=False, indent=1)
        await b.close()

asyncio.run(main())
