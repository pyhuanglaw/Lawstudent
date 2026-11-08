"""CC-B（帳號 B）11-08：溫州街機車 v2（BB-B 06:27／LAWWW2-B）：lods＝段數（6）、每段 THREE.LOD 兩層（0 m／16 m）；台數雲端 28 對 Node 32 是什麼差。判定＝BB。
【前置】讀檔溫州街 14:00（條件事件關閉）。記：wz_kit_scooters 的子物件（Group／其他）數、wz_scooters_glb 的 LOD 名字、位置、levels 距離、userData.scPick 合計、款數、顏色數。
另外拍一段的近（10 m 內）、遠（20 m 外）兩張（同一段；CAM 固定鏡頭）。
用法：LW_TESTS=<wt>/tests python3 cc_scooter_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
R = L.Run('scooter', OUT); D.setup(R, OUT)
INFO = r"""(()=>{ const z=GAME.E.zone; const kit=z.group.children.find(o=>o.name==='wz_kit_scooters'); const out=z.group.children.find(o=>o.name==='wz_scooters_glb');
  const kc={}; if(kit) for(const o of kit.children){ const k=o.type+(o.isGroup?'':'('+(o.name||'')+')'); kc[k]=(kc[k]||0)+1; }
  const lods=out?out.children.filter(o=>o.isLOD):[]; const v=new THREE.Vector3();
  const L=lods.map(l=>{ l.getWorldPosition(v); const bb=new THREE.Box3().setFromObject(l.levels[0].object); const c=bb.getCenter(new THREE.Vector3()), s=bb.getSize(new THREE.Vector3());
    return {name:l.name, pos:[+v.x.toFixed(1),+v.z.toFixed(1)], levels:l.levels.map(q=>[+q.distance.toFixed(1), q.object.name||'', q.object.isMesh]), center:[+c.x.toFixed(1),+c.y.toFixed(1),+c.z.toFixed(1)], size:[+s.x.toFixed(1),+s.z.toFixed(1)], cur:l.getCurrentLevel?l.getCurrentLevel():null}; });
  const pick=out?(out.userData.scPick||{}):{};
  return {kitChildren:kit?kit.children.length:-1, kitByType:kc, kitHidden:kit?!kit.visible:null, lods:lods.length, lodInfo:L, placed:Object.values(pick).reduce((a,b)=>a+b,0), kinds:Object.keys(pick).length, colors:out?out.userData.scColors||0:0, pick,
    levelsOK:lods.every(l=>l.levels.length===2&&l.levels[1].distance>0&&l.levels.every(q=>q.object.isMesh&&q.object.geometry.attributes.color&&q.object.material.vertexColors))}; })()"""


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 溫州街機車 v2：worktree %s；Playwright ≠ iPhone' % (real or '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261108); await pg.goto(URL)
        if R.check('遊戲載入', await L.wait_loaded(pg), ''):
            await pg.evaluate("localStorage.clear()")
            R.setup('讀檔 wenzhou 2025-10-18 14:00（條件事件關閉）')
            s = await D.load_zone(pg, cdp, 'wenzhou', '2025-10-18', 14.0, wait=10000)
            info = await pg.evaluate(INFO)
            R.note('機車：%s' % J(info))
            R.check('套件機車藏起來', info['kitHidden'] is True, '')
            R.note('套件子物件 %s；正式機車 placed %s' % (J(info['kitByType']), info['placed']))
            R.check('台數 24～35（停車格 15% 空著、共用亂數；BB-B 07:13）', 24 <= info['placed'] <= 35, str(info['placed']))
            R.check('至少 7 款、15 種顏色', info['kinds'] >= 7 and info['colors'] >= 15, J([info['kinds'], info['colors']]))
            R.check('LOD 6 段、每段 2 層（levelsOK）', info['lods'] == 6 and info['levelsOK'] is True and all(len(x['levels']) == 2 for x in info['lodInfo']), J([x['levels'] for x in info['lodInfo']]))
            seg = info['lodInfo'][0] if info['lodInfo'] else None
            if seg:
                c = seg['center']
                for nm, dist in (('near8', 8.0), ('far25', 25.0)):
                    ax = seg['size'][0] >= seg['size'][1]; eye = [c[0] + (dist if ax else 0), 1.7, c[2] + (0 if ax else dist)]; look = [c[0], 0.6, c[2]]   # 沿著那一排機車的方向退開
                    r = await D.user_shot(pg, cdp, 'scooter_%s_%s' % (seg['name'] or 'seg0', nm), {'eye': eye, 'look': look, 'lens': 24})
                    lv = await pg.evaluate("(n=>{ const z=GAME.E.zone, out=z.group.children.find(o=>o.name==='wz_scooters_glb'); const l=out&&out.children.filter(o=>o.isLOD).find(o=>o.name===n)||null; if(!l) return null; l.update(GAME.E.camera); return l.getCurrentLevel(); })", seg['name'])
                    R.note('%s 距離 %.0f m：LOD 目前那一層 %s；鏡頭 %s' % (nm, dist, lv, J(r)))
            R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
