"""CC-B（帳號 B）11-07：SHOP_WINDOW_718b（BB-B 05:08；SHOP-WINDOW-2D-1105）——溫州街「日常失速」立體店面（LAWWW2-B 95a86f15d，開發 718b59ec7）vs 原本的 2D 櫥窗（b550eb6c1）。
  兩個 SHA 各跑一次（同一支、同樣的鏡頭和時間），BB 並排看圖決定（使用者：「不比現在的櫥窗漂亮就照舊」）。
  截圖（白天 14:00、晚上 20:30）：
    front   正面：玩家站在店門口前 4 m（站得住、到店門中間沒有東西擋的那一點），面向店門
    corner  北側轉角：店門北邊（−z）6～10 m、斜看店面
    lane    主巷遠一點：離店門 14～22 m、看得到整排店面
    每張附 player.pos、鏡頭 eye／look／yaw／pitch，寫在 offbeat_shots.json。鏡頭位置照遊戲幾何自己找（兩個 SHA 幾何一樣＝同一個角度）。
  效能（白天）：主巷三個位置（溫州街兩端：離店最遠的兩個出口往裡 3 m、日常失速前 4 m）——玩家站在那裡、正常跑主迴圈 10 秒：
    fps 平均、最低（每一幀的間隔）、draw calls、triangles（E.renderer.info.render）。
  也看：門口「進去日常失速」的互動點還在、走到門口按得到；正面那張畫面截圖給 BB 看貼圖、招牌字、穿模。
  【前置／捷徑】讀檔到溫州街指定位置（條件事件關閉）；截圖停主迴圈、藏 HUD 和玩家。Windows＋GPU／SwiftShader ≠ iPhone（fps 只有電腦的數字有意義）。
用法：LW_TESTS=<wt>/tests [TAG=new|old] [WARM=10] python3 cc_offbeat_front_probe.py <url> <out>"""
import os, sys, json, asyncio, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
R = L.Run('offbeat_front', OUT); D.setup(R, OUT)
DAY = '2025-10-18'   # 星期六
TAG = os.environ.get('TAG') or 'run'
WARM = float(os.environ.get('WARM') or 0)   # 量 fps 之前先跑幾秒不記
DOOR = r"""(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.exit&&i.exit.to==='wz_offbeat'); const ex=(GAME.E.interactables||[]).filter(i=>i.exit&&!i.hidden).map(i=>({to:i.exit.to,label:i.label,x:+(+i.x).toFixed(2),z:+(+i.z).toFixed(2)}));
  return {door:it?{x:+(+it.x).toFixed(2),z:+(+it.z).toFixed(2),label:it.label,hidden:!!it.hidden}:null, exits:ex}; })()"""
# 以店門為中心找鏡頭：r 半徑、方向限制（north＝z 比店門小）、站得住（玩家那一層）、眼睛到店門中間沒有東西擋
PICK = r"""((q)=>{ const E=GAME.E, g=E.zone&&E.zone.group; const T=new THREE.Vector3(q.t[0],q.t[1],q.t[2]); const meshes=[]; g.traverse(o=>{ if(o.isMesh&&o.visible!==false) meshes.push(o); });
  const rc=new THREE.Raycaster(); let best=null;
  for(const r of q.radii) for(let a=0;a<360;a+=10){ const x=T.x+r*Math.sin(a*Math.PI/180), z=T.z+r*Math.cos(a*Math.PI/180); if(q.north&&!(z<T.z-q.north)) continue; if(!E.canStand(x,z,0.3,0)) continue;
    const e=new THREE.Vector3(x,q.h,z), d=T.clone().sub(e), Ld=d.length(); rc.set(e,d.normalize()); rc.far=Ld; const hit=rc.intersectObjects(meshes,false).find(h=>h.distance>0.3&&h.distance<Ld-0.8);
    const clear=hit?hit.distance/Ld:1; const sc=clear*10-Math.abs(r-q.radii[0])*0.1; if(!best||sc>best.sc) best={x:+x.toFixed(2),z:+z.toFixed(2),r,a,clear:+clear.toFixed(2),hit:hit?(hit.object.name||'(無名)'):null,sc}; }
  return best; })"""
