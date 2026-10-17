"""公館南側店家室內的正式模型（第二個 AI：Blender GLB）整合檢查——第二層「系統整合」測試（docs/TESTING.md），不是真實玩家流程。
麵店 noodle（bldg.noodle_interior）、書店 bookstore（bldg.bookstore_interior）、宿舍 dorm（bldg.dorm_room4：四人房，DORM-LOFT-L）；每一間都比較一般網址與 ?nobldg：
  1. 正式模型接上（zone.formal）、程序化備用模型藏起來；會淡出的牆（WALL_*）有前後左右四面。
  2. 導航格和 ?nobldg 完全相同；互動點（名稱、位置）不變；麵店的 6 個座位（z.seats）不變；家具擋住、走道走得到。
  3. 鏡頭在前牆外：前牆淡出、後牆不淡出（自我檢查：故意把前牆 dir 弄反，淡出檢查必須失敗）；玻璃、紗窗保持透明（不放進會淡出的牆）。
  4. 牌子（價目板、紅紙菜單、手寫牌）都有 canvas 字；自動門外的窗景和窗戶同一個材質（宿舍的門通走廊，沒有窗景）。
  5. 宿舍：月曆（洗手間隔間）、社團傳單（書桌前的牆）是遊戲內容，在正式模型載入後還看得到、貼在牆前。
[前置／捷徑]：用遊戲自己的讀檔把玩家放進店裡（GAME.applySave），關掉條件事件；直接設鏡頭位置測牆面淡出。
用法：python3 tests/interior_glb_integration.py http://127.0.0.1:8765/index.html [noodle,bookstore]
"""
import asyncio, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.async_api import async_playwright
import playlib as PL

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
ONLY = sys.argv[2].split(',') if len(sys.argv) > 2 else None
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', 'art-rebuild', 'second_ai', 'test_shots', 'interior_glb_integration')
ZONES = {
    'noodle': dict(name='麵店', spawn={'x': 0, 'z': 3.5, 'yaw': 3.1416}, front=4.5, signs=11,
                   it={'坐下吃麵': [(-3, 1.3), (0, 1.3), (3, 1.3)], '離開麵店': [(0, 4.2)]},
                   seats=[[-3, -0.3, 0], [-3, 1.3, 3.1416], [0, -0.3, 0], [0, 1.3, 3.1416], [3, -0.3, 0], [3, 1.3, 3.1416]],
                   blocked=[(-1.0, -3.8, '煮麵台'), (-3.0, 0.5, '左桌'), (0.0, 0.5, '中桌'), (3.0, 0.5, '右桌')],
                   free=[(0.0, 3.5, '出生點'), (-1.5, 2.5, '門口走道'), (-1.0, -2.5, '煮麵台前'), (1.5, -1.5, '桌子後面')]),
    'bookstore': dict(name='書店', spawn={'x': 0, 'z': 4, 'yaw': 3.1416}, front=5.0, signs=1,
                      it={'看看法律書與文具': [(0, 4.05)], '離開書店': [(0, 4.6)]}, seats=None,
                      blocked=[(0.0, -4.7, '後牆書架'), (-5.7, 0.0, '左牆書架'), (5.7, 0.0, '右牆書架'), (-2.0, 0.0, '左邊雙面書架'), (2.0, 0.0, '右邊雙面書架'), (0.0, 3.0, '櫃台桌')],
                      free=[(0.0, 4.0, '出生點'), (0.0, 0.0, '中間走道'), (-3.8, 0.0, '左邊走道'), (3.8, 0.0, '右邊走道')]),
    'dorm': dict(name='宿舍', spawn={'x': 0, 'z': 2.4, 'yaw': 3.1416}, front=3.5, signs=0, door=False, mount_y=0.95,   # 四人房的書桌靠側牆：桌上的螢幕、檯燈（離地 0.76 m 起）不算貼在牆上
                 keep={'dorm_calendar': ('z', 1.394), 'dorm_flyer': ('x', -2.896)},   # 四人房（DORM-LOFT-L，dorm_room4）：月曆在洗手間隔間、傳單在玩家書桌前的牆
                 it={'坐在書桌前': [(-2.04, -0.098)], '睡覺': [(-1.55, 1.165)], '走出房間': [(0, 3.3)], '看看房間裡的東西': [(-1.55, -0.91)]}, seats=None,
                 blocked=[(-2.4, 0.2, '我的床桌 L2'), (2.4, 0.2, '室友的床桌 R2'), (2.4, -2.2, 'R1'), (-2.4, -2.2, 'L1'), (1.75, 2.4, '洗手間')],
                 free=[(0.0, 2.4, '出生點'), (0.0, 0.0, '房間中間'), (0.0, -2.6, '窗前'), (-1.5, -0.1, '我的書桌前'), (1.5, -0.1, '室友書桌前')]),
}
WAIT_FORMAL = "(async()=>{ for(let i=0;i<240;i++){ if(GAME.E.zone&&GAME.E.zone.formal) return true; await new Promise(r=>setTimeout(r,250)); } return false; })()"
NAV_HASH = "(()=>{ const n=GAME.E.nav; let h=0; for(let i=0;i<n.b.length;i++){ h=(h*31+n.b[i]+i%7)>>>0; } return [n.cols,n.rows,h, n.b.reduce((a,v)=>a+(v?1:0),0)]; })()"
FADE = """(async f=>{ const E=GAME.E, z=E.zone; E.cinematic(new THREE.Vector3(0,2.2,f+3.5),new THREE.Vector3(0,1.4,0)); E.camera.position.set(0,2.2,f+3.5); E.cam.look=new THREE.Vector3(0,1.4,0); E.camera.lookAt(E.cam.look);
    const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,250));
    const o={front:[],back:[]}; for(const w of z.walls){ const d=w.userData.dir; if(!d) continue; if(d.z<-0.5) o.front.push(+w.material.opacity.toFixed(2)); if(d.z>0.5) o.back.push(+w.material.opacity.toFixed(2)); } E.endCinematic(); return o; })"""
