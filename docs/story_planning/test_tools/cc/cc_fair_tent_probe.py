"""CC FAIR-TENT-CAM-1102（社博帳篷擋跟隨鏡頭；LAWWW 88bd03f56 接 LAWWW2 4a61b27e9，改前 9d4c54c16）——BB：真的走過攤位中間、走到帳篷後面，玩家有沒有被帳篷蓋住。
  修法（zones3d.js fairSeeThru）：正式模型（club_fair.glb 九攤、club_fair_expo.glb 36 頂＋舞台）每一攤接「樹幹透視」（material.userData.seeThrough＋E3.patchSeeThrough：
  擋在鏡頭和玩家之間的部分在玩家周圍網點透空，E.seeThrough.uSeeR>0 時生效）；鏡頭本身不動、不拉近。
兩天（DAYS，預設 2025-11-15、2026-09-12）：
  2025-11-15（大一校慶）＝zones3d.js clubFair 九頂一排：大道南側 z=15.1、面向北（ry=π），x＝FAIR_XS（照 f3b47894b 的 zones3d.js FAIR）；人站帳篷前 z≈13。
      路線：帳篷前面從西走到東（中間走道＝帳篷前那一條）→ 從 x≈−1.25 的空檔（−5.9 和 3.4 兩攤中間）繞到帳篷後面 → 帳篷後面幾個點。
  2026-09-12（大二社博）＝clubFairExpo 36 頂＋舞台（座標讀遊戲裡的 CLUB_FAIR_EXPO）：北排 z=−4.9（ry=0）、南排 z=4.9（ry=π），大道中間 z ±3.4 是走道。
      路線：大道中間從最西一頂走到最東一頂 → 北排、南排各兩頂的後面。
  每一個帳篷後面的點：停下來後，像玩家一樣用手指拖曳把鏡頭轉到帳篷那一側（鏡頭在玩家和帳篷之間的那一邊＝最容易被帳篷蓋住的角度），停 2.5 秒。
判定（BB 11-10）：走路、停下來的全程，每 0.1 秒左右（瀏覽器 requestAnimationFrame 裡取樣，跟著實際畫面）記：E.cam.dist、鏡頭到頭的距離、頭／左右肩看不看得到（cc_teayard_cam_probe.py OCC_JS 的射線法）、
  擋住的是什麼（打到的點在帳篷／舞台的範圍裡＝帳篷）、那一攤會不會透空（材質 seeThrough 而且 uSeeR>0＝網點透空，不算擋住）。
  FAIL＝頭被「不會透空的帳篷」連續擋住超過 0.3 秒，而且這段時間鏡頭沒有往前拉（鏡頭到頭 ≥ E.cam.dist − 0.5 m）。
  另外記：含會透空的帳篷在內的原始遮擋時間（看出透空有沒有用上）、其他東西（樹、建築）擋頭的時間（只記，不判）；每段終點、每個帳篷後面的點截圖＋比頭近的東西佔畫面比例（32×18 射線）。
【前置／捷徑】D.load_zone 讀檔擺日期、時間（HOUR，預設 14）、校園、站位（每天的起點）；條件事件、手機自動打開關掉（只測鏡頭）。之後全部 L.go_to 點地面／搖桿真的走、L.drag 真的拖曳。
  不用 ?turbo、不瞬移、不直接擺鏡頭。Playwright／SwiftShader ≠ iPhone；SwiftShader 1–4 fps 時取樣間隔會變長（每筆記實際時間）。
用法：LW_TESTS=<wt>/tests TAG=new|old [DAYS=2025-11-15,2026-09-12] [HOUR=14] python3 cc_fair_tent_probe.py <url> <out>；印 'ALL PASS'／'FAILED n: ...'"""
import os, sys, json, asyncio, math, time
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'; HOUR = float(os.environ.get('HOUR') or 14)
DAYS = [d.strip() for d in (os.environ.get('DAYS') or '2025-11-15,2026-09-12').split(',') if d.strip()]
BLOCK_S = 0.3; PULL_M = 0.5
R = L.Run('fair_tent_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
# zones3d.js（f3b47894b）的 FAIR／FAIR_Z：校慶、舊序章系所那一年的九頂一排（沒有匯出，照原始碼抄；遊戲裡再用導航格驗證每一頂真的在）
FAIR_XS = [-21.3, -17.8, -13.5, -9.7, -5.9, 3.4, 7.2, 11.0, 14.8]; FAIR_Z = 15.1

LAYOUT = r"""(()=>{ const expo=typeof Z3!=='undefined'&&Z3.isExpoDay?!!Z3.isExpoDay():null; const L=typeof CLUB_FAIR_EXPO!=='undefined'?CLUB_FAIR_EXPO:null;
  return {expo, key:CALENDAR.dateOf(GAME.G.day).key, tents:expo&&L?L.tents.map(t=>({id:t.id,label:t.label,x:t.x,z:t.z,ry:t.ry})):null, tent:L?L.tent:null, stage:expo&&L?L.stage:null,
    hasSeeThrough:!!(GAME.E.seeThrough&&GAME.E.seeThrough.uSeeR)}; })()"""
BLOCKED_AT = r"""(pts=>pts.map(([x,z])=>!GAME.E.canStand(x,z,0.3,0)))"""
STANDABLE = r"""(q=>{ const E=GAME.E; for(const dz of q.dzs) for(const dx of q.dxs){ const x=q.x+dx, z=q.z+dz; if(E.canStand(x,z,0.33,0)) return [+x.toFixed(2),+z.toFixed(2)]; } return null; })"""
# 帳篷模型的狀態：場景裡材質有 seeThrough 的網格、打到帳篷範圍的網格（正式模型載入了沒、透空接上了沒）
MODEL = r"""(F=>{ const E=GAME.E; let st=0, inF=0, stIn=0; const names={}; const box=new THREE.Box3(), c=new THREE.Vector3();
  E.scene.traverse(o=>{ if(!o.isMesh||o.isSkinnedMesh) return; let v=true; for(let q=o;q;q=q.parent) if(!q.visible){ v=false; break; } if(!v) return;
    const s=[].concat(o.material).every(m=>m&&m.userData&&m.userData.seeThrough); if(s) st++;
    if(!o.geometry) return; if(!o.geometry.boundingBox) o.geometry.computeBoundingBox(); box.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); box.getCenter(c);
    const hit=F.some(t=>c.x>t.x-t.hw&&c.x<t.x+t.hw&&c.z>t.z-t.hd&&c.z<t.z+t.hd)||(box.max.x-box.min.x>20&&F.some(t=>t.x>box.min.x&&t.x<box.max.x&&t.z>box.min.z&&t.z<box.max.z&&box.max.y<6));
    if(hit){ inF++; if(s) stIn++; const n=(o.name||'?')+'|'+(o.parent&&o.parent.name||''); names[n]=(names[n]||0)+1; } });
  return {seeThroughMeshes:st, fairMeshes:inF, fairSeeThrough:stIn, names:Object.entries(names).slice(0,12)}; })"""
# 取樣器：requestAnimationFrame 裡每 ≥0.1 秒一筆（跟著實際畫面；主迴圈更新鏡頭之後的狀態）。F＝帳篷／舞台的範圍（世界座標、軸對齊：帳篷都是 ry 0 或 π）
SAMPLER = r"""(F=>{ if(window.__FT&&window.__FT.stop) window.__FT.stop(); const E=GAME.E, rc=new THREE.Raycaster(), V=THREE.Vector3; let meshes=[], tM=-1e9, last=0, on=true; const log=[];
  const P=()=>E.player.obj;
  const isPlayer=o=>{ const p=P(); for(let q=o;q;q=q.parent) if(q===p) return true; return false; };
  const vis=o=>{ for(let q=o;q;q=q.parent) if(!q.visible) return false; const m=[].concat(o.material)[0]; return !(m&&(m.visible===false||(m.transparent&&m.opacity<0.15))); };
  const stOf=o=>[].concat(o.material).every(m=>m&&m.userData&&m.userData.seeThrough);
  const inFair=p=>{ for(const t of F) if(p.x>t.x-t.hw&&p.x<t.x+t.hw&&p.z>t.z-t.hd&&p.z<t.z+t.hd&&p.y<t.top) return t.id; return null; };
  const first=(from,dir,maxD)=>{ rc.set(from,dir); rc.near=0; rc.far=maxD; const h=rc.intersectObjects(meshes,false).filter(x=>vis(x.object)&&!isPlayer(x.object)); return h[0]||null; };
  function sample(now){ if(now-tM>2000){ meshes=[]; E.scene.traverse(o=>{ if(o.isMesh&&!o.isSkinnedMesh&&vis(o)) meshes.push(o); }); tM=now; }
    const cam=E.camera, C=E.cam, pp=P().position; cam.updateMatrixWorld(true);
    const head=new V(pp.x,pp.y+1.45,pp.z), right=new V().subVectors(head,cam.position).cross(new V(0,1,0)).normalize();
    const pts={head:head.clone(), shL:head.clone().add(new V(0,-0.2,0)).addScaledVector(right,-0.2), shR:head.clone().add(new V(0,-0.2,0)).addScaledVector(right,0.2)};
    const stOn=!!(E.seeThrough&&E.seeThrough.uSeeR&&E.seeThrough.uSeeR.value>0); const r={t:+now.toFixed(0), seg:window.__FT.seg, x:+pp.x.toFixed(2), z:+pp.z.toFixed(2), dist:+C.dist.toFixed(2),
      camHead:+cam.position.distanceTo(head).toFixed(2), yaw:+(((C.yaw*180/Math.PI)%360+360)%360).toFixed(0), mode:C.mode, stOn, moving:!!(E.player.path&&E.player.path.length), hit:{}};
    for(const k in pts){ const d=pts[k].clone().sub(cam.position), Ln=d.length(); const h=first(cam.position,d.normalize(),Ln-0.05);
      if(h){ const tent=inFair(h.point), st=stOf(h.object); r.hit[k]={by:(h.object.name||(h.object.parent&&h.object.parent.name)||'?').slice(0,40), d:+h.distance.toFixed(2), tent, st, hard:!(st&&stOn)}; } }
    log.push(r); }
  function loop(){ if(!on) return; const now=performance.now(); if(now-last>=100&&!E.paused){ last=now; try{ sample(now); }catch(e){ log.push({t:now,err:String(e).slice(0,120)}); } } requestAnimationFrame(loop); }
  window.__FT={seg:'start', log, stop(){ on=false; }}; requestAnimationFrame(loop); return true; })"""
OCC_JS = r"""(()=>{ const E=GAME.E, cam=E.camera, P=E.player.obj, pp=P.position; cam.updateMatrixWorld(true);
  const head=new THREE.Vector3(pp.x,pp.y+1.45,pp.z), dHead=cam.position.distanceTo(head), rc=new THREE.Raycaster();
  const isPlayer=o=>{ for(let q=o;q;q=q.parent) if(q===P) return true; return false; };
  const vis=o=>{ for(let q=o;q;q=q.parent) if(!q.visible) return false; const m=[].concat(o.material)[0]; return !(m&&(m.visible===false||(m.transparent&&m.opacity<0.15))); };
  const stOn=!!(E.seeThrough&&E.seeThrough.uSeeR&&E.seeThrough.uSeeR.value>0), stOf=o=>[].concat(o.material).every(m=>m&&m.userData&&m.userData.seeThrough);
  const meshes=[]; E.scene.traverse(o=>{ if(o.isMesh&&!o.isSkinnedMesh&&vis(o)) meshes.push(o); });
  const hitFirst=(from,dir,maxD)=>{ rc.set(from,dir); rc.far=maxD; const h=rc.intersectObjects(meshes,false).filter(x=>vis(x.object)&&!isPlayer(x.object)); return h[0]||null; };
  let near=0,nearHard=0,n=0; const v=new THREE.Vector3(); for(let j=0;j<18;j++) for(let i=0;i<32;i++){ v.set((i+0.5)/32*2-1,(j+0.5)/18*2-1,0.5).unproject(cam).sub(cam.position).normalize(); const h=hitFirst(cam.position,v,dHead-0.3); n++; if(h){ near++; if(!(stOn&&stOf(h.object))) nearHard++; } }
  const right=new THREE.Vector3().subVectors(head,cam.position).cross(new THREE.Vector3(0,1,0)).normalize();
  const pts={head:head.clone(), shoulderL:head.clone().add(new THREE.Vector3(0,-0.2,0)).addScaledVector(right,-0.2), shoulderR:head.clone().add(new THREE.Vector3(0,-0.2,0)).addScaledVector(right,0.2)};
  const seen={}, by={}; for(const k in pts){ const d=pts[k].clone().sub(cam.position), L=d.length(); const h=hitFirst(cam.position,d.normalize(),L-0.05); seen[k]=!h; if(h) by[k]=(h.object.name||h.object.parent&&h.object.parent.name||'?')+' @'+h.distance.toFixed(2)+(stOf(h.object)?'（會透空）':''); }
  return {nearFrac:+(near/n).toFixed(3), nearHardFrac:+(nearHard/n).toFixed(3), seen, blockedBy:by, stOn, dist:+E.cam.dist.toFixed(2), camHead:+dHead.toFixed(2)}; })()"""
CAMYAW = "(()=>+(((GAME.E.cam.yaw*180/Math.PI)%360+360)%360).toFixed(1))()"


async def close_dlgs(pg, cdp):
    for _ in range(12):
        s = await D.st(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        if s['choices']:
            R.note('跳出選項 %s（照玩家點最後一個：通常是「先不要／不去了」）' % J(s['choices']))
            c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent!==null); const e=b[b.length-1]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
            if c: await L.touch_tap(cdp, c[0], c[1])
            await pg.wait_for_timeout(900); continue
        break


async def shot(pg, name):
    await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(300)
    try: await pg.screenshot(path=os.path.join(OUT, 'fairtent_%s_%s.png' % (TAG, name)))
    except Exception as e: R.note('截圖失敗 %s：%s' % (name, e))
    await pg.evaluate(D.HUD + '(true)')


async def seg(pg, name):
    await pg.evaluate("n=>{ if(window.__FT) window.__FT.seg=n; }", name)


async def drag_cam_to(pg, cdp, yd):
    """真的拖曳（同 cc_teayard_cam_probe.py：一次最多 300 px、0.0075 rad/px），把鏡頭轉到 yaw＝yd 度（鏡頭在玩家的 (sin yaw, cos yaw) 那一側）"""
    for _ in range(8):
        y = await pg.evaluate(CAMYAW); d = (yd - y + 540) % 360 - 180
        if abs(d) < 5: return True
        px = max(-300, min(300, -math.radians(d) / 0.0075))
        await L.drag(pg, cdp, 422 - px / 2, 120, 422 + px / 2, 120, steps=12); await pg.wait_for_timeout(400)
    y = await pg.evaluate(CAMYAW); return abs((yd - y + 540) % 360 - 180) < 8


def runs(log, pred):
    """連續滿足 pred 的取樣段：[(seg, 開始 t, 結束 t, 筆數, 第一筆)]；時間＝第一筆到最後一筆（看得到的連續擋住時間）"""
    out = []; cur = None
    for r in log:
        if 'err' in r: continue
        if pred(r):
            if cur is None: cur = [r['seg'], r['t'], r['t'], 1, r]
            else: cur[2] = r['t']; cur[3] += 1
        elif cur is not None: out.append(tuple(cur)); cur = None
    if cur is not None: out.append(tuple(cur))
    return out


def pulled(r): return r['camHead'] < r['dist'] - PULL_M
def tent_hard(r): h = r['hit'].get('head'); return bool(h and h['tent'] and h['hard'])
def tent_any(r): h = r['hit'].get('head'); return bool(h and h['tent'])
def other_hit(r): h = r['hit'].get('head'); return bool(h and not h['tent'] and h['hard'])


def judge(day, log):
    good = [r for r in log if 'err' not in r]
    errs = [r for r in log if 'err' in r]
    if errs: R.note('%s 取樣例外 %d 筆（例：%s）' % (day, len(errs), errs[0]['err']))
    gaps = [b['t'] - a['t'] for a, b in zip(good, good[1:]) if a['seg'] == b['seg']]
    gaps.sort()
    R.note('%s 取樣 %d 筆；間隔中位數 %s ms（SwiftShader 會比 100 ms 長很多）' % (day, len(good), gaps[len(gaps) // 2] if gaps else '?'))
    R.check('%s 有取到樣（≥20 筆）' % day, len(good) >= 20, str(len(good)))
    segs = []
    for r in good:
        if not segs or segs[-1] != r['seg']: segs.append(r['seg'])
    bad_all = []
    for s in segs:
        rs = [r for r in good if r['seg'] == s]
        hard = [x for x in runs(rs, lambda r: tent_hard(r) and not pulled(r))]
        anyr = runs(rs, tent_any); oth = runs(rs, other_hit)
        mx = max([(b - a) / 1000.0 for _, a, b, _, _ in hard] or [0])
        mxa = max([(b - a) / 1000.0 for _, a, b, _, _ in anyr] or [0])
        mxo = max([(b - a) / 1000.0 for _, a, b, _, _ in oth] or [0])
        npull = sum(1 for r in rs if tent_any(r) and pulled(r))
        R.note('%s 段「%s」%d 筆：頭被不會透空的帳篷擋（鏡頭沒拉近）最長 %.2f 秒（%d 段）；含會透空的帳篷 最長 %.2f 秒（%d 筆）；帳篷擋住時鏡頭有拉近 %d 筆；其他東西擋頭 最長 %.2f 秒' %
               (day, s, len(rs), mx, len(hard), mxa, sum(1 for r in rs if tent_any(r)), npull, mxo))
        for _, a, b, n, r0 in hard:
            if (b - a) / 1000.0 > BLOCK_S: bad_all.append({'seg': s, 'sec': round((b - a) / 1000.0, 2), 'n': n, 'at': [r0['x'], r0['z']], 'yaw': r0['yaw'], 'dist': r0['dist'], 'camHead': r0['camHead'], 'by': r0['hit']['head'], 'stOn': r0['stOn']})
        if oth and mxo > BLOCK_S:
            o = next(r0 for _, a, b, _, r0 in oth if (b - a) / 1000.0 == mxo)
            R.note('%s 段「%s」其他東西擋頭（不判，只記）：%s' % (day, s, J({'at': [o['x'], o['z']], 'by': o['hit']['head'], 'yaw': o['yaw']})))
    R.check('%s 頭沒有被不會透空的帳篷連續擋住超過 %.1f 秒（鏡頭沒拉近的情況）' % (day, BLOCK_S), not bad_all, J(bad_all[:6]))
    return bad_all


async def walk(pg, cdp, x, z, label, near=0.8, max_s=300):
    fb0 = (await D.st(pg))['fb']
    ok = await L.go_to(pg, cdp, R, x, z, near, label, max_s=max_s, stop=lambda s: bool(s['dlg'] or s['choices']))
    s = await D.st(pg)
    if s['dlg'] or s['choices']:
        await close_dlgs(pg, cdp); ok = await L.go_to(pg, cdp, R, x, z, near, label + '（繼續）', max_s=max_s)
    s = await D.settle(pg)
    R.check('%s：真的走到了（%.1f m 內、沒有被放到目的地）' % (label, near + 0.4), bool(ok) and s['fb'] == fb0 and math.hypot(s['x'] - x, s['z'] - z) <= near + 0.4 and s['zone'] == 'campus', J({'x': s['x'], 'z': s['z'], 'fb': s['fb'] - fb0, 'zone': s['zone']}))
    return s


async def behind(pg, cdp, day, name, t, F):
    """走到帳篷 t 的後面、把鏡頭拖到帳篷那一側、停 2.5 秒"""
    fx, fz = math.sin(t['ry']), math.cos(t['ry'])   # 正面朝向（局部 +z 轉 ry）
    q = {'x': t['x'] - fx * 2.6, 'z': t['z'] - fz * 2.6, 'dxs': [0, 0.5, -0.5, 1.0, -1.0], 'dzs': [0, -fz * 0.5, fz * 0.4, -fz * 1.0, -fz * 1.5]}
    p = await pg.evaluate(STANDABLE, q)
    if not p:
        R.note('%s %s：帳篷「%s」(%s, %s) 後面 2.6 m 附近站不住（候選中心 (%.2f, %.2f)）' % (day, name, t.get('label', t['id']), t['x'], t['z'], q['x'], q['z'])); return None
    await seg(pg, name + '（走過去）')
    s = await walk(pg, cdp, p[0], p[1], '%s %s：走到帳篷「%s」後面 %s' % (day, name, t.get('label', t['id']), p), near=0.7)
    await seg(pg, name + '（停在帳篷後面、鏡頭在帳篷那一側）')
    yd = math.degrees(math.atan2(t['x'] - s['x'], t['z'] - s['z'])) % 360   # 鏡頭在玩家往帳篷的那一側
    ok = await drag_cam_to(pg, cdp, yd)
    R.note('%s %s：拖曳鏡頭到 %.0f°（帳篷那一側）：%s，現在 %.0f°' % (day, name, yd, '到了' if ok else '沒轉到', await pg.evaluate(CAMYAW)))
    await pg.wait_for_timeout(2500)
    oc = await pg.evaluate(OCC_JS)
    R.note('%s %s：比頭近的東西佔畫面 %.1f%%（不會透空的 %.1f%%）；看得到 頭 %s、左肩 %s、右肩 %s；擋住的 %s；透空生效 %s；dist %s、鏡頭到頭 %s' %
           (day, name, oc['nearFrac'] * 100, oc['nearHardFrac'] * 100, oc['seen']['head'], oc['seen']['shoulderL'], oc['seen']['shoulderR'], J(oc['blockedBy']), oc['stOn'], oc['dist'], oc['camHead']))
    await shot(pg, '%s_%s' % (day, name))
    return oc


async def run_day(pg, cdp, day):
    t = '[%s]' % day
    # 起點：先讀到這一天（區域預設出生點）量帳篷，再讀一次站到路線起點
    R.setup('%s 【前置／捷徑】D.load_zone 讀檔到 %s %.1f 時、校園（預設出生點；條件事件、手機自動打開關掉）' % (t, day, HOUR))
    await D.load_zone(pg, cdp, 'campus', day, HOUR, wait=9000)
    lay = await pg.evaluate(LAYOUT)
    R.note('%s 遊戲裡：日期 %s、社博 36 頂（isExpoDay）%s、透空功能 %s' % (t, lay['key'], lay['expo'], lay['hasSeeThrough']))
    if not R.check('%s 讀到的日期對' % t, lay['key'] == day, lay['key']): return
    if lay['expo']:
        tents = lay['tents']; w = (lay['tent'] or {}).get('w', 3.0); dd = (lay['tent'] or {}).get('d', 3.0)
        F = [{'id': x['id'], 'x': x['x'], 'z': x['z'], 'hw': w / 2 + 0.25, 'hd': dd / 2 + 0.25, 'top': 4.0} for x in tents]
        stg = lay['stage']
        if stg: F.append({'id': 'stage', 'x': stg['x'], 'z': stg['z'], 'hw': stg['w'] / 2 + 0.6, 'hd': stg['d'] / 2 + 0.6, 'top': 7.0})
    else:
        tents = [{'id': 'fair%d' % i, 'label': '九頂之 %d' % (i + 1), 'x': x, 'z': FAIR_Z, 'ry': math.pi} for i, x in enumerate(FAIR_XS)]
        F = [{'id': x['id'], 'x': x['x'], 'z': x['z'], 'hw': 1.75, 'hd': 1.75, 'top': 4.0} for x in tents]
    blk = await pg.evaluate(BLOCKED_AT, [[x['x'], x['z']] for x in tents])
    R.note('%s 帳篷 %d 頂（%s）；帳篷中心被導航擋住的 %d 頂' % (t, len(tents), '36 頂＋舞台' if lay['expo'] else '九頂一排', sum(blk)))
    if not R.check('%s 帳篷真的擺出來了（帳篷中心導航格擋住 ≥ 一半）' % t, sum(blk) * 2 >= len(tents), J(blk)): return
    # 路線
    if lay['expo']:
        xs = sorted(x['x'] for x in tents); x0, x1 = xs[0] - 2.5, xs[-1] + 2.5
        aisle_z = 0.0
        p0 = await pg.evaluate(STANDABLE, {'x': x0, 'z': aisle_z, 'dxs': [0, 1, 2, -1], 'dzs': [0, 0.5, -0.5, 1.0]})
        p1 = await pg.evaluate(STANDABLE, {'x': x1, 'z': aisle_z, 'dxs': [0, -1, -2, 1], 'dzs': [0, 0.5, -0.5, 1.0]})
        mids = [x0 + (x1 - x0) * k / 4.0 for k in (1, 2, 3)]
        north = [x for x in tents if abs(x['ry']) < 0.1]; south = [x for x in tents if abs(x['ry']) >= 0.1 and abs(x['z']) < 8]
        pick = lambda L0, n: [L0[int(i * (len(L0) - 1) / max(1, n - 1))] for i in range(n)] if L0 else []
        backs = pick(sorted(north, key=lambda q: q['x']), 2) + pick(sorted(south, key=lambda q: -q['x']), 2)
        via = None
    else:
        p0 = p1 = None
        for zz in (13.0, 12.8, 13.2, 12.5, 13.5, 12.2):
            a = await pg.evaluate(STANDABLE, {'x': -23.0, 'z': zz, 'dxs': [0, 0.5, 1.0], 'dzs': [0]})
            b = await pg.evaluate(STANDABLE, {'x': 17.0, 'z': zz, 'dxs': [0, -0.5, -1.0], 'dzs': [0]})
            if a and b: p0, p1, aisle_z = a, b, zz; break
        if not p0: aisle_z = 13.0
        x0, x1 = (p0 or [-23, 0])[0], (p1 or [17, 0])[0]
        mids = [-12.0, -1.25, 9.0]
        gap_x = -1.25
        via = await pg.evaluate(STANDABLE, {'x': gap_x, 'z': FAIR_Z, 'dxs': [0, 0.5, -0.5], 'dzs': [0, 1.0, -1.0]})
        by_x = {round(x['x'], 1): x for x in tents}
        backs = [by_x[k] for k in (3.4, 7.2, -5.9, -13.5) if k in by_x]
    R.note('%s 路線：走道 z=%.1f，%s → %s（中間 %s）；帳篷後面的點：%s' % (t, aisle_z, p0, p1, [round(m, 1) for m in mids], J([(b.get('label', b['id']), b['x'], b['z']) for b in backs])))
    if not R.check('%s 走道兩端站得住' % t, bool(p0 and p1), J([p0, p1])): return
    R.setup('%s 【前置／捷徑】再讀一次檔，站到走道起點 %s（之後全部真的走）' % (t, p0))
    await D.load_zone(pg, cdp, 'campus', day, HOUR, x=p0[0], z=p0[1], yaw=-math.pi / 2, wait=9000)
    await close_dlgs(pg, cdp)
    mdl = await pg.evaluate(MODEL, F)
    R.note('%s 場景裡會透空的網格 %d 個；在帳篷範圍的網格 %d 個（會透空 %d）；名字 %s' % (t, mdl['seeThroughMeshes'], mdl['fairMeshes'], mdl['fairSeeThrough'], J(mdl['names'])))
    await pg.evaluate(SAMPLER, F)
    await shot(pg, '%s_0_start' % day)
    # ① 走道一端走到另一端（分四段，每段截圖）
    pts = [(m, aisle_z) for m in mids] + [tuple(p1)]
    for i, (x, z) in enumerate(pts):
        nm = '走道第 %d 段' % (i + 1)
        await seg(pg, nm)
        await walk(pg, cdp, x, z, '%s %s → (%.1f, %.1f)' % (t, nm, x, z), near=0.9, max_s=240)
        oc = await pg.evaluate(OCC_JS)
        R.note('%s %s 終點：比頭近的東西 %.1f%%（不會透空 %.1f%%）；看得到頭 %s；擋住 %s' % (t, nm, oc['nearFrac'] * 100, oc['nearHardFrac'] * 100, oc['seen']['head'], J(oc['blockedBy'])))
        await shot(pg, '%s_1_aisle%d' % (day, i + 1))
    # ② 繞到帳篷後面
    if via:
        await seg(pg, '穿過空檔到帳篷後面')
        await walk(pg, cdp, via[0], via[1], '%s 穿過兩攤中間的空檔 %s' % (t, via), near=0.8)
        await shot(pg, '%s_2_gap' % day)
    elif not lay['expo']:
        R.note('%s 空檔 x=-1.25 附近站不住：直接走去帳篷後面（讓遊戲自己找路）' % t)
    nb = 0
    for k, b in enumerate(backs):
        oc = await behind(pg, cdp, day, '帳篷後面%d' % (k + 1), b, F)
        if oc is not None: nb += 1
    R.check('%s 帳篷後面至少走到兩個點' % t, nb >= 2, '%d／%d' % (nb, len(backs)))
    log = await pg.evaluate("(()=>{ const L=window.__FT?window.__FT.log:[]; if(window.__FT) window.__FT.stop(); return L; })()")
    json.dump(log, open(os.path.join(OUT, 'fairtent_%s_%s.json' % (TAG, day)), 'w'), ensure_ascii=False)
    judge(t, log)
    if not lay['expo'] and mdl['fairSeeThrough'] == 0:
        R.note('%s 注意：帳篷範圍裡沒有會透空的網格——正式模型沒載入（備用帳篷不接透空）或是改前的版本' % t)


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC FAIR-TENT-CAM-1102 社博帳篷擋鏡頭：worktree %s；TAG %s；日子 %s；%.1f 時；Playwright ≠ iPhone' % (real or '?', TAG, DAYS, HOUR), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        for day in DAYS:
            print('==== %s ====' % day, flush=True)
            try: await run_day(pg, cdp, day)
            except Exception as e:
                R.check('[%s] 探針沒有例外' % day, False, repr(e)[:300]); await shot(pg, day + '_exception')
                try: await pg.evaluate("(()=>{ if(window.__FT) window.__FT.stop(); })()")
                except Exception: pass
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