CAMINFO = r"""(()=>{ const c=GAME.E.camera, d=new THREE.Vector3(); c.getWorldDirection(d); return {eye:[+c.position.x.toFixed(2),+c.position.y.toFixed(2),+c.position.z.toFixed(2)], yaw:+(Math.atan2(d.x,d.z)*180/Math.PI).toFixed(1), pitch:+(Math.asin(d.y)*180/Math.PI).toFixed(1), fov:+c.fov.toFixed(1)}; })()"""
FPS = r"""(async (ms)=>{ const E=GAME.E; const t=[]; let last=performance.now(); const t0=last; await new Promise(res=>{ const f=now=>{ t.push(now-last); last=now; if(now-t0<ms) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
  t.shift(); const avg=t.reduce((a,b)=>a+b,0)/Math.max(t.length,1), worst=Math.max(...t); const ri=E.renderer&&E.renderer.info&&E.renderer.info.render;
  return {frames:t.length, fpsAvg:+(1000/avg).toFixed(1), fpsMin:+(1000/worst).toFixed(1), msWorst:+worst.toFixed(1), calls:ri?ri.calls:null, tris:ri?ri.triangles:null}; })"""


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC OFFBEAT_FRONT（日常失速店面 %s）：SHA=%s（worktree 實際 %s）；Windows＋GPU／SwiftShader ≠ iPhone' % (TAG, os.environ.get('SHA', '?'), real or '?'), flush=True)
    out = {'tag': TAG, 'sha': os.environ.get('SHA', '?'), 'shots': [], 'perf': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        s = await D.load_zone(pg, cdp, 'wenzhou', DAY, 14.0, wait=8000)
        g = await pg.evaluate(DOOR)
        if not R.check('溫州街有「進去日常失速」的店門（exit.to＝wz_offbeat）', bool(g['door']) and not g['door']['hidden'], J(g)): await b.close(); sys.exit(1)
        dx, dz = g['door']['x'], g['door']['z']; tgt = [dx, 1.6, dz]
        views = {'front': await pg.evaluate(PICK, {'t': tgt, 'radii': [4.0, 4.5, 3.5], 'h': 1.6, 'north': 0}),
                 'corner': await pg.evaluate(PICK, {'t': tgt, 'radii': [8.0, 7.0, 9.0, 10.0, 6.0], 'h': 1.7, 'north': 4.0}),
                 'lane': await pg.evaluate(PICK, {'t': tgt, 'radii': [18.0, 16.0, 20.0, 22.0, 14.0], 'h': 2.2, 'north': 0})}
        R.note('店門 (%s, %s)；鏡頭點（站得住、到店門沒擋）：%s' % (dx, dz, J(views)))
        for nm, v in views.items():
            R.check('[%s] 找得到站得住、看得到店門的鏡頭點（clear ≥ 0.9）' % nm, bool(v) and v['clear'] >= 0.9, J(v))
        for tn, h in (('day', 14.0), ('night', 20.5)):
            for nm, v in views.items():
                if not v: continue
                tag = '[%s %s]' % (tn, nm)
                yaw = math.atan2(dx - v['x'], dz - v['z'])
                R.setup('%s 讀檔溫州街 (%s, %s) %s %05.2f 面向店門' % (tag, v['x'], v['z'], DAY, h))
                s = await D.load_zone(pg, cdp, 'wenzhou', DAY, h, x=v['x'], z=v['z'], yaw=yaw, wait=6000)
                eye = [v['x'], 1.6 if nm == 'front' else (1.7 if nm == 'corner' else 2.2), v['z']]
                c = await D.user_shot(pg, cdp, 'offbeat_%s_%s_%s' % (TAG, nm, tn), {'eye': eye, 'look': tgt, 'lens': 22 if nm != 'lane' else 30})
                out['shots'].append({'name': 'offbeat_%s_%s_%s.png' % (TAG, nm, tn), 'player': [s['x'], s['z']], 'cam': c})
        # 門口互動點：走到門口按得到（白天）
        s = await D.load_zone(pg, cdp, 'wenzhou', DAY, 14.0, x=views['front']['x'], z=views['front']['z'], wait=6000) if views['front'] else None
        if s:
            await L.go_to(pg, cdp, R, dx, dz, 0.5, '走到日常失速店門', max_s=60)
            q = await D.st(pg)
            for _ in range(8):
                if q['interact'].startswith('進去日常失速'): break
                await pg.wait_for_timeout(500); q = await D.st(pg)
            R.check('門口互動點「進去日常失速」還在、走到門口看得到', q['interact'].startswith('進去日常失速'), J({k: q[k] for k in ('x', 'z', 'interact')}))
        # 效能：主巷兩端（離店最遠的兩個出口往店的方向 3 m 內、站得住）＋店門前
        ex = sorted(g['exits'], key=lambda e: -((e['x'] - dx) ** 2 + (e['z'] - dz) ** 2))
        pts = []
        for e in ex[:6]:
            far = [p_ for p_ in pts if (p_[0] - e['x']) ** 2 + (p_[1] - e['z']) ** 2 < 100]
            if far: continue
            k_ = 3.0 / max(math.hypot(dx - e['x'], dz - e['z']), 0.01)
            sp = await pg.evaluate("((q)=>{ const E=GAME.E; for(let r=0;r<=2.5;r+=0.25) for(let a=0;a<360;a+=30){ const x=q[0]+r*Math.sin(a*Math.PI/180), z=q[1]+r*Math.cos(a*Math.PI/180); if(E.canStand(x,z,0.3,0)) return [+x.toFixed(2),+z.toFixed(2)]; } return null; })", [e['x'] + (dx - e['x']) * k_, e['z'] + (dz - e['z']) * k_])
            if sp: pts.append([sp[0], sp[1], '巷子一端（%s 往裡）' % e['label']])
            if len(pts) >= 2: break
        if views['front']: pts.append([views['front']['x'], views['front']['z'], '日常失速前'])
        for x, z, nm in pts:
            tag = '[fps %s]' % nm
            yaw = math.atan2(dx - x, dz - z) if nm != '日常失速前' else math.atan2(dx - x, dz - z)
            R.setup('%s 讀檔溫州街 (%s, %s) 14:00，面向日常失速' % (tag, x, z))
            await D.load_zone(pg, cdp, 'wenzhou', DAY, 14.0, x=x, z=z, yaw=yaw, wait=8000)
            await pg.wait_for_timeout(2000)
            if WARM > 0:   # 暖身（BB-B 06:43）：同一個位置先跑 WARM 秒不記（貼圖上傳、著色器編譯、陰影圖第一次算），再量
                await pg.evaluate(FPS, int(WARM * 1000))
            f = await pg.evaluate(FPS, 10000); c = await pg.evaluate(CAMINFO)
            R.note('%s 10 秒（暖身 %s 秒以後）：%s；鏡頭 %s' % (tag, WARM, J(f), J(c)))
            out['perf'].append({'where': nm, 'pos': [x, z], 'cam': c, **f})
        with open(os.path.join(OUT, 'offbeat_shots.json'), 'w', encoding='utf-8') as fo:
            json.dump(out, fo, ensure_ascii=False, indent=1)
        R.note('總表（offbeat_shots.json）：%s' % J(out['perf']))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
