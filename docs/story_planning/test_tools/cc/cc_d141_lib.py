"""CC-C（帳號 C）11-05：D141（場景最多 3 版就進遊戲，只擋五種：走不到、坐不下、穿模、卡住、黑畫面）店家探針的共用函式。
  從 cc_nanyang_v1_probe.py 拆出來＋多樓層（lv）：SHANLAN_v1、WZLIN_v1c 用。判定歸 BB（D132：BB 自己做的室內交 LAWWW-C 判）。
  用法：import cc_d141_lib as D；D.setup(R, J) 之後 D.use_exit／D.sit_all／D.walk_logged／D.shot／D.closed_door／D.user_shot。"""
import os, io, json, math, time, asyncio
import playlib as L

R = None
J = lambda o: json.dumps(o, ensure_ascii=False)
OUT = '.'
ST = r"""(()=>{ const E=GAME.E, P=E.player, o=P.obj.position; const ch=document.getElementById('choices'), it=document.getElementById('interact');
  const choices=(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>(b.innerText||'').trim()):[];
  return {zone:GAME.G.zone, x:+o.x.toFixed(3), z:+o.z.toFixed(3), y:+o.y.toFixed(3), lv:P.lv|0, seat:!!P.seat, busy:!!P.busy, dlg:!!(GAME.D&&GAME.D.active), choices,
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim().slice(0,24):'',
    stand:E.canStand?!!E.canStand(o.x,o.z,0.3,P.lv|0):null, fb:GAME.walkFallbacks||0, hour:+(+GAME.G.hour).toFixed(2)}; })()"""
SEATS = r"""(()=>GAME.E.interactables.filter(i=>i.seat&&!i.hidden).map(i=>{ const ap=GAME.seatApproach?GAME.seatApproach(i.seat):null, s=i.seat;
  return {label:i.label, x:+i.x.toFixed(2), z:+i.z.toFixed(2), lv:(i.lv|0), sx:+s.x.toFixed(3), sz:+s.z.toFixed(3), sy:s.y==null?null:+(+s.y).toFixed(3), slv:(s.lv|0), row:i.row||null, ap:ap?[+ap[0].toFixed(2),+ap[1].toFixed(2)]:null, lift:s.lift==null?0:+(+s.lift).toFixed(3)}; }))()"""