WALLMOUNT = """(MY=>{ const z=GAME.E.zone; z.group.updateMatrixWorld(true); const B=new THREE.Box3(), S=new THREE.Vector3();
    const side=d=>Math.abs(d.x)>0.5?(d.x>0?'left':'right'):(d.z>0?'back':'front');
    const body={}; for(const w of z.walls){ const d=w.userData.dir; if(!d||!w.isMesh) continue; B.setFromObject(w); B.getSize(S); const k=side(d); const area=(k==='left'||k==='right')?S.y*S.z:S.x*S.y;
      if(!body[k]||area>body[k].area) body[k]={area, plane:k==='back'?B.max.z:k==='front'?B.min.z:k==='left'?B.max.x:B.min.x}; }   /* 每面牆：面積最大的那個 WALL_ 網格＝牆本體，取它朝房間的那一面 */
    const skip=new Set(((z.winParts||[]).map(p=>p.obj)));
    const bad=[]; z.group.traverse(o=>{ if(!o.isMesh||z.walls.includes(o)||skip.has(o)) return; let v=true,p=o; while(p){ if(!p.visible) v=false; p=p.parent; } if(!v) return;
      B.setFromObject(o); if(B.isEmpty()||B.min.y<MY) return;   /* 碰到地面（< 0.5 m）的是落地家具，牆淡出時不會浮起來 */
      for(const k in body){ const P=body[k].plane; let lo,hi; if(k==='back'){ lo=B.min.z-P; hi=B.max.z-P; } else if(k==='front'){ lo=P-B.max.z; hi=P-B.min.z; } else if(k==='left'){ lo=B.min.x-P; hi=B.max.x-P; } else { lo=P-B.max.x; hi=P-B.min.x; }
        if(lo>-0.05&&hi<0.3) bad.push({name:o.name||'(mesh)', side:k, y:+B.min.y.toFixed(2), d:+hi.toFixed(2)}); } });
    return {planes:Object.fromEntries(Object.entries(body).map(([k,v])=>[k,+v.plane.toFixed(3)])), bad}; })"""
BACKSHOT = """(async f=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(0.8,2.3,-(f+3.2)),new THREE.Vector3(0,1.3,0)); E.camera.position.set(0.8,2.3,-(f+3.2)); E.cam.look=new THREE.Vector3(0,1.3,0); E.camera.lookAt(E.cam.look);
    const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,250)); return true; })"""
GLASS = """(async()=>{ const E=GAME.E, z=E.zone; const f0=E.frame; for(let i=0;i<240&&E.frame<f0+3;i++) await new Promise(r=>setTimeout(r,250));
    const out=[]; z.group.traverse(o=>{ if(o.isMesh&&/^WALL_/.test(o.name)&&/glass|screen/.test(o.name)) out.push({name:o.name, op:+o.material.opacity.toFixed(2), inWalls:z.walls.includes(o)}); }); return out; })()"""
