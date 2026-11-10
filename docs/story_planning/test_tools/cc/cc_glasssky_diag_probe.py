"""CC（帳號 A）11-10：PUTONG101 v2C 玻璃沒作用的診斷（TEACHVIEW_pn_v2c 74da28ca9：北窗白天玻璃 [40,38,33]，比 v2b 的 [50,54,57] 還暗、幾乎回到 v1）。
只讀、不判美術：讀檔到校園普通教學館北側 (−27, −70)，11:00 和 20:30 各一次，等校園的 GLB 都載完；找所有 material.userData.skyPatch 的網格（zones3d.js glassSky），記：
  網格名、visible（含祖先）、材質名、transparent／opacity、emissiveIntensity、userData.nightI、uDay（onBeforeRender 算的）、uMin／uMax（skyBox）、
  網格 geometry 的本地包圍盒（vSkyP＝position 本地座標，要落在 skyBox 裡才會上色）、包圍盒和 skyBox 重疊的比例、program 的 cacheKey 有沒有 glassSky3、onBeforeRender 有沒有被呼叫。
另外照遊戲鏡頭位置拍一張 11:00 的畫面。【前置／捷徑】load_zone 讀檔、鏡頭直接擺。Playwright ≠ iPhone。
用法：LW_TESTS=<wt>/tests python3 cc_glasssky_diag_probe.py <url> <out>"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
R = L.Run('glasssky_diag', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
DIAG = r"""(()=>{ const E=GAME.E, out=[]; E.scene.traverse(o=>{ if(!o.isMesh) return; const ms=[].concat(o.material); for(const m of ms){ if(!m||!m.userData||!m.userData.skyPatch) continue;
  const U=m.userData.skyPatch; let vis=true; for(let q=o;q;q=q.parent) if(q.visible===false){ vis=false; break; }
  if(!o.geometry.boundingBox) o.geometry.computeBoundingBox(); const b=o.geometry.boundingBox; const mn=U.uMin.value, mx=U.uMax.value;
  const ix=Math.max(0,Math.min(b.max.x,mx.x)-Math.max(b.min.x,mn.x)), iy=Math.max(0,Math.min(b.max.y,mx.y)-Math.max(b.min.y,mn.y)), iz=Math.max(0,Math.min(b.max.z,mx.z)-Math.max(b.min.z,mn.z));
  const vb=(b.max.x-b.min.x)*(b.max.y-b.min.y)*(b.max.z-b.min.z)||1e-9; const r3=v=>[+v.x.toFixed(2),+v.y.toFixed(2),+v.z.toFixed(2)];
  let key=null; try{ key=m.customProgramCacheKey?m.customProgramCacheKey():null; }catch(e){ key='ERR '+e; }
  const wb=new THREE.Box3().setFromObject(o);
  out.push({mesh:o.name||'(無名)', parent:o.parent&&o.parent.name, vis, mat:m.name, transparent:m.transparent, opacity:m.opacity, emissiveI:m.emissiveIntensity, nightI:m.userData.nightI, uDay:U.uDay.value,
    hasDivA:!!U.uDivA, skyMin:r3(mn), skyMax:r3(mx), geoMin:r3(b.min), geoMax:r3(b.max), overlap:+(ix*iy*iz/vb).toFixed(3), overlapXYZ:[+ix.toFixed(2),+iy.toFixed(2),+iz.toFixed(2)],
    worldMin:r3(wb.min), worldMax:r3(wb.max), cacheKey:key, onBR:typeof o.onBeforeRender==='function'&&String(o.onBeforeRender).indexOf('uDay')>=0, needsUpdate:m.version}); } });
  const progs=(E.renderer.info.programs||[]).map(p=>p.cacheKey||p.name||'').filter(k=>/glassSky/.test(k)).length;
  return {n:out.length, programsWithGlassSky:progs, rows:out}; })()"""


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 玻璃 skyPatch 診斷：worktree %s；Playwright ≠ iPhone' % (real or '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        for h in (11.0, 20.5):
            R.setup('【前置／捷徑】讀檔到 campus (−27, −70) 2025-09-17 %.1f 時' % h)
            await D.load_zone(pg, cdp, 'campus', '2025-09-17', h, x=-27, z=-70, yaw=0.0, wait=15000)
            await pg.evaluate("(()=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(-27.2,1.85,-67.3),new THREE.Vector3(-27.2,1.6,-120)); })()")
            await pg.wait_for_timeout(3000)
            d = await pg.evaluate(DIAG)
            R.note('%.1f 時 skyPatch 材質的網格 %d 個；renderer.info.programs 裡 cacheKey 有 glassSky 的 %s 個' % (h, d['n'], d['programsWithGlassSky']))
            for r in d['rows']: R.note('  %s' % J(r))
            json.dump(d, open(os.path.join(OUT, 'glasssky_%02d.json' % int(h)), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            await pg.screenshot(path=os.path.join(OUT, 'glasssky_%02d.png' % int(h)))
            if h == 11.0:
                R.check('11:00 有 skyPatch 的網格', d['n'] > 0, '')
                R.check('11:00 uDay > 0（白天要上色）', any(r['uDay'] > 0 for r in d['rows']), J([r['uDay'] for r in d['rows']]))
                R.check('11:00 網格的本地包圍盒和 skyBox 有重疊', any(r['overlap'] > 0 for r in d['rows']), J([(r['mesh'], r['overlap']) for r in d['rows']]))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