EXITS = r"""(()=>GAME.E.interactables.filter(i=>i.exit&&!i.hidden).map(i=>({label:i.label, x:+i.x.toFixed(2), z:+i.z.toFixed(2), r:i.radius||1, lv:(i.lv|0), to:i.exit.to})))()"""
CAM = r"""((C)=>{ const E=GAME.E, cam=E.camera, V=THREE.Vector3; const hf=2*Math.atan(18/(C.lens||24)), vf=2*Math.atan(Math.tan(hf/2)/(innerWidth/innerHeight));
  E.paused=true; E.cinematic&&E.cinematic(new V(...C.eye),new V(...C.look));
  for(let i=0;i<2;i++){ cam.position.set(...C.eye); E.cam.look=new V(...C.look); cam.lookAt(E.cam.look); cam.updateMatrixWorld(); } cam.fov=vf*180/Math.PI; cam.updateProjectionMatrix();
  try{ if(E.sky) E.sky.position.copy(cam.position); if(E.skyline) E.skyline.position.set(cam.position.x,0,cam.position.z); }catch(e){}   /* CC-B 08:4x：天空球跟著鏡頭走是主迴圈做的（engine3d 主迴圈 E.sky.position.copy(camera.position)）；暫停後搬鏡頭到 60 m 外，天空停在原地＝鏡頭在天空球外面、畫面上半部全黑（GYM_DOME_r3 PC）*/
  try{ const fr=new THREE.Frustum(), sp=new THREE.Sphere(), M=new THREE.Matrix4(); cam.updateMatrixWorld(); M.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse); fr.setFromProjectionMatrix(M);
    const lim0=E.q&&E.q.level==='low'?34:(E.q&&E.q.level==='high'?95:60);
    for(const n of (E.npcs||[])){ const o=n&&n.obj; if(!o) continue; const cd=Math.hypot(cam.position.x-o.position.x,cam.position.z-o.position.z); const lim=n.lodLim&&E.q&&n.lodLim[E.q.level]?Math.min(lim0,n.lodLim[E.q.level]):lim0;
      sp.center.set(o.position.x,o.position.y+0.9,o.position.z); sp.radius=1.3; o.visible=!n.hidden&&(cd<lim||!n.isExtra)&&fr.intersectsSphere(sp)&&!(E.zone&&E.zone.hideAbove!==undefined&&o.position.y>E.zone.hideAbove-0.5); } }catch(e){}   /* CC-B 09:1x（LAWWW2-B 09:14）：NPC 顯不顯示是主迴圈 updateNPC 照跟隨鏡頭的視錐設的；暫停後換角度，原本在畫面外的人會一直藏著——照同一條規則（engine3d.js updateNPC 的 vis）用新鏡頭重算，不呼叫 updateNPC（會動到路線、動作）*/
  try{ const ind=!!E.indoor; for(const n of (E.npcs||[])){ const o=n&&n.obj; if(!o||!n.isExtra||!o.userData.farLOD) continue; const cd=Math.hypot(cam.position.x-o.position.x,cam.position.z-o.position.z); const was=!!o.userData.isFar, far=cd>(ind&&CHAR.FAR_OUT_IN?CHAR.FAR_OUT_IN:CHAR.FAR_OUT); CHAR.setFar(o,far); if(was&&!far) CHAR.animate(o,0.016,{pose:n.pose,speed:n.speed}); } }catch(e){}   /* CC-B 11-07 13:4x：無名路人的遠距離版本照「暫停後的鏡頭」重新決定（engine3d updateNPC 的 farWant；之前沒做，鏡頭搬到路人旁邊時近拍到遠距離版本＝灰眼睛，WZ_TPOSE ③）*/
  try{ for(const x of (E.extras||[])) if(x&&x.obj&&x.obj.name==='treeFieldExtra'&&x.update){ x.last=null; x.update(0); } }catch(e){}   /* CC-B 09:1x：行道樹（TK TreeField）照鏡頭的視錐重排，是主迴圈 extras.update 做的；暫停後搬鏡頭，樹還是舊視錐那一批（XS_NORTH_ROAD_r2 PC 分隔島 9 棵樹全不見）*/
  try{ if(E.zone&&E.zone.fadeWalls) E.zone.fadeWalls(cam,E.player.obj.position); if(E.hideFaded) E.hideFaded(); if(E.updateLevelVis) E.updateLevelVis(); }catch(e){}   /* LAWWW2-B 08:37（6b92262a6）：暫停以後 fadeWalls 不會照新的鏡頭重算——鏡頭搬進店裡，窗景卡還是「鏡頭在牆外」那時藏起來的狀態（FA05_NIGHT 一樓三張只看到天空）*/
  E.render();
  return {eye:C.eye, look:C.look, lens:C.lens||24, vfov:+(vf*180/Math.PI).toFixed(2)}; })"""