NEG = """(async f=>{ const E=GAME.E, z=E.zone; const fw=z.walls.filter(w=>w.userData.dir&&w.userData.dir.z<-0.5); for(const w of fw) w.userData.dir.z=1;
    E.cinematic(new THREE.Vector3(0,2.2,f+3.5),new THREE.Vector3(0,1.4,0)); E.camera.position.set(0,2.2,f+3.5); const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,250));
    const op=fw.map(w=>+w.material.opacity.toFixed(2)); for(const w of fw) w.userData.dir.z=-1; E.endCinematic(); return op; })"""


async def check(pg, run, zid, cfg, formal):
    run.setup(f"讀檔到{cfg['name']}出生點 ({cfg['spawn']['x']},{cfg['spawn']['z']}) 11:00，關掉條件事件")
    await PL.load_state(pg, {'zone': zid, 'hour': 11, 'pos': cfg['spawn']}, quiet_events=True)
    tag = cfg['name'] + '：'
    if formal: run.check(tag + '正式模型接上（zone.formal）', await pg.evaluate(WAIT_FORMAL))
    else:
        await pg.wait_for_timeout(3000); run.check(tag + '?nobldg：沒有載入正式模型', not await pg.evaluate("!!GAME.E.zone.formal"))
    info = await pg.evaluate("""(()=>{ const z=GAME.E.zone; const fb=z.group.children.find(o=>o.name==='fallback');
        const sides={}; for(const w of z.walls){ const d=w.userData.dir; const k=d?(Math.abs(d.x)>0.5?(d.x>0?'left':'right'):(d.z>0?'back':'front')):'?'; sides[k]=(sides[k]||0)+1; }
        const seats=(z.seats||[]).map(s=>[+s.x.toFixed(2),+s.z.toFixed(2),+s.yaw.toFixed(4)]);
        return {fb:fb?fb.visible:null, sides, it:GAME.E.interactables.map(i=>[i.label,i.x,i.z]), seats}; })()""")
    if formal:
        run.check(tag + '程序化備用模型藏起來', info['fb'] is False, json.dumps(info['fb']))
        run.check(tag + '會淡出的牆有前後左右四面（WALL_*）', all(info['sides'].get(k, 0) > 0 for k in ('front', 'back', 'left', 'right')), json.dumps(info['sides']))
    else:
        run.check(tag + '?nobldg：程序化備用模型看得到', info['fb'] is True, json.dumps(info['fb']))
    got = {}
    for l, x, z in info['it']: got.setdefault(l, []).append((x, z))
    run.check(tag + '互動點（名稱、位置）不變', all(sorted(got.get(k, [])) == sorted(v) for k, v in cfg['it'].items()), json.dumps(info['it'], ensure_ascii=False))
    if cfg['seats'] is not None:
        run.check(tag + '座位（z.seats）不變', info['seats'] == [[round(a, 2), round(b, 2), round(c, 4)] for a, b, c in cfg['seats']], json.dumps(info['seats']))
    for (x, z, name) in cfg['blocked']: run.check(f'{tag}導航：{name} ({x},{z}) 擋住', not await pg.evaluate(f"GAME.E.nav.free({x},{z})"))
    for (x, z, name) in cfg['free']: run.check(f'{tag}導航：{name} ({x},{z}) 走得到', await pg.evaluate(f"GAME.E.nav.free({x},{z})"))
    if formal:
        fade = await pg.evaluate(FADE + '(%s)' % cfg['front'])
        run.check(tag + '鏡頭在前牆外：前牆淡出', len(fade['front']) > 0 and max(fade['front']) < 0.5, json.dumps(fade))
        run.check(tag + '鏡頭在前牆外：後牆不淡出', len(fade['back']) > 0 and min(fade['back']) > 0.9, json.dumps(fade['back']))
        neg = await pg.evaluate(NEG + '(%s)' % cfg['front'])
        run.check(tag + '（自我檢查）前牆 dir 故意弄反時，淡出檢查會失敗', len(neg) > 0 and max(neg) > 0.5, json.dumps(neg))
        wm = await pg.evaluate(WALLMOUNT + '(%s)' % cfg.get('mount_y', 0.5))
        run.check(tag + '貼在牆上的東西（離牆 0.3 m 內、離地 0.5 m 以上）都在那面牆的 WALL_ 群組裡（牆淡出時一起淡出，不會浮在半空中）', len(wm['planes']) == 4 and not wm['bad'], json.dumps(wm, ensure_ascii=False))
        gl = await pg.evaluate(GLASS)
        run.check(tag + '玻璃、紗窗保持透明（不在會淡出的牆裡；淡出邏輯會把不透明度設回 1，玻璃會變成灰板）', len(gl) > 0 and all(g['op'] < 0.5 and not g['inWalls'] for g in gl), json.dumps(gl))
        ex = await pg.evaluate("""(f=>{ const z=GAME.E.zone; const signs={}; z.group.traverse(o=>{ if(o.isMesh&&/SIGN_FACE_/.test(o.name)) signs[o.name]=!!(o.material.map&&o.material.map.image&&o.material.map.image.getContext); });
            const dv=z.winParts&&z.winParts.find(p=>Math.abs(p.at.z-f)<0.01&&Math.abs(p.at.x)<0.01); return {signs, door:!!(dv&&z.wins&&z.wins[0]&&dv.obj.material===z.wins[0].material)}; })(%s)""" % cfg['front'])
        run.check(f"{tag}牌子都有 canvas 字（{cfg['signs']} 面）", len(ex['signs']) == cfg['signs'] and all(ex['signs'].values()), json.dumps(ex['signs']))
        if cfg.get('door', True): run.check(tag + '自動門外的窗景和窗戶同一個材質', ex['door'], json.dumps(ex['door']))
        for n, (ax, want) in cfg.get('keep', {}).items():
            k = await pg.evaluate("(n=>{ const o=GAME.E.zone.group.getObjectByName(n); if(!o) return null; let v=true, p=o; while(p){ if(!p.visible) v=false; p=p.parent; } return {v, w:GAME.E.zone.walls.includes(o), x:+o.position.x.toFixed(3), z:+o.position.z.toFixed(3)}; })(%s)" % json.dumps(n))
            run.check(f'{tag}{n} 在遊戲裡（遊戲內容，不在正式模型裡）、貼在牆前（{ax}={want}）、跟著那面牆淡出（在 z.walls）', bool(k) and k['w'] and abs(k[ax] - want) < 0.02, json.dumps(k))
    await run.shot(pg, zid + ('_formal' if formal else '_nobldg'))
    if formal:   # 鏡頭在後牆外（後牆淡出）：貼在後牆的東西要跟著淡出
        await pg.evaluate(BACKSHOT + '(%s)' % cfg['front']); await run.shot(pg, zid + '_formal_from_back')
        for n in cfg.get('keep', {}):   # 鏡頭在後牆外看進來：月曆（洗手間隔間朝房間那一面）、傳單都看得到
            v = await pg.evaluate("(n=>{ const o=GAME.E.zone.group.getObjectByName(n); if(!o) return null; let v=o.material.opacity>0.5, p=o; while(p){ if(!p.visible) v=false; p=p.parent; } return v; })(%s)" % json.dumps(n))
            run.check(f'{tag}鏡頭在後牆外看進來：{n} 看得到', v is True, json.dumps(v))
        await pg.evaluate("GAME.E.endCinematic()")
    return await pg.evaluate(NAV_HASH)


async def main():
    run = PL.Run('interior_glb_integration', OUT); hashes = {}
    zones = [z for z in ZONES if not ONLY or z in ONLY]
    async with async_playwright() as p:
        for formal in (True, False):
            url = URL if formal else (URL + ('&' if '?' in URL else '?') + 'nobldg')
            b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
            await pg.goto(url); run.check(('一般網址' if formal else '?nobldg') + '：遊戲載入', await PL.wait_loaded(pg))
            for zid in zones: hashes[(zid, formal)] = await check(pg, run, zid, ZONES[zid], formal)
            run.check(('一般網址' if formal else '?nobldg') + '：沒有 JS 錯誤', not errs, '; '.join(errs[:3]))
            await b.close()
    for zid in zones:
        run.check(ZONES[zid]['name'] + '：導航格，正式模型和程序化版完全相同', hashes[(zid, True)] == hashes[(zid, False)], json.dumps([hashes[(zid, True)], hashes[(zid, False)]]))
    sys.exit(run.finish())


asyncio.run(main())