UNCAM = r"""(()=>{ const E=GAME.E; E.paused=false; if(E.endCinematic) E.endCinematic(); return true; })()"""
HUD = r"""(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast','choices','btnGo','btnQuick']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""


def setup(run, out):
    global R, OUT
    R = run; OUT = out


def lum(png_bytes):
    try:
        from PIL import Image, ImageStat
    except ImportError:
        return None
    im = Image.open(io.BytesIO(png_bytes)).convert('L'); s = ImageStat.Stat(im)
    return [round(s.mean[0], 1), round(s.stddev[0], 1)]


async def lum_browser(pg, png_bytes):
    """沒有 PIL（PC 11-05：沒裝）：把截圖丟回瀏覽器用 canvas 算平均亮度、標準差（每 4 個像素取 1 個）"""
    import base64
    try:
        return await pg.evaluate("""(async b64=>{ const im=new Image(); im.src='data:image/png;base64,'+b64; await im.decode(); const c=document.createElement('canvas'); c.width=im.width; c.height=im.height;
          const x=c.getContext('2d'); x.drawImage(im,0,0); const d=x.getImageData(0,0,c.width,c.height).data; let n=0,s=0,s2=0;
          for(let i=0;i<d.length;i+=16){ const y=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]; s+=y; s2+=y*y; n++; } const m=s/n; return [+m.toFixed(1), +Math.sqrt(Math.max(0,s2/n-m*m)).toFixed(1)]; })""", base64.b64encode(png_bytes).decode())
    except Exception:
        return None


async def shot(pg, name, judge_black=True):
    b = await pg.screenshot(path=os.path.join(OUT, name + '.png')); m = lum(b)
    if m is None: m = await lum_browser(pg, b)
    if judge_black and m is not None:
        R.check('[黑畫面] %s 不是黑畫面（平均亮度 %s、變化 %s）' % (name, m[0], m[1]), not (m[0] < 6 and m[1] < 4), J(m))
    elif m is None: R.note('[黑畫面] %s：沒有 PIL，沒算亮度（看截圖）' % name)
    return m


async def st(pg):
    return await pg.evaluate(ST)


async def wait_zone(pg, cdp, zone, max_s=40):
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await st(pg)
        if s['zone'] == zone and not s['busy'] and not s['dlg']: return s
        if s['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    return await st(pg)


async def pushable(pg, cdp):
    for dx, dy in ((0, 60), (60, 0), (-60, 0), (0, -60)):
        moved, _, _ = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=2)
        if moved >= 0.3: return round(moved, 2)
    return 0.0


async def settle(pg, ms=600, max_s=6):
    """等人停下來（PC 的 GPU 跑得快：go_to 說到了，人還在走——11-05 NANYANG_v1 PC：停在目標後面 1.4 m）"""
    t0 = time.time(); last = None; still = 0
    while time.time() - t0 < max_s:
        s = await st(pg); cur = (round(s['x'], 2), round(s['z'], 2))
        if cur == last: still += 150
        else: still = 0
        if still >= ms: return s
        last = cur; await pg.wait_for_timeout(150)
    return await st(pg)


NEAR_IT = r"""(()=>{ const it=GAME.E.nearestInteractable&&GAME.E.nearestInteractable(); if(!it) return null; return {label:it.label||'', seat:it.seat?[+it.seat.x.toFixed(3),+it.seat.z.toFixed(3)]:null, exit:it.exit?it.exit.to:null}; })()"""
WIN_CELL = r"""((q)=>{ const E=GAME.E, P=E.player.obj.position; const its=E.interactables.filter(i=>i.seat&&!i.hidden&&((i.lv|0)===q.lv)); const me=its.find(i=>Math.abs(i.seat.x-q.sx)<1e-3&&Math.abs(i.seat.z-q.sz)<1e-3); if(!me) return null; let best=null;
  for(let x=me.x-1.0;x<=me.x+1.0+1e-6;x+=0.1) for(let z=me.z-1.0;z<=me.z+1.0+1e-6;z+=0.1){ if(!E.canStand(x,z,0.3,q.lv)) continue; const inR=its.filter(i=>Math.hypot(i.x-x,i.z-z)<=(i.radius||0.8)-0.1); if(!inR.length) continue;
    inR.sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z)); if(inR[0]!==me) continue; const second=inR[1]?Math.hypot(inR[1].x-x,inR[1].z-z)-Math.hypot(me.x-x,me.z-z):9; const sc=second*2-Math.hypot(x-q.ap[0],z-q.ap[1]);
    if(!best||sc>best.sc) best={x:+x.toFixed(2),z:+z.toFixed(2),sc}; } return best; })"""


async def standable_near(pg, x, z, r, lv=0):
    """(x,z) 半徑 r 裡、離人最近、站得住的點（出口那一點本身常常在門框裡站不住）"""
    return await pg.evaluate("""((e)=>{ const E=GAME.E, P=E.player.obj.position; let best=null;
      for(let r=0; r<=e.r+1e-6; r+=0.1) for(let a=0; a<360; a+=15){ const x=e.x+r*Math.sin(a*Math.PI/180), z=e.z+r*Math.cos(a*Math.PI/180);
        if(!E.canStand(x,z,0.3,e.lv)) continue; const d=Math.hypot(x-P.x,z-P.z); if(!best||d<best.d) best={x:+x.toFixed(2),z:+z.toFixed(2),d}; }
      return best; })""", {'x': x, 'z': z, 'r': r, 'lv': lv})


async def use_exit(pg, cdp, tag, label0, to, pred=None):
    """走到出口（範圍裡站得住的點）、互動按鈕是它就按；回傳換到的區域狀態"""
    exs = await pg.evaluate(EXITS)
    ex = next((e for e in exs if e['label'].startswith(label0) and (pred is None or pred(e))), None)
    if not R.check('%s 有「%s」' % (tag, label0), bool(ex), J(exs)): return None
    fb0 = (await st(pg))['fb']
    tgt = await standable_near(pg, ex['x'], ex['z'], ex['r'] * 0.6, ex['lv'])   # 範圍的六成以內（PC 11-05：停在 0.25 m 以外＝出了範圍、沒有按鈕）
    R.note('%s 「%s」在 (%s, %s) 半徑 %s；走到範圍裡站得住的 %s' % (tag, label0, ex['x'], ex['z'], ex['r'], J(tgt)))
    if not R.check('%s 「%s」範圍裡有站得住的地方' % (tag, label0), bool(tgt), J(ex)): return None
    s = await st(pg)
    if not s['interact'].startswith(label0) and (s.get('lv') or 0) != ex['lv']:   # 11-13 BB-C：出口在別層（被樓板蓋住點不到）＝照遊戲 E.pathTo 先走到換層那一段
        path = await pg.evaluate("(a=>{ const P=GAME.E.player, p=P.obj.position; const r=GAME.E.pathTo&&GAME.E.pathTo(p.x,p.z,P.lv|0,a.x,a.z,a.lv); return r?r.map(q=>Array.isArray(q)?[+(+q[0]).toFixed(2),+(+q[1]).toFixed(2),q[2]|0]:[+q.x.toFixed(2),+q.z.toFixed(2),q.lv|0]):null; })", {'x': tgt['x'], 'z': tgt['z'], 'lv': ex['lv']})
        wps = [w for i in range(1, len(path or [])) if path[i][2] != path[i - 1][2] for w in (path[max(0, i - 2)], path[min(len(path) - 1, i + 3)])]
        R.note('%s 「%s」在第 %s 層、人在第 %s 層：E.pathTo 換層處 %s' % (tag, label0, ex['lv'], s.get('lv'), J(wps)))
        for j, w in enumerate(wps):
            await L.go_to(pg, cdp, R, w[0], w[1], 0.5, '%s 換層第 %d 點' % (tag, j + 1), max_s=60, lv=w[2]); await pg.wait_for_timeout(400)
        s = await st(pg)
    if not s['interact'].startswith(label0):   # 已經看得到這個按鈕就不用再走（PC 11-05 WINVIEW_rel：0.12 m 走不到、在門口來回 241 秒，遊戲時間 20:30→22:15，店關了）
        await L.go_to(pg, cdp, R, tgt['x'], tgt['z'], 0.3, '%s %s' % (tag, label0), max_s=90, lv=ex['lv'])
        s = await settle(pg)
        if not s['interact'].startswith(label0):
            await L.go_to(pg, cdp, R, ex['x'], ex['z'], 0.5, '%s %s（往出口中心）' % (tag, label0), max_s=60, lv=ex['lv']); s = await settle(pg)
    for _ in range(8):
        if s['interact'].startswith(label0): break
        await pg.wait_for_timeout(500); s = await st(pg)
    if not R.check('%s 走到那裡，互動按鈕是「%s」' % (tag, label0), s['interact'].startswith(label0), J({k: s[k] for k in ('x', 'z', 'lv', 'interact')})): return None
    await L.tap(pg, cdp, '#interact'); s = await wait_zone(pg, cdp, to)
    await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp); s = await st(pg)
    R.check('%s 按下去到了 %s（站得住、沒有被放到目的地）' % (tag, to), s['zone'] == to and s['stand'] and s['fb'] == fb0, J(s))
    return s


async def load_zone(pg, cdp, zone, day_key, h=14.0, x=None, z=None, yaw=None, lv=0, wait=6000):
    d = await pg.evaluate("(k=>{ if(typeof STORY!=='undefined'&&STORY.dayOfKey) return STORY.dayOfKey(k); for(let d=0;d<4000;d++){ try{ if(CALENDAR.dateOf(d).key===k) return d; }catch(e){} } return null; })('%s')" % day_key)   # 舊一點的分支沒有 STORY.dayOfKey（PC 11-05 DORM_WALL_after 4eada314b）
    st0 = {'zone': zone, 'hour': h, 'day': d, 'weather': 'clear'}
    if x is not None: st0['pos'] = {'x': x, 'z': z, 'yaw': yaw if yaw is not None else 0.0, 'lv': lv}
    try: await L.load_state(pg, st0, quiet_events=True, quiet_phone=True)
    except TypeError:   # CC-B 11-07：舊版本（例 9ef8a17cf）的 playlib.load_state 沒有 quiet_phone 參數（LZLM 兩版都例外）；quiet_events=True 本來就會關手機自己打開
        await L.load_state(pg, st0, quiet_events=True)
    await pg.wait_for_timeout(wait); await L.close_panels(pg, cdp)
    return await st(pg)


TAP_HIT = r"""((a)=>{ const E=GAME.E, cam=E.camera, r2=v=>+(+v).toFixed(2); const rc=new THREE.Raycaster(); rc.camera=cam; const W=E.w||innerWidth, H=E.h||innerHeight;
  rc.setFromCamera(new THREE.Vector2(a.x/W*2-1, -(a.y/H)*2+1), cam); const mine=new Set(); E.player.obj.traverse(o=>mine.add(o));
  const hs=rc.intersectObjects(E.scene.children,true).filter(h=>!mine.has(h.object)&&h.object.visible!==false&&h.object.isMesh).slice(0,4)
    .map(h=>({name:h.object.name||(h.object.parent&&h.object.parent.name)||'?', p:[r2(h.point.x),r2(h.point.y),r2(h.point.z)], d:r2(h.distance)}));
  let f=null; try{ const q=E.screenToFloor(a.x,a.y); f=q?(q.isVector3?[r2(q.x),r2(q.y),r2(q.z)]:JSON.parse(JSON.stringify(q,(k,v)=>(v&&v.isVector3)?[r2(v.x),r2(v.y),r2(v.z)]:(v&&v.isObject3D)?(v.name||'obj'):v))):q; }catch(e){ f='ERR '+String(e).slice(0,60); }
  return {screen:[Math.round(a.x),Math.round(a.y)], hits:hs, screenToFloor:f}; })"""


async def sit_all(pg, cdp, tag, shot_prefix, max_walk=300, before_each=None, only=None, on_seated=None, ap_only=False):
    """每一張玩家能坐的位子：走到 GAME.seatApproach（那一層）→ 按 → player.seat、位置 0.15 m 內、高度＝座位 y（沒有＝那一層地板）→ 起身、推得動。回傳 [每張的結果]"""
    seats = await pg.evaluate(SEATS)
    if only: seats = [q for q in seats if any(abs(q['sx'] - a) < 0.06 and abs(q['sz'] - b) < 0.06 for a, b in only)]
    if ap_only: seats = [q for q in seats if q.get('ap')]   # BB-C 11-14 TZ_SEAT：只點有走近點（ap）的座位
    R.note('%s 座位 %d 張：%s' % (tag, len(seats), J(seats))); res = []
    for k, s in enumerate(seats):
        t = '%s #%d（%s, %s%s）' % (tag, k + 1, s['sx'], s['sz'], (' 二樓' if s['slv'] == 1 else '') + ((' 第 %d 排' % s['row']) if s['row'] else ''))
        if before_each: await before_each(k, s)   # 例：時間走太多（快打烊）就讀檔回原來的時間
        occ = await pg.evaluate("(([x,z])=>(GAME.E.npcs||[]).some(n=>n&&n.seat&&Math.hypot(n.seat.x-x,n.seat.z-z)<0.35))", [s['sx'], s['sz']])
        if occ: R.note('%s 有人坐：遊戲不給坐，跳過（不算 FAIL）' % t); res.append([k + 1, 'occupied', s['sx'], s['sz']]); continue
        tgt = s['ap'] or [s['x'], s['z']]; fb0 = (await st(pg))['fb']
        # 照玩家「點椅子」（BB-C 11-05 08:40；遊戲 tapRedirect 走到 seatApproach、tapPref 讓那一張的「坐下」優先＝TAP-SEAT-REACH-1105）：先走到附近看得到椅子，再點椅子本身
        await L.go_to(pg, cdp, R, tgt[0], tgt[1], 1.3, '%s（走到椅子附近）' % t, max_s=max_walk, lv=s['slv']); await settle(pg)
        tapped = None
        await pg.screenshot(path=os.path.join(OUT, '%s_tap%02d_before.png' % (shot_prefix, k + 1)))   # 11-12 LIN_REAL ⑦：點之前的畫面，配合 log 的螢幕座標看點到哪
        for _ in range(4):
            # 11-13 BB-C（L118 r3 #14 投影 None）：椅子在鏡頭後或出畫面＝先轉鏡頭再點，投影記下來
            pj = await pg.evaluate("((a)=>{ const E=GAME.E, cam=E.camera, L=E.zone&&E.zone.levelGroups, fy=(L&&L[a.lv|0])?L[a.lv|0].y:0; const v=new THREE.Vector3(a.x,fy+0.45,a.z).project(cam); return {sx:Math.round((v.x+1)/2*innerWidth), sy:Math.round((1-v.y)/2*innerHeight), front:v.z<1}; })", {'x': s['sx'], 'z': s['sz'], 'lv': s['slv']})
            if not (pj['front'] and 40 < pj['sx'] < (await pg.evaluate('innerWidth')) - 40 and 120 <= pj['sy']):
                R.note('%s 椅子投影 %s 不在可點範圍：先轉鏡頭' % (t, J(pj))); await L.turn_camera_to(pg, cdp, s['sx'], s['sz']); await pg.wait_for_timeout(600)
            tapped = await L.tap_ground(pg, cdp, s['sx'], s['sz'], lv=s['slv'])
            if tapped: break
            await L.turn_camera_to(pg, cdp, s['sx'], s['sz']); await pg.wait_for_timeout(400)
        if tapped:   # BB-C 11-14（WZ_LIN_SEAT_r2）：點擊位置截圖——在點下去的螢幕座標畫一個紅圈再拍
            try:
                await pg.evaluate("(a=>{ const d=document.createElement('div'); d.id='__tapdot'; d.style.cssText='position:fixed;z-index:99999;pointer-events:none;width:22px;height:22px;border:3px solid red;border-radius:50%;left:'+(a.x-11)+'px;top:'+(a.y-11)+'px'; document.body.appendChild(d); })", {'x': tapped['sx'], 'y': tapped['sy']})
                await pg.screenshot(path=os.path.join(OUT, '%s_tap%02d_point.png' % (shot_prefix, k + 1)))
                await pg.evaluate("(()=>{ const d=document.getElementById('__tapdot'); if(d) d.remove(); })()")
            except Exception: pass
        if tapped:   # 11-13 LAWWW2：點擊打到的點和物件名字（cafe2 #13 走到店外、辛亥韓食 #6 停錯張）——點下去當下用同一個螢幕座標打射線＋遊戲的 screenToFloor
            try:
                hit = await pg.evaluate(TAP_HIT, {'x': tapped['sx'], 'y': tapped['sy']})
                R.note('%s 點擊打到 %s' % (t, J(hit))); res_hit = hit
            except Exception as e: res_hit = {'err': repr(e)[:120]}
        b = await settle(pg, ms=800, max_s=15)
        ni = await pg.evaluate(NEAR_IT)
        mine = bool(ni and ni['seat'] and abs(ni['seat'][0] - s['sx']) < 0.01 and abs(ni['seat'][1] - s['sz']) < 0.01)
        R.check('%s 點椅子（螢幕 %s）走過去停在 (%s, %s)（seatApproach %s）：最近的「坐下」是這一張' % (t, tapped and [round(tapped['sx']), round(tapped['sy'])], b['x'], b['z'], J(tgt)), bool(tapped) and mine, J({'at': [b['x'], b['z']], 'nearest': ni}))
        if not mine:   # 診斷：照舊走到 seatApproach 那一點看最近的按鈕
            await L.go_to(pg, cdp, R, tgt[0], tgt[1], 0.22, '%s（seatApproach）' % t, max_s=120, lv=s['slv']); b = await settle(pg)
            ni = await pg.evaluate(NEAR_IT); mine = bool(ni and ni['seat'] and abs(ni['seat'][0] - s['sx']) < 0.01 and abs(ni['seat'][1] - s['sz']) < 0.01)
            R.note('%s 【診斷】走到 seatApproach（離它 %.2f m）最近的是 %s' % (t, math.hypot(b['x'] - tgt[0], b['z'] - tgt[1]), J(ni)))
        if not mine:
            gap = await pg.evaluate("((q)=>{ const E=GAME.E, it=E.interactables.find(i=>i.seat&&Math.abs(i.seat.x-q.sx)<1e-3&&Math.abs(i.seat.z-q.sz)<1e-3); if(!it) return null; let best=null; for(let x=it.x-1.5;x<=it.x+1.5+1e-6;x+=0.05) for(let z=it.z-1.5;z<=it.z+1.5+1e-6;z+=0.05){ if(!E.canStand(x,z,0.3,q.lv)) continue; const d=Math.hypot(x-it.x,z-it.z); if(!best||d<best) best=d; } return {radius:it.radius||0.8, nearestStand:best==null?null:+best.toFixed(2)}; })", {'sx': s['sx'], 'sz': s['sz'], 'lv': s['slv']})
            R.note('%s 這一張按鈕範圍 %s m；站得住的地方離它最近 %s m（走近點在範圍邊上＝停偏一點就沒有按鈕）' % (t, gap and gap['radius'], gap and gap['nearestStand']))
        if not mine:   # 那一點的按鈕是別張：照玩家改走到這一張的按鈕範圍裡（離別張比較遠的地方），看這一張坐不坐得下
            wc = await pg.evaluate(WIN_CELL, {'sx': s['sx'], 'sz': s['sz'], 'lv': s['slv'], 'ap': tgt})
            R.note('%s 改走到這一張按鈕範圍裡、最近的就是它的一點：%s' % (t, J(wc)))
            if wc:
                await L.go_to(pg, cdp, R, wc['x'], wc['z'], 0.08, '%s（這一張的按鈕範圍）' % t, max_s=120, lv=s['slv']); b = await settle(pg)
        for _ in range(6):
            if b['interact'].startswith(s['label']): break
            await pg.wait_for_timeout(500); b = await st(pg)
        if not R.check('%s 走到旁邊，互動按鈕是「%s」' % (t, s['label']), b['interact'].startswith(s['label']), J({k_: b[k_] for k_ in ('x', 'z', 'lv', 'interact', 'stand')})):
            await shot(pg, '%s_nobtn_%d' % (shot_prefix, k + 1), judge_black=False); res.append([k + 1, 'nobtn', s['sx'], s['sz']]); continue
        pre = {'x': b['x'], 'z': b['z'], 'lv': b['lv']}   # BB-C 11-14 TZ_SEAT：坐下前站的位置（起身要站回這附近）
        await L.tap(pg, cdp, '#interact'); ok = False; ordered = []
        for i_ in range(30):
            await pg.wait_for_timeout(500)
            if await pg.evaluate("!!GAME.E.player.seat"): ok = True; break
            c1 = await st(pg)   # 11-12 BB-C 16:37：「坐下吃飯」先開點餐單（燒臘）→ 選第一樣菜，不按「先不吃」
            if c1['choices']:
                kk = next((i for i, x in enumerate(c1['choices']) if not any(w in x for w in ('先不吃', '不用了', '算了', '離開', '不點'))), 0)
                ordered.append(c1['choices'][kk]); await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (kk + 1)); await pg.wait_for_timeout(900); continue
            if c1['dlg'] and i_ < 8: await L.tap(pg, cdp, '#dlg'); continue
            if i_ == 8:   # 4 秒還沒坐下：先收掉對話（剛開店的招呼、旁白），按鈕還是這一張就再按一次
                for _ in range(8):
                    c0 = await st(pg)
                    if not c0['dlg']: break
                    await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400)
                c0 = await st(pg)
                if not c0['seat'] and c0['interact'].startswith(s['label']): R.note('%s 按了 4 秒沒坐下（%s），再按一次' % (t, J(c0))); await L.tap(pg, cdp, '#interact')
        await pg.wait_for_timeout(1500)
        p = await pg.evaluate("(()=>{ const P=GAME.E.player, o=P.obj.position, s=P.seat; return {x:+o.x.toFixed(3),z:+o.z.toFixed(3),y:+o.y.toFixed(3),lv:P.lv|0, sx:s?+s.x.toFixed(3):null, sz:s?+s.z.toFixed(3):null, sy:s&&s.y!=null?+(+s.y).toFixed(3):null}; })()")
        if ordered: R.note('%s 坐下前的選單選了：%s' % (t, J(ordered)))
        R.check('%s 坐下了（player.seat）' % t, ok, J(p))
        if ok:
            d = math.hypot(p['x'] - s['sx'], p['z'] - s['sz'])
            fy = s['sy'] if s['sy'] is not None else await pg.evaluate("((lv)=>{ const z=GAME.E.zone, L=z&&z.levelGroups; return L&&L[lv]?L[lv].y:0; })", s['slv'])
            fy = round(fy + (s.get('lift') or 0), 3)   # 高腳椅、凳子（seat.lift：好拍 0.25、大口 0.325）
            R.check('%s 坐下的位置離座位 %.3f m（≤0.15）、人的高度 %.3f＝座位那一層＋lift %.3f（±0.06）' % (t, d, p['y'], fy), d <= 0.15 and abs(p['y'] - fy) <= 0.06, J(p))
            await shot(pg, '%s_seat_%d' % (shot_prefix, k + 1))
            if on_seated: await on_seated(k, s, t)   # CC-C 11-12：坐下以後做的事（例：點餐吃完，cc_seat_hours_probe EAT=1）；沒給＝照舊直接起身
        # 起身：坐下以後可能先有對話（大步試穿椅：店員「你幾號？」→ 旁白 → 才出「坐一下，看看四周／起身」；PC 11-05 XSSHOP_dabu 只看一次選項＝TEST_BUG）
        said = []; t1 = time.time()
        while time.time() - t1 < 25:
            c = await st(pg)
            if not c['seat'] and not c['busy']: break
            if c['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
            if c['choices']:
                kk = next((i for i, x in enumerate(c['choices']) if x.startswith('起身') or x.startswith('站起')), len(c['choices']) - 1)
                said.append(c['choices'][kk]); await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (kk + 1)); await pg.wait_for_timeout(1200); continue
            if c['interact'].startswith('起身') or c['interact'].startswith('站起'): said.append(c['interact']); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200); continue
            await pg.wait_for_timeout(500)
        if said: R.note('%s 起身點了：%s' % (t, J(said)))
        c = await st(pg); await shot(pg, '%s_stand_%d' % (shot_prefix, k + 1), judge_black=False)
        sd = round(math.hypot(c['x'] - pre['x'], c['z'] - pre['z']), 2)
        # BB-C 11-14 定：fallback 沒變、站得住、沒換層＝PASS，距離只記；fallback 有變或距離 >3 m 才看圖（FAIL 交 BB）
        R.check('%s 起身：fallback %s→%s、站得住 %s、沒換層、離坐下前 %.2f m（只記；>3 m 才算）' % (t, fb0, c['fb'], c['stand'], sd), c['fb'] == fb0 and bool(c['stand']) and c['lv'] == pre['lv'] and sd <= 3.0, J({'pre': pre, 'after': [c['x'], c['z'], c['lv']], 'fb': [fb0, c['fb']]}))
        mv = await pushable(pg, cdp); c = await st(pg)
        R.check('%s 起身：不是坐著、站得住、推得動 ≥0.3 m、沒有被放到目的地' % t, not c['seat'] and c['stand'] and mv >= 0.3 and c['fb'] == fb0, J({'moved': mv, 'x': c['x'], 'z': c['z'], 'lv': c['lv'], 'stand': c['stand'], 'fb': c['fb'] - fb0}))
        res.append([k + 1, 'ok' if ok else 'nosit', s['sx'], s['sz']])
    return res


SAMPLES = []


async def _sampler(pg, stop):
    while not stop.is_set():
        try: SAMPLES.append(await st(pg))
        except Exception: pass
        await asyncio.sleep(0.3)


async def walk_logged(pg, cdp, tx, tz, near, label, max_s=180, lv=None):
    SAMPLES.clear(); ev = asyncio.Event(); task = asyncio.create_task(_sampler(pg, ev))
    try: ok = await L.go_to(pg, cdp, R, tx, tz, near, label, max_s=max_s, lv=lv)
    finally:
        ev.set(); await task
    return ok, list(SAMPLES)


async def closed_door(pg, cdp, tag, street, door_to, door_label, place_id, x, z, h, day_key):
    """營業時間外：讀檔街上 h 點、走到店門按 → 不換區域、toast＝PLACES.closedText"""
    R.setup('%s 讀檔 %s %s %05.2f（營業時間外）、店門旁邊 (%s, %s)' % (tag, street, day_key, h, x, z))
    await load_zone(pg, cdp, street, day_key, h, x, z, 0.0)
    door = await pg.evaluate("((to)=>{ const i=GAME.E.interactables.find(i=>i.exit&&i.exit.to===to); return i?{label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2)}:null; })", door_to)
    if not R.check('%s 店門還在（「%s」）' % (tag, door_label), bool(door) and door['label'].startswith(door_label), J(door)): return
    exp = await pg.evaluate("((p)=>PLACES.closedText(p,GAME.G.hour,GAME.G.day))", place_id)
    await L.go_to(pg, cdp, R, door['x'], door['z'], 0.4, '%s 店門' % tag, max_s=120)
    await pg.wait_for_timeout(600); s = await st(pg)
    if not R.check('%s 走到店門，互動按鈕是「%s」' % (tag, door_label), s['interact'].startswith(door_label), J(s)): return
    await pg.evaluate("(()=>{ window.__ccToast=[]; const t=document.getElementById('toast'); if(t){ new MutationObserver(()=>{ const x=(t.innerText||'').trim(); if(x) window.__ccToast.push(x); }).observe(t,{childList:true,subtree:true,characterData:true,attributes:true}); } })()")
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
    s = await st(pg); toasts = await pg.evaluate("window.__ccToast||[]")
    R.note('%s 按下去：%s；toast %s；PLACES.closedText＝%s' % (tag, J({k: s[k] for k in ('zone', 'hour')}), J(toasts), J(exp)))
    R.check('%s %05.2f 按店門：沒有進去（還在 %s）' % (tag, h, street), s['zone'] == street, J(s))
    R.check('%s 跳出「%s」（PLACES.closedText）' % (tag, exp), bool(exp) and any(exp in t or t in exp for t in toasts), J(toasts))
    await shot(pg, '%s_closed' % place_id)


async def user_shot(pg, cdp, name, cam, hide_player=True):
    """給使用者看（不判，只算黑畫面）：1280×720、藏 HUD（和玩家）、照 cam 的 eye／look／lens"""
    await pg.set_viewport_size({'width': 1280, 'height': 720}); await pg.wait_for_timeout(800)
    if hide_player: await pg.evaluate("(()=>{ GAME.E.player.obj.visible=false; })()")
    await pg.evaluate(HUD + '(false)'); c = await pg.evaluate(CAM, cam); await pg.wait_for_timeout(600); await pg.evaluate("GAME.E.render()")
    m = await shot(pg, name)
    await pg.evaluate(UNCAM); await pg.evaluate(HUD + '(true)'); await pg.evaluate("(()=>{ GAME.E.player.obj.visible=true; })()")
    R.note('[截圖] %s：鏡頭 %s、亮度 %s' % (name, J(c), J(m)))
    return c
